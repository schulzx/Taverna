/* ============================================================
   OS RETRATOS (Retratos §11–13 de mente/formas.md, 12/10) — Taverna

   A pintura que escala. Até aqui todo rosto do jogo era desenhado pela
   semente (`rosto.jsx`): de graça, sem um byte de arquivo, e igual para o
   troll e para o taverneiro. A mesa pintou no Figma as 18 feras de
   `CRIATURAS_FANTASIA` (F1) e os 240 heróis raça × classe × sexo (F2: 164
   a 12/10, as 76 que faltavam a 03/11) — e ESCOLHER qual pintura vai para quem é
   regra, e regra prova-se em Node, não na tela.

   Três peças, todas puras:

     · `RETRATOS` — o manifesto, uma entrada por arquivo, `{ chave,
       arquivo, cx, olhos }`. A chave é `especie:Lobo Atroz` ou
       `gente:<Raça>|<m|f>|<traje>|<variante>`, com os nomes EXACTOS do
       código (`RACAS`, `CLASSES`). `cx`/`olhos` são o centro do rosto em
       fração da matriz 1024 — por matriz, e não constante, porque o Ogro
       tem a cabeça a 30 % e a Quimera a 47 % (§4: a constante cortaria a
       testa do golias no chip);
     · `retratoDe(ente, mundo)` — a entrada, ou `null`. Quem tem `classe` é
       gente (a regra de A1): raça × sexo × classe. Quem tem `oficio` é
       gente com o traje do ofício — e ainda não há matriz de ofício, logo
       hoje é `null`. O resto é espécie, achada pelo nome MAIS LONGO: o
       "Lobo Atroz" contém "Lobo", e o alfa negro não pode receber a pintura
       do lobo cinzento (o mesmo defeito que dava ao Lobo Atroz a ficha de
       luta do Lobo, R7). Com `null`, quem chama mantém o rosto de hoje:
       NUNCA um buraco, NUNCA o rosto de outra coisa;
     · `recorteDoRetrato(entrada, lado)` — a aritmética do recorte. O
       arquivo é o recorte da FICHA (lado 0,88 da matriz); o tamanho pedido
       usa o seu (chip 0,40 · cartão 0,62 · ficha 0,88), e a conta devolve
       em px onde pôr a imagem dentro do disco. Recortes, limiares e centros
       saem de `RETRATO` — nenhum literal no componente.

   Desde 03/11 as 240 células raça × sexo × classe têm pintura: as 76 que
   o limite dos créditos deixou por pintar a 12/10 (Tiefling 10, Gnomo 22,
   Meio-elfo 22, Goliath 22) entraram como linhas novas, e nenhuma função
   mudou. Quem não tem entrada (a gente sem classe, o bicho que a tabela
   não conhece) continua a receber `null` e o rosto desenhado.

   A variante sai da semente da pessoa (hoje toda célula tem uma só, a 1);
   o sexo sai de `feicoes` (semente.js), a MESMA conta que desenha o rosto
   de hoje — senão a pintura e o desenho discordariam de quem é a pessoa.
   ============================================================ */

import { RACAS, CLASSES } from "./classes.js";
import { feicoes, hashSemente } from "./semente.js";
import { racaDeCompanheiro } from "./companheiros.js";

/* ---------------- o enquadramento (§4 e §12) ----------------
   `recorte`: o lado do recorte quadrado, em fração do lado da matriz.
   `limiar`: até quantos px o tamanho pedido usa aquele recorte (acima do
   do cartão, é ficha). `abaixoDosOlhos`: o centro do chip e do cartão
   desce dos olhos esta fração (o chip mostra o olhar; o cartão, cabeça e
   ombros). `ficha`: o centro do busto — x puxado a meio caminho entre o
   rosto e o centro do quadro, y fixo. */
export const RETRATO = {
  recorte: { chip: 0.40, cartao: 0.62, ficha: 0.88 },
  limiar: { chip: 40, cartao: 100 },
  abaixoDosOlhos: { chip: 0.06, cartao: 0.12 },
  ficha: { alturaDoCentro: 0.47, puxaAoMeio: 0.5 },
  pasta: { especie: "/retratos/especie/", gente: "/retratos/gente/" },
  extensao: ".webp",
};

/* Campos que dizem "isto é uma pessoa", mesmo sem classe: a pessoa do
   registo (papel, relação), a do lugar (ofício, raça). Uma pessoa sem
   classe e sem matriz de ofício NÃO cai na espécie pelo nome — o "Velho
   Lobo" da taverna não é um lobo. `especie` declarada (R1) ganha de todos. */
