/* ============================================================
   A FRASE QUE PAGA (12/10, MM11 · 8.ª sessão)

   Na 8.ª sessão de prova o jogador pagou seis vezes, 27 moedas, e
   nenhuma saiu da bolsa (15 → 15, 34 → 34). Duas causas, as duas
   provadas sobre o registo das chamadas (registo-s8.jsonl):

   1. o App passava a oQueFaltaDebitar `conteudo + nota` — a frase do
      jogador SEM a etiqueta "[O QUE EU FAÇO AGORA…]", e gastoDoPedido só
      lia o que vinha depois dela. A suíte da E3 montava o envelope COM a
      etiqueta e passava; o jogo, sem ela, devolvia 0;
   2. a moeda do mundo. O léxico chamou-lhe "Escamas", e "Pago as dez
      escamas" / "Pago as oito escamas" (18 das 27) não tinham régua.

   As frases e as narrações abaixo são as reais, tiradas do registo
   (as chamadas do Narrador que levaram cada frase). O "antes" é o
   caminho do App até à v9.425; o "depois" é o de agora: a frase por
   nome (`pedido`) e a palavra do mundo (`moeda`).
   ============================================================ */
import fs from "node:fs";
import { oQueFaltaDebitar, raizDaMoeda, lerGastos } from "../src/cobranca.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const S8 = {
  J6: { J: "Pago duas moedas ao guarda, discretamente, para ele fechar os olhos e me deixar falar um minuto com Ursa.", narrativa: "O guarda olha as duas moedas na sua palma e não as pega logo. \"Um minuto não muda nada, e se Nyla desce a escada, eu fico sem o selo e sem o braço.\" Ele respira fundo, pega as moedas e enfia no bolso da cota. \"Pelo vão da porta, sem entrar. E se ela gritar, acabou.\"\n\nFreya já está encostada na parede ao lado, com os olhos na rua. Uma mulher carregando uma gaiola com um corvo passa por trás de vocês, as penas pretas arranhando o vime, e desaparece na ladeira sem olhar para trás.\n\nO guarda puxa uma chave do cinto e a enfia numa porta estreita, à esquerda da entrada. O ferrolho range. Lá dentro, a voz de Ursa corta o silêncio: \"Se veio me contar que chove lá fora, já sei.\"", mudancas: null },
  J11: { J: "Pago os quatro cobres.", narrativa: "Astrid apanha as quatro escamas sem pressa, mordendo uma delas antes de guardar no bolso do avental. \"Pagou, bebe. E se quiser que eu finja que não vi a anã aí do seu lado, custa mais duas.\"\n\nEla apoia os cotovelos no balcão, esperando.", mudancas: null },
  J13: { J: "Agradeço a Astrid, deixo uma gorjeta de uma moeda e volto às Celas Trêmulas com Freya. Procuro Nyla, a carcereira, e pergunto o que ela guarda ali embaixo.", narrativa: "Você deixa a moeda no balcão e sai da Serpente & o Elmo com Freya. As ruas ainda se enchem de gente carregando fardos e chamando por preços. Nas Celas Trêmulas, a porta de ferro está entreaberta, e o cheiro de mofo e brasa fria sai do corredor.\n\nLá dentro, Nyla senta numa banqueta torta, mexendo num molho de chaves. Ela ergue os olhos e responde com outra pergunta: \"E quem quer saber?\" Atrás dela, Rurik se aproxima mancando, encostado ao umbral, e chama alguém da guarita com um gesto. \"Falk, vem ver quem voltou.\"\n\nNo canto, uma coisa fora do sítio chama seu olho: sobre o livro dos nomes, uma placa de mármore fendido, manchada de terra, com um nome riscado que começa na metade e termina em \"...elia\". É aqui mesmo que se esconde o que a história procura.", mudancas: null },
  J41: { J: "Compro um pão para Ursa. Pago os dois cobres.", narrativa: "Você tira duas escamas do bolso e as põe na palma da camponesa. Ela apanha as moedas, rápida, e estende um pão moreno, ainda morno, com a casca estalando. Ursa o recebe com as duas mãos, e por um instante só segura o pão, sem morder, os olhos baixos.\n\n\"Obrigada.\" A camponesa volta a ajeitar o cesto. Freya observa a estrada, a neblina subindo das valetas, e então olha para você, calada, como quem espera uma ordem.", mudancas: null },
  J49: { J: "Pago as dez escamas e deixo que apalpem as trouxas. Entro com Freya em Ponte Brumoso e vou direto procurar uma cama barata e um lugar seco.", narrativa: "Você paga as dez escamas na mão da anã, e as duas guardas apalpam as trouxas com pressa, mais por costume do que por desconfiança. A chuva escorre pelo elmo de uma delas. A anã devolve as moedas ao bolso e bate a lança no chão. \"Pode entrar. E diga à Freya que a próxima vez que vier, que traga sal para as juntas da porta.\"\n\nVocês passam pelo portão e Freya puxa a capa sobre a cabeça. As ruas de Ponte Brumoso estão escuras e quase vazias, com poças refletindo as luzes raras das janelas. A estalagem mais próxima exibe um letreiro torto e seus degraus alagados. Freya para diante da porta. \"Aqui, não. Conheço um lugar mais barato. A cama é dura, mas o telhado não pinga.\" Ela te olha, esperando.", mudancas: null },
  J51: { J: "Pago as oito escamas, subo com Freya para o quarto, tiro as botas molhadas e durmo até o sol.", narrativa: "Você paga as oito escamas e a mulher do xale entrega uma vela acesa. \"Último quarto à esquerda. O gato se deita no pé da cama da janela. Não acorde ele com o barulho das botas.\"\n\nO quarto é estreito, com duas camas de palha e um cheiro de alho seco no ar. Freya senta na beirada, desamarra as botas com paciência, e o gato, cinzento, observa de uma cama sem se mover. Você tira as botas molhadas e as deixa perto da porta. A vela chia e a luz oscila no teto baixo.\n\nFreya deita de costas, os olhos abertos no escuro. \"Amanhã a gente procura a gnoma. Mas dorme, caçadora. Ninguém foge com chuva essa.\"", mudancas: null },
};
/* o que cada uma devia ter tirado da bolsa */
const DEVIA = { J6: 2, J11: 4, J13: 1, J41: 2, J49: 10, J51: 8 };
const MOEDA = "Escamas";

