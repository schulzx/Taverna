/* ============================================================
   O GRID DE COMBATE (v9.34) — o espaço vira metro

   POR QUE A GRADE AGORA, SE A v9.20 ESCOLHEU ZONAS. O comentário do
   zonas.js dizia, e continua certo: "grade quadriculada exige contar
   quadrados, desenhar mapa e digitar coordenadas — três coisas que
   matam o ritmo de um jogo que se joga escrevendo". O que mudou não
   foi esse argumento; foi o grimório. Bola de Fogo tem raio de 6 m,
   Cone de Frio 18 m, Chuva de Meteoros 1,5 km — e três zonas em linha
   não conseguem representar nada disso. Eu tive que inventar uma
   ponte (METROS_POR_ZONA = 12, METROS_ENTRE_ZONAS = 20) para traduzir
   metro em zona, e ponte assim é remendo: fazia a bola de fogo e a
   chuva de meteoros pegarem quase a mesma coisa.

   Com quadrado de 1,5 m, `raio: 6` são quatro quadrados e a tradução
   inteira some. E o fogo amigo — que era a queixa concreta, "uma
   bênção que vira maldição se o jogador não souber quando usar" —
   deixa de ser "pega a zona toda" e vira "pega quem está dentro do
   círculo", que é uma coisa que se julga de olho.

   O QUE ESTE ARQUIVO NÃO FAZ: virar a interface. O jogador continua
   escrevendo "avanço por trás das mesas e ataco o ogro"; quem acha o
   caminho, gasta o deslocamento e desenha o resultado é o sistema. O
   toque no quadrado existe como atalho de precisão, nunca como
   pedágio. Se a grade virasse o meio de entrada, cada turno passaria
   a exigir um clique antes da frase — que é exatamente o preço que o
   zonas.js previu e que continua caro.

   E A LÍNGUA CONTINUA A MESMA. Os nomes das zonas antigas — "junto ao
   balcão", "ao pé da escada" — sobrevivem como REGIÕES do mapa. O
   grid é a matemática; a região é o vocabulário. O Mestre nunca vê
   coordenada nenhuma: ele recebe "a uns seis metros, entre as mesas",
   porque narrar em números é a única coisa que ele faz pior do que
   narrar em zonas.

   REGRA DE OURO, herdada intacta: sem grade definida, tudo se comporta
   como antes. Toda função aceita grade nula e responde "alcança, pode,
   sem penalidade".
   ============================================================ */

import { deslocamentoDeCriatura } from "./movimento.js";

export const METROS_POR_QUADRADO = 1.5;
export const m2q = (metros) => Math.max(0, Math.round((Number(metros) || 0) / METROS_POR_QUADRADO));
export const q2m = (quadrados) => (Number(quadrados) || 0) * METROS_POR_QUADRADO;
/* Metro escrito para gente: vírgula decimal e sem casa inútil — 7,5 e 9,
   nunca "7.5" nem "9.0". Um quadrado é 1,5 m, então meia casa aparece o
   tempo todo e arredondar para inteiro faria o orçamento não fechar na
   conta do jogador ("gastei 2, restam 7,5" de um total de 9). */
export const metrosTxt = (n) => String(Math.round((Number(n) || 0) * 10) / 10).replace(".", ",");

/* ---------------- TAMANHO DAS CRIATURAS ----------------
   Um goblin e um dragão não ocupam o mesmo chão, e é isso que faz o
   corredor estreito ser uma decisão em vez de um cenário. `lado` é a
   aresta em quadrados; `alcance` é até onde o bicho bate sem sair do
   lugar — o ogro alcançar 3 m é o que dá sentido a "recuar um passo"
   contra um bicho grande e não contra um goblin. */
export const TAMANHOS = {
  miudo:   { id: "miudo",   nome: "Miúdo",   lado: 1, alcance: 1.5, icone: "·" },
  pequeno: { id: "pequeno", nome: "Pequeno", lado: 1, alcance: 1.5, icone: "▪" },
  medio:   { id: "medio",   nome: "Médio",   lado: 1, alcance: 1.5, icone: "■" },
  grande:  { id: "grande",  nome: "Grande",  lado: 2, alcance: 3,   icone: "◆" },
  enorme:  { id: "enorme",  nome: "Enorme",  lado: 3, alcance: 3,   icone: "★" },
  imenso:  { id: "imenso",  nome: "Imenso",  lado: 4, alcance: 4.5, icone: "☗" },
};

/* ============================================================
   O TAMANHO SAI DO NOME (v9.74 — a espécie manda, o adjetivo empurra)

   O bestiário desta casa nunca guardou tamanho, e pedir que ele guardasse
   agora deixaria todo save antigo com dragões do tamanho de goblins.
   Então o tamanho se descobre pelo nome — o que continua certo. O que
   estava errado era COMO.

   Havia cinco listas por tamanho, testadas do maior para o menor, e
   "gigante" morava na lista dos Enormes porque o bestiário tem uma
   criatura chamada Gigante. Só que "gigante" quase nunca é a espécie: é
   ADJETIVO. Resultado, visto numa emboscada de cripta: **Rato Gigante
   ocupava nove quadrados** e alcançava três metros parado. E não era só
   o rato — "aranha gigante" e "javali gigante" estavam escritos na lista
   dos Grandes e nunca eram alcançados, porque o "gigante" da lista de
   cima comia os dois. Duas linhas de tabela que existiam e não faziam
   nada, que é o defeito preferido deste projeto.

   A regra nova é a do português: **a primeira palavra é a espécie, o
   resto qualifica.** Rato é pequeno; "gigante" empurra um degrau para
   cima; Rato Gigante é médio, do tamanho de um cão grande, e ocupa um
   quadrado. Dragão é enorme; "ancião" empurra para imenso e "jovem"
   puxa para grande — que é a diferença que faltava entre as duas pontas
   da mesma espécie.
   ============================================================ */