export const SINAIS_DE_GENTE = ["papel", "relacao", "oficio", "raca"];

/* ---------------- A GENTE DA CIDADE GANHA PINTURA (04/11/2026) ----------------
   A pessoa, a jogar no telefone: «Ainda tem personagem sem imagem». Os 240
   retratos são do herói (raça × sexo × classe); a gente do registo — o
   taverneiro, a mercenária, o padre — não tem classe nem, quase nunca, raça,
   e caía no desenho de traço. As «matrizes de ofício» de 11/10 nunca foram
   pintadas (custam créditos).

   A gente veste o traje do papel que tem: a primeira linha que casa decide a
   classe cuja pintura ela usa (o guarda veste o Guerreiro, o padre o Clérigo,
   o taverneiro o Bardo). O papel que já é uma pintura de gente (o bandido, a
   cultista) usa a dela. Sem papel que case, o traje sai da semente, entre os
   ofícios da rua. A raça é a dita no registo; sem ela, a do povo da casa, pela
   MESMA conta do companheiro (`racaDeCompanheiro`) — uma raça que o catálogo
   não pinta (o mundo de outro género) dá null, e o desenho de traço fica.
   A ordem importa: do mais específico ao mais largo (o monge antes do clérigo). */
export const O_TRAJE_DO_PAPEL = Object.freeze([
  Object.freeze({ rx: /\b(monge|mestre de luta|lutador de punhos)/, classe: "Monge" }),
  Object.freeze({ rx: /\b(guard|sentinel|soldad|capit|mercenari|cavaleir|milic|carcereir|veteran|espadachim|guerreir|lanceir|escudeir|sargent|tenente|vigia|xerife|meirinho|gladiador|brutamont|capang|lutador|sem senhor)/, classe: "Guerreiro" }),
  Object.freeze({ rx: /\b(sacerdot|padre|clerig|frei|freira|acolit|monja|abade|abadessa|pregador|peregrin|bispo|ermita|coveir|vigari|templari)/, classe: "Clérigo" }),
  Object.freeze({ rx: /\b(mag[oa]|estudios|sabi[oa]|escrib|bibliotecari|astrolog|professor|erudit|alquimist|boticari|copista)/, classe: "Mago" }),
  Object.freeze({ rx: /\b(ladr|contrabandist|espia|receptador|vigarist|trapaceir|informante|assassin|cortesa|falsari)/, classe: "Ladino" }),
  Object.freeze({ rx: /\b(bard|menestrel|taverneir|estalajadeir|cantor|music|ator|atriz|saltimbanc|bobo|arauto|pregoeir|anfitri|cozinheir|criad)/, classe: "Bardo" }),
  Object.freeze({ rx: /\b(cacad|batedor|guia|rastreador|pastor|lenhador|pescador|barqueir|marinheir|carroceir|tropeir|arqueir|falcoeir|caravaneir)/, classe: "Caçador" }),
  Object.freeze({ rx: /\b(herborist|curandeir|parteir|druid|campones|fazendeir|lavrador|jardineir|moleir|apicultor|benzedeir)/, classe: "Druida" }),
  Object.freeze({ rx: /\b(ferreir|artes|carpinteir|pedreir|mineir|engenheir|ourives|joalheir|curtidor|oleir|mercador|comerciante|vendedor|lojist|armeir|tanoeir|alfaiat|tecel|cartograf)/, classe: "Engenheiro" }),
  Object.freeze({ rx: /\b(cultist|bruxa|bruxo|necromant|ocultist|vidente|cartomant)/, classe: "Bruxo" }),
  Object.freeze({ rx: /\b(nobre|senhor|senhora|conde|condessa|duque|duquesa|barao|baronesa|princip|princesa|dama|lorde|regente|governador|burgomestre|vereador)/, classe: "Feiticeiro" }),
]);
/* sem papel que case: os trajes da rua, pela semente */
export const TRAJES_DA_RUA = Object.freeze(["Bardo", "Caçador", "Engenheiro", "Ladino", "Druida"]);
/* O POVO QUE O CATÁLOGO NÃO PINTA (04/11/2026). A pessoa: «acabei de começar
   essa campanha e veio com um companheiro, ou seja, ele é um personagem,
   deveria ter a imagem». Fora da Fantasia o povo sai do cenário («forasteiro»,
   «cultista», «híbrido», «aristocrata»), e a pintura só conhece as dez raças
   de fantasia — medido: 81 de 120 companheiros iniciais dos outros géneros sem
   pintura, 0 de 40 na Fantasia. O herói tem pintura porque escolhe raça do
   catálogo. Quem tem povo dito e sem pintura veste a pintura deste povo, com a
   SUA classe e o SEU sexo: um retrato aproximado de alguém que existe vale mais
   que um vazio onde está um personagem. */
