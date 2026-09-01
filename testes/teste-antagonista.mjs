/* teste-antagonista.mjs (v9.107) — a ameaça que SABE, e que às vezes erra.
   `vilao.js` tinha o PLANO; faltava a CABEÇA — e a diferença entre as
   duas é a diferença entre um roteiro e um personagem. */
import fs from "node:fs";
import {
  CORPOS, FONTES, LEITURAS, RESPOSTAS, TETO_DO_QUE_SABE, DIAS_ENTRE_RESPOSTAS,
  corpoPorId, escolherCorpo, fontePorId, leituraPorId, respostaPorId,
  garantirSaber, chegouAteEle, certezaDe, oQueEleNaoSabe,
  garantirMente, lerOHeroi, podeResponder, responder, paraPauta, comoCai,
  envelopeDoCorpo, ANTAGONISTA_PROMPT,
} from "../src/antagonista.js";
import { gerarVilao, diasDoPasso, envelopeDaQueda, DIAS_POR_PASSO } from "../src/vilao.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const sec = (t) => console.log(`\n[${t}]`);
const app = fs.readFileSync("../src/App.jsx", "utf8");

sec("1) O CORPO — e ele muda mecânica, não sabor");
{
  ok(CORPOS.length === 5, "cinco corpos");
  ok(CORPOS.every((c) => c.id && c.nome && c.queda && c.confronto && c.o && c.ritmo), "cada um diz o que é, como cai e o que é um confronto com ele");
  ok(CORPOS.filter((c) => !c.sobrevive).length === 1, "só a PESSOA acaba quando cai — os outros quatro sobrevivem");
  ok(corpoPorId("bando").ritmo < 1 && corpoPorId("conselho").ritmo > 1, "o bando age mais rápido que uma pessoa; o conselho, mais devagar");
  ok(corpoPorId("inventado").id === "pessoa", "corpo que não existe cai na pessoa, sem quebrar");
  const vistos = new Set();
  for (let i = 0; i < 400; i++) vistos.add(escolherCorpo(Math.random));
  ok(vistos.size === 5, `o sorteio produz os cinco (${[...vistos].join(", ")})`);

  /* O RITMO DO PLANO MUDA COM O CORPO — é a primeira consequência
     mecânica, e é o que impede o corpo de ser enfeite */
  ok(diasDoPasso({ corpo: "bando" }) < DIAS_POR_PASSO, "o bando anda mais rápido");
  ok(diasDoPasso({ corpo: "conselho" }) > DIAS_POR_PASSO, "o conselho precisa concordar antes");
  ok(diasDoPasso({ corpo: "pessoa" }) === DIAS_POR_PASSO, "e a pessoa é o ritmo de sempre");
  ok(diasDoPasso({}) === DIAS_POR_PASSO && diasDoPasso(null) === DIAS_POR_PASSO, "sem corpo, o ritmo de sempre — nenhum save antigo muda de velocidade");

  /* A QUEDA GANHA CINCO FORMAS */
  const morre = envelopeDaQueda({ nome: "B", titulo: "T", corpo: "pessoa" });
  const nao = envelopeDaQueda({ nome: "B", titulo: "T", corpo: "instituicao" });
  ok(/está morto/.test(morre), "a pessoa morre");
  ok(!/está morto/.test(nao) && /não tem quem matar/.test(nao), "a instituição não — e o envelope diz isso em vez de mentir");
  ok(/NÃO trate isto como o fim de tudo/.test(nao), "e avisa o Narrador de que o que sobra continua");
  ok(/Ele acabou/.test(morre), "enquanto a pessoa acaba de verdade");
  const v = gerarVilao({ nome: "Brigid", cont: {}, dia: 1 });
  ok(!!v.corpo, "e todo vilão novo nasce com um corpo");
  ok(comoCai("coisa").sobrevive && !comoCai("pessoa").sobrevive, "`comoCai` responde a mesma coisa que o envelope");
  ok(/é uma coisa antiga/.test(envelopeDoCorpo("coisa", "O Vazio")), "e há envelope para apresentar a forma da ameaça");
}

