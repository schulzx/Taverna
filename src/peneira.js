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
       depois é medida do salto, e o salto aconteceu. */
    id: "hipotese",
    rx: new RegExp([
      "^\\s*((mestre|narrador)\\s*,?\\s*)?((e|mas|entao)\\s+)?(eu\\s+)?(posso|podia|poderia|pude|devo|devia|deveria|consigo|conseguiria|da (para|pra)|daria (para|pra)|seria possivel|sera que|e se|se|caso|quem sabe|talvez|tem como|e possivel|vale a pena|a menos que|a nao ser que)\\b",
      "\\b(se eu|caso eu|e se|sera que|quero saber se|me pergunto se|imagino se|imagino que|me imagino|sonho que|sonhei que|sonho com|penso em|pensei em|pensando em|seria possivel|daria (para|pra)|da (para|pra) eu|como seria|a menos que|a nao ser que)\\b",
      "\\b(eu|se|acho que|creio que|sei que|penso que|imagino que|talvez)\\s+(eu\\s+)?(posso|podia|poderia|pude|consigo|conseguiria|devo|devia|deveria)\\s+((mesmo|ainda|so|tambem|nao|simplesmente)\\s+)?\\w+(ar|er|ir|or|[aei]-l[oa]s?)\\b",
      "\\b(se|caso|quando|assim que|logo que)\\s+((ele|ela|eles|elas|alguem|voce|(o|a|os|as)\\s+\\w+)\\s+)?((se|me|nos|lhe)\\s+)?(\\w+(ar|er|ir|or)|for|forem|tiver|tiverem|puder|quiser|fizer|vier|der|estiver|houver|souber)\\b",
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
