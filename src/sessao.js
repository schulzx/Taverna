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
   O aceito do Cronista é aplicado em MINIATURA (as pessoas, o cânone e o
   lugar): a fiação inteira do aceito
   (nomeComDono, fichaDoCronista, a peneira do cânone, o mural, a fé)
   ainda mora no App, e um turno que dependeu dela diverge com esse porquê.
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

import { estadoDoSave, saveDoEstado, camposDoGrupo } from "./estado.js";
import { lugarPedido, definirLugar } from "./lugar.js";
import { semearACasa } from "./semente.js";
import { aplicarOTurno } from "./motor/aplicar.js";
import { aplicarOCodex, aplicarAChegada } from "./motor/fim-do-turno.js";
import { julgarOCronista } from "./motor/cronista.js";
import { julgarOTurno, JUIZ_NO_TURNO, CLASSES_DO_JUIZ, somarAFidelidade } from "./motor/juiz-do-turno.js";
import { sorteNoPonto, CONTAGEM_VAZIA } from "./motor/sorte-do-turno.js";

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

/* o aceito do Cronista, em miniatura: as pessoas, o cânone e o lugar (ver o
   cabeçalho — a fiação inteira ainda mora no App) */
function aplicarOAceito(E, aceito) {
  const a = obj(aceito);
  let e = E;
  if (Array.isArray(a.pessoas)) {
    const npcs = { ...obj(e.npcs) };
    for (const p of a.pessoas) if (p && p.nome && !Object.keys(npcs).some((k) => sem(k) === sem(p.nome))) npcs[p.nome] = { ...p };
    e = { ...e, npcs };
  }
  if (ehObj(a.canone)) {
    const canone = { ...obj(e.canone) };
    for (const [n, f] of Object.entries(a.canone)) if (!Object.keys(canone).some((k) => sem(k) === sem(n))) canone[n] = { ...obj(f) };
    e = { ...e, canone };
  }
  if (typeof a.lugar === "string" && a.lugar.trim()) e = { ...e, lugar: /^cidade$/i.test(a.lugar) ? null : { nome: a.lugar, distancia: "dentro", cidade: e.cidadeAtual } };
  return e;
}

/* O TURNO DO REPLAY É ESTA TABELA: os passos que já são puros, na ordem do
   App (o envio, o aplicarResposta, o fim do turno, o Cronista). Cada passo
   recebe o estado e o turno e devolve o estado novo; o que ele observa
   (o juízo, o veredito) vai para `nota`. Um passo que estoura não leva o
   turno: fica em `calou`, e o estado segue como estava antes dele. */
