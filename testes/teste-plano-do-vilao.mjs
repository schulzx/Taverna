/* O PLANO DO VILÃO (08/11/2026, Fase BQ · BQ5) — src/plano-do-vilao.js

   O vilão dos mundos novos: nasce na criação pela semente e pelo
   antecedente, tem um plano de seis passos que anda pelo tempo e pelo
   estado das quests, e o herói só o conhece pelo facto — camada a camada,
   sem que nenhuma vaze a seguinte (mente/plano-biblioteca-de-quests.md, §11).
   §1 as tabelas: os quatro planos, as mãos, os efeitos, os vinte fins, as
      fraquezas, as reações, os desfechos — e a voz (sem dono, sem o nome);
   §2 o nascimento: a semente e o antecedente, o determinismo, a afinidade;
   §3 o save: o registo em espinha.fio.vilao, a catraca, a volta por
      garantirEspinha, e a espinha antiga que não muda;
   §4 a ficha: a vista, e o recuo de quem ainda não tem plano;
   §5 O RELÓGIO anda e recua pelos factos certos;
   §6 AS CAMADAS nunca sobem pelo tempo, uma por turno, e nunca descem;
   §7 NENHUMA CAMADA VAZA a seguinte, e a linha só vem com o vilão em cena;
   §8 O NOME DO HERÓI fica vetado até ele o aprender;
   §9 as reações, uma vez cada;
   §10 cada desfecho é alcançável, e o fim do relógio muda o tom;
   §11 o determinismo, o null e a imutabilidade. */
import {
  FICHA_DO_VILAO, EFEITOS_DO_PLANO, PLANOS_DO_ARQUETIPO, PLANO_DE_RECUO,
  FIM_DO_PLANO, TOM_DO_FIM, RITMO_DO_PLANO, FRAQUEZAS, COMO_SE_TEM_A_FRAQUEZA,
  AFINIDADE_DO_ANTECEDENTE, SOBE_A_CAMADA, CAMPOS_DA_CAMADA, LINHA_DO_VILAO,
  REACOES_DO_VILAO, DESFECHOS_DO_VILAO,
  garantirRegistroDoVilao, nascerOVilao, fichaDoVilao, relogioDoPlano, camadaDoVilao,
  sabeONome, reagirAoHeroi, temAFraqueza, desfechoDoVilao, oVilaoNaPauta,
} from "../src/plano-do-vilao.js";
import { ARQUETIPOS, FASES, PASSOS_DO_PLANO, diasDoPasso } from "../src/vilao.js";
import { FONTES, RESPOSTAS, LEITURAS, TETO_DO_QUE_SABE } from "../src/antagonista.js";
import { FERIDA_DO_VILAO, ATO_DA_REVELACAO } from "../src/nucleo.js";
import { ANTECEDENTES } from "../src/antecedentes.js";
import { CONDICOES, validarCondicao } from "../src/condicoes-da-quest.js";
import { idDoLugar } from "../src/livro-de-factos.js";
import { garantirEspinha } from "../src/saga.js";
import { MAOS_DO_VILAO, LIMITES_DA_QUEST, BIBLIOTECA_DE_QUESTS } from "../src/biblioteca-de-quests.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (x) => { if (x && typeof x === "object") { Object.values(x).forEach(congelar); Object.freeze(x); } return x; };
const ORD = Object.fromEntries(FASES.map((f) => [f.id, f.ordem]));

/* ---------------- o mundo de prova (o de §11.9) ---------------- */
const FIO = { antagonista: "Ilídia Selamar, a Vendedora de Medo", titulo: "a Vendedora de Medo", inicio: 0, assinatura: "cera preta sem selo" };
const CHEFES = [
  { nome: "Ilídia Selamar, a Vendedora de Medo", linha: "principal", covil: "Porto Velho" },
  { nome: "Brás do Vau", linha: "secundaria" },
  { nome: "Mira Cinzenta", linha: "secundaria" },
];
const VAU = idDoLugar({ nome: "Vau", cidade: "Foz" }, { cidade: "Foz" });
const ALF = idDoLugar({ nome: "Alfândega", cidade: "Porto Velho" }, { cidade: "Porto Velho" });
const COVIL = idDoLugar({ cidade: "Porto Velho" });
/* um registo à mão: o arquétipo, o corpo e a fraqueza escolhidos pela
   prova, e os lugares que o esqueleto (BQ6) ancoraria */
function registo(extra) {
  return garantirRegistroDoVilao({
    arquetipo: "vendedor_de_medo", corpo: "pessoa", ferida: "w_heroi_antes",
    fraqueza: { familia: "verdade", id: "v_livro_de_contas" },
    assinatura: "cera preta sem selo", ponte: { de: "passo", passo: 3 },
    tenentes: [{ papel: "tenente_1", nome: "Brás do Vau", passo: 1 }, { papel: "tenente_2", nome: "Mira Cinzenta", passo: 3 }],
    papeis: {
      covil: { tipo: "lugar", nome: "Porto Velho", cidade: "Porto Velho" },
      passo_1: { tipo: "lugar", nome: "Vau", cidade: "Foz" },
      passo_6: { tipo: "lugar", nome: "Alfândega", cidade: "Porto Velho" },
      fraqueza: { tipo: "lugar", nome: "Alfândega", cidade: "Porto Velho" },
    },
    cidadeInicial: "Foz", inicio: 0, camada: "rumor",
    ...(extra || {}),
  });
}
const fichaDe = (reg, fio) => fichaDoVilao({ semente: "prova", fio: { ...FIO, ...(fio || {}), vilao: reg } });
const F0 = fichaDe(registo());
const BASE = diasDoPasso({ corpo: "pessoa" });
const pessoa = (nome, extra) => ({ nome, ...(extra || {}) });
const visto = { de: 1, ate: 1, vezes: 1, turno: 1 };

