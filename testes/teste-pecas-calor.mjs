/* AS PEÇAS · O CALOR E O RELÓGIO (17/11/2026, Fase A da prova) — src/pecas/calor.js

   As duas decisões da pessoa em número: o «conjunto de ações» (o calor
   que abre a solução e vira bónus) e «quem trava paga» (o relógio que,
   cheio, faz o mundo cobrar). A prova:
   §1 as tabelas: todo número tem porquê; o preço do relógio é do quadro;
      o relógio deixa abrir duas soluções antes de cobrar;
   §2 aquecer: um passo por frase, um a mais pelo nome, abre no cheio;
   §3 o bónus do calor tem teto;
   §4 o mundo cobra: só com o relógio cheio; o preço; a forçada (as duas
      faces primeiro, a que menos falhou, a mais quente); a etapa reabre
      pior, com teto; à segunda cobrança, impõe;
   §5 a memória: limpa com lixo, substituída, nunca mutada. */
import {
  CALOR_DAS_PECAS, RELOGIO_DAS_PECAS, PRECO_DO_RELOGIO, EVENTO_DO_RELOGIO,
  relogioDaPeca, chaveDaPeca, garantirMemoria, memoriaDe, comMemoria, aquecer, bonusDoCalor, relogioCheio, oMundoCobra,
} from "../src/pecas/calor.js";
import { aPecaDoMolde } from "../src/pecas/peca.js";
import { MOLDE_DO_FATO, VANTAGEM_DA_SETA } from "../src/pecas/moldes.js";
import { PRECO_DA_FALHA } from "../src/quadro-da-quest.js";
import { TEMPERATURAS } from "../src/biblioteca-de-quests.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

sec("§1 as tabelas");
t("as tabelas dizem porquê", typeof CALOR_DAS_PECAS.porque === "string" && typeof RELOGIO_DAS_PECAS.porque === "string");
t("todo facto com molde tem preço do relógio, e o preço é do quadro", Object.keys(MOLDE_DO_FATO).filter((k) => k !== "pelo_menos").every((k) => !!PRECO_DA_FALHA[PRECO_DO_RELOGIO[k]]));
t("e um evento", Object.keys(MOLDE_DO_FATO).filter((k) => k !== "pelo_menos").every((k) => typeof EVENTO_DO_RELOGIO[k] === "string" && EVENTO_DO_RELOGIO[k].length > 0));
t("toda temperatura tem relógio", Object.keys(TEMPERATURAS).every((k) => RELOGIO_DAS_PECAS.porTemperatura[k] > 0));
/* MOVIDA (A2, 17/11): era «2 × cheio + 2, nunca abaixo de 2 × cheio − 1».
   A margem de +2 existia porque a conversa só virava dado pelo calor; com a
   conversa direta e a solução aberta rolando pela frase, a brasa passou a
   2 × cheio, e o piso a cheio + 1 — uma solução abre sempre antes da cobrança. */
t("na brasa o relógio é 2 × cheio, e nunca desce de cheio + 1", RELOGIO_DAS_PECAS.porTemperatura.brasa === 2 * CALOR_DAS_PECAS.cheio && Object.values(RELOGIO_DAS_PECAS.porTemperatura).every((n) => n >= CALOR_DAS_PECAS.cheio + 1));
t("quanto mais quente a quest, mais curto o relógio", (() => { const o = Object.entries(TEMPERATURAS).sort((a, b) => a[1].ordem - b[1].ordem).map(([k]) => RELOGIO_DAS_PECAS.porTemperatura[k]); return o.every((n, i) => i === 0 || n <= o[i - 1]); })());
t("o teto do bónus é o da emboscada", CALOR_DAS_PECAS.tetoDoBonus === VANTAGEM_DA_SETA.emboscada);
t("o pior tem teto, e o teto é maior que um passo", RELOGIO_DAS_PECAS.tetoDoPior >= RELOGIO_DAS_PECAS.pioraDc && RELOGIO_DAS_PECAS.impoeNa >= 1);
t("relogioDaPeca: pela temperatura, ou pela exceção", relogioDaPeca({ temperatura: "incendio" }).cheio === RELOGIO_DAS_PECAS.porTemperatura.incendio && relogioDaPeca({ temperatura: "brasa" }, null, { relogio: { cheio: 3 } }).cheio === 3);

const cena = { quem: [{ nome: "Edric" }], oQue: [], onde: { nome: "a praça" } };
const peca = aPecaDoMolde("conversou", { tipo: "pessoa", nome: "Edric" }, cena);
const fera = aPecaDoMolde("derrotou", { tipo: "pessoa", nome: "a besta" }, { quem: [{ nome: "a besta" }], oQue: [], onde: { nome: "a toca" } });

sec("§2 aquecer");
let m = garantirMemoria(null);
const a1 = aquecer(m, peca, { esquenta: ["convencer@alvo"] });
t("um passo por frase, e o relógio anda um", a1.memoria.calor["convencer@alvo"] === CALOR_DAS_PECAS.porAquecimento && a1.memoria.relogio === RELOGIO_DAS_PECAS.porAquecimento && a1.abriu.length === 0);
const a2 = aquecer(a1.memoria, peca, { esquenta: ["convencer@alvo"], nomeadas: ["convencer@alvo"] });
t("pelo nome, um passo a mais: enche e ABRE", a2.memoria.calor["convencer@alvo"] === 3 && J(a2.abriu) === J(["convencer@alvo"]) && a2.memoria.abertas["convencer@alvo"] === 0);
const a3 = aquecer(a2.memoria, peca, { esquenta: ["convencer@alvo"] });
t("a que já abriu não abre outra vez", a3.abriu.length === 0);
const duas = aquecer(m, peca, { esquenta: ["convencer@alvo", "fazer_falar@alvo"] });
t("a frase que aponta para duas aquece as duas", duas.memoria.calor["convencer@alvo"] === 1 && duas.memoria.calor["fazer_falar@alvo"] === 1);
/* MOVIDA (A2): a frase fria gastava 1; agora gasta porAquecimentoFrio (2) —
   o tempo que não aponta para nada é do mundo (o conversador da fase A). */
