/* O QUADRO DA QUEST (13/11/2026, Fase QQ · Q1) — src/quadro-da-quest.js

   A ideia aprovada pela pessoa (mente/plano-quadro.md): cada quest ativa
   tem um quadro com a pergunta do caso e cartas de pista; a carta que o
   caso precisa nunca se perde (a falha vira-a com preço), a extra só o
   sucesso vira, e só o sistema vira cartas. A prova:
   §1 as tabelas: os caminhos são desafios do catálogo, cada forma tem ≥2,
      cada preço tem porta, cada porta é uma função que existe;
   §2 o catálogo inteiro, em todos os arcos e três sementes: cada carta
      essencial nasce alcançável por ≥2 caminhos, o mistério tem mais
      cartas, o tipo 2 e o confronto não têm extra;
   §3 a falha numa essencial vira-a, com um preço da tabela (leve por
      pouco; dobrado no mistério), e o facto que escreve fecha o átomo;
   §4 a extra não vira na falha: queima o caminho, e sem caminhos perde-se;
   §5 a prosa não vira nada;
   §6 mesma semente, mesmo quadro;
   §7 uma campanha de mistério de ponta a ponta (a fraqueza do vilão, a
      falha que não prende, o passo que anda);
   §8 o lixo não lança, e a memória tem teto.
   Q2 (14/11) — o juiz do teste e do gesto:
   §9  as tabelas do juiz batem com as dos caminhos;
   §10 aCartaDoTeste: o desafio, o sítio e a pessoa do caminho; o assunto
       nas âncoras abertas; a essencial antes da extra; o mais preciso; o
       caminho queimado não volta; o que não bate dá null; o pago;
   §11 aCartaDoGesto: pagar e comprar sem dado, com a bolsa a cobrir. */
import {
  FORMAS_DA_CARTA, PISTAS_DO_PASSO, CAMINHOS_DA_CARTA, CAMINHOS_DA_EXTRA, PRECO_DA_FALHA, EFEITOS_DO_PRECO, PORTA_DA_CARTA,
  EXTRAS_DO_QUADRO, VANTAGENS_DO_CONFRONTO, QUADRO_POR_ARCO, QUADRO_DA_QUEST, VEREDITO_DO_SISTEMA, QUADRO_NA_PAUTA,
  garantirQuadro, oQuadroDaQuest, virarCarta, osQuadrosDoEstado, oQuadroNaPauta,
  CARTA_DO_TESTE, ASSUNTO_DA_EXTRA, GESTOS_DA_CARTA, aCartaDoTeste, aCartaDoGesto,
} from "../src/quadro-da-quest.js";
import { BIBLIOTECA_DE_QUESTS, abrirQuest, PAPEIS_DA_QUEST, EFEITOS_DA_QUEST } from "../src/biblioteca-de-quests.js";
import { CONDICOES, avaliarCondicao } from "../src/condicoes-da-quest.js";
import { DESAFIOS } from "../src/desafios.js";
import { ESTRUTURAS, garantirHistoria } from "../src/historia.js";
import { garantirFactos } from "../src/livro-de-factos.js";
import { oLivroDoAchado } from "../src/a-quest-manda.js";
import { garantirQuestsDaEspinha, oTurnoDasQuests } from "../src/motor/quests-do-turno.js";
import { esqueletoDaCampanha, comOEsqueleto } from "../src/esqueleto.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { chefesDoMundo } from "../src/mundo-base.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";
import fs from "node:fs";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (o) => { if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(congelar); } return o; };
const raiz = new URL("../", import.meta.url);

sec("§1 as tabelas");
{
  const ids = new Set(DESAFIOS.map((d) => d.id));
  const todos = [...Object.values(CAMINHOS_DA_CARTA).flat(), ...CAMINHOS_DA_EXTRA];
  const fora = todos.flatMap((c) => c.desafios.filter((d) => !ids.has(d)).map((d) => `${c.id}:${d}`));
  t("todo caminho vira-se por desafios que existem no catálogo", fora.length === 0, fora.join(", "));
  t("todo caminho tem pelo menos um desafio", todos.every((c) => c.desafios.length > 0));
  const formas = Object.keys(FORMAS_DA_CARTA);
  t("cada forma tem ≥2 caminhos de âncora aberta ou própria", formas.every((f) => CAMINHOS_DA_CARTA[f] && CAMINHOS_DA_CARTA[f].length >= 2));
  t("o lugar e o objeto têm ≥2 caminhos que não dependem de pessoa nenhuma",
    ["lugar", "objeto"].every((f) => CAMINHOS_DA_CARTA[f].filter((c) => c.ancora !== "pessoa").length >= 2));
  t("as extra têm ≥2 caminhos, e nenhum precisa de âncora (perde-se por falhar, nunca por falta de onde procurar)",
    CAMINHOS_DA_EXTRA.length >= 2 && CAMINHOS_DA_EXTRA.every((c) => c.ancora === "cidade" || c.ancora === "nenhuma"));
  t("os ids dos caminhos não se repetem dentro de uma forma", [...Object.values(CAMINHOS_DA_CARTA), CAMINHOS_DA_EXTRA].every((l) => new Set(l.map((c) => c.id)).size === l.length));
  t("cada forma tem um preço pesado e um leve", formas.every((f) => Object.values(PRECO_DA_FALHA).some((p) => p.formas.includes(f))
    && Object.values(PRECO_DA_FALHA).some((p) => p.leve && p.formas.includes(f))));
  const semPorta = Object.entries(PRECO_DA_FALHA).flatMap(([id, p]) => p.efeitos.filter((e) => !EFEITOS_DA_QUEST[e.tipo] && !EFEITOS_DO_PRECO[e.tipo]).map((e) => `${id}:${e.tipo}`));
  t("todo efeito de preço é da biblioteca ou tem porta própria", semPorta.length === 0, semPorta.join(", "));
  t("as portas próprias apontam para ficheiros que existem", Object.values(EFEITOS_DO_PRECO).every((e) => e.porta === null || fs.existsSync(new URL(e.porta, raiz))));
  t("todo preço tem formas que existem", Object.values(PRECO_DA_FALHA).every((p) => p.formas.length && p.formas.every((f) => formas.includes(f))));
  const preds = Object.keys(PISTAS_DO_PASSO).filter((p) => !CONDICOES[p] || CONDICOES[p].reservado);
  t("as pistas do passo são predicados vivos do vocabulário", preds.length === 0, preds.join(", "));
  t("a forma de cada pista bate com o tipo do argumento", Object.entries(PISTAS_DO_PASSO).every(([p, P]) =>
    ({ lugar: "lugar", pessoa: "pessoa", objeto: "item" })[P.forma] === CONDICOES[p].args[0].tipo));
  t("toda pista tem porta, e só elas", J(Object.keys(PORTA_DA_CARTA).sort()) === J(Object.keys(PISTAS_DO_PASSO).sort()));
  const portas = await Promise.all(Object.entries(PORTA_DA_CARTA).map(async ([p, P]) => {
    try { const m = await import(new URL(P.modulo, raiz)); return typeof m[P.funcao] === "function" ? null : p; } catch { return p; }
  }));
  t("cada porta é uma função exportada pelo módulo que diz", portas.every((x) => x === null), portas.filter(Boolean).join(", "));
  t("os arcos (fora o padrão) são estruturas da espinha", Object.keys(QUADRO_POR_ARCO).filter((k) => k !== "padrao").every((k) => ESTRUTURAS.some((e) => e.id === k)));
  t("o mistério pesa mais e mostra mais", QUADRO_POR_ARCO.misterio.extras > QUADRO_POR_ARCO.padrao.extras && QUADRO_POR_ARCO.misterio.peso > QUADRO_POR_ARCO.padrao.peso);
  t("as extra têm ganhos distintos, e a fraqueza tem forma para as três famílias",
    new Set(Object.values(EXTRAS_DO_QUADRO).map((x) => x.ganho)).size === Object.keys(EXTRAS_DO_QUADRO).length
    && ["pessoa", "coisa", "verdade"].every((f) => formas.includes(EXTRAS_DO_QUADRO.fraqueza.forma[f])));
  t("há vantagens para sortear", VANTAGENS_DO_CONFRONTO.length >= 4);
  t("o veredito do sistema pede o resultado e os dois números", VEREDITO_DO_SISTEMA.resultados.length === 2 && VEREDITO_DO_SISTEMA.numeros.length === 2);
}

