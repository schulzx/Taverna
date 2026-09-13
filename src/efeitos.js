/* ============================================================
   OS EFEITOS (v9.224) — o que dura alguns turnos e some sozinho

   Um EFEITO é a promessa com prazo: "+2 de dano por três turnos",
   "invisível por dez", "abençoado enquanto a fé segurar". Ele vive em
   `pers.efeitos`, é lido na hora do número e morre no tique da rodada.

   O órgão existia — só não morava em lugar nenhum. Nasceu espalhado por
   três sítios do `App.jsx` (o buff de uma habilidade, o efeito de um
   milagre, a magia de duração), cada um com os próprios números soltos
   no meio da linha, e a pilha ("o novo substitui o de mesmo nome")
   repetida cinco vezes em cinco arquivos, com duas regras de casamento
   de nome diferentes e ninguém sabendo disso. Aqui a conta vira tabela e
   a repetição vira função — sem mudar UM número: esta etapa é mudança de
   casa, não de regra.

   ---------------- ONDE MORA O RESTO ----------------

   Este módulo cuida do NASCIMENTO, da PILHA e das CONSULTAS que estavam
   soltas. O que já era módulo continua onde estava, de propósito:

   - `regras-jogo.js` — `tickEfeitos` (o relógio: −1 turno por resposta,
     quem chega a zero se dissipa), `bonusEfeito` e `atributoEfetivo` (o
     efeito virando modificador de rolagem) e o canal do Mestre em
     `aplicarMudancas` (`efeitos_adicionar` / `efeitos_remover`).
   - `combos.js` — o ESCOPO do buff (físico levanta aço, mágico levanta
     feitiço) e o bônus de dano por habilidade.
   - `habilidades.js` — a GUARDA, que é efeito de outra família: vence
     por RODADA (`ate`), não por turnos contados, e soma à defesa por
     `defesaDeGuarda`. Ela já nasceu módulo na v9.53 e não se mexeu.
   - `gatilhos.js` — o efeito que acaba por ACONTECIMENTO, e não por
     prazo (apanhou, atacou, saiu da luta).

   ---------------- A PILHA ----------------

   Só existe uma regra, e ela é curta: **o novo vence**. Um efeito de
   mesmo nome sai da lista e o recém-chegado entra no fim. Nada acumula,
   nada compara o maior — quem relança a bênção reinicia o prazo dela.

   O que varia é o CASAMENTO do nome, e varia porque sempre variou: os
   catálogos e o App comparam o nome exato (`"Fúria" !== "fúria"`), e o
   canal do Mestre compara sem caixa, porque de lá o nome vem digitado
   por uma IA. As duas continuam, com nome próprio — `casamento: "exato"`
   e `casamento: "solto"` — em vez de duas linhas parecidas em arquivos
   distantes.
   ============================================================ */

import { naturezaDaHabilidade } from "./combos.js";

/* ---------------- OS TETOS DO QUE VEM DE FORA ----------------
   O Mestre pede efeito por `efeitos_adicionar`, e o que ele pede passa
   por aqui antes de virar ficha. +2 é o teto por equilíbrio (um efeito
   não pode valer mais que um nível inteiro de atributo) e 10 turnos é o
   teto do prazo. Estavam soltos dentro do laço de `aplicarMudancas`. */
export const LIMITES_DO_EFEITO = {
  bonusMin: 1, bonusMax: 2, bonusPadrao: 2,
  turnosMin: 1, turnosMax: 10, turnosPadrao: 3,
};

/* ---------------- O BUFF QUE NASCE DE UMA HABILIDADE ----------------
   Quando uma habilidade do herói deixa uma condição BOA, ela também
   liga um bônus de dano — e a força sai do CUSTO em PM, porque é o
   custo que separa um truque de uma promessa: metade do custo,
   arredondada, nunca menos de 1. O prazo é o da condição que a gerou;
   `turnosPadrao` só entra quando a condição não traz prazo nenhum.

   `aplica: "dano"` é de propósito: este buff levanta o GOLPE, não a
   rolagem de atributo — quem soma a rolagem é quem tem `aplica` com
   nome de atributo, "testes" ou "todos". */
