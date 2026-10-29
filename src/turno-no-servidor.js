/* ============================================================
   O TURNO NO SERVIDOR, EM ENSAIO (Fase 4 do plano do motor, trilha B,
   29/10/2026) — src/turno-no-servidor.js

   O plano (mente/plano-motor.md, Fase 4) leva o turno para `POST
   /api/turno`: o cliente manda `{ estado, frase, eco?, bilhetes? }` e o
   servidor monta o pedido ao Narrador ALI — o prompt e o motor saem do
   bundle do navegador. As três peças já existiam em Node e provadas à letra
   contra o App: o estado do servidor (motor/eco-do-turno.js), o prelúdio
   (motor/preludio-do-turno.js: da frase às bocas) e o pedido
   (motor/pedido-do-turno.js: da pauta ao system). Este módulo é a costura
   das três, com as portas que um servidor tem — e só essas:

   - SEM TELA: nenhum setter do React, nenhum `pushMsgs` (a peça junta as
     mensagens novas ela mesma, como fez na prova da cadeia);
   - SEM DISCO: nenhum `salvar` — o servidor não grava nada; o que o turno
     escreveu volta no estado do fim, para quem chamar decidir;
   - SEM REDE: nenhum `chamarModelo`. As bocas (falas.js) estão em
     `BOCAS_POR_TURNO = 0`, e mesmo que voltem a falar, sem porta a boca
     cala — como cala no App quando a rede falha. O pedido ao Narrador é
     DEVOLVIDO, nunca enviado: chamá-lo é o passo que a pessoa autoriza.
   - O Intérprete é o da casa (interprete.js), o mesmo do App.

   A SORTE, e por que ela sai do estado: no App, `enviar` semeia a reserva
   da casa logo depois da foto do envio com `${sementeMundo()}|
   ${pontoDaSorte()}` — o nome da campanha, o gênero do mundo, o dia, o
   minuto e quantas falas o relato tem. Tudo isso está no save, logo o
   servidor refaz a MESMA semente do estado que recebe (`aCasaDoTurno`) e
   a mesma corrente (`rng(hashSemente("taverna|sorte-da-casa|" + casa))`,
   a conta de `semearACasa`). A diferença é de escopo, e é de propósito:
   o App troca a reserva global e deixa-a trocada; um servidor atende
   pedidos que se intercalam nos `await`, e a reserva global de um turno
   rolaria os dados do outro. Por isso o gerador entra como `entrada.sorte`
   nas duas peças, que o usam por `comSorte` só durante a parte síncrona —
   o mesmo gerador nas duas, que continua de onde a primeira parou, como a
   reserva do App continuaria. A suíte prova que dá o mesmo pedido, byte a
   byte, que o caminho do App (`semearACasa` e nenhuma sorte explícita).

   O QUE O TURNO ADIA (o `setTimeout` do App: a presença na luta que se
   abriu) corre DEPOIS do pedido, como no App, onde o temporizador só
   dispara quando `enviar` já montou o pedido e espera a rede. Corre com a
   mesma sorte e dentro de try: não pesa no pedido, e nunca custa o turno.

   O `calou` do servidor junta ONDE calou (até `caladosMax`), não o erro: é
   o diagnóstico de um ensaio, não um log de pilha.

   A prova é testes/teste-turno-no-servidor.mjs: a rota sobre os estados
   das sessões gravadas, com o `fetch` espiado, contra a cadeia corrida em
   Node pelo caminho do App.
   ============================================================ */
import { SEMENTE_DA_CASA, comSorte, hashSemente, rng } from "./semente.js";
import { pontoDaSorte } from "./motor/sorte-do-turno.js";
import { oEstadoDoServidor } from "./motor/eco-do-turno.js";
import { oPreludioDoTurno } from "./motor/preludio-do-turno.js";
import { oPedidoDoTurno, oEstadoDoPedido, REFS_DO_PEDIDO, RENDER_DO_PEDIDO } from "./motor/pedido-do-turno.js";
import { REFS_DA_PAUTA } from "./motor/pauta-do-turno.js";

export const TURNO_NO_SERVIDOR = Object.freeze({
  /* o nome que a semente usa quando a campanha não tem nome (o mesmo do
     `sementeMundo` do App) */
  semNome: "aventura",
  /* quantos lugares onde o turno calou o ensaio guarda */
  caladosMax: 40,
});

/* AS PORTAS que o servidor dá às peças, e as que ele NÃO dá — a suíte lê
   esta tabela e confere que a montagem não passa nenhuma porta fora dela */
