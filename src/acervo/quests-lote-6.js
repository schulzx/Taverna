/* ============================================================
   O ACERVO, LOTE 6 — treze quests (nove do tipo 1, quatro do tipo 2)
   (08/11/2026, Fase BQ · BQ8)

   A pessoa: «termine o acervo». A planta pede 36 do tipo 1 e 16 do tipo 2
   (mente/plano-biblioteca-de-quests.md, §9). Este lote e o 5 foram escritos
   ao mesmo tempo, por duas mãos, cada um no seu ficheiro; o 5 ficou com o
   «cedo» e o «meio», este com o «meio» e o «fim» — o fim da campanha
   merece as escolhas mais pesadas.

   UM LOTE NÃO IMPORTA NADA (o cabeçalho do lote 4 diz porquê).

   O QUE ESTE LOTE FECHA (o esqueleto mediu, 08/11, com o catálogo de 27):
     · o passo 4 das espinhas de quatro atos ainda ficava por contestar em
       81 de 500 campanhas, e só O Enforcado de Amanhã o cobria (entrava em
       564 de 1000 — a quest mais repetida do catálogo). O Teu Nome na Parede
       (consequência e pista, 3 e 4, do meio) e Os Dados Dele (um rosto que
       é também pista, 4 e 5) cobrem-no pelos dois atos que o podem tocar;
     · o rosto e o confronto eram as cenas com menos quests por campanha
       (um ato cada, em todas as mil): quatro rostos e três confrontos.
       Chegam mais dois de cada — A Mesma Tempestade (o rosto que serve as
       duas naturezas: a trégua de um telhado), Os Dados Dele (a mesa, só de
       gente, e com a opção «aceitar» que reagirAoHeroi lê), A Nona Noite
       (o confronto de uma fera: um cerco, ao ar livre, com a dívida do
       pacto e a fraqueza nas três famílias) e O Último Barco (o confronto
       de gente, no convés);
     · o 3 e o 4 do «meio» com mãos novas: um tenente que se vira (O Posto
       do Capitão Morto), um recurso que é ferro e não papel (As Armas do
       Poço), e duas pistas — uma que é um engodo (O Recado Verdadeiro) e
       outra que entrega a fraqueza pelo papel (O Que a Ama Esqueceu).
   E quatro do coração com temas que o acervo não tinha: o orgulho, a
   herança envenenada, a vingança herdada e o regresso de quem se julgava
   morto.

   A voz pedida: «maravilhosas, provocantes e intensas». As fontes (a
   Grande Lista do Dungeon Geek 21 e a mesa do Matt Mercer), transformadas:
   o «Qualquer porto velho numa tempestade» com o vilão debaixo do mesmo
   telhado; a «Pontuação para o time da casa» numa mesa de dados viciados;
   o «Onças da Prevenção» como um recado que chega inteiro demais; o
   «Inverter vítimas e vilões» das reviravoltas quase universais no cerco
   (a fera cerca uma adega, não uma vila). Nos textos onde o vilão ou o
   servo podem ser um bicho, nenhum adjetivo nem pronome lhes dá género.
   ============================================================ */
const quest = (q) => q;

/* O ROSTO DE MESA, QUE É TAMBÉM PISTA (passos 4 e 5): o vilão joga dados
   numa taberna, e joga por gente. «Aceitar» a aposta dele é o pacto que o
   confronto pode cobrar (aliado), e a opção que reagirAoHeroi lê; jogar a
   sério é ouvi-lo falar a noite inteira (a camada da pista); virar a mesa é
   envergonhá-lo em público. Só gente: uma fera não lança dados. */
