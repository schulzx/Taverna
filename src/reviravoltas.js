/* ============================================================
   AS REVIRAVOLTAS (v9.203) — a verdade escondida na criação

   Quinto órgão do diretor de histórias. Num sistema sem IA generativa,
   reviravolta é uma FORMA DE INVERSÃO aplicada a fatos que o jogador
   viveu. A forma diz: só nasço se tais fatos existirem; planto tais
   sementes; disparo em tal condição; e no dia seguinte o mundo muda
   assim. Eleita NA CRIAÇÃO do mundo, por semente, determinística — a
   mesma campanha tem sempre a mesma verdade escondida, e ela se prova.

   Esta é a primeira, ponta a ponta: A MÁSCARA DO ALIADO — o companheiro
   de confiança é agente do vilão. Ela não nasce do nada: o propósito
   "trair" já existe em indole.js. O que a reviravolta acrescenta é o
   que faltava para a inversão ser história, e não acidente:

     · ela é ELEITA na criação (determinística), não sorteada na hora;
     · ela SEMEIA no Livro de Promessas, ao longo do arco, os sinais que
       a preparam — e a revelação NÃO pode cair antes de eles amadurecerem
       (a catraca ① do Livro: três sementes maduras);
     · ela LIGA a traição ao VILÃO — o traidor não vende por ouro, vende
       para quem move as sombras; e o antagonista.js ganha o que o traidor
       sabia;
     · o Narrador DESCOBRE junto com o jogador: a verdade eleita nunca
       entra na pauta antes do turno da revelação. As sementes ele planta
       sem saber do que são sementes.

   ---------------- SEPARADO DO DESENHO ----------------

   Conta se prova. A eleição, o gate e o dia seguinte se provam em Node.
   O App elege uma vez, planta no Livro e revela quando a catraca deixa.
   ============================================================ */

import { hashSemente } from "./semente.js";
import { podeColher } from "./promessas.js";

/* ---------------- A ANATOMIA DE TODA FORMA ----------------
   sóNasceSe — precondições no vocabulário real (índole, vínculo, vilão).
   sementes  — 2 a 3 formas do Livro, com peso, agendadas por ato.
   revelação — a condição de FATO que a dispara (nunca opinião).
   oDiaSeguinte — o que muda no mundo, porque reviravolta sem consequência
                  é truque de salão.
   A prateleira nasce com uma; as outras 47 formas do documento entram
   uma por versão, cada uma com o consumidor e a prova juntos. */
export const FORMAS = [
  {
    id: "aliado_agente",
    familia: "mascaras",
    porte: "menor",
    nome: "O aliado é agente do vilão",
    /* só nasce se houver um companheiro/NPC com o propósito de trair e um
       vínculo que valha a pena trair — e um vilão para quem entregar */
    soNasceSe: (c) => !!c.temVilao && !!c.temAliadoTraidor,
    /* três sementes leves: regada uma vez cada, cada uma amadurece; três
       maduras satisfazem a catraca de peso PESADO (a revelação grande) */
    sementes: [
      { forma: "elogio_que_vigia", peso: "leve" },
      { forma: "generosidade_estranha", peso: "leve" },
      { forma: "selo_refeito", peso: "leve" },
    ],
    /* o peso da COLHEITA: pesado, porque vira a confiança da campanha —
       e por isso exige três maduras para poder cair */
    pesoDaColheita: "pesado",
    revela: "o companheiro em quem você confiava serve ao vilão, e o que ele soube o vilão sabe",
    /* o dia seguinte: o traidor escolhe, e o vilão ganha o dossiê */
    oDiaSeguinte: (alvo, vilao) => [
      `o vilão passa a saber o que só passou por ${alvo || "o traidor"}`,
      `${alvo || "o traidor"} escolhe diante de todos: fugir, implorar ou dobrar a aposta`,
      `a relação com ${alvo || "ele"} vira inimigo — e o grupo viu`,
    ],
  },
];

export const formaPorId = (id) => FORMAS.find((f) => f.id === id) || null;
export const PORTES = ["menor", "maior"];

