/* ============================================================
   QUEM TEM O QUÊ — o registro de posse e a transação (23/11/2026, etapa 5
   da planta mente/plano-identidade-e-posse.md)

   A ordem da pessoa, 23/11: «se a troca não está funcionando, vou criar um
   sistema que identifica e realiza trocas». Até aqui só o herói e o
   companheiro tinham posse; não havia registro de dívida; cada caminho que
   muda posse aplicava do seu jeito (já deu débito em dobro), quem recebeu
   15 moedas «não tinha moeda para dar» no turno seguinte, uma «devolução»
   entregou o que nunca foi emprestado e uma cobrança virou pagamento na
   direção contrária. Este módulo é o mecanismo que resolve a classe
   inteira, e não a regra de um caso.

   ---------------- DE ONDE VEM A POSSE ----------------
     · o herói: a ficha, como sempre — `moedas`, `inventario` e
       `equipamento` (o que carrega), `equipados` (o que veste: está em uso,
       não sai numa troca), `suprimentos` (os usos).
     · o companheiro: `grupo[].inventario` e `grupo[].equipados` na ficha;
       a moeda dele (a ficha não a tem) e os usos ficam no registro.
     · o personagem do mundo: `posseInicial` DERIVADA, sem save — a moeda
       pela tabela de classe do butim (a de O_VEREDITO_DA_TROCA, com uma
       chave de semente NOVA, `${semente}|posse|${id}`: nenhum sorteio que
       já existe muda), as coisas pelo ofício (QUEM_TEM_O_QUE.oficio) e pelo
       objeto que o núcleo diz que ele carrega (`carrega`, nucleo.js). Por
       cima, o DELTA do registro: só quem foi tocado tem entrada.
     · a banca: por ADAPTADOR sobre o que já existe — o estoque menos
       `mercado.comprados`, e a gaveta por `podePagar` (comercio.js) com o
       gasto de hoje em `mercado.gastos`. Esses campos não mudam de forma.
     · o chão: `chao.itens` (chao.js); o chão só guarda coisa, nunca moeda.
     · `mundo` é a fonte do sistema (quest, espólio): tem tudo. `nada` é o
       consumo: recebe e some.
     · o morto: a posse dele é a mesma de quando vivia, e se pega sem
       consentimento — ninguém segura.

   ---------------- O REGISTRO (o campo `posses` do save, etapa 6) --------
     { v, delta: { id: { moedas, entrou: [item], saiu: [nome], usos } },
       dividas: [{ id, de, para, oQue, quanto, dia, prazo, estado, origem }],
       aplicadas: [chave] }
   Na dívida, `de` é quem tem de entregar e `para` quem recebe — a MESMA
   direção da transação que a paga.

   ---------------- A TRANSAÇÃO ----------------
     { de, para, oQue: { tipo: "moedas"|"item"|"uso", nome, quantos },
       contra: null | oQue, consentimento: "pedido"|"dado"|"tomado"|"devido",
       prazo?, origem, chave }
   `aplicarTransacao` não sabe o que é «vender», «subornar» ou «cobrar»: só
   sabe de quem, para quem, o quê, a contrapartida e o consentimento. Ela
   confere que `de` tem a coisa (pela posse, não por lista), move os dois
   lados de uma vez ou nenhum, e a `chave` já aplicada não aplica de novo.
     · com `prazo` e sem `contra`: a coisa vai agora e volta depois — abre
       a dívida de `para` com `de`, da mesma coisa;
     · com `prazo` e com `contra`: a coisa vai agora e a contrapartida fica
       devida — abre a dívida de `para` com `de`, da contrapartida;
     · `devido`: a entrega que paga uma dívida. Só existe se a dívida
       existe, na mesma direção e da mesma coisa, e nunca acima do que se
       deve; ela abate ou fecha. Devolver o que nunca foi emprestado e
       cobrar o que não é devido são recusados com motivo.
     · `tomado` precisa do dado passado (ctx.dado); `pedido`, de quem não é
       o herói, precisa da resposta (o dado passado ou ctx.aceito).

   PURO E DETERMINÍSTICO. Nenhum relógio; a única sorte é a da semente; o
   que entra nunca é mutado; o `null` e o lixo dão o vazio ou a recusa com
   motivo, nunca uma exceção.
   ============================================================ */
import { O_VEREDITO_DA_TROCA } from "./o-veredito-da-troca.js";
import { podePagar } from "./comercio.js";
import { idDe } from "./quem-e-quem.js";
import { garantirChao, porNoChao, tirarDoChao } from "./chao.js";
import { hashSemente } from "./semente.js";

/* ---------------- A TABELA ----------------
   `teto`: o tamanho do registro — `pessoas` é quantos deltas guarda (uma
   campanha de catorze sessões conhece pouco mais de cem pessoas, e só uma
   parte troca alguma coisa); `itens`, o que entra num delta; `dividas`, as
   abertas e as fechadas que ainda cabem; `aplicadas`, as últimas chaves
   (a repetição que importa é a do mesmo turno, não a de um mês atrás);
   `quantos`, o maior número de uma transação; `prazo`, em dias.
   `lados`: os nomes das pontas que não são pessoa. `usos`: o que mora em
   `suprimentos`. `oficio`: a raiz do ofício → o que quem o tem carrega.
   `motivos`: a razão de cada recusa, dita para quem lê o log ou o fato. */
