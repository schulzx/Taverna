/* cronista-bloco.mjs (Fase T1-A, 9.ª fatia, 28/10/2026) — o Cronista do turno, corrido em Node

   Não é suíte: é a ferramenta que as duas pontas da prova usam.

   - `gerar-cronista-dourado.mjs` recorta do App de ANTES (760fe1b, o último
     em que o `cronistaDoTurno` morava inteiro no App) a função toda, à
     letra, e corre-a sobre os casos.
   - `teste-motor-cronista-do-turno.mjs` recorta do App de HOJE a fiação que
     ficou (o estado lido, os efeitos aplicados, as portas e o
     `cronistaDoTurno` que chama o motor) e corre-a, com as peças puras de
     src/motor/cronista-do-turno.js, sobre os mesmos casos.

   As duas pontas leem e escrevem os MESMOS dublês: refs como objetos
   simples, os módulos de verdade, a chamada de rede como um dublê que
   devolve a proposta do caso (ou estoura, ou devolve lixo), e os órgãos do
   App que não são deste bloco (a régua do lugar, o mural, a fé, o arco, a
   conferência das missões, a ficha do companheiro) como dublês declarados
   que tocam nos refs e na nota — para que uma porta chamada fora de ordem,
   ou um estado lido antes da hora, mude a foto.

   E um nome que o bloco leia e nenhum dublê dê não cai em silêncio no
   `catch` de uma secção: fica em `faltas`, e a suíte exige-o vazio. */
import { createHash } from "node:crypto";
import * as gatilho from "../src/gatilho-do-cronista.js";
import * as prometido from "../src/prometido.js";
import * as missoes from "../src/missoes.js";
import * as prompt from "../src/prompt.js";
import * as json from "../src/json.js";
import * as motorCronista from "../src/motor/cronista.js";
import * as abertura from "../src/abertura.js";
import * as ofertas from "../src/ofertas.js";
import * as npcs from "../src/npcs.js";
import * as subtramas from "../src/subtramas.js";
import * as relogios from "../src/relogios.js";
import * as saga from "../src/saga.js";
import * as segredo from "../src/segredo-guardado.js";
import * as meio from "../src/motor/meio-do-turno.js";
import * as constantes from "../src/constantes.js";
import * as dificuldade from "../src/dificuldade.js";
import * as poder from "../src/poder.js";
import * as regras from "../src/regras-jogo.js";
import * as bestiario from "../src/bestiario.js";
import * as motorAplicar from "../src/motor/aplicar.js";
import * as motorCrTurno from "../src/motor/cronista-do-turno.js";
import { semearACasa } from "../src/semente.js";

const NOMES = {
  gatilho: ["decidirOCronista", "blocoDaFila", "pularALeitura", "lerALeitura"],
  prometido: ["SECAO_DO_CRONISTA", "abertasParaOCronista", "pagarSementes", "guardarSementes"],
  missoes: ["garantirMissoes"],
  prompt: ["formatarCanone"],
  json: ["parseObjetoTolerante"],
  motorCronista: ["julgarOCronista"],
  abertura: ["muralLiberado"],
  ofertas: ["cartazDaProposta", "envelopeDoRecado"],
  npcs: ["nomeComDono", "fichaDoCronista", "mesclarNPC", "criarNPC", "notaDoHomonimo", "resumoNPCsParaPrompt"],
  subtramas: ["favorJaPedido"],
  relogios: ["aceitarProposta", "tipoDe", "barraDe", "envelopeNovo"],
  saga: ["segredosReveladosNoTurno"],
  segredo: ["peneirarCanone"],
  meio: ["frasesDoGrupoCheio"],
  constantes: ["MAX_COMPANHEIROS", "ATRIBUTOS"],
  dificuldade: ["pesarCompanheiro"],
  poder: ["formatarPoder"],
  regras: ["atributoEfetivo"],
  bestiario: ["dificuldadePorPerfil"],
  motorAplicar: ["notaComOTurno"],
  motorCrTurno: ["oGatilhoDoCronista", "oPedidoAoCronista", "oAceitoDoCronista"],
};
const MODULOS = { gatilho, prometido, missoes, prompt, json, motorCronista, abertura, ofertas, npcs, subtramas, relogios, saga, segredo, meio, constantes, dificuldade, poder, regras, bestiario, motorAplicar, motorCrTurno };
function osModulos({ novo }) {
  const o = {};
  for (const [mod, lista] of Object.entries(NOMES)) {
    if (!novo && mod === "motorCrTurno") continue;
    for (const n of lista) {
      if (!(n in MODULOS[mod])) throw new Error(`${mod} não exporta ${n}`);
      o[n] = MODULOS[mod][n];
    }
  }
  return o;
}

