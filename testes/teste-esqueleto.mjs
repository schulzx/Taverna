/* O ESQUELETO (08/11/2026, Fase BQ · BQ6) — src/esqueleto.js

   A espinha dos mundos novos deixa de sortear marcos soltos e passa a
   escolher e ligar quests já desenhadas — primeiro o vilão e o plano dele,
   depois uma quest por ato pela mão que contesta o passo desse ato, depois
   as do coração pela ponte, e os papéis todos com o que o mundo já tem
   (mente/plano-biblioteca-de-quests.md, §5 e §11).
   §1 as tabelas: a composição da planta, os passos que sobem, as janelas;
   §2 MIL SEMENTES, num mundo real, com o catálogo vivo: nenhum papel
      vazio, nenhuma quest repetida, a fraqueza posta em todas, cada papel
      no que existe, e a quest abre com os papéis que recebeu;
   §3 o catálogo cheio (sintético): as quests físicas contestam passos
      diferentes, todo ato tem quest, a fraqueza vem sempre de uma pista;
   §4 A DEGRADAÇÃO com o catálogo de hoje (três quests): o ato sem quest
      cai no marco antigo, e nada nasce com papel vazio — nem sem vilão com
      tenentes, nem sem núcleo;
   §5 AS MEDIDAS: o tenente que atravessa duas quests, e a métrica da
      planta (quantas quests duas campanhas partilham), com o tamanho de
      catálogo que a faz cair abaixo de 1;
   §6 o save: a catraca, a espinha com o esqueleto, o registo do vilão com
      a fraqueza e os lugares dos passos, o que abre em cada ato;
   §7 o determinismo, o null e a imutabilidade;
   §2d (TE4, 09/11) A TEMPERATURA E O GRAFO: a curva por ato, o respiro, o
      teto do coração, o grafo dos pressupostos, o rosto só no seu ato, um
      primeiro encontro só, e a reserva da quest do coração que espera. */
import {
  COMPOSICAO_DA_MAO, PASSO_DO_ATO, QUANDO_DO_ATO, JANELAS_DO_CORACAO, ESQUELETO,
  esqueletoDaCampanha, garantirEsqueleto, comOEsqueleto, questsDoAto,
  CURVA_DA_TEMPERATURA, RESPIRO, TETO_DO_CORACAO, CAMADA_DO_ATO, reservaDoCoracao,
} from "../src/esqueleto.js";
import { BIBLIOTECA_DE_QUESTS, MAOS_DO_VILAO, QUANDO_DA_QUEST, PAPEIS_DA_QUEST, LIMITES_DA_QUEST, NATUREZAS_DO_FIO, validarQuest, abrirQuest, questPorId, TEMPERATURAS, TEMPERATURA_DO_QUANDO, PRESSUPOSTOS } from "../src/biblioteca-de-quests.js";
import { FRAQUEZAS, COMO_SE_TEM_A_FRAQUEZA, fichaDoVilao, temAFraqueza, PLANOS_DO_ARQUETIPO, PLANO_DE_RECUO, SOBE_A_CAMADA } from "../src/plano-do-vilao.js";
import { FASES } from "../src/vilao.js";
import { ESTRUTURAS, estruturaPorId } from "../src/historia.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha, garantirEspinha } from "../src/saga.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { chefesDoMundo, locaisDaCidade, genteDoLocal } from "../src/mundo-base.js";
import { QUESTS_LOTE_6 } from "../src/acervo/quests-lote-6.js";
import { QUESTS_LOTE_5 } from "../src/acervo/quests-lote-5.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const pct = (a, b) => (b ? Math.round((1000 * a) / b) / 10 : 0);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const congelar = (x) => { if (x && typeof x === "object" && !Object.isFrozen(x)) { Object.freeze(x); Object.values(x).forEach(congelar); } return x; };

/* as três quests com que o catálogo nasceu (BQ4): a degradação prova-se
   contra ELAS, e não contra o catálogo vivo, que a BQ8 vai enchendo */
const HOJE = ["o_salvo_conduto", "as_cinzas_de_ontem", "a_carta_que_nao_se_abre"];
const CATALOGO_DE_HOJE = BIBLIOTECA_DE_QUESTS.filter((q) => HOJE.includes(q.id));
const ESPINHAS = ESTRUTURAS.filter((e) => e.espinha).map((e) => e.id);
const ANTS = ["", "orfao", "soldado", "erudito", "acolito", "ladrao", "naufrago"];

/* ---------------- os mundos de prova: mil, cada um com o seu mapa ---------------- */
const N = 1000;
const MUNDOS = [];
for (let i = 0; i < N; i++) {
  const semente = `Esqueleto|${i}`;
  const estrutura = ESPINHAS[i % ESPINHAS.length];
  const antecedente = ANTS[i % ANTS.length];
  const mapa = gerarGeografia(semente, null, null);
  const espinha = estenderEspinha({ semente, mapa, estrutura, cidadeInicial: mapa.cidades[0].nome, antecedente, dia: 1 });
  /* metade dos mundos já tem companheiro quando o esqueleto corre (o de
     antes, companheiro-inicial.js); a outra metade só tem o elo */
  const l0 = locaisDaCidade(semente, mapa.cidades[0]);
  const amigo = i % 2 === 0 && l0.length > 1 ? (genteDoLocal(semente, l0[l0.length - 1])[0] || null) : null;
  const nucleo = nucleoDaCampanha(semente, mapa, { espinha, antecedente, grupo: amigo ? [{ nome: amigo.nome }] : [] });
  const chefes = chefesDoMundo(semente, mapa);
  MUNDOS.push({ semente, estrutura, antecedente, mapa, espinha, nucleo, chefes });
}
const entradaDe = (w, extra) => ({ semente: w.semente, mapa: w.mapa, espinha: w.espinha, antecedente: w.antecedente, nucleo: w.nucleo, chefes: w.chefes, ...(extra || {}) });

/* o que existe no mundo, para conferir cada papel */
const cache = new Map();
const cidadeDe = (w, nome) => w.mapa.cidades.find((c) => norm(c.nome) === norm(nome)) || null;
/* só as cidades que um papel nomeia, e uma vez cada */
function existe(w) {
  if (cache.has(w.semente)) return cache.get(w.semente);
  const L = new Map(), G = new Map();
  const ls = (nome) => {
    const k = norm(nome);
    if (!L.has(k)) L.set(k, locaisDaCidade(w.semente, cidadeDe(w, nome)));
    return L.get(k);
  };
  const r = {
    locais: { get: (k) => new Set(ls(k).map((l) => norm(l.nome))) },
    gente: { get: (k) => { if (!G.has(k)) G.set(k, new Set(ls(k).flatMap((l) => genteDoLocal(w.semente, l)).map((p) => norm(p.nome)))); return G.get(k); } },
  };
  cache.set(w.semente, r);
  return r;
}

/* um papel do esqueleto aponta para o que existe? (a lei de saga.js) */
function papelExiste(w, k, decl, p, vilao) {
  const X = existe(w);
  if (!p || typeof p !== "object") return false;
  const de = decl.de;
  if (de === "cidade") return !!cidadeDe(w, p.cidade);
  if (de === "lugar") return !!cidadeDe(w, p.cidade) && X.locais.get(norm(p.cidade)).has(norm(p.nome)) && typeof p.chave === "string" && p.chave.includes("|");
  /* (o «querido do herói» — o refém do confronto — sai do núcleo, que é gente
     do elenco e pode não ser da base daquela cidade) */
  if (de === "elenco") return !!p.nome && ((!!cidadeDe(w, p.cidade) && X.gente.get(norm(p.cidade)).has(norm(p.nome))) || (Array.isArray(decl.exige) && decl.exige.includes("querido_do_heroi") && w.nucleo.pessoas.some((x) => x.nome === p.nome)));
  if (de === "fio") return !!p.nome && (vilao.tenentes.some((x) => x.nome === p.nome) || norm(w.espinha.fio.antagonista).startsWith(norm(p.nome)));
  if (de === "grupo") return !!p.nome && w.nucleo.pessoas.some((x) => x.nome === p.nome && (ESQUELETO.grupo.includes(x.papel) || (x.papel === "porta" && vilao.ponte && vilao.ponte.com === "porta")));
  if (de === "item") return typeof p.nome === "string" && p.nome.trim().length > 0;
  return false;
}

/* um esqueleto inteiro é válido? — devolve a lista de defeitos */
function defeitos(w, k, catalogo) {
  const out = [];
  const ficha = (id) => catalogo.find((q) => q.id === id);
  const forma = { comp: COMPOSICAO_DA_MAO[k.atos.length], passo: PASSO_DO_ATO[k.atos.length], quando: QUANDO_DO_ATO[k.atos.length], janelas: JANELAS_DO_CORACAO[k.atos.length] };
  if (k.atos.length !== w.espinha.atos.length) out.push("o número de atos não é o da espinha");
  const ids = [...k.atos.filter((a) => a.quest).map((a) => a.quest), ...k.coracao.map((c) => c.quest)];
  if (new Set(ids).size !== ids.length) out.push("quest repetida");
  const todas = [...k.atos.filter((a) => a.quest).map((a) => ({ q: ficha(a.quest), papeis: a.papeis, a })), ...k.coracao.map((c) => ({ q: ficha(c.quest), papeis: c.papeis, c }))];
  const familia = k.fraqueza ? k.fraqueza.familia : null;
  for (const { q, papeis, a, c } of todas) {
    if (!q) { out.push("quest fora do catálogo"); continue; }
    for (const [nome, decl] of Object.entries(q.papeis)) {
      /* A EXCEÇÃO DECLARADA (lote 2 do acervo, 08/11): o papel com a pista
         `fraqueza` de OUTRA família fica vazio de propósito, e listado em
         `vazios`; o da família do vilão é a fraqueza do registo, o mesmo nome */
      if (typeof decl.fraqueza === "string" && decl.fraqueza !== familia) {
        if (papeis[nome] !== undefined) out.push(`${q.id}.${nome}: fraqueza de outra família ligada`);
        if (a && !(a.vazios || []).includes(nome)) out.push(`${q.id}.${nome}: vazio sem estar declarado`);
        continue;
      }
      if (typeof decl.fraqueza === "string" && (!papeis[nome] || norm(papeis[nome].nome) !== norm(k.vilao.papeis.fraqueza.nome))) out.push(`${q.id}.${nome}: não é a fraqueza do vilão`);
      if (!papelExiste(w, k, decl, papeis[nome], k.vilao)) out.push(`${q.id}.${nome} vazio ou fora do mundo (${J(papeis[nome])})`);
    }
    if (a) {
      if (!q.mao.contra.includes(a.passo)) out.push(`${q.id} não contesta o passo ${a.passo} do ato ${a.ato}`);
      if (!q.quando.includes(forma.quando[a.ato])) out.push(`${q.id} fora do seu «quando» no ato ${a.ato}`);
      if (!a.maos.includes(a.mao)) out.push(`${q.id} entrou por uma mão que o ato não pede`);
    }
  }
  /* nenhuma pessoa em dois papéis do tipo 1 (o fio — tenentes e vilão — é
     o único que atravessa; o coração pode partilhar com o tipo 1, que é a
     forma mais forte da ponte) */
  const gente1 = k.atos.filter((a) => a.quest).flatMap((a) => Object.entries(a.papeis).filter(([n]) => ficha(a.quest).papeis[n].de === "elenco").map(([, p]) => norm(p.nome)));
  if (new Set(gente1).size !== gente1.length) out.push("a mesma pessoa em dois papéis do tipo 1");
  const gente2 = k.coracao.flatMap((c) => Object.entries(c.papeis).filter(([n]) => ["elenco", "grupo"].includes(ficha(c.quest).papeis[n].de)).map(([, p]) => norm(p.nome)));
  if (new Set(gente2).size !== gente2.length) out.push("a mesma pessoa em duas histórias do coração");
  if (k.coracao.length > ESQUELETO.coracao) out.push("coração a mais");
  const janelas = k.coracao.map((c) => c.atos);
  if (janelas.flat().length !== new Set(janelas.flat()).size) out.push("duas do coração na mesma janela");
  /* a fraqueza: posta em TODAS, no papel que a família pede */
  if (!k.fraqueza || !k.vilao.papeis.fraqueza) out.push("a fraqueza não ficou posta");
  else {
    const fam = k.fraqueza.familia;
    const tipo = { pessoa: "pessoa", verdade: "lugar", coisa: "item" }[fam];
    if (k.vilao.papeis.fraqueza.tipo !== tipo) out.push("a fraqueza no papel errado");
    if (!k.atos[k.fraqueza.ato] || !k.atos[k.fraqueza.ato].fraqueza) out.push("o ato da fraqueza não está marcado");
    if (k.fraqueza.quest && k.atos[k.fraqueza.ato].quest !== k.fraqueza.quest) out.push("a quest da fraqueza não é a do ato");
  }
  for (let n = 1; n <= LIMITES_DA_QUEST.passosDoPlano; n++) if (!k.vilao.papeis[`passo_${n}`] || k.vilao.papeis[`passo_${n}`].tipo !== "lugar") out.push(`o passo ${n} sem lugar`);
  return out;
}

