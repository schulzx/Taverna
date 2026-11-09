/* ============================================================
   TE11 · A LENDA, A CARTA DE COSTAS E A PAGA NA MOCHILA (09/11/2026)
   testes/teste-te11-motor.mjs

   Três decisões e os restos que a fiação da TE10 achou, no lado do sistema:

     §1 a lenda que a arma escreve (decisão 6 da pessoa) — gravarNaLenda:
        a frase da tabela, o peso, o teto de cinco (sai a mais leve; entre
        as mais leves, a mais nova), a mesma chave nunca duas vezes, o nome
        dele só depois do rosto, a concordância de quem ocupa o papel;
     §2 a lenda no motor — a peça com nome NO CORPO grava o feito do turno,
        a da mochila não; o replay grava a mesma linha; o turno seguinte não
        grava outra vez; o servo que sai vivo também se grava;
     §3 a carta de costas (decisão 5) — raridadeQuePodePagar devolve UM
        degrau e nada do caminho, e é a verdade: em toda a biblioteca, em
        quatro níveis, nenhuma paga passa a luz, e a luz é alcançável;
     §4 a paga na mochila — as peças entram na ficha, o achado do caminho
        fica no chão, a mudança de cena não leva a paga, o excedente cai;
     §5 os restos da TE10 — o nome do favor, o tom do coração, a lembrança
        que dorme com lugar livre, o envelope do artefacto que não é relíquia,
        os achados do turno para o chip.
   ============================================================ */
import { ESPOLIO_NO_TURNO, garantirQuestsDaEspinha, oTurnoDasQuests, missoesDasQuests } from "../src/motor/quests-do-turno.js";
import { oQueOEfeitoPede, EFEITOS_NA_TELA } from "../src/motor/efeitos-da-quest.js";
import { pagaDaQuest, raridadeQuePodePagar, gravarNaLenda, revelacaoDoEspolio, FEITOS_DA_LENDA, ARTEFACTOS_COM_NOME, PAGA_DA_QUEST, RECOMPENSA_DA_FAMILIA, FAMILIA_DO_RAMO, tetoDeRaridade, ORCAMENTO_DO_ESPOLIO } from "../src/espolios.js";
import { esqueletoDaCampanha, comOEsqueleto } from "../src/esqueleto.js";
import { BIBLIOTECA_DE_QUESTS, questPorId } from "../src/biblioteca-de-quests.js";
import { garantirHistoria } from "../src/historia.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { chefesDoMundo } from "../src/mundo-base.js";
import { garantirFactos } from "../src/livro-de-factos.js";
import { caidosParaOLivro } from "../src/motor/luta-do-turno.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";
import { PASSOS_DO_REPLAY } from "../src/sessao.js";
import { varrerSeMudou } from "../src/chao.js";
import { RARIDADES } from "../src/loot.js";
import { TIER } from "../src/afixos.js";
import { MAX_SINTONIA } from "../src/sintonia.js";
import { PALAVRAS_DO_ESPOLIO } from "../src/estilo.js";
import { vereditoDoEspolio, resumoDoEspolio, chipDoAchado } from "../src/espolio-na-tela.js";
import { envelopeDoAtivo, reliquiasEquipadas, reliquiaPorId, ENVELOPE_DO_GESTO } from "../src/relicas.js";
import { compararItem } from "../src/comparar-item.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const congelar = (x) => { if (x && typeof x === "object" && !Object.isFrozen(x)) { Object.freeze(x); Object.values(x).forEach(congelar); } return x; };
const tier = (r) => (Object.prototype.hasOwnProperty.call(TIER, r) ? TIER[r] : -1);

