/* check-passo-na-rodada.mjs (E4) — a luta nasce COM orçamento

   A QUEIXA, medida a jogar em dois ciclos seguidos e nos dois tamanhos:
   `H14 → H11 → H8 → I8` são 10,5 m numa só rodada, e antes disso
   `F16 → F12 → F8 → F4 → E2` foram vinte e um — com a marca do passo
   parada em `9 de 9 m` o tempo todo. O jogador atravessava o navio
   inteiro no primeiro turno.

   E O DIAGNÓSTICO ÓBVIO ESTAVA ERRADO, que é o que faz este varredor
   valer a pena. Não faltava desconto: `moverPara` calcula
   `sobra = restante − chk.custoM` desde a v9.41, e a peça pura
   (`PASSO_NA_RODADA`, `passoQueResta`, `podeDarUmPasso`,
   `passoAposAndar`) está em `grid.js` provada em Node.

   **A luta é que nascia sem `economia`.** `equiparCombate` montava
   `{ …, rodada: 1, recursos: novosRecursos() }` e nada mais; a economia
   só nascia na virada de rodada. E o desconto era
   `eco ? { ...eco, movM: sobra } : eco` — *sem `eco`, evapora*. A rodada
   1 inteira era de graça.

   E A MESMA LINHA EM FALTA TINHA UM SEGUNDO SINTOMA, que ninguém tinha
   ligado: a guarda da ação está atrás de `if (eco)`, logo o aviso
   *"Você já usou sua ação nesta rodada"* NUNCA disparava na rodada 1 —
   que é a razão das zero chamadas que W2 contou sem saber porquê.

   *Uma chave em falta num literal apagou duas regras em silêncio, e
   nenhuma das duas era a regra que o diagnóstico acusava.*

   O QUE ISTO MORDE: a chave no literal, e o desconto a ler o módulo puro
   em vez de refazer a conta à mão. O QUE NÃO MORDE, e fica escrito
   porque buraco calado é mentira: isto lê TEXTO. Uma economia que nasça
   certa e seja apagada por outro caminho em tempo de execução passa
   verde aqui — o que prende é a ORIGEM, e o resto confere-se a jogar. */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PASSO_NA_RODADA } from "../src/grid.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (p) => (existsSync(join(RAIZ, p)) ? readFileSync(join(RAIZ, p), "utf8") : "");
const semProsa = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semProsa(ler("src/App.jsx"));

sec("0. o alcance — catraca verde por vazio é pior que catraca nenhuma");
t("o App.jsx foi lido inteiro", APP.length > 400000, `leu ${APP.length} caracteres`);
t("e a tabela do passo existe no motor", PASSO_NA_RODADA && PASSO_NA_RODADA.campo === "movM");

sec("1. a luta NASCE com economia — a chave que faltava no literal");
{
  /* a porta única de abrir combate monta o objeto da luta: se a economia
     não nascer aqui, ela só existe a partir da rodada 2 */
  const lit = (APP.match(/const novo = \{ \.\.\.comb,[^;]*\};/) || [])[0] || "";
  t("o literal de `equiparCombate` foi encontrado", lit.length > 0);
  t("e ele monta a economia da rodada 1", /economia: economiaNova\(pers\)/.test(lit),
    "sem esta chave a rodada 1 é de graça — 21 m medidos com a marca parada em `9 de 9`, e o aviso da ação nunca dispara.");
}

sec("2. o desconto do passo lê o módulo puro, e não refaz a conta à mão");
{
  t("quanto resta sai de `passoQueResta`, que sabe distinguir `null` de `0`",
    /passoQueResta\(eco && eco\.movM, passo\.metros\)/.test(APP),
    "`null` é «ninguém andou ainda» e vale o passo inteiro; `0` é «acabou». Uma linha `eco && eco.movM != null ? ... : ...` escrita à mão é a segunda cópia dessa distinção.");
  t("e quem decide se ainda cabe um passo é `podeDarUmPasso`",
    /if \(!podeDarUmPasso\(eco && eco\.movM, passo\.metros\)\)/.test(APP),
    "o mínimo é uma casa do tabuleiro, e esse número mora em `PASSO_NA_RODADA`.");
  t("e o que sobra sai de `passoAposAndar`, que devolve SEMPRE um número",
    /passoAposAndar\(eco && eco\.movM, passo\.metros, chk\.custoM\)/.test(APP));
  t("a economia nova nasce mesmo quando não havia economia nenhuma",
    /const novaEco = \{ \.\.\.\(eco \|\| \{\}\), \[PASSO_NA_RODADA\.campo\]: sobra \};/.test(APP),
    "`eco ? { ...eco, movM: sobra } : eco` devolve `undefined` quando não há economia — o desconto evapora no exacto caso em que ele mais importa.");
  /* O CAMPO SAI DA TABELA. `movM` escrito à mão em três sítios é a mesma
     doença de `check-formas` para a cor: um nome de campo é um número
     com letras. */
  t("e o nome do campo sai de `PASSO_NA_RODADA`, nunca escrito à mão na fiação nova",
    /PASSO_NA_RODADA\.campo/.test(APP));
}

sec("3. a marca `👣` lê a mesma conta que o motor");
{
  /* Medido: `passoDaBatalha` caía no valor por omissão `pp.metros` e a
     régua dizia `9 de 9` enquanto o herói andava. A marca e o débito têm
     de ler a MESMA função, ou a tela mente sobre o que o motor cobrou. */
  t("o passo que a tela acende sai de `passoQueResta`",
    /passoM: passoQueResta\(/.test(APP),
    "a régua e o débito têm de ler a mesma conta: duas leituras são duas verdades.");
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
