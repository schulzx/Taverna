/* teste-a-cena-do-jogo.mjs (o preparo da fiação do Mestre novo · 18/11/2026) — «a cena do jogo».

   O módulo é src/a-cena-do-jogo.js: `cenaDoJogo(retrato)` (o retrato do que
   o App tem nos refs → a cena que a régua lê), `chamadoDoMomento(frase,
   leitura, retrato, ctx)` (a chamada única do App) e
   `chamadoQueOMundoProvoca(antes, depois)` (o dado espontâneo). O desenho é
   mente/lancamento/o-mestre-vivo.md §14.1 e §15.

   Oito provas:
   1. a tabela: cada estado da cena tem UMA casa — uma linha de derivação
      com a fonte, ou a lista dos sem fonte com o porquê;
   2. cada linha da derivação, com um retrato mínimo que a acende e um que
      não;
   3. lixo e null: nunca lança, devolve null; imutável; determinístico;
   4. sem retrato, o Mestre de hoje;
   5. a trava da quest (o desenho §5): a quest ligada ou desligada não muda o
      chamado quando a cena é a mesma, e só o muda quando muda um ESTADO;
   6. o veredito inteiro quando a escuta ouve (o campo aditivo da régua);
   7. o chamado do momento: a conversa ganha o chamado com o número da
      escada e o preço dito antes; a pergunta, o destino, o espontâneo;
   8. a previsão: as frases de corpus-da-mesa.json numa cena calma, e
      quantos chamados mudam em relação ao Mestre de hoje.
   As frases são de prova, nossas, e as dos nossos corpus; nenhuma do exame. */
import fs from "node:fs";
import {
  REGRAS_DA_CENA_DO_JOGO, FORMA_DO_RETRATO, ONDE_DO_RETRATO, CAMPOS_DA_QUEST, DERIVACAO_DA_CENA, ESTADOS_SEM_FONTE,
  cenaDoJogo, O_CHAMADO_DA_CONVERSA, chamadoDoMomento, O_DADO_DO_MUNDO, chamadoQueOMundoProvoca, O_QUE_O_MUNDO_MOSTRA,
} from "../src/a-cena-do-jogo.js";
import { ESTADOS_DA_CENA, estadoPorId } from "../src/cena-do-momento.js";
import { valeRolagem, PORQUE_DO_ESPONTANEO } from "../src/motor/a-regua-do-momento.js";
import { oChamado, porQueNaoChama, O_CHAMADO } from "../src/motor/o-mestre-chama.js";
import { lerAcao, EFEITOS_DA_FALHA, dificuldadePorId } from "../src/desafios.js";
import { CLIMAS } from "../src/encontros.js";
import { ELENCO_DO_LUGAR } from "../src/elenco-do-lugar.js";
import { TIPOS } from "../src/relogios.js";
import { condicaoPorId } from "../src/condicoes.js";
import { ESCADA_DA_RELACAO } from "../src/social.js";
import { DORMINDO } from "../src/gente-por-dentro.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const HEROI = { nivel: 1, inventario: ["Gazua"], habilidades: [], equipado: { arma: "Espada curta" }, moedas: 50 };
const CTX = { personagem: HEROI, semente: "teste-a-cena-do-jogo", lugar: "Taverna do Javali", tentativas: {}, dia: 1 };
const J = (x) => JSON.stringify(x);
const estadosDe = (cena, onde, nome) => {
  if (!cena) return [];
  if (onde === "cena") return cena.cena.estados;
  const lista = cena[onde] || [];
  const x = nome ? lista.find((y) => y.nome === nome) : lista[0];
  return x ? x.estados : [];
};

/* o retrato de base: um largo da cidade, de dia, sem ninguém */
const BASE = Object.freeze({ cidade: "Alto Negro", lugar: { nome: "Largo do Cereal" }, minuto: 14 * 60, clima: "ensolarado" });
const com = (o) => ({ ...BASE, ...o });
const MASMORRA = (sala, extra) => ({ nome: "Cripta", atual: 1, tochas: 3, salas: [{ id: 1, ...sala }], ...extra });

