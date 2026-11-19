/* ============================================================
   OS OBJETOS ABERTOS — o livro, a bolsa e a banca (V7 · 18/11/2026)

   formas.md §«A Mesa do Mestre · F5» §1–§4 e as pranchas
   mente/lancamento/figma/F5-*.png. Este é o módulo PURO dos três objetos:
   decide o que entra em cada página, em que ordem, com que cara, e o
   veredito antes do clique na compra e na venda. Não desenha nada — os
   painéis (painel-livro.jsx, painel-bolsa.jsx, painel-banca.jsx) leem daqui
   e montam a tela; a suíte (testes/teste-objetos-abertos.mjs) prova em Node.

   NENHUMA REGRA DE JOGO MORA AQUI. Preço, estoque, oferta de venda e o que
   cabe em cada encaixe saem dos motores que já existem (mercado.js,
   comercio.js, comparar-item.js, itens.js). Aqui só se conta, ordena e diz.
   ============================================================ */
import { fichaDoItem } from "./itens.js";

const norm = (s) => String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const arr = (x) => (Array.isArray(x) ? x : []);
const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);

/* ---------------- O OBJETO ABERTO (§2 «OBJETO_ABERTO») ----------------
   Os quatro objetos abrem do mesmo jeito, no mesmo lugar, do mesmo tamanho.
   A 1440 × 900 o corpo é 1144 × 756 em x 148, y 80 (a mesa fica à vista,
   148 px de cada lado, sob o véu); abaixo do corte do telefone, tela
   inteira com a aba «‹ A MESA». */
export const OBJETO_ABERTO = Object.freeze({
  corteDoTelefone: 768,
  corpo: { largura: 1144, altura: 756, margemX: 148, margemY: 80 },
  pequeno: { largura: 1040, altura: 620, margemX: 120, margemY: 50 },
  veu: 0.58,
  conteudo: 40,
  fechar: { lado: 44, margem: 28, respiro: 12 },
  telefone: { barra: 52, aba: 96, folga: 16 },
  raio: { livro: 10, bolsa: 28, banca: 6, carta: 3 },
  /* V8 · a carta: dois rolos de 28 nas bordas (formas.md §F5 §2), metade para fora do papel */
  rolo: { largura: 28, sai: 14 },
  costura: { espessura: 2, traco: 14, alfa: 0.55 },
  barra: { largura: 8, margem: 12, alfa: 0.5 },
  movimento: { abre: 320, veu: 220, pousa: 220, folha: 260, fita: 140 },
});

/* QUAIS OBJETOS ABREM SOBRE A MESA. Voltar à forma de antes (o modal do
   Diário, a gaveta do Códex, a carta-bolsa, o mercado em tela inteira) é
   mudar esta tabela — o código antigo continua no App, inteiro. */
export const OBJETOS_NA_MESA = Object.freeze({ livro: true, bolsa: true, banca: true, carta: true });

/* o objeto que uma porta do App abre: o Diário e o Códex são o livro; a
   bolsa do herói (não a de um companheiro) é a bolsa; o mercado é a banca;
   o mapa é a carta (V8) */
export function objetoDaPorta({ aba = null, sub = null, quem = "eu" } = {}, ligados = OBJETOS_NA_MESA) {
  const o = aba === "diario" || aba === "codex" ? "livro" : aba === "inv" && quem === "eu" ? "bolsa" : aba === "gestao" && sub === "mercado" ? "banca" : aba === "mapa" ? "carta" : null;
  return o && ligados && ligados[o] ? o : null;
}

/* o corpo do objeto para uma janela: o grande (1440), o pequeno (1280 × 720)
   ou a tela inteira (telefone). Sempre cabe: nunca passa da janela menos a
   margem. */
export function corpoDoObjeto(largura, altura) {
  const L = num(largura), A = num(altura);
  if (L < OBJETO_ABERTO.corteDoTelefone) return { modo: "telefone", largura: L, altura: A, x: 0, y: 0 };
  const C = L >= 1400 && A >= 860 ? OBJETO_ABERTO.corpo : OBJETO_ABERTO.pequeno;
  const largura_ = Math.min(C.largura, L - 2 * Math.min(C.margemX, 24));
  const altura_ = Math.min(C.altura, A - 2 * Math.min(C.margemY, 16));
  return { modo: "mesa", largura: largura_, altura: altura_, x: Math.round((L - largura_) / 2), y: Math.round((A - altura_) / 2) };
}

