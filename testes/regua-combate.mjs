/* ============================================================
   A RÉGUA DE COMBATE DE UMA VIDA (B1) — Taverna

   POR QUE ELA EXISTE. Esta casa tem uma catraca de equilíbrio para a
   ARENA (`teste-arena.mjs`: todo pronto entre 35% e 65% de vitória, em
   quatro famílias de sementes) e NENHUMA para **Uma Vida** — o modo que
   é o jogo. Toda mudança de combate na campanha foi julgada por
   argumento; quando foi julgada por número (P3, T1), o número saiu de um
   script no scratchpad que já não existe. Uma régua que evapora depois
   de usada não é régua: é lembrança.

   Esta é a régua permanente. Ela não muda uma regra de jogo — compõe os
   motores que já existem (`combate.js`, `companheiros.js`, `efeitos.js`,
   `condicoes.js`, `habilidades.js`, `bestiario.js`) e conta o que
   aconteceu.

   ---------------- ONDE ELA MORA, E POR QUÊ ----------------

   Em `testes/` e não em `src/`. Dois motivos, e os dois são lei desta
   casa. (1) `src/` é o MOTOR: o que o jogador vive. Uma régua não é
   gameplay, e pôr instrumento de medida ao lado de regra de jogo é a
   mesma confusão que "conta se prova, tela se olha" existe para evitar.
   (2) `teste-ligacao.mjs`, seção 1, exige que todo módulo de `src/` seja
   importado por outro módulo de `src/` — e nada no jogo importa, nem
   deve importar, um simulador de balanceamento. Nascer em `src/` seria
   nascer vermelho.

   ---------------- O MOLDE, E O QUE ELE HERDA ----------------

   O molde é o de P3/T1 na medida em que o diário o descreve: cenário
   DURO e BRANDO, sementes `umavida|<n>`, grupo de Mago + Clérigo +
   Engenheiro de nível 5 ao lado do herói, teto de 20 rodadas, 4 elites
   nível 9 no duro e 3 comuns nível 5 no brando. O PV dos companheiros
   (44 cada, 132 por combate) fecha exatamente com os "26400 de 200
   combates" que o diário registrou — é a confirmação de que os
   parâmetros abaixo são os daquele molde.

   E UM TERCEIRO CENÁRIO NASCEU AQUI, o `justo`, porque os dois de P3
   estão saturados nas duas pontas e a própria leitura honesta de P3 diz
   isso. O motivo inteiro está em `CENARIOS_DA_REGUA.justo`; em uma
   frase: é o único dos três em que uma mudança de combate tem para onde
   subir E para onde descer, e é nele que a catraca mora.

   O QUE NÃO É REPRODUZÍVEL BYTE A BYTE, e é honesto dizer: o SCRIPT de
   P3/T1 não existe mais. O que sobrevive dele é a descrição no diário,
   não o código. As escolhas de FIAÇÃO — em que ordem o herói, os
   inimigos e o grupo agem dentro da rodada; como o dano do inimigo
   encontra o abrigo; quando o relógio dos efeitos e das condições anda —
   foram reconstruídas lendo o `App.jsx` de hoje, sítio por sítio.

   ATÉ ONDE A RECONSTRUÇÃO CHEGOU, em número, contra o retrato de T1 (200
   combates, `umavida|0..199`, cenário duro):

     rodada da 1ª queda   4,41  ·  T1 mediu 4,41 (antes) e 4,64 (depois)
     quedas               545   ·  T1 mediu 566 (antes) e 563 (depois)
     PV restante do grupo 969   ·  T1 mediu 675 (antes) e 754 (depois)
     brando, quedas         0   ·  T1 mediu 0 nos dois
     brando, PV restante 94,5%  ·  T1 mediu 91,7% e 93,3%

   Os dois primeiros caem em cima; os dois últimos ficam por volta de 25%
   acima. O que ainda diverge com clareza é a ABSORÇÃO (378 parados em 63
   abrigos, contra 918 em 153): o molde perdido nascia mais abrigos do
   que este, e sem o script não há como dizer de onde vinham os outros
   noventa. Fica escrito porque é a única peça em que esta régua sabe que
   não é o instrumento de P3, e é justamente a peça que B2 encosta.

   O que a régua garante — e é o que importa a partir de agora — é que a
   MESMA régua meça o antes e o depois de cada mudança.

   A ordem da rodada, e de onde cada passo veio:
     1. o herói ataca            (App.jsx:11566-11645 — `ataquesPorTurno`
                                  golpes de `danoDaClasse`)
     2. os inimigos atacam       (`turnoDosInimigos`; o dano passa pelo
                                  abrigo antes do PV, App.jsx:13653/13684,
                                  e a concentração do companheiro cai
                                  depois, App.jsx:13701)
     3. o herói caído rola morte (`testeDeMorte`/`aplicarTesteMorte`)
     4. o grupo age              (`turnoDosCompanheiros`, e o buff nasce
                                  pelo molde de `buffDeCompanheiro`,
                                  App.jsx:7942)
     5. os relógios andam        (`tickEfeitos` no herói e no grupo,
                                  App.jsx:8246-8277; `tickCondicoes` —
                                  com dano no herói e nos inimigos, SEM
                                  dano no grupo, que é a fronteira que T1
                                  decidiu e escreveu)

   ---------------- DETERMINISMO ----------------

   `combate.js` rola com `Math.random` direto (`d`, `d20`). A régua NÃO
   muda isso: usa o mesmo recurso que `arena.js` usa desde que existe —
   troca `Math.random` por um gerador semeado durante a simulação e o
   restaura no `finally`. Zero linha de produção alterada nesta etapa,
   que é a exigência de B1.

   ---------------- ESTÁVEL, NÃO SORTUDA ----------------

   A lição de A4 e de C2b é que uma régua sobre um punhado de sementes
   mede o resorteio, não o jogo. Por isso nada aqui devolve um número
   pelado: toda métrica volta como MÉDIA ± MARGEM (meia-largura do
   intervalo de 95%, do erro padrão da média, ou da proporção quando é
   taxa), e `concordam()` diz se duas famílias independentes de sementes
   caem uma dentro da margem da outra.

   ---------------- PARA QUEM ESCREVE A SUÍTE ----------------

   O QUE JÁ AGUENTA VIRAR CATRACA (medido em 4 famílias × 1000):
     · a faixa de vitória no cenário `justo` — 35% a 65%, a mesma lei da
       arena. Retrato 49,8 a 52,8%, ~4,5 margens de cada borda.
     · o teto de PV do grupo e o piso de quedas no `justo`
       (`CATRACA_DE_UMA_VIDA`), pelo mesmo raciocínio de folga.
     · `estourouTeto === 0` nos três cenários. É o guarda da própria
       régua: combate que bate no teto de rodadas não terminou.
     · `quedas === 0` no `brando`. Zero em 4000 combates, nas quatro
       famílias — se um dia alguém cair ali, algo quebrou em silêncio.
     · determinismo: mesma semente, mesmo combate, e `Math.random`
       restaurado depois (a troca da sorte não pode vazar para a suíte
       que roda em seguida).
     · a leitura da tabela: todo cenário com os três blocos, toda métrica
       de `METRICAS_DA_REGUA` presente no que `medir` devolve.

   O QUE NÃO AGUENTA, e é honesto não fingir:
     · qualquer limiar sobre `absorvido` ou `abrigos`. São os números
       mais ralos da régua (0,29 abrigo por combate) e os que mais
       oscilam entre famílias — 1,74 · 1,61 · 1,44 · 1,46 de PV parado.
       Concordam a 1000, mas com pouca folga; um limiar ali mede o
       nascimento do escudo, não o equilíbrio.
     · qualquer limiar sobre `danoSofrido`. É a única métrica em que as
       famílias DISCORDAM quando a amostra cresce (ver `AMOSTRA_DA_REGUA`).
     · qualquer limiar sobre `pvHeroi` ou `quedaDoHeroi` no `duro` e no
       `justo`. O herói cai em 98% a 100% dos combates: são métricas
       saturadas, e um limiar em cima de um teto não mede nada.
     · qualquer limiar sobre `primeiraQueda` no `brando` — ninguém cai,
       e a média de um conjunto vazio não é um número.
   ============================================================ */

