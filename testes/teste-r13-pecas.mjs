/* teste-r13-pecas.mjs — as peças da cinta e o rosto da cena (R13)

   V5a (25/09/2026): O ROSTO DA CENA SAIU DA TELA, e com ele as seções que
   provavam a gravura (1, 2, 3 e 6b, e as linhas das bandas, da tinta e da
   degradação dela). Cada uma deixou no sítio o motivo de ter saído — a lei
   da casa. O que esta suíte continua guardando é o que tinha outro leitor:
   a ampulheta e o selo de prazo, a luz da hora (agora em `hora-e-prazo.js`),
   o esbatimento, a conta da cinta e o contrato das peças. O cabeçalho que
   ficou no lugar da gravura prova-se em `teste-v5a-cabecalho.mjs`.

   O QUE ESTA SUÍTE GUARDA, e não é a tela: é a CONTA por baixo dela. A
   lei da casa parte a peça em duas — `gravura-da-cena.js` decide (e
   prova-se aqui, em Node) e os `.jsx` pintam (e provam-se no olho). O
   que se pode afirmar sem montar React afirma-se aqui.

   E A PRIMEIRA COISA QUE ELA PROVA É A PRIMEIRA LEI DA CASA:
   determinismo por semente. Mesma semente, mesma cripta, em qualquer
   máquina — uma imagem que muda de máquina para máquina não é uma
   gravura, é ruído com boa aparência.

   A SEGUNDA É A DÍVIDA QUE `formas.md` DECLAROU E ESTA ETAPA PAGOU:
   *a hachura do protótipo é regular, e um buril não é.* Há um dente só
   para isso — se alguém "simplificar" um destes laços para um passo
   constante, a gravura volta a ler-se como trama de máquina e a suíte
   diz porquê. */
import { readFileSync } from "node:fs";
import {
  AMPULHETA, areiaDaAmpulheta,
  APERTOS, apertoDoPrazo, palavraDoPrazo, CONTAS,
  LUZES, HORARIO_DA_LUZ, luzDaHora,
} from "../src/hora-e-prazo.js";
import { CINTA, T, TIPOS, ALVOS, ESBATIMENTO, FOLHA, SOLEIRA } from "../src/estilo.js";
/* V5a: `LARGURA_DE_REFERENCIA` era um export de `gravura-da-cena.js` e morreu com
   a gravura (o único leitor de código era `rosto-da-cena.jsx`). A conta da cinta
   (seção 7) continua precisando do telefone de referência — o 375 × 812 em que
   o orçamento de R13 foi medido (`mente/r13-mesa.md`) —, e é só esta suíte que o
   lê agora. Fica aqui, com o nome de sempre, para as asserções não mudarem. */
const LARGURA_DE_REFERENCIA = 375;

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const UI = readFileSync("../src/ui.jsx", "utf8");

/* ============================================================ */
/* 1 · 2 · 3 — SAÍRAM EM V5a, e o motivo fica escrito no lugar delas.
   Provavam a CONTA da xilogravura: o determinismo por semente da paisagem
   (mesma semente, mesma cripta), a hachura irregular do buril (o tremor
   mínimo de cada gesto) e os 30 biomas com gramática e hachura. A pessoa
   tirou a gravura da tela em 25/09 (*"deixar exatamente igual à imagem do
   Figma"*), `rosto-da-cena.jsx` e o motor em `gravura-da-cena.js` saíram
   inteiros, e uma asserção sobre uma conta que já não existe seria verde
   por vazio — pior do que nenhuma. O determinismo por semente continua a
   ser lei e continua provado onde a semente ainda desenha (`teste-rosto`,
   `teste-semente` e as suítes do motor). */

