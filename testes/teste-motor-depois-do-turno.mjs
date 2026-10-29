/* ============================================================
   OS ÓRGÃOS DO DEPOIS DA RESPOSTA, NO MOTOR (Fase 4, trilha A, 29/10/2026) — testes/teste-motor-depois-do-turno.mjs

   O que o turno do App fazia depois do aplicar e o servidor não tinha —
   órgãos com nome, funções do componente — ganhou peça em
   src/motor/depois-do-turno.js: `osOrgaosDoDepois(estado, portas)`, a
   fábrica que devolve os órgãos sobre um estado. Aqui ela é provada contra
   o recorte à letra do App (`depois-dourado.json`, de
   `gerar-depois-dourado.mjs`), lado a lado sobre os mesmos casos: os refs
   do fim, a ordem das portas (com a foto dos refs no instante de cada
   `pushMsgs` e de cada `salvar`) e o que cada órgão devolve.

   Os casos são os 275 do pedido (os estados gravados das sessões e os da
   prova) e os MONTADOS, cada um com o que faz o órgão andar — o diário com
   espaço, a cidade, o dia novo, o mural já com papel, a gente conhecida —,
   e os cartazes que o `pregarNoMural` recebe (o repetido, o da mesma
   pessoa, o que já está no diário, o de quem já trabalha comigo, o novo).
   E o conferente das missões (2.º órgão): as missões que o estado cumpre
   — a que conclui e paga, a que só avança, a que falha, a forçada que
   empurra o arco, a da casa (o dízimo, a prova), a de prazo (o relógio que
   morre com ela), a da lista antiga (a fé, o heroísmo), a grande que dá
   item (a sorte do turno) —, o marco da espinha que cai pela mesma porta, e
   as três portas do Cronista que ele traz (`conferirCom` com a conversa e
   o segredo, `ganharFe`, `marcarNoArco`).
   A prova tem de morder (cada mordida no recorte muda ao menos um caso), e
   o escopo do recorte acusa todo nome sem dublê. A suíte não lê o texto de
   src/motor/ (a catraca teste-assercoes-de-texto): a peça prova-se jogando.
   ============================================================ */
import fs from "node:fs";
import { casoDoPedido } from "./pedido-bloco.mjs";
import { N_CASOS, osModulos, osPadroes, sha } from "./pauta-bloco.mjs";
import { osOrgaosDoDepois, REFS_DO_DEPOIS, RENDER_DO_DEPOIS, ORGAOS_DO_DEPOIS, PORTAS_DO_DEPOIS } from "../src/motor/depois-do-turno.js";
import { semearACasa } from "../src/semente.js";
import { ofertasDaqui } from "../src/ofertas.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const copia = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));

const D = JSON.parse(fs.readFileSync(new URL("./depois-dourado.json", import.meta.url), "utf8"));
const MODS = await osModulos(D.imports);
const PADROES = osPadroes(D, MODS);
const CAMPOS = Object.values(D.refs).map((r) => r.campo).sort();