/* ---------------- O LIVRO: as cinco fitas (§2 «FITAS_DO_LIVRO») ---------------- */
export const FITAS_DO_LIVRO = Object.freeze([
  { id: "buscas", rotulo: "As buscas" },
  { id: "gente", rotulo: "Gente" },
  { id: "bestiario", rotulo: "Bestiário" },
  { id: "feitos", rotulo: "Feitos" },
  { id: "cronica", rotulo: "A crônica" },
]);
export const FITA = Object.freeze({ largura: 150, altura: 52, aberta: 64, sobe: 12, passo: 160, telefone: 104, rabo: 9 });

/* a fita em que o livro abre: a pedida, se existe; senão a primeira */
export function fitaInicial(pedida) {
  return FITAS_DO_LIVRO.some((f) => f.id === pedida) ? pedida : FITAS_DO_LIVRO[0].id;
}

/* ---------------- A CASA DE ITEM (§2 «RARIDADE_DA_CASA») ----------------
   A raridade é moldura (aro, cantos, lacre), e o nome dela vem sempre
   escrito. As seis raridades do jogo caem em quatro molduras. */
export const RARIDADE_DA_CASA = Object.freeze({
  comum: { aro: 1, cantos: false, lacre: false },
  incomum: { aro: 2, cantos: false, lacre: false },
  rara: { aro: 2, cantos: true, lacre: false },
  lendaria: { aro: 2, cantos: true, lacre: true },
});
export const CASA = Object.freeze({ mochila: 64, banca: 96, comparacao: 48, telefone: 44, glifo: 0.5, raio: 6, canto: 13, lacre: 18, escolhida: { aro: 2, distancia: 4, sobe: 2 } });
const MOLDURA_DA_RARIDADE = { comum: "comum", incomum: "incomum", raro: "rara", epico: "rara", lendario: "lendaria", unico: "lendaria" };
export const NOME_DA_RARIDADE = Object.freeze({ comum: "comum", incomum: "incomum", raro: "rara", epico: "épica", lendario: "lendária", unico: "única" });

/* a raridade do save (com ou sem acento, em qualquer caixa) → a chave do jogo */
export function raridadeDe(item) {
  const r = norm(item && typeof item === "object" ? item.raridade : "");
  return Object.prototype.hasOwnProperty.call(MOLDURA_DA_RARIDADE, r) ? r : "comum";
}
export function molduraDaCasa(item) {
  return MOLDURA_DA_RARIDADE[raridadeDe(item)];
}

/* ---------------- OS GLIFOS DE ITEM (§2 «FAMILIA_DO_ITEM») ----------------
   42 desenhos de 24 × 24, traço 2, pontas redondas (a lei de glifos.js),
   exportados do Figma em mente/lancamento/figma/glifos-de-item/. */