/* ============================================================ */
sec("4. a areia é uma função, não um desenho");
{
  const alturaDe = (f) => {
    const m = areiaDaAmpulheta(f).match(/L 6 ([\d.]+) L/);
    return AMPULHETA.base - Number(m[1]);
  };
  t("cheia dá a altura máxima", Math.abs(alturaDe(1) - AMPULHETA.alturaMax) < 0.01);
  t("a meio dá metade", Math.abs(alturaDe(0.5) - AMPULHETA.alturaMax / 2) < 0.01);

  /* O PISO DE 0,08 NÃO É ARREDONDAMENTO: existe para que "esta noite"
     ainda TENHA areia. Um triângulo de altura zero lê-se como um erro de
     desenho, não como urgência. */
  t("e o piso segura o zero: `esta noite` ainda tem areia",
    alturaDe(0) > 0 && Math.abs(alturaDe(0) - AMPULHETA.alturaMax * AMPULHETA.piso) < 0.01);
  t("o piso vale para o negativo e para o lixo", alturaDe(-5) === alturaDe(0) && alturaDe("abc") === alturaDe(1));
  t("e o teto segura o excesso", alturaDe(9) === alturaDe(1));

  /* CHEIA, A AREIA ENCHE O BULBO DE LADO A LADO: h = 5, meia-base
     0,68 × 5 = 3,4, e o triângulo vai de 2,6 a 9,4 — que é exactamente a
     boca da ampulheta a y = 11. É isso que a faz ler como MEDIDOR e não
     como enfeite. (A primeira versão desta asserção escrevia 4,3, que é
     0,34 × h: o erro estava aqui, não na peça.) */
  t("a base é 0,68 × a altura, de cada lado",
    /^M 6 11 L 2\.6 11 L 6 6 L 9\.4 11 Z$/.test(areiaDaAmpulheta(1)), areiaDaAmpulheta(1));
}

/* ============================================================ */
sec("5. o selo de prazo conta ao contrário, e nunca 1/4");
{
  t("3 ou mais noites: folgado", apertoDoPrazo(3).id === "folgado" && apertoDoPrazo(9).id === "folgado");
  t("2 e 1: a apertar", apertoDoPrazo(2).id === "apertar" && apertoDoPrazo(1).id === "apertar");
  t("0: esta noite, e é a única que ENCHE", apertoDoPrazo(0).id === "estaNoite" && apertoDoPrazo(0).cheio === true);
  t("e só ela enche — a distinção é de FORMA, não de cor",
    APERTOS.filter((a) => a.cheio).length === 1);
  t("`urgente` força a última noite", apertoDoPrazo(5, true).id === "estaNoite");

  t("a palavra conta o que FALTA", palavraDoPrazo(3) === "3 noites" && palavraDoPrazo(2) === "2 noites");
  t("uma noite fala no singular", palavraDoPrazo(1) === "1 noite");
  t("a última diz `esta noite`, nunca um número", palavraDoPrazo(0) === "esta noite");
  t("e nenhuma palavra do selo escreve uma fracção",
    [0, 1, 2, 3, 9].every((n) => !palavraDoPrazo(n).includes("/")));

  /* R15 — O EIXO `Conta` (Noites · Turnos). A janela de `A oferta` não é
     texto, é ESTE selo — e a petição do correio conta noites de
     calendário enquanto uma oferta de encontro conta turnos. A resposta
     do `desenho` foi um EIXO e não um gémeo: *uma ação, uma forma.* */
  t("a conta em turnos existe, e é tabela e não um `if`",
    !!CONTAS.noites && !!CONTAS.turnos && Object.keys(CONTAS).length === 2);
  t("em turnos a palavra conta o que falta, e o singular fala no singular",
    palavraDoPrazo(4, false, "turnos") === "4 turnos" && palavraDoPrazo(1, false, "turnos") === "1 turno");
  t("e a última unidade tem NOME e não número, nas duas contas",
    palavraDoPrazo(0, false, "turnos") === "este turno" && palavraDoPrazo(0, false, "noites") === "esta noite");
  t("`urgente` força a última em qualquer conta", palavraDoPrazo(9, true, "turnos") === "este turno");
  /* A DEGRADAÇÃO É ESCRITA: uma conta que não existe cai em noites, não
     em `undefined`. Uma contagem mal endereçada ainda é melhor dita na
     unidade que este jogo tem em todo lado do que apagada da tela. */
  t("uma conta desconhecida cai em noites, nunca em `undefined`",
    palavraDoPrazo(3, false, "semanas") === "3 noites" && palavraDoPrazo(3) === "3 noites");
  /* A AREIA É A MESMA GEOMETRIA NAS DUAS, e é ela o canal primário:
     `apertoDoPrazo` não sabe de contas nem precisa de saber. */
  t("a areia não muda com a conta — a geometria é a mesma nas duas",
    apertoDoPrazo(2).areia === apertoDoPrazo(2).areia && apertoDoPrazo(0).cheio === true);
  /* E O SELO NÃO GANHOU UM GÉMEO: há UM `SeloDePrazo` em `ui.jsx`, e a
     oferta instancia-o em vez de desenhar a sua própria contagem. */
  t("não nasceu um segundo selo: `A oferta` instancia o que já existe",
    (UI.match(/export function SeloDePrazo\b/g) || []).length === 1
    && /<SeloDePrazo\b/.test(UI));

  /* A areia é o canal PRIMÁRIO: ela tem de descer com o aperto, senão o
     selo fica a depender da cor — que é a última leitura, nunca a
     primeira. */
  const areias = [3, 2, 0].map((n) => apertoDoPrazo(n).areia);
  t("a areia desce a cada degrau (o canal primário funciona sozinho)",
    areias[0] > areias[1] && areias[1] > areias[2]);

  /* A COR SAI POR NOME DE TOKEN — cor é número, logo é tabela. */
  const semToken = APERTOS.filter((a) => !(a.token in T)).map((a) => a.id);
  t("todo aperto aponta para um token real de T", semToken.length === 0, semToken.join(", "));
}

