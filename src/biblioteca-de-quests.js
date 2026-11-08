/* ============================================================
   A BIBLIOTECA DE QUESTS — a ficha, o catálogo e o estado de cada quest
   (08/11/2026, Fase BQ · BQ4)

   A pessoa, em 08/11: o esqueleto da história é vago. Uma campanha nova
   deixa de sortear marcos soltos («Encontrar X», «O que Y esconde») e passa
   a ESCOLHER E LIGAR QUESTS JÁ DESENHADAS, cada uma com etapas, soluções,
   consequências, reviravoltas e um fim — e o sistema sabe sempre em que
   etapa está e o que falta (mente/plano-biblioteca-de-quests.md, §2, §6 e
   §10). Este módulo é a ficha, as três primeiras quests e o juiz delas.

   A QUEST É DADO, NUNCA FUNÇÃO. É isso que deixa a suíte lê-la de volta:
   cada condição é um predicado do vocabulário fechado da BQ3
   (condicoes-da-quest.js), cada papel está declarado, cada efeito sai de
   uma tabela (EFEITOS_DA_QUEST, EFEITOS_DA_REVIRAVOLTA), e `validarQuest`
   recusa o que não bate. Os textos são modelos com {papel}: quem é o
   protegido sai da criação do mundo, e o papel passa a id UMA VEZ, quando
   a quest abre (`resolverPapeis`, a régua do livro de factos).

   OS DOIS TIPOS (TIPOS_DE_QUEST). O 1 é o enredo do lugar: tem a mão do
   vilão (`mao`, o ponto de encontro com a BQ5), falha e abandono. O 2 é o
   que acompanha o herói, a história do coração: não falha, TERMINA, num
   leque de desfechos que vai do melhor (fica tudo bem) ao pior (o
   companheiro morre). Decisão da pessoa (08/11): *«pode ter maneiras de
   sair vivo quanto maneiras de sair morto, no melhor desfecho fica tudo
   bem e no pior ele morre»* — e a planta fecha o resto: cada desfecho
   alcança-se pelo que o herói fez, NUNCA por sorteio sem causa (este
   módulo não tem sorte nenhuma), e a morte nunca é passo obrigatório: é
   consequência, e mostra o veredito antes do clique.

   O ESTADO DA QUEST É UM REGISTO PEQUENO (`abrirQuest`), que a BQ7 guarda
   no save num campo novo: as etapas feitas com o dia e o ramo, as
   escolhas, as reviravoltas que dispararam, as consequências por aplicar
   e o fim. `avancarQuest` corre uma vez por turno, DEPOIS de o livro de
   factos ser escrito (o facto do turno tem de existir antes de ser
   julgado), e devolve o registo novo; `estadoDaQuest` é a vista — concluída,
   etapa, o que falta, a reviravolta e o desfecho — para o Diário, a pauta e
   o relógio do vilão. O Narrador não fecha nada, e o Cronista também não:
   o código decide.

   `escolheu` e `etapa`, os dois predicados que a BQ3 deixou reservados,
   leem o registo daqui (passado em `contexto.quest`): quem escreve a
   escolha é `escolherNaQuest`, e quem escreve a etapa é `avancarQuest`.

   PURO E DETERMINÍSTICO. Nenhuma sorte, nenhum relógio: o dia sai do
   estado que entra por argumento, que nunca é mutado. O `null` e o lixo
   não abrem, não fecham e não lançam.
   ============================================================ */
import { validarCondicao, avaliarCondicao, julgarEtapa, resolverPapeis, PAPEIS_DA_CONDICAO } from "./condicoes-da-quest.js";
import { TIPOS_DE_LACO } from "./npcs.js";
import { SITUACOES } from "./mundo-base.js";
import { ESTRUTURAS } from "./historia.js";
import { contrair } from "./lugar.js";

/* ---------------- OS DOIS TIPOS ----------------
   `fim`: como a quest acaba — `falha` (concluída ou falhada) ou
   `desfechos` (terminada, num dos desfechos da ficha). `mao`: se a quest
   leva a mão do vilão (§11.3: o tipo 2 não é sobre ele; toca-o pela ponte). */
export const TIPOS_DE_QUEST = Object.freeze({
  1: Object.freeze({ nome: "o enredo do lugar", fim: "falha", mao: true }),
  2: Object.freeze({ nome: "o que acompanha o herói", fim: "desfechos", mao: false }),
});

/* em que ato o esqueleto (BQ6) a pode pôr */
export const QUANDO_DA_QUEST = Object.freeze(["cedo", "meio", "fim"]);

/* os estados do registo (a planta, §6) */
export const ESTADOS_DA_QUEST = Object.freeze({
  aberta: "a correr: há uma etapa por fazer",
  concluida: "o tipo 1 chegou ao fim pelas etapas",
  falhada: "o tipo 1 falhou (a falha da ficha, um ramo que entrega, ou o abandono)",
  terminada: "o tipo 2 acabou num dos seus desfechos",
});

/* ---------------- OS PAPÉIS ----------------
   `de`: de onde a criação do mundo tira quem o ocupa; `tipo`: o tipo do
   argumento nas condições (PAPEIS_DA_CONDICAO). Os outros campos de um
   papel (`exige`, `distancia`, `entre`, `vizinho`, …) são pistas para o
   esqueleto (BQ6), que é quem escolhe; aqui só se lê `alcunha`: o que a
   tela diz de alguém do vilão ANTES de o herói o ver frente a frente (o
   nome dele é uma camada da revelação, §11.4). */
export const PAPEIS_DA_QUEST = Object.freeze({
  elenco: Object.freeze({ tipo: "pessoa", diz: "gente do mundo, que a criação escolhe" }),
  fio: Object.freeze({ tipo: "pessoa", diz: "a gente do vilão — o tenente, o mandante —, que vem da espinha" }),
  grupo: Object.freeze({ tipo: "pessoa", diz: "quem anda com o herói: o companheiro, ou o elo" }),
  cidade: Object.freeze({ tipo: "lugar", diz: "uma cidade do mapa" }),
  lugar: Object.freeze({ tipo: "lugar", diz: "um sítio de uma cidade, ou da estrada" }),
  item: Object.freeze({ tipo: "item", diz: "uma coisa que a quest põe no mundo" }),
});

/* ---------------- A MÃO DO VILÃO (§11.3) ----------------
   Onde ele está numa quest do tipo 1. O esqueleto (BQ6) escolhe por este
   campo, e o relógio do plano (BQ5, plano-do-vilao.js) lê-o: `mao.tipo`
   (uma destas), `mao.contra` (os passos do plano que a quest contesta,
   de 1 a LIMITES_DA_QUEST.passosDoPlano), `mao.papel` (o papel da quest
   que é a mão dele, quando é gente) e `mao.tambem` (as outras mãos que a
   quest também é: a consequência que é também pista). */
export const MAOS_DO_VILAO = Object.freeze({
  tenente: Object.freeze({ diz: "um servo dele ocupa um papel: vencê-lo, poupá-lo ou virá-lo", pedePapel: true }),
  recurso: Object.freeze({ diz: "uma coisa de que o plano precisa: tirá-la atrasa-o", pedePapel: false }),
  consequencia: Object.freeze({ diz: "a quest existe porque um passo dele se cumpriu: o herói repara o estrago", pedePapel: false }),
  pista: Object.freeze({ diz: "dá uma camada da revelação, ou a fraqueza", pedePapel: false }),
  rosto: Object.freeze({ diz: "encontrá-lo sem lutar: uma oferta, uma ameaça, uma demonstração", pedePapel: false }),
  confronto: Object.freeze({ diz: "o fim", pedePapel: false }),
});

/* ---------------- OS LIMITES ----------------
   `etapas`: quantas uma ficha leva (as três da planta levam quatro, e a
   reviravolta pode abrir mais uma). `desfechos`: o leque do tipo 2, do
   mínimo ao máximo. `passosDoPlano`: os passos de um plano de arquétipo
   (§11.2: 6 por arquétipo — a suíte da BQ5 confere que bate com a dela).
   `reviravoltasPorTurno`: uma de cada vez, para que cada uma pese.
   `versao`: a forma do registo no save. */
export const LIMITES_DA_QUEST = Object.freeze({
  etapas: 8,
  desfechos: Object.freeze([2, 8]),
  passosDoPlano: 6,
  reviravoltasPorTurno: 1,
  versao: 1,
});

/* ---------------- OS EFEITOS ----------------
   O que uma solução, uma escolha, uma reviravolta, um fim ou um desfecho
   deixam no mundo. O módulo NÃO os aplica: junta-os no registo
   (`consequencias`), e a fiação (BQ7) aplica-os, cada um pela porta que já
   existe. `campos`: o que cada um pede — `n` (inteiro com sinal),
   `papel` (pessoa, lugar ou coisa, declarado na ficha), `laco`
   (TIPOS_DE_LACO, npcs.js), `situacao` (SITUACOES, mundo-base.js),
   `premissa` («tipo:papel», para o esqueleto) e `linha` (texto de mundo).
   `so`: onde o efeito pode estar — a morte de alguém do grupo só num
   desfecho do tipo 2, nunca numa etapa, numa escolha ou numa solução. */
