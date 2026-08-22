/* ============================================================
   O VILÃO (v9.83) — a nêmesis deixa de ser um medidor de ódio

   "O sistema nêmesis não será um gerador de inimigos, ele será o vilão.
   Ele não aparecerá mais na ficha do jogador — o jogador não precisa
   saber quem é seu nêmesis, porque quando o vilão aparecer, ele saberá,
   e não esquecerá."

   O QUE HAVIA. Um nome sorteado, um título sorteado, um motivo sorteado
   de uma lista de seis, e um número: `odio`, subindo de dois a cinco por
   dia até cem. Em 30, difamação; em 55, sabotagem; em 80, assassinos; em
   100, o confronto. Sempre nessa ordem, sempre nesse ritmo, em toda
   campanha que já existiu neste jogo.

   E o pior estava na tela: **"🎭 nêmesis: Sarna · ódio 42"**, num canto
   da ficha, desde o primeiro dia. O jogador conhecia o nome do inimigo
   antes de qualquer cena; via o ódio subir como quem vê um carregamento;
   e quando a pessoa enfim aparecia, já não havia revelação nenhuma para
   acontecer. O sistema entregava o final na primeira página.

   ------------------------------------------------------------
   O QUE UM VILÃO É, e nada disto é opinião — é o que as histórias que
   ficaram fazem, e o que os mestres desta casa ensinam:

   1. ELE QUER ALGUMA COISA, E ESTÁ GANHANDO. Um vilão sem projeto é um
      obstáculo. O plano avança com ou sem o herói, e o mundo sente cada
      etapa. Enquanto o herói não faz nada, o mundo piora.

   2. VOCÊ SENTE ANTES DE VER. A presença vem muito antes do rosto: um
      símbolo, um trabalho feito por outros, um nome que ninguém termina
      de dizer. Quem revela o vilão no primeiro ato não tem vilão — tem
      um inimigo de nível alto.

   3. ELE TEM RAZÃO, DO PONTO DE VISTA DELE. Todo vilão que ficou na
      memória é o herói da própria história. A crença dele precisa ser
      dizível numa frase que um bom sujeito quase assinaria.

   4. ELE TOCA NO QUE O HERÓI AMA. Ameaçar "o reino" é meteorologia.
      Ameaçar a pessoa cujo nome o jogador escreveu, a cidade que ele
      tomou, a promessa que ele fez — isso é vilania.

   5. ELE É ESPELHO. O que ele faz é o que o herói faria com um passo a
      mais. Por isso ele NASCE do registro do jogador: de como aquele
      jogador jogou, e não de um dado.

   6. ELE CUSTA ALGUMA COISA ANTES DE MORRER. Vilão derrubado de
      primeira é monstro com nome. Ele escapa, perde uma peça, volta
      diferente — e cada volta cobra.

   ------------------------------------------------------------
   A DIVISÃO, e é a da casa: o SISTEMA decide quem ele é, o que ele quer,
   em que fase está, o que ele toca e QUANDO age. A IA decide como aquilo
   se parece — a voz, o gesto, a cena. E há uma regra que ela não pode
   quebrar em fase nenhuma: **não dizer o nome antes da hora.**
   ============================================================ */

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ============================================================
   AS FASES — você sente antes de ver

   Cinco degraus, e o que muda entre eles não é o quanto o vilão bate: é
   o QUANTO O JOGADOR SABE. É essa escada que o medidor de ódio não
   tinha, e é ela que faz a revelação existir.
   ============================================================ */
import { corpoPorId, escolherCorpo, comoCai } from "./antagonista.js";

export const FASES = [
  {
    id: "rumor", nome: "O rumor", ordem: 0, revela: "nada",
    diz: "alguma coisa está acontecendo no mundo, e ninguém sabe de quem é",
    podeDizerNome: false, podeAparecer: false,
    porque: "o vilão começa como clima: colheitas que somem, gente que muda de lado, uma palavra que se repete em cidades que não se falam",
  },
  {
    id: "marca", nome: "A marca", ordem: 1, revela: "o símbolo",
    diz: "os acontecimentos passam a ter uma assinatura em comum",
    podeDizerNome: false, podeAparecer: false,
    porque: "é aqui que o jogador junta os pontos sozinho — e juntar sozinho vale dez vezes mais do que ser informado",
  },
  {
    id: "mao", nome: "A mão", ordem: 2, revela: "o método",
    diz: "gente dele age na sua frente, e sabe quem você é",
    podeDizerNome: false, podeAparecer: false,
    porque: "o vilão trabalha por outros muito antes de vir em pessoa; o herói conhece o punho antes do rosto",
  },
  {
    id: "rosto", nome: "O rosto", ordem: 3, revela: "o nome",
    diz: "ele se mostra, e não para lutar",
    podeDizerNome: true, podeAparecer: true, revelacao: true,
    porque: "o primeiro encontro NÃO é uma luta: é uma conversa, uma oferta ou uma demonstração. Quem luta com o vilão na estreia não tem clímax depois",
  },
  {
    id: "guerra", nome: "A guerra", ordem: 4, revela: "o plano",
    diz: "agora é entre vocês dois, e o mundo escolhe lado",
    podeDizerNome: true, podeAparecer: true,
    porque: "o plano fica visível e o herói pode atacá-lo — é onde a campanha vira uma disputa em vez de uma perseguição",
  },
  {
    id: "queda", nome: "A queda", ordem: 5, revela: "tudo",
    diz: "um dos dois não sai daqui",
    podeDizerNome: true, podeAparecer: true, final: true,
    porque: "o confronto só acontece depois de o vilão ter custado alguma coisa de verdade — senão é um chefe de fase com falas boas",
  },
];

