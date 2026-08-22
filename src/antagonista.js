/* ============================================================
   O SISTEMA VILÃO (v9.107) — o antagonista que SABE

   "Podemos ter um sistema que interpreta o vilão: ele vê tudo o que
   acontece e pensa como vilão, ele É o vilão, então quando o mestre quer
   saber o que o vilão faz, ele usa o sistema vilão e o vilão vira um
   sistema vivo."

   `vilao.js` já tinha o PLANO: arquétipos, nove passos, heranças,
   marcas, alvos, quedas. O que faltava era a CABEÇA — e a diferença
   entre as duas é a diferença entre um roteiro e um personagem.

   Este módulo é um AGENTE, não um conselheiro, e a distinção é
   estrutural: um conselheiro responde uma pergunta sobre a cena; um
   agente É alguém e responde "o que EU faço". O vilão tem vontade,
   plano, informação incompleta, e age quando ninguém está olhando.

   ---------------- O QUE ELE SABE, E O QUE NÃO SABE ----------------

   A peça central. Um livro-razão do que CHEGOU até ele, com a fonte
   escrita em cada linha — e é a exigência da fonte que impede o acervo
   de derivar, com o tempo, para "ele simplesmente sabe".

   E o que ele NÃO sabe é guardado junto, porque um vilão que sabe tudo é
   dispositivo de enredo, não personagem. Toda a graça de um antagonista
   inteligente está no que ele deduziu errado com a metade que tinha.

   ---------------- A LEITURA PODE ESTAR ERRADA ----------------

   E a errada é melhor que a certa. Um vilão que te interpreta mal é
   dramaticamente muito mais rico que um que acerta — e o erro aqui é
   COMPUTÁVEL, porque é função de informação incompleta. Nenhuma outra
   peça deste jogo consegue produzir isso.

   ---------------- O CORPO ----------------

   "Um vilão pode ser mais de uma pessoa, pode ser um grupo de dragões ou
   um deus." Isso não é sabor: muda a mecânica. Até aqui `podeCair` e
   `envelopeDaQueda` assumiam que o vilão é uma pessoa que morre. Com
   CORPO, a queda ganha cinco formas — e a estrutura de capítulos passa a
   conseguir escrever finais que ela não conseguia.
   ============================================================ */

/* ---------------- OS CORPOS ----------------
   `ritmo` multiplica os dias por passo do plano: um conselho precisa
   concordar, um bando não precisa de nada. `queda` diz o que acontece
   quando o herói derruba "o vilão" — e é o campo que mais muda o jogo. */
export const CORPOS = [
  {
    id: "pessoa", nome: "uma pessoa", peso: 4, ritmo: 1, sobrevive: false,
    queda: "acaba: o plano morre com ela",
    confronto: "uma cena — os dois no mesmo lugar, e um sai",
    o: "o antagonista clássico: um rosto, um nome, uma vontade",
  },
  {
    id: "conselho", nome: "um conselho", peso: 2, ritmo: 1.6, sobrevive: true,
    queda: "um cai e os outros seguem — mais devagar, e mais assustados",
    confronto: "política: quem se convence, quem deserta, quem entrega quem",
    o: "vários que precisam concordar antes de agir — lentos, divididos, e um deles pode debandar",
  },
  {
    id: "bando", nome: "um bando", peso: 2, ritmo: 0.7, sobrevive: true,
    queda: "a cabeça cai e o bando continua, mais cru e menos previsível",
    confronto: "vários confrontos, e o último não é o maior",
    o: "muitos que agem juntos sem precisar concordar — rápidos, crus, e difíceis de acabar",
  },
  {
    id: "coisa", nome: "uma coisa antiga", peso: 1, ritmo: 1.3, sobrevive: true,
    queda: "não se mata assim: o que se pode é selar, adiar ou entender",
    confronto: "um rito, não uma luta — e o preço é pago por alguém",
    o: "um deus, uma maldição, um lugar com vontade: age por sinais e por gente que nem sabe que serve",
  },
  {
    id: "instituicao", nome: "uma instituição", peso: 2, ritmo: 1.4, sobrevive: true,
    queda: "não tem quem matar: o que cai é um cargo, e o cargo se preenche",
    confronto: "um processo — provas, testemunhas, e quem manda em quem",
    o: "uma guilda, uma ordem, um estado: age por regra e por papel, e é imune a heroísmo",
  },
];
export function corpoPorId(id) { return CORPOS.find((c) => c.id === id) || CORPOS[0]; }
export function escolherCorpo(sorte = Math.random) {
  const total = CORPOS.reduce((a, c) => a + c.peso, 0);
  let r = sorte() * total;
  for (const c of CORPOS) { r -= c.peso; if (r <= 0) return c.id; }
  return "pessoa";
}

