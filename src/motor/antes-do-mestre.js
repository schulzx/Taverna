/* ============================================================
   ANTES DO MESTRE, NO MOTOR (T1-A, 8.ª fatia, 28/10/2026) — src/motor/antes-do-mestre.js

   O replay da sessão gravada no navegador (testes/sessao-navegador.json)
   divergia em campos que só o App escrevia: o turno do mundo e o sino da
   abertura, a assinatura da cena no chão, a escuta. São órgãos do turno
   que correm ANTES de o Narrador ser chamado — no `agirInterno` (o relógio
   do mundo, o sino) e no começo do `enviar` (o chão, a escuta) — e que
   leem só o estado e a frase. Vêm para cá, na MESMA ordem e com os porquês
   de cada linha; o App ficou com a fiação e com as portas que ainda são
   dele (os relógios que tiquetaqueiam, o mundo que se mexe sozinho, a tela).

   A FORMA É A DAS OUTRAS PEÇAS: o que entra é lido, nunca tocado; o que
   sai é novo, e o que é do App sai como pedido (`tiquear`, `mundoSeMexe`,
   o `toque` do sino que vai à tela e à nota).

   E para o replay: `oAntesDoMestre(estado, entrada, ctx)` corre as peças
   na ordem do App sobre o estado do fim do turno anterior e devolve o
   estado novo — é o passo que `sessao.js` (trilha B) chama antes do
   "o sítio pela frase". O que ele ainda NÃO faz está escrito nele.

   Provado byte a byte contra o App de antes (aac1912) em
   `teste-motor-antes-do-mestre.mjs`.
   ============================================================ */
import { varrerSeMudou } from "../chao.js";
import { andarOSino } from "../abertura.js";
import { lerOPedido, fioDaHistoria, seguraOMundo, degrauDaEscuta, garantirEscuta, andarAEscuta, contarOAvanco } from "../escuta.js";
import { soPergunta } from "../perguntas.js";

/* ---------------- A CADÊNCIA DO MUNDO (v9.31) ----------------
   O gatilho "turno_mundo" dos relógios morava na vez do mundo, e ela
   deixou de existir. Ele passou para o turno normal — que agora É o turno
   —, mas a cada DOIS, para manter a cadência de antes: os relógios andavam
   uma vez por par ação+mundo, e dobrar isso encurtaria pela metade todo
   prazo já em curso nos saves. */
export const CADENCIA_DO_MUNDO = Object.freeze({ relogiosACada: 2 });

/* ---------------- O RELÓGIO DO MUNDO ----------------
   Fora da luta, o turno do mundo conta (`turnosDeMundo`), pede aos
   relógios que andem a cada dois, e deixa o mundo mexer-se por conta
   própria (v9.61) fora de masmorra e de acampamento — é onde interromper
   seria roubar a cena do herói. → { parado, turnosDeMundo, tiquear, mundoSeMexe } */
export function oRelogioDoMundo(ler) {
  const e = ler || {};
  if (e.combate) return { parado: true, turnosDeMundo: e.turnosDeMundo, tiquear: false, mundoSeMexe: false };
  const turnosDeMundo = e.turnosDeMundo + 1;
  return {
    parado: false, turnosDeMundo,
    tiquear: turnosDeMundo % CADENCIA_DO_MUNDO.relogiosACada === 0,
    mundoSeMexe: !e.acampado && !e.masmorra,
  };
}

/* ---------------- O SINO (MM13) ----------------
   Enche com o tempo, a exploração e o afastamento da história; nunca antes
   do piso. `prenuncio` vira uma linha de aviso (a pauta do turno a consome e
   apaga); `toque` é o acontecimento — a linha entra na cena e o envelope
   obriga o Narrador a encená-lo. Não passa por `marcarNoArco`: o arco já lê
   a espinha e a missão principal, e marcar aqui duplicaria a mesma batida.
   MM14: o dia e o minuto em que o sino tocou — é o que `sinosForaDeHora`
   usa para dizer QUANDO, se alguém perguntar. → o `andarOSino` inteiro */
export function oSinoDoTurno(ler) {
  const e = ler || {};
  return andarOSino(e.abertura, {
    missoes: e.missoes, lugar: e.lugar,
    conhecidos: Object.keys(e.npcs || {}).length,
    pausa: !!(e.acampado || e.masmorra || e.raid),
    cidade: e.cidadeAtual,
    dia: e.dia, minuto: e.minuto,
  });
}

/* ---------------- O CHÃO DA CENA (v9.41) ----------------
   A assinatura da cena. Trocou de lugar ou virou o dia? O que ficou no
   chão fica no chão — senão a pilha vira um segundo inventário que
   acompanha o herói pelo mundo inteiro. O chão volta O MESMO quando nada
   muda (quem chama compara por identidade para não redesenhar a tela). */
