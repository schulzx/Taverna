/* entrega-bloco.mjs (Fase T1-A, 8.ª fatia, 28/10/2026) — os cinco últimos pedaços do aplicarResposta, corridos em Node

   Não é suíte: é a ferramenta que as duas pontas da prova usam.

   - `gerar-entrega-dourado.mjs` recorta do App de ANTES (a9ef8cf, o último
     em que os cinco moravam inteiros no `aplicarResposta`) a nêmesis na
     narração, os vistos do elenco, o trabalho pendente, a queda a zero e a
     entrega com o portão, à letra — com os dois órgãos que eles chamam
     (`conferirNemesisNaNarrativa` e `resolverQueda`) —, e corre-os sobre
     os casos.
   - `teste-motor-entrega.mjs` recorta do App de HOJE a fiação que ficou —
     as cinco chamadas ao motor e o invólucro `resolverQueda` — e corre-a,
     com as peças puras, sobre os mesmos casos.

   As duas pontas leem e escrevem os MESMOS dublês: refs como objetos
   simples, os módulos de verdade, e as portas que não são deste bloco
   (encerrar a nêmesis, a tela, a ficha, o relógio do desfecho) como dublês
   declarados que tocam nos refs e na tela — para que uma porta chamada fora
   de ordem, ou uma linha escrita antes da hora, mude a foto. */
import { createHash } from "node:crypto";
import { casoDoCombate, sorteDoCaso } from "./combate-casos.mjs";
import * as dadivas from "../src/dadivas.js";
import * as tracos from "../src/tracos.js";
import * as gatilhos from "../src/gatilhos.js";
import * as combate from "../src/combate.js";
import * as heroismo from "../src/heroismo.js";
import * as elenco from "../src/elenco.js";
import * as motorAplicar from "../src/motor/aplicar.js";
import * as motorEntrega from "../src/motor/entrega-do-turno.js";

const NOMES = {
  dadivas: ["segundoFolegoDisponivel", "gastarSegundoFolego"],
  tracos: ["firmeDisponivel", "gastarFirme"],
  gatilhos: ["seguraEmPe", "gastarSegura"],
  combate: ["testeDeMorte", "aplicarTesteMorte"],
  heroismo: ["ganharHeroismo"],
  elenco: ["vistosDaNarrativa"],
  motorAplicar: ["notaComOTurno"],
  motorEntrega: ["aNemesisNaNarrativa", "osVistosDaNarrativa", "oTrabalhoPendente", "aQueda", "aEntrega"],
};
const MODULOS = { dadivas, tracos, gatilhos, combate, heroismo, elenco, motorAplicar, motorEntrega };
function osModulos({ novo }) {
  const o = {};
  for (const [mod, lista] of Object.entries(NOMES)) {
    /* o lado de antes não conhece a peça de hoje: se o recorte a chamasse, estouraria */
    if (!novo && mod === "motorEntrega") continue;
    for (const n of lista) {
      if (!(n in MODULOS[mod])) throw new Error(`${mod} não exporta ${n}`);
      o[n] = MODULOS[mod][n];
    }
  }
  return o;
}

