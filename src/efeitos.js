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

import { naturezaDaHabilidade, aplicacaoDoBuff } from "./combos.js";

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
   nome de atributo, "testes" ou "todos".

   E é o PADRÃO, não a sentença: uma habilidade que promete absorver ou
   proteger sai por `APLICACAO_DO_BUFF` (combos.js) com outro rótulo e
   outra frase. Quem não promete proteção nenhuma continua exatamente
   aqui, no mesmo número e na mesma linha. */
export const BUFF_DA_HABILIDADE = {
  custoPadrao: 2, divisorDoCusto: 2, forcaMinima: 1,
  turnosPadrao: 3, aplica: "dano",
};

/* ---------------- A ABSORÇÃO: QUANTO UM ABRIGO COME DE UM GOLPE (v9.233) ----
   A tabela irmã da de cima, e existe pelo motivo oposto: `BUFF_DA_HABILIDADE`
   diz quanto um buff SOMA ao golpe que sai, esta diz quanto ele TIRA do golpe
   que chega. Até a v9.232 a segunda metade não existia — P1 pôs o rótulo
   `protecao` e a frase honesta, mas a defensiva nascia com força ZERO e
   nenhum leitor, e P2 mediu o preço disso na catraca: ligar o piloto à
   família defensiva derrubava `sombra` de 60,2 para 32,9 e abria a amplitude
   de 15,8 para 25,7, com +150 linhas de abrigo todas inertes. Turno pago,
   nada comprado. A proteção tem de proteger ANTES de alguém procurá-la.

   A RÉGUA SAI DO CUSTO, pelo mesmo argumento de `BUFF_DA_HABILIDADE`: é o
   custo em PM que separa um truque de uma promessa. Dois pontos de golpe por
   PM — o dobro da força ofensiva (metade do custo), e o dobro é de propósito:
   um bônus de dano cobra em TODO golpe que o herói der nos três turnos, e
   este cobra uma vez só. O que sai disso: Escudo Arcano (2 PM) come 4,
   Muralha de Gelo (5 PM) come 10, Pele de Pedra (7 PM) come 12.

   O TETO É A PARTE QUE IMPORTA, e o número dele foi medido, não escolhido: um
   golpe na arena tem mediana 13 e média 13,76 de dano, sobre duelistas de 24
   a 36 PV, e uma queda dura 4,85 golpes acertados. Teto 12 é o maior número
   que ainda fica ABAIXO de um golpe mediano — ou seja, nem a absorção mais
   cara do acervo (Globo de Invulnerabilidade, 11 PM, que sem teto comeria 22)
   consegue apagar uma batida inteira. É a mesma lei que o comentário de
   `GUARDAS` escreveu para a defesa: nada que zere o golpe, porque defesa alta
   é a estatística que mais rápido quebra um combate.

   `custoPadrao` é o mesmo de `BUFF_DA_HABILIDADE`, e pelo mesmo motivo:
   relíquia, poção, grimório e o que o piloto escolhe chegam aqui sem custo
   nenhum, e sem ele a família inteira nasceria no piso. */
export const ABSORCAO_DO_BUFF = {
  /* só esta linha de `APLICACAO_DO_BUFF` ganha número. As outras quatro
     (amortece, nao_cai, intocado, protege) prometem outra coisa — meio golpe,
     um chão de PV, um golpe que erra — e cada uma é a sua própria etapa.
     Enquanto não forem, elas saem daqui exatamente como saíam. */
  familia: "absorve",
  porPM: 2, custoPadrao: 2, minimo: 2, teto: 12,
};

/* Privada de propósito: quem precisa do número recebe o efeito já com ele
   dentro, por `efeitoDeBuff`. Um segundo caminho para o mesmo número é a
   forma exata de as duas metades divergirem daqui a três versões. */
