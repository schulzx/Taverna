/* ============================================================
   A BIBLIOTECA DE QUESTS — a ficha, o catálogo e o estado de cada quest
   (08/11/2026, Fase BQ · BQ4)

   A pessoa, em 08/11: o esqueleto da história é vago. Uma campanha nova
   deixa de sortear marcos soltos («Encontrar X», «O que Y esconde») e passa
   a ESCOLHER E LIGAR QUESTS JÁ DESENHADAS, cada uma com etapas, soluções,
   consequências, reviravoltas e um fim — e o sistema sabe sempre em que
   etapa está e o que falta (mente/plano-biblioteca-de-quests.md, §2, §6 e
   §10). Este módulo é a ficha, o catálogo (as três da planta e o acervo
   da BQ8, por lotes de seis) e o juiz delas.

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
    protegido: { de: "elenco", exige: ["vivo", "nao_e:vilao"], rotulo: "{protegido:o protegido|a protegida}" },
    origem: { de: "cidade", e: "a do ato" },
    destino: { de: "cidade", distancia: [2, 4] },
    passo: { de: "lugar", entre: ["origem", "destino"] },
    desvio: { de: "lugar", vizinho: "passo" },
    tenente: { de: "fio", papel: "tenente", alcunha: "a mão que guarda {passo}", rotulo: "quem guarda {passo}" },
    guarda: { de: "elenco", proximo: "protegido", rotulo: "quem anda mais perto de {protegido}" },
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
    testemunha: { de: "elenco", do: "lugar", rotulo: "quem viu alguém sair antes do fogo" },
    suspeito: { de: "elenco", rival: "de alguém da cidade", rotulo: "o nome que corre na praça" },
    prova: { de: "item", nasce: "lugar" },
    mandante: { de: "fio", papel: "tenente", alcunha: "quem pagou o fogo", rotulo: "quem pagou o fogo" },
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
    quem: { de: "grupo", ou: "elo", rotulo: "quem carrega a carta" },
    ferido: { de: "elenco", cidade: "uma cidade dos atos 2 ou 3", rotulo: "quem escreveu a carta" },
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
        custa: "A carta continua a pesar no bolso {quem:dele|dela}, e o que diz continua a ser só de {ferido}.",
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
        custa: "O preço sai da tua bolsa — e {quem} vai saber, até ao fim, que foi o teu dinheiro e não o {quem:dele|dela}.",
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
      texto: "A carta dizia, desde o princípio, que {ferido} já tinha perdoado. Faltava só {quem} ouvi-lo da boca {ferido:dele|dela}. Choram os dois como quem já não sabe como se faz, e {quem} volta para o teu lado com um peso a menos que se vê de longe.",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "ferido" }] },
    { id: "a_divida_paga",
      quando: ["algum", ["escolheu", "frente", "interpor"], ["escolheu", "frente", "pagar"]],
      texto: "Não há abraço. Há um aceno, e uma conta que se fecha. {ferido} vira costas primeiro; {quem} fica a {ferido:vê-lo|vê-la} até dobrar a esquina, e depois diz o teu nome como quem agradece.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 10 }] },
    { id: "a_cicatriz",
      quando: ["todos", ["escolheu", "frente", "deixar"], ["nenhum", ["escolheu", "carta", "queimar"]], ["afeicao", "papel:quem", 2]],
      texto: "Acertaram à maneira antiga. {quem} volta com um corte que vai fechar torto, e {ferido} fica no pó, com vida e de olhos abertos para o céu. Nenhum dos dois ganhou. Os dois pararam.",
      efeitos: [{ tipo: "situacao", papel: "ferido", situacao: "ferida" }, { tipo: "quem_e", papel: "quem", linha: "traz uma cicatriz que não deixa ninguém tocar" }] },
    { id: "a_ferida_fica", padrao: true,
      texto: "{quem} não volta a falar da carta. Continua ao teu lado, mais {quem:calado|calada}, e às vezes, junto ao fogo, passa o polegar pelo lacre como quem reza.",
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

/* ============================================================
   O ACERVO, LOTE 2 (BQ8) — seis quests no mesmo formato
   Quatro do tipo 1, cada uma com a mão do vilão num passo que as três
   primeiras não contestavam (o 4, o 5 e o 6): a PISTA que entrega a
   fraqueza, o RECURSO de que o passo 4 precisa, o ROSTO (o encontro sem
   luta, onde nasce o pacto) e o CONFRONTO. E duas do tipo 2, ligadas pela
   ponte a quem anda com o herói: o medo de morrer e a fé.
   As referências: a Grande Lista (Caçada #18 com o Dobre das «Onças» #23;
   «Quanto custa…» #14 com «A ajuda está a caminho» #12; «Garfo longo…» #16
   com «Olhe, não toque» #17; «Base oculta» #13, com o Surpreenda), e a
   mesa do Matt: cada escolha custa dos dois lados, e o mundo lembra-se.
   Os papéis não têm género: um papel pode ser qualquer pessoa.
   ============================================================ */

/* A PISTA (passo 4): quem serviu o vilão e saiu pela janela com o que
   sabia. O preço da verdade é o perdão de quem fez mal — e há quem tenha
   enterrado um irmão por ordem dessa pessoa. A prova é a fraqueza: o
   esqueleto liga `arquivo` à verdade e `prova` à coisa (a família dela). */
const A_MAO_QUE_MUDOU_DE_LADO = quest({
  id: "a_mao_que_mudou_de_lado",
  titulo: "A Mão Que Mudou de Lado",
  tipo: 1,
  enredo: 18,                                   // Caçada, com o Dobre das «Onças da Prevenção» (#23)
  quando: ["meio"],
  afim: ["misterio", "arquipelago"],
  papeis: {
    desertor: { de: "elenco", serviu: "vilao", rotulo: "quem mudou de lado" },
    esconderijo: { de: "lugar", e: "um sítio da cidade do ato" },
    refugio: { de: "cidade", distancia: [2, 4] },
    arquivo: { de: "lugar", fraqueza: "verdade" },
    prova: { de: "item", fraqueza: "coisa" },
    cacador: { de: "fio", papel: "tenente", alcunha: "quem anda a farejar {desertor}", rotulo: "quem anda a farejar {desertor}" },
    vitima: { de: "elenco", feridoPor: "desertor", rotulo: "quem {desertor} feriu" },
  },
  mao: { tipo: "pista", contra: [4], papel: "cacador" },
  pede: [],
  deixa: ["aliado:desertor"],
  gancho: "{desertor} serviu sete anos a mão que anda por trás de tudo o que corre mal nesta terra, e uma noite saiu pela janela com o que sabia. Manda dizer, de {esconderijo}, que fala contigo e com mais ninguém — e só uma vez. {cacador} já pergunta por {desertor} nas tabernas, com uma moeda numa mão e uma corda na outra. E {vitima}, que enterrou um irmão por ordem de {desertor}, também pergunta.",
  etapas: [
    { id: "achar", texto: "Encontrar {desertor} em {esconderijo}",
      conclui: ["todos", ["esteve", "lugar:esconderijo"], ["conversou", "papel:desertor"]] },
    { id: "preco", texto: "Dizer a {desertor} quanto vale o que sabe",
      conclui: ["algum", ["escolheu", "preco", "amnistia"], ["escolheu", "preco", "justica"]],
      ramos: ["amnistia", "justica"] },
    { id: "prova", texto: "Chegar ao que {desertor} sabe",
      conclui: ["algum", ["descobriu", "lugar:arquivo"], ["tem", "item:prova"]],
      ramos: ["verdade", "coisa"] },
    { id: "salvo", texto: "Tirar {desertor} do alcance de {cacador}",
      conclui: ["algum", ["derrotou", "papel:cacador"], ["todos", ["acompanha", "papel:desertor"], ["esta_em", "lugar:refugio"]]],
      ramos: ["luta", "fuga"] },
  ],
  escolhas: {
    preco: { etapa: "preco", opcoes: {
      amnistia: {
        texto: "prometer a {desertor} a vida e o perdão",
        ganha: "{desertor} abre a boca e não a volta a fechar: diz-te onde está guardado o que mais se teme perder.",
        custa: "{vitima} enterrou um irmão por ordem de {desertor}, e vai ver-te apertar essa mão. Não te vai perdoar, nem a mão, nem o aperto.",
        efeitos: [{ tipo: "afeicao", papel: "vitima", n: -1 }, { tipo: "laco", papel: "desertor", laco: "divida" }],
      },
      justica: {
        texto: "dizer a {desertor} que um dia vai responder perante {vitima}",
        ganha: "{vitima} vai saber que ninguém comprou o perdão daquele sangue — nem tu, nem quem tem pressa.",
        custa: "{desertor} fala, mas só metade: a outra guarda-a para quando estiver longe de ti. O caminho fica mais comprido, e {cacador} mais perto.",
        efeitos: [{ tipo: "afeicao", papel: "vitima", n: 1 }, { tipo: "afeicao", papel: "desertor", n: -1 }],
      },
    } },
  },
  solucoes: {
    preco: {
      amnistia: [{ texto: "{desertor} chora sem fazer barulho, como quem aprendeu a chorar em casa alheia. Depois limpa a cara à manga e começa pelo princípio." }],
      justica: [{ texto: "{desertor} ouve a sentença sem pestanejar, acena uma vez, e diz-te metade do que sabe a olhar para a porta." }],
    },
    prova: {
      verdade: [{ texto: "Em {arquivo}, entre contas de mercearia e cartas de amor que ninguém mandou, está a letra que procuravas, com as datas certas ao lado das coisas erradas." }],
      coisa: [{ texto: "{prova} pesa mais do que parece. Ninguém guarda uma coisa destas com tanto cuidado se ela não puder deitar alguém abaixo." }],
    },
    salvo: {
      luta: [
        { id: "poupou", quando: ["poupou", "papel:cacador"],
          texto: "{cacador} ficou no chão com a corda ainda na mão, e deixaste {cacador} lá, com vida. Vai voltar a quem o mandou com uma história — e a história tem a tua cara.",
          efeitos: [{ tipo: "deixa", premissa: "devedor:cacador" }, { tipo: "avisa_vilao" }] },
        { id: "matou",
          texto: "{cacador} não volta a perguntar por ninguém. A corda que trazia serviu para atar o saco onde levaram o corpo.",
          efeitos: [{ tipo: "deixa", premissa: "vinganca:cacador" }] },
      ],
      fuga: [{ texto: "Dois dias de estrada sem fogueira, a dormir por turnos. Quando {refugio} aparece no horizonte, {desertor} ri-se pela primeira vez — e não consegue parar.",
        efeitos: [{ tipo: "dia", n: 2 }] }],
    },
  },
  reviravoltas: [
    { id: "a_janela_aberta",
      texto: "{desertor} não te mentiu em nada — e foi por isso que lhe seguiram o rasto até ti. A janela por onde fugiu ficou aberta de propósito. Quem guarda o que procuras já sabe a tua cara, e não vais lá chegar sem olhar antes para a de {cacador}.",
      gatilho: ["todos", ["etapa", "achar"], ["nenhum", ["etapa", "prova"]], ["nenhum", ["consultou", "papel:desertor"]]],
      efeitos: [{ tipo: "exige", etapa: "prova", condicao: ["conheceu", "papel:cacador"] }, { tipo: "avisa_vilao" }] },
    { id: "a_outra_metade",
      texto: "A metade que {desertor} guardou era a que dizia onde. Sem ela, só sabes o quê — e o quê não se leva à praça.",
      gatilho: ["escolheu", "preco", "justica"],
      efeitos: [{ tipo: "abre_etapa", antes: "prova", etapa: {
        id: "metade", texto: "Arrancar a outra metade",
        conclui: ["pelo_menos", 2, ["consultou", "papel:desertor", 2], ["conversou", "papel:vitima"], ["esteve", "lugar:arquivo"]] } },
      { tipo: "relogio_do_fio", n: 1 }] },
  ],
  falha: [
    { quando: ["morto", "papel:desertor"], ate: "prova",
      texto: "{cacador} chegou primeiro. Acharam {desertor} no rio, de boca cosida com linha preta — e o que sabia foi com o rio." },
  ],
  abandono: { semAvancar: 5,
    texto: "{desertor} deixou de mandar recado. Em {esconderijo} só ficou uma cadeira virada e um pedaço de corda cortada à faca.",
    efeitos: [{ tipo: "situacao", papel: "desertor", situacao: "cativa" }] },
  fecho: {
    texto: "{desertor} entra em {refugio} com a vida e mais nada. O que pesava agora pesa-te a ti — e quem o perdeu já sabe que o tens.",
    efeitos: [{ tipo: "aliado", papel: "desertor" }, { tipo: "avisa_vilao" }],
  },
});

