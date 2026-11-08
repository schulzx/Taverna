/* ============================================================
   O ACERVO, LOTE 4 — dez quests (sete do tipo 1, três do tipo 2)
   (09/11/2026, Fase BQ · BQ8)

   A pessoa, 09/11: «termine o acervo». A planta pede 36 do tipo 1 e 16
   do tipo 2 (mente/plano-biblioteca-de-quests.md, §9), e a biblioteca
   tinha 12 e 5. A partir deste lote, CADA LOTE VIVE NO SEU FICHEIRO
   (src/acervo/quests-lote-N.js), a exportar um array de fichas: duas mãos
   podem escrever dois lotes ao mesmo tempo sem tocar no mesmo ficheiro, e
   `biblioteca-de-quests.js` só ganha uma linha de import e uma de
   concatenação por lote. Os lotes 1 a 3 ficam onde estavam.

   UM LOTE NÃO IMPORTA NADA. A ficha é dado: os vocabulários (predicados,
   efeitos, papéis, naturezas) estão na biblioteca, e é a biblioteca quem
   importa o lote e o valida (`validarQuest`). Importar a biblioteca daqui
   faria um ciclo — o lote seria lido antes de a biblioteca existir.

   O QUE ESTE LOTE FECHA (o esqueleto mediu, 08/11):
     · o vilão que é bicho (549 de 1000 mundos) sentava-se à mesa do
       Convite e à cabeceira do Velório. À Luz do Dia é o rosto de uma
       fera: uma demonstração, não uma conversa — mostra o que é e o que
       quer, e o herói pode recuar. O Fundo da Toca é o confronto dela.
       As duas dizem-no no papel `vilao` (`aceita: ["fera"]`, das
       NATUREZAS_DO_FIO); Do Outro Lado do Vau serve as duas naturezas;
     · 18,8% dos mundos não têm um servo que seja gente: O Fundo da
       Pedreira (passo 3) e O Enforcado de Amanhã (passos 3 e 4) aceitam
       um servo bicho ou gente, e os textos servem os dois;
     · o passo 4 das espinhas de quatro atos ficava por contestar em 216
       de 500 campanhas: O Enforcado de Amanhã é mais uma do «meio»
       contra o 3 e o 4;
     · o resto varia o «quando», o «afim» e os passos: O Livro dos Nomes
       (cedo, 1 e 2, o recurso) e As Mãos Que Curam (cedo e meio, 2 e 3).
   E três do coração com temas que o acervo ainda não tinha: a promessa
   a um morto, a dívida de vida, e o filho que não se conheceu.

   A voz que a pessoa pediu: «maravilhosas, provocantes e intensas».
   Provocar é a escolha que custa dos dois lados, com os dois verdadeiros
   (a Grande Lista do Dungeon Geek 21 — o «Dobre», o «Surpreenda», o
   «Dobre, parte dois» — e a mesa do Matt Mercer: o que o herói não
   perguntou volta para o morder). Nos textos onde o vilão ou o servo
   podem ser um bicho, nenhum adjetivo nem pronome lhes dá género.
   ============================================================ */
const quest = (q) => q;

/* O ROSTO DE UMA FERA (passo 5): não se senta à mesa nem paga enterros.
   Vem ao meio-dia, à vista de todos, e mostra. O herói recua, fica, ou dá
   o que ela veio buscar — e dar faz dela aliada (o pacto do confronto). */
