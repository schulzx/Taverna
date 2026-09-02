/* O CELULAR (v9.156)

   Medido no viewport de 375px: o trilho de abas flutuava POR CIMA do
   conteúdo e comia um terço da largura. A HUD da masmorra ficava
   espremida atrás dele, os chips de ação quebravam em três linhas, e o
   campo de escrita encolhia até "O que você f…".

   A raiz era uma só, escrita CATORZE vezes: `paddingRight: "68px"` em
   linha, para abrir espaço ao trilho vertical. Num monitor, 68 de 1400 é
   nada. Num telefone, 68 de 375 é dezoito por cento reservados para
   sempre — e o trilho ainda por cima.

   O QUE ESTA SUÍTE PROTEGE é a decisão de fundo: a reserva de espaço
   mora numa CLASSE, e não em catorze estilos em linha. Catorze linhas
   com o mesmo `md:pr-[68px]` seriam a mesma decisão escrita catorze
   vezes — e a décima quinta tela nasceria errada, porque ninguém lembra
   de uma regra que não tem nome.

   Beta é telefone. Isto bloqueava tanto quanto a API aberta. */

const { readFileSync } = await import("node:fs");
const APP = readFileSync("../src/App.jsx", "utf8");
const CSS = readFileSync("../src/constantes.js", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. NENHUMA RESERVA DE 68px SOBROU EM LINHA");
{
  /* Estilo em linha não tem media query. Enquanto houver um, existe uma
     tela que reserva espaço para uma barra que não está ali. */
  t("nenhum paddingRight em linha", !/paddingRight: "68px"/.test(APP));
  t("nenhum marginRight em linha", !/marginRight: "68px"/.test(APP));
  t("e nenhum 68px solto no App", !/68px/.test(APP));
}

sec("2. A RESERVA VIROU UMA DECISÃO COM NOME");
{
  t("a classe existe", /\.tv-espaco-abas \{/.test(CSS));
  t("e a de margem também", /\.tv-margem-abas \{/.test(CSS));
  /* NO TELEFONE a reserva é EMBAIXO (onde a barra está), e não à
     direita — que é a inversão inteira desta onda */
  t("no telefone, reserva embaixo", /\.tv-espaco-abas \{ padding-right: 0; padding-bottom: [\d.]+rem; \}/.test(CSS));
  t("e nada à direita", /padding-right: 0/.test(CSS));
  /* NO MONITOR volta a ser à direita, onde o trilho fica */
  const md = CSS.slice(CSS.indexOf("@media (min-width: 768px)"), CSS.indexOf("@media (min-width: 768px)") + 260);
  t("no monitor, 68px à direita", /padding-right: 68px/.test(md));
  t("e nada embaixo", /padding-bottom: 0/.test(md));
  t("a margem acompanha", /margin-right: 68px/.test(md));
  /* o comentário guarda a armadilha que derrubou o build: este bloco mora
     DENTRO da template literal do CSS, e uma crase ali fecha a literal */
  t("o comentário avisa da crase", /Sem crase neste comentário de propósito/.test(CSS));
}

sec("3. O TRILHO MUDA DE FORMA — barra embaixo, trilho na lateral");
{
  const nav = APP.slice(APP.indexOf('aria-label="Painéis"') - 700, APP.indexOf('aria-label="Painéis"') + 60);
  /* o polegar alcança a base da tela; a lateral direita de um telefone de
     seis polegadas, não */
  t("no telefone é barra inferior", /inset-x-0 bottom-0 flex-row/.test(nav));
  t("espalhada na largura", /justify-around/.test(nav));
  t("no monitor volta para a direita", /md:right-0 md:top-1\/2/.test(nav));
  t("e volta a ser coluna", /md:flex-col/.test(nav));
  /* barra que flutua sobre o conteúdo sem fundo deixa o texto passar por
     baixo e vira ilegível nos dois */
  t("a barra tem chão próprio", /borderTop: `1px solid \$\{T\.line\}`/.test(APP));
  /* o botão preenche a largura no telefone e volta a ter medida fixa no
     monitor */
  t("o botão se estica no telefone", /flex-1 md:flex-none/.test(APP));
  t("e o canto certo em cada forma", /rounded-xl md:rounded-l-xl md:rounded-r-none/.test(APP));
}

sec("4. O PAINEL VIRA FOLHA CHEIA NO TELEFONE");
{
  /* 88vw num telefone deixa uma faixa inútil do lado e encolhe tudo que
     está dentro; a folha cheia é o padrão de telefone há dez anos */
  t("largura inteira no telefone", /w-full md:w-80 md:max-w-\[88vw\]/.test(APP));
  t("e menos respiro em volta, onde ele é caro", /p-4 md:p-5/.test(APP));
}

sec("5. AS TELAS DE JOGO CARREGAM A CLASSE");
{
  /* se a classe existe e ninguém a usa, a reserva simplesmente sumiu — e
     o trilho do monitor volta a cobrir conteúdo */
  const quantas = (APP.match(/tv-espaco-abas/g) || []).length;
  const margens = (APP.match(/tv-margem-abas/g) || []).length;
  t(`a reserva é usada em ${quantas} telas`, quantas >= 8);
  t(`e a margem em ${margens}`, margens >= 4);
  t("a área que rola também reserva", /tv-scroll tv-espaco-abas flex-1 overflow-y-auto/.test(APP));
  t("a linha de escrita também", /className="tv-espaco-abas px-4 md:px-8 shrink-0"/.test(APP));
}

console.log(`\ncelular v9.156: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