sec("1. a tabela: cada estado da cena tem uma casa");
{
  const daTabela = ESTADOS_DA_CENA.map((e) => e.id);
  const derivados = DERIVACAO_DA_CENA.map((l) => l.estado);
  const semFonte = ESTADOS_SEM_FONTE.map((s) => s.estado);
  const casas = [...derivados, ...semFonte];
  t(`${derivados.length} derivados + ${semFonte.length} sem fonte = os ${daTabela.length} estados da cena, cada um uma vez`,
    casas.length === daTabela.length && new Set(casas).size === casas.length && daTabela.every((id) => casas.includes(id)),
    daTabela.filter((id) => !casas.includes(id)).join(",") + " | " + casas.filter((id, i) => casas.indexOf(id) !== i).join(","));
  t("toda linha da derivação tem o dono do estado na tabela da cena, uma fonte escrita e uma regra",
    DERIVACAO_DA_CENA.every((l) => estadoPorId(l.estado) && estadoPorId(l.estado).de === l.de && typeof l.fonte === "string" && l.fonte.length > 12 && typeof l.se === "function"));
  t("todo estado sem fonte diz o porquê", ESTADOS_SEM_FONTE.every((s) => typeof s.porque === "string" && s.porque.length > 20));
  t("as tabelas são congeladas", [DERIVACAO_DA_CENA, ESTADOS_SEM_FONTE, REGRAS_DA_CENA_DO_JOGO, FORMA_DO_RETRATO, O_CHAMADO_DA_CONVERSA, O_DADO_DO_MUNDO].every(Object.isFrozen)
    && DERIVACAO_DA_CENA.every(Object.isFrozen) && ESTADOS_SEM_FONTE.every(Object.isFrozen));
  const R = REGRAS_DA_CENA_DO_JOGO;
  const climas = new Set(CLIMAS.map((c) => c.id));
  t("os climas das regras existem em CLIMAS", [...R.climaQueMolha, ...R.climaQueCobre, ...R.climaQueFere].every((id) => climas.has(id)));
  const tipos = new Set(Object.keys(ELENCO_DO_LUGAR.tipos));
  t("os sítios das regras existem em ELENCO_DO_LUGAR", [...R.sitiosAoArLivre, ...R.sitiosPublicos, ...R.territorioSempre].every((id) => tipos.has(id)));
  t("os relógios das regras são tipos de relógio", [...R.relogioDaPressa, ...R.relogioQueSeAproxima].every((id) => !!TIPOS[id]));
  t("a condição do medo existe, e os laços dispostos são os da escada acima do neutro",
    !!condicaoPorId(R.condicaoDoMedo) && R.relacaoDisposta.every((r) => ESCADA_DA_RELACAO.indexOf(r) < ESCADA_DA_RELACAO.indexOf("neutro"))
    && [...R.relacaoDesconfiada, ...R.relacaoHostil].every((r) => ESCADA_DA_RELACAO.indexOf(r) > ESCADA_DA_RELACAO.indexOf("desconhecido")));
  t("a pressa é um número de segmentos possível", Number.isInteger(R.faltaParaAPressa) && R.faltaParaAPressa >= 1);
  t("o retrato diz de onde vem cada campo, os de onde e os da quest incluídos",
    [...ONDE_DO_RETRATO, ...CAMPOS_DA_QUEST].every((k) => typeof FORMA_DO_RETRATO[k] === "string" && FORMA_DO_RETRATO[k].length > 8));
  const av = O_CHAMADO_DA_CONVERSA.aviso;
  t("o preço da conversa cabe numa linha, começa pelo «se falhar» e é uma etiqueta da falha",
    av.length <= O_CHAMADO.tetoDoAviso && O_CHAMADO.condicional.test(av) && EFEITOS_DA_FALHA.some((e) => e.id === O_CHAMADO_DA_CONVERSA.efeito), av.length);
  t("o dado do mundo: o degrau existe, e há preço para toda perícia que um estado chama",
    !!dificuldadePorId(O_DADO_DO_MUNDO.degrau) && Object.keys(PORQUE_DO_ESPONTANEO).every((p) => typeof O_DADO_DO_MUNDO.risco[p] === "string" && O_DADO_DO_MUNDO.risco[p].length > 5));
}

