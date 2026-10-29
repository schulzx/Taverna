/* ============================================================
   A SESSÃO GUARDADA (T1-A, 7.ª fatia, 28/10/2026) — Taverna

   `sessao.js` (T3-B) diz o que é o arquivo de uma sessão e como se grava
   um turno nele; não diz onde ele mora. Este módulo diz, e é a única coisa
   que diz: a chave, o teto e o que fica de fora. A fiação do App só chama.

   AS QUATRO REGRAS DA CASA PARA ONDE GUARDAR (a ordem de 28/10):

   1. É CHAVE NOVA, que a versão antiga ignora. O save não muda por causa
      dela: o arquivo da sessão vive ao lado do save, numa chave própria
      (`<espaço do save><sufixo>`), e um jogo de antes nunca a lê.
   2. Fica no espaço do modo `historia`. A chave nasce do espaço do save do
      modo (`taverna_save_v1` → `taverna_save_v1_sessao`), e só os modos da
      tabela gravam: hoje só Uma Vida, o único que o beta abre.
   3. Tem um teto, escrito aqui. Um localStorage tem poucos megabytes, e o
      save é quem não pode perder espaço. Quando a página passa do teto, a
      PÁGINA VIRA: uma página nova começa do estado de antes do último
      turno, e leva-o (sessao.js#virarAPagina). A página velha NÃO SE PERDE
      (29/10, a 13.ª sessão: virou aos 21 turnos e deitou-os fora sem
      aviso): vai inteira no campo `anterior` da nova, com teto próprio, e
      a cabeça da nova diz que página é e quantos turnos ficaram para trás
      (`virada`: { pagina, turnosAntes, cortou }). Só uma página de antes
      se guarda; a de antes dela, e uma anterior que não caiba no teto
      dela, contam-se em `cortou` — o corte está escrito, nunca é calado.
      Se nem a cabeça cabe, não se guarda nada.
   4. Não pode custar o turno: tudo aqui é puro e nunca lança; a fiação
      embrulha a escrita em `calou`, e uma escrita que falha apaga a chave
      da sessão — o save fica intocado. A página de antes mora DENTRO da
      mesma chave: `cederAoSave` larga as duas de uma vez, e um jogo de
      antes (que só conhece esta chave) nunca fica com espaço preso.

   O QUE FICA DE FORA DO ESTADO: o relato (`mensagens`, `historico`). O
   replay não o lê nem o compara (é da tela — `FORA_DA_REGUA` de
   sessao.js), e era o grosso do peso de cada cabeça. As narrações que o
   Juiz lê já estão nas linhas, e o ponto da sorte (que conta as falas) vai
   gravado em cada turno. E, desde 29/10, a `fidelidade`: a conta do Juiz
   é bastidor (o replay não a compara nem a escreve, e nenhum passo a lê),
   e refaz-se das linhas — cada uma leva o seu `juiz.resumo`, que
   `resumoDaSessao` soma. Gravada no estado, ela ia INTEIRA em cada linha
   (os últimos 24 vereditos com os trechos: 7 mil caracteres por turno na
   13.ª, um quarto da linha) e outra vez na cabeça.
   ============================================================ */
import { abrirASessao, estadoNoTurno, virarAPagina } from "./sessao.js";

export const SESSAO_GUARDADA = Object.freeze({
  /* a chave: o espaço do save do modo, mais isto */
  sufixo: "_sessao",
  /* caracteres do JSON da página (sem a de antes). Medida de 28/10 no
     5199 (Narrador falso, campanha nova, três turnos): a cabeça pesa 41
     mil e um turno 14 a 15 mil. A de 29/10, na 13.ª (IA real, 23 turnos,
     a capital): a cabeça 96,8 mil e o turno 28,1 mil — dos quais 7,1 mil
     da `fidelidade` e 3,8 mil das narrações de eco que a primeira linha
     de uma página leva inteiras. Sem a fidelidade, a mesma página pesa
     90,1 mil de cabeça e 17,2 mil por turno: ~29 turnos por página. */
  teto: 600000,
  /* caracteres da página de antes, que vai dentro da mesma chave: a
     página que vira já cabia no teto um turno antes, e é isso que passa.
     A chave fica abaixo de 1,2 milhão de caracteres — ~2,4 MB num
     localStorage que conta em UTF-16, a metade do que um navegador dá a
     uma origem (5 MB) — e cede ao save antes de ele perder um byte. */
  tetoDaAnterior: 600000,
  /* os modos que gravam: o beta é Uma Vida (a ordem de 28/09) */
  modos: Object.freeze(["historia"]),
  /* o que o estado da sessão não leva: o relato, que é da tela, e a conta
     do Juiz, que as linhas refazem (ver o cabeçalho) */
  foraDoArquivo: Object.freeze(["mensagens", "historico", "fidelidade"]),
  /* a origem escrita na cabeça do arquivo */
  origem: "o jogo, gravado turno a turno pela fiação do App",
});

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});

