/* ============================================================
   O CARTÃO DA SESSÃO — a composição (V10, 16/11)

   «O Wrapped do RPG»: ao levantar da mesa o jogo compõe uma imagem
   1080 × 1350 que o jogador guarda e partilha — cada partilha um anúncio
   com a arte da casa. A forma está escrita em mente/formas.md, F6 §3
   («O cartão da sessão, campo a campo»); este módulo é a metade que se
   PROVA: dado o resumo da sessão (registro-da-sessao.js), devolve os
   campos, a variação e a geometria. O desenho em canvas mora em
   painel-cartao.jsx e só pinta o que daqui sai.

   As regras do F6, uma a uma:
   · nunca um buraco — todo campo tem o que mostrar quando falta;
   · nunca texto inventado — o que não está no estado não está no cartão;
   · o vilão sem o segredo — o nome só depois de o herói o saber
     (a camada «rosto», vilao.js); antes, «SEM ROSTO»;
   · nada pessoal — nem conta, nem data;
   · piso de letra de 34 px (a imagem aparece a ~36 % num celular).

   Mesmo resumo ⇒ mesmo cartão: nada aqui lê o relógio nem o acaso.
   ============================================================ */

import { T, LUZ_DA_MESA } from "./estilo.js";
import { FASES } from "./vilao.js";

/* ---------------- a tabela (geometria e tinta, de formas.md F6 §3) ---------------- */
export const CARTAO_DA_SESSAO = Object.freeze({
  largura: 1080, altura: 1350,
  pisoDaLetra: 34,
  borda: Object.freeze({ couro: 14, fio: 1.5, fioEm: 18 }),
  halo: Object.freeze({ x: 540, y: 520, raio: 800, alfa: Object.freeze({ dia: 0.20, noite: 0.30 }) }),
  penumbra: Object.freeze({ dia: 0.40, noite: 0.60 }),
  marca: Object.freeze({ lacre: Object.freeze({ x: 60, y: 48, d: 64 }), texto: Object.freeze({ x: 140, y: 58, tamanho: 40 }) }),
  titulo: Object.freeze({ x: 1020, y: 62, tamanho: 34 }),
  estampa: Object.freeze({ x: 60, y: 140, w: 960, h: 440, raio: 6, aro: 3, veu: Object.freeze({ dia: 0.12, noite: 0.30 }) }),
  carta: Object.freeze({ x: 78, y: 318, w: 408, h: 571, rodada: 4 }),
  tiraDaQueda: Object.freeze({ w: 440, h: 64, tamanho: 34, pintura: 0.45 }),
  vilao: Object.freeze({ x: 716, y: 168, w: 280, h: 392, rodada: -5, tamanho: 34 }),
  etiqueta: Object.freeze({ direita: 1020, y: 602, h: 58, folga: 48, tamanho: 34 }),
  numeros: Object.freeze({ y: 668, passo: 86, linhas: 4, pecaX: 548, peca: 88, numeroX: 652, numero: 60, rotuloX: 790, rotulo: 34 }),
  vinte: Object.freeze({ x: 780, y: 820, d: 300, linhaY: 968, linha: 34 }),
  frase: Object.freeze({ x: 60, y: 1022, w: 960, h: 200, rodada: -1, tamanho: 40, entrelinha: 50, linhas: 2, origem: 34 }),
  pe: Object.freeze({ x: 60, y: 1258, direita: 1020, tamanho: 34 }),
  /* a tinta: tudo nomeado na paleta da casa (T, estilo.js) — cor é número */
  tinta: Object.freeze({
    couro: T.couroBaixo, latao: T.latao, lataoLume: T.lataoLume, halo: T.haloDaVela,
    ink: T.ink, inkMeio: T.inkMeio, osso: T.ossoLume, papel: T.pergaminho,
    naPagina: T.tintaDoPergaminho, naPaginaDim: T.tintaDoPergaminhoDim, perigo: T.perigoNoPergaminho,
    lacre: T.lacre, sobreLacre: T.sobreLacre, veu: T.veuDaNoite, silhueta: T.veuDaNoite,
    feltro: Object.freeze({ dia: LUZ_DA_MESA.dia.feltro, noite: LUZ_DA_MESA.noite.feltro }),
  }),
  letra: Object.freeze({ cinzel: "Cinzel", spectral: "Spectral" }),
});

/* A TELA «LEVANTAR DA MESA» (F6 §3): o véu, o cartão a 52 % na mesa (562 de
   largura) e a 30 % no celular (324), a coluna de 480 à direita, o papel do
   gancho rodado −1°. */
export const LEVANTAR_DA_MESA = Object.freeze({
  veu: 0.88,
  cartao: Object.freeze({ mesa: 562, telefone: 324 }),
  coluna: 480,
  vao: 88,
  gancho: Object.freeze({ largura: 480, rodada: -1 }),
});

/* ---------------- a variação: o título da noite (por tabela, em ordem) ----------------
   A primeira que vale ganha. `layout` diz se os números dão lugar ao d20
   grande (a noite do vinte: o maior dado foi um 20 natural que passou). */
