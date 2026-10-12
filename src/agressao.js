/* ============================================================
   QUEM COMEÇA A BRIGA (v9.73) — o sistema lê o primeiro golpe

   "O mestre chama os combates."

   Hoje quem abre uma luta é a IA, pelo campo `combate_iniciar`. Isso é
   defensável para METADE dos casos — o mundo atacando primeiro é ficção,
   e ficção é dela. A outra metade não: quando o JOGADOR escreve "ataco o
   bandido com a espada", não há nada a decidir. Ele declarou. A luta
   começa, e nenhum narrador devia ter direito de veto sobre isso.

   E tinha. "Ataco o bandido" não casava nada no catálogo de desafios,
   caía como ficção pura, e o que acontecia dependia inteiramente do humor
   da cena que a IA tinha na cabeça: às vezes o painel abria, às vezes o
   golpe virava um empurrão narrado, às vezes o alvo "recuava assustado".
   O jogador aprende rápido que atacar é sugerir.

   ------------------------------------------------------------
   A TRAVA, e ela é a razão de este arquivo ser pequeno:

   O SISTEMA NUNCA INVENTA O ALVO. Ele só abre luta contra quem já EXISTE
   no registro do mundo e está na cena. Sem isso, "ataco o dragão ancião"
   no nível 1 seria um jeito de invocar um dragão digitando — o jogador
   escreveria o inimigo em vez de encontrá-lo, e o orçamento de encontro,
   o bestiário e o mapa deixariam de significar qualquer coisa.

   Quando o alvo não está registrado — a criatura que a IA acabou de
   descrever e o sistema nunca viu —, ele NÃO abre nada e devolve o turno
   com uma ordem em vez de uma sugestão: abra o combate, ou diga que não
   há quem atacar. O que ela não pode mais é narrar a luta se resolvendo
   sozinha.

   E o grupo do herói fica de fora: virar um companheiro em inimigo mexe
   em ficha, vínculo e elenco, e um caminho que faz isso em silêncio, a
   partir de uma frase ambígua, é caro demais para o que ganha.
   ============================================================ */

import { NAO_E_DECLARACAO, soODeclarado } from "./peneira.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
/* sem acento e SEM baixar a caixa: mesmo tamanho do `norm`, posição por
   posição — é por ela que o sistema vê a maiúscula de um nome próprio */
const semAcento = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ============================================================
   O QUE É DECLARAR UM ATAQUE (reescrito na Fase MM, a peneira da agressão)

   A lista é de VIOLÊNCIA FÍSICA e nada mais: ameaçar é intimidação (está
   no catálogo de desafios), empurrar é uma disputa, e roubar é
   prestidigitação. Aqui só entra o que abre sangue.

   A primeira versão (v9.73) conhecia a primeira pessoa do presente e
   nada mais — "soco", "ataco", "golpeio". Na prova jogada de MM5,
   "avanço para socá-lo" NÃO abriu luta: o soco virou acidente de cena.
   E a ênclise não é um jeito raro de escrever; é o jeito normal de um
   brasileiro escrever que bate em alguém. Então cada verbo da tabela
   vale em todas as formas de quem declara:

     presente ........ soco o guarda · ataco-o · o esfaqueio
     infinitivo ...... vou atacar · parto para socá-lo · tento esfaqueá-la
     mesóclise ....... atacá-lo-ei (o futuro é promessa de golpe)
     o golpe nomeado . dou-lhe um soco · acerto-lhe um murro · meto-lhe a espada

   E o condicional NÃO morde: "golpeá-lo-ia" é "eu o golpearia" — uma
   hipótese, e hipótese é da peneira.

   O OUTRO LADO, e ele pesou tanto quanto: a v9.73 mordia demais. "Desço
   a escada" abria luta ("desco a" estava na lista), "corto o pão" e
   "chuto a porta" também, e "levo um soco" — o substantivo — era lido
   como o verbo. Por isso a tabela separa dois tipos de verbo:

     `so: true`  — violento sozinho. "Ataco" basta; não há o que atacar
                   sem atacar.
     `so: false` — só é golpe COM ALGUÉM do outro lado: um ser, um corpo,
                   um pronome ou um nome próprio. "Corto o bandido" é
                   golpe; "corto o pão" é o jantar. "Soco o taverneiro" é
                   golpe; "levo um soco" é o substantivo.
   ============================================================ */
export const VERBOS_DE_GOLPE = [
  { eu: "ataco", inf: "atacar", so: true },
  { eu: "golpeio", inf: "golpear", so: true },
  { eu: "esfaqueio", inf: "esfaquear", so: true },
  { eu: "apunhalo", inf: "apunhalar", so: true },
  { eu: "esmurro", inf: "esmurrar", so: true },
  { eu: "espanco", inf: "espancar", so: true },
  { eu: "estrangulo", inf: "estrangular", so: true },
  { eu: "degolo", inf: "degolar", so: true },
  { eu: "estoco", inf: "estocar", so: true },
  /* "soco" é também o substantivo, "acerto" também ("o acerto de
     contas"), "mato" também ("no mato") — por isso a próclise deles só
     vale depois de "eu" */
  { eu: "soco", inf: "socar", so: false, ambiguo: true },
  { eu: "acerto", inf: "acertar", so: false, ambiguo: true },
  { eu: "mato", inf: "matar", so: false, ambiguo: true },
  { eu: "chuto", inf: "chutar", so: false },
  { eu: "corto", inf: "cortar", so: false },
  { eu: "decepo", inf: "decepar", so: false },
  { eu: "esfolo", inf: "esfolar", so: false },
  { eu: "derrubo", inf: "derrubar", so: false },
  { eu: "perfuro", inf: "perfurar", so: false },
];

/* QUEM APANHA — o que conta como "alguém do outro lado". É uma lista de
   inclusão e não de exclusão, de propósito: o que ela não conhece fica
   de fora, e ficar de fora devolve a vez ao Narrador (o lado seguro). */
export const QUEM_APANHA = {
  seres: [
    "(n|d)?el[ea]s?", "home[mn]s?", "mulher(es)?", "sujeit[oa]s?", "individu[oa]s?", "rapaz(es)?", "moc[oa]s?",
    "garot[oa]s?", "menin[oa]s?", "velh[oa]s?", "crianc(a|as)", "alguem", "fulano", "estranh[oa]s?", "forasteir[oa]s?",
    "guardas?", "soldad[oa]s?", "capita(o|es)", "capitaes", "sargent[oa]s?", "sentinelas?", "vigias?", "carcereir[oa]s?",
    "arqueir[oa]s?", "cavaleir[oa]s?", "mercenari[oa]s?", "bandid[oa]s?", "ladr(ao|oes|a|as)", "salteador(es|a)?",
    "assaltantes?", "piratas?", "bandoleir[oa]s?", "capangas?", "brutamontes", "valent(ao|oes)", "assassin[oa]s?",
    "cultistas?", "sacerdot(e|es|isa)", "clerig[oa]s?", "mag[oa]s?", "brux[oa]s?", "feiticeir[oa]s?", "necromantes?",
    "taverneir[oa]s?", "estalajadeir[oa]s?", "ferreir[oa]s?", "mercador(es|a)?", "comerciantes?", "bebad[oa]s?",
    "mendig[oa]s?", "lordes?", "rei", "reis", "rainhas?", "princip(e|es)", "princesas?", "duques?", "barao", "conde",
    "nobres?", "xerife", "carrasco", "inquisidor(es)?", "espia[oe]s?", "traidor(es|a)?", "patifes?", "canalhas?",
    "desgracad[oa]s?", "miseravel", "maldit[oa]s?", "verme", "covardes?", "inimig[oa]s?", "adversari[oa]s?",
    "oponentes?", "rivais", "rival", "vila[oe]s?", "chefe", "lider", "marinheir[oa]s?", "campones(a|es)?", "servos?", "servas?",
    "criaturas?", "monstros?", "bichos?", "feras?", "bestas?", "animal", "lob[oa]s?", "ursos?", "javalis?", "cachorros?",
    "cao", "caes", "cobras?", "serpentes?", "aranhas?", "ratos?", "ratazanas?", "morcegos?", "goblins?", "hobgoblins?",
    "kobolds?", "orcs?", "ogros?", "trol(l)?s?", "gnolls?", "esqueletos?", "zumbis?", "mortos?-vivos?", "carnica(l|is)",
    "fantasmas?", "espectros?", "vampir[oa]s?", "lobisome(m|ns)", "demonios?", "diabos?", "diabretes?", "dragao",
    "dragoes", "harpias?", "gargulas?", "golens?", "golem", "elementais?", "elf[oa]s?", "ana[o]?", "anoes", "gnomos?",
    "halflings?", "gigantes?", "ciclopes?", "minotauros?", "centauros?", "homens?-lagarto",
  ],
  corpo: [
    "cara", "rosto", "face", "queixo", "nariz", "boca", "olhos?", "cabeca", "testa", "tempora", "pescoco", "garganta",
    "nuca", "peito", "barriga", "estomago", "costelas?", "costas", "ombros?", "bracos?", "maos?", "pernas?", "joelhos?",
    "canelas?", "virilha", "rins?", "coracao", "ventre", "flanco", "tornozelos?", "coxas?", "orelhas?", "dentes?",
    "mandibula", "fuca", "focinho",
  ],
  porque: "golpe precisa de alguém do outro lado — 'corto o pão' é o jantar e 'chuto a porta' é o obstáculo; a lista é de inclusão, e o que ela não conhece devolve a vez ao Narrador",
};