export const QUEM_TEM_O_QUE = Object.freeze({
  v: 1,
  teto: Object.freeze({ pessoas: 150, itens: 40, dividas: 60, aplicadas: 300, quantos: 100000, chave: 160, nome: 80, prazo: Object.freeze({ min: 1, max: 3650 }) }),
  tipos: Object.freeze(["moedas", "item", "uso"]),
  consentimentos: Object.freeze(["pedido", "dado", "tomado", "devido"]),
  consentimentoPadrao: "dado",
  lados: Object.freeze({ heroi: "heroi", mundo: "mundo", nada: "nada", chao: "chao|", banca: "banca|", registo: "npc|" }),
  usos: Object.freeze(["racoes", "agua", "tochas", "flechas"]),
  /* etapa 6: para onde vai a coisa que chega ao herói (a ficha tem as duas) */
  destinos: Object.freeze(["inventario", "equipamento"]),
  semente: "posse",
  estados: Object.freeze({ aberta: "aberta", fechada: "fechada" }),
  /* o objeto que o núcleo carrega vira coisa na mão; a dívida e a culpa não */
  carregaQueECoisa: "objeto",
  artigos: Object.freeze(["um", "uma", "o", "a", "os", "as"]),
  /* a primeira raiz que casa no papel/ofício dá as coisas — de mesa, nunca de luta */
  oficio: Object.freeze([
    Object.freeze({ raiz: "ferreir", itens: Object.freeze(["Martelo de forja"]) }),
    Object.freeze({ raiz: "mercad", itens: Object.freeze(["Balança de bolso"]) }),
    Object.freeze({ raiz: "comerciant", itens: Object.freeze(["Balança de bolso"]) }),
    Object.freeze({ raiz: "pescad", itens: Object.freeze(["Rede de pesca"]) }),
    Object.freeze({ raiz: "sacerd", itens: Object.freeze(["Símbolo sagrado"]) }),
    Object.freeze({ raiz: "clerig", itens: Object.freeze(["Símbolo sagrado"]) }),
    Object.freeze({ raiz: "estalaj", itens: Object.freeze(["Molho de chaves"]) }),
    Object.freeze({ raiz: "taberneir", itens: Object.freeze(["Molho de chaves"]) }),
    Object.freeze({ raiz: "guard", itens: Object.freeze(["Apito de latão"]) }),
    Object.freeze({ raiz: "soldad", itens: Object.freeze(["Apito de latão"]) }),
    Object.freeze({ raiz: "cacad", itens: Object.freeze(["Faca de esfolar"]) }),
    Object.freeze({ raiz: "lenhad", itens: Object.freeze(["Machadinha"]) }),
    Object.freeze({ raiz: "boticar", itens: Object.freeze(["Frasco de ervas"]) }),
    Object.freeze({ raiz: "curandeir", itens: Object.freeze(["Frasco de ervas"]) }),
    Object.freeze({ raiz: "music", itens: Object.freeze(["Flauta de osso"]) }),
    Object.freeze({ raiz: "bardo", itens: Object.freeze(["Flauta de osso"]) }),
    Object.freeze({ raiz: "escrib", itens: Object.freeze(["Pena e tinteiro"]) }),
    Object.freeze({ raiz: "copista", itens: Object.freeze(["Pena e tinteiro"]) }),
    Object.freeze({ raiz: "mago", itens: Object.freeze(["Caderno de notas"]) }),
    Object.freeze({ raiz: "pastor", itens: Object.freeze(["Cajado de pastor"]) }),
    Object.freeze({ raiz: "campones", itens: Object.freeze(["Foice pequena"]) }),
    Object.freeze({ raiz: "lavrad", itens: Object.freeze(["Foice pequena"]) }),
    Object.freeze({ raiz: "ladr", itens: Object.freeze(["Gazua"]) }),
  ]),
  motivos: Object.freeze({
    invalida: "a transação não diz de quem, para quem ou o quê",
    mesmoLado: "de quem e para quem são o mesmo",
    deNada: "do nada não sai coisa nenhuma",
    semFicha: "falta a ficha do herói",
    jaAplicada: "esta transação já foi aplicada",
    naoTem: "quem entrega não tem isso",
    emUso: "quem entrega está usando isso",
    semDado: "tomar pede o dado passado",
    semResposta: "o pedido ainda não teve resposta",
    semDivida: "não há dívida disso, nessa direção",
    maisQueDevido: "é mais do que se deve",
    morto: "quem receberia está morto",
    chaoSoCoisa: "o chão só guarda coisa, não moeda nem uso",
    semBanca: "essa banca não está aqui",
    teto: "o registro de posse está cheio",
  }),
  nomes: Object.freeze({ heroi: "o herói", mundo: "o mundo", nada: "ninguém", chao: "o chão", banca: "a banca" }),
  moeda: "◉ {N}",
  fato: Object.freeze({
    moveu: "{De} passou {Coisa} para {Para}.",
    troca: "{De} passou {Coisa} para {Para}, e recebeu {Contra}.",
    abriu: " {Devedor} fica devendo {Coisa} a {Credor} até o dia {Prazo}.",
    fechou: " A dívida de {Devedor} com {Credor} ficou paga.",
    abateu: " {Devedor} ainda deve {Resto} a {Credor}.",
  }),
});

const Q = QUEM_TEM_O_QUE;
const L = Q.lados;
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const obj = (x) => (x != null && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const nomeDe = (raw) => (typeof raw === "string" ? raw : (obj(raw) && str(raw.nome)) || "");
const tpl = (s, m) => str(s).replace(/\{(\w+)\}/g, (_, k) => str(m[k]));
const inteiro = (x) => { const n = Math.floor(Number(x)); return Number.isFinite(n) ? n : 0; };
const temChave = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);
const maiuscula = (s) => { const t = str(s).trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; };

/* o FNV-1a de 32 bits → [0, 1): o mesmo hash do butim (o-veredito-da-troca.js) */
const fnv = (s) => { let h = 0x811c9dc5; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h; };
const sorteDe = (s) => fnv(s) / 0x100000000;

