import {
  fichaDoItem, avaliarEquipar, penalidadesAtivas, conjuracaoBloqueada,
  proficienciasDoHeroi, armasRecomendadas, armadurasRecomendadas,
  resumoProficienciaPrompt, ARMAS, ARMADURAS, PROFICIENCIAS,
} from "../src/itens.js";
import { BASES } from "../src/loot.js";
import { CLASSES } from "../src/classes.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const heroi = (classe, extra = {}) => ({ nome: "T", classe, nivel: 10, atributos: { forca: 1, destreza: 3, vigor: 2, intelecto: 4, presenca: 1, percepcao: 2 }, equipados: {}, inventario: [], ...extra });

console.log("\n[CLASSIFICAÇÃO — toda base do gerador precisa cair numa categoria]");
for (const nome of ["Montante", "Adaga", "Cajado de Carvalho", "Arco Longo", "Armadura de Placas", "Gibão de Couro", "Cota de Malha", "Escudo Torre", "Anel de Ouro"]) {
  const f = fichaDoItem({ nome });
  console.log(`  ${nome.padEnd(24)} → ${f.familia} / ${f.rotulo}${f.props && f.props.length ? ` [${f.props.join(", ")}]` : ""}`);
}
ok(fichaDoItem({ nome: "Montante" }).cat === "marcial_corpo", "montante é arma marcial");
ok(fichaDoItem({ nome: "Adaga" }).cat === "simples_corpo", "adaga é simples");
ok(fichaDoItem({ nome: "Cajado de Carvalho" }).cat === "arcana", "cajado é foco arcano");
ok(fichaDoItem({ nome: "Armadura de Placas" }).cat === "pesada", "placas é armadura pesada");
ok(fichaDoItem({ nome: "Cota de Malha" }).cat === "media", "malha é média");
ok(fichaDoItem({ nome: "Gibão de Couro" }).cat === "leve", "couro é leve");
/* o gerador cria nomes compostos: a BASE é que manda */
ok(fichaDoItem({ nome: "Espada Longa Flamejante da Víbora", tipo: "arma" }).cat === "marcial_corpo", "afixos do loot não confundem a classificação");
ok(fichaDoItem({ nome: "Armadura de Placas Abençoada do Titã", tipo: "armadura" }).cat === "pesada", "idem para armadura com afixos");

const semCategoria = [];
for (const [tipo, lista] of Object.entries(BASES)) {
  for (const b of lista) {
    const f = fichaDoItem({ nome: b.nome, tipo });
    if (!f || !f.cat) semCategoria.push(b.nome);
    if (tipo === "arma" && f.familia !== "arma") semCategoria.push(`${b.nome} (virou ${f.familia})`);
    if (tipo === "armadura" && f.familia !== "armadura") semCategoria.push(`${b.nome} (virou ${f.familia})`);
  }
}
ok(semCategoria.length === 0, `todas as ${Object.values(BASES).flat().length} bases do loot classificam${semCategoria.length ? ` — falharam: ${semCategoria.join(", ")}` : ""}`);

console.log("\n[O CASO QUE VOCÊ CITOU: mago de placas e montante]");
const mago = heroi("Mago");
const placas = avaliarEquipar(mago, { nome: "Armadura de Placas", tipo: "armadura" }, { Mago: 10 });
console.log("  placas:", placas.penalidades.map((p) => p.texto).join(" · "));
ok(placas.pode, "não é bloqueado — o jogador pode insistir");
ok(placas.penalidades.some((p) => p.tipo === "sem_magia"), "mas o mago NÃO consegue conjurar de dentro dela");
ok(placas.penalidades.some((p) => p.tipo === "desvantagem"), "e leva desvantagem por falta de treino");
const montante = avaliarEquipar(mago, { nome: "Montante", tipo: "arma" }, { Mago: 10 });
console.log("  montante:", montante.penalidades.map((p) => p.texto).join(" · "));
ok(montante.penalidades.some((p) => p.tipo === "desvantagem"), "montante no mago dá desvantagem e tira a proficiência");
const cajado = avaliarEquipar(mago, { nome: "Cajado de Carvalho", tipo: "arma" }, { Mago: 10 });
ok(cajado.penalidades.length === 0, "e o cajado, que é a arma dele, não tem penalidade nenhuma");

console.log("\n[e o contrário: guerreiro de cajado]");
const guer = heroi("Guerreiro", { atributos: { forca: 4, destreza: 2, vigor: 3, intelecto: 0, presenca: 1, percepcao: 1 } });
ok(avaliarEquipar(guer, { nome: "Armadura de Placas", tipo: "armadura" }, { Guerreiro: 10 }).penalidades.length === 0, "guerreiro veste placas sem penalidade");
ok(avaliarEquipar(guer, { nome: "Montante", tipo: "arma" }, { Guerreiro: 10 }).penalidades.length === 0, "e empunha montante à vontade");
const guerCajado = avaliarEquipar(guer, { nome: "Cajado de Carvalho", tipo: "arma" }, { Guerreiro: 10 });
ok(guerCajado.penalidades.length === 0, "o cajado é arma simples — o guerreiro PODE usar (só não conjura nada com ele)");

