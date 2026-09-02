/* A DESTREZA E O PERFIL POR CRIATURA (v9.152)

   Dois números que o bestiário não tinha, e uma dívida de 145 versões.

   `agil` era um BOOLEANO, e um booleano dá dois valores. Com ele, o Slime
   ("gosma lenta e previsível") e o Golem de Pedra ("lento e esmagador")
   entravam na ordem do turno empatados com o Ogro e com o Bandido — e o
   Batedor, cuja descrição inteira é "rápido, frágil", ganhava o mesmo +2
   do Goblin.

   E o PERFIL de dano saía de uma expressão regular sobre o nome. Ela
   acerta o folclore (dragão queima, morto-vivo teme o sagrado) e errava
   19 das 27 criaturas da tabela. Algumas dessas 19 devem mesmo ser
   neutras — o Bandido e o Soldado são gente com aço. Mas o TROLL não: a
   descrição dele diz "regenera se não queimar" desde sempre, o jogador lê
   isso na ficha, usa fogo, e o sistema não fazia nada diferente.

   Regra escrita sem código atrás — e ainda por cima uma que o próprio
   jogo mostrava ao jogador. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const B = await import(S + "bestiario.js");
const D = await import(S + "danos.js");
const APP = readFileSync("../src/App.jsx", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const TODAS = [...B.CRIATURAS_FANTASIA, ...B.ARQUETIPOS];
const por = (n) => TODAS.find((c) => c.nome === n);

sec("1. TODA CRIATURA TEM DESTREZA PRÓPRIA");
{
  t("nenhuma sem número", TODAS.every((c) => typeof c.des === "number"));
  t("são vinte e sete", TODAS.length === 27);
  /* a faixa importa: se todas caíssem entre 0 e 2, o número seria o
     booleano com passos extras e não teríamos ganhado nada */
  const des = TODAS.map((c) => c.des);
  t("há criaturas mais lentas que zero", Math.min(...des) <= -2);
  t("e mais rápidas que dois", Math.max(...des) >= 4);
  /* O CASO QUE MOTIVOU A MUDANÇA */
  t("o Batedor é o mais rápido", por("Batedor").des === Math.max(...des));
  t("e a descrição dele explica", /rápido/.test(por("Batedor").desc));
  t("o Slime é dos mais lentos", por("Slime").des <= -2);
  t("e a descrição dele explica", /lenta/.test(por("Slime").desc));
  /* antes, estes três empatavam em zero */
  t("Slime, Ogro e Bandido deixaram de empatar",
    new Set([por("Slime").des, por("Ogro").des, por("Bandido").des]).size === 3);
  /* e o booleano continua existindo, derivado — quatro outros lugares o
     leem (defesa, grade, movimento, mundo-base), e trocar cinco coisas de
     uma vez para arrumar uma é como se descobre duas semanas depois que a
     grade parou de recuar */
  t("`agil` é derivado, e nunca discorda", TODAS.every((c) => c.agil === (c.des >= 2)));
}

sec("2. A INICIATIVA USA O NÚMERO");
{
  t("o App passa a destreza", /modDestreza: Number\(e\.des\) \|\| 0/.test(APP));
  t("e não o booleano", !/modDestreza: e\.agil \? 2 : 0/.test(APP));
  /* a ficha que chega na luta é a que sai de `completarInimigo`: a tabela
     pode estar certa e o jogo não ver nada */
  t("a destreza atravessa completarInimigo", B.completarInimigo({ nome: "Batedor" }, 5).des === 4);
  t("e a do lento também", B.completarInimigo({ nome: "Zumbi" }, 5).des === -2);
  /* o Narrador pode abrir combate com qualquer nome, e para o
     desconhecido o sistema não inventa: zero */
  t("nome fora da tabela não é rápido nem lento", B.completarInimigo({ nome: "Coisa Sem Nome" }, 5).des === 0);
  t("e o que vem declarado manda", B.completarInimigo({ nome: "Coisa", des: 3 }, 5).des === 3);
}

