/* ============================================================
   AS CÉLULAS DO ERMO (v9.54) — o estágio 2 da geração de mundo

   O mundo deste jogo tinha duas escalas e um buraco entre elas. A
   PRIMEIRA é o continente: vinte assentamentos com nome, porte, bioma e
   estrada, gerados na criação (v7.5) e desenhados no pergaminho. A
   TERCEIRA é a planta da cidade e o cinturão de fazendas em volta dela
   (v9.51). Entre uma e outra ficava o espaço vazio — dias inteiros de
   estrada em que o mundo não existia.

   E isso tinha consequência mecânica, não só estética. A viagem sorteava
   clima e encontro sem olhar POR ONDE se passava; o teste de navegação
   pedia um bioma e recebia o da cidade de origem, mesmo no quarto dia de
   marcha; e um lugar fora da cidade — a fazenda, a ruína, o acampamento
   — era um nome solto, sem posição no mundo. Três sistemas falando de um
   espaço que nenhum deles conseguia apontar no mapa.

   Aqui esse espaço passa a existir. O pergaminho de 100 por 100 vira uma
   grade de células, e cada uma é determinística a partir da semente: o
   mesmo mundo devolve para sempre a mesma célula na mesma coordenada.
   Uma célula sabe três coisas — que terreno é, quão longe da gente está,
   e o que há nela de notável.

   DUAS DECISÕES QUE VALE REGISTRAR:

   1) O BIOMA DA CÉLULA NÃO É SORTEADO. Ele é herdado do assentamento
      mais próximo, com uma faixa de transição nas bordas. Sortear daria
      um mundo de retalhos — deserto colado em geleira — e um mundo de
      retalhos é pior do que nenhum mundo, porque contradiz o que o
      jogador vê no mapa.

   2) O EIXO EXTRA ENTRA AQUI (estágio 3). A Torre e o Braço Estelar
      declaram um eixo `z` em `moldes.js` desde a v9.40, e esse eixo
      nunca significou nada além de um rótulo. Na célula ele passa a
      pesar: o perigo cresce com a altura, pela mesma `fatorDePerigo`
      que o molde já declara. Onde o molde não tem `z`, nada muda — e
      esse era o critério combinado: "só onde significar alguma coisa".
   ============================================================ */

import { rngDe } from "./geografia.js";
import { moldePorId, temEixo, fatorDePerigo, biomasDe } from "./moldes.js";

/* O pergaminho tem 100 de lado. Vinte por vinte dá células de cinco
   unidades — grandes o bastante para uma célula ser um dia de marcha, e
   pequenas o bastante para uma estrada longa cruzar várias. */
export const LADO_CELULA = 5;
export const CELULAS_POR_LADO = 20;

export const coordDaCelula = (x, y) => ({
  cx: Math.max(0, Math.min(CELULAS_POR_LADO - 1, Math.floor((Number(x) || 0) / LADO_CELULA))),
  cy: Math.max(0, Math.min(CELULAS_POR_LADO - 1, Math.floor((Number(y) || 0) / LADO_CELULA))),
});
export const centroDaCelula = (cx, cy) => ({ x: cx * LADO_CELULA + LADO_CELULA / 2, y: cy * LADO_CELULA + LADO_CELULA / 2 });

/* ---------------- O QUE HÁ DE NOTÁVEL ----------------
   Uma feição por célula, escolhida pelo bioma. Não é um lugar com dono
   nem uma quest: é a coisa que se avista da estrada e que dá ao dia de
   marcha um rosto. O Mestre recebe o nome pronto e narra; ele não a
   inventa, e por isso ela é a mesma na volta. */
