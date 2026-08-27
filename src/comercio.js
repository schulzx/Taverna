/* ============================================================
   O COMÉRCIO (v9.138) — o que este lugar produz, o que lhe falta,
   e por que o mesmo aço custa diferente em duas cidades

   O mercado da v9.2 já era do sistema: estoque determinístico por cidade e
   por semana, preço da tabela de economia, nada inventado pelo Narrador. O
   que ele NÃO tinha era mundo. Um martelo custava o mesmo na aldeia de
   mineiros e no vilarejo de pescadores — só o porte mexia no número. E o
   ferreiro de uma aldeia de duzentas almas comprava a sua relíquia de três
   mil moedas com uma gaveta que nunca esteve vazia, porque nunca teve fundo.

   Um mercado sem geografia não é economia: é uma tabela com desconto.

   ---------------- O QUE ESTE MÓDULO SABE ----------------

   Três coisas, e nada além delas:

     · o GÊNERO de cada mercadoria — metal, couro, erva, relíquia, papel;
     · a VOCAÇÃO de cada lugar — o que ele tira do próprio chão, e o que
       tem de mandar buscar longe;
     · e o que isso, mais a estação e a procura do próprio herói, faz com
       o preço.

   Ele não guarda estoque, não move moeda e não conhece a ficha. Devolve
   número e MOTIVO; quem cobra é o `mercado.js`, quem paga é o App.
   ============================================================ */

import { estacaoDe } from "./calendario.js";

/* ---------------- OS GÊNEROS ----------------
   Não são os tipos de item — são as CLASSES DE MERCADORIA, que é o que uma
   cidade produz ou deixa de produzir. Ninguém extrai "elmo" do chão: extrai
   metal, e o elmo é o que o ferreiro faz com ele. É por isso que a vocação
   fala em gênero e não em tipo: uma serra de montanha barateia a espada, o
   escudo e o elmo pela MESMA razão, e barateá-los um a um seria escrever
   três vezes a mesma regra — e esquecer a quarta. */
export const GENEROS = [
  { id: "metal",    nome: "metal",    o: "aço, ferro e o que sai da forja", tipos: ["arma", "escudo", "armadura", "elmo"] },
  { id: "couro",    nome: "couro",    o: "peles, correias e sola",          tipos: ["botas"] },
  { id: "erva",     nome: "erva",     o: "o que se colhe, seca e ferve",    tipos: ["consumivel"] },
  { id: "reliquia", nome: "relíquia", o: "o que veio de longe ou de antes", tipos: ["anel", "amuleto", "curiosidade"] },
  { id: "papel",    nome: "papel",    o: "traçados, cartas e cópias",       tipos: ["mapa"] },
];
export const generoPorId = (id) => GENEROS.find((g) => g.id === id) || null;

/* A armadura leve é couro e a pesada é metal — e o item não diz qual é.
   O nome diz, e é a única pista que o catálogo dá. */
const COURO_NO_NOME = /couro|peles?\b|gibão|pelego|acolchoad|tecido|pano|linho/i;

export function generoDoItem(item) {
  if (!item) return "";
  const tipo = String(item.tipo || "").toLowerCase();
  if (tipo === "armadura" && COURO_NO_NOME.test(String(item.nome || ""))) return "couro";
  const g = GENEROS.find((x) => x.tipos.includes(tipo));
  return g ? g.id : "";
}

/* ---------------- AS VOCAÇÕES ----------------
   O que o lugar vive de fazer. Sai do BIOMA e do PORTE, que o mundo já
   tinha desde sempre e o mercado nunca leu.

   `produz` é o que sobra aqui: sai mais barato.
   `falta` é o que vem de longe: sai mais caro.

   Uma vocação pode não faltar de nada — o porto é assim de propósito: por
   ali tudo passa. Vocação sem falta nenhuma é a exceção que faz as outras
   significarem alguma coisa. */
