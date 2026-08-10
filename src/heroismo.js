/* ============================================================
   PONTOS DE HEROÍSMO (v9.16) — a moeda que o jogador gasta na FICÇÃO

   Toda mesa moderna tem uma: inspiração, ponto de destino, benny,
   momentum. Um recurso pequeno, guardado no canto da ficha, que o
   jogador gasta para dizer "não, dessa vez eu consigo". A Taverna
   não tinha nenhuma — e a falta pesa duas vezes aqui.

   A primeira é a de sempre: sem metamoeda, o jogador nunca decide
   nada FORA do turno dele. Ele age, o dado cai, ele lê o resultado.
   Um ponto de heroísmo é a única alavanca que transforma um azar em
   escolha — "eu podia ter aceitado, e escolhi não aceitar".

   A segunda é da casa. Aqui quem narra é uma IA, e o jogador não
   tem como discordar dela: se o Mestre decide que o beco não tem
   saída, não tem saída. Numa mesa de gente você diria "posso ter um
   pedaço de corda na mochila?" e o mestre pensaria. É isso que o
   gasto DECLARAR devolve: um canal legítimo, com preço, para o
   jogador estabelecer um fato pequeno — e um envelope que obriga o
   Mestre a aceitar. Sem ele, discordar da narrativa só existe na
   forma feia: brigar com o Mestre no campo de texto.

   COMO SE GANHA. Só por coisa que o sistema enxerga sozinho — nada
   de "o mestre te dá quando você interpreta bem", que aqui viraria
   a IA se autoavaliando. Quatro fontes, todas deterministas:
   falha crítica, sobreviver a uma queda a 0 PV, concluir uma
   missão, e subir de nível. Mais o piso do descanso longo: acordar
   sem nenhum ponto é acordar sem nenhuma chance.

   O TETO É 3, e é de propósito baixo. Recurso que acumula deixa de
   ser decisão e vira estoque; com teto 3 o jogador gasta, porque
   guardar o quarto ponto é perdê-lo.
   ============================================================ */

export const HEROISMO_MAX = 3;

/* ---------------- O QUE SE PODE FAZER COM ELE ----------------
   Quatro gastos. Três mexem no dado, um mexe no mundo — e é o
   último que justifica o sistema existir. */
export const GASTOS = [
  {
    id: "refazer", custo: 1, icone: "🎲", rotulo: "Refazer",
    desc: "rola o dado de novo e fica com o segundo resultado, seja ele qual for",
    quando: "depois de ver a rolagem",
  },
  {
    id: "vantagem", custo: 1, icone: "✦", rotulo: "Vantagem",
    desc: "rola dois dados e fica com o maior",
    quando: "antes de rolar",
  },
  {
    id: "aguentar", custo: 1, icone: "🛡", rotulo: "Aguentar",
    desc: "o golpe que acabou de te acertar causa metade do dano",
    quando: "logo depois de levar dano",
  },
  {
    id: "declarar", custo: 2, icone: "📜", rotulo: "Declarar",
    desc: "você estabelece um detalhe pequeno da cena e o Mestre é obrigado a aceitar",
    quando: "a qualquer momento fora de combate",
  },
];
export function gastoPorId(id) { return GASTOS.find((g) => g.id === id) || null; }

/* ---------------- COMO SE GANHA ----------------
   Cada fonte tem um motivo escrito. O motivo vai para a tela: um
   recurso que aparece sem explicação é um recurso que o jogador não
   entende e por isso não gasta. */
export const FONTES = {
  desastre: { pontos: 1, texto: "falha crítica — o destino fica te devendo" },
  sobreviveu: { pontos: 1, texto: "você caiu e voltou — isso marca" },
  missao: { pontos: 1, texto: "missão concluída" },
  nivel: { pontos: 1, texto: "novo nível" },
  descanso: { pontos: 1, texto: "descanso longo — ninguém acorda sem nenhuma chance" },
};

export function garantirHeroismo(pers) {
  const n = Number((pers && pers.heroismo) || 0);
  return Math.max(0, Math.min(HEROISMO_MAX, Math.floor(n) || 0));
}

/* Devolve { pers, msg } — msg vazio quando não houve ganho (teto batido).
   O descanso é PISO, não soma: quem chega com 3 não vira 4, e quem chega
   com 0 acorda com 1. Somar aqui faria do acampamento uma fábrica. */
export function ganharHeroismo(pers, fonteId) {
  const f = FONTES[fonteId];
  if (!f) return { pers, msg: "" };
  const atual = garantirHeroismo(pers);
  const novo = fonteId === "descanso"
    ? Math.max(atual, f.pontos)
    : Math.min(HEROISMO_MAX, atual + f.pontos);
  if (novo === atual) return { pers, msg: "" };
  return {
    pers: { ...pers, heroismo: novo },
    msg: `✧ +${novo - atual} ponto de heroísmo (${f.texto}) — você tem ${novo}/${HEROISMO_MAX}.`,
  };
}

export function podeGastar(pers, gastoId) {
  const g = gastoPorId(gastoId);
  return !!g && garantirHeroismo(pers) >= g.custo;
}