function forcaDaAbsorcao(hab) {
  const custo = Number((hab || {}).custo);
  const pm = Number.isFinite(custo) && custo > 0 ? custo : ABSORCAO_DO_BUFF.custoPadrao;
  return Math.min(ABSORCAO_DO_BUFF.teto, Math.max(ABSORCAO_DO_BUFF.minimo, Math.round(pm * ABSORCAO_DO_BUFF.porPM)));
}

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
   muda no mesmo lugar. `turnos` é o prazo da condição que gerou o buff.

   DOIS NASCIMENTOS, UMA PORTA (v9.231). A habilidade que promete
   absorver ou proteger nasce com o rótulo da tabela e `bonus: 0` — pelo
   mesmo motivo que a magia de invisibilidade nasce com zero: ela vale
   pelo ESTADO, não pela soma. Escrever aqui a força que ninguém lê
   seria trocar uma mentira por outra mais quieta; quem absorve o golpe
   nesta casa é a REAÇÃO (reacoes.js), fora do turno, e o dia em que a
   defensiva somar número é o dia em que alguém ler este rótulo.

   E A FRASE DA DEFENSIVA GANHOU NÚMERO (v9.233), só na família que passou
   a ter um. O silêncio de P1 era honestidade — anunciar "+N" de um número
   que não existia seria trocar uma mentira por outra mais quieta. Agora o
   número existe e é gameplay: o jogador paga PM e tem de poder saber o que
   comprou. As outras quatro famílias continuam sem número, e continuam
   porque continuam sem número. */
