/* ============================================================
   BESTIÁRIO E TESTES — Taverna
   Criaturas com nível/ameaça/atributos definidos por TABELA, e
   o decisor de testes: o código diz se uma ação exige rolagem
   ou é trivial para o patamar. O Mestre consulta, não inventa.
   ============================================================ */
import { pvEsperadoInimigo, bonusDeAmeaca } from "./combate.js";
import { pvNaJanela } from "./juiz.js";
import { degrauDaCriatura } from "./degraus.js";
import { ehImportante } from "./queda.js";

/* ---------------- CRIATURAS (fantasia) ---------------- */
/* v9.152: `des` é a destreza de verdade, e `agil` passa a ser o que ele
   sempre foi na prática — "esta criatura é rápida?". Derivar em vez de
   guardar os dois evita a única coisa pior do que um booleano grosseiro:
   um booleano que discorda do número ao lado dele. */
/* v9.259 (Fase N · N2): `degrau` é o SÉTIMO campo e é OPCIONAL — quem não
   declara herda o padrão de `degrauDaCriatura` (ameaça + tipo de mente).
   Declarar é a exceção, e cada declaração abaixo tem um motivo escrito no
   bloco. A regra que obriga o campo a existir: **`brilhante` não se herda,
   declara-se** — herdar o topo é como todo nome inventado pelo Narrador
   nascia com a mente mais afiada da mesa. */
/* v9.268 (Fase Q · Q1): `importante` é o OITAVO campo e é OPCIONAL — quem não
   declara não é importante, e esse é o padrão seguro. Ele responde a uma
   pergunta só: **esta criatura, a 0 PV, cai e rola teste de morte, ou morre
   direto?** (a decisão da pessoa, 14/09: "inimigos importantes podem fazer
   testes de resistência contra morte enquanto os normais morrem direto").
   O critério desta etapa, e ele é de desenho, não de número: declara-se a
   criatura que **aparece sozinha e nomeada na cena**, e cujo fim o jogo perde
   se acontecer sem cena. Um bando não declara; um Lich declara. Cada uma das
   cinco tem o motivo escrito em cima — e nenhuma sai de `ameaca`, que é
   perigo e não papel (`queda.js` explica por que essa derivação é proibida).
   Guardado só quando é `true`: o campo ausente e o campo `false` querem dizer
   a mesma coisa, e guardar os dois seria convidar o save a discordar de si. */