sec("§1 AS TABELAS");
{
  const arqs = Object.keys(PLANOS_DO_ARQUETIPO);
  t("quatro arquétipos com plano neste lote, todos de vilao.js", arqs.length === 4 && arqs.every((a) => ARQUETIPOS.some((x) => x.id === a)));
  t(`cada plano tem ${FICHA_DO_VILAO.passos} passos`, arqs.every((a) => PLANOS_DO_ARQUETIPO[a].length === FICHA_DO_VILAO.passos));
  const todos = arqs.flatMap((a) => PLANOS_DO_ARQUETIPO[a].map((p, i) => ({ a, i, p })));
  t("cada passo diz, pressagia, deixa obra e tem desvio", todos.every(({ p }) => p.diz && p.presagio && p.obra && p.seTravado));
  t("o contra de cada passo é das mãos, e nunca vazio", todos.every(({ p }) => p.contra.length && p.contra.every((m) => MAOS_DO_VILAO[m])));
  t("o que cada passo muda é do catálogo fechado", todos.every(({ p }) => p.muda.length && p.muda.every((e) => EFEITOS_DO_PLANO[e])));
  t("o prazo é um número positivo", todos.every(({ p }) => typeof p.prazo === "number" && p.prazo > 0));
  /* a composição do esqueleto (§11.3): tenente, recurso ou consequência,
     pista, rosto e confronto — cada plano tem um passo para cada mão */
  const cobre = (a) => { const ms = new Set(PLANOS_DO_ARQUETIPO[a].flatMap((p) => p.contra)); return ms.has("tenente") && ms.has("pista") && ms.has("rosto") && ms.has("confronto") && (ms.has("recurso") || ms.has("consequencia")); };
  t("cada plano é contestável por todas as mãos da composição do esqueleto", arqs.every(cobre));
  t("o último passo é o do confronto, e só dele", arqs.every((a) => J(PLANOS_DO_ARQUETIPO[a][5].contra) === J(["confronto"])) && todos.filter(({ i }) => i < 5).every(({ p }) => !p.contra.includes("confronto")));
  t("o penúltimo passo pede o rosto", arqs.every((a) => PLANOS_DO_ARQUETIPO[a][4].contra.includes("rosto")));
  const V = PLANOS_DO_ARQUETIPO.vendedor_de_medo;
  t("o plano da Vendedora de Medo é o de §11.9 (o tenente no 1, a consequência e a pista no 3, a pista no 4)",
    V[0].contra.includes("tenente") && V[2].contra.includes("consequencia") && V[2].contra.includes("pista") && V[3].contra.includes("pista") && V[1].diz === "vender a proteção");
  t("o recuo tem seis posições, dos passos genéricos de vilao.js",
    PLANO_DE_RECUO.indices.length === 6 && PLANO_DE_RECUO.indices.every((i) => PASSOS_DO_PLANO[i])
    && ["presagio", "obra", "seTravado", "contra", "muda", "prazo"].every((k) => PLANO_DE_RECUO[k].length === 6));
  t("os vinte fins, um por arquétipo, com efeitos do catálogo",
    ARQUETIPOS.every((a) => FIM_DO_PLANO[a.id] && FIM_DO_PLANO[a.id].frase && FIM_DO_PLANO[a.id].efeitos.every((e) => EFEITOS_DO_PLANO[e])) && Object.keys(FIM_DO_PLANO).length === ARQUETIPOS.length);
  t("o fim muda o tom, de impedir para reconquistar, com um tenente a mais", TOM_DO_FIM.de === "impedir" && TOM_DO_FIM.para === "reconquistar" && TOM_DO_FIM.tenentesAMais === 1);
  t("o ritmo do plano é o da planta (0,75 · 1,5)", RITMO_DO_PLANO.ignorada === 0.75 && RITMO_DO_PLANO.recurso === 1.5 && RITMO_DO_PLANO.certezaQueMira === 3);
  t("três famílias de fraqueza, e cada arquétipo com plano tem uma em cada",
    J(Object.keys(FRAQUEZAS)) === J(["pessoa", "coisa", "verdade"]) && arqs.every((a) => Object.values(FRAQUEZAS).every((l) => l.some((e) => e.arquetipo === a))));
  t("toda fraqueza tem id único; toda coisa tem o nome do objeto",
    new Set(Object.values(FRAQUEZAS).flat().map((e) => e.id)).size === Object.values(FRAQUEZAS).flat().length && FRAQUEZAS.coisa.every((e) => e.nome));
  t("ter a fraqueza é um predicado ativo do vocabulário fechado",
    Object.values(COMO_SE_TEM_A_FRAQUEZA).every((c) => CONDICOES[c[0]] && !CONDICOES[c[0]].reservado && validarCondicao(c).ok));
  t("a afinidade fala de antecedentes que existem e de arquétipos com plano",
    Object.keys(AFINIDADE_DO_ANTECEDENTE.por).every((a) => ANTECEDENTES.some((x) => x.id === a))
    && Object.values(AFINIDADE_DO_ANTECEDENTE.por).every((m) => Object.keys(m).every((k) => PLANOS_DO_ARQUETIPO[k])));
  t("todo antecedente tem afinidade", ANTECEDENTES.every((a) => AFINIDADE_DO_ANTECEDENTE.por[a.id]));
  t("as camadas que sobem são as fases de vilao.js, menos o rumor",
    J(Object.keys(SOBE_A_CAMADA)) === J(FASES.slice(1).map((f) => f.id)));
  t("cada campo da linha tem a camada de onde pode vir", Object.values(CAMPOS_DA_CAMADA).every((c) => ORD[c] != null));
  t("os modelos da linha só usam campos da tabela das camadas",
    Object.values(LINHA_DO_VILAO.camadas).flat().every((m) => [...m.matchAll(/\{(\w+)\}/g)].every((x) => CAMPOS_DA_CAMADA[x[1]])));
  t("as reações têm quando único, e a fonte do livro dele existe",
    new Set(REACOES_DO_VILAO.map((r) => r.quando)).size === REACOES_DO_VILAO.length
    && REACOES_DO_VILAO.every((r) => !r.sabe || FONTES.some((f) => f.id === r.sabe.fonte)));
  t("a resposta e a leitura que uma reação cita existem em antagonista.js",
    REACOES_DO_VILAO.every((r) => (!r.resposta || RESPOSTAS.some((x) => x.id === r.resposta)) && (!r.leitura || LEITURAS.some((x) => x.id === r.leitura))));
  t("a reação que o jogo não alimenta diz porquê (a fama por cidade)", REACOES_DO_VILAO.filter((r) => r.reservado).map((r) => r.id).join() === "mira_o_que_ama");
  t("duas reações ensinam-lhe o nome (poupar um servo, aceitar a oferta)", REACOES_DO_VILAO.filter((r) => r.sabe && r.sabe.sobre === "nome").map((r) => r.quando).sort().join() === "aceitou_oferta,poupou_tenente");
  t("os quatro desfechos, pela ordem de julgamento", DESFECHOS_DO_VILAO.map((d) => d.id).join() === "pacto,redencao,derrota,fuga");
  t("os factos dos desfechos são condições válidas do vocabulário fechado",
    DESFECHOS_DO_VILAO.every((d) => !d.factos || validarCondicao(d.factos, { vilao: { tipo: "pessoa" }, fraqueza: { tipo: "pessoa" } }).ok));
  t("o rosto espera o ato da máscara do núcleo", FICHA_DO_VILAO.atoDoRosto === ATO_DA_REVELACAO.mascara);

  /* O ENCONTRO COM A BQ4: o campo `mao` da ficha da quest é o ponto onde as
     duas pontas se tocam. Os passos são os que o `contra` dela aceita, as
     mãos são as dela, e as quests do catálogo contestam passos que as
     aceitam — no plano para que foram escritas (o da Vendedora, §11.9) */
  t("os passos de um plano são os que o `mao.contra` da quest aceita (LIMITES_DA_QUEST)", FICHA_DO_VILAO.passos === LIMITES_DA_QUEST.passosDoPlano);
  t("as mãos são as da ficha da quest, e o plano usa-as todas", Object.keys(MAOS_DO_VILAO).every((m) => todos.some(({ p }) => p.contra.includes(m))));
  const comMao = BIBLIOTECA_DE_QUESTS.filter((q) => q.mao);
  t("o catálogo tem quests com a mão dele", comMao.length >= 2);
  const encaixa = (q, plano) => q.mao.contra.every((n) => plano[n - 1] && [q.mao.tipo, ...(q.mao.tambem || [])].some((m) => plano[n - 1].contra.includes(m)));
  t("cada quest do catálogo contesta, no plano da Vendedora, passos que aceitam a mão dela",
    comMao.every((q) => encaixa(q, PLANOS_DO_ARQUETIPO.vendedor_de_medo)), comMao.filter((q) => !encaixa(q, PLANOS_DO_ARQUETIPO.vendedor_de_medo)).map((q) => q.id).join());
  /* a métrica da BQ6 (o alvo é zero quando o acervo crescer): os passos
     de cada plano que nenhuma quest do catálogo pode contestar ainda */
  const semQuest = Object.fromEntries(arqs.map((a) => [a, PLANOS_DO_ARQUETIPO[a].filter((p) => !comMao.some((q) => [q.mao.tipo, ...(q.mao.tambem || [])].some((m) => p.contra.includes(m)))).length]));
  console.log("      passos sem quest no catálogo, por plano: " + J(semQuest));
  t("só o confronto espera o acervo (BQ8) — contado, não escondido",
    arqs.every((a) => PLANOS_DO_ARQUETIPO[a].filter((p) => !comMao.some((q) => [q.mao.tipo, ...(q.mao.tambem || [])].some((m) => p.contra.includes(m)))).every((p) => J(p.contra) === J(["confronto"]))));
  /* e o registo real da BQ4, com a mão da ficha ao lado, anda no relógio:
     O Salvo-Conduto concluído a tempo trava os dois passos que contesta */
  const salvo = BIBLIOTECA_DE_QUESTS.find((q) => q.mao && q.mao.tipo === "tenente");
  const registoBQ4 = { v: 1, id: salvo.id, tipo: 1, inicio: 0, estado: "concluida", motivo: "etapas", fechouEm: 2, escolhas: {}, mao: salvo.mao };
  const rel = relogioDoPlano(F0, { dia: 30 }, { quests: [registoBQ4] });
  t("o registo da BQ4 trava no relógio os passos do `mao.contra` dela", salvo.mao.contra.every((n) => rel.passos[n - 1].estado === "travado"));
  const cinzas = BIBLIOTECA_DE_QUESTS.find((q) => q.mao && (q.mao.tambem || []).includes("pista"));
  t("a mão que é também pista (o `tambem`) sobe a camada como pista", !!cinzas
    && camadaDoVilao(F0, { dia: 9 }, { quests: [{ v: 1, id: cinzas.id, estado: "concluida", fechouEm: 9, escolhas: {}, mao: cinzas.mao }] }).id === "marca");
  /* achado na primeira volta desta suíte: o passo 6 do Faminto dizia
     «abrir a última porta», que é o `quer` dele — e o plano escapava na
     camada do rosto. O que ele quer (rosto) nunca pode ser já um passo do
     plano (guerra) */
  t("o que ele quer nunca contém um passo do próprio plano",
    arqs.every((a) => PLANOS_DO_ARQUETIPO[a].every((p) => !ARQUETIPOS.find((x) => x.id === a).quer.toLowerCase().includes(p.diz.toLowerCase()))));

  /* A VOZ: sente-se antes de se ver. Nenhum presságio, obra ou desvio tem
     dono, nem diz palavra de sistema, nem o nome do herói (que ele não sabe) */
  const vozes = [...todos.flatMap(({ p }) => [p.presagio, p.obra, p.seTravado]), ...PLANO_DE_RECUO.presagio, ...PLANO_DE_RECUO.obra, ...PLANO_DE_RECUO.seTravado];
  t("nenhuma linha da voz diz vilão, nêmesis, inimigo, plano ou sistema", vozes.every((s) => !/vil[aã]o|n[eê]mesis|inimigo|\bplano\b|sistema/i.test(s)));
  t("nenhuma linha da voz põe o nome do herói na boca dele", vozes.every((s) => !/meu nome|teu nome|o nome d/i.test(s)));
  const cabe = LINHA_DO_VILAO.teto - LINHA_DO_VILAO.cabeca.length;
  t(`a obra e o presságio cabem sozinhos na linha (${cabe})`, todos.every(({ p }) => p.obra.length <= cabe && p.presagio.length <= cabe) && [...PLANO_DE_RECUO.obra, ...PLANO_DE_RECUO.presagio].every((s) => s.length <= cabe));
}

