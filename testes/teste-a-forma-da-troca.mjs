/* A FORMA DA TROCA (23/11/2026) — src/a-forma-da-troca.js, identidade e posse · etapa 8.

   A ordem da dona do jogo: «criar sistemas funcionais que identifiquem e
   resolvam os problemas, e não apenas exemplos». O tipo da troca sai da
   FORMA da transação (quem entrega, quem recebe, o que volta em troca, o
   gesto, a dívida, o prazo), numa tabela — e não de uma lista de verbos.

   §1 a tabela: cada linha provada pela forma pura (traços, sem palavra
      nenhuma), e cada linha de novo por uma frase com um verbo que NÃO
      está em lista nenhuma («xumbrego») — só gesto, posse e dívida;
   §2 a direção pela posse: quem tem a coisa decide quando o gesto não diz;
      com os dois lados tendo a coisa, a preposição; o gesto forte vale mais;
   §3 a cobrança, com dívida e sem dívida: «você me deve, paga logo» é
      cobrar (nunca um pagamento do herói), e a dívida vem do registro;
   §4 o menu só na ambiguidade de verdade (moeda, sem gesto, sem dívida);
   §5 defesa: null e lixo não derrubam, e a mesma forma dá o mesmo tipo. */
import { readFileSync } from "node:fs";

const { aFormaDaTroca, aDirecaoDaTroca, A_FORMA_DA_TROCA } = await import(new URL("../src/a-forma-da-troca.js", import.meta.url));
const { oOuvido, O_OUVIDO } = await import(new URL("../src/o-ouvido.js", import.meta.url));
const { asDividasDaCena } = await import(new URL("../src/a-troca-por-transacao.js", import.meta.url));
const { QUEM_TEM_O_QUE } = await import(new URL("../src/quem-tem-o-que.js", import.meta.url));

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* a cena: o herói carrega corda e gazua; o Ivo vende cerveja e quarto; a Ana Cruz vende a espada;
   a Dorva não vende nada; o barril e a pedra estão soltos; o Edrik morreu */
const CENA = Object.freeze({
  lugar: "Taberna do Teste", tipo: "taverna",
  pessoas: [
    { nome: "Dorva", oficio: "mendiga", vende: null },
    { nome: "Ivo Prado", oficio: "taverneiro", vende: [{ item: "cerveja", preco: 2 }, { item: "quarto", preco: 10 }] },
    { nome: "Ana Cruz", oficio: "ferreira", vende: [{ item: "espada", preco: 30 }] },
  ],
  ausentes: [], mortos: ["Edrik Sorn"], coisas: ["barril", "pedra"],
  heroi: { moeda: 40, carrega: ["corda", "gazua"], companheiro: null },
});
const comDivida = (linha) => Object.freeze({ ...CENA, dividas: [linha] });
const le = (f, c = CENA) => oOuvido(f, c);
const sub = (f, c = CENA) => le(f, c).subtipo;
const forma = (x) => aFormaDaTroca(x).subtipo;

