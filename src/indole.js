/* ============================================================
   A ÍNDOLE (v9.136) — quem a pessoa É

   Três módulos, três perguntas, e faltava a primeira:

     indole.js      quem ela É
     interprete.js  o que ela FAZ
     falas.js       o que ela DIZ

   Até aqui a personalidade de alguém era UMA STRING solta — um `traco`
   sorteado de uma lista, mais um `modo` e uma `vontade`. E os vetos que
   governam o que ela nunca faz saíam de REGEX em cima dessa string: quem
   tivesse "reservado" no traço não entregava, quem tivesse "covarde" não
   ameaçava. Funcionava por acidente de vocabulário — bastava a lista de
   traços mudar uma palavra para metade dos vetos calar.

   Agora a índole é estrutura, nasce com o mundo e é determinística: a mesma
   semente dá a mesma pessoa, com os mesmos medos e o mesmo propósito.

   ---------------- O CUIDADO COM O PROPÓSITO ----------------

   "Trair o herói" é a ideia mais forte da lista e a mais fácil de estragar.
   Um propósito que seja só uma etiqueta que o Narrador lê é adjetivo — a
   quinta lei da casa —, e adjetivo devolve a decisão para a IA.

   Então todo propósito daqui tem TRÊS partes obrigatórias:

     · o que ele é;
     · o que o faz AMADURECER, e isso o sistema confere (dias de convívio,
       favores recebidos, um segredo que ela soube, o laço que cresceu);
     · e o que muda no mundo quando ele acontece.

   Um propósito sem as três não entra na tabela. É por isso que a lista é
   curta: cada linha dela precisou de um jeito de conferir.

   ---------------- TRAÇO QUE BRIGA NÃO CONVIVE ----------------

   Uma pessoa tem de um a três traços, e nenhum deles pode brigar com outro.
   Corajoso e medroso na mesma cabeça não é complexidade — é ruído, e o ator
   que receber os dois vai escolher um por sorteio, que é exatamente o que
   este arquivo existe para impedir.
   ============================================================ */
import { rngDe } from "./geografia.js";

const pick = (rnd, a) => a[Math.floor(rnd() * a.length)];
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- OS TRAÇOS ----------------
   `nunca` fala o vocabulário do Intérprete: são os gestos que esta pessoa
   não faz, e é assim que a índole governa o que já existia sem depender de
   regex em cima de prosa. `puxa` é o contrário — o que ela faz demais. */