sec("§2 O NASCIMENTO — a semente e o antecedente");
{
  const nasce = (semente, antecedente) => nascerOVilao({ semente, antecedente, fio: FIO, chefes: CHEFES, cidadeInicial: "Foz" });
  const a = nasce("mundo-1", "soldado"), b = nasce("mundo-1", "soldado");
  t("a mesma semente e o mesmo antecedente dão o mesmo vilão", J(a) === J(b));
  t("cinquenta sementes, cada uma igual a si mesma", Array.from({ length: 50 }, (_, i) => J(nasce("m" + i, "erudito")) === J(nasce("m" + i, "erudito"))).every(Boolean));
  t("o antecedente pelo nome é o mesmo que pelo id", J(nasce("m7", "Erudito de Arquivo")) === J(nasce("m7", "erudito")));
  const difere = Array.from({ length: 40 }, (_, i) => J(nasce("d" + i, "acolito")) !== J(nasce("d" + i, "nobre_caido"))).filter(Boolean).length;
  t(`o antecedente muda o vilão (${difere} de 40 sementes)`, difere >= 20);
  const conta = (ant) => { const c = {}; for (let i = 0; i < 400; i++) { const r = nascerOVilao({ semente: "a" + i, antecedente: ant }); c[r.arquetipo] = (c[r.arquetipo] || 0) + 1; } return c; };
  const maior = (c) => Object.entries(c).sort((x, y) => y[1] - x[1])[0][0];
  t("o erudito que leu o que não devia atrai o Faminto", maior(conta("erudito")) === "faminto");
  t("o acólito fugido atrai o Zeloso", maior(conta("acolito")) === "zeloso");
  t("o nobre caído atrai o Traído", maior(conta("nobre_caido")) === "traido");
  const sem = conta("");
  t("sem antecedente, os quatro saem", Object.keys(sem).length === 4);
  t("só nascem arquétipos com plano próprio", Object.keys(conta("pragado")).every((k) => PLANOS_DO_ARQUETIPO[k]));
  t("o vilão nasce na camada do rumor, sem saber o nome do herói", a.camada === "rumor" && a.nomeDoHeroi === null && a.reagiu.length === 0);
  t("os tenentes são os secundários do mundo, e o principal não", a.tenentes.map((x) => x.nome).join() === "Brás do Vau,Mira Cinzenta");
  const plano = PLANOS_DO_ARQUETIPO[a.arquetipo];
  t("cada tenente serve um passo que a mão tenente contesta", a.tenentes.every((x) => plano[x.passo - 1].contra.includes("tenente")));
  t("a assinatura do fio fica (o relógio do fio já a deixa no mundo)", a.assinatura === FIO.assinatura);
  const semFio = nascerOVilao({ semente: "z", antecedente: "orfao" });
  t("sem fio, a assinatura sai do arquétipo", ARQUETIPOS.find((x) => x.id === semFio.arquetipo).assinaturas.includes(semFio.assinatura));
  t("o covil do principal fica como lugar dele", a.papeis.covil && a.papeis.covil.nome === "Porto Velho");
  t("o dia em que começa é o do fio", nascerOVilao({ semente: "q", fio: { ...FIO, inicio: 9 } }).inicio === 9);
  const ferida = nascerOVilao({ semente: "w", ferida: "w_filha" });
  t("a ferida que o núcleo elegeu fica, e a teia dela é a ponte", ferida.ferida === "w_filha" && J(ferida.ponte) === J({ de: "ferida", com: "porta" }));
  const livres = Array.from({ length: 60 }, (_, i) => nascerOVilao({ semente: "f" + i }));
  t("sem ferida dada, nenhuma que peça condição", livres.every((r) => !FERIDA_DO_VILAO.find((w) => w.id === r.ferida).so));
  t("a ponte sem teia cai num passo do meio", livres.every((r) => r.ponte.de === "passo" && FICHA_DO_VILAO.pontePassos.includes(r.ponte.passo)));
  t("a fraqueza é da família sorteada, e do arquétipo dele", livres.every((r) => { const e = FRAQUEZAS[r.fraqueza.familia].find((x) => x.id === r.fraqueza.id); return e && (!e.arquetipo || e.arquetipo === r.arquetipo); }));
  t("as três famílias saem", new Set(livres.map((r) => r.fraqueza.familia)).size === 3);
  t("null e lixo nascem um vilão válido, sempre o mesmo", J(nascerOVilao(null)) === J(nascerOVilao({})) && !!garantirRegistroDoVilao(nascerOVilao("lixo")));
}