const C_N = Object.freeze({ n: "inteiro" });
export const EFEITOS_DA_QUEST = Object.freeze({
  moedas: Object.freeze({ campos: C_N, diz: "a bolsa do herói ganha ou perde (o preço mostra-se antes do clique)" }),
  dia: Object.freeze({ campos: C_N, diz: "dias de estrada a mais" }),
  relogio_regional: Object.freeze({ campos: C_N, diz: "o relógio da região anda" }),
  relogio_do_fio: Object.freeze({ campos: C_N, diz: "o relógio do vilão anda" }),
  avisa_vilao: Object.freeze({ campos: Object.freeze({}), diz: "o vilão fica a saber por onde o herói anda (o livro dele, BQ5)" }),
  deixa: Object.freeze({ campos: Object.freeze({ premissa: "premissa" }), diz: "uma premissa para as quests seguintes" }),
  laco: Object.freeze({ campos: Object.freeze({ papel: "pessoa", laco: "laco" }), diz: "nasce um laço com alguém" }),
  rompe_laco: Object.freeze({ campos: Object.freeze({ papel: "pessoa" }), diz: "o laço com alguém rompe-se" }),
  afeicao: Object.freeze({ campos: Object.freeze({ papel: "pessoa", n: "inteiro" }), diz: "a confiança de alguém sobe ou desce graus" }),
  vinculo: Object.freeze({ campos: Object.freeze({ papel: "pessoa", n: "inteiro" }), diz: "o vínculo de quem anda no grupo sobe ou desce" }),
  marco: Object.freeze({ campos: Object.freeze({ papel: "pessoa" }), diz: "o vínculo passa um marco" }),
  aliado: Object.freeze({ campos: Object.freeze({ papel: "pessoa" }), diz: "alguém passa a aliado" }),
  inimigo: Object.freeze({ campos: Object.freeze({ papel: "pessoa" }), diz: "alguém passa a inimigo" }),
  situacao: Object.freeze({ campos: Object.freeze({ papel: "pessoa", situacao: "situacao" }), diz: "alguém fica livre, escondido, cativo ou ferido" }),
  favor: Object.freeze({ campos: Object.freeze({ papel: "lugar" }), diz: "um lugar fica a dever um favor ao herói" }),
  quem_e: Object.freeze({ campos: Object.freeze({ papel: "pessoa", linha: "linha" }), diz: "uma linha nova no QUEM É de alguém, até ao fim da campanha" }),
  morte: Object.freeze({ campos: Object.freeze({ papel: "pessoa" }), so: "desfecho", diz: "alguém do grupo morre — irreversível, e só como desfecho" }),
});

/* As reviravoltas mudam a própria quest (§2): `troca_papel` (quem ocupa
   um papel passa a ser outro), `abre_etapa` (uma etapa nova, antes de
   outra), `exige` (uma etapa passa a pedir mais, e as escolhas dela só
   abrem quando isso se cumpre) e `acende` (uma etapa que esperava acende
   já: o mundo não espera pela estrada). Uma reviravolta pode ainda trazer
   efeitos de EFEITOS_DA_QUEST. */
export const EFEITOS_DA_REVIRAVOLTA = Object.freeze({
  troca_papel: Object.freeze({ campos: Object.freeze(["papel", "por"]), diz: "o papel passa a ser ocupado por quem ocupa outro" }),
  abre_etapa: Object.freeze({ campos: Object.freeze(["etapa", "antes"]), diz: "uma etapa nova entra antes de outra" }),
  exige: Object.freeze({ campos: Object.freeze(["etapa", "condicao"]), diz: "a etapa passa a pedir mais, antes de tudo" }),
  acende: Object.freeze({ campos: Object.freeze(["etapa"]), diz: "a etapa acende já, sem esperar" }),
});

/* Os predicados que são ACTOS DO HERÓI: um desfecho do pior lado tem de
   ter pelo menos um, afirmado (fora de um `nenhum`) — é a prova de que
   ninguém morre sem causa. A morte de outro, o dia, a situação, a falta
   de confiança não contam: são o mundo, não o que o herói escolheu. */
export const ATOS_DO_HEROI = Object.freeze(["escolheu", "derrotou", "poupou", "conversou", "consultou", "esteve", "descobriu", "concluiu", "tem", "conheceu"]);

/* ============================================================
   O CATÁLOGO — as três quests da planta (§10)
   A voz pedida: «maravilhosas, provocantes e intensas». Provocar é pôr o
   jogador diante de uma escolha que custa, e dizer-lhe o preço antes.
   ============================================================ */
const quest = (q) => q;

const O_SALVO_CONDUTO = quest({
  id: "o_salvo_conduto",
  titulo: "O Salvo-Conduto",
  tipo: 1,
  enredo: 10,                                   // Serviço de escolta, na Grande Lista
  quando: ["cedo", "meio"],
  afim: ["jornada", "reinado"],
  papeis: {
    protegido: { de: "elenco", exige: ["vivo", "nao_e:vilao"] },
    origem: { de: "cidade", e: "a do ato" },
    destino: { de: "cidade", distancia: [2, 4] },
    passo: { de: "lugar", entre: ["origem", "destino"] },
    desvio: { de: "lugar", vizinho: "passo" },
    tenente: { de: "fio", papel: "tenente", alcunha: "a mão que guarda {passo}" },
    guarda: { de: "elenco", proximo: "protegido" },
  },
  mao: { tipo: "tenente", contra: [1, 2], papel: "tenente" },
  pede: [],
  deixa: ["aliado:protegido", "inimigo:tenente"],
  gancho: "{protegido} tem de chegar a {destino} com vida antes da lua nova, e leva na cabeça o que sabe de quem está por trás de {tenente}. Em {origem} ninguém faz a estrada ao lado de {protegido}: os dois últimos que tentaram voltaram num carro de bois, de cara para o céu.",
  etapas: [
    { id: "aceitar", texto: "Ouvir {protegido}", conclui: ["conversou", "papel:protegido"] },
    { id: "estrada", texto: "Sair de {origem} com {protegido}",
      conclui: ["todos", ["acompanha", "papel:protegido"], ["nenhum", ["esta_em", "lugar:origem"]]] },
    { id: "passo", texto: "Passar {passo}",
      conclui: ["algum",
        ["derrotou", "papel:tenente"],
        ["escolheu", "passo", "portagem"],
        ["todos", ["esta_em", "lugar:desvio"], ["acompanha", "papel:protegido"]]],
      ramos: ["violenta", "social", "furtiva"] },
    { id: "chegar", texto: "Entregar {protegido} em {destino}",
      conclui: ["todos", ["acompanha", "papel:protegido"], ["esta_em", "lugar:destino"]] },
  ],
  escolhas: {
    passo: { etapa: "passo", opcoes: {
      portagem: {
        texto: "pagar a portagem em {passo}",
        ganha: "{protegido} passa {passo} sem que ninguém tire a lâmina da bainha.",
        custa: "A bolsa fica mais leve — e quem está por trás de {tenente} fica a saber, ao fim da tarde, que estrada levas e com quem.",
        efeitos: [{ tipo: "moedas", n: -40 }, { tipo: "avisa_vilao" }, { tipo: "deixa", premissa: "avisado:tenente" }],
      },
    } },
    verdade: { etapa: "verdade", opcoes: {
      entregar: {
        texto: "entregar {protegido} a quem o procura",
        ganha: "A estrada abre-se à tua frente, e {tenente} fica a dever-te uma coisa que não vais querer cobrar.",
        custa: "{protegido} não volta a ver o sol, e tu vais lembrar-te desse último olhar por muito tempo.",
        efeitos: [{ tipo: "situacao", papel: "protegido", situacao: "cativa" }, { tipo: "avisa_vilao" }],
      },
      levar: {
        texto: "levar {protegido} até ao fim na mesma",
        ganha: "Chegas a {destino} com a palavra cumprida, e há poucas coisas que valham tanto na estrada.",
        custa: "Levas pela estrada quem roubou — e quem foi roubado não esquece quem lhe deu abrigo.",
        efeitos: [{ tipo: "deixa", premissa: "procurado:protegido" }],
      },
    } },
  },
  solucoes: {
    passo: {
      violenta: [
        { id: "poupou", quando: ["poupou", "papel:tenente"],
          texto: "{tenente} ficou de joelhos na lama de {passo}, e tu deixaste que se levantasse. Há quem pague uma dívida destas com a vida; e há quem a pague com a tua.",
          efeitos: [{ tipo: "laco", papel: "tenente", laco: "divida" }, { tipo: "deixa", premissa: "devedor:tenente" }] },
        { id: "matou",
          texto: "{tenente} ficou em {passo}, e o rio levou o resto. Longe dali, alguém vai contar os homens que lhe restam e reparar que falta um.",
          efeitos: [{ tipo: "deixa", premissa: "vinganca:tenente" }] },
      ],
      social: [
        { texto: "As moedas mudaram de mão sem uma palavra. {tenente} contou-as duas vezes, olhou {protegido} de alto a baixo, e afastou-se do caminho com um sorriso que não te agradou." },
      ],
      furtiva: [
        { texto: "O desvio custou um dia de lama e de silêncio, e {protegido} não largou o teu braço uma única vez. Ninguém vos viu passar. Ninguém, que saibas.",
          efeitos: [{ tipo: "dia", n: 1 }, { tipo: "relogio_regional", n: 1 }] },
      ],
    },
    verdade: {
      entregar: [
        { fecha: "falhada",
          texto: "Puseste {protegido} nas mãos de {tenente} à beira da estrada. Não houve gritos. Só um olhar para ti, de quem no fundo sempre soube." },
      ],
      levar: [
        { texto: "{protegido} percebe, pelo teu silêncio, que sabes. Não pede desculpa. Agradece. E a estrada continua." },
      ],
    },
  },
  reviravoltas: [
    { id: "o_guarda_vendido",
      texto: "{guarda} não olhou para trás quando saístes de {origem}. Olhou para a frente, para {passo}, e sorriu. Quem manda em {passo} comprou primeiro quem andava mais perto de {protegido} — e tu nunca lhe dirigiste uma palavra.",
      gatilho: ["todos", ["etapa", "estrada"], ["nenhum", ["etapa", "passo"]], ["nenhum", ["conversou", "papel:guarda"]]],
      efeitos: [{ tipo: "troca_papel", papel: "tenente", por: "guarda" }, { tipo: "avisa_vilao" }] },
    { id: "o_protegido_mente",
      texto: "Na terceira noite, {protegido} fala a dormir — e o que se ouve não é medo, é culpa. O que leva na cabeça não é o que sabe de {tenente}: é o que lhe roubou.",
      gatilho: ["todos", ["etapa", "aceitar"], ["nenhum", ["etapa", "chegar"]], ["conversou", "papel:protegido", 3], ["consultou", "papel:protegido", 2]],
      efeitos: [{ tipo: "abre_etapa", antes: "chegar", etapa: {
        id: "verdade", texto: "Decidir o que {protegido} merece",
        conclui: ["algum", ["escolheu", "verdade", "entregar"], ["escolheu", "verdade", "levar"]],
        ramos: ["entregar", "levar"] } }] },
  ],
  falha: [
    { quando: ["morto", "papel:protegido"],
      texto: "{protegido} não chegou a {destino}. A estrada ficou com {protegido}, e com tudo o que sabia." },
  ],
  abandono: { semAvancar: 6,
    texto: "{protegido} cansou-se de esperar por ti e fez-se à estrada sem companhia. Ninguém voltou a ver {protegido}.",
    efeitos: [{ tipo: "situacao", papel: "protegido", situacao: "escondida" }] },
  fecho: {
    texto: "{protegido} entra em {destino} com vida, com pó até aos olhos e a tremer, e aperta-te a mão como quem assina uma dívida.",
    efeitos: [{ tipo: "laco", papel: "protegido", laco: "divida" }, { tipo: "aliado", papel: "protegido" }],
  },
});

