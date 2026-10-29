/* ============================================================
   A SESSÃO COMO ARQUIVO (Fase T3, trilha B, 28/10/2026) — Taverna

   POR QUE ELE EXISTE. Um jogo sem servidor só tem um árbitro: a semente
   (CLAUDE.md, "determinismo por semente"). Mas a semente sozinha não
   refaz uma campanha — o Narrador e o Cronista são IA, e a IA não se
   repete. O que refaz é a semente MAIS tudo o que entrou de fora em cada
   turno: a frase do jogador, a resposta crua do Narrador, a proposta crua
   do Cronista. Com isso gravado, o motor corre outra vez em Node, sem
   React e sem rede, e o estado de cada turno tem de sair igual ao que o
   jogo teve. Onde não sai, o arquivo diz em que turno, em que campo e de
   quem é a culpa — o motor que mudou, ou a parte do turno que ainda mora
   no App. É a prova da Fase 3 (mente/plano-motor.md: "um replay reproduz
   a 12.ª sessão turno a turno"), e é o que a sala, a auditoria e o
   licenciamento vão precisar.

   ---------------- O ARQUIVO ----------------

     {
       formato: "taverna-sessao", versao: 1,
       semente,        a semente do mundo (o `sementeMundo()` do App)
       mundo?,         a base do mundo que o turno lê: { semente, genero,
                       molde, lex } (o `mundoDaBase()` sem o mapa e a base,
                       que já vivem no estado). Sem ele, o turno corre sem
                       mundo, como as suítes.
       origem?,        de onde veio, em texto livre
       inicio,         o save v2 ao abrir a sessão (`saveDoEstado`)
       turnos: [ a linha de cada turno, abaixo ]
       virada?,        a página que esta é, quando o arquivo guardado virou
                       a página (sessao-guardada.js): { pagina, turnosAntes,
                       cortou } — o número dela (2, 3…), quantos turnos se
                       gravaram nas páginas de antes e quantos desses já
                       não estão em parte nenhuma. Sem ela, é a primeira.
       anterior?       a página de antes, inteira (um arquivo destes, sem a
                       `anterior` dela): o replay lê-a à parte. Um leitor
                       antigo ignora os dois campos, e lê a página igual.
     }

   A LINHA DE UM TURNO:

     n           o número do turno na sessão (1, 2, 3…, sem buracos)
     entrada     { frase } — o que o jogador escreveu, cru — ou { toque }
                 — o botão que ele tocou ({ tipo, … }); uma das duas, nunca
                 as duas. `lugaresDaqui?`: os sítios a que a frase podia
                 levar NAQUELE turno ([{ nome, onde }], o `lugaresDaqui()`
                 do App), porque a régua do sítio pela frase lê-os e eles
                 saem da semente e do lugar de agora.
     sorte       { ponto, contagem?, casa? } — o ponto da sorte do turno
                 (`pontoDaSorte()`, "dia|minuto|falas"), a contagem da
                 sorte ANTES de o turno pedir a salvaguarda
                 (`contagemDaSorteRef.current`) e a semente com que o envio
                 semeou a casa (`${semente}|${ponto do envio}`).
     pedido      { pauta, envelopes?, nomesAMao?, moeda? } — o que foi ao
                 Narrador: o texto da pauta, os envelopes do turno, os
                 nomes à mão que a pauta ofereceu ([{ nome, genero }], o
                 `nomesOferecidosRef.current`) e a moeda da bolsa.
     narrador    { narrativa, mudancas } — a resposta crua, já em objeto
                 (o parse é do App), ANTES de a poda da luta lhe tocar.
     cronista    { proposta, juizo } ou null — a proposta crua do Cronista,
                 já em objeto, e o juízo que o motor deu
                 (`julgarOCronista`: { aceito, recusado, ditoPor }). null
                 quando o Cronista não respondeu.
     juiz        { resumo, entrada?, antesDoArquivo? } ou null — o veredito
                 do Juiz de fidelidade (`julgarOTurno(...).resumo`) e, se
                 couber, a entrada dele (`entradaDoJuiz(...)`): com a
                 entrada, o replay julga outra vez e compara; sem ela, só
                 guarda. As narrações de antes que a entrada leva já estão
                 nas linhas anteriores: quando são as últimas do arquivo, a
                 linha guarda só quantas são (`antesDoArquivo`).
     estado      o estado DEPOIS do turno, como diferença do anterior —
                 { troca: { campo: valor }, chaves: { campo: { poe, tira } },
                 soma: { campo: [itens] }, some: [campo] }. Um save inteiro
                 por turno não cabe num localStorage; a diferença cabe. O
                 gravador escolhe a forma de cada campo e confere que a
                 diferença refaz o estado byte a byte — se não refaz, troca
                 o campo inteiro.
     app?        [{ orgao, campos, o? }] — o que um órgão do App fez neste
                 turno e o replay não corre, quando quem grava o SABE: os
                 caminhos do estado que ele escreveu (`campos`, podem ser
                 nenhum) e o quê. Quem o escreve hoje é o gravador das
                 sessões de prova (testes/gravar-sessoes-de-prova.mjs),
                 onde o oráculo faz as vezes do App (a viagem, o sítio, o
                 nome à mão que o registo não gravou, a luta); a fiação do
                 App não precisa de o escrever — o que ela deixa por fazer
                 está em AINDA_DO_APP.

   Campo novo, ignorado pela versão antiga: o arquivo não é o save, e o
   save não muda por causa dele. O validador deixa passar o campo que não
   conhece (um arquivo de amanhã abre hoje), e recusa uma `versao` maior
   do que a dele.

   ---------------- O QUE A FIAÇÃO DO APP TEM DE ENTREGAR ----------------

   Quem grava não é este módulo: é a fiação no App (trilha A, numa fatia
   futura). Ao abrir ou continuar a campanha:

     sessao = abrirASessao({ semente: sementeMundo(), estado: retratoDoJogo(),
                             mundo: { semente, genero, molde, lex } })

   e no FIM de cada turno (depois do Cronista, quando o estado assentou),
   dentro de `calou`, uma chamada:

     sessao = gravarOTurno(sessao, {
       entrada:  { frase: <o texto cru que subiu> } ou { toque: {...} },
                 + lugaresDaqui: lugaresDaqui() tirado no envio,
       sorte:    { ponto: pontoDaSorte() no momento do aplicarOTurno,
                   contagem: contagemDaSorteRef.current ANTES do
                   sorteDoTurno("salvaguarda"),
                   casa: `${sementeMundo()}|${pontoDaSorte()}` do envio },
       pedido:   { pauta: <o texto da pauta enviada>, envelopes: op.envelopes,
                   nomesAMao: nomesOferecidosRef.current, moeda: op.moeda },
       narrador: { narrativa, mudancas } — a resposta crua, antes da poda,
       cronista: { proposta: r (o objeto do Cronista), juizo } ou null,
       juiz:     { resumo: doJuiz.resumo, entrada: a entradaDoJuiz do turno },
       estado:   retratoDoJogo() do fim do turno (com npcTurno),
     })

   Onde guardar o `sessao` (uma chave própria do localStorage, um arquivo
   para descarregar) é da fiação; o formato não muda por isso.

   ---------------- O REPLAY ----------------

     reproduzirASessao(arquivo, { encadeado }) → o relatório

   Corre, turno a turno, os passos do turno que já são puros
   (PASSOS_DO_REPLAY, abaixo, na ordem do App) sobre o estado de antes, com
   as respostas gravadas, e compara o estado que sai com o gravado. Por
   omissão cada turno parte do estado GRAVADO do turno anterior — assim um
   turno que diverge não suja os de depois, e cada divergência diz a sua
   própria culpa. `encadeado: true` parte só do `inicio` e nunca se
   ressincroniza: é a corrida inteira, e a primeira divergência é onde o
   jogo deixou de ser reproduzível.

   A DÍVIDA E O DEFEITO (28/10, T3-B). Cada diferença é de um de dois
   donos. É DÍVIDA DO APP quando o campo está em AINDA_DO_APP (um órgão do
   App que ainda escreve aquele campo em todo turno: a mesa, o compasso, o
   relógio…) ou quando a linha diz, em `app`, que um órgão do App o
   escreveu naquele turno; a dívida conta-se à parte, por campo e por
   turno, e não é defeito. Tudo o resto é DEFEITO DO MOTOR — e também o
   juízo do Cronista e o veredito do Juiz que mudam, e o passo que estoura.
   O porquê de cada defeito sai de DONO_DO_CAMPO (que parte do motor
   escreve o campo); o campo que não está em nenhuma das duas tabelas é
   defeito "sem dono" até alguém o reclamar. Os campos de bastidor e o
   relato ficam fora da régua (FORA_DA_REGUA): não são jogo.

   Três contas saem do relatório: `reproduzidos` (o turno sai igual em
   tudo), `defeitos` (os turnos em que o motor diverge) e `soOMotor` (o
   turno que sai igual e em que nenhum órgão do App mexeu — o que o motor
   joga sozinho). A diferença entre `reproduzidos` e `soOMotor` são os
   turnos que reproduzem com a ajuda declarada do App: a luta que guarda
   os combatentes fora do estado, ou o sítio que o App mudou e o Cronista
   repôs. É aqui, e só aqui, que essa diferença se explica.

   Cada turno é `correrOTurno` (exportado: o gravador das sessões de prova,
   testes/gravar-sessoes-de-prova.mjs, escreve a linha com ele, e por isso o
   arquivo e o replay andam pelo mesmo caminho).

   O QUE ELE NÃO FAZ. Não chama IA, não toca o React, não grava nada.
   O aceito do Cronista é a peça do jogo (oAceitoDoCronista, desde 28/10):
   as portas do App que ela chama e que ainda não são motor (o núcleo, a
   nêmesis, a ficha do recrutado) entram como DUBLÊS DECLARADOS
   (PORTAS_DO_CRONISTA_NO_REPLAY): não escrevem, gravam a chamada, e o que
   o App escreveu por elas no turno é dívida da porta. O mural, a fé, o arco
   e a conferência das missões já são a fábrica dos órgãos do depois
   (motor/depois-do-turno.js), desde 29/10.
   A única coisa fora do puro é a casa (`semearACasa`), que é global no
   jogo também: semeia-se como o envio a semeou, e só quando o arquivo diz.

   O RESUMO, PARA UMA PESSOA LER (28/10, T3-B):

     resumoDaSessao(arquivo, relatorio?) → { turnos, reproduzidos, soOMotor,
       defeitos: [{ n, diferencas, porque }], divida: { campos: [{ campo,
       orgao, desde, turnos }], doTurno: [{ n, orgao, campos, divergiu }] },
       juiz: { julgados, limpos, achados, por, pauta, iguais, rejulgados } }

   O que o `replay.mjs --resumo` imprime: quantos turnos reproduzem, os
   defeitos do motor turno a turno, a dívida do App (a da tabela, e a que as
   linhas declaram) e o veredito do Juiz somado sobre a sessão inteira — as
   invenções da prosa por classe (CLASSES_DO_JUIZ), com a conta do
   `somarAFidelidade` do jogo. Sem o relatório, corre o replay.

   Provado em `testes/teste-sessao.mjs`; o executável é `testes/replay.mjs`.
   ============================================================ */

