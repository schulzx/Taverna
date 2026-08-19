/* ============================================================
   A ESCOLA DO MESTRE (v9.71) — o repertório, não o roteiro

   O despachante já é o mestre da mesa: ele decide o que é comando, o
   que é magia, o que pede dado, o que é pergunta ao mundo e o que é
   cena. Só que decidia como um mestre de primeira sessão — cada turno
   julgado sozinho, sem memória do que a mesa vinha vivendo. E é aí
   que mora a diferença entre um mestre novato e um mestre rodado, que
   NÃO é imaginação: é TEMPO.

   O novato pede dado para tudo e a mesa cansa; ou não pede nenhum e a
   cena vira conversa sem aposta. Deixa a cena morrer sem perceber que
   morreu. Planta um nome no dia 3 e nunca mais o usa. Mata o herói com
   uma armadilha que ninguém teve como ver. Dá o sucesso e não dá nada
   além dele. Nenhum desses erros é de invenção — todos são de LEITURA
   DA MESA, e leitura de mesa é estado observável.

   Este arquivo é a memória curta do mestre e o repertório que ele
   aplica sobre ela. Sete padrões, cada um com a pergunta que o abre e
   a decisão que ele toma.

   O QUE ELE NÃO FAZ, e a linha é a mesma da casa: não inventa nada. Não
   cria trama, não cria pessoa, não cria motivo. Ele escolhe ENTRE o que
   já existe e diz QUANDO. Inventar continua sendo da IA — é a única
   coisa que ela faz melhor que qualquer tabela, e tirar isso dela seria
   trocar um jogo vivo por um gerador.

   E NÃO SOBE NADA AO PROMPT POR TURNO. Este arquivo inteiro fala por
   envelope: só custa token no turno em que decide alguma coisa. O
   orçamento da cena comum está em 58,7k de 59k, e um bloco fixo aqui
   seria cobrado na campanha inteira para servir num turno a cada dez.
   ============================================================ */

/* ---------------- DE ONDE VEM CADA PADRÃO ----------------
   Não são citações: é o ofício documentado desses mestres reduzido à
   parte que um programa consegue verificar. O resto do que eles fazem —
   a voz, o timing da fala, a leitura da pessoa do outro lado da mesa —
   não é codificável e não está aqui. */
export const MESTRES = [
  {
    id: "gygax", nome: "Gary Gygax",
    regra: "não se rola o que não tem incerteza nem consequência — e o mestre pode simplesmente conceder",
    onde: "seguraOTeste",
  },
  {
    id: "perkins", nome: "Chris Perkins",
    regra: "o ritmo é trabalho do mestre: pressão e respiro se alternam, e a cena morta se percebe antes de morrer",
    onde: "temperaturaDaMesa",
  },
  {
    id: "mercer", nome: "Matthew Mercer",
    regra: "o holofote gira; e o sucesso grande merece mais que o sucesso",
    onde: "pilarFaminto, brilhoDoSucesso",
  },
  {
    id: "mulligan", nome: "Brennan Lee Mulligan",
    regra: "nada de novo enquanto houver fio plantado por puxar — o mundo lembra do que o jogador fez",
    onde: "fioDaMemoria",
  },
  {
    id: "mesa", nome: "o consenso das quatro mesas",
    regra: "o perigo que pode matar se anuncia antes de morder",
    onde: "avisarAntesDeMorder",
  },
];

/* ============================================================
   1. A MEMÓRIA CURTA

   Dez turnos, e nada além disso. A janela é curta de propósito: o que
   este arquivo lê é a TEMPERATURA da mesa agora, não a campanha. Quem
   guarda a campanha é a crônica, o livro de fatos e o cânone.

   Cada turno vira quatro booleanos e um pilar. É pouco, e é o
   suficiente — o erro do novato não precisa de mais que isso para ser
   flagrado.
   ============================================================ */
export const JANELA = 10;

export function garantirMesa(m) {
  const o = m && typeof m === "object" ? m : {};
  const n = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d);
  return {
    turnos: (Array.isArray(o.turnos) ? o.turnos : []).slice(-JANELA),
    avisados: (Array.isArray(o.avisados) ? o.avisados : []).slice(-12),
    desdeFio: n(o.desdeFio, 0),
    fiosUsados: (Array.isArray(o.fiosUsados) ? o.fiosUsados : []).slice(-12),
  };
}