/* ---------------- O RECORTE ---------------- */
const corteDe = (app) => (de, ate) => {
  const i0 = app.indexOf(de);
  if (i0 < 0) throw new Error("não está onde estava: " + de.slice(0, 70));
  if (app.indexOf(de, i0 + 1) >= 0) throw new Error("ambíguo: " + de.slice(0, 70));
  const i1 = app.indexOf(ate, i0 + de.length);
  if (i1 < 0) throw new Error("o fim não está onde estava: " + ate.slice(0, 70));
  return app.slice(i0, i1);
};
const QUEDA_DE = "  const resolverQueda = (pers, msgs = []) => {";
const QUEDA_ATE = "  /* ============================================================\n     A PORTA ÚNICA DO DANO";
const CODEX = "    /* ---------------- O CÓDEX, NO MOTOR";
const PERIGO = "    /* ---------------- O PERIGO DA RESPOSTA, NO MOTOR";
const QUEDA_BLOCO = "    {\n      const antes = pers;\n      pers = resolverQueda(pers, msgs);";
export const BLOCOS = ["nemesis", "vistos", "trabalho", "queda", "entrega"];
export function recorteDeAntes(app) {
  const corte = corteDe(app);
  return {
    orgaos: [corte("  const conferirNemesisNaNarrativa = (narrativa) => {", "  /* O que o Mestre lê sobre ela em TODO turno"), corte(QUEDA_DE, QUEDA_ATE)].join("\n"),
    nemesis: corte("    try { conferirNemesisNaNarrativa(resp.narrativa); }", "    try { elencoSaveRef.current = vistosDaNarrativa("),
    vistos: corte("    try { elencoSaveRef.current = vistosDaNarrativa(", CODEX),
    trabalho: corte("    if ((trabalhoPendenteRef.current || []).length) {", "    /* ---- CAIR A ZERO (v9.41) ----"),
    queda: corte(QUEDA_BLOCO, "    /* A ENTREGA. Sem violação"),
    entrega: corte("    /* A ENTREGA. Sem violação", PERIGO),
  };
}
export function recorteDeHoje(app) {
  const corte = corteDe(app);
  return {
    orgaos: corte(QUEDA_DE, QUEDA_ATE),
    nemesis: corte("    try {\n      const daNemesis = aNemesisNaNarrativa(", "    {\n      const dosVistos = osVistosDaNarrativa("),
    vistos: corte("    {\n      const dosVistos = osVistosDaNarrativa(", CODEX),
    trabalho: corte("    {\n      const doTrabalho = oTrabalhoPendente(", QUEDA_BLOCO),
    queda: corte(QUEDA_BLOCO, "    {\n      const daEntrega = aEntrega("),
    entrega: corte("    {\n      const daEntrega = aEntrega(", PERIGO),
  };
}
/* um recorte vira uma função (resp, pers, msgs) → { pers }, com os dublês no escopo */
export function blocoComoFuncao(orgaos, bloco) {
  const corpo = `with (S) { return function (resp, pers, msgs) {\n${orgaos}\n${bloco}\nreturn { pers };\n}; }`;
  return (S) => new Function("S", corpo)(S);
}

/* ---------------- OS CASOS ----------------
   A NÊMESIS: nenhuma, viva e citada, viva e morta na frase, a morte negada
   ("quase"), a já derrotada citada (com e sem o dia), o nome com acento, o
   nome torto (que estoura).
   OS VISTOS: a gente da cena com nome curto, o registo vazio, o estado sem
   nada, o dia.
   O TRABALHO: nulo, vazio, uma e duas linhas.
   A QUEDA: de pé, de pé com contadores, morto, a marca do giro, estável, o
   segundo fôlego (livre e gasto hoje), quem segura de pé, a fúria do
   Meio-orc, a primeira queda e as seguintes rente aos três desfechos.
   A ENTREGA: sem portão, portão vazio, portão com violação; a narração
   vazia. */
