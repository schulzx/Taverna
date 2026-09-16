/* teste-selo-de-estado.mjs (E4) — a gramática do número que pode ser
   negativo, e A CATRACA que fecha o buraco de onde ela nasceu

   A catraca é uma igualdade, e é exacta:

   > **o conjunto de campos desenhados = o conjunto que `mecanicaDe`
   > devolve, menos `motivos`.**

   Antes de E4 eram 4 de 7, e os quatro estavam fora da luta — a tela da
   batalha esconde o HUD inteiro. As duas condições que isso silenciava
   têm nome: `Enfraquecido` (bate −2, e H4 acabou de pagar para esse
   número contar certo) e `Marcado` (apanha +2, e o único canal dele era
   o `title=` da condição, que é balão de rato e no telefone não existe).

   Esta suíte lê os DOIS LADOS — o motor e a tabela — e compara. Um campo
   novo em `mecanicaDe` que não ganhe linha aqui fica vermelho no dia em
   que nascer, e não no dia em que um jogador perguntar por que a conta
   não fecha. */

import { mecanicaDe } from "../src/condicoes.js";
import { CAMPOS_DA_MECANICA, selosDaMecanica, comSinal, MENOS } from "../src/selo-de-estado.js";

let ok = 0, mau = 0;
const t = (n, c, extra) => { if (c) { ok++; console.log("  ok  " + n); } else { mau++; console.log("  XX  " + n + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. A CATRACA — a tela desenha tudo o que o motor calcula");
{
  /* o motor, lido de verdade e não de memória: a forma do objeto que
     `mecanicaDe` devolve para uma lista vazia É o contrato */
  const doMotor = Object.keys(mecanicaDe([])).filter((k) => k !== "motivos").sort();
  const daTabela = CAMPOS_DA_MECANICA.map((c) => c.campo).sort();
  /* OITO, E NÃO SETE — e a diferença é um achado, não um erro de conta.
     O jogo contou SETE porque contou vantagem e desvantagem como UM: as
     duas são o mesmo líquido (5e manda cancelá-las quando aparecem
     juntas) e nunca escrevem dois selos. Mas são DUAS CHAVES no objeto
     que o motor devolve, e é o objeto que esta catraca lê. Contar sete
     aqui deixaria uma chave sem linha e a igualdade passaria por
     descuido — que é exactamente o buraco que ela existe para fechar. */
  t(`o motor devolve ${doMotor.length} chaves que mexem num número`, doMotor.length === 8, doMotor.join(" · "));
  t("e a tabela dá linha a TODOS eles — nem um a menos",
    doMotor.every((k) => daTabela.includes(k)),
    "faltam: " + doMotor.filter((k) => !daTabela.includes(k)).join(" · "));
  t("e nem um a mais — a tabela não inventa campo que o motor não calcula",
    daTabela.every((k) => doMotor.includes(k)),
    "sobram: " + daTabela.filter((k) => !doMotor.includes(k)).join(" · "));
  /* `motivos` sai porque não é número: é a lista de frases que explica os
     outros, e ela já tem casa — o nome acessível do selo de rolagem */
  t("e `motivos` fica de fora de propósito: é frase, não número",
    !daTabela.includes("motivos") && "motivos" in mecanicaDe([]));
  t("toda linha diz por que existe — dívida calada é mentira",
    CAMPOS_DA_MECANICA.every((c) => typeof c.porque === "string" && c.porque.length > 20));
}

sec("2. O SINAL diz a aritmética; o TOM diz a favor de quem a conta pende");
{
  /* AS DUAS QUE A CASA NÃO SABIA DIZER, e são exactamente as duas em que
     o sinal e o tom DISCORDAM. Escolher o tom pelo sinal é o defeito. */
  const enfraquecido = selosDaMecanica({ danoReduzido: 2 });
  t("ENFRAQUECIDO escreve um MENOS e é perigo",
    enfraquecido.length === 1 && enfraquecido[0].texto === `${MENOS}2 DANO` && enfraquecido[0].tom === "perigo",
    JSON.stringify(enfraquecido));
  const marcado = selosDaMecanica({ danoRecebidoExtra: 2 });
  t("MARCADO escreve um MAIS e é perigo na mesma — o sinal e o tom discordam",
    marcado.length === 1 && marcado[0].texto === "+2 DANO SOFRIDO" && marcado[0].tom === "perigo",
    JSON.stringify(marcado));
  /* e a palavra faz o trabalho que a cor não pode fazer sozinha (WCAG
     1.4.1): é `DANO` contra `DANO SOFRIDO` que separa os dois vermelhos */
  t("e a PALAVRA separa os dois vermelhos, não a cor",
    enfraquecido[0].texto.replace(/[^A-Z ]/g, "").trim() !== marcado[0].texto.replace(/[^A-Z ]/g, "").trim());
  t("o bónus de dano continua a ser um mais de tom bom",
    selosDaMecanica({ danoExtra: 3 })[0].tom === "bom");
  /* a defesa é o único campo em que o tom SAI do sinal, e por uma razão
     escrita: defesa a mais é sempre a seu favor, a menos é sempre contra */
  t("a defesa positiva é boa e a negativa é perigo — e é o único campo assim",
    selosDaMecanica({ defesa: 2 })[0].tom === "bom" && selosDaMecanica({ defesa: -2 })[0].tom === "perigo");
  t("e ela escreve o sinal nos dois sentidos",
    selosDaMecanica({ defesa: 2 })[0].texto === "+2 DEFESA"
    && selosDaMecanica({ defesa: -2 })[0].texto === `${MENOS}2 DEFESA`);
}

sec("3. O MENOS é U+2212, nunca o hífen ASCII");
{
  /* medido em JetBrains Mono: `+2` e `−2` medem ambos 11 px a 9 px de
     corpo, logo uma coluna de selos não treme. O que difere é o glifo —
     o hífen é curto e alto, o menos tem a largura e a altura da barra
     do mais. */
  t("a constante é o ponto de código 8722", MENOS.charCodeAt(0) === 8722);
  t("e nunca o 45, que é o hífen do teclado", MENOS.charCodeAt(0) !== 45);
  t("`comSinal` escreve o menos de verdade", comSinal(-3) === `${MENOS}3`);
  t("e o mais no positivo", comSinal(3) === "+3");
  t("e o zero não fica sem sinal — mas também não vira selo", comSinal(0) === "+0");
  /* nenhum texto que esta casa escreve pode levar o hífen no lugar do
     menos: é a varredura sobre a tabela inteira */
  const comHifen = [
    ...selosDaMecanica({ danoReduzido: 1, danoRecebidoExtra: 1, danoTurno: 1, danoExtra: 1, defesa: -1 }),
  ].filter((s) => /(^|\s)-\d/.test(s.texto));
  t("nenhum selo escreve um hífen onde devia haver um menos", comHifen.length === 0,
    comHifen.map((s) => s.texto).join(" · "));
}

sec("4. Um campo a zero não escreve nada");
{
  /* um modificador permanentemente riscado ensina a regra errada — é a
     mesma razão da pílula da ação bónus que não aparece a quem não a tem */
  t("mecânica limpa não escreve selo nenhum", selosDaMecanica(mecanicaDe([])).length === 0);
  t("zero não vira selo", selosDaMecanica({ danoExtra: 0, danoReduzido: 0, defesa: 0 }).length === 0);
  t("`null` e `undefined` também não", selosDaMecanica({ danoExtra: null, defesa: undefined }).length === 0);
  /* `= {}` não cobre `null`, e é lei desta casa */
  t("e a função aguenta `null` inteiro sem estourar", selosDaMecanica(null).length === 0);
  t("e `undefined` também", selosDaMecanica(undefined).length === 0);
  t("lixo não vira número", selosDaMecanica({ danoExtra: "muito" }).length === 0);
}

sec("5. Vantagem e desvantagem cancelam-se — o jogador vê o líquido");
{
  t("só vantagem escreve vantagem", selosDaMecanica({ vantagem: true })[0].texto === "🎲 vantagem");
  t("só desvantagem escreve desvantagem", selosDaMecanica({ desvantagem: true })[0].texto === "🎲 desvantagem");
  /* 5e: as duas juntas cancelam-se, e a tela mostra o resultado, nunca a
     contabilidade das duas */
  t("as duas juntas não escrevem nenhuma das duas",
    selosDaMecanica({ vantagem: true, desvantagem: true }).length === 0);
  t("e o cancelamento não come os outros campos",
    selosDaMecanica({ vantagem: true, desvantagem: true, danoRecebidoExtra: 2 }).length === 1);
}

sec("6. A ordem é a da tabela, e ela é estável");
{
  const cheio = { vantagem: true, perdeAcao: true, danoTurno: 2, danoExtra: 1, danoReduzido: 1, danoRecebidoExtra: 1, defesa: 1 };
  const ids = selosDaMecanica(cheio).map((s) => s.id);
  t("os sete campos acesos dão sete selos", ids.length === 7, ids.join(" · "));
  const daTabela = CAMPOS_DA_MECANICA.map((c) => c.campo).filter((c) => c !== "desvantagem");
  t("e saem na ordem da tabela, sempre a mesma",
    ids.join(",") === daTabela.join(","), ids.join(",") + "  ≠  " + daTabela.join(","));
  /* determinismo: duas leituras dão a mesma saída, em qualquer máquina */
  t("duas leituras dão exactamente a mesma saída",
    JSON.stringify(selosDaMecanica(cheio)) === JSON.stringify(selosDaMecanica(cheio)));
  t("e nenhum selo sai sem tom", selosDaMecanica(cheio).every((s) => s.tom === "bom" || s.tom === "perigo"));
}

sec("7. As duas condições que motivaram isto, lidas do catálogo de verdade");
{
  /* não se inventa a condição aqui: pede-se ao motor a mecânica dela
     pelo id, que é o que a ficha do jogador carrega */
  const enf = mecanicaDe([{ id: "enfraquecido", nome: "Enfraquecido" }]);
  const marc = mecanicaDe([{ id: "marcado", nome: "Marcado" }]);
  t("`enfraquecido` reduz o dano que ele causa", enf.danoReduzido > 0, JSON.stringify(enf));
  t("e passa a ter selo — antes não tinha canal nenhum",
    selosDaMecanica(enf).some((s) => s.id === "danoReduzido"));
  t("`marcado` aumenta o dano que ele sofre", marc.danoRecebidoExtra > 0, JSON.stringify(marc));
  t("e passa a ter selo — antes o único canal era o balão de rato",
    selosDaMecanica(marc).some((s) => s.id === "danoRecebidoExtra"));
}

console.log(`\nselo de estado: ${ok} passaram, ${mau} falharam`);
process.exit(mau ? 1 : 0);