export const TRACOS = [
  { id: "corajoso", nome: "corajoso", o: "põe o corpo onde os outros recuam", briga: ["medroso"], nunca: ["recua"], puxa: ["protege"] },
  { id: "medroso", nome: "medroso", o: "calcula a saída antes de entrar", briga: ["corajoso"], nunca: ["ameaca", "protege"], puxa: ["esquiva"] },
  { id: "fiel", nome: "fiel", o: "não abandona quem confiou nele", briga: ["traidor"], nunca: ["entrega"], puxa: ["protege"] },
  { id: "traidor", nome: "de fé curta", o: "serve enquanto serve a ele", briga: ["fiel"], nunca: ["protege"], puxa: ["entrega"] },
  { id: "galanteador", nome: "galanteador", o: "flerta como quem cumprimenta", briga: ["calado", "medonho"], nunca: [], puxa: ["aproxima"] },
  { id: "calado", nome: "calado", o: "fala o mínimo e olha o resto", briga: ["galanteador", "tagarela"], nunca: ["entrega", "aproxima"], puxa: ["observa"] },
  { id: "tagarela", nome: "tagarela", o: "enche o silêncio antes que ele exista", briga: ["calado", "frio"], nunca: [], puxa: ["entrega"] },
  { id: "medonho", nome: "medonho", o: "faz o ar pesar quando entra", briga: ["galanteador", "brincalhao"], nunca: ["aproxima"], puxa: ["ameaca"] },
  { id: "ganancioso", nome: "ganancioso", o: "põe preço em tudo, inclusive em favor", briga: ["generoso"], nunca: ["entrega"], puxa: ["cobra"] },
  { id: "generoso", nome: "generoso", o: "dá antes de perguntar se pode", briga: ["ganancioso", "invejoso"], nunca: ["cobra"], puxa: ["entrega"] },
  { id: "orgulhoso", nome: "orgulhoso", o: "não diminui na frente de ninguém", briga: ["humilde"], nunca: ["recua"], puxa: ["ameaca"] },
  { id: "humilde", nome: "humilde", o: "aceita ser pequeno sem sofrer com isso", briga: ["orgulhoso", "teimoso", "vaidoso"], nunca: ["ameaca"], puxa: ["recua"] },
  { id: "cruel", nome: "cruel", o: "acha graça no que dói nos outros", briga: ["compassivo"], nunca: ["protege"], puxa: ["ameaca"] },
  { id: "compassivo", nome: "compassivo", o: "não passa por cima de quem caiu", briga: ["cruel"], nunca: ["ameaca"], puxa: ["protege"] },
  { id: "curioso", nome: "curioso", o: "pergunta o que não lhe cabe", briga: ["desconfiado"], nunca: ["esquiva"], puxa: ["aproxima"] },
  { id: "supersticioso", nome: "supersticioso", o: "lê sinal em tudo e obedece a todos", briga: ["pratico"], nunca: [], puxa: ["esquiva"] },
  { id: "rancoroso", nome: "rancoroso", o: "guarda o que lhe fizeram, com data", briga: [], nunca: ["entrega"], puxa: ["cobra"] },
  /* ---------------- v9.168: A MESA FARTA ----------------
     Dezessete traços davam elenco repetido na segunda cidade. Os oito
     novos falam o mesmo vocabulário do Intérprete (gestos que existem)
     e declaram as próprias brigas — a lei do traço-que-não-convive vale
     para eles como para os velhos. */
  { id: "teimoso", nome: "teimoso", o: "não muda de ideia nem com prova na mesa", briga: ["humilde"], nunca: ["recua"], puxa: ["testa"] },
  { id: "desconfiado", nome: "desconfiado", o: "procura o anzol em toda isca", briga: ["curioso"], nunca: ["entrega"], puxa: ["testa"] },
  { id: "vaidoso", nome: "vaidoso", o: "se arruma até para dormir e sabe quem olhou", briga: ["humilde"], nunca: ["recua"], puxa: ["aproxima"] },
  { id: "pratico", nome: "prático", o: "resolve primeiro e sente depois", briga: ["supersticioso", "sonhador"], nunca: ["cala"], puxa: ["oferece"] },
  { id: "sonhador", nome: "sonhador", o: "fala do que ainda não existe como se existisse", briga: ["pratico"], nunca: ["cobra"], puxa: ["oferece"] },
  { id: "invejoso", nome: "invejoso", o: "mede o que os outros têm antes de cumprimentar", briga: ["generoso"], nunca: ["protege"], puxa: ["testa"] },
  { id: "brincalhao", nome: "brincalhão", o: "faz graça inclusive na hora errada", briga: ["medonho"], nunca: ["ameaca"], puxa: ["aproxima"] },
  { id: "frio", nome: "de gelo", o: "não se abala e não comemora", briga: ["tagarela"], nunca: ["aproxima"], puxa: ["cala"] },
];
export function tracoPorId(id) { return TRACOS.find((t) => t.id === id) || null; }

export function compativel(a, b) {
  const A = tracoPorId(a), B = tracoPorId(b);
  if (!A || !B || A.id === B.id) return false;
  return !A.briga.includes(B.id) && !B.briga.includes(A.id);
}

/* ---------------- OS MEDOS ----------------
   Medo só vale se o sistema souber QUANDO ele acorda. Cada um traz o que o
   desperta — um nome de bicho na cena, uma luta em curso, a noite —, e o que
   a pessoa faz quando acorda. Medo que não acorda nunca é adjetivo. */
export const MEDOS = [
  { id: "feras", do: "feras", acorda: /lobo|urso|matilha|fera|javali|felino|pantera|tigre/i, faz: "encolhe e procura parede" },
  { id: "mortos", do: "mortos que andam", acorda: /esqueleto|zumbi|morto|carniçal|carnical|espectro|alma|lich|ossada/i, faz: "reza baixo e não olha direto" },
  { id: "magia", do: "magia", acorda: /mago|feiticeir|magia|arcan|runa|conjur|bruxo/i, faz: "põe as mãos para trás e recua um passo" },
  { id: "gente", do: "gente demais", acorda: /multidão|multidao|praça|praca|feira|mercado|assembleia/i, faz: "procura a saída com os olhos" },
  { id: "armados", do: "gente armada", acorda: /guarda|soldad|mercenári|mercenari|lâmina|lamina|espada|capit[ãa]/i, faz: "fala mais baixo e mais curto" },
  { id: "fundo", do: "água funda", acorda: /rio|mar|lago|poço|poco|barco|navio|cais|doca/i, faz: "não chega perto da beira" },
  { id: "altura", do: "altura", acorda: /torre|penhasco|ponte|telhado|muralha|escada/i, faz: "cola nas costas do que estiver firme" },
  { id: "escuro", do: "escuro", acorda: /noite|caverna|cripta|masmorra|túnel|tunel|porão|porao|escuro/i, faz: "quer luz na mão antes de andar" },
  { id: "fogo", do: "fogo", acorda: /fogo|chama|incêndio|incendio|fornalha|forja|pira/i, faz: "mantém distância e conta as saídas" },
  { id: "sangue", do: "sangue", acorda: /sangue|ferido|ferimento|cadáver|cadaver|corpo/i, faz: "desvia os olhos e engole em seco" },
  /* v9.168: seis medos novos, cada um com o gatilho conferível que a lei
     exige — medo que não acorda é adjetivo */
  { id: "doenca", do: "doença", acorda: /peste|praga|doen[çc]a|febre|lepra|tosse|cont[áa]gio/i, faz: "não toca em nada e respira curto" },
  { id: "silencio", do: "lugares abandonados", acorda: /abandonad|vazio|deserto de gente|ruína|ruina|fantasma/i, faz: "fala só para ouvir uma voz qualquer" },
  { id: "miudos", do: "bicho miúdo", acorda: /rato|aranha|inseto|enxame|verme|escorpi|larva/i, faz: "sobe no que der e aponta sem palavra" },
  { id: "tempestade", do: "tempestade", acorda: /tempestade|trov[ãa]o|raio|vendaval|nevasca|granizo/i, faz: "conta os segundos entre o clarão e o som" },
  { id: "autoridade", do: "gente de posto", acorda: /nobre|lorde|senhor d|juiz|coroa|trono|bar[ãa]o|prefeito|governador/i, faz: "tira o chapéu e responde olhando o chão" },
  { id: "fome", do: "passar fome de novo", acorda: /fome|colheita|celeiro|ra[çc][ãa]o|inverno|escassez/i, faz: "guarda metade de tudo o que recebe" },
];
export function medoPorId(id) { return MEDOS.find((m) => m.id === id) || null; }