/* ---------------- AS PONTAS ---------------- */
function oLado(x) {
  const id = str(x).trim();
  if (!id || id.length > Q.teto.nome * 2) return null;
  if (id === L.heroi) return { tipo: "heroi", id };
  if (id === L.mundo) return { tipo: "mundo", id };
  if (id === L.nada) return { tipo: "nada", id };
  if (id.startsWith(L.chao)) return { tipo: "chao", id, cena: id.slice(L.chao.length) };
  if (id.startsWith(L.banca)) return { tipo: "banca", id, banca: id.slice(L.banca.length) };
  return { tipo: "pessoa", id };
}
/* o id que o catálogo diz ser o dono (a fusão de quem-e-quem.js) */
function oFim(id, c) {
  const a = obj(obj(c.catalogo) && c.catalogo.alias);
  if (!a) return id;
  const vistos = new Set();
  let y = id;
  while (temChave(a, y) && !vistos.has(y)) { vistos.add(y); y = a[y]; }
  return y;
}
const doGrupo = (ficha, id) => arr(obj(ficha) && ficha.grupo).findIndex((g) => obj(g) && !g.invocada && idDe(g, "grupo") === id);
const estaMorto = (id, c) => arr(c.mortos).includes(id) || arr(obj(obj(c.catalogo) && c.catalogo.presenca) && c.catalogo.presenca.mortos).includes(id);
const aBanca = (bancaId, c) => arr(c.bancas).find((m) => obj(m) && str(m.id) === bancaId) || null;
const gastoHoje = (mercado, bancaId, dia) => { const g = obj(obj(obj(mercado) && mercado.gastos) && mercado.gastos[bancaId]); return g && g.dia === dia ? inteiro(g.moedas) : 0; };
const passou = (d) => !!obj(d) && (d.passou === true || d.acontece === true);

/* quem é a pessoa: o mapa que quem chama dá, o catálogo, o núcleo */
function nucleoDe(c) { return Array.isArray(c.nucleo) ? c.nucleo : arr(obj(c.nucleo) && c.nucleo.pessoas); }
function aPessoa(id, c) {
  const dada = obj(obj(c.pessoas) && c.pessoas[id]);
  const doCat = obj(obj(obj(c.catalogo) && c.catalogo.porId) && c.catalogo.porId[id]);
  const doNucleo = nucleoDe(c).find((p) => obj(p) && oFim(idDe(p, "nucleo"), c) === id) || null;
  if (!dada && !doCat && !doNucleo) return null;
  return { ...(doNucleo || {}), ...(doCat || {}), ...(dada || {}), carrega: (dada && dada.carrega) || (doNucleo && doNucleo.carrega) || null };
}
const oNomeDoId = (id) => str(id).split("|").pop().split("~")[0];

/* ---------------- A POSSE INICIAL ----------------
   posseInicial(id, ctx) → { moedas, itens: [item], usos: {} }
   ctx: { semente, pessoas: { id: { nome, papel, oficio, carrega } },
     catalogo (oCatalogo), nucleo, bancas, cidade, dia, mercado }.
   A pessoa do mundo: moeda pela classe do butim (a vítima pobre, comum ou
   abastada pelas mesmas raízes de O_VEREDITO_DA_TROCA.vitima), com a chave
   `${semente}|posse|${id}`; as coisas pelo ofício e pelo objeto que
   carrega. A banca: o estoque que sobra e a gaveta de hoje. O herói, o
   companheiro, o chão, o mundo e o nada não têm posse inicial aqui (a deles
   é a ficha, o chão, ou ilimitada). */
const V = O_VEREDITO_DA_TROCA;
function classeDe(p) {
  const k = sem(`${str(p.papel)} ${str(p.nome)} ${str(p.oficio)}`);
  if (V.vitima.abastado.some((x) => k.includes(x))) return "abastado";
  if (V.vitima.pobre.some((x) => k.includes(x))) return "pobre";
  return "comum";
}
function oObjetoQueCarrega(p) {
  const c = obj(p.carrega);
  if (!c || c.tipo !== Q.carregaQueECoisa) return "";
  const ps = str(c.o).trim().split(/\s+/);
  if (ps.length > 1 && Q.artigos.includes(sem(ps[0]))) ps.shift();
  return maiuscula(ps.join(" ")).slice(0, Q.teto.nome);
}
const semPreco = (it) => { if (!obj(it)) return it; const { preco, detalhe, ...limpo } = it; return limpo; };
function oEstoque(bancaId, c) {
  const m = aBanca(bancaId, c);
  if (!m) return null;
  const comprados = [...arr(obj(obj(c.mercado) && c.mercado.comprados) && c.mercado.comprados[bancaId])].map(sem);
  const itens = [];
  for (const it of arr(m.estoque)) {
    const k = comprados.indexOf(sem(nomeDe(it)));
    if (k >= 0) { comprados.splice(k, 1); continue; }
    if (nomeDe(it)) itens.push(it);
  }
  return { m, itens };
}
export function posseInicial(id, ctx) {
  const c = obj(ctx) || {};
  const lado = oLado(id);
  const vazio = { moedas: 0, itens: [], usos: {} };
  if (!lado) return vazio;
  if (lado.tipo === "banca") {
    const e = oEstoque(lado.banca, c);
    if (!e) return vazio;
    const dia = inteiro(c.dia) || 1;
    return { moedas: podePagar(e.m, obj(c.cidade), dia, gastoHoje(c.mercado, lado.banca, dia)), itens: e.itens, usos: {} };
  }
  if (lado.tipo !== "pessoa") return vazio;
  const p = aPessoa(lado.id, c) || { nome: oNomeDoId(lado.id) };
  const chave = `${str(c.semente)}|${Q.semente}|${lado.id}`;
  const B = V.butim[classeDe(p)];
  const moedas = sorteDe(`${chave}|nada`) < B.nada ? 0 : B.min + Math.floor(sorteDe(`${chave}|quanto`) * (B.max - B.min + 1));
  const k = sem(`${str(p.papel)} ${str(p.oficio)}`);
  const doOficio = (Q.oficio.find((o) => k.includes(o.raiz)) || { itens: [] }).itens;
  const objeto = oObjetoQueCarrega(p);
  return { moedas, itens: [...doOficio, ...(objeto ? [objeto] : [])], usos: {} };
}

/* ---------------- O CAMPO DO SAVE ----------------
   garantirPosses(x) → { v, delta, dividas, aplicadas } | null
   O save sem o campo, o vazio e o lixo dão `null` (tudo se deriva). Os
   tetos cortam: delta além do teto não entra; das dívidas, as fechadas
   saem antes das abertas; das chaves, ficam as últimas. */