export const POVO_SEM_PINTURA = Object.freeze({ raca: "Humano" });
function racaPintada(dita) {
  const d = typeof dita === "string" ? dita.trim() : "";
  if (!d) return null;
  return nomeCanonico(d, RACA_POR_FIO) || nomeCanonico(racaDeCompanheiro({ raca: d }), RACA_POR_FIO) || POVO_SEM_PINTURA.raca;
}

/* as pinturas de espécie que são gente: o papel que as nomeia usa-as */
const ESPECIES_QUE_SAO_GENTE = new Set(["especie:Bandido", "especie:Cultista"]);

/* ---------------- o manifesto ----------------
   Feras: [espécie, arquivo, cx, olhos], na ordem de CRIATURAS_FANTASIA.
   Heróis: por raça, [arquivo, cx, olhos]; o arquivo diz raça-sexo-classe
   e a variante é a 1 (`public/retratos/gente/<arquivo>-1.webp`). Os valores
   são os MEDIDOS (`mente/figma/retratos-medidos.json`, 12/10 e 03/11): 219
   matrizes pela malha do rosto do MediaPipe (olhos = as duas íris; cx = o
   meio da malha), 39 à régua onde a malha não acha rosto (13 feras, os
   Draconatos, o Anão Invocador, o Goliath Bardo de barba branca). A
   estimativa à mão de §11/§13 errava 0,012 nos olhos e 0,016 no cx (máx.
   0,043) a 12/10, e 0,013 e 0,021 (máx. 0,060) nas 76 de 03/11 — no chip
   de 32 px, até 4,8 px de rosto torto.
   Mudar um número aqui pede corte novo (`mente/figma/corte`): o arquivo
   foi recortado com este cx, e `teste-rosto-pintado` fica vermelho se os
   dois discordarem. */
const FERAS = [
  ["Slime", "slime", 0.41, 0.36],
  ["Rato Gigante", "rato-gigante", 0.47, 0.37],
  ["Lobo", "lobo", 0.43, 0.41],
  ["Goblin", "goblin", 0.45, 0.40],
  ["Bandido", "bandido", 0.44, 0.39],
  ["Esqueleto", "esqueleto", 0.45, 0.42],
  ["Zumbi", "zumbi", 0.46, 0.38],
  ["Lobo Atroz", "lobo-atroz", 0.45, 0.37],
  ["Cultista", "cultista", 0.46, 0.37],
  ["Ogro", "ogro", 0.46, 0.32],
  ["Troll", "troll", 0.45, 0.38],
  ["Elemental Menor", "elemental-menor", 0.44, 0.45],
  ["Golem de Pedra", "golem-de-pedra", 0.43, 0.39],
  ["Quimera", "quimera", 0.41, 0.46],
  ["Gigante", "gigante", 0.45, 0.32],
  ["Dragão Jovem", "dragao-jovem", 0.45, 0.37],
  ["Lich", "lich", 0.44, 0.37],
  ["Dragão Ancião", "dragao-anciao", 0.42, 0.47],
];

