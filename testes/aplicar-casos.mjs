/* aplicar-casos.mjs (Fase T1-A, 27/10/2026) — os casos da prova do aplicar

   Os mesmos casos alimentam dois lados: `gerar-aplicar-dourado.mjs`, que
   corre o `aplicarResposta` de ANTES da mudança (o App de b9e6e20, lido do
   git) e grava o que ele produziu em `aplicar-dourado.json`; e
   `teste-motor-aplicar.mjs`, que corre `aplicar` (src/motor/aplicar.js)
   sobre os mesmos casos e exige o mesmo, byte a byte.

   A RESPOSTA é real: as narrações das sessões 8, 9 e 10 (o registo do
   Cronista, 197 turnos, e o da cena, 78), com a frase do jogador e os
   envelopes do turno. O que os registos não guardam — a ficha, a luta, as
   `mudancas` — varia por caso, de forma determinista pelo índice, para que
   cada ramo do bloco (as travas, o relógio do herói, do grupo e dos
   inimigos, a recarga, a cobrança e o débito) seja percorrido muitas
   vezes. A sorte da casa é semeada por caso (`semente`), porque a
   salvaguarda do fim do turno rola por ela. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { dadoDo } from "../src/semente.js";
import { garantirGeografia } from "../src/geografia.js";
import { garantirHistoria } from "../src/historia.js";
import { garantirDevocao } from "../src/devocao.js";
import { locaisDaCidade, masmorrasDoMundo, oQueExisteAqui } from "../src/mundo-base.js";
import { arredoresDaCidade } from "../src/arredores.js";
import { definirLugar } from "../src/lugar.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ler = (f) => JSON.parse(fs.readFileSync(path.join(AQUI, f), "utf8"));

const COND = {
  veneno: { id: "envenenado", nome: "Envenenado", turnos: 3 },
  sangue: { id: "sangrando", nome: "Sangrando", turnos: 2 },
  medo: { id: "amedrontado", nome: "Amedrontado", turnos: 3 },
  bencao: { id: "abencoado", nome: "Abençoado", turnos: 2 },
  preso: { id: "agarrado", nome: "Agarrado", turnos: 4 },
  fim: { id: "cego", nome: "Cego", turnos: 1 },
};

function ficha(i) {
  const efeitos = [];
  if (i % 3 === 0) efeitos.push({ nome: "Bênção da Forja", turnos: 1 + (i % 4), bonus: 1 });
  if (i % 5 === 0) efeitos.push({ nome: "Regeneração", turnos: 3, curaTurno: 2 });
  const condicoes = [[COND.veneno], [COND.medo, COND.fim], [], [COND.sangue, COND.preso], [COND.bencao], []][i % 6];
  const grupo = i % 2 === 0 ? [
    { nome: "Freya", classe: "Guerreiro", nivel: 4, vida: 20, vidaMax: 24, efeitos: i % 4 === 0 ? [{ nome: "Escudo", turnos: 1 }] : [], condicoes: i % 3 === 0 ? [COND.medo] : [] },
    { nome: "Rurik", classe: "Mago", nivel: 3, vida: 12, vidaMax: 14, efeitos: [], condicoes: i % 4 === 2 ? [COND.bencao, COND.fim] : [] },
  ] : [];
  return {
    nome: "Ana Cinza", classe: i % 2 ? "Ladino" : "Guerreiro", nivel: 3 + (i % 5), xp: 900, moedas: [0, 3, 50, 200][i % 4],
    vida: [24, 3, 1, 30][i % 4], vidaMax: 30, mana: 8, manaMax: 10,
    atributos: { forca: 2, destreza: 3, constituicao: 1, inteligencia: 0, sabedoria: 1, carisma: 2 },
    inventario: i % 3 === 1 ? [{ id: "pocao_cura", nome: "Poção de Cura", tipo: "consumivel" }] : [],
    equipamento: [], equipados: {}, habilidades: [], efeitos, condicoes, grupo,
    habRecarga: i % 4 === 3 ? { "Golpe Duplo": 2, "Fúria": 1 } : {},
  };
}

function luta(i) {
  if (i % 5 !== 0 && i % 7 !== 3) return null;
  return {
    rodada: 2, inimigos: [
      { nome: "Lobo Cinzento", vida: 10, vidaMax: 12, condicoes: [COND.sangue], derrotado: false },
      { nome: "Ogro", vida: i % 2 ? 2 : 25, vidaMax: 30, condicoes: [COND.veneno, COND.medo], derrotado: false },
      { nome: "Goblin", vida: 0, vidaMax: 7, condicoes: [COND.veneno], derrotado: true },
      { nome: "Batedor", vida: 6, vidaMax: 6, condicoes: [], derrotado: false },
    ],
  };
}

function mudancas(i) {
  switch (i % 8) {
    case 0: return undefined;
    case 1: return { vida: -4, mana: -3, grupo_vida: [{ nome: "Freya", vida: -2 }, { nome: "Rurik", vida: 3 }] };
    case 2: return { moedas: 12, xp: 40 };
    case 3: return { moedas: -5, vida: 2 };
    case 4: return { mana: -2, xp: 10, sinais: ["fe:proeza"] };
    case 5: return {};
    case 6: return { moedas: 30, vida: -1, mana: 1 };
    default: return { xp: 5 };
  }
}

export function casosDoAplicar() {
  const cron = ler("registo-s8-s10-cronista.json").turnos;
  const cena = ler("registo-s10-cena.json");
  const fontes = [
    ...cron.map((x) => ({ narrativa: x.narrativa || "", frase: x.frase || "", envelopes: (x.envelopes || []).join("\n"), ses: x.ses + "#" + x.k })),
    ...cena.respostas.map((r, k) => ({ narrativa: String(r || ""), frase: ((cena.pautas || [])[k] || {}).frase || "", envelopes: "", ses: "s10-cena#" + k })),
  ];
  return fontes.map((f, i) => {
    const md = mudancas(i);
    /* as narrações reais quase nunca dizem "você acha 20 moedas": a cobrança
       e o espelho seriam provados no zero. Uma frase de ganho ou de paga é
       somada a um caso em cada cinco, para os dois ramos correrem. */
    const extra = ["", " Você encontra 15 moedas de ouro e uma poção de cura no baú.", "", " Você paga 10 moedas ao ferreiro.", " Você recebe 8 escamas pelo serviço."][i % 5];
    return {
      id: `${f.ses}`,
      semente: `aplicar-dourado|${i}`,
      resp: md === undefined ? { narrativa: f.narrativa + extra } : { narrativa: f.narrativa + extra, mudancas: md },
      estado: {
        personagem: ficha(i),
        combate: luta(i),
        danoJaAplicado: i % 6 === 0,
        habUsada: i % 7 === 0,
        ultimoDesfecho: ["sucesso", "falha", null][i % 3],
      },
      ctx: { envelopes: f.envelopes + (i % 9 === 4 ? "\n[COMPRA — já registrada pelo sistema]" : ""), pedido: f.frase, moeda: i % 10 === 7 ? "escamas" : "" },
      notaAntes: i % 4 === 1 ? "[NOTA DE ANTES]" : "",
    };
  });
}

