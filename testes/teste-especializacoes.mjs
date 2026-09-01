import { ESPECIALIZACOES, habilidadesDaEspecializacao, especializacaoDaHabilidade, RANK_PARA_ESPECIALIZACAO, DEGRAUS_ESPECIALIZACAO } from "../src/especializacoes.js";
import { SUBCLASSES, habilidadesDaSubclasse } from "../src/subclasses.js";
import {
  CLASSES, classeDaHabilidade, fichaDaHabilidade, custoEmPontos, pontosTotais,
  especializacoesDaSubclasse, subclasseDaEspecializacao, podePegarHabilidade,
  arvoreDaEspecializacao, podeEscolherEspecializacao, ranksDoPersonagem,
} from "../src/classes.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[cobertura: toda subclasse tem as duas especializações escritas]");
const declaradas = [];
for (const c of CLASSES) for (const s of c.subclasses || []) for (const e of s.especializacoes || []) declaradas.push({ classe: c.nome, sub: s.nome, esp: e });
console.log(`  ${CLASSES.length} classes · ${Object.keys(SUBCLASSES).length} subclasses · ${declaradas.length} especializações declaradas`);
const semArvore = declaradas.filter((d) => !ESPECIALIZACOES[d.esp]);
ok(semArvore.length === 0, `todas têm árvore${semArvore.length ? ` — faltam: ${semArvore.map((d) => d.esp).join(", ")}` : ""}`);
const orfas = Object.keys(ESPECIALIZACOES).filter((e) => !declaradas.some((d) => d.esp === e));
ok(orfas.length === 0, `nenhuma árvore órfã${orfas.length ? ` — sobrando: ${orfas.join(", ")}` : ""}`);
const totalHabs = Object.values(ESPECIALIZACOES).reduce((s, l) => s + l.length, 0);
ok(totalHabs === declaradas.length * 3, `${totalHabs} habilidades novas (3 por especialização)`);

console.log("\n[nomes: nada pode colidir, senão a busca por nome pega a errada]");
const vistos = new Map();
const dup = [];
const reg = (nome, onde) => { const k = nome.toLowerCase(); if (vistos.has(k)) dup.push(`"${nome}" (${vistos.get(k)} e ${onde})`); else vistos.set(k, onde); };
for (const c of CLASSES) for (const h of c.habilidades) reg(h.nome, `classe ${c.nome}`);
for (const [sub, lista] of Object.entries(SUBCLASSES)) for (const h of lista) reg(h.nome, `subclasse ${sub}`);
const antes = dup.length;
for (const [esp, lista] of Object.entries(ESPECIALIZACOES)) for (const h of lista) reg(h.nome, `especialização ${esp}`);
const novas = dup.slice(antes);
if (antes) console.log(`  (${antes} colisão(ões) já existiam antes desta entrega: ${dup.slice(0, antes).join(" · ")})`);
ok(novas.length === 0, `nenhum nome NOVO colide${novas.length ? ` — ${novas.join(" · ")}` : ""}`);

console.log("\n[ligação com a classe-mãe]");
for (const d of declaradas.slice(0, 4)) {
  const h = habilidadesDaEspecializacao(d.esp)[0];
  const cls = classeDaHabilidade(h.nome);
  console.log(`  ${d.esp.padEnd(22)} "${h.nome}" → ${cls}`);
  if (cls !== d.classe) { falhas++; console.log(`    FALHA: devia ser ${d.classe}`); }
}
const erradas = declaradas.filter((d) => habilidadesDaEspecializacao(d.esp).some((h) => classeDaHabilidade(h.nome) !== d.classe));
ok(erradas.length === 0, `as ${totalHabs} habilidades sobem a classe certa${erradas.length ? ` — erradas: ${erradas.map((d) => d.esp).join(", ")}` : ""}`);
ok(subclasseDaEspecializacao("Piromante") === "Elementalista", "Piromante pertence a Elementalista");
ok(especializacoesDaSubclasse("Bárbaro").length === 2, "toda subclasse oferece duas — e o jogador segue uma");
const f = fichaDaHabilidade("Estrela Ígnea");
ok(f && f.nivel === DEGRAUS_ESPECIALIZACAO[2] && f.especializacao === "Piromante", `fichaDaHabilidade acha a habilidade de especialização (degrau ${f && f.nivel})`);