function deltaLimpo(d) {
  const o = obj(d);
  if (!o) return null;
  const entrou = arr(o.entrou).filter((x) => nomeDe(x)).slice(0, Q.teto.itens);
  const saiu = arr(o.saiu).map(str).filter(Boolean).slice(0, Q.teto.itens);
  const usos = {};
  for (const u of Q.usos) { const n = inteiro(obj(o.usos) && o.usos[u]); if (n) usos[u] = n; }
  const moedas = inteiro(o.moedas);
  if (!moedas && !entrou.length && !saiu.length && !Object.keys(usos).length) return null;
  return { moedas, entrou, saiu, usos };
}
function oQueLimpo(x) {
  const o = obj(x);
  if (!o || !Q.tipos.includes(o.tipo)) return null;
  const quantos = o.quantos == null ? 1 : inteiro(o.quantos);
  if (quantos < 1 || quantos > Q.teto.quantos) return null;
  const nome = o.tipo === "moedas" ? "moedas" : str(o.nome).trim().slice(0, Q.teto.nome);
  if (!nome) return null;
  if (o.tipo === "uso" && !Q.usos.includes(nome)) return null;
  /* etapa 6: a forma em que a coisa chega (o objeto pronto, e se vai à mochila ou ao corpo) e, para o uso
     que uma banca vende, o nome do item do estoque que o carrega */
  const item = o.tipo === "item" && (obj(o.item) || (typeof o.item === "string" && o.item.trim())) ? { item: o.item } : {};
  const destino = o.tipo === "item" && Q.destinos.includes(o.destino) ? { destino: o.destino } : {};
  const deEstoque = o.tipo === "uso" && typeof o.deEstoque === "string" && o.deEstoque.trim() ? { deEstoque: o.deEstoque.trim().slice(0, Q.teto.nome) } : {};
  return { tipo: o.tipo, nome, quantos, ...item, ...destino, ...deEstoque };
}
function dividaLimpa(d) {
  const o = obj(d);
  if (!o) return null;
  const oQue = oQueLimpo(o.oQue);
  const de = str(o.de).trim(), para = str(o.para).trim(), id = str(o.id).trim();
  if (!oQue || !de || !para || !id) return null;
  const estado = o.estado === Q.estados.fechada ? Q.estados.fechada : Q.estados.aberta;
  const quanto = Math.max(0, inteiro(o.quanto));
  return { id, de, para, oQue: { tipo: oQue.tipo, nome: oQue.nome, quantos: oQue.quantos }, quanto, dia: inteiro(o.dia), prazo: inteiro(o.prazo), estado: quanto ? estado : Q.estados.fechada, origem: str(o.origem).slice(0, Q.teto.nome) };
}
function cortarDividas(lista) {
  let l = lista;
  while (l.length > Q.teto.dividas) {
    const k = l.findIndex((d) => d.estado === Q.estados.fechada);
    if (k < 0) break;
    l = l.filter((_, i) => i !== k);
  }
  return l.slice(0, Q.teto.dividas);
}
export function garantirPosses(x) {
  const o = obj(x);
  if (!o) return null;
  const delta = {};
  for (const id of Object.keys(obj(o.delta) || {})) {
    if (Object.keys(delta).length >= Q.teto.pessoas) break;
    if (!oLado(id) || ["heroi", "mundo", "nada", "chao"].includes(oLado(id).tipo)) continue;
    const d = deltaLimpo(o.delta[id]);
    if (d) delta[id] = d;
  }
  const dividas = cortarDividas(arr(o.dividas).map(dividaLimpa).filter(Boolean));
  const aplicadas = arr(o.aplicadas).map(str).filter((k) => k && k.length <= Q.teto.chave).slice(-Q.teto.aplicadas);
  if (!Object.keys(delta).length && !dividas.length && !aplicadas.length) return null;
  return { v: Q.v, delta, dividas, aplicadas };
}

/* ---------------- A POSSE DE AGORA ----------------
   posseDe(id, posses, ficha, ctx) → { moedas, itens: [item], usos: {},
     emUso: [item], ilimitado }
   = a posse inicial + o delta do registro; o herói e o companheiro pela
   ficha. `emUso` é o que veste: é dele, e não sai numa troca. */
const deltaVazio = () => ({ moedas: 0, entrou: [], saiu: [], usos: {} });
function comDelta(inicial, d) {
  const resta = [...arr(d.saiu)].map(sem);
  const itens = [];
  for (const it of inicial.itens) {
    const k = resta.indexOf(sem(nomeDe(it)));
    if (k >= 0) { resta.splice(k, 1); continue; }
    itens.push(it);
  }
  const usos = { ...inicial.usos };
  for (const u of Object.keys(obj(d.usos) || {})) usos[u] = (inteiro(usos[u]) || 0) + inteiro(d.usos[u]);
  return { moedas: inicial.moedas + inteiro(d.moedas), itens: [...itens, ...arr(d.entrou)], usos };
}
const usosDaFicha = (sup) => { const s = obj(sup) || {}; const u = {}; for (const k of Q.usos) u[k] = Math.max(0, inteiro(s[k])); return u; };
export function posseDe(id, posses, ficha, ctx) {
  const c = obj(ctx) || {};
  const lado0 = oLado(id);
  const vazio = { moedas: 0, itens: [], usos: {}, emUso: [], ilimitado: false };
  if (!lado0) return vazio;
  const lado = lado0.tipo === "pessoa" ? oLado(oFim(lado0.id, c)) : lado0;
  const P = garantirPosses(posses);
  const d = (P && P.delta[lado.id]) || deltaVazio();
  const F = obj(ficha);
  if (lado.tipo === "heroi") {
    if (!F) return vazio;
    return { moedas: Math.max(0, inteiro(F.moedas)), itens: [...arr(F.inventario), ...arr(F.equipamento)], usos: usosDaFicha(F.suprimentos), emUso: Object.values(obj(F.equipados) || {}).filter((x) => nomeDe(x)), ilimitado: false };
  }
  if (lado.tipo === "mundo") return { ...vazio, moedas: Infinity, ilimitado: true };
  if (lado.tipo === "nada") return vazio;
  if (lado.tipo === "chao") {
    const ch = garantirChao(c.chao);
    return { ...vazio, itens: ch.itens.filter((a) => nomeDe(a)) };
  }
  const g = lado.tipo === "pessoa" ? doGrupo(F, lado.id) : -1;
  if (g >= 0) {
    const m = F.grupo[g];
    const x = comDelta({ moedas: 0, itens: arr(m.inventario), usos: {} }, { ...d, entrou: [], saiu: [] });
    return { ...x, moedas: Math.max(0, x.moedas), emUso: Object.values(obj(m.equipados) || {}).filter((y) => nomeDe(y)), ilimitado: false };
  }
  const x = comDelta(posseInicial(lado.id, c), d);
  return { ...x, moedas: Math.max(0, x.moedas), emUso: [], ilimitado: false };
}