/* ---------------- o mundo e a campanha: os de teste-te9-motor ---------------- */
const DA_PLANTA = BIBLIOTECA_DE_QUESTS.filter((q) => ["o_salvo_conduto", "as_cinzas_de_ontem", "a_carta_que_nao_se_abre"].includes(q.id));
const HEROI = { nome: "Vera", classe: "Guerreiro", nivel: 3, xp: 0, nivelPendentes: 0, vidaMax: 30, vida: 30, manaMax: 10, mana: 10, moedas: 100, grupo: [], inventario: [], equipamento: [], equipados: {}, efeitos: [], condicoes: [] };
function mundoNovo(semente, heroi = HEROI) {
  const mapa = gerarGeografia(semente, null, null);
  const espinha0 = estenderEspinha({ semente, mapa, estrutura: "jornada", cidadeInicial: mapa.cidades[0].nome, antecedente: "soldado", dia: 1 });
  const nucleo = nucleoDaCampanha(semente, mapa, { espinha: espinha0, antecedente: "soldado", grupo: [] });
  const esq = esqueletoDaCampanha({ semente, mapa, espinha: espinha0, antecedente: "soldado", nucleo, chefes: chefesDoMundo(semente, mapa), catalogo: DA_PLANTA });
  return {
    semente, esq, mundo: { semente },
    estado: {
      espinha: comOEsqueleto(espinha0, esq), historia: garantirHistoria({ estrutura: "jornada", etapa: 0 }), mapa,
      cidadeAtual: mapa.cidades[0].nome, lugar: null, jornada: null,
      personagem: heroi, npcs: {}, canone: {}, factos: garantirFactos(null), saber: [], dia: 1, npcTurno: 0,
      chao: { cena: "", itens: [] },
    },
  };
}
let nT = 1;
const N = (nome, local, genero) => ({ nome, conhecidoEm: 1, local, relacao: "neutro", status: "vivo", consultas: 0, ...(genero ? { genero } : {}) });
const registar = (E, ...ps) => ({ ...E, npcs: { ...E.npcs, ...Object.fromEntries(ps.map((p) => [p.nome, N(p.nome, p.cidade || E.cidadeAtual, p.genero)])) } });
const falar = (E, ...nomes) => ({ ...E, factos: anotarOLivro(E, { tipo: "factos", dia: E.dia, turno: (nT += 10), falouCom: nomes }).factos });
const lutar = (E, ...caidos) => ({ ...E, factos: anotarOLivro(E, { tipo: "factos", dia: E.dia, turno: (nT += 10), derrotados: caidosParaOLivro(caidos) }).factos });
const ir = (E, cidade, lugar) => { const E2 = { ...E, cidadeAtual: cidade, jornada: null, lugar: lugar || null }; return { ...E2, factos: anotarOLivro(E2, { lugar: lugar || null, dia: E2.dia, turno: (nT += 10) }).factos }; };
const Q = (E) => garantirQuestsDaEspinha(E.espinha.quests);
const registoDe = (E, id) => Q(E).registos.find((r) => r.id === id) || null;
const turno = (W, E, f, op = {}) => { const E1 = f ? f(E) : E; const r = oTurnoDasQuests(E1, { mundo: W.mundo, ...op }); return { E: r ? { ...E1, ...r.estado } : E1, r, antes: E1 }; };

function jogar(W, { generoDoTenente = "" } = {}) {
  nT = 1;
  const passos = {};
  let { E, r } = turno(W, W.estado);
  passos.abre = { E, r };
  const P = registoDe(E, "o_salvo_conduto").papeis;
  ({ E, r } = turno(W, E, (e) => falar(registar(e, { nome: P.protegido.nome, cidade: P.origem.cidade }, { nome: P.guarda.nome, cidade: P.origem.cidade }), P.protegido.nome, P.guarda.nome)));
  passos.ouvir = { E, r };
  const desvio = { nome: P.desvio.nome, chave: P.desvio.chave, cidade: P.desvio.cidade };
  ({ E, r } = turno(W, E, (e) => ir(e, P.desvio.cidade, desvio)));
  passos.desvio = { E, r };
  ({ E, r } = turno(W, E, (e) => ({ ...e, jornada: { para: P.destino.cidade }, lugar: null, personagem: { ...e.personagem, grupo: [{ nome: P.protegido.nome, vinculo: 30 }] } })));
  passos.estrada = { E, r };
  const r5 = turno(W, E, (e) => lutar(registar(e, { nome: P.tenente.nome, genero: generoDoTenente }), { nome: P.tenente.nome, rendido: true }));
  ({ E, r } = r5);
  passos.passo = { E, r, antes: r5.antes };
  const r6 = turno(W, E, (e) => ({ ...ir(e, P.destino.cidade, null), dia: e.dia + 2 }));
  ({ E, r } = r6);
  passos.fecho = { E, r, antes: r6.antes };
  ({ E, r } = turno(W, E));
  passos.depois = { E, r };
  return { P, passos, fim: E };
}

/* a peça com nome do Cimo da Escada, ganha no nível 3 */
const CIMO = questPorId("o_cimo_da_escada");
const feitasDe = (F, ramo) => Object.fromEntries(F.etapas.map((e) => [e.id, { dia: 1, ramo: ramo !== undefined ? ramo : Array.isArray(e.ramos) ? e.ramos[0] : null, variante: null }]));
const fechada = (F, extra = {}) => ({ id: F.id, tipo: F.tipo, inicio: 0, ultimoAvanco: 1, papeis: {}, feitas: feitasDe(F), escolhas: {}, acesas: {}, reviravoltas: [], consequencias: [], estado: "concluida", motivo: "etapas", desfecho: null, fecho: null, fechouEm: 1, ...extra });
const ART = pagaDaQuest(CIMO, fechada(CIMO), { semente: "TE11", nivel: 3, heroi: HEROI }).itens.find((i) => i.artefacto);