import { estadoDoSave, saveDoEstado, camposDoGrupo, CAMPOS } from "./estado.js";
import { CAMPOS_DO_SERVIDOR, oEstadoDoServidor } from "./motor/eco-do-turno.js";
import { lugarPedido } from "./lugar.js";
import { oTempoDoTurno, oPassoDoReplay } from "./motor/tempo-do-turno.js";
import { semearACasa, comSorte } from "./semente.js";
import { aplicarOTurno, contextoDoNomeCom, notaComOTurno } from "./motor/aplicar.js";
import { osOrgaosDoDepois } from "./motor/depois-do-turno.js";
import { oTrabalhoPendente, aQueda } from "./motor/entrega-do-turno.js";
import { aplicarOCodex, aplicarAChegada } from "./motor/fim-do-turno.js";
import { oAntesDoMestre } from "./motor/antes-do-mestre.js";
import { julgarOCronista } from "./motor/cronista.js";
import { oAceitoDoCronista } from "./motor/cronista-do-turno.js";
import { registrarOLugar } from "./motor/meio-do-turno.js";
import { genteDaHistoria } from "./ofertas.js";
import { julgarOTurno, JUIZ_NO_TURNO, CLASSES_DO_JUIZ, somarAFidelidade } from "./motor/juiz-do-turno.js";
import { vetosDoVeredito, andarOsVetos, vetosParaAPauta, canoneSemInvencao, juizCego } from "./motor/correcao-do-juiz.js";
import { sorteNoPonto, CONTAGEM_VAZIA } from "./motor/sorte-do-turno.js";
import { oBoatoDaChegada, oBoatoQueChegou } from "./boatos.js";

/* ---------------- O FORMATO (se é número, é tabela) ---------------- */
export const FORMATO_DA_SESSAO = Object.freeze({
  formato: "taverna-sessao",
  versao: 1,
  /* "dia|minuto|falas", como `pontoDaSorte` o escreve */
  ponto: /^-?\d+(?:\.\d+)?\|-?\d+(?:\.\d+)?\|\d+$/,
  /* o relatório: quantas diferenças de um turno ele mostra, até que
     profundidade desce no estado, e o tamanho de cada valor citado */
  diferencasPorTurno: 12,
  profundidade: 3,
  valorCitado: 80,
});

const TIPOS = Object.freeze({
  texto: (x) => typeof x === "string",
  inteiro: (x) => Number.isInteger(x),
  objeto: (x) => x !== null && typeof x === "object" && !Array.isArray(x),
  lista: (x) => Array.isArray(x),
  textoOuLista: (x) => typeof x === "string" || (Array.isArray(x) && x.every((y) => typeof y === "string")),
  objetoOuNulo: (x) => x === null || (typeof x === "object" && !Array.isArray(x)),
});

/* cada parte do arquivo, campo a campo: o tipo e se é obrigatório. O
   validador lê esta tabela; a suíte também. */
export const CAMPOS_DA_SESSAO = Object.freeze({
  cabeca: [
    { campo: "formato", tipo: "texto", obrigatorio: true },
    { campo: "versao", tipo: "inteiro", obrigatorio: true },
    { campo: "semente", tipo: "texto", obrigatorio: true },
    { campo: "inicio", tipo: "objeto", obrigatorio: true },
    { campo: "mundo", tipo: "objetoOuNulo", obrigatorio: false },
    { campo: "origem", tipo: "texto", obrigatorio: false },
    { campo: "turnos", tipo: "lista", obrigatorio: true },
    { campo: "virada", tipo: "objeto", obrigatorio: false },
    { campo: "anterior", tipo: "objeto", obrigatorio: false },
  ],
  turno: [
    { campo: "n", tipo: "inteiro", obrigatorio: true },
    { campo: "entrada", tipo: "objeto", obrigatorio: true },
    { campo: "sorte", tipo: "objeto", obrigatorio: true },
    { campo: "pedido", tipo: "objeto", obrigatorio: true },
    { campo: "narrador", tipo: "objeto", obrigatorio: true },
    { campo: "cronista", tipo: "objetoOuNulo", obrigatorio: true },
    { campo: "juiz", tipo: "objetoOuNulo", obrigatorio: true },
    { campo: "estado", tipo: "objeto", obrigatorio: true },
    { campo: "app", tipo: "lista", obrigatorio: false },
  ],
  entrada: [
    { campo: "frase", tipo: "texto", obrigatorio: false },
    { campo: "toque", tipo: "objeto", obrigatorio: false },
    { campo: "lugaresDaqui", tipo: "lista", obrigatorio: false },
  ],
  sorte: [
    { campo: "ponto", tipo: "texto", obrigatorio: true },
    { campo: "contagem", tipo: "objeto", obrigatorio: false },
    { campo: "casa", tipo: "texto", obrigatorio: false },
  ],
  pedido: [
    { campo: "pauta", tipo: "texto", obrigatorio: true },
    { campo: "envelopes", tipo: "textoOuLista", obrigatorio: false },
    { campo: "nomesAMao", tipo: "lista", obrigatorio: false },
    { campo: "moeda", tipo: "texto", obrigatorio: false },
  ],
  narrador: [
    { campo: "narrativa", tipo: "texto", obrigatorio: true },
    { campo: "mudancas", tipo: "objeto", obrigatorio: true },
  ],
  cronista: [
    { campo: "proposta", tipo: "objetoOuNulo", obrigatorio: true },
    { campo: "juizo", tipo: "objetoOuNulo", obrigatorio: true },
  ],
  juiz: [
    { campo: "resumo", tipo: "objeto", obrigatorio: true },
    { campo: "entrada", tipo: "objeto", obrigatorio: false },
    { campo: "antesDoArquivo", tipo: "inteiro", obrigatorio: false },
  ],
  estado: [
    { campo: "troca", tipo: "objeto", obrigatorio: false },
    { campo: "chaves", tipo: "objeto", obrigatorio: false },
    { campo: "soma", tipo: "objeto", obrigatorio: false },
    { campo: "some", tipo: "lista", obrigatorio: false },
  ],
});

/* ---------------- O CHÃO ---------------- */
const ehObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const obj = (x) => (ehObj(x) ? x : {});
const arr = (x) => (Array.isArray(x) ? x : []);
const tem = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const sem = (x) => String(x == null ? "" : x).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").trim();
/* o dado puro: o que o JSON guarda (funções e ciclos não vão ao arquivo) */
const dado = (x) => { try { return x === undefined ? null : JSON.parse(JSON.stringify(x)); } catch { return null; } };
const J = (x) => JSON.stringify(x);
/* a igualdade do replay não depende da ordem das chaves */
const canonico = (x) => JSON.stringify(x, (k, v) => (ehObj(v) ? Object.fromEntries(Object.keys(v).sort().map((c) => [c, v[c]])) : v));
const cita = (x) => { const s = x === undefined ? "(ausente)" : J(x); return s.length > FORMATO_DA_SESSAO.valorCitado ? s.slice(0, FORMATO_DA_SESSAO.valorCitado - 1) + "…" : s; };
/* o estado como vai ao arquivo: o save v2, em dado puro */
const comoSave = (e) => dado(saveDoEstado(e));

/* ---------------- A DIFERENÇA DE UM ESTADO PARA O SEGUINTE ---------------- */
function aplicarDiferenca(antes, dif, erros, caminho) {
  const e = { ...obj(antes) };
  const d = obj(dif);
  for (const k of arr(d.some)) delete e[k];
  for (const [k, v] of Object.entries(obj(d.troca))) e[k] = v;
  for (const [k, m] of Object.entries(obj(d.chaves))) {
    if (!ehObj(e[k])) { erros.push({ caminho: `${caminho}.chaves.${k}`, motivo: "o campo não é objeto no estado de antes" }); continue; }
    const o = { ...e[k] };
    for (const c of arr(obj(m).tira)) delete o[c];
    Object.assign(o, obj(obj(m).poe));
    e[k] = o;
  }
  for (const [k, itens] of Object.entries(obj(d.soma))) {
    if (!Array.isArray(e[k])) { erros.push({ caminho: `${caminho}.soma.${k}`, motivo: "o campo não é lista no estado de antes" }); continue; }
    if (!Array.isArray(itens)) { erros.push({ caminho: `${caminho}.soma.${k}`, motivo: "a soma não é lista" }); continue; }
    e[k] = [...e[k], ...itens];
  }
  return e;
}

/* a diferença mais curta que refaz `depois` a partir de `antes`, byte a byte */
function diferencaDe(antes, depois) {
  const a = obj(antes), b = obj(depois);
  const troca = {}, chaves = {}, soma = {}, some = [];
  for (const k of Object.keys(a)) if (!tem(b, k)) some.push(k);
  for (const k of Object.keys(b)) {
    const va = a[k], vb = b[k];
    if (tem(a, k) && J(va) === J(vb)) continue;
    if (Array.isArray(va) && Array.isArray(vb) && vb.length > va.length && va.every((x, i) => J(x) === J(vb[i]))) { soma[k] = vb.slice(va.length); continue; }
    if (ehObj(va) && ehObj(vb)) {
      const poe = {}, tira = [];
      for (const c of Object.keys(va)) if (!tem(vb, c)) tira.push(c);
      for (const c of Object.keys(vb)) if (!tem(va, c) || J(va[c]) !== J(vb[c])) poe[c] = vb[c];
      const m = { ...(Object.keys(poe).length ? { poe } : {}), ...(tira.length ? { tira } : {}) };
      const refeito = { ...va };
      for (const c of tira) delete refeito[c];
      Object.assign(refeito, poe);
      if (J(refeito) === J(vb) && J(m).length < J(vb).length) { chaves[k] = m; continue; }
    }
    troca[k] = vb;
  }
  const d = {};
  if (Object.keys(troca).length) d.troca = troca;
  if (Object.keys(chaves).length) d.chaves = chaves;
  if (Object.keys(soma).length) d.soma = soma;
  if (some.length) d.some = some;
  /* a ordem das chaves do estado também tem de voltar igual: se a
     diferença não a refaz, o estado vai inteiro */
  return J(aplicarDiferenca(a, d, [], "")) === J(b) ? d : { troca: b, some: Object.keys(a).filter((k) => !tem(b, k)) };
}

