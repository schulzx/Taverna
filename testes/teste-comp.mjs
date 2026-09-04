import { classeDeCompanheiro, garantirFichaCompanheiro, decidirAcaoCompanheiro, resumoGrupoPrompt } from "../src/companheiros.js";
import { turnoDosCompanheiros } from "../src/combate.js";
import { itemConsumivel } from "../src/pocoes.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[que classe é cada companheiro]");
for (const [comp, esperado] of [
  [{ nome: "Elira", conceito: "curandeira do templo" }, "Clérigo"],
  [{ nome: "Doran", conceito: "mercenário veterano" }, "Guerreiro"],
  [{ nome: "Nyx", conceito: "gatuna das ruas" }, "Ladino"],
  [{ nome: "Sable", conceito: "erudito arcano" }, "Mago"],
  [{ nome: "Rook", conceito: "arqueiro das matas" }, "Caçador"],
  [{ nome: "Lyra", conceito: "menestrel" }, "Bardo"],
]) ok(classeDeCompanheiro(comp) === esperado, `${comp.nome} (${comp.conceito}) → ${classeDeCompanheiro(comp)}`);

console.log("\n[ficha completa]");
const elira = garantirFichaCompanheiro({ nome: "Elira", conceito: "curandeira do templo", nivel: 6, vida: 40, vidaMax: 40 });
console.log(`  ${elira.nome}: ${elira.classe} nv${elira.nivel}, ${elira.mana}/${elira.manaMax} PM`);
console.log(`    habilidades: ${elira.habilidades.map(h => h.nome + "(" + h.custo + "PM)").join(", ")}`);
ok(elira.classe === "Clérigo" && elira.habilidades.length > 0, "curandeira ganhou classe e habilidades do catálogo");
ok(elira.habilidades.some(h => /cura|restaur|circulo|círculo/i.test(h.nome + " " + (h.descricao||""))), "e tem pelo menos uma cura de verdade");

console.log("\n[decisões em combate]");
const inimigos = [{ nome: "Goblin", vida: 20, vidaMax: 20, ameaca: "fraco", nivel: 2, condicoes: [] }];
const heroiFerido = { nome: "Vera", vida: 12, vidaMax: 90, condicoes: [] };
const d1 = decidirAcaoCompanheiro(elira, { aliados: [], inimigos, jogador: heroiFerido, rodada: 3 });
ok(d1.tipo === "cura" && d1.alvo === "Vera", `herói a 12/90 → ${d1.tipo} em ${d1.alvo} (${d1.habilidade && d1.habilidade.nome})`);

const heroiInteiro = { nome: "Vera", vida: 90, vidaMax: 90, condicoes: [] };
const d2 = decidirAcaoCompanheiro(elira, { aliados: [], inimigos, jogador: heroiInteiro, rodada: 1 });
ok(["buff", "habilidade", "ataque"].includes(d2.tipo), `todos inteiros, rodada 1 → ${d2.tipo}${d2.habilidade ? " (" + d2.habilidade.nome + ")" : ""}`);

const semMana = garantirFichaCompanheiro({ nome: "Doran", conceito: "mercenário", nivel: 5, vida: 40, vidaMax: 40, mana: 0 });
const d3 = decidirAcaoCompanheiro(semMana, { aliados: [], inimigos, jogador: heroiInteiro, rodada: 5 });
ok(d3.tipo === "ataque", `sem PM → ${d3.tipo} (cai na arma)`);

const comPocao = garantirFichaCompanheiro({ nome: "Nyx", conceito: "gatuna", nivel: 4, vida: 8, vidaMax: 40, mana: 0, inventario: [itemConsumivel("cura_m")] });
const d4 = decidirAcaoCompanheiro(comPocao, { aliados: [], inimigos, jogador: heroiInteiro, rodada: 4 });
ok(d4.tipo === "pocao" && d4.alvo === "Nyx", `companheiro a 8/40 com poção na bolsa → ${d4.tipo} em ${d4.alvo}`);

console.log("\n[turno completo do grupo]");
const grupo = [elira, garantirFichaCompanheiro({ nome: "Doran", conceito: "mercenário veterano", nivel: 6, vida: 45, vidaMax: 45 })];
const acoes = turnoDosCompanheiros({ grupo, inimigos, jogadorCaido: true, jogadorNome: "Vera", jogador: { nome: "Vera", vida: 0, vidaMax: 90, morrendo: true, condicoes: [] }, rodada: 2 });
acoes.forEach(a => console.log(`  ${a.companheiro}: ${a.tipo}${a.habilidade ? " " + a.habilidade.nome : ""}${a.alvo ? " → " + a.alvo : ""}${a.alvoNome ? " → " + a.alvoNome : ""}${a.valor ? " (+" + a.valor + " PV)" : ""}`));
ok(acoes.some(a => a.tipo === "cura" && a.valor > 0), "com o herói caído, alguém cura DE VERDADE (com valor)");

console.log("\n[o que o Mestre lê]\n  " + resumoGrupoPrompt(grupo));

/* ---------------- O PM DO COMPANHEIRO NA TELA (v9.184) ----------------
   `painel-grupo-v2` desenha duas barras por membro, e foi ao trazer isso que
   apareceu o buraco: `companheiros.js` dá manaMax a todo companheiro desde
   sempre, o resumo que o Mestre lê já dizia "12/16 PM", e as habilidades
   deles cobram PM — mas o cartão do painel passava só vida. Quem comandava o
   grupo não tinha como saber se o curandeiro ainda podia curar. */
console.log("\n[o PM do companheiro chega ao painel]");
{
  const { readFileSync } = await import("node:fs");
  const APP = readFileSync("../src/App.jsx", "utf8");
  const c = garantirFichaCompanheiro({ nome: "Prova", classe: "Clérigo", nivel: 3 });
  ok(c.manaMax > 0, "o companheiro nasce com mana máxima");
  ok(c.mana != null, "e com mana de agora");
  /* o cartão só desenha a barra de mana quando manaMax chega — e chegava
     `undefined` para todo companheiro */
  ok(/\{manaMax != null && <BarraMini rotulo="PM"/.test(APP), "o cartão desenha PM quando recebe manaMax");
  ok(/nivel=\{m\.nivel\} vida=\{m\.vida\} vidaMax=\{m\.vidaMax\} mana=\{m\.mana\} manaMax=\{m\.manaMax\}/.test(APP),
    "e o painel do grupo passa os dois");
  /* o cabeçalho de `painel-grupo-v2`: o ponto vivo, e a contagem que o
     desenho não faz */
  ok(/O grupo de aventura · \{1 \+ \(personagem\.grupo \|\| \[\]\)\.filter\(\(g\) => !g\.invocada\)\.length\} de \{1 \+ MAX_COMPANHEIROS\}/.test(APP),
    "o cabeçalho conta quantos cabem ainda");
}
console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
