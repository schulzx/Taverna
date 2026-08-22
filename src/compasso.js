/* ============================================================
   O COMPASSO (v9.91) — a fórmula que impede os dois desastres

   "Assim a história nunca fica chata demais com muito tempo sem ação e
   batalhas, nem caótica demais com batalhas o tempo todo sem tempo pra
   descanso e diálogos. O sistema pode ir mandando para o mestre 'comece
   a preparar uma briga' e depois 'agora comece a briga'."

   O ARCO (historia.js) diz ONDE a campanha está — o norte dramático, seis
   momentos ao longo de uma vida inteira de jogo. É a camada mais lenta
   que existe aqui, e é lenta de propósito.

   O COMPASSO é a camada rápida, e é ela que faltava. Entre dois momentos
   do arco cabem cinquenta turnos, e até aqui esses cinquenta turnos não
   tinham forma nenhuma: o mundo se mexia por cadência, o vilão andava por
   calendário, e o resto era o que o jogador quisesse fazer. Uma campanha
   podia passar quinze turnos sem nada acontecer e depois três lutas
   seguidas, e nenhuma peça do sistema estava errada.

   ---------------- A ONDA, E ELA É FIXA ----------------

     respiro → semente → subida → véspera → CLÍMAX → preço → respiro…

   Seis movimentos, sempre nessa ordem, sempre. É esta a "fórmula
   infalível": ela não escolhe o que acontece — ela garante que sempre
   haja ar antes da pancada e conta depois dela. Um jogo que só sobe cansa;
   um que nunca sobe não é jogo.

   O que é SORTEADO é o ASSUNTO (assuntos.js): do que essa onda trata.
   Escolhido na SEMENTE e carregado até o PREÇO — e é daí que vem o efeito
   que o pedido descreve. O sistema avisa cedo, o Mestre prepara o
   terreno, e quando a coisa acontece ela parece que estava vindo desde
   sempre. Porque estava.

   ---------------- A VÉSPERA É A PEÇA QUE IMPORTA ----------------

   Um turno, e é o mais importante dos seis. É a última chance de o
   jogador escolher COMO encontra o que vem. Sem ela o clímax é uma
   emboscada do sistema — e emboscada do sistema é a diferença entre um
   jogo difícil e um jogo injusto.

   ---------------- O QUE O COMPASSO NÃO FAZ ----------------

   Não abre combate, não cria item, não mata ninguém, não avança o arco.
   Ele diz DO QUE a cena trata e EM QUE TEMPO da onda ela está. Quem
   decide o que é verdade continua sendo o resto do sistema, e quem narra
   continua sendo a IA.
   ============================================================ */

import { ASSUNTOS, FAMILIAS, assuntoPorId, familiaPorId } from "./assuntos.js";
export { ASSUNTOS, FAMILIAS, assuntoPorId, familiaPorId };

/* ============================================================
   OS MOVIMENTOS

   `dura` é em TURNOS, e é uma faixa: a onda respira diferente a cada
   volta, senão o jogador aprende a contar e o clímax vira relógio.

   `tensao` é o degrau que aquele movimento ocupa na curva — serve para o
   resto do sistema saber se pode interromper. E `fala` diz se o
   movimento manda um envelope ao Mestre: respiro e subida não mandam
   sempre, porque um sistema que fala em todos os seis tempos vira uma
   locução em cima da narração.
   ============================================================ */
