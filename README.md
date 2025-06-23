# Analizador Sintáctico LL(1) Parser

## Integrantes
- Ronal Jesus Condor Blas - Ciencias de la Computación
- Alexis Raza Estrada - Ciencias de la Computación
- Joaquín Salinas Salas - Ciencias de la Computación

## Descripción

Herramienta para analizar gramáticas y validar cadenas utilizando el método LL(1). Este proyecto implementa un analizador sintáctico LL(1) completo, desarrollado como proyecto final para el curso de Compiladores impartido por el profesor Julio Eduardo Yarasca Moscol en la Universidad de Ingeniería y Tecnología (UTEC).

## Guía de Uso

### 1. Ingreso de la Gramática

En la sección "Gramática", ingrese las reglas de producción utilizando la siguiente notación:
- Use `→` o `->` para separar el lado izquierdo del derecho
- Use `ε` o la palabra `epsilon` para representar la cadena vacía
- Cada regla debe estar en una línea separada

Ejemplo de gramática (como se muestra en la interfaz):
```
P → SL
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
```

### 2. Ingreso de la Cadena de Entrada

En la sección "Cadena de Entrada", ingrese la cadena que desea analizar según la gramática definida.

Ejemplo:
```
id = num + num ; print ( id + num )
```

### 3. Cálculo de Conjuntos FIRST y FOLLOW

El sistema calcula automáticamente los conjuntos FIRST y FOLLOW para cada símbolo no terminal:

#### Conjuntos FIRST
Los conjuntos FIRST indican qué símbolos terminales pueden aparecer al inicio de una derivación:

