/* ============================================================
   O COBRADOR (v9.112) — a memória do mundo

   A pergunta que nada no sistema respondia:

   > "O herói fez X há três dias. O que o mundo faz sobre isso AGORA?"

   `consequencias.js` é o preço de uma falha crítica, e só. `fama`,
   `reino`, `decretos` e `correio` reagem cada um na própria pista, no
   próprio instante. Nenhum deles olha para trás. O resultado é um mundo
   que só se move quando o herói está olhando — um teatro que acende
   quando ele entra e apaga quando ele sai.

   ---------------- O QUE ISTO NÃO É ----------------

   Não é um acervo de `quando` sobre a cena, como o Geógrafo ou o
   Intérprete. É um LIVRO-RAZÃO, e a diferença importa: um conselheiro
   responde sobre o AGORA, e este responde sobre o que ficou pendente.

   O livro já existe: o REGISTRO da v9.105 guarda o quê, quando, onde,
   quem viu e o peso de cada turno. Faltavam duas coisas — o ATO
   classificado (o Intérprete já o calcula e ele não era guardado) e a
   marca de JÁ COBRADO. Com as duas, o registro vira livro-razão sem
   nenhuma estrutura nova.

   ---------------- AS TRÊS REGRAS ----------------

   1. A COBRANÇA É RASTREÁVEL. Uma consequência que o jogador não
      consegue ligar ao ato que a causou não é consequência — é evento
      aleatório com cara de castigo. Toda cobrança nomeia o ato.

   2. O MUNDO TAMBÉM PAGA O BEM. Um mundo que só cobra é um mundo que
      pune, e ninguém quer jogar nele. Metade do acervo é dívida a favor:
      quem lembrou, quem deve um favor, quem contou a alguém.

   3. A DÍVIDA MATURA. Cobrar no turno seguinte é reação, não memória —
      e o jogo já tem reação de sobra. O que faz o mundo parecer vivo é a
      conta que chega quando ele já tinha esquecido.
   ============================================================ */

const limpar = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
const nomes = (v, max = 4) => (Array.isArray(v) ? v : [])
  .map((x) => limpar(typeof x === "string" ? x : (x && x.nome) || "", 30))
  .filter(Boolean)
  .filter((x, i, a) => a.indexOf(x) === i)
  .slice(0, max);

/* ---------------- QUANTO TEMPO ATÉ A CONTA CHEGAR ----------------
   Por peso, e por uma razão de ficção: uma virada corre o mundo mais
   depressa que um acontecimento, e uma marca leva tempo para virar
   história contada. Cobrar no turno seguinte seria reação; o que faz o
   mundo parecer vivo é a conta que chega quando ele já esqueceu. */
export const MATURACAO = { 1: 4, 2: 3, 3: 2 };

/* E o mundo não cobra todo dia. Sem esta trava, um herói ativo receberia
   uma consequência por turno e o jogo viraria perseguição — que é
   exatamente o oposto de um mundo que tem vida própria. */
export const DIAS_ENTRE_COBRANCAS = 5;

/* Uma dívida velha demais foi absorvida pelo mundo. Não é esquecimento:
   é que a esta altura ela já virou outra coisa — reputação, que a fama
   mede, ou história, que o Arquivista lembra. */
export const DIAS_ATE_PRESCREVER = 60;

/* E a mesma FORMA de cobrar não se repete de perto. O livro-razão já
   garante que a mesma DÍVIDA nunca é cobrada duas vezes, e isso não
   basta: numa campanha de sessenta dias, doze contas diferentes saíram
   com quatro repetições da mesma cena.

   O jogador aprende a forma e para de ler a linha na terceira vez. Um
   mundo que lembra de coisas diferentes sempre do mesmo jeito não
   lembra — tem um tique. Três, e não mais: com janela grande, as formas
   raras empurram as comuns para fora e elas nunca voltam. */
export const NAO_REPETIR = 3;

/* ---------------- A DÍVIDA ----------------
   Uma linha do registro traduzida no que o Cobrador sabe ler. Tudo aqui
   já existe na linha; nada é inventado. */
