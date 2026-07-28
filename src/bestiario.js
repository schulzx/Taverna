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
export const TABELA_TESTES = `AÇÕES QUE PEDEM TESTE (com dificuldade-base — ajuste ±2 pela situação):
· FÍSICO (Força/Vigor): escalar muro liso 12, arrombar porta reforçada 15, erguer portcullis 15, saltar abismo largo 12, resistir a veneno 12, nadar em tempestade 15.
· AGILIDADE (Destreza): furtividade contra guardas atentos 12, escapar de agarrão 12, equilibrar-se em corda 12, abrir fechadura comum 12 / complexa 15, punga 15.
· SOCIAL (Presença): persuadir neutro 12 / relutante 15, enganar desconfiado 15, intimidar alguém do MESMO patamar 15 / de patamar acima 18+, barganhar 12, inspirar multidão 15.
· MENTE (Intelecto/Percepção): decifrar texto arcano 15, notar emboscada 12, rastrear na chuva 15, lembrar lore obscura 15, detectar mentira 12.
QUANDO NÃO PEDIR TESTE: ação TRIVIAL para o patamar do herói (consulte o PATAMAR — um Herói não testa para intimidar um goblin, uma Lenda não testa para escalar um muro); ação sem consequência interessante em caso de falha; ação impossível (negue, não teste). Intimidar/enfrentar algo de patamar MUITO acima: dificuldade 18-21, e mesmo sucesso dá efeito parcial.
REGRA DE OURO: teste só quando o resultado é incerto E a falha gera história.`;

/* Decisor por código: o app transforma testes triviais em sucesso automático. */
export function avaliarTeste(modificador, dificuldade) {
  const dc = Number(dificuldade) || 12;
  if (dc <= (modificador || 0) + 2) return "auto";   // não há como falhar de verdade
  return "rolar";
}