const AS_CINZAS_DE_ONTEM = quest({
  id: "as_cinzas_de_ontem",
  titulo: "As Cinzas de Ontem",
  tipo: 1,
  enredo: 26,                                   // Ruínas Recentes, com o Dobre «Como é que é?» (#15)
  quando: ["meio"],
  afim: ["misterio", "reinado"],
  papeis: {
    lugar: { de: "lugar", e: "um sítio da cidade do ato" },
    testemunha: { de: "elenco", do: "lugar" },
    suspeito: { de: "elenco", rival: "de alguém da cidade" },
    prova: { de: "item", nasce: "lugar" },
    mandante: { de: "fio", papel: "tenente", alcunha: "quem pagou o fogo" },
  },
  mao: { tipo: "consequencia", contra: [3], papel: "mandante", tambem: ["pista"] },
  pede: [],
  deixa: ["inimigo:mandante"],
  gancho: "{lugar} ardeu esta noite, com gente lá dentro. {testemunha} viu alguém sair antes das chamas e jura, a quem pergunta, que não viu nada. Na praça já se diz um nome — o de {suspeito} — e já anda uma corda à procura de pescoço.",
  etapas: [
    { id: "ver", texto: "Ver o que o fogo deixou em {lugar}", conclui: ["esteve", "lugar:lugar"] },
    { id: "marcas", texto: "Ler as marcas do fogo",
      conclui: ["pelo_menos", 2, ["descobriu", "lugar:lugar"], ["conversou", "papel:testemunha"], ["tem", "item:prova"]] },
    { id: "nome", texto: "Chegar a {suspeito} antes da corda",
      conclui: ["algum", ["conversou", "papel:suspeito"], ["derrotou", "papel:suspeito"]],
      ramos: ["ouviu", "bateu"] },
    { id: "justica", texto: "Responder ao recado",
      conclui: ["algum", ["escolheu", "justica", "guarda"], ["escolheu", "justica", "praca"], ["escolheu", "justica", "cobrar"]],
      ramos: ["guarda", "praca", "cobrar"] },
  ],
  escolhas: {
    justica: { etapa: "justica", opcoes: {
      guarda: {
        texto: "levar {prova} à guarda",
        ganha: "{suspeito} sai da corda pela porta da lei, e {lugar} fica a dever-te um favor que não esquece.",
        custa: "A guarda faz perguntas, guarda as respostas — e {mandante} fica a saber que jogas pelas regras.",
        efeitos: [{ tipo: "favor", papel: "lugar" }, { tipo: "avisa_vilao" }],
      },
      praca: {
        texto: "limpar o nome de {suspeito} na praça, à frente de todos",
        ganha: "{testemunha} volta a olhar alguém nos olhos, e a corda volta para o poço.",
        custa: "A cidade inteira fica a saber quem és. {mandante} também — e agora sabe onde dormes.",
        efeitos: [{ tipo: "afeicao", papel: "testemunha", n: 1 }, { tipo: "avisa_vilao" }],
      },
      cobrar: {
        texto: "responder ao recado à tua maneira",
        ganha: "{mandante} aprende que um recado destes tem resposta, e que a resposta tem o teu nome.",
        custa: "A lei de {lugar} deixa de te cobrir. E quem cobra pela própria mão fica a dever ao próximo que o fizer.",
        efeitos: [{ tipo: "inimigo", papel: "mandante" }, { tipo: "deixa", premissa: "cobranca:mandante" }],
      },
    } },
  },
  solucoes: {
    nome: {
      ouviu: [
        { texto: "{suspeito} jura pela mãe que estava noutra cama nessa noite — e {testemunha}, do fundo da sala, baixa os olhos: sabe muito bem que cama era." },
      ],
      bateu: [
        { texto: "Bateste em quem não tinha culpa até lhe arrancares o que não sabia. {testemunha} viu tudo da porta, e não te vai perdoar.",
          efeitos: [{ tipo: "rompe_laco", papel: "testemunha" }, { tipo: "afeicao", papel: "testemunha", n: -1 }] },
      ],
    },
    justica: {
      guarda: [{ texto: "O capitão da guarda pesa a prova na mão, olha para ti mais tempo do que devia, e assina." }],
      praca: [{ texto: "Disseste-o alto, no meio da praça, com a prova erguida. Houve quem cuspisse no chão. Houve quem tirasse o chapéu." }],
      cobrar: [{ texto: "Não disseste nada a ninguém. Na manhã seguinte, à porta de quem paga a {mandante}, havia cinza fresca. Recado recebido." }],
    },
  },
  reviravoltas: [
    { id: "o_recado",
      texto: "As marcas não mentem: a porta de {lugar} foi trancada por fora, e no ferrolho há um sinal que não é de ofício nenhum desta cidade. {suspeito} não pôs fogo a nada. Quem o pôs queria que tu viesses ver — e tu vieste.",
      gatilho: ["etapa", "marcas"],
      efeitos: [{ tipo: "exige", etapa: "justica", condicao: ["conheceu", "papel:mandante"] }, { tipo: "relogio_do_fio", n: 1 }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:suspeito"], ["nenhum", ["derrotou", "papel:suspeito"]]], ate: "nome",
      texto: "Enforcaram {suspeito} na praça antes de alguém lhe dar ouvidos. O fogo fica sem dono, e quem o pôs dorme descansado." },
  ],
  abandono: { semAvancar: 6,
    texto: "O rasto esfriou com as cinzas. {suspeito} desapareceu de {lugar} numa noite sem lua, sem que ninguém visse a partida.",
    efeitos: [{ tipo: "situacao", papel: "suspeito", situacao: "escondida" }] },
  fecho: {
    texto: "O que ardeu não volta. Mas agora tens um nome para o fogo, e o fogo tem o teu.",
    efeitos: [{ tipo: "deixa", premissa: "inimigo:mandante" }],
  },
});

const A_CARTA_QUE_NAO_SE_ABRE = quest({
  id: "a_carta_que_nao_se_abre",
  titulo: "A Carta Que Não Se Abre",
  tipo: 2,
  quando: ["cedo", "meio", "fim"],
  afim: [],
  papeis: {
    quem: { de: "grupo", ou: "elo" },
    ferido: { de: "elenco", cidade: "uma cidade dos atos 2 ou 3" },
    carta: { de: "item", nasce: "quem" },
  },
  mao: null,
  ponte: "{ferido} mora numa cidade por onde um passo do vilão vai passar",
  pede: [],
  deixa: [],
  gancho: "{quem} carrega uma carta que nunca abriu. O lacre está gasto de tanto o polegar lhe passar por cima. É de {ferido}, alguém a quem {quem} falhou há muitos anos — e {quem} só diz que há coisas que não se leem duas vezes, e esta nem uma.",
  etapas: [
    { id: "sinal", texto: "Perguntar a {quem} pela carta",
      espera: 3, acende: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 1]],
      conclui: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 2], ["conversou", "papel:quem", 3]] },
    { id: "carta", texto: "Decidir o que fazer com a carta",
      conclui: ["algum", ["escolheu", "carta", "abrir"], ["escolheu", "carta", "guardar"], ["escolheu", "carta", "queimar"]],
      ramos: ["abrir", "guardar", "queimar"] },
    { id: "nome", texto: "Encontrar {ferido}",
      ancora: { tipo: 1, concluidas: 1 },
      conclui: ["todos", ["conheceu", "papel:ferido"], ["conversou", "papel:ferido"]] },
    { id: "frente", texto: "Pôr {quem} e {ferido} frente a frente",
      conclui: ["todos", ["acompanha", "papel:quem"], ["conversou", "papel:ferido", 2],
        ["algum", ["escolheu", "frente", "interpor"], ["escolheu", "frente", "pagar"], ["escolheu", "frente", "deixar"]]] },
  ],
  escolhas: {
    carta: { etapa: "carta", opcoes: {
      abrir: {
        texto: "abrir a carta com {quem}",
        ganha: "Ficas a saber o que {ferido} escreveu, e {quem} deixa de carregar isto sem ninguém.",
        custa: "O que está escrito não se desescreve. E {quem} vai ter de o ouvir da tua voz.",
        efeitos: [],
      },
      guardar: {
        texto: "devolver a carta fechada",
        ganha: "{quem} percebe que há respeito nisto: não lhe arrancas o que não quer dar.",
        custa: "A carta continua a pesar no bolso dele, e o que diz continua a ser só de {ferido}.",
        efeitos: [],
      },
      queimar: {
        texto: "queimar a carta",
        ganha: "{quem} dorme esta noite, pela primeira vez em anos, a noite inteira.",
        custa: "Ninguém vai saber o que lá estava. Nem {quem}, nem tu — e se um dia for preciso, já não há.",
        efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }],
      },
    } },
    frente: { etapa: "frente", opcoes: {
      interpor: {
        texto: "pôr-te entre os dois",
        ganha: "Ninguém puxa de uma lâmina enquanto estiveres no meio.",
        custa: "{ferido} passa a odiar-te um bocadinho também, por lhe roubares a conta.",
        efeitos: [],
      },
      pagar: {
        texto: "pagar a dívida de {quem}",
        ganha: "{ferido} aceita de ti o que {quem} nunca lhe pôde dar.",
        custa: "O preço sai da tua bolsa — e {quem} vai saber, até ao fim, que foi o teu dinheiro e não o dele.",
        efeitos: [{ tipo: "moedas", n: -60 }],
      },
      deixar: {
        texto: "deixá-los acertar contas à maneira antiga",
        ganha: "A conta é deles, e tu não lha roubas.",
        custa: "À maneira antiga, só um costuma ir-se embora a andar. E se {quem} não tiver por que viver, não volta.",
        efeitos: [],
      },
    } },
  },
  solucoes: {
    carta: {
      abrir: [{ texto: "Lês em voz baixa, à luz do fogo. {quem} não te deixa chegar ao fim: tira-te a carta da mão a meio de uma frase e fica a olhar para as brasas." }],
      guardar: [{ texto: "Devolves-lhe a carta fechada. {quem} guarda-a junto ao peito e, por um momento, quase te diz alguma coisa." }],
      queimar: [{ texto: "O lacre derrete primeiro. {quem} vê o papel enrolar-se no fogo e não diz nada — mas respira como quem pousa um saco muito pesado." }],
    },
  },
  reviravoltas: [
    { id: "o_fogo_primeiro",
      texto: "Chega a notícia antes de vós: a casa de {ferido} ardeu, e {ferido} está entre a febre e a cinza. A estrada pode esperar. {ferido} talvez não.",
      gatilho: ["todos", ["etapa", "carta"], ["nenhum", ["etapa", "nome"]], ["situacao", "papel:ferido", "ferida"]],
      efeitos: [{ tipo: "acende", etapa: "nome" }] },
  ],
  desfechos: [
    { id: "perdao",
      quando: ["todos", ["escolheu", "carta", "abrir"], ["afeicao", "papel:quem", 3], ["algum", ["escolheu", "frente", "interpor"], ["escolheu", "frente", "pagar"]]],
      texto: "A carta dizia, desde o princípio, que {ferido} já tinha perdoado. Faltava só {quem} ouvi-lo da boca dele. Choram os dois como quem já não sabe como se faz, e {quem} volta para o teu lado com um peso a menos que se vê de longe.",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "ferido" }] },
    { id: "a_divida_paga",
      quando: ["algum", ["escolheu", "frente", "interpor"], ["escolheu", "frente", "pagar"]],
      texto: "Não há abraço. Há um aceno, e uma conta que se fecha. {ferido} vira costas primeiro; {quem} fica a vê-lo até dobrar a esquina, e depois diz o teu nome como quem agradece.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 10 }] },
    { id: "a_cicatriz",
      quando: ["todos", ["escolheu", "frente", "deixar"], ["nenhum", ["escolheu", "carta", "queimar"]], ["afeicao", "papel:quem", 2]],
      texto: "Acertaram à maneira antiga. {quem} volta com um corte que vai fechar torto, e {ferido} fica no pó, com vida e de olhos abertos para o céu. Nenhum dos dois ganhou. Os dois pararam.",
      efeitos: [{ tipo: "situacao", papel: "ferido", situacao: "ferida" }, { tipo: "quem_e", papel: "quem", linha: "traz uma cicatriz que não deixa ninguém tocar" }] },
    { id: "a_ferida_fica", padrao: true,
      texto: "{quem} não volta a falar da carta. Continua ao teu lado, mais calado, e às vezes, junto ao fogo, passa o polegar pelo lacre como quem reza.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "quem_e", papel: "quem", linha: "carrega uma carta que não abriu, e já não fala dela" }] },
    { id: "tarde_demais", cedo: true,
      quando: ["todos", ["morto", "papel:ferido"], ["nenhum", ["etapa", "frente"]]],
      texto: "{ferido} morreu antes de vos ver. {quem} fica com a carta e com o silêncio, e o silêncio pesa mais.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "carrega a carta de um morto" }] },
    { id: "a_carta_fechada", cedo: true,
      quando: ["morto", "papel:quem"],
      texto: "{quem} levou a carta fechada para a cova. Ficaste tu com ela. O lacre continua inteiro, e agora és tu quem não sabe se a deve abrir.",
      efeitos: [] },
    { id: "o_preco_inteiro",
      quando: ["todos", ["escolheu", "frente", "deixar"], ["algum", ["escolheu", "carta", "queimar"], ["nenhum", ["afeicao", "papel:quem", 2]]]],
      texto: "Acertaram à maneira antiga, e {quem} deixou-se acertar. Não ergueu a lâmina a tempo — talvez nem quisesse. {ferido} fica de pé sobre o corpo sem saber o que fazer às mãos, e tu percebes, tarde, que a dívida nunca foi de sangue.",
      efeitos: [{ tipo: "morte", papel: "quem" }] },
  ],
  abandono: { semAvancar: 15, desfecho: "a_ferida_fica" },
});

