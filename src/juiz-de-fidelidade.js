/* ============================================================
   O JUIZ DE FIDELIDADE (T3-B, 1.ª fatia, 28/10/2026) — Taverna

   Doze sessões de prova (mente/mm11-sessao-*.md) mediram a mesma coisa à
   mão: a cada resposta do Narrador, o que ele disse que o sistema não
   sabia. O preço da cama que nenhuma tabela tinha ("dez com jantar, cinco
   sem"), o "um dia de marcha" onde o mapa dizia 4 h, o Rurik e o Varek que
   ninguém registou, a estalagem torta que a cidade não tem. A régua da
   Fase MM é a pergunta da pessoa — *a resposta sai do sistema ou da
   imaginação?* — e até aqui só se respondia lendo.

   Este módulo é essa leitura virada conta. Recebe a prosa e o que o
   sistema sabia NAQUELE turno (EM CENA e a gente do registo, o mapa, o
   mercado, o relógio, a pauta) e devolve um veredito com cada achado: o
   trecho da prosa, o número ou o nome, e o motivo em português.

   ---------------- O QUE ELE NÃO FAZ ----------------

   Primeiro só mede. Não corrige, não repede, não toca o estado: é uma
   função pura de (prosa, estado) → veredito. Corrigir é a fase seguinte,
   com a fiação no App e a decisão da pessoa (mente/plano-motor.md, "O que
   a pessoa decide", 3).

   ---------------- AS DUAS LEIS QUE O DESENHAM ----------------

   1. O Juiz COMPARA, não adivinha. Nenhum detector procura "um número na
      prosa": procura uma AFIRMAÇÃO (um valor em dinheiro, uma distância,
      alguém com nome) e só a condena se o estado não a sustenta. Quem não
      passa o mercado ao Juiz recebe todo preço como inventado — e isso é
      verdade: o sistema não o sabia.

   2. Menção não é presença (a memória "o portão morde só o necessário").
      Um nome dito de passagem dentro de uma fala ("falava com um homem do
      templo, o Varek") não é gente nova EM CENA: vai para `nomesNovos`,
      medido à parte. Só é `pessoasNovas` quem a narração põe a agir, ou
      quem se apresenta ("ele se chama Dolmen").

   E o que a casa já decidiu sobre contar invenções (narrador-so-narra.md
   §3) vale aqui: conta-se a PRIMEIRA vez — o que o jogador disse ("pago as
   sete") e o que as respostas de antes já disseram (o mesmo nome, o mesmo
   sítio, o mesmo preço da mesma coisa) não são invenção nova; e os
   idiomas ("um dia", "por um instante") não são distância. Por isso
   `estado.antes` aceita a lista das narrações anteriores, não só a última.

   E o que ele não vê está escrito na taxonomia (`mede: false`), e a suíte
   conta essas invenções à parte em vez de as esconder.

   Toda palavra que o Juiz reconhece e toda folga que ele dá estão nas
   tabelas abaixo, e a suíte (testes/teste-juiz-de-fidelidade.mjs) lê-as
   de volta.
   ============================================================ */

import { PRECOS_COMUNS } from "./economia.js";
import { NUMERO_POR_EXTENSO } from "./cobranca.js";
import { PERGUNTA_DE_PRECO } from "./mercado.js";
import { KMH_A_PE } from "./coordenadas.js";
import { HORAS_MARCHA_POR_DIA } from "./viagem.js";

/* ---------------- A TAXONOMIA (as doze sessões) ----------------
   As classes que as sessões 6–12 contaram, cada uma com o que o Juiz
   compara. `mede: false` são as que a prova à mão achou e que uma conta
   sobre a prosa não alcança (uma consequência inventada precisa de saber
   o que a história é; uma pessoa armada precisa de saber o que é ameaça):
   ficam escritas para o número do Juiz nunca parecer maior do que é. */
export const TAXONOMIA_DO_JUIZ = {
  precosInventados: { mede: true, o: "um valor em dinheiro (preço, taxa, suborno, câmbio) que não saiu da mesa", contra: "o mercado do turno, a bolsa, a frase do jogador", sessoes: "s6 10 · s7 4 · s8 3 · s9 8 · s10 1 · s11 3" },
  distanciasFora: { mede: true, o: "distância de viagem, ou tempo decorrido ou por vir, que o mapa e o relógio não dão (ou dão outro)", contra: "as distâncias e os tempos do turno", sessoes: "s6 3 · s7 1 · s8 2 · s9 3 · s10 5 · s11 4" },
  pessoasNovas: { mede: true, o: "gente com nome que age ou se apresenta em cena e o sistema não tem", contra: "EM CENA, a gente do registo, o grupo, o herói", sessoes: "s6 1 · s7 4 · s8 1 · s9 0 · s10 3 · s11 2" },
  nomesNovos: { mede: true, o: "gente com nome dita de passagem, dentro de uma fala, que o sistema não tem — menção não é presença", contra: "os mesmos", sessoes: "(as sessões contavam-na junto da anterior)" },
  lugaresNovos: { mede: true, o: "sítio com nome, ou estabelecimento onde a cena entra, que o mapa não tem", contra: "os lugares do turno (cidades, locais, regiões)", sessoes: "s8 4 · s9 1 · s10 3 · s11 4" },
  pautaCumprida: { mede: true, o: "o fato que a pauta mandou entrar nesta resposta (é fato, PERGUNTOU), e entrou", contra: "a pauta do turno", sessoes: "s9 M37 (a refeição ◉ 2 ignorada)" },
  consequencia: { mede: false, o: "consequência ou revelação inventada (o álibi, o rapto, o enredo de cinco batidas)", porque: "pede o que a história é, não o que a prosa diz" },
  armado: { mede: false, o: "criatura ou pessoa armada fora do sistema", porque: "pede saber o que é ameaça; o mensageiro com lança e a anã da lança são a mesma frase" },
  lutaSemLuta: { mede: false, o: "a luta que a prosa abre sem o sistema", porque: "é do canal de combate, que o motor já veta" },
  horaDoDia: { mede: false, o: "a hora do dia inventada ('não atende antes do meio-dia', 'antes do escuro' às 10 h)", porque: "pede o relógio e a agenda de cada pessoa, que a pauta ainda não traz" },
  itemOuEstado: { mede: false, o: "item ou estado contra a ficha (a tocha acesa no escuro)", porque: "pede a ficha inteira e o que cada objeto faz" },
};

/* ---------------- AS FOLGAS ----------------
   Quanto um número da prosa pode desviar da tabela e ainda ser o da
   tabela. `preco.relativa`/`absoluta`: o arredondamento do porte da
   cidade; `multiploAte`: a maior quantidade que a prosa ou o jogador
   podem dizer ("duas canecas" → 2 × ◉ 2) e ainda multiplicar o preço —
   a quantidade tem de estar DITA, nunca se procura um múltiplo que caiba.
   `distancia`: a marcha dita por alto ("umas quatro horas" para 4,2 h) —
   mas "um dia" (8 h) para 4 h não passa. `tempo`: o mesmo para o "há
   quanto" e o "daqui a quanto". `janela`: quantas frases antes da do
   número a pista do preço ainda vale ("A corda, cinco." depois de
   "Tochas são uma ficha cada."). `nomeMinimo`: o nome mais curto que
   conta como nome. */
export const TOLERANCIAS_DO_JUIZ = {
  preco: { relativa: 0.2, absoluta: 1, multiploAte: 12 },
  distancia: { relativa: 0.35, absolutaHoras: 0.5 },
  tempo: { relativa: 0.35, absolutaHoras: 1 },
  janela: 1,
  nomeMinimo: 3,
};

/* ---------------- O LÉXICO ----------------
   As palavras que o Juiz lê, sem acento e em minúsculas. `numeros`: o
   número por extenso (o contador antigo de ab-invencoes.mjs perdia
   "Duas moedas" e "vinte e cinco marcos"). `moedas`: os nomes que o
   Léxico das campanhas deu ao dinheiro até hoje — a 8.ª pagava em
   escamas, a 9.ª em marcos, a 6.ª em fichas; a moeda da campanha entra
   também pelo estado. `horas`: quantas horas vale cada unidade, de marcha
   (`viagem`) e de relógio (`relogio`) — o dia de estrada é o de
   viagem.js, e o quilómetro anda a KMH_A_PE. */
