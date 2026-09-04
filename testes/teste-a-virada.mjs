/* A VIRADA (v9.178) — subir de nível

   O momento mais celebrado de qualquer RPG não tinha uma prova sequer, e
   foi ao redesenhar a tela (`momento-level-up-v2`) que apareceram os dois
   defeitos que esta suíte agora prende. Os dois são a mesma família: um
   número escrito à mão em vez de lido da tabela.

   O PRIMEIRO: a tela anunciava "+3 PV máx · +2 PM máx" enquanto a regra
   dava seis e quatro. Metade. Ninguém conferia porque o número estava
   digitado na frase, e a frase parecia certa.

   O SEGUNDO, pior: havia DUAS ESCADAS. `aplicarNivel` sobe o nível, dá o
   corpo e guarda a dádiva épica do nível 20. Ao lado dela, dois laços à mão
   nos caminhos de espólio de combate subiam o nível e o pendente e mais
   nada. Quem subia MATANDO subia mais fraco do que quem subia entregando
   uma missão — e os dois caminhos imprimem a mesma frase de parabéns, então
   o jogador não tinha como perceber. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const R = await import(S + "regras-jogo.js");
const C = await import(S + "constantes.js");
/* SEM COMENTÁRIO: uma régua que diz "este número não está escrito à mão"
   acusaria o próprio comentário que conta a história do defeito. */
const semComentarios = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

/* um herói de nível 1 com XP suficiente para exatamente um nível */
const heroi = (extra = {}) => ({
  nome: "Prova", classe: "Guerreiro", nivel: 1, xp: 0, nivelPendentes: 0,
  vidaMax: 10, manaMax: 8, vida: 4, mana: 2, ...extra,
});

sec("1. O QUE UM NÍVEL RENDE DE CORPO TEM NOME");
{
  t("o PV por nível é uma constante exportada", R.PV_POR_NIVEL === 6);
  t("o PM também", R.PM_POR_NIVEL === 4);
  /* se é número, é tabela: o laço não pode ter o valor digitado dentro */
  const CRU = readFileSync("../src/regras-jogo.js", "utf8");
  t("e o laço lê a tabela, não um número solto", /vidaMax \+= PV_POR_NIVEL; manaMax \+= PM_POR_NIVEL;/.test(CRU));
}

sec("2. A ESCADA DÁ CORPO, E NÃO SÓ O NUMERAL");
{
  const p = R.aplicarNivel(heroi({ xp: C.XP_POR_NIVEL(1) }));
  t("sobe um nível", p.nivel === 2);
  t("e marca o pendente para a tela abrir", p.nivelPendentes === 1);
  t("dá os seis de vida", p.vidaMax === 16);
  t("e os quatro de mana", p.manaMax === 12);
  /* subir de nível cura: é o respiro que o jogo dá depois do combate que
     rendeu o XP, e a ficha inteira depende disso para não travar */
  t("e restaura o que estava gasto", p.vida === p.vidaMax && p.mana === p.manaMax);
  t("o XP restante fica guardado", p.xp === 0);

  /* dois níveis de uma vez: um espólio grande não pode engolir um deles */
  const dois = R.aplicarNivel(heroi({ xp: C.XP_POR_NIVEL(1) + C.XP_POR_NIVEL(2) }));
  t("dois níveis de uma vez sobem os dois", dois.nivel === 3);
  t("com dois pendentes", dois.nivelPendentes === 2);
  t("e o corpo dobrado", dois.vidaMax === 10 + 2 * R.PV_POR_NIVEL);

  /* e sem XP não acontece nada: uma escada que sobe de graça é pior que
     nenhuma */
  const parado = R.aplicarNivel(heroi({ xp: C.XP_POR_NIVEL(1) - 1 }));
  t("sem XP bastante, ninguém sobe", parado.nivel === 1 && parado.nivelPendentes === 0);
  t("e o corpo não muda", parado.vidaMax === 10 && parado.manaMax === 8);
}

sec("3. O ÁPICE MORTAL — o nível para em 20, o XP não");
{
  const ape = R.aplicarNivel(heroi({ nivel: 20, xp: 30000 }));
  t("o nível 20 é o teto", ape.nivel === 20);
  t("e o XP vira dádiva épica", ape.dadivasPendentes === 1);
  t("sem inflar o corpo além do teto", ape.vidaMax === 10);
}

sec("4. UMA ESCADA SÓ — o espólio de combate usa a MESMA");
{
  /* O DEFEITO QUE ESTA SEÇÃO PRENDE: dois laços à mão, nos dois caminhos de
     espólio, subiam nível e pendente sem dar PV, PM nem dádiva. */
  t("não sobrou laço de nível à mão no App", !/while \(p2\.xp >= XP_POR_NIVEL\(p2\.nivel\)\)/.test(APP));
  t("nem em variante nenhuma", !/\.nivel \+= 1;/.test(APP));
  /* e os dois caminhos de espólio chamam a escada da casa */
  t("o espólio conta a subida pela diferença de nível", /const subiu = p2\.nivel - nivelAntes;/.test(APP));
  t("os dois caminhos passam por aplicarNivel", (APP.match(/p2 = aplicarNivel\(p2\)/g) || []).length === 2);
}

sec("5. A TELA DO NÍVEL LÊ A TABELA");
{
  /* era aqui que morava o "+3 PV máx · +2 PM máx" */
  t("as pílulas vêm das constantes", /\+\$\{PV_POR_NIVEL\} PV MÁX/.test(APP) && /\+\$\{PM_POR_NIVEL\} PM MÁX/.test(APP));
  t("e não há número de nível escrito à mão na frase", !/\+3 PV máx/.test(APP) && !/\+2 PM máx/.test(APP));
  t("os pontos de habilidade e atributo também são pedidos", /\+\$\{ganhoHab\} HABILIDADE/.test(APP) && /\+\$\{ganhoAtr\} ATRIBUTO/.test(APP));
  /* o teto de atributo só aparece quando de fato subiu — pílula permanente
     vira papel de parede */
  t("o teto só acende quando muda", /teto > tetoAnterior && \(/.test(APP));

  /* A VIRADA da v9.163 sobreviveu ao redesenho: o desenho pedia um retrato
     redondo, e o retrato desta casa é a carta, que sabe dizer o número. */
  t("a carta continua virando", /<div className="tv-vira">/.test(APP));
  t("com a face e o verso", /<CartaDeTaro ente=\{\{ \.\.\.personagem, nivel \}\}/.test(APP) && /<CartaVerso \/>/.test(APP));

  /* E AS DUAS CARTAS DE HABILIDADE DO DESENHO NÃO ENTRARAM: subir de nível
     rende PONTOS, gastos com a árvore inteira à vista. */
  t("a tela manda gastar em Talentos", /Gestão › Talentos/.test(APP));
}

console.log(`\na virada v9.178: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
