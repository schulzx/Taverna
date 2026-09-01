import {
  GRAUS, grauPorId, FAIXAS, faixaPorChance, tipoDaPergunta, calcularChance,
  consultar, envelopeDoOraculo, linhaDaConsulta, ehPerguntaAoMundo,
} from "../src/oraculo.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const fixo = (v) => () => v;

console.log("\n[1. OS SEIS GRAUS]");
ok(GRAUS.length === 6, "seis graus, do 'não, e ainda por cima' ao 'sim, e ainda mais'");
ok(GRAUS.every((g) => g.rotulo && g.guia), "cada um traz a instrução do que fazer com ele");
ok(GRAUS.filter((g) => g.extremo).length === 2, "dois extremos, e só dois — 'e ainda por cima' perde a graça se acontecer sempre");
ok(/sim, mas/i.test(GRAUS[3].rotulo) && /não, mas/i.test(GRAUS[2].rotulo), "o miolo tem o 'mas' dos dois lados — é onde nasce a cena boa");
ok(/não ofereça consolo/i.test(grauPorId("nao").guia), "o 'não' seco proíbe consolo — senão vira 'não, mas' disfarçado");

console.log("\n[2. A CHANCE VEM DO MUNDO, NÃO DE UM SORTEIO]");
const social = "o guarda aceita o suborno?";
const heroi = calcularChance(social, { fama: 90 });
const ninguem = calcularChance(social, { fama: 0 });
console.log(`  "${social}" — herói famoso: ${heroi.chance}% · desconhecido: ${ninguem.chance}%`);
ok(heroi.chance > ninguem.chance, "o nome do herói pesa numa pergunta social");
ok(heroi.porque.length > 0, "e a razão vai junto — chance sem causa é dado disfarçado de sistema");
ok(calcularChance(social, { fama: 50, emGuerra: "Ordem do Corvo" }).chance < calcularChance(social, { fama: 50 }).chance,
   "estar em guerra com a facção local derruba a chance");
ok(calcularChance(social, { fama: 50, dominaAqui: true }).chance > calcularChance(social, { fama: 50 }).chance,
   "e mandar no lugar levanta");
ok(calcularChance("tem armadilha nesta porta?", { emMasmorra: true }).chance > calcularChance("tem armadilha nesta porta?", {}).chance,
   "masmorra é lugar de armadilha — o tipo da pergunta escolhe os fatores");
ok(calcularChance("tem armadilha aqui?", { fama: 95 }).chance === calcularChance("tem armadilha aqui?", { fama: 0 }).chance,
   "e fama NÃO ajuda a saber se há armadilha — cada fator no seu tipo");
ok(calcularChance("existe uma saída?", { emCidade: true }).chance > calcularChance("existe uma saída?", { emCidade: false }).chance,
   "cidade tem de tudo; no ermo, quase nada");
const inc = calcularChance(social, { fama: 50, inclinacao: "provavel" });
ok(inc.chance > calcularChance(social, { fama: 50 }).chance, "e o jogador pode dizer que a cena já apontava para lá");

console.log("\n[3. LIMITES]");
ok(calcularChance(social, { fama: 100, dominaAqui: true, gd: 4, inclinacao: "provavel" }).chance <= 95, "nunca passa de 95% — sempre há como dar errado");
ok(calcularChance(social, { fama: 0, emGuerra: "X", inclinacao: "improvavel" }).chance >= 5, "nem cai abaixo de 5% — sempre há como dar certo");
ok(faixaPorChance(90).id === "quase_certo" && faixaPorChance(10).id === "quase_impossivel", "as faixas mapeiam como o esperado");

console.log("\n[4. O TIPO DA PERGUNTA]");
ok(tipoDaPergunta("o guarda aceita suborno?") === "social", "suborno é social");
ok(tipoDaPergunta("tem uma armadilha aqui?") === "perigo", "armadilha é perigo");
ok(tipoDaPergunta("existe uma taverna nesta rua?") === "mundo", "existência é mundo");
ok(tipoDaPergunta("") === "mundo", "sem pista, cai no mundo");

console.log("\n[5. A CONSULTA]");
const alto = consultar(social, { fama: 90 }, { sorte: fixo(0.01) });
const baixo = consultar(social, { fama: 0 }, { sorte: fixo(0.99) });
console.log("  " + linhaDaConsulta(alto));
console.log("  " + linhaDaConsulta(baixo));
ok(alto.sim === true && baixo.sim === false, "rolo baixo com chance alta dá sim; rolo alto com chance baixa dá não");
ok(alto.grau.id === "sim_e", "um 1 no d100 é o extremo generoso");
ok(baixo.grau.id === "nao_e", "e um 100 é o extremo cruel");
/* o miolo: perto do limiar sai o "mas" */
const perto = consultar(social, { fama: 50 }, { sorte: () => 0.49 });
ok(/mas/.test(perto.grau.rotulo), `perto do limiar sai o "mas": ${perto.grau.rotulo}`);
ok(consultar("x?", {}, { sorte: fixo(0.5) }).porque !== undefined, "a consulta carrega os motivos junto");

console.log("\n[6. O ENVELOPE]");
const env = envelopeDoOraculo(alto);
console.log("  " + env.split("\n")[0].slice(0, 120));
ok(/FATO do mundo, não sugestão/.test(env), "a resposta chega como fato");
ok(/você decide COMO isso é verdade.*nunca SE/is.test(env), "e o Mestre decide o COMO, nunca o SE");
ok(/não mencione oráculo, chance, dado ou sistema/i.test(env), "e é proibido de citar a mecânica");
ok(env.includes(alto.grau.guia), "a instrução daquele grau específico vai dentro");

console.log("\n[7. QUANDO É PERGUNTA AO MUNDO]");
ok(ehPerguntaAoMundo("o guarda é subornável?"), "pergunta fechada sobre o mundo: sim");
ok(ehPerguntaAoMundo("tem uma saída pelos fundos?"), "idem");
ok(ehPerguntaAoMundo("será que ele acredita em mim?"), "idem");
ok(!ehPerguntaAoMundo("o que eu vejo aqui?"), "pergunta ABERTA não é oráculo — é cena, ou teste de perícia");
ok(!ehPerguntaAoMundo("quem está na sala?"), "quem/onde/quando também não");
ok(!ehPerguntaAoMundo("ataco o ogro"), "ação não é pergunta");
ok(!ehPerguntaAoMundo("sim?"), "curto demais não conta");
ok(!ehPerguntaAoMundo("a".repeat(250) + "?"), "longo demais também não");

console.log("\n[8. DISTRIBUIÇÃO — a chance é honrada]");
let sims = 0;
const N = 4000;
for (let i = 0; i < N; i++) if (consultar(social, { fama: 50 }).sim) sims++;
const pct = Math.round((sims / N) * 100);
const esperado = calcularChance(social, { fama: 50 }).chance;
console.log(`  chance calculada ${esperado}% · saiu ${pct}% em ${N} consultas`);
ok(Math.abs(pct - esperado) <= 4, "o dado honra a chance calculada");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
