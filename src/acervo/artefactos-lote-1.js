/* ============================================================
   OS ARTEFACTOS, LOTE 1 — dezassete peças do enredo e dezasseis lembranças
   (09/11/2026, Fase TE · TE8)

   A pessoa, 09/11: *«além da ótima história ele precisa da recompensa e da
   sensação de ficar mais forte».* E as decisões dela no mesmo dia: dois
   artefactos do enredo e até duas lembranças dos companheiros por campanha.
   A planta (mente/plano-temperatura-e-espolios.md, §2.3) pôs o artefacto a
   crescer de adormecido a desperto a exaltado, à maneira dos Vestiges of
   Divergence do Critical Role (Explorer's Guide to Wildemount, 2020, cap. 6):
   a peça é memória da campanha porque muda com ela. Daqui sai o molde, e só
   o molde — nenhum nome nem texto de lá.

   UM ARTEFACTO POR QUEST QUENTE. As dezassete quests de fogueira e incêndio
   do tipo 1 têm, cada uma, a SUA peça, e cada uma das dezasseis do coração
   a sua lembrança. Não há saco de artefactos: a peça é a coisa DAQUELE
   vilão, DAQUELA barqueira, DAQUELE companheiro, e a história monta-se com
   os nomes da campanha («a lâmina daquele tenente», a mesa do Matt Mercer).
   Duas campanhas que passem pela mesma quest levam a mesma peça com outros
   nomes dentro — e cada uma conta-a como sua.

   A FORMA (lida por espolios.js — pecaComNome, despertarArtefacto,
   promessaDoArtefacto; provada em teste-espolios §1 e §9):
     genero    "artefacto" (tipo 1 quente) | "lembranca" (tipo 2)
     tipo      o encaixe (BASES de loot.js)
     base      a base fixa, ou null para a do herói nesse encaixe (a arma
               com nome tem sempre a forma da arma de quem a ganha)
     nome, historia   modelos com os papéis da ficha; o género de gente vai
               em «{papel:dele|dela}». Onde o vilão pode ser um bicho,
               nenhum adjetivo nem pronome lhe dá género, nem mão.
     passivos  ids de PODERES (afixos.js), pela ordem em que acordam. Só
               acendem os que o DEGRAU da peça deixa: a adormecida acende o
               primeiro que pode, a desperta os dois primeiros que pode.
     gesto     o `ativo` das relíquias (relicas.js#usarAtivo): uma vez por
               dia, só exaltado; a lembrança não tem.

   A RÉGUA MANDA (teste-regua-do-poder.mjs, TE7, e o que ela ensinou):
     · nenhum passivo de dano, de golpe extra, de crítico nem de defesa
       acende abaixo do épico — a régua recusou-os no nível 7 (+27,7, +22,0
       e +16,3 pontos com a Sede, o Peso Certo e o Gume Eterno). Até ao
       nível 10 a força da peça é o gesto e a história;
     · DO 11 EM DIANTE a peça de quest já não sobe o herói (é do degrau do
       típico), e é o artefacto que DESPERTA quem o faz sentir-se mais
       forte: desperto, acende o teto do nível em que foi ganho
       (DESPERTAR_DO_ARTEFACTO, coluna `degrau`) — os poderes que esse
       degrau compra, sem reforjar o aço. A arma escreve-se na ordem
       [Ceifa, Bote, Aurora|Umbra, um menor]: no raro acende o Bote e o
       menor; no épico (11–16) o Bote e a Aurora, +2 que só o épico deixa,
       e é o que a régua mediu (+3 a +7 nas classes do aço, no 12); no
       lendário (17+) a Ceifa e o Bote. A Presteza (golpe extra) punha o kit
       a +28 a +59 e a Carniceira a +23 — fora. O escudo, o elmo, as botas e
       a armadura nunca acendem defesa;
     · a ordem dos passivos é uma catraca: o que acende num estado nunca se
       apaga no seguinte (teste-espolios §9).

   A VOZ: «maravilhosas, provocantes, intensas». Um artefacto conta uma
   história que o jogador quer contar a alguém.

   UM LOTE NÃO IMPORTA NADA: são dados, e quem os lê é espolios.js.
   ============================================================ */
