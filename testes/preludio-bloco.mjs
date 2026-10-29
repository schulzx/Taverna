/* preludio-bloco.mjs (Fase 4, trilha B, 29/10/2026) — o prelúdio do turno (o que `enviar` escreve antes do pedido), corrido em Node

   Não é suíte: é a ferramenta das duas pontas da prova, no padrão de
   `pedido-bloco.mjs` (de quem herda os 275 casos).

   - `gerar-preludio-dourado.mjs` recorta do App o trecho de `enviar` que
     vai da frase que é pedido meu às bocas (o chão, a chegada, a cidade, a
     escuta, o compasso, a forma, a frente, a virada, a trama, o ato, o
     Intérprete, os propósitos, as cinco mãos, as falas), com o fecho das
     funções que ele chama, corre-o sobre os casos e grava as fotos em
     `preludio-dourado.json`. E corre o TURNO ATÉ À REDE: o prelúdio e, nos
     mesmos refs, o recorte do pedido (o de `pedido-dourado.json`) e o
     começo de `chamarMestre` — a foto guarda o pedido que vai à rede.
   - `teste-motor-preludio-do-turno.mjs` corre a peça
     (src/motor/preludio-do-turno.js) sobre os MESMOS casos e exige as
     mesmas fotos; e encadeia-a com a do pedido (`oPedidoDoTurno`) e exige o
     mesmo pedido à rede, a partir de { estado, frase } e das portas.

   AS PORTAS que o recorte chama e não leva: a tela (`pushMsgs`, os setters
   do React), o disco (`salvar`), o `calou`, a rede (`chamarModelo` — a das
   bocas responde uma fala; a do Narrador é onde a foto para), o
   `setTimeout` (o que o App adia para depois do turno: corre no fim, e na
   cadeia depois do pedido, que é quando o App o vê correr com a rede no
   ar) e o relógio (`Date.now`, fixo: só chaveia a faixa da chegada). O
   `setHistoria` que o componente do App não declarava (é da `TelaMundo`)
   teve dublê que estourava igual até d2d1dcd tirar as chamadas do App;
   agora não tem dublê nenhum, e se voltar ao recorte o Proxy acusa-o.

   Um nome que o recorte leia e nenhum dublê dê fica em `faltas`, e a suíte
   exige-o vazio. Sem Math.random: a sorte da casa é semeada por caso. */
import fs from "node:fs";
import { semearACasa } from "../src/semente.js";
import { abrirRaid } from "../src/raids.js";
import { casoDoPedido, osPadroes, compilarORecorte as compilarOPedido, lerODourado as lerOPedido } from "./pedido-bloco.mjs";
import { N_CASOS, osModulos, sha } from "./pauta-bloco.mjs";

export { N_CASOS, sha, osModulos, osPadroes, lerOPedido };
export const AMOSTRA = 3;
/* o relógio das provas: o `Date.now` do App só chaveia a faixa da chegada */
export const AGORA = 1793000000000;
const copia = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
export const lerODourado = () => JSON.parse(fs.readFileSync(new URL("./preludio-dourado.json", import.meta.url), "utf8"));

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
  return new Function("S", `with (S) {\n${corpo}\nreturn { montar: async (${dourado.entrada.join(", ")}) => {\n${trecho}\nreturn { ${dourado.saida.join(", ")} };\n} };\n}`);
}

/* ---------------- os casos ----------------
   Os do pedido (as 194 frases gravadas e os 81 da prova, com a ficha que o
   system lê): o prelúdio lê o estado e a frase; a ficha do clique e o
   histórico-base passam por ele para o pedido. */
/* OS CASOS MONTADOS. Dos 275, nenhum anda o mundo: a oficina vazia, o
   compasso parado, a estante sem cadência, nenhuma frente na linha, nenhuma
   missão com virada, nenhuma trama a nascer (medido: 0 de 275 em cada).
   Cada montado é um caso gravado com UMA coisa posta onde ela dispara — a
   bancada com trabalho, o compasso no fim do movimento, a cena com
   cadência vencida, a raid na luta, a missão com a virada devida (das
   quatro espécies), a caçada no lugar onde se está, e a trama com espaço
   (o save antigo, o compasso a subir) —, e a frase varia entre a do jogador,
   o envelope do sistema, a rolagem e a raid. */