const FEICOES = {
  planicie: [
    { icone: "🌾", nome: "o mar de capim alto", desc: "capim na altura do peito, e o vento fazendo ondas nele" },
    { icone: "🪨", nome: "as três pedras", desc: "três lajes fincadas de pé, antigas demais para alguém lembrar quem as pôs" },
    { icone: "🌳", nome: "a árvore solitária", desc: "uma só árvore num campo sem fim, com marcas de fogueira embaixo" },
    { icone: "🦴", nome: "a carcaça grande", desc: "ossos de algo maior que um boi, limpos pelo tempo" },
  ],
  floresta: [
    { icone: "🍄", nome: "o círculo de cogumelos", desc: "um anel perfeito que ninguém plantou; os cavalos contornam" },
    { icone: "🪵", nome: "a clareira queimada", desc: "troncos pretos em pé, e mato novo já subindo entre eles" },
    { icone: "💧", nome: "a nascente fria", desc: "água saindo da pedra, boa de beber e gelada demais para o clima" },
    { icone: "🕸", nome: "o trecho de teias", desc: "teias de galho a galho, grossas o bastante para segurar um chapéu" },
  ],
  montanha: [
    { icone: "🏔", nome: "o desfiladeiro estreito", desc: "duas paredes e um caminho onde só passa um de cada vez" },
    { icone: "⛏", nome: "a boca de mina abandonada", desc: "escorada com madeira podre, e um ar que sopra de dentro" },
    { icone: "🦅", nome: "o ninho no penhasco", desc: "algo grande criou filhotes ali, e não faz muito tempo" },
    { icone: "🪨", nome: "o campo de blocos", desc: "pedras do tamanho de casas, caídas de cima em algum século" },
  ],
  deserto: [
    { icone: "🌵", nome: "o poço seco", desc: "um poço de pedra com o balde ainda pendurado, e nada embaixo" },
    { icone: "🏜", nome: "o mar de dunas", desc: "dunas que mudam de lugar entre uma passagem e outra" },
    { icone: "🦴", nome: "a caravana enterrada", desc: "mastros de carroça saindo da areia, meio cobertos" },
    { icone: "🧂", nome: "a crosta de sal", desc: "uma planície branca que estala sob o pé e cega ao meio-dia" },
  ],
  pantano: [
    { icone: "🪷", nome: "a água parada", desc: "espelho verde com bolhas subindo devagar" },
    { icone: "🏚", nome: "o palafita caído", desc: "uma casa sobre estacas, tombada de lado há muito tempo" },
    { icone: "🔥", nome: "as luzes baixas", desc: "chamas pálidas correndo rente à água, e nenhuma queima nada" },
    { icone: "🐊", nome: "o banco de lama", desc: "uma língua de lama onde algo pesado se arrasta e volta" },
  ],
  gelo: [
    { icone: "❄", nome: "a fenda azul", desc: "uma greta na geleira, funda e da cor do céu de inverno" },
    { icone: "🧊", nome: "os pilares de gelo", desc: "colunas que o vento esculpiu e que assobiam quando ele volta" },
    { icone: "🐺", nome: "o rastro em fila", desc: "pegadas numa fila só, andando na direção contrária à sua" },
    { icone: "⛺", nome: "o acampamento congelado", desc: "barracas de pé, intactas, e ninguém dentro" },
  ],
  costa: [
    { icone: "🌊", nome: "a enseada de pedras", desc: "arrebentação forte e uma faixa de areia entre rochas" },
    { icone: "⚓", nome: "o casco encalhado", desc: "um navio deitado de lado, com a maré entrando e saindo dele" },
    { icone: "🪸", nome: "as poças de maré", desc: "piscinas rasas cheias de bicho e cor, e cheiro forte" },
    { icone: "🗼", nome: "o farol apagado", desc: "torre de pedra sem luz, e a porta batendo sozinha" },
  ],
};
const FEICOES_PADRAO = [
  { icone: "🧭", nome: "o marco de pedra", desc: "um marco antigo com o nome do lugar meio apagado" },
  { icone: "🔥", nome: "a fogueira fria", desc: "cinzas de quem passou por aqui antes de você" },
  { icone: "🐦", nome: "o bando parado", desc: "aves demais pousadas no mesmo trecho, e caladas" },
];