/* ---------------- o catálogo cheio, sintético ----------------
   Cópias das três fichas da planta, com outro id e outra mão: a escolha do
   esqueleto só lê a mão, o «contra», o «quando», o «afim» e os papéis, e
   por isso uma cópia mede o algoritmo tão bem como uma quest escrita. `k`
   cópias por mão; o tipo 2, `k` cópias da Carta.
   TE1 (09/11): a cópia que muda o «quando» muda também a temperatura — a
   ficha já não pode dizer «meio e fim» e aquecer como uma chama (a catraca
   TEMPERATURA_DO_QUANDO), e a do molde era a da quest copiada. */
const MOLDES_DA_MAO = [
  { mao: "tenente", contra: [1, 2], quando: ["cedo", "meio"], temperatura: "chama", de: "o_salvo_conduto" },
  { mao: "recurso", contra: [2, 3], quando: ["cedo", "meio"], temperatura: "chama", de: "as_cinzas_de_ontem" },
  { mao: "consequencia", contra: [3], quando: ["meio"], temperatura: "chama", de: "as_cinzas_de_ontem" },
  { mao: "pista", contra: [3, 4], quando: ["meio", "fim"], temperatura: "fogueira", de: "as_cinzas_de_ontem" },
  { mao: "rosto", contra: [5], quando: ["fim"], temperatura: "fogueira", de: "as_cinzas_de_ontem" },
  { mao: "confronto", contra: [6], quando: ["fim"], temperatura: "incendio", de: "as_cinzas_de_ontem" },
];
const clonar = (x) => JSON.parse(JSON.stringify(x));
function catalogoCheio(k) {
  const out = [];
  for (let i = 0; i < k; i++) {
    for (const m of MOLDES_DA_MAO) {
      const q = clonar(questPorId(m.de));
      q.id = `${m.mao}_${i}`; delete q.enredo;
      q.quando = [...m.quando]; q.temperatura = m.temperatura; q.afim = i % 2 ? ["jornada", "misterio"] : ["arquipelago", "reinado"];
      q.mao = { ...q.mao, tipo: m.mao, contra: [...m.contra] };
      if (q.mao.tambem) delete q.mao.tambem;
      /* lote 3 (08/11): o servo passou a ter natureza (gente, por omissão;
         NATUREZAS_DO_FIO), e um mundo cujos servos são todos bichos já não
         dá o Salvo-Conduto nem as Cinzas. As cópias medem a ESCOLHA (a mão,
         o passo, o «quando»), não a natureza — que tem a régua dela no §2 —,
         por isso aceitam as duas */
      for (const p of Object.values(q.papeis)) if (p.de === "fio" && p.papel !== "vilao") p.aceita = Object.keys(NATUREZAS_DO_FIO);
      out.push(congelar(q));
    }
    const c = clonar(questPorId("a_carta_que_nao_se_abre"));
    c.id = `coracao_${i}`;
    out.push(congelar(c));
  }
  return out;
}
/* congeladas, as cópias ficam na cache de validarQuest como as do catálogo:
   cada esqueleto valida o catálogo inteiro, e sem a cache a suíte levava o
   triplo do tempo */
const CHEIO3 = catalogoCheio(3);
/* quantas pessoas do núcleo podem carregar uma história do coração */
/* lote 3 (08/11): quem do núcleo partilha o primeiro nome com o vilão ou
   com um servo dele não carrega uma história do coração (o livro acharia
   os dois pela mesma pessoa) — e não conta aqui */
const primeiroDe = (x) => norm(String(x || "").split(",")[0]).split(/\s+/)[0];
const doCoracao = (w, k) => {
  const doFio = new Set([w.espinha.fio.antagonista, ...k.vilao.tenentes.map((t) => t.nome)].map(primeiroDe));
  return w.nucleo.pessoas.filter((x) => (ESQUELETO.grupo.includes(x.papel) || (x.papel === "porta" && k.vilao.ponte && k.vilao.ponte.com === "porta")) && !doFio.has(primeiroDe(x.nome))).length;
};

/* ============================================================ */
sec("1. as tabelas");
{
  const ns = [...new Set(ESPINHAS.map((e) => estruturaPorId(e).etapas.length))].sort();
  t(`as quatro espinhas do menu têm 4, 5 ou 6 atos, e todas têm forma (${ns.join(", ")})`, ns.every((n) => COMPOSICAO_DA_MAO[n] && PASSO_DO_ATO[n] && QUANDO_DO_ATO[n] && JANELAS_DO_CORACAO[n]));
  for (const n of [4, 5, 6]) {
    const comp = COMPOSICAO_DA_MAO[n], passo = PASSO_DO_ATO[n], quando = QUANDO_DO_ATO[n], jan = JANELAS_DO_CORACAO[n];
    t(`${n} atos: uma linha por ato nas três tabelas`, comp.length === n && passo.length === n && quando.length === n);
    t(`${n} atos: toda mão é do vocabulário (MAOS_DO_VILAO)`, comp.every((l) => l.length && l.every((m) => MAOS_DO_VILAO[m])));
    t(`${n} atos: os passos sobem, de 1 a ${LIMITES_DA_QUEST.passosDoPlano}, e cada ato contesta um diferente`, passo.every((p, i) => p >= 1 && p <= LIMITES_DA_QUEST.passosDoPlano && (i === 0 || p > passo[i - 1])));
    t(`${n} atos: o último é o confronto, no último passo`, comp[n - 1].join() === "confronto" && passo[n - 1] === LIMITES_DA_QUEST.passosDoPlano);
    t(`${n} atos: o rosto no penúltimo`, comp[n - 2].includes("rosto"));
    t(`${n} atos: há um ato de pista (a que dá a fraqueza)`, comp.some((l) => l.includes("pista")));
    t(`${n} atos: o «quando» é do vocabulário, e começa cedo e acaba no fim`, quando.every((q) => QUANDO_DA_QUEST.includes(q)) && quando[0] === "cedo" && quando[n - 1] === "fim");
    t(`${n} atos: ${ESQUELETO.coracao} janelas do coração, de 2 ou 3 atos, sem se sobreporem`, jan.length === ESQUELETO.coracao && jan.every((j) => j.length >= 2 && j.length <= 3 && j.every((a) => a >= 0 && a < n)) && new Set(jan.flat()).size === jan.flat().length);
  }
  /* a planta, §11.3, palavra por palavra: para 5 atos, um tenente, um recurso
     ou consequência, a pista, o rosto no penúltimo e o confronto no fim */
  t("para 5 atos é a composição da planta", J(COMPOSICAO_DA_MAO[5]) === J([["tenente"], ["recurso", "consequencia"], ["pista"], ["rosto"], ["confronto"]]));
  t("e os passos da Ilídia (§11.9): 1, 3, 4, 5, 6", J(PASSO_DO_ATO[5]) === J([1, 3, 4, 5, 6]));
  t("a planta pede duas do tipo 2", ESQUELETO.coracao === 2);
  t("a afinidade pesa mais do que nada, e não tranca (peso finito)", ESQUELETO.afim > ESQUELETO.base && ESQUELETO.base > 0);
  /* PAPEIS_DA_QUEST.grupo: «o companheiro, ou o elo» — a porta só pela ponte */
  t("a ordem do núcleo para um papel do grupo é a dos papéis que andam com o herói", J(ESQUELETO.grupo) === J(["companheiro", "elo"]) && /companheiro.*elo/.test(PAPEIS_DA_QUEST.grupo.diz));
  t("todo plano (os quatro e o recuo) tem a mão de cada ato da composição no passo dele ou na composição", Object.values(PLANOS_DO_ARQUETIPO).every((p) => p.length === LIMITES_DA_QUEST.passosDoPlano) && PLANO_DE_RECUO.contra.length === LIMITES_DA_QUEST.passosDoPlano);
}

