/* ============================================================
   O REGISTRO (v9.105) — a memória que não resume

   A pergunta que trouxe este arquivo: "agora que temos um mestre que não
   gasta tokens para saber tudo o que aconteceu, acha que resumir ainda é
   necessário? Em vez de cânone e Codex ele pode ter acesso à história
   toda."

   MEDI ANTES DE RESPONDER. A campanha de prova tem 118 turnos e 37 mil
   caracteres de histórico — mas foi jogada com um Narrador de mentira, e
   as narrações tinham 315 caracteres. Uma de verdade tem 1.200 a 2.000.
   Projetando com 1.700 por turno:

     100 turnos → ~47k tokens de histórico · o prompt vai a ~64k · cabe
     250 turnos → ~118k · o prompt vai a ~135k · no limite
     500 turnos → ~235k · não cabe em contexto nenhum que se pague

   O histórico completo funciona nos primeiros cento e cinquenta turnos e
   quebra depois. É o pior tipo de desenho: passa em todo teste e falha
   exatamente na campanha que o jogador construiu por meses.

   ---------------- MAS A INTUIÇÃO ESTAVA CERTA ----------------

   Três coisas diferentes estavam embrulhadas na palavra "resumo":

   1. O CÂNONE — fatos imutáveis que não podem ser contraditos. Não é
      resumo, é tabela de fatos, e continua.
   2. O LIVRO — 220 palavras escritas por IA a cada 8 turnos, custando
      uma chamada. Este morre, e por uma razão nova: quase tudo o que ele
      resumia virou dado estruturado — laço, relógios, missões, fase do
      arco, plano do vilão, marcas, confidências, tentativas, fama,
      lugares visitados. O livro reescrevia em prosa o que o sistema já
      sabe em campo.
   3. O HISTÓRICO BRUTO — os últimos turnos, e ele fica melhor quando o
      livro sai.

   ---------------- O QUE ENTRA NO LUGAR ----------------

   Nem resumir nem mandar tudo. A terceira coisa, e é o padrão do
   conselho aplicado à memória: UMA LINHA por turno, escrita por CÓDIGO a
   partir do que o Mestre já sabia naquele instante — quem estava, onde,
   de que tratava, o que aconteceu e quanto pesou. Zero chamada de IA,
   ~140 caracteres por turno.

   E dois leitores em cima da mesma tabela: o ARQUIVISTA, que RECUPERA em
   vez de resumir, e (mais adiante) o COBRADOR, que responde o que o
   mundo ainda não cobrou.

   ---------------- A PODA É POR PESO, NÃO POR IDADE ----------------

   O turno em que você matou alguém fica para sempre. O turno em que você
   foi ao mercado sai numa semana. É como a memória funciona, e é a única
   forma de o registro caber num save que já esbarra na cota do navegador
   — mil turnos de linha crua dariam 140 KB.
   ============================================================ */

/* Quanto uma coisa pesa decide quanto tempo ela é lembrada. Os prazos
   são em DIAS DE CAMPANHA, não em turnos: o que importa é há quanto
   tempo na história, não há quantas jogadas. */
export const PESOS = [
  { peso: 0, rotulo: "passagem", dura: 3, o: "andar, olhar, esperar — o tecido do dia" },
  { peso: 1, rotulo: "acontecimento", dura: 12, o: "um teste, uma conversa com nome, uma compra" },
  { peso: 2, rotulo: "virada", dura: 45, o: "um clímax da onda, um laço, uma descoberta, um contrato" },
  { peso: 3, rotulo: "marca", dura: Infinity, o: "uma morte, um passo do vilão, um capítulo — não se esquece" },
];
export function pesoPorNivel(n) {
  const i = Math.max(0, Math.min(PESOS.length - 1, Math.round(Number(n) || 0)));
  return PESOS[i];
}

/* Um registro grande demais é um save que não grava. O teto é de linhas,
   e a poda por peso roda antes dele — quando nem assim couber, o mais
   antigo de menor peso sai primeiro. */
export const TETO_DE_LINHAS = 900;

/* v9.113: CORTA NO FIM DE UMA PALAVRA. O `oQue` de uma linha vai à
   Pauta e daí ao Narrador, e ele lia coisas como `por "Saco a fa"` —
   um pedaço de frase que ele tem de fingir que faz sentido. É o mesmo
   defeito do nome de equipamento na v9.111, no lugar onde ele mais
   aparece. Reticências para o Narrador saber que a frase continua. */
