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

   Puro, sem React: dada a rodada, a resposta é sempre a mesma em qualquer
   máquina. A PERGUNTA (`ritmoDaRodada`) não rola dado nenhum e a suíte
   prova-o com o rolador global a estourar; a RESOLUÇÃO DO SILÊNCIO
   (`reacaoDoSilencio`, K2) rola exactamente o que o motor de hoje rolaria,
   nem mais nem menos, e recebe o rolador por parâmetro para que a suíte o
   possa semear e contar.
   ============================================================ */

import { reacoesDe, escolherReacao } from "./reacoes.js";

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

/* As nove razões por que a janela NÃO abre. Ordem = precedência: a razão
   devolvida é a primeira que se aplica. Não é tabela de números, e existe
   por uma razão de suíte — é o que deixa provar POR QUE a janela não
   abriu, em vez de só provar que não abriu.

   A NONA NASCEU EM K2 (`escondida`), E É A PRIMEIRA DE TODAS. O motivo de
   ela vir antes da preferência e antes do silêncio não é hierarquia de
   importância: é que as outras oito dizem «não perguntes», e esta diz
   «não esperes». Numa aba de fundo o navegador limita o temporizador a
   ~1 Hz, depois a ~1/min, e sob congelamento pode não o disparar nunca —
   uma janela de 15 s dispara aos 15 s, aos 40 s, ou nunca. A rodada de
   hoje é um laço síncrono; suspendê-la à espera de um temporizador que
   pode não vir é deixar a luta morrer no meio, e *nunca pode custar o
   turno* não é lei de conforto.

   Logo a janela NASCE JÁ FECHADA: resolve-se como hoje, na hora, e a
   rodada segue. E porque nenhuma janela abriu, nenhuma expirou — a porta
   NÃO alimenta a escada do silêncio: uma expiração que o jogador nunca
   viu não é uma expiração dele. Isto não custa nada a ninguém: quem está
   noutro separador recebe o jogo de hoje, que é por definição o que esta
   fase promete, e a lei do turno é paga pela porta da frente em vez de
   com um teto de socorro. */
export const PORTAS_DA_JANELA = [
  { id: "escondida",    porque: "a aba está escondida; o temporizador não é garantido, e a rodada não espera por ninguém" },
  { id: "preferencia",  porque: "o jogador travou um verbo na ficha — o sistema faz e não pergunta" },
  { id: "silencio",     porque: "duas janelas expiraram nesta luta; o jogo cala-se até ela acabar" },
  { id: "reacao_gasta", porque: "a reação é uma por rodada, e já foi usada" },
  { id: "ja_respondeu", porque: "ele já respondeu uma janela nesta rodada" },
  { id: "sem_reacao",   porque: "nenhuma reação da ficha responde a este gatilho" },
  { id: "sem_pm",       porque: "todas as que respondem custam mais PM do que ele tem" },
  { id: "so_magia",     porque: "só sobram reações que mordem magia, e o golpe é físico" },
  { id: "arranhao",     porque: "o golpe é pequeno demais para valer o recurso" },
];

/* ---------------- QUEM JOGA SEM MOUSE ----------------
   *O jogador faz menos para conseguir o mesmo — contado, não sentido.* É
   lei da casa e é a WCAG 2.1.1; e como é número, é tabela. `ponteiro` e
   `teclado` contam GESTOS até ao mesmo desfecho, do instante em que o
   cartão aparece.

   O único desfecho que custa uma tecla a mais é escolher um SEGUNDO verbo
   do leque — e o leque não expira (o relógio morre no primeiro input, seja
   ele qual for), logo a tecla a mais não é paga em tempo. A paridade que
   interessa não é de gestos: é de resultado sob relógio.

   No caso comum (`Etapa=Direta`) só existem *aceitar* e *recusar*, e essas
   duas custam exactamente o mesmo às duas mãos. */
export const ATALHOS_DA_JANELA = [
  { id: "aceitar",  tecla: "Enter",  ponteiro: 1, teclado: 1 },   // o verbo Armado
  { id: "recusar",  tecla: "Escape", ponteiro: 1, teclado: 1 },   // o recuo
  { id: "escolher", tecla: "ArrowDown/ArrowUp + Enter", ponteiro: 1, teclado: 2 },
];