/* ---------------- o catálogo inteiro ----------------
   Cada quest com os papéis de prova; para cada etapa, as de antes feitas
   e ela acesa. Os arcos: todas as estruturas da espinha; as sementes: três. */
const C = "Alto do Sal";
const e0 = congelar({ npcs: {}, cidadeAtual: C, lugar: { nome: "Praça", cidade: C }, personagem: { nome: "Vera", grupo: [], inventario: [] }, dia: 1, npcTurno: 0, factos: garantirFactos(null), baseMundo: null });
const ARCOS = ESTRUTURAS.filter((e) => e.espinha).map((e) => e.id);
const SEMENTES = ["Q1|a", "Q1|b", "Q1|c"];
const registos = [];
for (const F of BIBLIOTECA_DE_QUESTS) {
  const papeis = {};
  for (const [k, d] of Object.entries(F.papeis)) {
    const tipo = (PAPEIS_DA_QUEST[d.de] || {}).tipo;
    papeis[k] = tipo === "lugar" ? { nome: `Casa ${k}`, cidade: C } : tipo === "item" ? { nome: `a coisa ${k}` } : { nome: `Pessoa ${k}` };
  }
  const R = abrirQuest(F, { estado: e0, papeis });
  F.etapas.forEach((etapa, idx) => {
    const antes = F.etapas.slice(0, idx);
    registos.push({ F, etapa, R: R ? congelar({ ...R, feitas: Object.fromEntries(antes.map((e) => [e.id, { dia: 1 }])), acesas: Object.fromEntries([...antes, etapa].map((e) => [e.id, 1])) }) : null });
  });
}
const quadros = [];
for (const c of registos) for (const arco of ARCOS) for (const semente of SEMENTES) {
  quadros.push({ ...c, arco, semente, q: c.R ? oQuadroDaQuest(c.R, e0, { arco, semente }) : null });
}

sec(`§2 o catálogo: ${BIBLIOTECA_DE_QUESTS.length} quests, ${registos.length} etapas, ${ARCOS.length} arcos, ${SEMENTES.length} sementes`);
{
  t("todas abrem e dão quadro em todas as etapas", quadros.every((x) => x.q), quadros.filter((x) => !x.q).slice(0, 5).map((x) => `${x.F.id}/${x.etapa.id}`).join(", "));
  const ess = quadros.flatMap((x) => (x.q ? x.q.cartas.filter((c) => c.tipo === "essencial" && !c.futura).map((c) => ({ x, c })) : []));
  const poucos = ess.filter(({ c }) => c.caminhos.length < 2);
  t(`cada carta essencial (${ess.length}) nasce alcançável por ≥2 caminhos`, ess.length > 0 && poucos.length === 0, poucos.slice(0, 5).map(({ x, c }) => `${x.F.id}/${c.id}`).join(", "));
  const daVez = quadros.flatMap((x) => (x.q ? x.q.cartas.filter((c) => c.tipo === "essencial" && c.etapa === x.etapa.id && c.estado === "costas") : []));
  t("as cartas da etapa de agora podem virar-se", daVez.length > 0 && daVez.every((c) => c.viravel));
  const futuras = quadros.flatMap((x) => (x.q ? x.q.cartas.filter((c) => c.futura) : []));
  t("as cartas de etapas por vir não se viram e não mostram caminhos (a silhueta)", futuras.length > 0 && futuras.every((c) => !c.viravel && c.caminhos.length === 0));
  t("as de etapas por vir só aparecem nos arcos que as mostram", quadros.every((x) => !x.q || QUADRO_POR_ARCO[x.arco] && QUADRO_POR_ARCO[x.arco].futuras || x.q.cartas.every((c) => !c.futura)));
  const comPista = new Set(quadros.filter((x) => x.q && x.q.essenciais > 0).map((x) => x.F.id));
  t(`a maior parte das quests tem quadro com pistas (${comPista.size} de ${BIBLIOTECA_DE_QUESTS.length})`, comPista.size * 2 > BIBLIOTECA_DE_QUESTS.length);
  const menos = registos.filter((r) => r.R).filter((r) => {
    const n = (a) => (oQuadroDaQuest(r.R, e0, { arco: a, semente: SEMENTES[0] }) || { cartas: [] }).cartas.length;
    return n("misterio") < n("jornada");
  });
  t("no mistério há tantas ou mais cartas do que fora dele, em toda etapa", menos.length === 0, menos.slice(0, 3).map((r) => `${r.F.id}/${r.etapa.id}`).join(", "));
  t("o mistério tem mais cartas no catálogo inteiro", (() => {
    const soma = (a) => quadros.filter((x) => x.arco === a && x.q).reduce((s, x) => s + x.q.cartas.length, 0);
    return soma("misterio") > soma("jornada");
  })());
  t("o tipo 2 (o coração) não tem extra", quadros.filter((x) => x.F.tipo === 2 && x.q).every((x) => x.q.cartas.every((c) => c.tipo !== "extra")));
  t("o confronto não tem extra (já é o fim)", quadros.filter((x) => x.F.mao && QUADRO_DA_QUEST.semExtras.includes(x.F.mao.tipo) && x.q).every((x) => x.q.cartas.every((c) => c.tipo !== "extra")));
  t("as extra nunca passam do número do arco", quadros.every((x) => !x.q || x.q.cartas.filter((c) => c.tipo === "extra").length <= (QUADRO_POR_ARCO[x.arco] || QUADRO_POR_ARCO.padrao).extras));
  t("todo tipo 1 com vilão em jogo tem a sua extra", quadros.filter((x) => x.q && x.F.tipo === 1 && !(x.F.mao && QUADRO_DA_QUEST.semExtras.includes(x.F.mao.tipo))).every((x) => x.q.cartas.some((c) => c.tipo === "extra")));
  t("uma carta, uma chave, em cada quadro", quadros.every((x) => !x.q || new Set(x.q.cartas.map((c) => c.chave)).size === x.q.cartas.length));
  t("de costas, nenhuma carta mostra a face", quadros.every((x) => !x.q || x.q.cartas.filter((c) => c.estado === "costas").every((c) => c.face === "" && c.de === "")));
  t("a pergunta do caso existe em todo quadro", quadros.every((x) => !x.q || (typeof x.q.pergunta === "string" && x.q.pergunta.length > 0)));
}

