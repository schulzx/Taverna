/* ============================================================
   O OUVIDO (22/11/2026) — um leitor único para a frase livre do jogador.

   A régua da dona do jogo: o Mestre «não precisa ser perfeito, porque não
   existe nenhum mestre perfeito, mas ele precisa reconhecer o que acontece».
   Até aqui a frase era lida por listas de palavras espalhadas (o veredito da
   troca, a bolsa da frase, os desafios, a mão da frase), e cada sessão jogada
   trazia o verbo que nenhuma lista previu: «empresto minha gazua a Rhogar»,
   «jogo uma moeda ao mendigo». A frase passava sem veredito e o Narrador
   preenchia o vazio. Consertar caso a caso não convergia.

   A ordem do leitor (a lição do classificador recusado em 10/11: o erro
   grande era de CONTEXTO — quem está em cena, a fala entre aspas —, e um
   classificador de texto puro não o vê):

     1. LIGAR A FRASE À CENA. A cena diz quem está, quem foi embora, quem
        morreu, o que o herói carrega, o que cada um vende, o que está solto
        e quanto há na bolsa. A frase é marcada com essas entidades (o nome
        inteiro, o primeiro nome, o ofício, o pronome que retoma o único
        candidato, a quantia em algarismo ou por extenso, «uma moeda») e sai
        com marcas no lugar dos nomes: <PESSOA>, <COISA_MINHA>, <COISA_DELE>,
        <COISA_SOLTA>, <MOEDA>, <N>. O nome é resolvido por `quemONomeDiz`
        (quem-esta-aqui.js): o nome inteiro decide, quem está ganha de quem
        não está, dois que estão com o mesmo nome → pergunta.
     2. DECIDIR FAMÍLIA E SUBTIPO SOBRE A FRASE MARCADA, por estrutura: a
        oração principal (a negada, a condicional, a fala entre aspas e o
        vocativo saem do caminho), o verbo dela (tabela VERBOS), e a direção
        das preposições — «a/para/pro X» entrega, «de/do X» tira, «por/pelo X»
        é o que vem em troca, «pra + infinitivo» com moeda é suborno.
     3. O VERBO QUE NINGUÉM PREVIU não vira silêncio: coisa conhecida +
        pessoa + direção de entrega é entrega; o resto que tem coisa e pessoa
        sai com confiança baixa, e a regra do improviso pergunta. Menção não
        é presença: «pergunto à Dorva pela espada» é falar.

   Tudo o que é palavra está em O_OUVIDO; tudo o que é número também.
   Módulo puro, determinístico, sem React. → oOuvido(frase, cena)
   ============================================================ */
import { quemONomeDiz } from "./quem-esta-aqui.js";

/* ---------------- a tabela ---------------- */
export const O_OUVIDO = Object.freeze({
  familias: Object.freeze(["falar", "convencer", "olhar", "mover", "trocar", "usar", "agir", "lutar", "esperar", "perguntar_ao_mestre"]),
  subtipos: Object.freeze(["comprar", "vender", "pagar", "dar", "pedir", "pegar", "furtar", "emprestar", "devolver", "subornar", "escambo", "cobrar"]),
  /* a confiança de cada caminho da leitura (0–1) */
  confianca: Object.freeze({ verbo: 0.9, contexto: 0.85, estrutura: 0.6, semVerbo: 0.35, falaOuPergunta: 0.8 }),
  /* a grafia de chat que vira a palavra (forma sem acento) */
  grafias: Object.freeze({
    oq: "o que", vc: "voce", vcs: "voces", qnto: "quanto", qto: "quanto", qnt: "quanto", q: "que", ta: "esta", to: "estou",
    tb: "tambem", tbm: "tambem", pq: "porque", cmg: "comigo", ngm: "ninguem", mt: "muito", blz: "beleza", flexa: "flecha", flexas: "flechas",
    ate: "ate", eh: "e", tô: "estou", pro: "pro", pra: "pra", pras: "pra", pros: "pro", p: "pra", dps: "depois", agr: "agora", n: "nao",
  }),
  /* palavras que nunca são o começo da ação na oração */
  enchimento: Object.freeze(["eu", "entao", "ai", "agora", "logo", "ja", "so", "rapidamente", "calmamente", "devagar", "depois", "primeiro", "tambem", "e", "bem", "ok", "certo", "beleza"]),
  saudacoes: Object.freeze(["oi", "ola", "ei", "opa", "salve", "bom dia", "boa tarde", "boa noite", "e ai", "fala", "eae", "eai", "hey"]),
  negacoes: Object.freeze(["nao", "nunca", "jamais", "nem"]),
  condicionais: Object.freeze(["se", "caso"]),
  /* o que torna a condicional uma pergunta ao Mestre (o resultado, não o pedido) */
  consequenciaAoMestre: Object.freeze(["dava certo", "daria certo", "da certo", "funciona", "funcionaria", "funcionava", "vale a pena", "valeria", "consigo", "conseguiria", "rola", "colaria", "cola", "da tempo", "daria tempo", "e seguro", "tem perigo", "eu morro", "eu caio", "alguem ve", "alguem percebe", "me veem", "percebem"]),
  segundaPessoa: Object.freeze(["voce", "voces", "senhor", "senhora", "tu", "te", "contigo"]),
  /* a pergunta de preço: falar, nunca troca */
  precoPergunta: Object.freeze(["quanto", "preco", "precos", "custa", "custam", "valor"]),
  precoVerbo: Object.freeze(["e", "custa", "custam", "cobra", "cobram", "fica", "sai", "esta", "vale", "da", "seria", "sao"]),
  /* a pergunta sobre o mundo (sem ninguém a quem se dirija) */
  interrogativos: Object.freeze(["quanto", "qual", "quais", "quem", "onde", "como", "cade", "o que", "que", "quando", "por que", "porque", "tem", "ha", "existe", "estou", "estamos"]),
  /* palavras modais: o verbo de verdade vem depois, no infinitivo */
  modais: Object.freeze(["tento", "tentamos", "quero", "queremos", "vou", "vamos", "resolvo", "decido", "preciso", "posso", "consigo", "prefiro", "aproveito", "comeco", "procuro", "busco", "ensaio", "arrisco"]),
  clitico: Object.freeze(["me", "te", "lhe", "se", "nos"]),
  artigos: Object.freeze(["o", "a", "os", "as", "um", "uma", "uns", "umas", "meu", "minha", "meus", "minhas", "seu", "sua", "seus", "suas", "esse", "essa", "este", "esta", "aquele", "aquela"]),
  /* as palavras que se ligam a quem: o que vem antes do ofício dito («o bardo», «pro mendigo») */
  antesDoOficio: Object.freeze(["o", "a", "ao", "aos", "pro", "pra", "do", "da", "no", "na", "pelo", "pela", "com", "para", "ate", "contra", "num", "numa", "seu", "sua"]),
  /* a preposição que entrega (para quem vai) e a que tira (de quem vem) */
  entrega: Object.freeze(["a", "ao", "aos", "as", "pro", "pra", "para", "pros", "pras"]),
  tira: Object.freeze(["de", "do", "da", "dos", "das"]),
  emTroca: Object.freeze(["por", "pelo", "pela", "pelos", "pelas"]),
  /* os pronomes que retomam alguém */
  pronomes: Object.freeze({ ele: "m", dele: "m", nele: "m", ela: "f", dela: "f", nela: "f", lhe: "?" }),
  /* o que se diz quando é dinheiro (a coisa vira «moeda») */
  moedas: Object.freeze(["moeda", "moedas", "prata", "pratas", "ouro", "ouros", "tostao", "tostoes", "grana", "graninha", "dinheiro", "trocado", "trocados", "esmola", "esmolas", "cobre", "cobres", "pecas", "dobrao", "dobroes", "troco", "pila", "pilas", "conto", "contos", "gorjeta", "gorjetas", "propina", "propinas", "tostoes"]),
  /* «uma moeda» conta 1; «uma cerveja» não */
  moedaDeUm: Object.freeze(["moeda", "prata", "peca", "dobrao", "pila"]),
  numeros: Object.freeze({
    um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12,
    treze: 13, quatorze: 14, catorze: 14, quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18, dezenove: 19, vinte: 20, trinta: 30,
    quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90, cem: 100, cento: 100, duzentos: 200, duzentas: 200, trezentos: 300, quinhentos: 500, mil: 1000,
  }),
  /* o jeito de dizer que vale mais que o verbo: o começo da oração (sem acento) → [família, subtipo].
     A ordem importa: a primeira que casa vence («jogo conversa fora» antes de «jogo conversa»). */
  jeitosDeDizer: Object.freeze([
    /* a bancada da troca (B121, L16, X06, B122): pedir desculpas é falar, e «deixa pra lá» desiste — nenhum dos dois é troca */
    ["peco desculpa", "falar"], ["peco desculpas", "falar"], ["peco perdao", "falar"], ["peco licenca", "falar"], ["deixa pra la", "falar"], ["deixa para la", "falar"], ["deixo pra la", "falar"], ["deixe pra la", "falar"], ["esquece", "falar"], ["esqueca", "falar"],
    ["jogo conversa fora", "falar"], ["troco ideia", "falar"], ["troco uma ideia", "falar"], ["levo um papo", "falar"], ["puxo assunto", "falar"], ["puxo conversa", "falar"], ["dou um toque", "falar"], ["dou um alo", "falar"], ["mando a real", "falar"], ["bato um papo", "falar"], ["bato papo", "falar"],
    ["levo no papo", "convencer"], ["levo <p> no papo", "convencer"], ["levo <p> na conversa", "convencer"], ["levo <p> na labia", "convencer"], ["passo a perna em <p>", "convencer"], ["passo a perna no <p>", "convencer"], ["passo a perna na <p>", "convencer"], ["levo na conversa", "convencer"], ["levo na lábia", "convencer"], ["levo na labia", "convencer"], ["jogo um charme", "convencer"], ["jogo charme", "convencer"], ["jogo conversa", "convencer"], ["jogo um xaveco", "convencer"], ["dou uma cantada", "convencer"], ["passo a perna", "convencer"], ["passo uma conversa", "convencer"], ["dou um migue", "convencer"], ["dou uma enrolada", "convencer"], ["faco a cabeca", "convencer"], ["dou uma carteirada", "convencer"], ["falo grosso", "convencer"], ["dou uma prensa", "convencer"], ["dou uma dura", "convencer"], ["boto medo", "convencer"], ["boto pressao", "convencer"], ["ponho medo", "convencer"], ["ponho pressao", "convencer"], ["uso minha labia", "convencer"], ["uso meu charme", "convencer"], ["uso minha lábia", "convencer"], ["uso a labia", "convencer"], ["uso meu carisma", "convencer"], ["peco com jeitinho", "convencer"], ["puxo o saco", "convencer"], ["dou uma de", "convencer"], ["faco ameaca", "convencer"],
    ["saio no braco", "lutar"], ["saio na porrada", "lutar"], ["sento a mao", "lutar"], ["meto a porrada", "lutar"], ["meto a mao na cara", "lutar"], ["desco a porrada", "lutar"], ["desco o braco", "lutar"], ["desco a mao", "lutar"], ["desco o cacete", "lutar"], ["desco a lenha", "lutar"], ["quebro a cara", "lutar"], ["parto pra briga", "lutar"], ["parto pro pau", "lutar"], ["parto pra porrada", "lutar"], ["caio na porrada", "lutar"], ["caio de pau", "lutar"], ["caio em cima", "lutar"], ["dou uma voadora", "lutar"], ["dou uma rasteira", "lutar"], ["dou uma cabecada", "lutar"], ["dou uma surra", "lutar"], ["dou uma sova", "lutar"], ["dou porrada", "lutar"], ["vou pra cima", "lutar"], ["vou pro pau", "lutar"], ["pulo em cima", "lutar"], ["pulo no pescoco", "lutar"], ["avanco pra cima", "lutar"],
    ["dou no pe", "mover"], ["meto o pe", "mover"], ["pico a mula", "mover"], ["dou o fora", "mover"], ["caio fora", "mover"], ["me mando", "mover"], ["dou um perdido", "mover"], ["dou um role", "mover"], ["rapo fora", "mover"], ["me pico", "mover"], ["zarpo", "mover"], ["dou meia volta", "mover"], ["dou a volta", "mover"], ["sebo nas canelas", "mover"], ["me arranco", "mover"],
    ["dou uma sacada", "olhar"], ["fico de butuca", "olhar"], ["fico de olho", "olhar"], ["fico de vigia", "olhar"], ["fico de tocaia", "olhar"], ["fico de guarda", "olhar"], ["monto guarda", "olhar"], ["corro o olho", "olhar"], ["passo o olho", "olhar"], ["boto reparo", "olhar"], ["dou um confere", "olhar"], ["dou uma bisolhada", "olhar"], ["saco o movimento", "olhar"], ["manjo", "olhar"], ["presto atencao", "olhar"], ["fico atento", "olhar"],
    ["tiro um cochilo", "esperar"], ["tiro uma soneca", "esperar"], ["tiro um tempo", "esperar"], ["capoto", "esperar"], ["dou um tempo", "esperar"], ["fico de boa", "esperar"], ["fico na minha", "esperar"], ["fico quieto", "esperar"], ["fico parado", "esperar"], ["fico esperando", "esperar"], ["passo a noite", "esperar"], ["deixo o tempo passar", "esperar"], ["faco hora", "esperar"], ["recupero o folego", "esperar"], ["me recupero", "esperar"], ["recupero as forcas", "esperar"],
    ["bato a carteira", "trocar", "furtar"], ["meto a mao na bolsa", "trocar", "furtar"], ["meto a mao no bolso", "trocar", "furtar"], ["passo a mao", "trocar", "furtar"], ["molho a mao", "trocar", "subornar"], ["compro o silencio", "trocar", "subornar"], ["racho a conta", "trocar", "pagar"], ["acerto a conta", "trocar", "pagar"], ["acerto as contas", "trocar", "pagar"], ["fecho a conta", "trocar", "pagar"], ["quito a divida", "trocar", "pagar"],
  ]),
  /* o imperativo do pedido ao balcão («manda um ensopado aí»): compra do que se vende */
  pedidoAoBalcao: Object.freeze(["manda", "traz", "traga", "desce", "bota", "solta", "serve", "sirva", "sirvam", "mande"]),
  /* O PEDIDO DIRIGIDO (23/11, a décima sexta sessão: «Mordecai, empresta a vassoura?», «Thaddeus,
     me devolve o livro», «entregue ele a mim»). O herói narra na primeira pessoa («empresto»,
     «devolvo», «dou»); o verbo de troca que não está nela (o imperativo ou a segunda pessoa:
     «empresta», «devolve», «entregue», «dá») e se dirige a alguém (o vocativo, o «me», o «a mim»)
     é o herói pedindo DELA. O subtipo do pedido, pelo lema do verbo dito: */
  pedidoDirigido: Object.freeze({ emprestar: "emprestar", devolver: "pedir", dar: "pedir", vender: "comprar", pegar: "pedir" }),
  /* a primeira pessoa do verbo (o herói fala de si): «-o», «-ei», «-i», «-ou», e os curtos */
  primeiraPessoa: /(o|ei|i|ou)$/,
  aMim: /\b(a mim|pra mim|para mim|pro mim)\b/,
  /* o discurso que abre a fala e não é a ação («ouça», «escuta», «olha») */
  marcaDeDiscurso: Object.freeze(["ouca", "oucam", "escuta", "escute", "olha", "olhe", "veja", "vem ca", "presta atencao", "repara"]),
  /* tirar da mão de alguém é tomar (força contra quem segura: o dado) */
  daMao: /\b(da|das) maos?\b/,
  /* «fico devendo», «pendura», «fiado»: pagar depois é o fiado (o dado decide se fiam) */
  /* a bancada da troca (L03): «na minha conta» também é o fiado */
  fiado: /\b(fico devendo|ficar devendo|fica devendo|pendura|penduro|fiado|fiada|na conta|na minha conta|bota na conta|poe na conta|a credito|pago (amanha|depois|mais tarde|na volta))\b/,
  /* «fico com o troco»: receber moeda de quem devia o troco */
  troco: /\b(fico|ficar|guardo) com o troco\b/,
  /* guardar na bolsa o que não é meu é pegá-lo */
  naBolsa: /\b(na|dentro da|no|dentro do) (bolsa|mochila|alforje|bolso|sacola|saco|embornal)\b/,
  /* o Mestre chamado pelo nome: «mestre, …» é pergunta ao Mestre */
  oMestre: Object.freeze(["mestre", "narrador", "dm", "mestra", "gm"]),
  /* a pergunta em primeira pessoa é ao Mestre (o que eu tenho, o que eu sei, se eu consigo) */
  perguntaDeMim: /\b(eu tenho|tenho|temos|eu sei|sei|lembro|me lembro|consigo|posso|podemos|da pra|tem como|e possivel|estou|estamos|vejo|percebo|noto|reconheco|ouco|me resta|resta|sobrou|sobra|meu|minha|meus|minhas)\b/,
  /* a frase que começa por palavra de pergunta é pergunta, com ou sem «?» */
  comecoDePergunta: /^(o que|oq|qual|quais|quanto|quantos|quantas|quem|onde|cade|por que|porque|quando|como (e|esta|estao|faco|chego|sao|anda|vai|fica))\b/,
  /* o recipiente que embrulha a coisa: «um prato de ensopado» é ensopado */
  recipientes: Object.freeze(["prato", "pratos", "copo", "copos", "caneca", "canecas", "pedaco", "pedacos", "pouco", "garrafa", "garrafas", "saco", "sacos", "punhado", "tigela", "tigelas", "jarra", "frasco", "frascos", "fatia", "fatias", "porcao", "maco", "feixe", "rolo", "rodada", "dose", "gole", "bocado"]),
  /* o olhar de gíria: «dou uma geral», «dou uma conferida» */
  olharDeGiria: Object.freeze(["lida", "olhada", "espiada", "conferida", "checada", "vasculhada", "sondada", "bisbilhotada", "examinada", "investigada", "geral", "vistoria", "varrida", "sacada", "manjada", "boa olhada"]),
  /* o que tem forma de nome e não é coisa que muda de mão */
  naoECoisa: Object.freeze(["conta", "divida", "preco", "silencio", "nome", "jeito", "papo", "pulo", "salto", "lida", "olhada", "espiada", "conferida", "coisa", "outra", "isso", "isto", "aquilo", "mao", "bico", "informacao", "novidade", "novidades", "volta", "tempo", "favor", "lealdade", "vista", "absurdo", "que", "tudo", "nada", "algo", "noite", "dia", "lugar", "vez", "pouco", "mais", "menos", "desconto", "chance", "sorte", "ideia", "caminho", "estrada", "trilha", "gente", "homem", "mulher", "cara", "moco", "moca", "senhor", "senhora", "porrada", "soco", "chute", "tapa", "murro", "golpe", "charme", "conversa", "ajuda", "resto", "frente", "lado", "cima", "baixo", "canto", "chao", "hora", "minuto", "missa", "manha", "tarde", "amanha", "hoje", "bolso", "cinto", "costas", "olho", "olhos", "ombro", "mim", "ti", "si", "bem",
    /* a bancada da troca (B11, B121): o pedido de desculpa e o demonstrativo não mudam de mão — «uma dessas cordas» é a corda */
    "desculpa", "desculpas", "perdao", "licenca", "dessa", "desse", "dessas", "desses", "desta", "deste", "destas", "destes", "daquela", "daquele", "daquelas", "daqueles", "disso", "disto", "daquilo", "nessa", "nesse"]),
  /* o demonstrativo com «de» que está no lugar do «de» depois do recipiente («um pedaço dessa corda») */
  deDemonstrativo: Object.freeze(["dessa", "desse", "dessas", "desses", "desta", "deste", "destas", "destes", "daquela", "daquele", "daquelas", "daqueles"]),
  /* o recipiente que diz uma PARTE da coisa, e não a porção que se serve: «um pedaço dessa corda» se pede, não se compra */
  parteDe: Object.freeze(["pedaco", "pedacos", "bocado", "pouco", "punhado", "naco", "lasca"]),
  /* o fim de palavra que é verbo (o resto da palavra depois do radical) */
  terminacoes: Object.freeze(["io", "o", "a", "as", "e", "es", "ar", "er", "ir", "amos", "emos", "imos", "am", "em", "ei", "i", "ou", "eu", "iu", "ando", "endo", "indo", "ava", "ia", "aria", "eria", "iria", "asse", "esse", "isse"]),
  infinitivo: /(?:ar|er|ir|or)$/,
  /* o fim de palavra que não é infinitivo apesar de parecer */
  naoInfinitivo: Object.freeze(["lugar", "bar", "mar", "jantar", "colher", "mulher", "par", "altar", "lar", "ar", "por", "favor", "senhor", "valor", "melhor", "pior", "maior", "menor", "flor", "dor", "amor", "calor", "cor", "interior", "exterior", "anterior", "redor"]),
});

