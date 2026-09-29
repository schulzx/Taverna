/* ============================================================
   A SONDA DAS PAREDES (Fase MM) — nenhuma luta pode não acabar

   A PERGUNTA QUE ELA RESPONDE: em alguma planta da casa, com algum tipo
   de inimigo, a luta chega ao teto de rodadas sem vencedor? Uma luta que
   não pode acabar é o jogo parado — o jogador clica, ninguém chega a
   ninguém, e o teto é a única saída.

   O ACHADO É DE MM7: `moverInimigos` era gulosa em linha reta, e o balcão
   da taverna prendia quem estava do lado errado dele. O conserto é o
   caminho de verdade (`passoAteAlcancar`, grid.js); esta sonda é a régua
   dele, e o que ela guarda como catraca é ZERO TRAVAS.

   O MOLDE É O DE MM7, E NADA NASCE AQUI. A luta é `lutaDosAtiradores`
   (`sonda-dos-atiradores.mjs`), com as peças de produção — `montarGrade`,
   `posicionar`, `moverInimigos`, `turnoDosInimigos`, `turnoDosCompanheiros`
   —, a sorte da régua e o mesmo herói. Esta sonda só escolhe a planta, a
   luta e o jogador, e conta.

   AS PLANTAS SÃO TODAS AS DE `PLANTAS` (grid.js), lidas de lá: planta nova
   entra na sonda no dia em que nasce.

   OS INIMIGOS são os quatro jeitos de andar que o tabuleiro conhece: quem
   luta de perto (Soldado), quem dispara (Atirador), quem conjura (Mago) e
   quem é grande demais para certos vãos (Ogro, lado 2, alcance de 3 m) —
   sozinhos contra o herói, e em bando contra o grupo.

   OS JOGADORES são quatro, porque a trava depende de quem anda:
     · caminho     o jogador de verdade: escolhe a casa, e a tela mostra-lhe
                   por onde se chega (o mesmo `passoAteAlcancar`);
     · companheiro o herói movido por `moverInimigos`, como o App move o
                   grupo — foi assim que a sonda de MM7 viu a trava;
     · espera      o herói que não sai do lugar: os inimigos TÊM de vir;
     · abrigo      o mesmo, mas colado a uma parede que o esconde do
                   inimigo mais perto — "escondo-me atrás do balcão".

   EMPATE E TRAVA NÃO SÃO A MESMA COISA, e a sonda conta os dois:
     · empate  a luta chegou ao teto sem vencedor;
     · trava   empate em que ninguém atacou ninguém nas últimas
               `rodadasParadas` rodadas — ninguém alcança ninguém.
   A trava é o defeito puro (os dois lados parados). Mas há empate que é o
   mesmo defeito visto de um lado só: o herói preso atrás do balcão
   enquanto o mago o alveja — ataques há, e a luta não pode acabar. Por
   isso a catraca é sobre EMPATES, e só `EMPATES_DE_DESENHO` os tem.
   ============================================================ */

import { carregar, lutaDosAtiradores, AMOSTRA_DOS_ATIRADORES } from "./sonda-dos-atiradores.mjs";

/* ---------------- AS TABELAS DA SONDA ---------------- */

/* O contexto que `cenarioDe` lê para cada planta — a masmorra entra pela
   porta dela; as outras, pelo nome do lugar, que é o id da planta. */
export const CONTEXTO_DA_PLANTA = (id) => (id === "masmorra" ? { emMasmorra: true } : { local: id });

export const LUTAS_DAS_PAREDES = {
  lutador: { grupo: false, inimigos: ["Soldado", "Soldado"] },
  atirador: { grupo: false, inimigos: ["Soldado", "Atirador"] },
  conjurador: { grupo: false, inimigos: ["Soldado", "Mago"] },
  grande: { grupo: false, inimigos: ["Ogro", "Soldado"] },
  bando: { grupo: true, inimigos: ["Soldado", "Ogro", "Atirador", "Mago"] },
};
export const JOGADORES_DAS_PAREDES = ["caminho", "companheiro", "espera", "abrigo"];

