/* ============================================================
   A PENEIRA DA DECLARAÇÃO (Fase MM) — o verbo está lá, a ação não

   "Posso atacar o guarda?" tem o verbo de atacar e não é um ataque.
   "Isso me mata de rir" tem o verbo de matar e ninguém morreu. "Não
   salto" tem o salto e não salta. Toda porta que lê a frase do jogador
   para AGIR por ele precisa, antes, desta pergunta: ele DECLAROU, ou
   perguntou, supôs, negou, lembrou, falou por figura?

   Ela nasceu duas vezes, e o bug estava no meio. A agressão (v9.73)
   tinha quatro travas — figura, "se eu atacar", passado, treino — e
   deixava passar a pergunta: "posso atacar o guarda?", com o guarda na
   cena, abria a luta. O improviso (MM4) escreveu a sua, mais completa
   (pergunta, pensar alto, negação, passado, frase feita), por cima das
   quatro de lá. Duas peneiras para a mesma pergunta são duas respostas
   para a mesma frase; agora é uma, mora aqui, e as duas portas a leem.

   A UNIDADE É A ORAÇÃO, NÃO O TEXTO. "Posso? Ataco o guarda." é uma
   pergunta seguida de uma declaração, e a declaração vale: quem
   perguntou e não esperou a resposta já decidiu. Antes, um "?" em
   qualquer lugar calava o texto inteiro. Agora cada frase (até . ! ? ;
   ou quebra de linha) é peneirada sozinha, e a que cai é MASCARADA com
   espaços — não cortada —, para que as posições continuem batendo com o
   texto do jogador na hora de escrever o rótulo com os acentos dele.

   E O AVESSO: "Ataco o guarda. Posso?" termina pedindo licença. A
   licença pedida no fim vale para o que veio antes, e o texto inteiro
   vira pedido (PEDIDO_DE_LICENCA).

   A FALA NÃO É O GESTO. 'Digo: "vou te socar"' é ameaça — o soco está
   na boca do herói, não no punho. O que está entre aspas, e o que vem
   depois de "digo:", sai da frase antes da peneira. Quem quiser a
   ameaça tem a intimidação no catálogo de desafios.

   A régua é a de sempre desta casa ("o portão morde só o necessário"):
   na dúvida, a peneira SEGURA. Um falso negativo devolve a vez ao
   Narrador, que é o comportamento antigo; um falso positivo abre uma
   luta ou rola um dado que ninguém pediu, e isso custa a cena.
   ============================================================ */

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* Cada linha é um jeito de uma ORAÇÃO ter o verbo e não ser a ação.
   São lidas uma oração por vez — nunca o texto inteiro. */
