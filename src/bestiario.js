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
import { aoTrocarDeCenario } from "./cenario.js";

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
/* T4-B (3.ª fatia): os campos acima são agora os de uma ficha do cenário
   (`{ nome, ameaca, nivelRef, des, desc, perfil?, degrau?, importante? }`,
   o vocabulário em cenario.js ESQUEMA_DO_CENARIO.criatura); a ordem das
   chaves da ficha derivada é a de sempre, e o dourado do cenário prova-o. */
/* 29/10 (trilha B): `genero` é o NONO campo e é OPCIONAL — o gênero do NOME
   da criatura ("mulher" | "homem", o vocabulário da gente), com que a frase do
   desfecho concorda: «a Quimera ficou cega». Antes dele, o desfecho sabia o
   gênero de 2 das 27 por uma lista ao lado (envelopes-do-turno.js,
   GENERO_DO_ALVO.criaturasFemininas), e de nenhuma criatura de outro mundo —
   a Rainha da Colmeia da Estação Órbita Sete ficava «cego». Agora quem sabe
   é a ficha, e o mundo que a escreve. Guardado só quando é um dos dois.

   O GÊNERO VIAJA COM A FICHA — a quarta vez da mesma lição (o `perfil`, o
   `degrau`, o `importante`): o gênero que a ficha sabe tem de chegar ao
   inimigo, senão o desfecho volta a adivinhar. `completarInimigo` lê duas
   fontes, pela ordem:
     1. o que o inimigo já traz (`genero`: o da pessoa do registo de quem ele
        nasceu, ou o que o Narrador declarou), se for um dos dois;
     2. a ficha da base, mas SÓ quando ela é a CABEÇA do nome — o nome
        começa por ela, depois de um artigo («Lobo Atroz», «a Quimera de
        Três Cabeças»). A base casa por `includes`, e «Marta, chefe dos
        bandidos» casa com o Bandido: herdar dali o masculino calaria a
        Marta que o registo sabe mulher. Quem a cabeça não decide fica sem
        campo, e o desfecho segue a ordem dele (o registo, o primeiro nome).
   Sem nenhuma das duas, o objeto vai sem `genero`, como ia. */
export const GENERO_DA_FICHA = Object.freeze({
  generos: Object.freeze(["mulher", "homem"]),
  artigos: Object.freeze(["o", "a", "os", "as", "um", "uma"]),
  porque: "a ficha sabe o gênero do nome, e a frase do desfecho concorda com ele",
});
const AGIL_DESDE_DES = 2;
const daFicha = ({ nome, ameaca, nivelRef, des, desc, perfil = null, degrau = "", importante = false, genero = "" }) => ({ nome, ameaca, nivelRef, des: Number(des) || 0, agil: (Number(des) || 0) >= AGIL_DESDE_DES, desc, ...(perfil ? { perfil } : {}), ...(degrau ? { degrau } : {}), ...(importante === true ? { importante: true } : {}), ...(GENERO_DA_FICHA.generos.includes(genero) ? { genero } : {}) });
/* T4-B (28/10, o cenário como arquivo, 3.ª fatia): as fichas moram no
   cenário (cenario-padrao.js `bestiario.criaturas`, com o motivo de cada
   declaração escrito em cima dela), e aqui só se derivam — com o mesmo
   nome, `export let`, refeitas quando o cenário troca. O que é REGRA fica
   aqui: `agil` sai de `des` (abaixo), e quem lê o bestiário é este
   módulo, nunca o arquivo do autor. */
export let CRIATURAS_FANTASIA = [];
/* Arquétipos genéricos — servem a qualquer gênero (sci-fi, cyberpunk, etc.);
   moram em `bestiario.arquetipos` do cenário. */
export let ARQUETIPOS = [];
/* o corte por gênero: quem tem gênero de `generosDasCriaturas` vê as
   criaturas do mundo e os `emprestados` primeiros arquétipos; os outros,
   os arquétipos e as `emprestados` primeiras criaturas */
let CORTE = { generosDasCriaturas: [], emprestados: 0 };
aoTrocarDeCenario((c) => {
  const b = c.bestiario;
  CRIATURAS_FANTASIA = Object.freeze(b.criaturas.map((x) => Object.freeze(daFicha(x))));
  ARQUETIPOS = Object.freeze(b.arquetipos.map((x) => Object.freeze(daFicha(x))));
  CORTE = b;
});
export function criaturasDoGenero(genero) {
  const n = CORTE.emprestados;
  return CORTE.generosDasCriaturas.includes(genero) ? [...CRIATURAS_FANTASIA, ...ARQUETIPOS.slice(0, n)] : [...ARQUETIPOS, ...CRIATURAS_FANTASIA.slice(0, n)];
}

/* o gênero do inimigo: o que ele traz, ou o da base que é a cabeça do nome
   (GENERO_DA_FICHA, no topo); "" quando nenhuma das duas decide */
function generoDoInimigo(e, nome, base) {
  const proprio = String(e.genero == null ? "" : e.genero).trim().toLowerCase();
  if (GENERO_DA_FICHA.generos.includes(proprio)) return proprio;
  if (!base || !base.genero) return "";
  const palavras = nome.toLowerCase().trim().split(/\s+/);
  const semArtigo = (GENERO_DA_FICHA.artigos.includes(palavras[0]) ? palavras.slice(1) : palavras).join(" ");
  const cabeca = base.nome.toLowerCase();
  return semArtigo === cabeca || semArtigo.startsWith(cabeca + " ") || semArtigo.startsWith(cabeca + ",") ? base.genero : "";
}

/* Preenche PV/defesa/nível de um inimigo pela tabela (o Mestre pode
   mandar só nome+ameaca; o resto o sistema resolve). */
export function completarInimigo(e, nivelJogador) {
  const nome = e.nome || "Inimigo";
  /* R7 (12/10): A BASE É A DE NOME MAIS LONGO QUE CASA. Com `find` na ordem
     da lista, "lobo atroz".includes("lobo") acertava o Lobo antes: o Lobo
     Atroz (comum, nível 3, alfa de presas longas) lutava com a ficha do
     Lobo (fraco, nível 1). A ordem da tabela é de ameaça, não de busca — e o
     nome mais específico é sempre o mais longo dos que cabem no nome dado.
     Empate de comprimento fica com o primeiro da lista, como antes. */
  const nomeMin = nome.toLowerCase();
  const base = [...CRIATURAS_FANTASIA, ...ARQUETIPOS]
    .filter((c) => nomeMin.includes(c.nome.toLowerCase()))
    .reduce((melhor, c) => (!melhor || c.nome.length > melhor.nome.length ? c : melhor), null) || undefined;
  const ameaca = e.ameaca || (base ? base.ameaca : "comum");
  const nivel = e.nivel || (base ? base.nivelRef : Math.max(1, nivelJogador || 1));
  const genero = generoDoInimigo(e, nome, base);
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
    /* 29/10 (trilha B): O GÊNERO VIAJA JUNTO (GENERO_DA_FICHA, no topo) */
    ...(genero ? { genero } : {}),
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