sec("§3 O SAVE — espinha.fio.vilao, campo novo e aditivo");
{
  const r = registo();
  t("a catraca recusa null, lixo e arquétipo que não existe", garantirRegistroDoVilao(null) === null && garantirRegistroDoVilao([]) === null && garantirRegistroDoVilao({ arquetipo: "xx" }) === null);
  t("a catraca é idempotente", J(garantirRegistroDoVilao(r)) === J(r));
  const torto = garantirRegistroDoVilao({ arquetipo: "zeloso", corpo: "dragao", ferida: "xx", fraqueza: { familia: "coisa", id: "v_quem_traiu" }, camada: "infinita", reagiu: [{ chave: "a", dia: 2 }, { chave: "a", dia: 3 }, "lixo"], guardas: [9, 2, 2, "x"], tenentes: [{ papel: "Tenente!", nome: "x" }], papeis: { covil: { tipo: "dragao", nome: "x" }, ok_1: { tipo: "lugar", nome: "Vau" } } });
  t("o lixo dentro do registo cai, e o resto fica", torto.corpo === "pessoa" && torto.ferida === "" && torto.fraqueza === null && torto.camada === "rumor"
    && torto.reagiu.length === 1 && J(torto.guardas) === J([2]) && torto.tenentes.length === 0 && Object.keys(torto.papeis).join() === "ok_1");
  const esp = garantirEspinha({ semente: "s", atos: [], fio: { ...FIO, vilao: r } });
  t("garantirEspinha deixa passar o registo inteiro", J(esp.fio.vilao) === J(r));
  t("e devolve uma cópia, nunca a mesma referência", esp.fio.vilao !== r);
  const antiga = garantirEspinha({ semente: "s", atos: [], fio: { ...FIO } });
  t("a espinha antiga não ganha campo nenhum", !("vilao" in antiga.fio));
  t("e a ficha dela é null — nada muda para as campanhas em curso", fichaDoVilao(antiga) === null);
  t("o registo torto no fio não vira ficha", fichaDoVilao(garantirEspinha({ semente: "s", atos: [], fio: { ...FIO, vilao: { arquetipo: 7 } } })) === null);
  t("o registo é pequeno no save (< 2 mil caracteres)", J(nascerOVilao({ semente: "x", fio: FIO, chefes: CHEFES, cidadeInicial: "Foz" })).length < 2000);
}

sec("§4 A FICHA — a vista sobre o que existe");
{
  const f = F0;
  t("o nome é o próprio do fio, sem o título", f.nome === "Ilídia Selamar" && f.titulo === "a Vendedora de Medo");
  t("o que quer e a crença vêm do arquétipo", f.quer === ARQUETIPOS.find((a) => a.id === "vendedor_de_medo").quer && !!f.crenca);
  t("o porquê vem da ferida do núcleo", f.porque === FERIDA_DO_VILAO.find((w) => w.id === "w_heroi_antes").o);
  t("o fim e o plano próprio", f.fim === FIM_DO_PLANO.vendedor_de_medo && f.planoProprio && f.plano === PLANOS_DO_ARQUETIPO.vendedor_de_medo);
  t("a fraqueza, em mundo", f.fraqueza.familia === "verdade" && f.fraqueza.o.includes("livro de contas"));
  t("a ficha pelo fio também serve", fichaDoVilao({ ...FIO, vilao: registo() }).nome === "Ilídia Selamar");
  const esp = fichaDe(registo({ arquetipo: "espelho" }));
  t("quem ainda não tem plano anda pelo recuo, com seis passos", !esp.planoProprio && esp.plano.length === 6 && esp.plano[0].diz === PASSOS_DO_PLANO[0].diz && esp.fim === FIM_DO_PLANO.espelho);
}

