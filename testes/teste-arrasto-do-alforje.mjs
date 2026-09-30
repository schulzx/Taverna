/* teste-arrasto-do-alforje.mjs — "um toque nunca é um arrasto" (R21k, 29/09/2026)

   A queixa, da pessoa, no telefone: "ao abrir a ficha, a tela fica toda
   bugada... quando tento clicar nas abas a tela desce e sobe sozinha...
   às vezes em algum toque em algum botão da ficha a tela começa a descer
   sozinha como se tivesse fechando e volta."

   A CAUSA, medida ao vivo antes deste conserto (PointerEvents sintéticos,
   pointerType "touch", no navegador): tocar qualquer sub-aba da Gestão
   (Ficha, Grupo, Pessoas, Mercado, Mural) — que moram no TOPO do conteúdo,
   onde o rolamento já está a zero — reiniciava a animação de entrada do
   alforje (`tvAlforjeSobe`) do zero, a cada toque, sem exceção. A raiz:
   `aoPressionarConteudo` começava um arrasto em QUALQUER `pointerdown` com
   `scrollTop <= 0`, sem limiar, sem direção e sem excluir o que é tocável.

   Esta suíte NÃO renderiza React (a casa não tem harness para isso); ela lê
   `painel-alforje.jsx` e `estilo.js` como texto e prende, por âncora, que a
   construção agora É a lei escrita em `mente/formas.md` §"R21k · o gesto de
   descer tinha de ser pedido, e não suposto": o pointerdown só arma um
   candidato, o arrasto só nasce num pointermove que cruze o limiar para
   baixo com o vertical a dominar, nunca a partir de um elemento tocável, e a
   entrada não volta a correr por causa de um arrasto. */
import { readFileSync } from "node:fs";
import { ALFORJE, VEU } from "../src/estilo.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const ALF = readFileSync("../src/painel-alforje.jsx", "utf8");
const EST = readFileSync("../src/estilo.js", "utf8");
const trecho = (txt, ini, fim) => { const i = txt.indexOf(ini); if (i < 0) return ""; const j = txt.indexOf(fim, i + ini.length); return j < 0 ? txt.slice(i) : txt.slice(i, j); };

/* ============================================================ */
sec("1. o limiar é tabela, e é o touch slop do Android — citado");
{
  t("ALFORJE.limiarDoArrasto existe e vale 8", ALFORJE.limiarDoArrasto === 8);
  t("e a fonte está citada no comentário (AOSP / touch slop)", /touch slop|config_viewConfigurationTouchSlop|AOSP/.test(EST));
  t("nenhum '8' novo escrito à mão no lugar da tabela, dentro do gesto", !/dy\s*[<>]=?\s*8\b/.test(ALF));
}