sec("3. O TROLL FINALMENTE QUEIMA");
{
  const troll = B.completarInimigo({ nome: "Troll" }, 5);
  const p = D.perfilDe(troll);
  t("o Troll tem fraqueza a fogo", p.fraqueza.includes("fogo"));
  /* a descrição dizia isso desde sempre, e o código não sabia */
  t("como a descrição dele sempre disse", /queimar/.test(por("Troll").desc));
  t("e o fogo passa a doer mais", D.multiplicadorDano("fogo", p).mult > 1);
  t("enquanto outro dano não", D.multiplicadorDano("gelo", p).mult === 1);
  /* o perfil atravessa a ficha: esquecer de copiá-lo em
     `completarInimigo` deixou a tabela certa e o jogo cego por um teste */
  t("o perfil atravessa completarInimigo", !!troll.perfil);
  const sent = D.perfilDe(B.completarInimigo({ nome: "Sentinela Blindada" }, 5));
  t("a muralha ambulante resiste ao físico", sent.resist.includes("fisico"));
  t("e teme o raio", sent.fraqueza.includes("raio"));
}

sec("4. A REGEX FICA COMO REDE, E O NEUTRO CONTINUA NEUTRO");
{
  /* o Narrador pode abrir combate com qualquer nome: para "Coisa Sem
     Nome" a ficha não tem o que dizer, e a regex também não — e o neutro
     é a resposta certa */
  const nada = D.perfilDe({ nome: "Coisa Sem Nome" });
  t("o desconhecido é neutro", nada.ataque === "fisico" && !nada.resist.length);
  /* mas o folclore que a regex acerta continua acertando, sem a criatura
     precisar declarar nada */
  const lich = D.perfilDe(B.completarInimigo({ nome: "Lich" }, 5));
  t("o morto-vivo continua temendo o sagrado", lich.fraqueza.includes("sagrado"));
  t("sem ter perfil declarado", !por("Lich").perfil);
  /* E INVENTAR RESISTÊNCIA PARA GENTE COMUM SERIA PIOR: o Bandido é uma
     pessoa com aço barato, e o neutro é o que ele é. */
  const band = D.perfilDe(B.completarInimigo({ nome: "Bandido" }, 5));
  t("o Bandido segue sem resistência nenhuma", !band.resist.length && !band.fraqueza.length);
  t("e sem perfil declarado, de propósito", !por("Bandido").perfil);
  /* a ficha manda mais que o nome */
  t("perfil declarado vence a regex", D.perfilDe({ nome: "Lich", perfil: { ataque: "fogo", resist: ["fogo"] } }).ataque === "fogo");
  t("lixo não derruba", !!D.perfilDe(null) && !!D.perfilDe({ perfil: "nao é objeto" }));
  /* nenhum import de bestiario em danos.js: bestiario → combate → danos,
     e o ciclo se fecharia */
  t("danos.js não importa o bestiário", !/from "\.\/bestiario\.js"/.test(readFileSync("../src/danos.js", "utf8")));
}

sec("5. A COMPATIBILIDADE DE 145 VERSÕES SAIU");
{
  /* `"fe":{fieis,pf}` era o formato de resposta das versões 7.4 e 7.5.
     Sobreviveu 145 versões depois de a fé passar a viajar por SINAL. */
  t("a leitura do formato antigo sumiu", !/resp\.mudancas\.fe && typeof resp\.mudancas\.fe === "object"/.test(APP));
  t("e o prompt nunca a ensinou de volta", !/"fe":\s*\{/.test(readFileSync("../src/prompt.js", "utf8")));
  /* código de compatibilidade que não pode mais ser acionado não é
     inofensivo: é um segundo caminho para mexer na divindade, e o próximo
     a ler o arquivo tem de decidir se ele importa */
  t("o canal vivo continua de pé", /chave === "fe"/.test(APP));
  t("e o registro do porquê ficou", /formato antigo/.test(APP));
}

console.log(`\nbestiário v9.152: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
