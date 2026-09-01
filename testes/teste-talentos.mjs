import { CLASSES, arvoreDaClasse, ranksDoPersonagem, pontosDisponiveis, podePegarHabilidade, custoRespec, classeDaHabilidade, classePorNome } from "../src/classes.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const guerreiro = classePorNome("Guerreiro"), mago = classePorNome("Mago");
const aprender = (p, cls, nome) => {
  const h = classePorNome(cls).habilidades.find((x) => x.nome === nome);
  const chk = podePegarHabilidade(p, cls, h);
  if (!chk.pode) return { p, erro: chk.motivo };
  return { p: { ...p, habilidades: [...p.habilidades, { nome: h.nome, custo: h.custo }], pontosHab: pontosDisponiveis(p) - 1 }, erro: null };
};

console.log("\n[pontos]");
let p = { nome: "Vera", nivel: 1, classe: "Guerreiro", habilidades: [], moedas: 500 };
ok(pontosDisponiveis(p) === 1, `nível 1 sem habilidade → ${pontosDisponiveis(p)} ponto`);
p = { ...p, nivel: 20, pontosHab: 20 };
ok(pontosDisponiveis(p) === 20, "nível 20 → 20 pontos");

console.log("\n[a árvore trava o que não foi construído]");
const alto = guerreiro.habilidades.find((h) => h.nivel >= 6);
ok(!podePegarHabilidade(p, "Guerreiro", alto).pode, `sem degraus, "${alto.nome}" (nv ${alto.nivel}) está travada: ${podePegarHabilidade(p, "Guerreiro", alto).motivo}`);
const base = guerreiro.habilidades.find((h) => h.nivel === 1);
ok(podePegarHabilidade(p, "Guerreiro", base).pode, `"${base.nome}" (nv 1) está liberada`);

console.log("\n[construindo 10 de guerreiro]");
let atual = p;
let pegas = 0;
for (const h of [...guerreiro.habilidades].sort((a, b) => a.nivel - b.nivel)) {
  const r = aprender(atual, "Guerreiro", h.nome);
  if (!r.erro) { atual = r.p; pegas++; }
}
console.log(`  pegou ${pegas} habilidades de Guerreiro · rank: ${JSON.stringify(ranksDoPersonagem(atual))} · pontos restantes: ${pontosDisponiveis(atual)}`);
ok(ranksDoPersonagem(atual).Guerreiro === pegas, "os degraus batem com as habilidades pegas");

console.log("\n[multiclasse]");
const r1 = aprender(atual, "Mago", mago.habilidades.find((h) => h.nivel === 1).nome);
ok(!r1.erro, "com ponto sobrando, dá para abrir Mago do zero");
const comDuas = r1.p;
const ranks = ranksDoPersonagem(comDuas);
console.log(`  agora: ${Object.entries(ranks).map(([k, v]) => k + " " + v).join(" · ")}`);
ok(ranks.Mago === 1 && ranks.Guerreiro > 1, "é guerreiro E mago");
const magoAlto = mago.habilidades.find((h) => h.nivel === 4);
ok(!podePegarHabilidade(comDuas, "Mago", magoAlto).pode, `mas ainda não alcança "${magoAlto.nome}": ${podePegarHabilidade(comDuas, "Mago", magoAlto).motivo}`);

console.log("\n[sem pontos]");
const semPontos = { ...comDuas, pontosHab: 0 };
const naoTem = mago.habilidades.find((h) => h.nivel === 1 && !comDuas.habilidades.some((x) => x.nome === h.nome));
ok(!podePegarHabilidade(semPontos, "Mago", naoTem).pode, "sem ponto não aprende nada: " + podePegarHabilidade(semPontos, "Mago", naoTem).motivo);

console.log("\n[respec]");
const unica = { ...comDuas, habilidades: [...comDuas.habilidades, { nome: "Sopro do Ancião", custo: 8, unica: true }] };
const mantidas = unica.habilidades.filter((h) => !classeDaHabilidade(h.nome));
ok(mantidas.length === 1 && mantidas[0].nome === "Sopro do Ancião", "o respec preserva habilidades únicas (não são de catálogo)");
console.log(`  custo no nível 20: ◉ ${custoRespec(20)} · no nível 5: ◉ ${custoRespec(5)}`);
ok(custoRespec(20) > custoRespec(5) && custoRespec(20) < 1000, "custo escala com o nível sem ficar proibitivo");

console.log("\n[a árvore como a interface vê]");
arvoreDaClasse(comDuas, "Mago").slice(0, 6).forEach((h) => console.log(`  ${h.dominada ? "✓" : h.pode ? "○" : "🔒"} ${h.nome} (degrau ${h.nivel})${!h.dominada && !h.pode ? " — " + h.motivo : ""}`));
console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