export function anotarTurno(mesa, t = {}) {
  const m = garantirMesa(mesa);
  const pilar = PILARES.some((p) => p.id === t.pilar) ? t.pilar : null;
  const r = { rolou: !!t.rolou, perigo: !!t.perigo, ganho: !!t.ganho, luta: !!t.luta, pilar };
  return { ...m, turnos: [...m.turnos, r].slice(-JANELA), desdeFio: m.desdeFio + 1 };
}

/* As contas que os padrões fazem sobre a janela. Separadas para que a
   tabela de temperaturas leia como se lê uma mesa: "houve três dados
   nos últimos cinco turnos". */
function leitura(mesa) {
  const m = garantirMesa(mesa);
  const ult = (n) => m.turnos.slice(-Math.max(1, n));
  const conta = (n, campo) => ult(n).filter((t) => t[campo]).length;
  return {
    turnos: m.turnos,
    quantos: m.turnos.length,
    rolagens: (n) => conta(n, "rolou"),
    ganhos: (n) => conta(n, "ganho"),
    perigos: (n) => conta(n, "perigo"),
    lutas: (n) => conta(n, "luta"),
    agora: m.turnos[m.turnos.length - 1] || null,
  };
}

/* ============================================================
   2. A TEMPERATURA DA MESA

   Quatro estados, e cada um manda em duas coisas: se o mestre pode
   DISPENSAR um dado sem graça, e se o mundo pode tomar a palavra.

   A ordem da tabela é o conteúdo, como em toda tabela desta casa: a
   brasa ganha da quente, a quente ganha da fria, e a morna é o que
   sobra — que é o estado da maioria dos turnos, e tem de ser.
   ============================================================ */
export const TEMPERATURAS = [
  {
    id: "brasa", rotulo: "em brasa",
    quando: (u) => !!(u.agora && u.agora.luta) || u.perigos(2) > 0,
    segura: false, mundoPode: false, pedeFio: false,
    diz: "há uma luta ou um perigo em curso",
    porque: "no meio da brasa não se dispensa dado nenhum — é onde o dado É o jogo — e o mundo não interrompe, porque interromper aqui é roubar a cena mais quente que o jogador tem",
  },
  {
    id: "quente", rotulo: "quente",
    quando: (u) => u.rolagens(5) >= 3 || u.perigos(4) > 0,
    segura: true, mundoPode: false, pedeFio: false,
    diz: "já houve dado demais nos últimos turnos",
    porque: "é aqui que o novato cansa a mesa: continua pedindo dado porque cada pedido, sozinho, era defensável. O mestre rodado concede o pequeno para que o próximo grande ainda pese",
  },
  {
    id: "fria", rotulo: "fria",
    quando: (u) => u.quantos >= 5 && u.rolagens(5) === 0 && u.ganhos(5) === 0 && u.perigos(5) === 0,
    segura: false, mundoPode: true, pedeFio: true,
    diz: "cinco turnos sem dado, sem perigo e sem nada ganho",
    porque: "a cena morreu e ninguém na mesa percebeu — é o erro mais silencioso do ofício. Aqui o mestre não segura nada e o mundo puxa um fio, de preferência um que o próprio jogador plantou",
  },
  {
    id: "morna", rotulo: "morna",
    quando: () => true,
    segura: false, mundoPode: true, pedeFio: false,
    diz: "a mesa está no passo dela",
    porque: "o estado da maioria dos turnos, e tem de ser: um mestre que está sempre corrigindo o ritmo é um mestre que não deixa o jogo acontecer",
  },
];

export function temperaturaDaMesa(mesa) {
  const u = leitura(mesa);
  for (const t of TEMPERATURAS) {
    let abre = false;
    try { abre = !!t.quando(u); } catch { abre = false; }
    if (abre) return { ...t, quantos: u.quantos };
  }
  const fim = TEMPERATURAS[TEMPERATURAS.length - 1];
  return { ...fim, quantos: u.quantos };
}