export function garantirDivida(d) {
  const o = d && typeof d === "object" ? d : {};
  const num = (v, x = 0) => (Number.isFinite(Number(v)) ? Number(v) : x);
  return {
    t: num(o.t),
    dia: num(o.dia),
    ato: limpar(o.ato, 20),
    oQue: limpar(o.oQue, 90),
    onde: limpar(o.onde, 60),
    quem: nomes(o.quem),
    viu: nomes(o.viu),
    peso: Math.max(0, Math.min(3, Math.round(num(o.peso)))),
    /* o contexto do ato, o mesmo que o Aliado lê — uma linguagem só para
       o que o herói fez, e não uma por sistema */
    suborno: !!o.suborno,
    fugi: !!o.fugi,
    poupei: !!o.poupei,
    alguemPrecisava: !!o.alguemPrecisava,
    emCombate: !!o.emCombate,
    /* e o que o mundo em volta sabe */
    publico: !!o.publico,
    fama: num(o.fama),
    diasDesde: num(o.diasDesde),
    /* já foi cobrada? o livro-razão inteiro depende deste campo */
    cobrada: !!o.cobrada,
  };
}

/* ---------------- AS FORMAS DE COBRANÇA ----------------
   Trinta e duas, e metade são a favor. Cada uma diz:

   · `quando` — que dívida ela cobra
   · `o` — o que o mundo FAZ, numa linha, sem adjetivo e sem fala
   · `sinal` — +1 o mundo paga, −1 o mundo cobra, 0 é ambíguo
   · `precisaDeQuem` — se ela nomeia alguém, o Mestre precisa ter alguém

   A REDE está no fim, pelo mesmo motivo das outras três: um livro cheio
   de dívidas e nenhuma forma que sirva é um cobrador mudo, e a mudez não
   avisa. */