sec("§1 a tabela — cada linha pela forma pura e por uma frase sem verbo conhecido");
{
  const F = A_FORMA_DA_TROCA;
  t("as cinco classes de gesto, fechadas", JSON.stringify(F.gestos) === JSON.stringify(["oferecer", "pedir", "tomar", "divida", "trocar"]));
  t("os subtipos da tabela são os do ouvido e do exame", JSON.stringify(F.subtipos) === JSON.stringify(O_OUVIDO.subtipos));
  t("toda linha dá um subtipo do vocabulário e um consentimento", F.linhas.every((l) => F.subtipos.includes(l.subtipo) && ["dado", "pedido", "tomado", "devido"].includes(l.consentimento)));
  t("a tabela está congelada", Object.isFrozen(F) && Object.isFrozen(F.linhas) && F.linhas.every((l) => Object.isFrozen(l) && Object.isFrozen(l.quando)));
  t("todo subtipo do vocabulário sai de alguma linha", F.subtipos.every((s) => F.linhas.some((l) => l.subtipo === s)));
  t("o gesto de cada lema é uma das cinco classes (o verbo é pista de consentimento, nunca tabela de tipo)", Object.values(O_OUVIDO.gestoDoLema).every((g) => F.gestos.includes(g.classe) && !("subtipo" in g)));

  const H = { de: "heroi", para: "outro" }, O = { de: "outro", para: "heroi" };
  const M = { tipo: "moedas" }, I = { tipo: "item" }, IV = { tipo: "item", aVenda: true };
  /* a forma pura: nenhum verbo, nenhuma palavra */
  const casos = [
    ["chão → herói: pegar", { de: "chao", para: "heroi", oQue: I }, "pegar"],
    ["chão → herói, às escondidas: furtar", { de: "chao", para: "heroi", oQue: I, forca: true }, "furtar"],
    ["herói → outro, contra coisa do outro: escambo", { ...H, oQue: I, contra: I }, "escambo"],
    ["herói → outro, coisa contra moeda: vender", { ...H, oQue: I, contra: M }, "vender"],
    ["herói → outro, contra um favor: subornar", { ...H, oQue: M, contra: { tipo: "favor" } }, "subornar"],
    ["herói → outro, moeda contra serviço: pagar", { ...H, oQue: M, contra: { tipo: "servico" } }, "pagar"],
    ["herói → outro, moeda a quem o herói deve: pagar", { ...H, oQue: M, divida: "heroiDeve" }, "pagar"],
    ["herói → outro, a coisa a quem a emprestou: devolver", { ...H, oQue: I, divida: "heroiDeve" }, "devolver"],
    ["herói → outro, a coisa volta a quem a tinha: devolver", { ...H, oQue: I, retorno: true }, "devolver"],
    ["herói → outro, moeda pelo devido (gesto de dívida): pagar", { ...H, oQue: M, gesto: "divida" }, "pagar"],
    ["herói → outro, com prazo: emprestar", { ...H, oQue: I, prazo: true }, "emprestar"],
    ["herói → outro, sem contrapartida: dar", { ...H, oQue: I }, "dar"],
    ["outro → herói, contra moeda: comprar", { ...O, oQue: I, contra: M }, "comprar"],
    ["outro → herói, a coisa tem preço (a moeda implícita): comprar", { ...O, oQue: IV, sentido: "recebe" }, "comprar"],
    ["outro → herói, contra uma coisa do herói: escambo", { ...O, oQue: I, contra: I }, "escambo"],
    ["outro → herói, o outro deve isto: cobrar", { ...O, oQue: M, divida: "outroDeve" }, "cobrar"],
    ["outro → herói, moeda que o herói diz que lhe devem: cobrar", { ...O, oQue: M, gesto: "divida" }, "cobrar"],
    ["outro → herói, tomado à força: furtar", { ...O, oQue: I, gesto: "tomar", forca: true }, "furtar"],
    ["outro → herói, pego sem pedir: pegar", { ...O, oQue: I, gesto: "tomar" }, "pegar"],
    ["outro → herói, com prazo: emprestar (quem recebe)", { ...O, oQue: I, gesto: "pedir", prazo: true }, "emprestar"],
    ["outro → herói, propor troca: comprar", { ...O, oQue: I, gesto: "trocar" }, "comprar"],
    ["outro → herói, pedido: pedir", { ...O, oQue: I, gesto: "pedir" }, "pedir"],
    ["outro → herói, o outro oferece (o imperativo dito a ele): pedir", { ...O, oQue: I, gesto: "oferecer", agente: "outro" }, "pedir"],
    ["a moeda que paga a coisa («N pela X») é a coisa vindo, contra moeda: comprar", { ...H, oQue: M, contra: I }, "comprar"],
    ["o favor que o herói recebe é moeda que ele entrega por um favor: subornar", { ...O, oQue: { tipo: "favor" }, gesto: "trocar" }, "subornar"],
    ["o pedido feito ao outro sem pagar («tô sem grana») tira o preço: pedir", { ...O, oQue: IV, gesto: "oferecer", agente: "outro", semPagar: true }, "pedir"],
    ["quem quer comprar sem ter com que pagar continua comprando", { ...O, oQue: IV, gesto: "pedir", comPreco: true, semPagar: true }, "comprar"],
    ["o empréstimo de coisa que tem preço não vira compra", { ...O, oQue: IV, gesto: "oferecer", agente: "outro", prazo: true }, "emprestar"],
  ];
  for (const [nome, x, esperado] of casos) t("forma: " + nome, forma(x) === esperado, String(forma(x)));
  t("forma: sem lado não há tipo (nunca adivinhado)", forma({ oQue: I }) === null && aFormaDaTroca({ oQue: I }).porque.length > 0);
  t("forma: o herói recebe sem gesto e sem preço → a forma não decide", forma({ ...O, oQue: I }) === null);
  t("forma: cada resposta diz o consentimento e o porquê", (() => { const r = aFormaDaTroca({ ...H, oQue: I, contra: M }); return r.consentimento === "dado" && /moeda/.test(r.porque); })());

  /* as mesmas linhas por frase, com um verbo que não está em lista nenhuma: só posse, preposição,
     contrapartida, dívida e prazo decidem */
  t("«xumbrego» não é verbo de lista nenhuma", !Object.values(O_OUVIDO.gestoDoLema).length || !JSON.stringify(O_OUVIDO).includes("xumbreg"));
  const frases = [
    ["dar: a coisa minha a alguém", "xumbrego a corda pro Ivo", "dar"],
    ["vender: a coisa minha por moeda", "xumbrego a corda pro Ivo por cinco moedas", "vender"],
    ["escambo: a coisa minha pela coisa dele", "xumbrego a corda pela cerveja do Ivo", "escambo"],
    ["escambo (outro → herói): a coisa dele pela minha", "xumbrego a cerveja do Ivo pela minha corda", "escambo"],
    ["subornar: moeda pelo favor de quem está", "xumbrego duas moedas pro Ivo pra ele esquecer", "subornar"],
    ["pagar: moeda por um serviço", "xumbrego cinco moedas pro Ivo por um conserto", "pagar"],
    ["emprestar: a coisa minha com prazo", "xumbrego a corda pro Ivo até amanhã", "emprestar"],
    ["devolver: a coisa volta a quem a tinha", "xumbrego de volta a corda pro Ivo", "devolver"],
    ["comprar: só a Ana tem a espada, e ela tem preço", "xumbrego a espada da Ana Cruz", "comprar"],
    ["furtar: a coisa dela, às escondidas", "xumbrego a espada da Ana Cruz sem ela ver", "furtar"],
    ["cobrar: a dívida dita («me deve»)", "xumbrego as três moedas que o Ivo me deve", "cobrar"],
    ["pedir: o pedido ao outro, sem pagar", "Ivo, me xumbrega uma cerveja, tô sem grana", "pedir"],
    ["emprestar (quem recebe): «me … até amanhã»", "Dorva, me xumbrega a gazua até amanhã", "emprestar"],
    ["pegar: o que está solto, pra mim", "xumbrego a pedra pra mim", "pegar"],
  ];
  for (const [nome, f, esperado] of frases) t("frase: " + nome + " — «" + f + "»", sub(f) === esperado, String(sub(f)) + " · " + JSON.stringify(le(f).forma || null));
  t("frase: pagar a quem o herói deve (a dívida do registro) — «xumbrego cinco moedas pro Ivo»", sub("xumbrego cinco moedas pro Ivo", comDivida({ nome: "Ivo Prado", deveAoHeroi: [], heroiDeve: [{ tipo: "moedas", nome: "moedas", quanto: 5 }] })) === "pagar");
  t("frase: devolver a quem emprestou ao herói — «xumbrego a corda pro Ivo»", sub("xumbrego a corda pro Ivo", comDivida({ nome: "Ivo Prado", deveAoHeroi: [], heroiDeve: [{ tipo: "item", nome: "corda", quanto: 1 }] })) === "devolver");
  t("frase: cobrar quem deve ao herói — «xumbrego três moedas do Ivo»", sub("xumbrego três moedas do Ivo", comDivida({ nome: "Ivo Prado", deveAoHeroi: [{ tipo: "moedas", nome: "moedas", quanto: 3 }], heroiDeve: [] })) === "cobrar");
  t("a leitura leva a forma à parte (o gesto, quem age, de onde e para onde)", (() => { const f = le("xumbrego a corda pro Ivo por cinco moedas").forma; return !!f && f.subtipo === "vender" && f.de === "heroi" && f.para === "outro"; })());
}