/* as narrações do arquivo antes da linha `i`, como o Juiz as lê (as vazias
   não contam, e só as últimas que ele lê) */
const narracoesDoArquivo = (turnos, i) => turnos.slice(0, i).map((t) => String(obj(obj(t).narrador).narrativa || "")).filter((x) => x.trim()).slice(-JUIZ_NO_TURNO.narracoesAntes);

/* o estado gravado ao fim do turno `n` (0 = o início) */
export function estadoNoTurno(arquivo, n) {
  const A = obj(arquivo);
  let e = obj(dado(A.inicio));
  const ts = arr(A.turnos);
  const ate = Number.isInteger(n) ? Math.max(0, Math.min(n, ts.length)) : ts.length;
  for (let i = 0; i < ate; i++) e = aplicarDiferenca(e, obj(ts[i]).estado, [], `turnos[${i}].estado`);
  return e;
}

/* ---------------- O GRAVADOR ---------------- */

/* a cabeça do arquivo, ao abrir (ou continuar) a campanha */
export function abrirASessao(cfg) {
  const c = obj(cfg);
  return {
    formato: FORMATO_DA_SESSAO.formato,
    versao: FORMATO_DA_SESSAO.versao,
    semente: String(c.semente == null ? "" : c.semente),
    ...(ehObj(c.mundo) ? { mundo: dado(c.mundo) } : {}),
    ...(typeof c.origem === "string" && c.origem ? { origem: c.origem } : {}),
    inicio: comoSave(c.estado),
    turnos: [],
  };
}

/* entra o turno, sai a linha do arquivo. Puro, e nunca lança: o lixo vira
   o vazio do seu tipo (e o validador diz o que ficou de fora) */
export function linhaDaSessao(turno, ctx) {
  const t = obj(turno), c = obj(ctx);
  const en = obj(t.entrada), so = obj(t.sorte), pe = obj(t.pedido), na = obj(t.narrador);
  const entrada = ehObj(en.toque) && typeof en.frase !== "string" ? { toque: dado(en.toque) } : { frase: String(en.frase == null ? "" : en.frase) };
  if (Array.isArray(en.lugaresDaqui)) entrada.lugaresDaqui = dado(en.lugaresDaqui);
  const sorte = { ponto: String(so.ponto == null ? "" : so.ponto) };
  if (ehObj(so.contagem)) sorte.contagem = dado(so.contagem);
  if (typeof so.casa === "string") sorte.casa = so.casa;
  const pedido = { pauta: String(pe.pauta == null ? "" : pe.pauta) };
  if (typeof pe.envelopes === "string" || Array.isArray(pe.envelopes)) pedido.envelopes = Array.isArray(pe.envelopes) ? pe.envelopes.map((x) => String(x)) : pe.envelopes;
  if (Array.isArray(pe.nomesAMao)) pedido.nomesAMao = dado(pe.nomesAMao);
  if (typeof pe.moeda === "string") pedido.moeda = pe.moeda;
  const cr = t.cronista;
  let juiz = null;
  if (ehObj(t.juiz) && ehObj(t.juiz.resumo)) {
    juiz = { resumo: dado(t.juiz.resumo) };
    if (ehObj(t.juiz.entrada)) {
      /* as narrações de antes que o Juiz lê como eco já estão no arquivo, nas
         linhas anteriores: quando são exatamente as últimas dele, a linha
         guarda só quantas são (eram 3/4 do peso do arquivo) */
      const { antes, ...resto } = dado(t.juiz.entrada);
      const ja = arr(c.narracoes);
      const k = Array.isArray(antes) ? antes.length : -1;
      if (k >= 0 && k <= ja.length && J(antes) === J(ja.slice(ja.length - k))) { juiz.entrada = resto; juiz.antesDoArquivo = k; }
      else juiz.entrada = dado(t.juiz.entrada);
    }
  }
  return {
    n: Number.isInteger(c.n) && c.n > 0 ? c.n : 1,
    entrada,
    sorte,
    pedido,
    narrador: { narrativa: String(na.narrativa == null ? "" : na.narrativa), mudancas: ehObj(na.mudancas) ? dado(na.mudancas) : {} },
    cronista: ehObj(cr) ? { proposta: ehObj(cr.proposta) ? dado(cr.proposta) : null, juizo: ehObj(cr.juizo) ? dado(cr.juizo) : null } : null,
    juiz,
    estado: diferencaDe(comoSave(c.antes), comoSave(t.estado)),
    ...(oQueOAppFez(t.app).length ? { app: oQueOAppFez(t.app) } : {}),
  };
}

/* o que um órgão do App fez no turno e o replay não corre: [{ orgao,
   campos, o? }], só os itens com órgão (o resto é lixo e cai) */
const oQueOAppFez = (x) => arr(x).filter((a) => ehObj(a) && typeof a.orgao === "string" && a.orgao.trim()).map((a) => ({
  orgao: a.orgao,
  campos: arr(a.campos).filter((c) => typeof c === "string" && c),
  ...(typeof a.o === "string" && a.o ? { o: a.o } : {}),
}));

/* a linha no fim do arquivo: devolve o arquivo novo, o recebido fica */
export function gravarOTurno(arquivo, turno) {
  const A = obj(arquivo);
  const turnos = arr(A.turnos);
  const linha = linhaDaSessao(turno, { n: turnos.length + 1, antes: estadoNoTurno(A, turnos.length), narracoes: narracoesDoArquivo(turnos, turnos.length) });
  return { ...A, turnos: [...turnos, linha] };
}

/* A PÁGINA QUE VIRA LEVA O ÚLTIMO TURNO (29/10, a 13.ª sessão). Quem
   decide QUANDO a página vira é sessao-guardada.js (o teto); o que é virar
   diz-se aqui, porque é o arquivo: o último turno sai da página velha e é
   o primeiro da nova, que começa no estado de antes dele. Até aqui a
   página nova nascia vazia no fim do último turno, e o turno que provocara
   a virada só existia na velha — que a fiação deitava fora (a 13.ª perdeu
   o T22 assim). A linha que passa leva consigo as narrações que o Juiz lê
   como eco: `antesDoArquivo` apontava para linhas da página velha, e na
   nova volta a ser a lista inteira. A diferença do estado vale igual: a
   base dela é a cabeça da página nova, byte a byte.

     virarAPagina(arquivo) → { velha, nova } — a velha sem o último turno
       (e sem a `anterior` dela), a nova com ele (n = 1); null quando a
       página não tem turno a passar. Puro, e nunca lança. */
export function virarAPagina(arquivo) {
  try {
    const A = obj(arquivo);
    const ts = arr(A.turnos);
    if (!ts.length) return null;
    const i = ts.length - 1, L = obj(ts[i]);
    let juiz = L.juiz;
    if (ehObj(juiz) && Number.isInteger(juiz.antesDoArquivo)) {
      const ja = narracoesDoArquivo(ts, i), k = juiz.antesDoArquivo;
      const { antesDoArquivo, ...resto } = juiz;
      juiz = { ...resto, entrada: { ...obj(resto.entrada), antes: k > 0 ? ja.slice(ja.length - k) : [] } };
    }
    const { anterior, ...cabeca } = A;
    const velha = { ...cabeca, turnos: ts.slice(0, i) };
    const { virada, ...semVirada } = cabeca;
    const nova = { ...semVirada, inicio: estadoNoTurno(A, i), turnos: [{ ...L, n: 1, juiz }] };
    return { velha, nova };
  } catch { return null; }
}

/* ---------------- O VALIDADOR ---------------- */
function conferir(o, tabela, caminho, erros) {
  if (!ehObj(o)) { erros.push({ caminho, motivo: "não é objeto" }); return false; }
  for (const { campo, tipo, obrigatorio } of tabela) {
    const aqui = caminho ? `${caminho}.${campo}` : campo;
    if (!tem(o, campo) || o[campo] === undefined) { if (obrigatorio) erros.push({ caminho: aqui, motivo: "falta" }); continue; }
    if (!TIPOS[tipo](o[campo])) erros.push({ caminho: aqui, motivo: `não é ${tipo}` });
  }
  return true;
}