const C = (nome, ameaca, nivelRef, des, desc, perfil = null, degrau = "", importante = false) => ({ nome, ameaca, nivelRef, des: Number(des) || 0, agil: (Number(des) || 0) >= 2, desc, ...(perfil ? { perfil } : {}), ...(degrau ? { degrau } : {}), ...(importante === true ? { importante: true } : {}) });
export const CRIATURAS_FANTASIA = [
  C("Slime", "fraco", 1, -2, "gosma lenta e previsível"),
  C("Rato Gigante", "fraco", 1, 3, "praga de esgoto"),
  C("Lobo", "fraco", 1, 2, "caça em bando"),
  C("Goblin", "fraco", 1, 2, "covarde em grupo pequeno, atrevido em bando"),
  C("Bandido", "comum", 2, 1, "gente desesperada com aço barato"),
  C("Esqueleto", "comum", 2, 1, "osso animado sem medo"),
  C("Zumbi", "comum", 2, -2, "lento, incansável"),
  C("Lobo Atroz", "comum", 3, 2, "alfa de presas longas"),
  C("Cultista", "comum", 3, 0, "fanático com magia menor"),
  /* O DESC DIZ E A MESA NÃO OUVE: "força bruta e pouco cérebro" nunca
     chega à luta, porque `completarInimigo` não copia o `desc`. Sem a
     declaração, o Ogro herdaria `astuto` por ser `competente`. */
  C("Ogro", "competente", 4, -1, "força bruta e pouco cérebro", null, "bruto"),
  C("Troll", "competente", 5, 0, "regenera se não queimar", { ataque: "fisico", fraqueza: ["fogo"], resist: [] }),
  /* Nenhum regex reconhece um elemental, então ele cairia no padrão
     `pensa` e herdaria `astuto`. Fúria de um elemento não faz plano. */
  C("Elemental Menor", "competente", 5, 1, "fúria de um elemento", { ataque: "fogo", resist: ["fogo"], fraqueza: ["gelo"] }, "bruto"),
  C("Golem de Pedra", "elite", 7, -2, "imune a medo, lento e esmagador"),
  /* "Quimera" não casa com o regex de bicho: sem declaração, três cabeças
     de animal herdariam o degrau de um oficial. */
  C("Quimera", "elite", 8, 2, "três cabeças, três mortes", { ataque: "fogo", resist: ["fogo"], fraqueza: [] }, "bruto"),
  C("Gigante", "elite", 9, -1, "cada golpe derruba muralhas", { ataque: "fisico", resist: ["fisico"], fraqueza: [] }, "bruto"),
  /* IMPORTANTE: um dragão nunca é um bando. Ele chega sozinho, com nome, e a
     mesa negocia com ele antes de o enfrentar — a morte dele é o fim de um
     episódio, não o fim de uma rodada. */
  C("Dragão Jovem", "lendario", 10, 2, "sopro devastador, orgulho maior ainda", null, "", true),
  /* O TOPO SE DECLARA. O Lich é morto-vivo e o teto do morto é `bruto` —
     seria o arquimago do jogo com a cabeça de um esqueleto de guarda. */
  /* IMPORTANTE: o filactério é uma trama inteira. Um Lich que cai a 0 PV sem
     cena leva a trama com ele — e é exatamente a criatura que tem algo a
     dizer no chão antes de acabar. */
  C("Lich", "lendario", 12, 1, "arquimago morto-vivo com filactério", null, "brilhante", true),
  /* IMPORTANTE: uma calamidade com asas é o fim da campanha ou o começo dela.
     Nada nesse tamanho pode morrer num número. */
  C("Dragão Ancião", "lendario", 16, 3, "uma calamidade com asas", null, "brilhante", true),
];

/* Arquétipos genéricos — servem a qualquer gênero (sci-fi, cyberpunk, etc.) */
export const ARQUETIPOS = [
  C("Capanga", "fraco", 1, 0, "músculo descartável"),
  C("Batedor", "fraco", 2, 4, "rápido, frágil"),
  /* "treinado e disciplinado" está escrito no desc e não chega à mesa;
     por `ameaca` ele herdaria `bruto`, o degrau do capanga. */
  C("Soldado", "comum", 3, 1, "treinado e disciplinado", null, "astuto"),
  C("Atirador", "comum", 3, 3, "perigoso à distância"),
  C("Brutamontes", "competente", 5, -1, "aguenta e devolve", null, "bruto"),
  /* A PROVA DE QUE `ameaca` SOZINHA NÃO BASTA: Comandante ("perigoso e
     tático") e Sentinela Blindada ("muralha ambulante") são as duas
     `elite` e herdariam o MESMO degrau. A muralha declara; o oficial
     herda `treinado`, que é o que ele é. */
  C("Sentinela Blindada", "elite", 7, -2, "muralha ambulante", { ataque: "fisico", resist: ["fisico"], fraqueza: ["raio"] }, "bruto"),
  /* IMPORTANTE, E É A ÚNICA QUE NÃO É `lendario` — de propósito, porque o
     critério não é perigo. O Comandante é o oficial: aparece nomeado, é com
     ele que se fala, e é ele que se pode render, prender ou interrogar. Ele é
     a criatura por quem Q4 existe; deixá-lo morrer direto seria fechar a porta
     antes de ela ser aberta. */
  C("Comandante", "elite", 8, 2, "perigoso e tático", null, "", true),
  /* O COLOSSO É DUAS CRIATURAS DIFERENTES, DEPENDENDO DE QUEM O LÊ — e o
     motivo da declaração é o caminho real, não o acidente de palavra.
     COM o `desc`, `RX_BICHO` casa "besta" dentro de "máquina/besta de
     cerco" e ele vira bicho: é o retrato de N1, **18 das 27 em `pensa`**.
     SEM o `desc` — que é o que a mesa vê, porque `completarInimigo` não o
     copia e `degrauDaCriatura` roda com nome + ameaça — ele cai no padrão
     `pensa`, e são **19 das 27**. O Colosso é a ÚNICA diferença entre os
     dois retratos.
     Ou seja: sem declaração ele não herdaria `animal`, herdaria
     `treinado`, por ser `lendario` e "pensar" por omissão. Uma máquina de
     cerco com o degrau de um oficial é pior que uma com o de um bicho.
     A declaração fixa o que ele é nos dois caminhos, e não mexe no regex
     (que é comportamento vivo, e conserto de outra etapa). */
  C("Colosso", "lendario", 11, -2, "máquina/besta de cerco", { ataque: "fisico", resist: ["fisico", "veneno"], fraqueza: ["raio"] }, "bruto"),
  /* IMPORTANTE: "o que não deveria existir" é, por definição, um só. O
     Colosso, que é o outro `lendario` daqui, NÃO declara — uma máquina de
     cerco quebra, não morre, e não há cena a perder quando ela para. É a
     prova de que este campo não sai de `ameaca`. */
  C("Horror", "lendario", 13, 3, "o que não deveria existir", { ataque: "sombrio", resist: ["sombrio", "veneno"], fraqueza: ["sagrado"] }, "", true),
];