export const MOVIMENTOS = [
  {
    id: "respiro", ordem: 0, tensao: 0, dura: [2, 4], fala: false,
    nome: "o respiro",
    diz: "não há nada em jogo, e é para não haver",
    porque: "é o movimento mais fácil de cortar e o mais caro de perder: sem ele a mesa não tem com que comparar o perigo, e uma campanha em que tudo é urgente é uma campanha em que nada é",
  },
  {
    id: "semente", ordem: 1, tensao: 1, dura: [1, 2], fala: true,
    nome: "a semente",
    diz: "entra na cena o material de que a coisa vai precisar — e nada acontece ainda",
    porque: "é aqui que mora o pedido inteiro: 'comece a preparar uma briga'. O Mestre põe as peças no tabuleiro várias cenas antes de elas serem usadas, e é isso que faz o clímax parecer inevitável em vez de sorteado",
  },
  {
    id: "subida", ordem: 2, tensao: 2, dura: [2, 4], fala: true,
    nome: "a subida",
    diz: "aperta, e agora o jogador pode agir contra",
    porque: "sem esta faixa a semente viraria clímax direto, e o jogador nunca teria tido a chance de mudar o rumo — que é a diferença entre jogar e assistir",
  },
  {
    id: "vespera", ordem: 3, tensao: 3, dura: [1, 1], fala: true,
    nome: "a véspera",
    diz: "está a um passo, e ainda dá para escolher como encontrá-lo",
    porque: "um turno só, e o mais importante dos seis: é a última chance de o jogador decidir COMO encara o que vem. Sem ela o clímax é emboscada do sistema, e emboscada do sistema é a diferença entre difícil e injusto",
  },
  {
    id: "climax", ordem: 4, tensao: 4, dura: [1, 2], fala: true,
    nome: "o clímax",
    diz: "acontece",
    porque: "e acontece com o material que já está na mesa há cenas: se o Mestre precisar inventar alguma coisa aqui, a semente falhou",
  },
  {
    id: "preco", ordem: 5, tensao: 2, dura: [1, 2], fala: true,
    nome: "o preço",
    diz: "o que ficou",
    porque: "nunca é 'e tudo voltou ao normal'. Um clímax sem preço ensina o jogador que nada do que ele faz pesa, e essa é a lição mais cara que um jogo pode ensinar",
  },
];
export function movimentoPorId(id) { return MOVIMENTOS.find((m) => m.id === id) || MOVIMENTOS[0]; }
export function movimentoPorOrdem(o) { return MOVIMENTOS[Math.max(0, Math.min(MOVIMENTOS.length - 1, o))]; }

/* ============================================================
   O ESTADO

   Quatro campos, e nenhum é opinião: em que movimento a onda está, há
   quantos turnos, de que assunto ela trata, e quais assuntos já foram —
   porque um assunto repetido logo depois de si mesmo é o mesmo tique que
   a estante do Bibliotecário evita, uma camada acima.
   ============================================================ */
export const NAO_REPETIR_ASSUNTO = 4;
export const NAO_REPETIR_FAMILIA = 2;

export function garantirCompasso(c) {
  const o = c && typeof c === "object" ? c : {};
  const n = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d);
  const mov = MOVIMENTOS.some((m) => m.id === o.movimento) ? o.movimento : "respiro";
  return {
    movimento: mov,
    /* turnos DENTRO do movimento atual */
    turnos: Math.max(0, n(o.turnos, 0)),
    /* o alvo sorteado para este movimento, dentro da faixa de `dura` */
    alvo: Math.max(1, n(o.alvo, 3)),
    assunto: typeof o.assunto === "string" ? o.assunto : "",
    usados: (Array.isArray(o.usados) ? o.usados : []).slice(-8),
    familias: (Array.isArray(o.familias) ? o.familias : []).slice(-4),
    /* quantas ondas completas esta campanha já deu — o compasso não some
       na virada de capítulo, mas o contador sim */
    voltas: Math.max(0, n(o.voltas, 0)),
  };
}

function sortearDuracao(mov, sorte) {
  const [a, b] = mov.dura;
  return a + Math.floor(sorte() * (b - a + 1));
}

/* ============================================================
   A ESCOLHA DO ASSUNTO

   Acontece uma vez por onda, na semente, e daí em diante a onda inteira
   é sobre isso. As travas são as de sempre nesta casa: o que não cabe na
   cena não entra, o que acabou de sair não repete, e a FAMÍLIA também
   não — três brigas seguidas com nomes diferentes continuam sendo três
   brigas.

   `preferir` deixa o resto do sistema pedir um lado sem obrigar: o
   holofote pede o pilar que está passando fome, e a família de cada
   assunto sabe a que pilar serve.
   ============================================================ */
