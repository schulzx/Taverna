/* ============================================================
   O ECO, OS SOLTOS E OS BILHETES (Fase 4, trilha B, 29/10/2026) — src/motor/eco-do-turno.js

   O que o `/api/turno` recebe do cliente ALÉM de { estado, frase }, e o
   que devolve para o cliente reenviar. O inventário (14bde83,
   mente/diario.md) achou três espécies de valor que as peças do turno
   (pauta-do-turno.js, pedido-do-turno.js, preludio-do-turno.js) leem e
   que o save NÃO leva — no App vivem num ref e morrem no load:

   - O ECO: memória entre turnos que o load zera (o ritmo do QUEM É, o
     coração que falou, os nomes oferecidos, o fecho, os vetos do Juiz, a
     escuta que adiou, os mortos da sessão, a fera vista). Não é do save,
     de propósito: hoje um load esquece-os, e o eco preserva isso — a
     resposta do turno devolve-o, o cliente manda-o de volta no pedido
     seguinte, e sem ele o servidor parte do vazio, que é exatamente o
     que um load faz hoje.
   - OS SOLTOS: o que as ações de tela deixam para o Mestre entre turnos
     (a nota, a oficina, o sino, o peso). Já têm forma na casa —
     `soltosDoTurno()` no App, a foto do desfazer em guardado.js — e
     passam a ter um campo NOVO no save, `soltos`, com essa mesma forma. A
     versão antiga ignora-o (estado.js deixa atravessar intacto o campo que
     a tabela não conhece, e `continuar` não o lê): um commit revertido
     abre o save igual. A suíte prova-o com o código de antes.
   - OS BILHETES: o que uma ação de tela deixou para o PRÓXIMO turno (a
     agressão declarada, o veto do agir, o golpe final, a intenção da
     luta). Viajam com a frase (`entrada.bilhetes`) enquanto essas ações
     forem do cliente; a pauta lê-os e zera-os.

   A TABELA `CAMPOS_DO_SERVIDOR` diz, de cada campo, por onde viaja
   (`via`), com que chave (`chave`, a do save para os soltos), de onde vem
   no jogo (`de`), quem o escreve (`escreve`) e que peça o lê (`le`: a
   pauta, o pedido, o prelúdio, ou `depois` — os órgãos do depois). O
   campo é o das peças (o nome do ref sem `Ref`). As funções só movem
   valores entre as três formas e nunca os validam: quem lê é a peça, com
   as guardas do App. A única exceção é o `null` do save, que o servidor lê
   como o load do App o abre (`NULO_QUE_O_LOAD_REFAZ`, mais abaixo).

   O `juizDoTurno` do inventário NÃO viaja: o turno zera-o antes de o
   escrever (o Juiz de cada turno é novo), logo não é memória entre turnos.

   Não liga nada: o `/api/turno` e o App chamam isto quando a trilha A e o
   servidor o ligarem (a ligação está no diário).
   ============================================================ */

import { CAMPOS } from "../estado.js";import { REFS_DA_PAUTA } from "./pauta-do-turno.js";
import { REFS_DO_PEDIDO } from "./pedido-do-turno.js";
import { REFS_DO_PRELUDIO } from "./preludio-do-turno.js";
import { REFS_DO_DEPOIS } from "./depois-do-turno.js";

const C = (via, chave, de, escreve, le) => Object.freeze({ via, chave, de, escreve, le: Object.freeze(le) });