export const LEXICO_DO_JUIZ = {
  numeros: {
    ...NUMERO_POR_EXTENSO,
    dezasseis: 16, dezassete: 17, dezanove: 19, duzentos: 200, duzentas: 200, trezentos: 300, trezentas: 300,
    quatrocentos: 400, quinhentos: 500, quinhentas: 500, mil: 1000, duzia: 12,
  },
  moedas: ["moeda", "moedas", "cobre", "cobres", "prata", "pratas", "ouro", "ouros", "escama", "escamas", "marco", "marcos",
    "coroa", "coroas", "ficha", "fichas", "lasca", "lascas", "tostao", "tostoes", "peca", "pecas", "dobrao", "dobroes",
    "florim", "florins", "soldo", "soldos", "real", "reais", "tenca", "tencas"],
  porDoPreco: ["por", "pelo", "pela"],
  /* a frase do jogador que pede um preço, além da de mercado.js ("quanto ELE cobra") */
  perguntaDePreco: /\b(quanto\s+(?:\w+\s+){0,3}(?:custa|custam|cobra|cobram|pede|pedem|quer|sai|saem|fica|ficam|vale|valem)|que preco|qual o preco|quanto e\b)/,
  /* o valor sem a moeda só é preço com uma destas por perto */
  pistasDePreco: ["custa", "custam", "custou", "custava", "cobra", "cobram", "cobro", "cobrou", "cobrar", "preco", "precos",
    "pede", "peco", "pedem", "vale", "valem", "vendo", "vende", "pagar", "paga", "pago", "pagou", "pagam", "taxa", "total",
    "cada", "troco", "conta", "cambio", "suborno", "moeda", "moedas"],
  /* as coisas que as sessões viram o Mestre pôr preço e que a mesa do turno
     não traz (a 8.ª: a cama e a taxa; a 9.ª: a cama, o câmbio, o afiar; a
     11.ª: a cama e a taxa). Nomeada a coisa e sem o preço dela na mesa, o
     número é dele, e não do sistema — por mais que coincida com outro */
  coisasSemTabela: {
    "o pouso": /\b(camas?|quartos?|pouso|pernoite|dormida|catres?|estadia)\b/,
    "a taxa": /\b(taxas?|impostos?|carimbo|multa)\b/,
    "o câmbio": /\b(cambio|cambistas?|troco sua|trocar|troca)\b/,
    "o serviço": /\b(afio|afiar|amolar|amolo|ferrar|remendo)\b/,
    "o suborno": /\b(finja|finjo|fingir|vista grossa|fechar os olhos|fecho os olhos|calar a boca|que nao vi)\b/,
  },
  /* depois do número, sem substantivo: "custa três SE o dono jurar", "dez COM jantar" */
  depoisDoPreco: ["cada", "se", "com", "sem", "por", "no", "na", "e", "ou", "pra", "para", "so", "apenas", "mais", "o", "a",
    "pelo", "pela", "de", "do", "da", "ao", "a", "entao", "tudo", "inteiro", "inteira", "redondo", "redondas", "e", "nem"],
  /* antes do número, fazem dele uma quantidade ou uma hora: "os dois", "às duas" */
  antesQueNaoEPreco: ["os", "as", "dos", "das", "aos", "nos", "nas", "estes", "estas", "esses", "essas", "aqueles", "aquelas",
    "destes", "destas", "desses", "dessas", "ambos", "ambas", "vez", "vezes", "capitulo", "numero", "turno", "dia", "linha",
    "voces", "nos", "eles", "elas", "uns", "umas"],
  horas: {
    minuto: { viagem: 1 / 60, relogio: 1 / 60 }, minutos: { viagem: 1 / 60, relogio: 1 / 60 },
    hora: { viagem: 1, relogio: 1 }, horas: { viagem: 1, relogio: 1 },
    dia: { viagem: HORAS_MARCHA_POR_DIA, relogio: 24 }, dias: { viagem: HORAS_MARCHA_POR_DIA, relogio: 24 },
    noite: { viagem: HORAS_MARCHA_POR_DIA, relogio: 24 }, noites: { viagem: HORAS_MARCHA_POR_DIA, relogio: 24 },
    semana: { viagem: 7 * HORAS_MARCHA_POR_DIA, relogio: 168 }, semanas: { viagem: 7 * HORAS_MARCHA_POR_DIA, relogio: 168 },
    km: { viagem: 1 / KMH_A_PE, relogio: null }, quilometro: { viagem: 1 / KMH_A_PE, relogio: null }, quilometros: { viagem: 1 / KMH_A_PE, relogio: null },
    legua: { viagem: 5 / KMH_A_PE, relogio: null }, leguas: { viagem: 5 / KMH_A_PE, relogio: null },
    milha: { viagem: 1.6 / KMH_A_PE, relogio: null }, milhas: { viagem: 1.6 / KMH_A_PE, relogio: null },
  },
  /* a medida de viagem: "de marcha", "a pé", "daqui", "fica a" */
  pistasDeViagem: ["marcha", "caminho", "caminhada", "viagem", "estrada", "pe", "cavalo", "daqui", "fica", "ficam", "leva", "levam",
    "levar", "distancia", "chegar", "chega", "chegam", "andar", "trilha", "cavalgada", "carroca", "barco", "rumo", "sul", "norte",
    "leste", "oeste", "longe", "perto", "subida", "descida"],
  /* a frase do jogador que pede uma distância */
  perguntaDeDistancia: /\b(quanto tempo|que distancia|a distancia|distancia ate|quantas horas|quantos dias|fica longe|e longe|leva a pe|leva ate|quanto falta)\b/,
  /* o tempo que já foi ("há dois dias", "faz três dias", "dois dias atrás") */
  antesDoDecorrido: ["ha", "faz", "fazia", "havia", "fez"],
  depoisDoDecorrido: ["atras", "antes", "passados", "passadas"],
  /* o tempo que vem ("acorda em três horas", "daqui a dois dias") */
  antesDoPorvir: ["em", "dentro", "daqui", "ate"],
  /* o tempo que a NARRAÇÃO passa ("depois de uma hora") é do relógio do
     turno, não uma afirmação sobre o mundo: o Juiz não o mede */
  antesDoNarrado: ["depois", "apos", "durante", "por", "passa", "passam", "passou", "passaram"],
  depoisDoNarrado: ["depois", "mais", "inteira", "inteiro", "seguidas", "seguidos"],
  /* palavras com maiúscula que não são nome de ninguém */
  naoSaoNome: ["voce", "voces", "ele", "ela", "eles", "elas", "eu", "nos", "tu", "o", "a", "os", "as", "um", "uma", "uns", "umas",
    "mas", "e", "se", "nao", "sim", "entao", "aqui", "ali", "la", "quem", "que", "onde", "quando", "como", "porque", "por", "pois",
    "isso", "isto", "aquilo", "esse", "essa", "este", "esta", "aquele", "aquela", "seu", "sua", "seus", "suas", "meu", "minha",
    "teu", "tua", "nosso", "nossa", "no", "na", "nos", "nas", "do", "da", "dos", "das", "de", "em", "para", "pra", "com", "sem",
    "ate", "ao", "aos", "depois", "antes", "agora", "ainda", "ja", "so", "talvez", "nunca", "sempre", "cada", "todo", "toda",
    "todos", "todas", "outro", "outra", "outros", "outras", "nenhum", "nenhuma", "algum", "alguma", "alguem", "ninguem", "tudo",
    "nada", "ha", "faz", "bem", "mal", "olha", "ouve", "veja", "vem", "vai", "vamos", "va", "sabe", "acho", "certo", "claro",
    "obrigado", "obrigada", "senhor", "senhora", "moco", "moca", "rapaz", "menina", "menino", "crianca", "amigo", "amiga",
    "pois", "ora", "ah", "oh", "eh", "hum", "ei", "psiu", "bom", "boa", "muito", "pouco", "mais", "menos", "tambem", "assim",
    "quanto", "quantos", "qual", "quais", "ninguem", "dentro", "fora", "perto", "longe", "atras", "frente", "lado", "enquanto",
    "embora", "porem", "contudo", "logo", "mesmo", "mesma", "nem", "ou", "pelo", "pela", "num", "numa", "dum", "duma",
    "primeiro", "primeira", "segundo", "segunda", "ultimo", "ultima", "deixa", "espera", "escuta", "calma", "pronto", "chega",
    "fim", "tem", "temos", "sou", "estou", "esta", "estamos", "foi", "era", "seria", "sera", "pode", "posso", "quer", "quero",
    "diga", "digo", "fala", "falo", "anda", "corre", "fique", "fica", "entre", "entra", "sai", "saia", "venha", "volte",
    "cuidado", "silencio", "socorro", "pare", "para", "basta", "ok", "talvez", "sinto", "desculpe", "perdao", "adeus", "ola",
    "salve", "bem-vindo", "bem-vinda", "dia", "noite", "tarde", "manha", "hoje", "amanha", "ontem", "lembra", "lembre"],
  /* depois de uma palavra que abre a frase, fazem dela verbo ou coisa, não sujeito */
  naoSeguemNome: ["o", "a", "os", "as", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
    "num", "numa", "ao", "aos", "para", "pra", "pro", "por", "pelo", "pela", "com", "sem", "sobre", "entre", "ate", "contra",
    "desde", "apos", "me", "te", "lhe", "lhes", "vos", "isso", "isto", "aquilo", "esse", "essa", "este", "esta", "aquele",
    "aquela", "aqui", "ali", "la", "ca", "bem", "mal", "agora", "logo", "depois", "antes", "mais", "menos", "tambem", "assim",
    "muito", "pouco", "demais", "fora", "dentro", "perto", "longe", "ou", "que", "mas", "porque", "quando", "como", "onde",
    "voce", "voces", "eu", "ele", "ela", "eles", "elas", "nao", "sim", "nunca", "sempre", "tudo", "nada", "todos", "todas",
    "cada", "seu", "sua", "seus", "suas", "meu", "minha", "nosso", "nossa", "teu", "tua", "quem", "qual", "quanto"],
  /* títulos e ofícios que vêm com maiúscula colados a um nome */
  titulos: ["sargenta", "sargento", "capitao", "capita", "mestre", "mestra", "senhor", "senhora", "dona", "dom", "irmao", "irma",
    "padre", "madre", "frei", "lorde", "lady", "sir", "rei", "rainha", "principe", "princesa", "velho", "velha", "tio", "tia",
    "comandante", "tenente", "cabo", "soldado", "guarda", "juiz", "bispo", "abade", "abadessa", "conde", "condessa", "duque",
    "duquesa", "baronesa", "barao", "taverneiro", "taverneira", "ferreiro", "ferreira", "doutor", "doutora"],
  /* o substantivo que faz de um nome um SÍTIO ("a taverna X", "Ponte Brumoso") */
  nomesDeLugar: ["rua", "praca", "taverna", "estalagem", "pousada", "pensao", "hospedaria", "ponte", "vila", "cidade", "aldeia",
    "porto", "cais", "mercado", "templo", "torre", "forte", "fortaleza", "posto", "moinho", "ossuario", "mina", "bosque",
    "floresta", "rio", "lago", "monte", "serra", "vale", "campos", "campo", "celas", "cela", "poco", "bastiao", "castelo",
    "santuario", "capela", "igreja", "mosteiro", "abadia", "cripta", "catacumba", "caverna", "gruta", "colina", "planalto",
    "planaltos", "pantano", "baia", "costa", "ilha", "estrada", "trilha", "passo", "portao", "muralha", "rossio", "largo",
    "beco", "banca", "tenda", "loja", "forja", "ferraria", "armazem", "celeiro", "fazenda", "quinta", "granja", "biblioteca",
    "alfandega", "quartel", "calabouco", "masmorra", "pedreira", "pedra", "pedras", "fonte", "bairro", "distrito", "terras",
    "reino", "condado", "ducado", "marca", "fronteira", "chas", "fivela", "cao", "machado", "escudo"],
  /* o que separa o sítio do nome que vem depois: "Na taverna, Rurik…" — o
     substantivo de sítio e a preposição só batizam o nome colado a eles */
  separaDoSitio: /[,;:.!?…—–()"“”«»]/,
  /* o segundo nome com hífen é epíteto ("Rurik Martelo-Torto", "Nyla
     Punho-de-Pedra"): quem vem antes dele é o nome, nunca um verbo que só
     tem maiúscula por abrir a frase ("Levar Dolmen") */
  epiteto: /^\p{Lu}[\p{L}'’]*-\p{L}/u,
  /* antes de um nome, fazem dele destino ou endereço */
  preposicoesDeLugar: ["em", "no", "na", "nos", "nas", "para", "pra", "pro", "ate", "rumo", "ao", "a", "pelo", "pela", "desde", "perto", "longe"],
  /* o sítio sem nome que a prosa fixa (ver julgarEstabelecimentos) */
  estabelecimentos: ["estalagem", "pensao", "pousada", "hospedaria", "albergue", "taverna", "moinho", "celeiro", "armazem",
    "capela", "banca", "tenda", "barraca", "loja", "oficina"],
  /* o cômodo escondido que, dito, o lugar passa a ter */
  escondidos: ["alcapao", "porao", "duto", "tunel", "esgoto", "galeria", "cripta", "catacumba"],
  /* o que cada tipo de local da cidade (mundo-base.js) já traz consigo */
  lugarDoTipo: {
    taverna: ["taverna", "estalagem", "pousada", "hospedaria", "albergue", "pensao"],
    mercado: ["mercado", "banca", "tenda", "barraca", "feira", "loja"],
    forja: ["forja", "ferraria", "oficina", "banca"],
    templo: ["templo", "capela", "santuario", "altar"],
    guilda: ["guilda", "salao", "oficina"],
  },
  /* o adjetivo que faz de um estabelecimento UM lugar ("a estalagem torta") */
  qualificadores: ["torta", "torto", "velha", "velho", "nova", "novo", "amarela", "amarelo", "vermelha", "vermelho", "azul",
    "verde", "preta", "preto", "branca", "branco", "escura", "escuro", "baixa", "baixo", "alta", "alto", "grande", "pequena",
    "pequeno", "abandonada", "abandonado", "queimada", "queimado", "barata", "barato", "suja", "sujo", "rachada", "rachado"],
  /* a moldura que põe o estabelecimento num sítio: "por trás da", "está na", "para a" */
  molduraDeLugar: ["na", "no", "nas", "nos", "em", "para", "pra", "pro", "ate", "atras", "tras", "perto", "diante", "junto",
    "dentro", "rumo", "ao", "pela", "pelo", "sob", "frente", "lado", "fundo", "fundos"],
  /* o artigo que faz dele descrição, não sítio: "uma banca de tábuas grossas" */
  indefinidos: ["um", "uma", "uns", "umas", "num", "numa", "dum", "duma", "outro", "outra", "qualquer", "cada", "nenhum", "nenhuma"],
  /* o verbo que leva a cena para dentro de um sítio */
  verbosDeEntrada: ["entra", "entram", "entramos", "chega", "chegam", "leva", "levam", "conduz", "conduzem", "desce", "descem",
    "sobe", "sobem", "alcanca", "alcancam", "atravessa", "atravessam", "guia", "guiam", "empurra", "abre", "segue", "seguem"],
  /* quem se apresenta numa fala está em cena */
  apresentacao: [/\b(?:se chama|se chamava|chamava-se|me chamo|chamam-me|me chamam(?: de)?|chamavam(?: de)?|meu nome e|o nome dele e|o nome dela e|o nome e|sou o|sou a|sou)\s+$/],
  /* o fato que a pauta manda entrar */
  marcaDoFato: /\(e fato[^)]*\)/,
};

/* ---------------- O CHÃO: texto sem acento, com as mesmas posições ---------------- */

const tirarAcento = (c) => {
  const b = c.normalize("NFD").replace(/\p{M}/gu, "");
  return b.length === c.length ? b : c;
};
/* cada caractere do original tem o seu par no plano, na mesma posição:
   o trecho que o veredito devolve sai do original pelos mesmos índices */
function plano(s) {
  const t = String(s == null ? "" : s);
  let o = "";
  for (let i = 0; i < t.length; i++) o += tirarAcento(t[i]);
  const p = o.toLowerCase();
  return p.length === t.length ? p : o;
}
const semAcento = (s) => String(s == null ? "" : s).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const lista = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
const nomeDe = (x) => (x == null ? "" : typeof x === "string" ? x : String(x.nome || x.para || x.o || ""));

/* as palavras do texto, com a posição de cada uma */
function palavras(p) {
  const out = [];
  const rx = /[a-z0-9]+(?:-[a-z]+)*|◉/g;
  let m;
  while ((m = rx.exec(p))) out.push({ w: m[0], ini: m.index, fim: m.index + m[0].length });
  return out;
}

/* as frases (para o trecho e para a janela da pista) */
function frasesDe(t) {
  const out = [];
  const rx = /[^.!?…\n]+[.!?…]*["'”’»]?/g;
  let m;
  while ((m = rx.exec(t))) if (m[0].trim()) out.push({ ini: m.index, fim: m.index + m[0].length });
  return out;
}
const fraseDe = (frases, i) => {
  for (let k = 0; k < frases.length; k++) if (i >= frases[k].ini && i < frases[k].fim) return k;
  return frases.length - 1;
};
const trechoDe = (t, frases, k) => (frases[k] ? t.slice(frases[k].ini, frases[k].fim).trim() : "");

/* o que é FALA: entre aspas, ou no turno de travessão ("— diz. — ...") */
function mapaDaFala(t) {
  const fala = new Uint8Array(t.length);
  // aspas duplas e curvas
  let dentro = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "\"" || c === "“" || c === "”" || c === "«" || c === "»") { dentro = c === "“" || c === "«" ? true : c === "”" || c === "»" ? false : !dentro; continue; }
    if (c === "\n") dentro = false;
    if (dentro) fala[i] = 1;
  }
  // aspas simples que abrem depois de espaço e fecham antes de espaço/pontuação
  const rxS = /(^|[\s(—-])'([^'\n]{2,}?)'(?=[\s.,!?;:)—-]|$)/g;
  let m;
  while ((m = rxS.exec(t))) { const a = m.index + m[1].length + 1; for (let i = a; i < a + m[2].length; i++) fala[i] = 1; }
  // travessão: quando a prosa fala por travessão (e não por aspas), cada
  // travessão de uma linha vira a chave — "narração — fala — narração — fala".
  // Numa prosa de aspas, o travessão é só pausa e não abre fala nenhuma.
  if (fala.some((x) => x) || !/[—–]/.test(t)) return fala;
  let ini = 0;
  for (const linha of t.split("\n")) {
    const rx = /[—–]/g, idx = [];
    let mm;
    while ((mm = rx.exec(linha))) idx.push(mm.index);
    for (let k = 0; k < idx.length; k += 2) {
      const a = ini + idx[k] + 1, b = k + 1 < idx.length ? ini + idx[k + 1] : ini + linha.length;
      for (let i = a; i < b; i++) fala[i] = 1;
    }
    ini += linha.length + 1;
  }
  return fala;
}