/* ============================================================
   OS CASOS DO REGISTO (T1-A, 2.ª fatia) — o cânone e a gente

   As mesmas 275 narrações reais; o que os registos não guardam (o cânone
   e as fichas que o Narrador declarou, o cânone e a gente de antes, a
   espinha com um segredo de pé, a abertura com a pista ainda por achar)
   varia pelo índice, com os NOMES dos registos (os `conhecidos` de cada
   turno do Cronista), para que cada ramo dos dois blocos corra muitas
   vezes: a peneira que recusa, o lugar que surge no mapa, a mescla, a
   pessoa do cânone que vira ficha, a menção que não é presença, o nome
   repetido, o lixo. A sorte da casa é semeada por caso (a geografia a usa).
   ============================================================ */
const NOMES_DE_FORA = ["Freya", "Ursa o Andarilho", "Nyla", "Marga Pedrafria", "Ordem dos Esquecidos"];
const CIDADES = [
  { nome: "Monte Rasa", x: 40, y: 40, tipo: "cidade", regiao: "Vale", populacao: 2400 },
  { nome: "Nova Profundo", x: 90, y: 60, tipo: "cidade", regiao: "Costa", populacao: 9000 },
];
const PISTA = { nome: "Wystan", local: "Monte Rasa" };
const ALVO = { quem: "Edric Vau", onde: "Ponte Lenta" };
const SEGREDO = "Gruta das Vozes";