sec("§3 a falha numa essencial vira-a, com preço");
{
  const alvos = quadros.filter((x) => x.arco === "jornada" && x.semente === SEMENTES[0] && x.q)
    .flatMap((x) => x.q.cartas.filter((c) => c.tipo === "essencial" && c.viravel).map((c) => ({ x, c })));
  const falha = (q, c, margem) => {
    const cam = c.caminhos[0];
    return virarCarta(q, { desafio: cam.desafios[0], resultado: "falha", total: 10, dc: 10 + margem }, { carta: c.id, caminho: cam.id, dia: 3 });
  };
  const rs = alvos.map(({ x, c }) => ({ x, c, r: falha(x.q, c, 8) }));
  t(`todas as ${rs.length} essenciais viram na falha`, rs.length > 0 && rs.every(({ r }) => r && (r.carta.estado === "preco")));
  t("o preço sai da tabela, e serve a forma da carta", rs.every(({ c, r }) => r.preco && PRECO_DA_FALHA[r.preco.id] && PRECO_DA_FALHA[r.preco.id].formas.includes(c.forma)));
  t("o preço já estava dito antes do clique (o veredito antes do clique)", rs.every(({ c, r }) => c.caminhos[0].seFalhar.includes(r.preco.id)));
  t("a falha escreve o mesmo facto que o sucesso (é ele que fecha a etapa)", rs.every(({ c, r }) => r.escreve && r.escreve.predicado === c.escreve.predicado && r.escreve.papel === c.escreve.papel && r.escreve.porta === PORTA_DA_CARTA[c.escreve.predicado]));
  const porPouco = alvos.map(({ x, c }) => falha(x.q, c, QUADRO_DA_QUEST.porPouco));
  t("falhar por pouco cobra só um preço leve", porPouco.every((r) => r && PRECO_DA_FALHA[r.preco.id].leve));
  const sucesso = alvos.map(({ x, c }) => virarCarta(x.q, { desafio: c.caminhos[0].desafios[0], resultado: "sucesso", total: 18, dc: 12 }, { carta: c.id, caminho: c.caminhos[0].id, dia: 3 }));
  t("o sucesso vira-a limpa, sem preço", sucesso.every((r) => r && r.carta.estado === "virada" && r.preco === null && r.escreve));
  /* a memória volta: o quadro seguinte mostra a carta com o carimbo */
  const um = rs[0];
  const q2 = oQuadroDaQuest(um.x.R, { ...e0, quadro: um.r.memoria }, { arco: "jornada", semente: SEMENTES[0] });
  const c2 = q2.cartas.find((c) => c.id === um.c.id);
  t("guardada a memória, o quadro seguinte mostra a carta virada com o preço", c2 && c2.estado === "preco" && c2.preco === um.r.preco.id && !c2.viravel && c2.face.length > 0 && c2.linha.length > 0);
  /* o mistério dobra o preço */
  const doMist = quadros.find((x) => x.arco === "misterio" && x.q && x.q.cartas.some((c) => c.tipo === "essencial" && c.viravel));
  const cm = doMist.q.cartas.find((c) => c.tipo === "essencial" && c.viravel);
  const rm = falha(doMist.q, cm, 8);
  t("no mistério os números do preço dobram", rm && rm.preco.efeitos.every((e, i) => e.n == null || e.n === PRECO_DA_FALHA[rm.preco.id].efeitos[i].n * QUADRO_POR_ARCO.misterio.peso));
  /* o facto fecha o átomo: o «descobriu» pela porta do sistema, o «tem» pela bolsa */
  const desc = rs.find(({ c }) => c.escreve.predicado === "descobriu");
  const livro = oLivroDoAchado(e0.factos, desc.r.achado, { dia: 3, turno: 9 });
  const e1 = { ...e0, factos: livro };
  t("o achado da carta, pela porta do sistema, cumpre «descobriu» no livro", avaliarCondicao(["descobriu", `lugar:${desc.c.escreve.papel}`], { estado: e1, papeis: desc.x.R.papeis }));
  const q3 = oQuadroDaQuest(desc.x.R, e1, { arco: "jornada", semente: SEMENTES[0] });
  t("e, sem memória nenhuma, o quadro vê a carta virada pelo livro", q3.cartas.find((c) => c.id === desc.c.id).estado === "virada");
  const tem = rs.find(({ c }) => c.escreve.predicado === "tem");
  const e2 = { ...e0, personagem: { ...e0.personagem, inventario: [{ nome: tem.c.escreve.nome, qtd: 1 }] } };
  const q4 = oQuadroDaQuest(tem.x.R, e2, { arco: "jornada", semente: SEMENTES[0] });
  t("o objeto na bolsa vira a carta do objeto", q4.cartas.find((c) => c.id === tem.c.id).estado === "virada");
  t("o caminho que custa diz o custo, e cobra-o também no sucesso", (() => {
    const cp = alvos.find(({ c }) => c.caminhos.some((k) => k.custa));
    const k = cp.c.caminhos.find((z) => z.custa);
    const r = virarCarta(cp.x.q, { desafio: k.desafios[0], resultado: "sucesso", total: 15, dc: 10 }, { carta: cp.c.id, caminho: k.id });
    return r && J(r.custo) === J(k.custa);
  })());
}