const N = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* A escada, do menor ao maior. É ela que dá sentido a "empurrar um degrau". */
export const ESCADA = ["miudo", "pequeno", "medio", "grande", "enorme", "imenso"];

export function degrauDeTamanho(id, quanto = 0) {
  const i = ESCADA.indexOf(N(id));
  if (i < 0) return TAMANHOS.medio;
  return TAMANHOS[ESCADA[Math.max(0, Math.min(ESCADA.length - 1, i + quanto))]];
}

/* AS ESPÉCIES — substantivos, nunca adjetivos. Foi misturar os dois que
   produziu o rato de nove quadrados. */
export const ESPECIES = [
  { tamanho: "imenso",  rx: /(kraken|titan|leviata|colosso|behemoth|calamidade|worm das areias|tarrasca|deus |avatar de)/ },
  { tamanho: "enorme",  rx: /(dragao|hidra|mamute|serpente marinha|arauto|gigante|golem de ferro)/ },
  { tamanho: "grande",  rx: /(ogro|troll|urso|minotauro|golem|quimera|centauro|elemental|cavalo|grifo|basilisco|wyvern|jacare|crocodilo|alce|touro|boi)/ },
  { tamanho: "medio",   rx: /(lobo|javali|homem|mulher|orc|humano|elfo|anao|guerreir|bandido|soldado|cultista|zumbi|esqueleto|capanga|batedor|atirador|sentinela|comandante|horror|brutamontes)/ },
  { tamanho: "pequeno", rx: /(goblin|kobold|rato|morcego|fada|imp|halfling|gnomo|duende|serva?l|corvo|coruja|aranha|escorpiao|cobra|serpente|sapo|lagarto|caranguejo|macaco|raposa|gato|cao|cachorro)/ },
  { tamanho: "miudo",   rx: /(pixie|vaga-lume|enxame|sprite|besouro|formiga|vespa|abelha|verme|slime)/ },
];

/* OS QUALIFICADORES, e o quanto cada um empurra. */
export const QUALIFICADORES = [
  { id: "colossal", rx: /(colossal|monstruos|descomunal|titanic)/, quanto: 2 },
  { id: "aumentado", rx: /(gigante|anciao|ancestral|maior|primordial|atroz|imperial)/, quanto: 1 },
  { id: "diminuido", rx: /(jovem|menor|filhote|cria|an[aã]o|miniatura|raquitic)/, quanto: -1 },
];

export function tamanhoDe(ent) {
  if (!ent) return TAMANHOS.medio;
  /* o campo explícito manda em tudo: se alguém já decidiu, o nome não
     tem por que ser lido de novo */
  const dado = TAMANHOS[N(ent.tamanho)];
  if (dado) return dado;
  const txt = N(`${ent.nome || ""} ${ent.desc || ""}`);
  /* A ESPÉCIE É A QUE VEM PRIMEIRO NO TEXTO, e não a primeira da lista.
     Percorrer a lista em ordem de tamanho é o que fazia "rato gigante"
     casar com o `gigante` dos Enormes antes de chegar ao `rato` dos
     Pequenos — a lista estava ordenada por tamanho, e a frase está
     ordenada por gramática. */
  let esp = null, ondeEsp = Infinity, fimEsp = 0;
  for (const e of ESPECIES) {
    const m = txt.match(e.rx);
    if (!m || m.index >= ondeEsp) continue;
    esp = e; ondeEsp = m.index; fimEsp = m.index + m[0].length;
  }
  if (!esp) {
    /* último recurso: um lendário sem nome reconhecível ainda é coisa grande */
    return degrauDeTamanho(ent.ameaca === "lendario" ? "enorme" : ent.ameaca === "elite" ? "grande" : "medio", 0);
  }
  /* e o qualificador tem de vir DEPOIS da espécie, senão o Gigante do
     bestiário qualificaria a si mesmo e subiria para imenso sozinho */
  let q = null, ondeQ = Infinity;
  for (const x of QUALIFICADORES) {
    const m = txt.match(x.rx);
    if (!m || m.index < fimEsp || m.index >= ondeQ) continue;
    q = x; ondeQ = m.index;
  }
  return degrauDeTamanho(esp.tamanho, q ? q.quanto : 0);
}
export function ladoDe(ent) { return tamanhoDe(ent).lado; }
export function alcanceNatural(ent) { return tamanhoDe(ent).alcance; }

/* ---------------- AS PLANTAS ----------------
   O tamanho do tabuleiro vem do LUGAR, não de um número fixo. Uma briga
   de taverna não usa trinta metros de comprimento, e um tabuleiro fixo de
   24x30 seria, na maioria das lutas, um campo de quadrados vazios com os
   combatentes espremidos num canto — além de virar quadrados de 12 pixels
   num celular. Cada planta traz suas REGIÕES, que são os nomes que o
   Mestre vai usar, e as paredes, que são o que faz cobertura e linha de
   visão existirem de verdade. */
const R = (nome, x0, y0, x1, y1, extra = {}) => ({ nome, x0, y0, x1, y1, cobertura: !!extra.cobertura, dificil: !!extra.dificil });