sec(`2. MIL SEMENTES, num mundo real, com o catálogo vivo (${BIBLIOTECA_DE_QUESTS.length} quests)`);
const VIVOS = [], CHEIOS = [], DE_HOJE = [];
{
  let nulos = 0, comDefeito = 0, primeiro = "", fraquezaPorQuest = 0, abriram = 0, abrir = 0, pelaFicha = 0, comCimo = 0, cimoAbre = 0;
  for (const w of MUNDOS) {
    const k = esqueletoDaCampanha(entradaDe(w));
    VIVOS.push(k);
    if (!k) { nulos++; continue; }
    const d = defeitos(w, k, BIBLIOTECA_DE_QUESTS);
    if (d.length) { comDefeito++; if (!primeiro) primeiro = `${w.semente}: ${d[0]}`; }
    if (k.fraqueza && k.fraqueza.quest) fraquezaPorQuest++;
    /* a quest que entrega a fraqueza pelo papel (a pista `fraqueza` da ficha) */
    const qf = k.fraqueza && k.fraqueza.quest ? questPorId(k.fraqueza.quest) : null;
    if (qf && Object.values(qf.papeis).some((d) => d.fraqueza === k.fraqueza.familia)) pelaFicha++;
    const cimo = k.atos.find((a) => a.quest === "o_cimo_da_escada");
    if (cimo) {
      comCimo++;
      /* e o confronto abre, com os dois papéis de fraqueza vazios */
      if (abrirQuest(cimo.quest, { estado: { dia: 1 }, papeis: cimo.papeis }) && (cimo.vazios || []).length === 2) cimoAbre++;
    }
    /* a quest abre com os papéis que recebeu (a forma de abrirQuest) */
    if (abrir < 200) {
      for (const a of k.atos.filter((x) => x.quest)) { abrir++; if (abrirQuest(a.quest, { estado: { dia: 1 }, papeis: a.papeis })) abriram++; }
    }
  }
  t(`as ${N} sementes dão esqueleto`, nulos === 0, `${nulos} nulos`);
  t(`todas válidas: nenhum papel vazio, nenhuma quest repetida, todo papel no que existe, a fraqueza posta`, comDefeito === 0, primeiro);
  t(`toda quest escolhida abre com os papéis que o esqueleto lhe deu (${abriram}/${abrir})`, abrir > 0 && abriram === abrir);
  console.log(`      · a fraqueza entregue por uma quest da biblioteca: ${pct(fraquezaPorQuest, N)}% (o resto cai no ato da pista, no marco antigo); pelo papel de fraqueza da ficha: ${pct(pelaFicha, N)}%`);
  if (questPorId("o_cimo_da_escada")) t(`o Cimo da Escada abre com os dois papéis de outra família vazios e declarados (${cimoAbre}/${comCimo})`, comCimo > 0 && cimoAbre === comCimo);
  t("com o catálogo vivo, alguma fraqueza já vem de uma quest", fraquezaPorQuest > 0);

  /* O LOTE 3 (08/11): os acertos que o esqueleto apontou no lote 2.
     1. Um servo que é bicho (o chefe sem vírgula, «Espécie Título» —
        chefesDoMundo) só ocupa um papel do fio que aceite a fera
        (NATUREZAS_DO_FIO; por omissão, PAPEIS_DA_QUEST.fio.aceita: gente):
        a Quimera já não paga o fogo das Cinzas.
     2. O servo com o título do vilão no nome nunca entra numa quest antes do
        ato do rosto: o nome dele chega à tela quando o herói o vê, e diria o
        título do vilão antes da cara.
     3. Toda quest do catálogo entra em alguma campanha (o Celeiro de Inverno
        só contestava o passo 4, que a pista ganha sempre, e dava 0 em 1000). */
  const norm2 = (x) => norm(x);
  let bichos = 0, bichoEmGente = 0, genteEmFera = 0, comTitulo = 0, tituloAntes = 0;
  const vezes = {};
  for (const [i, w] of MUNDOS.entries()) {
    const k = VIVOS[i];
    if (!k) continue;
    const bicho = new Set(w.chefes.filter((c) => c.especie && !String(c.nome).includes(",") && norm2(c.nome).startsWith(norm2(c.especie))).map((c) => norm2(c.nome)));
    const tituloDe = (c) => (c.nome.includes(", ") ? c.nome.split(", ").slice(1).join(", ") : c.nome.slice(String(c.especie || "").length).trim());
    const doVilao = norm2(w.espinha.fio.titulo);
    const comOTitulo = new Set(w.chefes.filter((c) => c.linha !== "principal" && norm2(tituloDe(c)) === doVilao).map((c) => norm2(c.nome)));
    const atoDoRosto = k.atos.findIndex((a) => a.maos.includes("rosto"));
    for (const a of k.atos.filter((x) => x.quest)) {
      const q = questPorId(a.quest);
      for (const [nm, p] of Object.entries(a.papeis)) {
        const d = q.papeis[nm];
        if (d.de !== "fio" || d.papel === "vilao") continue;
        if (J(d.aceita) === J(["fera"]) && !bicho.has(norm2(p.nome))) genteEmFera++;
        if (bicho.has(norm2(p.nome))) { bichos++; if (!(d.aceita || PAPEIS_DA_QUEST.fio.aceita).includes("fera")) bichoEmGente++; }
        if (comOTitulo.has(norm2(p.nome))) { comTitulo++; if (a.ato < atoDoRosto) tituloAntes++; }
      }
    }
    for (const id of [...k.atos.map((a) => a.quest), ...k.coracao.map((c) => c.quest)].filter(Boolean)) vezes[id] = (vezes[id] || 0) + 1;
  }
  t(`um servo que é bicho só ocupa um papel que aceita a fera (${bichos} postos, ${bichoEmGente} em papel de gente; ${genteEmFera} gente em papel só de fera)`, bichos > 0 && bichoEmGente === 0 && genteEmFera === 0 && Object.keys(NATUREZAS_DO_FIO).includes("fera"));
  t(`o servo com o título do vilão nunca entra antes do ato do rosto (${comTitulo} postos, ${tituloAntes} antes)`, tituloAntes === 0);
  const nunca = BIBLIOTECA_DE_QUESTS.filter((q) => !vezes[q.id]).map((q) => q.id);
  t(`toda quest do catálogo entra em alguma das ${N} campanhas (o Celeiro em ${vezes.o_celeiro_de_inverno || 0})`, nunca.length === 0, nunca.join(", "));
  console.log(`      · quantas vezes cada quest entra, em ${N}: ${BIBLIOTECA_DE_QUESTS.map((q) => `${q.id} ${vezes[q.id] || 0}`).join(" · ")}`);
  /* os passos que ficam sem quest que os conteste, por número de atos — o
     alvo da planta é zero; o lote 2 deixava o 4 sem ninguém em todas as
     espinhas de quatro atos */
  const semC = {};
  for (const k of VIVOS) { if (!k) continue; const n = k.atos.length; semC[n] = semC[n] || { campanhas: 0 }; semC[n].campanhas++; for (const p of k.semContestacao) semC[n][p] = (semC[n][p] || 0) + 1; }
  console.log(`      · passos sem quest que os conteste (atos → { passo: campanhas }): ${J(semC)}`);
  t("com quatro atos, o passo 4 já é contestado em parte das campanhas (o lote 3: O Último a Sair, 3 e 4)", semC[4] && (semC[4][4] || 0) < semC[4].campanhas);

  /* O LOTE 4 (09/11): o que o esqueleto mediu no lote 3, agora catraca.
     1. O vilão que é bicho (o chefe principal sem vírgula, a régua de
        naturezaDe) nunca ocupa o papel `vilao` de uma quest que não o
        aceite — já não se senta à mesa do Convite nem paga o Velório —, e
        tem rosto e confronto na mesma (as quests que o aceitam).
     2. Nos mundos sem nenhum servo que seja gente, o passo 3 é contestado.
     3. O passo 4 das espinhas de quatro atos ficava por contestar em 216 de
        500 campanhas; o lote 4 (O Enforcado de Amanhã, do meio, 3 e 4) baixa-o. */
  let feras = 0, feraForaDoQueAceita = 0, feraComRosto = 0, feraDemonstracao = 0, semServoGente = 0, semGenteP3 = 0;
  for (const [i, w] of MUNDOS.entries()) {
    const k = VIVOS[i];
    if (!k) continue;
    const ehBicho = (c) => c && c.especie && !String(c.nome).includes(",") && norm2(c.nome).startsWith(norm2(c.especie));
    const principal = w.chefes.find((c) => norm2(c.nome) === norm2(w.espinha.fio.antagonista));
    const servos = k.vilao.tenentes.map((x) => w.chefes.find((c) => norm2(c.nome) === norm2(x.nome)));
    if (servos.length && servos.every(ehBicho)) { semServoGente++; if (!k.semContestacao.includes(3)) semGenteP3++; }
    if (!ehBicho(principal)) continue;
    feras++;
    for (const a of k.atos.filter((x) => x.quest)) {
      const v = Object.values(questPorId(a.quest).papeis).find((p) => p.de === "fio" && p.papel === "vilao");
      if (v && !(v.aceita || PAPEIS_DA_QUEST.fio.aceitaOVilao).includes("fera")) feraForaDoQueAceita++;
    }
    const rosto = k.atos.find((a) => a.mao === "rosto");
    if (rosto) { feraComRosto++; if (J(Object.values(questPorId(rosto.quest).papeis).find((p) => p.papel === "vilao").aceita) === J(["fera"])) feraDemonstracao++; }
  }
  console.log(`      · vilão-bicho: ${feras} mundos; numa quest que não o aceita: ${feraForaDoQueAceita}; com rosto: ${feraComRosto}, dos quais de demonstração (só de fera): ${feraDemonstracao}`);
  console.log(`      · mundos sem nenhum servo gente: ${semServoGente}; com o passo 3 contestado: ${semGenteP3}`);
  t("o vilão que é bicho nunca se senta numa cena que não o aceita (o Convite, o Velório), e tem um rosto de demonstração em parte dos mundos",
    feras > 0 && feraForaDoQueAceita === 0 && feraDemonstracao > 0);
  t("nos mundos sem nenhum servo gente, o passo 3 é contestado na mesma (um servo que pode ser bicho)", semServoGente > 0 && semGenteP3 === semServoGente, `${semGenteP3}/${semServoGente}`);
  t("com quatro atos, o passo 4 fica por contestar em menos de um quarto das campanhas (eram 216 de 500 antes do lote 4)", semC[4] && (semC[4][4] || 0) < semC[4].campanhas / 4, `${semC[4] && semC[4][4]}/${semC[4] && semC[4].campanhas}`);

  /* 4. O PRIMEIRO NOME: o livro e o registo da gente acham alguém também pelo
     primeiro nome — «Osric» da cidade e «Osric Passo-de-Gato, a Praga Mansa»
     ficavam com o mesmo id. Nenhum papel de gente partilha o primeiro nome
     com o vilão, com um servo dele, ou com outra pessoa da mesma quest. */
  const p1 = (x) => norm(String(x || "").split(",")[0]).split(/\s+/)[0];
  let colide = 0, primeiraColisao = "";
  for (const [i, w] of MUNDOS.entries()) {
    const k = VIVOS[i];
    if (!k) continue;
    const doFio = new Set([w.espinha.fio.antagonista, ...k.vilao.tenentes.map((x) => x.nome)].map(p1));
    for (const { id, papeis } of [...k.atos.filter((a) => a.quest).map((a) => ({ id: a.quest, papeis: a.papeis })), ...k.coracao.map((c) => ({ id: c.quest, papeis: c.papeis }))]) {
      const q = questPorId(id);
      const gente = Object.entries(papeis).filter(([nm]) => ["elenco", "grupo"].includes(q.papeis[nm].de) && !q.papeis[nm].fraqueza).map(([, p]) => p.nome);
      const vistos = new Set();
      for (const nome of gente) {
        const pn = p1(nome);
        if (doFio.has(pn) || vistos.has(pn)) { colide++; if (!primeiraColisao) primeiraColisao = `${w.semente} ${id}: ${nome}`; }
        vistos.add(pn);
      }
    }
  }
  t("nenhum papel de gente partilha o primeiro nome com o vilão, um servo dele, ou outra pessoa da mesma quest", colide === 0, primeiraColisao);

  /* 5. O TIPO DE SÍTIO que a ficha prefere (`tipos`) existe no mundo, e é
     o que o esqueleto escolhe quando a cidade o tem */
  const tiposDoMundo = new Set();
  for (const w of MUNDOS.slice(0, 40)) for (const c of w.mapa.cidades) for (const l of locaisDaCidade(w.semente, c)) tiposDoMundo.add(l.tipo);
  const pedidos = BIBLIOTECA_DE_QUESTS.flatMap((q) => Object.values(q.papeis).flatMap((p) => p.tipos || []));
  t(`todo tipo de sítio que uma ficha prefere existe no mundo (${new Set(pedidos).size} pedidos)`, pedidos.length > 0 && pedidos.every((x) => tiposDoMundo.has(x)), pedidos.filter((x) => !tiposDoMundo.has(x)).join(", "));
  let comTipo = 0, doTipo = 0;
  for (const [i, w] of MUNDOS.entries()) {
    const k = VIVOS[i];
    if (!k) continue;
    for (const { id, papeis } of [...k.atos.filter((a) => a.quest).map((a) => ({ id: a.quest, papeis: a.papeis })), ...k.coracao.map((c) => ({ id: c.quest, papeis: c.papeis }))]) {
      const q = questPorId(id);
      for (const [nm, p] of Object.entries(papeis)) {
        const d = q.papeis[nm];
        if (d.de !== "lugar" || !d.tipos || !p.chave) continue;
        const tipoDaCidade = locaisDaCidade(w.semente, cidadeDe(w, p.cidade)).map((l) => l.tipo);
        if (!tipoDaCidade.some((x) => d.tipos.includes(x))) continue;
        comTipo++;
        if (d.tipos.some((x) => p.chave.endsWith("|" + x))) doTipo++;
      }
    }
  }
  console.log(`      · o sítio do tipo preferido, quando a cidade o tem: ${doTipo} de ${comTipo}`);
  t("quando a cidade tem o sítio do tipo que a ficha prefere, o esqueleto escolhe-o em quatro de cada cinco vezes ou mais (o resto: já ocupado por outra quest, ou o vizinho que o evita)", comTipo > 0 && doTipo / comTipo > 0.8, `${doTipo}/${comTipo}`);
}