sec("§4 a extra só o sucesso vira");
{
  const x = quadros.find((y) => y.arco === "misterio" && y.q && y.q.cartas.some((c) => c.tipo === "extra" && c.viravel));
  const ex = x.q.cartas.find((c) => c.tipo === "extra" && c.viravel);
  const v = (k, resultado) => ({ desafio: k.desafios[0], resultado, total: 5, dc: 15 });
  const r1 = virarCarta(x.q, v(ex.caminhos[0], "falha"), { carta: ex.id, caminho: ex.caminhos[0].id, dia: 4 });
  t("a falha não vira a extra", r1 && r1.carta.estado === "costas" && r1.preco === null && r1.escreve === null);
  t("queima o caminho tentado (a mesma coisa do mesmo jeito não se repete)", r1.perdeu === ex.caminhos[0].id && !r1.carta.caminhos.some((k) => k.id === ex.caminhos[0].id));
  const q1 = oQuadroDaQuest(x.R, { ...e0, quadro: r1.memoria }, { arco: x.arco, semente: x.semente });
  const ex1 = q1.cartas.find((c) => c.id === ex.id);
  t("o quadro seguinte já não oferece o caminho queimado", ex1 && ex1.estado === "costas" && !ex1.caminhos.some((k) => k.id === ex.caminhos[0].id));
  let mem = r1.memoria, q = q1, ultimo = null;
  for (let i = 0; i < 10; i++) {
    const c = q.cartas.find((z) => z.id === ex.id);
    if (!c || c.estado !== "costas") break;
    ultimo = virarCarta(q, v(c.caminhos[0], "falha"), { carta: c.id, caminho: c.caminhos[0].id, memoria: mem, dia: 5 });
    mem = ultimo.memoria;
    q = oQuadroDaQuest(x.R, { ...e0, quadro: mem }, { arco: x.arco, semente: x.semente });
  }
  const perdida = q.cartas.find((z) => z.id === ex.id);
  t("sem caminhos, a extra perde-se, e não se vira mais", perdida.estado === "perdida" && !perdida.viravel && ultimo && ultimo.carta.estado === "perdida");
  t("perdida, não dá ganho nenhum", !q.ganhos.includes(ex.ganho));
  const r2 = virarCarta(x.q, v(ex.caminhos[0], "sucesso"), { carta: ex.id, caminho: ex.caminhos[0].id, dia: 4 });
  const q2 = oQuadroDaQuest(x.R, { ...e0, quadro: r2.memoria }, { arco: x.arco, semente: x.semente });
  t("o sucesso vira-a, e o ganho vai para o confronto", r2.carta.estado === "virada" && q2.ganhos.includes(ex.ganho) && q2.cartas.find((c) => c.id === ex.id).face.length > 0);
  t("a extra nunca escreve no livro de factos", r2.escreve === null && r2.achado === null);
}

sec("§5 a prosa não vira nada");
{
  const x = quadros.find((y) => y.q && y.q.cartas.some((c) => c.tipo === "essencial" && c.viravel));
  const c = x.q.cartas.find((z) => z.tipo === "essencial" && z.viravel);
  const k = c.caminhos[0];
  const ctx = congelar({ carta: c.id, caminho: k.id, memoria: { v: 1, cartas: {} }, dia: 2 });
  const prosas = [
    "Vera revista o celeiro e encontra a prova escondida.",
    { resultado: "sucesso" },
    { resultado: "sucesso", desafio: k.desafios[0] },
    { resultado: "sucesso", desafio: k.desafios[0], total: "18", dc: 12 },
    { resultado: "vitoria", desafio: k.desafios[0], total: 18, dc: 12 },
    { texto: "sucesso", desafio: k.desafios[0], total: 18, dc: 12 },
    null, undefined, 42, [],
  ];
  t("a frase do Narrador, ou um veredito sem o dado, não vira carta nenhuma", prosas.every((p) => virarCarta(x.q, p, ctx) === null));
  t("um desafio que não é do caminho também não", virarCarta(x.q, { resultado: "sucesso", desafio: "nadar", total: 18, dc: 12 }, ctx) === null);
  t("nem um caminho que a carta não tem", virarCarta(x.q, { resultado: "sucesso", desafio: k.desafios[0], total: 18, dc: 12 }, { ...ctx, caminho: "voar" }) === null);
  const fut = quadros.find((y) => y.q && y.q.cartas.some((z) => z.futura));
  const cf = fut.q.cartas.find((z) => z.futura);
  t("nem uma carta de uma etapa por vir", virarCarta(fut.q, { resultado: "sucesso", desafio: "buscar", total: 18, dc: 12 }, { carta: cf.id, caminho: "revistar" }) === null);
  const qc = congelar(JSON.parse(J(x.q)));
  const r = virarCarta(qc, { resultado: "sucesso", desafio: k.desafios[0], total: 18, dc: 12 }, ctx);
  t("o quadro e a memória que entram não mudam (estado novo, nunca mutado)", r && J(qc) === J(x.q) && J(ctx.memoria) === J({ v: 1, cartas: {} }));
}

sec("§6 mesma semente, mesmo quadro");
{
  const igual = registos.filter((r) => r.R).every((r) => J(oQuadroDaQuest(r.R, e0, { arco: "misterio", semente: "S" })) === J(oQuadroDaQuest(r.R, e0, { arco: "misterio", semente: "S" })));
  t("o mesmo registo e a mesma semente dão o mesmo quadro", igual);
  const preco = (s) => {
    const x = registos.find((r) => r.R && r.F.id === "as_cinzas_de_ontem" && r.etapa.id === "marcas");
    const q = oQuadroDaQuest(x.R, e0, { semente: s });
    const c = q.cartas.find((z) => z.id === "marcas:descobriu:lugar");
    return virarCarta(q, { desafio: "buscar", resultado: "falha", total: 3, dc: 15 }, { carta: c.id, caminho: "revistar" }).preco.id;
  };
  t("o preço da mesma falha é o mesmo em qualquer máquina", preco("S1") === preco("S1"));
  const vantagens = new Set(["A", "B", "C", "D", "E", "F", "G", "H"].map((s) => {
    const x = registos.find((r) => r.R && r.F.id === "as_cinzas_de_ontem" && r.etapa.id === "marcas");
    const q = oQuadroDaQuest(x.R, e0, { arco: "jornada", semente: s });
    return J(q.cartas.filter((c) => c.tipo === "extra").map((c) => c.id));
  }));
  /* fora do mistério há uma extra só, entre o cúmplice e a vantagem: em
     oito sementes, as duas têm de sair (a sorte é da semente, não fixa) */
  t("sementes diferentes mudam o que o quadro sorteia", vantagens.size >= 2, [...vantagens].join(" "));
}