export const cenaDoChao = (ler) => {
  const e = ler || {};
  return `${e.cidadeAtual || ""}|${(e.lugar && e.lugar.nome) || ""}|${e.dia || 1}`;
};
export function oChaoDaCena(ler) {
  const e = ler || {};
  return { chao: varrerSeMudou(e.chao, cenaDoChao(e)) };
}

/* ---------------- A ESCUTA (MM18) ----------------
   O pedido do jogador lê-se ANTES do compasso e da forma da cena, porque
   eles seguram o mundo numa pergunta, no degrau da escuta; e a escuta anda
   DEPOIS de a pauta ser montada, com o avanço que as missões e a espinha
   têm nesse instante (a luta é pausa: quem luta está a jogar). Uma Noite
   não escuta. O erro volta com o que o App punha no lugar, e o App
   entrega-o ao `calou` com o nome de sempre. */
export function oPedidoDaEscuta(ler, conteudo) {
  const e = ler || {};
  if (e.modo === "rapida") return { pedido: null, fio: [], segurar: false, erro: null };
  try {
    const pedido = lerOPedido(conteudo);
    const fio = fioDaHistoria({ abertura: e.abertura, missoes: e.missoes });
    const segurar = seguraOMundo(pedido, degrauDaEscuta(garantirEscuta(e.escuta).semAvanco));
    return { pedido, fio, segurar, erro: null };
  } catch (erro) { return { pedido: null, fio: [], segurar: false, erro }; }
}
export function aEscutaAnda(ler, doPedido) {
  const e = ler || {};
  const p = doPedido || {};
  if (!p.pedido) return { escuta: e.escuta, erro: null };
  try { return { escuta: andarAEscuta(e.escuta, { pedido: p.pedido, fio: p.fio, ...contarOAvanco({ missoes: e.missoes, espinha: e.espinha }), pausa: !!e.combate }), erro: null }; }
  catch (erro) { return { escuta: e.escuta, erro }; }
}

/* ---------------- O TURNO DO MUNDO CONTA? ----------------
   O `agirInterno` anda o relógio e o mundo só no turno de exploração:
   fora da luta, do acampamento e da masmorra, e quando a frase não é SÓ
   pergunta (MM14: perguntar ao Mestre é de graça — nem os minutos, nem o
   sino). O botão da planta anda-o sempre (o clique é um turno como
   qualquer outro, v9.69). */
export function oMundoAndaNoTurno(ler, frase) {
  const e = ler || {};
  if (e.combate || e.acampado || e.masmorra) return { anda: false, erro: null };
  try { return { anda: !soPergunta(frase).soPergunta, erro: null }; } catch (erro) { return { anda: true, erro }; }
}

/* ---------------- PARA O REPLAY: O PASSO ANTES DO MESTRE ----------------
   As peças acima, na ordem do App, sobre o estado do fim do turno anterior
   (o save v2 do replay). `entrada` é a da linha da sessão ({ frase } ou
   { toque }); `ctx.modo` o modo da campanha (o replay só corre Uma Vida).

   A ORDEM: no `agirInterno`, o relógio do mundo e o sino (só com frase do
   jogador, e quando ela não é só pergunta); no `enviar`, o chão e a
   escuta. A escuta anda depois de a pauta ser montada, mas o que ela lê
   (as missões, a espinha, a luta) não muda entre uma coisa e outra.

   O QUE ELE AINDA NÃO FAZ, e por isso o campo continua a divergir: os
   minutos do turno (o relógio do dia é órgão do App), os relógios que
   tiquetaqueiam, o mundo que se mexe por conta própria (`desdeMundo`, o
   fio da memória), o compasso, a forma da cena, o intérprete. */
export function oAntesDoMestre(estado, entrada, ctx) {
  let E = estado || {};
  const en = entrada || {};
  const frase = typeof en.frase === "string" ? en.frase : "";
  if (frase && !frase.trimStart().startsWith("[") && oMundoAndaNoTurno(E, frase).anda) {
    const r = oRelogioDoMundo(E);
    if (!r.parado) {
      E = { ...E, turnosDeMundo: r.turnosDeMundo };
      const s = oSinoDoTurno(E);
      E = { ...E, abertura: s.abertura };
    }
  }
  const ch = oChaoDaCena(E);
  if (ch.chao !== E.chao) E = { ...E, chao: ch.chao };
  const pe = oPedidoDaEscuta({ ...E, modo: (ctx || {}).modo }, frase || (en.toque ? "[toque]" : ""));
  const an = aEscutaAnda(E, pe);
  if (an.escuta !== E.escuta) E = { ...E, escuta: an.escuta };
  return E;
}