export const GLIFOS_DE_ITEM = Object.freeze({
  lamina: "M19 3l-1 4-9 9-3-3 9-9zM5 13l6 6M7 17l-4 4",
  adaga: "M20 3l-1 6-7 5-3-3 5-7zM8 12l4 4M9.5 14.5L4 20",
  machado: "M5 21L17 5M13 5c3-2 6-1 8 2-1 3-4 5-7 5z",
  maca: "M4 20l9-9M11 5l8 8-3 3-8-8z",
  haste: "M20 4l-6 1 5 5zM16 8L4 20M7 14l3 3",
  cajado: "M5 21L14 9c-1-3 1-6 4-6s4 3 2 5c-1 1-3 1-3-1",
  varinha: "M4 20L14 10M17 3v4M15 5h4M20 10v2M19 11h2M10 3v2M9 4h2",
  arco: "M6 3v18M6 3c9 2 9 16 0 18M2 12h17M16 9l3 3-3 3",
  besta: "M12 3v18M5 8c4-3 10-3 14 0M5 8l7 5 7-5M9 21h6",
  arremesso: "M21 3l-4 10-6-6zM14 10L3 21M7 13H4M11 17v3",
  flechas: "M4 20L18 6M13 6h5v5M4 15v5h5M7 12l5 5",
  escudo: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM12 3v18M4 11h16",
  veste: "M9 3l3 2 3-2 5 3-2 4-2-1v12H8V9l-2 1-2-4z",
  armadura_leve: "M8 3c1 2 7 2 8 0l4 3-2 4-2-1v12H8V9l-2 1-2-4zM12 5v16M10 10h1M13 14h1",
  armadura_media: "M8 3c1 2 7 2 8 0l4 3-2 4-2-1v12H8V9l-2 1-2-4zM8 12h8M8 15h8M8 18h8",
  armadura_pesada: "M7 3h10l3 5-3 2v8l-5 3-5-3v-8L4 8zM12 3v18M7 12c3 2 7 2 10 0",
  elmo: "M5 20v-8a7 7 0 0 1 14 0v8h-5v-6h-4v6zM12 5V2",
  botas: "M8 3h6v10l5 3v4H6v-4l2-2zM6 17h13",
  anel: "M6 15a6 6 0 1 0 12 0a6 6 0 1 0-12 0M9.5 9.5L8 5l4-2 4 2-1.5 4.5",
  amuleto: "M5 3c0 6 3 9 7 10 4-1 7-4 7-10M12 13l3 4-3 4-3-4z",
  pocao: "M10 3h4M10 3v5l-5 9a3 3 0 0 0 3 4h8a3 3 0 0 0 3-4l-5-9V3M7 15h10",
  frasco: "M9 3h6M10 3v4a7 7 0 1 0 4 0V3M7 14h10",
  pergaminho: "M15 12h-5M15 8h-5M19 17V5a2 2 0 0 0-2-2H4M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",
  livro: "M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2zM5 18a2 2 0 0 1 2-2h12M9 8h6",
  comida: "M4 12a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v5H4zM9 7v4M13 7v4M17 8v3",
  agua: "M10 3h4v3h-4zM8 9a4 4 0 0 1 8 0v9a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3zM8 13h8",
  bebida: "M5 8h10v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3zM15 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2M5 8c0-2 1.5-3 3-3 .5-1.5 3.5-1.5 4 0 1.5 0 3 1 3 3",
  tocha: "M5 21l6-8M9 11l4 4M14 3c3 2 5 5 3 8-1 2-4 2-5 0-1-2 0-4 2-5 0 1 0 2 1 2 0-2-1-3-1-5z",
  erva: "M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l8-8",
  ferramenta: "M15 4a4 4 0 0 0-4 6l-7 7 3 3 7-7a4 4 0 0 0 6-4l-3 2-2-2z",
  corda: "M6 8a6 4 0 1 0 12 0a6 4 0 1 0-12 0M6 8v6c0 2 3 4 6 4s6-2 6-4V8M18 14c2 1 2 5-2 7",
  chave: "M3 15a4 4 0 1 0 8 0a4 4 0 1 0-8 0M10 12l10-9M16 6l3 3M13 9l2 2",
  mapa: "M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14",
  instrumento: "M4 15a5 5 0 1 0 10 0a5 5 0 1 0-10 0M12.5 11.5L20 4M18 2l4 4M9 15h.01",
  recipiente: "M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v9H4zM4 12h16M12 11v3",
  moeda: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0",
  gema: "M6 4h12l4 6-10 11L2 10zM2 10h20M9 4l-2 6 5 11 5-11-2-6",
  reliquia: "M7 3h10v4a5 5 0 0 1-10 0zM12 12v8M8 21h8",
  trofeu: "M6 4c7-1 12 4 12 11 0 2-1 4-2 5-1-6-4-9-10-10z",
  componente: "M4 11h16a8 8 0 0 1-16 0zM9 21h6M12 19v2M14 11l5-8",
  carta_lacrada: "M3 6h18v12H3zM3 6l9 7 9-7M10.5 16a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0",
  desconhecido: "M12 3l9 9-9 9-9-9zM10 10a2 2 0 1 1 3 1.7c-.7.4-1 .8-1 1.6M12 16h.01",
});