export const VARIACOES_DO_CARTAO = Object.freeze([
  Object.freeze({ id: "ferros", titulo: "UMA NOITE EM FERROS", vale: (r) => !!r.queda }),
  Object.freeze({ id: "vinte", titulo: "A NOITE DO VINTE", vale: (r) => r.dados.vinteQuePassou > 0 }),
  Object.freeze({ id: "vitoria", titulo: "UMA NOITE DE VITÓRIA", vale: (r) => r.buscasFechadas > 0 || r.lutasVencidas > 0 }),
  Object.freeze({ id: "comum", titulo: "UMA NOITE À MESA", vale: () => true }),
]);

/* a tira da queda, sobre a carta */
export const TIRA_DA_QUEDA = Object.freeze({ levada: "LEVADA VIVA", caiu: "CAIU" });

/* ---------------- utilidades ---------------- */
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const inteiro = (v, p = 0) => { const n = Number(v); return Number.isFinite(n) ? Math.round(n) : p; };
const texto = (x, teto = 200) => (typeof x === "string" ? x.replace(/\s+/g, " ").trim().slice(0, teto) : "");

/* o plural de um nome de criatura: as palavras antes do primeiro conector
   («Lobo das cavernas» → «lobos das cavernas»; «Rato gigante» → «ratos gigantes») */
const CONECTORES = new Set(["de", "do", "da", "dos", "das", "e", "com", "sem"]);
const umPlural = (w) => (/[sx]$/i.test(w) ? w : /ão$/i.test(w) ? w.replace(/ão$/i, "ões") : /[rz]$/i.test(w) ? w + "es" : /al$/i.test(w) ? w.replace(/l$/i, "is") : /m$/i.test(w) ? w.replace(/m$/i, "ns") : /[aeiouáéíóúâêô]$/i.test(w) ? w + "s" : w);
export function pluralDaCriatura(nome, n) {
  const t = texto(nome, 60).toLowerCase();
  if (!t || n === 1) return t;
  let parou = false;
  return t.split(" ").map((w) => { if (parou || CONECTORES.has(w)) { parou = true; return w; } return umPlural(w); }).join(" ");
}

