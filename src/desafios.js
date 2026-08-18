/* ============================================================
   DESAFIOS (v9.59) — o obstáculo decide o teste, não o pedido

   O relato veio com quatro capturas de tela: o herói no quarto de
   cima do Corvo das Três Luas pedindo Percepção seis vezes seguidas.
   Duas primeiras pagaram 168 e 180 moedas. As quatro seguintes
   bateram contra dificuldade 17 e o Mestre teve de narrar o vazio,
   uma vez atrás da outra, cada vez com outras palavras.

   "Se eu ficar pedindo testes infinitamente ele vai me dar testes
   infinitamente, mesmo que não tenha nada nem lógica."

   Três coisas estavam trocadas, e as três são a mesma coisa vista de
   ângulos diferentes: O SISTEMA NÃO SABIA CONTRA O QUE SE ESTAVA
   ROLANDO.

   1) A DIFICULDADE ERA SOBRE O HERÓI. A conta antiga era
      `12 + combate + masmorra + ameaça + nível/6`. Isso descreve o
      patamar de quem rola, não o obstáculo. Por isso o quarto virou
      17 e ficou 17 para sempre, mesmo depois de esvaziado: o número
      nunca falou do quarto.

   2) NÃO HAVIA MEMÓRIA. Nada registrava que aquele quarto já tinha
      sido revirado. Numa mesa o mestre diz "você já vasculhou aqui" —
      e essa frase é meia regra do jogo.

   3) QUEM PEDIA ERA O JOGADOR. Numa mesa de verdade o jogador
      declara uma AÇÃO — "presto atenção na taverna", "tento abrir a
      porta à força" — e quem decide se aquilo pede dado é o mestre.
      Pedir "um teste de Percepção" é pedir o dado direto, pulando a
      parte em que se descobre se havia o que rolar.

   ESTE ARQUIVO INVERTE A ORDEM. A frase do jogador entra; sai um
   VEREDICTO sobre o que ela é:

     livre       — dá para fazer, e falhar não significaria nada.
                   Não se rola. Abrir uma porta destrancada é abrir.
     teste       — há chance real de falhar E falhar custa algo.
                   Estas são as duas condições da mesa, e as duas
                   precisam valer: sem risco não há dado, sem
                   consequência também não.
     impossivel  — não dá do jeito declarado. E o sistema DIZ o que
                   daria: sem gazua e sem força não se abre a porta,
                   mas com magia sim.
     jaTentou    — mesmo obstáculo, mesma abordagem, nada mudou.
     vasculhado  — este lugar já foi revirado até o fim.

   E o que reabre um obstáculo fechado está escrito, não é sentimento:
   outra ABORDAGEM (força no lugar da gazua), FERRAMENTA que não se
   tinha, AJUDA de alguém, ou TEMPO declarado de sobra. É a regra da
   mesa — "só se algo mudar" — com o "algo" enumerado.
   ============================================================ */

import { rngDe } from "./geografia.js";
import { periciaPorId } from "./pericias.js";
import { detectarPedidoDeTeste, semOPedidoDeTeste } from "./testes.js";
import { dificuldadeSocial, foraDaConversa, envelopeForaDaConversa } from "./social.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ============================================================
   OS TRÊS TIPOS DE ROLAGEM

   Numa mesa existem três, e a diferença entre elas não é de sabor:
   é de QUEM começa. O jogador declara a perícia e o ataque; a
   salvaguarda acontece CONTRA ele, e por isso ninguém a pede — o
   mundo é que a dispara. Confundir as duas primeiras com a terceira
   é como o jogador acaba "pedindo para resistir ao veneno".
   ============================================================ */
export const TIPOS_DE_ROLAGEM = [
  { id: "pericia", nome: "Teste de perícia", quem: "o herói tenta fazer algo", pede: "o jogador declara a ação; o sistema decide se pede dado" },
  { id: "salvaguarda", nome: "Salvaguarda", quem: "algo acontece contra o herói", pede: "SÓ o sistema dispara — veneno, queda, armadilha, encanto. Nunca se pede uma." },
  { id: "ataque", nome: "Jogada de ataque", quem: "o herói acerta ou erra", pede: "nasce da ação de combate, e mora no tabuleiro" },
];

/* ============================================================
   AS VIAS — o mesmo obstáculo, caminhos diferentes

   "Portas fechadas podem ser arrombadas tanto com magia quanto com
   ferramentas de ladrão ou força se tiver o suficiente."

   Cada via tem perícia própria, custo próprio e barulho próprio, e
   é isso que faz a escolha importar: o Ladino entra calado e o
   Guerreiro entra acordando a casa. Uma via que o herói não pode
   usar não vira teste difícil — vira "não dá, e olha o que daria".
   ============================================================ */
export const VIAS_DE_TRANCA = [
  {
    id: "ferramentas", nome: "com gazuas", rx: /gazua|grampo|ferramenta|arame|agulha|destranc|abrir a fechadura|palito|picar a fechadura|arrombar a fechadura/,
    pericia: "prestidigitacao", ajuste: 0, minutos: 5, barulho: false,
    precisa: { tipo: "item", rx: /gazua|ferramenta de ladr|kit de arromb|gazuas/, comoSeChama: "ferramentas de ladrão" },
    falha: "a gazua escorrega e o pino volta ao lugar",
  },
  {
    id: "forca", nome: "no braço", rx: /for[cç]a|ombro|chut|pontap|arromb|quebr|espatif|escancar|derrub|p[eé] na porta|no bra[cç]o/,
    pericia: "arrombamento", ajuste: 2, minutos: 2, barulho: true,
    precisa: null,
    falha: "a madeira range e aguenta",
  },
  {
    id: "magia", nome: "pela magia", rx: /magia|feiti[cç]|conjur|encant|palavra de abrir|abrir m[aá]gic|arcan/,
    pericia: "arcanismo", ajuste: -2, minutos: 1, barulho: false,
    precisa: { tipo: "magia", rx: /abrir|destranc|passagem|chave|portal|telecin/, comoSeChama: "uma magia que abra o que está fechado" },
    falha: "o selo bebe a magia e não cede",
  },
  {
    id: "chave", nome: "com a chave", rx: /\bchave\b/,
    pericia: null, ajuste: 0, minutos: 1, barulho: false,
    precisa: { tipo: "item", rx: /chave/, comoSeChama: "a chave" },
    falha: "",
  },
];

export function viaPorId(id) { return VIAS_DE_TRANCA.find((v) => v.id === id) || null; }

/* O que o herói carrega, lido da ficha. Não pergunta ao Mestre e não
   acredita na ficção: se a gazua não está na bolsa, não existe. */
function temItem(pers, rx) {
  const inv = [...((pers && pers.inventario) || []), ...Object.values((pers && pers.equipado) || {})];
  return inv.some((it) => rx.test(norm(typeof it === "string" ? it : (it && it.nome) || "")));
}
function temMagia(pers, rx) {
  const habs = (pers && pers.habilidades) || [];
  return habs.some((h) => {
    const n = norm(typeof h === "string" ? h : `${(h && h.nome) || ""} ${(h && h.descricao) || ""}`);
    return rx.test(n);
  });
}

export function viasAbertas(pers) {
  return VIAS_DE_TRANCA.filter((v) => {
    if (!v.precisa) return true;
    if (v.precisa.tipo === "item") return temItem(pers, v.precisa.rx);
    if (v.precisa.tipo === "magia") return temMagia(pers, v.precisa.rx);
    return true;
  });
}

/* A via que a frase nomeia — ou nenhuma, quando o jogador só disse
   "tento abrir a porta" e cabe ao sistema escolher a que ele tem. */
export function viaDeclarada(texto) {
  const t = norm(texto);
  for (const v of VIAS_DE_TRANCA) if (v.rx.test(t)) return v;
  return null;
}

/* ============================================================
   A TRANCA

   Uma porta trancada não é guardada em lugar nenhum: é DERIVADA do
   lugar e do que se está tentando abrir, como todo o resto deste
   jogo. Mesma semente, mesma porta, mesma dificuldade para sempre —
   e a fechadura de uma cadeia é pior que a de uma taverna, porque
   quem tranca decide o quanto tranca.
   ============================================================ */
