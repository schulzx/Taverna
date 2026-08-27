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
  { id: "tagarela", nome: "tagarela", o: "enche o silêncio antes que ele exista", briga: ["calado"], nunca: [], puxa: ["entrega"] },
  { id: "medonho", nome: "medonho", o: "faz o ar pesar quando entra", briga: ["galanteador"], nunca: ["aproxima"], puxa: ["ameaca"] },
  { id: "ganancioso", nome: "ganancioso", o: "põe preço em tudo, inclusive em favor", briga: ["generoso"], nunca: ["entrega"], puxa: ["cobra"] },
  { id: "generoso", nome: "generoso", o: "dá antes de perguntar se pode", briga: ["ganancioso"], nunca: ["cobra"], puxa: ["entrega"] },
  { id: "orgulhoso", nome: "orgulhoso", o: "não diminui na frente de ninguém", briga: ["humilde"], nunca: ["recua"], puxa: ["ameaca"] },
  { id: "humilde", nome: "humilde", o: "aceita ser pequeno sem sofrer com isso", briga: ["orgulhoso"], nunca: ["ameaca"], puxa: ["recua"] },
  { id: "cruel", nome: "cruel", o: "acha graça no que dói nos outros", briga: ["compassivo"], nunca: ["protege"], puxa: ["ameaca"] },
  { id: "compassivo", nome: "compassivo", o: "não passa por cima de quem caiu", briga: ["cruel"], nunca: ["ameaca"], puxa: ["protege"] },
  { id: "curioso", nome: "curioso", o: "pergunta o que não lhe cabe", briga: [], nunca: ["esquiva"], puxa: ["aproxima"] },
  { id: "supersticioso", nome: "supersticioso", o: "lê sinal em tudo e obedece a todos", briga: [], nunca: [], puxa: ["esquiva"] },
  { id: "rancoroso", nome: "rancoroso", o: "guarda o que lhe fizeram, com data", briga: [], nunca: ["entrega"], puxa: ["cobra"] },
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
  { id: "reza", o: "sabe as rezas certas e quando dizê-las", pericia: "religiao" },
  { id: "conta", o: "faz conta de cabeça e não erra", pericia: "intuicao" },
  { id: "ferro", o: "entende de ferro e do que ele aguenta", pericia: "oficio" },
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