sec("§5 O RELÓGIO — anda e recua pelos factos certos");
{
  const f = F0, P = PLANOS_DO_ARQUETIPO.vendedor_de_medo;
  const prazo = (k, mult = 1) => Math.max(RITMO_DO_PLANO.prazoMinimo, Math.round(BASE * P[k - 1].prazo * mult));
  const v1 = prazo(1), v2 = v1 + prazo(2);
  const r0 = relogioDoPlano(f, { dia: v1 });
  t("passa o prazo: o passo cumpre-se, com os efeitos dele", r0.passos[0].estado === "cumprido" && r0.passos[0].dia === v1 && r0.passos[0].porque === "prazo" && J(r0.passos[0].muda) === J(P[0].muda));
  t("o seguinte corre, e os outros estão por vir", r0.atual === 2 && r0.passos[1].estado === "corre" && r0.passos.slice(2).every((s) => s.estado === "por_vir"));
  t("antes do prazo, nada se cumpre", relogioDoPlano(f, { dia: v1 - 1 }).cumpridos === 0);
  /* o registo da BQ4 com a mão da ficha ao lado: o abandono é a falha com
     motivo «abandono», e o dia do fecho é o fechouEm */
  const q = (situacao, dia, contra = [1], tipo = "tenente") => ({ id: "q_" + situacao + dia, mao: { tipo, contra },
    ...(situacao === "abandonada" ? { estado: "falhada", motivo: "abandono" } : { estado: situacao }),
    ...(situacao === "aberta" || situacao === "oferecida" ? { inicio: dia } : { fechouEm: dia }) });

  const trav = relogioDoPlano(f, { dia: v1 + 1 }, { quests: [q("concluida", 3)] });
  t("a quest que o contesta conclui a tempo: o passo fica travado, sem efeitos", trav.passos[0].estado === "travado" && trav.passos[0].dia === 3 && !trav.passos[0].muda);
  t("e o plano desvia-se pelo seTravado", trav.passos[0].desvio === P[0].seTravado);
  t("travar nunca o adianta: o seguinte começa no prazo de origem", trav.passos[1].inicio === v1);
  const tarde = relogioDoPlano(f, { dia: v1 + 5 }, { quests: [q("concluida", v1 + 2)] });
  t("concluída depois do prazo não trava (o passo já se cumprira)", tarde.passos[0].estado === "cumprido");
  const dois = relogioDoPlano(f, { dia: v2 + 1 }, { quests: [q("concluida", 2, [1, 2])] });
  t("uma quest que contesta dois passos trava os dois (o desvio do Salvo-Conduto)", dois.passos[0].estado === "travado" && dois.passos[1].estado === "travado");

  const fal = relogioDoPlano(f, { dia: 2 }, { quests: [q("falhada", 2)] });
  t("a quest falha: o passo cumpre-se já, sem esperar o prazo", fal.passos[0].estado === "cumprido" && fal.passos[0].dia === 2 && fal.passos[0].porque === "falhada");
  t("e o seguinte começa a correr daí", fal.passos[1].inicio === 2);
  const aba = relogioDoPlano(f, { dia: 3 }, { quests: [q("abandonada", 3)] });
  t("abandonada também", aba.passos[0].estado === "cumprido" && aba.passos[0].porque === "abandonada");

  const ign = relogioDoPlano(f, { dia: 200 }, { quests: [q("oferecida", null)] });
  t("ficou por aceitar até ao prazo: cumpre-se, como ignorada", ign.passos[0].porque === "ignorada");
  t("e o seguinte vem com o prazo × 0,75", ign.passos[1].vence - ign.passos[1].inicio === prazo(2, RITMO_DO_PLANO.ignorada));
  const aceite = relogioDoPlano(f, { dia: 200 }, { quests: [q("aberta", 1)] });
  t("aceite e em curso não acelera nada", aceite.passos[0].porque === "prazo" && aceite.passos[1].vence - aceite.passos[1].inicio === prazo(2));

  const rec = relogioDoPlano(f, { dia: 200 }, { quests: [q("concluida", 2, [1], "recurso")] });
  t("tirar-lhe um recurso trava o passo e atrasa o seguinte × 1,5", rec.passos[0].estado === "travado" && rec.passos[1].vence - rec.passos[1].inicio === prazo(2, RITMO_DO_PLANO.recurso));

  const semDia = relogioDoPlano(f, { dia: v1 }, { quests: [{ id: "x", mao: { tipo: "tenente", contra: [1] }, estado: "concluida" }] });
  t("um fecho sem dia não conta para o relógio", semDia.passos[0].estado === "cumprido");
  const lixo = relogioDoPlano(f, { dia: v1 }, { quests: [null, { mao: { tipo: "dragao", contra: [1] }, estado: "concluida", fechouEm: 1 }, { mao: { tipo: "tenente" }, estado: "feita", fechouEm: 1 }] });
  t("quests tortas não mexem no relógio", lixo.passos[0].estado === "cumprido");

  /* o tenente que cai: o passo que servia desfaz-se, e o que corre ganha um passo */
  const factos = (como, dia) => ({ v: 1, pessoas: { "npc|Brás do Vau": { nome: "Brás do Vau", visto, derrotado: { dia, como } } }, lugares: {} });
  const semQueda = relogioDoPlano(f, { dia: v1 + 2 });
  const comQueda = relogioDoPlano(f, { dia: v1 + 2, factos: factos("morto", v1 + 1) });
  t("matar o tenente depois do passo dele faz esse passo recuar", comQueda.passos[0].recuado === true && J(comQueda.passos[0].muda) === "[]" && comQueda.cumpridos === 0);
  t("e o passo que corre ganha um passo inteiro", comQueda.passos[1].vence - semQueda.passos[1].vence === Math.round(BASE * RITMO_DO_PLANO.recuo));
  const antes = relogioDoPlano(f, { dia: v1 + 2, factos: factos("morto", 2) });
  t("matá-lo antes do passo dele adia esse passo", antes.passos[0].estado === "corre" && antes.passos[0].vence === v1 + Math.round(BASE * RITMO_DO_PLANO.recuo));
  const futuro = relogioDoPlano(f, { dia: v1 + 2, factos: factos("morto", 99) });
  t("uma queda com dia no futuro não conta", J(futuro) === J(semQueda));
  const virado = fichaDe(registo({ reagiu: [{ chave: "virou|tenente_1", dia: v1 + 1 }] }));
  t("virar o tenente também o faz recuar", relogioDoPlano(virado, { dia: v1 + 2 }).passos[0].recuado === true);

  /* ele sabe do herói: o passo mira o que o herói ama */
  const amado = { pessoas: ["Marta"], lugares: ["a forja"], promessas: [] };
  const sabe = [{ o: "o forasteiro que matou um servo", fonte: "marca", dia: 0 }];
  const mira = relogioDoPlano(f, { dia: v1, saber: sabe }, { amado });
  t("com certeza 3 no livro dele, o passo cumprido leva um alvo do que o herói ama", mira.passos[0].mira && mira.passos[0].alvo && ["Marta", "a forja"].includes(mira.passos[0].alvo.nome));
  t("e o alvo é sempre o mesmo para a mesma semente", J(relogioDoPlano(f, { dia: v1, saber: sabe }, { amado })) === J(mira));
  const boato = relogioDoPlano(f, { dia: v1, saber: [{ o: "um boato", fonte: "boato", dia: 0 }] }, { amado });
  t("um boato não chega para mirar", !boato.passos[0].mira && !boato.passos[0].alvo);
  const tardio = relogioDoPlano(f, { dia: v1, saber: [{ o: "soube tarde", fonte: "viu", dia: 1 }] }, { amado });
  t("o que soube depois de o passo começar não muda esse passo", !tardio.passos[0].mira);

  const fim = relogioDoPlano(f, { dia: 10000 });
  t("se ninguém o parar, os seis cumprem-se e o fim dele chega", fim.cumpridos === 6 && fim.fim && fim.fim.frase === FIM_DO_PLANO.vendedor_de_medo.frase && fim.atual === null);
  t("o fim muda o tom, e traz os efeitos dele", fim.fim.tom === "reconquistar" && J(fim.fim.efeitos) === J(FIM_DO_PLANO.vendedor_de_medo.efeitos) && fim.fim.tenentesAMais === 1);
  const travado6 = relogioDoPlano(f, { dia: 10000 }, { quests: [q("concluida", 5, [6], "confronto")] });
  t("o confronto a tempo trava o último passo, e o fim não chega", travado6.passos[5].estado === "travado" && travado6.fim === null);
  const conselho = fichaDe(registo({ corpo: "conselho" }));
  t("o corpo muda o ritmo (um conselho precisa de concordar)", relogioDoPlano(conselho, { dia: 0 }).passos[0].vence > relogioDoPlano(f, { dia: 0 }).passos[0].vence);
}

