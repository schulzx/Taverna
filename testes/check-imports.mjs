/* Dois checks contra a MESMA classe de bug (MAX_COMPANHEIROS, setSugestoes,
   gerarLivro): um nome que o código chama e que não existe no escopo dali.

   [1] exportado por outro módulo e usado aqui sem importar
   [2] chamado aqui e definido em lugar NENHUM alcançável
       — era este que faltava: gerarLivro não era exportado por ninguém,
         então o passo 1 não tinha como enxergá-lo.

   Regra de ouro: analisar só CÓDIGO. Este projeto é quase metade prosa em
   português dentro de template literals; sem tirar strings e comentários
   antes, o check vira ruído e ninguém olha mais para ele. */
import { readdirSync, readFileSync } from "fs";
const dir = process.argv[2] || "../src";
const arqs = readdirSync(dir).filter((f) => /\.(js|jsx)$/.test(f));

/* Uma barra inicia regex (e não divisão) quando o último token de código
   pede um operando. Heurística curta e suficiente aqui — sem isso, o \b(
   de dentro de um regex vira "chamada b()". */
function ehInicioDeRegex(anterior) {
  const t = anterior.replace(/\s+$/, "");
  if (!t) return true;
  if ("([{,;:=!&|?+-*%~^<>".includes(t[t.length - 1])) return true;
  return /\b(return|typeof|case|in|of|new|delete|void|do|else)$/.test(t);
}

/* Varredura caractere a caractere: regex não dá conta de template aninhado. */
function soCodigo(src) {
  let out = "", i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === "/" && d === "/") { while (i < n && src[i] !== "\n") i++; continue; }
    if (c === "/" && d === "*") { i += 2; while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; continue; }
    if (c === "/" && ehInicioDeRegex(out)) {
      i++; let classe = false;
      while (i < n) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === "[") classe = true;
        else if (src[i] === "]") classe = false;
        else if (src[i] === "/" && !classe) { i++; break; }
        else if (src[i] === "\n") break;
        i++;
      }
      while (i < n && /[gimsuyd]/.test(src[i])) i++;
      out += " /rx/ "; continue;
    }
    if (c === '"' || c === "'") {
      const q = c; i++;
      while (i < n && src[i] !== q) { if (src[i] === "\\") i++; i++; }
      i++; out += '""'; continue;
    }
    if (c === "`") {
      /* templates aninham: `a ${cond ? `b ${x}` : ""} c`. Sem pilha, o texto
         do template interno vazava como se fosse código — e prosa em
         português virava "chamada de função". */
      const pilha = ["tpl"];
      i++;
      while (i < n && pilha.length) {
        const topo = pilha[pilha.length - 1];
        const ch = src[i];
        if (ch === "\\") { i += 2; continue; }
        if (topo === "tpl") {
          if (ch === "`") { pilha.pop(); i++; continue; }
          if (ch === "$" && src[i + 1] === "{") { pilha.push("expr"); i += 2; out += " ( "; continue; }
          i++; continue;                                   // texto do template: fora
        }
        /* dentro de ${...}: é CÓDIGO */
        if (ch === "}") { pilha.pop(); i++; out += " ) "; continue; }
        if (ch === "{") { pilha.push("expr"); i++; out += " "; continue; }
        if (ch === "`") { pilha.push("tpl"); i++; continue; }
        if (ch === '"' || ch === "'") { const q = ch; i++; while (i < n && src[i] !== q) { if (src[i] === "\\") i++; i++; } i++; out += '""'; continue; }
        out += ch; i++;
      }
      continue;
    }
    out += c; i++;
  }
  return out;
}

const fonte = new Map(arqs.map((f) => [f, soCodigo(readFileSync(dir + "/" + f, "utf8"))]));

const exportados = new Map();
for (const [f, s] of fonte) {
  for (const m of s.matchAll(/export\s+(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)/g)) exportados.set(m[1], f);
  for (const m of s.matchAll(/export\s*\{([^}]+)\}/g)) {
    m[1].split(",").forEach((x) => { const n = x.trim().split(/\s+as\s+/).pop().trim(); if (n) exportados.set(n, f); });
  }
}