/* ---------------- os casos ---------------- */
const BASES = 194;
const comAbertura = { abertura: { legado: true } };
const aMissao = (j, extra = {}) => ({ id: "md" + j, titulo: "O serviço " + j, tipo: "favor", status: "ativa", dador: "Fulano " + j, etapas: [{ tipo: "ir", alvo: "a ponte", feito: false }], ...extra });
/* o dador que o mundo ofereceria aqui (o mesmo `ofertasDaqui` que o órgão lê): é por ele que se monta o mural ocupado e a gente conhecida */
const oDador = (e) => {
  try {
    const mu = e.mundo || {};
    const xs = ofertasDaqui({ semente: `${e.nomeCampanha || "aventura"}|${mu.genero || ""}`, mapa: e.mapa, cidade: e.cidadeAtual, base: e.baseMundo, genero: mu.genero, nivel: 1, quantas: 6, molde: undefined, lex: mu.lexico, evitar: [], historia: [] });
    return xs.length ? xs : [];
  } catch { return []; }
};
const MONTADOS = [
  /* a gente da história (o grupo): o dador que o mundo ofereceria anda comigo, e o órgão escolhe outro (MM18) */
  ...Array.from({ length: 6 }, (_, j) => ({ base: 3 + j * 7, o: "história", estado: (k) => { const xs = oDador(k.estado); const d = (xs[0] || {}).dador || "Ninguém"; return { ...comAbertura, combate: null, masmorra: null, missoes: [], ultimoTrabalhoDia: 0, personagem: { ...(k.estado.personagem || {}), grupo: [{ nome: d }] } }; } })),
  /* o diário com espaço, a cidade, o dia novo: o órgão prega */
  ...Array.from({ length: 24 }, (_, j) => ({ base: 3 + j * 7, o: "oferece", estado: () => ({ ...comAbertura, combate: null, masmorra: null, missoes: j % 3 ? [aMissao(j)] : [], ultimoTrabalhoDia: j % 4 ? 0 : -1 }) })),
  /* já se ofereceu hoje: o mesmo estado, com o dia do último trabalho = hoje */
  ...Array.from({ length: 6 }, (_, j) => ({ base: 3 + j * 7, o: "já hoje", estado: (k) => ({ ...comAbertura, combate: null, masmorra: null, missoes: [], ultimoTrabalhoDia: k.estado.dia || 1 }) })),
  /* a gente conhecida: o primeiro dador que ela reconhece vence */
  ...Array.from({ length: 8 }, (_, j) => ({ base: 5 + j * 11, o: "conhecido", estado: (k) => { const xs = oDador(k.estado); const d = (xs[1 + (j % Math.max(1, xs.length - 1))] || xs[0] || {}).dador || "Ninguém"; return { ...comAbertura, combate: null, masmorra: null, missoes: [], npcs: { ...(k.estado.npcs || {}), [j % 2 ? d.toUpperCase() : d]: { nome: d } } }; } })),
  /* o mural já tem o papel dessa pessoa: não prega duas vezes */
  ...Array.from({ length: 6 }, (_, j) => ({ base: 9 + j * 13, o: "mural ocupado", estado: (k) => { const xs = oDador(k.estado); const c = xs[0] || { titulo: "x", dador: "y" }; return { ...comAbertura, combate: null, masmorra: null, missoes: [], mural: j % 2 ? [{ ...c, oferecido: true, pregadoEm: 1 }] : [{ titulo: "Outro " + j, dador: c.dador, oferecido: true, pregadoEm: 1 }] }; } })),
  /* as portas que fecham: a luta, a masmorra, sem cidade, já ofereceu hoje, o diário cheio, o herói por orientar */
  ...[0, 1, 2, 3, 4, 5].map((j) => ({ base: 17 + j * 19, o: "fechado", estado: (k) => ({ ...comAbertura, missoes: j === 4 ? [aMissao(1), aMissao(2), aMissao(3, { status: "oferecida" })] : [],
    ...(j === 0 ? { combate: { inimigos: [{ nome: "Lobo", pv: 3 }] } } : { combate: null }), ...(j === 1 ? { masmorra: { nome: "A cripta" } } : { masmorra: null }),
    ...(j === 2 ? { cidadeAtual: "" } : {}), ...(j === 3 ? { ultimoTrabalhoDia: k.estado.dia || 1 } : {}), ...(j === 5 ? { abertura: { principalId: "p1", turnos: 0 }, missoes: [aMissao(0, { id: "p1", tipo: "principal" })] } : {}) }) })),
  /* o herói por orientar: a principal ativa sem o primeiro passo (MM13) — e o mesmo com o passo dado */
  ...[0, 1, 2, 3].map((j) => ({ base: 3 + j * 7, o: "orientar", estado: () => ({ abertura: { principalId: "p1", turnos: 0 }, combate: null, masmorra: null, ultimoTrabalhoDia: 0, missoes: [aMissao(0, { id: "p1", tipo: "principal", etapas: [{ tipo: "ir", alvo: "a ponte", feito: j % 2 === 1 }] })] }) })),
];
/* os cartazes que chegam ao pregarNoMural (o do Cronista e o do órgão) */
const CARTAZES = [
  () => null, () => ({ dador: "Sem Título" }),
  (k) => ({ ...((k.estado.mural || [])[0] || { titulo: "O poço", dador: "Ana" }) }),
  () => ({ titulo: "Achar o anel", dador: "Bento do Vau" }),
  () => ({ titulo: "Achar o anel", dador: "Bento do Vau", pregadoEm: 3 }),
  () => ({ titulo: "Outro pedido", dador: "Zulmira do Sino" }),
  () => ({ titulo: "O SERVIÇO 1", dador: "Quem quer que seja" }),
  () => ({ titulo: "Um novo pedido", dador: "Fulano 2" }),
  () => ({ titulo: "Mais um pedido", dador: "Fulano 1" }),
];
const MURAIS = [
  [], [{ titulo: "O poço", dador: "Ana", oferecido: true, pregadoEm: 1 }, { titulo: "Do mundo", dador: "Beto" }],
  [{ titulo: "Velho", dador: "Zulmira do Sino", oferecido: true, pregadoEm: 2 }],
  Array.from({ length: 6 }, (_, j) => ({ titulo: "Papel " + j, dador: "Pessoa " + j, oferecido: true, pregadoEm: j })),
];
const PREGAR = CARTAZES.flatMap((c, j) => MURAIS.map((m, x) => ({ base: 2 + j * 23 + x * 5, o: "pregar", cartaz: c, estado: () => ({ mural: copia(m), missoes: x % 2 ? [aMissao(1), aMissao(2, { status: "concluida" })] : [] }) })));