/* `n` lutas por célula (planta × luta × jogador); `rodadasParadas` é o
   silêncio que faz de um empate uma trava. O teto de rodadas é o de MM7. */
export const AMOSTRA_DAS_PAREDES = { n: 30, prefixo: "paredes", rodadasParadas: 5 };

/* O EMPATE DE DESENHO — o único que a catraca aceita. O herói que não sai
   do lugar (`espera`, `abrigo`) diante de quem o alcança de onde ele não
   alcança — o arqueiro e o mago no posto (MM7), o ogro com os seus 3 m
   contra a espada de 1,5 m — leva golpes e não devolve: a luta dura até
   ele cair ou o teto chegar. Não é trava (quem ataca, ataca), e não é
   defeito do tabuleiro: é o jogador que escolheu não ir. O jogador que
   anda (`caminho`) e o grupo (`companheiro`) não empatam em lado nenhum. */
export const EMPATES_DE_DESENHO = {
  jogadores: ["espera", "abrigo"],
  lutas: ["atirador", "conjurador", "grande"],
};

/* O RETRATO — medido a 30 lutas por célula (sementes `paredes|0..29`), no
   dia em que o caminho entrou (29/09/2026). `antes` com a árvore de HEAD
   (d32bc54, v9.313) e o mesmo jogador de caminho (`passoAteAlcancar`
   enxertada, sem tocar em `moverInimigos`); `depois` com o conserto. Só
   as células com empate aparecem; as outras eram zero.
   Formato: `planta: { luta: { jogador: [empates, travas] } }`.

   `balanco` é o jogador de caminho, 140 lutas por luta (sementes
   `balanco|0..139`), a média das cinco lutas de cada planta: o dano no
   herói e a fração de vitórias. As plantas sem parede dão o MESMO número
   antes e depois — é a regressão zero em campo aberto, medida.

   `semPilha` É A ETAPA SEGUINTE (29/09, depois de v9.315): `moverInimigos`
   passou a atualizar a ocupação a cada um que anda, e dois corpos deixaram
   de acabar na mesma casa. Medido com a mesma bateria, sobre a árvore de
   cc126b9 (v9.314) e com o conserto: `sobreposicoes` conta as rodadas
   que terminavam com duas criaturas numa casa só — 7390 de 42937 antes
   (17%), zero depois. Os empates que mexeram são todos de desenho (o ogro
   contra quem espera: 3 → 5 em quatro células); o balanço por planta
   mexeu no máximo 1,2% sobre v9.314, e as plantas sem parede deixam de
   dar o mesmo número porque a ocupação vale também em campo aberto —
   três soldados na estrada iam para a mesma casa (4,6). `antes` e
   `depois` ficam como estavam: são o registro da etapa das paredes. */
