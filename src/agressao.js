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

export function alvoDaAgressao(texto, opcoes) {
  const o = opcoes || {};
  const presentes = Array.isArray(o.presentes) ? o.presentes : [];
  const grupo = Array.isArray(o.grupo) ? o.grupo : [];
  const t = norm(texto);
  if (!t.trim()) return null;
  const doGrupo = new Set(grupo.map((g) => norm(g && g.nome)).filter(Boolean));
  const vivos = presentes.filter((n) => n && n.nome && String(n.nome).length >= 3);
  const citados = vivos
    .filter((n) => t.includes(norm(n.nome)))
    .sort((a, b) => String(b.nome).length - String(a.nome).length);
  const forma = (alvo, extra) => (doGrupo.has(norm(alvo.nome))
    /* o companheiro fica de fora: virar aliado em inimigo mexe em ficha,
       vínculo e elenco, e fazer isso em silêncio a partir de uma frase
       ambígua custa mais do que ganha */
    ? { nome: alvo.nome, doGrupo: true, ...extra }
    : { nome: alvo.nome, papel: alvo.papel || "", relacao: alvo.relacao, doGrupo: false, ...extra });
  if (citados.length) return forma(citados[0], {});
  /* sem nome: só o pronome abre a segunda pergunta */
  let porPronome = false;
  try { porPronome = PRONOME_DO_ALVO.rx.test(soODeclarado(texto, NAO_E_AGRESSAO)); } catch { porPronome = false; }
  if (!porPronome) return null;
  const doPapo = ultimoCitado(o.recentes, vivos);
  if (doPapo) return forma(doPapo, { porPronome: true, deOnde: "conversa" });
  const hostis = vivos.filter((n) => !doGrupo.has(norm(n.nome)) && PRONOME_DO_ALVO.hostil.test(norm(n.relacao)));
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
  const alvo = alvoDaAgressao(texto, { presentes, grupo, recentes: o.recentes });
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
  const peso = ameacaDoPapel(alvo.papel);
  return {
    tipo: "agressao",
    nome: alvo.nome, papel: alvo.papel || "",
    ameaca: peso.ameaca, porqueDoPeso: peso.porque,
    porque: "eu declarei o primeiro golpe contra alguém que está aqui",
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