sec("2. cada linha da derivação, com um retrato que a acende e um que não");
{
  const amigo = (relacao, extra) => com({ pessoas: [{ nome: "Ana", papel: "padeira", relacao, ...extra }] });
  const PROVAS = {
    disposta: [amigo("amigo"), amigo("desconhecido"), "pessoas"],
    desconfiada: [amigo("rival"), amigo("neutro"), "pessoas"],
    hostil: [com({ inimigos: [{ nome: "Bandido", vida: 5, vidaMax: 8 }] }), com({ inimigos: [{ nome: "Bandido", vida: 5, vidaMax: 8, rendido: true }] }), "pessoas"],
    com_medo: [com({ inimigos: [{ nome: "Bandido", vida: 5, vidaMax: 8, rendido: true }] }), com({ inimigos: [{ nome: "Bandido", vida: 5, vidaMax: 8 }] }), "pessoas"],
    esconde_algo: [com({ pessoas: [{ nome: "Ana" }], segredos: [{ nome: "o porão", gente: [{ nome: "Ana", papel: "padeira" }] }] }),
      com({ pessoas: [{ nome: "Ana" }], segredos: [{ nome: "o porão", gente: [{ nome: "Rui" }] }] }), "pessoas"],
    deve_favor: [com({ favorAqui: true, pessoas: [{ nome: "Ana", doPosto: true }] }), com({ favorAqui: true, pessoas: [{ nome: "Ana", doPosto: false }] }), "pessoas"],
    do_grupo: [com({ grupo: [{ nome: "Tobias", vida: 10, vidaMax: 10 }] }), com({ pessoas: [{ nome: "Tobias" }] }), "pessoas"],
    morta: [amigo("neutro", { status: "morto" }), amigo("neutro", { status: "vivo" }), "pessoas"],
    desacordada: [com({ inimigos: [{ nome: "Bandido", vida: 0, vidaMax: 8, derrotado: true, desacordado: true }] }),
      com({ inimigos: [{ nome: "Bandido", vida: 2, vidaMax: 8, rendido: true }] }), "pessoas"],
    moribunda: [com({ grupo: [{ nome: "Tobias", vida: 0, vidaMax: 10 }] }), com({ grupo: [{ nome: "Tobias", vida: 0, vidaMax: 10, estavel: { horas: 2 } }] }), "pessoas"],
    dormindo: [amigo("neutro", { agora: DORMINDO }), amigo("neutro", { agora: "no turno" }), "pessoas"],
    ferida: [com({ inimigos: [{ nome: "Lobo", vida: 3, vidaMax: 8 }] }), com({ inimigos: [{ nome: "Lobo", vida: 8, vidaMax: 8 }] }), "criaturas"],
    assustada: [com({ inimigos: [{ nome: "Lobo", vida: 8, vidaMax: 8, condicoes: [{ id: "amedrontado" }] }] }), com({ inimigos: [{ nome: "Lobo", vida: 8, vidaMax: 8 }] }), "criaturas"],
    territorial: [
      com({ passos: [{ quest: "q", etapa: "e", especie: "segredo", confronto: { quem: "a fera", covil: { nome: "Toca do Vale", cidade: "" } } }], onde: { lugar: "Toca do Vale", dentroDe: "", cidade: "", foraDosMuros: true } }),
      com({ passos: [{ quest: "q", etapa: "e", especie: "segredo", confronto: { quem: "a fera", covil: { nome: "Toca do Vale", cidade: "" } } }], onde: { lugar: "Moinho", dentroDe: "", cidade: "", foraDosMuros: true } }),
      "criaturas"],
    trancado: [com({}), com({ masmorra: MASMORRA({ tipo: "combate" }) }), "coisas", "porta"],
    vigiado: [com({ quest: { vigiado: ["o portão"] } }), com({ quest: {} }), "coisas", "o portão"],
    armadilhado: [com({ masmorra: MASMORRA({ tipo: "armadilha" }) }), com({ masmorra: MASMORRA({ tipo: "armadilha", resolvida: true }) }), "coisas", "a sala"],
    ha_algo_escondido: [com({ achado: true }), com({ achado: false }), "coisas", "o lugar"],
    escuro: [com({ masmorra: MASMORRA({ tipo: "combate" }, { tochas: 0 }) }), com({ masmorra: MASMORRA({ tipo: "combate" }, { tochas: 3 }) }), "coisas", "o lugar"],
    escorregadio: [com({ clima: "chuva" }), com({ clima: "ensolarado" }), "coisas", "o chão"],
    rastro_fresco: [com({ encontro: { criatura: "Goblin", fase: "sinal", sinal: { tipo: "rasto" } } }), com({ encontro: { criatura: "Goblin", fase: "sinal", sinal: { tipo: "som" } } }), "coisas", "o rastro"],
    rastro_velho: [
      com({ passos: [{ quest: "q", etapa: "e", especie: "rasto", lugares: [{ nome: "Vau Raso", cidade: "" }] }], onde: { lugar: "Vau Raso", dentroDe: "", cidade: "", foraDosMuros: true } }),
      com({ passos: [{ quest: "q", etapa: "e", especie: "segredo", lugares: [{ nome: "Vau Raso", cidade: "" }] }], onde: { lugar: "Vau Raso", dentroDe: "", cidade: "", foraDosMuros: true } }),
      "coisas", "o rastro"],
    com_pressa: [com({ relogios: [{ tipo: "ameaca", segmentos: 6, cheios: 5 }] }), com({ relogios: [{ tipo: "ameaca", segmentos: 6, cheios: 3 }] }), "cena"],
    com_testemunhas: [com({ lugar: { nome: "Taverna do Javali" } }), com({ lugar: { nome: "Taverna do Javali" }, minuto: 3 * 60 }), "cena"],
    territorio_de_alguem: [com({ lugar: { nome: "Taverna do Javali" }, minuto: 3 * 60 }), com({ lugar: { nome: "Taverna do Javali" } }), "cena"],
    perigo_fisico: [com({ clima: "tempestade" }), com({ clima: "nublado" }), "cena"],
    algo_se_aproxima: [com({ relogios: [{ tipo: "cacada", segmentos: 4, cheios: 3 }] }), com({ relogios: [{ tipo: "cacada", segmentos: 4, cheios: 1 }] }), "cena"],
    ceu_encoberto: [com({ clima: "nublado" }), com({ clima: "ensolarado" }), "cena"],
    heroi_penalizado: [com({ heroi: { condicoes: [{ id: "exausto" }] } }), com({ heroi: { condicoes: [{ id: "inspirado" }] } }), "cena"],
  };
  t("toda linha da derivação tem a sua prova", DERIVACAO_DA_CENA.every((l) => PROVAS[l.estado]), DERIVACAO_DA_CENA.filter((l) => !PROVAS[l.estado]).map((l) => l.estado).join(","));
  for (const l of DERIVACAO_DA_CENA) {
    const p = PROVAS[l.estado];
    if (!p) continue;
    const [sim, nao, onde, nome] = p;
    const a = estadosDe(cenaDoJogo(sim), onde, nome), b = estadosDe(cenaDoJogo(nao), onde, nome);
    t(`${l.estado}: ${l.fonte.slice(0, 70)}…`, a.includes(l.estado) && !b.includes(l.estado), J(a) + " / " + J(b));
  }
  /* os cuidados que as provas de cima não mostram */
  t("o mesmo céu, dentro da taverna, não molha nem cobre", !cenaDoJogo(com({ lugar: { nome: "Taverna do Javali" }, clima: "chuva" })).coisas.some((c) => c.estados.includes("escorregadio"))
    && !cenaDoJogo(com({ lugar: { nome: "Taverna do Javali" }, clima: "nublado" })).cena.estados.includes("ceu_encoberto"));
  t("na masmorra, a porta só está trancada na sala de enigma por abrir", estadosDe(cenaDoJogo(com({ masmorra: MASMORRA({ tipo: "enigma" }) })), "coisas", "porta").includes("trancado")
    && !estadosDe(cenaDoJogo(com({ masmorra: MASMORRA({ tipo: "enigma", resolvida: true }) })), "coisas", "porta").includes("trancado"));
  t("a porta é sempre a primeira coisa (é a que a régua lê como «a coisa» da ação)", cenaDoJogo(com({ achado: true, clima: "chuva", quest: { trancado: ["o cofre"] } })).coisas[0].nome === "porta");
  t("o segredo da sala que é perigo é armadilha, não achado", (() => { const c = cenaDoJogo(com({ masmorra: MASMORRA({ tipo: "combate", segredo: { perigo: true, revelado: false } }) })); return estadosDe(c, "coisas", "a sala").includes("armadilhado") && !c.coisas.some((x) => x.estados.includes("ha_algo_escondido")); })());
  t("o companheiro sem a vida no retrato não está caído (caidosDoGrupo leria 0)", !estadosDe(cenaDoJogo(com({ grupo: [{ nome: "Tobias" }] })), "pessoas", "Tobias").includes("moribunda"));
  t("quem fala é gente; o bicho é criatura (QUEM_FALA)", cenaDoJogo(com({ inimigos: [{ nome: "Bandido", vida: 3 }, { nome: "Lobo", vida: 3 }] })).pessoas.some((p) => p.nome === "Bandido")
    && cenaDoJogo(com({ inimigos: [{ nome: "Bandido", vida: 3 }, { nome: "Lobo", vida: 3 }] })).criaturas.some((c) => c.nome === "Lobo"));
  t("o bicho morto sai da cena", cenaDoJogo(com({ inimigos: [{ nome: "Lobo", vida: 0, derrotado: true }] })).criaturas.length === 0);
}