/* o nome da família como o jogador o lê, na ficha do item */
export const NOME_DA_FAMILIA = Object.freeze({
  lamina: "lâmina", adaga: "adaga", machado: "machado", maca: "maça", haste: "arma de haste", cajado: "cajado", varinha: "varinha",
  arco: "arco", besta: "besta", arremesso: "arma de arremesso", flechas: "flechas", escudo: "escudo", veste: "veste",
  armadura_leve: "armadura leve", armadura_media: "armadura média", armadura_pesada: "armadura pesada", elmo: "elmo", botas: "botas",
  anel: "anel", amuleto: "amuleto", pocao: "poção", frasco: "frasco", pergaminho: "pergaminho", livro: "livro", comida: "comida",
  agua: "água", bebida: "bebida", tocha: "tocha", erva: "erva", ferramenta: "ferramenta", corda: "corda", chave: "chave", mapa: "mapa",
  instrumento: "instrumento", recipiente: "recipiente", moeda: "moedas", gema: "gema", reliquia: "relíquia", trofeu: "troféu",
  componente: "componente", carta_lacrada: "carta lacrada", desconhecido: "coisa sem nome",
});

/* AS PISTAS DO NOME (§2, passo 2): a primeira que casa é a que vale. Ordem
   importa: «óleo» antes de «flor», «flecha» antes de «arco». */
export const PISTAS_DA_FAMILIA = Object.freeze([
  ["pocao", /\bpo[cç]ao|\belixir|\btonico|\bantidoto|\bbalsamo|\bunguento/],
  ["frasco", /\bveneno|\boleo|\bacido|\bfrasco|\bampola/],
  ["pergaminho", /\bpergaminho|\bcontrato|\bcarta de\b|\bnota\b|\bbilhete/],
  ["livro", /\blivro|\btomo|\bdiario|\bgrimorio/],
  ["comida", /\bra[cç]ao|\bracoes|\bpao\b|\bcarne|\bqueijo|\bfruta|\bpeixe|\bbiscoito/],
  ["agua", /\bcantil|\bodre|\bagua\b/],
  ["bebida", /\bvinho|\bcerveja|\bhidromel|\bbebida|\baguardente/],
  ["tocha", /\btocha|\blanterna|\bvela\b|\blampiao/],
  ["erva", /\berva|\braiz|\bflor\b|\bfolha|\bcogumelo/],
  ["ferramenta", /\bkit\b|\bgazua|\bferramenta|\bmartelo de|\bpe de cabra/],
  ["corda", /\bcorda|\bgancho|\bcorrente/],
  ["chave", /\bchave/],
  ["mapa", /\bmapa/],
  ["instrumento", /\balaude|\bflauta|\bcaixa de musica|\blira\b|\btambor|\bharpa/],
  ["flechas", /\bflecha|\bvirote|\bseta\b/],
  ["recipiente", /\bsaco\b|\bbau\b|\baljava|\bbolsa\b|\bcaixa\b|\bcesto/],
  ["moeda", /\bmoeda/],
  ["gema", /\bgema|\bjoia|\brubi|\besmeralda|\bsafira|\bdiamante|\bperola|\bpedra preciosa/],
  ["trofeu", /\bdente|\bgarra|\bpele\b|\bchifre|\bpresa\b|\bescama|\bcouro de\b/],
]);

const ARMA_POR_NOME = [
  ["machado", /machad/],
  ["maca", /\bma[cç]a\b|martelo|clava|mangual|porrete/],
  ["haste", /lan[cç]a|alabarda|pique|tridente|glaive/],
];
const FAMILIA_DA_ARMADURA = { panos: "veste", leve: "armadura_leve", media: "armadura_media", pesada: "armadura_pesada" };
const ACESSORIOS = ["elmo", "botas", "anel", "amuleto"];

/* a família pela ficha do equipamento (§2, passo 1); null se não é peça */
function familiaDaFicha(f, nome) {
  if (!f) return null;
  if (f.familia === "escudo") return "escudo";
  if (f.familia === "armadura") return FAMILIA_DA_ARMADURA[f.cat] || "armadura_leve";
  if (ACESSORIOS.includes(f.familia)) return f.familia;
  if (f.familia !== "arma") return null;
  if (f.cat === "arcana") return f.mao === 2 ? "cajado" : "varinha";
  if (f.cat === "marcial_dist" || f.cat === "simples_dist") {
    if (/\barco/.test(nome)) return "arco";
    if (/besta/.test(nome)) return "besta";
    return "arremesso";
  }
  for (const [fam, rx] of ARMA_POR_NOME) if (rx.test(nome)) return fam;
  if (f.cat === "simples_corpo" && arr(f.props).includes("leve")) return "adaga";
  return "lamina";
}