export function escolherAssunto(sit = {}, { sorte = Math.random, compasso = null, preferir = null } = {}) {
  const c = garantirCompasso(compasso);
  const recentes = new Set(c.usados.slice(-NAO_REPETIR_ASSUNTO));
  const famRecentes = new Set(c.familias.slice(-NAO_REPETIR_FAMILIA));

  let abertos = ASSUNTOS.filter((a) => {
    try { if (a.quando && !a.quando(sit)) return false; } catch { return false; }
    /* a mesma trava de memória do Bibliotecário: um assunto que exige
       histórico e o encontra vazio manda a IA inventar a lembrança */
    if (a.precisa === "gente" && !sit.temGenteConhecida) return false;
    if (a.precisa === "lugar" && !sit.temLugarVisitado) return false;
    if (a.precisa === "passado" && !sit.temPassado) return false;
    return true;
  });
  if (!abertos.length) return null;

  const frescos = abertos.filter((a) => !recentes.has(a.id));
  if (frescos.length) abertos = frescos;
  const outraFamilia = abertos.filter((a) => !famRecentes.has(a.familia));
  if (outraFamilia.length) abertos = outraFamilia;

  const peso = (a) => {
    const f = familiaPorId(a.familia);
    return Math.max(1, a.peso || 1) * (preferir && f && f.pilar === preferir ? 2 : 1);
  };
  const total = abertos.reduce((n, a) => n + peso(a), 0);
  let corte = sorte() * total;
  return abertos.find((a) => (corte -= peso(a)) <= 0) || abertos[0];
}

/* ============================================================
   O AVANÇO

   Um turno de cada vez, e a onda anda sozinha. Devolve o que MUDOU —
   nunca o estado inteiro —, porque quem chama precisa saber se tem
   envelope para mandar, e não redesenhar a curva.

   `segurar` existe para o resto do sistema poder dizer "agora não": no
   meio de uma luta, de uma masmorra ou de uma viagem, a onda espera. Não
   por delicadeza: um clímax de compasso disparando dentro de um combate
   que o jogador já está travando são duas cenas grandes no mesmo turno, e
   a segunda apaga a primeira.
   ============================================================ */
export function avancarCompasso(compasso, sit = {}, { sorte = Math.random, segurar = false, preferir = null } = {}) {
  const c = garantirCompasso(compasso);
  if (segurar) return { compasso: c, virou: false, porque: "a onda espera: já há cena grande em curso" };

  const turnos = c.turnos + 1;
  const mov = movimentoPorId(c.movimento);
  if (turnos < c.alvo) {
    return { compasso: { ...c, turnos }, virou: false, movimento: mov, porque: `${c.alvo - turnos} turno(s) para o próximo movimento` };
  }

  const prox = movimentoPorOrdem((mov.ordem + 1) % MOVIMENTOS.length);
  const voltou = prox.ordem === 0;
  let assunto = c.assunto;
  let usados = c.usados;
  let familias = c.familias;

  /* a SEMENTE é onde a onda ganha assunto. Se não houver nenhum aberto —
     uma cena que não comporta nada —, a onda fica no respiro mais um
     tempo em vez de germinar no vazio. */
  if (prox.id === "semente") {
    const a = escolherAssunto(sit, { sorte, compasso: c, preferir });
    if (!a) {
      return {
        compasso: { ...c, movimento: "respiro", turnos: 0, alvo: sortearDuracao(MOVIMENTOS[0], sorte) },
        virou: false, porque: "nenhum assunto cabe nesta cena: a onda respira mais um pouco",
      };
    }
    assunto = a.id;
    usados = [...c.usados, a.id].slice(-8);
    familias = [...c.familias, a.familia].slice(-4);
  }

  const novo = {
    ...c,
    movimento: prox.id,
    turnos: 0,
    alvo: sortearDuracao(prox, sorte),
    assunto: voltou ? "" : assunto,
    usados, familias,
    voltas: c.voltas + (voltou ? 1 : 0),
  };
  return { compasso: novo, virou: true, movimento: prox, de: mov, assunto: assuntoPorId(assunto), voltou };
}

/* ============================================================
   O QUE O MESTRE MANDA

   Um envelope por VIRADA, nunca por turno — e só nos movimentos que
   falam. O respiro é mudo de propósito: mandar "agora descanse" é o
   sistema atrapalhando exatamente o movimento que existe para ele calar.
   ============================================================ */
