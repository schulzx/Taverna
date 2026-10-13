// Gera os 240 sujeitos da F2 (formas.md §Retratos 13). node mente/figma/retratos-f2-plano.mjs → retratos-f2-plano.json ao lado (não versionar o json; é regenerável).
// F2 dos retratos: os 240 heróis (10 raças × 2 sexos × 12 classes), na ordem de geração.
// Saída: f2-plano.json — uma entrada por célula, com o sujeito e o prompt inteiro.
import { RACAS, CLASSES } from "file:///C:/Users/clara/Desktop/Taverna/src/classes.js";
import { writeFileSync } from "node:fs";

const BLOCO = (s) => `Painterly fantasy role-playing game character portrait. Subject: ${s}. Composition: head-and-shoulders bust, three-quarter view turned slightly to the left, head centered horizontally, eyes exactly at 40 percent from the top, head occupying about half the frame height, shoulders cropped at the bottom edge. Style: hand-painted digital oil painting with visible confident brushstrokes, classic isometric computer RPG portrait tradition, dramatic chiaroscuro, warm amber key light from upper left, cool violet rim light on the right edge, deep dark violet-umber background with soft vignette and subtle painterly texture, muted desaturated palette with amber accents, strong readable silhouette. No text, no border, no frame, no watermark.`;

const semAcento = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "-");

// a raça, em palavras de pintura (m, f)
const RACA = {
  "Humano": ["human man", "human woman"],
  "Elfo": ["elf man with long pointed ears and fine angular features", "elf woman with long pointed ears and fine angular features"],
  "Anão": ["stout broad-shouldered dwarf man with a thick braided beard", "stout broad-shouldered dwarf woman with heavy braided hair"],
  "Halfling": ["halfling man, small folk with curly hair and a round sharp-eyed face", "halfling woman, small folk with curly hair and a round sharp-eyed face"],
  "Meio-orc": ["half-orc man with grey-green skin and small tusks jutting from the lower jaw", "half-orc woman with grey-green skin and small tusks jutting from the lower jaw"],
  "Draconato": ["male dragonborn, a draconic humanoid with a scaled reptilian dragon head and no hair", "female dragonborn, a draconic humanoid with a scaled reptilian dragon head, slender frills and no hair"],
  "Tiefling": ["tiefling man with curved ram horns, deep red skin and solid golden eyes", "tiefling woman with curved horns, violet-red skin and solid golden eyes"],
  "Gnomo": ["gnome man, very small with a large nose, big bright eyes and wild hair", "gnome woman, very small with a pointed nose, big bright eyes and wild hair"],
  "Meio-elfo": ["half-elf man with slightly pointed ears", "half-elf woman with slightly pointed ears"],
  "Goliath": ["towering goliath man, grey stone-like skin with dark lithoderm patches, bald", "towering goliath woman, grey stone-like skin with dark lithoderm patches, short-cropped hair"],
};
// as cores das escamas do draconato, para ninguém sair igual
const ESCAMAS = ["bronze", "crimson", "deep blue", "jade green", "pale white", "obsidian black", "gold", "silver", "copper", "brass", "ash grey", "amethyst"];

// a classe é UM gesto de traje (o contrato de §4: gesto de classe + traço de pessoa)
const CLASSE = {
  "Guerreiro": "a warrior in a dented steel gorget and battered plate pauldron, a sword hilt rising behind the shoulder",
  "Mago": "a wizard in a deep-hooded scholar's robe embroidered with silver runes, a faint arcane glow lighting the chin from below",
  "Ladino": "a rogue in a dark leather half-raised hood, a dagger hilt tucked in the collar strap",
  "Clérigo": "a cleric in light mail under a pale tabard, a holy sun-disc pendant on a chain at the chest",
  "Caçador": "a hunter in a hooded green-brown woodland cloak, a bowstring across the chest and arrow fletchings over the shoulder",
  "Bardo": "a bard in a slashed-sleeve doublet and a feathered cap, the neck of a lute over the shoulder",
  "Monge": "a monk in simple wrapped linen robes with prayer beads around the neck, calm disciplined gaze",
  "Druida": "a druid in a cloak of leaves and fur, a circlet of twigs and small antlers, a wooden circle amulet",
  "Feiticeiro": "a sorcerer in a travelling coat, faint glowing veins of innate magic running up the neck and cheek, eyes faintly lit",
  "Bruxo": "a warlock in a dark high-collared coat, an eldritch pact sigil glowing on the collar, a chained tome at the shoulder",
  "Engenheiro": "an engineer in a leather work apron and harness of tools, brass goggles pushed up on the forehead",
  "Invocador": "a summoner in a ceremonial mantle embroidered with a summoning circle, a small spectral familiar glowing at the shoulder",
};

// o traço de pessoa — rodado por célula, para o mundo não repetir
const TRACO = [
  "a thin scar through one eyebrow", "weathered sun-lined skin", "a grey streak in the hair", "a small silver nose ring",
  "a crooked once-broken nose", "freckles across the cheeks", "an old burn mark on the jaw", "a notched ear",
  "beads braided into the hair", "tired kind eyes and laugh lines", "a fresh bandage on the temple", "a faded tattoo on the neck",
  "young and wary", "old, with white hair", "a missing tooth in a half-smile", "a stern unblinking stare",
  "ritual paint under the eyes", "a scarred lip", "ink-stained fingers near the collar", "a heavy brow and deep-set eyes",
];
const IDADE = ["young", "", "middle-aged", "", "seasoned", ""];

