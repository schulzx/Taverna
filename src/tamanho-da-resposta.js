/* ============================================================
   A RESPOSTA DO TAMANHO DA PERGUNTA (Fase EM, etapa EM2 · 11/11/2026)
   — src/tamanho-da-resposta.js

   O estudo do Mestre (mente/estudo-do-mestre.md, L3) mediu a maior
   diferença de ritmo entre nós e uma mesa de verdade: a uma pergunta de
   jogo, o Mestre de mesa responde com uma mediana de 11 palavras (p75: 25);
   a descrição longa (mediana 78) fica para quando há o que ver. Nós
   respondíamos 113 palavras a uma pergunta, e nunca menos de 44 —
   «quanto custa a cerveja?» recebia um parágrafo. É o que mais faz o jogo
   parecer um sistema interativo em vez de uma mesa.

   A causa é uma linha só: a etiqueta do pedido (escuta.js,
   ETIQUETA_DO_PEDIDO) diz «80 a 140 palavras» em TODO turno. A 11.ª sessão
   provou que o Narrador obedece ao que lê colado à frase do jogador (262 →
   142 palavras quando o tamanho foi para lá); logo o lugar está certo e o
   número é que é um só. Esta peça dá o número do turno.

   O QUE ELA FAZ
     - `TAMANHO_DA_RESPOSTA`: por tipo de turno, as palavras (de/até), a
       folga e o `maxTokens`. A ordem decide quando dois sinais chegam
       juntos (a chegada a um lugar novo vence a pergunta feita ao chegar:
       há o que ver).
     - `oTamanhoDaResposta(turno)`: do que o App já sabe no turno → `{ tipo,
       palavras, maxTokens, linha }`.
     - `comOTamanho(pedido, tamanho)`: o pedido à rede com a linha do tipo
       NO LUGAR da de hoje (na etiqueta, modo `mestre`; no ofício, modo
       `ator`) e o `maxTokens` do tipo. Substitui, nunca soma: a suíte prova
       que nenhuma linha é mais comprida do que a que sai.

   O `maxTokens` E A REDE DO SERVIDOR. O servidor (api/_provedor.js) põe
   o teto pedido entre 800 e 8192 e depois aplica a rede do Narrador
   (REDE_DE_SAIDA.narrador = 1200). Hoje todo turno pede 3600 e leva 1200.
   O protocolo não muda aqui: o pedido já leva `maxTokens`, e esta peça só
   escolhe o número dentro da faixa que o servidor aceita
   (`REDE_DO_TAMANHO`, que a suíte confere contra o servidor). O teto é
   rede contra a fuga, não meta: o custo cai pelas palavras que o Narrador
   escreve, e o teto só garante que uma resposta legítima nunca é cortada
   — por isso cada tipo leva a sua folga sobre o «até» e a reserva do
   pensamento e do JSON (a 12.ª sessão mediu a maior saída de turno em 453
   tokens, pensamento e JSON incluídos, e a abertura em 778).

   Puro, sem React. Provado em `testes/teste-tamanho-da-resposta.mjs`.
   ============================================================ */
import { TAMANHO_DA_NARRATIVA, LINHA_DO_TAMANHO, ETIQUETA_DO_PEDIDO, lerOPedido } from "./escuta.js";
import { TAMANHO_DA_ABERTURA } from "./abertura.js";

const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));

/* ---------------- A REDE (o que o servidor aceita) ----------------
   `piso`/`rede`: a faixa que api/_provedor.js deixa passar ao Narrador
   (o piso de `chamarOProvedor` e REDE_DE_SAIDA.narrador) — pedir menos do
   que o piso é pedir o piso. `tokensPorPalavra`: o português no tokenizador
   do Narrador (a 12.ª sessão: 273 palavras → 453 tokens com tudo).
   `reserva`: o pensamento e o JSON das mudanças, que contam dentro do teto. */
export const REDE_DO_TAMANHO = Object.freeze({ piso: 800, rede: 1200, tokensPorPalavra: 1.7, reserva: 400 });