export const VOCACOES = [
  {
    id: "mineradora", nome: "de mineração", o: "vive do que arranca da pedra",
    produz: ["metal"], falta: ["erva"], biomas: ["montanha", "colina"], peso: 3,
    cheiro: "poeira de pedra e fumaça de forja",
  },
  {
    id: "madeireira", nome: "de madeira e caça", o: "vive do que a mata dá",
    produz: ["couro"], falta: ["metal"], biomas: ["floresta"], peso: 3,
    cheiro: "serragem e resina",
  },
  {
    id: "agricola", nome: "agrícola", o: "vive do que planta",
    produz: ["erva"], falta: ["metal"], biomas: ["planicie", "colina"], peso: 3,
    cheiro: "palha, esterco e pão saindo do forno",
  },
  {
    id: "portuaria", nome: "portuária", o: "vive do que atraca",
    produz: ["reliquia", "erva"], falta: [], biomas: ["costa"], peso: 4,
    cheiro: "sal, piche e peixe",
  },
  {
    id: "pastoril", nome: "pastoril", o: "vive do rebanho",
    produz: ["couro"], falta: ["reliquia"], biomas: ["planicie", "colina", "montanha"], peso: 2,
    cheiro: "lã molhada e curral",
  },
  {
    id: "salina", nome: "de sal", o: "vive de conservar o que os outros pescam",
    produz: ["erva"], falta: ["couro"], biomas: ["deserto", "costa"], peso: 2,
    cheiro: "salmoura e sol",
  },
  {
    id: "turfeira", nome: "de turfa e ervas", o: "vive do que só cresce onde ninguém quer morar",
    produz: ["erva"], falta: ["metal", "couro"], biomas: ["pantano"], peso: 3,
    cheiro: "lodo e fumaça doce",
  },
  {
    id: "cacadora", nome: "de caça no gelo", o: "vive do que ainda se move no frio",
    produz: ["couro"], falta: ["erva"], biomas: ["gelo"], peso: 3,
    cheiro: "gordura queimada e couro curtido",
  },
  {
    id: "guarnicao", nome: "de guarnição", o: "vive de armar quem passa",
    produz: ["metal"], falta: ["reliquia"], biomas: [], portes: ["fortaleza"], peso: 5,
    cheiro: "óleo de arma e sopa de caserna",
  },
  {
    id: "corte", nome: "de corte", o: "vive do que os outros trazem para vender aqui",
    produz: ["reliquia", "papel"], falta: [], biomas: [], portes: ["capital", "metropole"], peso: 5,
    cheiro: "cera, tinta e perfume caro",
  },
];
/* NÃO HÁ um `vocacaoPorId`: escrevi-o por simetria com o `generoPorId`, e o
   varredor pegou — ninguém procura vocação por id, porque quem quer a de um
   lugar tem o lugar na mão e chama `vocacaoDe`. Export sem leitor mente na
   primeira vez que alguém lê o módulo. */