/* ============================================================ */
sec("§1 a lenda que a arma escreve — gravarNaLenda");
{
  const L = FEITOS_DA_LENDA;
  t("a tabela: teto de cinco, um peso e ao menos uma frase por cada feito", L.teto === 5 && Object.keys(L.peso).every((tp) => Object.keys(L.peso[tp]).every((sub) => Number.isFinite(L.peso[tp][sub]) && Array.isArray(L.frases[tp][sub]) && L.frases[tp][sub].length >= 1)));
  t("o fim dele pesa mais do que tudo, e a quest de brasa menos do que tudo", Math.max(...Object.values(L.peso.desfecho)) > Math.max(...Object.values(L.peso).flatMap((x) => Object.values(x)).filter((v, i, a) => !Object.values(L.peso.desfecho).includes(v))) && L.peso.quest.brasa === Math.min(...Object.values(L.peso).flatMap((x) => Object.values(x))));
  t("nenhuma frase dá género à peça nem ao vilão (a peça pode ser um anel; ele, um bicho)", Object.values(L.frases).flatMap((x) => Object.values(x)).flat().every((f) => !/\b(ela|ele|dele|dela|nela|nele)\b/.test(f.replace(/\{[a-z_]+:[^}]*\}/g, ""))), "");
  t("o que não é peça com nome volta igual, e o lixo também", gravarNaLenda({ nome: "Espada" }, [{ tipo: "quest", sub: "chama", chave: "quest:x" }]) !== null && gravarNaLenda(null, []) === null && gravarNaLenda("x", null) === "x");
  const arte = congelar(JSON.parse(JSON.stringify(ART)));
  const foto = J(arte);
  const um = gravarNaLenda(arte, [{ tipo: "quest", sub: "fogueira", chave: "quest:q1", vars: { titulo: "A Ponte Partida" } }], { semente: "S", dia: 4 });
  t("um feito grava uma linha: a chave, o peso da tabela, o dia, a frase com o título", um !== arte && um.lenda.length === 1 && um.lenda[0].chave === "quest:q1" && um.lenda[0].peso === L.peso.quest.fogueira && um.lenda[0].dia === 4 && um.lenda[0].linha.includes("«A Ponte Partida»") && !/[{}]/.test(um.lenda[0].linha), J(um.lenda));
  t("e não muta a peça que recebe (congelada, intacta)", J(arte) === foto && !arte.lenda);
  t("a frase é uma das da tabela, cheia (a voz é da casa, não do Narrador)", L.frases.quest.fogueira.some((f) => f.replace("{titulo}", "A Ponte Partida") === um.lenda[0].linha));
  t("a mesma semente grava a mesma linha; a mesma chave não se grava outra vez", J(gravarNaLenda(arte, [{ tipo: "quest", sub: "fogueira", chave: "quest:q1", vars: { titulo: "A Ponte Partida" } }], { semente: "S", dia: 4 })) === J(um) && gravarNaLenda(um, [{ tipo: "quest", sub: "incendio", chave: "quest:q1", vars: { titulo: "Outra" } }], { semente: "S", dia: 9 }) === um);
  t("um feito que a tabela não conhece não grava nada", gravarNaLenda(arte, [{ tipo: "boato", sub: "x", chave: "boato:1" }, { tipo: "quest", sub: "gelo", chave: "quest:z" }, { chave: "" }, null], { semente: "S" }) === arte);
  /* o teto */
  const feitos = [
    { tipo: "quest", sub: "brasa", chave: "quest:a", vars: { titulo: "A" } },          // 1
    { tipo: "camada", sub: "marca", chave: "camada:marca" },                           // 2
    { tipo: "quest", sub: "fogueira", chave: "quest:b", vars: { titulo: "B" } },       // 4
    { tipo: "tenente", sub: "caiu", chave: "tenente:t1", vars: { tenente: "Rui" } },  // 5
    { tipo: "quest", sub: "incendio", chave: "quest:c", vars: { titulo: "C" } },       // 6
    { tipo: "camada", sub: "mao", chave: "camada:mao" },                               // 2 — empata com a mais leve que fica
    { tipo: "desfecho", sub: "derrota", chave: "desfecho:derrota", vars: { vilao: "Morvane" } }, // 10
  ];
  const cheia = gravarNaLenda(arte, feitos, { semente: "S", dia: 7 });
  t("o teto: sete feitos, cinco linhas — as mais marcantes", cheia.lenda.length === L.teto && J(cheia.lenda.map((l) => l.chave)) === J(["camada:marca", "quest:b", "tenente:t1", "quest:c", "desfecho:derrota"]), J(cheia.lenda.map((l) => [l.chave, l.peso])));
  t("a mais leve saiu, e a que empatou com a mais leve que fica não empurrou a primeira (a primeira façanha fica)", !cheia.lenda.some((l) => l.chave === "quest:a" || l.chave === "camada:mao"));
  t("pela ordem em que aconteceu (a lenda conta-se do princípio)", cheia.lenda.findIndex((l) => l.chave === "camada:marca") < cheia.lenda.findIndex((l) => l.chave === "desfecho:derrota"));
  const mais = gravarNaLenda(cheia, [{ tipo: "desfecho", sub: "redencao", chave: "desfecho:redencao", vars: { vilao: "Morvane" } }], { semente: "S", dia: 9 });
  t("uma sexta mais pesada entra, e sai a mais leve de todas", mais.lenda.length === 5 && mais.lenda.some((l) => l.chave === "desfecho:redencao") && !mais.lenda.some((l) => l.chave === "camada:marca"));
  t("uma sexta mais leve do que todas não entra (a peça fica igual)", gravarNaLenda(cheia, [{ tipo: "quest", sub: "brasa", chave: "quest:z", vars: { titulo: "Z" } }], { semente: "S" }) === cheia);
  /* o nome e o género */
  const sem = gravarNaLenda(arte, [{ tipo: "desfecho", sub: "fuga", chave: "desfecho:fuga", vars: { vilao: "" } }], { semente: "S" });
  t("sem o nome dele (antes do rosto), a frase diz quem move as peças", sem.lenda[0].linha.includes(L.semNome) && !/\{|alguém/.test(sem.lenda[0].linha), sem.lenda[0].linha);
  const dela = gravarNaLenda(arte, [{ tipo: "tenente", sub: "poupado", chave: "tenente:t2", vars: { tenente: "Ilda" }, generos: { tenente: "f" } }], { semente: "S" });
  const dele = gravarNaLenda(arte, [{ tipo: "tenente", sub: "poupado", chave: "tenente:t2", vars: { tenente: "Rui" }, generos: { tenente: "m" } }], { semente: "S" });
  t("a forma de quem ocupa o papel: «viva» para ela, «vivo» para ele", dela.lenda[0].linha.includes("Ilda saiu viva") && dele.lenda[0].linha.includes("Rui saiu vivo"), dela.lenda[0].linha);
  const longa = gravarNaLenda(arte, [{ tipo: "quest", sub: "chama", chave: "quest:l", vars: { titulo: "x".repeat(300) } }], { semente: "S" });
  t("a linha tem teto (o título longo corta-se)", longa.lenda[0].linha.length <= L.linha);
  const torta = gravarNaLenda({ ...arte, lenda: [null, { chave: "quest:q", linha: "Já cá estava.", peso: 3, dia: 1 }, { chave: "quest:q", linha: "dupla", peso: 3 }, { chave: 3 }] }, [{ tipo: "quest", sub: "chama", chave: "quest:n", vars: { titulo: "N" } }], { semente: "S" });
  t("a lenda torta de um save passa pela catraca, e a nova junta-se a ela", torta.lenda.length === 2 && torta.lenda[0].linha === "Já cá estava." && torta.lenda[1].chave === "quest:n");
}