/* ---------------- O BIOMA, HERDADO E NÃO SORTEADO ---------------- */
function biomaDaCelula(mapa, cx, cy, molde) {
  const cidades = (mapa && mapa.cidades) || [];
  const c = centroDaCelula(cx, cy);
  let melhor = null, dist = Infinity;
  for (const cid of cidades) {
    if (!cid || cid.x == null) continue;
    const d = Math.hypot(cid.x - c.x, cid.y - c.y);
    if (d < dist) { dist = d; melhor = cid; }
  }
  if (melhor && melhor.bioma) return { bioma: melhor.bioma, deQuem: melhor.nome, dist };
  const bs = biomasDe(molde);
  return { bioma: (bs[0] && bs[0].id) || "planicie", deQuem: "", dist: Infinity };
}

/* ---------------- A CÉLULA ----------------
   Determinística: mesma semente, mesma coordenada, mesma célula para
   sempre. `z` é o eixo extra dos moldes que o declaram — a Torre e o
   Braço Estelar; nos outros ele é ignorado e nada muda. */
export function celulaEm(semente, x, y, { mapa = null, molde = null, z = 0 } = {}) {
  const { cx, cy } = coordDaCelula(x, y);
  const m = moldePorId(molde && molde.id ? molde.id : molde);
  const eixoZ = temEixo(m, "z");
  const zz = eixoZ ? Math.max(0, Math.round(Number(z) || 0)) : 0;
  const rnd = rngDe(`${semente}|celula|${cx},${cy}${eixoZ ? `,${zz}` : ""}`);
  const bio = biomaDaCelula(mapa, cx, cy, m);

  /* PERIGO: cresce com a distância do assentamento mais próximo. Perto de
     gente há estrada, patrulha e alguém para gritar; longe, não há. Os
     degraus estão em unidades do pergaminho, e 25 delas é meio mundo. */
  const d = bio.dist;
  let perigo = d <= 6 ? 0 : d <= 14 ? 1 : d <= 25 ? 2 : 3;
  /* v9.54 (estágio 3): onde o molde tem eixo Z, a altura pesa. É o único
     lugar do jogo em que `fatorDePerigo` — declarada desde a v9.40 —
     encosta em alguma coisa. */
  if (eixoZ) perigo = Math.min(4, Math.round(perigo * fatorDePerigo(m, zz + 1)));

  const pool = FEICOES[bio.bioma] || FEICOES_PADRAO;
  const feicao = pool[Math.floor(rnd() * pool.length)] || FEICOES_PADRAO[0];

  return {
    id: `${cx},${cy}${eixoZ ? `,${zz}` : ""}`,
    cx, cy, z: eixoZ ? zz : null,
    centro: centroDaCelula(cx, cy),
    bioma: bio.bioma,
    perigo,
    rotuloPerigo: ROTULOS_PERIGO[Math.min(perigo, ROTULOS_PERIGO.length - 1)],
    feicao,
    perto: bio.deQuem,
    distancia: Math.round(d),
  };
}

export const ROTULOS_PERIGO = [
  "terra de gente: estrada batida, alguém sempre por perto",
  "beira do ermo: ainda há trilha, mas ninguém patrulha",
  "ermo: sem caminho, sem socorro, e o que vive aqui não viu gente",
  "fim do mapa: o que anda por aqui não deveria existir tão perto de casa",
  "lugar que não devia ser pisado",
];

/* ---------------- A ROTA ----------------
   Por quais células passa quem vai de A a B. É isto que faz a viagem, o
   ermo e os arredores falarem a mesma língua: o encontro do terceiro dia
   deixa de ser sorteado no vácuo e passa a ser sorteado NUM LUGAR. */
