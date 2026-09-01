/* O COMÉRCIO (v9.138)

   O mercado da v9.2 já era do sistema — estoque determinístico, preço da
   tabela, nada inventado pelo Narrador. O que faltava era MUNDO: o mesmo
   martelo custava igual na aldeia de mineiros e no vilarejo de pescadores,
   e o ferreiro de duzentas almas comprava a relíquia de três mil moedas com
   uma gaveta que nunca teve fundo.

   Esta suíte defende que o preço tenha geografia, que ele diga POR QUÊ, e
   que os dois lados do balcão nunca discordem sobre o número. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const semCom = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semCom(readFileSync("../src/App.jsx", "utf8"));
const MERC = readFileSync("../src/mercado.js", "utf8");
const C = await import(S + "comercio.js");
const M = await import(S + "mercado.js");
const P = await import(S + "profissoes.js");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const SERRA = { nome: "Pedra Torta", bioma: "montanha", porte: "aldeia" };
const PORTO = { nome: "Vau das Redes", bioma: "costa", porte: "vila" };
const CORTE = { nome: "Alcáçova", bioma: "montanha", porte: "capital" };
const ESPADA = { tipo: "arma", nome: "Espada Longa", valor: 100 };
const POCAO = { tipo: "consumivel", nome: "Poção de Cura", valor: 100 };

sec("1. CADA LUGAR VIVE DE ALGUMA COISA");
{
  t("a serra é de mineração", C.vocacaoDe(SERRA).id === "mineradora");
  t("o porto é portuário", C.vocacaoDe(PORTO).id === "portuaria");
  /* o porte manda mais que o bioma: sem isso, a capital do reino venderia
     trigo barato e cobraria caro por uma coroa */
  t("a capital é corte, mesmo na montanha", C.vocacaoDe(CORTE).id === "corte");
  t("a fortaleza é guarnição em qualquer chão", C.vocacaoDe({ nome: "X", bioma: "pantano", porte: "fortaleza" }).id === "guarnicao");
  t("ruína não tem comércio", C.vocacaoDe({ nome: "Y", porte: "ruina" }) === null);
  t("sem nome, sem vocação", C.vocacaoDe({ bioma: "costa" }) === null);
  /* determinística pelo NOME: quem volta encontra a mesma praça */
  t("a mesma cidade dá sempre a mesma vocação", C.vocacaoDe({ nome: "Colina Rasa", bioma: "colina" }).id === C.vocacaoDe({ nome: "Colina Rasa", bioma: "colina" }).id);
  /* e todas as vocações são alcançáveis por algum chão */
  const alcancaveis = new Set();
  for (const b of ["planicie", "floresta", "colina", "montanha", "deserto", "pantano", "costa", "gelo"]) {
    for (let i = 0; i < 300; i++) alcancaveis.add(C.vocacaoDe({ nome: `C${i}`, bioma: b }).id);
  }
  for (const p of ["fortaleza", "capital", "metropole"]) alcancaveis.add(C.vocacaoDe({ nome: "Z", bioma: "planicie", porte: p }).id);
  t("nenhuma vocação é inalcançável", C.VOCACOES.every((v) => alcancaveis.has(v.id)));
}

sec("2. O GÊNERO, E NÃO O TIPO");
{
  /* a serra barateia espada, escudo e elmo pela MESMA razão — escrever a
     regra três vezes seria esquecer a quarta */
  t("arma é metal", C.generoDoItem({ tipo: "arma" }) === "metal");
  t("elmo também", C.generoDoItem({ tipo: "elmo" }) === "metal");
  t("poção é erva", C.generoDoItem({ tipo: "consumivel" }) === "erva");
  t("amuleto é relíquia", C.generoDoItem({ tipo: "amuleto" }) === "reliquia");
  /* a armadura leve é couro e a pesada é metal, e o item não diz qual é */
  t("gibão de couro é couro", C.generoDoItem({ tipo: "armadura", nome: "Gibão de Couro" }) === "couro");
  t("cota de malha é metal", C.generoDoItem({ tipo: "armadura", nome: "Cota de Malha" }) === "metal");
  t("o que não é mercadoria não tem gênero", C.generoDoItem({ tipo: "isca" }) === "" && C.generoDoItem(null) === "");
  /* todo tipo que a banca vende cai em algum gênero, ou a vocação nunca o
     alcança e a regra existe sem efeito */
  const vendidos = new Set(M.TIPOS_MERCADOR.flatMap((x) => x.vende).filter((x) => x !== "curiosidade"));
  t("todo tipo que se vende tem gênero", [...vendidos].every((tp) => !!C.generoDoItem({ tipo: tp })));
}

