/* combate-casos.mjs (Fase T1-A, 5.ª fatia, 28/10/2026) — os casos da prova dos órgãos do combate

   Os mesmos casos alimentam dois lados: `gerar-combate-dourado.mjs`, que
   corre cada órgão do App de ANTES (lido do git) e grava o que ele produziu
   em `combate-dourado.json`; e `teste-motor-combate.mjs`, que corre a peça
   pura de `src/motor/combate-do-turno.js` sobre os mesmos casos e exige o
   mesmo, byte a byte.

   Os casos variam de forma determinista pelo índice (sem Math.random), para
   que cada ramo de cada órgão seja percorrido muitas vezes: o nível do
   herói, as habilidades que já tem, quem caiu e de que ameaça, a semente do
   mundo e o instante do turno (que mudam a sorte). A sorte de cada caso é a
   do App: `sorteNoPonto` com a semente e o ponto do caso, a contagem a
   começar vazia.

   Cada órgão novo acrescenta aqui só os campos que lê; os que já estavam
   não mudam, e o dourado dos órgãos de antes continua o mesmo. */
import { createHash } from "node:crypto";
import { sorteNoPonto, CONTAGEM_VAZIA, pontoDaSorte } from "../src/motor/sorte-do-turno.js";

export const N_CASOS = 275;

/* o instante parado da prova: iniciarRito carimba o rito com Date.now(), e
   o dourado tem de ser o mesmo em qualquer corrida (os dois lados param o
   relógio neste número antes de correr) */
export const AGORA_DA_PROVA = 1790000000000;

const AMEACAS = ["fraco", "comum", "competente", "elite", "lendario"];
const NOMES = ["Ogro do Vau", "Vespa de Cinza", "Cavaleiro Sem Rosto", "Bruxa da Turfa", "Lobo Grande", "Sentinela de Bronze", "Dragão Velho"];
const HABS = [[], [{ nome: "Golpe Duplo" }], [{ nome: "Fúria" }, { nome: "Golpe Duplo" }], [{ nome: "Lâmina de Vento" }]];

const ALVOS = (fins) => [(fins[0] || {}).nome, "Corvo", "Bandido do Corvo", "a cabeça de Sarna, a Víbora", "  ", "corvo", "Bruna Ferro", "Cavaleiro Sem Rosto"];

function masmorraDoCaso(i) {
  const tipo = i % 6;
  if (tipo === 0) return null;
  const nome = ["Cripta do Corvo", "Poço das Celas", "Torre Velha"][i % 3];
  const salas = [{ id: 1, tipo: "entrada" }, { id: 2, tipo: "combate" }, { id: 3, tipo: "chefe", moedas: 40 + (i % 9) * 15 }];
  if (tipo === 1) return { nome, salas, atual: 2, tochas: 1 };
  if (tipo === 2) return { nome, salas, atual: 3, tochas: 0 };
  if (tipo === 3) return { nome, salas, atual: 3, tochas: 1 + (i % 3) };
  if (tipo === 4) return { nome, salas: "torto", atual: 3, tochas: 2 };
  return { nome, salas: [{ id: 3, tipo: "chefe" }], atual: 3, tochas: -1 };
}

