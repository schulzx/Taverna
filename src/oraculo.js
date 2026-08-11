/* ============================================================
   O ORÁCULO (v9.24) — o sistema responde ao que ainda não existe

   Parece redundante num jogo onde uma IA narra: para que um oráculo
   de sim/não, se há um Mestre? É exatamente o contrário. Quando o
   jogador pergunta "o guarda é subornável?", hoje quem responde é o
   Mestre — de graça, na hora, do jeito que a cena pedir. E aí a
   resposta não é um fato do mundo: é uma conveniência.

   Este arquivo é a última fronteira do "o sistema faz, o mestre
   narra". O portão cuida do que CONTRADIZ o que já existe; o
   oráculo cuida do que AINDA NÃO EXISTE. São os dois lados da mesma
   regra, e sem o segundo o Mestre continua sendo dono de tudo que o
   sistema nunca escreveu — que é a maior parte do mundo.

   COMO A CHANCE É DERIVADA, e não sorteada. Uma pergunta não vale
   50% só porque tem duas respostas. O sistema conhece fama,
   patamar, hora, facção, exaustão, relógios em curso — e usa isso.
   Subornar um guarda numa cidade onde você é herói é diferente de
   subornar um guarda numa cidade em guerra com a sua facção, e o
   jogador MERECE que essa diferença apareça no número.

   E O "SIM, MAS". A resposta binária é pobre demais para ficção. As
   mesas resolveram isso com seis graus, do "não, e ainda por cima"
   ao "sim, e ainda mais" — e o miolo ("sim, mas" / "não, mas") é
   onde nasce quase toda cena interessante, porque obriga a história
   a andar de lado em vez de parar.
   ============================================================ */

const d = (n, sorte) => 1 + Math.floor(sorte() * n);

/* ---------------- OS SEIS GRAUS ----------------
   Ordenados do pior ao melhor. `peso` é o tamanho da fatia num d20
   quando a chance é média — os extremos são estreitos de propósito,
   porque "e ainda por cima" perde a graça se acontecer sempre. */
export const GRAUS = [
  { id: "nao_e", rotulo: "Não, e ainda por cima…", cor: "danger", extremo: true,
    guia: "A resposta é não, e o mundo aproveita para piorar a situação: acrescente uma complicação NOVA e concreta." },
  { id: "nao", rotulo: "Não.", cor: "danger",
    guia: "A resposta é não, seca. Não ofereça consolo, não abra uma porta lateral, não sugira o caminho alternativo — a negativa é a resposta inteira." },
  { id: "nao_mas", rotulo: "Não, mas…", cor: "danger",
    guia: "A resposta é não, e ainda assim alguma coisa sobra: uma informação, um tempo a mais, uma porta que não resolve mas ajuda." },
  { id: "sim_mas", rotulo: "Sim, mas…", cor: "ok",
    guia: "A resposta é sim, e vem com preço: custa tempo, dinheiro, barulho, uma dívida ou um risco. O preço é concreto e imediato." },
  { id: "sim", rotulo: "Sim.", cor: "ok",
    guia: "A resposta é sim, limpa. Não invente custo escondido nem reviravolta — às vezes a coisa simplesmente é." },
  { id: "sim_e", rotulo: "Sim, e ainda mais…", cor: "ok", extremo: true,
    guia: "A resposta é sim, e o mundo é generoso: acrescente um ganho a mais que o jogador não pediu." },
];
export function grauPorId(id) { return GRAUS.find((g) => g.id === id) || GRAUS[1]; }

/* ---------------- A CHANCE ----------------
   Base 50%, movida pelo que o sistema já sabe. Cada peça diz por que
   mexeu — a lista de motivos vai para a tela, porque um número sem
   causa é um dado disfarçado de sistema. */
export const FAIXAS = [
  { id: "quase_certo", rotulo: "quase certo", alvo: 85 },
  { id: "provavel", rotulo: "provável", alvo: 70 },
  { id: "duvidoso", rotulo: "no fio", alvo: 50 },
  { id: "improvavel", rotulo: "improvável", alvo: 30 },
  { id: "quase_impossivel", rotulo: "quase impossível", alvo: 15 },
];
export function faixaPorChance(c) {
  if (c >= 78) return FAIXAS[0];
  if (c >= 60) return FAIXAS[1];
  if (c >= 40) return FAIXAS[2];
  if (c >= 23) return FAIXAS[3];
  return FAIXAS[4];
}

/* Que tipo de pergunta é esta. O tipo decide QUAIS fatores pesam —
   fama não ajuda a saber se vai chover. */
export const TIPOS = {
  social: { id: "social", rx: /(suborn|convenc|acredit|aceit|ajuda|confia|deixa|permit|concord|perdo|recebe|atende|escuta|negoci|vende|empresta|contrata)/i },
  perigo: { id: "perigo", rx: /(perigo|armadilh|embosc|vigiad|guardad|trancad|alarme|patrulh|segue|persegu|not(a|ou)|percebe)/i },
  mundo: { id: "mundo", rx: /(existe|h[áa] |tem |fica|chove|amanhec|aberto|fechado|funciona|resta|sobrou|conhece|lembra)/i },
};
export function tipoDaPergunta(texto) {
  const t = String(texto || "");
  for (const k of ["social", "perigo", "mundo"]) if (TIPOS[k].rx.test(t)) return k;
  return "mundo";
}

