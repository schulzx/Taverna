/* ============================================================
   LOOT PROCEDURAL E FORJA — Taverna
   Itens gerados por TABELA, no app: base + prefixo + sufixo,
   atributos escalados por raridade e nível. A IA não cria mais
   equipamento de vitória — o código gera e ela só descreve.
   Também resolve a forja: desmontar → essência → forjar.
   ============================================================ */

const d = (n) => Math.floor(Math.random() * n);
const sortear = (arr) => arr[d(arr.length)];

export const RARIDADES = ["comum", "incomum", "raro", "epico", "lendario"];
export const RARIDADE_ROTULO = { comum: "Comum", incomum: "Incomum", raro: "Raro", epico: "Épico", lendario: "Lendário" };

/* ---------------- BASES POR SLOT (o coração do item) ----------------
   armas: bonus = dano · defesas: bonus = defesa · acessórios: sem bônus
   fixo (ganham atributo de personagem conforme a raridade) */
export const BASES = {
  arma: [
    { nome: "Espada Longa", dano: 2 }, { nome: "Espada Curta", dano: 1 }, { nome: "Montante", dano: 3 },
    { nome: "Machado de Guerra", dano: 2 }, { nome: "Machadinha", dano: 1 }, { nome: "Machado Duplo", dano: 3 },
    { nome: "Maça Pesada", dano: 2 }, { nome: "Martelo de Batalha", dano: 2 }, { nome: "Mangual", dano: 2 },
    { nome: "Adaga", dano: 1 }, { nome: "Stiletto", dano: 1 }, { nome: "Lâmina Curva", dano: 2 },
    { nome: "Rapieira", dano: 2 }, { nome: "Cimitarra", dano: 2 }, { nome: "Katana", dano: 2 },
    { nome: "Lança", dano: 2 }, { nome: "Pique", dano: 2 }, { nome: "Alabarda", dano: 3 },
    { nome: "Arco Curto", dano: 1 }, { nome: "Arco Longo", dano: 2 }, { nome: "Besta Leve", dano: 2 },
    { nome: "Besta Pesada", dano: 3 }, { nome: "Cajado de Carvalho", dano: 1 }, { nome: "Varinha Rúnica", dano: 1 },
    { nome: "Orbe de Batalha", dano: 2 }, { nome: "Foice de Guerra", dano: 2 }, { nome: "Tridente", dano: 2 },
    { nome: "Chicote de Aço", dano: 1 }, { nome: "Soqueira Cravada", dano: 1 }, { nome: "Clava de Ossos", dano: 1 },
  ],
  escudo: [
    { nome: "Escudo de Madeira", defesa: 1 }, { nome: "Broquel", defesa: 1 }, { nome: "Escudo Redondo", defesa: 1 },
    { nome: "Escudo Torre", defesa: 2 }, { nome: "Escudo Pavês", defesa: 2 }, { nome: "Escudo Estrelado", defesa: 1 },
    { nome: "Escudo de Placas", defesa: 2 }, { nome: "Aegis de Bronze", defesa: 1 }, { nome: "Escudo Espinhado", defesa: 1 },
    { nome: "Escudo Cerimonial", defesa: 1 },
  ],
  armadura: [
    { nome: "Gibão de Couro", defesa: 1 }, { nome: "Couro Batido", defesa: 1 }, { nome: "Brigantina", defesa: 1 },
    { nome: "Cota de Malha", defesa: 2 }, { nome: "Cota de Escamas", defesa: 2 }, { nome: "Peitoral de Aço", defesa: 2 },
    { nome: "Armadura de Placas", defesa: 3 }, { nome: "Loriga Segmenteira", defesa: 2 }, { nome: "Manto Encantado", defesa: 1 },
    { nome: "Veste de Batalha", defesa: 1 }, { nome: "Couraça Antiga", defesa: 2 }, { nome: "Carapaça de Quitina", defesa: 2 },
    { nome: "Armadura de Couro de Dragão", defesa: 3 }, { nome: "Hábito Rúnico", defesa: 1 },
  ],
  elmo: [
    { nome: "Capuz de Couro", defesa: 1 }, { nome: "Elmo de Ferro", defesa: 1 }, { nome: "Bacinete", defesa: 1 },
    { nome: "Barbuta", defesa: 1 }, { nome: "Elmo Chifrudo", defesa: 1 }, { nome: "Coroa de Guerra", defesa: 1 },
    { nome: "Tiara Arcana", defesa: 1 }, { nome: "Capacete de Placas", defesa: 1 }, { nome: "Máscara Ritual", defesa: 1 },
    { nome: "Coifa de Malha", defesa: 1 },
  ],
  botas: [
    { nome: "Botas de Couro", defesa: 1 }, { nome: "Grevas de Ferro", defesa: 1 }, { nome: "Botas do Viajante", defesa: 1 },
    { nome: "Sandálias de Couro", defesa: 1 }, { nome: "Botas Aladas", defesa: 1 }, { nome: "Grevas de Placas", defesa: 1 },
    { nome: "Botas Silenciosas", defesa: 1 }, { nome: "Pés de Aço", defesa: 1 }, { nome: "Botas de Pelagem", defesa: 1 },
    { nome: "Sapatos do Saltimbanco", defesa: 1 },
  ],
  anel: [
    { nome: "Anel de Prata" }, { nome: "Anel de Ouro" }, { nome: "Anel de Ossos" }, { nome: "Anel de Sinete" },
    { nome: "Anel Serpente" }, { nome: "Anel de Rubi" }, { nome: "Anel de Safira" }, { nome: "Anel de Jade" },
    { nome: "Anel Farpado" }, { nome: "Anel Gêmeo" }, { nome: "Anel de Obsidiana" }, { nome: "Anel Entrelacado" },
  ],
  amuleto: [
    { nome: "Amuleto de Madeira" }, { nome: "Talismã de Pena" }, { nome: "Pingente de Âmbar" }, { nome: "Relicário Pequeno" },
    { nome: "Colar de Presas" }, { nome: "Medalhão Antigo" }, { nome: "Escapulário" }, { nome: "Pérola Negra" },
    { nome: "Olho de Vidro" }, { nome: "Corda de Nós" }, { nome: "Dente de Serpente" }, { nome: "Estrela de Prata" },
  ],
};