const limpar = (s, max = 90) => {
  const x = String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  if (x.length <= max) return x;
  /* a reticência entra DENTRO do teto: o teto é o teto, e um leitor que
     conta caracteres não pode receber 91 onde o contrato diz 90 */
  const corte = x.slice(0, max - 1);
  const espaco = corte.lastIndexOf(" ");
  return (espaco > (max - 1) * 0.6 ? corte.slice(0, espaco) : corte).trim() + "…";
};
const nomes = (v, max = 4) => (Array.isArray(v) ? v : [])
  .map((x) => limpar(typeof x === "string" ? x : (x && x.nome) || "", 30))
  .filter(Boolean)
  .filter((x, i, a) => a.indexOf(x) === i)
  .slice(0, max);

export function garantirLinha(l) {
  const o = l && typeof l === "object" ? l : {};
  return {
    t: Math.max(0, Math.floor(Number(o.t) || 0)),        // número do turno
    dia: Math.max(0, Math.floor(Number(o.dia) || 0)),
    onde: limpar(o.onde, 60),
    quem: nomes(o.quem),
    assunto: limpar(o.assunto, 40),
    oQue: limpar(o.oQue, 90),
    peso: Math.max(0, Math.min(3, Math.round(Number(o.peso) || 0))),
    /* quem VIU é o que o Cobrador vai ler, e o que o vilão vai poder
       ter escutado. Guardado desde já porque preencher depois é
       impossível: ninguém lembra quem estava numa cena de trinta dias
       atrás — só o registro. */
    viu: nomes(o.viu, 4),
    /* v9.112: O ATO CLASSIFICADO, que o Intérprete já calcula e que
       morria no fim do turno. `oQue` é texto livre e serve para LER;
       o Cobrador precisa DECIDIR, e não se decide sobre texto livre.

       O contexto vem junto pelo mesmo motivo que o Aliado precisou
       dele na v9.108: sem ele, metade das formas de cobrança tem
       condição sempre falsa e cala em silêncio. */
    ato: limpar(o.ato, 20),
    suborno: !!o.suborno,
    fugi: !!o.fugi,
    poupei: !!o.poupei,
    alguemPrecisava: !!o.alguemPrecisava,
    emCombate: !!o.emCombate,
    publico: !!o.publico,
  };
}

export function garantirRegistro(r) {
  const l = Array.isArray(r) ? r : [];
  return l.map(garantirLinha).filter((x) => x.oQue || x.assunto || x.quem.length);
}

/* ---------------- ESCREVER ----------------
   Uma linha por turno, e só quando há o que dizer. Um turno em que o
   jogador escreveu "espero" e nada aconteceu não vira linha: registrar o
   nada é o que faz um registro deixar de ser legível. */
export function anotar(registro, linha) {
  const l = garantirLinha(linha);
  if (!l.oQue && !l.assunto && !l.quem.length) return garantirRegistro(registro);
  return [...garantirRegistro(registro), l];
}

/* ---------------- PODAR ----------------
   Por peso primeiro, por idade dentro do peso. Roda uma vez por dia de
   campanha, não a cada turno: podar é barato mas não é de graça. */
export function podar(registro, { dia = 0, teto = TETO_DE_LINHAS } = {}) {
  let l = garantirRegistro(registro).filter((x) => {
    const p = pesoPorNivel(x.peso);
    return !Number.isFinite(p.dura) || dia - x.dia <= p.dura;
  });
  if (l.length <= teto) return l;
  /* ainda grande: o mais antigo de menor peso sai primeiro, e o de peso
     3 nunca sai — é a promessa da tabela */
  const ordenado = [...l].sort((a, b) => (a.peso - b.peso) || (a.dia - b.dia) || (a.t - b.t));
  const cortar = new Set();
  for (const x of ordenado) {
    if (l.length - cortar.size <= teto) break;
    if (x.peso >= 3) continue;
    cortar.add(x);
  }
  return l.filter((x) => !cortar.has(x));
}

/* ---------------- O ARQUIVISTA ----------------
   "Esta cena é com Marta, no Escudo das Velas, sobre uma dívida — o que
   já aconteceu que importa?"

   Ele não resume: RECUPERA. E o custo dele no prompt é fixo para sempre
   — uma campanha de mil turnos entrega as mesmas três linhas que uma de
   trinta. É a diferença que faz a memória escalar. */
export const QUANTAS_LINHAS = 3;

/* Os pontos de cada critério. A pessoa vale mais que o lugar, e o lugar
   mais que o assunto, por uma razão de mesa: o jogador lembra do lugar
   sozinho (ele está olhando para ele) e não lembra do que aconteceu com
   aquela pessoa há trinta turnos. O sistema cobre o que a cabeça não
   cobre. */
export const PONTOS = { pessoa: 5, lugar: 3, assunto: 2, peso: 2, recente: 1 };

