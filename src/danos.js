/* Taverna v6.6 — TIPOS DE DANO, RESISTÊNCIAS E CICATRIZES (código, zero tokens).
   - Cada criatura tem um PERFIL inferido pelo nome/descrição: tipo do ataque,
     resistências (½ dano), fraquezas (×1,5) e imunidades (0).
   - Armas raras+ podem ser elementais; defesas raras+ podem dar resistência.
   - Quase-morte pode deixar CICATRIZ permanente — canon registrado. */

export const TIPOS_DANO = {
  fisico: { icone: "🗡", rotulo: "físico" },
  fogo: { icone: "🔥", rotulo: "fogo" },
  gelo: { icone: "❄", rotulo: "gelo" },
  raio: { icone: "⚡", rotulo: "raio" },
  veneno: { icone: "🧪", rotulo: "veneno" },
  sagrado: { icone: "✨", rotulo: "sagrado" },
  sombrio: { icone: "🌑", rotulo: "sombrio" },
  arcano: { icone: "🔮", rotulo: "arcano" },
};
export const rotuloDano = (t) => (TIPOS_DANO[t] || TIPOS_DANO.fisico).rotulo;
export const iconeDano = (t) => (TIPOS_DANO[t] || TIPOS_DANO.fisico).icone;

/* Perfis por padrão de nome (o bestiário inteiro ganha tipo sem editar ficha por ficha). */
const PERFIS = [
  [/drag|wyrm|serpente alada/i, { ataque: "fogo", resist: ["fogo"], fraqueza: ["gelo"], imune: [] }],
  [/salamandra|elemental de fogo|ígneo|igneo|ifrit|magma/i, { ataque: "fogo", resist: [], fraqueza: ["gelo"], imune: ["fogo"] }],
  [/elemental de gelo|gélido|gelido|yeti|wendigo/i, { ataque: "gelo", resist: [], fraqueza: ["fogo"], imune: ["gelo"] }],
  [/tempestade|elemental de ar|raio|trovão|trovao/i, { ataque: "raio", resist: ["raio"], fraqueza: [], imune: [] }],
  [/fantasma|espectro|apari|assombra|aparic/i, { ataque: "sombrio", resist: ["sombrio"], fraqueza: ["sagrado"], imune: ["fisico", "veneno"] }],
  [/esqueleto|zumbi|múmia|mumia|lich|cadáver|cadaver|necro|vampiro|mori/i, { ataque: "sombrio", resist: ["veneno", "sombrio"], fraqueza: ["sagrado"], imune: [] }],
  [/demônio|demonio|diabo|infernal|abissal/i, { ataque: "sombrio", resist: ["fogo", "sombrio"], fraqueza: ["sagrado"], imune: [] }],
  [/celestial|anjo|serafim/i, { ataque: "sagrado", resist: ["sagrado"], fraqueza: ["sombrio"], imune: [] }],
  [/aranha|escorpi|vespa|cobra|víbora|vibora|basilisco|medusa/i, { ataque: "veneno", resist: ["veneno"], fraqueza: [], imune: [] }],
  [/gosma|slime|lodo|gelatina/i, { ataque: "veneno", resist: ["fisico"], fraqueza: ["fogo"], imune: [] }],
  [/golem|estátua|estatua|autômato|automato|pedra|rocha/i, { ataque: "fisico", resist: ["fisico", "veneno"], fraqueza: ["raio"], imune: [] }],
  [/fada|fey|sílfide|silfide|duende|bruxa|feiticeira|mago|cultista/i, { ataque: "arcano", resist: ["arcano"], fraqueza: [], imune: [] }],
  [/sereia|kraken|tubarão|tubarao|aquático|aquatico|nix|ondina/i, { ataque: "gelo", resist: ["fogo"], fraqueza: ["raio"], imune: [] }],
  [/planta|treant|vinha|fungo|mofo/i, { ataque: "veneno", resist: ["veneno"], fraqueza: ["fogo"], imune: [] }],
];

export function perfilDeCriatura(nome, desc) {
  const texto = `${nome || ""} ${desc || ""}`;
  for (const [re, p] of PERFIS) if (re.test(texto)) return p;
  return { ataque: "fisico", resist: [], fraqueza: [], imune: [] };
}

