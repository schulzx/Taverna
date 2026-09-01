const S = "../src/";
const { montarSystemPrompt } = await import(S + "prompt.js");
const pers = { nome: "Brann", nivel: 8, raca: "Humano", classe: "Druida",
  atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 61, manaMax: 48 };
const p = montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", { emCidade: true });

/* cada frase que contem uma proibicao em caixa alta */
const frases = p.split(/(?<=[.;])\s+/).filter((f) => /\bN[ÃA]O\b|NUNCA|JAMAIS|PROIBID/.test(f));
console.log("frases com proibição em caixa alta:", frases.length, "\n");
for (const f of frases.slice(0, 26)) console.log("· " + f.replace(/\s+/g, " ").slice(0, 118));