/* Os substantivos do golpe e as armas — para "dou-lhe um soco" e "meto a
   espada no guarda". Sem alguém do outro lado, também não contam: "dou
   um soco na mesa" é raiva, não luta. */
const GOLPE_NOMEADO = "socos?|murros?|chutes?|pontapes?|tapas?|bofetadas?|tabefes?|sopapos?|cotoveladas?|joelhadas?|cabecadas?|rasteiras?|golpes?|estocadas?|talhos?|pancadas?|cutiladas?|facadas?|punhaladas?|espadadas?|machadadas?|pauladas?|bordoadas?|porradas?|voadoras?|ganchos?";
const ARMA = "espadas?|facas?|adagas?|punhal|machados?|lancas?|clavas?|macas?|martelos?|laminas?|porretes?|bastao|cajado|foices?|alabardas?|rapieiras?|cimitarras?|sabres?|floretes?|mangual|picaretas?|garrafas?|cadeiras?|canecas?|punhos?";
const DA_GOLPE = "dou|dar|desfiro|desferir|acerto|acertar|meto|meter|mando|mandar|solto|soltar|lasco|lascar|sento|sentar|aplico|aplicar|enfio|enfiar|cravo|cravar|desco|descer|afundo|afundar|baixo|baixar|quebro|quebrar|arrebento|arrebentar|esmago|esmagar";
const PARTE_PRA_CIMA = "parto|partir|avanco|avancar|invisto|investir|me atiro|me jogo|me lanco|atiro-me|jogo-me|lanco-me";

const DET = "((o|a|os|as|um|uma|esse|essa|esses|essas|este|esta|aquele|aquela|seu|sua|meu|minha|teu|tua|outro|outra)\\s+){0,2}";
const SER = "(" + QUEM_APANHA.seres.join("|") + ")\\b";
const CORPO = "(" + QUEM_APANHA.corpo.join("|") + ")\\b";
const ALGUEM = "(" + SER + "|" + CORPO + ")";
/* o golpe negado no meio da oração: "passo pelo guarda sem atacá-lo",
   "ataco o capitão, não o guarda" — a negação que abre a oração é da
   peneira; esta é a que mora no meio dela */
const NEGADO = "(?<!\\b(sem|nao|nem|nunca|jamais|em vez de|ao inves de|evito|evitando|antes de)\\s+((o|a|os|as|lhe|lhes|me|te|mais|ainda|mesmo)\\s+)?)";

const lista = (f) => VERBOS_DE_GOLPE.filter(f);
const EU_SO = lista((v) => v.so).map((v) => v.eu).join("|");
const INF_SO = lista((v) => v.so).map((v) => v.inf).join("|");
const TODOS_ENCL = VERBOS_DE_GOLPE.map((v) => v.inf.slice(0, -1)).join("|");
/* o substantivo tem artigo; o verbo, não: "levo UM soco", "O soco dele",
   "o acerto de contas", "NO mato" — a primeira pessoa dos ambíguos só é
   verbo quando não vem depois de determinante */
const SUBSTANTIVO = "(?<!\\b(um|uma|o|a|os|as|do|da|no|na|pelo|pela|ao|num|numa|meu|seu|teu|sua|esse|este|aquele|outro|primeiro|segundo|ultimo|novo|de|com|cada|mais um|levo|leva|tomo|toma)\\s+)";
const PRECISA = lista((v) => !v.so).flatMap((v) => [v.ambiguo ? SUBSTANTIVO + v.eu : v.eu, v.inf]).join("|");
const PRECISA_EU = lista((v) => !v.so).map((v) => v.eu).join("|");
const PROCL_LIVRE = lista((v) => !v.so && !v.ambiguo).map((v) => v.eu).join("|");

export const RX_AGRESSAO = new RegExp([
  /* ataco · golpeio · vou atacar */
  NEGADO + "\\b(" + EU_SO + "|" + INF_SO + ")\\b",
  /* socá-lo · esfaqueá-la · atacá-lo-ei — o pronome É o alguém; o
     condicional (-ia) é hipótese e fica de fora */
  NEGADO + "\\b(" + TODOS_ENCL + ")-l[oa]s?\\b(?!-(ia|ias|iamos|iam)\\b)",
  /* soco-o · corto-os · acerto-lhe */
  NEGADO + "\\b(" + PRECISA_EU + ")-(o|a|os|as|lhes?)\\b",
  /* o chuto · eu o soco (a próclise do substantivo ambíguo só com "eu") */
  NEGADO + "(^|[\\s,;])(o|a|os|as|lhes?)\\s+(" + PROCL_LIVRE + ")\\b",
  NEGADO + "\\beu\\s+(o|a|os|as|lhes?)\\s+(" + PRECISA_EU + ")\\b",
  /* soco o taverneiro · corto a garganta dele · chuto ele */
  NEGADO + "\\b(" + PRECISA + ")\\s+((em|n[oa]s?|contra)\\s+)?" + DET + ALGUEM,
  /* dou-lhe um soco · lhe meto a espada */
  NEGADO + "\\b(" + DA_GOLPE + ")-lhes?\\s+" + DET + "(" + GOLPE_NOMEADO + "|" + ARMA + ")\\b",
  NEGADO + "\\blhes?\\s+(" + DA_GOLPE + ")\\s+" + DET + "(" + GOLPE_NOMEADO + "|" + ARMA + ")\\b",
  /* dou uma estocada no soldado · enfio a faca nas costas dele */
  NEGADO + "\\b(" + DA_GOLPE + ")\\s+" + DET + "(" + GOLPE_NOMEADO + "|" + ARMA + ")\\b[^.!?;]{0,30}?(\\b(em|n[oa]s?|contra|sobre|pel[oa]s?)\\s+" + DET + ALGUEM + "|\\bnel[ea]s?\\b)",
  /* bato nele · bato no guarda */
  NEGADO + "\\b(bato|bater)\\s+(em\\s+|n[oa]s?\\s+)" + DET + SER + "|\\bbato nel[ea]s?\\b",
  /* parto para cima dele · avanço sobre o guarda · me atiro contra o lobo */
  NEGADO + "\\b(" + PARTE_PRA_CIMA + ")\\s+(para cima|pra cima|sobre|contra|em direcao)\\s+((de|d[oa]s?|a|ao)\\s+)?" + DET + SER,
  /* saco a espada e avanço — a arma na mão e o passo à frente */
  "\\bsaco (a|o|minha|meu) (" + ARMA + ") e (avanco|parto|invisto|ataco)\\b",
].join("|"));

/* O NOME PRÓPRIO — o slot do alvo com maiúscula no texto do jogador.
   "Corto Doran" é golpe; "corto o pão" não. A regex vê o texto sem caixa,
   então a maiúscula é conferida no texto original, na mesma posição.
   O nome é sempre a ÚLTIMA palavra do trecho casado. */