export function casosDoRegisto() {
  const cron = ler("registo-s8-s10-cronista.json").turnos;
  const cena = ler("registo-s10-cena.json");
  const fontes = [
    ...cron.map((x) => ({ narrativa: x.narrativa || "", conhecidos: (x.conhecidos || []).filter((n) => typeof n === "string" && n.trim()), ses: x.ses + "#" + x.k })),
    ...cena.respostas.map((r, k) => ({ narrativa: String(r || ""), conhecidos: [], ses: "s10-cena#" + k })),
  ];
  return fontes.map((f, i) => {
    const nomes = [...new Set([...f.conhecidos, ...NOMES_DE_FORA])];
    const N = (k) => nomes[(i + k) % nomes.length];
    const novo = `Brann ${["Ferro", "Vau", "Cinza", "Lume", "Sal"][i % 5]}`;
    const canoneAntes = {
      "Monte Rasa": { tipo: "cidade", descricao: "a cidade da ladeira" },
      [N(0)]: { tipo: i % 2 ? "pessoa" : "organizacao", descricao: "conhecido de antes", papel: "contato" },
      ...(i % 3 === 0 ? { "a lâmina partida": { tipo: "artefato", descricao: "o que sobrou da espada", detalhes: "" } } : {}),
    };
    const npcsAntes = i % 4 === 3 ? {} : {
      [N(1)]: { nome: N(1), papel: "guarda", relacao: "neutro", genero: "homem", local: "Monte Rasa", ultimaVez: 2, conhecidoEm: 1, notas: "" },
    };
    const canone = [
      undefined,
      { [N(2)]: { tipo: "pessoa", descricao: "quem a cena trouxe", papel: "taberneira", genero: "mulher", local: "Monte Rasa" } },
      { [`Vila ${["Funda", "Seca", "Alta"][i % 3]}`]: { tipo: i % 2 ? "vila" : "povoado", descricao: "uma aldeia na estrada", local: "Vale" }, "Torre Velha": { tipo: "ruína", descricao: "pedra caída" } },
      { "a lâmina partida": { detalhes: "a guarda tem um corvo", dono: "Ana Cinza" }, [N(0)]: { notas: "voltou à cidade" } },
      { [SEGREDO]: { tipo: "local", descricao: "uma gruta que fala" }, [novo]: { tipo: "pessoa", descricao: "um estranho", genero: "homem" } },
      {},
      { "Capital do Norte": { tipo: "capital", descricao: "a sede do reino", faccao: "Coroa" }, [PISTA.nome]: { tipo: "pessoa", descricao: "a pista", local: "Monte Rasa" } },
    ][i % 7];
    const npcs = [
      undefined,
      [{ nome: novo, papel: "ferreiro", genero: "homem", local: "Monte Rasa", relacao: "neutro" }],
      [{ nome: N(1), notas: "fala baixo", local: "Nova Profundo" }],
      [{ nome: PISTA.nome, papel: "informante" }],
      [{ nome: N(3), papel: "viajante" }, { nome: String(N(3)).toUpperCase(), papel: "o mesmo" }],
      [null, { nome: "" }, { nome: novo, papel: "guarda", conhecidoEm: 1 }],
      { nome: N(4), papel: "um só, sem lista", genero: "mulher" },
      [{ nome: `${String(N(0)).split(" ")[0]} da Névoa`, papel: "recrutadora", local: "Nova Profundo" }],
    ][i % 8];
    const md = i % 11 === 10 ? undefined : { ...(canone === undefined ? {} : { canone }), ...(npcs === undefined ? {} : { npcs }) };
    const comAbertura = i % 5 === 0;
    return {
      id: f.ses,
      semente: `registo-dourado|${i}`,
      resp: md === undefined ? { narrativa: f.narrativa } : { narrativa: f.narrativa, mudancas: md },
      estado: {
        personagem: { nome: "Ana Cinza", nivel: 3 + (i % 4), grupo: i % 2 ? [{ nome: "Freya" }] : [] },
        canone: canoneAntes,
        mapa: { cidades: CIDADES.map((c) => ({ ...c })), faccoes: [] },
        npcs: npcsAntes,
        npcTurno: i % 9,
        espinha: i % 4 === 0 ? { atos: [{ marcos: [{ id: "m1", feitio: "descobrir", onde: SEGREDO, titulo: "o que a gruta guarda", feito: false }] }] } : null,
        abertura: comAbertura ? { principalId: "m_principal", cidade: "Monte Rasa", pista: { ...PISTA }, alvo: { ...ALVO } } : null,
        lugar: i % 3 === 1 ? { nome: "a fazenda de Jessa" } : null,
        missoes: comAbertura ? [{ id: "m_principal", titulo: "O fio da pista", tipo: "principal", status: "ativa", etapas: [{ tipo: "falar_com", alvo: PISTA.nome, feito: false }] }] : [],
        dia: 3 + (i % 10),
      },
      ctx: {
        mundo: { semente: `mundo|${i % 3}`, mapa: { cidades: CIDADES.map((c) => ({ ...c })), faccoes: [] }, genero: "", molde: null, lex: null, base: null },
        baseDoNome: { importantes: nomes.slice(0, 4).map((nome) => ({ nome })), conhecidos: [], recentes: [f.narrativa.slice(0, 160)], grupo: i % 2 ? [{ nome: "Freya" }] : [], aqui: ["Monte Rasa"], heroi: "Ana Cinza" },
      },
      notaAntes: i % 4 === 1 ? "[NOTA DE ANTES]" : "",
    };
  });
}

