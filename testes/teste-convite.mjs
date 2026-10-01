/* O CONVITE (v9.143)

   Sobrou uma porta em que a IA ainda decidia o que existe. Convidar alguém
   para o grupo mandava ao Narrador:

     "A decisão é dele(a): pode aceitar (registre em `grupo_adicionar` com a
      ficha completa), recusar com jeito, ou pedir uma condição."

   A ficha já era do sistema desde a v9.116 — só o SIM ficou com a IA. E
   ficou justamente onde havia mais material para decidir por código: desde
   a v9.136 esta pessoa tem traços, medo, força e, às vezes, um plano. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const semCom = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semCom(readFileSync("../src/App.jsx", "utf8"));
const I = await import(S + "indole.js");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

/* acha alguém no mundo determinístico com o traço pedido */
const comTraco = (traco, semente = "mundo") => {
  for (let i = 0; i < 3000; i++) {
    const p = { nome: `Gente ${i}`, relevancia: "arco" };
    const ind = I.indoleDe(semente, p);
    if ((ind.tracos || []).includes(traco) && ind.proposito !== "seguir") return { p, ind };
  }
  return null;
};

sec("1. A DECISÃO SAIU DA IA");
{
  const H = APP.slice(APP.indexOf("const convidarNpc = (nome)"), APP.indexOf("const bancarOConvite"));
  t("o handler existe", H.length > 200);
  t("não manda mais a IA decidir", !/A decisão é dele/i.test(H));
  t("nem pedir a ficha completa", !/com a ficha completa/.test(H));
  t("quem pesa é o código", /const v = vereditoDoConvite\(nome\)/.test(H));
  t("e o Narrador recebe fato consumado", /enviar\(envelopeDoConvite\(nome, v\), personagem\)/.test(H));
  /* e o veredito muda o mundo ANTES da narração */
  t("entra no grupo antes de narrar", APP.indexOf("const r = porNoGrupo(nome)") < APP.indexOf("enviar(envelopeDoConvite(nome, v)"));
}

sec("2. NINGUÉM LARGA A VIDA POR QUEM CONHECEU ONTEM");
{
  let a = 0, e = 0, r = 0;
  for (let i = 0; i < 500; i++) {
    const ind = I.indoleDe("w", { nome: `P${i}`, relevancia: "arco" });
    const v = I.pesarConvite(ind, { convivio: { dias: 0 }, fama: 0 });
    if (v.resposta === "aceita") a++; else if (v.resposta === "exige") e++; else r++;
  }
  t("no primeiro dia, a grande maioria recusa", r > 300);
  t("mas não é impossível", a + e > 0);
  /* e com tempo, laço e lenda, a porta abre */
  let a2 = 0;
  for (let i = 0; i < 500; i++) {
    const ind = I.indoleDe("w", { nome: `P${i}`, relevancia: "arco" });
    if (I.pesarConvite(ind, { convivio: { dias: 20, forcaDoLaco: 3, meDeve: true }, fama: 80 }).resposta === "aceita") a2++;
  }
  t("com tempo, laço e lenda, a maioria aceita", a2 > 350);
  t("e a diferença é enorme", a2 > a * 5);
}

sec("3. QUEM ELA É DECIDE");
{
  const medroso = comTraco("medroso");
  const corajoso = comTraco("corajoso");
  t("existe medroso no mundo", !!medroso);
  t("e corajoso", !!corajoso);
  const conv = { convivio: { dias: 6 }, fama: 30 };
  t("o corajoso vai mais fácil que o medroso",
    ["recusa", "exige", "aceita"].indexOf(I.pesarConvite(corajoso.ind, conv).resposta)
    >= ["recusa", "exige", "aceita"].indexOf(I.pesarConvite(medroso.ind, conv).resposta));
  t("o medroso puxa para longe", I.VONTADE_DE_IR.medroso < 0);
  t("o corajoso, para perto", I.VONTADE_DE_IR.corajoso > 0);
  /* A LINHA QUE MAIS INTERESSA AO JOGO: o traidor aceita fácil, e não é
     bondade — andar junto é a posição de onde se trai. */
  t("o traidor aceita fácil", I.VONTADE_DE_IR.traidor > 0);
  t("mais fácil que o fiel? não: igual ordem de grandeza", Math.abs(I.VONTADE_DE_IR.traidor - I.VONTADE_DE_IR.fiel) <= 5);
  /* todo traço que a índole tem, ou puxa ou não puxa — mas nenhum some
     sem alguém ter decidido isso */
  const semVoto = I.TRACOS.map((x) => x.id).filter((x) => I.VONTADE_DE_IR[x] === undefined);
  t(`todo traço tem voto no convite (${semVoto.join(", ") || "—"})`, semVoto.length === 0);
  /* e o veredito se explica, sempre */
  const v = I.pesarConvite(corajoso.ind, conv);
  t("o veredito traz os porquês", v.porques.length > 0);
}

