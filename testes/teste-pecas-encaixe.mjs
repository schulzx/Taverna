/* AS PEÇAS · O ENCAIXE (17/11/2026, Fase A da prova) — src/pecas/encaixe.js

   Decisão da pessoa: só dois estados — a frase aciona UMA solução, ou é
   aquecimento (e nunca «A ou B?»). As saídas universais (ir, descansar,
   comprar, abrir painel, falar com o Mestre) seguem o jogo de hoje.
   §1 a solução: a ação lida está na peça e o alvo na cena;
   §2 o aquecimento: o alvo fora da cena, a frase que cabe em duas, a
      conversa, o olhar, o nome de quem não está, a solução já queimada;
   §3 as saídas livres;
   §4 a família quando a ação exata não está;
   §5 o corpus da mesa (439 frases reais) contra as três peças da prova e
      contra a peça-molde de cada facto — a medida da fase A, em catraca;
   §6 lixo e determinismo. */
import fs from "node:fs";
import { encaixar, aLeitura, aSaidaLivre, SAIDAS_LIVRES, VERBOS_DA_PECA, PALAVRAS_DO_CALOR } from "../src/pecas/encaixe.js";
import { aPecaDoMolde } from "../src/pecas/peca.js";
import { comMemoria } from "../src/pecas/calor.js";
import { MOLDE_DO_FATO, FAMILIA_DA_ACAO } from "../src/pecas/moldes.js";
import { asPecasDaProva, medirOEncaixe, conhecidosDoCorpus } from "../src/pecas/a-prova.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

const [ver, rasto, fera] = asPecasDaProva();
const pastora = rasto.peca.cena.quem[0].nome;
const curral = ver.peca.cena.onde.nome;
const besta = fera.peca.solucoes.find((s) => s.id === "lutar@fera").alvo.nome;
const enc = (f, p) => encaixar(f, p.peca, p.estado);

sec("§1 a solução");
const r1 = enc("Examino com cuidado a porta, à procura de vestígios.", ver);
t("investigar no curral aciona o «ler» do curral, com o dado do catálogo", r1.tipo === "solucao" && r1.solucao === "ler@curral" && r1.dado.dc === 15 && r1.dado.pericia === "investigacao", J(r1));
const r2 = enc(`Tento convencer ${pastora} a me contar o que viu.`, rasto);
t("convencer quem está na cena aciona a solução dela", r2.tipo === "solucao" && r2.solucao === "convencer@pastora", J(r2));
const r3 = enc(`Ataco ${besta} com a espada.`, fera);
t("atacar a besta no covil é a luta", r3.tipo === "solucao" && r3.solucao === "lutar@fera" && r3.dado.luta === true, J(r3));
const toca = rasto.peca.solucoes.find((s) => s.id === "rastrear@toca").alvo.nome;
const r4 = enc(`Sigo as pegadas na lama até ${toca}.`, rasto);
t("o rasto até à toca não precisa de estar lá (é o caminho)", r4.tipo === "solucao" && r4.solucao === "rastrear@toca", J(r4));
t("a solução traz a pista dela", typeof r1.pista === "string" && r1.pista.length > 0);

sec("§2 o aquecimento");
const a1 = enc(`Ataco ${besta} com a espada.`, { ...fera, estado: rasto.estado, peca: rasto.peca });
t("a luta sem a besta na cena (o rasto) não aciona nada", a1.tipo !== "solucao");
const longe = asPecasDaProva()[2];
const naoEsta = encaixar("Tento convencer o taverneiro a falar.", ver.peca, ver.estado);
t("a ação plausível com o alvo descrito e fora da cena é aquecimento", naoEsta.tipo === "aquecimento", J(naoEsta));
/* o furo que a medida mostrou: o catálogo só descreve pelos ofícios que conhece
   (alvoDescrito) — «o tratador» não é um deles, e a frase cai em quem está */