/* A FAMÍLIA DE UM ITEM — a cara dele. Ordem: (1) a peça de equipar, pela
   ficha (o tipo gravado manda); (2) o resto, pelo nome e pela classe;
   (3) nome de arma/armadura solto na mochila, pela ficha; (4) desconhecido. */
export function familiaDoItem(item) {
  if (!item) return "desconhecido";
  const ehObj = typeof item === "object";
  const nome = norm(ehObj ? item.base || item.nome : item);
  const tipo = ehObj ? item.tipo || "" : "";
  if (tipo === "mapa") return "mapa";
  if (tipo) {
    let f = null;
    try { f = fichaDoItem(item); } catch (e) { f = null; }
    const fam = familiaDaFicha(f, nome);
    if (fam) return fam;
  }
  for (const [fam, rx] of PISTAS_DA_FAMILIA) if (rx.test(nome)) return fam;
  const classe = ehObj ? norm(item.classe) : "";
  if (classe === "insumo") return "componente";
  if (classe === "mercadoria") return "reliquia";
  if (classe === "semente") return "carta_lacrada";
  if (nome) {
    let f = null;
    try { f = fichaDoItem(nome); } catch (e) { f = null; }
    const fam = f && f.cat !== "acessorio" ? familiaDaFicha(f, nome) : null;
    if (fam) return fam;
  }
  return "desconhecido";
}

/* ---------------- A BOLSA ---------------- */
/* A mochila NÃO tem teto no jogo (nenhuma regra limita o que se leva): as
   casas vazias são só o resto da fila e uma fila a mais, nunca «9 de 20» —
   um teto escrito na tela seria uma regra que o motor não tem. */
export const MOCHILA = Object.freeze({ colunas: 5, minimo: 10 });
/* as sete casas do corpo em volta da silhueta (§4 «A bolsa»): o elmo ao
   centro em cima; amuleto, armadura, botas à esquerda; arma, escudo, anel à
   direita. No telefone, uma fila de sete nesta mesma ordem de leitura. */
export const CORPO_DA_BOLSA = Object.freeze({ centro: ["elmo"], esquerda: ["amuleto", "armadura", "botas"], direita: ["arma", "escudo", "anel"] });
export const ORDEM_DO_CORPO = Object.freeze([...CORPO_DA_BOLSA.esquerda, ...CORPO_DA_BOLSA.centro, ...CORPO_DA_BOLSA.direita]);

/* as casas da mochila: o que se leva (agrupado por nome, como a bolsa já
   agrupava) e as vazias até fechar a fila — sempre ao menos uma vazia, e
   nunca menos que o mínimo. */
export function casasDaMochila(itens, { colunas = MOCHILA.colunas, minimo = MOCHILA.minimo } = {}) {
  const lista = arr(itens).filter(Boolean);
  const c = Math.max(1, Math.floor(num(colunas)) || 1);
  const total = Math.max(Math.floor(num(minimo)), Math.ceil((lista.length + 1) / c) * c);
  return {
    casas: [...lista, ...Array.from({ length: total - lista.length }, () => null)],
    usadas: lista.length,
    rotulo: lista.length === 1 ? "1 coisa" : `${lista.length} coisas`,
  };
}

/* a ordem da mochila: primeiro o que se usa (tem verbo principal), depois
   as peças de vestir, depois o resto; dentro de cada grupo, a ordem de
   chegada. Estável: mesma bolsa, mesma ordem em qualquer máquina. */
export function ordemDaMochila(linhas) {
  const peso = (l) => (l && arr(l.acoes).some((a) => a && a.primario) ? 0 : l && l.peca ? 1 : 2);
  return arr(linhas).filter(Boolean).map((l, i) => ({ l, i })).sort((a, b) => peso(a.l) - peso(b.l) || a.i - b.i).map((x) => x.l);
}

/* o verbo principal de uma linha (o único âmbar da bolsa) e os outros */
export function verbosDaLinha(linha) {
  const acoes = arr(linha && linha.acoes).filter((a) => a && a.rotulo);
  const principal = acoes.find((a) => a.primario) || null;
  return { principal, outros: acoes.filter((a) => a !== principal) };
}

