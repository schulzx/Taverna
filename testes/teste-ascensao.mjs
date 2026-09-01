import {
  identificarDivindadeAbatida, podeAbrirRito, iniciarRito, provaAtual, registrarProva,
  detectarAscensaoNarrada, resumoRitoPrompt, PROVAS_DEICIDIO,
} from "../src/ascensao.js";
import { garantirDivindade, grauDe, tituloDe, GRAUS } from "../src/divindades.js";
import { detectarPedidoDeTeste, dificuldadeDoPedido, envelopeDoTeste, tipoTestePorId, TIPOS_TESTE } from "../src/testes.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

/* ═══ O CASO RELATADO: semideus GD2 mata uma divindade GD3 ═══ */
console.log("\n[o caso relatado: GD2 derrota um GD3]");
const semideus = garantirDivindade({
  despertar: true, fieis: 12000, pf: 40,
  panteao: [{ nome: "Vharath", gd: 3, fieis: 240000, dominio: "das Tempestades", icone: "⛈" }],
});
ok(grauDe(semideus, 20) === 2, `o herói é GD ${grauDe(semideus, 20)} (Semideus) pelos 12.000 fiéis`);

const inimigos = [{ nome: "Vharath, o Trovão Antigo", vida: 0, derrotado: true, vidaMax: 900 }];
const alvo = identificarDivindadeAbatida(inimigos, semideus);
console.log("  abatido:", alvo && `${alvo.nome} GD ${alvo.gd} · ${alvo.fieis} fiéis`);
ok(alvo && alvo.nome === "Vharath" && alvo.gd === 3, "o sistema reconhece o deus abatido pelo panteão");
ok(identificarDivindadeAbatida([{ nome: "Orc Batedor", derrotado: true }], semideus) === null, "um orc não abre rito nenhum");
ok(identificarDivindadeAbatida([{ nome: "Avatar de Kaelis", derrotado: true }], semideus) !== null, "criatura anunciada como divina também conta");
ok(identificarDivindadeAbatida([{ nome: "Vharath", vida: 300 }], semideus) === null, "deus VIVO não abre rito");

const chk = podeAbrirRito(semideus, alvo, 20);
ok(chk.pode, `o rito abre${chk.pode ? "" : `: ${chk.motivo}`}`);
ok(!podeAbrirRito(semideus, { nome: "X", gd: 1, fieis: 0 }, 20).pode, "matar um grau menor não abre rito");
ok(!podeAbrirRito(semideus, alvo, 14).pode, `no nível 14 o teto de GD trava: "${podeAbrirRito(semideus, alvo, 14).motivo}"`);
ok(grauDe(semideus, 16) === 2, "o teto por nível guarda a PORTA da ascensão — não rebaixa quem já é GD 2 num save antigo");

console.log("\n[as três provas]");
let dv = iniciarRito(semideus, alvo, "deicidio");
for (let i = 0; i < 3; i++) {
  const p = provaAtual(dv);
  console.log(`  prova ${p.indice + 1}/${p.total}: ${p.nome} — ${tipoTestePorId(p.teste).rotulo} vs dif. ${p.dificuldade}`);
  const r = registrarProva(dv, true, 20);
  dv = r.divindade;
  console.log(`    → ${r.desfecho}: ${r.texto}`);
  if (i < 2) ok(r.desfecho === "avancou", "avança sem conceder poder nenhum");
  else ok(r.desfecho === "ascendeu", "só a terceira prova consuma a ascensão");
}
ok(grauDe(dv, 20) === 3, `agora o SISTEMA diz GD ${grauDe(dv, 20)} — ${tituloDe(grauDe(dv, 20))}`);
ok(dv.fieis === semideus.fieis + Math.round(240000 * 0.5), `herdou ${dv.fieis - semideus.fieis} fiéis do morto`);
ok(!dv.panteao.some((d) => d.nome === "Vharath"), "Vharath saiu do panteão");
ok(dv.deicidios.length === 1, "o deicídio fica registrado (o culto dele vira inimigo)");
ok(dv.rito === null, "o rito se fecha");

console.log("\n[falhar numa prova encerra tudo]");
let dv2 = iniciarRito(semideus, alvo, "deicidio");
dv2 = registrarProva(dv2, true, 20).divindade;
const rf = registrarProva(dv2, false, 20);
console.log(`  ${rf.texto}`);
ok(rf.desfecho === "falhou" && rf.divindade.rito === null, "o rito acaba na primeira falha");
ok(grauDe(rf.divindade, 20) === 2, `e o herói continua GD ${grauDe(rf.divindade, 20)}`);
ok(/NÃO ascendi/.test(rf.nota) && /segunda chance/.test(rf.nota), "o envelope proíbe o Mestre de dar segunda chance");