/* O medo desta pessoa está acordado nesta cena? Recebe o que houver — nomes
   de inimigos, o lugar, o bioma, se é noite. */
export function medoAcordado(indole, ctx = {}) {
  const i = garantirIndole(indole);
  const m = medoPorId(i.medo);
  if (!m) return null;
  const alvo = [
    ...(ctx.inimigos || []).map((x) => (x && x.nome) || x),
    ctx.lugar || "", ctx.bioma || "", ctx.cidade || "",
    ...(ctx.presentes || []).map((x) => (x && (x.papel || x.nome)) || x),
    ctx.noite ? "noite" : "",
  ].join(" ");
  return m.acorda.test(alvo) ? m : null;
}

/* ---------------- AS FORÇAS ----------------
   O que ela faz bem, e é o que o herói ganha se a puser para fazer. Cada uma
   aponta uma perícia que já existe, para o dia em que ajudar valer número. */
export const FORCAS = [
  { id: "braco", o: "tem braço", pericia: "atletismo" },
  { id: "mao", o: "tem mão boa para o que é miúdo", pericia: "prestidigitacao" },
  { id: "lingua", o: "convence quem não queria ser convencido", pericia: "persuasao" },
  { id: "olho", o: "vê o que os outros passam batido", pericia: "percepcao" },
  { id: "letra", o: "lê e escreve, o que por aqui é raro", pericia: "investigacao" },
  { id: "mata", o: "conhece a mata como quem nasceu nela", pericia: "sobrevivencia" },
  { id: "pe", o: "some sem fazer barulho", pericia: "furtividade" },
  /* v9.168: "religiao" e "oficio" não existiam em pericias.js — as duas
     apontavam para perícia fantasma desde que nasceram, e ninguém viu
     porque o campo ainda não tinha leitor com número. Saberes é onde a
     religião e o conhecimento de matéria moram de verdade. */
  { id: "reza", o: "sabe as rezas certas e quando dizê-las", pericia: "saberes" },
  { id: "conta", o: "faz conta de cabeça e não erra", pericia: "intuicao" },
  { id: "ferro", o: "entende de ferro e do que ele aguenta", pericia: "saberes" },
  /* v9.168: sete forças novas — a roda das dezoito perícias ganha mais
     raios, cada um apontando para uma que existe */
  { id: "costas", o: "carrega o que dois não carregam", pericia: "fortitude" },
  { id: "sela", o: "monta qualquer coisa que tenha crina ou rédea", pericia: "montaria" },
  { id: "palco", o: "prende uma sala inteira quando conta uma história", pericia: "atuacao" },
  { id: "cara", o: "mente com a cara mais limpa da região", pericia: "enganacao" },
  { id: "agulha_e_cha", o: "cose ferida e sabe de que mato é o chá", pericia: "medicina" },
  { id: "trepa", o: "sobe onde só gato sobe", pericia: "acrobacia" },
  { id: "grito", o: "mete medo em gente maior que ele", pericia: "intimidacao" },
];
export function forcaPorId(id) { return FORCAS.find((f) => f.id === id) || null; }