sec("§7 uma campanha de mistério de ponta a ponta");
{
  const semente = "QQ1|0";
  const mundo = { semente };
  const cat = BIBLIOTECA_DE_QUESTS.filter((q) => ["o_que_desce_ao_anoitecer", "o_ultimo_a_sair"].includes(q.id));
  const mapa = gerarGeografia(semente, null, null);
  const espinha0 = estenderEspinha({ semente, mapa, estrutura: "misterio", cidadeInicial: mapa.cidades[0].nome, antecedente: "soldado", dia: 1 });
  const nucleo = nucleoDaCampanha(semente, mapa, { espinha: espinha0, antecedente: "soldado", grupo: [] });
  const esq = esqueletoDaCampanha({ semente, mapa, espinha: espinha0, antecedente: "soldado", nucleo, chefes: chefesDoMundo(semente, mapa), catalogo: cat });
  let E = { espinha: comOEsqueleto(espinha0, esq), historia: garantirHistoria({ estrutura: "misterio", etapa: 0 }), mapa, cidadeAtual: mapa.cidades[0].nome, lugar: null, jornada: null, personagem: { nome: "Vera", grupo: [], inventario: [], moedas: 100 }, npcs: {}, canone: {}, factos: garantirFactos(null), saber: [], dia: 1, npcTurno: 0 };
  const turno = () => { const r = oTurnoDasQuests(E, { mundo }); if (r) E = { ...E, ...r.estado }; };
  turno();
  const Rq = () => garantirQuestsDaEspinha(E.espinha.quests).registos.find((r) => r.id === "o_que_desce_ao_anoitecer");
  t("o mundo de prova é de mistério, e abre a caçada", E.espinha.estrutura === "misterio" && !!Rq());
  const qs0 = osQuadrosDoEstado(E, { mundo });
  t("o estado dá o quadro da quest do ato", qs0.length === 1 && qs0[0].quest === "o_que_desce_ao_anoitecer" && qs0[0].arco === "misterio", J(qs0.map((q) => q.quest)));
  const fr = qs0[0] && qs0[0].cartas.find((c) => c.id === "extra:fraqueza");
  t("no mistério, com o vilão em jogo, a fraqueza dele é uma extra (de costas)", !!fr && fr.estado === "costas" && fr.chave === "vilao|fraqueza");
  t("as etapas por vir já se veem de costas", qs0[0].cartas.some((c) => c.futura));
  /* ao curral; o passo é o rasto (2 de: descobrir o curral, falar com a pastora, ir à toca) */
  const R = Rq();
  const curral = R.papeis.curral, toca = R.papeis.toca;
  E = { ...E, cidadeAtual: curral.cidade, lugar: { nome: curral.nome, cidade: curral.cidade } };
  E = { ...E, factos: anotarOLivro(E, { lugar: E.lugar, dia: 1, turno: 20 }, { mundo }).factos };
  turno();
  const q1 = osQuadrosDoEstado(E, { mundo })[0];
  const cc = q1.cartas.find((c) => c.id === "rasto:descobriu:curral");
  t("a carta do curral está na etapa de agora, e vira-se", cc && cc.viravel && cc.estado === "costas", J(q1.cartas.map((c) => [c.id, c.estado, c.viravel])));
  /* Q2: o juiz do teste acha a mesma carta e o mesmo caminho sozinho — a
     busca falhada, no curral, com o veredito do catálogo */
  const juiz = aCartaDoTeste(osQuadrosDoEstado(E, { mundo }), { id: "buscar", passou: false, total: 4, dc: 16, frase: "reviro a palha" }, { lugar: curral.nome, cidade: curral.cidade });
  t("o juiz do teste, no curral, escolhe a carta do curral pelo revistar", juiz && juiz.quest === q1.quest && juiz.carta === cc.id && juiz.caminho === "revistar" && juiz.veredito.resultado === "falha", J(juiz));
  const r = virarCarta(q1, { desafio: "buscar", resultado: "falha", total: 4, dc: 16 }, { carta: cc.id, caminho: "revistar", memoria: E.quadro, dia: E.dia });
  t("a busca falhada no curral vira a carta, com preço", r && r.carta.estado === "preco" && !!r.preco && !!r.achado);
  E = { ...E, quadro: r.memoria, factos: oLivroDoAchado(E.factos, r.achado, { dia: 1, turno: 30 }) };
  E = { ...E, cidadeAtual: toca.cidade, lugar: { nome: toca.nome, cidade: toca.cidade } };
  E = { ...E, factos: anotarOLivro(E, { lugar: E.lugar, dia: 1, turno: 40 }, { mundo }).factos };
  turno();
  t("ninguém fica preso por azar: com a carta e a toca, o passo anda", (Rq().feitas || {}).rasto != null, J(Object.keys(Rq().feitas || {})));
  const q2 = osQuadrosDoEstado(E, { mundo })[0];
  const cc2 = q2 && q2.cartas.find((c) => c.id === "rasto:descobriu:curral");
  t("e a carta fica virada com o carimbo do preço", cc2 && cc2.estado === "preco" && cc2.linha.length > 0);
  const pauta = oQuadroNaPauta(osQuadrosDoEstado(E, { mundo }));
  t("a pauta leva o que já se sabe, dentro do teto", pauta.linha.length > 0 && pauta.linha.length <= QUADRO_NA_PAUTA.teto && pauta.linha.includes(cc2.face));
  t("e o veto do que está de costas", pauta.naoPode.length > 0);
  const antiga = { ...E, espinha: { ...E.espinha, esqueleto: null } };
  t("a campanha antiga (sem esqueleto): nenhum quadro", J(osQuadrosDoEstado(antiga, { mundo })) === "[]");
}

sec("§8 o lixo e o teto");
{
  const lixo = [null, undefined, 0, "", "x", [], {}, { id: 3 }, { id: "nao_existe" }];
  t("oQuadroDaQuest não lança com lixo, e dá null", lixo.every((q) => oQuadroDaQuest(q, null) === null && oQuadroDaQuest(q, {}) === null));
  t("virarCarta não lança com lixo", lixo.every((q) => virarCarta(q, q, q) === null));
  t("osQuadrosDoEstado com lixo: []", lixo.every((e) => J(osQuadrosDoEstado(e)) === "[]"));
  t("oQuadroNaPauta com lixo: nada", lixo.every((q) => J(oQuadroNaPauta(q)) === J({ linha: "", naoPode: [] })));
  t("garantirQuadro com lixo: a memória vazia", lixo.every((m) => J(garantirQuadro(m)) === J({ v: QUADRO_DA_QUEST.v, cartas: {} })));
  const torta = garantirQuadro({ cartas: { "a|b": { como: "voar" }, "A B": { como: "limpa" }, "q|c": { como: "preco", preco: "inventado", dia: -3 }, "q|d": { como: "costas" } } });
  t("a memória torta é limpa: como desconhecido, chave torta, preço inventado, costas sem queimados", J(torta.cartas) === J({ "q|c": { dia: 0, como: "preco", caminho: "" } }));
  const muitas = {};
  for (let i = 0; i < QUADRO_DA_QUEST.memoria + 20; i++) muitas[`q|c${i}`] = { como: "limpa", dia: i };
  const cortada = garantirQuadro({ cartas: muitas });
  t("a memória tem teto, e sai a mais velha", Object.keys(cortada.cartas).length === QUADRO_DA_QUEST.memoria && !cortada.cartas["q|c0"] && !!cortada.cartas[`q|c${QUADRO_DA_QUEST.memoria + 19}`]);
  const grande = Array.from({ length: 12 }, () => quadros.find((x) => x.q && x.q.cartas.length > 3).q);
  t("a pauta nunca passa do teto, nem com doze quadros", oQuadroNaPauta(grande).linha.length <= QUADRO_NA_PAUTA.teto);
}

