/* O VEREDITO DO GOLPE (Fase X, etapa X2)

   O que esta suíte protege, e por que cada asserção está escrita assim:

   1. A ABERTURA RECUSA, E NÃO É BUG. `posicionar` põe o herói numa ponta e
      o inimigo na outra; nas DEZ plantas isso dá de 12,0 a 25,5 m, e o corpo
      a corpo alcança 1,5 m. Logo 10/10 recusam no turno 1. Se alguém um dia
      "consertar" isso mexendo no alcance em vez de mexer na abertura, esta
      seção fica vermelha e diz o número que ele quebrou.

   2. "TEM ALCANCE" NÃO É "PODE ACERTAR". A 36 m, três plantas continuam
      recusando — e por PAREDE, não por distância. São duas recusas
      diferentes: uma se resolve andando, a outra contornando.

   3. A ARMADILHA DE MEDIÇÃO, que já custou uma conferência errada:
      `montarGrade({ planta })` NÃO monta a planta pedida. `cenarioDe` lê
      `emMasmorra`, `local` e `bioma` — mais nada — e cai em `estrada` em
      SILÊNCIO. Por isso toda planta medida aqui confere a largura×altura
      que recebeu, e há uma asserção dedicada só para a armadilha.

   4. A FRASE DO BOTÃO CASA O MESMO DETECTOR QUE A DIGITADA. Provado contra
      os módulos reais e contra a regex EXTRAÍDA do App.jsx — nunca contra
      uma cópia, que envelheceria sozinha no dia em que o App mudasse. */

const RAIZ = "../src/";
const { readFileSync } = await import("node:fs");

const G = await import(RAIZ + "grid.js");
const GOLPE = await import(RAIZ + "golpe.js");
const AGR = await import(RAIZ + "agressao.js");
const DES = await import(RAIZ + "desafios.js");
/* o bestiário de VERDADE: a asserção nº 3 do bloco 7 mede os nomes que a
   casa escreveu, não uma lista copiada que envelheceria sozinha */
const BES = await import(RAIZ + "bestiario.js");
const APP = readFileSync("../src/App.jsx", "utf8");

let bons = 0, maus = 0;
const t = (nome, cond) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

/* O contexto que REALMENTE monta cada planta. Ver o item 3 do cabeçalho:
   não existe chave `planta`, e pedir por ela devolve estrada calada. */
const CTX = {
  taverna: { local: "taverna" },
  masmorra: { emMasmorra: true },
  floresta: { bioma: "floresta" },
  estrada: { local: "estrada" },
  cidade: { local: "cidade" },
  caverna: { local: "caverna" },
  ruina: { local: "ruina" },
  navio: { local: "navio" },
  gelo: { bioma: "gelo" },
  deserto: { bioma: "deserto" },
};

/* monta a grade DE VERDADE e confere que recebeu a planta que pediu */
const gradeConferida = (id) => {
  const g = G.montarGrade(CTX[id]);
  const p = G.PLANTAS[id];
  const bate = g.cenario === id && g.largura === p.largura && g.altura === p.altura;
  return { g, bate };
};

const abertura = (id) => {
  const { g, bate } = gradeConferida(id);
  const pos = G.posicionar(g, {
    heroi: { nome: "Você", vida: 20 },
    inimigos: [{ nome: "Bandido", vida: 10 }],
  });
  return { g, bate, heroi: pos.heroi, inimigos: pos.inimigos };
};

const IDS = Object.keys(CTX);

sec("0. A ARMADILHA DE MEDIÇÃO — `planta` não é chave de cenário");
{
  const falsa = G.montarGrade({ planta: "taverna" });
  t("pedir por `planta` NÃO monta a taverna", falsa.cenario !== "taverna");
  t("e cai em estrada, em silêncio, com a medida da estrada",
    falsa.cenario === "estrada" && falsa.largura === 18 && falsa.altura === 12);
  /* e o caminho certo funciona: é a diferença que a asserção acima protege */
  t("o contexto certo monta a taverna", G.montarGrade(CTX.taverna).cenario === "taverna");
  t("as dez plantas do catálogo estão todas medidas aqui",
    IDS.length === 10 && IDS.every((id) => !!G.PLANTAS[id]) && Object.keys(G.PLANTAS).length === 10);
}

