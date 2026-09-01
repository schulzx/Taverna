const S = "../src/";
const I = await import(S + "indole.js");
const { gerarGeografia } = await import(S + "geografia.js");
const { locaisDaCidade, genteDoLocal } = await import(S + "mundo-base.js");

const SEM = "O Decimo Portao";
const mapa = gerarGeografia(SEM, null, null);
const cid = mapa.cidades[0];
const gente = [];
for (const l of locaisDaCidade(SEM, cid, "Fantasia medieval", null, null)) gente.push(...genteDoLocal(SEM, l, "Fantasia medieval", null, null));

console.log(`${gente.length} pessoas em ${cid.nome}\n`);
const conta = { figurante: 0, recorrente: 0, doArco: 0 };
const props = {};
for (const p of gente.slice(0, 14)) {
  const i = I.indoleDe(SEM, p);
  conta[i.relevancia]++;
  if (i.proposito) props[i.proposito] = (props[i.proposito] || 0) + 1;
  const pr = I.propositoPorId(i.proposito);
  console.log(`${p.nome} (${p.papel})`);
  console.log(`   ${I.linhaDaIndole(i) || "—"}`);
  console.log(`   [${i.relevancia}]${pr ? "  propósito: " + pr.nome : ""}`);
  const vet = I.vetosDaIndole(i);
  if (vet.length) console.log(`   nunca: ${vet.join(", ")}`);
}
console.log("\nrelevância:", JSON.stringify(conta));
console.log("propósitos:", JSON.stringify(props));

console.log("\n== TRAÇO QUE BRIGA NÃO CONVIVE ==");
let ruins = 0;
for (let n = 0; n < 400; n++) {
  const i = I.indoleDe(SEM, { nome: "p" + n });
  for (const a of i.tracos) for (const b of i.tracos) if (a !== b && !I.compativel(a, b)) ruins++;
}
console.log("  pares brigando em 400 pessoas:", ruins);

console.log("\n== O MEDO ACORDA ==");
const medroso = I.garantirIndole({ tracos: ["medroso"], medo: "feras" });
console.log("  com lobo na cena:", (I.medoAcordado(medroso, { inimigos: [{ nome: "Lobo Cinzento" }] }) || {}).faz);
console.log("  sem lobo:", I.medoAcordado(medroso, { inimigos: [{ nome: "Bandido" }] }));

console.log("\n== O PROPÓSITO AMADURECE ==");
const traidora = I.garantirIndole({ tracos: ["traidor"], proposito: "trair", relevancia: "recorrente" });
for (const c of [{ dias: 2, forcaDoLaco: 3 }, { dias: 8, forcaDoLaco: 1 }, { dias: 8, forcaDoLaco: 3 }, { dias: 8, sabeDeMim: true }]) {
  console.log(`  ${JSON.stringify(c)} → ${(I.propositoMaduro(traidora, c) || {}).nome || "ainda não"}`);
}
console.log("  cumprido não volta:", I.propositoMaduro(I.cumprir(traidora), { dias: 99, forcaDoLaco: 3 }));

console.log("\n== O QUE O ATOR RECEBE ==");
const d = I.paraODossie(traidora, { inimigos: [], convivio: { dias: 8, forcaDoLaco: 3 } });
console.log(JSON.stringify(d, null, 1));
