/* teste-v5e-chegada.mjs — a resposta chega pelo começo (V5e, 28/09/2026)

   A regra do `jogo` (`mente/v5e-jogo.md`): *quando chega a resposta, a vista vai
   para o fim — mas nunca para além do começo da resposta.* O que esta suíte
   guarda, por ordem:
   1. AS CONTAS, em Node: quem está no fim (¼ da área), onde a vista pousa, e os
      casos medidos pelo `jogo` em V5 (as cinco respostas reais nasciam fora de
      vista com a vista presa ao fim).
   2. AS PEÇAS: a tira da resposta (a espreita do alforje e a seta `novo` são a
      mesma forma) e a seta da leitura com dois estados.
   3. A FIAÇÃO: quem relê não é arrancado; o que chega depois não arrasta; a
      rolagem pendente segura; reduced-motion é seco; nada rouba o foco; abrir o
      jogo usa a mesma regra; nada vai ao save. */
import { readFileSync } from "node:fs";
import { T, ALVOS, ESBATIMENTO, CHEGADA, SETA_DA_LEITURA, ALFORJE } from "../src/estilo.js";
import { estaNoFim, pousoDaVista, comportamentoDaRolagem } from "../src/glifos.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
/* lê sem o CR: a suíte vale igual numa árvore em LF ou em CRLF */
const ler = (x) => readFileSync(x, "utf8").split(String.fromCharCode(13)).join("");
const UI = ler("../src/ui.jsx");
const APP = ler("../src/App.jsx");
const GAVETA = ler("../src/painel-alforje.jsx");
const trecho = (txt, ini, fim) => { const i = txt.indexOf(ini); return i < 0 ? "" : txt.slice(i, txt.indexOf(fim, i + ini.length)); };
const semComentario = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

/* ============================================================ */
sec("1. as contas — em Node");
{
  t("estar no fim é estar a no máximo ¼ da área (a tabela, não 240 px)", CHEGADA.toleranciaDoFim === 0.25);
  t("a 375 (área de 448): 112 px ainda é o fim, 113 já é reler", estaNoFim(112, 448) === true && estaNoFim(113, 448) === false);
  t("240 px — nove linhas no telefone — já é reler (era o fim, e arrancava quem relia)", estaNoFim(240, 504) === false);
  t("sem medida (área zero, lixo), conta-se como fim: é o comportamento de sempre", estaNoFim(0, 0) === true && estaNoFim("x", 448) === true);
  /* os casos do `jogo` (v5-jogo.md §8.1): a resposta de 980 px numa área de 448, a de
     1 533 numa de 504, a 566 numa de 442, a 897 numa de 502 */
  for (const [nome, resp, area] of [["375 · noite", 980, 448], ["375 · dia", 1533, 504], ["1280 · noite", 566, 442], ["1280 · dia", 897, 502]]) {
    const topo = 3000, rolo = topo + resp + 120; /* o que vem depois: as linhas do sistema e a runa do fim */
    const alvo = pousoDaVista({ topoDaResposta: topo, margem: ESBATIMENTO.altura, alturaDoRolo: rolo, alturaDaArea: area });
    t(`${nome}: a resposta que não cabe pousa pelo começo (a runa a ${ESBATIMENTO.altura} px do topo da área)`, alvo === topo - ESBATIMENTO.altura, String(alvo));
  }
  const curta = pousoDaVista({ topoDaResposta: 3000, margem: ESBATIMENTO.altura, alturaDoRolo: 3000 + 200 + 120, alturaDaArea: 448 });
  t("a resposta que cabe fica no fim, como sempre (a mesma conta)", curta === 3000 + 200 + 120 - 448);
  t("e nunca além do começo: o alvo é o menor dos dois", pousoDaVista({ topoDaResposta: 500, margem: 24, alturaDoRolo: 5000, alturaDaArea: 448 }) === 476);
  t("nunca negativo (a resposta no topo do registro)", pousoDaVista({ topoDaResposta: 10, margem: 24, alturaDoRolo: 5000, alturaDaArea: 448 }) === 0);
  t("lixo não mexe na vista: null", pousoDaVista({}) === null && pousoDaVista() === null && pousoDaVista({ topoDaResposta: "x", alturaDoRolo: 1, alturaDaArea: 1 }) === null);
  t("com reduced-motion o salto é seco; sem ele, suave", comportamentoDaRolagem(true) === "auto" && comportamentoDaRolagem(false) === "smooth");
}