export function efeitoDeBuff(hab, pers, turnos) {
  const h = hab || {};
  const forca = Math.max(
    BUFF_DA_HABILIDADE.forcaMinima,
    Math.round((Number(h.custo) || BUFF_DA_HABILIDADE.custoPadrao) / BUFF_DA_HABILIDADE.divisorDoCusto),
  );
  const escopo = naturezaDaHabilidade(h, pers);
  const prazo = turnos || BUFF_DA_HABILIDADE.turnosPadrao;
  const protecao = aplicacaoDoBuff(h);
  if (protecao) {
    const base = { nome: h.nome, bonus: 0, turnos: prazo, aplica: protecao.aplica, escopo };
    if (protecao.id !== ABSORCAO_DO_BUFF.familia) {
      return { efeito: base, extraEscopo: ` · ${protecao.conceito}` };
    }
    const absorve = forcaDaAbsorcao(h);
    return {
      efeito: { ...base, absorve },
      extraEscopo: ` · ${protecao.conceito} — aguenta ${absorve} do próximo golpe`,
    };
  }
  return {
    efeito: {
      nome: h.nome, bonus: forca, turnos: prazo,
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
   o número entra na linha que o jogador lê e na nota que o Mestre recebe.

   E O CAMPO ATRAVESSA (v9.234). `efeitoEmConcentracao` e `quebrarConcentracao`
   moram no fim deste arquivo desde que ele existe, o teste está em
   `testeConcentracao` (combate.js) e o caminho inteiro já está fiado no App —
   só que nada, em lugar nenhum, PUNHA `concentracao` num efeito. A promessa
   estava escrita dos dois lados e o meio faltava: o herói segurava
   Invisibilidade, apanhava, e não havia o que perder. Agora o que nasce de
   uma magia de concentração nasce sabendo disso.

   DOS TRÊS NASCIMENTOS, SÓ ESTE. `efeitoDeBuff` e `efeitoDeMilagre` não
   copiam o campo porque não há de onde: habilidade e milagre não declaram
   concentração em tabela nenhuma desta casa, e inventá-la aqui seria pôr no
   efeito um número que nenhuma régua sustenta.

   A CHAVE SÓ NASCE QUANDO EXISTE — é o mesmo cuidado que `absorve` teve na
   v9.233. Quem não concentra fica SEM a chave, e não com `false`: o consumidor
   (`efeitoEmConcentracao`) procura por verdade, e um `false` escrito em todo
   efeito de duração só engordaria o save e toda comparação de igualdade.
   `null`, `{}` e a magia sem o campo passam por aqui sem ganhar nada — a
   condição é a MESMA que o consumidor usa, para não sobrar fresta entre
   nascer e ser encontrado. */
export function efeitoDeMagia(magia) {
  const m = magia || {};
  const turnos = turnosDaMagia(m.duracao);
  const efeito = {
    nome: m.nome, bonus: EFEITO_DA_MAGIA.bonus, turnos,
    aplica: EFEITO_DA_MAGIA.aplica, descricao: m.descricao,
  };
  if (m.concentracao) efeito.concentracao = true;
  return { turnos, efeito };
}

/* ---------------- O GOLPE QUE CHEGA: A ABSORÇÃO SE GASTA (v9.233) ----------
   O outro lado de `ABSORCAO_DO_BUFF`. Lá o abrigo nasce com um número; aqui
   ele o paga e morre. É a mesma forma de `amortecerDano` (tracos.js) e
   `repartirDano` (invocacoes.js), e é de propósito: já existem duas funções
   nesta casa que recebem `(pers, dano)` e devolvem `{ pers, dano, linhas }`,
   porque quem rola o golpe (`resolverAtaque`) não muta ninguém — ele devolve
   `{ dano }` e quem aplica é o sítio. Uma terceira irmã custa zero de
   conceito novo e entra na fila que o App já tem montada.

   POR QUE AQUI E NÃO EM `pers.guardas`. O desenho que P1 esboçou punha a
   absorção numa entrada de `pers.guardas`, com `absorve: N`. Medido, ele
   chega a menos gente por mais fiação:
     · a família `absorve` é 25 das 64 defensivas do acervo de 593 — a maior
       das cinco — e `efeitoDeBuff` JÁ é chamado nas DUAS portas que ligam
       abrigo a ficha: a habilidade do herói (`aplicarBuffDeHabilidade`, no
       App, com dois chamadores) e o piloto da arena. Pela porta do efeito a
       proteção passa a existir nas duas no dia em que este comentário é
       escrito, com zero sítio novo de NASCIMENTO. Pela porta da guarda, as
       duas precisariam aprender a rotear, e uma delas mora no App.
     · na arena, `GUARDAS` não pega NINGUÉM: P2 mediu 0 dos 8 prontos com
       qualquer das 9. A família `absorve` pega 3 (a Chama, o Remendo e o
       Voto, todos com Escudo Arcano ou Escudo da Fé) — e os três estão
       ABAIXO de 50% na catraca de equilíbrio, que é onde a proteção deve
       pesar.
     · a pergunta "como as duas portas convivem" se dissolve: há exatamente 1
       colisão no acervo inteiro (Forma Dracônica casa com `GUARDAS` e com
       `absorve`), e a precedência que a resolve já está escrita e testada —
       `guardaDe` primeiro, em `arena.js` e no App. Nada muda para ela.
     · e a seta de dependência não se mexe: `habilidades.js` continua sendo a
       única folha do motor, sem um único import. `efeitos.js → combos.js` já
       existia.

   UMA BATIDA, UM ABRIGO. Gasta-se o abrigo INTEIRO na primeira coisa que ele
   encontrar, mesmo que ela seja menor que ele — é o que a ficha promete com
   todas as letras ("absorve o PRÓXIMO dano"), e o contrário (guardar o resto
   para o golpe seguinte) transformaria um escudo numa poupança. E só UM por
   golpe, o maior: dois escudos não estilhaçam na mesma batida, e deixá-los
   somar é o caminho curto para a absorção apagar um golpe inteiro, que é
   justamente o que o teto da tabela existe para impedir.

   REGRESSÃO ZERO FORA DA FAMÍLIA. O único gatilho é um `absorve` numérico e
   positivo no efeito. Save antigo, efeito do canal do Mestre, milagre, magia
   de duração e as outras quatro famílias defensivas não o têm — para todos
   eles esta função é um `return` do que entrou. `null` e `{}` idem. */
export function absorverDano(pers, dano) {
  const d = Math.max(0, Math.round(Number(dano) || 0));
  if (!d || !pers) return { pers, dano: d, absorvido: 0, linha: "" };
  const lista = efeitosDe(pers);
  let abrigo = null, forca = 0;
  for (const ef of lista) {
    const n = Math.max(0, Math.round(Number(ef.absorve) || 0));
    if (n > forca) { abrigo = ef; forca = n; }
  }
  if (!abrigo) return { pers, dano: d, absorvido: 0, linha: "" };

  const absorvido = Math.min(forca, d);
  const resto = d - absorvido;
  const nome = abrigo.nome || "o abrigo";
  return {
    /* estado NOVO, e a lista sai limpa de buracos porque `efeitosDe` já a
       entregou assim — o mesmo que `empilhar` faz há uma versão */
    pers: { ...pers, efeitos: lista.filter((e) => e !== abrigo) },
    dano: resto, absorvido,
    /* a voz é de mundo e não nomeia mecanismo nenhum; o número entra porque
       o jogador pagou PM por ele e precisa ver o que comprou */
    linha: resto > 0
      ? `🛡 ${nome} encontra o golpe primeiro e se desfaz: ${absorvido} param ali, ${resto} chegam.`
      : `🛡 ${nome} encontra o golpe primeiro e se desfaz: nada chega.`,
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