import { turnoDosInimigos, turnoDosCompanheiros, resolverAtaque, danoDe, danoDaClasse, ataquesPorTurno, pvEsperadoJogador, testeDeMorte, aplicarTesteMorte } from "../src/combate.js";
import { garantirFichaCompanheiro } from "../src/companheiros.js";
import { completarInimigo } from "../src/bestiario.js";
import { absorverDano, efeitoDeBuff, firmarEfeito, efeitoEmConcentracao, quebrarConcentracao } from "../src/efeitos.js";
import { tickEfeitos } from "../src/regras-jogo.js";
import { tickCondicoes } from "../src/condicoes.js";
import { aflicaoDe, rolarAflicao } from "../src/aflicoes.js";
import { erguerGuarda, expirarGuardas } from "../src/habilidades.js";
import { elementoDaArma, perfilDe } from "../src/danos.js";
import { modDoGolpe } from "../src/itens.js";
import { DEFESA_DA_ARMADURA } from "../src/prontos.js";
import { testeConcentracao } from "../src/combate.js";

/* ============================================================
   1. AS TABELAS — se é número, é tabela
   ============================================================ */

/* Os dois cenários. Tudo o que decide a dureza da luta está aqui: não há
   um número de regra solto no corpo do simulador. */
export const CENARIOS_DA_REGUA = {
  duro: {
    id: "duro",
    diz: "quatro elites de nível 9 contra um grupo de nível 5 — o cerco que quase varre a mesa",
    /* O HERÓI VAI EQUIPADO, e isto não é enfeite: sem arma e sem armadura a
       defesa dele cai a 12 e os oito golpes de elite o derrubam na rodada 1
       em 99,5% dos combates — e aí a régua deixa de medir um grupo com herói
       e passa a medir três companheiros sozinhos. O kit é o da Muralha
       (`PRONTOS`, prontos.js) e os números da armadura saem de
       `DEFESA_DA_ARMADURA`, a tabela da casa: nenhum valor nasce aqui. */
    heroi: { nome: "Herói", classe: "Guerreiro", nivel: 5, vigor: 3, atributos: { forca: 3, destreza: 2, vigor: 3, intelecto: 0, presenca: 1, percepcao: 1 }, arma: "Espada Longa", armadura: "Cota de Malha", escudo: "Escudo Torre" },
    grupo: [
      { nome: "Mago", classe: "Mago", nivel: 5, vigor: 4, atributos: { forca: 0, destreza: 2, vigor: 4, intelecto: 3, presenca: 1, percepcao: 1 } },
      { nome: "Clériga", classe: "Clérigo", nivel: 5, vigor: 4, atributos: { forca: 2, destreza: 1, vigor: 4, intelecto: 1, presenca: 3, percepcao: 1 } },
      { nome: "Engenheiro", classe: "Engenheiro", nivel: 5, vigor: 4, atributos: { forca: 1, destreza: 3, vigor: 4, intelecto: 3, presenca: 0, percepcao: 1 } },
    ],
    inimigos: { quantos: 4, ameaca: "elite", nivel: 9, base: "Adversário" },
    tetoDeRodadas: 20,
  },
  /* ---------------- O TERCEIRO CENÁRIO, E POR QUE ELE EXISTE ----------------
     P3 mediu em DURO e BRANDO, e o próprio diário escreveu a leitura honesta
     do que isso custou: "o '+11,7% de PV restante' do cenário duro é real mas
     mede uma base de 2,6% do máximo — o grupo é quase varrido nos dois casos".
     É a definição de uma régua saturada. No duro de hoje o grupo perde 91% dos
     combates, 2,81 dos 3 companheiros caem e sobram 3 PV de 132: não há para
     onde a métrica descer. No brando ninguém cai NUNCA e sobra 94% do PV: não
     há para onde subir. Uma mudança de combate que passe nos dois extremos não
     provou nada — provou que os dois extremos não a enxergam.

     `justo` é o cenário onde a régua tem resolução nos dois sentidos: o grupo
     ganha metade das vezes, cai 1,8 dos 3, e sobra 19% do PV. Todo número tem
     folga para subir e para descer, e é nele que uma mudança de combate deve
     ser julgada. Os outros dois ficam: o duro porque é o retrato com que o
     diário já fala (é ele que carrega a continuidade com P3/T1), e o brando
     porque é o guarda da outra ponta — se um dia alguém CAIR no brando, algo
     quebrou em silêncio.

     A calibragem foi feita pela mesma régua, variando SÓ o outro lado da mesa
     (o grupo e o herói são os mesmos nos três): 4 elites nv9 dão 9% de
     vitória, nv7 dão 34%, nv6 dão 50%, 3 elites nv9 dão 78%. Nível 6 é o que
     põe a mesa no meio, e é o mesmo alvo que a catraca da arena persegue
     desde que existe — a faixa de 35% a 65%. */
  justo: {
    id: "justo",
    diz: "quatro elites de nível 6 — a mesa no meio, onde a régua enxerga os dois sentidos",
    heroi: null,
    grupo: null,
    inimigos: { quantos: 4, ameaca: "elite", nivel: 6, base: "Adversário" },
    tetoDeRodadas: 20,
  },
  brando: {
    id: "brando",
    diz: "três comuns de nível 5 contra o mesmo grupo — a luta que se ganha, para a régua ter os dois extremos",
    heroi: null,   /* preenchido abaixo: é o MESMO herói, e copiar seria deixar os dois divergirem */
    grupo: null,   /* idem */
    inimigos: { quantos: 3, ameaca: "comum", nivel: 5, base: "Adversário" },
    tetoDeRodadas: 20,
  },
};
/* O grupo e o herói são os MESMOS nos dois cenários de propósito: o que a
   régua compara é a dureza do outro lado da mesa, e mudar os dois lados de
   uma vez mediria duas coisas somadas. */