console.log("\n[alcance: dá para chegar ao terceiro andar?]");
for (const c of CLASSES) {
  const base = c.habilidades.length;
  const sub = 4;
  const teto = base + sub + 3;
  const marca = teto >= DEGRAUS_ESPECIALIZACAO[2] ? "ok" : "INALCANÇÁVEL";
  if (teto < DEGRAUS_ESPECIALIZACAO[2]) falhas++;
  console.log(`  ${c.nome.padEnd(12)} ${base} base + ${sub} sub + 3 esp = rank máx ${teto} (precisa de ${DEGRAUS_ESPECIALIZACAO[2]}) — ${marca}`);
}

console.log("\n[orçamento: fundo OU largo, nunca os dois]");
const custoDaArvore = (habs) => habs.reduce((s, h) => s + custoEmPontos(h), 0);
const guerreiro = CLASSES.find((c) => c.nome === "Guerreiro");
const custoClasse = custoDaArvore(guerreiro.habilidades);
const custoSub = custoDaArvore(habilidadesDaSubclasse("Bárbaro"));
const custoEsp = custoDaArvore(habilidadesDaEspecializacao("Fúria Ancestral"));
const fundo = custoClasse + custoSub + custoEsp;
const orc = pontosTotais(20);
console.log(`  ir FUNDO (Guerreiro inteiro + Bárbaro + Fúria Ancestral): ${custoClasse}+${custoSub}+${custoEsp} = ${fundo} de ${orc} pontos`);
ok(fundo <= orc, "a build especialista cabe no nível 20");
const mago = CLASSES.find((c) => c.nome === "Mago");
const largo = custoDaArvore(mago.habilidades) + custoDaArvore(habilidadesDaSubclasse("Elementalista")) + custoClasse + custoSub;
console.log(`  ir LARGO (Mago+Elementalista e Guerreiro+Bárbaro): ${largo} de ${orc} pontos`);
ok(fundo + custoDaArvore(mago.habilidades) > orc, "somar especialização E uma segunda classe inteira NÃO cabe — a escolha é real");

console.log("\n[portas: a especialização exige subclasse e dez degraus]");
const novato = { nivel: 20, classe: "Guerreiro", habilidades: [{ nome: "Golpe Poderoso" }], subclasses: {}, especializacoes: {}, pontosHab: 50 };
const c1 = podeEscolherEspecializacao(novato, "Guerreiro");
ok(!c1.pode && /subclasse/.test(c1.motivo), `sem subclasse não abre: "${c1.motivo}"`);
const comSub = { ...novato, subclasses: { Guerreiro: "Bárbaro" } };
const c2 = podeEscolherEspecializacao(comSub, "Guerreiro");
ok(!c2.pode && /10 degraus/.test(c2.motivo), `com 1 degrau ainda não: "${c2.motivo}"`);
const veterano = {
  nivel: 20, classe: "Guerreiro", pontosHab: 50,
  subclasses: { Guerreiro: "Bárbaro" }, especializacoes: {},
  habilidades: guerreiro.habilidades.slice(0, 10).map((h) => ({ nome: h.nome })),
};
const c3 = podeEscolherEspecializacao(veterano, "Guerreiro");
ok(c3.pode, `com ${ranksDoPersonagem(veterano).Guerreiro} degraus abre`);
const escolhido = { ...veterano, especializacoes: { Guerreiro: "Fúria Ancestral" } };
const arv = arvoreDaEspecializacao(escolhido, "Guerreiro");
console.log("  árvore:", arv.map((h) => `${h.nome} (deg ${h.nivel}, ${h.custoPontos}p, ${h.pode ? "livre" : h.motivo})`).join(" · "));
ok(arv.length === 3 && arv[0].pode, "a primeira habilidade da especialização já está liberada");
ok(!arv[2].pode && /14 degraus/.test(arv[2].motivo), "a última ainda pede mais estrada");
const outraEsp = podePegarHabilidade(escolhido, "Guerreiro", habilidadesDaEspecializacao("Devorador")[0]);
ok(!outraEsp.pode && /Fúria Ancestral/.test(outraEsp.motivo), `a especialização rival fica fechada: "${outraEsp.motivo}"`);

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