/* o retrato do registo: o que o App guarda e mostra depois dos dois blocos */
export function retratoDoRegisto({ canone, mapa, npcs, npcTurno, nota, msgs, remontou }) {
  return JSON.stringify({ canone, mapa, npcs, npcTurno, nota, msgs, remontou });
}

/* a forma comum do resultado, a que o dourado grava e a que o teste compara */
export function retrato({ pers, msgs, nota, combate, danoJaAplicado, habUsada, textura, resp }) {
  return JSON.stringify({ pers, msgs, nota, combate, danoJaAplicado, habUsada, textura, resp });
}

/* o dourado guarda a impressão digital do retrato (sha256), não o retrato:
   275 fichas inteiras pesariam meio megabyte no repositório. As linhas da
   tela e a nota vão por extenso, para uma divergência ser legível. */
export function digital(texto) {
  return createHash("sha256").update(texto).digest("hex");
}

/* ============================================================
   OS CASOS DO MEIO (T1-A, 3.ª fatia) — as dádivas, o mapa, as missões
   e os sinais

   O que corre entre o `aplicar` e o registo, no App de antes (d776408):
   a dádiva pendente, o mapa e as facções (com o lugar dito, a cidade que
   se pisa, a névoa da vizinhança e a cerimónia da chegada), o evento global
   que se encerra (o marco no arco) e os sinais do Mestre (a fé, o milagre,
   a viagem, a masmorra, a raid, a ascensão, o achado, o domínio, o
   patrono). As mesmas 275 narrações reais dão a frase do jogador (a régua
   do lugar a lê); o resto varia pelo índice, com um mapa de verdade (a
   geografia, as rotas, as masmorras da região) para que cada ramo corra.
   ============================================================ */
function mapaDoMeio() {
  return garantirGeografia({
    cidades: [
      { nome: "Monte Rasa", x: 40, y: 40, tipo: "cidade", regiao: "Vale", pisada: true, descoberta: true },
      { nome: "Nova Profundo", x: 46, y: 44, tipo: "cidade", regiao: "Costa", descoberta: false },
      { nome: "Vila Funda", x: 38, y: 43, tipo: "vila", regiao: "Vale", descoberta: false },
      { nome: "Porto Cinza", x: 44, y: 34, tipo: "cidade", regiao: "Costa", descoberta: true },
      { nome: "Forte do Rei", x: 70, y: 70, tipo: "capital", regiao: "Norte", descoberta: true, deOuvir: true },
      { nome: "Ermo Alto", x: 74, y: 76, tipo: "vila", regiao: "Norte", descoberta: false, relacao: "jogador" },
    ],
    faccoes: [{ nome: "Coroa" }],
    regioes: [{ nome: "Vale", bioma: "planicie", cx: 40, cy: 42 }, { nome: "Costa", bioma: "costa", cx: 45, cy: 38 }, { nome: "Norte", bioma: "montanha", cx: 72, cy: 72 }],
  }, "meio-dourado");
}