/* ---------------- as missões (o 2.º órgão) ---------------- */
const aqui = (k) => k.estado.cidadeAtual || "Rio Cinzento";
const ETAPA = {
  chegar: (k) => ({ tipo: "ir_a", alvo: aqui(k), feito: false }),
  longe: () => ({ tipo: "ir_a", alvo: "Uma Cidade Que Não Há", feito: false }),
  derrotar: () => ({ tipo: "derrotar", alvo: "Lobo Cinzento", quantos: 1, feito: false }),
  falar: (k) => ({ tipo: "falar_com", alvo: "Ana do Poço", onde: aqui(k), feito: false }),
  resgatar: () => ({ tipo: "resgatar", alvo: "Levi Grimshaw", feito: false }),
};
const umaMissao = (k, j, etapas, extra = {}) => ({ id: "mc" + j, titulo: "A tarefa " + j, tipo: "contrato", status: "ativa", dador: "Dador " + j, etapas: etapas.map((e) => e(k)), ...extra });
const A_CASA = (emProva) => ({ id: "g1", nome: "A Ordem do Vau", membro: true, emProva, cofre: 10, posto: 0, xp: 0 });
const MISSOES = [
  { o: "conclui e paga", m: (k, j) => [umaMissao(k, j, [ETAPA.chegar], { recompensa: { moedas: 20, xp: 50 } })] },
  { o: "conclui sem moedas", m: (k, j) => [umaMissao(k, j, [ETAPA.chegar], { recompensa: { moedas: 0, xp: 30 } })] },
  { o: "só avança", m: (k, j) => [umaMissao(k, j, [ETAPA.chegar, ETAPA.longe])] },
  { o: "a grande dá item", m: (k, j) => [umaMissao(k, j, [ETAPA.chegar], { tipo: "principal", recompensa: { moedas: 30, xp: 60, item: j % 2 ? "raro" : "incomum" } })], e: () => ({ derrotadosDaSessao: ["Lobo Cinzento"] }) },
  { o: "forçada empurra o arco", m: (k, j) => [umaMissao(k, j, [ETAPA.chegar], { tipo: "trama" })] },
  { o: "da casa (dízimo)", m: (k, j) => [umaMissao(k, j, [ETAPA.chegar], { guilda: "g1", contribui: 5, recompensa: { moedas: 40, xp: 20 } })], e: () => ({ guildas: [A_CASA(false)] }) },
  { o: "da casa (a prova)", m: (k, j) => [umaMissao(k, j, [ETAPA.chegar], { guilda: "g1", prova: true, contribui: 3, recompensa: { moedas: 10, xp: 20 } })], e: () => ({ guildas: [A_CASA(true)] }) },
  { o: "de prazo", m: (k, j) => [umaMissao(k, j, [ETAPA.chegar], { relogioId: "rel-mc" + j })], e: (k, j) => ({ relogios: [{ id: "rel-mc" + j, fonte: "missao:mc" + j, nome: "O prazo", tipo: "prazo", casas: 4, marcadas: 1 }, { id: "outro", fonte: "x", nome: "Outro", tipo: "ameaca", casas: 6, marcadas: 2 }] }) },
  { o: "da lista antiga", m: (k, j) => [umaMissao(k, j, [ETAPA.chegar], { veiculo: "tarefa_antiga", intencao: j % 2 ? "principal" : "favor", recompensa: { moedas: 5, xp: 10 } })], e: (k, j) => ({ divindade: j % 2 ? { despertar: true, nome: "Aurel", fieis: 3, pf: 1 } : null }) },
  { o: "derrota", m: (k, j) => [umaMissao(k, j, [ETAPA.derrotar])], e: () => ({ derrotadosDaSessao: ["o Lobo Cinzento"] }) },
  { o: "falha", m: (k, j) => [umaMissao(k, j, [ETAPA.resgatar])], e: (k) => ({ baseMundo: { ...(k.estado.baseMundo || {}), mortos: ["Levi Grimshaw"] } }) },
  { o: "o marco da espinha", m: () => [], e: (k, j) => ({ historia: { estrutura: "jornada", etapa: 0, marcos: j }, espinha: { atos: [{ ato: 0, marcos: [{ id: "mk" + j, titulo: "Chegar ao vau", feitio: j % 2 ? "procurar" : "chegar", onde: aqui(k), condicao: { tipo: "ir_a", alvo: aqui(k) }, feito: false }] }] } }) },
  { o: "nada a conferir", m: (k, j) => [umaMissao(k, j, [ETAPA.longe])] },
];
const CONFERIR = MISSOES.flatMap((x, j) => [0, 1, 2].map((v) => ({ base: 4 + j * 17 + v * 31, o: x.o, orgao: "conferirAsMissoes",
  estado: (k) => ({ combate: null, masmorra: null, cidadeAtual: aqui(k), missoes: x.m(k, j * 3 + v), ...(x.e ? x.e(k, j * 3 + v) : {}) }), args: (k, e) => [e.personagem || null] })));