export const COBRANCAS = [
  /* ---- o que se deve por sangue ---- */
  {
    id: "o_parente", sinal: -1, peso: 9, precisaDeQuem: false,
    quando: (d) => d.ato === "feri" && d.peso >= 2,
    o: "alguém da família de quem caiu aparece — não para brigar hoje, para olhar",
  },
  {
    id: "o_que_viu", sinal: -1, peso: 10, precisaDeQuem: true,
    quando: (d) => d.ato === "feri" && d.viu.length > 0 && d.peso >= 2,
    o: "quem estava lá conta a história a mais gente, e ela chega distorcida",
  },
  {
    id: "a_lei_lembra", sinal: -1, peso: 11, precisaDeQuem: false,
    quando: (d) => d.ato === "feri" && d.publico && !d.emCombate,
    o: "a autoridade daqui manda perguntar por você, sem acusar ainda",
  },
  {
    id: "o_corpo_achado", sinal: -1, peso: 8, precisaDeQuem: false,
    quando: (d) => d.ato === "feri" && !d.publico && d.peso >= 2,
    o: "acharam o que ficou para trás, e alguém começou a perguntar quem fez",
  },
  /* ---- o que se deve por ter poupado ---- */
  {
    id: "o_poupado_volta", sinal: 1, peso: 12, precisaDeQuem: false,
    quando: (d) => d.poupei && d.peso >= 1,
    o: "quem você não matou aparece e devolve o gesto — informação, passagem, um aviso",
  },
  {
    id: "a_fama_de_poupar", sinal: 1, peso: 7, precisaDeQuem: false,
    quando: (d) => d.poupei && d.publico,
    o: "corre a história de que você não termina o serviço — e há quem prefira isso",
  },
  /* ---- o que se deve por mentira ---- */
  {
    id: "a_mentira_esbarra", sinal: -1, peso: 11, precisaDeQuem: true,
    quando: (d) => d.ato === "menti" && d.viu.length > 0,
    o: "a mentira encontra quem sabe a verdade, e os dois estão na mesma cena",
  },
  {
    id: "o_nome_manchado", sinal: -1, peso: 8, precisaDeQuem: false,
    quando: (d) => d.ato === "menti" && d.publico,
    o: "alguém repete o que você disse na frente de quem pode desmentir",
  },
  {
    id: "a_versao_pegou", sinal: 0, peso: 6, precisaDeQuem: false,
    quando: (d) => d.ato === "menti" && !d.publico,
    o: "a sua versão virou a versão de todo mundo, e agora ela cobra coerência",
  },
  /* ---- o que se deve por dinheiro ---- */
  {
    id: "o_subornado_quer_mais", sinal: -1, peso: 11, precisaDeQuem: true,
    quando: (d) => d.suborno,
    o: "quem recebeu volta querendo mais, e agora sabe que você paga",
  },
  {
    id: "o_pago_lembra", sinal: 1, peso: 8, precisaDeQuem: true,
    quando: (d) => d.ato === "paguei" && !d.suborno,
    o: "quem recebeu de você guarda um favor e o oferece sem ser pedido",
  },
  {
    id: "a_conta_chega", sinal: -1, peso: 7, precisaDeQuem: false,
    quando: (d) => d.ato === "paguei" && d.peso >= 2,
    o: "chega a cobrança de uma coisa que você mandou fazer e esqueceu de pagar",
  },
  /* ---- o que se deve por ter ajudado ---- */
  {
    id: "o_ajudado_paga", sinal: 1, peso: 12, precisaDeQuem: true,
    quando: (d) => d.ato === "ajudei" && d.quem.length > 0,
    o: "quem você ajudou aparece com o que tem — não é muito, mas é o que ele tem",
  },
  {
    id: "o_recado", sinal: 1, peso: 9, precisaDeQuem: false,
    quando: (d) => d.ato === "ajudei" && d.peso >= 2,
    o: "chega um recado de quem você ajudou, de um lugar onde você nunca esteve",
  },
  {
    id: "a_porta_aberta", sinal: 1, peso: 8, precisaDeQuem: false,
    quando: (d) => d.ato === "ajudei" && d.publico,
    o: "uma porta que estaria fechada está aberta, e ninguém explica por quê",
  },
  {
    id: "pedem_de_novo", sinal: 0, peso: 6, precisaDeQuem: false,
    quando: (d) => d.ato === "ajudei",
    o: "alguém procura você por saber que você ajuda — e o problema dele é maior",
  },
  /* ---- o que se deve por ter virado as costas ---- */
  {
    id: "o_que_ficou_sem", sinal: -1, peso: 12, precisaDeQuem: false,
    quando: (d) => d.alguemPrecisava,
    o: "o que ia acontecer com quem você não ajudou aconteceu, e dá para ver",
  },
  {
    id: "a_porta_fechada", sinal: -1, peso: 7, precisaDeQuem: false,
    quando: (d) => d.ato === "ignorei" && d.publico,
    o: "uma porta que estaria aberta está fechada, e ninguém explica por quê",
  },
  /* ---- o que se deve por ter fugido ---- */
  {
    id: "a_fuga_correu", sinal: -1, peso: 10, precisaDeQuem: false,
    quando: (d) => d.fugi && d.viu.length > 0,
    o: "contaram que você correu, e quem conta não estava lá para saber por quê",
  },
  {
    id: "o_que_ficou_na_luta", sinal: -1, peso: 9, precisaDeQuem: false,
    quando: (d) => d.fugi && d.peso >= 2,
    o: "quem ficou para trás quando você saiu está aqui, e não está bem",
  },
  /* ---- o que se deve por ter ameaçado ---- */
  {
    id: "o_ameacado_se_arma", sinal: -1, peso: 10, precisaDeQuem: true,
    quando: (d) => d.ato === "ameacei" && d.quem.length > 0,
    o: "quem você ameaçou não está mais sozinho quando aparece",
  },
  {
    id: "cede_antes", sinal: 1, peso: 6, precisaDeQuem: false,
    quando: (d) => d.ato === "ameacei" && d.publico,
    o: "alguém cede antes de você pedir, porque ouviu falar de você",
  },
  /* ---- o que se deve por ter acusado ---- */
  {
    id: "a_acusacao_pegou", sinal: 0, peso: 8, precisaDeQuem: true,
    quando: (d) => d.ato === "acusei" && d.publico,
    o: "levaram a sério o que você disse, e agora há consequência para o acusado",
  },
  {
    id: "a_acusacao_errada", sinal: -1, peso: 9, precisaDeQuem: true,
    quando: (d) => d.ato === "acusei" && d.viu.length > 1,
    o: "descobriram que o acusado não era o culpado, e lembram de quem apontou",
  },
  /* ---- o que se deve por ter contado de si ---- */
  {
    id: "o_segredo_andou", sinal: -1, peso: 10, precisaDeQuem: true,
    quando: (d) => d.ato === "revelei" && d.viu.length > 1,
    o: "o que você contou chegou a quem não devia, pela boca de quem estava junto",
  },
  {
    id: "confiam_em_voce", sinal: 1, peso: 7, precisaDeQuem: true,
    quando: (d) => d.ato === "revelei" && d.viu.length === 1,
    o: "quem ouviu conta uma coisa dele em troca, e é uma coisa cara",
  },
  /* ---- o que a fama cobra ---- */
  {
    id: "reconhecem", sinal: 0, peso: 5, precisaDeQuem: false,
    quando: (d) => d.fama >= 45 && d.peso >= 2,
    o: "alguém reconhece você por uma coisa que você fez e não lembra de ter feito",
  },
  {
    id: "querem_o_seu_nome", sinal: 0, peso: 6, precisaDeQuem: false,
    quando: (d) => d.fama >= 60 && d.publico,
    o: "usaram o seu nome para fazer alguma coisa, sem a sua permissão",
  },
  {
    id: "o_imitador", sinal: -1, peso: 7, precisaDeQuem: false,
    quando: (d) => d.fama >= 70 && d.peso >= 2,
    o: "alguém está fazendo o que você fez, e mal, e culpam você",
  },
  /* ---- a REDE ---- */
  {
    id: "o_boato_torto", sinal: 0, peso: 3, precisaDeQuem: false,
    quando: (d) => d.viu.length > 0,
    o: "a história do que você fez volta contada errada, e é essa que pegou",
  },
  {
    id: "o_lugar_lembra", sinal: 0, peso: 2, precisaDeQuem: false,
    quando: (d) => !!d.onde,
    o: "no lugar onde aconteceu, alguém ainda comenta",
  },
  {
    id: "alguem_soube", sinal: 0, peso: 1, precisaDeQuem: false,
    quando: () => true,
    o: "chega alguém que ouviu falar do que você fez, e quer conferir",
  },
];