sec("4. QUEM JÁ QUERIA IR, VAI");
{
  /* `seguir` é o único propósito que se cumpre ACEITANDO — seria injusto o
     sistema ignorar isso */
  const achado = (() => {
    for (let i = 0; i < 3000; i++) {
      const ind = I.indoleDe("s", { nome: `Q${i}`, relevancia: "arco" });
      if (ind.proposito === "seguir") return ind;
    }
    return null;
  })();
  t("existe quem tenha o propósito de seguir", !!achado);
  const v = I.pesarConvite(achado, { convivio: { dias: 2 }, fama: 0 });
  t("e o sistema conta isso", v.porques.some((x) => /já queria ir/.test(x)));
  t("mesmo cedo, a resposta não é fria", v.resposta !== "recusa");
}

sec("5. O GRUPO CHEIO É UM NÃO SECO");
{
  const ind = I.indoleDe("m", { nome: "Fina", relevancia: "arco" });
  const v = I.pesarConvite(ind, { convivio: { dias: 99, forcaDoLaco: 3 }, fama: 99, grupoCheio: true });
  t("com o grupo cheio, recusa", v.resposta === "recusa");
  t("e diz que é falta de lugar", /não há lugar/.test(v.porques.join(" ")));
  t("e não inventa condição", v.exigencia === null);
}