export function criaturasDoGenero(genero) {
  return genero === "Fantasia medieval" ? [...CRIATURAS_FANTASIA, ...ARQUETIPOS.slice(0, 4)] : [...ARQUETIPOS, ...CRIATURAS_FANTASIA.slice(0, 4)];
}

/* Preenche PV/defesa/nível de um inimigo pela tabela (o Mestre pode
   mandar só nome+ameaca; o resto o sistema resolve). */
export function completarInimigo(e, nivelJogador) {
  const nome = e.nome || "Inimigo";
  const base = [...CRIATURAS_FANTASIA, ...ARQUETIPOS].find((c) => nome.toLowerCase().includes(c.nome.toLowerCase()));
  const ameaca = e.ameaca || (base ? base.ameaca : "comum");
  const nivel = e.nivel || (base ? base.nivelRef : Math.max(1, nivelJogador || 1));
  /* ---------------- O PV É SUGESTÃO, NÃO DECRETO (v9.154) ----------------
     Quando a IA mandava `vidaMax`, valia o que ela mandou — e o número ali
     decide se a luta dura duas rodadas ou doze. A janela é generosa (metade
     a uma vez e meia): o chefe da ficção pode ser mais duro que o da tabela;
     o que ele não pode é ser outra criatura. */
  const esperado = pvEsperadoInimigo(nivelJogador || nivel, ameaca);
  const janela = pvNaJanela(e.vidaMax || e.vida || 0, esperado);
  const vidaMax = janela.pv;
  return {
    ...e, nome, ameaca, nivel, vidaMax,
    ...(janela.aferido ? { pvAferido: janela } : {}),
    vida: e.vida !== undefined ? e.vida : vidaMax,
    defesa: e.defesa || 10 + Math.floor(bonusDeAmeaca(ameaca) / 2) + ((e.agil ?? (base && base.agil)) ? 2 : 0),
    /* v9.152: a destreza vem da FICHA da criatura quando o nome bate no
       bestiario. Quando nao bate — e nao bate sempre, porque o Narrador pode
       abrir combate com qualquer nome —, zero: o desconhecido nao e rapido
       nem lento, e inventar um numero para ele seria o sistema adivinhando. */
    /* v9.152: o PERFIL vem da base pelo mesmo motivo que a destreza — e
       esquecer de copia-lo aqui foi como eu descobri que a tabela pode estar
       certa e o jogo nao ver nada: o Troll ganhou a fraqueza a fogo em
       bestiario.js e continuou imune a ela em combate, porque a ficha que
       chega na luta e a que sai daqui. */
    ...(e.perfil || (base && base.perfil) ? { perfil: e.perfil || base.perfil } : {}),
    des: e.des ?? (base ? base.des : 0),
    agil: e.agil ?? (base ? base.agil : false),
    /* v9.259 (Fase N · N2): O DEGRAU VIAJA JUNTO, pela mesma razão que o
       `perfil` passou a viajar — uma tabela certa que a mesa não vê é uma
       tabela que não existe. `degrauDaCriatura` é o único sítio que
       computa isto: a declaração da base (ou do que a IA mandou) ganha; o
       resto herda de `ameaca` + tipo de mente, com o topo fora do alcance
       do herdado.
       NÃO MUDA COMPORTAMENTO: é campo a mais no objeto, e ninguém o lê
       ainda — quem passa a decidir por ele é N4.
       E ele resolve com NOME + AMEAÇA apenas, de propósito: o `desc` da
       base continua não sendo copiado (dívida conhecida, de outro dono),
       então o degrau nasce do mesmo que o resto da luta enxerga. */
    degrau: degrauDaCriatura({ nome, ameaca, degrau: e.degrau || (base ? base.degrau : "") }),
    /* v9.268 (Fase Q · Q1): O `importante` VIAJA JUNTO, pela terceira vez que
       esta casa aprende a mesma lição — o `perfil` na v9.152, o `degrau` na
       v9.259. Uma tabela certa que a mesa não vê é uma tabela que não existe:
       o Troll ganhou fraqueza a fogo no bestiário e continuou imune na luta,
       porque a ficha que chega ao combate é a que sai daqui.
       A FONTE É A BASE, E SÓ ELA — ao contrário do `degrau`, que aceita o que
       a IA manda. Aqui não: "o critério sai de campo declarado no bestiário"
       (a pauta), e o Narrador declarar que o goblin dele é importante é o
       Narrador inventando mecânica, que é a lei que esta casa mais protege.
       Quem não bate com nenhuma base não é importante — o padrão seguro.
       É idempotente de propósito: completar duas vezes o mesmo inimigo dá o
       mesmo campo, porque ele é sempre recalculado do nome, nunca herdado do
       objeto que chegou.
       NÃO MUDA COMPORTAMENTO: é campo a mais no objeto, e ninguém o lê ainda
       — quem passa a decidir por ele é Q2, por `quedaAoChegarAZero`. */
    importante: ehImportante({ importante: base ? base.importante : false }),
  };
}