sec("§9 as tabelas do juiz (Q2)");
{
  const ancoras = new Set([...Object.values(CAMINHOS_DA_CARTA).flat(), ...CAMINHOS_DA_EXTRA].map((c) => c.ancora));
  t("toda âncora dos caminhos tem precisão", [...ancoras].every((a) => typeof CARTA_DO_TESTE.precisao[a] === "number"), [...ancoras].join(","));
  t("as âncoras que pedem assunto existem, e são as menos precisas", CARTA_DO_TESTE.assunto.every((a) => ancoras.has(a))
    && CARTA_DO_TESTE.assunto.every((a) => [...ancoras].filter((b) => !CARTA_DO_TESTE.assunto.includes(b)).every((b) => CARTA_DO_TESTE.precisao[b] > CARTA_DO_TESTE.precisao[a])));
  t("a ordem dos tipos põe a essencial antes da extra", CARTA_DO_TESTE.ordem.indexOf("essencial") === 0 && CARTA_DO_TESTE.ordem.includes("extra"));
  const comCusto = new Set(Object.values(CAMINHOS_DA_CARTA).flat().filter((c) => c.custa).map((c) => c.id));
  t("os caminhos pagos são caminhos com custo", CARTA_DO_TESTE.pagos.length > 0 && CARTA_DO_TESTE.pagos.every((id) => comCusto.has(id)));
  t("todo gesto percorre só caminhos com custo em moedas", Object.values(GESTOS_DA_CARTA).every((g) => g.caminhos.length && g.caminhos.every((id) => Object.values(CAMINHOS_DA_CARTA).flat().some((c) => c.id === id && c.custa && c.custa.moedas > 0))));
  t("cada extra tem as suas palavras de assunto, e só elas", J(Object.keys(ASSUNTO_DA_EXTRA).sort()) === J(Object.keys(EXTRAS_DO_QUADRO).sort()) && Object.values(ASSUNTO_DA_EXTRA).every((l) => l.length > 0));
}

/* o juiz sobre o catálogo: cada carta essencial que se vira agora, com o
   herói no sítio de cada caminho de âncora precisa */
/* o catálogo do juiz: os mesmos registos de §2, mas com nomes que nomeiam
   (o «Casa lugar» das fixtures de cima é feito só de palavras vazias, e o
   assunto das âncoras abertas não o acharia — o que está certo). Um nome
   por papel, distinto de todos os outros. */
let nUm = 0;
const distinto = (tipo) => { nUm++; return tipo === "lugar" ? { nome: "Casa Ralvaxe" + nUm, cidade: C } : tipo === "item" ? { nome: "o Ulmarco" + nUm } : { nome: "Dona Corvane" + nUm }; };
const quadros2 = [];
for (const F of BIBLIOTECA_DE_QUESTS) {
  const papeis = Object.fromEntries(Object.entries(F.papeis).map(([k, d]) => [k, distinto((PAPEIS_DA_QUEST[d.de] || {}).tipo)]));
  const R = abrirQuest(F, { estado: e0, papeis });
  if (!R) continue;
  F.etapas.forEach((etapa, idx) => {
    const antes = F.etapas.slice(0, idx);
    const Rk = congelar({ ...R, feitas: Object.fromEntries(antes.map((e) => [e.id, { dia: 1 }])), acesas: Object.fromEntries([...antes, etapa].map((e) => [e.id, 1])) });
    for (const arco of ["jornada", "misterio"]) quadros2.push({ F, etapa, R: Rk, arco, semente: SEMENTES[0], q: oQuadroDaQuest(Rk, e0, { arco, semente: SEMENTES[0] }) });
  });
}
const ondeDe = (c, k) => {
  const def = CAMINHOS_DA_CARTA[c.forma].find((z) => z.id === k.id);
  if (def.ancora === "lugar") return { onde: { lugar: c.juiz.nome, cidade: c.juiz.cidade || C }, quem: "" };
  if (def.ancora === "nasce") return c.juiz.nasce ? { onde: { lugar: c.juiz.nasce.nome, cidade: c.juiz.nasce.cidade || C }, quem: "" } : null;
  if (def.ancora === "pessoa") return { onde: { lugar: "Praça", cidade: C }, quem: c.juiz.nome };
  return null;
};