sec("2) O QUE ELE SABE — com a FONTE em cada linha");
{
  ok(FONTES.length === 5 && FONTES.every((f) => f.id && f.o && f.certeza), "cinco fontes, cada uma com certeza declarada");
  ok(fontePorId("viu").certeza > fontePorId("boato").certeza, "ver vale mais que ouvir falar");
  ok(fontePorId("deduziu").certeza === 1, "e deduzir vale tão pouco quanto boato — é dali que sai o engano");

  let s = [];
  s = chegouAteEle(s, { o: "matou o capitão da guarda", fonte: "marca", dia: 3 });
  s = chegouAteEle(s, { o: "anda com um batedor", fonte: "boato", dia: 4 });
  ok(s.length === 2, "duas coisas chegaram");
  ok(certezaDe(s[0]) > certezaDe(s[1]), "e a que veio da marca vale mais");
  ok(chegouAteEle(s, { o: "" }).length === 2, "linha vazia não entra");
  ok(chegouAteEle(s, { o: "matou o capitão da guarda", fonte: "viu" }).length === 2, "e a repetida também não");
  ok(garantirSaber([{ o: "x", fonte: "inventada" }])[0].fonte === "boato", "fonte que não existe vira boato — a de menor certeza, que é o lado seguro");
  ok(garantirSaber("lixo").length === 0 && garantirSaber(null).length === 0, "lixo não quebra");
  let g = [];
  for (let i = 0; i < 40; i++) g = chegouAteEle(g, { o: "coisa " + i, fonte: "boato", dia: i });
  ok(g.length === TETO_DO_QUE_SABE, `e o teto morde (${g.length}) — memória de vilão também não é infinita`);

  /* E O QUE ELE NÃO SABE */
  const feitos = [{ oQue: "matou o capitão da guarda" }, { oQue: "roubou o cofre da guilda" }, { oQue: "queimou a ponte" }];
  const ignora = oQueEleNaoSabe(s, feitos);
  ok(ignora.length === 2, `ele ignora duas das três coisas (${ignora.join(" · ")})`);
  ok(!ignora.some((x) => /capitão/.test(x)), "e a que chegou até ele não está na lista do que ele ignora");
  ok(oQueEleNaoSabe([], feitos).length === 3, "sem nada ter chegado, ele ignora tudo — que é como uma campanha começa");
}

