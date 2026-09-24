/* O BLOCO DO HERÓI (v9.160)

   PV e PM eram duas barrinhas anônimas ao lado da data, como se a vida
   do herói e o relógio fossem informação do mesmo peso. Agora moram
   coladas no retrato — que já reage sozinho, porque a xilogravura muda
   a cara com o estado — e o bloco inteiro SENTE: clarão quando a vida
   cai, pulso vermelho na agonia.

   O QUE ESTA SUÍTE PROTEGE:

   1. O CLARÃO ESCUTA A MUDANÇA, não um evento. A vida cai por dez
      caminhos — golpe, veneno, marcha forçada, maldição — e um efeito
      sobre `personagem.vida` pega todos de uma vez. No dia em que
      alguém trocar isso por "avisar no golpe", os outros nove caminhos
      param de acender o bloco, um por um, sem ninguém notar.
   2. UM RETRATO DO HERÓI POR TELA. O bloco assumiu o atalho da ficha e
      o retrato do cabeçalho saiu — dois retratos da mesma pessoa na
      mesma tela eram duas verdades visuais. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const APP = readFileSync(S + "App.jsx", "utf8");
/* v9.244: a folha mudou de casa. O CSS saiu de `constantes.js` (onde
   eram 156 linhas de estilo embaixo das regras de jogo) e foi para
   `estilo.js`. As assercoes abaixo nao mudaram de exigencia — mudou so
   ONDE elas vao procurar. */
const CSS = readFileSync(S + "estilo.js", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. O CLARÃO ESCUTA A MUDANÇA DA VIDA");
{
  t("a última vida vista fica num ref", /const vidaVistaRef = useRef\(null\);/.test(APP));
  t("e o efeito compara com a de agora", /if \(antes != null && v != null && v < antes\)/.test(APP));
  t("o clarão morre sozinho", /setTimeout\(\(\) => setFeridaRecente\(false\), 750\)/.test(APP));
  t("e o timeout morre com o efeito", /return \(\) => clearTimeout\(tid\);/.test(APP));
  t("escutando a vida, não um evento", /\}, \[personagem && personagem\.vida\]\);/.test(APP));
}

sec("2. O BLOCO SENTE — as três caras dele");
{
  /* normal, clarão de dano, pulso de agonia — e o clarão ganha do pulso,
     porque o golpe é agora e a agonia continua lá depois */
  /* R13: o bloco MUDOU DE CASA e não de natureza. Os 334 px de moldura da
     tela principal viraram 48 (`A cinta`), e o bloco do herói passou a ser a
     metade esquerda dela. As três caras vieram inteiras — o que mudou é onde
     a régua as procura e como a borda se escreve: numa cinta de 48 px a
     moldura permanente é `transparent` e só aparece quando há o que dizer,
     porque uma borda de `line` à volta do alvo seria a moldura a voltar por
     outra porta. A asserção continua a guardar a MESMA coisa: o clarão ganha
     do pulso, e a borda acompanha os dois. */
  t("o clarão ganha da agonia", /feridaRecente \? "tv-dano" : grave \? "tv-agonia" : ""/.test(APP));
  t("a borda acompanha", /border: "1px solid " \+ \(feridaRecente \|\| grave \? T\.danger : "transparent"\)/.test(APP));
  t("agonia é um terço da vida", /personagem\.vida \/ personagem\.vidaMax <= 1 \/ 3/.test(APP));
  /* as animações moram no CSS da casa, e o clarão não repete */
  t("o clarão existe e não se repete", /\.tv-dano \{ animation: tvDano \.7s ease both; \}/.test(CSS));
  t("a agonia pulsa sem parar", /\.tv-agonia \{ animation: tvAgonia 1\.6s ease infinite; \}/.test(CSS));
  /* o retrato muda de cara junto: o estado entra pelo mesmo estadoDe */
  /* R13: a âncora passa a ser `function ACinta`. `O BLOCO DO HERÓI` era o
     comentário do bloco da barra de estado, e essa barra deixou de existir —
     uma régua ancorada num comentário que morreu procuraria no arquivo
     inteiro e daria tudo por verdadeiro. */
  /* R21: a janela de 4200 caracteres deixou de chegar à barra de vida — a
     porta ganhou o nome que muda com a marca e o retrato ganhou a marca por
     cima, com os comentários que as explicam. Em vez de alargar um número
     a olho, a janela passa a ser a função inteira: vai até à função
     seguinte do módulo, e cresce com ela. */
  const iCinta = APP.indexOf("function ACinta(");
  const bloco = APP.slice(iCinta, APP.indexOf("\nfunction ", iCinta + 1));
  t("o retrato reage pelo estado", /estado=\{estadoDe\(personagem\.vida, vidaMax\)\}/.test(bloco));
  t("o anel avermelha na agonia", /anel=\{grave \? T\.danger : T\.amber\}/.test(bloco));
  /* v9.170 (mesa-jogo-v2): a barra de vida passou a ser montada por tabela
     — as duas barras nascem do mesmo `map`, e a cor da agonia entra pelo
     campo `cor` de uma delas em vez de estar escrita no JSX. */
  /* R13: a barra deixou de nascer de um `map` de duas (PV e PM juntas numa
     tabela) porque o PM RECOLHEU — em 20 turnos jogados ele decidiu zero
     vezes, e volta sozinho no instante em que o herói tem caderno de magias
     ou gasta o primeiro ponto. Com uma barra só, a cor é prop e não campo de
     objecto. O que a lei guarda não mudou: **o comprimento é o canal
     primário e a cor é o segundo** — `amber` × `danger` mede 1,26:1 em visão
     normal e 1,21:1 em deuteranopia, e um PV que só mudasse de cor no grave
     não mudaria de nada para quem não vê vermelho. */
  t("a barra de vida também avermelha", /cor=\{grave \? T\.danger : T\.amber\}/.test(bloco));
  t("e o comprimento dela é o canal primário", /<BarraDeRecurso atual=\{personagem\.vida\} max=\{vidaMax\}/.test(bloco));
  /* R13 APOSENTA ESTA ASSERÇÃO, E COM O NÚMERO À FRENTE. Ela guardava "o
     nível é visível sem abrir nada" — primeiro como losango, depois como
     etiqueta `NIV n` no canto do retrato. O censo de 20 turnos de
     `mente/r6-jogo.md` mediu o nível a decidir **zero** turnos, e a régua
     desta etapa é *fica sempre na tela o que o jogador usa ENQUANTO decide*.
     O nível recolheu para a ficha, onde a régua de XP da `FichaVisual` já o
     mostra — e mostrá-lo aqui era, além do mais, a segunda cópia dele.

     O QUE FICA NO LUGAR não é nada: é a catraca invertida. A etiqueta NÃO
     pode voltar à cinta sem alguém desfazer esta linha e escrever por quê —
     que é exactamente o mesmo ónus que a asserção antiga impunha, virado. */
  t("e o nível RECOLHEU — a cinta não o escreve", !/NIV \{personagem\.nivel\}/.test(bloco));
}