/* Multiplicador + rótulo ao bater num perfil com um tipo de dano. */
export function multiplicadorDano(tipo, perfil) {
  if (!tipo || tipo === "fisico" || !perfil) {
    if (perfil && perfil.imune && perfil.imune.includes(tipo)) return { mult: 0, tag: `${iconeDano(tipo)} IMUNE — sem efeito` };
    return { mult: 1, tag: "" };
  }
  if (perfil.imune && perfil.imune.includes(tipo)) return { mult: 0, tag: `${iconeDano(tipo)} IMUNE — sem efeito` };
  if (perfil.fraqueza && perfil.fraqueza.includes(tipo)) return { mult: 1.5, tag: `${iconeDano(tipo)} FRAQUEZA! ×1,5` };
  if (perfil.resist && perfil.resist.includes(tipo)) return { mult: 0.5, tag: `${iconeDano(tipo)} resistido ×0,5` };
  return { mult: 1, tag: `${iconeDano(tipo)} ${rotuloDano(tipo)}` };
}

/* Resistências de uma pessoa (jogador/companheiro) vindas dos itens equipados. */
export function resistenciasEquipadas(ent) {
  const eq = (ent && ent.equipados) || {};
  const out = [];
  for (const slot of Object.keys(eq)) {
    const r = eq[slot] && eq[slot].atributos && eq[slot].atributos.resist;
    if (Array.isArray(r)) out.push(...r);
    else if (r) out.push(r);
  }
  return out;
}

/* Tipo de dano da arma equipada (padrão: físico). */
export function elementoDaArma(ent) {
  const arma = ent && ent.equipados && ent.equipados.arma;
  return (arma && arma.atributos && arma.atributos.elemento) || "fisico";
}

/* ---------------- CICATRIZES ----------------
   Marcas permanentes de quase-morte. Algumas pesam um pouco no corpo,
   todas pesam na história. */
export const CICATRIZES = [
  { nome: "Corte no rosto", local: "rosto", vidaMax: 0, descricao: "Um talho diagonal que o espelho nunca deixa você esquecer." },
  { nome: "Mão marcada", local: "mão", vidaMax: -1, descricao: "Os dedos fecham bem, mas formigam antes da chuva." },
  { nome: "Clavícula partida", local: "ombro", vidaMax: -2, descricao: "Soldou torto; carregar peso demais cobra seu preço." },
  { nome: "Mancha de queimadura", local: "braço", vidaMax: 0, descricao: "A pele ficou lisa e clara onde o fogo lambeu." },
  { nome: "Lascar de costela", local: "tronco", vidaMax: -2, descricao: "Respirar fundo demais ainda dói em dias frios." },
  { nome: "Olho turvo", local: "olho", vidaMax: -1, descricao: "Não ficou cego — mas o mundo por aquele lado tem névoa." },
  { nome: "Rastro de garras", local: "costas", vidaMax: 0, descricao: "Três linhas paralelas que impressionam quem as vê." },
  { nome: "Joelho estourado", local: "perna", vidaMax: -1, descricao: "Funciona. Range. Aviso de tempestade ambulante." },
  { nome: "Mordida antiga", local: "pescoço", vidaMax: 0, descricao: "Arco perfeito de pontinhos — alguma coisa quase te levou." },
  { nome: "Orelha fendida", local: "orelha", vidaMax: 0, descricao: "A ponta nunca mais foi a mesma. Ouvido, felizmente, sim." },
  { nome: "Punho rachado", local: "pulso", vidaMax: -1, descricao: "Segurar a espada por horas deixa a mão dormente." },
  { nome: "Chaga sombria", local: "peito", vidaMax: -3, descricao: "Onde a escuridão tocou, a pele ficou cinzenta e fria." },
];

export function sortearCicatriz(jaTem = []) {
  const nomes = new Set(jaTem.map((c) => c.nome));
  const livres = CICATRIZES.filter((c) => !nomes.has(c.nome));
  if (!livres.length) return null;
  return livres[Math.floor(Math.random() * livres.length)];
}

export const CICATRIZ_MAX = 8;
