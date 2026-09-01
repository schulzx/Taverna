/* varredura-exports.mjs — funções que existem e ninguém chama.
   Distingue três estados, que é onde mora a diferença:
     ÓRFÃ      — ninguém sequer importa
     SÓ IMPORT — importada e nunca usada no corpo (o caso do
                 conjuracaoBloqueada: a regra existe e está desligada)
     SÓ TEXTO  — usada apenas dentro de template de prompt/JSX          */
import fs from "node:fs";
import path from "node:path";

const RAIZ = "../src";
const todos = fs.readdirSync(RAIZ).filter((f) => /\.(js|jsx)$/.test(f));
const cru = {};
for (const f of todos) cru[f] = fs.readFileSync(path.join(RAIZ, f), "utf8");

function semComentario(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
}
const lim = {};
for (const f of todos) lim[f] = semComentario(cru[f]);

/* quais nomes cada arquivo importa */
function importados(src) {
  const s = new Set();
  const re = /import\s*\{([^}]+)\}\s*from/g;
  let m;
  while ((m = re.exec(src))) m[1].split(",").forEach((x) => {
    const n = x.trim().split(/\s+as\s+/).pop().trim();
    if (n) s.add(n);
  });
  return s;
}

const orfas = [], soImport = [];
for (const f of todos) {
  const nomes = [];
  const re = /export\s+(?:const|function|class|let)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
  let m;
  while ((m = re.exec(lim[f]))) nomes.push(m[1]);

  for (const n of nomes) {
    /* onde mais aparece? */
    let usoReal = false, alguemImporta = false;
    for (const g of todos) {
      if (g === f) continue;
      const imp = importados(lim[g]);
      if (imp.has(n)) alguemImporta = true;
      /* uso no corpo = ocorrência fora da linha de import */
      const corpo = lim[g].replace(/import\s*\{[^}]*\}\s*from\s*["'][^"']+["'];?/g, " ");
      if (new RegExp(`\\b${n}\\b`).test(corpo)) usoReal = true;
    }
    /* uso interno no próprio módulo conta como vivo se for chamada */
    const proprio = lim[f].replace(new RegExp(`export\\s+(?:const|function|class|let)\\s+${n}\\b`), " ");
    if (new RegExp(`\\b${n}\\s*\\(`).test(proprio)) usoReal = true;

    if (!alguemImporta && !usoReal) orfas.push(`${f} · ${n}`);
    else if (alguemImporta && !usoReal) soImport.push(`${f} · ${n}`);
  }
}

console.log("═══ IMPORTADA E NUNCA USADA (a regra está desligada) ═══");
soImport.forEach((x) => console.log("  " + x));
if (!soImport.length) console.log("  (nenhuma)");

console.log("\n═══ ÓRFÃ (ninguém importa nem usa) ═══");
orfas.forEach((x) => console.log("  " + x));
if (!orfas.length) console.log("  (nenhuma)");