/* ---------------- O NÚMERO ---------------- */

/* lê um número a partir da palavra i (dígitos ou por extenso, "vinte e
   cinco", "cento e vinte"); devolve { valor, ate } ou null */
function lerNumero(ws, i) {
  const N = LEXICO_DO_JUIZ.numeros;
  const w = ws[i] && ws[i].w;
  if (!w) return null;
  if (/^\d+$/.test(w)) {
    // "6,6 km": a vírgula decimal fica fora das palavras; junta-se aqui
    const prox = ws[i + 1];
    if (prox && /^\d+$/.test(prox.w) && prox.ini === ws[i].fim + 1) {
      return { valor: Number(w + "." + prox.w), ate: i + 1 };
    }
    return { valor: Number(w), ate: i };
  }
  if (!(w in N)) return null;
  let valor = N[w], j = i;
  while (ws[j + 2] && ws[j + 1].w === "e" && ws[j + 2].w in N && N[ws[j + 2].w] < valor && ws[j + 2].w !== "um" && ws[j + 2].w !== "uma") {
    valor += N[ws[j + 2].w];
    j += 2;
  }
  // "duas dúzias", "três mil"
  if (ws[j + 1] && (ws[j + 1].w === "mil" || ws[j + 1].w === "duzias" || ws[j + 1].w === "duzia") && valor < 1000) {
    valor *= ws[j + 1].w === "mil" ? 1000 : 12;
    j += 1;
  }
  return { valor, ate: j };
}