const DUREZA_POR_LUGAR = [
  { rx: /cadeia|c[aá]rcere|cela|masmorra|enxovia|cofre|reserva|arsenal|guarita/, base: 18, nome: "ferro e duas voltas" },
  { rx: /templo|santu[aá]rio|cripta|sacristia|jazigo|ossu?[aá]rio|necr[oó]pole/, base: 16, nome: "carvalho velho com selo" },
  { rx: /guilda|bibliotec|arquiv|quartel|torre|forte|pal[aá]cio/, base: 16, nome: "boa fechadura" },
  { rx: /forja|ferraria|armaz[eé]m|dep[oó]sito|galp[aã]o|adega|por[aã]o/, base: 14, nome: "cadeado de oficina" },
  { rx: /taverna|estalagem|quarto|cozinha|casa|granja|moinho|choup/, base: 12, nome: "tranca simples de madeira" },
];

export function trancaDe(semente, lugar, alvo = "porta") {
  const chave = `${norm(lugar)}|${norm(alvo)}`;
  const perfil = DUREZA_POR_LUGAR.find((d) => d.rx.test(norm(lugar))) || { base: 14, nome: "fechadura comum" };
  const rnd = rngDe(`${semente}|tranca|${chave}`);
  /* uma variação pequena e determinística: duas portas do mesmo prédio
     não precisam ser idênticas, mas nenhuma pode mudar entre visitas */
  const dc = perfil.base + Math.floor(rnd() * 3) - 1;
  return { dc, nome: perfil.nome, chave };
}

/* ============================================================
   O CATÁLOGO DAS AÇÕES

   Cada entrada responde à mesma pergunta: esta frase é um obstáculo?
   E, sendo, qual perícia, contra que dificuldade, quanto tempo custa
   e se faz barulho.

   `alvo` é o que vai para o livro de tentativas — é ele que faz
   "vasculho o quarto" duas vezes ser a MESMA tentativa e "vasculho o
   quarto" e "escuto à porta" serem duas.
   ============================================================ */
export const DESAFIOS = [
  {
    id: "buscar",
    /* v9.64: o jogador deixou de poder pedir teste, e a rede que sobrou
       tinha de ser mais larga — tirar a porta de trás e manter o funil
       seria piorar o jogo em nome da regra. Entram os verbos de conferir
       ("verifico o quarto" era o exemplo do próprio jogador e NÃO casava
       nada), de esquadrinhar e de passar os olhos. */
    rx: /\b(vasculh|revir|remexo|procur|busco|dou uma olhada|olho em volta com|examino o|examino a|examino esse|reviro|fu[cç]o|inspeciono|presto (bastante )?aten[cç][aã]o|reparo (n|em)|olho com aten[cç][aã]o|dou busca|verific|confiro|checo|esquadrinh|passo os olhos|dou uma vasculhada|dou uma geral|reviso o|corro os olhos)/,
    /* PROCURAR UMA PESSOA NÃO É VASCULHAR UM LUGAR, e a diferença é cara: um
       falso positivo aqui marca o quarto como revirado por causa de "procuro
       o taverneiro". A lista é de gente porque é o caso real; o falso
       negativo apenas devolve o turno ao Mestre, que é o lado seguro. */
    /* v9.64: e com os verbos de conferir entrou um falso positivo novo —
       "verifico se a porta está trancada" é sobre a TRANCA, e `buscar` vem
       antes dela no catálogo, então roubaria a frase e marcaria o cômodo
       como revirado. Conferir se algo está fechado não é vasculhar. */
    naoSe: /\b(pessoa|gente|rosto|olhos del[ae]|taverneir|ferreir|mercador|guarda|capit[aã]|sacerdot|ac[oó]lito|estalajadeir|curandeir|algu[eé]m|homem|mulher|rapaz|mo[cç]a|velh[oa]|companheir|amig|aliad|informante|contato|comprador|vendedor|barqueir|cocheir|dono d|taverneira)|\b(verific|confiro|checo)\w*\s+(se\s+)?[^.]{0,24}\b(trancad|destrancad|fechad|abert|porta|fechadura|cadeado|tranca)\b/,
    pericia: "percepcao", alvo: "busca", minutos: 10, barulho: false,
    rotulo: "vasculhar o lugar",
    /* a dificuldade sai do que existe aqui; sem nada, o sistema ainda deixa
       procurar UMA vez — saber que não há nada é informação, e informação
       não sai de graça */
    dcPadrao: 13,
  },
  {
    id: "investigar",
    rx: /\b(investig|deduzo|dedu[zç]|junto as pistas|analiso a cena|leio os vest[ií]gios|procuro pistas|o que aconteceu aqui|reconstruo)/,
    pericia: "investigacao", alvo: "investigacao", minutos: 15, barulho: false,
    rotulo: "ler os vestígios", dcPadrao: 14,
  },
  {
    id: "escutar",
    /* "ouço passos" é narração, não perícia. Escutar como AÇÃO precisa de
       alvo ou de esforço declarado — sem isso, todo turno viraria teste. */
    rx: /\b(escuto (a|à|na|no|atr[aá]s|pela|pelo)|fico escutando|encosto o ouvido|presto o ouvido|apuro os ouvidos|escuto com aten)/,
    pericia: "percepcao", alvo: "escuta", minutos: 2, barulho: false,
    rotulo: "escutar", dcPadrao: 13,
    /* v9.64: antes do dado, o mundo diz se HÁ o que ouvir. Sem isto, este
       teste rolava sempre — e a pergunta "havia mesmo alguém falando do
       outro lado?" sobrava para a IA, que responde pela cena que quer
       contar e não pelo lugar onde o herói está. */
    oportunidade: { pergunta: "haOQueOuvir", nada: "Não há o que escutar daqui — nem voz, nem passo, nem respiração." },
  },
  {
    id: "fraqueza",
    rx: /\b(fraqueza|ponto fraco|vulnerab|identific\w* (o|a|esse|essa|aquele)?\s*(inimigo|criatura|monstro|bicho)|o que (eu )?sei sobre|reconhe[cç]o (o|a|esse|essa))/,
    pericia: "saberes", alvo: "fraqueza", minutos: 0, barulho: false,
    rotulo: "lembrar o que se sabe da criatura", dcBase: 14,
    /* este é o único que vale DENTRO da luta sem penalidade de tempo: é
       exatamente para isto que a perícia de saberes existe */
    valeEmCombate: true,
  },
  {
    id: "mentira",
    rx: /\b(ele est[aá] mentindo|ela est[aá] mentindo|se ele mente|se ela mente|leio (as )?inten[cç]|tento saber se|desconfio|sinto se|percebo se mente)\b/,
    pericia: "intuicao", alvo: "intuicao", minutos: 0, barulho: false,
    rotulo: "ler a intenção", dcPadrao: 14,
    /* v9.65: rolar Intuição sem o mundo ter decidido se HÁ mentira é
       rolar para saber se existe a coisa que a pergunta já supôs. Mas
       este é o único que exige um alvo NOMEADO: sem nome, o fato ficaria
       valendo para todas as pessoas da cena, e duas conversas diferentes
       no mesmo dia herdariam a mesma resposta. Sem nome, não pergunta —
       rola como sempre rolou, que é o comportamento seguro. */
    oportunidade: {
      pergunta: "estaMentindo", precisaDeAlvo: true,
      nada: "Não há mentira nenhuma aqui — o que essa pessoa disse, ela acredita.",
    },
    alvoNomeado: true,
  },
  {
    id: "tranca",
    /* `gazua` entra como alvo próprio: nomear a ferramenta já declara a
       ação, e "uso a gazua na porta" é como se diz na mesa. */
    rx: /\b(arromb|destranc|for[cç]o a porta|abro a porta|abrir a porta|abro o ba[uú]|abro o cofre|abro a fechadura|for[cç]o a fechadura|for[cç]o o ba[uú]|abro o cadeado|quebro a tranca|gazua|mexo na fechadura|trabalho a fechadura|tento a fechadura)/,
    pericia: "arrombamento", alvo: "tranca", minutos: 5, barulho: true,
    rotulo: "abrir o que está trancado", tranca: true,
    /* v9.64: ANTES da tentativa, o mundo diz se este lugar tem vigia. É o
       que faz a escolha entre a gazua silenciosa e o ombro barulhento
       significar alguma coisa — sem olhos por perto, o barulho é só
       barulho, e a via cara deixa de ser uma escolha para virar enfeite. */
    vigia: true,
  },
  {
    id: "escalar",
    rx: /\b(escal|trepo|subo (o|a|pel)|me i[cç]o|galgo|escalar)/,
    pericia: "atletismo", alvo: "escalada", minutos: 5, barulho: false,
    rotulo: "escalar", dcPadrao: 14, corpo: true,
  },
  {
    id: "furtar_se",
    rx: /\b(me esgueiro|esgueir|na surdina|sem ser vist|sorrateir|em sil[eê]ncio at[eé]|me escondo|fico na sombra|sigo sem que)/,
    pericia: "furtividade", alvo: "furtividade", minutos: 5, barulho: false, testemunha: true,
    rotulo: "passar sem ser visto", dcPadrao: 14,
  },
  {
    id: "bater_carteira",
    rx: /\b(bato a carteira|surrupi|furto (a|o|dele|dela)|punguei|punho a bolsa|tiro do bolso dele|roubo a bolsa|planto)/,
    pericia: "prestidigitacao", alvo: "furto", minutos: 1, barulho: false, testemunha: true,
    rotulo: "mão leve", dcPadrao: 15,
  },
  {
    id: "convencer",
    /* Conversa não se rola — só o que a conversa TENTA arrancar contra
       resistência. "Peço uma cerveja" não é Persuasão; "tento convencer o
       guarda a me deixar passar" é. A régua é o verbo de esforço. */
    rx: /\b(tento convencer|convenço|persuad|nego[cç]io com|argument|insisto com|tento negociar|barganho|pechinch)/,
    pericia: "persuasao", alvo: "persuasao", minutos: 10, barulho: false,
    rotulo: "convencer", dcPadrao: 14, social: true,
  },
  {
    id: "intimidar",
    rx: /\b(intimid|amea[cç]o|meto medo|na marra|no grito|ponho a m[ãa]o na espada para)/,
    pericia: "intimidacao", alvo: "intimidacao", minutos: 5, barulho: true,
    rotulo: "intimidar", dcPadrao: 14, social: true,
  },
  {
    id: "mentir",
    rx: /\b(minto|mentir|blefo|blefar|engano|finjo ser|me passo por|disfar[cç])/,
    pericia: "enganacao", alvo: "enganacao", minutos: 5, barulho: false,
    rotulo: "enganar", dcPadrao: 14, social: true,
  },
  {
    id: "rastrear",
    rx: /\b(rastre|sigo as pegadas|sigo o rastro|seguir o rastro|leio o ch[aã]o|farejo)/,
    pericia: "sobrevivencia", alvo: "rastro", minutos: 30, barulho: false,
    rotulo: "rastrear", dcPadrao: 14,
    /* meia hora de mundo por tentativa: rolar contra um chão que não tem
       pegada nenhuma custava caro e devolvia narração de consolo */
    oportunidade: { pergunta: "haRastro", nada: "Não há rastro aqui — o chão não guardou nada que se possa seguir." },
  },
  {
    id: "estancar",
    rx: /\b(estanco|estancar|estabilizo|estabilizar|trato o ferimento|cuido do ferimento|fa[cç]o um curativo)\b/,
    pericia: "medicina", alvo: "medicina", minutos: 10, barulho: false,
    rotulo: "estancar", dcPadrao: 13,
  },
  {
    id: "arcano",
    rx: /\b(identific\w* (a|o) (magia|feiti|selo|runa|encant)|reconhe[cç]o (a|o) (magia|selo|runa)|leio a runa|examino o selo|o que (é|e) esse feiti)\b/,
    pericia: "arcanismo", alvo: "arcano", minutos: 10, barulho: false,
    rotulo: "ler o arcano", dcPadrao: 15,
  },
];

