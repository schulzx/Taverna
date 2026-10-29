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

   O DEPOIS DA RESPOSTA (29/10, trilha B). `oTurnoNoServidor` corre o
   turno inteiro sobre uma resposta do Narrador JÁ DADA: a montagem de
   cima, e depois o resto do `enviar` — o aplicar, o códex, a chegada, o
   Juiz e a correção dele, o Cronista —, com a MESMA função do replay
   (`correrOTurno` de sessao.js, `so: "depois"`), nunca uma cópia. O que
   o replay lê da linha gravada, o servidor tira do próprio turno, como o
   App o tira dos refs naquele instante (`aLinhaDoServidor`): o ponto da
   sorte, a semente do mundo, os envelopes (`conteudo + "\n" + nota`), os
   nomes à mão, a moeda, a foto do Juiz e o turno dele. A sorte é o mesmo
   gerador da montagem, que continua (como a reserva do App continuaria
   do envio até ao aplicar). O Cronista é IA: entra pela porta
   `cronista(pedido)` — no ensaio a proposta gravada; sem porta, o turno
   corre sem Cronista, como no App quando ele não responde.

   Devolve `{ estadoDoFim, eco, soltos, tela }`. `estadoDoFim` é o SAVE
   (os campos de estado.js e o que o save de entrada já trazia), sem os
   refs do turno; o eco leva os vetos que o Juiz deste turno deixou. A
   TELA é o mínimo que os setters levariam: a narração como a tela a
   mostra (podada), as linhas do sistema no relato, os campos do save que
   mudaram (os setters a chamar — o valor está no estadoDoFim) e os
   AVULSOS, o último valor que o turno deu a um estado só de tela (a
   chegada, a fase…), que nenhum campo do save guarda.
   ============================================================ */
import { SEMENTE_DA_CASA, comSorte, hashSemente, rng } from "./semente.js";
import { pontoDaSorte } from "./motor/sorte-do-turno.js";
import { oEstadoDoServidor } from "./motor/eco-do-turno.js";
import { oPreludioDoTurno } from "./motor/preludio-do-turno.js";
import { oPedidoDoTurno, oEstadoDoPedido, REFS_DO_PEDIDO, RENDER_DO_PEDIDO } from "./motor/pedido-do-turno.js";
import { REFS_DA_PAUTA } from "./motor/pauta-do-turno.js";
import { PORTAS_DO_PRELUDIO } from "./motor/preludio-do-turno.js";
import { aRespostaDoServidor } from "./motor/eco-do-turno.js";
import { correrOTurno } from "./sessao.js";
import { CAMPOS } from "./estado.js";
import { lerOPedido } from "./escuta.js";
import { nomeDaMoeda } from "./lexico.js";
import { cenarioAtivo } from "./cenario.js";
import { moldePorId, MOLDE_PADRAO } from "./moldes.js";
import { entradaDoJuiz } from "./motor/juiz-do-turno.js";
import { vetosDoVeredito, andarOsVetos } from "./motor/correcao-do-juiz.js";
import { oPedidoAoCronista } from "./motor/cronista-do-turno.js";

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
  tela: "os setters do prelúdio guardam o último valor (a tela não se desenha no servidor: volta em tela.avulsos)",
});

const ehObjeto = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

/* A SEMENTE DO TURNO, do estado: a conta de `enviar` no App —
   `${sementeMundo()}|${pontoDaSorte()}`. */
export function aCasaDoTurno(estado) {
  const e = ehObjeto(estado) ? estado : {};
  return `${aSementeDoMundo(e)}|${oPontoDe(e)}`;
}
/* o `sementeMundo()` do App e o `pontoDaSorte()` dele, do estado */
const aSementeDoMundo = (e) => `${e.nomeCampanha || TURNO_NO_SERVIDOR.semNome}|${(ehObjeto(e.mundo) && e.mundo.genero) || ""}`;
const oPontoDe = (e) => pontoDaSorte({ dia: e.dia, minuto: e.minuto, falas: Array.isArray(e.mensagens) ? e.mensagens.length : 0 });

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
  const m = await montar(corpo, opcoes);
  return { pedido: m.pedido, casa: m.casa, calados: m.calados, estadoDoFim: m.estadoDoFim };
}