/* O LOTE 6 (BQ8, 08/11): o que o esqueleto mediu com o catálogo de 27, agora
   catraca. Antes do lote: o passo 4 das espinhas de quatro atos ficava por
   contestar em 81 de 500 campanhas, e só O Enforcado de Amanhã o cobria (564
   de 1000); o rosto e o confronto tinham quatro e três quests para um ato
   em todas as mil; e duas campanhas partilhavam 1,64 quests em média.
   1. o passo 4 de quatro atos por contestar em menos de uma campanha em dez;
   2. cada quest do lote entra, e os dois rostos e os dois confrontos só com
      o vilão da natureza que a ficha aceita (a Tempestade com as duas);
   3. a pista que entrega a fraqueza pelo papel (O Que a Ama Esqueceu) entrega-a;
   4. a partilha média do catálogo vivo abaixo de 1,3 (era 1,64). */
sec("2b. o lote 6 (BQ8) — o passo 4 de quatro atos, os rostos e os confrontos novos, e a partilha");
{
  const LOTE6 = QUESTS_LOTE_6.map((q) => q.id);
  const ehBicho6 = (c) => !!c && !!c.especie && !String(c.nome).includes(",") && norm(c.nome).startsWith(norm(c.especie));
  const vezes6 = {}, natureza6 = {}, semP4 = { campanhas: 0, sem: 0 };
  let pelaAma = 0, comAma = 0;
  for (const [i, w] of MUNDOS.entries()) {
    const k = VIVOS[i];
    if (!k) continue;
    const principal = w.chefes.find((c) => norm(c.nome) === norm(w.espinha.fio.antagonista));
    const nat = ehBicho6(principal) ? "fera" : "gente";
    for (const id of [...k.atos.map((a) => a.quest), ...k.coracao.map((c) => c.quest)].filter((x) => LOTE6.includes(x))) {
      vezes6[id] = (vezes6[id] || 0) + 1;
      natureza6[id] = { ...(natureza6[id] || {}), [nat]: ((natureza6[id] || {})[nat] || 0) + 1 };
    }
    if (k.atos.length === 4) { semP4.campanhas++; if (k.semContestacao.includes(4)) semP4.sem++; }
    if (k.atos.some((a) => a.quest === "o_que_a_ama_esqueceu")) { comAma++; if (k.fraqueza && k.fraqueza.quest === "o_que_a_ama_esqueceu") pelaAma++; }
  }
  console.log(`      · o lote 6, quantas vezes cada quest entra em ${N}: ${LOTE6.map((id) => `${id} ${vezes6[id] || 0}`).join(" · ")}`);
  console.log(`      · com quatro atos, o passo 4 por contestar: ${semP4.sem} de ${semP4.campanhas} (eram 81 de 500 antes do lote 6)`);
  t("cada quest do lote 6 entra em alguma campanha", LOTE6.every((id) => vezes6[id] > 0), LOTE6.filter((id) => !vezes6[id]).join(", "));
  t("com quatro atos, o passo 4 fica por contestar em menos de uma campanha em dez (eram 81 de 500)", semP4.campanhas > 0 && semP4.sem < semP4.campanhas / 10, `${semP4.sem}/${semP4.campanhas}`);
  const aceitaDe = (id) => { const v = Object.values(questPorId(id).papeis).find((p) => p.de === "fio" && p.papel === "vilao"); return (v && v.aceita) || PAPEIS_DA_QUEST.fio.aceitaOVilao; };
  const novas = ["os_dados_dele", "a_mesma_tempestade", "a_nona_noite", "o_ultimo_barco"];
  t("os dois rostos e os dois confrontos do lote 6 entram só com o vilão da natureza que aceitam",
    novas.every((id) => Object.keys(natureza6[id] || {}).length > 0 && Object.keys(natureza6[id]).every((n) => aceitaDe(id).includes(n))), J(natureza6));
  t("a mesma tempestade serve as duas naturezas, e a nona noite é de uma fera",
    ["gente", "fera"].every((n) => (natureza6.a_mesma_tempestade || {})[n] > 0) && J(Object.keys(natureza6.a_nona_noite || {})) === J(["fera"]));
  console.log(`      · O Que a Ama Esqueceu entrega a fraqueza pelo papel em ${pelaAma} das ${comAma} campanhas onde entra`);
  t("a pista do lote 6 que traz os papéis da fraqueza entrega-a em parte das campanhas onde entra", comAma > 0 && pelaAma > 0, `${pelaAma}/${comAma}`);
  let s6 = 0, n6 = 0;
  for (let i = 0; i + 1 < VIVOS.length; i += 2) {
    if (!VIVOS[i] || !VIVOS[i + 1]) continue;
    const a = new Set([...VIVOS[i].atos.map((x) => x.quest), ...VIVOS[i].coracao.map((c) => c.quest)].filter(Boolean));
    s6 += [...VIVOS[i + 1].atos.map((x) => x.quest), ...VIVOS[i + 1].coracao.map((c) => c.quest)].filter((id) => id && a.has(id)).length; n6++;
  }
  const part6 = Math.round((100 * s6) / n6) / 100;
  t(`duas campanhas partilham em média menos de 1,3 quests com o catálogo vivo (${part6}; era 1,64 antes do lote 6)`, part6 < 1.3, String(part6));
}

sec("2c. o lote 5 (BQ8) — o ato 0 de todas as campanhas, as pistas do 3 e do 4, e o vilão que é bicho lido no chão");
{
  /* O lote 5 (09/11) foi escrito para o que o esqueleto mediu com 27
     quests: o ato 0 (o passo 1, «cedo») de mil campanhas tinha quatro
     tenentes; nos 188 mundos sem nenhum servo gente só O Que Desce ao
     Anoitecer servia; O Enforcado de Amanhã entrava em mais de metade das
     campanhas, porque as pistas do 3 e do 4 eram três; e nenhuma quest do
     meio servia o vilão que é bicho (549 de 1000). Medido sem o lote 6
     (scratchpad, 09/11): a partilha desce de 1,67 para 1,17, o passo 4 de
     quatro atos por contestar de 73 para 22 de 500, o Enforcado de 582
     para 271. Aqui, com o catálogo vivo, as catracas. */
  const LOTE5 = QUESTS_LOTE_5.map((q) => q.id);
  const ehBicho5 = (c) => !!c && !!c.especie && !String(c.nome).includes(",") && norm(c.nome).startsWith(norm(c.especie));
  const vezes5 = {}, doAto0 = {};
  let ato0 = 0, semGente5 = 0, semGenteComPao = 0, pegadasComGente = 0, pegadasComFera = 0, paoComServoGente = 0;
  for (const [i, w] of MUNDOS.entries()) {
    const k = VIVOS[i];
    if (!k) continue;
    for (const id of [...k.atos.map((a) => a.quest), ...k.coracao.map((c) => c.quest)].filter((x) => LOTE5.includes(x))) vezes5[id] = (vezes5[id] || 0) + 1;
    const a0 = k.atos[0];
    if (a0 && a0.quest) { ato0++; doAto0[a0.quest] = (doAto0[a0.quest] || 0) + 1; }
    const principal = w.chefes.find((c) => norm(c.nome) === norm(w.espinha.fio.antagonista));
    if (k.atos.some((a) => a.quest === "as_pegadas_no_barro")) { if (ehBicho5(principal)) pegadasComFera++; else pegadasComGente++; }
    const pao = k.atos.find((a) => a.quest === "o_pao_que_sai_de_noite");
    if (pao) { const servo = w.chefes.find((c) => norm(c.nome) === norm(pao.papeis.fera.nome)); if (!ehBicho5(servo)) paoComServoGente++; }
    const servos = k.vilao.tenentes.map((x) => w.chefes.find((c) => norm(c.nome) === norm(x.nome)));
    if (servos.length && servos.every(ehBicho5)) { semGente5++; if (pao && pao.ato === 0) semGenteComPao++; }
  }
  const maiorAto0 = Object.entries(doAto0).sort((x, y) => y[1] - x[1])[0] || ["", 0];
  console.log(`      · o lote 5, quantas vezes cada quest entra em ${N}: ${LOTE5.map((id) => `${id} ${vezes5[id] || 0}`).join(" · ")}`);
  console.log(`      · o ato 0: ${Object.keys(doAto0).length} quests diferentes em ${ato0} campanhas; a que mais entra, ${maiorAto0[0]}, em ${maiorAto0[1]}`);
  console.log(`      · nos ${semGente5} mundos sem nenhum servo gente, O Pão Que Sai de Noite abre a campanha em ${semGenteComPao}`);
  console.log(`      · As Pegadas no Barro: ${pegadasComFera} com o vilão bicho, ${pegadasComGente} com o vilão gente`);
  t("cada quest do lote 5 entra em alguma campanha", LOTE5.every((id) => vezes5[id] > 0), LOTE5.filter((id) => !vezes5[id]).join(", "));
  t("o ato 0 de todas as campanhas reparte-se: nenhuma quest abre mais de uma campanha em quatro", ato0 > 0 && maiorAto0[1] < ato0 / 4, `${maiorAto0[0]} ${maiorAto0[1]}/${ato0}`);
  t("nos mundos sem nenhum servo gente, o tenente que é bicho do cedo abre parte das campanhas (já não é só O Que Desce ao Anoitecer)", semGente5 > 0 && semGenteComPao > 0, `${semGenteComPao}/${semGente5}`);
  t("a pista do vilão que é bicho só entra nos mundos em que ele é bicho, e entra", pegadasComFera > 0 && pegadasComGente === 0, `${pegadasComFera}/${pegadasComGente}`);
  t("e o tenente do Pão é sempre um bicho", paoComServoGente === 0 && (vezes5.o_pao_que_sai_de_noite || 0) > 0);
}