/* ---------------- COMO SE DIZ (v9.64) ----------------
   O jogador deixou de pedir testes. Uma recusa seca ("não se pede teste")
   seria uma regra nova sem ensinar a gramática que ela exige — e quem
   escreve "peço um teste de Percepção" está tentando fazer algo, não
   quebrar a regra. Então a recusa vem com a frase que ELE teria escrito
   para conseguir aquilo, tirada do mesmo catálogo que a leria.

   Não está no catálogo acima de propósito: `rx` é o que o sistema LÊ, e
   isto é o que o sistema ENSINA. Misturar os dois faria alguém, um dia,
   ajustar a frase de exemplo e mexer sem querer na detecção. */
const COMO_SE_DIZ = {
  buscar: "reviro o quarto atrás de um esconderijo",
  investigar: "leio os vestígios para saber o que aconteceu aqui",
  escutar: "encosto o ouvido na porta",
  fraqueza: "tento lembrar o que sei sobre essa criatura",
  mentira: "tento saber se ele está mentindo",
  tranca: "forço a fechadura com a gazua",
  escalar: "escalo o muro pelo lado da hera",
  furtar_se: "me esgueiro pela sombra até a porta dos fundos",
  bater_carteira: "surrupio a bolsa do cinto dele",
  convencer: "tento convencer o guarda a me deixar passar",
  intimidar: "ameaço o taverneiro para ele falar",
  mentir: "minto dizendo que sou o novo estalajadeiro",
  rastrear: "sigo as pegadas na lama",
  estancar: "trato o ferimento antes que ele piore",
  arcano: "examino o selo para reconhecer a magia",
};
export function comoSeDiz(id) { return COMO_SE_DIZ[id] || ""; }

export function desafioPorId(id) { return DESAFIOS.find((d) => d.id === id) || null; }
/* O desafio que uma PERÍCIA nomeada resolve. Existe para o hábito antigo —
   "peço um teste de Percepção" — cair na mesma adjudicação de todo o resto,
   em vez de virar uma segunda porta com regras próprias. Toda regra deste
   jogo que mora num só dos dois caminhos vira bug. */
export function desafioPorPericia(id) { return DESAFIOS.find((d) => d.pericia === id) || null; }

/* ============================================================
   OS BOTÕES DO PAINEL

   Achado JOGANDO, e é o terceiro caso nesta mesma sessão do bug de
   sempre: "toda regra que mora num só dos dois caminhos vira bug".

   O painel de Ações tinha seis botões sob o título "Pedir um teste"
   que chamavam a rolagem DIRETO, pela dificuldade velha e sem passar
   pelo livro de tentativas. Toda a v9.59 tinha uma porta dos fundos,
   e por ela dava para farmar testes infinitos exatamente como antes.

   Agora cada botão DECLARA UMA AÇÃO, com a frase canônica que um
   jogador escreveria, e ela entra pela mesma porta de todo o resto.

   E um botão a menos: "Aguentar" era pedir uma salvaguarda, e
   salvaguarda ninguém pede — ela acontece com você. Um botão para ela
   contradizia o próprio sistema que ele deveria servir.
   ============================================================ */
export const ACOES_RAPIDAS = [
  { id: "buscar", icone: "👁", rotulo: "Vasculhar", frase: "vasculho o lugar com atenção", desc: "revirar o lugar atrás do que ele esconde" },
  { id: "investigar", icone: "🔎", rotulo: "Investigar", frase: "investigo os vestígios", desc: "ler o vestígio: quem esteve aqui, o que falta" },
  { id: "escutar", icone: "👂", rotulo: "Escutar", frase: "encosto o ouvido e escuto com atenção", desc: "o que se ouve daqui" },
  { id: "fraqueza", icone: "📖", rotulo: "Lembrar", frase: "tento lembrar o que sei sobre esta criatura, alguma fraqueza", desc: "o que os livros dizem da criatura à frente" },
  { id: "convencer", icone: "🗣", rotulo: "Convencer", frase: "tento convencer", desc: "dobrar uma vontade pela palavra" },
  { id: "intimidar", icone: "😤", rotulo: "Intimidar", frase: "intimido", desc: "impor pela ameaça" },
  { id: "furtar_se", icone: "🌑", rotulo: "Esgueirar", frase: "me esgueiro sem ser visto", desc: "passar sem ser visto nem ouvido" },
  /* a frase precisa casar a própria regex do catálogo — "abrir o que está
     trancado" não casava nada, e o botão caía fora do sistema em silêncio.
     Achado pelo teste que confere botão contra desafio. */
  { id: "tranca", icone: "🚪", rotulo: "Arrombar", frase: "tento arrombar a porta", desc: "a chave, a gazua, a magia ou o ombro" },
];

/* A frase que o botão declara. O motivo digitado pelo jogador entra colado,
   porque é ele que diz CONTRA O QUÊ — "tento convencer" e "tento convencer
   o guarda a nos deixar passar" são a mesma ação com alvos diferentes. */
export function fraseDaAcaoRapida(id, motivo = "") {
  const a = ACOES_RAPIDAS.find((x) => x.id === id);
  if (!a) return String(motivo || "").trim();
  const m = String(motivo || "").trim();
  return m ? `${a.frase} — ${m}` : a.frase;
}

/* ============================================================
   O QUE NÃO PEDE DADO

   Metade de um bom sistema de testes é a lista do que NÃO se rola.
   A régua da mesa tem duas condições, e as duas precisam valer:
   chance real de falhar E consequência por falhar. Andar até o
   balcão falha em quê? Perguntar o nome de alguém custa o quê?
   ============================================================ */
