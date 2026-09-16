/* ============================================================
   A ESCADA (Fase N · N2) — quanta cabeça, e de onde cada um tira a sua

   O PRINCÍPIO, e ele é o módulo inteiro:

     Uma criatura NÃO ENXERGA o que está acima do degrau dela. Não é
     que ela escolha não usar — não lhe ocorre.

   É a diferença entre um inimigo que "se contém" (e a contenção é
   sempre arbitrária, sempre ajustável, sempre errada em alguma mesa) e
   um inimigo que simplesmente não tem aquele pensamento. O primeiro é
   dificuldade disfarçada; o segundo é uma pessoa diferente.

   ---------------- POR QUE ESTA ESCADA NASCE ----------------

   A medição de N1 achou o defeito e ele não é "o inimigo é esperto
   demais": é serem TODOS igualmente espertos, e no máximo. A fechadura
   que existia era binária — `pensa` é sim/não, `menteDaCriatura` diz
   sim para 18 das 27 criaturas, e o `peso` da intenção é um ranking
   GLOBAL. Resultado medido: `calar_a_magia` (peso 17) vence a rodada 1
   de praticamente toda luta, e 14 das 46 intenções nunca são eleitas.
   Não é esperteza: é ausência de escala.

   ---------------- O QUE ESTE MÓDULO NÃO FAZ ----------------

   N2 NÃO LIGA NADA. Ninguém decide por degrau ainda: `consultarAdversario`,
   `intencaoDaVez`, `escolherAlvo` e `menteDaCriatura` devolvem hoje
   exatamente o que devolviam antes desta etapa. Aqui só nascem a tabela,
   as duas fontes e o seletor que N4 vai consumir.

   ---------------- COMO ELE CONVIVE COM `menteDaCriatura` ----------------

   Duas classificações de cabeça em dois lugares é a doença que esta casa
   conhece, então as duas perguntas ficam separadas e cada uma tem um dono:

   · `menteDaCriatura` (adversario.js) responde QUE TIPO de mente —
     besta · morto · pensa. É ela que alimenta `ehBicho`/`ehMorto` em
     `garantirLuta` e decide se o bicho negocia, se foge, se teme morrer.
   · `degrauDaCriatura` (aqui) responde QUANTA. E é o ÚNICO sítio que
     computa o degrau de uma criatura: quem quiser saber o degrau de
     alguma coisa no mundo tem exatamente uma função para chamar.

   O degrau CONSOME as duas coisas — a `ameaca` (que já é ordinal) e o
   tipo de mente — por tabela nomeada, e a seta aponta num sentido só:
   este módulo lê `adversario.js`; `adversario.js` não lê este módulo.
   Um círculo entre os dois deixaria a ordem de avaliação decidir se
   `INTENCOES` nasce antes ou depois de `DEGRAUS`, e isso é uma bomba
   silenciosa.

   ---------------- O LIMITE CONHECIDO DE N2, MEDIDO ----------------

   Um limite escrito é dívida; um limite calado é mentira. Este está
   medido e é dívida declarada de N4:

     ENQUANTO `pensa` FOR BINÁRIO, NENHUM MORTO-VIVO DECLARADO NO TOPO
     ALCANÇA AS DUAS INTENÇÕES DO TOPO.

   `calar_a_magia` e `matar_o_remendo` têm portão `quando: (s) => s.pensa
   && …`, e `pensa` vem de `menteDaCriatura`, que devolve `morto` para o
   Lich. A escada DEIXA PASSAR — `enxerga("brilhante", "brilhante")` é
   `true` —; quem barra é a porta antiga, que ainda decide sozinha.
   O resultado na régua: o Lich, com `degrau: "brilhante"` declarado no
   bestiário, elege `nao_para` (peso 11, degrau `animal`) e é o inimigo
   MAIS FÁCIL da régua inteira — 97-98% de vitória do grupo, idêntico
   antes e depois desta etapa.

   Não se conserta aqui, e de propósito: mexer em `menteDaCriatura` ou no
   `quando` das duas é mudança de comportamento vivo, é a decisão da
   fase, e precisa de medição própria. Quem resolve é a etapa que troca o
   portão `pensa` pelo degrau — N4.
   ============================================================ */

import { ATRIBUTO_MAX, ATRIBUTO_MAX_CRIACAO } from "./constantes.js";
import { atributoDaClasse } from "./atributos.js";
import { menteDaCriatura, INTENCOES } from "./adversario.js";

