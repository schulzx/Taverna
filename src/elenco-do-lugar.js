/* ============================================================
   O ELENCO DO LUGAR (S4e, 16/11/2026) — src/elenco-do-lugar.js

   A prova jogada de 16/11 (IA real, 23 respostas) mostrou que pedir ao
   Narrador por veto não basta: onde o sistema não punha ninguém, a prosa
   punha alguém — e batizava-o. A chegada saiu vazia e com «um guarda de
   cota»; a estalagem saiu vazia e com Orla; Kolvar e Thalia nasceram na
   estalagem do nada.

   O DIAGNÓSTICO (Node, 6 mundos da prova da pauta, 2646 cenas de sítio):
     · a ESTALAGEM vazia 126 vezes em 378: a gente da base de uma taverna é
       toda da família «balcao» (gente-por-dentro.js, FAMILIAS_DE_OFICIO —
       turno 11h–2h), e cada um tem a sua folga da semana. O posto
       (quem-esta-aqui.js, `deTurno`) tira com razão quem não está de turno
       — e antes das 11h, ou no dia da folga de todos, a casa ficava sem
       ninguém. 780 das 2646 cenas de sítio (29 %) estavam vazias assim;
     · a CHEGADA vazia em 378 de 378: chegar a uma cidade é ficar no meio
       dela, sem `lugar` (App, `alvo.onde === "cidade"` apaga o lugar), e o
       posto só põe gente com o herói NUM sítio (`noSitio`). A rua não tem
       quem a atenda — é lugar sem função, e lá a gente certa é a sem nome.

   A REGRA DE MESA, do sistema e não do Narrador:
     · todo lugar de cidade COM FUNÇÃO (estalagem, mercado, templo, forja,
       portão, guilda…) tem, à hora do expediente dele, QUEM O ATENDE: a
       gente da base do posto quando está de turno; quando não está ninguém,
       o sistema escala UM figurante — com nome, ofício e género, sorteado
       pela semente do mundo, da cidade e do tipo do sítio. É sempre o mesmo
       (o moço que abre a estalagem de manhã é sempre o mesmo moço), por
       isso não precisa de save: o mundo refá-lo, e a memória do inventado
       conhece-o (`figurantesDaCidade`);
     · fora do expediente a casa pode estar fechada, e um lugar sem função
       (a rua, um beco) fica sem ninguém com nome — a pauta deixa de
       oferecer nomes à mão (`nomesAMao: false`), e quem passar é «um
       carroceiro», nunca batizado.

   Puro, sem React, sem Math.random (a sorte é rngDe). Provado em
   testes/teste-quem-esta-aqui.mjs (a catraca do expediente) e
   testes/teste-elenco-do-lugar.mjs.
   ============================================================ */
import { rngDe } from "./geografia.js";
import { nomePessoa } from "./nomes.js";

const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const semArtigo = (x) => sem(x).replace(/^(o|a|os|as)\s+/, "");
const H = (h) => h * 60;

/* ---------------- A TABELA ----------------
   Por tipo de sítio (o `tipo` de mundo-base.js#LOCAIS, mais o portão, que a
   base não gera mas toda cidade tem): `aberto` — o expediente, de/ate em
   minutos do dia (ate < de atravessa a meia-noite; `sempre` não fecha);
   `oficio` — o figurante que cobre a casa, [homem, mulher]; `palavras` — o
   nome de um sítio que a base não conhece e que diz o tipo (a «Estalagem do
   Corvo» que o mapa abriu). `nomesAMao`: a pauta deixou de oferecer nomes
   livres ao Narrador — quem o sistema não pôs em cena não tem nome. */
export const ELENCO_DO_LUGAR = Object.freeze({
  tipos: Object.freeze({
    taverna: Object.freeze({ aberto: { de: H(6), ate: H(2) }, oficio: ["moço da casa", "moça da casa"], palavras: ["taverna", "estalagem", "pousada", "hospedaria", "albergue", "tasca", "bodega"] }),
    mercado: Object.freeze({ aberto: { de: H(7), ate: H(19) }, oficio: ["vendedor de banca", "vendedora de banca"], palavras: ["mercado", "feira", "bazar"] }),
    templo: Object.freeze({ aberto: { de: H(5), ate: H(21) }, oficio: ["acólito", "acólita"], palavras: ["templo", "ermida", "santuario", "capela", "igreja", "claustro"] }),
    forja: Object.freeze({ aberto: { de: H(6), ate: H(18) }, oficio: ["ajudante da forja", "ajudante da forja"], palavras: ["forja", "ferraria", "ferreiro"] }),
    quartel: Object.freeze({ aberto: "sempre", oficio: ["guarda de plantão", "guarda de plantão"], palavras: ["quartel", "caserna"] }),
    cadeia: Object.freeze({ aberto: "sempre", oficio: ["carcereiro", "carcereira"], palavras: ["cadeia", "prisao", "enxovia"] }),
    biblioteca: Object.freeze({ aberto: { de: H(8), ate: H(20) }, oficio: ["copista", "copista"], palavras: ["biblioteca", "arquivo"] }),
    docas: Object.freeze({ aberto: { de: H(5), ate: H(21) }, oficio: ["estivador", "estivadora"], palavras: ["docas", "cais", "porto"] }),
    arena: Object.freeze({ aberto: { de: H(10), ate: H(22) }, oficio: ["porteiro da arena", "porteira da arena"], palavras: ["arena", "lica"] }),
    "cemitério": Object.freeze({ aberto: { de: H(7), ate: H(19) }, oficio: ["coveiro", "coveira"], palavras: ["cemiterio", "ossario"] }),
    guilda: Object.freeze({ aberto: { de: H(8), ate: H(20) }, oficio: ["escrivão da guilda", "escrivã da guilda"], palavras: ["guilda", "confraria"] }),
    "casa de banhos": Object.freeze({ aberto: { de: H(8), ate: H(22) }, oficio: ["atendente", "atendente"], palavras: ["banhos", "termas"] }),
    portao: Object.freeze({ aberto: "sempre", oficio: ["guarda do portão", "guarda do portão"], palavras: ["portao", "portoes", "porta da cidade"] }),
  }),
  /* o portão: toda cidade tem um, mesmo que a base não o gere como local */
  sempreNaCidade: Object.freeze(["portao"]),
  deOnde: "figurante",
  tentativas: 24,
  nomesAMao: false,
  porque: "quem atende um lugar com função é do sistema: o posto quando está de turno, e quando não está, um figurante com nome que o sistema escala e conhece",
});
const TIPOS = ELENCO_DO_LUGAR.tipos;

