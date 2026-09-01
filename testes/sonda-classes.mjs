/* Sonda: como cada classe se sai de fato, do nivel 1 ao 20.
   Nao e teste — e uma varredura atras de coisa torta.                      */
import { CLASSES, classeDaHabilidade } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";
import { perfilCombate, ataquesPorTurno, danoDaClasse, acoesBonusDe, resumoPatamar, pvEsperadoJogador } from "../src/combate.js";
import { atributoDaHabilidade } from "../src/atributos.js";
import { naturezaDaHabilidade } from "../src/combos.js";
import { geometriaDe, ehArea } from "../src/grimorio.js";
import { aflicaoDe } from "../src/aflicoes.js";
import { invocacaoDe } from "../src/invocacoes.js";
import { limiarDe, formaDe, metamagiaDe, reerguerDe, ehReescrever } from "../src/habilidades.js";

const achados = [];
const anota = (o) => { achados.push(o); };

console.log("=== 1. AS CLASSES ===\n");
for (const c of CLASSES) {
  const p = perfilCombate(c.nome);
  const nv = [1, 5, 11, 20].map((n) => `nv${n}: ${ataquesPorTurno(c.nome, n)}× · ${danoDaClasse(c.nome, n, 3)} dano`);
  const bonus = acoesBonusDe({ classe: c.nome, nivel: 20 });
  console.log(`${c.nome.padEnd(12)} ${p.tipo.padEnd(11)} ${nv.join(" | ")}  ${bonus.length ? "· bônus: " + bonus.map((b) => b.nome).join(", ") : "· sem ação bônus"}`);
  if (danoDaClasse(c.nome, 20, 3) <= danoDaClasse(c.nome, 1, 3) * 2) anota({ o: `${c.nome}: o dano quase não cresce do nv1 ao nv20`, grau: "alto" });
}

console.log("\n=== 2. AS HABILIDADES SEM RESOLVEDOR ===\n");
/* Uma habilidade "resolvida" e a que algum modulo do sistema sabe cobrar.
   O resto o Mestre narra — o que e legitimo para muitas, e nao para todas. */
const RESOLVIDA = (h) => !!(
  aflicaoDe(`${h.nome} ${h.descricao || ""}`) || invocacaoDe(h) || limiarDe(h) || formaDe(h) ||
  metamagiaDe(h) || reerguerDe(h) || ehReescrever(h) || h.danoBase != null ||
  /dano|ataca|golpe|projetil|chama|gelo|raio|lamina|fogo|destrui|ferir|maldic|explos|impacto|perfur|corta|corte|drena|execut|cura|curar|restaura/i.test(`${h.nome} ${h.descricao || ""}`)
);
const todas = [];
for (const c of CLASSES) for (const h of c.habilidades || []) todas.push({ fonte: `classe ${c.nome}`, ...h });
for (const [k, arr] of Object.entries(SUBCLASSES)) for (const h of arr || []) todas.push({ fonte: `sub ${k}`, ...h });
for (const [k, arr] of Object.entries(ESPECIALIZACOES)) for (const h of arr || []) todas.push({ fonte: `esp ${k}`, ...h });
const sem = todas.filter((h) => !RESOLVIDA(h));
console.log(`${todas.length} habilidades · ${todas.length - sem.length} com resolvedor · ${sem.length} só na ficção`);
/* as "so na ficcao" que PROMETEM numero sao as suspeitas */
const RX_PROMETE = /por (\d|tr[eê]s|quatro|dois|um) turnos?|dobra|dobrado|metade|extra|\+\d|ignora|imune|reduz|aumenta|todos os|toda a|em [áa]rea|por rodada/i;
const suspeitas = sem.filter((h) => RX_PROMETE.test(`${h.nome} ${h.descricao || ""}`));
console.log(`\ndestas, ${suspeitas.length} prometem um NÚMERO e não têm quem o cobre:`);
for (const h of suspeitas) console.log(`  ${h.fonte.padEnd(22)} ${h.nome.padEnd(26)} — ${h.descricao}`);
if (suspeitas.length) anota({ o: `${suspeitas.length} habilidades prometem número (turnos, dobro, área, imunidade) sem resolvedor`, grau: "alto", lista: suspeitas.map((h) => h.nome) });

console.log("\n=== 3. ALCANCE E ÁREA ===\n");
const semGeo = todas.filter((h) => ehArea(h) && !(geometriaDe(h) || {}).raio);
console.log(`habilidades de área sem raio definido: ${semGeo.length}${semGeo.length ? " → " + semGeo.slice(0, 6).map((h) => h.nome).join(", ") : ""}`);
if (semGeo.length) anota({ o: `${semGeo.length} habilidades de área caem no raio padrão`, grau: "baixo" });

console.log("\n=== 4. ATRIBUTO E ESCOLA ===\n");
const semClasse = todas.filter((h) => !classeDaHabilidade(h.nome));
console.log(`habilidades que não sabem de que classe são: ${semClasse.length}`);
if (semClasse.length) { console.log("  → " + semClasse.slice(0, 8).map((h) => `${h.nome} (${h.fonte})`).join(", ")); anota({ o: `${semClasse.length} habilidades sem classe dona: escalam pelo atributo errado`, grau: "alto", lista: semClasse.slice(0, 10).map((h) => h.nome) }); }
const nat = {};
for (const h of todas) { const n = naturezaDaHabilidade(h, { classe: "Mago" }); nat[n] = (nat[n] || 0) + 1; }
console.log("natureza:", JSON.stringify(nat));

console.log("\n=== 5. O PATAMAR CONTRA O PV ===\n");
for (const n of [1, 5, 10, 15, 20]) console.log(`nv${String(n).padEnd(3)} PV esperado ${pvEsperadoJogador(n)} · ${resumoPatamar(n).slice(0, 90)}…`);

console.log("\n\n=== ACHADOS ===\n");
if (!achados.length) console.log("nada torto nesta sonda.");
for (const a of achados) console.log(`[${a.grau}] ${a.o}${a.lista ? "\n        " + a.lista.join(", ") : ""}`);
