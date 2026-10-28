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
      save é quem não pode perder espaço. Quando o arquivo passa do teto, a
      PÁGINA VIRA: um arquivo novo começa do estado do fim do último turno
      gravado (o anterior já não cabe — e um arquivo pela metade, cortado
      no meio, não reproduziria). Se nem a cabeça cabe, não se guarda nada.
   4. Não pode custar o turno: tudo aqui é puro e nunca lança; a fiação
      embrulha a escrita em `calou`, e uma escrita que falha apaga a chave
      da sessão — o save fica intocado.

   O QUE FICA DE FORA DO ESTADO: o relato (`mensagens`, `historico`). O
   replay não o lê nem o compara (é da tela — `FORA_DA_REGUA` de
   sessao.js), e era o grosso do peso de cada cabeça. As narrações que o
   Juiz lê já estão nas linhas, e o ponto da sorte (que conta as falas) vai
   gravado em cada turno.
   ============================================================ */
import { abrirASessao, estadoNoTurno } from "./sessao.js";

export const SESSAO_GUARDADA = Object.freeze({
  /* a chave: o espaço do save do modo, mais isto */
  sufixo: "_sessao",
  /* caracteres do JSON guardado. Medida de 28/10 no 5199 (Narrador
     falso, campanha nova, três turnos): a cabeça pesa 41 mil e um turno
     14 a 15 mil — a pauta, os envelopes e a entrada do Juiz. O teto leva
     ~40 turnos por página, e fica abaixo de um oitavo do que um navegador
     dá a uma origem (5 MB), longe do save (38 mil na mesma campanha). */
  teto: 600000,
  /* os modos que gravam: o beta é Uma Vida (a ordem de 28/09) */
  modos: Object.freeze(["historia"]),
  /* o que o estado da sessão não leva: o relato, que é da tela */
  foraDoArquivo: Object.freeze(["mensagens", "historico"]),
  /* a origem escrita na cabeça do arquivo */
  origem: "o jogo, gravado turno a turno pela fiação do App",
});

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});

/* a chave da sessão, a partir do espaço do save do modo */
export function chaveDaSessao(espacoDoSave, cfg = SESSAO_GUARDADA) {
  return `${String(espacoDoSave || "")}${obj(cfg).sufixo || SESSAO_GUARDADA.sufixo}`;
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
   aplicar; o pedido; a resposta crua; o Cronista e o Juiz quando houve. */
export function turnoParaASessao(juntado) {
  const t = obj(juntado);
  const lugares = Array.isArray(t.lugaresDaqui) ? { lugaresDaqui: t.lugaresDaqui } : {};
  const entrada = typeof t.frase === "string" && t.frase.trim()
    ? { frase: t.frase, ...lugares }
    : { toque: { tipo: "envelope", conteudo: String(t.conteudo == null ? "" : t.conteudo).slice(0, 400) }, ...lugares };
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

/* O QUE SE ESCREVE NA CHAVE. Devolve { arquivo, texto, virou }: o arquivo
   que a fiação passa a segurar, o texto a guardar (null = apagar a chave)
   e se a página virou. Puro, e nunca lança. */
export function guardarASessao(arquivo, cfg = SESSAO_GUARDADA) {
  const teto = Number.isFinite(obj(cfg).teto) ? cfg.teto : SESSAO_GUARDADA.teto;
  try {
    const A = obj(arquivo);
    const texto = JSON.stringify(A);
    if (texto.length <= teto) return { arquivo: A, texto, virou: false };
    /* a página vira: o arquivo novo começa onde o último turno acabou */
    const novo = abrirASessao({ semente: A.semente, mundo: A.mundo, origem: A.origem, estado: estadoNoTurno(A, (A.turnos || []).length) });
    const t2 = JSON.stringify(novo);
    if (t2.length <= teto) return { arquivo: novo, texto: t2, virou: true };
    return { arquivo: novo, texto: null, virou: true };
  } catch {
    return { arquivo: null, texto: null, virou: false };
  }
}