// a classe mais comum de cada raça: não há dado de escolha no jogo, então decide a TABELA —
// a classe cujo atributo-chave a raça mais sobe (bonus em RACAS); empate → a primeira de CLASSES.
const classeTipica = (raca) => {
  let melhor = null, nota = -1;
  for (const c of CLASSES) { const v = raca.bonus[c.atributoChave] || 0; if (v > nota) { nota = v; melhor = c.nome; } }
  return melhor;
};

// as matrizes da amostra de 11/10 que já servem (não se paga duas vezes)
const AMOSTRA = {
  "Humano|f|Guerreiro": { de: "h1", hash: "1eee5a0d217b79fa9b2621fa338b3b7b5f2098fb", cx: 0.51, olhos: 0.39 },
  "Elfo|m|Mago": { de: "h2", hash: "10572b68ba5dc917d92affffa1888eccdb1d8fa6", cx: 0.44, olhos: 0.37 },
  "Anão|f|Clérigo": { de: "h3", hash: "245088ab82c85ec57775fb1481f922b421f0c2ae", cx: 0.45, olhos: 0.37 },
  "Meio-orc|m|Ladino": { de: "h4", hash: "0107d0b28e6f0de5534e1ff29955ac25c9f8ffd9", cx: 0.43, olhos: 0.38 },
  "Tiefling|f|Bruxo": { de: "h5", hash: "ed715d239dd7cc856385594f809f3c86f034f618", cx: 0.41, olhos: 0.39 },
  "Draconato|m|Caçador": { de: "h6", hash: "33f692b5d5d2f1b97fb73418cbfa7cc43933dd96", cx: 0.45, olhos: 0.35 },
};

const celula = (ri, raca, sexo, ci, classe) => {
  const r = raca.nome, c = classe.nome, s = sexo;
  const k = ri * 24 + ci * 2 + (s === "f" ? 1 : 0);
  let quem = RACA[r][s === "m" ? 0 : 1];
  if (r === "Draconato") quem = quem.replace("scaled", ESCAMAS[(ci * 2 + (s === "f" ? 7 : 0)) % ESCAMAS.length] + "-scaled");
  const idade = IDADE[(k * 7) % IDADE.length];
  let traco = TRACO[(k * 11 + ri * 3) % TRACO.length];
  // o sujeito não se contradiz: jovem não é velho, e o draconato não tem cabelo
  if (idade === "young" && traco.startsWith("old,")) traco = "prematurely white hair";
  if (idade === "young" && traco === "young and wary") traco = "a wary look";
  if (r === "Draconato") traco = traco.replace("in the hair", "in the frills").replace("streak in the hair", "streak in the frills").replace("freckles across the cheeks", "speckled scales across the cheeks").replace("weathered sun-lined skin", "weathered sun-worn scales").replace("a notched ear", "a notched frill").replace("old, with white hair", "pale age-bleached scales on the snout").replace("crooked once-broken nose", "crooked once-broken snout");
  if (r === "Goliath" && s === "m") traco = traco.replace("beads braided into the hair", "beads strung from one ear").replace("a grey streak in the hair", "a grey-flecked brow");
  const sujeito = `${idade ? idade + " " : ""}${quem}, ${CLASSE[c]}, ${traco}`;
  const chave = `${r}|${s}|${c}`;
  const arquivo = `${semAcento(r)}-${s}-${semAcento(c)}-1`;
  return { chave, raca: r, sexo: s, classe: c, arquivo, sujeito, prompt: BLOCO(sujeito), amostra: AMOSTRA[chave] || null };
};

const ordem = [];
const feito = new Set();
// volta 1: cada raça × sexo, a classe típica (raças na ordem da tabela)
RACAS.forEach((raca, ri) => {
  const ct = classeTipica(raca), ci = CLASSES.findIndex((c) => c.nome === ct);
  for (const s of ["m", "f"]) { const e = celula(ri, raca, s, ci, CLASSES[ci]); e.volta = 1; ordem.push(e); feito.add(e.chave); }
});
// volta 2: as outras classes, raça a raça, alternando os sexos (começa por quem a volta 1 não favoreceu)
RACAS.forEach((raca, ri) => {
  let vira = ri % 2;
  CLASSES.forEach((classe, ci) => {
    const sx = vira ? ["f", "m"] : ["m", "f"]; vira = 1 - vira;
    for (const s of sx) { const e = celula(ri, raca, s, ci, classe); if (feito.has(e.chave)) continue; e.volta = 2; ordem.push(e); feito.add(e.chave); }
  });
});
ordem.forEach((e, i) => (e.n = i + 1));
writeFileSync(new URL("./retratos-f2-plano.json", import.meta.url), JSON.stringify(ordem, null, 1));
const tipicas = RACAS.map((r) => `${r.nome}→${classeTipica(r)}`).join(", ");
console.log(ordem.length, "células;", ordem.filter((e) => e.amostra).length, "da amostra;", ordem.filter((e) => !e.amostra).length, "a gerar");
console.log(tipicas);
console.log(ordem.slice(0, 3).map((e) => e.arquivo + " :: " + e.sujeito).join("\n"));
