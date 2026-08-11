/* ============================================================
   MORTE E LEGADO (v9.25) — o que acontece depois do último dado

   O jogo tinha testes de morte desde sempre: três falhas e o herói
   "tomba… mas enquanto houver esperança, a lenda não termina". Uma
   frase bonita para dizer que o sistema não sabia o que fazer. Na
   prática a campanha ficava num limbo — o personagem morto, o save
   aberto, e nada acontecendo.

   Isso é o pior dos dois mundos. Morte sem consequência ensina que
   o combate não importa; morte que apaga a campanha ensina que não
   vale a pena se arriscar. As mesas resolveram com duas saídas, e
   as duas custam:

   1) VOLTAR. Ressurreição existe, e ela cobra — em ouro, em fé, em
      uma cicatriz que não sara. O preço cresce a cada volta, porque
      a segunda vez tem que doer mais que a primeira, senão morrer
      vira taxa e não risco.

   2) O HERDEIRO. Alguém pega a espada e continua. Um personagem
      novo, no MESMO mundo, herdando o que a lenda construiu — as
      cidades dominadas, a guilda, o mapa aberto, a reputação do
      nome antigo. É a saída que o jogo solo mais precisa, porque
      preserva as dezenas de horas de mundo e devolve a tensão à
      ficha, que é onde ela deve estar.

   O QUE O HERDEIRO NÃO HERDA: nível, poderes, itens de poder e o
   grau divino. Herdar a ficha inteira seria o mesmo personagem com
   outro nome — e aí a morte não teria custado nada de novo.
   ============================================================ */

/* ---------------- O PREÇO DE VOLTAR ----------------
   Cresce com o nível (o mundo cobra mais caro por gente importante)
   e com o número de voltas anteriores. A terceira ressurreição é
   proibitiva de propósito: em algum ponto a resposta certa é o
   herdeiro. */
export function custoDeVoltar(pers) {
  const nivel = Math.max(1, (pers && pers.nivel) || 1);
  const voltas = Math.max(0, (pers && pers.voltas) || 0);
  const moedas = Math.round(120 * nivel * Math.pow(2.5, voltas));
  return {
    moedas,
    voltas,
    cicatriz: true,
    /* a partir da terceira, nem ouro resolve */
    possivel: voltas < 3,
    motivo: voltas >= 3 ? "o outro lado já te devolveu três vezes — não haverá uma quarta" : "",
  };
}

export const MAX_VOLTAS = 3;

/* Quem pode pagar. A fé serve de moeda para quem tem: um GD 2 volta
   por devoção, não por ouro — e isso faz o caminho divino significar
   alguma coisa numa hora em que significar importa. */
export function formasDeVoltar(pers, { moedas = 0, pf = 0, gd = 0, cofre = 0 } = {}) {
  const c = custoDeVoltar(pers);
  if (!c.possivel) return { possivel: false, motivo: c.motivo, opcoes: [] };
  const opcoes = [];
  if (moedas + cofre >= c.moedas) {
    opcoes.push({ id: "ouro", rotulo: `Pagar o preço em ouro`, custo: `◉ ${c.moedas}`, detalhe: "um templo, um necromante ou alguém pior — o mundo tem quem faça, por um preço" });
  }
  const custoPf = 20 + 20 * c.voltas;
  if (gd >= 1 && pf >= custoPf) {
    opcoes.push({ id: "fe", rotulo: "Voltar pela própria fé", custo: `${custoPf} PF`, detalhe: "seus fiéis rezam, e desta vez alguém escuta" });
  }
  return { possivel: opcoes.length > 0, opcoes, custoMoedas: c.moedas, motivo: opcoes.length ? "" : `voltar custa ◉ ${c.moedas} — você não tem` };
}

export const CICATRIZES_DA_MORTE = [
  { nome: "Olhos do Outro Lado", desc: "você viu o que há depois, e não consegue desver — desvantagem contra medo." },
  { nome: "Coração Devagar", desc: "o corpo voltou mais frio: −1 nos testes de Vigor." },
  { nome: "Voz Rachada", desc: "algo ficou preso na garganta: −1 nos testes de Presença." },
  { nome: "Sono Curto", desc: "você não descansa direito desde então: um dado de vida a menos." },
  { nome: "Marca do Ceifador", desc: "quem entende dessas coisas reconhece você de longe — e nem todos gostam." },
];

export function sortearCicatrizDaMorte(jaTem = [], { sorte = Math.random } = {}) {
  const pool = CICATRIZES_DA_MORTE.filter((c) => !jaTem.some((x) => (x.nome || x) === c.nome));
  const lista = pool.length ? pool : CICATRIZES_DA_MORTE;
  return lista[Math.floor(sorte() * lista.length)];
}