sec("§6 AS CAMADAS — pelo facto, nunca pelo tempo");
{
  const f = F0;
  const fim = relogioDoPlano(f, { dia: 10000 });
  t("dia dez mil, o plano inteiro cumprido, e nenhum facto: rumor", camadaDoVilao(f, { dia: 10000 }, { ato: 4 }).id === "rumor");
  t("e com o relógio passado à mão, o mesmo", camadaDoVilao(f, { dia: 10000 }, { ato: 4, relogio: fim }).alvo === 0);

  const P1 = relogioDoPlano(f, { dia: 10000 }).passos[0].dia;
  const lugar = (ate) => ({ v: 1, pessoas: {}, lugares: { [VAU]: { nome: "Vau", esteve: { de: ate, ate, vezes: 1, turno: 1 } } } });
  t("esteve no lugar do passo depois de feito: o sinal", camadaDoVilao(f, { dia: 10000, factos: lugar(P1 + 1) }).id === "marca");
  t("esteve lá antes de o passo se cumprir: nada (o tempo não revela)", camadaDoVilao(f, { dia: 10000, factos: lugar(P1 - 1) }).id === "rumor");
  t("a assinatura na bolsa: o sinal", camadaDoVilao(f, { dia: 1, personagem: { inventario: ["cera preta sem selo"] } }).id === "marca");
  const desc = { v: 1, pessoas: {}, lugares: { [COVIL]: { nome: "Porto Velho", descobriu: { dia: 2 } } } };
  t("descobriu o que o covil esconde: o sinal", camadaDoVilao(f, { dia: 2, factos: desc }).id === "marca");
  t("uma quest de pista concluída: o sinal", camadaDoVilao(f, { dia: 2 }, { quests: [{ id: "p", mao: { tipo: "pista", contra: [3] }, estado: "concluida", fechouEm: 2 }] }).id === "marca");

  const brás = { v: 1, pessoas: { "npc|Brás do Vau": { nome: "Brás do Vau", visto } }, lugares: {} };
  const c1 = camadaDoVilao(f, { dia: 2, factos: brás });
  t("conheceu o tenente: o alvo é a mão, mas sobe UMA camada por turno", c1.alvo === ORD.mao && c1.id === "marca" && c1.subiu);
  const c2 = camadaDoVilao(f, { dia: 2, factos: brás }, { anterior: c1.id });
  t("no turno seguinte, a mão", c2.id === "mao");
  t("o facto que a subiu fica dito", c2.subiuPor === SOBE_A_CAMADA.mao.diz);
  const morto = { v: 1, pessoas: { "npc|Mira Cinzenta": { nome: "Mira Cinzenta", derrotado: { dia: 2, como: "morto" } } }, lugares: {} };
  t("derrotou o tenente sem o ver de perto: também a mão", camadaDoVilao(f, { dia: 2, factos: morto }).alvo === ORD.mao);
  t("um nome só ouvido não conta (nomeado não é visto)", camadaDoVilao(f, { dia: 2, factos: { v: 1, pessoas: { "npc|Brás do Vau": { nome: "Brás do Vau", nomeado: { de: 1 } } }, lugares: {} } }).id === "rumor");

  const ilidia = { v: 1, pessoas: { "npc|Ilídia Selamar": { nome: "Ilídia Selamar", visto, falou: { de: 3, ate: 3, vezes: 1, turno: 3 } } }, lugares: {} };
  const rosto = (sit) => [{ id: "r", mao: { tipo: "rosto", contra: [5] }, estado: sit, fechouEm: 3 }];
  t("falou com ele no encontro do rosto, no ato 1: o rosto", camadaDoVilao(f, { dia: 3, factos: ilidia }, { quests: rosto("aberta"), ato: 1, anterior: "mao" }).id === "rosto");
  t("no ato 0, nunca o rosto", camadaDoVilao(f, { dia: 3, factos: ilidia }, { quests: rosto("aberta"), ato: 0, anterior: "mao" }).id === "mao");
  t("falar com ele sem a quest do rosto não chega", camadaDoVilao(f, { dia: 3, factos: ilidia }, { ato: 2, anterior: "mao" }).id === "mao");
  t("o rosto concluído: a guerra", camadaDoVilao(f, { dia: 3 }, { quests: rosto("concluida"), ato: 2, anterior: "rosto" }).id === "guerra");
  t("o confronto aberto: a queda", camadaDoVilao(f, { dia: 3 }, { quests: [{ id: "c", mao: { tipo: "confronto", contra: [6] }, estado: "aberta", fechouEm: 3 }], ato: 3, anterior: "guerra" }).id === "queda");
  t("a camada nunca desce", camadaDoVilao(f, { dia: 3 }, { anterior: "guerra" }).id === "guerra");
  t("e por omissão parte da que o registo guardou", camadaDoVilao(fichaDe(registo({ camada: "mao" })), { dia: 0 }).id === "mao");
  /* a subida por turno, contada: do rumor à queda são cinco turnos, mesmo
     com todos os factos no primeiro */
  const tudo = { dia: 50, factos: { v: 1, pessoas: { ...brás.pessoas, ...ilidia.pessoas }, lugares: {} } };
  const qs = [...rosto("concluida"), { id: "c", mao: { tipo: "confronto", contra: [6] }, estado: "aberta", fechouEm: 3 }];
  const subida = []; let ant = "rumor";
  for (let i = 0; i < 7; i++) { ant = camadaDoVilao(f, tudo, { quests: qs, ato: 3, anterior: ant }).id; subida.push(ant); }
  t("com tudo à mão, uma camada por turno: " + subida.join(" → "), J(subida) === J(["marca", "mao", "rosto", "guerra", "queda", "queda", "queda"]));
}

sec("§7 NENHUMA CAMADA VAZA A SEGUINTE");
{
  /* para cada arquétipo com plano e cada família de fraqueza, uma ficha com
     nomes que não se confundem com a voz, e a fraqueza na mão do herói; em
     cada camada, a linha não pode ter nenhum campo de uma camada acima */
  let casos = 0, vazou = [], longas = [], semLinha = 0;
  for (const arq of Object.keys(PLANOS_DO_ARQUETIPO)) {
    for (const familia of Object.keys(FRAQUEZAS)) {
      const fr = FRAQUEZAS[familia].find((e) => e.arquetipo === arq);
      const reg = registo({
        arquetipo: arq, fraqueza: { familia, id: fr.id }, ferida: "w_a_morrer",
        tenentes: [{ papel: "tenente_1", nome: "Brás do Vau", passo: 1 }],
        papeis: {
          passo_1: { tipo: "lugar", nome: "Vau", cidade: "Foz" },
          fraqueza: familia === "pessoa" ? { tipo: "pessoa", nome: "Teodora Lume" } : familia === "verdade" ? { tipo: "lugar", nome: "Alfândega", cidade: "Porto Velho" } : undefined,
        },
      });
      const f = fichaDe(reg, { antagonista: "Quelvar Ossobranco, o Rei Emprestado", titulo: "o Rei Emprestado" });
      for (const dia of [0, 12, 40, 75]) {
      const estado = {
        dia,
        personagem: { inventario: fr.nome ? [fr.nome] : [], grupo: familia === "pessoa" ? [{ nome: "Teodora Lume" }] : [] },
        factos: { v: 1, pessoas: {}, lugares: familia === "verdade" ? { [ALF]: { nome: "Alfândega", descobriu: { dia: 30 } } } : {} },
        saber: [{ o: "viu o forasteiro", fonte: "viu", dia: 0 }],
      };
      if (dia === 40) t(`${arq}/${familia}: o herói tem a fraqueza, pelo facto`, temAFraqueza(f, estado));
      const rel = relogioDoPlano(f, estado);
      const corre = rel.passos.find((s) => s.estado === "corre");
      const campos = {
        assinatura: [f.assinatura], tenente: ["Brás do Vau"],
        nome: [f.nome, "Quelvar"], titulo: [f.titulo], crenca: [f.crenca], quer: [f.quer],
        plano: corre ? [corre.diz] : [], fraqueza: [f.fraqueza.o], ferida: [f.porque],
      };
      for (const c of FASES) {
        const r = oVilaoNaPauta(f, estado, { camada: c.id, relogio: rel, cena: { presentes: ["Brás do Vau"], cidade: "Foz" } });
        casos++;
        if (!r.momento) semLinha++;
        if (r.momento.length > LINHA_DO_VILAO.teto) longas.push(`${arq}/${c.id}: ${r.momento.length}`);
        const texto = [r.momento, ...r.naoPode].join(" ").toLowerCase();
        for (const [campo, valores] of Object.entries(campos)) {
          if (ORD[CAMPOS_DA_CAMADA[campo]] <= c.ordem) continue;
          for (const v of valores) if (v && texto.includes(String(v).toLowerCase())) vazou.push(`${arq}/${familia}/${c.id}/dia ${dia}: ${campo}`);
        }
        /* e nenhum passo do plano, seja qual for, antes da guerra */
        if (c.ordem < ORD.guerra) for (const p of f.plano) if (texto.includes(p.diz.toLowerCase())) vazou.push(`${arq}/${c.id}/dia ${dia}: o passo «${p.diz}»`);
      }
      }
    }
  }
  t(`${casos} linhas (4 arquétipos × 3 fraquezas × 6 camadas × 4 dias), nenhum campo de cima${vazou.length ? " — " + vazou.slice(0, 4).join("; ") : ""}`, vazou.length === 0);
  t("toda linha cabe no teto", longas.length === 0, longas.join("; "));
  t("com o vilão em cena, sempre há linha", semLinha === 0);

  const f = F0;
  const est = { dia: 40, saber: [] };
  const sem = oVilaoNaPauta(f, est, { camada: "queda", cena: { presentes: ["Joana"], cidade: "Aldeia Nova" } });
  t("sem o vilão na cena, nada — nem linha, nem veto", sem.momento === "" && sem.naoPode.length === 0);
  t("um tenente presente pelo nome traz a linha", !!oVilaoNaPauta(f, est, { cena: { presentes: ["Brás do Vau"] } }).momento);
  t("a etapa de uma quest com a mão dele traz a linha", !!oVilaoNaPauta(f, est, { cena: { mao: "pista" } }).momento);
  t("o covil (a cidade dele) traz a linha", !!oVilaoNaPauta(f, est, { cena: { cidade: "Porto Velho" } }).momento);
  t("o lugar de um passo traz a linha", !!oVilaoNaPauta(f, est, { cena: { lugar: "Vau", cidade: "Foz" } }).momento);
  const P1 = relogioDoPlano(f, { dia: 40 }).passos[0];
  t("um passo cumprido nesta cidade traz a obra dele", oVilaoNaPauta(f, est, { cena: { cidade: "Foz" } }).momento.includes(PLANOS_DO_ARQUETIPO.vendedor_de_medo[P1.n - 1].obra));
  const cedo = oVilaoNaPauta(f, { dia: 0 }, { cena: { mao: "tenente" } });
  t("antes de qualquer passo, o rumor é o presságio do que ele prepara", cedo.momento.includes(PLANOS_DO_ARQUETIPO.vendedor_de_medo[0].presagio));
  const queda = oVilaoNaPauta(f, est, { camada: "queda", cena: { mao: "confronto" } });
  t("na queda, sem a fraqueza na mão, só a luta — e a fraqueza não se diz", queda.momento.includes("só resta a luta") && !queda.momento.includes("livro de contas"));
  t("a linha é uma só (o canal por turno, nunca um bloco)", !oVilaoNaPauta(f, est, { camada: "guerra", cena: { mao: "rosto" } }).momento.includes("\n"));
}

