import {
  escolaDaHabilidade, naturezaDaHabilidade, elementoDaHabilidade, escopoDoEfeito,
  efeitoVale, bonusDeDano, buffsIgnorados, detectarCombo, combosPossiveis, resumoCombosPrompt, ESCOLAS,
} from "../src/combos.js";
import { fichaDaHabilidade, CLASSES } from "../src/classes.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const H = (n) => fichaDaHabilidade(n) || { nome: n };

const mg = { nome: "Vera", nivel: 20, classe: "Mago", habilidades: [], efeitos: [] };

console.log("\n[escola de cada classe]");
for (const c of CLASSES) {
  const h = c.habilidades[0];
  const e = escolaDaHabilidade(h, mg);
  console.log(`  ${c.nome.padEnd(12)} "${h.nome}" → ${ESCOLAS[e].icone} ${ESCOLAS[e].nome} (${ESCOLAS[e].natureza})`);
}
ok(naturezaDaHabilidade(H("Fúria de Batalha"), mg) === "fisico", "Fúria de Batalha é física");
ok(naturezaDaHabilidade(H("Bola de Fogo"), mg) === "magico", "Bola de Fogo é mágica");

console.log("\n[elementos]");
for (const n of ["Rajada de Fogo", "Toque Gélido", "Corrente de Raios", "Lâmina Envenenada", "Luz Sagrada"]) {
  console.log(`  ${n.padEnd(22)} → ${elementoDaHabilidade(H(n))}`);
}
ok(elementoDaHabilidade(H("Rajada de Fogo")) === "fogo", "fogo reconhecido");
ok(elementoDaHabilidade(H("Toque Gélido")) === "gelo", "gelo reconhecido");

console.log("\n[A PERGUNTA DO JOGADOR: fúria aumenta magia?]");
const furioso = {
  ...mg,
  efeitos: [
    { nome: "Fúria de Batalha", bonus: 4, turnos: 3 },
    { nome: "Bênção", bonus: 2, turnos: 5 },
    { nome: "Manto Flamejante", bonus: 3, turnos: 4 },
  ],
};
const noGolpe = bonusDeDano(furioso, H("Golpe Poderoso"));
const naMagia = bonusDeDano(furioso, H("Bola de Fogo"));
console.log(`  golpe de guerreiro: +${noGolpe.bonus} (${noGolpe.fontes.join(", ")})`);
console.log(`  magia de mago:      +${naMagia.bonus} (${naMagia.fontes.join(", ")})`);
console.log(`  ignorados na magia: ${buffsIgnorados(furioso, H("Bola de Fogo")).join(", ") || "nenhum"}`);
ok(noGolpe.fontes.includes("Fúria de Batalha"), "Fúria soma no golpe físico");
ok(!naMagia.fontes.includes("Fúria de Batalha"), "Fúria NÃO soma na magia — era exatamente a dúvida");
ok(naMagia.fontes.includes("Bênção"), "Bênção vale para tudo (é a exceção universal)");
ok(naMagia.fontes.includes("Manto Flamejante"), "buff arcano soma na magia");
ok(!noGolpe.fontes.includes("Manto Flamejante"), "e não soma no golpe de espada");
ok(escopoDoEfeito({ nome: "Qualquer coisa", escopo: "fisico" }, mg) === "fisico", "escopo explícito manda");

console.log("\n[combos]");
const casos = [
  [["Rajada de Fogo", "Toque Gélido"], "choque_termico"],
  [["Toque Gélido", "Corrente de Raios"], "condutor"],
  [["Projétil Arcano", "Golpe Poderoso"], "golpe_encantado"],
  [["Fúria de Batalha", "Golpe Poderoso"], "furia_canalizada"],
  [["Projétil Arcano", "Bola de Fogo"], "ressonancia"],
  [["Golpe Poderoso", "Investida"], "sequencia"],
  [["Ler Auras", "Luz Sagrada"], "abertura"],
];
for (const [nomes, esperado] of casos) {
  const c = detectarCombo(nomes.map(H), mg);
  const id = c ? c.id : "—";
  console.log(`  ${nomes.join(" → ").padEnd(42)} ${c ? `${c.icone} ${c.nome} ×${c.mult}` : "sem combo"}`);
  if (id !== esperado) { falhas++; console.log(`    FALHA: esperava ${esperado}, veio ${id}`); }
}
ok(detectarCombo([H("Golpe Poderoso")], mg) === null, "uma habilidade só não faz combo");
ok(detectarCombo([H("Ler Auras"), H("Passo Étereo")], mg) === null, "duas utilidades sem ataque não fazem combo");

const c = detectarCombo([H("Projétil Arcano"), H("Golpe Poderoso")], mg);
console.log("  texto :", c.texto);
console.log("  nota  :", c.nota.slice(0, 120) + "…");
ok(/RESOLVIDO PELO SISTEMA/.test(c.nota), "a nota ao Mestre marca o envelope");

console.log("\n[o que a build permite]");
const espadamago = {
  ...mg,
  habilidades: [H("Projétil Arcano"), H("Rajada de Fogo"), H("Toque Gélido"), H("Golpe Poderoso"), H("Fúria de Batalha")],
};
for (const p of combosPossiveis(espadamago)) console.log(`  ${p.icone} ${p.nome.padEnd(18)} ×${p.mult}  ex: ${p.exemplo}`);
ok(combosPossiveis(espadamago).some((x) => x.id === "golpe_encantado"), "o mago-guerreiro enxerga o Golpe Encantado na ficha dele");
ok(combosPossiveis({ ...mg, habilidades: [H("Projétil Arcano")] }).length === 0, "ficha com uma habilidade só não lista combo");
console.log("  prompt:", resumoCombosPrompt(espadamago).slice(0, 150) + "…");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