sec("3) A LEITURA PODE ESTAR ERRADA — e a errada é melhor");
{
  ok(LEITURAS.length >= 12, `${LEITURAS.length} leituras`);
  ok(LEITURAS.every((l) => l.id && l.diz && typeof l.quando === "function" && typeof l.erro === "boolean"), "cada leitura diz o que ele conclui, e se está errado");
  const erradas = LEITURAS.filter((l) => l.erro);
  ok(erradas.length >= 5, `${erradas.length} delas são ENGANOS — e o engano é computável porque é função de informação incompleta`);
  ok(!!leituraPorId("comprável") && !leituraPorId("x"), "a busca por id acha e não inventa");

  /* A CATRACA */
  const campos = Object.keys(garantirMente(null));
  const lidos = new Set();
  for (const l of LEITURAS) for (const m of String(l.quando).matchAll(/v\.([a-zA-Z]+)/g)) lidos.add(m[1]);
  for (const r of RESPOSTAS) for (const m of String(r.quando).matchAll(/v\.([a-zA-Z]+)/g)) lidos.add(m[1]);
  const orfaos = [...lidos].filter((c) => !campos.includes(c));
  ok(orfaos.length === 0, `todo campo lido existe na mente${orfaos.length ? ": ÓRFÃOS " + orfaos.join(", ") : ` (${lidos.size} de ${campos.length})`}`);
  const mortos = campos.filter((c) => !lidos.has(c) && !["nome", "corpo", "dia"].includes(c));
  ok(mortos.length === 0, `e todo campo entregue tem quem o leia${mortos.length ? ": MORTOS " + mortos.join(", ") : ""}`);

  /* pouca informação produz engano.

     SEMENTE FIXA (v9.113): isto rodava com `Math.random` e a suíte
     falhava uma corrida em cada três — a taxa oscilava entre 175 e 198,
     e a asserção irmã, mais apertada, caía junto. Um teste que falha um
     terço das vezes não guarda nada: ensina a ignorar a suíte.

     O gerador semeado mostra a mesma distribuição e sempre a mesma. */
  const semeado = (s0) => { let x = 0; for (let i = 0; i < s0.length; i++) x = (x * 31 + s0.charCodeAt(i)) >>> 0; return () => { x = (x * 1103515245 + 12345) >>> 0; return x / 4294967296; }; };
  const cego = { nome: "B", quanto: 1, certezaMax: 1, ignora: 4, fama: 10, desdeQueAgiu: 9 };
  const sorteA = semeado("vilao|cego");
  let enganos = 0, total = 0;
  for (let i = 0; i < 400; i++) { const l = lerOHeroi(cego, { sorte: sorteA }); if (l) { total++; if (l.erro) enganos++; } }
  console.log(`  com pouca informação: ${enganos} enganos em ${total} leituras`);

  /* muita informação, de boa fonte, produz acerto */
  const certo = { nome: "B", quanto: 8, certezaMax: 3, ignora: 0, fama: 60, marcas: 3, desdeQueAgiu: 9 };
  const sorteB = semeado("vilao|certo");
  let certos = 0, t2 = 0;
  for (let i = 0; i < 400; i++) { const l = lerOHeroi(certo, { sorte: sorteB }); if (l) { t2++; if (!l.erro) certos++; } }
  console.log(`  com informação de sobra: ${certos} acertos em ${t2}`);

  /* A AFIRMAÇÃO É COMPARATIVA, e é o que o módulo de fato promete: o
     engano é função de informação incompleta. Uma taxa absoluta não era
     nem o desenho nem estável — a distância entre as duas é as duas
     coisas. */
  const erroCego = enganos / Math.max(1, total);
  const erroCerto = (t2 - certos) / Math.max(1, t2);
  console.log(`  erro com pouca: ${(erroCego * 100).toFixed(0)}% · erro com muita: ${(erroCerto * 100).toFixed(0)}%`);
  ok(erroCego > erroCerto * 1.8, "informação ruim erra MUITO mais que informação boa — é o desenho inteiro");
  ok(erroCego > 0.35, "e com pouca informação o engano é a regra, não a exceção");
  ok(erroCerto < 0.3, "enquanto com informação boa ele acerta a maior parte");
  ok(lerOHeroi({}, {}) === null || !!lerOHeroi({}, {}), "mente vazia não quebra");
}