/* ---------------- OS PROPÓSITOS ----------------
   A parte perigosa. Cada um tem de dizer o que o faz AMADURECER, e essa
   condição tem de ser conferível no estado do jogo — senão é etiqueta.

   `madura` recebe o que o jogo sabe sobre a convivência: dias desde que se
   conheceram, força do laço, favores de cada lado, se ela sabe um segredo
   do herói, se ele a viu fazer algo. Nada de opinião. */
export const PROPOSITOS = [
  {
    id: "trair", nome: "trair quem confiar nele",
    o: "vai servir, vai ser útil, e vai vender no dia em que valer mais",
    precisa: "que o herói confie nela — laço forte, ou um segredo dele na mão",
    madura: (c) => (c.forcaDoLaco >= 2 || c.sabeDeMim) && c.dias >= 6,
    vira: "ela entrega o herói a quem paga, e o que ela sabe passa a ser sabido",
    efeito: { tipo: "relacao", relacao: "inimigo" },
    exige: ["traidor", "ganancioso", "rancoroso", "medroso"],
  },
  {
    id: "apaixonar", nome: "apaixonar-se pelo herói",
    o: "começa reparando, e um dia não consegue mais fingir que não repara",
    precisa: "convivência: dias juntos e laço que cresceu",
    madura: (c) => c.forcaDoLaco >= 2 && c.dias >= 10,
    vira: "ela declara, e a partir daí faz por ele o que não faz por ninguém",
    efeito: { tipo: "relacao", relacao: "romance" },
    exige: ["galanteador", "compassivo", "fiel", "humilde"],
  },
  {
    id: "seguir", nome: "sair daqui com o herói",
    o: "esta cidade é pequena demais, e ele é a porta",
    precisa: "que ela o veja fazer algo grande, e que o laço exista",
    madura: (c) => c.forcaDoLaco >= 1 && c.euGanhei && c.dias >= 3,
    vira: "ela pede para ir junto, e é um pedido de verdade — recusar custa",
    efeito: { tipo: "convite" },
    exige: ["corajoso", "curioso", "tagarela", "galanteador"],
  },
  {
    id: "usar", nome: "usar o herói para uma vingança sua",
    o: "tem uma conta antiga e não tem braço para cobrá-la sozinha",
    precisa: "que ela lhe deva alguma coisa, ou que ele já tenha lutado por ela",
    madura: (c) => c.meDeve && c.dias >= 4,
    vira: "ela pede o serviço, e a conta dela vira problema dele",
    efeito: { tipo: "missao", etapa: "derrotar", titulo: (n) => `A conta de ${n}` },
    exige: ["rancoroso", "orgulhoso", "cruel", "medonho"],
  },
  {
    id: "proteger", nome: "proteger o herói até o fim",
    o: "decidiu, e não avisou ninguém que decidiu",
    precisa: "que ele a tenha protegido primeiro, ou que o laço seja dos fortes",
    madura: (c) => (c.forcaDoLaco >= 3 && c.dias >= 3) || (c.euDevo && c.dias >= 5),
    vira: "ela se põe na frente na hora errada, e o custo é dela",
    efeito: { tipo: "relacao", relacao: "aliado" },
    exige: ["fiel", "corajoso", "compassivo"],
  },
  {
    id: "roubar", nome: "levar uma coisa que é dele",
    o: "já escolheu o quê, e está esperando o descuido",
    precisa: "estar perto o bastante para conhecer o que ele carrega",
    madura: (c) => c.dias >= 5 && c.forcaDoLaco >= 1,
    vira: "some um item da bolsa, e ela some da cidade por uns dias",
    efeito: { tipo: "furto" },
    exige: ["ganancioso", "traidor", "medroso"],
  },
  {
    id: "delatar", nome: "contar a quem manda o que o herói faz",
    o: "não é maldade, é sobrevivência — alguém segura algo dela",
    precisa: "que ela tenha visto o herói fazer algo que não podia",
    madura: (c) => c.euSeiDela === false && c.sabeDeMim && c.dias >= 3,
    vira: "a autoridade daqui passa a saber, e a cidade muda de temperatura",
    efeito: { tipo: "relacao", relacao: "rival" },
    exige: ["medroso", "traidor", "humilde"],
  },
  {
    id: "redimir", nome: "consertar uma coisa que fez",
    o: "carrega uma culpa e acha que o herói é a chance",
    precisa: "que ela conte, e contar exige laço",
    madura: (c) => c.forcaDoLaco >= 2 && c.dias >= 7,
    vira: "ela pede ajuda para desfazer o que fez, e paga o que puder",
    efeito: { tipo: "missao", etapa: "falar_com", titulo: (n) => `O que ${n} fez` },
    exige: ["compassivo", "fiel", "humilde", "supersticioso"],
  },
  {
    id: "testar", nome: "descobrir de que barro o herói é feito",
    o: "não confia em reputação; quer ver com os próprios olhos",
    precisa: "tempo de observação, e nada mais",
    madura: (c) => c.dias >= 4,
    vira: "ela arma uma situação pequena e desonesta, e olha o que ele faz",
    efeito: { tipo: "relacao", relacao: "neutro" },
    exige: ["curioso", "calado", "orgulhoso", "medonho"],
  },
  /* ---------------- v9.168: A MESA FARTA ----------------
     Quatro propósitos novos, pela mesma lei dos nove: condição de
     amadurecer conferível no estado do jogo, efeito que o App já sabe
     executar, e traços que o exigem. */
  {
    id: "desafiar", nome: "provar que é melhor que o herói",
    o: "viu o herói vencer e não dormiu direito desde então",
    precisa: "tê-lo visto ganhar alguma coisa em público",
    madura: (c) => c.euGanhei && c.dias >= 4,
    vira: "ela o desafia diante de gente — e perder na frente de todos não é opção para ela",
    efeito: { tipo: "relacao", relacao: "rival" },
    exige: ["orgulhoso", "corajoso", "invejoso", "teimoso"],
  },
  {
    id: "vender_o_que_sabe", nome: "vender o que sabe sobre o herói",
    o: "vive de informação, e o herói virou mercadoria valiosa",
    precisa: "saber dele alguma coisa que valha moeda",
    madura: (c) => c.sabeDeMim && c.dias >= 5,
    vira: "o que ela sabe aparece à venda no lugar errado — e quem compra aparece depois",
    efeito: { tipo: "relacao", relacao: "rival" },
    exige: ["ganancioso", "calado", "curioso", "desconfiado"],
  },
  {
    id: "adotar", nome: "fazer do herói a família que perdeu",
    o: "perdeu alguém e o herói tem o jeito de quem foi perdido",
    precisa: "convivência longa e laço de verdade",
    madura: (c) => c.forcaDoLaco >= 2 && c.dias >= 8,
    vira: "ela passa a tratá-lo como sangue: mesa posta, conselho não pedido, e o nome dele defendido em público",
    efeito: { tipo: "relacao", relacao: "aliado" },
    exige: ["generoso", "compassivo", "supersticioso", "sonhador"],
  },
  {
    id: "herdar_o_oficio", nome: "ensinar o que sabe antes que seja tarde",
    o: "é a última que sabe fazer o que faz, e as mãos já tremem",
    precisa: "tempo de convivência e um laço mínimo",
    madura: (c) => c.forcaDoLaco >= 1 && c.dias >= 9,
    vira: "ela oferece o ofício inteiro — o que sabe, para quem ficar quando ela não estiver",
    efeito: { tipo: "missao", etapa: "falar_com", titulo: (n) => `O que ${n} ensina` },
    exige: ["humilde", "calado", "fiel", "pratico"],
  },
];
export function propositoPorId(id) { return PROPOSITOS.find((p) => p.id === id) || null; }