sec("1. A ABERTURA — 10 de 10 recusam o corpo a corpo no turno 1");
{
  const CORPO = GOLPE.ALCANCES.corpoACorpoPadrao;
  t("o corpo a corpo da tabela é 1,5 m", CORPO === 1.5);

  const fora = [], medidas = [], faixaMa = [];
  for (const id of IDS) {
    const { g, bate, heroi, inimigos } = abertura(id);
    if (!bate) faixaMa.push(id + " (grade errada)");
    const v = GOLPE.vereditoDoGolpe({ grade: g, meuLugar: heroi, inimigos, alcanceM: CORPO });
    const d = v.alvos[0].distanciaM;
    medidas.push(`${id} ${d}`);
    if (v.algumAoAlcance) fora.push(id + " alcançou");
    if (d < 12 || d > 25.5) fora.push(`${id} fora da faixa (${d})`);
    if (v.alvos[0].razao !== "longe") fora.push(`${id} recusou por ${v.alvos[0].razao}`);
    if (v.faltaM !== Math.round((d - CORPO) * 10) / 10) fora.push(id + " faltaM errado");
  }
  t(`toda planta conferiu a largura×altura que pediu${faixaMa.length ? " — " + faixaMa.join(", ") : ""}`, faixaMa.length === 0);
  t(`10/10 recusam, na faixa 12,0–25,5 m, por distância${fora.length ? " — " + fora.join("; ") : ""}`, fora.length === 0);
  console.log("      distâncias medidas: " + medidas.join(" · "));

  /* as duas pontas da faixa, cravadas: se `posicionar` mudar, é aqui que se vê */
  const tav = abertura("taverna");
  const mas = abertura("masmorra");
  const vt = GOLPE.vereditoDoGolpe({ grade: tav.g, meuLugar: tav.heroi, inimigos: tav.inimigos, alcanceM: CORPO });
  const vm = GOLPE.vereditoDoGolpe({ grade: mas.g, meuLugar: mas.heroi, inimigos: mas.inimigos, alcanceM: CORPO });
  t("a taverna é a ponta curta: 12,0 m", vt.alvos[0].distanciaM === 12);
  t("a masmorra é a ponta longa: 25,5 m", vm.alvos[0].distanciaM === 25.5);
  t("e faltam 10,5 m para o golpe na taverna", vt.faltaM === 10.5);
  t("o veredito diz o LUGAR do alvo, não a coordenada", !!vt.alvos[0].lugar && !/\d/.test(vt.alvos[0].lugar));
  t("a recusa vem em voz de mundo, com o motivo de `alcanca`", /longe demais/.test(vt.alvos[0].porque));
  t("e a tela recebe o metro inteiro que a recusa de hoje imprime", vm.alvos[0].metrosRedondos === 26);
}