sec("4) A RESPOSTA — e o silêncio é um movimento");
{
  ok(RESPOSTAS.length >= 12, `${RESPOSTAS.length} respostas`);
  ok(RESPOSTAS.every((r) => r.id && r.gesto && r.faz && typeof r.quando === "function"), "cada uma tem id, gesto e ato");
  ok(RESPOSTAS.some((r) => /NÃO faz nada/.test(r.faz)), "e o SILÊNCIO é um movimento explícito — senão nunca aconteceria");
  ok(!!respostaPorId("compra") && !respostaPorId("x"), "a busca por id acha e não inventa");
  ok(RESPOSTAS.every((r) => !/["“”]|\bdiz:/.test(r.faz)), "e nenhuma escreve fala — a ameaça também não fala pelo sistema");

  /* A CADÊNCIA: um vilão que age todo turno é praga */
  const m = { nome: "B", quanto: 3, certezaMax: 2, fama: 50, desdeQueAgiu: 0 };
  ok(!podeResponder(m), "acabou de agir: não age de novo");
  ok(!podeResponder({ ...m, desdeQueAgiu: DIAS_ENTRE_RESPOSTAS - 1 }), "e nem antes do prazo");
  ok(podeResponder({ ...m, desdeQueAgiu: DIAS_ENTRE_RESPOSTAS }), "depois do prazo, age");
  ok(!podeResponder({ ...m, desdeQueAgiu: 99, quanto: 0 }), "e NUNCA age sobre o que não chegou até ele — é a regra que impede o vilão onisciente");
  ok(!podeResponder({}), "sem vilão, nada");

  const r = responder({ ...m, desdeQueAgiu: 9 }, { sorte: Math.random });
  ok(!!r && r.leitura && r.resposta && r.corpo, "a resposta traz a leitura, o movimento e o corpo");
  ok(responder({ ...m, desdeQueAgiu: 0 }) === null, "e nada quando a cadência não deixa");

  /* uma resposta quebrada não passa */
  const bomba = { id: "bomba", gesto: "x", peso: 99, quando: () => { throw new Error("x"); }, faz: "nunca deveria aparecer" };
  RESPOSTAS.push(bomba);
  let veio = false;
  for (let i = 0; i < 200; i++) { const x = responder({ ...m, desdeQueAgiu: 9 }, { sorte: Math.random }); if (x && x.resposta.id === "bomba") veio = true; }
  RESPOSTAS.pop();
  ok(!veio, "resposta que estoura é CORTADA, não passada");
}

sec("5) A LINHA DA PAUTA");
{
  const r = responder({ nome: "Brigid", quanto: 2, certezaMax: 1, ignora: 4, fama: 15, desdeQueAgiu: 9, heroiRico: true }, { sorte: () => 0.1 });
  const l = paraPauta(r, { nome: "Brigid" });
  console.log("  " + l.join("\n  "));
  ok(l.length === 2, "duas linhas: o que ela concluiu e o que faz");
  ok(/concluiu/.test(l[0]), "a primeira é a leitura");
  ok(/^e por isso/.test(l[1]), "a segunda é a consequência");
  ok(paraPauta(null).length === 0, "sem resposta, nenhuma linha");
  ok(l.join("").length <= 320, `e as duas cabem em ${l.join("").length} caracteres`);
  /* o ENGANO é dito ao Narrador */
  const errado = paraPauta({ leitura: { diz: "que eu tenho preço", erro: true }, resposta: { faz: "faz uma oferta" }, corpo: corpoPorId("pessoa") }, { nome: "B" });
  ok(/está ENGANADO/.test(errado[0]), "quando a leitura é errada, a Pauta AVISA — e o Narrador encena o engano com convicção");
  ok(/deixe o erro trabalhar/.test(ANTAGONISTA_PROMPT), "e o bloco do prompt manda não corrigir");
}

sec("6) LIGADO NO TURNO");
{
  ok(/vilaoParaPauta\(r, \{ nome:/.test(app), "a ameaça escreve na Pauta");
  ok(/saberRef = useRef\(\[\]\)/.test(app), "o que chegou até ela vive num ref");
  ok(/saber: saberRef\.current/.test(app) && /garantirSaber\(sv\.saber\)/.test(app), "é salvo e recarregado");
  ok(/chegarAteAAmeaca\(registroRef\.current/.test(app), "e o que pesou no registro pode chegar até ela");
  ok(/if \(!fonte\) return;/.test(app), "com FONTE obrigatória: sem fonte, não chega — e é isto que ela NÃO sabe");
  ok(/linha\.peso < 2/.test(app), "e só o que pesou chega: ninguém conta a um vilão que o herói comprou uma corda");
  ok(/temVilao: !!\(nemesisRef\.current/.test(app), "o bloco dela fica atrás de uma porta da cena");
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\ntudo verde");
process.exit(falhas ? 1 : 0);