/* ---------------- os verbos (a forma-base sem acento → família e subtipo) ----------------
   Cada verbo regular é escrito pelo radical e a classe (ar/er/ir); as formas
   irregulares e curtas vão em `formas`. O que depende da frase («passo a mão»,
   «dou um papo», «jogo uma moeda») é decidido pelas regras de contexto. */
const V = (fam, sub, raizes, formas) => Object.freeze({ fam, sub: sub || null, raizes: Object.freeze(raizes || []), formas: Object.freeze(formas || []) });
export const VERBOS_DO_OUVIDO = Object.freeze({
  comprar: V("trocar", "comprar", ["compr", "adquir", "arremat", "encomend", "reserv", "alug", "pechinch", "regate"]),
  vender: V("trocar", "vender", ["vend", "revend"]),
  pagar: V("trocar", "pagar", ["pag", "quit", "sald"], ["pague", "paguei"]),
  rachar: V("trocar", "pagar", ["rach", "divid"]),
  dar: V("trocar", "dar", ["entreg", "deposit", "doa", "presente", "ofert", "estend", "repass"], ["dou", "dar", "damos", "dei", "doo", "dando", "deslizo", "deslizar", "ofereco", "oferecer", "oferece", "oferecemos", "ofereci", "entregue", "entreguem"]),
  pedir: V("trocar", "pedir", ["implor", "suplic", "solicit", "mendig", "rog"], ["peco", "pedir", "pede", "pedimos", "pedi", "pecam", "peca"]),
  pegar: V("trocar", "pegar", ["peg", "recolh", "apanh", "cat", "junt", "saque", "colet", "agarr", "embols", "arrecad", "colh"], ["pego", "pegar", "pegamos", "peguei"]),
  furtar: V("trocar", "furtar", ["furt", "roub", "surrupi", "rapin", "afan", "larapi", "subtrai", "gatun", "garf", "pung"], ["abafo", "bifo", "subtraio"]),
  emprestar: V("trocar", "emprestar", ["emprest"]),
  devolver: V("trocar", "devolver", ["devolv", "restitu"]),
  subornar: V("trocar", "subornar", ["suborn"], ["peito", "molho"]),
  trocar: V("trocar", "escambo", ["troc", "permut", "barganh", "camb"]),
  cobrar: V("trocar", "cobrar", ["cobr"], ["exijo", "exigir"]),
  usar: V("usar", null, ["us", "utiliz", "ench", "enrol", "segur", "ativ", "inger", "devor", "lustr", "poli", "unt", "engol", "prend", "acend", "beb", "equip", "empunh", "amarr", "pendur", "aplic", "guard", "calc", "consum", "mastig", "enfaix", "acion", "apag", "afi"], ["como", "comer", "comemos", "visto", "vestir", "veste", "saco", "sacar", "calco", "calcar", "tomo", "tomar", "ponho", "poe", "boto", "botar", "coloco", "colocar"]),
  olhar: V("olhar", null, ["olh", "observ", "examin", "investig", "vasculh", "revist", "procur", "busc", "escut", "espi", "repar", "inspecion", "analis", "folhe", "contempl", "farej", "vigi", "espreit", "chec", "confer", "estud", "sond", "rastre", "averigu", "fuc", "fuxic", "explor", "estud", "apalp", "cheir", "tate", "admir", "mir", "fit", "perscrut", "esquadrinh", "bisbilhot"], ["leio", "ler", "le", "lemos", "ouco", "ouvir", "ouve", "vejo", "ver", "vemos", "ve"]),
  mover: V("mover", null, ["camin", "entr", "and", "volt", "corr", "viaj", "atravess", "vaz", "avanc", "aproxim", "afast", "retorn", "rum", "cavalg", "naveg", "adentr", "recu", "march", "percorr", "desc", "sub", "atalh", "passe", "galop", "trot", "escap", "retir"], ["caminho", "caminhar", "caminhamos", "vou", "ir", "vamos", "fui", "sigo", "seguir", "segue", "seguimos", "saio", "sair", "sai", "saimos", "fujo", "fugir", "foge", "subo", "subir", "desco", "descer", "chego", "chegar", "parto", "partir", "dirijo", "mando", "sumo", "sumir"]),
  agir: V("agir", null, ["arranc", "arrebat", "acert", "escal", "esgueir", "escond", "arromb", "pul", "salt", "empurr", "abr", "fech", "quebr", "escav", "cav", "nad", "rastej", "trep", "forc", "destrav", "pux", "levant", "arrast", "mont", "consert", "equilibr", "gir", "tranc", "acocor", "agach", "abaix", "escor", "esfreg", "limp", "arrum", "constru", "cozinh", "pesc", "cac", "rabisc", "desenh", "escrev", "arremess", "desarm", "empilh", "rasg", "solt", "acord", "toc", "bat"], ["faco", "fazer", "faz", "abro", "abrir", "corto", "cortar", "monto", "trago", "trazer", "jogo", "jogar", "lanco", "lancar", "atiro", "atirar", "levo", "levar", "tiro", "tirar", "passo", "passar", "deixo", "deixar"]),
  lutar: V("lutar", null, ["atac", "soc", "dispar", "golpe", "chut", "esfaque", "lut", "apunhal", "flech", "mat", "invest", "espanc", "estrangul", "agred", "estoc", "desfer", "enfrent", "esmurr", "estap", "degol", "derrub", "arrebent", "mord", "trucid", "decapit", "apedrej", "espet", "perfur", "fustig", "chicote", "pisote", "aleij", "trespass", "estraçalh", "esgan", "sufoc"], ["firo", "ferir", "fere"]),
  esperar: V("esperar", null, ["medit", "descans", "esper", "aguard", "acamp", "pernoit", "rez", "cochil", "repous", "relax"], ["durmo", "dormir", "dorme", "dormimos", "oro", "orar", "deito", "armo", "fico", "ficar", "ficamos", "sento", "sentar", "sentamos", "sentado"]),
  convencer: V("convencer", null, ["convenc", "persuad", "intimid", "amea", "adul", "bajul", "engan", "blef", "seduz", "chantage", "pression", "lisonje", "ilud", "provoc", "negoci", "argument", "insist", "desenrol", "encar", "tranquiliz", "acalm", "ludibri", "encant", "lison", "xavec", "flert", "tape", "promet", "jur", "coag", "subjug", "aterroriz", "assust", "humilh", "embroma"], ["minto", "mentir", "mente", "convenco", "finjo", "fingir", "finge", "ameaco", "ameacar", "ameaca", "ameacamos"]),
  falar: V("falar", null, ["fal", "convers", "pergunt", "cont", "cumpriment", "cham", "grit", "explic", "avis", "agradec", "respond", "coment", "sussurr", "saud", "cochich", "question", "indag", "elogi", "brind", "desabaf", "confess", "apresent", "anunci", "cant", "conte", "narr", "relat"], ["digo", "dizer", "diz", "dizemos", "disse", "conto", "contar"]),
});