export const PLANTAS = {
  taverna: {
    largura: 12, altura: 9,
    regioes: [
      R("junto ao balcão", 0, 0, 11, 2),
      R("entre as mesas", 0, 3, 11, 6, { cobertura: true }),
      R("ao pé da escada", 0, 7, 11, 8),
    ],
    /* o balcão é uma parede real: dá para se abrigar atrás dele */
    muros: [[2, 1, 8, 1]],
    estorvos: [[3, 4], [4, 4], [7, 4], [8, 4], [3, 5], [8, 5]],
  },
  masmorra: {
    largura: 7, altura: 18,
    regioes: [
      R("no corredor", 0, 0, 6, 6),
      R("no vão da porta", 0, 7, 6, 10, { cobertura: true }),
      R("no fundo da sala", 0, 11, 6, 17),
    ],
    /* corredor estreito: as paredes laterais estrangulam o meio, e é aí
       que o bicho grande descobre que não passa */
    muros: [[0, 7, 1, 10], [5, 7, 6, 10]],
    estorvos: [[3, 3], [3, 14]],
  },
  floresta: {
    largura: 16, altura: 16,
    regioes: [
      R("na clareira", 0, 0, 15, 5),
      R("entre os troncos", 0, 6, 15, 10, { cobertura: true }),
      R("no matagal fechado", 0, 11, 15, 15, { dificil: true }),
    ],
    muros: [],
    estorvos: [[3, 7], [6, 8], [10, 7], [13, 9], [4, 12], [11, 13]],
  },
  estrada: {
    largura: 18, altura: 12,
    regioes: [
      R("na estrada", 0, 3, 17, 8),
      R("na vala", 0, 0, 17, 2, { cobertura: true }),
      R("na encosta", 0, 9, 17, 11, { dificil: true }),
    ],
    muros: [],
    estorvos: [[5, 1], [12, 1]],
  },
  cidade: {
    largura: 14, altura: 14,
    regioes: [
      R("no meio da praça", 0, 0, 13, 6),
      R("sob a arcada", 0, 7, 13, 10, { cobertura: true }),
      R("no beco estreito", 0, 11, 13, 13),
    ],
    muros: [[0, 11, 3, 11], [10, 11, 13, 11]],
    estorvos: [[3, 8], [6, 8], [9, 8], [12, 8]],
  },
  caverna: {
    largura: 14, altura: 14,
    regioes: [
      R("na boca da caverna", 0, 0, 13, 4),
      R("atrás das estalagmites", 0, 5, 13, 9, { cobertura: true }),
      R("no poço escuro", 0, 10, 13, 13, { dificil: true }),
    ],
    muros: [[6, 6, 7, 7]],
    estorvos: [[2, 6], [4, 8], [10, 6], [12, 8]],
  },
  ruina: {
    largura: 16, altura: 14,
    regioes: [
      R("no pátio", 0, 0, 15, 5),
      R("atrás do muro caído", 0, 6, 15, 9, { cobertura: true }),
      R("na torre desabada", 0, 10, 15, 13, { dificil: true }),
    ],
    muros: [[2, 7, 6, 7], [9, 7, 13, 7]],
    estorvos: [[7, 11], [8, 11]],
  },
  navio: {
    largura: 10, altura: 16,
    regioes: [
      R("no convés", 0, 0, 9, 6),
      R("atrás do mastro", 0, 7, 9, 10, { cobertura: true }),
      R("no castelo de popa", 0, 11, 9, 15),
    ],
    muros: [[4, 8, 5, 9]],
    estorvos: [[1, 3], [8, 3], [1, 13], [8, 13]],
  },
  gelo: {
    largura: 16, altura: 16,
    regioes: [
      R("no campo aberto", 0, 0, 15, 5),
      R("atrás do bloco de gelo", 0, 6, 15, 10, { cobertura: true }),
      R("na neve funda", 0, 11, 15, 15, { dificil: true }),
    ],
    muros: [[4, 8, 6, 8], [10, 8, 12, 8]],
    estorvos: [],
  },
  deserto: {
    largura: 18, altura: 14,
    regioes: [
      R("na areia batida", 0, 0, 17, 5),
      R("atrás da duna", 0, 6, 17, 9, { cobertura: true }),
      R("na areia solta", 0, 10, 17, 13, { dificil: true }),
    ],
    muros: [],
    estorvos: [[5, 7], [12, 7]],
  },
};

/* O cenário vem do lugar da cena — a mesma regra do zonas.js, palavra por
   palavra, porque ela funciona: quem está numa masmorra luta numa masmorra
   mesmo que o bioma lá fora seja floresta. */
export function cenarioDe({ emMasmorra = false, local = "", bioma = "" } = {}) {
  if (emMasmorra) return "masmorra";
  const t = N(`${local} ${bioma}`);
  if (/taverna|estalagem|salao|tasca|bar\b/.test(t)) return "taverna";
  if (/navio|barco|conves|porto|galera/.test(t)) return "navio";
  if (/caverna|gruta|toca|mina/.test(t)) return "caverna";
  if (/ruina|templo|cripta|catacumba/.test(t)) return "ruina";
  if (/cidade|vila|praca|mercado|rua/.test(t)) return "cidade";
  if (/floresta|bosque|mata|selva/.test(t)) return "floresta";
  if (/gelo|neve|tundra|geleira/.test(t)) return "gelo";
  if (/deserto|areia|dunas/.test(t)) return "deserto";
  return "estrada";
}

const chave = (x, y) => `${x},${y}`;

export function montarGrade(ctx = {}) {
  const id = cenarioDe(ctx);
  const p = PLANTAS[id] || PLANTAS.estrada;
  const paredes = [];
  for (const [x0, y0, x1, y1] of p.muros || []) {
    for (let x = x0; x <= (x1 ?? x0); x++) for (let y = y0; y <= (y1 ?? y0); y++) paredes.push(chave(x, y));
  }
  /* estorvo é obstáculo baixo: não bloqueia passagem nem visão, dá cobertura
     a quem está colado nele. É a mesa virada, a estalagmite, o barril. */
  const estorvos = (p.estorvos || []).map(([x, y]) => chave(x, y));
  return { cenario: id, largura: p.largura, altura: p.altura, paredes, estorvos };
}

export function garantirGrade(g) {
  if (!g || !Number(g.largura) || !Number(g.altura)) return null;
  const p = PLANTAS[g.cenario] || PLANTAS.estrada;
  return {
    cenario: g.cenario || "estrada",
    largura: Math.max(1, Math.floor(g.largura)),
    altura: Math.max(1, Math.floor(g.altura)),
    paredes: new Set(Array.isArray(g.paredes) ? g.paredes : []),
    estorvos: new Set(Array.isArray(g.estorvos) ? g.estorvos : []),
    regioes: p.regioes || [],
  };
}

