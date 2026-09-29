/* ============================================================
   OS ATIRADORES ATIRAM (Fase MM · MM7) — quem luta de longe, e onde fica

   O ACHADO, e ele é de 24/09 (v9.294): a fuga já tratava o arqueiro como
   arqueiro — quem foge de um besteiro não é alcançado, é alvejado. Dentro
   da luta, o mesmo besteiro era um lutador colado: `moverInimigos` o
   levava até o herói e `turnoDosInimigos` o fazia bater com "Rasteira" e
   "Marretada", porque o nome não chegava a lado nenhum além da fuga. Um
   arqueiro que corre para o corpo a corpo é o oposto do que a mesa espera,
   e tirava à luta a decisão mais interessante do tabuleiro: fechar a
   distância com ele, ou procurar cobertura.

   ---------------- POR QUE UM MÓDULO À PARTE, E SEM IMPORT ----------------

   Três casas precisam da mesma resposta a "ele luta de longe?": a fuga
   (`fuga.js`, onde a tabela nasceu), o passo (`grid.js`, `moverInimigos`)
   e o golpe (`combate.js`, `turnoDosInimigos`). A fuga lê as outras duas,
   e `golpe.js` lê `grid.js` — pôr a tabela em qualquer uma delas fechava
   um círculo de imports. Aqui ela é FOLHA: não importa nada, e todo mundo
   a pode ler sem que a ordem de avaliação decida qual tabela nasce antes.

   Pelo mesmo motivo o TETO DA ARMA DE LONGE (36 m) mora aqui e `golpe.js`
   o lê (`ALCANCES.armaDeLonge`): o número é o mesmo de sempre, e a fuga,
   o golpe do herói e o posto do atirador passam a lê-lo de um sítio só.

   ---------------- O QUE ESTE ARQUIVO NÃO FAZ ----------------

   Não anda nem rola. O passo é de `grid.js` (é lá que moram a linha de
   visão, a cobertura e o caminho) e o disparo é de `combate.js`. Aqui
   ficam as duas perguntas de nome e a tabela de números que as duas casas
   leem para não terem cada uma o seu 18.
   ============================================================ */

const N = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ============================================================
   QUEM ATACA DE LONGE — a tabela de nomes (nasceu em fuga.js, v9.294).

   A tabela é de NOMES (o `desc` do bestiário não chega à mesa: é dívida
   conhecida de `completarInimigo`, escrita em degraus.js), e o `desc` é
   lido também, para o dia em que chegar. Duas famílias:
     arma   quem dispara coisa — arco, besta, funda, dardo.
     magia  quem conjura de longe. O Lich entra: é o conjurador por
            excelência, e fugir de um é fugir de um feitiço nas costas.
   FICOU DE FORA o Cultista: no 5e ele luta de cimitarra, e um sacerdote
   sombrio que só o nome faz conjurador entra pelo "sombrio", não pelo
   "cultista". E o Caçador: caçador de faca é tão comum quanto de arco.
   ============================================================ */
export const QUEM_ATACA_DE_LONGE = [
  { id: "arma", rx: /\b(atirador|atiradora|franco-?atirador|arqueir[oa]s?|besteir[oa]s?|fundibulari[oa]s?|lanca-?dardos)\b/ },
  { id: "magia", rx: /\b(mago|maga|feiticeir[oa]|brux[oa]|xama|conjurador|conjuradora|necromante|piromante|lich|sacerdote sombrio|sacerdotisa sombria)\b/ },
  { id: "descrito", rx: /\b(a distancia|de longe)\b/ },
];

export function atacaDeLonge(inimigo) {
  if (!inimigo || typeof inimigo !== "object") return false;
  if (inimigo.distancia) return true;
  const t = N(`${inimigo.nome || ""} ${inimigo.desc || ""}`);
  return QUEM_ATACA_DE_LONGE.some((q) => q.rx.test(t));
}

/* ============================================================
   QUEM MANTÉM A DISTÂNCIA NO TABULEIRO — a mesma pergunta, com um filtro.

   `moverInimigos` move os inimigos E os companheiros (o App chama-a duas
   vezes, uma para cada lado), e um companheiro chamado "Mago" — a régua
   de Uma Vida tem um — não pode passar a ficar para trás só pelo nome: a
   ficha dele é outra e o turno dele (`turnoDosCompanheiros`) não mede
   alcance. Então, no tabuleiro, atira de longe quem a FICHA declara
   (`distancia`, as invocações) ou quem tem a linha de ameaça que só o
   inimigo tem (`ameaca`, posta por `completarInimigo`) e o nome chama de
   atirador. Na fuga continua a valer `atacaDeLonge`: lá só há inimigos.
   ============================================================ */
export function mantemDistancia(ent) {
  if (!ent || typeof ent !== "object") return false;
  if (ent.distancia) return true;
  return ent.ameaca != null && atacaDeLonge(ent);
}

/* ============================================================
   O POSTO DO ATIRADOR — a tabela que `grid.js` e `combate.js` leem.

   alcanceM       o teto da arma de longe, 36 m. `golpe.js` lê-o daqui
                  (`ALCANCES.armaDeLonge`), e a fuga continua a derivar a
                  sua faixa longa (18 m, a desvantagem do 5e) dele. Além
                  disto, ninguém dispara.
   faixasSemCusto quantas faixas de `alcanca` o posto aceita. NA LUTA o
                  tiro do inimigo paga a MESMA penalidade por faixa de 9 m
                  que o tiro do herói paga (`alcanca`, grid.js): o mesmo
                  arco custa o mesmo aos dois lados da mesa. Uma faixa =
                  até 9 m (exclusive), onde o tiro não paga nada: dentro
                  dela, vendo o herói e sem ninguém colado, o atirador não
                  se mexe. Quando se mexe, procura a última casa dela (7,5
                  m) — o mais longe que se pode estar sem pagar. MEDIDO
                  (`testes/sonda-dos-atiradores.mjs`): com o posto nos 12 m
                  (a faixa seguinte, −2), o dano no herói caía 22% e 30% em
                  duas das três lutas — o atirador ficava mais fraco do que
                  o lutador colado que era; com a faixa sem custo, as três
                  ficam entre −16% e +13%.
   pesos          como se escolhe entre dois postos bons. `faixa` manda
                  em tudo (dentro da faixa sem custo antes de qualquer outra
                  coisa);
                  `cobertura` vale tantos metros de desvio do ideal quanto
                  diz; `ideal` é o custo por metro de desvio; `passo` é o
                  custo por metro andado (entre dois postos iguais, o mais
                  perto de onde já está — quem se mexe à toa não pensa).
                  A cobertura (8) vale mais do que o pior desvio dentro da
                  faixa (4,5 m) somado ao passo inteiro de 9 m (2,25): com
                  uma casa coberta ao alcance, é ela — "preferindo
                  cobertura" é regra, não tendência. A suíte o cobra.
   coladoRecua    colado ao herói, recua e dispara (e o recuo provoca o
                  golpe de oportunidade, como o de quem foge). Encurralado,
                  dispara com desvantagem, a regra do 5e.
   ============================================================ */
export const POSTURA_DO_ATIRADOR = {
  alcanceM: 36,
  faixasSemCusto: 1,
  pesos: { faixa: 1000, cobertura: 8, ideal: 1, passo: 0.25 },
  coladoRecua: true,
};