export function casosDoMeio() {
  const cron = ler("registo-s8-s10-cronista.json").turnos;
  const cena = ler("registo-s10-cena.json");
  const fontes = [
    ...cron.map((x) => ({ narrativa: x.narrativa || "", frase: x.frase || "", ses: x.ses + "#" + x.k })),
    ...cena.respostas.map((r, k) => ({ narrativa: String(r || ""), frase: ((cena.pautas || [])[k] || {}).frase || "", ses: "s10-cena#" + k })),
  ];
  return fontes.map((f, i) => {
    const semente = `mundo|${i % 3}`;
    const mapa = mapaDoMeio();
    const cidadeAtual = ["Monte Rasa", "Porto Cinza", "", "Monte Rasa", null, "Nova Profundo"][i % 6];
    const cid = mapa.cidades.find((c) => c.nome === cidadeAtual) || null;
    const locais = cid ? locaisDaCidade(semente, cid, "Fantasia medieval", null, null) : [];
    const arred = cid ? arredoresDaCidade(semente, cid) : [];
    const masm = masmorrasDoMundo(semente, mapa);
    const daqui = masm.find((m) => m.cidadeProxima === cidadeAtual) || masm[0];
    const lugar = [
      null,
      definirLugar("a fazenda de Jessa", { cidade: cidadeAtual || "", dia: 2, distancia: "arredores" }),
      null,
      locais[0] ? definirLugar(locais[0].nome, { cidade: cidadeAtual || "", dia: 2, distancia: "dentro" }) : null,
      daqui && i % 8 === 4 ? definirLugar(daqui.nome, { cidade: cidadeAtual || "", dia: 2, distancia: "arredores" }) : null,
    ][i % 5];
    const nivel = [3, 8, 12, 15, 20, 17][Math.floor(i / 2) % 6];
    const personagem = {
      nome: "Ana Cinza", nivel, vida: [24, 3, 0, 30][i % 4], vidaMax: 30, mana: 8, manaMax: 10, morrendo: i % 4 === 2,
      grupo: i % 2 === 0 ? [{ nome: "Freya", vida: 0, vidaMax: 24, morrendo: true }, { nome: "Rurik", vida: 10, vidaMax: 14 }] : [],
      efeitos: i % 3 === 0 ? [{ nome: "Abençoado", turnos: 2, bonus: 1 }] : [], equipamento: [],
      dadivasPendentes: i % 13 === 0 ? 2 : (i % 29 === 7 ? 1 : 0), dadivas: [], dadivasUnicas: [],
    };
    const fieis = [0, 6000, 150000, 1200000][Math.floor(i / 5) % 4];
    const divindade = [
      { despertar: true, ehJogador: true, nome: "Ana", fieis, pf: [100, 10, 0, 60][Math.floor(i / 7) % 4], iconeFe: "🙏", dominio: i % 2 ? "" : "da Brasa", patrono: "", panteao: [] },
      null,
      { despertar: false, ehJogador: true, fieis: 0, pf: 0 },
    ][[0, 1, 2, 0, 0][i % 5]];
    const fichaDoRef = i % 6 === 5 ? null : { ...personagem, vida: Math.max(1, personagem.vida - 1) };
    const md = {};
    const lugarDito = [undefined, "a fazenda de Jessa", null, (locais[1] && locais[1].nome) || "O Javali Cambaleante", (arred[0] && arred[0].nome) || "o moinho velho", "a Gruta das Vozes", (daqui && daqui.nome) || "a cripta", (lugar && lugar.nome) || "a praça", "  "][i % 9];
    if (lugarDito !== undefined) md.lugar_atual = lugarDito;
    const cidadeDita = [undefined, "Nova Profundo", "Monte Rasa", "Porto Cinza", "Forte do Rei", undefined, "Vila Funda"][i % 7];
    if (cidadeDita) md.cidade_atual = cidadeDita;
    const cidades = [undefined, [{ nome: "Vila Nova", tipo: "vila", regiao: "Vale" }], [{ nome: "Monte Rasa", notas: "a ladeira", x: 999 }], [null, { nome: "" }, { nome: "Torre Branca", tipo: "fortaleza" }], undefined, [{ nome: "nova profundo", relacao: "jogador" }]][i % 6];
    if (cidades) md.mapa_cidades = cidades;
    const faccoes = [undefined, [{ nome: "Guilda do Sal", doJogador: true }], [{ nome: "Coroa", lema: "o rei não dorme" }], [{ nome: "Mãos Cinzentas" }], undefined][i % 5];
    if (faccoes) md.mapa_faccoes = faccoes;
    if (i % 4 === 1) md.jornada_meio = "de carroça pela estrada velha que corta o vale ao meio, devagar";
    if (i % 10 === 3) md.faccao_jogador = "Ordem do Corvo";
    const sinais = [
      undefined,
      [`masmorra:${(daqui && daqui.nome) || "a cripta"}`],
      ["fe:proeza"],
      ["milagre:cura", "fe:marco"],
      ["viagem:Porto Cinza", "viagem"],
      ["raid:a horda", "loot:raro"],
      ["ascender:deicidio"],
      ["loot:comum", "loot:lendario", "dominio:da Forja", "patrono:o Velho"],
      ["milagre:furia", "milagre:bencao", "milagre:ressurgir"],
      ["masmorra:a cripta que não existe", "  ", "fe", "x:y", "ascender:fe"],
      ["milagre:avatar", "milagre:juramento", "ascender:reliquia"],
      ["fe:sussurro", "fe:feito", "fe:proeza", "fe:marco", "fe:x", "fe:proeza", "fe:marco"],
    ][i % 12];
    if (sinais) md.sinais = sinais;
    if (i % 8 === 4 || i % 8 === 6) md.evento_global_encerrar = true;
    const semMudancas = i % 23 === 11;
    return {
      id: f.ses,
      semente: `meio-dourado|${i}`,
      resp: semMudancas ? { narrativa: f.narrativa } : { narrativa: f.narrativa, mudancas: md },
      estado: {
        personagem, fichaDoRef, fichaDoReact: fichaDoRef || personagem,
        mapa, cidadeAtual, lugar,
        jornada: i % 6 === 2 || i % 6 === 5 ? { de: "Monte Rasa", para: "Nova Profundo", desde: 2, meio: "a pé" } : null,
        faccaoJogador: i % 7 === 2 ? "Coroa" : "",
        devocao: i % 2 ? garantirDevocao(null, mapa, divindade) : { cidades: {}, andarilhos: 50 },
        divindade,
        combate: i % 7 === 0 ? { inimigos: [{ nome: "Lobo", vida: 10, vidaMax: 12 }, { nome: "Ogro", vida: 0, vidaMax: 30, derrotado: true }, { nome: "Batedor", vida: 3, vidaMax: 6 }] } : null,
        acampado: i % 11 === 5, masmorra: i % 13 === 6 ? { nome: "Poço de Ferro", encerrada: false } : null, raid: i % 17 === 8 ? { nome: "a horda" } : null,
        espinha: i % 4 === 0 ? { atos: [{ marcos: [{ onde: "a Gruta das Vozes", feito: false }, { onde: "Monte Rasa", feito: true }] }] } : null,
        ultimoPedido: f.frase, dia: 3 + (i % 10),
        eventos: { locais: [], global: i % 4 === 0 ? { nome: "A Praga Cinzenta" } : null, semGlobalDesde: 0, seq: 1 },
        historia: garantirHistoria({ estrutura: "jornada", etapa: i % 3, marcos: [0, 3, 7][i % 3] }),
        contadores: { combatesVencidos: i % 20, masmorrasConcluidas: i % 5 },
        nivelDaFama: 1,
        canone: {}, npcs: {}, quests: [],
      },
      ctx: {
        mundo: { semente, mapa: mapaDoMeio(), genero: "Fantasia medieval", molde: null, lex: null, base: null },
        arco: { marcosPendentes: i % 5 === 0 ? 2 : 0, nemesis: i % 2 ? "Vorn" : null },
      },
      notaAntes: i % 4 === 1 ? "[NOTA DE ANTES]" : "",
    };
  });
}