sec("3. O MESMO AÇO CUSTA DIFERENTE EM DUAS CIDADES");
{
  const naSerra = C.fatorDoLugar(ESPADA, SERRA, { dia: 1 }).fator;
  const noPantano = C.fatorDoLugar(ESPADA, { nome: "Lodo", bioma: "pantano" }, { dia: 1 }).fator;
  t("onde se tira metal, a espada é barata", naSerra < 1);
  t("onde metal vem de longe, é cara", noPantano > 1);
  t("e a diferença é grande o bastante para se sentir", noPantano / naSerra > 1.5);
  /* e o preço DIZ por quê: preço que se move sem motivo é o Mestre sendo
     arbitrário, que é o que este projeto tirou da IA */
  t("o barato explica-se", /produz metal/.test(C.linhaDoPreco(C.fatorDoLugar(ESPADA, SERRA, { dia: 1 }).porques)));
  t("o caro também", /vem de longe/.test(C.linhaDoPreco(C.fatorDoLugar(ESPADA, { nome: "Lodo", bioma: "pantano" }, { dia: 1 }).porques)));
  t("o que não é mercadoria não se mexe", C.fatorDoLugar({ tipo: "isca" }, SERRA, { dia: 1 }).fator === 1);
}

sec("4. A ESTAÇÃO ENTRA NA CONTA");
{
  /* o calendário existe desde a v6 e o mercado nunca o leu */
  const inverno = C.fatorDoLugar(POCAO, PORTO, { dia: 280 }).fator;
  const outono = C.fatorDoLugar(POCAO, PORTO, { dia: 190 }).fator;
  t("no inverno a erva é cara", inverno > outono);
  t("na colheita é barata", C.fatorEstacao("erva", 190) < 1);
  t("e o couro fica barato no inverno", C.fatorEstacao("couro", 280) < 1);
  t("o motivo nomeia a estação", /Inverno/.test(C.linhaDoPreco(C.fatorDoLugar(POCAO, PORTO, { dia: 280 }).porques)));
  /* toda estação tem nome na tabela, ou o fator cala sem avisar */
  t("as quatro estações estão na tabela", [1, 100, 190, 280].every((d) => C.fatorEstacao("erva", d) !== 1));
  t("o que a estação não mexe fica em 1", C.fatorEstacao("papel", 280) === 1);
}

sec("5. A PROCURA DO PRÓPRIO HERÓI");
{
  let p = {};
  const antes = C.fatorDoLugar(POCAO, PORTO, { dia: 10, pressoes: p }).fator;
  for (let i = 0; i < 5; i++) p = C.apertarProcura(p, PORTO, "erva", 10);
  const depois = C.fatorDoLugar(POCAO, PORTO, { dia: 10, pressoes: p }).fator;
  t("esvaziar a prateleira encarece o que resta", depois > antes);
  t("e diz por quê", /procuraram muito/.test(C.linhaDoPreco(C.fatorDoLugar(POCAO, PORTO, { dia: 10, pressoes: p }).porques)));
  /* o teto existe porque sem ele um herói rico vira uma parede */
  let m = {};
  for (let i = 0; i < 200; i++) m = C.apertarProcura(m, PORTO, "erva", 10);
  t("há um teto", C.pressaoAtual(m, PORTO, "erva", 10) <= C.PRESSAO_TETO + 1e-9);
  /* e o mundo não gira em torno dele: a praça esquece */
  t("a pressão cede com os dias", C.pressaoAtual(p, PORTO, "erva", 40) === 0);
  t("outro gênero não é afetado", C.pressaoAtual(p, PORTO, "metal", 10) === 0);
  t("nem a mesma erva noutra cidade", C.pressaoAtual(p, SERRA, "erva", 10) === 0);
  /* vender é o mesmo fato do outro lado do balcão */
  const vend = C.fatorDoLugar(POCAO, PORTO, { dia: 10, pressoes: p, vendendo: true }).fator;
  t("quem despeja na praça recebe menos", vend < C.fatorDoLugar(POCAO, PORTO, { dia: 10, vendendo: true }).fator);
  t("e o motivo é o outro lado do mesmo fato", /praça está cheia/.test(C.linhaDoPreco(C.fatorDoLugar(POCAO, PORTO, { dia: 10, pressoes: p, vendendo: true }).porques)));
  t("acento e caixa não criam duas praças", C.chaveDaPressao({ nome: " Vau Das Redes " }, "erva") === C.chaveDaPressao({ nome: "vau das redes" }, "erva"));
}

