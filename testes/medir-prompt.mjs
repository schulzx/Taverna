/* Mede o prompt por PEDAÇO, e classifica cada um pelo que ele faz:
   DECIDIR (instrucao de julgamento), NARRAR (como contar), FATO (dado do
   mundo), FORMATO (JSON e afins). */
const S = "../src/";
const { montarSystemPrompt, PORTAS_DA_CENA, portasAbertas } = await import(S + "prompt.js");

const pers = { nome: "Brann", conceito: "druida", historia: "", nivel: 8, raca: "Humano", classe: "Druida", atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 61, manaMax: 48 };
const cena = { emCidade: true };
const p = montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", cena);
console.log("prompt de cena comum:", p.length, "caracteres");

/* quebra por blocos de titulo em CAIXA ALTA seguidos de dois-pontos ou
   linha propria — e como o arquivo organiza as secoes */
const linhas = p.split("\n");
const blocos = [];
let atual = { titulo: "(abertura)", txt: [] };
for (const l of linhas) {
  const m = l.match(/^([A-ZÀ-Ú0-9 ,ÇÃÕÉÍÓÚÂÊÔ\u00C0-\u00DC—·()\/-]{8,70})[:\s]*$/) || l.match(/^([A-ZÀ-Ú][A-ZÀ-Ú ,ÇÃÕ]{7,60}) \(/);
  if (m && l.trim().length > 8) { blocos.push(atual); atual = { titulo: m[1].trim(), txt: [] }; }
  atual.txt.push(l);
}
blocos.push(atual);
const comTam = blocos.map((b) => ({ titulo: b.titulo, n: b.txt.join("\n").length })).filter((b) => b.n > 200);
comTam.sort((a, b) => b.n - a.n);
console.log("\n-- os 22 maiores blocos --");
for (const b of comTam.slice(0, 22)) console.log(String(b.n).padStart(6), b.titulo.slice(0, 62));
console.log("\ntotal em blocos >200:", comTam.reduce((s, b) => s + b.n, 0));
console.log("portas do catalogo:", PORTAS_DA_CENA.length, "· abertas nesta cena:", portasAbertas(cena).length);
