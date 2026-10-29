/* pedido-bloco.mjs (Fase 4, trilha B, 29/10/2026) — a montagem do pedido ao Narrador, corrida em Node

   Não é suíte: é a ferramenta das duas pontas da prova, no padrão de
   `pauta-bloco.mjs` (de quem herda os 275 casos).

   - `gerar-pedido-dourado.mjs` recorta do App o trecho de `enviar` que
     monta o pedido (da pauta ao system), com o fecho das funções que ele
     chama — a `pautaDoTurno` e as suas 50 dentro —, corre-o sobre os casos
     e grava as fotos em `pedido-dourado.json`. Depois do trecho corre o
     começo de `chamarMestre` (o recorte dele também): a `chamarModelo` é
     porta, e a foto guarda os argumentos com que ela foi chamada — é o
     pedido que vai à rede, byte a byte.
   - `teste-motor-pedido-do-turno.mjs` corre a peça (src/motor/pedido-do-turno.js)
     sobre os MESMOS casos e exige as mesmas fotos.

   OS CASOS são os da pauta (as 194 frases gravadas das sessões 8, 9 e 10 e
   os 81 da prova), mais o que o turno escreve ANTES do trecho e o trecho
   lê de `enviar`: a oficina, o compasso, a forma da cena, a frente, a
   virada, a trama (envelopes variados por índice, alguns que abrem fio na
   estrada), o pedido da escuta (o de verdade: `oPedidoDaEscuta` sobre o
   estado do caso), e o histórico (de 0 a 73 mensagens, para a janela
   ancorada saltar). Sem Math.random: a sorte da casa é semeada por caso.

   Um nome que o recorte leia e nenhum dublê dê fica em `faltas`, e a suíte
   exige-o vazio. */
import fs from "node:fs";
import { semearACasa } from "../src/semente.js";
import { oPedidoDaEscuta } from "../src/motor/antes-do-mestre.js";
import { ATRIBUTOS } from "../src/constantes.js";
import { casoDaPauta, N_CASOS, N_DA_PAUTA, osModulos, sha } from "./pauta-bloco.mjs";

export { N_CASOS, sha, osModulos };
export const AMOSTRA = 3;
const copia = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
export const lerODourado = () => JSON.parse(fs.readFileSync(new URL("./pedido-dourado.json", import.meta.url), "utf8"));

/* o valor de partida de cada ref (o argumento do useRef do App), avaliado com os módulos */
export function osPadroes(dourado, mods) {
  const o = {};
  for (const [ref, info] of Object.entries(dourado.refs)) o[ref] = () => new Function("M", `with (M) { return (${info.padrao}); }`)(mods);
  return o;
}

/* ---------------- o recorte, compilado ---------------- */
export function compilarORecorte(dourado, trocas = []) {
  const ordem = ["modulo", "componente", "render"];
  let corpo = ordem.flatMap((de) => dourado.recortes.filter((r) => r.de === de).map((r) => r.texto)).join("\n");
  let trecho = dourado.trecho;
  for (const [de, para] of trocas) {
    const nC = corpo.split(de).length - 1, nT = trecho.split(de).length - 1;
    if (nC + nT !== 1) throw new Error(`a mordida bate ${nC + nT} vezes: ${de.slice(0, 70)}`);
    if (nC) corpo = corpo.replace(de, para); else trecho = trecho.replace(de, para);
  }
  const saida = dourado.saida.join(", ");
  return new Function("S", `with (S) {\n${corpo}\nreturn { chamarMestre, montar: (${dourado.entrada.join(", ")}) => {\n${trecho}\nreturn { ${saida} };\n} };\n}`);
}

/* ---------------- os casos ---------------- */
/* os cabeçalhos são os de verdade: é por eles que a escuta conta os
   empurrões (EMPURROES, escuta.js) e a estrada reconhece o fio novo
   (FIOS_NOVOS, fios-da-estrada.js) — o do rumor amarra-se ao Doran da missão */
const ENVELOPES = [
  "", "[OFICINA — JÁ FEITO PELO SISTEMA] Fervi duas poções de cura na bancada.", "[AGORA — DECISÃO DO SISTEMA] O dia vira tarde; a praça esvazia.",
  "[A FORMA DESTA CENA] A cena pede uma escolha: a ponte ou o vau.", "", "[O MUNDO SE MEXE] A raid avança sobre o portão leste.",
  "[QUEST GERADA PELO SISTEMA] Um mensageiro traz uma carta lacrada de Agulha de Sal.", "[RUMOR] Dizem que Doran o Manco esconde algo no forte.",
  "[TRABALHO PREGADO NO MURAL] O ferreiro paga por uma escolta até o vau.", "[EVENTO GLOBAL — NOVO ARCO] A peste chega do sul.",
];
const env = (i, k) => ENVELOPES[(i * 7 + k * 3) % ENVELOPES.length];
const TAMANHOS = [0, 5, 23, 30, 49, 73];
const oHistorico = (i, n) => Array.from({ length: n }, (_, j) => ({ role: j % 2 ? "assistant" : "user", content: j % 2 ? `{"narrativa":"O Mestre fala ${i}.${j}."}` : `faço a coisa ${j}` }));

