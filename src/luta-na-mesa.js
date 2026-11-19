/* ============================================================
   A LUTA NA MESA — o tapete, as peças, a mão de ações, a reação e a
   vitória (V6 parte 2 · 19/11/2026)

   formas.md §«A Mesa do Mestre · F4» §2–§4 e as pranchas
   mente/lancamento/figma/F4-*.png; as decisões que a planta não tomou
   estão em formas.md §«V6 parte 2». Este é o módulo PURO da luta como
   mesa de jogo: decide a cara da peça, a linha do dado de cada carta, a
   cera da vela da reação e a ordem da cerimônia da vitória. Não desenha
   nada — grade-de-batalha.jsx, painel-batalha.jsx, painel-reacao.jsx e
   painel-fim-da-luta.jsx leem daqui; a suíte (testes/teste-luta-na-mesa.mjs)
   prova em Node.

   NENHUMA REGRA DE COMBATE MORA AQUI. A chance, as faces que acertam, o
   dano, a duração da reação e o que caiu no chão saem dos motores que já
   existem (combate.js, batalha-na-tela.js, ritmo-da-reacao.js,
   recibo-da-luta.js). Aqui só se conta, ordena e diz.
   ============================================================ */
import { especieDe } from "./mesa-de-batalha.js";
import { raridadeDe } from "./objetos-abertos.js";

const obj = (x) => (x && typeof x === "object" ? x : null);
const fin = (x) => x != null && x !== "" && Number.isFinite(Number(x));
const arr = (x) => (Array.isArray(x) ? x : []);
const corta01 = (x) => Math.max(0, Math.min(1, x));

/* ---------------- O TAPETE (F4 §2 «TAPETE») ----------------
   O couro com a costura e as quatro tachas de latão; a régua A–R e 1–12
   gravada na faixa de cima e na da esquerda. As cores são nomes de `T`
   (quem pinta resolve o nome), nunca literais: o couro é o da mesa. */
export const TAPETE = Object.freeze({
  couro: "couroAlto", borda: "couroBaixo", bordaPx: 2, raio: 10,
  costura: { cor: "latao", alfa: 0.55, px: 1, tracejado: [5, 4], recuo: 4 },
  tacha: { cor: "latao", lume: "lataoLume", lado: 8, recuo: 9 },
  /* a faixa onde vai a régua: 28 se a casa ≥ 40, senão 24 (F4) — HOJE a régua
     continua na calha de 22 do tabuleiro (lacuna dita em formas.md §«V6 parte 2»);
     as outras duas bordas têm 14, e essas estão no tapete */
  faixa: { larga: 28, estreita: 24, casaLarga: 40, resto: 14 },
  regua: { cor: "inkMeio", realce: "amberSoft", corpo: 12 },
  /* a borda interna do chão, que separa o couro da pintura */
  bordaDoChao: { alfa: 0.55, px: 2 },
});

/* ---------------- A PEÇA (F4 §2 «PECA_NO_TAPETE») ----------------
   O aro é a vida (um arco a partir das 12 h, sentido horário; o que falta
   é couro), o lado é a cor do aro E a conta numerada, e só quem age é
   âmbar — de qualquer lado. Caído: o verso de osso com a caveira. */
export const PECA_NO_TAPETE = Object.freeze({
  diametro: 0.88,               /* × casa */
  aroMinimoPx: 3, aroDaCasa: 0.09,  /* aro = máx(3 px, 0,09 × diâmetro) */
  aro: { nosso: "latao", deles: "lacreLume", aVez: "amber", falta: "couroBaixo" },
  lado: { nosso: "lataoSombra", deles: "lacreSombra", aVez: "lataoSombra" },
  aVez: { sobePx: 3, lume: 0.6 },
  alvo: { cor: "ink", px: 2, tracejado: [4, 4], folgaPx: 7 },
  conta: { ladoPx: 18, chao: "osso", borda: "tintaDoPergaminho", letra: "tintaDoPergaminho", corpo: 12 },
  caido: { escala: 0.8, chao: "osso", lado: "ossoSombra", borda: "tintaDoPergaminhoDim", caveira: "tintaDoPergaminho" },
  sombra: { alfa: 0.42, dx: 1, dy: 5 },
});