const SEM_DADO = [
  { rx: /\b(pergunto|pe[cç]o (informa|not[ií]cia)|falo com|converso|cumprimento|saúdo|saudo|digo|respondo|comento|agrade[cç]o)\b/, porque: "conversa não se rola — só o que a conversa TENTA arrancar" },
  { rx: /\b(ando|caminho|sigo (at[eé]|para)|entro|saio|sento|levanto|olho para|observo o|espero|aguardo|descanso)\b/, porque: "deslocar-se e olhar não são obstáculos" },
  { rx: /\b(saco|puxo|desembainho|equipo|guardo|bebo|como|visto|acendo)\b/, porque: "usar o que se tem na mão não pede dado" },
];

export function naoPedeDado(texto) {
  const t = norm(texto);
  return SEM_DADO.find((s) => s.rx.test(t)) || null;
}

/* ============================================================
   O LIVRO DE TENTATIVAS

   A memória que faltava. Chave = onde + o quê, e é ela que separa
   "vasculho o quarto" de "escuto à porta" no mesmo quarto.
   ============================================================ */
export function garantirTentativas(t) {
  const o = t && typeof t === "object" ? t : {};
  const out = {};
  for (const [k, v] of Object.entries(o)) {
    if (!v || typeof v !== "object") continue;
    out[k] = {
      vias: Array.isArray(v.vias) ? v.vias.slice(0, 8) : [],
      dia: Number(v.dia) || 0,
      resultado: v.resultado === "sucesso" ? "sucesso" : "falha",
      limpo: !!v.limpo,      // o lugar não tem mais nada a dar
      vezes: Number(v.vezes) || 1,
    };
  }
  return out;
}

export function chaveDaTentativa(lugar, alvo) {
  return `${norm(lugar) || "aqui"}|${norm(alvo) || "acao"}`;
}

export function registrarTentativa(reg, chave, { via = "", resultado = "falha", dia = 0, limpo = false } = {}) {
  const base = garantirTentativas(reg);
  const antes = base[chave] || { vias: [], dia, resultado: "falha", limpo: false, vezes: 0 };
  return {
    ...base,
    [chave]: {
      vias: via && !antes.vias.includes(via) ? [...antes.vias, via].slice(0, 8) : antes.vias,
      dia, resultado,
      limpo: limpo || antes.limpo,
      vezes: (antes.vezes || 0) + 1,
    },
  };
}

export function marcarLimpo(reg, chave) {
  const base = garantirTentativas(reg);
  const antes = base[chave] || { vias: [], dia: 0, resultado: "falha", vezes: 1 };
  return { ...base, [chave]: { ...antes, limpo: true } };
}

/* ============================================================
   O QUE REABRE UM OBSTÁCULO

   "Só se algo mudar" — com o "algo" enumerado, porque uma regra que
   depende do humor de quem julga não é regra. Quatro coisas mudam
   uma tentativa: outra ABORDAGEM, uma FERRAMENTA nova, AJUDA de
   alguém, e TEMPO declarado de sobra.
   ============================================================ */
const RX_AJUDA = /\b(com a ajuda|ajudad|juntos|me ajuda|com (o|a) \w+ segurando|entre os dois|n[oó]s dois|o grupo (me )?ajuda)\b/;
const RX_TEMPO = /\b(com calma|sem pressa|uma hora|duas horas|a tarde inteira|a manh[aã] inteira|o tempo que for|demoradamente|palmo a palmo|com todo o cuidado|minuciosa)\b/;
const RX_FERRAMENTA = /\b(com (a|as|o|os) (gazua|ferramenta|p[eé] de cabra|alavanca|marreta|machado|corda|escada|lanterna|tocha|lupa)|usando (a|o|as|os) \w+)\b/;

export function oQueMudou(texto, { viaNova = "", viasJaUsadas = [], houveTentativa = false } = {}) {
  const t = norm(texto);
  const mudou = [];
  /* `houveTentativa` existe porque sem ele a PRIMEIRA tentativa numa porta
     anunciava "conta a favor: por outro caminho" — outro caminho que quê?
     Só é OUTRO caminho se já houve um. Apareceu na tela no primeiro teste
     de navegador, e é o tipo de frase errada que faz o jogador desconfiar
     do painel inteiro. */
  if (houveTentativa && viaNova && !viasJaUsadas.includes(viaNova)) mudou.push({ id: "via", diz: "por outro caminho" });
  if (RX_AJUDA.test(t)) mudou.push({ id: "ajuda", diz: "com ajuda" });
  if (RX_TEMPO.test(t)) mudou.push({ id: "tempo", diz: "com tempo de sobra" });
  if (RX_FERRAMENTA.test(t)) mudou.push({ id: "ferramenta", diz: "com outra ferramenta" });
  return mudou;
}

/* Tempo e ajuda não abrem a porta de graça: facilitam. É a vantagem
   da mesa, e ela é a razão de o jogador procurar outro jeito. */
export function bonusDoQueMudou(mudou) {
  let b = 0;
  for (const m of mudou) {
    if (m.id === "ajuda") b += 2;
    if (m.id === "tempo") b += 2;
    if (m.id === "ferramenta") b += 2;
  }
  return Math.min(4, b);
}

/* ============================================================
   O VEREDICTO

   A função que este arquivo existe para ter. Entra a frase e o que o
   sistema sabe da cena; sai o que fazer. Nunca "talvez".
   ============================================================ */
