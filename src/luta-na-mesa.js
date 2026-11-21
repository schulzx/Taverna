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
import { raridadeDe, molduraDaCasa, familiaDoItem, NOME_DA_RARIDADE } from "./objetos-abertos.js";
import { resolverReacao } from "./reacoes.js";
import { RECUSAS_DO_VERBO } from "./tela-de-batalha.js";

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
  /* a faixa onde vai a régua: 28 se a casa ≥ 40, senão 24 (F4 §10 lacuna 4 —
     a calha de 22 saiu); as outras duas bordas têm 14, e essas estão no tapete */
  faixa: { larga: 28, estreita: 24, casaLarga: 40, resto: 14 },
  /* (F4 §10 lacuna 4: a faixa de 28/24 já é a da régua — faixaDaRegua, abaixo) */
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
  prato: { largura: 48, altura: 11 }, vela: { largura: 16, altura: 84, curta: 56 },  /* F4 §10: a vela na mão é a caixa − 28 (alturaDaVela, abaixo); 56 só no celular */
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

/* ============================================================
   F4 §10 · AS LACUNAS FECHADAS (formas.md «10 · As lacunas fechadas»,
   pranchas mente/figma/F4-luta-*.png) — a mão de 8 cartas com a linha do
   dado, a jogada («como?» + «Agir»), a coluna direita em papel, a coluna
   do grupo, a régua de 28/24, a reação por dentro e a carta do espólio.
   Onde este bloco contradiz o de cima, vale este (a planta diz o mesmo).
   ============================================================ */

/* ---------------- A MÃO DE AÇÕES (§10 lacuna 1 «MAO_DE_ACOES») ----------------
   Uma fila só de oito cartas: os sete verbos da tabela do motor e «Usar
   item» (a bolsa, que deixa de ser gaveta e vira carta). `dado`: quem rola o
   d20 — a forma da linha do dado de cada carta, nunca a regra (a chance e a
   face vêm da previsão do motor). `glifo`: o glifo de cada carta. Os traços
   do F4 (`GL`, Figma 316:10007) ainda não estão em glifos.js: até chegarem,
   cada carta usa o glifo da casa mais próximo (dito em formas.md §F4 11). */
export const MAO_DE_ACOES = Object.freeze({
  ordem: Object.freeze(["atacar", "mover", "empurrar", "derrubar", "saltar", "item", "esperar", "fugir"]),
  glifo: Object.freeze({ atacar: "espadas", mover: "passo", empurrar: "recuo", derrubar: "degrau", saltar: "ascensao", item: "bolsa", esperar: "ampulheta", fugir: "fuga" }),
  rotulo: Object.freeze({ item: "Usar item", itemCurto: "Item" }),
  item: Object.freeze({ vazia: "bolsa vazia", custo: "à mão", tem: "tem" }),
  entreMinimo: 4,
  dado: Object.freeze({ atacar: "d20", empurrar: "d20", derrubar: "d20", saltar: "d20" }),
  entre: 10,
  /* os quatro tamanhos (§10): a mesa (altura útil ≥ 720), a média (a 1280,
     quando as oito de 102 não cabem), a baixa (altura útil < 720, sem
     glifo) e o celular (2 × 4). y = o topo de cada linha dentro da carta. */
  tamanhos: Object.freeze({
    mesa:    Object.freeze({ largura: 102, altura: 112, glifo: 22, yGlifo: 8, yNome: 33, yDado: 53, yCusto: 76 }),
    media:   Object.freeze({ largura: 90, altura: 100, glifo: 20, yGlifo: 6, yNome: 28, yDado: 47, yCusto: 68 }),
    baixa:   Object.freeze({ largura: 102, altura: 72, glifo: 0, yGlifo: 0, yNome: 7, yDado: 26, yCusto: 48 }),
    celular: Object.freeze({ largura: 85, altura: 80, glifo: 20, yGlifo: 5, yNome: 27, yDado: 44, yCusto: 60, colunas: 4, entre: 6 }),
  }),
  alturaUtilBaixa: 720,
  /* a folga do degrau (F4d, 19/11): perto de um limiar a medida pode ir e vir
     alguns píxeis (a barra de rolagem que aparece, o arredondamento do zoom);
     dentro de ±histerese do limiar a mão fica no degrau em que estava (4 px:
     a 1440 a coluna mede 892 e as oito pedem 886 — a folga tem de caber nos
     6 px que sobram). É o cinto: o conserto é medir a coluna do centro
     (painel-batalha.jsx, «F4d · B1»). A 1440 × 780–900 as oito cartas
     trocavam de 102 para 90 várias vezes por segundo, e o clique em «Fugir»
     caía em «Esperar». */
  histerese: 4,
  /* a linha do dado: Spectral Bold 15 `tinta` (14,30 : 1 no ossoLume); no
     celular Bold 13 com o d20 de 13 a x 6 e o número a x 22 */
  linha: Object.freeze({ corpo: 15, d20: 16, xD20: 9, xNumero: 28, recuo: 9,
    celular: Object.freeze({ corpo: 13, d20: 13, xD20: 6, xNumero: 22 }),
    /* a 1280 (carta de 90) o §10 não deu a letra: a do celular cabe sem que
       a face e a chance se encostem (medido na captura F4c-luta-1280) */
    media: Object.freeze({ corpo: 13, d20: 14, xD20: 7, xNumero: 24 }),
    semDado: "sem dado", corSemDado: "tintaDoPergaminhoDim",
    dano: Object.freeze({ glifo: "espadas", glifoPx: 14, corpo: 14, cor: "perigoNoPergaminho" }) }),
  /* armar: sobe 8 em 120 ms ease-out (seco com movimento reduzido); no
     celular a armada NÃO sobe — osso, tinta 2 e a sombra `erguido` */
  armar: Object.freeze({ sobe: 8, ms: 120 }),
  foco: Object.freeze({ cor: "amberSoft", px: 2, folga: 2 }),
});

/* qual dos quatro tamanhos: o celular; a baixa abaixo de 720 de altura útil;
   a mesa quando as oito de 102 cabem na largura da mão; senão a média.
   `anterior`: o degrau em que a mão já estava. Com ele, uma medida dentro de
   ±histerese de um limiar não troca de degrau — a mão só muda quando a
   medida passa o limiar com folga (F4d · B1). A medida que decide a largura
   tem de ser uma que a carta não altera: a largura da coluna do centro, e
   nunca a da janela do tapete (que encolhe quando a carta cresce, porque a
   casa é presa pela altura — era esse o laço). */