/* { ok, erros: [{ caminho, motivo }] }. Nunca lança. */
export function validarASessao(arquivo) {
  const erros = [];
  const T = CAMPOS_DA_SESSAO;
  if (!conferir(arquivo, T.cabeca, "", erros)) return { ok: false, erros };
  const A = arquivo;
  if (A.formato !== FORMATO_DA_SESSAO.formato) erros.push({ caminho: "formato", motivo: `não é "${FORMATO_DA_SESSAO.formato}"` });
  if (Number.isInteger(A.versao) && (A.versao < 1 || A.versao > FORMATO_DA_SESSAO.versao)) erros.push({ caminho: "versao", motivo: `versão ${A.versao}: este leitor lê até a ${FORMATO_DA_SESSAO.versao}` });
  /* a página de antes, quando vem junta, valida-se como o arquivo que é */
  if (ehObj(A.anterior)) for (const x of validarASessao(A.anterior).erros) erros.push({ caminho: `anterior.${x.caminho}`, motivo: x.motivo });
  let e = ehObj(A.inicio) ? A.inicio : {};
  arr(A.turnos).forEach((t, i) => {
    const c = `turnos[${i}]`;
    if (!conferir(t, T.turno, c, erros)) return;
    if (Number.isInteger(t.n) && t.n !== i + 1) erros.push({ caminho: `${c}.n`, motivo: `é ${t.n}, e o turno ${i + 1} vem aqui` });
    for (const parte of ["entrada", "sorte", "pedido", "narrador", "cronista", "juiz", "estado"]) if (ehObj(t[parte])) conferir(t[parte], T[parte], `${c}.${parte}`, erros);
    const en = obj(t.entrada);
    const temFrase = typeof en.frase === "string", temToque = ehObj(en.toque);
    if (temFrase === temToque) erros.push({ caminho: `${c}.entrada`, motivo: temFrase ? "tem frase e toque: é um ou outro" : "nem frase nem toque" });
    const ponto = obj(t.sorte).ponto;
    if (typeof ponto === "string" && !FORMATO_DA_SESSAO.ponto.test(ponto)) erros.push({ caminho: `${c}.sorte.ponto`, motivo: `"${ponto.slice(0, 30)}" não é dia|minuto|falas` });
    const k = obj(t.juiz).antesDoArquivo;
    if (Number.isInteger(k) && (k < 0 || k > narracoesDoArquivo(A.turnos, i).length)) erros.push({ caminho: `${c}.juiz.antesDoArquivo`, motivo: `pede ${k} narrações de antes e o arquivo só tem ${narracoesDoArquivo(A.turnos, i).length}` });
    arr(t.app).forEach((a, k) => {
      if (!ehObj(a) || typeof a.orgao !== "string" || !a.orgao.trim()) erros.push({ caminho: `${c}.app[${k}]`, motivo: "o que o App fez leva o órgão (orgao, texto)" });
      else if (!Array.isArray(a.campos) || !a.campos.every((x) => typeof x === "string")) erros.push({ caminho: `${c}.app[${k}].campos`, motivo: "não é lista de caminhos" });
    });
    if (ehObj(t.estado)) e = aplicarDiferenca(e, t.estado, erros, `${c}.estado`);
  });
  return { ok: erros.length === 0, erros };
}

/* ---------------- O REPLAY ---------------- */

/* ---------------- O ACEITO DO CRONISTA, A PEÇA DO JOGO (28/10, trilha B) ----------------
   Até aqui o replay aplicava o aceito numa MINIATURA (a gente, o cânone e
   o lugar, cada um à sua maneira): um segundo Cronista, que não sabia do
   homónimo, do gênero do registo, da peneira do segredo, do dia em que o
   nome entrou, das promessas, do relógio, do teste da concessão grande.
   Desde a 9.ª fatia da T1-A o App aplica o aceito por
   `oAceitoDoCronista` (motor/cronista-do-turno.js), e o replay passa a
   chamar a MESMA peça: o estado que ela lê é o do replay (`ler`), os
   efeitos que ela descreve escrevem nele (EFEITO_DO_CRONISTA_NO_REPLAY), e
   as portas — os órgãos do App que ela chama — são as desta tabela. As que
   têm versão de motor correm-na; as que não têm são DUBLÊS DECLARADOS: não
   escrevem o estado, devolvem o neutro, e gravam a chamada. Um turno do
   jogo em que o App, por uma delas, escreveu um campo diverge nesse campo
   como DÍVIDA da porta (os `campos` daqui), nunca como defeito do motor —
   e quando a porta vier para o motor, troca-se a linha desta tabela. */
export const PORTAS_DO_CRONISTA_NO_REPLAY = Object.freeze({
  registrarLugar: { de: "motor", campos: [], porque: "motor/meio-do-turno.js#registrarOLugar, a régua do lugar do App à letra (o pedido é a frase do turno)" },
  contextoDoNome: { de: "motor", campos: [], porque: "motor/aplicar.js#contextoDoNomeCom sobre a mesma base do nome que o passo do Mestre usa no replay (o herói; as missões, o mural e as falas recentes o App junta-as)" },
  historiaDoMural: { de: "motor", campos: [], porque: "ofertas.js#genteDaHistoria sobre o estado de agora" },
  mundoDaBase: { de: "motor", campos: [], porque: "o mundo gravado, com o mapa e a base do estado de agora (o `mundoDaBase` do App)" },
  nucleoAgora: { de: "dublê", campos: [], porque: "nucleoDaCampanha lê o contexto do elenco e o cache do App: sem núcleo, o favor já pedido pela linha do coração não se apura" },
  /* 29/10 (Fase 4, trilha B): deixou de ser dublê — a porta do mural é a da
     fábrica dos órgãos do depois (trilha A, cc44829), à letra do App */
  pregarNoMural: { de: "motor", campos: [], porque: "motor/depois-do-turno.js#osOrgaosDoDepois → pregarNoMural, a porta única do mural do App à letra (uma pessoa, um trabalho; o que já está no diário não volta), sobre o estado do replay" },
  /* 29/10 (Fase 4, trilha B): as três deixaram de ser dublês — são as da
     fábrica, com o conferente das missões (trilha A, aa4c6df), à letra do App */
  marcarNoArco: { de: "motor", campos: [], porque: "motor/depois-do-turno.js#osOrgaosDoDepois → marcarNoArco (arcoComOMarco com o motorDoArco do App, à letra), sobre o estado do replay" },
  ganharFe: { de: "motor", campos: [], porque: "motor/depois-do-turno.js#osOrgaosDoDepois → ganharFe (ganhoDeFe: os fiéis no mapa, a PF, o grau), sobre o estado do replay" },
  sincronizarNemesis: { de: "dublê", campos: ["nemesis"], porque: "sincronizarNemesis do App (a nêmesis morta no registo): o dublê não encerra" },
  conferirCom: { de: "motor", campos: [], porque: "motor/depois-do-turno.js#osOrgaosDoDepois → conferirCom, o conferente das missões com a conversa ou o segredo do turno (o literal de portasDoCronista do App), sobre o estado do replay" },
  fichaDeCompanheiro: { de: "dublê", campos: ["personagem"], porque: "fichaDeCompanheiro do App (o kit, o vínculo, a ficha do elenco): o dublê dá só o nome" },
  notaDoRecrutamento: { de: "dublê", campos: [], porque: "a nota ao Narrador é bastidor" },
});
/* o neutro que cada dublê devolve (a porta que «não fez nada» no App) */
const NEUTRO_DO_DUBLE = Object.freeze({
  nucleoAgora: () => null,
  sincronizarNemesis: () => undefined, fichaDeCompanheiro: (nome) => ({ nome }), notaDoRecrutamento: () => "",
});
/* o efeito da peça → o campo do estado em que ele escreve (e a chave do
   efeito que leva o valor). `nota`, `calou` e `quests` não são estado: a
   nota é do Narrador (bastidor), o calou vai para o relatório, a lista
   redesenhada é da tela. */
export const EFEITO_DO_CRONISTA_NO_REPLAY = Object.freeze({
  prometido: { campo: "prometido", chave: "prometido" },
  relogios: { campo: "relogios", chave: "relogios" },
  eventos: { campo: "eventos", chave: "eventos" },
  ficha: { campo: "personagem", chave: "personagem" },
  npcs: { campo: "npcs", chave: "npcs" },
  canone: { campo: "canone", chave: "canone" },
  rolagem: { campo: "rolagem", chave: "rolagem" },
});

/* OS ÓRGÃOS DO DEPOIS SOBRE O ESTADO DO REPLAY (29/10, Fase 4, trilha B):
   a fábrica da trilha A (motor/depois-do-turno.js) criada com o estado do
   instante. Sem tela nem disco (nenhum setter, nenhum `salvar`): o que os
   órgãos escrevem volta pelo `aplicar`, e o `calou` diz onde calou. */
/* A fábrica recebe o estado como o load do App o abre: o `null` que o save
   guarda num campo que a peça lê com partida não nula é essa partida
   (oEstadoDoServidor, a regra de motor/eco-do-turno.js) — o replay abre os
   saves por `estadoDoSave`, que dá `null` ao campo que falta, e a fé de um
   save sem devoção estourava («cidades» de null) onde o App, com o
   `garantirDevocao` do load, contava. Só o que o órgão escreve volta. */
const osOrgaosNoReplay = (E, aplicar, calou, pushMsgs) => osOrgaosDoDepois(oEstadoDoServidor(E, {}), { aplicar, calou, ...(pushMsgs ? { pushMsgs } : {}) });

/* O QUE UM ÓRGÃO DO DEPOIS ESCREVE E O TURNO GUARDA (29/10): os campos do
   save; no servidor também o eco e os soltos (a nota ao Narrador, o aviso
   do trabalho). O resto — a contagem da sorte, a conversa do turno, os
   refs de tela — vive num ref do App e morre com o turno: no replay, que
   compara saves, seria divergência sem dono. */
const NOMES_DO_SAVE = new Set(CAMPOS.map((c) => c.campo));
const oQueOTurnoGuarda = (x, ctx) => Object.fromEntries(Object.entries(obj(x)).filter(([k]) => NOMES_DO_SAVE.has(k) || (ctx.servidor && tem(CAMPOS_DO_SERVIDOR, k))));
/* as linhas que um órgão do depois manda ao relato (o `pushMsgs` do App):
   vão à tela (o servidor devolve-as; o replay não as compara) e não ao
   relato do save — a narração também não vai, e o cliente junta as duas.
   Devolver a lista de agora é o que diz à peça que não a junte ela mesma. */
const paraATela = (linhas, lerAgora) => (novas) => {
  for (const m of arr(novas)) linhas.push(typeof m === "string" ? m : String(obj(m).texto || ""));
  return arr(obj(lerAgora()).mensagens);
};

/* O que uma peça do fim do turno (o códex, a chegada) deixa à TELA (as
   linhas, no relato depois das do Mestre, como o `msgs.push` do App) e ao
   NARRADOR (`paraOCronista`, que o App junta à nota com `notaComOTurno`).
   A tela o replay não compara; a nota só se escreve no servidor — no
   replay é bastidor, que o save não guarda. */
const naTelaENaNota = (E, r, ctx, nota) => {
  if (nota && nota.tela && arr(r.msgs).length) nota.tela.linhas.push(...arr(r.msgs).map((x) => (typeof x === "string" ? x : String(obj(x).texto || ""))));
  return ctx.servidor && arr(r.paraOCronista).length ? { ...E, nota: notaComOTurno(E.nota, r.paraOCronista) } : E;
};

/* o aceito aplicado pela peça do jogo sobre o estado do replay →
   { estado, portas: [{ porta, campos }], calou: [{ onde, erro }] } */