/* ============================================================ */
sec("§2 a lenda no motor — o que está no corpo vê, o que está na mochila não");
{
  const heroi = { ...HEROI, equipados: { arma: ART }, equipamento: [{ ...ART, nome: "Gémea na Mochila", artefacto: { ...ART.artefacto, id: "a_gemea" } }] };
  const W = mundoNovo("BQ7|0", heroi);
  const C = jogar(W);
  const { fecho, depois, passo } = C.passos;
  const arma = fecho.E.personagem.equipados.arma;
  const R6 = registoDe(fecho.E, "o_salvo_conduto");
  t("a quest fechou e pagou neste turno", R6.estado === "concluida" && fecho.r.efeitos.some((x) => x.tipo === "espolio"));
  const linhaQ = arr(arma.lenda).find((l) => l.chave === "quest:o_salvo_conduto");
  t("a peça no corpo grava «O Salvo-Conduto» com o peso da chama", !!linhaQ && linhaQ.peso === FEITOS_DA_LENDA.peso.quest.chama && linhaQ.linha.includes(questPorId("o_salvo_conduto").titulo) && linhaQ.dia === fecho.antes.dia, J(arma.lenda));
  t("a da mochila não viu nada", !fecho.E.personagem.equipamento.some((i) => i && i.nome === "Gémea na Mochila" && i.lenda));
  const nova = fecho.E.personagem.equipamento.find((i) => i && i.deQuest === "o_salvo_conduto");
  t("e a peça que a paga deu neste turno não leva a quest que a deu (essa é a história dela)", !!nova && !nova.lenda);
  /* o servo poupado no T5 */
  const ficha = garantirQuestsDaEspinha(passo.E.espinha.quests);
  const armaT5 = passo.E.personagem.equipados.arma;
  const doServo = arr(armaT5.lenda).find((l) => l.chave.startsWith("tenente:"));
  console.log(`      T5: o servo caiu rendido — lenda: ${J(arr(armaT5.lenda).map((l) => l.linha))}`);
  t("o servo dele que saiu vivo da luta grava-se no turno em que caiu (a reação do vilão, que lê o livro)", !!doServo && (doServo.peso === FEITOS_DA_LENDA.peso.tenente.poupado && doServo.linha.includes(C.P.tenente.nome)), J(doServo));
  /* o replay */
  const passoQ = PASSOS_DO_REPLAY.find((p) => p.passo === "as quests");
  const pelo = passoQ.faz(fecho.antes, {}, { mundo: W.mundo }, { tela: { linhas: [] } });
  t("o replay grava a mesma lenda, byte a byte", J(pelo.personagem.equipados.arma.lenda) === J(arma.lenda) && J(pelo) === J(fecho.E));
  const C2 = jogar(mundoNovo("BQ7|0", heroi));
  t("a mesma campanha outra vez dá a mesma lenda", J(C2.fim.personagem.equipados.arma.lenda) === J(C.fim.personagem.equipados.arma.lenda));
  t("o turno seguinte não grava outra vez", J(depois.E.personagem.equipados.arma.lenda) === J(arma.lenda));
  const salvo = JSON.parse(JSON.stringify(fecho.E));
  t("a lenda vai e volta pelo JSON do save (campo novo do item, aditivo)", J(salvo.personagem.equipados.arma.lenda) === J(arma.lenda));
  /* a concordância do servo no motor */
  const Cf = jogar(mundoNovo("BQ7|0", heroi), { generoDoTenente: "mulher" });
  const sf = arr(Cf.passos.passo.E.personagem.equipados.arma.lenda).find((l) => l.chave.startsWith("tenente:"));
  t("a servo que é mulher sai «viva» (o registo da gente diz o género)", !!sf && /viva/.test(sf.linha), sf && sf.linha);
  /* o Narrador não escreve: nenhum feito sai de texto */
  const semFeito = oTurnoDasQuests({ ...depois.E, personagem: { ...depois.E.personagem } }, { mundo: W.mundo });
  t("sem feito do sistema no turno, nada se grava (a lenda não tem outra porta)", !semFeito.estado.personagem || J(semFeito.estado.personagem.equipados.arma.lenda) === J(arma.lenda));
  void ficha;
}

