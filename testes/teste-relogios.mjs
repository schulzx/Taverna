import {
  TAMANHOS, MAX_RELOGIOS, TIPOS, GATILHOS, tipoDe,
  garantirRelogios, criarRelogio, temDaFonte, avancar, avancarUm, removerRelogio,
  semearRelogios, aceitarProposta, barraDe, linhaDoAvanco, envelopeCheio, envelopeNovo,
  resumoRelogiosPrompt,
} from "../src/relogios.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[1. O CATÁLOGO]");
ok(Object.keys(TIPOS).length === 4, "quatro tipos");
ok(Object.values(TIPOS).every((t) => t.icone && t.rotulo && t.cor && t.desc), "todos com ícone, rótulo, cor e explicação");
ok(TIPOS.ameaca.desc.includes("sozinha") && TIPOS.oportunidade.desc.includes("seu trabalho"),
   "a diferença central está escrita: ameaça enche sozinha, oportunidade só com o jogador");
ok(Object.keys(GATILHOS).length === 6, "seis gatilhos, todos deterministas");

console.log("\n[2. HIGIENE]");
ok(garantirRelogios(null).length === 0 && garantirRelogios("lixo").length === 0, "entrada inválida devolve lista vazia");
ok(garantirRelogios([{ nome: "x" }]).length === 0, "sem segmentos não vira relógio");
ok(garantirRelogios([{ nome: "x", segmentos: 7 }])[0].segmentos === 6, "tamanho fora da escala cai para 6");
ok(garantirRelogios([{ nome: "x", segmentos: 6, cheios: 99 }])[0].cheios === 6, "cheios não passa dos segmentos");
ok(garantirRelogios([{ nome: "x", segmentos: 6, cheios: -3 }])[0].cheios === 0, "nem fica negativo");
ok(garantirRelogios([{ nome: "x", segmentos: 6, tipo: "sei_la" }])[0].tipo === "ameaca", "tipo desconhecido vira ameaça");
ok(garantirRelogios([{ nome: "x", segmentos: 6, gatilho: "sei_la" }])[0].gatilho === "noite", "gatilho desconhecido vira noite");
ok(garantirRelogios(Array.from({ length: 20 }, (_, i) => ({ nome: "r" + i, segmentos: 6 }))).length === MAX_RELOGIOS, `nunca mais que ${MAX_RELOGIOS} na tela`);
ok(garantirRelogios([{ nome: "a".repeat(200), segmentos: 6 }])[0].nome.length === 60, "nome comprido é aparado");

console.log("\n[3. AVANÇAR]");
let l = [
  criarRelogio({ id: "r1", nome: "A nêmesis fecha o cerco", tipo: "cacada", segmentos: 4, gatilho: "noite" }),
  criarRelogio({ id: "r2", nome: "A ponte é reconstruída", tipo: "obra", segmentos: 6, gatilho: "sucesso" }),
];
const a1 = avancar(l, "noite", { porque: "mais uma noite passou" });
console.log("  " + linhaDoAvanco(a1.avancados[0]));
ok(a1.avancados.length === 1 && a1.avancados[0].relogio.id === "r1", "só o do gatilho certo anda");
ok(a1.relogios.find((r) => r.id === "r2").cheios === 0, "o outro fica parado — nada de tudo andar junto");
ok(/mais uma noite passou/.test(linhaDoAvanco(a1.avancados[0])), "todo avanço diz POR QUE aconteceu");
l = a1.relogios;
ok(avancar(l, "falha").avancados.length === 0, "gatilho sem relógio correspondente não faz nada");
const a2 = avancarUm(l, "r2", { quanto: 6, porque: "modo criativo" });
ok(a2.cheios.length === 1 && a2.relogios.every((r) => r.id !== "r2"), "o relógio que encheu SAI da lista — virou cena, e cena não fica pendurada");
ok(a2.avancados[0].para === 6, "e o avanço é aparado no total, não estoura");

console.log("\n[4. AS SEMENTES DO SISTEMA]");
const semNada = semearRelogios([], {});
ok(semNada.novos.length === 0, "mundo sem nêmesis, sem evento e sem guerra não inventa relógio");
const comOdio = semearRelogios([], { nemesis: { nome: "Brigid", odio: 75, status: "viva" }, dia: 10 });
console.log("  " + comOdio.novos.map((r) => `${r.nome} ${barraDe(r)} (${r.segmentos} passos)`).join(" · "));
ok(comOdio.novos.length === 1 && comOdio.novos[0].segmentos === 4, "ódio 75 gera um relógio CURTO — ela está perto");
ok(semearRelogios([], { nemesis: { nome: "Brigid", odio: 35, status: "viva" } }).novos[0].segmentos === 8, "ódio 35 gera um longo — ainda dá tempo");
ok(semearRelogios([], { nemesis: { nome: "Brigid", odio: 10, status: "viva" } }).novos.length === 0, "ódio baixo não vira ameaça nenhuma");
ok(semearRelogios([], { nemesis: { nome: "Brigid", odio: 90, status: "derrotada" } }).novos.length === 0, "nêmesis derrotada não caça ninguém");
ok(semearRelogios(comOdio.relogios, { nemesis: { nome: "Brigid", odio: 75, status: "viva" } }).novos.length === 0,
   "semear de novo NÃO duplica — é idempotente, e é o que deixa chamar a cada carregamento");
