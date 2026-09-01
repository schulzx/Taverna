/* varredura-habilidades.mjs — quais habilidades o sistema RESOLVE.
   Reproduz os mesmos testes que o App faz na hora do uso e classifica
   cada habilidade do catálogo (classes, subclasses, especializações e
   grimório) pelo resolvedor que vai pegá-la — ou por nenhum.          */
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";
import { MAGIAS } from "../src/grimorio.js";
import { aflicaoDe } from "../src/aflicoes.js";
import { passoDeHabilidade } from "../src/movimento.js";
import { gatilhosDe } from "../src/gatilhos.js";

/* o mesmo crivo do App (resolverHabilidadeOfensiva) */
const HAB_OFENSIVA_RX = /dano|ataca|golpe|projetil|projétil|chama|gelo|raio|lamina|lâmina|fogo|destrui|ferir|maldic|explos|impacto|perfur|cort[ae]|drena|execut/i;
/* cura tem caminho próprio no App */
const CURA_RX = /(cura|curar|restaura|recupera|sara|regenera|vida de volta)/i;

function classificar(h) {
  const txt = `${h.nome || ""} ${h.descricao || ""}`;
  const tags = [];
  if (HAB_OFENSIVA_RX.test(txt)) tags.push("dano");
  if (aflicaoDe(txt)) tags.push("condição");
  if (passoDeHabilidade(h)) tags.push("movimento");
  if (gatilhosDe(h).length) tags.push("gatilho");
  if (CURA_RX.test(txt)) tags.push("cura");
  if (h.funcao) tags.push(`função:${h.funcao}`);
  return tags;
}

const todas = [];
for (const c of CLASSES) for (const h of c.habilidades || []) todas.push({ fonte: c.nome, ...h });
for (const [, lista] of Object.entries(SUBCLASSES)) for (const s of lista || []) for (const h of s.habilidades || []) todas.push({ fonte: `sub:${s.nome}`, ...h });
for (const [, lista] of Object.entries(ESPECIALIZACOES)) for (const e of lista || []) for (const h of e.habilidades || []) todas.push({ fonte: `esp:${e.nome}`, ...h });
for (const m of MAGIAS) todas.push({ fonte: "grimório", nome: m.nome, descricao: (m.extra && m.extra.descricao) || "", funcao: m.extra && m.extra.funcao, tipo: m.tipo });

const semDono = [];
const conta = {};
for (const h of todas) {
  const tags = classificar(h);
  const chave = tags.length ? tags.join("+") : "(NENHUM)";
  conta[chave] = (conta[chave] || 0) + 1;
  if (!tags.length) semDono.push(h);
}

console.log(`total de habilidades no catálogo: ${todas.length}\n`);
console.log("═══ POR RESOLVEDOR ═══");
for (const [k, v] of Object.entries(conta).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);

console.log(`\n═══ SEM RESOLVEDOR NENHUM (${semDono.length}) ═══`);
const porTipo = {};
for (const h of semDono) { const t = h.tipo || "?"; (porTipo[t] || (porTipo[t] = [])).push(h); }
for (const [tipo, lst] of Object.entries(porTipo)) {
  console.log(`\n-- tipo "${tipo}" (${lst.length}) --`);
  for (const h of lst.slice(0, 40)) console.log(`   ${h.fonte} · ${h.nome}: ${h.descricao || "(sem descrição)"}`);
  if (lst.length > 40) console.log(`   … e mais ${lst.length - 40}`);
}