for (const id of ["justo", "brando"]) {
  CENARIOS_DA_REGUA[id].heroi = CENARIOS_DA_REGUA.duro.heroi;
  CENARIOS_DA_REGUA[id].grupo = CENARIOS_DA_REGUA.duro.grupo;
}

/* A AMOSTRA. `degraus` é a escada que prova onde cada métrica para de se
   mexer; `n` é o tamanho escolhido para o retrato; `familias` são as
   famílias independentes de sementes que provam a estabilidade — o mesmo
   recurso de `teste-arena.mjs`, onde uma amostra só prova sorte.

   POR QUE 1000, E POR QUE NÃO 2000. A escada foi rodada (100, 200, 500,
   1000, 2000) e as médias param de andar cedo: no cenário `justo`,
   `quedas` mexe 0,04 entre 500 e 2000 e `vitoria` mexe 0,01. O que ainda
   anda muito é a MARGEM, e é ela que decide o N.

   E é aqui que mora a lição de A4 e de C2b, agora medida: a 1000
   sementes as quatro famílias CONCORDAM em todas as treze métricas; a
   2000 elas passam a DISCORDAR em `danoSofrido` (as famílias estão a
   5,23 de distância e as margens somam 5,18). A amostra maior não achou
   uma diferença de jogo — achou o próprio resorteio, porque a precisão
   passou a ser mais fina do que a distância entre famílias. Medir mais
   fino do que o instrumento consegue repetir é medir o RNG.

   1000 é, portanto, o maior N em que a régua ainda concorda consigo
   mesma — e é onde ela fica. */
export const AMOSTRA_DA_REGUA = {
  degraus: [100, 200, 500, 1000, 2000],
  n: 1000,
  familias: ["umavida", "aa", "bb", "cc"],
  familiaDoRetrato: "umavida",
};

/* O intervalo de confiança. z de 95% — 1,96 é o número que toda margem
   desta casa usa, e ele mora aqui para ninguém copiá-lo à mão. */
export const INTERVALO_DE_CONFIANCA = { nivel: 0.95, z: 1.959964 };