/* O RECURSO (passo 4): o último trigo antes do inverno, e alguém a
   comprá-lo a dobrar. Abrir as portas, queimar, ou guardar à espada —
   cada uma salva uma coisa e entrega outra. */
const O_CELEIRO_DE_INVERNO = quest({
  id: "o_celeiro_de_inverno",
  titulo: "O Celeiro de Inverno",
  tipo: 1,
  enredo: 14,                                   // «Quanto custa…», com «A ajuda está a caminho» (#12)
  quando: ["cedo", "meio"],
  afim: ["jornada", "reinado"],
  papeis: {
    celeiro: { de: "lugar", e: "um sítio da cidade do ato" },
    dono: { de: "elenco", do: "celeiro", rotulo: "{dono:o dono|a dona} do celeiro" },
    faminta: { de: "elenco", e: "a voz de quem tem fome", rotulo: "a voz de quem tem fome" },
    comprador: { de: "fio", papel: "tenente", alcunha: "quem compra o trigo a dobrar", rotulo: "quem compra o trigo a dobrar" },
  },
  mao: { tipo: "recurso", contra: [4], papel: "comprador" },
  pede: [],
  deixa: ["inimigo:comprador"],
  gancho: "O inverno vem cedo este ano, e o único trigo que sobra em muitas léguas dorme em {celeiro}, nas mãos de {dono}. {faminta} já enterrou duas crianças da rua desde a última colheita, e só te pede que vás ver. Entretanto, {comprador} oferece o dobro por cada saca — e ninguém sabe para quem compra.",
  etapas: [
    { id: "ouvir", texto: "Ouvir {faminta}", conclui: ["conversou", "papel:faminta"] },
    { id: "celeiro", texto: "Ver com os teus olhos o que guarda {celeiro}", conclui: ["esteve", "lugar:celeiro"] },
    { id: "dono", texto: "Chegar a {dono} antes de {comprador}",
      conclui: ["algum", ["conversou", "papel:dono"], ["derrotou", "papel:comprador"]],
      ramos: ["palavra", "lamina"] },
    { id: "trigo", texto: "Decidir de quem é o trigo",
      conclui: ["algum", ["escolheu", "trigo", "abrir"], ["escolheu", "trigo", "queimar"], ["escolheu", "trigo", "guardar"]],
      ramos: ["abrir", "queimar", "guardar"] },
  ],
  escolhas: {
    trigo: { etapa: "trigo", opcoes: {
      abrir: {
        texto: "abrir as portas de {celeiro} a quem tem fome",
        ganha: "{faminta} vê pão na mesa da rua inteira antes da neve, e quem compra o trigo a dobrar fica de mãos vazias.",
        custa: "{dono} perde num dia o que juntou numa vida, e não esquece de quem foi a mão que abriu a porta. E o trigo de um inverno acaba antes de o inverno acabar.",
        efeitos: [{ tipo: "afeicao", papel: "faminta", n: 1 }, { tipo: "inimigo", papel: "dono" }],
      },
      queimar: {
        texto: "queimar o trigo antes que mude de mãos",
        ganha: "Ninguém compra a fome desta cidade: o que ardeu não se vende a ninguém, e quem o queria fica sem a alavanca.",
        custa: "A cidade passa o inverno a olhar para as cinzas. {faminta} vai perguntar-te, à frente de todos, quantas crianças vale uma lição.",
        efeitos: [{ tipo: "afeicao", papel: "faminta", n: -1 }, { tipo: "relogio_regional", n: 1 }, { tipo: "relogio_do_fio", n: -1 }],
      },
      guardar: {
        texto: "guardar o trigo com {dono}, e pôr-te de vigia",
        ganha: "O trigo fica onde está, contado e repartido até à primavera, e {dono} passa a dever-te o sono.",
        custa: "Um celeiro guardado é um celeiro que se ataca: {comprador} vai voltar, com mais gente, e a tua lâmina passa a morar à porta de {celeiro}.",
        efeitos: [{ tipo: "laco", papel: "dono", laco: "divida" }, { tipo: "deixa", premissa: "cerco:celeiro" }],
      },
    } },
  },
  solucoes: {
    dono: {
      palavra: [{ texto: "{dono} ouve-te de braços cruzados e, no fim, descruza-os. Não é bondade: é medo de quem oferece o dobro sem regatear." }],
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:comprador"],
          texto: "{comprador} rende-se no meio das sacas, com farinha até aos cotovelos. Deixas que se vá — e levas a bolsa das compras, que é mais pesada do que devia.",
          efeitos: [{ tipo: "deixa", premissa: "devedor:comprador" }, { tipo: "moedas", n: 25 }] },
        { id: "matou",
          texto: "{comprador} fica estendido à porta de {celeiro}. Ninguém na rua pergunta quem era. Alguém, longe dali, vai perguntar.",
          efeitos: [{ tipo: "deixa", premissa: "vinganca:comprador" }] },
      ],
    },
    trigo: {
      abrir: [{ texto: "As portas abrem-se ao meio-dia. Ao fim da tarde a rua inteira cheira a pão, e {dono} assiste da janela sem dizer uma palavra." }],
      queimar: [{ texto: "O fogo de trigo cheira a pão queimado durante três dias. As crianças da rua vêm ver as chamas, e ninguém as manda embora." }],
      guardar: [{ texto: "Repartem-se as sacas por números de casa, à luz de uma lanterna. {dono} conta-as duas vezes e, pela primeira vez, conta-as em voz alta." }],
    },
  },
  reviravoltas: [
    { id: "o_trigo_ja_vendido",
      texto: "Debaixo das sacas de cima, palha. O trigo bom saiu de noite, há três noites, em carroças sem marca — e {dono} tem na gaveta um recibo de quem pagou adiantado. Ainda sobra para uma escolha, mas só metade, e a outra metade tem dono e cara.",
      gatilho: ["todos", ["etapa", "celeiro"], ["nenhum", ["etapa", "trigo"]], ["descobriu", "lugar:celeiro"]],
      efeitos: [{ tipo: "exige", etapa: "trigo", condicao: ["conheceu", "papel:comprador"] }, { tipo: "relogio_do_fio", n: 1 }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:faminta"], ["nenhum", ["derrotou", "papel:faminta"]]], ate: "trigo",
      texto: "{faminta} morreu numa rixa à porta de {celeiro}, a pedir pão para os outros. A rua deixou de pedir. Agora espera." },
  ],
  abandono: { semAvancar: 6,
    texto: "{comprador} carregou o trigo numa noite de geada, saca a saca, e {celeiro} amanheceu de portas abertas e vazio.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "O inverno chega, e desta vez a cidade sabe quem esteve à porta de {celeiro} quando importava.",
    efeitos: [{ tipo: "inimigo", papel: "comprador" }],
  },
});

