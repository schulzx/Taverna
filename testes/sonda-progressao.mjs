/* sonda-progressao.mjs — a curva de dano por turno, do nível 1 ao 20,
   classe por classe. Mede o que o herói TIRA num turno, não o que a
   tabela promete.                                                      */
import { PERFIS_COMBATE, perfilCombate, ataquesPorTurno, dadosDeDano, danoDaClasse } from "../src/combate.js";

const N = 4000;
/* o atributo-chave cresce com o nível como cresce numa ficha real:
   +1 a cada 4 níveis a partir de 3, começando em 3 */
const atrDe = (nv) => 3 + Math.floor(nv / 4);

function danoPorTurno(classe, nv) {
  const n = ataquesPorTurno(classe, nv);
  let soma = 0;
  for (let i = 0; i < N; i++) {
    let t = 0;
    for (let g = 0; g < n; g++) t += danoDaClasse(classe, nv, atrDe(nv));
    soma += t;
  }
  return soma / N;
}

const classes = Object.keys(PERFIS_COMBATE);
const niveis = [1, 3, 5, 8, 11, 14, 17, 20];

console.log("DANO MÉDIO POR TURNO (dados da classe + atributo)\n");
console.log("classe".padEnd(12) + niveis.map((n) => `nv${n}`.padStart(7)).join("") + "   ×1→20");
const curva = {};
for (const c of classes) {
  const vals = niveis.map((nv) => danoPorTurno(c, nv));
  curva[c] = vals;
  console.log(c.padEnd(12) + vals.map((v) => v.toFixed(1).padStart(7)).join("") + `   ${(vals[vals.length - 1] / vals[0]).toFixed(1)}×`);
}

console.log("\nONDE CADA CLASSE CONGELA (níveis seguidos sem ganhar dado nem ataque):");
for (const c of classes) {
  const p = perfilCombate(c);
  const marcos = [];
  for (let nv = 2; nv <= 20; nv++) {
    if (ataquesPorTurno(c, nv) !== ataquesPorTurno(c, nv - 1) || dadosDeDano(c, nv) !== dadosDeDano(c, nv - 1)) marcos.push(nv);
  }
  let maiorVao = marcos.length ? marcos[0] - 1 : 19;
  let onde = marcos.length ? `1→${marcos[0]}` : "1→20";
  for (let i = 0; i < marcos.length; i++) {
    const fim = i + 1 < marcos.length ? marcos[i + 1] : 21;
    const vao = fim - marcos[i] - (i + 1 < marcos.length ? 0 : 1);
    if (vao > maiorVao) { maiorVao = vao; onde = `${marcos[i]}→${i + 1 < marcos.length ? marcos[i + 1] : 20}`; }
  }
  console.log(`  ${c.padEnd(12)} marcos: ${marcos.join(", ") || "nenhum"}  · maior vão: ${maiorVao} níveis (${onde})`);
}

console.log("\nO PISO: nenhuma classe deveria passar de 8 níveis sem crescer, nem dobrar menos de 3× do 1 ao 20.");
let furos = 0;
for (const c of classes) {
  const v = curva[c];
  const mult = v[v.length - 1] / v[0];
  if (mult < 3) { console.log(`  FURO  ${c}: cresce só ${mult.toFixed(1)}× do nível 1 ao 20`); furos++; }
}
console.log(furos ? `\n${furos} classe(s) furam o piso.` : "\nnenhuma classe fura o piso.");
