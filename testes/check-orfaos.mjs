/* Nomes EXPORTADOS que nenhum outro módulo usa: código construído e testado,
   mas nunca ligado ao jogo. É a lista de "pronto na gaveta". */
import fs from "fs";

const dir = "../src";
const files = fs.readdirSync(dir).filter((f) => /\.(js|jsx)$/.test(f));
const src = Object.fromEntries(files.map((f) => [f, fs.readFileSync(`${dir}/${f}`, "utf8")]));

const orfaos = [];
for (const f of files) {
  const re = /export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/g;
  let m;
  while ((m = re.exec(src[f]))) {
    const nome = m[1];
    if (/_PROMPT$/.test(nome)) continue;          // texto de prompt: interpolado, não chamado
    const rx = new RegExp(String.raw`\b` + nome + String.raw`\b`, "g");
    let usos = 0;
    for (const g of files) { if (g !== f) usos += (src[g].match(rx) || []).length; }
    if (usos === 0) orfaos.push(`${f.padEnd(22)} ${nome}`);
  }
}
console.log(`${files.length} arquivos · ${orfaos.length} export(s) que ninguém importa\n`);
console.log(orfaos.join("\n") || "nenhum");