export function pontuar(linha, { onde = "", quem = [], assunto = "", turnoAtual = 0 } = {}) {
  const l = garantirLinha(linha);
  const nQuem = nomes(quem, 8).map((x) => x.toLowerCase());
  let p = 0;
  for (const q of l.quem) if (nQuem.includes(q.toLowerCase())) p += PONTOS.pessoa;
  if (onde && l.onde && l.onde.toLowerCase().includes(String(onde).toLowerCase().slice(0, 20))) p += PONTOS.lugar;
  if (assunto && l.assunto === assunto) p += PONTOS.assunto;
  p += l.peso * PONTOS.peso;
  /* o recente empata o velho, mas nunca ganha dele sozinho: uma dívida
     de quarenta turnos atrás vale mais que a caneca de ontem */
  const dist = Math.max(1, turnoAtual - l.t);
  p += PONTOS.recente * Math.max(0, 1 - dist / 60);
  return p;
}

export function consultarArquivista(registro, ctx = {}, { quantas = QUANTAS_LINHAS, minimo = 6 } = {}) {
  const { turnoAtual = 0 } = ctx;
  const l = garantirRegistro(registro)
    .filter((x) => x.t < turnoAtual)     /* o turno de agora não é passado */
    .map((x) => ({ x, p: pontuar(x, ctx) }))
    .filter((o) => o.p >= minimo)        /* sem relevância nenhuma, melhor calar */
    .sort((a, b) => b.p - a.p || b.x.t - a.x.t)
    .slice(0, quantas)
    .map((o) => o.x)
    .sort((a, b) => a.t - b.t);          /* e devolve em ordem de história */
  return l;
}

/* A linha que sobe à Pauta. Curta de propósito: o que ela precisa fazer
   é lembrar o Narrador de uma coisa, não recontá-la. */
export function linhaDoArquivo(l, { diaAtual = 0 } = {}) {
  const x = garantirLinha(l);
  const atras = diaAtual > x.dia ? `há ${diaAtual - x.dia} ${diaAtual - x.dia === 1 ? "dia" : "dias"}` : "hoje";
  const com = x.quem.length ? ` (${x.quem.join(", ")})` : "";
  return `${atras}${x.onde ? `, ${x.onde}` : ""}${com}: ${x.oQue}`;
}

export function paraPauta(registro, ctx = {}) {
  return consultarArquivista(registro, ctx).map((l) => linhaDoArquivo(l, { diaAtual: ctx.diaAtual || 0 }));
}

/* ---------------- A CAMPANHA INTEIRA, EM PESO ----------------
   As três recalibragens (a lenda, o mundo, a ascensão) mandavam o LIVRO
   a uma IA para ela reler o que a campanha tinha sido. O que elas
   precisam é exatamente o que o registro guarda melhor: os fatos que
   pesaram. Sem perda de resumo, e sem ter custado uma chamada de rede
   para existir.

   Só peso 2 e 3 — a virada e a marca. Uma recalibragem não precisa saber
   que o herói foi ao mercado na terça. */
export function linhasPesadas(registro, { quantas = 40, minimo = 2 } = {}) {
  return garantirRegistro(registro)
    .filter((x) => x.peso >= minimo)
    .sort((a, b) => a.t - b.t)
    .slice(-quantas);
}

export function resumoDoRegistro(registro, { quantas = 40 } = {}) {
  const l = linhasPesadas(registro, { quantas });
  if (!l.length) return "(a campanha ainda não registrou nada de peso)";
  return l.map((x) => `dia ${x.dia}${x.onde ? ` · ${x.onde}` : ""}${x.quem.length ? ` · ${x.quem.join(", ")}` : ""}: ${x.oQue}`).join("\n");
}

/* ---------------- O QUE A MESA VÊ ----------------
   Nada. O registro é do sistema, e o sistema não fala de si mesmo. Ele
   aparece só pelo efeito: o Narrador lembrando de uma coisa que o
   jogador tinha esquecido. */

/* Uma linha só, e ela mora DENTRO do bloco da Pauta: as regras do
   registro são sobre uma seção da Pauta, e um bloco próprio repetia o
   enquadramento do outro por quinhentos caracteres. */
export const REGISTRO_PROMPT = `· A linha ANTES traz coisas que ACONTECERAM nesta campanha, escolhidas pelo sistema por serem relevantes a esta cena. São fato. Use-as como quem LEMBRA — uma menção, um olhar, uma frase que só faz sentido para quem estava lá —, e nunca as reconte, explique ou trate como novidade. O que não está ali não precisa ser lembrado agora.`;
