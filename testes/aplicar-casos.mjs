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
