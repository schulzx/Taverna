/* ============================================================
   O RITMO DA REAÇÃO (v9.258) — quem é perguntado, e quanto isso custa

   A doença que este módulo cura tem número. O relógio da janela de
   reação dispara POR GOLPE RECEBIDO: `turnoDosInimigos` devolve a rodada
   inteira numa lista só, e o App chama a reação em cada golpe que cai no
   herói. Com quatro inimigos comuns na mesa são quatro janelas de 15 s —
   **60 000 ms de espera numa única rodada**. Com quatro lendários de
   nível ≥ 12 (três golpes cada) são doze janelas: 180 000 ms. Três
   minutos, e ninguém desenhou nada de mau para chegar lá.

   A folga de quinze segundos é para quem precisa dela. Não é um pedágio
   para todos — e um pedágio é exatamente no que ela se transforma quando
   é cobrada uma vez por golpe.

   A cura é uma frase: **a janela é da RODADA, não do golpe.** Ela abre no
   primeiro golpe que passa todas as portas, os outros ficam COBERTOS, e a
   rodada inteira custa uma janela. A pergunta toma a forma do recurso que
   ela gasta — a reação já era uma por rodada.

   Nada disto aparece na tela. O cartão é o mesmo cartão, no mesmo sítio:
   o jogador não aprende um mecanismo, ele apenas nunca é perguntado duas
   vezes na mesma rodada. O melhor agrupamento é aquele de que não há
   nada a dizer.

   Puro, sem React, sem `Math.random`: dada a rodada, a resposta é sempre
   a mesma em qualquer máquina.
   ============================================================ */

import { reacoesDe } from "./reacoes.js";

/* ---------------- O RELÓGIO ----------------
   `janela` é o orçamento inteiro, e é da pessoa (15 s, decisão de 15/09).
   `folga`/`trilho`/`aperto` são a repartição que o `desenho` mediu: onze
   segundos SEM relógio nenhum, depois o trilho, e o último segundo
   apertado. Os 4 000 ms do trilho são os 4 s que K1 mediu e provou
   (1,5 s de reconhecer + 0,513 s de Fitts, dobrados = 4,03 s): K1 tinha o
   número certo no papel errado — ele é o PRAZO, não a janela.

   Os bónus somam-se ao TRILHO, não à janela: +1 000 sobre 4 000 são os
   mesmos +25% que K1 mediu; sobre 15 000 seriam +6,7%, que é não pagar.
   A lei dos bónus é de DIREÇÃO — `prefers-reduced-motion` não pode virar
   desvantagem de jogo —, e uma fixação custa ~250 ms tanto numa janela de
   4 s como numa de 15.

   `folgado: 8000` NÃO EXISTE, e o motivo fica escrito para que ninguém o
   reponha por distração: ele nasceu para ser o DOBRO de um `normal` de
   4 000. Com `normal` a 15 000 um `folgado` mais curto seria castigo, e um
   mais longo não tem estrada que o alcance — o degrau do meio da escada,
   que era a única porta até ele, morreu junto. Regra sem leitor é export
   morto no dia em que nasce. E a hipótese que o sustentava — "ele é só
   lento" — desapareceu na conta: 15 000 / 4 030 = 3,72× o tempo medido.
   Quem quer o jogo à sua espera tem `parado`, que é a saída de
   conformidade WCAG 2.2.1 (Timing Adjustable, nível A); quem expira duas
   vezes tem o silêncio. */
export const RITMO_DA_REACAO = [
  { id: "normal", janela: 15000, folga: 11000, trilho: 4000, aperto: 1000, bonusContagem: 1000, bonusToque: 600 },
  { id: "parado", janela:     0, folga:     0, trilho:    0, aperto:    0, bonusContagem:    0, bonusToque:   0 },
];

/* A primeira expiração é de graça, e isso carrega decisão: podia calar-se
   logo. À segunda seguida a luta não pergunta mais. O contador zera na
   primeira resposta, e a escada recomeça na luta seguinte sem pedir nada
   a ninguém. */
export const ESCADA_DO_SILENCIO = [
  { seguidas: 1, faz: "nada"     },
  { seguidas: 2, faz: "silencio" },  // pelo resto DESTA luta
];

/* O TETO, e a conta que o gera. `msPorRodada` é o pior caso de uma rodada
   (a janela inteira mais os dois bónus); `msEntreRespostas` é o que
   importa de verdade — um teto por rodada multiplicado por um número de
   rodadas sem limite não é teto nenhum. O que se prova é: entre duas
   respostas do jogador, o sistema nunca o faz esperar mais do que isto,
   porque à segunda expiração seguida a escada cala pelo resto da luta e
   sair do silêncio exige uma resposta dele. */