const HEROIS = {
  "Humano": [
    ["humano-m-guerreiro", 0.47, 0.37], ["humano-f-guerreiro", 0.47, 0.37], ["humano-m-mago", 0.45, 0.37], ["humano-f-mago", 0.44, 0.34],
    ["humano-m-ladino", 0.42, 0.39], ["humano-f-ladino", 0.46, 0.36], ["humano-m-clerigo", 0.47, 0.33], ["humano-f-clerigo", 0.46, 0.30],
    ["humano-m-cacador", 0.48, 0.33], ["humano-f-cacador", 0.43, 0.34], ["humano-m-bardo", 0.47, 0.36], ["humano-f-bardo", 0.44, 0.37],
    ["humano-m-monge", 0.47, 0.33], ["humano-f-monge", 0.46, 0.34], ["humano-m-druida", 0.47, 0.36], ["humano-f-druida", 0.45, 0.35],
    ["humano-m-feiticeiro", 0.46, 0.31], ["humano-f-feiticeiro", 0.45, 0.35], ["humano-m-bruxo", 0.46, 0.32], ["humano-f-bruxo", 0.45, 0.34],
    ["humano-m-engenheiro", 0.49, 0.31], ["humano-f-engenheiro", 0.45, 0.34], ["humano-m-invocador", 0.47, 0.35], ["humano-f-invocador", 0.47, 0.32],
  ],
  "Elfo": [
    ["elfo-m-guerreiro", 0.55, 0.35], ["elfo-f-guerreiro", 0.46, 0.34], ["elfo-m-mago", 0.45, 0.36], ["elfo-f-mago", 0.45, 0.37],
    ["elfo-m-ladino", 0.44, 0.36], ["elfo-f-ladino", 0.45, 0.37], ["elfo-m-clerigo", 0.45, 0.34], ["elfo-f-clerigo", 0.45, 0.31],
    ["elfo-m-cacador", 0.44, 0.34], ["elfo-f-cacador", 0.44, 0.37], ["elfo-m-bardo", 0.48, 0.38], ["elfo-f-bardo", 0.43, 0.37],
    ["elfo-m-monge", 0.46, 0.34], ["elfo-f-monge", 0.46, 0.35], ["elfo-m-druida", 0.47, 0.37], ["elfo-f-druida", 0.47, 0.34],
    ["elfo-m-feiticeiro", 0.46, 0.35], ["elfo-f-feiticeiro", 0.45, 0.35], ["elfo-m-bruxo", 0.46, 0.34], ["elfo-f-bruxo", 0.45, 0.31],
    ["elfo-m-engenheiro", 0.46, 0.34], ["elfo-f-engenheiro", 0.46, 0.33], ["elfo-m-invocador", 0.46, 0.36], ["elfo-f-invocador", 0.46, 0.32],
  ],
  "Anão": [
    ["anao-m-guerreiro", 0.47, 0.33], ["anao-f-guerreiro", 0.46, 0.34], ["anao-m-mago", 0.47, 0.32], ["anao-f-mago", 0.43, 0.36],
    ["anao-m-ladino", 0.46, 0.33], ["anao-f-ladino", 0.44, 0.38], ["anao-m-clerigo", 0.47, 0.30], ["anao-f-clerigo", 0.47, 0.34],
    ["anao-m-cacador", 0.44, 0.32], ["anao-f-cacador", 0.42, 0.34], ["anao-m-bardo", 0.46, 0.34], ["anao-f-bardo", 0.45, 0.35],
    ["anao-m-monge", 0.48, 0.28], ["anao-f-monge", 0.44, 0.34], ["anao-m-druida", 0.47, 0.32], ["anao-f-druida", 0.47, 0.35],
    ["anao-m-feiticeiro", 0.48, 0.33], ["anao-f-feiticeiro", 0.45, 0.35], ["anao-m-bruxo", 0.48, 0.28], ["anao-f-bruxo", 0.47, 0.35],
    ["anao-m-engenheiro", 0.47, 0.31], ["anao-f-engenheiro", 0.45, 0.33], ["anao-m-invocador", 0.46, 0.32], ["anao-f-invocador", 0.45, 0.35],
  ],
  "Halfling": [
    ["halfling-m-guerreiro", 0.46, 0.39], ["halfling-f-guerreiro", 0.43, 0.41], ["halfling-m-mago", 0.46, 0.40], ["halfling-f-mago", 0.45, 0.42],
    ["halfling-m-ladino", 0.46, 0.42], ["halfling-f-ladino", 0.46, 0.41], ["halfling-m-clerigo", 0.46, 0.39], ["halfling-f-clerigo", 0.47, 0.35],
    ["halfling-m-cacador", 0.46, 0.40], ["halfling-f-cacador", 0.44, 0.40], ["halfling-m-bardo", 0.45, 0.41], ["halfling-f-bardo", 0.44, 0.41],
    ["halfling-m-monge", 0.45, 0.37], ["halfling-f-monge", 0.46, 0.37], ["halfling-m-druida", 0.48, 0.37], ["halfling-f-druida", 0.46, 0.39],
    ["halfling-m-feiticeiro", 0.45, 0.38], ["halfling-f-feiticeiro", 0.47, 0.36], ["halfling-m-bruxo", 0.45, 0.38], ["halfling-f-bruxo", 0.46, 0.38],
    ["halfling-m-engenheiro", 0.47, 0.36], ["halfling-f-engenheiro", 0.47, 0.37], ["halfling-m-invocador", 0.46, 0.36], ["halfling-f-invocador", 0.47, 0.37],
  ],
  "Meio-orc": [
    ["meio-orc-m-guerreiro", 0.41, 0.36], ["meio-orc-f-guerreiro", 0.47, 0.36], ["meio-orc-m-mago", 0.45, 0.39], ["meio-orc-f-mago", 0.44, 0.37],
    ["meio-orc-m-ladino", 0.45, 0.37], ["meio-orc-f-ladino", 0.44, 0.39], ["meio-orc-m-clerigo", 0.47, 0.34], ["meio-orc-f-clerigo", 0.45, 0.32],
    ["meio-orc-m-cacador", 0.44, 0.36], ["meio-orc-f-cacador", 0.43, 0.35], ["meio-orc-m-bardo", 0.47, 0.37], ["meio-orc-f-bardo", 0.45, 0.39],
    ["meio-orc-m-monge", 0.47, 0.35], ["meio-orc-f-monge", 0.46, 0.32], ["meio-orc-m-druida", 0.48, 0.38], ["meio-orc-f-druida", 0.46, 0.36],
    ["meio-orc-m-feiticeiro", 0.46, 0.32], ["meio-orc-f-feiticeiro", 0.46, 0.32], ["meio-orc-m-bruxo", 0.46, 0.33], ["meio-orc-f-bruxo", 0.46, 0.35],
    ["meio-orc-m-engenheiro", 0.48, 0.33], ["meio-orc-f-engenheiro", 0.45, 0.34], ["meio-orc-m-invocador", 0.45, 0.34], ["meio-orc-f-invocador", 0.45, 0.33],
  ],
  "Draconato": [
    ["draconato-m-guerreiro", 0.40, 0.31], ["draconato-f-guerreiro", 0.40, 0.33], ["draconato-m-mago", 0.43, 0.37], ["draconato-f-mago", 0.42, 0.33],
    ["draconato-m-ladino", 0.42, 0.33], ["draconato-f-ladino", 0.42, 0.35], ["draconato-m-clerigo", 0.42, 0.26], ["draconato-f-clerigo", 0.42, 0.33],
    ["draconato-m-cacador", 0.45, 0.34], ["draconato-f-cacador", 0.42, 0.33], ["draconato-m-bardo", 0.42, 0.34], ["draconato-f-bardo", 0.45, 0.36],
    ["draconato-m-monge", 0.43, 0.32], ["draconato-f-monge", 0.43, 0.30], ["draconato-m-druida", 0.42, 0.33], ["draconato-f-druida", 0.42, 0.32],
    ["draconato-m-feiticeiro", 0.42, 0.25], ["draconato-f-feiticeiro", 0.43, 0.32], ["draconato-m-bruxo", 0.42, 0.31], ["draconato-f-bruxo", 0.42, 0.27],
    ["draconato-m-engenheiro", 0.42, 0.31], ["draconato-f-engenheiro", 0.42, 0.27], ["draconato-m-invocador", 0.45, 0.27], ["draconato-f-invocador", 0.42, 0.32],
  ],
  "Tiefling": [
    ["tiefling-m-guerreiro", 0.46, 0.36], ["tiefling-f-guerreiro", 0.47, 0.39], ["tiefling-m-mago", 0.45, 0.40], ["tiefling-f-mago", 0.44, 0.41],
    ["tiefling-m-ladino", 0.47, 0.41], ["tiefling-f-ladino", 0.44, 0.39], ["tiefling-m-clerigo", 0.46, 0.34], ["tiefling-f-clerigo", 0.45, 0.34],
    ["tiefling-m-cacador", 0.42, 0.36], ["tiefling-f-cacador", 0.48, 0.35], ["tiefling-m-bardo", 0.46, 0.38], ["tiefling-f-bardo", 0.45, 0.39],
    ["tiefling-m-monge", 0.44, 0.41], ["tiefling-f-monge", 0.46, 0.35], ["tiefling-m-druida", 0.48, 0.36], ["tiefling-f-druida", 0.45, 0.39],
    ["tiefling-m-feiticeiro", 0.47, 0.36], ["tiefling-f-feiticeiro", 0.45, 0.40], ["tiefling-m-bruxo", 0.45, 0.37], ["tiefling-f-bruxo", 0.45, 0.39],
    ["tiefling-m-engenheiro", 0.47, 0.34], ["tiefling-f-engenheiro", 0.46, 0.36], ["tiefling-m-invocador", 0.48, 0.36], ["tiefling-f-invocador", 0.47, 0.34],
  ],
  "Gnomo": [
    ["gnomo-m-guerreiro", 0.47, 0.40], ["gnomo-f-guerreiro", 0.44, 0.42], ["gnomo-m-mago", 0.46, 0.42], ["gnomo-f-mago", 0.46, 0.44],
    ["gnomo-m-ladino", 0.44, 0.39], ["gnomo-f-ladino", 0.46, 0.38], ["gnomo-m-clerigo", 0.47, 0.40], ["gnomo-f-clerigo", 0.46, 0.38],
    ["gnomo-m-cacador", 0.47, 0.40], ["gnomo-f-cacador", 0.46, 0.39], ["gnomo-m-bardo", 0.46, 0.43], ["gnomo-f-bardo", 0.46, 0.47],
    ["gnomo-m-monge", 0.45, 0.41], ["gnomo-f-monge", 0.46, 0.42], ["gnomo-m-druida", 0.46, 0.41], ["gnomo-f-druida", 0.45, 0.43],
    ["gnomo-m-feiticeiro", 0.46, 0.44], ["gnomo-f-feiticeiro", 0.47, 0.38], ["gnomo-m-bruxo", 0.47, 0.41], ["gnomo-f-bruxo", 0.45, 0.37],
    ["gnomo-m-engenheiro", 0.47, 0.39], ["gnomo-f-engenheiro", 0.46, 0.39], ["gnomo-m-invocador", 0.46, 0.41], ["gnomo-f-invocador", 0.45, 0.40],
  ],
  "Meio-elfo": [
    ["meio-elfo-m-guerreiro", 0.45, 0.33], ["meio-elfo-f-guerreiro", 0.45, 0.38], ["meio-elfo-m-mago", 0.47, 0.32], ["meio-elfo-f-mago", 0.45, 0.39],
    ["meio-elfo-m-ladino", 0.44, 0.39], ["meio-elfo-f-ladino", 0.43, 0.37], ["meio-elfo-m-clerigo", 0.46, 0.33], ["meio-elfo-f-clerigo", 0.46, 0.34],
    ["meio-elfo-m-cacador", 0.47, 0.39], ["meio-elfo-f-cacador", 0.44, 0.34], ["meio-elfo-m-bardo", 0.44, 0.36], ["meio-elfo-f-bardo", 0.44, 0.34],
    ["meio-elfo-m-monge", 0.47, 0.33], ["meio-elfo-f-monge", 0.46, 0.31], ["meio-elfo-m-druida", 0.47, 0.36], ["meio-elfo-f-druida", 0.47, 0.37],
    ["meio-elfo-m-feiticeiro", 0.45, 0.34], ["meio-elfo-f-feiticeiro", 0.45, 0.33], ["meio-elfo-m-bruxo", 0.46, 0.37], ["meio-elfo-f-bruxo", 0.47, 0.31],
    ["meio-elfo-m-engenheiro", 0.47, 0.38], ["meio-elfo-f-engenheiro", 0.46, 0.33], ["meio-elfo-m-invocador", 0.45, 0.33], ["meio-elfo-f-invocador", 0.46, 0.35],
  ],
  "Goliath": [
    ["goliath-m-guerreiro", 0.46, 0.32], ["goliath-f-guerreiro", 0.45, 0.34], ["goliath-m-mago", 0.46, 0.35], ["goliath-f-mago", 0.44, 0.37],
    ["goliath-m-ladino", 0.46, 0.36], ["goliath-f-ladino", 0.46, 0.38], ["goliath-m-clerigo", 0.47, 0.31], ["goliath-f-clerigo", 0.47, 0.34],
    ["goliath-m-cacador", 0.46, 0.28], ["goliath-f-cacador", 0.46, 0.35], ["goliath-m-bardo", 0.46, 0.37], ["goliath-f-bardo", 0.46, 0.38],
    ["goliath-m-monge", 0.47, 0.34], ["goliath-f-monge", 0.46, 0.35], ["goliath-m-druida", 0.48, 0.35], ["goliath-f-druida", 0.46, 0.35],
    ["goliath-m-feiticeiro", 0.45, 0.38], ["goliath-f-feiticeiro", 0.45, 0.31], ["goliath-m-bruxo", 0.44, 0.30], ["goliath-f-bruxo", 0.46, 0.31],
    ["goliath-m-engenheiro", 0.47, 0.33], ["goliath-f-engenheiro", 0.45, 0.32], ["goliath-m-invocador", 0.48, 0.34], ["goliath-f-invocador", 0.45, 0.29],
  ],
};