sec("§2 a direção pela posse");
{
  const D = (x) => { const r = aDirecaoDaTroca(x); return r ? r.de + ">" + r.para : "nada"; };
  t("só o herói tem a coisa: vai dele", D({ posse: { heroi: true } }) === "heroi>outro");
  t("só o outro (a banca) tem a coisa: vem dele", D({ posse: { outro: true } }) === "outro>heroi");
  t("está solta na cena: vem do chão", D({ posse: { chao: true } }) === "chao>heroi");
  t("os dois têm (moeda): «do X» desempata — vem dele", D({ posse: { heroi: true, outro: true }, texto: { de: "outro" } }) === "outro>heroi");
  t("os dois têm: «pra X» desempata — vai a ele", D({ posse: { heroi: true, outro: true }, texto: { para: "outro" } }) === "heroi>outro");
  t("os dois têm e o texto cala: o verbo que só diz o sentido", D({ posse: { heroi: true, outro: true }, sentido: "da", fraco: true }) === "heroi>outro");
  t("os dois têm, nada diz: sem direção", D({ posse: { heroi: true, outro: true } }) === "nada");
  t("o gesto forte diz quem dá, mesmo contra a posse (quem vende o que não tem ouve «você não tem»)", D({ gesto: "trocar", sentido: "da", agente: "heroi", posse: { outro: true } }) === "heroi>outro");
  t("o verbo fraco perde para a posse («levo a corda pro Cado»: a corda é minha)", D({ sentido: "recebe", fraco: true, posse: { heroi: true }, texto: { para: "outro" } }) === "heroi>outro");
  t("quem age é o outro (o imperativo): o sentido vira", D({ gesto: "oferecer", sentido: "da", agente: "outro" }) === "outro>heroi");
  t("«me»/«a mim» dito ao outro: o herói recebe, mais que a posse", D({ posse: { heroi: true }, texto: { paraMim: true, para: "heroi" } }) === "outro>heroi");
  t("quem compra um favor é quem paga", D({ posse: { heroi: true, outro: true }, contra: { tipo: "favor" } }) === "heroi>outro");
  /* pela frase */
  t("frase: a coisa só minha, verbo novo e ninguém dito pela preposição — «xumbrego a gazua, Dorva»", (() => { const f = le("Dorva, xumbrego a gazua").forma; return !f || f.de !== "outro"; })());
  t("frase: «no chapéu da Dorva» é o lugar dela — a moeda vai a ela", sub("xumbrego duas moedas no chapéu da Dorva") === "dar");
  t("frase: «me desfaço» é reflexivo (o herói age): a coisa minha por moeda é venda", sub("me xumbrego da corda por dez moedas com o Ivo") === "vender");
}

