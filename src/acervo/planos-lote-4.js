/* ============================================================
   OS PLANOS, LOTE 4 — o General Sem Guerra, o Santo Vivo, a Criança
   Antiga e o Arquiteto (09/11/2026, Fase BQ · BQ8)

   A pessoa, 09/11: «termine o acervo» — vinte arquétipos com plano. Este
   lote leva-os de 12 a 16. A partir daqui, CADA LOTE DE PLANOS VIVE NO SEU
   FICHEIRO (src/acervo/planos-lote-N.js), e `plano-do-vilao.js` junta-os
   às suas tabelas (PLANOS_DO_ARQUETIPO, FRAQUEZAS, AFINIDADE_DO_ANTECEDENTE)
   sem mudar uma função. Os lotes 1 a 3 ficam onde estavam.

   UM LOTE NÃO IMPORTA NADA. O vocabulário (as mãos, os efeitos do plano,
   as famílias da fraqueza, os antecedentes) está em `plano-do-vilao.js` e
   em `biblioteca-de-quests.js`, que importam o lote e o provam
   (teste-plano-do-vilao). Importar uma delas daqui seria um ciclo.

   A FORMA DE UM LOTE (lida por `plano-do-vilao.js`):
     planos     — { arquetipo: [seis passos] }; cada passo com os campos de
                  PLANOS_DO_ARQUETIPO (diz, presagio, obra, seTravado,
                  contra, muda, custa, prazo). O `contra` segue o molde dos
                  lotes 2 e 3 (o 1 e o 2 pelo tenente e pelo recurso, o 3
                  pela consequência, a pista e o tenente, o 4 pela pista e
                  pelo recurso, o 5 pelo rosto, o 6 só pelo confronto), para
                  que toda quest do catálogo caiba no passo que contesta;
     fraquezas  — { pessoa, coisa, verdade }: uma por arquétipo em cada
                  família; a coisa traz o `nome` (é por ele que `tem` a acha);
     afinidade  — { antecedente: { arquetipo: peso } }, que se SOMA à da
                  tabela: o passado do herói que atrai cada vilão novo.

   A VOZ (a mesma régua da suíte): nenhuma linha de presságio, obra ou
   desvio tem dono, diz «vilão», «inimigo», «plano» ou «sistema», ou põe o
   nome do herói na boca dele — sente-se antes de se ver. E o que ele quer
   (`quer`, vilao.js) nunca é já um dos passos: o plano só se lê na guerra.
   ============================================================ */
const passo = (diz, presagio, obra, seTravado, contra, muda, custa, prazo) =>
  ({ diz, presagio, obra, seTravado, contra, muda, custa, prazo });