export function lerAcao(texto, ctx = {}) {
  const cru = String(texto || "");
  if (!cru.trim() || cru.trimStart().startsWith("[")) return null;
  const t = norm(cru);
  const {
    personagem = {}, semente = "", lugar = "", emCombate = false,
    tentativas = {}, dia = 0,
  } = ctx;
  /* fora do destructuring de propósito: o conferidor de referências lê
     `achadoDe(...)` como chamada a uma função global e acusa falso positivo.
     Uma linha a mais vale menos que um conferidor que ninguém lê. */
  const achadoDe = typeof ctx.achadoDe === "function" ? ctx.achadoDe : null;

  /* só a frase manda. Até a v9.63 havia uma segunda porta: nomear a perícia
     ("peço um teste de Percepção") convocava o desafio correspondente e o
     dado saía. Ela morreu na v9.64, e o motivo está logo abaixo.

     Quando a frase É um pedido de rolagem, o catálogo lê o que SOBRA dela
     depois de tirados a moldura do pedido e o nome da perícia. Sem isso a
     regra teria buracos com nome próprio: metade das perícias carrega no
     nome o verbo da ação que cobre — "Arrombamento" tem "arromb" —, e o
     desafio casaria pelo rótulo da perícia, que é justamente o caminho que
     esta versão fecha. */
  const pedido = detectarPedidoDeTeste(cru);
  const daAcao = pedido ? norm(semOPedidoDeTeste(cru)) : t;
  const d = DESAFIOS.find((x) => x.rx.test(daAcao) && !(x.naoSe && x.naoSe.test(daAcao)));
  if (!d) {
    /* ---------------- TESTE NÃO SE PEDE (v9.64) ----------------
       O prompt já dizia isto ao Mestre desde a v9.59 — "o jogador NÃO pede
       testes: ele declara uma AÇÃO" — e o código fazia o contrário. Regra
       escrita sem código atrás é o bug que este projeto mais repete; aqui
       era pior, porque havia código, e ele contradizia a regra.

       Por que a regra é essa, e não conforto de mesa: quem pede o teste
       escolhe a perícia, e escolher a perícia é escolher o que existe.
       "Peço Percepção" já afirma que há algo para ver; "peço Intuição" já
       afirma que há mentira. O dado então decide se o herói alcança uma
       coisa que a pergunta plantou. Declarar a AÇÃO devolve essa decisão a
       quem é dela: o mundo diz se há, e só depois o dado diz se você pega.

       A recusa vem com a frase que teria funcionado. Uma regra nova que só
       nega é uma regra que o jogador vai testar três vezes e desistir. */
    if (pedido) {
      const alvo = pedido.pericia ? desafioPorPericia(pedido.pericia) : null;
      const per = pedido.pericia ? periciaPorId(pedido.pericia) : null;
      return {
        tipo: "naoSePede",
        pericia: pedido.pericia || "",
        periciaNome: (per && per.nome) || "",
        rotulo: alvo ? alvo.rotulo : "",
        comoSeDiz: alvo ? comoSeDiz(alvo.id) : "",
        motivo: pedido.motivo || "",
      };
    }
    const livre = naoPedeDado(cru);
    return livre ? { tipo: "livre", porque: livre.porque } : null;
  }

  /* ---------------- COM QUEM SE ESTÁ FALANDO (v9.65) ----------------
     Vai como FUNÇÃO, pelo mesmo motivo do `achadoDe`: só aqui se sabe que
     este desafio é social, e resolver a pessoa em todo turno — inclusive
     nos que só perguntam "isto é desafio?" — seria varrer o elenco da cena
     à toa dezenas de vezes por partida. */
  const pessoaDe = typeof ctx.pessoaDe === "function" ? ctx.pessoaDe : null;
  const pessoa = (d.social || d.alvoNomeado) && pessoaDe ? pessoaDe(cru) : null;

  /* ---------------- O QUE CONVERSA NENHUMA COMPRA ----------------
     Antes do livro de tentativas de propósito: pedir a alguém que se mate
     por você não é uma tentativa que possa ser repetida com ajuda ou com
     mais tempo. Não é dificuldade alta — é outra categoria de coisa, e
     registrá-la como tentativa fingiria que um dia ela abre. */
  if (d.social) {
    const fora = foraDaConversa(cru);
    if (fora) {
      return {
        tipo: "foraDaConversa", rotulo: d.rotulo,
        porque: fora.porque, comoSeria: fora.comoSeria,
        quem: (pessoa && pessoa.nome) || "",
      };
    }
  }

  /* A conta social é feita AQUI, antes do livro de tentativas, porque é ela
     que diz qual é a chave. Um obstáculo social não é "persuasão neste
     lugar": é ESTE pedido a ESTA pessoa. Chavear pelo lugar faria o segundo
     pedido ao mesmo taverneiro — outro assunto, outro tamanho — ouvir "você
     já tentou isso aqui", que é falso e trava a conversa inteira. */
  const conta = d.social ? dificuldadeSocial({ texto: cru, pessoa, pers: personagem, pericia: d.pericia, fama: ctx.fama }) : null;

  const reg = garantirTentativas(tentativas);
  const chave = chaveDaTentativa(lugar, conta
    ? `${d.alvo}|${(pessoa && pessoa.nome) || "quem quer que seja"}|${conta.tamanho}`
    : d.alvo);
  const feito = reg[chave] || null;

  /* ---------------- A TRANCA E AS SUAS VIAS ---------------- */
  let via = null, viasPossiveis = null;
  if (d.tranca) {
    viasPossiveis = viasAbertas(personagem);
    const pedida = viaDeclarada(cru);
    if (pedida && !viasPossiveis.some((v) => v.id === pedida.id)) {
      return {
        tipo: "impossivel",
        porque: `você não tem ${pedida.precisa.comoSeChama}`,
        comoSeria: viasPossiveis.map((v) => v.nome),
        rotulo: d.rotulo,
      };
    }
    /* sem via declarada, o sistema escolhe a que o herói tem — e prefere a
       silenciosa, porque é o que um personagem competente faria */
    via = pedida || viasPossiveis[0] || null;
    if (!via) {
      return { tipo: "impossivel", porque: "você não tem como abrir isto", comoSeria: ["a chave", "ferramentas de ladrão", "uma magia que abra", "força bruta"], rotulo: d.rotulo };
    }
  }

  const mudou = oQueMudou(cru, {
    viaNova: via ? via.id : "",
    viasJaUsadas: feito ? feito.vias : [],
    houveTentativa: !!feito,
  });

  /* ---------------- JÁ ACABOU ----------------
     O lugar foi revirado até o fim. Não se rola, não se gasta turno, e o
     Mestre não precisa inventar o vazio pela quinta vez. */
  if (feito && feito.limpo && !mudou.length) {
    return { tipo: "vasculhado", rotulo: d.rotulo, vezes: feito.vezes, chave };
  }

  /* ---------------- MESMA COISA, MESMO JEITO ---------------- */
  if (feito && !mudou.length && feito.resultado === "falha") {
    return {
      tipo: "jaTentou", rotulo: d.rotulo, chave, vezes: feito.vezes,
      comoReabrir: ["por outro caminho", "com ajuda de alguém", "com uma ferramenta que você não usou", "dedicando bem mais tempo"],
    };
  }
  /* já deu certo e nada mudou. Duas respostas diferentes, e a diferença
     apareceu jogando:

     PROCURAR não é CONSEGUIR. Uma busca bem-sucedida achou o que achou, e
     dizer "você já conseguiu isso aqui" na segunda vez está errado de duas
     maneiras — soa como se não houvesse mais nada (e pode haver, mais fundo
     e mais difícil) e trata revirar um quarto como uma tarefa que se conclui.
     A resposta certa é a mesma da falha: você já revistou assim, e para achar
     o que passou despercebido é preciso mudar alguma coisa.

     Já uma porta aberta está aberta, e um guarda convencido está convencido:
     ali repetir é refazer o que já está feito. */
  if (feito && !mudou.length && feito.resultado === "sucesso") {
    if (d.alvo === "busca" || d.alvo === "investigacao") {
      return {
        tipo: "jaTentou", rotulo: d.rotulo, chave, vezes: feito.vezes, apósSucesso: true,
        comoReabrir: ["com ajuda de alguém", "com uma ferramenta que você não usou", "dedicando bem mais tempo"],
      };
    }
    if (d.id !== "tranca") return { tipo: "livre", porque: "Isso você já conseguiu aqui", rotulo: d.rotulo, chave };
  }

  /* ---------------- A DIFICULDADE, QUE VEM DO OBSTÁCULO ----------------
     O achado só é consultado DEPOIS de o desafio ser conhecido, porque é
     o desafio que diz qual atributo procura o quê: quem escuta à porta não
     acha o alçapão que a vista acharia. */
  /* A VIA MANDA NA PERÍCIA. Abrir a mesma porta no ombro é Arrombamento e
     na gazua é Prestidigitação — se o desafio impusesse a sua, o Ladino
     rolaria força para usar a ferramenta dele, e a escolha entre as vias
     (que é o ponto todo) deixaria de significar alguma coisa. */
  const periciaDaVez = (via && via.pericia) || d.pericia;
  const atributoDoDesafio = (periciaPorId(periciaDaVez) || {}).atributo || "percepcao";
  const achado = (typeof achadoDe === "function" && (d.alvo === "busca" || d.alvo === "investigacao"))
    ? achadoDe(atributoDoDesafio) : null;
  let dc, deOnde;
  const social = conta;
  if (social) {
    /* v9.65: o 14 fixo morreu. A dificuldade sai de QUEM está na frente e
       do TAMANHO do que se pede — e quando o sistema não consegue ler o
       tamanho, o degrau padrão é justamente 14, para que o jogo só mude
       onde há informação de verdade. */
    dc = social.dc;
    deOnde = social.deOnde;
  } else if (d.tranca) {
    const tr = trancaDe(semente, lugar, "porta");
    dc = tr.dc + (via ? via.ajuste : 0);
    deOnde = `${tr.nome}, ${via ? via.nome : "no braço"}`;
  } else if (achado && achado.dc) {
    dc = achado.dc;
    deOnde = "há algo escondido aqui, e esta é a dificuldade dele";
  } else {
    dc = d.dcBase || d.dcPadrao || 13;
    deOnde = "obstáculo comum";
  }
  const alivio = bonusDoQueMudou(mudou);
  if (alivio) { dc -= alivio; deOnde += `, ${mudou.map((m) => m.diz).join(" e ")} (−${alivio})`; }
  if (emCombate && !d.valeEmCombate) { dc += 3; deOnde += ", no meio da luta (+3)"; }

  return {
    tipo: "teste",
    id: d.id, pericia: periciaDaVez, atributo: atributoDoDesafio,
    rotulo: d.rotulo, dc, deOnde, chave,
    minutos: (via ? via.minutos : d.minutos) || 0,
    barulho: via ? via.barulho : !!d.barulho,
    corpo: !!d.corpo, social: !!d.social,
    /* v9.62: falhar em silêncio não é falhar em segredo. Quando esta ação
       falha, QUEM viu é fato do mundo, e o sistema pergunta em vez de
       deixar a IA escolher a testemunha que a cena dela pedia. */
    testemunha: !!d.testemunha,
    /* v9.64: o que o mundo precisa responder ANTES de o dado sair da mão.
       Vai como dado, não resolvido: `lerAcao` é pura, e o oráculo precisa
       de sorteio e do livro de fatos — quem pergunta é o App. */
    /* a pergunta que exige alvo nomeado só existe quando há nome. Resolvido
       aqui, e não no App, para que quem consumir o veredicto não precise
       conhecer a exceção — a regra viaja junto com o dado. */
    oportunidade: (d.oportunidade && d.oportunidade.precisaDeAlvo && !pessoa) ? null : (d.oportunidade || null),
    vigia: !!d.vigia,
    /* v9.65: a conta social inteira viaja junto — o que o sucesso compra,
       o que ele não compra, o que foi pago e o blefe que não colou. */
    social,
    quem: (pessoa && pessoa.nome) || "",
    pessoa: pessoa || null,
    /* v9.65: o que a falha cobra. Sai do ALVO e não do id, porque é o alvo
       que diz a natureza da coisa — e os alvos sociais não estão na tabela
       de propósito: ali "consegui, mas caro" já é um degrau do pedido. */
    alvoDoCusto: d.alvo,
    /* v9.66: de que altura se cai daqui. Derivada da semente e do lugar,
       como a dureza da tranca — a mesma parede tem sempre a mesma altura. */
    queda: d.alvo === "escalada" ? quedaDe(semente, lugar, cru) : null,
    via: via ? via.id : "", viaNome: via ? via.nome : "",
    falaDaVia: via ? via.falha : "",
    achado: achado || null,
    /* NADA AQUI PARA ACHAR. Deixa rolar UMA vez e depois fecha o lugar —
       saber que não há nada é informação, e informação não sai de graça.
       Foi esta a escolha entre "sempre deixa rolar" (que obriga o Mestre a
       narrar o vazio para sempre) e "avisa de cara" (que entrega ao jogador
       o que o personagem não teria como saber). */
    fechaDepois: (d.alvo === "busca" || d.alvo === "investigacao") && !achado,
    mudou: mudou.map((m) => m.diz),
  };
}