export function tamanhoDaCarta({ telefone = false, larguraDaMao = 0, alturaUtil = 0, anterior = null } = {}) {
  const M = MAO_DE_ACOES;
  if (telefone) return "celular";
  const h = M.histerese;
  const tinha = typeof anterior === "string" && M.tamanhos[anterior] && anterior !== "celular" ? anterior : null;
  /* acima do limiar? fora da folga decide a medida; dentro, o degrau de antes */
  const acima = (valor, limiar, estavaAcima) => (valor >= limiar + h ? true : valor < limiar - h ? false : estavaAcima == null ? valor >= limiar : estavaAcima);
  const alt = Number(alturaUtil);
  if (alt > 0 && !acima(alt, M.alturaUtilBaixa, tinha ? tinha !== "baixa" : null)) return "baixa";
  const n = M.ordem.length;
  const precisa = n * M.tamanhos.mesa.largura + (n - 1) * M.entre;
  const larg = Number(larguraDaMao);
  if (!(larg > 0)) return "mesa";
  return acima(larg, precisa, tinha && tinha !== "baixa" ? tinha === "mesa" : null) ? "mesa" : "media";
}

/* «70 %»: a chance da previsão (0–1) em inteiro, com o espaço da prancha */
export const porCento = (p) => (fin(p) ? `${Math.round(Number(p) * 100)} %` : "");

/* A LINHA DO DADO (§10 lacuna 1): toda carta tem uma das quatro formas.
   `previsao`: a do motor para o alvo marcado (previsaoDoHeroi — a MESMA que
   o bloco «seu golpe» lê). `faceMinima`: faceMinimaQueBasta(previsao), de
   batalha-na-tela.js — a chance e a face saem da mesma previsão e de mais
   lugar nenhum (o conserto de RX-2). `empurrao`: a previsão do empurrão sob
   o alvo (golpe.js vereditoDoEmpurrao). `fuga`: { golpes, min, max } quando
   o motor os diz; sem eles, «sem dado».
     1. «chance»  — rola, com alvo: d20 · 7+ · 70 %
     2. «bonus»   — rola, sem alvo: «d20» (e «+ 5» quando o bônus é sabido)
     3. «semDado» — «sem dado»
     4. «dano»    — o custo é dano: «3× 2–10» (a escrita da etiqueta de intenção) */
export function linhaDoDado(id, { previsao = null, empurrao = null, fuga = null, faceMinima = null } = {}) {
  const M = MAO_DE_ACOES;
  const f = obj(fuga);
  if (id === "fugir" && f && Number(f.golpes) > 0 && fin(f.min) && fin(f.max)) {
    const faixa = Number(f.min) === Number(f.max) ? `${f.min}` : `${f.min}–${f.max}`;
    return { forma: "dano", texto: `${f.golpes}× ${faixa}`, falado: `${f.golpes} golpes livres de ${String(faixa).replace("–", " a ")}` };
  }
  if (!M.dado[id]) return { forma: "semDado", texto: M.linha.semDado, falado: M.linha.semDado };
  if (id === "atacar") {
    const p = obj(previsao);
    if (p && !p.impedido && !p.intocavel && fin(p.chance)) {
      const face = fin(faceMinima) ? Number(faceMinima) : null;
      return { forma: "chance", dado: "d20", faceMinima: face, chance: porCento(p.chance),
        texto: `d20${face != null ? ` · ${face}+` : ""} · ${porCento(p.chance)}`,
        falado: `${face != null ? `${face} ou mais no d20, ` : ""}${Math.round(Number(p.chance) * 100)} por cento` };
    }
    const b = p && fin(p.bonus) ? Number(p.bonus) : null;
    return { forma: "bonus", dado: "d20", bonus: b, texto: b != null ? `d20 ${b >= 0 ? "+" : "−"} ${Math.abs(b)}` : "d20", falado: "rola o d20" };
  }
  if (id === "empurrar") {
    const e = obj(empurrao) && obj(empurrao.previsao) ? empurrao.previsao : null;
    /* a disputa é oposta: não há uma face que baste, só a chance */
    if (e && fin(e.chance)) return { forma: "chance", dado: "d20", faceMinima: null, chance: porCento(e.chance), texto: `d20 · ${porCento(e.chance)}`, falado: `${Math.round(Number(e.chance) * 100)} por cento` };
  }
  return { forma: "bonus", dado: "d20", bonus: null, texto: "d20", falado: "rola o d20" };
}

/* ---------------- A JOGADA (§10 lacuna 1 «A_JOGADA») ----------------
   O «como?» e o «Agir» juntos, à direita da mão. Três caminhos, uma ação:
   «Agir», Enter na pena, ou o segundo toque no alvo marcado. Impedida diz o
   que falta; pronta repete o veredito (o quê, em quem, a chance). */
export const A_JOGADA = Object.freeze({
  mesa: Object.freeze({ largura: 228, altura: 112, pena: 48, entre: 8, agir: 56 }),
  media: Object.freeze({ largura: 220, altura: 100, pena: 44, entre: 6, agir: 50 }),
  celular: Object.freeze({ pena: 233, agir: 124, altura: 60, entre: 8, margem: 6 }),
  pena: Object.freeze({ chao: "pergaminho", borda: "pergaminhoBorda", raio: 3, sombra: "pousado", glifo: "pena", glifoPx: 18, corGlifo: "brasaNoPergaminho",
    xGlifo: 12, xTexto: 38, convite: "diga como, se quiser…", conviteCurto: "diga como…", corConvite: "tintaDoPergaminhoDim", corTexto: "tintaDoPergaminho", foco: "tintaDoPergaminho", focoPx: 2 }),
  agir: Object.freeze({ raio: 6, rotulo: "Agir",
    pronta: Object.freeze({ chao: "amber", sombra: "peca", letra: "onAccent" }),
    impedida: Object.freeze({ tracejado: "4 4", borda: "inkMeio", px: 1.5, rotulo: "inkMeio", razao: "ink" }),
    desce: 1, transicaoMs: 160 }),
  razoes: Object.freeze({ semCarta: "escolha uma carta", semAlvo: "toque no alvo", semCasa: "toque a casa", naoEAVez: "não é a sua vez", espera: "o Mestre fala", semFrase: "diga como",
    /* F4d: o Mestre calou e os dados já decidiram — o «Agir» não some em silêncio,
       aponta para o aviso com «Tentar de novo» (que a tela traz ao foco) */
    silencio: "falta o Mestre contar · tente de novo" }),
  tetoDaFrase: 40,
});