const importadosDe = (s) => {
  const set = new Set();
  for (const m of s.matchAll(/import\s*\{([^}]+)\}\s*from/g)) m[1].split(",").forEach((x) => set.add(x.trim().split(/\s+as\s+/).pop().trim()));
  for (const m of s.matchAll(/import\s+([A-Za-z_$][\w$]*)\s*(?:,|from)/g)) set.add(m[1]);
  for (const m of s.matchAll(/import\s*\*\s*as\s+([A-Za-z_$][\w$]*)/g)) set.add(m[1]);
  return set;
};

/* declarações, parâmetros e desestruturação — grosso de propósito: melhor
   deixar passar do que gritar sem motivo */
const locaisDe = (s) => {
  const set = new Set();
  for (const m of s.matchAll(/(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) set.add(m[1]);
  for (const m of s.matchAll(/(?:const|let|var)\s*\{([^}]*)\}\s*=/g)) m[1].split(",").forEach((x) => { const n = x.split(":").pop().split("=")[0].trim(); if (/^[A-Za-z_$][\w$]*$/.test(n)) set.add(n); });
  for (const m of s.matchAll(/(?:const|let|var)\s*\[([^\]]*)\]\s*=/g)) m[1].split(",").forEach((x) => { const n = x.split("=")[0].trim(); if (/^[A-Za-z_$][\w$]*$/.test(n)) set.add(n); });
  for (const m of s.matchAll(/\(([^()]*)\)\s*=>/g)) m[1].split(",").forEach((x) => { const n = x.split("=")[0].replace(/[{}[\].]/g, "").trim(); if (/^[A-Za-z_$][\w$]*$/.test(n)) set.add(n); });
  for (const m of s.matchAll(/function\s*[A-Za-z_$\w]*\s*\(([^()]*)\)/g)) m[1].split(",").forEach((x) => { const n = x.split("=")[0].replace(/[{}[\].]/g, "").trim(); if (/^[A-Za-z_$][\w$]*$/.test(n)) set.add(n); });
  for (const m of s.matchAll(/catch\s*\(\s*([A-Za-z_$][\w$]*)/g)) set.add(m[1]);
  /* parâmetro desestruturado: function f({ a, b = 1, c: d }) — muito comum
     aqui, e sem isto o check acusa `b` como "chamada de função inexistente" */
  for (const m of s.matchAll(/\(\s*\{([\s\S]*?)\}\s*(?:=\s*\{[^{}]*\})?\s*\)/g)) {
    m[1].split(",").forEach((x) => { const n = x.split(":").pop().split("=")[0].trim(); if (/^[A-Za-z_$][\w$]*$/.test(n)) set.add(n); });
  }
  for (const m of s.matchAll(/([A-Za-z_$][\w$]*)\s*=>/g)) set.add(m[1]);
  return set;
};

const GLOBAIS = new Set([
  "console", "window", "document", "localStorage", "sessionStorage", "navigator", "location", "history",
  "setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame", "cancelAnimationFrame",
  "fetch", "Response", "Request", "Headers", "AbortController", "URL", "URLSearchParams", "Blob", "File", "FileReader",
  "JSON", "Math", "Date", "Object", "Array", "String", "Number", "Boolean", "Promise", "Set", "Map", "WeakMap", "WeakSet",
  "Error", "TypeError", "RangeError", "RegExp", "Symbol", "BigInt", "Proxy", "Reflect", "Intl",
  "parseInt", "parseFloat", "isNaN", "isFinite", "encodeURIComponent", "decodeURIComponent", "encodeURI", "decodeURI",
  "structuredClone", "queueMicrotask", "atob", "btoa", "crypto", "performance", "alert", "confirm", "prompt",
  "React", "useState", "useEffect", "useRef", "useCallback", "useMemo", "useLayoutEffect", "useReducer", "useContext",
  "Audio", "Image", "Event", "MouseEvent", "CustomEvent", "IntersectionObserver", "ResizeObserver", "MutationObserver",
  "speechSynthesis", "SpeechSynthesisUtterance", "AudioContext", "webkitAudioContext", "TextEncoder", "TextDecoder",
  "globalThis", "process", "require",
  /* métodos de classe React: são definições, não chamadas a algo externo */
  "constructor", "render", "componentDidCatch", "getDerivedStateFromError", "componentDidMount", "componentWillUnmount", "setState",
]);

/* Sobras de texto de JSX que passam pelo filtro do parêntese colado — prosa do
   tipo "a cidade(livre)" sem espaço. Ficam listadas de propósito: a linha de
   base é ZERO, então qualquer nome novo que aparecer é sinal de verdade. */
const RUIDO_CONHECIDO = new Set(["ele", "dominada", "templo", "lugar", "cidade", "santa", "d20"]);
/* `async` faltava, e a falta era do CHECADOR e não do código: `const f = async (x) => …`
   é sintaxe, e qualquer arquivo com uma arrow assíncrona virava suspeita. */
const PALAVRAS = new Set(["if", "for", "while", "switch", "catch", "return", "typeof", "function", "async", "await", "new", "do", "else", "case", "delete", "void", "in", "of", "yield", "import", "export", "class", "extends", "throw", "try", "super", "this"]);

let achados = 0;

console.log("[1] nome exportado por outro módulo, usado sem importar");
for (const [f, s] of fonte) {
  const imp = importadosDe(s), loc = locaisDe(s);
  /* v9.142: O TEXTO DA TELA NAO E CODIGO. Este check acusou
     `painel-diplomacia.jsx: usa "presentear" sem importar` — e a "chamada"
     era o rotulo de um botao. O mesmo com "cumprir", texto de outro botao e
     tambem um export da indole.

     Prosa medida como se fosse regra nao mede nada: um varredor que grita
     por engano perde o unico valor que tem, que e ser acreditado. Fora o
     texto entre tags e o conteudo das strings antes de procurar usos. */
  const corpo = s
    .replace(/import[^;]+;/g, "")
    .replace(/>[^<>{}]+</g, "><")
    .replace(/"[^"]*"/g, "")
    .replace(/'[^']*'/g, "");
  for (const [nome, dono] of exportados) {
    if (dono === f || imp.has(nome) || loc.has(nome)) continue;
    if (nome.length < 3 || RUIDO_CONHECIDO.has(nome)) continue;   // "d", "T": colidem com variáveis locais em todo lugar
    /* só conta uso REAL: chave de objeto (`ritmoViagem: x`) não é referência */
    /* v9.142: e o texto da tela também não é uso. Um rótulo de botão passa
       pelo corte acima quando a faixa de texto é partida por uma expressão
       no meio — foi assim que este check acusou `painel-diplomacia.jsx: usa
       "presentear" sem importar`, sendo que a "chamada" era a palavra
       impressa no botão.

       Um uso de verdade é seguido de alguma coisa que só aparece em código;
       uma palavra numa frase vem seguida de outra palavra. */
    const usos = [...corpo.matchAll(new RegExp("(^|[^\\w$.])" + nome + "\\b(\\s*:)?", "g"))]
      .filter((u) => {
        const depois = corpo.slice(u.index + u[0].length).trimStart();
        return depois === "" || "(.,);=}])?&|<>+-*!".includes(depois[0]);
      });
    if (!usos.length || usos.every((u) => u[2])) continue;
    console.log(`  ${f}: usa "${nome}" (de ${dono}) sem importar`); achados++;
  }
}

console.log("\n[2] função chamada e definida em lugar nenhum");
for (const [f, s] of fonte) {
  const imp = importadosDe(s), loc = locaisDe(s);
  const corpo = s.replace(/import[^;]+;/g, "");
  const vistos = new Set();
  /* Em .jsx o texto solto de JSX não é string e sobra na varredura; prosa como
     "a cidade (livre)" viraria "chamada cidade()". Chamada de verdade quase
     nunca tem espaço antes do parêntese, prosa quase sempre tem — então lá o
     padrão é colado. Em .js, onde não há texto solto, aceita os dois. */
  const rx = f.endsWith(".jsx") ? /(^|[^\w$.?])([A-Za-z_$][\w$]*)\(/g : /(^|[^\w$.?])([A-Za-z_$][\w$]*)\s*\(/g;
  for (const m of corpo.matchAll(rx)) {
    const nome = m[2];
    if (vistos.has(nome) || PALAVRAS.has(nome) || GLOBAIS.has(nome) || RUIDO_CONHECIDO.has(nome)) continue;
    if (loc.has(nome) || imp.has(nome) || exportados.has(nome)) continue;
    vistos.add(nome);
    console.log(`  ${f}: chama "${nome}()" — não é local, nem importado, nem exportado por ninguém`);
    achados++;
  }
}

console.log(achados ? `\n${achados} suspeita(s)` : "\nnenhum nome usado sem definição alcançável");
process.exit(achados ? 1 : 0);
