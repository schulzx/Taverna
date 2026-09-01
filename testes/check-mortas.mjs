/* check-mortas.mjs (v9.85) — regras escritas e nunca usadas.

   A pergunta certa não é "quem MAIS lê" (isso acusa de morto todo helper
   que só o próprio módulo chama), e sim quantas vezes o nome aparece em
   TODO o código e em TODAS as provas. Uma ocorrência é a definição: se
   não há uma segunda, a regra foi escrita e nunca chamada. */
import fs from "node:fs";
import path from "node:path";

const DIR = "../src";
const SP = ".";
const arqs = fs.readdirSync(DIR).filter((f) => /\.(js|jsx)$/.test(f));
const fonte = Object.fromEntries(arqs.map((f) => [f, fs.readFileSync(path.join(DIR, f), "utf8")]));
const provas = fs.readdirSync(SP).filter((f) => /^teste-.+[.]mjs$/.test(f));
const txtProvas = provas.map((f) => fs.readFileSync(path.join(SP, f), "utf8")).join("\n");

const RX = /^export (?:async )?(?:function|const|class) ([A-Za-z_][A-Za-z0-9_]*)/gm;
const mortas = {};
let tot = 0, n = 0;
for (const f of arqs) {
  for (const m of fonte[f].matchAll(RX)) {
    const nome = m[1];
    tot++;
    const rx = new RegExp("\\b" + nome + "\\b", "g");
    let c = 0;
    for (const g of arqs) c += (fonte[g].match(rx) || []).length;
    c += (txtProvas.match(rx) || []).length;
    if (c <= 1) { (mortas[f] = mortas[f] || []).push(nome); n++; }
  }
}
const ks = Object.keys(mortas).sort((a, b) => mortas[b].length - mortas[a].length);
for (const f of ks) console.log("  " + f.padEnd(20) + mortas[f].join(", "));
if (!ks.length) console.log("  nenhuma");
console.log(`\n${tot} regras exportadas · ${n} nunca usadas · ${provas.length} suítes contadas`);