/* ---------------- O RECORTE ---------------- */
const corteDe = (app) => (de, ate) => {
  const i0 = app.indexOf(de);
  if (i0 < 0) throw new Error("não está onde estava: " + de.slice(0, 70));
  if (app.indexOf(de, i0 + 1) >= 0) throw new Error("ambíguo: " + de.slice(0, 70));
  const i1 = app.indexOf(ate, i0 + de.length);
  if (i1 < 0) throw new Error("o fim não está onde estava: " + ate.slice(0, 70));
  return app.slice(i0, i1);
};
const FIM = "  /* A TABELA DE FÉ (v7.5) mudou-se";
export const recorteDeAntes = (app) => corteDe(app)("  const cronistaDoTurno = async (pers, narrativa, doTurno) => {", FIM);
export const recorteDeHoje = (app) => corteDe(app)("  /* (T1-A, 9.ª fatia, 28/10) O CRONISTA, NO MOTOR.", FIM);

/* um recorte vira uma função async (S, args) → o que o cronistaDoTurno devolveu */
export function blocoComoFuncao(bloco) {
  const corpo = `with (S) { return async function (ARGS) {\n${bloco}\nreturn await cronistaDoTurno(ARGS.pers, ARGS.narrativa, ARGS.doTurno);\n}; }`;
  return (S) => new Function("S", corpo)(S);
}

/* ---------------- OS CASOS ----------------
   A narração curta (não lê), a que lê e a que fica na fila (o gatilho
   apagado), a rede que estoura e a que devolve lixo; e a proposta com cada
   secção acesa e apagada: o lugar novo, a cidade, outra cidade do mapa; o
   cartaz com e sem etapa, com o dador do núcleo e com o homónimo; o
   relógio novo e o repetido; o evento global no fim e cedo; a gente nova,
   a que já está, o herói; a conversa que fecha etapa; a fé do gesto e a do
   acontecimento, com e sem deus; a morte narrada de quem está de pé; o
   cânone novo e o que só preenche; o grupo com vaga e cheio; o teste com a
   rolagem livre e ocupada, em luta e fora dela; as promessas e as pagas. */
