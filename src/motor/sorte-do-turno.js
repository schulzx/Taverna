/* ============================================================
   A SORTE DO TURNO (Fase T1, trilha A, 27/10/2026)

   A lei é velha: "mesma semente = mesmo resultado, em qualquer máquina".
   A T0-B tirou o `Math.random` dos módulos; esta peça tira-o do turno. Todo
   sorteio que o App pede sai de `dadoDo(semente do mundo, ponto, evento, n)`:

   - o PONTO é o instante que o save guarda: o dia, o minuto e quantas falas
     o relato tem. Logo uma campanha recarregada no mesmo ponto rola os
     mesmos dados para as mesmas ações — recarregar não compra outro dado —,
     e duas campanhas com a mesma semente e as mesmas ações rolam iguais;
   - o EVENTO é o nome do sorteio ("ataque", "loot", "aflicao"…): eventos
     diferentes no mesmo ponto não se correlacionam;
   - `n` conta quantas vezes o mesmo evento já pediu sorte neste ponto: dois
     golpes na mesma rodada não caem iguais, e a contagem recomeça quando o
     ponto anda.

   A contagem é dado, não ref: entra e sai substituída (imutabilidade), para
   que o motor (`aplicar`, a rodada) a possa levar no estado.

   Puro, sem React. Provado em `testes/teste-sorte-do-turno.mjs`.
   ============================================================ */
import { dadoDo } from "../semente.js";

export const CONTAGEM_VAZIA = Object.freeze({ ponto: "", n: Object.freeze({}) });

export function pontoDaSorte({ dia = 0, minuto = 0, falas = 0 } = {}) {
  return `${Number(dia) || 0}|${Number(minuto) || 0}|${Number(falas) || 0}`;
}

/* a sorte de um evento num ponto, e a contagem nova */
export function sorteNoPonto(contagem, semente, ponto, evento) {
  const c = contagem && typeof contagem === "object" ? contagem : CONTAGEM_VAZIA;
  const antes = c.ponto === ponto && c.n && typeof c.n === "object" ? c.n : {};
  const ev = String(evento == null ? "" : evento);
  const k = (Number(antes[ev]) || 0) + 1;
  return { sorte: dadoDo(semente, ponto, ev, k), contagem: { ponto, n: { ...antes, [ev]: k } } };
}

/* a semente do d20 da tela: a rolagem e o ponto, sem contagem — o mesmo
   teste pedido no mesmo instante cai igual (é o mesmo teste); a próxima
   fala do relato já é outro ponto */
export function chaveDaRolagem(semente, ponto, rolagem) {
  if (!rolagem || typeof rolagem !== "object") return "";
  return [semente, ponto, "teste", rolagem.atributo || "", rolagem.dificuldade || "", rolagem.motivo || ""].join("|");
}
