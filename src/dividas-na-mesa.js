/* ============================================================
   DÍVIDAS NA MESA (25/11/2026, etapa 9 da planta
   mente/plano-identidade-e-posse.md)

   O registro de posse (quem-tem-o-que.js) já sabia quem deve a quem: o
   empréstimo e o fiado abrem a dívida, a entrega `devido` abate ou fecha,
   a coisa da quest é devida ao dono (os-caminhos-da-posse.js) e, desde
   esta etapa, o que se toma de alguém deixa o fato e a restituição. Mas
   ninguém via: o Narrador não sabia que a Prudence que entrou na taverna
   deve cinco moedas ao herói, e o jogador que pagou três de cinco não lia
   que faltavam duas.

   Este módulo é a LEITURA do registro, e nada mais:
     · asLinhasDasDividas — o fato curto que vai à pauta de UM turno (o
       canal dinâmico, secção ACABOU DE; nenhum bloco estático), só com o
       credor ou o devedor EM CENA, pelo id da presença. Ninguém em cena,
       nada entra. A dívida vencida diz que venceu (o prazo é o dia da
       dívida: aDividaVenceu). O que se tomou diz se a vítima viu.
     · aQuitacaoDoTurno / comAQuitacao — o que a entrega do herói fez com a
       dívida dele (paga, ou quanto ainda falta), dito na linha da tela e
       no fato do turno.
     · asDividasDaFicha — as linhas de texto do que o herói deve e do que
       lhe devem, para o lugar da ficha que já lista o que ele carrega.

   Nenhuma regra por palavra, verbo ou nome: tudo sai da forma do registro
   (de, para, a coisa, quanto, o prazo, o estado). PURO E DETERMINÍSTICO;
   nada que entra é mutado; `null` e lixo dão o vazio.
   ============================================================ */
import { QUEM_TEM_O_QUE, dividasDe, tomadasDe, aDividaVenceu } from "./quem-tem-o-que.js";
import { idDe } from "./quem-e-quem.js";

/* ---------------- A TABELA ----------------
   `secao`: a secção da pauta de um turno onde a linha entra (PAUTA_DE_UM_TURNO).
   `teto.linhas`: quantas linhas, no máximo, num turno (a pauta tem teto, e a
   dívida é uma linha curta: três pessoas com dívida já são muitas numa cena).
   `teto.nome`: o corte do nome. `pauta`: o que o Narrador lê, na voz do herói
   (a pauta é escrita na primeira pessoa). `ficha`: o que o jogador lê. */
export const DIVIDAS_NA_MESA = Object.freeze({
  v: 1,
  secao: "acabou",
  teto: Object.freeze({ linhas: 3, nome: 40 }),
  moeda: "◉ {N}",
  pauta: Object.freeze({
    heroiDeve: "Devo {Coisa} a {Nome}{Vence}.",
    deveAoHeroi: "{Nome} me deve {Coisa}{Vence}.",
    vencida: ", e o prazo venceu no dia {Prazo}",
    tomeiViu: "Tomei {Coisa} de {Nome}, e {Nome} viu.",
    tomeiNaoViu: "Tomei {Coisa} de {Nome} sem ser visto: {Nome} não sabe que fui eu.",
    meTomou: "{Nome} me tomou {Coisa}.",
  }),
  ficha: Object.freeze({
    heroiDeve: "Você deve {Coisa} a {Nome}{Vence}",
    deveAoHeroi: "{Nome} lhe deve {Coisa}{Vence}",
    vencida: " (venceu no dia {Prazo})",
    prazo: " (até o dia {Prazo})",
  }),
  quitacao: Object.freeze({
    tela: Object.freeze({ paga: " A dívida com {Nome} está paga.", resta: " Ainda falta {Resto} para {Nome}." }),
    fato: Object.freeze({ paga: " A minha dívida com {Nome} está paga.", resta: " Ainda devo {Resto} a {Nome}." }),
  }),
});