export const PLANOS_LOTE_4 = {
  planos: {
    general_sem_guerra: [
      passo("fabricar o primeiro incidente na fronteira",
        "as sentinelas da fronteira contam fogueiras do outro lado que ninguém do outro lado acendeu",
        "uma patrulha voltou da fronteira com dois mortos e uma flecha de penas estrangeiras, que ninguém por lá usa",
        "a flecha é reconhecida antes do enterro, e aparece outra, mais bem feita",
        ["tenente", "recurso"], ["perigo", "relogio"], "lugar", 1),
      passo("recrutar os veteranos que a paz deixou sem nada",
        "velhos soldados bebem de graça nas tabernas, e quem paga fala de honra a cada copo",
        "os veteranos da região voltaram a vestir couro, e marcham de madrugada para um campo que não está em mapa nenhum",
        "metade dos veteranos fica em casa, e aos outros promete-se o soldo a dobrar",
        ["tenente", "recurso"], ["relacao", "estrada"], "gente", 1),
      passo("queimar uma aldeia com as cores do outro lado",
        "cosem-se bandeiras estrangeiras numa oficina onde ninguém fala a língua delas",
        "uma aldeia da fronteira ardeu sob bandeiras do outro lado, e os sobreviventes juram pelas cores que viram",
        "o fogo não pega à aldeia inteira, e uma testemunha viu as bandeiras saírem de um saco",
        ["consequencia", "pista", "tenente"], ["base", "cativeiro"], "gente", 1.2),
      passo("fazer o conselho votar a mobilização",
        "os pregoeiros gritam os nomes dos mortos da aldeia três vezes ao dia, sempre à mesma hora",
        "o conselho votou a mobilização por aclamação, e os rapazes da região têm até à lua nova para se apresentar",
        "o conselho adia o voto uma semana, e nessa semana ardem mais duas casas",
        ["pista", "recurso"], ["porta", "postura"], "voz", 1),
      passo("pôr-me à frente da tropa para eu escolher de que lado marcho",
        "há uma farda à minha medida pendurada à porta da estalagem onde dormi, com uma insígnia de oficial",
        "estive diante de uma tropa inteira em parada, e quem a comanda ofereceu-me um posto à direita",
        "a parada dispersa-se com a chuva, e a farda fica dobrada à minha porta, à espera",
        ["rosto", "tenente"], ["postura"], "esperanca", 1.3),
      passo("atravessar a fronteira com a tropa toda",
        "a estrada da fronteira enche-se de carroças vazias, à espera do que vão trazer de volta",
        "a tropa atravessou a fronteira, e a guerra que ninguém pediu começou numa madrugada de nevoeiro",
        "a tropa chega à fronteira e não atravessa: os veteranos olham uns para os outros e voltam para casa",
        ["confronto"], ["postura", "relogio", "base"], "tudo", 1.5),
    ],
    santo_vivo: [
      passo("fazer o primeiro milagre na praça",
        "fala-se de um aleijado que voltou a andar numa praça, mas ninguém sabe dizer qual",
        "um aleijado andou na praça à frente de cem pessoas, e as cem já contaram a mil",
        "alguém reconhece o aleijado de outra cidade, onde andava muito bem, e o milagre muda de praça",
        ["tenente", "recurso"], ["postura", "relacao"], "voz", 1),
      passo("pôr esmola com condições em cada porta",
        "a esmola chega embrulhada em pano branco, e o pano traz bordada uma oração que ninguém conhecia",
        "metade da vila come da esmola, e quem come reza a oração nova antes de comer",
        "a vila aceita o pão e recusa a oração, e o pão começa a vir menos",
        ["tenente", "recurso"], ["relacao", "porta"], "gente", 1),
      passo("fazer cair em desgraça quem cura sem a bênção certa",
        "conta-se em voz baixa que os remédios da curandeira velha andam a matar mais do que a curar",
        "a curandeira velha foi corrida da vila à pedrada, e os doentes dela esperam agora noutra fila",
        "a curandeira esconde-se em casa de quem curou, e começa a correr que é bruxa",
        ["consequencia", "pista", "tenente"], ["base", "cativeiro"], "gente", 1.2),
      passo("fechar os templos que rezam de outra maneira",
        "os sinos dos templos pequenos tocam fora de horas, e ninguém admite tê-los tocado",
        "os templos pequenos da região fecharam as portas, e os sacerdotes deles pregam numa praça onde ninguém os ouve",
        "um templo fica aberto, e enche-se como nunca se tinha enchido",
        ["pista", "recurso"], ["porta", "postura"], "lugar", 1),
      passo("curar à minha frente alguém que eu amo",
        "alguém que viaja comigo acorda a sonhar com uma mão quente na testa, e não quer dizer de quem era",
        "estive diante de uma cura de mãos nuas, em quem eu não conseguia curar, e toda a praça viu",
        "a cura não pega, e diz-se à praça que foi a minha falta de fé que a impediu",
        ["rosto", "tenente"], ["postura"], "esperanca", 1.3),
      passo("ser aclamado a única voz do divino na região",
        "nas casas penduram-se retratos de um rosto de olhos fechados, onde antes havia ícones",
        "a região aclamou uma voz só para o divino, e quem reza a outro reza escondido",
        "a aclamação falha numa praça cheia, e alguém grita a pergunta que ninguém fazia",
        ["confronto"], ["porta", "postura", "base"], "tudo", 1.5),
    ],
    crianca_antiga: [
      passo("pôr as crianças a cantar a cantiga velha",
        "as crianças da vila cantam uma cantiga que nenhum adulto lhes ensinou, e calam-se quando alguém pergunta",
        "todas as crianças da região cantam a mesma cantiga ao deitar, e as mães já não conseguem fazê-las parar",
        "uma criança esquece a letra, e numa noite a cantiga muda",
        ["tenente", "recurso"], ["postura", "relogio"], "gente", 1),
      passo("fazer os poços adoçar",
        "a água dos poços sabe a mel de manhã cedo, e quem a bebe sonha com o mesmo campo",
        "os poços da região adoçaram, e quem bebe deles deixa de querer outra água",
        "um poço fica amargo, e aparece tapado na manhã seguinte",
        ["tenente", "recurso"], ["relacao", "estrada"], "lugar", 1),
      passo("levar quem não canta para o santuário velho",
        "os bichos deixam de entrar no santuário velho, e à noite há luzes lá dentro",
        "três famílias que não deixaram os filhos cantar sumiram numa noite, e o santuário velho tem portas novas",
        "uma das famílias foge a tempo, e conta o que viu a quem quiser ouvir",
        ["consequencia", "pista", "tenente"], ["cativeiro", "base"], "gente", 1.2),
      passo("vestir de branco a criança escolhida",
        "uma criança da região deixou de envelhecer, e às vezes fala com a voz de uma velha",
        "há uma criança no santuário vestida de branco, e os adultos ajoelham-se quando passa",
        "a criança adoece, e o santuário começa a procurar outra",
        ["pista", "recurso"], ["cativeiro", "postura"], "gente", 1),
      passo("falar-me pela boca de alguém que eu amo",
        "alguém que viaja comigo cantarola a cantiga enquanto dorme",
        "estive diante de alguém que eu amo, e foi outra voz que me falou por aquela boca, velha e paciente",
        "a voz cala-se a meio da frase, e quem eu amo acorda sem se lembrar de nada",
        ["rosto", "tenente"], ["postura"], "esperanca", 1.3),
      passo("pôr a região de joelhos no santuário velho",
        "não há casa na região onde não se cante a cantiga, nem velho que se lembre de outra",
        "a região inteira ajoelhou-se no santuário velho, e a criança de branco abriu uns olhos de velha",
        "a região fica de pé, e a cantiga, sem quem a cante, esquece-se numa geração",
        ["confronto"], ["postura", "cativeiro"], "tudo", 1.5),
    ],
    arquiteto: [
      passo("pôr a primeira peça onde ninguém a vê",
        "uma coincidência boa demais acontece em três cidades seguidas, sempre ao mesmo dia da semana",
        "três cidades acordaram com a mesma sorte no mesmo dia, e ninguém se pergunta quem a deu",
        "a terceira coincidência falha, e alguém começa a contar",
        ["tenente", "recurso"], ["relacao", "relogio"], "voz", 1),
      passo("comprar as estradas sem que ninguém saiba quem comprou",
        "os marcos das estradas aparecem mudados de sítio, um palmo de cada vez",
        "as estradas da região têm dono novo, e as portagens pagam-se a um nome que ninguém viu",
        "um marco volta ao sítio antigo, e aparecem dois mudados mais à frente",
        ["tenente", "recurso"], ["estrada", "base"], "lugar", 1),
      passo("deitar abaixo o que estava mal construído",
        "rachas finas aparecem nas paredes da ponte velha, todas da mesma largura",
        "a ponte velha caiu com gente em cima, e nas pedras caídas há marcas de cinzel recentes",
        "a ponte aguenta mais um inverno, e as marcas de cinzel são vistas por quem não devia",
        ["consequencia", "pista", "tenente"], ["base", "perigo"], "gente", 1.2),
      passo("pôr a mesma pessoa em dois sítios ao mesmo tempo",
        "contam-me de alguém que esteve em duas cidades na mesma noite, e as duas cidades têm testemunhas",
        "uma pessoa inocente foi condenada por dois crimes que não fez, em duas cidades, na mesma noite",
        "uma das testemunhas desmente-se, e o desenho fica com um buraco",
        ["pista", "recurso"], ["relacao", "porta"], "gente", 1),
      passo("mostrar-me o desenho inteiro, com o meu lugar marcado",
        "encontro na bolsa um papel dobrado com a planta da região, e um ponto a tinta onde estou agora",
        "estive diante de um mapa da região do tamanho de uma parede, e cada coisa que fiz desde que cheguei estava lá desenhada antes de a fazer",
        "o mapa arde antes de eu o ver inteiro, e o que vi chega para não dormir",
        ["rosto", "tenente"], ["postura"], "esperanca", 1.3),
      passo("fechar a região dentro do desenho",
        "toda a região sente, sem saber porquê, que alguma coisa está quase a acabar",
        "a região acordou numa ordem nova que ninguém votou, e tudo encaixa como se sempre tivesse estado ali",
        "o desenho fica por fechar, e começa a desfazer-se por onde foi menos cuidado",
        ["confronto"], ["postura", "base", "relogio"], "tudo", 1.5),
    ],
  },
  fraquezas: {
    pessoa: [
      { id: "p_desertor_poupado", o: "o desertor que ele poupou da forca na última guerra, e que sabe quem atirou primeiro", arquetipo: "general_sem_guerra" },
      { id: "p_primeiro_curado", o: "o primeiro aleijado que ele «curou», pago para continuar a andar, e que já não aguenta a mentira", arquetipo: "santo_vivo" },
      { id: "p_ultima_sacerdotisa", o: "a última sacerdotisa do santuário velho, que ainda sabe o nome verdadeiro dela e o diz sem medo", arquetipo: "crianca_antiga" },
      { id: "p_aprendiz_das_plantas", o: "o aprendiz que desenhou com ele as primeiras plantas, e que sabe onde está o erro de cálculo", arquetipo: "arquiteto" },
    ],
    coisa: [
      { id: "c_ordens_do_incidente", o: "as ordens do primeiro incidente, escritas e seladas pela mão dele", arquetipo: "general_sem_guerra", nome: "ordens seladas" },
      { id: "c_muleta_guardada", o: "a muleta do primeiro milagre, guardada no fundo da arca dele", arquetipo: "santo_vivo", nome: "muleta guardada" },
      { id: "c_osso_do_altar", o: "o osso do altar antigo, sem o qual nenhum corpo a aguenta", arquetipo: "crianca_antiga", nome: "osso do altar" },
      { id: "c_planta_mestra", o: "a planta-mestra, a única onde as nove peças estão todas", arquetipo: "arquiteto", nome: "planta-mestra" },
    ],
    verdade: [
      { id: "v_flechas_da_casa", o: "as flechas estrangeiras saem de uma forja da própria região, encomendadas e pagas por ele", arquetipo: "general_sem_guerra" },
      { id: "v_milagres_ensaiados", o: "os milagres são ensaiados: há uma cave onde os curados aprendem a cair e a levantar-se", arquetipo: "santo_vivo" },
      { id: "v_ultimo_verso", o: "o último verso da cantiga, que ninguém canta: o que diz como ela foi enterrada, e por quem", arquetipo: "crianca_antiga" },
      { id: "v_primeira_peca", o: "a primeira peça foi um crime: a casa que ele deitou abaixo para começar tinha gente dentro", arquetipo: "arquiteto" },
    ],
  },
  afinidade: {
    soldado: { general_sem_guerra: 3 },
    nobre_caido: { general_sem_guerra: 1 },
    acolito: { santo_vivo: 2 },
    pragado: { santo_vivo: 1 },
    ex_cultista: { crianca_antiga: 2 },
    erudito: { crianca_antiga: 1, arquiteto: 2 },
    artista: { arquiteto: 1 },
    orfao: { crianca_antiga: 1 },
  },
};
