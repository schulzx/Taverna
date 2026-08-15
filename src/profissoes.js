/* ============================================================
   PROFISSÕES (v9.44) — o ofício que aparece na conta

   O jogador disse, em duas linhas: "as profissões, que cada uma
   deve dar uma vantagem em algo para o player, mas não vi
   diferença". Ele estava certo — e o caso era pior do que parecia.
   `p.profissao` era gravada na criação, impressa na crônica e
   mandada ao Mestre com o pedido "deixe a profissão importar de
   verdade". Nada mais. Doze escolhas na tela de criação e um
   único destino: uma linha de prompt pedindo à IA que fizesse o
   trabalho que o sistema não fazia.

   Pedir ao Mestre que "deixe importar" é exatamente o oposto do
   que este projeto decidiu ser. O Mestre não tem como aplicar
   desconto num balcão que ele não vê, nem somar um componente
   numa colheita que o código já rolou. Ou a regra vira número, ou
   ela não existe — e por nove versões ela não existiu.

   Aqui vira número. O arquivo é leitor puro sobre `efeito`
   (classes.js), como tracos.js e dadivas.js: sem estado, sem
   React, uma função por pergunta que o jogo faz. Cada campo do
   vocabulário tem UM ponto de consumo, e é por isso que dá para
   ler esta lista e saber o que muda no jogo.
   ============================================================ */

import { PROFISSOES } from "./classes.js";

const NORM = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export function profissaoDe(pers) {
  const alvo = NORM(pers && pers.profissao);
  if (!alvo) return null;
  return PROFISSOES.find((p) => NORM(p.nome) === alvo) || null;
}
export function efeitoDe(pers) { const p = profissaoDe(pers); return (p && p.efeito) || {}; }
export function beneficioDe(pers) { const p = profissaoDe(pers); return (p && p.beneficio) || ""; }

/* ---------------- A BANCADA ----------------
   Devolve quanto a dificuldade CAI. Some ao modificador em vez de descer a
   dificuldade porque `forjarNaBancada` compara total contra a receita, e
   mexer no número da receita mudaria também o texto que o jogador lê. */
export function bonusDeBancada(pers, oficio) {
  const b = efeitoDe(pers).bancada;
  if (!b || typeof b !== "object") return 0;
  const alvo = NORM(oficio);
  for (const [k, v] of Object.entries(b)) if (NORM(k) === alvo || NORM(k) === "tudo") return Number(v) || 0;
  return 0;
}

/* ---------------- O ERMO ---------------- */
export function componentesExtras(pers) { return Number(efeitoDe(pers).colher) || 0; }
export function bonusDeNavegacao(pers) { return Number(efeitoDe(pers).navegar) || 0; }
export function despojosExtras(pers) { return Number(efeitoDe(pers).despojos) || 0; }

/* ---------------- O TESTE ----------------
   Só o atributo nomeado. O Escriba lê o indecifrável (Intelecto) e o
   Minerador vê o que a pedra esconde (Percepção) — nenhum dos dois fica
   melhor em persuadir por causa disso. */
export function bonusDeTeste(pers, attrId) {
  const t = efeitoDe(pers).teste;
  if (!t || typeof t !== "object" || !attrId) return 0;
  const alvo = NORM(attrId);
  for (const [k, v] of Object.entries(t)) if (NORM(k) === alvo) return Number(v) || 0;
  return 0;
}

/* ---------------- O DESCANSO ---------------- */
export function curaExtraDoHeroi(pers) { return Number(efeitoDe(pers).curaDescanso) || 0; }
export function curaExtraDoGrupo(pers) { return Number(efeitoDe(pers).curaGrupo) || 0; }

/* ---------------- O BALCÃO ----------------
   Uma função por direção, e as duas arredondam para cima: um desconto que
   some em item barato é um desconto que o jogador não acredita ter. */
export function precoDeVenda(pers, base) {
  const p = Number(efeitoDe(pers).venda) || 0;
  const v = Math.max(0, Math.round(Number(base) || 0));
  return p > 0 ? Math.ceil(v * (1 + p)) : v;
}
export function precoDeCompraPara(pers, base) {
  const p = Number(efeitoDe(pers).compra) || 0;
  const v = Math.max(0, Math.round(Number(base) || 0));
  return p > 0 ? Math.max(1, Math.floor(v * (1 - p))) : v;
}

/* ---------------- OS ESPÓLIOS ---------------- */
export function moedasDeEspolio(pers, base) {
  const p = Number(efeitoDe(pers).espolio) || 0;
  const v = Math.max(0, Math.round(Number(base) || 0));
  return p > 0 ? Math.ceil(v * (1 + p)) : v;
}

/* ---------------- O QUE O MESTRE PRECISA SABER ----------------
   A profissão e o que ela JÁ faz sozinha. A diferença entre esta linha e a
   antiga é toda: antes o prompt pedia ao Mestre que fizesse a profissão
   importar; agora ele avisa que o sistema já a fez importar, e pede só a
   ficção em cima. */
export function resumoProfissaoPrompt(pers) {
  const p = profissaoDe(pers);
  if (!p) return "";
  return `PROFISSÃO (${p.nome} — o sistema já aplica): ${p.beneficio} Os números acima saem do código sozinhos; use a profissão na FICÇÃO — o que ele repara, o que ele reconhece de olho, com quem ele fala de igual para igual —, nunca para conceder desconto, item ou informação por conta própria.`;
}

export const PROFISSOES_PROMPT = `PROFISSÃO DO HERÓI (v9.44 — o sistema aplica, você narra):
- A profissão dá uma vantagem MECÂNICA que o código já cobra sozinho: preço de balcão, colheita no ermo, dificuldade da bancada, cura de descanso, moedas de espólio. Você nunca concede nada disso e nunca anuncia número.
- O que é seu: a competência na cena. O Ferreiro vê que a dobradiça foi forjada por mão canhota; o Herborista sabe qual cogumelo cozinha e qual mata; o Mercador é reconhecido no balcão e chamado pelo nome. Isso abre PORTAS e INFORMAÇÃO, não itens nem moedas.
- Profissão não vira classe: o Alquimista não conjura, o Médico de Campo não ressuscita. Ela explica o que o herói sabe fazer com as mãos, e é o sistema que diz quanto isso rende.`;