/* dividasDe(posses, id) → { deve: [divida], aReceber: [divida] } — as abertas */
export function dividasDe(posses, id) {
  const P = garantirPosses(posses);
  const abertas = P ? P.dividas.filter((d) => d.estado === Q.estados.aberta) : [];
  return { deve: abertas.filter((d) => d.de === id), aReceber: abertas.filter((d) => d.para === id) };
}

/* ============================================================
   A TRANSAÇÃO
   aplicarTransacao(posses, ficha, t, ctx) →
     { ok, motivo, ficha, posses, chao, mercado, mudou: [{ coisa, quantos,
       de, para }], fato }
   ctx: o de posseInicial, mais { chao, mercado, dado, aceito, mortos }.
   Na recusa, tudo volta como veio, com o motivo (QUEM_TEM_O_QUE.motivos).
   ============================================================ */
const casa = (it, nome) => sem(nomeDe(it)) === sem(nome);
function oSujeito(S, id) { return temChave(S.delta, id) ? S.delta[id] : deltaVazio(); }
function porDelta(S, id, d) {
  const limpo = deltaLimpo(d);
  const delta = { ...S.delta };
  if (limpo) delta[id] = limpo; else delete delta[id];
  return { ...S, delta };
}
const comMercado = (S) => obj(S.mercado) || { comprados: {}, gastos: {} };

