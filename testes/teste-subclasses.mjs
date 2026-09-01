import { CLASSES, classePorNome, arvoreDaClasse, arvoreDaSubclasse, ranksDoPersonagem, pontosDisponiveis, podePegarHabilidade, podeEscolherSubclasse, subclasseEscolhida, custoEmPontos, custoJaGasto, fichaDaHabilidade, classeDaHabilidade, habilidadesDaSubclasse, RANK_PARA_SUBCLASSE } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[cobertura] toda subclasse tem árvore?");
let faltando = [];
for (const c of CLASSES) for (const s of c.subclasses || []) if (!SUBCLASSES[s.nome]) faltando.push(`${c.nome}/${s.nome}`);
ok(faltando.length === 0, faltando.length ? `faltam: ${faltando.join(", ")}` : `${Object.keys(SUBCLASSES).length} subclasses, todas com 4 habilidades`);
ok(Object.values(SUBCLASSES).every((l) => l.length === 4), "todas com exatamente 4");

console.log("\n[custo por degrau]");
for (const n of [1, 3, 4, 7, 8, 9]) console.log(`  degrau ${n} → ${custoEmPontos({ nivel: n })} ponto(s)`);
ok(custoEmPontos({ nivel: 1 }) === 1 && custoEmPontos({ nivel: 5 }) === 2 && custoEmPontos({ nivel: 9 }) === 3, "1/2/3 conforme o degrau");

/* simulador: gasta pontos numa classe até não dar mais */
const aprender = (p, cls, nome) => {
  const h = fichaDaHabilidade(nome);
  const chk = podePegarHabilidade(p, cls, h);
  if (!chk.pode) return { p, erro: chk.motivo };
  return { p: { ...p, habilidades: [...p.habilidades, { nome: h.nome }], pontosHab: pontosDisponiveis(p) - custoEmPontos(h) }, erro: null };
};

console.log("\n[o nível 20 NÃO compra tudo]");
let p = { nome: "Vera", nivel: 20, classe: "Mago", habilidades: [], pontosHab: 20, moedas: 999, subclasses: {} };
const arvoreMago = classePorNome("Mago").habilidades;
const custoTotalBase = arvoreMago.reduce((s, h) => s + custoEmPontos(h), 0);
console.log(`  árvore base do Mago: ${arvoreMago.length} habilidades, ${custoTotalBase} pontos para tudo (o herói tem 20)`);
ok(custoTotalBase > 20, "a árvore base sozinha já custa mais do que 20 pontos");

let atual = p, pegas = 0;
for (const h of [...arvoreMago].sort((a, b) => a.nivel - b.nivel)) {
  const r = aprender(atual, "Mago", h.nome);
  if (!r.erro) { atual = r.p; pegas++; }
}
console.log(`  gastando tudo no básico: ${pegas} habilidades, sobram ${pontosDisponiveis(atual)} pontos`);

console.log("\n[subclasse abre no degrau 3]");
let novato = { nome: "V", nivel: 20, classe: "Mago", habilidades: [], pontosHab: 20, subclasses: {} };
ok(!podeEscolherSubclasse(novato, "Mago").pode, "sem degraus: " + podeEscolherSubclasse(novato, "Mago").motivo);
let comTres = novato;
for (const h of arvoreMago.filter((x) => x.nivel <= 2).slice(0, 3)) comTres = aprender(comTres, "Mago", h.nome).p;
ok(ranksDoPersonagem(comTres).Mago === 3, `com 3 habilidades → rank ${ranksDoPersonagem(comTres).Mago}`);
ok(podeEscolherSubclasse(comTres, "Mago").pode, "agora dá para escolher a subclasse");

console.log("\n[uma subclasse só, e ela trava as outras]");
const escolhido = { ...comTres, subclasses: { Mago: "Elementalista" } };
ok(subclasseEscolhida(escolhido, "Mago") === "Elementalista", "seguiu Elementalista");
const habNecro = habilidadesDaSubclasse("Necromante")[0];
const chkNecro = podePegarHabilidade(escolhido, "Mago", habNecro);
ok(!chkNecro.pode, `"${habNecro.nome}" (Necromante) travada: ${chkNecro.motivo}`);
const habElem = habilidadesDaSubclasse("Elementalista")[0];
ok(podePegarHabilidade(escolhido, "Mago", habElem).pode, `"${habElem.nome}" liberada no degrau ${habElem.nivel}`);
const habElemAlta = habilidadesDaSubclasse("Elementalista")[3];
ok(!podePegarHabilidade(escolhido, "Mago", habElemAlta).pode, `"${habElemAlta.nome}" ainda não: ${podePegarHabilidade(escolhido, "Mago", habElemAlta).motivo}`);

console.log("\n[a habilidade de subclasse sobe a classe-mãe]");
ok(classeDaHabilidade("Fúria Sangrenta") === "Guerreiro", "\"Fúria Sangrenta\" conta como Guerreiro");
ok(classeDaHabilidade("Lança de Gelo") === "Mago", "\"Lança de Gelo\" conta como Mago");

console.log("\n[quanto custa a build completa de uma classe + subclasse]");
const custoSub = habilidadesDaSubclasse("Elementalista").reduce((s, h) => s + custoEmPontos(h), 0);
console.log(`  Mago base ${custoTotalBase} + Elementalista ${custoSub} = ${custoTotalBase + custoSub} pontos para 100% (nível 20 tem 20)`);
ok(custoTotalBase + custoSub > 26, "nem no nível 20 dá para ter classe e subclasse inteiras");

console.log("\n[árvore como a interface vê — Elementalista]");
arvoreDaSubclasse(escolhido, "Mago").forEach((h) => console.log(`  ${h.dominada ? "✓" : h.pode ? "○" : "🔒"} ${h.nome} (degrau ${h.nivel}, ${h.custoPontos}pt)${!h.pode && !h.dominada ? " — " + h.motivo : ""}`));

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
