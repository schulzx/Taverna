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
/* v9.244: a folha mudou de casa. O CSS saiu de `constantes.js` (onde
   eram 156 linhas de estilo embaixo das regras de jogo) e foi para
   `estilo.js`. As assercoes abaixo nao mudaram de exigencia — mudou so
   ONDE elas vao procurar. */
const CSS = readFileSync("../src/estilo.js", "utf8");
/* R21: a moldura do painel saiu do App.jsx para `painel-alforje.jsx` (o
   alforje). As asserções da folha cheia no telefone vão procurá-la lá —
   a exigência é a mesma, mudou só ONDE ela mora. */
const ALF = readFileSync("../src/painel-alforje.jsx", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. NENHUMA RESERVA DE 68px SOBROU EM LINHA");
{
  /* Estilo em linha não tem media query. Enquanto houver um, existe uma
     tela que reserva espaço para uma barra que não está ali. */
  t("nenhum paddingRight em linha", !/paddingRight: "68px"/.test(APP));
  t("nenhum marginRight em linha", !/marginRight: "68px"/.test(APP));
  /* v9.170: a régua olha para ESTILO, não para prosa. O comentário do
     trilho explica por que a reserva de 68px deixou de existir, e citar o
     número para contar a história não é reservá-lo. */
  t("e nenhum 68px em estilo no App", !/(padding|margin)(Right|-right):\s*"?68px/.test(APP));
}

sec("2. A RESERVA VIROU UMA DECISÃO COM NOME");
{
  t("a classe existe", /\.tv-espaco-abas \{/.test(CSS));
  t("e a de margem também", /\.tv-margem-abas \{/.test(CSS));
  /* NO TELEFONE a reserva é EMBAIXO (onde a barra está), e não à
     direita — que é a inversão inteira desta onda */
  /* v9.197: O `padding-right` FOI EMBORA, e a régua mudou de lado. Ela
     cobrava que a declaração existisse valendo 0 — e era justamente essa
     declaração que quebrava a tela no telefone: `padding-right` ganha de
     `px-4` na cascata, então dez elementos ficavam com 16px à esquerda e
     ZERO à direita. Reserva que não reserva nada não fica "por via das
     dúvidas": ela continua mandando. Agora a lei é a ausência dela. */
  /* R21: A RESERVA DE BAIXO DEIXOU DE SER DEVIDA, e a asserção muda de
     verdade com ela. Cobrava 4,75 rem porque no telefone a barra de abas era
     FIXA no fundo e comia 76 px: quem encostava nela tinha de os reservar. A
     barra saiu da coluna estreita (`TrilhoAbas` é `hidden md:flex`; a fita
     passou a ser a DO ALFORJE, que só existe aberta e por cima da cena), e a
     página ganhou os 76 px — medido vivo, 399,7 → 475,7 no turno de tela
     cheia. O que sobra é a área segura do aparelho: o indicador de início de
     um iPhone sem a barra do Safari, que nenhum ponto do projeto lia
     (`formas.md` §R21 · a fabricação, 0.3). A régua prende as duas metades:
     a estreita reserva só a safe-area, e nenhum rem voltou por engano. */
  t("no telefone, a reserva é só a área segura do aparelho", /\.tv-espaco-abas \{ padding-bottom: env\(safe-area-inset-bottom, 0px\); \}/.test(CSS));
  t("e nenhuma reserva em rem sobrou para a barra que saiu", !/\.tv-espaco-abas \{ padding-bottom: [\d.]+rem; \}/.test(CSS));
  /* a régua caça a DECLARAÇÃO, e não a palavra: a caixa de comentário acima
     dela conta a história do defeito e cita o nome da propriedade */
  t("e a classe não mexe mais na direita", !/padding-rights*:/.test(CSS));
  /* NO MONITOR a reserva é ZERO — e isso é a lei ficando mais forte, não
     mais fraca. v9.170 (mesa-jogo-v2): o trilho saiu de `fixed right-0` e
     virou coluna DENTRO do fluxo, ao lado do painel da narrativa. Espaço
     reservado para uma barra que agora ocupa o próprio lugar seria um
     buraco de 68px no monitor — e era esse `fixed` que fazia o trilho
     ficar POR CIMA do painel lateral aberto, que também é `right-0`. */
  /* R21: a folha ganhou OUTRO `@media (min-width: 768px)` antes deste (a entrada
     do alforje na coluna larga), e a régua lia o primeiro que aparecia — que
     deixou de ser o da reserva. Agora ela procura o bloco que fala de
     `.tv-espaco-abas`: a asserção nunca quis dizer "o primeiro @media", quis
     dizer "o monitor desta reserva". */
  const iReserva = CSS.indexOf(".tv-espaco-abas { padding-bottom: env(");
  const iMd = CSS.indexOf("@media (min-width: 768px)", iReserva);
  const md = CSS.slice(iMd, iMd + 260);
  t("no monitor, a reserva de baixo some (o trilho está no fluxo)", /\.tv-espaco-abas \{ padding-bottom: 0; \}/.test(md));
  t("e nada embaixo", /padding-bottom: 0/.test(md));
  t("a margem acompanha", /margin-right: 0/.test(md));
  /* o comentário guarda a armadilha que derrubou o build: este bloco mora
     DENTRO da template literal do CSS, e uma crase ali fecha a literal */
  t("o comentário avisa da crase", /Sem crase neste comentário de propósito/.test(CSS));
}

sec("3. O TRILHO SÓ EXISTE NA COLUNA LARGA — no telefone, a fita é a do alforje");
{
  const nav = APP.slice(APP.indexOf('aria-label="Painéis"') - 700, APP.indexOf('aria-label="Painéis"') + 60);
  /* R21: O QUE ESTA SECÇÃO MEDIA DEIXOU DE EXISTIR NO TELEFONE, e ela mede
     agora o que o substituiu. Cobrava a barra inferior (`inset-x-0 bottom-0`,
     `flex-row`, `justify-around`, o botão `flex-1`) porque o polegar alcança
     a base e não a lateral — e essa razão continua de pé, só que a base é
     agora a fita DO ALFORJE, que só existe aberta. O censo do `jogo` (21
     turnos a 375) contou 7 aberturas de painel, todas pela fita, contra 76
     px de prosa em TODOS os turnos. Deixar as classes da barra no trilho
     para esta régua ficar verde seria escrever para uma tela onde ele não
     aparece. */
  t("no telefone o trilho não existe", /className="hidden md:flex/.test(nav));
  t("e nenhuma barra fixa sobrou por cima do convés", !/fixed/.test(nav));
  t("a fita do telefone é a do alforje, no pé e só no telefone", /role="tablist"/.test(ALF) && /className=\{?"md:hidden shrink-0 flex/.test(ALF));
  /* R21: a classe da fita passou a ser uma expressão (ganha `tv-fita-seis` com
     seis abas); o que a régua prende é que ela SÓ existe no telefone. */
  /* v9.170: no monitor o trilho está no fluxo, em coluna — o destino é o
     mesmo, e quem o põe lá é o layout. R21 não lhe mexeu. */
  t("no monitor é coluna em fluxo", /md:flex shrink-0 flex-col/.test(nav));
  /* barra que flutua sobre o conteúdo sem fundo deixa o texto passar por
     baixo e vira ilegível nos dois */
  t("a barra tem chão próprio", /borderTop: `1px solid \$\{T\.line\}`/.test(APP));
  /* v9.170: o botão é um quadrado inteiro de 72. R21: sem o `md:`, porque
     o trilho só existe a partir do monitor. */
  t("e o botão é quadrado no monitor", /w-\[72px\] h-\[72px\]/.test(APP));
}

sec("4. O PAINEL VIRA FOLHA CHEIA NO TELEFONE");
{
  /* 88vw num telefone deixa uma faixa inútil do lado e encolhe tudo que
     está dentro; a folha cheia é o padrão de telefone há dez anos */
  /* R21: a folha mudou de casa (o `Alforje`) e de forma no telefone — já
     não cobre o ecrã de cima a baixo: começa por baixo da cinta e da faixa
     do fundo, a toda a largura. A exigência de largura e de respiro é a
     mesma; muda só onde ela se lê. */
  t("largura inteira no telefone", /fixed inset-x-0 bottom-0/.test(ALF) && /md:w-80 md:max-w-\[88vw\]/.test(ALF));
  t("e menos respiro em volta, onde ele é caro", /px-4 pb-4 md:px-5 md:pb-5/.test(ALF));
}

sec("5. AS TELAS DE JOGO CARREGAM A CLASSE");
{
  /* se a classe existe e ninguém a usa, a reserva simplesmente sumiu — e
     o trilho do monitor volta a cobrir conteúdo */
  const quantas = (APP.match(/tv-espaco-abas/g) || []).length;
  const margens = (APP.match(/tv-margem-abas/g) || []).length;
  /* v9.197: A RESERVA VALE UMA VEZ, E NÃO DEZ. Ela estava em dez elementos
     ANINHADOS — o painel que rola, a fileira do herói, a dos modos, a caixa
     de escrita —, e cada um somava 76px de reserva sobre o de fora. Era esse
     o buraco vertical que sobrava no telefone.

     Agora quem reserva é o CONVÉS: o bloco que de fato encosta na barra de
     abas. E ele é irmão do painel que rola, e não filho — antes a barra de
     vida, os modos e a caixa saíam da tela junto com a prosa numa cena
     comprida, e escrever exigia rolar até o fim. */
  t(`a reserva é usada em ${quantas} lugar(es)`, quantas >= 1 && quantas <= 3);
  /* R13: o piso desce de 4 para 3, e o motivo é que um painel mudou de ponta
     da tela. O menu de `Esperar` era o quarto elemento com a margem; ele
     passou a viver em `OPainelDoTempo`, que abre POR BAIXO DA CINTA, no topo
     — e ali não há barra de abas para evitar. A asserção guarda que todo
     painel que flutua SOBRE o trilho de abas reserve o espaço dele; um painel
     que deixou de flutuar sobre o trilho sai da conta sem afrouxar nada. */
  t(`e a margem em ${margens}`, margens >= 3);
  t("quem reserva é o convés", /className="tv-espaco-abas shrink-0 flex flex-col"/.test(APP));
  /* R15 — A ÂNCORA DEIXA DE SER A LISTA INTEIRA DE CLASSES, e o motivo fica
     escrito: esta asserção nunca quis dizer "as classes são exatamente
     estas". Ela quer dizer que a área que rola é `flex-1 overflow-y-auto` e
     não reserva altura para o trilho de abas — o convés é que reserva. Ao
     ganhar `tv-esbate-topo` a região continuou a cumprir isso e a asserção
     ficou vermelha por uma classe a mais, que é a asserção a medir a coisa
     errada. Agora ela tolera classes entre `tv-scroll` e `flex-1`, e o que
     ela prende é o que ela sempre quis prender. */
  t("a área que rola NÃO reserva mais", /className="tv-scroll[^"]*flex-1 overflow-y-auto overflow-x-hidden/.test(APP));
  t("e a linha de escrita também não", /className="px-4 md:px-8 shrink-0" style=\{\{ paddingBottom:/.test(APP));
  /* O CONVÉS FICA: é o que separa "o jogo na mão" de "o jogo que foge" */
  /* mesma correção de âncora (R15): o que importa aqui é a ORDEM dos dois
     blocos, não de que classes a região que rola é feita. `flex-1
     overflow-y-auto overflow-x-hidden` é único no `App.jsx` e não se move
     quando a região ganha uma classe nova. */
  t("o convés é irmão do painel, e não filho", APP.indexOf('className="tv-espaco-abas shrink-0 flex flex-col"') > APP.indexOf('flex-1 overflow-y-auto overflow-x-hidden'));
}

console.log(`\ncelular v9.156: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
