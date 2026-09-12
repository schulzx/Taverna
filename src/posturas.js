/* ============================================================
   AS POSTURAS DO MUNDO (v9.206) — a mesma ação, outro resultado

   A gordura, recalibrada: em vez de estruturas novas para o jogador
   escolher (mais menu, mais confusão), sub-estruturas que o SISTEMA
   aciona lendo o momento da história. A postura é o jeito como o mundo
   se porta diante do herói agora: no ápice os inimigos ficam receosos;
   na crise, se aproveitam.

   ---------------- DERIVADA, NUNCA SORTEADA, NUNCA ANUNCIADA ----------

   A postura sai de leituras que os órgãos JÁ fazem — o Termômetro
   (afoga/passeia), o arco (etapa), a fama (patamar), o vilão (fase), o
   peso recente, o mundo (relógio, guerra, estação). Uma tabela de
   precedência, como as TEMPERATURAS de mestria.js: a primeira que casa
   vence, e a ordem é o conteúdo. O jogador NUNCA lê o nome da postura —
   ele sente pelo capanga que ri em vez de recuar. Só o console de autor
   vê o rótulo (quinta lei da casa: o sistema não fala de si mesmo).

   ---------------- TEMPERA, NÃO DECIDE ----------------

   A postura não cria acontecimento — cria REAÇÃO. Ela preenche oito
   botões, e cada botão tempera a tabela de um sistema que já decide:
   inimigos (adversario), gente e portas (índole/social), poderosos,
   mercado (preços), oráculo (modificador), encontros, sementes (Livro).
   Aqui em G1 só o primeiro botão tem consumidor vivo — o adversário, via
   `moralDoInimigo`. Os outros sete são referência até o G3 chamá-los.

   ---------------- HISTERESE ----------------

   Postura tem permanência mínima: o mundo não vira casaca a cada turno.
   Uma vitória isolada na Crise não vira Ápice — vira alívio dentro da
   Crise. `derivarPostura` só troca quando a permanência da atual vence,
   ou quando a nova é mais grave (precedência menor) que a atual.

   Conta se prova, tela se olha: o módulo deriva e configura; o App monta
   as leituras dos refs e aplica o botão de cada sistema.
   ============================================================ */

/* ---------------- OS OITO BOTÕES ----------------
   O contrato que toda postura preenche. Referência para os consumidores;
   o texto é o que TEMPERA a tabela de cada um, nunca uma ordem à IA. */
export const BOTOES = ["inimigos", "gente", "poderosos", "mercado", "oraculo", "encontros", "portas", "sementes"];

/* ---------------- AS 12 POSTURAS, EM ORDEM DE PRECEDÊNCIA ----------------
   A primeira cujo `quando(l)` casa vence. `moral` é o viés que o
   adversário lê: negativo = inimigos receosos (rendem, fogem de luta
   justa); positivo = inimigos ousados (pressionam o ferido, exigem
   mais). `dias` é a permanência mínima. */
const P = (id, nome, dias, moral, quando, config) => ({ id, nome, dias, moral, quando, config });