const FRASES_DO_SISTEMA = ["[ROLAGEM] 14 contra 12: passou.", "[RAID] A linha segura mais uma rodada.", "[AGORA — DECISÃO DO SISTEMA] A tarde cai."];
const OFICINAS = [
  [{ tipo: "bancada", nome: "Poção de cura", ok: true, minutos: 30 }, { tipo: "bancada", nome: "Poção de cura", ok: true, minutos: 30 }],
  [{ tipo: "forja", nome: "Espada curta", ok: true, minutos: 120 }],
  [{ tipo: "desmonte", nome: "Elmo amassado", ok: true, minutos: 15 }, { tipo: "bancada", nome: "Unguento", ok: false, minutos: 20 }],
];
const MOVIMENTOS = ["respiro", "semente", "subida", "vespera", "climax", "preco"];
const VIRADAS = [
  { tipo: "emboscada", apos: 0, quantos: 2, ameaca: "competente", onde: "Na ponte velha" },
  { tipo: "encontro", apos: 0, quem: "Irmã Velane", papel: "e sabe o que o forte guarda", onde: "Na estalagem" },
  { tipo: "revelacao", apos: 0, o: "o forte guarda a cripta do primeiro rei" },
  { tipo: "emboscada", apos: 1, quantos: 3, ameaca: "perigoso" },
];
const aMissao = (j, virada, extra = {}) => ({ id: "mt" + j, titulo: "O que a ponte cobra", tipo: "trama", status: "ativa", dador: "Doran o Manco", descricao: "descobrir quem cobra a ponte",
  etapas: [{ tipo: "falar_com", alvo: "Doran o Manco", feito: true }, { tipo: "ir_a", alvo: "a ponte", feito: j % 2 === 1 }, { tipo: "falar_com", alvo: "o portageiro", feito: false }], virada, nivel: 2, dia: 3, ...extra });
/* OS DOIS SÍTIOS DO `setHistoria` (d2d1dcd). A caminhada pela cidade à
   meia-noite vira o dia, e o dia do vilão corre: (a) o passo dele casa o
   arco (a revelação que leva a etapa da história atrás dele), (b) a queda
   confirmada no registo de pessoas com o arco no último momento fecha o
   capítulo (o epílogo, a linha, a porta). No App de antes os dois chamavam
   um `setHistoria` que o componente não declara, e o turno inteiro
   estourava; nenhum dos casos acima chegava lá. */
const O_VILAO = { nome: "Morvane", titulo: "a Viúva do Sal", arquetipo: "arquiteto", corpo: "pessoa", conhecido: true, marcas: [], status: "ativa", ultimoPasso: -100, odio: 0,
  crenca: "o mundo é mal construído, e consertá-lo exige derrubar antes", metodo: "não aparece: monta", quer: "que a peça final caia no lugar", assinatura: "coincidências boas demais" };
