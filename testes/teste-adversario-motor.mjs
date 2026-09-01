/* A LIGAÇÃO — e é ela que decide se esta etapa valeu.

   A linha da Pauta diz "está empurrando o Odo para a beira". O teste é:
   o Odo apanha? Se não apanhar, tudo o que o módulo anterior mediu era
   uma frase bonita e o sistema continuava sorteando 35% no companheiro,
   como antes.

   `turnoDosInimigos` rola dados de verdade, então quase tudo aqui é
   medido em muitas repetições: o que se mede é a DISTRIBUIÇÃO de quem
   apanha, não um golpe. */
import { turnoDosInimigos } from "../src/combate.js";
import { intencaoPorId, intencaoDaVez, linhaDaLuta, menteDaCriatura } from "../src/adversario.js";
import { SECOES, secaoPorId, porNaPauta, textoDaPauta } from "../src/pauta.js";

let ok = 0, bad = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; } else { bad++; console.log("  FALHOU: " + nome + (extra ? " — " + extra : "")); } };

const heroi = { nome: "Kael", vida: 90, vidaMax: 90, nivel: 8, classe: "Guerreiro", atributos: { destreza: 3, vigor: 3 }, equipados: {}, condicoes: [] };
const mago = { nome: "Vess", vida: 40, vidaMax: 40, nivel: 8, classe: "Mago", atributos: {}, equipados: {}, condicoes: [] };
const clerigo = { nome: "Bram", vida: 55, vidaMax: 55, nivel: 8, classe: "Clérigo", atributos: {}, equipados: {}, condicoes: [] };
const ferido = { nome: "Odo", vida: 6, vidaMax: 50, nivel: 8, classe: "Ladino", atributos: {}, equipados: {}, condicoes: [] };
const inimigos = [{ nome: "Salteador", ameaca: "comum", nivel: 8, vida: 30, vidaMax: 30, desc: "bandido de estrada" }];

const quemApanhou = (prioridade, voltas = 400, grupo = [mago, clerigo, ferido]) => {
  const conta = {};
  for (let k = 0; k < voltas; k++) {
    const acoes = turnoDosInimigos({
      inimigos: inimigos.map((x) => ({ ...x })), jogador: { ...heroi },
      grupo: grupo.map((x) => ({ ...x })), rodada: 2, prioridade,
    });
    for (const a of acoes) conta[a.alvoNome] = (conta[a.alvoNome] || 0) + 1;
  }
  return conta;
};

console.log("== A PRIORIDADE CHEGA AO GOLPE ==");
const semNada = quemApanhou("");
console.log("      sem prioridade: " + JSON.stringify(semNada));
t("sem prioridade, o comportamento antigo continua — vários apanham", Object.keys(semNada).length > 1);
t("e o herói apanha a maior parte", (semNada["Kael"] || 0) > (semNada["Vess"] || 0), "era o sorteio de 35%");

const noMago = quemApanhou("o_conjurador");
console.log("      o_conjurador:   " + JSON.stringify(noMago));
t("com o_conjurador, SÓ o mago apanha", Object.keys(noMago).length === 1 && noMago["Vess"] > 0);

const noCura = quemApanhou("o_curandeiro");
console.log("      o_curandeiro:   " + JSON.stringify(noCura));
t("com o_curandeiro, só o clérigo apanha", Object.keys(noCura).length === 1 && noCura["Bram"] > 0);

const noFerido = quemApanhou("o_ferido");
console.log("      o_ferido:       " + JSON.stringify(noFerido));
t("com o_ferido, só o Odo apanha", Object.keys(noFerido).length === 1 && noFerido["Odo"] > 0);

const noHeroi = quemApanhou("o_heroi");
console.log("      o_heroi:        " + JSON.stringify(noHeroi));
t("com o_heroi, só o herói apanha", Object.keys(noHeroi).length === 1 && noHeroi["Kael"] > 0);

const naoHeroi = quemApanhou("quem_nao_e_o_heroi");
t("com quem_nao_e_o_heroi, o herói nunca apanha", !naoHeroi["Kael"], JSON.stringify(naoHeroi));

console.log("\n== A BANDEIRA QUE SÓ O MOTOR SABE ==");
/* seis das quarenta e quatro intenções apontam para quem_bloqueia. Se o
   motor não marcasse a bandeira, as seis cairiam no sorteio antigo em
   silêncio, e o teste unitário continuaria verde porque monta a lista de
   alvos à mão. */
const bloqueio = quemApanhou("quem_bloqueia");
console.log("      quem_bloqueia:  " + JSON.stringify(bloqueio));
t("quem_bloqueia sempre acha alguém", Object.keys(bloqueio).length === 1, "o motor marca a bandeira");
t("e o escolhido não é o conjurador", !bloqueio["Vess"], "quem está na frente não é quem conjura");
t("nem o que está caindo", !bloqueio["Odo"], "o da frente é quem aguenta apanhar");