/* O VEREDITO DO «AGIR», numa conta só (a tela só pinta). Devolve
   { pronta, diz, acao } — `acao` é o que o «Agir» faz: "atacar" (o alvo
   marcado), "empurrar" (o alvo do empurrão), "fugir", "caixa" (a frase da
   pena, com ou sem verbo armado) ou null (impedida: `diz` é a razão).
   `curto` (o celular, §12 lacuna 5): «verbo · chance» numa linha — o nome do
   alvo sai dali (está na tira da rodada); sem chance, «verbo · alvo». */
export function vereditoDoAgir({ armado = "", rotulo = "", alvo = "", chance = "", alvoDoEmpurrao = "", chanceDoEmpurrao = "", frase = "", custo = "",
  contando = false, bloqueado = false, fim = false, silencio = false, curto = false } = {}) {
  const R = A_JOGADA.razoes;
  const junta = (...xs) => xs.filter(Boolean).join(" · ");
  if (fim) return { pronta: false, diz: "", acao: null };
  if (contando) return { pronta: false, diz: R.naoEAVez, acao: null };
  if (silencio) return { pronta: false, diz: R.silencio, acao: "silencio" };
  if (bloqueado) return { pronta: false, diz: R.espera, acao: null };
  const temFrase = !!String(frase || "").trim();
  if (armado === "atacar") return alvo ? { pronta: true, diz: curto ? junta(rotulo || "Atacar", chance || alvo) : junta(rotulo || "Atacar", alvo, chance), acao: "atacar" } : { pronta: false, diz: R.semAlvo, acao: null };
  if (armado === "empurrar") return alvoDoEmpurrao ? { pronta: true, diz: curto ? junta(rotulo || "Empurrar", chanceDoEmpurrao || alvoDoEmpurrao) : junta(rotulo || "Empurrar", alvoDoEmpurrao, chanceDoEmpurrao), acao: "empurrar" } : { pronta: false, diz: R.semAlvo, acao: null };
  if (armado === "mover") return { pronta: false, diz: R.semCasa, acao: null };
  if (armado === "fugir") return { pronta: true, diz: junta(rotulo || "Fugir", custo), acao: "fugir" };
  if (armado) return temFrase ? { pronta: true, diz: curto ? junta(rotulo, custo) : junta(rotulo, alvo), acao: "caixa" } : { pronta: false, diz: R.semFrase, acao: null };
  if (temFrase) {
    const f = String(frase).trim();
    const T = A_JOGADA.tetoDaFrase;
    return { pronta: true, diz: f.length > T ? `${f.slice(0, T - 1)}…` : f, acao: "caixa" };
  }
  return { pronta: false, diz: R.semCarta, acao: null };
}

/* ---------------- A MESA DA LUTA (§10 lacuna 1, a coluna direita e o grupo) ----------------
   As três colunas da prancha 10a (1440 × 900): o grupo (140), o tapete com a
   mão (o resto) e o papel (300). As margens: 28 · 28 | 12 · 40. */
export const MESA_DA_LUTA = Object.freeze({
  /* abaixo desta largura a mesa volta ao arranjo de antes (a mesma régua da
     casca: abaixo de 1180 não cabem três zonas) */
  minima: 1180,
  grupo: Object.freeze({ largura: 140, margem: 28, entre: 28, rotulo: "O grupo" }),
  direita: Object.freeze({ largura: 300, entre: 12, margem: 40, gap: 18 }),
  topo: 18, baixo: 26, entreTapeteEMao: 14, entreFilaETapete: 12,
  /* abaixo de 1400 de largura as margens apertam (a prancha 10a é a 1440) */
  apertada: Object.freeze({ abaixoDe: 1400, margem: 16, entreGrupo: 6, entre: 12 }),
  papel: Object.freeze({ chao: "pergaminho", borda: "pergaminhoBorda", raio: 3, sombra: "pousado", respiro: 14,
    rotulo: "tintaDoPergaminhoDim", tinta: "tintaDoPergaminho", tintaDim: "tintaDoPergaminhoDim", brasa: "brasaNoPergaminho", perigo: "perigoNoPergaminho" }),
  fala: Object.freeze({ altura: 128, linhas: 4, alturaApertada: 88, linhasApertadas: 2, rotulo: "O Mestre", charsPorLinha: 40 }),
  elesVao: Object.freeze({ inclina: -1, rotulo: "Nesta rodada, eles vão", rosto: 30, sobrepoe: 12 }),
  alvo: Object.freeze({ altura: 222, alturaCurta: 128, carta: Object.freeze({ largura: 60, altura: 84 }), contas: 10, chance: 24, rotulo: "O alvo", golpe: "Seu golpe" }),
  rodada: Object.freeze({ chao: "latao", letra: "couroBaixo" }),
});

/* «NESTA RODADA, ELES VÃO»: as intenções agrupadas — os iguais que fazem o
   mesmo ao mesmo alvo numa linha («3× Rato Gigante · 2–10 cada → Saoirse»),
   e a soma do que chega ao herói se todos acertarem. Só soma o que o motor
   já anunciou (o min e o max da intenção); não decide nada. */
export function linhasDeElesVao(intencoes, { heroi = "" } = {}) {
  const lista = arr(intencoes).filter((i) => i && i.inimigo && obj(i.vista));
  const grupos = [];
  for (const i of lista) {
    const v = i.vista;
    const esp = especieDe(i.inimigo);
    const d = obj(v.dano);
    const chave = [esp, v.tipo || "", v.alvo || "", d ? d.min : "", d ? d.max : ""].join("|");
    const g = grupos.find((x) => x.chave === chave);
    if (g) { g.quantos += 1; g.nomes.push(i.inimigo); }
    else grupos.push({ chave, especie: esp, quantos: 1, nomes: [i.inimigo], tipo: v.tipo || "", alvo: v.alvo || "", dano: d && fin(d.min) && fin(d.max) ? { min: Number(d.min), max: Number(d.max) } : null, golpes: Math.max(1, Number(v.golpes) || 1) });
  }
  let min = 0, max = 0, n = 0;
  for (const g of grupos) {
    if (!heroi || g.alvo !== heroi || !g.dano) continue;
    min += g.dano.min * g.quantos * g.golpes; max += g.dano.max * g.quantos * g.golpes; n += g.quantos;
  }
  return { linhas: grupos.map(({ chave, ...g }) => g), noHeroi: n > 1 ? { quantos: n, min, max } : null };
}

/* ---------------- O QUE RESTA NA VEZ (§10, sob a carta de pé) ----------------
   Quatro linhas de 24: o disco «ação», o triângulo «bônus», o losango
   «reação» e as casas do «passo». O estado vem da economia da vez
   (vez-na-mesa.js economiaDaVez); aqui só a ordem e as palavras. */