console.log("\n[força importa]");
const fraco = heroi("Guerreiro", { atributos: { forca: 1, destreza: 2, vigor: 2, intelecto: 0, presenca: 0, percepcao: 0 } });
const pesada = avaliarEquipar(fraco, { nome: "Armadura de Placas", tipo: "armadura" }, { Guerreiro: 10 });
ok(pesada.penalidades.some((p) => p.tipo === "lento"), `guerreiro fraco em placas fica lento: "${(pesada.penalidades.find((p) => p.tipo === "lento") || {}).texto}"`);
ok(avaliarEquipar(fraco, { nome: "Montante", tipo: "arma" }, { Guerreiro: 10 }).penalidades.some((p) => p.tipo === "desvantagem"), "e a arma pesada pesa demais para ele");

console.log("\n[regras próprias de classe]");
const druida = heroi("Druida");
const metal = avaliarEquipar(druida, { nome: "Cota de Malha", tipo: "armadura" }, { Druida: 8 });
ok(metal.penalidades.some((p) => p.tipo === "juramento"), "druida de metal quebra o voto");
const monge = heroi("Monge");
ok(avaliarEquipar(monge, { nome: "Gibão de Couro", tipo: "armadura" }, { Monge: 8 }).penalidades.some((p) => p.tipo === "sem_defesa"), "monge perde a Defesa sem Armadura ao se vestir");
const ladino = heroi("Ladino");
ok(avaliarEquipar(ladino, { nome: "Rapieira", tipo: "arma" }, { Ladino: 8 }).penalidades.length === 0, "ladino usa rapieira (exceção da classe) mesmo sendo marcial");
ok(avaliarEquipar(ladino, { nome: "Montante", tipo: "arma" }, { Ladino: 8 }).penalidades.length > 0, "mas montante não");

console.log("\n[multiclasse SOMA proficiência]");
const magoGuerreiro = heroi("Mago");
const soma = proficienciasDoHeroi(magoGuerreiro, { Mago: 10, Guerreiro: 8 });
console.log(`  armas: ${[...soma.armas].join(", ")} · armaduras: ${[...soma.armaduras].join(", ")} · escudo: ${soma.escudo}`);
ok(soma.armaduras.has("pesada") && soma.armas.has("marcial"), "quem abriu guerreiro aprendeu placas e armas marciais");
const mg = avaliarEquipar(magoGuerreiro, { nome: "Armadura de Placas", tipo: "armadura" }, { Mago: 10, Guerreiro: 8 });
ok(!mg.penalidades.some((p) => p.tipo === "sem_magia"), "e o mago-guerreiro CONJURA de dentro das placas — porque treinou para isso");

console.log("\n[penalidades ativas e bloqueio de conjuração]");
const vestido = heroi("Mago", { equipados: { armadura: { nome: "Armadura de Placas", tipo: "armadura" }, arma: { nome: "Montante", tipo: "arma" } } });
const pen = penalidadesAtivas(vestido, { Mago: 10 });
console.log("  " + pen.map((p) => `${p.item}: ${p.texto}`).join("\n  "));
ok(pen.length >= 3, "o sistema enxerga tudo o que está pesando ao mesmo tempo");
ok(conjuracaoBloqueada(vestido, { Mago: 10 }), "e sabe dizer que a conjuração está travada");
ok(!conjuracaoBloqueada(heroi("Mago"), { Mago: 10 }), "mago sem armadura conjura normalmente");
const txt = resumoProficienciaPrompt(vestido, { Mago: 10 });
console.log("  prompt:", txt.slice(0, 220) + "…");
ok(/ATENÇÃO/.test(txt) && /nunca deixe passar/.test(txt), "o Mestre é avisado e proibido de fingir que está tudo bem");

console.log("\n[recomendações por classe — servem à criação e ao craft]");
for (const c of CLASSES.slice(0, 4)) {
  console.log(`  ${c.nome.padEnd(11)} armas: ${armasRecomendadas(c.nome).length} · armaduras: ${armadurasRecomendadas(c.nome).map((a) => a.nome).join(", ") || "nenhuma"}`);
}
ok(CLASSES.every((c) => PROFICIENCIAS[c.nome]), "todas as 12 classes têm proficiência definida");
ok(armasRecomendadas("Mago").some((a) => a.cat === "arcana"), "o mago vê o cajado na lista dele");
ok(!armasRecomendadas("Mago").some((a) => a.nome === "Montante"), "e não vê o montante");
ok(armadurasRecomendadas("Monge").every((a) => a.cat === "panos"), "o monge só vê vestes");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
