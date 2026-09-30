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
import { detectarPedidoDeTeste, semOPedidoDeTeste, nomeDoAtributo } from "./testes.js";
import { dificuldadeSocial, foraDaConversa, envelopeForaDaConversa } from "./social.js";
import { NAO_E_AGRESSAO, RX_AGRESSAO } from "./agressao.js";
import { soODeclarado, emProclise, NAO_E_DECLARACAO } from "./peneira.js";

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
/* ============================================================
   A RÉGUA (v9.67)

   Até aqui as dificuldades do catálogo eram 13, 14 e 15, e nenhuma
   delas sabia dizer por que era aquela. Um número sem nome não se
   discute e não se ajusta: quem for mexer daqui a um mês vai olhar
   um 14 e não ter como saber se ele quis dizer "isso é difícil" ou
   "alguém digitou 14".

   A régua dá nome a cada degrau, e o nome é a justificativa. É
   também o que permite ao sistema RESPONDER, e não só rolar: quando
   um obstáculo é `trivial`, não há teste — há uma pessoa competente
   fazendo o que sabe fazer.

   O que isto mudou nos números que já existiam: cinco entradas que
   marcavam 14 subiram para 15 (`incomum`), porque 14 não era degrau
   de nada. Um ponto em cada, e agora todas têm nome.
   ============================================================ */
export const DIFICULDADES = [
  { id: "trivial", dc: 5, nome: "trivial", diz: "qualquer um faz — e por isso não se rola" },
  { id: "facil", dc: 10, nome: "fácil", diz: "quem tem o mínimo de jeito consegue" },
  { id: "comum", dc: 13, nome: "comum", diz: "o obstáculo do dia a dia de quem vive assim" },
  { id: "incomum", dc: 15, nome: "incomum", diz: "exige atenção de verdade, e não perdoa distração" },
  { id: "dificil", dc: 18, nome: "difícil", diz: "só quem treinou passa com alguma frequência" },
  { id: "arduo", dc: 21, nome: "árduo", diz: "especialista, e ainda assim com sorte" },
  { id: "heroico", dc: 25, nome: "heroico", diz: "a história conta esse dia porque quase ninguém conseguiria" },
];
export function dificuldadePorId(id) { return DIFICULDADES.find((d) => d.id === id) || null; }
/* o degrau em que um número cai — para o sistema poder dizer "isto é
   difícil" em vez de "isto é 18", que é o que o jogador entende */
export function degrauDaDC(dc) {
  const n = Number(dc) || 0;
  return [...DIFICULDADES].reverse().find((d) => n >= d.dc) || DIFICULDADES[0];
}
const DC = (id) => (dificuldadePorId(id) || { dc: 13 }).dc;

/* ============================================================
   PROCURAR PARA IR (30/09, da prova jogada de MM13)

   "Procuro uma taverna" deu um teste de Percepção e um baú de 168
   moedas. A frase casou `procur` na primeira entrada do catálogo, e
   `buscar` fez o que sabe fazer: revirou o lugar onde o herói estava e
   pagou o que a base do mundo tinha escondido por perto. O herói só
   queria um sítio para dormir.

   PROCURAR TEM DOIS SENTIDOS EM PORTUGUÊS, e o objeto é que os separa:
     · procurar ALGO NUM SÍTIO — pistas, armadilhas, o fundo falso, a
       chave caída — é revirar, e rola;
     · procurar UM SÍTIO, ALGUÉM ou UM SERVIÇO — uma taverna, o
       mercado, um guia, trabalho, onde dormir — é ir até lá ou
       perguntar ao mundo, e não rola: ninguém falha em achar o mercado
       de uma cidade, e o mundo diz onde fica.

   A tabela é uma lista de DESTINOS, não de achados, e a razão é o lado
   do erro: um destino que falte devolve a frase ao `buscar` (o que
   sempre foi); um achado que faltasse aqui calaria uma busca a sério.
   Três travas mantêm a busca de pé mesmo com um destino na frase:
   o verbo de revirar ("vasculho a taverna" é busca), o sinal de coisa
   escondida ("a saída secreta") e o complemento de lugar antes do
   objeto ("procuro NA taverna o que for"), que o molde não aceita.
   ============================================================ */
export const PROCURAR_PARA_IR = {
  /* o verbo, em todas as formas que a mesa escreve — "procuro",
     "procurar por", "à procura de", "em busca de", "buscando" */
  verbo: "(?:procur\\w*|busc\\w*|a procura|em busca)",
  /* o que pode vir entre o verbo e o objeto: preposição do objeto
     ("procuro por", "à procura de", "procuro pela taverna" — ir, e não
     revirar, porque o lado seguro de uma frase ambígua é não rolar), o
     artigo e um adjetivo curto ("uma boa estalagem", "a mais próxima").
     Menos "pelo quarto", "pela sala", "pela casa": ali o "pelo" é o
     percurso da busca — procuro PELO quarto inteiro —, e o cômodo onde
     se está não é destino. "Pela casa DE Orin" continua a ser ir. */
  ligacao: "(?:(?:por|pel[oa]s?(?!\\s+(?:quarto|cama|comodo|sala|chao|casa(?!\\s+d)|cela|cabana|barraca|tenda|carroca|barco|navio)\\b)|de|d[oa]s?|dum|duma)\\s+)?(?:(?:um|uma|uns|umas|o|a|os|as|algum|alguma|alguns|algumas|outr[oa]s?|ess[ea]|est[ea]|aquel[ea]|meu|minha|seu|sua)\\s+)?(?:(?:bo[am]|melhor|barat[oa]|decente|tal|nov[oa]|velh[oa]|grande|pequen[oa]|mais proxim[oa])\\s+)?",
  /* os destinos: sítios da cidade e da estrada, serviços, gente por
     ofício (a lista antiga de `buscar` já barra taverneiro, ferreiro,
     guarda — estes são os que faltavam) e o que se procura sem ser
     objeto: trabalho, notícia, conselho, um jeito de */
  destinos: [
    /* sítios */
    "taverna", "estalage", "hospedar", "pousada", "albergue", "bodega", "botequim", "tasca", "cervejaria",
    "mercado", "feira", "praca", "porto", "cais", "doca", "templo", "santuario", "igreja",
    "ferraria", "forja", "loja", "armazem", "emporio", "bazar", "mercearia", "padaria", "acougue", "botica",
    "estabulo", "cocheira", "estrebaria", "quartel", "guarnicao", "prefeitura", "paco", "castelo", "palacio",
    "biblioteca", "academia", "guilda", "banco", "casa de", "casa d[oa]", "banhos", "bordel", "teatro", "arena",
    "portao", "portoes", "saida", "estrada", "rua", "bairro", "distrito", "avenida", "ponte", "farol",
    "moinho", "fazenda", "cidade", "vila", "aldeia", "vilarejo", "caravana", "barco", "navio", "embarcacao",
    "carona", "transporte", "diligencia", "lugar", "sitio", "canto para", "canto onde",
    /* o pouso e a mesa */
    "quarto", "cama", "pouso", "pernoite", "estadia", "refeicao", "bebida", "comida",
    /* gente por ofício ou laço */
    "guia", "mercenari", "soldado", "sargento", "chefe", "lider", "prefeito", "alcaide", "burgomestre", "mestre",
    "aprendiz", "bardo", "alfaiate", "sapateiro", "padeiro", "acougueiro", "pescador", "cacador", "lenhador",
    "cavalarico", "boticario", "alquimista", "mago", "maga", "feiticeir", "bruxa", "sabio", "escriba", "erudito",
    "nobre", "lorde", "dama", "crianca", "menino", "menina", "garot", "mendigo", "viajante", "estrangeir",
    "peregrino", "monge", "freira", "clerigo", "druida", "patrulha", "parente", "irma", "pai", "mae", "filh",
    "esposa", "marido", "noiv", "mentor", "patrao", "contratante", "recrutador", "capataz", "carcereiro", "juiz",
    "escrivao", "cambista", "agiota", "joalheiro", "armeiro", "ourives", "carpinteiro", "cartografo",
    "marinheiro", "ladrao", "assassino", "culpado", "testemunha", "quem",
    /* o que se procura sem ser objeto */
    "trabalho", "emprego", "servico", "bico", "ocupacao", "informac", "noticia", "boato", "rumor", "conselho",
    "ajuda", "orientac", "direc", "indicac", "jeito de", "forma de", "maneira de", "modo de", "onde",
  ],
  /* o que diz que a frase É uma busca, mesmo com destino: o verbo de
     revirar e o sinal de coisa escondida */
  revirar: /\b(vasculh|revir|remex|fu[cç]|esquadrinh|inspecion|revist|dou (uma )?busca|pente fino)/,
  escondido: /\b(secret|escondid|ocult|disfar[cç]ad|fals[oa]s?\b|armadilh|pistas?\b|rastros?\b|vestigi|pegadas?\b|esconderij|compartiment|alcap)/,
};

const RX_VERBO_DE_PROCURAR = new RegExp(`\\b${PROCURAR_PARA_IR.verbo}\\b`, "g");
/* depois do verbo: o destino, ou um infinitivo ("procuro saber",
   "procuro me lembrar" — procurar é tentar, e o que se tenta é outro
   verbo, que o resto do catálogo e o improviso leem) */
const RX_PROCURA_DE_IR = new RegExp(
  `^${PROCURAR_PARA_IR.verbo}\\s+(?:${PROCURAR_PARA_IR.ligacao}(?:${PROCURAR_PARA_IR.destinos.join("|")})|(?:me\\s+|se\\s+|nao\\s+)?[a-z]+(?:ar|er|ir)\\b)`,
);

/* A frase procura para IR? Verdadeiro só quando TODA procura da frase é
   por um destino — "procuro uma taverna e vasculho o quarto dela"
   continua a ser busca. */
export function ehProcuraDeIr(texto) {
  const t = norm(texto);
  if (!t) return false;
  if (PROCURAR_PARA_IR.revirar.test(t) || PROCURAR_PARA_IR.escondido.test(t)) return false;
  const verbos = [...t.matchAll(RX_VERBO_DE_PROCURAR)];
  if (!verbos.length) return false;
  return verbos.every((m) => RX_PROCURA_DE_IR.test(t.slice(m.index)));
}