const RX_COM_NOME = [
  new RegExp(NEGADO + "\\b(" + PRECISA + ")\\s+((em|n[oa]s?|contra)\\s+)?((o|a)\\s+)?(\\w+)$"),
  new RegExp(NEGADO + "\\b(" + DA_GOLPE + ")\\s+" + DET + "(" + GOLPE_NOMEADO + "|" + ARMA + ")\\b[^.!?;]{0,30}?\\b(em|n[oa]|contra|sobre)\\s+(\\w+)$"),
  new RegExp(NEGADO + "\\b(bato|bater)\\s+(em|n[oa])\\s+(\\w+)$"),
  new RegExp(NEGADO + "\\b(" + PARTE_PRA_CIMA + ")\\s+(para cima|pra cima|sobre|contra)\\s+((de|d[oa])\\s+)?(\\w+)$"),
];
function golpeEmNomeProprio(s, cru, nomes) {
  const conhecidos = (nomes || []).map((n) => norm(n).split(/[\s,]+/)[0]).filter((n) => n && n.length >= 3);
  /* varre fim a fim: cada fim de palavra é um candidato a nome */
  const fins = [...s.matchAll(/\w+/g)];
  for (const f of fins) {
    const ate = f.index + f[0].length;
    const trecho = s.slice(Math.max(0, ate - 90), ate);
    if (!RX_COM_NOME.some((rx) => { try { return rx.test(trecho); } catch { return false; } })) continue;
    const letra = cru.charAt(f.index);
    if (letra && letra !== letra.toLowerCase() && letra === letra.toUpperCase()) return true;
    if (conhecidos.some((n) => f[0] === n)) return true;
  }
  return false;
}

/* O que TEM cara de ataque e não é. Cada linha aqui é um jeito de o
   sistema abrir uma luta que ninguém pediu — e uma luta aberta por
   engano custa a cena inteira, não uma linha na tela.

   AS PRIMEIRAS LINHAS SÃO A PENEIRA DA CASA (`peneira.js`), as mesmas
   que o improviso lê: pergunta, hipótese, negação, passado, frase feita.
   Eram duas — a de cá deixava passar "posso atacar o guarda?" — e agora
   é uma. Depois delas, as três que só a violência tem. */
export const NAO_E_AGRESSAO = [
  ...NAO_E_DECLARACAO,
  {
    id: "figura",
    rx: /\b(atac(o|ar)|ataca-l[oa]) ((o|a|os|as|esse|essa|este|esta|meu|minha)\s+)?(problema|assunto|questao|comida|prato|jantar|almoco|cafe|lanche|banquete|trabalho|tarefa|livro|enigma|charada|pao|bolo|sopa|ensopado|despensa|cerveja|vinho)\b|\bataco de frente o\b/,
    porque: "'ataco o problema de frente' é figura de linguagem, e atacar o jantar é fome",
  },
  {
    id: "treino",
    rx: /\b(treino|pratico|ensaio|exercito)\b[^.!?]{0,30}\b(golpe|estocada|espada|luta|com o boneco|no saco)/,
    porque: "treinar o golpe é rotina de acampamento, não uma briga",
  },
  {
    /* a brincadeira e a finta: o soco de brincadeira no ombro do amigo e
       "finjo atacar para distraí-lo" têm o verbo e não têm a briga. Só
       vale PERTO do verbo de violência — "finjo um desmaio" é do improviso */
    id: "brincadeira",
    rx: /\b(de brincadeira|brincando|de mentirinha|de mentira|de faz de conta|finj\w*|fingindo|simul\w*)\b[^.!?;]{0,40}\b(atac|golpe|soc[oa]|socar|murro|esmurr|chut|esfaque|apunhal|estoc|briga|luta)|\b(atac|golpe|soc[oa]|socar|murro|esmurr|chut|esfaque|apunhal|estoc)\w*\b[^.!?;]{0,40}\b(de brincadeira|brincando|de mentirinha|de mentira|de faz de conta)\b|\b(tapas?|tapinhas?|soquinhos?) (amigave\w+|nas costas|no ombro)/,
    porque: "o soco de brincadeira no ombro do amigo e a finta para distrair não são o primeiro golpe de uma luta",
  },
  {
    /* 8.ª sessão (M41): O RECUO. "Foi um engano, eu queria atacar a
       encapuzada da corrente, não Ursa. Volto ao posto, levanto as mãos e
       peço desculpa" — o sistema leu "atacar" e reabriu a luta contra a
       mesma companheira. O imperfeito do herói ("queria atacar", "ia
       golpear") é o que ele QUIS, contado, e o engano dito é recuo: a
       oração cai, e a frase que pede desculpa fecha a luta em vez de a
       abrir. Só a oração do recuo: "foi engano. Agora ataco o guarda" é o
       ataque. */
    id: "recuo",
    rx: /\b(foi|era|e) (so )?(um |uma )?(engano|equivoco|mal-entendido|mal entendido)\b|\bpor engano\b|\bsem querer\b|\b(eu )?(queria|quis|ia|pretendia|tentava) (atac|golpe|ferir|bater|socar|esfaque|apunhal|acert|mat)\w*|\bpe(co|dir) (desculpa|perdao)|\bdesculp(a|e|em)\b/,
    porque: "dizer que foi engano, o que se queria ter feito ou pedir desculpa é recuar — a luta não reabre por isso",
  },
];

/* `nomes`, opcional: quem o sistema sabe que está na cena. Serve para o
   nome escrito em minúscula ("corto doran"); a maiúscula ele já vê. */
export function ehDeclaracaoDeAtaque(texto, opcoes) {
  const nomes = (opcoes && Array.isArray(opcoes.nomes)) ? opcoes.nomes : [];
  const cru = semAcento(texto);
  if (!cru.trim()) return false;
  let s;
  try { s = soODeclarado(texto, NAO_E_AGRESSAO); } catch { return false; }
  if (!s.trim()) return false;
  try { if (RX_AGRESSAO.test(s)) return true; } catch { /* nunca custa o turno */ }
  try { return s.length === cru.length && golpeEmNomeProprio(s, cru, nomes); } catch { return false; }
}

/* ============================================================
   O PESO DE QUEM VOCÊ ATACOU

   O registro de pessoas guarda nome, papel e relação — nunca guardou
   nível nem ameaça, porque um NPC não é um inimigo até virar um. Então
   a ameaça sai do PAPEL, que é a única coisa que o mundo já afirmou
   sobre aquela pessoa.

   É uma régua grosseira e ela é honesta: quem vive de armas devolve o
   golpe melhor que quem vive de vender cerveja. O que ela NÃO faz é
   deixar o jogador escolher a força do inimigo — a escolha é dele sobre
   em QUEM bater, e o preço vem do mundo.

   SEM `\b` NO FIM, e isto já custou caro quatro vezes neste projeto: são
   RADICAIS. `capit[aã]\b` não casa "capitão" (o `o` seguinte é letra e a
   fronteira falha), `taverneir\b` não casa "taverneiro", e o efeito não é
   um erro visível — é o degrau errado sendo escolhido em silêncio. Na
   primeira rodada desta suíte, o capitão da guarda virou "comum" e o
   taverneiro também, que é exatamente a tabela deixando de existir.
   ============================================================ */
export const PESO_DO_PAPEL = [
  {
    id: "guerra", ameaca: "competente",
    rx: /\b(capit[aã]|comandante|general|cavaleir|sargent|mercenari|guarda-cost|campe[aã]o|gladiador|ca[cç]ador de recompensa|assassin|matador)/,
    porque: "quem vive de matar não morre porque um estranho sacou uma espada",
  },
  {
    id: "armas", ameaca: "comum",
    rx: /\b(guarda|soldad|milicia|sentinela|arqueir|batedor|patrulh|xerife|carcereir|vigia)/,
    porque: "treinado e armado, mas é gente de turno, não de lenda",
  },
  {
    id: "poder", ameaca: "competente",
    rx: /\b(mago|maga|feiticeir|bruxo|bruxa|arquimag|conjurad|necromant|sacerdote de|sumo )/,
    porque: "quem conjura é perigoso na proporção do que sabe, e nunca é presa fácil",
  },
  {
    id: "mando", ameaca: "elite",
    rx: /\b(lorde|lady|bar[aã]o|baronesa|duque|duquesa|conde|condessa|rei|rainha|princip|princesa|governador|senhor de|chefe d|patriarc|matriarc)/,
    porque: "quem manda anda acompanhado, e o que responde ao golpe raramente é a própria pessoa",
  },
  {
    id: "braco", ameaca: "comum",
    rx: /\b(ferreir|a[cç]ougueir|lenhador|minerador|estivador|pedreir|forjador|curtidor|carrocei|barqueir)/,
    porque: "não é treinado, mas passa o dia levantando o que você não levanta",
  },
  {
    id: "gente", ameaca: "fraco",
    rx: /\b(taverneir|estalajadeir|mercador|comerciante|escriba|erudito|bibliotec|curandeir|herborist|alquimist|camponê|campones|servo|serva|crian[cç]a|mendig|bardo|cozinheir|joalheir|cartograf)/,
    porque: "gente que não se defende de ofício, e o sistema não vai fingir que se defende",
  },
];