const ritmoPorId = (id) => RITMO_DA_REACAO.find((r) => r.id === id) || RITMO_DA_REACAO[0];

/* O número do golpe na rodada. Subiu de dentro de `ritmoDaRodada` para o
   topo do módulo em K2, para que a pergunta e a resolução do silêncio
   contem os golpes pela MESMA régua — `abre.ordem` de uma tem de poder
   entrar como `desde` na outra sem tradução. */
const ordemDe = (g, i) => (g && typeof g.ordem === "number" ? g.ordem : i);

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
  const escondida = !!e.escondida;

  /* a escada, lida da tabela: o degrau mais alto que este contador alcança */
  const degrau = ESCADA_DO_SILENCIO.filter((d) => expiracoesSeguidas >= d.seguidas).pop() || null;
  const silencio = !!degrau && degrau.faz === "silencio";

  /* a rodada inteira fechada pela mesma razão — nenhuma janela, espera zero */
  const tudoFechado = (porta) => ({
    abre: null,
    cobertos: [],
    fechados: golpes.map((g, i) => ({ ordem: ordemDe(g, i), porta })),
    esperaMs: 0,
    silencio,
  });

  /* AS PORTAS DA RODADA, na precedência de `PORTAS_DA_JANELA`.

     A `escondida` vem ANTES da preferência e antes do silêncio porque é a
     única que não fala do jogo: fala da máquina. As outras respondem «por
     que não perguntar»; esta responde «por que não é possível esperar», e
     uma condição que torna a resposta inalcançável precede toda razão para
     não a pedir. Quem está noutro separador recebe o jogo de hoje, na
     hora — e a escada não conta um degrau que ele nunca viu. */
  if (escondida) return tudoFechado("escondida");
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

/* ---------------- A OUTRA METADE: QUEM NÃO RESPONDE ----------------
   `ritmoDaRodada` diz SE a janela abre. Esta diz o que acontece quando ela
   não abre — ou abre e ninguém responde. É o mesmo assunto, e por isso
   mora no mesmo arquivo: separar a pergunta da resposta em dois módulos
   seria escrever duas dívidas sobre uma coisa só.

   O CONTRATO, numa frase: quem não responde tem o jogo de hoje, byte a
   byte. Não é «o resultado parece o mesmo» — é «o fluxo de dados não
   desalinha», e num sistema sem servidor o fluxo de dados É o resultado,
   de todo o resto da partida em diante. Por isso a função devolve
   `rolos`: o número de vezes que a resolução consumiu o rolador é tão
   load-bearing como a reação que ela escolheu.

   [R1] «COBERTO» QUER DIZER *NÃO GERA SEGUNDA PERGUNTA*, NUNCA *NÃO GERA
   REAÇÃO*. O laço corre a partir de `desde` por TODOS os golpes, como o
   laço de hoje corre. O desenho óbvio — resolver só o golpe da janela —
   custa 39,8 % das sementes e 12,3 % de sobrevivência ao furtivo, porque
   `escolherReacao` devolve `null` quando a `chance` falha e o laço de hoje
   TENTA O GOLPE SEGUINTE. A esquiva do ladino não vale os 60 % do
   catálogo: vale os 97,6 % de quatro apostas seguidas.

   NÃO REIMPLEMENTA `escolherReacao` — CHAMA-A. Regra duplicada é a pior
   das dívidas: parte em silêncio no dia em que uma das cópias muda. */