/* ---------------- a montagem ---------------- */
const lisa = (s) => String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const fio = (s) => lisa(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const palavras = (s) => " " + lisa(s).replace(/[^a-z0-9]+/g, " ").trim() + " ";

const RACA_POR_FIO = Object.fromEntries(RACAS.map((r) => [fio(r.nome), r.nome]));
const CLASSE_POR_FIO = Object.fromEntries(CLASSES.map((c) => [fio(c.nome), c.nome]));
/* "meio-orc" antes de "meio": o prefixo mais longo decide a raça do arquivo */
const FIOS_DE_RACA = Object.keys(RACA_POR_FIO).sort((a, b) => b.length - a.length);

function entradaDeGente(arquivo, cx, olhos, variante) {
  const raca = FIOS_DE_RACA.find((r) => arquivo.startsWith(r + "-"));
  if (!raca) return null;
  const [sexo, ...resto] = arquivo.slice(raca.length + 1).split("-");
  const classe = CLASSE_POR_FIO[resto.join("-")];
  if ((sexo !== "m" && sexo !== "f") || !classe) return null;
  return Object.freeze({
    chave: `gente:${RACA_POR_FIO[raca]}|${sexo}|${classe}|${variante}`,
    arquivo: `${RETRATO.pasta.gente}${arquivo}-${variante}${RETRATO.extensao}`,
    cx, olhos,
  });
}

export const RETRATOS = Object.freeze([
  ...FERAS.map(([especie, arquivo, cx, olhos]) => Object.freeze({
    chave: `especie:${especie}`,
    arquivo: `${RETRATO.pasta.especie}${arquivo}${RETRATO.extensao}`,
    cx, olhos,
  })),
  ...Object.values(HEROIS).flat().map(([arquivo, cx, olhos]) => entradaDeGente(arquivo, cx, olhos, 1)).filter(Boolean),
]);

const POR_CHAVE = new Map(RETRATOS.map((r) => [r.chave, r]));
/* as variantes de cada célula, em ordem: "gente:Humano|m|Guerreiro" → [v1, v2…] */
const CELULAS = new Map();
for (const r of RETRATOS) {
  if (!r.chave.startsWith("gente:")) continue;
  const celula = r.chave.slice(0, r.chave.lastIndexOf("|"));
  CELULAS.set(celula, [...(CELULAS.get(celula) || []), r]);
}
/* as espécies, da mais longa para a mais curta: a primeira que casa vence */
const ESPECIES = RETRATOS.filter((r) => r.chave.startsWith("especie:"))
  .map((r) => ({ r, chave: palavras(r.chave.slice("especie:".length)) }))
  .sort((a, b) => b.chave.length - a.chave.length);

/* ---------------- retratoDe ----------------
   `ente`: o que o `Rosto` recebe (herói, companheiro, pessoa, inimigo).
   `mundo`: `{ semente, apresentacao, fixo }` — a semente do rosto (a mesma
   que o `Rosto` recebe), e o ajuste da apresentação, para o sexo da
   pintura ser o do desenho. Tudo opcional; `null` em qualquer um não
   estoura. */
const nomeCanonico = (valor, porFio) => (valor ? porFio[fio(valor)] || null : null);

function sexoDe(ente, m) {
  const g = lisa(ente.genero || ente.sexo || "");
  const genero = g === "mulher" || g === "f" || g === "feminino" ? "mulher" : g === "homem" || g === "m" || g === "masculino" ? "homem" : "";
  const semente = m.semente ?? ente.semente ?? ente.nome ?? "";
  return feicoes(String(semente), { genero, apresentacao: m.apresentacao, fixo: m.fixo === true || ente.feicoesFixas === true }).fem ? "f" : "m";
}

function daCelula(celula, ente, m) {
  const variantes = CELULAS.get(celula);
  if (!variantes || !variantes.length) return null;
  const semente = String(m.semente ?? ente.semente ?? ente.nome ?? "");
  return variantes[hashSemente("retrato|" + semente) % variantes.length];
}

/* a espécie de um nome: a mais longa que casa por PALAVRA inteira, ou null */
function especieDoNome(nome) {
  const p = palavras(nome);
  if (p.trim() === "") return null;
  const achada = ESPECIES.find((e) => p.includes(e.chave));
  return achada ? achada.r : null;
}

export function retratoDe(ente, mundo) {
  if (!ente || typeof ente !== "object") return null;
  const m = mundo && typeof mundo === "object" ? mundo : {};
  if (ente.classe) {
    const raca = racaPintada(ente.raca);
    const classe = nomeCanonico(ente.classe, CLASSE_POR_FIO);
    if (!raca || !classe) return null;
    return daCelula(`gente:${raca}|${sexoDe(ente, m)}|${classe}`, ente, m);
  }
  if (ente.especie) return especieDoNome(ente.especie);
  if (SINAIS_DE_GENTE.some((k) => ente[k])) return daGente(ente, m);
  return especieDoNome(ente.nome);
}

/* a pessoa sem ficha de herói: o traje do papel e a raça do registo (ou do povo) */
function daGente(ente, m) {
  const papel = [ente.papel, ente.oficio].filter((x) => typeof x === "string" && x.trim()).join(" ");
  const bicho = papel ? especieDoNome(papel) : null;
  if (bicho && ESPECIES_QUE_SAO_GENTE.has(bicho.chave)) return bicho;
  const semente = String(m.semente ?? ente.semente ?? ente.nome ?? "");
  const dita = typeof ente.raca === "string" ? ente.raca.trim() : "";
  const raca = dita ? racaPintada(dita) : racaPintada(racaDeCompanheiro({ semente, nome: ente.nome }));
  if (!raca) return null;
  const p = palavras(papel);
  const doPapel = O_TRAJE_DO_PAPEL.find((t) => t.rx.test(p));
  const classe = doPapel ? doPapel.classe : TRAJES_DA_RUA[hashSemente("traje|" + semente) % TRAJES_DA_RUA.length];
  return daCelula(`gente:${raca}|${sexoDe(ente, m)}|${classe}`, ente, m);
}

/* ---------------- recorteDoRetrato ----------------
   O quadrado de cada tamanho, em fração da matriz: canto = centro − lado/2,
   preso ao quadro. O do tamanho pedido prende-se, ainda, DENTRO do da
   ficha, que é tudo o que o arquivo tem — assim a imagem cobre sempre o
   disco, mesmo com o rosto no limite. Com `s = lado / kc`: a imagem tem
   largura `kf·s`, `left = (xf − xc)·s`, `top = (yf − yc)·s`, dentro de um
   disco `overflow: hidden; border-radius: 50%`. */
const prende = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function quadrado(entrada, tamanho) {
  const k = RETRATO.recorte[tamanho];
  const [x, y] = tamanho === "ficha"
    ? [(entrada.cx + RETRATO.ficha.puxaAoMeio) / 2, RETRATO.ficha.alturaDoCentro]
    : [entrada.cx, entrada.olhos + RETRATO.abaixoDosOlhos[tamanho]];
  return { k, x: prende(x - k / 2, 0, 1 - k), y: prende(y - k / 2, 0, 1 - k) };
}

export function tamanhoDoRetrato(lado) {
  return lado <= RETRATO.limiar.chip ? "chip" : lado <= RETRATO.limiar.cartao ? "cartao" : "ficha";
}

export function recorteDoRetrato(entrada, lado) {
  if (!entrada || typeof entrada !== "object") return null;
  if (!Number.isFinite(entrada.cx) || !Number.isFinite(entrada.olhos)) return null;
  const px = Number(lado);
  if (!Number.isFinite(px) || px <= 0) return null;
  const tamanho = tamanhoDoRetrato(px);
  const f = quadrado(entrada, "ficha");
  const c = quadrado(entrada, tamanho);
  const xc = prende(c.x, f.x, f.x + f.k - c.k);
  const yc = prende(c.y, f.y, f.y + f.k - c.k);
  const s = px / c.k;
  /* ao milésimo de px: a conta em vírgula flutuante deixa 1e-14 onde é 0 */
  const px3 = (v) => Math.round(v * 1000) / 1000 + 0;
  return { tamanho, largura: px3(f.k * s), esquerda: px3((f.x - xc) * s), topo: px3((f.y - yc) * s) };
}