/* ============================================================
   3. O GOVERNADOR DO DADO — quando o mestre CONCEDE

   "Não dá para fazer um teste a cada turno, chegaria um momento que
   ficaria cansativo."

   A resposta errada seria pedir menos dado no geral: aí o jogo perde a
   coisa que o faz jogo, que é torcer pelo número. A resposta do ofício
   é outra e é mais fina — pede-se MENOS DADO SEM APOSTA, e nunca menos
   dado com aposta.

   A trava, e ela é a metade que importa: NADA CONSEQUENTE É
   DISPENSADO. O que pode custar o corpo, deixar testemunha, fazer
   barulho ou está no meio da luta rola sempre, com a mesa fria ou
   fervendo. E o difícil também rola sempre — dispensar um teste duro é
   dar de graça o que o jogador ia querer ter conquistado.

   Sobra o que sobra: a tarefa pequena, silenciosa e provável, na mesa
   que acabou de rolar três dados. Essa o mestre concede, e conceder é
   um movimento de mestre — não é o sistema desistindo.
   ============================================================ */
export function testeEhConsequente(v, { emCombate = false } = {}) {
  if (!v || v.tipo !== "teste") return false;
  if (emCombate) return true;
  /* o degrau é o DIFÍCIL (18), e não o incomum: dispensar um teste duro é
     dar de graça o que o jogador ia querer ter conquistado, mas tratar 15
     como duro faria a régua engolir a metade do catálogo — e um governador
     que nunca concede nada é um governador que não existe */
  return !!(v.corpo || v.queda || v.testemunha || v.barulho || Number(v.dc) >= 18);
}

export function seguraOTeste(v, mesa, { emCombate = false } = {}) {
  if (!v || v.tipo !== "teste") return { segura: false, porque: "" };
  /* ---------------- A MARCA É POSITIVA, E TEM DE SER ----------------
     A primeira versão disto inferia "inofensivo" ao contrário: dispensava
     tudo que não tivesse corpo, testemunha nem barulho. Aí a régua virava
     a AUSÊNCIA de uma linha em `CUSTO_DE_FALHAR` — e falsificar um
     documento e acalmar um bicho entravam na lista de dispensáveis só
     porque ninguém tinha escrito ainda o que a falha deles custa.

     Lacuna numa tabela virando permissão em outra é a classe de bug que
     esta casa mais repete. Então a marca é explícita e vive no catálogo,
     junto do desafio: `dispensavel` só está onde falhar significa APENAS
     não saber. O que ninguém marcou rola, que é o lado seguro. */
  if (!v.dispensavel) return { segura: false, porque: "só o teste em que falhar significa apenas não saber pode ser dispensado" };
  /* E as travas continuam, como segunda rede: se um dia um desafio marcado
     dispensável ganhar preço em pele ou testemunha, ele para de ser
     dispensável no mesmo instante, sem ninguém precisar lembrar de vir
     aqui desmarcá-lo. */
  if (testeEhConsequente(v, { emCombate })) {
    return { segura: false, porque: "o que pode custar o corpo, o segredo ou a cena não se dispensa em mesa nenhuma" };
  }
  /* e o que depende de HAVER o quê nunca é concedido: um "você faz, e faz
     bem" numa busca é uma ordem para a IA inventar o que foi achado, que é
     exatamente o buraco que o oráculo fechou */
  if (v.oportunidade || v.achado || v.fechaDepois) return { segura: false, porque: "quem decide se há o que achar é o mundo, não o mestre" };
  if (v.social) return { segura: false, porque: "o que um sim compra e o que ele não compra vai escrito no envelope social" };
  const t = temperaturaDaMesa(mesa);
  if (!t.segura) return { segura: false, porque: `a mesa está ${t.rotulo}: ${t.diz}` };
  return {
    segura: true,
    temperatura: t.id,
    porque: `${t.diz} — e isto aqui é pequeno, silencioso e provável`,
    rotulo: v.rotulo || "isso",
  };
}

/* O jogador vê que conseguiu, não que foi dispensado: a decisão de
   conceder é do mestre e fica com ele. Dizer "eu ia pedir um dado mas
   deixei passar" ensina o jogador a contar os turnos até o próximo
   perdão, que é exatamente o oposto do efeito. */
export function falaDaConcessao(s) {
  if (!s || !s.segura) return "";
  return `✓ ${s.rotulo} — você faz, e faz bem.`;
}