export const TETO_DA_ESPERA = {
  janelasPorRodada: 1, janelasAteOSilencio: 2,
  msPorRodada: 16600,      // 15000 + 1000 (contagem) + 600 (toque)
  msEntreRespostas: 33200, // 2 janelas: um teto por rodada × rodadas sem limite não é teto
};

/* O piso do golpe: aparar um arranhão desperdiça o recurso que salvaria a
   vida no golpe seguinte. DÍVIDA DECLARADA: o mesmo 0,08 está escrito à
   mão em `reacoes.js` (dentro de `escolherReacao`). Aqui ele ganha nome; a
   suíte prova que os dois concordam, e K3 colapsa-os extraindo
   `reacoesQueSeAplicam` para `reacoes.js`. */
export const PISO_DO_GOLPE = 0.08;

/* As oito razões por que a janela NÃO abre. Ordem = precedência: a razão
   devolvida é a primeira que se aplica. Não é tabela de números, e existe
   por uma razão de suíte — é o que deixa provar POR QUE a janela não
   abriu, em vez de só provar que não abriu. */
export const PORTAS_DA_JANELA = [
  { id: "preferencia",  porque: "o jogador travou um verbo na ficha — o sistema faz e não pergunta" },
  { id: "silencio",     porque: "duas janelas expiraram nesta luta; o jogo cala-se até ela acabar" },
  { id: "reacao_gasta", porque: "a reação é uma por rodada, e já foi usada" },
  { id: "ja_respondeu", porque: "ele já respondeu uma janela nesta rodada" },
  { id: "sem_reacao",   porque: "nenhuma reação da ficha responde a este gatilho" },
  { id: "sem_pm",       porque: "todas as que respondem custam mais PM do que ele tem" },
  { id: "so_magia",     porque: "só sobram reações que mordem magia, e o golpe é físico" },
  { id: "arranhao",     porque: "o golpe é pequeno demais para valer o recurso" },
];

const ritmoPorId = (id) => RITMO_DA_REACAO.find((r) => r.id === id) || RITMO_DA_REACAO[0];

/* O limiar de `escolherReacao`, com o mesmo nome e a mesma conta:
   `max(minDano da reação, round(vidaMax × PISO_DO_GOLPE))`. */
const limiarDoGolpe = (reacao, vidaMax) => Math.max(reacao.minDano || 0, Math.round((vidaMax || 20) * PISO_DO_GOLPE));

/* ---------------- A OFERTA ----------------
   A LISTA NUNCA CONSULTA O DANO, e esta é a decisão da pessoa virada
   catraca ("o dano vir surpresa", 15/09). Filtra por gatilho, por PM e
   por `soMagia` — e mais nada.

   Porquê, e é a porta que faltava fechar: os `minDano` diferem por reação
   (contramágica 4, escudo arcano 6, aparar 5, esquiva ágil 4). Uma lista
   filtrada por dano MUDARIA DE TAMANHO com a faixa do golpe — e o tamanho
   da lista seria o dano com outro rosto, que o jogador aprenderia a ler em
   duas lutas. O limiar decide SE a janela abre (porta `arranhao`), nunca
   O QUE ela oferece.

   O que isto custa, assumido: a janela pode oferecer um verbo cujo
   `minDano` aquele golpe não alcança, e o jogador pode escolhê-lo. Está
   certo — `minDano` é a economia do SISTEMA ("não gastes a reação num
   arranhão"), não um chão sobre o que o jogador pode escolher. E paga
   duas vezes: a lista passa a ser a mesma em toda a luta, e uma lista que
   não muda lê-se uma vez.

   Sem o `Math.random()` da `chance`: `chance` diz se a reação FUNCIONA,
   não se ela é OFERECIDA. Uma janela deve abrir mesmo quando a esquiva
   pode falhar. */
function ofertaDoGolpe(heroi, gatilho, tipoDano) {
  const doGatilho = reacoesDe(heroi).filter((r) => r.gatilho === gatilho);
  if (!doGatilho.length) return { reacoes: [], porta: "sem_reacao" };
  const pagas = doGatilho.filter((r) => (r.pm || 0) <= (heroi.mana || 0));
  if (!pagas.length) return { reacoes: [], porta: "sem_pm" };
  /* v9.47, em `reacoes.js`: reação que só morde magia não morde uma machadada. */
  const cabem = pagas.filter((r) => !(r.soMagia && (!tipoDano || tipoDano === "fisico")));
  if (!cabem.length) return { reacoes: [], porta: "so_magia" };
  return { reacoes: cabem, porta: null };
}