sec("§10 aCartaDoTeste — que carta e que caminho um teste vira");
{
  const jor = quadros2.filter((x) => x.arco === "jornada" && x.q);
  const casos = [];
  for (const x of jor) for (const c of x.q.cartas.filter((z) => z.tipo === "essencial" && z.viravel)) {
    for (const k of c.caminhos) {
      const s = ondeDe(c, k);
      if (!s || k.custa) continue;
      casos.push({ x, c, k, s, r: aCartaDoTeste([x.q], { id: k.desafios[0], passou: false, total: 5, dc: 15, quem: s.quem, frase: "" }, s.onde) });
    }
  }
  /* empatam só cartas da mesma precisão, e aí ganha a de cima no quadro */
  const fora = casos.filter(({ x, c, r }) => !r || (r.carta !== c.id && x.q.cartas.findIndex((z) => z.id === r.carta) > x.q.cartas.indexOf(c)));
  t(`no sítio do caminho, com o desafio dele, o teste vira a carta (${casos.length} casos)`, casos.length > 50 && fora.length === 0, fora.slice(0, 3).map(({ x, c, k }) => `${x.F.id}/${c.id}/${k.id}`).join(", "));
  const proprios = casos.filter(({ c, r }) => r && r.carta === c.id);
  t("e, quando é ela, o caminho escolhido é um dos que batem com o desafio", proprios.length > 0 && proprios.every(({ c, k, r }) => c.caminhos.find((z) => z.id === r.caminho).desafios.includes(k.desafios[0])));
  t("o veredito sai na forma de virarCarta (o desafio, o resultado, os números)", proprios.every(({ k, r }) => r.veredito.desafio === k.desafios[0] && r.veredito.resultado === "falha" && r.veredito.total === 5 && r.veredito.dc === 15));
  /* a falha seca e a por pouco seguem o virarCarta da Q1 */
  const seca = proprios.map(({ x, r }) => virarCarta(x.q, r.veredito, { carta: r.carta, caminho: r.caminho, dia: 2 }));
  t("a falha seca, pelo juiz, vira a essencial com preço", seca.every((v) => v && v.carta.estado === "preco" && v.preco));
  const pouco = proprios.map(({ x, c, k, s }) => {
    const r = aCartaDoTeste([x.q], { id: k.desafios[0], resultado: "falha", total: 13, dc: 13 + QUADRO_DA_QUEST.porPouco, quem: s.quem }, s.onde);
    return r && virarCarta(x.q, r.veredito, { carta: r.carta, caminho: r.caminho, dia: 2 });
  });
  t("a falha por pouco, pelo juiz, cobra só preço leve", pouco.every((v) => v && v.preco && PRECO_DA_FALHA[v.preco.id].leve));
  t("o sucesso, pelo juiz, vira-a limpa", proprios.every(({ x, k, s }) => {
    const r = aCartaDoTeste([x.q], { id: k.desafios[0], passou: true, total: 18, dc: 12, quem: s.quem }, s.onde);
    const v = r && virarCarta(x.q, r.veredito, { carta: r.carta, caminho: r.caminho });
    return v && v.carta.estado === "virada" && v.preco === null;
  }));

  /* o que não bate dá null — o turno segue como hoje */
  const lug = proprios.find(({ c, k }) => c.forma === "lugar" && k.id === "revistar");
  const pes = proprios.find(({ c, k }) => c.forma === "pessoa" && k.id === "falar");
  t("um desafio que nenhum caminho tem: null", aCartaDoTeste([lug.x.q], { id: "nadar", passou: true, total: 18, dc: 12 }, lug.s.onde) === null);
  t("a busca noutro sítio: null", aCartaDoTeste([lug.x.q], { id: "buscar", passou: true, total: 18, dc: 12 }, { lugar: "Moinho de Ninguém", cidade: C }) === null);
  t("a busca no sítio certo de outra cidade: null", aCartaDoTeste([lug.x.q], { id: "buscar", passou: true, total: 18, dc: 12 }, { lugar: lug.c.juiz.nome, cidade: "Outra Terra" }) === null);
  t("falar com outra pessoa: null", aCartaDoTeste([pes.x.q], { id: "convencer", passou: true, total: 18, dc: 12, quem: "Fulano de Tal" }, pes.s.onde) === null);
  t("sem quem, a pessoa da carta em cena basta", (() => {
    const r = aCartaDoTeste([pes.x.q], { id: "convencer", passou: true, total: 18, dc: 12 }, { cidade: C, emCena: ["Outro", { nome: pes.c.juiz.nome }] });
    return r && r.carta === pes.c.id && r.caminho === "falar";
  })());
  t("sem quem e sem ela em cena: null (menção não é presença)", aCartaDoTeste([pes.x.q], { id: "convencer", passou: true, total: 18, dc: 12, frase: `falo de ${pes.c.juiz.nome}` }, { cidade: C, emCena: ["Outro"] }) === null);
  t("o perito sem o id do desafio conta pela perícia (o catálogo diz qual)", (() => {
    const r = aCartaDoTeste([pes.x.q], { pericia: "persuasao", passou: true, total: 18, dc: 12, quem: pes.c.juiz.nome }, pes.s.onde);
    return r && r.carta === pes.c.id && r.veredito.desafio === "convencer";
  })());

  /* as âncoras abertas pedem o assunto na frase */
  const pergunta = (frase) => aCartaDoTeste([lug.x.q], { id: "fazer_falar", passou: false, total: 6, dc: 14, quem: "Fulano de Tal", frase }, { lugar: "Praça", cidade: C });
  const nomeado = pergunta(`pergunto ao Fulano o que sabe de ${lug.c.juiz.nome}`);
  t("perguntar pelo lugar a quem vive perto, nomeando-o, vira a carta pelo perguntar", nomeado && nomeado.carta === lug.c.id && nomeado.caminho === "perguntar", J(nomeado));
  t("o mesmo teste sem nomear o lugar (regatear na praça): null", pergunta("convenço o Fulano a baixar o preço") === null);
  t("e perguntar pelo lugar noutra cidade: null", aCartaDoTeste([lug.x.q], { id: "fazer_falar", passou: false, total: 6, dc: 14, frase: `e ${lug.c.juiz.nome}?` }, { cidade: "Outra Terra" }) === null);
  t("lembrar o lugar: o assunto do catálogo (`sobre`) basta", (() => {
    const r = aCartaDoTeste([lug.x.q], { id: "lembrar", passou: true, total: 15, dc: 12, sobre: lug.c.juiz.nome }, { cidade: "" });
    return r && r.carta === lug.c.id && r.caminho === "lembrar";
  })());

  /* o mais preciso ganha à ordem da tabela: o quadro do lugar vem primeiro,
     e a frase nomeia-o — mas falar COM a pessoa da outra carta é mais preciso */
  t("falar com a pessoa de uma carta ganha a perguntar pelo lugar de outra", (() => {
    const r = aCartaDoTeste([lug.x.q, pes.x.q], { id: "convencer", passou: true, total: 18, dc: 12, quem: pes.c.juiz.nome, frase: `pergunto a ${pes.c.juiz.nome} por ${lug.c.juiz.nome}` }, { cidade: C });
    return r && r.quest === pes.x.q.quest && r.carta === pes.c.id;
  })());
  t("na mesma precisão, a ordem da tabela: o primeiro quadro", (() => {
    const v = { id: "lembrar", passou: true, total: 15, dc: 12, sobre: `${lug.c.juiz.nome} e ${lug.c.juiz.nome}` };
    const a = aCartaDoTeste([lug.x.q, { ...lug.x.q, quest: "outra" }], v, {});
    const b = aCartaDoTeste([{ ...lug.x.q, quest: "outra" }, lug.x.q], v, {});
    return a && b && a.quest === lug.x.q.quest && b.quest === "outra";
  })());

  /* o pago: pagar só bate quando o teste cobrou moedas, e não se cobra outra vez */
  const pagar = (social) => aCartaDoTeste([pes.x.q], { id: "convencer", passou: true, total: 16, dc: 12, quem: pes.c.juiz.nome, social }, pes.s.onde);
  const semMoedas = pagar(null), comMoedas = pagar({ custoEmMoedas: 12 });
  t("sem moedas na conta social, falar (o pagar não bate)", semMoedas && semMoedas.caminho === "falar" && semMoedas.pago === false);
  t("com moedas pagas no teste, pagar — e o custo já foi cobrado", comMoedas && comMoedas.caminho === "pagar" && comMoedas.pago === true);

  /* a essencial antes da extra; a extra pelo vilão nomeado; o caminho
     queimado não volta a contar */
  const mist = quadros2.find((x) => x.arco === "misterio" && x.q && x.q.cartas.some((c) => c.tipo === "extra" && c.viravel && c.juiz.nomes.length)
    && x.q.cartas.some((c) => c.tipo === "essencial" && c.viravel && c.forma === "lugar"));
  const ex = mist.q.cartas.find((c) => c.tipo === "extra" && c.viravel && c.juiz.nomes.length);
  const el = mist.q.cartas.find((c) => c.tipo === "essencial" && c.viravel && c.forma === "lugar");
  const doVilao = ex.juiz.nomes[0];
  const re = aCartaDoTeste([mist.q], { id: "lembrar", passou: false, total: 4, dc: 15, sobre: doVilao }, {});
  t("lembrar o que se conta do vilão vira uma extra", re && mist.q.cartas.find((c) => c.id === re.carta).tipo === "extra" && re.caminho === "lembrar", J(re));
  const re2 = aCartaDoTeste([mist.q], { id: "lembrar", passou: false, total: 4, dc: 15, sobre: `${doVilao} e ${el.juiz.nome}` }, {});
  t("se a mesma frase também nomeia uma essencial, a essencial vem primeiro", re2 && re2.carta === el.id, J(re2));
  t("sem o vilão nem a carta nomeados, lembrar não vira nada", aCartaDoTeste([mist.q], { id: "lembrar", passou: false, total: 4, dc: 15, sobre: "as estrelas" }, {}) === null);
  const queima = virarCarta(mist.q, re.veredito, { carta: re.carta, caminho: re.caminho, dia: 3 });
  const qq = oQuadroDaQuest(mist.R, { ...e0, quadro: queima.memoria }, { arco: mist.arco, semente: mist.semente });
  const depois = aCartaDoTeste([qq], { id: "lembrar", passou: true, total: 18, dc: 12, sobre: doVilao }, {});
  t("a extra que falhou queima o caminho, e o mesmo teste já não a vira por ali", queima && queima.perdeu === "lembrar" && (!depois || depois.carta !== re.carta || depois.caminho !== "lembrar"), J(depois));
  const afim = mist.q.cartas.filter((c) => c.tipo === "extra" && c.viravel && c.juiz.nomes.length);
  if (afim.length > 1) {
    const alvo = afim[afim.length - 1];
    const tipo = alvo.id.replace(/^extra:/, "");
    const r = aCartaDoTeste([mist.q], { id: "lembrar", passou: true, total: 18, dc: 12, sobre: `${doVilao}, ${ASSUNTO_DA_EXTRA[tipo][0]}` }, {});
    t("entre extra, as palavras do assunto desempatam", r && r.carta === alvo.id, J(r));
  }

  /* o determinismo, a imutabilidade e o lixo */
  t("mesma entrada, mesma escolha", casos.every(({ x, k, s }) => J(aCartaDoTeste([x.q], { id: k.desafios[0], passou: false, total: 5, dc: 15, quem: s.quem }, s.onde))
    === J(aCartaDoTeste([x.q], { id: k.desafios[0], passou: false, total: 5, dc: 15, quem: s.quem }, s.onde))));
  const qc = congelar(JSON.parse(J(lug.x.q)));
  const vc = congelar({ id: "buscar", passou: true, total: 18, dc: 12 });
  const oc = congelar({ ...lug.s.onde, emCena: ["A"] });
  const rc = aCartaDoTeste([qc], vc, oc);
  t("o que entra não muda (congelado, e dá na mesma)", rc && rc.carta === lug.c.id && J(qc) === J(lug.x.q));
  t("a prosa sem números não vira nada", [{ id: "buscar", passou: true }, { id: "buscar", resultado: "vitoria", total: 18, dc: 12 }, { id: "buscar", passou: true, total: "18", dc: 12 }, "Vera revista o celeiro."].every((v) => aCartaDoTeste([lug.x.q], v, lug.s.onde) === null));
  const lixo = [null, undefined, 0, "", "x", [], {}, { id: 3 }];
  t("aCartaDoTeste não lança com lixo, e dá null", lixo.every((a) => aCartaDoTeste(a, a, a) === null && aCartaDoTeste(a, vc, lug.s.onde) === null && aCartaDoTeste([lug.x.q], vc, a) === null));
}

