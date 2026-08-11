/* ============================================================
   MAGIA PREPARADA (v9.21) — a decisão que o conjurador não tinha

   A ficha já tinha árvore de habilidades, escolas, elementos e
   combos. O que ela não tinha era a pergunta que define um
   conjurador de mesa: O QUE EU LEVO HOJE? Sem ela, saber uma magia
   e poder usá-la são a mesma coisa, e o mago vira um cardápio: rola
   a lista, escolhe a maior que o PM paga, pronto. A decisão foi
   empurrada para o meio do combate, onde ela é sempre a mesma.

   Preparar move a decisão para ANTES — para a fogueira, quando o
   jogador ainda não sabe o que vem pela frente. É aí que ela vale:
   "levo a bola de fogo ou a corrente de gelo?" só é uma pergunta
   interessante enquanto o inimigo de amanhã é desconhecido.

   DUAS FAMÍLIAS DE CONJURADOR, e a diferença é de propósito. Quem
   ESTUDA (Mago, Clérigo, Druida, Invocador) prepara: troca a lista
   a cada noite, e por isso se adapta. Quem NASCE com o dom
   (Feiticeiro, Bruxo, Bardo) não prepara nada — sabe o que sabe,
   sempre. É a distinção do 5e e ela existe para as classes não
   virarem a mesma coisa com nomes diferentes: o mago é versátil
   entre dias, o feiticeiro é constante dentro deles.

   E O QUE NÃO É MAGIA NÃO ENTRA. Golpe de guerreiro, furtividade de
   ladino, técnica de monge — nada disso prepara. Preparar um soco
   seria burocracia sem decisão, que é o pior que uma regra pode ser.
   ============================================================ */

import { naturezaDaHabilidade } from "./combos.js";
import { classeDaHabilidade } from "./classes.js";

/* Quem prepara e quem não prepara. Fora desta lista, ninguém prepara —
   inclusive as classes marciais, que é o caso comum. */
export const PREPARAM = ["Mago", "Clérigo", "Druida", "Invocador"];
export const INATOS = ["Feiticeiro", "Bruxo", "Bardo"];

export function preparaMagia(classe) { return PREPARAM.includes(classe); }
export function ehInato(classe) { return INATOS.includes(classe); }

/* A ficha pode ter mais de uma classe (multiclasse). Basta UMA que
   prepare para o herói ter caderno de magias — e o que ele prepara são
   as magias daquela classe, não as de todas. */
export function classesQuePreparam(pers) {
  const todas = [(pers && pers.classe) || "", ...(((pers && pers.classesExtras) || []))];
  return todas.filter((c) => preparaMagia(c));
}
export function temCaderno(pers) { return classesQuePreparam(pers).length > 0; }

/* ---------------- O QUE É PREPARÁVEL ----------------
   Só magia, e só magia de uma classe que prepara. O resto — golpe
   físico, habilidade de classe inata, dádiva épica, poder único —
   está sempre à mão. */
export function ehPreparavel(hab, pers) {
  if (!hab || !hab.nome) return false;
  if (naturezaDaHabilidade(hab, pers) !== "magico") return false;
  const dona = classeDaHabilidade(hab.nome);
  /* habilidade sem classe de origem (única, dádiva, improviso) não prepara:
     ela é do herói, não do caderno */
  if (!dona) return false;
  return preparaMagia(dona);
}

export function preparaveisDe(pers) {
  return ((pers && pers.habilidades) || []).filter((h) => ehPreparavel(h, pers));
}

/* ---------------- QUANTAS CABEM ----------------
   A fórmula do 5e é nível + modificador, e eu comecei com ela. Os
   números do primeiro teste mostraram que ela não serve AQUI: um mago
   de nível 20 preparava 14 magias, e a ficha desta casa tem umas
   quinze no total. Preparar 14 de 15 não é uma escolha — é um
   formulário. A diferença vem de que no 5e um conjurador conhece
   dezenas de magias, e aqui a árvore de habilidades é enxuta de
   propósito.

   Recalibrado para cerca de METADE do que se sabe: nível 12 com o
   atributo em 5 leva 6, nível 20 com 8 leva 9. Aí a pergunta "levo a
   bola de fogo ou a corrente de gelo?" volta a ter as duas respostas
   custando alguma coisa. Piso 2, porque com uma só o jogador nunca
   experimenta a mecânica — ele só obedece a ela. */
export function limitePreparadas(pers) {
  if (!temCaderno(pers)) return 0;
  const nivel = Math.max(1, (pers && pers.nivel) || 1);
  const a = (pers && pers.atributos) || {};
  const chave = Math.max(0, Number(a.intelecto) || 0, Number(a.presenca) || 0, Number(a.percepcao) || 0);
  return Math.max(2, Math.ceil(nivel / 4) + Math.ceil(chave / 2));
}

export function garantirPreparadas(pers) {
  const nomes = new Set(preparaveisDe(pers).map((h) => h.nome));
  const l = Array.isArray(pers && pers.preparadas) ? pers.preparadas : [];
  return [...new Set(l.filter((n) => nomes.has(n)))].slice(0, limitePreparadas(pers));
}