/* ---------------- A ELEIÇÃO, NA CRIAÇÃO DO MUNDO ----------------
   Determinística: a mesma semente de mundo dá sempre a mesma verdade
   escondida. Uma menor e (quando houver formas maiores) uma maior, sem
   dividir o mesmo alvo. Hoje há uma forma só — então a eleição escolhe
   a menor e deixa a maior para quando a prateleira crescer.

   NÃO imprime nada em lugar visível: devolve só os ids eleitos, e a
   verdade fica aqui dentro até o turno da revelação. */
export function elegerReviravoltas(seedMundo) {
  const h = hashSemente("reviravolta|" + String(seedMundo || "aventura"));
  const menores = FORMAS.filter((f) => f.porte === "menor");
  const maiores = FORMAS.filter((f) => f.porte === "maior");
  const menor = menores.length ? menores[h % menores.length].id : null;
  const maior = maiores.length ? maiores[(h >> 8) % maiores.length].id : null;
  /* nunca a mesma forma nos dois papéis */
  return { menor, maior: maior === menor ? null : maior };
}

/* ---------------- O ESTADO DE UMA REVIRAVOLTA ELEITA ----------------
   O que o save guarda: a forma, o alvo (o traidor eleito), e se já foi
   semeada e revelada. Nasce do nada e do lixo, como todo estado desta
   casa. */
export function garantirReviravolta(r) {
  if (!r || typeof r !== "object") return null;
  const f = formaPorId(r.forma);
  if (!f) return null;
  return {
    forma: r.forma,
    alvo: typeof r.alvo === "string" ? r.alvo : "",
    semeada: !!r.semeada,
    revelada: !!r.revelada,
    eleitaEm: Math.max(0, Number(r.eleitaEm) || 0),
    /* o último dia em que uma semente foi regada: espaça as regas por
       dias, para a máscara cair no ritmo do arco e não em quatro turnos */
    regadaEm: Math.max(0, Number(r.regadaEm) || 0),
  };
}

/* quantos dias entre uma rega e outra: a reviravolta amadurece devagar,
   como um vilão — três sementes, alguns dias cada, uma revelação que
   parecia estar vindo desde sempre. Porque estava. */
export const DIAS_ENTRE_REGAS = 3;

/* ---------------- AS SEMENTES QUE ELA PLANTA ----------------
   Traduz a forma nas sementes que o Livro semeia. O App passa cada uma a
   `semear`, com dona "reviravolta" e alvo = o traidor, para que a catraca
   as conte juntas. */
export function sementesDaReviravolta(forma, { alvo = "", ato = 0, dia = 0 } = {}) {
  const f = formaPorId(forma);
  if (!f) return [];
  return f.sementes.map((s) => ({
    forma: s.forma, dona: "reviravolta", peso: s.peso, alvo, ato, dia,
    material: null,   /* o material cai para o texto da forma do Livro — concreto, sem a conclusão */
  }));
}

/* ---------------- A CATRACA DA REVELAÇÃO ----------------
   Só pode revelar quando o Livro tem sementes maduras o bastante para o
   peso da colheita — a catraca ① do Livro, aplicada à reviravolta. É o
   que impede a máscara de cair antes de ter sido preparada. */
export function podeRevelar(forma, livro, { alvo = "" } = {}) {
  const f = formaPorId(forma);
  if (!f) return false;
  return podeColher(livro, { peso: f.pesoDaColheita, dona: "reviravolta", alvo });
}

/* ---------------- O DIA SEGUINTE ----------------
   As consequências concretas, para o Narrador encenar e o sistema
   aplicar. Reviravolta sem dia seguinte é truque de salão. */
export function oDiaSeguinte(forma, { alvo = "", vilao = "" } = {}) {
  const f = formaPorId(forma);
  if (!f) return [];
  try { return f.oDiaSeguinte(alvo, vilao); } catch { return []; }
}

export function revelacaoDe(forma) { const f = formaPorId(forma); return f ? f.revela : ""; }
