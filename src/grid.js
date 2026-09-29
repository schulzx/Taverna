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
/* MM7: quem luta de longe, e a tabela do posto dele. atirador.js é folha
   (não importa nada), então esta seta também aponta para um lado só. */
import { mantemDistancia, POSTURA_DO_ATIRADOR } from "./atirador.js";

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

/* ============================================================
   O CUSTO DE CADA QUADRADO (E4) — a mesma busca, sem deitar fora a conta

   `alcancaveisDe` sempre teve o custo de cada casa na mão e devolvia só
   as CHAVES: a última linha era `new Set(custo.keys())`, e o número
   morria ali. A tela de E4 precisa dele para escrever o preço DENTRO da
   casa — a lei de E1, que o `jogo` mediu e confirmou: em seis das dez
   plantas o custo é DIFERENTE do que o olho conta (o herói abre dentro
   da lama), e ali o número escrito é o único canal que existe.

   ISTO NÃO MUDA REGRA NENHUMA. É a mesma busca, os mesmos oito vizinhos,
   o mesmo teto, a mesma remoção da casa de origem. `alcancaveisDe` passa
   a ser a leitura das chaves desta — uma verdade só, e não duas buscas
   que podem divergir no dia em que alguém mexer numa delas. */
export function custosDe(grade, ent, { ocupados = new Set(), deslocamentoM = DESLOCAMENTO_PADRAO, ignoraDificil = false } = {}) {
  const g = garantirGrade(grade);
  if (!g || !ent || ent.x == null) return new Map();
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
  /* a casa de origem sai: ela não é destino de passo nenhum, e um "0"
     escrito debaixo da própria ficha seria um preço para não andar */
  custo.delete(chave(ent.x, ent.y));
  /* em METROS, que é a língua que a tela fala — quem escreve `4,5` dentro
     da casa não pode ter de saber que por dentro o motor conta quadrados */
  const emMetros = new Map();
  for (const [k, q] of custo) emMetros.set(k, q2m(q));
  return emMetros;
}

/* Todos os quadrados que cabem num deslocamento — uma busca só, para a tela
   poder acender o alcance inteiro sem rodar `caminhar` setecentas vezes. */
export function alcancaveisDe(grade, ent, opcoes = {}) {
  return new Set(custosDe(grade, ent, opcoes).keys());
}

/* ============================================================
   O CAMINHO ATÉ O ALCANCE (Fase MM · as paredes) — andar por onde se passa

   O ACHADO, e é de MM7: `moverInimigos` escolhia, entre as casas do passo,
   a mais perto do alvo EM LINHA RETA, e só andava se alguma fosse mais
   perto do que onde já estava. É uma subida de encosta, e ela para no
   primeiro topo falso: com o balcão da taverna entre os dois, o bandido
   colado ao balcão a 3 m do herói não tem casa nenhuma mais perto do que
   3 m do lado dele — a volta começa por se AFASTAR —, e fica ali a rodada
   inteira, e a seguinte, até o teto. Medido (`sonda-das-paredes.mjs`):
   quem anda por esta função — os inimigos, e o grupo do jogador, que o App
   move por ela — empatava 30 de 30 lutas contra dois soldados na taverna,
   e 13 de 30 contra soldado e mago; o ogro ficava a um muro caído do herói
   no gelo, 30 de 30.

   A CONTA DE AGORA mede a distância que se ANDA, não a que se vê: um mapa
   de passos de cada casa até as casas de onde o alvo se alcança (o anel
   do alcance natural de quem anda), contornando só PAREDE — é a planta, e
   não quem por acaso está no caminho, que decide se há volta. O passo
   continua a ser o de sempre: as casas que o deslocamento cobre nesta
   rodada (`custosDe`, com a ocupação, o terreno difícil e o tamanho), e
   delas fica a de menos passos até o anel; no empate, a mais perto em
   linha reta; no empate disso, a primeira da varredura (x, depois y) —
   que é a ordem em que a busca antiga as via.

   A REGRESSÃO QUE ISTO NÃO FAZ. Sem parede, os passos até o anel são a
   distância de mesa menos o alcance (Chebyshev, a diagonal vale a reta),
   e ordenar por (passos, reta) é ordenar pela reta — o passo em campo
   aberto é casa a casa o mesmo de antes (a suíte `teste-paredes` guarda
   uma cópia da busca antiga e compara as duas em milhares de mesas sem
   parede).

   ALCANÇAR É O QUE `alcanca` DIZ: a distância E a linha de visão. O ogro
   de 3 m colado a um muro, com o herói do outro lado a 3 m,
   "já alcançava" pela conta antiga e ficava parado — e `turnoDosInimigos`,
   que pergunta a `alcanca`, não o deixava bater através da parede. Parado
   para sempre, a um muro de distância. Sem parede, a linha de visão é
   sempre verdadeira, e o campo aberto não muda.

   SEM CAMINHO NENHUM — o bicho grande que não cabe no vão, o anel todo
   atrás de parede — o mapa não chega a ele e a escolha cai na reta, como
   antes: não há volta a dar, e ficar parado não seria melhor.

   Devolve `{ x, y, custoM, passos }` da casa escolhida, ou `null` quando
   ficar é o melhor (já alcança, ou nenhuma casa melhora). Não move
   ninguém: quem chama decide o que fazer com a casa.
   ============================================================ */