/* ---------------- utilidades ---------------- */
const str = (x) => (x == null ? "" : String(x));
const arr = (x) => (Array.isArray(x) ? x : []);
const sem = (s) => str(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const PART = ["de", "do", "da", "dos", "das", "o", "a"];
const TITULOS = ["barao", "baronesa", "irma", "irmao", "frei", "dona", "dom", "velho", "velha", "lorde", "lady", "capitao", "capita", "padre", "abade", "abadessa", "prior", "madame", "mestre", "mestra", "senhor", "senhora", "seu", "sir", "sor", "conde", "condessa", "duque", "duquesa", "rei", "rainha", "principe", "princesa", "tio", "tia", "vovo", "doutor", "doutora", "sargento", "tenente", "cabo"];
const palavrasDoNome = (nome) => sem(nome).replace(/[^a-z0-9-]+/g, " ").trim().split(" ").filter((w) => w && !PART.includes(w));
/* a raiz de um ofício ou nome comum: «capitão»/«capitã» → «capit», «mendigo»/«mendiga» → «mendig» */
const raiz = (w) => sem(w).replace(/(oes|aes|aos|ao|ns|as|os|es|a|o|e|s)$/, "");
/* o singular de um nome comum (com os acentos de quem escreveu) */
const singular = (w) => {
  const s = str(w);
  if (/ões$|ães$/i.test(s)) return s.replace(/ões$|ães$/i, "ão");
  if (/oes$/i.test(s)) return s.replace(/oes$/i, "ao");
  if (/aes$/i.test(s)) return s.replace(/aes$/i, "ao");
  if (/ns$/i.test(s)) return s.replace(/ns$/i, "m");
  if (/(r|z)es$/i.test(s)) return s.slice(0, -2);
  /* a vogal com acento também («maçãs» → «maçã», a sessão 16) */
  if (/[aeiouáéíóúâêôãõ]s$/i.test(s) && s.length > 3) return s.slice(0, -1);
  return s;
};
const dist1 = (a, b) => {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, d = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++d > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
  }
  return d + (a.length - i) + (b.length - j) <= 1;
};
const FUNCAO = new Set(["quanto", "quando", "porque", "depois", "contra", "dentro", "embora", "sobre", "minhas", "nenhum", "nenhuma", "alguem", "alguma", "algum", "tambem", "aquele", "aquela", "aquilo", "estou", "esta", "estamos"]);
/* duas palavras são a mesma coisa: igual, plural, ou um erro de digitação em palavra longa */
const mesmaPalavra = (t, w) => {
  if (!t || !w) return false;
  if (t === w || t === w + "s" || t + "s" === w || t === w + "es" || w === t + "es") return true;
  if (sem(singular(t)) === sem(singular(w))) return true;
  if (FUNCAO.has(t) || FUNCAO.has(w)) return false;
  return t.length >= 5 && w.length >= 5 && t[0] === w[0] && dist1(t, w);
};