const OS_DADOS_DELE = quest({
  id: "os_dados_dele",
  titulo: "Os Dados Dele",
  tipo: 1,
  enredo: 29,                                   // «Pontuação para o time da casa»: a mesa é o campo
  quando: ["meio", "fim"],
  afim: ["misterio", "reinado"],
  papeis: {
    vilao: { de: "fio", papel: "vilao", aceita: ["gente"], alcunha: "quem ganha todas as noites em {taberna}", rotulo: "quem ganha todas as noites em {taberna}" },
    taberna: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["taverna", "arena", "mercado"] },
    perdedor: { de: "elenco", do: "taberna", rotulo: "quem perdeu tudo à mesa" },
    aposta: { de: "elenco", proximo: "perdedor", rotulo: "{aposta:o filho que foi a jogo|a filha que foi a jogo}" },
  },
  mao: { tipo: "rosto", contra: [4, 5], papel: "vilao", tambem: ["pista"] },
  pede: [],
  deixa: ["conhece:vilao"],
  gancho: "Há três noites que alguém ganha tudo em {taberna}. Não joga por moedas: joga por escrituras, por dívidas, por anos de serviço, e nunca se levanta antes de a outra cadeira ficar vazia. {perdedor} levantou-se da última sem casa e sem mais nada, e não diz o que pôs na mesa no fim. Esta manhã, o taberneiro achou um recado na cadeira vazia, com o teu nome por fora: «Joga-se esta noite. Traz o que quiseres perder.»",
  etapas: [
    { id: "perdedor", texto: "Ouvir {perdedor}", conclui: ["conversou", "papel:perdedor"] },
    { id: "mesa", texto: "Sentar-te à mesa de {vilao}, em {taberna}",
      conclui: ["todos", ["esta_em", "lugar:taberna"], ["conversou", "papel:vilao"]] },
    { id: "partida", texto: "Jogar a partida que {vilao} te propõe",
      conclui: ["algum", ["escolheu", "partida", "aceitar"], ["escolheu", "partida", "jogar"], ["escolheu", "partida", "virar"]],
      ramos: ["aceitar", "jogar", "virar"] },
    { id: "manha", texto: "Ver o que fica de {perdedor} quando a taberna fechar",
      conclui: ["todos", ["conversou", "papel:perdedor", 2], ["nenhum", ["esta_em", "lugar:taberna"]]] },
  ],
  escolhas: {
    partida: { etapa: "partida", opcoes: {
      aceitar: {
        texto: "aceitar a aposta dele: um favor teu, sem preço nem prazo, contra tudo o que {perdedor} perdeu",
        ganha: "{vilao} perde de propósito, devagar, para que vejas que é de propósito. {perdedor} recupera a casa, e {aposta} dorme em casa antes do amanhecer.",
        custa: "Ficas a dever um favor a quem manda nisto tudo, e ele diz-to a sorrir, a empurrar-te as fichas por cima da mesa: um dia vem cobrar, e nesse dia não vais poder dizer que não.",
        efeitos: [{ tipo: "aliado", papel: "vilao" }, { tipo: "deixa", premissa: "pacto:vilao" }],
      },
      jogar: {
        texto: "jogar a sério, com os dados dele, e não aceitar mais nada",
        ganha: "Jogam até de manhã, e enquanto joga, fala — do que quer, do que já tem, do que vem a seguir. Ganhes ou percas, levas da mesa mais do que moedas: a forma como pensa.",
        custa: "Também te vê jogar: onde arriscas, onde recuas, o que não aguentas perder. E {perdedor} só recupera o que tu ganhares — e tu não ganhas tudo.",
        efeitos: [{ tipo: "avisa_vilao" }, { tipo: "deixa", premissa: "estudou:vilao" }, { tipo: "afeicao", papel: "perdedor", n: -1 }],
      },
      virar: {
        texto: "virar a mesa à frente da taberna inteira e chamar-lhe batoteiro",
        ganha: "Os dados rolam pelo chão, à vista de todos, e caem do lado que não deviam cair. Ninguém paga uma dívida feita com dados assim: {perdedor} fica livre, e {aposta} também.",
        custa: "Quem é envergonhado em público não paga em moedas. {vilao} levanta-se, apanha os dados um a um, sem pressa, e diz o teu nome em voz alta, para que a taberna inteira o saiba. A partir de hoje, o que anda a fazer anda mais depressa.",
        efeitos: [{ tipo: "relogio_do_fio", n: 1 }, { tipo: "avisa_vilao" }, { tipo: "afeicao", papel: "perdedor", n: 1 }],
      },
    } },
  },
  solucoes: {
    partida: {
      aceitar: [{ texto: "Apertam as mãos por cima da mesa. A mão dele é quente e seca, e demora-se um pouco mais do que devia. Depois lança os dados, olha para eles, e diz «perdi» antes de pararem de rolar." }],
      jogar: [{ texto: "Jogam até as velas se apagarem e o taberneiro adormecer ao balcão. Ele fala como quem pensa alto, e tu ouves mais do que jogas. Quando se levanta, deixa-te os dados em cima da mesa: «Ficam contigo. Já sabes como caem.»" }],
      virar: [{ texto: "A mesa vai ao chão com um estrondo que acorda a rua. Os dados rolam até aos teus pés, e são três seis, e depois mais três seis. Ninguém na taberna respira. Ele sorri, como quem acabou de ganhar outra coisa." }],
    },
  },
  reviravoltas: [
    { id: "o_que_foi_a_jogo",
      texto: "{perdedor} diz por fim o que pôs na mesa na última mão, quando já não tinha mais nada: sete anos de serviço de {aposta}, assinados com a mão a tremer. Se a dívida não se desfizer até ao fim da semana, vêm buscar {aposta} — e quem vem buscar não diz para onde leva. Não jogas por {aposta} sem antes {aposta} saber que vais jogar.",
      gatilho: ["todos", ["etapa", "perdedor"], ["consultou", "papel:perdedor"], ["nenhum", ["etapa", "partida"]]],
      efeitos: [{ tipo: "exige", etapa: "partida", condicao: ["conversou", "papel:aposta"] }, { tipo: "quem_e", papel: "perdedor", linha: "pôs a jogo sete anos de serviço de quem mais ama" }] },
    { id: "os_dados_viciados",
      texto: "Os dados dele são viciados. E sabe que tu sabes: pousa-os à tua frente, com o seis para cima, e espera que digas alguma coisa. Não é batota. É uma pergunta — se jogas na mesma, sabendo.",
      gatilho: ["todos", ["etapa", "mesa"], ["descobriu", "lugar:taberna"], ["nenhum", ["etapa", "partida"]]],
      efeitos: [{ tipo: "deixa", premissa: "batota:vilao" }] },
    { id: "o_que_disse_a_mesa",
      texto: "Lá para o fim da noite, com a taberna vazia, {vilao} lança os dados sem olhar para eles e diz, como quem fala do tempo, o que vem a seguir: onde, e quando. Não te pede segredo. Ninguém acredita numa coisa ouvida a um batoteiro às quatro da manhã — e é por isso que a diz.",
      gatilho: ["escolheu", "partida", "jogar"],
      efeitos: [{ tipo: "deixa", premissa: "plano:vilao" }, { tipo: "relogio_do_fio", n: -1 }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:perdedor"], ["nenhum", ["derrotou", "papel:perdedor"]]], ate: "partida",
      texto: "Acharam {perdedor} de manhã no rio, com os bolsos cheios de pedras e a última ficha na mão fechada. A cadeira vazia de {taberna} ficou à tua espera, e ninguém mais se sentou nela." },
  ],
  abandono: { semAvancar: 3,
    texto: "Ninguém foi à mesa. Ao fim da semana vieram buscar {aposta}, de madrugada, e quem ganhava todas as noites já jogava noutra cidade.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }, { tipo: "situacao", papel: "aposta", situacao: "cativa" }] },
  fecho: {
    texto: "Viste-lhe a cara de perto, à luz de uma vela, uma noite inteira: como ri, como perde, como ganha. Já não é um nome. E sabe agora a tua cara, e a que distância da mesa te levantas.",
    efeitos: [{ tipo: "deixa", premissa: "conhece:vilao" }],
  },
});

/* O ROSTO DAS DUAS NATUREZAS (passo 5): a tempestade fecha as estradas, e o
   único telhado num dia de caminho é o mesmo para o herói e para o que lhe
   desfaz a terra. A lei velha do abrigo: debaixo dele ninguém sangra. O
   herói guarda a trégua, vigia a noite inteira, ou leva a criança com
   febre para a chuva. Nenhum texto dá género ao vilão: serve um bicho e
   uma pessoa. */
const A_MESMA_TEMPESTADE = quest({
  id: "a_mesma_tempestade",
  titulo: "A Mesma Tempestade",
  tipo: 1,
  enredo: 1,                                    // «Qualquer porto velho numa tempestade»
  quando: ["fim"],
  afim: ["jornada", "arquipelago"],
  papeis: {
    vilao: { de: "fio", papel: "vilao", aceita: ["gente", "fera"], alcunha: "o que entrou com a tempestade", rotulo: "o que entrou com a tempestade" },
    abrigo: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["taverna", "templo", "cemitério"] },
    estalajadeira: { de: "elenco", do: "abrigo", rotulo: "quem guarda o abrigo" },
    menino: { de: "elenco", proximo: "estalajadeira", rotulo: "{menino:o que arde em febre ao pé do lume|a que arde em febre ao pé do lume}" },
  },
  mao: { tipo: "rosto", contra: [5], papel: "vilao" },
  pede: [],
  deixa: ["conhece:vilao"],
  gancho: "A tempestade fechou as estradas há três dias, e o único telhado num dia de caminho é {abrigo}. Ao cair da noite, a porta abriu-se com o vento e entrou, com a chuva, {vilao}. Não atacou ninguém. Sacudiu a água, atravessou a sala devagar e deitou-se do outro lado do lume. {estalajadeira} pôs a tranca na porta, porque lá fora é pior. Até a tempestade passar, o telhado é o mesmo.",
  etapas: [
    { id: "abrigo", texto: "Chegar a {abrigo} antes da noite", conclui: ["esteve", "lugar:abrigo"] },
    { id: "lume", texto: "Partilhar o lume com {vilao}",
      conclui: ["todos", ["esta_em", "lugar:abrigo"], ["conheceu", "papel:vilao"]] },
    { id: "noite", texto: "Decidir o que fazes enquanto a tempestade dura",
      conclui: ["algum", ["escolheu", "noite", "guardar"], ["escolheu", "noite", "vigiar"], ["escolheu", "noite", "sair"]],
      ramos: ["guardar", "vigiar", "sair"] },
    { id: "manha", texto: "Ver o que fica de {abrigo} quando a tempestade passar",
      conclui: ["todos", ["conversou", "papel:estalajadeira", 2], ["nenhum", ["esta_em", "lugar:abrigo"]]] },
  ],
  escolhas: {
    noite: { etapa: "noite", opcoes: {
      guardar: {
        texto: "guardar a trégua do telhado e dormir do mesmo lado do lume",
        ganha: "Ninguém sangra debaixo deste telhado. De manhã, {vilao} vai-se antes de toda a gente, e deixa à porta uma coisa que só se deixa a quem se respeita.",
        custa: "Dormiste ao alcance de {vilao}, e agora sabe que consegues fechar os olhos à frente do inimigo — e tu sabes que também consegue. É mais difícil odiar o que se viu dormir. E a tempestade não para o relógio de ninguém.",
        efeitos: [{ tipo: "deixa", premissa: "tregua:vilao" }, { tipo: "relogio_do_fio", n: 1 }],
      },
      vigiar: {
        texto: "ficar acordado a noite inteira, de lâmina nos joelhos, a ver",
        ganha: "Vês tudo o que {vilao} é quando julga que ninguém vê: como respira, de que lado se deita, o que o acorda. Coisas que numa luta nunca verias.",
        custa: "Amanheces sem ter dormido, à beira de uma estrada longa, e {vilao} viu-te a ver. A trégua aguentou, mas por um fio — e {menino} passou a noite a olhar para a tua lâmina em vez de dormir.",
        efeitos: [{ tipo: "deixa", premissa: "estudou:vilao" }, { tipo: "avisa_vilao" }],
      },
      sair: {
        texto: "pegar em {menino} e sair para a tempestade, longe do lume",
        ganha: "{menino} não passa a noite ao alcance do que entrou com a chuva. Seja o que for que lá dentro aconteça, acontece sem vocês.",
        custa: "A tempestade não tem trégua nenhuma. Andas a noite toda à chuva com a febre de {menino} nos braços, e {vilao} fica com o lume e o telhado — e com a certeza de que lhe deixaste o sítio.",
        efeitos: [{ tipo: "situacao", papel: "menino", situacao: "ferida" }, { tipo: "dia", n: 1 }, { tipo: "afeicao", papel: "estalajadeira", n: -1 }],
      },
    } },
  },
  solucoes: {
    noite: {
      guardar: [{ texto: "Deitas-te do teu lado do lume e fechas os olhos. Durante muito tempo não dormes. Depois dormes. De manhã o lado de lá está vazio e ainda quente, e à porta, pousada na pedra, há uma coisa tua que tinhas perdido na estrada há uma semana." }],
      vigiar: [{ texto: "A noite é comprida. O lume baixa, tu pões mais lenha, e do outro lado dois olhos abrem-se de cada vez que a lenha estala. Nenhum dos dois dorme. Ao amanhecer, a tempestade cala-se de repente, e {vilao} levanta-se e sai sem olhar para trás." }],
      sair: [{ texto: "Sais com {menino} enrolado no teu manto e a chuva de lado, a doer. Passam a noite debaixo de uma ponte, encostados um ao outro. Lá ao longe, a janela de {abrigo} continua acesa até de manhã." }],
    },
  },
  reviravoltas: [
    { id: "a_lei_do_telhado",
      texto: "{estalajadeira} diz-te baixinho que não é a primeira vez. Há doze invernos, numa tempestade assim, dormiram debaixo deste telhado dois que se queriam mortos, e a lei do abrigo aguentou: aqui dentro ninguém derrama sangue. Quem a quebrou da vez antes dessa, ninguém lhe voltou a ver a cara em terra nenhuma.",
      gatilho: ["todos", ["etapa", "abrigo"], ["consultou", "papel:estalajadeira"], ["nenhum", ["etapa", "noite"]]],
      efeitos: [{ tipo: "quem_e", papel: "estalajadeira", linha: "guarda a lei velha do abrigo: debaixo do telhado ninguém sangra" }] },
    { id: "a_ferida_aberta",
      texto: "À luz do lume vês o que {vilao} esconde de lado: uma ferida funda, recente, que não fecha. Alguém chegou primeiro, antes da tempestade — e o que entrou pela porta não veio só fugir da chuva.",
      gatilho: ["todos", ["etapa", "lume"], ["descobriu", "lugar:abrigo"], ["nenhum", ["etapa", "noite"]]],
      efeitos: [{ tipo: "deixa", premissa: "ferido:vilao" }] },
    { id: "o_que_ronda_la_fora",
      texto: "A meio da noite, {vilao} levanta a cabeça de repente e olha para a porta, não para ti. Lá fora, por baixo do vento, há outra coisa a rondar as paredes, devagar. Fica assim até de manhã, de olhos na tranca. Há coisas de que até {vilao} se esconde.",
      gatilho: ["escolheu", "noite", "vigiar"],
      efeitos: [{ tipo: "relogio_regional", n: 1 }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:menino"], ["nenhum", ["derrotou", "papel:menino"]]], ate: "noite",
      texto: "A febre levou {menino} antes da meia-noite, ao pé do lume, sem que ninguém desse por isso a tempo. {vilao} foi o único que não dormiu: ficou a olhar para o corpo pequeno até de manhã, e saiu sem tocar em nada." },
  ],
  abandono: { semAvancar: 3,
    texto: "Ninguém foi a {abrigo}. Quando a tempestade passou, {estalajadeira} contou a quem quis ouvir que tinha dormido três noites debaixo do mesmo telhado que o fim de tudo isto — e que era mais pequeno do que se dizia.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "A tempestade passa, e as estradas abrem-se outra vez. Partilhaste o lume com o que andas a seguir, e sabes agora o som que faz a respirar. Nunca mais vai ser só um nome.",
    efeitos: [{ tipo: "deixa", premissa: "conhece:vilao" }],
  },
});

/* O CONFRONTO DE UMA FERA, AO AR LIVRE (passo 6): nove noites de cerco, e
   a vila vai pôr alguém do lado de fora ao amanhecer. O Inverter das
   reviravoltas quase universais: a fera não cerca a vila, cerca uma adega
   — lá dentro está uma cria, comprada a caçadores. A sentença tem as três
   que DESFECHOS_DO_VILAO lê; a dívida do pacto abre-se a quem lhe deu o
   que veio buscar (aliado); a fraqueza nas três famílias, como na Toca. */
const A_NONA_NOITE = quest({
  id: "a_nona_noite",
  titulo: "A Nona Noite",
  tipo: 1,
  enredo: 12,                                   // «A ajuda está a caminho»: o cerco, com o Inverter
  quando: ["fim"],
  afim: ["jornada", "reinado"],
  papeis: {
    vilao: { de: "fio", papel: "vilao", aceita: ["fera"], alcunha: "o que cerca {muralha}", rotulo: "o que cerca {muralha}" },
    muralha: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["quartel", "templo", "mercado"] },
    campo: { de: "lugar", vizinho: "muralha", tipos: ["cemitério", "arena", "mercado"] },
    ronda: { de: "fio", papel: "tenente", aceita: ["gente", "fera"], alcunha: "o que ronda as portas de {muralha}", rotulo: "o que ronda as portas de {muralha}" },
    oferenda: { de: "elenco", exige: ["vivo"], rotulo: "quem a vila vai pôr do lado de fora ao amanhecer" },
    alcaide: { de: "elenco", do: "muralha", rotulo: "quem manda nas portas" },
    fraqueza_quem: { de: "elenco", fraqueza: "pessoa", rotulo: "a voz a que {vilao} ainda obedece" },
    fraqueza_coisa: { de: "item", fraqueza: "coisa" },
    fraqueza_verdade: { de: "lugar", fraqueza: "verdade" },
  },
  mao: { tipo: "confronto", contra: [6], papel: "vilao" },
  pede: [],
  deixa: ["caiu:vilao"],
  gancho: "Há nove noites que {vilao} anda à volta de {muralha}. Não ataca as portas: espera. De dia dorme em {campo}, à vista das ameias, e de noite dá a volta às muralhas, devagar, e para diante de cada porta como quem bate. Os poços estão a secar, e a vila já decidiu: ao amanhecer abre a porta pequena e põe {oferenda} do lado de fora. {alcaide} diz que é só uma, e que depois acaba.",
  etapas: [
    { id: "portas", texto: "Entrar em {muralha} antes de fecharem as portas", conclui: ["esteve", "lugar:muralha"] },
    { id: "oferenda", texto: "Chegar a {oferenda} antes do amanhecer", conclui: ["conversou", "papel:oferenda"] },
    { id: "ronda", texto: "Passar por {ronda}, do lado de fora das muralhas",
      conclui: ["algum", ["derrotou", "papel:ronda"], ["todos", ["consultou", "papel:alcaide"], ["descobriu", "lugar:muralha"]]],
      ramos: ["luta", "poterna"] },
    { id: "frente", texto: "Pôr {vilao} com a cabeça no chão de {campo}",
      conclui: ["algum", ["derrotou", "papel:vilao"], ["escolheu", "prova", "expor"]],
      ramos: ["luta", "prova"] },
    { id: "sentenca", texto: "Decidir o que fica de {vilao}",
      conclui: ["algum", ["escolheu", "sentenca", "poupar"], ["escolheu", "sentenca", "acabar"], ["escolheu", "sentenca", "selar"]],
      ramos: ["poupar", "acabar", "selar"] },
  ],
  escolhas: {
    tributo: { etapa: "tributo", opcoes: {
      cumprir: {
        texto: "prometer-lhe o gado da vila todos os invernos, e abrir as portas em paz",
        ganha: "As portas abrem-se sem sangue, {oferenda} volta para casa pelo próprio pé, e {vilao} vai-se para a serra antes do meio-dia. Nenhuma vila tem de ver morrer nada.",
        custa: "Todos os invernos, enquanto houver vila, o melhor do gado vai à serra por uma estrada que ninguém mais pode usar. E {vilao} sabe que foste tu quem fez o preço — quando quiser mais, é a ti que o vem pedir.",
        efeitos: [{ tipo: "deixa", premissa: "pacto:vilao" }],
      },
      romper: {
        texto: "dizer que não, do alto da porta, e sair na mesma",
        ganha: "Ficas sem dívida nenhuma, e com o campo todo pela frente.",
        custa: "{vilao} responde antes de a porta se fechar, contra a madeira, com o corpo inteiro. A porta aguenta. {oferenda}, que estava encostada a ela do lado de dentro, não.",
        efeitos: [{ tipo: "situacao", papel: "oferenda", situacao: "ferida" }, { tipo: "rompe_laco", papel: "vilao" }],
      },
    } },
    prova: { etapa: "prova", opcoes: {
      expor: {
        texto: "pôr diante de {vilao}, em pleno campo, aquilo que ainda o verga",
        ganha: "{vilao} baixa a cabeça sem que uma lâmina se erga, à vista de toda a muralha, como baixava antes de ser isto.",
        custa: "Uma coisa destas só se usa uma vez. E o que baixou a cabeça diante de uma vila inteira não esquece quem a fez baixar.",
        efeitos: [{ tipo: "deixa", premissa: "humilhado:vilao" }],
      },
      guardar: {
        texto: "guardar o que trazes, e decidir à lâmina, no campo aberto",
        ganha: "Ninguém nas ameias vai dizer que venceste com truques: venceste à luz do dia, no chão que era de {vilao}.",
        custa: "Se a luta correr mal, cais em {campo} com a coisa que o vergava no bolso, à vista da vila que te viu sair.",
        efeitos: [],
      },
    } },
    sentenca: { etapa: "sentenca", opcoes: {
      poupar: {
        texto: "deixar {vilao} ir para a serra, e abrir-lhe caminho",
        ganha: "{vilao} levanta-se devagar, olha uma última vez para as muralhas, e vai-se pela estrada da serra. Ninguém lá dentro tem de ver morrer nada.",
        custa: "Vai-se ferido e vivo, e a serra é perto. Nove noites ensinaram-lhe o caminho até aqui, e o caminho de volta não se esquece de um lado nem do outro.",
        efeitos: [{ tipo: "deixa", premissa: "poupado:vilao" }],
      },
      acabar: {
        texto: "acabar com {vilao} ali, em {campo}, à vista das ameias",
        ganha: "As portas abrem-se de manhã, e as crianças saem a correr para os campos pela primeira vez em nove dias.",
        custa: "Matar o que já está no chão não se desfaz. E se havia razão para o cerco, morre contigo a saber qual era.",
        efeitos: [{ tipo: "deixa", premissa: "caiu:vilao" }],
      },
      selar: {
        texto: "levar {vilao} até à garganta da serra e deitar a encosta abaixo por cima",
        ganha: "Nem sangue diante das portas, nem fuga: a pedra fecha a garganta, e o que lá está fica do lado de lá para sempre.",
        custa: "Uma garganta fechada é uma estrada a menos para a vila, e uma serra mais pequena para quem lá vive. E o que fica por baixo da pedra ainda respira, por muito tempo.",
        efeitos: [{ tipo: "deixa", premissa: "selado:vilao" }],
      },
    } },
  },
  solucoes: {
    ronda: {
      luta: [
        { id: "poupou", quando: ["poupou", "papel:ronda"],
          texto: "{ronda} cai junto à muralha e não se volta a erguer, mas respira. Das ameias, a vila inteira vê que se pode sair." },
        { id: "matou", texto: "{ronda} fica onde caiu, à sombra da muralha, e lá em cima alguém começa a bater palmas e para logo, com medo do barulho." },
      ],
      poterna: [{ texto: "{alcaide} leva-te, de lanterna tapada, à poterna velha do lado do rio, emparedada desde a última guerra. Tiram-se três pedras. Sais do lado de lá de {ronda}, com o rio pelos joelhos, sem que nada te tenha ouvido." }],
    },
    tributo: {
      cumprir: [{ fecha: "concluida",
        texto: "Abrem-se as portas. O gado sai à frente, tocado por ninguém, e {vilao} vai atrás, sem olhar para as ameias. {oferenda} fica à porta pequena, de pé, a ver ir o que vinha buscar outra coisa. A vila respira. Só tu sabes o preço, e de quantos invernos é." }],
      romper: [{ texto: "Dizes que não, alto, para o campo. A resposta vem contra a porta com o peso de uma casa, e depois outra vez, e lá dentro alguém grita o nome de {oferenda}." }],
    },
    frente: {
      luta: [
        { id: "poupou", quando: ["poupou", "papel:vilao"],
          texto: "{vilao} cai de lado em {campo}, a arfar, e não se volta a erguer. Das muralhas, a vila inteira cala-se ao mesmo tempo. A lâmina está na tua mão, e a decisão também." },
        { id: "matou", fecha: "concluida",
          texto: "{vilao} cai, e o chão de {campo} estremece uma última vez. Das ameias não vem um grito: vem um silêncio tão grande que se ouve o rio do outro lado da vila.",
          efeitos: [{ tipo: "deixa", premissa: "caiu:vilao" }] },
      ],
      prova: [
        { id: "pessoa", quando: ["acompanha", "papel:fraqueza_quem"],
          texto: "{fraqueza_quem} atravessa o campo ao teu lado, sem armas, e chama {vilao} por um nome que ninguém usa há muitos anos. E {vilao}, do tamanho que tem, deita-se na erva como se deitava em pequeno." },
        { id: "coisa", quando: ["tem", "item:fraqueza_coisa"],
          texto: "Ergues {fraqueza_coisa} à luz da manhã, à vista das ameias, e {vilao} recua até ao fim do campo, a tremer, como recuava antes de ser grande demais para alguém." },
        { texto: "Dizes em voz alta, no meio do campo, o que fizeram a {vilao} antes de ser isto. Das muralhas ninguém percebe. {vilao} percebe. E deita-se, devagar, como quem se cansa de uma guerra muito velha." },
      ],
    },
    sentenca: {
      poupar: [{ texto: "Afastas-te. {vilao} levanta-se, devagar, e vai-se pela estrada da serra, a coxear. Lá em cima, nas ameias, ninguém diz nada até deixar de se ver." }],
      acabar: [{ texto: "Um golpe só. A vila abre as portas antes de limpares a lâmina, e os primeiros a sair são as crianças, que não percebem porque é que os pais choram." }],
      selar: [{ texto: "Leva o dia inteiro, e vinte braços, e todo o óleo da vila. Ao fim da tarde a encosta desce de uma vez, com um rugido que se ouve em três aldeias, e depois fica tudo quieto como uma serra." }],
    },
  },
  reviravoltas: [
    { id: "a_sorte_viciada",
      texto: "{alcaide} diz que foi à sorte. Não foi: o nome de {oferenda} estava em todos os papelinhos do chapéu. Foi quem se levantou no conselho a dizer que se devia sair e lutar — e a vila decidiu calá-lo de uma vez, com a desculpa do cerco.",
      gatilho: ["todos", ["etapa", "portas"], ["consultou", "papel:alcaide"], ["nenhum", ["etapa", "oferenda"]]],
      efeitos: [{ tipo: "quem_e", papel: "oferenda", linha: "pediu no conselho que se lutasse, e o nome saiu em todos os papelinhos da sorte" }] },
    { id: "a_cria_na_adega",
      texto: "{oferenda} sabe porque é que {vilao} não se vai embora, e diz-to de olhos secos: na adega de {alcaide} há uma jaula, e na jaula uma cria, comprada a caçadores na primavera para vender numa feira do sul. Não é a vila que {vilao} cerca há nove noites. É a adega.",
      gatilho: ["todos", ["etapa", "oferenda"], ["consultou", "papel:oferenda"], ["nenhum", ["etapa", "sentenca"]]],
      efeitos: [{ tipo: "quem_e", papel: "alcaide", linha: "tem na adega uma jaula com a cria do que cercou a vila" }, { tipo: "deixa", premissa: "cria:alcaide" }] },
    { id: "o_tributo",
      texto: "Nessa noite, {vilao} não dá a volta às muralhas: para diante da porta grande, à tua frente, e espera. Lembra-se de quem lhe deu o que veio buscar da outra vez. Quer o mesmo — o gado, todos os invernos — e as portas ficam em paz.",
      gatilho: ["todos", ["etapa", "portas"], ["nenhum", ["etapa", "ronda"]], ["relacao", "papel:vilao", "aliado"]],
      efeitos: [{ tipo: "abre_etapa", antes: "ronda", etapa: {
        id: "tributo", texto: "Responder ao que {vilao} veio pedir à porta",
        conclui: ["algum", ["escolheu", "tributo", "cumprir"], ["escolheu", "tributo", "romper"]],
        ramos: ["cumprir", "romper"] } }] },
    { id: "a_prova_na_mao",
      texto: "O que trazes contigo pesa mais a cada passo para fora das muralhas. Lá no campo, alguma coisa vai reconhecê-lo antes de lho mostrares — e isso pode chegar.",
      gatilho: ["todos", ["etapa", "portas"], ["nenhum", ["etapa", "frente"]],
        ["algum", ["acompanha", "papel:fraqueza_quem"], ["tem", "item:fraqueza_coisa"], ["descobriu", "lugar:fraqueza_verdade"]]],
      efeitos: [{ tipo: "abre_etapa", antes: "frente", etapa: {
        id: "prova", texto: "Pôr diante de {vilao} o que ainda o verga",
        conclui: ["algum", ["escolheu", "prova", "expor"], ["escolheu", "prova", "guardar"]],
        ramos: ["expor", "guardar"] } }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:oferenda"], ["nenhum", ["derrotou", "papel:oferenda"]]], ate: "oferenda",
      texto: "Chegaste tarde: a porta pequena abriu-se antes da hora, por mão de quem tinha pressa de acabar. Das ameias, a vila viu tudo e fechou as janelas. {vilao} não se foi embora." },
    { quando: ["todos", ["morto", "papel:vilao"], ["nenhum", ["derrotou", "papel:vilao"]]], ate: "frente",
      texto: "Outra mão chegou primeiro ao campo, e {vilao} morreu sem te ver. Na adega de {alcaide}, a cria chorou a noite inteira — e na serra, alguma coisa maior ouviu." },
  ],
  abandono: { semAvancar: 6,
    texto: "Ninguém foi. Ao amanhecer do décimo dia, a vila abriu a porta pequena como tinha decidido, e o cerco acabou. A vila diz que funcionou. Ninguém fala de quem saiu.",
    efeitos: [{ tipo: "relogio_do_fio", n: 2 }] },
  fecho: {
    texto: "As portas de {muralha} abrem-se, e pela primeira vez em nove dias há fumo de lareiras e não de vigias. {oferenda} é a primeira a sair, e fica muito tempo no meio do campo, sozinha, a olhar para a serra.",
    efeitos: [{ tipo: "afeicao", papel: "oferenda", n: 1 }, { tipo: "favor", papel: "muralha" }],
  },
});

/* O CONFRONTO DE GENTE, NO CONVÉS (passo 6): o vilão foge pelo mar no
   último barco, com o porão cheio da gente da terra que lhe disse que não.
   «Leve-nos para Memphis»: um transporte tomado, e os que vão nele sem
   poder fazer nada. A sentença tem as três; selar é afundar o barco, e o
   porão cheio dá-lhe o peso. O pacto: o barco sai, e a gente desce no
   primeiro porto. */
const O_ULTIMO_BARCO = quest({
  id: "o_ultimo_barco",
  titulo: "O Último Barco",
  tipo: 1,
  enredo: 31,                                   // «Leve-nos para Memphis e não desacelere»
  quando: ["fim"],
  afim: ["arquipelago", "misterio"],
  papeis: {
    vilao: { de: "fio", papel: "vilao", aceita: ["gente"], alcunha: "quem fretou o último barco", rotulo: "quem fretou o último barco" },
    cais: { de: "lugar", e: "o covil dele", tipos: ["docas", "mercado", "taverna"] },
    capanga: { de: "fio", papel: "tenente", aceita: ["gente"], alcunha: "quem guarda o portaló", rotulo: "quem guarda o portaló" },
    timoneiro: { de: "elenco", do: "cais", rotulo: "quem leva o leme" },
    levado: { de: "elenco", exige: ["vivo", "querido_do_heroi"], rotulo: "{levado:quem vai acorrentado no porão|quem vai acorrentada no porão}" },
    fraqueza_quem: { de: "elenco", fraqueza: "pessoa", rotulo: "{vilao:a voz que ele ainda ouve|a voz que ela ainda ouve}" },
    fraqueza_coisa: { de: "item", fraqueza: "coisa" },
    fraqueza_verdade: { de: "lugar", fraqueza: "verdade" },
  },
  mao: { tipo: "confronto", contra: [6], papel: "vilao" },
  pede: [],
  deixa: ["caiu:vilao"],
  gancho: "A maré vira à meia-noite, e em {cais} há um barco só com as velas soltas: o último, fretado a peso de ouro por {vilao}, que já não tem terra onde ficar. Leva o que lhe resta — os cofres, os papéis, e no porão, acorrentada, a gente que lhe disse que não. {levado} vai lá em baixo. {timoneiro} leva o leme, e não olha para ninguém. Faltam três horas para a maré.",
  etapas: [
    { id: "cais", texto: "Chegar a {cais} antes de a maré virar", conclui: ["esteve", "lugar:cais"] },
    { id: "bordo", texto: "Subir a bordo, passando {capanga}",
      conclui: ["algum", ["derrotou", "papel:capanga"], ["todos", ["consultou", "papel:timoneiro"], ["descobriu", "lugar:cais"]]],
      ramos: ["luta", "amarra"] },
    { id: "porao", texto: "Chegar a {levado}, no porão", conclui: ["acompanha", "papel:levado"] },
    { id: "frente", texto: "Pôr {vilao} de joelhos no convés",
      conclui: ["algum", ["derrotou", "papel:vilao"], ["escolheu", "prova", "expor"]],
      ramos: ["luta", "prova"] },
    { id: "sentenca", texto: "Decidir o que fica de {vilao}",
      conclui: ["algum", ["escolheu", "sentenca", "poupar"], ["escolheu", "sentenca", "acabar"], ["escolheu", "sentenca", "selar"]],
      ramos: ["poupar", "acabar", "selar"] },
  ],
  escolhas: {
    frete: { etapa: "frete", opcoes: {
      cumprir: {
        texto: "deixar o barco sair com a maré, como {vilao} propõe",
        ganha: "Ninguém sangra no convés. {levado} desce no primeiro porto do outro lado, com toda a gente do porão, e esta costa fica livre de {vilao} — longe, e a dever-te uma.",
        custa: "Do outro lado do mar há outra costa, com outra gente que não sabe o que lhe vai chegar. E entre ti e {vilao} fica um negócio, e quem faz negócios não esquece os sócios.",
        efeitos: [{ tipo: "deixa", premissa: "pacto:vilao" }],
      },
      romper: {
        texto: "rasgar o negócio e subir a bordo na mesma",
        ganha: "Ficas sem negócio nenhum com {vilao}, e com o barco inteiro pela frente.",
        custa: "Uma ordem gritada chega ao porão antes de chegares ao portaló, e lá em baixo alguém descarrega a primeira resposta em {levado}.",
        efeitos: [{ tipo: "situacao", papel: "levado", situacao: "ferida" }, { tipo: "rompe_laco", papel: "vilao" }],
      },
    } },
    prova: { etapa: "prova", opcoes: {
      expor: {
        texto: "pôr diante de {vilao}, no convés, aquilo que ainda o verga",
        ganha: "{vilao} baixa a lâmina à frente da tripulação inteira, sem que uma gota corra, e a tripulação percebe ao mesmo tempo que já não tem quem lhe pague.",
        custa: "Uma coisa destas só se usa uma vez. E quem é vergado à frente dos seus nunca perdoa a quem o vergou.",
        efeitos: [{ tipo: "deixa", premissa: "humilhado:vilao" }],
      },
      guardar: {
        texto: "guardar o que trazes, e decidir à lâmina, no convés",
        ganha: "Ninguém vai dizer que venceste com truques: venceste num barco que era de {vilao}, com a tripulação dele a ver.",
        custa: "Se a luta correr mal, o barco sai com a maré, contigo no convés e {levado} no porão, e a coisa que o vergava no teu bolso.",
        efeitos: [],
      },
    } },
    sentenca: { etapa: "sentenca", opcoes: {
      poupar: {
        texto: "pôr {vilao} num bote, com água para dois dias, e deixar a maré decidir",
        ganha: "Não matas quem está de joelhos. A maré leva o bote para o largo, e o que lhe acontecer é do mar, não teu.",
        custa: "O mar é grande, mas não é fundo em todo o lado. Há ilhas, e barcos de pesca, e gente que não sabe a cara que tem — e quem sobrevive a um bote não esquece quem o pôs lá.",
        efeitos: [{ tipo: "deixa", premissa: "poupado:vilao" }],
      },
      acabar: {
        texto: "acabar com {vilao} no convés, à frente da tripulação",
        ganha: "Acabou. A tripulação larga as armas sem ninguém mandar, e o barco volta ao cais com a maré da manhã.",
        custa: "Matar quem já estava de joelhos, à frente de vinte testemunhas, não se desfaz. A história vai ser contada em todos os portos — e cada porto conta-a à sua maneira.",
        efeitos: [{ tipo: "deixa", premissa: "caiu:vilao" }],
      },
      selar: {
        texto: "tirar toda a gente para os botes, fechar {vilao} no porão vazio e abrir os rombos",
        ganha: "Nem sangue nas tuas mãos nem fuga: o último barco vai ao fundo com quem o fretou, e nenhum porto do mundo o volta a ver.",
        custa: "Um barco no fundo é uma tumba que ninguém visita, e o mar devolve sempre alguma coisa. Um dia, numa praia, alguém encontra o que sobrou — e o nome volta a andar de boca em boca.",
        efeitos: [{ tipo: "deixa", premissa: "selado:vilao" }],
      },
    } },
  },
  solucoes: {
    bordo: {
      luta: [
        { id: "poupou", quando: ["poupou", "papel:capanga"],
          texto: "{capanga} cai no portaló e não se volta a erguer, mas respira. Passas por cima. No convés, alguém já gritou que há gente a bordo." },
        { id: "matou", texto: "{capanga} cai do portaló para a água escura entre o barco e o cais, e o som que faz ouve-se no convés inteiro." },
      ],
      amarra: [{ texto: "{timoneiro} deixa-te uma amarra de popa por prender, sem te olhar, e tu sobes por ela mão sobre mão, com o casco a raspar-te os joelhos. Ninguém no portaló te viu." }],
    },
    frete: {
      cumprir: [{ fecha: "concluida",
        texto: "Ficas no cais a ver o barco largar. Não há sinos nem gritos: só as velas a encher, e lá no alto da popa uma mão erguida em despedida, como entre sócios. Três dias depois chega a notícia de que {levado} desceu num porto do outro lado, com os outros todos, e pergunta por ti." }],
      romper: [{ texto: "Dizes que não, alto, para o convés. Lá do porão sobe um grito que conheces, e a seguir o silêncio, que é pior." }],
    },
    frente: {
      luta: [
        { id: "poupou", quando: ["poupou", "papel:vilao"],
          texto: "{vilao} cai de joelhos no convés molhado, e a lâmina escorrega-lhe para longe. A tripulação não se mexe. A tua lâmina está erguida, e a decisão também." },
        { id: "matou", fecha: "concluida",
          texto: "{vilao} cai no convés, e o barco inteiro parece abrandar, como se tivesse perdido o vento. A tripulação larga as armas uma a uma, e do porão vem o som de correntes a bater, a pedir que alguém desça.",
          efeitos: [{ tipo: "deixa", premissa: "caiu:vilao" }] },
      ],
      prova: [
        { id: "pessoa", quando: ["acompanha", "papel:fraqueza_quem"],
          texto: "{fraqueza_quem} sobe ao convés ao teu lado e diz o nome de {vilao}, só o nome, como se diz a uma criança que fez asneira. E {vilao} baixa a lâmina antes de saber que a baixou." },
        { id: "coisa", quando: ["tem", "item:fraqueza_coisa"],
          texto: "Pousas {fraqueza_coisa} em cima do cabrestante, à vista da tripulação inteira, e {vilao} percebe antes de toda a gente que o barco já não vai a lado nenhum." },
        { texto: "Dizes em voz alta, no convés, a verdade que {vilao} trouxe a bordo escondida. A tripulação ouve. Um a um, afastam-se de quem lhes pagava, e {vilao} fica sozinho junto ao mastro." },
      ],
    },
    sentenca: {
      poupar: [{ texto: "Descem o bote. {vilao} entra sem ajuda e sem uma palavra, e senta-se de costas para ti. A maré pega no bote como numa folha, e ao fim de pouco tempo já não se distingue do escuro." }],
      acabar: [{ texto: "Um golpe só, no convés molhado. Ninguém da tripulação olha. Quando o barco volta ao cais com a maré da manhã, já há gente à espera, e ninguém pergunta nada: veem a tua cara e sabem." }],
      selar: [{ texto: "Tiram toda a gente para os botes, até ao último. Depois fecha-se a escotilha, e abrem-se os rombos, e o último barco afunda-se devagar, de proa, sem um som que se ouça de cima da água." }],
    },
  },
  reviravoltas: [
    { id: "o_porao_cheio",
      texto: "{timoneiro} diz-te ao ouvido o que vai no porão: não é carga. São vinte da terra, os que lhe disseram que não, a caminho de um mercado do outro lado do mar onde se vende gente. Se o barco for ao fundo antes de os tirarem, vão com ele.",
      gatilho: ["todos", ["etapa", "cais"], ["consultou", "papel:timoneiro"], ["nenhum", ["etapa", "sentenca"]]],
      efeitos: [{ tipo: "quem_e", papel: "timoneiro", linha: "sabe que o porão do último barco ia cheio de gente da terra, a caminho de ser vendida" }, { tipo: "deixa", premissa: "carga:cais" }] },
    { id: "o_frete",
      texto: "Do alto do portaló, {vilao} reconhece-te e ri-se, sem maldade nenhuma: entre amigos não se faz isto. Propõe o que se propõe a um sócio — o barco sai com a maré, e no primeiro porto do outro lado desce toda a gente do porão, {levado} à frente; e tu nunca mais lhe vês a cara nesta costa.",
      gatilho: ["todos", ["etapa", "cais"], ["nenhum", ["etapa", "bordo"]], ["relacao", "papel:vilao", "aliado"]],
      efeitos: [{ tipo: "abre_etapa", antes: "bordo", etapa: {
        id: "frete", texto: "Responder ao que {vilao} propõe do alto do portaló",
        conclui: ["algum", ["escolheu", "frete", "cumprir"], ["escolheu", "frete", "romper"]],
        ramos: ["cumprir", "romper"] } }] },
    { id: "a_prova_na_mao",
      texto: "O que trazes contigo pesa mais a cada degrau do portaló. Lá em cima, alguém vai reconhecê-lo antes de lho mostrares — e isso pode chegar.",
      gatilho: ["todos", ["etapa", "cais"], ["nenhum", ["etapa", "frente"]],
        ["algum", ["acompanha", "papel:fraqueza_quem"], ["tem", "item:fraqueza_coisa"], ["descobriu", "lugar:fraqueza_verdade"]]],
      efeitos: [{ tipo: "abre_etapa", antes: "frente", etapa: {
        id: "prova", texto: "Pôr diante de {vilao} o que ainda o verga",
        conclui: ["algum", ["escolheu", "prova", "expor"], ["escolheu", "prova", "guardar"]],
        ramos: ["expor", "guardar"] } }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:levado"], ["nenhum", ["derrotou", "papel:levado"]]], ate: "porao",
      texto: "Chegaste ao porão e encontraste as correntes de {levado} abertas, e mais ninguém dentro delas. Alguém lá em cima achou que pesava demais para a viagem. A água do cais não devolve nada." },
    { quando: ["todos", ["morto", "papel:vilao"], ["nenhum", ["derrotou", "papel:vilao"]]], ate: "frente",
      texto: "Outra mão chegou primeiro ao convés, e {vilao} morreu sem te ver. O barco saiu na mesma com a maré, sem dono e com o porão cheio, e ninguém sabe a que porto foi dar." },
  ],
  abandono: { semAvancar: 2,
    texto: "A maré virou sem ti. De manhã o cais estava vazio, e no horizonte só se via uma vela, a diminuir, com o porão cheio de gente da terra.",
    efeitos: [{ tipo: "relogio_do_fio", n: 2 }, { tipo: "situacao", papel: "levado", situacao: "cativa" }] },
  fecho: {
    texto: "Desces a prancha de madrugada com {levado} pelo braço, e atrás de vocês vem o porão inteiro, a pestanejar à luz. No cais, ninguém aplaude. Ficam só a olhar para o mar, à espera de ver se ele devolve alguma coisa.",
    efeitos: [{ tipo: "afeicao", papel: "levado", n: 1 }, { tipo: "favor", papel: "cais" }],
  },
});

/* A CONSEQUÊNCIA DO PASSO 3, QUE É TAMBÉM PISTA (o 4): o passo cumpriu-se
   com a cara do herói. Um massacre que não fez, uma testemunha paga para
   o jurar, e as tuas cores num pano que nunca vestiste. «Como é que é?» —
   atacado sem razão aparente — virado para dentro: aqui o estranho é o
   próprio nome. Limpar o nome manda à forca quem mentiu por medo. */
const O_TEU_NOME_NA_PAREDE = quest({
  id: "o_teu_nome_na_parede",
  titulo: "O Teu Nome na Parede",
  tipo: 1,
  enredo: 15,                                   // «Como é que é?», com o Dobre: o acusado és tu
  quando: ["meio"],
  afim: ["misterio", "reinado"],
  papeis: {
    queimada: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["mercado", "templo", "taverna"] },
    sobrevivente: { de: "elenco", do: "queimada", rotulo: "quem jura que te viu nessa noite" },
    meirinho: { de: "elenco", proximo: "sobrevivente", rotulo: "quem pôs o teu nome na parede" },
    servo: { de: "fio", papel: "tenente", aceita: ["gente"], alcunha: "quem usou a tua cara", rotulo: "quem usou a tua cara" },
    capa: { de: "item", nome: "a capa com as tuas cores", nasce: "queimada" },
  },
  mao: { tipo: "consequencia", contra: [3, 4], papel: "servo", tambem: ["pista"] },
  pede: [],
  deixa: ["inimigo:servo"],
  gancho: "Há um papel pregado em cada porta da cidade: a tua cara, mal desenhada mas tua, e por baixo o que fizeste em {queimada} há três noites — o fogo, as portas trancadas por fora, os nomes dos que lá ficaram. Não estiveste lá. Mas {sobrevivente} jura que te viu à luz do fogo, de lâmina na mão e com as tuas cores, e a cidade inteira acredita. {meirinho} já mandou buscar corda.",
  etapas: [
    { id: "parede", texto: "Ouvir {sobrevivente} sem que te reconheça a cara", conclui: ["conversou", "papel:sobrevivente"] },
    { id: "cinza", texto: "Ver com os teus olhos o que ficou de {queimada}",
      conclui: ["pelo_menos", 2, ["esteve", "lugar:queimada"], ["descobriu", "lugar:queimada"], ["consultou", "papel:meirinho"]] },
    { id: "outro", texto: "Pôr a mão em quem usou a tua cara",
      conclui: ["algum", ["tem", "item:capa"], ["derrotou", "papel:servo"]],
      ramos: ["capa", "lamina"] },
    { id: "nome", texto: "Decidir o que se faz com o teu nome",
      conclui: ["algum", ["escolheu", "nome", "limpar"], ["escolheu", "nome", "carregar"], ["escolheu", "nome", "comprar"]],
      ramos: ["limpar", "carregar", "comprar"] },
  ],
  escolhas: {
    nome: { etapa: "nome", opcoes: {
      limpar: {
        texto: "levar a prova a {meirinho}, na praça, e limpar o teu nome à frente de todos",
        ganha: "Os papéis saem das portas à tua frente, um a um, e a cidade que te queria enforcar fica a olhar para o chão. O teu nome volta a ser só teu.",
        custa: "{sobrevivente} jurou falso diante da lei, e a lei não pergunta porquê: vai à forca pela mentira que te pôs lá. E quem usou a tua cara fica a saber, nessa mesma hora, que foi descoberto.",
        efeitos: [{ tipo: "avisa_vilao" }, { tipo: "situacao", papel: "sobrevivente", situacao: "cativa" }, { tipo: "afeicao", papel: "meirinho", n: 1 }],
      },
      carregar: {
        texto: "deixar o teu nome na parede, e tirar {sobrevivente} da cidade antes que alguém pergunte",
        ganha: "{sobrevivente} vive, e os que lhe restam também. E quem usou a tua cara julga que ganhou — e quem julga que ganhou deixa de olhar para trás.",
        custa: "Em cada cidade desta terra vai haver uma porta com a tua cara, e uma corda à tua espera. {meirinho} não esquece um nome que lhe fugiu.",
        efeitos: [{ tipo: "inimigo", papel: "meirinho" }, { tipo: "relogio_do_fio", n: -1 }, { tipo: "afeicao", papel: "sobrevivente", n: 2 }],
      },
      comprar: {
        texto: "pagar a {meirinho} para arrancar os papéis e esquecer o assunto",
        ganha: "Os papéis saem das portas antes do anoitecer, e ninguém vai à forca — nem tu, nem {sobrevivente}. A cidade esquece depressa o que deixa de ver.",
        custa: "Cinquenta moedas, e um meirinho que sabe agora que o teu nome se vende. E quem usou a tua cara continua com ela, e com as tuas cores no armário.",
        efeitos: [{ tipo: "moedas", n: -50 }, { tipo: "deixa", premissa: "comprado:meirinho" }],
      },
    } },
  },
  solucoes: {
    outro: {
      capa: [{ texto: "Debaixo de uma trave caída de {queimada} há um pano chamuscado: {capa}, cosida à pressa, com o forro de uma loja do outro lado da cidade. Ninguém cose as cores de outro sem ter visto as originais muito de perto." }],
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:servo"],
          texto: "{servo} cai e não se volta a erguer, mas respira — e por baixo da roupa tem as tuas cores, um pouco grandes demais nos ombros." },
        { id: "matou", texto: "{servo} fica onde caiu, com as tuas cores vestidas. Por um momento horrível, parece que te estás a ver morto no chão." },
      ],
    },
    nome: {
      limpar: [{ texto: "Sobes ao degrau da praça com a prova na mão e falas até o último papel cair. {meirinho} ouve tudo de braços cruzados, e no fim manda descer {sobrevivente} de entre a multidão. {sobrevivente} não foge. Olha para ti como quem já sabia." }],
      carregar: [{ texto: "Tiras {sobrevivente} da cidade de noite, numa carroça de feno, com os que lhe restam encolhidos lá atrás. À saída, a última porta da muralha tem a tua cara pregada. Arrancas o papel e guardas-no, não sabes bem porquê." }],
      comprar: [{ texto: "{meirinho} conta as moedas devagar, à tua frente, e depois manda um rapaz arrancar os papéis. Quando sais, já se vê a madeira clara das portas onde estiveram. Ninguém te olha duas vezes. É quase pior." }],
    },
  },
  reviravoltas: [
    { id: "o_preco_da_testemunha",
      texto: "À segunda pergunta, {sobrevivente} desaba: sabe que não foste tu. Viu a cara de quem foi, e não era a tua. Mas pagaram-lhe para dizer o teu nome, e disseram-lhe o que acontecia aos que lhe restam se não o dissesse. Pede-te que não lhe peças para se desdizer.",
      gatilho: ["todos", ["etapa", "parede"], ["consultou", "papel:sobrevivente"], ["nenhum", ["etapa", "nome"]]],
      efeitos: [{ tipo: "quem_e", papel: "sobrevivente", linha: "jurou um nome que não era o do culpado, para salvar os que lhe restam" }] },
    { id: "as_tuas_cores",
      texto: "No meio da cinza há um botão das tuas cores, mas de um pano que nunca vestiste. Alguém mandou fazer uma cópia, e sabia por onde andavas para te pôr no sítio certo à hora certa. Há semanas que alguém te segue de perto — o bastante para te copiar.",
      gatilho: ["todos", ["etapa", "cinza"], ["descobriu", "lugar:queimada"], ["nenhum", ["etapa", "nome"]]],
      efeitos: [{ tipo: "deixa", premissa: "copia:servo" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:sobrevivente"], ["nenhum", ["derrotou", "papel:sobrevivente"]]], ate: "nome",
      texto: "Acharam {sobrevivente} no poço, de manhã. A única voz que te podia desdizer calou-se para sempre, e a cidade chama-lhe a tua segunda vítima. Os papéis nas portas ganham uma linha nova." },
  ],
  abandono: { semAvancar: 4,
    texto: "Não voltaste a {queimada}. Ao fim de uma semana, a tua cara já estava pregada nas portas de três cidades, e ninguém se lembrava de que havia outra.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "O teu nome tem agora um dono a mais, e esse dono deixou rasto: um alfaiate, um botão, uma loja do outro lado da cidade. É a primeira ponta de um fio que vai dar a quem quis que fosses tu a pagar.",
    efeitos: [{ tipo: "deixa", premissa: "rasto:servo" }],
  },
});

/* O TENENTE DO PASSO 3 (o «meio»): «Bom serviço de limpeza» — o herói
   herda por uma noite o comando de uma guarda que não lhe obedece, e
   quem manda de facto é um servo dele, que empurrou o capitão da muralha.
   Vencê-lo, virá-lo (as chaves da vila na mão de quem matou) ou expô-lo
   na formatura (e perder metade da guarda). O capitão morto é a obra do
   passo: a mão é também consequência (sem isso, o esqueleto pedia sempre
   uma consequência ao ato do 3 antes de um tenente, e esta nunca entrava). */
const O_POSTO_DO_CAPITAO_MORTO = quest({
  id: "o_posto_do_capitao_morto",
  titulo: "O Posto do Capitão Morto",
  tipo: 1,
  enredo: 11,                                   // «Bom serviço de limpeza»: a operação herdada
  quando: ["meio"],
  afim: ["reinado", "jornada"],
  papeis: {
    quartel: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["quartel", "cadeia"] },
    viuva: { de: "elenco", do: "quartel", rotulo: "quem enterrou o capitão" },
    recruta: { de: "elenco", proximo: "viuva", rotulo: "{recruta:o mais novo da guarda|a mais nova da guarda}" },
    servo: { de: "fio", papel: "tenente", aceita: ["gente"], alcunha: "quem manda de facto na guarda", rotulo: "quem manda de facto na guarda" },
  },
  mao: { tipo: "tenente", contra: [3], papel: "servo", tambem: ["consequencia"] },
  pede: [],
  deixa: ["inimigo:servo"],
  gancho: "O capitão da guarda caiu da muralha numa noite sem vento, há três dias, depois de trinta anos a subi-la de olhos fechados. A vila não tem mais ninguém, e o conselho pôs-te na mão as chaves de {quartel} «até se arranjar outro». A guarda faz-te a continência e olha por cima do teu ombro, para {servo}. Na taberna diz-se que há uma noite marcada para uma das portas se abrir sozinha.",
  etapas: [
    { id: "chaves", texto: "Receber as chaves de {quartel} das mãos de {viuva}",
      conclui: ["todos", ["esteve", "lugar:quartel"], ["conversou", "papel:viuva"]] },
    { id: "guarda", texto: "Saber quem manda de facto na guarda",
      conclui: ["pelo_menos", 2, ["conversou", "papel:recruta"], ["consultou", "papel:viuva"], ["descobriu", "lugar:quartel"]] },
    { id: "sargento", texto: "Tirar o comando a {servo}",
      conclui: ["algum", ["derrotou", "papel:servo"], ["escolheu", "sargento", "virar"], ["escolheu", "sargento", "expor"]],
      ramos: ["lamina", "virar", "expor"] },
    { id: "noite", texto: "Estar à porta de {quartel} na noite marcada",
      conclui: ["todos", ["esta_em", "lugar:quartel"], ["conversou", "papel:recruta", 2]] },
  ],
  escolhas: {
    sargento: { etapa: "sargento", opcoes: {
      virar: {
        texto: "oferecer a {servo} as chaves de capitão, a troco de mudar de lado",
        ganha: "Ninguém sangra no pátio. {servo} aceita, e com a mudança vem a guarda inteira, que obedece a quem sempre obedeceu. A porta fica fechada na noite marcada.",
        custa: "Pões as chaves da vila na mão de quem empurrou o capitão da muralha. {viuva} vai cruzar-se com essas chaves na rua todos os dias — e quem muda de lado uma vez sabe o caminho de volta.",
        efeitos: [{ tipo: "aliado", papel: "servo" }, { tipo: "afeicao", papel: "viuva", n: -2 }],
      },
      expor: {
        texto: "acusar {servo} na formatura da manhã, à frente da guarda inteira",
        ganha: "Dizes em voz alta o que se passou na muralha, e a guarda ouve. Os que não estavam metidos nisto passam para o teu lado ali mesmo, e {servo} sai do pátio sem as divisas.",
        custa: "Os que estavam metidos saem também, e são quase metade. Ficas com uma guarda de rapazes, e quem manda em {servo} fica a saber nessa mesma hora que a porta já não abre.",
        efeitos: [{ tipo: "avisa_vilao" }, { tipo: "inimigo", papel: "servo" }, { tipo: "afeicao", papel: "viuva", n: 1 }],
      },
    } },
  },
  solucoes: {
    sargento: {
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:servo"],
          texto: "{servo} cai no pátio do quartel e não se volta a erguer, mas respira. A guarda inteira assiste das janelas, e ninguém desce para ajudar." },
        { id: "matou", texto: "{servo} fica no chão do pátio, no sítio onde passava revista. A guarda desce, um a um, e passa à volta sem olhar, e à tarde já te tratam por capitão." },
      ],
      virar: [{ texto: "Pões as chaves em cima da mesa, entre os dois. {servo} olha muito tempo para elas, depois para ti, e pega nelas devagar, como quem pega numa coisa que já era sua." }],
      expor: [{ texto: "Na formatura da manhã dizes tudo: a muralha, a noite sem vento, a porta. Ao fim, metade da guarda dá um passo em frente para o teu lado. A outra metade dá um passo atrás, e depois outro, e sai pelo portão com {servo} à frente." }],
    },
  },
  reviravoltas: [
    { id: "a_queda_do_capitao",
      texto: "{viuva} não acredita na queda: o capitão subia aquela muralha há trinta anos de olhos fechados. Na noite em que caiu, tinha dito em casa que ia falar com {servo} sobre uma porta que andava a ficar aberta. Não voltou para jantar.",
      gatilho: ["todos", ["etapa", "chaves"], ["consultou", "papel:viuva"], ["nenhum", ["etapa", "sargento"]]],
      efeitos: [{ tipo: "deixa", premissa: "assassino:servo" }, { tipo: "quem_e", papel: "viuva", linha: "não acredita que o capitão caiu da muralha sozinho" }] },
    { id: "o_que_o_recruta_viu",
      texto: "{recruta} conta, a tremer, que estava de vigia na torre ao lado nessa noite: não foi o vento. E {servo} já lhe disse, ao passar, a sorrir, que a muralha é alta para quem fala demais.",
      gatilho: ["todos", ["etapa", "guarda"], ["consultou", "papel:recruta"], ["nenhum", ["etapa", "sargento"]]],
      efeitos: [{ tipo: "quem_e", papel: "recruta", linha: "viu da torre quem empurrou o capitão da muralha" }] },
    { id: "a_lista_da_guarda",
      texto: "Para provar que mudou de lado, {servo} dá-te uma lista: os nomes da guarda que recebem de quem manda nisto tudo, e quanto, e desde quando. São quase todos. Agora são teus.",
      gatilho: ["escolheu", "sargento", "virar"],
      efeitos: [{ tipo: "relogio_do_fio", n: -1 }, { tipo: "quem_e", papel: "servo", linha: "mudou de lado com as chaves do capitão que empurrou da muralha" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:recruta"], ["nenhum", ["derrotou", "papel:recruta"]]], ate: "noite",
      texto: "Acharam {recruta} ao pé da muralha, de manhã, no mesmo sítio onde caiu o capitão. A guarda passou ao lado sem parar, e nessa noite a porta abriu-se sozinha." },
  ],
  abandono: { semAvancar: 4,
    texto: "Na noite marcada, a porta de {quartel} abriu-se por dentro, sem barulho. As chaves de capitão estavam no teu bolso, longe dali, e a vila nunca te perdoou isso.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "A noite marcada passa com a porta trancada e {recruta} de vigia na torre, de olhos muito abertos. De manhã, a guarda faz-te a continência e olha-te na cara. O conselho já não fala em arranjar outro.",
    efeitos: [{ tipo: "favor", papel: "quartel" }, { tipo: "afeicao", papel: "recruta", n: 1 }],
  },
});