/* a ficha que o system lê inteira (`fichaTexto`): a da pauta não precisava
   dos atributos nem do conceito; aqui sem eles o system não se monta, e um
   herói do jogo sempre os tem. Só se põe o que falta. */
const comFicha = (p, i) => (p && typeof p === "object" ? {
  ...p, atributos: p.atributos || Object.fromEntries(ATRIBUTOS.map((a, j) => [a.id, (i + j) % 4])),
  conceito: p.conceito || ["Sentinela do vau", "Andarilha sem nome", "Ex-sacerdote"][i % 3], manaMax: p.manaMax != null ? p.manaMax : 4 + (i % 9),
} : p);

export function casoDoPedido(i) {
  const k0 = casoDaPauta(i);
  const k = { ...k0, estado: k0.estado.personagem ? { ...k0.estado, personagem: comFicha(k0.estado.personagem, i) } : k0.estado,
    render: k0.render.personagem ? { ...k0.render, personagem: comFicha(k0.render.personagem, i) } : k0.render };
  const n = TAMANHOS[i % TAMANHOS.length];
  const render = { ...k.render, historico: oHistorico(i, n) };
  let pedidoEsc = null, fioEsc = [];
  try {
    const e = k.estado || {};
    const d = oPedidoDaEscuta({ modo: e.modo, abertura: e.abertura, missoes: e.missoes, escuta: e.escuta }, k.frase);
    pedidoEsc = d.pedido; fioEsc = d.fio;
  } catch { pedidoEsc = null; fioEsc = []; }
  if (i % 13 === 5) { pedidoEsc = null; fioEsc = []; }
  const entrada = {
    conteudo: k.frase, persAtual: i % 4 === 1 ? copia(k.estado && k.estado.personagem) : undefined,
    histBase: i % 11 === 4 ? oHistorico(i + 1, 3 + (i % 9)) : undefined,
    oficina: env(i, 0).startsWith("[OFICINA") ? env(i, 0) : "", doCompasso: env(i, 1), formaDaCena: i % 3 ? "" : env(i, 2),
    daFrente: i % 6 === 2 ? ENVELOPES[5] : "", daVirada: i % 8 === 3 ? ENVELOPES[7] : "", daTrama: i % 8 === 3 ? "" : env(i, 4),
    pedidoEsc: copia(pedidoEsc), fioEsc: copia(fioEsc),
  };
  return { ...k, render, entrada };
}
/* os 275 e, no fim, os de cobertura da pauta (29/10): os índices de antes não se movem */
export const casosDoPedido = () => Array.from({ length: N_DA_PAUTA }, (_, i) => casoDoPedido(i));

/* ---------------- correr um lado ---------------- */
const fotoDosRefs = (valores) => Object.fromEntries(Object.keys(valores).sort().map((k) => [k, sha(valores[k])]));
const NA_REDE = Symbol("na rede");

/* o recorte: refs de verdade, um escopo que acusa o nome sem dublê */
export async function correrORecorte(fabrica, k, dourado, mods, padroes) {
  const log = { portas: [], faltas: [] };
  const S = { ...mods, useCallback: (f) => f, useMemo: (f) => f() };
  const campoDe = {};
  for (const [ref, info] of Object.entries(dourado.refs)) {
    campoDe[ref] = info.campo;
    S[ref] = { current: k.estado[info.campo] !== undefined ? copia(k.estado[info.campo]) : padroes[ref]() };
  }
  const valores = () => Object.fromEntries(Object.entries(campoDe).map(([ref, c]) => [c, S[ref].current]));
  /* o estado React do render: o do caso; sem ele, o do save, e sem este o
     valor de partida do useState (é o que o App tem quando o save não o traz) */
  const doUseState = (n) => new Function("M", `with (M) { return (${dourado.renderPadrao[n]}); }`)(S);
  for (const n of dourado.render) S[n] = copia(k.render[n] !== undefined ? k.render[n] : k.estado[n] !== undefined ? k.estado[n] : doUseState(n));
  for (const n of dourado.setters) S[n] = (v) => { log.portas.push([n, sha(typeof v === "function" ? "∅função" : v)]); };
  S.calou = (onde) => { log.portas.push(["calou", onde]); return []; };
  S.pushMsgs = (novas) => { log.portas.push(["pushMsgs", sha(novas), sha(fotoDosRefs(valores()))]); S.mensagensRef.current = [...(S.mensagensRef.current || []), ...(novas || [])]; };
  let rede = null;
  S.chamarModelo = (...args) => { rede = args; throw NA_REDE; };
  const escopo = new Proxy(S, {
    has: (t, nome) => { if (typeof nome !== "string") return false; if (nome in t) return true; if (nome in globalThis) return false; log.faltas.push(nome); return true; },
    get: (t, nome) => { if (nome === Symbol.unscopables) return undefined; if (nome in t) return t[nome]; throw new ReferenceError("falta o dublê: " + String(nome)); },
    set: (t, nome, v) => { t[nome] = v; return true; },
  });
  semearACasa("pedido|" + k.i);
  let out = null, erro = null;
  try {
    const f = fabrica(escopo);
    const e = k.entrada;
    out = f.montar(...dourado.entrada.map((n) => e[n]));
    try { await f.chamarMestre(S.systemRef.current, out.novoHist); } catch (x) { if (x !== NA_REDE) throw x; }
  } catch (x) { erro = String(x && x.message); }
  return { out, rede, erro, valores: valores(), log };
}