export function gastarHeroismo(pers, gastoId) {
  const g = gastoPorId(gastoId);
  if (!g) return { ok: false, pers, motivo: "gasto desconhecido" };
  const atual = garantirHeroismo(pers);
  if (atual < g.custo) return { ok: false, pers, motivo: `custa ${g.custo}, você tem ${atual}` };
  return { ok: true, pers: { ...pers, heroismo: atual - g.custo }, gasto: g, restam: atual - g.custo };
}

/* ---------------- DECLARAR UM DETALHE ----------------
   O gasto que mexe no mundo, e por isso o único com regra de
   tamanho. O limite não é moral, é de projeto: um detalhe que
   resolve a cena não é um detalhe, é o jogador se dando o que quis
   — e aí o sistema inteiro perde a graça. Duas moedas e um teto
   estreito fazem disso uma ferramenta, não uma chave-mestra. */
const PROIBIDO = /(mat[ao]|morre|morto|derrot|vence|derruba|aniquil|destr[óo]i|explode|encontro (o|a) (chefe|artefato)|acho (o|a) (tesouro|artefato|chave mestra)|ganho|recebo \d|ele se rende|todos se rendem|ninguem me v[êe]|sou invis[íi]vel|teleport|reviv|ressuscit|acorda vivo)/i;

export function validarDeclaracao(texto) {
  const t = String(texto || "").trim();
  if (t.length < 8) return { ok: false, motivo: "diga o detalhe com um pouco mais de palavras" };
  if (t.length > 220) return { ok: false, motivo: "detalhe demais — isto é um pequeno fato, não uma cena inteira" };
  if (PROIBIDO.test(t)) return { ok: false, motivo: "isso resolve a cena em vez de colorir: declare uma coisa que EXISTE, não uma coisa que ACONTECE a seu favor" };
  return { ok: true, texto: t };
}

export function envelopeDeclaracao(texto) {
  return `[DECLARAÇÃO DO JOGADOR — PAGA COM PONTO DE HEROÍSMO, OBRIGATÓRIA] Gastei 2 pontos de heroísmo para estabelecer um detalhe desta cena: "${texto}".

REGRA DESTE ENVELOPE: isto agora é VERDADE no mundo, tão firme quanto qualquer coisa do cânone. Você NÃO nega, NÃO ironiza, NÃO "descobre" que na verdade era outra coisa e NÃO cobra um teste por isso — foi pago. Incorpore o detalhe à cena com naturalidade, como se sempre tivesse estado lá, e siga narrando. Ele é pequeno de propósito: não resolve o problema em curso, só muda o terreno. Se ele abrir uma possibilidade, deixe que EU a use — não a use por mim.`;
}

/* ---------------- REFAZER ----------------
   O segundo resultado vale, mesmo se for pior. É o que faz o gasto
   ser uma aposta e não um botão de desfazer — sem risco, refazer
   deixaria de ser decisão e o dado deixaria de importar. */
export function envelopeRefazer({ rotulo, primeiro, segundo, mod, dc }) {
  return `[PONTO DE HEROÍSMO — REFIZ A ROLAGEM] Gastei um ponto para rolar de novo o teste de ${rotulo}. O primeiro dado deu ${primeiro}; o segundo, que é o que vale, deu ${segundo}${mod ? ` (${segundo} ${mod >= 0 ? "+" : "−"} ${Math.abs(mod)} = ${segundo + mod})` : ""}${dc != null ? ` contra dificuldade ${dc}` : ""}. Narre o resultado do SEGUNDO dado. Não mencione sistema, ponto nem rolagem: mostre o esforço extra — o segundo fôlego, a mão que insiste, a decisão de não aceitar o primeiro resultado.`;
}

/* ---------------- O QUE O MESTRE PRECISA SABER ----------------
   Pouco, porque o recurso é do JOGADOR e não do Mestre. Ele só
   precisa não estranhar quando um envelope chegar. */
export function resumoHeroismoPrompt(pers) {
  const n = garantirHeroismo(pers);
  if (!n) return "";
  return `PONTOS DE HEROÍSMO: ${n}/${HEROISMO_MAX}. É recurso MEU, gasto por mim pelo sistema — você nunca concede, nunca tira, nunca sugere que eu gaste e nunca comenta o saldo.`;
}

export const HEROISMO_PROMPT = `PONTOS DE HEROÍSMO (v9.16):
- O jogador tem uma pequena reserva de pontos que ele gasta pelo SISTEMA, nunca por você. Você não dá, não retira, não sugere o gasto e não menciona o saldo na narrativa.
- Quando um gasto acontece, chega um envelope. Cumpra-o ao pé da letra e narre o efeito como ficção pura: um segundo fôlego, um detalhe que sempre esteve ali, um golpe que pegou de raspão. Nunca diga "você usou um ponto".
- A DECLARAÇÃO é o caso mais importante: o jogador pagou para estabelecer um pequeno fato da cena. Esse fato passa a ser verdade e você o trata como cânone — sem negar, sem ironizar, sem pedir teste e sem desfazer depois.`;