/* A TEMPERATURA E O GRAFO (TE4, 09/11). Medido em mil mundos com o
   esqueleto da BQ8 (mente/plano-temperatura-e-espolios.md, §1.2): 35
   campanhas com uma quest de rosto antes do ato do rosto (Os Dados Dele,
   pela mão `tambem`), e essas 35 com dois primeiros encontros; 315 com o
   coração do turno 0 em fogueira; 133 com a curva a descer, 7 a descer
   fundo ou duas vezes, 111 fora da curva. Agora, catracas. */
sec("2d. A TEMPERATURA E O GRAFO (TE4)");
{
  const G = (id) => TEMPERATURAS[id].ordem;
  const grauDe = (id) => G(questPorId(id).temperatura);
  const ORD = Object.fromEntries(FASES.map((f) => [f.id, f.ordem]));
  /* as tabelas */
  for (const n of [4, 5, 6]) {
    const cv = CURVA_DA_TEMPERATURA[n];
    t(`${n} atos: a curva tem um intervalo por ato, de graus que existem, do mais frio ao mais quente`, cv.length === n && cv.every((f) => f.length === 2 && TEMPERATURAS[f[0]] && TEMPERATURAS[f[1]] && G(f[0]) <= G(f[1])));
    t(`${n} atos: a curva nunca desce de um ato para o seguinte (nem o chão nem o teto)`, cv.every((f, i) => i === 0 || (G(f[0]) >= G(cv[i - 1][0]) && G(f[1]) >= G(cv[i - 1][1]))));
    t(`${n} atos: abre em brasa ou chama, o rosto é fogueira, o confronto incêndio`, J(cv[0]) === J(["brasa", "chama"]) && J(cv[n - 2]) === J(["fogueira", "fogueira"]) && J(cv[n - 1]) === J(["incendio", "incendio"]));
    /* o chão da curva é o do «quando» do ato (TEMPERATURA_DO_QUANDO) em todos
       os atos que podem respirar: uma ficha que cabe no ato nunca fica abaixo
       do intervalo — a curva só se quebra pelo respiro, dentro dele. O
       confronto (incêndio, num ato «fim» que aceita fogueira) é fechado. */
    t(`${n} atos: o chão da curva é o do «quando» de cada ato que pode respirar, e o teto é um grau que o «quando» aceita`, cv.every((f, i) => {
      const chao = Math.min(...TEMPERATURA_DO_QUANDO[QUANDO_DO_ATO[n][i]].map(G));
      return G(f[0]) === chao || i >= n - RESPIRO.fechados;
    }) && cv.every((f, i) => TEMPERATURA_DO_QUANDO[QUANDO_DO_ATO[n][i]].includes(f[1])));
    t(`${n} atos: o teto do coração da primeira janela cabe no primeiro ato`, G(TETO_DO_CORACAO[0]) <= G(cv[0][1]));
  }
  t("o respiro da planta: uma descida, de um grau, nunca nos dois últimos atos (o rosto e o confronto)", RESPIRO.descidas === 1 && RESPIRO.graus === 1 && RESPIRO.fechados === 2);
  t("o coração da primeira janela é no máximo chama; o da última, qualquer um", TETO_DO_CORACAO[0] === "chama" && G(TETO_DO_CORACAO[TETO_DO_CORACAO.length - 1]) === Math.max(...Object.values(TEMPERATURAS).map((x) => x.ordem)));
  /* o teto da revelação antes do ato do rosto é o de SOBE_A_CAMADA: a camada
     mais alta que não espera o ato (`ato`) */
  const semAto = FASES.filter((f) => !(SOBE_A_CAMADA[f.id] && SOBE_A_CAMADA[f.id].ato)).sort((a, b) => b.ordem - a.ordem)[0];
  t(`antes do ato do rosto, a revelação não passa de «${CAMADA_DO_ATO.antesDoRosto}» — a camada mais alta que não espera o ato (SOBE_A_CAMADA)`, !!semAto && semAto.id === CAMADA_DO_ATO.antesDoRosto && FASES.every((f) => !(SOBE_A_CAMADA[f.id] || {}).ato || f.ordem > ORD[CAMADA_DO_ATO.antesDoRosto]));
  t("o primeiro encontro é a camada do rosto, e só o rosto e o confronto ficam presos ao seu ato", J(CAMADA_DO_ATO.estreia) === J(["rosto"]) && CAMADA_DO_ATO.maoDoSeuAto.every((m) => MAOS_DO_VILAO[m]) && J(CAMADA_DO_ATO.maoDoSeuAto) === J(["rosto", "confronto"]));

  /* o grafo, conferido por fora: a condição garantida com o piso (o que as
     quests do tipo 1 de atos anteriores estabelecem) e o teto (o da revelação) */
  const ramos = (c) => c.slice(c[0] === "pelo_menos" ? 2 : 1);
  const atomos = (c) => (["todos", "algum", "nenhum", "pelo_menos"].includes(c[0]) ? ramos(c).flatMap(atomos) : [c]);
  const doJogo = (c) => atomos(c).some((x) => PRESSUPOSTOS[x[0]] && PRESSUPOSTOS[x[0]].garante !== "esqueleto");
  const vale = (c, piso, teto, quer) => {
    if (c[0] === "camada") return quer ? piso >= ORD[c[1]] : ORD[c[1]] > teto;
    if (c[0] === "nenhum") return quer ? ramos(c).every((x) => vale(x, piso, teto, false)) : ramos(c).some((x) => vale(x, piso, teto, true));
    if (c[0] === "todos") return quer ? ramos(c).every((x) => vale(x, piso, teto, true)) : ramos(c).some((x) => vale(x, piso, teto, false));
    if (c[0] === "algum") return quer ? ramos(c).some((x) => vale(x, piso, teto, true)) : ramos(c).every((x) => vale(x, piso, teto, false));
    return false;
  };
  const camadasDe = (q) => (q.estabelece || []).filter((c) => c[0] === "camada").map((c) => ORD[c[1]]);
  const violacoesDe = (k, cat) => {
    const ficha = (id) => cat.find((q) => q.id === id);
    const n = k.atos.length;
    const atoDoRosto = COMPOSICAO_DA_MAO[n].findIndex((c) => c.includes("rosto"));
    const pisoEm = (ato) => Math.max(0, ...k.atos.filter((a) => a.quest && a.ato < ato).flatMap((a) => camadasDe(ficha(a.quest))));
    const tetoEm = (ato) => (ato < atoDoRosto ? ORD[CAMADA_DO_ATO.antesDoRosto] : Math.max(...FASES.map((f) => f.ordem)));
    const out = [];
    const todas = [...k.atos.filter((a) => a.quest).map((a) => ({ q: ficha(a.quest), ato: a.ato })), ...k.coracao.map((c) => ({ q: ficha(c.quest), ato: c.atos[0] }))];
    for (const { q, ato } of todas) {
      for (const c of q.pressupoe || []) if (!doJogo(c) && !vale(c, pisoEm(ato), tetoEm(ato), true)) out.push(`${q.id} no ato ${ato}: ${J(c)} sem garantia`);
      for (const k2 of camadasDe(q)) if (k2 > tetoEm(ato)) out.push(`${q.id} estabelece no ato ${ato} uma camada que o ato não permite`);
    }
    return out;
  };

  let rostoAntes = 0, estreias = 0, coracao0 = 0, tetoJanela = 0, viol = 0, primeiraViol = "", descidas = 0, duas = 0, fechada = 0, funda = 0, fora = 0;
  const ondeDesce = {};
  for (const k of VIVOS) {
    if (!k) continue;
    const n = k.atos.length;
    const atoDoRosto = COMPOSICAO_DA_MAO[n].findIndex((c) => c.includes("rosto"));
    for (const a of k.atos.filter((x) => x.quest)) {
      const q = questPorId(a.quest);
      if ([q.mao.tipo, ...(q.mao.tambem || [])].includes("rosto") && a.ato !== atoDoRosto) rostoAntes++;
    }
    const ids = [...k.atos.map((a) => a.quest), ...k.coracao.map((c) => c.quest)].filter(Boolean);
    if (ids.filter((id) => (questPorId(id).estabelece || []).some((c) => J(c) === J(["camada", "rosto"]))).length > 1) estreias++;
    for (const [j, c] of k.coracao.entries()) {
      const teto = G(TETO_DO_CORACAO[Math.min(j, TETO_DO_CORACAO.length - 1)]);
      if (grauDe(c.quest) > teto) tetoJanela++;
      if (c.atos[0] === 0 && grauDe(c.quest) > G("chama")) coracao0++;
    }
    const v = violacoesDe(k, BIBLIOTECA_DE_QUESTS);
    if (v.length) { viol++; if (!primeiraViol) primeiraViol = v[0]; }
    let ant = null, d = 0;
    for (const a of k.atos.filter((x) => x.quest)) {
      const g = grauDe(a.quest);
      const [lo, hi] = CURVA_DA_TEMPERATURA[n][a.ato].map(G);
      if (g < lo || g > hi) fora++;
      if (ant != null && g < ant) {
        d++; ondeDesce[`${n}:${a.ato}`] = (ondeDesce[`${n}:${a.ato}`] || 0) + 1;
        if (a.ato >= n - RESPIRO.fechados) fechada++;
        if (ant - g > RESPIRO.graus) funda++;
      }
      ant = g;
    }
    if (d) descidas++;
    if (d > RESPIRO.descidas) duas++;
  }
  console.log(`      · com um respiro (uma descida de um grau): ${descidas} de ${N} campanhas — onde (atos:ato → campanhas): ${J(ondeDesce)}`);
  t(`nenhuma quest de rosto fora do ato do rosto (eram 35 de ${N})`, rostoAntes === 0, String(rostoAntes));
  t(`nenhuma campanha com dois primeiros encontros (eram 35 de ${N})`, estreias === 0, String(estreias));
  t(`nenhum coração do turno 0 acima de chama (eram 315 de ${N} em fogueira), e nenhum acima do teto da sua janela`, coracao0 === 0 && tetoJanela === 0, `${coracao0}/${tetoJanela}`);
  t("nenhuma violação do grafo: todo pressuposto do esqueleto garantido, nenhuma camada antes da hora", viol === 0, primeiraViol);
  t(`nenhuma quest fora do intervalo do seu ato (eram 111 de ${N} contra a curva da planta)`, fora === 0, String(fora));
  t("as descidas só pelo respiro: no máximo uma, de um grau, nunca nos dois últimos atos (eram 133 com descida, 7 fundas ou duplas)", duas === 0 && fechada === 0 && funda === 0, `${duas}/${fechada}/${funda}`);
  /* a variedade não cai: a curva e o grafo fecham portas, e a partilha média
     tem de ficar abaixo de uma quest (era 0,84 antes da TE4); nenhuma quest a zero */
  let s2 = 0, n2 = 0;
  for (let i = 0; i + 1 < VIVOS.length; i += 2) {
    const a = new Set([...VIVOS[i].atos.map((x) => x.quest), ...VIVOS[i].coracao.map((c) => c.quest)].filter(Boolean));
    s2 += [...VIVOS[i + 1].atos.map((x) => x.quest), ...VIVOS[i + 1].coracao.map((c) => c.quest)].filter((id) => id && a.has(id)).length; n2++;
  }
  const part = Math.round((100 * s2) / n2) / 100;
  const vezes = {};
  for (const k of VIVOS) for (const id of [...k.atos.map((a) => a.quest), ...k.coracao.map((c) => c.quest)].filter(Boolean)) vezes[id] = (vezes[id] || 0) + 1;
  t(`a variedade não cai: duas campanhas partilham em média menos de uma quest (${part}; era 0,84 antes da TE4)`, part < 1, String(part));
  t("e nenhuma quest do catálogo fica a zero", BIBLIOTECA_DE_QUESTS.every((q) => vezes[q.id] > 0), BIBLIOTECA_DE_QUESTS.filter((q) => !vezes[q.id]).map((q) => q.id).join(", "));

  /* A RESERVA (TE5): a quest do coração que espera no jogo leva a seguinte
     da mesma janela que não espera — com papéis no que existe, no teto da
     janela, e que não é nenhuma outra quest da campanha */
  let comEspera = 0, comReserva = 0, reservaMa = 0, primeiraMa = "";
  for (const [i, w] of MUNDOS.entries()) {
    const k = VIVOS[i];
    const g = garantirEsqueleto(k);
    for (const [j, c] of k.coracao.entries()) {
      const q = questPorId(c.quest);
      const espera = (q.pressupoe || []).some(doJogo);
      if (espera) comEspera++;
      if (!c.reserva) continue;
      comReserva++;
      const r = questPorId(c.reserva.quest);
      const outras = [...k.atos.map((a) => a.quest), ...k.coracao.map((x) => x.quest), ...k.coracao.filter((x) => x !== c && x.reserva).map((x) => x.reserva.quest)].filter(Boolean);
      const mal = !espera ? "reserva de uma quest que não espera"
        : !r || r.tipo !== 2 ? "a reserva não é do tipo 2"
        : (r.pressupoe || []).some(doJogo) ? "a reserva também espera"
        : G(r.temperatura) > G(TETO_DO_CORACAO[Math.min(j, TETO_DO_CORACAO.length - 1)]) ? "a reserva acima do teto da janela"
        : outras.includes(r.id) ? "a reserva repete outra quest da campanha"
        : Object.entries(r.papeis).find(([nm, d]) => !papelExiste(w, k, d, c.reserva.papeis[nm], k.vilao)) ? "a reserva com papel fora do mundo"
        : J(reservaDoCoracao(k, c.quest)) !== J({ id: r.id, tipo: 2, papeis: g.coracao[j].reserva.papeis }) ? "reservaDoCoracao não a devolve"
        : "";
      if (mal) { reservaMa++; if (!primeiraMa) primeiraMa = `${w.semente} ${c.quest}: ${mal}`; }
    }
  }
  console.log(`      · do coração que espera no jogo: ${comEspera}; com reserva: ${comReserva}`);
  t("a quest do coração que espera no jogo leva uma reserva (em nove de cada dez ou mais), e toda reserva é válida", comReserva > 0 && comReserva >= comEspera * 0.9 && reservaMa === 0, primeiraMa || `${comReserva}/${comEspera}`);
  t("a reserva atravessa o save (garantirEsqueleto) e a de quem não espera é null", (() => {
    const k = VIVOS.find((x) => x.coracao.some((c) => c.reserva));
    const c = k.coracao.find((x) => x.reserva);
    const g = garantirEsqueleto(JSON.parse(J(k)));
    const semR = VIVOS.flatMap((x) => x.coracao.map((cc) => [x, cc])).find(([, cc]) => !cc.reserva);
    return J(g.coracao.find((x) => x.quest === c.quest).reserva) === J(c.reserva) && (!semR || reservaDoCoracao(semR[0], semR[1].quest) === null);
  })());
  t("reservaDoCoracao com lixo: null", reservaDoCoracao(null, "x") === null && reservaDoCoracao(VIVOS[0], null) === null && reservaDoCoracao(VIVOS[0], "nao_existe") === null);

  /* O GRAFO, PELA DEGRADAÇÃO: o confronto pressupõe o rosto visto. Sem quest
     de rosto no catálogo, o confronto já não entra (antes da TE4 entrava, e
     o herói chegava ao fim sem nunca lhe ter visto a cara): o ato cai no
     marco antigo. Com o rosto, entra depois dele. */
  const AM = MUNDOS.slice(0, 60);
  const soCimo = AM.map((w) => esqueletoDaCampanha(entradaDe(w, { catalogo: [questPorId("o_salvo_conduto"), questPorId("o_cimo_da_escada")] })));
  t("sem quest de rosto, o confronto nunca entra (o grafo não se viola: o ato cai no marco antigo)", soCimo.every((k) => k.atos.every((a) => a.quest !== "o_cimo_da_escada") && k.atos[k.atos.length - 1].quest === null));
  const comRosto = AM.map((w) => esqueletoDaCampanha(entradaDe(w, { catalogo: [questPorId("o_salvo_conduto"), questPorId("o_convite_sem_selo"), questPorId("a_mesma_tempestade"), questPorId("o_cimo_da_escada")] })));
  const cimoEntra = comRosto.filter((k) => k.atos.some((a) => a.quest === "o_cimo_da_escada"));
  t("com o rosto no seu ato, o confronto entra — e só depois de um rosto", cimoEntra.length > 0 && cimoEntra.every((k) => k.atos.some((a) => a.mao === "rosto" && a.ato < k.atos.length - 1)), `${cimoEntra.length}/${AM.length}`);
  /* a mão `rosto` pelo `tambem`: Os Dados Dele (rosto e pista, contra 4 e 5)
     caía no ato da pista de cinco atos; agora só no do rosto */
  const dados = MUNDOS.filter((w) => w.espinha.atos.length === 5).slice(0, 40).map((w) => esqueletoDaCampanha(entradaDe(w, { catalogo: [questPorId("os_dados_dele")] })));
  t("Os Dados Dele, sozinho no catálogo, só entra no ato do rosto, nunca no da pista", dados.some((k) => k.atos[3].quest === "os_dados_dele") && dados.every((k) => k.atos.every((a) => a.quest !== "os_dados_dele" || a.ato === 3)));

  /* O RESPIRO, PELA DEGRADAÇÃO: seis atos e um catálogo feito para descer.
     No ato 0 só há uma chama (o Salvo-Conduto); no 1, só uma brasa (Os Braços
     Que Faltam): desce um grau — é o respiro, e entra. No 2, uma fogueira (O
     Fundo da Pedreira); no 3, só uma chama (O Recado Verdadeiro): seria a
     segunda descida, e o respiro já se gastou — o ato cai no marco antigo.
     Sem a brasa, o respiro está livre, e o Recado entra no 3. */
  const SEIS = MUNDOS.filter((w) => w.espinha.atos.length === 6).slice(0, 60);
  const cat = ["o_salvo_conduto", "os_bracos_que_faltam", "o_fundo_da_pedreira", "o_recado_verdadeiro"].map(questPorId);
  const ks = SEIS.map((w) => esqueletoDaCampanha(entradaDe(w, { catalogo: cat })));
  const desceu = ks.filter((k) => k.atos[0].quest === "o_salvo_conduto" && k.atos[1].quest === "os_bracos_que_faltam");
  t("a descida de um grau entra pelo respiro (chama → brasa, no ato 1 de seis)", desceu.length > 0, `${desceu.length}/${SEIS.length}`);
  t("e, com o respiro gasto, a segunda descida não entra: o ato cai no marco antigo", desceu.some((k) => k.atos[2].quest === "o_fundo_da_pedreira") && desceu.filter((k) => k.atos[2].quest === "o_fundo_da_pedreira").every((k) => k.atos[3].quest === null));
  const ks2 = SEIS.map((w) => esqueletoDaCampanha(entradaDe(w, { catalogo: cat.filter((q) => q.id !== "os_bracos_que_faltam") })));
  t("sem a primeira descida, o respiro está livre e a chama entra depois da fogueira", ks2.some((k) => k.atos[2].quest === "o_fundo_da_pedreira" && k.atos[3].quest === "o_recado_verdadeiro"));
  t("e o grafo e a curva valem também nestes catálogos", [...soCimo, ...comRosto, ...dados, ...ks, ...ks2].every((k) => violacoesDe(k, BIBLIOTECA_DE_QUESTS).length === 0));
}