export function faseDe(id) { return FASES.find((f) => f.id === id) || FASES[0]; }
export function proximaFase(id) {
  const i = FASES.findIndex((f) => f.id === id);
  return FASES[Math.min(FASES.length - 1, i + 1)];
}

/* ============================================================
   OS ARQUÉTIPOS — o vilão nasce de como VOCÊ jogou

   `nasceDe` lê o registro do herói. Não é enfeite: é a regra 5. Um
   jogador que resolveu tudo no aço atrai o Espelho; um que tomou
   cidades atrai o Herdeiro; um que desceu masmorras atrás de poder
   atrai o Faminto. O vilão de cada campanha é o retrato do jogador com
   um passo a mais.

   `crenca` é a frase que ele assinaria — e que um bom sujeito quase
   assinaria também. `quer` é o projeto: sem projeto não há vilão, há
   obstáculo.
   ============================================================ */
export const ARQUETIPOS = [
  {
    id: "espelho", nome: "O Espelho", peso: 3,
    nasceDe: (c) => (c.inimigosDerrotados || 0) >= 12,
    crenca: "a força é a única linguagem que o mundo entende de verdade — e ele fala melhor que você",
    metodo: "faz exatamente o que você faz, um passo além, e mostra o resultado ao mundo",
    quer: "provar que a diferença entre você e ele é só a coragem de ir até o fim",
    assinaturas: ["um corte limpo, do mesmo lado, em cada corpo", "a mesma arma sua, forjada de novo em ferro pior", "uma marca no chão onde você teria pisado"],
  },
  {
    id: "herdeiro", nome: "O Herdeiro", peso: 3,
    nasceDe: (c, s) => (s.dominios || 0) > 0,
    crenca: "o que você tomou nunca foi seu, e devolver é justiça — não vingança",
    metodo: "compra, casa, herda e processa; quando o papel não basta, incendeia o cartório",
    quer: "recuperar o que era da linhagem dele, cidade por cidade, com a lei do lado dele",
    assinaturas: ["um selo de cera partido ao meio", "documentos velhos aparecendo onde não deviam", "um brasão que ninguém daquela região reconhece"],
  },
  {
    id: "faminto", nome: "O Faminto", peso: 2,
    nasceDe: (c) => (c.masmorrasConcluidas || 0) >= 2 || (c.ascensoes || 0) > 0,
    crenca: "há poder enterrado no mundo, e deixá-lo enterrado é covardia, não virtude",
    metodo: "cava, abre o que estava selado e paga o preço com gente que não escolheu pagar",
    quer: "abrir a última porta — e ele já abriu quatro",
    assinaturas: ["escavações abandonadas com as ferramentas ainda no lugar", "selos quebrados por dentro", "aldeias inteiras sem uma alma e sem sinal de luta"],
  },
  {
    id: "zeloso", nome: "O Zeloso", peso: 2,
    nasceDe: (c) => (c.decretosPregados || 0) > 0 || (c.ascensoes || 0) > 0,
    crenca: "alguém precisa dizer não a você, e ninguém mais tem estômago para isso",
    metodo: "prega, organiza, transforma medo em fé e fé em exército",
    quer: "que o mundo escolha, em voz alta, entre você e a ordem — e sabe qual lado o medo escolhe",
    assinaturas: ["sermões idênticos em cidades distantes", "gente boa repetindo a mesma frase estranha", "uma vela acesa na porta de quem concordou"],
  },
  {
    id: "traido", nome: "O Traído", peso: 3,
    nasceDe: (c) => (c.recrutados || 0) > 0 || (c.contratosConcluidos || 0) >= 3,
    crenca: "você fez uma promessa e não pagou por ela; ele só está cobrando a conta que o mundo esqueceu",
    metodo: "chega pelas pessoas — as que confiam em você, as que trabalham para você, as que te devem",
    quer: "que você perca tudo do mesmo jeito que ele perdeu: de dentro, por gente conhecida",
    assinaturas: ["um objeto seu, perdido há tempo, devolvido sem bilhete", "conhecidos que param de olhar nos olhos", "uma dívida antiga quitada por mão desconhecida"],
  },
  {
    id: "arquiteto", nome: "O Arquiteto", peso: 2,
    nasceDe: () => true,
    crenca: "o mundo é mal construído, e consertá-lo exige derrubar antes — inclusive você",
    metodo: "não aparece: monta. Cada peça que ele move parece coincidência até a terceira",
    quer: "que a peça final caia no lugar, e ele já está na sétima de nove",
    assinaturas: ["coincidências boas demais para três cidades seguidas", "a mesma pessoa citada em dois lugares onde ela não esteve", "um mapa velho com marcas novas"],
  },
];