/* ---------------- AFIXOS (nome e alma do item) ---------------- */
/* [masculino, feminino] — a concordância sai certa por tabela */
export const PREFIXOS = [
  ["Afiadíssimo", "Afiadíssima"], ["Pesado", "Pesada"], ["Leve", "Leve"], ["Antigo", "Antiga"],
  ["Rústico", "Rústica"], ["Elegante", "Elegante"], ["Sombrio", "Sombria"], ["Radiante", "Radiante"],
  ["Gélido", "Gélida"], ["Flamejante", "Flamejante"], ["Abençoado", "Abençoada"], ["Amaldiçoado", "Amaldiçoada"],
  ["Rúnico", "Rúnica"], ["Élfico", "Élfica"], ["Anão", "Anã"], ["Orc", "Orc"],
  ["Dracônico", "Dracônica"], ["Celestial", "Celestial"], ["Abissal", "Abissal"], ["Tempestuoso", "Tempestuosa"],
  ["Silencioso", "Silenciosa"], ["Feroz", "Feroz"], ["Real", "Real"], ["Perdido", "Perdida"],
  ["Lendário", "Lendária"], ["Sangrento", "Sangrenta"], ["Dourado", "Dourada"], ["Prateado", "Prateada"],
  ["Sagrado", "Sagrada"], ["Profano", "Profana"],
];

/* sufixo com "de/do/da" — cola no final do nome */
export const SUFIXOS = [
  "do Amanhecer", "do Crepúsculo", "da Meia-Noite", "das Nove Vidas", "do Andarilho",
  "da Tempestade", "do Inverno", "das Cinzas", "do Trovão", "da Lua Cheia",
  "do Caçador", "da Sentinela", "do Rei Caído", "da Rainha Esquecida", "do Juramento",
  "da Vingança", "do Mártir", "das Profundezas", "do Vazio", "da Última Guerra",
  "dos Ancestrais", "do Pacto", "da Serpente", "do Lobo Branco", "da Fênix",
  "do Carrasco", "do Penitente", "das Marés", "do Norte", "da Chama Eterna",
  "do Sussurro", "da Rocha Viva", "dos Mil Golpes", "do Apostata", "da Vigília",
];

