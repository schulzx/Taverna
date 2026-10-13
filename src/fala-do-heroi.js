/* ============================================================
   A FALA DO HERÓI É DO JOGADOR (MM11 · 11.ª sessão, 13/10)

   "— … — você diz." O Gemini 3.8 Flash escreveu a fala do herói em 16
   das 62 respostas da 11.ª sessão — com palavrão em parte delas — num
   turno em que o jogador não tinha dito nada. A regra existe no system
   ("NÃO NARRE O QUE EU SINTO NEM O QUE EU DECIDO") e agora também na
   etiqueta do pedido (escuta.js), colada à frase do jogador, que é onde
   o modelo obedece. Esta é a peneira de depois: o que ainda escapar e
   for SEGURO de tirar, sai.

   SEGURO É POUCO, e de propósito ("o portão morde só o necessário"):

   1. Só quando o jogador NÃO falou neste turno. Se ele disse, perguntou,
      respondeu, gritou — qualquer ato de fala, ou aspas, ou travessão —,
      o Mestre que ecoa as palavras dele está a fazer o ofício, e a
      peneira não toca em nada. Nem paráfrase se julga aqui.
   2. Só a fala ATRIBUÍDA ao herói pela forma da língua: o travessão que
      fecha a fala seguido de "você <verbo de fala>" em minúscula ("—
      Some daqui — você rosna."), a aspa que fecha seguida do mesmo, ou
      "Você diz: «…»". Um NPC que pergunta "— Você diz que pagou?" abre a
      fala com maiúscula e não é atribuição: fica.
   3. Nunca corta demais: se a poda levaria mais de um terço do texto, ou
      deixaria menos de `minPalavras`, a resposta passa inteira — uma
      narração mutilada é pior do que uma fala a mais.

   Sem pedido do jogador (o turno que o sistema abre sozinho), não há
   com o que comparar, e nada se toca.
   ============================================================ */
import { ETIQUETA_DO_PEDIDO } from "./escuta.js";

export const FALA_DO_HEROI = {
  /* os verbos com que a prosa entrega uma fala a alguém ("você ___") */
  verbos: ["diz", "fala", "responde", "rosna", "grita", "berra", "murmura", "sussurra", "retruca", "rebate", "devolve",
    "solta", "cospe", "pergunta", "insiste", "completa", "emenda", "acrescenta", "resmunga", "sibila", "declara",
    "anuncia", "ameaça", "provoca", "dispara", "xinga", "conclui", "repete", "garante", "avisa", "ordena", "pede",
    "implora", "replica", "comenta", "brinca", "debocha", "zomba", "corta", "arremata"],
  /* o jogador falou neste turno? (o texto já sem acentos e minúsculo) */
  atoDeFala: /["“”«»]|(^|\s)—|\b(digo|falo|pergunto|respondo|grito|berro|sussurro|murmuro|retruco|rebato|devolvo|peco|chamo|conto|explico|aviso|ameaco|juro|prometo|xingo|rosno|canto|recito|declaro|anuncio|insisto|repito|mando|ordeno|pechincho|barganho|negocio|minto|confesso|agradeco|cumprimento|saudo|brindo|ofereco|proponho|questiono|indago|replico|comento|interrogo|converso|elogio|provoco|imploro|suplico|exijo|cobro|apresento|retruco|digo-lhe|falo-lhe)\b/,
  /* nunca podar mais do que isto */
  maxFracaoCortada: 1 / 3,
  minPalavras: 40,
};

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const palavras = (s) => String(s || "").split(/\s+/).filter(Boolean).length;

/* A frase do jogador dentro da mensagem do turno: o que vem depois da
   etiqueta do pedido. Sem etiqueta, nada. */
export function fraseDoPedido(mensagem) {
  const c = String(mensagem == null ? "" : mensagem);
  const i = c.lastIndexOf(ETIQUETA_DO_PEDIDO);
  return i < 0 ? "" : c.slice(i + ETIQUETA_DO_PEDIDO.length).trim();
}

const V = () => FALA_DO_HEROI.verbos.join("|");
/* a atribuição: "você <verbo>" que não seja discurso indireto ("você diz que…") */
const ATRIB = () => `você\\s+(?:${V()})\\b(?!\\s+(?:que|se)\\b)[^.!?…\\n]*[.!?…]?`;

export function semFalaInventada(narrativa, mensagemDoTurno) {
  const original = String(narrativa == null ? "" : narrativa);
  const nada = { narrativa: original, cortadas: [] };
  const frase = fraseDoPedido(mensagemDoTurno);
  if (!original.trim() || !frase || FALA_DO_HEROI.atoDeFala.test(norm(frase))) return nada;
  const cortadas = [];
  const paragrafos = original.split("\n").map((par) => {
    /* o parágrafo que É a fala do herói: abre com travessão e a fecha com
       "— você <verbo>" — sai inteiro (a convenção da língua: cada fala, o
       seu parágrafo) */
    if (/^\s*—/.test(par) && new RegExp(`[^\\s—]\\s*—\\s*${ATRIB()}`).test(par)) { cortadas.push(par.trim()); return null; }
    let p = par;
    const tirar = (rx) => {
      p = p.replace(rx, (tudo, antes, fala) => { cortadas.push(fala.trim()); return antes; });
    };
    /* no meio da narração: ". — Me dá a chave — você diz." */
    tirar(new RegExp(`(^|[.!?…]\\s+)(—\\s[^—\\n]{1,400}?[^\\s—]\\s*—\\s*${ATRIB()})\\s*`, "g"));
    /* entre aspas: "«Some daqui», você rosna." */
    tirar(new RegExp(`(^|[.!?…]\\s+)(["“][^"”\\n]{1,400}["”]\\s*,?\\s*(?:—\\s*)?${ATRIB()})\\s*`, "g"));
    /* anunciada: "Você diz: «…»" */
    tirar(new RegExp(`(^|[.!?…]\\s+)([Vv]ocê\\s+(?:${V()})\\b[^.!?…:\\n]{0,60}:\\s*["“][^"”\\n]{1,400}["”][.!?…]?)\\s*`, "g"));
    return p.replace(/\s+$/, "");
  });
  if (!cortadas.length) return nada;
  const nova = paragrafos.filter((x) => x !== null).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  const total = palavras(original);
  if (palavras(nova) < FALA_DO_HEROI.minPalavras || (total - palavras(nova)) / total > FALA_DO_HEROI.maxFracaoCortada) return nada;
  return { narrativa: nova, cortadas };
}