t("o que não é da peça não aquece; a frase fria gasta o relógio em dobro", (() => { const z = aquecer(m, peca, { esquenta: ["voar@x"] }); return J(z.memoria.calor) === "{}" && z.memoria.relogio === RELOGIO_DAS_PECAS.porAquecimentoFrio && RELOGIO_DAS_PECAS.porAquecimentoFrio > RELOGIO_DAS_PECAS.porAquecimento; })());
t("a frase que aponta paga o passo de sempre", aquecer(m, peca, { esquenta: ["convencer@alvo"] }).memoria.relogio === RELOGIO_DAS_PECAS.porAquecimento);

sec("§3 o bónus do calor");
t("calor 1: sem bónus; 2: +1; 3+: o teto", bonusDoCalor({ calor: { a: 1 } }, "a") === 0 && bonusDoCalor({ calor: { a: 2 } }, "a") === 1 && bonusDoCalor({ calor: { a: 9 } }, "a") === CALOR_DAS_PECAS.tetoDoBonus);
t("sem memória: zero", bonusDoCalor(null, "a") === 0);

sec("§4 o mundo cobra");
let E = {};
t("com o relógio vazio, nada", oMundoCobra(peca, E) === null && !relogioCheio(memoriaDe(E, peca), peca));
E = comMemoria(E, peca, { relogio: peca.relogio.cheio, calor: { "impressionar@alvo": 2 } });
const c1 = oMundoCobra(peca, E);
t("cheio, cobra: o preço do conversou é o «tempo» do quadro", c1 && c1.preco.id === PRECO_DO_RELOGIO.conversou && c1.preco.linha === PRECO_DA_FALHA.tempo.linha);
t("a forçada é das que escrevem nas duas faces (o mundo traz o desfecho)", ["intimidar@alvo", "pagar@alvo"].includes(c1.forcada), c1.forcada);
t("o evento diz o nome do alvo", c1.evento.diz.includes("Edric"));
t("o relógio zera, a cobrança conta, o pior sobe um passo", c1.memoria.relogio === 0 && c1.memoria.cobrou === 1 && c1.memoria.pior === RELOGIO_DAS_PECAS.pioraDc);
t("a forçada fica à vista e aberta", c1.peca.solucoes.find((s) => s.id === c1.forcada).forcada === true && c1.memoria.abertas[c1.forcada] === 0);
/* MOVIDA (A2): «a primeira cobrança não impõe» — impoeNa passou de 2 a 1:
   quem só conversa nunca pegava a forçada à vista, e cada etapa travada
   custava duas cobranças (7 na quest da fase A). Agora o mundo vem na primeira. */
t("a cobrança impõe na vez que a tabela diz (impoeNa)", c1.impoe === (RELOGIO_DAS_PECAS.impoeNa <= 1));
E = comMemoria(E, peca, { ...c1.memoria, relogio: peca.relogio.cheio, queimadas: [c1.forcada], falhas: { [c1.forcada]: 1 } });
const c2 = oMundoCobra(peca, E);
t("a segunda impõe sempre", c2.impoe === true);
t("e não força a que já falhou, havendo outra de duas faces", c2.forcada !== c1.forcada, `${c1.forcada} → ${c2.forcada}`);
t("a etapa reabre: o que tinha queimado pode tentar-se outra vez", J(c2.memoria.queimadas) === "[]");
let mm = c2.memoria;
for (let i = 0; i < 5; i++) mm = oMundoCobra(peca, comMemoria({}, peca, { ...mm, relogio: peca.relogio.cheio })).memoria;
t("o pior tem teto, por mais que o mundo cobre", mm.pior === RELOGIO_DAS_PECAS.tetoDoPior && mm.cobrou === 7);
const cf = oMundoCobra(fera, comMemoria({}, fera, { relogio: fera.relogio.cheio }));
t("na besta, o preço é o alerta (o vilão sabe)", cf.preco.id === "alerta" && cf.preco.efeitos.some((e) => e.tipo === "avisa_vilao"));
t("sem nenhuma de duas faces, a forçada é a primeira que fecha", cf.forcada === "lutar@alvo");
t("lixo não lança", oMundoCobra(null, E) === null && oMundoCobra({ solucoes: [] }, E) === null);

sec("§5 a memória");
t("lixo dá a memória vazia", J(garantirMemoria("x")) === J({ calor: {}, abertas: {}, relogio: 0, cobrou: 0, pior: 0, forcada: null, queimadas: [], falhas: {} }));
t("negativos e lixo dentro caem", J(garantirMemoria({ calor: { a: -2, b: 3 }, relogio: -1 }).calor) === J({ b: 3 }) && garantirMemoria({ relogio: -1 }).relogio === 0);
const E0 = Object.freeze({ dia: 3, pecas: Object.freeze({}) });
const E1 = comMemoria(E0, peca, { relogio: 2 });
t("comMemoria substitui, não muta", E1 !== E0 && J(E0.pecas) === "{}" && E1.pecas[chaveDaPeca(peca)].relogio === 2 && E1.dia === 3);
t("a chave é quest|etapa", chaveDaPeca(peca) === "molde|conversou");

console.log(`\n${bons} ok, ${maus} falha(s)`);
process.exit(maus ? 1 : 0);
