/* tempo-bloco.mjs (Fase T, trilha A, 28/10/2026) — o tempo do turno, corrido em Node

   Não é suíte: é a ferramenta que as duas pontas da prova usam.

   - `gerar-tempo-dourado.mjs` recorta do App de ANTES (7a0d8b2, o último em
     que o relógio e o passo na cidade moravam inteiros no App) o
     `avancarOsMinutos` (com o `avancarMinutos` ao lado) e o `moverParaLocal`
     (com o `semNome` e o `cidadeSobOsPes` que ele lê), à letra, e corre-os
     sobre os casos.
   - `teste-motor-tempo-do-turno.mjs` recorta do App de HOJE a fiação que
     ficou e corre-a, com as peças puras, sobre os mesmos casos.

   As duas pontas leem e escrevem os MESMOS dublês: refs como objetos
   simples, os módulos de verdade, e as portas que não são deste bloco (o
   dia do reino, as conquistas, os minutos que o passo cobra) como dublês
   declarados que tocam nos refs — para que uma porta chamada fora de ordem
   mude a foto. O escopo é um Proxy: um nome que nenhum dublê dá e que não é
   do JavaScript fica em `faltas` (a suíte exige-o vazio), em vez de cair
   calado. */
import { createHash } from "node:crypto";
import * as lugar from "../src/lugar.js";
import * as calendario from "../src/calendario.js";
import * as invocacoes from "../src/invocacoes.js";
import * as condicoes from "../src/condicoes.js";
import * as motorTempo from "../src/motor/tempo-do-turno.js";
import * as motorEnvelopes from "../src/motor/envelopes-do-turno.js";