/* O RECURSO DO PASSO 4 (o «meio»): trezentas lanças num arsenal esquecido,
   que um servo dele vem buscar de carroça. «Capturar a bandeira» com os
   civis presentes: a rua pode pôr-se à porta. E o ferro não tem destino
   bom — armar a rua (que já se matou com ele), afundá-lo, ou vendê-lo a
   quem paga demais. As carroças levam um destino escrito, e a pista é
   ele: a mão é também pista (sem isso, o ato do 4 pedia sempre uma pista
   antes de um recurso, e esta nunca entrava — o esqueleto mediu 0 em 1000). */
const AS_ARMAS_DO_POCO = quest({
  id: "as_armas_do_poco",
  titulo: "As Armas do Poço",
  tipo: 1,
  enredo: 5,                                    // «Capturar a bandeira», com a rua à porta
  quando: ["meio"],
  afim: ["reinado", "jornada"],
  papeis: {
    arsenal: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["quartel", "forja", "guilda"] },
    ferreira: { de: "elenco", do: "arsenal", rotulo: "quem guarda as chaves do arsenal" },
    vizinha: { de: "elenco", proximo: "ferreira", rotulo: "quem fala pela rua" },
    servo: { de: "fio", papel: "tenente", aceita: ["gente"], alcunha: "quem vem buscar as armas", rotulo: "quem vem buscar as armas" },
    armas: { de: "item", nome: "as armas do arsenal velho", nasce: "arsenal" },
  },
  mao: { tipo: "recurso", contra: [4], papel: "servo", tambem: ["pista"] },
  pede: [],
  deixa: ["inimigo:servo"],
  gancho: "No arsenal velho de {arsenal} há trezentas lanças e arcos de que ninguém se lembra desde a última guerra. Alguém se lembrou: daqui a duas noites, {servo} vem com carroças buscá-las, e com elas quem manda nisto tudo arma a sua gente para o que vem a seguir. {ferreira} tem as chaves, e a mão a tremer. A rua sabe, e não sabe o que fazer com o que sabe.",
  etapas: [
    { id: "chaves", texto: "Ouvir {ferreira}", conclui: ["conversou", "papel:ferreira"] },
    { id: "arsenal", texto: "Entrar no arsenal antes das carroças",
      conclui: ["algum", ["esteve", "lugar:arsenal"], ["descobriu", "lugar:arsenal"]] },
    { id: "carrocas", texto: "Fazer frente a {servo} e às carroças",
      conclui: ["algum", ["derrotou", "papel:servo"], ["todos", ["conversou", "papel:vizinha", 2], ["esta_em", "lugar:arsenal"]]],
      ramos: ["lamina", "rua"] },
    { id: "destino", texto: "Decidir o que fica das armas",
      conclui: ["algum", ["escolheu", "armas", "armar"], ["escolheu", "armas", "poco"], ["escolheu", "armas", "vender"]],
      ramos: ["armar", "poco", "vender"] },
  ],
  escolhas: {
    armas: { etapa: "destino", opcoes: {
      armar: {
        texto: "abrir o arsenal à rua, e dar uma lança a cada porta",
        ganha: "A vila deixa de ser sítio de onde se leva o que se quer: da próxima vez que alguém vier com carroças, encontra trezentas lanças à espera.",
        custa: "Trezentas lanças em trezentas casas não voltam a sair. Na próxima zanga de vizinhos, na próxima fome, há ferro à mão — e foi exatamente isso que fechou o arsenal da última vez.",
        efeitos: [{ tipo: "relogio_regional", n: 1 }, { tipo: "afeicao", papel: "vizinha", n: 1 }, { tipo: "relogio_do_fio", n: -1 }],
      },
      poco: {
        texto: "atirar as armas todas ao poço velho e tapá-lo com pedra",
        ganha: "Ninguém as leva: nem {servo}, nem a rua, nem a próxima guerra. O ferro fica no fundo, e ninguém tem de decidir quem pega nele.",
        custa: "A vila fica com forquilhas e foices, e sabe-o. {vizinha} cospe para o poço tapado, e da próxima vez que alguém vier, a vila abre a porta porque não tem outra coisa.",
        efeitos: [{ tipo: "afeicao", papel: "vizinha", n: -1 }, { tipo: "relogio_do_fio", n: -2 }],
      },
      vender: {
        texto: "vender as armas a um mercador de passagem, que paga bem e não pergunta",
        ganha: "Oitenta moedas, contadas em cima de uma pipa, e as armas saem da vila antes do amanhecer: ninguém aqui vai ter de decidir o que fazer com elas.",
        custa: "Não sabes para que mãos vão. O mercador pagou demasiado bem, e não perguntou nada — e quem não pergunta, normalmente, já sabe a resposta.",
        efeitos: [{ tipo: "moedas", n: 80 }, { tipo: "relogio_do_fio", n: 1 }, { tipo: "afeicao", papel: "ferreira", n: -1 }],
      },
    } },
  },
  solucoes: {
    carrocas: {
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:servo"],
          texto: "{servo} cai à porta do arsenal e não se volta a erguer, mas respira. Os carroceiros olham uns para os outros, viram as mulas, e vão-se pelo caminho por onde vieram." },
        { id: "matou", texto: "{servo} fica no chão, entre as rodas da primeira carroça. Os carroceiros nem descem: viram as mulas a meio da rua e desaparecem antes de alguém lhes ver a cara." },
      ],
      rua: [{ texto: "Quando as carroças chegam, a rua inteira está à porta do arsenal: velhos, mulheres, crianças, de braços dados e sem uma arma. {servo} olha muito tempo para eles. Depois manda virar as mulas. Não se carrega uma carroça por cima de uma rua." }],
    },
    destino: {
      armar: [{ texto: "{ferreira} abre o arsenal de par em par, e a rua entra em silêncio e sai com uma lança cada um, a pesar-lhes nas mãos mais do que esperavam. Há quem chore. Há quem ria. Há quem já olhe para o vizinho de outra maneira." }],
      poco: [{ texto: "Leva a noite inteira. Lança a lança, arco a arco, o ferro desce ao poço velho com um som cada vez mais fundo, até deixar de se ouvir bater no fundo. Ao nascer do dia, a última pedra tapa a boca." }],
      vender: [{ texto: "O mercador conta as moedas em cima de uma pipa, carrega tudo em duas horas com gente que não fala, e sai antes do amanhecer pela estrada do norte. Não deixa nome. Deixa só o cheiro a cavalo bem tratado." }],
    },
  },
  reviravoltas: [
    { id: "a_ultima_guerra",
      texto: "{ferreira} conta porque é que ninguém se lembra do arsenal: na última guerra, aquelas lanças foram dadas à rua, e quando o inimigo se foi, a rua usou-as uns contra os outros, por terras, por dívidas, por nada. Foi o pai de {ferreira} quem as fechou lá dentro, e jurou que não voltavam a sair.",
      gatilho: ["todos", ["etapa", "chaves"], ["consultou", "papel:ferreira"], ["nenhum", ["etapa", "destino"]]],
      efeitos: [{ tipo: "quem_e", papel: "ferreira", linha: "guarda as chaves do arsenal que o pai fechou depois de a rua se matar com ele" }] },
    { id: "as_marcas_de_giz",
      texto: "Nas caixas há marcas frescas a giz: alguém já contou as armas, uma a uma, e marcou as melhores. Quem quer que tenha sido, entrou com chave. {servo} tem quem lhe abra a porta por dentro.",
      gatilho: ["todos", ["etapa", "arsenal"], ["descobriu", "lugar:arsenal"], ["nenhum", ["etapa", "destino"]]],
      efeitos: [{ tipo: "deixa", premissa: "chave:arsenal" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:ferreira"], ["nenhum", ["derrotou", "papel:ferreira"]]], ate: "destino",
      texto: "Acharam {ferreira} à porta do arsenal, com o molho de chaves arrancado do cinto. Nessa noite as carroças vieram e foram-se, e o arsenal ficou vazio e aberto, a bater com o vento." },
  ],
  abandono: { semAvancar: 3,
    texto: "As carroças vieram à hora marcada e levaram tudo. Um mês depois, as lanças do arsenal velho apareceram noutra terra, nas mãos de gente que não as devia ter.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "As carroças foram-se vazias. O arsenal fica como ficou — cheio, aberto, ou um poço tapado —, e foste tu quem decidiu. Na fuga, um carroceiro deixou cair a guia da viagem: o sítio para onde o ferro ia, e o dia em que lá era preciso. Quem manda nisto tudo vai ter de procurar ferro noutro lado, e tu sabes agora para quê.",
    efeitos: [{ tipo: "deixa", premissa: "inimigo:servo" }, { tipo: "deixa", premissa: "rasto:servo" }],
  },
});