export const POSTURAS = [
  P("luto", "O Luto", 2, -1,
    (l) => l.pesoRecente === "luto",
    { inimigos: "os menores dão trégua ou golpe covarde conforme a índole; ninguém busca o herói de frente",
      gente: "o mundo abaixa a voz; quem tem laço comparece", poderosos: "condolências protocolares, nenhuma cobrança em público",
      mercado: "não procura o herói; coveiro e carpinteiro não abusam", oraculo: "compaixão ganha um degrau; barganha fria perde um",
      encontros: "a estrada respeita: hostis raros, viajantes silenciosos", portas: "convites cessam; a porta de quem amava o morto abre",
      sementes: "o Livro não planta — semear no velório é desperdício" }),

  P("cacada", "A Caçada", 3, 0,
    (l) => l.heroiAlvoDoVilao,
    { inimigos: "vêm preparados PARA você: contra-medidas ao seu método conhecido",
      gente: "silêncio quando você entra; o informante pede lugar fechado", poderosos: "neutralidade calculada — ninguém quer estar do lado errado",
      mercado: "atende rápido, para você sair logo", oraculo: "disfarce e anonimato perdem um degrau; aliado de confiança ganha um",
      encontros: "olheiros na estrada — o encontro que só OLHA e parte", portas: "o quarto está cheio; a dos que devem favor abre pelos fundos",
      sementes: "rega as do vilão e da reviravolta — a vigilância é feita de sinais" }),

  P("crise", "A Crise", 2, +3,
    (l) => l.termometro === "afogando" || l.derrotasComFama,
    { inimigos: "se aproveitam: perseguem quem recua, emboscam feridos, exigem mais na rendição",
      gente: "a fé curta some; o humilde ajuda escondido", poderosos: "cobram agora o que esperariam meses; convites viram intimações",
      mercado: "compra teu espólio por menos; o penhor aparece como solução", oraculo: "crédito e favor perdem um degrau; apelar à piedade ganha um",
      encontros: "abutres: batedores escolhem alvos mancando", portas: "as douradas fecham; as de madeira abrem",
      sementes: "a mão estendida: a ajuda que chega TEM dono e preço, e vira semente" }),

  P("vespera", "A Véspera", 1, 0,
    (l) => l.relogioAlto || l.guerraIminente,
    { inimigos: "apressados: aceitam riscos que não aceitariam — o prazo corre para eles também",
      gente: "todo mundo pergunta de que lado você está", poderosos: "recrutam: propostas com prazo, generosas demais para serem limpas",
      mercado: "preço de pânico; sal, ferro e cura somem", oraculo: "o que depende de burocracia perde um degrau",
      encontros: "colunas de gente saindo, patrulhas nervosas", portas: "audiências rápidas: o poder recebe quem prometer ajudar",
      sementes: "planta as de guerra — posto sem guarda, preço estranho" }),

  P("sombra", "A Sombra", 2, +2,
    (l) => l.faseVilao >= 2 && !l.rostoCaiu,
    { inimigos: "ousados sem saber por quê: alguém limpa o caminho deles por baixo",
      gente: "medo sem nome: portas trancadas cedo, boato de todo canto", poderosos: "negam o problema em público; em particular, perguntam o que você sabe",
      mercado: "alguém compra quieto o que sustenta um plano", oraculo: "descobrir e investigar ganham um degrau; confiar em estranho perde um",
      encontros: "sinais: a carroça de madrugada, a fumaça na ruína", portas: "quem sabe de algo se aproxima, com medo, aos pedaços",
      sementes: "rega as do vilão em dobro: a Sombra é a estação de crescimento dele" }),

  P("suspeita", "A Suspeita", 2, +2,
    (l) => l.pesoRecente === "vergonha" || l.famaCaiu,
    { inimigos: "zombam antes de lutar — subestimar volta, agora por desprezo",
      gente: "cochichos que param quando você chega; a versão errada corre mais", poderosos: "exigem garantias e testemunhas; o contrato ganha cláusulas",
      mercado: "fiado morreu; adiantamento só com penhor", oraculo: "persuadir e inspirar perdem um degrau; provar por ATO ganha dois",
      encontros: "a guarda faz a mesma rota que você", portas: "fecham as da frente; abre a de quem já foi injustiçado",
      sementes: "planta a da redenção: o feito que limparia o nome existe" }),

  P("festa", "A Festa", 1, -1,
    (l) => l.pesoRecente === "gloria",
    { inimigos: "somem das ruas — hoje não; os espertos usam a festa para agir onde ninguém olha",
      gente: "brindes, canções com teu nome (metade errada), abraços de estranhos", poderosos: "querem estar no teu retrato: honras públicas, promessas de praça",
      mercado: "desconto de gratidão hoje — e amanhã o dobro de pedidos", oraculo: "quase tudo social ganha um degrau; discrição é impossível",
      encontros: "peregrinos chegando para VER você; impostores usando teu nome", portas: "escancaradas, inclusive as que não deviam: é o dia de pedir o absurdo",
      sementes: "planta rápido e raso: na multidão todo sinal passa, e paga barato" }),

  P("apice", "O Ápice", 3, -3,
    (l) => (l.termometro === "folgado" || l.termometro === "passeando") && l.famaAlta,
    { inimigos: "receosos: rendem-se mais cedo, fogem de luta justa, só atacam com vantagem clara ou reforço",
      gente: "bajulação, pedidos, crianças imitando teu gesto", poderosos: "cortejam E vigiam: um herói grande demais é um problema de Estado",
      mercado: "o preço de herói: tudo sobe para quem pode pagar", oraculo: "portas sociais ganham um degrau; passar despercebido perde dois",
      encontros: "caçadores de fama: o duelista que quer o teu nome no cartaz dele", portas: "todas abertas — e cada uma cobra presença",
      sementes: "planta a da inveja e o preço da onda cobra de verdade" }),

  P("escassez", "A Escassez", 6, +1,
    (l) => l.estacaoDura || l.posGuerra,
    { inimigos: "desesperados, não maus: o bandido que rouba comida e pede desculpa",
      gente: "dura e grata: pouco vira muito", poderosos: "racionam e taxam; a caridade do herói os envergonha",
      mercado: "comida e lenha caras; supérfluo encalhado", oraculo: "apelo à solidariedade perde um degrau; troca justa ganha um",
      encontros: "refugiados, lobos perto das casas, a caravana que não chegou", portas: "abrem para quem traz — comida compra o que ouro não compra",
      sementes: "planta as de dívida e favor: o inverno escreve as contas da primavera" }),

  P("promessa", "A Promessa", 2, +1,
    (l) => l.famaSubiuRecente && l.arcoNoInicio,
    { inimigos: "te TESTAM: o capanga que provoca para medir, e reporta a alguém",
      gente: "curiosidade: é ele? — pedidos pequenos para ver se o boato é verdade", poderosos: "o primeiro olheiro: alguém importante mandou perguntar quem você é",
      mercado: "o primeiro fiado, pequeno, para ver se você honra", oraculo: "neutro: o mundo ainda decide o que você é",
      encontros: "rivais da mesma estatura, medindo", portas: "entreabertas: entra quem prova, e a prova aparece",
      sementes: "planta as de origem: alguém do teu passado ouviu teu nome" }),

  P("bonanca", "A Bonança", 2, 0,
    (l) => l.termometro === "passeando" && l.semRelogio,
    { inimigos: "não há — o que há é disputa mesquinha: a briga de vizinhos que sobra para você",
      gente: "fofoca, festivais, casamentos, apostas — o mundo em tamanho pequeno", poderosos: "política de salão: jantares onde tudo se decide de lado",
      mercado: "farto e criativo: o item curioso aparece na prateleira", oraculo: "lazer e social ganham um degrau; urgência não existe",
      encontros: "mascates, circo, um casamento na estrada — e UM sinal deslocado no meio", portas: "todas, sem cerimônia: é quando se conhece gente de verdade",
      sementes: "a prateleira pesada: é aqui que o Livro rega melhor, e a próxima onda nasce um degrau acima" }),

  P("anonimato", "O Anonimato", 1, +2,
    () => true,
    { inimigos: "te subestimam: não fogem, não pedem reforço, atacam desorganizados",
      gente: "indiferença honesta: você é mais um viajante de botas gastas", poderosos: "não recebem: fale com o secretário do secretário",
      mercado: "preço de tabela, fiado nunca", oraculo: "passar despercebido ganha dois degraus",
      encontros: "a tabela normal do mundo, sem ajuste", portas: "fechadas por padrão; cada uma aberta é conquista",
      sementes: "planta fundo: ninguém repara em você, logo você repara em tudo" }),
];

