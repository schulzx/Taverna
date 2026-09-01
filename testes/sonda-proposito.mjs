/* A prova de mundo: mil pessoas, e o que o Mestre faria com elas. */
const S = "../src/";
const I = await import(S + "indole.js");
const conv = { dias: 12, forcaDoLaco: 3, sabeDeMim: true, meDeve: true, euGanhei: true };
const conta = {}, cedo = [];
for (let i = 0; i < 1000; i++) {
  const p = { nome: `Pessoa ${i}`, relevancia: i % 3 === 0 ? "arco" : i % 3 === 1 ? "volta" : "figurante" };
  const ind = I.indoleDe("mundo-de-prova", p);
  const d = I.dispararProposito(ind, p, conv);
  if (d) conta[d.proposito] = (conta[d.proposito] || 0) + 1;
  /* nada pode disparar no dia do encontro */
  if (I.dispararProposito(ind, p, { dias: 0, forcaDoLaco: 5, sabeDeMim: true, meDeve: true, euGanhei: true })) cedo.push(p.nome);
}
console.log("com convívio longo, disparam:", conta);
console.log("total:", Object.values(conta).reduce((a, b) => a + b, 0), "de 1000");
console.log("disparam no dia zero:", cedo.length);
const d = I.dispararProposito(I.indoleDe("mundo-de-prova", { nome: "Pessoa 0", relevancia: "arco" }), { nome: "Pessoa 0" }, conv);
console.log("\nexemplo — linha do diário:", d && d.linha);
console.log("exemplo — envelope:\n" + (d && d.envelope));