/* ---------------- QUANTO ELA IMPORTA ----------------
   Nem todo mundo carrega enredo. Um mundo em que cada taverneiro tem um
   propósito secreto é um mundo sem taverneiro nenhum: o jogador para de
   acreditar em qualquer um deles. */
export const RELEVANCIAS = [
  { id: "figurante", o: "está ali, e é só isso", peso: 60 },
  { id: "recorrente", o: "volta, e o jogador lembra dela", peso: 30 },
  { id: "doArco", o: "tem parte no que vai acontecer", peso: 10 },
];
export function relevanciaPorId(id) { return RELEVANCIAS.find((r) => r.id === id) || RELEVANCIAS[0]; }

/* ---------------- A CATRACA ---------------- */
export function garantirIndole(x) {
  const o = x && typeof x === "object" ? x : {};
  const tracos = [];
  for (const t of (Array.isArray(o.tracos) ? o.tracos : [])) {
    if (!tracoPorId(t) || tracos.includes(t)) continue;
    if (tracos.every((j) => compativel(j, t))) tracos.push(t);
    if (tracos.length >= 3) break;
  }
  return {
    tracos,
    medo: medoPorId(o.medo) ? o.medo : "",
    forca: forcaPorId(o.forca) ? o.forca : "",
    relevancia: relevanciaPorId(o.relevancia).id,
    proposito: propositoPorId(o.proposito) ? o.proposito : "",
    /* o propósito já aconteceu? uma vez que acontece, não acontece de novo */
    cumprido: !!o.cumprido,
  };
}

/* ---------------- NASCER ----------------
   Determinística pela semente da pessoa: a mesma Fina Da Rede tem sempre o
   mesmo medo e o mesmo propósito, em qualquer sessão. */
/* ---------------- O APELIDO MANDA ----------------
   A sonda devolveu "Corwin Sem-Medo · calado, fiel, MEDROSO". O apelido é
   parte do nome e o jogador o lê primeiro; uma índole que o contradiz não é
   ironia, é o mundo se desmentindo na mesma linha. Quando o nome já afirma
   uma coisa, ela entra antes do sorteio. */