export const DESAFIOS = [
  {
    id: "buscar",
    /* v9.64: o jogador deixou de poder pedir teste, e a rede que sobrou
       tinha de ser mais larga — tirar a porta de trás e manter o funil
       seria piorar o jogo em nome da regra. Entram os verbos de conferir
       ("verifico o quarto" era o exemplo do próprio jogador e NÃO casava
       nada), de esquadrinhar e de passar os olhos. */
    /* 30/09 (MM13): `revist` — "revisto a taverna de cima a baixo" é o verbo
       mais seco que a língua tem para isto, e não casava nada. */
    rx: /\b(vasculh|revir|revist|remexo|procur|busco|dou uma olhada|olho em volta com|examino o|examino a|examino esse|reviro|fu[cç]o|inspeciono|presto (bastante )?aten[cç][aã]o|reparo (n|em)|olho com aten[cç][aã]o|dou busca|verific|confiro|checo|esquadrinh|passo os olhos|dou uma vasculhada|dou uma geral|reviso o|corro os olhos)/,
    /* PROCURAR UMA PESSOA NÃO É VASCULHAR UM LUGAR, e a diferença é cara: um
       falso positivo aqui marca o quarto como revirado por causa de "procuro
       o taverneiro". A lista é de gente porque é o caso real; o falso
       negativo apenas devolve o turno ao Mestre, que é o lado seguro. */
    /* v9.64: e com os verbos de conferir entrou um falso positivo novo —
       "verifico se a porta está trancada" é sobre a TRANCA, e `buscar` vem
       antes dela no catálogo, então roubaria a frase e marcaria o cômodo
       como revirado. Conferir se algo está fechado não é vasculhar. */
    /* v9.67: `buscar` é a PRIMEIRA entrada do catálogo, e por isso é a que
       mais precisa saber recuar. Cada leva nova de desafios devolve para
       cá uma palavra que ela roubaria: examinar um CORPO é Medicina,
       procurar ÁGUA no ermo é Sobrevivência, e nenhuma das duas é revirar
       um cômodo — mas as três dizem "examino" e "procuro". */
    naoSe: /\b(pessoa|gente|rosto|olhos del[ae]|taverneir|ferreir|mercador|guarda|capit[aã]|sacerdot|ac[oó]lito|estalajadeir|curandeir|algu[eé]m|homem|mulher|rapaz|mo[cç]a|velh[oa]|companheir|amig|aliad|informante|contato|comprador|vendedor|barqueir|cocheir|dono d|taverneira)|\b(verific|confiro|checo)\w*\s+(se\s+)?[^.]{0,24}\b(trancad|destrancad|fechad|abert|porta|fechadura|cadeado|tranca)\b|\b(corpo|cad[aá]ver|ferimento|ferido|morto|doente|pulso)\b|\b(procuro|acho|busco)\s+(a|o|um|uma)?\s*(agua|[aá]gua|abrigo|po[cç]o|comida|caminho|norte|rumo|lenha)\b|\b(memoria|lembrancas?)\b/,
    /* MM4: a última alternativa acima. A MEMÓRIA não é um cômodo: "vasculho
       a memória atrás do nome dele" casava `vasculh` e marcava o quarto como
       revirado — o corpus do improviso achou. Lembrar é Intelecto, e cai no
       improviso lá embaixo. */
    /* v9.130: e o guarda que FALTAVA. A lista acima conhece oficios; esta
       linha conhece gente — se a frase nomeia alguem que o jogo tem no
       elenco, na base ou na espinha, isto e uma PROCURA, e procurar alguem
       nunca foi revirar um comodo. */
    /* 30/09 (MM13): e o sítio, o serviço e o ofício, que também não são
       revirar um cômodo — `PROCURAR_PARA_IR`, logo antes do catálogo. */
    naoSeCom: (txt, ctx) => ehProcuraDeIr(txt) || !!(ctx && typeof ctx.ehPessoaConhecida === "function" && ctx.ehPessoaConhecida(txt)),
    pericia: "percepcao", alvo: "busca", minutos: 10, barulho: false,
    rotulo: "vasculhar o lugar",
    /* a dificuldade sai do que existe aqui; sem nada, o sistema ainda deixa
       procurar UMA vez — saber que não há nada é informação, e informação
       não sai de graça */
    dcPadrao: DC("comum"),
  },
  {
    id: "investigar",
    rx: /\b(investig|deduzo|dedu[zç]|junto as pistas|analiso a cena|leio os vest[ií]gios|procuro pistas|o que aconteceu aqui|reconstruo)/,
    pericia: "investigacao", alvo: "investigacao", minutos: 15, barulho: false,
    rotulo: "ler os vestígios", dcPadrao: DC("incomum"), lePergunta: true,
  },
  {
    id: "escutar",
    /* "ouço passos" é narração, não perícia. Escutar como AÇÃO precisa de
       alvo ou de esforço declarado — sem isso, todo turno viraria teste. */
    rx: /\b(escuto (a\b|à\b|na\b|no\b|atr[aá]s|pela|pelo)|fico escutando|encosto o ouvido|presto o ouvido|apuro os ouvidos|escuto com aten)/,
    pericia: "percepcao", alvo: "escuta", minutos: 2, barulho: false,
    rotulo: "escutar", dcPadrao: DC("comum"),
    /* v9.64: antes do dado, o mundo diz se HÁ o que ouvir. Sem isto, este
       teste rolava sempre — e a pergunta "havia mesmo alguém falando do
       outro lado?" sobrava para a IA, que responde pela cena que quer
       contar e não pelo lugar onde o herói está. */
    oportunidade: { pergunta: "haOQueOuvir", nada: "Não há o que escutar daqui — nem voz, nem passo, nem respiração." },
  },
  {
    id: "fraqueza",
    rx: /\b(fraqueza|ponto fraco|vulnerab|identific\w* (o|a|esse|essa|aquele)?\s*(inimigo|criatura|monstro|bicho)|o que (eu )?sei sobre|reconhe[cç]o (o|a|esse|essa))/,
    /* v9.67: `reconheço esse ___` é largo demais, e a leva nova trouxe quem
       o disputa. Reconhecer a criatura é lembrar do bestiário; reconhecer
       um BRASÃO é lembrar de quem manda em quem — outra pergunta, outra
       cena, e as duas caem em Saberes, o que torna a confusão invisível no
       número e visível na ficção. */
    naoSe: /\b(bras[aã]o|estandarte|emblema|bandeira|sotaque|dialeto|casa (é|e|de)|reino|ordem|selo da casa)\b/,
    pericia: "saberes", alvo: "fraqueza", minutos: 0, barulho: false,
    rotulo: "lembrar o que se sabe da criatura", dcBase: DC("incomum"), dispensavel: true, lePergunta: true,
    /* este é o único que vale DENTRO da luta sem penalidade de tempo: é
       exatamente para isto que a perícia de saberes existe */
    valeEmCombate: true,
  },
  {
    id: "mentira",
    rx: /\b(ele est[aá] mentindo|ela est[aá] mentindo|se ele mente|se ela mente|leio (as )?inten[cç]|tento saber se|desconfio|sinto se|percebo se mente)\b/,
    pericia: "intuicao", alvo: "intuicao", minutos: 0, barulho: false,
    rotulo: "ler a intenção", dcPadrao: DC("incomum"), lePergunta: true,
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
    rx: /\b(escal|trepo|subo (o\b|a\b|pel)|me i[cç](o|ar)|galgo|escalar)/,
    /* MM4: "subo a escada até o quarto" rolava Atletismo — o corpus do
       improviso achou. `SEM_DADO` já dizia que subir a escada é andar; o
       catálogo é que a roubava antes. "Subo PELA escadaria" (a ruína, a
       torre) continua sendo subida com queda — é o exemplo da suíte social. */
    naoSe: /\bsubo (a|as) (escada|escadas)\b/,
    pericia: "atletismo", alvo: "escalada", minutos: 5, barulho: false,
    rotulo: "escalar", dcPadrao: DC("incomum"), corpo: true,
  },
  {
    id: "furtar_se",
    rx: /\b(me esgueiro|esgueir|na surdina|sem ser vist|sorrateir|em sil[eê]ncio at[eé]|me escond(o|er|erei)\b|fico na sombra|sigo sem que|me mistur(o|ar) (a|na|no|com a|entre a|entre o) (multid[aã]o|turba|gente|povo|plateia|prociss[aã]o|feira|romaria|fila)|me aproxim(o|ar) (sem (fazer )?(ru[ií]do|barulho)|em sil[eê]ncio|p[eé] ante p[eé]|na ponta dos p[eé]s|de mansinho)|me (agach|abaix)(o|ar) (atr[aá]s|detr[aá]s|nas? sombras?|entre|sob|debaixo|embaixo))/,
    /* Fase MM (a ênclise): "escondo-me" não rolava nada, e "tento me
       esconder" também não — a regra só conhecia "me escondo". A ênclise
       chega aqui já desfeita (emProclise, em lerAcao); o infinitivo é que
       faltava. E três jeitos de se esconder que a mesa usa e o catálogo não
       tinha: misturar-se na multidão, chegar sem ruído, agachar-se atrás de
       algo. Nenhum deles rola se for pergunta — o catálogo passou a ler a
       peneira. */
    pericia: "furtividade", alvo: "furtividade", minutos: 5, barulho: false, testemunha: true,
    rotulo: "passar sem ser visto", dcPadrao: DC("incomum"),
  },
  {
    id: "bater_carteira",
    rx: /\b(bato a carteira|surrupi|furto (a\b|o\b|dele|dela)|punguei|punho a bolsa|tiro do bolso dele|roubo a bolsa|planto)/,
    pericia: "prestidigitacao", alvo: "furto", minutos: 1, barulho: false, testemunha: true,
    rotulo: "mão leve", dcPadrao: DC("incomum"),
  },
  {
    id: "convencer",
    /* Conversa não se rola — só o que a conversa TENTA arrancar contra
       resistência. "Peço uma cerveja" não é Persuasão; "tento convencer o
       guarda a me deixar passar" é. A régua é o verbo de esforço. */
    rx: /\b(tento convencer|conven[cç]o|persuad|nego[cç]io com|argument|insisto com|tento negociar|barganho|pechinch)/,
    pericia: "persuasao", alvo: "persuasao", minutos: 10, barulho: false,
    rotulo: "convencer", dcPadrao: DC("incomum"), social: true,
  },
  {
    /* ---------------- A APROXIMAÇÃO (v9.69) ----------------
       Relatado com a frase exata: "vou na elfa bonita que acabou de passar
       por mim e digo: você caiu do céu? porque você é um anjo". Hoje isso
       cai em `livre` — "digo" está na lista do que não se rola — e vira
       ficção pura: sem dado, sem torcida, sem prêmio nem consequência. É o
       momento mais comum de uma mesa e o sistema não tinha nada para ele.

       O GATILHO NÃO PODE SER A CANTADA. Nenhum regex separa com segurança
       um galanteio de uma conversa fiada pelo CONTEÚDO, e tentar isso
       faria o sistema pedir dado a cada frase — que é justamente o que
       cansa e o que o autor pediu para evitar.

       O gatilho é a ESTRUTURA: aproximar-se de alguém e dizer uma fala
       DIRIGIDA a essa pessoa. Quem escreve a própria fala está
       performando, e performar diante de um estranho é Presença. As duas
       condições precisam valer — há uma pessoa que o sistema sabe nomear,
       e há uma fala endereçada a ela.

       E o freio contra o teste a cada turno não é o regex: é o LIVRO DE
       TENTATIVAS. A chave social é pessoa + tamanho do pedido, então cada
       pessoa dá UMA primeira impressão. Insistir na mesma cantada com a
       mesma pessoa ouve "você já tentou isso". */
    id: "impressionar",
    /* SEM `\b` no fim, e isto é a TERCEIRA vez na mesma sessão de trabalho
       que esta armadilha aparece: `elogi\b` não casa "elogio" e
       `me aproximo d\b` não casa "dela", porque o que vem depois do
       radical é letra, não fronteira. O `\b` da esquerda basta — é ele que
       impede o radical de casar no meio de outra palavra. */
    rx: /\b(cantada|elogi|flert|charme|gracejo|galanteio|quebr(o|ar) o gelo|puxo conversa|dou em cima|chego junto|sorrio para|pisco para|tento impressionar|me apresent(o|ar) (a|ao|para))|\b(vou (n|at[eé] )(a|o|na|no)|chego (n|at[eé] )(a|o|na|no)|me aproxim(o|ar) d|paro d(o|a)|abordo)[^.!?]{0,60}\b(e (digo|falo|solto|comento|pergunto)|dizendo|falando)\b/,
    /* pedir informação a alguém não é se apresentar a alguém: quem chega
       com uma pergunta de balcão está na porta da cortesia, não na da
       simpatia, e o degrau resolve isso sozinho — mas a BRIGA não. */
    naoSe: /\b(ataco|golpeio|saco a|puxo a (espada|faca|adaga)|avan[cç]o (n|sobre)|parto para cima)\b/,
    pericia: "persuasao", alvo: "impressao", minutos: 5, barulho: false,
    rotulo: "causar boa impressão", dcPadrao: DC("comum"), social: true,
  },
  {
    id: "intimidar",
    /* MM4: e o olhar que dobra alguém. "Encaro o guarda nos olhos até ele
       desviar" não casava nada; nesta casa Intimidação é da Força, e por isso
       o olhar mora aqui, e não numa família de Presença do improviso. */
    /* MM9: e ENVERGONHAR. Humilhar alguém diante dos seus para ele ceder é
       quebrar-lhe a coragem, não convencê-lo — a mesma perícia. */
    /* E A ORDEM DE SE RENDER, que é a frase mais natural da luta sem espada
       ("rendam-se!", "larguem as armas!") e não casava nada: ia ao Narrador
       sem dado. Só a ordem aos OUTROS — "me rendo" é o herói a render-se, e
       não entra. As duas formas, porque a ênclise chega desfeita. */
    rx: /\b(intimid|amea[cç]o|meto medo|na marra|no grito|ponho a m[ãa]o na espada para|envergonh|humilh|rendam-se|renda-se|rende-te|te rende(?! (nada|mais|menos|muito|pouco|bem|dinheiro|lucro|moedas))|se rendam|te rendas|larguem as armas|larga a arma|largue a arma|baixem as armas|abaixem as armas)|\bencaro (o|a|os|as|ele|ela|eles|elas|aquele|aquela|esse|essa)\b[^.!?]{0,30}\b(nos olhos|sem piscar|at[eé] (ele|ela|eles|elas) (desviar|baixar|recuar|desistir|ceder)|de cima a baixo)/,
    pericia: "intimidacao", alvo: "intimidacao", minutos: 5, barulho: true,
    rotulo: "intimidar", dcPadrao: DC("incomum"), social: true,
  },
  {
    id: "mentir",
    rx: /\b(minto|mentir|blefo|blefar|engano|finjo ser|me pass(o|ar) por|disfar[cç])/,
    pericia: "enganacao", alvo: "enganacao", minutos: 5, barulho: false,
    rotulo: "enganar", dcPadrao: DC("incomum"), social: true,
  },
  {
    id: "rastrear",
    rx: /\b(rastre|sigo as pegadas|sigo o rastro|seguir o rastro|leio o ch[aã]o|farejo)/,
    pericia: "sobrevivencia", alvo: "rastro", minutos: 30, barulho: false,
    rotulo: "rastrear", dcPadrao: DC("incomum"),
    /* meia hora de mundo por tentativa: rolar contra um chão que não tem
       pegada nenhuma custava caro e devolvia narração de consolo */
    oportunidade: { pergunta: "haRastro", nada: "Não há rastro aqui — o chão não guardou nada que se possa seguir." },
  },
  {
    id: "estancar",
    rx: /\b(estanco|estancar|estabilizo|estabilizar|trato o ferimento|cuido do ferimento|fa[cç]o um curativo)\b/,
    pericia: "medicina", alvo: "medicina", minutos: 10, barulho: false,
    rotulo: "estancar", dcPadrao: DC("comum"),
  },
  {
    id: "arcano",
    rx: /\b(identific\w* (a|o) (magia|feiti|selo|runa|encant)|reconhe[cç]o (a|o) (magia|selo|runa)|leio a runa|examino o selo|o que (é|e) esse feiti)\b/,
    pericia: "arcanismo", alvo: "arcano", minutos: 10, barulho: false,
    rotulo: "ler o arcano", dcPadrao: DC("incomum"), lePergunta: true,
  },

  /* ============================================================
     A SEGUNDA LEVA (v9.67)

     O catálogo tinha quinze entradas e uma lacuna que dá para medir:
     QUATRO das dezoito perícias da ficha não tinham como aparecer no
     jogo. Acrobacia, Fortitude, Montaria e Atuação existiam na tela
     de personagem, custavam pontos para treinar, e não havia frase
     nenhuma no mundo que as convocasse. Um jogador podia gastar a
     especialização inteira em Acrobacia e nunca rolar uma.

     E dentro das perícias já cobertas faltavam os momentos mais
     comuns de uma mesa: desarmar a armadilha (numa masmorra cheia
     delas), atravessar a nado, saltar o vão, empurrar o que é
     pesado, escapar das cordas, orientar-se no ermo, dizer de que
     alguém morreu.

     A régua para entrar aqui é a mesma que sempre foi, e é o que
     protege isto de virar uma lista de gatilhos: VERBO DE ESFORÇO
     DECLARADO. "Olho o cavalo" não é Montaria; "domo o cavalo que
     empinou" é. O falso positivo custa uma chamada e uma cena; o
     falso negativo só devolve o turno ao Mestre, que é o lado
     seguro de errar.
     ============================================================ */
  {
    /* A armadilha existia na masmorra e não havia como declarar que se
       tenta desarmá-la: o jogador passava por cima e torcia. */
    id: "desarmar",
    rx: /\b(desarm|desativ|neutraliz\w* (a|o) (armadilha|mecanismo|gatilho)|corto o fio|trav(o|ar) o mecanismo|prendo o gatilho|cal[cç]o a placa)/,
    pericia: "prestidigitacao", alvo: "armadilha", minutos: 5, barulho: false,
    rotulo: "desarmar a armadilha", dcPadrao: DC("dificil"),
  },
  {
    id: "nadar",
    rx: /\b(nado|nadar|atravesso a nado|me jog(o|ar) n[oa] (agua|[aá]gua|rio|mar)|mergulho (n|at[eé]|para))/,
    pericia: "atletismo", alvo: "nado", minutos: 10, barulho: false,
    rotulo: "atravessar a nado", dcPadrao: DC("comum"), corpo: true,
  },
  {
    id: "saltar",
    rx: /\b(salto (o\b|a\b|para|por cima|sobre)|pulo (o\b|a\b|para|por cima|sobre|do\b)|dou um salto|me atir(o|ar) (para|sobre|por))/,
    pericia: "atletismo", alvo: "salto", minutos: 0, barulho: false,
    rotulo: "saltar o vão", dcPadrao: DC("incomum"), corpo: true, queda: true,
  },
  {
    /* vem DEPOIS da tranca de propósito: "forço a porta" é arrombamento, e
       a tranca está antes no catálogo. Aqui mora o resto do que é peso —
       a pedra, a grade, o que precisa ser segurado antes de cair. */
    id: "forcar",
    rx: /\b(empurro (a\b|o\b)|arrasto (a\b|o\b)|levanto (a\b|o\b|esse|essa)|movo (a\b|a pedra|o bloco)|seguro (a|o) (porta|port[aã]o|grade|pedra|viga|corda)|entorto|arranco (a|o) (grade|barra|tabua|t[aá]bua))/,
    /* MM4: "levanto a caneca e brindo" rolava Atletismo contra 15 — o corpus
       do improviso achou. O que se ergue com dois dedos não é peso; a lista é
       de coisas leves e de partes do próprio corpo, que é onde "levanto" e
       "arrasto" deixam de ser esforço e viram gesto. */
    naoSe: /\b(levanto|arrasto|empurro) (a|o) (caneca|copo|taca|mao|maos|braco|cabeca|olhar|voz|sobrancelha|vela|lanterna|tocha|chapeu|capuz|garrafa|bandeira|punho|cadeira|banco|banquinho|cortina|manga|gola|saia|capa|pe)\b|\b(seguro|empurro) a porta (para|e entro|e saio|e passo|devagar|aberta)\b/,
    pericia: "atletismo", alvo: "peso", minutos: 5, barulho: true,
    rotulo: "vencer o peso", dcPadrao: DC("incomum"), corpo: true,
  },
  {
    id: "equilibrio",
    rx: /\b(me equilibr(o|ar)|atravesso (a|o) (viga|corda|tronco|parapeito|beiral|telhado)|ando pel[ao] (viga|corda|beiral|parapeito)|passo pel[ao] (peitoril|beiral|parapeito))/,
    pericia: "acrobacia", alvo: "equilibrio", minutos: 2, barulho: false,
    rotulo: "atravessar sem cair", dcPadrao: DC("incomum"), corpo: true, queda: true,
  },
  {
    id: "escapar",
    rx: /\b(me solt(o|ar)\b|me desvencilh(o|ar)|escapo (da|das|do|dos) (corda|amarra|algema|n[oó]|la[cç]o|rede|teia|agarr)|solto os pulsos|me contor[cç](o|er)|escorrego pel[ao] (grade|abertura|fresta))/,
    pericia: "acrobacia", alvo: "escapar", minutos: 5, barulho: false,
    rotulo: "escapar do que prende", dcPadrao: DC("incomum"), corpo: true,
  },
  {
    /* FORTITUDE COMO TESTE, NÃO COMO SALVAGUARDA, e a diferença é quem
       começa: quem segura o fôlego para atravessar o alagado está TENTANDO
       algo; quem é envenenado está sofrendo algo. A segunda ninguém pede —
       e por isso não há aqui nenhum "resisto ao veneno". */
    id: "aguentar",
    rx: /\b(seguro o f[oô]lego|prendo a respira[cç][aã]o|aguento (a\b|o\b|mais|firme|em p[eé])|suporto (a\b|o\b)|cerro os dentes|fico de p[eé]|marcho (a\b|sem|mais)|viro a noite|bebo com ele)/,
    pericia: "fortitude", alvo: "aguentar", minutos: 5, barulho: false,
    rotulo: "aguentar", dcPadrao: DC("incomum"), corpo: true,
  },
  {
    id: "cavalgar",
    rx: /\b(esporeio|cavalgo|galopo|monto (no|na|o cavalo|a [eé]gua)|conduzo (a|o) (carro[cç]a|carreta|charrete|tren[oó]|barca)|guio (a|o) (carro[cç]a|carreta)|salto com o cavalo)/,
    pericia: "montaria", alvo: "montaria", minutos: 5, barulho: false,
    rotulo: "dominar a montaria", dcPadrao: DC("comum"), corpo: true, queda: true,
  },
  {
    id: "acalmar_bicho",
    rx: /\b(acalmo (o|a) (cavalo|[eé]gua|c[aã]o|cachorro|mula|boi|bicho|animal|fera|besta)|me aproxim(o|ar) devagar d|estendo a m[aã]o para (o|a) (bicho|animal|cavalo|c[aã]o)|falo baixo com (o|a) (bicho|animal|cavalo))/,
    pericia: "montaria", alvo: "bicho", minutos: 5, barulho: false,
    rotulo: "acalmar o bicho", dcPadrao: DC("incomum"),
  },
  {
    id: "atuar",
    rx: /\b(canto (para|na|no|uma)|toco (para|a|o|na|no) (m[uú]sica|ala[uú]de|flauta|harpa|tambor|sala|taverna|gente|mesa)|conto uma hist[oó]ria|declamo|recito|dan[cç]o para|fa[cç]o um n[uú]mero|subo no palco|puxo uma can[cç][aã]o)/,
    pericia: "atuacao", alvo: "atuacao", minutos: 15, barulho: true,
    rotulo: "prender a sala", dcPadrao: DC("incomum"),
    /* NÃO é `social`, e a suíte flagrou isto: `social` liga a escada do
       PEDIDO — quanto custa arrancar uma coisa de UMA pessoa —, e cantar
       para uma taverna não pede nada a ninguém. A plateia é uma sala, não
       um interlocutor: não há relação, não há alavanca, não há o que ela
       ceda. É um teste de perícia contra o ambiente, e o número é o do
       catálogo. */
  },
  {
    id: "orientar",
    rx: /\b(me orient(o|ar)|acho o (norte|caminho|rumo)|leio o c[eé]u|leio as estrelas|procuro (a|um)?\s*(um )?(po[cç]o|abrigo|[aá]gua|agua)|monto acampamento no|escolho onde acampar|ca[cç]o (algo|comida|bicho))/,
    pericia: "sobrevivencia", alvo: "orientar", minutos: 40, barulho: false,
    rotulo: "não se perder", dcPadrao: DC("comum"), dispensavel: true,
  },
  {
    id: "diagnosticar",
    rx: /\b(examino o (corpo|cad[aá]ver|ferimento|ferido|morto|doente)|de que (ele|ela|isso) morreu|do que (ele|ela) (est[aá] doente|padece)|vejo o que (ele|ela) tem|abro o corpo|checo o pulso)/,
    pericia: "medicina", alvo: "diagnostico", minutos: 15, barulho: false,
    rotulo: "ler o corpo", dcPadrao: DC("incomum"), dispensavel: true, lePergunta: true,
  },
  {
    id: "heraldica",
    rx: /\b(de quem (é|e) (esse|este|aquele) (bras[aã]o|estandarte|s[ií]mbolo|emblema)|reconhe[cç]o (o|esse|este) (bras[aã]o|estandarte|emblema|sotaque|dialeto)|que casa (é|e)|de que reino|que ordem (é|e) essa)/,
    pericia: "saberes", alvo: "heraldica", minutos: 2, barulho: false,
    rotulo: "reconhecer de onde vem", dcPadrao: DC("incomum"), dispensavel: true, lePergunta: true,
  },
  {
    id: "falsificar",
    rx: /\b(falsific|forjo (a|o) (assinatura|documento|carta|ordem|salvo-conduto)|imito (a letra|a assinatura|o timbre)|adulter(o|ar) (o|a))/,
    pericia: "enganacao", alvo: "falsificar", minutos: 40, barulho: false,
    rotulo: "falsificar", dcPadrao: DC("dificil"),
  },
  {
    /* seguir uma PESSOA agora não é ler um rastro no chão: rastrear vem
       antes no catálogo e cuida das pegadas; isto é a sombra atrás de
       alguém que ainda está andando, e falhar aqui é ser notado. */
    id: "seguir_alguem",
    rx: /\b(sigo (ele|ela|o|a|os|as)\s*\w*\s*(sem ser|de longe|a dist[aâ]ncia|discretamente)|vou atr[aá]s del|encal[cç]o|sigo os passos del|fico na cola)/,
    pericia: "furtividade", alvo: "perseguir", minutos: 20, barulho: false, testemunha: true,
    rotulo: "seguir sem ser notado", dcPadrao: DC("incomum"),
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
  impressionar: "chego junto dela e puxo conversa",
  desarmar: "desarmo a armadilha antes de pisar nela",
  nadar: "atravesso a nado até a outra margem",
  saltar: "salto o vão até o outro telhado",
  forcar: "empurro a pedra que trava a passagem",
  equilibrio: "atravesso a viga sem olhar para baixo",
  escapar: "me solto das cordas torcendo os pulsos",
  aguentar: "seguro o fôlego e sigo em frente",
  cavalgar: "esporeio o cavalo por dentro do bosque",
  acalmar_bicho: "acalmo o cavalo que empinou",
  atuar: "canto para a taverna inteira",
  orientar: "leio o céu para achar o rumo",
  diagnosticar: "examino o corpo para saber de que ele morreu",
  heraldica: "reconheço esse brasão",
  falsificar: "falsifico o salvo-conduto",
  seguir_alguem: "sigo ele de longe, sem ser notado",
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
export const SEM_DADO = [
  { rx: /\b(pergunto|pe[cç]o (informa|not[ií]cia)|falo com|converso|cumprimento|saúdo|saudo|digo|respondo|comento|agrade[cç]o|me apresento|dou bom dia|me despe[cç]o|escuto o que ele diz)\b/, porque: "conversa não se rola — só o que a conversa TENTA arrancar" },
  { rx: /\b(ando|caminho|sigo (at[eé]|para)|entro|saio|sento|levanto|olho para|observo o|espero|aguardo|descanso|encosto na parede|me afasto|dou meia volta|volto por onde vim|subo a escada|des[cç]o a escada)\b/, porque: "deslocar-se e olhar não são obstáculos" },
  { rx: /\b(saco|puxo|desembainho|equipo|guardo|bebo|como|visto|acendo|apago a|embainho|abro a bolsa|pego (a|o|meu|minha)|solto a corda|amarro|cal[cç]o)\b/, porque: "usar o que se tem na mão não pede dado" },
  /* ---------------- A SEGUNDA LEVA (v9.67) ----------------
     Meia dúzia de coisas que a leva nova de desafios encostou perigosamente
     perto, e que continuam não sendo teste nenhum. Esta lista cresce JUNTO
     com o catálogo de propósito: cada verbo novo que o sistema aprende a
     reconhecer traz consigo um punhado de frases parecidas que ele não pode
     confundir com esforço. */
  /* O `s?` no fim de cada substantivo não é capricho: `\b` depois de
     "moeda" recusa "moedas", e esse detalhe já matou nove entradas de uma
     vez neste arquivo. É o bug que este projeto mais repete depois da regra
     sem código atrás — e ele reapareceu AQUI, no primeiro teste da leva. */
  { rx: /\b(conto (as|o|os) (moedas?|dinheiro|pratas?|ouro)|guardo o dinheiro|abro a bolsa|conto quanto|somo|divido (a|o|as|os))\b/, porque: "contar o que é seu não tem como dar errado" },
  { rx: /\b(leio (a|o|essa|esse) (placas?|tabuletas?|cartas?|bilhetes?|cartazes?|mural|nome)|escrevo|anoto|assino|desenho no)\b/, porque: "ler e escrever o que está à vista é saber ler, não um obstáculo" },
  { rx: /\b(monto (o|a) (acampamento|barraca|tenda)|acendo a fogueira|deito|durmo|tiro o sono|me cubro|como a ra[cç][aã]o)\b/, porque: "acampar em lugar seguro é rotina, e a rotina não pede dado" },
  { rx: /\b(pago|compro|vendo|entrego (a|o|as|os)|dou (a|o|as|os|para|de presente)|ofere[cç]o (a|o) (m[aã]os?|assentos?|bebidas?))\b/, porque: "o preço já é decidido pelo mercado; a mão que paga não erra" },
  { rx: /\b(rezo|oro|agrade[cç]o (ao|aos|a deusa|ao deus)|acendo (uma )?vela|fa[cç]o o sinal|benzo)\b/, porque: "a prece é do coração, e o que ela move não é decidido por dado de perícia" },
  { rx: /\b(monto no cavalo (parado|amarrado)|desmonto|apeio|amarro (o|os) (cavalos?|bichos?)|dou [aá]gua (ao|para o) (cavalos?|bichos?))\b/, porque: "montar num bicho parado e manso não é dominar montaria" },
  { rx: /\b(respiro fundo|penso|reflito|me lembro de|imagino|conto at[eé] (tr[eê]s|dez)|fecho os olhos)\b/, porque: "pensar não é uma perícia, e o herói sabe o que o jogador sabe" },
];

export function naoPedeDado(texto) {
  const t = norm(texto);
  return SEM_DADO.find((s) => s.rx.test(t)) || null;
}

/* ============================================================
   O IMPROVISO (Fase MM, etapa MM4) — toda ação ganha um dado

   "Atiro a cadeira", "salto do balcão para o lustre", "tento lembrar
   onde vi esse brasão": nenhuma casava o catálogo acima, e a frase que
   não casa virava ficção sem dado — o Narrador decidia sozinho se deu
   certo. O Matt Mercer nunca faz isso. Ele não diz "isso não dá" e não
   decide de cabeça: escolhe o atributo, diz a dificuldade e manda rolar.

   Esta seção é esse gesto, por tabela. Quando nenhum desafio do catálogo
   casa, a frase passa por três perguntas, nesta ordem:

   1. A PENEIRA — é uma ação DECLARADA? Hipótese, pergunta, figura de
      linguagem, passado, negação e fala ao Mestre não são. A peneira não
      foi escrita do zero: as travas de `agressao.js` (NAO_E_AGRESSAO) são
      as primeiras linhas dela, tais quais, e o que vem depois é a mesma
      régua estendida a todo verbo — a de lá só conhecia "atacar".
   2. O GOLPE É DO GOLPE — violência contra alguém não é teste de atributo.
      Fora da luta, "ataco" abre combate (`agressao.js`); dentro dela,
      "atiro a cadeira no bandido" é o golpe do tabuleiro. O improviso
      nunca rouba nenhum dos dois.
   3. A FAMÍLIA DO VERBO — o atributo mais próximo sai de uma tabela de
      verbos (FAMILIAS_DO_IMPROVISO). Sem verbo na tabela, sem dado: o
      falso negativo devolve a vez ao Narrador, que é o lado seguro; o
      falso positivo custa uma rolagem que ninguém pediu e quebra a cena.

   E FICA DE FORA DA LUTA, de propósito. Um desafio rolado no meio do
   combate hoje não gasta a ação do herói nem passa a vez — o catálogo já
   tem esse furo (escalar, saltar), e abrir o improviso lá dentro o
   alargaria para toda frase. Até a economia da ação cobrar o teste, o
   improviso é de fora do combate.

   O resultado tem a MESMA forma de um desafio do catálogo, e é por isso
   que o App não precisa saber que ele existe: `lerAcao` o devolve como
   `teste`, e ele rola, aparece e chega à pauta pelo mesmo caminho.
   ============================================================ */

/* ---------------- A PENEIRA ----------------
   Cada linha é um jeito de uma frase TER o verbo e não SER a ação. */
/* QUEM está do outro lado — gente, bicho, pronome. As duas linhas que
   devolvem o gesto à luta (o golpe improvisado e a disputa) leem a mesma
   lista, para não discordarem sobre o que é "alguém". */
const UM_SER = "(d?el[ea]s?\\b|bandid|guard|home[mn]|mulher|sujeit|bebad|ladr|inimig|criatura|monstr|bicho|lob[oa]|goblin|orc|cultist|soldad|capit|taverneir|mercador|velh|rapaz|moc[oa]|crianc|alguem|assassin|mercenari|brutamont|capang|cachorr|cao\\b)";
const ARTIGO = "(o\\s+|a\\s+|os\\s+|as\\s+|um\\s+|uma\\s+|aquel[ea]\\s+|ess[ea]\\s+)?";
export const NAO_E_IMPROVISO = [
  /* as travas da agressão, as mesmas: figura, hipótese, passado e treino
     de golpe — quem as decidiu para "atacar" já decidiu para o resto */
  ...NAO_E_AGRESSAO,
  {
    id: "golpe", rx: RX_AGRESSAO,
    porque: "declarar violência é abrir a luta ou dar o golpe — é da agressão e do tabuleiro, nunca de um teste de atributo",
  },
  {
    /* atirar, quebrar, bater COM ALGO EM ALGUÉM: é a arma improvisada, e
       arma improvisada é golpe. Sem ser (pessoa, bicho, pronome) do outro
       lado, o mesmo verbo volta a ser teste: "arremesso a corda para o
       outro lado" é Força; "arremesso a cadeira no bandido" não é. */
    id: "golpeImprovisado",
    rx: new RegExp("\\b(arremess|lanc|atir|jog|tac|quebr|bat|esmag|arrebent|derrub|tomb|vir|empurr)\\w*\\s[^.!?]{0,40}?\\b(em cima|na cabeca|na cara|contra|em|no|na|nos|nas|pro|pra)\\s+(d[eoa]s?\\s+)?" + ARTIGO + UM_SER),
    porque: "coisa atirada em alguém é arma improvisada, e arma é golpe — o dado dela é o do ataque",
  },
  {
    /* EMPURRAR OU DERRUBAR ALGUÉM é DISPUTA: dois corpos, dois dados, e a
       tabela é a de `disputa.js` (Fase Y), que existe justamente porque
       "empurrar e derrubar parecem duas regras e são UMA". Uma dificuldade
       fixa aqui seria a segunda régua para o mesmo empurrão — o bug que
       esta casa mais repete. A suíte das ações do jogador pegou isto no
       primeiro dia, com "Empurro com força o bandido". */
    id: "disputa",
    rx: new RegExp("\\b(empurr|derrub|agarr|imobiliz|rasteir|trombo|placo)\\w*\\b[^.!?]{0,30}?\\b" + ARTIGO + UM_SER),
    porque: "empurrar ou derrubar alguém é disputa de dois corpos, e quem a resolve é a tabela da disputa, não um número fixo",
  },
  /* A PERGUNTA, O PENSAR ALTO, A NEGAÇÃO, O JÁ FEITO E A FRASE FEITA
     moravam aqui até a peneira da agressão (Fase MM). Subiram para
     `peneira.js` e chegam por NAO_E_AGRESSAO, no topo desta lista: eram
     duas peneiras para a mesma pergunta, e a de lá deixava passar
     "posso atacar o guarda?". Agora são lidas ORAÇÃO A ORAÇÃO
     (`soODeclarado`), e por isso "Posso? Salto o balcão." ganha o dado
     que a pergunta de antes lhe calava. */
  {
    /* fica aqui, e não na peneira: "Mestre, ataco o guarda" é um ataque
       dito ao Mestre, e "ataco o mestre de armas" também. Para o dado de
       atributo, falar COM o Mestre continua sendo conversa. */
    id: "aoMestre", rx: /\b(mestre|narrador)\b/,
    porque: "falar COM o Mestre é conversa fora da cena, não gesto dentro dela",
  },
  {
    id: "rotina", rx: /^\s*(eu )?(treino|pratico|ensaio|exercito)\b/,
    porque: "treinar é rotina de quem tem tempo, e rotina não pede dado",
  },
  {
    /* O CATÁLOGO JÁ DISSE ISTO (TIPOS_DE_ROLAGEM): salvaguarda acontece
       CONTRA o herói, e ninguém a pede. "Resisto ao veneno" é o jogador
       pedindo para resistir — e é por isso que não há aqui família nenhuma
       com esse verbo. */
    id: "salvaguarda", rx: /\b(resisto|resistir)\b/,
    porque: "resistir é salvaguarda, e a salvaguarda é o mundo que dispara — nunca se pede",
  },
];

/* O que o sistema vê da frase é a AÇÃO, não a fala: "Digo: vou quebrar a
   sua cara" tem "quebrar" dentro da boca do herói, e é ameaça — não um
   teste de Força. Quem tira a fala é a peneira (`soODeclarado`), que
   mascara com espaços em vez de cortar; aqui fica só a máscara, que o
   improviso usa para procurar a ousadia fora do verbo. */
const mascarar = (m) => " ".repeat(m.length);

/* ---------------- A DIFICULDADE ----------------
   O padrão é o obstáculo comum da régua (13) — um desafio que o jogador
   inventou na hora não é, por ser inventado, nem fácil nem difícil. Só a
   OUSADIA declarada mexe no número, e mexe um degrau, uma vez: quem salta
   "de costas" pediu mais do que quem salta. Não se acumula, porque duas
   bravatas na mesma frase ainda são um salto só.

   Onde o verbo JÁ traz a palavra ("bebo de uma vez"), ela é o gesto e não
   a ousadia — a ousadia é procurada fora do trecho do verbo. */
export const CD_DO_IMPROVISO = {
  degrau: "comum",
  ousadia: {
    sobe: 1,
    rx: /\b(de uma vez( so)?|de uma so vez|de costas|no escuro|as cegas|de olhos (fechados|vendados)|vendado|com uma (so )?mao( so)?|sem (as|usar as) maos|de um so (golpe|puxao|salto|folego|gole)|num so (golpe|puxao|salto|folego)|correndo|a galope|em pleno (ar|voo|salto)|de ponta.cabeca|sem olhar)\b/,
  },
};

/* O degrau de cima na régua, sem sair dela. */
function degrauAcima(id, n) {
  const i = DIFICULDADES.findIndex((d) => d.id === id);
  const j = Math.max(0, Math.min(DIFICULDADES.length - 1, (i < 0 ? 2 : i) + (Number(n) || 0)));
  return DIFICULDADES[j];
}

/* ---------------- AS FAMÍLIAS DO VERBO ----------------
   O atributo mais próximo do que a frase FAZ. Cada verbo diz a perícia
   que o cobre (o treino conta, como no 5e: atributo + perícia), e o que
   ele vira no rótulo — "salto" vira "saltar", e é o infinitivo mais o
   resto da frase que o jogador lê na linha do dado.

   `consome`: a ousadia faz parte do gesto ("bebo DE UMA VEZ") e não sobe
   degrau nenhum.

   `nucleo` é o trecho trocado pelo infinitivo; `faz` é o infinitivo, ou
   um mapa quando o núcleo tem mais de uma forma. `faz: ""` quer dizer
   "o que vem depois já é o verbo" — "tento lembrar onde…" vira "lembrar
   onde…".

   A ORDEM IMPORTA: do mais específico ao mais largo. "Forço a memória" é
   Intelecto antes de ser Força; "forço a vista", Percepção.

   `gesto`: o sucesso é o gesto acontecendo (Força, Destreza, Vigor,
   Presença), e não uma informação revelada (Intelecto, Percepção). É o
   que o envelope do teste precisa saber para não mandar o Narrador
   "revelar uma coisa" quando o herói só pulou um balcão.

   `leve`: onde o objeto é leve demais para o verbo ser esforço — "quebro o
   pão", "ergo a caneca". Olhado só nas quatro palavras depois do verbo. */
const LEVE_DEMAIS = /\b(pao|folhas?|paginas?|papel|bilhetes?|cartas?|fio|flor|flores|erva|graveto|galho seco|penas?|casca|lacre|ovos?|noz|caneca|copo|taca|colher|garfo|vela|chave|moedas?|dados?|pedrinhas?|seixo|maos?|bracos?|olhos?|olhar|voz|sobrancelhas?|cabeca|dedos?|queixo|chapeu|capuz|punho)\b/;

export const FAMILIAS_DO_IMPROVISO = [
  {
    id: "intelecto", atributo: "intelecto", pericia: "saberes", minutos: 5,
    corpo: false, dispensavel: true, gesto: false, custo: "improviso_intelecto",
    verbos: [
      { rx: /\b(tento|procuro|busco|vou|preciso) (me )?(lembrar|recordar)\b/, nucleo: /\b(tento|procuro|busco|vou|preciso) (me )?/, faz: "" },
      { rx: /\b(puxo pela|puxo da|forco a|vasculho a|reviro a|busco na) memoria\b/, nucleo: /\b(puxo pela|puxo da|forco a|vasculho a|reviro a|busco na) memoria\b/, faz: "buscar na memória" },
      { rx: /\brecordo\b/, nucleo: /\brecordo\b/, faz: "recordar" },
      { rx: /\b(decifro|decifrar)\b/, nucleo: /\b(decifro|decifrar)\b/, faz: "decifrar", pericia: "investigacao" },
      { rx: /\b(traduzo|traduzir)\b/, nucleo: /\b(traduzo|traduzir)\b/, faz: "traduzir" },
      { rx: /\b(calculo|estimo) (a|o) (distancia|altura|trajetoria|angulo|profundidade|queda)/, nucleo: /\b(calculo|estimo)\b/, faz: { calculo: "calcular", estimo: "estimar" }, pericia: "investigacao" },
      { rx: /\b(tento|procuro|vou) (entender|descobrir|compreender|deduzir|adivinhar) (como|o que|de onde|quem|por que|porque|qual|quais|onde|quando|se)\b/, nucleo: /\b(tento|procuro|vou) /, faz: "", pericia: "investigacao" },
      { rx: /\bavalio (a|o|essa|esse|aquela|aquele|esta|este) (joia|peca|espada|pedra|gema|anel|colar|quadro|obra|arma|armadura|moeda|tapecaria|estatua|reliquia)/, nucleo: /\bavalio\b/, faz: "avaliar", pericia: "investigacao" },
      { rx: /\bestudo (o|a|esse|essa|este|esta) (mapa|mecanismo|engrenagem|planta|diagrama|livro|pergaminho|inscricao|simbolo|desenho|codigo|enigma)/, nucleo: /\bestudo\b/, faz: "estudar", pericia: "investigacao" },
      { rx: /\bidentifico (a|o|essa|esse|aquela|aquele|esta|este) (planta|erva|veneno|cogumelo|flor|raiz|fruta|bebida|po|liquido|metal|minerio|pedra|tecido|cheiro)/, nucleo: /\bidentifico\b/, faz: "identificar" },
    ],
  },
  {
    id: "percepcao", atributo: "percepcao", pericia: "percepcao", minutos: 5,
    corpo: false, dispensavel: true, gesto: false, custo: "improviso_percepcao",
    verbos: [
      { rx: /\b(tento|procuro|busco|vou) (perceber|notar|reparar|distinguir|enxergar|avistar|ouvir|captar|flagrar)\b/, nucleo: /\b(tento|procuro|busco|vou) /, faz: "" },
      { rx: /\b(fico|me mantenho|permaneco|continuo) (atento|alerta|de olho|de vigia|de sentinela|vigiando|de guarda)\b/, nucleo: /\b(fico|me mantenho|permaneco|continuo)\b/, faz: "ficar", minutos: 10 },
      { rx: /\bvigio (a|o|as|os) \w+/, nucleo: /\bvigio\b/, faz: "vigiar", minutos: 10 },
      { rx: /\b(forco|apuro|aguco) (a vista|os olhos|o olhar|o faro|o olfato)\b/, nucleo: /\b(forco|apuro|aguco)\b/, faz: "apurar" },
      { rx: /\b(cheiro|provo|fungo) (a|o|esse|essa|este|esta) \w+ (para|pra) (ver|saber|sentir|descobrir|notar) se\b/, nucleo: /\b(cheiro|provo|fungo)\b/, faz: { cheiro: "cheirar", provo: "provar", fungo: "cheirar" } },
      { rx: /\b(pressinto|tento pressentir|sigo (o )?meu instinto|confio no meu instinto|tento sentir se)\b/, nucleo: /\b(pressinto|tento pressentir|tento sentir)\b/, faz: "pressentir", pericia: "intuicao" },
      { rx: /\bleio (o rosto|a expressao|a cara|os olhos|o olhar|a linguagem do corpo) d/, nucleo: /\bleio\b/, faz: "ler", pericia: "intuicao" },
    ],
  },
  {
    id: "presenca", atributo: "presenca", pericia: "persuasao", minutos: 5,
    corpo: false, dispensavel: false, gesto: true, custo: "improviso_presenca",
    verbos: [
      /* social: a conta é a de `social.js` — QUEM está na frente e o quanto se
         pede —, e o livro de tentativas chaveia pela pessoa, como o catálogo */
      { rx: /\b(seduzo|tento seduzir)\b/, nucleo: /\b(seduzo|tento seduzir)\b/, faz: "seduzir", social: true },
      { rx: /\bdistraio (o|a|os|as|ele|ela|eles|elas|aquele|aquela|esse|essa|um|uma)\b|\btento distrair\b/, nucleo: /\b(distraio|tento distrair)\b/, faz: "distrair", pericia: "enganacao", social: true },
      { rx: /\b(animo|encanto|entretenho|inflamo|inspiro) (a|o|os|as) (taverna|sala|multidao|grupo|tropa|gente|povo|homens|plateia|publico|mesa)\b/, nucleo: /\b(animo|encanto|entretenho|inflamo|inspiro)\b/, faz: { animo: "animar", encanto: "encantar", entretenho: "entreter", inflamo: "inflamar", inspiro: "inspirar" }, pericia: "atuacao" },
      { rx: /\b(faco|dou) (um|uma) (discurso|sermao|cena|escandalo|espetaculo|show)\b/, nucleo: /\b(faco|dou)\b/, faz: { faco: "fazer", dou: "dar" }, pericia: "atuacao", barulho: true },
      { rx: /\b(conto (uma|um) (piada|causo|anedota)|improviso (uma|um) (cancao|verso|poema|rima|melodia|discurso))\b/, nucleo: /\b(conto|improviso)\b/, faz: { conto: "contar", improviso: "improvisar" }, pericia: "atuacao" },
      { rx: /\b(finjo|tento fingir) (um|uma) (desmaio|ataque|mal estar|morte|ferimento|convulsao)\b|\b(finjo|tento fingir) (estar|que estou|que sou|ser) (morto|morta|bebado|bebada|doente|ferido|ferida|dormindo|desmaiado|desmaiada|cego|cega|surdo|surda|louco|louca)\b|\b(finjo|tento fingir) (dormir|desmaiar|morrer)\b/, nucleo: /\b(finjo|tento fingir)\b/, faz: "fingir", pericia: "enganacao" },
      { rx: /\bimito (a voz|o sotaque|o canto|o grito|o uivo|o piado|a fala|o chamado)\b/, nucleo: /\bimito\b/, faz: "imitar", pericia: "enganacao" },
      { rx: /\b(comando|lidero|organizo) (os|as) (homens|guardas|soldados|refugiados|multidao|camponeses|aldeoes|marinheiros|mercenarios|voluntarios|criancas)\b/, nucleo: /\b(comando|lidero|organizo)\b/, faz: { comando: "comandar", lidero: "liderar", organizo: "organizar" } },
    ],
  },
  {
    id: "vigor", atributo: "vigor", pericia: "fortitude", minutos: 10,
    corpo: true, dispensavel: false, gesto: true, custo: "improviso_vigor",
    verbos: [
      { rx: /\bcorro\b[^.!?]{0,30}\b(sem parar|a noite (toda|inteira)|o dia (todo|inteiro)|ate (perder o folego|nao aguentar|cair|o limite)|com todas as forcas|o mais rapido que (posso|consigo))/, nucleo: /\bcorro\b/, faz: "correr" },
      { rx: /\b(bebo|viro|entorno|tomo)\b[^.!?]{0,30}\b(de uma vez|num gole|num so gole|de um gole|de um so gole|sem respirar|ate a ultima gota)/, nucleo: /\b(bebo|viro|entorno|tomo)\b/, faz: "beber", consome: true },
      { rx: /\b(encaro|enfrento|atravesso|suporto) (o frio|a nevasca|a neve|a chuva|o vento|a tempestade|o calor|o sol|a fumaca|o fedor|o gelo|o pantano|o deserto|a febre|a dor)\b/, nucleo: /\b(encaro|enfrento|atravesso|suporto)\b/, faz: { encaro: "encarar", enfrento: "enfrentar", atravesso: "atravessar", suporto: "suportar" } },
      { rx: /\b(mergulho fundo|fico (debaixo|embaixo) d.?agua|fico submerso|fico no fundo)\b/, nucleo: /\b(mergulho|fico)\b/, faz: { mergulho: "mergulhar", fico: "ficar" } },
      { rx: /\bfico acordado\b[^.!?]{0,20}\b(a noite|ate|o turno|de vigia)/, nucleo: /\bfico\b/, faz: "ficar" },
    ],
  },
  {
    id: "destreza", atributo: "destreza", pericia: "acrobacia", minutos: 0,
    corpo: true, dispensavel: false, gesto: true, custo: "improviso_destreza",
    verbos: [
      { rx: /\b(salto|pulo|saltar|pular)\b[^.!?]{0,40}\b((para|pra) (o|a|os|as|um|uma|outro|outra|dentro|fora|cima|baixo|tras|frente|o lado)|ate (o|a|os|as)|sobre|por cima|em (movimento|disparada|pleno)|no (lustre|rio|poco|lago|mar|abismo|vao|telhado|lombo|dorso)|na (carroca|corda|agua|viga|janela|sacada|borda)|entre (os|as))\b/, nucleo: /\b(salto|pulo|saltar|pular)\b/, faz: { salto: "saltar", pulo: "pular", saltar: "saltar", pular: "pular" } },
      { rx: /\bme (balanc(o|ar)|pendur(o|ar)|dependur(o|ar)|esquiv(o|ar)|jog(o|ar) (para o lado|no chao|atras|para tras|por baixo|por cima|para fora|de lado))\b/, nucleo: /\bme (balanc(o|ar)|pendur(o|ar)|dependur(o|ar)|esquiv(o|ar)|jog(o|ar))\b/, faz: { "me balanco": "balançar-me", "me penduro": "pendurar-me", "me dependuro": "pendurar-me", "me esquivo": "esquivar-me", "me jogo": "jogar-me", "me balancar": "balançar-me", "me pendurar": "pendurar-me", "me dependurar": "pendurar-me", "me esquivar": "esquivar-me", "me jogar": "jogar-me" } },
      { rx: /\bdesvio (d[aoe]s?|para o lado d[aoe]s?) [^.!?]{0,20}\b(flecha|dardo|lamina|faca|pedra|carroca|cavalo|galho|viga|armadilha|machado|garra|jato|chama|fogo|raio|tiro|pedregulho|destrocos|escombros|tronco|barril)/, nucleo: /\bdesvio\b/, faz: "desviar" },
      { rx: /\b(agarro|pego|apanho|seguro)\b[^.!?]{0,30}\b(no ar|antes que (caia|toque|bata|chegue|quebre|se espatife)|em pleno voo)/, nucleo: /\b(agarro|pego|apanho|seguro)\b/, faz: "apanhar" },
      { rx: /\b(rolo|deslizo) (por baixo|por cima|pelo|pela|ate|para|entre)\b/, nucleo: /\b(rolo|deslizo)\b/, faz: { rolo: "rolar", deslizo: "deslizar" } },
      { rx: /\b(faco|dou) (um|uma) (malabarismo|pirueta|cambalhota|acrobacia|mortal|estrela|rolamento)\b/, nucleo: /\b(faco|dou)\b/, faz: { faco: "fazer", dou: "dar" } },
      { rx: /\bpasso (por|entre|pelo|pela|pelos|pelas) [^.!?]{0,30}\bsem (tocar|esbarrar|encostar|derrubar)\b/, nucleo: /\bpasso\b/, faz: "passar" },
    ],
  },
  {
    id: "forca", atributo: "forca", pericia: "atletismo", minutos: 1,
    corpo: true, dispensavel: false, gesto: true, custo: "improviso_forca", leve: LEVE_DEMAIS,
    verbos: [
      { rx: /\b(arremesso|lanco|arremessar|lancar)\b/, nucleo: /\b(arremesso|lanco|arremessar|lancar)\b/, faz: { arremesso: "arremessar", lanco: "lançar", arremessar: "arremessar", lancar: "lançar" }, barulho: true },
      { rx: /\b(ergo|erguer|ico|icar)\b[^.!?]{0,25}\b(bau|portao|porta|pedra|rocha|viga|tronco|barril|carroca|carro|grade|laje|tampa|pedregulho|bigorna|estatua|caixote|arca|armario|cavalo|homem|corpo|ferido|ferida|companheiro|companheira|mesa|sino|ancora|balde|rede|sozinho|com (toda|muita) forca|acima da cabeca|do chao|nas costas|com uma mao)\b/, nucleo: /\b(ergo|erguer|ico|icar)\b/, faz: { ergo: "erguer", erguer: "erguer", ico: "içar", icar: "içar" } },
      { rx: /\b(quebro|quebrar|arrebento|arrebentar|estilhaco|esmago|despedaco|parto ao meio)\b/, nucleo: /\b(quebro|quebrar|arrebento|arrebentar|estilhaco|esmago|despedaco|parto)\b/, faz: { quebro: "quebrar", quebrar: "quebrar", arrebento: "arrebentar", arrebentar: "arrebentar", estilhaco: "estilhaçar", esmago: "esmagar", despedaco: "despedaçar", parto: "partir" }, barulho: true },
      { rx: /\b(derrubo|derrubar)\b|\b(tombo|viro) (a|o|uma|um) (mesa|banco|carroca|estante|barril|armario|balcao|pipa|tonel|carro|bau|cama|carrinho)\b/, nucleo: /\b(derrubo|derrubar|tombo|viro)\b/, faz: { derrubo: "derrubar", derrubar: "derrubar", tombo: "tombar", viro: "virar" }, barulho: true },
      { rx: /\b(arranco|arrancar|desencravo)\b/, nucleo: /\b(arranco|arrancar|desencravo)\b/, faz: { arranco: "arrancar", arrancar: "arrancar", desencravo: "desencravar" }, barulho: true },
      { rx: /\b(forco|forcar) (a|o|as|os) (janela|grade|tampa|gaveta|portinhola|alcapao|arca|corrente|correntes|algema|algemas|barra|tranca da janela)\b/, nucleo: /\b(forco|forcar)\b/, faz: "forçar", pericia: "arrombamento", barulho: true },
      { rx: /\b(puxo|empurro|arrasto|seguro|carrego|sustento|escoro|travo)\b[^.!?]{0,40}\b(com (toda a|todas as|toda|muita) forca|com forca|com o ombro|com o corpo todo|sozinho|ate (ceder|abrir|soltar|cair|romper)|antes que (caia|desabe|feche|escorregue|role|despenque|afunde)|com as duas maos)/, nucleo: /\b(puxo|empurro|arrasto|seguro|carrego|sustento|escoro|travo)\b/, faz: { puxo: "puxar", empurro: "empurrar", arrasto: "arrastar", seguro: "segurar", carrego: "carregar", sustento: "sustentar", escoro: "escorar", travo: "travar" } },
    ],
  },
];

/* ---------------- O ROTULO ----------------
   O infinitivo mais o resto da oração, até a vírgula ou o "e" seguinte, e
   no tamanho de uma linha — com os acentos do jogador sempre que o texto
   normalizado ainda bate com o original posição por posição. */
const FIM_DA_ORACAO = /[.!?;,:]| e | mas | enquanto | porem | depois /;
const TETO_DO_ROTULO = 50;
function rotuloDoImproviso(cru, s, fimDoNucleo, faz) {
  const resto = s.slice(fimDoNucleo);
  const corte = resto.search(FIM_DA_ORACAO);
  const trecho = corte >= 0 ? resto.slice(0, corte) : resto;
  const original = norm(cru).length === cru.length ? cru.slice(fimDoNucleo, fimDoNucleo + trecho.length) : trecho;
  let r = `${faz ? faz + " " : ""}${original.replace(/\s+/g, " ").trim()}`.trim();
  if (r.length > TETO_DO_ROTULO) r = r.slice(0, r.lastIndexOf(" ", TETO_DO_ROTULO) > 20 ? r.lastIndexOf(" ", TETO_DO_ROTULO) : TETO_DO_ROTULO);
  return r || faz || "tentar";
}

/* A chave do livro de tentativas: família + as palavras de conteúdo do que
   se tentou. "Salto do balcão para o lustre" duas vezes é a MESMA tentativa;
   "salto do balcão" e "salto da janela" são duas. */
const VAZIAS_DA_CHAVE = new Set(["o", "a", "os", "as", "um", "uma", "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas", "para", "pra", "pro", "por", "pelo", "pela", "com", "que", "se", "me", "eu", "ate", "sobre", "esse", "essa", "este", "esta", "aquele", "aquela"]);
function objetoDaChave(rotulo) {
  return norm(rotulo).replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((p) => p.length > 1 && !VAZIAS_DA_CHAVE.has(p)).slice(1, 5).join("-") || "gesto";
}

/* A peneira, lida por quem quiser saber POR QUE uma frase não ganhou dado. */
function peneiraDoImproviso(t) {
  for (const n of NAO_E_IMPROVISO) {
    try { if (n.rx.test(t)) return n; } catch { /* nunca custa o turno */ }
  }
  return null;
}

/* A frase vira um desafio do mesmo formato do catálogo, ou nada. Não rola
   e não sorteia: é pura, e quem rola é o App, pela semente de sempre. */
function improvisoDe(cru, ctx) {
  if (ctx && ctx.emCombate) return null;
  const t = norm(cru);
  /* a peneira lê a AÇÃO, não a fala: 'digo "e se ele fugir?" e salto o
     balcão' não é pergunta nem hipótese do jogador. E lê oração a
     oração: o que foi pergunta, hipótese ou negação vira espaço, e o
     resto — o que o herói declarou — é o que passa adiante */
  const s0 = soODeclarado(t, NAO_E_AGRESSAO);
  if (!s0.trim()) return null;
  if (peneiraDoImproviso(s0)) return null;
  /* a ênclise desfeita (Fase MM): "penduro-me no lustre" é "me penduro no
     lustre", e é nesta forma que as famílias leem. A peneira olha as DUAS —
     "atiro-a no bandido" só mostra o bandido do outro lado da cadeira
     depois de o hífen sair ("atiro a no bandido"). O rótulo copia a frase
     do jogador trocada do mesmo jeito, no mesmo tamanho, e os acentos dele
     continuam onde estavam. */
  const s = emProclise(s0);
  if (peneiraDoImproviso(s)) return null;
  const cruP = emProclise(String(cru));
  const mesmoTamanho = t.length === cruP.length;
  for (const fam of FAMILIAS_DO_IMPROVISO) {
    for (const v of fam.verbos) {
      const m = s.match(v.rx);
      if (!m) continue;
      const nuc = s.slice(m.index).match(v.nucleo);
      const ini = m.index + (nuc ? nuc.index : 0);
      const fim = ini + (nuc ? nuc[0].length : m[0].length);
      if (fam.leve && fam.leve.test(s.slice(fim).trim().split(/\s+/).slice(0, 4).join(" "))) continue;
      const chaveFaz = nuc ? nuc[0].trim().replace(/\s+/g, " ") : "";
      const faz = typeof v.faz === "string" ? v.faz : ((v.faz || {})[chaveFaz] || (v.faz || {})[chaveFaz.split(" ")[0]] || chaveFaz);
      const rotulo = rotuloDoImproviso(cruP, s, fim, faz);
      /* a ousadia é procurada FORA do núcleo do verbo — e, onde a palavra é
         o próprio gesto ("bebo de uma vez", `consome`), fora do trecho
         inteiro que o casou: ali ela é o gesto, e não a bravata */
      const [de, ate] = v.consome ? [m.index, m.index + m[0].length] : [ini, fim];
      const foraDoVerbo = s.slice(0, de) + mascarar(s.slice(de, ate)) + s.slice(ate);
      const ous = foraDoVerbo.match(CD_DO_IMPROVISO.ousadia.rx);
      const degrau = degrauAcima(CD_DO_IMPROVISO.degrau, ous ? CD_DO_IMPROVISO.ousadia.sobe : 0);
      const pericia = v.pericia || fam.pericia;
      return {
        id: "improviso", improviso: true,
        alvo: `improviso|${fam.id}|${objetoDaChave(rotulo)}`,
        alvoDoCusto: v.social ? "" : fam.custo,
        rotulo, atributo: fam.atributo, pericia,
        minutos: v.minutos != null ? v.minutos : fam.minutos,
        barulho: !!v.barulho, corpo: !!fam.corpo, social: !!v.social,
        dispensavel: !!fam.dispensavel && !v.social,
        gesto: !!fam.gesto,
        dcPadrao: degrau.dc,
        deOnde: `${nomeDoAtributo(fam.atributo)}, obstáculo ${degrau.nome}${ous ? ` — ${(mesmoTamanho ? cruP.slice(ous.index, ous.index + ous[0].length) : ous[0]).trim()}` : ""}`,
      };
    }
  }
  return null;
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
      /* v9.72: a chave é normalizada (minúscula, sem acento) porque ela
         precisa casar; estas duas guardam como a coisa se ESCREVE, para o
         fracasso poder virar frase depois. Sem elas o livro sabia que o
         herói tinha falhado e não sabia dizer em quê — que é a razão de
         `tentativaFalha` ter nascido sem fonte em `mestria.js`. */
      rotulo: typeof v.rotulo === "string" ? v.rotulo.slice(0, 60) : "",
      onde: typeof v.onde === "string" ? v.onde.slice(0, 60) : "",
    };
  }
  return out;
}

