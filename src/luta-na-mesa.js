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
   a mesa quando as oito de 102 cabem na largura da mão; senão a média */
export function tamanhoDaCarta({ telefone = false, larguraDaMao = 0, alturaUtil = 0 } = {}) {
  const M = MAO_DE_ACOES;
  if (telefone) return "celular";
  if (Number(alturaUtil) > 0 && Number(alturaUtil) < M.alturaUtilBaixa) return "baixa";
  const n = M.ordem.length;
  const precisa = n * M.tamanhos.mesa.largura + (n - 1) * M.entre;
  if (!(Number(larguraDaMao) > 0) || Number(larguraDaMao) >= precisa) return "mesa";
  return "media";
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
  razoes: Object.freeze({ semCarta: "escolha uma carta", semAlvo: "toque no alvo", semCasa: "toque a casa", naoEAVez: "não é a sua vez", espera: "o Mestre fala", semFrase: "diga como" }),
  tetoDaFrase: 40,
});

/* O VEREDITO DO «AGIR», numa conta só (a tela só pinta). Devolve
   { pronta, diz, acao } — `acao` é o que o «Agir» faz: "atacar" (o alvo
   marcado), "empurrar" (o alvo do empurrão), "fugir", "caixa" (a frase da
   pena, com ou sem verbo armado) ou null (impedida: `diz` é a razão). */
export function vereditoDoAgir({ armado = "", rotulo = "", alvo = "", chance = "", alvoDoEmpurrao = "", chanceDoEmpurrao = "", frase = "", custo = "",
  contando = false, bloqueado = false, fim = false } = {}) {
  const R = A_JOGADA.razoes;
  const junta = (...xs) => xs.filter(Boolean).join(" · ");
  if (fim) return { pronta: false, diz: "", acao: null };
  if (contando) return { pronta: false, diz: R.naoEAVez, acao: null };
  if (bloqueado) return { pronta: false, diz: R.espera, acao: null };
  const temFrase = !!String(frase || "").trim();
  if (armado === "atacar") return alvo ? { pronta: true, diz: junta(rotulo || "Atacar", alvo, chance), acao: "atacar" } : { pronta: false, diz: R.semAlvo, acao: null };
  if (armado === "empurrar") return alvoDoEmpurrao ? { pronta: true, diz: junta(rotulo || "Empurrar", alvoDoEmpurrao, chanceDoEmpurrao), acao: "empurrar" } : { pronta: false, diz: R.semAlvo, acao: null };
  if (armado === "mover") return { pronta: false, diz: R.semCasa, acao: null };
  if (armado === "fugir") return { pronta: true, diz: junta(rotulo || "Fugir", custo), acao: "fugir" };
  if (armado) return temFrase ? { pronta: true, diz: junta(rotulo, alvo), acao: "caixa" } : { pronta: false, diz: R.semFrase, acao: null };
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