/* o motor do arco do caso, como o App o monta: lê o evento global de AGORA
   (o bloco das missões encerra-o antes de o marco virar o arco) */
export function motorDoArcoDoCaso(arco, eventos) {
  const g = (eventos || {}).global;
  return { marcosPendentes: arco.marcosPendentes, nemesis: arco.nemesis, global: g && g.nome ? g.nome : null, impostas: [], relogios: [] };
}

/* a sorte do turno do caso: um fio por evento, contado, como `sorteDoTurno` */
export function sorteDoCaso(semente) {
  const n = {};
  return (evento) => { n[evento] = (n[evento] || 0) + 1; return dadoDo(semente, "sorte do turno", evento, n[evento]); };
}

/* o que o prompt remontado leu, no instante em que foi remontado */
export function retratoDoPrompt(r) {
  return digital(JSON.stringify({ personagem: r.personagem, canone: r.canone, mapa: r.mapa, faccao: r.faccao, historia: r.historia, eventos: r.eventos, quests: r.quests, npcs: r.npcs, divindade: r.divindade, lugar: r.lugar, cidade: r.cidade, jornada: r.jornada }));
}

/* ============================================================
   OS CASOS DO TURNO INTEIRO (T1-A, 3.ª fatia, a fusão)

   As três famílias juntas, caso a caso: a ficha, a luta e as travas do
   `aplicar` (casosDoAplicar), o mundo, o deus e os sinais do meio
   (casosDoMeio), o cânone e a gente do registo (casosDoRegisto) — as
   mudanças das três somadas numa resposta só. É sobre estes que o turno
   de antes (o App de 48579a9, o aplicar, o meio e o registo em fila, com
   os efeitos aplicados entre eles) e o turno fundido (`aplicarOTurno`)
   têm de dar o mesmo.
   ============================================================ */