function oAceitoNoReplay(E0, juizo, proposta, ctx) {
  let E = E0;
  const portas = [], calou = [], linhas = [];
  const aplicar = (efeitos) => {
    for (const ef of arr(efeitos)) {
      if (!ehObj(ef)) continue;
      if (ef.tipo === "calou") { calou.push({ onde: String(ef.onde || ""), erro: String((ef.erro && ef.erro.message) || ef.erro || "") }); continue; }
      /* a nota ao Narrador: no replay é bastidor (o save não a guarda); no
         servidor é o solto que o pedido do turno seguinte junta — o
         `notaComOTurno` que o App faz com o efeito (o recado do trabalho
         que o Cronista pregou, a fé, o homónimo, o teste exigido) */
      if (ef.tipo === "nota") { if (ctx.servidor) E = { ...E, nota: notaComOTurno(E.nota, arr(ef.linhas)) }; continue; }
      const x = EFEITO_DO_CRONISTA_NO_REPLAY[ef.tipo];
      if (x) E = { ...E, [x.campo]: ef[x.chave] };
    }
  };
  const duble = (nome) => (...args) => { portas.push({ porta: nome, campos: PORTAS_DO_CRONISTA_NO_REPLAY[nome].campos }); return NEUTRO_DO_DUBLE[nome](...args); };
  const doMotor = {
    registrarLugar: (nome, fonte) => {
      const r = registrarOLugar({ cidadeAtual: E.cidadeAtual, lugar: E.lugar, espinha: E.espinha, ultimoPedido: ctx.frase, combate: E.combate, masmorra: E.masmorra, mapa: E.mapa, dia: E.dia }, nome, fonte, { mundo: doMotor.mundoDaBase });
      aplicar(r.efeitos);
      if (r.mudou) E = { ...E, lugar: r.lugar };
      return r.aviso;
    },
    contextoDoNome: (n) => contextoDoNomeCom(ctx.doMestre.baseDoNome, n),
    historiaDoMural: () => genteDaHistoria({ abertura: E.abertura, missoes: E.missoes, espinha: E.espinha, grupo: obj(E.personagem).grupo || [] }),
    mundoDaBase: () => (ctx.mundo ? { ...ctx.mundo, mapa: E.mapa, base: E.baseMundo } : null),
    /* a porta do mural: a fábrica sobre o estado de AGORA (o que o aceito
       já escreveu), e o que ela escreve (o mural) volta ao estado */
    pregarNoMural: (cartaz) => osOrgaosNoReplay(E, (x) => { E = { ...E, ...x }; }, (onde, e) => calou.push({ onde: String(onde || ""), erro: String((e && e.message) || e || "") })).pregarNoMural(cartaz),
    /* a fé, o arco e o conferente (29/10): a mesma fábrica sobre o estado
       de AGORA; o que escrevem volta ao estado (os campos do save; no
       servidor também a nota), e as linhas do conferente vão à tela */
    ganharFe: (...a) => doDepois().ganharFe(...a),
    marcarNoArco: (...a) => doDepois().marcarNoArco(...a),
    conferirCom: (...a) => doDepois().conferirCom(...a),
  };
  function doDepois() {
    return osOrgaosNoReplay(E, (x) => { E = { ...E, ...oQueOTurnoGuarda(x, ctx) }; }, (onde, e) => calou.push({ onde: String(onde || ""), erro: String((e && e.message) || e || "") }), paraATela(linhas, () => E));
  }
  const dubles = Object.fromEntries(Object.keys(NEUTRO_DO_DUBLE).map((k) => [k, duble(k)]));
  const fim = oAceitoDoCronista(juizo.aceito, juizo.recusado, proposta, {
    ...doMotor, ...dubles, ler: () => E, aplicar,
    pers: obj(E.personagem), narrativa: ctx.resposta.narrativa, testeDoTurno: null, rolagem: E.rolagem || null,
  });
  if (fim && ehObj(fim.p) && fim.p !== E.personagem && canonico(fim.p) !== canonico(E.personagem)) E = { ...E, personagem: fim.p };
  /* as linhas do Cronista no relato (o `pushMsgs(msgs)` do App, depois da
     peça): as do conferente que ele chamou, e as dele */
  if (fim) linhas.push(...arr(fim.msgs).map((x) => (typeof x === "string" ? x : String(obj(x).texto || ""))));
  return { estado: E, portas, calou, linhas };
}

/* O TURNO DO REPLAY É ESTA TABELA: os passos que já são puros, na ordem do
   App (o envio, o aplicarResposta, o fim do turno, o Cronista). Cada passo
   recebe o estado e o turno e devolve o estado novo; o que ele observa
   (o juízo, o veredito) vai para `nota`. Um passo que estoura não leva o
   turno: fica em `calou`, e o estado segue como estava antes dele. */
