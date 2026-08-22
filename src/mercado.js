/* ============================================================
   MERCADO (v9.2) — mercadores, estoque e preços por código

   Comprar coisa era conversa com o Mestre: ele inventava o que a
   loja tinha, inventava o preço e às vezes inventava um item que
   não existe no jogo. Agora o mercado é do sistema.

   Cada cidade tem mercadores próprios, com estoque tirado dos
   catálogos que já existem (armas e armaduras do loot, poções do
   catálogo de consumíveis) e preços derivados da tabela de
   economia, ajustados pelo porte da cidade. O estoque é
   DETERMINÍSTICO por cidade e por semana: quem volta no dia
   seguinte encontra a mesma banca; quem volta no mês que vem
   encontra outra. Nada disso ocupa espaço no save.
   ============================================================ */

import { gerarLoot, RARIDADE_ROTULO } from "./loot.js";
import { CONSUMIVEIS, consumivelPorId, itemConsumivel, descricaoCurta } from "./pocoes.js";
import { valorDeItem, PRECO_VENDA } from "./economia.js";
import { PORTES } from "./geografia.js";
import { nomesDeLugar } from "./lexico.js";

/* RNG determinístico — a mesma cidade na mesma semana dá a mesma banca */
function rngDe(semente) {
  let h = 2166136261;
  const s = String(semente || "");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
}
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];

/* ---------------- TIPOS DE MERCADOR ----------------
   Cada um vende uma faixa: o ferreiro não vende poção, o boticário não
   vende montante. É o que faz a cidade parecer uma cidade. */
export const TIPOS_MERCADOR = [
  { id: "ferreiro",  nome: "Ferraria",       icone: "⚒", vende: ["arma", "escudo", "armadura", "elmo", "botas"], ageio: 1.0,  desc: "Aço, couro e o cheiro de brasa." },
  { id: "boticario", nome: "Botica",         icone: "⚗", vende: ["consumivel"],                                  ageio: 1.0,  desc: "Prateleiras de vidro e cheiro de erva amarga." },
  { id: "geral",     nome: "Armazém",        icone: "🛒", vende: ["arma", "armadura", "consumivel", "curiosidade"], ageio: 1.1, desc: "Um pouco de tudo, nada excelente." },
  { id: "relicario", nome: "Casa de Relíquias", icone: "🔮", vende: ["anel", "amuleto", "curiosidade"],           ageio: 1.35, desc: "Coisas antigas com preço de coisa antiga." },
  { id: "ambulante", nome: "Mercador Ambulante", icone: "🐴", vende: ["arma", "consumivel", "curiosidade"],       ageio: 1.25, desc: "Uma carroça, dois cavalos e pressa de seguir viagem." },
];
export const tipoMercador = (id) => TIPOS_MERCADOR.find((t) => t.id === id) || TIPOS_MERCADOR[2];

/* v9.113: o gênero viaja com o nome. Antes eram duas listas cruzadas
   sem olhar uma para a outra, e saía "O Martelo Dourada" e "O Corvo
   Rachada" — "A Bigorna Torta" acertava por sorte. */
const NOMES_LOJA_A = [
  { nome: "A Bigorna", f: true }, { nome: "O Cálice", f: false }, { nome: "A Roda", f: true },
  { nome: "O Corvo", f: false }, { nome: "A Âncora", f: true }, { nome: "O Martelo", f: false },
  { nome: "A Vela", f: true }, { nome: "O Sino", f: false }, { nome: "A Raiz", f: true },
  { nome: "O Prego", f: false },
];
/* [masculino, feminino] nos adjetivos; as preposicionais não têm gênero
   e entram iguais dos dois lados */
const NOMES_LOJA_B = [
  ["Torto", "Torta"], ["de Ferro", "de Ferro"], ["Rachado", "Rachada"],
  ["Silencioso", "Silenciosa"], ["do Sul", "do Sul"], ["Dourado", "Dourada"],
  ["Velho", "Velha"], ["de Sal", "de Sal"], ["Amargo", "Amarga"], ["do Vigia", "do Vigia"],
];