/* ---------------- OS CINCO DEGRAUS ----------------
   `enxerga` é o que chega aos olhos dele; `decide` é o que ele faz com
   isso. As duas colunas nascem juntas de propósito: um degrau que
   enxerga mais do que decide é onisciência inútil, e um que decide mais
   do que enxerga é o Mestre jogando pelo monstro.

   Nomes são BASTIDOR — nenhum deles aparece na tela. O jogador sente a
   diferença pelo que o inimigo faz, nunca lendo o nome do mecanismo. */
export const DEGRAUS = [
  {
    id: "animal", ordem: 0, nome: "animal",
    enxerga: "quem está na frente e quem já está caindo — nada além do alcance do corpo",
    decide: "pelo corpo: comer, expulsar do território, fugir ferido, ou bater em quem estiver mais perto",
  },
  {
    id: "bruto", ordem: 1, nome: "bruto",
    enxerga: "o número dos dois lados, o próprio estado e a ordem que recebeu",
    decide: "pela força: cercar quando são mais, aguentar quando são menos, terminar quem já está caindo, ir no que parece mais forte",
  },
  {
    id: "astuto", ordem: 2, nome: "astuto",
    enxerga: "o lugar e a oportunidade — a beira, a água, o escuro, a porta, o refém, o que o outro carrega",
    decide: "pela vantagem: usar o terreno e o que está em jogo para gastar menos golpe do que gastaria brigando",
  },
  {
    id: "treinado", ordem: 3, nome: "treinado",
    enxerga: "o outro lado como um grupo, e o próprio bando como uma tropa com baixas",
    decide: "pelo plano: separar, cercar quem ficou só, capturar, atrasar — e parar de gastar golpe em quem já não é ameaça",
  },
  {
    id: "brilhante", ordem: 4, nome: "brilhante",
    enxerga: "a função de cada um do outro lado ANTES de ela ser usada",
    decide: "pela mesa: derruba primeiro o que faz a mesa funcionar — a magia e o remendo",
  },
];

/* O CHÃO DA ESCADA. Ninguém fica abaixo dele, e nenhuma entrada torta
   pode fazer alguém ficar sem degrau: um combatente sem degrau é um
   combatente sem intenção, e isso é um turno perdido na mesa. */
export const DEGRAU_DO_CHAO = "animal";

export function degrauPorId(id) { return DEGRAUS.find((d) => d.id === id) || null; }

export function ordemDoDegrau(id) { const d = degrauPorId(id); return d ? d.ordem : -1; }

/* A pergunta que o módulo inteiro existe para responder: alguém NESTE
   degrau chega a ter ESTE pensamento? */
export function enxerga(degrau, nivelMinimo) {
  const meu = ordemDoDegrau(degrau);
  const dele = ordemDoDegrau(nivelMinimo);
  if (meu < 0 || dele < 0) return false;
  return meu >= dele;
}

/* ---------------- FONTE (a): A FICHA — herói e companheiro ----------------

   A ESCALA, E A RAZÃO DE ELA SER POR FAIXA. N1 mediu o terreno real e
   ele é apertado: a criação vai de 0 a `ATRIBUTO_MAX_CRIACAO` (3) com
   `PONTOS_TOTAIS` (6) livres, a raça leva até `ATRIBUTO_MAX` (5), e os
   oito prontos ocupam apenas 0, 1 e 3 — mediana 1, média 1,13, três
   deles em zero e o valor 2 VAZIO.

   Uma escada de cinco degraus não cabe em três valores. Um degrau por
   valor de `intelecto` nasceria com metade da escada inalcançável, e a
   saída errada seria redistribuir o `intelecto` dos prontos — mexer em
   ficha que a catraca de equilíbrio da arena vigia, para consertar uma
   tabela que não precisava do conserto.

   Então o mapa é uma TABELA DE FAIXAS sobre o domínio inteiro
   `0..ATRIBUTO_MAX`, e não um degrau por valor. Assim nenhum degrau
   fica morto — e "morto" aqui quer dizer degrau que FONTE NENHUMA
   alcança. A fonte da criatura alcança os cinco; a da ficha alcança
   quatro, e é assim que tem de ser (veja o chão, logo abaixo).

   `ATRIBUTO_MAX` é o teto, IMPORTADO e não copiado. Ele existia desde
   sempre em `constantes.js`, era importado no `App.jsx` e nunca lido —
   não tinha um leitor sequer. Aqui ele ganha o primeiro de verdade, e é
   por isso que a última faixa diz `ate: ATRIBUTO_MAX` em vez de `ate: 5`:
   no dia em que o teto mudar, a escada acompanha sozinha.

   O CHÃO DA FICHA É `bruto`, NÃO `animal`, e isto é princípio: quem tem
   ficha é gente. `animal` é o degrau de quem decide pelo corpo, e nem o
   herói de `intelecto` 0 decide pelo corpo — ele decide mal, que é
   outra coisa. `animal` fica para a criatura, e não vira degrau morto
   porque a fonte da criatura o alcança.

   O TETO DA FICHA É `brilhante` E CUSTA 5, e 5 NÃO É O FIM DA ESCALA.
   Na CRIAÇÃO, 5 é o máximo da criação (3) mais a raça: ninguém NASCE
   brilhante. Mas o teto cresce com o nível — `tetoAtributo` (atributos.js)
   dá 6 no nível 10, 7 no 15 e 8 no 20 —, então a partir do nível 10 o
   topo da escada é alcançável sem raça nenhuma, só jogando. É assim que
   tem de ser: cabeça se ganha.
   Por isso a última faixa SATURA de propósito — ela diz `ate: ATRIBUTO_MAX`
   e o valor entra limitado a esse teto, de modo que 6, 7 e 8 continuam
   `brilhante` em vez de caírem fora da tabela. A escada tem cinco degraus
   e não ganha um sexto porque a progressão andou. */
