/* ============================================================
   A MARCA DA SUBCLASSE (05/11/2026) — a escolha da criação vale desde o dia 1

   A pessoa: «uma especialização e subclasse tem que ter um peso maior,
   inclusive não faz sentido escolher a subclasse no momento da criação se
   ela não vai fazer diferença até que você suba de lvl e desbloqueia ela, e
   ainda assim tem que escolher de novo, então a primeira decisão foi em vão».

   Duas coisas, as duas sem campo novo no save:

   1. A ESCOLHA DA CRIAÇÃO É A ESCOLHA. `pers.subclasse` (a da criação)
      passa a ser a subclasse da classe de origem enquanto a árvore não
      tiver outra (`subclasseDoHeroi`, lida por `subclasseEscolhida` em
      classes.js): no rank 3 a árvore dela abre sozinha, sem segunda
      pergunta. Quem já escolheu outra na árvore fica com a que escolheu.

   2. A MARCA, DESDE O NÍVEL 1. Cada subclasse treina uma perícia que é a
      cara dela — o Cavaleiro aguenta (Fortitude), o Assassino não se ouve
      (Furtividade), o Cronista sabe (Saberes). Se a perícia já era
      treinada, o herói fica especialista nela. É pequeno de propósito: um
      degrau de perícia no nível 1 pesa (+2 num d20) sem passar à frente das
      quatro habilidades que a árvore abre nos ranks 3, 5, 7 e 9.

   A tabela é a régua. A suíte prova que as 36 subclasses têm marca e que
   cada marca nomeia uma perícia que existe.
   ============================================================ */

const M = (pericia, diz) => Object.freeze({ pericia, diz });

export const MARCA_DA_SUBCLASSE = Object.freeze({
  /* Guerreiro */
  "Cavaleiro": M("fortitude", "o juramento aguenta o que o corpo não aguentaria"),
  "Bárbaro": M("intimidacao", "a fúria chega antes do golpe"),
  "Gladiador": M("atuacao", "luta para quem está a ver"),
  /* Mago */
  "Elementalista": M("arcanismo", "lê os elementos como quem lê um livro"),
  "Necromante": M("medicina", "conhece o corpo por dentro, vivo ou não"),
  "Arcanista": M("investigacao", "desmonta o mundo para ver como funciona"),
  /* Ladino */
  "Assassino": M("furtividade", "ninguém o ouve chegar"),
  "Batedor": M("percepcao", "vê o perigo antes de todos"),
  "Trapaceiro": M("enganacao", "a mentira sai-lhe a sorrir"),
  /* Clérigo */
  "Sacerdote": M("medicina", "as mãos sabem fechar feridas"),
  "Paladino": M("persuasao", "a fé dele convence"),
  "Inquisidor": M("intuicao", "sente a mentira no ar"),
  /* Caçador */
  "Arqueiro": M("percepcao", "o olho acha o alvo antes da flecha"),
  "Domador": M("montaria", "nenhum bicho lhe é estranho"),
  "Rastreador": M("sobrevivencia", "lê o chão como uma carta"),
  /* Bardo */
  "Menestrel": M("atuacao", "a sala cala quando ele canta"),
  "Cronista": M("saberes", "conhece toda a história"),
  "Encantador": M("persuasao", "as palavras dobram vontades"),
  /* Monge */
  "Punho de Ferro": M("atletismo", "o corpo é a arma"),
  "Andarilho": M("acrobacia", "o vento não o apanha"),
  "Asceta": M("intuicao", "vê o que os outros escondem de si"),
  /* Druida */
  "Metamorfo": M("atletismo", "o corpo lembra-se de ser fera"),
  "Xamã": M("medicina", "as ervas e os espíritos curam"),
  "Guardião": M("sobrevivencia", "a mata é a casa dele"),
  /* Feiticeiro */
  "Linhagem Dracônica": M("intimidacao", "o sangue do dragão assusta"),
  "Alma da Tempestade": M("acrobacia", "move-se como o relâmpago"),
  "Magia Selvagem": M("arcanismo", "sente a magia antes de ela chegar"),
  /* Bruxo */
  "Pacto Infernal": M("enganacao", "o patrono ensinou-lhe a mentir"),
  "Pacto Feérico": M("persuasao", "o encanto das fadas fala por ele"),
  "Pacto do Abismo": M("saberes", "sabe coisas que não devia saber"),
  /* Engenheiro */
  "Artilheiro": M("investigacao", "calcula a distância de olhos fechados"),
  "Mecanista": M("prestidigitacao", "as mãos acham o mecanismo"),
  "Alquimista de Campo": M("medicina", "a poção certa para a ferida certa"),
  /* Invocador */
  "Mestre das Feras": M("montaria", "as feras seguem-no"),
  "Conjurador Elemental": M("arcanismo", "chama o que os outros só estudam"),
  "Chamador de Espíritos": M("intuicao", "os mortos sussurram-lhe"),
});

const txt = (x) => (typeof x === "string" ? x.trim() : "");

/* A subclasse da classe de origem: a da árvore, se a houver; senão a da
   criação. `classeNome` diz de que classe se pergunta (multiclasse): a da
   criação só vale para a classe com que o herói nasceu. */
export function subclasseDoHeroi(pers, classeNome = null) {
  if (!pers || typeof pers !== "object") return null;
  const classe = txt(classeNome) || txt(pers.classe);
  if (!classe) return null;
  const daArvore = pers.subclasses && typeof pers.subclasses === "object" ? txt(pers.subclasses[classe]) : "";
  if (daArvore) return daArvore;
  if (classe !== txt(pers.classe)) return null;
  const daCriacao = txt(pers.subclasse);
  return daCriacao && MARCA_DA_SUBCLASSE[daCriacao] ? daCriacao : null;
}

/* A marca do herói: a da subclasse da classe de origem, ou nada. */
export function marcaDe(pers) {
  const sub = subclasseDoHeroi(pers);
  const m = sub ? MARCA_DA_SUBCLASSE[sub] : null;
  return m ? Object.freeze({ subclasse: sub, pericia: m.pericia, diz: m.diz }) : null;
}

/* A marca treina esta perícia? */
export function treinaPelaMarca(pers, periciaId) {
  const m = marcaDe(pers);
  return !!(m && periciaId && m.pericia === periciaId);
}