export const BUFF_DA_HABILIDADE = {
  custoPadrao: 2, divisorDoCusto: 2, forcaMinima: 1,
  turnosPadrao: 3, aplica: "dano",
};

/* ---------------- O EFEITO DE UM MILAGRE ----------------
   O milagre traz os próprios números quando os tem; quando não traz,
   cai nestes. Prazo maior que o do buff de habilidade porque milagre é
   recurso de uma vez por muito tempo, e vale para tudo. */
export const EFEITO_DO_MILAGRE = { bonusPadrao: 2, turnosPadrao: 5, aplica: "todos" };

/* ---------------- A MAGIA QUE DURA ----------------
   Invisibilidade, voo e luz não somam número nenhum (`bonus: 0`): elas
   valem pelo ESTADO, e o estado é lido por quem precisa dele
   (`estaInvisivel` em gatilhos.js, o movimento em movimento.js). O que
   o sistema faz por elas é CONTAR — e é a contagem que faz a magia
   acabar em vez de durar o quanto a cena convier.

   Duas faixas só, e é o bastante: o que o grimório mede em horas dura
   uma cena inteira; o resto dura uma luta. */
export const EFEITO_DA_MAGIA = {
  bonus: 0, aplica: "todos",
  rxLonga: /hora/, turnosLongos: 60, turnosCurtos: 10,
};

/* ---------------- OS RÓTULOS QUE VALEM PARA TUDO ----------------
   `aplica` normalmente traz o NOME de um atributo ("Força"). Estes dois
   rótulos são o coringa: valem em qualquer teste.

   `APLICA_NA_NOTA` é menor de propósito, e não por elegância: a nota que
   o Narrador recebe na rolagem (`App.jsx:14265`) nunca reconheceu
   "todos" — só "testes". O bônus SOMA (quem soma é `bonusEfeito`), mas
   o nome do efeito não é citado na frase. É divergência antiga, é só
   texto, e está portada como está: consertá-la aqui seria mudar o que o
   jogador lê numa etapa que prometeu não mudar nada. */
export const APLICA_UNIVERSAL = ["testes", "todos"];
export const APLICA_NA_NOTA = ["testes"];

/* ---------------- LER A LISTA SEM TROPEÇAR ----------------
   Save antigo, ficha recém-criada e projeção de arena chegam aqui com
   `efeitos` ausente, nulo ou com buraco no meio. Nenhum desses casos
   pode custar o turno. */
export const efeitosDe = (pers) => (pers && Array.isArray(pers.efeitos) ? pers.efeitos.filter(Boolean) : []);

const comoTexto = (x) => String(x == null ? "" : x);
const mesmoNome = (a, b, casamento) =>
  casamento === "solto" ? comoTexto(a).toLowerCase() === comoTexto(b).toLowerCase() : a === b;

/* ---------------- A PILHA: O NOVO VENCE ----------------
   Devolve uma lista NOVA — a de entrada não é tocada. Um efeito sem
   nome não entra: ele nunca poderia ser substituído nem retirado
   depois, e lista com entulho é pior que lista curta. */
export function empilhar(efeitos, novo, opcoes) {
  const { casamento = "exato" } = opcoes || {};
  const lista = Array.isArray(efeitos) ? efeitos.filter(Boolean) : [];
  if (!novo || !novo.nome) return lista;
  return [...lista.filter((e) => !mesmoNome(e.nome, novo.nome, casamento)), novo];
}

/* Tira um efeito pelo nome. Mesma régua de casamento da pilha. */
export function retirar(efeitos, nome, opcoes) {
  const { casamento = "exato" } = opcoes || {};
  const lista = Array.isArray(efeitos) ? efeitos.filter(Boolean) : [];
  return lista.filter((e) => !mesmoNome(e.nome, nome, casamento));
}