/* ---------------- A BANCA: o veredito antes do clique ----------------
   O preço já vem do motor (a etiqueta do estoque, com a pechincha); aqui só
   se diz o que acontece — com glifo, palavra e cor, nunca cor só (WCAG
   1.4.1). */
export function vereditoDaCompra({ preco = 0, moedas = 0, nome = "" } = {}) {
  const p = Math.max(0, num(preco)), m = Math.max(0, num(moedas));
  const pode = m >= p;
  const falta = pode ? 0 : p - m;
  return {
    pode,
    falta,
    fica: pode ? m - p : m,
    glifo: pode ? "✓" : "✕",
    palavra: pode ? "você paga" : `faltam ${falta}`,
    botao: `Comprar ${nome}`.trim(),
    razao: pode ? `você fica com ${m - p}` : `faltam ${falta} ${falta === 1 ? "moeda" : "moedas"}`,
  };
}

export function vereditoDaVenda({ valor = 0, moedas = 0, quem = null, vestido = false, motivo = "" } = {}) {
  const v = Math.max(0, num(valor)), m = Math.max(0, num(moedas));
  const comprador = quem && quem.nome ? quem.nome : "";
  if (vestido) return { pode: false, depois: m, botao: "Vender", razao: "está no corpo: tire primeiro" };
  if (!comprador) return { pode: false, depois: m, botao: "Vender", razao: motivo || "ninguém aqui compra isto" };
  return { pode: true, depois: m + v, botao: `Vender · recebe ${v}`, razao: `${comprador} paga ${v} · não tem volta` };
}

/* a frase curta do que a peça faz no corpo, a partir das linhas da
   comparação (comparar-item.js): «CA cai de 12 para 11», «nada muda». */
export function fraseDoEfeito(item, linhas, slot) {
  if (item && item.tipo === "mapa") return "abre a região na carta";
  if (!slot) return "vai para a mochila";
  const l = arr(linhas)[0];
  if (!l) return "nada muda no corpo";
  const verbo = l.sinal === "ok" ? "sobe" : l.sinal === "danger" ? "cai" : "fica";
  return `${l.curto || l.rotulo || ""} ${verbo} de ${l.antes} para ${l.depois}`.trim();
}

/* ---------------- O LIVRO: as páginas do Códex ---------------- */

/* GENTE: as páginas de pessoa da memória, a mais recente em cima, e quem só
   está no registro (sem página) depois; filtradas pelo que se procura. */
export function genteDoLivro(paginas, npcs, procura = "") {
  const q = norm(procura).trim();
  const vistos = new Set();
  const comPagina = arr(paginas).filter((p) => p && p.tipo === "pessoa" && p.nome).map((p) => {
    vistos.add(norm(p.nome));
    return { id: String(p.id), nome: p.nome, papel: p.papel || "", lembra: arr(p.lembra)[0] || "", ficha: p };
  });
  const doRegistro = Object.values(npcs && typeof npcs === "object" ? npcs : {})
    .filter((n) => n && n.nome && !vistos.has(norm(n.nome)))
    .sort((a, b) => num(b.ultimaVez) - num(a.ultimaVez) || (a.nome < b.nome ? -1 : 1))
    .map((n) => ({ id: "npc:" + n.nome, nome: n.nome, papel: n.papel || "", lembra: n.notas || "", ficha: null, npc: n }));
  const todas = [...comPagina, ...doRegistro];
  return q ? todas.filter((g) => norm(g.nome).includes(q) || norm(g.papel).includes(q)) : todas;
}

/* BESTIÁRIO: as criaturas do mundo, vistas ou de costas. Vista = alguma
   descoberta cita o nome. As únicas desta história (descoberta que não é
   criatura do catálogo) entram no fim, sempre vistas. */