/* O ROSTO (passo 5): um convite sob a lei de uma casa onde ninguém puxa
   da lâmina. É aqui que o herói o vê pela primeira vez, e é aqui que
   nasce o pacto (a decisão da pessoa): aceitar faz dele um «aliado» na
   ficha, e o confronto lê isso. */
const O_CONVITE_SEM_SELO = quest({
  id: "o_convite_sem_selo",
  titulo: "O Convite Sem Selo",
  tipo: 1,
  enredo: 16,                                   // «Garfo longo…», com «Olhe, não toque» (#17)
  quando: ["meio", "fim"],
  afim: ["reinado", "misterio"],
  papeis: {
    vilao: { de: "fio", papel: "vilao", alcunha: "quem manda o convite", rotulo: "quem manda o convite" },
    anfitriao: { de: "elenco", neutro: true, rotulo: "quem abre a casa" },
    salao: { de: "lugar", do: "anfitriao" },
    refem: { de: "elenco", exige: ["vivo", "cativa"], rotulo: "quem está à mesa sem a ter escolhido" },
  },
  mao: { tipo: "rosto", contra: [5], papel: "vilao" },
  pede: [],
  deixa: ["conhece:vilao"],
  gancho: "Chega um convite sem selo, escrito com boa letra: um lugar à mesa, amanhã à noite, em {salao}, sob a lei da casa de {anfitriao} — ninguém puxa de uma lâmina debaixo daquele teto, nem quem convida, nem quem é convidado. No fundo do papel, uma linha só: «{refem} também janta.»",
  etapas: [
    { id: "convite", texto: "Aceitar a lei da casa de {anfitriao}", conclui: ["conversou", "papel:anfitriao"] },
    { id: "mesa", texto: "Sentar-te à mesa de {vilao}",
      conclui: ["todos", ["esta_em", "lugar:salao"], ["conversou", "papel:vilao"]] },
    { id: "oferta", texto: "Responder ao que {vilao} te oferece",
      conclui: ["algum", ["escolheu", "rosto", "aceitar"], ["escolheu", "rosto", "recusar"], ["escolheu", "rosto", "levar"]],
      ramos: ["aceitar", "recusar", "levar"] },
    { id: "saida", texto: "Sair de {salao} sob a lei da casa", conclui: ["nenhum", ["esta_em", "lugar:salao"]] },
  ],
  escolhas: {
    rosto: { etapa: "oferta", opcoes: {
      aceitar: {
        texto: "aceitar o que {vilao} te oferece",
        ganha: "{refem} sai da sala livre esta noite, e a terra que te é mais cara fica fora do caminho do que vem a seguir — palavra de quem cumpre as que dá.",
        custa: "Passas a dever a {vilao}, e {vilao} fica a saber o teu nome, a tua cara e o teu preço. Uma dívida destas não se paga em moedas, e cobra-se quando mais doer.",
        efeitos: [{ tipo: "situacao", papel: "refem", situacao: "livre" }, { tipo: "aliado", papel: "vilao" }, { tipo: "avisa_vilao" }],
      },
      recusar: {
        texto: "recusar, e dizê-lo na cara de {vilao}",
        ganha: "Sais como entraste: sem dono. E quem estava à mesa viu que ainda há quem diga não.",
        custa: "{refem} fica onde está, e {vilao} acaba de aprender o que precisava sobre ti. O próximo passo vem mais depressa — e vem para ti.",
        efeitos: [{ tipo: "inimigo", papel: "vilao" }, { tipo: "relogio_do_fio", n: 1 }],
      },
      levar: {
        texto: "levantar-te da mesa e levar {refem} contigo",
        ganha: "{refem} sai pelo teu braço, sem ninguém ter puxado de uma lâmina — ainda.",
        custa: "Quebras a lei de {anfitriao} à frente de toda a gente que importa. A casa fecha-te as portas para sempre, e a escada até à rua é comprida.",
        efeitos: [{ tipo: "inimigo", papel: "anfitriao" }, { tipo: "avisa_vilao" }],
      },
    } },
  },
  solucoes: {
    oferta: {
      aceitar: [{ texto: "{vilao} levanta o copo, e tu levantas o teu. Não há papel nem assinatura: há um brinde, e toda a gente na sala o ouviu." }],
      recusar: [{ texto: "Dizes que não. {vilao} sorri como quem já sabia, e manda servir a sobremesa na mesma. É a sobremesa mais longa da tua vida." }],
      levar: [{ texto: "Levantas-te. Trinta cadeiras arrastam-se ao mesmo tempo, e ninguém se mexe. {anfitriao} olha para ti como para uma louça partida." }],
    },
  },
  reviravoltas: [
    { id: "o_refem_sem_correntes",
      texto: "{anfitriao} enche-te o copo e diz, sem mexer os lábios: as correntes de {refem} não estão fechadas. Nunca estiveram. O que se joga esta noite não é a vida de {refem} — é a tua palavra.",
      gatilho: ["todos", ["etapa", "convite"], ["nenhum", ["etapa", "oferta"]], ["conversou", "papel:anfitriao", 2]],
      efeitos: [{ tipo: "quem_e", papel: "refem", linha: "sentou-se à mesa sem correntes, e sabia porquê" }, { tipo: "afeicao", papel: "anfitriao", n: 1 }] },
    { id: "a_escada_comprida",
      texto: "Ninguém puxa de uma lâmina. Mas ninguém se afasta da escada, também.",
      gatilho: ["escolheu", "rosto", "levar"],
      efeitos: [{ tipo: "abre_etapa", antes: "saida", etapa: {
        id: "fuga", texto: "Descer a escada de {salao} com {refem}",
        conclui: ["todos", ["acompanha", "papel:refem"], ["nenhum", ["esta_em", "lugar:salao"]]] } }] },
  ],
  falha: [
    { quando: ["derrotou", "papel:anfitriao"],
      texto: "Correu sangue na toalha de {anfitriao}. Daqui a uma semana, toda a gente que importa vai saber que não há mesa nem palavra que te prenda — e nenhuma porta se volta a abrir para conversar." },
    { quando: ["morto", "papel:refem"], ate: "oferta",
      texto: "{refem} não chegou a sentar-se. O lugar ficou posto, com o copo cheio, e {vilao} brindou à cadeira vazia antes de te desejar boa noite." },
  ],
  abandono: { semAvancar: 4,
    texto: "A noite do convite passou sem ti. Em {salao}, o teu lugar ficou posto até ao amanhecer, e de manhã havia um bilhete no prato: «fica para a próxima, que será à minha maneira.»",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "Sais de {salao} com o gosto do vinho na boca e uma cara na memória que já não é rumor. Agora sabes com quem falas. E quem te convidou também.",
    efeitos: [{ tipo: "deixa", premissa: "conhece:vilao" }],
  },
});

/* O CONFRONTO (passo 6): a escada, o último servo, quem o herói ama de
   joelhos ao lado dele, e o que fica depois. A fraqueza na mão abre o
   ramo sem luta (§11.7); o pacto aceite no rosto abre a dívida, que se
   cumpre ou se rasga; e a sentença é a última escolha: poupar, acabar
   ou selar — as opções que DESFECHOS_DO_VILAO lê. A fraqueza tem três
   papéis, um por família (FRAQUEZAS): o esqueleto liga o da família do
   vilão, e os outros ficam sem ninguém (falsos, nunca lançam). */