const NOMES = {
  lugar: ["pontoDoLugar", "definirLugar", "comEm", "comDe"],
  calendario: ["festivalDe", "dataTxt", "HORAS_AVISO_SONO", "HORAS_EXAUSTO"],
  invocacoes: ["expirarPorMinuto"],
  condicoes: ["criarCondicao"],
  motorTempo: ["osMinutosAndam", "oCorpoNoRelogio", "comAExaustao", "oPassoNaCidade", "aCidadeSobOsPes"],
  /* o festival do dia (11.º grupo dos envelopes, 28/10/2026): o relógio de hoje pede o texto ao motor */
  motorEnvelopes: ["oEnvelopeDoMundo"],
};
const MODULOS = { lugar, calendario, invocacoes, condicoes, motorTempo, motorEnvelopes };
function osModulos({ novo }) {
  const o = {};
  for (const [mod, lista] of Object.entries(NOMES)) {
    if (!novo && (mod === "motorTempo" || mod === "motorEnvelopes")) continue;
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
const RELOGIO = ["  const avancarMinutos = (n) => avancarOsMinutos(n).texto;", "  const mostrarRolagensRef = useRef(true);"];
const PES = ["  const semNome = (s) => ", "  /* Todo lugar a que se pode ir daqui a pé"];
const PASSO = ["  const moverParaLocal = (alvo) => {", "  const talvezAndarNaCidade = (texto) => {"];
export const BLOCOS = ["relogio", "caminhada"];
const CHAMADAS = {
  relogio: "voltou.r = avancarOsMinutos(caso.n, caso.noTurno ? fichaDoCaso : null);",
  caminhada: "voltou.r = moverParaLocal(alvoDoCaso);",
};
/* o recorte é o mesmo nas duas pontas: as âncoras são os nomes dos órgãos,
   que ficaram; muda o que está entre elas */
export function recorteDoTempo(app) {
  const corte = corteDe(app);
  return {
    relogio: { orgaos: corte(...RELOGIO), bloco: CHAMADAS.relogio },
    caminhada: { orgaos: corte(...PES) + corte(...PASSO), bloco: CHAMADAS.caminhada },
  };
}
export function blocoComoFuncao({ orgaos, bloco }) {
  const corpo = `with (S) { return function () {\nconst voltou = {};\n${orgaos}\n${bloco}\nreturn voltou;\n}; }`;
  return (S) => new Function("S", corpo)(S);
}

/* ---------------- OS CASOS ----------------
   O RELÓGIO: os minutos do turno, da caminhada, da viagem e do descanso;
   o dia que vira uma vez e várias, e a véspera de festival; dentro e fora
   da luta; a invocação a vencer e a que ainda tem prazo; a vigília no
   aviso, na Exaustão, já cansado, e o salto que atravessa as 16 h; a ficha
   do turno e a de fora (o ref, e o ref vazio com a do render).
   A CAMINHADA: o cômodo (com prédio e sem ele), o sítio de dentro, o
   arredor com e sem minutos e com coordenada, o lugar onde já está (com e
   sem acento), sem cidade, sem alvo, a cidade fora do mapa. */
const NS = [1, 5, 10, 40, 45, 74, 240, 600, 1440, 3000];
const MINUTOS = [0, 480, 1000, 1400, 1435, 1439, 720];
const DIAS = [1, 2, 34, 35, 90, 365, 120];
const fichaDe = (i, absDepois) => {
  const grupo = [];
  if (i % 3 === 0) grupo.push({ nome: "Lobo Espectral", invocada: true, expiraMin: absDepois - 1 });
  if (i % 5 === 1) grupo.push({ nome: "Corvo", invocada: true, expiraMin: absDepois + 600 });
  if (i % 7 === 2) grupo.push({ nome: "Fera de Osso", invocada: true, expiraMin: absDepois - 30 });
  if (i % 4 === 3) grupo.push({ nome: "Iris", vida: 8, vidaMax: 10 });
  const cond = i % 9 === 4 ? [{ id: "exausto", nome: "Exausto" }] : i % 11 === 6 ? [{ id: "x", nome: "Cansado" }] : i % 6 === 5 ? [{ id: "envenenado", nome: "Envenenado" }] : [];
  return { nome: "Herói", nivel: 1 + (i % 4), vida: 10, vidaMax: 12, grupo, condicoes: cond };
};
export function casoDoTempo(i) {
  const n = NS[i % NS.length];
  const minuto = MINUTOS[(i >> 1) % MINUTOS.length];
  const dia = DIAS[(i >> 2) % DIAS.length];
  const abs0 = (dia - 1) * 1440 + minuto;
  const absDepois = abs0 + n;
  /* a vigília: acordado há quase 16 h, há quase 20, há muito, ou de pouco */
  const acordadoAntesH = [2, 15.5, 19.9, 30, 15.95, 8][i % 6];
  const comAlvo = [
    { nome: "o quarto de cima", onde: "comodo", dentroDe: "A Espada Faiscante" },
    { nome: "a forja", onde: "dentro" },
    { nome: "a casa de muda", onde: "arredores", minutos: 74, coord: { x: 49.9, y: 50.1, z: 0, mx: 0, my: 0 } },
    { nome: "o moinho velho", onde: "arredores" },
    { nome: "o sótão", onde: "comodo" },
    { nome: "a Forjá", onde: "dentro" },
    null,
    { nome: "", onde: "dentro" },
  ][i % 8];
  return {
    i, n, noTurno: i % 3 !== 1,
    refVazio: i % 13 === 7,
    combate: i % 10 === 3 ? { inimigos: [{ nome: "Lobo" }] } : null,
    minuto, dia, acordouAbs: abs0 - Math.round(acordadoAntesH * 60),
    ficha: fichaDe(i, absDepois),
    eventosDoDia: i % 4 === 1 ? [{ cidade: "Ponte do Martelo", evento: { titulo: "Colheita farta", txt: (c) => `os celeiros de ${c} transbordam` } }] : [],
    reino: i % 2 ? { "Ponte do Martelo": { felicidade: 50 + (i % 60) } } : {},
    notaAntes: i % 2 ? "[NOTA DE ANTES]" : "",
    /* a caminhada */
    alvo: comAlvo,
    cidadeAtual: i % 17 === 9 ? null : i % 19 === 4 ? "Cidade Fora do Mapa" : "Ponte do Martelo",
    lugar: i % 5 === 0 ? { nome: "A Forja", cidade: "Ponte do Martelo" } : i % 5 === 2 ? { nome: "a casa de muda" } : null,
    textoDosMinutos: i % 4 === 0 ? "" : `[TEMPO +${n}]`,
  };
}

/* ---------------- OS DUBLÊS ---------------- */
const copia = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
const ref = (v) => ({ current: v });
const MAPA = { cidades: [{ nome: "Ponte do Martelo", x: 50, y: 50 }, { nome: "Agulha de Sal", x: 70, y: 20 }] };
export function dublesDoTempo(k, { novo }) {
  const log = { tela: [], sets: [], dias: [], conquistas: [], minutosPedidos: [], calados: [], faltas: [] };
  const S = {
    ...osModulos({ novo }),
    useRef: ref,
    caso: k,
    minutoRef: ref(k.minuto), diaRef: ref(k.dia), combateRef: ref(copia(k.combate)), acordouAbsRef: ref(k.acordouAbs),
    personagemRef: ref(k.refVazio ? null : copia(k.ficha)), personagem: copia(k.ficha),
    reinoRef: ref(copia(k.reino)), notaRef: ref(k.notaAntes),
    cidadeAtualRef: ref(k.cidadeAtual), lugarRef: ref(copia(k.lugar)), mapaRef: ref(copia(MAPA)),
    fichaDoCaso: copia(k.ficha), alvoDoCaso: copia(k.alvo),
    pushMsgs: (xs) => log.tela.push(copia(xs)),
    calou: (onde, e) => log.calados.push([onde, String(e && e.message)]),
    setMinuto: (m) => log.sets.push(["minuto", m]), setReino: (r) => log.sets.push(["reino", copia(r)]),
    setPersonagem: (p) => log.sets.push(["personagem", copia(p)]), setLugar: (l) => log.sets.push(["lugar", copia(l)]),
    /* a ficha viva e a porta que escreve nos dois lugares (o App, à letra) */
    fichaViva: () => S.personagemRef.current || S.personagem,
    mudarFicha: (fn) => {
      const base = S.personagemRef.current || S.personagem;
      if (!base) return base;
      const novo = typeof fn === "function" ? fn(base) : fn;
      if (!novo) return base;
      S.personagemRef.current = novo; S.setPersonagem(novo);
      return novo;
    },
    absMin: () => (S.diaRef.current - 1) * 1440 + S.minutoRef.current,
    /* A PORTA DO DIA (dublê do avancarDiasReino): o dia anda, e às vezes há um evento no reino */
    avancarDiasReino: (n) => { S.diaRef.current += n; log.dias.push(copia({ n, dia: S.diaRef.current, minuto: S.minutoRef.current })); return k.eventosDoDia; },
    envelopeEventosReino: (evs) => (evs.length ? `[REINO ${evs.map((e) => e.evento.titulo).join(", ")}]` : ""),
    /* as conquistas leem a ficha do ref no instante */
    checarConquistas: () => log.conquistas.push(copia(S.personagemRef.current)),
    /* a caminhada: os minutos que o passo pede (o relógio prova-se à parte) */
    avancarMinutos: (n) => { log.minutosPedidos.push(n); return k.textoDosMinutos; },
  };
  const escopo = new Proxy(S, {
    has: (t, nome) => {
      if (typeof nome !== "string") return false;
      if (nome in t) return true;
      if (nome in globalThis) return false;
      log.faltas.push(nome);
      return true;
    },
    get: (t, nome) => {
      if (nome === Symbol.unscopables) return undefined;
      if (nome in t) return t[nome];
      throw new ReferenceError("falta o dublê: " + String(nome));
    },
    set: (t, nome, v) => { t[nome] = v; return true; },
  });
  return { S, escopo, log };
}

/* corre um bloco (de antes ou de hoje) sobre um caso, e fotografa */
export function correrOBloco(fazer, k, { novo, bloco } = {}) {
  const { S, escopo, log } = dublesDoTempo(k, { novo });
  /* no relógio, o avancarMinutos é o do bloco (o recorte define-o) */
  if (bloco === "relogio") delete S.avancarMinutos;
  let ret = null, erro = null;
  try { ret = fazer(escopo)(); } catch (e) { erro = String(e && e.message); }
  const refs = {};
  for (const [nome, v] of Object.entries(S)) if (/Ref$/.test(nome) && v && typeof v === "object" && "current" in v) refs[nome] = v.current;
  return { ret, erro, refs, log };
}

/* A FOTO: os refs, as portas, a tela, o que o bloco devolveu */
export function fotoDoTempo(f) {
  const tudo = { refs: f.refs, log: f.log, ret: f.ret, erro: f.erro };
  return {
    minuto: f.refs.minutoRef, dia: f.refs.diaRef, nota: f.refs.notaRef, erro: f.erro, calados: f.log.calados, faltas: [...new Set(f.log.faltas)],
    lugar: f.refs.lugarRef, tela: f.log.tela.map((xs) => xs.map((m) => m.texto)),
    tudo: createHash("sha256").update(JSON.stringify(tudo)).digest("hex"),
  };
}
export const casosDoTempo = (n) => Array.from({ length: n }, (_, i) => casoDoTempo(i));