- **FIRST(P)** = { id, print }
- **FIRST(SL)** = { id, print }
- **FIRST(SL')** = { ;, ε }
- **FIRST(S)** = { id, print }
- **FIRST(E)** = { id, num, ( }
- **FIRST(E')** = { +, -, ε }
- **FIRST(T)** = { id, num, ( }

#### Conjuntos FOLLOW
Los conjuntos FOLLOW indican qué símbolos terminales pueden aparecer después de un no terminal:

- **FOLLOW(P)** = { $ }
- **FOLLOW(SL)** = { $ }
- **FOLLOW(SL')** = { $ }
- **FOLLOW(S)** = { ;, $ }
- **FOLLOW(E)** = { ;, $, ), + }
- **FOLLOW(E')** = { ;, $, ) }
- **FOLLOW(T)** = { +, -, ;, $, ) }

### 4. Tabla LL(1)

La tabla LL(1) es una matriz donde:
- Las filas son los símbolos no terminales
- Las columnas son los símbolos terminales
- Cada celda contiene la regla a aplicar

Para construir la tabla, el sistema utiliza los siguientes criterios:
1. Para cada producción A → α:
   - Si a ∈ FIRST(α), entonces la producción se coloca en M[A, a]
   - Si ε ∈ FIRST(α) y b ∈ FOLLOW(A), entonces la producción se coloca en M[A, b]

### 5. Tabla de Derivación

La tabla de derivación muestra paso a paso cómo el analizador procesa la entrada:

| Pila | Entrada Restante | Acción |
|------|------------------|--------|
| $P   | id = num + num ; print ( id + num )$ | Derivar P → SL |
| $SL  | id = num + num ; print ( id + num )$ | Derivar SL → S SL' |
| $SL' S | id = num + num ; print ( id + num )$ | Derivar S → id = E |
| $SL' E = id | num + num ; print ( id + num )$ | Emparejar id |
| ... | ... | ... |

El análisis continúa hasta que:
- La pila y la entrada se vacían, lo que indica que la cadena es aceptada
- Ocurre un error de sintaxis cuando no hay producción aplicable

## Conceptos Fundamentales

### Símbolos Especiales en la Gramática
- **→ (Flecha)**: Separa el lado izquierdo del lado derecho en una producción
- **ε (Epsilon)**: Representa la cadena vacía
- **$ (Dólar)**: Marca el fin de la entrada y de la pila
- **; (Punto y coma)**: En este ejemplo específico, se usa como separador de sentencias

### Terminales y No Terminales
- **Terminales**: Símbolos que aparecen en la cadena de entrada (id, num, +, -, =, ;, etc.)
- **No Terminales**: Símbolos que pueden derivarse en otros (P, SL, SL', S, E, E', T, etc.)

### Análisis LL(1)
El nombre "LL(1)" significa:
- **Primera L**: Lectura de la entrada de izquierda a derecha
- **Segunda L**: Derivación por la izquierda
- **(1)**: Utiliza 1 símbolo de anticipación

## Algoritmos Implementados

### Cálculo de FIRST
```
Para cada terminal a:
    FIRST(a) = {a}
    
Para cada no terminal A:
    Si A → ε es una producción, añadir ε a FIRST(A)
    Si A → a... es una producción (a es terminal), añadir a a FIRST(A)
    Si A → B... es una producción (B es no terminal):
        Añadir FIRST(B) - {ε} a FIRST(A)
        Si ε ∈ FIRST(B), continuar con el siguiente símbolo
```

### Cálculo de FOLLOW
```
Para el símbolo inicial S:
    Añadir $ a FOLLOW(S)
    
Para cada producción A → αBβ:
    Añadir FIRST(β) - {ε} a FOLLOW(B)
    Si ε ∈ FIRST(β) o β es vacío:
        Añadir FOLLOW(A) a FOLLOW(B)
```

### Construcción de la Tabla LL(1)
```
Para cada producción A → α:
    Para cada terminal a en FIRST(α):
        M[A, a] = A → α
    Si ε está en FIRST(α):
        Para cada terminal b en FOLLOW(A):
            M[A, b] = A → α
```

### Análisis Sintáctico
```
Inicializar pila con $ seguido del símbolo inicial
Inicializar puntero a la entrada
Mientras la pila no esté vacía:
    X = símbolo en el tope de la pila
    a = símbolo actual de entrada
    Si X es terminal o $:
        Si X = a:
            Desapilar X y avanzar el puntero
        Sino:
            Error
    Sino si M[X, a] = X → Y1Y2...Yk:
        Desapilar X
        Apilar Yk, Yk-1, ..., Y1 (en ese orden)
    Sino:
        Error
```

## Notas Importantes para el Usuario

1. **Gramática LL(1)**: La herramienta solo funciona correctamente con gramáticas LL(1). Una gramática es LL(1) si no hay conflictos en la tabla (más de una regla en la misma celda).

2. **Recursión Izquierda**: Las gramáticas con recursión izquierda directa (A → A...) no son LL(1) y provocarán errores. Es necesario eliminar la recursión izquierda antes.

3. **Notación**:
   - La herramienta acepta tanto `→` como `->` para las producciones
   - Para epsilon puede usar `ε` o la palabra `epsilon`
   - Los símbolos como +, -, *, (, ), etc. se reconocen automáticamente como terminales

4. **Ejemplos Predefinidos**: La interfaz proporciona ejemplos predefinidos para ayudar a entender el funcionamiento.

5. **Visualización**: El sistema muestra:
   - Los conjuntos FIRST y FOLLOW calculados
   - La tabla LL(1) generada
   - La tabla de derivación paso a paso
   - El resultado final (aceptación o error)

## Ejemplo de Uso

1. Ingrese la gramática (puede usar los ejemplos predefinidos)
2. Ingrese la cadena a analizar
3. Presione "Analizar"
4. Observe los conjuntos FIRST/FOLLOW, la tabla LL(1), y la derivación

## Referencias

- Compiladores: Principios, Técnicas y Herramientas (Libro del Dragón) - Aho, Lam, Sethi, Ullman
- Material del curso de Compiladores - UTEC

---

Desarrollado como proyecto final para el curso de Compiladores
Universidad de Ingeniería y Tecnología (UTEC), 2025