export const posturaPorId = (id) => POSTURAS.find((p) => p.id === id) || null;

/* ---------------- A DERIVAÇÃO ----------------
   Corre a tabela e devolve a primeira postura que casa. Sem leituras,
   cai no Anonimato — a padrão, que sempre casa. */
export function posturaCrua(leituras) {
  const l = leituras && typeof leituras === "object" ? leituras : {};
  for (const p of POSTURAS) {
    let bate = false;
    try { bate = !!p.quando(l); } catch { bate = false; }
    if (bate) return p;
  }
  return posturaPorId("anonimato");
}

/* o índice na tabela é a gravidade: menor = mais grave (vence antes). */
export function gravidadeDe(id) {
  const i = POSTURAS.findIndex((p) => p.id === id);
  return i < 0 ? POSTURAS.length : i;
}

/* ---------------- O ESTADO SALVO ---------------- */
export function garantirPosturaAtiva(a) {
  const o = a && typeof a === "object" ? a : {};
  const id = posturaPorId(o.postura) ? o.postura : "anonimato";
  const n = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d);
  return { postura: id, desde: Math.max(0, n(o.desde, 0)) };
}

/* ---------------- A HISTERESE ----------------
   Deriva a postura CRUA das leituras e decide se a ativa troca. Troca
   quando: (a) a crua é MAIS GRAVE que a atual (uma desgraça não espera
   permanência — o luto interrompe a bonança na hora); ou (b) a atual já
   cumpriu a permanência mínima. Senão, a atual fica. Assim uma vitória
   isolada na Crise não vira Ápice antes da hora. */
export function derivarPostura(ativa, leituras, { dia = 0 } = {}) {
  const at = garantirPosturaAtiva(ativa);
  const crua = posturaCrua(leituras);
  if (crua.id === at.postura) return { ...at, mudou: false, postura: at.postura };
  const atual = posturaPorId(at.postura);
  const maisGrave = gravidadeDe(crua.id) < gravidadeDe(at.postura);
  const cumpriuPermanencia = dia - at.desde >= (atual ? atual.dias : 1);
  if (maisGrave || cumpriuPermanencia) {
    return { postura: crua.id, desde: dia, mudou: true, de: at.postura };
  }
  return { ...at, mudou: false, postura: at.postura };
}

/* ---------------- O QUE OS CONSUMIDORES LEEM ---------------- */
export function moralDoInimigo(posturaId) {
  const p = posturaPorId(posturaId);
  return p ? p.moral : 0;
}
export function configDaPostura(posturaId) {
  const p = posturaPorId(posturaId);
  return p ? { ...p.config } : null;
}
export function botaoDaPostura(posturaId, botao) {
  const p = posturaPorId(posturaId);
  return p && p.config[botao] ? p.config[botao] : "";
}

/* ---------------- PARA O CONSOLE DE AUTOR ----------------
   O rótulo e o viés — nunca vai à tela do jogador. */
export function resumoDaPostura(ativa) {
  const at = garantirPosturaAtiva(ativa);
  const p = posturaPorId(at.postura);
  return { postura: at.postura, nome: p ? p.nome : "", moral: p ? p.moral : 0, desde: at.desde };
}
