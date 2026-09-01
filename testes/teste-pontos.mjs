import { pontosNoNivel, pontosTotais, custoEmPontos, classePorNome, habilidadesDaSubclasse, CLASSES } from "../src/classes.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[curva de pontos]");
for (const n of [1, 5, 6, 10, 11, 15, 16, 20]) console.log(`  nível ${String(n).padStart(2)}: vale ${pontosNoNivel(n)} · acumulado ${pontosTotais(n)}`);
ok(pontosTotais(5) === 5 && pontosTotais(10) === 15 && pontosTotais(15) === 30 && pontosTotais(20) === 50, "5/15/30/50 nos marcos");
ok(pontosTotais(20) > pontosTotais(19), "sempre cresce");

console.log("\n[o que 50 pontos compram]");
const custoArvore = (lista) => lista.reduce((s, h) => s + custoEmPontos(h), 0);
for (const nome of ["Mago", "Guerreiro", "Clérigo"]) {
  const c = classePorNome(nome);
  const base = custoArvore(c.habilidades);
  const sub = custoArvore(habilidadesDaSubclasse(c.subclasses[0].nome));
  console.log(`  ${nome}: base ${base} + subclasse ${sub} = ${base + sub} pontos (sobram ${50 - base - sub} de 50)`);
}
const magoTudo = custoArvore(classePorNome("Mago").habilidades) + custoArvore(habilidadesDaSubclasse("Elementalista"));
ok(magoTudo < 50, "dá para dominar uma classe inteira com subclasse no nível 20");
ok(50 - magoTudo < 20, "…mas o que sobra não compra uma segunda classe inteira");

console.log("\n[o jogo inteiro continua fora de alcance]");
const tudo = CLASSES.reduce((s, c) => s + custoArvore(c.habilidades) + (c.subclasses || []).reduce((t, sc) => t + custoArvore(habilidadesDaSubclasse(sc.nome)), 0), 0);
console.log(`  todas as classes e subclasses somam ${tudo} pontos — o ápice tem 50 (${Math.round(50 / tudo * 100)}%)`);
ok(tudo > 300, "ter tudo continua impossível");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
