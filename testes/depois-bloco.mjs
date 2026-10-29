/* depois-bloco.mjs (Fase 4, trilha A, 29/10/2026) — os órgãos do depois da resposta, jogados

   Não é suíte: é a ferramenta das suítes que liam no App o texto do que
   foi para src/motor/depois-do-turno.js (o trabalho que o mundo oferece, a
   porta do mural, o conferente das missões, a fé e o arco). O motor não se lê pelo texto (a catraca
   teste-assercoes-de-texto): a mesma intenção prova-se jogando a peça, e é
   isto que elas chamam.

     jogarODepois(orgao, { estado, args, portas }) → { ret, escritas, portas }
       (`portas` na entrada troca uma porta pelo nome, e a chamada fica na lista)
       `portas` é a lista [nome, argumento] das portas que o órgão chamou,
       na ordem (os setters, o pushMsgs, o salvar, o calou). O pushMsgs é
       o do App: junta as novas às `mensagens` e devolve a lista.
     aCenaQueConfere(sobre) → o estado de uma sessão gravada pronto para o
       conferente (fora de luta e de masmorra, numa cidade), com `sobre`
       por cima; `aqui(estado)` é a cidade dela.
     umaCidadeQuePrega() → o estado de uma sessão gravada (o do pedido) em
       que o órgão prega: a cidade, o dia novo, o diário vazio, o herói
       orientado — o ponto de partida de cada prova, que muda UMA coisa. */
import { osOrgaosDoDepois, PORTAS_DO_DEPOIS } from "../src/motor/depois-do-turno.js";
import { casoDoPedido } from "./pedido-bloco.mjs";

const copia = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));

export function jogarODepois(orgao, { estado = {}, args = [], portas: trocadas = {} } = {}) {
  const portas = [];
  let mensagens = copia(estado.mensagens) || [];
  const P = {
    calou: (onde) => { portas.push(["calou", onde]); },
    pushMsgs: (novas) => { portas.push(["pushMsgs", novas]); mensagens = [...mensagens, ...novas]; return mensagens; },
    salvar: (extra) => { portas.push(["salvar", extra]); },
  };
  for (const n of PORTAS_DO_DEPOIS) if (n.startsWith("set")) P[n] = (v) => { portas.push([n, v]); };
  /* uma porta trocada (a que estoura, para provar que não custa o órgão) */
  for (const [n, f] of Object.entries(trocadas)) P[n] = (...x) => { portas.push([n, x[0]]); return f(...x); };
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

export const aqui = (estado) => (estado && estado.cidadeAtual) || "Rio Cinzento";
export function aCenaQueConfere(sobre = {}) {
  const k = casoDoPedido(4);
  const estado = { ...k.estado, render: k.render, combate: null, masmorra: null, missoes: [] };
  estado.cidadeAtual = aqui(estado);
  return { ...copia(estado), ...copia(sobre) };
}