sec("3. lixo e null: nunca lança, devolve null; imutável; determinístico");
{
  t("sem retrato, ou sem nada que diga onde, não há cena", [null, undefined, 42, "x", [], {}, { pessoas: [{ nome: "Ana" }] }, { cidade: "" }, { jornada: false }].every((r) => cenaDoJogo(r) === null));
  let estourou = false;
  const lixo = [null, 42, "x", [], {}, [null], [42], { nome: 7 }];
  try {
    for (const x of lixo) {
      cenaDoJogo({ cidade: "Alto Negro", lugar: x, pessoas: x, grupo: x, inimigos: x, encontro: x, masmorra: x, segredos: x, relogios: x, heroi: x, passos: x, onde: x, quest: x, clima: x, minuto: x });
      chamadoDoMomento(x, x, { cidade: "Alto Negro", pessoas: x }, x);
      chamadoQueOMundoProvoca(x, { cidade: "Alto Negro", relogios: x });
    }
    chamadoDoMomento(undefined, undefined, undefined, undefined);
  } catch (e) { estourou = e; }
  t("retrato, frase, leitura e contexto de lixo não estouram", !estourou, String(estourou));
  const c = cenaDoJogo(com({ pessoas: [{ nome: "Ana", relacao: "rival" }] }));
  t("a cena sai congelada (é a de lerCena)", Object.isFrozen(c) && Object.isFrozen(c.pessoas) && Object.isFrozen(c.pessoas[0].estados));
  const congela = (o) => { if (o && typeof o === "object") { Object.values(o).forEach(congela); Object.freeze(o); } return o; };
  const r = congela(com({ pessoas: [{ nome: "Ana", relacao: "rival" }], grupo: [{ nome: "Tobias", vida: 0 }], relogios: [{ tipo: "ameaca", segmentos: 4, cheios: 3 }], quest: { esconde: ["Ana"] } }));
  const antes = J(r);
  let ok2 = true;
  try { cenaDoJogo(r); chamadoDoMomento("tento convencer a Ana a me deixar passar", CTX, r, {}); } catch { ok2 = false; }
  t("o retrato congelado passa, e sai como entrou (nada é mutado)", ok2 && J(r) === antes);
  t("o mesmo retrato dá a mesma cena e o mesmo chamado", J(cenaDoJogo(r)) === J(cenaDoJogo(r))
    && J(chamadoDoMomento("tento convencer a Ana a me deixar passar", CTX, r, {})) === J(chamadoDoMomento("tento convencer a Ana a me deixar passar", CTX, r, {})));
  /* sem sorteio, sem relógio: provado pelo comportamento, como a casa pede
     ao motor (teste-assercoes-de-texto) */
  const sorte0 = Math.random, agora0 = Date.now;
  let tocou = 0;
  Math.random = () => { tocou++; return 0.5; };
  Date.now = () => { tocou++; return 0; };
  try {
    for (const f of ["vasculho o baú", "tento convencer a Ana a me deixar passar", "escalo o muro", "o frasco sobreviveu?"]) chamadoDoMomento(f, CTX, r, {});
    chamadoQueOMundoProvoca(BASE, r);
  } finally { Math.random = sorte0; Date.now = agora0; }
  t("sem sorteio, sem relógio: Math.random e Date.now nunca são chamados", tocou === 0, String(tocou));
}

