import { REACOES, reacoesDe, escolherReacao, resolverReacao, resumoReacoesPrompt } from "../src/reacoes.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[quem tem o quê]");
for (const [classe, esperada] of [["Mago", "escudo_arcano"], ["Guerreiro", "aparar"], ["Ladino", "esquiva_agil"], ["Clérigo", "aparar"]]) {
  const rs = reacoesDe({ classe, habilidades: [] });
  console.log(`  ${classe.padEnd(10)} ${rs.map((r) => r.nome).join(", ") || "nenhuma"}`);
  ok(rs.some((r) => r.id === esperada), `${classe} tem ${esperada}`);
}

console.log("\n[o sistema não gasta reação com arranhão]");
const mago = { classe: "Mago", nivel: 20, vidaMax: 100, mana: 20, habilidades: [] };
let usouPequeno = 0, usouGrande = 0;
for (let i = 0; i < 300; i++) { if (escolherReacao({ pers: mago, gatilho: "sofre_dano", dano: 3 })) usouPequeno++; }
for (let i = 0; i < 300; i++) { if (escolherReacao({ pers: mago, gatilho: "sofre_dano", dano: 30 })) usouGrande++; }
console.log(`  golpe de 3 PV: reagiu ${usouPequeno}/300 · golpe de 30 PV: reagiu ${usouGrande}/300`);
ok(usouPequeno === 0, "arranhão não consome a reação");
ok(usouGrande > 250, "golpe pesado sempre merece reação");

console.log("\n[sem PM não ergue escudo]");
ok(!escolherReacao({ pers: { ...mago, mana: 0 }, gatilho: "sofre_dano", dano: 30 }), "mago sem mana não usa Escudo Arcano");
ok(!!escolherReacao({ pers: { classe: "Guerreiro", vidaMax: 100, mana: 0, habilidades: [] }, gatilho: "sofre_dano", dano: 30 }), "guerreiro apara sem gastar PM");

console.log("\n[quanto corta]");
const esc = escolherReacao({ pers: mago, gatilho: "sofre_dano", dano: 40 });
const r1 = resolverReacao(esc, { pers: mago, dano: 40, atacante: "Dragão" });
console.log("  " + r1.texto);
ok(r1.danoFinal < 40 && r1.danoFinal >= 0, `escudo arcano cortou ${r1.cortou} de 40`);
const guer = { classe: "Guerreiro", nivel: 20, vidaMax: 120, mana: 0, habilidades: [] };
const r2 = resolverReacao(escolherReacao({ pers: guer, gatilho: "sofre_dano", dano: 40 }), { pers: guer, dano: 40, atacante: "Ogro" });
ok(r2.danoFinal === 20, `aparar corta metade: 40 → ${r2.danoFinal}`);

console.log("\n[contra-ataque quando o inimigo erra]");
let contra = 0;
for (let i = 0; i < 300; i++) { const e = escolherReacao({ pers: guer, gatilho: "inimigo_erra", dano: 0 }); if (e && e.contraAtaca) contra++; }
console.log(`  errou o golpe: revidou ${contra}/300 vezes`);
ok(contra > 100 && contra < 250, "revide acontece às vezes, não sempre");
ok(!escolherReacao({ pers: mago, gatilho: "inimigo_erra", dano: 0 }), "mago não revida com a lâmina");

console.log("\n[o que o Mestre lê]\n  " + resumoReacoesPrompt(guer));
console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
