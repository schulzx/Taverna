import { danoDaClasse, pvEsperadoInimigo, pvEsperadoJogador, ataquesPorTurno, dadosDeDano, perfilCombate } from "../src/combate.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const media = (f, n = 4000) => { let s = 0; for (let i = 0; i < n; i++) s += f(); return Math.round(s / n); };

/* a conta nova de dano de habilidade, como está no App */
const danoHabilidade = (classe, nivel, atr, custoPM) => danoDaClasse(classe, nivel, atr) + custoPM * 3;
/* a conta antiga, para comparar */
const danoAntigo = (atr, custoPM) => custoPM * 2 + (1 + Math.floor(Math.random() * 6)) + atr;

console.log("\n[mago: quanto uma magia tira, por nível]");
for (const nv of [1, 5, 11, 17, 20]) {
  const atr = Math.min(5, 1 + Math.floor(nv / 5));
  console.log(`  nv ${String(nv).padStart(2)} (int +${atr}): 4 PM → ${media(() => danoHabilidade("Mago", nv, atr, 4))} · 8 PM → ${media(() => danoHabilidade("Mago", nv, atr, 8))}   [antes: ${media(() => danoAntigo(atr, 4))} e ${media(() => danoAntigo(atr, 8))}]`);
}
const antes20 = media(() => danoAntigo(5, 4));
const agora20 = media(() => danoHabilidade("Mago", 20, 5, 4));
ok(agora20 > antes20 * 2, `no nível 20 a mesma magia saiu de ~${antes20} para ~${agora20} de dano`);
ok(media(() => danoHabilidade("Mago", 20, 5, 4)) > media(() => danoHabilidade("Mago", 5, 3, 4)), "o dano cresce com o nível (antes era igual em todos)");
ok(media(() => danoHabilidade("Mago", 20, 5, 8)) > media(() => danoHabilidade("Mago", 20, 5, 2)), "magia cara bate mais que truque barato");

console.log("\n[quantos turnos para derrubar um chefe]");
for (const ameaca of ["comum", "elite", "lendario"]) {
  const pv = pvEsperadoInimigo(20, ameaca);
  const mago = media(() => danoHabilidade("Mago", 20, 5, 5));
  const guer = ataquesPorTurno("Guerreiro", 20) * media(() => danoDaClasse("Guerreiro", 20, 8));
  console.log(`  ${ameaca.padEnd(9)} ${String(pv).padStart(3)} PV → mago ${Math.ceil(pv / mago)} turnos (${mago}/turno) · guerreiro ${Math.ceil(pv / guer)} turnos (${guer}/turno)`);
}
const pvLend = pvEsperadoInimigo(20, "lendario");
const dpsMago = media(() => danoHabilidade("Mago", 20, 5, 5));
ok(pvLend / dpsMago < 12, `um lendário de ${pvLend} PV cai em ${Math.ceil(pvLend / dpsMago)} turnos de mago (era ${Math.ceil(pvLend / media(() => danoAntigo(5, 5)))})`);

console.log("\n[mago com 2 movimentos lançando 2 magias]");
const doisTurnos = media(() => danoHabilidade("Mago", 20, 5, 4) + danoHabilidade("Mago", 20, 5, 3));
const guerreiro = ataquesPorTurno("Guerreiro", 20) * media(() => danoDaClasse("Guerreiro", 20, 8));
console.log(`  duas magias num turno: ${doisTurnos} · guerreiro com ${ataquesPorTurno("Guerreiro", 20)} golpes: ${guerreiro}`);
ok(Math.abs(doisTurnos - guerreiro) < guerreiro * 0.8, "conjurador com dois movimentos fica na mesma faixa do marcial");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