export function calcularChance(pergunta, ctx = {}) {
  const tipo = tipoDaPergunta(pergunta);
  let c = 50;
  const por = [];
  const mexer = (delta, motivo) => { if (!delta) return; c += delta; por.push(`${delta > 0 ? "+" : ""}${delta} ${motivo}`); };

  if (tipo === "social") {
    const fama = Math.max(0, Math.min(100, Number(ctx.fama) || 0));
    mexer(Math.round((fama - 40) / 6), fama >= 40 ? "seu nome ajuda" : "ninguém sabe quem você é");
    if (ctx.emGuerra) mexer(-15, `${ctx.emGuerra} está em guerra com você`);
    if (ctx.dominaAqui) mexer(12, "este lugar é seu");
    if ((ctx.gd || 0) >= 3) mexer(10, "há algo de divino em você que as pessoas sentem");
  }
  if (tipo === "perigo") {
    if (ctx.noite) mexer(8, "é noite, e a noite esconde");
    if ((ctx.exaustao || 0) >= 2) mexer(-8, "você está exausto e desatento");
    if (ctx.emMasmorra) mexer(10, "masmorra é lugar de armadilha");
    const relogios = Math.max(0, Number(ctx.relogiosCheios) || 0);
    mexer(relogios * 7, "há coisas se fechando ao seu redor");
  }
  if (tipo === "mundo") {
    if (ctx.emCidade) mexer(8, "cidade tem de tudo");
    else mexer(-8, "aqui fora, quase nada");
  }
  /* o peso que o jogador escolheu: ele sabe o que a ficção já sugeriu */
  if (ctx.inclinacao === "provavel") mexer(20, "a cena já apontava para isso");
  if (ctx.inclinacao === "improvavel") mexer(-20, "a cena já apontava contra");

  c = Math.max(5, Math.min(95, Math.round(c)));
  return { chance: c, tipo, porque: por, faixa: faixaPorChance(c) };
}

/* ---------------- A CONSULTA ----------------
   Um d100 contra a chance decide o lado; a MARGEM decide o grau. Perto
   do limiar sai "sim, mas" ou "não, mas" — que é onde a ficção fica boa.
   Longe, sai limpo. Nos extremos (5% de cada ponta), o mundo se mexe. */
export function consultar(pergunta, ctx = {}, { sorte = Math.random } = {}) {
  const { chance, tipo, porque, faixa } = calcularChance(pergunta, ctx);
  const rolo = d(100, sorte);
  const sim = rolo <= chance;
  const margem = Math.abs(rolo - chance);
  let grau;
  if (sim) grau = rolo <= 5 ? "sim_e" : margem <= 20 ? "sim_mas" : "sim";
  else grau = rolo >= 96 ? "nao_e" : margem <= 20 ? "nao_mas" : "nao";
  return { pergunta: String(pergunta || "").trim(), chance, tipo, porque, faixa, rolo, sim, grau: grauPorId(grau) };
}

/* ---------------- O ENVELOPE ----------------
   O ponto inteiro: o Mestre recebe a resposta PRONTA e a instrução de
   não a contradizer. Ele decide COMO aquilo é verdade, nunca SE. */
export function envelopeDoOraculo(r) {
  return `[PERGUNTA AO MUNDO — RESPONDIDA PELO SISTEMA] Eu perguntei: "${r.pergunta}". O sistema pesou o que sabe do mundo (chance ${r.chance}% — ${r.faixa.rotulo}) e rolou: ${r.rolo}. A resposta é: ${r.grau.rotulo.toUpperCase()}

REGRA DESTE ENVELOPE (obrigatória): esta resposta é FATO do mundo, não sugestão. ${r.grau.guia} Você decide COMO isso é verdade — quem, por quê, com que cara — mas nunca SE. Não inverta, não amenize, não transforme em "talvez", e não mencione oráculo, chance, dado ou sistema. Responda em duas ou três frases e devolva a palavra para mim.`;
}

export function linhaDaConsulta(r) {
  return `🔮 "${r.pergunta}" — ${r.faixa.rotulo} (${r.chance}%), rolou ${r.rolo}: ${r.grau.rotulo}`;
}

/* ---------------- DETECTAR NO TEXTO ----------------
   O jeito de mesa: o jogador simplesmente pergunta. Só conta como
   consulta ao oráculo o que é pergunta FECHADA sobre o mundo — se ele
   está perguntando "o que eu vejo?", isso é teste de perícia, e o
   caminho daquilo já existe. */
const ABRE = /^\s*(sera que|será que|por acaso|o guarda|ele|ela|isso|isto|aquilo|tem|h[áa]|existe|d[áa] para|da para|consigo|posso|vale|est[áa]|e |é )/i;
const FECHADA = /\?\s*$/;
const ABERTA = /^\s*(o que|quem|onde|quando|como|por que|porque|quanto|qual)\b/i;

export function ehPerguntaAoMundo(texto) {
  const t = String(texto || "").trim();
  if (!t || t.length < 6 || t.length > 200) return false;
  if (!FECHADA.test(t)) return false;
  if (ABERTA.test(t)) return false;    // pergunta aberta é cena, não oráculo
  return ABRE.test(t) || /\?/.test(t);
}

export const ORACULO_PROMPT = `PERGUNTAS AO MUNDO (v9.24):
- Quando o jogador faz uma pergunta FECHADA sobre algo que o mundo ainda não estabeleceu ("o guarda é subornável?", "tem uma saída pelos fundos?"), quem responde é o SISTEMA, não você. A resposta chega num envelope com um grau — de "não, e ainda por cima" a "sim, e ainda mais".
- Cumpra o grau ao pé da letra. Você decide COMO aquilo é verdade; nunca SE. Não inverta, não amenize, não transforme em talvez, e não ofereça um caminho alternativo quando a resposta foi não.
- Nunca antecipe a resposta, nunca a mencione como mecânica, e nunca diga "o mundo decidiu" — narre o fato como sempre foi assim.`;
