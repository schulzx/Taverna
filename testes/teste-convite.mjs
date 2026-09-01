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
  }
  t("as condições são duas e conhecidas", [...tipos].every((x) => ["paga", "convivio"].includes(x)));
  t("e as duas aparecem", tipos.size === 2);
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

console.log(`\nconvite v9.143: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