/* A PISTA DO PASSO 4 QUE É UM ENGODO: «Onças da Prevenção». O recado
   chega inteiro demais, e decorado. O golpe verdadeiro é no sítio de que
   ninguém fala, onde estão os registos de que o plano precisa. Ficar,
   ir contra todos, ou dividir — e só quem foi para o outro lado vê a cara
   de quem manda o recado. */
const O_RECADO_VERDADEIRO = quest({
  id: "o_recado_verdadeiro",
  titulo: "O Recado Verdadeiro",
  tipo: 1,
  enredo: 23,                                   // «Onças da Prevenção»: a pista que é distração
  quando: ["meio"],
  afim: ["misterio", "arquipelago"],
  papeis: {
    mensageiro: { de: "elenco", exige: ["vivo"], rotulo: "quem chegou com o recado" },
    alvo: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["templo", "mercado", "taverna"] },
    outro: { de: "lugar", vizinho: "alvo", tipos: ["biblioteca", "guilda", "cadeia", "quartel"] },
    guardia: { de: "elenco", do: "outro", rotulo: "quem guarda {outro}" },
    servo: { de: "fio", papel: "tenente", aceita: ["gente"], alcunha: "quem mandou o recado", rotulo: "quem mandou o recado" },
  },
  mao: { tipo: "pista", contra: [4], papel: "servo" },
  pede: [],
  deixa: ["inimigo:servo"],
  gancho: "{mensageiro} chegou a meio da noite, a cavalo e meio morto, com um recado que a cidade inteira já sabe de cor: daqui a três noites, a gente de quem manda nisto tudo vem pegar fogo a {alvo}, com quem lá estiver dentro. Toda a gente se prepara para defender {alvo}. Só {guardia}, que guarda {outro} e a quem ninguém dá ouvidos, pergunta porque é que um recado destes chegou tão inteiro.",
  etapas: [
    { id: "recado", texto: "Ouvir {mensageiro}", conclui: ["conversou", "papel:mensageiro"] },
    { id: "duvida", texto: "Saber se o recado é verdadeiro",
      conclui: ["pelo_menos", 2, ["consultou", "papel:mensageiro"], ["descobriu", "lugar:alvo"], ["conversou", "papel:guardia"]] },
    { id: "noite", texto: "Escolher onde estás na noite marcada",
      conclui: ["algum", ["escolheu", "noite", "alvo"], ["escolheu", "noite", "outro"], ["escolheu", "noite", "dividir"]],
      ramos: ["alvo", "outro", "dividir"] },
    { id: "golpe", texto: "Pôr a mão em quem mandou o recado",
      conclui: ["algum", ["derrotou", "papel:servo"], ["todos", ["esteve", "lugar:outro"], ["descobriu", "lugar:outro"]]],
      ramos: ["lamina", "rasto"] },
  ],
  escolhas: {
    noite: { etapa: "noite", opcoes: {
      alvo: {
        texto: "ficar em {alvo} com toda a gente, como o recado manda",
        ganha: "Se o fogo vier onde disseram, encontra-te à porta, e a cidade vê-te onde disseste que estarias. Ninguém te pode acusar de não ter acreditado.",
        custa: "Se o recado for mentira, {outro} fica sozinho com {guardia} e uma tranca, e o golpe verdadeiro cai onde ninguém olhava. E quem o mandou fica a saber que acreditas no que te dizem.",
        efeitos: [{ tipo: "relogio_do_fio", n: 1 }, { tipo: "afeicao", papel: "guardia", n: -1 }],
      },
      outro: {
        texto: "ir para {outro}, contra o que toda a gente diz",
        ganha: "Estás onde ninguém espera. Se tiveres razão, quem vier vem confiado, e vês-lhe a cara antes de saber que foi visto.",
        custa: "Se te enganares, {alvo} arde à frente de uma cidade inteira que te viu ir para o outro lado — e ninguém aqui te volta a abrir uma porta.",
        efeitos: [{ tipo: "relogio_do_fio", n: -1 }, { tipo: "afeicao", papel: "guardia", n: 1 }, { tipo: "relogio_regional", n: 1 }],
      },
      dividir: {
        texto: "mandar metade da gente para {outro}, e ficar com a outra metade em {alvo}",
        ganha: "Ninguém fica sozinho, e nenhum dos dois sítios fica de porta aberta. Seja qual for a verdade, há alguém lá.",
        custa: "Metade em cada sítio é pouco em cada sítio. Se o golpe vier com força, chega para os dois — e vais ter de escolher, a meio da noite, para que lado corres.",
        efeitos: [{ tipo: "relogio_regional", n: 1 }, { tipo: "avisa_vilao" }],
      },
    } },
  },
  solucoes: {
    noite: {
      alvo: [{ texto: "A noite marcada passa em {alvo}, de tochas acesas e baldes de água à porta. Não vem ninguém. Ao amanhecer, do outro lado da praça, sobe um fumo fino de onde ninguém estava a olhar." }],
      outro: [{ texto: "Ficas às escuras em {outro}, sozinho com {guardia} e o barulho do teu coração. A cidade inteira está do outro lado da praça. À meia-noite, a porta range, e quem entra traz chave." }],
      dividir: [{ texto: "Metade da gente vai contigo para {alvo}, a outra metade para {outro}. A meio da noite ouves gritos — e durante um momento comprido não sabes de que lado vêm." }],
    },
    golpe: {
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:servo"],
          texto: "{servo} cai entre as estantes de {outro} e não se volta a erguer, mas respira. Tem nos bolsos a chave da porta e o rascunho do recado, com as pausas marcadas a tinta." },
        { id: "matou", texto: "{servo} fica no chão de {outro}, com a chave ainda na mão. No bolso há um papel dobrado: o recado, palavra por palavra, com as pausas marcadas a tinta." },
      ],
      rasto: [{ texto: "Em {outro} há uma prateleira vazia onde os registos deviam estar, e no pó do chão as marcas de quem os levou, a caminho de uma porta das traseiras que ninguém usa. Quem manda o recado deixou pegadas." }],
    },
  },
  reviravoltas: [
    { id: "o_recado_decorado",
      texto: "À segunda pergunta, {mensageiro} repete o recado palavra por palavra, com as mesmas pausas, no mesmo sítio. Decorou-o. Ninguém decora o que viu com os próprios olhos — decora-se o que se ouviu dizer a outro.",
      gatilho: ["todos", ["etapa", "recado"], ["consultou", "papel:mensageiro"], ["nenhum", ["etapa", "noite"]]],
      efeitos: [{ tipo: "quem_e", papel: "mensageiro", linha: "trouxe um recado decorado, palavra por palavra, de quem o mandou" }] },
    { id: "o_que_guarda_outro",
      texto: "{guardia} diz-te por fim o que guarda: em {outro} estão os registos de quem deve a quem nesta terra inteira, os papéis de que quem manda nisto tudo precisa para o passo seguinte. Ninguém pega fogo a um sítio cheio de gente por raiva. Pega-se para que ninguém olhe para o lado.",
      gatilho: ["todos", ["etapa", "duvida"], ["conversou", "papel:guardia"], ["nenhum", ["etapa", "noite"]]],
      efeitos: [{ tipo: "deixa", premissa: "cobicado:outro" }] },
    { id: "a_cara_na_noite",
      texto: "Quem entra em {outro} à meia-noite vem sem pressa, com chave, a contar não encontrar ninguém. Encontra-te. Durante um instante, os dois ficam parados no escuro — e nesse instante vês a cara de quem manda o recado, e a cara vê a tua.",
      gatilho: ["escolheu", "noite", "outro"],
      efeitos: [{ tipo: "deixa", premissa: "rasto:servo" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:guardia"], ["nenhum", ["derrotou", "papel:guardia"]]], ate: "noite",
      texto: "Acharam {guardia} à porta de {outro} na segunda noite, e {outro} aberto e vazio. O recado era verdadeiro: só se enganou no sítio, e no dia." },
  ],
  abandono: { semAvancar: 3,
    texto: "As três noites passaram sem ti. {alvo} não ardeu. Na manhã seguinte descobriu-se que {outro} tinha sido esvaziado durante a noite, enquanto a cidade inteira guardava a porta errada.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "O recado era um engodo, e quem o mandou tem agora uma cara, e uma chave, e uma porta das traseiras. É mais do que tinha quando chegaste.",
    efeitos: [{ tipo: "deixa", premissa: "rasto:servo" }],
  },
});