export const O_QUE_RESTA_NA_VEZ = Object.freeze({
  linha: 24,
  ordem: Object.freeze(["acao", "bonus", "reacao", "movimento"]),
  palavra: Object.freeze({ acao: "ação", bonus: "bônus", reacao: "reação", movimento: "passo" }),
  livre: "livre", gasta: "gasta",
  casas: 6, casa: 10,
});


/* ---------------- A RÉGUA (§10 lacuna 4) ----------------
   A faixa da régua é 28 com a casa ≥ 40 e 24 abaixo; a calha de 22 sai.
   Por medida (formas.md §10): entre a costura (a 5 px) e o chão a letra de 12
   tem 7,5 px livres de cada lado na faixa de 28, e 4,5 na de 22. */
export function faixaDaRegua(casa) {
  return Number(casa) >= TAPETE.faixa.casaLarga ? TAPETE.faixa.larga : TAPETE.faixa.estreita;
}

/* O LADO DA CASA COM A FAIXA DA RÉGUA. A faixa depende da casa e a casa da
   faixa: conta-se com a de 28; se a casa não chega a 40, conta-se de novo com
   a de 24 (e a casa ganha os 4 px). `util`: a largura e a altura que a janela
   dá; `borda`: o que o couro ocupa; `piso`/`teto`: os da tela. */
export function ladoComARegua({ largura = 0, altura = 0, colunas = 1, linhas = 1, borda = 0, piso = 0, teto = 0 } = {}) {
  const lado = (faixa) => {
    const pl = largura > 0 ? Math.floor((largura - faixa - borda) / Math.max(1, colunas)) : Infinity;
    const pa = altura > 0 ? Math.floor((altura - faixa - borda) / Math.max(1, linhas)) : Infinity;
    return piso > 0 && largura > 0 ? Math.max(piso, Math.min(teto > 0 ? teto : Infinity, pl, pa)) : piso;
  };
  const larga = TAPETE.faixa.larga;
  const comLarga = lado(larga);
  if (comLarga >= TAPETE.faixa.casaLarga) return { lado: comLarga, faixa: larga };
  const estreita = TAPETE.faixa.estreita;
  return { lado: lado(estreita), faixa: estreita };
}

/* ---------------- A REAÇÃO NA MÃO (§10 «a caixa da reação, por dentro», forma 2 e 3) ----------------
   A caixa é a da mão (892 × 112 a 1440): couro, borda lataoSombra 1, raio 8.
   A vela a x 28 com a altura da caixa − 28 (84 na de 112, 72 na de 100; 56 só
   no celular); a x 74 o bloco de quem acerta (256); as cartas encostadas à
   direita, a y 4, altura 104, 8 entre elas — 308 cada com uma ou duas, 202
   com três, piso 200. «Deixar passar» é uma carta como as outras. */
export const REACAO_NA_MAO = Object.freeze({
  chao: "couro", borda: "lataoSombra", raio: 8,
  xVela: 28, velaDaCaixa: 28, velaCelular: 56, xBloco: 74, bloco: 256,
  topo: 4, alturaDaCarta: 104, entre: 8,
  largura: Object.freeze({ ate2: 308, tres: 202, piso: 200 }),
  carta: Object.freeze({ glifo: 22, xGlifo: 12, yGlifo: 11, xNome: 42, yCusto: 40, yResultado: 66, raio: 6 }),
  glifo: Object.freeze({ escudo_arcano: "escudo", aparar: "espada", esquiva_agil: "fuga", contramagia: "ban", contratempo: "relogio", contra_ataque: "espadas", oportunidade: "raio", deixar: "recuo" }),
  palavras: Object.freeze({ acerta: "acerta você", vem: "vêm de", tem: "você tem", semCusto: "sem custo", restam: "restam", leva: "você leva de", levaCurto: "leva", inteiro: "leva o golpe inteiro", deixar: "Deixar passar", a: "a" }),
});

/* a vela da reação na mão: a caixa − 28; no celular, 56 */
export function alturaDaVela(caixa, celular = false) {
  if (celular) return REACAO_NA_MAO.velaCelular;
  const c = Number(caixa);
  return c > REACAO_NA_MAO.velaDaCaixa ? c - REACAO_NA_MAO.velaDaCaixa : VELA_DA_REACAO.vela.altura;
}

/* quantas cartas cabem e com que largura: 1–2 → 308, 3 → 202, nunca abaixo de 200 */
export function larguraDaCartaDaReacao(n) {
  const L = REACAO_NA_MAO.largura;
  return Number(n) <= 2 ? L.ate2 : Math.max(L.piso, L.tres);
}

/* RX-1 · O QUE FICA DEPOIS DA REAÇÃO, por faixa. `faixa`: { min, max } do
   golpe que chega — a do anúncio do motor (a intenção de quem acerta), nunca
   o número já rolado: «o dano vir surpresa» é decisão da pessoa (15/09,
   ritmo-da-reacao.js «A OFERTA»). A conta é a de resolverReacao (reacoes.js),
   chamada nos dois extremos — a tela não corta dano nenhum. A reação com
   `chance` (a esquiva) pode falhar: o pior caso é o golpe inteiro. Sem faixa,
   null (a carta fica na forma provisória: custo e efeito). */
export function oQueFicaDaReacao(reacao, faixa) {
  const f = obj(faixa);
  if (!f || !fin(f.min) || !fin(f.max)) return null;
  const min = Math.max(0, Number(f.min)), max = Math.max(min, Number(f.max));
  if (!reacao) return { min, max };
  const r = obj(reacao);
  if (!r || r.gatilho !== "sofre_dano") return null;
  const fica = (d) => { const x = resolverReacao(r, { pers: {}, dano: d }); return x ? x.danoFinal : d; };
  const lo = fica(min), hi = r.chance != null ? max : fica(max);
  return { min: Math.min(lo, hi), max: Math.max(lo, hi) };
}

/* ---------------- A CARTA DO ESPÓLIO NA VITÓRIA (§10 lacuna 3) ----------------
   A CARTA_DO_ESPOLIO do F6 a dois terços: uma carta só para todo espólio.
   Face 160 × 224 (raio 6, ossoLume, sombra peca): a palavra da raridade a y
   10 · a casa de item de 64 com o glifo do item a (48, 32) · o nome a y 104
   (até 2 linhas) · uma frase a y 140 (até 2) · o pé a y 196 (uma). Largura
   de texto 144. Celular 104 × 146: palavra a y 6, casa de 48 a (28, 26), nome
   a y 80 em até 3 linhas, largura 96, sem frase nem pé. A raridade é moldura,
   palavra e tempo — nunca só cor. O verso é igual para todas. */