export function celulasNaRota(semente, a, b, opcoes = {}) {
  if (!a || !b || a.x == null || b.x == null) return [];
  const passos = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / LADO_CELULA));
  const vistas = new Map();
  for (let i = 0; i <= passos; i++) {
    const t = i / passos;
    const c = celulaEm(semente, a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, opcoes);
    if (!vistas.has(c.id)) vistas.set(c.id, c);
  }
  return [...vistas.values()];
}

/* Onde eu estou agora, na viagem. `fracao` é o quanto do caminho já foi
   andado (0 = acabei de sair, 1 = estou chegando) — quem sabe disso é o
   App, que tem o calendário e a rota; este arquivo não precisa saber o
   que é um dia. */
export function celulaDaJornada(semente, jornada, mapa, molde, fracao = 0) {
  if (!jornada || !jornada.de || !jornada.para) return null;
  const cidades = (mapa && mapa.cidades) || [];
  const acha = (nome) => cidades.find((c) => (c.nome || "").toLowerCase() === String(nome || "").toLowerCase());
  const A = acha(jornada.de), B = acha(jornada.para);
  if (!A || !B || A.x == null || B.x == null) return null;
  const t = Math.max(0, Math.min(1, Number(fracao) || 0));
  return celulaEm(semente, A.x + (B.x - A.x) * t, A.y + (B.y - A.y) * t, { mapa, molde });
}

/* A célula de um ponto qualquer do mapa — é por aqui que um LUGAR fora da
   cidade (a fazenda, a ruína, o acampamento) ganha posição em vez de
   continuar sendo um nome solto. */
export function celulaDaCidade(semente, cidade, opcoes = {}) {
  if (!cidade || cidade.x == null) return null;
  return celulaEm(semente, cidade.x, cidade.y, opcoes);
}

/* ---------------- OS TEXTOS ----------------
   O Mestre recebe o lugar pronto e o narra. Ele não inventa a feição, e
   por isso ela é a mesma na volta — que é a diferença entre um mundo e
   um gerador de frases. */
export function resumoCelulaPrompt(cel, molde) {
  if (!cel) return "";
  const m = moldePorId(molde && molde.id ? molde.id : molde);
  const nomeBioma = (biomasDe(m).find((b) => b.id === cel.bioma) || {}).rotulo || cel.bioma;
  return `O ERMO AQUI (do sistema — é FATO, não sugestão): ${nomeBioma}, ${cel.rotuloPerigo}${cel.perto ? `. O lugar habitado mais próximo é ${cel.perto}, a uns ${cel.distancia} de distância no mapa` : ""}.
- Nesta parte do caminho há ${cel.feicao.nome}: ${cel.feicao.desc}. Isto EXISTE — use na cena se couber, e da próxima vez que eu passar por aqui será a mesma coisa, no mesmo lugar.
- Não invente povoado, estalagem nem gente estabelecida no ermo: o que há de habitado o sistema já me disse. Um viajante de passagem, sim; uma vila que ninguém registrou, não.`;
}

export function linhaDaCelula(cel) {
  if (!cel) return "";
  return `${cel.feicao.icone} ${cel.feicao.nome} — ${cel.feicao.desc}.`;
}

export const CELULAS_PROMPT = `O ESPAÇO ENTRE OS LUGARES (v9.54):
- O caminho entre dois assentamentos não é vazio: o sistema conhece cada trecho dele — que terreno é, quão longe da gente está e o que há nele de notável. Você recebe o trecho ATUAL pronto e o narra.
- A feição de um trecho é PERMANENTE. Se o herói voltar por aqui, encontra a mesma coisa no mesmo lugar. Nunca a mude, nunca a substitua por outra e nunca a trate como cenário descartável.
- Quanto mais longe do assentamento mais próximo, mais perigoso — e o sistema diz quanto. Longe de tudo, nada de patrulha, taverna ou socorro chegando a tempo.
- É TERMINANTEMENTE PROIBIDO fundar povoado, estalagem ou comunidade no ermo por conta própria. Gente de passagem, ermitão, acampamento de caçadores: sim. Um lugar habitado que o mapa não tem: não.`;