/* ---------------- COMO A COISA CHEGOU ATÉ ELE ----------------
   Toda linha do que ele sabe carrega a FONTE, e a exigência da fonte é
   o que impede o acervo de derivar para "ele simplesmente sabe".
   `certeza` é o quanto ele confia — e um boato com certeza baixa é
   exatamente do que nasce uma leitura errada. */
export const FONTES = [
  { id: "viu", certeza: 3, o: "ele estava lá, ou alguém dele estava" },
  { id: "marca", certeza: 3, o: "uma das marcas do plano dele reportou" },
  { id: "fama", certeza: 2, o: "o nome do herói corre sozinho, e chegou" },
  { id: "boato", certeza: 1, o: "alguém contou a alguém que contou" },
  { id: "deduziu", certeza: 1, o: "ele juntou duas coisas e concluiu uma terceira" },
];
export function fontePorId(id) { return FONTES.find((f) => f.id === id) || null; }

const limpar = (s, m = 80) => String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, m);

export const TETO_DO_QUE_SABE = 12;

export function garantirSaber(s) {
  const l = Array.isArray(s) ? s : [];
  return l
    .map((x) => ({
      o: limpar(x && x.o, 80),
      fonte: fontePorId(x && x.fonte) ? String(x.fonte) : "boato",
      dia: Math.max(0, Math.floor(Number(x && x.dia) || 0)),
      sobre: limpar(x && x.sobre, 30),
    }))
    .filter((x) => x.o)
    .filter((x, i, a) => a.findIndex((y) => y.o === x.o) === i)
    .slice(-TETO_DO_QUE_SABE);
}

export function certezaDe(linha) {
  const f = fontePorId(linha && linha.fonte);
  return f ? f.certeza : 1;
}

/* O que chegou até ele. Nada aqui inventa: a fama corre sozinha, as
   marcas do plano são ouvidos, e o registro guarda quem viu o quê. */
export function chegouAteEle(saber, { o = "", fonte = "boato", dia = 0, sobre = "" } = {}) {
  if (!o) return garantirSaber(saber);
  return garantirSaber([...garantirSaber(saber), { o, fonte, dia, sobre }]);
}

/* ---------------- O QUE ELE NÃO SABE ----------------
   Guardado junto, e é o que separa um personagem de um dispositivo de
   enredo. A lista é derivada: o que o herói fez e não chegou a ele. */
export function oQueEleNaoSabe(saber, feitos = []) {
  const sabidos = garantirSaber(saber).map((x) => x.o.toLowerCase());
  return (feitos || [])
    .map((f) => limpar(typeof f === "string" ? f : (f && f.oQue) || "", 80))
    .filter(Boolean)
    .filter((f) => !sabidos.some((s) => s.includes(f.toLowerCase().slice(0, 20))))
    .slice(-6);
}

/* ---------------- A SITUAÇÃO DO VILÃO ---------------- */
export function garantirMente(m) {
  const o = m && typeof m === "object" ? m : {};
  const b = (v) => !!v;
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  return {
    nome: limpar(o.nome, 40),
    arquetipo: limpar(o.arquetipo, 24),
    corpo: corpoPorId(o.corpo).id,
    passo: Math.max(0, Math.min(8, num(o.passo))),
    conhecido: b(o.conhecido),         // o herói sabe que ele existe
    /* o que chegou */
    quanto: num(o.quanto),             // quantas linhas ele tem
    certezaMax: num(o.certezaMax),     // a melhor fonte que ele tem
    ignora: num(o.ignora),             // quantas coisas ele NÃO sabe
    /* o herói, pelos olhos dele */
    fama: num(o.fama),
    nivel: num(o.nivel, 1),
    heroiFerido: b(o.heroiFerido),
    heroiSozinho: b(o.heroiSozinho),
    heroiRico: b(o.heroiRico),
    heroiMatou: b(o.heroiMatou),       // o herói matou alguém dele
    heroiPoupou: b(o.heroiPoupou),
    heroiFugiu: b(o.heroiFugiu),
    heroiAceitouAlgo: b(o.heroiAceitouAlgo),
    /* onde as coisas estão */
    perto: b(o.perto),                 // o herói está no território dele
    marcas: num(o.marcas),
    dia: num(o.dia),
    desdeQueAgiu: num(o.desdeQueAgiu, 99),
  };
}