const MESA = JSON.parse(fs.readFileSync(new URL("./corpus-da-mesa.json", import.meta.url), "utf8")).frases.map((f) => f.frase);

sec("4. sem retrato, o Mestre de hoje");
{
  let dif = 0;
  for (const f of MESA) {
    let v = null;
    try { v = lerAcao(f, CTX); } catch { v = null; }
    for (const semRetrato of [null, undefined, {}, { pessoas: [] }]) {
      const r = chamadoDoMomento(f, CTX, semRetrato, {});
      const por = porQueNaoChama(v, {});
      if (r.cena !== null || J(r.chamado) !== J(oChamado(v, {}) || null) || r.rola !== (por === null || por === "conversa") || r.porque !== (por || "chama")) dif++;
    }
  }
  t(`corpus-da-mesa: ${MESA.length} frases × 4 retratos insuficientes — o chamado de hoje, o mesmo rola e o mesmo porquê (${dif} diferenças)`, dif === 0);
}

/* a cena calma: a taverna aberta, de dia, céu limpo, a taverneira do posto
   e um companheiro */
const CALMA = Object.freeze(com({
  lugar: { nome: "Taverna do Javali" },
  pessoas: [{ nome: "Bruna", papel: "taverneira", relacao: "desconhecido", doPosto: true }],
  grupo: [{ nome: "Tobias", vida: 12, vidaMax: 12 }],
}));

sec("5. a trava da quest (o desenho §5): a quest só alcança o dado pelo estado");
{
  const resultados = (retrato) => MESA.map((f) => J(chamadoDoMomento(f, CTX, retrato, {})));
  const semQuest = resultados(CALMA);
  /* (a) a quest presente, mas sem escrever estado nenhum: quem ela diz que
     esconde não está aqui, o passo é noutro lugar, o covil é longe */
  const questQueNaoToca = { ...CALMA,
    quest: { esconde: ["Ninguém Daqui"], trancado: [], vigiado: [] },
    passos: [{ quest: "q", etapa: "e", especie: "rasto", lugares: [{ nome: "Vau Raso", cidade: "" }], confronto: { quem: "a fera", covil: { nome: "Toca do Vale", cidade: "" } } }],
    onde: { lugar: "Taverna do Javali", dentroDe: "", cidade: "Alto Negro", foraDosMuros: false } };
  t("a quest ligada sem mudar estado: a mesma cena", J(cenaDoJogo(questQueNaoToca)) === J(cenaDoJogo(CALMA)));
  const a = resultados(questQueNaoToca);
  const difA = a.filter((x, i) => x !== semQuest[i]).length;
  t(`…e as ${MESA.length} frases saem com o chamado idêntico (${difA} diferenças)`, difA === 0);
  /* (b) a mesma cena por dois caminhos: o mundo diz que a Bruna sabe o que a
     espinha guarda, ou a etapa da quest declara que ela esconde algo */
  const peloMundo = { ...CALMA, segredos: [{ nome: "o porão", gente: [{ nome: "Bruna", papel: "taverneira" }] }] };
  const pelaQuest = { ...CALMA, quest: { esconde: ["Bruna"] } };
  t("o mesmo estado pelo mundo ou pela quest: a mesma cena", J(cenaDoJogo(peloMundo)) === J(cenaDoJogo(pelaQuest)));
  const m = resultados(peloMundo), q = resultados(pelaQuest);
  const difB = m.filter((x, i) => x !== q[i]).length;
  t(`…e o mesmo chamado em todas as ${MESA.length} frases (${difB} diferenças)`, difB === 0);
  /* (c) a quest só muda o chamado quando muda um estado */
  const difC = q.map((x, i) => (x !== semQuest[i] ? i : -1)).filter((i) => i >= 0);
  t(`a quest que escreve «esconde algo» muda o que a cena muda (${difC.length} frases), e só porque a cena mudou`,
    difC.length > 0 && J(cenaDoJogo(pelaQuest)) !== J(cenaDoJogo(CALMA)));
  const pergunta = chamadoDoMomento("onde fica a ferraria?", CTX, pelaQuest, {});
  t("a pergunta a quem esconde continua sem dado, e sai evasiva", !pergunta.rola && !pergunta.chamado && pergunta.resposta === "evasiva", J(pergunta.resposta));
  t("nenhum campo da quest chega à régua: o resultado não carrega o retrato", CAMPOS_DA_QUEST.every((k) => !(k in chamadoDoMomento("vasculho o baú", CTX, pelaQuest, {}))));
}