/* ---------------- A CATRACA DE UMA VIDA ----------------
   O que esta tabela trava: que o grupo não fique FORTE DEMAIS nem FRACO
   DEMAIS no cenário onde a régua tem resolução. Três dentes, e os três
   mordem com evidências diferentes — desfecho, folga e preço —, porque
   uma mudança de combate pode mexer em um sem mexer nos outros.

   A FAIXA DE VITÓRIA É A LEI DA CASA, não um número novo: 35% a 65% é
   exatamente a faixa que `teste-arena.mjs` trava para todo pronto desde
   que a arena existe. Um segundo limiar para a mesma pergunta seria a
   casa discordando de si mesma.

   A FOLGA, MEDIDA E NÃO CHUTADA. Hoje (4 famílias × 1000 sementes):
     vitória      0,498 · 0,517 · 0,528 · 0,526   ± 0,031
     PV do grupo  24,98 · 25,35 · 27,24 · 27,70   ± 1,9   (de 132)
     quedas        1,82 ·  1,80 ·  1,75 ·  1,73   ± 0,08  (de 3)
   Cada limiar está a muitas margens do retrato: a vitória a ~4,5
   margens de cada borda, o teto de PV a ~4, o piso de quedas a ~7. É de
   propósito, e a lição é de A4 e C2b: limiar encostado no retrato fica
   vermelho por RESORTEIO — mede o embaralhamento do RNG, não o jogo.
   O teto tem de nomear uma MUDANÇA, não uma flutuação.

   AS DUAS SONDAS FORA DA FAIXA, para o limiar não ser cego: 4 elites de
   nível 7 dão 34,2% de vitória (abaixo do piso) e 3 elites de nível 9
   dão 77,6% (acima do teto). A faixa não é larga o bastante para tudo
   passar — foi medida.

   E QUANTO ELA AGUENTA, que é o número que B2 vai querer. Somando dano
   fixo a cada golpe do grupo no cenário `justo` (1000 sementes):

     +0   vitória 49,8%   quedas 1,822   PV do grupo 24,98
     +1   vitória 52,5%   quedas 1,746   PV do grupo 27,13
     +2   vitória 56,5%   quedas 1,659   PV do grupo 29,27
     +3   vitória 60,3%   quedas 1,563   PV do grupo 31,73

   Ou seja: cada ponto de dano por golpe vale ~3,5 pontos de vitória, e a
   catraca fica vermelha por volta de +4 ou +5. O bônus do companheiro de
   B2 tem esse teto para respeitar, e ele é número, não opinião. Note
   também que +1 já sai da margem no PV do grupo antes de sair na
   vitória — o PV é o dente mais SENSÍVEL, a vitória é o mais ESTÁVEL. */
export const CATRACA_DE_UMA_VIDA = {
  cenario: "justo",
  pisoDeVitoria: 0.35,
  tetoDeVitoria: 0.65,
  tetoDePvDoGrupo: 35,   /* de 132 — o retrato é 25 a 28 */
  pisoDeQuedas: 1.2,     /* de 3   — o retrato é 1,73 a 1,82 */
  familias: ["umavida", "aa", "bb", "cc"],
  sementesPorFamilia: 1000,
};

/* AS MÉTRICAS, e o que cada uma responde. `taxa: true` diz que o valor é
   uma proporção por combate (0..1) e a margem sai da fórmula de
   proporção; as outras são médias por combate.

   O CRITÉRIO DA ESCOLHA, que é o que B2 vai cobrar: uma métrica entra
   aqui se ela distingue "justo" de "forte demais" em alguma direção que
   as outras não cobrem.
     · `quedas` e `quedaDoHeroi` são o PREÇO — quanta gente o combate
       derruba. Grupo forte demais derruba menos.
     · `primeiraQueda` é QUANDO o preço aparece. Uma mudança pode não
       mudar quantos caem e mudar muito quando cai o primeiro, e é aí que
       mora a diferença entre uma luta tensa e uma luta decidida.
     · `pvGrupo` e `pvHeroi` são a FOLGA no fim — a métrica mais sensível
       a bônus ofensivo, porque matar mais cedo é apanhar menos.
     · `rodadas` é a DURAÇÃO. Grupo forte demais encurta a luta, e isso
       aparece antes de aparecer nas quedas.
     · `vitoria` e `tpk` são o DESFECHO — os dois extremos do que a mesa
       sente. Uma régua sem eles poderia aprovar um grupo que nunca perde.
     · `danoDesferido` e `danoSofrido` são os dois lados do relógio: é o
       par que separa "o grupo bate mais" de "o grupo apanha menos", e
       sem essa separação toda mudança vira um número só.
     · `absorvido` e `abrigos` existem porque a família `absorve` é a
       única defensiva com número hoje (P3), e é ela que B2 encosta.
     · `estourouTeto` é o guarda da própria régua: combate que bate no
       teto de rodadas não terminou, e uma medida cheia deles está
       medindo o teto, não o jogo. */
export const METRICAS_DA_REGUA = [
  { id: "quedas", diz: "companheiros que chegaram a 0 PV, por combate" },
  { id: "primeiraQueda", diz: "rodada da primeira queda de companheiro (só nos combates em que alguém cai)" },
  { id: "pvGrupo", diz: "PV do grupo somado, no fim do combate" },
  { id: "pvHeroi", diz: "PV do herói no fim do combate" },
  { id: "rodadas", diz: "rodadas até o combate acabar" },
  { id: "danoDesferido", diz: "dano que o herói e o grupo puseram nos inimigos" },
  { id: "danoSofrido", diz: "dano que o herói e o grupo levaram, já depois do abrigo" },
  { id: "absorvido", diz: "PV parados pelo abrigo (a família `absorve`)" },
  { id: "abrigos", diz: "abrigos que chegaram a morder" },
  { id: "vitoria", diz: "combates em que todo inimigo caiu", taxa: true },
  { id: "quedaDoHeroi", diz: "combates em que o herói chegou a 0 PV", taxa: true },
  { id: "tpk", diz: "combates em que herói e grupo inteiro ficaram no chão", taxa: true },
  { id: "estourouTeto", diz: "combates que bateram no teto de rodadas sem decidir", taxa: true },
];