/* ============================================================ */
sec("§3 a carta de costas — raridadeQuePodePagar");
{
  const SC = questPorId("o_salvo_conduto");
  const aberta = (F, extra = {}) => ({ ...fechada(F, { estado: "aberta", feitas: {}, fechouEm: null }), ...extra });
  const r3 = raridadeQuePodePagar(SC, aberta(SC), { nivel: 3 });
  t("devolve UM degrau — uma palavra, e nada do caminho", typeof r3 === "string" && RARIDADES.includes(r3), J(r3));
  t("a chama no nível 3: incomum (o degrau da temperatura, no teto do nível)", r3 === "incomum");
  t("a quest fechada já não promete (a luz é do que vem)", raridadeQuePodePagar(SC, fechada(SC), { nivel: 3 }) === null);
  t("o lixo dá null", raridadeQuePodePagar(null, null) === null && raridadeQuePodePagar(SC, { id: "outra", estado: "aberta" }) === null && raridadeQuePodePagar({ id: 3 }, {}) === null);
  const comArt = BIBLIOTECA_DE_QUESTS.find((q) => q.tipo === 1 && ARTEFACTOS_COM_NOME[q.id] && ARTEFACTOS_COM_NOME[q.id].genero === "artefacto" && !(q.mao && q.mao.tipo === "confronto"));
  t("a quest quente com artefacto: o degrau da quest no nível (raro no 7, raro no 12, épico no 17)", [7, 12, 17].every((n) => raridadeQuePodePagar(comArt, aberta(comArt), { nivel: n }) === tetoDeRaridade(n).daQuest), comArt && comArt.id);
  const cheio = { atos: 5, pagas: [{ quest: "x1", estado: "concluida", temperatura: "fogueira", itens: [{ raridade: "raro", artefacto: { id: "x1", genero: "artefacto" } }] }, { quest: "x2", estado: "concluida", temperatura: "fogueira", itens: [{ raridade: "raro" }, { raridade: "raro" }, { raridade: "raro" }] }] };
  const rc = raridadeQuePodePagar(comArt, aberta(comArt), { nivel: 7, campanha: cheio });
  t("com o orçamento gasto (o artefacto que cabe e as raras do ato), a luz desce — nunca promete o que a paga não daria", rc === "incomum", J(rc));
  const cor = BIBLIOTECA_DE_QUESTS.find((q) => q.tipo === 2 && ARTEFACTOS_COM_NOME[q.id] && ARTEFACTOS_COM_NOME[q.id].genero === "lembranca");
  const lemb = { atos: 5, pagas: ["l1", "l2"].map((id) => ({ quest: id, estado: "terminada", temperatura: "brasa", itens: [{ raridade: "incomum", artefacto: { id, genero: "lembranca" } }] })) };
  t("o coração com lembrança: incomum; com as duas lembranças já levadas: nada", raridadeQuePodePagar(cor, aberta(cor), { nivel: 5 }) === "incomum" && raridadeQuePodePagar(cor, aberta(cor), { nivel: 5, campanha: lemb }) === null);
  /* A PROMESSA É A VERDADE: em toda a biblioteca, em quatro níveis, por
     cada família do caminho, a peça da paga (sem a relíquia, que é surpresa)
     nunca passa a luz; e alguma família chega a ela (ou o escondido) */
  let quests = 0, passou = 0, inalcancavel = 0;
  const ramoDe = { ferro: FAMILIA_DO_RAMO.ferro[0], palavra: FAMILIA_DO_RAMO.palavra[0], sombra: FAMILIA_DO_RAMO.sombra[0], saber: "descobrir" };
  for (const F of BIBLIOTECA_DE_QUESTS) {
    for (const nivel of [1, 5, 11, 17]) {
      const luz = raridadeQuePodePagar(F, aberta(F), { nivel, heroi: HEROI });
      quests++;
      let melhor = -1;
      for (const fam of Object.keys(RECOMPENSA_DA_FAMILIA)) {
        const R = F.tipo === 2 ? fechada(F, { estado: "terminada", desfecho: (arr(F.desfechos).find((d) => !d.cedo && !arr(d.efeitos).some((e) => e.tipo === "morte")) || {}).id || null }) : fechada(F, { feitas: feitasDe(F, ramoDe[fam]) });
        const pg = pagaDaQuest(F, R, { semente: "promessa", nivel, heroi: HEROI });
        const pecas = arr(pg && pg.itens).filter((i) => i.tipo !== "consumivel" && i.raridade !== "unico");
        for (const p of pecas) { melhor = Math.max(melhor, tier(p.raridade)); if (tier(p.raridade) > tier(luz)) passou++; }
      }
      /* a brasa sem artefacto só dá peça pelo escondido (um degrau abaixo): aí a luz é a dele */
      const soEscondido = F.tipo === 1 && !(PAGA_DA_QUEST[F.temperatura] || PAGA_DA_QUEST.brasa).item && !ARTEFACTOS_COM_NOME[F.id];
      if (luz && melhor < tier(luz) && !soEscondido) inalcancavel++;
    }
  }
  console.log(`      ${quests} quests×níveis: a paga passou a luz ${passou} vezes; luz que nenhuma família alcança: ${inalcancavel}`);
  t("em toda a biblioteca, nos níveis 1, 5, 11 e 17, nenhuma peça da paga passa a luz da carta", passou === 0, String(passou));
  t("e a luz nunca é mais do que o caminho (ou o escondido) pode dar", inalcancavel === 0, String(inalcancavel));
  /* no Diário, pelo motor */
  const W = mundoNovo("BQ7|0");
  const { E } = turno(W, W.estado);
  const ms = missoesDasQuests(E, { mundo: W.mundo });
  const m = ms.find((x) => x.id.endsWith("o_salvo_conduto"));
  t("o Diário (missoesDasQuests) leva `podePagar` na quest aberta — o degrau e mais nada", m && m.podePagar === raridadeQuePodePagar(SC, registoDe(E, "o_salvo_conduto"), { nivel: 3, heroi: HEROI, campanha: { atos: W.esq.atos.length } }) && !J(m).includes(J(RECOMPENSA_DA_FAMILIA.ferro.slots)), J(m && m.podePagar));
  t("nem uma palavra das famílias do caminho na projeção (o jogador escolhe pela história)", !/\b(ferro|sombra|palavra|saber)\b/.test(J(m.podePagar)));
}