export function envelopeDaConcessao(s) {
  if (!s || !s.segura) return "";
  return `[SEM DADO — DECISÃO DO SISTEMA] Isto que eu fiz (${s.rotulo}) deu certo, sem rolagem: é pequeno, não faz barulho, não deixa testemunha e a mesa já rolou dado demais nos últimos turnos.
REGRA DESTE ENVELOPE (obrigatória): narre o sucesso limpo, em uma ou duas frases, e siga em frente. NÃO invente uma complicação para compensar a falta do dado, NÃO cobre um preço e NÃO diga que foi fácil demais. E não mencione dado, teste, nem que houve uma decisão — para mim isso simplesmente funcionou.`;
}

/* ============================================================
   4. O HOLOFOTE — qual pilar está passando fome

   Numa mesa com cinco jogadores, o holofote gira entre as pessoas.
   Numa mesa de um, ele gira entre os TRÊS PILARES do jogo: a luta, o
   mundo lá fora e a gente. Um jogador que passou dez turnos só
   conversando não está entediado ainda — mas o mestre que não percebe
   isso é o mesmo que acorda no turno vinte com uma campanha inteira
   feita de taverna.

   Isto não força nada: só diz ao mundo QUAL fio preferir quando ele
   já ia se mexer de qualquer jeito.
   ============================================================ */
export const PILARES = [
  { id: "combate", rotulo: "a luta", diz: "faz tempo que ninguém saca nada" },
  { id: "exploracao", rotulo: "o mundo lá fora", diz: "faz tempo que o herói não sai para ver o que há" },
  { id: "social", rotulo: "a gente", diz: "faz tempo que ninguém olha o herói nos olhos" },
];

export function pilarPorId(id) { return PILARES.find((p) => p.id === id) || null; }

/* ---------------- DE ONDE SAI O PILAR DE UM TURNO (v9.72) ----------------
   A primeira versão lia o pilar SÓ do desafio que rolou. Servia para o
   turno com dado e deixava de fora justamente o que mais acontece: a
   conversa. Um turno inteiro de taverna — o herói falando com três
   pessoas, sem tocar num dado — entrava como `null`, e então uma campanha
   feita de taverna podia acusar fome de "a gente". O holofote apontava
   para a luz acesa.

   O sinal aqui é o TEXTO DO JOGADOR, e ele é honesto por um motivo: o
   pilar não pergunta o que existe na cena, pergunta que tipo de jogo o
   jogador acabou de jogar. Quem escreve "pergunto ao ferreiro" jogou o
   pilar social, esteja o ferreiro registrado no elenco ou não — e é essa
   a diferença para `pessoaNaFrente`, que depende do cadastro e devolve
   nada numa cidade cujos nomes o Mestre ainda não registrou.

   O falso positivo aqui é barato: o pilar só sugere um LADO ao envelope
   do fio, e o envelope já manda não forçar se não couber. */