sec("§8 O NOME DO HERÓI — vetado até ele o aprender");
{
  const f = F0;
  const vetoDoNome = (r) => r.naoPode.find((l) => l.includes("o meu nome"));
  const antes = oVilaoNaPauta(f, { dia: 5 }, { cena: { presentes: ["Brás do Vau"] } });
  t("no começo, o veto do nome está na naoPode", !!vetoDoNome(antes));
  t("e ensina como ele me chama: «o forasteiro de Foz»", vetoDoNome(antes).includes("«o forasteiro de Foz»"));
  t("antes do rosto, o veto não diz o nome dele", !vetoDoNome(antes).includes("Ilídia"));
  t("e há o veto de quem manda, com o servo em cena", antes.naoPode.some((l) => l.includes("quem manda")));
  const semCidade = oVilaoNaPauta(fichaDe(registo({ cidadeInicial: "" })), { dia: 5 }, { cena: { mao: "pista" } });
  t("sem cidade de origem, «o forasteiro»", vetoDoNome(semCidade).includes("«o forasteiro»"));
  t("no rosto, o veto da luta, com o nome dele", oVilaoNaPauta(f, { dia: 5 }, { camada: "rosto", cena: { mao: "rosto" } }).naoPode.some((l) => l.startsWith("abrir luta com Ilídia Selamar")));

  /* matar o servo não lhe ensina o nome; poupá-lo, sim */
  const mataBras = { dia: 6, factos: { v: 1, pessoas: { "npc|Brás do Vau": { nome: "Brás do Vau", visto, derrotado: { dia: 6, como: "morto" } } }, lugares: {} } };
  const r1 = reagirAoHeroi(f, mataBras);
  t("matar um servo: ele endurece, e sabe o que o herói fez — mas não o nome", r1.reacoes.map((r) => r.id).join() === "endurece" && !sabeONome(r1.registro, r1.saber));
  const poupaBras = { dia: 6, factos: { v: 1, pessoas: { "npc|Brás do Vau": { nome: "Brás do Vau", visto, derrotado: { dia: 6, como: "rendido" } } }, lugares: {} } };
  const r2 = reagirAoHeroi(f, poupaBras);
  t("poupar um servo: a balança, e o nome chega-lhe pela boca de quem foi poupado", r2.reacoes.map((r) => r.id).join() === "balanca" && sabeONome(r2.registro, r2.saber));
  t("a linha do livro dele tem fonte e certeza 3 (viu)", r2.saber.some((l) => l.sobre === "nome" && l.fonte === "viu"));
  t("e o registo guarda o dia em que o aprendeu", r2.registro.nomeDoHeroi.dia === 6 && r2.registro.balancas.includes("tenente_1"));
  const f2 = fichaDe(r2.registro);
  const depois = oVilaoNaPauta(f2, { ...poupaBras, saber: r2.saber }, { cena: { presentes: ["Brás do Vau"] } });
  t("depois de aprender, o veto do nome sai", !vetoDoNome(depois));
  /* o livro dele tem teto: doze linhas novas empurram a do nome para fora,
     e mesmo assim ele não esquece */
  const enche = Array.from({ length: TETO_DO_QUE_SABE + 2 }, (_, i) => ({ o: "coisa " + i, fonte: "boato", dia: 7 + i }));
  const cheio = [...r2.saber, ...enche];
  t("com o livro dele cheio, a linha do nome cai, e o registo segura-o", !sabeONome(null, cheio) && sabeONome(r2.registro, cheio));
  t("só uma linha sobre o nome no livro já chega", sabeONome(null, [{ o: "o nome", fonte: "boato", sobre: "nome" }]));
  t("null não sabe nada", sabeONome(null, null) === false);
}

sec("§9 AS REAÇÕES — uma vez cada");
{
  const f = F0;
  const P = PLANOS_DO_ARQUETIPO.vendedor_de_medo;
  const mataBras = { dia: 6, factos: { v: 1, pessoas: { "npc|Brás do Vau": { nome: "Brás do Vau", visto, derrotado: { dia: 6, como: "morto" } } }, lugares: {} } };
  const r1 = reagirAoHeroi(f, mataBras);
  t("endurecer põe uma guarda no passo que corre", r1.registro.guardas.length === 1);
  const r1b = reagirAoHeroi(fichaDe(r1.registro), { ...mataBras, saber: r1.saber });
  t("a mesma chamada de novo não reage outra vez", r1b.reacoes.length === 0 && J(r1b.registro) === J(r1.registro));
  const qs = [
    { id: "q1", mao: { tipo: "tenente", contra: [1] }, estado: "concluida", fechouEm: 2 },
    { id: "q2", mao: { tipo: "recurso", contra: [2] }, estado: "concluida", fechouEm: 8 },
    { id: "q3", mao: { tipo: "rosto", contra: [5] }, estado: "concluida", fechouEm: 9, escolhas: { oferta: { opcao: "aceitar" } } },
  ];
  const r2 = reagirAoHeroi(f, { dia: 10 }, { quests: qs });
  const ids = r2.reacoes.map((r) => r.id);
  t("travar um passo: ele desvia", ids.includes("desvia"));
  t("tirar-lhe um recurso: manda alguém olhar (a resposta de antagonista.js)", r2.reacoes.some((r) => r.id === "manda_olhar" && r.resposta === "manda_ver"));
  t("aceitar a oferta no rosto: cobra depois, e sabe tudo, o nome incluído", ids.includes("cobra_depois") && sabeONome(r2.registro, r2.saber));
  const ign = reagirAoHeroi(f, { dia: 10000 }, { quests: [{ id: "a", mao: { tipo: "tenente", contra: [1] }, estado: "oferecida" }, { id: "b", mao: { tipo: "pista", contra: [3] }, estado: "oferecida" }] });
  t("ignorar duas quests da mão dele: acelera (a leitura «ainda_nao»)", ign.reacoes.some((r) => r.id === "acelera" && r.leitura === "ainda_nao"));
  const virou = reagirAoHeroi(f, { dia: 5, npcs: { "Brás do Vau": { nome: "Brás do Vau", relacao: "aliado" } }, factos: { v: 1, pessoas: { "npc|Brás do Vau": { nome: "Brás do Vau", visto } }, lugares: {} } });
  t("virar um servo: ele apaga-o, e o dia fica para o recuo do relógio", virou.reacoes.map((r) => r.id).join() === "apaga" && virou.registro.reagiu.some((r) => r.chave === "virou|tenente_1" && r.dia === 5));
  t("a reação que o jogo não alimenta nunca acontece", ![r1, r2, ign, virou].some((x) => x.reacoes.some((r) => r.id === "mira_o_que_ama")));
  t("cada reação traz a voz dele para o Narrador", [...r1.reacoes, ...r2.reacoes].every((r) => r.faz && r.chave));
  t("nada muda sem facto", reagirAoHeroi(f, { dia: 3 }).reacoes.length === 0);
  void P;
}

