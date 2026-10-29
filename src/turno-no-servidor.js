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
import { oPedidoAoCronista, oGatilhoDoCronista } from "./motor/cronista-do-turno.js";
import { garantirLeitura, pularALeitura, lerALeitura, blocoDaFila } from "./gatilho-do-cronista.js";
import { balcaoDeMantimentos, mapasAVenda, mercadoresDaCidade } from "./mercado.js";
import { regioesDoMapa } from "./geografia.js";
import { fatorDePreco } from "./crime.js";
import { fatorDaOficina } from "./dominios.js";
import { garantirSuprimentos } from "./ermos.js";
import { fatorDeMercado } from "./posturas.js";
import { precoDeCompraPara } from "./profissoes.js";

export const TURNO_NO_SERVIDOR = Object.freeze({
  /* o nome que a semente usa quando a campanha não tem nome (o mesmo do
     `sementeMundo` do App) */
  semNome: "aventura",
  /* quantos lugares onde o turno calou o ensaio guarda */
  caladosMax: 40,
  /* a narração mais curta que o Cronista lê (o `cronistaDoTurno` do App:
     abaixo disto, nem o gatilho corre, nem a fila anda) */
  cronistaMinimo: 60,
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
  const semente = hashSemente(`${SEMENTE_DA_CASA}|${casa}`);
  const corrente = rng(semente);
  let tirados = 0;
  const sorte = () => { tirados++; return corrente(); };
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
  /* a corrente onde a montagem a deixou, quantas vezes o depois a pedir */
  const ate = tirados;
  const retomar = () => { const g = rng(semente); for (let i = 0; i < ate; i++) g(); return g; };
  return { pedido: r2.pedido, casa, calados, estadoDoFim: { ...e0, ...r1.escritas, ...r2.escritas }, e0, sorte, retomar, saida: r2.saida, avulsos, frase: typeof frase === "string" ? frase : "" };
}

const arr = (x) => (Array.isArray(x) ? x : []);
const obj = (x) => (ehObjeto(x) ? x : {});
const dado = (x) => { try { return x === undefined ? null : JSON.parse(JSON.stringify(x)); } catch { return null; } };
const NOMES_DO_SAVE = new Set(CAMPOS.map((c) => c.campo));

/* AS BANCAS E O BALCÃO DA FOTO DO JUIZ (29/10, trilha B). No App a foto
   leva `bancasDaCena()` e `balcaoAqui()`, que leem `mercadoAqui` — um
   const do RENDER, que o servidor não tem. Sem eles a foto ia sem mercado,
   e o Juiz não tinha contra o que pôr um preço: um preço errado numa cidade
   com banca saía «sem mesa» (só se mede) em vez de «contra a mesa» (o veto,
   com o número certo, na pauta do turno seguinte).

   Refaz-se aqui do estado, pela regra das peças da pauta e do pedido
   (`mercadoAqui` de pauta-do-turno.js e pedido-do-turno.js, que refazem a
   banca do instante desde 1409f0b): a cidade, o dia, o mapa, a lei, a
   masmorra, a jornada e a postura do INSTANTE (o estado depois da
   montagem, o dos refs na hora da foto); o herói, o mercado (os comprados,
   o ambulante, as pressões, as pechinchas) e os governos do RENDER (o
   estado de antes do turno, como o `enviar` os vê). É a praça que a pauta
   do turno mostrou ao Narrador — e é contra ela que se julga o que ele
   disse. O App ainda lê a praça do último render (a cidade e o dia do
   desenho da tela); nos turnos gravados as duas dão o mesmo mercado
   (a medida está na suíte), e onde diferirem a do instante é a que a
   pauta viu. Só o que o Juiz lê sai daqui: o nome, o preço e o id de cada
   coisa, e o tipo da banca (o caixa e a pechincha da tela ficam). */
const cidadeDoMapa = (mapa, nome) => arr(obj(mapa).cidades).find((c) => c && String(c.nome || "").toLowerCase() === String(nome || "").toLowerCase()) || null;
export function aPracaDoJuiz(antes, agora) {
  const R = obj(antes), E = obj(agora);
  const merc = obj(R.mercado), pers = R.personagem, cidade = cidadeDoMapa(E.mapa, E.cidadeAtual);
  const comprados = obj(merc.comprados);
  const semGasto = (m) => ({ ...m, estoque: arr(m.estoque).filter((it) => !arr(comprados[m.id]).includes(it.nome)) });
  const lista = [];
  const amb = merc.ambulante, j = E.jornada;
  if (amb && j && (!amb.trecho || amb.trecho === (j.de || "") + ">" + (j.para || ""))) lista.push(semGasto(amb));
  const lexico = obj(E.mundo || R.mundo).lexico;
  if (cidade) lista.push(...mercadoresDaCidade(cidade, E.dia, (pers && pers.nivel) || 1, lexico, {
    pressoes: merc.pressoes || {},
    oficina: (g) => { const f = fatorDaOficina(obj(R.governos)[cidade.nome], g, cidade); return f === 1 ? null : { fator: f, porque: "a casa de ofício daqui fabrica isto" }; },
  }).map(semGasto));
  const ocultas = regioesDoMapa(E.mapa, { conhecidas: false });
  if (ocultas.length) {
    const porRegiao = {};
    for (const c of arr(obj(E.mapa).cidades)) if (c && c.regiao) porRegiao[c.regiao] = (porRegiao[c.regiao] || 0) + 1;
    const mapas = mapasAVenda(ocultas, porRegiao);
    for (const l of lista) {
      if (l.tipo !== "geral" && l.tipo !== "relicario") continue;
      l.estoque = [...l.estoque, ...mapas.filter((mp) => !arr(comprados[l.id]).includes(mp.nome))];
    }
  }
  const barg = obj(merc.pechinchas);
  const todas = lista.map((l) => {
    const b = barg[l.id];
    const aj = (b && b.dia === E.dia && b.ajuste) || 1;
    return { id: l.id, tipo: l.tipo, estoque: arr(l.estoque).map((it) => ({ ...it, preco: Math.max(1, Math.round(precoDeCompraPara(pers, it.preco) * aj * fatorDePreco(E.lei, cidade, E.dia))) })) };
  });
  /* bancasDaCena: na masmorra aberta nenhuma; na estrada só a carroça */
  const bancas = E.masmorra && !E.masmorra.encerrada ? [] : E.jornada ? todas.filter((m) => m && m.tipo === "ambulante") : E.cidadeAtual ? todas : [];
  const balcao = E.cidadeAtual && !E.jornada && !E.masmorra ? balcaoDeMantimentos(cidade, {
    dia: E.dia, pressoes: obj(E.mercado).pressoes || {},
    extra: fatorDeMercado(obj(E.postura).postura, { vendendo: false }),
    temKit: garantirSuprimentos(obj(E.personagem || pers).suprimentos).kit,
  }) : [];
  return { bancas, balcao: arr(balcao) };
}

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
     (o `t` da última cena do registo). As bancas da cena e o balcão
     refazem-se do estado (`aPracaDoJuiz`: o render de antes do turno, a
     cidade e o dia do instante); se a praça estourar, a foto vai sem elas,
     como ia antes — o mercado nunca cala o Juiz.
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
  let praca = { bancas: [], balcao: [] };
  try { praca = aPracaDoJuiz(m.e0, e); } catch { /* sem praça, o Juiz julga o resto */ }
  let genero = "", molde = null;
  try { genero = mundo.genero || cenarioAtivo().generos.padrao; molde = moldePorId(mundo.molde || MOLDE_PADRAO); } catch { /* o mundo torto cala a foto, não o turno */ }
  const foto = {
    personagem: e.personagem, npcs: e.npcs, mapa: e.mapa, base: e.baseMundo, cidadeAtual: e.cidadeAtual, lugar: e.lugar,
    oferecidos: e.nomesOferecidos, missoes: e.missoes, bancas: praca.bancas, balcao: praca.balcao,
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

/* O CRONISTA DO TURNO, NO SERVIDOR (29/10, trilha B). No App o
   `cronistaDoTurno` corre DEPOIS do Mestre (o aplicar, o códex, a chegada,
   o Juiz): lê o estado assente (`estadoDoCronista()`), e o gatilho decide
   se a narração vai à rede AGORA ou espera na fila (`leituraDoCronista`,
   campo do save). Aqui, na mesma ordem e com as mesmas peças:
   - narração abaixo de `cronistaMinimo`: o Cronista nem se pergunta — sem
     passo, sem fila (o `return` do App);
   - o gatilho (`oGatilhoDoCronista`) sobre o estado de depois do Mestre, a
     frase da bolsa e as linhas do turno (a nota e o conteúdo);
   - acende: o pedido leva a fila (`blocoDaFila`) e vai à porta; resposta
     em objeto, a fila zera (`lerALeitura`); porta que falha, que falta ou
     que não dá objeto: a narração entra na fila (`pularALeitura`) e o
     turno fica sem Cronista, como no App quando ele não responde;
   - não acende: a fila anda (`pularALeitura`) e o passo do Cronista corre
     com a resposta vazia (`{}`), como no App — as secções que são só
     código (o segredo revelado) correm igual, e é isso que poupa a chamada.
   A FILA VIAJA NO SAVE, não no eco: `leituraDoCronista` é campo de
   estado.js (o App grava-o e o load lê-o), e o eco é por definição o que o
   load zera (eco-do-turno.js) — o mesmo valor por dois canais seriam duas
   verdades, e a do eco passaria por cima da do save. */
function oCronistaDoServidor(m, resposta, depoisDoMestre) {
  const narrativa = String(obj(resposta).narrativa || "");
  const leitura = garantirLeitura(obj(m.estadoDoFim).leituraDoCronista);
  if (!narrativa || narrativa.length < TURNO_NO_SERVIDOR.cronistaMinimo) return { pergunta: false, corre: false, motivos: [], leitura: null, pedido: null };
  const E = obj(depoisDoMestre);
  const nota = obj(m.saida).nota == null ? "" : String(obj(m.saida).nota);
  let frase = "";
  try { const pb = lerOPedido(m.frase); frase = pb && pb.doJogador ? pb.texto : ""; } catch { frase = ""; }
  let g = { corre: true, motivos: [] };
  try { g = oGatilhoDoCronista(E, { narrativa, doTurno: { frase, envelopes: [...nota.split("\n"), ...String(m.frase || "").split("\n")] }, pers: E.personagem }, leitura); } catch { g = { corre: true, motivos: [] }; }
  let pedido = null;
  if (g.corre) {
    let fila = "";
    try { fila = blocoDaFila(leitura); } catch { fila = ""; }
    pedido = oPedidoAoCronista({ ...E, npcs: obj(E.npcs) }, { narrativa, fila });
  }
  return { pergunta: true, corre: !!g.corre, motivos: arr(g.motivos), leitura, pedido, narrativa };
}

/* O TURNO INTEIRO NO SERVIDOR, sobre uma resposta já dada. `corpo`:
   `{ estado, frase, eco, bilhetes, resposta: { narrativa, mudancas } }`;
   `opcoes`: `{ agora, cronista }` — `cronista(pedido)` recebe o pedido ao
   Cronista (`{ sys, user }`, o de oPedidoAoCronista) e devolve a proposta
   (ou null; pode ser async). Só é chamada quando o gatilho acende.
   Devolve `{ pedido, casa, calados, estadoDoFim, eco, soltos, tela, juiz,
   entradaDoJuiz, cronista, juizo, calou }` — `cronista` é o que o turno
   decidiu do Cronista: `{ pergunta, corre, motivos, chamado }` (`chamado`:
   a porta foi chamada, logo uma 2.ª chamada de IA neste turno). Lança onde
   a montagem lança.

   AS DUAS PASSAGENS. O Cronista lê o estado de DEPOIS do Mestre, e a
   proposta dele entra no último passo do replay: a 1.ª passagem corre o
   depois sem Cronista (o passo dele não corre sem proposta) e dá o estado
   que ele lê; a 2.ª corre o depois inteiro com a proposta. As duas com a
   MESMA função do replay e a corrente da sorte retomada onde a montagem a
   deixou — a 2.ª é, passo a passo, a 1.ª mais o Cronista. Sem proposta
   (não houve resposta), a 1.ª é o turno. */
export async function oTurnoNoServidor(corpo, opcoes) {
  const op = obj(opcoes);
  const m = await montar(corpo, opcoes);
  const resposta = obj(obj(corpo).resposta);
  const L0 = aLinhaDoServidor(m, resposta, null);
  const contexto = () => ({ semente: L0.mundo.semente, mundo: L0.mundo, so: "depois", casa: m.retomar() });
  const r0 = correrOTurno(m.estadoDoFim, L0.linha, contexto());
  const cr = oCronistaDoServidor(m, resposta, r0.estado);
  let proposta = null, chamado = false;
  if (cr.pergunta && cr.corre) {
    if (typeof op.cronista === "function") {
      chamado = true;
      try { proposta = await op.cronista(cr.pedido); } catch { m.calados.length < TURNO_NO_SERVIDOR.caladosMax && m.calados.push("o Cronista"); proposta = null; }
    }
    if (!ehObjeto(proposta)) proposta = null;
  } else if (cr.pergunta) proposta = {};
  let leitura;
  try { leitura = !cr.pergunta ? null : cr.corre && proposta ? lerALeitura(cr.leitura, cr.narrativa) : pularALeitura(cr.leitura, cr.narrativa); } catch { leitura = null; }
  const L = proposta ? aLinhaDoServidor(m, resposta, proposta) : L0;
  const r = proposta ? correrOTurno(m.estadoDoFim, L.linha, contexto()) : r0;
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
  if (leitura) estadoDoFim.leituraDoCronista = leitura;
  const antes = obj(obj(corpo).estado);
  const tela = {
    narrativa: obj(r.tela).narrativa || "",
    linhas: arr(obj(r.tela).linhas),
    campos: Object.keys(estadoDoFim).filter((k) => k !== "versao" && JSON.stringify(estadoDoFim[k]) !== JSON.stringify(antes[k])),
    avulsos: dado(Object.fromEntries(Object.entries(m.avulsos).filter(([k]) => !NOMES_DO_SAVE.has(k)))),
  };
  const cronista = { pergunta: cr.pergunta, corre: cr.corre, motivos: cr.motivos, chamado };
  return { pedido: m.pedido, casa: m.casa, calados: m.calados, estadoDoFim, eco: dado(eco), soltos: dado(soltos), tela, juiz: r.juiz, entradaDoJuiz: L.linha.juiz ? L.linha.juiz.entrada : null, cronista, juizo: r.juizo, calou: r.calou };
}
