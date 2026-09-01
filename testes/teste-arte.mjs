/* A TÁBUA, O PAPEL E A VINHETA (v9.127)

   O mural é a única tela do jogo que representa um OBJETO do mundo: uma
   tábua com papéis pregados. Enquanto foi uma lista de retângulos dentro de
   um painel igual a todos os outros, isso não aparecia em lugar nenhum.

   Esta suíte defende três coisas que dão errado calado:

   1. que nada disso vire arquivo de imagem — a decisão do projeto é que a
      arte é desenho, e um .png entrando no repositório muda como a Vercel
      constrói e quanto o jogador baixa;
   2. que o giro de cada cartaz seja DERIVADO e não sorteado — um papel que
      muda de ângulo a cada redesenho da tela não está pregado, está
      tremendo;
   3. que a vinheta não coma clique. Uma camada fixa por cima do jogo
      inteiro sem `pointer-events: none` deixa o jogo bonito e inerte, e o
      sintoma ("não consigo clicar em nada") não aponta para o enfeite. */

const RAIZ = "../";
const { readFileSync } = await import("node:fs");
const CSS = (await import("../src/constantes.js")).FONT_CSS;
const APP = readFileSync(RAIZ + "src/App.jsx", "utf8").replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");

let bons = 0, maus = 0;
const t = (nome, cond) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

sec("1. a tábua existe, e é desenho");
{
  for (const c of ["tv-cortica", "tv-cartaz", "tv-percevejo", "tv-vinheta", "tv-pregado"]) {
    t(`a folha define .${c}`, new RegExp(`\\.${c}[\\s.:,{]`).test(CSS));
  }
  /* NENHUM ARQUIVO: a cortiça é gradiente, o percevejo é gradiente, a
     moldura é borda. Um url() aqui seria a primeira imagem do repositório
     entrando pela porta dos fundos. */
  t("nenhuma imagem externa na folha", !/url\((?!['"]?https:\/\/fonts\.googleapis)/.test(CSS));
  t("a cortiça é feita de gradiente", /\.tv-cortica[\s\S]{0,700}?radial-gradient/.test(CSS));
  t("o percevejo também", /\.tv-percevejo[\s\S]{0,300}?radial-gradient/.test(CSS));
  t("e a moldura é borda de verdade", /\.tv-cortica[\s\S]{0,700}?border: 7px solid/.test(CSS));
}

sec("2. O GIRO É DERIVADO, NUNCA SORTEADO");
{
  t("o mural tem uma função de giro", /const giro = \(id\) =>/.test(APP));
  t("e ela sai do hash do id", /giro = \(id\) => \(\(\(hashSemente\(String\(id \|\| ""\)\)/.test(APP));
  t("nenhum sorteio no desenho do cartaz", !/const cartaz = \(c\) => \{[\s\S]{0,900}?Math\.random/.test(APP));
  t("o cartaz é embrulhado no giro", /className="tv-pregado" style=\{\{ transform: `rotate\(\$\{giro\(c\.id\)\}deg\)` \}\}/.test(APP));
  /* o mesmo id tem de dar sempre o mesmo ângulo, e ids diferentes não podem
     cair todos no mesmo — senão a pilha fica com cara de baralho alinhado */
  const { hashSemente } = await import("../src/semente.js");
  const giro = (id) => (((hashSemente(String(id || "")) % 340) / 100) - 1.7).toFixed(2);
  t("o mesmo cartaz não muda de ângulo", giro("c1") === giro("c1"));
  t("cartazes diferentes se inclinam diferente", new Set(["a", "b", "c", "d", "e", "f"].map(giro)).size >= 5);
  t("e o ângulo é discreto: papel pregado, não confete", ["a", "b", "c", "d", "e", "f", "g", "h"].every((i) => Math.abs(Number(giro(i))) <= 1.7));
}

sec("3. O PERCEVEJO DIZ DE QUE PILHA O PAPEL É");
{
  /* as duas pilhas já têm rótulo; a cor da cabeça do alfinete diz a mesma
     coisa de relance, sem uma palavra a mais na tela */
  t("o percevejo segue o `oferecido` do cartaz", /tv-percevejo\$\{c\.oferecido \? " tv-roxo" : ""\}/.test(APP));
  t("e há uma cabeça roxa definida", /\.tv-percevejo\.tv-roxo/.test(CSS));
  t("o alfinete fica DENTRO do papel", /\.tv-percevejo[\s\S]{0,200}?top: 6px/.test(CSS));
}

sec("4. A VINHETA NÃO COME CLIQUE");
{
  t("ela existe na tela", /className="tv-vinheta" aria-hidden="true"/.test(APP));
  t("e é atravessável", /\.tv-vinheta[\s\S]{0,260}?pointer-events: none/.test(CSS));
  /* e mora ABAIXO de tudo que é painel: cabeçalho é z-30, a gaveta lateral
     e os avisos são z-40, as janelas são z-50. Uma vinheta por cima disso
     escureceria justamente a ficha e o mural, que é onde se lê número. */
  t("fica embaixo dos painéis", /\.tv-vinheta[\s\S]{0,260}?z-index: 1;/.test(CSS));
  t("o painel lateral continua acima dela", /<aside className="tv-slide tv-scroll fixed right-0 inset-y-0 z-40/.test(APP));
}

sec("5. AS DUAS PILHAS DIVIDEM A MESMA TÁBUA");
{
  t("a tábua embrulha as duas", /<div className="tv-cortica p-4 space-y-5">/.test(APP));
  t("os cartazes do mundo continuam em cima", /Cartazes disponíveis[\s\S]{0,900}?doMundo\.map\(cartaz\)/.test(APP));
  t("e os oferecidos embaixo", /Oferecidos a você[\s\S]{0,300}?oferecidos\.map\(cartaz\)/.test(APP));
  /* o espaço entre papéis cresceu junto com o giro: cartaz torto encostado
     no de cima vira pilha embolada */
  t("com folga entre os papéis", (APP.match(/<div className="space-y-4">\{(doMundo|oferecidos)\.map\(cartaz\)\}<\/div>/g) || []).length === 2);
}

console.log(`\narte v9.127: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