/* ============================================================
   O QUE O JOGADOR LÊ
   ============================================================ */
export function falaDoVeredicto(v) {
  if (!v) return "";
  if (v.tipo === "vasculhado") return `🔍 Você já revirou isto — não há mais o que achar aqui. Outro lugar, outro alvo, ou uma abordagem diferente.`;
  if (v.tipo === "jaTentou") {
    return v.apósSucesso
      ? `↺ Você já revistou isto assim, e tirou daqui o que os seus olhos alcançaram. Para achar o que passou despercebido, algo tem de mudar — ${v.comoReabrir.join(", ")}.`
      : `↺ Você já tentou ${v.rotulo} aqui, do mesmo jeito, e não deu. Insistir igual não muda nada — ${v.comoReabrir.join(", ")}.`;
  }
  if (v.tipo === "impossivel") return `⛔ Assim não dá: ${v.porque}. O que abriria: ${v.comoSeria.join(", ")}.`;
  if (v.tipo === "foraDaConversa") return `⛔ Isso não é dificuldade, é outra categoria de coisa: ${v.porque}. O que um dia mudaria: ${v.comoSeria.join(", ")}.`;
  if (v.tipo === "livre") return `✓ ${v.porque} — sem dado.`;
  if (v.tipo === "naoSePede") {
    const qual = v.periciaNome ? ` de ${v.periciaNome}` : "";
    return `🎲 Teste${qual} não se pede — quem decide se há dado é o sistema, e para isso ele precisa saber o que você FAZ.${v.comoSeDiz ? ` Diga assim: "${v.comoSeDiz}".` : ""}`;
  }
  return "";
}

/* ============================================================
   OS ENVELOPES

   O Mestre nunca decide se houve teste, nem qual foi o resultado.
   Recebe o fato e a regra do fato.
   ============================================================ */
export function envelopeDeVeredicto(v, oQueEuDisse = "") {
  if (!v) return "";
  const disse = oQueEuDisse ? ` Eu disse: "${String(oQueEuDisse).trim()}".` : "";
  if (v.tipo === "vasculhado") {
    return `[SEM TESTE — DECISÃO DO SISTEMA]${disse} Este lugar JÁ FOI vasculhado até o fim e não tem mais nada a dar. O sistema não rolou nada e não vai rolar. Diga isso na voz da cena, em UMA frase — que aqui já foi revirado e não há mais o que achar — e devolva a palavra para mim. NÃO invente um achado novo, NÃO ofereça uma pista de consolo e NÃO deixe a cena parecer que ainda esconde algo.`;
  }
  if (v.tipo === "jaTentou" && v.apósSucesso) {
    return `[SEM TESTE — DECISÃO DO SISTEMA]${disse} Eu já revistei este lugar assim, e já tirei daqui o que os meus olhos alcançaram. Procurar de novo do mesmo jeito não é uma nova chance: o sistema não rola. Em UMA frase, mostre o lugar já revirado — e NÃO ofereça um achado novo para preencher a cena. Se eu voltar com ajuda, com uma ferramenta ou com muito mais tempo, aí sim há o que rever.`;
  }
  if (v.tipo === "jaTentou") {
    return `[SEM TESTE — DECISÃO DO SISTEMA]${disse} Eu já tentei ${v.rotulo} aqui, exatamente assim, e falhei. Repetir a mesma coisa do mesmo jeito não é uma nova chance: o sistema não rola de novo. Em UMA ou DUAS frases, mostre a mesma parede em que eu já bati — sem novidade, sem meia-pista — e lembre que outra abordagem, ajuda ou muito mais tempo mudariam o quadro. NÃO resolva o obstáculo por generosidade.`;
  }
  if (v.tipo === "impossivel") {
    return `[SEM TESTE — DECISÃO DO SISTEMA]${disse} Do jeito que declarei, isto não é possível: ${v.porque}. Não houve rolagem porque não havia o que rolar. Narre a tentativa esbarrando no impossível em UMA ou DUAS frases. Você PODE deixar claro, pela cena, o que resolveria (${v.comoSeria.join(", ")}) — mas NÃO faça acontecer, NÃO me dê a ferramenta que falta e NÃO abra por outro caminho sem que eu peça.`;
  }
  if (v.tipo === "livre") {
    return `[SEM TESTE — DECISÃO DO SISTEMA]${disse} Isto não pede dado: ${v.porque}. Narre acontecendo, com naturalidade e sem tensão falsa, e devolva a palavra para mim.`;
  }
  if (v.tipo === "foraDaConversa") return envelopeForaDaConversa(v, v.quem || "essa pessoa");
  if (v.tipo === "naoSePede") {
    return `[SEM TESTE — DECISÃO DO SISTEMA]${disse} Eu pedi uma rolagem, e rolagem não se pede: quem decide se há dado é o sistema, a partir do que eu FAÇO. Não houve teste e não vai haver por este pedido.
REGRA DESTE ENVELOPE (obrigatória): NÃO role, NÃO peça rolagem, NÃO invente um resultado e NÃO me entregue por narração aquilo que o teste teria dado. Em UMA frase, devolva a cena ao ponto em que ela estava e deixe claro que estou parado esperando decidir o que fazer${v.comoSeDiz ? ` — algo como "${v.comoSeDiz}"` : ""}. Não trate isto como fracasso meu nem como recusa sua: é só a vez voltando para mim.`;
  }
  return "";
}

/* ============================================================
   O CUSTO DA FALHA (v9.65)

   Falhar, até aqui, era não acontecer nada. O herói tentava, o dado
   dizia não, e o Mestre ficava com a tarefa de narrar uma parede —
   o que ele faz do jeito que a improvisação permite: às vezes com
   uma consequência inventada e cara demais, às vezes com nada.

   Numa mesa boa a falha quase nunca é um beco. Ela custa: tempo,
   posição, barulho, um ferimento, uma ferramenta. É isso que faz o
   jogo andar mesmo quando o dado é ruim, e é a improvisação mais
   frequente que ainda sobrava para a IA.

   DUAS REGRAS, e a segunda é a que muda o jogo:

   1) TODA falha cobra o custo do seu tipo. Está na tabela, o código
      aplica o que dá para aplicar (minutos, barulho, o livro de
      tentativas) e o envelope entrega o resto pronto.

   2) FALHAR POR POUCO — um ou dois abaixo da dificuldade — não é
      falhar: é conseguir e pagar. É a "vitória a um preço" da mesa,
      e ela só existe onde a ficção tem um preço claro que o CÓDIGO
      consegue cobrar. Onde não tem, a falha é seca, porque um preço
      que só a narração aplica é um preço que não existe.

      O que o código cobra hoje, e é por isso que a lista de
      `porPouco` é curta: MINUTOS (o relógio do mundo anda de
      verdade), BARULHO (que vira pergunta ao oráculo, e a resposta
      é fato) e o LIVRO DE TENTATIVAS. Um preço em PELE — sangue,
      um osso — está de fora porque exigiria o pipeline de dano
      fora de combate, com queda a 0 PV e tudo o que vem junto;
      prometê-lo aqui e deixá-lo só no texto do envelope seria
      escrever a regra sem código atrás outra vez.

   O QUE ISSO CUSTA EM EQUILÍBRIO, dito sem maquiagem: onde o
   `porPouco` vale, a chance efetiva de conseguir sobe cerca de dez
   pontos. É o preço de trocar becos por decisões, e é cobrado de
   volta em minutos, em ruído e em pele. Por isso ele NÃO vale para
   o social (onde "consegui, mas caro" já é um degrau da escada do
   pedido) nem dentro da luta (onde o turno já é o preço).
   ============================================================ */