/* as portas do Cronista que o conferente traz */
const COM = [null, { falouCom: ["Ana do Poço"] }, { falouCom: ["Outra Pessoa"] }, { segredos: ["o nome verdadeiro"] }].flatMap((o, j) => [0, 1].map((v) => ({ base: 6 + j * 29 + v * 13, o: "conferirCom", orgao: "conferirCom",
  estado: (k) => ({ combate: null, masmorra: null, cidadeAtual: aqui(k), missoes: [umaMissao(k, j, [ETAPA.falar], { recompensa: { moedas: 7, xp: 7 } })] }), args: (k, e) => [e.personagem || null, o] })));
const FE = [[3, 1, "o feito corre"], [0, 2, "a prece"], [12, 0, "a cidade inteira"]].flatMap((a, j) => [null, { despertar: true, nome: "Aurel", fieis: 2, pf: 0 }, { despertar: false }].map((dv, v) => ({ base: 8 + j * 23 + v * 7, o: "ganharFe", orgao: "ganharFe",
  estado: () => ({ divindade: dv }), args: () => a })));
const ARCO = ["missao", "missao_forcada", "nada", "vilao"].flatMap((tipo, j) => [0, 3, 7, 12].map((m, v) => ({ base: 10 + j * 19 + v * 11, o: "marcarNoArco", orgao: "marcarNoArco",
  estado: () => ({ historia: { estrutura: "jornada", etapa: v % 3, marcos: m } }), args: () => [tipo, "concluí algo " + j] })));
const OUTROS = [...CONFERIR, ...COM, ...FE, ...ARCO];

const N_MONTADOS = MONTADOS.length;
function oCaso(i) {
  if (i < N_CASOS) return { ...casoDoPedido(i), i, orgao: "oferecerTrabalhoDaqui", args: [] };
  if (i < N_CASOS + N_MONTADOS) { const m = MONTADOS[i - N_CASOS]; const k = casoDoPedido(m.base % BASES); return { ...k, i, montado: m.o, orgao: "oferecerTrabalhoDaqui", args: [], estado: { ...k.estado, ...m.estado(k) } }; }
  if (i < N_CASOS + N_MONTADOS + PREGAR.length) {
    const m = PREGAR[i - N_CASOS - N_MONTADOS]; const k = casoDoPedido(m.base % BASES); const estado = { ...k.estado, ...m.estado(k) };
    return { ...k, i, montado: m.o, orgao: "pregarNoMural", args: [m.cartaz({ ...k, estado })], estado };
  }
  const m = OUTROS[i - N_CASOS - N_MONTADOS - PREGAR.length]; const k = casoDoPedido(m.base % BASES); const estado = { ...k.estado, ...m.estado(k) };
  return { ...k, i, montado: m.o, orgao: m.orgao, args: m.args(k, estado), estado };
}
const N_TODOS = N_CASOS + N_MONTADOS + PREGAR.length + OUTROS.length;
const CASOS = Array.from({ length: N_TODOS }, (_, i) => oCaso(i));

/* ---------------- os dois lados ---------------- */
const fotoDosRefs = (valores) => sha(Object.fromEntries(CAMPOS.map((c) => [c, valores[c]])));
const partidaDe = (k) => Object.fromEntries(Object.entries(D.refs).map(([ref, info]) => [info.campo, k.estado[info.campo] !== undefined ? copia(k.estado[info.campo]) : PADROES[ref]()]));