/* O mapa: de cada casa onde `ent` cabe (só parede conta), quantos passos
   até a mais perto das casas-meta. `ehMeta(x, y)` diz quais são: o anel do
   alcance para quem luta de perto, as casas que veem o alvo para quem
   dispara (`postoDoAtirador`). */
function mapaDePassos(grade, ent, ehMeta) {
  const g = garantirGrade(grade);
  const lado = ladoDe(ent);
  const passos = new Map();
  let fila = [];
  for (let x = 0; x < g.largura; x++) for (let y = 0; y < g.altura; y++) {
    if (!livrePara(grade, x, y, lado, null)) continue;
    if (ehMeta(x, y)) { passos.set(chave(x, y), 0); fila.push({ x, y }); }
  }
  while (fila.length) {
    const prox = [];
    for (const a of fila) {
      const pa = passos.get(chave(a.x, a.y));
      for (let ax = -1; ax <= 1; ax++) for (let ay = -1; ay <= 1; ay++) {
        if (!ax && !ay) continue;
        const nx = a.x + ax, ny = a.y + ay, k = chave(nx, ny);
        if (passos.has(k) || !livrePara(grade, nx, ny, lado, null)) continue;
        passos.set(k, pa + 1);
        prox.push({ x: nx, y: ny });
      }
    }
    fila = prox;
  }
  return passos;
}

/* O DESEMPATE, e são dois porque são dois jeitos de escolher casa:
     · "reta"  (o de quem o MOTOR move — inimigos, grupo) — entre as casas
               de menos passos, a mais perto em linha reta, e depois a
               primeira da varredura. É a ordem da busca antiga, e é ela
               que deixa o campo aberto casa a casa igual.
     · "passo" (o do JOGADOR, que escolhe com o preço escrito na casa) —
               entre as casas de menos passos, a que custa menos a chegar,
               na ordem em que a busca do custo as acha; e só sai do lugar
               se ficar mais perto EM PASSOS. É o passo que a sonda de MM7
               dava ao herói, e as réguas medidas com ele continuam a
               medir o mesmo jogador. */
export function passoAteAlcancar(grade, ent, alvo, { ocupados = new Set(), deslocamentoM = DESLOCAMENTO_PADRAO, ignoraDificil = false, alcanceM = null, desempate = "reta" } = {}) {
  const g = garantirGrade(grade);
  if (!g || !ent || ent.x == null || !alvo || alvo.x == null) return null;
  const alc = alcanceM != null && Number.isFinite(Number(alcanceM)) ? Number(alcanceM) : alcanceNatural(ent);
  const dist = distanciaM(ent, alvo);
  const alcancaDali = (aqui) => distanciaM(aqui, alvo) <= alc && linhaDeVisao(grade, aqui, alvo);
  if (alcancaDali(ent)) return null;
  const passos = mapaDePassos(grade, ent, (x, y) => alcancaDali({ ...ent, x, y }));
  const pDe = (x, y) => { const p = passos.get(chave(x, y)); return p == null ? Infinity : p; };
  const custos = custosDe(grade, ent, { ocupados, deslocamentoM, ignoraDificil });
  let melhor = { x: ent.x, y: ent.y, p: pDe(ent.x, ent.y), d: dist, custoM: 0 };
  let mudou = false;
  if (desempate === "passo") {
    let achado = null;
    for (const [k, custoM] of custos) {
      const [x, y] = k.split(",").map(Number);
      const p = pDe(x, y);
      if (!Number.isFinite(p)) continue;
      if (!achado || p < achado.p || (p === achado.p && custoM < achado.custoM)) achado = { x, y, p, custoM };
    }
    if (!achado || achado.p >= melhor.p) return null;
    return { x: achado.x, y: achado.y, custoM: achado.custoM, passos: achado.p };
  }
  for (let x = 0; x < g.largura; x++) for (let y = 0; y < g.altura; y++) {
    const custoM = custos.get(chave(x, y));
    if (custoM == null) continue;
    const p = pDe(x, y), d = distanciaM({ ...ent, x, y }, alvo);
    if (p > melhor.p || (p === melhor.p && d >= melhor.d)) continue;
    melhor = { x, y, p, d, custoM };
    mudou = true;
  }
  if (!mudou) return null;
  return { x: melhor.x, y: melhor.y, custoM: melhor.custoM, passos: melhor.p };
}