/* o valor de um número dito por extenso ou em dígitos, para a pauta */
const numerosNoTexto = (t) => {
  const p = plano(t), ws = palavras(p), out = [];
  for (let i = 0; i < ws.length; i++) { const n = lerNumero(ws, i); if (n) { out.push(n.valor); i = n.ate; } }
  return out;
};

/* ---------------- O DINHEIRO ---------------- */

const ehMoeda = (w, extra) => LEXICO_DO_JUIZ.moedas.includes(w) || extra.includes(w);

/* as afirmações de dinheiro de um texto: [{ valor, ini, fim, forte }] */
function dinheiroDe(t, { moeda = "", eco = false, perguntou = false } = {}) {
  const p = plano(t), ws = palavras(p), frases = frasesDe(t);
  const extra = moeda ? palavras(plano(moeda)).map((x) => x.w) : [];
  const pistas = LEXICO_DO_JUIZ.pistasDePreco;
  const out = [];
  const fraseTem = (k, lst, comMoedas = true) => {
    for (let q = Math.max(0, k - TOLERANCIAS_DO_JUIZ.janela); q <= k; q++) {
      const f = frases[q];
      if (!f) continue;
      const fs = palavras(p.slice(f.ini, f.fim)).map((x) => x.w);
      if (fs.some((w) => lst.includes(w) || (comMoedas && ehMoeda(w, extra)))) return true;
    }
    return false;
  };
  for (let i = 0; i < ws.length; i++) {
    const n = lerNumero(ws, i);
    if (!n) continue;
    const prox = ws[n.ate + 1], ant = ws[i - 1];
    // "afio POR uma moeda", "vende PELO triplo": o por diante do número já é preço
    const porQuanto = !!ant && LEXICO_DO_JUIZ.porDoPreco.includes(ant.w);
    const entre = prox ? p.slice(ws[n.ate].fim, prox.ini) : "";
    const k = fraseDe(frases, ws[i].ini);
    const simbolo = ant && ant.w === "◉";
    const comMoeda = prox && /^\s*(?:de\s+)?$/.test(entre) && ehMoeda(prox.w, extra) ||
      (prox && prox.w === "de" && ws[n.ate + 2] && ehMoeda(ws[n.ate + 2].w, extra));
    if (simbolo || comMoeda) {
      // "desliza uma moeda entre os dedos" é gesto: o um só é preço com pista
      if (!simbolo && n.valor === 1 && !eco && !perguntou && !porQuanto && !fraseTem(k, pistas.filter((w) => !ehMoeda(w, extra)), false)) { i = n.ate; continue; }
      out.push({ valor: n.valor, ini: ws[i].ini, fim: (prox ? prox.fim : ws[n.ate].fim), forte: true, k });
      i = n.ate;
      continue;
    }
    if (eco) {
      // na frase do jogador basta o verbo de quem paga por perto: "pago as sete"
      const antes = ws.slice(Math.max(0, i - 3), i).map((x) => x.w);
      if (antes.some((w) => /^(pag|ofere|dou|deixo|entreg|cont[oa])/.test(w))) out.push({ valor: n.valor, ini: ws[i].ini, fim: ws[n.ate].fim, forte: false, k });
      i = n.ate;
      continue;
    }
    // sem moeda: só é preço com pista por perto e sem substantivo colado
    if ((ws[i].w === "um" || ws[i].w === "uma") && !(prox && prox.w === "cada")) { i = n.ate; continue; }
    if (ant && LEXICO_DO_JUIZ.antesQueNaoEPreco.includes(ant.w)) { i = n.ate; continue; }
    const fimDeOracao = !prox || /[.,;:!?…—"'”)]/.test(entre);
    const conectivo = prox && LEXICO_DO_JUIZ.depoisDoPreco.includes(prox.w);
    if (!(fimDeOracao || conectivo)) { i = n.ate; continue; }
    if (prox && LEXICO_DO_JUIZ.horas[prox.w]) { i = n.ate; continue; }
    if (!perguntou && !porQuanto && !fraseTem(k, pistas)) { i = n.ate; continue; }
    out.push({ valor: n.valor, ini: ws[i].ini, fim: ws[n.ate].fim, forte: false, k });
    i = n.ate;
  }
  return out;
}

/* o singular da palavra, para "Rações" casar com "ração" e "Odres" com "odre" */
const singular = (w) => w.replace(/oes$/, "ao").replace(/aes$/, "ao").replace(/ais$/, "al").replace(/eis$/, "el").replace(/ns$/, "m").replace(/([rz])es$/, "$1").replace(/s$/, "");
/* a cabeça do nome de uma coisa à venda ("Ataduras de Linho" → atadura):
   é ela que a prosa diz; as outras palavras do nome ("nome", "pedra") são
   cenário demais para casar sozinhas */
const cabecaDe = (nome) => (palavras(plano(nome)).map((x) => singular(x.w)).filter((w) => w.length >= 3 && !/^\d/.test(w) && !/^(o|a|os|as|um|uma)$/.test(w))[0] || "");
const textoDoAntes = (a) => lista(a).map((x) => String(x == null ? "" : x)).join("\n");

/* O que um valor em dinheiro está a pagar. Procura-se primeiro na ORAÇÃO
   do número ("rações a duas" é das rações, não das tochas da oração ao
   lado); não havendo coisa nenhuma ali, na frase inteira; e, quando a
   frase é só a resposta ("A corda, cinco.", "Duas moedas, se o dono
   estiver de bom humor." depois de "Cama na estalagem?"), na anterior. */
function oQuePaga(t, p, ws, frases, d, mercado) {
  const L = LEXICO_DO_JUIZ;
  const f = frases[d.k] || { ini: 0, fim: t.length };
  const corte = /[,;:—–()]/;
  let a = d.ini, b = d.fim;
  while (a > f.ini && !corte.test(t[a - 1])) a--;
  while (b < f.fim && !corte.test(t[b])) b++;
  // a oração que é só o número ("As ataduras, CINCO.") vem com a de antes
  const conteudo = (w) => w.length >= 4 && !L.naoSaoNome.includes(w) && !L.pistasDePreco.includes(w) && !L.moedas.includes(w) && !(w in L.numeros);
  const naOracao = ws.filter((x) => x.ini >= a && x.fim <= b && (x.fim <= d.ini || x.ini >= d.fim));
  let a0 = a;
  if (!naOracao.some((x) => conteudo(x.w))) { a0 = a - 1; while (a0 > f.ini && !corte.test(t[a0 - 1])) a0--; }
  const fAnt = frases[d.k - 1];
  const curta = palavras(p.slice(f.ini, f.fim)).length <= 6 || (fAnt && /\?\s*["'”’]?\s*$/.test(t.slice(fAnt.ini, fAnt.fim)));
  const zonas = [[Math.max(f.ini, a0), b], [f.ini, f.fim], ...(curta && fAnt ? [[fAnt.ini, f.fim]] : [])];
  for (let z = 0; z < zonas.length; z++) {
    const [i0, i1] = zonas[z];
    const txt = p.slice(i0, i1);
    const zona = ws.filter((x) => x.ini >= i0 && x.fim <= i1).map((x) => singular(x.w));
    const ids = PRECOS_COMUNS.filter((c) => c.rx.test(txt)).map((c) => c.id);
    const casou = mercado.filter((e) => (e.id && ids.includes(e.id)) || (cabecaDe(e.nome || "") && zona.includes(cabecaDe(e.nome))));
    if (casou.length) return { casou, chave: "m:" + casou.map((e) => e.nome).join("+") };
    const comum = PRECOS_COMUNS.find((c) => ids.includes(c.id));
    if (comum) return { comum, chave: "c:" + comum.id };
    const semPreco = Object.entries(L.coisasSemTabela).find(([, rx]) => rx.test(txt));
    if (semPreco) return { semPreco: semPreco[0], chave: "s:" + semPreco[0] };
    // na oração, a coisa dita colada ao número ("rações A duas", "a corda, cinco",
    // "afio POR uma") é a que se paga, e a mesa não a tem
    if (z === 0) {
      const iw = ws.findIndex((x) => x.ini >= d.ini);
      const w1 = ws[iw - 1], w2 = ws[iw - 2];
      const gap = w1 ? p.slice(w1.fim, ws[iw].ini) : "";
      if (w1 && conteudo(w1.w) && /^\s*,\s*$/.test(gap)) return { desconhecido: w1.w, chave: "d:" + singular(w1.w) };
      if (w1 && w2 && /^(a|por|pelo|pela)$/.test(w1.w) && conteudo(w2.w) && w2.ini >= Math.max(f.ini, a0)) return { desconhecido: w2.w, chave: "d:" + singular(w2.w) };
    }
  }
  return { chave: "" };
}

/* O preço. A ordem da decisão é a da mesa:
   1. o jogador disse o valor, ou uma resposta anterior já o dissera da
      mesma coisa → eco, não invenção nova;
   2. a coisa tem preço na mesa (a cabeça do nome, ou a comida comum de
      economia.js) → o valor tem de ser o dela, vezes a quantidade que a
      prosa ou o jogador dizem ("duas canecas"), ou a soma do que se
      nomeou ("tochas e corda: tudo, sete");
   3. a coisa é das que a mesa NÃO trouxe preço (a comida comum fora da
      pauta, a cama, a taxa, o câmbio, o serviço, o suborno) → inventado,
      com o nome do que falta, por mais que o número coincida com outro;
   4. nada se nomeou → só passa um valor que o sistema tenha EXATAMENTE
      (a recompensa, a dívida, o achado, a bolsa, um preço da mesa). */
function julgarPrecos(t, estado) {
  const T = TOLERANCIAS_DO_JUIZ.preco;
  const mercado = lista(estado.mercado).filter((e) => e && Number.isFinite(Number(e.preco)));
  const exatos = new Set([...mercado.map((e) => Number(e.preco)), ...lista(estado.valores).map((x) => Number(x && typeof x === "object" ? x.valor : x)).filter(Number.isFinite)]);
  if (Number.isFinite(Number(estado.bolsa))) exatos.add(Number(estado.bolsa));
  const ecos = new Set(dinheiroDe(estado.frase || "", { moeda: estado.moeda, eco: true }).map((x) => x.valor));
  // o que as respostas anteriores já disseram: o valor E a coisa; sem coisa, só a última
  const antes = lista(estado.antes).map((x) => String(x == null ? "" : x));
  const ditos = new Set();
  antes.forEach((a, n) => {
    const pa = plano(a), wa = palavras(pa), fa = frasesDe(a);
    for (const x of dinheiroDe(a, { moeda: estado.moeda })) {
      const q = oQuePaga(a, pa, wa, fa, x, mercado);
      if (q.chave) ditos.add(q.chave + "|" + x.valor);
      else if (n === antes.length - 1) ditos.add("?|" + x.valor);
    }
  });
  const perguntou = PERGUNTA_DE_PRECO.test(semAcento(estado.frase || "")) || LEXICO_DO_JUIZ.perguntaDePreco.test(semAcento(estado.frase || ""));
  const perto = (v, alvo) => Math.abs(v - alvo) <= Math.max(T.absoluta, T.relativa * alvo);
  const frases = frasesDe(t), p = plano(t), ws = palavras(p);
  // as quantidades que a prosa e o jogador dizem: "duas canecas" → caneca: 2
  const qtd = {};
  for (const txt of [p, plano(estado.frase || "")]) {
    const w2 = palavras(txt);
    for (let j = 1; j < w2.length; j++) {
      const n = lerNumero(w2, j - 1);
      if (n && n.ate === j - 1 && n.valor <= T.multiploAte) (qtd[singular(w2[j].w)] = qtd[singular(w2[j].w)] || new Set([1])).add(n.valor);
    }
  }
  const quantas = (e) => {
    const c = PRECOS_COMUNS.find((x) => x.id === e.id);
    const ks = Object.keys(qtd).filter((w) => w === cabecaDe(e.nome || "") || (c && c.rx.test(w)) || (c && c.rx.test(w + "s")));
    return [1, ...ks.flatMap((w) => [...qtd[w]])];
  };
  const achados = [], vistos = new Set();
  for (const d of dinheiroDe(t, { moeda: estado.moeda, perguntou })) {
    if (vistos.has(d.valor)) continue;
    vistos.add(d.valor);
    if (ecos.has(d.valor)) continue;
    const q = oQuePaga(t, p, ws, frases, d, mercado);
    if (ditos.has((q.chave || "?") + "|" + d.valor)) continue;
    const trecho = trechoDe(t, frases, d.k);
    if (q.casou) {
      const cabe = (e) => quantas(e).some((n) => perto(d.valor, n * Number(e.preco)));
      const soma = q.casou.reduce((s, e) => s + Math.max(...quantas(e)) * Number(e.preco), 0);
      if (q.casou.some(cabe) || (q.casou.length > 1 && perto(d.valor, soma))) continue;
      achados.push({ trecho, valor: d.valor, item: q.casou[0].nome, tabela: Number(q.casou[0].preco), motivo: `a mesa diz ◉ ${q.casou[0].preco} por ${q.casou[0].nome}, e a prosa diz ${d.valor}` });
      continue;
    }
    if (q.comum || q.semPreco || q.desconhecido) {
      const o = q.comum ? q.comum.nome : q.semPreco || q.desconhecido;
      achados.push({ trecho, valor: d.valor, item: o, tabela: null, motivo: `a mesa não deu preço de ${o} neste turno, e a prosa diz ${d.valor}` });
      continue;
    }
    if (exatos.has(d.valor)) continue;
    achados.push({ trecho, valor: d.valor, item: "", tabela: null, motivo: `nenhum valor da mesa é ${d.valor}` });
  }
  return achados;
}

/* ---------------- A DISTÂNCIA E O TEMPO ---------------- */

/* as afirmações de distância ou tempo: [{ horasViagem, horasRelogio, tipo, k, ini, fim }] */
function medidasDe(t) {
  const L = LEXICO_DO_JUIZ, p = plano(t), ws = palavras(p), frases = frasesDe(t), out = [];
  const zonaTem = (k, lst) => {
    for (let q = Math.max(0, k - 1); q <= Math.min(frases.length - 1, k + 1); q++) {
      const f = frases[q];
      if (f && palavras(p.slice(f.ini, f.fim)).some((x) => lst.includes(x.w))) return true;
    }
    return false;
  };
  for (let i = 0; i < ws.length; i++) {
    let n = lerNumero(ws, i), j, valor;
    // "meia hora", "meio dia"
    if (!n && (ws[i].w === "meia" || ws[i].w === "meio") && ws[i + 1] && L.horas[ws[i + 1].w]) n = { valor: 0.5, ate: i };
    if (!n) continue;
    j = n.ate + 1;
    valor = n.valor;
    const un = ws[j] && L.horas[ws[j].w];
    if (!un) { i = n.ate; continue; }
    // "um dia e meio", "hora e meia"
    if (ws[j + 2] && ws[j + 1].w === "e" && (ws[j + 2].w === "meio" || ws[j + 2].w === "meia")) { valor += 0.5; }
    const ant = ws[i - 1] ? ws[i - 1].w : "", ant2 = ws[i - 2] ? ws[i - 2].w : "", depois = ws[j + 1] ? ws[j + 1].w : "";
    const k = fraseDe(frases, ws[i].ini);
    // as horas do dia ("às duas horas") e os idiomas de um ("um dia", "uma noite", "um minuto")
    if (ant === "as" || ant === "a" && ws[j].w.startsWith("hora")) { i = j; continue; }
    let tipo;
    if (L.antesDoDecorrido.includes(ant) || L.antesDoDecorrido.includes(ant2) || L.depoisDoDecorrido.includes(depois)) tipo = "decorrido";
    else if (L.antesDoNarrado.includes(ant) || (ant === "de" && L.antesDoNarrado.includes(ant2)) || L.depoisDoNarrado.includes(depois)) tipo = "narrado";
    else if (["marcha", "caminho", "viagem", "estrada", "cavalgada", "distancia"].includes(ws[j + 2] ? ws[j + 2].w : "") && depois === "de") tipo = "viagem";
    else if (L.antesDoPorvir.includes(ant) || (ant === "a" && ant2 === "daqui")) tipo = "porvir";
    else if (zonaTem(k, L.pistasDeViagem) || un.relogio == null) tipo = "viagem";
    else tipo = "solto";
    if (tipo === "narrado") { i = j; continue; }
    // "pode ser em uma hora", "um dia volto": o um sem marcha é idioma
    if (n.valor === 1 && (tipo === "solto" || tipo === "porvir")) { i = j; continue; }
    if (n.valor === 1 && ws[j].w.startsWith("minuto") && tipo !== "viagem") { i = j; continue; }
    out.push({ valor, unidade: ws[j].w, horasViagem: valor * un.viagem, horasRelogio: un.relogio == null ? null : valor * un.relogio, tipo, k, ini: ws[i].ini, fim: ws[j].fim });
    i = j;
  }
  return out;
}

function julgarDistancias(t, estado) {
  const T = TOLERANCIAS_DO_JUIZ, L = LEXICO_DO_JUIZ;
  const frases = frasesDe(t), p = plano(t);
  const dist = lista(estado.distancias).filter((d) => d && typeof d === "object").map((d) => ({
    para: nomeDe(d),
    horas: Number.isFinite(Number(d.horas)) ? Number(d.horas) : Number.isFinite(Number(d.km)) ? Number(d.km) / KMH_A_PE : null,
  })).filter((d) => d.horas != null);
  const tempos = lista(estado.tempos).map((x) => (typeof x === "number" ? { o: "", horas: x } : x && typeof x === "object" ? { o: nomeDe(x), horas: Number(x.horas) } : null)).filter((x) => x && Number.isFinite(x.horas));
  // o eco da distância é o do jogador e o da ÚLTIMA resposta: "há dois dias" de outra pessoa, dez turnos atrás, é outra afirmação
  const ultima = lista(estado.antes).slice(-1).map((x) => String(x == null ? "" : x)).join("");
  const ecos = [...medidasDe(estado.frase || ""), ...medidasDe(ultima)];
  const perto = (v, alvo, tol) => Math.abs(v - alvo) <= Math.max(tol.absolutaHoras, tol.relativa * alvo);
  const achados = [], vistos = new Set();
  for (const m of medidasDe(t)) {
    const chave = m.tipo + "|" + m.valor + m.unidade;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    if (ecos.some((e) => e.valor === m.valor && e.unidade.replace(/s$/, "") === m.unidade.replace(/s$/, ""))) continue;
    const zona = p.slice((frases[Math.max(0, m.k - 1)] || frases[m.k]).ini, (frases[m.k] || {}).fim);
    let ok = false, sistema = null, motivo = "";
    if (m.tipo === "viagem" || m.tipo === "solto") {
      const nomeada = dist.filter((d) => d.para && zona.includes(semAcento(d.para)));
      // a resposta à pergunta do jogador ("a distância até o Santuário") é sobre o sítio que ELE nomeou
      const pedido = !nomeada.length && L.perguntaDeDistancia.test(semAcento(estado.frase || ""))
        ? nomesDe(estado.frase || "").map((n) => n.nome).filter((n) => !L.naoSaoNome.includes(semAcento(n))) : [];
      const doPedido = pedido.length ? dist.filter((d) => d.para && pedido.some((n) => semAcento(d.para).includes(semAcento(n)) || semAcento(n).includes(semAcento(d.para)))) : null;
      const alvo = nomeada.length ? nomeada : doPedido && pedido.length ? doPedido : dist;
      ok = alvo.some((d) => perto(m.horasViagem, d.horas, T.distancia));
      // o "solto" pode ser também um tempo do relógio que o sistema deu
      if (!ok && m.tipo === "solto" && m.horasRelogio != null) ok = tempos.some((x) => perto(m.horasRelogio, x.horas, T.tempo));
      sistema = alvo.length ? alvo.map((d) => `${d.para ? d.para + " " : ""}${Math.round(d.horas * 10) / 10} h`).join(" · ") : null;
      motivo = alvo.length ? `o mapa diz ${sistema}, e a prosa diz ${m.valor} ${m.unidade}` : `o mapa não deu distância nenhuma neste turno, e a prosa diz ${m.valor} ${m.unidade}`;
    } else {
      ok = m.horasRelogio != null && tempos.some((x) => perto(m.horasRelogio, x.horas, T.tempo));
      sistema = tempos.length ? tempos.map((x) => `${x.o ? x.o + " " : ""}${x.horas} h`).join(" · ") : null;
      motivo = tempos.length ? `o relógio do sistema diz ${sistema}, e a prosa diz ${m.tipo === "decorrido" ? "há " : "em "}${m.valor} ${m.unidade}` : `o sistema não sabe ${m.tipo === "decorrido" ? "há quanto tempo" : "daqui a quanto"}, e a prosa diz ${m.valor} ${m.unidade}`;
    }
    if (ok) continue;
    achados.push({ trecho: trechoDe(t, frases, m.k), valor: m.valor, unidade: m.unidade, tipo: m.tipo === "solto" ? "viagem" : m.tipo, horas: Math.round((m.tipo === "decorrido" || m.tipo === "porvir" ? m.horasRelogio : m.horasViagem) * 100) / 100, sistema, motivo });
  }
  return achados;
}

/* ---------------- A GENTE E OS LUGARES ---------------- */

/* as sequências com maiúscula: "Nyla Punho-de-Pedra", "Bjorn o Andarilho", "Kira do Vale" */
function nomesDe(t) {
  const rx = /\p{Lu}[\p{L}'’]*(?:-\p{L}+)*(?:\s+(?:(?:da|do|de|dos|das|o|a|&|&\s+o|&\s+a)\s+)?\p{Lu}[\p{L}'’]*(?:-\p{L}+)*)*/gu;
  const out = [];
  let m;
  while ((m = rx.exec(t))) {
    let s = m[0], ini = m.index;
    // tira da frente o que não é nome ("Mas Rurik", "Você Rurik")
    let partes = s.split(/\s+/);
    while (partes.length && LEXICO_DO_JUIZ.naoSaoNome.includes(semAcento(partes[0]))) {
      const tira = partes.shift();
      ini += tira.length;
      while (t[ini] === " ") ini++;
    }
    // e os conectivos que ficaram pendurados
    while (partes.length && /^(da|do|de|dos|das|o|a)$/.test(partes[0])) { ini += partes.shift().length + 1; }
    while (partes.length && /^(da|do|de|dos|das|o|a)$/.test(partes[partes.length - 1])) partes.pop();
    if (!partes.length) continue;
    s = partes.join(" ");
    out.push({ nome: s, ini, fim: ini + s.length });
  }
  return out;
}

const tokensDoNome = (s) => palavras(plano(s)).map((x) => x.w).filter((w) => !/^(da|do|de|dos|das|o|a|e)$/.test(w));

/* o começo da frase: só o espaço, a aspa ou o travessão antes */
function noComeco(t, ini) {
  let i = ini - 1;
  while (i >= 0 && /[\s"'“”«»—–(-]/.test(t[i])) i--;
  return i < 0 || /[.!?…:\n]/.test(t[i]);
}

function julgarNomes(t, estado) {
  const L = LEXICO_DO_JUIZ, T = TOLERANCIAS_DO_JUIZ;
  const conhecidos = [
    ...lista(estado.emCena), ...lista(estado.gente), ...lista(estado.grupo), ...lista(estado.nomesAMao),
    ...lista(estado.heroi), ...lista(estado.lugares), ...lista(estado.outros),
  ].map(nomeDe).filter(Boolean);
  const pautaSabe = typeof estado.pauta === "string" ? oQueAPautaSabe(estado.pauta) : null;
  if (pautaSabe) conhecidos.push(...pautaSabe.gente, ...pautaSabe.lugares);
  if (estado.moeda) conhecidos.push(String(estado.moeda));
  const conhecidas = new Set(conhecidos.flatMap(tokensDoNome));
  /* O QUE ESTÁ À VENDA É DO SISTEMA (28/10, a prova viva da v9.531): o
     «Elixir de Destreza» da banca da cena saía como gente nova, e a correção
     do Juiz tirava-o do cânone — o portão mordia a verdade. O nome do
     mercado (o do turno e o que a pauta disse) conta como conhecido pelo
     nome INTEIRO ou pela cabeça dele («o Elixir»), não palavra a palavra:
     «Destreza» não passa a ser o nome de ninguém por estar num frasco. */
  const doMercado = [...lista(estado.mercado), ...(pautaSabe ? pautaSabe.mercado : [])].map(nomeDe).filter(Boolean).map((n) => semAcento(tokensDoNome(n).join(" "))).filter(Boolean);
  const aVenda = (inteiro) => doMercado.some((k) => inteiro === k || inteiro.includes(k) || k.startsWith(inteiro + " "));
  const conhecidosInteiros = conhecidos.map((n) => tokensDoNome(n).join(" "));
  const ecoT = [estado.frase, textoDoAntes(estado.antes)].filter(Boolean).join(" \n ");
  const p = plano(t), fala = mapaDaFala(t), frases = frasesDe(t);
  const lowerWords = new Set((t.match(/(?<![\p{L}])\p{Ll}[\p{L}]*/gu) || []).map(semAcento));
  const candidatos = nomesDe(t);
  const meioDaFrase = new Set(candidatos.filter((c) => !noComeco(t, c.ini)).flatMap((c) => tokensDoNome(c.nome)));
  const pessoas = [], nomes = [], lugares = [], vistos = new Set();
  for (const c0 of candidatos) {
    // "Levar Dolmen": a primeira palavra só tem maiúscula por abrir a frase
    let c = c0;
    const [w0, w1] = c.nome.split(/\s+/);
    if (w1 && /^\p{Lu}/u.test(w1) && !L.epiteto.test(w1) && noComeco(t, c.ini) && !meioDaFrase.has(semAcento(w0)) && !L.titulos.includes(semAcento(w0))) {
      const ini = c.ini + c.nome.indexOf(w1, w0.length);
      c = { nome: c.nome.slice(ini - c.ini), ini, fim: c.fim };
    }
    const toks = tokensDoNome(c.nome).filter((w) => !L.titulos.includes(w));
    if (!toks.length) continue;
    const chave = toks.join(" ");
    if (vistos.has(chave)) continue;
    // conhecido se alguma palavra do nome é de alguém (ou de algum sítio) do sistema
    // conhecido se o nome inteiro é de alguém (ou de algum sítio) do sistema, ou se uma
    // palavra DELE o é — a palavra própria, não o substantivo de sítio nem o número:
    // "Nyla" é a Nyla Punho-de-Pedra; "Três Pedras" não é o Alto das Pedras
    const propria = toks.filter((w) => !L.nomesDeLugar.includes(w) && !(w in L.numeros));
    const inteiro = semAcento(toks.join(" "));
    if (propria.some((w) => conhecidas.has(w)) || conhecidosInteiros.some((k) => k.includes(inteiro)) || aVenda(inteiro)) { vistos.add(chave); continue; }
    if (toks.every((w) => w.length < T.nomeMinimo)) continue;
    // a palavra só tem maiúscula por abrir a frase, e o texto a usa em minúscula: não é nome
    const umaSo = toks.length === 1 && c.nome.split(/\s+/).length === 1;
    if (umaSo && (L.naoSaoNome.includes(toks[0]) || toks[0] in L.numeros)) continue;
    // a palavra que só tem maiúscula por abrir a frase ("Fechado.", "Saiu há
    // dois dias", "Mercadores gritam") não é nome: o português abre a frase
    // com verbo e com substantivo sem artigo a toda a hora. Nome é o que a
    // prosa escreve com maiúscula também no MEIO de uma frase — "Atrás
    // dela, Rurik se aproxima", "Ele se chama Dolmen".
    if (umaSo && noComeco(t, c.ini) && (lowerWords.has(toks[0]) || !meioDaFrase.has(toks[0]))) continue;
    // eco: o jogador (ou uma resposta anterior) já o disse, com a mesma maiúscula
    const nomeLimpo = c.nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp("(?<![\\p{L}])" + nomeLimpo + "(?![\\p{L}])", "u").test(ecoT)) { vistos.add(chave); continue; }
    vistos.add(chave);
    // o que vem antes de uma pontuação não é do nome ("Na taverna, Rurik…")
    const janela = p.slice(Math.max(0, c.ini - 40), c.ini);
    let corte = janela.length;
    while (corte > 0 && !L.separaDoSitio.test(janela[corte - 1])) corte--;
    const antes = palavras(janela.slice(corte)).map((x) => x.w);
    const prev = antes[antes.length - 1] || "", prev2 = antes[antes.length - 2] || "";
    const primeira = toks[0];
    // "As Três Pedras": o número na frente e o substantivo de sítio atrás
    const ehLugar = L.nomesDeLugar.includes(primeira) || L.nomesDeLugar.includes(prev) ||
      (primeira in L.numeros && toks.some((w) => L.nomesDeLugar.includes(w))) ||
      (L.preposicoesDeLugar.includes(prev) && prev !== "a" && prev !== "ao") || (prev === "de" && L.nomesDeLugar.includes(prev2));
    const k = fraseDe(frases, c.ini);
    const trecho = trechoDe(t, frases, k);
    if (ehLugar) { lugares.push({ trecho, nome: c.nome, dito: !!fala[c.ini], motivo: `o mapa não tem "${c.nome}"` }); continue; }
    // presença: a narração o põe em cena, ou ele se apresenta numa fala
    const todas = [];
    let i0 = -1;
    while ((i0 = t.indexOf(c.nome, i0 + 1)) >= 0) todas.push(i0);
    const naNarracao = todas.some((i) => !fala[i]);
    const seApresenta = todas.some((i) => L.apresentacao.some((rx) => rx.test(p.slice(Math.max(0, i - 24), i))));
    if (naNarracao || seApresenta) pessoas.push({ trecho, nome: c.nome, motivo: `${c.nome} ${seApresenta ? "apresenta-se" : "age"} em cena e não está no EM CENA nem no registo` });
    else nomes.push({ trecho, nome: c.nome, motivo: `${c.nome} é dito de passagem e o sistema não o tem (menção, não presença)` });
  }
  return { pessoas, nomes, lugares };
}

/* O sítio sem nome que a prosa inventa. Duas espécies, e a régua de cada
   uma é diferente, porque "menção não é presença" vale também para lugar:
   · o ESCONDIDO (alçapão, porão, duto, túnel): a palavra rara que, dita,
     dá ao lugar um cômodo que ele não tinha ("Abriu a tampa do alçapão
     que eu jurava que ninguém sabia que existia"). Conta sempre que o
     lugar não o tem.
   · o ESTABELECIMENTO (estalagem, banca, tenda): é cenário a toda a hora
     ("uma banca de tábuas grossas", "a taverna"). Só conta quando a prosa
     o FIXA num sítio — com artigo definido, numa moldura de lugar ("por
     trás da", "está na", "para a"), e com um qualificador que o torna UM
     lugar ("a estalagem TORTA", "a banca DOS PEIXES") — ou quando a cena
     entra num estabelecimento de um tipo que a cidade não tem. A banca
     sem mais nada, numa cidade com mercado, é do mercado. */
function julgarEstabelecimentos(t, estado) {
  const L = LEXICO_DO_JUIZ;
  const p = plano(t), ws = palavras(p), fala = mapaDaFala(t), frases = frasesDe(t);
  const pautaSabe = typeof estado.pauta === "string" ? oQueAPautaSabe(estado.pauta) : null;
  const sabidos = [...lista(estado.lugares), ...(pautaSabe ? pautaSabe.lugares : [])].map((x) => plano(nomeDe(x)));
  const tipos = new Set(lista(estado.lugares).map((x) => x && x.tipo).filter(Boolean).map(semAcento));
  const doTipo = new Set([...tipos].flatMap((tp) => L.lugarDoTipo[tp] || [tp]));
  const papeis = new Set(lista(estado.papeis).flatMap((x) => palavras(plano(x)).map((y) => y.w.replace(/s$/, ""))));
  const gente = new Set([...lista(estado.gente), ...lista(estado.emCena), ...lista(estado.grupo), ...lista(estado.heroi)].map(nomeDe).flatMap((n) => palavras(plano(n)).map((y) => y.w)));
  const ecoP = plano([estado.frase, textoDoAntes(estado.antes)].filter(Boolean).join(" \n "));
  const out = [], vistos = new Set();
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i].w;
    const escondido = L.escondidos.includes(w);
    if (!escondido && !L.estabelecimentos.includes(w)) continue;
    const prev = ws[i - 1] ? ws[i - 1].w : "";
    // "rato de esgoto", "cheiro de porão": a palavra qualifica outra coisa
    if (escondido && prev === "de") continue;
    // "a estalagem O Machado e a Rosa": o nome é do outro detector
    if (/^\s+\p{Lu}/u.test(t.slice(ws[i].fim, ws[i].fim + 3))) continue;
    // o qualificador: "dos peixes", "da chave", ou um adjetivo da tabela
    let qual = "";
    const n1 = ws[i + 1], n2 = ws[i + 2], gap1 = n1 ? p.slice(ws[i].fim, n1.ini) : ".";
    if (n1 && !/[.,;:!?…—"'”]/.test(gap1)) {
      if (/^(de|do|da|dos|das)$/.test(n1.w) && n2 && !/^(um|uma|uns|umas|o|a|os|as)$/.test(n2.w)) qual = n2.w;
      else if (L.qualificadores.includes(n1.w)) qual = n1.w;
    }
    const nome = w + (qual ? (L.qualificadores.includes(qual) ? " " + qual : ` ${n1.w} ${qual}`) : "");
    if (vistos.has(nome)) continue;
    vistos.add(nome);
    // eco: o mesmo sítio, dito igual ("estalagem torta"), já estava na frase ou numa resposta de antes
    // (a "banca de peixes" é a "banca dos peixes" de ontem: o conectivo não conta)
    const mesmo = qual && !L.qualificadores.includes(qual) ? new RegExp("\\b" + w + "\\s+d[aeo]s?\\s+" + qual + "\\b") : null;
    if (qual ? (mesmo ? mesmo.test(ecoP) : ecoP.includes(nome)) : ecoP.includes(w)) continue;
    // "a banca da Nyla": o dono com nome, e o sistema conhece-o
    const doDono = qual && n2 && /^\s+\p{Lu}/u.test(t.slice(n1.fim, n1.fim + 3)) && gente.has(qual);
    const sabe = doDono || sabidos.some((s) => s.includes(w) && (!qual || s.includes(qual))) ||
      (qual && (papeis.has(qual.replace(/s$/, "")) || sabidos.some((s) => s.includes(qual)))) ||
      (!qual && !escondido && doTipo.has(w));
    if (sabe) continue;
    const antes = ws.slice(Math.max(0, i - 4), i).map((x) => x.w);
    if (!escondido) {
      if (L.indefinidos.includes(prev)) continue;
      if (qual) {
        if (!antes.some((x) => L.molduraDeLugar.includes(x))) continue;
      } else {
        // sem qualificador: só a cena que ENTRA, na narração, num tipo que a cidade não tem
        if (fala[ws[i].ini]) continue;
        if (!ws.slice(Math.max(0, i - 6), i).some((x) => L.verbosDeEntrada.includes(x.w))) continue;
      }
    }
    const k = fraseDe(frases, ws[i].ini);
    out.push({ trecho: trechoDe(t, frases, k), nome, dito: !!fala[ws[i].ini], motivo: `${nome}: o lugar não tem${escondido ? " este cômodo" : ""}, e a prosa ${fala[ws[i].ini] ? "fala dele como se tivesse" : "põe a cena nele"}` });
  }
  return out;
}

/* ---------------- A PAUTA ---------------- */

/* O que uma pauta enviada sabe, lida de volta do texto: o mercado ("caneca
   de cerveja ◉ 2"), as distâncias ("(a sudeste, 25 km), a 4 h de marcha";
   "DAQUI Serra do Bode (6,6 km, 2,1 h)"), a gente (EM CENA, NOMES À MÃO,
   quem está longe), os lugares (ONDE), os tempos do DESFECHO ("acorda em
   3 horas") e os fatos que têm de entrar ("(é fato: entra nesta
   resposta)", PERGUNTOU). É a porta pela qual a fiação passa a verdade do
   turno ao Juiz sem montar o estado à mão. */
export function oQueAPautaSabe(texto) {
  const t = String(texto == null ? "" : texto);
  const out = { mercado: [], distancias: [], gente: [], lugares: [], tempos: [], fatos: [] };
  if (!t.trim()) return out;
  let rotulo = "";
  for (const linha0 of t.split("\n")) {
    // o rótulo é a coluna de maiúsculas no começo da linha ("PERGUNTOU Petra…",
    // "EM CENA   Capanga…"); a linha que começa com espaço continua o de cima
    const m0 = linha0.match(/^([A-ZÀ-Ý]+(?: [A-ZÀ-Ý]+)*)\s+(\S.*)$/);
    const m = m0 && m0[1].length >= 4 && !/^\p{Lu}+$/u.test(m0[2].split(/\s/)[0]) ? m0 : null;
    if (m) rotulo = m[1].trim();
    const linha = m ? m[2] : linha0.trim();
    if (!linha || /^\[/.test(linha)) continue;
    // o mercado: "nome ◉ N" (o nome é o pedaço antes do ◉, depois do último separador)
    for (const mm of linha.matchAll(/([^◉·:;,()\]]{2,60}?)\s*◉\s*(\d+)/g)) {
      const nome = mm[1].replace(/^.*?(?:\bà venda|\bna rua|\bpor)\b[:,]?\s*/i, "").replace(/^\s*(?:\d+\s*×\s*)?/, "").trim();
      out.mercado.push({ nome, preco: Number(mm[2]) });
    }
    // a distância: "(..., 25 km)", "4 h de marcha", "(6,6 km, 2,1 h)"
    const km = linha.match(/(\d+(?:[.,]\d+)?)\s*km\b/), h = linha.match(/(\d+(?:[.,]\d+)?)\s*h\b(?!\w)/);
    if (km || h) {
      const lugar = (linha.match(/(?:em|DAQUI|daqui|até|para)\s+(\p{Lu}[\p{L}'’-]*(?:\s+(?:(?:da|do|de|dos|das)\s+)?\p{Lu}[\p{L}'’-]*)*)/u) || [])[1] || "";
      out.distancias.push({ para: lugar, km: km ? Number(km[1].replace(",", ".")) : undefined, horas: h ? Number(h[1].replace(",", ".")) : undefined });
    }
    // o tempo do desfecho: "acorda em 3 horas"
    for (const mm of linha.matchAll(/\b(?:em|há|ha|daqui a)\s+(\d+)\s*(horas?|dias?|h)\b/g)) {
      out.tempos.push({ o: rotulo.toLowerCase(), horas: Number(mm[1]) * (/^d/.test(mm[2]) ? 24 : 1) });
    }
    // os fatos que têm de entrar
    if (LEXICO_DO_JUIZ.marcaDoFato.test(plano(linha)) || rotulo === "PERGUNTOU") out.fatos.push(linha.replace(/\s+/g, " ").trim());
    // a gente e os lugares
    if (rotulo === "EM CENA" || /a quem não tem nome:/.test(linha)) {
      for (const pedaco of linha.replace(/a quem não tem nome:/, "·").split(/[·;]/)) {
        const n = pedaco.replace(/\((?:ele|ela)\)/g, "").trim();
        if (n) out.gente.push(n);
      }
    }
    // o ONDE: "no poço, dentro das Celas Trêmulas, dentro de Ponte Brumoso · ensolarado", "em Nova clara (Campos do Corvo)"
    if (rotulo === "ONDE") {
      for (const pedaco of linha.split(/[·()]|,|\bdentro d[eoa]s?\b/)) {
        const n = pedaco.trim().replace(/^(em|no|na|nos|nas|ao|à|o|a)\s+/i, "").trim();
        if (n && /\p{Lu}/u.test(n) && !/^⌖/.test(n)) out.lugares.push(n);
      }
    }
    // e todo nome que a pauta diz é do sistema (a ESPINHA, o DESFECHO, quem está longe)
    else for (const n of nomesDe(linha)) if (!/^[A-ZÀ-Ý]+$/.test(n.nome)) out.gente.push(n.nome);
    for (const mm of linha.matchAll(/(\p{Lu}[\p{L}'’-]*(?:\s+(?:(?:da|do|de|dos|das|o|a)\s+)?\p{Lu}[\p{L}'’-]*)*)\s+está em\s+(\p{Lu}[\p{L}'’-]*(?:\s+(?:(?:da|do|de|dos|das)\s+)?\p{Lu}[\p{L}'’-]*)*)/gu)) {
      out.gente.push(mm[1]);
      out.lugares.push(mm[2]);
    }
  }
  return out;
}