sec("6. A CONDIÇÃO É CONFERÍVEL");
{
  const tipos = new Set();
  for (let i = 0; i < 800; i++) {
    const ind = I.indoleDe("x", { nome: `R${i}`, relevancia: "arco" });
    const v = I.pesarConvite(ind, { convivio: { dias: 3 }, fama: 20 });
    if (v.resposta === "exige") tipos.add(v.exigencia.tipo);
    /* v9.314: o `laco` só aparece depois do sétimo dia — antes disso todo
       "talvez" ainda chega ao "sim" pelo tempo (1,5 por dia até o teto de
       20 cobre os 20 pontos entre o talvez e o sim) */
    const v2 = I.pesarConvite(ind, { convivio: { dias: 12 }, fama: 20 });
    if (v2.resposta === "exige") tipos.add(v2.exigencia.tipo);
  }
  /* MOVIDA na v9.314: eram duas condições, `paga` e `convivio`. A de
     convívio prometia `max(1, 5 − dias)` sem olhar a balança, e só 5,2%
     das promessas se cumpriam no dia prometido (seção 9). Quem nem o teto
     de dias leva ao "sim" passou a dizer o que falta de verdade — um laço —,
     e essa é a terceira. A intenção da asserção sobrevive: toda condição é
     de um tipo conhecido, e o App sabe o que fazer com cada um (a soleira
     só oferece `paga`; `bancarOConvite` recusa o resto em voz alta). */
  t("as condições são três e conhecidas", [...tipos].every((x) => ["paga", "convivio", "laco"].includes(x)));
  t("e as três aparecem", tipos.size === 3);
  /* o App confere as duas — e diz que tempo não se compra */
  t("o App cobra a moeda", /ex\.tipo === "paga"/.test(APP));
  /* a moeda sai da MESMA ficha que segue para o turno: descontar por um
     `setPersonagem` em paralelo era o caminho de volta ao defeito acima */
  t("e sai da bolsa", /moedas: Math\.max\(0, \(r\.personagem\.moedas \|\| 0\) - ex\.moedas\)/.test(APP));
  t("e não por um setPersonagem solto", !/setPersonagem\(\(pp\) => \(\{ \.\.\.pp, moedas: \(pp\.moedas \|\| 0\) - ex\.moedas/.test(APP));
  t("e recusa comprar tempo", /isso é tempo, e tempo não se compra/.test(APP));
  t("o botão de pagar só aparece para moeda", /v\.exigencia\.tipo === "paga" && onBancar/.test(APP));
}

sec("7. A FICHA MORA NUM LUGAR SÓ");
{
  /* a montagem estava dentro do laço que lê a resposta da IA; o convite
     precisava dela também, e duas cópias seria a segunda ficando para trás */
  t("há uma função que monta a ficha", /const fichaDeCompanheiro = \(nome, p\) =>/.test(APP));
  /* os DOIS caminhos, nomeados: o que a IA abre com `grupo_adicionar` e o
     do convite. Contar ocorrências mediria também a definição — que não tem
     parêntese de chamada — e a conta daria errado por um. */
  t("o caminho da resposta da IA usa", /const novoComp = fichaDeCompanheiro\(nome, p\)/.test(APP));
  t("e o caminho do convite também", /const comp = fichaDeCompanheiro\(nome, p\)/.test(APP));
  t("e são só esses dois", (APP.match(/fichaDeCompanheiro\(/g) || []).length === 2);
  t("a nota do recrutamento também", /const notaDoRecrutamento = \(comp\) =>/.test(APP));
  t("e ninguém remonta a ficha à mão", !/const novoComp = \{ nome, conceito:/.test(APP));
  /* as duas guardas continuam: já está no grupo, e grupo cheio */
  t("não entra duas vezes", /já anda com você/.test(APP));
  /* O DEFEITO QUE A PROVA NO JOGO PEGOU. O convite recrutava e logo depois
     chamava `enviar(envelope, personagem)` — com o `personagem` do closure,
     que ainda era o de ANTES. O turno voltava, gravava aquele, e o
     companheiro sumia do save no mesmo segundo em que entrou: a tela dizia
     "juntou-se ao grupo" e o save dizia `grupo: []`. */
  t("quem recruta devolve a ficha nova", /return \{ ok: true, comp, personagem: np \}/.test(APP));
  t("e o turno recebe ESSA, e não a do closure", /enviar\(envelopeDoConvite\(nome, v\), r\.personagem\)/.test(APP));
  t("nem o caminho da paga usa a velha", !/porques: \[`você pagou[\s\S]{0,80}\}\), personagem\)/.test(APP));
  t("e a moeda sai da mesma ficha que vai ao turno", /moedas: Math\.max\(0, \(r\.personagem\.moedas \|\| 0\) - ex\.moedas\)/.test(APP));
  t("e não passa do teto", /o grupo está cheio/.test(APP));
}

sec("8. O ENVELOPE É FATO, E O PAINEL AVISA ANTES");
{
  const e = I.envelopeDoConvite("Fina", { resposta: "recusa", porques: ["vocês se conheceram ontem"] });
  t("diz que o sistema resolveu", /RESOLVIDO PELO SISTEMA/.test(e));
  t("manda narrar só a reação", /Narre SÓ a reação/.test(e));
  t("com este desfecho", /com ESTE desfecho e nenhum outro/.test(e));
  /* a regra antiga que valia a pena manter: um convite não move ninguém */
  t("e nada de partida ou viagem", /ninguém saiu do lugar por causa de um convite/.test(e));
  t("traz os porquês", /O que pesou/.test(e));
  t("o 'sim' diz que já está feito", /já está com você/.test(I.envelopeDoConvite("X", { resposta: "aceita", porques: [] })));
  /* e o jogador vê antes de gastar o convite */
  t("o painel mostra o veredito", /vereditoConvite \? vereditoConvite\(n\.nome\) : null/.test(APP));
  t("com o porquê no título", /v\.porques\.join\("; "\)/.test(APP));
  t("e a condição na tela", /v\.exigencia\.o/.test(APP));
}

/* ============================================================
   v9.314 — "O CONVITE NÃO ANDOU EM 8 DIAS"

   Na prova jogada de MM3b: "mais 5 dias de estrada" para aceitar alguém
   no grupo, e depois de 8 dias pelo painel do tempo, ainda "mais 5". Eram
   dois defeitos em fila, os dois gerais — nenhum de canto:

   1. `criarNPC` montava a ficha campo a campo e JOGAVA FORA o
      `conhecidoEm` que o App lhe mandava em oito lugares. Sem data, o
      convívio de toda pessoa conhecida na sessão era ZERO dias para
      sempre (e "mais 5" é exatamente `max(1, 5 − 0)`). Só um recarregar
      do save dava "dia 0" a todo mundo, e aí o convívio saltava para a
      campanha inteira.
   2. Mesmo com a data, a promessa de dias não olhava a balança: 5,2% se
      cumpriam no dia prometido.
   ============================================================ */
const N = await import(S + "npcs.js");
const M = await import(S + "missoes.js");
const FONTE_I = readFileSync("../src/indole.js", "utf8");

/* 50 mundos × 30 pessoas, com a semente no formato do App
   (`nome da campanha|gênero`) — a mesma gente em toda corrida */
const GENTE = [];
for (let m = 0; m < 50; m++) for (let p = 0; p < 30; p++) {
  const semente = `Campanha ${m}|Fantasia medieval`;
  GENTE.push(I.indoleDe(semente, { nome: `Pessoa ${m}-${p}` }));
}

sec("9. A PROMESSA DE DIAS SE CUMPRE, NO DIA PROMETIDO");
{
  let promessas = 0, cumpridas = 0, exatas = 0, lacos = 0, lacoSemLacoFalha = 0;
  for (const ind of GENTE) for (const fama of [0, 30, 70]) for (const forcaDoLaco of [0, 2, 3]) for (let dias = 0; dias <= 25; dias++) {
    const conv = { dias, forcaDoLaco };
    const v = I.pesarConvite(ind, { convivio: conv, fama });
    if (v.resposta !== "exige") continue;
    if (v.exigencia.tipo === "convivio") {
      promessas++;
      const n = v.exigencia.dias;
      if (I.pesarConvite(ind, { convivio: { ...conv, dias: dias + n }, fama }).resposta === "aceita") cumpridas++;
      /* e não é folgada: um dia antes ainda não era sim */
      if (n === 1 || I.pesarConvite(ind, { convivio: { ...conv, dias: dias + n - 1 }, fama }).resposta !== "aceita") exatas++;
    } else if (v.exigencia.tipo === "laco") {
      lacos++;
      if (forcaDoLaco === 0 && I.pesarConvite(ind, { convivio: { ...conv, dias: 20, forcaDoLaco: 3 }, fama }).resposta !== "aceita") lacoSemLacoFalha++;
    }
  }
  /* ANTES: 1.975 de 37.831 (5,2%), porque era `max(1, 5 − dias)` */
  t(`toda promessa de dias vira sim no dia prometido (${cumpridas}/${promessas})`, promessas > 1000 && cumpridas === promessas);
  t(`e nenhuma é folgada (${exatas}/${promessas})`, exatas === promessas);
  t("quem o tempo não leva lá não promete estrada", lacos > 0);
  t(`e, sem laço, um laço inteiro leva (${lacoSemLacoFalha} falhas)`, lacoSemLacoFalha === 0);
  /* o caso da prova jogada: "mais 5" com 0 dias e "mais 5" com 8 dias não
     pode mais ser a mesma frase para a mesma pessoa */
  let mesmaFrase = 0;
  for (const ind of GENTE) {
    const a = I.pesarConvite(ind, { convivio: { dias: 0 }, fama: 0 });
    const b = I.pesarConvite(ind, { convivio: { dias: 8 }, fama: 0 });
    if (a.resposta === "exige" && b.resposta === "exige" && a.exigencia.tipo === "convivio" && b.exigencia.tipo === "convivio" && a.exigencia.o === b.exigencia.o) mesmaFrase++;
  }
  t("8 dias de estrada mudam o que ela pede", mesmaFrase === 0);
  /* o teto e o passo moram numa tabela, e a promessa lê a mesma tabela */
  t("o tempo do convite é tabela", /const TEMPO_NO_CONVITE = \{ teto: 20, porDia: 1\.5 \}/.test(FONTE_I));
  t("e não há mais o 5 solto", !/5 - \(garantirConvivio/.test(FONTE_I));
  t("lixo não quebra a balança", [null, undefined, {}, 0].every((x) => I.pesarConvite(x, x).resposta === "recusa"));
}

sec("10. A VARREDURA — quantos aceitam, com quantos dias (1500 pessoas)");
{
  /* CATRACA DE NÚMERO. Estes são os números da balança na v9.314, sem
     mudança nenhuma de resposta em relação à v9.313 (1.116.000 casos
     comparados, 0 diferenças). Se alguém rebalancear VONTADE_DE_IR, o
     tempo ou a fama, esta seção quebra — e deve: é para o motivo ir
     escrito no commit, não passar calado. */
  const conta = (dias, extra, fama) => GENTE.filter((ind) => I.pesarConvite(ind, { convivio: { dias, ...extra }, fama }).resposta === "aceita").length;
  const sem = (d) => conta(d, {}, 0);
  t(`sem laço e sem nome, 0 dias: ${sem(0)} aceitam (1,7%)`, sem(0) === 26);
  t(`5 dias: ${sem(5)} (3,3%)`, sem(5) === 50);
  t(`10 dias: ${sem(10)} (10,7%)`, sem(10) === 161);
  t(`20 dias: ${sem(20)} (54,3%) — o teto`, sem(20) === 815);
  t("e depois do teto o tempo não pesa mais", sem(30) === 815 && sem(90) === 815);
  t(`fama 30, 20 dias: ${conta(20, {}, 30)} (69,4%)`, conta(20, {}, 30) === 1041);
  t(`laço 2 e fama 30, 10 dias: ${conta(10, { forcaDoLaco: 2 }, 30)} (69,4%)`, conta(10, { forcaDoLaco: 2 }, 30) === 1041);
  const nunca = GENTE.filter((ind) => I.pesarConvite(ind, { convivio: { dias: 999 }, fama: 0 }).resposta === "recusa");
  t(`só com tempo, ${nunca.length} nunca aceitam (5%) — e são os medrosos`, nunca.length === 75 && nunca.filter((i) => i.tracos.includes("medroso")).length === 72);
  /* e a porta nunca é fechada para sempre: com laço e fama, todos */
  t("com laço inteiro, dívida e lenda, todos", conta(20, { forcaDoLaco: 3, meDeve: true }, 60) === 1500);
}

sec("11. O DIA DO ENCONTRO FICA NA FICHA");
{
  /* o defeito de raiz: o App mandava o dia e a ficha o perdia */
  t("criarNPC guarda o dia", N.criarNPC("Vero", { conhecidoEm: 3 }).conhecidoEm === 3);
  t("e o dia 0 também (antes do registro)", N.criarNPC("Vero", { conhecidoEm: 0 }).conhecidoEm === 0);
  t("sem dia, a ficha fica sem a chave", !("conhecidoEm" in N.criarNPC("Vero", {})));
  t("lixo não vira dia", [null, "", "x", -3, NaN, true].every((v) => !("conhecidoEm" in N.criarNPC("Vero", { conhecidoEm: v }))));
  t("dados null não quebra", N.criarNPC("Vero", null).nome === "Vero");
  /* reencontrar não é conhecer de novo */
  const f = N.criarNPC("Vero", { conhecidoEm: 2 });
  t("a mescla não reescreve o dia", N.mesclarNPC(f, { conhecidoEm: 9, local: "o porto" }).conhecidoEm === 2);
  t("e dá o dia a quem não tinha", N.mesclarNPC(N.criarNPC("Ume"), { conhecidoEm: 5 }).conhecidoEm === 5);
  t("a mescla não muta a ficha", f.conhecidoEm === 2 && !("local" in f && f.local === "o porto"));
  t("mescla com null não quebra", N.mesclarNPC(f, null).conhecidoEm === 2);

  /* O CAMINHO DO APP, em Node: registrar no dia 2 (como a linha que lê
     `resp.mudancas.npcs`), reencontrar no dia 6, e pesar no dia 10 com a
     conta de `convivioCom` — `diaRef − conhecidoEm`. */
  let reg = {};
  reg.Vero = N.criarNPC("Vero", { papel: "batedora", ultimaVez: 1, conhecidoEm: 2 });
  reg = { ...reg, Vero: N.mesclarNPC(reg.Vero, { nome: "Vero", local: "a ponte", ultimaVez: 4, conhecidoEm: reg.Vero.conhecidoEm != null ? reg.Vero.conhecidoEm : 6 }) };
  const diaHoje = 10;
  const dias = Math.max(0, diaHoje - (reg.Vero.conhecidoEm != null ? reg.Vero.conhecidoEm : diaHoje));
  t(`no dia 10, quem foi conhecida no dia 2 tem 8 dias de convívio (${dias})`, dias === 8);
  /* e a missão "encontrar Fulano" fecha na mesma sessão, sem recarregar */
  t("e a etapa 'encontrar' fecha sem recarregar", M.etapaDef("falar_com").ver({ alvo: "Vero" }, { npcs: reg }));
}

/* ============================================================
   v9.315 — "O CONVITE NUNCA ANDAVA PARA NINGUÉM CONHECIDO"

   `npcs.js` e `indole.js` já provam o motor (seções 9-11 acima); esta
   seção prova a FIAÇÃO — que o App de fato lê o que o motor agora entrega,
   e não voltou a reinventar o número por cima. Corpo por âncora, como o
   resto do arquivo; \r\n normalizado porque o corpo é fatiado por
   `indexOf`/`slice`, e um CRLF solto no meio de um recorte não muda o que
   ele CONTÉM, mas os testes daqui comparam o texto inteiro — mais seguro
   não depender de qual fim de linha o checkout desta máquina usou. */
const APPn = APP.replace(/\r\n/g, "\n");

sec("12. A FIAÇÃO LÊ O QUE O MOTOR ENTREGA");
{
  /* convivioCom: o laço de verdade, não um campo que a ficha nunca teve.
     01/10: a fiação do companheiro de antes (MM, companheiro-inicial.js)
     tirou a conta de dentro de `convivioCom` e pôs um nome nela —
     `convivioDaFicha` — porque agora ela também precisa dizer "conhecido
     de antes da campanha", e só uma função com nome pode ser chamada de
     dois lugares (o App e o módulo do companheiro) sem duplicar o corpo.
     As três asserções que liam o TEXTO da conta em App.jsx (garantirLaco,
     forcaDoLaco, euDevo) passam a ler o texto de onde a conta mora agora;
     o que prova que o resultado não mudou para quem não é de antes é a
     comparação campo a campo em teste-companheiro-inicial.mjs (secção 4,
     21/21 — `convivioDaFicha` bate com a conta antiga de `convivioCom`). */
  const CV = APPn.slice(APPn.indexOf("const convivioCom = (nome)"), APPn.indexOf("const vereditoDoConvite"));
  t("convivioCom existe", CV.length > 100);
  t("e delegou a conta para convivioDaFicha (companheiro-inicial.js)", /return convivioDaFicha\(n, diaRef\.current\)/.test(CV));
  const CI = readFileSync("../src/companheiro-inicial.js", "utf8");
  const CDF = CI.slice(CI.indexOf("export function convivioDaFicha"), CI.indexOf("export function convivioDaFicha") + 800);
  t("lá dentro, o laço de verdade é lido por garantirLaco, como pessoasDaCena", /const l = garantirLaco\(n\.laco\)/.test(CDF));
  t("a força vem do laço vivo, não de um campo solto", /forcaDoLaco: \(l && !l\.rompido && l\.forca\) \|\| 0/.test(CDF));
  t("e não sobrou o campo que a ficha nunca teve", !/Number\(n\.forcaDoLaco\)/.test(CV));
  t("a linha morta que não lia nada saiu", !/\(elencoMemRef\.current \|\| \[\]\)\.find \? null : null/.test(CV));
  t("euDevo se deriva das notas ou de uma dívida de verdade", /euDevo: \/d\[íi\]vida\|devo\|prometi\/i\.test\(String\(n\.notas \|\| ""\)\) \|\| !!\(l && l\.tipo === "divida"\)/.test(CDF));

  /* primeiraVez: dia 0 é um dia conhecido, não "nunca vi essa pessoa" */
  t("primeiraVez usa == null, não a falsidade de 0", /primeiraVez: n\.conhecidoEm == null && !noGrupo/.test(APPn));
  t("e não sobrou a leitura que tratava o dia 0 como estranho", !/primeiraVez: !n\.conhecidoEm && !noGrupo/.test(APPn));

  /* bancarOConvite: o laço não é tempo, e a fala não pode confundir os dois */
  const BC = APPn.slice(APPn.indexOf("const bancarOConvite = (nome)"), APPn.indexOf("const usarConsumivelUI"));
  t("bancarOConvite existe", BC.length > 100);
  t("distingue convívio (tempo) do resto", /ex\.tipo === "convivio"/.test(BC));
  t("tempo continua recusado como tempo", /isso é tempo, e tempo não se compra/.test(BC));
  t("e o laço tem fala própria, não a de tempo", /isso não se compra, se conquista/.test(BC));
}

console.log(`\nconvite v9.143: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
