/* Todas as habilidades que colocam um ALIADO TEMPORÁRIO no campo —
   invocador, engenheiro, necromante, druida e o que mais houver. */
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";
import { MAGIAS } from "../src/grimorio.js";

const RX = /(invoc|convoc|ergue|erguer|constr[oó]i|construir|anima|animar|chama\s+um|torreta|aut[oô]mato|golem|colosso|servo|esp[ií]rito|elemental|avatar|legi[ãa]o|companheiro animal|familiar|montaria|sentinela|guardi[ãa]o|exercito|ex[ée]rcito|esqueleto|morto)/i;

const todas = [];
for (const c of CLASSES) for (const h of c.habilidades || []) todas.push({ fonte: c.nome, ...h });
for (const [cl, lista] of Object.entries(SUBCLASSES)) for (const s of lista || []) for (const h of s.habilidades || []) todas.push({ fonte: `${cl}/${s.nome}`, ...h });
for (const [cl, lista] of Object.entries(ESPECIALIZACOES)) for (const e of lista || []) for (const h of e.habilidades || []) todas.push({ fonte: `esp ${e.nome}`, ...h });
for (const m of MAGIAS) todas.push({ fonte: "grimório", nome: m.nome, descricao: m.descricao || (m.extra && m.extra.descricao) || "", tipo: m.tipo, nivel: m.circulo });

const achados = todas.filter((h) => RX.test(`${h.nome} ${h.descricao || ""}`));
console.log(`invocações candidatas: ${achados.length} de ${todas.length}\n`);
for (const h of achados) {
  console.log(`  [${h.tipo || "?"}] ${h.fonte} · ${h.nome} (nv ${h.nivel ?? "?"}, ${h.custo ?? "?"} PM)`);
  console.log(`        ${h.descricao || "(sem descrição)"}`);
}