/* A PISTA QUE ENTREGA A FRAQUEZA PELO PAPEL (passo 4): a velha que criou
   quem hoje toda a terra teme, e que alguém faz esquecer com papoila, noite
   após noite. Devolver-lhe a memória custa-lhe a paz; deixá-la dormir
   custa a verdade; perguntar-lhe meio a dormir custa a neta. O que ela
   lembra é a coisa ou o sítio da fraqueza — e, sem eles, a palavra dela. */
const O_QUE_A_AMA_ESQUECEU = quest({
  id: "o_que_a_ama_esqueceu",
  titulo: "O Que a Ama Esqueceu",
  tipo: 1,
  enredo: 19,                                   // «Memórias faltantes», noutra cabeça
  quando: ["meio"],
  afim: ["misterio", "reinado"],
  papeis: {
    ama: { de: "elenco", exige: ["vivo"], rotulo: "quem já não se lembra de nada" },
    asilo: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["templo", "casa de banhos", "taverna"] },
    neta: { de: "elenco", proximo: "ama", rotulo: "quem cuida de {ama}" },
    servo: { de: "fio", papel: "tenente", aceita: ["gente"], alcunha: "quem leva o chá a {ama} todas as noites", rotulo: "quem leva o chá a {ama} todas as noites" },
    cha: { de: "item", nome: "o chá de papoila", nasce: "asilo" },
    fraqueza_coisa: { de: "item", fraqueza: "coisa" },
    fraqueza_verdade: { de: "lugar", fraqueza: "verdade" },
  },
  mao: { tipo: "pista", contra: [4], papel: "servo" },
  pede: [],
  deixa: ["inimigo:servo"],
  gancho: "{ama} criou, há muitos anos, uma criança que hoje toda a terra teme. Não se lembra. Não se lembra de nada: nem do nome da criança, nem do dela, nem de que dia é. {neta} diz que começou no inverno, quando alguém de boas maneiras passou a vir todas as noites trazer-lhe um chá para dormir. Ainda vem. E {ama}, às vezes, a meio da noite, canta uma canção de embalar que ninguém nesta casa lhe ensinou.",
  etapas: [
    { id: "neta", texto: "Ouvir {neta}", conclui: ["conversou", "papel:neta"] },
    { id: "cha", texto: "Saber o que há no chá", conclui: ["algum", ["tem", "item:cha"], ["descobriu", "lugar:asilo"]] },
    { id: "cabeceira", texto: "Afastar {servo} da cabeceira de {ama}",
      conclui: ["algum", ["derrotou", "papel:servo"], ["todos", ["esteve", "lugar:asilo"], ["conversou", "papel:neta", 2]]],
      ramos: ["lamina", "porta"] },
    { id: "memoria", texto: "Decidir o que se faz com a memória de {ama}",
      conclui: ["algum", ["escolheu", "memoria", "devolver"], ["escolheu", "memoria", "dormir"], ["escolheu", "memoria", "perguntar"]],
      ramos: ["devolver", "dormir", "perguntar"] },
    { id: "achar", texto: "Ir buscar o que {ama} lembrou",
      conclui: ["algum", ["tem", "item:fraqueza_coisa"], ["descobriu", "lugar:fraqueza_verdade"], ["conversou", "papel:ama", 2]],
      ramos: ["coisa", "verdade", "palavra"] },
  ],
  escolhas: {
    memoria: { etapa: "memoria", opcoes: {
      devolver: {
        texto: "tirar-lhe o chá aos poucos, e deixar que a memória volte inteira",
        ganha: "Ao fim de três dias sem chá, {ama} acorda a saber o próprio nome — e o da criança que criou. Conta tudo, devagar, de mãos no colo.",
        custa: "Lembra-se também do resto: do que fez, do que deixou fazer, e de como começou. Três dias de febre e de choro, e {ama} nunca mais dorme uma noite inteira.",
        efeitos: [{ tipo: "dia", n: 3 }, { tipo: "afeicao", papel: "neta", n: 1 }, { tipo: "quem_e", papel: "ama", linha: "lembrou-se de tudo o que esqueceu, e não voltou a dormir uma noite inteira" }],
      },
      dormir: {
        texto: "deixar {ama} dormir em paz, e contentar-te com a canção",
        ganha: "{ama} acaba os dias sem saber o que criou, a sorrir a quem lhe der a mão. E a canção, cantada inteira, diz mais do que parece.",
        custa: "Uma canção não é uma memória: ficas com metade do que ela sabia, e a outra metade vai com ela. E foi {servo} quem decidiu, por todos, o que ela esquecia.",
        efeitos: [{ tipo: "relogio_do_fio", n: 1 }, { tipo: "afeicao", papel: "neta", n: 1 }],
      },
      perguntar: {
        texto: "dar-lhe metade do chá e perguntar-lhe tudo esta noite, no meio do sono",
        ganha: "Responde a tudo, com a voz de quem fala a um menino: o nome verdadeiro, o sítio, a coisa que o assustava. Numa noite só.",
        custa: "{neta} vê-te arrancar memórias a uma velha meio a dormir, e não te perdoa. E {ama} acorda de manhã a chamar por um menino que já não existe, e não para.",
        efeitos: [{ tipo: "afeicao", papel: "neta", n: -2 }, { tipo: "relogio_do_fio", n: -1 }],
      },
    } },
  },
  solucoes: {
    cabeceira: {
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:servo"],
          texto: "{servo} cai à porta do quarto, com a chávena partida aos pés, e não se volta a erguer, mas respira. O chá espalha-se pelo chão com um cheiro doce de mais." },
        { id: "matou", texto: "{servo} fica à porta do quarto, com a chávena partida aos pés. {ama} acorda com o barulho, olha, e pergunta se já é de manhã." },
      ],
      porta: [{ texto: "Nessa noite, quando {servo} bate com a chávena na mão, é {neta} quem abre — e não deixa entrar. Diz que a avó já dorme. {servo} sorri, deseja as boas-noites, e vai-se. Não volta." }],
    },
    memoria: {
      devolver: [{ texto: "No terceiro dia sem chá, {ama} chama {neta} pelo nome pela primeira vez desde o inverno. Depois chama outro nome, de criança, e põe-se a chorar como se chora um filho." }],
      dormir: [{ texto: "Deixas {ama} dormir. À noite, ao pé da cama, ela canta a canção inteira, até ao fim, e tu escreves cada palavra num papel, à luz de uma vela." }],
      perguntar: [{ texto: "Meio a dormir, {ama} fala contigo como se fosses a criança: «Não tenhas medo, que eu sei onde está.» E diz onde. E diz o resto. {neta}, à porta, tapa a boca com as duas mãos." }],
    },
    achar: {
      coisa: [{ texto: "{fraqueza_coisa} está onde {ama} disse, embrulhada num pano de criança, esquecida há trinta anos. Pesa pouco. Pesa muito." }],
      verdade: [{ texto: "Em {fraqueza_verdade} está o que {ama} lembrou, à vista de quem soubesse olhar. Ninguém sabia. Agora sabes." }],
      palavra: [{ texto: "{ama} diz-to outra vez, mais devagar, para que não te esqueças: o que o assustava em criança, e porquê. «Ainda assusta», diz. «Essas coisas não crescem.»" }],
    },
  },
  reviravoltas: [
    { id: "a_cancao",
      texto: "{neta} canta-te a canção que {ama} canta de noite. É de uma terra que ninguém aqui conhece, e no fim tem um nome — um nome de criança, que ninguém nesta casa alguma vez usou. É o nome de quem toda a terra teme, antes de ser temido.",
      gatilho: ["todos", ["etapa", "neta"], ["consultou", "papel:neta"], ["nenhum", ["etapa", "memoria"]]],
      efeitos: [{ tipo: "quem_e", papel: "ama", linha: "criou quem toda a terra teme, e ainda lhe canta a canção de embalar" }] },
    { id: "a_dose",
      texto: "Não é chá para dormir. É papoila, e muita, e cada noite um pouco mais do que na anterior. Quem o traz não quer só que ela esqueça: quer que acabe, devagar, sem que ninguém dê por isso.",
      gatilho: ["todos", ["etapa", "cha"], ["descobriu", "lugar:asilo"], ["nenhum", ["etapa", "memoria"]]],
      efeitos: [{ tipo: "deixa", premissa: "veneno:servo" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:ama"], ["nenhum", ["derrotou", "papel:ama"]]], ate: "memoria",
      texto: "{ama} não acordou. A última chávena estava vazia em cima da mesa, e a canção acabou a meio, numa noite em que ninguém estava a ouvir." },
  ],
  abandono: { semAvancar: 4,
    texto: "Ninguém foi. Ao fim de uma semana, {ama} já não sabia comer sozinha, e a canção deixou de se ouvir de noite. O chá continuou a chegar, à mesma hora.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "O que {ama} esqueceu tem agora outro guardião: tu. É pouco, uma coisa de infância, um medo pequeno. Os medos pequenos são os que não crescem — e é por isso que ainda servem.",
    efeitos: [{ tipo: "deixa", premissa: "lembra:ama" }],
  },
});