export function dentro(grade, x, y) {
  const g = garantirGrade(grade);
  if (!g) return true;
  return x >= 0 && y >= 0 && x < g.largura && y < g.altura;
}
export function ehParede(grade, x, y) {
  const g = garantirGrade(grade);
  return g ? g.paredes.has(chave(x, y)) : false;
}
export function ehEstorvo(grade, x, y) {
  const g = garantirGrade(grade);
  return g ? g.estorvos.has(chave(x, y)) : false;
}

/* ---------------- REGIÕES: A LÍNGUA ----------------
   Isto é o que vai para o Mestre. Ele nunca recebe "(7,12)" — recebe
   "no fundo da sala", que é como ele já narrava e como ele narra bem. */
export function regiaoDe(grade, x, y) {
  const g = garantirGrade(grade);
  if (!g) return null;
  for (const r of g.regioes) if (x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1) return r;
  return g.regioes[g.regioes.length - 1] || null;
}
export function nomeDoLugar(grade, x, y) {
  const r = regiaoDe(grade, x, y);
  return r ? r.nome : "";
}
export function terrenoDificil(grade, x, y) {
  const r = regiaoDe(grade, x, y);
  return !!(r && r.dificil);
}
/* Cobertura vem de DUAS fontes: a região que protege por natureza e o
   estorvo encostado. Encostar num barril vale tanto quanto estar na vala. */
export const BONUS_COBERTURA = 2;
export function temCobertura(grade, x, y) {
  const g = garantirGrade(grade);
  if (!g) return false;
  const r = regiaoDe(grade, x, y);
  if (r && r.cobertura) return true;
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    if (!dx && !dy) continue;
    if (g.estorvos.has(chave(x + dx, y + dy)) || g.paredes.has(chave(x + dx, y + dy))) return true;
  }
  return false;
}
export function bonusDefesaEm(grade, ent) {
  if (!garantirGrade(grade) || !ent || ent.x == null) return 0;
  return temCobertura(grade, ent.x, ent.y) ? BONUS_COBERTURA : 0;
}

/* ---------------- OCUPAÇÃO E DISTÂNCIA ----------------
   Uma criatura ocupa um quadrado do canto (x,y) até (x+lado-1, y+lado-1).
   A distância é a de mesa: Chebyshev entre os quadrados mais próximos das
   duas caixas, com a diagonal valendo o mesmo que a reta — a regra do 5e,
   e a única que não obriga ninguém a fazer Pitágoras de cabeça. */
export function quadradosDe(ent) {
  if (!ent || ent.x == null || ent.y == null) return [];
  const l = ladoDe(ent);
  const out = [];
  for (let dx = 0; dx < l; dx++) for (let dy = 0; dy < l; dy++) out.push({ x: ent.x + dx, y: ent.y + dy });
  return out;
}

export function distanciaQuadrados(a, b) {
  if (!a || !b || a.x == null || b.x == null) return 0;
  const la = ladoDe(a), lb = ladoDe(b);
  const ax0 = a.x, ax1 = a.x + la - 1, ay0 = a.y, ay1 = a.y + la - 1;
  const bx0 = b.x, bx1 = b.x + lb - 1, by0 = b.y, by1 = b.y + lb - 1;
  const dx = Math.max(0, Math.max(bx0 - ax1, ax0 - bx1));
  const dy = Math.max(0, Math.max(by0 - ay1, ay0 - by1));
  return Math.max(dx, dy);
}
export function distanciaM(a, b) { return q2m(distanciaQuadrados(a, b)); }

/* Centro geométrico, em quadrados fracionários — é dele que saem os
   círculos das áreas e as retas da linha de visão. */
export function centroDe(ent) {
  const l = ladoDe(ent);
  return { x: (ent.x || 0) + (l - 1) / 2, y: (ent.y || 0) + (l - 1) / 2 };
}

/* ---------------- LINHA DE VISÃO ----------------
   Bresenham entre os centros. Parede corta; estorvo não — o barril
   atrapalha o golpe (vira cobertura), não o olhar. */
export function linhaDeVisao(grade, a, b) {
  const g = garantirGrade(grade);
  if (!g) return true;
  const p = centroDe(a), q = centroDe(b);
  const passos = Math.max(1, Math.ceil(Math.max(Math.abs(q.x - p.x), Math.abs(q.y - p.y)) * 2));
  for (let i = 1; i < passos; i++) {
    const x = Math.round(p.x + ((q.x - p.x) * i) / passos);
    const y = Math.round(p.y + ((q.y - p.y) * i) / passos);
    if (g.paredes.has(chave(x, y))) return false;
  }
  return true;
}

/* ---------------- ALCANCE ----------------
   Corpo a corpo alcança até o alcance natural do bicho — e é aqui que o
   ogro de 3 m se distingue do goblin. Arma de longe alcança o que a ficha
   disser, pagando 2 por faixa de 9 m a partir da segunda: atirar longe é
   pior que atirar perto, e sem esse custo ninguém nunca se moveria. */
export const PENALIDADE_POR_FAIXA = 2;
export const METROS_POR_FAIXA = 9;

export function alcanca(grade, atacante, alvo, { alcanceM = null, distancia = false } = {}) {
  const g = garantirGrade(grade);
  if (!g) return { ok: true, penalidade: 0 };
  const d = distanciaM(atacante, alvo);
  const teto = alcanceM != null ? Number(alcanceM) : (distancia ? 999 : alcanceNatural(atacante));
  if (d > teto) {
    return { ok: false, penalidade: 0, metros: d, motivo: `está a ${Math.round(d)} m, em ${nomeDoLugar(grade, alvo.x, alvo.y)} — longe demais` };
  }
  if (!linhaDeVisao(grade, atacante, alvo)) {
    return { ok: false, penalidade: 0, metros: d, motivo: `há parede entre você e ${alvo.nome || "o alvo"}` };
  }
  const faixas = Math.max(0, Math.floor(d / METROS_POR_FAIXA));
  return { ok: true, penalidade: faixas * PENALIDADE_POR_FAIXA, metros: d, distancia: d };
}