/* ---------------- NASCIMENTO 1: O BUFF DA HABILIDADE ----------------
   Devolve o efeito E o pedaço de frase que o acompanha, porque a linha
   nasce junto do efeito nesta casa: se um dia a força mudar, a frase
   muda no mesmo lugar. `turnos` é o prazo da condição que gerou o buff. */
export function efeitoDeBuff(hab, pers, turnos) {
  const h = hab || {};
  const forca = Math.max(
    BUFF_DA_HABILIDADE.forcaMinima,
    Math.round((Number(h.custo) || BUFF_DA_HABILIDADE.custoPadrao) / BUFF_DA_HABILIDADE.divisorDoCusto),
  );
  const escopo = naturezaDaHabilidade(h, pers);
  return {
    efeito: {
      nome: h.nome, bonus: forca,
      turnos: turnos || BUFF_DA_HABILIDADE.turnosPadrao,
      aplica: BUFF_DA_HABILIDADE.aplica, escopo,
    },
    extraEscopo: ` · +${forca} de dano ${escopo === "fisico" ? "físico" : "mágico"}`,
  };
}

/* ---------------- NASCIMENTO 2: O EFEITO DE UM MILAGRE ---------------- */
export function efeitoDeMilagre(ef, descricao) {
  const e = ef || {};
  return {
    nome: e.nome,
    bonus: e.bonus || EFEITO_DO_MILAGRE.bonusPadrao,
    turnos: e.turnos || EFEITO_DO_MILAGRE.turnosPadrao,
    aplica: EFEITO_DO_MILAGRE.aplica,
    descricao,
  };
}

/* ---------------- NASCIMENTO 3: A MAGIA QUE DURA ---------------- */
export function turnosDaMagia(duracao) {
  return duracao && EFEITO_DA_MAGIA.rxLonga.test(comoTexto(duracao))
    ? EFEITO_DA_MAGIA.turnosLongos
    : EFEITO_DA_MAGIA.turnosCurtos;
}

/* Devolve os turnos junto do efeito porque quem chama precisa dos dois:
   o número entra na linha que o jogador lê e na nota que o Mestre recebe. */
export function efeitoDeMagia(magia) {
  const m = magia || {};
  const turnos = turnosDaMagia(m.duracao);
  return {
    turnos,
    efeito: {
      nome: m.nome, bonus: EFEITO_DA_MAGIA.bonus, turnos,
      aplica: EFEITO_DA_MAGIA.aplica, descricao: m.descricao,
    },
  };
}

/* ---------------- A CONCENTRAÇÃO ----------------
   Uma magia de concentração é um efeito que o corpo segura: apanhou,
   testa; falhou, cai. O teste é de quem chama (`testeConcentracao`, em
   combate.js); daqui sai só quem está sendo segurado e a ficha sem ele. */
export function efeitoEmConcentracao(pers) {
  return efeitosDe(pers).find((e) => e.concentracao) || null;
}

export function quebrarConcentracao(pers, nome) {
  if (!pers) return pers;
  return { ...pers, efeitos: retirar(pers.efeitos, nome) };
}

/* ---------------- CONSULTA: QUEM ENTROU NESTA ROLAGEM ----------------
   O bônus em si é somado por `bonusEfeito` (regras-jogo.js). Isto aqui
   é a HONESTIDADE: dizer ao Narrador quais efeitos estão dentro do
   número, para ele não narrar como sorte o que foi preparação. */
export function buffsNaRolagem(pers, atributoNome) {
  const alvo = comoTexto(atributoNome).toLowerCase();
  return efeitosDe(pers).filter((e) => {
    if (!e.aplica) return true;
    const ap = comoTexto(e.aplica).toLowerCase();
    return ap === alvo || APLICA_NA_NOTA.includes(ap);
  });
}

export function notaDosBuffs(pers, atributoNome) {
  const bs = buffsNaRolagem(pers, atributoNome);
  return bs.length ? ` (inclui bônus de ${bs.map((b) => b.nome).join(", ")})` : "";
}