export const NAO_E_DECLARACAO = [
  {
    id: "pergunta", rx: /\?/,
    porque: "pergunta não é ação: quem pergunta ainda não fez — e a pergunta ao mundo tem porta própria, o oráculo",
  },
  {
    /* HIPÓTESE, LICENÇA E CONDIÇÃO — três jeitos de pensar alto.
       1) no começo da oração, o pedido e a dúvida: "posso", "devia",
          "dá para", "será que", "e se", "se", "caso" — com ou sem "?":
          "posso atacar o guarda" sem ponto continua sendo pergunta;
       2) no meio da oração, o poder/dever DO HERÓI seguido do infinitivo
          ("acho que consigo socá-lo", "vejo se consigo erguer"), que é
          medir a ação, não fazê-la. Só o do herói: "ataco o guarda que
          devia proteger a cidade" é o ataque;
       3) a condição: "se ele sacar a espada", "quando o guarda virar
          as costas" — o futuro do subjuntivo é um plano, não um golpe.
       "Salto o mais alto que posso" NÃO cai: "posso" sem infinitivo
       depois é medida do salto, e o salto aconteceu.
       E o "se" depois de preposição não é condição, é o pronome do
       infinitivo: "convenço o guarda A SE afastar", "PARA SE esconder".
       Achado quando o catálogo passou a ler esta peneira (a ênclise, Fase
       MM): "tento convencer o guarda a se matar por mim" deixava de ser a
       conversa que nenhuma lábia compra e virava nada. */
    id: "hipotese",
    rx: new RegExp([
      "^\\s*((mestre|narrador)\\s*,?\\s*)?((e|mas|entao)\\s+)?(eu\\s+)?(posso|podia|poderia|pude|devo|devia|deveria|consigo|conseguiria|da (para|pra)|daria (para|pra)|seria possivel|sera que|e se|se|caso|quem sabe|talvez|tem como|e possivel|vale a pena|a menos que|a nao ser que)\\b",
      "\\b(se eu|caso eu|e se|sera que|quero saber se|me pergunto se|imagino se|imagino que|me imagino|sonho que|sonhei que|sonho com|penso em|pensei em|pensando em|seria possivel|daria (para|pra)|da (para|pra) eu|como seria|a menos que|a nao ser que)\\b",
      "\\b(eu|se|acho que|creio que|sei que|penso que|imagino que|talvez)\\s+(eu\\s+)?(posso|podia|poderia|pude|consigo|conseguiria|devo|devia|deveria)\\s+((mesmo|ainda|so|tambem|nao|simplesmente)\\s+)?\\w+(ar|er|ir|or|[aei]-l[oa]s?)\\b",
      "(\\b(caso|quando|assim que|logo que)|(?<!\\b(a|de|para|pra|sem|por|ao)\\s+)\\bse)\\s+((ele|ela|eles|elas|alguem|voce|(o|a|os|as)\\s+\\w+)\\s+)?((se|me|nos|lhe)\\s+)?(\\w+(ar|er|ir|or)|for|forem|tiver|tiverem|puder|quiser|fizer|vier|der|estiver|houver|souber)\\b",
    ].join("|")),
    porque: "perguntar se pode, supor o que aconteceria ou planejar para quando algo acontecer não é fazer — agir aqui puniria o jogador por pensar alto",
  },
  {
    /* "Não ataco", "eu nunca salto", "não vou tentar". "Não, ataco!" é a
       vírgula que separa a resposta da ação — ali o "não" é para o
       Mestre, e a ação vale. E "nem penso duas vezes" é ênfase, não
       recusa. */
    id: "negacao",
    rx: /^\s*(eu\s+)?(nao|nunca|jamais|nem)\b(?!\s*,)(?!\s+(penso|pensar|hesito|hesitar|pestanejo|espero|perco tempo)\b)|\b(nao|nunca|jamais|nem) (vou|tento|quero|consigo|posso|devo|pretendo|ouso|irei|pretendia|quis|vou mais)\b/,
    porque: "o que o herói decide NÃO fazer não tem o que rolar, nem luta para abrir",
  },
  {
    /* contar é diferente de fazer, e o mais-que-perfeito do herói ("eu
       tinha socado") é sempre conto. Só o do herói: "ataco o guarda que
       tinha roubado minha bolsa" é o ataque, e o passado é do guarda */
    id: "passado",
    rx: /\b(ontem|anteontem|naquele dia|quando eu era|na semana passada|anos atras|dias atras|certa vez|uma vez eu)\b|\b(ataquei|golpeei|acertei|matei|derrubei|soquei|chutei|esfaqueei) \w+ (ontem|antes|no dia|naquele|quando)\b|(^\s*|\b(eu|nos|ja)\s+)(tinha|havia|tinhamos|haviamos|teria)\s+((o|a|os|as|lhe|me|se|ja)\s+)?\w+(ado|ido)\b/,
    porque: "contar o que já fez não é fazer de novo",
  },
  {
    /* FIGURA DE LINGUAGEM, a outra metade do "o portão morde só o
       necessário": o verbo está lá, a ação não. A lista é de frases
       feitas, e cresce quando o jogo achar mais uma. */
    id: "fraseFeita",
    rx: /\b(morro de (rir|vergonha|medo|fome|sono|tedio|saudade|raiva)|me mata( de)?\b|mata de rir|quebr(o|ar) a cabeca|perco a cabeca|(pulo|salto) de (alegria|felicidade|susto|contente)|pulo fora|pulo (a|essa|esta) parte|engulo (o orgulho|o sapo|seco|a raiva|em seco)|seguro as pontas|seguro o riso|dou a volta por cima|empurro com a barriga|lanc(o|ar) (um|uma|o|a) (olhar|sorriso|piscadela|pergunta|ideia|desafio|olhada|indireta|boato)|jogo (conversa fora|verde|uma indireta)|quebr(o|ar) o (gelo|silencio|clima|jejum|galho|protocolo|encanto)|carrego o mundo|arranco (um sorriso|risadas?|aplausos|suspiros|uma risada)|derrubo (a tese|o argumento|a mentira)|desvio (do|o) (assunto|olhar|rumo)|(o|um|do|no|meu|seu|dar um|de um) (salto|pulo)\b|mat(o|ar) (dois|2) coelhos|chut(o|ar) o balde|acert(o|ar) na mosca|acert(o|ar) (as|a) contas?|acert(o|ar) a mao)/,
    porque: "figura de linguagem tem o verbo e não tem a ação — 'isso me mata de rir' não pede Vigor nem abre luta",
  },
];

