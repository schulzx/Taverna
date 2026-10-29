/* pauta-bloco.mjs (Fase 4, trilha B, 29/10/2026) — a pauta do turno, corrida em Node

   Não é suíte: é a ferramenta que as duas pontas da prova usam.

   - `gerar-pauta-dourado.mjs` recorta do App a `pautaDoTurno` e as 50
     funções que ela chama, à letra, corre o recorte sobre os casos daqui e
     grava as fotos em `pauta-dourado.json`.
   - `teste-motor-pauta-do-turno.mjs` corre a peça pura
     (src/motor/pauta-do-turno.js) sobre os MESMOS casos e exige as mesmas
     fotos; e corre o recorte de novo, mordido, para provar que a foto vê.

   OS DOIS LADOS LEEM O MESMO MUNDO. O recorte lê refs (`{ current }`),
   montados do estado do caso pelo campo que o save lhes dá; a peça lê o
   estado do caso direto. As portas são os MESMOS dublês dos dois lados: o
   `calou` anota onde calou, o `setPersonagem` anota a ficha, e o
   `pushMsgs` anota as mensagens E a foto de todos os refs no instante da
   chamada — é assim que se prova que a peça entrega ao App o que escreveu
   ANTES de lhe passar a palavra (o App de verdade lê os refs dentro dele).

   OS CASOS. Os 194 turnos gravados das sessões 8, 9 e 10 (a frase real do
   jogador e o estado real em que ela chegou), metade deles num mundo
   gerado pelos geradores de verdade (o mapa da criação, a espinha, as
   casas); e 81 casos que só existem aqui, para os ramos que as sessões não
   pisaram — a luta com tabuleiro, a masmorra, a estrada, a Noite, o crime,
   o golpe final, o sino, o coração que fala, o peso, o lixo. O que não é
   do save (o eco, os bilhetes, os soltos) varia por índice, sem
   Math.random; a sorte da casa é semeada por caso.

   AS SECÇÕES QUE FALTAVAM (29/10, trilha B). Depois dos 275, os casos de
   COBERTURA: duas secções da pauta que nenhum dos 275 pisava — ENTRETANTO
   (`foraDeCena`: o feito do elenco longe dos olhos do herói, de hoje ou de
   ontem, na cidade da cena) e O QUE VOLTA (`volta`: a promessa plantada
   que amadureceu e o Livro cobra) —, cada um sobre um dos sintéticos, com
   o estado que acende a secção. Vêm DEPOIS, e `N_CASOS` continua 275: é
   sobre ele que o pedido, o prelúdio e as outras provas fazem as contas
   dos índices (os montados do prelúdio começam ali), e um caso antigo que
   mudasse de índice mudaria de semente. A terceira, FORMA, não tem caso
   porque não tem quem a escreva: a forma da cena vai ao Narrador em
   envelope (`[A FORMA DESTA CENA]`, no pedido), e nenhum sítio da pauta
   põe nada na secção — a suíte o diz.

   E um nome que o recorte leia e nenhum dublê dê não cai em silêncio:
   fica em `faltas`, e a suíte exige-o vazio. */
import fs from "node:fs";
import { createHash } from "node:crypto";
import { estadoNoTurno } from "../src/sessao.js";
import { textoDaPauta } from "../src/pauta.js";
import { semearACasa } from "../src/semente.js";
import { mapaDaCriacao, mapaDaCampanhaNova, espinhaNaRegiao } from "../src/regiao.js";
import { estenderEspinha } from "../src/saga.js";
import { guildasDoMundo } from "../src/guildas.js";
import { criarNPC } from "../src/npcs.js";
import { montarGrade } from "../src/grid.js";
import { MOLDE_PADRAO } from "../src/moldes.js";
import { garantirPrometido, guardarSementes } from "../src/prometido.js";
import { LUTA_SEM_PAINEL } from "../src/agressao.js";
import { chegouAteEle } from "../src/antagonista.js";

export const N_CASOS = 275;
export const AMOSTRA = 3;
const copia = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
export const sha = (x) => createHash("sha256").update(typeof x === "string" ? x : JSON.stringify(x === undefined ? "∅undefined" : x)).digest("hex").slice(0, 16);
export const lerODourado = () => JSON.parse(fs.readFileSync(new URL("./pauta-dourado.json", import.meta.url), "utf8"));

