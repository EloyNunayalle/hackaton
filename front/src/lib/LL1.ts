// /lib/LL1.ts
// Este archivo importa y adapta el código de LL1.js para usarlo con TypeScript

// Tipado para las estructuras de datos
export interface Production {
  nonTerminal: string;
  productions: string[][];
}

export class Grammar {
  orderedProductions: Production[] = [];
  nonTerminals: Set<string> = new Set();
  terminals: Set<string> = new Set();
  startSymbol: string = '';
}

export interface DerivationStep {
  stack: string[];
  input: string[];
  rule: string;
}

// Variables para rastrear si el script se ha cargado
let scriptLoaded = false;
let scriptError = false;
let loadCallbacks: (() => void)[] = [];

// Función para ejecutar código cuando el script esté listo
function onScriptLoaded(callback: () => void) {
  if (scriptLoaded) {
    callback();
  } else if (!scriptError) {
    loadCallbacks.push(callback);
  }
}

// Exportación de las funciones que vamos a usar en el componente
export const Stack = function() { 
  // Implementación de fallback básica
  return {
    push: () => {},
    pop: () => {},
    empty: () => true,
    top: () => null,
    toArray: () => []
  };
};

export function loadGrammar(grammarText: string): Grammar {
  // Verificamos si el script está cargado
  if (typeof window !== 'undefined' && (window as any).loadGrammar) {
    try {
      return (window as any).loadGrammar(grammarText);
    } catch (error) {
      console.error("Error al cargar la gramática:", error);
      throw error;
    }
  }
  console.warn("La función loadGrammar no está disponible");
  return new Grammar();
}

export function parseWithTrace(tokens: string[], grammar: Grammar): DerivationStep[] {
  if (typeof window !== 'undefined' && (window as any).parseWithTrace) {
    return (window as any).parseWithTrace(tokens, grammar);
  }
  console.warn("La función parseWithTrace no está disponible");
  return [];
}

export function computeFirst(grammar: Grammar): Map<string, Set<string>> {
  if (typeof window !== 'undefined' && (window as any).computeFirst) {
    return (window as any).computeFirst(grammar);
  }
  console.warn("La función computeFirst no está disponible");
  return new Map();
}

export function computeFollow(grammar: Grammar, first: Map<string, Set<string>>): Map<string, Set<string>> {
  if (typeof window !== 'undefined' && (window as any).computeFollow) {
    return (window as any).computeFollow(grammar, first);
  }
  console.warn("La función computeFollow no está disponible");
  return new Map();
}

export function buildLL1Table(grammar: Grammar): Map<string, Map<string, string>> {
  if (typeof window !== 'undefined' && (window as any).buildLL1Table) {
    return (window as any).buildLL1Table(grammar);
  }
  console.warn("La función buildLL1Table no está disponible");
  return new Map();
}

export function analyze(grammarText: string, input: string): string {
  if (typeof window !== 'undefined' && (window as any).analyze) {
    return (window as any).analyze(grammarText, input);
  }
  console.warn("La función analyze no está disponible");
  return "";
}

export function tokenize(input: string, grammar: Grammar): string[] {
  if (typeof window !== 'undefined' && (window as any).tokenize) {
    return (window as any).tokenize(input, grammar);
  }
  console.warn("La función tokenize no está disponible");
  return [];
}

// Cuando se cargue la página en el navegador, importaremos el script LL1.js 
if (typeof window !== 'undefined') {
  console.log("Intentando cargar LL1.js...");
  
  // Comprobar si el script ya está cargado
  if ((window as any).loadGrammar) {
    console.log("LL1.js ya está disponible");
    scriptLoaded = true;
  } else {
    // Cargar el script desde la ubicación correcta
    const scriptPath = '/script/LL1.js'; // Corregido según tu ubicación
    const script = document.createElement('script');
    script.src = scriptPath;
    script.async = true;
    
    script.onload = () => {
      console.log(`LL1.js se ha cargado correctamente desde ${scriptPath}`);
      scriptLoaded = true;
      // Ejecutar callbacks pendientes
      loadCallbacks.forEach(callback => callback());
      loadCallbacks = [];
    };
    
    script.onerror = () => {
      console.error(`Error cargando LL1.js desde ${scriptPath}`);
      console.log("Verificando si el archivo existe en otra ubicación...");
      // Mostrar todas las URL de scripts cargados para depurar
      const scripts = document.querySelectorAll('script');
      console.log('Scripts cargados en la página:');
      scripts.forEach(s => console.log(s.src));
      
      scriptError = true;
      loadCallbacks = [];
    };
    
    document.head.appendChild(script);
  }
}

export default {
  onScriptLoaded,
  loadGrammar,
  parseWithTrace,
  computeFirst,
  computeFollow,
  buildLL1Table,
  analyze,
  tokenize
};