const congelarFundo = (o) => {
  if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(congelarFundo); }
  return o;
};
export const BIBLIOTECA_DE_QUESTS = congelarFundo([O_SALVO_CONDUTO, AS_CINZAS_DE_ONTEM, A_CARTA_QUE_NAO_SE_ABRE]);

export function questPorId(id) {
  return typeof id === "string" ? BIBLIOTECA_DE_QUESTS.find((q) => q.id === id) || null : null;
}

/* ---------------- utilidades ---------------- */
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const inteiro = (v) => (typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : null);
const RX_ID = /^[a-z0-9_]{1,40}$/;
const RX_PREMISSA = /^[a-z_]{1,24}:[a-z0-9_]{1,40}$/;
const PREFIXO_DO_TIPO = Object.freeze({ pessoa: "papel", lugar: "lugar", item: "item" });
const LACOS = TIPOS_DE_LACO.map((l) => l.id);
const SITS = Object.values(SITUACOES);
const ESPINHAS = ESTRUTURAS.filter((e) => e.espinha).map((e) => e.id);
const fichaDe = (f) => (typeof f === "string" ? questPorId(f) : obj(f));

/* os átomos de uma condição, com o lado: `nenhum` vira o lado */
function atomos(cond, positivo = true, out = []) {
  if (!Array.isArray(cond) || typeof cond[0] !== "string") return out;
  const nome = cond[0];
  if (nome === "todos" || nome === "algum") cond.slice(1).forEach((c) => atomos(c, positivo, out));
  else if (nome === "pelo_menos") cond.slice(2).forEach((c) => atomos(c, positivo, out));
  else if (nome === "nenhum") cond.slice(1).forEach((c) => atomos(c, !positivo, out));
  else out.push({ cond, positivo });
  return out;
}

/* ============================================================
   VALIDAR — validarQuest(ficha) → { ok, erros }
   A ficha inteira contra as tabelas: os papéis, cada condição contra o
   vocabulário e os papéis declarados, cada `escolheu` contra as escolhas
   da ficha, cada `etapa` contra as etapas, cada efeito contra a tabela,
   cada texto contra os papéis. E as leis da pessoa: a morte nunca é passo
   (nenhum `morto` afirmado numa etapa), a morte de alguém do grupo só num
   desfecho, o tipo 2 vai do melhor ao pior e o pior tem causa.
   ============================================================ */
/* só a ficha congelada (a do catálogo) se guarda: não muda, e são poucas;
   a cópia de uma suíte valida-se sempre de novo */