/* ---------------- CURIOSIDADES ----------------
   Não têm mecânica: têm gancho. São o que faz o jogador perguntar
   "o que é isso?" — e o Mestre tem material pronto para responder. */
export const CURIOSIDADES = [
  { nome: "Mapa rasgado ao meio", valor: 40, desc: "Falta o pedaço onde estaria o destino." },
  { nome: "Chave sem fechadura conhecida", valor: 35, desc: "Ferro frio demais para o clima daqui." },
  { nome: "Diário em língua morta", valor: 60, desc: "A mesma palavra aparece em toda página." },
  { nome: "Retrato de alguém que ninguém reconhece", valor: 30, desc: "O sorriso não combina com os olhos." },
  { nome: "Caixa de música quebrada", valor: 45, desc: "Toca três notas e para sempre no mesmo ponto." },
  { nome: "Dente grande demais para ser de bicho comum", valor: 55, desc: "Ainda tem raiz. Foi arrancado vivo." },
  { nome: "Frasco com terra vermelha", valor: 25, desc: "O vendedor jura que veio de onde não chove." },
  { nome: "Anel com nome gravado por dentro", valor: 70, desc: "O nome não é de ninguém conhecido na região." },
  { nome: "Vela que não derrete", valor: 80, desc: "Acende, ilumina, e continua do mesmo tamanho." },
  { nome: "Moeda de um reino que não existe mais", valor: 50, desc: "O rosto cunhado foi raspado de propósito." },
  { nome: "Pena de ave que ninguém viu voar", valor: 40, desc: "Muda de cor conforme quem olha." },
  { nome: "Corda que sempre volta enrolada", valor: 45, desc: "Ninguém consegue deixá-la bagunçada." },
];

/* ---------------- PREÇO ----------------
   Base do catálogo de economia, com o modificador de porte da cidade e o
   ágio do mercador. Vender rende metade — a mesma regra de sempre. */
export function fatorPorte(cidade) {
  const p = (cidade && (cidade.porte || cidade.tipo)) || "cidade";
  if (p === "aldeia" || p === "vila") return 0.7;
  if (p === "capital") return 1.3;
  if (p === "metropole") return 1.5;
  if (p === "fortaleza") return 1.15;
  return 1;
}

export function precoDeVenda(item, cidade, mercador) {
  const base = item && item.valor != null ? item.valor : valorDeItem(item);
  const f = fatorPorte(cidade) * ((mercador && tipoMercador(mercador.tipo).ageio) || 1);
  return Math.max(1, Math.round(base * f));
}
/* quanto o mercador PAGA por algo que você traz */
export function precoDeCompra(item, cidade) {
  const base = item && item.valor != null ? item.valor : valorDeItem(item);
  return Math.max(1, Math.round(base * PRECO_VENDA * fatorPorte(cidade)));
}

/* ---------------- ESTOQUE ---------------- */
function itemDeCuriosidade(rnd) {
  const c = pick(rnd, CURIOSIDADES);
  return { nome: c.nome, tipo: "curiosidade", raridade: "comum", descricao: c.desc, valor: c.valor };
}

function itemDeConsumivel(rnd, nivel) {
  const pool = CONSUMIVEIS.filter((c) => c.nivel <= (nivel || 1) + 2);
  const c = pick(rnd, pool.length ? pool : CONSUMIVEIS);
  return { ...itemConsumivel(c.id), detalhe: descricaoCurta(c) };
}

function raridadeDaBanca(rnd, cidade) {
  const f = fatorPorte(cidade);
  const r = rnd();
  if (f >= 1.3) return r < 0.45 ? "comum" : r < 0.85 ? "incomum" : "raro";
  if (f <= 0.7) return r < 0.8 ? "comum" : "incomum";
  return r < 0.6 ? "comum" : r < 0.92 ? "incomum" : "raro";
}