function hash(s) {
  let h = 2166136261;
  const t = String(s || "");
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* ---------------- A VOCAÇÃO DE UM LUGAR ----------------
   Determinística pelo NOME da cidade, como tudo nesta casa: quem volta
   encontra a mesma vocação, e não é preciso guardar nada no save.

   O PORTE MANDA MAIS QUE O BIOMA — uma capital é corte mesmo encravada na
   montanha, e a fortaleza é guarnição em qualquer chão. Sem isso, a capital
   do reino venderia trigo barato e cobraria caro por uma coroa. */
export function vocacaoDe(cidade) {
  if (!cidade || !cidade.nome) return null;
  const porte = String(cidade.porte || cidade.tipo || "cidade");
  if (porte === "ruina") return null;
  const porPorte = VOCACOES.find((v) => (v.portes || []).includes(porte));
  if (porPorte) return porPorte;
  const bioma = String(cidade.bioma || "planicie");
  const cabem = VOCACOES.filter((v) => (v.biomas || []).includes(bioma));
  if (!cabem.length) return VOCACOES.find((v) => v.id === "agricola") || null;
  /* peso: no pântano quase só há turfa, mas na colina mineração, lavoura e
     pastoreio disputam — e a disputa tem de dar o mesmo resultado sempre */
  const total = cabem.reduce((s, v) => s + (v.peso || 1), 0);
  let n = hash(`vocacao|${cidade.nome}`) % total;
  for (const v of cabem) { n -= (v.peso || 1); if (n < 0) return v; }
  return cabem[0];
}

/* ---------------- A ESTAÇÃO ----------------
   O calendário existe desde a v6 e o mercado nunca o leu. Inverno não é uma
   palavra na tela: é erva cara porque nada cresce, e couro barato porque
   toda casa tem pele sobrando.

   Fator por gênero; o que não está na tabela não se mexe. */
export const ESTACAO_MEXE = {
  Primavera: { erva: 0.82, couro: 1.05 },
  Verão:     { erva: 0.92, metal: 1.05, couro: 1.10 },
  Outono:    { erva: 0.75, reliquia: 0.95, metal: 0.95 },
  Inverno:   { erva: 1.35, couro: 0.85, metal: 1.05 },
};

const nomeDaEstacao = (dia) => {
  const e = estacaoDe(dia || 1);
  return (e && (e.nome || e.rotulo || e.id)) || "";
};

export function fatorEstacao(genero, dia) {
  const tab = ESTACAO_MEXE[nomeDaEstacao(dia)];
  return (tab && tab[genero]) || 1;
}

/* ---------------- A PROCURA DO PRÓPRIO HERÓI ----------------
   Comprar todas as poções da vila e achar a próxima pelo mesmo preço é a
   cidade fingindo que nada aconteceu. Cada compra deixa uma PRESSÃO no
   gênero, naquela cidade, e ela cede com os dias.

   O teto existe porque sem ele um herói rico dobrava o preço de tudo e o
   mercado virava uma parede — e porque o mundo não gira em torno dele. */
export const PRESSAO_POR_COMPRA = 0.06;
export const PRESSAO_TETO = 0.5;
export const DIAS_PARA_CEDER = 4;

export const chaveDaPressao = (cidade, genero) =>
  `${String((cidade && cidade.nome) || cidade || "").toLowerCase().trim()}|${genero}`;

/* quantas compras ainda pesam, já descontado o que o tempo levou */
function aindaPesa(pressoes, cidade, genero, dia) {
  const p = (pressoes || {})[chaveDaPressao(cidade, genero)];
  if (!p || !p.n) return 0;
  const cedeu = Math.max(0, (dia || 1) - (p.dia || 1)) / DIAS_PARA_CEDER;
  return Math.max(0, p.n - cedeu);
}

export function pressaoAtual(pressoes, cidade, genero, dia) {
  return Math.min(PRESSAO_TETO, aindaPesa(pressoes, cidade, genero, dia) * PRESSAO_POR_COMPRA);
}

export function apertarProcura(pressoes, cidade, genero, dia) {
  if (!genero) return pressoes || {};
  const teto = PRESSAO_TETO / PRESSAO_POR_COMPRA;
  return {
    ...(pressoes || {}),
    [chaveDaPressao(cidade, genero)]: {
      n: Math.min(teto, aindaPesa(pressoes, cidade, genero, dia) + 1),
      dia: dia || 1,
    },
  };
}

/* ---------------- O PREÇO, E O PORQUÊ ----------------
   Devolve o fator E o motivo em português. O motivo não é enfeite: é o que
   o painel mostra ao jogador e o que o Narrador recebe — um preço que se
   move sem dizer por quê é o Mestre sendo arbitrário, que é exatamente o
   que este projeto passou os últimos meses tirando da IA. */
export const FATOR_PRODUZ = 0.75;
export const FATOR_FALTA = 1.4;

export function fatorDoLugar(item, cidade, { dia = 1, pressoes = null, vendendo = false } = {}) {
  const g = generoDoItem(item);
  if (!g) return { fator: 1, genero: "", porques: [] };
  const v = vocacaoDe(cidade);
  const porques = [];
  let f = 1;
  if (v && v.produz.includes(g)) {
    f *= FATOR_PRODUZ;
    porques.push(`${(cidade && cidade.nome) || "aqui"} produz ${generoPorId(g).nome}`);
  } else if (v && v.falta.includes(g)) {
    f *= FATOR_FALTA;
    porques.push(`${generoPorId(g).nome} vem de longe`);
  }
  const fe = fatorEstacao(g, dia);
  if (fe !== 1) {
    f *= fe;
    porques.push(`${nomeDaEstacao(dia)} ${fe > 1 ? "encareceu" : "barateou"} ${generoPorId(g).nome}`);
  }
  const pr = pressaoAtual(pressoes, cidade, g, dia);
  if (pr > 0) {
    /* quem esvaziou a prateleira PAGA mais para comprar e RECEBE menos para
       vender: é o mesmo fato visto dos dois lados, e ele mora num lugar só */
    f *= vendendo ? 1 - Math.min(0.35, pr) : 1 + pr;
    porques.push(vendendo ? `a praça está cheia de ${generoPorId(g).nome}` : `procuraram muito ${generoPorId(g).nome} aqui`);
  }
  return { fator: f, genero: g, porques };
}

/* ---------------- A GAVETA DO MERCADOR ----------------
   O ferreiro de uma aldeia de duzentas almas não tem três mil moedas na
   gaveta, e o jogador que leva uma relíquia para lá tem de ouvir isso — em
   vez de receber um número inventado com um zero a mais.

   Determinística por mercador e por DIA: quem volta amanhã encontra a
   gaveta refeita; quem insiste hoje encontra o que sobrou. */
export const CAIXA_BASE = { ruina: 0, aldeia: 90, vila: 220, fortaleza: 300, cidade: 650, capital: 1600, metropole: 3200 };
const CAIXA_POR_TIPO = { relicario: 1.8, geral: 1.0, ferreiro: 0.9, boticario: 0.7, ambulante: 0.6 };

export function caixaDe(mercador, cidade, dia = 1) {
  const porte = String((cidade && (cidade.porte || cidade.tipo)) || (mercador && mercador.tipo === "ambulante" ? "vila" : "cidade"));
  const base = CAIXA_BASE[porte] != null ? CAIXA_BASE[porte] : 400;
  const t = CAIXA_POR_TIPO[(mercador && mercador.tipo) || "geral"] || 1;
  /* a variação do dia é pequena de propósito: a gaveta OSCILA, não sorteia */
  const osc = 0.8 + (hash(`caixa|${(mercador && mercador.id) || ""}|${dia}`) % 41) / 100;
  return Math.max(0, Math.round(base * t * osc));
}

/* O que ele ainda pode pagar hoje, descontado o que já gastou comigo. */
export function podePagar(mercador, cidade, dia, gastoHoje = 0) {
  return Math.max(0, caixaDe(mercador, cidade, dia) - (gastoHoje || 0));
}

/* ---------------- A PECHINCHA ----------------
   Uma por mercador por dia, e ela CUSTA quando falha: sem custo não é
   negociação, é um botão de desconto que o jogador aperta até sair.

   O módulo não rola o dado nem conhece a ficha — recebe o bônus pronto e
   devolve o que aconteceu. */
export const PECHINCHA_GANHO = 0.12;
export const PECHINCHA_PERDA = 0.08;

export function pechinchar({ bonus = 0, dificuldade = 12, sorte = Math.random } = {}) {
  const d20 = 1 + Math.floor(sorte() * 20);
  const total = d20 + bonus;
  /* OS NATURAIS PRIMEIRO, E OS DOIS JUNTOS. A prova pegou: com o 1 natural
     na frente, um 20 natural rolado por quem não tem lábia nenhum caía no
     ramo do fracasso antes de chegar ao seu — a exceção comia a regra por
     ordem de leitura, e o jogador via a face mais alta do dado virar uma
     ofensa. Natural é natural dos dois lados, e decide antes de qualquer
     faixa. */
  if (d20 === 20) return { ok: true, d20, total, ajuste: 1 - PECHINCHA_GANHO * 1.5, texto: "cedeu mais do que queria" };
  if (d20 === 1) return { ok: false, d20, total, ajuste: 1 + PECHINCHA_PERDA, texto: "se ofendeu, e o preço subiu" };
  if (total < dificuldade - 4) {
    return { ok: false, d20, total, ajuste: 1 + PECHINCHA_PERDA, texto: "se ofendeu, e o preço subiu" };
  }
  if (total >= dificuldade + 5) {
    return { ok: true, d20, total, ajuste: 1 - PECHINCHA_GANHO * 1.5, texto: "cedeu mais do que queria" };
  }
  if (total >= dificuldade) {
    return { ok: true, d20, total, ajuste: 1 - PECHINCHA_GANHO, texto: "aceitou baixar" };
  }
  return { ok: false, d20, total, ajuste: 1, texto: "não se mexeu" };
}

/* A dificuldade sai do lugar: numa metrópole ninguém precisa da sua moeda;
   numa aldeia o mercador precisa vender antes que o inverno chegue. */
export function dificuldadeDaPechincha(cidade, mercador) {
  const porte = String((cidade && (cidade.porte || cidade.tipo)) || "cidade");
  const base = porte === "metropole" ? 16 : porte === "capital" ? 15
    : porte === "cidade" ? 13 : porte === "fortaleza" ? 13 : 11;
  return base + ((mercador && mercador.tipo === "relicario") ? 2 : 0);
}

/* ---------------- O QUE O NARRADOR RECEBE ----------------
   Fato consumado e curto: o que este lugar é, e por quê. Ele narra a praça;
   ele não decide o que ela produz. */
export function envelopeDoComercio(cidade, dia = 1) {
  const v = vocacaoDe(cidade);
  if (!v || !cidade || !cidade.nome) return "";
  const produz = v.produz.map((g) => generoPorId(g).nome).join(" e ");
  const falta = v.falta.map((g) => generoPorId(g).nome).join(" e ");
  return [
    `${cidade.nome} é ${v.nome}: ${v.o}. Cheira a ${v.cheiro}.`,
    produz ? `Aqui sobra ${produz}, e sai barato.` : "",
    falta ? `Falta ${falta}: o que há veio de longe, é caro, e nem sempre há.` : "Por aqui tudo passa — falta pouca coisa.",
    `Estação: ${nomeDaEstacao(dia)}.`,
    "Isto é FATO do mundo: use na cena — no que se vê na praça, no que o mercador reclama — e não o contradiga. Não faça abundar o que falta nem faltar o que sobra.",
  ].filter(Boolean).join(" ");
}

/* A linha do painel: por que este preço é este. */
export function linhaDoPreco(porques) {
  const ps = (porques || []).filter(Boolean);
  return ps.length ? ps.join(" · ") : "";
}
