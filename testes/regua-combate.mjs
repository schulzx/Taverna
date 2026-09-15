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

     rodada da 1ª queda   4,72  ·  T1 mediu 4,41 (antes) e 4,64 (depois)
     quedas               556   ·  T1 mediu 566 (antes) e 563 (depois)
     PV restante do grupo 835   ·  T1 mediu 675 (antes) e 754 (depois)
     brando, quedas         0   ·  T1 mediu 0 nos dois
     brando, PV restante 94,5%  ·  T1 mediu 91,7% e 93,3%

   Os três primeiros caem em cima — e caíram DEPOIS do conserto da ordem do
   teste de morte (ver o passo 4 do laço): antes dele a régua media 4,41 ·
   545 · 969, e o que parecia acordo na 1ª queda era acordo por engano.

   ---------------- A ABSORÇÃO NÃO DIVERGE: NÃO É COMPARÁVEL ----------------

   ESTE PARÁGRAFO ACUSAVA UMA DIVERGÊNCIA QUE NÃO EXISTE, e a acusação
   custou um ciclo inteiro caçando um fantasma. Ele dizia que a régua
   "ainda diverge com clareza" na absorção — 396 parados em 66 abrigos,
   contra os 918 em 153 de P3 — e mandava procurar de onde vinham os outros
   noventa abrigos. Não vêm de lugar nenhum: a CONTAGEM do abrigo depende de
   dois parâmetros de fiação que o diário de P3/T1 nunca registrou, e cada um
   deles sozinho move mais do que a diferença toda. Medido, nesta régua:

     · O KIT DO HERÓI é escolha DESTA régua (o porquê está em
       `CENARIOS_DA_REGUA.duro`, logo abaixo), não herança de P3. Tirando o
       kit e não mexendo em mais nada, o duro vai de 66 para 33 abrigos —
       metade, só por isso.
     · A ORDEM DO GRUPO NA RODADA. Com o grupo agindo ANTES dos inimigos, a
       mesma régua mede 159 abrigos e 954 PV parados — que é exatamente o
       "954/159" que P3 registrou como sua PRIMEIRA medição
       (`mente/diario.md`, no bloco de P3). Ou seja: o número perdido é
       alcançável, e o molde que o alcança é o que o App CONTRADIZ
       (`resolverRevide` roda `turnoDosInimigos` em App.jsx:13591 e só então
       `turnoDosCompanheiros` em :13830). O molde errado é o de lá.

   E ESTA RÉGUA É MAIS NOVA QUE P3, o que fecha a conta pelo outro lado: ela
   compõe o `efeitos.js` de HOJE, com C2b (`segurarOuPerder` no companheiro)
   e C3 (o teto de concentração) — duas regras que não existiam em v9.233,
   quando 918/153 foi medido, e que derrubam abrigo. Custo medido das duas
   juntas: no brando, 40 abrigos viram 30.

   E O NÚMERO QUE TIRA ISSO DO CAMINHO DE B2, que é o que importa: a absorção
   INTEIRA, de zero a cheia, vale 3,6 pontos de vitória e 2,10 PV no `justo`
   (sem abrigo nenhum: 48,5% e 23,78, contra 52,1% e 25,88). DOBRÁ-LA — que é
   o tamanho exato da disputa 378 contra 918 — custa 1,2 ponto de vitória e
   1,02 PV: menos de uma margem em cada um dos dois dentes (± 0,031 e ± 1,9).
   Para que lado caísse a dúvida, a linha de base de B2 não se moveria o
   bastante para mudar um veredito. A peça fica visível na suíte como
   `pendente`, e continua sem virar limiar — pelo motivo de sempre: ela mede
   o nascimento do escudo, não o equilíbrio.

   O que a régua garante — e é o que importa a partir de agora — é que a
   MESMA régua meça o antes e o depois de cada mudança.

   ---------------- AVISO DE N1b: OS NÚMEROS ACIMA SÃO DE UMA RÉGUA SEM
   ADVERSÁRIO ----------------

   TUDO O QUE ESTE CABEÇALHO CITA COMO RETRATO — 52,1% de vitória, 25,88 PV,
   1,790 quedas, a escada do bônus ofensivo, as duas sondas fora da faixa, o
   custo da absorção — foi medido com `prioridade: ""` no `turnoDosInimigos`,
   isto é, com a oposição SEM VONTADE. O jogo passa a intenção
   (App.jsx:13606), e `combate.js:279` só consulta `escolherAlvo` quando ela
   existe. O porquê inteiro, e o parâmetro que reproduz a medida antiga, estão
   em `ADVERSARIO_NA_REGUA`, mais abaixo. Leia aqueles números como a HISTÓRIA
   de B1/B1b/B2/T1 (`comAdversario: false`), nunca como o retrato de hoje.

   A ordem da rodada, e de onde cada passo veio:
     1. o herói ataca            (App.jsx:11566-11645 — `ataquesPorTurno`
                                  golpes de `danoDaClasse`)
     2. os inimigos atacam       (a intenção da vez decide em quem — v. o
                                  bloco N1b dentro de `simularCombate`;
                                  `turnoDosInimigos`; o dano passa pelo
                                  abrigo antes do PV, App.jsx:13653/13684,
                                  e a concentração do companheiro cai
                                  depois, App.jsx:13701)
     3. o grupo age              (`turnoDosCompanheiros`, e o buff nasce
                                  pelo molde de `buffDeCompanheiro`,
                                  App.jsx:7942)
     4. o herói caído rola morte (`testeDeMorte`/`aplicarTesteMorte`; é
                                  `resolverQueda`, App.jsx:13940, e ela roda
                                  DEPOIS do turno dos companheiros —
                                  App.jsx:13830 —, não antes)
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
       arena. Retrato 51,1 a 54,2%, 3,5 margens do teto e 5,2 do piso.
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
       mais ralos da régua (0,24 a 0,29 abrigo por combate) e os que mais
       oscilam entre famílias — 1,75 · 1,57 · 1,55 · 1,43 de PV parado —, e
       são os DOIS MAIS APERTADOS da régua inteira: a 1000, as duas famílias
       mais distantes ficam a 0,94 da soma das próprias margens, a um décimo
       de discordar. Um limiar ali mede o nascimento do escudo, não o
       equilíbrio — e a CONTAGEM ainda por cima não é portável entre
       reconstruções (ver o bloco da absorção, acima).
     · qualquer limiar sobre `danoSofrido`. A terceira mais apertada (0,79
       da soma das margens a 1000), e a única do par ofensivo/defensivo que
       chega perto de discordar: um limiar ali mede o resorteio antes de
       medir o jogo.
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
import { testeConcentracao, perfilCombate } from "../src/combate.js";
import { intencaoDaVez, menteDaCriatura } from "../src/adversario.js";
import { PESO_AMEACA } from "../src/orcamento.js";

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
     É a definição de uma régua saturada. No duro de hoje o grupo perde 91,2%
     dos combates, 2,82 dos 3 companheiros caem e sobram 3,11 PV de 132: não há
     para onde a métrica descer. No brando ninguém cai NUNCA e sobra 94% do PV: não
     há para onde subir. Uma mudança de combate que passe nos dois extremos não
     provou nada — provou que os dois extremos não a enxergam.

     `justo` é o cenário onde a régua tem resolução nos dois sentidos: o grupo
     ganha 52,1% das vezes, cai 1,79 dos 3, e sobra 19,6% do PV. Todo número tem
     folga para subir e para descer, e é nele que uma mudança de combate deve
     ser julgada. Os outros dois ficam: o duro porque é o retrato com que o
     diário já fala (é ele que carrega a continuidade com P3/T1), e o brando
     porque é o guarda da outra ponta — se um dia alguém CAIR no brando, algo
     quebrou em silêncio.

     A calibragem foi feita pela mesma régua, variando SÓ o outro lado da mesa
     (o grupo e o herói são os mesmos nos três): 4 elites nv9 dão 8,8% de
     vitória, nv7 dão 36,3%, nv6 dão 52,1%, 3 elites nv9 dão 77,9%. Nível 6 é o que
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
   `quedas` mexe 0,06 entre 500 e 2000 e `vitoria` mexe 0,015. O que ainda
   anda muito é a MARGEM, e é ela que decide o N.

   E É AQUI QUE A LIÇÃO DE A4 E DE C2b MUDOU DE FORMA, e a nota é honesta
   porque o número mudou. Esta linha dizia que a 2000 as famílias passavam a
   DISCORDAR em `danoSofrido`; depois do conserto da ordem do teste de morte
   isso deixou de ser verdade — a 2000 as quatro CONCORDAM em todas as treze
   métricas, e a mais apertada passou a ser `absorvido`/`abrigos` (as duas
   famílias mais distantes a 0,75 da soma das próprias margens; `danoSofrido`
   caiu para 0,59). A 1000 a mais apertada é a mesma dupla, a 0,94 — a um
   décimo de discordar.

   1000 FICA MESMO ASSIM, e agora pelo motivo que sempre foi o verdadeiro: o
   que a amostra maior compra é precisão, e precisão mais fina do que a
   distância entre famílias mede o RNG, não o jogo. O sinal disso é a dupla
   `absorvido`/`abrigos`, que a 1000 já está a 0,94 de discordar consigo
   mesma: subir o N estreitaria a margem de todo mundo e poria a régua a
   afirmar diferenças do tamanho do próprio embaralhamento. O degrau maior
   fica na escada como prova de que ele foi rodado, não como o N escolhido. */
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
     vitória      0,521 · 0,511 · 0,527 · 0,542   ± 0,031
     PV do grupo  25,88 · 26,35 · 26,52 · 28,06   ± 1,9 a 2,0  (de 132)
     quedas        1,790 · 1,773 · 1,768 · 1,740  ± 0,08  (de 3)
   A folga de cada limiar, em margens: a vitória a 5,20–6,22 do piso e a
   3,50–4,49 do teto, o teto de PV a 3,45–4,80, o piso de quedas a
   6,69–7,41. É de propósito, e a lição é de A4 e C2b: limiar encostado no
   retrato fica vermelho por RESORTEIO — mede o embaralhamento do RNG, não
   o jogo. O teto tem de nomear uma MUDANÇA, não uma flutuação.

   E NENHUM DOS TRÊS LIMIARES FOI MEXIDO quando o conserto da ordem do teste
   de morte subiu o retrato (a vitória de 49,8% para 52,1%, o PV de 24,98
   para 25,88). A folga menor encolheu de 3,70 para 3,45 margens, e a
   tentação era comprar de volta os dois décimos subindo o teto de PV de 35
   para 36 — e isso é AFROUXAR UM DENTE por cosmética. O que a suíte cobra é
   folga maior que 2 margens, e 3,45 passa longe; a faixa 35%–65% é lei da
   casa e não se move por conveniência de nenhuma etapa. Fica o número
   medido, não o número confortável.

   AS DUAS SONDAS FORA DA FAIXA, para o limiar não ser cego: 4 elites de
   nível 8 dão 21,3% de vitória (abaixo do piso) e 3 elites de nível 9 dão
   77,9% (acima do teto). E o que MUDOU aqui é informação, não conserto: 4
   elites de nível 7 davam 34,2% e agora dão 36,3% — um nível inteiro de
   dureza passou a CABER na faixa, por 1,3 ponto. A faixa continua não sendo
   larga o bastante para tudo passar, mas a menor mudança que ela pega hoje
   é de dois níveis, e isso está escrito para ninguém redescobrir.

   E QUANTO ELA AGUENTA, que é o número que B2 vai querer. Somando dano
   fixo a cada golpe do grupo no cenário `justo` (1000 sementes):

     +0   vitória 52,1%   quedas 1,790   PV do grupo 25,88
     +1   vitória 55,1%   quedas 1,703   PV do grupo 28,21
     +2   vitória 58,4%   quedas 1,610   PV do grupo 30,41
     +3   vitória 61,3%   quedas 1,530   PV do grupo 32,47
     +4   vitória 64,0%   quedas 1,471   PV do grupo 34,24
     +5   vitória 66,6%   quedas 1,380   PV do grupo 36,84

   Ou seja: cada ponto de dano por golpe vale ~2,9 pontos de vitória, e a
   catraca fica vermelha em +5 — nos DOIS dentes ao mesmo tempo (66,6% passa
   do teto de 65% e 36,84 passa do teto de 35 PV). +4 ainda é verde, e por
   pouco. O bônus do companheiro de B2 tem esse teto para respeitar, e ele é
   número, não opinião. Note também que +1 já sai da margem no PV do grupo
   antes de sair na vitória — o PV é o dente mais SENSÍVEL, a vitória é o
   mais ESTÁVEL. */
