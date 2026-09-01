const S = "../src/";
const { montarSystemPrompt } = await import(S + "prompt.js");
const pers = { nome: "Brann", conceito: "druida", historia: "", nivel: 8, raca: "Humano", classe: "Druida",
  atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 61, manaMax: 48 };
const p = montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", { emCidade: true });
console.log("cena comum:", p.length);

/* cada ITEM de topo: uma linha que comeca com "- " ou um titulo proprio */
const itens = [];
let at = null;
for (const l of p.split("\n")) {
  if (/^- /.test(l) || /^[A-ZÀ-Ú][A-ZÀ-Ú0-9 ,ÇÃÕÉÍÓÚÂÊÔ()\/·—-]{10,}[:(]/.test(l)) { if (at) itens.push(at); at = { rot: l.replace(/^- /, "").slice(0, 58), n: 0 }; }
  if (at) at.n += l.length + 1; else itens.push({ rot: "(topo)", n: l.length + 1 });
}
if (at) itens.push(at);
itens.sort((a, b) => b.n - a.n);
console.log("\n-- os 20 maiores ITENS --");
for (const i of itens.slice(0, 20)) console.log(String(i.n).padStart(5), i.rot);
console.log("\nitens:", itens.length, "· soma:", itens.reduce((s, i) => s + i.n, 0));