const A_LUZ_DO_DIA = quest({
  id: "a_luz_do_dia",
  titulo: "À Luz do Dia",
  tipo: 1,
  enredo: 27,                                   // «Correndo da Manopla»: o perigo é uma forma de falar
  quando: ["meio", "fim"],
  afim: ["jornada", "arquipelago"],
  papeis: {
    vilao: { de: "fio", papel: "vilao", aceita: ["fera"], alcunha: "o que veio à luz do dia", rotulo: "o que veio à luz do dia" },
    campo: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["mercado", "arena", "cemitério"] },
    vigia: { de: "elenco", do: "campo", rotulo: "quem viu tudo da torre" },
    pequeno: { de: "elenco", proximo: "vigia", rotulo: "{pequeno:o que ficou do lado de lá|a que ficou do lado de lá}" },
  },
  mao: { tipo: "rosto", contra: [5], papel: "vilao" },
  pede: [],
  deixa: ["conhece:vilao"],
  gancho: "Não veio de noite. Veio ao meio-dia, com o sol a pique e a feira cheia, e ficou no meio de {campo} como quem chega a casa. Não matou ninguém. Arrancou o portão do sítio, pousou-o de lado, devagar, e ficou a olhar para cada cara, uma a uma, como quem procura uma. {vigia} viu tudo da torre e jura que não era fome. Era outra coisa. Ainda lá está.",
  etapas: [
    { id: "torre", texto: "Ouvir {vigia}", conclui: ["conversou", "papel:vigia"] },
    { id: "alcance", texto: "Pôr-te ao alcance de {vilao}, em {campo}",
      conclui: ["todos", ["esta_em", "lugar:campo"], ["conheceu", "papel:vilao"]] },
    { id: "gesto", texto: "Responder ao que {vilao} te mostra",
      conclui: ["algum", ["escolheu", "rosto", "recuar"], ["escolheu", "rosto", "ficar"], ["escolheu", "rosto", "dar"]],
      ramos: ["recuar", "ficar", "dar"] },
    { id: "depois", texto: "Contar a {vigia} o que viste de perto",
      conclui: ["todos", ["conversou", "papel:vigia", 2], ["nenhum", ["esta_em", "lugar:campo"]]] },
  ],
  escolhas: {
    rosto: { etapa: "gesto", opcoes: {
      recuar: {
        texto: "baixar a arma e recuar, passo a passo, sem lhe virar as costas",
        ganha: "Ninguém sangra em {campo} hoje. Ao cair da tarde, {vilao} vai-se pelo mesmo caminho por onde veio, e a feira volta a respirar.",
        custa: "{vilao} viu-te recuar à frente da vila inteira, e agora sabe a que distância começas a ter medo. Da próxima vez vem mais perto, e {vigia} não te volta a olhar da mesma maneira.",
        efeitos: [{ tipo: "relogio_do_fio", n: 1 }, { tipo: "afeicao", papel: "vigia", n: -1 }],
      },
      ficar: {
        texto: "ficar onde estás, de arma em baixo, e deixar que venha até ti",
        ganha: "Chega tão perto que lhe sentes o peso no chão. Demora-se, mede-te, e vai-se sem tocar em ninguém: há coisas que só se mostram a quem não foge, e tu viste-as.",
        custa: "Fica com o teu cheiro. A partir de hoje, onde quer que durmas, {vilao} sabe para que lado olhar — e {pequeno} viu tudo de muito perto, e não volta a dormir às escuras.",
        efeitos: [{ tipo: "avisa_vilao" }, { tipo: "quem_e", papel: "pequeno", linha: "viu de perto o que veio à luz do dia, e já não dorme às escuras" }],
      },
      dar: {
        texto: "deixar-lhe o que veio buscar: o gado da vila, todo, à porta de {campo}",
        ganha: "{vilao} leva o que quis e não pede mais. A vila fica inteira, as casas de pé, e ninguém tem de enterrar ninguém esta lua.",
        custa: "A vila passa o inverno sem gado, e {vilao} aprende que este sítio paga — e que és tu quem abre a porta. Volta a vir buscar, e já te trata como coisa sua.",
        efeitos: [{ tipo: "aliado", papel: "vilao" }, { tipo: "relogio_regional", n: 1 }, { tipo: "afeicao", papel: "vigia", n: -1 }],
      },
    } },
  },
  solucoes: {
    gesto: {
      recuar: [{ texto: "Recuas. Cada passo custa mais do que o anterior. {vilao} não te segue: fica a ver-te ir, e só quando chegas à esquina é que se volta para o portão arrancado e o empurra mais um palmo, como quem assina." }],
      ficar: [{ texto: "Ficas. {vilao} vem, devagar, e a feira inteira cala-se à tua volta. Passa tão perto que a sombra te cobre. Depois vai-se, sem pressa, e deixa no chão de {campo} uma marca funda, virada para o lado de onde vieste." }],
      dar: [{ texto: "Abrem os currais. O gado sai sozinho, como se soubesse para onde ia, e {vilao} leva-o à frente para fora da vila sem olhar para trás. Ninguém aplaude. Ninguém chora. A vila fica muito tempo a olhar para o portão no chão." }],
    },
  },
  reviravoltas: [
    { id: "a_licao",
      texto: "{vigia} conta o resto, de olhos no chão: antes desta, {vilao} já tinha estado noutras três vilas, sempre ao meio-dia, sempre à vista de todos. Em nenhuma matou. Em todas, quem estava à frente fugiu — e as três pagam agora a quem promete que não volta. Não é fome. É uma lição, e a vila é o quadro onde se escreve.",
      gatilho: ["todos", ["etapa", "torre"], ["consultou", "papel:vigia"], ["nenhum", ["etapa", "gesto"]]],
      efeitos: [{ tipo: "quem_e", papel: "vigia", linha: "viu da torre o que veio à luz do dia, e sabe que não era fome" }] },
    { id: "o_do_lado_de_la",
      texto: "Do outro lado de {campo}, {pequeno:encolhido|encolhida} atrás de uma carroça virada, está {pequeno}, a um salto de {vilao}. Ninguém foi lá buscar ninguém. Seja o que for que respondas, respondes com isso à vista — e não respondes antes de lá chegar.",
      gatilho: ["todos", ["etapa", "alcance"], ["nenhum", ["etapa", "gesto"]], ["conheceu", "papel:pequeno"]],
      efeitos: [{ tipo: "exige", etapa: "gesto", condicao: ["conversou", "papel:pequeno"] }] },
    { id: "o_ferrete",
      texto: "De tão perto, vês o que de longe ninguém vê: uma marca antiga, funda, gravada a ferro onde a pele é mais fina. Alguém já teve {vilao} preso, um dia. E alguém conseguiu.",
      gatilho: ["escolheu", "rosto", "ficar"],
      efeitos: [{ tipo: "deixa", premissa: "ferrete:vilao" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:pequeno"], ["nenhum", ["derrotou", "papel:pequeno"]]], ate: "gesto",
      texto: "Ninguém foi buscar {pequeno} a tempo. {vilao} nem lhe tocou: foi o portão, que caiu para o lado onde não devia. A vila enterra {pequeno} ao fim da tarde, e à porta das casas aparecem as primeiras moedas para quem prometer que não volta." },
  ],
  abandono: { semAvancar: 3,
    texto: "Ninguém foi a {campo}. Ao terceiro dia, {vilao} foi-se à mesma hora a que tinha chegado, e na semana seguinte a vila já pagava a quem prometia que não voltava.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "Já não é rumor nem rasto. Sabes o tamanho que tem, a cor dos olhos, o som que faz no chão. E {vilao} sabe a tua cara, e o cheiro que deixas onde passas.",
    efeitos: [{ tipo: "deixa", premissa: "conhece:vilao" }],
  },
});

/* O CONFRONTO DE UMA FERA (passo 6): o fundo do covil, onde as coisas
   grandes já não saem porque tudo lhes vem trazido. A sentença tem as três
   que DESFECHOS_DO_VILAO lê (poupar, acabar, selar); a dívida do pacto
   abre-se a quem lhe deu o que veio buscar (o «dar» d'À Luz do Dia); a
   fraqueza tem os três papéis, um por família — a voz a que ainda
   obedece, a coisa que a verga, a verdade de onde veio. O guarda da boca
   aceita gente ou fera. */
const O_FUNDO_DA_TOCA = quest({
  id: "o_fundo_da_toca",
  titulo: "O Fundo da Toca",
  tipo: 1,
  enredo: 24,                                   // «Caixa de Pandora»: fechar a fonte, com o Surpreenda
  quando: ["fim"],
  afim: ["jornada", "arquipelago"],
  papeis: {
    vilao: { de: "fio", papel: "vilao", aceita: ["fera"], alcunha: "o que dorme no fundo de {toca}", rotulo: "o que dorme no fundo de {toca}" },
    toca: { de: "lugar", e: "o covil dele", tipos: ["cemitério", "docas", "arena", "quartel"] },
    guarda: { de: "fio", papel: "tenente", aceita: ["gente", "fera"], alcunha: "o que vigia a boca de {toca}", rotulo: "o que vigia a boca de {toca}" },
    levado: { de: "elenco", exige: ["vivo", "querido_do_heroi"], rotulo: "{levado:quem foi levado para o fundo|quem foi levada para o fundo}" },
    guia: { de: "elenco", do: "toca", rotulo: "quem conhece o caminho de baixo" },
    fraqueza_quem: { de: "elenco", fraqueza: "pessoa", rotulo: "a voz a que {vilao} ainda obedece" },
    fraqueza_coisa: { de: "item", fraqueza: "coisa" },
    fraqueza_verdade: { de: "lugar", fraqueza: "verdade" },
  },
  mao: { tipo: "confronto", contra: [6], papel: "vilao" },
  pede: [],
  deixa: ["caiu:vilao"],
  gancho: "Há uma boca na terra em {toca}, e o que vive lá dentro já não sai: chegou ao tamanho em que tudo lhe vem trazido. Lá em baixo, entre ossos arrumados por tamanho, está {levado} — com vida, diz {guia}, porque {vilao} não come o que pode servir de isco. {guarda} vigia a boca. O resto do caminho é para baixo, e às escuras.",
  etapas: [
    { id: "boca", texto: "Chegar à boca de {toca}", conclui: ["esteve", "lugar:toca"] },
    { id: "passagem", texto: "Passar por {guarda}",
      conclui: ["algum", ["derrotou", "papel:guarda"], ["todos", ["consultou", "papel:guia"], ["descobriu", "lugar:toca"]]],
      ramos: ["luta", "fenda"] },
    { id: "levado", texto: "Chegar a {levado} antes de {vilao} acordar", conclui: ["acompanha", "papel:levado"] },
    { id: "frente", texto: "Pôr {vilao} com a cabeça no chão",
      conclui: ["algum", ["derrotou", "papel:vilao"], ["escolheu", "prova", "expor"]],
      ramos: ["luta", "prova"] },
    { id: "sentenca", texto: "Decidir o que fica de {vilao}",
      conclui: ["algum", ["escolheu", "sentenca", "poupar"], ["escolheu", "sentenca", "acabar"], ["escolheu", "sentenca", "selar"]],
      ramos: ["poupar", "acabar", "selar"] },
  ],
  escolhas: {
    pacto: { etapa: "divida", opcoes: {
      cumprir: {
        texto: "deixar-lhe o vale, como ficou combinado, e levar {levado} pela mão",
        ganha: "Ninguém mais desce a {toca}, e o que lá vive não sobe: o vale fica-lhe, o resto da região fica de fora, e {levado} sai contigo pelo próprio pé.",
        custa: "Há um vale inteiro onde já não se pode pôr os pés, e gente que lá tinha casa. E {vilao} sabe que foste tu que lhe deste a terra — um dia vem pedir mais, e é a ti que pede.",
        efeitos: [{ tipo: "deixa", premissa: "pacto:vilao" }],
      },
      romper: {
        texto: "rasgar o que se combinou e descer na mesma",
        ganha: "Ficas sem dívida, e com o caminho todo pela frente.",
        custa: "{vilao} ouve-te chegar antes de chegares. E é {levado} quem paga a primeira resposta.",
        efeitos: [{ tipo: "situacao", papel: "levado", situacao: "ferida" }, { tipo: "rompe_laco", papel: "vilao" }],
      },
    } },
    prova: { etapa: "prova", opcoes: {
      expor: {
        texto: "pôr diante de {vilao} aquilo a que ainda obedece",
        ganha: "{vilao} baixa a cabeça sem que uma lâmina se erga, como a baixava antes de ser grande demais para alguém.",
        custa: "Uma coisa destas só se usa uma vez. E o que baixou a cabeça à frente de um estranho não esquece quem o viu assim.",
        efeitos: [{ tipo: "deixa", premissa: "humilhado:vilao" }],
      },
      guardar: {
        texto: "guardar o que trazes, e decidir à lâmina",
        ganha: "Ninguém vai dizer que venceste com truques: venceste no fundo da toca, no chão que era seu.",
        custa: "Se a luta correr mal, cais lá em baixo com a coisa que vergava {vilao} no bolso, e {levado} contigo.",
        efeitos: [],
      },
    } },
    sentenca: { etapa: "sentenca", opcoes: {
      poupar: {
        texto: "deixar {vilao} viver, e sair pela boca de {toca} sem olhar para trás",
        ganha: "Ninguém vai contar que acabaste com a última coisa daquele tamanho que havia no mundo. E o que é poupado com a cabeça no chão lembra-se de quem o poupou.",
        custa: "Fica com vida, com feridas e com memória, debaixo dos pés de toda a região. As coisas grandes saram devagar, mas saram.",
        efeitos: [{ tipo: "deixa", premissa: "poupado:vilao" }],
      },
      acabar: {
        texto: "acabar com {vilao} ali, no fundo da toca",
        ganha: "Acabou. A região inteira vai dormir de janela aberta, e ninguém tem de voltar a descer ali.",
        custa: "Matar o que já não se defende não se desfaz. E lá em baixo há coisas pequenas que ficam sem quem lhes traga de comer.",
        efeitos: [{ tipo: "deixa", premissa: "caiu:vilao" }],
      },
      selar: {
        texto: "deitar abaixo a boca de {toca}, com {vilao} lá dentro",
        ganha: "Nem sangue nem fuga: a terra fecha-se por cima, e o que lá estava fica com a escuridão que escolheu.",
        custa: "Uma toca fechada continua a ser uma toca. Um dia alguém vai cavar — e o que subir vai lembrar-se de quem fechou a porta.",
        efeitos: [{ tipo: "deixa", premissa: "selado:vilao" }],
      },
    } },
  },
  solucoes: {
    passagem: {
      luta: [
        { id: "poupou", quando: ["poupou", "papel:guarda"],
          texto: "{guarda} cai à boca de {toca} e não se volta a erguer, mas respira. Deixas assim. Lá em baixo, alguma coisa ouviu tudo." },
        { id: "matou", texto: "{guarda} fica onde caiu, à boca de {toca}, e o eco desce à tua frente pelo escuro, de pedra em pedra, até ao fundo." },
      ],
      fenda: [{ texto: "{guia} leva-te por uma fenda que só os da terra conhecem, de gatas entre raízes. Sais do outro lado de {guarda}, nas costas, sem que nada te tenha ouvido." }],
    },
    divida: {
      cumprir: [{ fecha: "concluida",
        texto: "Lá do fundo sobe {levado}, a tremer, pelo próprio pé, e {vilao} fica onde está. Ninguém puxa de uma arma. Fecha-se um acordo sem palavras, e o vale que fica para trás é o preço que só tu sabes quanto pesa." }],
      romper: [{ texto: "Dizes que não, alto, para o escuro. Lá do fundo responde um som que não é palavra, e logo a seguir a voz de {levado}, a gritar." }],
    },
    frente: {
      luta: [
        { id: "poupou", quando: ["poupou", "papel:vilao"],
          texto: "{vilao} cai de lado no chão da toca, a arfar, e não se volta a erguer. A lâmina está na tua mão, e a decisão também." },
        { id: "matou", fecha: "concluida",
          texto: "{vilao} cai, e o chão da toca treme uma última vez. Depois fica tudo tão calado que ouves {levado} respirar ao teu lado.",
          efeitos: [{ tipo: "deixa", premissa: "caiu:vilao" }] },
      ],
      prova: [
        { id: "pessoa", quando: ["acompanha", "papel:fraqueza_quem"],
          texto: "{fraqueza_quem} dá um passo em frente, no escuro, e chama {vilao} por um nome que ninguém usa há muitos anos. E {vilao}, do tamanho que tem, baixa a cabeça até ao chão como um cão velho." },
        { id: "coisa", quando: ["tem", "item:fraqueza_coisa"],
          texto: "Ergues {fraqueza_coisa} à luz da tocha, e {vilao} recua até à parede do fundo, a tremer, como recuava antes de ser grande demais para alguém." },
        { texto: "Dizes em voz alta, no fundo da toca, o que fizeram a {vilao} antes de ser isto. Não sabes se entende as palavras. Entende o resto. E deita-se, devagar, como quem se cansa de uma guerra muito velha." },
      ],
    },
    sentenca: {
      poupar: [{ texto: "Viras costas e sobes, com {levado} pela mão. Ninguém te segue. À boca da toca, a luz do dia custa-te a olhar, como se tivesses estado lá em baixo muito mais tempo." }],
      acabar: [{ texto: "Um golpe só. O fundo da toca fica tão calado que se ouve, lá mais para dentro, uma coisa pequena a chamar por quem já não vem." }],
      selar: [{ texto: "Tiram-se os esteios da boca, um a um, e a terra fecha-se por cima com um suspiro comprido. {guia} põe a mão na pedra nova e fica muito tempo assim." }],
    },
  },
  reviravoltas: [
    { id: "a_divida_cobrada",
      texto: "À boca de {toca} não há quem a guarde: há ossos arrumados em fila, à espera, como um recibo do que lhe deram da outra vez. {vilao} lembra-se de quem lhe abriu a porta, e lá do fundo sobe o recado, sem palavras: o vale por {levado}, e ficam quites.",
      gatilho: ["todos", ["etapa", "boca"], ["nenhum", ["etapa", "passagem"]], ["relacao", "papel:vilao", "aliado"]],
      efeitos: [{ tipo: "abre_etapa", antes: "passagem", etapa: {
        id: "divida", texto: "Responder ao que {vilao} propõe",
        conclui: ["algum", ["escolheu", "pacto", "cumprir"], ["escolheu", "pacto", "romper"]],
        ramos: ["cumprir", "romper"] } }] },
    { id: "a_prova_na_mao",
      texto: "O que trazes contigo pesa mais a cada degrau para baixo. Lá no fundo, alguma coisa vai reconhecê-lo antes de lho mostrares — e isso pode chegar.",
      gatilho: ["todos", ["etapa", "boca"], ["nenhum", ["etapa", "frente"]],
        ["algum", ["acompanha", "papel:fraqueza_quem"], ["tem", "item:fraqueza_coisa"], ["descobriu", "lugar:fraqueza_verdade"]]],
      efeitos: [{ tipo: "abre_etapa", antes: "frente", etapa: {
        id: "prova", texto: "Pôr diante de {vilao} o que ainda o verga",
        conclui: ["algum", ["escolheu", "prova", "expor"], ["escolheu", "prova", "guardar"]],
        ramos: ["expor", "guardar"] } }] },
    { id: "o_ninho",
      texto: "{guia} diz-te, já lá em baixo, o que ninguém cá em cima sabe: o fundo de {toca} não é covil, é ninho. Há coisas pequenas no escuro, e foi por elas que {vilao} ficou deste tamanho e deste humor. O que decidires lá em baixo, decides por elas também.",
      gatilho: ["todos", ["etapa", "passagem"], ["consultou", "papel:guia"], ["nenhum", ["etapa", "sentenca"]]],
      efeitos: [{ tipo: "quem_e", papel: "guia", linha: "sabe que o fundo da toca é um ninho, e nunca o disse a ninguém cá em cima" }, { tipo: "deixa", premissa: "ninho:toca" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:levado"], ["nenhum", ["derrotou", "papel:levado"]]], ate: "levado",
      texto: "Chegaste ao sítio onde {levado} estava, e já só havia o sítio. Lá do fundo vem um som que se parece com uma gargalhada, e não é. A toca fica com mais um osso arrumado na fila." },
    { quando: ["todos", ["morto", "papel:vilao"], ["nenhum", ["derrotou", "papel:vilao"]]], ate: "frente",
      texto: "Outra mão chegou primeiro ao fundo, e {vilao} morreu sem te ver. Mas o ninho não morreu com o corpo — e o que lá cresce já sabe o caminho para cima." },
  ],
  abandono: { semAvancar: 8,
    texto: "Ninguém desceu. {levado} não voltou a ser visto, e na lua seguinte a boca de {toca} estava duas vezes mais larga.",
    efeitos: [{ tipo: "relogio_do_fio", n: 2 }, { tipo: "situacao", papel: "levado", situacao: "cativa" }] },
  fecho: {
    texto: "Sobes à luz com {levado} ao lado e terra até aos cotovelos. Lá fora, o vale é só um vale outra vez, e o silêncio que vem do fundo de {toca} já não é de alguém à espera.",
    efeitos: [{ tipo: "afeicao", papel: "levado", n: 1 }, { tipo: "aliado", papel: "guia" }],
  },
});

/* A CONSEQUÊNCIA DO PASSO 3: a pedreira não caiu, fecharam-na — e quem a
   fechou deixou de guarda um servo que pode ser bicho ou gente. Cavar,
   rebentar, ou obrigar quem tirou os esteios a descer primeiro. */
const O_FUNDO_DA_PEDREIRA = quest({
  id: "o_fundo_da_pedreira",
  titulo: "O Fundo da Pedreira",
  tipo: 1,
  enredo: 8,                                    // «Não coma os roxos»: presos até alguém chegar
  quando: ["meio"],
  afim: ["jornada", "reinado"],
  papeis: {
    pedreira: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["forja", "guilda", "mercado"] },
    cavadora: { de: "elenco", do: "pedreira", rotulo: "quem cava sem parar" },
    capataz: { de: "elenco", proximo: "cavadora", rotulo: "quem mandou fechar a boca da pedreira" },
    guarda: { de: "fio", papel: "tenente", aceita: ["gente", "fera"], alcunha: "o que não deixa cavar", rotulo: "o que não deixa cavar" },
  },
  mao: { tipo: "consequencia", contra: [3], papel: "guarda", tambem: ["tenente"] },
  pede: [],
  deixa: ["aliado:cavadora"],
  gancho: "A pedreira de {pedreira} fechou-se há quatro dias, com onze lá dentro, na mesma noite em que se cumpriu o que andava a ser preparado nesta terra. Ainda batem na pedra, lá do fundo — menos, a cada manhã. {cavadora} cava à boca com as mãos em sangue, porque um dos onze é filho {cavadora:dele|dela}. Ninguém ajuda. Quem tentou encontrou {guarda} à espera, e não voltou a tentar.",
  etapas: [
    { id: "boca", texto: "Ouvir {cavadora} à boca de {pedreira}",
      conclui: ["todos", ["esteve", "lugar:pedreira"], ["conversou", "papel:cavadora"]] },
    { id: "guarda", texto: "Tirar {guarda} da boca da pedreira",
      conclui: ["algum", ["derrotou", "papel:guarda"], ["todos", ["consultou", "papel:capataz"], ["descobriu", "lugar:pedreira"]]],
      ramos: ["lamina", "respiro"] },
    { id: "fundo", texto: "Decidir como se chega aos que estão em baixo",
      conclui: ["algum", ["escolheu", "pedra", "cavar"], ["escolheu", "pedra", "polvora"], ["escolheu", "pedra", "capataz"]],
      ramos: ["cavar", "polvora", "capataz"] },
    { id: "luz", texto: "Ver quem sobe da pedreira", conclui: ["todos", ["esteve", "lugar:pedreira"], ["conversou", "papel:cavadora", 2]] },
  ],
  escolhas: {
    pedra: { etapa: "fundo", opcoes: {
      cavar: {
        texto: "cavar com {cavadora} pela boca, pedra a pedra, até lhes chegar",
        ganha: "Chegam a todos. Sobem um a um pela corda, magros e cegos da luz, e nenhum fica lá em baixo.",
        custa: "Três dias de pá e de corda, sem sair dali, enquanto lá fora a terra fica entregue a si mesma. Quem fez isto anda mais três dias à solta.",
        efeitos: [{ tipo: "dia", n: 3 }, { tipo: "relogio_do_fio", n: 1 }],
      },
      polvora: {
        texto: "rebentar a parede de lado com a pólvora do armazém de {capataz}",
        ganha: "Ao fim da tarde há um buraco por onde passa uma pessoa, e a pedreira devolve os que ainda respiram.",
        custa: "O estrondo ouve-se na região inteira, e quem fechou a pedreira fica a saber quem a abriu. A pedra que cai não escolhe: nem todos sobem pelo próprio pé, e a pedreira não volta a dar pedra.",
        efeitos: [{ tipo: "avisa_vilao" }, { tipo: "relogio_regional", n: 1 }],
      },
      capataz: {
        texto: "obrigar {capataz} a descer primeiro, à frente de todos, e a abrir o que fechou",
        ganha: "Quem sabe onde tirou os esteios sabe onde os pôr: {capataz} desce a tremer e mostra o sítio, e a vila inteira vê quem pagou o quê.",
        custa: "Pões uma vida à frente das outras, à força e à vista de todos. Se a pedra ceder, é {capataz} que fica lá em baixo — e há quem na vila não perdoe a quem obrigou alguém a descer.",
        efeitos: [{ tipo: "inimigo", papel: "capataz" }, { tipo: "afeicao", papel: "cavadora", n: 1 }],
      },
    } },
  },
  solucoes: {
    guarda: {
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:guarda"],
          texto: "{guarda} cai junto à boca da pedreira e não se volta a erguer, mas respira. {cavadora} nem olha: já está a cavar." },
        { id: "matou", texto: "{guarda} fica onde caiu, junto à boca, e {cavadora} passa por cima de pá na mão, sem uma palavra." },
      ],
      respiro: [{ texto: "{capataz} leva-te, de má vontade, ao respiro velho do lado de lá do monte, tapado com tábuas há vinte anos. {guarda} continua a guardar uma boca por onde já ninguém precisa de entrar." }],
    },
    fundo: {
      cavar: [{ texto: "Ao terceiro dia, a pá de {cavadora} bate em vazio. Lá de baixo vem uma voz rouca a pedir água, e depois outra, e depois um nome — o do filho. {cavadora} senta-se no chão de pedra e não consegue levantar-se." }],
      polvora: [{ texto: "A parede rebenta com um estrondo que fecha os ouvidos à vila inteira. Quando a poeira assenta, há uma mão a sair do buraco, e outra a puxá-la, e gente a tossir à luz." }],
      capataz: [{ texto: "{capataz} desce à frente, de lanterna a tremer, e põe as mãos na pedra certa sem precisar de procurar. A vila inteira percebe ao mesmo tempo o que isso quer dizer." }],
    },
  },
  reviravoltas: [
    { id: "a_boca_fechada_por_dentro",
      texto: "A pedreira não caiu: fecharam-na. {capataz} confessa-o de olhos no chão — pagaram-lhe em prata para tirar os esteios na noite em que os onze viram, lá em baixo, o que não deviam ter visto. E ainda tem a prata, toda, dentro de uma bota.",
      gatilho: ["todos", ["etapa", "boca"], ["consultou", "papel:capataz"], ["nenhum", ["etapa", "fundo"]]],
      efeitos: [{ tipo: "quem_e", papel: "capataz", linha: "tirou os esteios de uma pedreira com onze lá dentro, a troco de prata" }] },
    { id: "as_batidas",
      texto: "Encostas o ouvido à pedra e contas as batidas, como {cavadora} faz todas as manhãs. Hoje são oito. Ontem, diz {cavadora}, eram nove. Lá em baixo, alguém escolhe quem bate e quem já não precisa.",
      gatilho: ["todos", ["esteve", "lugar:pedreira"], ["descobriu", "lugar:pedreira"], ["nenhum", ["etapa", "fundo"]]],
      efeitos: [{ tipo: "relogio_regional", n: 1 }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:cavadora"], ["nenhum", ["derrotou", "papel:cavadora"]]], ate: "fundo",
      texto: "{cavadora} desceu pela corda de noite, {cavadora:sozinho|sozinha}, e a corda não chegou. De manhã as batidas tinham parado todas, e a pedreira ficou a ser uma cova com nome." },
  ],
  abandono: { semAvancar: 4,
    texto: "As batidas pararam ao sexto dia. {cavadora} continua a cavar, mas já não é para os tirar: é para os enterrar.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "Os que subiram sentam-se ao sol à boca de {pedreira}, de olhos fechados, e não falam do que viram lá em baixo. Ainda não. Mas um deles, ao passar por ti, diz baixinho que sabe para onde iam as carroças.",
    efeitos: [{ tipo: "favor", papel: "pedreira" }],
  },
});

/* A PISTA DOS PASSOS 3 E 4 (o «meio»): amanhã enforcam quem esteve lá
   nessa noite. O Dobre: não é inocente de tudo — abriu uma porta por
   moedas. O servo que fez o resto pode ser bicho ou gente, e a prova é um
   recibo, porque ninguém pede recibo a quem vai pegar fogo. */
const O_ENFORCADO_DE_AMANHA = quest({
  id: "o_enforcado_de_amanha",
  titulo: "O Enforcado de Amanhã",
  tipo: 1,
  enredo: 9,                                    // «Elementar, meu caro Watson»: limpar o nome de um inocente
  quando: ["meio"],
  afim: ["misterio", "arquipelago"],
  papeis: {
    acusado: { de: "elenco", exige: ["vivo"], rotulo: "quem vai à forca amanhã" },
    cela: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["cadeia", "quartel"] },
    juiz: { de: "elenco", do: "cela", rotulo: "quem assinou a sentença" },
    ruina: { de: "lugar", vizinho: "cela", tipos: ["mercado", "taverna", "forja", "templo"] },
    servo: { de: "fio", papel: "tenente", aceita: ["gente", "fera"], alcunha: "quem fez o que {acusado} vai pagar", rotulo: "quem fez o que {acusado} vai pagar" },
    recibo: { de: "item", nome: "o recibo meio queimado", nasce: "ruina" },
  },
  mao: { tipo: "pista", contra: [3, 4], papel: "servo", tambem: ["consequencia"] },
  pede: [],
  deixa: ["aliado:acusado"],
  gancho: "Amanhã, à hora do mercado, enforcam {acusado} pelo que aconteceu em {ruina}. Toda a gente sabe que foi {acusado}: foi visto lá nessa noite, e tinha as mãos negras de fuligem. {acusado} não nega ter lá estado. Nega o resto, e pede, pela grade de {cela}, que alguém vá ver o que ninguém foi ver.",
  etapas: [
    { id: "grade", texto: "Ouvir {acusado} pela grade de {cela}",
      conclui: ["todos", ["esteve", "lugar:cela"], ["conversou", "papel:acusado"]] },
    { id: "ruina", texto: "Ver com os teus olhos o que ficou de {ruina}",
      conclui: ["pelo_menos", 2, ["esteve", "lugar:ruina"], ["descobriu", "lugar:ruina"], ["consultou", "papel:juiz"]] },
    { id: "autor", texto: "Pôr a mão em quem fez o que {acusado} vai pagar",
      conclui: ["algum", ["tem", "item:recibo"], ["derrotou", "papel:servo"]],
      ramos: ["papel", "lamina"] },
    { id: "forca", texto: "Decidir o que se faz antes da hora do mercado",
      conclui: ["algum", ["escolheu", "forca", "mostrar"], ["escolheu", "forca", "soltar"], ["escolheu", "forca", "guardar"]],
      ramos: ["mostrar", "soltar", "guardar"] },
  ],
  escolhas: {
    forca: { etapa: "forca", opcoes: {
      mostrar: {
        texto: "pôr a prova à frente de {juiz}, na praça, antes da hora",
        ganha: "{acusado} desce do cadafalso pelo próprio pé, à frente de toda a gente que vinha ver, e o nome {acusado:dele|dela} fica limpo no sítio onde o sujaram.",
        custa: "{juiz} assinou a sentença, e não perdoa a quem lha rasga em público. E quem fez aquilo fica a saber, na mesma hora, que alguém sabe.",
        efeitos: [{ tipo: "inimigo", papel: "juiz" }, { tipo: "avisa_vilao" }, { tipo: "afeicao", papel: "acusado", n: 1 }],
      },
      soltar: {
        texto: "tirar {acusado} da cela de noite, sem prova nem perdão",
        ganha: "Ninguém vê, ninguém sabe, e a prova fica contigo e com mais ninguém: quem fez aquilo continua a julgar-se a salvo.",
        custa: "{acusado} passa a ser fugitivo o resto da vida, com o nome sujo na terra onde nasceu. E a cela vazia vai precisar de outro pescoço.",
        efeitos: [{ tipo: "situacao", papel: "acusado", situacao: "escondida" }, { tipo: "relogio_do_fio", n: -1 }],
      },
      guardar: {
        texto: "guardar a prova, e deixar {acusado} na cela mais uns dias",
        ganha: "Segues o rasto até à mão que pagou, sem que ela saiba que vais atrás. É o caminho mais curto até quem manda nisto tudo.",
        custa: "{acusado} continua com a corda à vista pela janela da cela, e a família {acusado:dele|dela} cospe-te aos pés quando passas. Se o rasto demorar, a forca não espera.",
        efeitos: [{ tipo: "relogio_do_fio", n: -2 }, { tipo: "situacao", papel: "acusado", situacao: "cativa" }, { tipo: "afeicao", papel: "acusado", n: -1 }],
      },
    } },
  },
  solucoes: {
    autor: {
      papel: [{ texto: "No meio da cinza de {ruina}, por baixo de uma trave, há um papel que não ardeu todo: {recibo}, com a marca de quem cobra por estas bandas. Ninguém pede recibo a quem vai pegar fogo. Pede-se a quem recusou pagar." }],
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:servo"],
          texto: "{servo} cai e não se volta a erguer, mas respira — e o cheiro a fumo que traz agarrado diz o resto." },
        { id: "matou", texto: "{servo} fica onde caiu, e o cheiro a fumo que traz agarrado diz por todos o que já não pode dizer." },
      ],
    },
    forca: {
      mostrar: [{ texto: "Sobes ao cadafalso com o papel na mão e lês em voz alta, por cima do povo. {juiz} fica {juiz:muito branco|muito branca}. A corda fica a balançar, vazia, o resto da manhã." }],
      soltar: [{ texto: "A fechadura de {cela} cede à segunda volta. {acusado} sai para a noite sem olhar para trás, e de manhã a praça encontra a forca pronta e ninguém para ela." }],
      guardar: [{ texto: "Dobras o que sabes e guardas. Pela grade, {acusado} olha para ti como se olha para quem se foi embora, e não diz nada." }],
    },
  },
  reviravoltas: [
    { id: "a_porta_aberta",
      texto: "À segunda vez, {acusado} diz o que não disse à primeira: esteve em {ruina} nessa noite porque lhe pagaram para deixar uma porta aberta. Não sabia para quê. Jura que não sabia. As mãos negras foram de tentar apagar o que a porta deixou entrar.",
      gatilho: ["todos", ["etapa", "grade"], ["consultou", "papel:acusado", 2], ["nenhum", ["etapa", "forca"]]],
      efeitos: [{ tipo: "quem_e", papel: "acusado", linha: "deixou uma porta aberta a troco de moedas, e tentou apagar o que entrou por ela" }] },
    { id: "a_sentenca_com_pressa",
      texto: "{juiz} tem pressa, e a pressa tem dono: a sentença foi assinada antes de alguém ir a {ruina}, com a tinta de uma pena que não é a {juiz:dele|dela}. Quem quer {acusado} na forca quer o assunto fechado amanhã, à hora do mercado.",
      gatilho: ["todos", ["etapa", "ruina"], ["consultou", "papel:juiz"], ["nenhum", ["etapa", "forca"]]],
      efeitos: [{ tipo: "deixa", premissa: "comprado:juiz" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:acusado"], ["nenhum", ["derrotou", "papel:acusado"]]], ate: "forca",
      texto: "Acharam {acusado} de madrugada na cela, {acusado:pendurado|pendurada} por uma mão que não quis esperar pela hora do mercado. {juiz} chamou-lhe confissão." },
  ],
  abandono: { semAvancar: 2,
    texto: "A hora do mercado chegou, e tu não estavas. A praça encheu-se, e {acusado} foi {acusado:levado|levada} de mãos atadas para a forca da capital, a olhar para trás à procura de alguém.",
    efeitos: [{ tipo: "situacao", papel: "acusado", situacao: "cativa" }, { tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "A hora do mercado passa sem corda. O que aconteceu em {ruina} já tem outra mão, e essa mão deixou rasto — a primeira ponta de um fio que vai dar a quem manda nisto tudo.",
    efeitos: [{ tipo: "deixa", premissa: "rasto:servo" }],
  },
});

/* O RECURSO DOS PASSOS 1 E 2 (cedo): o livro onde está escrito quem é quem
   na terra inteira. Queimá-lo, devolvê-lo, ou pôr no lugar dele uma cópia
   que mente — o «Arrombar e entrar» com a reviravolta de trocar sem que
   ninguém dê por isso. E na última página, o Surpreenda: o herói. Quem lê
   o livro à noite é um servo que se vence: a mão é também tenente (e assim
   cabe no passo 1 dos planos que não o contestam pelo recurso). */
const O_LIVRO_DOS_NOMES = quest({
  id: "o_livro_dos_nomes",
  titulo: "O Livro dos Nomes",
  tipo: 1,
  enredo: 4,                                    // «Arrombar e entrar», com a troca sem alarme
  quando: ["cedo"],
  afim: ["misterio", "arquipelago"],
  papeis: {
    escrivao: { de: "elenco", rotulo: "quem guardava o livro" },
    casa: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["biblioteca", "templo", "guilda", "taverna"] },
    servo: { de: "fio", papel: "tenente", alcunha: "quem lê o livro à noite", rotulo: "quem lê o livro à noite" },
    copista: { de: "elenco", proximo: "escrivao", rotulo: "quem sabe imitar qualquer letra" },
    livro: { de: "item", nome: "o livro dos nomes", nasce: "casa" },
  },
  mao: { tipo: "recurso", contra: [1, 2], papel: "servo", tambem: ["tenente"] },
  pede: [],
  deixa: ["inimigo:servo"],
  gancho: "Na terra inteira há um livro só onde está escrito quem nasceu, quem casou, quem deve a quem e quem esconde o quê: o livro dos nomes, que {escrivao} guardava há trinta anos. Há uma semana, sumiu. Desde então há quem bata às portas certas, às horas certas, a perguntar pelas pessoas certas pelo nome. {escrivao} sabe quem o levou, e tem medo de o dizer em voz alta.",
  etapas: [
    { id: "escrivao", texto: "Ouvir {escrivao}", conclui: ["conversou", "papel:escrivao"] },
    { id: "casa", texto: "Saber onde {servo} guarda o livro", conclui: ["algum", ["esteve", "lugar:casa"], ["descobriu", "lugar:casa"]] },
    { id: "livro", texto: "Tirar o livro das mãos de {servo}",
      conclui: ["algum", ["tem", "item:livro"], ["derrotou", "papel:servo"]],
      ramos: ["furto", "lamina"] },
    { id: "destino", texto: "Decidir o que fica do livro",
      conclui: ["algum", ["escolheu", "livro", "queimar"], ["escolheu", "livro", "devolver"], ["escolheu", "livro", "trocar"]],
      ramos: ["queimar", "devolver", "trocar"] },
  ],
  escolhas: {
    livro: { etapa: "destino", opcoes: {
      queimar: {
        texto: "queimar o livro, folha a folha, até não sobrar um nome",
        ganha: "Ninguém volta a bater a uma porta pelo nome que lá estava escrito: nem {servo}, nem quem lhe paga, nem ninguém.",
        custa: "Trinta anos de nascimentos, casamentos e dívidas viram fumo. {escrivao} chora como num enterro, e metade da terra deixa de conseguir provar o que é seu.",
        efeitos: [{ tipo: "relogio_do_fio", n: -1 }, { tipo: "afeicao", papel: "escrivao", n: -1 }, { tipo: "relogio_regional", n: 1 }],
      },
      devolver: {
        texto: "devolver o livro a {escrivao}, inteiro, como estava",
        ganha: "{escrivao} aperta o livro contra o peito, e a terra volta a ter memória: cada um prova o que é seu, e as dívidas antigas continuam a ser só dívidas.",
        custa: "O que se roubou uma vez rouba-se outra. {servo} já leu o livro todo, e sabe o caminho para a casa de {escrivao}.",
        efeitos: [{ tipo: "afeicao", papel: "escrivao", n: 1 }, { tipo: "aliado", papel: "escrivao" }],
      },
      trocar: {
        texto: "pôr no lugar dele uma cópia de {copista}, com os nomes trocados",
        ganha: "{servo} continua a bater às portas — às portas erradas, pelos nomes errados, e quem lhe paga começa a desconfiar da mão que o serve.",
        custa: "Três noites de {copista} à luz da vela, e uma letra falsa que, se for descoberta, leva {copista} à forca em vez de ti. E o livro verdadeiro fica a ser teu para guardar.",
        efeitos: [{ tipo: "relogio_do_fio", n: -2 }, { tipo: "dia", n: 3 }, { tipo: "deixa", premissa: "falsario:copista" }],
      },
    } },
  },
  solucoes: {
    livro: {
      furto: [{ texto: "Entras em {casa} quando a vela de {servo} se apaga, e sais com o livro debaixo do braço, a pesar mais do que um livro devia pesar. Ninguém te viu. Ainda." }],
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:servo"],
          texto: "{servo} fica no chão, com vida, a olhar para o livro na tua mão como quem já o sabe de cor." },
        { id: "matou", texto: "{servo} cai por cima do livro aberto, e o livro fica com uma página a mais, escrita a vermelho." },
      ],
    },
    destino: {
      queimar: [{ texto: "As folhas ardem devagar, porque o papel é bom. Lês sem querer os nomes à medida que se enrolam: uma criança nascida num inverno de fome, uma dívida de três moedas, um casamento que ninguém queria. Depois já não há nada para ler." }],
      devolver: [{ texto: "{escrivao} abre o livro na primeira página e passa-lhe a mão por cima, como quem acorda alguém. Depois tranca-o num baú e dorme a noite inteira em cima do baú." }],
      trocar: [{ texto: "Ao fim da terceira noite, {copista} pousa a pena e esfrega os olhos. A cópia é perfeita, e mente em cada página. Volta para {casa} antes do amanhecer, pelo caminho por onde o verdadeiro saiu." }],
    },
  },
  reviravoltas: [
    { id: "a_ultima_pagina",
      texto: "Na última página escrita, com a tinta ainda fresca, está a tua cara posta em palavras: de onde vieste, por onde passaste, quem anda contigo e onde dormiste anteontem. Alguém começou a escrever-te antes de saberes que havia quem escrevesse.",
      gatilho: ["todos", ["etapa", "livro"], ["nenhum", ["etapa", "destino"]]],
      efeitos: [{ tipo: "quem_e", papel: "servo", linha: "escreve num livro alheio por onde passas, e quem anda contigo" }] },
    { id: "a_letra_vendida",
      texto: "{copista} faz o que lhe pedes, mas avisa: já fez outra, há um mês, para quem pagou bem — uma escritura com uma assinatura que não era de quem lá estava. Não sabe para quem foi. Sabe que lhe pagaram com moedas novas, todas da mesma forja.",
      gatilho: ["todos", ["conversou", "papel:copista"], ["nenhum", ["etapa", "destino"]]],
      efeitos: [{ tipo: "quem_e", papel: "copista", linha: "já falsificou uma escritura para quem anda a mover esta terra" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:escrivao"], ["nenhum", ["derrotou", "papel:escrivao"]]], ate: "destino",
      texto: "Acharam {escrivao} em casa, {escrivao:sentado|sentada} à mesa, com a pena na mão e uma página em branco à frente. Quem leu o livro não quis que ninguém o voltasse a escrever." },
  ],
  abandono: { semAvancar: 5,
    texto: "Ninguém foi buscar o livro. Ao fim de uma semana, cada casa da terra tinha recebido uma visita, à hora certa, de alguém que sabia o nome de toda a gente lá dentro.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "Seja qual for o livro que sobra — o verdadeiro, nenhum, ou um que mente —, já não é quem bate às portas que decide o que lá se lê.",
    efeitos: [{ tipo: "quem_e", papel: "escrivao", linha: "guardou o livro dos nomes trinta anos, e sabe quem o tirou" }],
  },
});

/* O TENENTE DOS PASSOS 2 E 3 (cedo e meio): a «Chantagem» da Grande
   Lista, com o Dobre — o segredo é verdade, e é terrível dos dois lados.
   Quem cura a vila marca portas a giz porque um servo dele tem as cartas
   dela. Queimar, contar a quem perdeu alguém, ou guardá-las para ti. As
   casas marcadas que ardem são a obra do passo: a mão é também consequência. */
const AS_MAOS_QUE_CURAM = quest({
  id: "as_maos_que_curam",
  titulo: "As Mãos Que Curam",
  tipo: 1,
  enredo: 3,                                    // «Chantagem», com o Dobre
  quando: ["cedo", "meio"],
  afim: ["reinado", "misterio"],
  papeis: {
    curadora: { de: "elenco", rotulo: "quem cura a vila de graça" },
    servo: { de: "fio", papel: "tenente", alcunha: "quem guarda as cartas", rotulo: "quem guarda as cartas" },
    arquivo: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["taverna", "casa de banhos", "guilda"] },
    viuva: { de: "elenco", proximo: "curadora", rotulo: "quem enterrou alguém na última febre" },
  },
  mao: { tipo: "tenente", contra: [2, 3], papel: "servo", tambem: ["consequencia"] },
  pede: [],
  deixa: ["inimigo:servo"],
  gancho: "{curadora} cura a vila de graça há vinte anos, e há duas semanas começou a marcar portas com giz: febre, diz, não entrem. As casas marcadas ardem uma a uma, de noite, por mão de quem tem medo do contágio. {curadora} não dorme, não come, e quando te vê na rua agarra-te o braço e diz só: há quem tenha as minhas cartas.",
  etapas: [
    { id: "curadora", texto: "Ouvir {curadora} longe de ouvidos", conclui: ["conversou", "papel:curadora"] },
    { id: "cartas", texto: "Saber o que dizem as cartas",
      conclui: ["pelo_menos", 2, ["consultou", "papel:curadora"], ["descobriu", "lugar:arquivo"], ["conversou", "papel:servo"]] },
    { id: "tirar", texto: "Tirar as cartas a {servo}",
      conclui: ["algum", ["derrotou", "papel:servo"], ["escolheu", "preco", "pagar"], ["todos", ["esteve", "lugar:arquivo"], ["descobriu", "lugar:arquivo"]]],
      ramos: ["lamina", "preco", "furto"] },
    { id: "segredo", texto: "Decidir o que se faz com o que as cartas dizem",
      conclui: ["algum", ["escolheu", "segredo", "queimar"], ["escolheu", "segredo", "contar"], ["escolheu", "segredo", "guardar"]],
      ramos: ["queimar", "contar", "guardar"] },
  ],
  escolhas: {
    preco: { etapa: "tirar", opcoes: {
      pagar: {
        texto: "comprar as cartas a {servo}, pelo preço que pede",
        ganha: "Ninguém sangra, ninguém arromba nada: as cartas passam de mão em mão, atadas com fita, e {curadora} deixa de marcar portas nessa mesma noite.",
        custa: "Sessenta moedas da tua bolsa, direitas para a bolsa de quem queima casas. E {servo} sabe ler: quem guardou umas cartas guarda as cópias.",
        efeitos: [{ tipo: "moedas", n: -60 }, { tipo: "relogio_do_fio", n: 1 }],
      },
    } },
    segredo: { etapa: "segredo", opcoes: {
      queimar: {
        texto: "queimar as cartas sem as ler, à frente de {curadora}",
        ganha: "{curadora} volta a dormir. O que se fez há vinte anos fica entre {curadora} e os mortos, e a vila continua a ter quem a cure.",
        custa: "{viuva} nunca vai saber porque enterrou quem enterrou. Há uma verdade a menos no mundo, e foste tu que a queimaste.",
        efeitos: [{ tipo: "afeicao", papel: "curadora", n: 1 }, { tipo: "aliado", papel: "curadora" }],
      },
      contar: {
        texto: "levar as cartas a {viuva}, e deixar que leia",
        ganha: "{viuva} fica a saber, ao fim de vinte anos, que quem enterrou podia ter vivido — e porque não viveu. Ninguém volta a ter poder sobre {curadora}, porque já não há segredo.",
        custa: "A vila perde quem a cura: {curadora} sai da terra antes do fim do mês, com a porta marcada a giz por mão alheia. E {viuva} não te agradece. Há verdades que se carregam pior do que a mentira.",
        efeitos: [{ tipo: "afeicao", papel: "curadora", n: -2 }, { tipo: "situacao", papel: "curadora", situacao: "escondida" }, { tipo: "afeicao", papel: "viuva", n: 1 }],
      },
      guardar: {
        texto: "guardar as cartas contigo, e não dizer a ninguém que as tens",
        ganha: "{curadora} deixa de marcar portas, porque já não é {servo} quem tem as cartas. E tens à mão uma verdade que vale uma vila inteira.",
        custa: "Passas a ser tu quem tem as cartas de alguém. {curadora} vai olhar-te sempre a perguntar o que vais pedir — e um dia vais precisar de pedir.",
        efeitos: [{ tipo: "afeicao", papel: "curadora", n: -1 }, { tipo: "deixa", premissa: "devedor:curadora" }],
      },
    } },
  },
  solucoes: {
    tirar: {
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:servo"],
          texto: "{servo} entrega as cartas do chão, com a mão a tremer, e ainda tem tempo de sorrir: sabe de cor o que lá está." },
        { id: "matou", texto: "{servo} cai em cima da arca das cartas. Tens de {servo:o|a} empurrar para a abrir, e as cartas saem manchadas num canto." },
      ],
      preco: [{ texto: "{servo} conta as moedas duas vezes, devagar, à tua frente, e só depois empurra o maço atado com fita por cima da mesa. Diz-te boa noite pelo nome da terra de onde vens." }],
      furto: [{ texto: "As cartas estão onde descobriste que estariam, numa caixa de rapé por baixo de uma tábua solta. Sais de {arquivo} com elas dentro da camisa, e ninguém te para." }],
    },
    segredo: {
      queimar: [{ texto: "{curadora} vê arder as cartas até à última, de mãos juntas, e só no fim deixa sair um som que não é choro nem riso. No dia seguinte volta a abrir a porta aos doentes." }],
      contar: [{ texto: "{viuva} lê as cartas {viuva:sentado|sentada} na soleira, uma a uma, sem levantar os olhos. Quando acaba, dobra-as com muito cuidado, devolve-tas, e fecha a porta sem agradecer." }],
      guardar: [{ texto: "Dobras as cartas e guardas. {curadora} vê onde as pões, e desse dia em diante cumprimenta-te na rua com uma vénia pequena demais." }],
    },
  },
  reviravoltas: [
    { id: "a_ultima_febre",
      texto: "As cartas são de {curadora} para {curadora}, escritas na noite da última febre, há vinte anos, para não enlouquecer: havia remédio para um só, e dois doentes na mesma rua. {curadora} deu-o a uma criança que ninguém conhecia, e deixou morrer alguém que toda a gente conhecia — e disse a {viuva} que já não havia nada a fazer.",
      gatilho: ["todos", ["etapa", "curadora"], ["consultou", "papel:curadora"], ["nenhum", ["etapa", "segredo"]]],
      efeitos: [{ tipo: "quem_e", papel: "curadora", linha: "escolheu, numa noite de febre, quem vivia, e mentiu sobre isso vinte anos" }] },
    { id: "as_portas_marcadas",
      texto: "No arquivo de {servo} há uma lista de casas, com uma cruz ao lado de cada uma. As portas que {curadora} marcou a giz são todas desta lista — e em nenhuma havia febre. São as casas que se recusaram a pagar.",
      gatilho: ["todos", ["etapa", "cartas"], ["nenhum", ["etapa", "segredo"]], ["descobriu", "lugar:arquivo"]],
      efeitos: [{ tipo: "deixa", premissa: "lista:servo" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:curadora"], ["nenhum", ["derrotou", "papel:curadora"]]], ate: "segredo",
      texto: "Acharam {curadora} ao amanhecer, em casa, com a porta marcada a giz por fora. Ninguém sabe quem o fez. Toda a gente sabe porquê." },
  ],
  abandono: { semAvancar: 5,
    texto: "{curadora} continua a marcar portas. Ao fim de uma semana já não precisa de giz: as pessoas fecham-se em casa ao vê-{curadora:lo|la} passar, e as casas que se recusaram a pagar já não existem.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "As portas deixam de ser marcadas. Nas casas que arderam alguém já anda a juntar tábuas, e de manhã ouve-se outra vez o martelo, que é o som mais teimoso que há.",
    efeitos: [{ tipo: "relogio_regional", n: -1 }],
  },
});