export function arquetipoPorId(id) { return ARQUETIPOS.find((a) => a.id === id) || ARQUETIPOS[ARQUETIPOS.length - 1]; }

/* ============================================================
   O PLANO — ele quer alguma coisa, e está ganhando

   Nove passos, e o mundo sente cada um. Isto é o que o medidor de ódio
   não era: `odio` subia e nada acontecia no mundo enquanto o número
   corria. Aqui cada avanço TIRA alguma coisa — e é por isso que o
   jogador tem motivo para atrapalhar antes de saber contra quem.

   O plano avança sozinho. Se o herói nunca interferir, ele chega ao
   fim, e o fim é uma coisa que muda o mapa.
   ============================================================ */
export const PASSOS_DO_PLANO = [
  { i: 0, diz: "juntar gente que não tinha para onde ir", custa: "sombra" },
  { i: 1, diz: "comprar o silêncio de quem podia avisar", custa: "voz" },
  { i: 2, diz: "tomar a primeira coisa que importa", custa: "lugar" },
  { i: 3, diz: "provar que ninguém vem salvar", custa: "esperanca" },
  { i: 4, diz: "virar o lado de alguém que era seu", custa: "gente" },
  { i: 5, diz: "cortar a estrada entre você e o que você protege", custa: "lugar" },
  { i: 6, diz: "fazer o mundo repetir a frase dele", custa: "voz" },
  { i: 7, diz: "pôr a mão no que você jurou guardar", custa: "gente" },
  { i: 8, diz: "acabar o que começou, à vista de todos", custa: "tudo" },
];

export const TOTAL_DE_PASSOS = PASSOS_DO_PLANO.length;

/* Quando o plano vira fase. A revelação do ROSTO não acontece no começo
   nem no fim: acontece quando o vilão já custou o suficiente para ser
   levado a sério, e cedo o bastante para haver campanha com ele. */
export const FASE_DO_PASSO = [0, 0, 1, 1, 2, 3, 4, 4, 5];

/* ============================================================
   O NASCIMENTO
   ============================================================ */
export function escolherArquetipo(cont = {}, stats = {}, sorte = Math.random) {
  const abertos = ARQUETIPOS.filter((a) => { try { return !!a.nasceDe(cont, stats); } catch { return false; } });
  const pool = abertos.length ? abertos : [arquetipoPorId("arquiteto")];
  const total = pool.reduce((n, a) => n + a.peso, 0);
  let corte = sorte() * total;
  return pool.find((a) => (corte -= a.peso) <= 0) || pool[0];
}

export function gerarVilao({ nome = "", cont = {}, stats = {}, dia = 0, sorte = Math.random } = {}) {
  /* v9.107: a ameaça nasce com um CORPO — pessoa, conselho, bando, coisa
     antiga ou instituição —, e ele muda o ritmo do plano e o que
     significa derrubá-la. */
  const corpo = escolherCorpo(sorte);
  const arq = escolherArquetipo(cont, stats, sorte);
  const assinatura = arq.assinaturas[Math.floor(sorte() * arq.assinaturas.length)] || arq.assinaturas[0];
  return {
    /* o que o resto do jogo já lê há versões — mantido de propósito, para
       que crônica, códex, conquistas e o arco não precisem saber que a
       peça inteira mudou por baixo */
    nome: String(nome || "").trim() || "Alguém",
    titulo: arq.nome,
    motivo: arq.crenca,
    status: "espreita",
    odio: 0,

    /* e o que faz dele um vilão */
    corpo,
    arquetipo: arq.id,
    crenca: arq.crenca,
    metodo: arq.metodo,
    quer: arq.quer,
    assinatura,
    fase: "rumor",
    passo: 0,
    /* O JOGADOR AINDA NÃO SABE. É este campo que a ficha respeitava
       errado: o nome existia na tela desde o primeiro dia. */
    conhecido: false,
    marcas: [],          // o que ele já tirou do herói, em ordem
    origemDia: dia,
  };
}

export function garantirVilao(v) {
  if (!v || typeof v !== "object" || !v.nome) return null;
  /* MIGRAÇÃO DA NÊMESIS ANTIGA: um save com `odio` e sem `fase` vira um
     vilão na fase correspondente ao ódio que ele já tinha. Ninguém perde
     a perseguição que já estava correndo. */
  if (!v.fase) {
    const passo = Math.max(0, Math.min(TOTAL_DE_PASSOS - 1, Math.round(((Number(v.odio) || 0) / 100) * (TOTAL_DE_PASSOS - 1))));
    const arq = ARQUETIPOS.find((a) => a.nome === v.titulo) || arquetipoPorId("arquiteto");
    return {
      ...v,
      arquetipo: arq.id, crenca: v.motivo || arq.crenca, metodo: arq.metodo, quer: arq.quer,
      assinatura: arq.assinaturas[0], passo,
      fase: FASES[FASE_DO_PASSO[passo]].id,
      conhecido: passo >= 4, marcas: [],
    };
  }
  return v;
}