const cacheValidacao = new Map();
export function validarQuest(ficha) {
  const F = obj(ficha);
  if (!F) return { ok: false, erros: ["a ficha não é um objeto"] };
  if (cacheValidacao.has(F)) return cacheValidacao.get(F);
  const erros = [];
  const err = (s) => erros.push(`${typeof F.id === "string" ? F.id : "?"}: ${s}`);
  if (typeof F.id !== "string" || !RX_ID.test(F.id)) err("o id não é [a-z0-9_]");
  if (typeof F.titulo !== "string" || !F.titulo.trim()) err("sem título");
  const T = TIPOS_DE_QUEST[F.tipo];
  if (!T) err("o tipo não é 1 nem 2");
  if (!arr(F.quando).length || !arr(F.quando).every((q) => QUANDO_DA_QUEST.includes(q))) err("o «quando» não bate com QUANDO_DA_QUEST");
  if (!Array.isArray(F.afim) || !F.afim.every((a) => ESPINHAS.includes(a))) err("o «afim» tem uma espinha que não existe");

  /* os papéis */
  const decl = {};
  const papeis = obj(F.papeis) || {};
  for (const [nome, p] of Object.entries(papeis)) {
    const d = obj(p) && PAPEIS_DA_QUEST[p.de];
    if (!RX_ID.test(nome)) err(`o papel «${nome}» não é [a-z0-9_]`);
    if (!d) { err(`o papel «${nome}» não diz de onde vem (PAPEIS_DA_QUEST)`); continue; }
    decl[nome] = { tipo: d.tipo };
    if (p.alcunha !== undefined && typeof p.alcunha !== "string") err(`a alcunha de «${nome}» não é texto`);
  }
  if (!Object.keys(decl).length) err("sem papéis");

  /* as etapas — as da ficha e as que uma reviravolta abre */
  const base = arr(F.etapas);
  const abertas = arr(F.reviravoltas).flatMap((r) => arr(obj(r) && r.efeitos)).filter((e) => obj(e) && e.tipo === "abre_etapa").map((e) => obj(e.etapa)).filter(Boolean);
  const todas = [...base, ...abertas];
  const idsEtapa = todas.map((e) => obj(e) && e.id);
  if (!base.length || base.length > LIMITES_DA_QUEST.etapas) err(`as etapas têm de ser de 1 a ${LIMITES_DA_QUEST.etapas}`);
  if (new Set(idsEtapa).size !== idsEtapa.length || !idsEtapa.every((x) => typeof x === "string" && RX_ID.test(x))) err("os ids das etapas repetem-se ou são tortos");
  const escolhas = obj(F.escolhas) || {};

  const textos = [];
  const verCond = (c, onde) => {
    const v = validarCondicao(c, decl);
    if (!v.ok) v.erros.forEach((e) => err(`${onde}: ${e}`));
    for (const { cond } of atomos(c)) {
      if (cond[0] === "etapa" && !idsEtapa.includes(cond[1])) err(`${onde}: a etapa «${cond[1]}» não existe`);
      if (cond[0] === "escolheu") {
        const e = obj(escolhas[cond[1]]);
        if (!e || !obj(obj(e.opcoes) && e.opcoes[cond[2]])) err(`${onde}: a escolha «${cond[1]}: ${cond[2]}» não está na ficha`);
      }
    }
  };
  const verEfeitos = (efs, onde, podeMorte) => {
    if (efs === undefined) return;
    if (!Array.isArray(efs)) { err(`${onde}: os efeitos não são uma lista`); return; }
    efs.forEach((e, i) => {
      const def = obj(e) && EFEITOS_DA_QUEST[e.tipo];
      if (!def) { err(`${onde}[${i}]: o efeito «${obj(e) ? e.tipo : e}» não está em EFEITOS_DA_QUEST`); return; }
      if (def.so === "desfecho" && !podeMorte) err(`${onde}[${i}]: «${e.tipo}» só pode estar num desfecho do tipo 2`);
      for (const [campo, tipo] of Object.entries(def.campos)) {
        const v = e[campo];
        if (tipo === "inteiro" && !Number.isInteger(v)) err(`${onde}[${i}]: ${e.tipo} pede um inteiro em «${campo}»`);
        if (["pessoa", "lugar", "item"].includes(tipo) && !(decl[v] && decl[v].tipo === tipo)) err(`${onde}[${i}]: ${e.tipo} pede um papel ${tipo} declarado em «${campo}»`);
        if (tipo === "laco" && !LACOS.includes(v)) err(`${onde}[${i}]: o laço «${v}» não está em TIPOS_DE_LACO`);
        if (tipo === "situacao" && !SITS.includes(v)) err(`${onde}[${i}]: a situação «${v}» não existe`);
        if (tipo === "premissa" && !(typeof v === "string" && RX_PREMISSA.test(v) && decl[v.split(":")[1]])) err(`${onde}[${i}]: a premissa «${v}» não é «tipo:papel declarado»`);
        if (tipo === "linha") { if (typeof v !== "string" || !v.trim()) err(`${onde}[${i}]: a linha está vazia`); else textos.push([v, `${onde}[${i}]`]); }
      }
      if (e.tipo === "morte" && !(papeis[e.papel] && papeis[e.papel].de === "grupo")) err(`${onde}[${i}]: a morte é de alguém do grupo`);
    });
  };

  todas.forEach((e, i) => {
    const onde = `etapa ${obj(e) ? e.id : i}`;
    if (!obj(e)) { err(`${onde}: não é um objeto`); return; }
    if (typeof e.texto !== "string" || !e.texto.trim()) err(`${onde}: sem texto`); else textos.push([e.texto, onde]);
    verCond(e.conclui, `${onde}.conclui`);
    if (e.acende !== undefined) verCond(e.acende, `${onde}.acende`);
    if (e.espera !== undefined && !(Number.isInteger(e.espera) && e.espera >= 0)) err(`${onde}: a espera é um inteiro ≥ 0`);
    if (e.ancora !== undefined && !(obj(e.ancora) && TIPOS_DE_QUEST[e.ancora.tipo] && Number.isInteger(e.ancora.concluidas) && e.ancora.concluidas >= 1)) err(`${onde}: a âncora é { tipo, concluidas ≥ 1 }`);
    if (e.ramos !== undefined) {
      const ok = Array.isArray(e.conclui) && e.conclui[0] === "algum" && Array.isArray(e.ramos) && e.ramos.length === e.conclui.length - 1
        && e.ramos.every((r) => typeof r === "string" && RX_ID.test(r)) && new Set(e.ramos).size === e.ramos.length;
      if (!ok) err(`${onde}: os ramos nomeiam, um a um, os ramos de um «algum»`);
    }
    /* A MORTE NUNCA É PASSO (a pessoa, 08/11): nenhum `morto` afirmado */
    if (atomos(e.conclui).some((a) => a.positivo && a.cond[0] === "morto")) err(`${onde}: a morte de alguém não pode ser passo de uma quest`);
  });

  /* as escolhas: cada uma numa etapa, cada opção com os dois lados */
  for (const [k, e] of Object.entries(escolhas)) {
    if (!RX_ID.test(k) || !obj(e)) { err(`a escolha «${k}» é torta`); continue; }
    if (!idsEtapa.includes(e.etapa)) err(`a escolha «${k}» não está numa etapa`);
    const ops = obj(e.opcoes) || {};
    if (!Object.keys(ops).length) err(`a escolha «${k}» não tem opções`);
    for (const [op, o] of Object.entries(ops)) {
      const onde = `escolha ${k}:${op}`;
      if (!RX_ID.test(op) || !obj(o)) { err(`${onde}: torta`); continue; }
      for (const lado of ["texto", "ganha", "custa"]) {
        if (typeof o[lado] !== "string" || !o[lado].trim()) err(`${onde}: falta «${lado}» (o veredito diz os dois lados)`); else textos.push([o[lado], onde]);
      }
      verEfeitos(o.efeitos, `${onde}.efeitos`, false);
      const usada = todas.some((et) => obj(et) && atomos(et.conclui).some((a) => a.cond[0] === "escolheu" && a.cond[1] === k && a.cond[2] === op));
      if (!usada) err(`${onde}: nenhuma etapa a lê`);
    }
  }

  /* as soluções: por etapa com ramos, por ramo, uma lista de variantes */
  for (const [et, porRamo] of Object.entries(obj(F.solucoes) || {})) {
    const etapa = todas.find((x) => obj(x) && x.id === et);
    if (!etapa || !Array.isArray(etapa.ramos)) { err(`as soluções de «${et}» não têm etapa com ramos`); continue; }
    for (const [ramo, vs] of Object.entries(obj(porRamo) || {})) {
      if (!etapa.ramos.includes(ramo)) err(`a solução «${et}:${ramo}» não é ramo da etapa`);
      if (!Array.isArray(vs) || !vs.length) { err(`a solução «${et}:${ramo}» não tem variantes`); continue; }
      vs.forEach((v, i) => {
        const onde = `solução ${et}:${ramo}[${i}]`;
        if (!obj(v) || typeof v.texto !== "string" || !v.texto.trim()) { err(`${onde}: sem texto`); return; }
        textos.push([v.texto, onde]);
        if (v.quando !== undefined) verCond(v.quando, `${onde}.quando`);
        if (v.fecha !== undefined && !["concluida", "falhada"].includes(v.fecha)) err(`${onde}: «fecha» é concluida ou falhada`);
        if (v.fecha !== undefined && F.tipo !== 1) err(`${onde}: só o tipo 1 fecha por um ramo`);
        verEfeitos(v.efeitos, `${onde}.efeitos`, false);
      });
      if (vs.slice(0, -1).some((v) => obj(v) && v.quando === undefined)) err(`a solução «${et}:${ramo}»: só a última variante pode não ter «quando»`);
    }
  }

  /* as reviravoltas */
  const idsRev = [];
  arr(F.reviravoltas).forEach((r, i) => {
    const onde = `reviravolta ${obj(r) ? r.id : i}`;
    if (!obj(r) || typeof r.id !== "string" || !RX_ID.test(r.id)) { err(`${onde}: torta`); return; }
    idsRev.push(r.id);
    if (typeof r.texto !== "string" || !r.texto.trim()) err(`${onde}: sem texto`); else textos.push([r.texto, onde]);
    verCond(r.gatilho, `${onde}.gatilho`);
    const efs = arr(r.efeitos);
    if (!efs.length) err(`${onde}: sem efeito`);
    efs.forEach((e, j) => {
      const o = `${onde}.efeitos[${j}]`;
      if (!obj(e)) { err(`${o}: torto`); return; }
      if (!EFEITOS_DA_REVIRAVOLTA[e.tipo]) { verEfeitos([e], o, false); return; }
      if (e.tipo === "troca_papel" && !(decl[e.papel] && decl[e.por] && decl[e.papel].tipo === decl[e.por].tipo)) err(`${o}: troca entre papéis declarados do mesmo tipo`);
      if (e.tipo === "abre_etapa" && !base.some((x) => obj(x) && x.id === e.antes)) err(`${o}: «antes» não é uma etapa da ficha`);
      if (e.tipo === "exige") {
        if (!idsEtapa.includes(e.etapa)) err(`${o}: a etapa «${e.etapa}» não existe`);
        verCond(e.condicao, `${o}.condicao`);
        if (atomos(e.condicao).some((a) => a.positivo && a.cond[0] === "morto")) err(`${o}: a morte de alguém não pode ser passo de uma quest`);
      }
      if (e.tipo === "acende" && !idsEtapa.includes(e.etapa)) err(`${o}: a etapa «${e.etapa}» não existe`);
    });
  });
  if (new Set(idsRev).size !== idsRev.length) err("os ids das reviravoltas repetem-se");

  /* o fim, pelo tipo */
  const ab = obj(F.abandono);
  if (!ab || !Number.isInteger(ab.semAvancar) || ab.semAvancar < 1) err("o abandono pede «semAvancar» ≥ 1");
  if (F.tipo === 1) {
    const m = obj(F.mao);
    if (!m || !MAOS_DO_VILAO[m.tipo]) err("o tipo 1 tem a mão do vilão (MAOS_DO_VILAO)");
    else {
      if (!arr(m.contra).length || !m.contra.every((p) => Number.isInteger(p) && p >= 1 && p <= LIMITES_DA_QUEST.passosDoPlano)) err(`a mão contesta passos de 1 a ${LIMITES_DA_QUEST.passosDoPlano}`);
      if (m.papel !== undefined && !(papeis[m.papel] && papeis[m.papel].de === "fio")) err("a mão é um papel do fio");
      if (MAOS_DO_VILAO[m.tipo].pedePapel && m.papel === undefined) err(`a mão «${m.tipo}» pede o papel`);
      if (m.tambem !== undefined && !(Array.isArray(m.tambem) && m.tambem.every((t) => MAOS_DO_VILAO[t] && t !== m.tipo))) err("o «tambem» da mão tem tipos que não existem");
    }
    const fs = arr(F.falha);
    if (!fs.length) err("o tipo 1 tem falha");
    fs.forEach((f, i) => {
      const onde = `falha ${i}`;
      if (!obj(f)) { err(`${onde}: torta`); return; }
      verCond(f.quando, `${onde}.quando`);
      if (f.ate !== undefined && !idsEtapa.includes(f.ate)) err(`${onde}: «ate» não é uma etapa`);
      if (typeof f.texto !== "string" || !f.texto.trim()) err(`${onde}: sem texto`); else textos.push([f.texto, onde]);
      verEfeitos(f.efeitos, `${onde}.efeitos`, false);
    });
    if (ab) { if (typeof ab.texto !== "string" || !ab.texto.trim()) err("o abandono sem texto"); else textos.push([ab.texto, "abandono"]); verEfeitos(ab.efeitos, "abandono.efeitos", false); }
    const fe = obj(F.fecho);
    if (!fe || typeof fe.texto !== "string") err("o tipo 1 tem fecho"); else { textos.push([fe.texto, "fecho"]); verEfeitos(fe.efeitos, "fecho.efeitos", false); }
    if (F.desfechos !== undefined) err("o tipo 1 não tem desfechos: falha ou conclui");
  }
  if (F.tipo === 2) {
    if (F.mao !== null) err("o tipo 2 não é sobre o vilão: mao null");
    if (F.falha !== undefined) err("o tipo 2 não falha: termina");
    if (typeof F.ponte !== "string" || !F.ponte.trim()) err("o tipo 2 toca o vilão pela ponte"); else textos.push([F.ponte, "ponte"]);
    const ds = arr(F.desfechos);
    const [dmin, dmax] = LIMITES_DA_QUEST.desfechos;
    if (ds.length < dmin || ds.length > dmax) err(`os desfechos são de ${dmin} a ${dmax}`);
    const ids = ds.map((d) => obj(d) && d.id);
    if (new Set(ids).size !== ids.length || !ids.every((x) => typeof x === "string" && RX_ID.test(x))) err("os ids dos desfechos repetem-se ou são tortos");
    const padroes = ds.filter((d) => obj(d) && d.padrao === true);
    if (padroes.length !== 1) err("o tipo 2 tem um desfecho padrão, e só um (o da história ignorada)");
    ds.forEach((d, i) => {
      const onde = `desfecho ${obj(d) ? d.id : i}`;
      if (!obj(d)) return;
      if (typeof d.texto !== "string" || !d.texto.trim()) err(`${onde}: sem texto`); else textos.push([d.texto, onde]);
      verEfeitos(d.efeitos, `${onde}.efeitos`, true);
      if (d.padrao === true) { if (d.quando !== undefined) err(`${onde}: o padrão não tem «quando»`); return; }
      verCond(d.quando, `${onde}.quando`);
      /* NUNCA POR SORTEIO SEM CAUSA: todo desfecho que não é o padrão
         alcança-se por um facto afirmado */
      if (!atomos(d.quando).some((a) => a.positivo)) err(`${onde}: alcança-se sem nenhum facto`);
    });
    const melhor = obj(ds[0]), pior = obj(ds[ds.length - 1]);
    if (melhor && (melhor.padrao || melhor.cedo || arr(melhor.efeitos).some((e) => e.tipo === "morte" || (Number.isInteger(e.n) && e.n < 0)))) err("o primeiro desfecho é o melhor: sem morte nem perda");
    if (pior && !arr(pior.efeitos).some((e) => e.tipo === "morte")) err("o último desfecho é o pior: alguém do grupo morre");
    if (pior && !atomos(pior.quando).some((a) => a.positivo && ATOS_DO_HEROI.includes(a.cond[0]))) err("o pior desfecho tem causa: um acto do herói, afirmado");
    if (ab && !(padroes[0] && ab.desfecho === padroes[0].id)) err("o abandono do tipo 2 acaba no desfecho padrão");
  }

  /* os papéis citados nos textos existem */
  if (typeof F.gancho !== "string" || !F.gancho.trim()) err("sem gancho"); else textos.push([F.gancho, "gancho"]);
  for (const [nome, p] of Object.entries(papeis)) if (obj(p) && typeof p.alcunha === "string") textos.push([p.alcunha, `alcunha de ${nome}`]);
  for (const [s, onde] of textos) {
    for (const m of s.matchAll(/\{([^}]*)\}/g)) if (!decl[m[1]]) err(`${onde}: o texto cita «{${m[1]}}», que não é papel`);
  }
  for (const p of [...arr(F.deixa), ...arr(F.pede)]) if (!(typeof p === "string" && RX_PREMISSA.test(p))) err(`a premissa «${p}» é torta`);

  const r = { ok: erros.length === 0, erros };
  if (Object.isFrozen(F)) cacheValidacao.set(F, r);
  return r;
}