sec("§3 a cobrança, com dívida e sem dívida");
{
  const P = "Ivo, você me deve cinco moedas, paga logo";
  const sem = le(P), com = le(P, comDivida({ nome: "Ivo Prado", deveAoHeroi: [{ tipo: "moedas", nome: "moedas", quanto: 5 }], heroiDeve: [] }));
  t("sem dívida nenhuma: é cobrar (a cobrança sem base), nunca um pagamento do herói", sem.subtipo === "cobrar" && sem.forma.de === "outro" && sem.forma.para === "heroi", JSON.stringify(sem.forma));
  t("com a dívida no registro: cobrar, e o consentimento é o devido", com.subtipo === "cobrar" && com.forma.consentimento === "devido" && com.forma.divida === "outroDeve");
  t("«paga logo» dito ao outro: quem age é ele (o imperativo)", sem.forma.agente === "outro");
  t("o herói que paga o que deve: «pago o que devo pro Ivo» é pagar", sub("pago o que devo pro Ivo") === "pagar");
  t("«me devolve a corda» sem empréstimo no registro é pedir a coisa de volta", sub("Ivo, me devolve a corda") === "pedir");
  t("com o empréstimo no registro, é cobrar", sub("Ivo, me devolve a corda", comDivida({ nome: "Ivo Prado", deveAoHeroi: [{ tipo: "item", nome: "corda", quanto: 1 }], heroiDeve: [] })) === "cobrar");
  /* a dívida vem do registro de posse (quem-tem-o-que.js), pela ponte da troca */
  const Q = QUEM_TEM_O_QUE;
  const posses = { v: 1, delta: {}, dividas: [
    { id: "d1", de: "npc|Ivo Prado", para: "heroi", oQue: { tipo: "moedas", nome: "moedas" }, quanto: 5, dia: 1, prazo: 8, estado: Q.estados.aberta },
    { id: "d2", de: "heroi", para: "npc|Dorva", oQue: { tipo: "item", nome: "Gazua" }, quanto: 1, dia: 1, prazo: 8, estado: Q.estados.aberta },
    { id: "d3", de: "npc|Ana Cruz", para: "heroi", oQue: { tipo: "moedas", nome: "moedas" }, quanto: 2, dia: 1, prazo: 8, estado: Q.estados.fechada },
  ], aplicadas: [] };
  const ds = asDividasDaCena([{ nome: "Ivo Prado", id: "npc|Ivo Prado" }, { nome: "Dorva", id: "npc|Dorva" }, { nome: "Ana Cruz", id: "npc|Ana Cruz" }], { posses });
  const ivo = ds.find((d) => d.nome === "Ivo Prado"), dorva = ds.find((d) => d.nome === "Dorva");
  t("asDividasDaCena: quem deve ao herói, com a coisa e a quantia", !!ivo && ivo.deveAoHeroi.length === 1 && ivo.deveAoHeroi[0].tipo === "moedas" && ivo.deveAoHeroi[0].quanto === 5);
  t("asDividasDaCena: a quem o herói deve", !!dorva && dorva.heroiDeve.length === 1 && dorva.heroiDeve[0].tipo === "item");
  t("asDividasDaCena: a dívida fechada não entra", !ds.some((d) => d.nome === "Ana Cruz"));
  t("asDividasDaCena: sem registro, nada (e null não derruba)", asDividasDaCena([{ nome: "Ivo" }], { posses: null }).length === 0 && asDividasDaCena(null, null).length === 0);
  t("a dívida do registro chega à forma: «xumbrego a gazua pra Dorva» é devolver", sub("xumbrego a gazua pra Dorva", { ...CENA, dividas: ds }) === "devolver");
}