export const CATRACA_DE_UMA_VIDA = {
  cenario: "justo",
  pisoDeVitoria: 0.35,
  tetoDeVitoria: 0.65,
  tetoDePvDoGrupo: 35,   /* de 132 — o retrato é 25 a 28 */
  pisoDeQuedas: 1.2,     /* de 3   — o retrato é 1,73 a 1,82 */
  familias: ["umavida", "aa", "bb", "cc"],
  sementesPorFamilia: 1000,
};

/* ---------------- O ADVERSÁRIO, E O QUE CUSTOU NÃO TÊ-LO (N1b) ----------------

   O DEFEITO, ESCRITO INTEIRO PORQUE ELE É A LIÇÃO. Até N1b esta régua
   passava `prioridade: ""` ao `turnoDosInimigos`. O jogo real NÃO passa: em
   `App.jsx:13606` a chamada carrega
   `prioridade: (intencaoPorId(intencaoRef.current) || {}).alvo || ""`, e do
   outro lado `combate.js:279` só consulta `escolherAlvo` QUANDO a prioridade
   existe — sem ela, o alvo cai no sorteio de sempre (35% de chance de bater
   num companheiro qualquer, `combate.js:286`). Ou seja: a régua media um
   combate em que a oposição não tem vontade, e o jogo tem. B1, B1b, B2 e T1
   mediram Uma Vida com o Adversário FORA DO CIRCUITO — quatro etapas de
   número contra um motor que o jogador nunca jogou.

   UM INSTRUMENTO QUE DIFERE DO JOGO EM SILÊNCIO É PIOR QUE NENHUM
   INSTRUMENTO. Nenhum teste ficou vermelho, nenhuma suíte reclamou, e o
   retrato inteiro (52,1% de vitória, 25,88 PV, 1,790 quedas) descreveu com
   três casas decimais uma coisa que não existe. A régua não mentiu por erro
   de conta: mentiu por uma porta que ela simplesmente não ligou. É por isso
   que a asserção que faltava — e que agora existe na suíte — é pelo EFEITO:
   ligado e desligado têm de dar resultados DIFERENTES na mesma semente.

   O CAMINHO, IGUAL AO DO APP: `lutaDaMesa()` (o bloco termina em
   `App.jsx:6155`) monta a situação a partir do combate de verdade, e
   `intencaoDaLuta()` (`App.jsx:6160-6168`) chama
   `intencaoDaVez(s, { antes: intencaoRef.current })` — com MEMÓRIA POR
   COMBATE: `antes` é o id da intenção da rodada anterior, e sem ela a
   oposição troca de plano toda vez que um número oscila, que é exatamente o
   defeito que `adversario.js` existe para consertar.

   `comAdversario: false` REPRODUZ A MEDIDA ANTIGA, byte a byte, e isso não é
   nostalgia: B1, B1b, B2 e T1 estão escritos no diário com os números de
   então, e uma régua que apagasse o caminho para eles faria a história da
   casa passar a mentir junto. É parâmetro nomeado e com leitor (a suíte usa
   os dois lados), nunca um literal solto no corpo do simulador.

   O QUE A RÉGUA NÃO TEM, E POR QUE FICA NO DEFAULT DE `garantirLuta`. A
   situação da luta tem duas metades: o COMBATE (quantos estão de pé, quanto
   de vida sobrou, quem conjura, quem cura, quem caiu) e o MUNDO (o terreno, a
   fama, a masmorra, o refém, o vilão, a postura, o público, a emboscada).
   Esta régua mede o combate — não há mesa, não há mundo, não há campanha
   por trás dela. Inventar aqui um "está escuro" ou um "há um refém" seria
   pôr um NÚMERO DE REGRA SOLTO no instrumento: um valor que decide o
   resultado, que ninguém escolheu e que nenhuma tabela do jogo declara. O
   default explícito de `garantirLuta` é a única resposta honesta — e ele é
   explícito, o que é diferente de esquecido.

   O PREÇO DISSO, EM NOME PRÓPRIO: as intenções abaixo NÃO PODEM ser eleitas
   nesta régua, e a Fase N precisa saber disso antes de concluir qualquer
   coisa sobre o acervo. Não é bug — é o alcance declarado do instrumento. */