export function casosDoTurno() {
  const A = casosDoAplicar(), M = casosDoMeio(), G = casosDoRegisto();
  return A.map((a, i) => {
    const m = M[i], g = G[i];
    const md = { ...(a.resp.mudancas || {}), ...(m.resp.mudancas || {}), ...(g.resp.mudancas || {}) };
    const nenhuma = !a.resp.mudancas && !m.resp.mudancas && !g.resp.mudancas;
    const personagem = { ...a.estado.personagem, nivel: m.estado.personagem.nivel, dadivasPendentes: m.estado.personagem.dadivasPendentes, dadivas: [], dadivasUnicas: [] };
    return {
      id: a.id,
      semente: `turno-dourado|${i}`,
      resp: nenhuma ? { narrativa: a.resp.narrativa } : { narrativa: a.resp.narrativa, mudancas: md },
      estado: {
        ...m.estado, ...a.estado, personagem,
        fichaDoRef: m.estado.fichaDoRef ? { ...personagem, vida: Math.max(1, personagem.vida - 1) } : null,
        canone: g.estado.canone, npcs: g.estado.npcs, npcTurno: g.estado.npcTurno, abertura: g.estado.abertura, missoes: g.estado.missoes,
      },
      ctx: { ...a.ctx, mundo: m.ctx.mundo, arco: m.ctx.arco },
      notaAntes: a.notaAntes,
    };
  }).map((c) => ({ ...c, estado: { ...c.estado, fichaDoReact: c.estado.fichaDoRef || c.estado.personagem } }));
}

/* a base do nome do caso, como o App a monta: lê o lugar, a cidade, o mapa
   e a ficha de AGORA (o meio do turno mexe neles antes do registo) */
export function baseDoNomeDoCaso({ mapa, cidadeAtual, lugar, ficha }) {
  const f = ficha || {};
  return {
    importantes: ((mapa && mapa.cidades) || []).slice(0, 2).map((c) => ({ nome: c.nome, onde: c.regiao || "" })).concat((f.grupo || []).map((x) => ({ nome: x.nome }))),
    conhecidos: [], recentes: [], grupo: f.grupo || [], aqui: [cidadeAtual, lugar && lugar.nome].filter(Boolean), heroi: f.nome || "",
  };
}

/* o retrato do turno inteiro: tudo o que o App guarda e mostra depois do registo */
export function retratoDoTurno(r) {
  return JSON.stringify({
    pers: r.pers, fichaDoRef: r.fichaDoRef, fichaDoReact: r.fichaDoReact, mapa: r.mapa, cidadeAtual: r.cidadeAtual, lugar: r.lugar, jornada: r.jornada,
    faccaoJogador: r.faccaoJogador, devocao: r.devocao, divindade: r.divindade, eventos: r.eventos, historia: r.historia, combate: r.combate,
    sinalViagem: r.sinalViagem, sinalMasmorra: r.sinalMasmorra, sinalRaid: r.sinalRaid, espolio: r.espolio, lugarNovo: r.lugarNovo, chegada: r.chegada,
    salvos: r.salvos, remontagens: r.remontagens, questsVistas: r.questsVistas, canone: r.canone, npcs: r.npcs, npcTurno: r.npcTurno,
    danoJaAplicado: r.danoJaAplicado, habUsada: r.habUsada, textura: r.textura, resp: r.resp,
  });
}

/* a parte do mapa do retrato (a 1.ª etapa da fatia), e o retrato inteiro */
export function retratoDoMapa(r) {
  return JSON.stringify({ mapa: r.mapa, cidadeAtual: r.cidadeAtual, lugar: r.lugar, jornada: r.jornada, faccaoJogador: r.faccaoJogador, devocao: r.devocao, lugarNovo: r.lugarNovo, chegada: r.chegada });
}
export function retratoDoMeio(r) {
  return JSON.stringify({
    pers: r.pers, fichaDoRef: r.fichaDoRef, fichaDoReact: r.fichaDoReact, mapa: r.mapa, cidadeAtual: r.cidadeAtual, lugar: r.lugar, jornada: r.jornada,
    faccaoJogador: r.faccaoJogador, devocao: r.devocao, divindade: r.divindade, eventos: r.eventos, historia: r.historia, combate: r.combate,
    sinalViagem: r.sinalViagem, sinalMasmorra: r.sinalMasmorra, sinalRaid: r.sinalRaid, espolio: r.espolio, lugarNovo: r.lugarNovo, chegada: r.chegada,
    salvos: r.salvos, remontagens: r.remontagens, questsVistas: r.questsVistas,
  });
}

/* ============================================================
   OS CASOS DO FIM DO TURNO (T1-A, 4.ª fatia)

   O códex (da base para o cânone, os nomes à mão, o peso do deus que
   entra), a chegada que ninguém anotou e o portão correm DEPOIS da luta,
   no fim do `aplicarResposta`. Os casos são os do turno inteiro (as 275
   narrações reais), e o que os registos não guardam varia pelo índice:
   - a prosa ganha, por caso, o nome de um local e de uma pessoa da base da
     cidade em que se está (de `oQueExisteAqui`, o mesmo mundo do caso), um
     dos nomes à mão oferecidos (vivo ou morto), a chegada a uma cidade a um
     passo (e a chegada negada), e a queda de um inimigo que está de pé;
   - o mapa ganha duas rotas de um passo (Monte Rasa–Vila Funda e Porto
     Cinza–Nova Profundo), sem o que a chegada nunca morderia;
   - a base vem nula, ou com o primeiro local da cidade já revelado.
   ============================================================ */