sec("6. A GAVETA TEM FUNDO");
{
  const aldeia = C.caixaDe({ id: "f|1", tipo: "ferreiro" }, SERRA, 3);
  const capital = C.caixaDe({ id: "f|1", tipo: "ferreiro" }, CORTE, 3);
  /* v9.140: relativo, e não um número cravado. A gaveta passou a derivar da
     população — e a prova que cravava 200 media a minha memória da tabela
     antiga, não o comportamento. O que importa é que a aldeia não compre o
     que só uma capital compra. */
  t("a aldeia tem pouco perto da capital", aldeia < capital / 4);
  t("e não compra uma relíquia cara", aldeia < 500);
  t("a capital tem muito", capital > aldeia * 5);
  t("a ruína não tem nada", C.caixaDe({ id: "x", tipo: "geral" }, { nome: "R", porte: "ruina" }, 3) === 0);
  t("o relicário guarda mais que o boticário", C.caixaDe({ id: "a", tipo: "relicario" }, CORTE, 3) > C.caixaDe({ id: "a", tipo: "boticario" }, CORTE, 3));
  /* oscila, não sorteia: a gaveta de amanhã é parecida com a de hoje */
  const dias = [1, 2, 3, 4, 5].map((d) => C.caixaDe({ id: "f|1", tipo: "ferreiro" }, CORTE, d));
  t("a gaveta oscila, não sorteia", Math.max(...dias) / Math.min(...dias) < 1.6);
  t("e é a mesma no mesmo dia", C.caixaDe({ id: "f|1", tipo: "ferreiro" }, CORTE, 3) === capital);
  t("o que ele já gastou sai do que pode pagar", C.podePagar({ id: "f|1", tipo: "ferreiro" }, CORTE, 3, 1000) === Math.max(0, capital - 1000));
  t("e nunca fica negativo", C.podePagar({ id: "f|1", tipo: "ferreiro" }, SERRA, 3, 99999) === 0);
}

sec("7. A PECHINCHA CUSTA QUANDO FALHA");
{
  const otimo = C.pechinchar({ bonus: 20, dificuldade: 12, sorte: () => 0.99 });
  const pessimo = C.pechinchar({ bonus: -5, dificuldade: 12, sorte: () => 0.0 });
  t("com sorte, o preço cai", otimo.ok && otimo.ajuste < 1);
  t("sem sorte, o preço SOBE", !pessimo.ok && pessimo.ajuste > 1);
  /* sem custo não é negociação, é um botão de desconto */
  t("o pior caso dói", pessimo.ajuste >= 1 + C.PECHINCHA_PERDA);
  t("e há um meio-termo em que nada muda", (() => {
    for (let i = 0; i < 20; i++) { const r = C.pechinchar({ bonus: 0, dificuldade: 12, sorte: () => i / 20 }); if (!r.ok && r.ajuste === 1) return true; }
    return false;
  })());
  t("o 1 natural falha sempre", C.pechinchar({ bonus: 99, dificuldade: 5, sorte: () => 0 }).ok === false);
  t("o 20 natural passa sempre", C.pechinchar({ bonus: -99, dificuldade: 30, sorte: () => 0.99 }).ok === true);
  t("numa metrópole é mais duro que numa aldeia", C.dificuldadeDaPechincha({ porte: "metropole" }) > C.dificuldadeDaPechincha({ porte: "aldeia" }));
  t("e o relicário é o mais duro de todos", C.dificuldadeDaPechincha({ porte: "cidade" }, { tipo: "relicario" }) > C.dificuldadeDaPechincha({ porte: "cidade" }, { tipo: "geral" }));
}

sec("8. OS DOIS LADOS DO BALCÃO TÊM NOMES DIFERENTES");
{
  /* `profissoes.js` exporta um `precoDeVenda` que significa O CONTRÁRIO do
     que o mercado chamava de `precoDeVenda`: lá é o que o herói RECEBE, aqui
     era o que ele PAGA. O App importa os dois. O nome foi consertado na
     origem — nome que engana na origem engana em todo lugar que o usa. */
  t("o mercado não exporta mais o nome ambíguo", M.precoDeVenda === undefined && M.precoDeCompra === undefined);
  t("agora diz quem cobra", typeof M.precoDaBanca === "function");
  t("e quem paga", typeof M.precoQueOferecem === "function");
  t("o das profissões continua onde estava", typeof P.precoDeVenda === "function");
  t("e o App não importa dois nomes iguais", !/precoDeVenda[^,\n]*from "\.\/mercado\.js"/.test(APP));
  /* comprar custa mais do que vender rende, sempre — senão há moto-perpétuo */
  const compra = M.precoDaBanca(ESPADA, SERRA, { tipo: "geral" }, { dia: 1 });
  const venda = M.precoQueOferecem(ESPADA, SERRA, { dia: 1 });
  t("comprar custa mais do que vender rende", compra > venda);
}