/* ---------------- 1. as palavras da frase ---------------- */
function palavrasDaFrase(frase) {
  const f = str(frase);
  const toks = [];
  const rx = /[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*|[,.;:!?"“”«»—–]|(?<=^|\s)-(?=\s)/gu;
  for (const m of f.matchAll(rx)) {
    const o = m[0];
    let s = sem(o);
    if (/^[“”«»]$/.test(o)) s = '"';
    if (o === "–" || o === "-") s = "—";
    if (Object.prototype.hasOwnProperty.call(O_OUVIDO.grafias, s) && !/\s/.test(O_OUVIDO.grafias[s])) s = O_OUVIDO.grafias[s];
    if (Object.prototype.hasOwnProperty.call(O_OUVIDO.grafias, s) && /\s/.test(O_OUVIDO.grafias[s])) {
      for (const p of O_OUVIDO.grafias[s].split(" ")) toks.push({ o: p, s: p, idx: m.index });
      continue;
    }
    toks.push({ o, s, idx: m.index });
  }
  return toks;
}

/* ---------------- 2. a cena, arrumada para ler ---------------- */
function arrumarCena(cena) {
  const c = cena && typeof cena === "object" ? cena : {};
  const h = c.heroi && typeof c.heroi === "object" ? c.heroi : {};
  const pessoas = arr(c.pessoas).filter((p) => p && str(p.nome).trim()).map((p) => ({ nome: str(p.nome), oficio: str(p.oficio), vende: arr(p.vende).filter((v) => v && str(v.item).trim()).map((v) => ({ item: str(v.item), preco: Number(v.preco) || 0 })) }));
  const companheiro = str(h.companheiro).trim() || null;
  const ausentes = arr(c.ausentes).map(str).filter(Boolean);
  const mortos = arr(c.mortos).map(str).filter(Boolean);
  const carrega = arr(h.carrega).map(str).filter(Boolean);
  const coisas = arr(c.coisas).map(str).filter(Boolean);
  const moeda = Number.isFinite(Number(h.moeda)) ? Math.max(0, Number(h.moeda)) : 0;
  /* o catálogo das coisas: a minha (o herói carrega), a dele (alguém vende), a solta (a cena) */
  const catalogo = [];
  for (const n of carrega) catalogo.push({ nome: n, w: palavrasDoNome2(n), tipo: "minha", dono: null, preco: null });
  for (const p of pessoas) for (const v of p.vende) catalogo.push({ nome: v.item, w: palavrasDoNome2(v.item), tipo: "dele", dono: p.nome, preco: v.preco });
  for (const n of coisas) catalogo.push({ nome: n, w: palavrasDoNome2(n), tipo: "solta", dono: null, preco: null });
  /* 23/11 (a décima sexta sessão): A BANCA VENDE E NÃO É GENTE. «A Âncora do Sul» e o «Balcão»
     entravam como pessoas — nas opções de «a quem», e um «dela» virava a loja. A cena do jogo traz
     as bancas à parte (`cena.bancas`): o estoque entra no catálogo como coisa DELE (o dono é a
     banca), e a banca nunca é marcada como pessoa. A cena de exame não traz bancas: nada muda nela. */
  const bancas = arr(c.bancas).filter((b) => b && str(b.nome).trim()).map((b) => ({ nome: str(b.nome), vende: arr(b.vende).filter((v) => v && str(v.item).trim()).map((v) => ({ item: str(v.item), preco: Number(v.preco) || 0 })) }));
  for (const b of bancas) for (const v of b.vende) catalogo.push({ nome: v.item, w: palavrasDoNome2(v.item), tipo: "dele", dono: b.nome, preco: v.preco, banca: true });
  /* O FOCO (23/11): a quem a frase anterior foi dita, ou quem falou por último — o «ele/ela» de uma
     mesa. A cena do jogo sempre traz o campo (`foco`, nome ou null); a de exame não o traz, e lá o
     pronome segue a regra de antes (o primeiro do gênero). Com o campo e sem foco, dois candidatos
     não se adivinham: pergunta-se. */
  const temFoco = Object.prototype.hasOwnProperty.call(c, "foco");
  const foco = temFoco ? str(c.foco).trim() || null : null;
  const doCompanheiro = arr(h.companheiroCarrega).map(str).filter(Boolean);
  return { pessoas, companheiro, ausentes, mortos, carrega, coisas, moeda, catalogo, tipo: str(c.tipo), lugar: str(c.lugar), bancas, temFoco, foco, doCompanheiro };
}
const palavrasDoNome2 = (n) => sem(n).replace(/[^a-z0-9-]+/g, " ").trim().split(" ").filter(Boolean);

/* ---------------- 3. ligar a frase à cena (as marcas) ---------------- */
const ehNumero = (s) => /^\d+$/.test(s) || Object.prototype.hasOwnProperty.call(O_OUVIDO.numeros, s);
const valorDe = (s) => (/^\d+$/.test(s) ? Number(s) : O_OUVIDO.numeros[s] || 0);

/* a pessoa dita a partir da palavra i: { j (fim exclusivo), estado, nome, opcoes, morto } | null */
function pessoaEm(toks, i, cn) {
  const t = toks[i].s;
  if (t.length < 3 && !Object.prototype.hasOwnProperty.call(O_OUVIDO.pronomes, t)) return null;
  const todos = [
    ...cn.pessoas.map((p) => ({ nome: p.nome, onde: "aqui" })),
    ...(cn.companheiro ? [{ nome: cn.companheiro, onde: "aqui", companheiro: true }] : []),
    ...cn.ausentes.map((n) => ({ nome: n, onde: "longe" })),
    ...cn.mortos.map((n) => ({ nome: n, onde: "morto" })),
  ];
  /* o nome: a palavra é o primeiro nome (ou o nome depois do título) de alguém */
  let melhor = null;
  for (const x of todos) {
    const W = palavrasDoNome(x.nome);
    if (!W.length) continue;
    const k = W[0] === t ? 0 : (TITULOS.includes(W[0]) && W[1] === t ? 1 : -1);
    if (k < 0) continue;
    let j = i + 1;
    while (j < toks.length && (W.includes(toks[j].s) || (PART.includes(toks[j].s) && j + 1 < toks.length && W.includes(toks[j + 1].s)))) j++;
    if (!melhor || j > melhor.j) melhor = { j, k, W };
  }
  if (melhor) {
    const ditas = toks.slice(i, melhor.j).map((x) => x.s).filter((w) => !PART.includes(w));
    const dito = (melhor.k === 1 ? [melhor.W[0], ...ditas] : ditas).join(" ");
    const r = quemONomeDiz(dito, {
      aqui: todos.filter((x) => x.onde === "aqui").map((x) => x.nome),
      longe: todos.filter((x) => x.onde !== "aqui").map((x) => ({ nome: x.nome, morto: x.onde === "morto" })),
    });
    /* quem está ganha também pelo ofício («o capitão» do navio e não o Capitão Sorrel ausente) */
    if (r.estado === "longe" && i > 0) {
      const of = oficioEm(toks, i, cn);
      if (of) return of;
    }
    if (r.estado === "aqui") return { j: melhor.j, estado: "aqui", nome: r.nome, opcoes: [] };
    if (r.estado === "qual") return { j: melhor.j, estado: "qual", nome: null, opcoes: [...r.opcoes] };
    if (r.estado === "longe" && !r.opcoes.length) return { j: melhor.j, estado: r.morto ? "morto" : "longe", nome: r.nome, opcoes: [] };
  }
  const of = oficioEm(toks, i, cn);
  if (of) return of;
  return null;
}
function oficioEm(toks, i, cn) {
  const t = toks[i].s;
  const antes = i > 0 ? toks[i - 1].s : "";
  const sozinho = (i === 0 || /^[,"—]$/.test(antes)) && (i + 1 >= toks.length || /^[,?!.]$/.test(toks[i + 1].s));
  if (!O_OUVIDO.antesDoOficio.includes(antes) && !sozinho) return null;
  const r = raiz(t);
  if (r.length < 3) return null;
  const achados = cn.pessoas.filter((p) => { const w = palavrasDoNome2(p.oficio); return w.length && raiz(w[0]) === r; });
  if (achados.length === 1) return { j: i + 1, estado: "aqui", nome: achados[0].nome, opcoes: [] };
  if (achados.length > 1) return { j: i + 1, estado: "qual", nome: null, opcoes: achados.map((p) => p.nome) };
  return null;
}

/* a coisa dita a partir da palavra i: [{ j, nome, tipo, dono, preco, inteira }] (todas as leituras) */
function coisasEm(toks, i, cn) {
  const out = [];
  for (const e of cn.catalogo) {
    if (!e.w.length) continue;
    /* inteira: todas as palavras do nome, na ordem */
    let ok = true, j = i;
    for (let k = 0; k < e.w.length; k++) {
      if (j >= toks.length || !mesmaPalavra(toks[j].s, e.w[k])) { ok = false; break; }
      j++;
    }
    if (ok) { out.push({ j, nome: e.nome, tipo: e.tipo, dono: e.dono, preco: e.preco, inteira: true, n: e.w.length }); continue; }
    /* pela cabeça: «o anel» é o «anel de cobre» que carrego. 23/11 (a décima sexta sessão, frase 24):
       «ninguém aqui sai ferido» virou «Sais Aromáticos» do estoque de uma banca — a cabeça curta só
       vale igual («sai» não é «sais»), e o verbo da frase nunca é a cabeça de uma coisa */
    const cabecaOk = toks[i].s === e.w[0] || (toks[i].s.length >= 4 && e.w[0].length >= 4 && !verboDe(toks[i].s));
    if (e.w.length > 1 && cabecaOk && mesmaPalavra(toks[i].s, e.w[0]) && toks[i].s.length >= 3) out.push({ j: i + 1, nome: e.nome, tipo: e.tipo, dono: e.dono, preco: e.preco, inteira: false, n: 1 });
  }
  return out;
}

/* ligarACena(frase, cena) → { marcada, marcas: [{ i, j, tipo, ... }], toks }
   A frase com as entidades da cena marcadas; `marcada` é o texto com as
   marcas no lugar dos nomes — é sobre ele que a estrutura decide. */
export function ligarACena(frase, cena) {
  const toks = palavrasDaFrase(frase);
  const cn = arrumarCena(cena);
  const marcas = [];
  let i = 0;
  while (i < toks.length) {
    const t = toks[i].s;
    /* a quantia: algarismo ou por extenso («vinte e cinco») */
    if (ehNumero(t)) {
      let v = valorDe(t), j = i + 1;
      while (j + 1 < toks.length && toks[j].s === "e" && ehNumero(toks[j + 1].s) && valorDe(toks[j + 1].s) < v) { v += valorDe(toks[j + 1].s); j += 2; }
      const seg = j < toks.length ? toks[j].s : "";
      const umSo = (t === "um" || t === "uma");
      /* «um/uma» só conta diante da moeda («uma moeda»), e não diante de coisa («uma cerveja») */
      if (!umSo || O_OUVIDO.moedaDeUm.includes(seg.replace(/s$/, ""))) { marcas.push({ i, j, tipo: "N", valor: v }); i = j; continue; }
    }
    if (O_OUVIDO.moedas.includes(t)) {
      /* «cobre» e «conto» só são dinheiro quando não fazem parte de coisa nem de verbo */
      const cs = coisasEm(toks, i, cn).filter((c) => c.inteira);
      const ehVerbo = (t === "conto" || t === "contos" || t === "cobre" || t === "troco") && (i === 0 || O_OUVIDO.enchimento.includes(toks[i - 1].s) || O_OUVIDO.clitico.includes(toks[i - 1].s) || O_OUVIDO.negacoes.includes(toks[i - 1].s) || /^[,"—]$/.test(toks[i - 1].s));
      if (!cs.length && !ehVerbo) { marcas.push({ i, j: i + 1, tipo: "MOEDA" }); i++; continue; }
    }
    const p = Object.prototype.hasOwnProperty.call(O_OUVIDO.pronomes, t) ? null : pessoaEm(toks, i, cn);
    if (p) { marcas.push({ i, j: p.j, tipo: "PESSOA", estado: p.estado, nome: p.nome, opcoes: p.opcoes }); i = p.j; continue; }
    if (Object.prototype.hasOwnProperty.call(O_OUVIDO.pronomes, t)) { marcas.push({ i, j: i + 1, tipo: "PRONOME", genero: O_OUVIDO.pronomes[t] }); i++; continue; }
    const cs = coisasEm(toks, i, cn);
    if (cs.length) {
      const maior = Math.max(...cs.map((c) => (c.inteira ? 100 : 0) + c.n));
      const j = Math.max(...cs.filter((c) => (c.inteira ? 100 : 0) + c.n === maior).map((c) => c.j));
      marcas.push({ i, j, tipo: "COISA", leituras: cs });
      i = j;
      continue;
    }
    i++;
  }
  const rotulo = (m) => (m.tipo === "COISA" ? "<COISA_" + ({ minha: "MINHA", dele: "DELE", solta: "SOLTA" }[escolherLeitura(m, null).tipo]) + ">" : "<" + m.tipo + ">");
  const partes = [];
  for (let k = 0; k < toks.length;) {
    const m = marcas.find((x) => x.i === k);
    if (m) { partes.push(m.tipo === "PRONOME" ? "<PESSOA>" : rotulo(m)); k = m.j; } else { partes.push(toks[k].s); k++; }
  }
  return { marcada: partes.join(" "), marcas, toks, cena: cn };
}

/* qual leitura da coisa vale: quem compra quer a DELE; quem dá, vende, usa, quer a MINHA */
function escolherLeitura(m, prefere) {
  const ls = m.leituras;
  const ordem = prefere === "dele" ? ["dele", "solta", "minha"] : prefere === "minha" ? ["minha", "dele", "solta"] : ["minha", "dele", "solta"];
  const inteiras = ls.filter((l) => l.inteira);
  if (prefere === "minha") { const mi = ls.find((l) => l.tipo === "minha"); if (mi) return mi; }
  /* 23/11 (a décima sexta sessão, frases 43 e 44): «compro uma ração» com rações na mochila e a
     «Ração de viagem» no balcão lia a MINHA (a inteira) — e o balcão «não vendia ração». Quem compra,
     pede ou pergunta o preço quer a coisa de quem vende, inteira ou pela cabeça */
  if (prefere === "dele") { const de = inteiras.find((l) => l.tipo === "dele") || ls.find((l) => l.tipo === "dele"); if (de) return de; }
  const pool = inteiras.length ? inteiras : ls;
  for (const t of ordem) { const l = pool.find((x) => x.tipo === t); if (l) return l; }
  return pool[0];
}

/* ---------------- 4. as orações ---------------- */
function verboDe(s) {
  for (const [lema, v] of Object.entries(VERBOS_DO_OUVIDO)) {
    if (v.formas.includes(s)) return { lema, ...v };
  }
  for (const [lema, v] of Object.entries(VERBOS_DO_OUVIDO)) {
    for (const r0 of v.raizes) {
      if (s.startsWith(r0) && O_OUVIDO.terminacoes.includes(s.slice(r0.length)) && s.length - r0.length <= 4) return { lema, ...v };
    }
  }
  return null;
}
const ehInfinitivo = (s) => O_OUVIDO.infinitivo.test(s) && !O_OUVIDO.naoInfinitivo.includes(s) && s.length > 3;

function oracoesDe(toks) {
  /* corta em pontuação, e em «e/mas/depois» quando o que vem é verbo */
  const out = [];
  let cur = [];
  let aspas = false;
  for (let k = 0; k < toks.length; k++) {
    const t = toks[k];
    if (t.s === '"') { aspas = !aspas; cur.push(k); continue; }
    if (!aspas && /^[,.;:!]$/.test(t.s)) { if (cur.length) out.push(cur); cur = []; continue; }
    /* 23/11 (a décima sexta sessão, frase 14): «empresta a vassoura, Mordecai? Eu devolvo já» —
       o «?» no meio fecha a oração (e fica nela); o do fim continua como sempre */
    if (!aspas && t.s === "?" && k + 1 < toks.length) { cur.push(k); out.push(cur); cur = []; continue; }
    if (!aspas && (t.s === "e" || t.s === "mas" || t.s === "depois" || t.s === "entao") && cur.length && k + 1 < toks.length) {
      const prox = toks[k + 1].s;
      const prox2 = k + 2 < toks.length ? toks[k + 2].s : "";
      if (verboDe(prox) || O_OUVIDO.negacoes.includes(prox) || (O_OUVIDO.clitico.includes(prox) && verboDe(prox2))) { out.push(cur); cur = []; continue; }
    }
    cur.push(k);
  }
  if (cur.length) out.push(cur);
  return out;
}

/* ---------------- 5. a leitura ---------------- */
const VAZIA = Object.freeze({ familia: "agir", subtipo: null, quem: null, coisa: null, quantia: null, confianca: 0, marcada: "", fala: false, pergunta: false, negada: false, condicional: false });

/* oOuvido(frase, cena) → a leitura:
   { familia, subtipo, quem, coisa, quantia, confianca, marcada,
     quemEstado ("aqui"|"qual"|"longe"|"morto"|null), opcoesDeQuem, quemDito,
     coisaTipo ("minha"|"dele"|"solta"|"moeda"|"livre"|null), dono, preco,
     direcao ("recebe" | null), regateio, fala, pergunta, negada, condicional,
     propostaDeEmTroca ({ nome, dono, preco } | null) } */
export function oOuvido(frase, cena) {
  try {
    if (!str(frase).trim()) return VAZIA;
    const L = ligarACena(frase, cena);
    return ler(L, str(frase));
  } catch {
    return VAZIA;
  }
}

function ler(L, frase) {
  const { toks, marcas, cena: cn } = L;
  const C = O_OUVIDO.confianca;
  const marcaEm = (k) => marcas.find((m) => m.i <= k && k < m.j) || null;
  const comecoSem = toks.filter((x) => !/^["—]$/.test(x.s)).slice(0, 4).map((x) => x.s).join(" ");
  const pergunta = /\?\s*$/.test(frase) || (O_OUVIDO.comecoDePergunta.test(comecoSem) && !/^como (o|a|os|as|um|uma|meu|minha)\b/.test(comecoSem));
  const aoMestre = toks.length > 1 && O_OUVIDO.oMestre.includes(toks[0].s) && /^[,:!?]$/.test(toks[1].s) || /\b(pergunto|digo|falo) (ao|pro|para o) (mestre|narrador)\b/.test(toks.map((x) => x.s).join(" "));
  const fala = toks.length > 0 && (toks[0].s === '"' || toks[0].s === "—");
  const ors = oracoesDe(toks);

  /* o vocativo: a oração que é só uma pessoa («Marta», «capitão») */
  const soPessoa = (o) => {
    const ks = o.filter((k) => !/^["—?!]$/.test(toks[k].s));
    if (!ks.length) return null;
    const m = marcaEm(ks[0]);
    if (m && m.tipo === "PESSOA" && ks.every((k) => k >= m.i && k < m.j)) return m;
    return null;
  };
  let vocativo = null;
  const resto = [];
  for (const o of ors) { const v = soPessoa(o); if (v) { if (!vocativo) vocativo = v; } else resto.push(o); }
  const saudacao = (o) => { const s = o.map((k) => toks[k].s).filter((w) => !/^["—]$/.test(w)).join(" "); return O_OUVIDO.saudacoes.some((x) => s === x || s.startsWith(x + " ")) || O_OUVIDO.marcaDeDiscurso.includes(s); };

  const base = { marcada: L.marcada, fala, pergunta, negada: false, condicional: false, direcao: null, regateio: false, propostaDeEmTroca: null };
  const todasPessoas = marcas.filter((m) => m.tipo === "PESSOA");
  const quemDe = (m) => (m ? { quem: m.estado === "qual" ? null : m.nome, quemEstado: m.estado, opcoesDeQuem: m.opcoes || [], quemDito: true } : { quem: null, quemEstado: null, opcoesDeQuem: [], quemDito: false });
  const primeiraPessoa = (ks) => { for (const k of ks) { const m = marcaEm(k); if (m && m.tipo === "PESSOA" && m.i === k) return m; } return null; };

  /* o pronome: o único candidato, o mesmo gênero, ou quem vende a coisa dita */
  const resolverPronome = (ks, coisaLeitura, rigido, subtipoDaTroca) => {
    const pr = ks.map(marcaEm).find((m) => m && m.tipo === "PRONOME");
    if (!pr) return null;
    const antes = marcas.find((m) => m.tipo === "PESSOA" && m.estado === "aqui" && m.i < pr.i);
    if (antes) return antes;
    if (coisaLeitura && coisaLeitura.tipo === "dele" && coisaLeitura.dono) return { tipo: "PESSOA", estado: "aqui", nome: coisaLeitura.dono, opcoes: [] };
    /* 23/11 (a décima sexta sessão, frase 58): «peço a poção de volta pra ela» — quem tem a coisa
       é quem o pronome retoma (a poção está na bolsa do companheiro) */
    if (coisaLeitura && cn.companheiro && cn.doCompanheiro.some((n) => mesmaPalavra(sem(n).split(" ")[0], sem(coisaLeitura.nome).split(" ")[0]))) return { tipo: "PESSOA", estado: "aqui", nome: cn.companheiro, opcoes: [] };
    /* o foco: a quem a frase anterior foi dita, ou quem falou por último (só a cena do jogo o traz) */
    if (cn.temFoco) {
      const presentes = [...cn.pessoas.map((p) => p.nome), ...(cn.companheiro ? [cn.companheiro] : [])];
      if (cn.foco && presentes.some((n) => sem(n) === sem(cn.foco))) return { tipo: "PESSOA", estado: "aqui", nome: presentes.find((n) => sem(n) === sem(cn.foco)), opcoes: [] };
      /* a banca de quem a frase anterior comprou («compro duas tochas do balcão… vendo o símbolo pra ela») */
      /* a bancada da troca (Q10): «dou a ela a corda» não entrega à loja — a banca só é o «ela» de quem negocia com ela */
      if (cn.foco && ["vender", "comprar", "escambo", "pagar"].includes(subtipoDaTroca) && cn.bancas.some((b) => sem(b.nome) === sem(cn.foco))) return { tipo: "PESSOA", estado: "aqui", nome: cn.bancas.find((b) => sem(b.nome) === sem(cn.foco)).nome, opcoes: [] };
      /* o único do gênero dito não é adivinhar */
      const fem0 = (n) => /a$/.test(palavrasDoNome(n).filter((w) => !TITULOS.includes(w))[0] || "");
      const doGenero0 = cn.pessoas.filter((p) => (pr.genero === "f" ? fem0(p.nome) : pr.genero === "m" ? !fem0(p.nome) : false));
      if (doGenero0.length === 1) return { tipo: "PESSOA", estado: "aqui", nome: doGenero0[0].nome, opcoes: [] };
      /* sem foco e com mais de um candidato, ninguém se adivinha (a frase 19 deu o símbolo ao Mordecai) */
      if (cn.pessoas.length === 1) return { tipo: "PESSOA", estado: "aqui", nome: cn.pessoas[0].nome, opcoes: [] };
      return null;
    }
    const gente = cn.pessoas;
    if (gente.length === 1) return { tipo: "PESSOA", estado: "aqui", nome: gente[0].nome, opcoes: [] };
    const fem = (n) => /a$/.test(palavrasDoNome(n).filter((w) => !TITULOS.includes(w))[0] || "");
    const doGenero = gente.filter((p) => (pr.genero === "f" ? fem(p.nome) : pr.genero === "m" ? !fem(p.nome) : true));
    /* quem tira (pegar, furtar) só retoma o único candidato: «pego o que ele deixou» com dois em cena → pergunta.
       Nas outras trocas o pronome retoma como numa mesa: o primeiro do gênero dito.
       (Em 22/11 o rígido valeu para toda troca por uma corrida, e o selado o desmentiu em agregado:
       o veredito da armadilha «pronome» caiu de 71% para 43%. Voltou a ser só de quem tira.) */
    if (rigido) return null;
    if (doGenero.length >= 1) return { tipo: "PESSOA", estado: "aqui", nome: doGenero[0].nome, opcoes: [] };
    return null;
  };

  /* a coisa da oração: a primeira coisa/moeda depois de `de`; senão o nome comum depois do artigo */
  const coisaDe = (ks, desde, prefere, livre = true) => {
    for (const k of ks) {
      if (k < desde) continue;
      const m = marcaEm(k);
      if (!m || m.i !== k) {
        /* o nome comum logo depois do artigo, se vem antes de qualquer coisa marcada */
        if (livre && O_OUVIDO.artigos.includes(toks[k].s) && k + 1 < toks.length && ks.includes(k + 1) && !marcaEm(k + 1)) {
          const w = toks[k + 1].s;
          if (O_OUVIDO.recipientes.includes(w) && k + 3 < toks.length && O_OUVIDO.tira.includes(toks[k + 2].s)) {
            const r = marcaEm(k + 3);
            if (r && r.tipo === "COISA") return { ...escolherLeitura(r, prefere), k: k + 3, parte: O_OUVIDO.parteDe.includes(w) };
          }
          /* «um pedaço dessa corda»: o demonstrativo já traz o «de», e a coisa é a seguinte */
          if ((O_OUVIDO.recipientes.includes(w) || O_OUVIDO.parteDe.includes(w)) && k + 3 < toks.length && O_OUVIDO.deDemonstrativo.includes(toks[k + 2].s)) {
            const r = marcaEm(k + 3);
            if (r && r.tipo === "COISA") return { ...escolherLeitura(r, prefere), k: k + 3, parte: O_OUVIDO.parteDe.includes(w) };
            const w3 = toks[k + 3].s;
            if (!r && w3.length >= 3 && !O_OUVIDO.naoECoisa.includes(w3) && !ehInfinitivo(w3)) return { nome: singular(toks[k + 3].o.toLowerCase()), tipo: "livre", dono: null, preco: null, k: k + 3, parte: O_OUVIDO.parteDe.includes(w) };
          }
          if (w.length >= 3 && !O_OUVIDO.naoECoisa.includes(w) && !O_OUVIDO.naoECoisa.includes(sem(singular(w))) && !ehInfinitivo(w) && !ehNumero(w) && !O_OUVIDO.artigos.includes(w) && !["que", "qual", "quem"].includes(w)) {
            return { nome: singular(toks[k + 1].o.toLowerCase()), tipo: "livre", dono: null, preco: null, k: k + 1 };
          }
        }
        continue;
      }
      if (m.tipo === "COISA") {
        const l = escolherLeitura(m, prefere);
        /* «o livro» não é o «livro emprestado» que carrego, para quem pega: é um livro */
        if (!l.inteira && prefere && l.tipo !== prefere && l.tipo === "minha") return { nome: singular(toks[k].o.toLowerCase()), tipo: "livre", dono: null, preco: null, k };
        return { ...l, k };
      }
      if (m.tipo === "MOEDA") return { nome: "moeda", tipo: "moeda", dono: null, preco: null, k };
      if (m.tipo === "N") {
        const prox = m.j < toks.length ? marcaEm(m.j) : null;
        if (prox && prox.tipo === "COISA") { const l = escolherLeitura(prox, prefere); return { ...l, k: m.j }; }
        if (prox && prox.tipo === "MOEDA") return { nome: "moeda", tipo: "moeda", dono: null, preco: null, k: m.j };
        /* 23/11 (a décima sexta sessão, frase 55): «dou três poções de mana» — a coisa contada que
           o sistema não conhece é a coisa dita (e a regra responde «você não tem»), não uma pergunta */
        if (!prox && livre && ks.includes(m.j) && m.j < toks.length) {
          const w = toks[m.j].s;
          /* a bancada da troca (B44): «dou três flechas» — depois do número vem um nome, ainda que tenha cara de verbo («flech-») */
          if (w.length >= 3 && !O_OUVIDO.naoECoisa.includes(w) && !O_OUVIDO.naoECoisa.includes(sem(singular(w))) && !ehInfinitivo(w) && (!verboDe(w) || /s$/.test(w)) && !O_OUVIDO.artigos.includes(w) && !O_OUVIDO.entrega.includes(w) && !O_OUVIDO.tira.includes(w) && !O_OUVIDO.emTroca.includes(w) && !O_OUVIDO.antesDoOficio.includes(w) && !O_OUVIDO.recipientes.includes(w)) return { nome: singular(toks[m.j].o.toLowerCase()), tipo: "livre", dono: null, preco: null, k: m.j };
        }
      }
    }
    return null;
  };
  /* qualquer coisa marcada da oração (para quem só olha, anda, fala) */
  const coisaMarcada = (ks, prefere) => {
    for (const k of ks) { const m = marcaEm(k); if (m && m.i === k && m.tipo === "COISA") return { ...escolherLeitura(m, prefere), k }; }
    for (const k of ks) { const m = marcaEm(k); if (m && m.i === k && m.tipo === "MOEDA") return { nome: "moeda", tipo: "moeda", k }; }
    return null;
  };
  const quantiaDeQue = () => {
    const n = marcas.find((x) => x.tipo === "N");
    if (!n) return null;
    const prox = marcaEm(n.j);
    if (prox && prox.i === n.j && prox.tipo === "COISA") return "coisa";
    if (prox && prox.i === n.j && prox.tipo === "MOEDA") return "moeda";
    const seg = n.j < toks.length ? toks[n.j].s : "";
    if (O_OUVIDO.recipientes.includes(seg)) return "coisa";
    return "solta";
  };
  const quantiaDe = (ks) => { for (const k of ks) { const m = marcaEm(k); if (m && m.i === k && m.tipo === "N") return m.valor; } return null; };

  const sai = (o) => {
    const coisa = o.coisa ? (o.coisa.tipo === "livre" ? o.coisa.nome : o.coisa.nome) : null;
    const ehComp = !!(cn.companheiro && o.quem && o.quem === cn.companheiro);
    return Object.freeze({
      ...base, ...o,
      quem: ehComp ? null : o.quem || null,
      companheiro: ehComp ? cn.companheiro : null,
      coisa,
      coisaTipo: o.coisa ? o.coisa.tipo : null,
      dono: o.coisa ? o.coisa.dono || null : null,
      preco: o.coisa ? o.coisa.preco || null : null,
      subtipo: o.familia === "trocar" ? o.subtipo || null : null,
      quantia: o.quantia == null ? null : o.quantia,
      opcoesDeQuem: Object.freeze([...(o.opcoesDeQuem || [])]),
    });
  };

  /* o Mestre chamado: «mestre, tem alguém vigiando?» */
  if (aoMestre) {
    const ks = toks.map((_, k) => k);
    return sai({ familia: "perguntar_ao_mestre", quem: null, quemEstado: null, opcoesDeQuem: [], quemDito: false, coisa: coisaMarcada(ks, null), quantia: null, confianca: C.falaOuPergunta });
  }
  /* a fala entre aspas ou travessão: falar, com quem o vocativo diz */
  if (fala) {
    const ks = toks.map((_, k) => k);
    const m = vocativo || primeiraPessoa(ks);
    return sai({ familia: "falar", ...quemDe(m), coisa: coisaMarcada(ks, null), quantia: quantiaDe(ks), confianca: C.falaOuPergunta });
  }

  /* a oração principal: a primeira que não é negada (se houver outra), nem saudação */
  let principal = null, negada = false, condicional = false;
  const comeca = (o) => { let k = 0; while (k < o.length && O_OUVIDO.enchimento.includes(toks[o[k]].s)) k++; return k; };
  const afirmadas = resto.filter((o) => { const k = comeca(o); return k < o.length && !O_OUVIDO.negacoes.includes(toks[o[k]].s); });
  if (resto.length && resto.every((o) => saudacao(o) || o.every((k) => toks[k].s === "?"))) {
    const ks = toks.map((_, k) => k);
    return sai({ familia: "falar", ...quemDe(vocativo || primeiraPessoa(ks)), coisa: null, quantia: null, confianca: C.falaOuPergunta });
  }
  const semSaudacao = resto.filter((o) => !saudacao(o));
  const cand = semSaudacao.length ? semSaudacao : resto;
  const primeiraOr = cand[0] || [];
  const k0 = comeca(primeiraOr);
  if (primeiraOr.length && O_OUVIDO.condicionais.includes(toks[primeiraOr[k0]].s)) condicional = true;
  if (primeiraOr.length && O_OUVIDO.negacoes.includes(toks[primeiraOr[k0]].s)) {
    const outra = afirmadas.find((o) => o !== primeiraOr && !saudacao(o) && o.some((k) => verboDe(toks[k].s) && !marcaEm(k)));
    if (outra) principal = outra; else { principal = primeiraOr; negada = true; }
  } else principal = primeiraOr;
  /* 23/11 (a décima sexta sessão, frase 24): «esse livro não é seu. Entregue ele a mim» — a oração
     sem verbo nenhum comenta, não age; a ação é a primeira seguinte que abre com verbo de troca */
  if (principal && principal.length && !negada && !condicional && !principal.some((k) => verboDe(toks[k].s) && !marcaEm(k))) {
    const abreComTroca = (o) => { let k = comeca(o); if (k < o.length && O_OUVIDO.clitico.includes(toks[o[k]].s)) k++; const vv = k < o.length ? verboDe(toks[o[k]].s) : null; return !!(vv && vv.fam === "trocar" && !marcaEm(o[k])); };
    const outra = cand.find((o) => o !== principal && abreComTroca(o));
    if (outra) principal = outra;
  }
  if (!principal || !principal.length) principal = toks.map((_, k) => k);
  const todos = toks.map((_, k) => k);
  const ks = principal;
  const txt = ks.map((k) => toks[k].s).join(" ");
  const txtTudo = toks.map((t) => t.s).join(" ");
  const quemDaOracao = () => vocativo || primeiraPessoa(ks) || primeiraPessoa(todos);
  const temSegunda = O_OUVIDO.segundaPessoa.some((w) => new RegExp("\\b" + w + "\\b").test(txtTudo)) || !!vocativo;

  /* a negada: «não aceito dinheiro sujo, Rato» — fala, não troca */
  if (negada) {
    const m = quemDaOracao();
    const vk = ks.find((k) => verboDe(toks[k].s));
    return sai({ familia: "falar", negada: true, ...quemDe(m), coisa: coisaDe(ks, vk == null ? 0 : vk + 1, null) || null, quantia: quantiaDe(ks), confianca: C.contexto });
  }

  /* a condicional: «se eu pagar, você me anuncia?» */
  if (condicional) {
    const m = quemDaOracao();
    const conseq = O_OUVIDO.consequenciaAoMestre.some((x) => txtTudo.includes(x));
    const preco = /\b(quanto|preco|desconto)\b/.test(txtTudo);
    const segunda = temSegunda && /\b(voce|senhor|senhora|vc|me|faz|leva|conta|deixa|anuncia)\b/.test(txtTudo);
    let familia = "falar";
    if (conseq && !vocativo) familia = "perguntar_ao_mestre";
    else if (preco) familia = "falar";
    /* o pedido a quem se fala, com a segunda pessoa dita, é convencer. (Em 22/11 o vocativo sozinho
       bastou por uma corrida, e o selado o desmentiu em agregado: a condicional caiu de 65% para 53%.) */
    else if (segunda && (vocativo || /\b(voce|senhor|senhora)\b/.test(txtTudo))) familia = "convencer";
    const vk = ks.findIndex((k) => verboDe(toks[k].s) && !O_OUVIDO.condicionais.includes(toks[k].s));
    const vkk = vk >= 0 ? ks[vk] : 0;
    let coisa = coisaDe(todos, vkk + 1, "dele") || null;
    if (!coisa && /\b(pagar|pago|pagasse|der|dou|desse|tivesse)\b/.test(txtTudo)) coisa = { nome: "moeda", tipo: "moeda" };
    return sai({ familia, condicional: true, ...quemDe(m), coisa, quantia: quantiaDe(todos), confianca: C.contexto });
  }

  /* a bancada da troca (B08): «quanto custa uma corda? Se for menos de cinquenta, eu compro» — a compra
     condicionada ao preço perguntado ainda é a pergunta do preço (o Mestre diz quanto; nada muda de mão) */
  if (pergunta && O_OUVIDO.precoPergunta.some((w) => new RegExp("\\b" + w + "\\b").test(txtTudo)) && cand.some((o) => o.length && O_OUVIDO.condicionais.includes(toks[o[comeca(o)]] ? toks[o[comeca(o)]].s : ""))) {
    const mP = vocativo || primeiraPessoa(todos);
    return sai({ familia: "falar", ...quemDe(mP), coisa: coisaDe(todos, 0, "dele"), quantia: quantiaDe(todos), confianca: C.falaOuPergunta });
  }
  /* a pergunta: de preço (falar), a alguém (falar), ao mundo (Mestre) */
  const principalAcao = !ks.some((k) => toks[k].s === "?") && (() => { const k1 = ks[comeca(ks)]; const vv = k1 != null ? verboDe(toks[k1].s) : null; return !!(vv && !marcaEm(k1)); })();
  if (pergunta && !principalAcao) {
    const ehPreco = O_OUVIDO.precoPergunta.some((w) => new RegExp("\\b" + w + "\\b").test(txtTudo)) && !/\bquanto (falta|tempo|demora|dura|anda)\b/.test(txtTudo) && !(!vocativo && /\b(eu tenho|tenho|me resta|resta|sobrou|sobra|tenho de|de vida)\b/.test(txtTudo));
    const pedido = /\b(me (vende|empresta|da|de|passa|arruma|ve)|pode me|poderia me|vende pra mim)\b/.test(txtTudo);
    const m = vocativo || primeiraPessoa(todos);
    if (!pedido) {
      const pede = ks.find((k) => { const v = verboDe(toks[k].s); return v && v.fam === "trocar" && k === ks[comeca(ks)] && /o$/.test(toks[k].s); });
      if (ehPreco) {
        let coisa = coisaDe(todos, 0, "dele");
        if (!coisa && m && m.estado === "aqui") { const p = cn.pessoas.find((x) => x.nome === m.nome); if (p && p.vende.length === 1) coisa = { nome: p.vende[0].item, tipo: "dele", dono: p.nome, preco: p.vende[0].preco }; }
        return sai({ familia: "falar", ...quemDe(m), coisa, quantia: quantiaDe(todos), confianca: C.falaOuPergunta });
      }
      if (pede == null) {
        const deMim = O_OUVIDO.perguntaDeMim.test(txtTudo) && !/\b(voce|vc|senhor|senhora)\b/.test(txtTudo);
        const aoMundo = !vocativo && (deMim || (!temSegunda && !(m && m.estado === "aqui" && m.i > 0 && O_OUVIDO.entrega.includes(toks[m.i - 1].s))));
        const m2 = aoMundo ? (m && toks[m.i] && m.nome && palavrasDoNome(m.nome)[0] === toks[m.i].s ? m : null) : m;
        return sai({ familia: aoMundo ? "perguntar_ao_mestre" : "falar", ...quemDe(m2), coisa: coisaMarcada(todos, null), quantia: null, confianca: C.falaOuPergunta });
      }
    }
  }

  /* o verbo da oração principal */
  let i = comeca(ks);
  let clitico = null;
  if (i < ks.length && O_OUVIDO.clitico.includes(toks[ks[i]].s) && i + 1 < ks.length) { clitico = toks[ks[i]].s; i++; }
  let vk = i < ks.length ? ks[i] : null;
  let v = vk != null ? verboDe(toks[vk].s) : null;
  let modal = null;
  /* o modal: «tento persuadir», «quero levar», «vou subornar» — o verbo é o infinitivo */
  if (vk != null && O_OUVIDO.modais.includes(toks[vk].s) && i + 1 < ks.length) {
    let j = i + 1;
    if (O_OUVIDO.clitico.includes(toks[ks[j]].s) && j + 1 < ks.length) { clitico = toks[ks[j]].s; j++; }
    const inf = toks[ks[j]].s;
    const vi = verboDe(inf);
    if (vi && (ehInfinitivo(inf) || vi.formas.includes(inf))) { modal = toks[vk].s; vk = ks[j]; v = vi; i = j; }
  }
  /* sem verbo no começo: procura o primeiro verbo da oração (a frase começa por um nome, «Rhogar, …») */
  if (!v && i < ks.length && marcaEm(ks[i]) && marcaEm(ks[i]).tipo === "PESSOA") {
    for (let j = i; j < ks.length; j++) { const vv = verboDe(toks[ks[j]].s); if (vv && !marcaEm(ks[j])) { vk = ks[j]; v = vv; i = j; break; } }
  }
  const depois = vk == null ? ks : ks.filter((k) => k > vk);
  const dps = depois.map((k) => toks[k].s);
  const txtDps = dps.join(" ");
  const pessoaDepois = primeiraPessoa(depois);
  const temMoeda = depois.some((k) => { const m = marcaEm(k); return m && (m.tipo === "MOEDA" || m.tipo === "N"); });
  const temN = quantiaDe(ks);
  /* a bancada da troca (B91): «para ela me deixar passar» — o propósito pode ter dois pronomes antes do verbo */
  const propositoRx = /\b(pra|para|pro)\s+(?:(?:<p>|ele|ela|eles|elas|o|a|me|eu|nos|lhe)\s+){0,2}([a-z]+(?:ar|er|ir))\b/;
  const txtDpsP = depois.map((k) => { const m = marcaEm(k); return m && m.tipo === "PESSOA" ? (m.i === k ? "<p>" : "") : toks[k].s; }).filter(Boolean).join(" ");
  const proposito = (() => { const m = txtDpsP.match(propositoRx); return !!(m && ehInfinitivo(m[2]) && !["ver", "comer", "beber", "dormir"].includes(m[2])); })();
  const destino = () => {
    /* a pessoa depois de uma preposição de entrega */
    for (const k of depois) {
      const m = marcaEm(k);
      if (m && m.i === k && (m.tipo === "PESSOA" || m.tipo === "PRONOME")) {
        const antes = toks[k - 1] ? toks[k - 1].s : "";
        if (O_OUVIDO.entrega.includes(antes) || antes === "com" || antes === "no" || antes === "na") return m;
      }
    }
    return null;
  };
  const origem = () => {
    for (const k of depois) {
      const m = marcaEm(k);
      if (m && m.i === k && (m.tipo === "PESSOA" || m.tipo === "PRONOME")) {
        const antes = toks[k - 1] ? toks[k - 1].s : "";
        if (O_OUVIDO.tira.includes(antes)) return m;
      }
    }
    return null;
  };

  /* a família pelo verbo, e o contexto que muda o verbo */
  let familia = v ? v.fam : null, subtipo = v ? v.sub : null;
  let confianca = v ? C.verbo : C.semVerbo;
  let direcao = null, regateio = false;
  const lema = v ? v.lema : null;
  const vs = vk != null ? toks[vk].s : "";
  const ctx = (f, s) => { familia = f; subtipo = s || null; confianca = C.contexto; };
  const objDepois = coisaDe(depois, 0, null);
  const objEhMoeda = objDepois && objDepois.tipo === "moeda";
  const objEhMinha = objDepois && (objDepois.tipo === "minha" || objDepois.tipo === "moeda");

  if (v) {
    /* os verbos de muitos sentidos */
    if (["passar", "passo"].includes(vs) || (lema === "agir" && /^pass/.test(vs))) {
      if (/^a mao\b/.test(txtDps) || /^(a )?mao (no|na|em)\b/.test(txtDps)) ctx("trocar", "furtar");
      else if (/^(a noite|o dia|o tempo|a tarde|a manha|horas)\b/.test(txtDps)) ctx("esperar");
      else if (/^(pela|pelo|por|perto|entre|ao lado|atras)\b/.test(txtDps)) ctx("mover");
      else if (objDepois && (destino() || pessoaDepois)) {
        if (/\bquanto\b/.test(txtTudo)) ctx("trocar", "vender");
        else if (objEhMoeda && proposito) ctx("trocar", "subornar");
        else ctx("trocar", "dar");
      } else ctx("agir");
    } else if (["jogo", "jogar", "lanco", "lancar", "atiro", "atirar", "arremesso", "arremessar"].includes(vs)) {
      const dst = destino();
      if (objEhMoeda) ctx("trocar", "dar");
      else if (/^(em|no|na|contra|nele|nela)\b/.test(txtDps) && pessoaDepois) ctx("lutar");
      else if (pessoaDepois && /\b(em|no|na|contra)\s+<p>/.test(txtDpsP)) ctx("lutar");
      else if (objDepois && objDepois.tipo === "minha" && dst) ctx("trocar", "dar");
      else if (objDepois && objDepois.tipo === "minha") ctx("usar");
      else ctx("agir");
    } else if (["deixo", "deixar"].includes(vs)) {
      if (objEhMinha && (/\b(no|na|em|pra|pro|para|com|ao|a)\b/.test(txtDps))) ctx("trocar", "dar");
      else if (/^(pra la|quieto|estar)\b/.test(txtDps)) ctx("esperar");
      else ctx("agir");
    } else if (["boto", "botar", "ponho", "poe", "coloco", "colocar"].includes(vs)) {
      if (objEhMoeda && proposito) ctx("trocar", "subornar");
      else if (objEhMoeda) ctx("trocar", "dar");
      else if (objDepois && objDepois.tipo === "minha") ctx("usar");
      else ctx("agir");
    } else if (["levo", "levar"].includes(vs)) {
      const od = coisaDe(depois, 0, "dele");
      if (od && od.tipo === "dele") ctx("trocar", "comprar");
      else if (od && od.tipo === "minha" && destino()) ctx("trocar", "dar");
      else if (/escondid|sem (ele|ela|ninguem|que)/.test(txtTudo)) ctx("trocar", "furtar");
      else if (od && od.tipo === "solta") ctx("trocar", "pegar");
      else ctx("agir");
    } else if (["tiro", "tirar"].includes(vs)) {
      if (/\b(do|da) (bolso|bolsa|cinto|algibeira)\b/.test(txtDps) && (origem() || pessoaDepois || /\bdele|dela\b/.test(txtDps))) ctx("trocar", "furtar");
      else if (objDepois && objDepois.tipo === "minha") ctx("usar");
      else if (objDepois && (origem() || objDepois.tipo === "dele")) ctx("trocar", "furtar");
      else if (objDepois && objDepois.tipo === "solta") ctx("trocar", "pegar");
      else ctx("agir");
    } else if (["tomo", "tomar"].includes(vs)) {
      if (origem() || /\b(da mao|das maos)\b/.test(txtDps)) ctx("trocar", "furtar");
      else if (objDepois && objDepois.tipo === "minha") ctx("usar");
      else if (objDepois && objDepois.tipo === "dele") ctx("trocar", "comprar");
      else if (/^(um|uma|o|a)\s+(gole|banho|ar|folego|cuidado|coragem)/.test(txtDps)) ctx("agir");
      else ctx("usar");
    } else if (lema === "falar" && /^cont/.test(vs)) {
      if (/^(minhas|meus|as|os) (moedas|racoes|coisas|flechas|pratas)/.test(txtDps) || /^(quanto|quantas|quantos)/.test(txtDps) || (dps[0] && (dps[0] === "minhas" || dps[0] === "meus"))) ctx("perguntar_ao_mestre");
    } else if (["dou", "dar", "damos", "dei", "dando"].includes(vs) && clitico !== "me") {
      if (/^(um|uma) (papo|ideia|toque|lero|cantada|xaveco|sermao)\b/.test(txtDps)) ctx("convencer");
      else if (/^(um|uma) (jeito|pulo|salto|empurrao|chute na porta)\b/.test(txtDps)) ctx("agir");
      else if (/^(uma|um) /.test(txtDps) && O_OUVIDO.olharDeGiria.includes(dps[1])) ctx("olhar");
      else if (/^(um|uma) (soco|chute|tapa|murro|golpe|cabecada|joelhada|cotovelada|facada|espadada|rasteira|bofetada|porrada|tiro|flechada)\b/.test(txtDps)) ctx("lutar");
      else if (/^(uma|um) (volta|corrida|passeio|caminhada)\b/.test(txtDps)) ctx("mover");
      else if (/^(um|uma) (tempo|cochilo|descanso)\b/.test(txtDps)) ctx("esperar");
      else if (objEhMoeda && /\b(por|pelo|pela|pelos|pelas)\b/.test(txtDps) && coisaDepoisDe(depois, toks, marcaEm, O_OUVIDO.emTroca)) ctx("trocar", "comprar");
      else if (objEhMoeda && proposito) ctx("trocar", "subornar");
      else ctx("trocar", "dar");
    } else if (["ofereco", "oferecer", "oferece", "ofereci", "oferecemos"].includes(vs)) {
      if (objEhMoeda && proposito) ctx("trocar", "subornar");
      else if (objEhMoeda && coisaDepoisDe(depois, toks, marcaEm, O_OUVIDO.emTroca)) ctx("trocar", "comprar");
      else if (objDepois && objDepois.tipo === "minha" && (/\bquanto\b/.test(txtTudo) || (temN && /\b(por|pelo|pela)\b/.test(txtDps)))) ctx("trocar", "vender");
      else ctx("trocar", "dar");
    } else if (["pago", "pagar", "pagamos", "paguei"].includes(vs) && coisaDepoisDe(depois, toks, marcaEm, O_OUVIDO.emTroca)) {
      /* «pago trinta pela espada», «pago o Rato pela informação»: compra */
      ctx("trocar", "comprar");
    } else if (O_OUVIDO.pedidoAoBalcao.includes(vs) && coisaDe(depois, 0, "dele") && coisaDe(depois, 0, "dele").tipo === "dele") {
      /* «manda um ensopado aí, Marta»: o pedido ao balcão */
      ctx("trocar", "comprar");
    } else if (["bato", "bater", "puxo", "puxar", "levo", "levar", "troco", "trocar"].includes(vs) && /^(um )?(papo|ideia|conversa|lero)\b/.test(txtDps)) {
      ctx("falar");
    } else if (/^acert/.test(vs) || /^fech/.test(vs)) {
      /* «acerto a conta», «fecho a conta»: pagar; «acerto o Kragg»: lutar */
      if (/^(a|as|minha|minhas) (conta|contas|divida|dividas)\b/.test(txtDps) || /^o que (eu )?devo\b/.test(txtDps)) ctx("trocar", "pagar");
      else if (/^acert/.test(vs) && pessoaDepois) ctx("lutar");
      else ctx("agir");
    } else if (lema === "pegar" && clitico === "me") {
      /* «me agarro no mastro»: o corpo, não a coisa */
      ctx("agir");
    } else if (lema === "pegar" && coisaDe(depois, 0, "dele") && coisaDe(depois, 0, "dele").tipo === "dele" && /\bcom\s+(?:(?:o|a)\s+)?<p>/.test(txtDpsP)) {
      /* «pego um quarto com o Hugo»: com quem vende, é compra */
      ctx("trocar", "comprar");
    } else if (["subo", "subir"].includes(vs) && /^(no|na|em|nos|nas)\b/.test(txtDps) && objDepois && objDepois.tipo === "solta") {
      ctx("agir");
    } else if (lema === "comprar") {
      if (/^(o|a|seu|sua) (silencio|lealdade|favor|ajuda|vista grossa|boca|bico)\b/.test(txtDps)) ctx("trocar", "subornar");
    } else if (lema === "subornar" && vs === "molho") {
      if (!/\bmao\b/.test(txtDps)) ctx("agir");
    } else if (["chego", "chegar"].includes(vs) && /^chegando\b/.test(txtDps)) ctx("lutar");
    else if (["parto", "partir"].includes(vs) && /^(pra|para) cima\b/.test(txtDps)) ctx("lutar");
    else if (["vou", "vamos", "ir"].includes(vs) && /^(pra|para) cima\b/.test(txtDps)) ctx("lutar");
    else if (["avanco", "avancar", "avancamos", "invisto", "investir"].includes(vs) && /^(contra|sobre|pra cima)\b/.test(txtDps)) ctx("lutar");
    else if (lema === "usar" && /^pendur/.test(vs) && clitico === "me") ctx("agir");
    /* 23/11 (a décima sexta sessão, frase 23): «guardo o livro na bolsa» — guardar o que está solto
       na cena, ou o que não é meu dentro da bolsa, é pegar (a regra e a ficha dizem se há o que pegar) */
    else if (lema === "usar" && /^guard/.test(vs) && objDepois && objDepois.tipo === "solta") ctx("trocar", "pegar");
    else if (lema === "usar" && /^guard/.test(vs) && objDepois && objDepois.tipo === "livre" && O_OUVIDO.naBolsa.test(txtDps)) ctx("trocar", "pegar");
    else if (lema === "usar" && /^guard/.test(vs) && objDepois && objDepois.tipo !== "minha" && objDepois.tipo !== "moeda") ctx("agir");
    else if (lema === "usar" && !["como", "comer", "comemos"].includes(vs) && objDepois && objDepois.tipo === "solta") ctx("agir");
    else if (lema === "usar" && ["como", "comer"].includes(vs) && !objDepois) { familia = null; subtipo = null; }
    else if (lema === "trocar" && !/\b(por|pelo|pela|pelos|pelas)\b/.test(txtDps)) { if (/^de\b/.test(txtDps)) ctx("agir"); }
    else if (lema === "emprestar" && (clitico === "me" || /\b(me empresta|me empreste|emprestado)\b/.test(txtTudo))) { direcao = "recebe"; }
    else if (lema === "pedir" && /^(ao|a|pro|pra|para)\s+<p>\s+([a-z]+)\b/.test(txtDpsP) && ehInfinitivo(txtDpsP.match(/^(?:ao|a|pro|pra|para)\s+<p>\s+([a-z]+)\b/)[1])) ctx("convencer");
    else if (lema === "pedir" && (/^(pra|para|que)\s/.test(txtDps) || /^(ao|a|pro|pra|para)\s+<p>\s+(que|pra|para)\b/.test(txtDpsP))) {
      if (!objDepois || (objDepois.k > (depois.find((k) => /^(que|pra|para)$/.test(toks[k].s) && k > depois[0]) || 1e9))) ctx("convencer");
    } else if (lema === "pedir" && /^implor/.test(vs) && !objDepois) ctx("convencer");
    else if (lema === "cobrar" && /^exij/.test(vs) && !/\b(deve|devendo|dinheiro|moeda|pagamento|divida)\b/.test(txtTudo)) ctx("convencer");
    else if (lema === "convencer" && /^desenrol/.test(vs)) {
      if (/\b(desconto|preco|abatimento)\b/.test(txtDps) || (objDepois && objDepois.tipo === "dele")) { ctx("trocar", "comprar"); regateio = true; }
    } else if (lema === "pegar" && /^peg/.test(vs) && origem() && /\b(da mao|das maos|a forca)\b/.test(txtDps)) ctx("trocar", "furtar");
    else if (lema === "olhar" && ["vejo", "ver", "ve"].includes(vs) && clitico === "me" && objDepois) ctx("trocar", "comprar");
    else if (lema === "esperar" && ["fico", "ficar", "ficamos"].includes(vs) && /^(de olho|de vigia|de guarda|de tocaia|de butuca|atento|observando|espiando|escutando|vigiando)\b/.test(txtDps)) ctx("olhar");
    else if (lema === "esperar" && ["fico", "ficar", "ficamos"].includes(vs) && /^(escondid|atras|agachad|abaixad)/.test(txtDps)) ctx("agir");
    else if (lema === "esperar" && vs === "armo" && !/\b(acampamento|barraca|tenda|bivaque)\b/.test(txtDps)) ctx("agir");
    else if (lema === "agir" && /^bat/.test(vs) && /\b(carteira|bolsa)\b/.test(txtDps)) ctx("trocar", "furtar");
    else if (lema === "agir" && /^bat/.test(vs) && pessoaDepois && !/\b(porta|na porta)\b/.test(txtDps)) ctx("lutar");
    else if (lema === "agir" && /^cort/.test(vs) && pessoaDepois) ctx("lutar");
    else if (lema === "lutar" && !pessoaDepois && objDepois && objDepois.tipo === "solta") ctx("agir");
    else if (lema === "lutar" && /^chut/.test(vs) && !pessoaDepois && /\b(porta|portao|caixote|barril|grade)\b/.test(txtDps)) ctx("agir");
    else if (lema === "agir" && ["faco", "fazer", "faz"].includes(vs) && /\b(acampamento|fogueira)\b/.test(txtDps)) ctx(/acampamento/.test(txtDps) ? "esperar" : "agir");

    /* o pedido a quem está: «me dá», «me vende», «me passa», «me empresta» */
    if (clitico === "me" && lema === "vender") ctx("trocar", "comprar");
    if (clitico === "me" && (["passa", "passe"].includes(vs))) { const od = coisaDe(depois, 0, "dele"); ctx("trocar", od && od.tipo === "dele" ? "comprar" : "pedir"); }
    if (lema === "agir" && /^(esgueir|escond)/.test(vs)) { familia = "agir"; }
  } else if (vk != null && ["quero", "queremos"].includes(toks[vk].s)) {
    const od = coisaDe(depois, 0, "dele");
    if (/\b(meu dinheiro|o que (me )?deve|meu pagamento|minhas moedas de volta)\b/.test(txtDps)) ctx("trocar", "cobrar");
    else if (od && od.tipo === "dele") ctx("trocar", "comprar");
    else if (od) ctx("trocar", "pedir");
    else ctx("falar");
  }
  /* «me dá/me dê» */
  if (vk != null && clitico === "me" && ["da", "de", "dou"].includes(toks[vk].s)) {
    const od = coisaDe(depois, 0, "dele");
    ctx("trocar", od && od.tipo === "dele" && !od.parte ? "comprar" : "pedir");
  }
  if (!v && vk != null && clitico === "me" && ["da", "de", "ve"].includes(toks[vk].s)) {
    const od = coisaDe(depois, 0, "dele");
    ctx("trocar", od && od.tipo === "dele" && !od.parte ? "comprar" : "pedir");
  }
  /* 23/11 (a décima sexta sessão, frase 48): «Charity, me serve uma sopa» — o pedido ao balcão sem
     verbo da tabela, dito a alguém: compra do que se vende, pedido do resto */
  if (!v && vk != null && O_OUVIDO.pedidoAoBalcao.includes(toks[vk].s) && (clitico === "me" || vocativo)) {
    const od = coisaDe(depois, 0, "dele");
    ctx("trocar", od && od.tipo === "dele" ? "comprar" : "pedir");
  }
  /* O PEDIDO DIRIGIDO (23/11, frases 14, 18, 24): o verbo de troca fora da primeira pessoa, dito a
     alguém e sem outro destinatário, é o herói pedindo dela — e a pessoa do vocativo é o quem */
  {
    const dirigido = !!vocativo || clitico === "me" || O_OUVIDO.aMim.test(txtTudo);
    const sub = lema ? O_OUVIDO.pedidoDirigido[lema] : null;
    if (v && sub && familia === "trocar" && !modal && vk != null && dirigido && !O_OUVIDO.primeiraPessoa.test(vs) && !ehInfinitivo(vs) && !destino()) {
      const od = coisaDe(depois, 0, "dele");
      ctx("trocar", sub === "pedir" && lema !== "devolver" && od && od.tipo === "dele" ? "comprar" : sub);
      if (sub === "emprestar") direcao = "recebe";
      base.pedidoDirigido = true;
    }
  }
  /* TOMAR (23/11, frase 22): «arranco o livro da mão dele» — tirar da mão de alguém é força contra
     quem segura: vai ao dado, como o furto */
  if (v && familia !== "lutar" && ["agir", "pegar", "usar"].includes(lema) && O_OUVIDO.daMao.test(txtDps) && (origem() || /\b(dele|dela)\b/.test(txtDps) || pessoaDepois)) { ctx("trocar", "furtar"); base.tomar = true; }
  /* «fico com o troco»: receber de volta a moeda (sem troco devido, a regra da mesa diz que não há) */
  if (O_OUVIDO.troco.test(txtTudo)) { ctx("trocar", "cobrar"); base.troco = true; }

  if (familia === "agir") {
    const kc = depois.find((k) => toks[k].s === "com");
    const inst = kc != null ? coisaDe(depois, kc + 1, "minha", false) : null;
    if (inst && inst.tipo === "minha") { ctx("usar"); base.instrumento = inst; }
  }
  /* o jeito de dizer (gíria, locução) vale mais que o verbo solto */
  {
    const k1 = comeca(ks);
    const ini = ks.slice(k1).map((k) => toks[k].s).join(" ");
    /* a mesma oração com a pessoa como <p> (e sem o artigo diante dela) */
    const iniP = (() => { const out = []; for (let j = k1; j < ks.length; j++) { const k = ks[j]; const m = marcaEm(k); if (m && m.tipo === "PESSOA") { if (m.i === k) { if (["o", "a"].includes(out[out.length - 1])) out.pop(); out.push("<p>"); } continue; } out.push(toks[k].s); } return out.join(" "); })();
    const casa = (p, x) => x === sem(p) || x.startsWith(sem(p) + " ");
    const jd = O_OUVIDO.jeitosDeDizer.find(([p]) => casa(p, ini) || casa(p, iniP));
    if (jd) { ctx(jd[1], jd[2] || null); base.jeito = true; }
  }
  if (!base.jeito) {
    const objPrim = coisaDe(depois, 0, "minha", false);
    const pessoaAlvo = (() => { for (const k of depois) { const m = marcaEm(k); if (m && m.i === k && m.tipo === "PESSOA" && m.estado !== "morto") { const a = toks[k - 1] ? toks[k - 1].s : ""; const a2 = toks[k - 2] ? toks[k - 2].s : ""; if (["em", "no", "na", "contra", "nele", "nela"].includes(a) || (["o", "a"].includes(a) && ["em", "contra"].includes(a2))) return m; } } return null; })();
    /* a arma que vai na pessoa: «enfio a faca no guarda» é luta */
    if ((familia === "agir" || familia === "usar" || !v) && objPrim && objPrim.tipo === "minha" && pessoaAlvo) ctx("lutar");
    /* a coisa que carrego, sem ninguém do outro lado: é uso («lustro a espada», «escondo a gazua na bota») */
    else if (familia === "agir" && objPrim && objPrim.tipo === "minha" && !pessoaDepois && objPrim.k === depois.find((k) => marcaEm(k) && marcaEm(k).i === k)) ctx("usar");
    /* agarrar alguém vivo é luta, não pegar */
    else if (familia === "trocar" && ["pegar", "furtar"].includes(subtipo) && pessoaDepois && pessoaDepois.estado === "aqui" && depois[0] != null && (marcaEm(depois[0]) === pessoaDepois || (O_OUVIDO.artigos.includes(toks[depois[0]].s) && marcaEm(depois[1]) === pessoaDepois)) && !coisaDe(depois, 0, "dele")) ctx("lutar");
    /* enrolar alguém é convencer; enrolar a coisa é usar */
    if (lema === "usar" && /^enrol/.test(vs) && pessoaDepois) ctx("convencer");
    if (/^apert/.test(vs) && pessoaDepois) ctx("convencer");
    if (lema === "convencer" && /^enrol/.test(vs) && objPrim && objPrim.tipo === "minha") ctx("usar");
  }
  /* furto declarado pela maneira: «sem ele ver», «escondido» */
  if (familia === "trocar" && subtipo === "pegar" && /\b(sem (ele|ela|ninguem|que (ele|ela|ninguem)) (ver|perceber|notar)|escondid\w*|as escondidas|de fininho|na surdina)\b/.test(txtTudo)) ctx("trocar", "furtar");
  /* o regateio: «desconto», «por menos», «nem um a menos», preço dito na venda */
  if (familia === "trocar" && /\b(desconto|abatimento|mais barato|por menos|nem um a menos|nem uma a menos|pechinch\w*|regate\w*|chorar o preco)\b/.test(txtTudo)) regateio = true;
  /* 23/11 (a décima sexta sessão, frase 48): «fico devendo até amanhã» — o fiado vai ao dado */
  if (familia === "trocar" && ["comprar", "pagar", "pedir"].includes(subtipo) && O_OUVIDO.fiado.test(txtTudo)) base.fiado = true;

  /* sem verbo reconhecido: a estrutura decide */
  if (!familia) {
    const cMarc0 = coisaDe(ks, 0, "dele", false);
    const cMarc = cMarc0 && cMarc0.tipo === "dele" && (primeiraPessoa(todos) || vocativo) ? coisaDe(ks, 0, null, false) : cMarc0;
    const dst = destino();
    const org = origem();
    const pAny = primeiraPessoa(todos) || vocativo;
    const kEmTroca = ks.find((k) => O_OUVIDO.emTroca.includes(toks[k].s));
    const cAntes = kEmTroca != null ? coisaDe(ks.filter((k) => k < kEmTroca), 0, "minha", false) : null;
    const cDepois = kEmTroca != null ? coisaDepoisDe(ks.filter((k) => k >= kEmTroca), toks, marcaEm, O_OUVIDO.emTroca) : null;
    if (cAntes && cAntes.tipo === "minha" && cDepois && cDepois.leituras.some((l) => l.tipo === "dele")) {
      ctx("trocar", "escambo"); confianca = C.estrutura;
    } else if (cMarc0 && cMarc0.tipo === "minha" && !dst && !pAny && (/\b(no|na|nos|nas|em|dentro)\b/.test(txt) || (vk != null && depois.length && (marcaEm(depois[0]) || (O_OUVIDO.artigos.includes(toks[depois[0]].s) && marcaEm(depois[1])))))) {
      /* «enfio a gazua na fechadura»: a coisa que carrego posta num lugar é uso */
      ctx("usar"); confianca = C.estrutura;
    } else if (cMarc && cMarc.tipo === "dele" && !pAny && (temN || /^(um|uma|uns|umas|o|a|duas|dois)\b/.test(txt) || ks.length <= 3)) {
      ctx("trocar", "comprar"); confianca = C.estrutura;
    } else if (cMarc && (cMarc.tipo === "minha" || cMarc.tipo === "moeda") && dst && dst.tipo === "PESSOA") {
      /* o verbo que ninguém previu, com a coisa minha indo a alguém: é entrega */
      ctx("trocar", cMarc.tipo === "moeda" && proposito ? "subornar" : "dar"); confianca = C.estrutura;
    } else if (vocativo && cMarc && cMarc.tipo === "dele") {
      ctx("trocar", "comprar"); confianca = C.estrutura;
    } else if (cMarc && cMarc.tipo === "dele" && (org || pAny) && vk != null && ks.indexOf(vk) === comeca(ks) && !O_OUVIDO.artigos.includes(toks[vk].s)) {
      ctx("trocar", null); confianca = C.semVerbo;
    } else if (pergunta) {
      ctx(temSegunda || pAny ? "falar" : "perguntar_ao_mestre"); confianca = C.semVerbo;
    } else if (pAny && vocativo) {
      ctx("falar"); confianca = C.semVerbo;
    } else {
      ctx("agir"); confianca = C.semVerbo;
    }
  }

  /* quem, coisa e quantia, segundo a família */
  let m = null, coisa = null, pessoaDepoisEscambo = null;
  const prefereDe = { comprar: "dele", pedir: "dele", furtar: "dele", pegar: "dele", cobrar: null, subornar: null, vender: "minha", dar: "minha", emprestar: direcao === "recebe" ? "dele" : "minha", devolver: "minha", escambo: "minha", pagar: "dele" };
  if (familia === "trocar") {
    const pref = prefereDe[subtipo] || null;
    coisa = coisaDe(depois.length ? depois : ks, 0, pref);
    if (subtipo === "escambo" && coisa && coisa.tipo !== "minha") { const cm = coisaDe(ks, 0, "minha", false); if (cm && cm.tipo === "minha") coisa = cm; }
    if (!coisa && depois.length && !marcaEm(depois[0])) {
      const w = toks[depois[0]].s;
      if (w.length >= 4 && !O_OUVIDO.naoECoisa.includes(w) && !ehInfinitivo(w) && !verboDe(w) && !O_OUVIDO.artigos.includes(w) && !O_OUVIDO.entrega.includes(w) && !O_OUVIDO.tira.includes(w) && !O_OUVIDO.emTroca.includes(w) && !["isso", "isto", "aquilo", "tudo", "algo", "nada", "mais", "menos", "aqui", "agora"].includes(w)) coisa = { nome: singular(toks[depois[0]].o.toLowerCase()), tipo: "livre", dono: null, preco: null, k: depois[0] };
    }
    /* a compra paga com moeda «pela erva»: a coisa é o que vem em troca */
    if (subtipo === "comprar" && coisa && coisa.tipo === "moeda") {
      const cTroca = coisaDepoisDe(depois, toks, marcaEm, O_OUVIDO.emTroca);
      if (cTroca) coisa = { ...escolherLeitura(cTroca, "dele") };
    }
    if (subtipo === "escambo") {
      const cTroca = coisaDepoisDe(depois, toks, marcaEm, O_OUVIDO.emTroca);
      base.propostaDeEmTroca = cTroca ? escolherLeitura(cTroca, "dele") : null;
      if (!base.propostaDeEmTroca) {
        /* o nome comum depois do «por»: «por um quarto» */
        const kp = depois.find((k) => O_OUVIDO.emTroca.includes(toks[k].s));
        if (kp != null) {
          const c2 = coisaDe(depois, kp + 1, "dele");
          if (c2) base.propostaDeEmTroca = c2;
          else if (kp + 1 < toks.length && !marcaEm(kp + 1) && toks[kp + 1].s.length >= 3 && !O_OUVIDO.naoECoisa.includes(toks[kp + 1].s)) base.propostaDeEmTroca = { nome: singular(toks[kp + 1].o.toLowerCase()), tipo: "livre", dono: null, preco: null, k: kp + 1 };
        }
      }
      if (coisa && base.propostaDeEmTroca && coisa.k != null && base.propostaDeEmTroca.k != null && coisa.k === base.propostaDeEmTroca.k) coisa = null;
      if (coisa && ["outra", "coisa"].includes(sem(coisa.nome))) coisa = null;
    }
    if (subtipo === "subornar" && coisa && coisa.tipo !== "moeda") { const cm = depois.map(marcaEm).find((x) => x && x.tipo === "MOEDA"); coisa = cm ? { nome: "moeda", tipo: "moeda" } : (temN ? { nome: "moeda", tipo: "moeda" } : null); }
    if (["cobrar", "pagar"].includes(subtipo) && !coisa && temN) coisa = { nome: "moeda", tipo: "moeda" };
    if (subtipo === "cobrar" && coisa && coisa.tipo === "livre") coisa = null;
    if (subtipo === "pagar" && coisa && coisa.tipo === "minha") coisa = null;
    /* a pessoa: a quem vai (entrega), de quem vem (tira), ou a dita; senão o vocativo */
    if (subtipo === "escambo" && !pessoaDepois && !vocativo && !destino() && !origem()) { const pe = primeiraPessoa(ks); if (pe) pessoaDepoisEscambo = pe; }
    const quemOrdem = ["dar", "vender", "emprestar", "devolver", "pagar", "subornar"].includes(subtipo) && direcao !== "recebe" ? [destino(), pessoaDepois, vocativo, origem()] : [origem(), pessoaDepois, vocativo, destino(), pessoaDepoisEscambo];
    m = quemOrdem.find(Boolean) || null;
    if (!m && depois.some((k) => { const x = marcaEm(k); return x && x.tipo === "PRONOME"; })) m = depois.map(marcaEm).find((x) => x && x.tipo === "PRONOME");
    if (m && m.tipo === "PRONOME") {
      const vemDeOutro = ["pedir", "cobrar", "furtar", "pegar", "comprar"].includes(subtipo) || direcao === "recebe";
      const r = resolverPronome(ks, coisa && (coisa.tipo === "dele" || vemDeOutro) ? coisa : null, ["pegar", "furtar"].includes(subtipo), subtipo);
      m = r;
      if (!r) base.quemPronomeSemDono = true;
    }
    if (subtipo === "escambo" && m && base.propostaDeEmTroca && base.propostaDeEmTroca.tipo === "dele" && m.nome && base.propostaDeEmTroca.dono && base.propostaDeEmTroca.dono !== m.nome) {
      const p = cn.pessoas.find((x) => x.nome === m.nome);
      if (p) { const it = p.vende.find((x) => sem(x.item) === sem(base.propostaDeEmTroca.nome)); if (it) base.propostaDeEmTroca = { nome: it.item, tipo: "dele", dono: p.nome, preco: it.preco }; }
    }
  } else {
    m = vocativo || primeiraPessoa(ks) || null;
    if (!m) {
      const pr = ks.map(marcaEm).find((x) => x && x.tipo === "PRONOME");
      if (pr && ["convencer", "falar", "lutar"].includes(familia)) m = resolverPronome(ks, null, false);
    }
    if (familia === "perguntar_ao_mestre" && m && m.estado === "aqui" && !vocativo) m = null;
    const desde = vk == null ? 0 : vk + 1;
    if (familia === "usar") coisa = base.instrumento || coisaDe(depois.length ? depois : ks, 0, "minha");
    else if (familia === "lutar") {
      const kc = ks.find((k) => toks[k].s === "com" && k > desde);
      coisa = kc != null ? coisaDe(ks, kc + 1, "minha") : null;
      if (!coisa) { const c0 = coisaDe(depois, 0, "minha", false); if (c0 && c0.tipo === "minha" && depois.indexOf(c0.k) <= 1) coisa = c0; }
    } else if (["olhar", "mover", "agir", "esperar"].includes(familia)) {
      coisa = coisaMarcada(depois.length ? depois : ks, null);
    } else if (familia === "convencer") {
      coisa = coisaMarcada(todos, null);
    } else {
      coisa = coisaMarcada(todos, null);
      if (!coisa) { const kp = depois.find((k) => ["minha", "meu", "minhas", "meus"].includes(toks[k].s)); if (kp != null) coisa = coisaDe(depois, kp, null); }
    }
  }
  const q = quemDe(m && m.tipo !== "PRONOME" ? m : null);
  let quantia = quantiaDe(familia === "trocar" || familia === "convencer" || familia === "falar" ? todos : ks);
  /* a bancada da troca (B13): «compro a corda e duas tochas» — o «duas» é das tochas, não da corda */
  {
    const nM = marcas.find((x) => x.tipo === "N");
    const aSeguir = nM ? marcaEm(nM.j) : null;
    if (familia === "trocar" && coisa && coisa.tipo !== "moeda" && coisa.k != null && nM && aSeguir && aSeguir.i === nM.j && aSeguir.tipo === "COISA" && nM.j !== coisa.k) quantia = null;
  }
  return sai({ familia, subtipo, ...q, coisa, quantia, quantiaDe: quantiaDeQue(), confianca, direcao, regateio, quemPronomeSemDono: !!base.quemPronomeSemDono });
}

/* a coisa que vem depois de uma preposição de «em troca» («pela erva», «pelo rum do Pio») */
function coisaDepoisDe(depois, toks, marcaEm, preps) {
  for (const k of depois) {
    if (!preps.includes(toks[k].s)) continue;
    for (let j = k + 1; j < Math.min(k + 4, toks.length); j++) {
      const m = marcaEm(j);
      if (m && m.tipo === "COISA") return m;
    }
  }
  return null;
}