/* TIRAR: confere que o lado tem a coisa e tira; devolve { S, coisas } ou { motivo } */
function tirar(S, lado, oQue, c) {
  const q = oQue.quantos;
  if (lado.tipo === "mundo") {
    const coisas = oQue.tipo === "item" ? Array.from({ length: q }, () => oQue.item || oQue.nome) : [];
    return { S, coisas };
  }
  if (lado.tipo === "nada") return { motivo: "deNada" };
  if (lado.tipo === "heroi") {
    const F = S.ficha;
    if (oQue.tipo === "moedas") {
      if (inteiro(F.moedas) < q) return { motivo: "naoTem" };
      return { S: { ...S, ficha: { ...F, moedas: inteiro(F.moedas) - q } }, coisas: [] };
    }
    if (oQue.tipo === "uso") {
      const sup = obj(F.suprimentos) || {};
      if (inteiro(sup[oQue.nome]) < q) return { motivo: "naoTem" };
      return { S: { ...S, ficha: { ...F, suprimentos: { ...sup, [oQue.nome]: inteiro(sup[oQue.nome]) - q } } }, coisas: [] };
    }
    let inv = [...arr(F.inventario)], eqp = [...arr(F.equipamento)];
    const coisas = [];
    for (let i = 0; i < q; i++) {
      let k = inv.findIndex((it) => casa(it, oQue.nome));
      if (k >= 0) { coisas.push(inv[k]); inv = inv.filter((_, j) => j !== k); continue; }
      k = eqp.findIndex((it) => casa(it, oQue.nome));
      if (k >= 0) { coisas.push(eqp[k]); eqp = eqp.filter((_, j) => j !== k); continue; }
      return { motivo: Object.values(obj(F.equipados) || {}).some((it) => casa(it, oQue.nome)) ? "emUso" : "naoTem" };
    }
    return { S: { ...S, ficha: { ...F, inventario: inv, ...(F.equipamento !== undefined || eqp.length ? { equipamento: eqp } : {}) } }, coisas };
  }
  if (lado.tipo === "chao") {
    if (oQue.tipo !== "item") return { motivo: "naoTem" };
    const ch = garantirChao(S.chao);
    const ids = [];
    for (const a of ch.itens) if (ids.length < q && casa(a, oQue.nome) && a.id) ids.push(a.id);
    if (ids.length < q) return { motivo: "naoTem" };
    const r = tirarDoChao(ch, ids);
    return { S: { ...S, chao: r.chao, tocouChao: true }, coisas: r.pegos.map((a) => ({ coisa: a.pronto != null ? a.pronto : a.nome, destino: a.destino })) };
  }
  if (lado.tipo === "banca") {
    const e = oEstoque(lado.banca, { ...c, mercado: S.mercado });
    if (!e) return { motivo: "semBanca" };
    const dia = inteiro(c.dia) || 1;
    if (oQue.tipo === "moedas") {
      const gasto = gastoHoje(S.mercado, lado.banca, dia);
      if (podePagar(e.m, obj(c.cidade), dia, gasto) < q) return { motivo: "naoTem" };
      const M = comMercado(S);
      return { S: { ...S, mercado: { ...M, gastos: { ...(obj(M.gastos) || {}), [lado.banca]: { dia, moedas: gasto + q } } }, tocouMercado: true }, coisas: [] };
    }
    if (oQue.tipo === "uso") {
      /* etapa 6: o uso que a banca vende sai do estoque (o item que o carrega); o resto, do delta dela */
      const k = oQue.deEstoque ? e.itens.findIndex((it) => casa(it, oQue.deEstoque)) : -1;
      if (k < 0) return tirarDoDelta(S, lado.id, oQue, []);
      const M = comMercado(S);
      const comprados = obj(M.comprados) || {};
      return { S: { ...S, mercado: { ...M, comprados: { ...comprados, [lado.banca]: [...arr(comprados[lado.banca]), nomeDe(e.itens[k])] } }, tocouMercado: true }, coisas: [] };
    }
    /* o que se compra sai do estoque (comprados); o que ela comprou antes, do delta */
    let S2 = S;
    const coisas = [];
    let estoque = [...e.itens];
    for (let i = 0; i < q; i++) {
      const k = estoque.findIndex((it) => casa(it, oQue.nome));
      if (k >= 0) {
        const M = comMercado(S2);
        const comprados = obj(M.comprados) || {};
        S2 = { ...S2, mercado: { ...M, comprados: { ...comprados, [lado.banca]: [...arr(comprados[lado.banca]), nomeDe(estoque[k])] } }, tocouMercado: true };
        coisas.push(semPreco(estoque[k]));
        estoque = estoque.filter((_, j) => j !== k);
        continue;
      }
      const r = tirarDoDelta(S2, lado.id, { ...oQue, quantos: 1 }, []);
      if (r.motivo) return r;
      S2 = r.S; coisas.push(...r.coisas);
    }
    return { S: S2, coisas };
  }
  /* a pessoa: o companheiro pela ficha, o personagem do mundo pela posse */
  const g = doGrupo(S.ficha, lado.id);
  if (g >= 0 && oQue.tipo === "item") {
    const m = S.ficha.grupo[g];
    let inv = [...arr(m.inventario)];
    const coisas = [];
    for (let i = 0; i < q; i++) {
      const k = inv.findIndex((it) => casa(it, oQue.nome));
      if (k < 0) return { motivo: Object.values(obj(m.equipados) || {}).some((it) => casa(it, oQue.nome)) ? "emUso" : "naoTem" };
      coisas.push(inv[k]); inv = inv.filter((_, j) => j !== k);
    }
    const grupo = S.ficha.grupo.map((x, j) => (j === g ? { ...m, inventario: inv } : x));
    return { S: { ...S, ficha: { ...S.ficha, grupo } }, coisas };
  }
  const inicial = g >= 0 ? { moedas: 0, itens: [], usos: {} } : posseInicial(lado.id, c);
  return tirarDoDelta(S, lado.id, oQue, inicial.itens, inicial);
}
function tirarDoDelta(S, id, oQue, itensIniciais, inicial0) {
  const q = oQue.quantos;
  const inicial = inicial0 || { moedas: 0, itens: itensIniciais, usos: {} };
  const d = oSujeito(S, id);
  const agora = comDelta(inicial, d);
  if (oQue.tipo === "moedas") {
    if (agora.moedas < q) return { motivo: "naoTem" };
    return { S: porDelta(S, id, { ...d, moedas: inteiro(d.moedas) - q }), coisas: [] };
  }
  if (oQue.tipo === "uso") {
    if (inteiro(agora.usos[oQue.nome]) < q) return { motivo: "naoTem" };
    return { S: porDelta(S, id, { ...d, usos: { ...d.usos, [oQue.nome]: inteiro(d.usos[oQue.nome]) - q } }), coisas: [] };
  }
  if (agora.itens.filter((it) => casa(it, oQue.nome)).length < q) return { motivo: "naoTem" };
  let entrou = [...d.entrou], saiu = [...d.saiu];
  const coisas = [];
  for (let i = 0; i < q; i++) {
    const k = entrou.findIndex((it) => casa(it, oQue.nome));
    if (k >= 0) { coisas.push(entrou[k]); entrou = entrou.filter((_, j) => j !== k); continue; }
    const it = inicial.itens.find((x) => casa(x, oQue.nome));
    coisas.push(it); saiu = [...saiu, nomeDe(it)];
  }
  return { S: porDelta(S, id, { ...d, entrou, saiu }), coisas };
}

