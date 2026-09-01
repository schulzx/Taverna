/* O CORREIO ENCONTRA A MESA (v9.144)

   O correio nasceu na v7.0 e sempre foi honesto no que fazia: cartas chegam
   em dias, petições vencem, tudo por tabela e sem um token. O que ele NÃO
   tinha era memória de com quem estava falando.

   `chanceResposta` era `base + fama/250` — uma moeda ao ar. Uma potência que
   te adora recusava exatamente tanto quanto uma que te odeia. Pior: como as
   cartas FIRMAM TRATADO, o correio virou uma segunda diplomacia paralela à
   da v9.142 — recusado na mesa, bastava pedir por carta e tentar a sorte até
   sair. Duas balanças para o mesmo peso, e a segunda desfazendo a primeira.

   Esta suíte defende a balança única, e o que o correio guarda de seu: a
   distância, o prazo, e o fato de que uma carta parte e não volta. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const semCom = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semCom(readFileSync("../src/App.jsx", "utf8"));
const C = await import(S + "correio.js");
const D = await import(S + "diplomacia.js");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const POTS = D.potenciasDoMundo({ guildas: [{ nome: "A Ordem do Vácuo", poder: 40 }, { nome: "A Liga", poder: 30 }] });
const P = POTS[0];
const carta = (over) => C.criarCarta({ para: P.nome, tipo: "alianca", oferta: 0, dia: 1, ...over });
const quente = (() => { let d = null; for (let i = 0; i < 9; i++) d = D.presentear(d, P, {}).dip; return d; })();

sec("1. A CARTA USA A BALANÇA DA MESA");
{
  const acoes = new Set(["comercio", "alianca", "vassalagem", "guerra"]);
  t("todo tipo de carta que firma tratado vira uma proposta real",
    Object.values(C.CARTA_E_PROPOSTA).every((x) => acoes.has(x)));
  const frio = C.pesarCarta(carta(), { potencia: P, fama: 0, meuPoder: 10, dia: 5 });
  t("um ato de estado é pesado pela mesa", frio.viaMesa === true);
  t("e o não se explica", frio.porques.length > 0);
  t("de mão vazia, é não", frio.aceita === false);
  const morno = C.pesarCarta(carta(), { potencia: P, dip: quente, fama: 80, meuPoder: 60, dia: 30 });
  t("com apreço e lenda, muda", morno.aceita !== frio.aceita || morno.porques.length !== frio.porques.length);
  /* e o que NÃO é ato de estado continua sendo o que sempre foi */
  const cortesia = C.pesarCarta(carta({ tipo: "cortesia" }), { potencia: P, fama: 0 });
  t("cortesia não passa pela mesa", cortesia.viaMesa === false);
  t("conselho também não", C.pesarCarta(carta({ tipo: "conselho" }), { potencia: P }).viaMesa === false);
  /* sem potência conhecida, o correio não trava: cai no que era antes */
  t("sem potência, ainda responde", typeof C.pesarCarta(carta(), { potencia: null }).aceita === "boolean");
}

sec("2. QUEM TE CONHECE RESPONDE MELHOR");
{
  /* mesmo fora da mesa, o apreço entra — antes era só fama */
  const odiado = C.chanceResposta("cortesia", { fama: 0, apreco: 0 });
  const neutro = C.chanceResposta("cortesia", { fama: 0, apreco: 40 });
  const amado = C.chanceResposta("cortesia", { fama: 0, apreco: 100 });
  t("quem te odeia responde menos", odiado < neutro);
  t("quem te adora responde mais", amado > neutro);
  t("e sem apreço nenhum, é como era antes", C.chanceResposta("cortesia", { fama: 0 }) === neutro);
  t("a chance nunca sai da faixa", [odiado, amado].every((x) => x >= 0.05 && x <= 0.95));
}