/* ---------------- MOVER ----------------
   Busca em largura pelo caminho livre. O deslocamento é orçamento em
   METROS, não "uma zona": 9 m de padrão, o dobro com a Dádiva dos Passos
   Longos. Terreno difícil custa dobrado — e é isso, e não um rótulo, que
   faz o matagal ser matagal. */
export const DESLOCAMENTO_PADRAO = 9;

function livrePara(grade, x, y, lado, ocupados) {
  const g = garantirGrade(grade);
  for (let dx = 0; dx < lado; dx++) for (let dy = 0; dy < lado; dy++) {
    const cx = x + dx, cy = y + dy;
    if (!dentro(grade, cx, cy)) return false;
    if (g && g.paredes.has(chave(cx, cy))) return false;
    if (ocupados && ocupados.has(chave(cx, cy))) return false;
  }
  return true;
}

export function ocupacaoDe(entidades, exceto = null) {
  const s = new Set();
  for (const e of entidades || []) {
    if (!e || e === exceto || e.x == null) continue;
    if (e.derrotado || (e.vida != null && e.vida <= 0)) continue;
    for (const q of quadradosDe(e)) s.add(chave(q.x, q.y));
  }
  return s;
}

/* Devolve { ok, caminho, custoM } ou { ok:false, motivo }. O caminho é a
   lista de quadrados, para o desenho poder mostrar por onde se passou. */
/* v9.44: `ignoraDificil` chega até aqui. Quem voa, quem tem a Dádiva dos
   Passos Longos e quem nasceu Colono Orbital atravessa lama e escombro sem
   pagar o dobro — e até esta versão nenhum dos três pagava menos, porque a
   flag existia em movimento.js e morria antes de virar custo de quadrado. */
export function caminhar(grade, ent, destino, { ocupados = new Set(), deslocamentoM = DESLOCAMENTO_PADRAO, ignoraDificil = false } = {}) {
  const g = garantirGrade(grade);
  if (!g) return { ok: false, motivo: "esta luta não tem terreno definido" };
  const lado = ladoDe(ent);
  const dx = Math.floor(Number(destino.x)), dy = Math.floor(Number(destino.y));
  if (!dentro(grade, dx, dy)) return { ok: false, motivo: "esse lugar fica fora do campo" };
  if (dx === ent.x && dy === ent.y) return { ok: false, motivo: "você já está aí" };
  if (!livrePara(grade, dx, dy, lado, ocupados)) {
    return { ok: false, motivo: lado > 1 ? `você é ${tamanhoDe(ent).nome.toLowerCase()} demais para caber ali` : "esse lugar está ocupado" };
  }
  const tetoQ = Math.max(1, m2q(deslocamentoM));
  const inicio = chave(ent.x, ent.y);
  const custo = new Map([[inicio, 0]]);
  const veioDe = new Map();
  let fila = [{ x: ent.x, y: ent.y }];
  while (fila.length) {
    const prox = [];
    for (const at of fila) {
      const cAt = custo.get(chave(at.x, at.y));
      for (let ax = -1; ax <= 1; ax++) for (let ay = -1; ay <= 1; ay++) {
        if (!ax && !ay) continue;
        const nx = at.x + ax, ny = at.y + ay;
        const k = chave(nx, ny);
        if (custo.has(k)) continue;
        if (!livrePara(grade, nx, ny, lado, ocupados)) continue;
        const passo = (!ignoraDificil && terrenoDificil(grade, nx, ny)) ? 2 : 1;
        const c = cAt + passo;
        if (c > tetoQ) continue;
        custo.set(k, c);
        veioDe.set(k, at);
        prox.push({ x: nx, y: ny });
      }
    }
    fila = prox;
  }
  const alvoK = chave(dx, dy);
  if (!custo.has(alvoK)) {
    return { ok: false, motivo: `de onde você está, ${nomeDoLugar(grade, dx, dy)} fica longe demais para um deslocamento só` };
  }
  const caminho = [];
  let cur = { x: dx, y: dy };
  while (cur && !(cur.x === ent.x && cur.y === ent.y)) { caminho.unshift(cur); cur = veioDe.get(chave(cur.x, cur.y)); }
  return { ok: true, caminho, custoM: q2m(custo.get(alvoK)), destino: { x: dx, y: dy } };
}

/* Todos os quadrados que cabem num deslocamento — uma busca só, para a tela
   poder acender o alcance inteiro sem rodar `caminhar` setecentas vezes. */
export function alcancaveisDe(grade, ent, { ocupados = new Set(), deslocamentoM = DESLOCAMENTO_PADRAO, ignoraDificil = false } = {}) {
  const g = garantirGrade(grade);
  if (!g || !ent || ent.x == null) return new Set();
  const lado = ladoDe(ent);
  const tetoQ = Math.max(1, m2q(deslocamentoM));
  const custo = new Map([[chave(ent.x, ent.y), 0]]);
  let fila = [{ x: ent.x, y: ent.y }];
  while (fila.length) {
    const prox = [];
    for (const at of fila) {
      const cAt = custo.get(chave(at.x, at.y));
      for (let ax = -1; ax <= 1; ax++) for (let ay = -1; ay <= 1; ay++) {
        if (!ax && !ay) continue;
        const nx = at.x + ax, ny = at.y + ay, k = chave(nx, ny);
        if (custo.has(k)) continue;
        if (!livrePara(grade, nx, ny, lado, ocupados)) continue;
        const c = cAt + ((!ignoraDificil && terrenoDificil(grade, nx, ny)) ? 2 : 1);
        if (c > tetoQ) continue;
        custo.set(k, c);
        prox.push({ x: nx, y: ny });
      }
    }
    fila = prox;
  }
  custo.delete(chave(ent.x, ent.y));
  return new Set(custo.keys());
}

