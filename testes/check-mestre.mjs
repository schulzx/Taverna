/* check-mestre.mjs (v9.85) — o mestre está ligado a tudo?

   "Temos que ter certeza que todos os sistemas estão ligados ao mestre,
   pois para ele tocar o mundo ele tem que ter controle sobre o mundo."

   Duas varreduras, e as duas procuram a MESMA doença em dois estágios:

   1) MÓDULO MUDO — um arquivo em src/ que ninguém importa. O sistema
      existe, foi escrito, foi testado, e não está ligado em nada.

   2) REGRA MUDA — um `export` que nenhum outro arquivo lê. É o estágio
      inicial do mesmo problema: o módulo está ligado, mas ESTA regra
      dele não. Foi assim que o `m.ativa` e o `npcs[cidade].gente`
      viveram campanhas inteiras sem disparar uma vez.

   O que este checador NÃO pega, e é honesto dizer: a regra que é lida
   por código morto, e a que é lida com o campo errado. Para essa segunda
   existe a garantia de leitor, na suíte da biblioteca. */
import fs from "node:fs";
import path from "node:path";

const DIR = "../src";
const arqs = fs.readdirSync(DIR).filter((f) => /\.(js|jsx)$/.test(f));
const fonte = Object.fromEntries(arqs.map((f) => [f, fs.readFileSync(path.join(DIR, f), "utf8")]));

/* AS SUITES CONTAM COMO LEITOR. Sem isto o checador acusa 26% do jogo de
   morto, e a maior parte desses export existe justamente para ser provada
   — um catalogo que so o teste le nao esta desligado do mestre: esta
   sendo vigiado. O que sobra depois de somar as suites e o sinal de
   verdade. */
const SP = ".";
const provas = fs.readdirSync(SP).filter((f) => /^teste-.+[.]mjs$/.test(f));
const textoDasProvas = provas.map((f) => fs.readFileSync(path.join(SP, f), "utf8")).join("\n");

/* de propósito fora da conta: painéis são folhas da árvore (ninguém os
   importa a não ser o App), e main.jsx é a raiz */
const FOLHAS = /^(main\.jsx|painel-.*\.jsx|planta-cidade\.jsx|ui\.jsx)$/;

console.log("=== 1. MÓDULOS QUE NINGUÉM IMPORTA ===\n");
let mudos = 0;
for (const f of arqs) {
  if (FOLHAS.test(f)) continue;
  const alvo = "./" + f.replace(/\.js$/, ".js");
  const quem = arqs.filter((g) => g !== f && (fonte[g].includes(`from "${alvo}"`) || fonte[g].includes(`from "./${f.replace(/\.jsx?$/, "")}"`)));
  if (!quem.length) { console.log(`  MUDO  ${f}`); mudos++; }
}
if (!mudos) console.log("  nenhum: todo módulo de src/ está ligado a alguém");

console.log("\n=== 2. REGRAS QUE NINGUÉM LÊ ===\n");
const RX_EXPORT = /^export (?:async )?(?:function|const|class) ([A-Za-z_][A-Za-z0-9_]*)/gm;
let regras = 0, mortas = 0;
const porArquivo = {};
for (const f of arqs) {
  if (FOLHAS.test(f)) continue;
  const nomes = [...fonte[f].matchAll(RX_EXPORT)].map((m) => m[1]);
  for (const nome of nomes) {
    regras++;
    /* usado em qualquer OUTRO arquivo, como identificador inteiro */
    const rx = new RegExp(`\\b${nome}\\b`);
    const usa = arqs.some((g) => g !== f && rx.test(fonte[g])) || rx.test(textoDasProvas);
    if (!usa) { (porArquivo[f] = porArquivo[f] || []).push(nome); mortas++; }
  }
}
const chaves = Object.keys(porArquivo).sort((a, b) => porArquivo[b].length - porArquivo[a].length);
for (const f of chaves) console.log(`  ${f.padEnd(22)} ${porArquivo[f].join(", ")}`);
if (!chaves.length) console.log("  nenhuma: todo export é lido por alguém");

console.log(`\n${regras} regras exportadas · ${mortas} sem leitor (${(100 * mortas / regras).toFixed(1)}%) · ${mudos} módulos mudos`);