export const ADVERSARIO_NA_REGUA = {
  /* o default de `medir`/`simularCombate`: o jogo tem Adversário, logo a
     régua tem. `false` volta ao `prioridade: ""` das medidas de B1/B2/T1. */
  ligado: true,
  /* os campos de MUNDO que ficam no default de `garantirLuta` */
  foraDaRegua: ["terreno", "fama", "masmorra", "refem", "vilao", "postura", "publico", "emboscada", "faixaDoEncontro"],
  /* as intenções que, por causa disso, nunca são eleitas aqui */
  inalcancaveis: [
    "capturar", "capturar_um", "arrancar",           /* fama e vilão */
    "empurrar", "afogar", "separar", "prender_no_corredor", "fechar_a_saida", "apagar_a_luz", "encurralado",  /* terreno */
    "tirar_a_coisa", "humilhar",                     /* a coisa carregada e a plateia */
    "atrasar", "atrasar_na_porta", "cumprir_a_ordem", /* o vilão */
    "proteger", "ninhada", "territorio", "vinganca", /* o que se protege, e a masmorra */
    "usar_o_refem", "matar_todos", "escudo_humano",  /* refém e civil */
    "cair_em_cima", "recuperar_o_pe",                /* emboscada dos dois lados */
    "receoso", "aproveitador",                       /* o viés da postura */
    "brincar",                                       /* a faixa do encontro */
  ],
  /* e as que dependem do CENÁRIO, não do mundo: o bestiário desta régua não
     tem chefe nem bicho nem morto-vivo, e "Adversário" cai em `pensa`. */
  foraPorCenario: ["comer", "fugir_ferido", "nao_para", "guardar_o_fundo", "confirmar", "debandar", "vender_caro"],
};