/* ============================================================
   O ORÇAMENTO DO PASSO NA RODADA (v9.279) — o passo tem preço

   MEDIDO A JOGAR, e reproduzido em duas lutas e nos dois tamanhos:
   `F16 → F12 → F8 → F4 → E2` são vinte e um metros numa só rodada, com
   a marca do passo parada em "9 de 9 m" o tempo todo. O jogador
   atravessava o navio inteiro no primeiro turno.

   A CONTA NUNCA ESTEVE ERRADA — ela é que não existia. `caminhar`
   devolve `custoM` desde a v9.34 e quem fia é que tinha de guardar o
   que sobrava; guardava, mas só quando já havia onde guardar, e na
   primeira rodada não havia. Uma linha de fiação escrita como
   `sobrou ? guarda : deixa passar` transforma "ainda não gastei nada"
   em "nunca vou gastar", e a diferença entre as duas leituras é um
   turno inteiro de graça.

   ESTE É O SÍTIO porque quem cobra o chão é este arquivo: `caminhar`
   mede o custo, `METROS_POR_QUADRADO` diz qual é o menor passo que
   existe aqui, e uma segunda cópia desse número noutro módulo seria a
   mesma regra com dois donos — o defeito que esta casa já paga noutro
   sítio e não vai comprar de novo.

   NÚMEROS E NOMES SAEM DA TABELA. `campo` está nela porque o que resta
   mora dentro da economia da rodada de quem fia, e o nome do campo é
   contrato entre dois lados: escrito num só sítio, uma tela e um motor
   não podem discordar sobre onde o passo foi parar.

   E "NINGUÉM ANDOU AINDA" NÃO É ZERO. `restante == null` quer dizer que
   a rodada está inteira; um zero de enchimento diria que o passo
   acabou. É a mesma regra da chave que só nasce quando existe.
   ============================================================ */
export const PASSO_NA_RODADA = {
  /* onde o que RESTA andar mora, dentro da economia da rodada */
  campo: "movM",
  /* o menor passo que este tabuleiro sabe mostrar é uma casa: abaixo
     disto não há para onde ir, e a rodada acabou para as pernas */
  minimo: METROS_POR_QUADRADO,
  /* uma casa decimal, a mesma que `metrosTxt` escreve — senão a conta
     do jogador ("gastei 2, restam 7,5") não fecha com a que ele lê */
  casas: 1,
};

const aoDecimo = (n) => {
  const f = Math.pow(10, PASSO_NA_RODADA.casas);
  return Math.round((Number(n) || 0) * f) / f;
};

/* Quanto ainda dá para andar nesta rodada. `restante` é o que a
   economia guardou — `null`/`undefined` é "ninguém andou ainda", e aí
   vale o passo inteiro. Nunca devolve mais do que o total: um passo que
   encolheu no meio da rodada (exaustão, lentidão) não pode ser burlado
   por um saldo antigo maior. */
export function passoQueResta(restante, passoTotalM) {
  const total = Math.max(0, aoDecimo(passoTotalM));
  if (restante == null) return total;
  const guardado = Number(restante);
  if (!Number.isFinite(guardado)) return total;
  return Math.max(0, Math.min(total, aoDecimo(guardado)));
}

/* Ainda cabe um passo? A pergunta que a tela faz antes de acender o
   chão e que o motor faz antes de deixar andar — uma só, para as duas
   não poderem responder coisas diferentes. */
export function podeDarUmPasso(restante, passoTotalM) {
  return passoQueResta(restante, passoTotalM) >= PASSO_NA_RODADA.minimo;
}

/* O que sobra DEPOIS de andar `custoM`. Devolve sempre um número — é
   esta a peça que faltava: quem fia guarda o que vier daqui sem ter de
   decidir nada, e não há caminho em que o desconto se perca. */
export function passoAposAndar(restante, passoTotalM, custoM) {
  const resta = passoQueResta(restante, passoTotalM);
  const custo = Math.max(0, aoDecimo(custoM));
  return Math.max(0, aoDecimo(resta - custo));
}

/* ============================================================
   O DESLOCAMENTO FORÇADO (Fase Y · Y1) — andar sem ter escolhido

   O QUE FALTAVA AQUI NÃO ERA REGRA: ERA VERBO. `caminhar` é o passo de
   quem DECIDE andar — tem orçamento em metros, paga o dobro no matagal,
   e procura em largura o caminho que contorna a pedra. Empurrar não é
   nada disso: o empurrado não escolhe, não contorna e não gasta
   deslocamento nenhum. Ele vai NA DIREÇÃO em que foi empurrado e para
   no primeiro obstáculo. Reaproveitar `caminhar` teria dado a quem
   apanha o direito de dar a volta à parede — que é exatamente o
   contrário de ser empurrado.

   E MORA NESTE ARQUIVO, e não no módulo da disputa, porque quem é dono
   da posição é o grid. Um segundo motor de movimento noutro sítio seria
   a mesma regra escrita em dois lugares, que é como esta base já sabe
   que nasce bug — está escrito no cabeçalho de `golpe.js`, palavra por
   palavra, e vale igual aqui.

   NADA É MUTADO: devolve-se a casa nova e quem fia é que aplica.

   REGRA DE OURO, a deste arquivo: sem grade, `dentro` diz que sim e
   `ehParede` diz que não — logo o empurrão sem terreno só esbarra em
   quem estiver em `ocupados`. É o comportamento de antes, intacto.
   ============================================================ */