export function compilarORecorte(trocas = []) {
  const ordem = ["modulo", "componente", "render"];
  let corpo = ordem.flatMap((de) => D.recortes.filter((r) => r.de === de).map((r) => r.texto)).join("\n") + "\nconst $conferirCom = " + D.conferirCom + ";";
  for (const [de, para] of trocas) {
    const n = corpo.split(de).length - 1;
    if (n !== 1) throw new Error(`a mordida bate ${n} vezes: ${de.slice(0, 70)}`);
    corpo = corpo.replace(de, para);
  }
  return new Function("S", `with (S) {\n${corpo}\nreturn { ${D.raizes.join(", ")}, conferirCom: $conferirCom };\n}`);
}
/* `naPorta`: { porta, campo, valor } — a porta do App que, além do que
   faz, escreve um campo (um setter que embrulhe, o salvar que poda e
   avisa). Hoje nenhuma das do App o faz (os 18 setters são os do useState);
   o caso existe para provar que a peça, com a releitura, segue o App se
   alguma vier a fazê-lo. */
const refDoCampo = (c) => Object.entries(D.refs).find(([, i]) => i.campo === c)[0];
function correrORecorte(fabrica, k, { naPorta = null } = {}) {
  const log = { portas: [], faltas: [] };
  const S = { ...MODS };
  for (const [ref, info] of Object.entries(D.refs)) S[ref] = { current: k.estado[info.campo] !== undefined ? copia(k.estado[info.campo]) : PADROES[ref]() };
  const valores = () => Object.fromEntries(Object.entries(D.refs).map(([ref, info]) => [info.campo, S[ref].current]));
  for (const n of D.render) S[n] = copia(k.render && k.render[n] !== undefined ? k.render[n] : k.estado[n] !== undefined ? k.estado[n] : new Function("M", `with (M) { return (${D.renderPadrao[n]}); }`)(S));
  for (const n of D.setters) S[n] = (v) => { log.portas.push([n, sha(typeof v === "function" ? "∅função" : v)]); if (naPorta && naPorta.porta === n) S[refDoCampo(naPorta.campo)].current = naPorta.valor; };
  S.calou = (onde) => { log.portas.push(["calou", onde]); return []; };
  /* como o do App: junta as novas às mensagens do ref */
  S.pushMsgs = (novas) => { log.portas.push(["pushMsgs", sha(novas), fotoDosRefs(valores())]); S.mensagensRef.current = [...(S.mensagensRef.current || []), ...novas]; };
  S.salvar = (extra) => { log.portas.push(["salvar", sha(extra === undefined ? {} : extra), fotoDosRefs(valores())]); };
  const escopo = new Proxy(S, {
    has: (alvo, nome) => { if (typeof nome !== "string") return false; if (nome in alvo) return true; if (nome in globalThis) return false; log.faltas.push(nome); return true; },
    get: (alvo, nome) => { if (nome === Symbol.unscopables) return undefined; if (nome in alvo) return alvo[nome]; throw new ReferenceError("falta o dublê: " + String(nome)); },
    set: (alvo, nome, v) => { alvo[nome] = v; return true; },
  });
  semearACasa("depois|" + k.i);
  let ret, erro = null;
  try { ret = fabrica(escopo)[k.orgao](...copia(k.args)); } catch (x) { erro = String(x && x.message); }
  return { ret, erro, valores: valores(), log };
}
function correrAPeca(k, { portasExtra = {}, naPorta = null, semReler = false } = {}) {
  const log = { portas: [], faltas: [], aplicar: 0 };
  let loja = partidaDe(k);
  const portas = {
    calou: (onde) => { log.portas.push(["calou", onde]); },
    /* como o do App: junta as novas e devolve a lista */
    pushMsgs: (novas) => { log.portas.push(["pushMsgs", sha(novas), fotoDosRefs(loja)]); loja = { ...loja, mensagens: [...(loja.mensagens || []), ...novas] }; return loja.mensagens; },
    /* como o do App: os refs de agora */
    ...(semReler ? {} : { reler: () => loja }),
    salvar: (extra) => { log.portas.push(["salvar", sha(extra === undefined ? {} : extra), fotoDosRefs(loja)]); },
    aplicar: (x) => { log.aplicar++; loja = { ...loja, ...x }; },
  };
  for (const n of D.setters) portas[n] = (v) => { log.portas.push([n, sha(typeof v === "function" ? "∅função" : v)]); if (naPorta && naPorta.porta === n) loja = { ...loja, [naPorta.campo]: naPorta.valor }; };
  const estado = { ...copia(k.estado), render: copia(k.render) };
  /* como o App (osOrgaosAgora): cada campo do estado que entra é o objeto
     que está no ref, o mesmo que a releitura devolve */
  for (const c of CAMPOS) estado[c] = loja[c];
  const antes = JSON.stringify(estado);
  semearACasa("depois|" + k.i);
  let ret, erro = null, o = null;
  try { o = osOrgaosDoDepois(estado, { ...portas, ...portasExtra }); ret = o[k.orgao](...copia(k.args)); } catch (x) { erro = String(x && x.message); }
  return { ret, erro, valores: loja, log, intacto: JSON.stringify(estado) === antes, escritas: o ? o.escritas : null, relidos: o ? o.relidos : null };
}
const foto = (f) => ({ ret: sha(f.ret === undefined ? "∅undefined" : f.ret), erro: f.erro, refs: fotoDosRefs(f.valores), portas: sha(f.log.portas), faltas: f.log.faltas });
const mesma = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const FABRICA = compilarORecorte();
const LADO = CASOS.map((k) => ({ k, r: correrORecorte(FABRICA, k), p: correrAPeca(k) }));

