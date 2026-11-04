/* ============================================================
   O PAGAMENTO DA FRASE (04/11/2026, a 2.ª leva da proposta) — src/motor/o-pagamento-da-frase.js

   «Pago a sopa» não cobrou (14.ª T5, 15 → 15); «Pago um quarto comum…
   durmo» dormiu de graça (14.ª T9, 15.ª T3); «Ponho duas moedas no balcão
   pela caneca» nem foi visto (16.ª T4). A cobrança lia a PROSA do Narrador
   (cobranca.js, oQueFaltaDebitar) — e no modo ator nada entra pela prosa.
   O pagamento passa a ser da frase do jogador, e o App propõe-o
   (a-proposta-da-frase.js): «Pagar a caneca · ◉ 1» → o botão → a bolsa.

   O PREÇO SAI DAS TABELAS QUE JÁ EXISTEM: a quantia dita («duas moedas»)
   pelos números da cobrança (`NUMERO_POR_EXTENSO`) e a palavra da moeda do
   mundo (`raizDaMoeda`) — a régua `lerGastos` é da prosa, e não conhece «ponho»; o que se pede numa taverna pelos
   preços comuns do cenário (`PRECOS_COMUNS`, `precoComum`, com o fator do
   porte da cidade); o quarto pelo pouso da cidade (cidade-por-dentro.js,
   `pouso.comum`/`pouso.bom`). A quantia dita ganha: é o que o herói pôs na
   mesa.

     oPagamentoDaFrase(frase, { fator, pouso, moeda }) →
       null | { itens: [{ nome, quantos, preco }], total, dito }
       dito: true quando a quantia veio da frase («duas moedas»); então há um
             item só, com o nome do que se paga («caneca») ou vazio

   Puro, sem React. Provado em `testes/teste-o-pagamento-da-frase.mjs`.
   ============================================================ */
import { NUMERO_POR_EXTENSO, raizDaMoeda } from "../cobranca.js";
import { PRECOS_COMUNS, precoComum } from "../economia.js";

const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);

export const O_PAGAMENTO_DA_FRASE = Object.freeze({
  /* o herói é quem paga: a primeira pessoa (o «ele paga» da prosa não é meu) */
  verbo: /\b(pago|pagamos|pagarei|ponho|pomos|deixo|deixamos|dou|damos|entrego|entregamos|pus|paguei)\b/,
  /* o que não é pagar: a negação, a pergunta, o desejo */
  naoE: /\b(nao (pago|ponho|dou|deixo|entrego)|quanto (custa|e|fica)|posso pagar|vou pagar depois|pago depois)\b/,
  /* o quarto: pelo pouso da cidade */
  quarto: /\b(quartos?|pernoite|cama para a noite|uma noite)\b/,
  quartoBom: /\b(quarto (bom|melhor|bons)|melhor quarto)\b/,
  nomes: Object.freeze({ comum: "quarto comum", bom: "quarto bom" }),
  /* quantas palavras antes da coisa contam para «duas canecas» */
  janelaDaQuantia: 2,
});

function quantosAntes(t, idx) {
  const antes = t.slice(0, idx).trim().split(/\s+/).slice(-O_PAGAMENTO_DA_FRASE.janelaDaQuantia);
  for (let i = antes.length - 1; i >= 0; i--) {
    const w = antes[i];
    if (/^\d{1,3}$/.test(w)) return Number(w);
    if (NUMERO_POR_EXTENSO[w] != null && NUMERO_POR_EXTENSO[w] > 1) return NUMERO_POR_EXTENSO[w];
  }
  return 1;
}

export function oPagamentoDaFrase(frase, ctx) {
  const t = sem(frase);
  const P = O_PAGAMENTO_DA_FRASE;
  if (!t.trim() || t.trimStart().startsWith("[") || !P.verbo.test(t) || P.naoE.test(t)) return null;
  const c = ehObj(ctx) ? ctx : {};
  /* a quantia dita ganha: é o que o herói pôs na mesa */
  let dito = 0;
  try {
    let raiz = "";
    try { raiz = sem(raizDaMoeda(str(c.moeda)) || ""); } catch { raiz = ""; }
    /* raizDaMoeda já devolve a raiz com o plural («escamas?») */
    const nomes = ["moedas?", "cobres?", "pratas?", "ouros?", "pecas?", raiz].filter(Boolean).join("|");
    const ext = Object.keys(NUMERO_POR_EXTENSO).sort((a, b) => b.length - a.length).join("|");
    const m = t.match(new RegExp("(?:◉\\s*(\\d{1,4})|\\b(\\d{1,4}|" + ext + ")\\s+(?:" + nomes + ")\\b)"));
    if (m) dito = m[1] ? Number(m[1]) : /^\d+$/.test(m[2]) ? Number(m[2]) : NUMERO_POR_EXTENSO[m[2]] || 0;
  } catch { dito = 0; }
  const itens = [];
  const pouso = ehObj(c.pouso) ? c.pouso : null;
  const mq = t.match(P.quarto);
  if (mq && pouso) {
    const bom = P.quartoBom.test(t) && Number(pouso.bom) > 0;
    const preco = Number(bom ? pouso.bom : pouso.comum);
    if (preco > 0) itens.push({ nome: bom ? P.nomes.bom : P.nomes.comum, quantos: 1, preco });
  }
  for (const p of PRECOS_COMUNS) {
    if (!p || !(p.rx instanceof RegExp)) continue;
    const m = t.match(p.rx);
    if (!m) continue;
    const preco = precoComum(p.id, c.fator);
    if (!(preco > 0)) continue;
    const quantos = quantosAntes(t, m.index);
    itens.push({ nome: p.curto || p.nome, quantos, preco: preco * quantos });
  }
  /* a quantia dita ganha: é o que o herói pôs na mesa — e a coisa, quando a
     frase a diz, é pelo que paga («pela caneca») */
  if (dito > 0) return { itens: [{ nome: itens.map((x) => x.nome).join(", "), quantos: 1, preco: dito }], total: dito, dito: true };
  if (!itens.length) return null;
  return { itens, total: itens.reduce((n, x) => n + x.preco, 0), dito: false };
}