const APELIDO_DIZ = [
  { rx: /sem-medo|coração-de-ferro|coracao-de-ferro|rompe-escudos|barba-ruiva/i, traco: "corajoso" },
  { rx: /o silencioso|voz-grave|cinza-antiga/i, traco: "calado" },
  { rx: /passo-de-gato|pé-leve|pe-leve|sombravinda|filho da névoa|filho da nevoa/i, traco: "curioso" },
  { rx: /mata-lobos|queima-campos|punho-de-pedra|lâmina-rápida|lamina-rapida/i, traco: "medonho" },
  { rx: /o exilado|o andarilho|o manco|mão-torta|mao-torta/i, traco: "rancoroso" },
  { rx: /olho-de-corvo|da torre/i, traco: "curioso" },
  { rx: /guarda-portão|guarda-portao|da foz|da urze/i, traco: "fiel" },
];

export function indoleDe(semente, pessoa) {
  const p = pessoa || {};
  /* A CHAVE É O NOME, e não o id. É o que torna a índole DERIVÁVEL de
     qualquer lugar — do painel do elenco, de um NPC que o Mestre registrou,
     de alguém citado numa cena —, exatamente como o rosto já é derivável da
     semente. Com o id na frente, a mesma Fina teria uma índole na base e
     outra na ficha, e a segunda seria a errada. */
  const chave = `${semente}|indole|${p.nome || p.id || ""}`;
  const rnd = rngDe(chave);

  /* de um a três traços, e nenhum brigando com outro */
  const quantos = rnd() < 0.45 ? 1 : rnd() < 0.85 ? 2 : 3;
  const tracos = [];
  const doApelido = APELIDO_DIZ.find((a) => a.rx.test(String(p.nome || "")));
  if (doApelido) tracos.push(doApelido.traco);
  for (let tent = 0; tent < 24 && tracos.length < quantos; tent++) {
    const t = pick(rnd, TRACOS).id;
    if (tracos.includes(t)) continue;
    if (tracos.every((j) => compativel(j, t))) tracos.push(t);
  }

  const medo = rnd() < 0.55 ? pick(rnd, MEDOS).id : "";
  const forca = rnd() < 0.7 ? pick(rnd, FORCAS).id : "";

  /* a relevância sai do peso: a maioria é figurante, e é isso que faz o
     recorrente valer alguma coisa */
  const d = rnd() * 100;
  const relevancia = d < 60 ? "figurante" : d < 90 ? "recorrente" : "doArco";

  /* PROPÓSITO SÓ PARA QUEM VOLTA. Um figurante com plano secreto é um plano
     que nunca vai ser jogado — e é o jeito mais rápido de encher o mundo de
     promessas mortas. E ele tem de CASAR com os traços: um fiel não nasce
     com o propósito de trair. */
  let proposito = "";
  if (relevancia !== "figurante") {
    const cabem = PROPOSITOS.filter((x) => x.exige.some((t) => tracos.includes(t)));
    if (cabem.length) proposito = pick(rnd, cabem).id;
  }
  return garantirIndole({ tracos, medo, forca, relevancia, proposito });
}

/* ---------------- O QUE ELA NUNCA FAZ ----------------
   O mesmo vocabulário do Intérprete, agora saindo de estrutura em vez de
   regex sobre prosa. */
export function vetosDaIndole(indole) {
  const i = garantirIndole(indole);
  const fora = new Set();
  for (const t of i.tracos) for (const g of (tracoPorId(t) || { nunca: [] }).nunca) fora.add(g);
  return [...fora];
}

/* ---------------- O PROPÓSITO AMADURECEU? ----------------
   `convivio` é o que o jogo sabe: dias desde que se conheceram, força do
   laço, quem deve a quem, o que cada um sabe do outro. Nada de opinião. */
export function garantirConvivio(c) {
  const o = c && typeof c === "object" ? c : {};
  const n = (v) => Math.max(0, Math.round(Number(v) || 0));
  return {
    dias: n(o.dias), forcaDoLaco: Math.max(0, Math.min(3, n(o.forcaDoLaco))),
    meDeve: !!o.meDeve, euDevo: !!o.euDevo,
    sabeDeMim: !!o.sabeDeMim, euSeiDela: !!o.euSeiDela,
    euGanhei: !!o.euGanhei,
  };
}

const DIAS_ATE_QUALQUER_PLANO = 3;