const HEROI = "Vera Sal";
const MAPA = { cidades: [{ nome: "Ponte do Martelo", populacao: 4000 }, { nome: "Agulha de Sal", populacao: 1200 }] };
const NARR = [
  "Você entra na estalagem e Doran o Manco ergue a caneca. — Sou Wystan Pedra, ferreiro desta rua — diz o homem ao lado. A Lâmina de Orvalho brilha na parede, e ele jura que volta por ti.",
  "O Lobo Grande uiva e tomba, mas ainda respira. Ilka sorri: — Vou com você até o fim. O ritual começou na colina, e o sino da torre bate três vezes sobre Ponte do Martelo.",
  "Na praça, a senhora Hilda diz que tem um serviço para quem souber lutar: paga-se 15 moedas por cada lobo. Você desce ao porão com Sava e encontra a Coroa Partida debaixo das tábuas.",
  "A Guarnição dos Andarilhos guarda um segredo, e Doran o Manco conta-o baixinho: o forte foi erguido sobre a cripta. — Eu juro que volto antes do inverno — diz ele, e Brannoc da Foz escuta.",
  "Você caminha pelas ruas de Ponte do Martelo, vê o rio correr sob a ponte e as gaivotas brigarem pelo peixe. Nada mais acontece nesta tarde morna, e a cidade segue o seu ritmo.",
];
const PESSOAS = [
  [],
  [{ nome: "Wystan Pedra", papel: "ferreiro", relacao: "neutro", genero: "ele", local: "cidade", notas: "forja na rua" }],
  [{ nome: "Doran o Manco", papel: "recruta velho", genero: "", local: "", notas: "conta segredos" }, { nome: HEROI, papel: "heroína" }],
  [{ nome: "Hilda", papel: "taverneira", genero: "ela", local: "Ponte do Martelo" }, { nome: "" }, { nome: "Brannoc da Foz", papel: "pescador", genero: "masculino" }],
  [{ nome: "Ilka", papel: "batedora", genero: "ela" }, { nome: "Sava", papel: "ladra" }, { nome: "Joana Rasa", papel: "capitã" }, { nome: "Teo", papel: "menino" }, { nome: "Quinto", papel: "a mais" }],
  null,
];
const ENTRARAM = [[], ["Ilka"], ["Doran o Manco", "Sava"], [HEROI], ["Desconhecido Total"], ["Ilka", "Sava", "Doran o Manco"]];
const TESTES = ["Presença", "Força", "Intelecto", "Nada"];
function propostaDoCaso(i) {
  return {
    lugar: [null, "a fazenda de Jessa", "cidade", "Agulha de Sal", "a estalagem em Agulha de Sal", "", 42, "o moinho velho"][i % 8],
    ...(i % 3 === 0 ? { missoes: { global_encerrado: true } } : i % 3 === 1 ? { missoes: { global_encerrado: false } } : {}),
    ...(i % 4 === 0 ? { canone: { "Lâmina de Orvalho": { tipo: "artefato", descricao: "uma lâmina fina", local: "" }, "Coroa Partida": { tipo: "artefato", descricao: "", detalhes: "de ouro velho" } } }
      : i % 4 === 1 ? { canone: { "coroa partida": { detalhes: "de prata", local: "a cripta" }, "Vazio": null } } : {}),
    pessoas: PESSOAS[i % PESSOAS.length],
    falou_com: i % 5 === 1 ? ["Doran o Manco"] : i % 5 === 2 ? ["Ilka", " "] : [],
    fe: i % 6 === 0 ? { fieis: 30, pf: 2, local: "Ponte do Martelo", motivo: "um gesto de bondade" }
      : i % 6 === 3 ? { fieis: 0, pf: 0, acontecimento: { tipo: "milagre_publico", local: "Agulha de Sal" } }
      : i % 6 === 2 ? { acontecimento: { tipo: "inventado" } } : { fieis: 0, pf: 0 },
    grupo: { entraram: ENTRARAM[i % ENTRARAM.length] },
    teste_sugerido: i % 4 === 2 ? { atributo: TESTES[(i >> 2) % 4], perfil: i % 8 < 4 ? "formidavel" : "dificil", motivo: "o rei cede o trono de graça" } : null,
    combate: { mortes_narradas: i % 3 ? ["Lobo Grande"] : [] },
    missao_oferecida: i % 3 === 2 ? { titulo: "Os lobos da colina", tipo: "contrato", dador: ["Hilda", "Doran o Manco", "Joana Rasa", "Delfina"][(i >> 1) % 4], descricao: "matar os lobos", paga: [15, 0, null][i % 3 === 2 ? (i >> 2) % 3 : 0], prazo: 0, etapas: [{ tipo: "derrotar", alvo: "Lobo Grande", quantos: 3 }] }
      : i % 11 === 4 ? { titulo: "ganhar a confiança", etapas: [] } : null,
    relogio_novo: i % 4 === 1 ? { nome: "O ritual da colina", tipo: "ameaca", segmentos: 6, gatilho: "noite", consequencia: "a colina desperta" } : i % 13 === 3 ? { nome: "" } : null,
    promessas: i % 5 === 3 ? [{ tipo: "frase", texto: "Eu juro que volto antes do inverno", quem: "" }, { tipo: "objeto", texto: "a Lâmina de Orvalho", quem: "Doran o Manco" }] : [],
    promessas_pagas: i % 7 === 2 ? [1] : [],
  };
}
const GRUPOS = [[], [{ nome: "Ilka", nivel: 1 }], [{ nome: "Bruno", nivel: 2 }, { nome: "Lia", nivel: 2 }, { nome: "Rui", nivel: 1 }, { nome: "Zé", nivel: 1 }], [{ nome: "Fantasma", invocada: true }]];
const PROMETIDO_ABERTO = prometido.guardarSementes(prometido.garantirPrometido(null), [{ tipo: "frase", texto: "voltarei com a cura para a menina", quem: "Doran o Manco" }]).estado;
export function casoDoCronista(i) {
  const personagem = { nome: HEROI, nivel: 1 + (i % 9), classe: ["guerreiro", "mago", "ladino"][i % 3], atributos: { forca: 2, destreza: 1, vigor: 1, intelecto: i % 4, presenca: 3 }, grupo: GRUPOS[i % GRUPOS.length], xp: 0 };
  const nomesNpcs = ["Doran o Manco", "Ilka", "Sava", "Delfina da Névoa"].slice(0, i % 5);
  return {
    i,
    personagem, pers: i % 29 === 0 ? undefined : personagem,
    narrativa: i % 23 === 0 ? "curto demais" : NARR[i % NARR.length] + (i % 2 ? " A noite cai." : ""),
    doTurno: { frase: ["vou à estalagem", "falo com Doran o Manco", "ataco o lobo", "", "convido Ilka a vir comigo"][i % 5], envelopes: i % 7 === 0 ? ["[COMBATE — RESOLVIDO PELO SISTEMA] Lobo Grande caiu"] : i % 7 === 1 ? ["[ABERTURA DA CAMPANHA] o começo"] : [], ...(i % 2 ? { paraASessao: {} } : {}) },
    combate: i % 4 === 1 ? { inimigos: [{ nome: "Lobo Grande", vida: i % 8 === 1 ? 0 : 7, derrotado: false }, { nome: "Vespa", vida: 3 }] } : null,
    npcs: Object.fromEntries(nomesNpcs.map((n) => [n, npcs.criarNPC(n, { papel: "gente da cidade", ultimaVez: 1, conhecidoEm: 1 })])),
    canone: i % 3 === 0 ? { "Coroa Partida": { tipo: "artefato", descricao: "uma coroa" } } : {},
    mapa: MAPA,
    cidadeAtual: i % 10 === 4 ? "Agulha de Sal" : "Ponte do Martelo",
    lugar: [null, { nome: "a estalagem" }, { nome: "A Guarnição dos Andarilhos" }][i % 3],
    divindade: i % 3 === 0 ? { despertar: true, fieis: 10 } : i % 3 === 1 ? { despertar: false } : null,
    eventos: i % 5 === 0 ? { global: { nome: "A Peste Cinzenta", etapas: ["a", "b", "c"], etapa: i % 10 === 0 ? 2 : 0, descricao: "a peste" } } : { global: null },
    missoes: i % 8 === 0 ? [] : [{ id: "m1", titulo: "O que a Guarnição guarda", tipo: "principal", dador: i % 2 ? "Doran o Manco" : "", descricao: "descobrir", status: "ativa", etapas: [{ tipo: "falar_com", alvo: "Doran o Manco", feito: false }], prazo: 0, nivel: 1, criadaEm: 1 }],
    prometido: i % 4 === 3 ? PROMETIDO_ABERTO : null,
    abertura: i % 6 === 5 ? { v: 1, principalId: "m1", turnos: 0, feitas: 0 } : null,
    coracao: null,
    relogios: i % 8 === 5 ? [{ id: "r1", nome: "O ritual da colina", tipo: "ameaca", segmentos: 6, cheios: 1, gatilho: "noite" }] : [],
    dia: 1 + (i % 5), jornada: i % 13 === 3 ? { destino: "Agulha de Sal" } : null, masmorra: i % 17 === 5 ? { nome: "a cripta", encerrada: false } : null,
    npcTurno: 5 + (i % 3),
    espinha: i % 5 >= 3 ? { estrutura: "jornada", atos: [{ marcos: [{ id: "e|0|0", feito: false, onde: "o moinho velho" }, { id: "e|0|1", feito: false, feitio: "descobrir", onde: "A Guarnição dos Andarilhos", segredo: { acha: "investigacao", coisa: "o forte erguido sobre a cripta" } }] }] } : null,
    leitura: gatilho.garantirLeitura({ pulos: i % 4, fila: i % 6 === 0 ? ["uma narração antiga com Brannoc da Foz na margem do rio"] : [], vistos: i % 9 === 1 ? ["wystan pedra"] : [] }),
    testeDoTurno: i % 9 === 0 ? { pericia: "investigacao", sucesso: true } : null,
    rolagem: i % 10 === 6 ? { atributo: "Força" } : null,
    rede: i % 17 === 3 ? "estoura" : i % 19 === 5 ? "lixo" : i % 31 === 7 ? "null" : "proposta",
    proposta: propostaDoCaso(i),
    notaAntes: i % 2 ? "[NOTA DE ANTES]" : "",
  };
}

