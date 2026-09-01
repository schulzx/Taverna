/* Quem promete matar/dobrar por LIMIAR de PV e nao tem codigo atras. */
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";

const N = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const RX = [
  /abaixo de (um terco|metade|1\/3|1\/2)/,
  /menos de (metade|um terco)/,
  /pouco pv/,
  /pv restante/,
  /enfraquecid/,
  /ferido/,
  /moribund/,
  /caido/,
  /executa|elimina|finaliza|abate/,
  /cai de uma vez/,
  /vida cheia|pv cheio|ileso|intacto/,
  /dano dobra|dobra o dano|dano duplicado|dobrado/,
];

const todas = [];
for (const c of CLASSES) for (const h of c.habilidades || []) todas.push({ fonte: `classe ${c.nome}`, ...h });
for (const [k, arr] of Object.entries(SUBCLASSES)) for (const h of arr || []) todas.push({ fonte: `subclasse ${k}`, ...h });
for (const [k, arr] of Object.entries(ESPECIALIZACOES)) for (const h of arr || []) todas.push({ fonte: `espec ${k}`, ...h });

console.log(`${todas.length} habilidades no total\n`);
const achadas = todas.filter((h) => RX.some((r) => r.test(N(`${h.nome} ${h.descricao}`))));
for (const h of achadas) console.log(`  ${h.fonte.padEnd(28)} ${h.nome.padEnd(28)} — ${h.descricao}`);
console.log(`\n${achadas.length} com linguagem de limiar/execucao`);
