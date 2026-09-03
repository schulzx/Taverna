/* teste-vozes.mjs (v9.92) — o mesmo mundo, contado por outra boca.

   "Essas narrações não ficam apenas em modo de narrar, mas sim em tons e
   expressões — o taverneiro fala palavrões e gírias."

   Duas coisas provadas aqui, e a segunda é a que importa mais: que as
   vozes são DIFERENTES DE VERDADE (uma voz que só troca adjetivos é uma
   etiqueta, não uma voz) e que nenhuma delas toca a ESTRUTURA — porque é
   isso que permite haver oito sem multiplicar o jogo por oito. */
import { VOZES, VOZ_PADRAO, vozPorId, vozPrompt, linhaDaVoz } from "../src/vozes.js";
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

sec("1. O ACERVO");
{
  t(`há vozes de sobra (${VOZES.length})`, VOZES.length >= 6);
  const ids = VOZES.map((v) => v.id);
  t("nenhum id repetido", new Set(ids).size === ids.length);
  const tortos = ids.filter((x) => !/^[a-z][a-z0-9_]*$/.test(x));
  t(`todo id é ascii minúsculo${tortos.length ? " — " + tortos.join(", ") : ""}`, tortos.length === 0);
  t("a voz padrão existe", !!vozPorId(VOZ_PADRAO) && vozPorId(VOZ_PADRAO).id === VOZ_PADRAO);
  t("id desconhecido cai no padrão", vozPorId("nao_existe").id === VOZ_PADRAO);

  /* OS SEIS CAMPOS. Sem qualquer um deles a voz vira etiqueta: `faz` sem
     `exemplo` é adjetivo, e `exemplo` sem `naoFaz` é uma voz que só sabe
     acertar de um jeito. */
  const completas = VOZES.filter((v) => v.nome && v.icone && v.de && v.resumo && v.naoFaz && v.frase && v.boca && v.graca && v.exemplo && Array.isArray(v.faz));
  t(`todas têm os campos (${completas.length}/${VOZES.length})`, completas.length === VOZES.length);
  t("todas têm três ou mais coisas que fazem", VOZES.every((v) => v.faz.length >= 3));
  /* `naoFaz` é o modo característico de ESTA voz sair errada, e ele é
     diferente em cada uma: o épico vira pomposo, o taverneiro vira
     palhaçada, o quieto vira parado */
  t("todo `naoFaz` é uma proibição concreta", VOZES.every((v) => /^não vire|^não /i.test(v.naoFaz)));
  t("e nenhum se repete", new Set(VOZES.map((v) => v.naoFaz)).size === VOZES.length);
  t("todo exemplo é uma frase de verdade", VOZES.every((v) => v.exemplo.length > 40 && /[.!?"”]$/.test(v.exemplo.trim())));
}

sec("2. SÃO DIFERENTES DE VERDADE");
{
  /* uma voz que só troca adjetivos é uma etiqueta. A prova concreta: os
     exemplos, as regras de frase e as bocas são todos distintos entre si */
  for (const campo of ["resumo", "frase", "boca", "graca", "exemplo", "de"]) {
    t(`os \`${campo}\` são todos distintos`, new Set(VOZES.map((v) => v[campo])).size === VOZES.length);
  }
  /* e o tamanho da frase é REALMENTE diferente: se todas dissessem
     "períodos médios", a metade audível da voz não existiria */
  const curtas = VOZES.filter((v) => /curt|muito curta|declarativa/i.test(v.frase)).length;
  const longas = VOZES.filter((v) => /long|cadenciada|média/i.test(v.frase)).length;
  t(`há vozes de frase curta (${curtas}) e de frase longa (${longas})`, curtas >= 2 && longas >= 2);

  /* O PALAVRÃO, que foi o exemplo do pedido. O taverneiro fala; o épico e
     a fábula não. Se todas tivessem a mesma regra de léxico, a diferença
     que o pedido descreve não existiria. */
  const tav = vozPorId("taverneiro");
  t("o taverneiro fala palavrão", /palavrão à vontade/i.test(tav.boca));
  t("e o exemplo dele é falado", /"/.test(tav.exemplo));
  const epi = vozPorId("epico");
  t("o épico não xinga", /ninguém xinga/i.test(epi.boca));
  t("e abre pelo lugar", /PELO LUGAR/.test(epi.faz.join(" ")));
  const fab = vozPorId("fabula");
  t("a fábula não gasta palavra", /Sem palavrão/i.test(fab.boca));
  const qui = vozPorId("quieto");
  t("o contemplativo deixa a cena respirar", /RESPIRAREM/.test(qui.faz.join(" ")));

  /* as três que o pedido nomeou existem, com outros nomes: épica,
     taverneira e a lenta do pós-aventura */
  for (const id of ["epico", "taverneiro", "quieto"]) t(`a voz "${id}" existe`, !!VOZES.find((v) => v.id === id));
}

sec("3. NENHUMA TOCA A ESTRUTURA");
{
  /* é isto que permite oito vozes sem multiplicar o jogo por oito: elas
     mudam a BOCA, não o mundo. Uma voz que mandasse "faça acontecer uma
     luta" seria um segundo compasso, e o jogo voltaria a ter dois donos
     da verdade — o defeito consertado na v9.89. */
  const invade = [];
  for (const v of VOZES) {
    const txt = [v.resumo, v.naoFaz, v.frase, v.boca, v.graca, ...v.faz].join(" ");
    if (/\b(role|rolem|adicione|remova|cobre|aplique)\b/i.test(txt)) invade.push(v.id + ":ficha");
    if (/\b(d20|PV|PM)\b/.test(txt)) invade.push(v.id + ":mecânica");
    if (/abra (o )?combate|crie uma miss|invente um item/i.test(txt)) invade.push(v.id + ":sistema");
    if (/avance o arco|mude o momento/i.test(txt)) invade.push(v.id + ":arco");
  }
  t(`nenhuma voz mexe no que é do sistema${invade.length ? " — " + invade.join(", ") : ""}`, invade.length === 0);

  const p = vozPrompt("taverneiro");
  t("o bloco diz que a voz é a boca, não o mundo", /A VOZ É A BOCA, NÃO O MUNDO/.test(p));
  t("e que o que acontece vem do sistema", /continuam vindo do sistema e dos envelopes/.test(p));
}

sec("4. O QUE SOBE AO PROMPT");
{
  for (const v of VOZES) {
    const p = vozPrompt(v.id);
    t(`${v.id}: o bloco nomeia a voz`, p.includes(v.nome.toUpperCase()));
    /* o EXEMPLO é a metade que faz as outras funcionarem: voz é a coisa
       que a IA mais erra por falta de amostra */
    if (!p.includes(v.exemplo)) t(`${v.id}: e traz o exemplo`, false);
  }
  t("todos os blocos trazem o exemplo", VOZES.every((v) => vozPrompt(v.id).includes(v.exemplo)));
  t("e o erro característico", VOZES.every((v) => vozPrompt(v.id).includes(v.naoFaz)));

  /* UM bloco por campanha: é o que permite ter oito. Se o prompt levasse
     todas, o custo seria multiplicado por oito e nenhuma caberia. */
  const p = vozPrompt("epico");
  const outras = VOZES.filter((v) => v.id !== "epico");
  t("o bloco não traz as outras vozes", !outras.some((v) => p.includes(v.exemplo)));

  const tam = VOZES.map((v) => vozPrompt(v.id).length);
  t(`cada bloco cabe (maior: ${Math.max(...tam)} chars)`, Math.max(...tam) < 1700);

  t("a linha da tela é curta e tem ícone", VOZES.every((v) => linhaDaVoz(v.id).includes(v.icone) && linhaDaVoz(v.id).length < 120));
}

sec("5. A LIGAÇÃO");
{
  const prompt = fs.readFileSync("../src/prompt.js", "utf8");
  const app = fs.readFileSync("../src/App.jsx", "utf8");
  t("o prompt importa as vozes", /import \{ vozPrompt, VOZ_PADRAO \} from "\.\/vozes\.js"/.test(prompt));
  /* a voz viaja dentro de `mundo`, que já vai inteiro ao prompt: um
     parâmetro novo seria seis chamadas para esquecer dele na sétima */
  t("e lê a voz do mundo", /vozPrompt\(\(mundo && mundo\.voz\) \|\| VOZ_PADRAO\)/.test(prompt));
  t("a tela de criação oferece as vozes", /VOZES\.map\(\(v\) =>/.test(app));
  t("mostra o exemplo de cada uma", /\{v\.exemplo\}/.test(app));
  t("e a escolha vai junto do mundo", /estrutura, molde, voz, apresentacao, limites: limites\.trim\(\) \}/.test(app));
  /* o jogador precisa saber que a voz NÃO muda o mundo, senão ele escolhe
     achando que está escolhendo o tipo de aventura */
  t("a tela avisa que a voz não muda o mundo", /Não muda o mundo nem o que acontece nele/.test(app));

  /* E O QUE O COMPASSO TORNOU OBSOLETO SAIU: o bloco que mandava a IA
     alternar elementos e não repetir o loop de urgências pedia a ela o
     trabalho que o compasso agora faz — e cego, sem ver a curva. */
  t("o prompt não pede mais paleta de elementos", !/PALETA DE ELEMENTOS/.test(prompt));
  t("nem administrar o loop de urgências", !/loop de urgências/.test(prompt));
  t("e aponta o ritmo para o sistema", /RITMO DA HISTÓRIA \(quem rege é o SISTEMA/.test(prompt));
  t("proibindo colher sem semente", /se o sistema não plantou, não colha/.test(prompt));
}

console.log(`\nvozes v9.92: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