/* ============================================================ */
sec("§4 a paga na mochila, e o excedente no chão");
{
  const W = mundoNovo("BQ7|0");
  const C = jogar(W);
  const { fecho, passo } = C.passos;
  const paga = fecho.r.efeitos.find((x) => x.tipo === "espolio").paga;
  const p0 = fecho.antes.personagem, p1 = fecho.E.personagem;
  const pecas = paga.itens.filter((i) => i.tipo !== "consumivel");
  const frascos = paga.itens.filter((i) => i.tipo === "consumivel");
  t("as peças da paga entram na mochila (equipamento), os frascos no inventário", pecas.every((i) => p1.equipamento.some((x) => x.nome === i.nome && x.deQuest === "o_salvo_conduto")) && p1.equipamento.length === arr(p0.equipamento).length + pecas.length && p1.inventario.length === arr(p0.inventario).length + frascos.length, J(p1.equipamento.map((i) => i.nome)));
  t("nada da paga fica no chão", !arr(fecho.E.chao && fecho.E.chao.itens).some((c) => c.pronto && c.pronto.deQuest === "o_salvo_conduto"));
  t("e o relato diz «na mochila»", fecho.r.linhas.some((l) => l.startsWith("✦ O que") && pecas.every((i) => l.includes(ESPOLIO_NO_TURNO.linhas.naMochila.replace("{nome}", i.nome)))), J(fecho.r.linhas));
  t("a paga aplicada não leva `noChao` quando tudo coube", !("noChao" in paga));
  t("o achado do caminho continua no chão (quem se baixa é o herói)", arr(passo.E.chao.itens).some((c) => c.pronto && c.pronto.consumivel) && !arr(passo.E.personagem.inventario).length);
  /* a mudança de cena */
  const outra = { ...fecho.E, lugar: { nome: "Outra Praça", cidade: fecho.E.cidadeAtual } };
  const r7 = oTurnoDasQuests(outra, { mundo: W.mundo });
  const E7 = { ...outra, ...r7.estado, chao: varrerSeMudou(outra.chao, "outra|cena") };
  t("a cena muda, o chão varre-se, e a paga continua na mochila", pecas.every((i) => E7.personagem.equipamento.some((x) => x.nome === i.nome)) && E7.chao.itens.length === 0);
  /* o excedente */
  const cheia = Array.from({ length: ESPOLIO_NO_TURNO.mochila.equipamento }, (_, k) => ({ nome: `Trapo ${k}`, tipo: "anel", raridade: "comum" }));
  const antes = { ...fecho.antes, personagem: { ...fecho.antes.personagem, equipamento: cheia } };
  const rx = oTurnoDasQuests(antes, { mundo: W.mundo });
  const Ex = { ...antes, ...rx.estado };
  const pgx = rx.efeitos.find((x) => x.tipo === "espolio").paga;
  t("com a mochila no teto, a peça cai no chão (com o crachá do achado e `deQuest`)", Ex.personagem.equipamento.length === cheia.length && pecas.every((i) => Ex.chao.itens.some((c) => c.pronto && c.pronto.nome === i.nome && c.pronto.deQuest === "o_salvo_conduto")));
  t("o relato di-lo, pela tabela", rx.linhas.some((l) => pecas.every((i) => l.includes(ESPOLIO_NO_TURNO.linhas.noChao.replace("{nome}", i.nome)))), J(rx.linhas));
  t("os frascos não têm teto: entram no inventário na mesma", Ex.personagem.inventario.length === arr(antes.personagem.inventario).length + frascos.length);
  t("a paga aplicada diz quais ficaram no chão (`noChao`, o índice em `itens`)", J(pgx.noChao) === J(pgx.itens.map((i, k) => (i.tipo !== "consumivel" ? k : -1)).filter((k) => k >= 0)));
  const ord = oQueOEfeitoPede(rx.efeitos.find((x) => x.tipo === "espolio"), { personagem: Ex.personagem });
  const entrada = ord[0].revelacao.find((e) => e.tipo === "item" && e.slot);
  t("a revelação marca a peça `noChao`, e o veredito di-lo em vez de «já está na mochila»", entrada && entrada.noChao === true && vereditoDoEspolio(entrada).noChao.length > 0 && vereditoDoEspolio(entrada).naMochila === "");
  const sem = ord[0].revelacao.find((e) => e.tipo === "item" && !e.noChao);
  t("e a que coube não leva a frase do chão", !sem || vereditoDoEspolio(sem).noChao === "");
  /* imutável */
  const gelado = congelar(JSON.parse(JSON.stringify(fecho.antes)));
  const foto = J(gelado);
  let ok = true;
  try { oTurnoDasQuests(gelado, { mundo: W.mundo }); } catch (e) { ok = false; console.log(e); }
  t("sobre o estado congelado do fecho, a mochila não se muta", ok && J(gelado) === foto);
}