export const CUSTO_DE_FALHAR = [
  {
    alvo: "tranca", porPouco: true,
    seca: "a fechadura emperra com a tentativa malfeita",
    preco: "ela cede, mas cede errado: com estrondo, e a porta fica marcada de quem passou",
    minutosExtra: 5, barulhoExtra: true,
    /* v9.66: o ombro que arromba paga. Número fixo e pequeno de propósito —
       é o preço de uma vitória que o dado não deu, não um golpe de inimigo. */
    pelePorPouco: { dano: 2, diz: "o ombro bate na madeira que só cede depois" },
  },
  {
    alvo: "escalada", porPouco: true,
    seca: "você escorrega e volta ao chão, com as mãos em carne viva",
    preco: "você chega em cima, mas chega machucado e sem fôlego",
    minutosExtra: 5,
    /* A QUEDA (v9.66). A falha seca aqui não é "não subiu": é ter subido o
       suficiente para cair. Este é o único preço em pele que não é um
       número fixo — ele passa por uma SALVAGUARDA, porque cair é a coisa
       que acontece CONTRA o herói, e é a definição da segunda rolagem da
       mesa. Era também a pendência mais antiga da tabela de salvaguardas:
       `FONTES_DE_SALVAGUARDA` conhecia a queda e nada a disparava. */
    peleSeca: { queda: true, diz: "o corpo despenca antes de a mão achar onde segurar" },
    pelePorPouco: { condicao: "enfraquecido", diz: "as mãos em carne viva e os braços tremendo" },
  },
  {
    alvo: "busca", porPouco: true,
    seca: "você revira o que dá e não encontra — e o lugar fica remexido, o que qualquer um nota",
    preco: "você acha, mas o dobro do tempo se foi e ficou tudo fora do lugar",
    minutosExtra: 15,
  },
  {
    alvo: "investigacao", porPouco: true,
    seca: "os vestígios não fecham numa história; ficam pedaços soltos",
    preco: "a história fecha, mas custou o triplo do tempo debruçado ali",
    minutosExtra: 20,
  },
  {
    alvo: "rastro", porPouco: true,
    seca: "a trilha se perde e você volta ao ponto em que ela era clara",
    preco: "você reencontra a trilha, mas perdeu meia manhã e terreno para quem vai à frente",
    minutosExtra: 30,
  },
  {
    alvo: "escuta", porPouco: false,
    seca: "você ouve pedaços sem sentido, e encostar ali por tanto tempo é arriscado",
    minutosExtra: 2,
  },
  {
    alvo: "furtividade", porPouco: false,
    seca: "o passo sai errado e o corpo aparece onde não devia",
    minutosExtra: 0,
  },
  {
    alvo: "furto", porPouco: false,
    seca: "a mão erra o tempo e toca onde não devia tocar",
    minutosExtra: 0,
  },
  {
    alvo: "medicina", porPouco: false,
    seca: "o curativo não segura e a hemorragia recomeça pior",
    minutosExtra: 10,
    /* quem trata mal se esgota tentando: o preço é a reserva, não o sangue.
       Ferir o PACIENTE seria mais bonito e é o que a mesa faria — mas o
       desafio não sabe QUEM está sendo tratado, e cobrar de um alvo que o
       sistema não identificou é inventar uma vítima. Fica anotado. */
    peleSeca: { condicao: "enfraquecido", diz: "as mãos tremem de tanto tentar segurar o que não segura" },
  },
  {
    alvo: "fraqueza", porPouco: false,
    seca: "nada do que você sabe encaixa nesta criatura",
    minutosExtra: 0,
  },
  {
    alvo: "arcano", porPouco: true,
    seca: "os símbolos não se deixam ler, e olhar demais para eles cansa",
    preco: "você lê o selo, mas a leitura cobra: a cabeça lateja o resto do dia",
    minutosExtra: 10,
    pelePorPouco: { condicao: "enfraquecido", diz: "o selo devolve o olhar, e a cabeça paga" },
  },
];

export function custoPorAlvo(alvo) { return CUSTO_DE_FALHAR.find((c) => c.alvo === alvo) || null; }

/* ============================================================
   A ALTURA (v9.66)

   De quanto se cai depende de onde se estava subindo, e isso não
   se guarda em lugar nenhum: é DERIVADO, como a dureza da tranca.
   O mesmo muro é o mesmo muro para sempre, e o penhasco dos
   arredores machuca mais que a parede do celeiro — porque quem
   escala escolhe o que escala.

   A regra da mesa é 1d6 por 3 metros. Mantida, com um teto: um
   herói de nível 3 não pode morrer de uma queda de escadaria
   porque o dado foi generoso com a altura.
   ============================================================ */
const ALTURA_POR_LUGAR = [
  { rx: /penhasc|abismo|precip[ií]cio|despenhadeir|falesia|encosta|monte|serra|pico/, base: 9, nome: "o penhasco" },
  { rx: /torre|campan[aá]rio|farol|mastro|muralha|torre[aã]o|atalaia/, base: 7, nome: "a torre" },
  { rx: /telhad|cumeeira|beiral|sacada|varanda|andaime/, base: 5, nome: "o telhado" },
  { rx: /muro|paliçad|palissad|cerca|port[aã]o|parede|fachada|janela/, base: 4, nome: "o muro" },
  { rx: /po[cç]o|fosso|escada|escadaria|corda|arvore|[aá]rvore|pilha/, base: 3, nome: "a subida" },
];

export function quedaDe(semente, lugar, texto = "") {
  const t = norm(texto);
  const l = norm(lugar);
  /* o que a FRASE nomeia ganha do lugar: quem diz "escalo o penhasco" está
     no penhasco, mesmo que o sistema registre a cidade ao lado dele */
  const achou = ALTURA_POR_LUGAR.find((a) => a.rx.test(t)) || ALTURA_POR_LUGAR.find((a) => a.rx.test(l)) || ALTURA_POR_LUGAR[3];
  /* a variação é do LUGAR, não do momento: a mesma parede tem sempre a
     mesma altura, e é isso que separa um mundo de um gerador */
  const r = rngDe(`queda|${semente}|${lugar}|${achou.nome}`);
  const metros = Math.max(2, achou.base + Math.round((r() - 0.5) * 4));
  return { metros, nome: achou.nome, dados: Math.max(1, Math.min(8, Math.round(metros / 3))) };
}

/* A DIFICULDADE DE NÃO SE ESPATIFAR, e ela é só da ALTURA.

   Achado jogando, e é o mesmo bug pela quarta vez neste projeto. A primeira
   versão passava por `dcDaFonte`, que soma nível/3 — o que faz todo sentido
   para o que uma CRIATURA dispara (o veneno do que se caça no nível 12 é
   pior que o do nível 1) e nenhum para um penhasco, que não fica mais alto
   porque o herói subiu de nível. Na tela: 10 metros viraram dificuldade 19
   para um herói de nível 12, e um alpinista experiente errava a salvaguarda
   que um recruta passaria.

   Mora aqui, e não no App, exatamente por isso: uma conta que já voltou
   quatro vezes precisa de uma asserção, e o App não tem onde ter uma. */
export function dcDaQueda(metros) {
  const m = Math.max(1, Number(metros) || 3);
  return Math.max(10, Math.min(20, 10 + Math.round(m / 1.5)));
}

/* Rola a queda. A sorte entra por parâmetro para o teste poder fixá-la —
   e para que ninguém, um dia, sorteie isto com `Math.random` escondido no
   meio de outra função. */
export function rolarQueda(q, { sorte = Math.random } = {}) {
  const n = Math.max(1, Number(q && q.dados) || 1);
  let total = 0;
  for (let i = 0; i < n; i++) total += 1 + Math.floor(sorte() * 6);
  return { total, dados: n, metros: (q && q.metros) || 3, nome: (q && q.nome) || "a queda" };
}

