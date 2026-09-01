import { gerarGeografia } from "../src/geografia.js";
import { locaisDaCidade } from "../src/mundo-base.js";
const cont = {}; const contPrimeira = {};
let total = 0;
for (let s = 0; s < 400; s++) {
  const sem = "mundo-" + s + "-" + (s * 7919).toString(36);
  const geo = gerarGeografia(sem, null);
  let primeira = true;
  for (const c of geo.cidades) {
    const ls = locaisDaCidade(sem, c, "Fantasia medieval", null);
    const tav = ls.find((l) => l.tipo === "taverna");
    if (!tav) continue;
    cont[tav.nome] = (cont[tav.nome] || 0) + 1; total++;
    if (primeira) { contPrimeira[tav.nome] = (contPrimeira[tav.nome] || 0) + 1; primeira = false; }
  }
}
const ord = Object.entries(cont).sort((a,b)=>b[1]-a[1]);
console.log("TOTAL tavernas:", total, "nomes distintos:", ord.length, "de 25 possiveis");
console.log("top 8:", ord.slice(0,8).map(([n,q])=>`${n} ${(q/total*100).toFixed(1)}%`).join(" | "));
const op = Object.entries(contPrimeira).sort((a,b)=>b[1]-a[1]);
console.log("PRIMEIRA cidade — distintos:", op.length, "top:", op.slice(0,6).map(([n,q])=>`${n} ${q}`).join(" | "));
