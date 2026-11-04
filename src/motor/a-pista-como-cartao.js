/* ============================================================
   A PISTA COMO CARTÃO (o Narrador ator, a 16.ª sessão · 04/11/2026) — src/motor/a-pista-como-cartao.js

   A pessoa aprovou-a em 03/11 («Aprovo as duas sugestões»;
   mente/plano-narrador-ator.md, decisão 6). Na 16.ª (mente/sessao-16.md,
   caso 1) a Astrid estava em QUEM ESTÁ, com o passo seguinte no «Sabe», e o
   jogador teve de adivinhar a pergunta: «O que sabe?» não tinha palavra de
   conteúdo, a ficha disse «Não sabe responder a: «O que sabe?»», e ela pediu
   moeda em vez de dar a pista. O sistema sabia a pista e o jogador não sabia
   que a podia pedir.

   O QUE ELA SABE PASSA A SER COISA QUE SE TOCA. Com a pessoa do passo em
   cena (a-pessoa-do-passo.js: a de um `falar_com`, a pista da abertura, quem
   assinou o contrato aceite, e quem deu o passo de agora), e com um passo
   seguinte que ela sabe dizer, a soleira oferece «Perguntar a X por Y» — Y é
   o conteúdo desse passo (o sítio de um `revelar`, a pessoa de um
   `falar_com`, a coisa ou o alvo dos outros), tirado da etapa, nunca da
   prosa. O cartão nasce igual ao «Perguntar a X porquê» do pedido
   (subtramas.js, RESPOSTAS_AO_PEDIDO): `oferta` é o verbo com o objeto,
   `preco` é o veredito em mundo, e o App junta-lhe o tempo do turno, como
   junta ao do pedido. Uma ação, uma forma.

   O TOQUE é um envelope do sistema (envelopes-do-turno.js,
   `perguntaPelaPista`): diz quem, por quê, e o que a pessoa sabe. No
   `ator`, a ficha lê-o (ficha-de-ator.js, TRADUCAO_DOS_ENVELOPES): a
   pergunta é fato no ACONTECEU, e o que ela sabe é o que ela diz, em O QUE
   SE DIZ; a conversa conta (o `falar_com` cumpre-se pela porta de sempre,
   registo-da-cena.js). No `mestre`, o mesmo envelope leva o que ela sabe ao
   Narrador, que hoje não o tinha.

   O CARTÃO SOME DEPOIS DE TOCADO, e não volta para o mesmo passo: o toque
   marca a etapa perguntada (`perguntada`, missoes.js — campo novo, que a
   versão velha ignora e só viaja quando existe). O passo que vier a seguir
   é outra etapa, e traz o seu cartão.

     asPistasDoPasso(estado)  → [{ id, nome, sobre, oferta, preco, sabe, missao, etapa }]
       estado: o mesmo de aPessoaDoPasso (o do pedido, estadoDoPedido)
       id:     "pista|<missão>|<etapa>" — a etapa é a do passo perguntado
       sobre:  Y, como o mundo o diz («O Largo do Cardo»)
       sabe:   o que a pessoa responde (o «Sabe» dela, inteiro)
     perguntarPelaPista(missoes, id) → missoes novas, a etapa marcada
       (a mesma lista, a mesma referência, quando não há o que marcar)

   Sem sorte, sem prosa: tudo sai do estado. Puro, sem React. Provado em
   `testes/teste-a-pista-como-cartao.mjs`.
   ============================================================ */
import { aPessoaDoPasso } from "./a-pessoa-do-passo.js";
import { moradaDe } from "../missoes.js";
import { contrair } from "../lugar.js";

const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const limpo = (x) => str(x).replace(/\s+/g, " ").trim();
const tpl = (s, v) => str(s).replace(/\{([A-Z])\}/g, (_, k) => (v[k] != null ? v[k] : ""));

/* COMO O CARTÃO E A FICHA O DIZEM. {N} quem sabe, {Y} o objeto da pergunta
   já com a preposição («pelo Largo do Cardo»), {X} o objeto cru, {H} o
   herói, {S} o que a pessoa sabe. */
export const A_PISTA_COMO_CARTAO = Object.freeze({
  /* o verbo com o objeto, na forma do «Perguntar a {nome} porquê» */
  oferta: "Perguntar a {N} {Y}",
  por: "por {X}",
  /* o veredito antes do clique: a resposta não custa moeda (o tempo, o App
     junta-o, como ao do pedido) */
  preco: "{N} lhe diz o que sabe, sem custo",
  /* a ficha do turno do toque (ficha-de-ator.js) */
  dito: "{H} pergunta a {N} {Y}",
  /* o envelope sem o porquê (um envelope à mão, ou de outra versão) */
  semObjeto: "{H} pergunta a {N} o que sabe",
  responde: "responde a {H} com o que sabe: {S}",
  /* DE QUEM HÁ CARTÃO: a gente do passo que sabe o passo seguinte. Quem
     guarda o sítio de um `revelar` (`guarda`) não está aqui: ele guarda, não
     conta — o que o sítio esconde acha-se pelo teste (oQueOSitioEsconde) */
  de: Object.freeze(["pista", "alvo", "dador", "etapa"]),
});

/* o objeto da pergunta: o sítio de um `revelar`, o alvo dos outros */
function oSobre(et) {
  if (!ehObj(et)) return "";
  const A = limpo(et.alvo);
  if (!A) return "";
  return et.tipo === "revelar" ? limpo(moradaDe(A).lugar) || A : A;
}
const aChave = (missao, etapa) => `pista|${missao}|${etapa}`;

export function asPistasDoPasso(estado) {
  const e = ehObj(estado) ? estado : {};
  let passo = [];
  try { passo = aPessoaDoPasso(e); } catch { passo = []; }
  const ms = arr(e.missoes);
  const P = A_PISTA_COMO_CARTAO;
  const out = [];
  for (const x of arr(passo)) {
    if (!ehObj(x) || !x.aqui || !P.de.includes(x.de) || !arr(x.sabe).length) continue;
    const m = ms.find((q) => ehObj(q) && q.id === x.missao);
    const et = m && Number.isInteger(x.seguinte) ? arr(m.etapas)[x.seguinte] : null;
    if (!ehObj(et) || et.feito || et.perguntada) continue;
    const sobre = oSobre(et);
    if (!sobre) continue;
    const id = aChave(m.id, x.seguinte);
    if (out.some((c) => c.id === id)) continue;
    const Y = contrair(tpl(P.por, { X: sobre }));
    out.push({
      id, nome: x.nome, sobre,
      oferta: contrair(tpl(P.oferta, { N: x.nome, Y })),
      preco: tpl(P.preco, { N: x.nome }),
      sabe: x.sabe.join("; "),
      missao: m.id, etapa: x.seguinte,
    });
  }
  return out;
}

export function perguntarPelaPista(missoes, id) {
  if (!Array.isArray(missoes)) return missoes;
  const m = str(id).match(/^pista\|(.+)\|(\d+)$/);
  if (!m) return missoes;
  const k = Number(m[2]);
  const i = missoes.findIndex((q) => ehObj(q) && str(q.id) === m[1]);
  if (i < 0) return missoes;
  const et = arr(missoes[i].etapas)[k];
  if (!ehObj(et) || et.perguntada) return missoes;
  const etapas = missoes[i].etapas.map((x, j) => (j === k ? { ...x, perguntada: true } : x));
  return missoes.map((q, j) => (j === i ? { ...q, etapas } : q));
}
