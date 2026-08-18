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
  /* `tipoForcado` existe porque a regra que pergunta SABE de que espécie é a
     pergunta dela, e adivinhar pelo texto erraria: "alguém ouviu o barulho?"
     não tem nenhuma palavra da tabela de perigo, cairia em "mundo" e viraria
     fato PERMANENTE — o corredor ficaria vazio para o resto da campanha. */
  const tipo = (ctx.tipoForcado && TIPOS[ctx.tipoForcado]) ? ctx.tipoForcado : tipoDaPergunta(pergunta);
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
  /* ---------------- O QUE A REGRA SABE (v9.62) ----------------
     Quando quem pergunta é uma REGRA e não o jogador, ela chega sabendo
     coisas que o oráculo não tem como saber sozinho: que este prédio é uma
     taverna cheia às nove da noite, que a porta dá para um beco, que o
     herói está sozinho num corredor de cripta. Cada ajuste vem com o seu
     motivo porque a lista vai para a tela — número sem causa é dado
     disfarçado de sistema, e isso vale igual para as perguntas que o
     sistema faz a si mesmo. */
  for (const a of (Array.isArray(ctx.ajustes) ? ctx.ajustes : [])) {
    if (a && Number.isFinite(Number(a.delta))) mexer(Math.round(Number(a.delta)), String(a.motivo || "o que a cena já era"));
  }

  c = Math.max(5, Math.min(95, Math.round(c)));
  return { chance: c, tipo, porque: por, faixa: faixaPorChance(c) };
}

/* ---------------- A CONSULTA ----------------
   Um d100 contra a chance decide o lado; a MARGEM decide o grau. Perto
   do limiar sai "sim, mas" ou "não, mas" — que é onde a ficção fica boa.
   Longe, sai limpo. Nos extremos (5% de cada ponta), o mundo se mexe. */
export function consultar(pergunta, ctx = {}, { sorte = Math.random, fatos = null } = {}) {
  const { chance, tipo, porque, faixa } = calcularChance(pergunta, ctx);
  /* ---------------- O MUNDO NÃO PISCA (v9.61) ----------------
     Antes de rolar, olha o que já foi respondido. Uma pergunta que já
     tem resposta não é uma pergunta: é um fato, e fato se consulta.
     Sem isto, o oráculo respondendo várias vezes por turno faria a
     realidade mudar de forma a cada consulta. */
  if (fatos) {
    const chave = chaveDoFato(pergunta, ctx.lugar);
    const antes = garantirFatos(fatos)[chave];
    if (fatoValido(antes, { dia: ctx.dia, cena: ctx.cena })) {
      return {
        pergunta: String(pergunta || "").trim(), chance, tipo, porque, faixa,
        rolo: 0, sim: /^sim/.test(antes.grau), grau: grauPorId(antes.grau),
        reusado: true, chave,
      };
    }
  }
  const rolo = d(100, sorte);
  const sim = rolo <= chance;
  const margem = Math.abs(rolo - chance);
  let grau;
  if (sim) grau = rolo <= 5 ? "sim_e" : margem <= 20 ? "sim_mas" : "sim";
  else grau = rolo >= 96 ? "nao_e" : margem <= 20 ? "nao_mas" : "nao";
  return { pergunta: String(pergunta || "").trim(), chance, tipo, porque, faixa, rolo, sim, grau: grauPorId(grau), reusado: false, chave: chaveDoFato(pergunta, ctx.lugar) };
}

/* ---------------- O ENVELOPE ----------------
   O ponto inteiro: o Mestre recebe a resposta PRONTA e a instrução de
   não a contradizer. Ele decide COMO aquilo é verdade, nunca SE. */
export function envelopeDoOraculo(r) {
  if (r.reusado) {
    return `[PERGUNTA AO MUNDO — JÁ RESPONDIDA] Eu perguntei: "${r.pergunta}", e o mundo JÁ tinha respondido isto antes: ${r.grau.rotulo.toUpperCase()}

REGRA DESTE ENVELOPE (obrigatória): não houve rolagem nova porque não havia o que decidir — isto já é fato estabelecido, e continua exatamente como era. ${r.grau.guia} Se eu já vi esta verdade em cena, trate como coisa sabida, sem redescobri-la com espanto. NÃO mude a resposta, NÃO a suavize e NÃO mencione oráculo, chance, dado ou sistema.`;
  }
  return `[PERGUNTA AO MUNDO — RESPONDIDA PELO SISTEMA] Eu perguntei: "${r.pergunta}". O sistema pesou o que sabe do mundo (chance ${r.chance}% — ${r.faixa.rotulo}) e rolou: ${r.rolo}. A resposta é: ${r.grau.rotulo.toUpperCase()}

REGRA DESTE ENVELOPE (obrigatória): esta resposta é FATO do mundo, não sugestão. ${r.grau.guia} Você decide COMO isso é verdade — quem, por quê, com que cara — mas nunca SE. Não inverta, não amenize, não transforme em "talvez", e não mencione oráculo, chance, dado ou sistema. Responda em duas ou três frases e devolva a palavra para mim.`;
}