export function chaveDaTentativa(lugar, alvo) {
  return `${norm(lugar) || "aqui"}|${norm(alvo) || "acao"}`;
}

export function registrarTentativa(reg, chave, { via = "", resultado = "falha", dia = 0, limpo = false, rotulo = "", onde = "" } = {}) {
  const base = garantirTentativas(reg);
  const antes = base[chave] || { vias: [], dia, resultado: "falha", limpo: false, vezes: 0, rotulo: "", onde: "" };
  return {
    ...base,
    [chave]: {
      vias: via && !antes.vias.includes(via) ? [...antes.vias, via].slice(0, 8) : antes.vias,
      dia, resultado,
      limpo: limpo || antes.limpo,
      vezes: (antes.vezes || 0) + 1,
      /* o primeiro registro manda no texto: é o rótulo de quando a coisa
         ainda era nova, e reescrevê-lo a cada insistência trocaria a
         lembrança pela última tentativa */
      rotulo: antes.rotulo || String(rotulo || "").slice(0, 60),
      onde: antes.onde || String(onde || "").slice(0, 60),
    },
  };
}

/* ============================================================
   O FRACASSO QUE FICOU PARA TRÁS (v9.72)

   "Falhar tem de mover a história" — e a falha que não move nada é a que
   ensina o jogador a não arriscar. O livro de tentativas já guardava
   tudo: o que foi tentado, onde, em que dia, quantas vezes. O que
   faltava era a leitura de VOLTA — alguém perguntando ao livro "em que
   este herói falhou e nunca mais voltou?".

   TRÊS FILTROS, e cada um tira um jeito de a lembrança sair errada:

   1. Só falha. Sucesso não é fio pendente.
   2. Nada de `limpo`: um lugar que já se sabe vazio não tem o que cobrar.
   3. Nada de HOJE. O que aconteceu neste mesmo dia ainda está na cena —
      trazê-lo de volta como memória seria o mundo lembrando de algo que
      o jogador acabou de fazer, que é a cara de um sistema mal ajustado.

   Vence o MAIS ANTIGO, que é o mais esquecido, e é essa a graça.
   ============================================================ */
