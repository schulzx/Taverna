const S = "../src/";
const C = await import(S + "comercio.js");
const { ESTACOES, estacaoDe } = await import(S + "calendario.js");
console.log("estações:", ESTACOES.map((e) => e.nome || e.id || JSON.stringify(e)).join(", "));
console.log("dia 1 =", JSON.stringify(estacaoDe(1)));
const cidades = [
  { nome: "Pedra Torta", bioma: "montanha", porte: "aldeia" },
  { nome: "Vau das Redes", bioma: "costa", porte: "vila" },
  { nome: "Alcáçova", bioma: "montanha", porte: "capital" },
  { nome: "Fronteira", bioma: "planicie", porte: "fortaleza" },
  { nome: "Lodo Fundo", bioma: "pantano", porte: "vila" },
];
for (const c of cidades) {
  const v = C.vocacaoDe(c);
  const arma = C.fatorDoLugar({ tipo: "arma", nome: "Espada" }, c, { dia: 1 });
  const pocao = C.fatorDoLugar({ tipo: "consumivel", nome: "Poção" }, c, { dia: 1 });
  console.log(`${c.nome} (${c.bioma}/${c.porte}) → ${v ? v.id : "—"} | arma ×${arma.fator.toFixed(2)} | poção ×${pocao.fator.toFixed(2)} | caixa ${C.caixaDe({ id: "g|1", tipo: "geral" }, c, 3)}`);
}
console.log("\nmesma poção, ano inteiro em Pedra Torta:");
for (const d of [1, 100, 190, 280]) {
  const r = C.fatorDoLugar({ tipo: "consumivel", nome: "Poção" }, cidades[0], { dia: d });
  console.log(`  dia ${String(d).padStart(3)} → ×${r.fator.toFixed(2)}  (${C.linhaDoPreco(r.porques)})`);
}
console.log("\npressão: comprando poção seis vezes no dia 10, em Pedra Torta");
let p = {};
for (let i = 0; i < 6; i++) {
  p = C.apertarProcura(p, cidades[0], "erva", 10);
  const r = C.fatorDoLugar({ tipo: "consumivel", nome: "Poção" }, cidades[0], { dia: 10, pressoes: p });
  process.stdout.write(`×${r.fator.toFixed(2)} `);
}
console.log("\n  e vinte dias depois: ×" + C.fatorDoLugar({ tipo: "consumivel", nome: "Poção" }, cidades[0], { dia: 30, pressoes: p }).fator.toFixed(2));
console.log("\nenvelope:\n" + C.envelopeDoComercio(cidades[1], 280));