/* ---------------- POSICIONAR ----------------
   Herói e grupo de um lado, inimigos do outro — a distância inicial é o
   que dá sentido ao primeiro turno. Bicho ágil começa no meio pelo mesmo
   motivo de sempre: ele é rápido, e o sistema deve mostrar isso antes de
   o jogador descobrir apanhando. */
export function posicionar(grade, { heroi, grupo = [], inimigos = [] }) {
  const g = garantirGrade(grade);
  if (!g) return { heroi, grupo, inimigos };
  const ocupados = new Set();
  const poe = (ent, xIni, yIni) => {
    const lado = ladoDe(ent);
    for (let raio = 0; raio < Math.max(g.largura, g.altura); raio++) {
      for (let dy = -raio; dy <= raio; dy++) for (let dx = -raio; dx <= raio; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== raio) continue;
        const x = xIni + dx, y = yIni + dy;
        if (!livrePara(grade, x, y, lado, ocupados)) continue;
        for (const q of quadradosDe({ ...ent, x, y })) ocupados.add(chave(q.x, q.y));
        return { ...ent, x, y };
      }
    }
    return { ...ent, x: xIni, y: yIni };
  };
  const meioX = Math.floor(g.largura / 2);
  const h = poe(heroi || { nome: "você" }, meioX, g.altura - 1);
  const gr = (grupo || []).map((c, i) => poe(c, meioX + (i % 2 ? 1 : -1) * (1 + Math.floor(i / 2)), g.altura - 1));
  const in2 = (inimigos || []).map((e, i) => {
    const agil = !!e.agil;
    const y = agil ? Math.floor(g.altura / 2) : 0;
    return poe(e, meioX + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 2, y);
  });
  return { heroi: h, grupo: gr, inimigos: in2 };
}

/* v9.46: pôr UM recém-chegado no tabuleiro, ao lado de quem o trouxe.
   `posicionar` monta a mesa inteira do zero e só serve ao início da luta;
   a invocação nasce no meio dela, com todo mundo já colocado. Procura em
   anéis crescentes a partir do conjurador, exatamente como `poe` faz —
   perto o bastante para ser dele, longe o bastante para caber. */
export function posicionarPerto(grade, ent, perto, ocupadosLista = []) {
  const g = garantirGrade(grade);
  if (!g || !perto || perto.x == null) return { ...ent, x: (perto && perto.x) || 0, y: (perto && perto.y) || 0 };
  const ocupados = ocupacaoDe(ocupadosLista);
  const lado = ladoDe(ent);
  for (let raio = 1; raio < Math.max(g.largura, g.altura); raio++) {
    for (let dy = -raio; dy <= raio; dy++) for (let dx = -raio; dx <= raio; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== raio) continue;
      const x = perto.x + dx, y = perto.y + dy;
      if (!livrePara(grade, x, y, lado, ocupados)) continue;
      return { ...ent, x, y };
    }
  }
  return { ...ent, x: perto.x, y: perto.y };
}

/* Quem está colado em você — a lista que o ataque de oportunidade sempre
   precisou. "Colado" agora respeita o alcance do bicho: o ogro te segura
   de 3 m, e sair de perto dele custa igual. */
export function adjacentes(ent, lista) {
  return (lista || []).filter((e) => e && !e.derrotado && (e.vida || 0) > 0 && e.x != null
    && distanciaM(e, ent) <= alcanceNatural(e));
}

/* v9.44: grid.js passa a conhecer movimento.js — e só nesse sentido.
   movimento.js não importa nada de ninguém, então a seta aponta para um lado
   só e não há ciclo a temer. */
/* ---------------- A IA DE POSIÇÃO ----------------
   Quem não alcança, anda na direção de quem quer bater; quem alcança,
   fica e bate. Determinística, então o Mestre não escolhe nada. */
export function moverInimigos(grade, inimigos, alvo, todos) {
  const g = garantirGrade(grade);
  if (!g || !alvo || alvo.x == null) return { inimigos: inimigos || [], movimentos: [] };
  const movimentos = [];
  const vivos = (inimigos || []).filter((e) => e && !e.derrotado && (e.vida || 0) > 0);
  const novos = (inimigos || []).map((e) => {
    if (!vivos.includes(e) || e.x == null) return e;
    const dist = distanciaM(e, alvo);
    if (dist <= alcanceNatural(e)) return e;
    if (e.distancia && dist <= 18) return e;   // atirador mantém distância
    const ocupados = ocupacaoDe([...(todos || []), ...vivos], e);
    /* ---- CADA BICHO NO SEU PASSO (v9.44) ----
       `deslocamentoDeCriatura` existia em movimento.js desde a v9.34 com o
       comentário "um dragão voa; um zumbi arrasta", estava importada no App e
       não era chamada em lugar nenhum: aqui todo mundo andava os mesmos 9 m.
       O zumbi alcançava o herói tão rápido quanto o lobo, e o dragão não
       passava por cima de nada. Agora o passo sai da criatura, e quem voa
       atravessa o terreno difícil sem pagar o dobro. */
    const passoDele = deslocamentoDeCriatura(e);
    const metrosDele = passoDele.metros || DESLOCAMENTO_PADRAO;
    /* anda o quanto der na direção do alvo: procura o quadrado alcançável
       que mais aproxima. É guloso e basta — o campo é pequeno. */
    let melhor = null, melhorD = dist;
    const teto = m2q(metrosDele);
    for (let x = Math.max(0, e.x - teto); x <= Math.min(g.largura - 1, e.x + teto); x++) {
      for (let y = Math.max(0, e.y - teto); y <= Math.min(g.altura - 1, e.y + teto); y++) {
        if (x === e.x && y === e.y) continue;
        const d = distanciaM({ ...e, x, y }, alvo);
        if (d >= melhorD) continue;
        const r = caminhar(grade, e, { x, y }, { ocupados, deslocamentoM: metrosDele, ignoraDificil: !!passoDele.voando });
        if (!r.ok) continue;
        melhor = { x, y }; melhorD = d;
      }
    }
    if (!melhor) return e;
    movimentos.push({ nome: e.nome, de: nomeDoLugar(grade, e.x, e.y), para: nomeDoLugar(grade, melhor.x, melhor.y), metros: Math.round(dist - melhorD) });
    return { ...e, x: melhor.x, y: melhor.y };
  });
  return { inimigos: novos, movimentos };
}