console.log("\n== A PRIORIDADE NÃO ATROPELA AS REGRAS DURAS ==");
const provocado = (() => {
  const conta = {};
  for (let k = 0; k < 200; k++) {
    const acoes = turnoDosInimigos({
      inimigos: inimigos.map((x) => ({ ...x })), jogador: { ...heroi },
      grupo: [mago, clerigo, ferido].map((x) => ({ ...x })), rodada: 2,
      prioridade: "o_conjurador", provocado: true,
    });
    for (const a of acoes) conta[a.alvoNome] = (conta[a.alvoNome] || 0) + 1;
  }
  return conta;
})();
console.log("      provocado:      " + JSON.stringify(provocado));
t("provocado, ninguém desvia o olhar nem pela intenção", Object.keys(provocado).length === 1 && provocado["Kael"] > 0,
  "provocar é decisão do jogador e uma intenção não a desfaz");

console.log("\n== FALHA ABERTA: A INTENÇÃO NUNCA CUSTA O TURNO ==");
const semGrupo = quemApanhou("o_curandeiro", 100, []);
console.log("      sem curandeiro: " + JSON.stringify(semGrupo));
t("sem quem satisfaça a prioridade, o inimigo ainda age", (semGrupo["Kael"] || 0) > 0);
const prioridadeTorta = quemApanhou("nao_existe_essa", 100);
t("prioridade inexistente não trava o turno", Object.values(prioridadeTorta).reduce((a, b) => a + b, 0) > 0);

console.log("\n== A LINHA DA PAUTA E O GOLPE CONCORDAM ==");
/* o coração: a mesma intenção que escreve a linha escolhe o alvo. */
const alvos = [
  { ref: "jogador", nome: "Kael", vida: 90, vidaMax: 90, nivel: 8, heroi: true },
  { ref: "grupo", nome: "Vess", vida: 40, vidaMax: 40, nivel: 8, conjurador: true, i: 0 },
  { ref: "grupo", nome: "Bram", vida: 55, vidaMax: 55, nivel: 8, cura: true, i: 1 },
  { ref: "grupo", nome: "Odo", vida: 6, vidaMax: 50, nivel: 8, i: 2 },
];
const situacao = { nome: "Salteador", pensa: true, quantos: 1, quantosDoOutroLado: 4, temConjurador: true, rodada: 2, minhaVida: 1 };
const v = intencaoDaVez(situacao);
const linha = linhaDaLuta(situacao, alvos);
console.log("      " + linha);
const daPrioridade = intencaoPorId(v.intencao.id).alvo;
const bateu = quemApanhou(daPrioridade);
const nomeNaLinha = (linha.match(/— em (.+?)(?: \(|$)/) || [])[1] || "";
t("a linha nomeia alguém", !!nomeNaLinha);
t("e é exatamente esse que apanha", !!bateu[nomeNaLinha] && Object.keys(bateu).length === 1,
  `linha diz ${nomeNaLinha}, golpe bateu em ${Object.keys(bateu).join("/")}`);

console.log("\n== A SEÇÃO CONTRA NA PAUTA ==");
t("a seção existe", !!secaoPorId("contra"));
t("ela vem depois de QUEM e antes de ANTES",
  SECOES.findIndex((s) => s.id === "contra") > SECOES.findIndex((s) => s.id === "quem")
  && SECOES.findIndex((s) => s.id === "contra") < SECOES.findIndex((s) => s.id === "antes"));
t("ela não é das que nunca caem", secaoPorId("contra").prio > secaoPorId("naoPode").prio,
  "um veto cortado é incoerência; uma luta sem intenção é só o jogo de antes");
const pauta = porNaPauta(porNaPauta(null, "onde", "numa cripta"), "contra", linha);
const txt = textoDaPauta(pauta, { turno: 12 });
t("a seção sai com rótulo", /CONTRA/.test(txt));
t("e com a linha dentro", txt.includes(linha));

console.log("\n== A MENTE DECIDE ANTES DE TUDO ==");
t("um lobo é bicho", menteDaCriatura("Lobo Cinzento") === "besta");
t("um lobo esquelético é morto, não lobo", menteDaCriatura("Lobo Esquelético") === "morto");
t("um dragão vermelho não é verme", menteDaCriatura("Dragão Vermelho") === "pensa");
/* "Orca" cai no padrão (pensa) porque nenhuma lista a tem — o que se
   mede aqui é que ela não entra por dentro de "orc", que era o furo. */
t("um orc pensa", menteDaCriatura("Orc Berserker") === "pensa");
t("um verme é bicho", menteDaCriatura("Verme das Areias") === "besta");
t("um rato gigante é rato, não gigante", menteDaCriatura("Rato Gigante") === "besta");
t("o desconhecido pensa", menteDaCriatura("Aquilo Que Espera") === "pensa");
t("nada quebra sem nome", ["besta", "morto", "pensa"].includes(menteDaCriatura(null)));

console.log(`\n${ok} passaram · ${bad} falharam`);
process.exit(bad ? 1 : 0);