/* ============================================================ */
sec("2. o pointerdown só ARMA — nunca chama setArrastando direto");
{
  const armar = trecho(ALF, "const armarCandidato = ", "const aoPressionarConteudo");
  t("armarCandidato só grava x/y num ref, sem setState", /candidatoRef\.current = \{/.test(armar) && !/setArrastando/.test(armar));
  const pega = trecho(ALF, "const aoPressionarPega = ", "const aoPressionarConteudo");
  t("a pega arma um candidato, não começa o arrasto", /armarCandidato\(/.test(pega) && !/setArrastando\(true\)/.test(pega));
  const conteudo = trecho(ALF, "const aoPressionarConteudo = ", "NAVEGAÇÃO POR SETAS");
  t("o conteúdo idem: arma, não começa", /armarCandidato\(/.test(conteudo) && !/setArrastando\(true\)/.test(conteudo));
  t("e o conteúdo só arma com o rolamento no topo", /scrollTop <= 0/.test(conteudo));
}

/* ============================================================ */
sec("3. nunca a partir de um elemento tocável");
{
  t("existe um seletor de tocáveis", /SELETOR_TOCAVEL\s*=\s*'button, a, input, select, textarea, label, summary,/.test(ALF));
  t("e o pointerdown do conteúdo o consulta antes de armar", /e\.target\.closest\(SELETOR_TOCAVEL\)/.test(ALF));
  /* a ordem importa: a exclusão de tocável vem ANTES do armar, senão o toque
     no botão já teria armado um candidato antes de a régua correr */
  const conteudo = trecho(ALF, "const aoPressionarConteudo = ", "NAVEGAÇÃO POR SETAS");
  const iTocavel = conteudo.indexOf("SELETOR_TOCAVEL");
  const iArmar = conteudo.indexOf("armarCandidato(");
  t("a régua do tocável corre antes de armar", iTocavel >= 0 && iArmar > iTocavel);
}

/* ============================================================ */
sec("4. o arrasto só nasce no pointermove, além do limiar, pra baixo, vertical > horizontal");
{
  const mover = trecho(ALF, "const mover = (e) => {", "const voltarOuFechar");
  t("compara dy com ALFORJE.limiarDoArrasto", /dy < ALFORJE\.limiarDoArrasto/.test(mover));
  t("exige descida (dy > 0), não subida nem lateral", /dy <= 0/.test(mover));
  t("exige o vertical a dominar o horizontal", /Math\.abs\(dy\)\s*<=\s*Math\.abs\(dx\)/.test(mover));
  t("só então seta arrastando", /arrastandoRef\.current = true;\s*\n\s*setArrastando\(true\)/.test(mover));
}

/* ============================================================ */
sec("5. soltar decide por um ref, não por um updater com efeito colateral");
{
  t("nenhum aoFechar dentro de um setDeslocamento((d) => ...)", !/setDeslocamento\(\(d\) => \{[\s\S]*?aoFechar/.test(ALF));
  const voltar = trecho(ALF, "const voltarOuFechar = ", "const soltar = () =>");
  t("soltar lê deslocamentoRef.current, não um argumento de updater", /deslocamentoRef\.current/.test(voltar));
  t("acima de 2×ALVOS.piso fecha", /d > 2 \* ALVOS\.piso/.test(voltar));
  t("abaixo, volta ao sítio (soltando), nunca fecha", /setSoltando\(true\)/.test(voltar));
}

/* ============================================================ */
sec("6. pointercancel nunca fecha — só desarma ou volta ao sítio");
{
  t("cancelar chama voltarOuFechar(false)", /const cancelar = \(\) => voltarOuFechar\(false\)/.test(ALF));
  t("soltar chama voltarOuFechar(true)", /const soltar = \(\) => voltarOuFechar\(true\)/.test(ALF));
  const voltar = trecho(ALF, "const voltarOuFechar = ", "const soltar = () =>");
  t("só fecha quando podeFechar for true", /if \(podeFechar && d > 2 \* ALVOS\.piso\)/.test(voltar));
  t("antes de começar (sem candidato armado em arrasto), só desarma — sem setState", /if \(!comecara\) return;/.test(voltar));
}

/* ============================================================ */
sec("7. a entrada corre uma vez — nenhum arrasto a repõe");
{
  t("existe o estado `entrou`", /const \[entrou, setEntrou\] = React\.useState\(false\)/.test(ALF));
  t("a classe de entrada desaparece quando `entrou`", /saindo \? "tv-alforje-desce" : \(entrou \? "" : "tv-alforje-sobe"\)/.test(ALF));
  t("`entrou` reseta no mesmo efeito que decide visível/saindo, ao reabrir", /setVisivel\(true\); setSaindo\(false\); setEntrou\(false\);/.test(ALF));
  t("o sinal principal é onAnimationEnd no próprio diálogo", /onAnimationEnd=\{aoEntradaTerminar\}/.test(ALF) && /if \(e\.target === e\.currentTarget\) setEntrou\(true\)/.test(ALF));
  t("e há uma rede por temporizador, para o dia em que o evento não disparar", /setTimeout\(\(\) => setEntrou\(true\), 300\)/.test(ALF));
}

/* ============================================================ */
sec("8. a volta ao sítio é uma transição de VEU.sai, e não repõe a entrada");
{
  const estilo = trecho(ALF, "const estiloArrasto = arrastando", "return (");
  t("usa VEU.sai na transição de voltar", new RegExp(`transform \\$\\{VEU\\.sai\\}ms ease-out`).test(estilo));
  t("o ramo de soltando não toca em `entrou` nem na classe de entrada", !/soltando[\s\S]{0,80}setEntrou/.test(estilo));
  t("VEU.sai é o mesmo número de sempre (120), nada duplicado", VEU.sai === 120);
}

/* ============================================================ */
sec("9. a pega e o conteúdo não brigam com o gesto nativo do navegador");
{
  t("a pega tem touch-action: none — ela nunca rola", /touchAction: "none"/.test(ALF));
  t("o conteúdo contém o overscroll, sem travar o scroll normal", /overscrollBehavior: "contain"/.test(ALF));
}

console.log(`\narrasto do alforje (R21k): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