sec("2. A 36 M — três continuam recusando, e é a PAREDE");
{
  const LONGE = GOLPE.ALCANCES.armaDeLonge;
  t("a arma de longe da tabela é 36 m", LONGE === 36);

  const recusam = [], erradas = [];
  for (const id of IDS) {
    const { g, heroi, inimigos } = abertura(id);
    const v = GOLPE.vereditoDoGolpe({ grade: g, meuLugar: heroi, inimigos, alcanceM: LONGE });
    if (!v.algumAoAlcance) {
      recusam.push(id);
      const a = v.alvos[0];
      if (a.razao !== "parede") erradas.push(`${id} recusou por ${a.razao}`);
      if (!/parede/.test(a.porque)) erradas.push(`${id} não fala de parede`);
      /* e é a prova de que não é distância: andar não resolve */
      if (v.faltaM !== 0) erradas.push(`${id} diz que faltam metros`);
    }
  }
  t(`recusam a 36 m: taverna, caverna, navio — e só elas (${recusam.join(", ")})`,
    recusam.length === 3 && ["taverna", "caverna", "navio"].every((x) => recusam.includes(x)));
  t(`e todas as três por PAREDE, com faltaM zero${erradas.length ? " — " + erradas.join("; ") : ""}`, erradas.length === 0);

  /* o custo de atirar longe continua sendo o de grid.js, e não um número
     novo daqui: 25,5 m são duas faixas de 9 m, logo 2 × 2 de penalidade */
  const mas = abertura("masmorra");
  const vm = GOLPE.vereditoDoGolpe({ grade: mas.g, meuLugar: mas.heroi, inimigos: mas.inimigos, alcanceM: LONGE });
  t("a 25,5 m o tiro alcança", vm.algumAoAlcance === true);
  t("e cobra a penalidade por faixa de grid.js, não uma daqui",
    vm.alvos[0].penalidade === 2 * G.PENALIDADE_POR_FAIXA
    && vm.alvos[0].penalidade === Math.floor(25.5 / G.METROS_POR_FAIXA) * G.PENALIDADE_POR_FAIXA);
  t("e golpe.js não reescreve a tabela de faixa", !/METROS_POR_FAIXA\s*=/.test(readFileSync("../src/golpe.js", "utf8")));
}