const comGlobal = semearRelogios([], { global: { nome: "A Praga Cinzenta", etapas: [1, 2, 3, 4, 5, 6] }, dia: 3 });
ok(comGlobal.novos[0].segmentos === 6, "o evento global vira relógio do tamanho das etapas dele");
const comGuarda = semearRelogios([], { fama: 80, emGuerra: "Ordem do Corvo", dia: 5 });
ok(comGuarda.novos.length === 1 && comGuarda.novos[0].gatilho === "viagem", "fama alta + guerra = caçada que anda quando você viaja");
ok(semearRelogios([], { fama: 80 }).novos.length === 0, "fama alta sem guerra não é caçada");
ok(semearRelogios([], { fama: 10, emGuerra: "Ordem do Corvo" }).novos.length === 0, "guerra sem fama também não");
const lotado = Array.from({ length: MAX_RELOGIOS }, (_, i) => criarRelogio({ id: "x" + i, nome: "r" + i, segmentos: 6 }));
ok(semearRelogios(lotado, { nemesis: { nome: "Brigid", odio: 90, status: "viva" } }).novos.length === 0, "com a tela cheia, o sistema não empurra mais nenhum");

console.log("\n[5. O QUE O MESTRE PODE PEDIR]");
const base = [criarRelogio({ id: "r1", nome: "O ritual da torre", segmentos: 6 })];
const bom = aceitarProposta(base, { nome: "A cheia do rio", tipo: "ameaca", segmentos: 8, gatilho: "noite", consequencia: "a ponte cede" }, 12);
ok(bom.ok && bom.relogio.segmentos === 8, "proposta bem formada é aceita");
ok(bom.relogio.fonte.startsWith("mestre:"), "e fica marcada como vinda do Mestre — nunca colide com as do sistema");
ok(!aceitarProposta(base, { nome: "O ritual da torre" }, 12).ok, "duplicata pelo nome é recusada");
ok(!aceitarProposta(base, {}, 12).ok && !aceitarProposta(base, null, 12).ok, "proposta sem nome é recusada");
ok(!aceitarProposta(lotado, { nome: "mais um" }, 12).ok, "com a tela cheia, recusa");
const torto = aceitarProposta(base, { nome: "X estranho", tipo: "apocalipse", segmentos: 99, gatilho: "quando eu quiser" }, 1);
ok(torto.ok && torto.relogio.tipo === "ameaca" && torto.relogio.segmentos === 6 && torto.relogio.gatilho === "noite",
   "proposta torta não é recusada: é APARADA para valores da casa — o Mestre sugere, o código decide");

console.log("\n[6. OS TEXTOS]");
const quase = criarRelogio({ id: "q", nome: "A nêmesis fecha o cerco", tipo: "cacada", segmentos: 4, consequencia: "Brigid te encontra." });
quase.cheios = 3;
ok(barraDe(quase) === "●●●○", `a barra desenha certo: ${barraDe(quase)}`);
const envC = envelopeCheio({ ...quase, cheios: 4 });
console.log("  " + envC.split("\n")[0].slice(0, 120));
ok(/ACONTECE agora/.test(envC) && /não adia/.test(envC), "o envelope de cheio é obrigatório e proíbe adiar");
ok(/o que você decide é a FORMA/i.test(envC), "e deixa claro o que sobra para o Mestre: a forma, não o se");
ok(!/relógio, ponteiro nem sistema/.test(envC.split("REGRA")[0]), "e ele é proibido de citar a mecânica");
ok(/Deixe isso PRESENTE/.test(envelopeNovo(quase)), "o envelope de abertura pede presença na ficção");

console.log("\n[7. O QUE VAI NO PROMPT A CADA TURNO]");
ok(resumoRelogiosPrompt([]) === "", "sem relógios, nada no prompt");
const res = resumoRelogiosPrompt([quase, criarRelogio({ id: "z", nome: "A ponte", tipo: "obra", segmentos: 8 })]);
console.log("  " + res.split("\n").slice(0, 3).join("\n  "));
ok(/QUASE LÁ/.test(res), "o que está a um passo é destacado");
ok(/NUNCA você/.test(res) && /nunca cite números/.test(res), "e o Mestre é proibido de mover o ponteiro e de citar números");
ok(res.length < 900, `enxuto: ${res.length} caracteres por turno`);

console.log("\n[8. REMOVER]");
ok(removerRelogio([quase], "q").length === 0, "remove pelo id");
ok(removerRelogio([quase], "nao_existe").length === 1, "id inexistente não apaga nada");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