/* ============================================================
   2. A SORTE TRAVADA — determinismo por semente
   ============================================================ */

/* O mesmo gerador de `arena.js`, palavra por palavra: FNV-1a na semente e
   um congruencial linear em cima. Está copiado e não importado porque
   `arena.js` não o exporta, e exportá-lo de lá seria mexer em produção
   numa etapa que prometeu não mexer. */
export function sorteDaSemente(semente) {
  let h = 2166136261;
  const s = String(semente || "regua");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  let k = h >>> 0;
  return () => { k = (Math.imul(k, 1103515245) + 12345) >>> 0; return (k >>> 8) / 16777216; };
}

/* Troca `Math.random` durante a simulação e o restaura no `finally`. É o
   recurso de `arena.js`: os motores rolam com `Math.random` cravado, e
   duplicar as fórmulas para semeá-las seria criar um segundo combate que
   diverge do primeiro na primeira versão que alguém esquecer de copiar. */
export function comSorteTravada(semente, fn) {
  const original = Math.random;
  Math.random = sorteDaSemente(semente);
  try { return fn(); } finally { Math.random = original; }
}

/* ============================================================
   3. A MESA — montar as fichas do cenário
   ============================================================ */

function fichaDoHeroi(cen) {
  const h = cen.heroi;
  const vidaMax = pvEsperadoJogador(h.nivel, h.vigor);
  const peca = (nome, tipo) => (nome ? { nome, tipo, ...(tipo === "arma" ? {} : { atributos: { defesa: DEFESA_DA_ARMADURA[nome] || 1 } }) } : null);
  const equipados = {};
  if (h.arma) equipados.arma = peca(h.arma, "arma");
  if (h.armadura) equipados.armadura = peca(h.armadura, "armadura");
  if (h.escudo) equipados.escudo = peca(h.escudo, "escudo");
  return {
    nome: h.nome, classe: h.classe, nivel: h.nivel,
    atributos: { ...h.atributos },
    vida: vidaMax, vidaMax,
    condicoes: [], efeitos: [], guardas: [], inventario: [],
    equipados, morrendo: false, morto: false, morte: { sucessos: 0, falhas: 0 },
  };
}

function fichaDoGrupo(cen) {
  return cen.grupo.map((g) => {
    const vidaMax = pvEsperadoJogador(g.nivel, g.vigor);
    return garantirFichaCompanheiro({
      nome: g.nome, classe: g.classe, nivel: g.nivel,
      atributos: { ...g.atributos },
      vida: vidaMax, vidaMax,
      condicoes: [], efeitos: [], guardas: [], inventario: [],
      equipados: {}, morrendo: false,
    });
  });
}

function fichasDosInimigos(cen) {
  const { quantos, ameaca, nivel, base } = cen.inimigos;
  const lista = [];
  for (let i = 0; i < quantos; i++) {
    lista.push({
      /* O PV SAI DO NÍVEL DO PRÓPRIO INIMIGO, e não do nível do herói.
         `completarInimigo` recebe `nivelJogador` porque na mesa o Narrador
         abre combate sem dizer nível, e o sistema escala o bicho ao herói.
         Aqui o nível ESTÁ dito — é o que a tabela declara —, e passar o do
         herói faria o campo `nivel: 9` não decidir coisa nenhuma: um elite
         de nível 9 e um de nível 5 sairiam com os mesmos 59 PV, e o cenário
         duro seria duro só no nome.
         É também o que reconstrói o molde de P3/T1: com 99 PV por elite a
         régua mede 545 quedas e a primeira queda na rodada 4,41 (P3: 566 e
         4,41 antes do abrigo); com 59 PV mediria 289 e 3,73, e nenhum dos
         dois números de lá ficaria de pé. */
      ...completarInimigo({ nome: `${base} ${i + 1}`, ameaca, nivel }, nivel),
      derrotado: false, condicoes: [],
    });
  }
  return lista;
}

/* ============================================================
   4. AS PORTAS — as mesmas do App, uma por sítio
   ============================================================ */

/* O abrigo come o golpe antes do PV (App.jsx:13653 e :13684). Devolve a
   ficha nova, o dano que sobrou e quanto foi parado. */
function passarPeloAbrigo(quem, dano) {
  const ab = absorverDano(quem, dano);
  if (!ab || !(ab.absorvido > 0)) return { pers: quem, dano, absorvido: 0 };
  return { pers: ab.pers, dano: ab.dano, absorvido: ab.absorvido };
}

/* E a magia que ele segurava cai depois (App.jsx:13701, `segurarOuPerder`).
   Com o dano que SOBROU do abrigo, e só em quem ficou de pé. */
function segurarOuPerder(quem, dano) {
  if (!quem || !(dano > 0)) return quem;
  const segurada = efeitoEmConcentracao(quem);
  if (!segurada) return quem;
  const tc = testeConcentracao(dano, (quem.atributos || {}).vigor || 0, segurada.nome);
  return tc.manteve ? quem : quebrarConcentracao(quem, segurada.nome);
}

/* O BUFF DO COMPANHEIRO, pelo molde de `buffDeCompanheiro` (App.jsx:7942):
   a condição pela aflição, e o efeito (onde mora `absorve`) firmado em
   quem conjurou. Devolve {grupo, heroi} novos — nunca muta. */