const A_MEIA_NOITE = { minuto: 1439, combate: null, acampado: false, masmorra: null };
const MONTADOS = [
  ...OFICINAS.flatMap((o, j) => [0, 1].map((x) => ({ base: 3 + j * 17 + x * 50, o: "oficina", estado: () => ({ oficina: o }) }))),
  ...MOVIMENTOS.map((m, j) => ({ base: 11 + j * 23, o: "compasso", estado: () => ({ compasso: { movimento: m, turnos: 6, alvo: 3, assunto: "" } }) })),
  ...MOVIMENTOS.map((m, j) => ({ base: 7 + j * 29, o: "compasso e forma", estado: () => ({ compasso: { movimento: m, turnos: 1, alvo: 4, assunto: "" }, estante: { desdeCena: 9 + j } }) })),
  ...[0, 1, 2, 3, 4, 5].map((j) => ({ base: 5 + j * 31, o: "forma", estado: () => ({ estante: { desdeCena: 6 + 3 * j } }) })),
  ...[0, 1, 2, 3, 4, 5].map((j) => ({ base: 2 + j * 27, o: "frente", frase: j % 3 === 2 ? FRASES_DO_SISTEMA[1] : null, estado: (k) => {
    const r = abrirRaid({ semente: "prova-da-frente-" + j, pers: k.estado.personagem || null, npcs: k.estado.npcs || {} });
    return { raid: { ...r, fase: "luta", ...(j >= 4 ? { horda: 1 + j } : {}) } };
  } })),
  ...VIRADAS.flatMap((v, j) => [0, 1].map((x) => ({ base: 9 + j * 37 + x * 13, o: "virada " + v.tipo, frase: x ? FRASES_DO_SISTEMA[0] : null, estado: (k) => ({ missoes: [...((k.estado.missoes || []).filter((m) => m.tipo !== "trama")), aMissao(j, { ...v })], ...(x ? { nemesis: { nome: "Kael o Rubro", status: "ativa", conhecido: true } } : {}) }) }))),
  /* a virada e a trama no mesmo turno: a missão que vira não é trama, e a trama teria espaço */
  ...[0, 1, 2, 3].map((j) => ({ base: 8 + j * 43, o: "virada e trama", estado: (k) => ({ combate: null, masmorra: null, acampado: false, raid: null, abertura: { legado: true, turnos: 40 },
    compasso: { movimento: MOVIMENTOS[2 + (j % 3)], turnos: j % 2 ? 6 : 0, alvo: 3, assunto: "" }, dia: 20 + j, missoes: [aMissao(20 + j, { ...VIRADAS[1 + (j % 2)] }, { tipo: "principal" })] }) })),
  ...[0, 1, 2, 3].map((j) => ({ base: 4 + j * 41, o: "caçada", estado: (k) => {
    const onde = (k.estado.lugar && k.estado.lugar.nome) || k.estado.cidadeAtual || "";
    return { combate: null, acampado: false, masmorra: null, raid: null, missoes: [aMissao(10 + j, null, { etapas: [{ tipo: "derrotar", alvo: "A Fera do Vau", onde, feito: false }] })] };
  } })),
  ...[0, 1, 2, 3, 4, 5].map((j) => ({ base: 6 + j * 19, o: "trama", frase: j === 5 ? FRASES_DO_SISTEMA[2] : null, estado: () => ({ combate: null, masmorra: null, acampado: false, raid: null, abertura: { legado: true, turnos: 40 },
    compasso: { movimento: MOVIMENTOS[j % 6], turnos: j % 2 ? 6 : 0, alvo: 3, assunto: "" }, missoes: [], dia: 20 + j }) })),
  ...[19, 21, 23, 25].map((base) => ({ base, o: "o arco casa com o vilão", frase: "Vou até a taverna.", estado: () => ({ ...A_MEIA_NOITE, nemesis: { ...O_VILAO, passo: 4, fase: "mao" }, historia: { estrutura: "jornada", etapa: 0 } }) })),
  ...[19, 21, 23, 25].map((base) => ({ base, o: "o fim do capítulo", frase: "Vou até a taverna.", estado: (k) => ({ ...A_MEIA_NOITE, nemesis: { ...O_VILAO, passo: 8, fase: "queda" }, historia: { estrutura: "jornada", etapa: 5 },
    npcs: { ...(k.estado.npcs || {}), [O_VILAO.nome]: { nome: O_VILAO.nome, status: "morto", papel: "a vilã" } } }) })),
];
export const N_MONTADOS = MONTADOS.length;
export const N_PRELUDIO = N_CASOS + N_MONTADOS;
export function casoDoPreludio(i) {
  if (i < N_CASOS) return casoDoPedido(i);
  const m = MONTADOS[i - N_CASOS];
  const k = casoDoPedido(m.base % 194);
  return { ...k, i, montado: m.o, frase: m.frase || k.frase, estado: { ...k.estado, ...m.estado(k) } };
}
export const casosDoPreludio = () => Array.from({ length: N_PRELUDIO }, (_, i) => casoDoPreludio(i));

/* a boca responde (com BOCAS_POR_TURNO a 0 ninguém a chama: a mordida que
   paga as bocas é que a acorda) */
const falaDaBoca = (args) => JSON.stringify({ fala: `Digo ${sha(args).slice(0, 6)}.` });
const fotoDosRefs = (valores) => Object.fromEntries(Object.keys(valores).sort().map((k) => [k, sha(valores[k])]));
export const NA_REDE = Symbol("na rede");
class DataFixa extends Date { static now() { return AGORA; } }

