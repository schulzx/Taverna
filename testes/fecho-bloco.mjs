/* fecho-bloco.mjs (Fase T1-A, 7.ª fatia, 28/10/2026) — o perigo e a quase-morte do aplicarResposta, corridos em Node

   Não é suíte: é a ferramenta que as duas pontas da prova usam.

   - `gerar-fecho-dourado.mjs` recorta do App de ANTES (3ec3364, o último
     em que os dois blocos moravam inteiros no `aplicarResposta`) o bloco
     do perigo e o da quase-morte, à letra, e corre-os sobre os casos.
   - `teste-motor-fecho.mjs` recorta do App de HOJE a fiação que ficou — as
     portas do fecho, as duas chamadas ao motor — e corre-a, com as peças
     puras, sobre os mesmos casos.

   As duas pontas leem e escrevem os MESMOS dublês: refs como objetos
   simples; os dois órgãos que os blocos chamam e que têm invólucro no App
   (`bumpCont`, `aplicarVinculo`) recortados à letra dos dois Apps; e os
   que não têm peça pura (abrir a luta, a salvaguarda do perigo, as
   conquistas) como dublês declarados que tocam nos refs e na tela — para
   que uma porta chamada fora de ordem, ou uma linha escrita antes da hora,
   mude a foto. */
import { createHash } from "node:crypto";
import { casoDoCombate, sorteDoCaso } from "./combate-casos.mjs";
import * as emboscada from "../src/emboscada.js";
import * as fuga from "../src/fuga.js";
import * as danos from "../src/danos.js";
import * as motorCombate from "../src/motor/combate-do-turno.js";
import * as motorAplicar from "../src/motor/aplicar.js";
import * as motorFecho from "../src/motor/fecho-da-resposta.js";