/* ============================================================
   O REGISTO — a forma no save, e como se lê
   ============================================================ */
function garantirRegisto(r, F) {
  const R = obj(r);
  if (!R || !F || R.id !== F.id) return null;
  return {
    v: LIMITES_DA_QUEST.versao,
    id: F.id,
    tipo: F.tipo,
    inicio: inteiro(R.inicio) ?? 0,
    ultimoAvanco: inteiro(R.ultimoAvanco) ?? inteiro(R.inicio) ?? 0,
    papeis: obj(R.papeis) || {},
    feitas: obj(R.feitas) || {},
    escolhas: obj(R.escolhas) || {},
    acesas: obj(R.acesas) || {},
    reviravoltas: arr(R.reviravoltas).filter((x) => obj(x) && typeof x.id === "string"),
    consequencias: arr(R.consequencias).filter(obj),
    estado: ESTADOS_DA_QUEST[R.estado] ? R.estado : "aberta",
    motivo: typeof R.motivo === "string" ? R.motivo : null,
    desfecho: typeof R.desfecho === "string" ? R.desfecho : null,
    fecho: obj(R.fecho),
    fechouEm: inteiro(R.fechouEm),
  };
}
const diaDe = (E) => Math.max(0, inteiro(obj(E) && E.dia) || 0);

/* as etapas como estão agora: as da ficha, mais as que uma reviravolta
   abriu (antes da que diz), cada uma com o que uma reviravolta lhe exige */
function etapasDe(F, R) {
  let lista = arr(F.etapas).map((e) => ({ ...e, exige: [] }));
  for (const { id } of R.reviravoltas) {
    const rv = arr(F.reviravoltas).find((x) => x.id === id);
    if (!rv) continue;
    for (const ef of arr(rv.efeitos)) {
      if (ef.tipo === "abre_etapa" && !lista.some((e) => e.id === ef.etapa.id)) {
        const i = lista.findIndex((e) => e.id === ef.antes);
        const nova = { ...ef.etapa, exige: [] };
        lista = i < 0 ? [...lista, nova] : [...lista.slice(0, i), nova, ...lista.slice(i)];
      }
      if (ef.tipo === "exige") lista = lista.map((e) => (e.id === ef.etapa ? { ...e, exige: [...e.exige, ef.condicao] } : e));
    }
  }
  return lista;
}
const etapaAtual = (lista, R) => lista.find((e) => !R.feitas[e.id]) || null;

/* o texto de mundo, com o nome de cada papel; quem não tem nome é
   «alguém», «um lugar», «uma coisa» (nunca o nome do papel) */
function encher(modelo, nomes) {
  return contrair(String(modelo || "").replace(/\{([a-z0-9_]+)\}/g, (m, k) => (nomes[k] != null ? nomes[k] : m)));
}
const maiuscula = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
/* a frase inteira: o nome que entra no começo de uma frase («a mão que
   guarda o Vau») ganha a maiúscula que o modelo não lhe pode dar */