/* ---------------- OS DUBLÊS ---------------- */
const copia = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
const ref = (v) => ({ current: v });
const sha = (x) => createHash("sha256").update(typeof x === "string" ? x : JSON.stringify(x === undefined ? null : x)).digest("hex").slice(0, 16);
export function dublesDoCronista(k, { novo }) {
  const log = { portas: [], tela: [], calados: [], sets: [], rede: [], salvos: [], faltas: [] };
  const P = (...x) => log.portas.push(copia(x));
  const C = (nome) => (v) => log.sets.push([nome, sha(v)]);
  const S = {
    ...osModulos({ novo }),
    personagem: copia(k.personagem), rolagem: copia(k.rolagem), nomeCampanha: "Sal", mundo: "o mundo",
    personagemRef: ref(copia(k.personagem)), combateRef: ref(copia(k.combate)), npcsRef: ref(copia(k.npcs)), canoneRef: ref(copia(k.canone)),
    mapaRef: ref(copia(k.mapa)), cidadeAtualRef: ref(k.cidadeAtual), lugarRef: ref(copia(k.lugar)), divindadeRef: ref(copia(k.divindade)),
    eventosRef: ref(copia(k.eventos)), missoesRef: ref(copia(k.missoes)), prometidoRef: ref(copia(k.prometido)), aberturaMundoRef: ref(copia(k.abertura)),
    coracaoRef: ref(copia(k.coracao)), relogiosRef: ref(copia(k.relogios)), diaRef: ref(k.dia), jornadaRef: ref(copia(k.jornada)), masmorraRef: ref(copia(k.masmorra)),
    npcTurnoRef: ref(k.npcTurno), espinhaRef: ref(copia(k.espinha)), leituraDoCronistaRef: ref(copia(k.leitura)), testeDoTurnoRef: ref(copia(k.testeDoTurno)),
    ultimoPedidoRef: ref(k.doTurno.frase), notaRef: ref(k.notaAntes), questsRef: ref([{ titulo: "q" }]), falouComRef: ref([]), segredosReveladosRef: ref([]),
    systemRef: ref(""), bancoNomesRef: ref([]), faccaoJogadorRef: ref(null), muralRef: ref([]),
    calou: (onde, e) => log.calados.push([onde, String(e && e.message)]),
    pushMsgs: (xs) => log.tela.push(copia(xs)),
    salvar: (o) => log.salvos.push(sha(o)),
    setRelogios: C("relogios"), setEventos: C("eventos"), setQuests: C("quests"), setPersonagem: C("personagem"), setNpcs: C("npcs"), setRolagem: C("rolagem"),
    /* a rede: a proposta do caso, ou o estouro, ou o lixo */
    chamarModelo: async (sys, msgs, max, fmt, peso) => {
      log.rede.push({ sys: sha(sys), user: sha(msgs && msgs[0] && msgs[0].content), max, fmt, peso });
      if (k.rede === "estoura") throw new Error("a rede caiu");
      if (k.rede === "lixo") return "isto não é json";
      if (k.rede === "null") return "null";
      return JSON.stringify(k.proposta);
    },
    retratoDoJogo: () => ({ versao: 2, dia: S.diaRef.current, relogios: S.relogiosRef.current, modo: "historia" }),
    vereditoDoConvite: (nome) => ({ resposta: /Ilka|Sava/.test(nome) ? "aceita" : "recusa" }),
    /* A RÉGUA DO LUGAR (dublê de registrarLugar): às vezes muda o lugar e a
       cidade e escreve na nota — o cartaz lê a cidade DEPOIS disto */
    registrarLugar: (nome, fonte) => {
      P("registrarLugar", nome, fonte, S.cidadeAtualRef.current);
      if (k.i % 4 === 0) { S.lugarRef.current = { nome }; S.notaRef.current = `${S.notaRef.current ? S.notaRef.current + "\n" : ""}[LUGAR] ${nome}`; }
      if (k.i % 8 === 4 || k.i % 8 === 2) S.cidadeAtualRef.current = "Agulha de Sal";
      if (k.i % 11 === 6) throw new Error("régua torta");
      return k.i % 3 === 0 ? `📍 ${nome}` : null;
    },
    historiaDoMural: () => { P("historiaDoMural"); return k.i % 6 === 2 ? ["Joana Rasa"] : []; },
    contextoDoNome: (n) => {
      P("contextoDoNome", n && n.nome || null);
      if (k.i % 37 === 11) S.calou("contextoDoNome", new Error("base torta"));
      return motorAplicar.contextoDoNomeCom({ importantes: ["Doran o Manco", "Delfina"], conhecidos: Object.keys(S.npcsRef.current || {}), recentes: [], grupo: (S.personagemRef.current || {}).grupo || [], aqui: [S.cidadeAtualRef.current], heroi: HEROI }, n);
    },
    nucleoAgora: () => { P("nucleoAgora"); return k.i % 5 === 2 ? { pessoas: [{ nome: "Hilda", papel: "taverneira" }] } : null; },
    pregarNoMural: (c) => { P("pregarNoMural", c && c.titulo, c && c.dador, c && c.paga, c && c.cidade); S.muralRef.current = [...S.muralRef.current, c && c.titulo]; return k.i % 4 !== 3; },
    marcarNoArco: (tipo, rot) => P("marcarNoArco", tipo, rot, S.eventosRef.current),
    ganharFe: (f, pf, motivo, local) => {
      P("ganharFe", f, pf, motivo, local, S.notaRef.current);
      S.divindadeRef.current = { ...(S.divindadeRef.current || {}), fieis: ((S.divindadeRef.current || {}).fieis || 0) + f };
      return [`✨ +${f} fiéis (${motivo})`];
    },
    sincronizarNemesis: () => P("sincronizarNemesis", Object.keys(S.npcsRef.current || {})),
    /* A CONFERÊNCIA DAS MISSÕES (dublê de conferirAsMissoes): lê a conversa e
       o segredo nos refs, e às vezes fecha a etapa (o elenco tocou) */
    conferirAsMissoes: (pc) => {
      P("conferirAsMissoes", S.falouComRef.current, S.segredosReveladosRef.current, pc && pc.xp);
      if (k.i % 10 === 5) throw new Error("conferir torto");
      if ((S.falouComRef.current || []).includes("Doran o Manco") || (S.segredosReveladosRef.current || []).length) {
        S.missoesRef.current = (S.missoesRef.current || []).map((m) => ({ ...m, conferida: true }));
        return { ...(pc || {}), xp: ((pc && pc.xp) || 0) + 10 };
      }
      return k.i % 2 ? pc : null;
    },
    /* A FÁBRICA DOS ÓRGÃOS DO DEPOIS (dublê de osOrgaosAgora, Fase 4,
       trilha A, 29/10): a porta conferirCom saiu do literal das portas do App
       para src/motor/depois-do-turno.js, e o App chama-a pela fábrica. O
       dublê é a porta de lá à letra (a conversa ou o segredo no ref só
       enquanto se confere, e fora no finally), sobre o dublê da conferência
       acima: o que a peça faz com a conferência de verdade prova-se lado a
       lado em teste-motor-depois-do-turno.mjs. */
    osOrgaosAgora: () => ({
      conferirCom: (pc, o) => {
        const r = o && o.segredos ? S.segredosReveladosRef : S.falouComRef;
        r.current = (o && (o.segredos || o.falouCom)) || [];
        try { return S.conferirAsMissoes(pc) || pc; } finally { r.current = []; }
      },
    }),
    mundoDaBase: () => { P("mundoDaBase"); return { semente: "s", mapa: S.mapaRef.current, genero: "fantasia", molde: null, lex: null, base: null }; },
    fichaDeCompanheiro: (nome, p) => { P("fichaDeCompanheiro", nome); return { nome, conceito: "", nivel: Math.max(1, ((p && p.nivel) || 1) - 2), vida: 10, vidaMax: 10, habilidades: [], vinculo: 0, marcos: [] }; },
    notaDoRecrutamento: (comp) => `[RECRUTAMENTO] ${comp.nome} nível ${comp.nivel}`,
    /* o fecho: o prompt remontado lê o que o Cronista deixou */
    montarSystemPrompt: (...a) => "SYS|" + sha(a),
    resumoMapaParaPrompt: () => "MAPA", resumoDiplomacia: () => "DIPLOMACIA", resumoDoArco: () => "ARCO",
    resumoQuests: (q) => "QUESTS " + (q || []).length, tempoInfoPrompt: () => "TEMPO " + S.diaRef.current,
    infoDivindade: () => JSON.stringify(S.divindadeRef.current), infoTitulo: () => "TITULO", cenaDoPrompt: () => "CENA",
  };
  /* um nome que nenhum dublê dá e que não é do JavaScript fica em `faltas` */
  const escopo = new Proxy(S, {
    has: (t, nome) => {
      if (typeof nome !== "string") return false;
      if (nome in t) return true;
      if (nome in globalThis) return false;
      log.faltas.push(nome);
      return true;
    },
    get: (t, nome) => {
      if (nome === Symbol.unscopables) return undefined;
      if (nome in t) return t[nome];
      throw new ReferenceError("falta o dublê: " + String(nome));
    },
    set: (t, nome, v) => { t[nome] = v; return true; },
  });
  return { S, escopo, log };
}

