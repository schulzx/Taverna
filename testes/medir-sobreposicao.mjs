const S = "../src/";
const { montarSystemPrompt } = await import(S + "prompt.js");
const pers = { nome: "Brann", nivel: 8, raca: "Humano", classe: "Druida",
  atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 61, manaMax: 48 };
const p = montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", { emCidade: true });
const itens = []; let at = null;
for (const l of p.split("\n")) {
  if (/^- /.test(l) || /^[A-ZÀ-Ú][A-ZÀ-Ú0-9 ,ÇÃÕÉÍÓÚÂÊÔ()\/·—-]{10,}[:(]/.test(l)) { if (at) itens.push(at); at = { txt: l }; }
  else if (at) at.txt += "\n" + l;
}
if (at) itens.push(at);
const GENTE = /NPC|personagem|personagens|pessoa|pessoas|elenco|di[áa]logo|voz|vozes|rea[çc][õo]es|interpret|amansar|moraliz|sedutora|covarde|fan[áa]tico|diversidade|conhecid[ao]s|passado compartilhad/i;
const PROIBE = /\bN[ÃA]O\b|NUNCA|JAMAIS|PROIBID/;
let vaiCom = 0, fica = 0, chVai = 0, chFica = 0;
const ficam = [];
for (const i of itens) {
  if (!PROIBE.test(i.txt)) continue;
  if (GENTE.test(i.txt)) { vaiCom++; chVai += i.txt.length; }
  else { fica++; chFica += i.txt.length; ficam.push([i.txt.length, i.txt.split("\n")[0].replace(/^- /, "").slice(0, 56)]); }
}
console.log("itens COM proibicao:", vaiCom + fica);
console.log("  vao com o ator :", vaiCom, "·", chVai, "car ·", (chVai * 100 / p.length).toFixed(1) + "% do prompt");
console.log("  ficam no Narrador:", fica, "·", chFica, "car ·", (chFica * 100 / p.length).toFixed(1) + "%");
ficam.sort((a, b) => b[0] - a[0]);
console.log("\nas dez maiores que FICAM (e que a fase 6 ainda tera de julgar):");
for (const [c, t] of ficam.slice(0, 10)) console.log(String(c).padStart(5), t);