const NOMES_OFERECIDOS = [{ nome: "Teodora Vaz", genero: "ela" }, { nome: "Bruno Sal", genero: "ele" }];
export function casosDoFim() {
  return casosDoTurno().map((c, i) => {
    const e = c.estado;
    const mapa = { ...e.mapa, rotas: [...(e.mapa.rotas || []), { de: "Monte Rasa", para: "Vila Funda", terreno: "estrada", km: 6, dias: 0.25 }, { de: "Nova Profundo", para: "Porto Cinza", terreno: "estrada", km: 9, dias: 0.4 }] };
    const semente = c.ctx.mundo.semente;
    const q = e.cidadeAtual ? oQueExisteAqui(semente, mapa, e.cidadeAtual, null, "Fantasia medieval", null, null) : null;
    const locais = (q && q.locais) || [], gente = (q && q.gente) || [];
    const frases = [];
    if (i % 3 === 0 && locais[i % Math.max(1, locais.length)]) frases.push(`Você passa diante de ${locais[i % locais.length].nome} sem parar.`);
    if (i % 2 === 0 && gente[i % Math.max(1, gente.length)]) frases.push(`${gente[i % gente.length].nome} ergue os olhos e acena para você.`);
    if (i % 7 === 3 && gente[(i + 1) % Math.max(1, gente.length)]) frases.push(`Mais atrás, ${gente[(i + 1) % gente.length].nome} cochicha com alguém.`);
    if (i % 5 === 0) frases.push("Teodora Vaz enche as canecas e ri alto.");
    if (i % 5 === 3) frases.push("Bruno Sal está morto no chão da estalagem.");
    const vizinha = { "Monte Rasa": "Vila Funda", "Vila Funda": "Monte Rasa", "Porto Cinza": "Nova Profundo", "Nova Profundo": "Porto Cinza" }[e.cidadeAtual];
    if (vizinha && (i % 4 === 2 || i % 6 === 3)) frases.push(`Ao cair da tarde você entra em ${vizinha} pela estrada curta.`);
    if (vizinha && i % 8 === 6) frases.push(`Você quase entra em ${vizinha}, mas volta.`);
    const vivo = e.combate && (e.combate.inimigos || []).find((x) => x && !x.derrotado && x.vida > 0);
    if (vivo && i % 3 === 1) frases.push(`${vivo.nome} tomba morto aos seus pés.`);
    const narrativa = [c.resp.narrativa || "", ...frases].join(" ").trim();
    const base = i % 4 === 1 && locais[0] ? { revelados: [locais[0].id || `${e.cidadeAtual}|local|${locais[0].nome}`], mortos: i % 8 === 5 ? [gente[0] && gente[0].nome].filter(Boolean) : [] } : null;
    return {
      id: c.id,
      semente: `fim-dourado|${i}`,
      resp: { ...c.resp, narrativa },
      estado: {
        personagem: e.personagem, fichaDoRef: e.fichaDoRef, mapa, cidadeAtual: e.cidadeAtual, lugar: e.lugar, jornada: i % 6 === 2 ? null : e.jornada,
        combate: i % 5 === 4 ? null : e.combate, divindade: e.divindade, npcs: e.npcs || {}, npcTurno: e.npcTurno || 0, dia: e.dia, abertura: e.abertura, missoes: e.missoes || [],
        base, oferecidos: i % 9 === 8 ? [] : NOMES_OFERECIDOS, ultimoPedido: e.ultimoPedido || "", confidencias: i % 6 === 1 ? [{ quem: gente[0] && gente[0].nome, oQue: "o segredo da ladeira" }] : [],
        nemesis: i % 10 === 7 ? { nome: "Vorn", vivo: true } : null,
      },
      ctx: { mundo: { semente, genero: "Fantasia medieval", molde: null, lex: null } },
      notaAntes: c.notaAntes,
    };
  });
}

/* o retrato do fim do turno, peça a peça */
export function retratoDoFim(r) {
  return JSON.stringify({
    base: r.base, npcs: r.npcs, cidadeAtual: r.cidadeAtual, lugar: r.lugar, mapa: r.mapa, minutos: r.minutos,
    portaoCtx: r.portaoCtx, portao: r.portao,
  });
}