/* o fato da pauta entrou? Entra se os números dele estão na prosa (por
   extenso ou em dígitos) e, quando ele nomeia alguém, o nome também */
function julgarPauta(t, estado) {
  const pautaSabe = typeof estado.pauta === "string" ? oQueAPautaSabe(estado.pauta) : null;
  const fatos = [...lista(estado.fatos), ...(pautaSabe ? pautaSabe.fatos : [])].map(nomeDe).filter(Boolean);
  if (!fatos.length) return null;
  const nums = new Set(numerosNoTexto(t));
  const dinheiro = new Set(dinheiroDe(t, { moeda: estado.moeda, perguntou: true }).map((x) => x.valor));
  const p = plano(t);
  const faltaram = [];
  let cumpridos = 0;
  for (const f of fatos) {
    const sem = f.replace(/\(é fato[^)]*\)/, "");
    // o preço tem de entrar COMO preço (◉ 2 não se cumpre com "dois nomes");
    // os dias e as horas, como número
    const precos = [...sem.matchAll(/◉\s*(\d+)|(\d+)\s*moedas?\b/g)].map((m) => Number(m[1] || m[2]));
    const ns = [...sem.matchAll(/(\d+)\s*(?:dias|horas|km|h)\b/g)].map((m) => Number(m[1]));
    const quem = nomesDe(sem).map((n) => tokensDoNome(n.nome).filter((w) => w.length >= 3 && !LEXICO_DO_JUIZ.naoSaoNome.includes(w))).filter((x) => x.length);
    const faltaN = [...precos.filter((n) => !dinheiro.has(n)), ...ns.filter((n) => !nums.has(n))];
    const faltaQ = quem.length && !quem.some((ts) => ts.some((w) => new RegExp("\\b" + w + "\\b").test(p))) ? quem[0].join(" ") : "";
    if (!faltaN.length && !faltaQ) { cumpridos++; continue; }
    faltaram.push({ fato: f, falta: [...faltaN.map((n) => "◉ " + n), ...(faltaQ ? [faltaQ] : [])].join(" · "), motivo: `a pauta mandou entrar "${f.slice(0, 80)}", e a prosa não diz ${faltaN.length ? faltaN.join(", ") : faltaQ}` });
  }
  return { total: fatos.length, cumpridos, faltaram };
}