export const FAIXAS_DO_INTELECTO = [
  { ate: 0, degrau: "bruto" },
  { ate: 2, degrau: "astuto" },
  { ate: 4, degrau: "treinado" },
  { ate: ATRIBUTO_MAX, degrau: "brilhante" },
];

/* O RECUO, QUANDO NÃO HÁ `atributos` NENHUM — e ele é a regra, não a
   exceção. O companheiro não tem `intelecto`: `garantirFichaCompanheiro`
   e `fichaDeCompanheiro` montam dez campos e nenhum é `atributos`, e
   nenhum dos dois caminhos de criação os passa. O único companheiro com
   atributos é o que vem da sala PvP, porque é ficha de jogador.

   Fazer o `intelecto` do companheiro NASCER seria campo novo em ficha
   viva e em todo save de campanha — peso que esta etapa não paga. Então
   ele recua para a CLASSE, que já existe e já separa Mago de Guerreiro:
   `atributoChave` é o que a classe considera que resolve os problemas
   dela, e isso é exatamente a pergunta que a escada faz.

   O recuo é EXPLÍCITO E TABELADO — nunca um `|| 1` solto no meio da
   função. E ele devolve um `intelecto` PRESUMIDO, que passa pela mesma
   tabela de faixas acima: uma escada só, para as duas fontes. O teto do
   presumido é `ATRIBUTO_MAX_CRIACAO`, porque presumir acima disso seria
   dar ao companheiro o que nem o herói ganha na criação. */
export const RECUO_POR_ATRIBUTO_CHAVE = {
  forca: 0,      /* resolve com o corpo */
  vigor: 0,      /* resolve aguentando */
  destreza: 1,   /* resolve com a mão, e a mão aprende */
  presenca: 2,   /* lê gente, que é metade de ler uma luta */
  percepcao: 2,  /* lê a sala */
  intelecto: 3,  /* é a classe que estuda: o topo do que a criação dá */
};

function degrauPorIntelecto(n) {
  const cru = Number(n);
  const v = Math.max(0, Math.min(ATRIBUTO_MAX, Number.isFinite(cru) ? Math.floor(cru) : 0));
  for (const f of FAIXAS_DO_INTELECTO) if (v <= f.ate) return f.degrau;
  return FAIXAS_DO_INTELECTO[FAIXAS_DO_INTELECTO.length - 1].degrau;
}

/* `= {}` no destructuring NÃO cobre `null`, e ficha nula chega aqui
   (companheiro que ainda não foi garantido, alvo de sala vazia). Por
   isso o teste é explícito, e por isso `atributos: null` cai no recuo
   em vez de estourar. */
export function degrauDaFicha(ficha) {
  const f = ficha && typeof ficha === "object" ? ficha : null;
  const attrs = f && f.atributos && typeof f.atributos === "object" ? f.atributos : null;
  const bruto = attrs ? Number(attrs.intelecto) : NaN;
  if (Number.isFinite(bruto)) return degrauPorIntelecto(bruto);
  const chave = atributoDaClasse(String((f && f.classe) || ""));
  const presumido = Math.min(ATRIBUTO_MAX_CRIACAO, RECUO_POR_ATRIBUTO_CHAVE[chave] ?? RECUO_POR_ATRIBUTO_CHAVE.forca);
  return degrauPorIntelecto(presumido);
}