sec("3. o catálogo cheio (sintético): o plano desenhado pelas quests");
{
  const CHEIO = CHEIO3;
  t(`as ${CHEIO.length} cópias são fichas válidas`, CHEIO.every((q) => validarQuest(q).ok), (CHEIO.map((q) => validarQuest(q)).find((r) => !r.ok) || { erros: [] }).erros[0]);
  let ok = 0, todos = 0, passosDiferentes = 0, comFraqueza = 0, coracao2 = 0, semContestar = 0, def = 0, primeiro = "";
  const amostra = MUNDOS.slice(0, 400);
  amostra.forEach((w, i) => { CHEIOS[i] = esqueletoDaCampanha(entradaDe(w, { catalogo: CHEIO })); });
  for (const [i, w] of amostra.entries()) {
    const k = CHEIOS[i];
    if (!k) continue;
    ok++;
    const d = defeitos(w, k, CHEIO);
    if (d.length) { def++; if (!primeiro) primeiro = d[0]; }
    if (k.semQuest.length === 0) todos++;
    const passos = k.atos.filter((a) => a.quest).map((a) => a.passo);
    if (new Set(passos).size === passos.length && k.atos.every((a) => !a.quest || CHEIO.find((q) => q.id === a.quest).mao.contra.includes(a.passo))) passosDiferentes++;
    if (k.fraqueza && k.fraqueza.quest) comFraqueza++;
    if (k.coracao.length === Math.min(ESQUELETO.coracao, doCoracao(w, k))) coracao2++;
    if (k.semContestacao.length === 0) semContestar++;
  }
  t(`${ok} esqueletos, todos válidos`, ok === amostra.length && def === 0, primeiro);
  t("todo ato tem quest (nenhum cai no marco antigo)", todos === ok, `${todos}/${ok}`);
  t("as quests físicas contestam passos DIFERENTES do plano, cada uma o do seu ato", passosDiferentes === ok);
  t("a fraqueza vem sempre de uma quest de pista", comFraqueza === ok, `${comFraqueza}/${ok}`);
  /* a segunda do coração só nasce se houver uma segunda pessoa que ande com
     o herói: sem companheiro, só o elo — e um papel do grupo nunca fica vazio */
  t(`${ESQUELETO.coracao} do coração sempre que o núcleo tem com quem (senão as que há)`, coracao2 === ok, `${coracao2}/${ok}`);
  const duas = amostra.filter((w, i) => CHEIOS[i].coracao.length === 2).length;
  console.log(`      · com duas do coração: ${pct(duas, ok)}% (os mundos com companheiro ao nascer)`);
  /* o alvo da planta (BQ6): nenhum passo sem quest que o conteste */
  t(`nenhum passo do plano fica sem quest que o conteste (${pct(semContestar, ok)}%)`, semContestar === ok);
  /* a 5 atos, o caso da planta: as cinco físicas, cinco passos diferentes */
  const cinco = CHEIOS.filter((k) => k.atos.length === 5);
  t(`com 5 atos, as 5 quests físicas contestam 5 passos diferentes (${cinco.length} campanhas)`, cinco.length > 0 && cinco.every((k) => {
    const p = k.atos.map((a) => a.passo);
    return k.atos.every((a) => a.quest) && new Set(p).size === 5;
  }));
}