/* ---------------- A TABELA ----------------
   `de`/`ate`: as palavras pedidas (de 0 = «até N»). `folga`: quantas vezes
   o «até» uma resposta legítima ainda pode passar sem ser cortada.
   `maxTokens`: o teto do pedido — a suíte prova que cobre
   `ate × tokensPorPalavra × folga + reserva` e cabe na rede. `jeito`: o
   fim da linha (o molde é «Responda em N palavras e {jeito}.»), o que o
   tipo pede além do número. `ordem`: quem
   vence quando dois sinais chegam juntos (menor primeiro).
   Os números: a pergunta e a conversa saem da medida da mesa (11 · p75 25
   a uma pergunta); a chegada é a faixa de hoje (TAMANHO_DA_NARRATIVA, a
   descrição que tem o que ver); a abertura é a de abertura.js. */
export const TAMANHO_DA_RESPOSTA = Object.freeze({
  abertura: Object.freeze({ ordem: 1, de: 0, ate: TAMANHO_DA_ABERTURA.max, folga: 2, maxTokens: 1200, jeito: "termine antes do limite" }),
  fecho: Object.freeze({ ordem: 2, de: 50, ate: 140, folga: 2, maxTokens: 900, jeito: "deixe o que fica" }),
  luta: Object.freeze({ ordem: 3, de: 50, ate: 130, folga: 2, maxTokens: 900, jeito: "conte como acabou" }),
  chegada: Object.freeze({ ordem: 4, de: TAMANHO_DA_NARRATIVA.min, ate: TAMANHO_DA_NARRATIVA.max, folga: 2, maxTokens: 900, jeito: "mostre o lugar novo" }),
  teste: Object.freeze({ ordem: 5, de: 40, ate: 110, folga: 2, maxTokens: 800, jeito: "conte o que o dado fez" }),
  pergunta: Object.freeze({ ordem: 6, de: 0, ate: 30, folga: 3, maxTokens: 800, jeito: "diga só o perguntado" }),
  conversa: Object.freeze({ ordem: 7, de: 10, ate: 60, folga: 2.5, maxTokens: 800, jeito: "fale quem responde" }),
  acao: Object.freeze({ ordem: 8, de: 0, ate: 80, folga: 2, maxTokens: 800, jeito: "conte o gesto e o efeito" }),
});

/* O tipo de quando nada se sabe do turno: a ação simples. */
export const TIPO_PADRAO_DO_TAMANHO = "acao";

/* ---------------- A CONVERSA PELA FRASE ----------------
   Quando o App não diz `conversa`, a frase diz: a fala entre travessão ou
   aspas, ou o verbo de falar dirigido a alguém («pergunto ao taberneiro»,
   «digo à guarda»). Sem «?» no fim: a pergunta pura é da linha de cima. */