/* Um mercador completo: identidade + estoque com preço. */
/* ---------------- O CARTÓGRAFO (v9.14) ----------------
   O mundo passou a nascer no escuro, e viajar às cegas é caro. Um mapa
   comprado abre uma região inteira — é a segunda porta da descoberta, e a
   razão de alguém pagar por papel. Quem vende é o Armazém e a Casa de
   Relíquias; o preço sobe com o tamanho da região, porque um mapa de terra
   grande vale mais que o croqui de um vale. */
export function mapasAVenda(regioesOcultas = [], cidadesPorRegiao = {}) {
  return regioesOcultas.map((r) => {
    const n = Math.max(1, cidadesPorRegiao[r] || 1);
    return {
      nome: `Mapa de ${r}`, tipo: "mapa", regiao: r, raridade: "incomum", icone: "🗺",
      descricao: `Traçado à mão, com ${n === 1 ? "um povoado marcado" : `${n} povoados marcados`}. Abre a região no seu mapa.`,
      preco: 60 + n * 45,
    };
  });
}

export function gerarMercador({ cidade, semente, nivel = 1, tipo = null, dia = 1, lex = null, ordem = 0 }) {
  const rnd = rngDe(semente);
  const t = tipo ? tipoMercador(tipo) : pick(rnd, TIPOS_MERCADOR.filter((x) => x.id !== "ambulante"));
  /* v9.113: O NOME DA BANCA VEM DO MUNDO, quando o mundo tem um. O
     léxico já declara `lugares[tipo="mercado"].nomes` desde a v9.103 —
     nesta campanha eram "Feira do Setor 3", "Central de Achados",
     "Pavilhão do Vale" — e o mercado montava "A Bigorna Rachada" de um
     banco de fantasia sem nunca perguntar. */
  /* `ordem` é a posição desta banca na cidade, e existe para duas não
     caírem no mesmo nome: com quatro nomes no léxico e três bancas
     sorteando cada uma por conta própria, "Praça de Escambo" saía duas
     vezes na mesma praça. */
  const doMundo = lex ? nomesDeLugar(lex, "mercado") : [];
  const generico = (() => { const a = pick(rnd, NOMES_LOJA_A); const b = pick(rnd, NOMES_LOJA_B); return `${a.nome} ${a.f ? b[1] : b[0]}`; })();
  const nome = t.id === "ambulante"
    ? (doMundo.length ? `${doMundo[Math.floor(rnd() * doMundo.length)]} (ambulante)` : "Carroça na estrada")
    : (doMundo.length ? doMundo[ordem % doMundo.length] : generico);
  const quantos = t.id === "ambulante" ? 3 + Math.floor(rnd() * 3) : 4 + Math.floor(rnd() * 4);
  const estoque = [];
  const vistos = new Set();
  for (let i = 0; i < quantos; i++) {
    const oQue = pick(rnd, t.vende);
    let it = null;
    if (oQue === "consumivel") it = itemDeConsumivel(rnd, nivel);
    else if (oQue === "curiosidade") it = itemDeCuriosidade(rnd);
    else it = gerarLoot(raridadeDaBanca(rnd, cidade), { tipo: oQue === "amuleto" ? "amuleto" : oQue, nivel, rnd, lex });
    if (!it || vistos.has(it.nome)) continue;
    vistos.add(it.nome);
    estoque.push({ ...it, preco: precoDeVenda(it, cidade, { tipo: t.id }) });
  }
  return {
    id: `${t.id}|${semente}`,
    tipo: t.id, nome, icone: t.icone, rotulo: t.nome, desc: t.desc,
    cidade: (cidade && cidade.nome) || "",
    estoque, abertoDia: dia,
  };
}