/* o escopo dos recortes: refs de verdade, as portas que registam, e o Proxy que acusa o nome sem dublê */
function oEscopo(k, dourados, mods, padroes, log) {
  const S = { ...mods, useCallback: (f) => f, useMemo: (f) => f() };
  const campoDe = {};
  for (const [d, pad] of dourados.map((d, j) => [d, padroes[j]])) for (const [ref, info] of Object.entries(d.refs)) {
    if (campoDe[ref]) continue;
    campoDe[ref] = info.campo;
    S[ref] = { current: k.estado[info.campo] !== undefined ? copia(k.estado[info.campo]) : pad[ref]() };
  }
  const valores = () => Object.fromEntries(Object.entries(campoDe).map(([ref, c]) => [c, S[ref].current]));
  for (const d of dourados) {
    const doUseState = (n) => new Function("M", `with (M) { return (${d.renderPadrao[n]}); }`)(S);
    for (const n of d.render) if (!(n in S)) S[n] = copia(k.render[n] !== undefined ? k.render[n] : k.estado[n] !== undefined ? k.estado[n] : doUseState(n));
    for (const n of d.setters) S[n] = (v) => { log.portas.push([n, sha(typeof v === "function" ? "∅função" : v)]); };
  }
  S.calou = (onde) => { log.portas.push(["calou", onde]); return []; };
  S.pushMsgs = (novas) => { log.portas.push(["pushMsgs", sha(novas), sha(fotoDosRefs(valores()))]); S.mensagensRef.current = [...(S.mensagensRef.current || []), ...(novas || [])]; };
  S.salvar = (extra) => { log.portas.push(["salvar", sha(extra === undefined ? {} : extra), sha(fotoDosRefs(valores()))]); };
  S.chamarModelo = async (...args) => {
    if (args[4] === "narrador") { log.rede = args; throw NA_REDE; }
    log.portas.push(["chamarModelo", sha(args)]);
    return falaDaBoca(args);
  };
  /* fora das portas da foto: a peça sem a porta adiar corre-os no fim, e a foto do fim é que diz */
  S.setTimeout = (f) => { log.nAdiados = (log.nAdiados || 0) + 1; log.adiados.push(f); return log.adiados.length; };
  S.Date = DataFixa;
  const escopo = new Proxy(S, {
    has: (t, nome) => { if (typeof nome !== "string") return false; if (nome in t) return true; if (nome in globalThis) return false; log.faltas.push(nome); return true; },
    get: (t, nome) => { if (nome === Symbol.unscopables) return undefined; if (nome in t) return t[nome]; throw new ReferenceError("falta o dublê: " + String(nome)); },
    set: (t, nome, v) => { t[nome] = v; return true; },
  });
  return { S, escopo, valores };
}
const correrOsAdiados = (log) => { for (const f of log.adiados.splice(0)) { try { f(); } catch { log.portas.push(["calou", "o que o turno adiou"]); } } };

/* o recorte do prelúdio sozinho */
export async function correrORecorte(fabrica, k, dourado, mods, padroes) {
  const log = { portas: [], faltas: [], adiados: [], rede: null };
  const { escopo, valores } = oEscopo(k, [dourado], mods, [padroes], log);
  semearACasa("preludio|" + k.i);
  let out = null, erro = null;
  try {
    const f = fabrica(escopo);
    out = await f.montar(...dourado.entrada.map((n) => (n === "conteudo" ? k.frase : undefined)));
  } catch (x) { erro = String(x && x.message); }
  correrOsAdiados(log);
  return { out, erro, valores: valores(), log };
}