export function aplicarVolta(pers, { cicatriz } = {}) {
  const c = cicatriz || sortearCicatrizDaMorte(pers.cicatrizes || []);
  return {
    ...pers,
    morto: false, morrendo: false,
    morte: { sucessos: 0, falhas: 0 },
    vida: Math.max(1, Math.round((pers.vidaMax || 10) * 0.25)),
    voltas: Math.max(0, (pers.voltas || 0)) + 1,
    cicatrizes: [...(pers.cicatrizes || []), { nome: c.nome, descricao: c.desc, daMorte: true }],
  };
}

/* ---------------- O HERDEIRO ----------------
   O que atravessa é o MUNDO, não a ficha. O nível novo não é 1: é
   metade do que a lenda alcançou, com piso 3 — começar do zero num
   mundo de nível 20 não seria recomeço, seria suicídio. */
export function nivelDoHerdeiro(nivelAnterior) {
  return Math.max(3, Math.floor((Number(nivelAnterior) || 1) / 2));
}

export function heranca(pers, { mapa, guilda, faccaoJogador } = {}) {
  const nivel = nivelDoHerdeiro(pers && pers.nivel);
  const dominios = ((mapa && mapa.cidades) || []).filter((c) => c.faccao && c.faccao === faccaoJogador).length;
  return {
    nivel,
    moedas: Math.round(((pers && pers.moedas) || 0) * 0.3),
    /* o equipamento comum passa de mão; o que tinha poder foi enterrado
       junto, e isso é de propósito: o item lendário do herói morto é o
       tesouro que a PRÓXIMA aventura vai procurar. */
    equipamento: ((pers && pers.equipamento) || []).filter((i) => i && !String(i.poder || "").trim() && (i.raridade === "comum" || i.raridade === "incomum")),
    guardado: ((pers && pers.equipamento) || []).filter((i) => i && (String(i.poder || "").trim() || ["raro", "epico", "lendario"].includes(i.raridade))).map((i) => i.nome),
    dominios, guilda: !!guilda, faccao: faccaoJogador || "",
  };
}

export function envelopeDoHerdeiro(morto, novo, h) {
  return `[NOVO HERÓI — O MUNDO CONTINUA] ${morto} morreu, e a campanha não termina com ${morto === novo ? "ele" : "ela"}. Quem pega o fio agora é ${novo}, nível ${h.nivel}, no MESMO mundo: as mesmas cidades, o mesmo mapa, a mesma gente, as mesmas dívidas.

REGRA DESTE ENVELOPE: o mundo NÃO foi reiniciado. ${h.dominios ? `As ${h.dominios} cidade(s) da ${h.faccao} continuam sendo dela. ` : ""}${h.guardado.length ? `Os objetos de poder de ${morto} foram enterrados/perdidos com ${morto === novo ? "ele" : "ela"} — ${h.guardado.join(", ")} — e podem virar tesouro de uma aventura futura, nas mãos de outro. ` : ""}As pessoas do registro conheceram ${morto}, não ${novo}: elas reagem ao nome antigo com o que sentiam por ele, e ao nome novo com desconfiança, curiosidade ou esperança — nunca com intimidade que ${novo} não construiu.

Abra a cena com ${novo} chegando ao lugar onde a história parou. Diga em três ou quatro frases quem ${novo} é e por que herdou isto, use o que já existe no mundo, e me devolva a palavra.`;
}

export function resumoLegadoPrompt(pers) {
  const v = Math.max(0, (pers && pers.voltas) || 0);
  const cics = ((pers && pers.cicatrizes) || []).filter((c) => c && c.daMorte);
  if (!v && !cics.length) return "";
  return `JÁ MORREU ${v} vez(es) e voltou. ${cics.length ? `O que ficou: ${cics.map((c) => `${c.nome} (${c.descricao})`).join("; ")}. ` : ""}Isso é cânone: quem volta do outro lado volta diferente, e o mundo percebe. Deixe transparecer sem transformar em tema — uma frase de vez em quando, não um monólogo.`;
}

export const LEGADO_PROMPT = `MORTE (v9.25):
- Morrer não encerra a campanha, e também não é de graça. O sistema oferece duas saídas quando o herói cai de vez: pagar o preço de voltar (ouro ou fé, com uma cicatriz permanente) ou passar o fio a um HERDEIRO no mesmo mundo.
- Você NUNCA ressuscita ninguém por narração, nunca oferece "uma última chance" e nunca faz a morte ser um sonho. Quando o sistema mandar o envelope, cumpra-o.
- Se vier um herdeiro, o mundo continua exatamente como estava: as mesmas cidades, o mesmo mapa, a mesma gente. O que muda é quem carrega a espada — e ninguém deve intimidade ao rosto novo.`;
