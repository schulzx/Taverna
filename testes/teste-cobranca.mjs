/* teste-cobranca.mjs (v9.70) — "se ela disse 'você acha 100 moedas e uma
   poção de vida', então o mestre credita 100 moedas e uma poção de vida".

   Metade desta suíte é o contrário: as frases que NÃO podem creditar. Já
   houve neste projeto um cão de guarda que lia condições na narração, e
   "o ar quente preso na garganta" virou dois turnos de Agarrado. */
import {
  lerGanhos, oQueFaltaCreditar, frasesDe, consumiveisNaFrase,
  falaDaCobranca, envelopeDaCobranca, envelopeDaCobrancaNegada, TETO_DE_MOEDAS,
} from "../src/cobranca.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

sec("1. o caso do relato");
{
  const n = "Você acha 100 moedas e uma poção de cura no fundo do baú.";
  const g = lerGanhos(n);
  t("leu as 100 moedas", g.moedas === 100);
  t("e a poção", g.consumiveis.length === 1 && /Cura/.test(g.consumiveis[0].nome));
  t("na dúvida do tamanho, entra a menor", /Pequena/.test(g.consumiveis[0].nome));
  const d = oQueFaltaCreditar(n, null);
  t("sem declaração, falta creditar tudo", d.moedas === 100 && d.consumiveis.length === 1);
  t("a linha do jogador diz o que entrou", /100 moedas/.test(falaDaCobranca(d)));
  t("o envelope proíbe entregar de novo", /não entregue de novo/.test(envelopeDaCobranca(d)));
  t("e ensina o caminho certo", /DECLARE em "mudancas"/.test(envelopeDaCobranca(d)));
}

sec("2. a subtração — o caso comum é NÃO fazer nada");
{
  const n = "Você embolsa 50 moedas do cinto do morto.";
  t("declarado certo, não sobra nada", oQueFaltaCreditar(n, { moedas: 50 }).temAlgo === false);
  t("declarado a mais, também não", oQueFaltaCreditar(n, { moedas: 80 }).temAlgo === false);
  t("declarado a menos, cobra a diferença", oQueFaltaCreditar(n, { moedas: 20 }).moedas === 30);
  const comItem = "Você pega uma Poção de Cura Média da prateleira.";
  t("item declarado não é creditado duas vezes",
    oQueFaltaCreditar(comItem, { adicionar_itens: ["Poção de Cura Média"] }).consumiveis.length === 0);
  t("item narrado e não declarado, sim",
    oQueFaltaCreditar(comItem, { moedas: 0 }).consumiveis.length === 1);
}

sec("3. AS TRAVAS — o que não pode creditar nunca");
{
  const naoPode = [
    ["descrição, não ganho", "No bolso dele havia 200 moedas de ouro."],
    ["negação explícita", "Você não encontra nada de valor: o baú tem 300 moedas falsas de chumbo."],
    ["nada encontrado", "Você vasculha e não acha nenhuma moeda."],
    ["quem ganha é outro", "O taverneiro recebe 40 moedas pelas bebidas."],
    ["preço, não ganho", "O ferreiro pede 90 moedas pela lâmina."],
    ["o herói entrega", "Você paga 25 moedas e deixa a poção de cura no balcão."],
    ["promessa futura", "Ele diz que vai te dar 500 moedas se você voltar com a cabeça do lobo."],
    ["metáfora", "A luz da fogueira parece ouro derretido nas suas mãos."],
  ];
  for (const [porque, frase] of naoPode) {
    const g = lerGanhos(frase);
    t(`${porque}: "${frase.slice(0, 46)}…"`, g.moedas === 0 && g.consumiveis.length === 0);
  }
}

sec("4. o teto — o absurdo é aparado, e o sistema diz que aparou");
{
  const g = lerGanhos("Você encontra 99999 moedas empilhadas até o teto.");
  t("aparou no teto", g.moedas === TETO_DE_MOEDAS);
  t("e registrou que aparou", g.aparado === true);
  t("o envelope avisa o Mestre", /passava do teto de um turno/.test(envelopeDaCobranca(oQueFaltaCreditar("Você encontra 99999 moedas.", null))));
}

sec("5. a leitura por FRASE, e não pelo texto inteiro");
{
  /* a trava da negação só é honesta se o escopo dela for pequeno: num
     texto inteiro, um "não" em qualquer canto apagaria um achado real
     três parágrafos adiante */
  const texto = "A sala não tem janelas. O ar é pesado. Você acha 60 moedas numa fresta do assoalho.";
  t("uma negação numa frase não apaga o ganho de outra", lerGanhos(texto).moedas === 60);
  t("frasesDe separa por pontuação", frasesDe(texto).length === 3);
  const junto = "Você não acha nada no armário, mas encontra 60 moedas no assoalho.";
  t("mas dentro da MESMA frase a negação vence — o lado seguro", lerGanhos(junto).moedas === 0);
}

sec("6. só item de catálogo entra na bolsa");
{
  t("poção de cura é do catálogo", consumiveisNaFrase("uma poção de cura pequena").length === 1);
  t("poção de mana também", consumiveisNaFrase("uma poção de mana média").length === 1);
  /* um "anel élfico" inventado pela narração não vira item: o sistema não
     sabe o que ele faz, e item sem regra na bolsa é promessa que ninguém
     vai cumprir */
  t("mas um anel inventado não", consumiveisNaFrase("um anel élfico antiquíssimo").length === 0);
  t("nem uma espada genérica", consumiveisNaFrase("uma espada enferrujada").length === 0);
  t("texto vazio não quebra", lerGanhos("").moedas === 0 && lerGanhos(null).moedas === 0);
  t("mudanças nulas não quebram", oQueFaltaCreditar("Você pega 10 moedas.", undefined).moedas === 10);
}

sec("7. O DADO MANDA MAIS QUE A NARRAÇÃO");
{
  /* achado na própria prova desta versão: o teste de furtividade FALHOU, o
     Mestre narrou o roubo dando certo assim mesmo, e a cobrança creditou as
     cem moedas. A peça feita para a ficha obedecer à ficção tinha acabado
     de fazer a ficção passar por cima do dado — a inversão exata do que
     este projeto inteiro construiu. */
  const d = oQueFaltaCreditar("Você embolsa 100 moedas do cinto dele.", null);
  const env = envelopeDaCobrancaNegada(d);
  t("a recusa diz que o teste falhou", /o teste deste turno FALHOU/.test(env));
  t("e que nada aconteceu", /nada disso aconteceu/.test(env));
  t("proíbe o desmentido na cena seguinte", /NÃO corrija a cena com um desmentido/.test(env));
  t("e crava a regra", /O dado decide o desfecho/.test(env));
  t("sem nada a cobrar, não há recusa", envelopeDaCobrancaNegada({ temAlgo: false }) === "");
}

console.log(`\ncobrança v9.70: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