t("(furo registado) «o tratador» não é descrição que o catálogo leia", encaixar("Tento convencer o tratador a falar.", ver.peca, ver.estado).tipo === "solucao");
/* duas pessoas na cena, a mesma ação, sem nome: aquece as duas */
const duas = aPecaDoMolde("conversou", { tipo: "pessoa", nome: "Edric", papel: "edric" }, { quem: [{ nome: "Edric" }, { nome: "Lysa" }], onde: { nome: "a praça" } });
const duasLysa = { ...duas, solucoes: [...duas.solucoes, ...aPecaDoMolde("conversou", { tipo: "pessoa", nome: "Lysa", papel: "lysa" }, { quem: [{ nome: "Edric" }, { nome: "Lysa" }], onde: { nome: "a praça" } }).solucoes], pistas: duas.pistas };
const d1 = encaixar("Tento convencer a pessoa à minha frente a falar.", duasLysa, {});
t("a frase que cabe em duas aquece as duas — sem perguntar", d1.tipo === "aquecimento" && d1.esquenta.includes("convencer@edric") && d1.esquenta.includes("convencer@lysa") && d1.porque === "duas", J(d1));
const d2 = encaixar("Tento convencer Lysa a falar.", duasLysa, {});
t("com o nome, é dela", d2.tipo === "solucao" && d2.solucao === "convencer@lysa", J(d2));
const c1 = enc(`Cumprimento ${pastora} e pergunto como vai o inverno.`, rasto);
t("a conversa aquece as vias da conversa de quem ela nomeia", c1.tipo === "aquecimento" && c1.esquenta.length > 0 && c1.esquenta.every((id) => id.endsWith("@pastora")) && c1.nomeadas.length > 0, J(c1));
const c2 = encaixar("Respondo ao Teodoro que não sei.", rasto.peca, rasto.estado, { conhecidos: ["Teodoro"] });
t("quem fala com alguém que existe e não está aqui não aquece quem está", c2.tipo === "aquecimento" && c2.esquenta.length === 0 && c2.porque === "nomeiaQuemNaoEsta", J(c2));
const c3 = enc("Cresci na guilda dos dedos.", rasto);
t("a frase que não aponta para nada é aquecimento frio, com pista", c3.tipo === "aquecimento" && c3.esquenta.length === 0 && c3.pista.length > 0, J(c3));
const queimado = comMemoria(ver.estado, ver.peca, { queimadas: ["revistar@curral"] });
const q1 = encaixar("Vasculho o armazém de cima a baixo.", ver.peca, queimado);
t("a solução que já falhou não rola outra vez: a frase cai na da seta dela (a mesma família)", q1.tipo === "solucao" && q1.solucao === "ler@curral", J(q1));
const tudoQueimado = comMemoria(ver.estado, ver.peca, { queimadas: ["revistar@curral", "ler@curral", "pegadas@curral"] });
const q2 = encaixar("Vasculho o armazém de cima a baixo.", ver.peca, tudoQueimado);
t("sem nada vivo na família, é aquecimento", q2.tipo === "aquecimento", J(q2));

sec("§3 as saídas livres");
for (const [f, qual] of [["Vou até o cemitério.", "ir"], ["Sigo viagem para Ponte Brumoso.", "ir"], ["Abro o mapa.", "painel"], ["Quanto custa uma corda?", "comercio"], ["Mestre, quantas horas faltam para anoitecer?", "mestre"], ["(posso ver a ficha?)", "mestre"]]) {
  const r = enc(f, rasto);
  t(`«${f}» é livre (${qual})`, r.tipo === "livre" && r.qual === qual, J(r));
}
t("descansar é livre", enc("Deito-me e durmo até de manhã.", rasto).tipo === "livre");
t("«vou falar com» não é ir", aSaidaLivre(`Vou falar com ${pastora}.`, {}) === null);
t("a solução à vista ganha à saída (vou e procuro já aqui)", enc("Vou até ao fundo do armazém e vasculho a palha.", ver).tipo === "solucao");
t("as tabelas dizem porquê", Object.values(SAIDAS_LIVRES).every((s) => typeof s.porque === "string" && s.rx instanceof RegExp));

sec("§4 a leitura e a família");
t("a agressão vem primeiro", aLeitura(`Ataco ${besta}.`, fera.peca.cena, fera.estado).acao === "lutar");
t("capturar e pagar são verbos da peça", VERBOS_DA_PECA.capturar.test("atiro a rede") && aLeitura("Atiro o laço ao pescoço da besta.", fera.peca.cena, {}).acao === "capturar"
  && aLeitura(`Pago a ${pastora} umas moedas para falar.`, rasto.peca.cena, {}).acao === "pagar");