sec("4. A DEGRADAÇÃO com o catálogo de hoje (três quests)");
{
  MUNDOS.forEach((w, i) => { DE_HOJE[i] = esqueletoDaCampanha(entradaDe(w, { catalogo: CATALOGO_DE_HOJE })); });
  const contaAtos = {};
  let marcoAntigo = 0, semQuestTot = 0, coracao1 = 0, def = 0, primeiro = "", confrontoAntigo = 0, fraquezaPosta = 0, fraquezaQuest = 0;
  for (const [i, w] of MUNDOS.entries()) {
    const k = DE_HOJE[i];
    const d = defeitos(w, k, CATALOGO_DE_HOJE);
    if (d.length) { def++; if (!primeiro) primeiro = `${w.semente}: ${d[0]}`; }
    const n = k.atos.length;
    const comQuest = k.atos.filter((a) => a.quest).length;
    contaAtos[`${n}:${comQuest}`] = (contaAtos[`${n}:${comQuest}`] || 0) + 1;
    /* O ATO SEM QUEST CAI NO MARCO ANTIGO: os marcos que estenderEspinha pôs
       nesse ato existem, e o esqueleto não os toca */
    for (const a of k.atos.filter((x) => !x.quest)) {
      semQuestTot++;
      if (w.espinha.atos[a.ato].marcos.length > 0) marcoAntigo++;
    }
    const ult = w.espinha.atos[n - 1].marcos;
    if (!k.atos[n - 1].quest && ult.some((m) => m.feitio === "confronto")) confrontoAntigo++;
    if (k.coracao.length <= 1) coracao1++;
    if (k.vilao.papeis.fraqueza) fraquezaPosta++;
    if (k.fraqueza && k.fraqueza.quest) fraquezaQuest++;
  }
  t(`as ${N} válidas com três quests`, def === 0, primeiro);
  t(`todo ato sem quest tem os marcos antigos à espera (${marcoAntigo}/${semQuestTot})`, semQuestTot > 0 && marcoAntigo === semQuestTot);
  t("o confronto é o marco de sempre (o principal, no fim), enquanto não houver quest de confronto", confrontoAntigo === N);
  t("o coração fica um só (só há uma do tipo 2)", coracao1 === N);
  t("a fraqueza fica posta em todas, mesmo quando nenhuma quest a entrega", fraquezaPosta === N);
  console.log(`      · atos com quest, por espinha (atos:com quest → campanhas): ${Object.entries(contaAtos).sort().map(([k2, v]) => `${k2} → ${v}`).join(" · ")}`);
  console.log(`      · a fraqueza entregue pelas Cinzas (consequência que é também pista): ${pct(fraquezaQuest, N)}%`);

  const w = MUNDOS[0];
  const vazio = esqueletoDaCampanha(entradaDe(w, { catalogo: [] }));
  t("catálogo vazio: o esqueleto é só o vilão — todos os atos no marco antigo, sem coração, e a fraqueza posta", vazio && vazio.semQuest.length === vazio.atos.length && vazio.coracao.length === 0 && !!vazio.vilao.papeis.fraqueza);
  /* o papel que não se preenche troca a quest — e, sem outra, o ato degrada:
     um vilão sem tenentes não pode dar o Salvo-Conduto nem as Cinzas */
  const semTenentes = esqueletoDaCampanha(entradaDe(w, { catalogo: CATALOGO_DE_HOJE, chefes: [{ nome: w.espinha.fio.antagonista, linha: "principal" }] }));
  t("sem tenentes, nenhuma quest com papel do fio nasce (e nada nasce com papel vazio)", semTenentes && semTenentes.vilao.tenentes.length === 0 && semTenentes.atos.every((a) => !a.quest) && defeitos(w, semTenentes, CATALOGO_DE_HOJE).length === 0);
  const semNucleo = esqueletoDaCampanha(entradaDe(w, { catalogo: CATALOGO_DE_HOJE, nucleo: null }));
  t("sem núcleo, a do coração não nasce (o papel do grupo ficaria vazio)", semNucleo && semNucleo.coracao.length === 0 && defeitos(w, semNucleo, CATALOGO_DE_HOJE).length === 0);
  /* o «pede» de uma ficha: sem quem o deixe antes, ela não entra */
  const pedinte = clonar(questPorId("as_cinzas_de_ontem"));
  pedinte.id = "pede_um_aliado"; pedinte.pede = ["aliado:testemunha"];
  t("a ficha que pede um «aliado» é válida", validarQuest(pedinte).ok);
  /* TE2 (09/11): o par é sintético. O Salvo-Conduto deixava o protegido
     como «aliado», e nenhuma ficha do catálogo o pedia — premissa sem leitor,
     que a catraca da biblioteca agora recusa; o mecanismo do «pede» prova-se
     com um Salvo-Conduto que deixa e uma ficha que pede, as duas aqui */
  const deixador = clonar(questPorId("o_salvo_conduto"));
  deixador.deixa = ["aliado:protegido"];
  t("o Salvo-Conduto que deixa o protegido como «aliado» é válido (PREMISSAS)", validarQuest(deixador).ok);
  const comPede = MUNDOS.slice(0, 80).map((x) => ({ x, k: esqueletoDaCampanha(entradaDe(x, { catalogo: [deixador, pedinte] })) }));
  const recebeu = comPede.filter(({ k }) => k.atos.some((a) => a.quest === "pede_um_aliado"));
  t("quando entra depois do Salvo-Conduto, o papel pedido é o protegido que ele deixou como aliado", recebeu.length > 0 && recebeu.every(({ k }) => {
    const sc = k.atos.find((a) => a.quest === "o_salvo_conduto");
    const pd = k.atos.find((a) => a.quest === "pede_um_aliado");
    return sc && sc.ato < pd.ato && pd.papeis.testemunha.nome === sc.papeis.protegido.nome;
  }), `${recebeu.length} de 80`);
  t("sem o Salvo-Conduto, a que pede não entra nunca", MUNDOS.slice(0, 40).every((x) => esqueletoDaCampanha(entradaDe(x, { catalogo: [pedinte] })).atos.every((a) => !a.quest)));
  t("e com o Salvo-Conduto do catálogo, que já não deixa nada, também não",
    MUNDOS.slice(0, 40).every((x) => esqueletoDaCampanha(entradaDe(x, { catalogo: [questPorId("o_salvo_conduto"), pedinte] })).atos.every((a) => a.quest !== "pede_um_aliado")));
  const premissaTorta = clonar(questPorId("o_salvo_conduto"));
  premissaTorta.deixa = ["conhece:vilao"];
  t("a premissa fora de PREMISSAS é recusada (o «conhece» passou a «estabelece camada rosto»)", !validarQuest(premissaTorta).ok);
}