/* a peça: o estado do caso, as mesmas portas, e o "App" que o aplicar escreve */
export function asPortas(dourados, log, lojaRef, { semAplicar = false, pushSemLista = false } = {}) {
  const portas = { calou: (onde) => { log.portas.push(["calou", onde]); }, agora: () => AGORA };
  for (const d of dourados) for (const n of d.setters) portas[n] = (v) => { log.portas.push([n, sha(typeof v === "function" ? "∅função" : v)]); };
  portas.pushMsgs = (novas) => { log.portas.push(["pushMsgs", sha(novas), sha(fotoDosRefs(lojaRef.loja))]); lojaRef.loja = { ...lojaRef.loja, mensagens: [...(lojaRef.loja.mensagens || []), ...(novas || [])] }; return pushSemLista ? undefined : lojaRef.loja.mensagens; };
  portas.salvar = (extra) => { log.portas.push(["salvar", sha(extra === undefined ? {} : extra), sha(fotoDosRefs(lojaRef.loja))]); };
  portas.chamarModelo = async (...args) => { log.portas.push(["chamarModelo", sha(args)]); return falaDaBoca(args); };
  if (!semAplicar) portas.aplicar = (x) => { log.aplicar.push(Object.keys(x)); lojaRef.loja = { ...lojaRef.loja, ...x }; };
  return portas;
}
const aLoja = (k, dourados, padroes) => {
  const loja = {};
  dourados.forEach((d, j) => { for (const [ref, info] of Object.entries(d.refs)) if (!(info.campo in loja)) loja[info.campo] = k.estado[info.campo] !== undefined ? copia(k.estado[info.campo]) : padroes[j][ref](); });
  return loja;
};
const aEntrada = (k, extra = {}) => ({ frase: k.frase, persAtual: copia(k.entrada.persAtual), histBase: copia(k.entrada.histBase), ...extra });

export async function correrAPeca(peca, k, dourado, padroes, { semAplicar = false, pushSemLista = false, entradaExtra = {}, portasExtra = {} } = {}) {
  const log = { portas: [], faltas: [], aplicar: [] };
  const lojaRef = { loja: aLoja(k, [dourado], [padroes]) };
  const estado = { ...copia(k.estado), render: copia(k.render) };
  const portas = { ...asPortas([dourado], log, lojaRef, { semAplicar, pushSemLista }), ...portasExtra };
  semearACasa("preludio|" + k.i);
  let r = null, erro = null;
  try { r = await peca(estado, aEntrada(k, entradaExtra), portas); } catch (x) { erro = String(x && x.message); }
  const out = r ? Object.fromEntries(dourado.saida.map((n) => [n, r.entradaDoPedido ? r.entradaDoPedido[n] : undefined])) : null;
  return { out, erro, valores: lojaRef.loja, log, ret: r, estado };
}

/* A FOTO: o que o pedido lê do prelúdio, os refs do fim, as portas */
export function fotoDoPreludio(f) {
  const o = f.out || {};
  return {
    saida: sha(Object.fromEntries(Object.keys(o).sort().map((n) => [n, o[n]]))), refs: fotoDosRefs(f.valores), portas: f.log.portas, erro: f.erro, faltas: [...new Set(f.log.faltas)],
    /* fora da comparação: o que a suíte ainda quer olhar */
    out: f.out, ret: f.ret || null, aplicados: (f.log.aplicar || []).flat(), valores: f.valores, nAdiados: f.log.nAdiados || 0,
  };
}
export function fotoGuardada(foto, i) {
  return { saida: foto.saida, ...(i < AMOSTRA ? { out: foto.out } : {}), refs: sha(foto.refs), portas: sha(foto.portas), nPortas: foto.portas.length, erro: foto.erro, faltas: foto.faltas };
}
export const mesmaFoto = (a, b) => a.saida === b.saida && a.refs === b.refs && a.portas === b.portas && a.erro === b.erro && JSON.stringify(a.faltas) === JSON.stringify(b.faltas);

export async function correrOsCasos(dourado, { lado = "recorte", trocas = [], peca = null, casos = casosDoPreludio(), opcoes = {} } = {}) {
  const mods = await osModulos(dourado.imports);
  const padroes = osPadroes(dourado, mods);
  const fabrica = lado === "recorte" ? compilarORecorte(dourado, trocas) : null;
  const fotos = [];
  for (const k of casos) fotos.push(fotoDoPreludio(lado === "recorte" ? await correrORecorte(fabrica, k, dourado, mods, padroes) : await correrAPeca(peca, k, dourado, padroes, opcoes)));
  return fotos;
}

/* ---------------- O TURNO ATÉ À REDE ----------------
   O prelúdio e o pedido nos mesmos refs, como `enviar` os corre: o que o
   prelúdio escreve é o que o pedido lê. Do lado do recorte, os dois
   recortes num escopo só; do lado das peças, a cadeia que o servidor fará:
   `oPreludioDoTurno` → `oPedidoDoTurno` sobre o estado com as escritas do
   prelúdio, a entrada que ele devolve e a mesma sorte. */