export const CARTA_DO_ESPOLIO = Object.freeze({
  mesa: Object.freeze({ largura: 160, altura: 224, yPalavra: 10, casa: 64, xCasa: 48, yCasa: 32, yNome: 104, linhasNome: 2, yFrase: 140, linhasFrase: 2, yPe: 196, texto: 144 }),
  celular: Object.freeze({ largura: 104, altura: 146, yPalavra: 6, casa: 48, xCasa: 28, yCasa: 26, yNome: 80, linhasNome: 3, texto: 96 }),
  raio: 6, chao: "ossoLume",
  moldura: Object.freeze({
    comum: Object.freeze({ borda: "ossoSombra", px: 1, cantos: false, lacre: false }),
    incomum: Object.freeze({ borda: "latao", px: 2, cantos: false, lacre: false }),
    rara: Object.freeze({ borda: "latao", px: 2, cantos: true, lacre: false }),
    lendaria: Object.freeze({ borda: "latao", px: 2, cantos: true, lacre: true }),
  }),
  canto: 15, lacre: 36,
  verso: Object.freeze({ chao: "couro", aro: "latao", aroPx: 2, fio: 8, fioAlfa: 0.55, losango: 32, losangoPx: 1.5 }),
  pe: "vai para a bolsa", naBolsa: "na bolsa",
  recolher: Object.freeze({ uma: "Recolher", todas: "Recolher tudo" }),
});

/* a face de uma carta do espólio: a moldura, a palavra, a família do glifo e
   a frase (a primeira do que o item diz de si, quando diz) */
export function faceDoEspolio(coisa) {
  const c = obj(coisa) || {};
  const r = raridadeDe(c);
  const moldura = molduraDaCasa(c);
  const desc = typeof c.desc === "string" ? c.desc.trim() : "";
  const frase = desc ? (desc.match(/^[\s\S]*?[.!?…](?=\s|$)/) || [desc])[0].trim() : "";
  return { raridade: r, moldura, palavra: NOME_DA_RARIDADE[r] || NOME_DA_RARIDADE.comum, familia: familiaDoItem(c.nome ? c : null), frase, pe: CARTA_DO_ESPOLIO.pe, brasa: moldura === "lendaria" };
}

/* ============================================================
   F4 §12 · A LUTA NO CELULAR — AS CINCO LACUNAS (formas.md «12 · A luta no
   celular», pranchas mente/figma/F4-luta-celular-12a…12e.png). Tudo aqui vale
   SÓ no degrau `celular`; a mesa não muda. As medidas são as da prancha; as
   decisões (o que a tira diz, para onde a folha vai, onde pousa a etiqueta,
   quantas cartas do espólio centram) são funções puras, provadas em Node.
   ============================================================ */

/* ---------------- 1 · A TIRA DA RODADA (§12 lacuna 1 e 2) ----------------
   A linha sob o tapete: a zona «eles vão» (313 × 44) e a aba do registro
   (44 × 44), 6 entre as duas. Papel pergaminho, borda 1, raio 3. */
export const TIRA_DA_RODADA = Object.freeze({
  y: 474, altura: 44, zona: 313, aba: 44, entre: 6,
  retrato: 28, passoDoRetrato: 15, xRetrato: 8, yRetrato: 8, retratosMax: 3, aroDoRetrato: 2,
  xTexto: Object.freeze({ um: 44, tres: 76, comConta: 94 }),
  yRotulo: 5, yFrase: 21, frase: 14, recuoDireita: 10,
  seta: 12, xSeta: 289, folgaDaSeta: 2, entreFrase: 6,
  conta: Object.freeze({ largura: 24, altura: 18, x: 62, y: 13 }),
  glifoDaAba: 24,
  anuncioMs: 2400, entradaMs: 180, entradaPx: 8, voltaMs: 120,
  lacre: 18, lacreX: 31, lacreY: -5, tetoDoLacre: 9, letraDoLacre: 12,
  papel: Object.freeze({ chao: "pergaminho", borda: "pergaminhoBorda", raio: 3, sombra: "pousado" }),
  aberta: Object.freeze({ chao: "osso", borda: "tintaDoPergaminho", px: 2, sombra: "erguido" }),
  palavras: Object.freeze({ eleVai: "Ele vai", elesVao: "Eles vão", aconteceu: "Aconteceu agora", alvo: "O alvo",
    ataca: "ataca", atacam: "atacam", emVoce: "em você", nenhum: "nenhum em você",
    aba: "registro da rodada", novas: "linhas novas", nova: "linha nova" }),
});

/* «2–10» (ou «4» quando o golpe não varia) */
const faixaDoDano = (d) => (d ? (Number(d.min) === Number(d.max) ? `${d.min}` : `${d.min}–${d.max}`) : "");
const danoDe = (v) => { const d = obj(v && v.dano); return d && fin(d.min) && fin(d.max) ? { min: Number(d.min), max: Number(d.max) } : null; };
const golpesDe = (v) => Math.max(1, Number(v && v.golpes) || 1);
const fraseDaIntencao = (v) => {
  const d = danoDe(v), g = golpesDe(v);
  return d ? `${g > 1 ? `${g}× ` : ""}${faixaDoDano(d)}${v.alvo ? ` → ${v.alvo}` : ""}` : [v.tipo, v.alvo].filter(Boolean).join(" → ");
};

/* O RESUMO DE «ELES VÃO» (§12 lacuna 2), numa linha de 44: os três casos da
   prancha 12b. `intencoes`: [{ inimigo, vista: { tipo, alvo, golpes, dano } }]
   (a mesma lista que linhasDeElesVao lê), na ordem da iniciativa. Devolve
   { rotulo, frase, direita, perigo, retratos, mais, abre, xTexto } ou null.
     1 inimigo        — «Ele vai» · «2–10 → Saoirse» · o nome dele à direita;
                        sem nota (abre = false): o toque marca-o como alvo;
     2–3, a mesma     — «Eles vão» · «3× 2–10 → Saoirse» · «de 6 a 30»;
     4+ ou diferentes — «Eles vão» · «5 atacam · 3 em você» · «de 6 a 30»;
                        nenhum em você: «5 atacam · nenhum em você», sem soma.
   A soma é só do que pode vir EM VOCÊ, e só do que o motor já anunciou. */