export const PASSOS_DO_REPLAY = Object.freeze([
  {
    passo: "o sítio pela frase", de: "lugar.js#lugarPedido + definirLugar (o alvoLocalPedido do App, sem o tempo da caminhada)",
    faz: (E, L) => {
      const en = obj(L.entrada), cru = typeof en.frase === "string" ? en.frase : "";
      if (!Array.isArray(en.lugaresDaqui)) return E;
      if (!cru.trim() || cru.trimStart().startsWith("[") || E.combate || E.acampado || E.masmorra || E.jornada || !E.cidadeAtual) return E;
      const alvo = lugarPedido(cru, en.lugaresDaqui);
      if (!alvo || !alvo.nome) return E;
      if (E.lugar && sem(E.lugar.nome) === sem(alvo.nome)) return E;
      const novo = definirLugar(alvo.nome, { cidade: E.cidadeAtual, dia: E.dia || 0, distancia: alvo.onde === "arredores" ? "arredores" : "dentro" });
      return novo ? { ...E, lugar: novo } : E;
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
    passo: "o turno do Mestre", de: "motor/aplicar.js#aplicarOTurno",
    faz: (E, L, ctx) => {
      const r = aplicarOTurno({ ...E, npcTurno: Number.isFinite(E.npcTurno) ? E.npcTurno : 0 }, ctx.resposta, ctx.doMestre);
      return r && r.estado ? r.estado : E;
    },
  },
  {
    passo: "o códex", de: "motor/fim-do-turno.js#aplicarOCodex (a base do mundo, os nomes à mão)",
    faz: (E, L, ctx) => {
      const oferecidos = arr(obj(L.pedido).nomesAMao);
      /* com o mundo gravado ou sem ele, o códex do App, à letra: sem o mundo
         a metade da base cala e os nomes à mão seguem (o conserto de
         66afe15 — antes, sem mundo, refazia a cidade pela semente vazia, e
         o replay corria aqui uma cópia só dos nomes à mão) */
      const r = aplicarOCodex({ ...E, oferecidos, base: E.baseMundo }, ctx.resposta, { mundo: ctx.mundo });
      return { ...E, npcs: r.estado.npcs, baseMundo: r.estado.base === undefined ? E.baseMundo : r.estado.base };
    },
  },
  {
    passo: "a chegada", de: "motor/fim-do-turno.js#aplicarAChegada (o relógio da travessia é do App)",
    faz: (E, L, ctx) => {
      const r = aplicarAChegada(E, ctx.resposta);
      return { ...E, cidadeAtual: r.estado.cidadeAtual, lugar: r.estado.lugar, mapa: r.estado.mapa };
    },
  },
  {
    passo: "o Cronista", de: "motor/cronista.js#julgarOCronista, e o aceito em miniatura",
    faz: (E, L, ctx, nota) => {
      if (!ehObj(L.cronista)) return E;
      const juizo = julgarOCronista(E, L.cronista.proposta, { narrativa: ctx.resposta.narrativa, pedido: ctx.frase, envelopes: ctx.envelopes });
      nota.juizo = dado({ aceito: juizo.aceito, recusado: juizo.recusado, ditoPor: juizo.ditoPor });
      return aplicarOAceito(E, juizo.aceito);
    },
  },
]);

/* o Juiz: julga outra vez sobre a entrada gravada (ele mede, não muda o estado) */
const julgarDeNovo = (L, narracoes) => {
  const j = L.juiz;
  if (!ehObj(j) || !ehObj(j.entrada)) return null;
  const r = obj(j.resumo);
  const entrada = Number.isInteger(j.antesDoArquivo) ? { ...j.entrada, antes: narracoes.slice(narracoes.length - j.antesDoArquivo) } : j.entrada;
  return dado(julgarOTurno(obj(L.narrador).narrativa || "", entrada, { turno: r.turno, dia: r.dia }).resumo);
};

/* PORQUÊ: o campo que diverge diz quem o escreve no turno. "App" é a parte
   que ainda não é motor — o replay não a corre, e é ela a culpada quando
   o motor não mudou. */
export const DONO_DO_CAMPO = Object.freeze({
  cidadeAtual: "o passo antes do Mestre (viajar, moverParaLocal: App) ou a chegada (motor)",
  lugar: "o passo antes do Mestre (moverParaLocal: App; o sítio pela frase: motor), o aplicar ou o lugar do Cronista",
  jornada: "a estrada, que o App abre e fecha",
  npcs: "a gente do turno: o registo e o códex (motor); a luta, os nomes que a pauta não ofereceu e a fiação do aceito do Cronista (App)",
  npcTurno: "o contador da gente (motor/aplicar.js#aplicarORegisto)",
  canone: "o cânone: o registo (motor) e o aceito do Cronista (miniatura no replay; App no jogo)",
  personagem: "a ficha: o aplicar (as mudanças, a salvaguarda, a cobrança: motor) e a luta (App)",
  combate: "a luta, que o Narrador não abre (E4) e o App conduz",
  mapa: "o mapa do turno e a chegada (motor), a viagem (App)",
  baseMundo: "o códex (motor)",
  dia: "o relógio do mundo (avancarOsMinutos) e a viagem: App",
  minuto: "o relógio do mundo (avancarOsMinutos) e a viagem: App",
  missoes: "as missões do turno (motor) e a fiação do Cronista (App)",
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
   dele: "lugar.coord" deixa o resto do lugar na régua do motor).

   A TABELA SÓ ENCOLHE (teste-sessao.mjs, secção 8): campo novo aqui quebra
   a suíte, e campo que o replay já reproduz — porque o órgão foi para o
   motor e entrou em PASSOS_DO_REPLAY — também, para ela não guardar dívida
   paga. A medida é o arquivo que o jogo gravou (testes/sessao-navegador.json). */
export const AINDA_DO_APP = Object.freeze([
  { campo: "abertura", orgao: "marcarTurnoDoMundo → andarOSino (o sino da abertura: os turnos, os cheios, os conhecidos, os sítios visitados)", desde: "28/10/2026" },
  { campo: "chao", orgao: "varrerChao e porNoChaoAqui no envio (a cena do chão: cenaDoChao)", desde: "28/10/2026" },
  { campo: "compasso", orgao: "talvezAndarOCompasso no envio", desde: "28/10/2026" },
  { campo: "desdeMundo", orgao: "marcarTurnoDoMundo → talvezOMundoSeMexer (há quantos turnos o mundo não se mexe)", desde: "28/10/2026" },
  { campo: "elencoMem", orgao: "as marcas do intérprete no envio (marcarMovimento: os feitos e os gestos da gente)", desde: "28/10/2026" },
  { campo: "escada", orgao: "mexerNoEncalhe no envio (a escada do encalhe)", desde: "28/10/2026" },
  { campo: "escuta", orgao: "andarAEscuta no envio (o pedido e o avanço)", desde: "28/10/2026" },
  { campo: "estante", orgao: "talvezDarFormaACena e formaDoMestre (a cadência da cena e as jogadas)", desde: "28/10/2026" },
  { campo: "lugar.coord", orgao: "moverParaLocal (a coordenada do sítio sai de locaisDaCidade; o lugaresDaqui gravado não a leva)", desde: "28/10/2026" },
  { campo: "mesa", orgao: "aMesaDoTurno já é motor (fecho-da-resposta.js), mas a textura que ele lê — o pilar da frase, as rolagens, o perigo — o App escreve-a ao longo do turno, e a linha não a grava", desde: "28/10/2026" },
  { campo: "minuto", orgao: "avancarOsMinutos (o tempo da ação, no agirInterno, e o da caminhada, no moverParaLocal)", desde: "28/10/2026" },
  { campo: "prometido", orgao: "pautaDoTurno → cobrarNoTurno (o Livro cobra na pauta) e o aceito do Cronista (guardarSementes, pagarSementes)", desde: "28/10/2026" },
  { campo: "registro", orgao: "anotarOTurno no envio (a memória das cenas: quando, onde, quem, o assunto)", desde: "28/10/2026" },
  { campo: "turnosDeMundo", orgao: "marcarTurnoDoMundo (o turno do mundo, que os relógios leem a cada dois)", desde: "28/10/2026" },
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

     correrOTurno(antes, linha, { semente, mundo?, narracoes?, doApp? })
       → { estado, juizo, juiz, calou }

   `antes` é o estado do fim do turno anterior (o save v2), `linha` a linha
   do arquivo (o `estado` dela não é lido), `narracoes` as narrações de
   antes para o eco do Juiz. `doApp` é a porta para quem grava e SABE o que
   um órgão do App fez: `doApp.antesDoMestre(estado)` corre no lugar do
   passo antes do Mestre (a viagem, o sítio), e devolve o estado. O replay
   nunca a passa. Devolve o estado do fim (o save v2, em dado puro), o
   juízo do Cronista, o veredito do Juiz (se a linha tem a entrada dele) e
   os passos que estouraram. Nunca lança; lixo é o turno vazio. */
export function correrOTurno(antes, linha, contexto) {
  const c = obj(contexto);
  const E0 = obj(antes), L = obj(linha);
  const semente = String(c.semente == null ? "" : c.semente), mundo = ehObj(c.mundo) ? c.mundo : null, narracoes = arr(c.narracoes);
  const so = obj(L.sorte), pe = obj(L.pedido), na = obj(L.narrador);
  if (typeof so.casa === "string") semearACasa(so.casa);
  const s0 = sorteNoPonto(ehObj(so.contagem) ? so.contagem : CONTAGEM_VAZIA, semente, so.ponto, "salvaguarda");
  let contagem = s0.contagem;
  const sorteDoTurno = (evento) => { const r = sorteNoPonto(contagem, semente, so.ponto, evento); contagem = r.contagem; return r.sorte; };
  const frase = typeof obj(L.entrada).frase === "string" ? L.entrada.frase : "";
  const envelopes = pe.envelopes == null ? "" : pe.envelopes;
  const resposta = { narrativa: String(na.narrativa || ""), mudancas: dado(obj(na.mudancas)) };
  const ctx = {
    resposta, frase, envelopes, mundo: mundo || null, doApp: obj(c.doApp),
    doMestre: { envelopes: Array.isArray(envelopes) ? envelopes.join("\n") : envelopes, pedido: frase, ...(pe.moeda ? { moeda: pe.moeda } : {}), sorte: s0.sorte, sorteDoTurno, mundo: mundo || null, baseDoNome: { heroi: obj(E0.personagem).nome } },
  };
  let E = estadoDoSave(obj(dado(E0)));
  const nota = {}, calou = [];
  for (const p of PASSOS_DO_REPLAY) {
    try { E = p.faz(E, L, { ...ctx, resposta: dado(resposta) }, nota); } catch (e) { calou.push({ passo: p.passo, erro: String((e && e.message) || e) }); }
  }
  let juiz = null;
  try { juiz = julgarDeNovo(L, narracoes); } catch (e) { calou.push({ passo: "o Juiz", erro: String((e && e.message) || e) }); }
  return { estado: comoSave(E), juizo: nota.juizo || null, juiz, calou };
}

const naRegua = (e) => Object.fromEntries(Object.entries(obj(e)).filter(([k]) => !tem(FORA_DA_REGUA, k)));

/* o caminho `p` está debaixo de `c` (ele mesmo, um campo dele, um item dele) */
const debaixoDe = (p, c) => p === c || p.startsWith(c + ".") || p.startsWith(c + "[");

/* o relatório: { valido, erros, turnos, reproduzidos, divergentes, primeira,
   defeitos, primeiroDefeito, soOMotor, divida }. Por turno: { n, igual,
   defeito, diferencas (as do motor), divida (as do App), porque, cronista,
   juiz, calou, app }. Ver o cabeçalho, "A DÍVIDA DO APP". */
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
    const todas = [];
    diferencas(naRegua(gravado), naRegua(r.estado), "", todas, 0);
    /* cada diferença: é dívida se a tabela a lista, ou se a linha diz que
       um órgão do App a escreveu neste turno; o resto é do motor */
    const doMotor = [], divida = new Map();
    for (const d of todas) {
      const tab = AINDA_DO_APP.find((x) => debaixoDe(d.caminho, x.campo));
      const fez = tab ? null : app.find((a) => a.campos.some((c) => debaixoDe(d.caminho, c)));
      if (!tab && !fez) { doMotor.push(d); continue; }
      const chave = tab ? tab.campo : `${fez.orgao}`;
      if (!divida.has(chave)) divida.set(chave, { campo: tab ? tab.campo : fez.campos.filter((c) => debaixoDe(d.caminho, c))[0], orgao: tab ? tab.orgao : fez.orgao, de: tab ? "a tabela" : "a linha", caminhos: [] });
      divida.get(chave).caminhos.push(d.caminho);
    }
    const porque = [];
    if (ehObj(obj(L.entrada).toque)) porque.push("o toque do jogador é da tela: o replay não o corre");
    for (const c of r.calou) porque.push(`${c.passo} estourou: ${c.erro}`);
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
    turnos.push({ n: L.n, igual, defeito, diferencas: doMotor.slice(0, FORMATO_DA_SESSAO.diferencasPorTurno), divida: dividas, porque, cronista, juiz, calou: r.calou, app: app.length ? app : null });
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
  };
}