export async function correrACadeiaDoRecorte(fabricas, k, dourados, mods, padroes) {
  const log = { portas: [], faltas: [], adiados: [], rede: null };
  const { S, escopo, valores } = oEscopo(k, dourados, mods, padroes, log);
  semearACasa("preludio|" + k.i);
  let erro = null, saida = null;
  try {
    /* o recorte do pedido compila DEPOIS do prelúdio: o que o render
       calculava (a praça, `mercadoAqui`) sai dos refs do instante, como o
       App faz desde 1409f0b (`oEstadoDoPedido`: do render só os seis do
       React). Compilado antes, era a praça do último render — o defeito
       que 2d95d33 e 1409f0b tiraram —, e o turno que vira o dia na
       caminhada pedia ao Mestre as bancas de ontem. */
    const fP = fabricas[0](escopo);
    const ent = await fP.montar(k.frase);
    const fD = fabricas[1](escopo);
    const e = { ...ent, conteudo: k.frase, persAtual: copia(k.entrada.persAtual), histBase: copia(k.entrada.histBase) };
    saida = fD.montar(...dourados[1].entrada.map((n) => e[n]));
    try { await fD.chamarMestre(S.systemRef.current, saida.novoHist); } catch (x) { if (x !== NA_REDE) throw x; }
  } catch (x) { erro = String(x && x.message); }
  correrOsAdiados(log);
  return { rede: log.rede, saida, erro, valores: valores(), log };
}
export async function correrACadeiaDasPecas(pecas, k, dourados, padroes, { sorte = null } = {}) {
  const [preludio, pedido] = pecas;
  const log = { portas: [], faltas: [], aplicar: [] };
  const lojaRef = { loja: aLoja(k, dourados, padroes) };
  const estado = { ...copia(k.estado), render: copia(k.render) };
  const adiados = [];
  const portas = { ...asPortas(dourados, log, lojaRef), adiar: (f) => adiados.push(f) };
  semearACasa("preludio|" + k.i);
  let erro = null, saida = null, rede = null;
  try {
    const r1 = await preludio(estado, { ...aEntrada(k), ...(sorte ? { sorte } : {}) }, portas);
    const r2 = pedido({ ...estado, ...r1.escritas }, { ...r1.entradaDoPedido, ...(sorte ? { sorte } : {}) }, portas);
    saida = r2.saida;
    rede = [r2.pedido.system, r2.pedido.messages, r2.pedido.maxTokens, r2.pedido.formato, r2.pedido.tarefa, r2.pedido.comCache];
  } catch (x) { erro = String(x && x.message); }
  for (const f of adiados.splice(0)) { try { f(); } catch { log.portas.push(["calou", "o que o turno adiou"]); } }
  return { rede, saida, erro, valores: lojaRef.loja, log };
}
export function fotoDaCadeia(f) {
  const o = f.saida || {};
  return { rede: f.rede ? sha(f.rede) : null, tamRede: f.rede ? JSON.stringify(f.rede).length : -1, saida: sha(Object.fromEntries(Object.keys(o).sort().map((n) => [n, o[n]]))),
    refs: sha(fotoDosRefs(f.valores)), portas: sha(f.log.portas), nPortas: f.log.portas.length, erro: f.erro, faltas: [...new Set(f.log.faltas)], redeInteira: f.rede };
}
export const mesmaCadeia = (a, b) => a.rede === b.rede && a.saida === b.saida && a.refs === b.refs && a.portas === b.portas && a.erro === b.erro && JSON.stringify(a.faltas) === JSON.stringify(b.faltas);
export const cadeiaGuardada = (f) => { const { redeInteira, ...resto } = f; void redeInteira; return resto; };

export async function correrAsCadeias(dourados, { lado = "recorte", pecas = null, casos = casosDoPreludio() } = {}) {
  const mods = {};
  for (const d of dourados) Object.assign(mods, await osModulos(d.imports));
  const padroes = dourados.map((d) => osPadroes(d, mods));
  const fabricas = lado === "recorte" ? [compilarORecorte(dourados[0]), compilarOPedido(dourados[1])] : null;
  const fotos = [];
  for (const k of casos) fotos.push(fotoDaCadeia(lado === "recorte" ? await correrACadeiaDoRecorte(fabricas, k, dourados, mods, padroes) : await correrACadeiaDasPecas(pecas, k, dourados, padroes)));
  return fotos;
}