/* o expediente do tipo cobre este minuto? Sem minuto (sem relógio), sim. */
export function abertoAgora(tipo, minuto) {
  const t = TIPOS[tipo];
  if (!t) return false;
  if (t.aberto === "sempre") return true;
  const n = Number(minuto);
  if (!Number.isFinite(n)) return true;
  const m = ((Math.floor(n) % 1440) + 1440) % 1440;
  const { de, ate } = t.aberto;
  return de < ate ? m >= de && m < ate : m >= de || m < ate;
}

/* O tipo do sítio: pela gente da base que o posto põe nele (o id dela é
   «cidade|tipo|i», mundo-base.js#genteDoLocal), pelo `tipo` do lugar, ou
   pelas palavras do nome. → "" quando o sistema não sabe (lugar sem função). */
export function tipoDoSitio(lugar, gente) {
  const L = ehObj(lugar) ? lugar : { nome: str(lugar) };
  const nome = semArtigo(L.nome);
  if (!nome) return "";
  if (TIPOS[str(L.tipo)]) return str(L.tipo);
  for (const p of arr(gente)) {
    if (!ehObj(p) || semArtigo(p.local) !== nome) continue;
    const t = str(p.id).split("|")[1] || "";
    if (TIPOS[t]) return t;
  }
  const limpo = " " + nome.replace(/[^a-z0-9]+/g, " ").trim() + " ";
  for (const [t, def] of Object.entries(TIPOS)) if (def.palavras.some((w) => limpo.includes(" " + w + " "))) return t;
  return "";
}

/* O figurante que cobre a casa: um por cidade e por tipo, sempre o mesmo.
   `usados`: nomes que ele não pode repetir (a gente da base desta cidade) —
   compara-se o primeiro nome. → { nome, rotulo, genero: "homem"|"mulher", tipo, deOnde } | null */
export function figuranteDoSitio(o) {
  const x = ehObj(o) ? o : {};
  const t = TIPOS[str(x.tipo)];
  if (!t) return null;
  const ja = new Set(arr(x.usados).map((u) => sem(ehObj(u) ? u.nome : u).split(" ")[0]).filter(Boolean));
  const rnd = rngDe(`${str(x.semente)}|figurante|${sem(x.cidade)}|${x.tipo}`);
  const mulher = rnd() < 0.5;
  for (let i = 0; i < ELENCO_DO_LUGAR.tentativas; i++) {
    let nome = "";
    try { nome = nomePessoa(str(x.genero) || undefined, mulher ? "fem" : "masc", rnd, x.lex || null); } catch { nome = ""; }
    const p = sem(nome).split(" ")[0];
    if (!p || ja.has(p)) continue;
    return { nome, rotulo: t.oficio[mulher ? 1 : 0], genero: mulher ? "mulher" : "homem", tipo: str(x.tipo), deOnde: ELENCO_DO_LUGAR.deOnde };
  }
  return null;
}

/* Todos os figurantes de uma cidade (os tipos dos locais da base + o
   portão), para quem precisa de os conhecer sem estar no sítio — a memória
   do inventado (motor/memoria-do-inventado.js) não os acusa de invenção. */
export function figurantesDaCidade(o) {
  const x = ehObj(o) ? o : {};
  const tipos = [...new Set([...arr(x.locais).map((l) => str(ehObj(l) ? l.tipo : l)), ...ELENCO_DO_LUGAR.sempreNaCidade])].filter((t) => TIPOS[t]);
  return tipos.map((tipo) => figuranteDoSitio({ ...x, tipo })).filter(Boolean);
}

/* Quem atende este sítio agora, quando o posto não pôs ninguém: o
   figurante, se o sítio tem função e está aberto. ctx: { semente, cidade,
   minuto, genero, lex, gente (a base da cidade) }. → [] | [figurante] */
export function quemAtende(lugar, ctx) {
  const c = ehObj(ctx) ? ctx : {};
  const tipo = tipoDoSitio(lugar, c.gente);
  if (!tipo || !abertoAgora(tipo, c.minuto)) return [];
  const f = figuranteDoSitio({ semente: c.semente, cidade: c.cidade, tipo, genero: c.genero, lex: c.lex, usados: arr(c.gente) });
  return f ? [f] : [];
}