function aplicarBuffDeCompanheiro(heroi, grupo, ac) {
  const port = aflicaoDe(`${ac.habilidade.nome} ${ac.habilidade.descricao || ""}`);
  if (!port || port.alvo === "alvo") return { heroi, grupo };
  const res = rolarAflicao({ fonte: port, nomeFonte: ac.habilidade.nome, atacante: ac.companheiro, sempre: true });
  if (!res || !res.aplicou) return { heroi, grupo };
  const semRepetir = (lista) => (lista || []).filter((x) => x.id !== res.cond.id);
  let h = heroi, g = grupo;
  if (port.alvo === "aliados") {
    h = { ...h, condicoes: [...semRepetir(h.condicoes), res.cond] };
    g = g.map((c) => ((c.vida || 0) > 0 ? { ...c, condicoes: [...semRepetir(c.condicoes), res.cond] } : c));
  } else {
    g = g.map((c) => (c.nome === ac.companheiro ? { ...c, condicoes: [...semRepetir(c.condicoes), res.cond] } : c));
  }
  if (res.cond.tipo === "bom") {
    const comp = g.find((c) => c && c.nome === ac.companheiro);
    if (comp) {
      const buff = efeitoDeBuff(ac.habilidade, comp, res.cond.turnos);
      const fe = firmarEfeito(comp, buff.efeito);
      g = g.map((c) => (c && c.nome === ac.companheiro ? fe.pers : c));
    }
  }
  return { heroi: h, grupo: g };
}

/* ============================================================
   5. UM COMBATE
   ============================================================ */

/* Devolve o retrato de UM combate. `semente` é o único árbitro: a mesma
   semente dá o mesmo combate em qualquer máquina. */