export function ameacaDoPapel(papel) {
  const p = norm(papel);
  if (!p.trim()) return { ameaca: "comum", id: "semPapel", porque: "sem papel no registro, o mundo trata como gente comum armada do que tiver à mão" };
  for (const x of PESO_DO_PAPEL) {
    try { if (x.rx.test(p)) return { ameaca: x.ameaca, id: x.id, porque: x.porque }; } catch { /* nada */ }
  }
  return { ameaca: "comum", id: "semPapel", porque: "papel que a tabela não conhece: o mundo trata como gente comum" };
}

/* ============================================================
   QUEM ESTÁ SENDO ATACADO

   O nome citado tem de estar no elenco DA CENA. O nome mais longo
   ganha, que é a mesma regra dos lugares, das habilidades e das
   pessoas: "Bram" e "Bram, o Torto" na mesma sala não podem trocar de
   lugar.

   E se ninguém foi citado, o sistema NÃO escolhe por eliminação, nem
   quando há uma pessoa só na cena. Aqui isso seria diferente de tudo o
   mais: escolher errado num teste social custa uma linha, escolher
   errado aqui abre uma luta contra alguém que o jogador não quis tocar.

   O PRONOME (Fase MM). "Avanço para socá-lo" não tem nome — o "lo" é
   alguém de quem já se falava. Aqui o sistema não escolhe por
   eliminação, mas também não finge que o pronome não aponta ninguém.
   Ele segue, nesta ordem, o que um jogador à mesa entenderia:

     1. o último citado na conversa (`recentes`: os textos mais novos,
        o último por último), entre quem está na cena;
     2. senão, o ÚNICO hostil da cena (relação de inimigo no registro) —
        é de quem se fala quando se fala em bater;
     3. senão, ninguém: não abre, e o Mestre recebe o pedido de decidir
        (a mesma ordem de duas saídas do alvo fora do registro).

   Ele NÃO escolhe "a única pessoa da cena" pelo pronome: o taverneiro
   sozinho no balcão não é o "lo" de uma frase sobre o bandido que
   acabou de sair. Com duas pessoas e nenhuma citada, também não.
   ============================================================ */
export const PRONOME_DO_ALVO = {
  rx: /\b(ataca|golpea|esfaquea|apunhala|esmurra|espanca|estrangula|degola|estoca|soca|acerta|mata|chuta|corta|decepa|esfola|derruba|perfura)-l[oa]s?\b|-(o|a|os|as|lhes?)\b|\b(ele|ela|eles|elas|nele|nela|neles|nelas|dele|dela)\b|\beu (o|a|os|as|lhe) |\blhes?\b|(^|[\s,;])(o|a|os|as) (chuto|corto|decepo|esfolo|derrubo|perfuro|ataco|golpeio|esfaqueio|apunhalo|esmurro|espanco|estrangulo|degolo|estoco)\b/,
  hostil: /^(inimig|hostil)/,
  porque: "o pronome aponta alguém de quem já se falava — o último citado, ou o único inimigo à vista; nunca o único presente por eliminação",
};

function ultimoCitado(recentes, vivos) {
  const textos = Array.isArray(recentes) ? recentes : [];
  for (let i = textos.length - 1; i >= 0; i--) {
    const t = norm(textos[i]);
    if (!t.trim()) continue;
    let melhor = null, onde = -1;
    for (const n of vivos) {
      const p = t.lastIndexOf(norm(n.nome));
      /* o mais tarde no texto ganha; no empate de posição, o nome mais longo */
      if (p > onde || (p === onde && p >= 0 && melhor && String(n.nome).length > String(melhor.nome).length)) { melhor = n; onde = p; }
    }
    if (melhor && onde >= 0) return melhor;
  }
  return null;
}

/* ============================================================
   O QUE O MESTRE MOSTROU (MM-C · C0, 11/10 — a 6.ª sessão de prova)

   "Tem um cão sem pelo que anda pela paliçada norte… Ela não late. Só
   espera." — a imagem mais forte do primeiro ato, e o marco "Acabar com
   cão sem pelo" de pé. A heroína escreveu "Ataco o cão sem pelo antes que
   ele avance" e o jogo respondeu "Dário da Cova não é inimigo: atacar é um
   crime": o "ele" foi ao último NOME citado na conversa, e o cão não era
   nome de ninguém. Noutra frase ("procuro o cão sem pelo, perto da casa de
   Nira. Quando o vir, ataco primeiro") o alvo foi Nira — citada noutra
   oração, só como lugar.

   O que a trava da casa diz continua a valer: o SISTEMA não inventa o
   alvo. Mas quem o pôs ali foi o MESTRE, na resposta anterior — e o que ele
   mostra existe na cena. Então, nesta ordem:
     1. a pessoa do registo citada NA ORAÇÃO DO GOLPE ("ataco Dário");
     2. a CRIATURA que o jogador nomeia e o Mestre mostrou (`mostrado`, as
        últimas respostas dele): entra como combatente, com o nome que a
        prosa lhe deu ("cão sem pelo");
     3. o de sempre (o nome citado na frase; o pronome).
   E no pronome sem nome, o único bicho da última resposta vem antes do
   último nome citado — o "ele" de uma frase sobre o cão é o cão.

   `CRIATURA_NA_PROSA.cabecas` são os substantivos que fazem de um nome um
   bicho (raízes sem acento, palavra inteira); o complemento é o que a
   prosa lhe pendura ("sem pelo", "de sola"): um conector e uma palavra. */
export const CRIATURA_NA_PROSA = {
  cabecas: [
    "cao", "caes", "cachorro", "cachorros", "lobo", "lobos", "loba", "rato", "ratos", "ratazana", "lagarto", "lagartos",
    "aranha", "aranhas", "serpente", "serpentes", "cobra", "cobras", "urso", "ursa", "javali", "javalis", "corvo", "corvos",
    "morcego", "morcegos", "verme", "vermes", "sapo", "escorpiao", "besouro", "centopeia", "sanguessuga", "abutre",
    "criatura", "criaturas", "coisa", "bicho", "bichos", "fera", "feras", "besta", "monstro", "monstros", "voraz", "vorazes",
    "esqueleto", "esqueletos", "zumbi", "zumbis", "carnical", "espectro", "fantasma", "goblin", "goblins", "kobold", "orc", "ogro", "troll", "gnoll", "harpia", "gargula",
  ],
  conectores: ["sem", "de", "do", "da", "com"],
  /* a ameaça de quem só a prosa conhece: o de sempre, gente comum armada do
     que tiver — o bestiário dá a dele quando o nome é de lá (`conhecidas`) */
  ameaca: "comum",
  porque: "o Mestre mostrou-o na cena, e o jogador o nomeou: existe, e é contra ele o golpe",
};
const CABECAS = new Set(CRIATURA_NA_PROSA.cabecas);
const palavrasDe = (s) => norm(s).split(/[^a-z0-9]+/).filter(Boolean);

/* ---------------- O NOME QUE É BICHO (12/10, a 8.ª sessão de prova, M39) ----------------
   "Ursa o Andarilho" é gente — a prisioneira que fugiu das Celas, e que
   viajava com o herói. "Ursa" está no banco de nomes (nomes.js) e é também
   uma cabeça de bicho desta tabela. O jogador escreveu "ataco a que leva a
   corrente, por trás, antes que ELA vá embora"; o "ela" foi ao único bicho
   da última resposta do Mestre — e o único bicho era a palavra "Ursa", em
   "Ursa, ao seu lado, mantém o pão apertado contra o peito". A luta abriu
   contra a companheira de viagem, como CRIATURA: sem cartão (um bicho não
   é crime), e com ela a fuga, a nêmesis e o pedido de desculpa a reabrir a
   luta (mente/mm11-sessao-8.md, "O alvo errado").

   A régua: na prosa do Mestre, uma cabeça de bicho escrita SEMPRE com
   maiúscula e NUNCA depois de um determinante ("a ursa", "dois lobos", "do
   cão") é um nome, não um bicho; e o primeiro nome de quem o sistema sabe
   que é gente (`pessoas`: quem está na cena, o grupo e quem anda comigo)
   também, salvo se a prosa mostrar o bicho com artigo. Um bicho na
   prosa leva artigo ou número quase sempre — "Lobos uivam" no começo da
   frase, sem nenhum "os lobos" depois, é o preço desta régua, e o preço é
   pequeno: sem bicho, o ataque vai ao Mestre com a ordem das duas saídas. */