export const EMPURRAO_NO_TABULEIRO = {
  /* UMA casa, que são 1,5 m. O número é UM e não dois porque é o que a
     mesa do 5e faz num empurrão de ação — e porque uma casa é o passo
     que o tabuleiro desta casa consegue mostrar: `METROS_POR_QUADRADO`
     já diz que 1,5 m é a menor distância que existe aqui. Quem quiser um
     arremesso de três casas escreve OUTRA regra, com o nome dela. */
  casas: 1,

  /* O QUE PARA O EMPURRÃO, na ordem exata em que a classificação
     pergunta — e a ordem não é gosto: a borda vem primeiro porque fora
     do campo não há parede nem ocupante a que culpar; a parede vem antes
     do ocupante porque quem está encostado à pedra não se mexe mesmo que
     o vizinho saia do caminho. */
  bloqueios: ["borda", "parede", "ocupado"],

  /* O ESTORVO NÃO PARA, e isto é coerência, não esquecimento: o barril e
     a mesa nunca pararam ninguém neste arquivo — `livrePara` não olha
     `ehEstorvo`, e `caminhar` atravessa-os desde a v9.34. Eles valem
     COBERTURA (`temCobertura`), que é outra coisa. Fazê-los bloquear só
     no empurrão daria ao tabuleiro duas verdades sobre o mesmo barril. */
  estorvoPara: false,
};

/* A DIREÇÃO, aparada a -1|0|1 por eixo — Chebyshev, que é a distância
   que este arquivo já usa: a diagonal vale o mesmo que a reta, então o
   empurrão na diagonal anda uma casa como qualquer outro.

   E ELA SAI DAS CAIXAS, não dos cantos: é a MESMA separação por eixo que
   `distanciaQuadrados` faz cinquenta linhas acima — se as duas caixas se
   sobrepõem naquele eixo, o eixo é ZERO; senão, é o sinal do vão. Sem
   isto, um Grande (2x2) em (4,4) empurrado por quem está encostado ao
   lado direito, em (6,4), sairia na DIAGONAL: o canto dele é (4,4), o
   corpo vai até (5,5), e comparar cantos inventa um desnível que não
   existe. Para quem ocupa um quadrado só, caixa e canto são a mesma
   coisa e nada muda.

   Devolve `{x,y}` e não `{dx,dy}` porque é UM LUGAR RELATIVO, e todo
   lugar neste arquivo se escreve `{x,y}`: o vetor entra em
   `deslocarForcado` ao lado de posições, e duas grafias para a mesma
   ideia é como se importa um bug de tradução. */
export function direcaoDe(de, para) {
  const a = de == null ? null : de;
  const b = para == null ? null : para;
  if (!a || !b || a.x == null || a.y == null || b.x == null || b.y == null) return { x: 0, y: 0 };
  const ax = Number(a.x), ay = Number(a.y), bx = Number(b.x), by = Number(b.y);
  if (![ax, ay, bx, by].every((n) => Number.isFinite(n))) return { x: 0, y: 0 };
  const la = ladoDe(a), lb = ladoDe(b);
  const eixo = (a0, a1, b0, b1) => (b0 > a1 ? 1 : b1 < a0 ? -1 : 0);
  return {
    x: eixo(ax, ax + la - 1, bx, bx + lb - 1),
    y: eixo(ay, ay + la - 1, by, by + lb - 1),
  };
}

/* Anda CASA A CASA e para no primeiro bloqueio, dizendo qual foi. Andar
   uma de cada vez não é preciosismo: é a diferença entre "foi empurrado
   duas casas e bateu na parede na segunda" e "não se mexeu" — e é essa
   diferença que o jogador vê.

   `ocupados` tem de EXCLUIR quem está a ser empurrado. Quem monta o Set
   é `ocupacaoDe(entidades, alvo)`; sem isso, um bicho Grande (2x2) nunca
   sairia do sítio, porque o destino dele sobrepõe o próprio corpo.

   `= {}` NO DESTRUCTURING NÃO COBRE `null`, e por isso não há
   destructuring nenhum nesta assinatura: `ent` sem `x`/`y` acontece de
   verdade (um reforço que chega à luta sem posição) e não pode estourar
   o turno de ninguém. Nesse caso volta parado, com `bloqueio` nulo —
   porque não houve parede nenhuma a que culpar — e o porquê em `motivo`. */