sec("3. UM RETRATO DO HERÓI POR TELA");
{
  /* o bloco é o atalho da ficha; o retrato do cabeçalho saiu */
  const cabecalho = APP.slice(APP.indexOf("<header"), APP.indexOf("</header>"));
  t("o cabeçalho não tem mais retrato", !/<Retrato/.test(cabecalho));
  t("e diz para onde ele foi", /o retrato saiu do cabeçalho \(v9\.160\)/.test(APP));
  /* R13: o alvo da ficha é o da cinta, e passou a ALTERNAR em vez de só
     abrir — é um alvo permanente no topo, e um botão que só abre o que já
     está aberto é um botão morto metade do tempo. E "abrir a ficha" volta a
     ter UMA cara: o bloco do herói e a aba `GESTÃO` eram duas, na tela onde
     se passam 90 % do jogo, e a aba é outra gramática (uma porta para um
     painel) enquanto a cinta é o atalho. */
  /* R21: O ALVO CONTINUA A ALTERNAR E CONTINUA A ABRIR NA FICHA — e abre
     agora O ALFORJE, a folha que no telefone substituiu a fita de abas. A
     asserção mudou de forma por duas razões escritas em `formas.md` §R21 ·
     o jogo, 3: com a marca acesa a porta abre na aba da novidade (a marca
     promete, o toque cumpre); sem ela, `abaDaPorta` devolve `gestao`, que é
     a Ficha de sempre. E o nome deixou de ser fixo: diz o que a porta abre
     ("A ficha — há novo no diário") e que abre um diálogo. */
  t("o alvo da cinta abre a ficha — ou a novidade — e alterna",
    /aoAbrirFicha=\{abrirAPorta\}/.test(APP) && /if \(aba\) \{ setAba\(null\); return; \}\s*if \(janelaReacao\) return;\s*setAba\(abaDaPorta\(marcasDaPorta\)\)/.test(APP));
  /* R21 (regente): entre o "fecha" e o "abre" entrou a guarda do relógio —
     com a janela de reação aberta a porta não abre (nada com relógio fica
     atrás de uma porta, nos dois sentidos). A régua passa a exigir a guarda
     no sítio dela, em vez de a tolerar. */
  t("e diz ao leitor de ecrã o que faz", /aria-label=\{nomeDaPorta\} aria-haspopup="dialog" aria-expanded=\{!!alforjeAberto\}/.test(APP));
  /* dentro de botão, o retrato não pode abrir carta — mesmo contrato do
     antigo atalho */
  /* v9.170: o retrato cresceu de 34 para 44 no redesenho. O que a lei
     protege é o `semCarta` — dentro de um botão, abrir a carta de tarô
     seria um clique dentro de outro. */
  /* R13: o retrato desceu de 44 para 32 — é a medida da cinta, e sai da
     tabela (`CINTA_DESENHA.rosto`), não de um literal. O que a lei protege
     continua a ser o `semCarta`: dentro de um botão, abrir a carta de tarô
     seria um clique dentro de outro. */
  t("sem carta dentro do botão", /ente=\{personagem\} semCarta tamanho=\{CINTA_DESENHA\.rosto\}/.test(APP));
  /* as barrinhas anônimas de PV/PM DO HERÓI saíram — o bloco é a única
     casa delas. As BarraMini que ficaram são de outras pessoas: o
     companheiro no cartão dele e o inimigo no combate. */
  t("a BarraMini de PV do herói saiu", !/<BarraMini rotulo="PV" atual=\{personagem\.vida\}/.test(APP));
  t("a de PM também", !/<BarraMini rotulo="PM" atual=\{personagem\.mana\}/.test(APP));
  t("e o NV solto virou o losango", !/>NV \{personagem\.nivel\}</.test(APP));
}

console.log(`\nherói na tela v9.160: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
