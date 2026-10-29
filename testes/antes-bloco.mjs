/* antes-bloco.mjs (Fase T1-A, 8.ª fatia, 28/10/2026) — o que corre antes do Mestre, corrido em Node

   Não é suíte: é a ferramenta que as duas pontas da prova usam.

   - `gerar-antes-dourado.mjs` recorta do App de ANTES (aac1912, o último em
     que os quatro moravam inteiros no App) o turno do mundo
     (`marcarTurnoDoMundo`), a porta dele no `agirInterno`, o chão da cena
     (`cenaDoChao`, `varrerChao`, `porNoChaoAqui`) e a escuta do `enviar`
     (o pedido e o passo), à letra, e corre-os sobre os casos.
   - `teste-motor-antes-do-mestre.mjs` recorta do App de HOJE a fiação que
     ficou e corre-a, com as peças puras, sobre os mesmos casos.

   As duas pontas leem e escrevem os MESMOS dublês: refs como objetos
   simples, os módulos de verdade, e as portas que não são deste bloco (os
   relógios que tiquetaqueiam, o mundo que se mexe sozinho, os minutos, a
   tela) como dublês declarados que tocam nos refs e na nota — para que uma
   porta chamada fora de ordem mude a foto. */
import { createHash } from "node:crypto";
import * as abertura from "../src/abertura.js";
import * as chao from "../src/chao.js";
import * as escuta from "../src/escuta.js";
import * as perguntas from "../src/perguntas.js";
import * as motorAplicar from "../src/motor/aplicar.js";
import * as motorAntes from "../src/motor/antes-do-mestre.js";