export function deslocarForcado(grade, ent, direcao, casas, opcoes) {
  const o = opcoes == null ? {} : opcoes;
  const ocupados = o.ocupados == null ? null : o.ocupados;
  const e = ent == null ? null : ent;
  const temLugar = !!e && e.x != null && e.y != null;
  const parado = (motivo) => ({
    ok: false,
    x: temLugar ? e.x : null,
    y: temLugar ? e.y : null,
    casasAndadas: 0,
    bloqueio: null,
    motivo,
  });
  if (!temLugar) return parado("quem seria empurrado não está no tabuleiro");

  const d = direcao == null ? {} : direcao;
  /* aceita `{x,y}` (o que `direcaoDe` devolve) e também `{dx,dy}`, que é
     como quem fia costuma escrever um vetor à mão — a mesma tolerância
     que este arquivo já tem com `destino` em `caminhar` */
  const dx = Math.sign(Number(d.x != null ? d.x : d.dx) || 0);
  const dy = Math.sign(Number(d.y != null ? d.y : d.dy) || 0);
  if (!dx && !dy) return parado("não há direção: empurrar precisa de um de e um para");

  /* SEM `casas`, ANDA O DO EMPURRÃO. O empurrão é a razão de esta função
     existir, e o número dele mora na tabela, nunca na linha. */
  const pedidas = casas == null ? EMPURRAO_NO_TABULEIRO.casas : casas;
  const n = Math.max(0, Math.floor(Number(pedidas) || 0));
  if (!n) return parado("nenhuma casa a andar");

  const lado = ladoDe(e);
  /* QUAL DOS TRÊS FOI, na ORDEM QUE A TABELA DECLARA — e a ordem importa:
     fora do campo não há parede nem ocupante a que culpar, e quem está
     encostado à pedra não se mexe mesmo que o vizinho saia do caminho.

     `livrePara` continua a ser o ÚNICO predicado de casa válida: isto só
     corre DEPOIS de ele dizer não, e serve para dar nome ao não. Se os
     dois discordassem, quem manda é o `livrePara` — o `||` de baixo é o
     cinto disso. */
  const barra = {
    borda: (cx, cy) => !dentro(grade, cx, cy),
    parede: (cx, cy) => ehParede(grade, cx, cy),
    ocupado: (cx, cy) => !!ocupados && ocupados.has(chave(cx, cy)),
  };
  const quemBarrou = (x0, y0) => {
    for (const qual of EMPURRAO_NO_TABULEIRO.bloqueios) {
      const pergunta = barra[qual];
      if (!pergunta) continue;
      for (let ax = 0; ax < lado; ax++) for (let ay = 0; ay < lado; ay++) {
        if (pergunta(x0 + ax, y0 + ay)) return qual;
      }
    }
    return null;
  };

  let x = e.x, y = e.y, andadas = 0, bloqueio = null;
  for (let i = 0; i < n; i++) {
    const nx = x + dx, ny = y + dy;
    if (livrePara(grade, nx, ny, lado, ocupados)) { x = nx; y = ny; andadas++; continue; }
    bloqueio = quemBarrou(nx, ny) || EMPURRAO_NO_TABULEIRO.bloqueios[EMPURRAO_NO_TABULEIRO.bloqueios.length - 1];
    break;
  }
  /* `ok` é "saiu do lugar", não "andou tudo": quem é empurrado três casas
     e anda uma foi empurrado. Quanto andou está em `casasAndadas`, e o
     que o travou em `bloqueio` — quem fia lê os dois. */
  return { ok: andadas > 0, x, y, casasAndadas: andadas, bloqueio, motivo: "" };
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
    /* MM7: QUEM LUTA DE LONGE NÃO VEM. Até aqui só a invocação com
       `distancia` ficava parada (e só dentro dos 18 m, com ou sem linha de
       visão); o Atirador do bestiário vinha colar no herói como um ogro. O
       posto é decidido em `postoDoAtirador`, logo abaixo. */
    if (mantemDistancia(e)) {
      const posto = postoDoAtirador(grade, e, alvo, todos, vivos);
      if (!posto) return e;
      movimentos.push(posto.movimento);
      return { ...e, x: posto.x, y: posto.y };
    }
    /* quem alcança fica e bate — e alcançar pede linha de visão, que é o
       que `alcanca` cobra na hora do golpe (as paredes, MM) */
    if (dist <= alcanceNatural(e) && linhaDeVisao(grade, e, alvo)) return e;
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
    /* anda o quanto der na direção do alvo, PELO CAMINHO (as paredes, MM):
       a casa do passo que deixa menos chão a andar até o alcance. Até aqui
       era a mais perto em linha reta, e o balcão da taverna prendia quem
       estava do lado errado dele — `passoAteAlcancar` conta o porquê. */
    const melhor = passoAteAlcancar(grade, e, alvo, { ocupados, deslocamentoM: metrosDele, ignoraDificil: !!passoDele.voando });
    if (!melhor) return e;
    /* os metros da linha de passo: o quanto encurtou, como sempre; na volta
       à parede, que encurta pouco ou nada em linha reta, o chão que gastou
       (`custoM`, o mesmo número que a tela escreve na casa) — "avança 0 m"
       de quem deu a volta ao balcão seria mentira. */
    const encurtou = Math.round(dist - distanciaM({ ...e, x: melhor.x, y: melhor.y }, alvo));
    movimentos.push({ nome: e.nome, de: nomeDoLugar(grade, e.x, e.y), para: nomeDoLugar(grade, melhor.x, melhor.y), metros: encurtou > 0 ? encurtou : Math.round(melhor.custoM) });
    return { ...e, x: melhor.x, y: melhor.y };
  });
  return { inimigos: novos, movimentos };
}