sec("6. o veredito inteiro quando a escuta ouve (o campo aditivo da régua)");
{
  const perigo = { pessoas: [], criaturas: [], coisas: [], cena: { estados: ["perigo_fisico"] } };
  const f = "dá pra eu trepar na árvore?";
  const r = valeRolagem(lerAcao(f, CTX), perigo, { frase: f, leitura: CTX });
  t("a escuta ouviu, e o veredito vem inteiro: o teste, o mesmo id, o número", r.ouviu && r.veredito && r.veredito.tipo === "teste" && r.veredito.id === r.ouviu.id && Number.isFinite(r.veredito.dc), J(r.ouviu));
  t("…e oChamado o aceita sem chamar a escuta de novo", !!oChamado(r.veredito, {}));
  const porteiro = { pessoas: [{ nome: "", papel: "porteiro", estados: [] }], criaturas: [], coisas: [], cena: { estados: [] } };
  const g = "posso pedir pra ele, eu te pago o dobro se você abrir o portão?";
  const s = valeRolagem(lerAcao(g, CTX), porteiro, { frase: g, leitura: CTX });
  t("a fala que só a escuta ouviu traz a conta social inteira (o dc da escada)", s.rola && s.veredito && s.veredito.social && s.veredito.dc === s.veredito.social.dc, J(s.porque));
  const semCena = valeRolagem(lerAcao(f, CTX), null, { frase: f, leitura: CTX });
  t("sem cena, a resposta da régua é a de hoje: sem o campo novo", !("veredito" in semCena));
  const pg = valeRolagem(lerAcao("onde fica a ferraria?", CTX), porteiro, { frase: "onde fica a ferraria?", leitura: CTX });
  t("o veredito é o julgado mesmo quando não rola (a pergunta: o do catálogo)", "veredito" in pg && !pg.rola);
}

sec("7. o chamado do momento");
{
  const guarda = com({ pessoas: [{ nome: "Rodrigo", papel: "guarda do portão", relacao: "rival" }] });
  const conv = chamadoDoMomento("tento convencer o Rodrigo a me deixar passar", CTX, guarda, {});
  t("a conversa com quem tem motivo para negar rola, e ganha o chamado", conv.rola && conv.porque === "motivoParaNegar" && !!conv.chamado, conv.porque);
  t("…com o número da escada do pedido", conv.chamado && conv.veredito && conv.veredito.social && conv.chamado.dc === conv.veredito.social.dc, conv.chamado && conv.chamado.dc);
  t("…e o preço dito antes", conv.chamado && conv.chamado.aviso === O_CHAMADO_DA_CONVERSA.aviso && conv.chamado.linha.includes("Precisa de " + conv.chamado.dc) && conv.chamado.linha.endsWith(conv.chamado.aviso));
  const busca = chamadoDoMomento("vasculho o baú", CTX, com({ achado: true }), {});
  t("o chamado tem a mesma forma do de oChamado (as mesmas chaves)", busca.chamado && conv.chamado && J(Object.keys(conv.chamado).sort()) === J(Object.keys(busca.chamado).sort()));
  t("fora da conversa, o chamado É o de oChamado sobre o veredito julgado", J(busca.chamado) === J(oChamado(busca.veredito, {})));
  t("hoje a mesma conversa não tinha chamado (seguia pela escada)", oChamado(lerAcao("tento convencer o Rodrigo a me deixar passar", CTX), {}) === null);
  t("quem já está disposto cede sem dado: nem chamado", (() => { const r = chamadoDoMomento("tento convencer a Ana a me deixar passar", CTX, com({ pessoas: [{ nome: "Ana", relacao: "amigo" }] }), {}); return !r.rola && r.chamado === null && r.porque === "dispostoCede"; })());
  t("a busca sem nada escondido não rola: o Mestre descreve", (() => { const r = chamadoDoMomento("vasculho o baú", CTX, com({}), {}); return !r.rola && r.chamado === null && r.porque === "buscaVazia"; })());
  const d = chamadoDoMomento("o frasco sobreviveu?", CTX, com({ clima: "tempestade" }), {});
  t("o dado do destino: sem perícia nem chamado, o d6 já resolvido pela semente", d.rola && d.porque === "destino" && d.chamado === null && d.destino && d.destino.faces === 6 && typeof d.destino.diz === "string", J(d.porque));
  const auto = chamadoDoMomento("vasculho o baú", CTX, com({ achado: true }), { bonusDe: () => 40 });
  t("o bônus pelo veredito (bonusDe): o resultado certo não rola", !auto.rola && auto.porque === "automatico", auto.porque);
  const luta = chamadoDoMomento("escalo o muro", CTX, com({ clima: "chuva" }), { emCombate: true });
  t("na luta, a luta tem o seu dado", !luta.rola && luta.porque === "luta");
  /* MOVIDA em 19/11 (o-mestre-vivo.md §17), e o motivo: o espontâneo só é
     chamado quando o estado que o provoca tem o que mostrar (O_QUE_O_MUNDO_MOSTRA)
     — o relógio da caçada sem nome não diz o que se aproxima, e um dado sobre
     nada era o convite ao Narrador para inventar. A caçada ganha um nome; a
     intenção (a caçada a um passo chama Percepção) fica. */
  const esp = chamadoQueOMundoProvoca(BASE, com({ relogios: [{ tipo: "cacada", nome: "os batedores do Barão", segmentos: 4, cheios: 3 }] }));
  t("o mundo provoca: a caçada a um passo chama Percepção, com o degrau da tabela e a chave do espontâneo",
    esp && esp.pericia === "percepcao" && esp.estado === "algo_se_aproxima" && esp.chamado && esp.chamado.dc === dificuldadePorId(O_DADO_DO_MUNDO.degrau).dc
    && esp.chamado.chave.startsWith(O_DADO_DO_MUNDO.chave + "|") && esp.chamado.aviso.includes(O_DADO_DO_MUNDO.risco.percepcao), J(esp));
  const ja = com({ relogios: [{ tipo: "cacada", nome: "os batedores do Barão", segmentos: 4, cheios: 3 }] });
  t("o que já estava na cena não chama de novo; sem retrato depois, nada", chamadoQueOMundoProvoca(ja, ja) === null && chamadoQueOMundoProvoca(BASE, null) === null);
  t("o sítio fechado, ao entrar, chama Furtividade (o território de alguém)", (chamadoQueOMundoProvoca(BASE, com({ lugar: { nome: "Taverna do Javali" }, minuto: 3 * 60 })) || {}).pericia === "furtividade");
}