/* a peça: o estado do caso, as mesmas portas, e o "App" que o aplicar escreve */
export function correrAPeca(peca, k, dourado, padroes, { semAplicar = false, entradaExtra = {} } = {}) {
  const log = { portas: [], faltas: [], aplicar: [] };
  let loja = {};
  for (const [ref, info] of Object.entries(dourado.refs)) loja[info.campo] = k.estado[info.campo] !== undefined ? copia(k.estado[info.campo]) : padroes[ref]();
  const estado = { ...copia(k.estado), render: copia(k.render) };
  const portas = { calou: (onde) => { log.portas.push(["calou", onde]); } };
  for (const n of dourado.setters) portas[n] = (v) => { log.portas.push([n, sha(typeof v === "function" ? "∅função" : v)]); };
  portas.pushMsgs = (novas) => { log.portas.push(["pushMsgs", sha(novas), sha(fotoDosRefs(loja))]); loja = { ...loja, mensagens: [...(loja.mensagens || []), ...(novas || [])] }; };
  if (!semAplicar) portas.aplicar = (x) => { log.aplicar.push(Object.keys(x)); loja = { ...loja, ...x }; };
  const e = k.entrada;
  const entrada = { frase: e.conteudo, persAtual: copia(e.persAtual), histBase: copia(e.histBase), oficina: e.oficina, doCompasso: e.doCompasso, formaDaCena: e.formaDaCena, daFrente: e.daFrente, daVirada: e.daVirada, daTrama: e.daTrama, pedidoEsc: copia(e.pedidoEsc), fioEsc: copia(e.fioEsc), ...entradaExtra };
  semearACasa("pedido|" + k.i);
  let r = null, erro = null;
  try { r = peca(estado, entrada, portas); } catch (x) { erro = String(x && x.message); }
  const out = r ? Object.fromEntries(dourado.saida.map((n) => [n, r.saida ? r.saida[n] : undefined])) : null;
  const rede = r && r.pedido ? [r.pedido.system, r.pedido.messages, r.pedido.maxTokens, r.pedido.formato, r.pedido.tarefa, r.pedido.comCache] : null;
  return { out, rede, erro, valores: loja, log, ret: r, estado };
}

/* A FOTO: o pedido que vai à rede, o que o resto de `enviar` lê, os refs do fim, as portas */
export function fotoDoPedido(f) {
  const o = f.out || {};
  return {
    rede: f.rede ? sha(f.rede) : null, system: f.rede ? f.rede[0] : null, tamRede: f.rede ? JSON.stringify(f.rede).length : -1,
    saida: sha(Object.fromEntries(Object.keys(o).sort().map((n) => [n, o[n]]))), pauta: o.pauta === undefined ? null : o.pauta, nota: o.nota,
    refs: fotoDosRefs(f.valores), portas: f.log.portas, erro: f.erro, faltas: [...new Set(f.log.faltas)],
    /* fora da comparação: o que a suíte ainda quer olhar */
    redeInteira: f.rede, ret: f.ret || null, aplicados: (f.log.aplicar || []).flat(),
  };
}
/* a foto que o dourado guarda: o pedido por impressão digital (e o system inteiro nos primeiros) */
export function fotoGuardada(foto, i) {
  return { rede: foto.rede, tamRede: foto.tamRede, ...(i < AMOSTRA ? { system: foto.system } : {}), saida: foto.saida,
    pauta: sha(foto.pauta), nota: sha(foto.nota), refs: sha(foto.refs), portas: sha(foto.portas), nPortas: foto.portas.length, erro: foto.erro, faltas: foto.faltas };
}
export const mesmaFoto = (a, b) => a.rede === b.rede && a.saida === b.saida && a.pauta === b.pauta && a.nota === b.nota && a.refs === b.refs && a.portas === b.portas && a.erro === b.erro && JSON.stringify(a.faltas) === JSON.stringify(b.faltas);

/* corre os casos de um lado (o recorte, mordido ou não, ou a peça) */
export async function correrOsCasos(dourado, { lado = "recorte", trocas = [], peca = null, casos = casosDoPedido(), opcoes = {} } = {}) {
  const mods = await osModulos(dourado.imports);
  const padroes = osPadroes(dourado, mods);
  const fabrica = lado === "recorte" ? compilarORecorte(dourado, trocas) : null;
  const fotos = [];
  for (const k of casos) fotos.push(fotoDoPedido(lado === "recorte" ? await correrORecorte(fabrica, k, dourado, mods, padroes) : correrAPeca(peca, k, dourado, padroes, opcoes)));
  return fotos;
}