const NOMES = {
  abertura: ["andarOSino"],
  chao: ["varrerSeMudou", "porNoChao"],
  escuta: ["lerOPedido", "fioDaHistoria", "seguraOMundo", "degrauDaEscuta", "garantirEscuta", "andarAEscuta", "contarOAvanco"],
  perguntas: ["soPergunta"],
  motorAplicar: ["notaComOTurno"],
  motorAntes: ["oRelogioDoMundo", "oSinoDoTurno", "oChaoDaCena", "oPedidoDaEscuta", "aEscutaAnda", "oMundoAndaNoTurno"],
};
const MODULOS = { abertura, chao, escuta, perguntas, motorAplicar, motorAntes };
function osModulos({ novo }) {
  const o = {};
  for (const [mod, lista] of Object.entries(NOMES)) {
    if (!novo && mod === "motorAntes") continue;
    for (const n of lista) {
      if (!(n in MODULOS[mod])) throw new Error(`${mod} não exporta ${n}`);
      o[n] = MODULOS[mod][n];
    }
  }
  /* o App importa a assinatura com outro nome, para o invólucro manter o seu */
  if (novo) o.cenaDoChaoDe = motorAntes.cenaDoChao;
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
const MUNDO = ["  const marcarTurnoDoMundo = () => {", "  /* ---------------- A CONSULTA AO BIBLIOTECARIO"];
const CHAO = ["  const cenaDoChao = () => ", "  /* ORÇAMENTO DO DIA (v9.19)"];
const FIM_DA_PORTA = "    setEntrada(\"\"); apagarORascunho();";
const FIM_DO_PEDIDO = "    const doCompasso = talvezAndarOCompasso(";
const FIM_DO_PASSO = "    const corpo = nota ? ";
export const BLOCOS = ["mundo", "porta", "chao", "escuta"];
const CHAMADAS = {
  mundo: "marcarTurnoDoMundo();",
  /* (trilha A, 29/10, o pedido no motor) a escuta que ANDA saiu de `enviar`
     com o trecho da pauta ao system: é src/motor/pedido-do-turno.js, provada
     byte a byte contra o recorte do App em teste-motor-pedido-do-turno.mjs
     (com a mordida «a escuta que não corta»). O bloco de hoje leva a mesma
     chamada, à letra do App de 60128a3, para a escuta continuar inteira aqui
     (o pedido do App + o passo do motor) contra o dourado de aac1912. */
  escutaAnda: "    try {\n      const anda = aEscutaAnda({ escuta: escutaRef.current, missoes: missoesRef.current, espinha: espinhaRef.current, combate: combateRef.current }, { pedido: pedidoEsc, fio: fioEsc });\n      escutaRef.current = anda.escuta;\n      if (anda.erro) calou(\"a escuta anda\", anda.erro);\n    } catch (e) { calou(\"a escuta anda\", e); }\n",
  chao: "const c1 = varrerChao(); const c2 = porNoChaoAqui(novosNoChao); voltou.chao = { mesmo: c1 === chaoAntes, c1, c2 };",
};
export function recorteDeAntes(app) {
  const corte = corteDe(app);
  return {
    mundo: { orgaos: corte(...MUNDO), bloco: CHAMADAS.mundo },
    porta: { orgaos: "", bloco: corte("    if (!combateRef.current && !acampadoRef.current && !masmorraRef.current && !(() => {", FIM_DA_PORTA) },
    chao: { orgaos: corte(...CHAO), bloco: CHAMADAS.chao },
    escuta: { orgaos: "", bloco: corte("    let pedidoEsc = null, fioEsc = [], segurarEsc = false;", FIM_DO_PEDIDO) + corte("    try {\n      if (pedidoEsc) escutaRef.current = andarAEscuta(", FIM_DO_PASSO) },
  };
}
export function recorteDeHoje(app) {
  const corte = corteDe(app);
  return {
    mundo: { orgaos: corte(...MUNDO), bloco: CHAMADAS.mundo },
    porta: { orgaos: "", bloco: corte("    /* (T1-A, 8.ª fatia) a pergunta \"o mundo anda neste turno?\"", FIM_DA_PORTA) },
    chao: { orgaos: corte(...CHAO), bloco: CHAMADAS.chao },
    escuta: { orgaos: "", bloco: corte("    /* (T1-A, 8.ª fatia) a escuta lê o pedido e anda no motor", FIM_DO_PEDIDO) + CHAMADAS.escutaAnda },
  };
}
/* um recorte vira uma função () → o que o bloco deixou nas variáveis dele, com os dublês no escopo */
export function blocoComoFuncao({ orgaos, bloco }) {
  const corpo = `with (S) { return function () {\nconst voltou = {};\nlet extraTempo = "";\n${orgaos}\n${bloco}\nvoltou.extraTempo = extraTempo;\nif (typeof pedidoEsc !== "undefined") voltou.escuta = { pedidoEsc, fioEsc, segurarEsc };\nreturn voltou;\n}; }`;
  return (S) => new Function("S", corpo)(S);
}

/* ---------------- OS CASOS ----------------
   O MUNDO: na luta (parado), fora dela com o contador par e ímpar, no
   acampamento e na masmorra (o mundo não se mexe), a raid (o sino pausa), e
   o sino longe do piso, no prenúncio, no toque, já tocado e legado; a gente
   conhecida a crescer; o lugar novo e o já visitado; a missão que andou.
   A PORTA: a frase de exploração, a pergunta, a luta, o acampamento.
   O CHÃO: a mesma cena, outra cena com e sem itens, o chão vazio, o dia
   que vira; o que cai no chão.
   A ESCUTA: Uma Vida e Uma Noite; a pergunta, a ação, o envelope do
   sistema, a leitura de um pergaminho; o degrau alto e o baixo; a luta. */
const ABERTURA = {"v":1,"principalId":"mis_principal","cidade":"Ponte do Martelo","chegada":"à porta de Ponte do Martelo, com a poeira da estrada ainda na roupa","razao":"alguém a quem devia a vida pediu-lhe, antes de morrer, que fosse a Ponte do Martelo atrás do que a Guarnição dos Andarilhos guarda","sabe":"Doran o Manco, recruta, é quem, nesta cidade, sabe mais do que a Guarnição dos Andarilhos guarda; encontra-se na Guarnição dos Andarilhos","historia":"Ponte do Martelo vive do que os outros trazem para vender aqui","titulo":"O que A Guarnição dos Andarilhos guarda","pista":{"nome":"Doran o Manco","papel":"recruta","local":"A Guarnição dos Andarilhos"},"alvo":{"feitio":"descobrir","quem":"","onde":"A Guarnição dos Andarilhos","alvo":"","objeto":"o que a Guarnição dos Andarilhos guarda","origem":"Agulha de Sal"},"sinal":"o sino","porta":"uma medalha de cobre de visitante, devolvida na saída","turnos":0,"semAvanco":0,"feitas":0,"conhecidos":0,"visitados":[],"cheios":0,"prenunciado":false,"tocou":false,"prenunciadoEm":null,"tocouEm":null,"oQueTocou":""};
const MISSAO = (feitas) => ({ id: "mis_principal", titulo: "O que A Guarnição dos Andarilhos guarda", tipo: "principal", dador: "", status: "ativa", etapas: [{ tipo: "falar_com", alvo: "Doran o Manco", onde: "A Guarnição dos Andarilhos", feito: feitas > 0 }, { tipo: "revelar", alvo: "A Guarnição dos Andarilhos", onde: "A Guarnição dos Andarilhos", feito: feitas > 1 }], prazo: 0, nivel: 1, recompensa: { moedas: 81, xp: 128 }, criadaEm: 1 });
const ESPINHA = (n) => ({ estrutura: "jornada", semente: "s", fio: {}, atos: [{ marcos: [{ id: "espinha|0|0", feito: n > 0 }, { id: "espinha|0|1", feito: n > 1 }] }, { marcos: [{ id: "espinha|1|0", feito: false }] }] });
const FRASES = [
  "caminho pelas ruas",
  "vou até o poço",
  "Quem é Doran o Manco?",
  "O que a Guarnição dos Andarilhos guarda?",
  "leio o pergaminho de novo",
  "[ENVELOPE DO SISTEMA] a abertura",
  "falo com Doran o Manco sobre a Guarnição dos Andarilhos",
  "",
  "ataco o lobo",
  "onde fica a casa de muda? vou até lá.",
];
const LUGARES = [null, { nome: "a casa de muda" }, { nome: "A Guarnição dos Andarilhos" }, { nome: "a praça" }];
const sinoDoCaso = (i) => {
  const t = [0, 3, 11, 12, 15, 30][i % 6];
  const c = [0, 3, 6, 7, 7, 8][(i >> 1) % 6];
  return {
    ...ABERTURA, turnos: t, cheios: c, semAvanco: [0, 5, 8, 9][i % 4], feitas: i % 7 === 3 ? 1 : 0,
    conhecidos: i % 3, visitados: i % 4 === 1 ? ["a casa de muda"] : [],
    prenunciado: i % 9 === 4, tocou: i % 23 === 11, ...(i % 29 === 7 ? { legado: true } : {}),
  };
};
export function casoDoAntes(i) {
  const npcs = Object.fromEntries(["Doran o Manco", "Piotr Ventoforte", "Ilka", "Sava"].slice(0, i % 5).map((n) => [n, { nome: n }]));
  return {
    i,
    combate: i % 11 === 5 ? { inimigos: [{ nome: "Lobo" }], rodada: 1 } : null,
    acampado: i % 13 === 6, masmorra: i % 17 === 8 ? { nome: "a cripta" } : null, raid: i % 19 === 9 ? { nome: "o forte" } : null,
    turnosDeMundo: i % 6,
    abertura: i % 31 === 0 ? null : sinoDoCaso(i),
    missoes: i % 8 === 0 ? [] : [MISSAO((i >> 2) % 3)],
    espinha: i % 5 === 0 ? null : ESPINHA(i % 3),
    lugar: LUGARES[i % LUGARES.length],
    cidadeAtual: i % 10 === 4 ? "Agulha de Sal" : i % 21 === 3 ? null : "Ponte do Martelo",
    npcs,
    dia: 1 + (i % 4), minuto: 480 + (i % 7) * 45,
    frase: FRASES[i % FRASES.length],
    modo: i % 14 === 7 ? "rapida" : "historia",
    escuta: i % 6 === 0 ? null : { semAvanco: [0, 1, 3, 6, 9][i % 5], etapas: (i >> 3) % 2, marcos: i % 2 },
    chao: i % 7 === 0 ? null : { cena: ["", "Ponte do Martelo||1", "Ponte do Martelo|a casa de muda|1", "Ponte do Martelo|a casa de muda|2"][i % 4], itens: i % 3 === 0 ? [] : [{ id: `it${i}`, nome: "Corda" }] },
    novosNoChao: i % 4 === 2 ? [{ id: `novo${i}`, nome: "Adaga" }] : i % 4 === 3 ? [] : null,
    notaAntes: i % 2 ? "[NOTA DE ANTES]" : "",
  };
}

/* ---------------- OS DUBLÊS ---------------- */
const copia = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
const ref = (v) => ({ current: v });
export function dublesDoAntes(k, { novo }) {
  const log = { tela: [], tiques: [], mexeu: [], minutos: [], mundos: 0, calados: [], chaoTela: [] };
  const S = {
    ...osModulos({ novo }),
    useRef: ref,
    combateRef: ref(copia(k.combate)), acampadoRef: ref(k.acampado), masmorraRef: ref(copia(k.masmorra)), raidRef: ref(copia(k.raid)),
    turnosDeMundoRef: ref(k.turnosDeMundo), aberturaMundoRef: ref(copia(k.abertura)), missoesRef: ref(copia(k.missoes)), espinhaRef: ref(copia(k.espinha)),
    lugarRef: ref(copia(k.lugar)), cidadeAtualRef: ref(k.cidadeAtual), npcsRef: ref(copia(k.npcs)), diaRef: ref(k.dia), minutoRef: ref(k.minuto),
    sinoDoTurnoRef: ref(null), notaRef: ref(k.notaAntes), modoRef: ref(k.modo), escutaRef: ref(copia(k.escuta)), chaoRef: ref(copia(k.chao)),
    desdeMundoRef: ref(3),
    pushMsgs: (xs) => log.tela.push(copia(xs)), calou: (onde, e) => log.calados.push([onde, String(e && e.message)]),
    setChao: (c) => log.chaoTela.push(copia(c)),
    /* OS RELÓGIOS (dublê de tiquear): leem o contador e a nota no instante */
    tiquear: (gatilho, o) => { log.tiques.push(copia({ gatilho, porque: o && o.porque, turnos: S.turnosDeMundoRef.current })); },
    /* O MUNDO QUE SE MEXE (dublê de talvezOMundoSeMexer): conta, e às vezes puxa um fio para a nota */
    talvezOMundoSeMexer: () => {
      log.mexeu.push(copia({ turnos: S.turnosDeMundoRef.current, abertura: S.aberturaMundoRef.current && S.aberturaMundoRef.current.turnos }));
      S.desdeMundoRef.current += 1;
      if (k.i % 3 === 1) { S.desdeMundoRef.current = 0; S.notaRef.current = `${S.notaRef.current ? S.notaRef.current + "\n" : ""}[O MUNDO SE MEXEU]`; }
    },
    /* a porta: os minutos e o turno do mundo, que a porta chama */
    MINUTOS_POR_TURNO: 45,
    avancarMinutos: (n) => { log.minutos.push(n); return `(+${n} min)`; },
    marcarTurnoDoMundo: undefined,
    acao: k.frase, conteudo: k.frase, novosNoChao: copia(k.novosNoChao), chaoAntes: null,
  };
  S.chaoAntes = S.chaoRef.current;
  return { S, log };
}

/* corre um bloco (de antes ou de hoje) sobre um caso, e fotografa */
export function correrOBloco(fazer, k, { novo, bloco } = {}) {
  const { S, log } = dublesDoAntes(k, { novo });
  /* na porta, o turno do mundo é o dublê (o do bloco "mundo" prova-se à parte) */
  if (bloco === "porta") S.marcarTurnoDoMundo = () => { log.mundos++; };
  let ret = null, erro = null;
  try { ret = fazer(S)(); } catch (e) { erro = String(e && e.message); }
  const refs = {};
  for (const [nome, v] of Object.entries(S)) if (/Ref$/.test(nome) && v && typeof v === "object" && "current" in v) refs[nome] = v.current;
  return { ret, erro, refs, log };
}

/* A FOTO: os refs, as portas, a tela, o que o bloco deixou nas variáveis dele */
export function fotoDoAntes(f) {
  const tudo = { refs: f.refs, log: f.log, ret: f.ret, erro: f.erro };
  return {
    nota: f.refs.notaRef, erro: f.erro, calados: f.log.calados,
    abertura: f.refs.aberturaMundoRef && { turnos: f.refs.aberturaMundoRef.turnos, cheios: f.refs.aberturaMundoRef.cheios, tocou: f.refs.aberturaMundoRef.tocou },
    tela: f.log.tela.map((xs) => xs.map((m) => m.texto)),
    tudo: createHash("sha256").update(JSON.stringify(tudo)).digest("hex"),
  };
}
export const casosDoAntes = (n) => Array.from({ length: n }, (_, i) => casoDoAntes(i));
