/* teste-app-troca-a-quente.mjs (T1-A, 6.ª fatia, 28/10/2026) — o App só exporta o componente

   O Fast Refresh do Vite só troca um módulo a quente se TODO export dele
   for componente (ou um valor que não muda entre execuções). O App
   exportava `custoRef` e `ultimoProvedorRef`, dois objetos que nascem de
   novo a cada execução — e por isso cada edição de qualquer módulo que o
   App importa caía em "Could not Fast Refresh (export is incompatible)" e
   recarregava a página inteira, a sessão de jogo junto. Visto no
   dev-server em 28/10: com um objeto exportado do App, editar um módulo
   do motor dá "page reload"; sem ele, "hmr update".

   Os dois refs moram agora em `src/bastidor.js`. Esta catraca impede que
   um export que não é o componente volte ao App. */
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };

const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const BAST = fs.readFileSync(new URL("../src/bastidor.js", import.meta.url), "utf8");
const exports = APP.split("\n").filter((l) => /^export\b/.test(l));

t("o App tem um export só", exports.length === 1);
t("e é o componente (export default function)", /^export default function [A-Z]\w*\(/.test(exports[0] || ""));
t("os refs do bastidor moram em bastidor.js", /export const custoRef = \{ atual: CUSTO_ZERO\(\) \};/.test(BAST) && /export const ultimoProvedorRef = \{ atual: "", historico: \[\] \};/.test(BAST));
t("e o App os importa de lá", /import \{ custoRef, ultimoProvedorRef \} from "\.\/bastidor\.js";/.test(APP));
t("e não os declara de novo", !/const (custoRef|ultimoProvedorRef) =/.test(APP));

console.log(`\n${ok} ok, ${mal} falhas`);
if (mal) process.exit(1);