/* ---------------- PODERES (raridade alta ganha um efeito nomeado) ---------------- */
const PODERES_POR_SLOT = {
  arma: [
    "Brilha quando perigo se aproxima", "Corta o ar com um zumbido baixo", "Nunca perde o fio",
    "Devolve um clarão a cada golpe certeiro", "Sussurra o nome de quem já matou", "Aquece na presença de magia",
    "Golpes críticos ecoam como trovão", "Pesa menos na mão de quem jura proteger",
  ],
  escudo: [
    "Repele o primeiro susto de cada batalha", "Símbolo que inspira aliados próximos",
    "Não amassa, não importa o golpe", "Reflete a luz como um espelho de guerra",
  ],
  armadura: [
    "Leve como seda, firme como muralha", "Aquece o corpo no frio mortal",
    "As fivelas se fecham sozinhas", "Cheira a cedro e fumaça de batalhas antigas",
  ],
  elmo: [
    "Visão clara mesmo sob chuva e fumaça", "Sussurros de batalhas antigas guiam o portador",
    "Nenhum golpe na cabeça soa tão alto quanto deveria", "A viseira nunca embaça",
  ],
  botas: [
    "Passos que não acordam nem o sono mais leve", "Nunca escorregam em gelo ou lama",
    "Deixam pegadas que se apagam em minutos", "O cansaço da estrada pesa menos",
  ],
  anel: [
    "Aquece quando alguém mente por perto", "Gira sozinho perto de ouro",
    "Pulsa no ritmo do coração do portador", "Gelo ao toque, sempre",
  ],
  amuleto: [
    "Brilha fracamente na escuridão total", "Protege sonhos de intrusos",
    "A corrente nunca se parte", "Guarda o cheiro de casa, onde quer que casa seja",
  ],
};

/* ---------------- BÔNUS POR RARIDADE ----------------
   Escala com o nível do herói para o loot acompanhar a lenda. */
const TIER = { comum: 0, incomum: 1, raro: 2, epico: 3, lendario: 4 };
const ATRIBUTOS_PERSONAGEM = ["forca", "destreza", "vigor", "intelecto", "presenca", "percepcao"];
const ROTULO_ATTR = { forca: "Força", destreza: "Destreza", vigor: "Vigor", intelecto: "Intelecto", presenca: "Presença", percepcao: "Percepção" };

/* Concordância do prefixo com o nome base (gênero e número). */
function concordancia(par, baseNome) {
  const primeiro = (baseNome || "").split(" ")[0];
  const fem = /a(s)?$/i.test(primeiro) || /^(Veste|Aegis|Coifa|Manga)/.test(primeiro);
  const plural = /s$/i.test(primeiro);
  let forma = fem ? par[1] : par[0];
  if (plural) {
    if (/[oa]$/.test(forma)) forma += "s";
    else if (forma === "Anão") forma = "Anões";
    else if (forma === "Anã") forma = "Anãs";
    else if (forma === "Real") forma = "Reais";
    else if (forma === "Celestial") forma = "Celestiais";
    else if (forma === "Abissal") forma = "Abissais";
    else if (forma === "Feroz") forma = "Ferozes";
    else if (/[el]$/.test(forma)) forma += "is".slice(0, forma.endsWith("l") ? 2 : 0) || forma; // Leve→Leves, Elegante→Elegantes
    if (forma === "Leve") forma = "Leves";
    else if (["Elegante", "Radiante", "Flamejante"].includes(forma)) forma += "s";
  }
  return forma;
}

/* Gera UM equipamento. raridade: id · nivel: nível do herói (escala o bônus)
   tipo: força um slot ("arma", "anel"…) ou null para sortear. */