/* Quantos mercadores uma cidade sustenta — e quais. Determinístico por
   cidade + SEMANA: o estoque gira, mas não a cada passo do herói. */
export function mercadoresDaCidade(cidade, dia = 1, nivel = 1, lex = null) {
  if (!cidade || !cidade.nome) return [];
  const porte = cidade.porte || cidade.tipo || "cidade";
  if (porte === "ruina") return [];
  const quantos = porte === "metropole" ? 3 : porte === "capital" ? 3 : porte === "cidade" ? 2 : 1;
  const semana = Math.floor((dia || 1) / 7);
  const rnd = rngDe(`mercadores|${cidade.nome}|${semana}`);
  /* toda cidade que não é ruína tem ao menos um armazém; o resto varia */
  const tipos = ["geral"];
  const outros = TIPOS_MERCADOR.filter((t) => t.id !== "ambulante" && t.id !== "geral");
  while (tipos.length < quantos) {
    const t = pick(rnd, outros);
    if (!tipos.includes(t.id)) tipos.push(t.id); else tipos.push("geral");
  }
    /* o deslocamento tem GERADOR PRÓPRIO. O `rnd` acima é quem sorteia os
     TIPOS de mercador; consumir uma volta dele para decidir um nome
     mudaria quais bancas esta cidade tem. É a regra que o bug do
     continente deixou na v9.102. */
  const desloc = Math.floor(rngDe(`nome-banca|${cidade.nome}`)() * 97);
  return tipos.map((t, i) => gerarMercador({ cidade, semente: `${cidade.nome}|${semana}|${t}|${i}`, nivel, tipo: t, dia, lex, ordem: desloc + i }));
}

/* Mercador ambulante: chance pequena por dia de viagem. */
export const CHANCE_AMBULANTE = 0.12;
export function talvezAmbulante(dia, nivel, { chance = CHANCE_AMBULANTE, lex = null } = {}) {
  if (Math.random() > chance) return null;
  return gerarMercador({ cidade: null, semente: `ambulante|${dia}|${Math.floor(Math.random() * 1e6)}`, nivel, tipo: "ambulante", dia, lex });
}

/* Resumo curto para o Mestre — ele narra a banca que EXISTE. */
export function resumoMercadoPrompt(mercadores) {
  const ms = (mercadores || []).filter((m) => m && m.estoque && m.estoque.length);
  if (!ms.length) return "";
  /* compacto de propósito: o Mestre precisa saber QUE bancas existem e uma
     amostra do que elas têm — a lista inteira mora no painel do jogador. */
  const linhas = ms.map((m) => `${m.icone} ${m.nome} (${m.rotulo}): ${m.estoque.slice(0, 3).map((it) => it.nome).join(", ")}${m.estoque.length > 3 ? ` e mais ${m.estoque.length - 3}` : ""}`);
  return `BANCAS ABERTAS AQUI (fato do sistema — são estas e só estas; estoque e preço estão no painel do jogador, não os invente): ${linhas.join(" · ")}.`;
}

export const MERCADO_PROMPT = `MERCADO E COMÉRCIO (v9.2 — o sistema tem o estoque, você tem a cena):
- Cada cidade tem mercadores com estoque e preço definidos pelo SISTEMA, e o jogador compra e vende pelo painel de Mercado. Você NUNCA inventa item de loja, preço, desconto real nem "o ferreiro tem uma espada mágica no fundo da loja".
- Negociar na ficção é ótimo: o vendedor pode ser simpático, desconfiado, tagarela, pode oferecer chá, pode contar de onde veio a mercadoria. O que não muda é o número — quem cobra é o sistema.
- Se o jogador pedir algo que a banca não tem, diga que não tem (e, se fizer sentido, para onde ele deveria ir). Falta de estoque é ficção boa, não obstáculo.
- Mercador ambulante na estrada aparece por sorteio do sistema, com envelope próprio. Sem envelope, não há mercador — não crie um só porque a cena pede.`;