/* ---------------- A LEITURA ----------------
   O que ele CONCLUI. E a melhor parte é que ela pode estar errada: com
   `certezaMax` baixa e `ignora` alto, o que sai daqui é um retrato feito
   de metade da informação — que é como gente de verdade conclui coisas. */
export const LEITURAS = [
  { id: "ameaca_real", peso: 4, erro: false, quando: (v) => v.certezaMax >= 3 && v.fama >= 45, diz: "que eu sou uma ameaça de verdade, e que esperar só me deixa maior" },
  { id: "ainda_nao", peso: 3, erro: false, quando: (v) => v.fama < 20 && v.quanto <= 2, diz: "que eu ainda não sou nada — e que gastar atenção comigo seria erro" },
  { id: "comprável", peso: 3, erro: true, quando: (v) => v.heroiRico || v.heroiAceitouAlgo, diz: "que eu tenho preço, e que ele só ainda não achou o número" },
  { id: "trabalha_pro_outro", peso: 3, erro: true, quando: (v) => v.ignora >= 3 && v.certezaMax <= 2, diz: "que eu trabalho para alguém — e ele está errado sobre quem" },
  { id: "covarde", peso: 3, erro: true, quando: (v) => v.heroiFugiu, diz: "que eu corro quando aperta, e que basta apertar" },
  { id: "sentimental", peso: 3, erro: false, quando: (v) => v.heroiPoupou, diz: "que eu não termino o serviço — e que isso é onde eu quebro" },
  { id: "igual_a_ele", peso: 4, erro: true, quando: (v) => v.heroiMatou && v.arquetipo === "espelho", diz: "que eu sou igual a ele, e que só falta eu admitir" },
  { id: "sozinho", peso: 3, erro: false, quando: (v) => v.heroiSozinho, diz: "que eu ando sem ninguém, e que quem anda sozinho não tem quem avise" },
  { id: "tem_alguem", peso: 3, erro: true, quando: (v) => !v.heroiSozinho && v.ignora >= 2, diz: "que quem me protege é maior do que eu — e não é" },
  { id: "quase_la", peso: 3, erro: false, quando: (v) => v.passo >= 6 && v.conhecido, diz: "que eu descobri tarde demais para atrapalhar" },
  { id: "nao_entendeu", peso: 3, erro: true, quando: (v) => v.passo >= 4 && !v.conhecido, diz: "que eu não faço ideia do que está acontecendo — e por enquanto ele tem razão" },
  { id: "ferido", peso: 3, erro: false, quando: (v) => v.heroiFerido, diz: "que eu estou gasto, e que a hora é agora" },
  { id: "curioso", peso: 2, erro: true, quando: (v) => v.quanto >= 4 && v.fama < 45, diz: "que eu sou uma peça de outro tabuleiro, e quer entender antes de tirar" },
  { id: "pessoal", peso: 3, erro: false, quando: (v) => v.marcas >= 2, diz: "que isto entre nós dois virou pessoal, e que ele prefere assim" },
  { id: "ferramenta", peso: 2, erro: true, quando: (v) => v.arquetipo === "arquiteto" && v.fama >= 25, diz: "que eu sirvo melhor vivo e usado do que morto" },
  { id: "cresceu_rapido", peso: 3, erro: false, quando: (v) => v.nivel >= 8 && v.quanto >= 2, diz: "que eu cresci depressa demais para ser acidente, e que alguém está me empurrando" },
  { id: "verde_ainda", peso: 3, erro: true, quando: (v) => v.nivel <= 4 && v.fama >= 25, diz: "que a minha fama é maior que eu — e que por trás dela não há quase nada" },

  /* ---- A REDE ----
     Uma mente plausível sem leitura nenhuma deixava o vilão mudo no caso
     mais comum: fama média, certeza média, nada de especial. O mesmo
     buraco que o Intérprete teve. Estas duas valem sempre, e são o
     mínimo que qualquer antagonista conclui sobre quem cruzou o caminho
     dele. */
  { id: "esta_no_caminho", peso: 2, erro: false, quando: () => true, diz: "que eu estou no caminho do que ele quer, sem ser o assunto principal dele" },
  { id: "vale_um_olho", peso: 2, erro: false, quando: () => true, diz: "que eu mereço um olho em cima, e nada mais que isso por enquanto" },
];
export function leituraPorId(id) { return LEITURAS.find((l) => l.id === id) || null; }