export function propositoMaduro(indole, convivio) {
  const i = garantirIndole(indole);
  if (!i.proposito || i.cumprido) return null;
  const p = propositoPorId(i.proposito);
  if (!p) return null;
  const c = garantirConvivio(convivio);
  /* A CATRACA DOS DIAS. A sonda pegou 24 pessoas em mil disparando no dia do
     encontro: o `proteger` guardava o piso de dias em UM SÓ dos dois ramos
     do `||`, e o outro passava direto. Consertei a linha — mas a linha era o
     sintoma. O piso agora mora num caminho só, aqui, e nenhuma condição
     futura pode esquecê-lo: ninguém revela plano nenhum no dia em que o
     herói o conheceu, por mais forte que o resto pareça. */
  if (c.dias < DIAS_ATE_QUALQUER_PLANO) return null;
  let pronto = false;
  try { pronto = !!p.madura(c); } catch { pronto = false; }
  return pronto ? p : null;
}

export function cumprir(indole) {
  return { ...garantirIndole(indole), cumprido: true };
}

/* ---------------- O PROPÓSITO ACONTECE ----------------
   Faltava a outra ponta: o ator sabia que "a hora chegou" e nada no mundo
   mudava. Um propósito que amadurece e não acontece é a mesma etiqueta de
   antes, só que com condição — e quem faz acontecer é o MESTRE, não a IA.

   Isto devolve o EFEITO em forma de pedido: o módulo é puro e não é dono da
   ficha, do elenco nem do diário. Quem aplica é o App, num lugar só. */
export function dispararProposito(indole, pessoa, convivio) {
  const p = propositoMaduro(indole, convivio);
  if (!p) return null;
  const nome = String((pessoa && pessoa.nome) || "").slice(0, 40);
  if (!nome) return null;
  const ef = p.efeito || null;
  return {
    proposito: p.id,
    nome,
    titulo: ef && typeof ef.titulo === "function" ? ef.titulo(nome) : "",
    efeito: ef ? { ...ef, titulo: undefined } : null,
    linha: `✦ ${nome}: ${p.nome}.`,
    envelope: `[PROPÓSITO — RESOLVIDO PELO SISTEMA] ${nome} chegou onde queria chegar: ${p.nome}. ${p.vira}. Isto acontece NESTA cena, e é fato — narre o momento em que se revela, em duas ou três frases, sem anunciar que era um plano e sem desfazê-lo depois. Não invente outro desfecho para ela.`,
  };
}

/* ---------------- O QUE O ATOR E A PAUTA RECEBEM ----------------
   O ator precisa saber quem ela é para falar como ela. O propósito entra
   MESMO antes de amadurecer — é o que faz a fala ter fundo falso desde a
   primeira cena —, mas a nota diz claramente que ele ainda não acontece. */
export function linhaDaIndole(indole) {
  const i = garantirIndole(indole);
  const t = i.tracos.map((x) => (tracoPorId(x) || {}).nome).filter(Boolean);
  const m = medoPorId(i.medo);
  const f = forcaPorId(i.forca);
  return [
    t.length ? t.join(", ") : "",
    m ? `tem medo de ${m.do}` : "",
    f ? f.o : "",
  ].filter(Boolean).join(" · ");
}

export function paraODossie(indole, ctx = {}) {
  const i = garantirIndole(indole);
  const acordado = medoAcordado(i, ctx);
  const p = propositoPorId(i.proposito);
  const maduro = propositoMaduro(i, ctx.convivio);
  return {
    tracos: i.tracos.map((x) => (tracoPorId(x) || {}).o).filter(Boolean),
    medo: acordado ? `${acordado.do} — e há disso aqui agora: você ${acordado.faz}` : "",
    forca: (forcaPorId(i.forca) || {}).o || "",
    /* o propósito vai como INTENÇÃO SECRETA: ela age em direção a ele sem
       anunciá-lo, e é isso que dá fundo falso à fala */
    proposito: p && !i.cumprido ? `${p.nome} — ${p.o}. ${maduro ? "A hora chegou: nesta cena isso pode aparecer." : "Ainda não é a hora: você trabalha para isso sem falar nisso."}` : "",
  };
}

export const RELEVANTE = (indole) => garantirIndole(indole).relevancia !== "figurante";

/* ============================================================
   O CONVITE (v9.143) — quem decide se anda com você

   Sobrou uma porta em que a IA ainda decidia o que existe. Convidar alguém
   para o grupo mandava ao Narrador:

     "A decisão é dele(a): pode aceitar (registre em `grupo_adicionar` com a
      ficha completa), recusar com jeito, ou pedir uma condição."

   A ficha já era do sistema desde a v9.116 — só o SIM ficou com a IA. E
   ficou justamente onde havia mais material para decidir por código: desde
   a v9.136 esta pessoa tem traços, medo, força e, às vezes, um plano.

   O que pesa é a mesma coisa que pesaria numa mesa de verdade: quem ela é,
   há quanto tempo ela te conhece, o que você fez por ela, e quem você é
   para o mundo.
   ============================================================ */