/* corre o bloco (de antes ou de hoje) sobre um caso, e fotografa */
export async function correrOBloco(fazer, k, { novo } = {}) {
  const { S, escopo, log } = dublesDoCronista(k, { novo });
  /* o relógio aceito ganha id da reserva da casa (relogios.js): semeada por
     caso, a foto não depende de quantos casos correram antes neste processo */
  semearACasa("cronista|" + k.i);
  let ret = null, erro = null;
  try { ret = await fazer(escopo)({ pers: k.pers === undefined ? undefined : S.personagem, narrativa: k.narrativa, doTurno: copia(k.doTurno) }); }
  catch (e) { erro = String(e && e.message); }
  const refs = {};
  for (const [nome, v] of Object.entries(S)) if (/Ref$/.test(nome) && v && typeof v === "object" && "current" in v) refs[nome] = v.current;
  return { ret, erro, refs, log };
}

/* A FOTO: os refs, as portas, a tela, a rede, o que a função devolveu */
export function fotoDoCronista(f) {
  const tudo = { refs: f.refs, log: f.log, ret: f.ret === undefined ? "(undefined)" : f.ret, erro: f.erro };
  return {
    nota: f.refs.notaRef, erro: f.erro, calados: f.log.calados, faltas: [...new Set(f.log.faltas)],
    tela: f.log.tela.map((xs) => xs.map((m) => m.texto)),
    portas: f.log.portas.map((x) => x[0]),
    tudo: createHash("sha256").update(JSON.stringify(tudo)).digest("hex"),
  };
}
export const casosDoCronista = (n) => Array.from({ length: n }, (_, i) => casoDoCronista(i));