/* ============================================================ */
sec("6. a hora acende a luz, e as quatro luzes existem");
{
  /* V5a: AS RECEITAS DE COR DAS QUATRO LUZES SAÍRAM (`LUZ_DA_CENA`, em
     `estilo.js`, só a gravura as lia). As asserções sobre elas — a receita
     inteira por luz, a tinta de topo, o astro de `T.ink` a 0,85, o astro
     baixo na madrugada — saíram com a tabela. O que fica é o que ainda tem
     leitor: os NOMES das luzes, que `O TEMPO` desenha e o cabeçalho da
     página escreve, e a fronteira de cada uma. */
  t("as quatro luzes existem, e são quatro nomes distintos",
    LUZES.length === 4 && new Set(LUZES).size === 4);
  t("cada hora do dia acende exactamente uma luz",
    Array.from({ length: 24 }, (_, h) => luzDaHora(h)).every((l) => LUZES.includes(l)));
  t("a noite atravessa a meia-noite", luzDaHora(23) === "noite" && luzDaHora(0) === "noite" && luzDaHora(3) === "noite");
  t("as fronteiras não deixam buraco nem sobreposição",
    HORARIO_DA_LUZ.length === 4 && luzDaHora(4) === "madrugada" && luzDaHora(8) === "dia"
    && luzDaHora(18) === "entardecer" && luzDaHora(21) === "noite");
  t("aceita a hora como texto, que é como a cinta a tem",
    luzDaHora("06:13") === "madrugada" && luzDaHora("19:40") === "entardecer");
  t("e o lixo não dá buraco: cai no dia", luzDaHora(undefined) === "dia" && luzDaHora("nada") === "dia");
}

/* ============================================================ */
/* 6b — SAIU EM V5a. Media os sete pisos de contraste da gravura de linha
   branca nas quatro luzes (a silhueta contra o céu, o talho contra o chão,
   a legenda, a marca da chapa, a textura do céu, o astro). Eram pisos de
   `LUZ_DA_CENA`, e a tabela saiu com a gravura. A lição dela fica, e é
   de toda a casa: *um contraste que ninguém mede é um contraste que ninguém
   tem* — os pares do cabeçalho que ocupou o lugar dela medem-se em
   `teste-v5a-cabecalho.mjs`. */

