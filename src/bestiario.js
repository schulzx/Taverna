/* ============================================================
   BESTIÁRIO E TESTES — Taverna
   Criaturas com nível/ameaça/atributos definidos por TABELA, e
   o decisor de testes: o código diz se uma ação exige rolagem
   ou é trivial para o patamar. O Mestre consulta, não inventa.
   ============================================================ */
import { pvEsperadoInimigo, bonusDeAmeaca } from "./combate.js";

/* ---------------- CRIATURAS (fantasia) ---------------- */
/* v9.152: `des` é a destreza de verdade, e `agil` passa a ser o que ele
   sempre foi na prática — "esta criatura é rápida?". Derivar em vez de
   guardar os dois evita a única coisa pior do que um booleano grosseiro:
   um booleano que discorda do número ao lado dele. */
const C = (nome, ameaca, nivelRef, des, desc, perfil = null) => ({ nome, ameaca, nivelRef, des: Number(des) || 0, agil: (Number(des) || 0) >= 2, desc, ...(perfil ? { perfil } : {}) });
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
  C("Ogro", "competente", 4, -1, "força bruta e pouco cérebro"),
  C("Troll", "competente", 5, 0, "regenera se não queimar", { ataque: "fisico", fraqueza: ["fogo"], resist: [] }),
  C("Elemental Menor", "competente", 5, 1, "fúria de um elemento", { ataque: "fogo", resist: ["fogo"], fraqueza: ["gelo"] }),
  C("Golem de Pedra", "elite", 7, -2, "imune a medo, lento e esmagador"),
  C("Quimera", "elite", 8, 2, "três cabeças, três mortes", { ataque: "fogo", resist: ["fogo"], fraqueza: [] }),
  C("Gigante", "elite", 9, -1, "cada golpe derruba muralhas", { ataque: "fisico", resist: ["fisico"], fraqueza: [] }),
  C("Dragão Jovem", "lendario", 10, 2, "sopro devastador, orgulho maior ainda"),
  C("Lich", "lendario", 12, 1, "arquimago morto-vivo com filactério"),
  C("Dragão Ancião", "lendario", 16, 3, "uma calamidade com asas"),
];

/* Arquétipos genéricos — servem a qualquer gênero (sci-fi, cyberpunk, etc.) */
export const ARQUETIPOS = [
  C("Capanga", "fraco", 1, 0, "músculo descartável"),
  C("Batedor", "fraco", 2, 4, "rápido, frágil"),
  C("Soldado", "comum", 3, 1, "treinado e disciplinado"),
  C("Atirador", "comum", 3, 3, "perigoso à distância"),
  C("Brutamontes", "competente", 5, -1, "aguenta e devolve"),
  C("Sentinela Blindada", "elite", 7, -2, "muralha ambulante", { ataque: "fisico", resist: ["fisico"], fraqueza: ["raio"] }),
  C("Comandante", "elite", 8, 2, "perigoso e tático"),
  C("Colosso", "lendario", 11, -2, "máquina/besta de cerco", { ataque: "fisico", resist: ["fisico", "veneno"], fraqueza: ["raio"] }),
  C("Horror", "lendario", 13, 3, "o que não deveria existir", { ataque: "sombrio", resist: ["sombrio", "veneno"], fraqueza: ["sagrado"] }),
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
  const vidaMax = e.vidaMax || e.vida || pvEsperadoInimigo(nivelJogador || nivel, ameaca);
  return {
    ...e, nome, ameaca, nivel, vidaMax,
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