console.log("\n[cão de guarda: o Mestre narrando o que o sistema não deu]");
const narracoes = [
  "O poder de Vharath entra em você e, no instante seguinte, você se torna uma divindade.",
  "Você absorve o domínio das tempestades e ascende a deus diante dos que restaram.",
  "Sua ascensão está completa.",
];
for (const n of narracoes) {
  const av = detectarAscensaoNarrada(n, semideus, 20);
  console.log(`  "${n.slice(0, 52)}…" → ${av ? `CORRIGIDO (GD ${av.gd})` : "passou batido"}`);
  if (!av) { falhas++; console.log("    FALHA: devia ter sido pego"); }
}
ok(detectarAscensaoNarrada("Você sente o poder dele pairando, sem dono.", semideus, 20) === null, "narração correta (poder solto) não gera correção");
ok(detectarAscensaoNarrada(narracoes[0], dv, 20) !== null, "mesmo já ascendido a frase é sinalizada — o sistema fala o grau real");
const emRito = detectarAscensaoNarrada(narracoes[0], iniciarRito(semideus, alvo), 20);
ok(emRito && emRito.emRito && /RITO AINDA ESTÁ EM CURSO/.test(emRito.nota), "durante o rito a correção diz qual prova falta");
console.log("  rodapé:", resumoRitoPrompt(iniciarRito(semideus, alvo), 20).slice(0, 130) + "…");

/* ═══ TESTES PEDIDOS PELO JOGADOR ═══ */
console.log("\n[o jogador pedindo teste em linguagem natural]");
const frases = [
  ["peço teste de percepção para ver se encontro algo na sala", "percepcao"],
  ["antes de começar a batalha peço um teste de inteligência pra descobrir a fraqueza do inimigo", "intelecto"],
  ["quero rolar um teste de persuasão para convencer o guarda", "presenca"],
  ["posso fazer um teste de atletismo para arrombar a porta?", "forca"],
  ["faço um teste de furtividade para me esgueirar", "destreza"],
  ["peço um teste de vigor para aguentar o veneno", "vigor"],
];
for (const [f, esperado] of frases) {
  const d = detectarPedidoDeTeste(f);
  console.log(`  "${f.slice(0, 48)}…" → ${d ? `${d.tipo}${d.motivo ? ` (motivo: ${d.motivo.slice(0, 34)})` : ""}` : "—"}`);
  if (!d || d.tipo !== esperado) { falhas++; console.log(`    FALHA: esperava ${esperado}`); }
}
ok(detectarPedidoDeTeste("ataco o orc com a espada") === null, "ação comum não vira pedido de teste");
ok(detectarPedidoDeTeste("pergunto ao ferreiro sobre a espada") === null, "conversa comum também não");

console.log("\n[dificuldade fixada pelo sistema]");
for (const ctx of [
  { rot: "sala calma, nv 1", args: {} },
  { rot: "sala calma, nv 20", args: { nivel: 20 } },
  { rot: "masmorra, nv 20", args: { nivel: 20, emMasmorra: true } },
  { rot: "combate c/ chefe nv 20", args: { nivel: 20, emCombate: true, emMasmorra: true, nivelAmeaca: 20 } },
]) {
  const d = dificuldadeDoPedido(ctx.args);
  console.log(`  ${ctx.rot.padEnd(26)} dif. ${d.dc} — ${d.porque}`);
}
ok(dificuldadeDoPedido({ nivel: 20, emCombate: true, nivelAmeaca: 20 }).dc > dificuldadeDoPedido({ nivel: 20 }).dc, "no meio da luta o teste é mais difícil");
ok(dificuldadeDoPedido({}).dc === dificuldadeDoPedido({}).dc, "a mesma situação dá sempre a mesma dificuldade");

console.log("\n[o envelope: falhou = o Mestre não inventa nada]");
const falhou = envelopeDoTeste({ tipo: "percepcao", motivo: "achar algo na sala", valor: 4, mod: 6, total: 10, dc: 15, resultado: "falha", critico: false, desastre: false });
const passou = envelopeDoTeste({ tipo: "intelecto", motivo: "descobrir a fraqueza do dragão", valor: 17, mod: 8, total: 25, dc: 17, resultado: "sucesso", critico: false, desastre: false });
console.log("  falha  :", falhou.split("\n")[1].slice(0, 150) + "…");
console.log("  sucesso:", passou.split("\n")[1].slice(0, 150) + "…");
ok(/NÃO revela nada/.test(falhou) && /meia-informação/.test(falhou), "a falha proíbe revelar, insinuar ou consolar");
ok(/UMA coisa concreta/.test(passou) && /nunca uma novidade conveniente/.test(passou), "o sucesso entrega uma coisa que JÁ existia, não um presente");
ok(/falha crítica/.test(envelopeDoTeste({ tipo: "forca", motivo: "", valor: 1, mod: 3, total: 4, dc: 15, resultado: "falha", critico: false, desastre: true })), "o 1 natural cobra um custo extra");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
