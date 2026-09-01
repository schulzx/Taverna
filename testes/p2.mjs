import { gerarGeografia } from "../src/geografia.js";
import { locaisDaCidade } from "../src/mundo-base.js";
import { nomeDeLocal, nomeDeTaverna, tamanhoDoBanco, tiposComNome, generosDaToponimia } from "../src/toponimia.js";

console.log("--- tamanho do banco por tipo (Fantasia medieval) ---");
for (const t of tiposComNome()) console.log("  " + t.padEnd(16), tamanhoDoBanco(t, "Fantasia medieval"));

console.log("\n--- repeticao DENTRO do mesmo mundo (400 mundos) ---");
let mundosComRepeticao = 0, totalLocais = 0, totalMundos = 0;
const porTipo = {};
for (let s = 0; s < 400; s++) {
  const sem = "m" + s + "|" + (s * 7919).toString(36);
  const geo = gerarGeografia(sem, null);
  const vistos = new Map(); let repetiu = false;
  for (const c of geo.cidades) {
    for (const l of locaisDaCidade(sem, c, "Fantasia medieval", null)) {
      totalLocais++;
      const chave = l.tipo + "::" + l.nome;
      if (vistos.has(chave)) { repetiu = true; porTipo[l.tipo] = (porTipo[l.tipo] || 0) + 1; }
      vistos.set(chave, true);
    }
  }
  totalMundos++; if (repetiu) mundosComRepeticao++;
}
console.log(`  ${totalLocais} locais em ${totalMundos} mundos`);
console.log(`  mundos com ao menos um nome repetido: ${mundosComRepeticao} (${(mundosComRepeticao/totalMundos*100).toFixed(1)}%)`);
console.log("  colisoes por tipo:", JSON.stringify(porTipo));

console.log("\n--- a taverna, entre criacoes ---");
const tav = {};
for (let s = 0; s < 3000; s++) tav[nomeDeTaverna("Fantasia medieval", mulberry(s))] = 1;
console.log("  3000 sorteios ->", Object.keys(tav).length, "nomes distintos");

console.log("\n--- amostra ---");
const r = mulberry(20260817);
for (const t of ["taverna","taverna","taverna","mercado","forja","templo","cemitério","docas","guilda","arena","cadeia","biblioteca","quartel","casa de banhos"])
  console.log(`  ${t.padEnd(15)} ${nomeDeLocal(t, "Fantasia medieval", r)}`);
console.log("  --- outros generos ---");
for (const g of generosDaToponimia()) console.log(`  ${g.padEnd(20)} ${nomeDeTaverna(g, r)} · ${nomeDeLocal("mercado", g, r)}`);

function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