/* PÔR: o lado recebe; devolve { S } ou { motivo } */
const impressao = (x) => { let b; try { b = JSON.stringify(x); } catch { b = String(x); } return `ch${hashSemente(String(b)).toString(36)}`; };
function por(S, lado, oQue, coisas0, c, deId) {
  const q = oQue.quantos;
  let coisas = coisas0.map((x) => (obj(x) && temChave(x, "destino") && temChave(x, "coisa") ? x : { coisa: x, destino: "" }));
  if (lado.tipo === "mundo" || lado.tipo === "nada") return { S };
  if (lado.tipo === "heroi") {
    const F = S.ficha;
    if (oQue.tipo === "moedas") return { S: { ...S, ficha: { ...F, moedas: inteiro(F.moedas) + q } } };
    if (oQue.tipo === "uso") { const sup = obj(F.suprimentos) || {}; return { S: { ...S, ficha: { ...F, suprimentos: { ...sup, [oQue.nome]: inteiro(sup[oQue.nome]) + q } } } }; }
    /* etapa 6: a forma em que a coisa chega, quando a transação a diz, vale sobre a de quem a tirou */
    if (oQue.tipo === "item" && (oQue.item != null || oQue.destino)) coisas = coisas.map((x) => ({ coisa: oQue.item != null ? oQue.item : x.coisa, destino: oQue.destino || x.destino }));
    const paraEqp = coisas.filter((x) => x.destino === "equipamento").map((x) => x.coisa);
    const paraInv = coisas.filter((x) => x.destino !== "equipamento").map((x) => x.coisa);
    return { S: { ...S, ficha: { ...F, inventario: [...arr(F.inventario), ...paraInv], ...(paraEqp.length ? { equipamento: [...arr(F.equipamento), ...paraEqp] } : {}) } } };
  }
  if (lado.tipo === "chao") {
    if (oQue.tipo !== "item") return { motivo: "chaoSoCoisa" };
    const ch = garantirChao(S.chao);
    const novos = coisas.map((x) => {
      const pronto = x.coisa;
      const tipo = obj(pronto) ? str(pronto.tipo) : "";
      const a = { especie: "largado", nome: nomeDe(pronto), icone: "✦", raridade: (obj(pronto) && pronto.raridade) || "comum", detalhe: "", de: deId, x: null, y: null, qtd: 1, destino: tipo === "arma" || tipo === "armadura" ? "equipamento" : "inventario", pronto };
      return { id: impressao([a.especie, a.nome, a.de, a.pronto]), ...a };
    });
    return { S: { ...S, chao: porNoChao(ch, novos, { cena: ch.cena || lado.cena }), tocouChao: true } };
  }
  if (lado.tipo === "banca") {
    if (!aBanca(lado.banca, c)) return { motivo: "semBanca" };
    const dia = inteiro(c.dia) || 1;
    if (oQue.tipo === "moedas") {
      /* a moeda que entra na gaveta hoje desconta o gasto de hoje */
      const M = comMercado(S);
      return { S: { ...S, mercado: { ...M, gastos: { ...(obj(M.gastos) || {}), [lado.banca]: { dia, moedas: gastoHoje(S.mercado, lado.banca, dia) - q } } }, tocouMercado: true } };
    }
    if (oQue.tipo === "uso") { const d = oSujeito(S, lado.id); return { S: porDelta(S, lado.id, { ...d, usos: { ...d.usos, [oQue.nome]: inteiro(d.usos[oQue.nome]) + q } }) }; }
    /* o que volta à banca que o vendeu sai de `comprados`; o resto entra no delta */
    let S2 = S;
    for (const x of coisas) {
      const M = comMercado(S2);
      const comprados = obj(M.comprados) || {};
      const lista = arr(comprados[lado.banca]);
      const k = lista.findIndex((n) => sem(n) === sem(nomeDe(x.coisa)));
      if (k >= 0) { S2 = { ...S2, mercado: { ...M, comprados: { ...comprados, [lado.banca]: lista.filter((_, j) => j !== k) } }, tocouMercado: true }; continue; }
      const d = oSujeito(S2, lado.id);
      S2 = porDelta(S2, lado.id, { ...d, entrou: [...d.entrou, x.coisa] });
    }
    return { S: S2 };
  }
  const g = doGrupo(S.ficha, lado.id);
  if (g >= 0 && oQue.tipo === "item") {
    const m = S.ficha.grupo[g];
    const grupo = S.ficha.grupo.map((x, j) => (j === g ? { ...m, inventario: [...arr(m.inventario), ...coisas.map((y) => y.coisa)] } : x));
    return { S: { ...S, ficha: { ...S.ficha, grupo } } };
  }
  const d = oSujeito(S, lado.id);
  if (oQue.tipo === "moedas") return { S: porDelta(S, lado.id, { ...d, moedas: inteiro(d.moedas) + q }) };
  if (oQue.tipo === "uso") return { S: porDelta(S, lado.id, { ...d, usos: { ...d.usos, [oQue.nome]: inteiro(d.usos[oQue.nome]) + q } }) };
  /* a coisa que tinha saído dele volta ao lugar dela; a nova entra */
  let entrou = [...d.entrou], saiu = [...d.saiu];
  for (const x of coisas) {
    const k = saiu.findIndex((n) => sem(n) === sem(nomeDe(x.coisa)));
    if (k >= 0) saiu = saiu.filter((_, j) => j !== k); else entrou = [...entrou, x.coisa];
  }
  return { S: porDelta(S, lado.id, { ...d, entrou, saiu }) };
}

function oNomeDoLado(id, c) {
  const lado = oLado(id);
  if (!lado) return "";
  if (lado.tipo === "heroi") return Q.nomes.heroi;
  if (lado.tipo === "mundo") return Q.nomes.mundo;
  if (lado.tipo === "nada") return Q.nomes.nada;
  if (lado.tipo === "chao") return Q.nomes.chao;
  if (lado.tipo === "banca") { const m = aBanca(lado.banca, c); return (m && str(m.nome)) || Q.nomes.banca; }
  const p = aPessoa(lado.id, c);
  return (p && str(p.nome)) || oNomeDoId(lado.id);
}
const aCoisa = (o) => (o.tipo === "moedas" ? tpl(Q.moeda, { N: o.quantos }) : o.quantos > 1 ? `${o.quantos} ${o.nome}` : o.nome);