export function lerOHeroi(mente, { sorte = Math.random } = {}) {
  const v = garantirMente(mente);
  const cand = [];
  for (const l of LEITURAS) {
    let vale = false;
    try { vale = !!l.quando(v); } catch { vale = false; }
    if (vale) cand.push(l);
  }
  if (!cand.length) return null;
  const total = cand.reduce((a, l) => a + l.peso, 0);
  let r = sorte() * total;
  for (const l of cand) { r -= l.peso; if (r <= 0) return l; }
  return cand[cand.length - 1];
}

/* ---------------- A RESPOSTA ----------------
   Não são os passos do plano — `vilao.js` já os tem. São as REAÇÕES: o
   que ele faz por causa do que concluiu. E o SILÊNCIO é um movimento
   explícito, porque senão nunca aconteceria: um acervo em que toda
   entrada faz alguma coisa produz um vilão que age todo turno, e um
   vilão que age todo turno é praga. */
export const RESPOSTAS = [
  { id: "manda_ver", gesto: "testa", peso: 4, quando: (v, l) => l === "ainda_nao" || l === "curioso", faz: "manda alguém me observar de longe, e essa pessoa não faz nada além de olhar" },
  { id: "compra", gesto: "oferece", peso: 4, quando: (v, l) => l === "comprável", faz: "faz uma oferta — dinheiro, cargo ou informação — através de alguém que eu já conheço" },
  { id: "isola", gesto: "corta", peso: 4, quando: (v, l) => l === "sozinho" || l === "tem_alguem", faz: "corta uma das minhas portas: um contato que para de responder, uma porta que fecha, um nome que some" },
  { id: "assusta", gesto: "mostra", peso: 3, quando: (v, l) => l === "covarde" || l === "ferido", faz: "manda um aviso que não machuca ninguém e não deixa dúvida de quem mandou" },
  { id: "imita", gesto: "mostra", peso: 3, quando: (v, l) => l === "igual_a_ele", faz: "faz alguma coisa exatamente do jeito que eu faria, e deixa isso visível" },
  { id: "presenteia", gesto: "oferece", peso: 3, quando: (v, l) => l === "curioso" || l === "ferramenta", faz: "me manda uma coisa útil, sem remetente, e a coisa é boa demais para ser recusada" },
  { id: "aperta_agora", gesto: "ataca", peso: 4, quando: (v, l) => (l === "ameaca_real" || l === "ferido") && v.perto, faz: "aperta AGORA, com o que tem à mão, sem esperar estar pronto" },
  { id: "manda_alguem", gesto: "ataca", peso: 4, quando: (v, l) => l === "ameaca_real" || l === "pessoal", faz: "manda alguém — e essa pessoa tem nome, ofício e um motivo próprio para aceitar" },
  { id: "usa_terceiro", gesto: "corta", peso: 3, quando: (v, l) => l === "trabalha_pro_outro", faz: "vira alguém contra mim contando uma verdade pela metade" },
  { id: "some", gesto: "cala", peso: 3, quando: (v, l) => l === "quase_la" || l === "nao_entendeu", faz: "NÃO faz nada, e o plano dele anda um passo enquanto eu olho para outro lado" },
  { id: "aparece", gesto: "mostra", peso: 4, quando: (v) => v.passo >= 7 && v.conhecido, faz: "aparece, em pessoa ou pela forma que o corpo dele tem, e não vem para lutar hoje" },
  { id: "cobra_o_favor", gesto: "cobra", peso: 3, quando: (v, l) => l === "comprável" && v.heroiAceitouAlgo, faz: "cobra o que eu aceitei sem saber que estava aceitando" },
  { id: "poupa_de_proposito", gesto: "oferece", peso: 3, quando: (v, l) => l === "sentimental", faz: "poupa uma pessoa que ele podia ter tirado, e faz questão de que eu saiba" },
  { id: "acelera", gesto: "ataca", peso: 3, quando: (v) => v.marcas >= 3 && v.passo < 7, faz: "queima uma etapa: o plano anda dois passos e fica mais frágil por isso" },
  { id: "recolhe", gesto: "cala", peso: 2, quando: (v) => v.heroiMatou && v.desdeQueAgiu <= 2, faz: "recolhe o que sobrou dele da região e some por uns dias" },
  { id: "procura_o_padrinho", gesto: "testa", peso: 3, quando: (v, l) => l === "cresceu_rapido", faz: "manda descobrir quem está por trás de mim — e vai achar alguém, mesmo que não haja ninguém" },
  { id: "despreza", gesto: "cala", peso: 3, quando: (v, l) => l === "verde_ainda", faz: "deixa correr, e o desprezo dele abre uma janela que ele vai lamentar" },
  /* a rede das respostas: as duas leituras de chão precisam ter o que
     produzir, senão o vilão volta a ficar mudo um degrau mais tarde */
  { id: "anota", gesto: "cala", peso: 2, quando: (v, l) => l === "esta_no_caminho" || l === "vale_um_olho", faz: "não faz nada comigo, e faz alguma coisa em outro lugar que eu só vou entender depois" },
  { id: "atravessa", gesto: "corta", peso: 2, quando: (v, l) => l === "esta_no_caminho", faz: "resolve um assunto dele que passa por onde eu estava indo, e chega primeiro" },
];
export function respostaPorId(id) { return RESPOSTAS.find((r) => r.id === id) || null; }