/* ============================================================ */
sec("2. as peças");
{
  const TIRA = trecho(UI, "export function TiraDaResposta(", "\n}\n");
  const SETA = trecho(UI, "export function SetaDaLeitura(", "\n}\n");
  t("a tira da resposta é uma peça da biblioteca, com os números da tabela da tira", /const t = ALFORJE\.tira;/.test(TIRA) && /t\.marca\.largura/.test(TIRA) && /padding: `0 \$\{t\.recuo\}px`/.test(TIRA) && ALFORJE.tira.recuo === 10 && ALFORJE.tira.marca.altura === 24);
  t("e a espreita do alforje desenha-a pela peça (uma ação, uma forma)", /<TiraDaResposta texto=\{espreita\.texto\} \/>/.test(GAVETA) && !/width: 3, height: 24/.test(GAVETA));
  t("a seta da leitura tem dois estados, e o `novo` é a tira com a primeira linha", /export function SetaDaLeitura\(\{ estado = "fim", texto = "", aoIr \}\)/.test(UI) && /estado === "novo" && texto/.test(SETA) && /<TiraDaResposta texto=\{texto\} ponta=\{seta\} sombra=\{sombra\} \/>/.test(SETA));
  t("o `novo` diz a resposta no nome, e o `fim` é o de sempre", /aria-label=\{"Resposta nova do Mestre: " \+ texto\}/.test(SETA) && /aria-label="Ir para a última mensagem"/.test(SETA));
  t("o alvo é o piso (48) nos dois estados", (SETA.match(/height: ALVOS\.piso/g) || []).length === 2 && ALVOS.piso === 48);
  t("a sombra sai da tabela, sem rgba à mão", /alfa\(T\.onSecond, s\.alfa\)/.test(SETA) && !/rgba\(/.test(SETA) && SETA_DA_LEITURA.sombra.alfa === 0.45 && SETA_DA_LEITURA.baixo === 18);
  t("não anima além do tv-fade de sempre", !/tv-(?:pulse|flutua|slide|vira|dice)/.test(SETA + TIRA));
}

/* ============================================================ */
sec("3. a fiação");
{
  const ORG = trecho(APP, "V5e · A RESPOSTA CHEGA PELO COMEÇO", "const pousarAoAbrir");
  const CODIGO = semComentario(ORG);
  t("o efeito das mensagens chama a regra, na mesma linha de antes", /chegouMensagem\(\{ antes, cresceu \}\);/.test(APP) && !/if \(cresceu && !longeDoFim && !rolagem\) fimRef/.test(APP));
  t("o alvo é a conta pura, com a margem do esbatimento", /pousoDaVista\(\{ topoDaResposta: topo, margem: ESBATIMENTO\.altura, alturaDoRolo: area\.scrollHeight, alturaDaArea: area\.clientHeight \}\)/.test(CODIGO));
  t("estar no fim mede-se no instante da chegada, com a tolerância da tabela", /const noFim = estaNoFim\(distanciaAoFimRef\.current, area \? area\.clientHeight : 0\);/.test(CODIGO) && /distanciaAoFimRef\.current = distancia; setLongeDoFim\(!estaNoFim\(distancia, el\.clientHeight\)\);/.test(APP) && !/distancia > 240/.test(APP));
  t("1 · quem relê não é arrancado: a seta passa a `novo`, e nada rola", /if \(!noFim\) \{ setPorLer\(\{ i, texto: primeiraLinhaDaProsa\(mensagens\[i\]\.texto\) \}\); return; \}/.test(CODIGO));
  /* a rolagem pendente: a resposta pousa pelo começo (antes nascia inteira abaixo
     da vista), e depois nada a move até rolar */
  const RAMO = trecho(CODIGO, "if (k >= 0) {", "return;\n      }");
  t("com a rolagem pendente a resposta pousa pelo começo, e depois nada a move", /pousarNaResposta\(i, rolarComo\(\)\)/.test(RAMO) && !/rolagem/.test(RAMO) && /if \(c\.i != null\) \{ if \(!c\.tocou && !rolagem\)/.test(CODIGO) && /if \(c\.i == null \|\| c\.tocou \|\| rolagem\) return;/.test(ORG));
  t("o que chega depois recalcula o mesmo alvo — e quem tocou na rolagem não se move", /pousarNaResposta\(c\.i, rolarComo\(\)\)/.test(CODIGO) && /const tocouNaRolagem = \(\) => \{ chegadaRef\.current\.tocou = true; \};/.test(CODIGO)
    && /onWheel=\{tocouNaRolagem\} onTouchMove=\{tocouNaRolagem\} onKeyDown=\{tocouNaRolagem\} onPointerDown=\{tocouNaRolagem\}/.test(APP));
  t("o mesmo alvo duas vezes não mexe em nada (nada salta enquanto se lê)", /if \(c\.alvo != null && Math\.abs\(c\.alvo - alvo\) <= 1\) return true;/.test(CODIGO));
  t("a cerimônia acendendo recalcula antes de a tela se pintar", /useLayoutEffect\(\(\) => \{[\s\S]*?pousarNaResposta\(c\.i, rolarComo\(\)\);[\s\S]*?\}, \[abertura\]\);/.test(ORG));
  t("2 · com reduced-motion o salto é seco (a chegada e a seta do fim)", /const rolarComo = \(\) => comportamentoDaRolagem\(reduzidoRef\.current\);/.test(CODIGO) && /el\.scrollTo\(\{ top: el\.scrollHeight, behavior: rolarComo\(\) \}\)/.test(APP) && !/behavior: "smooth"/.test(CODIGO));
  t("o turno seguinte começa como sempre: ao enviar, a vista vai ao fim", /if \(novas\.some\(\(m\) => m && m\.autor === "jogador"\)\) \{/.test(CODIGO));
  t("a primeira leva (o save a carregar) não é uma chegada: é de quem abre o jogo", /if \(!cresceu \|\| antes === 0\) return;/.test(CODIGO));
  t("abrir o jogo usa a mesma regra, seca", /const t = setTimeout\(\(\) => pousarAoAbrir\(\), 80\);/.test(APP) && /if \(i >= 0 && pousarNaResposta\(i, "auto"\)\) return;/.test(APP));
  t("e a volta da batalha continua no fim (o desfecho da luta está lá)", /if \(!daBatalha\) \{ pousarAoAbrir\(\); return; \}/.test(APP));
  t("a seta é a peça, com os dois estados", /\{\(longeDoFim \|\| porLer\) && \(\s*<SetaDaLeitura estado=\{porLer \? "novo" : "fim"\} texto=\{porLer \? porLer\.texto : ""\} aoIr=\{porLer \? irANova : irParaOFim\} \/>/.test(APP));
  t("e a `novo` some quando o começo entra na vista", /onScroll=\{\(e\) => \{ aoRolar\(e\); verSeChegouANova\(\); \}\}/.test(APP) && /setPorLer\(null\)/.test(CODIGO));
  t("nada rouba o foco: a chegada não toca no foco de ninguém", !/\.focus\(/.test(CODIGO));
  t("nunca custa o turno", /calou\("pousar a vista na chegada", e\)/.test(ORG) && /calou\("pousar a vista depois da cerimonia", e\)/.test(ORG));
  t("e nada vai ao save: é onde a vista está, não um fato do mundo", !/porLer:|chegadaRef\.current[^\n]*salvar|distanciaAoFim[^\n]*salvar/.test(APP));
}

console.log(`\nV5e · a resposta chega pelo começo: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