sec("1. O dourado: o recorte à letra, e as tabelas da peça são as dele");
t(`o recorte é de um commit (${D.commit}), com as raízes ${D.raizes.join(", ")}`, /^[0-9a-f]{7,}$/.test(D.commit) && D.raizes.length === 5);
t(`os órgãos da fábrica são as raízes e a porta do Cronista (conferirCom)`, mesma([...ORGAOS_DO_DEPOIS], [...D.raizes, "conferirCom"]) && typeof D.conferirCom === "string" && D.conferirCom.includes("conferirAsMissoes(pc)"));
t(`os ${Object.keys(D.refs).length} refs da tabela são os do recorte (o campo, o ref, se escreve, se é salvo)`,
  mesma(Object.keys(REFS_DO_DEPOIS).sort(), CAMPOS) && Object.entries(D.refs).every(([ref, i]) => REFS_DO_DEPOIS[i.campo].ref === ref && REFS_DO_DEPOIS[i.campo].escreve === i.escreve && REFS_DO_DEPOIS[i.campo].salvo === i.salvo));
t(`o valor de partida de cada ref é o do App`, Object.entries(D.refs).every(([ref, i]) => JSON.stringify(REFS_DO_DEPOIS[i.campo].padrao()) === JSON.stringify(PADROES[ref]())));
t(`o render que ela lê é o do recorte (${D.render.join(", ")})`, mesma([...RENDER_DO_DEPOIS], D.render));
t(`as portas são as do recorte (os ${D.setters.length} setters, a tela, o disco, o aplicar, a sorte)`, D.setters.every((n) => PORTAS_DO_DEPOIS.includes(n)) && ["aplicar", "calou", "pushMsgs", "salvar", "sorte"].every((n) => PORTAS_DO_DEPOIS.includes(n)));

sec(`2. Os ${N_TODOS} casos: ${N_CASOS} gravados, ${N_MONTADOS} montados, ${PREGAR.length} cartazes, ${OUTROS.length} das missões e das portas do Cronista`);
const faltasR = [...new Set(LADO.flatMap((x) => x.r.log.faltas))];
t(`o recorte não lê nome sem dublê (faltas: ${faltasR.join(", ") || "nenhuma"})`, faltasR.length === 0);
t(`nenhum caso estoura no recorte`, LADO.every((x) => !x.r.erro), LADO.filter((x) => x.r.erro).slice(0, 2).map((x) => x.k.i + ": " + x.r.erro).join(" | "));
const prega = LADO.filter((x) => x.k.orgao === "oferecerTrabalhoDaqui" && x.r.log.portas.some((p) => p[0] === "setMural"));
t(`o órgão prega em ${prega.length} casos (≥ 20), ${prega.filter((x) => x.k.i < N_CASOS).length} deles gravados`, prega.length >= 20);
const pregou = LADO.filter((x) => x.k.orgao === "pregarNoMural");
t(`o cartaz: ${pregou.filter((x) => x.r.ret === true).length} pregados e ${pregou.filter((x) => x.r.ret === false).length} recusados`, pregou.some((x) => x.r.ret === true) && pregou.filter((x) => x.r.ret === false).length >= 8);
const cobre = (o, cond) => LADO.filter((x) => x.k.montado === o && cond(x));
const doConf = (x) => x.r.log.portas.map((p) => p[0]);
t(`as missões: conclui e paga (${cobre("conclui e paga", (x) => doConf(x).includes("setPersonagem")).length}), só avança (${cobre("só avança", (x) => doConf(x).includes("setMissoes") && !doConf(x).includes("setPersonagem")).length}), a grande dá item (${cobre("a grande dá item", (x) => (((x.r.ret || {}).equipamento) || []).length > ((x.k.estado.personagem || {}).equipamento || []).length).length}), falha (${cobre("falha", (x) => doConf(x).includes("salvar")).length}), o marco (${cobre("o marco da espinha", (x) => doConf(x).includes("salvar")).length}), o prazo (${cobre("de prazo", (x) => doConf(x).includes("setRelogios")).length}), a casa (${cobre("da casa (a prova)", (x) => doConf(x).includes("setGuildasMundo")).length})`,
  [cobre("conclui e paga", (x) => doConf(x).includes("setPersonagem")), cobre("só avança", (x) => doConf(x).includes("setMissoes") && !doConf(x).includes("setPersonagem")), cobre("a grande dá item", (x) => (((x.r.ret || {}).equipamento) || []).length > ((x.k.estado.personagem || {}).equipamento || []).length), cobre("falha", (x) => doConf(x).includes("salvar")), cobre("o marco da espinha", (x) => doConf(x).includes("salvar")), cobre("de prazo", (x) => doConf(x).includes("setRelogios")), cobre("da casa (a prova)", (x) => doConf(x).includes("setGuildasMundo"))].every((xs) => xs.length > 0));