sec("5. AS MEDIDAS");
{
  /* o fio: o mesmo tenente em duas quests da mesma campanha */
  const fioDe = (k, cat) => {
    const conta = {};
    const todas = [...k.atos.filter((a) => a.quest).map((a) => [a.quest, a.papeis]), ...k.coracao.map((c) => [c.quest, c.papeis])];
    for (const [id, papeis] of todas) {
      const q = cat.find((x) => x.id === id);
      /* só os tenentes: o vilão no rosto e no confronto não é «o mesmo tenente» */
      for (const [nm, p] of Object.entries(papeis)) if (q.papeis[nm].de === "fio" && k.vilao.tenentes.some((x) => x.nome === p.nome)) conta[p.nome] = (conta[p.nome] || 0) + 1;
    }
    return Object.values(conta).some((v) => v >= 2);
  };
  const comFioHoje = DE_HOJE.filter((k) => fioDe(k, CATALOGO_DE_HOJE)).length;
  const comFioVivo = VIVOS.filter((k) => fioDe(k, BIBLIOTECA_DE_QUESTS)).length;
  console.log(`      · o mesmo tenente atravessa duas quests em ${pct(comFioHoje, N)}% das campanhas com as três de hoje, e em ${pct(comFioVivo, N)}% com o catálogo vivo (${BIBLIOTECA_DE_QUESTS.length})`);
  t("o fio acontece já com as três de hoje (o Salvo-Conduto e as Cinzas partilham o tenente)", comFioHoje > 0);
  const cheios = CHEIOS;
  const comFioCheio = cheios.filter((k) => fioDe(k, CHEIO3)).length;
  console.log(`      · com o catálogo cheio (todas as físicas com papel do fio): ${pct(comFioCheio, cheios.length)}%`);
  t("com o catálogo cheio, o fio atravessa a maioria das campanhas", comFioCheio > cheios.length / 2);

  /* A MÉTRICA DA PLANTA (BQ8): quantas quests duas campanhas partilham em
     média — aqui, cada campanha contra a seguinte. Com o catálogo de hoje,
     e depois com catálogos sintéticos de tamanho crescente, até cair < 1. */
  const partilha = (ks) => {
    let s = 0, n = 0;
    for (let i = 0; i + 1 < ks.length; i += 2) {
      const a = new Set([...ks[i].atos.map((x) => x.quest), ...ks[i].coracao.map((c) => c.quest)].filter(Boolean));
      const b = [...ks[i + 1].atos.map((x) => x.quest), ...ks[i + 1].coracao.map((c) => c.quest)].filter(Boolean);
      s += b.filter((id) => a.has(id)).length; n++;
    }
    return Math.round((100 * s) / n) / 100;
  };
  const hoje = partilha(DE_HOJE);
  const vivo = partilha(VIVOS);
  console.log(`      · partilham em média: ${hoje} quests com o catálogo de hoje (3); ${vivo} com o vivo (${BIBLIOTECA_DE_QUESTS.length})`);
  t("com três quests, duas campanhas partilham quase tudo (> 2)", hoje > 2);
  const AM = MUNDOS.slice(0, 300);
  const linha = [];
  let abaixo = null;
  let anterior = Infinity, desce = true;
  for (const kk of [1, 2, 3, 4, 6, 8, 12]) {
    const cat = kk === 3 ? CHEIO3 : catalogoCheio(kk);
    const m = partilha(AM.map((w) => esqueletoDaCampanha(entradaDe(w, { catalogo: cat }))));
    const t1 = cat.filter((q) => q.tipo === 1).length, t2 = cat.length - t1;
    linha.push(`${cat.length} (${t1}+${t2}) → ${m}`);
    if (m > anterior + 0.05) desce = false;
    anterior = m;
    if (abaixo === null && m < 1) abaixo = { total: cat.length, t1, t2, m };
  }
  console.log(`      · catálogo sintético (tipo 1 + tipo 2) → partilham: ${linha.join(" · ")}`);
  console.log(`      · cai abaixo de 1 com ${abaixo ? `${abaixo.total} quests (${abaixo.t1} do tipo 1 + ${abaixo.t2} do tipo 2, partilham ${abaixo.m})` : "nenhum dos tamanhos medidos"}`);
  t("a partilha desce com o tamanho do catálogo", desce);
  t("e algum tamanho a põe abaixo de 1 (o alvo da BQ8)", !!abaixo);
}

sec("6. o save");
{
  const w = MUNDOS[1];
  const k = VIVOS[1];
  const g = garantirEsqueleto(k);
  t("a catraca guarda o esqueleto, e é idempotente", !!g && J(garantirEsqueleto(g)) === J(g));
  t("o vilão não mora no esqueleto guardado (uma verdade só: espinha.fio.vilao)", g.vilao === undefined);
  t("o que a catraca guarda sobrevive ao JSON", J(garantirEsqueleto(JSON.parse(J(g)))) === J(g));
  const sujo = { ...k, atos: [...k.atos.map((a) => ({ ...a })), { ato: "x", quest: "NÃO É ID", passo: 99, papeis: { "mau papel": { nome: 3 } } }], coracao: [...k.coracao, { quest: 7 }], fraqueza: { familia: "nenhuma", id: "x" } };
  const gs = garantirEsqueleto(sujo);
  t("o lixo cai: a quest torta fica sem quest, o passo fora da régua sem passo, o coração torto fora, a fraqueza inventada fora", gs.atos[gs.atos.length - 1].quest === null && gs.atos[gs.atos.length - 1].passo === null && gs.coracao.length === k.coracao.length && gs.fraqueza === null);

  const espinha2 = comOEsqueleto(w.espinha, k);
  t("comOEsqueleto põe o esqueleto e o vilão numa espinha NOVA", espinha2 !== w.espinha && !!espinha2.esqueleto && !!espinha2.fio.vilao && w.espinha.esqueleto === undefined);
  const volta = garantirEspinha(JSON.parse(J(espinha2)));
  t("a espinha com esqueleto volta inteira por garantirEspinha (save e load)", J(garantirEsqueleto(volta.esqueleto)) === J(g) && J(volta.fio.vilao) === J(espinha2.fio.vilao));
  t("a espinha antiga (sem esqueleto) continua sem ele: as campanhas em curso não mudam", !("esqueleto" in garantirEspinha(JSON.parse(J(w.espinha)))));
  t("os marcos da espinha não são tocados pelo esqueleto", J(volta.atos) === J(garantirEspinha(w.espinha).atos));

  const f = fichaDoVilao(volta);
  t("a ficha do vilão lê o registo que o esqueleto deixou", !!f && f.arquetipo === k.vilao.arquetipo);
  t("os seis lugares dos passos ficam no registo (as camadas leem `passo_N`)", Array.from({ length: 6 }, (_, i) => f.papeis[`passo_${i + 1}`]).every((p) => p && p.tipo === "lugar" && p.cidade));
  t("a fraqueza tem papel no registo, no tipo que COMO_SE_TEM_A_FRAQUEZA pede", (() => {
    const p = f.papeis.fraqueza; const c = COMO_SE_TEM_A_FRAQUEZA[f.fraqueza.familia];
    return p && c && c[1].startsWith({ pessoa: "papel", lugar: "lugar", item: "item" }[p.tipo]);
  })());
  t("e ninguém a tem ao nascer", temAFraqueza(f, { dia: 1 }, {}) === false);
  /* o tenente que é a mão de uma quest serve o passo dela: vencê-lo faz
     recuar ESSE passo (o relógio da BQ5 lê tenente.passo) */
  /* (a mão que é o próprio vilão — o rosto, o confronto — não é tenente, e
     não serve passo nenhum: fica de fora desta conta) */
  const tenenteDaMao = (kv, a) => {
    const q = questPorId(a.quest);
    return q && q.mao && q.mao.papel ? kv.vilao.tenentes.find((x) => x.nome === (a.papeis[q.mao.papel] || {}).nome) || null : null;
  };
  let comMaoTenente = 0;
  const servem = VIVOS.every((kv) => kv.atos.filter((a) => a.quest).every((a) => {
    const t2 = tenenteDaMao(kv, a);
    if (!t2) return true;
    comMaoTenente++;
    const primeiro = kv.atos.find((b) => b.quest && tenenteDaMao(kv, b) === t2);
    return t2.passo === primeiro.passo;
  })) && comMaoTenente > 0;
  t("o tenente que é a mão de uma quest serve o passo do ato dessa quest", servem);

  const q0 = questsDoAto(k, 0);
  t("questsDoAto(0): a do tipo 1 do ato e a do coração que começa nele", q0.length === (k.atos[0].quest ? 1 : 0) + k.coracao.filter((c) => c.atos[0] === 0).length && q0.every((q) => questPorId(q.id) && q.papeis));
  const semQ = k.atos.find((a) => !a.quest && !k.coracao.some((c) => c.atos[0] === a.ato));
  t("um ato sem quest não abre nada (vive dos marcos antigos)", !semQ || questsDoAto(k, semQ.ato).length === 0);
  t("a ordem diz por que ato cada quest entra, do primeiro ao último", k.ordem.length === k.atos.filter((a) => a.quest).length + k.coracao.length && k.ordem.every((o, i) => i === 0 || o.ato >= k.ordem[i - 1].ato));
}

sec("7. o determinismo, o null e a imutabilidade");
{
  const iguais = MUNDOS.slice(0, 60).every((w, i) => J(esqueletoDaCampanha(entradaDe(w))) === J(VIVOS[i]));
  t("a mesma semente dá o mesmo esqueleto", iguais);
  const diferentes = new Set(VIVOS.slice(0, 100).map((k) => J(k.atos.map((a) => a.papeis)))).size;
  t("sementes diferentes dão papéis diferentes", diferentes > 90, `${diferentes}/100`);
  /* sem os chefes, calcula-os do mapa — e dá o mesmo */
  const w = MUNDOS[2];
  t("sem os chefes na entrada, calcula-os do mapa, e dá o mesmo", J(esqueletoDaCampanha({ ...entradaDe(w), chefes: undefined })) === J(VIVOS[2]));
  t("null, {} e lixo dão null", [null, undefined, {}, 7, "x", [], { espinha: {} }, { mapa: w.mapa }, { mapa: w.mapa, espinha: { atos: [] } }].every((x) => esqueletoDaCampanha(x) === null));
  t("a espinha sem fio (sem vilão) não ganha esqueleto", esqueletoDaCampanha({ ...entradaDe(w), espinha: { ...w.espinha, fio: undefined } }) === null);
  t("a catraca: null e lixo dão null", [null, {}, { atos: [] }, "x", 3].every((x) => garantirEsqueleto(x) === null));
  t("comOEsqueleto com lixo devolve a espinha como veio", comOEsqueleto(w.espinha, null) === w.espinha && comOEsqueleto(null, VIVOS[2]) === null && comOEsqueleto(w.espinha, { atos: "x" }) === w.espinha);
  t("questsDoAto com lixo: lista vazia", questsDoAto(null, 0).length === 0 && questsDoAto(VIVOS[2], "0").length === 0 && questsDoAto(VIVOS[2], 99).length === 0);
  /* a entrada congelada: nada é mutado */
  const w3 = MUNDOS[3];
  const antes = J([w3.espinha, w3.nucleo, w3.chefes]);
  let estourou = false, k3 = null;
  try { k3 = esqueletoDaCampanha(entradaDe(w3, { espinha: congelar(clonar(w3.espinha)), nucleo: congelar(clonar(w3.nucleo)), chefes: congelar(clonar(w3.chefes)) })); } catch { estourou = true; }
  t("com a espinha, o núcleo e os chefes congelados, nada estoura (nada é mutado)", !estourou && J(k3) === J(VIVOS[3]));
  t("e as entradas ficam como estavam", J([w3.espinha, w3.nucleo, w3.chefes]) === antes);
  const k4 = VIVOS[4];
  const c4 = J(k4);
  garantirEsqueleto(k4); comOEsqueleto(MUNDOS[4].espinha, k4); questsDoAto(k4, 0);
  t("a catraca, a junção e a leitura não tocam no esqueleto recebido", J(k4) === c4);
}

console.log(`\n${bons} ok, ${maus} falha(s)`);
if (maus) process.exit(1);