/* O ROSTO DO OUTRO LADO (passo 5), para gente e para fera: a ponte caiu
   na cheia, e do lado de lá, à vista, está quem a quis cair. «Estamos do
   lado de fora a olhar para dentro»: o herói não é o centro do que se
   passa do outro lado — escolhe se atravessa, se chama, ou se assiste.
   Nenhum texto dá género ao vilão: serve um bicho e uma pessoa. */
const DO_OUTRO_LADO_DO_VAU = quest({
  id: "do_outro_lado_do_vau",
  titulo: "Do Outro Lado do Vau",
  tipo: 1,
  enredo: 34,                                   // «Estamos do lado de fora olhando para dentro»
  quando: ["fim"],
  afim: ["arquipelago", "reinado"],
  papeis: {
    vilao: { de: "fio", papel: "vilao", aceita: ["gente", "fera"], alcunha: "quem espera do outro lado do vau", rotulo: "quem espera do outro lado do vau" },
    margem: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["docas", "mercado", "taverna"] },
    barqueira: { de: "elenco", do: "margem", rotulo: "quem conhece o fundo do rio" },
    aldeia: { de: "cidade", distancia: [1, 2] },
  },
  mao: { tipo: "rosto", contra: [5], papel: "vilao" },
  pede: [],
  deixa: ["conhece:vilao"],
  gancho: "O rio subiu de noite e levou a ponte. De manhã, do outro lado, na margem que dá para {aldeia}, havia fogueiras — e entre as fogueiras, à vista de quem quisesse ver, {vilao}. Não atravessa. Não precisa. A gente de {aldeia} está toda do lado de lá, com a água pelo meio, e o que lá se fizer faz-se à frente dos teus olhos. {barqueira} diz que há um sítio onde o vau ainda dá pé. Um só.",
  etapas: [
    { id: "rio", texto: "Chegar à margem, e ver", conclui: ["todos", ["esteve", "lugar:margem"], ["conheceu", "papel:vilao"]] },
    { id: "vau", texto: "Saber de {barqueira} onde o rio ainda dá pé", conclui: ["consultou", "papel:barqueira"] },
    { id: "resposta", texto: "Responder ao que {vilao} faz do outro lado",
      conclui: ["algum", ["escolheu", "rosto", "atravessar"], ["escolheu", "rosto", "chamar"], ["escolheu", "rosto", "assistir"]],
      ramos: ["atravessar", "chamar", "assistir"] },
    { id: "cheia", texto: "Ver o que fica de {aldeia} quando a água baixar",
      conclui: ["todos", ["conversou", "papel:barqueira", 2], ["nenhum", ["esta_em", "lugar:margem"]]] },
  ],
  escolhas: {
    rosto: { etapa: "resposta", opcoes: {
      atravessar: {
        texto: "atravessar o vau a pé, até à margem de lá",
        ganha: "Chegas ao outro lado com a água pela cintura, à frente de {vilao}, e deixam-te chegar: há coisas que só se mostram de perto, e quem atravessa um rio para as ver ganha o direito a isso. {aldeia} vê que alguém veio.",
        custa: "Ficas do lado de lá, sem ponte, ao alcance de tudo o que lá está. Mandam-te de volta sem um arranhão — e de volta levas o que te mostraram, que pesa mais do que uma ferida.",
        efeitos: [{ tipo: "avisa_vilao" }, { tipo: "relogio_do_fio", n: -1 }],
      },
      chamar: {
        texto: "chamar do lado de cá, alto, para que {aldeia} inteira ouça",
        ganha: "A tua voz chega ao outro lado, e com ela {aldeia} fica a saber que não está esquecida. {vilao} ouve, e responde à sua maneira, à vista de todos — e no que responde vês o que quer.",
        custa: "O que se diz por cima de um rio diz-se a toda a gente: {vilao} fica a saber a tua voz e a tua cara, e {aldeia} fica a saber que não vais atravessar.",
        efeitos: [{ tipo: "avisa_vilao" }, { tipo: "afeicao", papel: "barqueira", n: -1 }],
      },
      assistir: {
        texto: "ficar na margem, sem dizer nada, e ver até ao fim o que se faz do lado de lá",
        ganha: "Ninguém do teu lado se molha, ninguém do teu lado sangra. E vês tudo: como se move, o que manda fazer, o que guarda para o fim — coisas que de perto nunca verias.",
        custa: "{aldeia} vê-te na margem a ver, e não te perdoa: quando a água baixar, ninguém de lá te abre a porta. E {vilao} fica a saber que tens estômago para assistir.",
        efeitos: [{ tipo: "relogio_do_fio", n: 1 }, { tipo: "deixa", premissa: "estudou:vilao" }],
      },
    } },
  },
  solucoes: {
    resposta: {
      atravessar: [{ texto: "A água chega-te ao peito a meio do vau, e a corrente puxa para onde não queres ir. Chegas. {vilao} está ali, à distância de um braço, e durante muito tempo ninguém faz nada. Depois mostra-te o que veio mostrar, e manda-te de volta pelo mesmo caminho." }],
      chamar: [{ texto: "Gritas por cima da água. Do lado de lá, as fogueiras param de crepitar, ou parece. {vilao} volta-se para ti, devagar, e a resposta não vem em palavras: vem no que faz a seguir, à vista de toda a margem." }],
      assistir: [{ texto: "Ficas. Vês tudo, até ao fim, e não dizes nada. Quando as fogueiras se apagam, a margem de lá fica escura, e tu ficas a olhar para o escuro muito depois de não haver nada para ver." }],
    },
  },
  reviravoltas: [
    { id: "os_pilares_serrados",
      texto: "A ponte não foi o rio. Os pilares foram serrados até meio, de véspera, com cuidado de carpinteiro, para que a primeira cheia fizesse o resto. Alguém quis {aldeia} sozinha do lado de lá — e quis-te a ti do lado de cá, a ver.",
      gatilho: ["todos", ["etapa", "rio"], ["descobriu", "lugar:margem"], ["nenhum", ["etapa", "resposta"]]],
      efeitos: [{ tipo: "relogio_regional", n: 1 }] },
    { id: "o_vau_mostrado",
      texto: "{barqueira} diz o resto à segunda pergunta: o sítio onde o vau dá pé foi-lhe mostrado ontem por alguém do lado de lá, com uma moeda na mão. Quem espera do outro lado quer que atravesses. A pergunta é só se vais.",
      gatilho: ["todos", ["etapa", "vau"], ["consultou", "papel:barqueira", 2], ["nenhum", ["etapa", "resposta"]]],
      efeitos: [{ tipo: "quem_e", papel: "barqueira", linha: "recebeu uma moeda de quem esperava do outro lado do vau, para te mostrar o caminho" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:barqueira"], ["nenhum", ["derrotou", "papel:barqueira"]]], ate: "resposta",
      texto: "Encontraram {barqueira} de manhã na margem, com os pés na água. Ninguém mais sabe onde o vau dá pé, e do lado de lá as fogueiras apagam-se uma a uma." },
  ],
  abandono: { semAvancar: 3,
    texto: "A água baixou ao terceiro dia. Do lado de lá já não havia fogueiras, nem quem esperava, nem quase ninguém de {aldeia}: só as casas abertas e um silêncio que atravessou o rio antes de toda a gente.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "A água baixa devagar, e o vau volta a ser só um vau. Já sabes o que espera do outro lado de tudo isto. E o que espera do outro lado sabe que viste.",
    efeitos: [{ tipo: "deixa", premissa: "conhece:vilao" }],
  },
});

/* A PROMESSA A UM MORTO (tipo 2): quem anda com o herói atou, por ordem,
   a corda de um amigo, e prometeu-lhe dizer à mãe que morreu de espada na
   mão. Cumprir a promessa é mentir a uma mãe; quebrá-la é tirar-lhe o
   filho que ela julga ter tido. Do melhor (a camisa do filho, dada a quem
   atou a corda) ao pior (dizes tu, por ele, à frente do irmão que jurou
   não perguntar porquê). A ponte: o capitão que deu a ordem. */
const A_PALAVRA_DADA_A_UM_ENFORCADO = quest({
  id: "a_palavra_dada_a_um_enforcado",
  titulo: "A Palavra Dada a Um Enforcado",
  tipo: 2,
  quando: ["cedo", "meio", "fim"],
  afim: [],
  papeis: {
    quem: { de: "grupo", ou: "elo", rotulo: "quem anda contigo" },
    mae: { de: "elenco", cidade: "uma cidade dos atos 2 ou 3", rotulo: "quem espera um filho que não volta" },
    irmao: { de: "elenco", proximo: "mae", rotulo: "{irmao:o irmão que ficou|a irmã que ficou}" },
    casa: { de: "lugar", vizinho: "mae", tipos: ["taverna", "mercado", "forja"] },
  },
  mao: null,
  ponte: "o capitão que mandou atar a corda serve hoje, numa cidade por onde um passo do vilão vai passar, a mão que manda nele",
  pede: [],
  deixa: [],
  gancho: "Há uma estrada que {quem} não faz: a que vai dar a {casa}. Dá a volta de um dia para não passar lá, e não diz porquê. Ontem, numa taberna, alguém disse em voz alta o nome de um soldado morto há seis anos, e {quem} entornou o copo. Esta noite, ao pé do fogo, {quem} tirou da mochila uma fita de luto que nunca tinhas visto, e ficou muito tempo a enrolá-la nos dedos.",
  etapas: [
    { id: "sinal", texto: "Perguntar a {quem} de quem é a fita de luto",
      espera: 2, acende: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 1]],
      conclui: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 2], ["conversou", "papel:quem", 2]] },
    { id: "palavra", texto: "Dizer a {quem} o que vale uma promessa feita a um morto",
      conclui: ["algum", ["escolheu", "palavra", "cumprir"], ["escolheu", "palavra", "quebrar"]],
      ramos: ["cumprir", "quebrar"] },
    { id: "casa", texto: "Ir com {quem} até à porta de {mae}, em {casa}",
      ancora: { tipo: 1, concluidas: 1 },
      conclui: ["todos", ["esteve", "lugar:casa"], ["acompanha", "papel:quem"], ["conversou", "papel:mae"]] },
    { id: "porta", texto: "Estar ao lado de {quem} à porta de {mae}",
      conclui: ["algum", ["escolheu", "porta", "mentir"], ["escolheu", "porta", "confessar"], ["escolheu", "porta", "denunciar"]],
      ramos: ["mentir", "confessar", "denunciar"] },
  ],
  escolhas: {
    palavra: { etapa: "palavra", opcoes: {
      cumprir: {
        texto: "dizer a {quem} que a palavra dada a um morto é sagrada",
        ganha: "{quem} respira: alguém lhe diz que a mentira que carrega é uma promessa, e não uma vergonha.",
        custa: "Ajudas {quem} a guardar uma mentira com seis anos — e as mentiras que se guardam assim crescem, como tudo o que se rega.",
        efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }],
      },
      quebrar: {
        texto: "dizer a {quem} que {mae:um pai|uma mãe} tem direito a saber como lhe morreu o filho",
        ganha: "{quem} ouve da tua boca o que já sabia e não se atrevia a pensar: que o morto não é dono da verdade de quem ficou.",
        custa: "Pões em causa a última coisa que {quem} pôde fazer pelo amigo. Se a porta se fechar, a culpa também é tua.",
        efeitos: [],
      },
    } },
    porta: { etapa: "porta", opcoes: {
      mentir: {
        texto: "deixar {quem} dizer o que prometeu: que o filho morreu de espada na mão",
        ganha: "{mae} fica com o filho que queria ter tido, e {quem} cumpre a única coisa que o amigo lhe pediu.",
        custa: "{quem} vai ouvir {mae} agradecer-lhe — com as mãos da corda nas mãos {mae:dele|dela}. Há coisas que se cumprem e não se pagam nunca.",
        efeitos: [],
      },
      confessar: {
        texto: "ficar ao lado de {quem} enquanto conta tudo, a corda incluída",
        ganha: "Ninguém mente a ninguém, e {quem} deixa de carregar {quem:sozinho|sozinha} o que carrega há seis anos.",
        custa: "Quebra-se a promessa a um morto, e arrisca-se a porta {mae:de um pai|de uma mãe} — e o que {mae} fizer com a verdade já não depende de vocês.",
        efeitos: [],
      },
      denunciar: {
        texto: "dizer tu, por {quem}, quem atou a corda, antes que lhe falte a coragem",
        ganha: "A verdade sai inteira e sem tremer, da boca de quem não a carregou seis anos.",
        custa: "Tiras a {quem} a única coisa que ainda era {quem:dele|dela}: a vez de o dizer. E há um irmão naquela casa que jurou não perguntar porquê — sem a confiança inteira de {quem} ao teu lado, ninguém segura a espada.",
        efeitos: [],
      },
    } },
  },
  solucoes: {
    palavra: {
      cumprir: [{ texto: "{quem} acena devagar, e volta a enrolar a fita nos dedos — mas agora com mais cuidado, como quem segura uma coisa que pode partir." }],
      quebrar: [{ texto: "{quem} não responde. Olha muito tempo para o fogo, e de manhã é {quem} quem pergunta, sem levantar os olhos, quantos dias faltam para {casa}." }],
    },
    porta: {
      mentir: [{ texto: "{quem} diz a frase que ensaiou seis anos, sem tropeçar numa palavra. {mae} leva as mãos à boca, e depois aos olhos, e depois às mãos de {quem}." }],
      confessar: [{ texto: "{quem} começa pela batalha que não houve e acaba na corda. Tu ficas ao lado, perto o bastante para se tocarem os ombros. {mae} não interrompe uma única vez." }],
      denunciar: [{ texto: "Dizes tu, de uma vez, antes que alguém te cale. A seguir há um silêncio tão grande que se ouve o rio ao fundo da rua." }],
    },
  },
  reviravoltas: [
    { id: "a_corda",
      texto: "{quem} conta, por fim, a noite inteira. O soldado não morreu a lutar: desertou na véspera de uma batalha perdida, e o capitão mandou enforcá-lo ao amanhecer, à frente do regimento, para que ninguém mais fugisse. Quem atou a corda foi {quem}, por ordem. E antes de a corda apertar, o soldado pediu uma coisa só: que dissessem em casa que tinha morrido de espada na mão.",
      gatilho: ["todos", ["etapa", "sinal"], ["conversou", "papel:quem", 3], ["nenhum", ["etapa", "porta"]]],
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "atou a corda de um amigo, por ordem, e prometeu-lhe uma mentira" }] },
    { id: "o_irmao_que_ficou",
      texto: "À porta de {mae} está também {irmao}, {irmao:mais novo|mais nova}, com a espada do pai à cintura e a cara do morto. Fala do irmão como se fala de um santo. Diz que um dia vai encontrar quem o matou, e que não vai perguntar porquê.",
      gatilho: ["todos", ["etapa", "casa"], ["conheceu", "papel:irmao"], ["nenhum", ["etapa", "porta"]]],
      efeitos: [{ tipo: "quem_e", papel: "irmao", linha: "fala do irmão morto como de um santo, e jurou encontrar quem o matou" }] },
  ],
  desfechos: [
    { id: "a_camisa_do_filho",
      quando: ["todos", ["escolheu", "porta", "confessar"], ["escolheu", "palavra", "quebrar"], ["afeicao", "papel:quem", 3]],
      texto: "{quem} diz tudo à porta, a corda incluída, com a voz a partir-se na parte da ordem. {mae} ouve até ao fim, entra em casa sem dizer nada, e volta com uma camisa dobrada: a do filho. Dá-a a {quem}. «Ele fugiu porque tinha medo. Tu ficaste porque tinhas medo. Agora já ninguém tem.» No caminho de volta, {quem} fala do amigo pelo nome, pela primeira vez em seis anos.",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "mae" }] },
    { id: "a_mentira_cumprida",
      quando: ["escolheu", "porta", "mentir"],
      texto: "{quem} diz o que prometeu: que o filho morreu de espada na mão, à frente de todos. {mae} chora de orgulho e beija as mãos de {quem} — as mesmas da corda. {irmao} pede que lhe contem a batalha outra vez, e outra. {quem} conta. Cumpriu a palavra. Nessa noite não dorme.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "cumpriu a palavra dada a um enforcado, e mentiu a uma mãe para a cumprir" }] },
    { id: "a_porta_sem_bater",
      quando: ["escolheu", "porta", "confessar"],
      texto: "{quem} conta tudo. {mae} ouve até à parte da corda, e fecha a porta devagar, sem bater, como se fecha a porta de um quarto onde alguém dorme. {quem} fica muito tempo de pé no degrau. Depois volta para a estrada, mais leve e mais só.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "contou a uma mãe quem atou a corda, e ela fechou a porta sem bater" }] },
    { id: "a_verdade_por_outra_boca",
      quando: ["todos", ["escolheu", "porta", "denunciar"], ["afeicao", "papel:quem", 3]],
      texto: "Dizes tu, antes que {quem} encontre a voz. {mae} olha para {quem} e espera que negue. {quem} não nega. {irmao} chega a pôr a mão na espada, e {quem} não se defende — mas {mae} segura o braço {irmao:do filho|da filha} que lhe resta. Vão-se dali sem sangue. Na estrada, {quem} diz-te só: «Era minha, a vez de o dizer.»",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "inimigo", papel: "irmao" }] },
    { id: "a_fita_enrolada", padrao: true,
      texto: "{quem} nunca chega a fazer a estrada de {casa}. Guarda a fita de luto no fundo da mochila, e às vezes, à noite, enrola-a nos dedos até a fogueira se apagar.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "quem_e", papel: "quem", linha: "guarda uma fita de luto que nunca entregou" }] },
    { id: "sem_mae", cedo: true,
      quando: ["todos", ["morto", "papel:mae"], ["nenhum", ["etapa", "porta"]]],
      texto: "{mae} morreu antes de ouvir fosse o que fosse. {quem} deixa a fita de luto em cima da campa, e já não sabe se a promessa ficou cumprida ou só ficou sem ninguém a quem a cumprir.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "deixou numa campa a fita de uma promessa que já não tinha a quem cumprir" }] },
    { id: "a_palavra_sem_dono", cedo: true,
      quando: ["morto", "papel:quem"],
      texto: "{quem} morreu com a promessa por cumprir. Levas tu a fita a {mae}, e dizes-lhe o que {quem} queria que dissesses. Escolhes tu o quê, e carregas a escolha.",
      efeitos: [] },
    { id: "a_espada_do_irmao",
      quando: ["todos", ["escolheu", "porta", "denunciar"], ["nenhum", ["afeicao", "papel:quem", 3]]],
      texto: "Dizes tu, à frente de {irmao}, quem atou a corda. {quem} não nega: olha para ti como quem foi empurrado do alto de uma muralha, e não diz uma palavra em sua defesa. {irmao} não pergunta porquê. Tinha jurado que não ia perguntar. Quando {mae} chega à porta, já é tarde para segurar o braço de alguém.",
      efeitos: [{ tipo: "morte", papel: "quem" }] },
  ],
  abandono: { semAvancar: 15, desfecho: "a_fita_enrolada" },
});