sec("8. a previsão: o corpus da mesa numa cena calma, contra o Mestre de hoje");
{
  const tipos = {};
  const soma = (k, porque) => { tipos[k] = tipos[k] || {}; tipos[k][porque] = (tipos[k][porque] || 0) + 1; };
  let iguais = 0, mudam = 0, semAviso = 0;
  for (const f of MESA) {
    let v = null;
    try { v = lerAcao(f, CTX); } catch { v = null; }
    const por = porQueNaoChama(v, {});
    const rolaHoje = por === null || por === "conversa";
    const chHoje = oChamado(v, {}) || null;
    const n = chamadoDoMomento(f, CTX, CALMA, {});
    if (n.chamado && !(n.chamado.aviso && n.chamado.aviso.length <= O_CHAMADO.tetoDoAviso)) semAviso++;
    let k = "";
    if (rolaHoje && !n.rola) k = "deixa de rolar";
    else if (!rolaHoje && n.rola) k = "passa a rolar";
    else if (n.rola && !chHoje && n.chamado) k = "ganha o chamado";
    else if (n.rola && chHoje && !n.chamado) k = "perde o chamado";
    else if (n.rola && chHoje && n.chamado && (chHoje.dc !== n.chamado.dc || chHoje.pericia !== n.chamado.pericia || chHoje.aviso !== n.chamado.aviso)) k = "outro chamado";
    if (k) { mudam++; soma(k, n.porque); } else iguais++;
  }
  console.log(`     ${MESA.length} frases: ${mudam} mudam, ${iguais} ficam como hoje`);
  for (const [k, por] of Object.entries(tipos)) {
    const tot = Object.values(por).reduce((a, b) => a + b, 0);
    console.log(`     ${k}: ${tot} — ` + Object.entries(por).sort((a, b) => b[1] - a[1]).map(([p, n]) => `${p} ${n}`).join(" · "));
  }
  t("a previsão contou todas as frases", mudam + iguais === MESA.length);
  t("todo chamado novo diz o preço numa linha", semAviso === 0, String(semAviso));
}