export function gerarLoot(raridade = "comum", { tipo = null, nivel = 1 } = {}) {
  const slot = tipo && BASES[tipo] ? tipo : sortear(Object.keys(BASES));
  const base = sortear(BASES[slot]);
  const tier = TIER[raridade] ?? 0;
  const escalaNivel = Math.min(3, Math.floor((nivel - 1) / 5)); // +1 a cada 5 níveis, teto +3

  const atributos = {};
  if (base.dano) atributos.dano = base.dano + tier + escalaNivel;
  if (base.defesa) atributos.defesa = base.defesa + Math.floor(tier / 2) + Math.floor(escalaNivel / 2);
  /* acessórios e raridades altas: bônus em atributo de personagem */
  const ehAcessorio = slot === "anel" || slot === "amuleto";
  if (ehAcessorio || tier >= 2) {
    const qtd = ehAcessorio ? Math.max(1, tier) : tier >= 3 ? 2 : 1;
    const pool = [...ATRIBUTOS_PERSONAGEM];
    for (let i = 0; i < qtd && pool.length; i++) {
      const a = pool.splice(d(pool.length), 1)[0];
      atributos[a] = (atributos[a] || 0) + Math.max(1, Math.min(3, tier + (tier >= 3 ? 1 : 0)));
    }
  }

  /* nome: comum/incomum = base [+ prefixo] · raro+ = prefixo + base + sufixo */
  let nome = base.nome;
  const comPrefixo = tier >= 2 ? true : tier === 1 ? Math.random() < 0.6 : Math.random() < 0.15;
  if (comPrefixo) nome = `${concordancia(sortear(PREFIXOS), base.nome)} ${base.nome}`;
  if (tier >= 2) nome = `${nome} ${sortear(SUFIXOS)}`;

  /* v6.6 — dano elemental em armas e resistência elemental em defesas (raro+) */
  const ELEMENTOS = ["fogo", "gelo", "raio", "veneno", "sagrado", "sombrio", "arcano"];
  const ROTULO_ELEM = { fogo: "chamas", gelo: "geada", raio: "tempestade", veneno: "toxinas", sagrado: "luz", sombrio: "trevas", arcano: "magia" };
  const ehDefesa = ["escudo", "armadura", "elmo", "botas"].includes(slot);
  let poder = tier >= 2 ? sortear(PODERES_POR_SLOT[slot] || []) : "";
  if (tier >= 2 && slot === "arma" && Math.random() < 0.35) {
    const el = sortear(ELEMENTOS);
    atributos.elemento = el;
    poder = poder || `A lâmina pulsa com ${ROTULO_ELEM[el]} — o dano é de ${el}.`;
  } else if (tier >= 2 && ehDefesa && Math.random() < 0.35) {
    const el = sortear(ELEMENTOS);
    atributos.resist = [el];
    poder = poder || `Protege contra ${ROTULO_ELEM[el]} — dano de ${el} reduzido à metade.`;
  }
  const descricao = tier >= 3 ? "Uma peça que já sobreviveu a donos lendários." : tier === 2 ? "Trabalho de mestre artesão." : "";

  return { nome, tipo: slot, raridade, atributos, poder, descricao };
}

/* Raridade do espólio conforme a ameaça do maior inimigo derrotado. */
export function raridadeDeAmeaca(ameaca) {
  const rolagem = Math.random();
  const tabela = {
    fraco: [["comum", 0.7], ["incomum", 1]],
    comum: [["comum", 0.45], ["incomum", 0.9], ["raro", 1]],
    competente: [["comum", 0.2], ["incomum", 0.6], ["raro", 0.95], ["epico", 1]],
    elite: [["incomum", 0.25], ["raro", 0.75], ["epico", 0.97], ["lendario", 1]],
    lendario: [["raro", 0.3], ["epico", 0.8], ["lendario", 1]],
  }[ameaca] || [["comum", 1]];
  for (const [rar, limite] of tabela) if (rolagem < limite) return rar;
  return "comum";
}

/* Espólio de vitória: um item gerado pela ameaça do inimigo mais forte. */
export function gerarEspolioItem(inimigos, nivel = 1) {
  const ordem = { fraco: 0, comum: 1, competente: 2, elite: 3, lendario: 4 };
  const maisForte = (inimigos || []).reduce((m, e) => Math.max(m, ordem[e.ameaca] ?? 1), 1);
  const ameacaMax = Object.keys(ordem).find((k) => ordem[k] === maisForte) || "comum";
  const raridade = raridadeDeAmeaca(ameacaMax);
  return gerarLoot(raridade, { nivel });
}

/* ---------------- FORJA (desmontar → essência → forjar) ---------------- */
export const ESSENCIA_POR_RARIDADE = { comum: 2, incomum: 5, raro: 12, epico: 25, lendario: 60 };
export const CUSTO_FORJA = {
  comum: { essencia: 4, moedas: 0 },
  incomum: { essencia: 10, moedas: 10 },
  raro: { essencia: 25, moedas: 40 },
  epico: { essencia: 55, moedas: 120 },
  lendario: { essencia: 130, moedas: 300 },
};
export function essenciaDe(item) { return ESSENCIA_POR_RARIDADE[(item && item.raridade) || "comum"] || 2; }
export function valorDe(item) {
  const t = TIER[(item && item.raridade) || "comum"] ?? 0;
  return 8 + t * t * 18 + t * 7; // comum 8 · incomum 33 · raro 94 · epico 209 · lendario 396
}