/* ---------------- O VEREDITO ---------------- */

/* julgarAProsa(prosa, estado) → o veredito de um turno.

   `estado` (tudo opcional; `null` vale `{}`):
     frase      o que o jogador escreveu (o eco não é invenção)
     antes      a resposta anterior (a repetição não é invenção nova)
     moeda      o nome do dinheiro da campanha ("escamas")
     heroi, grupo, emCena, gente, nomesAMao, outros   — quem existe
     lugares    [nome | { nome, tipo }] — o mapa e os locais
     mercado    [{ nome, preco, id? }] — o preço que o sistema sabe
     valores    [n] — outros valores em dinheiro do sistema (recompensa, dívida)
     bolsa      n
     distancias [{ para, horas?, km? }]
     tempos     [{ o, horas }] — há quanto / daqui a quanto que o sistema sabe
     fatos      [texto] — o que tinha de entrar
     pauta      o texto da pauta enviada (lido por oQueAPautaSabe e somado)

   Devolve { precosInventados, distanciasFora, pessoasNovas, nomesNovos,
   lugaresNovos, pautaCumprida, achados, limpa } — cada achado com
   `trecho` (a frase da prosa) e `motivo`. */
export function julgarAProsa(prosa, estado) {
  const t = String(prosa == null ? "" : prosa);
  const e0 = estado && typeof estado === "object" ? estado : {};
  const ps = typeof e0.pauta === "string" ? oQueAPautaSabe(e0.pauta) : null;
  const e = ps ? {
    ...e0,
    mercado: [...lista(e0.mercado), ...ps.mercado],
    distancias: [...lista(e0.distancias), ...ps.distancias],
    tempos: [...lista(e0.tempos), ...ps.tempos],
  } : e0;
  const vazio = { precosInventados: [], distanciasFora: [], pessoasNovas: [], nomesNovos: [], lugaresNovos: [], pautaCumprida: null, achados: 0, limpa: true };
  if (!t.trim()) return { ...vazio, pautaCumprida: julgarPauta("", e) };
  const precosInventados = julgarPrecos(t, e);
  const distanciasFora = julgarDistancias(t, e);
  const { pessoas, nomes, lugares } = julgarNomes(t, e);
  const lugaresNovos = [...lugares, ...julgarEstabelecimentos(t, e)];
  const pautaCumprida = julgarPauta(t, e);
  const achados = precosInventados.length + distanciasFora.length + pessoas.length + nomes.length + lugaresNovos.length + (pautaCumprida ? pautaCumprida.faltaram.length : 0);
  return { precosInventados, distanciasFora, pessoasNovas: pessoas, nomesNovos: nomes, lugaresNovos, pautaCumprida, achados, limpa: achados === 0 };
}