sec("as seis frases da 8.ª — o caminho velho do App não debitava nenhuma");
for (const [k, x] of Object.entries(S8)) {
  /* o que o App passava: a frase e a nota, sem etiqueta, sem moeda */
  const antes = oQueFaltaDebitar(x.narrativa, x.mudancas, { bolsa: 34, envelopes: x.J + "\n" });
  t(`${k} antes: 0 («${x.J.slice(0, 40)}…»)`, antes.moedas === 0);
}

sec("e o de agora debita cada uma pelo valor dito");
let soma = 0;
for (const [k, x] of Object.entries(S8)) {
  const depois = oQueFaltaDebitar(x.narrativa, x.mudancas, { bolsa: 34, envelopes: x.J + "\n", pedido: x.J, moeda: MOEDA });
  soma += depois.moedas;
  t(`${k} depois: −${DEVIA[k]} («${x.J.slice(0, 40)}…»)`, depois.temAlgo && !depois.semFundos && depois.moedas === DEVIA[k]);
}
t("as seis somam as 27 moedas da sessão", soma === 27);

sec("o mesmo pagamento, dito pelo jogador e pelo Narrador, conta uma vez");
/* J49 e J51: o Narrador repetiu "Você paga as dez/oito escamas" — os dois lados leem 10 e 8 */
t("J49: a cena também lê as dez escamas, e a bolsa desce 10, não 20",
  lerGastos(S8.J49.narrativa, { moeda: MOEDA }).moedas === 10 &&
  oQueFaltaDebitar(S8.J49.narrativa, null, { bolsa: 34, pedido: S8.J49.J, moeda: MOEDA }).moedas === 10);
t("J51: idem com as oito", oQueFaltaDebitar(S8.J51.narrativa, null, { bolsa: 34, pedido: S8.J51.J, moeda: MOEDA }).moedas === 8);
t("a frase por nome e a etiqueta nos envelopes, juntas, não somam (o nome vence)",
  oQueFaltaDebitar("Ele guarda.", null, { bolsa: 34, pedido: "Pago os quatro cobres.", envelopes: "[O QUE EU FAÇO AGORA — a narração abre por aqui]\nPago os quatro cobres." }).moedas === 4);