const D = DIVIDAS_NA_MESA;
const Q = QUEM_TEM_O_QUE;
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const obj = (x) => (x != null && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const inteiro = (x) => { const n = Math.floor(Number(x)); return Number.isFinite(n) ? n : 0; };
const tpl = (s, m) => str(s).replace(/\{(\w+)\}/g, (_, k) => str(m[k]));
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const semAposto = (n) => str(n).split(",")[0].trim().slice(0, D.teto.nome);
const nomeDoId = (id) => str(id).split("|").pop().split("~")[0];
const aCoisa = (o) => { const x = obj(o) || {}; return x.tipo === "moedas" ? tpl(D.moeda, { N: inteiro(x.quantos) }) : inteiro(x.quantos) > 1 ? `${inteiro(x.quantos)} ${str(x.nome)}` : str(x.nome); };
const ehRestituicao = (d) => str(d && d.id).startsWith(Q.tomada.divida);

/* as dívidas da mesma coisa somadas (duas de moeda ao mesmo credor são uma linha) */
function somadas(lista, dia) {
  const out = [];
  for (const d of lista) {
    const k = d.oQue.tipo === "moedas" ? "moedas" : `${d.oQue.tipo}|${sem(d.oQue.nome)}`;
    const ja = out.find((x) => x.k === k);
    const venceu = aDividaVenceu(d, dia) ? inteiro(d.prazo) : 0;
    if (ja) { ja.quanto += inteiro(d.quanto); if (venceu && (!ja.venceu || venceu < ja.venceu)) ja.venceu = venceu; if (inteiro(d.prazo) > 0 && (!ja.prazo || inteiro(d.prazo) < ja.prazo)) ja.prazo = inteiro(d.prazo); continue; }
    out.push({ k, oQue: d.oQue, quanto: inteiro(d.quanto), venceu, prazo: inteiro(d.prazo) });
  }
  return out;
}

/* ============================================================
   asLinhasDasDividas(pessoas, ctx) → null | { acabou: [linha] }
   pessoas: quem está EM CENA, com o id da presença ([{ id, nome }]; o
   companheiro pelo id do grupo). ctx: { posses, dia }. Só entra quem tem
   dívida aberta com o herói (ou um fato do que se tomou, com a restituição
   aberta). Sem ninguém em cena com dívida, null: nada entra na pauta.
   ============================================================ */
export function asLinhasDasDividas(pessoas, ctx) {
  try {
    const c = obj(ctx) || {};
    const dia = inteiro(c.dia);
    const H = Q.lados.heroi;
    const Dv = dividasDe(c.posses, H);
    const T = tomadasDe(c.posses, H);
    if (!Dv.deve.length && !Dv.aReceber.length && !T.tomou.some((t) => t.aberta) && !T.perdeu.some((t) => t.aberta)) return null;
    const linhas = [];
    const vistos = new Set();
    for (const p of arr(pessoas)) {
      const id = str(obj(p) && p.id).trim();
      if (!id || id === H || vistos.has(id)) continue;
      vistos.add(id);
      const Nome = semAposto(obj(p) && p.nome) || nomeDoId(id);
      const vence = (x) => (x.venceu ? tpl(D.pauta.vencida, { Prazo: x.venceu }) : "");
      for (const x of somadas(Dv.deve.filter((d) => d.para === id && !ehRestituicao(d)), dia)) linhas.push(tpl(D.pauta.heroiDeve, { Coisa: aCoisa({ ...x.oQue, quantos: x.quanto }), Nome, Vence: vence(x) }));
      for (const x of somadas(Dv.aReceber.filter((d) => d.de === id && !ehRestituicao(d)), dia)) linhas.push(tpl(D.pauta.deveAoHeroi, { Coisa: aCoisa({ ...x.oQue, quantos: x.quanto }), Nome, Vence: vence(x) }));
      for (const t of T.tomou.filter((x) => x.de === id && x.aberta)) linhas.push(tpl(t.viu ? D.pauta.tomeiViu : D.pauta.tomeiNaoViu, { Coisa: aCoisa({ ...t.oQue, quantos: t.resta || t.oQue.quantos }), Nome }));
      for (const t of T.perdeu.filter((x) => x.por === id && x.aberta)) linhas.push(tpl(D.pauta.meTomou, { Coisa: aCoisa({ ...t.oQue, quantos: t.resta || t.oQue.quantos }), Nome }));
    }
    if (!linhas.length) return null;
    return Object.freeze({ [D.secao]: Object.freeze(linhas.slice(0, D.teto.linhas)) });
  } catch { return null; }
}

/* quem está em cena para a dívida: a presença (com id) e o grupo (o id do grupo) */
export function quemEstaNaMesa(aqui, grupo) {
  try {
    const out = [];
    for (const p of arr(aqui)) if (obj(p) && str(p.id).trim()) out.push({ id: str(p.id).trim(), nome: str(p.nome) });
    for (const g of arr(grupo)) { if (!obj(g) || g.invocada) continue; const id = idDe(g, "grupo"); if (id) out.push({ id, nome: str(g.nome) }); }
    return out;
  } catch { return []; }
}

/* ============================================================
   aQuitacaoDoTurno(transacoes, antes, depois, nomes) → { linha, fato }
   O que as entregas `devido` do herói fizeram com a dívida dele, credor a
   credor: paga, ou o que ainda falta. antes/depois: o registro de posse
   antes e depois de aplicar. nomes: { id: nome }.
   ============================================================ */
export function aQuitacaoDoTurno(transacoes, antes, depois, nomes) {
  const nada = { linha: "", fato: "" };
  try {
    const H = Q.lados.heroi;
    const credores = [];
    for (const t of arr(transacoes)) if (obj(t) && t.consentimento === "devido" && t.de === H && obj(t.oQue) && str(t.para) && !credores.some((x) => x.para === t.para && x.tipo === t.oQue.tipo && sem(x.nome) === sem(t.oQue.nome))) credores.push({ para: str(t.para), tipo: t.oQue.tipo, nome: str(t.oQue.nome) });
    if (!credores.length) return nada;
    let linha = "", fato = "";
    for (const k of credores) {
      const casa = (d) => d.para === k.para && d.oQue.tipo === k.tipo && (k.tipo === "moedas" || sem(d.oQue.nome) === sem(k.nome));
      const devia = dividasDe(antes, H).deve.filter(casa).reduce((n, d) => n + d.quanto, 0);
      if (!devia) continue;
      const resta = dividasDe(depois, H).deve.filter(casa);
      const n = resta.reduce((s, d) => s + d.quanto, 0);
      const Nome = semAposto(obj(nomes) && nomes[k.para]) || nomeDoId(k.para);
      const Resto = aCoisa({ tipo: k.tipo, nome: (resta[0] && resta[0].oQue.nome) || k.nome, quantos: n });
      linha += tpl(n ? D.quitacao.tela.resta : D.quitacao.tela.paga, { Nome, Resto });
      fato += tpl(n ? D.quitacao.fato.resta : D.quitacao.fato.paga, { Nome, Resto });
    }
    return { linha, fato };
  } catch { return nada; }
}

/* comAQuitacao(v, transacoes, antes, depois, nomes) → o veredito com a quitação dita (o mesmo, se nada) */
export function comAQuitacao(v, transacoes, antes, depois, nomes) {
  try {
    const V = obj(v);
    if (!V) return v;
    const q = aQuitacaoDoTurno(transacoes, antes, depois, nomes);
    if (!q.linha && !q.fato) return v;
    return { ...V, linha: str(V.linha) + q.linha, fato: str(V.fato) + q.fato };
  } catch { return v; }
}

/* ============================================================
   asDividasDaFicha(posses, ctx) → [{ texto, vencida }]
   O que o herói deve e o que lhe devem (abertas), para a ficha. ctx:
   { dia, nomes: { id: nome } }. A restituição do que se tomou não entra
   (quem tomou sabe; o mundo é que pode lembrar).
   ============================================================ */
export function asDividasDaFicha(posses, ctx) {
  try {
    const c = obj(ctx) || {};
    const dia = inteiro(c.dia);
    const H = Q.lados.heroi;
    const Dv = dividasDe(posses, H);
    const nome = (id) => semAposto(obj(c.nomes) && c.nomes[id]) || nomeDoId(id);
    const out = [];
    const linha = (k, quem, x) => {
      const Vence = x.venceu ? tpl(D.ficha.vencida, { Prazo: x.venceu }) : x.prazo ? tpl(D.ficha.prazo, { Prazo: x.prazo }) : "";
      out.push(Object.freeze({ texto: tpl(D.ficha[k], { Coisa: aCoisa({ ...x.oQue, quantos: x.quanto }), Nome: nome(quem), Vence }), vencida: !!x.venceu }));
    };
    const porQuem = (lista, lado) => { const ids = []; for (const d of lista) if (!ids.includes(d[lado])) ids.push(d[lado]); return ids; };
    const deve = Dv.deve.filter((d) => !ehRestituicao(d)), recebe = Dv.aReceber.filter((d) => !ehRestituicao(d));
    for (const id of porQuem(deve, "para")) for (const x of somadas(deve.filter((d) => d.para === id), dia)) linha("heroiDeve", id, x);
    for (const id of porQuem(recebe, "de")) for (const x of somadas(recebe.filter((d) => d.de === id), dia)) linha("deveAoHeroi", id, x);
    return out;
  } catch { return []; }
}
