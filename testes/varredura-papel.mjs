/* varredura-papel.mjs (v2) — o que existe só no papel.
   Melhorias sobre a v1:
   - apaga o conteúdo das strings antes de procurar `chave:` (senão
     "Golpe exato: ..." vira um campo)
   - ignora tabelas acessadas por índice dinâmico (TABELA[x]), onde
     toda chave é lida por definição
   - ignora comentários                                                  */
import fs from "node:fs";
import path from "node:path";

const RAIZ = "../src";
const todos = fs.readdirSync(RAIZ).filter((f) => /\.(js|jsx)$/.test(f));
const cru = {};
for (const f of todos) cru[f] = fs.readFileSync(path.join(RAIZ, f), "utf8");

/* substitui o miolo de toda string/comentário por espaços, preservando posições */
function limpar(src) {
  const a = src.split("");
  let i = 0;
  while (i < a.length) {
    const c = a[i];
    if (c === "/" && a[i + 1] === "/") { while (i < a.length && a[i] !== "\n") a[i++] = " "; continue; }
    if (c === "/" && a[i + 1] === "*") { a[i] = a[i + 1] = " "; i += 2; while (i < a.length && !(a[i] === "*" && a[i + 1] === "/")) a[i++] = " "; a[i] = " "; a[i + 1] = " "; i += 2; continue; }
    if (c === '"' || c === "'" || c === "`") {
      const q = c; a[i++] = " ";
      while (i < a.length && a[i] !== q) { if (a[i] === "\\") a[i++] = " "; if (i < a.length) a[i++] = " "; }
      if (i < a.length) a[i++] = " ";
      continue;
    }
    i++;
  }
  return a.join("");
}

const lim = {};
for (const f of todos) lim[f] = limpar(cru[f]);
const tudoLimpo = Object.values(lim).join("\n");
const tudoCru = Object.values(cru).join("\n");

function corpoDe(src, from, abre) {
  const fecha = abre === "[" ? "]" : "}";
  let i = from, nivel = 1;
  while (i < src.length && nivel > 0) {
    if (src[i] === abre) nivel++;
    else if (src[i] === fecha) nivel--;
    i++;
  }
  return { corpo: src.slice(from, i), fim: i };
}

function tabelas(src) {
  const out = [];
  const re = /export\s+const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([[{])/g;
  let m;
  while ((m = re.exec(src))) {
    const { corpo } = corpoDe(src, re.lastIndex, m[2]);
    out.push({ nome: m[1], corpo });
  }
  return out;
}

/* a tabela é indexada por variável em algum lugar? então toda chave é lida */
const dinamica = (nome) => new RegExp(`\\b${nome}\\s*\\[\\s*[a-zA-Z_(]`).test(tudoLimpo);

function ehLida(k) {
  if (new RegExp(`\\.${k}\\b`).test(tudoLimpo)) return true;
  if (new RegExp(`\\[\\s*["'\`]${k}["'\`]\\s*\\]`).test(tudoCru)) return true;
  if (new RegExp(`\\{[^{}\\n]*\\b${k}\\b[^{}\\n]*\\}\\s*[=)]`).test(tudoLimpo)) return true;
  return false;
}

const achados = [];
for (const f of todos) {
  for (const t of tabelas(lim[f])) {
    if (dinamica(t.nome)) continue;
    const chaves = new Set();
    const re = /(?:^|[{,\s])([a-zA-Z_][a-zA-Z0-9_]*)\s*:/gm;
    let m;
    while ((m = re.exec(t.corpo))) chaves.add(m[1]);
    const mortas = [...chaves].filter((k) => k.length >= 3 && !ehLida(k));
    if (mortas.length) achados.push({ f, tabela: t.nome, mortas });
  }
}

console.log("═══ CAMPOS DE TABELA QUE NINGUÉM LÊ ═══");
for (const a of achados) console.log(`  ${a.f} · ${a.tabela}: ${a.mortas.join(", ")}`);
if (!achados.length) console.log("  (nenhum)");
