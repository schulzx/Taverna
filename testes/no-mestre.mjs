/* no-mestre.mjs — as peças do turno, jogadas no modo `mestre` (NE7, 13/11/2026)

   A NE7 pôs o `boca` como o PADRÃO do Narrador (src/motor/portas-do-narrador.js):
   todas as portas fechadas, o Cronista calado. Uma peça chamada sem modo lê
   o padrão — e as provas escritas antes disso, que chamam as peças sem modo
   para medir o que a porta ABERTA faz (o campo que a resposta manda, a prosa
   que cria gente, o Cronista que regista), passaram a medir outra coisa.

   A lei da casa para isso: a prova que mede o comportamento antigo DIZ o
   `mestre` (que ficou na tabela, de reserva). Esta é a forma de o dizer de
   uma vez numa suíte: `M.aplicarOMapa(…)` é `aplicarOMapa(…)` com o
   `modoDoNarrador: "mestre"` no contexto — salvo quando a própria chamada já
   diz um modo (uma string), que é respeitado. O padrão novo prova-se em
   teste-nada-entra-pelo-ator §10 e §11.

   O contexto não é copiado: é embrulhado (um Proxy que só responde ao
   `modoDoNarrador`), porque muitas provas passam um contexto que é ele
   próprio um Proxy de portas, e uma cópia perderia as portas. */
import * as aplicarJs from "../src/motor/aplicar.js";
import * as meio from "../src/motor/meio-do-turno.js";
import * as fim from "../src/motor/fim-do-turno.js";
import * as entrega from "../src/motor/entrega-do-turno.js";
import * as luta from "../src/motor/luta-do-turno.js";
import * as fecho from "../src/motor/fecho-da-resposta.js";
import * as cronista from "../src/motor/cronista-do-turno.js";
import * as livro from "../src/motor/livro-do-turno.js";
import * as agressao from "../src/agressao.js";
import * as sessao from "../src/sessao.js";
import * as servidor from "../src/turno-no-servidor.js";

export const O_MODO_DE_ANTES = "mestre";

const CHAVE = "modoDoNarrador";
function comOModo(c) {
  if (c === undefined) return { [CHAVE]: O_MODO_DE_ANTES };
  if (!c || typeof c !== "object") return c;
  if (!Object.isExtensible(c)) return typeof c[CHAVE] === "string" ? c : { ...c, [CHAVE]: O_MODO_DE_ANTES };
  return new Proxy(c, {
    get: (o, k) => { const v = Reflect.get(o, k); return k === CHAVE && typeof v !== "string" ? O_MODO_DE_ANTES : v; },
    has: (o, k) => k === CHAVE || Reflect.has(o, k),
    ownKeys: (o) => { const ks = Reflect.ownKeys(o); return ks.includes(CHAVE) ? ks : [...ks, CHAVE]; },
    getOwnPropertyDescriptor: (o, k) => {
      if (k !== CHAVE) return Reflect.getOwnPropertyDescriptor(o, k);
      const d = Reflect.getOwnPropertyDescriptor(o, k);
      if (d && typeof d.value === "string") return d;
      return { value: O_MODO_DE_ANTES, enumerable: true, configurable: true, writable: true };
    },
  });
}
/* o modo que vai numa posição de argumento: um objeto de contexto, ou a string */
const noArg = (f, i) => (...a) => { const b = a.slice(); while (b.length <= i) b.push(undefined); b[i] = comOModo(b[i]); return f(...b); };
const naString = (f, i) => (...a) => { const b = a.slice(); while (b.length <= i) b.push(undefined); if (typeof b[i] !== "string") b[i] = O_MODO_DE_ANTES; return f(...b); };

export const M = Object.freeze({
  aplicar: noArg(aplicarJs.aplicar, 2),
  aplicarORegisto: noArg(aplicarJs.aplicarORegisto, 2),
  aplicarOTurno: noArg(aplicarJs.aplicarOTurno, 2),
  aplicarOMapa: noArg(meio.aplicarOMapa, 2),
  aplicarAsMissoes: noArg(meio.aplicarAsMissoes, 2),
  aplicarOsSinais: noArg(meio.aplicarOsSinais, 2),
  aplicarOCodex: noArg(fim.aplicarOCodex, 2),
  aplicarAChegada: noArg(fim.aplicarAChegada, 2),
  aNemesisNaNarrativa: naString(entrega.aNemesisNaNarrativa, 2),
  osVistosDaNarrativa: naString(entrega.osVistosDaNarrativa, 2),
  aLutaDaResposta: noArg(luta.aLutaDaResposta, 1),
  oPerigoDaResposta: noArg(fecho.oPerigoDaResposta, 0),
  aMesaDoTurno: noArg(fecho.aMesaDoTurno, 0),
  oGatilhoDoCronista: noArg(cronista.oGatilhoDoCronista, 1),
  oAceitoDoCronista: noArg(cronista.oAceitoDoCronista, 3),
  oQueACenaDaAoLivro: noArg(livro.oQueACenaDaAoLivro, 1),
  lerAgressao: noArg(agressao.lerAgressao, 1),
  alvoPrometido: noArg(agressao.alvoPrometido, 1),
  correrOTurno: noArg(sessao.correrOTurno, 2),
  oPedidoNoServidor: noArg(servidor.oPedidoNoServidor, 1),
  oTurnoNoServidor: noArg(servidor.oTurnoNoServidor, 1),
});
