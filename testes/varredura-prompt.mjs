/* O inverso da varredura de v9.44: campo PEDIDO no prompt que NINGUEM le.
   O Mestre gasta tokens produzindo JSON que o codigo joga fora.

   A regua de "e lido" e ESTREITA de proposito: so conta acesso de verdade
   (md.campo, mudancas.campo, resp.campo, obj["campo"]). Na primeira versao
   eu procurava o nome solto no fonte — e o nome aparece no proprio texto do
   prompt, entao tudo casava e nada era acusado.                            */
import fs from "node:fs";

const SRC = "../src/";
const fontes = fs.readdirSync(SRC).filter((f) => /\.(jsx?|)$/.test(f) && /\.(js|jsx)$/.test(f));
const codigo = fontes.map((f) => fs.readFileSync(SRC + f, "utf8")).join("\n");

/* tudo o que o Mestre le */
let texto = "";
for (const f of fontes.filter((x) => x.endsWith(".js"))) {
  let mod; try { mod = await import(`file:///${SRC}${f}`); } catch { continue; }
  for (const [k, v] of Object.entries(mod)) if (/_PROMPT$/.test(k) && typeof v === "string") texto += "\n" + v;
}
const promptJs = fs.readFileSync(SRC + "prompt.js", "utf8");
texto += "\n" + promptJs;

const candidatos = new Set();
for (const m of texto.matchAll(/"([a-z][a-z0-9]*(?:_[a-z0-9]+)+)"/g)) candidatos.add(m[1]);

const ehLido = (c) => new RegExp(
  `[A-Za-z_$][\\w$]{0,14}\\s*\\.\\s*${c}\\b` +
  `|\\[\\s*["']${c}["']\\s*\\]` +
  `|\\bconst\\s*\\{[^}]*\\b${c}\\b[^}]*\\}` +
  `|hasOwnProperty\\.call\\([^,]+,\\s*["']${c}["']\\)`
).test(codigo);

const mortos = [...candidatos].filter((c) => !ehLido(c)).sort();
console.log("CAMPOS PEDIDOS NO PROMPT QUE NINGUEM LE:\n");
for (const m of mortos) {
  const ondes = fontes.filter((f) => fs.readFileSync(SRC + f, "utf8").includes(`"${m}"`));
  console.log(`  ${m.padEnd(26)} citado em: ${ondes.join(", ") || "—"}`);
}
console.log(`\n${mortos.length} de ${candidatos.size} campos citados`);

console.log("\n\nCAMPOS QUE O CODIGO LE E O PROMPT NAO PEDE:\n");
const lidos = new Set();
const app = fs.readFileSync(SRC + "App.jsx", "utf8");
for (const m of app.matchAll(/\bmd\.([a-z][a-z0-9_]{2,40})\b/g)) lidos.add(m[1]);
for (const m of app.matchAll(/\bresp\.mudancas\.([a-z][a-z0-9_]{2,40})\b/g)) lidos.add(m[1]);
for (const m of app.matchAll(/hasOwnProperty\.call\(md,\s*"([a-z_]+)"\)/g)) lidos.add(m[1]);
const orfaos = [...lidos].filter((c) => !texto.includes(`"${c}"`) && !c.startsWith("__")).sort();
for (const o of orfaos) console.log(`  ${o}`);
console.log(`\n${orfaos.length} campo(s)`);