/* a chave da sessão, a partir do espaço do save do modo */
export function chaveDaSessao(espacoDoSave, cfg = SESSAO_GUARDADA) {
  return `${String(espacoDoSave || "")}${obj(cfg).sufixo || SESSAO_GUARDADA.sufixo}`;
}

/* A SESSÃO CEDE AO SAVE (28/10, o orquestrador). O arquivo da sessão
   pode chegar ao teto (600 mil caracteres, ~1,2 MB num localStorage que
   conta em UTF-16), e o save é quem não pode perder espaço (a regra 3).
   Quando a gravação do save falha, a primeira coisa que se larga é a
   sessão — antes de podar o histórico do jogador. Apaga só a chave da
   sessão deste espaço; devolve true se havia o que largar. Nunca lança. */
export function cederAoSave(armazem, espacoDoSave, cfg = SESSAO_GUARDADA) {
  try {
    if (!armazem || typeof armazem.getItem !== "function" || typeof armazem.removeItem !== "function") return false;
    const chave = chaveDaSessao(espacoDoSave, cfg);
    if (chave === String(espacoDoSave || "")) return false;
    if (armazem.getItem(chave) == null) return false;
    armazem.removeItem(chave);
    return true;
  } catch { return false; }
}

/* este modo grava? */
export function gravaNesteModo(modo, cfg = SESSAO_GUARDADA) {
  const modos = Array.isArray(obj(cfg).modos) ? cfg.modos : SESSAO_GUARDADA.modos;
  return modos.includes(modo);
}

/* o estado como a sessão o leva: o retrato sem o relato */
export function estadoParaASessao(retrato, cfg = SESSAO_GUARDADA) {
  const fora = new Set(Array.isArray(obj(cfg).foraDoArquivo) ? cfg.foraDoArquivo : SESSAO_GUARDADA.foraDoArquivo);
  const e = {};
  for (const [k, v] of Object.entries(obj(retrato))) if (!fora.has(k)) e[k] = v;
  return e;
}

/* O TURNO, NA FORMA QUE `gravarOTurno` PEDE, a partir do que a fiação
   juntou no envio (cabeçalho de sessao.js): a frase do jogador quando é
   dele, senão o toque (o envelope do sistema que subiu); a sorte do
   aplicar; o pedido; a resposta crua; o Cronista e o Juiz quando houve.
   Os sítios dali (`lugaresDaqui`) só vão com a frase do jogador que não
   é um envelope: é só ela que o passo do sítio lê (sessao.js, "o sítio
   pela frase"), e num toque eram 3,5 mil caracteres que nada lia. */
export function turnoParaASessao(juntado) {
  const t = obj(juntado);
  const frase = typeof t.frase === "string" && t.frase.trim() ? t.frase : null;
  const lugares = Array.isArray(t.lugaresDaqui) && frase && !frase.trimStart().startsWith("[") ? { lugaresDaqui: t.lugaresDaqui } : {};
  const entrada = frase
    ? { frase, ...lugares }
    : { toque: { tipo: "envelope", conteudo: String(t.conteudo == null ? "" : t.conteudo).slice(0, 400) } };
  return {
    entrada,
    sorte: { ponto: String(t.ponto == null ? "" : t.ponto), ...(obj(t.contagem) === t.contagem ? { contagem: t.contagem } : {}), ...(typeof t.casa === "string" ? { casa: t.casa } : {}) },
    pedido: {
      pauta: String(t.pauta == null ? "" : t.pauta),
      ...(typeof t.envelopes === "string" ? { envelopes: t.envelopes } : {}),
      ...(Array.isArray(t.nomesAMao) ? { nomesAMao: t.nomesAMao } : {}),
      ...(typeof t.moeda === "string" && t.moeda ? { moeda: t.moeda } : {}),
    },
    narrador: obj(t.narrador),
    cronista: obj(t.cronista) === t.cronista ? t.cronista : null,
    juiz: obj(t.juiz) === t.juiz ? t.juiz : null,
  };
}