/* a cara de uma peça. `ent` é o ente do combate (vida, vidaMax); `tipo`
   "heroi" | "aliado" | "inimigo"; `aVez` é quem age agora; `conta` é o
   número do inimigo entre os iguais (0 = sem conta). */
export function estadoDaPeca(ent, { tipo = "inimigo", aVez = false, alvo = false, conta = 0 } = {}) {
  const e = obj(ent) || {};
  const vida = fin(e.vida) ? Math.max(0, Number(e.vida)) : null;
  const vidaMax = fin(e.vidaMax) ? Math.max(0, Number(e.vidaMax)) : null;
  const lado = tipo === "inimigo" ? "deles" : "nosso";
  const caido = vida != null && vida <= 0;
  const fracao = vida != null && vidaMax ? corta01(vida / vidaMax) : 1;
  return {
    lado, caido,
    aro: caido ? null : aVez ? PECA_NO_TAPETE.aro.aVez : PECA_NO_TAPETE.aro[lado],
    falta: PECA_NO_TAPETE.aro.falta,
    fracao: caido ? 0 : fracao,
    sobe: !caido && aVez ? PECA_NO_TAPETE.aVez.sobePx : 0,
    alvo: !!alvo && !caido,
    conta: lado === "deles" && Number(conta) > 0 ? Number(conta) : 0,
  };
}

/* A CONTA NUMERADA: o segundo sinal do lado que não é cor (WCAG 1.4.1).
   Só quando há dois ou mais da mesma espécie; o número é o que o nome já
   traz («Rato Gigante 2») ou, sem número, a ordem em que aparece (o
   primeiro, sem número no nome, é o 1). */
export function contasDosInimigos(inimigos) {
  const lista = arr(inimigos).filter((e) => e && e.nome);
  const porEspecie = new Map();
  for (const e of lista) {
    const esp = especieDe(e.nome);
    porEspecie.set(esp, [...(porEspecie.get(esp) || []), e]);
  }
  const contas = {};
  for (const iguais of porEspecie.values()) {
    if (iguais.length < 2) continue;
    const usados = new Set();
    const numDe = (nome) => { const m = /\s(\d+)$/.exec(String(nome)); return m ? Number(m[1]) : null; };
    for (const e of iguais) { const n = numDe(e.nome); if (n) usados.add(n); }
    let livre = 1;
    for (const e of iguais) {
      const n = numDe(e.nome);
      if (n) { contas[e.nome] = n; continue; }
      while (usados.has(livre)) livre++;
      contas[e.nome] = livre; usados.add(livre);
    }
  }
  return contas;
}

/* ---------------- A CARTA DE AÇÃO (F4 §2 «CARTA_DE_ACAO») ----------------
   Osso com borda de tinta; armada sobe e ganha a borda de tinta de 2;
   impedida perde o chão e escreve a razão no lugar do custo. A ALTURA é a
   do verbo de hoje (40 com rato, 48 com toque): a geometria da mesa
   (`geometriaDaMesa`) conta com ela, e a casa do tabuleiro não paga a
   carta. A carta é a forma; o tamanho continua a ser o do alvo. (F4 pede
   102 × 112: é LACUNA, dita em formas.md §«V6 parte 2» — a mão a 112 come a
   casa, a menos que o «como?» saia para a tira do Mestre, que não existe.) */
export const CARTA_DE_ACAO = Object.freeze({
  chao: "ossoLume", chaoArmada: "osso",
  borda: "tintaDoPergaminhoDim", bordaArmada: "tintaDoPergaminho", bordaPx: 1, bordaArmadaPx: 2,
  letra: "tintaDoPergaminho", custo: "brasaNoPergaminho", perigo: "perigoNoPergaminho",
  impedida: { borda: "inkMeio", letra: "ink", tracejado: "4 4" },
  sombra: "peca", sombraArmada: "erguido",
  raio: 6, sobeArmada: 2,
  nome: 13, custoCorpo: 13,   /* Cinzel 13 e Spectral Medium 13 (F4) */
});