/* ---------------- A CADÊNCIA ----------------
   Um vilão que fala todo turno é praga. Ele responde quando o herói fez
   alguma coisa que CHEGOU até ele, e nunca antes de uns dias do último
   movimento. */
export const DIAS_ENTRE_RESPOSTAS = 3;

export function podeResponder(mente) {
  const v = garantirMente(mente);
  if (!v.nome) return false;
  if (v.desdeQueAgiu < DIAS_ENTRE_RESPOSTAS) return false;
  return v.quanto >= 1;
}

export function responder(mente, { sorte = Math.random } = {}) {
  const v = garantirMente(mente);
  if (!podeResponder(v)) return null;
  const leitura = lerOHeroi(v, { sorte });
  if (!leitura) return null;
  const cand = [];
  for (const r of RESPOSTAS) {
    let vale = false;
    try { vale = !!r.quando(v, leitura.id); } catch { vale = false; }
    if (vale) cand.push(r);
  }
  if (!cand.length) return null;
  const total = cand.reduce((a, r) => a + r.peso, 0);
  let x = sorte() * total;
  let escolhida = cand[cand.length - 1];
  for (const r of cand) { x -= r.peso; if (x <= 0) { escolhida = r; break; } }
  return { leitura, resposta: escolhida, corpo: corpoPorId(v.corpo) };
}

/* ---------------- O QUE SOBE À PAUTA ----------------
   Duas linhas no máximo: o que ele CONCLUIU e o que ele FAZ. A leitura
   sobe junto de propósito — sem ela, a resposta parece arbitrária; com
   ela, o Narrador sabe se está encenando um vilão que acertou ou um que
   se enganou, e a diferença é a cena inteira. */
export function paraPauta(r, { nome = "a ameaça" } = {}) {
  if (!r) return [];
  const l = [`${nome} concluiu ${r.leitura.diz}${r.leitura.erro ? " — e está ENGANADO" : ""}`];
  l.push(`e por isso ${r.resposta.faz}`);
  return l;
}

/* A queda, pela forma do corpo. É o que faz `historia.js` conseguir
   escrever finais que ele não conseguia. */
export function comoCai(corpo) {
  const c = corpoPorId(corpo);
  return { queda: c.queda, confronto: c.confronto, sobrevive: c.sobrevive };
}

export function envelopeDoCorpo(corpo, nome = "a ameaça") {
  const c = corpoPorId(corpo);
  return `[A FORMA DA AMEAÇA — DO SISTEMA] ${nome} é ${c.nome}: ${c.o}. Derrubar quem está na frente ${c.queda}. Um confronto com isto é ${c.confronto}. Narre dentro dessa forma — não a reduza a um vilão de espada porque a cena ficaria mais simples.`;
}

export const ANTAGONISTA_PROMPT = `A AMEAÇA (v9.107 — ela pensa, e às vezes erra):
· As linhas O VILÃO da Pauta trazem o que a ameaça CONCLUIU sobre o herói e o que ela faz por causa disso. A conclusão vem do que chegou até ela, que quase nunca é tudo.
· Quando a linha disser "e está ENGANADO", encene o engano com convicção: ela age com base numa leitura errada e não sabe que é errada. Não corrija, não insinue a verdade — deixe o erro trabalhar.
· A ameaça não é sempre uma pessoa. Se o envelope disser que ela é um conselho, um bando, uma coisa antiga ou uma instituição, narre dentro dessa forma: derrubar quem está na frente pode não acabar com nada.`;