export const CAMPOS_DO_SERVIDOR = Object.freeze({
  /* ---- o eco: a resposta devolve, o cliente reenvia ---- */
  quemE: C("eco", "quemE", "o ritmo do QUEM É (quem já foi apresentado, e em que cena)", "a pauta propõe a linha; o pedido confirma-a se coube", ["pauta", "pedido"]),
  coracaoRitmo: C("eco", "coracaoRitmo", "o compasso do coração do mundo (quando falou por último)", "a pauta; o pedido confirma", ["pauta", "pedido"]),
  coracaoPendente: C("eco", "coracaoPendente", "a fala do coração à espera de caber", "a pauta propõe; o pedido confirma ou larga", ["pauta", "pedido"]),
  coracaoFala: C("eco", "coracaoFala", "a última fala do coração", "a pauta", ["pauta"]),
  nomesPendentes: C("eco", "nomesPendentes", "os nomes à mão oferecidos ao Narrador", "a pauta oferece; o pedido confirma se a linha coube", ["pauta", "pedido"]),
  adiadosEscuta: C("eco", "adiadosEscuta", "os envelopes que a escuta cortou e adiou", "o pedido (a escuta que corta)", ["pedido"]),
  fecho: C("eco", "fecho", "o fecho do pedido (a frase que vai por último)", "a pauta", ["pauta"]),
  vetosDoJuiz: C("eco", "vetosDoJuiz", "o que o Juiz vetou na resposta da véspera", "o Juiz, depois da resposta", ["pauta"]),
  derrotadosDaSessao: C("eco", "derrotadosDaSessao", "os mortos desta sessão (até 120)", "o fim da luta", ["pauta", "preludio", "depois"]),
  criaturaAVista: C("eco", "criaturaAVista", "a fera vista na estrada", "a estrada (a viagem)", ["pauta"]),
  /* o trabalho que o mundo oferece (motor/depois-do-turno.js, 29/10): o dia
     do último (no máximo um por dia — sem ele o servidor ofereceria em todo
     turno, porque o save não o guarda) e o aviso que espera a cena seguinte
     (o aplicar do turno seguinte solta-o depois da narração da abordagem) */
  ultimoTrabalhoDia: C("eco", "ultimoTrabalhoDia", "o dia do último trabalho que o mundo pregou no mural", "oferecerTrabalhoDaqui (o depois do turno)", ["depois"]),
  trabalhoPendente: C("eco", "trabalhoPendente", "o aviso do trabalho pregado, à espera da narração que o encena", "oferecerTrabalhoDaqui; o aplicar do turno seguinte solta-o", ["depois"]),
  /* ---- os soltos: campo novo no save, `soltos`, na forma de soltosDoTurno() ---- */
  nota: C("solto", "nota", "o que as ações de tela dizem ao Mestre entre turnos (180 sítios do App)", "a tela; o pedido esvazia-a ao juntá-la; o depois do turno (o recado do trabalho, o que o Mestre e o Cronista deixam ao seguinte) enche-a", ["pauta", "pedido", "preludio", "depois"]),
  oficina: C("solto", "oficina", "o trabalho de bancada, forja e desmonte por contar", "a tela; o prelúdio esvazia-a ao virar bilhete", ["preludio"]),
  sinoDoTurno: C("solto", "sino", "o sino do tempo (o que o relógio deu)", "o tempo do turno; a pauta apaga-o", ["pauta"]),
  ultimoPeso: C("solto", "ultimoPeso", "o peso da última cena, e o dia dele", "o fim do turno", ["pauta", "preludio"]),
  fatosDoPeso: C("solto", "fatosDoPeso", "os fatos que pesaram a cena", "o fim do turno e a luta", ["pauta", "preludio"]),
  /* ---- os bilhetes: viajam com a frase, a pauta lê e zera ---- */
  crimeDoTurno: C("bilhete", "crimeDoTurno", "a agressão declarada na tela", "declararAgressao (a tela)", ["pauta"]),
  naoPodeDoTurno: C("bilhete", "naoPodeDoTurno", "o que o agir vetou neste clique", "agirInterno (a tela)", ["pauta"]),
  golpeFinalEnvelope: C("bilhete", "golpeFinalEnvelope", "o golpe final escolhido", "o fluxo do golpe (a tela)", ["pauta"]),
  golpesDaRodada: C("bilhete", "golpesDaRodada", "os golpes desta rodada", "o fluxo do golpe (a luta)", ["pauta"]),
  intencao: C("bilhete", "intencao", "a intenção declarada na luta", "a luta (a tela)", ["pauta"]),
});

/* ---------------- O NULO DO SAVE, COMO O LOAD O ABRE ----------------
   (29/10, trilha B). O save guarda `null` onde o campo falta (estado.js:
   o padrão de quase todo campo é `null`, de propósito — o LEITOR do App é
   que decide o que a ausência quer dizer). O load do App (`continuar`)
   nunca entrega esse `null` às peças: passa-o pelo `garantirX` de cada
   campo (`elencoSaveRef.current = garantirElencoDoSave(sv.elenco)`), e o
   ref sai com o valor de partida. As peças do turno fazem o mesmo com o
   campo AUSENTE (o `padrao()` de cada ref nas tabelas delas, o mesmo
   `useRef(...)` do App) — mas o `null` passava-lhes cru, e o estado do fim
   do servidor traz `null` em todo campo que o save de entrada não tinha
   (o replay abre-o por `estadoDoSave`). Reenviado tal como veio, o turno
   seguinte estourava na peça do pedido (`$ref.elenco.vistos` de `null`).

   A regra: num campo do save que uma peça lê e cujo valor de partida não é
   `null`, o servidor lê o `null` como a ausência — o `padrao()` da peça.
   Em quase todos é EXATAMENTE o que o load dá ao `null` (a suíte avalia a
   expressão do load do App campo a campo e compara). Os que ficam de fora
   dessa igualdade estão na tabela abaixo: o load refá-los a partir de
   OUTRO campo (gera o mapa, as guildas, migra as quests…), e o servidor
   ainda não o faz — nem para o `null`, nem para a ausência, que já eram o
   `padrao()` da peça no 1.º turno. O `null` passa a ser lido como esse 1.º
   turno o leu; o resto é dívida escrita, com o porquê de cada um. */