/* ---------------- ÁREA COM FORMA DE VERDADE ----------------
   Aqui morava o remendo: `zonasCobertas(metros)` traduzia raio em "1, 2, 3
   ou todas as zonas", e por isso uma bola de fogo de 6 m e uma chuva de
   meteoros de 1,5 km davam quase no mesmo. Agora o raio é o raio.

   `geo` é o que o grimório já entrega: { forma, raio, alcance, focos }. */
export function quadradosDaArea(geo, { grade, origem, alvo }) {
  const g = garantirGrade(grade);
  const forma = (geo && geo.forma) || "alvo";
  if (!g) return [];
  if (forma === "campo") {
    const t = [];
    for (let x = 0; x < g.largura; x++) for (let y = 0; y < g.altura; y++) t.push({ x, y });
    return t;
  }
  if (forma === "alvo" || forma === "toque") return quadradosDe(alvo);
  if (forma === "pessoal") return quadradosDe(origem);

  const raioQ = Math.max(1, m2q(geo.raio || METROS_POR_QUADRADO));
  const c = centroDe(alvo || origem);
  const o = centroDe(origem);
  const out = new Map();
  const poe = (x, y) => { if (dentro(grade, x, y) && !g.paredes.has(chave(x, y))) out.set(chave(x, y), { x, y }); };

  if (forma === "aura") {
    const oc = centroDe(origem);
    for (let x = Math.floor(oc.x - raioQ); x <= Math.ceil(oc.x + raioQ); x++)
      for (let y = Math.floor(oc.y - raioQ); y <= Math.ceil(oc.y + raioQ); y++)
        if (Math.max(Math.abs(x - oc.x), Math.abs(y - oc.y)) <= raioQ) poe(x, y);
    return [...out.values()];
  }

  if (forma === "linha") {
    const dx = c.x - o.x, dy = c.y - o.y;
    const norma = Math.max(1e-6, Math.hypot(dx, dy));
    const ux = dx / norma, uy = dy / norma;
    for (let i = 1; i <= raioQ; i++) poe(Math.round(o.x + ux * i), Math.round(o.y + uy * i));
    return [...out.values()];
  }

  if (forma === "cone") {
    /* cone do 5e: comprimento igual à largura na boca — na prática, tudo
       que está dentro do raio e a até 45° da direção do alvo. */
    const dx = c.x - o.x, dy = c.y - o.y;
    const norma = Math.max(1e-6, Math.hypot(dx, dy));
    const ux = dx / norma, uy = dy / norma;
    for (let x = Math.floor(o.x - raioQ); x <= Math.ceil(o.x + raioQ); x++) {
      for (let y = Math.floor(o.y - raioQ); y <= Math.ceil(o.y + raioQ); y++) {
        const vx = x - o.x, vy = y - o.y;
        const d = Math.hypot(vx, vy);
        if (d < 0.5 || d > raioQ) continue;
        if ((vx * ux + vy * uy) / d < 0.7071) continue;   // cos 45°
        poe(x, y);
      }
    }
    return [...out.values()];
  }

  /* esfera, cubo, cilindro: centram no ALVO. Vários focos (a chuva de
     meteoros tem quatro pontos de queda) viram vários círculos: o
     primeiro no alvo e os outros afastados de um raio, em cruz. */
  const focos = Math.max(1, geo.focos || 1);
  const centros = [{ x: c.x, y: c.y }];
  const desvios = [[raioQ, 0], [-raioQ, 0], [0, raioQ], [0, -raioQ]];
  for (let i = 0; i < focos - 1 && i < desvios.length; i++) centros.push({ x: c.x + desvios[i][0], y: c.y + desvios[i][1] });
  const quadrado = forma === "cubo";
  for (const ct of centros) {
    for (let x = Math.floor(ct.x - raioQ); x <= Math.ceil(ct.x + raioQ); x++) {
      for (let y = Math.floor(ct.y - raioQ); y <= Math.ceil(ct.y + raioQ); y++) {
        const d = quadrado ? Math.max(Math.abs(x - ct.x), Math.abs(y - ct.y)) : Math.hypot(x - ct.x, y - ct.y);
        if (d <= raioQ + 0.001) poe(x, y);
      }
    }
  }
  return [...out.values()];
}

/* Quem está dentro. Basta UM quadrado da criatura na área — o dragão que
   põe a pata no fogo se queima. */
export function pegosPelaArea(quadrados, entidades) {
  const set = new Set((quadrados || []).map((q) => chave(q.x, q.y)));
  return (entidades || []).filter((e) => e && e.x != null && !e.derrotado && (e.vida || 0) > 0
    && quadradosDe(e).some((q) => set.has(chave(q.x, q.y))));
}

/* ---------------- OS TEXTOS ----------------
   Nada disto tem coordenada, e é de propósito: o Mestre narra lugar, não
   número. O grid é a matemática; a região é a língua. */
export function ondeEstaEmPalavras(grade, ent, refer) {
  const lugar = nomeDoLugar(grade, ent.x, ent.y);
  if (!refer) return lugar;
  const d = Math.round(distanciaM(ent, refer));
  if (d <= 1.5) return `${lugar}, ao alcance do braço`;
  if (d <= 6) return `${lugar}, a uns ${d} metros`;
  return `${lugar}, a uns ${d} metros de distância`;
}