const VARKA = "Varka Dente-Negro";
const NEMESES = [
  null,
  { nome: VARKA, status: "ativa" },
  { nome: VARKA, status: "derrotada", mortaEm: 12, comoMorreu: "na ponte, pela lâmina de Ilka" },
  { nome: VARKA, status: "derrotada" },
  { nome: "" },
  { nome: "Ôlmo Pálido", status: "ativa" },
  { nome: 5, status: "ativa" },
];
const NARRATIVAS = [
  "",
  "…",
  "Varka Dente-Negro observa do alto da torre.",
  "Varka Dente-Negro cai sem vida aos teus pés.",
  "Varka Dente-Negro quase morre, mas foge pela janela.",
  "A lâmina entra. Varka dente-negro morreu ali mesmo!\nO silêncio volta.",
  "Olmo Palido expira no chão frio; Brás olha.",
  "Brás e Ilka conversam com Tomé na praça, e Al ri.",
  "O corpo dele estende-se. Varka Dente-Negro, o corpo dele frio na lama.",
  "Ninguém fala de Varka Dente-Negro; Brás apenas olha.",
  "Ôlmo Pálido sorri; Ilka degola o guarda.",
];
const NPCS = [
  { "Brás": { nome: "Brás" }, "Ilka": { nome: "Ilka" }, "Tomé": { nome: "Tomé" }, "Al": { nome: "Al" } },
  {},
  null,
];
const ELENCOS = [null, { vistos: { "Brás": 3 } }, { vistos: { "Ilka": 1, "Tomé": 9 }, promovidos: [] }, {}];
const TRABALHOS = [null, [], ["📋 Ubba tem um trabalho no mural."], ["📋 Ubba tem um trabalho no mural.", "📋 Sava procura quem escolte a carga."], undefined];
const rolagens = (n) => Array.from({ length: n }, (_, j) => ({ rolo: 3 + j, tipo: j % 2 ? "falha" : "sucesso", texto: `${3 + j}` }));
function fichaDaQueda(i, dia) {
  const base = { nome: "Vera Cinza", nivel: 1 + (i % 9), vidaMax: [20, 25, 7, 30][i % 4], heroismo: i % 4 };
  switch (i % 13) {
    case 0: return { ...base, vida: 5 };
    case 1: return { ...base, vida: 5, morrendo: true, morte: { sucessos: 1, falhas: 2, rolagens: rolagens(3) } };
    case 2: return { ...base, vida: 0, morto: true, morte: { sucessos: 0, falhas: 3 } };
    case 3: return { ...base, vida: 0, morrendo: true, morte: { sucessos: 1, falhas: 1 } };
    case 4: return { ...base, vida: 0, morrendo: true, morte: { sucessos: 0, falhas: 0, rolagens: [], estavel: true } };
    case 5: return { ...base, vida: 0, dadivasUnicas: [{ nome: "Fôlego da Pedra", efeito: { segundoFolego: 1 } }], dadivaGastos: { folegoDia: dia - 1 } };
    case 6: return { ...base, vida: 0, dadivasUnicas: [{ nome: "Fôlego da Pedra", efeito: { segundoFolego: 1 } }], dadivaGastos: { folegoDia: dia }, raca: "Meio-orc" };
    case 7: return { ...base, vida: -1, habilidades: [{ nome: "Indomável", descricao: "Ao cair a 0 PV, continua de pé por 1 turno." }] };
    case 8: return { ...base, vida: 0, raca: "Meio-orc", tracoGastos: i % 2 ? { firmeDia: dia } : {} };
    case 9: return { ...base, vida: 0 };
    case 10: return { ...base, vida: -3, morrendo: true, morte: { sucessos: 2, falhas: 1, rolagens: rolagens(3) } };
    case 11: return { ...base, vida: 0, morrendo: true, morte: { sucessos: 0, falhas: 2 } };
    default: return { ...base, vida: 0, morrendo: true, morte: { sucessos: 2, falhas: 2, rolagens: rolagens(8) } };
  }
}
export function casoDaEntrega(i) {
  const k = casoDoCombate(i);
  const dia = 1 + (i % 40);
  return {
    i, semente: k.semente, ponto: k.ponto, notaAntes: k.notaAntes, dia,
    narrativa: NARRATIVAS[i % NARRATIVAS.length],
    nemesis: NEMESES[i % NEMESES.length],
    npcs: NPCS[i % NPCS.length],
    elenco: ELENCOS[i % ELENCOS.length],
    trabalho: TRABALHOS[i % TRABALHOS.length],
    pers: i % 61 === 30 ? null : fichaDaQueda(i, dia),
    /* a marca do giro: o revide já rolou este zero (o caso 3 da queda sempre; outros às vezes) */
    morteRolada: i % 13 === 3 || i % 17 === 4,
    portao: [null, [], [{ tipo: "morte", quem: "Brás" }]][i % 3],
    seguraAntes: i % 4 === 1 ? [{ autor: "sistema", texto: "linha presa" }] : null,
    entregaAntes: i % 5 === 2 ? [{ autor: "mestre", texto: "a cena de antes" }] : null,
    msgsAntes: i % 2 ? ["uma linha que o turno já tinha"] : [],
  };
}

