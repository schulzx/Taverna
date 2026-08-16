/* ============================================================
   BESTIÁRIO E TESTES — Taverna
   Criaturas com nível/ameaça/atributos definidos por TABELA, e
   o decisor de testes: o código diz se uma ação exige rolagem
   ou é trivial para o patamar. O Mestre consulta, não inventa.
   ============================================================ */
import { pvEsperadoInimigo, bonusDeAmeaca } from "./combate.js";

/* ---------------- CRIATURAS (fantasia) ---------------- */
const C = (nome, ameaca, nivelRef, agil, desc) => ({ nome, ameaca, nivelRef, agil: !!agil, desc });
export const CRIATURAS_FANTASIA = [
  C("Slime", "fraco", 1, false, "gosma lenta e previsível"),
  C("Rato Gigante", "fraco", 1, true, "praga de esgoto"),
  C("Lobo", "fraco", 1, true, "caça em bando"),
  C("Goblin", "fraco", 1, true, "covarde em grupo pequeno, atrevido em bando"),
  C("Bandido", "comum", 2, false, "gente desesperada com aço barato"),
  C("Esqueleto", "comum", 2, false, "osso animado sem medo"),
  C("Zumbi", "comum", 2, false, "lento, incansável"),
  C("Lobo Atroz", "comum", 3, true, "alfa de presas longas"),
  C("Cultista", "comum", 3, false, "fanático com magia menor"),
  C("Ogro", "competente", 4, false, "força bruta e pouco cérebro"),
  C("Troll", "competente", 5, false, "regenera se não queimar"),
  C("Elemental Menor", "competente", 5, false, "fúria de um elemento"),
  C("Golem de Pedra", "elite", 7, false, "imune a medo, lento e esmagador"),
  C("Quimera", "elite", 8, true, "três cabeças, três mortes"),
  C("Gigante", "elite", 9, false, "cada golpe derruba muralhas"),
  C("Dragão Jovem", "lendario", 10, true, "sopro devastador, orgulho maior ainda"),
  C("Lich", "lendario", 12, false, "arquimago morto-vivo com filactério"),
  C("Dragão Ancião", "lendario", 16, true, "uma calamidade com asas"),
];

/* Arquétipos genéricos — servem a qualquer gênero (sci-fi, cyberpunk, etc.) */
export const ARQUETIPOS = [
  C("Capanga", "fraco", 1, false, "músculo descartável"),
  C("Batedor", "fraco", 2, true, "rápido, frágil"),
  C("Soldado", "comum", 3, false, "treinado e disciplinado"),
  C("Atirador", "comum", 3, true, "perigoso à distância"),
  C("Brutamontes", "competente", 5, false, "aguenta e devolve"),
  C("Sentinela Blindada", "elite", 7, false, "muralha ambulante"),
  C("Comandante", "elite", 8, false, "perigoso e tático"),
  C("Colosso", "lendario", 11, false, "máquina/besta de cerco"),
  C("Horror", "lendario", 13, true, "o que não deveria existir"),
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
    agil: e.agil ?? (base ? base.agil : false),
  };
}

/* ---------------- SISTEMA DE TESTES ---------------- */
/* v9.50: esta tabela trazia uma lista de dificuldades numéricas ("escalar muro
   liso 12, arrombar porta reforçada 15…") e, quatro linhas abaixo, mandava NÃO
   inventar números e usar o perfil. Os dois nunca puderam ser verdade ao mesmo
   tempo: a dificuldade é derivada do modificador do herói desde a v9.15, e um
   número fixo é recalibrado assim que chega. Ficou o que decide de verdade. */
export const TABELA_TESTES = `COMO MEDIR UM TESTE (você escolhe o PERFIL; o sistema calcula o número):
· "facil" = desafio leve, errar é azar. · "digno" = à altura do herói (o padrão). · "dificil" = exige perícia real, falha provável sem preparo. · "formidavel" = no limite do possível, sucesso é feito memorável.
· Um "digno" é digno em qualquer nível — o sistema converte pelo modificador do herói, então o perfil nunca envelhece.
QUANDO NÃO PEDIR TESTE: ação TRIVIAL para o patamar dele (um Herói não testa para intimidar um goblin, uma Lenda não testa para escalar um muro); ação sem consequência interessante na falha; ação impossível (negue, não teste). Contra algo de patamar MUITO acima: perfil "formidavel", e mesmo o sucesso dá efeito parcial.
REGRA DE OURO: teste só quando o resultado é incerto E a falha gera história.`;

/* Decisor por código: o app transforma testes triviais em sucesso automático. */
export function avaliarTeste(modificador, dificuldade) {
  const dc = Number(dificuldade) || 12;
  if (dc <= (modificador || 0) + 2) return "auto";   // não há como falhar de verdade
  return "rolar";
}

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