async function montar(corpo, opcoes) {
  const { estado, frase, eco, bilhetes } = ehObjeto(corpo) ? corpo : {};
  const { agora } = ehObjeto(opcoes) ? opcoes : {};
  const e0 = oEstadoDoServidor(estado, { eco, bilhetes });
  const casa = aCasaDoTurno(e0);
  const sorte = rng(hashSemente(`${SEMENTE_DA_CASA}|${casa}`));
  const calados = [];
  const adiados = [];
  /* a tela: cada setter do prelúdio guarda o último valor (o que é função
     — o `set(x => …)` do React — corre sobre o valor de antes) */
  const avulsos = {};
  const guardarATela = Object.fromEntries(PORTAS_DO_PRELUDIO.filter((n) => /^set[A-Z]/.test(n)).map((n) => [n, (v) => {
    const campo = n[3].toLowerCase() + n.slice(4);
    try { avulsos[campo] = typeof v === "function" ? v(campo in avulsos ? avulsos[campo] : (e0 || {})[campo]) : v; } catch { /* a tela nunca custa o turno */ }
  }]));
  const portas = {
    calou: (onde) => { if (calados.length < TURNO_NO_SERVIDOR.caladosMax) calados.push(String(onde)); },
    adiar: (g) => { adiados.push(g); },
    agora: typeof agora === "function" ? agora : () => Date.now(),
    ...guardarATela,
  };
  const r1 = await oPreludioDoTurno(e0, { frase, sorte }, portas);
  const r2 = oPedidoDoTurno(oEstadoParaOPedido(e0, { ...e0, ...r1.escritas }), { ...r1.entradaDoPedido, sorte }, portas);
  /* o adiado escreve pelo prelúdio (nas escritas dele): corre depois do
     pedido, e o estado do fim junta-o por baixo do que o pedido escreveu */
  for (const g of adiados.splice(0)) {
    try { comSorte(sorte, g); } catch (x) { portas.calou("o que o turno adiou", x); }
  }
  return { pedido: r2.pedido, casa, calados, estadoDoFim: { ...e0, ...r1.escritas, ...r2.escritas }, e0, sorte, saida: r2.saida, avulsos, frase: typeof frase === "string" ? frase : "" };
}

const arr = (x) => (Array.isArray(x) ? x : []);
const obj = (x) => (ehObjeto(x) ? x : {});
const dado = (x) => { try { return x === undefined ? null : JSON.parse(JSON.stringify(x)); } catch { return null; } };
const NOMES_DO_SAVE = new Set(CAMPOS.map((c) => c.campo));

/* A LINHA DO TURNO, tirada do próprio turno (o que o replay lê do arquivo,
   o servidor lê do estado DEPOIS da montagem — os refs do App no instante
   em que a resposta chega). Cada campo, com o sítio do App de onde vem:
   - o ponto: `pontoDaSorte()` ao aplicar (dia, minuto e falas de agora);
     a contagem fica vazia: a do turno anterior é de outro ponto (as falas
     andam a cada turno), e sorteNoPonto recomeça-a;
   - o pedido: a pauta da montagem, `envelopes: conteudo + "\n" + nota`, os
     nomes à mão (`nomesOferecidosRef`), a moeda do léxico do mundo;
   - a frase da bolsa: `lerOPedido(conteudo)`, só o que é do jogador;
   - o Juiz: a foto de ANTES de aplicar e o turno `turnoDeRegistro + 1`
     (o `t` da última cena do registo). As bancas da cena e o balcão são
     do render do App (`mercadoAqui`) e não estão no estado: a foto vai
     sem eles (a medida está na suíte).
   - o Cronista: a proposta que a porta deu, ou nenhuma. */