t("a compra já registada pelo sistema continua a fechar a porta, mesmo com a frase por nome",
  !oQueFaltaDebitar("Você paga.", null, { bolsa: 34, pedido: "Pago os dois cobres.", envelopes: "[COMPRA — JÁ REGISTRADA PELO SISTEMA] Comprei pão por ◉ 2." }).temAlgo);
t("o campo antigo, se ainda chegar, desconta (não cobra duas vezes)",
  !oQueFaltaDebitar(S8.J11.narrativa, { moedas: -4 }, { bolsa: 34, pedido: S8.J11.J, moeda: MOEDA }).temAlgo);

sec("as travas da frase continuam de pé com a frase por nome");
t("a pergunta não paga", !oQueFaltaDebitar("x", null, { bolsa: 34, pedido: "Pago as dez escamas?", moeda: MOEDA }).temAlgo);
t("a condição não paga", !oQueFaltaDebitar("x", null, { bolsa: 34, pedido: "Se ela deixar, pago as dez escamas.", moeda: MOEDA }).temAlgo);
t("a cena que recusa o dinheiro ganha", !oQueFaltaDebitar("Ela empurra as escamas de volta. — É por conta da casa.", null, { bolsa: 34, pedido: "Pago as oito escamas.", moeda: MOEDA }).temAlgo);
t("sem fundos, nada desce e o bilhete diz porquê", (() => { const d = oQueFaltaDebitar("x", null, { bolsa: 5, pedido: S8.J49.J, moeda: MOEDA }); return d.semFundos && d.moedas === 0 && d.faltou === 10; })());
t("e a 8.ª não tinha mais nenhuma frase que pagasse: o pedido do preço não paga", !oQueFaltaDebitar("x", null, { bolsa: 34, pedido: "Quanto custa um selo de visita? Não tenho salvo-conduto, mas tenho algumas moedas.", moeda: MOEDA }).temAlgo);

sec("a moeda do mundo");
t("Escamas → escama com o plural opcional", raizDaMoeda("Escamas") === "escamas?");
t("a primeira palavra só (Coroas de Cobre → coroas)", raizDaMoeda("Coroas de Cobre") === "coroas?");
t("a de sempre não muda a régua", raizDaMoeda("moedas") === "" && raizDaMoeda("Ouro") === "");
t("vazio, nulo e lixo não fabricam régua", raizDaMoeda("") === "" && raizDaMoeda(null) === "" && raizDaMoeda("◉") === "" && raizDaMoeda("ab") === "");
t("o singular também paga («pago uma escama»)", oQueFaltaDebitar("x", null, { bolsa: 34, pedido: "Deixo uma escama no balcão.", moeda: MOEDA }).moedas === 1);
t("sem a moeda do mundo, «escamas» não é dinheiro (a cota de escamas não sai da bolsa)", !oQueFaltaDebitar("x", null, { bolsa: 34, pedido: "Pago as dez escamas." }).temAlgo);

sec("a fiação no App");
const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
t("o App passa a frase do jogador por nome à bolsa", /aplicarResposta\(resp, persAtual, \{ envelopes: conteudo \+ "\\n" \+ nota, pedido: pedidoDaBolsa, moeda: moedaDaBolsa \}\)/.test(app));
t("a frase é a que a escuta lê como do jogador (nunca um envelope)", /lerOPedido\(conteudo\); pedidoDaBolsa = pb && pb\.doJogador \? pb\.texto : ""/.test(app));
/* MOVIDA (20/10, o Léxico vira camada de cor): a palavra continua a ser a do
   léxico, mas passa por `nomeDaMoeda` — o nome único da campanha, o mesmo da
   linha ECONOMIA do pedido (teste-lexico-cor.mjs §2). */
t("a moeda é a palavra do léxico", /nomeDaMoeda\(\(mundoAtual\(\) \|\| \{\}\)\.lexico\)/.test(app));
t("e o aplicarResposta entrega as duas a oQueFaltaDebitar", /pedido: typeof op\.pedido === "string" \? op\.pedido : "", moeda: typeof op\.moeda === "string" \? op\.moeda : ""/.test(app));

console.log(`\nfrase que paga: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