export function mapaEmTexto(grade, { heroi, grupo = [], inimigos = [] } = {}) {
  const g = garantirGrade(grade);
  if (!g) return "";
  const porRegiao = new Map(g.regioes.map((r) => [r.nome, []]));
  const poe = (e, rot) => {
    if (!e || e.x == null) return;
    const nome = nomeDoLugar(grade, e.x, e.y);
    if (!porRegiao.has(nome)) porRegiao.set(nome, []);
    porRegiao.get(nome).push(rot);
  };
  poe(heroi, "você");
  for (const c of grupo) if ((c.vida || 0) > 0) poe(c, c.nome);
  for (const e of inimigos) if (!e.derrotado && (e.vida || 0) > 0) poe(e, `${e.nome}${ladoDe(e) > 1 ? ` (${tamanhoDe(e).nome.toLowerCase()})` : ""}`);
  return [...porRegiao.entries()].map(([nome, quem]) => `${nome}: ${quem.join(", ") || "—"}`).join(" | ");
}

export function resumoGridPrompt(grade, ocupantes = {}) {
  const g = garantirGrade(grade);
  if (!g) return "";
  const distancias = (ocupantes.inimigos || [])
    .filter((e) => e && !e.derrotado && (e.vida || 0) > 0 && e.x != null && ocupantes.heroi)
    .map((e) => `${e.nome} a ${Math.round(distanciaM(e, ocupantes.heroi))} m`)
    .join(", ");
  return `TERRENO DA LUTA (do sistema — obedeça): ${mapaEmTexto(grade, ocupantes)}.${distancias ? ` Distâncias até mim: ${distancias}.` : ""}
Estas posições são FATO. Você não move ninguém, não faz um inimigo "cruzar o salão" para alcançar quem está longe e não põe alguém a golpe de espada de quem está a dez metros. Quem se move, se move pelo sistema, e você recebe o movimento pronto para narrar. Use os NOMES dos lugares na prosa — "ele recua para o pé da escada" —, nunca coordenada, nunca a palavra quadrado e nunca a palavra grid.`;
}

export const GRID_PROMPT = `TERRENO E POSIÇÃO (v9.34):
- Toda luta acontece num terreno de lugares nomeados, e cada combatente está em UM deles. O envelope diz quem está onde e a que distância, em metros.
- Golpe de perto alcança quem está ao alcance do braço — e criatura grande alcança mais longe que gente. Arma e magia de longe alcançam o que a ficha disser, com penalidade crescente. Parede bloqueia; quem sai de perto de um inimigo leva um golpe livre.
- Você NUNCA move ninguém e NUNCA faz alguém alcançar quem está longe. Os movimentos chegam prontos no envelope; sua tarefa é narrá-los com os nomes dos lugares ("ele salta para trás do muro caído"), sem citar quadrado, coordenada, grade ou números de distância.`;

/* ---------------- O CÃO DE GUARDA ----------------
   Mesma régua do zonas.js, e ela precisa continuar GROSSA. O Mestre narra
   espaço com naturalidade — é o que ele faz de melhor e é por isso que ele
   erra aqui. Com metro em vez de zona, a tentação é morder por um quadrado
   de diferença; isso encheria o jogo de falsos positivos, e cada um custa
   uma chamada e uma cena. Só morde quando a distância é grande o bastante
   para a frase ser impossível, não imprecisa. */
export const METROS_PARA_MORDER = 6;

const CONTATO = /(te agarra|te alcanca|te acerta|te atinge|te derruba|crava|encosta a lamina|encosta a espada|fecha as maos|a um palmo|no seu pescoco|no seu rosto|colado em voce|ao seu lado|na sua cara|te pega pel)/;
const CONTATO_NEGADO = /\b(nao|sem|quase|ainda|antes que|impedid|longe demais|fora de alcance|nem chega)\b/;

export function detectarAlcanceImpossivel(narrativa, { grade, heroi, inimigos = [] } = {}) {
  const g = garantirGrade(grade);
  if (!g || !heroi || heroi.x == null) return [];
  const texto = N(narrativa);
  if (!texto.trim()) return [];
  const out = [];
  for (const e of inimigos || []) {
    if (!e || !e.nome || e.derrotado || (e.vida || 0) <= 0 || e.x == null) continue;
    const d = distanciaM(e, heroi);
    if (d <= METROS_PARA_MORDER) continue;
    const alvo = N(e.nome);
    let achou = false;
    let pos = texto.indexOf(alvo);
    while (pos >= 0 && !achou) {
      let ini = 0; for (let i = pos - 1; i >= 0; i--) if (/[.!?;:\n]/.test(texto[i])) { ini = i + 1; break; }
      let fim = texto.length; for (let i = pos; i < texto.length; i++) if (/[.!?;:\n]/.test(texto[i])) { fim = i; break; }
      const frase = texto.slice(ini, fim);
      if (CONTATO.test(frase) && !CONTATO_NEGADO.test(frase)) achou = true;
      else pos = texto.indexOf(alvo, pos + alvo.length);
    }
    if (achou) out.push({ nome: e.nome, onde: nomeDoLugar(grade, e.x, e.y), metros: Math.round(d) });
  }
  return out;
}

export function notaAlcanceImpossivel(achados, grade, heroi) {
  if (!achados.length) return "";
  const aqui = heroi && heroi.x != null ? nomeDoLugar(grade, heroi.x, heroi.y) : "onde estou";
  const l = achados.map((a) => `${a.nome} (que está em ${a.onde}, a uns ${a.metros} metros)`).join("; ");
  return `[CORREÇÃO DO SISTEMA — ALCANCE] Você pôs ${l} encostando em mim, mas eu estou em ${aqui} e essa criatura NÃO está aqui. Ninguém atravessa o terreno de graça: quem se move, se move pelo sistema, e o movimento chega pronto no envelope. Reescreva: ou ela ameaça e avança SEM me alcançar, ou quem me encostou é outro inimigo que de fato está comigo.`;
}