/* ============================================================
   O AVANÇO — o plano anda, e o mundo sente

   Chamado uma vez por dia. Devolve `null` quase sempre: um vilão que se
   move todo dia é barulho, e barulho não assusta. Quando se move, ele
   TIRA alguma coisa — e o que ele tira sai do que o herói tem, não de
   uma lista de desgraças genéricas.
   ============================================================ */
/* ============================================================
   A HERANÇA (v9.90) — de onde vem o vilão do capítulo seguinte

   Um capítulo novo que começa sem antagonista, e depois ganha um gerado
   do zero pela fama, não é um capítulo: é uma sessão nova que por acaso
   usa o mesmo mapa. O que faz uma campanha ter CAPÍTULOS é a relação
   entre eles — e a relação mais forte que existe num jogo de herói é a
   que sobra de quem ele derrubou.

   Seis heranças, e nenhuma é "o irmão gêmeo do vilão". A regra que as
   organiza é: o novo antagonista não continua o plano do anterior — ele
   nasce do BURACO que a queda dele abriu, e esse buraco foi o herói quem
   fez. É a diferença entre uma sequência e uma consequência.

   `herdaCrenca` diz se a crença do morto sobrevive nele. Quando sobrevive,
   o jogador reencontra o argumento que já ouviu, na boca de alguém com
   outro rosto — e é aí que uma campanha começa a parecer uma só história.
   ============================================================ */
export const HERANCAS = [
  {
    id: "orfao", peso: 3, herdaCrenca: false,
    quem: "alguém que amava o que caiu",
    liga: (v) => `enterrou ${v} e nunca aceitou o motivo`,
    crenca: (v) => `${v} não era o monstro que contaram — e quem contou precisa pagar pela versão que virou verdade`,
    metodo: "não esconde de quem sabe: procura testemunhas, junta o que foi dito, e cobra uma por uma",
    quer: "que a história seja corrigida em praça pública, custe o que custar a quem a escreveu",
    porque: "é a herança mais humana das seis: quem sobra de um vilão morto quase nunca é outro vilão — é gente de luto, e luto com razão é mais perigoso que ambição",
  },
  {
    id: "herdeiro_do_plano", peso: 3, herdaCrenca: true,
    quem: "quem estava no plano e não foi pego",
    liga: (v) => `servia a ${v} e conhece cada peça que ficou no tabuleiro`,
    crenca: null,
    metodo: "retoma de onde parou, sem a vaidade que perdeu o antecessor — e sem os erros dele",
    quer: "terminar o que foi interrompido, agora com pressa e sem plateia",
    porque: "o único caso em que a crença sobrevive inteira, e por isso o mais desconfortável: o jogador ganhou a luta e não ganhou o argumento",
  },
  {
    id: "vazio", peso: 3, herdaCrenca: false,
    quem: "quem ocupou o lugar que ficou vago",
    liga: (v) => `tomou o que era de ${v} na semana seguinte à queda, sem disputa`,
    crenca: (v) => `o que ${v} construiu era bom demais para morrer com ele, e mal-usado demais nas mãos dele`,
    metodo: "administra: não conquista nada, apenas ocupa o que já estava de pé e faz funcionar melhor",
    quer: "que a máquina volte a girar, e que ninguém repare em quem está no leme",
    porque: "toda vitória do jogador é um vácuo, e o vácuo não fica vazio — foi ele quem esvaziou, e é essa a conta que volta",
  },
  {
    id: "aviso", peso: 2, herdaCrenca: false,
    quem: "aquilo de que ele avisava",
    liga: (v) => `é a coisa contra a qual ${v} passou a vida se preparando`,
    crenca: (v) => `ninguém no mundo está pronto, e ${v} era o único que sabia disso`,
    metodo: "não negocia porque não precisa: chega no ritmo dele, e o mundo é que se apressa",
    quer: "o que sempre quis, sem nunca ter dito a ninguém o que é",
    porque: "a mais cruel: o vilão anterior estava certo sobre uma coisa, e o herói matou o único que se preparava. A campanha reinterpreta o capítulo passado inteiro",
  },
  {
    id: "obra", peso: 2, herdaCrenca: true,
    quem: "o que ele deixou construído",
    liga: (v) => `é a coisa que ${v} pôs de pé, e que não parou quando ele parou`,
    crenca: null,
    metodo: "não tem rosto no começo: age por ofício, por contrato e por hábito, como uma instituição age",
    quer: "cumprir a função para a qual foi feita, sem ninguém no comando para mandar parar",
    porque: "mata a ideia de que derrubar o chefe resolve: o que ele montou tinha gente dentro, e gente dentro continua indo trabalhar",
  },
  {
    id: "caçador", peso: 2, herdaCrenca: false,
    quem: "quem veio atrás de quem o matou",
    liga: (v) => `recebeu a tarefa de encontrar quem derrubou ${v}`,
    crenca: (v) => `quem mata alguém como ${v} vira a próxima coisa a ser derrubada, e é melhor que seja cedo`,
    metodo: "estuda antes de aparecer: conhece o meu nome, os meus hábitos e a minha gente antes de eu saber que existe",
    quer: "provar que o herói e o monstro são o mesmo degrau da mesma escada",
    porque: "é o espelho, mas ganho: a fama do jogador virou o motivo, e essa é a única herança em que a culpa é inteiramente dele",
  },
];
export function herancaPorId(id) { return HERANCAS.find((h) => h.id === id) || null; }