t(`a conversa do turno fecha a missão de falar só com quem se falou (o conferirCom), e a porta limpa a conversa`,
  LADO.some((x) => x.k.orgao === "conferirCom" && doConf(x).includes("setMissoes")) && LADO.some((x) => x.k.orgao === "conferirCom" && !doConf(x).includes("setMissoes")) && LADO.filter((x) => x.k.orgao === "conferirCom").every((x) => mesma(x.r.valores.falouCom, []) && mesma(x.r.valores.segredosRevelados, [])));
t(`o arco vira em ao menos um caso (marcarNoArco), e a fé conta em ao menos um (ganharFe)`,
  LADO.some((x) => x.k.orgao === "marcarNoArco" && !mesma(x.r.valores.historia, x.k.estado.historia)) && LADO.some((x) => x.k.orgao === "ganharFe" && (x.r.ret || []).length > 0));
t(`a gente conhecida muda quem prega em ao menos um caso`, LADO.some((x) => x.k.montado === "conhecido" && x.r.valores.trabalhoPendente && x.r.valores.trabalhoPendente.length));

sec("3. A peça é o recorte, caso a caso");
const dif = LADO.filter((x) => !mesma(foto(x.r), foto(x.p)));
t(`os ${N_TODOS} casos dão a mesma foto (os refs do fim, as portas na ordem com a foto de cada uma, o que o órgão devolve)`, dif.length === 0, dif.slice(0, 3).map((x) => `${x.k.i} (${x.k.montado || "gravado"}): ${JSON.stringify(foto(x.r))} ≠ ${JSON.stringify(foto(x.p))}`).join(" | "));
t(`o estado que entra não muda em nenhum caso`, LADO.every((x) => x.p.intacto));
t(`o que a peça escreveu chega pelo aplicar (e fica em escritas) nos ${prega.length} casos em que pregou`, prega.every((x) => x.p.log.aplicar > 0 && x.p.escritas && "mural" in x.p.escritas));
t(`sem aplicar, a peça corre igual e guarda o que escreveu em escritas`, (() => {
  const x = prega[0]; if (!x) return false;
  const o = osOrgaosDoDepois({ ...copia(x.k.estado), render: copia(x.k.render) }, {});
  semearACasa("depois|" + x.k.i); o.oferecerTrabalhoDaqui();
  return mesma(o.escritas.mural, x.r.valores.mural) && o.escritas.ultimoTrabalhoDia === x.r.valores.ultimoTrabalhoDia;
})());
const relidosEm = LADO.filter((x) => x.p.relidos && Object.keys(x.p.relidos).length);
t(`as portas que imitam as do App não escrevem campo: a releitura depois de cada porta não acha nada em nenhum dos ${N_TODOS} casos`, relidosEm.length === 0, relidosEm.slice(0, 2).map((x) => x.k.i + ": " + Object.keys(x.p.relidos).join(",")).join(" | "));
/* A RELEITURA MORDE: a falha descrita chama setMissoes e depois escreve a
   nota por cima da que lê. Uma porta que, no App, escrevesse a nota faria a
   peça sem releitura juntar o recado à nota velha, e perder o que a porta
   escreveu. Com a releitura, é o recorte. */