sec("9. o conserto depois da primeira sessão jogada (19/11/2026, o-mestre-vivo.md §17)");
{
  /* 1. o espontâneo mostra o que o mundo fez, e só quando há o que mostrar */
  const semNome = chamadoQueOMundoProvoca(BASE, com({ relogios: [{ tipo: "cacada", segmentos: 4, cheios: 3 }] }));
  t("a caçada sem nome não chama: não há o que mostrar (antes chamava Percepção sobre nada)", semNome === null);
  const comNome = chamadoQueOMundoProvoca(BASE, com({ relogios: [{ tipo: "cacada", nome: "os batedores do Barão", segmentos: 4, cheios: 3 }] }));
  t("com nome, o espontâneo traz o que mostra: o estado, o nome e o efeito", !!comNome && comNome.mostra && comNome.mostra.estado === "algo_se_aproxima"
    && comNome.mostra.oQue === "os batedores do Barão" && comNome.mostra.efeito === estadoPorId("algo_se_aproxima").efeito, J(comNome && comNome.mostra));
  t("todo estado que chama tem a sua linha do que mostra, ou não provoca (assunto_raro não tem fonte)",
    ESTADOS_DA_CENA.filter((e) => e.chama).every((e) => !!O_QUE_O_MUNDO_MOSTRA[e.id] || ESTADOS_SEM_FONTE.some((s) => s.estado === e.id)));
  t("o que se percebe é percepção, nunca gesto: nenhum texto fala em revirar, revistar ou procurar",
    Object.values(O_QUE_O_MUNDO_MOSTRA).every((m) => ![m.passou, m.falhou].some((x) => /revir|revist|procur|vasculh|mex/i.test(x))));
  const terr = chamadoQueOMundoProvoca(BASE, com({ lugar: { nome: "Taverna do Javali" }, minuto: 3 * 60 }));
  t("o território mostra de quem é: o lugar", !!terr && terr.mostra.oQue === "Taverna do Javali");
  /* 3. o risco claro que passava sem dado, pelo retrato do jogo */
  const forte = { cidade: "Baía do Enforcado", lugar: { nome: "Bateria Alta" }, minuto: 9 * 60, grupo: [{ nome: "Aldric", papel: "caçador", vida: 12, vidaMax: 12 }], pessoas: [{ nome: "Helga", papel: "artilheira" }] };
  const muro = chamadoDoMomento("eu vou escalar o muro do forte pra espiar de cima", CTX, forte, { bonus: 2 });
  t("no forte, escalar o muro rola, com o chamado de Atletismo (na sessão passou de graça)", muro.rola && muro.porque === "riscoDoAto" && !!muro.chamado, muro.porque);
  const roubo = chamadoDoMomento("tento roubar uma bolsa de moedas do bolso de um bebado", CTX, forte, { bonus: 2 });
  t("roubar a bolsa de alguém rola (na sessão foi um ato garantido)", roubo.rola && roubo.veredito && roubo.veredito.id === "bater_carteira", roubo.porque);
  const banca = { ...forte, lugar: { nome: "Bigorna de Ferro" }, pessoas: [{ nome: "Thorin", papel: "ferreiro anão" }] };
  const d1 = chamadoDoMomento("posso pedir um desconto pra quem vende por aqui?", CTX, banca, { bonus: 0 });
  const d2 = chamadoDoMomento("pergunto ao anao da Bigorna de Ferro se ele faz um desconto", CTX, banca, { bonus: 0 });
  t("o desconto ao comerciante rola nas duas formas de dizer, com o preço dito", d1.rola && d2.rola && !!d1.chamado && !!d2.chamado, J([d1.porque, d2.porque]));
  const caminho = chamadoDoMomento("pergunto onde fica o templo", CTX, banca, { bonus: 0 });
  t("perguntar o caminho não rola", !caminho.rola, caminho.porque);
  const dormindo = { ...forte, pessoas: [{ nome: "Ivo", papel: "marinheiro", agora: DORMINDO }, { nome: "Helga", papel: "artilheira" }] };
  const furtoV = chamadoDoMomento("tento roubar a bolsa do Ivo", CTX, dormindo, { bonus: 2 });
  t("quem dorme dá vantagem ao furto, e o furto ainda rola (Helga vê)", furtoV.rola && typeof furtoV.vantagem === "string" && furtoV.vantagem.length > 5, J([furtoV.porque, furtoV.vantagem]));
  t("o motivo para negar continua sem fonte na cena, e diz que mora na régua, lido no alvo da fala",
    /alvo da fala/.test((ESTADOS_SEM_FONTE.find((s) => s.estado === "motivo_para_negar") || {}).porque || ""));
}

sec("S18. o espontâneo depois da segunda sessão jogada (19/11/2026, o-mestre-vivo.md §18)");
{
  /* a sessão mv-2 passou por quatro chegadas (templo, bateria, trapiche,
     feira) e uma estrada de garoa, de dia: nenhum estado que chama nasceu,
     e o espontâneo do Mestre vivo não apareceu. Isto é a regra a funcionar:
     sem mundo que se mexa, não há dado de graça. */
  const chega = (lugar) => ({ cidade: "Ponta das Gaivotas", lugar: { nome: lugar }, minuto: 9 * 60 });
  t("as chegadas da sessão, de dia, não provocam dado", [["Altar Afogado", "Bateria Alta"], ["Trapiche do Sal", "Feira do Saque"]].every(([a, b]) => chamadoQueOMundoProvoca(chega(a), chega(b)) === null));
  t("nem a estrada de garoa", chamadoQueOMundoProvoca(chega("Feira do Saque"), { jornada: true, minuto: 15 * 60, clima: { id: "garoa", rotulo: "garoa fina" } }) === null);
  t("a tempestade que cai na estrada provoca Percepção", (chamadoQueOMundoProvoca({ jornada: true, clima: "chuva" }, { jornada: true, clima: { id: "tempestade", rotulo: "tempestade" } }) || {}).pericia === "percepcao");
  /* o quartel de portas abertas: quem entra pela frente é visto, e não se
     esconde — um mestre não pede Furtividade a ele */
  t("o quartel aberto não provoca Furtividade; a forja fechada de madrugada, sim",
    chamadoQueOMundoProvoca(chega("Largo do Sino"), chega("Quartel da Guarda")) === null
    && (chamadoQueOMundoProvoca(chega("Largo do Sino"), { ...chega("Forja do Anão"), minuto: 23 * 60 }) || {}).pericia === "furtividade");
  /* o nome do relógio é uma frase inteira, e o molde a usa como frase */
  const vesna = chamadoQueOMundoProvoca(BASE, com({ relogios: [{ tipo: "cacada", nome: "Vesna fecha o cerco", segmentos: 4, cheios: 3 }] }));
  const lido = vesna ? vesna.mostra.passou.replace("{oQue}", vesna.mostra.oQue).replace("{efeito}", vesna.mostra.efeito) : "";
  t("a caçada se lê como frase («A caçada está perto: Vesna fecha o cerco.»), nunca «é Vesna fecha o cerco»", /A caçada está perto: Vesna fecha o cerco\.$/.test(lido) && !/é Vesna/.test(lido), lido);
  t("os textos do que o mundo mostra são PT-BR (sem tu, teu, tua)", Object.values(O_QUE_O_MUNDO_MOSTRA).every((m) => !/\b(tu|teu|tua|teus|tuas|contigo)\b/i.test(m.passou + " " + m.falhou)));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