export function escolherHeranca(sorte = Math.random) {
  const total = HERANCAS.reduce((n, h) => n + h.peso, 0);
  let corte = sorte() * total;
  return HERANCAS.find((h) => (corte -= h.peso) <= 0) || HERANCAS[0];
}

/* O herdeiro é um vilão COMPLETO — mesma forma, mesmo plano de nove
   passos, mesmas seis fases. O que muda é de onde vieram a crença, o
   método e o querer: em vez do arquétipo sorteado pelos feitos do herói,
   eles vêm da relação com o morto.

   O arquétipo continua sendo escolhido, e continua servindo: é dele que
   saem as ASSINATURAS, e a assinatura é o que o jogador junta sozinho na
   fase da marca. Um herdeiro sem assinatura própria seria reconhecido
   cedo demais — ou não seria reconhecido nunca. */
export function gerarHerdeiro(anterior, { nome = "", cont = {}, stats = {}, dia = 0, sorte = Math.random } = {}) {
  const base = gerarVilao({ nome, cont, stats, dia, sorte });
  if (!anterior || !anterior.nome) return base;
  const h = escolherHeranca(sorte);
  const morto = anterior.nome;
  return {
    ...base,
    heranca: h.id,
    veioDe: morto,
    veioDeTitulo: anterior.titulo || "",
    liga: h.liga(morto),
    crenca: h.herdaCrenca ? (anterior.crenca || base.crenca) : h.crenca(morto),
    motivo: h.herdaCrenca ? (anterior.crenca || base.crenca) : h.crenca(morto),
    metodo: h.metodo,
    quer: h.quer,
    /* as marcas do morto NÃO passam: elas são o que o herói perdeu para
       ELE, e herdá-las faria o novo cobrar uma conta que não é dele */
    marcas: [],
  };
}

/* O que o Mestre precisa saber na revelação de um herdeiro, e que o
   envelope comum não diz: que este não é um vilão novo, é uma
   consequência. Vai DENTRO do envelope da revelação, não em separado —
   duas vozes dizendo a mesma coisa é a coisa que esta casa mais evita. */
export function linhaDaHeranca(v) {
  if (!v || !v.heranca || !v.veioDe) return "";
  const h = herancaPorId(v.heranca);
  return ` E ele não veio do nada: ${h ? h.quem : "veio do que ficou"} — ${v.liga}. O jogador derrubou ${v.veioDe}, e é dessa queda que este nasceu: diga isso na cena, sem explicar a mecânica.`;
}

export const DIAS_POR_PASSO = 6;

/* v9.107: e o CORPO da ameaça multiplica esse número. Um conselho
   precisa concordar antes de agir; um bando não precisa de nada. É a
   primeira consequência mecânica de "um vilão pode ser um grupo de
   dragões ou um deus" — e é o que impede o corpo de ser só sabor. */
export function diasDoPasso(v) {
  const r = Number(corpoPorId(v && v.corpo).ritmo) || 1;
  return Math.max(2, Math.round(DIAS_POR_PASSO * r));
}

export function podeAvancar(v, { dia = 0 } = {}) {
  if (!v || v.status === "derrotada") return false;
  if (v.passo >= TOTAL_DE_PASSOS - 1) return false;
  return (dia - (v.ultimoPasso ?? v.origemDia ?? 0)) >= diasDoPasso(v);
}

export function avancarPlano(v, { dia = 0, alvo = null } = {}) {
  if (!v) return null;
  const passo = Math.min(TOTAL_DE_PASSOS - 1, (v.passo || 0) + 1);
  const p = PASSOS_DO_PLANO[passo];
  const faseNova = FASES[FASE_DO_PASSO[passo]];
  const mudouFase = faseNova.id !== v.fase;
  const novo = {
    ...v,
    passo, ultimoPasso: dia,
    fase: faseNova.id,
    status: passo >= 2 ? "ativa" : v.status,
    /* `odio` continua existindo porque o resto do jogo o lê; agora ele é
       o retrato do plano, e não um contador solto */
    odio: Math.round((passo / (TOTAL_DE_PASSOS - 1)) * 100),
    conhecido: v.conhecido || faseNova.ordem >= 3,
    /* ---------------- SEM REPETIR (v9.89) ----------------
       Era `[...marcas, alvo]` sem conferir nada, e `escolherAlvo` sorteia
       de uma lista curta: em 300 campanhas simuladas com um elenco
       realista, 300 terminaram com marca repetida. O envelope da revelação
       — o momento único da campanha — saía dizendo à IA "o que ele já me
       tirou: Marta, Marta, Marta", o que não é uma lista de perdas: é um
       defeito de contagem contado como ficção.

       Aqui só se guarda o que ainda não está guardado. Quem já foi tirado
       não pode ser tirado de novo. */
    marcas: alvo && !(v.marcas || []).some((m) => m && m.nome === alvo.nome)
      ? [...(v.marcas || []), alvo].slice(-8)
      : (v.marcas || []),
  };
  return { vilao: novo, passo: p, fase: faseNova, mudouFase, alvo, revelacao: mudouFase && !!faseNova.revelacao };
}