/* ============================================================
   O POSTO DO ATIRADOR (Fase MM · MM7) — onde fica quem dispara

   A regra de mesa, do 5e e de quem já viu um arqueiro bem jogado:
     · JÁ ESTÁ BEM — vê o herói, está dentro da faixa em que o tiro não
       paga penalidade (`faixasSemCusto` faixas de `METROS_POR_FAIXA`: a
       mesma conta de `alcanca`, logo o mesmo preço que o arco do herói
       paga) e ninguém do outro lado está colado nele: NÃO SE MEXE. Fica e
       dispara.
     · NÃO ESTÁ — procura, no passo dele (o mesmo `custosDe` da tela, o
       mesmo `deslocamentoDeCriatura` do resto), a casa de onde dispara
       melhor. Três degraus, e o de cima manda em tudo: vê e está na faixa
       sem custo; vê e está ao alcance (36 m); não vê — aí aproxima-se, para
       ver na rodada seguinte. Dentro do degrau, soma-se a COBERTURA (a
       mesma `temCobertura` que dá +2 de defesa), tira-se o desvio da
       distância ideal (a última casa da faixa sem custo: o mais longe que
       se pode estar sem pagar) e tira-se o que andou: entre dois postos
       iguais, fica o mais perto de onde já estava.
     · NUNCA ACABA COLADO. Casa a um quadrado de alguém do outro lado não é
       posto: disparar dali é com desvantagem (5e), e é isso que o faz sair.
     · COLADO E SEM SAÍDA — nenhuma casa livre que o descole —, fica: é o
       encurralado, e `turnoDosInimigos` dispara com desvantagem.

   QUEM ESTÁ DO OUTRO LADO é o alvo e `todos` (o App passa o herói e o
   grupo), menos os da própria lista e quem já caiu.

   O RECUO PROVOCA. Quem começa dentro do alcance do herói e acaba fora
   dele saiu de perto de quem tinha a guarda erguida — é o golpe de
   oportunidade que o App já rola em quem foge. O movimento traz
   `provoca: true` para a fiação saber em quem; e `recua: true` quando
   acabou mais longe do que estava, para a linha de passo não dizer
   "avança" de quem deu as costas.

   DETERMINÍSTICO: nenhum dado. A mesma planta e as mesmas casas dão o
   mesmo posto, e o empate fica com a casa que a busca achou primeiro.
   ============================================================ */