export function cartasDoBestiario(criaturas, descobertas) {
  const desc = arr(descobertas).map((d) => norm(d));
  const lista = arr(criaturas).filter((c) => c && c.nome);
  const cartas = lista.map((c) => ({ nome: c.nome, vista: desc.some((d) => d.includes(norm(c.nome))), criatura: c }));
  const unicas = arr(descobertas).filter((d) => d && !lista.some((c) => norm(d).includes(norm(c.nome))))
    .map((d) => ({ nome: d, vista: true, unica: true, criatura: null }));
  /* as vistas à frente (o que você já conhece é o que se procura), depois as
     únicas desta história, e as de costas no fim — cada grupo na ordem do
     catálogo. Visto na prova a 1440: com o catálogo em ordem, as duas vistas
     ficavam abaixo de dezesseis cartas de costas, fora da página. */
  const todas = [...cartas.filter((c) => c.vista), ...unicas, ...cartas.filter((c) => !c.vista)];
  return { cartas: todas, vistas: todas.filter((c) => c.vista).length, total: todas.length };
}

/* FEITOS: as seis famílias de conquistas, com o lugar de cada lacre.
   Lacrado = desbloqueada; por lacrar = círculo vazio; os segredos (e toda a
   família Lenda) só mostram o nome depois de lacrados. O próximo da família
   é o primeiro por lacrar, com a conta «1 de 10». */
export function feitosDoLivro(categorias, desbloqueadas, porId) {
  const desb = desbloqueadas && typeof desbloqueadas === "object" ? desbloqueadas : {};
  const achar = typeof porId === "function" ? porId : () => null;
  return arr(categorias).map((cat) => {
    const lugares = arr(cat && cat.ids).map((id) => {
      const c = achar(id);
      if (!c) return null;
      const lacrado = !!desb[id];
      const oculto = !lacrado && (!!c.segredo || cat.id === "lenda");
      return { id, lacrado, oculto, nome: oculto ? "?" : c.nome, titulo: lacrado ? c.titulo || "" : "", dica: oculto ? "" : c.dica || "", conquista: c };
    }).filter(Boolean);
    const lacrados = lugares.filter((l) => l.lacrado).length;
    const proximo = lugares.find((l) => !l.lacrado) || null;
    return { id: cat.id, rotulo: cat.rotulo, lugares, lacrados, total: lugares.length, conta: `${lacrados} de ${lugares.length}`, proximo };
  });
}

/* ---------------- A CRÔNICA NA PÁGINA (conserto V7/V8, 19/11) ----------------
   `gerarCronica` (cronica.js) escreve Markdown, porque também vira arquivo.
   Na página, o Markdown cru aparecia como sinal («*…*», «---», «**»): a
   sessão jogada leu-o assim. Aqui o texto vira blocos que a página desenha
   como forma — o título, o separador (um fio), a linha com os trechos em
   itálico — e nenhum asterisco chega à tela.
   → [{ tipo: "titulo", nivel, partes } | { tipo: "fio" } | { tipo: "linha", item, partes }]
   onde `partes` = [{ texto, italico }]. A linha vazia não vira bloco. */
function trechosDaLinha(l) {
  const limpa = String(l || "").replace(/\*\*|__/g, "");
  const partes = [];
  const re = /\*([^*]+)\*/g;
  let ultimo = 0, m;
  while ((m = re.exec(limpa))) {
    if (m.index > ultimo) partes.push({ texto: limpa.slice(ultimo, m.index), italico: false });
    partes.push({ texto: m[1], italico: true });
    ultimo = m.index + m[0].length;
  }
  if (ultimo < limpa.length) partes.push({ texto: limpa.slice(ultimo), italico: false });
  return partes.map((p) => ({ ...p, texto: p.texto.replace(/\*/g, "") })).filter((p) => p.texto);
}
export function blocosDaCronica(md) {
  const out = [];
  for (const cru of String(md || "").split("\n")) {
    const l = cru.replace(/\s+$/, "");
    if (!l.trim()) continue;
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l)) { if (out.length && out[out.length - 1].tipo !== "fio") out.push({ tipo: "fio" }); continue; }
    const t = l.match(/^(#{1,6})\s*(.*)$/);
    if (t) { out.push({ tipo: "titulo", nivel: t[1].length, partes: trechosDaLinha(t[2]) }); continue; }
    const it = l.match(/^(\s*)[-*] (.*)$/);
    if (it) { out.push({ tipo: "linha", item: it[1].length ? 2 : 1, partes: trechosDaLinha(it[2]) }); continue; }
    out.push({ tipo: "linha", item: 0, partes: trechosDaLinha(l) });
  }
  return out;
}