/* Quanto cada traço puxa para dentro do grupo, ou para longe dele. */
export const VONTADE_DE_IR = {
  corajoso: +14, curioso: +12, tagarela: +8, galanteador: +8, fiel: +10,
  compassivo: +8, generoso: +6, humilde: +4, corajosoNota: 0,
  medroso: -20, calado: -6, orgulhoso: -8, rancoroso: -10, cruel: -8,
  medonho: -6, supersticioso: -6, ganancioso: -4,
  /* E O TRAIDOR ACEITA FÁCIL. Não é bondade: é que andar junto é a posição
     de onde se trai. É a linha desta tabela que mais interessa ao jogo. */
  traidor: +12,
  /* v9.168: os oito traços novos votam também — traço sem voto é traço
     que a catraca do convite derruba, e com razão */
  teimoso: -4, desconfiado: -8, vaidoso: +4, pratico: +2,
  sonhador: +12, invejoso: -6, brincalhao: +8, frio: -4,
};

export const CONVITE_ACEITA = 55;
export const CONVITE_TALVEZ = 35;

export function pesarConvite(indole, { convivio = {}, fama = 0, grupoCheio = false } = {}) {
  const i = garantirIndole(indole);
  const c = garantirConvivio(convivio);
  const porques = [];
  if (grupoCheio) return { resposta: "recusa", porques: ["não há lugar no seu grupo"], exigencia: null };

  let peso = 30;
  for (const t of i.tracos || []) {
    const v = VONTADE_DE_IR[t];
    if (!v) continue;
    peso += v;
    const nome = (TRACOS.find((x) => x.id === t) || {}).o;
    if (nome) porques.push(`${t}: ${nome}`);
  }

  /* O TEMPO PESA MAIS QUE QUALQUER TRAÇO. Ninguém larga a vida para andar
     com quem conheceu ontem, por mais simpático que seja. */
  const dias = Math.min(20, c.dias);
  peso += dias * 1.5;
  if (c.dias <= 1) porques.push("vocês se conheceram ontem");
  else if (c.dias >= 10) porques.push(`vocês se conhecem há ${c.dias} dias`);

  peso += (c.forcaDoLaco || 0) * 7;
  if (c.meDeve) { peso += 10; porques.push("ela te deve"); }
  if (c.euDevo) { peso -= 6; porques.push("você deve a ela"); }
  if (c.euGanhei) { peso += 6; porques.push("você já a ajudou"); }

  /* a sua lenda: quem tem nome atrai quem não tem */
  if (fama >= 60) { peso += 12; porques.push("a sua lenda chegou antes de você"); }
  else if (fama < 10) { peso -= 6; porques.push("ninguém sabe quem você é"); }

  /* quem já queria ir, vai. `seguir` é o único propósito que se cumpre
     ACEITANDO — e não seria justo o sistema ignorar isso. */
  if (i.proposito === "seguir") { peso += 25; porques.push("ela já queria ir"); }

  if (peso >= CONVITE_ACEITA) return { resposta: "aceita", porques, exigencia: null };
  if (peso >= CONVITE_TALVEZ) return { resposta: "exige", porques, exigencia: exigenciaDoConvite(i, c) };
  return { resposta: "recusa", porques, exigencia: null };
}

/* A condição tem de ser CONFERÍVEL, como toda condição desta casa. São
   duas, e o sistema sabe olhar as duas. */
export function exigenciaDoConvite(indole, convivio) {
  const i = garantirIndole(indole);
  if ((i.tracos || []).includes("ganancioso")) {
    return { tipo: "paga", moedas: 120, o: "◉ 120 adiantados — ela não anda de graça" };
  }
  const faltam = Math.max(1, 5 - (garantirConvivio(convivio).dias || 0));
  return { tipo: "convivio", dias: faltam, o: `mais ${faltam} dia${faltam === 1 ? "" : "s"} de estrada juntos antes de decidir` };
}

export function envelopeDoConvite(nome, veredito) {
  const v = veredito || {};
  const corpo = {
    aceita: "A resposta é SIM, e ela já está com você.",
    exige: `A resposta é UM TALVEZ com preço: ela quer ${(v.exigencia || {}).o}.`,
    recusa: "A resposta é NÃO.",
  }[v.resposta] || "";
  return `[CONVITE — RESOLVIDO PELO SISTEMA] Você convidou ${nome} para andar com você. ${corpo} O que pesou: ${(v.porques || []).join("; ")}. Narre SÓ a reação e as palavras ${nome === "ela" ? "dela" : `de ${nome}`}, em primeira pessoa, aqui mesmo onde vocês estão, com ESTE desfecho e nenhum outro. Não invente outra resposta, não narre partida, despedida, preparativos nem passagem de tempo: ninguém saiu do lugar por causa de um convite.`;
}