export const NOME_NAO_E_BICHO = {
  determinantes: ["o", "a", "os", "as", "um", "uma", "uns", "umas", "dois", "duas", "tres", "quatro", "cinco", "varios", "varias",
    "esse", "essa", "esses", "essas", "este", "esta", "estes", "estas", "aquele", "aquela", "aqueles", "aquelas",
    "do", "da", "dos", "das", "no", "na", "nos", "nas", "ao", "aos", "pelo", "pela", "pelos", "pelas", "num", "numa",
    "outro", "outra", "outros", "outras", "seu", "sua", "seus", "suas", "meu", "minha", "cada", "nenhum", "nenhuma"],
  porque: "o nome de alguém não vira bicho por coincidir com um: quem a prosa escreve sempre com maiúscula e sem artigo é gente",
};
const DETERMINANTES = new Set(NOME_NAO_E_BICHO.determinantes);
/* as cabeças de bicho que, nestes textos, são NOME de alguém */
function cabecasQueSaoNome(textos, pessoas) {
  const out = new Set();
  const deGente = new Set();
  for (const n of Array.isArray(pessoas) ? pessoas : []) {
    const p = palavrasDe(n && typeof n === "object" ? n.nome : n)[0];
    if (p && CABECAS.has(p)) deGente.add(p);
  }
  const visto = new Map();
  for (const t of textos) {
    const cru = semAcento(t);
    let antes = "";
    for (const m of cru.matchAll(/[A-Za-z0-9]+/g)) {
      const w = m[0].toLowerCase();
      if (CABECAS.has(w)) {
        const v = visto.get(w) || { nome: true };
        const maiuscula = m[0][0] !== w[0];
        if (!maiuscula || DETERMINANTES.has(antes)) v.nome = false;
        visto.set(w, v);
      }
      antes = w;
    }
  }
  for (const [w, v] of visto) if (v.nome) out.add(w);
  /* o nome de quem é gente conta — a não ser que a prosa mostre, com
     artigo, o bicho do mesmo nome ("Lobo, o ferreiro" e "o lobo cinzento") */
  for (const w of deGente) if (!visto.has(w) || visto.get(w).nome) out.add(w);
  return out;
}
/* as criaturas de um texto: a cabeça e, se houver, o conector e a palavra.
   `fora`: as cabeças que ali são nome de alguém (`cabecasQueSaoNome`) */
function criaturasDe(texto, fora) {
  const ps = palavrasDe(texto);
  const out = [];
  ps.forEach((p, i) => {
    if (!CABECAS.has(p) || (fora && fora.has(p))) return;
    const c = ps[i + 1], w = ps[i + 2];
    const comp = c && w && CRIATURA_NA_PROSA.conectores.includes(c) && w.length >= 3 && !CABECAS.has(w) ? [c, w] : [];
    out.push({ cabeca: p, palavras: [p, ...comp] });
  });
  return out;
}
const textosDe = (x) => (Array.isArray(x) ? x : [x]).filter((s) => typeof s === "string" && s.trim());
const capital = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
/* o nome como a prosa o escreveu (com acento): a mesma posição no texto
   cru, quando tirar o acento não muda o tamanho; senão, o sem acento */
function comoEscrito(palavras, textos) {
  const rx = new RegExp("(^|[^a-z0-9])(" + palavras.join("[^a-z0-9]+") + ")(?![a-z0-9])");
  for (const t of textos) {
    const n = norm(t);
    if (n.length !== t.length) continue;
    const m = n.match(rx);
    if (m) return t.slice(m.index + m[1].length, m.index + m[1].length + m[2].length).toLowerCase();
  }
  return palavras.join(" ");
}

/* A criatura que o jogador NOMEIA e o Mestre MOSTROU, ou null. `mostrado`:
   o texto (ou os textos) das últimas respostas do Mestre. `conhecidas`:
   [{ nome, ameaca }] — o bicho de um marco ou do bestiário, cujo nome e
   ameaça valem quando a cabeça casa. O nome é o da prosa: o complemento do
   jogador se o Mestre o disse, senão o do Mestre. */
export function criaturaMostrada(texto, mostrado, conhecidas = [], pessoas = []) {
  const fora = cabecasQueSaoNome(textosDe(mostrado), pessoas);
  const doMestre = textosDe(mostrado).flatMap((t) => criaturasDe(t, fora));
  if (!doMestre.length) return null;
  const doJogador = criaturasDe(texto, fora);
  for (const j of doJogador) {
    const vistas = doMestre.filter((m) => m.cabeca === j.cabeca);
    if (!vistas.length) continue;
    const igual = vistas.find((m) => m.palavras.join(" ") === j.palavras.join(" "));
    const comComplemento = vistas.find((m) => m.palavras.length > 1);
    const palavras = igual ? igual.palavras : j.palavras.length > 1 ? j.palavras : (comComplemento || vistas[0]).palavras;
    return comAmeaca(comoEscrito(palavras, [...textosDe(mostrado), String(texto || "")]), j.cabeca, conhecidas);
  }
  return null;
}
function comAmeaca(nome, cabeca, conhecidas) {
  const lista = (Array.isArray(conhecidas) ? conhecidas : []).filter((c) => c && c.nome);
  const k = lista.find((c) => norm(c.nome) === norm(nome)) || lista.find((c) => palavrasDe(c.nome).includes(cabeca));
  return k
    ? { nome: String(k.nome), ameaca: String(k.ameaca || CRIATURA_NA_PROSA.ameaca), criatura: true }
    : { nome: capital(nome), ameaca: CRIATURA_NA_PROSA.ameaca, criatura: true };
}
/* o único bicho que a ÚLTIMA resposta mostra (para o pronome sem nome) */
function unicaCriaturaDa(mostrado, conhecidas, pessoas) {
  const ts = textosDe(mostrado);
  const ultima = ts.length ? criaturasDe(ts[ts.length - 1], cabecasQueSaoNome(ts, pessoas)) : [];
  const cabecas = [...new Set(ultima.map((c) => c.cabeca))];
  if (cabecas.length !== 1) return null;
  const c = ultima.find((x) => x.palavras.length > 1) || ultima[0];
  return comAmeaca(comoEscrito(c.palavras, ts), c.cabeca, conhecidas);
}
/* ---------------- A PESSOA ARMADA QUE O MESTRE MOSTROU (MM-C · 7.ª sessão de prova, M20 e M61) ----------------
   A C0 resolveu o BICHO; a 7.ª sessão não teve bicho nenhum, e as duas
   lutas que o jogador declarou eram contra GENTE que o Mestre pôs à frente
   dele, armada:
     M18–M20: Jaco — "Tem dois carregando tocha na ladeira do porto." →
       "ataco o homem da tocha" → "A ladeira está vazia" (evaporou);
     M60–M61: "Ele tira uma faca de pesca…" → "ataco o pescador de barba
       ruiva com os punhos" → [SEM ALVO NO REGISTRO].
   O que a trava da casa protege continua protegido: o jogador não ESCREVE
   o inimigo — quem o pôs ali foi o Mestre, com uma arma na mão, nas falas
   dele (`mostrado`). Então a pessoa entra como combatente quando:
     1) a oração do golpe nomeia gente por uma CABEÇA da tabela (homem,
        pescador, camarada, guarda…), com o complemento que a prosa lhe
        pendura ("da tocha", "de barba ruiva");
     2) o Mestre a mostrou: a cabeça, ou uma palavra do complemento, está
        nas falas dele;
     3) e as falas dele trazem uma ARMA ou um gesto de ameaça (`armas`).
   O nome é o da frase do jogador, como ele o escreveu; a ameaça, a do
   papel quando a cabeça o diz (`ameacaDoPapel`), senão a de gente comum.
   `armadoNaProsa`: quem puxou a faca ao herói não é vítima de crime
   (`lerCrime`) — é a luta que o próprio Mestre armou. */
