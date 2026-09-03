/* A PORTA DE ENTRADA (v9.164)

   Três coisas que separam um projeto de um jogo que recebe gente de
   fora:

   O ASSISTENTE ÚNICO — "recalibrar lenda" e "recalibrar mundo" eram
   dois botões, e quem chega com save antigo não tem como saber que
   precisa dos dois, nem em que ordem. Virou uma porta só com dois
   passos encadeados.

   A COBRANÇA DO BACKUP — o save mora num localStorage que qualquer
   limpeza de cache apaga. O jogo carimba a data da última cópia e o
   menu cobra quando ela envelhece — e SÓ quando envelhece, porque
   aviso permanente vira papel de parede.

   AS LINHAS DA MESA — toda mesa de verdade pergunta "o que não entra?"
   antes da primeira cena. O campo entra na criação do mundo e vira
   regra ABSOLUTA no prompt, acima inclusive das instruções de ousadia. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const { montarSystemPrompt } = await import(S + "prompt.js");
const APP = readFileSync(S + "App.jsx", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. AS DUAS RECALIBRAÇÕES VIRARAM UMA PORTA");
{
  t("o assistente único existe", /const recalibrarSave = \(\) => \{ cadeiaRecalRef\.current = true; recalibrarLenda\(\); \};/.test(APP));
  t("e é o único botão", /⚖ recalibrar save antigo · a lenda e o mundo/.test(APP) && !/⚖ recalibrar lenda \(save antigo\)/.test(APP) && !/⚖ recalibrar mundo · guilda/.test(APP));
  /* recusar a lenda NÃO cancela o mundo: são perguntas independentes
     sobre o mesmo save — a pessoa cujos números estão certos ainda
     precisa dos companheiros no nível certo */
  t("aplicar a lenda segue para o mundo", /seguirParaOMundo\(\);\s*\};/.test(APP.slice(APP.indexOf("const aplicarRecalibragem"), APP.indexOf("const aplicarRecalibragem") + 2200)));
  t("manter como está também segue", /setRecal\(null\); seguirParaOMundo\(\); \}/.test(APP));
  /* a cadeia desarma ao seguir: o passo do mundo aberto pelo caminho
     antigo não pode reabrir a si mesmo */
  t("a cadeia dispara uma vez só", /cadeiaRecalRef\.current = false;\s*recalibrarMundo\(\);/.test(APP));
  t("os passos se apresentam como passos", /passo 1 de 2/.test(APP) && /passo 2 de 2/.test(APP));
}

sec("2. A COBRANÇA DO BACKUP");
{
  t("a exportação carimba a data", /backupEmRef\.current = Date\.now\(\);/.test(APP));
  /* a exportação do MENU acontece com o jogo desmontado: o carimbo tem
     de ir direto ao armazenamento, porque ali não há salvar() */
  t("e grava direto quando o jogo está desmontado", /localStorage\.setItem\("taverna_save_v1", JSON\.stringify\(sv2\)\)/.test(APP));
  t("em jogo, o carimbo viaja no save", /backupEm: backupEmRef\.current,/.test(APP));
  t("e volta do save no carregamento", /backupEmRef\.current = sv\.backupEm \|\| null;/.test(APP));
  /* só cobra quando está velha: aviso permanente vira papel de parede.

     v9.169: A LEI É A MESMA, A REDAÇÃO MUDOU. O redesenho do menu
     (`taverna-menu-v2-game`) trocou o `return null` no meio do JSX por um
     booleano nomeado calculado antes do return — `cobrarBackup` —, e o
     nome do dia virou `diasSemCopia` porque agora ele também é lido pelo
     texto da caixa. O que se prova continua sendo o mesmo: nunca copiou
     OU passou de sete dias. */
  t("o menu só cobra depois de sete dias", /cobrarBackup = !!temSave && \(diasSemCopia == null \|\| diasSemCopia >= 7\)/.test(APP));
  t("quem nunca copiou ouve a versão dura", /nunca teve uma cópia em arquivo/.test(APP));
  t("quem copiou ouve a idade", /tem \$\{diasSemCopia\} dias — tudo o que aconteceu desde então vive só neste navegador/.test(APP));
}

sec("3. AS LINHAS DA MESA");
{
  t("a criação do mundo pergunta", /As linhas desta mesa/.test(APP));
  t("é opcional e diz que é", /Opcional, e dá para deixar em branco/.test(APP));
  t("com teto de tamanho", /maxLength=\{300\}/.test(APP));
  t("e viaja com o mundo", /limites: limites\.trim\(\) \}/.test(APP));
  /* a regra entra no prompt como ABSOLUTA — acima da ousadia, que é a
     instrução com quem ela vai brigar */
  const pers = { nome: "X", atributos: { forca: 1, destreza: 1, vigor: 1, intelecto: 1, presenca: 1, percepcao: 1 }, vida: 10, vidaMax: 10, mana: 8, manaMax: 8, nivel: 1 };
  const com = montarSystemPrompt("T", { genero: "Fantasia medieval", limites: "nada de mal a crianças" }, pers, null, {}, "", "", "", "");
  const sem = montarSystemPrompt("T", { genero: "Fantasia medieval" }, pers, null, {}, "", "", "", "");
  t("a linha entra no prompt, literal", com.includes("nada de mal a crianças"));
  t("como regra absoluta", com.includes("AS LINHAS DESTA MESA (regra ABSOLUTA"));
  t("declarada acima da ousadia", com.includes("inclusive as que pedem ousadia"));
  t("e ANTES da ousadia no texto", com.indexOf("AS LINHAS DESTA MESA") < com.indexOf("LIBERDADE CRIATIVA"));
  t("mandando desviar sem anunciar", com.includes("DESVIE sem anunciar o desvio"));
  t("sem limites, sem bloco", !sem.includes("AS LINHAS DESTA MESA"));
  /* e no TOPO do texto: as linhas são imutáveis pela campanha inteira —
     moram na parte cacheável, não na zona da cena */
  t("no topo, onde o cache mora", com.indexOf("AS LINHAS DESTA MESA") / com.length < 0.1);
}

console.log(`\nporta de entrada v9.164: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