/* ---------------- O ACEITO, JOGADO ----------------
   Para as suítes que liam uma secção do Cronista no texto do App e passam
   a prová-la jogando a peça do motor (`oAceitoDoCronista`): um estado
   simples que os efeitos atualizam, as portas do App como dublês que
   gravam a chamada (e devolvem o que o caso pedir), e o que saiu.
     jogarOAceito(aceito, { recusado, proposta, estado, pers, base, portas, rolagem, testeDoTurno, narrativa })
       → { fim, efeitos, portas: [[nome, ...args]], estado } */
export function jogarOAceito(aceito, o = {}) {
  const efeitos = [], chamadas = [];
  let estado = { npcs: {}, canone: {}, relogios: [], missoes: [], dia: 1, ...(o.estado || {}) };
  const PADRAO = {
    registrarLugar: () => null, historiaDoMural: () => [], contextoDoNome: (n) => motorAplicar.contextoDoNomeCom(o.base || {}, n),
    nucleoAgora: () => null, pregarNoMural: () => true, marcarNoArco: () => null, ganharFe: () => [], sincronizarNemesis: () => null,
    conferirCom: (p) => p, mundoDaBase: () => null,
    fichaDeCompanheiro: (nome, p) => ({ nome, nivel: Math.max(1, ((p && p.nivel) || 1) - 2), vida: 10, vidaMax: 10 }),
    notaDoRecrutamento: (c) => "[RECRUTAMENTO] " + c.nome,
  };
  const portas = {};
  for (const [nome, f] of Object.entries({ ...PADRAO, ...(o.portas || {}) })) portas[nome] = (...a) => { chamadas.push([nome, ...a]); return f(...a); };
  const ctx = {
    ...portas,
    pers: "pers" in o ? o.pers : { nome: "Vera", nivel: 3, atributos: {}, grupo: [] },
    narrativa: o.narrativa || "x", testeDoTurno: o.testeDoTurno || null, rolagem: o.rolagem || null,
    ler: () => estado,
    aplicar: (efs) => {
      for (const ef of efs) {
        efeitos.push(ef);
        for (const campo of ["npcs", "canone", "relogios", "eventos", "prometido"]) if (ef.tipo === campo) estado = { ...estado, [campo]: ef[campo] };
      }
    },
  };
  const fim = motorCrTurno.oAceitoDoCronista(aceito, o.recusado || [], o.proposta || {}, ctx);
  return { fim, efeitos, portas: chamadas, estado };
}