/* ============================================================ */
sec("6c. o esbatimento do topo (R15) — uma região declarada ilegível");
{
  /* POR QUE ESTA SECÇÃO NÃO MEDE PIXELS: um esbatimento **não é
     decoração, é uma região declarada ILEGÍVEL.** Uma máscara de alfa
     sobre texto não o adoça — apaga-o por graus. Logo a altura dele é o
     seu CUSTO, e o dente é uma DESIGUALDADE e não um número: no dia em
     que alguém subir a altura, a linha fica vermelha e diz porquê. */
  const bandaIlegivel = ESBATIMENTO.alfaAA * ESBATIMENTO.altura;
  const teto = ESBATIMENTO.entrelinhaDaProsa / 2;
  t(`nunca esconde uma linha inteira (${bandaIlegivel.toFixed(2)} < ${teto.toFixed(2)})`,
    bandaIlegivel < teto,
    `a banda ilegível é ${bandaIlegivel.toFixed(2)} px e metade da entrelinha é ${teto.toFixed(2)}`);
  /* A ENTRELINHA NÃO É UM NÚMERO SOLTO: é a régua da prosa que a tela
     já usa (`leading-relaxed` = 1,625). Se `TIPOS.prosa` mudar e esta
     linha não, o teto acima passa a guardar a prosa de ontem. */
  t(`a entrelinha da prosa é TIPOS.prosa × 1,625 (${(TIPOS.prosa * 1.625).toFixed(2)})`,
    Math.abs(ESBATIMENTO.entrelinhaDaProsa - TIPOS.prosa * 1.625) <= 0.05);
  /* E HÁ UM PISO POR BAIXO: abaixo de ~12 px um gradiente deixa de se
     ler como esbatimento e volta a ser uma borda, só que desfocada —
     que é o defeito original com mais um passo. */
  t("e não é tão baixo que volte a ser uma borda desfocada", ESBATIMENTO.altura >= 12);
  /* A RAMPA É ESCALONADA E NÃO LINEAR, pela mesma razão que a barra de
     PV é comprimento: a percepção de luminância não é linear, e uma
     rampa linear lê-se como um degrau no fim. */
  const r = ESBATIMENTO.rampa;
  t("a rampa vai de invisível a inteira, sem andar para trás",
    Array.isArray(r) && r.length >= 3 && r[0][0] === 0 && r[0][1] === 0
    && r[r.length - 1][0] === 1 && r[r.length - 1][1] === 1
    && r.every((p, i) => i === 0 || (p[0] > r[i - 1][0] && p[1] > r[i - 1][1])));
  t("e é escalonada, não linear (um batente foge da recta)",
    r.some(([f, a]) => Math.abs(a - f) > 0.05));

  /* A FOLHA — e o dente que importa é o ÚLTIMO: em `forced-colors` a
     máscara SAI INTEIRA, porque ali o sistema não tem como repor texto
     apagado por graus, e a cabeça já não é uma imagem, é um contorno. */
  t("a folha traz `.tv-esbate-topo`", FOLHA.includes(".tv-esbate-topo"));
  t("a altura da banda sai da tabela, não de um número escrito na folha",
    FOLHA.includes(`${ESBATIMENTO.altura}px`));
  t("e há um bloco `forced-colors` que a apaga",
    /@media \(forced-colors: active\) \{\s*\.tv-esbate-topo \{[^}]*mask-image: none/.test(FOLHA));
  /* NÃO SE CRIA ELEMENTO NENHUM: a máscara vai na PRÓPRIA região que
     rola. Uma camada por cima interceptaria cliques — e isso custaria o
     turno, que é a única coisa que esta casa nunca deixa custar. */
  t("é uma máscara e não uma camada — nada de `pointer-events` a remendar",
    !/\.tv-esbate-topo \{[^}]*pointer-events/.test(FOLHA));
}

/* ============================================================ */
sec("7. a cinta soma o que promete");
{
  /* V5a: as três asserções das BANDAS da gravura (céu, horizonte, chão, e a
     legenda na banda do chão) saíram com `BANDAS`. A conta da cinta, abaixo,
     não dependia delas — só do telefone de referência, que ficou no topo. */

  /* A CATRACA DO ORÇAMENTO (`mente/r13-mesa.md`, §1): uma tabela de
     orçamento que não fecha na largura do ecrã não é um orçamento; é uma
     lista de desejos. Foi por não somar que as duas primeiras versões
     deste orçamento saíram erradas — a do `jogo` e a do `desenho`, com o
     mesmo erro e em separado. */
  const folga = LARGURA_DE_REFERENCIA - 2 * CINTA.enchimento - CINTA.ficha - CINTA.tempo;
  t(`a conta da cinta fecha: 375 − 24 − ${CINTA.ficha} − ${CINTA.tempo} = ${CINTA.folgaMinima}`,
    folga === CINTA.folgaMinima, `deu ${folga}`);

  /* ESTA ASSERÇÃO MUDOU EM 23/09, E O MOTIVO FICA ESCRITO porque a lei da
     casa o manda. Ela dizia `CINTA.folgaMinima >= 67` — e 67 era um número
     ORÇADO pelo `desenho` (ficha 186 + tempo 98), não medido. Com a cinta
     no ar a régua deu **ficha 194 e tempo 145**: o tempo estava 47 px
     optimista, porque o selo mede 76 e não 53 e o `+N` custa outros 20. A
     folga real a 375 px é **12**. Uma catraca que guarda uma estimativa
     como se fosse piso não guarda nada: bastava a medida chegar para ela
     ficar vermelha por ter razão.

     A INTENÇÃO SOBREVIVE INTEIRA — o enchimento tem de ser 12 e não 16 —
     mas a razão é agora MAIOR e mede-se no pior caso em vez do típico:
     com 16 a linha **não cabe** na última noite de um prazo, que é a noite
     em que ela mais importa. `tempoMaximo` é o selo cheio (`esta noite` em
     negrito, 105) e `fichaMinima` é a ficha com os trilhos no mínimo —
     porque quem cede é sempre a ficha: *o comprimento de um trilho é uma
     razão, não uma medida, e um trilho de 40 px diz o que um de 56 diz;
     `esta noite` não encolhe sem mentir.* */
  const comDoze = 2 * CINTA.enchimento + CINTA.fichaMinima + CINTA.tempoMaximo;
  const comDezasseis = 2 * 16 + CINTA.fichaMinima + CINTA.tempoMaximo;
  t(`o pior caso cabe: 24 + ${CINTA.fichaMinima} + ${CINTA.tempoMaximo} = ${comDoze} ≤ 375`,
    comDoze <= LARGURA_DE_REFERENCIA, `deu ${comDoze}`);
  t("e o enchimento é 12 e não 16 — com 16 a última noite transbordaria",
    CINTA.enchimento === 12 && comDezasseis > LARGURA_DE_REFERENCIA,
    `com 16 daria ${comDezasseis}`);
  t("quem cede é a ficha, nunca o prazo: o trilho tem mínimo",
    CINTA.trilhoMinimo < CINTA.trilho && CINTA.fichaMinima < CINTA.ficha);
  t("os dois alvos da cinta medem o piso da casa", CINTA.altura === ALVOS.piso);
  t("e o estado vivo cresce, não encolhe", CINTA.alturaViva > CINTA.altura);
}

/* ============================================================ */
sec("8. o contrato de assinatura das peças (o App chama por estes nomes)");
{
  /* Estas sete linhas são o CONTRATO que o `oficial` escreveu do outro
     lado ao mesmo tempo que estas peças nasceram. Um nome trocado só
     aparece no build — e num arquivo de 21 mil linhas, tarde. */
  const contrato = [
    ["IconeVida", /export function IconeVida\(\{ tamanho = 12, cor \}\)/],
    ["IconeMana", /export function IconeMana\(\{ tamanho = 12, cor \}\)/],
    ["IconeBolsa", /export function IconeBolsa\(\{ tamanho = 12, cor \}\)/],
    ["IconeAmpulheta", /export function IconeAmpulheta\(\{ tamanho = 12, cor, fracao = 1 \}\)/],
    /* A ASSERÇÃO DO SELO MUDOU EM 23/09 (R15), E O MOTIVO FICA ESCRITO,
       que é a lei da casa: ela pedia `({ noites, quantos = 1, urgente =
       false })` e passou a aceitar o quarto campo `conta = "noites"`,
       que é o eixo `Conta` (Noites · Turnos) que `A oferta` precisa para
       a janela. O QUE ELA CONTINUA A GUARDAR É O QUE IMPORTAVA: os três
       primeiros parâmetros, NA MESMA ORDEM E COM OS MESMOS PADRÕES — as
       chamadas vivas da cinta não mudam uma letra, e `conta` tem de ter
       valor por omissão. Um campo novo sem padrão partiria o chamador
       silenciosamente, que é exactamente o que este contrato existe
       para apanhar. */
    /* V4: o selo ganhou o QUINTO campo, `escondidoGrave = false` — a lei do +N
       que herda o pior do que esconde. Os quatro primeiros ficam na mesma ordem
       e com os mesmos padrões: as chamadas vivas não mudam uma letra. */
    ["SeloDePrazo", /export function SeloDePrazo\(\{ noites, quantos = 1, urgente = false, conta = "noites", escondidoGrave = false \}\)/],
    ["SinalDeGuardado", /export function SinalDeGuardado\(\{ visivel \}\)/],
    /* R15 — AS DUAS PEÇAS NOVAS ENTRAM NO MESMO CONTRATO, e entram ANTES
       de o `App.jsx` as chamar, porque foi contra estas assinaturas que
       o `oficial` escreveu as chamadas dele no mesmo turno. `janela` é o
       QUARTO campo de `A oferta` e é OPCIONAL: sem ela a peça é a de
       ontem, byte a byte. */
    ["Oferta", /export function Oferta\(\{ verbo, preco, retorno, quem, onde, tom = "convite", estado = "repouso", chegada = "assentada", janela, aoClicar \}\)/],
    ["Dobra", /export function Dobra\(\{ quantos = 0, singular = "oferta", plural = "ofertas", estado = "dobrada", aoAlternar \}\)/],
  ];
  /* R15 — O TETO DE CAMPOS É LEI, E É VARRÍVEL. `SOLEIRA.camposDaOferta`
     é 4 — verbo · preço · retorno · janela — e **o quinto campo é
     defeito**: faz a oferta deixar de se ler de relance e passar a ser
     um formulário, que é o *point-and-click* que a medida dos 990 ms
     existe para apanhar. `quem`/`onde` NÃO contam: `formas.md` nunca os
     marcou como campo obrigatório, e eles cedem o lugar por `truncate`.
     O dente conta o que a peça ESCREVE na tela. */
  const campos = ["{verbo}", "{preco}", "{retorno}", "<SeloDePrazo"];
  const corpoDaOferta = UI.slice(UI.indexOf("export function Oferta"), UI.indexOf("export function Dobra"));
  t(`a oferta escreve os ${SOLEIRA.camposDaOferta} campos da tabela, e nem um a mais`,
    SOLEIRA.camposDaOferta === 4 && campos.every((c) => corpoDaOferta.includes(c)),
    "faltam: " + campos.filter((c) => !corpoDaOferta.includes(c)).join(", "));
  for (const [nome, rx] of contrato) t(`ui.jsx exporta \`${nome}\` com a assinatura combinada`, rx.test(UI));
  /* V5a: a asserção dizia que `RostoDaCena` chegava ao App por ui.jsx, com a
     assinatura combinada. A peça saiu da tela e do código; o que se guarda
     agora é que não volta por esta porta — o topo do papel é
     `CabecalhoDaPagina`, e o contrato dele está em `teste-v5a-cabecalho.mjs`. */
  t("e `RostoDaCena` já não chega ao App por ui.jsx (V5a)",
    !/export \{ RostoDaCena \}/.test(UI) && !/rosto-da-cena/.test(UI.replace(/\/\*[\s\S]*?\*\//g, "")));

  /* A MOCHILA SOBREVIVEU AO RENOMEAR. `formas.md` dá o nome
     `IconeBolsa` à MOEDA de 12×12; o glifo de 24×24 que tinha esse nome
     é uma mochila, e apagá-lo teria tirado a tela à aba do inventário
     sem uma linha de aviso. */
  t("e a mochila de 24×24 continua viva, com o nome que sempre foi o dela",
    /export function IconeMochila\(\{ tamanho = 24/.test(UI));
}

/* ============================================================ */
sec("9. as leis da casa, medidas no texto das peças novas");
{
  const semComentario = (x) => x.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
  const RX_COR = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])|\b(?:rgb|rgba|hsl|hsla)\(/g;

  /* COR É NÚMERO, LOGO É TABELA. V5a: o rosto da cena (a xilogravura, onde
     isto mais se arriscava) saiu; a conta que sobrou chama-se `hora-e-prazo.js`
     e continua sem um único hex. */
  for (const [nome, txt] of [["hora-e-prazo.js", readFileSync("../src/hora-e-prazo.js", "utf8")]]) {
    const achados = semComentario(txt).match(RX_COR) || [];
    t(`\`${nome}\` não tem um único literal de cor`, achados.length === 0, achados.join(" "));
  }

  /* V5a: «a tinta da gravura sai de LUZ_DA_CENA» saiu com as duas. */

  /* NADA DESCE DE 12: as peças escrevem a letra por `TIPOS`, nunca por
     um número solto. */
  const letras = (semComentario(UI).match(/fontSize:\s*(\d+)/g) || []);
  t("nenhuma peça nova escreve um tamanho de letra à mão", letras.length === 0, letras.join(" "));
  /* V5a: «as duas que escrevem letra» eram ui.jsx e o rosto da cena; fica uma.
     E «Talhos e Legenda FORA do render» saiu com as duas componentes (a lei
     que a asserção guardava continua de pé em `check-escopo`). */
  t("e a que escreve letra pede-a a TIPOS", TIPOS.maquina >= TIPOS.piso && /TIPOS\.maquina/.test(UI));

  /* A DEGRADAÇÃO NÃO É OPCIONAL, e está escrita em formas.md. */
  /* A FOLHA LÊ-SE SEM COMENTÁRIOS, e a razão é a mesma que
     `check-formas.mjs` escreve para a máscara dele: a caixa que explica
     por que NÃO se declara `forced-color-adjust: none` contém a própria
     frase — sem a máscara, esta catraca reprovava a documentação que
     concorda com ela. */
  const FOLHA = semComentario(readFileSync("../src/estilo.js", "utf8"));
  t("a varredura do guardado tem saída no prefers-reduced-motion",
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.tv-guardado-varre/.test(FOLHA));
  t("e a saída NÃO é `none` sozinho — pousa no fio cheio",
    /\.tv-guardado-varre \{ animation: none; transform: scaleX\(1\); opacity: 1; \}/.test(FOLHA));
  /* V5a: a degradação da gravura em forced-colors saiu com ela; a metade que
     é lei de toda a folha — nunca `forced-color-adjust: none` — fica. */
  t("a folha nunca declara forced-color-adjust: none", !/forced-color-adjust:\s*none/.test(FOLHA));
  /* O LIMIAR É A CONTA DA FOLGA, e a suíte guarda a CONTA e não o
     número. `CINTA.rotuloDoGuardado` é uma MEDIDA — 74 px, lida no
     navegador com a fonte carregada e por `scrollWidth`; a conta à mão
     dava 72 e enganava-se por dois — e o limiar é a largura em que a
     folga finalmente a alcança. Escrito assim, o dia em que a cinta
     mudar de repartição é o dia em que esta linha fica vermelha, que é o
     que se quer: nesse dia o rótulo passa a caber (ou a não caber)
     noutra largura.

     E A ASSERÇÃO SEGUINTE DIZ O QUE NÃO ESTÁ RESOLVIDO, em vez de o
     arredondar: 74 > 67, logo aos 375 px do telefone de referência o
     rótulo NÃO aparece. Não é defeito desta peça — é uma conta de
     `formas.md` que não fecha, e a mesa é que a fecha. */
  const limiar = Number((FOLHA.match(/@media \(max-width: (\d+)px\)[\s\S]{0,120}?\.tv-guardado-rotulo \{ display: none; \}/) || [])[1]);
  t(`o limiar do rótulo é a conta da folga (limiar ${limiar}, o rótulo pede ${CINTA.rotuloDoGuardado} px)`,
    limiar === 2 * CINTA.enchimento + CINTA.ficha + CINTA.tempo + CINTA.rotuloDoGuardado - 1,
    "o limiar não é a conta da folga: refaça-o em vez de o afinar a olho");
  t("e a medida DIZ, em vez de esconder, que o rótulo não cabe na folga de 375",
    CINTA.rotuloDoGuardado > CINTA.folgaMinima);
  t("mas a camada que fala nunca cai: aria-live fora do rótulo",
    /className="sr-only" aria-live="polite"/.test(UI));
  /* V5a: «a faixa não anima» saiu com a faixa; o cabeçalho que a substitui
     também não anima, e é `teste-v5a-cabecalho.mjs` que o guarda. */
}

console.log(`\nR13 · as peças: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