const O_CIMO_DA_ESCADA = quest({
  id: "o_cimo_da_escada",
  titulo: "O Cimo da Escada",
  tipo: 1,
  enredo: 13,                                   // Base oculta, com o Surpreenda
  quando: ["fim"],
  afim: [],
  papeis: {
    vilao: { de: "fio", papel: "vilao", alcunha: "quem espera ao cimo da escada", rotulo: "quem espera ao cimo da escada" },
    covil: { de: "lugar", e: "o covil dele" },
    braco: { de: "fio", papel: "tenente", alcunha: "quem ainda guarda a escada", rotulo: "quem ainda guarda a escada" },
    refem: { de: "elenco", exige: ["vivo", "querido_do_heroi"], rotulo: "quem está de joelhos ao cimo da escada" },
    fraqueza_quem: { de: "elenco", fraqueza: "pessoa", rotulo: "{vilao:a voz que ele ainda ouve|a voz que ela ainda ouve}" },
    fraqueza_coisa: { de: "item", fraqueza: "coisa" },
    fraqueza_verdade: { de: "lugar", fraqueza: "verdade" },
  },
  mao: { tipo: "confronto", contra: [6], papel: "vilao" },
  pede: [],
  deixa: ["caiu:vilao"],
  gancho: "Já não há rumor nem recado: há uma porta, em {covil}, e atrás dela quem andou a mover esta terra contra ti desde o primeiro dia. {braco} guarda a escada. E lá em cima, diz quem viu, {refem} ainda respira — porque {vilao} sabe que é por isso que vens.",
  etapas: [
    { id: "covil", texto: "Entrar em {covil}", conclui: ["esteve", "lugar:covil"] },
    { id: "braco", texto: "Passar por {braco}",
      conclui: ["algum", ["derrotou", "papel:braco"], ["afeicao", "papel:braco", 2]],
      ramos: ["luta", "palavra"] },
    { id: "frente", texto: "Pôr {vilao} de joelhos",
      conclui: ["algum", ["derrotou", "papel:vilao"], ["escolheu", "prova", "expor"]],
      ramos: ["luta", "prova"] },
    { id: "sentenca", texto: "Decidir o que fica de {vilao}",
      conclui: ["algum", ["escolheu", "sentenca", "poupar"], ["escolheu", "sentenca", "acabar"], ["escolheu", "sentenca", "selar"]],
      ramos: ["poupar", "acabar", "selar"] },
  ],
  escolhas: {
    pacto: { etapa: "divida", opcoes: {
      cumprir: {
        texto: "cumprir o que prometeste à mesa de {vilao}",
        ganha: "{refem} desce a escada contigo, com vida, e a terra que protegias fica de fora do que vier.",
        custa: "{vilao} fica, com uma parte do que queria e a tua palavra guardada. Um dia vem cobrar o resto, e vai escolher o dia.",
        efeitos: [{ tipo: "situacao", papel: "refem", situacao: "livre" }, { tipo: "deixa", premissa: "pacto:vilao" }],
      },
      romper: {
        texto: "rasgar a palavra dada e subir a escada",
        ganha: "Ficas sem dívida e com a lâmina livre.",
        custa: "Quebras a palavra dada a quem as guarda melhor do que ninguém — e {refem} paga a primeira prestação.",
        efeitos: [{ tipo: "situacao", papel: "refem", situacao: "ferida" }, { tipo: "rompe_laco", papel: "vilao" }],
      },
    } },
    prova: { etapa: "prova", opcoes: {
      expor: {
        texto: "pôr à frente de {vilao} o que não pode negar",
        ganha: "{vilao} cai sem que uma lâmina saia da bainha — e cai à frente de quem ainda seguia {vilao}.",
        custa: "Uma coisa destas só se usa uma vez. E quem perde tudo sem luta, à frente de todos, não perdoa a quem lho tirou.",
        efeitos: [{ tipo: "deixa", premissa: "humilhado:vilao" }],
      },
      guardar: {
        texto: "guardar o que sabes e decidir à lâmina",
        ganha: "Ninguém vai dizer que venceste com um papel na mão: venceste de pé.",
        custa: "Se a luta correr mal, cais com a arma que derrubava {vilao} no bolso.",
        efeitos: [],
      },
    } },
    sentenca: { etapa: "sentenca", opcoes: {
      poupar: {
        texto: "deixar {vilao} viver, e ir-te embora",
        ganha: "Ninguém vai poder dizer que te tornaste o que vieste derrubar. E quem poupa deixa uma porta aberta para alguém mudar.",
        custa: "Uma vida poupada anda por aí, com memória e com tempo. Pode mudar — e pode voltar.",
        efeitos: [{ tipo: "deixa", premissa: "poupado:vilao" }],
      },
      acabar: {
        texto: "acabar com {vilao} aqui, de uma vez",
        ganha: "Acabou, e acabou à tua frente: nenhum herdeiro pega no que ficaria a meio.",
        custa: "Matar quem está de joelhos não se desfaz. Quem estava na escada vai contar como foi — e vai contar mal.",
        efeitos: [{ tipo: "deixa", premissa: "caiu:vilao" }],
      },
      selar: {
        texto: "fechar {vilao} onde ninguém abra",
        ganha: "Nem sangue nem fuga: um nome atrás de uma porta que só tu sabes abrir.",
        custa: "Uma porta fechada continua a ser uma porta. Alguém vai procurar a chave — e a chave és tu.",
        efeitos: [{ tipo: "deixa", premissa: "selado:vilao" }],
      },
    } },
  },
  solucoes: {
    braco: {
      luta: [
        { id: "poupou", quando: ["poupou", "papel:braco"],
          texto: "{braco} larga a arma no terceiro degrau e senta-se, de mãos abertas. Deixas que fique. Quando passas, ouves atrás de ti: «lá em cima, não confies no copo.»",
          efeitos: [{ tipo: "laco", papel: "braco", laco: "divida" }] },
        { id: "matou", texto: "{braco} cai pela escada abaixo, degrau a degrau, e o barulho sobe antes de ti. Lá em cima já sabem que vens." },
      ],
      palavra: [{ texto: "{braco} afasta-se da escada sem uma palavra. Não te deixa passar: deixa de impedir. É diferente, e os dois sabem.",
        efeitos: [{ tipo: "aliado", papel: "braco" }] }],
    },
    divida: {
      cumprir: [{ fecha: "concluida",
        texto: "Apertam as mãos por cima da mesa onde tudo se decidiu. {refem} desce a escada contigo, e lá fora o dia nasce igual aos outros. Só tu sabes quanto custou." }],
      romper: [{ texto: "Rasgas a palavra em voz alta. {vilao} não se zanga: acena, como quem anota, e alguém grita no fundo da sala." }],
    },
    frente: {
      luta: [
        { id: "poupou", quando: ["poupou", "papel:vilao"],
          texto: "{vilao} cai de joelhos e não se levanta. A lâmina está na tua mão, e a decisão também." },
        { id: "matou", fecha: "concluida",
          texto: "{vilao} cai, e não se levanta mais. Não há últimas palavras: só o barulho de quem estava na escada a largar as armas, uma a uma.",
          efeitos: [{ tipo: "deixa", premissa: "caiu:vilao" }] },
      ],
      prova: [
        { id: "pessoa", quando: ["acompanha", "papel:fraqueza_quem"],
          texto: "{fraqueza_quem} entra na sala ao teu lado, e {vilao} baixa a lâmina antes de saber que a baixou. Há uma voz que ainda manda mais do que todo o medo que vendeu." },
        { id: "coisa", quando: ["tem", "item:fraqueza_coisa"],
          texto: "Pousas {fraqueza_coisa} em cima da mesa, à vista de todos, e {vilao} percebe antes de toda a gente que acabou." },
        { texto: "Dizes em voz alta, à frente de quem ainda servia {vilao}, o que ficou escondido tantos anos. Ninguém puxa de uma arma. Um a um, saem pela porta, e deixam-te a sós com o que sobrou." },
      ],
    },
    sentenca: {
      poupar: [{ texto: "Viras costas. É a coisa mais difícil que fizeste em toda a estrada, e ninguém te vai agradecer por ela." }],
      acabar: [{ texto: "Um golpe só. A sala fica tão calada que se ouve a vela a arder." }],
      selar: [{ texto: "A porta fecha-se com um barulho de pedra contra pedra. Do outro lado, durante muito tempo, ninguém diz nada. Depois, uma voz pede água." }],
    },
  },
  reviravoltas: [
    { id: "a_divida_cobrada",
      texto: "À entrada de {covil} há uma mesa posta e uma cadeira à tua espera. {vilao} não te recebe como inimigo: recebe-te como quem vem pagar. Apertaste-lhe a mão uma vez, e a mão lembra-se.",
      gatilho: ["todos", ["etapa", "covil"], ["nenhum", ["etapa", "braco"]], ["relacao", "papel:vilao", "aliado"]],
      efeitos: [{ tipo: "abre_etapa", antes: "braco", etapa: {
        id: "divida", texto: "Responder ao que prometeste",
        conclui: ["algum", ["escolheu", "pacto", "cumprir"], ["escolheu", "pacto", "romper"]],
        ramos: ["cumprir", "romper"] } }] },
    { id: "a_prova_na_mao",
      texto: "O que trazes contigo pesa mais a cada degrau. Lá em cima, alguém vai perceber o que é antes de lhe dizeres — e isso pode chegar.",
      gatilho: ["todos", ["etapa", "covil"], ["nenhum", ["etapa", "frente"]],
        ["algum", ["acompanha", "papel:fraqueza_quem"], ["tem", "item:fraqueza_coisa"], ["descobriu", "lugar:fraqueza_verdade"]]],
      efeitos: [{ tipo: "abre_etapa", antes: "frente", etapa: {
        id: "prova", texto: "Pôr diante de {vilao} o que mais teme",
        conclui: ["algum", ["escolheu", "prova", "expor"], ["escolheu", "prova", "guardar"]],
        ramos: ["expor", "guardar"] } }] },
    { id: "a_lamina_no_pescoco",
      texto: "Ao cimo da escada, {vilao} não está sozinho: {refem} está de joelhos ao lado, com uma lâmina encostada ao pescoço e os olhos em ti. Ninguém cai esta noite enquanto aquela lâmina estiver ali.",
      gatilho: ["todos", ["etapa", "braco"], ["nenhum", ["etapa", "frente"]], ["nenhum", ["acompanha", "papel:refem"]]],
      efeitos: [{ tipo: "exige", etapa: "frente", condicao: ["acompanha", "papel:refem"] }] },
  ],
  falha: [
    { quando: ["morto", "papel:refem"], ate: "frente",
      texto: "{refem} não desceu a escada. {vilao} ficou a olhar para ti por cima do corpo, e sorriu como quem fecha uma conta. Saíste de {covil} com vida, e foi o pior que te podia acontecer." },
    { quando: ["todos", ["morto", "papel:vilao"], ["nenhum", ["derrotou", "papel:vilao"]]], ate: "frente",
      texto: "Outra mão chegou primeiro. {vilao} morreu sem te ver, e o que começou não morreu com o corpo: já tem quem lhe pegue." },
  ],
  abandono: { semAvancar: 8,
    texto: "Esperaram por ti três noites. À quarta, {covil} amanheceu vazio, e o que lá se preparava foi ser feito noutro sítio.",
    efeitos: [{ tipo: "relogio_do_fio", n: 2 }] },
  fecho: {
    texto: "Desces a escada de {covil} ao amanhecer. Lá fora a terra é a mesma e as estradas são as mesmas — e, pela primeira vez em muito tempo, ninguém está a mover as peças por trás delas.",
    efeitos: [{ tipo: "aliado", papel: "refem" }],
  },
});

/* O MEDO DE MORRER (tipo 2): uma febre que conta os dias, um segredo que
   o herói decide guardar ou dar, e uma erva que se paga, se rouba, ou se
   espera. Do melhor (a febre cede, e a verdade foi dita) ao pior (quem
   esperou sem lutar, ou sem saber, morre) — sempre pelo que o herói
   escolheu. A ponte: quem vende a erva paga a quem manda no vilão, e
   quem vende a cura é quem semeia a febre (a reviravolta). */
