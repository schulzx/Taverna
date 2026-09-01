import {
  normalizarCondicao, criarCondicao, mecanicaDe, estadoDeRolagem, tickCondicoes,
  limparPorDescanso, resumoCondicoesPrompt,
} from "../src/condicoes.js";

let falhas = 0;
const ok = (cond, txt) => { if (!cond) { falhas++; console.log("  FALHA:", txt); } else console.log("  ok:", txt); };

console.log("\n[normalização] o Mestre escreve de qualquer jeito:");
for (const [entrada, esperado] of [
  ["Envenenado", "envenenado"], ["envenenada", "envenenado"], ["Envenenado gravemente", "envenenado"],
  ["intoxicado", "envenenado"], ["ATORDOADO", "atordoado"], ["atordoada", "atordoado"],
  ["Sangrando", "sangrando"], ["hemorragia", "sangrando"], ["Em chamas", "queimando"],
  ["Amedrontado", "amedrontado"], ["apavorado", "amedrontado"], ["Abençoado", "abencoado"],
  ["abencoado", "abencoado"], ["Paralisado", "paralisado"], ["congelado", "paralisado"],
  ["Cego", "cego"], ["Exausto", "exausto"], ["Enfurecido", "enfurecido"],
]) {
  const r = normalizarCondicao(entrada);
  ok(r && r.id === esperado, `"${entrada}" → ${r ? r.id : "null"} (esperado ${esperado})`);
}
ok(normalizarCondicao("Feliz da vida") === null, `"Feliz da vida" → null (não inventa condição)`);

console.log("\n[mecânica] o que cada uma faz:");
const env = criarCondicao("Envenenado gravemente");
ok(env && env.id === "envenenado" && env.turnos === 4, `Envenenado: ${env.turnos} turnos, "${env.efeito}"`);
const m1 = mecanicaDe([criarCondicao("envenenado"), criarCondicao("abencoado")]);
ok(m1.vantagem && m1.desvantagem, "veneno + bênção → tem vantagem E desvantagem…");
ok(estadoDeRolagem([criarCondicao("envenenado"), criarCondicao("abencoado")]).rotulo === "neutro", "…que se cancelam (regra 5e): neutro");
ok(mecanicaDe([criarCondicao("atordoado")]).perdeAcao, "Atordoado → perde a ação");
ok(mecanicaDe([criarCondicao("envenenado"), criarCondicao("sangrando")]).danoTurno === 5, "veneno(2) + sangramento(3) = 5 PV/turno");

console.log("\n[tick] passagem de turno:");
let cs = [criarCondicao("envenenado"), criarCondicao("atordoado")];
const t1 = tickCondicoes(cs);
ok(t1.dano === 2, `cobra ${t1.dano} de dano no turno`);
ok(t1.expiradas.length === 1 && t1.expiradas[0].id === "atordoado", "Atordoado (1 turno) expira");
ok(t1.condicoes.length === 1 && t1.condicoes[0].turnos === 3, "Envenenado continua, agora com 3t");
let persist = tickCondicoes([criarCondicao("exausto")]);
ok(persist.condicoes.length === 1 && persist.condicoes[0].turnos === null, "Exausto não expira sozinho (turnos null)");

console.log("\n[descanso]:");
const dCurto = limparPorDescanso([criarCondicao("sangrando"), criarCondicao("envenenado"), criarCondicao("exausto")], "curto");
ok(dCurto.removidas.length === 1 && dCurto.removidas[0].id === "sangrando", "curto estanca sangramento e só isso");
const dLongo = limparPorDescanso([criarCondicao("sangrando"), criarCondicao("envenenado"), criarCondicao("exausto"), criarCondicao("abencoado")], "longo");
ok(dLongo.removidas.length === 3, "longo cura veneno, sangramento e exaustão");
ok(dLongo.condicoes.length === 1 && dLongo.condicoes[0].id === "abencoado", "…e a bênção fica");

/* v9.49: aqui testava-se o cao de guarda que lia a narracao atras de
   condicoes. Ele saiu — ver teste-consequencias.mjs. A lista de casos que
   ficava aqui e o proprio epitafio dele: previa o orc envenenado aos pes do
   heroi e o "se voce ficar envenenado", e nao previa "o ar preso na
   garganta", que foi o que apareceu jogando. */

console.log("\n[o que o Mestre lê]:");
const pers = { nome: "Vera", condicoes: [criarCondicao("envenenado"), criarCondicao("atordoado")], grupo: [{ nome: "Doran", condicoes: [criarCondicao("sangrando")] }] };
console.log(resumoCondicoesPrompt(pers, pers.grupo));

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