/* ---------------- SISTEMA DE TESTES ---------------- */
/* v9.50: esta tabela trazia uma lista de dificuldades numéricas ("escalar muro
   liso 12, arrombar porta reforçada 15…") e, quatro linhas abaixo, mandava NÃO
   inventar números e usar o perfil. Os dois nunca puderam ser verdade ao mesmo
   tempo: a dificuldade é derivada do modificador do herói desde a v9.15, e um
   número fixo é recalibrado assim que chega. Ficou o que decide de verdade. */
/* v9.145: aqui moravam TABELA_TESTES (o bloco que ensinava o Narrador a
   escolher o PERFIL de um teste) e avaliarTeste (que convertia o trivial em
   sucesso automatico). Os dois serviam ao canal de rolagem da IA, fechado na
   v9.68 — e ficaram exportados por mais setenta e sete versoes, com a tabela
   subindo no prompt de todo turno para ensinar a escolher um campo que ja nao
   existia. Export morto mente na primeira leitura: quem lesse este arquivo
   concluiria que a IA ainda pede dado. Quem pede dado agora e o sistema, e
   ele nao precisa de nenhum dos dois. */

/* DIFICULDADE POR PERFIL (v7.4.2): a tabela fixa (12/15/18) ficava pequena
   para heróis de nível alto — tudo virava sucesso automático e o d20 sumia.
   Agora o Mestre diz só o PERFIL do desafio e o CÓDIGO calcula a dificuldade
   a partir do modificador do herói: digno continua digno no nível 3 e no 20. */
export const PERFIS_TESTE = { facil: 4, digno: 6, dificil: 10, formidavel: 14 };
export function dificuldadePorPerfil(modificador, perfil) {
  const delta = PERFIS_TESTE[String(perfil || "").toLowerCase()];
  if (delta == null) return null;
  return Math.max(6, (modificador || 0) + delta);
}