export const PESSOA_NA_PROSA = {
  cabecas: [
    "homem", "homens", "mulher", "mulheres", "sujeito", "sujeitos", "tipo", "pescador", "pescadores", "camarada", "marinheiro", "marinheiros",
    "guarda", "guardas", "soldado", "soldados", "capanga", "capangas", "bandido", "bandidos", "ladrao", "ladroes", "brutamontes", "mercenario",
    "mercenarios", "encapuzado", "encapuzados", "estranho", "estranhos", "velho", "rapaz", "moco", "grandalhao", "valentao", "assassino",
    "cacador", "estivador", "estivadores", "contrabandista", "contrabandistas", "salteador", "salteadores", "carrasco", "acusador",
  ],
  conectores: ["de", "do", "da", "dos", "das"],
  /* o que acaba o complemento: o meio do golpe e o resto da oração */
  fim: ["com", "e", "que", "sem", "ate", "enquanto", "antes", "pela", "pelo", "na", "no", "nas", "nos", "em", "a", "o", "os", "as"],
  armas: [
    "faca", "facas", "lamina", "laminas", "punhal", "adaga", "espada", "espadas", "porrete", "clava", "machado", "machadinha", "foice", "arpao",
    "gancho", "tocha", "tochas", "archote", "archotes", "besta", "arco", "lanca", "cutelo", "navalha", "corrente", "correntes", "bastao", "cajado", "garrucha", "pistola",
    "desafia", "desafio", "duelo", "ameaca", "ameacando", "saca", "sacou", "empunha", "empunhando",
  ],
  porque: "o Mestre pôs essa pessoa armada à frente do herói, e o jogador a nomeou: existe, e é contra ela o golpe",
};
const CABECAS_DE_GENTE = new Set(PESSOA_NA_PROSA.cabecas);
/* a pessoa que o golpe nomeia: { cabeca, palavras } — a cabeça e, se houver,
   um conector e até duas palavras de complemento */
function pessoasDe(texto, maxComp = 2) {
  const ps = palavrasDe(texto);
  const out = [];
  ps.forEach((p, i) => {
    if (!CABECAS_DE_GENTE.has(p)) return;
    const comp = [];
    if (PESSOA_NA_PROSA.conectores.includes(ps[i + 1])) {
      for (let k = i + 2; k < ps.length && comp.length < maxComp; k++) {
        const w = ps[k];
        if (w.length < 3 || PESSOA_NA_PROSA.fim.includes(w) || CABECAS_DE_GENTE.has(w)) break;
        comp.push(w);
      }
    }
    out.push({ cabeca: p, palavras: comp.length ? [p, ps[i + 1], ...comp] : [p], comp });
  });
  return out;
}
/* o nome como a prosa o escreveu, COM a caixa dos nomes próprios ("camarada
   de Tônia"): a primeira letra é a do começo do nome, e sobe */
function nomeDaProsa(palavras, textos) {
  const rx = new RegExp("(^|[^a-z0-9])(" + palavras.join("[^a-z0-9]+") + ")(?![a-z0-9])");
  for (const t of textos) {
    const n = norm(t);
    if (n.length !== t.length) continue;
    const m = n.match(rx);
    if (m) { const cru = t.slice(m.index + m[1].length, m.index + m[1].length + m[2].length); return capital(cru[0].toLowerCase() + cru.slice(1)); }
  }
  return capital(palavras.join(" "));
}
/* A pessoa armada que o jogador NOMEIA no golpe e o Mestre MOSTROU, ou null.
   `mostrado`: o texto (ou os textos) das últimas respostas do Mestre. */
export function pessoaMostrada(texto, mostrado) {
  const ts = textosDe(mostrado);
  if (!ts.length) return null;
  const doMestre = ` ${ts.map((x) => palavrasDe(x).join(" ")).join(" ")} `;
  const armado = PESSOA_NA_PROSA.armas.some((w) => doMestre.includes(` ${w} `));
  if (!armado) return null;
  const golpe = oracoesDoGolpe(texto);
  for (const j of pessoasDe(golpe.length ? golpe.join(" . ") : texto)) {
    const viu = doMestre.includes(` ${j.cabeca} `) || j.comp.some((w) => w.length >= 4 && doMestre.includes(` ${w} `));
    if (!viu) continue;
    const nome = nomeDaProsa(j.palavras, [String(texto || ""), ...ts]);
    const peso = ameacaDoPapel(j.cabeca);
    return { nome, ameaca: peso.ameaca, pessoa: true, armadoNaProsa: true };
  }
  return null;
}

/* ---------------- QUEM SE DESCREVE PELA ARMA (12/10, a 8.ª sessão de prova, M37–M39) ----------------
   "Duas sombras de túnicas escuras descem a trilha… Um deles carrega um
   archote apagado, o outro, uma corrente fina." — e o jogador: "ataco A
   QUE LEVA A CORRENTE". Não há cabeça de gente na frase (é "a que", não "a
   mulher"), e por isso `pessoaMostrada` não a via; o golpe caiu no pronome
   e o pronome na companheira de viagem (`NOME_NAO_E_BICHO`). Quem se
   descreve pela arma que o Mestre lhe pôs na mão é a mesma pessoa armada:
   a descrição resolve primeiro para quem o Mestre MOSTROU, e nunca para
   quem anda com o herói.
   O nome é o que a prosa lhe dá: a cabeça vaga mais perto ANTES da arma
   (`vagas` — sombra, vulto, figura, e as cabeças de gente), no singular, e
   a arma: "Sombra da corrente"; sem cabeça perto, `generico`. O "da"/"do"
   sai do artigo que a prosa pôs na arma ("uma corrente", "um archote"). */
/* "a que leva a corrente", "o do archote", "quem carrega a tocha" — e não
   "ataco-o com a espada": o "com" é o meio do golpe, e o "o" é pronome */
const LEVA = "(?:leva|levava|carrega|carregava|tem|tinha|segura|segurava|traz|trazia|empunha|empunhava|arrasta|arrastava|balanca|balancava)";
export const ARMADO_DESCRITO = {
  rx: new RegExp("(?:^|[^a-z-])(?:(?:o|a|os|as|aquele|aquela|aqueles|aquelas)\\s+(?:que\\s+" + LEVA + "|d[oa]s?)|quem\\s+" + LEVA + ")\\s+(?:(?:o|a|os|as|um|uma|sua|seu)\\s+)?([a-z]+)"),
  vagas: ["sombra", "sombras", "vulto", "vultos", "figura", "figuras", "encapuzado", "encapuzada", "encapuzados", "encapuzadas"],
  perto: 30,
  generico: "Vulto",
  porque: "o jogador descreveu pela arma quem o Mestre pôs armado à frente dele: existe, e é contra essa pessoa o golpe",
};
const NAO_SAO_ARMA = new Set(["desafia", "desafio", "duelo", "ameaca", "ameacando", "saca", "sacou", "empunha", "empunhando"]);
const ARMAS_NOME = new Set(PESSOA_NA_PROSA.armas.filter((w) => !NAO_SAO_ARMA.has(w)));
const VAGAS = new Set([...ARMADO_DESCRITO.vagas, ...PESSOA_NA_PROSA.cabecas]);
const singular = (w) => (w.endsWith("s") && VAGAS.has(w.slice(0, -1)) ? w.slice(0, -1) : w.endsWith("es") && VAGAS.has(w.slice(0, -2)) ? w.slice(0, -2) : w);
export function armadoDescrito(texto, mostrado) {
  const ts = textosDe(mostrado);
  if (!ts.length) return null;
  const golpe = oracoesDoGolpe(texto);
  const m = norm(golpe.length ? golpe.join(" . ") : texto).match(ARMADO_DESCRITO.rx);
  const arma = m ? m[1] : "";
  if (!ARMAS_NOME.has(arma)) return null;
  /* a arma tem de estar nas falas do Mestre, e de lá sai quem a leva: a
     menção mais nova que tenha uma cabeça perto; senão, a mais nova */
  let achada = null;
  for (const t of ts.slice().reverse()) {
    const ps = palavrasDe(t);
    for (let i = ps.length - 1; i >= 0; i--) {
      if (ps[i] !== arma) continue;
      let cab = "";
      for (let k = i - 1; k >= Math.max(0, i - ARMADO_DESCRITO.perto); k--) if (VAGAS.has(ps[k])) { cab = singular(ps[k]); break; }
      const art = ps[i - 1];
      const de = art === "um" || art === "o" || art === "seu" ? "do" : art === "uma" || art === "a" || art === "sua" ? "da" : "de";
      if (!achada || (cab && !achada.cab)) achada = { cab, de };
      if (cab) break;
    }
    if (achada && achada.cab) break;
  }
  if (!achada) return null;
  const nome = `${capital(achada.cab || ARMADO_DESCRITO.generico.toLowerCase())} ${achada.de} ${comoEscrito([arma], ts)}`;
  return { nome, ameaca: ameacaDoPapel(achada.cab).ameaca, pessoa: true, armadoNaProsa: true, descrito: true };
}