export const NULO_QUE_O_LOAD_REFAZ = Object.freeze({
  mapa: "sem cidades, o load gera a geografia inteira (garantirGeografia, semeada pelo nome do herói)",
  guildas: "vazias, o load gera as guildas do mundo (guildasDoMundo: a semente, o mapa, o gênero, o léxico)",
  missoes: "fora de lista, o load migra as quests antigas (v9.27: a ausência é o sinal)",
  historia: "sem estrutura, o load parte da estrutura do mundo (sv.mundo.estrutura)",
  governos: "o load completa-os pelo mapa (garantirGovernos)",
  reino: "o load completa-o pelo mapa (garantirReino)",
  devocao: "o load completa-a pelo mapa e pela divindade (garantirDevocao)",
  acordouAbs: "o load refá-lo pelo relógio da máquina (o descanso de mais de 48 horas)",
});

/* os campos do save que as peças leem com partida não nula: o 1.º que os
   declara dá o `padrao` (as quatro tabelas saem do mesmo `useRef` do App) */
const NOMES_DO_SAVE = new Set(CAMPOS.map((c) => c.campo));
const PARTIDA_DO_NULO = (() => {
  const p = {};
  for (const tab of [REFS_DA_PAUTA, REFS_DO_PEDIDO, REFS_DO_PRELUDIO, REFS_DO_DEPOIS]) for (const [campo, r] of Object.entries(tab)) {
    if (campo in p || !r || !r.salvo || !NOMES_DO_SAVE.has(campo) || CAMPOS_DO_SERVIDOR[campo] || typeof r.padrao !== "function") continue;
    if (r.padrao() !== null) p[campo] = r.padrao;
  }
  return Object.freeze(p);
})();

const ehObjeto = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const tem = (o, k) => Object.prototype.hasOwnProperty.call(o, k) && o[k] !== undefined;
const daVia = (via) => Object.entries(CAMPOS_DO_SERVIDOR).filter(([, c]) => c.via === via);

/* O estado que as peças recebem no servidor: o save, com o `null` lido
   como a ausência (acima), os soltos espalhados nos campos delas, o eco e
   os bilhetes por cima. Só entra o que a tabela conhece; o resto do eco e
   dos bilhetes fica de fora. O save e a entrada não mudam. */
export function oEstadoDoServidor(save, entrada) {
  const sv = ehObjeto(save) ? save : {};
  const ent = ehObjeto(entrada) ? entrada : {};
  const e = { ...sv };
  delete e.soltos;
  for (const [campo, padrao] of Object.entries(PARTIDA_DO_NULO)) if (sv[campo] === null) e[campo] = padrao();  const soltos = ehObjeto(sv.soltos) ? sv.soltos : {};
  for (const [campo, c] of daVia("solto")) if (tem(soltos, c.chave)) e[campo] = soltos[c.chave];
  for (const [via, de] of [["eco", ent.eco], ["bilhete", ent.bilhetes]]) {
    const o = ehObjeto(de) ? de : {};
    for (const [campo, c] of daVia(via)) if (tem(o, c.chave)) e[campo] = o[c.chave];
  }
  return e;
}

/* O que a resposta do turno leva de volta, do estado do fim (o de entrada
   com as escritas das peças por cima): o eco, para o cliente reenviar, e
   os soltos, para o save. Os bilhetes não voltam: foram gastos. */
export function aRespostaDoServidor(estadoDoFim) {
  const e = ehObjeto(estadoDoFim) ? estadoDoFim : {};
  const eco = {}, soltos = {};
  for (const [campo, c] of daVia("eco")) if (tem(e, campo)) eco[c.chave] = e[campo];
  for (const [campo, c] of daVia("solto")) if (tem(e, campo)) soltos[c.chave] = e[campo];
  return { eco, soltos };
}

/* O save com o campo novo: `soltos` na forma de soltosDoTurno(), só com as
   chaves que a tabela conhece. Sem soltos, o save vai como veio. */
export function oSaveComOsSoltos(save, soltos) {
  const sv = ehObjeto(save) ? save : {};
  if (!ehObjeto(soltos)) return { ...sv };
  const s = {};
  for (const [, c] of daVia("solto")) if (tem(soltos, c.chave)) s[c.chave] = soltos[c.chave];
  return { ...sv, soltos: s };
}