export const PASSOS_DO_REPLAY = Object.freeze([
  {
    /* o que o App corria antes do Mestre e já é motor (8.ª fatia, v9.529):
       o turno do mundo e o sino, o chão da cena, a escuta. Pagou a dívida
       de abertura, chao, escuta e turnosDeMundo. O NOME não diz «antes do
       Mestre» de propósito: esse é o da porta do App, logo abaixo (viajar,
       moverParaLocal), e as linhas das sessões de prova declaram-na por
       ele — dois passos com o mesmo nome confundem o `calou` e o oráculo. */
    passo: "o mundo, o chão e a escuta", de: "motor/antes-do-mestre.js#oAntesDoMestre (o relógio do mundo, o sino, o chão, a escuta)",
    faz: (E, L) => oAntesDoMestre(E, L.entrada, { modo: "historia" }),
  },
  {
    /* o tempo da ação (trilha A, v9.532): o MINUTOS_POR_TURNO do
       agirInterno, que no App vem antes do enviar. Pagou a dívida do
       `minuto`, com o passo na cidade logo abaixo. UM ESTADO SEM RELÓGIO
       CONTINUA SEM ELE: as sessões de prova foram gravadas de registos que
       não guardavam o minuto, e um passo que criasse a hora inventaria o que
       ninguém marcou — a régua do replay é o que se jogou (teste-sessao §11). */
    passo: "o tempo da ação", de: "motor/tempo-do-turno.js#oTempoDoTurno",
    faz: (E, L) => oTempoDoTurno(E, L.entrada),
  },
  {
    passo: "o sítio pela frase", de: "lugar.js#lugarPedido + motor/tempo-do-turno.js#oPassoDoReplay (o alvoLocalPedido e o moverParaLocal do App: o lugar e os minutos da caminhada)",
    faz: (E, L) => {
      const en = obj(L.entrada), cru = typeof en.frase === "string" ? en.frase : "";
      if (!Array.isArray(en.lugaresDaqui)) return E;
      if (!cru.trim() || cru.trimStart().startsWith("[") || E.combate || E.acampado || E.masmorra || E.jornada || !E.cidadeAtual) return E;
      const alvo = lugarPedido(cru, en.lugaresDaqui);
      if (!alvo || !alvo.nome) return E;
      if (E.lugar && sem(E.lugar.nome) === sem(alvo.nome)) return E;
      return oPassoDoReplay(E, alvo);
    },
  },
  {
    /* A PORTA DO APP. O passo antes do Mestre (viajar, moverParaLocal) ainda
       mora no App: o replay não o corre, e um turno que dependeu dele diverge
       como dívida. Quem grava as sessões de prova sabe o que ele fez (o
       oráculo do registo) e entra por aqui; quando o motor o trouxer
       (src/motor/turno.js), este passo passa a chamá-lo. */
    passo: "o passo antes do Mestre", de: "App (viajar, moverParaLocal): o replay não o corre; quem grava e sabe o que ele fez passa-o em doApp.antesDoMestre",
    faz: (E, L, ctx) => (typeof ctx.doApp.antesDoMestre === "function" ? ctx.doApp.antesDoMestre(E) || E : E),
  },
  {
    /* O BOATO DA CHEGADA (29/10, Fase 4, trilha B). No App é a peça do
       pedido (motor/pedido-do-turno.js#comOBoato), no envio — depois do
       passo antes do Mestre, antes de o Narrador responder: o herói chegou
       ao sítio de que se falava, o veredito sai da semente, e o cânone e o
       registo só mudam se a linha chegou à pauta que foi ao Narrador. O
       replay faz a MESMA conta sobre a pauta GRAVADA (a do App, com o teto
       que a cortou ou não): sem isto, uma revelação numa sessão gravada
       apareceria como diferença «do App» no cânone e no registo. O servidor
       (`so: "depois"`) não o corre: o boato dele já foi no pedido. */
    passo: "o boato", de: "boatos.js#oBoatoDaChegada + #oBoatoQueChegou sobre a pauta gravada (a peça do pedido no App: motor/pedido-do-turno.js#comOBoato)",
    faz: (E, L, ctx) => {
      const pauta = obj(L.pedido).pauta;
      if (typeof pauta !== "string" || !pauta) return E;
      const r = oBoatoDaChegada({
        canone: E.canone, npcs: E.npcs, cidadeAtual: E.cidadeAtual, lugar: E.lugar, masmorra: E.masmorra, mapa: E.mapa,
        combate: E.combate, jornada: E.jornada, dia: E.dia, mensagens: E.mensagens, heroi: obj(E.personagem).nome,
      }, null, ctx.semente);
      const b = r.linhaDaPauta ? oBoatoQueChegou(r, pauta) : null;
      return b ? { ...E, canone: b.canone, npcs: b.npcs } : E;
    },
  },
  {
    passo: "o turno do Mestre", de: "motor/aplicar.js#aplicarOTurno",
    faz: (E, L, ctx, nota) => {
      const r = aplicarOTurno({ ...E, npcTurno: Number.isFinite(E.npcTurno) ? E.npcTurno : 0 }, ctx.resposta, ctx.doMestre);
      /* o que a tela leva deste passo (o servidor devolve-o; o replay não o
         compara): a narração podada e as linhas do sistema no relato */
      if (r && nota) nota.tela = { narrativa: String(obj(r.podado).narrativa || ""), linhas: arr(r.msgs).map((x) => (typeof x === "string" ? x : String(obj(x).texto || ""))) };
      let E1 = r && r.estado ? r.estado : E;
      /* no servidor, o que o aplicar deixa ao Narrador (`paraOCronista`)
         vai à nota, como o App a escreve (`notaComOTurno`); no replay é
         bastidor, que o save não guarda */
      if (ctx.servidor && r && arr(r.paraOCronista).length) E1 = { ...E1, nota: notaComOTurno(E1.nota, r.paraOCronista) };
      return E1;
    },
  },
  {
    passo: "o códex", de: "motor/fim-do-turno.js#aplicarOCodex (a base do mundo, os nomes à mão)",
    faz: (E, L, ctx, nota) => {
      const oferecidos = arr(obj(L.pedido).nomesAMao);
      /* com o mundo gravado ou sem ele, o códex do App, à letra: sem o mundo
         a metade da base cala e os nomes à mão seguem (o conserto de
         66afe15 — antes, sem mundo, refazia a cidade pela semente vazia, e
         o replay corria aqui uma cópia só dos nomes à mão) */
      const r = aplicarOCodex({ ...E, oferecidos, base: E.baseMundo }, ctx.resposta, { mundo: ctx.mundo });
      return naTelaENaNota({ ...E, npcs: r.estado.npcs, baseMundo: r.estado.base === undefined ? E.baseMundo : r.estado.base }, r, ctx, nota);
    },
  },
  {
    passo: "a chegada", de: "motor/fim-do-turno.js#aplicarAChegada (o relógio da travessia é do App)",
    faz: (E, L, ctx, nota) => {
      const r = aplicarAChegada(E, ctx.resposta);
      let E1 = naTelaENaNota({ ...E, cidadeAtual: r.estado.cidadeAtual, lugar: r.estado.lugar, mapa: r.estado.mapa }, r, ctx, nota);
      /* O TRABALHO QUE ESPERAVA ESTA CENA (v9.37, motor/entrega-do-turno.js):
         o aviso que o mundo deixou no turno de antes sai DEPOIS da narração
         da abordagem — no App, o `oTrabalhoPendente` do aplicarResposta,
         logo depois da chegada e do portão. Viaja no eco; sem ele (o
         replay, um load), não há aviso. */
      const doTrabalho = oTrabalhoPendente(E1.trabalhoPendente);
      if (doTrabalho.msgs.length) {
        E1 = { ...E1, trabalhoPendente: doTrabalho.pendente };
        if (nota && nota.tela) nota.tela.linhas.push(...doTrabalho.msgs.map(String));
      }
      /* A QUEDA A ZERO (29/10, Fase 4, trilha B; motor/entrega-do-turno.js
         desde a 8.ª fatia): no App, `resolverQueda(pers, msgs)` logo depois
         do trabalho que esperava a cena e antes da entrega — o último a
         falar da ficha, porque é o único que precisa do número final.
         Levantar, o estável, o segundo fôlego, quem segura de pé, o teste de
         morte (na sorte do turno, o evento «morte»). O giro do servidor é um
         só, e começa sem morte rolada; a do revide da luta é do cliente. As
         linhas vão à tela, o recado ao Narrador à nota (só no servidor), e a
         morte à tela (`morreu`: o desfecho que o App abre). */
      const q = aQueda(E1.personagem, { morteRolada: false, dia: E1.dia, sorteDoTurno: ctx.doMestre.sorteDoTurno });
      if (q.pers !== E1.personagem) E1 = { ...E1, personagem: q.pers };
      if (nota && nota.tela) { nota.tela.linhas.push(...arr(q.msgs).map(String)); if (q.morreu) nota.tela.morreu = true; }
      if (ctx.servidor && arr(q.paraOCronista).length) E1 = { ...E1, nota: notaComOTurno(E1.nota, q.paraOCronista) };
      return E1;
    },
  },
  {
    /* O CONFERENTE DAS MISSÕES (29/10, Fase 4, trilha B): o 2.º órgão do
       depois, a peça da trilha A (aa4c6df), no sítio do App — depois do
       Mestre, da chegada e do Juiz, ANTES do trabalho daqui (que conta as
       missões abertas) e do Cronista: `pers = conferirAsMissoes(pers)`. Corre
       no replay também: não lê nada que o save não leve — os mortos da
       sessão (`derrotadosDaSessao`, no eco) só somam aos da base, e sem o eco
       são os da base, como num load. O que escreve volta ao estado (os campos
       do save: as missões, a espinha, o arco, a ficha paga, as guildas, os
       relógios, os contadores; no servidor também a nota ao Narrador), e as
       linhas (o avanço, a paga, a falha) vão à tela. */
    passo: "as missões", de: "motor/depois-do-turno.js#osOrgaosDoDepois → conferirAsMissoes (o conferente do App: a espinha, a falha, o avanço, a paga, a casa, o arco)",
    faz: (E, L, ctx, nota) => {
      let E1 = E;
      const linhas = [];
      osOrgaosNoReplay(E, (x) => { E1 = { ...E1, ...oQueOTurnoGuarda(x, ctx) }; }, (onde) => { (nota.calouDoDepois = nota.calouDoDepois || []).push(String(onde || "")); }, paraATela(linhas, () => E1)).conferirAsMissoes(E.personagem);
      if (nota.tela && linhas.length) nota.tela.linhas.push(...linhas);
      return E1;
    },
  },
  {
    /* O TRABALHO QUE O MUNDO OFERECE (29/10, Fase 4, trilha B): o 1.º órgão
       do depois, a peça da trilha A, na ordem do App — depois do Mestre, da
       chegada, do Juiz e do conferente das missões, ANTES do Cronista (que
       lê o mural já com o papel: a mesma pessoa não prega duas vezes).
       SÓ NO SERVIDOR (`servidor: true`): o órgão guarda o dia do último
       trabalho num ref que o save não leva (`ultimoTrabalhoDia`). O servidor
       recebe-o no eco; o replay corre sobre saves, e sem ele ofereceria em
       todo turno o que o jogo, com o ref vivo, não ofereceu — a régua do
       replay é o que se jogou. */
    passo: "o trabalho daqui", de: "motor/depois-do-turno.js#osOrgaosDoDepois → oferecerTrabalhoDaqui (só no servidor: o dia do último trabalho viaja no eco, não no save)",
    faz: (E, L, ctx, nota) => {
      if (!ctx.servidor) return E;
      let E1 = E;
      osOrgaosNoReplay(E, (x) => { E1 = { ...E1, ...x }; }, (onde) => { (nota.calouDoDepois = nota.calouDoDepois || []).push(String(onde || "")); }).oferecerTrabalhoDaqui();
      return E1;
    },
  },
  {
    passo: "o Cronista", de: "motor/cronista.js#julgarOCronista e motor/cronista-do-turno.js#oAceitoDoCronista (as portas do App: PORTAS_DO_CRONISTA_NO_REPLAY)",
    faz: (E, L, ctx, nota) => {
      if (!ehObj(L.cronista)) return E;
      const juizo = julgarOCronista(E, L.cronista.proposta, { narrativa: ctx.resposta.narrativa, pedido: ctx.frase, envelopes: ctx.envelopes });
      nota.juizo = dado({ aceito: juizo.aceito, recusado: juizo.recusado, ditoPor: juizo.ditoPor });
      /* O JUIZ CORRIGE (v9.531, o App desde 088ba92): o nome que o Juiz deu
         por inventado NESTE turno não entra no cânone. A linha grava o juízo
         CRU (é ele que se compara); a correção refaz-se aqui do veredito que
         o replay julga outra vez, sobre a narração e a entrada gravadas — a
         mesma conta, determinista, e o mesmo estado que o App lhe dá (o de
         depois do Mestre, antes do aceito). */
      let aceito = juizo.aceito;
      if (ctx.juizDaLinha && ehObj(aceito) && aceito.canone) {
        const cj = canoneSemInvencao(aceito, ctx.juizDaLinha.veredito, { entrada: ctx.juizDaLinha.entrada, estado: E });
        aceito = cj.aceito;
        if (cj.tirados.length) nota.tirados = cj.tirados;
      }
      const r = oAceitoNoReplay(E, { ...juizo, aceito }, L.cronista.proposta, ctx);
      nota.portas = r.portas;
      nota.calouDoCronista = r.calou;
      if (nota.tela && r.linhas.length) nota.tela.linhas.push(...r.linhas);
      return r.estado;
    },
  },
]);

/* o Juiz: julga outra vez sobre a entrada gravada (ele mede, não muda o estado) */
/* o Juiz da linha, julgado outra vez sobre a entrada gravada: o veredito
   inteiro (a correção lê-o) e o resumo (o replay compara-o com o gravado) */
const julgarALinha = (L, narracoes) => {
  const j = L.juiz;
  if (!ehObj(j) || !ehObj(j.entrada)) return null;
  const r = obj(j.resumo);
  const entrada = Number.isInteger(j.antesDoArquivo) ? { ...j.entrada, antes: narracoes.slice(narracoes.length - j.antesDoArquivo) } : j.entrada;
  return { ...julgarOTurno(obj(L.narrador).narrativa || "", entrada, { turno: r.turno, dia: r.dia }), entrada };
};

/* A CORREÇÃO DO JUIZ, CORRIDA SOBRE A SESSÃO (motor/correcao-do-juiz.js):
   o que o motor faria com cada invenção apanhada se a fiação já estivesse
   no App — os vetos que nascem, as linhas que entrariam na pauta do turno
   seguinte (a porta da pauta: o turno logo a seguir, ou a frase a tocar a
   coisa) e o cânone do Cronista que a invenção não chega a consagrar. É a
   medida do efeito, turno a turno, na sessão que se lê. */
function corrigirASessao(A) {
  const out = { vetos: 0, porEspecie: {}, naPauta: 0, turnosComVeto: 0, linhas: [], tirados: [], cegos: 0 };
  const ts = arr(A.turnos);
  let g = obj(dado(A.inicio)), livro = [];
  ts.forEach((L0, i) => {
    const L = obj(L0), n = Number.isInteger(L.n) ? L.n : i + 1;
    const cidade = typeof g.cidadeAtual === "string" ? g.cidadeAtual : "";
    const frase = typeof obj(L.entrada).frase === "string" ? L.entrada.frase : "";
    const linhas = vetosParaAPauta(livro, { turno: n, cidade, frase });
    if (linhas.length) { out.turnosComVeto++; out.naPauta += linhas.length; out.linhas.push({ n, linhas }); }
    let j = null;
    try { j = julgarALinha(L, narracoesDoArquivo(ts, i)); } catch { j = null; }
    const entrada = obj(obj(L.juiz).entrada);
    if (j && juizCego(entrada)) out.cegos++;
    if (j) {
      const novos = vetosDoVeredito(j.veredito, { turno: n, cidade });
      out.vetos += novos.length;
      for (const x of novos) out.porEspecie[x.especie] = (out.porEspecie[x.especie] || 0) + 1;
      livro = andarOsVetos(livro, novos, { turno: n, cidade });
      const ac = obj(obj(obj(L.cronista).juizo).aceito);
      for (const x of canoneSemInvencao(ac, j.veredito, { entrada, estado: g }).tirados) out.tirados.push({ n, ...x });
    }
    g = aplicarDiferenca(g, L.estado, [], "");
  });
  return out;
}

