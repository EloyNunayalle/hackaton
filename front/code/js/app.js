document.addEventListener('DOMContentLoaded', function() {
    const grammarTextarea = document.getElementById('grammar');
    const inputTextarea = document.getElementById('input');
    const outputDiv = document.getElementById('output');
    const analyzeBtn = document.getElementById('analyze-btn');
    const example1Btn = document.getElementById('example1-btn');
    const example2Btn = document.getElementById('example2-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Ejemplo 1 default: Gramática simple de expresiones aritméticas
    const example1Grammar = `P → SL
SL → S SL'
SL' → ; S SL'
SL' → ε
S → id = E
S → print ( E )
E → T E'
E' → + T E'
E' → - T E'
E' → ε
T → F T'
T' → * F T'
T' → ε
F → id
F → num
F → ( E )`;

    // Ejemplo 2 default: Gramática para funciones
    const example2Grammar = `F → fun id ( P ) { B }
P → id P'
P → ε 
P' → , id P'
P' → ε 
B → S B
B → ε 
S → return E ;
E → id`;

    // Manejador para el botón Analizar
    analyzeBtn.addEventListener('click', function() {
        const grammarText = grammarTextarea.value;
        const input = inputTextarea.value;
        
        if (!grammarText.trim() || !input.trim()) {
            showError("Por favor ingrese una gramática y una cadena de entrada");
            return;
        }
        
        try {
            // Cargar gramática
            const grammar = loadGrammar(grammarText);
            
            if (grammar.orderedProductions.length === 0) {
                showError("Gramática no válida o vacía");
                return;
            }
            
            // Tokenizar entrada
            const tokens = tokenize(input, grammar);
            if (tokens.length === 0) {
                showError("Expresión contiene errores en los tokens");
                return;
            }
            
            //  análisis sintáctico con traza
            const trace = parseWithTrace([...tokens], grammar);
            
            displayResults(grammar, trace);
            
        } catch (error) {
            showError(`Error: ${error.message}`);
        }
    });

    // Manejador para el botón Ejemplo 1
    example1Btn.addEventListener('click', function() {
        grammarTextarea.value = example1Grammar;
        inputTextarea.value = "id = num + num ; print ( id + num )";
    });

    // Manejador para el botón Ejemplo 2
    example2Btn.addEventListener('click', function() {
        grammarTextarea.value = example2Grammar;
        inputTextarea.value = "fun id ( id , id ) { return id ; }";
    });

    // Manejador para el botón Limpiar
    clearBtn.addEventListener('click', function() {
        grammarTextarea.value = "";
        inputTextarea.value = "";
        clearResults();
    });

    // Función para mostrar resultados
    function displayResults(grammar, trace) {
        outputDiv.innerHTML = '';
        // 1. Mostrar FIRST y FOLLOW
        outputDiv.innerHTML += generateFirstFollowTable(grammar);
        // 2. Mostrar tabla LL(1)
        outputDiv.innerHTML += generateLL1Table(grammar);
        // 3. Mostrar tabla de derivación
        outputDiv.innerHTML += `
            <div class="section">
                <h3>Tabla de Derivación (PILA - ENTRADA - ACCIÓN)</h3>
                <div class="table-container">
                    ${formatDerivationTable(trace)}
                </div>
            </div>
        `;
    }

    // Función para generar tabla FIRST/FOLLOW
    function generateFirstFollowTable(grammar) {
        const first = computeFirst(grammar);
        const follow = computeFollow(grammar, first);
        
        let html = '<div class="section"><h3>Conjuntos FIRST y FOLLOW</h3>';
        html += '<div class="table-container"><table class="first-follow-table">';
        html += '<thead><tr><th>No Terminal</th><th>FIRST</th><th>FOLLOW</th></tr></thead><tbody>';
        
        for (const nt of grammar.nonTerminals) {
            html += `
                <tr>
                    <td>${nt}</td>
                    <td>{ ${Array.from(first.get(nt)).join(', ')} }</td>
                    <td>{ ${Array.from(follow.get(nt)).join(', ')} }</td>
                </tr>
            `;
        }
        
        html += '</tbody></table></div></div>';
        return html;
    }

    function generateLL1Table(grammar) {
        const first = computeFirst(grammar);
        const follow = computeFollow(grammar, first);
        const table = new Map();
        const terminals = Array.from(grammar.terminals).sort();
        
        for (const nt of grammar.nonTerminals) {
            table.set(nt, new Map());
            for (const term of terminals) {
                table.get(nt).set(term, '');
            }
        }
    
        for (const prodPair of grammar.orderedProductions) {
            const nt = prodPair.nonTerminal;
            const prods = prodPair.productions;
    
            for (const prod of prods) {
                let firstSet = new Set();
                let epsilonFound = false;
    
                if (prod[0] === "ε" || prod[0] === "epsilon") {
                    firstSet.add("ε");
                } else {
                    for (const symbol of prod) {
                        const symbolFirst = first.get(symbol);
                        for (const item of symbolFirst) {
                            if (item !== "ε") {
                                firstSet.add(item);
                            }
                        }
    
                        if (!symbolFirst.has("ε")) {
                            epsilonFound = false;
                            break;
                        }
                    }
                }
    
                for (const term of firstSet) {
                    if (term !== "ε") {
                        if (!table.get(nt).get(term)) { 
                            table.get(nt).set(term, `${nt} → ${prod.join(' ')}`);
                        }
                    }
                }
    
                if (firstSet.has("ε")) {
                    for (const followTerm of follow.get(nt)) {
                        if (!table.get(nt).get(followTerm)) {
                            table.get(nt).set(followTerm, `${nt} → ${prod.join(' ')}`);
                        }
                    }
                }
            }
        }
    
        for (const nt of grammar.nonTerminals) {
            for (const term of terminals) {
                const action = table.get(nt).get(term);
                if (action === '') {
                    if (follow.get(nt).has(term)) {
                        table.get(nt).set(term, 'extract');
                    } else {
                        table.get(nt).set(term, 'explore');
                    }
                }
            }
        }
    
        for (const nt of grammar.nonTerminals) {
            const action = table.get(nt).get('$');
            if (!action) {
                table.get(nt).set('$', 'explore');
            }
        }
    
        let html = '<div class="section"><h3>Tabla LL(1)</h3>';
        html += '<div class="table-container"><table class="ll1-table"><thead><tr><th>No Terminal</th>';
        terminals.forEach(term => {
            html += `<th>${term}</th>`;
        });
        html += '</tr></thead><tbody>';
    
        for (const nt of grammar.nonTerminals) {
            html += `<tr><td>${nt}</td>`;
            terminals.forEach(term => {
                const production = table.get(nt).get(term);
                let cellClass = '';
                if (production === 'explore') {
                    cellClass = 'class="explore"';
                } else if (production === 'extract') {
                    cellClass = 'class="extract"';
                }
                else {
                    cellClass = 'class="rule"';
                }
                html += `<td ${cellClass}>${production || '-'}</td>`;
            });
            html += '</tr>';
        }
    
        html += '</tbody></table></div></div>';
        return html;
    }    

    // Función para formatear tabla de derivación
    function formatDerivationTable(trace) {
        let html = '<table class="derivation-table"><thead><tr><th>PILA</th><th>ENTRADA</th><th>ACCIÓN</th></tr></thead><tbody>';
        
        for (const step of trace) {
            const stack = step.stack.join(' ');
            const input = step.input.join(' ');
            const action = step.rule;
            
            html += `
                <tr>
                    <td>${stack}</td>
                    <td>${input}</td>
                    <td>${action}</td>
                </tr>
            `;
        }
        
        html += '</tbody></table>';
        return html;
    }

    // Función para mostrar errores
    function showError(message) {
        outputDiv.innerHTML = `<div class="error">${message}</div>`;
    }

    // Función para limpiar resultados
    function clearResults() {
        outputDiv.innerHTML = '<div class="info">El resultado del análisis se mostrará aquí...</div>';
    }
});