sec("§11 aCartaDoGesto — pagar e comprar, sem dado");
{
  const jor = quadros2.filter((x) => x.arco === "jornada" && x.q);
  const comCarta = (forma) => jor.map((x) => ({ x, c: x.q.cartas.find((z) => z.tipo === "essencial" && z.viravel && z.forma === forma) })).find((y) => y.c);
  const L = comCarta("lugar"), P = comCarta("pessoa"), O = comCarta("objeto");
  const pagoLugar = aCartaDoGesto([L.x.q], { frase: `Dou dez moedas a quem me disser o que ${L.c.juiz.nome} esconde`, quem: "Fulano", moedas: 100 }, { lugar: "Praça", cidade: C });
  t("pagar a quem sabe o que o lugar esconde vira a carta pelo pagar", pagoLugar && pagoLugar.carta === L.c.id && pagoLugar.caminho === "pagar" && pagoLugar.gesto === "pagar" && pagoLugar.pago === false, J(pagoLugar));
  const vl = pagoLugar && virarCarta(L.x.q, pagoLugar.veredito, { carta: pagoLugar.carta, caminho: pagoLugar.caminho, dia: 2 });
  const custoDe = (c, id) => CAMINHOS_DA_CARTA[c.forma].find((z) => z.id === id).custa;
  t("e o virarCarta da Q1 aceita-o: limpa, com o custo do caminho a cobrar", vl && vl.carta.estado === "virada" && J(vl.custo) === J(custoDe(L.c, "pagar")));
  t("a bolsa que não cobre o custo: null", aCartaDoGesto([L.x.q], { frase: `pago umas moedas por ${L.c.juiz.nome}`, moedas: custoDe(L.c, "pagar").moedas - 1 }, { cidade: C }) === null);
  t("pagar sem nomear o que se quer saber: null", aCartaDoGesto([L.x.q], { frase: "dou duas moedas ao rapaz", moedas: 100 }, { cidade: C }) === null);
  t("nomear sem pagar não é gesto: null", aCartaDoGesto([L.x.q], { frase: `o que esconde ${L.c.juiz.nome}?`, moedas: 100 }, { cidade: C }) === null);
  const pp = aCartaDoGesto([P.x.q], { frase: "ofereço cinco moedas para ele falar", quem: P.c.juiz.nome, moedas: 50 }, { cidade: C });
  t("pagar à pessoa da carta vira-a pelo pagar dela", pp && pp.carta === P.c.id && pp.caminho === "pagar");
  t("pagar a outra pessoa não vira a carta dela", aCartaDoGesto([P.x.q], { frase: "ofereço cinco moedas para ele falar", quem: "Fulano", moedas: 50 }, { cidade: C }) === null);
  if (O) {
    const po = aCartaDoGesto([O.x.q], { frase: `compro ${O.c.juiz.nome} a quem o tiver`, moedas: 100 }, { cidade: C });
    t("comprar o objeto a quem o tem vira-o pelo negociar, com o preço do caminho", po && po.carta === O.c.id && po.caminho === "negociar" && po.gesto === "comprar" && po.veredito.dc === custoDe(O.c, "negociar").moedas, J(po));
  }
  t("o gesto não lança com lixo, e dá null", [null, undefined, 0, "", "x", [], {}, { frase: 3 }].every((a) => aCartaDoGesto(a, a, a) === null && aCartaDoGesto([L.x.q], a, { cidade: C }) === null));
}

console.log(`\n${bons} ok, ${maus} falhas`);
process.exit(maus ? 1 : 0);
