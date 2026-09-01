/* Pega o erro do setSugestoes: chamada a um setter de estado que não existe
   mais. O bundler não acusa (é um identificador livre, resolvido em runtime)
   e o app só quebra quando o usuário clica. */
import { readdirSync, readFileSync } from "fs";

const dir = "../src";
const GLOBAIS = new Set(["setTimeout", "setInterval", "setImmediate"]);
let achados = 0;

for (const f of readdirSync(dir).filter((x) => /\.(js|jsx)$/.test(x))) {
  const s = readFileSync(dir + "/" + f, "utf8");

  /* setters que existem: useState, declaração local, parâmetro/prop */
  const existe = new Set();
  for (const m of s.matchAll(/\[\s*[A-Za-z_$][\w$]*\s*,\s*(set[A-Z][\w$]*)\s*\]\s*=\s*(?:React\.)?useState/g)) existe.add(m[1]);
  for (const m of s.matchAll(/(?:const|let|var|function)\s+(set[A-Z][\w$]*)\b/g)) existe.add(m[1]);
  for (const m of s.matchAll(/(set[A-Z][\w$]*)\s*[,}=)]/g)) existe.add(m[1]); // props destruturadas e parâmetros

  for (const m of s.matchAll(/(^|[^\w$.])(set[A-Z][\w$]*)\s*\(/gm)) {
    const nome = m[2];
    if (existe.has(nome) || GLOBAIS.has(nome)) continue;
    const linha = s.slice(0, m.index).split("\n").length;
    console.log(`${f}:${linha}  chama ${nome}() — não há useState, declaração nem prop com esse nome`);
    achados++;
  }
}
console.log(achados ? `\n${achados} setter(s) órfão(s)` : "\nnenhum setter órfão");
process.exit(achados ? 1 : 0);