export function aplicarTransacao(posses, ficha, t, ctx) {
  const c = obj(ctx) || {};
  const P0 = garantirPosses(posses) || { v: Q.v, delta: {}, dividas: [], aplicadas: [] };
  const F0 = obj(ficha);
  const chao0 = c.chao === undefined ? null : c.chao;
  const mercado0 = c.mercado === undefined ? null : c.mercado;
  const recusa = (motivo) => ({ ok: false, motivo, texto: Q.motivos[motivo] || "", ficha, posses, chao: chao0, mercado: mercado0, mudou: [], fato: "" });
  const T = obj(t);
  if (!T) return recusa("invalida");
  const de0 = oLado(T.de), para0 = oLado(T.para);
  const oQue = oQueLimpo(T.oQue);
  const contra = T.contra == null ? null : oQueLimpo(T.contra);
  if (!de0 || !para0 || !oQue || (T.contra != null && !contra)) return recusa("invalida");
  const de = de0.tipo === "pessoa" ? oLado(oFim(de0.id, c)) : de0;
  const para = para0.tipo === "pessoa" ? oLado(oFim(para0.id, c)) : para0;
  if (de.id === para.id) return recusa("mesmoLado");
  if (de.tipo === "nada" || (contra && para.tipo === "nada")) return recusa("deNada");
  const consentimento = Q.consentimentos.includes(T.consentimento) ? T.consentimento : Q.consentimentoPadrao;
  const chave = typeof T.chave === "string" && T.chave.trim() && T.chave.length <= Q.teto.chave ? T.chave.trim() : "";
  if (chave && P0.aplicadas.includes(chave)) return recusa("jaAplicada");
  const tocaFicha = [de, para].some((l) => l.tipo === "heroi" || (l.tipo === "pessoa" && doGrupo(F0, l.id) >= 0));
  if (!F0 && [de, para].some((l) => l.tipo === "heroi")) return recusa("semFicha");
  if ([para, ...(contra ? [de] : [])].some((l) => l.tipo === "pessoa" && estaMorto(l.id, c))) return recusa("morto");
  const deMorto = de.tipo === "pessoa" && estaMorto(de.id, c);
  const dePessoa = (de.tipo === "pessoa" || de.tipo === "banca") && !deMorto;
  if (consentimento === "tomado" && dePessoa && !passou(c.dado)) return recusa("semDado");
  if (consentimento === "pedido" && dePessoa && !passou(c.dado) && c.aceito !== true) return recusa("semResposta");
  const prazoDias = T.prazo == null || consentimento === "devido" ? 0 : inteiro(T.prazo);
  if (T.prazo != null && consentimento !== "devido" && (prazoDias < Q.teto.prazo.min || prazoDias > Q.teto.prazo.max)) return recusa("invalida");
  const dia = inteiro(c.dia);

  /* a dívida que esta entrega paga: mesma direção, mesma coisa, nunca acima do devido */
  let dividas = [...P0.dividas];
  const pagas = [];
  if (consentimento === "devido") {
    const casam = dividas.map((d, i) => ({ d, i })).filter(({ d }) => d.estado === Q.estados.aberta && d.de === de.id && d.para === para.id && d.oQue.tipo === oQue.tipo && (oQue.tipo === "moedas" || sem(d.oQue.nome) === sem(oQue.nome)));
    if (!casam.length) return recusa("semDivida");
    if (casam.reduce((s, { d }) => s + d.quanto, 0) < oQue.quantos) return recusa("maisQueDevido");
    let falta = oQue.quantos;
    for (const { d, i } of casam) {
      if (!falta) break;
      const abate = Math.min(falta, d.quanto);
      falta -= abate;
      const quanto = d.quanto - abate;
      dividas[i] = { ...d, quanto, estado: quanto ? Q.estados.aberta : Q.estados.fechada };
      pagas.push(dividas[i]);
    }
  }

  /* os dois lados, de uma vez ou nenhum: primeiro tira, depois põe */
  let S = { ficha: F0 || {}, delta: { ...P0.delta }, chao: chao0, mercado: mercado0, tocouChao: false, tocouMercado: false };
  const ida = tirar(S, de, oQue, c);
  if (ida.motivo) return recusa(ida.motivo);
  S = ida.S;
  const adiada = prazoDias > 0 && !!contra;
  let volta = null;
  if (contra && !adiada) {
    volta = tirar(S, para, contra, c);
    if (volta.motivo) return recusa(volta.motivo);
    S = volta.S;
  }
  const pos = por(S, para, oQue, ida.coisas, c, de.id);
  if (pos.motivo) return recusa(pos.motivo);
  S = pos.S;
  if (volta) {
    const pos2 = por(S, de, contra, volta.coisas, c, para.id);
    if (pos2.motivo) return recusa(pos2.motivo);
    S = pos2.S;
  }

  /* o empréstimo e o fiado abrem a dívida de quem recebeu com quem deu */
  let aberta = null;
  if (prazoDias > 0) {
    const oQueDevido = adiada ? contra : oQue;
    aberta = { id: `div|${chave || impressao([de.id, para.id, oQueDevido, dia])}`, de: para.id, para: de.id, oQue: { tipo: oQueDevido.tipo, nome: oQueDevido.nome, quantos: oQueDevido.quantos }, quanto: oQueDevido.quantos, dia, prazo: dia + prazoDias, estado: Q.estados.aberta, origem: str(T.origem).slice(0, Q.teto.nome) };
    dividas = [...dividas, aberta];
  }
  dividas = cortarDividas(dividas);
  if (aberta && !dividas.some((d) => d.id === aberta.id)) return recusa("teto");
  if (Object.keys(S.delta).length > Q.teto.pessoas || Object.values(S.delta).some((d) => d.entrou.length > Q.teto.itens || d.saiu.length > Q.teto.itens)) return recusa("teto");
  const aplicadas = chave ? [...P0.aplicadas, chave].slice(-Q.teto.aplicadas) : P0.aplicadas;
  const novas = garantirPosses({ v: Q.v, delta: S.delta, dividas, aplicadas });

  const nomeDoItem = (x) => nomeDe(obj(x) && temChave(x, "coisa") && temChave(x, "destino") ? x.coisa : x);
  const linhas = (o, coisas, a, b) => (o.tipo === "item" ? coisas.map((x) => ({ coisa: nomeDoItem(x) || o.nome, quantos: 1, de: a, para: b })) : [{ coisa: o.nome, quantos: o.quantos, de: a, para: b }]);
  const mudou = [...linhas(oQue, ida.coisas, de.id, para.id), ...(volta ? linhas(contra, volta.coisas, para.id, de.id) : [])];
  const nomes = { De: oNomeDoLado(de.id, c), Para: oNomeDoLado(para.id, c), Coisa: aCoisa(oQue), Contra: contra ? aCoisa(contra) : "" };
  let fato = tpl(volta ? Q.fato.troca : Q.fato.moveu, nomes);
  if (aberta) fato += tpl(Q.fato.abriu, { Devedor: oNomeDoLado(aberta.de, c), Credor: oNomeDoLado(aberta.para, c), Coisa: aCoisa(aberta.oQue), Prazo: aberta.prazo });
  for (const d of pagas) {
    const m = { Devedor: oNomeDoLado(d.de, c), Credor: oNomeDoLado(d.para, c), Resto: aCoisa({ ...d.oQue, quantos: d.quanto }) };
    fato += tpl(d.estado === Q.estados.fechada ? Q.fato.fechou : Q.fato.abateu, m);
  }
  fato = maiuscula(fato);
  return {
    ok: true, motivo: "", texto: "",
    ficha: tocaFicha ? S.ficha : ficha,
    posses: novas,
    chao: S.tocouChao ? S.chao : chao0,
    mercado: S.tocouMercado ? S.mercado : mercado0,
    mudou, fato,
  };
}