export function linhaDaConsulta(r) {
  if (r.reusado) return `🔮 "${r.pergunta}" — o mundo já respondeu isto: ${r.grau.rotulo}`;
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

/* ============================================================
   O LIVRO DE FATOS (v9.61)

   O problema que aparece no primeiro dia em que o oráculo decide de
   verdade: ele ROLA. Pergunte "há uma saída pelos fundos?" duas vezes
   e o mundo pisca — duas respostas, dois prédios diferentes, e o
   jogador aprende que a realidade aqui é uma máquina caça-níqueis.

   Um oráculo sem memória torna o mundo MENOS coerente, não mais. É o
   mesmo defeito que o livro de tentativas consertou nos testes, e a
   solução é a mesma: resposta dada vira FATO, e fato se consulta em
   vez de se rolar.

   QUANTO TEMPO UM FATO DURA depende do que ele é, e o tipo da
   pergunta já diz:

     mundo   — a forma das coisas. A saída pelos fundos existe ou não
               existe; isso não muda porque o dia virou. PERMANENTE.
     social  — a disposição de alguém. Muda com o que acontece entre
               vocês, então vale pelo DIA.
     perigo  — onde está a patrulha, quem está olhando agora. É do
               instante: vale pela CENA.

   Sem essa graduação, ou o mundo congela (tudo permanente) ou volta a
   piscar (tudo efêmero). ============================================ */

const semAcento = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
/* palavras que não distinguem uma pergunta de outra — tirá-las faz
   "tem uma saída pelos fundos?" e "há saída pelos fundos?" serem a
   MESMA pergunta, que é o ponto inteiro do livro */
const VAZIAS = new Set(["sera", "que", "por", "acaso", "tem", "ha", "existe", "algum", "alguma", "um", "uma", "o", "a", "os", "as", "de", "do", "da", "dos", "das", "em", "no", "na", "e", "ou", "esse", "essa", "isso", "aqui", "ali", "para", "pra", "com", "se", "eu", "consigo", "posso", "da", "dar", "vale", "esta", "estao"]);

export function chaveDoFato(pergunta, lugar = "") {
  const nucleo = semAcento(pergunta)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((p) => p.length > 2 && !VAZIAS.has(p))
    .sort()
    .join("-");
  return `${semAcento(lugar) || "mundo"}|${nucleo}`;
}

export const DURACOES = {
  mundo: { id: "permanente", diz: "a forma das coisas não muda porque o dia virou" },
  social: { id: "dia", diz: "a disposição de alguém muda com o que acontece entre vocês" },
  perigo: { id: "cena", diz: "onde está a patrulha agora é coisa do instante" },
};
export function duracaoDoTipo(tipo) { return DURACOES[tipo] || DURACOES.mundo; }

export function garantirFatos(f) {
  const o = f && typeof f === "object" ? f : {};
  const out = {};
  for (const [k, v] of Object.entries(o)) {
    if (!v || typeof v !== "object" || !v.grau) continue;
    out[k] = {
      grau: String(v.grau),
      tipo: String(v.tipo || "mundo"),
      duracao: String(v.duracao || "permanente"),
      dia: Number(v.dia) || 0,
      cena: Number(v.cena) || 0,
      pergunta: String(v.pergunta || "").slice(0, 160),
    };
  }
  return out;
}

/* Um fato ainda vale? Permanente sempre; do dia, enquanto for o dia;
   da cena, enquanto for a cena. */
export function fatoValido(fato, { dia = 0, cena = 0 } = {}) {
  if (!fato) return false;
  if (fato.duracao === "permanente") return true;
  if (fato.duracao === "dia") return Number(fato.dia) === Number(dia);
  return Number(fato.cena) === Number(cena);
}

export function registrarFato(fatos, chave, r, { dia = 0, cena = 0 } = {}) {
  const base = garantirFatos(fatos);
  const dur = duracaoDoTipo(r.tipo).id;
  return { ...base, [chave]: { grau: r.grau.id, tipo: r.tipo, duracao: dur, dia, cena, pergunta: r.pergunta } };
}

/* ============================================================
   AS PERGUNTAS QUE O SISTEMA FAZ A SI MESMO (v9.62)

   Ontem eu escrevi este envelope, e ele estava errado:

     "Se houver alguém por perto — dono, guarda, morador —, ELE OUVIU.
      Isto é seu para narrar."

   É o sistema pedindo à IA que decida um FATO DO MUNDO. E é o pior
   lugar para pedir: a IA decide olhando a cena que ela quer contar, e
   por isso a resposta é sempre a conveniente — arrombar acorda a casa
   quando a história precisa de tensão, e não acorda ninguém quando ela
   não precisa. O barulho deixa de ser consequência e vira tempero.

   O oráculo existe exatamente para responder isso, e a diferença é
   que ele responde ANTES de saber que cena vem depois.

   O QUE MUDA NA PRÁTICA: a regra para de delegar. Ela pergunta, o
   oráculo responde com o que o código sabe do lugar e da hora, a
   resposta vira fato no livro, e o Mestre recebe pronto: "ninguém
   ouviu" ou "alguém ouviu, e é isto que ele faz agora".

   E o oráculo não sabe sozinho se aqui é uma taverna cheia às nove da
   noite ou um corredor de cripta — quem sabe é a regra que pergunta.
   Por isso ela manda AJUSTES junto, cada um com o seu motivo.
   ============================================================ */
export const PERGUNTAS_DO_SISTEMA = [
  {
    id: "ouviram",
    tipo: "perigo",
    pergunta: (c) => `alguém ouviu o barulho${c.onde ? ` ${c.onde}` : ""}?`,
    /* a régua: quanta gente há ao alcance do ouvido, e o quanto a hora
       ajuda a esconder. Nada disso é sorteado — sai do lugar e do relógio. */
    ajustes: (c) => {
      const a = [];
      const mov = Number(c.movimento);
      if (Number.isFinite(mov)) {
        if (mov >= 3) a.push({ delta: 25, motivo: "este lugar está cheio de gente" });
        else if (mov === 2) a.push({ delta: 12, motivo: "há movimento por aqui" });
        else if (mov === 1) a.push({ delta: -5, motivo: "há pouca gente por perto" });
        else a.push({ delta: -25, motivo: "não há vivalma por perto" });
      }
      if (c.noite) a.push({ delta: -10, motivo: "é noite e quase todos dormem" });
      if (c.dentroDeUmPredio) a.push({ delta: 10, motivo: "paredes de prédio devolvem o som para dentro" });
      if (c.emMasmorra) a.push({ delta: -12, motivo: "aqui embaixo não há quem ouça — ou não deveria haver" });
      return a;
    },
    /* o que o Mestre faz com cada lado da resposta */
    seSim: "alguém ouviu, e vem ver, ou já sabe. Mostre quem — dono, guarda, morador, o que dorme no andar de baixo — e o que essa pessoa faz AGORA. Não resolva a consequência inteira: mostre-a chegando.",
    seNao: "ninguém ouviu. Diga isso pela cena, em uma frase — o corredor vazio, a casa que não acorda — e siga. NÃO invente uma testemunha depois.",
  },
  {
    id: "viram",
    tipo: "perigo",
    pergunta: (c) => `alguém viu${c.onde ? ` ${c.onde}` : ""}?`,
    ajustes: (c) => {
      const a = [];
      const mov = Number(c.movimento);
      if (Number.isFinite(mov)) a.push(mov >= 2 ? { delta: 20, motivo: "há olhos por toda parte aqui" } : { delta: -15, motivo: "há pouca gente para ver" });
      if (c.noite) a.push({ delta: -15, motivo: "no escuro se vê pouco" });
      return a;
    },
    seSim: "alguém viu. Mostre quem, e o que essa pessoa faz com o que viu — falar, calar, cobrar, seguir.",
    seNao: "ninguém viu. O gesto passou despercebido; diga isso em uma frase e siga, sem plantar uma testemunha depois.",
  },
  {
    id: "vigiado",
    tipo: "perigo",
    pergunta: (c) => `este lugar está sendo vigiado${c.onde ? ` ${c.onde}` : ""}?`,
    ajustes: (c) => {
      const a = [];
      if (c.valioso) a.push({ delta: 20, motivo: "o que se guarda aqui vale a pena vigiar" });
      if (c.noite) a.push({ delta: 8, motivo: "é de noite que se põe vigia" });
      if (c.emCidade) a.push({ delta: 6, motivo: "cidade tem guarda" });
      return a;
    },
    seSim: "há vigia. Mostre onde e como — não como emboscada pronta, mas como um problema visível a tempo de ser resolvido.",
    seNao: "não há vigia nenhuma. Não invente uma para dar tensão à cena.",
  },
];

export function perguntaDoSistemaPorId(id) { return PERGUNTAS_DO_SISTEMA.find((p) => p.id === id) || null; }

/* A regra pergunta; o oráculo responde. Mesma máquina da pergunta do
   jogador — mesma chance derivada, mesmo livro de fatos, mesmos seis
   graus —, só que o texto da pergunta é canônico, para que duas regras
   perguntando a mesma coisa no mesmo lugar recebam a MESMA resposta. */
export function perguntarPeloSistema(id, ctx = {}, { sorte = Math.random, fatos = null } = {}) {
  const q = perguntaDoSistemaPorId(id);
  if (!q) return null;
  const texto = q.pergunta(ctx);
  let ajustes = [];
  try { ajustes = q.ajustes(ctx) || []; } catch { ajustes = []; }
  const r = consultar(texto, { ...ctx, ajustes, tipoForcado: q.tipo }, { sorte, fatos });
  return { ...r, deQuem: id, seSim: q.seSim, seNao: q.seNao };
}

export function envelopeDaPerguntaDoSistema(r, { oQue = "o que eu fiz" } = {}) {
  if (!r) return "";
  const passou = /^sim/.test(r.grau.id);
  const conta = r.reusado ? "o mundo já tinha respondido isto" : `chance ${r.chance}% — ${r.faixa.rotulo}, rolou ${r.rolo}`;
  return `[O MUNDO RESPONDE — PERGUNTADO PELO PRÓPRIO SISTEMA] ${oQue}. O sistema perguntou ao mundo: "${r.pergunta}" (${conta}). A resposta é ${r.grau.rotulo.toUpperCase()}.
REGRA DESTE ENVELOPE (obrigatória): isto é FATO, decidido antes de você saber que cena viria. ${passou ? r.seSim : r.seNao} ${r.grau.guia}
Não inverta, não amenize, não deixe ambíguo e não mencione oráculo, chance, dado nem sistema.`;
}

export function linhaDaPerguntaDoSistema(r) {
  if (!r) return "";
  return `🔮 ${r.pergunta} — ${r.reusado ? "já respondido" : `${r.chance}%, rolou ${r.rolo}`}: ${r.grau.rotulo}`;
}

/* ============================================================
   A INICIATIVA DO MUNDO (v9.61)

   "Ele identifica situações e toma decisões, e a genialidade da IA
   cria a história para aquela situação."

   O mundo passa a se mexer sem ser perguntado. E com UMA TRAVA, que é
   o que separa isto de um gerador de acontecimentos aleatórios: ele
   só pode puxar FIO QUE JÁ EXISTE. Um relógio que está quase cheio,
   um nome do cânone com uma vontade pendente, uma facção em guerra,
   uma missão com prazo correndo, a nêmese.

   Ele nunca inventa uma trama nova — inventar é da IA, e é a única
   coisa que ela faz melhor que qualquer código. O que o sistema faz
   é ESCOLHER qual fio puxar e quando, que é a decisão que a IA fazia
   mal: ela puxava o fio mais conveniente para a cena que já tinha na
   cabeça, e por isso o mundo nunca cobrava nada.

   RITMO, e ele é conservador de propósito: a maior parte dos turnos
   não tem iniciativa nenhuma. Um mundo que interrompe toda hora não
   é vivo, é barulhento — e o jogador perde a própria cena.
   ============================================================ */
export const MOVIMENTOS_DO_MUNDO = [
  {
    id: "relogio", peso: 5,
    quando: (c) => !!(c.relogioQuaseCheio && c.relogioQuaseCheio.nome),
    fio: (c) => c.relogioQuaseCheio.nome,
    diz: "algo que já estava se fechando dá mais um passo",
  },
  {
    id: "nemesis", peso: 4,
    quando: (c) => !!c.nemesis,
    fio: (c) => c.nemesis,
    diz: "quem tem contas com você se mexe",
  },
  {
    id: "prazo", peso: 4,
    quando: (c) => !!(c.missaoComPrazo && c.missaoComPrazo.titulo),
    fio: (c) => c.missaoComPrazo.titulo,
    diz: "o prazo aperta e alguém cobra",
  },
  {
    id: "faccao", peso: 3,
    quando: (c) => !!c.faccaoHostil,
    fio: (c) => c.faccaoHostil,
    diz: "quem está em guerra com você age onde você está",
  },
  {
    id: "gente", peso: 3,
    quando: (c) => !!(c.npcComVontade && c.npcComVontade.nome),
    fio: (c) => `${c.npcComVontade.nome} (${c.npcComVontade.vontade || "tem um assunto pendente"})`,
    diz: "alguém desta cidade avança a própria vontade",
  },
  {
    id: "boato", peso: 2,
    quando: (c) => !!c.emCidade,
    fio: () => "o que já se comenta por aqui",
    diz: "a notícia de algo que já aconteceu chega até você",
  },
];

/* Com que frequência o mundo se mexe. Cadência larga, e mais larga
   ainda quando o jogador está no meio de outra coisa — interromper
   uma luta ou uma masmorra com um boato é roubar a cena dele. */
export const RITMO_DO_MUNDO = { cada: 6, chance: 45 };

export function podeIniciativa(ctx = {}) {
  if (ctx.emCombate || ctx.emMasmorra || ctx.emViagem) return false;
  if (ctx.desdeUltima != null && Number(ctx.desdeUltima) < RITMO_DO_MUNDO.cada) return false;
  return true;
}

export function iniciativaDoMundo(ctx = {}, { sorte = Math.random } = {}) {
  if (!podeIniciativa(ctx)) return null;
  if (d(100, sorte) > RITMO_DO_MUNDO.chance) return null;
  const abertos = MOVIMENTOS_DO_MUNDO.filter((m) => { try { return !!m.quando(ctx); } catch { return false; } });
  if (!abertos.length) return null;
  /* sorteio por peso: o relógio quase cheio pesa mais que um boato,
     porque ele é o fio que o próprio jogo já disse que ia estourar */
  const total = abertos.reduce((n, m) => n + m.peso, 0);
  let corte = sorte() * total;
  const m = abertos.find((x) => (corte -= x.peso) <= 0) || abertos[0];
  let fio = "";
  try { fio = String(m.fio(ctx) || ""); } catch { fio = ""; }
  return { id: m.id, diz: m.diz, fio };
}

export function envelopeDaIniciativa(mv) {
  if (!mv) return "";
  return `[O MUNDO SE MEXE — ESCOLHIDO PELO SISTEMA] Enquanto eu fazia o que fiz, ${mv.diz}: ${mv.fio}.
REGRA DESTE ENVELOPE (obrigatória): este fio JÁ EXISTE no jogo — o sistema o escolheu entre os que estão abertos, e não é sugestão. Traga-o à cena agora, em duas ou três frases, ENTRELAÇADO com o que eu acabei de fazer (não como parágrafo separado, não como "enquanto isso, em outro lugar").
NÃO invente uma trama nova, NÃO abra um segundo fio, NÃO resolva este aqui e NÃO transforme isto num combate por conta própria. É uma pressão chegando, não um desfecho. Depois devolva a palavra para mim.`;
}

export function linhaDaIniciativa(mv) {
  return mv ? `🌍 O mundo se mexe: ${mv.diz}.` : "";
}

/* Duas linhas. A regra de cumprir o grau vai INTEIRA dentro de cada
   envelope do oráculo, junto do grau que ela governa — repeti-la aqui era
   pagar por ela em todo turno para usá-la em um a cada cinquenta. */
export const ORACULO_PROMPT = `PERGUNTAS AO MUNDO (v9.24):
- Pergunta FECHADA sobre algo que o mundo ainda não estabeleceu ("o guarda é subornável?", "tem saída pelos fundos?") é respondida pelo SISTEMA, não por você, e chega num envelope com um grau — de "não, e ainda por cima" a "sim, e ainda mais".
- Nunca antecipe a resposta, nunca a mencione como mecânica e nunca diga "o mundo decidiu": narre o fato como se sempre tivesse sido assim.`;