sec("9. A PRATELEIRA SABE ONDE ESTÁ");
{
  /* a aldeia de pescadores não expõe meia dúzia de peitorais de placas */
  const conta = (cidade, genero) => {
    let n = 0, bancas = 0;
    for (let d = 1; d < 400; d += 7) {
      for (const m of M.mercadoresDaCidade({ ...cidade }, d, 3, null)) {
        bancas++;
        n += m.estoque.filter((i) => C.generoDoItem(i) === genero).length;
      }
    }
    return n / Math.max(1, bancas);
  };
  const metalNaSerra = conta(SERRA, "metal");
  const metalNoPantano = conta({ nome: "Lodo Fundo", bioma: "pantano", porte: "aldeia" }, "metal");
  t("a serra expõe metal", metalNaSerra > 0.5);
  t("o pântano quase não expõe", metalNoPantano < metalNaSerra);
  t("e a diferença é visível", metalNaSerra / Math.max(0.01, metalNoPantano) > 1.4);
  /* o ambulante é a exceção, e de propósito: ele é quem traz o que não há */
  t("o ambulante ignora a vocação do lugar", /t\.id === "ambulante" \? null : vocacaoDe\(cidade\)/.test(MERC));
  /* e o estoque continua determinístico, que é a promessa da v9.2 */
  const a = M.mercadoresDaCidade(SERRA, 30, 3, null).map((m) => m.estoque.map((i) => i.nome).join()).join("|");
  const b = M.mercadoresDaCidade(SERRA, 30, 3, null).map((m) => m.estoque.map((i) => i.nome).join()).join("|");
  t("a mesma banca no mesmo dia é a mesma", a === b);
  t("e o preço da prateleira já traz o motivo", M.mercadoresDaCidade(SERRA, 30, 3, null).some((m) => m.estoque.some((i) => (i.porques || []).length)));
}

sec("10. LIGADO AO JOGO, E SEM DOIS NÚMEROS PARA A MESMA COISA");
{
  t("a pressão atravessa até onde o preço é escrito", /mercadoresDaCidade\(cidadeMercado, diaRef\.current[\s\S]{0,120}?pressoes:/.test(APP));
  t("comprar aperta a procura", /pressoes: apertarProcura\(mercadoRef\.current\.pressoes, cidadeMercado, generoDoItem\(it\), diaRef\.current\)/.test(APP));
  /* comprar E vender apertam a praça: dois pontos, e nenhum a mais —
     medido por contagem, e não por distância no arquivo */
  t("vender também", (APP.match(/pressoes: apertarProcura\(/g) || []).length === 2);
  /* a etiqueta e o cofre saem da MESMA função — o que o texto promete, a
     bolsa entrega */
  t("o botão de vender lê a oferta", /const of = ofertaPor \? ofertaPor\(v\.it\) :/.test(APP));
  t("e o cofre lê a mesma oferta", /const of = ofertaPor\(item\);/.test(APP));
  t("sem comprador, o botão não mente", /\{of\.quem \? `vender ◉ \$\{of\.valor\}` : "ninguém compra"\}/.test(APP));
  t("e a venda recusa em vez de inventar", /if \(!of\.quem\) \{ pushMsgs/.test(APP));
  /* a gaveta desce ao pagar */
  t("o que ele pagou sai da gaveta", /gastos\[of\.quem\.id\] = \{ dia: diaRef\.current, moedas: gastoHojeDe\(of\.quem\.id\) \+ valor \}/.test(APP));
  t("e o teto é o que ele ainda tem", /podePagar\(m, cidadeMercado, diaRef\.current, gastoHojeDe\(m\.id\)\) >= valor/.test(APP));
  /* uma proposta por dia, e o preço da tela já é o preço com barganha */
  t("uma pechincha por mercador por dia", /if \(jah && jah\.dia === diaRef\.current\)/.test(APP));
  t("a barganha entra no preço da etiqueta", /precoDeCompraPara\(personagem, it\.preco\) \* aj/.test(APP));
  t("o Narrador recebe o comércio do lugar", /porNaPauta\(p, "onde", envelopeDoComercio\(/.test(APP));
  t("e o estado novo é salvo", /salvar\(\{ mercado: mercadoRef\.current \}\)/.test(APP));
}

sec("11. O ENVELOPE É FATO, NÃO SUGESTÃO");
{
  const e = C.envelopeDoComercio(SERRA, 280);
  t("diz o que o lugar é", /de mineração/.test(e));
  t("o que sobra", /sobra metal/.test(e));
  t("o que falta", /Falta erva/.test(e));
  t("a estação", /Inverno/.test(e));
  t("e proíbe contradizer", /não faça abundar o que falta/i.test(e));
  t("ruína não tem envelope", C.envelopeDoComercio({ nome: "R", porte: "ruina" }, 1) === "");
  t("é curto o bastante para a Pauta", e.length < 500);
}

console.log(`\ncomercio v9.138: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