export function fracassoEsquecido(reg, { dia = 0 } = {}) {
  const base = garantirTentativas(reg);
  let melhor = null;
  for (const [chave, v] of Object.entries(base)) {
    if (v.resultado !== "falha" || v.limpo) continue;
    if (!v.rotulo) continue;                       // sem texto não vira frase
    if (Number(dia) - Number(v.dia || 0) < 1) continue;
    if (!melhor || v.dia < melhor.dia) melhor = { chave, ...v };
  }
  if (!melhor) return null;
  return {
    chave: melhor.chave, rotulo: melhor.rotulo, onde: melhor.onde, dia: melhor.dia,
    vezes: melhor.vezes,
    frase: `${melhor.rotulo}${melhor.onde ? ` — ${melhor.onde}` : ""}, no dia ${melhor.dia}${melhor.vezes > 1 ? `, e você tentou ${melhor.vezes} vezes` : ""}`,
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
/* As travas da peneira que o catálogo lê (Fase MM): todas menos a frase
   feita — o porquê está em lerAcao, junto de onde elas entram. */
const TRAVAS_DO_CATALOGO = NAO_E_DECLARACAO.filter((n) => n && n.id !== "fraseFeita");

export function lerAcao(texto, ctx = {}) {
  const cru = String(texto || "");
  if (!cru.trim() || cru.trimStart().startsWith("[")) return null;
  /* `= {}` não cobre null, e o improviso lê o contexto antes de tudo */
  if (!ctx || typeof ctx !== "object") ctx = {};
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
  /* ---------------- O GUARDA QUE PERGUNTA (v9.130) ----------------
     `naoSe` e uma lista de palavras, e lista de palavras nao reconhece nome
     proprio: "procuro por sinais de Ione" nao tem taverneiro nem alguem, e
     por isso `buscar` ganhou a frase e pagou um tesouro. `naoSeCom` pergunta
     ao CONTEXTO em vez de adivinhar pelo texto — que e o que esta casa faz
     em todo o resto. */
  /* ---------------- A ÊNCLISE E A PENEIRA (Fase MM) ----------------
     Duas coisas que o catálogo não fazia, e as duas vistas a jogar MM6.

     1. "Escondo-me atrás do barril" não rolava nada: o catálogo foi escrito
        em próclise ("me escondo"). A frase chega com a ênclise desfeita
        (emProclise, da peneira), no mesmo tamanho — uma troca, em vez de
        cada rx aprender as duas formas.
     2. O catálogo era a única porta que age pelo jogador SEM a peneira:
        "posso me esgueirar até a porta?" rolava Furtividade, e "não me
        escondo" também. A agressão e o improviso já liam só o que o herói
        DECLAROU (soODeclarado); agora o catálogo lê igual. Sem isto, o
        infinitivo que o item pediu ("tento me esconder") faria "posso me
        esconder?" rolar.

     lePergunta: os seis desafios de SABER, em que a pergunta é o próprio
     gesto — "de quem é esse brasão?", "o que sei sobre essa criatura?",
     "ele está mentindo?" — continuam a ler a frase inteira. Perguntar-se o
     que se sabe é tentar lembrar, e é assim que eles sempre rolaram.

     O naoSe lê a frase INTEIRA, de propósito: é um veto, e um veto que some
     porque a oração dele foi apagada deixaria passar o que ele barrava. O
     pedido de teste ("peço Furtividade para...") não passa pela peneira: a
     porta dele é outra, e o que sobra dele é lido como sempre foi.

     A frase feita (a trava "fraseFeita") fica de fora, e a suíte do
     improviso é que o disse: "quebro o gelo com uma piada" é figura para o
     teste de Força e é o GATILHO de "impressionar" aqui. O catálogo guarda
     as figuras dele nos próprios naoSe. */
  const inteira = emProclise(daAcao);
  let declarada = inteira;
  if (!pedido) { try { declarada = emProclise(soODeclarado(daAcao, TRAVAS_DO_CATALOGO)); } catch { declarada = inteira; } }
  let d = DESAFIOS.find((x) => x.rx.test(x.lePergunta ? inteira : declarada) && !(x.naoSe && x.naoSe.test(inteira)) && !(x.naoSeCom && x.naoSeCom(daAcao, ctx)));
  /* MM4: o que o catálogo não conhece, a família do verbo conhece. Vem
     DEPOIS do pedido de teste (pedir continua não sendo declarar) e ANTES do
     "sem dado" — "pego a cadeira e arremesso" tem um verbo de usar o que se
     tem na mão, e o que manda é o outro. */
  if (!d && !pedido) d = improvisoDe(cru, ctx);
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
    const livre = naoPedeDado(emProclise(cru));
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
  /* o improviso diz o atributo pela família; o catálogo, pela perícia */
  const atributoDoDesafio = d.atributo || (periciaPorId(periciaDaVez) || {}).atributo || "percepcao";
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
    dc = d.dcBase || d.dcPadrao || DC("comum");
    /* v9.67: dizia "obstáculo comum" para tudo, inclusive para um 18. O
       jogador lia o número e a etiqueta discordando dele. Agora a etiqueta
       sai da régua, que é para isso que ela existe: o sistema passa a saber
       DIZER o que decidiu, e não só decidir. */
    /* MM4: o improviso já traz a etiqueta pronta — o atributo e o degrau
       ("Destreza, obstáculo comum"), que é o que o Matt diz antes do dado */
    deOnde = d.deOnde || `obstáculo ${degrauDaDC(dc).nome}`;
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
    /* v9.71: falhar aqui significa APENAS não saber — nada quebra, ninguém
       ouve, nada sangra. É a marca que autoriza o mestre a conceder o teste
       quando a mesa já rolou dado demais (`mestria.js`), e ela é POSITIVA de
       propósito: a primeira versão daquele governador inferia "inofensivo"
       da ausência de uma linha em CUSTO_DE_FALHAR, e assim falsificar um
       documento entrava na lista de dispensáveis só porque ninguém tinha
       escrito ainda o que a falha dele custa. O que ninguém marcou, rola. */
    dispensavel: !!d.dispensavel,
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
    /* MM4: no improviso a chave (família + objeto) e o custo (família) são
       coisas diferentes — cada salto tem a sua tentativa, e todos os saltos
       improvisados custam o mesmo tipo de coisa */
    alvoDoCusto: d.alvoDoCusto != null ? d.alvoDoCusto : d.alvo,
    /* MM4: o sucesso é o gesto acontecendo, e não uma coisa revelada — é o
       que `envelopeDoTeste` precisa saber para não mandar o Narrador
       "revelar" o salto por cima do balcão. Só o improviso marca. */
    gesto: !!d.gesto,
    /* v9.66: de que altura se cai daqui. Derivada da semente e do lugar,
       como a dureza da tranca — a mesma parede tem sempre a mesma altura. */
    queda: (d.alvo === "escalada" || d.queda) ? quedaDe(semente, lugar, cru) : null,
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

   MM5: a regra 2 ganhou o lado de cima. `porPouco` passou a querer dizer
   "esta linha aceita o MEIO" — o sim pago —, e o meio vale tanto para quem
   falhou por um fio como para quem passou por um. A tabela das faixas e
   a conta que as justifica moram em FAIXAS_DA_MARGEM, mais abaixo.
   ============================================================ */
export const CUSTO_DE_FALHAR = [
  {
    alvo: "tranca", porPouco: true,
    seca: "a fechadura emperra com a tentativa malfeita",
    preco: "ela cede, mas cede errado: com estrondo, e a porta fica marcada de quem passou",
    minutosExtra: 5, barulhoExtra: true,
    /* v9.66: o ombro que arromba paga. Era um 2 fixo — "o preço de uma
       vitória que o dado não deu, não um golpe de inimigo". MM5: continua
       pequeno, mas passa a sair de MORDIDA_POR_DEGRAU (um dado pelo degrau
       do obstáculo; 1d4 no comum, média 2,5 — ao lado do 2 antigo): a porta
       de uma cripta morde mais que a de um celeiro. */
    pelePorPouco: { mordida: 1, diz: "o ombro bate na madeira que só cede depois" },
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
    /* MM5: o meio da furtividade é o som. Passar por um fio é passar e
       deixar um ruído para trás — e o ruído é um preço que o código cobra:
       vira a pergunta ao oráculo ("alguém ouviu?"), cuja resposta é fato. */
    alvo: "furtividade", porPouco: true,
    seca: "o passo sai errado e o corpo aparece onde não devia",
    preco: "você passa, mas não em silêncio — um som fica para trás, e alguém pode tê-lo ouvido",
    minutosExtra: 0, barulhoExtra: true,
  },
  {
    alvo: "furto", porPouco: true,
    seca: "a mão erra o tempo e toca onde não devia tocar",
    preco: "a coisa vem para a sua mão, mas vem tilintando — e o tilintar tem ouvidos à volta",
    minutosExtra: 0, barulhoExtra: true,
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
    /* ler a intenção de alguém: falhar não fere e não custa tempo, mas
       custa o pior dos preços numa mesa — você fica achando que sabe */
    alvo: "intuicao", porPouco: false,
    seca: "o rosto dela não entrega nada, e você fica com a sua própria desconfiança nas mãos",
    minutosExtra: 0,
  },
  /* ---------------- OS CUSTOS DA SEGUNDA LEVA (v9.67) ----------------
     Cada desafio novo precisa saber o que a falha dele cobra, ou o custo
     da falha vira uma regra que só vale para as quinze primeiras entradas
     — e uma regra que vale para parte do catálogo é a pior espécie de
     regra, porque parece que vale para tudo. */
  {
    /* MM5: é o exemplo do Matt — a runa de C1E1, onde um 15 foi "recuas a
       tempo, mas levas 8". Desarmar por um fio é desarmar E ser mordido;
       falhar é a armadilha inteira. Por isso a seca morde com DOIS dados do
       degrau e o meio com UM: quem passou raspando nunca paga mais do que
       quem falhou (era 2 fixo na seca, e nenhum meio). */
    alvo: "armadilha", porPouco: true,
    seca: "o mecanismo salta sob os seus dedos",
    preco: "o mecanismo trava, mas não antes de morder — você recua a tempo, e não inteiro",
    minutosExtra: 5,
    /* desarmar mal é a única falha desta leva que fere sem cair: a
       armadilha dispara no dedo de quem a estava desarmando */
    peleSeca: { mordida: 2, diz: "a lâmina do gatilho acha a mão antes do fio" },
    pelePorPouco: { mordida: 1, diz: "o gatilho morde a ponta dos dedos antes de travar" },
  },
  {
    alvo: "nado", porPouco: true,
    seca: "a correnteza vence e devolve você à margem de onde saiu",
    preco: "você chega do outro lado, e chega sem ar",
    minutosExtra: 10,
    pelePorPouco: { condicao: "enfraquecido", diz: "os braços não obedecem mais" },
  },
  {
    alvo: "salto", porPouco: true,
    seca: "o pé sai antes da borda",
    preco: "a mão alcança a beira e o resto do corpo bate contra ela",
    minutosExtra: 0,
    peleSeca: { queda: true, diz: "não havia como parar no meio do salto" },
    pelePorPouco: { mordida: 1, diz: "as costelas encontram a quina da borda" },
  },
  {
    alvo: "peso", porPouco: true,
    seca: "não cede — e você sente onde vai doer amanhã",
    preco: "cede, e as suas costas pagam a diferença",
    minutosExtra: 5,
    pelePorPouco: { mordida: 1, diz: "alguma coisa estala nas costas" },
  },
  {
    alvo: "equilibrio", porPouco: true,
    seca: "o pé escorrega e não há onde segurar",
    preco: "você chega do outro lado de joelhos, e não de pé",
    minutosExtra: 2,
    peleSeca: { queda: true, diz: "de cima não dá para escolher onde cair" },
  },
  {
    alvo: "escapar", porPouco: true,
    seca: "o nó aperta mais a cada tentativa",
    preco: "você sai, deixando pele no caminho",
    minutosExtra: 10,
    pelePorPouco: { mordida: 1, diz: "os pulsos saem em carne viva" },
  },
  {
    alvo: "aguentar", porPouco: false,
    seca: "o corpo tem um limite e ele acabou de aparecer",
    minutosExtra: 5,
    peleSeca: { condicao: "enfraquecido", diz: "as pernas avisam que não vão longe" },
  },
  {
    alvo: "montaria", porPouco: true,
    seca: "o bicho ganha a discussão e você vai ao chão",
    preco: "você se segura, mas perde as rédeas por um trecho",
    minutosExtra: 5,
    peleSeca: { queda: true, diz: "cair de um cavalo em movimento é cair duas vezes" },
  },
  {
    /* MM5: o bicho aceita a mão, e marca-a antes — o meio é uma mordida de
       verdade, do tamanho do degrau (um lobo acuado é "difícil", 1d6) */
    alvo: "bicho", porPouco: true,
    seca: "o bicho recua, mostra os dentes e não deixa mais ninguém chegar perto",
    preco: "o bicho aceita a sua mão, mas não antes de marcá-la",
    minutosExtra: 10,
    pelePorPouco: { mordida: 1, diz: "os dentes chegam antes da calma" },
  },
  {
    alvo: "atuacao", porPouco: true,
    seca: "a sala não presta atenção, e agora presta atenção no jeito errado",
    preco: "você prende a sala, mas paga com a voz",
    minutosExtra: 15,
  },
  {
    alvo: "orientar", porPouco: true,
    seca: "o rumo se perde e a estrada cobra o dobro",
    preco: "você acha o caminho, mas depois de andar em falso",
    minutosExtra: 60,
  },
  {
    alvo: "diagnostico", porPouco: true,
    seca: "o corpo não conta nada que você saiba ler",
    preco: "você entende, mas leva metade da manhã debruçado sobre ele",
    minutosExtra: 20,
  },
  {
    alvo: "heraldica", porPouco: false,
    seca: "o símbolo não diz nada — ou diz algo que você aprendeu errado",
    minutosExtra: 0,
  },
  {
    alvo: "falsificar", porPouco: false,
    seca: "o papel fica bom demais para ser verdade e falso demais para passar",
    minutosExtra: 30,
  },
  {
    alvo: "perseguir", porPouco: false,
    seca: "a distância certa é fácil de errar, e você errou para o lado de perto",
    minutosExtra: 10,
  },
  {
    alvo: "arcano", porPouco: true,
    seca: "os símbolos não se deixam ler, e olhar demais para eles cansa",
    preco: "você lê o selo, mas a leitura cobra: a cabeça lateja o resto do dia",
    minutosExtra: 10,
    pelePorPouco: { condicao: "enfraquecido", diz: "o selo devolve o olhar, e a cabeça paga" },
  },
  /* ---------------- OS CUSTOS DO IMPROVISO (MM4 · MM5) ----------------
     Um por família, porque o improviso não sabe mais do que isso: sabe que
     foi Força, não que foi a cadeira. No MM4 a falha era SECA em todos, à
     espera da margem; no MM5 cinco das seis ganham o MEIO, cada uma com um
     preço que o código cobra — nunca só narrado:

       Força      → barulho  (o esforço cede, e cede alto: pergunta ao oráculo)
       Destreza   → mordida  (chega, mas torto: o corpo bate onde não devia)
       Vigor      → condição (aguenta até o fim, e sai enfraquecido)
       Intelecto  → tempo    (a resposta vem, mas vem tarde: minutos no relógio)
       Presença   → barulho  (o gesto pega, e pega alto: alguém reparou)
       Percepção  → SEM MEIO. Perceber é instantâneo — ou se vê, ou não se
                    vê —, como a escuta e a intuição da mesma tabela. Um
                    "notou, mas…" seria meia-informação, que é exatamente o
                    que o envelope da falha proíbe ao Narrador.

     A queda continua fora: o improviso não sabe de que altura se cai. */
  {
    alvo: "improviso_forca", porPouco: true,
    seca: "não cede — o peso ganha, e o esforço fica nos braços",
    preco: "cede, mas cede alto: o estalo e o baque chegam longe",
    minutosExtra: 0, barulhoExtra: true,
  },
  {
    alvo: "improviso_destreza", porPouco: true,
    seca: "o corpo chega um instante atrasado, e o gesto sai torto",
    preco: "você chega, mas chega torto — o corpo bate onde não devia",
    minutosExtra: 0,
    pelePorPouco: { mordida: 1, diz: "o corpo bate onde não devia" },
  },
  {
    alvo: "improviso_vigor", porPouco: true,
    seca: "o corpo avisa antes do fim, e você para antes de chegar lá",
    preco: "você aguenta até o fim, e o fim cobra: o corpo sai vazio",
    minutosExtra: 5,
    pelePorPouco: { condicao: "enfraquecido", diz: "o corpo aguentou e agora cobra" },
  },
  {
    /* o tempo do meio é só dele: a falha seca daqui não custa minuto
       nenhum (a resposta não vem, e pronto), e por isso o meio precisa de
       um número próprio — senão "veio, mas tarde" custaria o mesmo zero */
    alvo: "improviso_intelecto", porPouco: true,
    seca: "a resposta não vem, por mais que você a procure",
    preco: "a resposta vem, mas vem tarde — depois de um bom tempo de cabeça baixa",
    minutosExtra: 0, minutosPorPouco: 15,
  },
  {
    alvo: "improviso_percepcao", porPouco: false,
    seca: "nada se destaca — se havia algo ali, passou por você",
    minutosExtra: 0,
  },
  {
    alvo: "improviso_presenca", porPouco: true,
    seca: "o gesto não pega, e quem viu vai lembrar dele do jeito errado",
    preco: "o gesto pega, mas pega alto demais — quem estava por perto reparou",
    minutosExtra: 0, barulhoExtra: true,
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

/* ============================================================
   A MARGEM (MM5) — o sucesso com preço

   Até aqui o dado tinha duas saídas e meia: passou (limpo), falhou (seco)
   e, só do lado de baixo, "falhou por um ou dois, e consegue pagando"
   (v9.65). O Matt usa três, e usa-as dos DOIS lados da linha: na runa de
   C1E1, um 15 é "recuas a tempo, mas levas 8" — nem o sim limpo nem o não.

   A margem é `total − dc`. A tabela a corta em quatro faixas, e as duas
   do meio são UMA faixa só, simétrica em torno da linha da dificuldade:
   dois pontos abaixo dela (−2, −1) e dois acima (0, +1). O que as separa
   é a VOZ, não o preço — o preço é um só, o da linha de CUSTO_DE_FALHAR:

     margem  ≥ +2   limpo   o sim, sem custo escondido
     0 · +1         mas     "consegue, mas…"          (passou por um fio)
     −1 · −2        quase   "por um fio, e paga"      (falhou por um fio)
     ≤ −3           falha   o não, com o custo seco da linha

   PORQUE ASSIM, EM NÚMERO. Num d20, cada ponto de margem é UMA face — a
   conta não depende do modificador nem da CD, só de onde a linha cai no
   dado. Então o meio é sempre 4 faces em 20: 20% das rolagens (10% de cada
   lado), e o resto se reparte pela distância. O caso típico da casa — CD
   13, o obstáculo comum, contra +3 — dá, face a face (o 1 e o 20 incluídos):

     limpo 45% · mas 10% · quase 10% · falha 35%

   É a faixa do "sucesso a um custo" do Dungeon Master's Guide de D&D 5e
   (2014, cap. 8, p. 242, "Success at a Cost": falhar por 1 ou 2 pode
   virar sucesso com complicação), que a casa já seguia desde a
   v9.65, espelhada para cima da linha — que é o que a mesa do Matt faz. A
   simetria mata um degrau absurdo que existia: falhar por 1 custava e
   passar por 0 era de graça, e um ponto no dado separava "pagou" de "não
   pagou" exatamente onde a sorte menos devia pesar. Agora o degrau mora na
   borda da faixa, entre o raspão e a folga.

   Os dois lados da conta, sem maquiagem: onde a linha aceita o meio, a
   chance de conseguir sobe 10 pontos (o "quase" vira sim) e 10 pontos de
   sucessos que eram limpos passam a pagar (o "mas"). A maioria dos
   sucessos continua limpa — 45 contra 20 no caso típico.

   QUEM NUNCA É O MEIO:
   - o 20 natural é limpo e o 1 natural é falha, caia a margem onde cair
     (com um +10 contra CD 13, o 1 natural daria margem −2: continua falha);
   - a luta: dentro dela o turno já é o preço (a mesma regra de v9.65);
   - a linha sem `porPouco` (o que só revela informação: escuta, intuição,
     heráldica, perceber) — ali o raspão de cima é limpo e o de baixo é seco;
   - a busca que não tem nada para achar (`fechaDepois`): o preço do meio
     da busca diz "você acha", e ali não há o que achar. Passar por um fio
     num quarto vazio é a certeza limpa; falhar por um fio é não ter certeza.
   ============================================================ */
export const FAIXAS_DA_MARGEM = [
  { id: "limpo", de: 2, ate: Infinity, passou: true, meio: false, semMeio: "limpo", voz: "consegue" },
  { id: "mas", de: 0, ate: 1, passou: true, meio: true, semMeio: "limpo", voz: "consegue, mas…" },
  { id: "quase", de: -2, ate: -1, passou: true, meio: true, semMeio: "falha", voz: "por um fio — e paga" },
  { id: "falha", de: -Infinity, ate: -3, passou: false, meio: false, semMeio: "falha", voz: "não consegue" },
];
function faixaDaMargemPorId(id) { return FAIXAS_DA_MARGEM.find((f) => f.id === id) || null; }

/* A faixa em que uma margem cai. O crítico e o desastre mandam antes da
   conta — é o dado natural, não a soma, que decide esses dois. Margem que
   não é número não cai em faixa nenhuma: quem chamou não tinha teste. */
export function faixaDaMargem(margem, { critico = false, desastre = false } = {}) {
  if (critico) return faixaDaMargemPorId("limpo");
  if (desastre) return faixaDaMargemPorId("falha");
  const m = margem == null || margem === "" ? NaN : Number(margem);
  if (!Number.isFinite(m)) return null;
  return FAIXAS_DA_MARGEM.find((f) => m >= f.de && m <= f.ate) || null;
}

/* ---------------- A MORDIDA ----------------
   Quando o preço é pele, o número sai daqui: UM dado, e as faces dele são
   o degrau do obstáculo. A porta da cripta morde mais que a do celeiro, e
   quem escolhe o obstáculo escolhe a mordida.

   Pequeno de propósito. Um herói de nível 1 tem por volta de 16 de vida;
   1d4 no obstáculo comum (média 2,5) é um sexto dela — sente-se, não
   derruba. É o preço de um SIM, não um golpe de inimigo; a queda, que é o
   golpe do chão, continua sendo 1d6 por três metros. O antigo 2 fixo (v9.66)
   fica ao lado da média do comum, e é por isso que ele pôde sair.

   O topo é contido de propósito: a primeira versão dava 1d8 ao difícil, e
   a sonda achou o arrombamento de ombro a 19 (difícil) mordendo 8 num
   herói de nível 1 — metade da vida por um SIM. O difícil e o incomum
   ficam em 1d6 (média 3,5, um quinto da vida de nível 1); só o que a régua
   chama de árduo e heroico passa disso, e ali quem tenta já é outro herói. */
export const MORDIDA_POR_DEGRAU = [
  { degrau: "trivial", faces: 4 },
  { degrau: "facil", faces: 4 },
  { degrau: "comum", faces: 4 },
  { degrau: "incomum", faces: 6 },
  { degrau: "dificil", faces: 6 },
  { degrau: "arduo", faces: 8 },
  { degrau: "heroico", faces: 10 },
];

export function mordidaDoDegrau(dc) {
  const d = degrauDaDC(dc);
  return MORDIDA_POR_DEGRAU.find((m) => m.degrau === d.id) || MORDIDA_POR_DEGRAU[2];
}

/* Rola `n` dados da mordida. A sorte entra por parâmetro; sem ela, sai de
   uma SEMENTE — a tentativa (a chave), o total e a dificuldade —, e então
   o mesmo raspão na mesma porta morde sempre o mesmo tanto, em qualquer
   máquina. Nada de Math.random aqui dentro. */
function rolarMordida(n, dc, { sorte = null, semente = "" } = {}) {
  const { faces } = mordidaDoDegrau(dc);
  const r = typeof sorte === "function" ? sorte : rngDe(`mordida|${semente}`);
  const k = Math.max(1, Math.min(4, Math.round(Number(n) || 1)));
  let total = 0;
  for (let i = 0; i < k; i++) total += 1 + Math.floor(r() * faces);
  return { dano: total, dado: `${k}d${faces}` };
}

/* O preço em pele de um lado, já com o número. `mordida` vira dano rolado;
   o resto (a queda, a condição) passa como estava — quem as resolve é o
   App, pelas portas que já existem. */
function peleResolvida(p, dc, opcoes) {
  if (!p) return null;
  if (!p.mordida) return p;
  const { mordida, ...resto } = p;
  const m = rolarMordida(mordida, dc, opcoes);
  return { ...resto, dano: m.dano, dado: m.dado };
}

/* O DESFECHO DA MARGEM — o que uma rolagem de desafio custa, dos dois
   lados da linha. Devolve:
   - null  quando não há o que cobrar: o sim limpo, o teste sem custo de
           tabela (o social), ou o lixo (sem dificuldade, sem total) — e
           então quem chama faz exatamente o que fazia antes do MM5;
   - o desfecho, na MESMA forma do de v9.65 (`porPouco`, `diz`, `faltou`,
     `minutosExtra`, `barulhoExtra`, `pele`) mais `faixa` e `margem`. É a
     forma de antes de propósito: tudo o que o App já faz com um "por
     pouco" (a fala, o relógio, o barulho, a pele) serve ao "mas" sem uma
     linha nova de fiação. `porPouco` quer dizer "é o meio": o sim, pago. */
export function desfechoDaMargem(v, { total = null, dc = null, critico = false, desastre = false, emCombate = false, sorte = null } = {}) {
  if (!v || !v.alvoDoCusto) return null;
  const c = custoPorAlvo(v.alvoDoCusto);
  if (!c) return null;
  if (total == null || dc == null || total === "" || dc === "") return null;
  const t = Number(total), d = Number(dc);
  if (!Number.isFinite(t) || !Number.isFinite(d)) return null;
  const margem = t - d;
  let f = faixaDaMargem(margem, { critico: !!critico, desastre: !!desastre });
  if (!f) return null;
  const aceitaMeio = !!c.porPouco && !emCombate && !v.fechaDepois;
  if (f.meio && !aceitaMeio) f = faixaDaMargemPorId(f.semMeio);
  if (f.passou && !f.meio) return null;
  const meio = f.meio;
  const opcoes = { sorte, semente: `${v.chave || v.id || c.alvo}|${t}|${d}` };
  const minutos = meio && c.minutosPorPouco != null ? c.minutosPorPouco : c.minutosExtra;
  return {
    porPouco: meio, faixa: f.id, margem, faltou: d - t, alvo: c.alvo,
    diz: meio ? c.preco : c.seca,
    minutosExtra: Math.max(0, Number(minutos) || 0),
    barulhoExtra: !!c.barulhoExtra && meio,
    /* v9.66: o preço em PELE, e ele é diferente nos dois lados. Quem falha
       por pouco e sobe machucado não é quem falha e despenca — juntar os
       dois num campo só faria a vitória paga e o tombo custarem igual. */
    pele: peleResolvida(meio ? c.pelePorPouco : c.peleSeca, d, opcoes),
  };
}

/* O desfecho de uma rolagem que NÃO bateu a dificuldade — a metade de
   baixo de `desfechoDaMargem`, com a assinatura de sempre (v9.65). Passar
   continua não tendo "desfecho de falha", nem quando o passar é pago. */
export function desfechoDaFalha(v, total, dc, { emCombate = false, desastre = false, sorte = null } = {}) {
  if (!(Number(dc) - Number(total) > 0)) return null;
  return desfechoDaMargem(v, { total, dc, emCombate, desastre, sorte });
}

/* O que o sistema já cobrou, em palavras de mesa — para o Narrador não
   ter de adivinhar se "o preço" foi um minuto ou um osso. */
function oQueFoiCobrado(des) {
  const partes = [];
  if (des.minutosExtra) partes.push(`${des.minutosExtra} minutos no relógio`);
  if (des.barulhoExtra) partes.push("o barulho, que o mundo já está a julgar");
  const p = des.pele;
  if (p && p.dano) partes.push(`${p.dano} de vida`);
  if (p && p.condicao) partes.push(`a condição ${p.condicao}`);
  if (p && p.queda) partes.push("a queda");
  return partes.length ? partes.join(", ") : "o que está escrito acima";
}

export function falaDoCusto(des) {
  if (!des) return "";
  if (des.porPouco && des.faixa === "mas") {
    const quanto = des.margem > 0 ? `Passou por ${des.margem}` : "Na conta exata";
    return `⚖ ${quanto} — e por um fio o mundo cobra: ${des.diz}.`;
  }
  return des.porPouco
    ? `⚖ Faltaram ${des.faltou} — e por tão pouco o mundo negocia: ${des.diz}.`
    : `↯ ${des.diz.charAt(0).toUpperCase()}${des.diz.slice(1)}.`;
}

export function envelopeDoCusto(des, rotulo) {
  if (!des) return "";
  if (des.porPouco) {
    const como = des.faixa === "mas"
      ? `Eu passei no teste de ${rotulo || "perícia"} por um fio (${des.margem > 0 ? `sobrou ${des.margem}` : "bati a dificuldade exata"}), e por tão pouco o sistema decidiu que EU CONSIGO — mas pago.`
      : `Eu falhei por ${des.faltou} no teste de ${rotulo || "perícia"}, e por tão pouco o sistema decidiu que EU CONSIGO — pagando.`;
    return `[CUSTO — DECIDIDO PELO SISTEMA] ${como} O que aconteceu: ${des.diz}. O sistema já cobrou o preço (${oQueFoiCobrado(des)}).
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