const NOMES = {
  emboscada: ["montarEmboscada", "falaDaEmboscada", "envelopeDaEmboscada", "envelopeSemCriatura", "envelopeDesproporcional"],
  fuga: ["folegoSegura"],
  danos: ["sortearCicatriz", "CICATRIZ_MAX"],
  motorCombate: ["osVinculos", "somarAoContador"],
  motorAplicar: ["notaComOTurno"],
  motorFecho: ["oPerigoDaResposta", "aQuaseMorte"],
};
const MODULOS = { emboscada, fuga, danos, motorCombate, motorAplicar, motorFecho };
function osModulos({ novo }) {
  const o = {};
  for (const [mod, lista] of Object.entries(NOMES)) {
    /* o lado de antes não conhece a peça de hoje: se o recorte a chamasse, estouraria */
    if (!novo && mod === "motorFecho") continue;
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
const ORGAOS_COMUNS = [
  ["  const bumpCont = (campo, n = 1) =>", "\n"],
  ["  const aplicarVinculo = (grupo, nomeOuTodos, pontos, msgs) => {", "  const checarConquistas = useCallback("],
];
const FIM_DO_PERIGO = "    /* v9.145: aqui morava a leitura do pedido de rolagem";
const FIM_DA_QUASE_MORTE = "    /* ---------------- O TURNO FECHA NA MESA (v9.71)";
/* AS TROCAS DECLARADAS sobre os blocos de antes, com o porquê (quem regera o
   dourado aplica-as; o dourado é o App de antes COM elas; cada uma tem de
   bater uma vez só):
   1. a fala da emboscada e as linhas da porta de abrir vão à TELA, e não à
      lista do turno, que a entrega já tinha posto na tela — 7.ª fatia,
      teste-motor-fecho §2b. */
export const TROCAS_DECLARADAS = {
  perigo: [["msgs.push(falaDaEmboscada(emb), ...ab.msgs);", "pushMsgs([falaDaEmboscada(emb), ...ab.msgs].map((texto) => ({ autor: \"sistema\", texto })));"]],
  quaseMorte: [],
};
const comAsTrocas = (bloco, trocas) => {
  let b = bloco;
  for (const [de, para] of trocas) {
    if (b.split(de).length !== 2) throw new Error("a troca declarada não bate uma vez só: " + de);
    b = b.replace(de, para);
  }
  return b;
};
export function recorteDeAntes(app) {
  const corte = corteDe(app);
  return {
    orgaos: ORGAOS_COMUNS.map(([de, ate]) => corte(de, ate)).join("\n"),
    perigo: comAsTrocas(corte("    try {\n      if (resp.perigo && !combateRef.current) {", FIM_DO_PERIGO), TROCAS_DECLARADAS.perigo),
    quaseMorte: comAsTrocas(corte("    /* CÓDEX: novos companheiros, quase-morte e checagem de conquistas do turno */", FIM_DA_QUASE_MORTE), TROCAS_DECLARADAS.quaseMorte),
  };
}
export function recorteDeHoje(app) {
  const corte = corteDe(app);
  return {
    orgaos: [...ORGAOS_COMUNS.map(([de, ate]) => corte(de, ate)), corte("  const aplicarEfeitoDoFecho = (ef) => {", "  /* ---------------- AS PORTAS DA LUTA DO TURNO")].join("\n"),
    perigo: corte("    try {\n      if (resp.perigo) {\n        const doPerigo = oPerigoDaResposta(", FIM_DO_PERIGO),
    quaseMorte: corte("    try {\n      const daQuaseMorte = aQuaseMorte(", FIM_DA_QUASE_MORTE),
  };
}
/* um recorte vira uma função (resp, pers, persDoEnvio, msgs) → { pers }, com os dublês no escopo */
export function blocoComoFuncao(orgaos, bloco) {
  const corpo = `with (S) { return function (resp, pers, persDoEnvio, msgs) {\n${orgaos}\n${bloco}\nreturn { pers };\n}; }`;
  return (S) => new Function("S", corpo)(S);
}

/* ---------------- OS CASOS ----------------
   O PERIGO: a investida que vira emboscada (de um, de três, de seis), a
   desproporcional, a criatura que o bestiário não tem, a armadilha que vai
   à salvaguarda, o perigo curto demais, nenhum perigo; a luta já aberta; o
   fôlego da fuga (o da resposta, o do lugar com quem ficou para trás, o de
   outro lugar); a porta de abrir que estoura.
   A QUASE-MORTE: a queda a zero (de pé, já caído, levantado), quem chegou
   ao grupo, o companheiro que caiu, o vínculo rente ao marco, as cicatrizes
   rente ao teto, o membro torto no grupo (que estoura). */
const PERIGOS = [
  null,
  "Três bandidos saltam do mato.",
  "Seis ogros avançam sobre você.",
  "Um dragão ancião irrompe das nuvens e avança sobre você.",
  "A Aberração do Sétimo Selo avança sobre você.",
  "Uma armadilha de lâminas dispara do chão.",
  "Dois lobos saltam das sombras.",
  "fogo",
  "Um goblin avança sobre você.",
  "O veneno da agulha escondida na fechadura.",
  "Há bandidos na estrada.",
];
const VINCULOS = [10, 24, 46, 49, 74, 96];
const membro = (i, k, vida) => ({ nome: ["Brás", "Ilka", "Tomé", "Fera Chamada"][k], vida, vidaMax: 15, nivel: 1 + ((i + k) % 4), vinculo: VINCULOS[(i + k) % VINCULOS.length], marcos: [], ...(k === 3 ? { invocada: true } : {}) });
export function casoDoFecho(i) {
  const k = casoDoCombate(i);
  const nGrupo = i % 4;
  const grupoAntes = Array.from({ length: nGrupo }, (_, j) => membro(i, j, 6 + ((i + j) % 9)));
  const vidaAntes = [12, 3, 0, 1, 20][i % 5];
  const vidaAgora = [0, -2, 0, 4, 0, 15, -1][i % 7];
  const recrutou = i % 6 === 2;
  const grupoAgora = [
    ...grupoAntes.map((g, j) => (j === 0 && i % 3 === 1 ? { ...g, vida: 0 } : j === 1 && i % 5 === 3 ? { ...g, vida: -2 } : g)),
    ...(recrutou ? [membro(i, 2, 10), ...(i % 12 === 2 ? [membro(i, 3, 4)] : [])] : []),
  ];
  const torto = i % 31 === 5 ? "envio" : i % 37 === 9 ? "agora" : null;
  return {
    i, semente: k.semente, ponto: k.ponto,
    notaAntes: k.notaAntes,
    /* o perigo */
    perigo: PERIGOS[i % PERIGOS.length],
    combate: i % 4 === 3 ? { inimigos: [{ nome: "Lobo", vida: 5, vidaMax: 8 }], rodada: 2 } : null,
    folego: i % 5 === 1 ? { naResposta: true, lugares: ["a praça"], deixados: [] }
      : i % 5 === 2 ? { lugares: ["a praça"], deixados: ["Bandido", "Lobo", "Ogro"], naResposta: false }
      : i % 5 === 3 ? { lugares: ["o porto"], deixados: ["Bandido"], naResposta: false } : null,
    lugar: i % 2 ? { nome: "a praça" } : { nome: "o porto" },
    abrirEstoura: i % 23 === 7,
    texturaAntes: i % 3 === 0 ? {} : { rolou: true, pilar: "exploracao" },
    msgsAntes: i % 2 ? ["uma linha que o turno já tinha"] : [],
    /* a quase-morte */
    persEnvio: { nome: "Vera Cinza", nivel: 1 + (i % 20), vida: vidaAntes, vidaMax: 20 + (i % 3) * 5, grupo: torto === "envio" ? [null, ...grupoAntes] : grupoAntes },
    persAgora: {
      nome: "Vera Cinza", nivel: 1 + (i % 20), vida: vidaAgora, vidaMax: [20, 25, 30, 6][i % 4], grupo: torto === "agora" ? [...grupoAgora, null] : grupoAgora,
      ...(i % 9 === 0 ? {} : { cicatrizes: Array.from({ length: i % 9 }, (_, j) => ({ nome: `Marca ${j}`, dia: 1 })) }),
    },
    dia: 1 + (i % 40),
    contAntes: { quaseMorte: i % 3, recrutados: i % 4 },
  };
}

/* ---------------- OS DUBLÊS ---------------- */
const copia = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
const ref = (v) => ({ current: v });
export function dublesDoFecho(k, { novo, sorte, extras }) {
  const log = { tela: [], fichas: [], abertos: [], disparados: [], conquistas: [], calados: [] };
  const S = {
    ...osModulos({ novo }),
    combateRef: ref(copia(k.combate)), folegoRef: ref(copia(k.folego)), notaRef: ref(k.notaAntes), texturaRef: ref(copia(k.texturaAntes)),
    lugarRef: ref(copia(k.lugar)), cidadeAtualRef: ref("Vila do Sul"), diaRef: ref(k.dia), contRef: ref(copia(k.contAntes)),
    pushMsgs: (xs) => log.tela.push(copia(xs)), setPersonagem: (p) => log.fichas.push(copia(p)), calou: (onde, e) => log.calados.push([onde, String(e && e.message)]),
    sorteDoTurno: sorte || sorteDoCaso(k),
    ondeEstou: () => [(S.lugarRef.current && S.lugarRef.current.nome) || "", S.cidadeAtualRef.current || ""].filter(Boolean),
    /* ABRIR A LUTA (dublê de abrirCombate): escreve no ref da luta e na nota
       por conta própria (como a porta de verdade), e devolve a ficha, as
       linhas e a nota que o chamador junta; estoura quando o caso manda */
    abrirCombate: (inimigos, o) => {
      log.abertos.push(copia({ inimigos, situacao: o && o.situacao, nivel: o && o.pers && o.pers.nivel, nota: S.notaRef.current }));
      if (k.abrirEstoura) throw new Error("a porta de abrir estourou");
      S.combateRef.current = { inimigos: copia(inimigos), rodada: 1 };
      S.notaRef.current = `${S.notaRef.current ? S.notaRef.current + "\n" : ""}[A PORTA ABRIU] ${inimigos.length}`;
      return { pers: { ...o.pers, emLuta: inimigos.length }, msgs: [`⚔ Iniciativa: ${inimigos.map((e) => e.nome).join(", ")}`], nota: k.i % 6 === 0 ? "" : "[INICIATIVA ROLADA PELO SISTEMA]" };
    },
    /* A SALVAGUARDA DO PERIGO (dublê de dispararPerigo): lê a textura e a nota, e escreve nas duas e na tela */
    dispararPerigo: (texto) => {
      log.disparados.push(copia({ texto, textura: S.texturaRef.current, nota: S.notaRef.current }));
      S.texturaRef.current = { ...S.texturaRef.current, perigo: true };
      S.pushMsgs([{ autor: "sistema", texto: `🎲 Salvaguarda contra: ${texto}` }]);
      S.notaRef.current = `${S.notaRef.current ? S.notaRef.current + "\n" : ""}[SALVAGUARDA] ${texto}`;
      return null;
    },
    /* AS CONQUISTAS: leem os contadores e a ficha no instante em que são chamadas, e às vezes dizem na tela */
    checarConquistas: (p) => {
      log.conquistas.push(copia({ cont: S.contRef.current, vida: p && p.vida, grupo: p && (p.grupo || []).map((g) => g && [g.nome, g.vinculo]), cicatrizes: p && (p.cicatrizes || []).length, nota: S.notaRef.current }));
      if (k.i % 4 === 1) S.pushMsgs([{ autor: "sistema", texto: "🏆 Conquista desbloqueada" }]);
    },
    ...(extras || {}),
  };
  return { S, log };
}

/* corre um bloco (de antes ou de hoje) sobre um caso, e fotografa */
export function correrOBloco(fazer, k, { novo, sorte, extras, envioIgual } = {}) {
  const { S, log } = dublesDoFecho(k, { novo, sorte, extras });
  const msgs = copia(k.msgsAntes);
  const persAgora = copia(k.persAgora);
  let ret = null, erro = null;
  try { ret = fazer(S)({ narrativa: "…", perigo: k.perigo }, persAgora, envioIgual ? persAgora : copia(k.persEnvio), msgs); } catch (e) { erro = String(e && e.message); }
  const refs = {};
  for (const [nome, v] of Object.entries(S)) if (/Ref$/.test(nome) && v && typeof v === "object" && "current" in v) refs[nome] = v.current;
  return { ret, msgs, erro, refs, log };
}

/* A FOTO. O que o bloco deixou nos refs, na tela, nas portas e nas linhas
   do turno. A ficha que volta entra só quando nada estourou: o App de
   antes, num erro da quase-morte, nem chegava a devolvê-la (o erro subia
   e levava o resto do turno), e o de hoje entrega-o ao `calou` com o nome
   do bloco e segue. Por isso o erro de hoje que foi ao `calou` com esse
   nome é o mesmo erro, e a foto chama-lhe `erro` dos dois lados. */
export const CALOU_DO_FECHO = ["a quase-morte do turno"];
export function fotoDoFecho(f) {
  const calados = f.log.calados.filter(([onde]) => !CALOU_DO_FECHO.includes(onde));
  const doCalou = f.log.calados.find(([onde]) => CALOU_DO_FECHO.includes(onde));
  const erro = f.erro || (doCalou ? doCalou[1] : null);
  const tudo = { refs: f.refs, msgs: f.msgs, log: { ...f.log, calados }, pers: erro ? null : f.ret && f.ret.pers, erro };
  return {
    msgs: f.msgs, nota: f.refs.notaRef, erro, calados, tela: f.log.tela.map((xs) => xs.map((m) => m.texto)),
    tudo: createHash("sha256").update(JSON.stringify(tudo)).digest("hex"),
  };
}
export const casosDoFecho = (n) => Array.from({ length: n }, (_, i) => casoDoFecho(i));