const OS_DIAS_QUE_FALTAM = quest({
  id: "os_dias_que_faltam",
  titulo: "Os Dias Que Faltam",
  tipo: 2,
  quando: ["cedo", "meio", "fim"],
  afim: [],
  papeis: {
    quem: { de: "grupo", ou: "elo", rotulo: "quem anda contigo" },
    curandeira: { de: "elenco", cidade: "a do ato", rotulo: "quem ainda pode curar" },
    horto: { de: "lugar", cidade: "uma cidade dos atos 2 ou 3" },
  },
  mao: null,
  ponte: "{horto} fica numa cidade por onde um passo do vilão vai passar, e quem lá vende a erva paga a quem manda nele",
  pede: [],
  deixa: [],
  gancho: "{quem} tosse para o lenço e dobra-o depressa, antes que vejas a cor. Diz que é o pó da estrada. {curandeira} olhou para {quem} uma vez, ao passar, e chamou-te à parte com a cara de quem já deu esta notícia muitas vezes e nunca se habituou.",
  etapas: [
    { id: "sinal", texto: "Ouvir o que {curandeira} viu em {quem}",
      espera: 2, acende: ["acompanha", "papel:quem"],
      conclui: ["todos", ["acompanha", "papel:quem"], ["conversou", "papel:curandeira", 2]] },
    { id: "segredo", texto: "Decidir se {quem} fica a saber",
      conclui: ["algum", ["escolheu", "segredo", "contar"], ["escolheu", "segredo", "calar"]],
      ramos: ["contar", "calar"] },
    { id: "horto", texto: "Achar onde nasce a erva",
      ancora: { tipo: 1, concluidas: 1 },
      conclui: ["esteve", "lugar:horto"] },
    { id: "cura", texto: "Decidir como se paga a erva",
      conclui: ["algum", ["escolheu", "cura", "pagar"], ["escolheu", "cura", "roubar"], ["escolheu", "cura", "esperar"]],
      ramos: ["pagar", "roubar", "esperar"] },
  ],
  escolhas: {
    segredo: { etapa: "segredo", opcoes: {
      contar: {
        texto: "contar a {quem} o que {curandeira} disse",
        ganha: "{quem} deixa de carregar {quem:sozinho|sozinha} uma coisa que já sentia no peito, e passa a lutar por ela de olhos abertos.",
        custa: "Há quem prefira não saber. A partir desta noite, {quem} vai contar os dias contigo — e vais ver-lhe o medo em cada um.",
        efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }],
      },
      calar: {
        texto: "guardar o segredo, e procurar a cura sem dizer nada",
        ganha: "{quem} dorme descansado mais umas noites, sem saber o que lhe conta a tosse.",
        custa: "Se a cura não chegar a tempo, {quem} morre sem saber que tu sabias. E se chegar, um dia vai perguntar-te porque calaste.",
        efeitos: [],
      },
    } },
    cura: { etapa: "cura", opcoes: {
      pagar: {
        texto: "pagar o preço que pedem pela erva em {horto}",
        ganha: "A erva vem limpa, em mão, sem perguntas e sem ninguém à tua procura.",
        custa: "É mais do que a bolsa quer dar, e o dinheiro vai parar a quem não devia.",
        efeitos: [{ tipo: "moedas", n: -80 }],
      },
      roubar: {
        texto: "levar a erva de {horto} sem pagar",
        ganha: "A erva vem, e quem a vende fica sem a moeda do teu medo.",
        custa: "Quem guarda {horto} não perdoa a quem lhe mexe no negócio, e quem manda nesse negócio fica a saber por onde andas.",
        efeitos: [{ tipo: "avisa_vilao" }],
      },
      esperar: {
        texto: "confiar no tratamento lento de {curandeira}",
        ganha: "Nem moeda nem roubo: só caldos, emplastros e tempo, e {quem} ao teu lado a cada dia.",
        custa: "A febre não espera por ninguém. Sem a erva, só a vontade de {quem} a segura — e a vontade precisa de saber que tem de lutar, e de alguém por quem lutar.",
        efeitos: [],
      },
    } },
  },
  solucoes: {
    segredo: {
      contar: [{ texto: "Dizes-lho junto ao fogo, sem rodeios. {quem} fica muito tempo {quem:calado|calada}, e depois pergunta só quanto tempo. Não sabes. Dizes-lho também." }],
      calar: [{ texto: "Não dizes nada. {quem} pergunta o que {curandeira} queria, e tu respondes que era sobre o tempo. Não é mentira inteira, e pesa como se fosse." }],
    },
    cura: {
      pagar: [{ texto: "Contas as moedas em cima do balcão de {horto}, uma a uma. Quem as recebe não olha para elas: olha para ti, e guarda a tua cara." }],
      roubar: [{ texto: "Entras de noite em {horto} e sais com um molho de erva debaixo da capa e o coração a bater na garganta. Atrás de ti, um cão começa a ladrar." }],
      esperar: [{ texto: "{curandeira} muda os emplastros de manhã e à noite, e diz que agora é com {quem}. Ficas ao lado da cama, porque é o que se pode fazer." }],
    },
  },
  reviravoltas: [
    { id: "a_mesma_mao",
      texto: "Em {horto} não há só a erva que cura: há sacos de outra semente, atados com o mesmo nó, prontos a seguir para os poços. Quem vende a cura é quem semeia a febre — e {quem} não foi o primeiro, nem vai ser o último.",
      gatilho: ["todos", ["etapa", "horto"], ["nenhum", ["etapa", "cura"]], ["descobriu", "lugar:horto"]],
      efeitos: [{ tipo: "deixa", premissa: "febre:horto" }] },
    { id: "a_tosse_que_ouve",
      texto: "{quem} lê o nome da erva escrito no saco, à tua frente, e não diz nada. Só à noite, junto ao fogo, diz baixinho que preferia ter sabido por ti.",
      gatilho: ["todos", ["escolheu", "segredo", "calar"], ["etapa", "horto"], ["acompanha", "papel:quem"], ["nenhum", ["etapa", "cura"]]],
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -5 }] },
  ],
  desfechos: [
    { id: "a_febre_cede",
      quando: ["todos", ["escolheu", "segredo", "contar"], ["algum", ["escolheu", "cura", "pagar"], ["escolheu", "cura", "roubar"]], ["afeicao", "papel:quem", 2]],
      texto: "A febre cede numa semana. {quem} volta a comer, a rir alto, a praguejar contra o frio — e uma noite diz-te, sem olhar para ti, que foi a primeira vez que alguém lhe contou a verdade quando era mais fácil mentir.",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "curandeira" }] },
    { id: "o_tempo_emprestado",
      quando: ["todos", ["escolheu", "cura", "esperar"], ["escolheu", "segredo", "contar"], ["afeicao", "papel:quem", 3]],
      texto: "Sem erva nenhuma, só caldos e teimosia. {quem} passa uma semana a lutar com a febre de olhos abertos, a agarrar-te a mão nas piores horas — e ao oitavo dia senta-se na cama e pede pão. {curandeira} diz que nunca tinha visto uma coisa assim.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 10 }, { tipo: "quem_e", papel: "quem", linha: "viu a morte de perto e decidiu não ir" }] },
    { id: "curado_as_escuras",
      quando: ["algum", ["escolheu", "cura", "pagar"], ["escolheu", "cura", "roubar"]],
      texto: "A erva funciona. A febre cede numa semana, e {quem} volta a comer, a rir, a praguejar. Mas há uma distância nova entre vocês, do tamanho de uma conversa que ficou por ter.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -5 }, { tipo: "quem_e", papel: "quem", linha: "voltou da febre, e não esquece a conversa que ficou por ter" }] },
    { id: "a_febre_fica", padrao: true,
      texto: "A febre não mata e não se vai embora. {quem} continua ao teu lado, com menos peso e menos palavras, e às vezes, de manhã, fica muito tempo a olhar para o lenço.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "quem_e", papel: "quem", linha: "anda com uma febre que vai e volta, e já não fala dela" }] },
    { id: "sem_quem_cure", cedo: true,
      quando: ["todos", ["morto", "papel:curandeira"], ["nenhum", ["etapa", "horto"]]],
      texto: "{curandeira} morreu antes de dizer onde nascia a erva. {quem} continua a tossir para o lenço, e já ninguém sabe ler a cor.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "carrega uma febre que mais ninguém sabe ler" }] },
    { id: "antes_da_febre", cedo: true,
      quando: ["morto", "papel:quem"],
      texto: "Não foi a febre. Foi a estrada, como quase sempre. Fica-te o lenço dobrado no bolso de {quem}, e a pergunta de quanto tempo teria havido.",
      efeitos: [] },
    { id: "a_ultima_febre",
      quando: ["todos", ["escolheu", "cura", "esperar"], ["algum", ["escolheu", "segredo", "calar"], ["nenhum", ["afeicao", "papel:quem", 3]]]],
      texto: "A febre volta numa madrugada e não se vai embora. {quem} morre ao terceiro dia, de mão dada contigo, e pergunta-te, já sem voz, se havia alguma coisa a fazer. Não sabes o que responder, porque havia.",
      efeitos: [{ tipo: "morte", papel: "quem" }] },
  ],
  abandono: { semAvancar: 15, desfecho: "a_febre_fica" },
});

/* A FÉ (tipo 2): quem anda com o herói jurou num altar nunca mais
   sangrar ninguém, e quem perdeu um irmão às mãos dessa pessoa vem a
   caminho. Honrar o voto, quebrá-lo, ou comprar quem o desfaça — e,
   quando a faca chegar, ouvir, lutar, ou fugir. Do melhor (a verdade
   dita, as mãos limpas) ao pior (fugir, e deixar quem não ergue a lâmina
   sozinho na estrada). A ponte: o altar de {templo} já aceitou o ouro do
   vilão, e o perdão de lá tem preço (a reviravolta). */
const A_LAMINA_ENTERRADA = quest({
  id: "a_lamina_enterrada",
  titulo: "A Lâmina Enterrada",
  tipo: 2,
  quando: ["cedo", "meio", "fim"],
  afim: [],
  papeis: {
    quem: { de: "grupo", ou: "elo", rotulo: "quem anda contigo" },
    vingador: { de: "elenco", perdeu: "um irmão", rotulo: "quem perdeu um irmão" },
    templo: { de: "lugar", cidade: "uma cidade dos atos 2 ou 3" },
    sacerdote: { de: "elenco", do: "templo", rotulo: "quem guarda {templo}" },
  },
  mao: null,
  ponte: "{sacerdote} guarda o altar de {templo}, numa cidade por onde um passo do vilão vai passar, e já aceitou o ouro de quem manda nele",
  pede: [],
  deixa: [],
  gancho: "{quem} não puxa da lâmina. Nem quando devia, nem quando gritaste. Há muitos anos matou alguém que não merecia morrer e jurou, diante do altar de {templo}, que a sua mão não voltaria a sangrar ninguém. Agora {vingador}, que perdeu um irmão nessa noite, anda de terra em terra a perguntar por {quem} — e um voto não trava uma faca.",
  etapas: [
    { id: "sinal", texto: "Perguntar a {quem} porque não luta",
      espera: 2, acende: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 1]],
      conclui: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 2], ["conversou", "papel:quem", 2]] },
    { id: "voto", texto: "Decidir o que vale o voto de {quem}",
      conclui: ["algum", ["escolheu", "voto", "honrar"], ["escolheu", "voto", "quebrar"], ["escolheu", "voto", "absolver"]],
      ramos: ["honrar", "quebrar", "absolver"] },
    { id: "vingador", texto: "Encontrar {vingador} antes que encontre {quem}",
      ancora: { tipo: 1, concluidas: 1 },
      conclui: ["todos", ["conheceu", "papel:vingador"], ["conversou", "papel:vingador"]] },
    { id: "conta", texto: "Acertar a conta de {quem} com {vingador}",
      conclui: ["algum", ["derrotou", "papel:vingador"], ["escolheu", "conta", "ouvir"], ["escolheu", "conta", "afastar"]],
      ramos: ["luta", "ouvir", "afastar"] },
  ],
  escolhas: {
    voto: { etapa: "voto", opcoes: {
      honrar: {
        texto: "honrar o voto de {quem}, e lutar no seu lugar",
        ganha: "{quem} guarda as mãos limpas, e sabe que há alguém que não lhe pede o que jurou não dar.",
        custa: "Quando a lâmina vier, vem para os dois — e só um de vocês a vai erguer.",
        efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }],
      },
      quebrar: {
        texto: "pedir a {quem} que puxe da lâmina quando chegar a hora",
        ganha: "Quando {vingador} chegar, vai encontrar duas lâminas, e não uma.",
        custa: "Um voto partido não se cola. {quem} pode viver por isso — e deixar de rezar por isso também.",
        efeitos: [{ tipo: "vinculo", papel: "quem", n: -5 }],
      },
      absolver: {
        texto: "levar {quem} a {templo}, para que o altar desfaça o voto",
        ganha: "Se o altar que ouviu o voto o desfizer, ninguém pode chamar perjúrio ao que vier depois.",
        custa: "Um perdão tem sempre alguém que o vende. E {templo} fica longe, e {vingador} não espera por ninguém.",
        efeitos: [],
      },
    } },
    conta: { etapa: "conta", opcoes: {
      ouvir: {
        texto: "pôr {vingador} a ouvir o que {quem} tem a dizer daquela noite",
        ganha: "A verdade daquela noite sai, por fim, da boca de quem a carregou. {vingador} pode não perdoar — mas vai ouvir.",
        custa: "{quem} vai dizer em voz alta o pior que já fez, à frente de quem lhe tem mais ódio no mundo, e diante de ti.",
        efeitos: [],
      },
      afastar: {
        texto: "tirar {quem} do caminho de {vingador}, e fugir",
        ganha: "Hoje ninguém sangra: põem estrada entre vocês e a faca.",
        custa: "{vingador} não desiste, e {quem} não foge duas vezes. Se se encontrarem sem ti, {quem} não ergue a lâmina — e sabes bem o que isso quer dizer.",
        efeitos: [{ tipo: "dia", n: 1 }],
      },
    } },
  },
  solucoes: {
    voto: {
      honrar: [{ texto: "{quem} não te agradece. Pousa a mão no teu ombro, uma vez, e deixa-a lá mais tempo do que costuma." }],
      quebrar: [{ texto: "{quem} ouve-te até ao fim. Depois desembrulha a lâmina, devagar, como quem desenterra um morto, e passa a noite a afiá-la sem dizer nada." }],
      absolver: [{ texto: "{quem} aceita sem discutir, e é isso que te assusta: há quem esteja à espera de licença para deixar de ser quem é." }],
    },
    conta: {
      luta: [{ texto: "Acaba depressa, como acabam as coisas que demoraram anos a chegar. {vingador} fica no chão, e {quem} olha para ti com as mãos limpas e a cara de quem as queria sujas." }],
      ouvir: [{ texto: "{quem} fala sem parar durante uma hora. {vingador} não interrompe uma única vez, e no fim guarda a faca sem pressa, como quem guarda uma coisa que já não serve." }],
      afastar: [{ texto: "Saem antes do amanhecer, por um caminho de cabras. {quem} não olha para trás. Tu olhas, e vês ao longe uma fogueira que não estava lá ontem." }],
    },
  },
  reviravoltas: [
    { id: "o_altar_primeiro",
      texto: "Para desfazer um voto, diz-se, é preciso voltar ao altar onde se fez — e com quem o fez.",
      gatilho: ["escolheu", "voto", "absolver"],
      efeitos: [{ tipo: "abre_etapa", antes: "vingador", etapa: {
        id: "altar", texto: "Levar {quem} ao altar de {templo}",
        conclui: ["todos", ["esteve", "lugar:templo"], ["acompanha", "papel:quem"], ["conversou", "papel:sacerdote"]] } }] },
    { id: "o_perdao_a_peso",
      texto: "Fazes perguntas a mais a {sacerdote}, e a resposta vem numa gaveta: uma bolsa de couro cheia, com um nó que já viste noutros sítios. O perdão de {templo} tem preço, e quem o paga não é quem reza.",
      gatilho: ["todos", ["etapa", "altar"], ["consultou", "papel:sacerdote"], ["nenhum", ["etapa", "conta"]]],
      efeitos: [{ tipo: "quem_e", papel: "sacerdote", linha: "vende absolvições a quem paga, e paga a quem manda" }, { tipo: "deixa", premissa: "comprado:sacerdote" }] },
  ],
  desfechos: [
    { id: "a_mao_limpa",
      quando: ["todos", ["escolheu", "conta", "ouvir"], ["afeicao", "papel:quem", 3], ["nenhum", ["escolheu", "voto", "quebrar"]]],
      texto: "{vingador} ouve até ao fim e, no fim, estende a mão — não para perdoar, ainda, mas para fechar a conta. {quem} aperta-a com a mesma mão que jurou não voltar a sangrar ninguém, e cumpriu. Nessa noite, pela primeira vez, reza em voz alta.",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "vingador" }] },
    { id: "o_voto_guardado",
      quando: ["todos", ["escolheu", "voto", "honrar"], ["derrotou", "papel:vingador"]],
      texto: "Lutaste no lugar de {quem}, e {quem} não ergueu a lâmina. O voto ficou inteiro. O que não ficou inteiro foi a paz: {quem} sabe que alguém sangrou para que as suas mãos continuassem limpas.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 10 }, { tipo: "quem_e", papel: "quem", linha: "deve a vida a quem lutou no seu lugar" }] },
    { id: "a_paz_a_meias",
      quando: ["escolheu", "conta", "ouvir"],
      texto: "{vingador} ouve tudo e vai-se embora sem uma palavra. Não perdoa. Não volta. {quem} fica de pé muito tempo, no sítio onde a conversa acabou, como quem espera um golpe que não vem.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "disse em voz alta o pior que fez, e continua de pé" }] },
    { id: "a_lamina_desenterrada",
      quando: ["todos", ["escolheu", "voto", "quebrar"], ["algum", ["derrotou", "papel:vingador"], ["escolheu", "conta", "afastar"]]],
      texto: "{quem} ergueu a lâmina, e a lâmina lembrava-se do caminho. Ficaram vivos os dois que tinham de ficar. Mas {quem} deixou de rezar nessa noite, e quando lhe perguntas porquê, diz que não se fala com quem se mentiu.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -5 }, { tipo: "quem_e", papel: "quem", linha: "voltou a erguer a lâmina, e não reza desde então" }] },
    { id: "o_falso_perdao",
      quando: ["todos", ["escolheu", "voto", "absolver"], ["nenhum", ["escolheu", "conta", "afastar"]]],
      texto: "O altar desfez o voto, e {quem} voltou a usar a lâmina como quem volta a usar um sapato velho. Mas há uma coisa partida no sítio onde estava a fé, e às vezes {quem} pergunta-te, sem razão nenhuma, quanto custa um perdão.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -5 }, { tipo: "quem_e", papel: "quem", linha: "foi desligado do voto por um altar que se vende" }] },
    { id: "o_voto_pesa", padrao: true,
      texto: "A conta com {vingador} nunca se acertou — a estrada não deixou, ou outra mão chegou primeiro. {quem} continua sem puxar da lâmina, e já não diz porquê.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "quem_e", papel: "quem", linha: "não puxa da lâmina, e já não diz porquê" }] },
    { id: "o_voto_ate_ao_fim", cedo: true,
      quando: ["morto", "papel:quem"],
      texto: "{quem} morreu sem voltar a erguer a lâmina. Cumpriu o voto até ao fim, e o fim chegou mais cedo do que o voto.",
      efeitos: [] },
    { id: "o_martir",
      quando: ["todos", ["escolheu", "conta", "afastar"], ["nenhum", ["escolheu", "voto", "quebrar"]]],
      texto: "{vingador} encontrou {quem} numa estrada sem ti, ao terceiro dia. {quem} não ergueu a lâmina: ajoelhou-se e esperou, como quem cumpre a última parte de uma promessa. Quando chegaste, {vingador} já tinha ido embora, e {quem} tinha as mãos limpas e os olhos abertos para o céu.",
      efeitos: [{ tipo: "morte", papel: "quem" }] },
  ],
  abandono: { semAvancar: 15, desfecho: "o_voto_pesa" },
});

const congelarFundo = (o) => {
  if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(congelarFundo); }
  return o;
};
export const BIBLIOTECA_DE_QUESTS = congelarFundo([
  O_SALVO_CONDUTO, AS_CINZAS_DE_ONTEM, A_CARTA_QUE_NAO_SE_ABRE,
  /* o acervo, lote 2 (BQ8) */
  A_MAO_QUE_MUDOU_DE_LADO, O_CELEIRO_DE_INVERNO, O_CONVITE_SEM_SELO, O_CIMO_DA_ESCADA,
  OS_DIAS_QUE_FALTAM, A_LAMINA_ENTERRADA,
]);

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
    if (p.rotulo !== undefined && (typeof p.rotulo !== "string" || !p.rotulo.trim())) err(`o rótulo de «${nome}» não é texto`);
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
  for (const [nome, p] of Object.entries(papeis)) if (obj(p) && typeof p.rotulo === "string") textos.push([p.rotulo, `rótulo de ${nome}`]);
  /* BQ7 (08/11): o marcador de género, «{papel:dele|dela}» — só de gente */
  for (const [s, onde] of textos) {
    for (const m of s.matchAll(/\{([^}]*)\}/g)) {
      const g = RX_GENERO.exec(m[1]);
      const k = g ? g[1] : m[1];
      if (!decl[k]) err(`${onde}: o texto cita «{${m[1]}}», que não é papel`);
      else if (g && decl[k].tipo !== "pessoa") err(`${onde}: o género de «${k}» só se marca em gente`);
    }
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
    /* BQ7 (08/11): A REVIRAVOLTA LIDA — o dia em que o herói abriu o Diário e
       quantas reviravoltas tinham disparado até ali. Campo novo e aditivo:
       só viaja quando existe, e a versão antiga ignora-o. */
    ...(obj(R.vistaEm) ? { vistaEm: { dia: Math.max(0, inteiro(R.vistaEm.dia) || 0), n: Math.max(0, inteiro(R.vistaEm.n) || 0) } } : {}),
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
/* BQ7 (08/11): A CONCORDÂNCIA. «{quem:dele|dela}» é a forma de quem ocupa
   o papel: a segunda quando é mulher, a primeira quando é homem ou não se
   sabe (a forma em que o acervo foi escrito). O género vem com os nomes
   (vistaDosPapeis, na chave GENEROS — «#» não cabe num nome de papel). */
const GENEROS = "#generos";
const RX_GENERO = /^([a-z0-9_]+):([^|{}]*)\|([^{}]*)$/;
function encher(modelo, nomes) {
  const g = (nomes && nomes[GENEROS]) || {};
  return contrair(String(modelo || "")
    .replace(/\{([a-z0-9_]+):([^|{}]*)\|([^{}]*)\}/g, (m, k, ele, ela) => (g[k] === "f" ? ela : ele))
    .replace(/\{([a-z0-9_]+)\}/g, (m, k) => (nomes[k] != null ? nomes[k] : m)));
}
/* o género de quem ocupa um papel: o que o papel traz, o registo da gente,
   ou o grupo — "f", "m", ou "" (não se sabe) */
const semAcento = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
function generoDe(p, E) {
  const nome = typeof p.nome === "string" ? p.nome : "";
  const npcs = obj(obj(E) && E.npcs) || {};
  const npc = nome ? (obj(npcs[nome]) || Object.values(npcs).find((n) => obj(n) && semAcento(n.nome) === semAcento(nome)) || null) : null;
  const membro = nome ? arr(obj(obj(E) && E.personagem) && E.personagem.grupo).find((m) => obj(m) && semAcento(m.nome) === semAcento(nome)) || null : null;
  const t = [p.genero, npc && npc.genero, membro && (membro.genero || membro.genero_pessoa)].map(semAcento).find(Boolean) || "";
  return /^(f|mulher|femin|ela)/.test(t) ? "f" : t ? "m" : "";
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
  const generos = {};
  for (const nome of Object.keys(decl)) {
    const p = crus[nome];
    nomes[nome] = p.nome || PAPEIS_DA_CONDICAO[PREFIXO_DO_TIPO[p.tipo]].semNome;
    if (p.tipo === "pessoa") generos[nome] = generoDe(p, E);
  }
  nomes[GENEROS] = generos;
  const vistos = { ...crus };
  for (const nome of Object.keys(decl)) {
    const al = decl[nome].alcunha;
    if (typeof al !== "string") continue;
    /* BQ7 (08/11): QUEM AINDA NÃO TEM ID NÃO FOI VISTO. O tenente que o
       esqueleto põe numa quest de um mundo novo não está no registo da
       gente quando ela abre — e sem id saltava a alcunha, e o nome dele ia
       ao gancho, ao Diário e à pauta antes de o herói o ver (o «nome antes
       do rosto» que a BQ5 veta). Sem id é a alcunha; o id chega quando ele
       entra no registo, e o nome quando o herói o conhece. */
    const viu = !!crus[nome].id && avaliarCondicao(["conheceu", `papel:${nome}`], { estado: E, papeis: { [nome]: crus[nome] }, mundo });
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

/* ---------------- A GRAVIDADE DE UMA ESCOLHA (08/11, BQ7 — a forma do desenho) ----------------
   O que a carta da encruzilhada mostra de cada opção (mente/formas.md
   «## BQ · as quests na tela», §BQ 2): a mais grave das quatro, por esta
   ordem — `vida` (a opção está afirmada no `quando` de um desfecho com
   `morte` de alguém do grupo), `fecha` (a solução dessa opção acaba a
   quest), `preco` (custa moedas) e `leve`. `contexto`: o teto da frase
   que diz o que está em jogo (a primeira frase da reviravolta que abriu a
   etapa da escolha, ou a frase da etapa). */
export const GRAVIDADE_DA_ESCOLHA = Object.freeze({
  ordem: Object.freeze(["vida", "fecha", "preco", "leve"]),
  contexto: 200,
});
/* a primeira frase de um texto de mundo (a régua do «como foi») */
const primeiraFrase = (s, n = GRAVIDADE_DA_ESCOLHA.contexto) => {
  const t0 = String(s || "").replace(/\s+/g, " ").trim();
  const m = /^.+?[.!?…](?=\s|$)/.exec(t0);
  const f = m ? m[0] : t0;
  return f.length <= n ? f : f.slice(0, n).replace(/\s+\S*$/, "") + "…";
};
/* o ramo de uma etapa que uma opção de escolha fecha: o do «algum» onde
   `escolheu chave opcao` está afirmado */
function ramoDaOpcao(etapa, chave, op) {
  if (!etapa || !Array.isArray(etapa.ramos) || !Array.isArray(etapa.conclui)) return null;
  const i = etapa.conclui.slice(1).findIndex((c) => atomos(c).some((a) => a.positivo && a.cond[0] === "escolheu" && a.cond[1] === chave && a.cond[2] === op));
  return i >= 0 ? etapa.ramos[i] : null;
}

/* ============================================================
   O VEREDITO ANTES DO CLIQUE — vereditoDaEscolha(ficha, registo, chave, contexto)
   → null | { chave, etapa, opcoes: [{ id, texto, ganha, custa, efeitos,
   custo, podeEscolher, gravidade, fecha, risco }], contexto }. Desde a BQ7
   (o desenho): `gravidade` (GRAVIDADE_DA_ESCOLHA), `fecha` (o fim que a
   solução da opção dá, ou null), `risco` ({ papel, quem, certo } quando a
   opção leva a um desfecho com morte; `certo` se, com o livro de hoje, é
   esse que ganha) e `contexto` (o que está em jogo). Os dois lados de cada opção, em mundo, e o
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
  const etapa = etapasDe(F, R).find((x) => x.id === e.etapa) || null;
  /* o contexto: a reviravolta que abriu esta etapa, se foi uma; senão a etapa */
  const abriu = R.reviravoltas.map((x) => arr(F.reviravoltas).find((r) => r.id === x.id)).find((r) => r && arr(r.efeitos).some((ef) => ef.tipo === "abre_etapa" && obj(ef.etapa) && ef.etapa.id === e.etapa));
  const oQueEstaEmJogo = abriu ? primeiraFrase(frase(abriu.texto, ctx.nomes)) : etapa ? frase(etapa.texto, ctx.nomes) : "";
  const G = GRAVIDADE_DA_ESCOLHA.ordem;
  return {
    chave, etapa: e.etapa, contexto: oQueEstaEmJogo,
    opcoes: Object.entries(e.opcoes).map(([id, o]) => {
      const custo = custoDe(o.efeitos);
      /* o mundo com esta opção escolhida: o que ela fecha e quem ela arrisca */
      const ctx2 = contextoDe(F, { ...R, escolhas: { ...R.escolhas, [chave]: { opcao: id, dia } } }, E, obj(k.mundo));
      const ramo = ramoDaOpcao(etapa, chave, id);
      const vs = ramo ? arr(((obj(F.solucoes) || {})[e.etapa] || {})[ramo]) : [];
      const variante = vs.find((x) => x.quando === undefined || avaliarCondicao(x.quando, ctx2)) || null;
      const fecha = variante && variante.fecha ? variante.fecha : null;
      let risco = null;
      const ds = arr(F.desfechos);
      const mortal = ds.find((d) => !d.padrao && arr(d.efeitos).some((x) => x.tipo === "morte")
        && atomos(d.quando).some((a) => a.positivo && a.cond[0] === "escolheu" && a.cond[1] === chave && a.cond[2] === id));
      if (mortal) {
        const papel = arr(mortal.efeitos).find((x) => x.tipo === "morte").papel;
        const ganha = ds.find((d) => !d.padrao && avaliarCondicao(d.quando, ctx2)) || null;
        risco = { papel, quem: ctx.nomes[papel] || "", certo: ganha === mortal };
      }
      const gravidade = risco ? G[0] : fecha ? G[1] : custo > 0 ? G[2] : G[3];
      return {
        id, texto: maiuscula(encher(o.texto, ctx.nomes)), ganha: frase(o.ganha, ctx.nomes), custa: frase(o.custa, ctx.nomes),
        efeitos: arr(o.efeitos).map((x) => ({ ...x })), custo, podeEscolher: custo <= bolsa,
        gravidade, fecha, risco,
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
       feitas    — [{ id, dia, ramo, variante, como }], pela ordem da quest
                   (`como`: a primeira frase da solução, BQ7),
       falta     — o «o que falta» em dados (julgarEtapa, BQ3), o que a
                   reviravolta exige primeiro; vazio com a quest fechada
                   ou escondida,
                   (o de um «ou» traz `caminhos`: [{ texto, predicados,
                   carta }], BQ7),
       faltaTexto — as frases de mundo do «o que falta»,
       gente     — [{ papel, id, nome, rotulo, traiu }], só quem o herói já
                   conheceu (BQ7),
       escolhas  — as chaves das escolhas abertas agora,
       reviravolta — a última que disparou: { id, dia, texto, lida } | null,
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
  /* BQ7 (08/11, a forma do desenho): A GENTE DESTA HISTÓRIA — só quem o
     herói já conheceu (o nome que ele sabe), com o rótulo do papel em frase
     de mundo, e `traiu` em quem uma reviravolta pôs no lugar de outro (a
     `troca_papel`: o guarda que se vendeu). Uma pessoa, uma entrada. */
  const traidores = new Set(R.reviravoltas.flatMap((x) => arr((arr(F.reviravoltas).find((r) => r.id === x.id) || {}).efeitos))
    .filter((ef) => ef.tipo === "troca_papel").map((ef) => ef.por));
  const crus = {};
  for (const [nome, d] of Object.entries(F.papeis)) crus[nome] = { ...(obj(R.papeis[nome]) || {}), tipo: PAPEIS_DA_QUEST[d.de].tipo };
  const gente = [];
  for (const [nome, d] of Object.entries(F.papeis)) {
    const p = crus[nome];
    if (p.tipo !== "pessoa" || !p.id || typeof p.nome !== "string" || !p.nome) continue;
    if (!avaliarCondicao(["conheceu", `papel:${nome}`], { estado: E, papeis: { [nome]: p }, mundo: obj(k.mundo) })) continue;
    const um = { papel: nome, id: p.id, nome: p.nome, rotulo: typeof d.rotulo === "string" ? frase(d.rotulo, ctx.nomes) : "", traiu: traidores.has(nome) };
    const i = gente.findIndex((g) => g.id === um.id);
    if (i < 0) gente.push(um); else if (um.traiu && !gente[i].traiu) gente[i] = um;
  }
  /* o «o que falta» de um «ou», caminho a caminho: o texto, os predicados e
     se é uma carta de uma escolha (o Diário mostra primeiro as cartas) */
  const comCaminhos = falta.map((f) => (f && f.predicado === "algum" && Array.isArray(f.opcoes)
    ? { ...f, caminhos: f.opcoes.map((l) => ({ texto: arr(l).map((x) => x && x.texto).filter(Boolean).join(" e "), predicados: arr(l).map((x) => x && x.predicado), carta: arr(l).some((x) => x && x.predicado === "escolheu") })) }
    : f));
  return {
    id: F.id, tipo: F.tipo, titulo: F.titulo,
    estado: R.estado, concluida: R.estado === "concluida", motivo: R.motivo,
    visivel: !!visivel,
    gancho: visivel ? frase(F.gancho, ctx.nomes) : "",
    etapa: atual ? atual.id : null,
    etapaTexto: atual && visivel ? frase(atual.texto, ctx.nomes) : "",
    acesa,
    /* `como` (08/11, BQ7): a primeira frase da solução que fechou a etapa,
       quando ela fechou por um ramo — o «Caminhos da etapa · tomado» */
    feitas: lista.filter((e) => R.feitas[e.id]).map((e) => {
      const f = R.feitas[e.id];
      const c = f && f.ramo ? R.consequencias.find((x) => x.de === `${e.id}:${f.ramo}`) : null;
      return { id: e.id, ...f, como: c && c.texto ? primeiraFrase(c.texto) : "" };
    }),
    falta: comCaminhos,
    faltaTexto: falta.map((f) => f.texto).filter(Boolean),
    gente,
    escolhas: visivel ? escolhasAbertas(F, R, ctx, dia, k.quests) : [],
    /* `lida` (08/11, BQ7): o herói já abriu o Diário depois dela (`vistaEm`) */
    reviravolta: ult && rv ? { id: ult.id, dia: ult.dia, texto: (R.consequencias.find((c) => c.de === `reviravolta:${ult.id}`) || {}).texto || "", lida: !!(R.vistaEm && R.vistaEm.n >= R.reviravoltas.length) } : null,
    desfecho: R.desfecho, ordem,
    fecho: R.fecho,
    consequencias: R.consequencias,
    mao,
  };
}

/* ============================================================
   A PROJEÇÃO NO DIÁRIO — missaoDaQuest(ficha, registo, contexto)
   (08/11/2026, Fase BQ · BQ7)
   → null | uma missão na forma de `missoes.js` (a que o Diário já mostra:
   o índice, o próximo passo, as etapas feitas), feita do registo AVANÇADO.
   A quest continua a ser a verdade: a projeção não se guarda em lado
   nenhum (o `missoes` do save não a leva), refaz-se de cada vez, e cada
   etapa dela é do tipo `quest` (missoes.js), que LÊ o registo pela chave.
   O tipo 2 escondido (a primeira etapa ainda não acendeu) não se projeta:
   a história do coração aparece quando começa, não antes.
   As etapas levam a frase de mundo com os nomes que o herói já sabe (a
   alcunha de quem é do vilão e ele não viu); a de agora leva o «o que
   falta» em `rotulo`, que é o próximo passo do Diário. As que vêm depois
   vão também — o Diário conta-as e não as diz (a silhueta, lei de v9.27).
   MISSAO_DA_QUEST: o prefixo do id (é por ele que a tela sabe que a
   missão é uma quest), o tipo de missão de cada tipo de quest, e o estado
   da missão de cada estado do registo.
   ============================================================ */
export const MISSAO_DA_QUEST = Object.freeze({
  prefixo: "quest:",
  tipo: Object.freeze({ 1: "principal", 2: "trama" }),
  status: Object.freeze({ aberta: "ativa", concluida: "concluida", falhada: "falhada", terminada: "concluida" }),
  juntaFalta: "; ",
});
export function missaoDaQuest(ficha, registo, contexto) {
  const F = fichaDe(ficha);
  if (!F || !validarQuest(F).ok) return null;
  const R = avancarQuest(F, registo, contexto);
  if (!R) return null;
  const k = obj(contexto) || {};
  const E = obj(k.estado) || {};
  const ctx = contextoDe(F, R, E, obj(k.mundo));
  const dia = Math.max(diaDe(E), R.inicio);
  const lista = etapasDe(F, R);
  const primeira = lista[0];
  const visivel = F.tipo === 1 || (primeira && R.acesas[primeira.id] != null);
  if (!visivel) return null;
  const atual = R.estado === "aberta" ? etapaAtual(lista, R) : null;
  let falta = [];
  if (atual && estaAcesa(atual, R, ctx, dia, k.quests)) {
    const exige = atual.exige.flatMap((c) => julgarEtapa({ conclui: c }, ctx).falta);
    falta = [...exige, ...(exige.length ? [] : julgarEtapa({ conclui: atual.conclui }, ctx).falta)];
  }
  const M = MISSAO_DA_QUEST;
  return {
    id: `${M.prefixo}${F.id}`,
    titulo: F.titulo,
    tipo: M.tipo[F.tipo],
    descricao: frase(F.gancho, ctx.nomes),
    dador: "",
    status: M.status[R.estado] || "ativa",
    etapas: lista.map((e) => {
      const feita = obj(R.feitas[e.id]);
      return {
        tipo: "quest",
        alvo: frase(e.texto, ctx.nomes),
        chave: `${F.id}:${e.id}`,
        feito: !!feita,
        ...(feita && Number.isInteger(feita.dia) ? { feitoEm: feita.dia } : {}),
        ...(atual && e.id === atual.id ? { rotulo: falta.map((f) => f.texto).filter(Boolean).join(M.juntaFalta) } : {}),
      };
    }),
    criadaEm: R.inicio,
    nivel: 0,
    prazo: 0,
    recompensa: null,
  };
}