/* ---------------- A LUTA QUE O CARTÃO PROMETE (MM-C · 7.ª sessão de prova, M59–M61) ----------------
   "Defender a versão dela — o camarada desafia você para um duelo": o
   jogador escolheu o lado caro, e o duelo não existia (M61, "sem alvo no
   registro"); o lado seguro saía de graça. Um cartão que promete uma luta
   tem de a poder abrir. `alvoPrometido(contra)` devolve SEMPRE com quem é a
   luta que o efeito `combate`/`duelo` de um lado diz (`contra`, "o velho
   camarada"): (1) a pessoa do registo da cena cujo papel ou nome traz a
   cabeça do `contra` (o Marlo que o Cronista registou "camarada de Tônia");
   (2) a que o Mestre mostrou com essa cabeça; (3) o próprio `contra`, com
   nome de gente. A ameaça é a do papel; a da sombra (o vilão, "De frente")
   é a da tabela. */
export const LUTA_PROMETIDA = {
  ameaca: "comum",
  sombra: "elite",
  porque: "o lado da decisão prometeu esta luta antes do clique, e a promessa abre-a",
};
export function alvoPrometido(contra, opcoes) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const txt = String(contra || "").trim();
  const semArt = txt.replace(/^(o|a|os|as|um|uma)\s+/i, "").trim();
  if (o.sombra && semArt) return { nome: capital(semArt), ameaca: LUTA_PROMETIDA.sombra, deOnde: "sombra" };
  const cabecas = palavrasDe(txt).filter((w) => CABECAS_DE_GENTE.has(w));
  const cabeca = cabecas[cabecas.length - 1] || "";
  if (cabeca) {
    const raiz = cabeca.replace(/(es|s)$/, "");
    const reg = (Array.isArray(o.presentes) ? o.presentes : []).filter((p) => p && p.nome && !p.doGrupo)
      .find((p) => palavrasDe(`${p.papel || ""} ${p.nome}`).some((w) => w === cabeca || w.replace(/(es|s)$/, "") === raiz));
    if (reg) return { nome: String(reg.nome), ameaca: ameacaDoPapel(reg.papel || "").ameaca, deOnde: "registo" };
    const ts = textosDe(o.mostrado);
    for (const t of ts.slice().reverse()) {
      /* da prosa, um só nome de complemento: "camarada de Tônia", nunca
         "camarada de Tônia aparece" */
      const vista = pessoasDe(t, 1).find((x) => x.cabeca === cabeca && x.comp.length);
      if (vista) return { nome: nomeDaProsa(vista.palavras, ts), ameaca: ameacaDoPapel(cabeca).ameaca, deOnde: "prosa" };
    }
  }
  return { nome: capital(semArt || "Quem o desafiou"), ameaca: cabeca ? ameacaDoPapel(cabeca).ameaca : LUTA_PROMETIDA.ameaca, deOnde: "cartao" };
}

/* as orações que DECLARAM o golpe (o resto da frase pode citar quem não apanha) */
function oracoesDoGolpe(texto) {
  const os = String(texto || "").split(/[.!?;\n]+|\s+(?:e|mas|porem|porém|depois|enquanto)\s+/i).filter((s) => s.trim());
  return os.filter((s) => { try { return ehDeclaracaoDeAtaque(s); } catch { return false; } });
}

export function alvoDaAgressao(texto, opcoes) {
  const o = opcoes || {};
  const presentes = Array.isArray(o.presentes) ? o.presentes : [];
  const grupo = Array.isArray(o.grupo) ? o.grupo : [];
  const t = norm(texto);
  if (!t.trim()) return null;
  const doGrupo = new Set(grupo.map((g) => norm(g && g.nome)).filter(Boolean));
  const vivos = presentes.filter((n) => n && n.nome && String(n.nome).length >= 3);
  /* 8.ª sessão: QUEM ANDA COMIGO sem ser do grupo — a companheira de viagem
     (`comigo`: os nomes, ou { nome }, de quem o App sabe a caminhar com o
     herói). Por pronome ou descrição é recusada como o grupo; pelo NOME
     abre — com o cartão antes (`comigo`, crime.js#veredictoDoCrime) */
  const listaComigo = (Array.isArray(o.comigo) ? o.comigo : []).map((x) => String(x && typeof x === "object" ? x.nome || "" : x || "")).filter((n) => n.length >= 3);
  const primeiro = (n) => norm(n).split(/[^a-z0-9]+/).filter(Boolean)[0] || "";
  const ehComigo = (nome) => listaComigo.some((c) => norm(c) === norm(nome) || (primeiro(c).length >= 3 && primeiro(c) === primeiro(nome)));
  const pessoas = [...vivos, ...grupo, ...listaComigo];
  const citados = vivos
    .filter((n) => t.includes(norm(n.nome)))
    .sort((a, b) => String(b.nome).length - String(a.nome).length);
  const forma = (alvo, extra) => (doGrupo.has(norm(alvo.nome))
    /* o companheiro fica de fora: virar aliado em inimigo mexe em ficha,
       vínculo e elenco, e fazer isso em silêncio a partir de uma frase
       ambígua custa mais do que ganha */
    ? { nome: alvo.nome, doGrupo: true, ...extra }
    : ehComigo(alvo.nome) && extra && extra.porPronome
      /* quem anda comigo nunca é o alvo de um pronome: recusa-se como o grupo */
      ? { nome: alvo.nome, doGrupo: true, comigo: true, ...extra }
      : { nome: alvo.nome, papel: alvo.papel || "", relacao: alvo.relacao, doGrupo: false, ...(ehComigo(alvo.nome) ? { comigo: true } : {}), ...extra });
  /* o nome dito de quem anda comigo, ainda que o registo da cena não o
     tenha (a companheira de viagem não é "daqui"): abre, com o cartão */
  const comigoDito = listaComigo.find((n) => primeiro(n).length >= 3 && palavrasDe(oracoesDoGolpe(texto).join(" . ") || texto).includes(primeiro(n)));
  /* MM-C · C0: com o que o Mestre mostrou na mão, a ordem de cima */
  const temMostrado = textosDe(o.mostrado).length > 0;
  if (temMostrado) {
    const doGolpe = norm(oracoesDoGolpe(texto).join(" . "));
    const naOracao = doGolpe ? citados.filter((n) => doGolpe.includes(norm(n.nome))) : [];
    if (naOracao.length) return forma(naOracao[0], {});
    if (comigoDito) return forma({ nome: comigoDito }, {});
    const bicho = criaturaMostrada(texto, o.mostrado, o.conhecidas, pessoas);
    if (bicho) return { ...bicho, doGrupo: false, deOnde: "prosa" };
    /* 7.ª sessão: e a GENTE armada que o Mestre mostrou, depois do bicho */
    const gente = pessoaMostrada(texto, o.mostrado);
    if (gente) return { ...gente, doGrupo: false, deOnde: "prosa" };
    /* 8.ª sessão: e quem o jogador descreve pela arma que o Mestre lhe pôs na mão */
    const descrito = armadoDescrito(texto, o.mostrado);
    if (descrito) return { ...descrito, doGrupo: false, deOnde: "prosa" };
  }
  if (citados.length) return forma(citados[0], {});
  if (comigoDito) return forma({ nome: comigoDito }, {});
  /* sem nome: só o pronome abre a segunda pergunta */
  let porPronome = false;
  try { porPronome = PRONOME_DO_ALVO.rx.test(soODeclarado(texto, NAO_E_AGRESSAO)); } catch { porPronome = false; }
  if (!porPronome) return null;
  if (temMostrado) {
    const so = unicaCriaturaDa(o.mostrado, o.conhecidas, pessoas);
    if (so) return { ...so, doGrupo: false, porPronome: true, deOnde: "prosa" };
  }
  const doPapo = ultimoCitado(o.recentes, vivos);
  if (doPapo) return forma(doPapo, { porPronome: true, deOnde: "conversa" });
  const hostis = vivos.filter((n) => !doGrupo.has(norm(n.nome)) && !ehComigo(n.nome) && PRONOME_DO_ALVO.hostil.test(norm(n.relacao)));
  if (hostis.length === 1) return forma(hostis[0], { porPronome: true, deOnde: "hostil" });
  return null;
}

/* ============================================================
   O VEREDICTO
   ============================================================ */