/* O texto da página de antes não muda enquanto ela é a de antes: escreve-se
   uma vez e reaproveita-se a cada turno (são até 600 mil caracteres). A
   memória é do objeto — o arquivo que a fiação segura passa-o de turno em
   turno sem o copiar (e o estado nunca se muta) —, guarda um só, o último,
   e não muda o que sai. */
let textoDaAnterior = { de: null, texto: "" };
const textoDe = (o) => {
  if (textoDaAnterior.de !== o) textoDaAnterior = { de: o, texto: JSON.stringify(o) };
  return textoDaAnterior.texto;
};
/* a página e, se houver, a de antes, no fim da mesma chave */
const comAAnterior = (pagina, anterior) => {
  const tp = JSON.stringify(pagina);
  return anterior ? `${tp.slice(0, -1)},"anterior":${textoDe(anterior)}}` : tp;
};
const quantos = (x) => (Array.isArray(obj(x).turnos) ? x.turnos.length : 0);

/* O QUE SE ESCREVE NA CHAVE. Devolve { arquivo, texto, virou }: o arquivo
   que a fiação passa a segurar, o texto a guardar (null = apagar a chave)
   e se a página virou. O teto mede a página; a de antes tem o seu
   (`tetoDaAnterior`). Puro, e nunca lança. */
export function guardarASessao(arquivo, cfg = SESSAO_GUARDADA) {
  const teto = Number.isFinite(obj(cfg).teto) ? cfg.teto : SESSAO_GUARDADA.teto;
  const tetoDaAnt = Number.isFinite(obj(cfg).tetoDaAnterior) ? cfg.tetoDaAnterior : SESSAO_GUARDADA.tetoDaAnterior;
  try {
    const A = obj(arquivo);
    const { anterior, ...pagina } = A;
    const ant = obj(anterior) === anterior ? anterior : null;
    if (JSON.stringify(pagina).length <= teto) return { arquivo: A, texto: comAAnterior(pagina, ant), virou: false };
    /* a página vira. O último turno passa à página nova (virarAPagina); se
       nem ele cabe com a cabeça, a nova nasce vazia no fim dele, e ele fica
       na velha. A velha vai inteira como a de antes, se couber no teto dela. */
    const v = virarAPagina(pagina);
    let velha, nova;
    if (v && JSON.stringify(v.nova).length <= teto) ({ velha, nova } = v);
    else {
      const { virada: _v, ...cab } = pagina;
      velha = pagina;
      nova = { ...abrirASessao({ semente: cab.semente, mundo: cab.mundo, origem: cab.origem, estado: {} }), inicio: estadoNoTurno(pagina, quantos(pagina)) };
    }
    const cabeVelha = textoDe(velha).length <= tetoDaAnt;
    const ja = obj(pagina.virada);
    const virada = {
      pagina: (Number.isInteger(ja.pagina) ? ja.pagina : 1) + 1,
      turnosAntes: (Number.isInteger(ja.turnosAntes) ? ja.turnosAntes : 0) + quantos(velha),
      cortou: (Number.isInteger(ja.cortou) ? ja.cortou : 0) + quantos(ant) + (cabeVelha ? 0 : quantos(velha)),
    };
    const { turnos: tsNova, ...cabNova } = nova;
    const paginaNova = { ...cabNova, turnos: tsNova, virada };
    if (JSON.stringify(paginaNova).length > teto) return { arquivo: paginaNova, texto: null, virou: true };
    const novo = cabeVelha ? { ...paginaNova, anterior: velha } : paginaNova;
    return { arquivo: novo, texto: comAAnterior(paginaNova, cabeVelha ? velha : null), virou: true };
  } catch {
    return { arquivo: null, texto: null, virou: false };
  }
}

/* AS PÁGINAS DA CHAVE, para quem as lê (o replay, a suíte): [a de antes,
   se veio, e a de agora], cada uma um arquivo de sessão por si, sem a
   `anterior`. Nunca lança. */
export function paginasDaSessao(arquivo) {
  try {
    const A = obj(arquivo);
    const { anterior, ...pagina } = A;
    return [...(obj(anterior) === anterior ? [anterior] : []), pagina];
  } catch { return []; }
}