/* O desfecho de uma rolagem que não bateu a dificuldade. `total` e `dc` são
   os números que já saíram — esta função não rola nada e não decide nada
   por sorteio: só lê a distância entre os dois. */
export function desfechoDaFalha(v, total, dc, { emCombate = false } = {}) {
  if (!v || !v.alvoDoCusto) return null;
  const c = custoPorAlvo(v.alvoDoCusto);
  if (!c) return null;
  const faltou = Number(dc) - Number(total);
  if (!(faltou > 0)) return null;
  const porPouco = !!c.porPouco && !emCombate && faltou <= 2;
  return {
    porPouco, faltou, alvo: c.alvo,
    diz: porPouco ? c.preco : c.seca,
    minutosExtra: Math.max(0, Number(c.minutosExtra) || 0),
    barulhoExtra: !!c.barulhoExtra && porPouco,
    /* v9.66: o preço em PELE, e ele é diferente nos dois lados. Quem falha
       por pouco e sobe machucado não é quem falha e despenca — juntar os
       dois num campo só faria a vitória paga e o tombo custarem igual. */
    pele: (porPouco ? c.pelePorPouco : c.peleSeca) || null,
  };
}

export function falaDoCusto(des) {
  if (!des) return "";
  return des.porPouco
    ? `⚖ Faltaram ${des.faltou} — e por tão pouco o mundo negocia: ${des.diz}.`
    : `↯ ${des.diz.charAt(0).toUpperCase()}${des.diz.slice(1)}.`;
}

export function envelopeDoCusto(des, rotulo) {
  if (!des) return "";
  if (des.porPouco) {
    return `[CUSTO — DECIDIDO PELO SISTEMA] Eu falhei por ${des.faltou} no teste de ${rotulo || "perícia"}, e por tão pouco o sistema decidiu que EU CONSIGO — pagando. O que aconteceu: ${des.diz}. O sistema já cobrou o preço (tempo, e o que mais estiver no envelope ao lado).
REGRA DESTE ENVELOPE (obrigatória): narre o sucesso E o preço, os dois, na mesma cena — o preço não é enfeite, é o que eu paguei para ter isto. NÃO transforme em sucesso limpo e NÃO transforme em fracasso. E não invente um custo maior que este: o que custou está escrito aqui.`;
  }
  return `[CUSTO — DECIDIDO PELO SISTEMA] Eu falhei no teste de ${rotulo || "perícia"}, e falhar aqui não é só não conseguir: ${des.diz}. O sistema já cobrou o tempo.
REGRA DESTE ENVELOPE (obrigatória): mostre a falha COM esta consequência, em uma ou duas frases — não como um "nada acontece". NÃO me dê o resultado por generosidade, NÃO ofereça meia-vitória e NÃO invente uma consequência pior que esta.`;
}

/* ---------------- NÃO HAVIA O QUE TESTAR (v9.64) ----------------
   O oráculo respondeu que não há o que ouvir, ou rastro nenhum. Não é
   falha do herói e não é castigo: é o mundo respondendo antes do dado.

   Este envelope existe separado do de busca vazia porque a diferença
   importa na narração. Lá o herói ROLOU e o sucesso comprou a certeza
   ("procurei bem, não há nada"). Aqui não houve dado nenhum — ele
   encostou o ouvido e o silêncio respondeu na hora. */
export function envelopeSemOportunidade(v, oQueEuDisse = "") {
  const disse = oQueEuDisse ? ` Eu disse: "${String(oQueEuDisse).trim()}".` : "";
  const nada = (v && v.oportunidade && v.oportunidade.nada) || "Não há aqui aquilo que eu procurava.";
  return `[SEM TESTE — O MUNDO RESPONDEU ANTES DO DADO]${disse} O sistema perguntou ao mundo se havia o que ${v && v.rotulo ? v.rotulo : "encontrar"} aqui, e a resposta foi NÃO. ${nada} Não houve rolagem porque não havia obstáculo — não se rola contra o que não existe.
REGRA DESTE ENVELOPE (obrigatória): narre em UMA ou DUAS frases o gesto acontecendo e encontrando o vazio, e devolva a palavra para mim. NÃO invente meia-pista, NÃO diga que "algo ainda escapa", NÃO plante um som distante nem uma marca no chão para salvar a cena. O vazio é a resposta verdadeira e ele é uma informação que eu ganhei.`;
}

/* ---------------- PROCUREI BEM, E NÃO HÁ NADA ----------------
   O caso que o envelope de teste comum erra feio. Ele manda "revele UMA
   coisa concreta" no sucesso — e num quarto vazio isso é uma ordem para
   inventar. Passar num teste de busca onde não há nada NÃO é achar: é
   saber que não há. É uma informação legítima, é o que o dado comprou, e
   é ela que fecha o lugar para sempre. */
export function envelopeDeBuscaVazia(rotulo) {
  return `[BUSCA CONCLUÍDA — RESOLVIDO PELO SISTEMA] Passei no teste de ${rotulo || "busca"}: revistei este lugar com competência, do chão ao teto. E o resultado do sucesso é este: AQUI NÃO HÁ NADA ESCONDIDO. Não é falha minha, é a verdade do lugar — o sistema conhece o que existe em cada canto deste mundo e não há nada aqui.
REGRA DESTE ENVELOPE (obrigatória): NÃO invente um achado, NÃO plante uma pista, NÃO sugira que "algo ainda escapa". Narre em duas frases a busca bem-feita e a certeza tranquila de que não há o que achar, e devolva a palavra para mim. Este lugar está encerrado para busca: se eu procurar de novo, diga que já revirei tudo.`;
}

/* ---------------- O BARULHO ----------------
   A força abre e acorda. Sem isto, arrombar seria estritamente melhor que
   a gazua — e a escolha entre as vias, que é o coração da coisa, não
   existiria. */
export function envelopeDoBarulho(rotulo, passou) {
  return `[BARULHO — REGISTRADO PELO SISTEMA] O jeito que usei para ${rotulo} FAZ RUÍDO, e ${passou ? "o que cedeu cedeu com estrondo" : "a pancada ecoou sem resultado"}. Se houver alguém por perto — dono, guarda, morador, o que dorme no andar de baixo, o que caça neste corredor —, ELE OUVIU. Isto é seu para narrar e tem consequência real: alguém acorda, alguém vem ver, alguém passa a saber. NÃO ignore o ruído e NÃO o transforme em nada; se de fato não houver ninguém ao alcance do ouvido, diga isso em uma frase, e o silêncio vira parte da cena.`;
}

/* A linha do prompt que explica a arquitetura ao Mestre. Enxuta porque sobe
   em TODO turno — este bloco não tem porta, já que o jogador pode declarar
   uma ação em qualquer cena. Cada frase aqui custa em toda a campanha. */
export const DESAFIOS_PROMPT = `TESTES — QUEM DECIDE É O SISTEMA (v9.64):
- TRÊS rolagens existem, e só três: TESTE DE PERÍCIA (o herói tenta algo), SALVAGUARDA (algo acontece CONTRA ele) e JOGADA DE ATAQUE (na luta, pelo tabuleiro).
- O jogador NÃO pede testes: ele declara uma AÇÃO ("presto atenção na taverna", "forço a porta"), e quem decide se aquilo pede dado é o SISTEMA. Se ele pedir rolagem, o sistema recusa e devolve a vez — não entregue por narração o que o dado daria.
- ANTES DO DADO, O MUNDO DIZ SE HÁ: o sistema pergunta primeiro se existe o que ouvir, seguir ou achar. Resposta não, teste nenhum — e o vazio é verdade, nunca convite a meia-pista.
- VOCÊ NUNCA ROLA E NUNCA PEDE ROLAGEM. Se havia teste, o envelope já chegou com o resultado; se não chegou envelope, não era teste — narre e siga.
- DUAS CONDIÇÕES para haver dado, e as duas precisam valer: chance real de falhar E custo real por falhar. Sem elas o sistema resolve sem rolar, e competência se narra como competência, nunca como sorte.
- MESMO OBSTÁCULO, MESMA ABORDAGEM, UMA VEZ SÓ. Insistir igual não rola de novo; reabre com outra abordagem, ajuda, ferramenta nova ou muito mais tempo, e o sistema avisa.
- LUGAR VASCULHADO FICA VASCULHADO: não invente achado novo para preencher a cena.
- O QUE ESTÁ TRANCADO abre de quatro jeitos — a chave, ferramentas de ladrão, uma magia que abra, ou força bruta —, cada um com dificuldade e barulho próprios, e o sistema já escolheu qual foi. Força faz BARULHO, e quem ouviu já chega decidido no envelope.`;