/* ---------------- A VELA DA REAÇÃO (F4 §2 «REACAO_NA_MESA») ----------------
   A duração é a da tabela de hoje (`ritmo-da-reacao.js`); a vela é só a
   forma dela. A cera que resta = o trilho que falta. Sem relógio (o ritmo
   «parado», WCAG 2.2.1), não há vela. */
export const VELA_DA_REACAO = Object.freeze({
  prato: { largura: 48, altura: 11 }, vela: { largura: 16, altura: 84, curta: 56 },  /* curta: NÃO decidida — a caixa da mão mede 104, não os 112 do F4 (lacuna, formas.md §«V6 parte 2») */
  pavio: { largura: 8, altura: 12, folga: 14 },
  cera: "osso", contorno: "inkMeio", alfaDoContorno: 0.5, chama: "amber", chamaAperto: "danger", corDoPrato: "latao",
  /* na mesa as cartas da reação ficam lado a lado, nenhuma abaixo disto */
  cartaMinima: 250,   /* F4: 250 × 104 por carta de reação */
  tremeMs: 160,       /* nos últimos segundos (o aperto da tabela) a chama treme */
  degrauMs: 1000,      /* com movimento reduzido, a cera desce em degraus de 1 s */
});

export function ceraDaVela(oferta, passouMs, { reduzido = false } = {}) {
  const o = obj(oferta);
  if (!o || !(Number(o.janelaMs) > 0) || !(Number(o.trilhoMs) > 0)) return { tem: false, fracao: 1, aperto: false };
  let passou = Math.max(0, Number(passouMs) || 0);
  if (reduzido) passou = Math.floor(passou / VELA_DA_REACAO.degrauMs) * VELA_DA_REACAO.degrauMs;
  const correu = Math.max(0, passou - (Number(o.folgaMs) || 0));
  const fracao = corta01(1 - correu / Number(o.trilhoMs));
  const aperto = passou >= Number(o.janelaMs) - (Number(o.apertoMs) || 0);
  return { tem: true, fracao, aperto };
}

/* ---------------- A CERIMÔNIA DA VITÓRIA (F4 §3 «CERIMONIA_DA_VITORIA») ----------------
   Teto de 4 s; um toque pula para o fim; com movimento reduzido tudo
   aparece já posto. As cartas do espólio viram da mais comum à mais rara. */
export const CERIMONIA_DA_VITORIA = Object.freeze({
  teto: 4000,
  titulo: { entra: 0, corpo: 28 },
  cartas: { pousa: 300, entre: 120, vira: 700, viraMs: 320, entreVira: 180, largura: 160, altura: 224, telefone: { largura: 104, altura: 150 } },
  /* o tapete recua: véu de 45 % sobre o chão */
  veu: 0.45,
  respirar: { altura: 56, largura: 360 },
  /* a largura do recibo da luta sobre o tapete (a de «Respirar fundo» mais as margens das cartas) */
  recibo: 560,
  preco: "volta à página · o que ficar no chão, fica",
});

const ORDEM_DA_RARIDADE = ["comum", "incomum", "raro", "epico", "lendario", "unico"];

/* o espólio na ordem em que vira: da mais comum à mais rara; empate
   guarda a ordem em que caiu. Cada carta leva o instante em que vira,
   com o teto da cerimônia por cima. */
export function ordemDoEspolio(coisas) {
  const C = CERIMONIA_DA_VITORIA.cartas;
  const lista = arr(coisas).filter((c) => c && c.id != null)
    .map((c, i) => ({ c, i, r: ORDEM_DA_RARIDADE.indexOf(raridadeDe(c)) }))
    .sort((a, b) => a.r - b.r || a.i - b.i);
  return lista.map(({ c }, k) => ({
    ...c,
    raridade: raridadeDe(c),
    viraEm: Math.min(C.vira + k * (C.viraMs + C.entreVira), CERIMONIA_DA_VITORIA.teto - C.viraMs),
    pousaEm: Math.min(C.pousa + k * C.entre, CERIMONIA_DA_VITORIA.teto - C.viraMs),
  }));
}