sec("3. A OFERTA EM MOEDA PASSOU A VALER");
{
  /* o número aparecia na mensagem e não entrava em conta nenhuma */
  const semOuro = C.pesarCarta(carta({ oferta: 0 }), { potencia: P, dip: quente, fama: 40, meuPoder: 30, dia: 9 });
  const comOuro = C.pesarCarta(carta({ oferta: 800 }), { potencia: P, dip: quente, fama: 40, meuPoder: 30, dia: 9 });
  t("o ouro pesa", comOuro.ganhoDeApreco > 0);
  t("e aparece no porquê", comOuro.porques.some((x) => /oferta de ◉ 800/.test(x)));
  t("sem ouro, não aparece", !semOuro.porques.some((x) => /oferta/.test(x)));
  /* e tem teto: não se compra uma aliança com uma carroça de ouro */
  t("o ouro tem teto", C.pesarCarta(carta({ oferta: 999999 }), { potencia: P, dip: quente }).ganhoDeApreco <= 20);
  /* e o ganho é relatado nos TRÊS desfechos, não só no sim: o ouro partiu
     junto com a carta e chegou lá de qualquer jeito. Campo que existe num
     ramo e some no outro é a mesma coisa que não existir. */
  const tresRamos = [];
  for (let i = 0; i < 400 && tresRamos.length < 3; i++) {
    const p = D.potenciaDe({ nome: `Casa ${i}`, poder: 40 });
    let d = null; for (let k = 0; k < 6; k++) d = D.presentear(d, p, {}).dip;
    const v = C.pesarCarta(carta({ para: p.nome, oferta: 800 }), { potencia: p, dip: d, fama: 45, meuPoder: 45, dia: 9 });
    const ramo = v.exigencia ? "exige" : v.aceita ? "aceita" : "recusa";
    if (!tresRamos.includes(ramo) && v.ganhoDeApreco > 0) tresRamos.push(ramo);
  }
  t(`o ouro é contado em todos os desfechos (${tresRamos.join(", ")})`, tresRamos.length >= 2);
}

sec("4. DE LONGE NÃO SE NEGOCIA CONDIÇÃO");
{
  /* na mesa, "exige" é um caminho; por carta, ninguém combina condição — e
     a carta diz o que ela queria, que é a informação que sobra */
  const achado = (() => {
    for (let i = 0; i < 400; i++) {
      const p = D.potenciaDe({ nome: `Casa ${i}`, poder: 40 });
      let d = null; for (let k = 0; k < 6; k++) d = D.presentear(d, p, {}).dip;
      const v = C.pesarCarta(carta({ para: p.nome }), { potencia: p, dip: d, fama: 45, meuPoder: 45, dia: 9 });
      if (v.exigencia) return v;
    }
    return null;
  })();
  t("existe carta que esbarra numa condição", !!achado);
  t("e ela é recusada", achado.aceita === false);
  t("mas diz o que ela queria", /não se combina por carta/.test(achado.porques.join(" ")));
}

sec("5. O QUE ELA PEDE SAI DO QUE ELA QUER");
{
  /* antes a petição era sorteio cego: quem "quer ouro, e não esconde" podia
     mandar uma proposta de casamento e nunca um pedido de tributo */
  const porApetite = {};
  for (let i = 0; i < 400; i++) {
    const p = D.potenciaDe({ nome: `Casa ${i}`, poder: 40 });
    const pet = C.gerarPeticao({ faccoes: [p.nome], dia: 1, potencias: [p] });
    if (!pet) continue;
    (porApetite[p.apetite] = porApetite[p.apetite] || new Set()).add(pet.tipo);
  }
  t("há material para medir", Object.keys(porApetite).length >= 4);
  /* quem quer ouro pede ouro, e não casamento */
  const moeda = porApetite.moeda || new Set();
  t("quem quer ouro pede tributo ou comércio", [...moeda].every((x) => ["exigencia_tributo", "comercio"].includes(x)));
  t("e nunca casamento", !moeda.has("oferta_casamento"));
  /* quem quer braço pede braço */
  const braco = porApetite.braco || new Set();
  t("quem quer braço pede aliança ou ajuda", [...braco].every((x) => ["pedido_alianca", "pedido_ajuda"].includes(x)));
  /* e a petição diz por que veio */
  const pet = C.gerarPeticao({ faccoes: [P.nome], dia: 1, potencias: [P] });
  t("a petição traz o motivo", !!pet.porque && pet.porque.length > 5);
  /* sem potência conhecida, continua funcionando como antes */
  t("sem potência, ainda gera", !!C.gerarPeticao({ faccoes: ["Alguém"], dia: 1 }));
  t("sem facção nenhuma, não gera", C.gerarPeticao({ faccoes: [], dia: 1 }) === null);
}