export const PORTAS_DO_SERVIDOR = Object.freeze({
  calou: "junta onde calou (até caladosMax); nunca custa o turno",
  adiar: "guarda o que o turno adia e corre-o depois do pedido, como o setTimeout do App",
  agora: "o relógio do servidor (só chaveia a faixa da chegada, que é tela)",
});

const ehObjeto = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

/* A SEMENTE DO TURNO, do estado: a conta de `enviar` no App —
   `${sementeMundo()}|${pontoDaSorte()}`. */
export function aCasaDoTurno(estado) {
  const e = ehObjeto(estado) ? estado : {};
  const mundo = ehObjeto(e.mundo) ? e.mundo : null;
  const nome = e.nomeCampanha || TURNO_NO_SERVIDOR.semNome;
  const falas = Array.isArray(e.mensagens) ? e.mensagens.length : 0;
  return `${nome}|${(mundo && mundo.genero) || ""}|${pontoDaSorte({ dia: e.dia, minuto: e.minuto, falas })}`;
}

/* O ESTADO QUE O PEDIDO RECEBE, como o App o monta desde 1409f0b
   (`estadoDoPedido` = `oEstadoDoPedido(refsDoPedido(), { personagem, mundo,
   nomeCampanha, mercado, governos, historico })`): os refs das duas tabelas
   (REFS_DA_PAUTA e REFS_DO_PEDIDO) com o valor DEPOIS do prelúdio — o que
   o App lê nos refs no instante do pedido —, e do render só os seis do
   React (RENDER_DO_PEDIDO), com o valor de ANTES do turno: o `enviar` do
   App é do último render, e o estado React dele não vê o que o prelúdio
   escreveu nos refs. Um campo fora das tabelas não chega ao pedido, como
   no App. Medido: nos 146 turnos gravados e nos 335 casos do prelúdio dá o
   mesmo pedido que o espalhar cru (`{ ...e0, ...escritas }`) de antes — em
   26 desses o prelúdio reescreve a ficha, e o pedido não lê do render o
   que mudou —, mas a regra é a do App, e é ela que se segue. */
function oEstadoParaOPedido(antes, depois) {
  const refs = {};
  for (const tabela of [REFS_DA_PAUTA, REFS_DO_PEDIDO]) for (const [campo, r] of Object.entries(tabela)) refs[r.ref] = { current: depois[campo] };
  const render = {};
  for (const n of RENDER_DO_PEDIDO) if (antes[n] !== undefined) render[n] = antes[n];
  return oEstadoDoPedido(refs, render);
}

/* O PEDIDO, MONTADO NO SERVIDOR. `corpo` é o que a rota recebeu
   (`{ estado, frase, eco, bilhetes }`); devolve `{ pedido, casa, calados,
   estadoDoFim }` — o pedido ao Narrador como a rede o receberia, a
   semente usada, onde calou, e o estado com tudo o que o turno escreveu
   (de onde `aRespostaDoServidor` tira o eco e os soltos). Lança quando uma
   peça estoura: onde o App estouraria, o servidor também. */
export async function oPedidoNoServidor(corpo, opcoes) {
  const { estado, frase, eco, bilhetes } = ehObjeto(corpo) ? corpo : {};
  const { agora } = ehObjeto(opcoes) ? opcoes : {};
  const e0 = oEstadoDoServidor(estado, { eco, bilhetes });
  const casa = aCasaDoTurno(e0);
  const sorte = rng(hashSemente(`${SEMENTE_DA_CASA}|${casa}`));
  const calados = [];
  const adiados = [];
  const portas = {
    calou: (onde) => { if (calados.length < TURNO_NO_SERVIDOR.caladosMax) calados.push(String(onde)); },
    adiar: (g) => { adiados.push(g); },
    agora: typeof agora === "function" ? agora : () => Date.now(),
  };
  const r1 = await oPreludioDoTurno(e0, { frase, sorte }, portas);
  const r2 = oPedidoDoTurno(oEstadoParaOPedido(e0, { ...e0, ...r1.escritas }), { ...r1.entradaDoPedido, sorte }, portas);
  /* o adiado escreve pelo prelúdio (nas escritas dele): corre depois do
     pedido, e o estado do fim junta-o por baixo do que o pedido escreveu */
  for (const g of adiados.splice(0)) {
    try { comSorte(sorte, g); } catch (x) { portas.calou("o que o turno adiou", x); }
  }
  return { pedido: r2.pedido, casa, calados, estadoDoFim: { ...e0, ...r1.escritas, ...r2.escritas } };
}