export function casoDoCombate(i) {
  const n = 1 + (i % 4);
  const inimigosFinais = Array.from({ length: n }, (_, k) => ({
    nome: NOMES[(i + k * 3) % NOMES.length],
    ameaca: AMEACAS[(i * 7 + k * 2) % AMEACAS.length],
    ...(k === 0 && i % 5 === 0 ? { x: 3, y: 4 } : {}),
  }));
  return {
    i,
    semente: `prova-combate-${i % 17}|${["Fantasia medieval", "Horror cósmico", "Steampunk"][i % 3]}`,
    ponto: pontoDaSorte({ dia: 1 + (i % 9), minuto: (i * 37) % 1440, falas: i % 23 }),
    notaAntes: i % 3 === 0 ? "" : `[NOTA DE ANTES ${i}] uma linha que já estava na nota.`,
    pers: {
      nome: "Vera Cinza", nivel: 1 + (i % 20), moedas: (i * 13) % 300, xp: 100 * (i % 7),
      habilidades: HABS[i % HABS.length], vida: 20, vidaMax: 30,
    },
    inimigosFinais: i % 11 === 10 ? [] : inimigosFinais,
    /* a fama (checarFama): a da última checagem, rente aos patamares, e a de agora */
    famaAntes: [0, 9, 10, 24, 25, 44, 45, 69, 70, 84, 85, 99, 100][i % 13],
    fama: [0, 9, 10, 24, 25, 44, 45, 69, 70, 84, 85, 99, 100][i % 13] + [0, 0.5, 1, 3, 12.25, 30, -2][i % 7],
    /* a masmorra (concluirMasmorraDoChefe): sem masmorra, sala que não é a
       do chefe, a do chefe com e sem tochas, e a de salas tortas; o mapa de
       região ou de continente; a base que já tinha o que concluir */
    masmorra: masmorraDoCaso(i),
    mapa: i % 2 ? { regiao: { nome: "Vale do Corvo" } } : { cidades: [] },
    base: i % 3 ? null : { concluidas: ["torre-velha"] },
    lexico: null,
    equipamento: i % 4 ? [{ nome: "Espada Curta", raridade: "comum" }] : [],
    suprimentos: i % 3 === 1 ? { racoes: 2, tochas: 1, kit: true } : null,
    essencia: i % 5,
    /* a morte de um alvo (registrarMorteDeAlvo): o registo de gente, a
       nêmesis viva, derrotada ou ausente, a lei com um crime na cidade (a
       vítima que pode cair), quem morre, por quê, e se o nome vale parecido */
    npcsM: i % 4 === 3 ? {} : { Corvo: { notas: "ferreiro da praça" }, Sarna: { status: "vivo" }, "Bruna Ferro": {}, ...(i % 2 ? { "Ogro do Vau": { notas: "" } } : {}) },
    nemesisM: [null, { nome: "Sarna", status: "ativa" }, { nome: "Sarna", status: "derrotada" }, { nome: "Cavaleiro Sem Rosto", status: "ativa" }][i % 4],
    leiM: i % 2 === 0 ? { versao: 1, porCidade: { "Vila do Sul": { vitima: i % 4 === 0 ? String(ALVOS(inimigosFinais)[i % 8] || "").trim() : "Corvo", gravidade: i % 12 === 0 ? "matar" : "ferir", desde: 1, ate: 99, recompensa: 20, testemunhas: [] } } } : null,
    alvoM: ALVOS(inimigosFinais)[i % 8],
    causaM: i % 2 ? "morto por mim em combate" : "",
    aproximadoM: i % 5 === 0 || i % 8 === 3,
    cidadeM: i % 6 === 5 ? "Porto Fundo" : "Vila do Sul",
    mapaM: { cidades: [{ nome: "Vila do Sul", porte: "vila", tipo: "cidade", bioma: "colina", regiao: "Chãs" }] },
    /* a nêmesis que surge (tentarSurgirNemesis): lê nemesisM e fama de cima;
       os contadores, o mapa com domínios e tratados, a bolsa, o fio da
       espinha e quem já caiu (que às vezes estoura, para a rede calar) */
    contN: { combatesVencidos: i % 9, elitesDerrotados: i % 3, lendariosDerrotados: i % 2, masmorrasConcluidas: i % 4, decretosCumpridos: i % 5 },
    mapaN: { cidades: [{ nome: "Vila do Sul", relacao: i % 3 ? "neutra" : "jogador" }, { nome: "Porto Fundo", relacao: i % 4 ? "jogador" : "hostil" }], faccoes: [{ nome: "Liga", tratado: ["comercio", "alianca", "guerra", null][i % 4] }, { nome: "Coroa", tratado: i % 5 ? "guerra" : "comercio" }] },
    espinhaN: i % 3 === 0 ? null : { fio: { antagonista: i % 2 ? "Morvane, a Viúva do Sal" : "a Fome do Poço" }, atos: [] },
    derrotadosN: i % 13 === 12 ? "estoura" : i % 5 === 0 ? ["Morvane"] : [],
    /* a abertura da luta (abrirCombate, 6.ª fatia): quem entra (às vezes
       ninguém, às vezes com nível, às vezes um deus do panteão), a luta que
       já estava no ref (com a economia rançosa e a rodada de outra luta), a
       ficha (classe, raça, destreza, tamanho, grupo, a sorte do traço já
       gasta), a situação (as três, nenhuma, nula, torta), o lugar da planta,
       o dia de lutas, o códex e o turno da semente da abertura */
    inimigosA: i % 10 === 7 ? null : i % 10 === 8 ? [] : inimigosFinais.map((e, k) => ({
      nome: k === 1 && i % 6 === 1 ? "Avatar de Morr" : e.nome, ameaca: e.ameaca, ...(i % 4 === 2 ? { nivel: 1 + (i % 12) } : {}),
    })),
    jaNoRefA: i % 9 === 4 || i % 23 === 11,
    combateNoRefA: i % 9 === 4
      ? { inimigos: inimigosFinais.map((e) => ({ ...e, vida: 10 + (i % 7), vidaMax: 20, des: (i % 5) - 1, derrotado: false })), rodada: 5, economia: { acao: 0, extra: 0 }, recursos: { gasto: true }, notas: "luta retomada" }
      : i % 23 === 11 ? { inimigos: [], rodada: 2 } : null,
    persA: {
      nome: "Vera Cinza", nivel: 1 + (i % 20), classe: ["Guerreiro", "Ladino", "Monge", "Mago", "Clérigo"][i % 5],
      raca: ["Humano", "Halfling", "Goliath", "Elfo", "Anão"][i % 5 === 4 ? 0 : (i * 3) % 5],
      atributos: { forca: 1, destreza: (i % 7) - 2, vigor: 1, intelecto: 0, sabedoria: 0, presenca: i % 3 },
      tamanho: i % 13 === 6 ? "grande" : undefined,
      grupo: (i % 4 === 1 ? [{ nome: "Brás", vida: 12, vidaMax: 15 }] : i % 4 === 3 ? [{ nome: "Brás", vida: 12, vidaMax: 15 }, { nome: "Lua", vida: 8, vidaMax: 8, tamanho: "pequeno" }] : []),
      tracoGastos: i % 3 === 0 ? { sorte: true, pedra: true, refazer: true } : undefined,
      seguraGasto: i % 7 === 2 ? true : undefined,
      vida: 20, vidaMax: 30,
    },
    situacaoA: ["cena", "emboscada", "declarada", undefined, null, "torta", "emboscada"][i % 7],
    panteaoA: i % 6 === 1 ? [{ nome: "Morr", gd: 4 }] : [],
    plantaA: {
      emMasmorra: i % 5 === 0, emViagem: i % 4 === 1, cidade: i % 3 ? "Vila do Sul" : "",
      lugar: i % 8 === 2 ? { tipo: "taverna", nome: "O Cão Manso" } : null,
      local: ["a praça", "a estrada velha", "uma sala de pedra", ""][i % 4],
      bioma: ["colina", "floresta", "", "pantano"][i % 4],
      /* o texto do local que estoura: uma vez (a rede cala e a planta abre
         como encontro) ou sempre (a luta não abre e o erro sobe) */
      estoura: i % 29 === 13 ? "uma vez" : i % 61 === 40 ? "sempre" : null,
    },
    diaLutaA: i % 4 === 0 ? null : { gasto: (i % 5) * 0.75, lutas: i % 3 },
    descobertasA: i % 3 === 0 ? [] : ["ogro do vau", "Lobo Grande"],
    turnoA: i % 7,
    /* o contador (bumpCont, 6.ª fatia): o campo, quanto (às vezes nada) */
    campoB: ["combatesVencidos", "inimigosDerrotados", "masmorrasConcluidas", "nemesisVencidas"][i % 4],
    nB: [1, undefined, 3, 0, 2][i % 5],
    /* o vínculo (aplicarVinculo): o grupo rente aos marcos, quem ganha, quanto, e se a linha vai ao turno ou à tela */
    grupoV: [
      { nome: "Brás", vinculo: [10, 24, 49, 74, 99, 100, undefined][i % 7], marcos: i % 3 ? [] : [25], vida: 10, vidaMax: 12 },
      ...(i % 2 ? [{ nome: "Lua", vinculo: 48, vida: 5 }] : []),
      ...(i % 5 === 0 ? [{ nome: "Fera", invocada: true, vinculo: 0, vida: 3, vidaMax: 3 }] : []),
    ],
    quemV: ["todos", "Brás", "Lua", "Ninguém"][i % 4],
    pontosV: [2, 1, 26, -5, 60][i % 5],
    noTurnoV: i % 3 !== 2,
    /* o fecho notado (notarFechoDaLuta): a luta aberta ou o fecho por fechar
       (ou nenhum), o que se diz (o retrato, o desfecho, os caídos, a linha) e
       o que a abertura de agora guardaria */
    lutaDoReciboF: i % 3 === 0 ? null : { fichaNaAbertura: { nome: "Vera", vida: 20 }, idsNoChao: ["x"], inicio: 4, ultima: { inimigos: [{ nome: "Lobo", derrotado: i % 2 === 0 }], rodada: 2 }, desfecho: i % 4 === 1 ? "fuga" : null, caidos: i % 5 ? null : ["Corvo"] },
    fechoDaLutaF: i % 6 === 0 ? { id: 3, desfecho: "encerrada", caidos: ["Lobo"], ultima: null, rodadas: 3 } : null,
    argsF: i % 11 === 10 ? undefined : {
      ...(i % 2 ? { combate: { inimigos: [{ nome: "Ogro do Vau", derrotado: true }, { nome: "Vespa de Cinza", vida: 0 }, { nome: "Fugido", vida: 0, fugiu: true }, { nome: "De Pé", vida: 4 }], rodada: i % 7 } } : {}),
      ...(i % 3 === 1 ? { desfecho: "vitoria" } : {}),
      ...(i % 4 === 2 ? { caidos: ["Ogro do Vau", null, "Bruxa da Turfa"] } : {}),
      ...(i % 9 === 4 ? { linha: "O ogro arrasta Brás para o mato." } : {}),
    },
    fichaVivaF: { nome: "Vera Cinza", vida: 10 + (i % 9) },
    chaoF: i % 4 === 0 ? null : { itens: [{ id: "a" + i }, { id: null }, null, { id: "b" }] },
    mensagensF: i % 17, seguraF: i % 3 ? null : [{}, {}],
    /* as conjurações que a luta leva (limparConjuracoesDaLuta): a forma, a
       guarda do herói e a do grupo, a pressa, as invocações; a ficha que
       vem e a do ref; e o grupo torto, que estoura */
    persL: i % 23 === 7 ? { nome: "Vera", grupo: { torto: true } } : {
      nome: "Vera", vida: 30 - (i % 9), vidaMax: 30,
      ...(i % 4 === 0 ? { forma: { id: "urso", nome: "Forma de Urso", ganho: 6, dano: 3 } } : {}),
      ...(i % 5 === 1 ? { guardas: [{ nome: "Guarda Firme", ate: 3 }] } : {}),
      ...(i % 6 === 2 ? { pressa: { nome: "Instante Roubado", ate: 2 } } : {}),
      grupo: [
        { nome: "Brás", vida: 9, ...(i % 3 === 0 ? { guardas: [{ nome: "Escudo" }] } : {}) },
        ...(i % 7 === 3 ? [{ nome: "Fera Chamada", invocada: true }, { nome: "Lobo Espírito", invocada: true }] : i % 7 === 5 ? [{ nome: "Fera Chamada", invocada: true }] : []),
        ...(i % 8 === 6 ? [null] : []),
      ],
    },
    persLNoRef: i % 13 === 4,
    /* o rito (abrirRitoAscensao): quem despertou ou não, com rito em curso
       ou não, com graus ganhos; o deus abatido; o nível dado ou o da ficha */
    divindadeR: i % 9 === 8 ? null : { ehJogador: true, despertar: i % 5 !== 3, fieis: [0, 1500, 20000, 2000000][i % 4], grausGanhos: i % 6 === 5 ? 2 : 0, ...(i % 10 === 7 ? { rito: { caminho: "deicidio", etapa: 0 } } : {}) },
    alvoR: { nome: ["Morr", "Avatar de Ilsa", "Semideus do Vau"][i % 3], gd: [1, 2, 3, 4][i % 4] },
    nivelR: i % 4 === 3 ? null : [5, 12, 16, 18, 19, 20][i % 6],
    nivelFichaR: 1 + (i % 20),
  };
}