/* O ORGULHO (tipo 2): quem anda com o herói foi o melhor de uma arena, e
   diz que lho roubaram. Não roubaram: perdeu limpo e cuspiu na areia. A
   revanche está marcada, e a casa apostou que não sai vivo. Do melhor (a
   mão que não deu há dez anos) ao pior (a ferida velha abre, e sem a
   confiança inteira não há voz que o faça ceder). A ponte: a arena. */
const A_CABECA_QUE_NAO_SE_BAIXA = quest({
  id: "a_cabeca_que_nao_se_baixa",
  titulo: "A Cabeça Que Não Se Baixa",
  tipo: 2,
  quando: ["cedo", "meio", "fim"],
  afim: [],
  papeis: {
    quem: { de: "grupo", ou: "elo", rotulo: "quem anda contigo" },
    rival: { de: "elenco", cidade: "uma cidade dos atos 2 ou 3", rotulo: "quem ficou com o lugar de {quem}" },
    mestre: { de: "elenco", proximo: "rival", rotulo: "quem ensinou {quem} e {rival}" },
    arena: { de: "lugar", vizinho: "rival", tipos: ["arena", "guilda", "mercado"] },
  },
  mao: null,
  ponte: "{arena} é paga por quem paga a quem manda nele, numa cidade por onde um passo dele vai passar",
  pede: [],
  deixa: [],
  gancho: "Em todas as tabernas por onde passam, {quem} senta-se de costas para os cartazes da arena. Ontem um deles tinha um nome escrito a vermelho — {rival} — e {quem} arrancou-o da parede sem uma palavra, dobrou-o em quatro e guardou-o. Esta noite, ao pé do fogo, pôs-se a afiar uma lâmina que não usa há anos, com os gestos de quem já foi muito bom nisto e quer lembrar-se das mãos.",
  etapas: [
    { id: "sinal", texto: "Perguntar a {quem} quem é {rival}",
      espera: 2, acende: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 1]],
      conclui: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 2], ["conversou", "papel:quem", 2]] },
    { id: "arena", texto: "Ir com {quem} até {arena}",
      ancora: { tipo: 1, concluidas: 1 },
      conclui: ["todos", ["esteve", "lugar:arena"], ["acompanha", "papel:quem"], ["conversou", "papel:rival"]] },
    { id: "conselho", texto: "Dizer a {quem} o que vale uma revanche",
      conclui: ["algum", ["escolheu", "conselho", "honra"], ["escolheu", "conselho", "paz"]],
      ramos: ["honra", "paz"] },
    { id: "areia", texto: "Estar ao lado de {quem} na areia de {arena}",
      conclui: ["algum", ["escolheu", "areia", "ceder"], ["escolheu", "areia", "ate_ao_fim"], ["escolheu", "areia", "trocar"]],
      ramos: ["ceder", "ate_ao_fim", "trocar"] },
  ],
  escolhas: {
    conselho: { etapa: "conselho", opcoes: {
      honra: {
        texto: "dizer a {quem} que há coisas que não se deixam por responder",
        ganha: "{quem} endireita as costas como não endireitava há anos: alguém lhe diz que o que sente não é vaidade, é dívida.",
        custa: "Ajudas o orgulho de {quem} a pôr-se de pé — e o orgulho de pé é o que entra na areia sem saber sair.",
        efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }],
      },
      paz: {
        texto: "dizer a {quem} que não há nada a provar a quem já viu tudo",
        ganha: "{quem} ouve de ti o que ninguém lhe disse em dez anos: que não perdeu o nome, perdeu um combate.",
        custa: "{quem} cala-se, e o silêncio pesa. Há quem ouça «não há nada a provar» como «já não és capaz».",
        efeitos: [],
      },
    } },
    areia: { etapa: "areia", opcoes: {
      ceder: {
        texto: "estar ao lado de {quem} quando baixa a lâmina e diz que {rival} ganhou da primeira vez",
        ganha: "Ninguém sangra na areia, e {quem} diz em voz alta a frase que lhe pesa há dez anos. O que se diz assim não se volta a carregar.",
        custa: "A arena inteira vê {quem} baixar a cabeça, e as arenas não esquecem: o nome fica a ser o de quem desistiu, em todas as tabernas onde se conta. E a casa perde uma aposta que não queria perder.",
        efeitos: [],
      },
      ate_ao_fim: {
        texto: "deixar {quem} lutar até ao fim, como pede o nome que tem",
        ganha: "{quem} entra na areia como entrava há dez anos, e a arena levanta-se: há coisas que merecem ver-se uma vez antes de acabarem.",
        custa: "{quem} tem uma ferida velha que abre ao terceiro assalto, e não sabe ceder. Sem a confiança inteira de {quem} ao teu lado, não há voz na arena que lhe faça baixar a lâmina quando a ferida abrir.",
        efeitos: [],
      },
      trocar: {
        texto: "entrar tu na areia, no lugar de {quem}",
        ganha: "{quem} não arrisca a ferida velha, e {rival} encontra pela frente quem não tem nada a provar.",
        custa: "Tiras a {quem} o combate de uma vida, à frente de toda a gente que o conheceu no tempo dele. Há coisas que se perdoam e não se esquecem.",
        efeitos: [],
      },
    } },
  },
  solucoes: {
    conselho: {
      honra: [{ texto: "{quem} acena devagar, e volta à lâmina, e afia-a até de madrugada, com um cuidado que parece reza." }],
      paz: [{ texto: "{quem} não responde. Pousa a lâmina, e de manhã ainda lá está, ao pé das cinzas, até ao momento de partir — e aí pega nela na mesma." }],
    },
    areia: {
      ceder: [{ texto: "{quem} entra na areia, para a três passos de {rival}, e baixa a lâmina até tocar no chão. A arena demora a perceber. Depois percebe, e o silêncio é tão grande que se ouve a areia a escorrer da lâmina." }],
      ate_ao_fim: [{ texto: "{quem} entra na areia sem olhar para trás, e a arena levanta-se. O primeiro assalto é bonito de ver. O segundo também. Ao terceiro, tu já sabes, e {quem} também sabe." }],
      trocar: [{ texto: "Pões a mão no ombro de {quem} à entrada da areia e passas à frente. Ouves, atrás de ti, a lâmina de {quem} a cair no chão de pedra. Não te viras." }],
    },
  },
  reviravoltas: [
    { id: "o_cartaz",
      texto: "{quem} conta, por fim, à maneira de {quem}: foi o melhor de {arena} sete anos seguidos, e numa tarde de verão {rival}, que tinha sido aprendiz ao lado, ficou-lhe com o lugar. Com batota, diz {quem}. Um golpe que não se dá. Nunca mais entrou numa arena — nem para ver.",
      gatilho: ["todos", ["etapa", "sinal"], ["conversou", "papel:quem", 3], ["nenhum", ["etapa", "areia"]]],
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "foi o melhor da arena sete anos, e diz que lho roubaram" }] },
    { id: "a_tarde_de_verao",
      texto: "{mestre} diz-te o que {quem} não diz: não houve batota nenhuma. {quem} perdeu limpo, à frente de todos — e no fim, em vez de dar a mão, partiu a lâmina de {rival} ao meio e cuspiu na areia. Foi por isso que nunca mais o deixaram voltar. Não foi a derrota. Foi a cuspidela.",
      gatilho: ["todos", ["etapa", "arena"], ["consultou", "papel:mestre"], ["nenhum", ["etapa", "areia"]]],
      efeitos: [{ tipo: "quem_e", papel: "mestre", linha: "ensinou os dois, e viu um deles cuspir na areia em vez de dar a mão" }] },
    { id: "a_aposta_da_casa",
      texto: "Nos livros de {arena}, a casa apostou tudo no mesmo resultado: que {quem} não sai da areia pelo próprio pé. Quem paga a casa também paga o juiz do combate, e o juiz não vai parar nada. Ceder, aqui, não é só engolir o orgulho: é estragar a aposta de quem manda nisto.",
      gatilho: ["todos", ["etapa", "arena"], ["descobriu", "lugar:arena"], ["nenhum", ["etapa", "areia"]]],
      efeitos: [{ tipo: "deixa", premissa: "aposta:arena" }] },
  ],
  desfechos: [
    { id: "a_mao_dada",
      quando: ["todos", ["escolheu", "areia", "ceder"], ["escolheu", "conselho", "paz"], ["afeicao", "papel:quem", 3]],
      texto: "{quem} baixa a lâmina antes do primeiro assalto e diz, alto, para a arena inteira ouvir: «Ganhaste da primeira vez. Ganhaste limpo.» Depois estende a mão a {rival} — a mão que não deu há dez anos. A casa perde a aposta, o juiz fica sem saber para onde olhar, e {mestre} desce à areia e abraça os dois ao mesmo tempo. Nessa noite, {quem} pendura a lâmina na parede da taberna e deixa-a lá.",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "rival" }] },
    { id: "o_chao_da_arena",
      quando: ["todos", ["escolheu", "areia", "ate_ao_fim"], ["afeicao", "papel:quem", 3]],
      texto: "{quem} luta como lutava, e perde como já tinha perdido. Ao terceiro assalto, quando a ferida abre, olha para ti do meio da areia — e baixa a lâmina. Cai de joelhos com a arena de pé. {rival} estende-lhe a mão para o levantar, e desta vez {quem} aceita-a.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "lutou a revanche até onde a ferida deixou, e baixou a lâmina a tempo" }] },
    { id: "a_venia_engolida",
      quando: ["escolheu", "areia", "ceder"],
      texto: "{quem} baixa a lâmina e diz que {rival} ganhou, com a voz de quem engole pedras. Não estende a mão. Sai da arena pelo meio da multidão, sem olhar para ninguém, e durante uma semana não te dirige a palavra. Depois, numa noite, diz só: «Era verdade.»",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "disse à arena inteira que perdeu limpo, e ainda lhe custa" }] },
    { id: "o_lugar_tomado",
      quando: ["escolheu", "areia", "trocar"],
      texto: "Entras tu. Ganhas ou perdes — e pouco importa, porque {quem} vê tudo da bancada, de braços cruzados, como um estranho. Na estrada, nunca fala do combate. Fala de tudo menos disso, e tu percebes que lhe tiraste a única coisa que vinha cá buscar.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -5 }, { tipo: "quem_e", papel: "quem", linha: "viu outra pessoa entrar na areia da revanche que era sua" }] },
    { id: "o_cartaz_dobrado", padrao: true,
      texto: "{quem} nunca chega a entrar em {arena}. Guarda o cartaz dobrado em quatro, e às vezes, à noite, desdobra-o e fica a olhar para o nome a vermelho até a fogueira se apagar.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "quem_e", papel: "quem", linha: "guarda dobrado o cartaz de uma revanche a que nunca foi" }] },
    { id: "sem_rival", cedo: true,
      quando: ["todos", ["morto", "papel:rival"], ["nenhum", ["etapa", "areia"]]],
      texto: "{rival} morreu antes da revanche. {quem} vai ao enterro e fica ao fundo, com a lâmina afiada à cintura e nada para fazer com ela. É a pior derrota de todas: a que já não se pode desfazer.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "foi ao enterro de quem lhe ficou com o lugar, com a lâmina afiada para nada" }] },
    { id: "o_orgulho_sem_dono", cedo: true,
      quando: ["morto", "papel:quem"],
      texto: "{quem} morreu sem a revanche. Levas tu o cartaz dobrado a {arena}, e deixa-lo em cima da areia, e não sabes se é uma desistência ou um desafio.",
      efeitos: [] },
    { id: "a_ferida_velha",
      quando: ["todos", ["escolheu", "areia", "ate_ao_fim"], ["nenhum", ["afeicao", "papel:quem", 3]]],
      texto: "Ao terceiro assalto a ferida velha abre, como sabias que abria. {quem} não olha para ti: olha para {rival}, e para a arena de pé, e não baixa a lâmina. O juiz não para nada — foi pago para não parar. Quando a areia assenta, {rival} está de joelhos ao lado de {quem}, a gritar por um físico, e já não há nada a chamar.",
      efeitos: [{ tipo: "morte", papel: "quem" }] },
  ],
  abandono: { semAvancar: 15, desfecho: "o_cartaz_dobrado" },
});

/* A HERANÇA ENVENENADA (tipo 2): um tio deixa a quem nunca teve nada uma
   terra roubada, e a confissão do roubo na segunda folha. A família a quem
   foi tirada ainda a trabalha, agradecida. Do melhor (a terra devolvida, e
   a faca do tio: «era ele, não és tu») ao pior (ficar com ela sem nunca ter
   falado com o primo que a esperava — e o vinho do brinde é dele). A ponte:
   quem escreveu a dívida falsa escreve hoje para a mão dele. */