export function simularCombate(cenario, semente) {
  const cen = typeof cenario === "string" ? CENARIOS_DA_REGUA[cenario] : cenario;
  if (!cen) throw new Error("cenário desconhecido: " + cenario);
  return comSorteTravada(semente, () => {
    let heroi = fichaDoHeroi(cen);
    let grupo = fichaDoGrupo(cen);
    let inimigos = fichasDosInimigos(cen);

    const pvGrupoMax = grupo.reduce((s, g) => s + g.vidaMax, 0);
    const caidos = new Set();
    let primeiraQueda = null, quedaDoHeroi = null;
    let danoDesferido = 0, danoSofrido = 0, absorvido = 0, abrigos = 0;
    let rodada = 1;

    const vivosInimigos = () => inimigos.filter((e) => !e.derrotado && (e.vida || 0) > 0);
    const grupoDePe = () => grupo.filter((g) => (g.vida || 0) > 0);
    /* a queda é anotada no instante em que acontece, e uma vez só: um
       companheiro que cai, é curado e cai de novo não conta duas vezes —
       "quedas" mede quanta gente o combate derruba, não quantas vezes. */
    const anotarQuedas = () => {
      for (const g of grupo) {
        if ((g.vida || 0) <= 0 && !caidos.has(g.nome)) {
          caidos.add(g.nome);
          if (primeiraQueda === null) primeiraQueda = rodada;
        }
      }
      if ((heroi.vida || 0) <= 0 && quedaDoHeroi === null) quedaDoHeroi = rodada;
    };

    const ferirInimigo = (nome, dano) => {
      inimigos = inimigos.map((e) => {
        if (e.nome !== nome) return e;
        const pv = Math.max(0, (e.vida || 0) - dano);
        return { ...e, vida: pv, derrotado: pv <= 0 };
      });
    };

    for (; rodada <= cen.tetoDeRodadas; rodada++) {
      if (!vivosInimigos().length) break;

      /* ---- 1. O HERÓI (App.jsx:11566-11645) ---- */
      if ((heroi.vida || 0) > 0) {
        const nAtaques = ataquesPorTurno(heroi.classe, heroi.nivel);
        const arma = heroi.equipados && heroi.equipados.arma;
        const bonusAtk = modDoGolpe(heroi, arma) + 2 + Math.floor((heroi.nivel - 1) / 4);
        for (let i = 0; i < nAtaques; i++) {
          const vivos = vivosInimigos();
          if (!vivos.length) break;
          const alvo = [...vivos].sort((a, b) => (a.vida || 0) - (b.vida || 0))[0];
          const r = resolverAtaque({
            atacante: heroi.nome, alvo, ehAtacanteInimigo: false,
            bonusAtaque: bonusAtk,
            danoBase: danoDaClasse(heroi.classe, heroi.nivel, Math.round(danoDe(heroi, false) / 2)),
            condAtacante: heroi.condicoes || [], condAlvo: alvo.condicoes || [],
            tipoDano: elementoDaArma(heroi), perfilAlvo: perfilDe(alvo),
          });
          if (r.dano > 0) { ferirInimigo(alvo.nome, r.dano); danoDesferido += r.dano; }
        }
      }
      if (!vivosInimigos().length) break;

      /* ---- 2. OS INIMIGOS ---- */
      const acoes = turnoDosInimigos({
        inimigos: vivosInimigos(), jogador: heroi, grupo: grupoDePe(),
        gdJogador: 0, grade: null, heroi: null, aliados: [],
        rodada, provocado: false, prioridade: "",
      });
      for (const a of acoes) {
        if (!(a.r && a.r.dano > 0)) continue;
        if (a.alvoRef === "jogador") {
          const ab = passarPeloAbrigo(heroi, a.r.dano);
          if (ab.absorvido > 0) { absorvido += ab.absorvido; abrigos++; heroi = ab.pers; }
          heroi = { ...heroi, vida: Math.max(0, (heroi.vida || 0) - ab.dano) };
          danoSofrido += ab.dano;
        } else if (a.alvoRef === "grupo") {
          const dono = grupo.find((g) => g.nome === a.alvoNome);
          if (!dono || (dono.vida || 0) <= 0) continue;
          const ab = passarPeloAbrigo(dono, a.r.dano);
          if (ab.absorvido > 0) { absorvido += ab.absorvido; abrigos++; }
          const pv = Math.max(0, (dono.vida || 0) - ab.dano);
          const depois = segurarOuPerder({ ...ab.pers, vida: pv }, pv > 0 ? ab.dano : 0);
          grupo = grupo.map((g) => (g.nome === a.alvoNome ? depois : g));
          danoSofrido += ab.dano;
        }
      }
      anotarQuedas();

      /* ---- 3. O HERÓI CAÍDO ROLA A MORTE ---- */
      if ((heroi.vida || 0) <= 0 && !heroi.morto) {
        const ap = aplicarTesteMorte(heroi.morte, testeDeMorte());
        heroi = {
          ...heroi, morte: { sucessos: ap.sucessos, falhas: ap.falhas },
          morrendo: ap.desfecho === "morrendo",
          morto: ap.desfecho === "morto",
          vida: ap.desfecho === "revive" ? 1 : heroi.vida,
        };
      }

      /* ---- 4. O GRUPO ---- */
      const acoesComp = turnoDosCompanheiros({
        grupo: grupoDePe(), inimigos: vivosInimigos(),
        jogadorCaido: (heroi.vida || 0) <= 0, jogadorNome: heroi.nome,
        jogador: heroi, rodada, provocado: false, comFuria: [],
      });
      for (const ac of acoesComp) {
        const gastar = (custo) => {
          if (!custo) return;
          grupo = grupo.map((g) => (g.nome === ac.companheiro ? { ...g, mana: Math.max(0, (g.mana || 0) - custo) } : g));
        };
        if ((ac.tipo === "ataque" || ac.tipo === "habilidade") && ac.r) {
          if (ac.r.dano > 0) { ferirInimigo(ac.alvoNome, ac.r.dano); danoDesferido += ac.r.dano; }
          gastar(ac.custo);
        } else if (ac.tipo === "cura") {
          const valor = ac.valor || 0;
          if (ac.alvo === heroi.nome) {
            const vivo = (heroi.vida || 0) > 0 || valor > 0;
            heroi = { ...heroi, vida: Math.min(heroi.vidaMax, Math.max(0, heroi.vida) + valor), morrendo: vivo ? false : heroi.morrendo, morte: { sucessos: 0, falhas: 0 } };
          } else {
            grupo = grupo.map((g) => (g.nome === ac.alvo ? { ...g, vida: Math.min(g.vidaMax, Math.max(0, g.vida) + valor), morrendo: false } : g));
          }
          gastar(ac.custo);
        /* NÃO HÁ RAMO DE POÇÃO, e isso é de propósito: os companheiros da
           régua nascem de bolsa vazia (`garantirFichaCompanheiro` não dá
           inventário a ninguém), então `melhorCuraPara` nunca acha nada e
           `decidirAcaoCompanheiro` nunca emite `tipo: "pocao"`. Escrever o
           ramo seria escrever fiação para um caso que a tabela desta régua
           torna impossível — e quem um dia der bolsa ao grupo aqui vai
           precisar dele, e desta linha para saber que ele falta. */
        } else if (ac.tipo === "buff" && ac.habilidade) {
          const r = aplicarBuffDeCompanheiro(heroi, grupo, ac);
          heroi = r.heroi; grupo = r.grupo;
          gastar(ac.custo);
        } else if (ac.tipo === "guarda" && ac.habilidade) {
          const comp = grupo.find((g) => g.nome === ac.companheiro);
          const g5 = comp ? erguerGuarda(comp, ac.habilidade, rodada) : null;
          if (g5 && g5.ok) {
            grupo = grupo.map((g) => (g.nome === ac.companheiro ? g5.pers : g));
            gastar(ac.custo);
          }
        }
      }

      /* ---- 5. OS RELÓGIOS (App.jsx:8246-8332) ---- */
      const te = tickEfeitos(heroi);
      heroi = { ...heroi, efeitos: te.efeitos };
      grupo = grupo.map((g) => (((g.efeitos || []).filter(Boolean).length) ? { ...g, efeitos: tickEfeitos(g).efeitos } : g));
      if ((heroi.condicoes || []).length) {
        const t = tickCondicoes(heroi.condicoes);
        const pv = t.dano > 0 && (heroi.vida || 0) > 0 ? Math.max(0, (heroi.vida || 0) - t.dano) : heroi.vida;
        heroi = { ...heroi, condicoes: t.condicoes, vida: pv };
        if (t.dano > 0) danoSofrido += t.dano;
      }
      /* O GRUPO NÃO COBRA DANO DE CONDIÇÃO, e isso não é esquecimento: é a
         fronteira que T1 decidiu e escreveu no diário — companheiro morrendo
         de veneno é um jeito NOVO de o jogador perder um companheiro, e isso
         é decisão da pessoa, não de etapa. O relógio anda; a cobrança não. */
      grupo = grupo.map((g) => ((g.condicoes || []).length ? { ...g, condicoes: tickCondicoes(g.condicoes).condicoes } : g));
      inimigos = inimigos.map((e) => {
        if (!((e.condicoes || []).length) || e.derrotado) return e;
        const t = tickCondicoes(e.condicoes);
        const pv = t.dano > 0 ? Math.max(0, (e.vida || 0) - t.dano) : e.vida;
        if (t.dano > 0) danoDesferido += Math.min(t.dano, e.vida || 0);
        return { ...e, condicoes: t.condicoes, vida: pv, derrotado: pv <= 0 };
      });
      /* a guarda vence por RODADA, e é o único relógio da luta */
      const eg = expirarGuardas(heroi, rodada + 1);
      heroi = eg && eg.pers ? eg.pers : heroi;
      grupo = grupo.map((g) => {
        const r = expirarGuardas(g, rodada + 1);
        return r && r.pers ? r.pers : g;
      });

      anotarQuedas();
      /* acabou quando um dos lados não tem mais ninguém de pé */
      if (!vivosInimigos().length) break;
      if ((heroi.vida || 0) <= 0 && !grupoDePe().length) break;
    }
    const duracao = Math.min(rodada, cen.tetoDeRodadas);
    const venceu = !vivosInimigos().length;
    const tpk = (heroi.vida || 0) <= 0 && !grupoDePe().length;

    return {
      rodadas: duracao,
      quedas: caidos.size,
      primeiraQueda,
      pvGrupo: grupo.reduce((s, g) => s + Math.max(0, g.vida || 0), 0),
      pvGrupoMax,
      pvHeroi: Math.max(0, heroi.vida || 0),
      pvHeroiMax: heroi.vidaMax,
      danoDesferido, danoSofrido, absorvido, abrigos,
      vitoria: venceu ? 1 : 0,
      quedaDoHeroi: quedaDoHeroi === null ? 0 : 1,
      rodadaDaQuedaDoHeroi: quedaDoHeroi,
      tpk: tpk ? 1 : 0,
      estourouTeto: !venceu && !tpk ? 1 : 0,
    };
  });
}

