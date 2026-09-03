/* O PALCO DO COMBATE (v9.161)

   O tabuleiro dizia a verdade e não fazia cena: o golpe era um número
   numa linha do sistema mais um anel encolhendo, a virada do chefe era
   uma linha que rolava para cima com o resto, e as fichas eram iniciais
   — "T" para os três trolls.

   Quatro coisas entraram, e nenhuma decide nada:

     ROSTO     a ficha do tabuleiro desenha a MESMA xilogravura da
               bolinha e da carta — Troll 1 e Troll 2 têm caras
               diferentes (a semente sai do nome), e o estado muda a
               expressão ali também
     DANO      o número sobe do quadrado de quem apanhou e some
     FAIXA     a virada do chefe abre uma faixa sobre o campo
     CAMPO     o teto do compacto subiu de 320 para 380 px

   O QUE ESTA SUÍTE PROTEGE é a fronteira: o palco ANUNCIA o que o
   sistema fez, e não faz nada por conta. O dano escuta a mudança da
   vida; a faixa relê a tabela determinística que a virada já usou. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const G = readFileSync(S + "grade-de-batalha.jsx", "utf8");
const APP = readFileSync(S + "App.jsx", "utf8");
const CSS = readFileSync(S + "constantes.js", "utf8");
const M = await import(S + "masmorras.js");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. A FICHA DO TABULEIRO TEM O ROSTO DA CASA");
{
  /* uma pessoa com três caras conforme o painel é o defeito que o rosto
     único (v9.126) veio matar — o tabuleiro era o último lugar sem ele */
  t("o tabuleiro importa o mesmo rosto", /import \{ Rosto \} from "\.\/rosto\.jsx"/.test(G));
  t("com a mesma semente de todo lugar", /sementeDe\(ent\)/.test(G));
  t("e o estado muda a cara ali também", /estadoDe\(pv, pvMax, tipo === "inimigo"\)/.test(G));
  /* o recorte precisa de id estável: derivado de x,y ele trocaria no meio
     do deslizamento e o rosto piscaria a cada passo */
  t("o recorte tem id estável", /const uid = React\.useId\(\);/.test(G));
  t("e o rosto mora dentro dele", /clipPath=\{`url\(#\$\{uid\}\)`\}/.test(G));
  /* o herói na grade só tem nome e lugar; a classe e a vida entram pela
     ficha, e a posição da grade ganha por cima */
  t("a ficha do herói desce do App", /heroiFicha=\{personagem\}/.test(APP));
  t("e chega ao tabuleiro", /<GridDeBatalha combate=\{combate\} grupo=\{grupo\} heroiFicha=\{heroiFicha\}/.test(APP));
}

sec("2. O DANO FLUTUA — e escuta a mudança, não um evento");
{
  /* a vida cai por golpe, veneno e área; um efeito sobre o número pega
     todos os caminhos de uma vez, como o clarão do bloco do herói */
  t("as vidas vistas ficam num mapa", /const vidasRef = React\.useRef\(new Map\(\)\);/.test(G));
  t("a diferença vira número na tela", /const delta = v - antes;/.test(G));
  t("cura sobe verde, dano sobe quente", /delta > 0 \? `\+\$\{delta\}` : `\$\{delta\}`/.test(G) && /delta > 0 \? T\.ok :/.test(G));
  t("o número nasce do quadrado de quem apanhou", /x: ent\.x \+ ladoDe\(ent\) \/ 2/.test(G));
  t("e morre sozinho", /setFlutuantes\(\(f\) => f\.filter\(\(x\) => !chaves\.has\(x\.chave\)\)\)/.test(G));
  t("fora do alcance do toque", /\{flutuantes\.map\(\(f\) => \(/.test(G) && /tv-flutua/.test(G));
  t("a animação mora no CSS da casa", /\.tv-flutua \{ animation: tvFlutua/.test(CSS));
}

sec("3. A FAIXA DO CHEFE ANUNCIA, NÃO DECIDE");
{
  /* a virada já valia (v9.151) e já saía como linha; a faixa é o palco do
     mesmo fato — ela relê a tabela, não sorteia nada */
  t("a faixa lê a mesma tabela da virada", /import \{ fasesDoChefe, viradaPorId \} from "\.\/masmorras\.js"/.test(G));
  t("acordada pelo que o sistema gravou", /\(e\.viradasFeitas \|\| \[\]\)\.length/.test(G));
  t("achando a virada pelo limiar cruzado", /fasesDoChefe\(e\.nome\)\.find\(\(x\) => x\.em === limiar\)/.test(G));
  /* a tabela é determinística de verdade — senão a faixa poderia anunciar
     uma virada diferente da aplicada */
  const a = M.fasesDoChefe("Colosso do Sino Rachado");
  const b = M.fasesDoChefe("Colosso do Sino Rachado");
  t("o mesmo chefe vira sempre igual", JSON.stringify(a) === JSON.stringify(b));
  t("e as duas viradas diferem entre si", a[0].virada !== a[1].virada);
  /* luta retomada de um save no meio da segunda fase não pode reanunciar
     a virada antiga: a primeira leitura só memoriza */
  t("a primeira leitura só memoriza", /if \(viradasRef\.current == null\) \{/.test(G));
  t("a faixa se fecha sozinha", /setTimeout\(\(\) => setFaixa\(null\), 3200\)/.test(G));
  t("e não come toque nenhum", /pointerEvents: "none", zIndex: 5/.test(G));
  t("a respiração dela é do CSS da casa", /\.tv-faixa \{ animation: tvFaixa/.test(CSS));
}

sec("4. O CAMPO CRESCEU SEM PERDER O TETO");
{
  t("o teto novo é 380", /Math\.min\(40, 380 \/ g\.altura\)/.test(G));
  t("e continua sendo um teto", !/Math\.min\(34, 320/.test(G));
  t("a tela cheia não mudou de conta", /min\(94vw, \$\{Math\.round\(\(68 \* g\.largura\) \/ g\.altura\)\}vh\)/.test(G));
  t("a faixa tem chão para se apoiar", /position: "relative", width: "100%"/.test(G));
}

console.log(`\npalco do combate v9.161: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