const casosDaFalha = LADO.filter((x) => x.k.montado === "falha");
const naPorta = { porta: "setMissoes", campo: "nota", valor: "a porta escreveu" };
const comPorta = casosDaFalha.map((x) => ({ r: correrORecorte(FABRICA, x.k, { naPorta }), p: correrAPeca(x.k, { naPorta }), s: correrAPeca(x.k, { naPorta, semReler: true }) }));
t(`a porta que escreve um campo no App: com a releitura a peça é o recorte (${comPorta.length} casos da falha, a nota da porta fica e leva o recado)`,
  comPorta.length > 0 && comPorta.every((y) => mesma(foto(y.r), foto(y.p)) && String(y.r.valores.nota).startsWith("a porta escreveu" + String.fromCharCode(10)) && y.p.relidos && "nota" in y.p.relidos));
t(`e sem a releitura a peça leria a cópia velha: a nota da porta perde-se nos ${comPorta.filter((y) => !mesma(foto(y.r), foto(y.s))).length} casos (a mordida)`,
  comPorta.length > 0 && comPorta.every((y) => !mesma(foto(y.r), foto(y.s)) && !String(y.s.valores.nota).includes("a porta escreveu")));
t(`um estado nulo não derruba a fábrica`, (() => { try { const o = osOrgaosDoDepois(null, null); o.oferecerTrabalhoDaqui(); return o.pregarNoMural(null) === false; } catch { return false; } })());

sec("4. A prova morde: cada troca no recorte muda ao menos um caso");
const MORDIDAS = [
  ["o herói por orientar (MM13)", "if (!muralLiberado({ abertura: aberturaMundoRef.current, missoes: missoesRef.current })) return;\n    if (combateRef.current", "if (combateRef.current"],
  ["a gente da história fica fora (MM18)", "evitar: abertas.flatMap((q) => [q.titulo, q.dador]),\n      historia: historiaDoMural(),", "evitar: abertas.flatMap((q) => [q.titulo, q.dador]),"],
  ["o teto do diário", "if (abertas.length >= 3) return;", "if (abertas.length >= 4) return;"],
  ["um por dia", "if (ultimoTrabalhoDiaRef.current >= diaRef.current) return;", "if (ultimoTrabalhoDiaRef.current > diaRef.current) return;"],
  ["a gente conhecida", "candidatas.find((c) => conhecidos.has(String(c.dador).toLowerCase())) || candidatas[0]", "candidatas[0]"],
  ["o teto dos oferecidos", "const TETO_OFERECIDOS = 6;", "const TETO_OFERECIDOS = 5;"],
  ["o que já está no diário", "if (jaNoDiario) return false;", ""],
  ["quem já trabalha comigo", "if (comigo) return false;", ""],
  ["uma pessoa, um trabalho", "if (cartaz.dador && atual.some((c) => c.oferecido && semNome(c.dador || \"\") === semNome(cartaz.dador))) return false;", ""],
  ["a data do papel", "cartaz.pregadoEm != null ? cartaz.pregadoEm : diaRef.current", "diaRef.current"],
  ["a espinha pela mesma porta", "if (ce.cumpridos.length) {", "if (false) {"],
  ["a falha descrita", "if ((r.falhadas || []).length) {", "if (false) {"],
  ["o envelope do avanço", "if (a.missao.status !== \"concluida\") {", "if (false) {"],
  ["a paga da missão", "moedas: (pers.moedas || 0) + rec.moedas,", "moedas: (pers.moedas || 0),"],
  ["o item da grande", "if (rec.item) {", "if (false) {"],
  ["o dízimo", "if (d > 0) {", "if (false) {"],
  ["a prova da casa", "const virou = !!(casa.emProva && m.prova);", "const virou = false;"],
  ["o arco que a forçada empurra", "tipoMissao(m.tipo).forcada ? \"missao_forcada\" : \"missao\"", "\"missao\""],
  ["o relógio que morre com a missão", "if (m.relogioId) {", "if (false) {"],
  ["a paga da lista antiga", "if (pf.heroismo) {", "if (false) {"],
  ["a conversa limpa", "try { return conferirAsMissoes(pc) || pc; } finally { ref.current = []; }", "return conferirAsMissoes(pc) || pc;"],
  ["o recado ao Mestre", "notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}${envelopeDoRecado(of)}`;", ""],
];
for (const [nome, de, para] of MORDIDAS) {
  let fab = null, erro = "";
  try { fab = compilarORecorte([[de, para]]); } catch (e) { erro = e.message; }
  const n = fab ? LADO.filter((x) => !mesma(foto(correrORecorte(fab, x.k)), foto(x.p))).length : 0;
  t(`${nome}: ${n} casos mudam`, n > 0, erro);
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
