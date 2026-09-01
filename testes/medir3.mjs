const S = "../src/";
const { montarSystemPrompt } = await import(S + "prompt.js");
const pers = { nome: "Brann", conceito: "druida", historia: "", nivel: 8, raca: "Humano", classe: "Druida",
  atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 61, manaMax: 48 };
const p = montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", { emCidade: true });

const itens = [];
let at = null;
for (const l of p.split("\n")) {
  if (/^- /.test(l) || /^[A-ZÀ-Ú][A-ZÀ-Ú0-9 ,ÇÃÕÉÍÓÚÂÊÔ()\/·—-]{10,}[:(]/.test(l)) { if (at) itens.push(at); at = { txt: l }; }
  else if (at) at.txt += "\n" + l;
}
if (at) itens.push(at);

const PROIBE = /\bN[ÃA]O\b|NUNCA|JAMAIS|PROIBID|n[ãa]o invente|n[ãa]o decida|n[ãa]o escolha|n[ãa]o pode|regra dura|proibido/i;
const DOSISTEMA = /o SISTEMA|do SISTEMA|pelo sistema|o sistema (decide|rola|calcula|escolhe|aplica|cobra|controla|resolve|já)/i;
let proibicao = 0, nProib = 0, oficio = 0, nOficio = 0, fato = 0, nFato = 0;
for (const i of itens) {
  const n = i.txt.length;
  if (PROIBE.test(i.txt) || DOSISTEMA.test(i.txt)) { proibicao += n; nProib++; }
  else if (/narre|descreva|voc[êe] decide|tom|cena|di[áa]logo|voz|ficção|ficcao|prosa/i.test(i.txt)) { oficio += n; nOficio++; }
  else { fato += n; nFato++; }
}
const T = p.length;
const pct = (x) => (x * 100 / T).toFixed(1) + "%";
console.log("TOTAL", T, "em", itens.length, "itens\n");
console.log("PROIBIÇÃO / atribuição ao sistema:", nProib, "itens ·", proibicao, pct(proibicao));
console.log("OFÍCIO de narrar                 :", nOficio, "itens ·", oficio, pct(oficio));
console.log("FATO do mundo / resto            :", nFato, "itens ·", fato, pct(fato));

const nots = (p.match(/\bN[ÃA]O\b/g) || []).length;
console.log("\nquantas vezes o prompt diz NÃO em caixa alta:", nots);
console.log("NUNCA:", (p.match(/NUNCA/g) || []).length, "· JAMAIS:", (p.match(/JAMAIS/g) || []).length, "· PROIBID:", (p.match(/PROIBID/gi) || []).length);
console.log("'regra dura':", (p.match(/regra dura/gi) || []).length, "· 'o sistema':", (p.match(/o sistema/gi) || []).length);
