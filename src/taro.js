/* ============================================================
   AS REGRAS DA CARTA (v9.126) — Taverna

   Duas coisas na carta de tarô são decisão, e não pintura: o NÚMERO e o
   NAIPE. Moram aqui, longe do SVG, pelo motivo de sempre — o desenho a
   gente olha, a regra a gente prova.

   O número é o nível em romano: a única numeração honesta para uma carta
   de alguém que ainda está mudando.

   O naipe é o atributo mais alto, com empate resolvido pela ordem em que a
   ficha mostra os atributos — a mesma ordem que o jogador já leu. Quem não
   tem atributo nenhum (um figurante, um bicho) recebe um naipe pela
   semente: nenhuma carta nasce sem naipe, do mesmo jeito que nenhum agente
   nasce mudo.
   ============================================================ */
import { ATRIBUTOS } from "./constantes.js";
import { sementeDe, hashSemente, rng, escolher } from "./semente.js";

/* ---------------- O NÚMERO ---------------- */
const ROMANOS = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
export function romano(n) {
  let v = Math.max(0, Math.floor(Number(n) || 0));
  if (!v) return "—";
  let fora = "";
  for (const [valor, letra] of ROMANOS) while (v >= valor) { fora += letra; v -= valor; }
  return fora;
}

/* internos: quem lê de fora recebe o naipe pronto por `naipeDe` */
const NAIPES = {
  forca: "a espada",
  destreza: "a flecha",
  vigor: "o escudo",
  intelecto: "o livro",
  presenca: "o cálice",
  percepcao: "o olho",
};
const ORDEM_DO_EMPATE = ATRIBUTOS.map((a) => a.id);

export function naipeDe(ente) {
  const at = (ente && ente.atributos) || null;
  if (at && ORDEM_DO_EMPATE.some((id) => Number(at[id]) > 0)) {
    let melhor = ORDEM_DO_EMPATE[0];
    for (const id of ORDEM_DO_EMPATE) if ((Number(at[id]) || 0) > (Number(at[melhor]) || 0)) melhor = id;
    return { id: melhor, nome: NAIPES[melhor], daFicha: true };
  }
  const id = escolher(rng(hashSemente(sementeDe(ente) + "·naipe")), ORDEM_DO_EMPATE);
  return { id, nome: NAIPES[id], daFicha: false };
}