function postoDoAtirador(grade, e, alvo, todos, vivos) {
  const P = POSTURA_DO_ATIRADOR;
  const W = P.pesos;
  const meus = vivos || [];
  const vistos = new Set();
  const hostis = [alvo, ...(todos || [])].filter((h) => {
    if (!h || h === e || h.x == null || vistos.has(h)) return false;
    vistos.add(h);
    if (meus.includes(h) || h.derrotado || (h.vida != null && h.vida <= 0)) return false;
    return true;
  });
  const colado = (pos) => hostis.some((h) => distanciaM(pos, h) <= METROS_POR_QUADRADO);
  const semCusto = (d) => Math.floor(d / METROS_POR_FAIXA) < P.faixasSemCusto;
  const idealM = P.faixasSemCusto * METROS_POR_FAIXA - METROS_POR_QUADRADO;
  const dist = distanciaM(e, alvo);
  if (!colado(e) && semCusto(dist) && linhaDeVisao(grade, e, alvo)) return null;
  if (colado(e) && !P.coladoRecua) return null;
  const passoDele = deslocamentoDeCriatura(e);
  const metrosDele = passoDele.metros || DESLOCAMENTO_PADRAO;
  const ocupados = ocupacaoDe([...(todos || []), ...meus], e);
  const custos = custosDe(grade, e, { ocupados, deslocamentoM: metrosDele, ignoraDificil: !!passoDele.voando });
  /* QUEM NÃO VÊ, VAI VER PELO CAMINHO (as paredes, MM). O degrau de baixo
     aproximava-se em linha reta, a mesma subida de encosta de
     `moverInimigos`: atrás do balcão, a casa mais perto do herói é a colada
     ao balcão, e dali não se vê nada. Agora conta os passos até a casa mais
     perto de onde se VÊ o herói dentro do alcance; sem casa dessas ao alcance
     de pernas nenhumas, cai na reta de antes. Sem parede, toda casa a menos
     de 36 m vê — e nenhuma planta tem 36 m —, então este degrau só existe
     onde há parede, e o campo aberto não muda. */
  const veDali = mapaDePassos(grade, e, (x, y) => {
    const aqui = { ...e, x, y };
    return distanciaM(aqui, alvo) <= P.alcanceM && linhaDeVisao(grade, aqui, alvo);
  });
  const faltaVer = (x, y, d) => { const p = veDali.get(chave(x, y)); return p == null ? d : p * METROS_POR_QUADRADO; };
  const nota = (x, y, custoM) => {
    const aqui = { ...e, x, y };
    if (colado(aqui)) return null;
    const d = distanciaM(aqui, alvo);
    const ve = d <= P.alcanceM && linhaDeVisao(grade, aqui, alvo);
    if (!ve) return -faltaVer(x, y, d) - custoM * W.passo;
    const degrau = semCusto(d) ? 2 : 1;
    return degrau * W.faixa + (temCobertura(grade, x, y) ? W.cobertura : 0)
      - Math.abs(d - idealM) * W.ideal - custoM * W.passo;
  };
  let melhor = null;
  const ficar = nota(e.x, e.y, 0);
  if (ficar != null) melhor = { x: e.x, y: e.y, n: ficar, custoM: 0 };
  for (const [k, custoM] of custos) {
    const [x, y] = k.split(",").map(Number);
    const n = nota(x, y, custoM);
    if (n == null) continue;
    if (!melhor || n > melhor.n) melhor = { x, y, n, custoM };
  }
  if (!melhor || (melhor.x === e.x && melhor.y === e.y)) return null;
  const nd = distanciaM({ ...e, x: melhor.x, y: melhor.y }, alvo);
  const alcanceDoAlvo = alcanceNatural(alvo);
  const movimento = {
    nome: e.nome, de: nomeDoLugar(grade, e.x, e.y), para: nomeDoLugar(grade, melhor.x, melhor.y),
    metros: Math.round(melhor.custoM),
  };
  if (nd > dist) movimento.recua = true;
  if (dist <= alcanceDoAlvo && nd > alcanceDoAlvo) movimento.provoca = true;
  return { x: melhor.x, y: melhor.y, movimento };
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

/* O TABULEIRO QUE O NARRADOR VÊ (Fase MM, MM2). A sonda da mesa (MM1)
   mediu que a distância e o lugar já chegavam, e que o motor calculava
   mais duas coisas e as calava: a COBERTURA (`temCobertura`, que só virava
   bônus de defesa) e a LINHA DE VISÃO (`linhaDeVisao`, que só virava aviso
   de tela no ataque). À mesa, "aquilo do meu lado conta como cobertura?" é
   pergunta de todo combate, e o Narrador respondia de imaginação o que o
   sistema já tinha decidido.

   Entram NA MESMA LINHA das distâncias, sem bloco novo nem frase de
   instrução — o teto de prompt é sagrado. E só entra a EXCEÇÃO: campo
   aberto com visão livre é o normal e não custa um caractere, de modo que
   a luta sem parede nem estorvo manda exatamente a linha de antes.
   Os rótulos são tabela porque são a voz do sistema ao Narrador — quem
   quiser trocar a palavra troca aqui, e a suíte lê de volta. */
export const ROTULOS_DO_TABULEIRO = {
  coberturaDele: "atrás de cobertura",
  semVisao: "sem linha de visão, parede no meio",
  juntaRotulos: "; ",
  coberturaMinha: "Eu estou atrás de cobertura.",
  ordemDaRodada: "Ordem da rodada:",
  /* MM6: QUEM ME VÊ, quando estou escondido — "Estou escondido: Orc e
     Goblin não me veem; Ogro me vê." A conta é de `escondido.js`
     (`quemMeVe`); aqui só a voz. */
  escondido: "Estou escondido:",
  naoMeVe: ["não me vê", "não me veem"],
  meVe: ["me vê", "me veem"],
  ninguemPerto: "ninguém à volta me vê",
};

/* "A", "A e B", "A, B e C". Não é importada de escondido.js de propósito:
   escondido.js lê este arquivo, e ler de volta fecharia um ciclo. */
const juntarNaLinha = (nomes) => (nomes.length <= 1 ? nomes.join("") : `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`);

/* A frase do escondido na linha da luta, ou "" — `q` é o que
   `quemMeVe` devolve (null quando não estou escondido). */
function linhaDoEscondido(q) {
  if (!q || typeof q !== "object") return "";
  const R = ROTULOS_DO_TABULEIRO;
  const naoVeem = (Array.isArray(q.naoVeem) ? q.naoVeem : []).map(String).filter(Boolean);
  const veem = (Array.isArray(q.veem) ? q.veem : []).map((v) => String((v && v.nome) || v || "")).filter(Boolean);
  const partes = [];
  if (naoVeem.length) partes.push(`${juntarNaLinha(naoVeem)} ${R.naoMeVe[naoVeem.length > 1 ? 1 : 0]}`);
  if (veem.length) partes.push(`${juntarNaLinha(veem)} ${R.meVe[veem.length > 1 ? 1 : 0]}`);
  return ` ${R.escondido} ${partes.length ? partes.join("; ") : R.ninguemPerto}.`;
}

/* A ORDEM DA RODADA (MM2, caso #142 da sonda). A iniciativa é rolada UMA
   vez, ao abrir a luta, e fica em `combate.ordem` — lista de
   `{ nome, lado: "heroi"|"aliado"|"inimigo", iniciativa, ... }` já ordenada
   por `rolarIniciativa`. O Narrador só a lia na nota da abertura; a partir
   da terceira rodada ela já tinha rolado para longe, e "a ordem é a mesma?"
   virava palpite. Aqui ela volta a cada turno, só com quem ainda age: o
   herói sempre (caído ainda rola contra a morte na vez dele); aliado e
   inimigo enquanto houver um vivo com aquele nome no tabuleiro — contado,
   para dois "Goblin" com um já caído deixarem um só na fila. Lixo em
   `ordem` (não-lista, entrada sem nome) some sem derrubar a linha. */
function ordemDosVivos(ordem, oc) {
  if (!Array.isArray(ordem) || !ordem.length) return [];
  /* inimigo sem vida contada não está vivo — a mesma régua das distâncias;
     aliado sem o campo conta como de pé (a ficha do grupo nem sempre o traz) */
  const vivos = (lista, estrito) => {
    const m = new Map();
    for (const e of Array.isArray(lista) ? lista : []) {
      if (!e || !e.nome || e.derrotado) continue;
      if (estrito ? !((e.vida || 0) > 0) : (e.vida != null && (e.vida || 0) <= 0)) continue;
      m.set(e.nome, (m.get(e.nome) || 0) + 1);
    }
    return m;
  };
  const inimigos = vivos(oc.inimigos, true);
  const aliados = vivos(oc.grupo, false);
  const heroiNome = oc.heroi && oc.heroi.nome;
  const out = [];
  let algumInimigo = false;
  for (const c of ordem) {
    if (!c || typeof c.nome !== "string" || !c.nome) continue;
    if (c.lado === "heroi" || (!c.lado && c.nome === heroiNome)) { out.push(c.nome); continue; }
    const lado = c.lado === "aliado" ? [aliados] : c.lado === "inimigo" ? [inimigos] : [inimigos, aliados];
    const onde = lado.find((m) => (m.get(c.nome) || 0) > 0);
    if (!onde) continue;
    onde.set(c.nome, onde.get(c.nome) - 1);
    if (onde === inimigos) algumInimigo = true;
    out.push(c.nome);
  }
  /* sem inimigo de pé a luta acabou: não há rodada a ordenar */
  return algumInimigo ? out : [];
}

export function resumoGridPrompt(grade, ocupantes = {}) {
  const g = garantirGrade(grade);
  if (!g) return "";
  const oc = ocupantes || {};
  const heroi = oc.heroi;
  /* cobertura e visão só se medem com o herói posto no tabuleiro; sem x,
     centroDe o poria no canto (0,0) e a linha mentiria */
  const heroiPosto = !!(heroi && heroi.x != null && heroi.y != null);
  const R = ROTULOS_DO_TABULEIRO;
  const distancias = (oc.inimigos || [])
    .filter((e) => e && !e.derrotado && (e.vida || 0) > 0 && e.x != null && heroi)
    .map((e) => {
      const base = `${e.nome} a ${Math.round(distanciaM(e, heroi))} m`;
      if (!heroiPosto) return base;
      const rot = [];
      /* a mesma pergunta que bonusDefesaEm faz — o que o Narrador lê é o
         que o dado já aplicou */
      if (temCobertura(grade, e.x, e.y)) rot.push(R.coberturaDele);
      /* do herói ao inimigo: é a direção do golpe dele (alcanca) */
      if (!linhaDeVisao(grade, heroi, e)) rot.push(R.semVisao);
      return rot.length ? `${base} (${rot.join(R.juntaRotulos)})` : base;
    })
    .join(", ");
  const minha = distancias && heroiPosto && temCobertura(grade, heroi.x, heroi.y) ? ` ${R.coberturaMinha}` : "";
  const fila = ordemDosVivos(oc.ordem, oc);
  const ordemTxt = fila.length ? ` ${R.ordemDaRodada} ${fila.join(", ")}.` : "";
  /* MM6: só quando estou escondido — sem `quemMeVe`, é a string vazia e a
     linha sai letra por letra a de antes */
  const escTxt = linhaDoEscondido(oc.quemMeVe);
  return `TERRENO DA LUTA (do sistema — obedeça): ${mapaEmTexto(grade, oc)}.${distancias ? ` Distâncias até mim: ${distancias}.${minha}` : ""}${escTxt}${ordemTxt}
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