/* O CINTO DA SUÍTE, e ele não é hipocrisia — é o contrário dela.
   `escolherReacao` rola o dado da `chance` chamando o rolador global
   directamente, e este módulo não a pode reescrever: extrair
   `reacoesQueSeAplicam` é trabalho de K3, e a regra [R4] diz porquê não a
   antecipar — mover o rolo da oferta para a resolução muda o mundo de quem
   RESPONDE, e esse mundo não está travado por nada ainda.

   Então o rolador entra pela única porta que existe hoje: o global,
   substituído à volta da chamada e reposto em `finally` mesmo se ela
   estourar. Em produção `rolar` é o próprio global e a troca é um no-op
   exacto — trocar a função por ela mesma. O que ela compra é a única coisa
   de que a trava precisa e que de outra forma não teria: CONTAR os rolos e
   SEMEÁ-LOS. Determinismo declarado e determinismo provado são coisas
   diferentes, e a diferença entre as duas é exactamente este parâmetro.

   Hipocrisia seria copiar a regra para aqui e prová-la contra a cópia.
   Estas seis linhas saem inteiras no dia em que `escolherReacao` receber o
   rolador por parâmetro, e nada mais neste arquivo muda. */
export function reacaoDoSilencio(entrada) {
  /* `= {}` no destructuring NÃO cobre `null`: por isso a entrada é aberta
     à mão. E as quatro chaves são as únicas que existem — NENHUMA de
     tempo (é o [T2]: um resultado que dependesse do instante faria o
     navegador ser o Mestre), e NENHUMA da escada (a primeira expiração de
     uma luta não muda nada, e a prova é que não tem por onde). */
  const e = entrada || {};
  const golpes = Array.isArray(e.golpes) ? e.golpes : [];
  const heroi = e.heroi || null;
  const desde = Number(e.desde) || 0;
  const rolar = typeof e.rolar === "function" ? e.rolar : Math.random;

  let rolos = 0;
  const contado = () => { rolos++; return rolar(); };
  const global = Math.random;
  try {
    Math.random = contado;
    for (let i = 0; i < golpes.length; i++) {
      const g = golpes[i] || {};
      const ordem = ordemDe(g, i);
      /* `desde` é uma ORDEM, não um índice — é `abre.ordem` que entra aqui
         quando a janela expira, e a régua tem de ser a mesma dos dois
         lados. Os golpes antes dela já foram resolvidos ou já eram do
         passado da rodada. */
      if (ordem < desde) continue;
      const dano = Number(g.dano) || 0;
      /* o gatilho como o laço de hoje o deriva: acertou dói, errou abre a
         guarda. A lista já vem filtrada pelos golpes que caem no herói —
         é a mesma lista que `ritmoDaRodada` recebe. */
      const gatilho = g.gatilho || (dano > 0 ? "sofre_dano" : "inimigo_erra");
      const escolhida = escolherReacao({
        pers: heroi, gatilho, dano, temReacao: true, tipoDano: g.tipoDano || "fisico",
      });
      /* `null` não pára o laço: é a `chance` que falhou, e hoje o motor
         repete a aposta no golpe seguinte. É AQUI que vivem os 39,8 %. */
      if (!escolhida) continue;
      return { reacao: escolhida, ordem, rolos };
    }
  } finally { Math.random = global; }
  return { reacao: null, ordem: null, rolos };
}

/* ---------------- O PORTÃO DE UMA VIA ----------------
   A corrida que mata: o temporizador dispara DEPOIS de o jogador já ter
   respondido, e a rodada resolve-se duas vezes — duas reações, dois
   débitos de PM, duas linhas no log, o dano cortado a dobrar. Ou o
   inverso: o clique aterra num cartão que já morreu.

   A REGRA DE USO, e é ela que a fiação tem de obedecer: *nenhuma resolução
   acontece fora do ramo `valeu === true`.* O rolo vive DENTRO desse ramo.
   O segundo a chegar recebe `valeu: false`, não entra, e por isso não rola
   — um resultado deitado fora que rolou um dado é pior do que um resultado
   errado: o erro aparece, e o desalinhamento não.

   Estado é SUBSTITUÍDO, nunca mutado: a janela que entra sai intacta, e
   quem fecha recebe uma janela nova. */
export function fecharAJanela(janela, quem) {   // quem: "jogador"|"expirou"|"escondida"|"aba_fechou"
  if (!janela || janela.fechada) return { janela: janela || null, valeu: false, por: (janela || {}).por || null };
  return { janela: { ...janela, fechada: true, por: quem }, valeu: true, por: quem };
}