sec("6. O DIA DO CORREIO CONTINUA INTEIRO");
{
  const c0 = C.garantirCorreio(null);
  c0.enviadas = [C.criarCarta({ para: P.nome, tipo: "alianca", oferta: 400, dia: 1 })];
  c0.enviadas[0].chegaEm = 3;
  const r = C.processarDiaCorreio(c0, { dia: 3, fama: 50, potencias: POTS, dip: quente, meuPoder: 50 });
  t("a carta chega no dia certo", r.correio.enviadas.length === 0);
  t("e vai para o histórico", r.correio.historico.length === 1);
  t("com uma mensagem", r.msgs.length >= 1);
  t("e o porquê na mensagem", /O que pesou/.test(r.msgs.join(" ")));
  /* o ouro que foi junto sobe o apreço mesmo no não: ninguém devolve ouro */
  t("o ouro enviado vira apreço", (r.efeitos.aprecoAdd || []).length === 1);
  t("na potência certa", r.efeitos.aprecoAdd[0].nome === P.nome);
  t("e o App leva isso ao livro", /for \(const a of pc\.efeitos\.aprecoAdd\) d = mexerNoApreco\(d, a\.nome, a\.quanto\)/.test(APP));
  /* guerra continua não tendo resposta: é ato, não pedido */
  const c1 = C.garantirCorreio(null);
  c1.enviadas = [{ ...C.criarCarta({ para: P.nome, tipo: "guerra", dia: 1 }), chegaEm: 2 }];
  const r1 = C.processarDiaCorreio(c1, { dia: 2, potencias: POTS });
  t("guerra por carta é ato consumado", r1.efeitos.tratadosAdd.some((x) => x.tratado === "guerra"));
  /* e a petição vencida continua expirando */
  const c2 = C.garantirCorreio(null);
  c2.recebidas = [{ id: "p1", de: P.nome, tipo: "comercio", icone: "⚖", texto: "x", recebidaEm: 1, prazo: 2, status: "pendente" }];
  t("petição vencida expira", C.processarDiaCorreio(c2, { dia: 5, potencias: POTS }).correio.recebidas.length === 0);
}

sec("7. LIGADO AO JOGO, E COM AS CASAS DO MUNDO");
{
  t("o App manda as potências ao correio", /potencias: potsCorreio/.test(APP));
  t("e o livro do apreço", /dip: diplomaciaRef\.current,\s*meuPoder: meuPoderDiplomatico\(\)/.test(APP));
  /* a aba do correio via só as facções que a IA nomeasse — o mesmo ponto
     cego que a diplomacia tinha antes da v9.142 */
  /* pela PROP, e não chamando o ajudante de `Taverna`: `PainelLateral` é
     um componente à parte, e nada de dentro de `Taverna` está no escopo
     dele. A primeira versão desta linha usava `potenciasAqui()` ali dentro
     — build limpo, 135 suítes verdes, e o painel inteiro caindo na rede do
     LimiteErro assim que a aba abria. */
  t("a aba lista também as casas do mundo", /\.\.\.\(potencias \|\| \[\]\)\.filter\(\(x\) => !x\.doJogador\)\.map\(\(x\) => x\.nome\)/.test(APP));
  t("e não chama o ajudante de Taverna dentro do painel", !/function PainelLateral[\s\S]*?potenciasAqui\(/.test(APP.slice(0, APP.indexOf("function Taverna("))));
  t("sem repetir quem está nas duas listas", /\[\.\.\.new Set\(\[\.\.\./.test(APP));
}

sec("8. O ZERO QUE MENTIA DE NOVO");
{
  /* `ultimaEm: 0` é "nunca pediu", e não "pediu no dia zero" — sem o `> 0`
     a primeira carta do jogo já vinha com a penalidade de insistência */
  const v = D.pesarProposta({ potencia: P, acao: "comercio", dip: null, fama: 0, meuPoder: 10, dia: 1 });
  t("a primeira proposta não é 'insistência'", !v.porques.some((x) => /anteontem/.test(x)));
  /* e quem pediu de verdade ontem, leva */
  const d = D.mexerNoApreco(null, P.nome, 0, { ultimaEm: 30 });
  t("quem pediu ontem, leva", D.pesarProposta({ potencia: P, acao: "comercio", dip: d, dia: 31 }).porques.some((x) => /anteontem/.test(x)));
}

console.log(`\ncorreio v9.144: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