export const SINAIS_DA_CONVERSA = Object.freeze([
  /^\s*[—–-]\s*\S/,
  /[«"“][^«»"“”]{2,}[»"”]/,
  /\b(?:digo|pergunto|falo|respondo|conto|peço|chamo|cumprimento|converso)\b[^.!?\n]{0,30}?\s(?:a|ao|à|aos|às|com)\s/i,
]);

const nPalavras = (de, ate) => (de > 0 ? `${de} a ${ate}` : `até ${ate}`);

/* a linha de um tipo: o molde de hoje (LINHA_DO_TAMANHO, escuta.js) com o
   número e o jeito do tipo */
function linhaDoTipo(tipo) {
  const r = TAMANHO_DA_RESPOSTA[tipo];
  return LINHA_DO_TAMANHO.replace("{palavras}", nPalavras(r.de, r.ate)).replace("{jeito}", r.jeito);
}

/* ---------------- O TIPO DO TURNO ----------------
   `turno`: o que o App já sabe —
     { abertura, fecho, luta, chegada: booleanos (a abertura da campanha, o
       fim de um arco, a luta que acabou neste turno, a chegada a um lugar
       novo);
       teste: o teste resolvido no turno (testeDoTurnoRef: { pericia,
       sucesso }) ou null;
       frase: a frase do jogador (ou `pedido`, o lerOPedido dela);
       acao: o que lerAcao (desafios.js) devolveu — um teste ainda por
       rolar não é pergunta, mesmo com «?»;
       conversa: booleano, quando o App sabe que é fala a alguém }.
   Lixo (null, {}, string) → o tipo padrão. */
export function tipoDoTurno(turno) {
  const t = ehObj(turno) ? turno : {};
  const sinais = {
    abertura: !!t.abertura,
    fecho: !!t.fecho,
    luta: !!t.luta,
    chegada: !!t.chegada,
    teste: ehObj(t.teste),
    pergunta: false,
    conversa: !!t.conversa,
    acao: true,
  };
  let ped = ehObj(t.pedido) ? t.pedido : null;
  if (!ped) { try { ped = lerOPedido(str(t.frase)); } catch { ped = null; } }
  const frase = ped && ped.doJogador ? str(ped.texto) : "";
  const testePorRolar = ehObj(t.acao) && t.acao.tipo === "teste";
  sinais.pergunta = !!(ped && ped.soPergunta) && !testePorRolar;
  if (!sinais.conversa && frase) sinais.conversa = SINAIS_DA_CONVERSA.some((rx) => rx.test(frase));
  const tipos = Object.keys(TAMANHO_DA_RESPOSTA).sort((a, b) => TAMANHO_DA_RESPOSTA[a].ordem - TAMANHO_DA_RESPOSTA[b].ordem);
  return tipos.find((k) => sinais[k]) || TIPO_PADRAO_DO_TAMANHO;
}

/* ---------------- O TAMANHO ----------------
   → { tipo, palavras: { de, ate }, maxTokens, linha }. Mesma entrada, mesma
   saída: nada aqui sorteia. */
export function oTamanhoDaResposta(turno) {
  let tipo = TIPO_PADRAO_DO_TAMANHO;
  try { tipo = tipoDoTurno(turno); } catch { tipo = TIPO_PADRAO_DO_TAMANHO; }
  const r = TAMANHO_DA_RESPOSTA[tipo];
  return { tipo, palavras: { de: r.de, ate: r.ate }, maxTokens: r.maxTokens, linha: linhaDoTipo(tipo) };
}

/* ---------------- O PEDIDO COM O TAMANHO ----------------
   O pedido à rede (`{ system, messages, maxTokens, … }`, o do Mestre ou o
   do ator) → um pedido NOVO, com:
     - na ÚLTIMA mensagem do jogador, a linha de tamanho de hoje trocada
       pela do tipo, dentro da etiqueta (modo `mestre`);
     - no system, «de 80 a 140 palavras» do ofício trocado pelo número do
       tipo (modo `ator`, cujo tamanho mora no ofício);
     - o `maxTokens` do tipo.
   Só troca o que acha; o resto vai letra por letra. Sem tamanho válido, o
   pedido volta como veio. Nunca muta o recebido. */
export function comOTamanho(pedido, tamanho) {
  if (!ehObj(pedido)) return pedido;
  const tam = ehObj(tamanho) ? tamanho : null;
  if (!tam || !TAMANHO_DA_RESPOSTA[tam.tipo]) return pedido;
  const r = TAMANHO_DA_RESPOSTA[tam.tipo];
  const linhaHoje = linhaDeHoje();
  const linhaNova = linhaDoTipo(tam.tipo);
  const novo = { ...pedido, maxTokens: r.maxTokens };
  if (Array.isArray(pedido.messages)) {
    const msgs = pedido.messages.slice();
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (!ehObj(m) || m.role !== "user" || typeof m.content !== "string") continue;
      const k = m.content.lastIndexOf(ETIQUETA_DO_PEDIDO);
      if (k >= 0) {
        const etq = ETIQUETA_DO_PEDIDO.replace(linhaHoje, linhaNova);
        msgs[i] = { ...m, content: m.content.slice(0, k) + etq + m.content.slice(k + ETIQUETA_DO_PEDIDO.length) };
      }
      break;
    }
    novo.messages = msgs;
  }
  if (typeof pedido.system === "string") {
    const hoje = `de ${TAMANHO_DA_NARRATIVA.min} a ${TAMANHO_DA_NARRATIVA.max} palavras`;
    const nova = r.de > 0 ? `de ${r.de} a ${r.ate} palavras` : `até ${r.ate} palavras`;
    if (pedido.system.includes(hoje)) novo.system = pedido.system.replace(hoje, nova);
  }
  return novo;
}

/* a linha que vai hoje na etiqueta (o molde com a faixa de sempre) */
function linhaDeHoje() {
  return LINHA_DO_TAMANHO.replace("{palavras}", `${TAMANHO_DA_NARRATIVA.min} a ${TAMANHO_DA_NARRATIVA.max}`).replace("{jeito}", "termine antes do limite");
}