/* A FOTO DA ABERTURA, COMPACTA. A luta aberta aparece quatro vezes na foto
   (o que o órgão devolve, o ref, o que se publica, o que a presença
   recebe), e por 275 casos isso eram 1,6 MB de dourado. Guarda-se o texto
   à vista (as linhas, a nota, o erro, o que calou) e o resto pela
   impressão digital do JSON inteiro: a comparação continua byte a byte, e
   uma divergência no texto ainda se lê no próprio dourado. */
export function fotoCompacta(foto) {
  const r = foto && foto.ret;
  return {
    msgs: r ? r.msgs : null, nota: r ? r.nota : null, erro: foto.erro, calados: foto.calados,
    tudo: createHash("sha256").update(JSON.stringify(foto)).digest("hex"),
  };
}

/* o texto do local que a planta lê, como o App: às vezes estoura (uma vez,
   ou sempre). Uma função com memória, nova por corrida. */
export function localDoCaso(caso) {
  let vezes = 0;
  return () => {
    vezes++;
    const e = caso.plantaA.estoura;
    if (e === "sempre" || (e === "uma vez" && vezes === 1)) throw new Error("o texto do local estourou");
    return caso.plantaA.local;
  };
}

/* o mundo que a lei lê quando a vítima cai (o App monta-o com sementeMundo,
   mapaRef, o léxico, o gênero, o molde, cidadeDoMapa e o dia) */
export function mundoDaLei(caso) {
  return {
    semente: caso.semente, mapa: caso.mapaM, lex: null, genero: "Fantasia medieval", molde: null,
    cidade: (caso.mapaM.cidades || []).find((c) => c.nome === caso.cidadeM) || null, dia: 1 + (caso.i % 9),
  };
}

export const casosDoCombate = () => Array.from({ length: N_CASOS }, (_, i) => casoDoCombate(i));

/* a sorte do turno de um caso, como o App a dá: uma contagem por caso */
export function sorteDoCaso(caso) {
  let contagem = CONTAGEM_VAZIA;
  return (evento) => {
    const r = sorteNoPonto(contagem, caso.semente, caso.ponto, evento);
    contagem = r.contagem;
    return r.sorte;
  };
}