export const RETRATO_DAS_PAREDES = {
  n: 30,
  antes: {
    taverna: { lutador: { companheiro: [30, 30] }, atirador: { espera: [5, 0], abrigo: [10, 0] }, conjurador: { companheiro: [13, 0], espera: [5, 0], abrigo: [9, 0] } },
    masmorra: { atirador: { espera: [7, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] } },
    floresta: { atirador: { espera: [7, 0], abrigo: [7, 0] }, conjurador: { espera: [5, 0], abrigo: [5, 0] } },
    estrada: { atirador: { espera: [5, 0], abrigo: [5, 0] }, conjurador: { espera: [5, 0], abrigo: [5, 0] } },
    cidade: { atirador: { espera: [5, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [10, 0] } },
    caverna: { atirador: { espera: [7, 0], abrigo: [10, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] }, grande: { espera: [3, 0] } },
    ruina: { atirador: { espera: [7, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] }, grande: { espera: [3, 0] } },
    navio: { atirador: { espera: [7, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] }, grande: { espera: [5, 0] } },
    gelo: { atirador: { espera: [7, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] }, grande: { abrigo: [30, 30] } },
    deserto: { atirador: { espera: [7, 0], abrigo: [7, 0] }, conjurador: { espera: [5, 0], abrigo: [5, 0] }, grande: { espera: [3, 0], abrigo: [3, 0] } },
  },
  depois: {
    taverna: { atirador: { espera: [5, 0], abrigo: [10, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] } },
    masmorra: { atirador: { espera: [7, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] } },
    floresta: { atirador: { espera: [7, 0], abrigo: [7, 0] }, conjurador: { espera: [5, 0], abrigo: [5, 0] } },
    estrada: { atirador: { espera: [5, 0], abrigo: [5, 0] }, conjurador: { espera: [5, 0], abrigo: [5, 0] } },
    cidade: { atirador: { espera: [5, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [10, 0] } },
    caverna: { atirador: { espera: [7, 0], abrigo: [10, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] }, grande: { espera: [3, 0] } },
    ruina: { atirador: { espera: [7, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] }, grande: { espera: [3, 0] } },
    navio: { atirador: { espera: [7, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] }, grande: { espera: [5, 0] } },
    gelo: { atirador: { espera: [7, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] }, grande: { abrigo: [13, 0] } },
    deserto: { atirador: { espera: [7, 0], abrigo: [7, 0] }, conjurador: { espera: [5, 0], abrigo: [5, 0] }, grande: { espera: [3, 0], abrigo: [3, 0] } },
  },
  semPilha: {
    taverna: { atirador: { espera: [5, 0], abrigo: [10, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] } },
    masmorra: { atirador: { espera: [7, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] } },
    floresta: { atirador: { espera: [7, 0], abrigo: [7, 0] }, conjurador: { espera: [5, 0], abrigo: [5, 0] } },
    estrada: { atirador: { espera: [5, 0], abrigo: [5, 0] }, conjurador: { espera: [5, 0], abrigo: [5, 0] } },
    cidade: { atirador: { espera: [5, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [10, 0] } },
    caverna: { atirador: { espera: [7, 0], abrigo: [10, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] }, grande: { espera: [5, 0] } },
    ruina: { atirador: { espera: [7, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] }, grande: { espera: [5, 0] } },
    navio: { atirador: { espera: [7, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] }, grande: { espera: [5, 0] } },
    gelo: { atirador: { espera: [7, 0], abrigo: [13, 0] }, conjurador: { espera: [5, 0], abrigo: [9, 0] }, grande: { abrigo: [13, 0] } },
    deserto: { atirador: { espera: [7, 0], abrigo: [7, 0] }, conjurador: { espera: [5, 0], abrigo: [5, 0] }, grande: { espera: [5, 0], abrigo: [5, 0] } },
  },
  sobreposicoes: { antes: 7390, depois: 0, rodadasAntes: 42937, rodadasDepois: 43039 },
  balanco: {
    n: 140,
    antes: {
      taverna: { dano: 11.12, vitoria: 0.996 },
      masmorra: { dano: 10.89, vitoria: 0.996 },
      floresta: { dano: 11.05, vitoria: 0.996 },
      estrada: { dano: 16.73, vitoria: 0.980 },
      cidade: { dano: 12.20, vitoria: 0.997 },
      caverna: { dano: 11.31, vitoria: 0.996 },
      ruina: { dano: 11.35, vitoria: 0.996 },
      navio: { dano: 11.63, vitoria: 0.996 },
      gelo: { dano: 11.37, vitoria: 0.996 },
      deserto: { dano: 11.37, vitoria: 0.996 },
    },
    depois: {
      taverna: { dano: 11.17, vitoria: 0.996 },
      masmorra: { dano: 10.82, vitoria: 0.996 },
      floresta: { dano: 11.05, vitoria: 0.996 },
      estrada: { dano: 16.73, vitoria: 0.980 },
      cidade: { dano: 12.20, vitoria: 0.997 },
      caverna: { dano: 11.31, vitoria: 0.996 },
      ruina: { dano: 10.34, vitoria: 0.997 },
      navio: { dano: 11.30, vitoria: 0.997 },
      gelo: { dano: 11.37, vitoria: 0.996 },
      deserto: { dano: 11.37, vitoria: 0.996 },
    },
    semPilha: {
      taverna: { dano: 11.19, vitoria: 0.996 },
      masmorra: { dano: 10.95, vitoria: 0.996 },
      floresta: { dano: 11.05, vitoria: 0.996 },
      estrada: { dano: 16.80, vitoria: 0.980 },
      cidade: { dano: 12.14, vitoria: 0.997 },
      caverna: { dano: 11.35, vitoria: 0.996 },
      ruina: { dano: 10.38, vitoria: 0.997 },
      navio: { dano: 11.20, vitoria: 0.997 },
      gelo: { dano: 11.34, vitoria: 0.996 },
      deserto: { dano: 11.34, vitoria: 0.996 },
    },
  },
};

/* O LIMITE — trava nenhuma, em planta nenhuma, com jogador nenhum; empate
   só os de desenho. E o balanço não pode mudar mais do que `balanco` em
   planta nenhuma (o dano médio no herói do jogador de caminho, `balanco`
   do retrato): o conserto é de caminho, não de dificuldade. Dentro de uma
   planta, a luta que tinha a trava dentro PODE mudar mais — na ruína, o
   soldado ficava colado ao muro caído do lado errado e o herói dava a
   volta até ele debaixo dos disparos do mago (conjurador 13,24 → 9,94);
   ali o número novo é o certo. */
/* `sobreposicoes`: rodada nenhuma termina com dois corpos na mesma casa. */
export const LIMITE_DAS_PAREDES = { travas: 0, balanco: 0.1, sobreposicoes: 0 };

/* ---------------- A MEDIDA ---------------- */

export function sondarParedes(M, { n = AMOSTRA_DAS_PAREDES.n, prefixo = AMOSTRA_DAS_PAREDES.prefixo,
  plantas = Object.keys(M.grid.PLANTAS), lutas = Object.keys(LUTAS_DAS_PAREDES), jogadores = JOGADORES_DAS_PAREDES } = {}) {
  const teto = AMOSTRA_DOS_ATIRADORES.tetoDeRodadas;
  const out = {};
  for (const p of plantas) {
    out[p] = {};
    for (const l of lutas) {
      out[p][l] = {};
      for (const j of jogadores) {
        const c = { empates: 0, travas: 0, dano: 0, vitoria: 0, rodadas: 0, sobreposicoes: 0 };
        for (let i = 0; i < n; i++) {
          const r = lutaDosAtiradores(M, l, `${prefixo}|${i}`, { planta: CONTEXTO_DA_PLANTA(p), luta: LUTAS_DAS_PAREDES[l], passo: j });
          const empate = !r.vitoria && r.rodadas >= teto;
          if (empate) c.empates++;
          c.sobreposicoes += r.sobreposicoes || 0;
          if (empate && teto - r.ultimoAtaque >= AMOSTRA_DAS_PAREDES.rodadasParadas) c.travas++;
          c.dano += r.danoNoHeroi / n; c.vitoria += r.vitoria / n; c.rodadas += r.rodadas / n;
        }
        out[p][l][j] = c;
      }
    }
  }
  return out;
}

/* rodado direto: `node sonda-das-paredes.mjs [raiz-dos-modulos] [n]` */
if (process.argv[1] && process.argv[1].endsWith("sonda-das-paredes.mjs")) {
  const t0 = Date.now();
  const raiz = process.argv[2] ? new URL("file:///" + process.argv[2].replace(/\\/g, "/").replace(/^\/+/, "") + "/").href : undefined;
  const M = await carregar(raiz);
  const m = sondarParedes(M, { n: Number(process.argv[3]) || AMOSTRA_DAS_PAREDES.n });
  const f = (x) => x.toFixed(2);
  for (const [p, porLuta] of Object.entries(m)) {
    for (const [l, porJog] of Object.entries(porLuta)) {
      console.log(`${p.padEnd(9)} ${l.padEnd(11)} ` + Object.entries(porJog)
        .map(([j, c]) => `${j}: ${c.empates}e/${c.travas}t/${c.sobreposicoes}s dano ${f(c.dano)} vit ${(c.vitoria * 100).toFixed(0)}% rod ${f(c.rodadas)}`).join(" · "));
    }
  }
  console.log("JSON " + JSON.stringify(m));
  console.log(`(${Date.now() - t0} ms)`);
}
