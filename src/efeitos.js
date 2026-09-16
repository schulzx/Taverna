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

   E É SÓ ESSA, DE PROPÓSITO (v9.237 · C3). A concentração tem uma segunda
   regra — uma por vez, venha com o nome que vier — e ela NÃO mora aqui:
   mora em `firmarEfeito`, logo abaixo. `empilhar` é o genérico da poção, da
   relíquia e do canal do Mestre, e nenhum dos três segura coisa alguma.

   O que varia é o CASAMENTO do nome, e varia porque sempre variou: os
   catálogos e o App comparam o nome exato (`"Fúria" !== "fúria"`), e o
   canal do Mestre compara sem caixa, porque de lá o nome vem digitado
   por uma IA. As duas continuam, com nome próprio — `casamento: "exato"`
   e `casamento: "solto"` — em vez de duas linhas parecidas em arquivos
   distantes.
   ============================================================ */

import { naturezaDaHabilidade, aplicacaoDoBuff } from "./combos.js";
import { magiaPorNome, exigeConcentracao, CONCENTRACAO_DA_MAGIA } from "./grimorio.js";
/* v9.269 (Fase V · V1): o poço que apanha DEPOIS do abrigo. A seta aponta num
   sentido só — `temporario.js` não importa nada de `src/`, e é por isso que o
   teto do abrigo aparece lá só em comentário. O porquê da ordem inteira está
   no cabeçalho dele. */
import { gastarTemporario } from "./temporario.js";

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
  /* v9.274 (F1): esta linha de `APLICACAO_DO_BUFF` foi a PRIMEIRA a ganhar
     número, e desde F1 já não é a única — `amortece` tem a tabela irmã logo
     abaixo. Ficam TRÊS sem número (`nao_cai`, `intocado`, `protege`): elas
     prometem outra coisa — um chão de PV, um golpe que erra, o abrigo num
     corpo alheio — e cada uma é a sua própria etapa. Enquanto não forem,
     elas saem daqui exatamente como saíam. */
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

/* ---------------- O AMORTECIMENTO: QUANTO UM ABAFO TIRA DE CADA GOLPE (v9.274 · F1)
   A segunda tabela da mesma família de decisões, e mora colada à primeira de
   propósito: `ABSORCAO_DO_BUFF` e esta respondem à MESMA pergunta ("quanto
   vale, em dano evitado, o PM que o jogador gastou numa defensiva?") por
   caminhos opostos, e lidas lado a lado é impossível uma divergir da outra
   sem que se veja.

   A RÉGUA SAI DO CUSTO, pelo mesmo argumento das duas irmãs de cima: é o
   custo em PM que separa um truque de uma promessa. O que muda é a MOEDA —
   `absorve` compra PONTOS, esta compra PORCENTAGEM, e a diferença não é
   estética: a família `amortece` não se gasta. O abrigo morre na primeira
   batida que encontra; o abafo vale em TODO golpe que chegar enquanto o
   prazo durar. Por isso a régua aqui é medida no TOTAL, não no golpe.

   O NÚMERO SAIU DA PARIDADE, e a conta está escrita para poder ser refeita.
   Um golpe da arena tem mediana 13 e o prazo padrão de um buff é 3 turnos
   (`BUFF_DA_HABILIDADE.turnosPadrao`), ou seja ~3 golpes abafados. Com 5
   pontos percentuais por PM:
     · 2 PM → 10% → 1 por golpe → ~3 no total   (absorve a 2 PM come 4)
     · 3 PM → 15% → 2 por golpe → ~6 no total   (absorve a 3 PM come 6)
     · 4 PM → 20% → 3 por golpe → ~9 no total   (absorve a 4 PM come 8)
     · 5 PM → 25% → 3 por golpe → ~9 no total   (absorve a 5 PM come 10)
   As duas famílias compram a mesma coisa pelo mesmo preço, e é o que se
   queria: quem paga 4 PM por proteção recebe proteção de 4 PM, venha ela
   de uma vez ou repartida pelo prazo. O que distingue as duas passa a ser
   a FORMA — o escudo é seguro (o número é o número), o abafo é uma aposta
   na duração e cresce com o tamanho do golpe.

   O TETO EM 25% É A PARTE QUE IMPORTA, e é o lugar onde esta tabela é MAIS
   dura que a irmã. `ABSORCAO_DO_BUFF` pôde dar-se ao luxo de um teto perto
   do golpe mediano porque o abrigo se gasta; uma proporção que durasse
   turnos com 50% (a metade que a ficha das habilidades promete em palavras)
   seria a Pele de Pedra do Goliath — um gasto de uma vez por luta — ligada
   a todo golpe da cena, por 3 PM. É a mesma lei que `GUARDAS` e
   `ABSORCAO_DO_BUFF` escreveram: nada que zere o golpe, porque defesa alta
   é a estatística que mais rápido quebra um combate. A ficção continua a
   dizer "metade"; o sistema paga um quarto, e paga em todo golpe.

   `pisoDoGolpe` É A LEI DE "NADA ZERA", EM TABELA. Com teto de 25% ele nunca
   morde (75% de 1 ainda é 1) — e existe exatamente por isso: no dia em que
   alguém subir o teto, o piso já está escrito e já é lido. A Pele de Pedra
   cumpre a mesma lei com `Math.max(1, ...)` desde a v9.44.

   `custoPadrao` é o das duas irmãs, e pelo mesmo motivo: relíquia, poção,
   grimório e o que o piloto escolhe chegam aqui sem custo nenhum, e sem ele
   a família inteira nasceria no piso. */