/* ---------------- OS DUBLÊS ---------------- */
const copia = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
const ref = (v) => ({ current: v });
export function dublesDaEntrega(k, { novo, sorte, extras }) {
  const log = { tela: [], fichas: [], encerradas: [], relogio: [], desfechos: 0, calados: [] };
  const S = {
    ...osModulos({ novo }),
    nemesisRef: ref(copia(k.nemesis)), notaRef: ref(k.notaAntes), elencoSaveRef: ref(copia(k.elenco)), npcsRef: ref(copia(k.npcs)), diaRef: ref(k.dia),
    trabalhoPendenteRef: ref(copia(k.trabalho)), morteRoladaRef: ref(k.morteRolada), personagemRef: ref({ nome: "a ficha do ref" }),
    portaoRef: ref(copia(k.portao)), seguraRef: ref(copia(k.seguraAntes)), entregaRef: ref(copia(k.entregaAntes)),
    pushMsgs: (xs) => log.tela.push(copia(xs)), setPersonagem: (p) => log.fichas.push(copia(p)), calou: (onde, e) => log.calados.push([onde, String(e && e.message)]),
    sorteDoTurno: sorte || sorteDoCaso(k),
    /* ENCERRAR A NÊMESIS (dublê de encerrarNemesis): lê a nota no instante e escreve nela e no ref */
    encerrarNemesis: (causa) => {
      log.encerradas.push(copia({ causa, nota: S.notaRef.current }));
      S.nemesisRef.current = { ...S.nemesisRef.current, status: "derrotada", comoMorreu: causa };
      S.notaRef.current = `${S.notaRef.current ? S.notaRef.current + "\n" : ""}[NÊMESIS ENCERRADA] ${causa}`;
      return true;
    },
    /* o relógio do desfecho: guarda o atraso e corre já (a tela que abre) */
    setTimeout: (fn, ms) => { log.relogio.push(ms); fn(); return 0; },
    abrirDesfechoDaMorte: () => { log.desfechos++; },
    ...(extras || {}),
  };
  return { S, log };
}

/* corre um bloco (de antes ou de hoje) sobre um caso, e fotografa */
export function correrOBloco(fazer, k, { novo, sorte, extras } = {}) {
  const { S, log } = dublesDaEntrega(k, { novo, sorte, extras });
  const msgs = copia(k.msgsAntes);
  let ret = null, erro = null;
  try { ret = fazer(S)({ narrativa: k.narrativa }, copia(k.pers), msgs); } catch (e) { erro = String(e && e.message); }
  const refs = {};
  for (const [nome, v] of Object.entries(S)) if (/Ref$/.test(nome) && v && typeof v === "object" && "current" in v) refs[nome] = v.current;
  return { ret, msgs, erro, refs, log };
}

/* A FOTO. O que o bloco deixou nos refs, na tela, nas portas e nas linhas
   do turno, e a ficha que volta.
   O QUE CALAVA EM SILÊNCIO e hoje vai ao `calou`: o cão de guarda da
   nêmesis tinha um `catch` vazio, e a fiação nova (lei da casa: toda
   fiação em `calou`) diz o erro com o nome dele. O resto do turno é o
   mesmo dos dois lados, e por isso a foto não leva esse `calou` — mas a
   suíte confere à parte que ele chega quando o de antes calava. */
export const CALOU_NOVO = ["a nêmesis na narração"];
export function fotoDaEntrega(f) {
  const calados = f.log.calados.filter(([onde]) => !CALOU_NOVO.includes(onde));
  const tudo = { refs: f.refs, msgs: f.msgs, log: { ...f.log, calados }, pers: f.ret && f.ret.pers, erro: f.erro };
  return {
    msgs: f.msgs, nota: f.refs.notaRef, erro: f.erro, calados, tela: f.log.tela.map((xs) => xs.map((m) => m.texto)),
    tudo: createHash("sha256").update(JSON.stringify(tudo)).digest("hex"),
  };
}
export const casosDaEntrega = (n) => Array.from({ length: n }, (_, i) => casoDaEntrega(i));