/* ---------------- A RODADA ----------------
   Dada a rodada inteira, diz qual golpe (se algum) abre a janela, quais
   ficam cobertos, quais foram fechados e por quê, e quanto tempo de
   espera isso custa no pior caso.

   `preferencia`: "normal" | "parado" | um id de reação travado na ficha |
   "deixar_passar". Os dois últimos NÃO abrem janela — o sistema faz o que
   faz hoje, e a pergunta não acontece. */
export function ritmoDaRodada(entrada) {
  /* `= {}` no destructuring NÃO cobre `null`: é lei da casa, e é por isso
     que a entrada é aberta à mão em vez de desestruturada na assinatura. */
  const e = entrada || {};
  const golpes = Array.isArray(e.golpes) ? e.golpes : [];
  const heroi = e.heroi || null;
  const preferencia = e.preferencia || "normal";
  const reacaoGasta = !!e.reacaoGasta;
  const jaRespondeu = !!e.jaRespondeu;
  const expiracoesSeguidas = Number(e.expiracoesSeguidas) || 0;
  const contagem = !!e.contagem;
  const toque = !!e.toque;

  /* a escada, lida da tabela: o degrau mais alto que este contador alcança */
  const degrau = ESCADA_DO_SILENCIO.filter((d) => expiracoesSeguidas >= d.seguidas).pop() || null;
  const silencio = !!degrau && degrau.faz === "silencio";

  const ordemDe = (g, i) => (g && typeof g.ordem === "number" ? g.ordem : i);
  /* a rodada inteira fechada pela mesma razão — nenhuma janela, espera zero */
  const tudoFechado = (porta) => ({
    abre: null,
    cobertos: [],
    fechados: golpes.map((g, i) => ({ ordem: ordemDe(g, i), porta })),
    esperaMs: 0,
    silencio,
  });

  /* AS PORTAS DA RODADA, na precedência de `PORTAS_DA_JANELA`. */
  if (preferencia !== "normal" && preferencia !== "parado") return tudoFechado("preferencia");
  if (silencio) return tudoFechado("silencio");
  if (reacaoGasta) return tudoFechado("reacao_gasta");
  if (jaRespondeu) return tudoFechado("ja_respondeu");
  /* sem ficha não há reação nenhuma que responda — e `reacoesDe(null)` cairia
     no perfil marcial por omissão, oferecendo aparar a quem não existe */
  if (!heroi) return tudoFechado("sem_reacao");

  const ritmo = ritmoPorId(preferencia);
  const fechados = [];

  for (let i = 0; i < golpes.length; i++) {
    const g = golpes[i] || {};
    const ordem = ordemDe(g, i);
    const oferta = ofertaDoGolpe(heroi, g.gatilho, g.tipoDano);
    if (oferta.porta) { fechados.push({ ordem, porta: oferta.porta }); continue; }

    /* O DANO DECIDE SE, NUNCA O QUE. O golpe só paga a janela quando pelo
       menos uma das reações OFERECIDAS passa o limiar — e a lista oferecida
       é a mesma seja qual for o dano. */
    const paga = g.gatilho !== "sofre_dano"
      || oferta.reacoes.some((r) => (Number(g.dano) || 0) >= limiarDoGolpe(r, heroi.vidaMax));
    if (!paga) { fechados.push({ ordem, porta: "arranhao" }); continue; }

    /* A JANELA ABRE AQUI, e é a única da rodada. Os golpes seguintes ficam
       COBERTOS, não enfileirados: é isto que mata os 60 000 ms. */
    const bonus = (contagem ? ritmo.bonusContagem : 0) + (toque ? ritmo.bonusToque : 0);
    const esperaMs = ritmo.janela ? ritmo.janela + bonus : 0;
    return {
      abre: {
        ordem, inimigo: g.inimigo, gatilho: g.gatilho,
        reacoes: oferta.reacoes,
        ritmo: ritmo.id,
        /* NENHUMA destas grandezas olha o dano, e é de propósito: a janela
           durar mais quando o golpe é maior faria o relógio SER o dano —
           a mais tentadora das portas, porque soa a generosidade.
           Os bónus engordam o TRILHO; a folga muda é a mesma sempre. */
        janelaMs: ritmo.janela ? ritmo.janela + bonus : 0,
        folgaMs: ritmo.folga,
        trilhoMs: ritmo.trilho ? ritmo.trilho + bonus : 0,
        apertoMs: ritmo.aperto,
      },
      cobertos: golpes.slice(i + 1).map((x, k) => ordemDe(x, i + 1 + k)),
      fechados,
      esperaMs,
      silencio,
    };
  }

  return { abre: null, cobertos: [], fechados, esperaMs: 0, silencio };
}