/* ---------------- os módulos que o recorte importa ---------------- */
export async function osModulos(imports) {
  const o = {}, cache = {};
  for (const [local, { de, nome }] of Object.entries(imports)) {
    const m = cache[de] || (cache[de] = await import(new URL("../src/" + de.replace(/^\.\//, ""), import.meta.url)));
    if (nome === "*") o[local] = m;
    else { if (!(nome in m)) throw new Error(`${de} não exporta ${nome}`); o[local] = m[nome]; }
  }
  return o;
}

/* o valor de partida de cada ref (o argumento do useRef do App), avaliado com os módulos */
export function osPadroes(dourado, mods) {
  const o = {};
  for (const [ref, info] of Object.entries(dourado.refs)) o[ref] = () => new Function("M", `with (M) { return (${info.padrao}); }`)(mods);
  return o;
}

/* ---------------- o recorte, compilado ---------------- */
export function compilarORecorte(dourado, trocas = []) {
  let corpo = dourado.recortes.map((r) => r.texto).join("\n");
  for (const [de, para] of trocas) {
    const n = corpo.split(de).length - 1;
    if (n !== 1) throw new Error(`a mordida bate ${n} vezes: ${de.slice(0, 70)}`);
    corpo = corpo.replace(de, para);
  }
  return new Function("S", `with (S) {\n${corpo}\nreturn pautaDoTurno;\n}`);
}

/* ---------------- os casos ---------------- */
const SESSOES = ["s8", "s9", "s10"].map((s) => JSON.parse(fs.readFileSync(new URL(`./sessao-${s}.json`, import.meta.url), "utf8")));
const GRAVADOS = SESSOES.flatMap((arq) => arq.turnos.map((t, n) => ({ arq, n, frase: String(((t || {}).entrada || {}).frase || "") })));
export const N_GRAVADOS = GRAVADOS.length;

const GENEROS = ["Fantasia medieval", "Horror cósmico", "Steampunk", "Fantasia medieval", "Pós-apocalíptico", "Fantasia medieval"];
const MUNDOS = [];
function oMundo(w) {
  if (MUNDOS[w]) return MUNDOS[w];
  const genero = GENEROS[w % GENEROS.length], nomeCampanha = ["Sal", "Cinza", "Vapor", "Corvo", "Pó", "Ferro"][w % 6];
  const semente = `${nomeCampanha}|${genero}`;
  const mundo = { genero, molde: MOLDE_PADRAO, lexico: null, estrutura: "jornada" };
  const geo = mapaDaCriacao({ semente, molde: MOLDE_PADRAO, genero, lex: null, estrutura: "jornada", modo: w % 2 ? "historia" : "rapida" });
  const mapa = mapaDaCampanhaNova(geo);
  if (w === 0 && mapa.cidades[0]) mapa.cidades[0] = { ...mapa.cidades[0], relacao: "jogador" };
  const cidade = (mapa.cidades[0] || {}).nome || "";
  let espinha = estenderEspinha({ semente, mapa, genero, molde: MOLDE_PADRAO, lex: null, estrutura: "jornada", cidadeInicial: cidade, antecedente: w % 3 ? "orfao" : "", dia: 1 });
  if (mapa.regiao) espinha = espinhaNaRegiao(mapa, espinha, { semente, genero, molde: MOLDE_PADRAO, lex: null });
  const guildas = guildasDoMundo(semente, mapa, genero, null);
  return (MUNDOS[w] = copia({ mundo, nomeCampanha, mapa, cidade, espinha, guildas }));
}

const FRASES = [
  "vou à taverna e peço uma caneca", "quanto custa uma espada aqui?", "ataco o lobo com a espada", "pergunto a Doran o que ele sabe do forte",
  "procuro trabalho na praça", "subo para o quarto e durmo", "[MOVIMENTO — REGISTRADO] o herói chega à praça", "tento convencer o guarda a me deixar passar",
  "examino a sala à procura de armadilhas", "quem manda nesta cidade?", "compro duas rações e uma tocha", "conto a Ilka o segredo do forte erguido sobre a cripta",
  "fujo pela porta dos fundos", "rezo no templo", "", "sigo viagem para o norte",
];
const NOMES = ["Doran o Manco", "Ilka", "Sava", "Hilda", "Brannoc da Foz", "Wystan Pedra"];
const GRUPOS = [[], [{ nome: "Ilka", vida: 9, vidaMax: 12, classe: "Ladino", vinculo: 40, nivel: 2 }],
  [{ nome: "Brás", vida: 0, vidaMax: 15, classe: "Clérigo", vinculo: 80 }, { nome: "Lua", vida: 8, vidaMax: 8, classe: "Mago", vinculo: 10 }],
  [{ nome: "Fera Chamada", invocada: true, vida: 3, vidaMax: 3 }, { nome: "Ilka", vida: 12, vidaMax: 12, classe: "Bardo" }]];

function oVivo(i, cidade, w) {
  const luta = i % 5 === 2;
  const masmorra = i % 7 === 3 ? { nome: "a Cripta do Corvo", salas: [{ id: 1, tipo: "entrada", saidas: [2] }, { id: 2, tipo: "combate", saidas: [1, 3] }, { id: 3, tipo: "chefe", saidas: [2] }], atual: 1 + (i % 3), tochas: i % 2, encerrada: i % 14 === 10 } : null;
  const estrada = i % 9 === 4;
  const npcs = {};
  NOMES.slice(0, i % 7).forEach((n, k) => { npcs[n] = criarNPC(n, { papel: ["ferreiro", "taverneira", "guarda", "ladra", "pescador", "capitã"][k], local: k % 3 ? cidade : "", ultimaVez: 1, conhecidoEm: 1, ...(k === 4 && i % 3 === 0 ? { status: "morto" } : {}) }); });
  const rodada = 2 + (i % 3);
  return {
    npcs, cidadeAtual: estrada ? "" : cidade,
    jornada: estrada ? { de: cidade, para: "Agulha de Sal", dias: 3, feitos: 1 } : null,
    masmorra,
    combate: luta ? { rodada, heroi: { x: 2, y: 3 }, aliados: [], tochaDoHeroi: i % 4 === 2,
      grade: montarGrade({ local: masmorra ? "uma cripta" : "a praça" }),
      inimigos: [{ nome: "Lobo Grande", vida: 5 + (i % 4), vidaMax: 12, x: 4, y: 3, ameaca: "comum" }, { nome: "Vespa de Cinza", vida: 0, vidaMax: 6, derrotado: true, x: 1, y: 1 }, ...(i % 3 ? [{ nome: "Ogro do Vau", vida: 20, vidaMax: 20, x: 6, y: 5, ameaca: "elite", luz: "tocha" }] : [])] } : null,
    golpesDaRodada: luta && i % 2 ? { rodada: rodada - 1, golpes: [{ quem: "Lobo Grande", golpe: "mordida", alvo: "jogador", dano: 3 }] } : null,
    lugar: i % 4 === 1 ? { nome: "a taverna do Corvo", distancia: "dentro" } : i % 4 === 3 ? { nome: "o moinho velho", distancia: "arredores" } : null,
    clima: [{ rotulo: "chuva fina" }, null, { rotulo: "neblina" }][i % 3],
    dia: 1 + (i % 40), minuto: (i * 97) % 1440, acampado: i % 17 === 8, sitio: i % 17 === 8 ? { nome: "a clareira" } : null,
    nemesis: i % 3 === 0 ? { nome: "Morvane, a Viúva do Sal", arquetipo: "tirano", corpo: "pessoa", conhecido: i % 2 === 0, marcas: [cidade], passo: i % 4 } : null,
    vilaoAgiu: i % 6 === 0 ? -99 : (1 + (i % 40)) - 2,
    missoes: i % 8 === 0 ? [] : [{ id: "m1", titulo: "O que a Guarnição guarda", tipo: "principal", dador: "Doran o Manco", descricao: "descobrir o que o forte esconde", status: "ativa", etapas: [{ tipo: "falar_com", alvo: "Doran o Manco", feito: false }, { tipo: "ir_a", alvo: "Agulha de Sal", feito: false }], prazo: 0, nivel: 1, criadaEm: 1 }],
    lei: i % 6 === 2 ? { versao: 1, porCidade: { [cidade]: { vitima: "Hilda", gravidade: "ferir", desde: 1, ate: 99, recompensa: 20, testemunhas: ["Doran o Manco"] } } } : undefined,
    registro: i % 4 === 0 ? [] : [{ t: 1, dia: 1, peso: 2, oQue: "o herói salvou Ilka da forca", quem: ["Ilka"], onde: cidade }, { t: 2, dia: 2, peso: 3, oQue: "Doran contou o segredo do forte", quem: ["Doran o Manco"], onde: cidade }],
    mensagens: [{ autor: "jogador", texto: "olá" }, { autor: "mestre", texto: `A praça de ${cidade} ferve. ${NOMES[i % NOMES.length]} acena para você, e Ilka observa de longe.` }, ...(i % 2 ? [{ autor: "mestre", texto: "Doran o Manco ergue a caneca e conta do forte." }] : [])],
    prometido: i % 4 === 3 ? guardarSementes(garantirPrometido(null), [{ tipo: "frase", texto: "voltarei com a cura para a menina", quem: "Doran o Manco" }]).estado : undefined,
    escuta: { semAvanco: i % 9 },
    contadores: { pedidosRecusados: i % 2, fugas: i % 5 === 0 ? 1 : 0, poupados: i % 3, inimigosDerrotados: i % 4, contratos: i % 2 },
    turnoDeRegistro: i % 30,
    modo: i % 37 === 11 ? "rapida" : "historia",
    noite: i % 37 === 11 ? { prato: "torneio" } : null,
    torneio: i % 37 === 11 ? { rodada: 1, chave: [["Vera", "Rival"]], rival: { nome: "Ser Brando" } } : null,
    mercado: { comprados: {}, ambulante: estrada && i % 2 ? { id: "amb", tipo: "ambulante", nome: "a carroça", estoque: [{ nome: "corda", preco: 3 }], trecho: `${cidade}>Agulha de Sal` } : null, pressoes: {}, gastos: {}, pechinchas: {} },
    governos: w === 0 ? { [cidade]: { decisoes: { imposto: "alto" } } } : {},
    reino: w === 0 ? { [cidade]: { felicidade: 40 + (i % 50) } } : {},
    historia: { estrutura: "jornada", etapa: i % 3 },
    atoDoTurno: ["nada", "paguei", "ignorei", "ataquei"][i % 4],
    aliados: i % 5 === 1 ? { Ilka: { nome: "Ilka", vontade: "vinganca", etapa: 1, parada: 20, codigos: ["nao_mata_inocente"], calado: 4, cruzou: i % 10 === 1 ? 4 : 0 } } : {},
    /* o que chegou até a ameaça: sem isto ela nunca responde (podeResponder) */
    saber: i % 3 === 0 && i % 2 === 0 ? chegouAteEle([], { o: "o herói salvou Ilka da forca", fonte: "marca", dia: 1, sobre: "Ilka" }) : [],
  };
}

/* o eco, os bilhetes e os soltos: o que o save não leva, variado por índice */
function osDeFora(i) {
  return {
    sinoDoTurno: i % 6 === 1 ? "O sino da torre bate três vezes, e ainda não é a hora." : "",
    naoPodeDoTurno: i % 7 === 1 ? [LUTA_SEM_PAINEL.veto, "Não entregue a espada que a bolsa não pagou."] : [],
    crimeDoTurno: i % 8 === 5 ? { acabou: ["[CRIME] Dois guardas viram o golpe na praça."], naoPode: ["Não deixe o herói sair pela porta da frente."] } : null,
    vetosDoJuiz: i % 6 === 4 ? [{ linha: "O ferreiro cobra 12 moedas, não 30.", turno: i % 30, ate: (i % 30) + 3, toques: ["ferreiro"] }] : [],
    coracaoFala: i % 10 === 3 ? { linha: "QUEM CARREGA: Ilka decide ficar, e diz porquê.", secao: i % 20 === 3 ? "pergunta" : "coracao", proprio: i % 4 === 3 } : null,
    quemE: i % 3 === 1 ? { ultimas: { Ilka: (i % 30) - 2 }, cenas: { Ilka: 2 } } : undefined,
    fecho: ["", "pergunta", "gancho", "silencio"][i % 4],
    interprete: i % 9 === 2 ? { linhas: ["Doran o Manco baixa a voz e olha a porta."], marcas: [] } : null,
    falasDoTurno: i % 5 === 1 ? [{ nome: "Doran o Manco", fala: "— O forte não é o que parece." }] : [],
    propositosDoTurno: i % 11 === 6 ? [{ envelope: "[PROPÓSITO CUMPRIDO] A ponte foi reerguida." }] : [],
    fatosDoPeso: i % 13 === 7 ? { npcQueridoMorto: true } : i % 13 === 8 ? { traicaoRevelada: true } : {},
    golpeFinalEnvelope: i % 5 === 2 && i % 4 === 0 ? { acabou: ["A espada atravessa o Lobo Grande, que tomba sem fôlego."], naoPode: ["O Lobo Grande não se levanta."] } : null,
    intencao: i % 4 === 0 ? "" : "cercar",
    nota: i % 2 ? "[NOTA DE ANTES]" : "",
    ultimaAcao: "",
  };
}

/* OS CASOS DE COBERTURA: a base (um sintético, com o mundo inteiro), e o
   que acende a secção. ENTRETANTO lê `elenco.feitos` (elenco.js,
   foraDeCenaParaPauta: o feito de até FORA_DE_CENA.naPauta.dias atrás, na
   cidade da cena ou de quem está nela); O QUE VOLTA, `prometido` com a
   semente madura e o Livro sem cobrar há RITMO_DO_PROMETIDO.intervalo
   turnos (prometido.js, cobrarNoTurno), fora da luta e com frase do
   jogador que não pergunta. */
const FEITOS = ["vendeu o barco no cais e partiu sem dizer para onde", "brigou com a guarda na porta do forte", "pagou a dívida do irmão com prata que ninguém sabe de onde veio"];
const PROMESSAS = [{ tipo: "frase", texto: "voltarei com a cura para a menina", quem: "Doran o Manco" }, { tipo: "volta", texto: "volto antes da lua cheia com o mapa", quem: "Ilka" }, { tipo: "objeto", texto: "a caixa de cobre que ninguém consegue abrir", quem: "" }];
/* as bases: sintéticos com cidade (fora da estrada), fora da luta, do lixo e da Noite */
const BASES_DA_COBERTURA = Array.from({ length: 79 }, (_, n) => 194 + n).filter((i) => i % 9 !== 4 && i % 41 !== 9 && i % 37 !== 11 && i % 5 !== 2).filter((_, n) => n % 4 === 0);
const COBERTURA = [
  ...[0, 1, 2, 3, 4, 5].map((j) => ({ base: BASES_DA_COBERTURA[j], o: "entretanto", frase: ["Vou até a taverna.", "Ando pela praça e escuto o que se diz."][j % 2], estado: (k) => {
    const dia = Number(k.estado.dia) || 5, cidade = k.estado.cidadeAtual || "";
    return { combate: null, masmorra: null, jornada: null, cidadeAtual: cidade, dia,
      elenco: { feitos: [{ dia: dia - (j % 2), quem: NOMES[j % NOMES.length], cidade, passo: "fora", o: `${NOMES[j % NOMES.length]} ${FEITOS[j % FEITOS.length]}` }] } };
  } })),
  ...[0, 1, 2, 3, 4, 5].map((j) => ({ base: BASES_DA_COBERTURA[6 + j], o: "o que volta", frase: ["Vou até a taverna.", "Sento perto do fogo e peço pão."][j % 2], estado: () => {
    const plantado = guardarSementes(garantirPrometido(null), [PROMESSAS[j % PROMESSAS.length]]).estado;
    return { combate: null, modo: "historia", noite: null, prometido: { ...plantado, turno: 6 + j, ultima: 0 } };
  } })),
];
export const N_COBERTURA = COBERTURA.length;
/* todos os casos da prova da pauta: os 275 e os de cobertura */
export const N_DA_PAUTA = N_CASOS + N_COBERTURA;

export function casoDaPauta(i) {
  if (i >= N_CASOS && i < N_DA_PAUTA) {
    const m = COBERTURA[i - N_CASOS];
    const k = casoDaPauta(m.base);
    return { ...k, i, cobertura: m.o, frase: m.frase, estado: copia({ ...k.estado, ...m.estado(k), ultimaAcao: m.frase }) };
  }
  let estado, frase;
  if (i < N_GRAVADOS) {
    const g = GRAVADOS[i];
    /* o campo nulo do save gravado fica de fora: o load do App põe ali o
       valor de partida (`contadores: null` não chega ao `contRef`) */
    estado = Object.fromEntries(Object.entries(copia(estadoNoTurno(g.arq, g.n))).filter(([, v]) => v != null));
    frase = g.frase;
    if (i % 2) {
      const W = oMundo(i % 6);
      const vivo = oVivo(i, W.cidade, i % 6);
      estado = { ...estado, mundo: W.mundo, nomeCampanha: W.nomeCampanha, mapa: W.mapa, espinha: W.espinha, guildas: W.guildas,
        ...Object.fromEntries(Object.entries(vivo).filter(([k]) => !["npcs", "mensagens"].includes(k))), npcs: { ...vivo.npcs, ...(estado.npcs || {}) } };
    }
  } else {
    const W = oMundo(i % 6);
    estado = { personagem: null, mundo: W.mundo, nomeCampanha: W.nomeCampanha, mapa: W.mapa, espinha: W.espinha, guildas: W.guildas, ...oVivo(i, W.cidade, i % 6) };
    frase = FRASES[i % FRASES.length];
  }
  const p0 = estado.personagem || {};
  estado.personagem = { nome: p0.nome || "Vera Sal", classe: p0.classe || ["Guerreiro", "Mago", "Clérigo", "Ladino"][i % 4], nivel: p0.nivel || 1 + (i % 12),
    vida: p0.vida != null ? p0.vida : 6 + (i % 20), vidaMax: p0.vidaMax || 24, moedas: p0.moedas != null ? p0.moedas : (i * 37) % 400,
    ...p0, grupo: Array.isArray(p0.grupo) && p0.grupo.length ? p0.grupo : GRUPOS[i % GRUPOS.length],
    suprimentos: { tochas: i % 3, racoes: 2, kit: i % 2 === 0 }, antecedente: p0.antecedente || (i % 3 ? "orfao" : "") };
  const fora = osDeFora(i);
  for (const [k, v] of Object.entries(fora)) if (v !== undefined) estado[k] = v;
  estado.ultimaAcao = frase;
  /* o estado React do render: o mesmo do save (como no App), e de vez em quando o de um render velho */
  const render = { personagem: estado.personagem, mundo: estado.mundo, nomeCampanha: estado.nomeCampanha, mercado: estado.mercado, governos: estado.governos };
  if (i % 19 === 7) render.personagem = { ...estado.personagem, nivel: 1, grupo: [] };
  /* o lixo: a ficha de grupo torto (é ela que faz calar nove sítios), o lugar que é número, o clima que é texto, a luta torta, os golpes tortos */
  if (i % 41 === 9) Object.assign(estado, { lugar: 42, clima: "torto", golpesDaRodada: { rodada: "x", golpes: "nada" }, combate: estado.combate ? { ...estado.combate, inimigos: "x", heroi: 5 } : null, personagem: { ...estado.personagem, grupo: { torto: true } }, registro: [null, 3], escuta: "torta", espinha: { atos: "torto", fio: 7 }, mundo: { genero: 5, lexico: "torto" }, prometido: { sementes: "torto" }, coracao: 9 });
  if (i === N_CASOS - 1) return { i, frase: undefined, estado: { mapa: { cidades: [] } }, render: {} };
  if (i === N_CASOS - 2) return { i, frase: null, estado: {}, render: {} };
  return { i, frase, estado: copia(estado), render: copia(render) };
}
export const casosDaPauta = () => Array.from({ length: N_DA_PAUTA }, (_, i) => casoDaPauta(i));

/* ---------------- correr um lado ---------------- */
const fotoDosRefs = (valores) => Object.fromEntries(Object.keys(valores).sort().map((k) => [k, sha(valores[k])]));

/* o recorte: refs de verdade, um escopo que acusa o nome sem dublê */
export function correrORecorte(fabrica, k, dourado, mods, padroes) {
  const log = { portas: [], faltas: [] };
  const S = { ...mods };
  const campoDe = {};
  for (const [ref, info] of Object.entries(dourado.refs)) {
    campoDe[ref] = info.campo;
    S[ref] = { current: k.estado[info.campo] !== undefined ? copia(k.estado[info.campo]) : padroes[ref]() };
  }
  const valores = () => Object.fromEntries(Object.entries(campoDe).map(([ref, c]) => [c, S[ref].current]));
  for (const n of dourado.render) if (n !== "setPersonagem") S[n] = copia(n in k.render ? k.render[n] : k.estado[n]);
  S.setPersonagem = (v) => { log.portas.push(["setPersonagem", sha(v)]); };
  S.calou = (onde) => { log.portas.push(["calou", onde]); return []; };
  S.pushMsgs = (novas) => { log.portas.push(["pushMsgs", sha(novas), sha(fotoDosRefs(valores()))]); S.mensagensRef.current = [...(S.mensagensRef.current || []), ...(novas || [])]; };
  const escopo = new Proxy(S, {
    has: (t, nome) => { if (typeof nome !== "string") return false; if (nome in t) return true; if (nome in globalThis) return false; log.faltas.push(nome); return true; },
    get: (t, nome) => { if (nome === Symbol.unscopables) return undefined; if (nome in t) return t[nome]; throw new ReferenceError("falta o dublê: " + String(nome)); },
    set: (t, nome, v) => { t[nome] = v; return true; },
  });
  semearACasa("pauta|" + k.i);
  let p = null, erro = null;
  try { p = fabrica(escopo)(k.frase); } catch (e) { erro = String(e && e.message); }
  const fim = valores();
  return { p, erro, valores: fim, log, turno: (Number(fim.turnoDeRegistro) || 0) + 1 };
}

/* a peça: o estado do caso, as mesmas portas, e o "App" que o aplicar escreve */
export function correrAPeca(peca, k, dourado, padroes) {
  const log = { portas: [], faltas: [], aplicar: [] };
  let loja = {};
  for (const [ref, info] of Object.entries(dourado.refs)) loja[info.campo] = k.estado[info.campo] !== undefined ? copia(k.estado[info.campo]) : padroes[ref]();
  const estado = { ...copia(k.estado), render: copia(k.render) };
  const portas = {
    setPersonagem: (v) => { log.portas.push(["setPersonagem", sha(v)]); },
    calou: (onde) => { log.portas.push(["calou", onde]); },
    pushMsgs: (novas) => { log.portas.push(["pushMsgs", sha(novas), sha(fotoDosRefs(loja))]); loja = { ...loja, mensagens: [...(loja.mensagens || []), ...(novas || [])] }; },
    aplicar: (x) => { log.aplicar.push(Object.keys(x)); loja = { ...loja, ...x }; },
  };
  semearACasa("pauta|" + k.i);
  let p = null, erro = null, r = null;
  try { r = peca(estado, { frase: k.frase }, portas); p = r.pauta; } catch (e) { erro = String(e && e.message); }
  return { p, erro, valores: loja, log, turno: (Number(loja.turnoDeRegistro) || 0) + 1, ret: r, estado };
}

/* A FOTO: o texto que vai ao Narrador, a pauta, os refs do fim, as portas */
export function fotoDaPauta(f) {
  let texto = null;
  try { texto = f.p ? textoDaPauta(f.p, { turno: f.turno }) : null; } catch (e) { texto = "∅" + String(e && e.message); }
  return { texto, pauta: sha(f.p), refs: fotoDosRefs(f.valores), portas: f.log.portas, erro: f.erro, faltas: [...new Set(f.log.faltas)],
    /* fora da comparação: o que a suíte ainda quer olhar */
    pautaObj: f.p, ret: f.ret || null, aplicados: (f.log.aplicar || []).flat() };
}
/* a foto que o dourado guarda: o texto por impressão digital (e inteiro nos primeiros), os refs juntos */
export function fotoGuardada(foto, i) {
  return { texto: sha(foto.texto), tam: foto.texto == null ? -1 : foto.texto.length, ...(i < AMOSTRA ? { inteiro: foto.texto } : {}),
    pauta: foto.pauta, refs: sha(foto.refs), portas: sha(foto.portas), nPortas: foto.portas.length, erro: foto.erro, faltas: foto.faltas };
}
export const mesmaFoto = (a, b) => a.texto === b.texto && a.pauta === b.pauta && a.refs === b.refs && a.portas === b.portas && a.erro === b.erro && JSON.stringify(a.faltas) === JSON.stringify(b.faltas);

/* corre os casos de um lado (o recorte, mordido ou não, ou a peça) */
export async function correrOsCasos(dourado, { lado = "recorte", trocas = [], peca = null, casos = casosDaPauta() } = {}) {
  const mods = await osModulos(dourado.imports);
  const padroes = osPadroes(dourado, mods);
  const fabrica = lado === "recorte" ? compilarORecorte(dourado, trocas) : null;
  return casos.map((k) => fotoDaPauta(lado === "recorte" ? correrORecorte(fabrica, k, dourado, mods, padroes) : correrAPeca(peca, k, dourado, padroes)));
}