/* ============================================================
   O QUE ELE TOCA — regra 4

   Ameaçar "o reino" é meteorologia. O vilão precisa pôr a mão no que o
   jogador escreveu: a pessoa que ele conheceu, a cidade que ele tomou,
   a promessa que ele fez. O sistema ESCOLHE entre o que existe; nunca
   inventa um alvo, pela mesma razão de sempre.
   ============================================================ */
export const TIPOS_DE_ALVO = [
  { custa: "gente", campo: "pessoas", ordem: ["pessoas", "promessas", "lugares"], comoDoi: "alguém que você conhece" },
  { custa: "lugar", campo: "lugares", ordem: ["lugares", "pessoas", "promessas"], comoDoi: "um lugar que é seu" },
  { custa: "voz", campo: "promessas", ordem: ["promessas", "pessoas", "lugares"], comoDoi: "algo que você prometeu" },
];
export const ORDEM_PADRAO = ["pessoas", "lugares", "promessas"];

/* v9.85: esta função repetia a ordem À MÃO, num encadeado de ternários, e
   nunca olhava para a tabela logo acima. A tabela ficou escrita e nunca
   usada — e com ela o `comoDoi`, que é o campo que diz ao Mestre QUE
   ESPÉCIE DE FERIDA aquele alvo é. O envelope mandava só o nome cru, e
   "ele pôs a mão em Marta" e "ele pôs a mão em Vale Torto" chegavam à IA
   sem nenhuma diferença de peso.

   Achado pela varredura de regras sem leitor. É a mesma doença do
   `m.ativa` e do `npcs[cidade].gente`, no estágio anterior: aqui a
   tabela nem chegou a ser lida errado — nunca foi lida. */
export function tipoDoAlvo(custa) { return TIPOS_DE_ALVO.find((t) => t.custa === custa) || null; }

/* `jaMarcados` (v9.89) entra porque deduplicar na entrada não bastava:
   sem isto o vilão continuaria SORTEANDO quem ele já levou, e o passo
   simplesmente não registraria nada — ele daria um passo no vazio, que é
   pior que repetir, porque some sem deixar rastro. Quem já foi tirado sai
   do sorteio; se todos já saíram, a lista volta inteira, porque um alvo
   repetido ainda é melhor que passo nenhum. */
export function escolherAlvo(custa, ctx = {}, sorte = Math.random, jaMarcados = []) {
  const t = tipoDoAlvo(custa);
  const ordem = t ? t.ordem : ORDEM_PADRAO;
  const usados = new Set((jaMarcados || []).map((m) => m && m.nome).filter(Boolean));
  for (const campo of ordem) {
    const todos = (ctx[campo] || []).filter(Boolean);
    const livres = todos.filter((x) => !usados.has(String(x)));
    const lista = livres.length ? livres : todos;
    if (lista.length) {
      const t2 = TIPOS_DE_ALVO.find((x) => x.campo === campo);
      return { campo, nome: String(lista[Math.floor(sorte() * lista.length)]), comoDoi: t2 ? t2.comoDoi : "" };
    }
  }
  return null;
}

/* ============================================================
   O QUE O JOGADOR VÊ — e o que ele NÃO vê

   Nada na ficha. Nunca. O vilão chega pela ficção, e só.

   As linhas abaixo existem para os DOIS momentos em que o sistema tem
   de falar com o jogador em voz de sistema: a revelação (porque ela é
   um marco da campanha, e o jogador precisa saber que aquilo acabou de
   acontecer) e a queda. Nas outras fases o sistema fica calado e deixa
   a cena falar.
   ============================================================ */
export function linhaDoAvanco(r) {
  if (!r) return "";
  if (r.revelacao) return `🎭 Você sabe quem é. ${r.vilao.nome}, ${r.vilao.titulo}.`;
  if (r.fase.final) return `🎭 ${r.vilao.nome} não está mais escondido. Isto termina de um jeito só.`;
  return "";
}

/* ============================================================
   O QUE O MESTRE RECEBE

   Um envelope por avanço, e a regra dura de cada fase vai dentro dele.
   A mais importante é a mesma em todas as três primeiras: **não diga o
   nome.** Uma IA que revela o vilão porque a cena ficaria mais
   interessante destrói o único momento que não dá para refazer.
   ============================================================ */