const peca = (p) => Object.freeze({ ...p, passivos: Object.freeze([...p.passivos]), gesto: p.gesto ? Object.freeze({ ...p.gesto, efeito: Object.freeze(p.gesto.efeito) }) : null });
const buff = (nome, bonus, aplica, turnos = 3) => Object.freeze({ nome, bonus, turnos, aplica });

export const ARTEFACTOS_LOTE_1 = Object.freeze({
  /* ================= OS CONFRONTOS — o prémio do fim ================= */

  /* O CIMO DA ESCADA. A peça de exemplo da TE6, com o nome e o gesto que a
     TE9 já ligou ao jogo. O texto deixou de lhe pôr uma mão: o vilão aqui
     pode ser qualquer coisa. */
  o_cimo_da_escada: peca({
    genero: "artefacto", tipo: "arma", base: null,
    nome: "A Que Subiu a Escada",
    historia: "Estava cravada no último degrau de {covil}, ao lado de {vilao}, e ninguém a tinha conseguido arrancar. Saiu-te à primeira. Sabe o peso de quem venceu, e não o esquece.",
    passivos: ["ceifa", "bote", "aurora", "empunhadura"],
    gesto: { nome: "O Último Degrau", diz: "Por três respirações, todos à tua volta lutam como quem já viu o fim e não teve medo.",
      efeito: { buff: buff("O Último Degrau", 4, "todos") } },
  }),

  a_hora_marcada: peca({
    genero: "artefacto", tipo: "amuleto", base: "Medalhão Antigo",
    nome: "A Hora Que Não Bateu",
    historia: "Estava pendurada à porta de {palco}, a contar para trás a hora de {vilao}. Parou no minuto em que chegaste — e desde então só anda quando tu decides.",
    passivos: ["vontade", "segunda_chance", "memoria"],
    gesto: { nome: "A Hora É Minha", diz: "O mundo espera um instante por ti, como esperou por quem marcou a hora — e desta vez a hora é tua.",
      efeito: { buff: buff("A Hora É Minha", 4, "destreza"), limpa: ["atordoado", "lento"] } },
  }),

  o_fundo_da_toca: peca({
    genero: "artefacto", tipo: "armadura", base: null,
    nome: "A Lição Arrumada",
    historia: "A couraça de um caçador que desceu a {toca} antes de ti e não voltou a subir. {vilao} deixou-a inteira, arrumada ao pé dos ossos dele, como quem guarda uma lição. Tu aprendeste-a.",
    passivos: ["folego", "reergue", "forro"],
    gesto: { nome: "Ainda Não", diz: "O corpo já tinha decidido ficar no fundo. A couraça aperta-se, e decide por ti que ainda não.",
      efeito: { curaFracao: 0.3, limpa: ["sangrando", "envenenado"] } },
  }),

  a_nona_noite: peca({
    genero: "artefacto", tipo: "escudo", base: "Escudo de Madeira",
    nome: "A Porta Pequena",
    historia: "A porta pequena de {muralha}, a que a vila ia abrir ao amanhecer para pôr alguém do lado de fora. Arrancaste as tábuas dos gonzos e fizeste delas escudo. Nove noites {vilao} bateu nela, e ela não abriu.",
    passivos: ["escamas_igneas", "talabarte"],
    gesto: { nome: "Ninguém Abre", diz: "Plantas os pés e o escudo fecha-se como uma porta trancada por dentro: o que bate do lado de fora bate em vão.",
      efeito: { buff: buff("Ninguém Abre", 4, "vigor"), limpa: ["caido", "amedrontado"] } },
  }),

  o_ultimo_barco: peca({
    genero: "artefacto", tipo: "anel", base: "Anel de Sinete",
    nome: "O Sinete Afogado",
    historia: "O sinete com que {vilao} selou cada papel que vendeu esta terra. Caiu à água na última noite, em {cais}, quando a maré virou — e tu mergulhaste por ele. Ainda sabe a sal, e ainda abre as portas que abria.",
    passivos: ["sangue_limpo", "segunda_chance", "lingua_de_prata"],
    gesto: { nome: "A Maré Vira", diz: "Como a maré naquela noite: o que te arrastava para o fundo larga-te, e voltas à tona a respirar.",
      efeito: { curaFracao: 0.25, limpa: ["agarrado", "exausto"], buff: buff("A Maré Vira", 3, "todos") } },
  }),

  /* ================= OS ROSTOS — a primeira vez frente a frente ================= */

  /* O CONVITE SEM SELO. A segunda peça de exemplo da TE6, sem mudar nada:
     nenhum dos passivos é de dano nem de defesa. */
  o_convite_sem_selo: peca({
    genero: "artefacto", tipo: "amuleto", base: "Medalhão Antigo",
    nome: "O Selo Que Faltava",
    historia: "O lacre que {vilao} nunca pôs no convite, arrancado da mesa de {salao}. Aquece contra o peito quando alguém mente à tua frente.",
    passivos: ["lingua_de_prata", "voz_que_manda"],
    gesto: { nome: "A Lei da Casa", diz: "Debaixo deste teto ninguém puxa de uma lâmina — e quem te ouve sente-o nos ossos.",
      efeito: { buff: buff("A Lei da Casa", 4, "presenca") } },
  }),

  o_velorio_pago: peca({
    genero: "artefacto", tipo: "elmo", base: "Máscara Ritual",
    nome: "O Véu do Velório",
    historia: "O véu negro que {enlutada} tirou da cara à saída de {capela} e te pôs nas mãos: «para que te veja quem não te quer ver.» Debaixo dele ninguém te lê a cara — e tu lês a de toda a gente.",
    passivos: ["olho_atento", "sem_medo", "vista_clara"],
    gesto: { nome: "Luto Fechado", diz: "Baixas o véu, e o medo e a lisonja dos outros param do lado de fora, como gente à porta de um velório.",
      efeito: { buff: buff("Luto Fechado", 4, "testes"), limpa: ["amedrontado", "enfeiticado"] } },
  }),

  a_luz_do_dia: peca({
    genero: "artefacto", tipo: "anel", base: "Anel de Ossos",
    nome: "A Argola do Portão",
    historia: "A argola de ferro do portão de {campo}, que {vilao} arrancou ao meio-dia e pousou de lado, devagar. {vigia} forjou-a ao tamanho do teu dedo. Ainda tem as marcas — e ainda não tem medo de nada.",
    passivos: ["estanca", "mao_do_gigante", "sorte_do_ladrao"],
    gesto: { nome: "Ao Meio-Dia", diz: "Ficas no meio do lugar como quem chega a casa, à vista de todos, e ninguém à tua volta baixa os olhos.",
      efeito: { buff: buff("Ao Meio-Dia", 3, "todos"), limpa: ["amedrontado"] } },
  }),

  do_outro_lado_do_vau: peca({
    genero: "artefacto", tipo: "botas", base: "Botas do Viajante",
    nome: "As Botas da Barqueira",
    historia: "As botas de {barqueira}, que conhece o fundo do rio pedra a pedra. Deu-tas na margem, ainda molhadas, depois de atravessares à vista de {vilao}: «agora conheces tu.»",
    passivos: ["passo_largo", "vento_calcanhares", "pe_firme"],
    gesto: { nome: "O Vau", diz: "Há sempre um sítio onde a água dá pé. Os teus pés acham-no antes de ti.",
      efeito: { buff: buff("O Vau", 4, "destreza"), limpa: ["lento", "agarrado", "caido"] } },
  }),

  os_dados_dele: peca({
    genero: "artefacto", tipo: "amuleto", base: "Olho de Vidro",
    nome: "Os Dados de {vilao}",
    historia: "Os dois dados de osso com que {vilao} ganhou escrituras, anos de serviço e uma criança, em {taberna}. Viciados — mas não como pensavas: caem sempre para quem os traz ao peito.",
    passivos: ["fonte", "segunda_chance", "lingua_de_prata"],
    gesto: { nome: "A Última Mão", diz: "Por um instante, cada lance cai para o teu lado da mesa — e quem joga contra ti sente a cadeira a ficar vazia.",
      efeito: { buff: buff("A Última Mão", 4, "testes", 2) } },
  }),

  a_mesma_tempestade: peca({
    genero: "artefacto", tipo: "anel", base: "Anel de Rubi",
    nome: "A Brasa do Abrigo",
    historia: "Uma brasa do lume de {abrigo}, ao pé do qual dormiste três noites com {vilao} do outro lado. {estalajadeira} fechou-a num anel na manhã em que a tempestade passou. Nunca arrefeceu.",
    passivos: ["estanca", "olho_do_saber", "memoria"],
    gesto: { nome: "O Mesmo Lume", diz: "A brasa acorda, e o calor daquele lume volta ao corpo como se a tempestade tivesse passado agora.",
      efeito: { curaFracao: 0.3, limpa: ["exausto"] } },
  }),

  /* ================= AS PISTAS, AS CONSEQUÊNCIAS, O RECURSO — o meio ================= */

  a_mao_que_mudou_de_lado: peca({
    genero: "artefacto", tipo: "arma", base: null,
    nome: "A Que Saiu Pela Janela",
    historia: "A arma que {desertor} trazia na noite em que saiu pela janela, depois de sete anos a servir o lado errado. Pôs-ta na mão sem cerimónia: «agora serve quem a mereça.» Ainda conhece todas as portas dos fundos.",
    passivos: ["ceifa", "bote", "umbra", "mao_leve"],
    gesto: { nome: "A Janela", diz: "Há sempre uma saída que ninguém está a vigiar. A lâmina mostra-ta, e o corpo passa antes de o medo chegar.",
      efeito: { buff: buff("A Janela", 4, "destreza"), limpa: ["agarrado", "lento"] } },
  }),

  o_fundo_da_pedreira: peca({
    genero: "artefacto", tipo: "arma", base: null,
    nome: "A Que Veio do Fundo",
    historia: "{cavadora} cavou com as mãos até esta lâmina lhe cair aos pés — perdida por um dos onze, lá no fundo de {pedreira}. Tem a pedra entranhada no gume, e bate como quem ainda chama por alguém.",
    passivos: ["ceifa", "bote", "aurora", "empunhadura"],
    gesto: { nome: "Ainda Batem", diz: "Ouves, do fundo, as pancadas na pedra — e o corpo responde a cada uma como se fosse a tua vez de cavar.",
      efeito: { buff: buff("Ainda Batem", 4, "vigor"), curaFracao: 0.2 } },
  }),

  as_duas_fogueiras: peca({
    genero: "artefacto", tipo: "amuleto", base: "Pingente de Âmbar",
    nome: "A Cinza Que Não Ardeu",
    historia: "Uma pitada da cinza da fogueira que não deixaste acender, fechada em âmbar por {informante}. Quem a traz ao peito ouve as coisas a tempo — atrás de paredes finas e de pessoas que sorriem.",
    passivos: ["vontade", "olho_do_saber", "memoria"],
    gesto: { nome: "A Tempo", diz: "O mundo diz-te uma coisa um instante antes de a dizer aos outros. Um instante chega.",
      efeito: { buff: buff("A Tempo", 4, "percepcao") } },
  }),

  o_teu_nome_na_parede: peca({
    genero: "artefacto", tipo: "elmo", base: "Capuz de Couro",
    nome: "A Cara Que Te Roubaram",
    historia: "O capuz que {servo} usou para ter a tua cara na noite de {queimada}. Arrancaste-lho da cabeça diante de quem te acusava. Agora és tu quem decide de quem é a cara que os outros veem.",
    passivos: ["vontade", "cabeca_fria", "vista_clara"],
    gesto: { nome: "Não Fui Eu", diz: "Puxas o capuz, e por um momento ninguém tem a certeza de quem está debaixo dele — nem quem te quer mal.",
      efeito: { buff: buff("Não Fui Eu", 4, "testes"), limpa: ["enfeiticado"] } },
  }),

  as_armas_do_poco: peca({
    genero: "artefacto", tipo: "arma", base: null,
    nome: "A Primeira do Poço",
    historia: "Das trezentas armas de {arsenal}, a única que não deixaste ir no fundo do poço nem nas carroças de {servo}. {ferreira} afiou-a de noite, com a mão já sem tremer, e disse que valia pelas outras todas.",
    passivos: ["ceifa", "bote", "aurora", "empunhadura"],
    gesto: { nome: "Trezentas", diz: "Levantas a lâmina, e quem está ao teu lado luta como se trezentos estivessem atrás.",
      efeito: { buff: buff("Trezentas", 3, "todos") } },
  }),

  o_que_a_ama_esqueceu: peca({
    genero: "artefacto", tipo: "amuleto", base: "Relicário Pequeno",
    nome: "A Colher do Chá",
    historia: "A colher de prata com que {ama} mexia o chá que lhe roubava a memória — e que, na noite em que o deixou de beber, lhe devolveu um nome. Quem a traz ao peito não esquece o que lhe querem tirar.",
    passivos: ["vontade", "olho_do_saber", "memoria"],
    gesto: { nome: "Lembra-te", diz: "Uma voz antiga diz o teu nome por dentro, e tudo o que te queriam fazer esquecer volta ao sítio.",
      efeito: { buff: buff("Lembra-te", 4, "intelecto"), limpa: ["enfeiticado", "atordoado", "amedrontado"] } },
  }),

  /* ================= AS LEMBRANÇAS — o que fica do companheiro ================= */
  /* Incomuns, um passivo menor, sem gesto e sem crescer: a força delas é a
     de quem as deu. Ficam na bolsa quando o companheiro já não está. */

  a_carta_que_nao_se_abre: peca({
    genero: "lembranca", tipo: "amuleto", base: "Relicário Pequeno",
    nome: "O Lacre Gasto",
    historia: "O lacre da carta de {ferido}, gasto pelo polegar {quem:dele|dela} durante anos. {quem} deu-to no dia em que deixou de precisar de lhe tocar para adormecer.",
    passivos: ["memoria"], gesto: null,
  }),
  os_dias_que_faltam: peca({
    genero: "lembranca", tipo: "amuleto", base: "Escapulário",
    nome: "O Lenço Dobrado Depressa",
    historia: "O lenço onde {quem} tossia, e que dobrava depressa antes que visses a cor. Lavado em {horto}, já não tem cor nenhuma — só o cheiro das ervas de {curandeira}, e os dias que se ganharam.",
    passivos: ["porte"], gesto: null,
  }),
  a_lamina_enterrada: peca({
    genero: "lembranca", tipo: "amuleto", base: "Corda de Nós",
    nome: "O Cordão do Juramento",
    historia: "O cordão com que {quem} amarrou a lâmina à bainha diante do altar de {templo}, para que nunca mais saísse. Desatou-o à tua frente, e deu-to a ti, que ainda sabes porque se amarra.",
    passivos: ["porte"], gesto: null,
  }),
  o_sangue_do_outro_lado: peca({
    genero: "lembranca", tipo: "anel", base: "Anel Entrelacado",
    nome: "A Fita do Pulso",
    historia: "A fita que {irmao} trazia ao pulso, igual à daquela noite em {casa}. {quem} trançou-a num anel e pô-la no teu dedo: «para que alguém se lembre do que ela quer dizer, e não eu.»",
    passivos: ["memoria"], gesto: null,
  }),
  as_cartas_de_outra_casa: peca({
    genero: "lembranca", tipo: "anel", base: "Anel de Ouro",
    nome: "O Anel Devolvido",
    historia: "O anel que {amado} devolveu a {prometido} na véspera do casamento. {quem} pediu-te que o guardasses: as cartas já não precisam de chegar escondidas dentro da camisa.",
    passivos: ["lingua_de_prata"], gesto: null,
  }),
  a_palavra_dada_a_um_enforcado: peca({
    genero: "lembranca", tipo: "amuleto", base: "Escapulário",
    nome: "A Fita de Luto",
    historia: "A fita de luto que {quem} trouxe seis anos na mochila, por um soldado que não era do sangue {quem:dele|dela}. {mae} já sabe. A fita é tua — e o nome que ela guarda também.",
    passivos: ["porte"], gesto: null,
  }),
  a_vida_que_se_deve: peca({
    genero: "lembranca", tipo: "amuleto", base: "Talismã de Pena",
    nome: "A Carta Sem Selo",
    historia: "A carta de {salvador}, numa letra de quem escreve pouco, que {quem} leu de pé duas vezes e depois no chão. A dívida está paga. A carta, {quem} não a quis queimar — quis que a tivesses tu.",
    passivos: ["lingua_de_prata"], gesto: null,
  }),
  a_farda_debaixo_do_colchao: peca({
    genero: "lembranca", tipo: "amuleto", base: "Medalhão Antigo",
    nome: "O Botão da Farda",
    historia: "Um botão de latão da farda que {avo} escondeu anos debaixo do colchão, em {moinho}. {filho} arrancou-o e deu-o a {quem}; {quem} deu-to a ti, porque não sabia o que mais fazer com as mãos.",
    passivos: ["porte"], gesto: null,
  }),
  a_vigia_trocada: peca({
    genero: "lembranca", tipo: "amuleto", base: "Amuleto de Madeira",
    nome: "A Moeda Embrulhada em Pano",
    historia: "A última das moedas que {quem} mandou onze anos para uma casa onde nunca entrou, ainda no pano de sempre. {viuva} devolveu-a com uma frase só: «já sei de quem são.»",
    passivos: ["memoria"], gesto: null,
  }),
  /* A ÚLTIMA LIÇÃO. A lembrança de exemplo da TE6, sem mudar nada. */
  a_ultima_licao: peca({
    genero: "lembranca", tipo: "amuleto", base: "Corda de Nós",
    nome: "A Faixa de {mestre}",
    historia: "{quem} usou-a no último dia de escola, e deu-ta sem dizer porquê. Cada nó é um golpe que {mestre} lhe ensinou.",
    passivos: ["porte"], gesto: null,
  }),
  o_sangue_do_carrasco: peca({
    genero: "lembranca", tipo: "elmo", base: "Capuz de Couro",
    nome: "O Capuz do Carrasco",
    historia: "O capuz que {carrasco} trazia na mão no dia da forca, em {cadafalso}. Deu-o a {quem} sem uma palavra — e {quem}, que não o quer na cabeça nem no fogo, deu-to a ti para que pese a alguém que o possa pousar.",
    passivos: ["vista_clara"], gesto: null,
  }),
  quarenta_invernos: peca({
    genero: "lembranca", tipo: "botas", base: "Botas de Pelagem",
    nome: "As Botas de Quarenta Invernos",
    historia: "As botas de {um}, remendadas por {outro} quarenta invernos seguidos. Saíram de {cadeia} com os dois, e os dois concordaram, pela primeira vez em quarenta anos, que deviam ser tuas.",
    passivos: ["pe_firme"], gesto: null,
  }),
  a_cabeca_que_nao_se_baixa: peca({
    genero: "lembranca", tipo: "amuleto", base: "Relicário Pequeno",
    nome: "O Cartaz Dobrado em Quatro",
    historia: "O cartaz da arena com o nome de {rival} a vermelho, que {quem} arrancou da parede e dobrou em quatro. Já não precisa dele. Deu-to num relicário, para lembrar a um de vocês que a cabeça não se baixa.",
    passivos: ["porte"], gesto: null,
  }),
  o_que_o_tio_deixou: peca({
    genero: "lembranca", tipo: "anel", base: "Anel de Sinete",
    nome: "O Sinete da Casa",
    historia: "O sinete do tio de {quem}, com o nome da casa de {herdade}. Fique ou não com a terra, {quem} quis que o nome andasse contigo: onde tu fores, a casa vai.",
    passivos: ["lingua_de_prata"], gesto: null,
  }),
  o_juramento_a_cabeceira: peca({
    genero: "lembranca", tipo: "amuleto", base: "Escapulário",
    nome: "O Nome Bordado",
    historia: "Um pano onde {quem}, {quem:menino|menina}, bordou o nome de {alvo} — o nome que dizia todas as noites antes de dormir, como quem reza. Já não o diz. Deu-te o pano para que alguém o guarde sem ter de o cumprir.",
    passivos: ["memoria"], gesto: null,
  }),
  o_morto_que_voltou_a_casa: peca({
    genero: "lembranca", tipo: "amuleto", base: "Amuleto de Madeira",
    nome: "A Lasca da Lápide",
    historia: "Uma lasca da pedra pequena de {aldeia}, com o nome de {quem} e uma data de há sete anos. {quem} partiu-a com a mão. Diz que um morto não precisa de lápide — e que um vivo precisa de quem se lembre do dia em que voltou.",
    passivos: ["porte"], gesto: null,
  }),
});