export const SINAIS_DO_PILAR = [
  {
    pilar: "social",
    /* fala dirigida a alguém, ou a fala do próprio herói entre aspas */
    rx: /\b(digo|falo|pergunto|respondo|conto|comento|converso|puxo conversa|cumprimento|pe[cç]o|agrade[cç]o|explico|proponho|ofere[cç]o|negocio|barganho|discuto|grito com|sussurro (para|a)|chamo|me apresento|elogio|amea[cç]o|convido|insisto com|interrogo|indago)\b|["“][^"”]{4,}["”]/,
    porque: "quem escreve a própria fala está jogando o pilar da gente, e isso não depende de o Mestre já ter registrado o nome de quem ouve",
  },
  {
    pilar: "exploracao",
    rx: /\b(vou at[ée]|sigo|caminho|ando at[ée]|entro|saio|subo|des[cç]o|atravesso|volto|parto|viajo|exploro|percorro|olho em volta|observo|examino|vasculho|procuro|investigo|escalo|avan[cç]o|rastreio|acampo)\b/,
    porque: "mexer o corpo pelo mundo é o outro pilar, e ele é o que some primeiro numa campanha que virou conversa",
  },
];

export function pilarDoTexto(texto) {
  const t = String(texto || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (!t.trim()) return null;
  /* a conversa ganha do deslocamento de propósito: "vou até a elfa e digo
     que ela caiu do céu" é uma cena social com um passo de caminhada
     dentro, não uma caminhada com uma fala dentro */
  for (const s of SINAIS_DO_PILAR) {
    try { if (s.rx.test(t)) return s.pilar; } catch { /* regex nunca custa o turno */ }
  }
  return null;
}

export function pilarFaminto(mesa) {
  const m = garantirMesa(mesa);
  /* janela curta demais não sustenta a conclusão: dizer que a luta está
     em falta depois de dois turnos de jogo é ruído com cara de sistema */
  if (m.turnos.length < 6) return null;
  const vistos = new Set(m.turnos.map((t) => t.pilar).filter(Boolean));
  const famintos = PILARES.filter((p) => !vistos.has(p.id));
  if (!famintos.length) return null;
  /* mais de um faminto: vence o de baixo da lista, porque "a gente" e "o
     mundo lá fora" cabem em qualquer cena e a luta não — empurrar uma
     luta só porque não houve luta é o pior conselho desta tabela */
  return famintos[famintos.length - 1];
}

/* ============================================================
   5. O FIO DA MEMÓRIA — o mundo lembra do que o jogador fez

   A iniciativa do mundo (oraculo.js) já puxa fios de PRESSÃO: o
   relógio quase cheio, a nêmese, o prazo, a facção em guerra. Todos
   olham para a frente.

   Falta o que olha para trás, e é o que mais parece mestre grande
   quando aparece: o nome que o jogador conheceu no dia 3 e deixou para
   trás, a promessa que ele fez e não cumpriu, a cicatriz que ele
   carrega, o lugar que ele descobriu e nunca mais visitou, a tentativa
   que falhou e ficou por isso mesmo, o inimigo que ele matou e que era
   filho de alguém.

   Nada disso é inventado aqui — tudo já está registrado no jogo. O
   mestre só ESCOLHE qual puxar, e é essa a decisão que a IA fazia mal:
   ela puxava o fio conveniente para a cena que já tinha na cabeça, e
   por isso o passado do jogador nunca voltava.

   `fiosUsados` existe pela razão de sempre nesta casa: um fio puxado
   duas vezes seguidas vira tique, e tique é pior que esquecimento.
   ============================================================ */
export const FIOS_DA_MEMORIA = [
  {
    id: "promessa", peso: 5,
    quando: (c) => !!(c.promessaAberta && String(c.promessaAberta).trim()),
    fio: (c) => String(c.promessaAberta),
    diz: "alguém vem cobrar o que você disse que faria",
    porque: "a promessa aberta é o fio mais forte que existe, porque foi o jogador quem o amarrou",
  },
  {
    id: "nome", peso: 4,
    quando: (c) => !!(c.nomeEsquecido && c.nomeEsquecido.nome),
    fio: (c) => `${c.nomeEsquecido.nome}${c.nomeEsquecido.vontade ? ` (${c.nomeEsquecido.vontade})` : ""}`,
    diz: "alguém que você conheceu e deixou para trás reaparece",
    porque: "gente que some do jogo depois de uma cena ensina o jogador que ninguém importa",
  },
  {
    id: "fracasso", peso: 4,
    quando: (c) => !!(c.tentativaFalha && String(c.tentativaFalha).trim()),
    fio: (c) => String(c.tentativaFalha),
    diz: "aquilo em que você falhou volta a ter consequência",
    porque: "falhar tem de mover a história — a falha que não move nada é a falha que ensina o jogador a não arriscar",
  },
  {
    id: "morto", peso: 3,
    quando: (c) => !!(c.derrotado && String(c.derrotado).trim()),
    fio: (c) => String(c.derrotado),
    diz: "o que você matou tinha gente do lado dele",
    porque: "toda vitória do jogador é a derrota de alguém, e um mundo em que isso nunca volta é um mundo sem peso",
  },
  {
    id: "cicatriz", peso: 3,
    quando: (c) => !!(c.cicatriz && String(c.cicatriz).trim()),
    fio: (c) => String(c.cicatriz),
    diz: "a marca que você carrega é reconhecida por alguém",
    porque: "a cicatriz é canon permanente e quase nunca é usada — é história de graça, já escrita e já paga",
  },
  {
    id: "lugar", peso: 2,
    quando: (c) => !!(c.lugarAbandonado && String(c.lugarAbandonado).trim()),
    fio: (c) => String(c.lugarAbandonado),
    diz: "notícia chega do lugar que você descobriu e não voltou a ver",
    porque: "o mapa que o jogador descobriu e abandonou é conteúdo pronto que o jogo esquece",
  },
];

export function fioDaMemoria(ctx = {}, { sorte = Math.random, mesa = null } = {}) {
  const m = garantirMesa(mesa);
  const recentes = new Set(m.fiosUsados.slice(-3));
  let abertos = FIOS_DA_MEMORIA.filter((f) => { try { return !!f.quando(ctx); } catch { return false; } });
  const semRepetir = abertos.filter((f) => !recentes.has(f.id));
  if (semRepetir.length) abertos = semRepetir;
  if (!abertos.length) return null;
  const total = abertos.reduce((n, f) => n + f.peso, 0);
  let corte = sorte() * total;
  const f = abertos.find((x) => (corte -= x.peso) <= 0) || abertos[0];
  let fio = "";
  try { fio = String(f.fio(ctx) || ""); } catch { fio = ""; }
  if (!fio) return null;
  return { id: f.id, diz: f.diz, fio, memoria: true };
}

export function marcarFio(mesa, id) {
  const m = garantirMesa(mesa);
  return { ...m, desdeFio: 0, fiosUsados: [...m.fiosUsados, id].slice(-12) };
}

export function envelopeDoFio(mv, pilar = null) {
  if (!mv) return "";
  const holofote = pilar ? `\nO PILAR QUE ESTÁ EM FALTA nesta mesa é ${pilar.rotulo} — ${pilar.diz}. Se der para trazer este fio por esse lado, traga; se não der, deixe como está e não force.` : "";
  return `[O PASSADO VOLTA — ESCOLHIDO PELO SISTEMA] ${mv.diz}: ${mv.fio}.
REGRA DESTE ENVELOPE (obrigatória): isto JÁ ACONTECEU nesta campanha — o sistema o tirou do registro do jogo, não é sugestão e não é lembrança minha. Traga-o à cena AGORA, em duas ou três frases, entrelaçado com o que eu acabei de fazer.
NÃO invente uma trama nova, NÃO reescreva o que aconteceu antes, NÃO resolva isto agora e NÃO transforme em combate por conta própria. É o mundo lembrando, não um desfecho. Depois devolva a palavra para mim.${holofote}`;
}

export function linhaDoFio(mv) {
  return mv ? `🧵 ${mv.diz}.` : "";
}

/* ============================================================
   6. O BRILHO — o sucesso grande dá mais que o sucesso

   "A sensação de dar certo ou errado, de poder jogar um dado e torcer
   pelo resultado, de colher o prêmio ou a consequência."

   O jogo já cobra caro a falha: preço em pele, tempo, barulho,
   testemunha, o degrau do "por pouco". O outro lado nunca existiu — 12
   contra 11 e 25 contra 11 davam exatamente a mesma coisa, e um dado
   em que só a metade de baixo tem textura é meio dado.

   Duas faixas, e as duas são fato do dado, não opinião: o 20 natural e
   a margem de dez pontos.

   A TRAVA: o brilho NÃO dá tesouro. Item e moeda são do sistema —
   preço, peso, raridade, orçamento — e deixar a narração premiar em
   ouro seria abrir de novo o buraco que a cobrança fechou. O brilho dá
   FICÇÃO: informação além da pergunta, um detalhe que abre caminho, o
   feito visto por quem importa. Coisas que valem muito e não desmontam
   nenhuma conta.
   ============================================================ */
export const BRILHOS = [
  {
    id: "natural", quando: (x) => x.natural === 20,
    rotulo: "20 natural",
    diz: "não só deu certo: deu certo de um jeito que vai ser lembrado",
  },
  {
    id: "folgado", quando: (x) => x.margem >= 10,
    rotulo: "com dez de folga",
    diz: "deu certo com folga, e a folga compra alguma coisa",
  },
];

export function brilhoDoSucesso({ total = 0, dc = 10, natural = 0 } = {}) {
  const t = Number(total) || 0, d = Number(dc) || 0, n = Number(natural) || 0;
  if (t < d) return null;
  const x = { margem: t - d, natural: n };
  const b = BRILHOS.find((y) => { try { return !!y.quando(x); } catch { return false; } });
  return b ? { id: b.id, rotulo: b.rotulo, diz: b.diz, margem: x.margem } : null;
}

export function falaDoBrilho(b) {
  return b ? `✨ ${b.rotulo} — ${b.diz}.` : "";
}

export function envelopeDoBrilho(b, rotulo = "o que eu fiz") {
  if (!b) return "";
  return `[BRILHO — DECISÃO DO SISTEMA] Passei em ${rotulo} ${b.id === "natural" ? "com 20 natural" : `por ${b.margem} pontos de folga`}. Isso não é só sucesso: é sucesso com sobra.
REGRA DESTE ENVELOPE (obrigatória): dê UMA coisa a mais, concreta e agora — informação além do que eu perguntei, um detalhe que abre um caminho que eu não tinha, ou o feito reparado por alguém cuja opinião pesa. Uma só, dentro desta cena.
NÃO dê moeda, item, poção nem tesouro: isso é do sistema e entra por outro caminho. NÃO prometa recompensa futura, NÃO abra trama nova e NÃO diga que foi um sucesso crítico — mostre a sobra na ficção, sem nomear a mecânica.`;
}

/* ============================================================
   7. O AVISO ANTES DA MORDIDA

   A regra em que as quatro mesas concordam sem exceção: o perigo que
   pode matar se ANUNCIA. Não se avisa por bondade — avisa-se porque a
   morte que o jogador não teve como ver não é derrota, é sorteio, e
   sorteio não constrói história nenhuma.

   O sistema não sabe o que é "justo", mas sabe duas coisas: quanto o
   golpe tira e quanto ainda resta no corpo. Quando o que vem por aí
   pode levar metade do que sobrou e essa fonte nunca apareceu antes na
   cena, o mestre segura a mordida por UM turno e manda o mundo mostrar
   os dentes primeiro.

   Um turno, e só o primeiro: a segunda vez a mesma armadilha morde
   sem aviso nenhum, porque aí o jogador já sabe onde pisou.
   ============================================================ */
export function jaAvisou(mesa, fonteId) {
  return garantirMesa(mesa).avisados.includes(String(fonteId || ""));
}

export function marcarAvisado(mesa, fonteId) {
  const m = garantirMesa(mesa);
  const id = String(fonteId || "");
  if (!id || m.avisados.includes(id)) return m;
  return { ...m, avisados: [...m.avisados, id].slice(-12) };
}

export function avisarAntesDeMorder({ dano = 0, pv = 0, fonteId = "", mesa = null } = {}) {
  const d = Number(dano) || 0, v = Number(pv) || 0;
  if (d <= 0 || v <= 0) return { avisa: false, porque: "não há mordida para segurar" };
  if (jaAvisou(mesa, fonteId)) return { avisa: false, porque: "esta fonte já se mostrou uma vez — a segunda morde" };
  if (d * 2 < v) return { avisa: false, porque: "o golpe não chega perto de derrubar" };
  return { avisa: true, porque: `levaria ${d} de ${v} PV, e esta fonte nunca apareceu antes` };
}

/* O envelope chega DEPOIS de a IA ter narrado a mordida — o canal do
   perigo é a fala dela, e o sistema só resolve os números quando a fala
   já está na tela. Então ele não é um pedido de aviso: é uma RECUSA,
   com a mesma forma da cobrança negada. O sistema segura o golpe e
   manda a cena recuar até o instante anterior a ele. */
export function envelopeDoAviso(diz, { avisa } = {}) {
  const t = String(diz || "o perigo");
  return `[MORDIDA SEGURADA — DECISÃO DO SISTEMA] Você narrou ${t} me alcançando. NÃO alcançou: ${avisa || "o golpe podia me derrubar e eu não tive uma ação para reagir a ele"}. Nada disso me atingiu e o sistema não cobrou nada.
REGRA DESTE ENVELOPE (obrigatória): na próxima fala, recue até o instante ANTES — mostre a coisa chegando em uma ou duas frases (o som errado, a pedra que cede, o cheiro, o brilho no escuro) e PARE aí. Sem dano, sem salvaguarda, sem consequência: a palavra volta para mim e eu decido o que faço.
NÃO diga que eu tive sorte, NÃO se desminta com "na verdade não era nada" e NÃO resolva a armadilha. Ela continua ali, armada, e da próxima vez ela morde de verdade.`;
}

export function linhaDoAviso() { return "⚠ Alguma coisa está errada aqui — você ainda tem tempo."; }
