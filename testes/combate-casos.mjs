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
import { sorteNoPonto, CONTAGEM_VAZIA, pontoDaSorte } from "../src/motor/sorte-do-turno.js";

export const N_CASOS = 275;

const AMEACAS = ["fraco", "comum", "competente", "elite", "lendario"];
const NOMES = ["Ogro do Vau", "Vespa de Cinza", "Cavaleiro Sem Rosto", "Bruxa da Turfa", "Lobo Grande", "Sentinela de Bronze", "Dragão Velho"];
const HABS = [[], [{ nome: "Golpe Duplo" }], [{ nome: "Fúria" }, { nome: "Golpe Duplo" }], [{ nome: "Lâmina de Vento" }]];

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