/* a semente do mundo, em grupos de quatro: FNV-1a de 32 bits, duas vezes */
function fnv(s, base) {
  let h = base >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
export function sementeDoCartao(semente) {
  const s = String(semente == null ? "" : semente);
  if (!s) return "";
  const a = fnv(s, 2166136261).toString(16).toUpperCase().padStart(8, "0");
  const b = fnv(s, 3735928559).toString(16).toUpperCase().padStart(8, "0");
  return `${a.slice(0, 4)}·${b.slice(4, 8)}`;
}

/* a duração: «42 min» ou «1 h 42» */
export function duracaoDoCartao(minutos) {
  const m = inteiro(minutos);
  if (m <= 0) return "";
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
}

/* ---------------- o vilão, sem o segredo ----------------
   `vilao`: { nome, camada } (fichaDoVilao + o registo). Sem vilão eleito,
   a carta não aparece (null). O nome só passa da camada «rosto» em diante. */
const ORDEM_DO_ROSTO = (FASES.find((f) => f.id === "rosto") || { ordem: 3 }).ordem;
export function vilaoDoCartao(vilao) {
  const v = obj(vilao);
  if (!v) return null;
  const f = FASES.find((x) => x.id === v.camada);
  const sabe = !!f && f.ordem >= ORDEM_DO_ROSTO && !!texto(v.nome, 40);
  return Object.freeze({ nome: sabe ? texto(v.nome, 40).toUpperCase() : "SEM ROSTO", revelado: sabe });
}

/* ---------------- os números da noite ----------------
   Até quatro linhas, nesta ordem de preferência; linha com zero não entra;
   com menos de duas, entra «N turnos jogados». `peca`: a forma da peça. */
export function osNumerosDaNoite(r) {
  const out = [];
  const d = r.dados || {};
  if (d.vintes > 0) out.push({ peca: "vinte", n: d.vintes, rotulo: d.vintes === 1 ? "vinte natural" : "vinte naturais" });
  if (d.uns > 0) out.push({ peca: "um", n: d.uns, rotulo: d.uns === 1 ? "um natural" : "uns naturais" });
  const c = arr(r.caidos)[0];
  if (c && c.n > 0) out.push({ peca: "caveira", n: c.n, rotulo: pluralDaCriatura(c.tipo, c.n) });
  if (r.buscasFechadas > 0) out.push({ peca: "lacre", n: r.buscasFechadas, rotulo: r.buscasFechadas === 1 ? "busca fechada" : "buscas fechadas" });
  if (r.moedas) out.push({ peca: "moedas", n: r.moedas, sinal: true, rotulo: r.moedas > 0 ? "moedas ganhas" : "moedas perdidas" });
  if (r.diasEmFerros > 0) out.push({ peca: "cadeado", n: r.diasEmFerros, rotulo: r.diasEmFerros === 1 ? "dia em ferros" : "dias em ferros" });
  const lista = out.slice(0, CARTAO_DA_SESSAO.numeros.linhas);
  if (lista.length < 2 && r.turnos > 0) lista.push({ peca: "vela", n: r.turnos, rotulo: r.turnos === 1 ? "turno jogado" : "turnos jogados" });
  return lista.map((x) => Object.freeze({ ...x, mostra: x.sinal && x.n > 0 ? `+${x.n}` : x.sinal ? `−${Math.abs(x.n)}` : String(x.n) }));
}

/* ---------------- O CARTÃO ----------------
   oCartaoDaSessao(resumo, { semente, vilao }) → os campos, prontos a pintar.
   `resumo`: o de oResumoDaSessao. `semente`: a semente do mundo. */
export function oCartaoDaSessao(resumo, opcoes) {
  const r0 = obj(resumo) || {};
  const o = obj(opcoes) || {};
  const r = { dados: { rolados: 0, vintes: 0, uns: 0, vinteQuePassou: 0 }, caidos: [], buscasFechadas: 0, lutasVencidas: 0, moedas: 0, diasEmFerros: 0, turnos: 0, ...r0 };
  r.dados = { rolados: 0, vintes: 0, uns: 0, vinteQuePassou: 0, ...(obj(r0.dados) || {}) };
  const variacao = VARIACOES_DO_CARTAO.find((v) => v.vale(r));
  const noite = !!r.queda;
  const m = obj(r.maior);
  const vinteGrande = !!m && m.natural === 20 && m.desfecho !== "falha" && variacao.id !== "ferros";
  const numeros = osNumerosDaNoite(r);
  /* a melhor frase: a do maior dado; sem dado, a última escrita; sem nenhuma, a frase da casa */
  let frase = "", origem = "";
  if (m && texto(m.frase)) { frase = texto(m.frase, 240); origem = `${m.pericia || "o dado"} · o dado deu ${m.natural}`; }
  else if (texto(r.ultimaFrase)) { frase = texto(r.ultimaFrase, 240); origem = m ? `${m.pericia || "o dado"} · o dado deu ${m.natural}` : "a última jogada da noite"; }
  else { frase = "A primeira jogada ainda está por escrever."; origem = ""; }
  const h = obj(r.heroi) || {};
  const pe = [`sessão ${Math.max(1, inteiro(r.n, 1))}`, duracaoDoCartao(r.minutos), o.semente ? `semente ${sementeDoCartao(o.semente)}` : ""].filter(Boolean).join(" · ");
  return Object.freeze({
    variacao: variacao.id,
    titulo: variacao.titulo,
    noite,
    cena: texto(r.cena, 40),
    lugar: texto(r.lugar, 60).toUpperCase(),
    heroi: Object.freeze({ nome: texto(h.nome, 60), raca: texto(h.raca, 30), classe: texto(h.classe, 30), sexo: h.sexo === "mulher" ? "mulher" : "homem", semente: h.semente || h.nome || "", nivel: Math.max(1, inteiro(h.nivel, 1)) }),
    tira: r.queda ? TIRA_DA_QUEDA[r.queda] || "" : "",
    vilao: vilaoDoCartao(o.vilao),
    vinte: vinteGrande ? Object.freeze({ linha: numeros.filter((x) => x.peca !== "vinte" && x.peca !== "vela").slice(0, 2).map((x) => `${x.mostra} ${x.rotulo}`).concat(r.dados.vintes > 1 ? [`${r.dados.vintes} vintes`] : []).slice(0, 2).join(" · ") || "um vinte natural" }) : null,
    numeros: vinteGrande ? [] : numeros,
    frase, origem,
    pe,
    assinatura: "Sente-se à mesa.",
    nomeDoArquivo: nomeDoArquivoDoCartao(r, h),
  });
}

/* o nome do arquivo guardado: «taverna-sessao-4-saoirse.png» (sem data, sem conta) */
export function nomeDoArquivoDoCartao(resumo, heroi) {
  const n = Math.max(1, inteiro(obj(resumo) && resumo.n, 1));
  const nome = texto(obj(heroi) && heroi.nome, 40).split(" ")[0] || "";
  const limpo = nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `taverna-sessao-${n}${limpo ? "-" + limpo : ""}.png`;
}

/* quebra uma frase em até `linhas` linhas pela largura medida (`mede(t)` → px);
   a última corta com «…». Puro: a medida entra de fora (o canvas, ou a suíte). */
export function quebrarEmLinhas(frase, largura, linhas, mede) {
  const palavras = texto(frase, 400).split(" ").filter(Boolean);
  const todas = [];
  let atual = "";
  for (const w of palavras) {
    const tenta = atual ? `${atual} ${w}` : w;
    if (!atual || mede(tenta) <= largura) atual = tenta;
    else { todas.push(atual); atual = w; }
  }
  if (atual) todas.push(atual);
  if (todas.length <= linhas) return todas;
  const fica = todas.slice(0, linhas);
  fica[linhas - 1] = cortar(todas.slice(linhas - 1).join(" "), largura, mede);
  return fica;
}
function cortar(t, largura, mede) {
  let s = t;
  while (s.length > 1 && mede(s + "…") > largura) s = s.slice(0, -1).trimEnd();
  return s === t ? s : s + "…";
}