/* A DÍVIDA DE VIDA (tipo 2): quem tirou o companheiro do rio, em menino,
   vem cobrar — um juramento falso que livra da forca um filho que pegou
   fogo a uma casa. O Dobre: o filho fê-lo porque lhe levaram a filha uma
   noite. Do melhor (a verdade inteira salva os dois) ao pior (quem acusa
   sem saber de quem é a mão sai à noite pela mesma porta que toda a
   gente). A ponte: o fogo foi por ordem da mão dele. */
const A_VIDA_QUE_SE_DEVE = quest({
  id: "a_vida_que_se_deve",
  titulo: "A Vida Que Se Deve",
  tipo: 2,
  quando: ["cedo", "meio", "fim"],
  afim: [],
  papeis: {
    quem: { de: "grupo", ou: "elo", rotulo: "quem anda contigo" },
    salvador: { de: "elenco", cidade: "uma cidade dos atos 2 ou 3", rotulo: "quem tirou {quem} do rio" },
    filho: { de: "elenco", proximo: "salvador", rotulo: "{filho:o filho|a filha} de quem tirou {quem} do rio" },
    tribunal: { de: "lugar", vizinho: "salvador", tipos: ["cadeia", "quartel", "templo"] },
  },
  mao: null,
  ponte: "{filho} pegou fogo a uma casa por ordem da mão que tudo estraga, numa cidade por onde um passo dele vai passar",
  pede: [],
  deixa: [],
  gancho: "Chegou uma carta para {quem}, sem selo, numa letra de quem escreve pouco. {quem} leu-a de pé, duas vezes, e depois sentou-se no chão. Só diz que alguém lhe salvou a vida há muitos anos, e que agora precisa de um favor. Não diz qual. Mas desde ontem que não larga a carta, e que olha para ti como quem vai pedir uma coisa e ainda não sabe se tem o direito.",
  etapas: [
    { id: "sinal", texto: "Perguntar a {quem} o que diz a carta",
      espera: 2, acende: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 1]],
      conclui: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 2], ["conversou", "papel:quem", 2]] },
    { id: "favor", texto: "Ouvir o que {salvador} pede a {quem}",
      ancora: { tipo: 1, concluidas: 1 },
      conclui: ["todos", ["acompanha", "papel:quem"], ["conversou", "papel:salvador"]] },
    { id: "conselho", texto: "Dizer a {quem} o que se deve a quem nos salva",
      conclui: ["algum", ["escolheu", "conselho", "pagar"], ["escolheu", "conselho", "recusar"]],
      ramos: ["pagar", "recusar"] },
    { id: "jura", texto: "Estar em {tribunal} ao lado de {quem}, na hora de jurar",
      conclui: ["algum", ["escolheu", "jura", "jurar"], ["escolheu", "jura", "calar"], ["escolheu", "jura", "acusar"]],
      ramos: ["jurar", "calar", "acusar"] },
  ],
  escolhas: {
    conselho: { etapa: "conselho", opcoes: {
      pagar: {
        texto: "dizer a {quem} que uma vida se paga, custe o que custar",
        ganha: "{quem} deixa de andar dividido: há uma dívida, e as dívidas pagam-se. Volta a comer e a dormir.",
        custa: "O preço que {salvador} pede é um juramento falso diante da lei, por alguém que talvez o mereça. E tu disseste que sim antes de saber.",
        efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }],
      },
      recusar: {
        texto: "dizer a {quem} que ninguém é dono da vida que salvou",
        ganha: "{quem} ouve de ti o que precisava de ouvir de alguém: que dever a vida não é dever a alma.",
        custa: "{salvador} atirou-se a um rio sem saber nadar. Se {quem} lhe disser que não, vai ter de o dizer a olhar para essas mãos.",
        efeitos: [],
      },
    } },
    jura: { etapa: "jura", opcoes: {
      jurar: {
        texto: "deixar {quem} jurar que {filho} estava na estrada com vocês, nessa noite",
        ganha: "{filho} sai livre pela porta grande, {salvador} abraça {quem} a chorar, e a dívida de um rio fica paga.",
        custa: "{quem} jura falso diante da lei, por alguém que pegou fogo a uma casa com gente a dormir. E quem fez {filho} fazê-lo vai voltar a pedir-lhe — agora sabendo que há quem jure.",
        efeitos: [],
      },
      calar: {
        texto: "ficar ao lado de {quem}, que não jura nem acusa",
        ganha: "{quem} não mente nem condena: deixa a lei fazer o que a lei faz, e fica de mãos limpas.",
        custa: "{filho} vai para a forca sem a única testemunha que o podia salvar, e {salvador} vê {quem} calar-se à frente de todos.",
        efeitos: [],
      },
      acusar: {
        texto: "pôr {quem} a contar ao tribunal o que {filho} fez de verdade",
        ganha: "A verdade diz-se diante da lei, e o nome de quem estava por trás pode vir com ela.",
        custa: "{salvador} vai ouvir quem salvou do rio acusar-lhe o filho. E se não souberes porque é que {filho} o fez, não sabes quem mais está nisto — e quem acusa à frente do tribunal sai à noite pela mesma porta que toda a gente.",
        efeitos: [],
      },
    } },
  },
  solucoes: {
    conselho: {
      pagar: [{ texto: "{quem} dobra a carta em quatro e guarda-a no peito, do lado onde se guardam as coisas que já estão decididas." }],
      recusar: [{ texto: "{quem} fica calado muito tempo. Depois diz, mais para a fogueira do que para ti, que {salvador} não sabia nadar." }],
    },
    jura: {
      jurar: [{ texto: "{quem} põe a mão no livro e jura, com a voz firme de quem já mentiu por coisas piores. O juiz acena. {filho} olha para {quem} como quem olha para um desconhecido que o salvou." }],
      calar: [{ texto: "Chamam {quem}. {quem} levanta-se, olha para {salvador} na primeira fila, e não diz nada. Não diz nada até o juiz se cansar de perguntar." }],
      acusar: [{ texto: "{quem} conta o que sabe, sem olhar para a primeira fila. A sala inteira vira-se para {filho}, e {filho} vira-se para a porta, como quem espera que entre alguém." }],
    },
  },
  reviravoltas: [
    { id: "o_rio",
      texto: "{quem} tinha nove anos e o rio estava cheio. {salvador} atirou-se à água sem saber nadar, agarrado a uma corda que outro segurava, e trouxe {quem} pelos cabelos. Nunca pediu nada em troca. Até agora.",
      gatilho: ["todos", ["etapa", "sinal"], ["conversou", "papel:quem", 3], ["nenhum", ["etapa", "jura"]]],
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "deve a vida a quem se atirou a um rio sem saber nadar" }] },
    { id: "a_cama_vazia",
      texto: "{filho} fala contigo pela grade, depressa e baixo: fez o que fez porque lhe mostraram, numa noite, a cama vazia da filha. Devolveram-lha de manhã, sem um arranhão, com um recado. Se falar diante da lei, sabe o que lhe acontece. Se não falar, enforcam-{filho:no|na}. Pede-te só que não o digas a {salvador}.",
      gatilho: ["todos", ["etapa", "favor"], ["consultou", "papel:filho"], ["nenhum", ["etapa", "jura"]]],
      efeitos: [{ tipo: "quem_e", papel: "filho", linha: "pegou fogo a uma casa porque uma noite lhe levaram a filha" }, { tipo: "deixa", premissa: "obrigado:filho" }] },
  ],
  desfechos: [
    { id: "a_verdade_que_salva",
      quando: ["todos", ["escolheu", "jura", "acusar"], ["consultou", "papel:filho"], ["afeicao", "papel:quem", 3]],
      texto: "{quem} conta tudo diante da lei — o fogo, e a cama vazia que veio antes do fogo. A sala cala-se. O juiz manda guardar {filho} em vez de {filho:o|a} enforcar, e manda procurar quem leva crianças de noite. À saída, {salvador} segura a cara de {quem} com as duas mãos, como no dia do rio. «Agora estamos quites. E não foi a pagar.»",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "salvador" }] },
    { id: "a_divida_paga",
      quando: ["escolheu", "jura", "jurar"],
      texto: "{filho} sai livre, {salvador} paga o vinho a toda a taberna, e {quem} bebe com eles até tarde. A dívida do rio está paga. Três semanas depois arde outra casa, noutra cidade, e {quem} fica a olhar para o fumo ao longe sem dizer nada.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "jurou falso por quem lhe salvou a vida, e vê o fumo ao longe" }] },
    { id: "a_verdade_que_custa",
      quando: ["todos", ["escolheu", "jura", "acusar"], ["algum", ["consultou", "papel:filho"], ["afeicao", "papel:quem", 2]]],
      texto: "{quem} diz a verdade, e a verdade enforca {filho} ao fim da semana. {salvador} não grita. Vem só à estalagem, de noite, e devolve a {quem} a corda velha com que {quem} foi {quem:tirado|tirada} do rio, enrolada com cuidado, e vai-se embora sem uma palavra.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "disse a verdade sobre o filho de quem lhe salvou a vida, e recebeu de volta a corda do rio" }] },
    { id: "o_silencio_diante_da_lei",
      quando: ["escolheu", "jura", "calar"],
      texto: "{filho} vai para a forca sem testemunha. {salvador} não volta a olhar para {quem}, nem no dia da forca, nem depois. {quem} diz que fez o que estava certo. Diz-o muitas vezes, a ti e a mais ninguém.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -5 }, { tipo: "quem_e", papel: "quem", linha: "calou-se diante da lei, e quem lhe salvou a vida não lhe voltou a olhar" }] },
    { id: "a_carta_guardada", padrao: true,
      texto: "{quem} nunca chega a responder à carta. Guarda-a dobrada no peito até o papel se desfazer pelas dobras, e um dia já não se lê o que dizia — só que alguém pediu.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "quem_e", papel: "quem", linha: "deixou sem resposta a carta de quem lhe salvou a vida" }] },
    { id: "sem_salvador", cedo: true,
      quando: ["todos", ["morto", "papel:salvador"], ["nenhum", ["etapa", "jura"]]],
      texto: "{salvador} morreu antes de saber o que {quem} ia fazer. {quem} vai ao enterro e fica ao fundo, de chapéu na mão, a pagar a dívida da única maneira que ainda pode: a estar lá.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "foi ao enterro de quem lhe salvou a vida, sem lhe ter pago" }] },
    { id: "a_divida_sem_devedor", cedo: true,
      quando: ["morto", "papel:quem"],
      texto: "{quem} morreu com a dívida por pagar. A carta vem-te parar às mãos, e respondes tu, porque alguém tem de responder. Não sabes se o que escreves é o que {quem} escreveria.",
      efeitos: [] },
    { id: "a_porta_do_tribunal",
      quando: ["todos", ["escolheu", "jura", "acusar"], ["nenhum", ["consultou", "papel:filho"]], ["nenhum", ["afeicao", "papel:quem", 2]]],
      texto: "{quem} acusou {filho} sem saber porque é que {filho} o tinha feito — e quem levava crianças de noite ouviu cada palavra da última fila. Nessa noite, {quem} saiu de {tribunal} pela porta das traseiras, para não se cruzar com {salvador}. Era a porta que esperavam.",
      efeitos: [{ tipo: "morte", papel: "quem" }] },
  ],
  abandono: { semAvancar: 15, desfecho: "a_carta_guardada" },
});

/* O FILHO QUE NÃO SE CONHECEU (tipo 2): há quinze anos, em {moinho},
   nasceu uma criança de que quem anda com o herói nunca soube — ou de que
   lhe disseram que não tinha sobrevivido. Agora tem uma farda debaixo do
   colchão, de quem serve a mão que tudo estraga. Contar, ficar perto sem
   dizer, ou levar à força. Do melhor (o nome dito, e a farda queimada) ao
   pior (levar sem confiança, e quem se põe à frente quando vêm buscar). */
const A_FARDA_DEBAIXO_DO_COLCHAO = quest({
  id: "a_farda_debaixo_do_colchao",
  titulo: "A Farda Debaixo do Colchão",
  tipo: 2,
  quando: ["cedo", "meio", "fim"],
  afim: [],
  papeis: {
    quem: { de: "grupo", ou: "elo", rotulo: "quem anda contigo" },
    filho: { de: "elenco", cidade: "uma cidade dos atos 2 ou 3", rotulo: "{filho:o rapaz do moinho|a rapariga do moinho}" },
    avo: { de: "elenco", proximo: "filho", rotulo: "quem {filho:o criou|a criou}" },
    moinho: { de: "lugar", vizinho: "filho", tipos: ["forja", "mercado", "taverna"] },
  },
  mao: null,
  ponte: "{filho} vai vestir a farda de quem serve a mão que tudo estraga, numa cidade por onde um passo dele vai passar",
  pede: [],
  deixa: [],
  gancho: "Em {moinho}, {quem} parou de repente a meio da rua, a olhar para {filho}, que carregava sacos com o ombro torto de quem carrega desde criança. Não disse nada. Voltou lá no dia seguinte, e no outro, e de cada vez ficou do outro lado da rua, a ver. Ontem à noite perguntou-te, de olhos no fogo, se achavas que uma pessoa se reconhece pela maneira de rir.",
  etapas: [
    { id: "sinal", texto: "Perguntar a {quem} porque volta sempre a {moinho}",
      espera: 2, acende: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 1]],
      conclui: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 2], ["conversou", "papel:quem", 2]] },
    { id: "avo", texto: "Ouvir {avo}, que {filho:o criou|a criou}",
      ancora: { tipo: 1, concluidas: 1 },
      conclui: ["todos", ["esteve", "lugar:moinho"], ["conversou", "papel:avo"]] },
    { id: "sangue", texto: "Dizer a {quem} o que fazer com o que sabe",
      conclui: ["algum", ["escolheu", "sangue", "contar"], ["escolheu", "sangue", "calar"], ["escolheu", "sangue", "levar"]],
      ramos: ["contar", "calar", "levar"] },
    { id: "recrutas", texto: "Estar em {moinho} com {quem} na noite em que vêm buscar {filho}",
      espera: 6,
      conclui: ["todos", ["esta_em", "lugar:moinho"], ["acompanha", "papel:quem"], ["conheceu", "papel:filho"]] },
  ],
  escolhas: {
    sangue: { etapa: "sangue", opcoes: {
      contar: {
        texto: "dizer a {quem} que conte tudo a {filho}, antes da farda",
        ganha: "{filho} fica a saber de onde vem antes de escolher para onde vai — e quem sabe de onde vem escolhe de outra maneira.",
        custa: "Quinze anos de mentira de {avo} caem de uma vez em cima de quem não pediu nada. {filho} pode odiar-vos aos três, e com razão.",
        efeitos: [],
      },
      calar: {
        texto: "dizer a {quem} que fique por perto, sem dizer quem é",
        ganha: "{filho} não perde a única família que conhece, e {quem} tem tempo para ser alguém antes de ser um nome.",
        custa: "Quem não sabe de onde vem não tem razão para ficar. Se o tempo não chegar, {filho} veste a farda e vai — e {quem} vê partir sem poder dizer porquê.",
        efeitos: [],
      },
      levar: {
        texto: "dizer a {quem} que leve {filho} dali esta noite, à força se for preciso",
        ganha: "Ninguém lhe põe a farda: na manhã em que vierem buscar, {filho} já está a dois dias de estrada.",
        custa: "Leva-se alguém contra a vontade, sem lhe dizer porquê. Se {filho} gritar, os que vêm buscar ouvem — e sem a confiança inteira de {quem} ao teu lado, é {quem} que se põe à frente, sem pensar, como fazem os pais.",
        efeitos: [],
      },
    } },
  },
  solucoes: {
    sangue: {
      contar: [{ texto: "{quem} passa a noite inteira a ensaiar a primeira frase, e de manhã ainda não a tem. Vai na mesma." }],
      calar: [{ texto: "{quem} acena, aliviado e envergonhado de estar aliviado, e no dia seguinte oferece-se em {moinho} para carregar sacos." }],
      levar: [{ texto: "{quem} pega na corda e no saco sem dizer nada, e verifica duas vezes se a lâmina sai bem da bainha." }],
    },
  },
  reviravoltas: [
    { id: "a_mentira_de_quinze_anos",
      texto: "{avo} confessa, de mãos no avental: foi {avo} quem escondeu a criança, há quinze anos, porque {quem} ia para a guerra e não havia de voltar. Criou-{filho:o|a} como {filho:neto|neta} da casa e mentiu a toda a gente, a {filho} mais do que a todos. Pede que não lho tirem agora. É a única coisa que tem.",
      gatilho: ["todos", ["etapa", "avo"], ["consultou", "papel:avo"], ["nenhum", ["etapa", "recrutas"]]],
      efeitos: [{ tipo: "quem_e", papel: "avo", linha: "escondeu durante quinze anos de quem era a criança que criou" }] },
    { id: "a_farda",
      texto: "Debaixo do colchão de {filho} há uma farda dobrada, com a fita de quem serve a mão que tudo estraga, e uma data marcada a carvão: daqui a três noites. {filho} já disse que sim. Só falta virem buscar.",
      gatilho: ["todos", ["etapa", "avo"], ["descobriu", "lugar:moinho"], ["nenhum", ["etapa", "recrutas"]]],
      efeitos: [{ tipo: "acende", etapa: "recrutas" }, { tipo: "deixa", premissa: "recruta:filho" }] },
  ],
  desfechos: [
    { id: "o_nome_dito",
      quando: ["todos", ["escolheu", "sangue", "contar"], ["afeicao", "papel:quem", 3], ["conversou", "papel:filho", 2]],
      texto: "Quando vêm buscar, {filho} está à porta com a farda dobrada nas mãos, e devolve-a sem uma palavra. Os que vieram olham para {quem}, de pé ao lado, e vão-se embora. Mais tarde, ao lume, {filho} pergunta a {quem} como foi, há quinze anos. {quem} conta. Conta até amanhecer.",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "filho" }] },
    { id: "a_porta_que_fica",
      quando: ["escolheu", "sangue", "contar"],
      texto: "{filho} ouve tudo e não diz nada. Na noite em que vêm buscar, não abre a porta — mas também não abre a de {quem}. Não lhe fala, não lhe olha, e quando partem de {moinho} fica à janela até deixarem de se ver. É mais do que nada. {quem} diz que é muito.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "tem alguém do seu sangue que já sabe, e que ainda não lhe fala" }] },
    { id: "o_estranho_que_ficou",
      quando: ["todos", ["escolheu", "sangue", "calar"], ["conversou", "papel:filho", 2]],
      texto: "Na noite em que vêm buscar, {filho} sai à porta com a farda vestida — e volta a entrar. Diz aos que vieram que mudou de ideias, sem saber explicar porquê. {quem} sabe. Foi o estranho que carregava sacos e não pedia nada. {filho} nunca vai saber mais do que isso.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "salvou alguém do seu sangue de uma farda, sem nunca lhe dizer quem era" }] },
    { id: "a_estrada_a_forca",
      quando: ["todos", ["escolheu", "sangue", "levar"], ["afeicao", "papel:quem", 3]],
      texto: "Levam {filho} de noite, a espernear, {filho:enrolado|enrolada} numa manta. Ao segundo dia de estrada, {filho} cansa-se de gritar. Ao terceiro, pergunta porquê. {quem} diz. {filho} não perdoa — mas está {filho:vivo|viva}, longe de {moinho}, e sem farda nenhuma.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "levou alguém do seu sangue à força para longe de uma farda, e ainda espera o perdão" }] },
    { id: "a_farda_vestida", padrao: true,
      texto: "Ninguém diz nada a {filho}, e na noite marcada {filho} vai, de farda vestida e cabeça alta, sem olhar para trás. {quem} fica do outro lado da rua, como no primeiro dia. Agora sabe que vai voltar a ver aquela cara — e do outro lado de uma batalha.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "quem_e", papel: "quem", linha: "viu partir de farda alguém do seu sangue que nunca soube que o era" }] },
    { id: "sem_filho", cedo: true,
      quando: ["todos", ["morto", "papel:filho"], ["nenhum", ["etapa", "recrutas"]]],
      texto: "{filho} morreu antes de saber. {quem} vai ao enterro como um estranho que passava, e fica ao fundo. {avo} reconhece {quem} à saída e aperta-lhe a mão muito tempo, sem dizer porquê.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "foi ao enterro de alguém do seu sangue como um estranho que passava" }] },
    { id: "o_segredo_que_fica", cedo: true,
      quando: ["morto", "papel:quem"],
      texto: "{quem} morreu sem dizer nada a {filho}. Ficas tu com o segredo, e tens de decidir se o levas a {moinho} ou se o deixas morrer contigo.",
      efeitos: [] },
    { id: "a_noite_dos_recrutas",
      quando: ["todos", ["escolheu", "sangue", "levar"], ["nenhum", ["afeicao", "papel:quem", 3]]],
      texto: "{filho} grita. Grita como se {filho:o|a} estivessem a matar, e os que vinham buscar chegam antes do tempo. {quem} põe-se à frente sem pensar, de lâmina na mão, e aguenta o tempo de {filho} fugir pela porta das traseiras. Quando tudo acaba, {filho} volta, e ajoelha-se ao lado de quem ficou no chão — e é {avo} quem lhe diz, por fim, quem era.",
      efeitos: [{ tipo: "morte", papel: "quem" }] },
  ],
  abandono: { semAvancar: 15, desfecho: "a_farda_vestida" },
});

/* O lote, pela ordem: as sete do tipo 1 (o rosto e o confronto da fera à
   cabeça), e as três do coração. A biblioteca concatena-o depois do lote 3. */
export const QUESTS_LOTE_4 = [
  A_LUZ_DO_DIA, O_FUNDO_DA_TOCA, O_FUNDO_DA_PEDREIRA, O_ENFORCADO_DE_AMANHA, O_LIVRO_DOS_NOMES,
  AS_MAOS_QUE_CURAM, DO_OUTRO_LADO_DO_VAU,
  A_PALAVRA_DADA_A_UM_ENFORCADO, A_VIDA_QUE_SE_DEVE, A_FARDA_DEBAIXO_DO_COLCHAO,
];