/* ============================================================
   6. A MARGEM — média ± meia-largura do intervalo de 95%
   ============================================================ */

/* Média e margem de uma amostra de números. A margem é z · erro padrão da
   média (desvio amostral, com n−1 no denominador). Amostra de um só
   elemento não tem margem: devolve Infinity, que é a verdade — não que
   seja precisa. */
export function mediaComMargem(valores) {
  const xs = (valores || []).filter((x) => Number.isFinite(x));
  const n = xs.length;
  if (!n) return { media: 0, margem: Infinity, n: 0, desvio: 0 };
  const media = xs.reduce((s, x) => s + x, 0) / n;
  if (n < 2) return { media, margem: Infinity, n, desvio: 0 };
  const variancia = xs.reduce((s, x) => s + (x - media) ** 2, 0) / (n - 1);
  const desvio = Math.sqrt(variancia);
  return { media, margem: INTERVALO_DE_CONFIANCA.z * desvio / Math.sqrt(n), n, desvio };
}

/* O mesmo para uma TAXA: k acertos em n tentativas. A margem sai da
   fórmula da proporção, não da média — usar a da média num 0/1 daria
   quase o mesmo número por acidente aritmético e mentiria nas pontas
   (p = 0 ou p = 1), onde o desvio amostral é zero e a incerteza não é. */
export function proporcaoComMargem(k, n) {
  if (!n) return { media: 0, margem: Infinity, n: 0 };
  const p = k / n;
  /* nas pontas, a margem de Wald é zero e isso é falso. O recuo é o
     intervalo de regra de três de Laplace (3/n), que é o limite superior
     conhecido para p = 0 com 95% — margem honesta em vez de margem nula. */
  const margem = (k === 0 || k === n) ? 3 / n : INTERVALO_DE_CONFIANCA.z * Math.sqrt(p * (1 - p) / n);
  return { media: p, margem, n };
}

/* Duas medidas CONCORDAM quando cada uma cai dentro da margem somada da
   outra — que é o mesmo que perguntar se a diferença entre elas é menor
   que a soma das margens. É a prova de estabilidade entre famílias de
   sementes: se duas famílias independentes discordam, a régua está
   medindo o resorteio. */
export function concordam(a, b) {
  if (!a || !b) return false;
  return Math.abs(a.media - b.media) <= (a.margem + b.margem);
}

/* ============================================================
   7. A MEDIDA — n combates de um cenário
   ============================================================ */

/* Roda `n` combates do cenário e devolve, por métrica, {media, margem, n}.
   `prefixo` escolhe a FAMÍLIA de sementes; uma família só é uma amostra, e
   o que prova estabilidade é o acordo entre famílias independentes. */
export function medir(cenarioId, { n = AMOSTRA_DA_REGUA.n, prefixo = AMOSTRA_DA_REGUA.familiaDoRetrato } = {}) {
  const combates = [];
  for (let i = 0; i < n; i++) combates.push(simularCombate(cenarioId, `${prefixo}|${i}`));
  const out = { cenario: cenarioId, prefixo, combates: n };
  for (const m of METRICAS_DA_REGUA) {
    if (m.taxa) {
      out[m.id] = proporcaoComMargem(combates.reduce((s, c) => s + (c[m.id] || 0), 0), n);
    } else if (m.id === "primeiraQueda") {
      /* só os combates em que alguém caiu: a média de "em que rodada cai o
         primeiro" sobre combates sem queda nenhuma seria média de nada. */
      out[m.id] = mediaComMargem(combates.map((c) => c.primeiraQueda).filter((x) => x !== null));
    } else {
      out[m.id] = mediaComMargem(combates.map((c) => c[m.id]));
    }
  }
  out.pvGrupoMax = combates.length ? combates[0].pvGrupoMax : 0;
  out.pvHeroiMax = combates.length ? combates[0].pvHeroiMax : 0;
  return out;
}

/* A linha pronta de uma métrica, para relato e diário: "12,34 ± 0,56". */
export function linhaDaMetrica(x, casas = 2) {
  if (!x) return "—";
  const f = (v) => (Number.isFinite(v) ? v.toFixed(casas).replace(".", ",") : "∞");
  return `${f(x.media)} ± ${f(x.margem)}`;
}