const TEXTO = {
  semente: (a) => `[PREPARAÇÃO — DECISÃO DO SISTEMA] ${a.preparo}
REGRA DESTE ENVELOPE (obrigatória): isto é PLANTIO, não acontecimento. Ponha o material na cena e siga com o que eu estava fazendo. NÃO comece a coisa, NÃO me avise que ela vem, NÃO faça ninguém prever nada e NÃO me dê a chance de resolvê-la agora — ela ainda não existe.`,
  subida: (a) => `[APERTA — DECISÃO DO SISTEMA] ${a.subindo}
REGRA DESTE ENVELOPE (obrigatória): use o material que você já plantou, sem material novo. Isto ainda NÃO é o desfecho: é a coisa ficando maior enquanto eu ainda posso agir contra. Deixe uma brecha para eu agir, e devolva a palavra para mim.`,
  vespera: (a) => `[A UM PASSO — DECISÃO DO SISTEMA] Está prestes a acontecer: ${a.nome}. ${a.vespera || "Tudo o que faltava já está no lugar."}
REGRA DESTE ENVELOPE (obrigatória, e esta é a mais importante do compasso): NÃO faça acontecer ainda. Dê-me UM turno em que dá para ver o que vem e escolher como encará-lo — onde eu me ponho, quem eu chamo, o que eu largo. Termine com a palavra comigo, sem pergunta.`,
  climax: (a) => `[AGORA — DECISÃO DO SISTEMA] ${a.agora}
REGRA DESTE ENVELOPE (obrigatória): aconteça com o que JÁ está na mesa — a gente, o lugar e as peças que você plantou nas últimas cenas. Se você precisar inventar alguma coisa nova aqui, use o que plantou em vez disso. NÃO resolva por mim: mostre acontecendo e devolva a palavra. Se virar luta, quem abre o combate é o sistema.`,
  preco: (a) => `[O QUE FICOU — DECISÃO DO SISTEMA] ${a.depois}
REGRA DESTE ENVELOPE (obrigatória): não existe "e tudo voltou ao normal". Mostre uma consequência CONCRETA em duas ou três frases — em coisa, em gente ou em rotina. NÃO cobre PV, moeda nem item: quem mexe na ficha é o sistema. E NÃO abra a próxima ameaça: este é o fim de uma respiração, não o começo da outra.`,
};

export function envelopeDoCompasso(r) {
  if (!r || !r.virou || !r.movimento || !r.movimento.fala) return "";
  const a = r.assunto;
  if (!a) return "";
  const f = TEXTO[r.movimento.id];
  return f ? f(a) : "";
}

/* O jogador não vê nada disto. O compasso é bastidor puro: saber que se
   está na "véspera" é saber que o clímax vem no turno seguinte, e isso
   apaga a única coisa que a véspera existe para dar. */
export function linhaDoCompasso() { return ""; }

/* ---------------- PARA O CONSOLE DE AUTOR ----------------
   Sem nome de assunto e sem nome de movimento: a mesma régua do arco na
   v9.84. O autor vê a FORMA da onda, que é o que ele precisa para saber
   se o compasso está andando, e não o conteúdo dela. */
export function barraDoCompasso(c) {
  const cc = garantirCompasso(c);
  const i = movimentoPorId(cc.movimento).ordem;
  return MOVIMENTOS.map((m, k) => (k === i ? "◆" : k < i ? "·" : "○")).join("") + ` ${cc.turnos + 1}/${cc.alvo}`;
}

/* ============================================================
   O QUE SOBE AO PROMPT EM TODO TURNO

   Uma linha, e ela não diz o movimento nem o assunto: diz só a TENSÃO,
   que é o que a IA precisa para escolher o tamanho da própria voz. Uma
   IA que sabe que está na véspera escreve véspera; uma que sabe que a
   tensão é 3 de 4 escreve uma cena tensa, que é o que se queria.
   ============================================================ */
export const TOM_DA_TENSAO = [
  "a cena está tranquila: nada em jogo, e é para não haver",
  "há alguma coisa se formando ao fundo, e ninguém deu por ela",
  "a coisa aperta, e dá para agir contra",
  "está a um passo de acontecer",
  "está acontecendo",
];

export function resumoCompasso(c) {
  const cc = garantirCompasso(c);
  const m = movimentoPorId(cc.movimento);
  return `RITMO DESTA CENA (o sistema conduz o compasso; você narra dentro dele): ${TOM_DA_TENSAO[Math.min(TOM_DA_TENSAO.length - 1, m.tensao)]}. Escreva no tamanho disso — NUNCA diga ao jogador em que ponto do ritmo ele está, e NUNCA antecipe o que vem.`;
}