/* PORQUÊ: o campo que diverge diz quem o escreve no turno. "App" é a parte
   que ainda não é motor — o replay não a corre, e é ela a culpada quando
   o motor não mudou. */
export const DONO_DO_CAMPO = Object.freeze({
  cidadeAtual: "o passo antes do Mestre (viajar, moverParaLocal: App) ou a chegada (motor)",
  lugar: "o passo antes do Mestre (moverParaLocal: App; o sítio pela frase: motor), o aplicar ou o lugar do Cronista",
  jornada: "a estrada, que o App abre e fecha",
  npcs: "a gente do turno: o registo, o códex e o aceito do Cronista (motor); a luta e os nomes que a pauta não ofereceu (App)",
  npcTurno: "o contador da gente (motor/aplicar.js#aplicarORegisto)",
  canone: "o cânone: o registo e o aceito do Cronista (motor, a mesma peça no replay e no jogo)",
  personagem: "a ficha: o aplicar (as mudanças, a salvaguarda, a cobrança: motor) e a luta (App)",
  combate: "a luta, que o Narrador não abre (E4) e o App conduz",
  mapa: "o mapa do turno e a chegada (motor), a viagem (App)",
  baseMundo: "o códex (motor)",
  dia: "o relógio do mundo (avancarOsMinutos) e a viagem: App",
  minuto: "o relógio do mundo: o tempo da ação e o da caminhada (motor/tempo-do-turno.js); a viagem: App",
  missoes: "as missões do turno: o conferente (motor/depois-do-turno.js) e o aceito do Cronista (motor)",
  "*": "sem dono: nenhum passo do replay o escreve e AINDA_DO_APP não o lista — é defeito até alguém o reclamar",
});

/* fora da régua: o que não é jogo, ou o que só a tela escreve */
export const FORA_DA_REGUA = Object.freeze({
  ...Object.fromEntries(camposDoGrupo("bastidor").map((c) => [c, "bastidor: o sistema não fala de si mesmo, e o replay não o escreve"])),
  mensagens: "o relato: quem o escreve é a tela",
  historico: "o relato: quem o escreve é a tela",
  versao: "a versão do save, igual em todo estado v2",
});

/* A DÍVIDA DO APP (28/10/2026, T3-B). Os campos do estado que um órgão do
   App ainda escreve no turno, e que nenhum passo do replay corre: num
   arquivo gravado pelo jogo, divergem SEMPRE, e não por defeito do motor.
   A divergência num campo desta tabela é dívida, contada à parte; fora
   dela, é defeito. `campo` é um caminho (o campo inteiro, ou só uma parte
   dele — até 28/10, "lugar.coord" deixava o resto do lugar na régua do
   motor; o passo na cidade pagou-a).

   A TABELA SÓ ENCOLHE (teste-sessao.mjs, secção 8): campo novo aqui quebra
   a suíte, e campo que o replay já reproduz — porque o órgão foi para o
   motor e entrou em PASSOS_DO_REPLAY — também, para ela não guardar dívida
   paga. A medida é o arquivo que o jogo gravou (testes/sessao-navegador.json). */
export const AINDA_DO_APP = Object.freeze([
  { campo: "compasso", orgao: "talvezAndarOCompasso no envio", desde: "28/10/2026" },
  { campo: "desdeMundo", orgao: "marcarTurnoDoMundo → talvezOMundoSeMexer (há quantos turnos o mundo não se mexe)", desde: "28/10/2026" },
  { campo: "elencoMem", orgao: "as marcas do intérprete no envio (marcarMovimento: os feitos e os gestos da gente)", desde: "28/10/2026" },
  { campo: "escada", orgao: "mexerNoEncalhe no envio (a escada do encalhe)", desde: "28/10/2026" },
  { campo: "estante", orgao: "talvezDarFormaACena e formaDoMestre (a cadência da cena e as jogadas)", desde: "28/10/2026" },
  { campo: "mesa", orgao: "aMesaDoTurno já é motor (fecho-da-resposta.js), mas a textura que ele lê — o pilar da frase, as rolagens, o perigo — o App escreve-a ao longo do turno, e a linha não a grava", desde: "28/10/2026" },
  { campo: "prometido", orgao: "pautaDoTurno → cobrarNoTurno (o Livro cobra na pauta; o que o Cronista paga e guarda já corre no replay, pela peça do jogo)", desde: "28/10/2026" },
  { campo: "registro", orgao: "anotarOTurno no envio (a memória das cenas: quando, onde, quem, o assunto)", desde: "28/10/2026" },
]);