t("pagar a conta não é suborno", aLeitura("Deixo uma moeda na mesa pela cerveja.", rasto.peca.cena, {}).acao !== "pagar");
const fam = enc(`Insisto com ${pastora} até me dizer o que viu.`, rasto);
t("fazer falar e convencer são a mesma conversa: a família encaixa", fam.tipo === "solucao" && FAMILIA_DA_ACAO[fam.dado.acao] === "social", J(fam));
t("toda família do calor é uma família de ação", Object.keys(PALAVRAS_DO_CALOR).every((f) => Object.values(FAMILIA_DA_ACAO).includes(f)));

sec("§5 o corpus da mesa");
const CORPUS = JSON.parse(fs.readFileSync(new URL("./corpus-da-mesa.json", import.meta.url), "utf8"));
const frases = CORPUS.frases.map((f) => f.frase);
const pecas = asPecasDaProva();
const m = medirOEncaixe(frases, pecas);
const estrito = medirOEncaixe(frases, pecas, { conhecidos: conhecidosDoCorpus(CORPUS) });
const fmt = (x) => `n ${x.n} · solução ${x.solucao} · aquecimento ${x.aquecimento} (aquece ${x.esquenta}, frio ${x.frio}) · livre ${x.livre}`;
console.log("     as três peças da prova:", fmt(m.total));
for (const [k, v] of Object.entries(m.porPeca)) console.log(`       ${k}: ${fmt(v)}`);
console.log("     estrito (o nome de quem não está não aquece):", fmt(estrito.total));
const moldes = [];
for (const k of Object.keys(MOLDE_DO_FATO).filter((x) => x !== "pelo_menos" && x !== "escolheu")) {
  const tipo = MOLDE_DO_FATO[k].alvo;
  const alvo = tipo === "pessoa" ? { tipo, nome: "Edric" } : tipo === "lugar" ? { tipo, nome: "o Moinho Velho" } : { tipo, nome: "a chave de ferro" };
  const cena = { quem: [{ nome: "Edric" }], oQue: [], onde: { nome: tipo === "lugar" ? "o Moinho Velho" : "a praça" } };
  moldes.push({ nome: k, peca: aPecaDoMolde(k, alvo, cena), estado: {} });
}
const mm = medirOEncaixe(frases, moldes);
console.log("     controlo, a peça-molde de cada facto:", fmt(mm.total));
for (const [k, v] of Object.entries(mm.porPeca)) console.log(`       ${k}: ${fmt(v)}`);
/* CATRACA (17/11/2026, a medida da fase A — mente/lancamento/pecas-fase-a.md):
   nas três peças da prova, 1317 encaixes. «Sem nada» (nulo) é zero — toda
   frase é solução, aquecimento ou livre (o alvo da pessoa, as-pecas.md §5).
   O furo é o aquecimento FRIO: piso das soluções e teto dos frios, que só
   andam para melhor. */
t("toda frase do corpus dá um dos três (nenhuma fica sem nada)", m.total.nulo === 0 && mm.total.nulo === 0);
t("piso das soluções nas peças da prova (131)", m.total.solucao >= 131, String(m.total.solucao));
t("teto dos frios nas peças da prova (114)", m.total.frio <= 114, String(m.total.frio));
t("os números somam", m.total.solucao + m.total.aquecimento + m.total.livre === m.total.n && m.total.esquenta + m.total.frio === m.total.aquecimento);

sec("§6 lixo e determinismo");
t("lixo dá null", [null, "", "   "].every((f) => encaixar(f, rasto.peca, {}) === null) && encaixar("ataco", null, {}) === null);
t("a mesma frase dá o mesmo encaixe", J(enc(`Sigo as pegadas na lama até ${toca}.`, rasto)) === J(r4));
t("sem o nome do sítio, o rasto cabe em dois (a toca e o curral): aquece os dois", (() => { const x = enc("Sigo as pegadas na lama.", rasto); return x.tipo === "aquecimento" && x.porque === "duas"; })());
t("o estado não muda", (() => { const a = J(rasto.estado); enc("Vasculho tudo.", rasto); return J(rasto.estado) === a; })());

console.log(`\n${bons} ok, ${maus} falha(s)`);
process.exit(maus ? 1 : 0);