export function resumoDoQueElesVao(intencoes, heroi = "") {
  const P = TIRA_DA_RODADA.palavras;
  const lista = arr(intencoes).filter((i) => i && i.inimigo && obj(i.vista));
  if (!lista.length) return null;
  const n = lista.length;
  const nomes = lista.map((i) => String(i.inimigo));
  const retratos = nomes.slice(0, TIRA_DA_RODADA.retratosMax);
  const mais = Math.max(0, n - TIRA_DA_RODADA.retratosMax);
  const emVoce = heroi ? lista.filter((i) => i.vista.alvo === heroi && danoDe(i.vista)) : [];
  let smin = 0, smax = 0;
  for (const i of emVoce) { const d = danoDe(i.vista), g = golpesDe(i.vista); smin += d.min * g; smax += d.max * g; }
  const soma = emVoce.length ? `de ${smin} a ${smax}` : "";
  if (n === 1) {
    const v = lista[0].vista;
    return { rotulo: P.eleVai, frase: fraseDaIntencao(v), direita: nomes[0], perigo: !!heroi && v.alvo === heroi, retratos, mais: 0, abre: false, xTexto: "um" };
  }
  const v0 = lista[0].vista, d0 = danoDe(v0);
  const chave = (v) => { const d = danoDe(v); return [v.tipo || "", v.alvo || "", d ? d.min : "", d ? d.max : "", golpesDe(v)].join("|"); };
  const mesma = n <= TIRA_DA_RODADA.retratosMax && !!d0 && lista.every((i) => chave(i.vista) === chave(v0));
  if (mesma) {
    return { rotulo: P.elesVao, frase: `${n * golpesDe(v0)}× ${faixaDoDano(d0)}${v0.alvo ? ` → ${v0.alvo}` : ""}`, direita: soma,
      perigo: !!heroi && v0.alvo === heroi, retratos, mais, abre: true, xTexto: "tres" };
  }
  const atacam = lista.filter((i) => danoDe(i.vista)).length;
  const verbo = atacam === 1 ? P.ataca : P.atacam;
  const frase = emVoce.length ? `${atacam} ${verbo} · ${emVoce.length} ${P.emVoce}` : `${atacam} ${verbo} · ${P.nenhum}`;
  return { rotulo: P.elesVao, frase, direita: soma, perigo: emVoce.length > 0, retratos, mais, abre: true, xTexto: mais > 0 ? "comConta" : "tres" };
}

/* A NOTA ABERTA (§12 lacuna 2): uma linha por inimigo, na ordem da iniciativa
   — o nome e «2–10 → Saoirse»; `emVoce` pinta de perigo (e está escrito). */
export function linhasDaNota(intencoes, heroi = "") {
  return arr(intencoes).filter((i) => i && i.inimigo && obj(i.vista)).map((i) => (
    { nome: String(i.inimigo), texto: fraseDaIntencao(i.vista), emVoce: !!heroi && i.vista.alvo === heroi && !!danoDe(i.vista) }
  ));
}

/* O ALVO MARCADO na zona: «O alvo · Rato Gigante 1» e «4 de 4 PV · dano 4–9 ·
   abate 30 %» — os números da MESMA previsão que a carta e o «Agir» leem
   (golpePorExtenso). */
export function fraseDoAlvo({ nome = "", vida = null, vidaMax = null, dano = "", abate = null } = {}) {
  const partes = [];
  if (fin(vida) && fin(vidaMax)) partes.push(`${Math.max(0, Number(vida))} de ${Number(vidaMax)} PV`);
  if (dano) partes.push(`dano ${dano}`);
  if (fin(abate)) partes.push(`abate ${Math.round(Number(abate))} %`);
  return { rotulo: nome ? `${TIRA_DA_RODADA.palavras.alvo} · ${nome}` : TIRA_DA_RODADA.palavras.alvo, frase: partes.join(" · ") };
}

/* QUEM FALA NA ZONA: a linha que acabou de chegar > o alvo marcado > «eles vão» */
export function oQueAZonaDiz({ anuncio = false, alvo = false, elesVao = false } = {}) {
  return anuncio ? "anuncio" : alvo ? "alvo" : elesVao ? "elesVao" : null;
}

/* O LACRE DA ABA: as linhas chegadas desde o último fecho; «9+» acima do teto */
export function lacreDoRegistro(n) {
  const k = Math.max(0, Math.floor(Number(n) || 0));
  if (!k) return "";
  return k > TIRA_DA_RODADA.tetoDoLacre ? `${TIRA_DA_RODADA.tetoDoLacre}+` : String(k);
}

/* ---------------- 2 · A FOLHA DA RODADA (§12 lacuna 1 e 2) ----------------
   Toma o lugar da mão (363 × 166). Um estado só: null | "registro" | "nota". */
export const FOLHA_DA_RODADA = Object.freeze({
  x: 6, y: 568, largura: 363, altura: 166, cabecalho: 28,
  linhaDoRegistro: 22, linhasDoRegistro: 6, linhaDaNota: 26, linhasDaNota: 5,
  sombra: 10, alfaDaSombra: 0.2, trocaMs: 120,
  xCabecalho: 12, yCabecalho: 8, xTexto: 16, recuoDireita: 12, ponto: 6, xPonto: 5,
  retratoDaNota: 20, xRetratoDaNota: 10, xNomeDaNota: 38, resultado: 13,
  rotuloDoRegistro: "A rodada", rotuloDaRodada: "Rodada", rotuloDaNota: "Nesta rodada, eles vão", fechar: "toque fora para fechar",
  papel: Object.freeze({ chao: "pergaminho", borda: "pergaminhoBorda", raio: 3, sombra: "erguido" }),
});

/* PARA ONDE A FOLHA VAI. `evento`: "aba" · "zona" · "fora" · "esc" ·
   "suaVez" · "reacao". A aba abre e fecha o registro; a zona abre a nota (ou
   o registro, durante o anúncio de uma linha nova); só uma das duas fica
   aberta, e tocar na outra troca. Fora, Esc, a vez que vira sua e a reação
   que abre fecham. `abreNota`: false quando a zona não tem nota (1 inimigo). */
export function proximaFolha(atual, evento, { anunciando = false, abreNota = true } = {}) {
  const a = atual === "registro" || atual === "nota" ? atual : null;
  if (evento === "aba") return a === "registro" ? null : "registro";
  if (evento === "zona") {
    if (anunciando) return "registro";
    if (!abreNota) return a;
    return a === "nota" ? null : "nota";
  }
  if (evento === "fora" || evento === "esc" || evento === "suaVez" || evento === "reacao") return null;
  return a;
}

/* O REGISTRO GUARDA AS RODADAS. `historico`: [{ rodada, linhas }]; a rodada
   que chega substitui a sua (a lista do turno deles cresce passo a passo e a
   do fim da rodada é a mesma, inteira) e as outras ficam. Vazia não apaga. */