const O_QUE_O_TIO_DEIXOU = quest({
  id: "o_que_o_tio_deixou",
  titulo: "O Que o Tio Deixou",
  tipo: 2,
  quando: ["cedo", "meio", "fim"],
  afim: [],
  papeis: {
    quem: { de: "grupo", ou: "elo", rotulo: "quem anda contigo" },
    caseira: { de: "elenco", cidade: "uma cidade dos atos 2 ou 3", rotulo: "quem trabalha a terra de {herdade}" },
    primo: { de: "elenco", proximo: "caseira", rotulo: "{primo:o primo que esperava a herança|a prima que esperava a herança}" },
    herdade: { de: "lugar", vizinho: "caseira", tipos: ["taverna", "forja", "mercado", "guilda"] },
    testamento: { de: "item", nome: "o testamento selado", nasce: "quem" },
  },
  mao: null,
  ponte: "a dívida que tirou {herdade} à família de {caseira} foi escrita por quem escreve hoje para a mão que manda nele, numa cidade por onde um passo dele vai passar",
  pede: [],
  deixa: [],
  gancho: "Um correio alcançou-vos na estrada, com um selo de notário, e {quem} leu-o duas vezes e riu-se — riu-se como nunca o tinhas visto rir. Morreu-lhe um tio, e deixou-lhe tudo: {herdade}, as terras à volta, e o nome da casa. {quem}, que nunca teve onde cair morto, passou a noite a fazer contas no chão com um pau. De manhã já não se ria. Tinha lido a segunda folha.",
  etapas: [
    { id: "sinal", texto: "Perguntar a {quem} o que diz a segunda folha",
      espera: 2, acende: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 1]],
      conclui: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 2], ["conversou", "papel:quem", 2]] },
    { id: "herdade", texto: "Ir com {quem} a {herdade}",
      ancora: { tipo: 1, concluidas: 1 },
      conclui: ["todos", ["esteve", "lugar:herdade"], ["acompanha", "papel:quem"], ["conversou", "papel:caseira"]] },
    { id: "conselho", texto: "Dizer a {quem} o que se faz com uma herança assim",
      conclui: ["algum", ["escolheu", "conselho", "guardar"], ["escolheu", "conselho", "devolver"]],
      ramos: ["guardar", "devolver"] },
    { id: "assinatura", texto: "Estar ao lado de {quem} na hora de assinar",
      conclui: ["algum", ["escolheu", "assinar", "ficar"], ["escolheu", "assinar", "devolver"], ["escolheu", "assinar", "vender"]],
      ramos: ["ficar", "devolver", "vender"] },
  ],
  escolhas: {
    conselho: { etapa: "conselho", opcoes: {
      guardar: {
        texto: "dizer a {quem} que o que o tio fez é do tio, e a terra é de quem a herda",
        ganha: "{quem} respira: alguém lhe diz que não tem de pagar as dívidas de um morto com a única coisa que alguma vez teve.",
        custa: "Ajudas {quem} a ficar com uma terra que tem dono vivo, e a dormir debaixo de um telhado pago com a ruína de outra família.",
        efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }],
      },
      devolver: {
        texto: "dizer a {quem} que uma terra roubada continua roubada, seja quem for que a herde",
        ganha: "{quem} ouve de ti o que a segunda folha já lhe disse em voz baixa: que há heranças que não se aceitam.",
        custa: "Pedes a {quem}, que nunca teve nada, que dê tudo no dia em que o teve. Se a mão lhe tremer, a culpa também é tua.",
        efeitos: [],
      },
    } },
    assinar: { etapa: "assinatura", opcoes: {
      ficar: {
        texto: "deixar {quem} assinar e ficar com {herdade}",
        ganha: "{quem} tem, pela primeira vez na vida, um sítio que é seu, com o nome da casa por cima da porta.",
        custa: "{caseira} continua a trabalhar a terra que foi da família, agora para {quem}. E há quem esperasse esta herança a vida inteira: se ninguém foi falar com {primo} antes da assinatura, é {primo} quem serve o vinho do brinde.",
        efeitos: [],
      },
      devolver: {
        texto: "ficar ao lado de {quem} enquanto rasga a escritura e a devolve a {caseira}",
        ganha: "A terra volta a quem foi tirada, e o nome do tio deixa de pesar a {quem}.",
        custa: "{quem} sai de {herdade} como entrou: sem nada. E o resto da família nunca lhe perdoa ter dado a estranhos o que era do sangue.",
        efeitos: [],
      },
      vender: {
        texto: "deixar {quem} vender {herdade} ao comprador que já está à porta, e partir",
        ganha: "Ninguém tem de decidir nada debaixo daquele telhado: {quem} sai com a bolsa cheia, e a terra fica para quem a quiser.",
        custa: "O comprador paga demais e depressa, e não pergunta por {caseira}. Quem compra assim já sabe o que vai fazer à terra — e a quem está nela.",
        efeitos: [],
      },
    } },
  },
  solucoes: {
    conselho: {
      guardar: [{ texto: "{quem} dobra a segunda folha muito pequena e guarda-a no fundo da mochila, onde não se vê, e passa o resto do dia a falar de telhados." }],
      devolver: [{ texto: "{quem} não responde. Lê a segunda folha outra vez, à luz do fogo, e de manhã tem os olhos de quem não dormiu." }],
    },
    assinatura: {
      ficar: [{ texto: "{quem} molha a pena e assina, com a letra grande de quem aprendeu tarde. O notário sopra a tinta. Lá fora, {caseira} continua a cavar, sem levantar a cabeça." }],
      devolver: [{ texto: "{quem} pega na escritura com as duas mãos e rasga-a ao meio, e outra vez, e outra vez, até ser pó de papel. O notário levanta-se da cadeira e volta a sentar-se." }],
      vender: [{ texto: "O comprador já tem o dinheiro contado num saco de couro, como se soubesse o preço antes de o perguntar. {quem} assina sem ler, e saem de {herdade} antes do meio-dia." }],
    },
  },
  reviravoltas: [
    { id: "a_segunda_folha",
      texto: "{quem} lê-te a segunda folha, por fim. É do tio, e é uma confissão: {herdade} não foi comprada. Foi tirada, há trinta anos, à família de {caseira}, com uma dívida que nunca existiu e um juiz que se pagou bem. O tio pede perdão — a {quem}, não à família. E pede-lhe que guarde a terra, porque custou caro.",
      gatilho: ["todos", ["etapa", "sinal"], ["conversou", "papel:quem", 3], ["nenhum", ["etapa", "assinatura"]]],
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "herdou uma terra roubada, e a confissão de quem a roubou" }] },
    { id: "as_flores_na_campa",
      texto: "{caseira} não sabe que {quem} sabe. Fala do tio sem ódio nenhum, e isso é pior: foi o tio que lhe deu trabalho na terra que tinha sido da família, e {caseira} agradeceu-lhe durante trinta anos. Ainda leva flores à campa dele aos domingos.",
      gatilho: ["todos", ["etapa", "herdade"], ["consultou", "papel:caseira"], ["nenhum", ["etapa", "assinatura"]]],
      efeitos: [{ tipo: "quem_e", papel: "caseira", linha: "trabalha há trinta anos, agradecida, a terra que foi tirada à família" }] },
    { id: "o_brinde",
      texto: "{primo} aparece em {herdade} de braços abertos, a dar os parabéns, e insiste em pagar o vinho da assinatura. Cuidou do tio nos últimos dois anos, diz. Esperava outra coisa do testamento, diz, a rir. Ri-se demais.",
      gatilho: ["todos", ["etapa", "herdade"], ["conheceu", "papel:primo"], ["nenhum", ["etapa", "assinatura"]]],
      efeitos: [{ tipo: "quem_e", papel: "primo", linha: "cuidou do tio dois anos, e esperava outra coisa do testamento" }] },
  ],
  desfechos: [
    { id: "a_terra_devolvida",
      quando: ["todos", ["escolheu", "assinar", "devolver"], ["consultou", "papel:caseira"], ["afeicao", "papel:quem", 3]],
      texto: "{quem} rasga a escritura à frente de {caseira} e diz-lhe tudo: a dívida falsa, o juiz, a confissão. {caseira} ouve de pé, e depois senta-se no chão da cozinha que foi da mãe e chora como se chora uma coisa guardada trinta anos. À despedida, dá a {quem} a única coisa da casa que era do tio: uma faca de cabo de osso. «Era ele. Não és tu.»",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "caseira" }] },
    { id: "o_dono_justo",
      quando: ["todos", ["escolheu", "assinar", "ficar"], ["conversou", "papel:primo"]],
      texto: "{quem} assina e fica. Paga a {caseira} o dobro do que o tio pagava, dá-lhe o melhor quarto da casa, e nunca lhe conta a segunda folha. {primo} brinda com eles, a sorrir, e vai-se embora no dia seguinte. {quem} tem um telhado. Aos domingos, quando vê {caseira} levar flores à campa do tio, entra em casa antes que volte.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "ficou com uma terra roubada, e paga o dobro a quem foi roubado sem lhe dizer porquê" }] },
    { id: "a_terra_vendida",
      quando: ["escolheu", "assinar", "vender"],
      texto: "{quem} vende. Sai de {herdade} com uma bolsa que nunca teve, e paga-te o melhor vinho da estrada nessa noite. Um mês depois chega a notícia: o comprador mandou {caseira} embora da terra e deitou a casa abaixo para fazer outra coisa. {quem} não comenta. Paga o vinho até a bolsa acabar.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "vendeu uma terra roubada a quem pôs na rua quem lá trabalhava" }] },
    { id: "a_devolucao_amarga",
      quando: ["escolheu", "assinar", "devolver"],
      texto: "{quem} rasga a escritura e devolve a terra. Não conta a {caseira} porquê; diz só que não a quer. {caseira} não percebe, e agradece demais, e {quem} sai de {herdade} sem olhar para trás — mais pobre do que entrou, e mais zangado contigo do que com o tio.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -5 }, { tipo: "quem_e", papel: "quem", linha: "devolveu a herança sem dizer porquê, e ainda não sabe se te perdoa" }] },
    { id: "o_testamento_selado", padrao: true,
      texto: "{quem} nunca chega a ir a {herdade}. Guarda o testamento no fundo da mochila, e um dia a terra vai a leilão por falta de dono, e quem a compra nunca se sabe.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "quem_e", papel: "quem", linha: "nunca foi buscar a herança que lhe deixaram" }] },
    { id: "sem_caseira", cedo: true,
      quando: ["todos", ["morto", "papel:caseira"], ["nenhum", ["etapa", "assinatura"]]],
      texto: "{caseira} morreu antes de saber. {quem} fica com uma terra sem ninguém a quem a devolver, e com a segunda folha, que agora já não serve de nada a ninguém.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "ficou com uma terra roubada sem ninguém vivo a quem a devolver" }] },
    { id: "a_heranca_sem_herdeiro", cedo: true,
      quando: ["morto", "papel:quem"],
      texto: "{quem} morreu com a herança por assinar. O testamento vem-te parar às mãos, e és tu quem decide o que se diz em {herdade} — ou se lá vais sequer.",
      efeitos: [] },
    { id: "o_vinho_do_brinde",
      quando: ["todos", ["escolheu", "assinar", "ficar"], ["nenhum", ["conversou", "papel:primo"]]],
      texto: "{quem} assina e fica, e à noite há vinho na mesa grande, servido por {primo}, que insistiu em pagar. Ninguém foi falar com {primo} antes. Ninguém lhe perguntou o que esperava do testamento. {quem} bebe o primeiro copo à saúde do tio, e antes do segundo já não consegue segurar o copo. A herança passa a quem a esperava, como sempre devia ter passado — é o que {primo} diz ao juiz, no dia seguinte.",
      efeitos: [{ tipo: "morte", papel: "quem" }] },
  ],
  abandono: { semAvancar: 15, desfecho: "o_testamento_selado" },
});

/* A VINGANÇA HERDADA (tipo 2): quem anda com o herói jurou, aos doze anos,
   à cabeceira da mãe, matar quem lhe matou o pai. O Dobre: o pai vendia
   raparigas das aldeias, e quem o matou é hoje velho, quase cego, e
   levado pela mão por uma criança da idade do juramento. Do melhor (a
   pergunta feita, e o nome de quem comprava) ao pior (o aviso dado pelas
   costas, sem a confiança inteira — e a casa avisada espera armada). A
   ponte: quem comprava ainda compra, para a mão dele. */
const O_JURAMENTO_A_CABECEIRA = quest({
  id: "o_juramento_a_cabeceira",
  titulo: "O Juramento à Cabeceira",
  tipo: 2,
  quando: ["cedo", "meio", "fim"],
  afim: [],
  papeis: {
    quem: { de: "grupo", ou: "elo", rotulo: "quem anda contigo" },
    alvo: { de: "elenco", cidade: "uma cidade dos atos 2 ou 3", rotulo: "quem matou o pai de {quem}" },
    neta: { de: "elenco", proximo: "alvo", rotulo: "{neta:o neto de quem quase já não vê|a neta de quem quase já não vê}" },
    casa: { de: "lugar", vizinho: "alvo", tipos: ["templo", "forja", "mercado", "taverna"] },
  },
  mao: null,
  ponte: "quem comprava o que o pai de {quem} vendia ainda compra, e hoje para a mão que manda nele, numa cidade por onde um passo dele vai passar",
  pede: [],
  deixa: [],
  gancho: "{quem} tem uma frase que diz antes de dormir, baixinho, todas as noites, como outros rezam. Julgavas que era uma oração. Ontem ouviste-a inteira, porque o vento estava do teu lado: é um nome, e uma promessa, e a promessa é de sangue. Esta manhã, numa encruzilhada, {quem} parou a olhar para a placa de uma cidade e disse, sem se virar: «Está lá.»",
  etapas: [
    { id: "sinal", texto: "Perguntar a {quem} de quem é o nome da frase",
      espera: 2, acende: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 1]],
      conclui: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 2], ["conversou", "papel:quem", 2]] },
    { id: "casa", texto: "Ir com {quem} até {casa}, onde vive quem tem esse nome",
      ancora: { tipo: 1, concluidas: 1 },
      conclui: ["todos", ["esteve", "lugar:casa"], ["acompanha", "papel:quem"], ["conheceu", "papel:alvo"]] },
    { id: "conselho", texto: "Dizer a {quem} o que vale um juramento feito a uma mãe",
      conclui: ["algum", ["escolheu", "juramento", "cumprir"], ["escolheu", "juramento", "quebrar"]],
      ramos: ["cumprir", "quebrar"] },
    { id: "noite", texto: "Estar com {quem} na noite em que vai a casa de {alvo}",
      conclui: ["algum", ["escolheu", "noite", "deixar"], ["escolheu", "noite", "perguntar"], ["escolheu", "noite", "avisar"]],
      ramos: ["deixar", "perguntar", "avisar"] },
  ],
  escolhas: {
    juramento: { etapa: "conselho", opcoes: {
      cumprir: {
        texto: "dizer a {quem} que um juramento feito a uma moribunda não se desfaz",
        ganha: "{quem} deixa de andar dividido entre a mãe e o resto do mundo: alguém lhe diz que a promessa é sagrada, e que não a carrega sozinho.",
        custa: "Ajudas {quem} a afiar uma lâmina para alguém que ainda não ouviste. E um juramento regado cresce mais depressa do que a dúvida.",
        efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }],
      },
      quebrar: {
        texto: "dizer a {quem} que ninguém herda o ódio de outro, nem de uma mãe",
        ganha: "{quem} ouve de ti a única coisa que não se atrevia a pensar: que a mãe já não está, e a vida é {quem:dele|dela}.",
        custa: "Pões em causa a última coisa que {quem} prometeu à mãe. Se o juramento ficar a meio, a culpa também é tua — e {quem} vai lembrar-se disso cada noite em que não disser a frase.",
        efeitos: [],
      },
    } },
    noite: { etapa: "noite", opcoes: {
      deixar: {
        texto: "deixar {quem} cumprir o juramento, e ficar à porta",
        ganha: "{quem} cumpre o que prometeu à mãe, e acaba-se de uma vez a frase de todas as noites.",
        custa: "Quem vai morrer é velho, e não foge, e tem {neta} a dormir no quarto ao lado. O que {quem} fizer esta noite, faz à frente de alguém que se vai lembrar para sempre.",
        efeitos: [],
      },
      perguntar: {
        texto: "entrar com {quem} e pedir-lhe que pergunte porquê, antes de tudo",
        ganha: "Ninguém morre sem antes se dizer a verdade, e {quem} fica a saber o que a mãe nunca lhe contou.",
        custa: "Há perguntas que não se desperguntam. Se a resposta for a que temes, {quem} perde a mãe outra vez — e o juramento fica sem chão, sem nada no lugar.",
        efeitos: [],
      },
      avisar: {
        texto: "avisar {alvo} pelas costas de {quem}, antes da noite",
        ganha: "Ninguém morre esta noite: {alvo} tem tempo de sair, e {quem} fica de mãos limpas, queira ou não.",
        custa: "Traís o juramento de {quem} sem lhe perguntar. E se {quem} não confiar em ti o bastante para te ouvir antes de sair, não vai esperar por ti: vai de noite, sozinho, a uma casa avisada, onde há quem espere armado.",
        efeitos: [],
      },
    } },
  },
  solucoes: {
    conselho: {
      cumprir: [{ texto: "{quem} diz a frase nessa noite mais alto do que nunca, e no fim dorme a noite inteira, pela primeira vez desde que o conheces." }],
      quebrar: [{ texto: "{quem} não diz a frase nessa noite. Fica deitado de olhos abertos, a mexer os lábios sem som, até de madrugada." }],
    },
    noite: {
      deixar: [{ texto: "Ficas à porta, de costas para a casa, a ouvir a noite. Ouves uma porta, passos, uma voz velha que diz um nome — o de {quem} — como quem já esperava ouvi-lo um dia." }],
      perguntar: [{ texto: "Entram os dois. {alvo} está sentado ao lume, e vira a cara para o barulho sem a ver. {quem} tem a lâmina na mão, e a mão treme, e pergunta. A pergunta sai pequena, de criança." }],
      avisar: [{ texto: "Bates à porta de {alvo} ao fim da tarde, sozinho, e dizes o que tens a dizer em poucas palavras. {alvo} ouve, acena, e agradece-te — não pela vida, diz, mas por {neta}." }],
    },
  },
  reviravoltas: [
    { id: "a_frase",
      texto: "{quem} conta. Tinha doze anos, e a mãe morria numa cama de palha, e antes de morrer agarrou-lhe o pulso com uma força que já não tinha e fê-lo jurar: o nome de quem lhe matou o pai, e que esse nome não morria de velho. {quem} jurou. Diz a frase todas as noites desde então, para não se esquecer — ou para não se esquecer de que jurou.",
      gatilho: ["todos", ["etapa", "sinal"], ["conversou", "papel:quem", 3], ["nenhum", ["etapa", "noite"]]],
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "jurou à cabeceira da mãe matar quem lhe matou o pai" }] },
    { id: "o_que_o_pai_vendia",
      texto: "{alvo} não nega nada, nem pede nada. Diz só, devagar, porque já o disse muitas vezes a si próprio: o pai de {quem} vendia raparigas das aldeias a quem as levava para o mar, e numa noite levou a irmã de {alvo}. Matou-o na estrada, de manhã, e nunca soube que deixava alguém em casa. Pergunta se {quem} quer saber o nome de quem as comprava. Ainda compra.",
      gatilho: ["todos", ["etapa", "casa"], ["consultou", "papel:alvo"], ["nenhum", ["etapa", "noite"]]],
      efeitos: [{ tipo: "quem_e", papel: "alvo", linha: "matou, há muitos anos, quem vendia raparigas das aldeias — e sabe a quem as vendia" }] },
    { id: "a_crianca_que_guia",
      texto: "{neta} leva {alvo} pela mão até à porta, porque {alvo} já quase não vê. Tem a idade que {quem} tinha quando jurou. Olha para {quem} como se olha para um viajante simpático, e oferece-lhe água.",
      gatilho: ["todos", ["etapa", "casa"], ["conheceu", "papel:neta"], ["nenhum", ["etapa", "noite"]]],
      efeitos: [{ tipo: "quem_e", papel: "neta", linha: "leva pela mão quem já quase não vê, e tem a idade de um juramento" }] },
  ],
  desfechos: [
    { id: "o_nome_de_quem_comprava",
      quando: ["todos", ["escolheu", "noite", "perguntar"], ["consultou", "papel:alvo"], ["afeicao", "papel:quem", 3]],
      texto: "{quem} pergunta porquê, e {alvo} responde, e a resposta cai em cima de {quem} como uma casa. Fica muito tempo calado. Depois diz a frase de todas as noites, uma última vez, em voz alta, e no fim acrescenta uma coisa que lá não estava: «Mãe, não.» {alvo} dá-lhe o nome de quem comprava. É o primeiro juramento novo que {quem} faz em vinte anos, e é teu também.",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "alvo" }] },
    { id: "o_juramento_cumprido",
      quando: ["escolheu", "noite", "deixar"],
      texto: "{quem} entra, e tu ficas à porta. Não há gritos. Quando {quem} sai, traz as mãos limpas e os olhos vazios, e atrás de {quem} ouves {neta} acordar e chamar por alguém que não responde. {quem} cumpriu. Nessa noite não diz a frase. Nunca mais a diz — e nunca mais dorme direito.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "cumpriu o juramento à cabeceira da mãe, e não voltou a dormir direito" }, { tipo: "inimigo", papel: "neta" }] },
    { id: "a_resposta_sem_paz",
      quando: ["escolheu", "noite", "perguntar"],
      texto: "{quem} pergunta, e {alvo} diz só: «Fui eu.» Não explica, não pede perdão. {quem} fica com a lâmina na mão e a pergunta por responder, e sai sem fazer nada, e passa o resto da noite a andar na estrada, para a frente e para trás, como quem perdeu o caminho de casa.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "perguntou porquê a quem lhe matou o pai, e não teve resposta" }] },
    { id: "a_casa_vazia",
      quando: ["todos", ["escolheu", "noite", "avisar"], ["afeicao", "papel:quem", 3]],
      texto: "{quem} chega de noite a uma casa vazia, com a porta aberta e a lareira fria. Percebe logo. Não te diz nada durante três dias. Ao quarto, diz só: «Eu não ia conseguir. Tu sabias.» E não volta a dizer a frase.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -5 }, { tipo: "quem_e", papel: "quem", linha: "encontrou vazia a casa da vingança, e sabe quem a avisou" }] },
    { id: "a_frase_de_todas_as_noites", padrao: true,
      texto: "{quem} nunca chega a fazer o caminho até {casa}. Continua a dizer a frase todas as noites, baixinho, e tu continuas a fingir que é uma oração.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "quem_e", papel: "quem", linha: "diz todas as noites um juramento que nunca foi cumprir" }] },
    { id: "sem_alvo", cedo: true,
      quando: ["todos", ["morto", "papel:alvo"], ["nenhum", ["etapa", "noite"]]],
      texto: "{alvo} morreu antes de {quem} chegar — a única coisa que a mãe tinha pedido que não acontecesse. {quem} fica à porta do enterro, e não sabe se o juramento ficou quebrado ou só ficou sem ninguém.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "chegou tarde ao nome do juramento, e ficou à porta do enterro" }] },
    { id: "o_juramento_sem_dono", cedo: true,
      quando: ["morto", "papel:quem"],
      texto: "{quem} morreu com o juramento por cumprir. A frase de todas as noites fica contigo: sabe-la de cor, de tanto a ouvir. Decides tu se a levas até {casa}, ou se a deixas morrer na estrada.",
      efeitos: [] },
    { id: "a_casa_avisada",
      quando: ["todos", ["escolheu", "noite", "avisar"], ["nenhum", ["afeicao", "papel:quem", 3]]],
      texto: "{quem} não te esperou. Foi de noite, sozinho, à casa que avisaste — e a casa estava à espera, com a gente da rua armada atrás da porta, porque quem é amado numa terra não se avisa em vão. {neta} grita para pararem. Já ninguém ouve. De manhã trazem {quem} numa porta arrancada, e {alvo}, que não vê, pede para lhe tocar na cara, e chora.",
      efeitos: [{ tipo: "morte", papel: "quem" }] },
  ],
  abandono: { semAvancar: 15, desfecho: "a_frase_de_todas_as_noites" },
});

/* O REGRESSO DE QUEM SE JULGAVA MORTO (tipo 2): quem anda com o herói tem
   uma pedra com o próprio nome num cemitério de aldeia. Foi dado por morto
   e vendido às galés; em casa há agora outra pessoa, que é boa, e uma
   criança que chama pai a quem a ensinou a pescar. Do melhor (os quatro à
   mesma mesa, e um lugar para sempre) ao pior (reclamar a casa sem a
   confiança inteira — vai de noite, sozinho, e quem guarda a casa abre com
   uma lâmina). A ponte: quem o vendeu serve a mão dele. */
const O_MORTO_QUE_VOLTOU_A_CASA = quest({
  id: "o_morto_que_voltou_a_casa",
  titulo: "O Morto Que Voltou a Casa",
  tipo: 2,
  quando: ["cedo", "meio", "fim"],
  afim: [],
  papeis: {
    quem: { de: "grupo", ou: "elo", rotulo: "quem anda contigo" },
    esposo: { de: "elenco", cidade: "uma cidade dos atos 2 ou 3", rotulo: "quem {quem} deixou em casa" },
    novo: { de: "elenco", proximo: "esposo", rotulo: "quem ocupa agora o lugar de {quem}" },
    filho: { de: "elenco", proximo: "esposo", rotulo: "{filho:o rapaz que tinha três anos|a rapariga que tinha três anos}" },
    aldeia: { de: "lugar", vizinho: "esposo", tipos: ["taverna", "mercado", "templo", "forja"] },
  },
  mao: null,
  ponte: "quem deu {quem} por morto, e vendeu às galés o que sobrou, serve hoje a mão que manda nele, numa cidade por onde um passo dele vai passar",
  pede: [],
  deixa: [],
  gancho: "{quem} não tem família. Disse-to no primeiro dia, e nunca mais falou disso. Ontem, num cemitério à beira da estrada de {aldeia}, onde pararam para tirar água do poço, {quem} ficou muito tempo de pé diante de uma pedra pequena, com um nome gravado e uma data de há sete anos. Era o nome de {quem}. Não disse nada. Tirou a água, bebeu, e só à noite, ao pé do fogo, perguntou se achavas que os mortos têm direito a voltar.",
  etapas: [
    { id: "sinal", texto: "Perguntar a {quem} de quem é a pedra",
      espera: 2, acende: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 1]],
      conclui: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 2], ["conversou", "papel:quem", 2]] },
    { id: "aldeia", texto: "Ir com {quem} a {aldeia}, sem que ninguém {quem:o|a} reconheça",
      ancora: { tipo: 1, concluidas: 1 },
      conclui: ["todos", ["esteve", "lugar:aldeia"], ["acompanha", "papel:quem"], ["conheceu", "papel:esposo"]] },
    { id: "conselho", texto: "Dizer a {quem} se os mortos têm direito a voltar",
      conclui: ["algum", ["escolheu", "regresso", "voltar"], ["escolheu", "regresso", "ficar_morto"]],
      ramos: ["voltar", "ficar_morto"] },
    { id: "casa", texto: "Estar ao lado de {quem} na noite em que decide",
      conclui: ["algum", ["escolheu", "casa", "reclamar"], ["escolheu", "casa", "mostrar"], ["escolheu", "casa", "partir"]],
      ramos: ["reclamar", "mostrar", "partir"] },
  ],
  escolhas: {
    regresso: { etapa: "conselho", opcoes: {
      voltar: {
        texto: "dizer a {quem} que ninguém perde a vida por uma pedra com o nome errado",
        ganha: "{quem} ouve o que precisava de ouvir de alguém: que está vivo, e que a vida que deixou ainda é {quem:dele|dela}.",
        custa: "Há uma casa naquela aldeia que demorou sete anos a parar de chorar. O que se acorda não volta a dormir.",
        efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }],
      },
      ficar_morto: {
        texto: "dizer a {quem} que há vidas que se fecharam bem, e que se abrem mal",
        ganha: "{quem} ouve de ti o que tinha medo de ouvir, e é um alívio: alguém lhe diz que deixar em paz também é amar.",
        custa: "Pedes a {quem} que continue morto para quem mais amou. E isso, para quem o carrega, é morrer outra vez todos os dias.",
        efeitos: [],
      },
    } },
    casa: { etapa: "casa", opcoes: {
      reclamar: {
        texto: "ficar com {quem} enquanto reclama a casa, {esposo} e {filho}",
        ganha: "{quem} volta para o sítio que era seu: a mesma mesa, a mesma cama, {filho} a crescer debaixo dos olhos de quem lhe deu o nome.",
        custa: "Há outra pessoa naquela casa, que foi boa durante sete anos e não fez nada de mal. Alguém sai ferido, e não és tu. E sem a confiança inteira de {quem} ao teu lado, não vai esperar por ti para bater à porta: vai de noite, sozinho, a uma casa onde há quem a guarde.",
        efeitos: [],
      },
      mostrar: {
        texto: "ficar ao lado de {quem} enquanto se mostra a {esposo}, e depois partir",
        ganha: "Ninguém continua a chorar um vivo, e ninguém perde a casa que tem: {esposo} sabe, e decide o que quer fazer com o que sabe.",
        custa: "{quem} vai ver a cara de {esposo} no momento em que percebe, e depois vai ter de virar costas. Há despedidas que se fazem uma vez e pesam a vida inteira.",
        efeitos: [],
      },
      partir: {
        texto: "sair de {aldeia} antes de amanhecer, sem que ninguém saiba",
        ganha: "A casa fica como estava: em paz, com o morto no sítio dos mortos. Ninguém sofre outra vez.",
        custa: "{quem} parte morto, e fica morto, e {filho} nunca vai saber que esteve a dez passos de quem lhe deu o nome.",
        efeitos: [],
      },
    } },
  },
  solucoes: {
    conselho: {
      voltar: [{ texto: "{quem} acena, devagar, e passa a mão pela cara como quem confere que ainda lá está. De manhã, lava-se no rio com um cuidado que não tinha." }],
      ficar_morto: [{ texto: "{quem} acena, e é um aceno de alívio, e envergonha-se do alívio. Passa o resto da noite de costas para a estrada de {aldeia}." }],
    },
    casa: {
      reclamar: [{ texto: "{quem} veste a camisa lavada e sai antes de ti, com a cara de quem vai a um julgamento. Ao portão da casa, para. Respira. Bate." }],
      mostrar: [{ texto: "{quem} espera por {esposo} no poço, ao fim da tarde, e não diz nada: tira só o chapéu. {esposo} olha. Olha outra vez. O balde cai." }],
      partir: [{ texto: "Saem antes do galo, pela estrada de baixo. À saída de {aldeia}, uma janela acende-se, e {quem} para um instante, e depois não para mais." }],
    },
  },
  reviravoltas: [
    { id: "as_gales",
      texto: "{quem} conta, por fim: há sete anos saiu de {aldeia} com uma carroça de lã para vender, e na estrada levaram-{quem:no|na} os homens de um capitão que precisava de remos. A quem perguntou, disseram que tinha caído ao rio. Sete anos de galé. Quando fugiu, já havia uma pedra com o nome no cemitério — e não teve coragem de a desmentir.",
      gatilho: ["todos", ["etapa", "sinal"], ["conversou", "papel:quem", 3], ["nenhum", ["etapa", "casa"]]],
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "foi dado por morto e vendido às galés, e tem uma pedra com o nome no cemitério da terra" }] },
    { id: "a_outra_pessoa",
      texto: "Em casa de {esposo} há mais alguém: {novo}, que chegou à aldeia no terceiro inverno e ficou. Arranjou o telhado que {quem} deixou a meio. Ensinou {filho} a pescar. É boa gente — vê-se de longe, e é isso o pior.",
      gatilho: ["todos", ["etapa", "aldeia"], ["conheceu", "papel:novo"], ["nenhum", ["etapa", "casa"]]],
      efeitos: [{ tipo: "quem_e", papel: "novo", linha: "arranjou o telhado e ensinou a pescar a criança de alguém que se julgava morto" }] },
    { id: "a_pedra_limpa",
      texto: "{esposo}, sem saber com quem fala, conta-te que ainda vai limpar a pedra todos os meses. Não por saudade, diz. Por gratidão: foi preciso a pedra para conseguir voltar a viver.",
      gatilho: ["todos", ["etapa", "aldeia"], ["consultou", "papel:esposo"], ["nenhum", ["etapa", "casa"]]],
      efeitos: [{ tipo: "quem_e", papel: "esposo", linha: "ainda limpa todos os meses a pedra de quem julga morto" }] },
  ],
  desfechos: [
    { id: "os_dois_lugares",
      quando: ["todos", ["escolheu", "casa", "mostrar"], ["conversou", "papel:novo"], ["afeicao", "papel:quem", 3]],
      texto: "{quem} mostra-se. {esposo} deixa cair o balde, e durante muito tempo ninguém diz nada. Depois é {novo} quem fala primeiro — e o que diz é o nome de {quem}, e «senta-te», e põe mais um prato na mesa. Jantam os quatro. De manhã {quem} parte, com a bênção de todos e um lugar à mesa sempre que passar, e {filho} corre atrás da carroça até à ponte a perguntar quando voltas.",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "esposo" }] },
    { id: "a_pedra_partida",
      quando: ["escolheu", "casa", "mostrar"],
      texto: "{quem} mostra-se. {esposo} chora, e abraça, e depois afasta-se — porque há outra pessoa à porta, e uma criança que pergunta quem é. {quem} vai-se embora antes do jantar. No caminho, para no cemitério e parte a pedra com o próprio nome, devagar, com uma pedra maior.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "mostrou-se vivo a quem o chorou, e partiu a própria pedra ao sair" }] },
    { id: "o_lugar_reclamado",
      quando: ["todos", ["escolheu", "casa", "reclamar"], ["afeicao", "papel:quem", 3]],
      texto: "{quem} bate à porta de dia, contigo ao lado, e diz quem é. {esposo} escolhe, e escolhe {quem}. {novo} sai de casa nessa mesma tarde com o que trouxe há quatro invernos, e mais nada. {filho} demora muito tempo a chamar a {quem} outra coisa que não «tu». Mas está em casa.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "voltou dos mortos e reclamou a casa, e alguém bom teve de sair dela" }] },
    { id: "morto_por_vontade",
      quando: ["escolheu", "casa", "partir"],
      texto: "Saem antes de amanhecer. {quem} não olha para trás, e quando passam pelo cemitério tira o chapéu à própria pedra, como se tira a um desconhecido. Daí em diante, quando lhe perguntam se tem família, diz que teve.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -5 }, { tipo: "quem_e", papel: "quem", linha: "escolheu continuar morto para quem mais amou" }] },
    { id: "a_estrada_ao_lado", padrao: true,
      texto: "{quem} nunca chega a entrar em {aldeia}. Faz a estrada de largo, pelo outro lado do vale, e o nome na pedra continua a ser limpo todos os meses por quem já não espera ninguém.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "quem_e", papel: "quem", linha: "passou ao largo da terra onde tem uma pedra com o próprio nome" }] },
    { id: "sem_esposo", cedo: true,
      quando: ["todos", ["morto", "papel:esposo"], ["nenhum", ["etapa", "casa"]]],
      texto: "{esposo} morreu antes de saber. {quem} vai ao enterro como um estranho, e fica de pé ao lado da pedra com o próprio nome, que é agora a do lado.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "foi como um estranho ao enterro de quem o chorou sete anos" }] },
    { id: "morto_duas_vezes", cedo: true,
      quando: ["morto", "papel:quem"],
      texto: "{quem} morreu, desta vez de verdade. Em {aldeia} já há uma pedra com o nome certo. Cabe-te a ti decidir se lhes contas que a primeira mentia.",
      efeitos: [] },
    { id: "a_noite_na_aldeia",
      quando: ["todos", ["escolheu", "casa", "reclamar"], ["nenhum", ["afeicao", "papel:quem", 3]]],
      texto: "{quem} não te esperou. Foi de noite, sozinho, bater à porta da casa que era sua — e quem abriu foi {novo}, de lâmina na mão, porque é isso que faz quem guarda uma casa de noite. Não houve tempo para nomes. {esposo} só reconhece {quem} à luz da candeia, já no chão da soleira que {quem} pisou mil vezes, e o grito acorda a aldeia inteira.",
      efeitos: [{ tipo: "morte", papel: "quem" }] },
  ],
  abandono: { semAvancar: 15, desfecho: "a_estrada_ao_lado" },
});

/* O lote, pela ordem: os dois rostos e os dois confrontos à cabeça, as
   cinco do «meio», e as quatro do coração. A biblioteca concatena-o depois
   do lote 5. */
export const QUESTS_LOTE_6 = [
  OS_DADOS_DELE, A_MESMA_TEMPESTADE, A_NONA_NOITE, O_ULTIMO_BARCO,
  O_TEU_NOME_NA_PAREDE, O_POSTO_DO_CAPITAO_MORTO, AS_ARMAS_DO_POCO, O_RECADO_VERDADEIRO, O_QUE_A_AMA_ESQUECEU,
  A_CABECA_QUE_NAO_SE_BAIXA, O_QUE_O_TIO_DEIXOU, O_JURAMENTO_A_CABECEIRA, O_MORTO_QUE_VOLTOU_A_CASA,
];
