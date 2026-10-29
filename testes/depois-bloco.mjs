/* depois-bloco.mjs (Fase 4, trilha A, 29/10/2026) — os órgãos do depois da resposta, jogados

   Não é suíte: é a ferramenta das suítes que liam no App o texto do que
   foi para src/motor/depois-do-turno.js (o trabalho que o mundo oferece, a
   porta do mural). O motor não se lê pelo texto (a catraca
   teste-assercoes-de-texto): a mesma intenção prova-se jogando a peça, e é
   isto que elas chamam.

     jogarODepois(orgao, { estado, args }) → { ret, escritas, portas }
       `portas` é a lista [nome, argumento] das portas que o órgão chamou,
       na ordem (o setMural, o pushMsgs, o salvar, o calou).
     umaCidadeQuePrega() → o estado de uma sessão gravada (o do pedido) em
       que o órgão prega: a cidade, o dia novo, o diário vazio, o herói
       orientado — o ponto de partida de cada prova, que muda UMA coisa. */
import { osOrgaosDoDepois } from "../src/motor/depois-do-turno.js";
import { casoDoPedido } from "./pedido-bloco.mjs";

const copia = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));

export function jogarODepois(orgao, { estado = {}, args = [] } = {}) {
  const portas = [];
  const P = {
    calou: (onde) => { portas.push(["calou", onde]); },
    pushMsgs: (novas) => { portas.push(["pushMsgs", novas]); },
    salvar: (extra) => { portas.push(["salvar", extra]); },
    setMural: (v) => { portas.push(["setMural", v]); },
  };
  const o = osOrgaosDoDepois(copia(estado), P);
  const ret = o[orgao](...copia(args));
  return { ret, escritas: o.escritas, portas };
}

let achado = null;
export function umaCidadeQuePrega() {
  if (achado) return copia(achado);
  for (let i = 0; i < 194; i++) {
    const k = casoDoPedido(i);
    const estado = { ...k.estado, render: k.render, abertura: { legado: true }, combate: null, masmorra: null, missoes: [], mural: [], ultimoTrabalhoDia: 0 };
    const j = jogarODepois("oferecerTrabalhoDaqui", { estado });
    if (j.escritas.mural && j.escritas.mural.length === 1) { achado = estado; return copia(achado); }
  }
  throw new Error("nenhuma sessão gravada em que o mural prega");
}