export function estaPreparada(pers, hab) {
  if (!ehPreparavel(hab, pers)) return true;   // não é do caderno: sempre à mão
  return garantirPreparadas(pers).includes(hab.nome);
}

/* Preenche o caderno sozinho — usado na migração e no "preparar tudo o que
   couber". Ordena pelo custo em PM decrescente: na dúvida, o sistema guarda
   as magias grandes, que são as que o jogador sentiria falta. */
export function preparadasIniciais(pers) {
  const teto = limitePreparadas(pers);
  if (!teto) return [];
  return preparaveisDe(pers)
    .slice()
    .sort((a, b) => (Number(b.custo) || 0) - (Number(a.custo) || 0))
    .slice(0, teto)
    .map((h) => h.nome);
}

export function alternarPreparada(pers, nome) {
  const atual = garantirPreparadas(pers);
  const hab = ((pers && pers.habilidades) || []).find((h) => h.nome === nome);
  if (!hab) return { ok: false, motivo: "essa habilidade não está na ficha" };
  if (!ehPreparavel(hab, pers)) return { ok: false, motivo: "isso não é magia de caderno — já está sempre à mão" };
  if (atual.includes(nome)) return { ok: true, preparadas: atual.filter((n) => n !== nome), acao: "guardou" };
  const teto = limitePreparadas(pers);
  if (atual.length >= teto) return { ok: false, motivo: `você só consegue manter ${teto} magias na cabeça — guarde uma antes` };
  return { ok: true, preparadas: [...atual, nome], acao: "preparou" };
}

/* ---------------- RITUAL ----------------
   A válvula de escape, e ela existe por uma razão de desenho: sem
   ritual, esquecer a magia certa vira um beco sem saída, e beco sem
   saída num jogo solo é sessão encerrada. Com ritual, a magia não
   preparada continua acessível FORA de combate, pagando tempo — que é
   o recurso que o jogo passou a cobrar desde os relógios. */
export const MINUTOS_RITUAL = 30;
const RITUALIZAVEL = /(detect|identific|luz|purific|abenço|abenco|proteç|protec|adivinh|vis[ãa]o|falar com|comunh|invisib|disfarce|alarme|servo|montaria|compreens|leitura)/i;

export function ehRitual(hab) {
  if (!hab || !hab.nome) return false;
  if (hab.ritual) return true;
  /* magia de arrasar não vira ritual: ritualizar dano seria dar de graça, com
     atraso, exatamente o que preparar existe para racionar */
  if ((Number(hab.custo) || 0) >= 6) return false;
  return RITUALIZAVEL.test(`${hab.nome} ${hab.descricao || ""}`);
}

export function podeLancar(pers, hab, { emCombate = false } = {}) {
  if (estaPreparada(pers, hab)) return { ok: true };
  if (!emCombate && ehRitual(hab)) {
    return { ok: true, ritual: true, minutos: MINUTOS_RITUAL, aviso: `${hab.nome} não está preparada — você a conduz como ritual, e isso leva ${MINUTOS_RITUAL} minutos.` };
  }
  return {
    ok: false,
    motivo: emCombate
      ? `${hab.nome} não está preparada hoje. Só o que está no caderno sai no meio da luta.`
      : `${hab.nome} não está preparada hoje, e ela não é das que se conduzem como ritual. Prepare-a no próximo descanso longo.`,
  };
}

/* ---------------- O QUE O MESTRE RECEBE ---------------- */
export function resumoMagiasPrompt(pers) {
  if (!temCaderno(pers)) return "";
  const prep = garantirPreparadas(pers);
  const guardadas = preparaveisDe(pers).filter((h) => !prep.includes(h.nome)).map((h) => h.nome);
  if (!prep.length && !guardadas.length) return "";
  return `MAGIAS PREPARADAS (do sistema — ${prep.length}/${limitePreparadas(pers)}): ${prep.join(", ") || "nenhuma"}.${guardadas.length ? ` GUARDADAS hoje (ele NÃO consegue lançá-las): ${guardadas.join(", ")}.` : ""} Se eu tentar usar uma magia guardada, o sistema me barra — não narre o efeito dela nem ofereça um substituto conveniente.`;
}

export const MAGIAS_PROMPT = `MAGIA PREPARADA (v9.21):
- Conjuradores que ESTUDAM (Mago, Clérigo, Druida, Invocador) escolhem a cada noite quais magias levam na cabeça. Só as preparadas saem em combate; as guardadas ficam inacessíveis até o próximo descanso longo.
- Quem tem o dom de nascença (Feiticeiro, Bruxo, Bardo) não prepara nada — sabe o que sabe, sempre. Não invente limitação para eles.
- Habilidade física nunca se prepara: golpe, furtividade e técnica estão sempre à mão.
- Fora de combate, uma magia utilitária não preparada ainda pode ser conduzida como RITUAL, pagando tempo. O sistema decide isso e avisa; você só narra a demora e o esforço.
- Você NUNCA concede uma magia guardada "porque a cena pede", nem oferece um substituto conveniente quando o sistema barra. Esquecer a magia certa é uma consequência legítima da escolha do jogador.`;