/* ---------------- FONTE (b): A CRIATURA ----------------

   A ÂNCORA É `ameaca`, e ela foi escolhida por medição, não por gosto:
   é o único campo do bestiário com as quatro propriedades de que a
   escada precisa — cinco valores fechados, já ordinal (`bonusDeAmeaca`,
   `pvEsperadoInimigo` e `ataquesDoInimigo` a leem como escada),
   sobrevive a `completarInimigo`, e tem recuo explícito (`"comum"`)
   para o nome que o Narrador inventa na hora.

   `nivelRef` tem 13 valores para 27 criaturas e não é ordinal de
   cabeça; `des`/`agil` medem corpo; `perfil` só existe em 7. */
export const AMEACA_PADRAO = "comum";
export const DEGRAU_POR_AMEACA = {
  fraco: "bruto",
  comum: "bruto",
  competente: "astuto",
  elite: "treinado",
  lendario: "treinado",
};

/* E `ameaca` SOZINHA NÃO BASTA — é perigo, não cabeça. O Golem de Pedra
   é `elite` e não pensa; Comandante ("perigoso e tático") e Sentinela
   Blindada ("muralha ambulante") são as DUAS `elite`. Por isso o tipo de
   mente impõe um TETO: quem não tem com que pensar não sobe, por mais
   perigoso que seja. */
export const TETO_POR_MENTE = {
  besta: "animal",   /* decide pelo corpo, e é só o que tem */
  morto: "bruto",    /* cumpre o que foi posto para cumprir, e não muda de ideia */
  pensa: "treinado", /* gente pode planejar — o topo, mesmo assim, não vem de graça */
};

/* A REGRA QUE DECIDE A FASE, e ela é de PRINCÍPIO, não de número:

     `brilhante` NÃO SE HERDA — DECLARA-SE.

   Herdar o topo é exatamente o erro que `calar_a_magia` cometia: todo
   nome que o Narrador inventasse nascia com a mente mais afiada da mesa,
   e vencia a rodada 1 de toda luta. O degrau herdado tem teto, e o topo
   exige uma declaração na ficha da criatura — alguém tem de ter escrito,
   no bestiário, que AQUELA criatura lê a mesa. */
export const TETO_DO_HERDADO = "treinado";

/* O ÚNICO SÍTIO QUE COMPUTA O DEGRAU DE UMA CRIATURA.

   Funciona com NOME + AMEAÇA apenas, de propósito: `completarInimigo`
   não copia o `desc` da base (é dívida conhecida e de outro dono), e a
   criatura que chega à mesa é a que sai de lá. Depender do `desc` seria
   escrever uma tabela certa que a mesa nunca veria — o mesmo jeito como
   o Troll ganhou fraqueza a fogo e continuou imune.

   O `lex` é opcional e existe porque `menteDaCriatura` dá a palavra
   final ao mundo criado pelo léxico antes de qualquer regex. */
export function degrauDaCriatura(criatura, { lex = null } = {}) {
  const c = criatura && typeof criatura === "object" ? criatura : {};
  const declarado = degrauPorId(String(c.degrau || ""));
  if (declarado) return declarado.id;
  const porAmeaca = DEGRAU_POR_AMEACA[String(c.ameaca || "")] || DEGRAU_POR_AMEACA[AMEACA_PADRAO];
  let mente = "pensa";
  try { mente = menteDaCriatura(String(c.nome || ""), "", lex) || "pensa"; } catch { mente = "pensa"; }
  const teto = TETO_POR_MENTE[mente] || TETO_DO_HERDADO;
  const ordem = Math.min(ordemDoDegrau(porAmeaca), ordemDoDegrau(teto), ordemDoDegrau(TETO_DO_HERDADO));
  const achado = DEGRAUS.find((d) => d.ordem === ordem);
  return achado ? achado.id : DEGRAU_DO_CHAO;
}

/* ---------------- O SELETOR, QUE É O QUE N4 VAI CONSUMIR ----------------

   Puro e determinístico: mesmo degrau, mesma lista, sempre na ordem do
   acervo. Uma intenção sem `degrauMinimo` declarado cai no chão em vez
   de sumir — esquecimento não pode apagar acervo, e a suíte é que
   cobra a declaração das 46.

   Aqui NADA decide ainda: `consultarAdversario` continua varrendo
   `INTENCOES` inteiro por `peso`. Ligar este filtro ao motor é N4. */
export function intencoesAte(degrau) {
  const meu = degrauPorId(degrau) ? degrau : DEGRAU_DO_CHAO;
  return INTENCOES.filter((i) => enxerga(meu, (i && i.degrauMinimo) || DEGRAU_DO_CHAO));
}