export function cobrancaPorId(id) { return COBRANCAS.find((c) => c.id === id) || null; }

/* ---------------- O LIVRO-RAZÃO ----------------
   Traduz o registro em dívidas ABERTAS: com peso, maduras, não
   prescritas e não cobradas. Peso 0 não gera dívida nenhuma — o tecido
   do dia não deixa conta. */
export function dividasAbertas(registro, { dia = 0, cobradas = [], fama = 0 } = {}) {
  const feitas = new Set(Array.isArray(cobradas) ? cobradas : []);
  const out = [];
  for (const linha of (Array.isArray(registro) ? registro : [])) {
    const l = linha && typeof linha === "object" ? linha : {};
    const peso = Math.max(0, Math.min(3, Math.round(Number(l.peso) || 0)));
    if (peso < 1) continue;
    const diasDesde = dia - (Number(l.dia) || 0);
    if (diasDesde < (MATURACAO[peso] || 4)) continue;
    if (diasDesde > DIAS_ATE_PRESCREVER) continue;
    if (feitas.has(chaveDaDivida(l))) continue;
    out.push(garantirDivida({ ...l, diasDesde, fama, cobrada: false }));
  }
  return out;
}

/* A chave de uma dívida é o turno em que ela nasceu: dois atos iguais em
   dias diferentes são duas dívidas, e o mesmo ato nunca é cobrado duas
   vezes. Sem chave estável, o mundo cobraria a mesma coisa para sempre. */
export function chaveDaDivida(l) {
  const o = l && typeof l === "object" ? l : {};
  return `${Math.floor(Number(o.t) || 0)}|${Math.floor(Number(o.dia) || 0)}`;
}

/* ---------------- A CONSULTA ----------------
   Escolhe UMA dívida e UMA forma de cobrar. Falha fechada: sem dívida
   madura, sem cobrança — o mundo pode muito bem não fazer nada hoje, e
   essa é a resposta mais comum.

   A dívida escolhida é a MAIS PESADA entre as maduras, e a mais velha
   entre as de mesmo peso: uma conta que envelhece sem chegar é uma conta
   que o jogo prometeu e não pagou. */