/* A licença pedida no FIM vale para tudo o que veio antes: "Ataco o
   guarda. Posso?" é um pedido. Só as perguntas curtas de licença contam
   — "Ataco o guarda. Será que ele revida?" continua sendo o ataque, e a
   pergunta é sobre o depois. */
export const PEDIDO_DE_LICENCA = {
  rx: /^\s*((e|entao|mestre|narrador)\s*,?\s*)?(posso|pode|podemos|posso mesmo|da|da (para|pra)|daria|consigo|tudo bem|ok|certo|beleza|rola|vale|valeu|permitido|pode ser)\s*\?+\s*$/,
  porque: "quem termina perguntando se pode ainda não fez — a licença do fim vale para a frase inteira",
};

/* O que o sistema vê da frase é a AÇÃO, não a fala. Mascara com espaços
   (e não corta) para que as posições continuem batendo com o texto
   original. A fala depois de "digo:" vai até o fim do texto — salvo
   quando vem entre aspas, e aí só as aspas saem: 'Digo: "morra!" e
   ataco o guarda' tem o ataque fora da boca. */
const mascarar = (m) => m.replace(/[^\n]/g, " ");
const VERBO_DE_FALA = "digo|falo|grito|respondo|pergunto|sussurro|murmuro|comento|berro|anuncio|declaro|aviso|rosno|provoco";
function semAFala(t) {
  return String(t || "")
    .replace(new RegExp("\\b(" + VERBO_DE_FALA + ")\\b\\s*(:|—|-|que\\b)(?!\\s*[\"“”«'])[\\s\\S]*$"), (m, v) => v + mascarar(m.slice(v.length)))
    .replace(/["“”«»][^"“”«»]*["“”«»]/g, mascarar)
    .replace(/(^|[\s:—-])'[^'\n]*'(?=[\s.,!?;]|$)/g, (m, a) => a + mascarar(m.slice(a.length)));
}

/* As orações, com as posições: cada uma vai até o seu terminador. */
function oracoes(s) {
  const out = [];
  const rx = /[^.!?;\n]+[.!?;\n]*|[.!?;\n]+/g;
  let m;
  while ((m = rx.exec(s))) out.push({ ini: m.index, txt: m[0] });
  return out;
}

/* O texto normalizado com só o que o herói DECLAROU à mostra — a fala,
   as perguntas, as hipóteses, as negações, o passado e as figuras viram
   espaços. `travas` é a lista a aplicar oração a oração: por padrão a
   desta peneira; a agressão passa a sua (que a contém, e acrescenta as
   dela). Mesmo tamanho do texto normalizado, sempre. */
export function soODeclarado(texto, travas = NAO_E_DECLARACAO) {
  const t = semAFala(norm(texto));
  if (!t.trim()) return t;
  const lista = Array.isArray(travas) ? travas : NAO_E_DECLARACAO;
  const partes = oracoes(t);
  const cheias = partes.filter((p) => p.txt.trim().replace(/[.!?;\s]/g, ""));
  const ultima = cheias[cheias.length - 1];
  try {
    if (ultima && cheias.length > 1 && PEDIDO_DE_LICENCA.rx.test(ultima.txt)) return mascarar(t);
  } catch { /* nunca custa o turno */ }
  let s = t;
  for (const p of partes) {
    const cai = lista.some((n) => { try { return n && n.rx && n.rx.test(p.txt); } catch { return false; } });
    if (cai) s = s.slice(0, p.ini) + mascarar(p.txt) + s.slice(p.ini + p.txt.length);
  }
  return s;
}

/* ============================================================
   A ÊNCLISE (Fase MM) — "escondo-me" é "me escondo"

   Em português, o pronome depois do verbo é o jeito NORMAL de escrever,
   não o raro: escondo-me, esgueiro-me, equilibro-me, tento convencê-lo,
   vou esgueirar-me. O catálogo de desafios foi escrito em próclise ("me
   escondo", "me equilibro") e com o objeto depois do verbo ("sigo ele
   de longe", "tento convencer o guarda"), e por isso "escondo-me atrás
   do barril" não rolava nada — o mesmo defeito que a agressão teve com
   "socá-lo", agora no catálogo. Remendar quarenta `rx` seria quarenta
   lugares para esquecer o próximo verbo; aqui a FRASE é reescrita uma
   vez, antes do catálogo, na forma em que ele já lê.

   A DIREÇÃO NÃO É UMA SÓ, e foi medida no próprio catálogo:
     - o reflexivo e o dativo vão para ANTES do verbo, porque é assim que
       o catálogo os escreve: "escondo-me" → "me escondo", "dou-lhe um
       sermão" → "lhe dou um sermão";
     - o objeto (o, a, -lo, -la) fica DEPOIS, sem o hífen, porque é assim
       que o catálogo escreve quem sofre a ação: "sigo-o de longe" → "sigo
       o de longe" (como "sigo ele de longe"), "tento convencê-lo" → "tento
       convencer o". Em próclise, "tento o convencer" partiria o "tento
       convencer" que a tabela conhece.
   O -lo que comeu a letra do verbo devolve a letra: "convencê-lo" é
   convencer + o; "vemo-lo", vemos + o.

   O MESMO TAMANHO, SEMPRE. "escondo-me" e "me escondo" têm dez letras;
   "convencê-lo" e "convencer o", onze. A troca só mexe DENTRO do trecho
   trocado — o resto da frase fica na mesma posição, e o rótulo do
   improviso continua a copiar os acentos do jogador. Onde a língua não
   deixa (a mesóclise encurta, "escondemo-nos" alongaria), o trecho é
   completado com espaço ou fica sem o "s" do plural — o radical, que é
   o que o catálogo lê, não muda.

   O HÍFEN QUE NÃO É ÊNCLISE não se mexe: só se troca quando o que vem
   depois do hífen é um pronome e nada mais se lhe cola ("corpo-a-corpo",
   "bem-te-vi", "bem-me-quer" ficam), e quando o verbo não é, ele próprio,
   o fim de outra palavra com hífen. "Guarda-roupa", "meio-dia",
   "pé-de-cabra" nunca têm pronome depois do hífen.

   O CONDICIONAL FICA DE FORA de propósito: "esconder-me-ia" é "eu me
   esconderia", hipótese — e hipótese é da peneira, não do catálogo.

   Não peneira nada, e não substitui a peneira: a pergunta continua
   pergunta ("posso esconder-me?" vira "posso me esconder?", e a trava a
   apaga igual). Só muda a ordem das palavras.
   ============================================================ */
export const ENCLISE = {
  /* o pronome que o catálogo escreve antes do verbo */
  antes: ["me", "te", "se", "nos", "vos", "lhe", "lhes", "lho", "lha", "lhos", "lhas"],
  /* o objeto, que o catálogo escreve depois */
  depois: ["o", "a", "os", "as"],
  /* o -lo da ênclise que comeu a última letra: a letra que volta, pela
     terminação do que sobrou ("socá" → "socar", "vemo" → "vemos") */
  letraComida: [
    { fim: "mo", volta: "s" },
    { fim: "a", volta: "r" },
    { fim: "e", volta: "r" },
    { fim: "i", volta: "r" },
    { fim: "o", volta: "r" },
  ],
  /* só o futuro; o condicional (-ia) é hipótese e fica como está */
  mesoclise: ["ei", "as", "ás", "a", "á", "emos", "eis", "ao", "ão"],
  porque: "a ênclise é o jeito normal de escrever em português; o catálogo lê próclise e objeto depois do verbo, e a frase é reescrita uma vez, no mesmo tamanho, em vez de cada regra aprender as duas",
};

const SEM_ACENTO = { á: "a", â: "a", à: "a", ã: "a", é: "e", ê: "e", í: "i", ó: "o", ô: "o", õ: "o", ú: "u", Á: "A", Â: "A", É: "E", Ê: "E", Í: "I", Ó: "O", Ô: "O", Ú: "U" };
const tiraAcentoFinal = (p) => p.slice(0, -1) + (SEM_ACENTO[p.slice(-1)] || p.slice(-1));
const alt = (l) => l.slice().sort((a, b) => b.length - a.length).join("|");
/* o verbo que devolve a letra comida, ou nada se não tem cara de verbo */
function devolveALetra(host) {
  const base = tiraAcentoFinal(host);
  const b = base.toLowerCase();
  const r = ENCLISE.letraComida.find((l) => b.endsWith(l.fim));
  return r ? base + r.volta : "";
}
const completa = (novo, velho) => (novo.length < velho.length ? novo + " ".repeat(velho.length - novo.length) : novo.slice(0, velho.length));
const ehAntes = (p) => ENCLISE.antes.includes(p.toLowerCase());
/* a maiúscula do começo da frase passa ao pronome: "Escondo-me" → "Me escondo" */
function antesDoVerbo(p, v) {
  const cap = v.charAt(0) !== v.charAt(0).toLowerCase();
  return cap ? p.charAt(0).toUpperCase() + p.slice(1) + " " + v.charAt(0).toLowerCase() + v.slice(1) : p + " " + v;
}
const PRONOMES = alt([...ENCLISE.antes, ...ENCLISE.depois]);
const FUTURO = alt(ENCLISE.mesoclise);
/* o verbo: letras, sem hífen colado antes (senão é o fim de "bem-te-vi") */
const VERBO = "(?<![\\p{L}\\-])(\\p{L}{2,})";
const SOLTO = "(?![\\p{L}\\-])";
const RX_MESOCLISE = new RegExp(VERBO + "-(" + PRONOMES + "|l[oa]s?)-(" + FUTURO + ")" + SOLTO, "giu");
const RX_LO = new RegExp(VERBO + "-(l[oa]s?)" + SOLTO, "giu");
const RX_ENCLISE = new RegExp(VERBO + "-(" + PRONOMES + ")" + SOLTO, "giu");

/* A frase com a ênclise desfeita, no mesmo tamanho. Nunca lança: o que
   não entende devolve como veio. */
export function emProclise(texto) {
  const t = String(texto == null ? "" : texto);
  if (!t.includes("-")) return t;
  try {
    return t
      /* esconder-me-ei → me esconderei · atacá-lo-ei → atacarei o */
      .replace(RX_MESOCLISE, (m, v, p, f) => {
        const lo = /^l[oa]s?$/i.test(p);
        const verbo = (lo ? devolveALetra(v) : v) + f;
        if (lo && verbo === f) return m;
        const pron = lo ? p.slice(1) : p;
        return completa(ehAntes(pron) ? antesDoVerbo(pron, verbo) : verbo + " " + pron, m);
      })
      /* convencê-lo → convencer o · vemo-lo → vemos o */
      .replace(RX_LO, (m, v, p) => {
        const verbo = devolveALetra(v);
        return verbo ? completa(verbo + " " + p.slice(1), m) : m;
      })
      /* escondo-me → me escondo · sigo-o → sigo o · dou-lhe → lhe dou */
      .replace(RX_ENCLISE, (m, v, p) => {
        /* "escondemo-nos": o "s" do plural foi comido e não cabe de volta */
        return ehAntes(p) ? antesDoVerbo(p, v) : v + " " + p;
      });
  } catch { return t; }
}