sec("§4 o menu só na ambiguidade de verdade");
{
  const { oOuvidoNaTroca } = await import(new URL("../src/motor/a-cena-do-ouvido.js", import.meta.url));
  const amb = oOuvidoNaTroca("xumbrego três moedas com o Ivo", CENA);
  t("moeda (os dois lados têm), sem gesto, sem dívida, sem preposição que diga o lado: o Mestre pergunta", amb.caminho === "pergunta" && amb.pergunta && amb.pergunta.opcoes.length >= 2, JSON.stringify(amb.resposta));
  for (const f of ["xumbrego a corda pro Ivo", "xumbrego a espada da Ana Cruz", "xumbrego a corda pro Ivo por cinco moedas"]) {
    const o = oOuvidoNaTroca(f, CENA);
    t("a forma decide, e não há menu por faltar o verbo — «" + f + "»", o.caminho !== "pergunta" && !!o.leitura.subtipo, String(o.caminho) + " " + o.leitura.subtipo);
  }
  t("a coisa minha dada com a pergunta do preço é venda, e não o menu «Dar / Emprestar / Vender»", sub("passo a corda pro Ivo, quanto ele dá?") === "vender");
}

sec("§5 defesa e determinismo");
{
  let ok = true;
  try { ok = aFormaDaTroca(null).subtipo === null && aFormaDaTroca("x").subtipo === null && aDirecaoDaTroca(null) === null && aFormaDaTroca({ de: "heroi", para: "heroi" }).subtipo === null; } catch { ok = false; }
  t("null, lixo e o mesmo lado dos dois lados não derrubam e não inventam", ok);
  const x = { de: "outro", para: "heroi", oQue: { tipo: "item", aVenda: true }, sentido: "recebe" };
  t("a mesma forma, o mesmo tipo (determinístico)", JSON.stringify(aFormaDaTroca(x)) === JSON.stringify(aFormaDaTroca(x)) && Object.isFrozen(aFormaDaTroca(x)));
  t("a entrada não é mutada", (() => { const y = { de: "heroi", para: "outro", oQue: { tipo: "moedas" }, contra: { tipo: "item" } }; const s = JSON.stringify(y); aFormaDaTroca(y); return JSON.stringify(y) === s; })());
  /* o módulo não lê palavra: nenhuma frase, nenhum verbo dentro dele (quem lê a frase é o ouvido) */
  const fonte = readFileSync(new URL("../src/a-forma-da-troca.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  t("a forma não tem lista de verbos nem expressão regular sobre a frase", !/\/[^/\n]*\\b/.test(fonte) && !/\b(compro|vendo|dou|pago|furto|empresto)\b/.test(fonte));
}

console.log("\n" + bons + " ok, " + maus + " XX");
process.exit(maus ? 1 : 0);