export function juntaORegistro(historico, rodada, linhas) {
  const h = arr(historico).filter((x) => x && fin(x.rodada));
  const ls = arr(linhas).filter((l) => l && l.quem);
  if (!fin(rodada) || !ls.length) return h;
  const r = Number(rodada);
  return [...h.filter((x) => Number(x.rodada) !== r), { rodada: r, linhas: ls }].sort((a, b) => a.rodada - b.rodada);
}

/* A CARA DO RESULTADO: dano em um dos nossos (perigo) · dano neles (tinta) ·
   errou (a nota apagada) · o resto (aproximou-se, fugiu) também apagado */
export function caraDaLinha(linha, nossos = []) {
  const l = obj(linha) || {};
  const diz = String(l.diz || "");
  if (/\berr(ou|a)\b|\bfalh|\bimune\b/i.test(diz)) return "errou";
  if (!/\d/.test(diz)) return "outro";
  const n = new Set(arr(nossos).map(String));
  return l.alvo && n.has(String(l.alvo)) ? "nos" : l.alvo ? "neles" : "outro";
}

/* AS LINHAS DA FOLHA, de cima para baixo: as rodadas antigas primeiro (com
   o separador «Rodada N»), a de agora embaixo (o cabeçalho a nomeia).
   `indice` conta só as linhas (0 = a mais antiga) — é com ele que se sabe
   quais ainda não foram lidas. */
export function linhasDaFolha(historico, { nossos = [] } = {}) {
  const h = arr(historico).filter((x) => x && fin(x.rodada) && arr(x.linhas).length);
  const out = [];
  let i = 0;
  h.forEach((x, k) => {
    if (k < h.length - 1) out.push({ tipo: "rodada", rodada: Number(x.rodada) });
    for (const l of arr(x.linhas)) {
      if (!l || !l.quem) continue;
      out.push({ tipo: "linha", indice: i++, quem: String(l.quem), alvo: l.alvo ? String(l.alvo) : "", resultado: String(l.diz || ""), cara: caraDaLinha(l, nossos) });
    }
  });
  return { linhas: out, total: i, rodada: h.length ? Number(h[h.length - 1].rodada) : null };
}

/* ---------------- 3 · A VITÓRIA NO CELULAR (§12 lacuna 3) ----------------
   Sem véu e sem cartas sobre o tapete: o título e o recibo na linha da tira,
   as cartas no lugar da mão, os dois botões na última linha. */
export const VITORIA_NO_CELULAR = Object.freeze({
  titulo: Object.freeze({ x: 8, y: 479 }), recibo: Object.freeze({ direita: 367, y: 487, corpo: 14 }),
  cartas: Object.freeze({ y: 568, largura: 104, altura: 146, entre: 8, passo: 112, xDaFila: 6, centraAte: 3, sombra: 12 }),
  preco: Object.freeze({ y: 721 }),
  recolher: Object.freeze({ x: 6, y: 744, largura: 150, altura: 60 }),
  respirar: Object.freeze({ x: 162, y: 744, largura: 207, altura: 60, sozinho: 363 }),
  tela: 375, margem: 6, alfaDaSombra: 0.42,
  palavras: Object.freeze({ recolher: "Recolher tudo", respirar: "Respirar fundo →", nada: "nada ficou no chão" }),
});

/* AS CARTAS DO ESPÓLIO: 1 a 3 centradas (8 entre elas; uma só a x 136); 4 ou
   mais em fila que corre a partir de x 6, passo 112 (três inteiras e 33 px da
   quarta — o corte diz que há mais). */
export function arranjoDoEspolio(n, tela = VITORIA_NO_CELULAR.tela) {
  const C = VITORIA_NO_CELULAR.cartas;
  const k = Math.max(0, Math.floor(Number(n) || 0));
  if (!k) return { fila: false, x0: null, vazio: true };
  if (k > C.centraAte) return { fila: true, x0: C.xDaFila, vazio: false };
  const total = k * C.largura + (k - 1) * C.entre;
  return { fila: false, x0: Math.round((Number(tela) - total) / 2), vazio: false };
}

/* A ÚLTIMA LINHA: «Recolher tudo» (150) + «Respirar fundo →» (207) enquanto há
   o que recolher, com uma carta ou com nove; tudo recolhido, «Respirar fundo
   →» toma a linha (363) e o preço perde a metade que já não vale. */
export function ultimaLinhaDaVitoria(porRecolher) {
  const V = VITORIA_NO_CELULAR;
  const ha = Math.max(0, Number(porRecolher) || 0) > 0;
  return { recolher: ha, larguraDoRespirar: ha ? V.respirar.largura : V.respirar.sozinho,
    preco: ha ? CERIMONIA_DA_VITORIA.preco : CERIMONIA_DA_VITORIA.preco.split(" · ")[0] };
}

/* ---------------- 4 · A ETIQUETA DE DANO (§12 lacuna 4) ----------------
   24 de altura (28 no crítico), 32 a 44 de largura (menor que a casa de 48),
   sem toque, acima de tudo no tapete. 1100 ms; nada espera por ela. As
   distâncias são as da casa de 48 da prancha, e escalam com a casa. */
export const ETIQUETA_DE_DANO = Object.freeze({
  altura: 24, alturaDoCritico: 28, larguraMinima: 32, larguraMaxima: 44, enchimento: 6, raio: 4,
  casaDeReferencia: 48, emCima: 36, aoLado: 40, dentro: 12,
  entraMs: 120, escalaInicial: 0.92, sobePx: 12, sobeMs: 240, ficaAteMs: 900, saiMs: 200, criticoMaisMs: 200,
  letra: 16, entrelinha: 20, letraDoCritico: 18, entrelinhaDoCritico: 24, menos: "−",
  caras: Object.freeze({
    dano:    Object.freeze({ chao: "lacre", borda: "sobreLacre", px: 1, letra: "sobreLacre" }),
    critico: Object.freeze({ chao: "lacre", borda: "amber", px: 2, letra: "sobreLacre" }),
    errou:   Object.freeze({ chao: "ossoLume", borda: "tintaDoPergaminhoDim", px: 1, letra: "tintaDoPergaminhoDim" }),
    cura:    Object.freeze({ chao: "musgoNoPergaminho", borda: "ossoLume", px: 1, letra: "ossoLume" }),
  }),
});

/* ONDE POUSA (pela ordem): em cima — se a casa de cima existe, está na janela
   (fora dela fica a régua presa) e não tem peça de pé; à direita, à esquerda
   — se a casa existe, está na janela e não tem peça; senão dentro (a metade
   de cima da própria peça: 44 × 24 cabe na casa de 48, não tapa vizinha
   nenhuma por construção). Dano em mais de uma peça ao mesmo tempo: todas
   dentro. Peça caída conta como casa livre (quem chama só manda as de pé).
   `casa` {x, y}; `ocupadas` [{x, y}]; `janela` {x0, y0, x1, y1} (inclusiva). */