sec("3. `alcanceDoGolpe` — a linha de hoje, agora provável");
{
  const A = GOLPE.ALCANCES;
  /* a linha de App.jsx:11608-11610, reproduzida aqui como referência viva:
     armaLonge ? 36 : alcanceNatural({nome,tamanho}) + (temAlcance ? 1,5 : 0) */
  const hoje = (armaLonge, temAlcance, nome, tamanho) => (armaLonge
    ? 36
    : G.alcanceNatural({ nome, tamanho }) + (temAlcance ? G.METROS_POR_QUADRADO : 0));

  const casos = [
    { armaLonge: false, temPropAlcance: false, nome: "Você", tamanho: null },
    { armaLonge: false, temPropAlcance: true, nome: "Você", tamanho: null },
    { armaLonge: true, temPropAlcance: false, nome: "Você", tamanho: null },
    { armaLonge: true, temPropAlcance: true, nome: "Ogro", tamanho: null },
    { armaLonge: false, temPropAlcance: false, nome: "Ogro", tamanho: null },
    { armaLonge: false, temPropAlcance: true, nome: "Ogro", tamanho: "grande" },
  ];
  const divergem = casos.filter((c) =>
    GOLPE.alcanceDoGolpe(c) !== hoje(c.armaLonge, c.temPropAlcance, c.nome, c.tamanho));
  t(`nenhum caso diverge da linha de hoje (${casos.length} conferidos)`, divergem.length === 0);

  /* e os três valores saem da TABELA, não de literais repetidos */
  t("natural: 1,5 m, e é o valor da tabela",
    GOLPE.alcanceDoGolpe({ nome: "Você" }) === A.corpoACorpoPadrao && A.corpoACorpoPadrao === 1.5);
  t("com a propriedade `alcance`: 1,5 + um quadrado = 3 m",
    GOLPE.alcanceDoGolpe({ nome: "Você", temPropAlcance: true }) === A.corpoACorpoPadrao + A.bonusDaPropriedadeAlcance
    && A.bonusDaPropriedadeAlcance === G.METROS_POR_QUADRADO);
  t("arma de longe: 36 m", GOLPE.alcanceDoGolpe({ armaLonge: true }) === A.armaDeLonge);
  t("e a arma de longe ignora tamanho e propriedade, como hoje",
    GOLPE.alcanceDoGolpe({ armaLonge: true, temPropAlcance: true, nome: "Ogro" }) === A.armaDeLonge);
  t("o ogro alcança mais de perto, porque o tamanho manda",
    GOLPE.alcanceDoGolpe({ nome: "Ogro" }) === 3);
  t("sem argumento nenhum, ainda responde o piso", GOLPE.alcanceDoGolpe() === A.corpoACorpoPadrao);

  /* v9.255 — A ASSERÇÃO MUDOU DE LADO, exatamente como estava escrito aqui
     que mudaria, só que uma etapa antes: a fiação veio em X2, não em X3.
     `resolverAtaqueJogador` chama `alcanceDoGolpe` e `vereditoDoGolpe`, e os
     literais `36` e `+ METROS_POR_QUADRADO` saíram de dentro dele.

     O QUE ELA PROTEGE CONTINUA SENDO O MESMO — que o número não mude ao
     mudar de casa. Antes provava "o literal do App ainda é 36"; agora prova
     "o literal sumiu, quem responde por ele é a tabela, e a tabela ainda diz
     36". Se alguém recolocar um alcance cravado no App, aqui fica vermelho, e
     é a mesma doença que a primeira lei desta casa proíbe. */
  t("o 36 saiu do App e quem responde por ele é a tabela",
    !/armaLonge\s*\n?\s*\?\s*36/.test(APP)
    && /alcanceDoGolpe\(\{\s*armaLonge/.test(APP)
    && A.armaDeLonge === 36);
}

sec("4. A FRASE DO BOTÃO CASA O MESMO DETECTOR QUE A DIGITADA");
{
  /* a regex do App é EXTRAÍDA do arquivo, nunca copiada: uma cópia
     envelheceria sozinha no dia em que o App mudasse o verbo */
  const m = APP.match(/const verboAtaque = \/(.+?)\/\.test\(acaoN\);/);
  t("a regex de ataque do App foi encontrada para ser lida", !!m);
  const rxApp = m ? new RegExp(m[1]) : /$^/;
  const N = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  t("com alvo, a frase é a canônica", GOLPE.fraseDoGolpe({ nome: "Bandido" }) === "Ataco Bandido");
  t("o alvo também pode vir como texto", GOLPE.fraseDoGolpe("Bandido") === "Ataco Bandido");
  t("sem alvo, é a frase de hoje", GOLPE.fraseDoGolpe() === "Ataco");
  t("e null não estoura", GOLPE.fraseDoGolpe(null) === "Ataco");

  /* o botão de hoje injeta "Ataco " na caixa; a frase do módulo é a mesma
     palavra, aparada. Se o botão mudar de texto, esta linha pega. */
  const botao = APP.match(/rotulo: "Atacar", texto: "([^"]*)"/);
  t("o botão Atacar de hoje escreve \"Ataco \"", !!botao && botao[1] === "Ataco ");
  t("e a frase do módulo é exatamente esse texto aparado", !!botao && GOLPE.fraseDoGolpe() === botao[1].trim());

  for (const f of [GOLPE.fraseDoGolpe(), GOLPE.fraseDoGolpe({ nome: "Bandido" }), GOLPE.fraseDoGolpe({ nome: "Capitão da Guarda" })]) {
    t(`"${f}" casa o detector de ataque do App`, rxApp.test(N(f)));
    t(`"${f}" casa ehDeclaracaoDeAtaque (agressao.js)`, AGR.ehDeclaracaoDeAtaque(f) === true);
  }
  /* e o alvo montado pela frase é reencontrado pelo módulo real de agressão:
     é isso que impede o botão de virar um caminho paralelo */
  const alvo = AGR.alvoDaAgressao(GOLPE.fraseDoGolpe({ nome: "Bram, o Torto" }), { presentes: [{ nome: "Bram, o Torto", papel: "guarda" }] });
  t("e o alvo da frase é reencontrado por alvoDaAgressao", !!alvo && alvo.nome === "Bram, o Torto");
}

sec("5. OS SEIS VERBOS — a tabela declara a verdade MEDIDA");
{
  const V = GOLPE.VERBOS_DE_COMBATE;
  const m = APP.match(/const verboAtaque = \/(.+?)\/\.test\(acaoN\);/);
  const rxApp = m ? new RegExp(m[1]) : /$^/;
  const N = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  t("são os seis da mesa de design, nesta ordem",
    V.map((v) => v.id).join(",") === "atacar,mover,esquivar,empurrar,derrubar,saltar");
  t("cada um tem id e rótulo", V.every((v) => v.id && v.rotulo));
  t("e `motor` é string ou null — nunca ausente", V.every((v) => Object.prototype.hasOwnProperty.call(v, "motor")));

  /* A PROVA: os que a tabela diz SEM MOTOR não chegam a motor nenhum.
     Se alguém der mecânica a um deles sem atualizar a tabela, aqui fica
     vermelho — a tabela deixa de ser uma afirmação que envelhece sozinha. */
  const mentem = [];
  for (const v of V.filter((x) => !x.motor)) {
    if (!v.porqueSemMotor) mentem.push(v.id + " sem motivo escrito");
    if (rxApp.test(N(v.frase))) mentem.push(v.id + " casa o verbo de ataque do App");
    if (AGR.ehDeclaracaoDeAtaque(v.frase)) mentem.push(v.id + " casa agressao.js");
    if (DES.lerAcao(v.frase, {})) mentem.push(v.id + " casa um desafio");
    if (DES.desafioPorId(v.id)) mentem.push(v.id + " já tem desafio no catálogo");
  }
  t(`esquivar, empurrar e derrubar continuam sem motor${mentem.length ? " — " + mentem.join("; ") : ""}`, mentem.length === 0);
  t("e são exatamente esses três", V.filter((x) => !x.motor).map((x) => x.id).join(",") === "esquivar,empurrar,derrubar");

  /* e os que a tabela diz COM motor, têm */
  t("atacar chega ao motor do App", rxApp.test(N(GOLPE.fraseDoGolpe({ nome: "Bandido" }))));
  const salto = DES.lerAcao(V.find((v) => v.id === "saltar").frase, {});
  t("saltar chega ao motor pelo texto, casando o desafio `saltar`", !!salto && salto.id === "saltar");
  t("e o desafio existe mesmo no catálogo", !!DES.desafioPorId("saltar"));
  t("mover não tem frase: ele é o clique no tabuleiro", V.find((v) => v.id === "mover").frase === "");

  /* a tabela espelha os botões de HOJE, palavra por palavra */
  const divergem = [];
  for (const v of V) {
    if (!v.frase) continue;
    const b = APP.match(new RegExp(`rotulo: "${v.rotulo}", texto: "([^"]*)"`));
    if (!b) { divergem.push(v.rotulo + " não tem botão no App"); continue; }
    if (b[1].trim() !== v.frase) divergem.push(`${v.rotulo}: App diz "${b[1].trim()}"`);
  }
  t(`toda frase da tabela é a do botão de hoje${divergem.length ? " — " + divergem.join("; ") : ""}`, divergem.length === 0);
}

sec("6. LIXO, IMUTABILIDADE E DETERMINISMO");
{
  const { g, heroi, inimigos } = abertura("floresta");

  /* `= {}` no destructuring NÃO cobre `null` — por isso cada um é testado */
  let estourou = null;
  try {
    GOLPE.vereditoDoGolpe(null);
    GOLPE.vereditoDoGolpe(undefined);
    GOLPE.vereditoDoGolpe({});
    GOLPE.vereditoDoGolpe({ grade: null, meuLugar: null, inimigos: null });
    GOLPE.vereditoDoGolpe({ grade: g, meuLugar: null, inimigos });
    GOLPE.vereditoDoGolpe({ grade: g, meuLugar: heroi, inimigos: null });
  } catch (e) { estourou = String(e && e.message); }
  t(`null explícito não estoura em lugar nenhum${estourou ? " — " + estourou : ""}`, !estourou);

  const vazio = GOLPE.vereditoDoGolpe({ grade: g, meuLugar: heroi, inimigos: null });
  t("sem inimigos, o veredito é honesto: não há luta", vazio.semLuta === true && vazio.algumAoAlcance === false);
  t("e diz por quê, sem inventar alvo", /não há luta/.test(vazio.porque) && vazio.alvos.length === 0 && vazio.maisProximo === null);

  /* A REGRA DE OURO de grid.js herdada: sem grade, tudo alcança */
  const semTerreno = GOLPE.vereditoDoGolpe({ grade: null, meuLugar: heroi, inimigos, alcanceM: 1.5 });
  t("sem terreno definido, tudo se comporta como antes: alcança",
    semTerreno.algumAoAlcance === true && semTerreno.semTerreno === true && semTerreno.alvos[0].penalidade === 0);
  t("e não inventa distância que não foi medida", semTerreno.alvos[0].distanciaM === 0);

  /* quem caiu sai do veredito, e a lista original não é tocada */
  const comMorto = [{ nome: "Vivo", vida: 5, x: inimigos[0].x, y: inimigos[0].y }, { nome: "Morto", vida: 0, x: 1, y: 1 }, { nome: "Caído", vida: 9, derrotado: true, x: 2, y: 2 }];
  const antes = JSON.stringify(comMorto);
  const vm = GOLPE.vereditoDoGolpe({ grade: g, meuLugar: heroi, inimigos: comMorto, alcanceM: 36 });
  t("só os vivos entram no veredito", vm.alvos.length === 1 && vm.alvos[0].nome === "Vivo");
  t("e o índice aponta de volta para a lista original", vm.alvos[0].indice === 0);
  t("nada foi mutado na lista de inimigos", JSON.stringify(comMorto) === antes);

  /* determinismo: geometria não sorteia */
  const a = GOLPE.vereditoDoGolpe({ grade: g, meuLugar: heroi, inimigos, alcanceM: 36 });
  const b = GOLPE.vereditoDoGolpe({ grade: g, meuLugar: heroi, inimigos, alcanceM: 36 });
  t("o mesmo veredito duas vezes, caractere por caractere", JSON.stringify(a) === JSON.stringify(b));
  t("e é estrutura NOVA a cada chamada", a !== b && a.alvos !== b.alvos);

  /* sem alcanceM, o veredito assume o corpo a corpo de quem está lá */
  const semArma = GOLPE.vereditoDoGolpe({ grade: g, meuLugar: heroi, inimigos });
  t("sem arma declarada, o alcance é o natural do herói", semArma.alcanceM === GOLPE.ALCANCES.corpoACorpoPadrao);

  /* e o módulo é puro: nada de React, nada de App */
  /* sem os comentários: o cabeçalho CITA o App.jsx de propósito (é de lá que
     a conta saiu), e uma citação não é um import */
  const CRU = readFileSync("../src/golpe.js", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  t("golpe.js não importa React nem o App", !/from "react|from ".*App/.test(CRU));
  t("e não reimplementa geometria: compõe grid.js", /from "\.\/grid\.js"/.test(CRU) && !/Math\.hypot|linhaDeVisao\s*\(/.test(CRU));
}

sec("7. AS QUATRO FRASES — o teto de 54 caracteres, e o aparo que mora na tabela");
{
  /* W2 §3. A linha que mais aparece no combate media 64 a 86 caracteres
     contra um teto de 54, e a recusa media 60 COM O NOME VAZIO — logo
     aparar o nome nunca a salvaria. O que mudou foi a REDACÇÃO; o aparo
     ficou como cinto contra o nome que o Narrador inventa.

     As cinco asserções abaixo LEEM A TABELA DE VOLTA, e é essa a diferença
     entre uma medida e uma afirmação: se alguém reescrever uma frase e
     esquecer o `fixo` ao lado dela, a nº 1 fica vermelha na mesma hora. */
  const TETO = GOLPE.TETO_DA_LINHA;
  const L = GOLPE.LINHAS_DO_GOLPE;
  const IDS4 = ["semAlvo", "distancia", "parede", "aoAlcance"];
  const NUM = TETO.numeroMaisLargo;

  t("a tabela traz as quatro frases, e só elas", Object.keys(L).join(",") === IDS4.join(","));
  t(`o teto é ${TETO.chars}, e o pior nome e o pior número vêm com ele`,
    TETO.chars === 54 && TETO.nomeMaisLongoDasTabelas === 18 && NUM.length === 4
    && NUM === G.metrosTxt(10.5));

  /* 1 — O NÚMERO DECLARADO TEM DE BATER COM A FRASE QUE ESTÁ AO LADO DELE.
     Um `fixo` que mente sobre a própria linha é pior do que número nenhum:
     todas as outras quatro asserções o usam como base. */
  const mentem = IDS4.filter((id) => L[id].monta("", NUM, NUM).length !== L[id].fixo);
  t(`o \`fixo\` de cada entrada bate com a própria frase, de nome vazio${mentem.length ? " — " + mentem.join(", ") : ""}`,
    mentem.length === 0);
  console.log("      fixos medidos: " + IDS4.map((id) => `${id} ${L[id].monta("", NUM, NUM).length}`).join(" · "));

  /* 2 — as quatro cabem com o pior nome DAS TABELAS, sem o aparo entrar */
  const estouram = IDS4.filter((id) => L[id].fixo + TETO.nomeMaisLongoDasTabelas > TETO.chars);
  t(`as quatro cabem com o pior nome das tabelas (${TETO.nomeMaisLongoDasTabelas}) sem aparo${estouram.length ? " — " + estouram.join(", ") : ""}`,
    estouram.length === 0);

  /* as três funções que mudaram de casa, exercidas pelo veredito que elas
     leem — é por aqui que os 27 nomes passam, e não pela `monta` crua */
  const vdLonge = (nome) => ({ semLuta: false, maisProximo: { nome, distanciaM: 10.5, razao: "longe" }, faltaM: 10.5, aoAlcance: [] });
  const vdParede = (nome) => ({ semLuta: false, maisProximo: { nome, distanciaM: 10.5, razao: "parede" }, faltaM: 0, aoAlcance: [] });
  const vdPerto = (nome) => ({ semLuta: false, alcanceM: 10.5, aoAlcance: [{ nome, distanciaM: 10.5 }] });
  const asQuatro = (nome) => [
    GOLPE.recusaDoGolpe({ semLuta: true }),
    GOLPE.recusaDoGolpe(vdLonge(nome)),
    GOLPE.recusaDoGolpe(vdParede(nome)),
    GOLPE.linhaDoGolpe(vdPerto(nome)),
  ];

  /* 3 — OS 27 NOMES DO BESTIÁRIO × O PIOR NÚMERO. A distância 10,5 é o pior
     que `metrosTxt` escreve numa medida que o tabuleiro alcança (a diagonal
     máxima é 33,9 m e o maior alcance é 37,5 m — os dois com 4 caracteres). */
  const NOMES = [...BES.CRIATURAS_FANTASIA, ...BES.ARQUETIPOS].map((c) => c.nome);
  t(`o bestiário deu os 27 nomes que W2 varreu (${NOMES.length})`, NOMES.length === 27);
  const maiorNome = NOMES.reduce((a, b) => (b.length > a.length ? b : a), "");
  t(`e o mais longo é "${maiorNome}" (${maiorNome.length}), como a tabela declara`,
    maiorNome.length === TETO.nomeMaisLongoDasTabelas);

  let pior = { n: 0, frase: "" };
  const passaram = [];
  for (const nome of NOMES) {
    for (const f of asQuatro(nome)) {
      if (f.length > TETO.chars) passaram.push(`${nome}: ${f.length} — "${f}"`);
      if (f.length > pior.n) pior = { n: f.length, frase: f };
    }
  }
  t(`27 nomes × 4 frases cabem no teto${passaram.length ? " — " + passaram.slice(0, 3).join("; ") : ""}`, passaram.length === 0);
  console.log(`      o pior dos 108: ${pior.n} — "${pior.frase}"`);

  /* 4 — O NOME QUE O NARRADOR INVENTA. 200 caracteres é absurdo de
     propósito: se o aparo morasse na tela, esta asserção não existiria. */
  const monstro = "M".repeat(200);
  const gigantes = asQuatro(monstro);
  t("com um nome de 200 caracteres, nenhuma das quatro passa do teto",
    gigantes.every((f) => f.length <= TETO.chars));
  t("e as três que carregam nome terminam em reticência, não cortadas a meio",
    gigantes.filter((f) => f.includes(monstro.slice(0, 10))).length === 3
    && gigantes.filter((f) => f.includes(monstro.slice(0, 10))).every((f) => /…$|…\s/.test(f)));

  /* 5 — A QUE MAIS PROTEGE: NENHUM NOME DE ≤25 CARACTERES É APARADO. O
     aparo é cinto contra o inesperado, não comportamento normal — a frase
     nunca é mutilada por uma criatura que existe nas tabelas (máximo 18). */
  const mutilados = [];
  for (let n = 1; n <= 25; n++) {
    const nome = "N".repeat(n);
    for (const f of asQuatro(nome)) {
      if (f.includes("…")) mutilados.push(`${n} caracteres: "${f}"`);
      if (n <= 18 && !f.includes(nome) && f !== L.semAlvo.monta()) mutilados.push(`${n} perdeu o nome: "${f}"`);
    }
  }
  t(`nenhum nome de até 25 caracteres é aparado${mutilados.length ? " — " + mutilados.slice(0, 3).join("; ") : ""}`,
    mutilados.length === 0);
  const apertada = IDS4.filter((id) => id !== "semAlvo").reduce((a, id) => (L[id].fixo > L[a].fixo ? id : a), "distancia");
  t(`e a entrada mais apertada é \`${apertada}\`, que só morde acima de ${TETO.chars - L[apertada].fixo}`,
    apertada === "parede" && TETO.chars - L.parede.fixo === 25);

  /* e as três mudaram mesmo de casa: a definição saiu do App, o import
     entrou, e os leitores continuam os mesmos dois que W2 nomeou */
  t("as três funções saíram do App.jsx e chegam por import de golpe.js",
    !/const (recusaDoGolpe|linhaDoGolpe|maisPertoAoAlcance) =/.test(APP)
    && /import \{[^}]*recusaDoGolpe[^}]*linhaDoGolpe[^}]*maisPertoAoAlcance[^}]*\} from "\.\/golpe\.js"/.test(APP));
  t("e o App continua com os seus dois leitores da recusa, e um da linha",
    (APP.match(/recusaDoGolpe\(/g) || []).length === 2
    && (APP.match(/linhaDoGolpe\(/g) || []).length === 1);
  t("e `maisPertoAoAlcance` continua com as suas duas fiações no App",
    (APP.match(/maisPertoAoAlcance\(/g) || []).length === 2);

  /* o veredito real, de ponta a ponta: a abertura da taverna recusa por
     distância, e a frase que o jogador lê cabe */
  const tav = abertura("taverna");
  const vt = GOLPE.vereditoDoGolpe({ grade: tav.g, meuLugar: tav.heroi, inimigos: tav.inimigos, alcanceM: GOLPE.ALCANCES.corpoACorpoPadrao });
  const recusa = GOLPE.recusaDoGolpe(vt);
  t(`a recusa real da taverna cabe: "${recusa}" (${recusa.length})`, recusa.length <= TETO.chars);
  t("e é a frase da distância, não a da parede", /faltam/.test(recusa) && !/parede/.test(recusa));
  t("sem luta, é a frase sem alvo", GOLPE.recusaDoGolpe(null) === L.semAlvo.monta());
  t("e a linha do golpe é vazia quando ninguém está ao alcance",
    GOLPE.linhaDoGolpe(vt) === "" && GOLPE.maisPertoAoAlcance(vt) === null);
}

console.log(`\ngolpe (X2): ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