export function consultarCobrador(registro, ctx = {}) {
  const { dia = 0, cobradas = [], fama = 0, ultimaCobranca = -99, publico = false, temGente = false, ultimasFormas = [] } = ctx;
  const cansadas = new Set((Array.isArray(ultimasFormas) ? ultimasFormas : []).slice(-NAO_REPETIR));
  if (dia - ultimaCobranca < DIAS_ENTRE_COBRANCAS) return null;
  const abertas = dividasAbertas(registro, { dia, cobradas, fama });
  if (!abertas.length) return null;
  const ordenadas = [...abertas].sort((a, b) => (b.peso - a.peso) || (b.diasDesde - a.diasDesde));
  for (const d0 of ordenadas) {
    const d = { ...d0, publico: publico || d0.publico };
    /* duas passadas: primeiro só as que não saíram há pouco. Se nenhuma
       servir, a repetida volta a valer — deixar a conta sem cobrar por
       causa de estilo seria trocar um defeito por outro pior. */
    let melhor = null, reserva = null;
    for (const c of COBRANCAS) {
      if (c.precisaDeQuem && !temGente) continue;
      let bate = false;
      try { bate = !!c.quando(d); } catch { bate = false; }
      if (!bate) continue;
      if (cansadas.has(c.id)) { if (!reserva || c.peso > reserva.peso) reserva = c; continue; }
      if (!melhor || c.peso > melhor.peso) melhor = c;
    }
    const escolhida = melhor || reserva;
    if (escolhida) return { divida: d, cobranca: escolhida, chave: chaveDaDivida(d), repetida: !melhor };
  }
  return null;
}

/* ---------------- A LINHA DA PAUTA ----------------
   Duas coisas, e nenhuma a mais: o que o mundo faz, e POR CAUSA DO QUÊ.
   A segunda metade é o que separa consequência de evento aleatório —
   sem ela o jogador levaria um castigo sem saber de onde veio, e um
   castigo sem causa lê como o Narrador implicando com ele. */
export function linhaDoMundo(r) {
  if (!r || !r.cobranca || !r.divida) return "";
  const d = r.divida;
  /* a concordância importa: esta linha chega ao Narrador e ele repete o
     que leu. "há umas 1 semanas" vira estilo da casa em três turnos. */
  const semanas = Math.max(1, Math.round(d.diasDesde / 7));
  const quando = d.diasDesde <= 1 ? "ontem"
    : d.diasDesde < 7 ? `há ${Math.round(d.diasDesde)} dias`
      : d.diasDesde < 30 ? (semanas === 1 ? "há uma semana" : `há umas ${semanas} semanas`)
        : "há mais de um mês";
  const oQue = d.oQue ? `"${d.oQue}"` : (d.ato ? d.ato : "o que aconteceu");
  return `${r.cobranca.o} — por ${oQue}, ${quando}${d.onde ? `, ${d.onde}` : ""}`;
}

/* O envelope de CANON. Sai junto da linha porque a cobrança é FATO: o
   Narrador tem de encená-la, não de decidir se ela acontece. E a regra
   do sinal existe para ele não transformar em ameaça o que o mundo está
   pagando de volta — que seria pior do que não pagar. */
export function envelopeDoMundo(r) {
  if (!r || !r.cobranca) return "";
  const s = r.cobranca.sinal;
  const tom = s > 0 ? "Isto é o mundo PAGANDO uma coisa boa que ele fez: não transforme em ameaça, não cobre nada em troca."
    : s < 0 ? "Isto é o mundo COBRANDO: não é ataque nem castigo do destino, é gente reagindo a uma coisa que ele fez, e há como responder."
      : "Isto não é bom nem ruim: é o mundo tendo lembrado.";
  return `[O MUNDO LEMBROU — CANON] ${linhaDoMundo(r)}. ${tom} Ligue à cena de agora sem parar a história para explicar, e deixe claro de que ato isto veio.`;
}

export const COBRADOR_PROMPT = `O MUNDO LEMBRA (v9.112):
· De vez em quando a Pauta traz uma linha do mundo COBRANDO ou PAGANDO uma coisa que o herói fez dias atrás. É fato decidido pelo sistema — encene, não decida se acontece.
· A linha diz de que ato veio. Deixe isso legível na cena: uma consequência que o jogador não liga ao que ele fez lê como o Narrador implicando com ele.
· O mundo também paga o bem. Quando a linha for a favor dele, não a transforme em ameaça nem cobre nada em troca.
· Isso é raro de propósito. Não invente cobranças por conta própria e não faça o passado voltar em todo turno — o mundo tem mais o que fazer.`;