export function ondePousaODano({ casa = null, ocupadas = [], janela = null, simultaneos = false } = {}) {
  const c = obj(casa);
  if (!c || !fin(c.x) || !fin(c.y) || simultaneos) return "dentro";
  const J = obj(janela);
  const naJanela = (x, y) => !J || (x >= J.x0 && x <= J.x1 && y >= J.y0 && y <= J.y1);
  const tem = new Set(arr(ocupadas).filter((q) => q && fin(q.x) && fin(q.y)).map((q) => `${q.x},${q.y}`));
  const livre = (x, y) => naJanela(x, y) && !tem.has(`${x},${y}`);
  const x = Number(c.x), y = Number(c.y);
  if (livre(x, y - 1)) return "cima";
  if (livre(x + 1, y)) return "direita";
  if (livre(x - 1, y)) return "esquerda";
  return "dentro";
}

/* o centro da etiqueta a partir do centro da peça, em px, na casa de agora */
export function deslocamentoDaEtiqueta(lugar, casaPx = ETIQUETA_DE_DANO.casaDeReferencia) {
  const E = ETIQUETA_DE_DANO;
  const k = (Number(casaPx) > 0 ? Number(casaPx) : E.casaDeReferencia) / E.casaDeReferencia;
  if (lugar === "cima") return { dx: 0, dy: -E.emCima * k };
  if (lugar === "direita") return { dx: E.aoLado * k, dy: 0 };
  if (lugar === "esquerda") return { dx: -E.aoLado * k, dy: 0 };
  return { dx: 0, dy: -E.dentro * k };
}

/* A CARA E O TEXTO, a partir da variação do golpe (variacaoDoGolpe):
   «−7» (o menos verdadeiro, U+2212), «errou», «+6». O crítico fica 200 ms a mais. */
export function etiquetaDoGolpe(variacao) {
  const v = obj(variacao);
  if (!v) return null;
  const E = ETIQUETA_DE_DANO;
  const t = String(v.texto || "");
  const cara = v.tom === "erro" ? "errou" : v.tom === "cura" || /^\+/.test(t) ? "cura" : v.critico ? "critico" : "dano";
  const texto = cara === "errou" ? t : t.replace(/^-/, E.menos);
  const saiEm = E.ficaAteMs + (cara === "critico" ? E.criticoMaisMs : 0);
  return { cara, texto, saiEm, dura: saiEm + E.saiMs, altura: cara === "critico" ? E.alturaDoCritico : E.altura };
}

/* ---------------- 5 · A CARTA ESTREITA, 85 × 80 (§12 lacuna 5) ----------------
   A linha do custo = a peça do recurso (12 px) + 4 + uma frase curta; sem
   peça = não gasta nada da vez. Nunca reticências, nunca duas linhas, nunca
   letra menor: o que não cabe em 75 px não vai para a carta. */
export const CUSTO_NA_CARTA_ESTREITA = Object.freeze({
  peca: 12, entre: 4, larguraUtil: 75, margem: 5, altura: 18, tetoDeLetras: 11,
  /* o recurso da vez → a peça (as quatro de O_QUE_RESTA_NA_VEZ, e as espadas
     dos golpes que você leva) */
  pecaDoRecurso: Object.freeze({ acao: "acao", bonus: "bonus", reacao: "reacao", movimento: "passo" }),
  glifoDaPeca: Object.freeze({ passo: "passo", golpe: "espadas" }),
  texto: Object.freeze({ acao: "ação", bonus: "bônus", reacao: "reação" }),
  item: "tem", esperar: "passa a vez", fugir: "sai da luta", golpe: "golpe", golpes: "golpes", ate: "até", metros: "m",
});

/* as razões da carta impedida, de até 11 letras (a razão por extenso fica no
   «Agir»). As chaves são as de RECUSAS_DO_VERBO (tela-de-batalha.js). */
export const RAZAO_NA_CARTA_ESTREITA = Object.freeze({
  semPasso: "sem passo", semSaida: "sem saída", semAlcance: "longe", semAlvo: "sem alvo",
  fimDaLuta: "fim da luta", mestreFala: "espere", inconsciente: "caído", jaAgiu: "já agiu",
  bolsaVazia: "bolsa vazia", outra: "impedida",
});

const metrosCurtos = (m) => String(Math.round(Number(m) * 10) / 10).replace(".", ",");

/* O CUSTO CURTO de uma carta: { peca, texto }. `estado`: { recurso (o da
   vez: acao · bonus · reacao · movimento), passoM (o que resta), passoTotal,
   gastoM (o que o destino armado gasta), nItens, golpes (os golpes livres da
   fuga, quando o motor os diz) }. */
export function custoCurto(id, { recurso = null, passoM = null, passoTotal = null, gastoM = null, nItens = null, golpes = null } = {}) {
  const C = CUSTO_NA_CARTA_ESTREITA;
  if (id === "item") return { peca: null, texto: `${C.item} ${Math.max(0, Number(nItens) || 0)}` };
  if (id === "esperar") return { peca: null, texto: C.esperar };
  if (id === "fugir") {
    const g = Math.max(0, Math.floor(Number(golpes) || 0));
    return g > 0 ? { peca: "golpe", texto: `${g} ${g === 1 ? C.golpe : C.golpes}` } : { peca: null, texto: C.fugir };
  }
  if (recurso === "movimento") {
    if (fin(gastoM) && fin(passoTotal)) return { peca: "passo", texto: `${metrosCurtos(gastoM)}/${metrosCurtos(passoTotal)} ${C.metros}` };
    if (fin(passoM)) return { peca: "passo", texto: `${C.ate} ${metrosCurtos(passoM)} ${C.metros}` };
    return { peca: "passo", texto: "" };
  }
  if (C.texto[recurso]) return { peca: C.pecaDoRecurso[recurso], texto: C.texto[recurso] };
  return { peca: null, texto: "" };
}

/* A RAZÃO CURTA: a frase longa da regra → a de até 11 letras */
export function razaoCurta(longa) {
  const R = RAZAO_NA_CARTA_ESTREITA;
  const s = String(longa || "");
  if (!s) return "";
  for (const [k, v] of Object.entries(RECUSAS_DO_VERBO)) if (v === s && R[k]) return R[k];
  if (s === MAO_DE_ACOES.item.vazia) return R.bolsaVazia;
  return s.length <= CUSTO_NA_CARTA_ESTREITA.tetoDeLetras ? s : R.outra;
}