export const AMORTECIMENTO_DO_BUFF = {
  familia: "amortece",
  porPM: 5, custoPadrao: 2, minimo: 10, teto: 25, pisoDoGolpe: 1,
};

/* Privada pelo motivo exato de `forcaDaAbsorcao`: quem precisa do número
   recebe o efeito já com ele dentro, por `efeitoDeBuff`. Um segundo caminho
   para o mesmo número é a forma de as duas metades divergirem daqui a três
   versões. Quem GASTA o número é `amortecerDano` (tracos.js), e ele lê a
   tabela, nunca esta conta. */
function forcaDoAmortecimento(hab) {
  const custo = Number((hab || {}).custo);
  const pm = Number.isFinite(custo) && custo > 0 ? custo : AMORTECIMENTO_DO_BUFF.custoPadrao;
  return Math.min(AMORTECIMENTO_DO_BUFF.teto, Math.max(AMORTECIMENTO_DO_BUFF.minimo, Math.round(pm * AMORTECIMENTO_DO_BUFF.porPM)));
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

/* ---------------- A PILHA QUE SABE DE CONCENTRAÇÃO (v9.237 · C3) ----------
   A irmã dedicada de `empilhar`, e existe porque `empilhar` NÃO pode aprender
   isto. Ele é o genérico da casa — a poção (pocoes.js), a relíquia
   (relicas.js) e o canal do Mestre (regras-jogo.js) passam por ele, e nenhum
   dos três produz concentração nenhuma; ensinar concentração ao genérico seria
   pôr uma regra de magia no caminho de um frasco de cerveja. Então a regra
   nova mora numa porta própria, e só os NASCIMENTOS que podem segurar algo
   passam por ela: são quatro, medidos — o buff do herói e o do companheiro
   (`App.jsx`), a magia de duração do herói (`App.jsx`) e o buff do duelista
   (`arena.js`). Os outros quatro sítios de `empilhar` continuam onde estavam.

   O MOLDE É O DE `absorverDano`: recebe a ficha e o que chega, devolve ficha
   NOVA mais a frase, não muta nada, e quem chama escolhe o que fazer com os
   dois. Nenhuma regra é decidida por quem chama.

   O TETO É DA TABELA, NUNCA DAQUI. `CONCENTRACAO_DA_MAGIA.quantasAoMesmoTempo`
   diz quantas cabem; esta função só conta. Ela derruba as MAIS ANTIGAS até
   caber — do jeito que `empilhar` já ordena a lista, a ordem de chegada é a
   ordem do array, e quem entrou primeiro sai primeiro. Com o teto em 1 isso é
   "a nova derruba a que estava", que é a regra da mesa; com o teto em 2 amanhã
   seria "a nova derruba a mais velha das duas", sem uma linha de código nova.

   REGRESSÃO ZERO PARA QUEM NÃO CONCENTRA, e é a metade que mais importa: se o
   efeito que chega não tem a chave, esta função é `empilhar` e mais nada —
   frase vazia, ninguém cedeu. `null`, `{}`, save antigo, poção, milagre e as
   82 magias que não estão na porta passam por aqui exatamente como passavam.

   E QUEM NÃO ENTROU NÃO DERRUBA NINGUÉM. `empilhar` recusa efeito sem nome
   (ele nunca poderia ser retirado depois); um efeito assim, marcado com
   `concentracao`, derrubaria a magia do jogador e não ocuparia o lugar dela —
   o jogador perderia a Bênção em troca de nada. Por isso a porta confere que o
   recém-chegado é mesmo o último da lista antes de cobrar o teto. */
export function firmarEfeito(pers, novo, opcoes) {
  if (!pers) return { pers, linha: "", cedeu: [] };
  const empilhado = empilhar(pers.efeitos, novo, opcoes);
  const entrou = empilhado.length > 0 && empilhado[empilhado.length - 1] === novo;
  if (!entrou || !novo.concentracao) return { pers: { ...pers, efeitos: empilhado }, linha: "", cedeu: [] };

  /* o teto vem da tabela e é lido com recuo: uma entrada torta (ausente, zero,
     texto) não pode deixar o conjurador acumular de novo em silêncio — o piso
     é 1, que é a própria regra da mesa */
  const bruto = Math.round(Number(CONCENTRACAO_DA_MAGIA.quantasAoMesmoTempo));
  const teto = Number.isFinite(bruto) && bruto > 0 ? bruto : 1;
  /* as que JÁ estavam sendo seguradas, na ordem de chegada — a recém-chegada
     não se conta, senão a magia derrubaria a si mesma quando o teto fosse 1 */
  const antigas = empilhado.filter((e) => e.concentracao && e !== novo);
  const cedem = antigas.slice(0, Math.max(0, antigas.length - (teto - 1)));
  if (!cedem.length) return { pers: { ...pers, efeitos: empilhado }, linha: "", cedeu: [] };

  const nomes = cedem.map((e) => (typeof e.nome === "string" && e.nome.trim()) || "o que ele segurava");
  const muitas = nomes.length > 1;
  const lista = muitas ? `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}` : nomes[0];
  const quemChega = (typeof novo.nome === "string" && novo.nome.trim()) || "o que ele acabou de erguer";
  return {
    pers: { ...pers, efeitos: empilhado.filter((e) => !cedem.includes(e)) },
    /* A FRASE É IRMÃ DA DE `testeConcentracao` (combate.js), palavra por
       palavra no começo: mesmo ícone, mesmo "escapa dos dedos", mesmo
       travessão. É a mesma perda para o jogador, e ler duas prosas diferentes
       para a mesma perda seria a mesa gaguejando. O que muda é o MOTIVO depois
       do travessão, e ele tem de estar lá: perder a Bênção porque se lançou Voo
       é justo — perder sem entender por quê, não.
       Voz de mundo, e o nome do mecanismo não aparece: quem lê vê duas magias
       disputando as mãos de alguém, não um teto de tabela sendo cobrado. O dono
       na frente é coisa de tela, como no abrigo — a porta sai seca. */
    linha: `💢 ${lista} escapa${muitas ? "m" : ""} dos dedos — ${quemChega} toma o lugar ${muitas ? "delas" : "dela"}.`,
    cedeu: nomes,
  };
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
   porque continuam sem número.

   E AGORA ELE NASCE SABENDO O QUE ESTÁ SEGURANDO (v9.236 · C2b). C1 escreveu
   aqui, com todas as letras, que este nascimento não copiava `concentracao`
   "porque não há de onde: habilidade e milagre não declaram concentração em
   tabela nenhuma desta casa". A primeira metade era verdade e continua sendo;
   a segunda estava errada, e a medição de C2 a desmentiu: **8 das 148
   habilidades de classe SÃO magia do catálogo pelo nome, e 5 delas
   concentram**. Bênção, Escudo da Fé, Invisibilidade, Voo e Marca do Caçador
   estão nas duas listas ao mesmo tempo — a tabela existia, só ninguém tinha
   perguntado a ela.

   E A PERGUNTA É AO CATÁLOGO, NUNCA À HABILIDADE. `exigeConcentracao` aceita
   objeto solto, e passar `h` direto responderia pelo que a FICHA diz de si —
   uma habilidade não tem `duracao` nem `concentracao`, então a resposta seria
   sempre `false`, em silêncio. Pior: no dia em que alguém escrevesse
   `concentracao: true` à mão numa entrada de `habilidades.js`, a regra
   passaria a morar em dois lugares. Aqui o nome vai ao grimório, e só o que
   o grimório reconhece segura: habilidade que não é magia sai daqui exatamente
   como saía (`magiaPorNome` devolve `null` e a chave não nasce).

   A CHAVE SÓ NASCE QUANDO EXISTE, pela mesma régua de `efeitoDeMagia` e de
   `absorve`: ausente, nunca `false`. E `Escudo Arcano` é o controle vivo desta
   linha — é magia do catálogo, é habilidade de Mago, e NÃO concentra (é uma
   das dez exceções de `CONCENTRACAO_DA_MAGIA`, porque dura uma rodada). Se um
   dia ele começar a sair daqui com a chave, foi a exceção que se soltou. */
export function efeitoDeBuff(hab, pers, turnos) {
  const h = hab || {};
  /* a magia do catálogo com este nome, se houver — e é ela, não a habilidade,
     quem responde se há o que segurar */
  const doCatalogo = magiaPorNome(h.nome);
  const segura = !!doCatalogo && exigeConcentracao(doCatalogo);
  const forca = Math.max(
    BUFF_DA_HABILIDADE.forcaMinima,
    Math.round((Number(h.custo) || BUFF_DA_HABILIDADE.custoPadrao) / BUFF_DA_HABILIDADE.divisorDoCusto),
  );
  const escopo = naturezaDaHabilidade(h, pers);
  const prazo = turnos || BUFF_DA_HABILIDADE.turnosPadrao;
  const protecao = aplicacaoDoBuff(h);
  if (protecao) {
    const base = { nome: h.nome, bonus: 0, turnos: prazo, aplica: protecao.aplica, escopo };
    if (segura) base.concentracao = true;
    if (protecao.id === ABSORCAO_DO_BUFF.familia) {
      const absorve = forcaDaAbsorcao(h);
      return {
        efeito: { ...base, absorve },
        extraEscopo: ` · ${protecao.conceito} — aguenta ${absorve} do próximo golpe`,
      };
    }
    /* v9.274 (F1): a segunda família a comprar alguma coisa. A chave é irmã
       da de cima e obedece à mesma regra — só nasce quando existe, nunca
       `false` nem `0` —, e a frase anuncia o que o jogador comprou pelo mesmo
       motivo que a de `absorve` anuncia: ele pagou PM por aquele número. A
       voz é de mundo; o nome do mecanismo não aparece em lado nenhum. */
    if (protecao.id === AMORTECIMENTO_DO_BUFF.familia) {
      const amortece = forcaDoAmortecimento(h);
      return {
        efeito: { ...base, amortece },
        extraEscopo: ` · ${protecao.conceito} — abafa ${amortece}% de cada golpe`,
      };
    }
    return { efeito: base, extraEscopo: ` · ${protecao.conceito}` };
  }
  const efeito = {
    nome: h.nome, bonus: forca, turnos: prazo,
    aplica: BUFF_DA_HABILIDADE.aplica, escopo,
  };
  if (segura) efeito.concentracao = true;
  return {
    efeito,
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

   DOS TRÊS NASCIMENTOS, ESTE E O BUFF (v9.236 · C2b corrige o que C1 escreveu
   aqui). C1 disse "só este", e o motivo dado era que habilidade e milagre não
   têm de onde copiar. Metade certa: `efeitoDeMilagre` continua mudo, e por
   esse motivo exato — não existe tabela de milagre que declare concentração.
   A outra metade era engano, e foi a medição de C2 que o apanhou: 8 das 148
   habilidades de classe são magia do catálogo pelo NOME, e 5 concentram, então
   `efeitoDeBuff` sempre teve de onde perguntar — o grimório. Ele pergunta
   desde C2b; o milagre continua onde estava, e continua por prova.

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
   eles esta função é um `return` do que entrou. `null` e `{}` idem.

   ---------------- E DEPOIS DO ABRIGO, O POÇO (v9.269 · V1) ----------------

   Esta é a ÚNICA porta por onde o dano passa antes de virar PV, e é por isso
   que o PV temporário entra aqui e não num quinto sítio: a ordem inteira
   (abrigo → temporário → PV real → a queda) sai de graça, por composição.
   O argumento completo — por que o abrigo primeiro, por que ele se gasta
   inteiro e o poço parcialmente, e por que Q1 não precisou de uma linha —
   está no cabeçalho de `temporario.js` e não se repete aqui.

   A MUDANÇA É ADITIVA, e as três coisas que a mantêm assim:

   · `absorvido` PASSA A SER O TOTAL (abrigo + poço), e é de propósito. Ele é
     o sinal que faz o chamador escrever a ficha de volta — `arena.js:249` e
     `App.jsx:6627` só tocam na ficha quando `absorvido > 0`. Sem o poço
     dentro da soma, ele seria gasto e esquecido a cada golpe: o bug exato que
     o comentário de `arena.js:246` já avisa para o abrigo.
   · `linha` CONTINUA A SER SÓ A DO ABRIGO, byte a byte. O App faz
     `String(ab.linha).replace("🛡 ", ...)` para pôr o nome do dono; juntar
     duas frases ali quebraria a substituição. A frase do poço sai por
     `linhaDoTemporario`, chave nova, para V2 a pôr onde quiser. O "N chegam"
     do abrigo passa a querer dizer "N saem do escudo" — e quem apanha esses N
     é a frase seguinte, que V2 escreve logo abaixo. As duas lidas em ordem
     contam a verdade; a do abrigo sozinha continua a contar o que sempre
     contou, que é o que a regressão exige.
   · `doTemporario` é o número do poço sozinho, pela mesma razão: quem quiser
     separar as duas metades não tem de as subtrair.

   E A PORTA DOS FUNDOS DEIXOU DE SAIR DO PRÉDIO. O `if (!abrigo)` continua a
   existir, mas agora passa pelo poço antes de devolver: quem não tem abrigo e
   TEM temporário é o caso mais comum dos dois, e sair por ali seria o poço
   nunca morder. Ficha sem abrigo E sem poço devolve exatamente o que devolvia
   antes — `absorvido: 0`, `linha: ""`, e o MESMO objeto `pers` que entrou. */
export function absorverDano(pers, dano) {
  const d = Math.max(0, Math.round(Number(dano) || 0));
  if (!d || !pers) return { pers, dano: d, absorvido: 0, linha: "", doTemporario: 0, linhaDoTemporario: "" };
  const lista = efeitosDe(pers);
  let abrigo = null, forca = 0;
  for (const ef of lista) {
    const n = Math.max(0, Math.round(Number(ef.absorve) || 0));
    if (n > forca) { abrigo = ef; forca = n; }
  }
  if (!abrigo) {
    /* sem abrigo o golpe encontra o poço diretamente — e sem poço `gastarTemporario`
       devolve o que entrou, com o mesmo objeto `pers`: a regressão fica em zero */
    const so = gastarTemporario(pers, d);
    return { pers: so.pers, dano: so.dano, absorvido: so.absorvido, linha: "", doTemporario: so.absorvido, linhaDoTemporario: so.linha };
  }

  const absorvido = Math.min(forca, d);
  const resto = d - absorvido;
  const nome = abrigo.nome || "o abrigo";
  /* estado NOVO, e a lista sai limpa de buracos porque `efeitosDe` já a
     entregou assim — o mesmo que `empilhar` faz há uma versão */
  const semAbrigo = { ...pers, efeitos: lista.filter((e) => e !== abrigo) };
  /* o que o escudo não comeu segue para o poço, e é só este resto que chega lá */
  const t = gastarTemporario(semAbrigo, resto);
  return {
    pers: t.pers,
    dano: t.dano,
    absorvido: absorvido + t.absorvido,
    /* a voz é de mundo e não nomeia mecanismo nenhum; o número entra porque
       o jogador pagou PM por ele e precisa ver o que comprou */
    linha: resto > 0
      ? `🛡 ${nome} encontra o golpe primeiro e se desfaz: ${absorvido} param ali, ${resto} chegam.`
      : `🛡 ${nome} encontra o golpe primeiro e se desfaz: nada chega.`,
    doTemporario: t.absorvido,
    linhaDoTemporario: t.linha,
  };
}

/* ---------------- A CONCENTRAÇÃO ----------------
   Uma magia de concentração é um efeito que o corpo segura: apanhou,
   testa; falhou, cai. O teste é de quem chama (`testeConcentracao`, em
   combate.js); daqui sai só quem está sendo segurado e a ficha sem ele.

   A ESCOLHA É REGRADA, E NÃO MAIS DA ORDEM DE CHEGADA (v9.237 · C3). Até aqui
   isto era um `.find(...)`: numa ficha com duas concentrações ele devolvia a
   PRIMEIRA da lista, ou seja a mais VELHA, e uma batida derrubava sempre a
   errada — regra decidida por sorte de array, que é o que esta casa não
   tolera. Com o teto de `CONCENTRACAO_DA_MAGIA` valendo, a ficha de duas não
   nasce mais por aqui: ela só chega por SAVE ANTIGO (guardado antes desta
   versão, com as duas dentro) e por ficha injetada à mão.

   E NESSES DOIS CASOS QUEM FICA É A ÚLTIMA A ENTRAR, pelo motivo escrito: a
   ordem do array é a ordem de chegada (`empilhar` põe o novo no fim), e a
   última é exatamente a que `firmarEfeito` teria mantido se o save tivesse
   passado por ela. A primeira nunca deveria ter sobrevivido àquele segundo
   lançamento; escolhê-la agora seria deixar o save velho quebrar a magia que o
   jogador acabou de erguer e continuar carregando o fantasma da anterior —
   perder duas vezes pelo mesmo defeito. Quem sobra é o que o corpo segura. */
export function efeitoEmConcentracao(pers) {
  const lista = efeitosDe(pers);
  for (let i = lista.length - 1; i >= 0; i--) if (lista[i].concentracao) return lista[i];
  return null;
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
