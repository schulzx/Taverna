/* src/recibo-da-luta.js (Fase T1-A, 4.ª fatia, 28/10/2026) — o recibo do turno e o fim da luta

   A1 · B2 (10/10): puros, e por isso já moravam FORA do componente, no topo
   do App.jsx — a suíte `teste-a1-relato` os lia de lá como texto e os corria
   por `new Function`. Mudaram-se para cá sem mudar uma linha: a prova passa
   a importá-los e a corrê-los como corre qualquer módulo (a nota da trilha
   B, assercoes-de-texto.json, `paraOficial`).

   Dois campos NOVOS nas mensagens, que a versão antiga ignora (a ordem de
   28/09 permite campo de save novo e ignorado — um commit revertido não
   deixa nada para trás que ela não saiba ler):

   · `recibo` — SÓ na resposta do Mestre: o que a FICHA mudou entre o
     envio do turno e o fim dele (`reciboDoTurno`, glifos.js). Lê a ficha,
     nunca a frase — por isso não consegue discordar da bolsa.
   · `fimDaLuta` — na ÚLTIMA mensagem marcada `naLuta` de uma luta que
     fechou: quem caiu, quantas rodadas, o recibo da luta inteira (da ficha
     na abertura à ficha no fecho) e o desfecho.

   As duas trocas são cópias: a lista nova só difere da velha na mensagem
   marcada, e a marcada é um objeto novo. Quem não acha onde escrever
   devolve a MESMA lista — e é por identidade que o App sabe que não há
   nada a redesenhar. */

import { reciboDoTurno } from "./glifos.js";
import { GRAUS } from "./juiz.js";
import { etapaAtual, textoDaEtapa } from "./missoes.js";

/* o mesmo `calou` do App: um órgão que estoura não derruba a cena */
const calou = (onde, e) => {
  try { if (import.meta.env && import.meta.env.DEV) console.warn("[" + onde + "] calou:", e); } catch { /* fora do Vite */ }
  return [];
};

export const DESFECHOS_DA_LUTA = ["vitoria", "fuga", "queda", "encerrada", "derrota"];
/* O PORQUÊ DO FEITO NO RECIBO (13/11, a 21.ª sessão, defeito 3). O feito
   dado pelo sistema (feito-do-sistema.js, motor/aplicar.js) escreve a linha
   «✧ +17 XP — uma conversa que ficou.», e a regra de glifos.js (a morada
   `recibo` da peça 14) cala-a, porque o porquê de antes era o comentário do
   juiz («um feito de verdade»), bastidor. O chip ficava só «+17 XP» — o
   jogador via o número e não o gesto que contou. A frase agora é de mundo, e
   vai com o número: o chip de XP leva-a (`porque`, e o texto «+17 XP · uma
   conversa que ficou»). O tamanho genérico do juiz (GRAUS[*].diz) continua
   bastidor e não sobe.
     `linha`: a linha do feito, com o porquê no grupo 1; `entre`: o que
     separa o número do porquê no chip; `falado`: idem, no leitor de tela */
export const O_PORQUE_NO_RECIBO = Object.freeze({
  linha: /^✧ \+\d+ XP — (.+?)\.?$/u,
  entre: " · ",
  falado: ", ",
});
const porqueDoFeito = (lista, desde) => {
  const genericos = new Set(Object.values(GRAUS).map((g) => String(g.diz || "").trim()));
  for (let i = Math.max(0, Number(desde) || 0); i < lista.length; i++) {
    const m = lista[i];
    if (!m || m.autor !== "sistema" || typeof m.texto !== "string") continue;
    const k = m.texto.trim().match(O_PORQUE_NO_RECIBO.linha);
    const p = k ? k[1].trim() : "";
    if (p && !genericos.has(p)) return p;
  }
  return "";
};
const comOPorque = (recibo, porque) => (!porque ? recibo : recibo.map((c) => (c && c.tipo === "xp" && !c.porque
  ? { ...c, porque, texto: `${c.texto}${O_PORQUE_NO_RECIBO.entre}${porque}`, falado: `${c.falado || c.texto}${O_PORQUE_NO_RECIBO.falado}${porque}` }
  : c)));
export function mensagensComRecibo(lista, { desde = 0, texto = null, recibo = [] } = {}) {
  if (!Array.isArray(lista) || !Array.isArray(recibo) || !recibo.length) return lista;
  for (let i = Math.max(0, Number(desde) || 0); i < lista.length; i++) {
    const m = lista[i];
    if (!m || m.autor !== "mestre") continue;
    if (texto != null && m.texto !== texto) continue;
    if (m.recibo) return lista;
    let r = recibo;
    try { if (recibo.some((c) => c && c.tipo === "xp")) r = comOPorque(recibo, porqueDoFeito(lista, desde)); } catch (e) { calou("o porquê do feito no recibo", e); r = recibo; }
    return lista.map((x, k) => (k === i ? { ...x, recibo: r } : x));
  }
  return lista;
}
export function mensagensComFimDaLuta(lista, fim, { desde = 0 } = {}) {
  if (!Array.isArray(lista) || !fim) return lista;
  for (let i = lista.length - 1; i >= Math.max(0, Number(desde) || 0); i--) {
    const m = lista[i];
    if (!m || m.naLuta !== true) continue;
    if (m.fimDaLuta) return lista;
    return lista.map((x, k) => (k === i ? { ...x, fimDaLuta: fim } : x));
  }
  return lista;
}
export function caidosDaLuta(c) {
  return ((c && c.inimigos) || [])
    .filter((e) => e && !e.fugiu && (e.derrotado || (Number(e.vida) || 0) <= 0))
    .map((e) => e.nome).filter(Boolean);
}
/* O desfecho que a tela e a dobra dizem. A queda do herói manda sobre
   tudo menos a vitória (quem vence e fica a 0 venceu); a fuga vem de quem
   viu o herói sair (`fugiu`). Fora da tabela, `encerrada`. */
export function desfechoDoFecho(fecho, ficha, fugiu = false) {
  let d = fugiu ? "fuga" : (fecho && fecho.desfecho) || "encerrada";
  if (!DESFECHOS_DA_LUTA.includes(d)) d = "encerrada";
  const caiu = !!(ficha && (ficha.morto || (typeof ficha.vida === "number" && ficha.vida <= 0)));
  if (caiu && d !== "vitoria") d = "queda";
  return d;
}
/* A1 · B3: A PORTA DO ACEITE — "▸ Diário — {título} · próximo: {passo}".
   O travessão é o separador que `portaDaLinhaDeSistema` (painel-relato)
   lê para achar o nome da aba; o resto é o que se decide a seguir. Sem
   preço (a soleira mostrou-o antes do clique) e sem os números da paga. */
export function portaDoAceite(m) {
  if (!m) return "";
  let e = null;
  try { e = etapaAtual(m); } catch (err) { calou("a etapa da porta do aceite", err); }
  return "▸ Diário — " + (m.titulo || "") + (e ? " · próximo: " + textoDaEtapa(e) : "");
}
export function fimDaLutaDe(fecho, depois) {
  if (!fecho) return null;
  return {
    caidos: Array.from(new Set(fecho.caidos || [])),
    rodadas: Math.max(1, Number(fecho.rodadas) || 1),
    recibo: reciboDoTurno(fecho.fichaNaAbertura, depois),
    desfecho: desfechoDoFecho(fecho, depois),
  };
}