sec("§10 OS DESFECHOS — cada um alcançável");
{
  const f = F0;
  const morte = (como) => ({ v: 1, pessoas: { "npc|Ilídia Selamar": { nome: "Ilídia Selamar", visto, falou: { de: 1, ate: 9, vezes: 2, turno: 9 }, derrotado: { dia: 9, como } } }, lugares: {} });
  const confronto = (escolhas) => ({ id: "c", mao: { tipo: "confronto", contra: [6] }, estado: "concluida", fechouEm: 9, ...(escolhas ? { escolhas } : {}) });
  t("nada decidido, nenhum desfecho", desfechoDoVilao(f, { dia: 9 }) === null);
  const der = desfechoDoVilao(f, { dia: 9, factos: morte("morto") }, { quests: [confronto()] });
  t("derrota: caiu e não ficou vivo — o plano morre com ele", der && der.id === "derrota" && der.depois === DESFECHOS_DO_VILAO[2].depois);
  const fug = desfechoDoVilao(f, { dia: 9, factos: morte("rendido") }, { quests: [confronto()] });
  t("fuga: poupado sem redenção — o capítulo seguinte herda-o", fug && fug.id === "fuga");
  const pacto = desfechoDoVilao(f, { dia: 9 }, { quests: [{ id: "r", mao: { tipo: "rosto", contra: [5] }, estado: "concluida", fechouEm: 7, escolhas: { oferta: { opcao: "aceitar" } } }, confronto({ fim: { opcao: "cumprir" } })] });
  t("pacto: aceitou no rosto e cumpriu no confronto", pacto && pacto.id === "pacto");
  const fp = fichaDe(registo({ fraqueza: { familia: "pessoa", id: "p_salvo_do_fogo" }, papeis: { fraqueza: { tipo: "pessoa", nome: "Teodora Lume" } } }));
  const comEla = { dia: 9, personagem: { grupo: [{ nome: "Teodora Lume" }] }, factos: morte("rendido") };
  const red = desfechoDoVilao(fp, comEla, { quests: [confronto({ fim: { opcao: "poupar" } })] });
  t("redenção: a fraqueza é uma pessoa, ela está ao lado, e o herói poupa", red && red.id === "redencao");
  t("sem ela ao lado, a mesma escolha é fuga", desfechoDoVilao(fp, { dia: 9, factos: morte("rendido") }, { quests: [confronto({ fim: { opcao: "poupar" } })] }).id === "fuga");
  t("com a fraqueza de outra família não há redenção", desfechoDoVilao(f, comEla, { quests: [confronto({ fim: { opcao: "poupar" } })] }).id === "fuga");
  const coisa = fichaDe(registo({ corpo: "coisa" }));
  t("a coisa antiga não morre assim: derrubada sem rito, foge", desfechoDoVilao(coisa, { dia: 9, factos: morte("morto") }, { quests: [confronto()] }).id === "fuga");
  t("com o rito (selar), é derrota", desfechoDoVilao(coisa, { dia: 9, factos: morte("morto") }, { quests: [confronto({ fim: { opcao: "selar" } })] }).id === "derrota");
  const conselho = desfechoDoVilao(fichaDe(registo({ corpo: "conselho" })), { dia: 9, factos: morte("morto") }, { quests: [confronto()] });
  t("o corpo que sobrevive continua, um passo atrás", conselho.id === "derrota" && conselho.depois.includes(DESFECHOS_DO_VILAO[2].seSobrevive));
  /* o relógio no fim muda o tom e não acaba a campanha: os desfechos
     continuam alcançáveis */
  const noFim = relogioDoPlano(f, { dia: 10000 });
  t("com o relógio no fim, a derrota continua alcançável", !!noFim.fim && desfechoDoVilao(f, { dia: 10000, factos: morte("morto") }, { quests: [confronto()] }).id === "derrota");
}

sec("§11 O DETERMINISMO, O NULL E A IMUTABILIDADE");
{
  const lixos = [null, undefined, {}, [], "x", 7, { registro: 1 }, { plano: [] }];
  let estourou = 0;
  for (const x of lixos) {
    try {
      relogioDoPlano(x, x, x); camadaDoVilao(x, x, x); reagirAoHeroi(x, x, x); temAFraqueza(x, x, x);
      desfechoDoVilao(x, x, x); oVilaoNaPauta(x, x, x); fichaDoVilao(x); garantirRegistroDoVilao(x); nascerOVilao(x); sabeONome(x, x);
    } catch { estourou++; }
  }
  t("nenhuma função estoura com null, vazio ou lixo", estourou === 0);
  t("o lixo dá o vazio", relogioDoPlano(null).passos.length === 0 && camadaDoVilao(null).id === "rumor" && fichaDoVilao(null) === null
    && oVilaoNaPauta(null).momento === "" && desfechoDoVilao(null) === null && reagirAoHeroi(null).reacoes.length === 0 && temAFraqueza(null) === false);
  t("a ficha com estado null não estoura e diz o rumor", camadaDoVilao(F0, null).id === "rumor" && relogioDoPlano(F0, null).atual === 1);
  /* tudo congelado: quem recebe nunca muta */
  const reg = congelar(registo());
  const f = congelar(fichaDe(reg));
  const est = congelar({ dia: 60, saber: [{ o: "x", fonte: "viu", dia: 0 }], factos: { v: 1, pessoas: { "npc|Brás do Vau": { nome: "Brás do Vau", visto, derrotado: { dia: 6, como: "rendido" } } }, lugares: {} } });
  const qs = congelar([{ id: "q", mao: { tipo: "tenente", contra: [1] }, estado: "concluida", fechouEm: 2 }]);
  let mutou = false;
  try {
    relogioDoPlano(f, est, { quests: qs }); camadaDoVilao(f, est, { quests: qs }); reagirAoHeroi(f, est, { quests: qs });
    oVilaoNaPauta(f, est, { quests: qs, cena: { mao: "tenente" } }); desfechoDoVilao(f, est, { quests: qs });
    garantirEspinha({ semente: "s", atos: [], fio: { ...FIO, vilao: reg } });
  } catch { mutou = true; }
  t("com tudo congelado, nada estoura (nada é mutado)", !mutou);
  const r = reagirAoHeroi(f, est, { quests: qs });
  t("a reação devolve um registo novo, e o de entrada fica como estava", r.registro !== reg && reg.reagiu.length === 0);
  const duas = [0, 1].map(() => J([relogioDoPlano(f, est, { quests: qs }), camadaDoVilao(f, est, { quests: qs }), reagirAoHeroi(f, est, { quests: qs }), oVilaoNaPauta(f, est, { cena: { mao: "tenente" } })]));
  t("as mesmas entradas, as mesmas saídas", duas[0] === duas[1]);
}

console.log(`\n${bons} ok, ${maus} falha(s)`);
if (maus) process.exit(1);