export function lerAgressao(texto, opcoes) {
  const o = opcoes || {};
  if (o.emCombate) return null;                     // dentro da luta quem age é o painel
  const presentes = Array.isArray(o.presentes) ? o.presentes : [];
  const grupo = Array.isArray(o.grupo) ? o.grupo : [];
  const nomes = presentes.map((n) => n && n.nome).filter(Boolean);
  if (!ehDeclaracaoDeAtaque(texto, { nomes })) return null;
  const alvo = alvoDaAgressao(texto, { presentes, grupo, recentes: o.recentes, mostrado: o.mostrado, conhecidas: o.conhecidas, comigo: o.comigo });
  if (!alvo) {
    let porPronome = false;
    try { porPronome = PRONOME_DO_ALVO.rx.test(soODeclarado(texto, NAO_E_AGRESSAO)); } catch { porPronome = false; }
    return porPronome
      ? { tipo: "semAlvoConhecido", porPronome: true,
          porque: "eu declarei um ataque contra alguém que só nomeei por pronome, e o sistema não sabe com certeza quem é" }
      : { tipo: "semAlvoConhecido",
          porque: "eu declarei um ataque e o sistema não tem, no registro deste lugar, ninguém com esse nome" };
  }
  if (alvo.doGrupo) {
    return { tipo: "companheiro", nome: alvo.nome, porque: "quem viaja comigo não vira inimigo por uma frase" };
  }
  /* MM-C · C0: o bicho que o Mestre mostrou — não é gente, não é crime
     (`lerCrime` recusa `criatura`), e a ameaça é a dele */
  if (alvo.criatura) {
    return {
      tipo: "agressao", nome: alvo.nome, papel: "", criatura: true,
      ameaca: alvo.ameaca, porqueDoPeso: CRIATURA_NA_PROSA.porque,
      porque: "eu declarei o primeiro golpe contra o que o Mestre pôs na cena",
    };
  }
  /* 7.ª sessão: a pessoa que o Mestre armou à frente do herói — luta, não
     crime (`lerCrime` recusa `armadoNaProsa`) */
  if (alvo.pessoa) {
    return {
      tipo: "agressao", nome: alvo.nome, papel: "", pessoa: true, armadoNaProsa: true,
      ameaca: alvo.ameaca, porqueDoPeso: alvo.descrito ? ARMADO_DESCRITO.porque : PESSOA_NA_PROSA.porque,
      porque: "eu declarei o golpe contra quem o Mestre pôs armado à minha frente",
    };
  }
  const peso = ameacaDoPapel(alvo.papel);
  return {
    tipo: "agressao",
    nome: alvo.nome, papel: alvo.papel || "",
    ameaca: peso.ameaca, porqueDoPeso: peso.porque,
    /* 8.ª sessão: quem anda comigo, pelo nome — o cartão vem antes (crime.js) */
    ...(alvo.comigo ? { comigo: true } : {}),
    porque: alvo.comigo ? "eu declarei, pelo nome, o primeiro golpe contra quem anda comigo" : "eu declarei o primeiro golpe contra alguém que está aqui",
  };
}

/* ============================================================
   O QUE O JOGADOR LÊ E O QUE O MESTRE RECEBE
   ============================================================ */
export function falaDaAgressao(a) {
  if (!a || a.tipo !== "agressao") return "";
  return `⚔ Você parte para cima de ${a.nome} — o combate está aberto.`;
}

export function falaDoCompanheiro(a) {
  if (!a || a.tipo !== "companheiro") return "";
  return `✋ ${a.nome} viaja com você. Se é para romper com quem está do seu lado, diga com todas as letras o que quer fazer — o sistema não abre essa luta por engano.`;
}

export function envelopeDaAgressao(a) {
  if (!a || a.tipo !== "agressao") return "";
  return `[COMBATE ABERTO PELO SISTEMA] Eu declarei o primeiro golpe contra ${a.nome}${a.papel ? ` (${a.papel})` : ""} e o painel de combate JÁ ESTÁ ABERTO, com a ficha do alvo montada pelo sistema.
REGRA DESTE ENVELOPE (obrigatória): NÃO envie "combate_iniciar" — já está feito, e mandar de novo cria um segundo inimigo. Narre o instante da investida em uma ou duas frases — o aço saindo da bainha, a cara de quem entendeu tarde demais, quem se levanta em volta — e me passe a vez: eu ajo pelos botões de combate.
NÃO decida se o golpe acertou, NÃO diga quanto doeu e NÃO faça ${a.nome} recuar, fugir, se render ou "desviar por pouco": o dado resolve isso e ainda não foi rolado. E não desfaça o que eu fiz — não há versão desta cena em que eu não ataquei.`;
}

export function envelopeSemAlvo(a, oQueEuDisse = "") {
  if (!a || a.tipo !== "semAlvoConhecido") return "";
  const porque = a.porPronome
    ? "não sabe com certeza de quem eu falo — não citei nome, e há mais de uma pessoa a quem o pronome pode apontar, ou nenhuma no registro"
    : "não tem, no registro deste lugar, ninguém com o nome que eu citei — quem está aí pode ser uma criatura que só você descreveu";
  return `[ATAQUE DECLARADO — SEM ALVO NO REGISTRO] Eu disse: "${String(oQueEuDisse).slice(0, 160)}". Isso é uma declaração de violência, e não uma pergunta. O sistema não abriu o combate porque ${porque}.
REGRA DESTE ENVELOPE (obrigatória): decida UMA das duas coisas, e só uma:
1) HÁ alvo aqui — então DECLARE "combate_iniciar" com ele agora, nesta mesma resposta, e narre só a investida. Não resolva a luta.
2) NÃO há alvo aqui — então diga isso na ficção, curto ("não há ninguém para atacar"), e devolva a palavra para mim.
O que você NÃO pode fazer é narrar a briga acontecendo sem abrir o combate: sem o painel aberto, nada do que você contar tem número atrás, e eu fico lendo uma luta que não está acontecendo.`;
}

/* ============================================================
   A LUTA QUE SÓ A PROSA COMEÇOU (MM-C · C0, 11/10 — a 6.ª sessão, M47)

   "Avanço pelo túnel com Vando e enfrento o que vier ao nosso encontro" —
   e o Mestre escreveu "Não há recuo. A luta começa", descreveu golpes, e
   não mandou `combate_iniciar`: nenhum botão de luta, nenhum número atrás
   dos golpes, a heroína a ler uma luta que não acontecia. Só o "Ataco o
   lagarto" do turno seguinte a abriu.

   O veto é do CANAL DINÂMICO (`naoPode` da pauta), nunca bloco estático: só
   entra no turno em que há luta à vista e nenhum combate aberto — quando o
   jogador declara enfrentar (`jogador`) ou quando a última resposta do
   Mestre já narrou a luta a começar (`prosa`). Fora disso, não custa um
   carácter ao teto. Lido sem acento. */
export const LUTA_SEM_PAINEL = {
  jogador: /\b(enfrento|enfrentamos|enfrentar|luto contra|lutamos contra|encaro a luta|parto para a luta|vamos a luta|sem recuar|nao recuo|nao recuamos|avanco contra|avancamos contra)\b/,
  prosa: /\b(a luta (comeca|começa|esta lancada|explode)|comeca a luta|o combate (comeca|começa)|nao ha recuo|partem para cima|se arremessa(m)? (sobre|contra)|investe contra (voce|vos|vando|o grupo))\b/,
  veto: "narrar a luta a começar ou golpe trocado sem combate aberto pelo sistema: se há luta nesta cena, declare combate_iniciar nesta resposta e narre só a investida; se não há, pare antes do primeiro golpe",
};

/* O veto do turno, numa lista (o molde de `porNaPauta`): [] fora do caso.
   `texto`: a frase do jogador; `mostrado`: a última resposta do Mestre;
   `emCombate`: há painel aberto (aí a luta é do sistema e nada a vetar). */
export function vetoDaLutaSemPainel(texto, opcoes) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  if (o.emCombate) return [];
  const j = norm(texto);
  const ultima = textosDe(o.mostrado).slice(-1).map(norm)[0] || "";
  let declara = false;
  try { declara = LUTA_SEM_PAINEL.jogador.test(soODeclarado(texto, NAO_E_AGRESSAO)); } catch { declara = LUTA_SEM_PAINEL.jogador.test(j); }
  return declara || LUTA_SEM_PAINEL.prosa.test(ultima) ? [LUTA_SEM_PAINEL.veto] : [];
}