const frase = (modelo, nomes) => encher(modelo, nomes).replace(/(^|[.!?…]\s+)(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase());
const minuscula = (s) => (s ? s[0].toLowerCase() + s.slice(1) : s);

/* os papéis como as condições e os textos os veem: o id fica sempre (a
   leitura é por id); o nome de quem é do vilão e tem alcunha só aparece
   depois de o herói o ver frente a frente — antes, a alcunha */
function vistaDosPapeis(F, R, E, mundo) {
  const decl = obj(F.papeis) || {};
  const crus = {};
  for (const nome of Object.keys(decl)) {
    const p = obj(R.papeis[nome]) || {};
    const tipo = PAPEIS_DA_QUEST[decl[nome].de].tipo;
    crus[nome] = { ...p, tipo, nome: typeof p.nome === "string" ? p.nome : "" };
  }
  const nomes = {};
  for (const nome of Object.keys(decl)) {
    const p = crus[nome];
    nomes[nome] = p.nome || PAPEIS_DA_CONDICAO[PREFIXO_DO_TIPO[p.tipo]].semNome;
  }
  const vistos = { ...crus };
  for (const nome of Object.keys(decl)) {
    const al = decl[nome].alcunha;
    if (typeof al !== "string" || !crus[nome].id) continue;
    const viu = avaliarCondicao(["conheceu", `papel:${nome}`], { estado: E, papeis: { [nome]: crus[nome] }, mundo });
    if (!viu) { nomes[nome] = encher(al, nomes); vistos[nome] = { ...crus[nome], nome: nomes[nome] }; }
  }
  return { papeis: vistos, nomes };
}

/* o contexto das condições: o estado, os papéis, e o registo da quest
   (as etapas feitas, as escolhas e as frases de mundo delas) */
function contextoDe(F, R, E, mundo) {
  const { papeis, nomes } = vistaDosPapeis(F, R, E, mundo);
  const rotulos = {};
  for (const [k, e] of Object.entries(obj(F.escolhas) || {})) {
    for (const [op, o] of Object.entries(obj(e.opcoes) || {})) rotulos[`${k}:${op}`] = encher(o.texto, nomes);
  }
  for (const e of etapasDe(F, R)) rotulos[`etapa:${e.id}`] = minuscula(encher(e.texto, nomes));
  const escolhas = {};
  for (const [k, v] of Object.entries(R.escolhas)) if (obj(v) && typeof v.opcao === "string") escolhas[k] = v.opcao;
  const feitas = {};
  for (const k of Object.keys(R.feitas)) if (R.feitas[k]) feitas[k] = true;
  return { estado: E, mundo, papeis, nomes, quest: { feitas, escolhas, rotulos } };
}

function estaAcesa(etapa, R, ctx, dia, outras) {
  if (R.acesas[etapa.id] != null) return true;
  if (Number.isInteger(etapa.espera) && dia - R.inicio < etapa.espera) return false;
  if (etapa.acende && !avaliarCondicao(etapa.acende, ctx)) return false;
  if (etapa.ancora) {
    const n = arr(outras).filter((q) => obj(q) && q.tipo === etapa.ancora.tipo && q.estado === "concluida").length;
    if (n < etapa.ancora.concluidas) return false;
  }
  return true;
}

/* o ramo do «algum» que fechou a etapa (o primeiro verdadeiro, pela ordem
   da ficha), e a variante da solução desse ramo */
function ramoDe(F, etapa, ctx) {
  if (!Array.isArray(etapa.ramos)) return { ramo: null, variante: null };
  const i = etapa.conclui.slice(1).findIndex((c) => avaliarCondicao(c, ctx));
  const ramo = i >= 0 ? etapa.ramos[i] : null;
  const vs = arr(((obj(F.solucoes) || {})[etapa.id] || {})[ramo]);
  const v = vs.find((x) => x.quando === undefined || avaliarCondicao(x.quando, ctx)) || null;
  return { ramo, variante: v };
}

const nota = (de, texto, efeitos, dia, nomes) => ({ de, dia, texto: texto ? frase(texto, nomes) : "", efeitos: arr(efeitos).map((e) => ({ ...e })) });

/* ============================================================
   ABRIR — abrirQuest(ficha, { estado, papeis, mundo }) → registo | null
   `papeis`: o que a criação do mundo preencheu, por nome do papel —
   { protegido: { nome }, destino: { cidade }, passo: { nome, cidade } }
   (o tipo vem da ficha). Cada papel passa a id aqui, UMA VEZ.
   A QUEST NUNCA NASCE FEITA (§6, a mesma regra de `aceitarProposta`): se a
   primeira etapa já está cumprida, se a falha já aconteceu ou se um
   desfecho do tipo 2 já se deu, a quest não entra — devolve null.
   ============================================================ */
export function abrirQuest(ficha, contexto) {
  const F = fichaDe(ficha);
  if (!F || !validarQuest(F).ok) return null;
  const k = obj(contexto) || {};
  const E = obj(k.estado) || {};
  const mundo = obj(k.mundo);
  const dia = diaDe(E);
  const entrada = obj(k.papeis) || {};
  const comTipo = {};
  for (const [nome, d] of Object.entries(F.papeis)) {
    const p = obj(entrada[nome]) || {};
    comTipo[nome] = { ...p, tipo: PAPEIS_DA_QUEST[d.de].tipo };
  }
  const r = resolverPapeis(comTipo, E, { mundo });
  const papeis = {};
  for (const nome of Object.keys(comTipo)) {
    const p = comTipo[nome];
    const fora = {};
    for (const c of ["nome", "cidade", "chave", "id"]) if (typeof p[c] === "string") fora[c] = p[c];
    papeis[nome] = { ...fora, ...(r.papeis[nome] || {}), tipo: p.tipo };
  }
  const R = {
    v: LIMITES_DA_QUEST.versao, id: F.id, tipo: F.tipo, inicio: dia, ultimoAvanco: dia,
    papeis, feitas: {}, escolhas: {}, acesas: {}, reviravoltas: [], consequencias: [],
    estado: "aberta", motivo: null, desfecho: null, fecho: null, fechouEm: null,
  };
  const ctx = contextoDe(F, R, E, mundo);
  const primeira = etapasDe(F, R)[0];
  if (primeira && estaAcesa(primeira, R, ctx, dia, k.quests)) {
    const exigeOk = primeira.exige.every((c) => avaliarCondicao(c, ctx));
    if (exigeOk && julgarEtapa({ conclui: primeira.conclui }, ctx).feita) return null;
  }
  if (arr(F.falha).some((f) => avaliarCondicao(f.quando, ctx))) return null;
  if (arr(F.desfechos).some((d) => d.cedo && avaliarCondicao(d.quando, ctx))) return null;
  if (primeira && estaAcesa(primeira, R, ctx, dia, k.quests)) R.acesas = { [primeira.id]: dia };
  return R;
}

/* ============================================================
   AVANÇAR — avancarQuest(ficha, registo, { estado, mundo, quests }) → registo novo
   Corre UMA vez por turno, depois de o livro de factos ser escrito.
   `quests`: os registos das outras quests (a âncora do tipo 2 conta as do
   tipo 1 concluídas). Por ordem:
     1. o papel que ainda não tinha id procura-o outra vez (e fica);
     2. as etapas fecham em cascata, pela ordem, enquanto estiverem acesas
        e cumpridas — cada uma com o dia, o ramo e a variante da solução;
        um ramo que `fecha` acaba a quest ali;
     3. uma reviravolta (no máximo LIMITES_DA_QUEST.reviravoltasPorTurno)
        cujo gatilho se cumpre dispara, muda a quest, e a cascata corre
        outra vez;
     4. o fim: todas feitas → concluída (tipo 1) ou o desfecho que os
        factos dizem (tipo 2); senão a falha (tipo 1) ou o desfecho que
        acaba cedo (tipo 2); senão o abandono, contado em dias sem etapa
        nova (no tipo 2, só com a etapa acesa).
   A quest fechada não muda mais. O registo recebido nunca é mutado.
   ============================================================ */
export function avancarQuest(ficha, registo, contexto) {
  const F = fichaDe(ficha);
  if (!F || !validarQuest(F).ok) return null;
  const R0 = garantirRegisto(registo, F);
  if (!R0) return null;
  if (R0.estado !== "aberta") return R0;
  const k = obj(contexto) || {};
  const E = obj(k.estado) || {};
  const mundo = obj(k.mundo);
  const dia = Math.max(diaDe(E), R0.inicio);
  let R = { ...R0, papeis: { ...R0.papeis }, feitas: { ...R0.feitas }, acesas: { ...R0.acesas }, reviravoltas: [...R0.reviravoltas], consequencias: [...R0.consequencias] };

  /* 1. o papel que faltava */
  const pendentes = Object.keys(R.papeis).filter((n) => obj(R.papeis[n]) && !R.papeis[n].id);
  if (pendentes.length) {
    const r = resolverPapeis(Object.fromEntries(pendentes.map((n) => [n, R.papeis[n]])), E, { mundo });
    for (const n of pendentes) if (r.papeis[n] && r.papeis[n].id) R.papeis[n] = { ...R.papeis[n], id: r.papeis[n].id };
  }

  let ctx = contextoDe(F, R, E, mundo);
  const fechar = (estado, motivo, extra) => {
    R = { ...R, estado, motivo, fechouEm: dia, ...extra };
  };
  /* 2. a cascata */
  const cascata = () => {
    const lista = etapasDe(F, R);
    for (let i = 0; i <= lista.length; i++) {
      const e = etapaAtual(lista, R);
      if (!e || !estaAcesa(e, R, ctx, dia, k.quests)) return;
      if (R.acesas[e.id] == null) { R.acesas = { ...R.acesas, [e.id]: dia }; }
      if (!e.exige.every((c) => avaliarCondicao(c, ctx))) return;
      if (!julgarEtapa({ conclui: e.conclui }, ctx).feita) return;
      const { ramo, variante } = ramoDe(F, e, ctx);
      R.feitas = { ...R.feitas, [e.id]: { dia, ramo, variante: variante && variante.id ? variante.id : null } };
      R.ultimoAvanco = dia;
      if (variante) R.consequencias = [...R.consequencias, nota(`${e.id}:${ramo}`, variante.texto, variante.efeitos, dia, ctx.nomes)];
      ctx = contextoDe(F, R, E, mundo);
      if (variante && variante.fecha) {
        fechar(variante.fecha, "escolha", { fecho: { de: `${e.id}:${ramo}`, texto: frase(variante.texto, ctx.nomes) } });
        return;
      }
    }
  };
  cascata();
  if (R.estado !== "aberta") return R;

  /* 3. a reviravolta */
  let disparadas = 0;
  for (const rv of arr(F.reviravoltas)) {
    if (disparadas >= LIMITES_DA_QUEST.reviravoltasPorTurno) break;
    if (R.reviravoltas.some((x) => x.id === rv.id)) continue;
    if (!avaliarCondicao(rv.gatilho, ctx)) continue;
    disparadas++;
    R.reviravoltas = [...R.reviravoltas, { id: rv.id, dia }];
    const efeitosDaQuest = [];
    for (const ef of rv.efeitos) {
      if (ef.tipo === "troca_papel") R.papeis = { ...R.papeis, [ef.papel]: { ...R.papeis[ef.por] } };
      else if (ef.tipo === "acende") R.acesas = { ...R.acesas, [ef.etapa]: dia };
      else if (!EFEITOS_DA_REVIRAVOLTA[ef.tipo]) efeitosDaQuest.push(ef);
    }
    R.consequencias = [...R.consequencias, nota(`reviravolta:${rv.id}`, rv.texto, efeitosDaQuest, dia, ctx.nomes)];
    ctx = contextoDe(F, R, E, mundo);
  }
  if (disparadas) cascata();
  if (R.estado !== "aberta") return R;

  /* 4. o fim */
  const lista = etapasDe(F, R);
  const atual = etapaAtual(lista, R);
  const desfechar = (d, motivo) => {
    R.consequencias = [...R.consequencias, nota(`desfecho:${d.id}`, d.texto, d.efeitos, dia, ctx.nomes)];
    fechar("terminada", motivo, { desfecho: d.id, fecho: { de: `desfecho:${d.id}`, texto: frase(d.texto, ctx.nomes) } });
  };
  if (F.tipo === 1) {
    if (!atual) {
      R.consequencias = [...R.consequencias, nota("fecho", F.fecho.texto, F.fecho.efeitos, dia, ctx.nomes)];
      fechar("concluida", "etapas", { fecho: { de: "fecho", texto: frase(F.fecho.texto, ctx.nomes) } });
      return R;
    }
    const f = arr(F.falha).find((x) => !(x.ate && R.feitas[x.ate]) && avaliarCondicao(x.quando, ctx));
    if (f) {
      R.consequencias = [...R.consequencias, nota("falha", f.texto, f.efeitos, dia, ctx.nomes)];
      fechar("falhada", "falha", { fecho: { de: "falha", texto: frase(f.texto, ctx.nomes) } });
      return R;
    }
    if (dia - R.ultimoAvanco >= F.abandono.semAvancar) {
      R.consequencias = [...R.consequencias, nota("abandono", F.abandono.texto, F.abandono.efeitos, dia, ctx.nomes)];
      fechar("falhada", "abandono", { fecho: { de: "abandono", texto: frase(F.abandono.texto, ctx.nomes) } });
    }
    return R;
  }
  /* o tipo 2: o que acaba cedo, o fim pelas etapas, ou o abandono */
  const ds = arr(F.desfechos);
  const cedo = ds.find((d) => d.cedo && avaliarCondicao(d.quando, ctx));
  if (cedo) { desfechar(cedo, "cedo"); return R; }
  if (!atual) {
    const d = ds.find((x) => !x.padrao && avaliarCondicao(x.quando, ctx)) || ds.find((x) => x.padrao);
    desfechar(d, "etapas");
    return R;
  }
  if (R.acesas[atual.id] != null) {
    const desde = Math.max(R.ultimoAvanco, R.acesas[atual.id]);
    if (dia - desde >= F.abandono.semAvancar) desfechar(ds.find((x) => x.id === F.abandono.desfecho), "abandono");
  }
  return R;
}

/* as escolhas que se podem fazer agora: a da etapa atual, acesa, com o
   que a reviravolta lhe exige cumprido, e ainda por fazer */
function escolhasAbertas(F, R, ctx, dia, outras) {
  if (R.estado !== "aberta") return [];
  const e = etapaAtual(etapasDe(F, R), R);
  if (!e || !estaAcesa(e, R, ctx, dia, outras) || !e.exige.every((c) => avaliarCondicao(c, ctx))) return [];
  return Object.keys(obj(F.escolhas) || {}).filter((kk) => F.escolhas[kk].etapa === e.id && !R.escolhas[kk]);
}
const custoDe = (efs) => arr(efs).filter((e) => e.tipo === "moedas" && e.n < 0).reduce((s, e) => s - e.n, 0);
const bolsaDe = (E) => Math.max(0, inteiro(obj(obj(E) && E.personagem) && E.personagem.moedas) || 0);

/* ============================================================
   O VEREDITO ANTES DO CLIQUE — vereditoDaEscolha(ficha, registo, chave, contexto)
   → null | { chave, etapa, opcoes: [{ id, texto, ganha, custa, efeitos,
   custo, podeEscolher }] }. Os dois lados de cada opção, em mundo, e o
   preço — a tela mostra-os ANTES de o jogador escolher (a lei da casa).
   null quando a escolha não está aberta agora.
   ============================================================ */
export function vereditoDaEscolha(ficha, registo, chave, contexto) {
  const F = fichaDe(ficha);
  if (!F || !validarQuest(F).ok) return null;
  const R = garantirRegisto(registo, F);
  if (!R) return null;
  const k = obj(contexto) || {};
  const E = obj(k.estado) || {};
  const ctx = contextoDe(F, R, E, obj(k.mundo));
  const dia = Math.max(diaDe(E), R.inicio);
  if (!escolhasAbertas(F, R, ctx, dia, k.quests).includes(chave)) return null;
  const e = F.escolhas[chave];
  const bolsa = bolsaDe(E);
  return {
    chave, etapa: e.etapa,
    opcoes: Object.entries(e.opcoes).map(([id, o]) => {
      const custo = custoDe(o.efeitos);
      return {
        id, texto: maiuscula(encher(o.texto, ctx.nomes)), ganha: frase(o.ganha, ctx.nomes), custa: frase(o.custa, ctx.nomes),
        efeitos: arr(o.efeitos).map((x) => ({ ...x })), custo, podeEscolher: custo <= bolsa,
      };
    }),
  };
}

/* ============================================================
   ESCOLHER — escolherNaQuest(ficha, registo, chave, opcao, contexto) → registo
   A porta que escreve o que `escolheu` lê. Guarda a escolha com o dia,
   junta os efeitos dela às consequências, e avança a quest (a escolha é
   o facto que a etapa esperava). Irreversível: a escolha feita não se
   refaz. Recusada — a escolha não está aberta, a opção não existe, ou a
   bolsa não paga o preço — devolve o MESMO registo, sem tocar em nada.
   ============================================================ */
export function escolherNaQuest(ficha, registo, chave, opcao, contexto) {
  const F = fichaDe(ficha);
  if (!F || !validarQuest(F).ok) return registo;
  const R = garantirRegisto(registo, F);
  if (!R) return registo;
  const v = vereditoDaEscolha(F, R, chave, contexto);
  const op = v && v.opcoes.find((o) => o.id === opcao);
  if (!op || !op.podeEscolher) return registo;
  const E = obj((obj(contexto) || {}).estado) || {};
  const dia = Math.max(diaDe(E), R.inicio);
  const ctx = contextoDe(F, R, E, obj((obj(contexto) || {}).mundo));
  const novo = {
    ...R,
    escolhas: { ...R.escolhas, [chave]: { opcao, dia } },
    consequencias: [...R.consequencias, nota(`escolha:${chave}:${opcao}`, "", F.escolhas[chave].opcoes[opcao].efeitos, dia, ctx.nomes)],
  };
  return avancarQuest(F, novo, contexto);
}

/* ============================================================
   A VISTA — estadoDaQuest(ficha, registo, { estado, mundo, quests })
   → null | {
       id, tipo, titulo, estado, concluida, motivo,
       visivel   — o tipo 2 fica escondido até a primeira etapa acender,
       gancho,
       etapa     — o id da etapa atual (null quando fechou), etapaTexto,
       acesa     — se a etapa atual já acendeu (a do tipo 2 espera),
       feitas    — [{ id, dia, ramo, variante }], pela ordem da quest,
       falta     — o «o que falta» em dados (julgarEtapa, BQ3), o que a
                   reviravolta exige primeiro; vazio com a quest fechada
                   ou escondida,
       faltaTexto — as frases de mundo do «o que falta»,
       escolhas  — as chaves das escolhas abertas agora,
       reviravolta — a última que disparou: { id, dia, texto } | null,
       desfecho  — o id do desfecho do tipo 2 | null, ordem (1 o melhor),
       fecho     — { de, texto } quando fechou,
       consequencias — o que a quest deixou no mundo, para a fiação aplicar,
       mao       — a mão do vilão da ficha, com quem a ocupa agora }
   É a vista do registo AVANÇADO (o mesmo que avancarQuest devolveria), e
   não guarda nada: quem guarda é quem chama avancarQuest.
   ============================================================ */
export function estadoDaQuest(ficha, registo, contexto) {
  const F = fichaDe(ficha);
  if (!F || !validarQuest(F).ok) return null;
  const R = avancarQuest(F, registo, contexto);
  if (!R) return null;
  const k = obj(contexto) || {};
  const E = obj(k.estado) || {};
  const ctx = contextoDe(F, R, E, obj(k.mundo));
  const dia = Math.max(diaDe(E), R.inicio);
  const lista = etapasDe(F, R);
  const atual = R.estado === "aberta" ? etapaAtual(lista, R) : null;
  const acesa = !!atual && estaAcesa(atual, R, ctx, dia, k.quests);
  const primeira = lista[0];
  const visivel = F.tipo === 1 || (primeira && R.acesas[primeira.id] != null);
  let falta = [];
  if (atual && acesa && visivel) {
    const exige = atual.exige.flatMap((c) => julgarEtapa({ conclui: c }, ctx).falta);
    falta = [...exige, ...(exige.length ? [] : julgarEtapa({ conclui: atual.conclui }, ctx).falta)];
  }
  const ult = R.reviravoltas[R.reviravoltas.length - 1];
  const rv = ult ? arr(F.reviravoltas).find((x) => x.id === ult.id) : null;
  const ordem = R.desfecho ? arr(F.desfechos).findIndex((d) => d.id === R.desfecho) + 1 : null;
  const mao = obj(F.mao) ? { ...F.mao, contra: [...F.mao.contra], quem: F.mao.papel ? ctx.nomes[F.mao.papel] : null, id: F.mao.papel ? (R.papeis[F.mao.papel] || {}).id || "" : "" } : null;
  return {
    id: F.id, tipo: F.tipo, titulo: F.titulo,
    estado: R.estado, concluida: R.estado === "concluida", motivo: R.motivo,
    visivel: !!visivel,
    gancho: visivel ? frase(F.gancho, ctx.nomes) : "",
    etapa: atual ? atual.id : null,
    etapaTexto: atual && visivel ? frase(atual.texto, ctx.nomes) : "",
    acesa,
    feitas: lista.filter((e) => R.feitas[e.id]).map((e) => ({ id: e.id, ...R.feitas[e.id] })),
    falta,
    faltaTexto: falta.map((f) => f.texto).filter(Boolean),
    escolhas: visivel ? escolhasAbertas(F, R, ctx, dia, k.quests) : [],
    reviravolta: ult && rv ? { id: ult.id, dia: ult.dia, texto: (R.consequencias.find((c) => c.de === `reviravolta:${ult.id}`) || {}).texto || "" } : null,
    desfecho: R.desfecho, ordem,
    fecho: R.fecho,
    consequencias: R.consequencias,
    mao,
  };
}