/* ============================================================ */
sec("§5 os restos da TE10");
{
  const W = mundoNovo("BQ7|0");
  /* o favor com nome: a família da palavra */
  const SC = questPorId("o_salvo_conduto");
  const R = registoDe(jogar(W).passos.fecho.E, "o_salvo_conduto");
  const Rp = { ...R, feitas: Object.fromEntries(Object.entries(R.feitas).map(([k, v]) => [k, v && v.ramo ? { ...v, ramo: "palavra" } : v])) };
  const pg = pagaDaQuest(SC, Rp, { semente: W.semente, nivel: 3 });
  const fav = pg.favores[0];
  t("a paga da palavra dá o favor com o NOME do lugar (`paga.favores[i].nome`)", fav && fav.papel && fav.nome === R.papeis[fav.papel].nome && pg.efeitos[0].nome === fav.nome, J(pg.favores));
  const rev = revelacaoDoEspolio(pg, HEROI);
  const ef = rev.find((e) => e.tipo === "favor");
  t("a revelação leva o nome, e o resumo di-lo sem a tela ter de o procurar", ef && ef.nome === fav.nome && resumoDoEspolio(rev).includes(fav.nome));
  /* o tom */
  const o1 = oQueOEfeitoPede({ tipo: "espolio", quest: "q", titulo: "Q", paga: { tipo: 1, xp: 5, moedas: 0, itens: [], efeitos: [] } }, {});
  const o2 = oQueOEfeitoPede({ tipo: "espolio", quest: "q", titulo: "Q", paga: { tipo: 2, xp: 5, moedas: 0, itens: [], efeitos: [] } }, {});
  t("o tom vem na revelação: o coração (tipo 2) e o enredo — mesmo sem lembrança", o1[0].tom === EFEITOS_NA_TELA.tomDaRevelacao[1] && o2[0].tom === EFEITOS_NA_TELA.tomDaRevelacao[2] && o2[0].tom === "coracao");
  /* a lembrança no nível 1 */
  const lemb = { nome: "A Faixa Dela", tipo: "amuleto", raridade: "incomum", sintoniza: true, poderes: [], atributos: {}, artefacto: { id: "x", genero: "lembranca", estado: "adormecido", nivel: 1, passivos: [] } };
  const n1 = { ...HEROI, nivel: 1, sintonizados: [] };
  const e1 = revelacaoDoEspolio({ itens: [lemb] }, n1).find((e) => e.tipo === "item");
  t("no nível 1, sem nada sintonizado, a lembrança dorme com os três lugares livres", e1.dorme === true && e1.vagas === MAX_SINTONIA && compararItem(n1, lemb, "amuleto").vagas === MAX_SINTONIA);
  const v1 = vereditoDoEspolio(e1);
  t("e a frase já não diz «as tuas três já estão em uso»", v1.dorme.length > 0 && v1.dorme !== PALAVRAS_DO_ESPOLIO.dorme && !/já estão em uso/.test(v1.dorme) && v1.dorme.includes(String(MAX_SINTONIA)), v1.dorme);
  const tres = ["a", "b", "c"].map((n) => ({ nome: n, tipo: "anel", raridade: "raro", sintoniza: true }));
  const cheio = { ...HEROI, equipamento: tres, sintonizados: ["a", "b", "c"] };
  const e3 = revelacaoDoEspolio({ itens: [lemb] }, cheio).find((e) => e.tipo === "item");
  t("com os três tomados, a frase de sempre (essa era verdade)", e3.vagas === 0 && vereditoDoEspolio(e3).dorme === PALAVRAS_DO_ESPOLIO.dorme);
  /* o envelope */
  const exaltada = { ...ART, artefacto: { ...ART.artefacto, estado: "exaltado" }, ativo: { id: ART.artefacto.id, nome: ART.artefacto.gesto.nome, diz: ART.artefacto.gesto.diz }, lenda: [{ chave: "quest:a", peso: 4, dia: 2, linha: "Esteve lá no dia em que «A» se cumpriu." }, { chave: "tenente:t", peso: 5, dia: 3, linha: "Viu Rui cair." }, { chave: "camada:rosto", peso: 4, dia: 5, linha: "Estava à vista." }] };
  const [{ rel: doArt }] = reliquiasEquipadas({ ...HEROI, equipados: { arma: exaltada }, sintonizados: [exaltada.nome] });
  const envA = envelopeDoAtivo(doArt, "◈ x");
  const envR = envelopeDoAtivo(reliquiaPorId("comedora"), "◈ x");
  t("o gesto do artefacto já não diz «RELÍQUIA… existe UMA no mundo»", envA.startsWith(`[${ENVELOPE_DO_GESTO.artefacto.cabeca}`) && !/RELÍQUIA|existe UMA no mundo/.test(envA), envA.slice(0, 80));
  t("e leva as duas linhas mais recentes da lenda, que são do sistema", envA.includes("Viu Rui cair.") && envA.includes("Estava à vista.") && !envA.includes("«A» se cumpriu"));
  t("a relíquia continua a ser a única no mundo", envR.startsWith(`[${ENVELOPE_DO_GESTO.reliquia.cabeca}`) && envR.includes("existe UMA no mundo"));
  /* os achados do turno, para o chip */
  const C = jogar(W);
  const { desvio, passo } = C.passos;
  t("o turno devolve os achados (`achados`) quando há algum — o escondido do desvio", Array.isArray(desvio.r.achados) && desvio.r.achados.length === 1 && Number.isFinite(desvio.r.achados[0].moedas));
  t("e o chip lê-os como estão (chipDoAchado)", chipDoAchado(desvio.r.achados[0], desvio.E.personagem).tipo === "moedas" && chipDoAchado(passo.r.achados[0], passo.E.personagem) !== null);
  t("sem achado no turno, o campo não existe (a forma de antes)", !("achados" in C.passos.fecho.r) || C.passos.fecho.r.achados.length > 0);
}

console.log(`\nTE11 · a lenda, a carta de costas e a paga na mochila: ${bons} passaram, ${maus} falharam`);
if (maus) process.exit(1);