/* ---------------- ONDE A FORMA NÃO ENTRA (v9.89) ----------------
   A revelação e a queda são os dois envelopes que já vêm COMPOSTOS: eles
   dizem a cena inteira ("não é uma luta", "dê a ele a melhor fala da
   campanha", "monte o confronto como clímax"). O Bibliotecário grampeava
   uma forma sorteada em cima dos dois, e entre as cento e quarenta
   possíveis havia oito que mandam o oposto — "quem fala nesta cena fala
   POUCO", "ninguém responde", "alguém é interrompido antes de terminar".

   Uma delas na revelação estraga o único momento da campanha que não
   acontece duas vezes. Nas outras fases a forma continua entrando: lá o
   envelope diz o QUE, e a forma diz o COMO, que é a divisão inteira. */
export function levaForma(r) {
  return !!r && !r.revelacao && !(r.fase && r.fase.final);
}

export function envelopeDoAvanco(r) {
  if (!r || !r.vilao) return "";
  const v = r.vilao;
  /* v9.85: o `comoDoi` entra aqui, que é o lugar para o qual ele foi
     escrito. Sem ele o envelope mandava um nome cru, e a IA não tinha como
     saber se aquilo era gente, chão ou palavra dada — três feridas de
     tamanhos muito diferentes. */
  const alvo = r.alvo ? ` Desta vez ele pôs a mão em ${r.alvo.comoDoi ? r.alvo.comoDoi + ": " : ""}${r.alvo.nome}.` : "";
  const passo = `O que ele fez agora: ${r.passo.diz}.`;

  if (v.fase === "rumor") {
    return `[O MUNDO PIORA — MOVIMENTO DO SISTEMA] ${passo}${alvo} Ninguém sabe de quem é a mão por trás disso, e eu MENOS AINDA.
REGRA DESTE ENVELOPE (obrigatória): mostre isto como CLIMA, em duas ou três frases entrelaçadas na cena — o que sumiu, quem mudou de lado, o que as pessoas repetem sem saber por quê. NÃO nomeie ninguém, NÃO diga que há alguém por trás, NÃO use as palavras "vilão", "inimigo" ou "nêmesis", e NÃO deixe um NPC explicar a coisa toda. O jogador tem de sentir sem entender.`;
  }
  if (v.fase === "marca") {
    return `[A ASSINATURA — MOVIMENTO DO SISTEMA] ${passo}${alvo} E há uma coisa em comum entre isto e o que já aconteceu antes: ${v.assinatura}.
REGRA DESTE ENVELOPE (obrigatória): faça a assinatura aparecer, sem apontá-la. Uma frase que o jogador vai reler depois. NÃO diga que é um padrão, NÃO nomeie ninguém, NÃO use as palavras "vilão", "inimigo" ou "nêmesis", e NÃO deixe personagem nenhum tirar a conclusão — juntar os pontos é o prazer dele, e entregá-lo pronto é roubar a cena que ainda vai acontecer.`;
  }
  if (v.fase === "mao") {
    return `[A MÃO DELE — MOVIMENTO DO SISTEMA] ${passo}${alvo} Agora gente a serviço dele age na minha frente, e essa gente SABE quem eu sou.
REGRA DESTE ENVELOPE (obrigatória): traga alguém que trabalha para ele — um capanga, um comprado, um convertido — e faça ficar claro que a pessoa recebeu ordens sobre MIM. Ela pode ameaçar, negociar ou avisar. NÃO diga o nome de quem manda: ela não diz, e se eu perguntar, ela tem medo demais para responder. E não use as palavras "vilão" nem "nêmesis" — quem fala assim é sistema, não é gente numa cena. Se virar luta, quem abre o combate é o sistema.`;
  }
  if (v.fase === "rosto" && r.revelacao) {
    return `[A REVELAÇÃO — MOMENTO ÚNICO DA CAMPANHA] Ele se mostra. Nome: ${v.nome}. Título: ${v.titulo}. O que ele acredita: ${v.crenca}. O que ele quer: ${v.quer}. Como trabalha: ${v.metodo}.${v.marcas && v.marcas.length ? ` O que ele já me tirou: ${v.marcas.map((m) => m.nome).join(", ")}.` : ""}
REGRA DESTE ENVELOPE (obrigatória): esta cena NÃO É UMA LUTA. Ele aparece para conversar, oferecer, demonstrar ou cobrar — e vai embora inteiro. Dê a ele a melhor fala da campanha até aqui: alguém que acredita no que diz, que sabe o meu nome e o que eu fiz, e que não precisa levantar a voz. NÃO abra combate, NÃO o faça ameaçar como capanga, NÃO o mate e NÃO me deixe matá-lo aqui — o sistema não vai permitir que isto termine hoje.
E a partir de agora ele existe com nome: use SEMPRE este nome, esta crença e este método. Ele não muda de ideia entre as cenas.`;
  }
  if (v.fase === "guerra") {
    return `[A GUERRA — MOVIMENTO DO SISTEMA] ${passo}${alvo} ${v.nome} já não se esconde: o plano dele está à vista, e o mundo está escolhendo lado.
REGRA DESTE ENVELOPE (obrigatória): mostre o plano avançando de um jeito que EU POSSA ATACAR — um lugar, uma pessoa, uma data. É isso que transforma perseguição em disputa. Ele age pelos dele e aparece quando quer; se aparecer, continua sem morrer hoje. NÃO invente uma etapa que o sistema não anunciou e NÃO resolva o conflito por conta própria.`;
  }
  return `[A QUEDA — O SISTEMA ABRE O FIM] ${v.nome} chegou ao último passo: ${r.passo.diz}. Não há mais o que preparar.
REGRA DESTE ENVELOPE (obrigatória): monte o confronto como clímax — o lugar certo, as testemunhas certas, o que está em jogo dito em voz alta. Ele pode morrer nesta cena, e eu também. Quando a luta abrir, quem a abre é o sistema; quando alguém cair, quem decide é o dado. NÃO o faça fugir de novo e NÃO invente um plano póstumo: se ele cair, acabou.`;
}