/* as diferenças entre dois estados, com o caminho até cada uma */
function diferencas(a, b, caminho, out, prof) {
  if (canonico(a) === canonico(b)) return;
  const fundo = prof >= FORMATO_DA_SESSAO.profundidade;
  if (!fundo && ehObj(a) && ehObj(b)) {
    for (const k of [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()) diferencas(a[k], b[k], caminho ? `${caminho}.${k}` : k, out, prof + 1);
    return;
  }
  if (!fundo && Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    for (let i = 0; i < a.length; i++) diferencas(a[i], b[i], `${caminho}[${i}]`, out, prof + 1);
    return;
  }
  out.push({ caminho, gravado: cita(a), reproduzido: cita(b) });
}

/* UM TURNO, CORRIDO (o que o replay faz a cada linha, e o que o gravador
   das sessões de prova usa para escrever a linha: um caminho só).

     correrOTurno(antes, linha, { semente, mundo?, narracoes?, doApp?, so?, casa? })
       → { estado, juizo, juiz, veredito, tela, calou, portas, calouDoCronista, calouDoDepois, tirados }

   `antes` é o estado do fim do turno anterior (o save v2), `linha` a linha
   do arquivo (o `estado` dela não é lido), `narracoes` as narrações de
   antes para o eco do Juiz. `doApp` é a porta para quem grava e SABE o que
   um órgão do App fez: `doApp.antesDoMestre(estado)` corre no lugar do
   passo antes do Mestre (a viagem, o sítio), e devolve o estado. O replay
   nunca a passa. Devolve o estado do fim (o save v2, em dado puro), o
   juízo do Cronista, o veredito do Juiz (se a linha tem a entrada dele),
   os passos que estouraram, as portas-dublê que o aceito do Cronista
   chamou ({ porta, campos }), o que as secções dele calaram (o `calou` do
   App, no jogo) e os nomes que a correção do Juiz tirou do cânone. Nunca
   lança; lixo é o turno vazio.

   O DEPOIS DA RESPOSTA, PARA O SERVIDOR (29/10, Fase 4, trilha B). O
   /api/turno corre o resto do turno com ESTA função, e não com uma cópia
   dela: `so: "depois"` corre só os passos do Mestre em diante (o antes —
   o relógio do mundo, o tempo, o sítio, o chão, a escuta — o servidor já
   o correu no prelúdio, ou o cliente no agir), e `casa` é o gerador que o
   turno do servidor já vem usando: em vez de semear a reserva global (que
   num servidor rolaria os dados de outro pedido), os passos correm dentro
   de `comSorte`. Sem as duas, o replay de sempre. `servidor: true` é o
   estado que traz o eco e os soltos (o que o load zera, o que a tela
   deixa): com ele corre o trabalho daqui (o dia do último viaja no eco) e
   o que o fim do turno deixa ao Narrador entra na `nota` (um solto) — no
   replay, que corre sobre saves, nem um nem outro existe. `veredito` é o do Juiz
   inteiro (a correção do servidor lê-o para os vetos do eco) e `tela` o
   que o passo do Mestre deixa à tela (a narração podada, as linhas). */
export function correrOTurno(antes, linha, contexto) {
  const c = obj(contexto);
  const E0 = obj(antes), L = obj(linha);
  const semente = String(c.semente == null ? "" : c.semente), mundo = ehObj(c.mundo) ? c.mundo : null, narracoes = arr(c.narracoes);
  const so = obj(L.sorte), pe = obj(L.pedido), na = obj(L.narrador);
  const soDepois = c.so === "depois";
  const servidor = c.servidor === true;
  const casa = typeof c.casa === "function" ? c.casa : null;
  if (!casa && typeof so.casa === "string") semearACasa(so.casa);
  const s0 = sorteNoPonto(ehObj(so.contagem) ? so.contagem : CONTAGEM_VAZIA, semente, so.ponto, "salvaguarda");
  let contagem = s0.contagem;
  const sorteDoTurno = (evento) => { const r = sorteNoPonto(contagem, semente, so.ponto, evento); contagem = r.contagem; return r.sorte; };
  const frase = typeof obj(L.entrada).frase === "string" ? L.entrada.frase : "";
  const envelopes = pe.envelopes == null ? "" : pe.envelopes;
  const resposta = { narrativa: String(na.narrativa || ""), mudancas: dado(obj(na.mudancas)) };
  const ctx = {
    resposta, frase, envelopes, mundo: mundo || null, doApp: obj(c.doApp), servidor, semente,
    doMestre: { envelopes: Array.isArray(envelopes) ? envelopes.join("\n") : envelopes, pedido: frase, ...(pe.moeda ? { moeda: pe.moeda } : {}), sorte: s0.sorte, sorteDoTurno, mundo: mundo || null, baseDoNome: { heroi: obj(E0.personagem).nome } },
  };
  let E = estadoDoSave(obj(dado(E0)));
  const nota = {}, calou = [];
  /* o Juiz julga a prosa uma vez, antes dos passos: o resumo vai para o
     relatório, e o veredito para a correção do cânone no passo do Cronista */
  let julgado = null, erroDoJuiz = null;
  try { julgado = julgarALinha(L, narracoes); } catch (e) { erroDoJuiz = e; }
  ctx.juizDaLinha = julgado ? { veredito: julgado.veredito, entrada: julgado.entrada } : null;
  const passos = soDepois ? PASSOS_DO_REPLAY.slice(PASSOS_DO_REPLAY.findIndex((p) => p.passo === "o turno do Mestre")) : PASSOS_DO_REPLAY;
  const correr = () => {
    for (const p of passos) {
      try { E = p.faz(E, L, { ...ctx, resposta: dado(resposta) }, nota); } catch (e) { calou.push({ passo: p.passo, erro: String((e && e.message) || e) }); }
    }
  };
  if (casa) comSorte(casa, correr); else correr();
  if (erroDoJuiz) calou.push({ passo: "o Juiz", erro: String((erroDoJuiz && erroDoJuiz.message) || erroDoJuiz) });
  const juiz = julgado ? dado(julgado.resumo) : null;
  return { estado: comoSave(E), juizo: nota.juizo || null, juiz, veredito: julgado ? julgado.veredito : null, tela: nota.tela || null, calou, portas: arr(nota.portas), calouDoCronista: arr(nota.calouDoCronista), calouDoDepois: arr(nota.calouDoDepois), tirados: arr(nota.tirados) };
}

const naRegua = (e) => Object.fromEntries(Object.entries(obj(e)).filter(([k]) => !tem(FORA_DA_REGUA, k)));

/* o caminho `p` está debaixo de `c` (ele mesmo, um campo dele, um item dele) */
const debaixoDe = (p, c) => p === c || p.startsWith(c + ".") || p.startsWith(c + "[");

/* o relatório: { valido, erros, turnos, reproduzidos, divergentes, primeira,
   defeitos, primeiroDefeito, soOMotor, divida }. Por turno: { n, igual,
   defeito, diferencas (as do motor), divida (as do App), porque, cronista,
   juiz, calou, app, portas }. Ver o cabeçalho, "A DÍVIDA DO APP", e
   PORTAS_DO_CRONISTA_NO_REPLAY (a dívida «a porta»). */
export function reproduzirASessao(arquivo, opcoes) {
  const op = obj(opcoes);
  const v = validarASessao(arquivo);
  const vazio = { valido: v.ok, erros: v.erros, turnos: [], reproduzidos: 0, divergentes: [], primeira: null, defeitos: [], primeiroDefeito: null, soOMotor: 0, divida: { campos: [], doTurno: [] } };
  if (!v.ok) return vazio;
  const A = arquivo, mundo = ehObj(A.mundo) ? A.mundo : null;
  let gravado = obj(dado(A.inicio)), corrido = gravado;
  const turnos = [];
  const porCampo = new Map(AINDA_DO_APP.map((d) => [d.campo, []]));
  const doTurno = [];
  A.turnos.forEach((L, i) => {
    const antes = op.encadeado ? corrido : gravado;
    const r = correrOTurno(antes, L, { semente: A.semente, mundo, narracoes: narracoesDoArquivo(A.turnos, i) });
    gravado = aplicarDiferenca(gravado, L.estado, [], "");
    corrido = r.estado;
    const app = oQueOAppFez(L.app);
    /* as portas do App que o Cronista chamou e que no replay são dublês: o
       que o App escreveu por elas é dívida da porta, no turno em que ela foi
       chamada, e só nos campos que ela escreve */
    const portas = r.portas.filter((p) => p.campos.length).map((p) => ({ orgao: `${p.porta}, a porta que o Cronista chama (dublê no replay: ${PORTAS_DO_CRONISTA_NO_REPLAY[p.porta].porque})`, campos: p.campos, de: "a porta" }));
    const todas = [];
    diferencas(naRegua(gravado), naRegua(r.estado), "", todas, 0);
    /* cada diferença: é dívida se a tabela a lista, ou se a linha diz que
       um órgão do App a escreveu neste turno; o resto é do motor */
    const doMotor = [], divida = new Map();
    for (const d of todas) {
      const tab = AINDA_DO_APP.find((x) => debaixoDe(d.caminho, x.campo));
      const fez = tab ? null : [...app, ...portas].find((a) => a.campos.some((c) => debaixoDe(d.caminho, c)));
      if (!tab && !fez) { doMotor.push(d); continue; }
      const chave = tab ? tab.campo : `${fez.orgao}`;
      if (!divida.has(chave)) divida.set(chave, { campo: tab ? tab.campo : fez.campos.filter((c) => debaixoDe(d.caminho, c))[0], orgao: tab ? tab.orgao : fez.orgao, de: tab ? "a tabela" : fez.de || "a linha", caminhos: [] });
      divida.get(chave).caminhos.push(d.caminho);
    }
    const porque = [];
    if (ehObj(obj(L.entrada).toque)) porque.push("o toque do jogador é da tela: o replay não o corre");
    for (const c of r.calou) porque.push(`${c.passo} estourou: ${c.erro}`);
    /* o que uma secção do Cronista engoliu: no jogo vai ao `calou` do App, e
       aqui ao porquê — não é defeito, é o mesmo silêncio */
    for (const c of r.calouDoCronista) porque.push(`o Cronista calou «${c.onde}» (o calou do App, no jogo): ${c.erro}`);
    for (const campo of [...new Set(doMotor.map((d) => d.caminho.split(/[.[]/)[0]))]) porque.push(`${campo}: ${DONO_DO_CAMPO[campo] || DONO_DO_CAMPO["*"]}`);
    for (const d of divida.values()) porque.push(`${d.campo}: ainda do App — ${d.orgao}`);
    const cronista = ehObj(L.cronista) && ehObj(L.cronista.juizo)
      ? { igual: canonico(L.cronista.juizo) === canonico(r.juizo), ...(canonico(L.cronista.juizo) === canonico(r.juizo) ? {} : { gravado: cita(L.cronista.juizo), reproduzido: cita(r.juizo) }) }
      : null;
    if (cronista && !cronista.igual) porque.push("o juízo do Cronista mudou: motor/cronista.js julga diferente a mesma proposta");
    const juiz = r.juiz ? { igual: canonico(L.juiz.resumo) === canonico(r.juiz) } : null;
    if (juiz && !juiz.igual) porque.push("o veredito do Juiz mudou: juiz-de-fidelidade.js mede diferente a mesma prosa");
    const defeito = doMotor.length > 0 || r.calou.length > 0 || (!!cronista && !cronista.igual) || (!!juiz && !juiz.igual);
    const igual = !todas.length && !defeito;
    const dividas = [...divida.values()].map((d) => ({ ...d, caminhos: d.caminhos.slice(0, FORMATO_DA_SESSAO.diferencasPorTurno) }));
    for (const d of dividas) if (d.de === "a tabela") porCampo.get(d.campo).push(L.n);
    if (app.length) doTurno.push({ n: L.n, app, divergiu: dividas.some((d) => d.de === "a linha") });
    turnos.push({ n: L.n, igual, defeito, diferencas: doMotor.slice(0, FORMATO_DA_SESSAO.diferencasPorTurno), divida: dividas, porque, cronista, juiz, calou: r.calou, app: app.length ? app : null, portas: r.portas.length ? r.portas : null });
  });
  const divergentes = turnos.filter((t) => !t.igual).map((t) => t.n);
  const defeitos = turnos.filter((t) => t.defeito).map((t) => t.n);
  return {
    valido: true, erros: [], turnos,
    reproduzidos: turnos.length - divergentes.length, divergentes, primeira: divergentes.length ? divergentes[0] : null,
    defeitos, primeiroDefeito: defeitos.length ? defeitos[0] : null,
    /* reproduz e nenhum órgão do App mexeu nele: o turno que o motor joga sozinho */
    soOMotor: turnos.filter((t) => t.igual && !t.app).length,
    divida: { campos: AINDA_DO_APP.map((d) => ({ ...d, turnos: porCampo.get(d.campo) })), doTurno },
  };
}

/* ---------------- O RESUMO ---------------- */

/* as classes do Juiz, mais a pauta (o que ela pediu e a prosa não cumpriu) */
const CLASSES_DO_RESUMO = [...CLASSES_DO_JUIZ.map((c) => c.classe), "pauta"];

/* o relatório do replay, posto para uma pessoa ler (ver o cabeçalho, "O
   RESUMO"). Puro, e nunca lança: um arquivo inválido dá o resumo vazio com
   os erros. */
export function resumoDaSessao(arquivo, relatorio) {
  const r = ehObj(relatorio) && Array.isArray(relatorio.turnos) ? relatorio : reproduzirASessao(arquivo);
  const A = obj(arquivo);
  let fid = {};
  let julgados = 0, iguais = 0, rejulgados = 0;
  for (const L of arr(A.turnos)) {
    const j = obj(obj(L).juiz);
    if (!ehObj(j.resumo)) continue;
    fid = somarAFidelidade(fid, j.resumo);
    julgados++;
  }
  for (const x of arr(r.turnos)) if (x && x.juiz) { rejulgados++; if (x.juiz.igual) iguais++; }
  const por = Object.fromEntries(CLASSES_DO_RESUMO.map((k) => [k, Number(obj(fid.por)[k]) || 0]));
  return {
    valido: !!r.valido, erros: arr(r.erros),
    turnos: arr(r.turnos).length, reproduzidos: Number(r.reproduzidos) || 0, soOMotor: Number(r.soOMotor) || 0,
    defeitos: arr(r.turnos).filter((x) => x && x.defeito).map((x) => ({
      n: x.n, diferencas: x.diferencas,
      porque: x.porque.filter((p) => !/: ainda do App — /.test(p)),
      ...(x.cronista && !x.cronista.igual ? { cronista: { gravado: x.cronista.gravado, reproduzido: x.cronista.reproduzido } } : {}),
      ...(x.juiz && !x.juiz.igual ? { juiz: true } : {}),
      ...(x.calou.length ? { calou: x.calou } : {}),
    })),
    divida: {
      campos: arr(obj(r.divida).campos).filter((d) => d.turnos.length),
      doTurno: arr(obj(r.divida).doTurno).flatMap((d) => d.app.map((a) => ({ n: d.n, orgao: a.orgao, campos: a.campos, divergiu: d.divergiu }))),
    },
    juiz: { julgados, limpos: Number(fid.limpos) || 0, achados: Number(fid.achados) || 0, por, pauta: obj(fid.pauta).total ? fid.pauta : null, iguais, rejulgados },
    correcao: r.valido ? corrigirASessao(A) : { vetos: 0, porEspecie: {}, naPauta: 0, turnosComVeto: 0, linhas: [], tirados: [], cegos: 0 },
  };
}