/* AS CLASSES QUE CURAM, do jeito que `lutaDaMesa` as lê (App.jsx:6134). A
   lista existe em `combate.js:202` (`CURAM`) e não é exportada de lá; copiá-la
   aqui é o mesmo que o App faz, e ela fica nomeada em vez de literal no meio
   da conta — se é número, é tabela. */
const CLASSES_QUE_CURAM = ["Clérigo", "Druida", "Bardo"];

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
         régua mede 556 quedas e a primeira queda na rodada 4,72 (P3: 566 e
         4,41 antes do abrigo, 563 e 4,64 depois); com 59 PV mediria 270 e
         3,80, e nenhum dos dois números de lá ficaria de pé. */
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
export function simularCombate(cenario, semente, { comAdversario = ADVERSARIO_NA_REGUA.ligado } = {}) {
  const cen = typeof cenario === "string" ? CENARIOS_DA_REGUA[cenario] : cenario;
  if (!cen) throw new Error("cenário desconhecido: " + cenario);
  return comSorteTravada(semente, () => {
    let heroi = fichaDoHeroi(cen);
    let grupo = fichaDoGrupo(cen);
    let inimigos = fichasDosInimigos(cen);

    const pvGrupoMax = grupo.reduce((s, g) => s + g.vidaMax, 0);
    const caidos = new Set();
    let primeiraQueda = null, quedaDoHeroi = null;
    let danoDesferido = 0, danoSofrido = 0, absorvido = 0, abrigos = 0, golpesEmCaidos = 0;
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

    /* ---------------- A INTENÇÃO DO ADVERSÁRIO (N1b) ----------------
       AQUI NASCE A PRIORIDADE, e é o sítio que não existia. O App monta a
       situação em `lutaDaMesa()` (o bloco fecha em App.jsx:6155), chama
       `intencaoDaVez(s, { antes })` em `intencaoDaLuta()` (App.jsx:6160-6168)
       e entrega o alvo da intenção ao motor em App.jsx:13606. Do outro lado,
       `combate.js:279` SÓ consulta `escolherAlvo` quando a prioridade existe:
       com `prioridade: ""` o inimigo cai no sorteio de 35% e a oposição perde
       a vontade inteira. Era isso que a régua media antes desta etapa, em
       silêncio, e é por isso que este bloco vem com o porquê escrito e não só
       com o código.

       `antes` é a MEMÓRIA POR COMBATE — o id da intenção da rodada anterior.
       Sem ela não existe "virou", existe "agora é outra": `intencaoDaVez`
       mantém a intenção que já valia enquanto ela não QUEBRAR, e é essa
       aderência que separa um plano de um resorteio por rodada.

       Só os campos de COMBATE são preenchidos. Os de MUNDO ficam no default
       explícito de `garantirLuta`, pelo motivo (e com o preço em intenções
       inalcançáveis) escrito em `ADVERSARIO_NA_REGUA`. */
    let antesDaIntencao = "";
    const intencoesEleitas = [];
    const situacaoDaLuta = () => {
      const vivos = vivosInimigos();
      if (!vivos.length) return null;
      const dePe = grupoDePe();
      const somaVida = vivos.reduce((s, x) => s + (x.vida || 0), 0);
      const somaMax = vivos.reduce((s, x) => s + (x.vidaMax || x.vida || 1), 0) || 1;
      /* quem fala pela oposição é o mais forte de pé — App.jsx:6115, com o
         mesmo PESO_AMEACA de `orcamento.js` que o App importa. */
      const voz = vivos.reduce((a, b) => ((b.nivel || 0) + PESO_AMEACA[b.ameaca] * 10 > (a.nivel || 0) + PESO_AMEACA[a.ameaca] * 10 ? b : a), vivos[0]);
      /* ehBicho/ehMorto/pensa saem de `menteDaCriatura` sobre o NOME, como
         App.jsx:6116-6122 faz. Sem léxico: a régua não tem mundo. */
      const mente = menteDaCriatura(voz.nome, voz.desc || "", null);
      const todos = [heroi, ...dePe];
      return {
        nome: voz.nome, ameaca: voz.ameaca || "comum",
        ehBicho: mente === "besta", ehMorto: mente === "morto",
        ehTropa: vivos.length >= 4 && new Set(vivos.map((x) => x.nome)).size <= 2,
        ehChefe: !!voz.chefe || voz.ameaca === "lendario",
        pensa: mente !== "besta" && mente !== "morto",
        rodada,
        quantos: vivos.length, quantosEram: inimigos.length,
        minhaVida: (voz.vida || 0) / (voz.vidaMax || voz.vida || 1),
        vidaDosMeus: somaVida / somaMax,
        heroiVida: (heroi.vida || 0) / (heroi.vidaMax || 1),
        heroiCaido: (heroi.vida || 0) <= 0,
        heroiSozinho: dePe.length === 0,
        quantosDoOutroLado: 1 + dePe.length,
        temConjurador: todos.some((x) => perfilCombate(x.classe || "").tipo === "conjurador"),
        temCurandeiro: dePe.some((x) => CLASSES_QUE_CURAM.includes(x.classe || "")),
        alguemFerido: todos.some((x) => (x.vida || 0) > 0 && (x.vida || 0) < (x.vidaMax || 1) * 0.5),
        temLider: vivos.length > 1,
        liderCaiu: inimigos.some((x) => x.chefe && (x.derrotado || (x.vida || 0) <= 0)),
      };
    };
    const prioridadeDaRodada = () => {
      if (!comAdversario) return "";
      const s = situacaoDaLuta();
      if (!s) return "";
      const v = intencaoDaVez(s, { antes: antesDaIntencao });
      if (!v || !v.intencao) return "";
      antesDaIntencao = v.intencao.id;
      intencoesEleitas.push(v.intencao.id);
      return v.intencao.alvo || "";
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
      /* a intenção é lida ANTES do turno, com o estado da mesa como ele
         chegou até aqui — é a ordem do App: `intencaoDaLuta` já rodou e
         `intencaoRef` já vale quando `turnoDosInimigos` é chamado. */
      const prioridade = prioridadeDaRodada();
      const acoes = turnoDosInimigos({
        inimigos: vivosInimigos(), jogador: heroi, grupo: grupoDePe(),
        gdJogador: 0, grade: null, heroi: null, aliados: [],
        rodada, provocado: false, prioridade,
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
          /* O DESPERDÍCIO EM CORPO CAÍDO. `turnoDosInimigos` decide os alvos
             de TODOS os inimigos de uma vez, sobre a mesa como ela estava no
             início do passo; se dois escolhem o mesmo companheiro e o
             primeiro o derruba, o segundo bate em quem já está no chão e o
             golpe se perde. É diagnóstico, não métrica — mas com o Adversário
             ligado a oposição concentra fogo por intenção, e é ele que diz
             quanto dessa concentração vira sobra. */
          if (!dono || (dono.vida || 0) <= 0) { golpesEmCaidos++; continue; }
          const ab = passarPeloAbrigo(dono, a.r.dano);
          if (ab.absorvido > 0) { absorvido += ab.absorvido; abrigos++; }
          const pv = Math.max(0, (dono.vida || 0) - ab.dano);
          const depois = segurarOuPerder({ ...ab.pers, vida: pv }, pv > 0 ? ab.dano : 0);
          grupo = grupo.map((g) => (g.nome === a.alvoNome ? depois : g));
          danoSofrido += ab.dano;
        }
      }
      anotarQuedas();

      /* ---- 3. O GRUPO ---- */
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

      /* ---- 4. O HERÓI CAÍDO ROLA A MORTE ----
         DEPOIS DO GRUPO, E NÃO ANTES (conserto de B1b). Este passo rolava
         entre os inimigos e o grupo, e o App faz o contrário: `resolverQueda`
         é chamada em `App.jsx:13940`, DEPOIS do turno dos companheiros
         (`App.jsx:13830`) — e o cabeçalho de `resolverRevide` diz a ordem com
         todas as letras (`App.jsx:13497`: "os companheiros agem, o teste de
         morte roda").

         E A DIFERENÇA NÃO É COSMÉTICA, porque o teste de morte MEXE NA FICHA
         que o grupo lê: um `revive` põe o herói em 1 PV, e `decidirAcaoCompanheiro`
         decide pela fração de vida do pior ferido — com a morte antes, a Clériga
         vê um herói de pé onde o App lhe mostra um herói no chão, e cura outra
         pessoa. Medido no `justo` (1000 sementes): a vitória vai de 49,8% para
         52,1% e o PV do grupo de 24,98 para 25,88 só por causa desta ordem. */
      if ((heroi.vida || 0) <= 0 && !heroi.morto) {
        const ap = aplicarTesteMorte(heroi.morte, testeDeMorte());
        heroi = {
          ...heroi, morte: { sucessos: ap.sucessos, falhas: ap.falhas },
          morrendo: ap.desfecho === "morrendo",
          morto: ap.desfecho === "morto",
          vida: ap.desfecho === "revive" ? 1 : heroi.vida,
        };
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
      /* as intenções eleitas, rodada a rodada. Não é métrica (não entra em
         `METRICAS_DA_REGUA`, não vira média): é o RASTRO que explica o
         número — sem ele, "a vitória caiu" não diz de quem foi a decisão. */
      intencoes: intencoesEleitas,
      golpesEmCaidos,
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
export function medir(cenarioId, { n = AMOSTRA_DA_REGUA.n, prefixo = AMOSTRA_DA_REGUA.familiaDoRetrato, comAdversario = ADVERSARIO_NA_REGUA.ligado } = {}) {
  const combates = [];
  for (let i = 0; i < n; i++) combates.push(simularCombate(cenarioId, `${prefixo}|${i}`, { comAdversario }));
  const out = { cenario: cenarioId, prefixo, combates: n, comAdversario: !!comAdversario };
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
