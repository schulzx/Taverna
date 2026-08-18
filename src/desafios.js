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
    rx: /\b(vasculh|revir|remexo|procur|busco|dou uma olhada|olho em volta com|examino o|examino a|examino esse|reviro|fu[cç]o|inspeciono|presto (bastante )?aten[cç][aã]o|reparo (n|em)|olho com aten[cç][aã]o|dou busca)/,
    /* PROCURAR UMA PESSOA NÃO É VASCULHAR UM LUGAR, e a diferença é cara: um
       falso positivo aqui marca o quarto como revirado por causa de "procuro
       o taverneiro". A lista é de gente porque é o caso real; o falso
       negativo apenas devolve o turno ao Mestre, que é o lado seguro. */
    naoSe: /\b(pessoa|gente|rosto|olhos del[ae]|taverneir|ferreir|mercador|guarda|capit[aã]|sacerdot|ac[oó]lito|estalajadeir|curandeir|algu[eé]m|homem|mulher|rapaz|mo[cç]a|velh[oa]|companheir|amig|aliad|informante|contato|comprador|vendedor|barqueir|cocheir|dono d|taverneira)/,
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
  },
  {
    id: "tranca",
    /* `gazua` entra como alvo próprio: nomear a ferramenta já declara a
       ação, e "uso a gazua na porta" é como se diz na mesa. */
    rx: /\b(arromb|destranc|for[cç]o a porta|abro a porta|abrir a porta|abro o ba[uú]|abro o cofre|abro a fechadura|for[cç]o a fechadura|for[cç]o o ba[uú]|abro o cadeado|quebro a tranca|gazua|mexo na fechadura|trabalho a fechadura|tento a fechadura)/,
    pericia: "arrombamento", alvo: "tranca", minutos: 5, barulho: true,
    rotulo: "abrir o que está trancado", tranca: true,
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
    pericia: "furtividade", alvo: "furtividade", minutos: 5, barulho: false,
    rotulo: "passar sem ser visto", dcPadrao: 14,
  },
  {
    id: "bater_carteira",
    rx: /\b(bato a carteira|surrupi|furto (a|o|dele|dela)|punguei|punho a bolsa|tiro do bolso dele|roubo a bolsa|planto)/,
    pericia: "prestidigitacao", alvo: "furto", minutos: 1, barulho: false,
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

export function desafioPorId(id) { return DESAFIOS.find((d) => d.id === id) || null; }
/* O desafio que uma PERÍCIA nomeada resolve. Existe para o hábito antigo —
   "peço um teste de Percepção" — cair na mesma adjudicação de todo o resto,
   em vez de virar uma segunda porta com regras próprias. Toda regra deste
   jogo que mora num só dos dois caminhos vira bug. */
export function desafioPorPericia(id) { return DESAFIOS.find((d) => d.pericia === id) || null; }

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
    tentativas = {}, dia = 0, periciaForcada = "",
  } = ctx;
  /* fora do destructuring de propósito: o conferidor de referências lê
     `achadoDe(...)` como chamada a uma função global e acusa falso positivo.
     Uma linha a mais vale menos que um conferidor que ninguém lê. */
  const achadoDe = typeof ctx.achadoDe === "function" ? ctx.achadoDe : null;

  /* a frase manda; a perícia nomeada é a rede para quem ainda escreve
     "peço um teste de Percepção" */
  const d = DESAFIOS.find((x) => x.rx.test(t) && !(x.naoSe && x.naoSe.test(t)))
    || (periciaForcada ? desafioPorPericia(periciaForcada) : null);
  if (!d) {
    const livre = naoPedeDado(cru);
    return livre ? { tipo: "livre", porque: livre.porque } : null;
  }

  const reg = garantirTentativas(tentativas);
  const chave = chaveDaTentativa(lugar, d.alvo);
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
  /* já deu certo e nada mudou: repetir um sucesso é fazer de novo o que já
     está feito — não se rola por isso */
  if (feito && !mudou.length && feito.resultado === "sucesso" && d.id !== "tranca") {
    return { tipo: "livre", porque: `você já conseguiu isso aqui`, rotulo: d.rotulo, chave };
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
  if (d.tranca) {
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
  if (v.tipo === "jaTentou") return `↺ Você já tentou ${v.rotulo} aqui, do mesmo jeito, e não deu. Insistir igual não muda nada — ${v.comoReabrir.join(", ")}.`;
  if (v.tipo === "impossivel") return `⛔ Assim não dá: ${v.porque}. O que abriria: ${v.comoSeria.join(", ")}.`;
  if (v.tipo === "livre") return `✓ ${v.porque} — sem dado.`;
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
  if (v.tipo === "jaTentou") {
    return `[SEM TESTE — DECISÃO DO SISTEMA]${disse} Eu já tentei ${v.rotulo} aqui, exatamente assim, e falhei. Repetir a mesma coisa do mesmo jeito não é uma nova chance: o sistema não rola de novo. Em UMA ou DUAS frases, mostre a mesma parede em que eu já bati — sem novidade, sem meia-pista — e lembre que outra abordagem, ajuda ou muito mais tempo mudariam o quadro. NÃO resolva o obstáculo por generosidade.`;
  }
  if (v.tipo === "impossivel") {
    return `[SEM TESTE — DECISÃO DO SISTEMA]${disse} Do jeito que declarei, isto não é possível: ${v.porque}. Não houve rolagem porque não havia o que rolar. Narre a tentativa esbarrando no impossível em UMA ou DUAS frases. Você PODE deixar claro, pela cena, o que resolveria (${v.comoSeria.join(", ")}) — mas NÃO faça acontecer, NÃO me dê a ferramenta que falta e NÃO abra por outro caminho sem que eu peça.`;
  }
  if (v.tipo === "livre") {
    return `[SEM TESTE — DECISÃO DO SISTEMA]${disse} Isto não pede dado: ${v.porque}. Narre acontecendo, com naturalidade e sem tensão falsa, e devolva a palavra para mim.`;
  }
  return "";
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

/* A linha do prompt que explica a arquitetura inteira ao Mestre. */
export const DESAFIOS_PROMPT = `TESTES — QUEM DECIDE É O SISTEMA (v9.59):
- Existem TRÊS rolagens neste jogo, e só três: TESTE DE PERÍCIA (o herói tenta algo), SALVAGUARDA (algo acontece CONTRA o herói: veneno, queda, armadilha, encanto) e JOGADA DE ATAQUE (na luta, pelo tabuleiro). O jogador nunca pede uma salvaguarda — ela é disparada pelo mundo, e quem dispara é o sistema.
- O jogador NÃO pede testes: ele declara uma AÇÃO ("presto atenção na taverna", "tento abrir a porta à força", "tento achar a fraqueza dessa criatura"). Quem decide se aquilo pede dado é o SISTEMA, e ele já decidiu antes de você ler isto.
- VOCÊ NUNCA ROLA E NUNCA PEDE ROLAGEM. Se a ação do jogador pedisse um teste, o envelope do sistema já terá chegado com o resultado. Se não chegou envelope nenhum, é porque aquilo não era um teste: narre e siga.
- DUAS CONDIÇÕES para haver dado, e as duas precisam valer: chance real de falhar E custo real por falhar. Sem as duas, o sistema resolve sem rolar e você narra a competência com naturalidade — nunca como sorte.
- MESMO OBSTÁCULO, MESMA ABORDAGEM, UMA VEZ SÓ. Se eu já tentei e falhei, insistir igual não rola de novo. Reabre com outra abordagem, ajuda, ferramenta nova ou muito mais tempo — e o sistema avisa quando reabre.
- LUGAR VASCULHADO FICA VASCULHADO. Quando o envelope disser que aqui já não há nada, não invente um achado novo para preencher a cena.
- O QUE ESTÁ TRANCADO abre de quatro jeitos: a chave, ferramentas de ladrão, uma magia que abra, ou força bruta. Cada um tem dificuldade e barulho próprios, e o sistema já escolheu qual foi usado. Força faz BARULHO — se houver quem ouça, isso tem consequência, e ela é sua para narrar.`;