function aLinhaDoServidor(m, resposta, proposta) {
  const e = m.estadoDoFim, conteudo = m.frase;
  const nota = obj(m.saida).nota == null ? "" : String(obj(m.saida).nota);
  let frase = "";
  try { const pb = lerOPedido(conteudo); frase = pb && pb.doJogador ? pb.texto : ""; } catch { frase = ""; }
  const mundo = obj(e.mundo);
  let moeda = "";
  try { moeda = nomeDaMoeda(mundo.lexico); } catch { moeda = ""; }
  const registro = arr(e.registro);
  const turnoJ = (registro.length && Number.isFinite(Number(obj(registro[registro.length - 1]).t)) ? Number(registro[registro.length - 1].t) : 0) + 1;
  let genero = "", molde = null;
  try { genero = mundo.genero || cenarioAtivo().generos.padrao; molde = moldePorId(mundo.molde || MOLDE_PADRAO); } catch { /* o mundo torto cala a foto, não o turno */ }
  const foto = {
    personagem: e.personagem, npcs: e.npcs, mapa: e.mapa, base: e.baseMundo, cidadeAtual: e.cidadeAtual, lugar: e.lugar,
    oferecidos: e.nomesOferecidos, missoes: e.missoes, bancas: [], balcao: [],
    narracoes: arr(e.mensagens).filter((x) => x && x.autor === "mestre").map((x) => x.texto),
    elenco: arr(obj(e.elencoCache).nomes), guildas: e.guildas, espinha: e.espinha,
    mundo: { semente: aSementeDoMundo(e), genero, molde, lexico: mundo.lexico },
  };
  let entrada = null;
  try { entrada = entradaDoJuiz(foto, { frase, pauta: obj(m.saida).pauta, moeda }); } catch { entrada = null; }
  return {
    linha: {
      entrada: { frase },
      sorte: { ponto: oPontoDe(e) },
      pedido: { pauta: String(obj(m.saida).pauta || ""), envelopes: `${conteudo}\n${nota}`, nomesAMao: dado(arr(e.nomesOferecidos)), ...(moeda ? { moeda } : {}) },
      narrador: { narrativa: String(obj(resposta).narrativa || ""), mudancas: obj(resposta).mudancas },
      cronista: ehObjeto(proposta) ? { proposta, juizo: null } : null,
      juiz: entrada ? { resumo: { turno: turnoJ, dia: e.dia }, entrada } : null,
    },
    mundo: { semente: aSementeDoMundo(e), genero, molde, lex: mundo.lexico },
    juizDoTurno: { turno: turnoJ, cidade: e.cidadeAtual || "" },
  };
}

/* O TURNO INTEIRO NO SERVIDOR, sobre uma resposta já dada. `corpo`:
   `{ estado, frase, eco, bilhetes, resposta: { narrativa, mudancas } }`;
   `opcoes`: `{ agora, cronista }` — `cronista(pedido)` recebe o pedido ao
   Cronista (`{ sys, user }`, o de oPedidoAoCronista) e devolve a proposta
   (ou null; pode ser async). Devolve `{ pedido, casa, calados, estadoDoFim,
   eco, soltos, tela, juiz, juizo, calou }`. Lança onde a montagem lança. */
export async function oTurnoNoServidor(corpo, opcoes) {
  const op = obj(opcoes);
  const m = await montar(corpo, opcoes);
  const resposta = obj(obj(corpo).resposta);
  let proposta = null;
  if (typeof op.cronista === "function") {
    try {
      const e = m.estadoDoFim;
      proposta = await op.cronista(oPedidoAoCronista({ ...e, npcs: obj(e.npcs) }, { narrativa: String(resposta.narrativa || ""), fila: "" }));
    } catch (x) { m.calados.length < TURNO_NO_SERVIDOR.caladosMax && m.calados.push("o Cronista"); proposta = null; }
  }
  const L = aLinhaDoServidor(m, resposta, proposta);
  const r = correrOTurno(m.estadoDoFim, L.linha, { semente: L.mundo.semente, mundo: L.mundo, so: "depois", casa: m.sorte });
  /* o eco: o do estado do fim, com os vetos que o Juiz deste turno deixou
     (`andarOsVetos` sobre os da véspera, como o App faz ao julgar) */
  const { eco, soltos } = aRespostaDoServidor({ ...m.estadoDoFim, ...r.estado });
  try {
    if (r.veredito) eco.vetosDoJuiz = andarOsVetos(arr(m.e0.vetosDoJuiz), vetosDoVeredito(r.veredito, L.juizDoTurno), L.juizDoTurno);
  } catch { m.calados.length < TURNO_NO_SERVIDOR.caladosMax && m.calados.push("a correção do juiz"); }
  /* o save: os campos de estado.js e o que o save de entrada já trazia */
  const doSave = new Set([...NOMES_DO_SAVE, ...Object.keys(obj(obj(corpo).estado))]);
  doSave.delete("soltos");
  const estadoDoFim = Object.fromEntries(Object.entries(r.estado).filter(([k]) => k === "versao" || doSave.has(k)));
  const antes = obj(obj(corpo).estado);
  const tela = {
    narrativa: obj(r.tela).narrativa || "",
    linhas: arr(obj(r.tela).linhas),
    campos: Object.keys(estadoDoFim).filter((k) => k !== "versao" && JSON.stringify(estadoDoFim[k]) !== JSON.stringify(antes[k])),
    avulsos: dado(Object.fromEntries(Object.entries(m.avulsos).filter(([k]) => !NOMES_DO_SAVE.has(k)))),
  };
  return { pedido: m.pedido, casa: m.casa, calados: m.calados, estadoDoFim, eco: dado(eco), soltos: dado(soltos), tela, juiz: r.juiz, juizo: r.juizo, calou: r.calou };
}