/* O que sobe ao prompt em TODO turno enquanto o vilão está vivo. É curto
   de propósito, e o que ele mais faz é PROIBIR — porque a coisa mais
   cara que a IA pode fazer aqui é dizer o nome antes da hora. */
export function resumoVilaoPrompt(v) {
  if (!v || v.status === "derrotada") return "";
  const f = faseDe(v.fase);
  if (!v.conhecido) {
    return `SOMBRA NO MUNDO (fato do sistema): há alguém por trás do que vem dando errado, e o herói NÃO SABE QUEM, nem que existe alguém. Fase: ${f.nome.toLowerCase()}. NUNCA nomeie essa pessoa, nunca diga que ela existe, nunca deixe um NPC revelá-la e nunca use as palavras "vilão" ou "nêmesis". Quando for a hora, o sistema manda a revelação num envelope.`;
  }
  return `O VILÃO (fato do sistema): ${v.nome}, ${v.titulo}. Acredita que ${v.crenca}. Quer ${v.quer}. Trabalha assim: ${v.metodo}. Fase: ${f.nome.toLowerCase()} — ${f.diz}. O plano dele avança por conta do sistema; NÃO invente etapas, NÃO o mate e NÃO o faça desistir sem envelope.`;
}

/* ============================================================
   A QUEDA — e o preço de tê-lo enfrentado
   ============================================================ */
export function podeCair(v) {
  return !!v && v.status !== "derrotada" && faseDe(v.fase).final === true;
}

export function envelopeDaQuedaCedoDemais(v) {
  if (!v) return "";
  return `[O VILÃO NÃO CAI HOJE — DECISÃO DO SISTEMA] Você narrou o fim de ${v.nome}, e não é o fim: ele ainda está na fase "${faseDe(v.fase).nome.toLowerCase()}", e o que ele me custou até agora não paga um desfecho.
REGRA DESTE ENVELOPE (obrigatória): ele ESCAPA, e escapa custando alguma coisa — uma peça dele fica para trás, um plano dele atrasa, alguém que estava com ele morre no lugar. Mostre isso e siga. NÃO diga que ele morreu, NÃO o substitua por um sucessor e NÃO finja que a cena não aconteceu: aconteceu, e ele vai lembrar.`;
}

export function envelopeDaQueda(v, causa = "") {
  if (!v) return "";
  /* v9.107: A QUEDA TEM A FORMA DO CORPO. Este envelope afirmava "está
     morto" para qualquer ameaça, e o texto só servia a uma pessoa. Um
     conselho não morre inteiro; uma instituição não tem quem matar; uma
     coisa antiga não se mata assim. Dizer "morto" para as cinco formas
     era o sistema empurrando quatro mundos para dentro de um. */
  const c = comoCai(v.corpo);
  const cab = c.sobrevive
    ? `[A AMEAÇA CAIU — CANON E IRREVERSÍVEL] Quem estava na frente de ${v.nome} caiu${causa ? ` — ${causa}` : ""}, e ${c.queda}.`
    : `[O VILÃO CAIU — CANON E IRREVERSÍVEL] ${v.nome}, ${v.titulo}, está morto${causa ? ` — ${causa}` : ""}. O plano dele parou onde estava, e o que ele tomou fica tomado até alguém retomar.`;
  return `${cab}
REGRA DESTE ENVELOPE (obrigatória): narre o fim e, na mesma cena, o que ele DEIXOU — gente que acreditava nele e agora não tem no que acreditar, um lugar que continua nas mãos dele mesmo depois de morto, uma frase dele que as pessoas ainda repetem. NÃO invente um sucessor, NÃO diga que "havia um plano maior" e NÃO o ressuscite de forma nenhuma.${c.sobrevive ? " E NÃO trate isto como o fim de tudo: o que sobra continua, e continua sabendo o que aconteceu." : " Ele acabou; o rastro, não."}`;
}

export function linhaDaQueda(v) {
  return v ? `🕊 ${v.nome}, ${v.titulo}, caiu. O que ele começou continua onde parou.` : "";
}

/* Serve ao teste e a quem quiser auditar: a fase nunca anda para trás e
   o nome nunca aparece antes do rosto. */
export function ehCoerente(v) {
  if (!v) return true;
  const f = faseDe(v.fase);
  if (v.conhecido && f.ordem < 3) return false;
  if (!v.conhecido && f.ordem >= 3) return false;
  return FASE_DO_PASSO[v.passo] === f.ordem;
}
