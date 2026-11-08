/* ============================================================
   O ACERVO, LOTE 5 — doze quests (oito do tipo 1, quatro do tipo 2)
   (09/11/2026, Fase BQ · BQ8)

   A pessoa, 09/11: «termine o acervo». A meta é 36 do tipo 1 e 16 do tipo
   2, e a biblioteca tinha 19 e 8. Este lote e o lote 6 (outra mão, ao
   mesmo tempo, em src/acervo/quests-lote-6.js) fecham-na. Para os temas
   não se cruzarem, este lote escreve do tipo 1 o «cedo» e o «meio», e do
   tipo 2 a culpa de quem sobreviveu, a traição de um mestre, um segredo
   de sangue e a escolha entre dois que se amam.

   UM LOTE NÃO IMPORTA NADA (o cabeçalho do lote 4 diz porquê): a ficha é
   dado, e quem a lê e a valida é a biblioteca.

   O QUE ESTE LOTE COBRE (o esqueleto mediu, 09/11, com 27 quests):
     · o ato 0 de TODAS as campanhas (o passo 1, «cedo») tinha quatro
       quests para mil campanhas — e a mão que a composição pede primeiro
       é o tenente. O Pão Que Sai de Noite, A Barca a Meio do Rio e As
       Chaves da Guarda são três tenentes do cedo (1 e 2); o primeiro
       aceita um servo que é bicho, para os 188 mundos em que nenhum servo
       é gente e O Que Desce ao Anoitecer era a única porta;
     · o passo 3 (mil campanhas, «meio») e o 4 (quinhentas): A Torre do
       Sino (2 e 3, cedo e meio), A Estalagem do Temporal (consequência e
       tenente, o 3), A Rua Que Não Acorda e As Duas Fogueiras (pistas do
       3 e do 4 — o 4 ficava por contestar em 81 de 500 campanhas de
       quatro atos, e O Enforcado de Amanhã entrava em 564 de 1000);
     · AS PEGADAS NO BARRO é a pista de um VILÃO QUE É BICHO (549 de 1000
       mundos): não o encontra — lê-o. O papel `vilao` aceita só a fera,
       e nenhuma etapa pede que o herói o veja: o rosto continua a ser do
       rosto. Antes dele, é «o que deixa pegadas do tamanho de uma porta».
   E os enredos da Grande Lista que o acervo ainda não usava: o 1 (o
   abrigo no temporal), o 5 (tomar um ponto), o 6 (limpar a zona sem
   lutar: entender), o 11 (a operação herdada sem experiência), o 12 (a
   vítima que não sabe que precisa de ajuda), o 20 (o estranho que afeta
   muitos), o 23 (as duas ameaças ao mesmo tempo, e não dá para as duas) e
   o 31 (o transporte tomado, e os passageiros a pedirem que não te metas).

   A VOZ: «maravilhosas, provocantes e intensas». Cada escolha custa dos
   dois lados, e o lado bom também é verdade (o «Dobre» da Grande Lista; e
   o Matt Mercer: o que o herói não perguntou volta para o morder). Nos
   textos onde o servo pode ser bicho, nenhum adjetivo nem pronome lhe dá
   género; onde só pode ser bicho, diz-se «o bicho».
   ============================================================ */
const quest = (q) => q;

/* O TENENTE QUE É BICHO, NO CEDO (enredo 12, «A ajuda está a caminho»,
   com a reviravolta de a vítima não saber que precisa dela): uma criança
   leva pão de noite a um bicho preso. Matá-lo à frente dela, levá-la para
   longe (e o bicho vem procurá-la), ou usá-la como isca. */
const O_PAO_QUE_SAI_DE_NOITE = quest({
  id: "o_pao_que_sai_de_noite",
  titulo: "O Pão Que Sai de Noite",
  tipo: 1,
  enredo: 12,                                   // «A ajuda está a caminho»: a vítima não sabe que precisa
  quando: ["cedo"],
  afim: ["arquipelago", "misterio"],
  papeis: {
    mae: { de: "elenco", rotulo: "quem conta os pães da casa" },
    crianca: { de: "elenco", proximo: "mae", rotulo: "{crianca:o pequeno que sai de noite|a pequena que sai de noite}" },
    covil: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["cemitério", "docas", "arena"] },
    fera: { de: "fio", papel: "tenente", aceita: ["fera"], alcunha: "o que come da mão de uma criança", rotulo: "o que come da mão de uma criança" },
  },
  mao: { tipo: "tenente", contra: [1, 2], papel: "fera" },
  temperatura: "brasa",
  estabelece: [["camada", "mao"]],
  gancho: "Há duas semanas que falta pão em casa de {mae}: um por noite, sempre o maior. {mae} pensou em ratos, depois em ladrões, e ontem ficou acordada. Era {crianca}, {crianca:descalço|descalça}, a sair pela janela com o pão debaixo do braço, e a voltar de madrugada com as mãos limpas e a camisa a cheirar a bicho. Não diz para onde vai. Diz só que prometeu.",
  etapas: [
    { id: "ouvir", texto: "Ouvir {mae}", conclui: ["conversou", "papel:mae"] },
    { id: "seguir", texto: "Seguir {crianca} de noite até {covil}",
      conclui: ["todos", ["esteve", "lugar:covil"], ["conheceu", "papel:fera"]] },
    { id: "decisao", texto: "Decidir o que se faz com o que {crianca} alimenta",
      conclui: ["algum", ["derrotou", "papel:fera"], ["escolheu", "pao", "afastar"], ["escolheu", "pao", "isca"]],
      ramos: ["lamina", "afastar", "isca"] },
    { id: "manha", texto: "Levar {crianca} de volta a {mae}",
      conclui: ["todos", ["conversou", "papel:mae", 2], ["nenhum", ["esta_em", "lugar:covil"]]] },
  ],
  escolhas: {
    pao: { etapa: "decisao", opcoes: {
      afastar: {
        texto: "levar {crianca} para longe dali, e nunca mais {crianca:o|a} deixar sair de noite",
        ganha: "Ninguém sangra e ninguém mente: {crianca} dorme de porta fechada, e o que estava em {covil} fica sem quem lhe leve de comer.",
        custa: "A fome não esquece um cheiro. {fera} vai vir procurar quem lhe levava o pão, e vem pela rua de {mae}. E {crianca} não te perdoa teres-lhe partido uma promessa.",
        efeitos: [{ tipo: "relogio_regional", n: 1 }, { tipo: "afeicao", papel: "crianca", n: -1 }],
      },
      isca: {
        texto: "deixar {crianca} levar o pão mais uma noite, com uma rede à espera",
        ganha: "{fera} vem comer da mão de quem confia, como todas as noites, e não chega a ver a rede. Ninguém luta. Ninguém do teu lado se fere.",
        custa: "Usas uma criança como isca, e a criança vê. {crianca} vai lembrar-se a vida inteira da cara do bicho ao olhar para trás, preso na rede: para {crianca:ele|ela}, e não para ti.",
        efeitos: [{ tipo: "situacao", papel: "fera", situacao: "cativa" }, { tipo: "quem_e", papel: "crianca", linha: "levou pão a um bicho preso todas as noites, e na última levou-o à rede" }],
      },
    } },
  },
  solucoes: {
    decisao: {
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:fera"],
          texto: "{fera} cai de lado e não se volta a erguer, mas respira. {crianca} põe-se entre ti e o bicho, de braços abertos, e não sai dali até amanhecer." },
        { id: "matou", texto: "{fera} fica onde caiu, em {covil}. {crianca} não grita: senta-se ao lado e acaba de lhe dar o pão, devagar, como se ainda servisse de alguma coisa." },
      ],
      afastar: [{ texto: "Pegas em {crianca} ao colo e levas para longe, a espernear. Atrás de ti, em {covil}, ouve-se um som comprido, que não é bem um uivo, e que a vila inteira ouve até de manhã." }],
      isca: [{ texto: "Na noite seguinte {crianca} leva o pão como sempre, e a rede cai quando o bicho baixa a cabeça para comer. Debate-se pouco. Olha para {crianca} o tempo todo." }],
    },
  },
  reviravoltas: [
    { id: "o_apito_na_palha",
      texto: "Em {covil}, enterrado na palha, há um apito de osso gasto de tanto uso, e uma corrente partida presa à parede. Alguém trouxe o bicho até aqui, prendeu-o e deixou-o à fome — de propósito, à espera de que uma criança da vila tivesse pena. Uma criança que leva pão aprende o caminho. E o que come aprende o cheiro de todas as casas por onde ela passa.",
      gatilho: ["todos", ["etapa", "seguir"], ["descobriu", "lugar:covil"], ["nenhum", ["etapa", "decisao"]]],
      efeitos: [{ tipo: "quem_e", papel: "fera", linha: "foi deixado à fome, preso a uma parede, para aprender o cheiro da vila" }] },
    { id: "a_promessa_da_crianca",
      texto: "{crianca} conta por fim, de olhos no chão: achou o bicho há duas semanas, preso e a morrer de fome, e prometeu-lhe que voltava todas as noites. Desde então, de cada vez que volta, há uma casa nova da vila riscada a unha na porta. {crianca} julgava que era para o bicho não se perder.",
      gatilho: ["todos", ["conversou", "papel:crianca"], ["consultou", "papel:crianca"], ["nenhum", ["etapa", "decisao"]]],
      efeitos: [{ tipo: "quem_e", papel: "crianca", linha: "prometeu a um bicho preso que voltava todas as noites com pão" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:crianca"], ["nenhum", ["derrotou", "papel:crianca"]]], ate: "decisao",
      texto: "Uma noite {crianca} foi e não voltou. Não foi o bicho: os que viram juram que ficou a guardar o corpo até de manhã, sem deixar ninguém chegar perto. Foi a corrente, que alguém tinha soltado nessa tarde, e que caiu do lado onde não devia." },
  ],
  abandono: { semAvancar: 4,
    texto: "Ninguém foi atrás de {crianca}. Na quarta noite, a corrente já não estava presa à parede, e de manhã havia uma casa da vila com a porta arrombada por dentro.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "{crianca} dorme em casa outra vez, e {mae} já não conta os pães. Mas na parede do quarto, à altura de uma mão pequena, ficou riscado a unha um caminho que ninguém lhe ensinou — e vai dar a quem pôs o bicho em {covil}.",
    efeitos: [{ tipo: "afeicao", papel: "mae", n: 1 }],
  },
});

/* O TENENTE DO TRANSPORTE TOMADO (cedo; enredo 31, «Leve-nos para
   Memphis e não desacelere»): a barca parada a meio do rio, seis a bordo,
   e o preço é alguém que se escondeu em terra. Entregá-lo, ires tu no
   lugar dele, ou nadar até lá. Os da barca pedem que ninguém se meta. */
const A_BARCA_A_MEIO_DO_RIO = quest({
  id: "a_barca_a_meio_do_rio",
  titulo: "A Barca a Meio do Rio",
  tipo: 1,
  enredo: 31,                                   // «Leve-nos para Memphis»: o transporte tomado
  quando: ["cedo"],
  afim: ["arquipelago", "jornada"],
  papeis: {
    cais: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["docas", "mercado", "taverna"] },
    servo: { de: "fio", papel: "tenente", alcunha: "quem tomou a barca", rotulo: "quem tomou a barca" },
    procurado: { de: "elenco", exige: ["vivo"], rotulo: "quem eles querem em troca" },
    parente: { de: "elenco", do: "cais", rotulo: "quem tem um filho naquela barca" },
  },
  mao: { tipo: "tenente", contra: [1, 2], papel: "servo" },
  temperatura: "chama",
  estabelece: [["camada", "mao"]],
  gancho: "A barca da travessia parou a meio do rio ao nascer do sol, com seis a bordo, e não anda para lado nenhum. {servo} está de pé na proa, de lâmina ao pescoço do barqueiro, e grita para {cais} a mesma coisa de hora a hora: quer {procurado} no cais ao meio-dia, e os seis voltam a terra. Senão, vai um à água por cada hora que passe. {parente} tem um filho naquela barca, e já não sabe rezar.",
  etapas: [
    { id: "cais", texto: "Chegar a {cais} e ouvir {parente}",
      conclui: ["todos", ["esteve", "lugar:cais"], ["conversou", "papel:parente"]] },
    { id: "procurado", texto: "Achar {procurado} antes do meio-dia", conclui: ["conversou", "papel:procurado"] },
    { id: "troca", texto: "Decidir o que se dá por quem está na barca",
      conclui: ["algum", ["derrotou", "papel:servo"], ["escolheu", "barca", "entregar"], ["escolheu", "barca", "trocar"]],
      ramos: ["lamina", "entregar", "trocar"] },
    { id: "terra", texto: "Ver quem chega a terra",
      conclui: ["todos", ["esteve", "lugar:cais"], ["conversou", "papel:parente", 2]] },
  ],
  escolhas: {
    barca: { etapa: "troca", opcoes: {
      entregar: {
        texto: "levar {procurado} ao cais ao meio-dia, e deixar que {servo} {procurado:o|a} leve",
        ganha: "Os seis voltam a terra pelo próprio pé, molhados e vivos, e {parente} abraça o filho no cais à frente de toda a gente.",
        custa: "{procurado} sobe à barca de cabeça baixa e não olha para trás. O que sabia vai com quem {procurado:o|a} leva — e quem tomou a barca aprende que nesta terra se troca gente por gente.",
        efeitos: [{ tipo: "situacao", papel: "procurado", situacao: "cativa" }, { tipo: "relogio_do_fio", n: 1 }, { tipo: "afeicao", papel: "parente", n: 1 }],
      },
      trocar: {
        texto: "ires tu à barca, no lugar de {procurado}",
        ganha: "Ninguém é entregue. Os seis saltam para terra quando sobes a bordo, e {procurado} fica no cais a ver-te ir.",
        custa: "Ficas a meio do rio, ao alcance de {servo}, sem ponte nem margem. Levam-te dois dias rio abaixo, à frente de quem manda nisto — e esse fica a saber a tua cara antes de tu saberes a dele.",
        efeitos: [{ tipo: "avisa_vilao" }, { tipo: "dia", n: 2 }, { tipo: "afeicao", papel: "procurado", n: 1 }],
      },
    } },
  },
  solucoes: {
    troca: {
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:servo"],
          texto: "Chegas à barca a nado, por baixo da proa. {servo} cai no fundo da barca e não se volta a erguer, mas respira. O barqueiro pega nos remos sem esperar que ninguém lho mande." },
        { id: "matou", texto: "Chegas à barca a nado, por baixo da proa. {servo} cai à água, e o rio leva-{servo:o|a} sem fazer espuma. Na barca ninguém diz nada até tocar em terra." },
      ],
      entregar: [{ texto: "Ao meio-dia, a barca encosta ao cais o tempo exato de {procurado} subir e de os seis saltarem. Depois afasta-se rio abaixo, e {procurado} fica de pé na popa até deixar de se ver." }],
      trocar: [{ texto: "Sobes à barca. Os seis passam por ti a correr, sem te olhar, e {servo} mede-te de alto a baixo com um sorriso que não esperavas: era a ti que queria ver de perto." }],
    },
  },
  reviravoltas: [
    { id: "o_que_viu_nos_caixotes",
      texto: "{procurado} conta porque {procurado:o|a} querem: há um mês, a fazer a travessia de noite, viu o que ia dentro dos caixotes que a barca levava para o outro lado, e quem os pagava. Não contou a ninguém. Achou que bastava calar. Não basta nunca.",
      gatilho: ["todos", ["etapa", "procurado"], ["consultou", "papel:procurado"], ["nenhum", ["etapa", "troca"]]],
      efeitos: [{ tipo: "quem_e", papel: "procurado", linha: "viu o que ia nos caixotes da travessia, e quem os pagava" }] },
    { id: "os_barcos_acorrentados",
      texto: "Os barcos de {cais} estão todos presos com corrente nova e cadeado fechado, e a guarda do rio olha para o outro lado. Alguém pagou para que a única maneira de chegar à barca fosse a nado — ou de mão dada com quem eles querem. E da barca, os seis gritam para terra que ninguém se meta.",
      gatilho: ["todos", ["etapa", "cais"], ["descobriu", "lugar:cais"], ["nenhum", ["etapa", "troca"]]],
      efeitos: [{ tipo: "relogio_regional", n: 1 }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:procurado"], ["nenhum", ["derrotou", "papel:procurado"]]], ate: "troca",
      texto: "Acharam {procurado} no rio antes do meio-dia, de bruços, a descer com a corrente. A barca voltou a terra na mesma — já não precisava de troca nenhuma —, e quem a tinha tomado saltou para a outra margem sem que ninguém fosse atrás." },
  ],
  abandono: { semAvancar: 2,
    texto: "Ninguém foi ao cais ao meio-dia. Ao fim da tarde, a barca chegou à outra margem com menos gente do que tinha saído, e {parente} passou a noite no cais a olhar para a água.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }, { tipo: "afeicao", papel: "parente", n: -1 }] },
  fecho: {
    texto: "A barca volta a fazer a travessia, devagar, como se tivesse vergonha. E o rio, que leva tudo, deixou na margem um caixote partido com uma marca a fogo — a primeira ponta de um fio que vai dar a quem paga os caixotes.",
    efeitos: [{ tipo: "favor", papel: "cais" }],
  },
});

/* O TENENTE DENTRO DA GUARDA (cedo; enredo 11, «Bom serviço de
   limpeza»): o capitão foge e deixa-te as chaves, e metade da guarda
   come da mão de um servo dele. A velha guarda foge porque alguma coisa
   grande vem aí, e o conselho escolheu-te para a culpa. Expulsar, manter
   e vigiar, ou devolver as chaves com os nomes. */
const AS_CHAVES_DA_GUARDA = quest({
  id: "as_chaves_da_guarda",
  titulo: "As Chaves da Guarda",
  tipo: 1,
  enredo: 11,                                   // «Bom serviço de limpeza»: a operação herdada sem experiência
  quando: ["cedo"],
  afim: ["reinado", "misterio"],
  papeis: {
    quartel: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["quartel", "cadeia", "guilda"] },
    capitao: { de: "elenco", do: "quartel", rotulo: "quem te deixou as chaves" },
    sargento: { de: "elenco", proximo: "capitao", rotulo: "quem ainda faz a ronda" },
    servo: { de: "fio", papel: "tenente", alcunha: "quem paga a guarda por baixo da mesa", rotulo: "quem paga a guarda por baixo da mesa" },
  },
  mao: { tipo: "tenente", contra: [1, 2], papel: "servo" },
  temperatura: "brasa",
  estabelece: [["camada", "mao"]],
  gancho: "{capitao}, capitão da guarda de {quartel} há vinte anos, pôs-te as chaves na mão à frente do conselho — ninguém da terra as quis, e tu eras quem estava na sala — e disse que a guarda era tua até haver outro. Esta noite tem a carroça carregada à porta. Doze de guarda, e metade olha-te de lado. A ronda já não passa pela rua do mercado, e ninguém sabe dizer quem mandou que não passasse.",
  etapas: [
    { id: "chaves", texto: "Ouvir {capitao} antes que parta", conclui: ["conversou", "papel:capitao"] },
    { id: "ronda", texto: "Saber quem da guarda come da mão de {servo}",
      conclui: ["pelo_menos", 2, ["conversou", "papel:sargento"], ["consultou", "papel:sargento"], ["descobriu", "lugar:quartel"], ["conversou", "papel:servo"]] },
    { id: "servo", texto: "Tirar {servo} de dentro de {quartel}",
      conclui: ["algum", ["derrotou", "papel:servo"], ["todos", ["consultou", "papel:capitao"], ["descobriu", "lugar:quartel"]]],
      ramos: ["lamina", "livro"] },
    { id: "guarda", texto: "Decidir o que fica da guarda",
      conclui: ["algum", ["escolheu", "guarda", "expulsar"], ["escolheu", "guarda", "manter"], ["escolheu", "guarda", "devolver"]],
      ramos: ["expulsar", "manter", "devolver"] },
  ],
  escolhas: {
    guarda: { etapa: "guarda", opcoes: {
      expulsar: {
        texto: "expulsar hoje mesmo todos os que comiam da mão de {servo}",
        ganha: "A guarda que fica é pequena e limpa: seis que não se vendem, e que te seguem para onde fores.",
        custa: "Seis de guarda para uma cidade inteira. As noites ficam compridas, as ruas do fundo ficam sem ninguém — e os seis expulsos sabem as rondas de cor, e já não te devem nada.",
        efeitos: [{ tipo: "relogio_regional", n: 1 }, { tipo: "afeicao", papel: "sargento", n: 1 }, { tipo: "aliado", papel: "sargento" }],
      },
      manter: {
        texto: "manter todos, os comprados também, e saber sempre onde estão",
        ganha: "Ninguém sabe que sabes. Os comprados continuam a vender — e passam a vender o que tu quiseres que se compre.",
        custa: "Dormes com metade da guarda a contar-te os passos. Um dia um deles percebe, e nesse dia não sabes de que lado da porta vai estar.",
        efeitos: [{ tipo: "relogio_do_fio", n: -1 }, { tipo: "afeicao", papel: "sargento", n: -1 }],
      },
      devolver: {
        texto: "devolver as chaves ao conselho, com os nomes dos comprados por escrito",
        ganha: "As chaves voltam a quem as deu, e os nomes vão com elas: ninguém pode dizer que a guarda caiu na tua mão. Ficas livre para ir onde é preciso.",
        custa: "O conselho deu-te as chaves porque não as queria. Quem as receber a seguir vai ser escolhido por quem pagou a guarda — e {sargento} fica a ver-te sair como viu sair {capitao}.",
        efeitos: [{ tipo: "afeicao", papel: "sargento", n: -1 }, { tipo: "relogio_do_fio", n: 1 }],
      },
    } },
  },
  solucoes: {
    servo: {
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:servo"],
          texto: "{servo} fica no chão do pátio de {quartel}, com vida, à frente da guarda formada. Ninguém {servo:o|a} ajuda a levantar. É assim que se sabe quem eram os seus." },
        { id: "matou", texto: "{servo} cai no pátio de {quartel}, e a guarda formada fica muito tempo sem saber para onde olhar." },
      ],
      livro: [{ texto: "{capitao} diz-te, já de pé na carroça, onde se guarda o livro do soldo verdadeiro: por baixo da tábua do altar da capela do quartel. Lá dentro há duas colunas — o que paga o conselho e o que paga {servo}. A segunda é maior, e {servo} deixa o quartel nessa noite sem que ninguém lho peça." }],
    },
    guarda: {
      expulsar: [{ texto: "Formas a guarda no pátio e dizes os nomes, um a um. Seis entregam a lança sem dizer nada. Um cospe no chão. Os outros seis ficam muito direitos, e nunca mais te tratam por forasteiro." }],
      manter: [{ texto: "Não dizes nada. Na ronda da noite deixas os comprados nas ruas que te convêm, e ficas a ver para quem correm de madrugada." }],
      devolver: [{ texto: "Pousas as chaves na mesa do conselho, por cima de uma folha com seis nomes. Ninguém pega na folha. Passa de mão em mão, de pernas para o ar, até alguém a dobrar em quatro." }],
    },
  },
  reviravoltas: [
    { id: "a_carroca_carregada",
      texto: "{capitao} não foge de vergonha: foge de medo. Há uma semana, {servo} deixou-lhe à porta a lista das rondas da noite seguinte, escrita pela mão {capitao:dele|dela}, que ninguém mais devia ter. Percebeu que já não mandava na guarda, e que alguém queria um nome novo a quem pôr a culpa do que vem aí. O conselho escolheu o teu.",
      gatilho: ["todos", ["etapa", "chaves"], ["consultou", "papel:capitao"], ["nenhum", ["etapa", "guarda"]]],
      efeitos: [{ tipo: "quem_e", papel: "capitao", linha: "fugiu da guarda que comandou vinte anos, quando percebeu que já não mandava nela" }] },
    { id: "a_rua_do_mercado",
      texto: "A ronda deixou de passar pela rua do mercado na noite em que lá começaram a descarregar carroças de madrugada. {sargento} viu, e calou: tem uma filha a servir na casa de quem as recebe.",
      gatilho: ["todos", ["conversou", "papel:sargento"], ["consultou", "papel:sargento"], ["nenhum", ["etapa", "guarda"]]],
      efeitos: [{ tipo: "quem_e", papel: "sargento", linha: "viu as carroças da rua do mercado, e calou por causa de uma filha" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:sargento"], ["nenhum", ["derrotou", "papel:sargento"]]], ate: "guarda",
      texto: "Acharam {sargento} no fim da ronda, {sargento:caído|caída} na rua do mercado, com a lança ainda na mão. A guarda inteira percebeu ao mesmo tempo o recado: quem fala, cai. Na manhã seguinte, metade não veio." },
  ],
  abandono: { semAvancar: 5,
    texto: "As chaves ficaram na tua bolsa sem abrir porta nenhuma. Ao fim de cinco dias, a guarda de {quartel} já não esperava ordens tuas — recebia-as de outro, e com soldo.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "A guarda de {quartel} volta a fazer a ronda pela rua do mercado. Na primeira noite não se passa nada. Na segunda, alguém deixa à porta do quartel uma lança partida embrulhada num pano, que é a maneira de dizer que reparou.",
    efeitos: [{ tipo: "favor", papel: "quartel" }],
  },
});

/* O TENENTE QUE TOMOU UM PONTO (cedo e meio, 2 e 3; enredo 5, «Capturar
   a bandeira»): o sino que avisava o vale está calado, porque um servo
   dele tomou a torre. Subir de noite com vizinhos de forquilha, cercar
   até à fome, ou deixá-los sair armados. A torre tomada é a obra de um
   passo: a mão é também consequência. */
const A_TORRE_DO_SINO = quest({
  id: "a_torre_do_sino",
  titulo: "A Torre do Sino",
  tipo: 1,
  enredo: 5,                                    // «Capturar a bandeira»: os civis no fogo cruzado
  quando: ["cedo", "meio"],
  afim: ["jornada", "reinado"],
  papeis: {
    torre: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["templo", "quartel", "arena"] },
    servo: { de: "fio", papel: "tenente", alcunha: "quem tomou a torre do sino", rotulo: "quem tomou a torre do sino" },
    sineira: { de: "elenco", do: "torre", rotulo: "quem tocava o sino" },
    voluntario: { de: "elenco", proximo: "sineira", rotulo: "{voluntario:o primeiro a dizer que vem|a primeira a dizer que vem}" },
  },
  mao: { tipo: "tenente", contra: [2, 3], papel: "servo", tambem: ["consequencia"] },
  temperatura: "chama",
  estabelece: [["camada", "mao"]],
  gancho: "O sino de {torre} avisava o vale inteiro de fogo, de cheia e de gente armada na estrada. Há três dias que não toca: {servo} e os seus tomaram a torre de madrugada, trancaram a porta por dentro e cortaram a corda. {sineira} foi {sineira:atirado|atirada} pela escada abaixo e ainda coxeia. Ontem passaram carroças pelo vale de noite, e ninguém soube. {voluntario} juntou meia dúzia de vizinhos de forquilha e diz que vai lá esta noite, contigo ou sem ti.",
  etapas: [
    { id: "sineira", texto: "Ouvir {sineira}", conclui: ["conversou", "papel:sineira"] },
    { id: "cerco", texto: "Ver a torre de perto, com {voluntario}",
      conclui: ["todos", ["esteve", "lugar:torre"], ["conversou", "papel:voluntario"]] },
    { id: "assalto", texto: "Tomar a torre de volta",
      conclui: ["algum", ["derrotou", "papel:servo"], ["escolheu", "torre", "noite"], ["escolheu", "torre", "fome"], ["escolheu", "torre", "saida"]],
      ramos: ["lamina", "noite", "fome", "saida"] },
    { id: "sino", texto: "Ouvir o sino tocar outra vez",
      conclui: ["todos", ["esteve", "lugar:torre"], ["conversou", "papel:sineira", 2]] },
  ],
  escolhas: {
    torre: { etapa: "assalto", opcoes: {
      noite: {
        texto: "subir à torre esta noite, com {voluntario} e os vizinhos das forquilhas",
        ganha: "A torre cai antes de a lua chegar ao meio do céu, e de manhã o sino toca outra vez, por mão de gente do vale.",
        custa: "Vizinhos de forquilha contra gente que sabe usar uma lâmina. Nem todos descem pelo próprio pé, e {voluntario} desce às costas de outro.",
        efeitos: [{ tipo: "situacao", papel: "voluntario", situacao: "ferida" }, { tipo: "afeicao", papel: "voluntario", n: 1 }, { tipo: "relogio_do_fio", n: -1 }],
      },
      fome: {
        texto: "cercar a torre e esperar que a fome os traga cá abaixo",
        ganha: "Ninguém do vale sangra. Ao quarto dia a porta abre-se por dentro, e quem desce vem de mãos no ar.",
        custa: "Quatro dias sem sino. O que passa pelo vale nesses dias passa sem que ninguém saiba, e não volta para trás.",
        efeitos: [{ tipo: "dia", n: 4 }, { tipo: "relogio_regional", n: 1 }, { tipo: "relogio_do_fio", n: 1 }],
      },
      saida: {
        texto: "deixá-los sair com as armas, de noite, pela estrada do monte",
        ganha: "A torre volta ao vale sem um golpe. A porta abre-se ao primeiro sinal, e o sino toca nessa mesma madrugada.",
        custa: "Saem armados e a rir pela estrada do monte, e vão tomar outra coisa noutro sítio. {voluntario} não te perdoa teres deixado ir quem atirou {sineira} pela escada.",
        efeitos: [{ tipo: "relogio_regional", n: -1 }, { tipo: "afeicao", papel: "voluntario", n: -1 }, { tipo: "relogio_do_fio", n: 1 }],
      },
    } },
  },
  solucoes: {
    assalto: {
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:servo"],
          texto: "{servo} rende-se no alto da escada, de lâmina no chão, e os outros descem atrás sem que ninguém lho mande." },
        { id: "matou", texto: "{servo} cai pela escada por onde mandou atirar {sineira}, degrau a degrau, até ao fundo. Os outros abrem a porta sozinhos." },
      ],
      noite: [{ texto: "Sobem às escuras pela escada de serviço que só {sineira} conhecia. Há gritos lá em cima, uma forquilha que cai pelo vão, e depois silêncio. Quando a porta se abre, é {voluntario} que vem às costas de um vizinho, a rir de dor." }],
      fome: [{ texto: "Ao quarto dia, a porta da torre range e abre-se. Descem magros, de mãos no ar, e o último a descer é {servo}, que olha para o vale como quem conta o que deixou passar." }],
      saida: [{ texto: "Abrem a porta ao primeiro sinal. Saem de armas ao ombro, devagar, pela estrada do monte, e {servo} ainda se volta lá no alto para acenar." }],
    },
  },
  reviravoltas: [
    { id: "a_corda_cortada_com_cuidado",
      texto: "{sineira} conta o que viu antes de cair: a corda do sino não foi cortada à pressa. Foi cortada com cuidado, a um palmo do badalo, para se poder emendar num instante. Quem tomou a torre não quer o sino calado para sempre. Quer escolher quando toca.",
      gatilho: ["todos", ["etapa", "sineira"], ["consultou", "papel:sineira"], ["nenhum", ["etapa", "assalto"]]],
      efeitos: [{ tipo: "quem_e", papel: "sineira", linha: "viu cortar a corda do sino com o cuidado de quem a quer emendar" }] },
    { id: "os_de_dentro",
      texto: "De perto, vês quem está nas ameias, e não é só gente de fora: dois são rapazes do vale, de cara conhecida, e um deles é sobrinho de {voluntario}. {voluntario} vê-o ao mesmo tempo que tu, e fica muito {voluntario:calado|calada}.",
      gatilho: ["todos", ["etapa", "cerco"], ["descobriu", "lugar:torre"], ["nenhum", ["etapa", "assalto"]]],
      efeitos: [{ tipo: "quem_e", papel: "voluntario", linha: "tem um sobrinho nas ameias da torre, do lado de quem a tomou" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:voluntario"], ["nenhum", ["derrotou", "papel:voluntario"]]], ate: "assalto",
      texto: "{voluntario} não esperou por ti. Foi à torre de noite com os vizinhos das forquilhas, e de manhã trouxeram-{voluntario:no|na} em cima de uma porta arrancada. O sino continua calado." },
  ],
  abandono: { semAvancar: 4,
    texto: "O sino nunca mais tocou por mão do vale. Quando voltou a tocar, foi de madrugada, três badaladas, e quem as ouviu soube que não eram para avisar ninguém.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "O sino toca ao meio-dia, uma vez por cada dia que esteve calado, e o vale inteiro para para ouvir. {sineira} emenda a corda com um nó que diz que nunca mais se desata.",
    efeitos: [{ tipo: "aliado", papel: "sineira" }, { tipo: "relogio_regional", n: -1 }],
  },
});

/* A PISTA DOS PASSOS 3 E 4 QUE SE CHEIRA (meio; enredo 20, «Mais
   peculiar, mamãe»): uma rua inteira que dorme e não acorda. Não é
   castigo, é o poço — e quem entra nas casas de noite cheira as camas à
   procura de alguém. O servo pode ser bicho ou gente, e os textos servem
   os dois. A única pessoa acordada é quem procuram (o «Surpreenda»). */
const A_RUA_QUE_NAO_ACORDA = quest({
  id: "a_rua_que_nao_acorda",
  titulo: "A Rua Que Não Acorda",
  tipo: 1,
  enredo: 20,                                   // «Mais peculiar, mamãe»: de outra natureza do que parece
  quando: ["meio"],
  afim: ["misterio", "reinado"],
  papeis: {
    rua: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["mercado", "taverna", "templo"] },
    curandeira: { de: "elenco", do: "rua", rotulo: "quem vela os que dormem" },
    acordado: { de: "elenco", proximo: "curandeira", rotulo: "{acordado:o único que não bebeu|a única que não bebeu}" },
    servo: { de: "fio", papel: "tenente", aceita: ["gente", "fera"], alcunha: "o que entra nas casas a dormir", rotulo: "o que entra nas casas a dormir" },
  },
  mao: { tipo: "pista", contra: [3, 4], papel: "servo", tambem: ["consequencia"] },
  temperatura: "chama",
  gancho: "Há três manhãs que a rua de {rua} não acorda. Ninguém morreu: respiram, sonham, viram-se na cama — e não abrem os olhos, nem com água fria, nem com o choro dos filhos. {curandeira} já disse que é castigo, e já há quem queira queimar a casa de uma velha por isso. Só {acordado} anda de pé na rua, de porta em porta, a ver quem ainda respira, e jura que de noite há alguma coisa a entrar nas casas.",
  etapas: [
    { id: "vela", texto: "Ouvir {curandeira}", conclui: ["conversou", "papel:curandeira"] },
    { id: "causa", texto: "Saber o que fez dormir a rua",
      conclui: ["pelo_menos", 2, ["consultou", "papel:curandeira"], ["descobriu", "lugar:rua"], ["conversou", "papel:acordado"]] },
    { id: "despertar", texto: "Decidir quem acorda primeiro",
      conclui: ["algum", ["escolheu", "despertar", "criancas"], ["escolheu", "despertar", "testemunhas"], ["escolheu", "despertar", "esperar"]],
      ramos: ["criancas", "testemunhas", "esperar"] },
    { id: "noite", texto: "Ver com os teus olhos o que entra nas casas de noite",
      conclui: ["algum", ["derrotou", "papel:servo"], ["conheceu", "papel:servo"]],
      ramos: ["lamina", "vigia"] },
  ],
  escolhas: {
    despertar: { etapa: "despertar", opcoes: {
      criancas: {
        texto: "dar o pouco remédio que há às crianças da rua, primeiro",
        ganha: "As crianças acordam ao fim da tarde, todas, com fome e sem lembrança de nada, e a rua volta a ter barulho.",
        custa: "Não há remédio para mais. Os velhos dormem mais três noites, e dois já não acordam — e entre eles ia quem tinha visto o que entra nas casas.",
        efeitos: [{ tipo: "relogio_do_fio", n: 1 }, { tipo: "afeicao", papel: "curandeira", n: 1 }],
      },
      testemunhas: {
        texto: "dar o remédio primeiro a quem dormia nas casas por onde se entrou",
        ganha: "Acordam três, e os três viram a mesma coisa antes de adormecer: sabes agora por onde entra, o que procura, e para quem.",
        custa: "Escolhes quem acorda pelo que te pode dizer. A rua inteira fica a saber — e há mães que não te voltam a abrir a porta, com os filhos ainda a dormir lá dentro.",
        efeitos: [{ tipo: "relogio_do_fio", n: -1 }, { tipo: "afeicao", papel: "curandeira", n: -1 }],
      },
      esperar: {
        texto: "deixar a rua dormir mais uma noite, e esperar no escuro quem vem",
        ganha: "Quem entra nas casas vem outra vez, confiado, e desta vez encontra quem não dorme. Sabes o que é antes de saberes o que fez.",
        custa: "Mais uma noite de um sono que não é sono. De manhã há uma casa onde já ninguém respira, e {acordado} não te perdoa teres esperado.",
        efeitos: [{ tipo: "relogio_regional", n: 1 }, { tipo: "afeicao", papel: "acordado", n: -1 }],
      },
    } },
  },
  solucoes: {
    despertar: {
      criancas: [{ texto: "{curandeira} vai de casa em casa com uma colher e um frasco pequeno. Ao fim da tarde a rua enche-se de crianças estremunhadas a perguntar pelo pão. Os velhos continuam a dormir de mãos no peito." }],
      testemunhas: [{ texto: "Acordam devagar, com a boca amarga, e o primeiro a falar diz uma coisa só, antes de pedir água: «Andava à procura de alguém. Cheirava as camas, uma a uma.»" }],
      esperar: [{ texto: "Apagas a luz e esperas, sentado no escuro de uma casa onde toda a gente dorme. Ouves respirar à tua volta, devagar. E às tantas ouves uma porta." }],
    },
    noite: {
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:servo"],
          texto: "{servo} fica no chão de uma casa a dormir, com vida, e ninguém acorda com o barulho. Nem quando tudo acaba." },
        { id: "matou", texto: "{servo} cai entre duas camas, e quem nelas dorme continua a sonhar, sem saber que alguém caiu ao lado." },
      ],
      vigia: [{ texto: "Vês tudo do escuro: {servo} entra sem um ruído, vai de cama em cama e demora-se em cada cara, como quem procura uma. Não a encontra. Sai pela janela por onde entrou, e deixa a porta como estava." }],
    },
  },
  reviravoltas: [
    { id: "o_poco_da_rua",
      texto: "O sono não é castigo: está no poço da rua. Alguém lhe deitou de noite uma erva que não mata — só adormece —, na medida certa para três dias. Quem quer uma rua a dormir não quer mortos. Quer entrar nas casas sem pedir licença.",
      gatilho: ["todos", ["etapa", "vela"], ["descobriu", "lugar:rua"], ["nenhum", ["etapa", "noite"]]],
      efeitos: [{ tipo: "quem_e", papel: "acordado", linha: "não dorme numa rua que o poço pôs a dormir, com uma erva deitada lá de noite" }] },
    { id: "a_cama_que_cheiram",
      texto: "{acordado} diz o resto baixinho, a olhar para os lados: não bebeu do poço porque não dorme em casa. Dorme {acordado:escondido|escondida} num palheiro há uma semana, desde que lhe disseram que andavam a perguntar por {acordado:ele|ela} pelo nome. É a cama {acordado:dele|dela} que andam a cheirar.",
      gatilho: ["todos", ["conversou", "papel:acordado"], ["consultou", "papel:acordado"], ["nenhum", ["etapa", "noite"]]],
      efeitos: [{ tipo: "quem_e", papel: "acordado", linha: "é a pessoa que procuram na rua que dorme, e dorme num palheiro" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:acordado"], ["nenhum", ["derrotou", "papel:acordado"]]], ate: "noite",
      texto: "Acharam {acordado} no palheiro, de manhã, a dormir o mesmo sono da rua — mas sem respirar. Na noite seguinte a rua acordou toda, como se já não houvesse razão para dormir." },
  ],
  abandono: { semAvancar: 4,
    texto: "Ninguém esperou no escuro. Ao quarto dia a rua acordou sozinha, com a boca amarga e uma casa a menos: a de quem tinham vindo buscar.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "A rua acorda devagar, a esfregar os olhos, e só se lembra de ter sonhado toda o mesmo sonho. Mas agora sabes o que entra nas casas, e de quem anda à procura — e uma coisa que procura deixa sempre o rasto de quem a mandou.",
  },
});

/* A PISTA DE UM VILÃO QUE É BICHO (meio, 3 e 4; enredo 6, «Limpando a
   Zona», com a reviravolta de entender antes de lutar). Ninguém o vê: lê-
   -se o chão onde passou. O papel `vilao` aceita só a fera (o esqueleto
   põe esta quest só nos mundos em que o vilão é bicho), e nenhuma etapa
   pede o encontro: o rosto continua a ser do rosto. */
const AS_PEGADAS_NO_BARRO = quest({
  id: "as_pegadas_no_barro",
  titulo: "As Pegadas no Barro",
  tipo: 1,
  enredo: 6,                                    // «Limpando a Zona»: entender antes de lutar
  quando: ["meio"],
  afim: ["jornada", "arquipelago"],
  papeis: {
    vilao: { de: "fio", papel: "vilao", aceita: ["fera"], alcunha: "o que deixa pegadas do tamanho de uma porta", rotulo: "o que deixa pegadas do tamanho de uma porta" },
    cacadora: { de: "elenco", rotulo: "quem lê o chão" },
    barro: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["cemitério", "mercado", "arena"] },
    registo: { de: "lugar", vizinho: "barro", tipos: ["templo", "biblioteca", "guilda"] },
  },
  mao: { tipo: "pista", contra: [3, 4], papel: "vilao" },
  temperatura: "chama",
  pressupoe: [["nenhum", ["camada", "rosto"]]],
  gancho: "Passou pelo vale numa noite sem lua e não matou ninguém. Deixou só as pegadas, fundas no barro de {barro}, do tamanho de uma porta — e as galinhas mudas, e os cães metidos debaixo das camas. A vila quer ir atrás com forquilhas e tochas. {cacadora} diz que quem for atrás sem saber ler o chão não volta, e que o chão já disse muito a quem o soube ouvir.",
  etapas: [
    { id: "ouvir", texto: "Ouvir {cacadora}", conclui: ["conversou", "papel:cacadora"] },
    { id: "chao", texto: "Ler com {cacadora} o barro de {barro}",
      conclui: ["todos", ["esteve", "lugar:barro"], ["descobriu", "lugar:barro"]] },
    { id: "origem", texto: "Saber de onde veio {vilao}",
      conclui: ["algum", ["descobriu", "lugar:registo"], ["consultou", "papel:cacadora", 2]],
      ramos: ["registo", "cacadora"] },
    { id: "rasto", texto: "Decidir o que se faz com o que o chão disse",
      conclui: ["algum", ["escolheu", "rasto", "seguir"], ["escolheu", "rasto", "cortar"], ["escolheu", "rasto", "vender"]],
      ramos: ["seguir", "cortar", "vender"] },
  ],
  escolhas: {
    rasto: { etapa: "rasto", opcoes: {
      seguir: {
        texto: "seguir o rasto até onde {vilao} dorme de dia, e voltar sem acordar ninguém",
        ganha: "Ficas a saber onde dorme, a que hora, e para que lado vira a cabeça quando dorme. Ninguém mais na região sabe isto, e um dia vai valer uma vida.",
        custa: "Entras no chão onde dorme, e as coisas grandes sentem o cheiro de quem lá passou. Quando acordar, vai saber que alguém veio — e de onde veio esse alguém.",
        efeitos: [{ tipo: "avisa_vilao" }, { tipo: "relogio_do_fio", n: -1 }],
      },
      cortar: {
        texto: "queimar o mato do vale, e cortar-lhe o caminho das aldeias",
        ganha: "Arde uma semana, e o caminho que o trazia às aldeias fica cinza e pedra. Este inverno, as aldeias do vale dormem.",
        custa: "Uma coisa daquele tamanho que perde um caminho faz outro, e não se sabe por onde. E o vale que ardeu era o pasto de meia região, e o mato de onde {cacadora} vivia.",
        efeitos: [{ tipo: "relogio_regional", n: -1 }, { tipo: "relogio_do_fio", n: 1 }, { tipo: "afeicao", papel: "cacadora", n: -1 }],
      },
      vender: {
        texto: "deixar {cacadora} vender o que sabe a quem paga caçadores",
        ganha: "{cacadora} paga as dívidas de uma vida numa noite, e reparte contigo. Vêm caçadores de longe, com redes e lanças, e alguns sabem o que fazem.",
        custa: "Caçadores que não leram o chão vão atrás do que não conhecem, e nem todos voltam. E o que é caçado por muitos aprende depressa o cheiro de quem caça.",
        efeitos: [{ tipo: "moedas", n: 40 }, { tipo: "aliado", papel: "cacadora" }, { tipo: "relogio_do_fio", n: 1 }],
      },
    } },
  },
  solucoes: {
    origem: {
      registo: [{ texto: "No livro velho de {registo}, numa página que alguém tentou arrancar e não conseguiu, há um desenho a carvão de uma coisa pequena numa jaula, com a data de há vinte anos e uma nota em letra cuidada: «Cresce com a fome. Não lhe dar nome.»" }],
      cacadora: [{ texto: "{cacadora} acocora-se ao pé da pegada mais funda e passa-lhe os dedos por dentro. «Não é bicho do mato. Anda como quem andou preso muito tempo: o peso todo para um lado, sempre o mesmo.»" }],
    },
    rasto: {
      seguir: [{ texto: "Segues o rasto até ao meio da tarde, por pedra e por ribeira, até uma cova onde o barro está quente. Lá dentro respira uma coisa enorme, devagar. Voltas pelo mesmo caminho, a pisar as tuas próprias pegadas." }],
      cortar: [{ texto: "O mato arde durante seis dias. Quando a chuva o apaga, o vale é uma mancha preta onde o vento levanta cinza, e as pegadas já não têm por onde vir." }],
      vender: [{ texto: "{cacadora} conta as moedas à luz da candeia, duas vezes, e dá-te metade sem que lho peças. «Agora vêm os outros», diz. «Os que não sabem ler.»" }],
    },
  },
  reviravoltas: [
    { id: "a_corrente_arrastada",
      texto: "Ao lado das pegadas, quase apagado, há outro rasto: o de uma corrente partida, arrastada pelo barro. Isto já esteve preso, e quem o prendeu deixou-lhe o ferro ao pescoço. O rasto do ferro vai até ao fim do vale, sempre do mesmo lado.",
      gatilho: ["todos", ["etapa", "chao"], ["nenhum", ["etapa", "rasto"]]],
      efeitos: [{ tipo: "quem_e", papel: "cacadora", linha: "seguiu contigo o rasto de uma corrente partida: o que caçam já esteve preso" }] },
    { id: "o_filho_da_cacadora",
      texto: "{cacadora} diz, à segunda pergunta, o que não disse à primeira: o filho foi atrás disto há dois invernos, com uma lança e mais três, e só lhe voltou a lança. Não quer vender o que sabe. Quer que alguém lhe diga onde dorme, para ir lá {cacadora:sozinho|sozinha}.",
      gatilho: ["todos", ["etapa", "ouvir"], ["consultou", "papel:cacadora", 2], ["nenhum", ["etapa", "rasto"]]],
      efeitos: [{ tipo: "quem_e", papel: "cacadora", linha: "perdeu um filho atrás das pegadas do tamanho de uma porta, e só lhe voltou a lança" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:cacadora"], ["nenhum", ["derrotou", "papel:cacadora"]]], ate: "rasto",
      texto: "Acharam {cacadora} no fim do vale, com a lança do filho na mão, ao pé de uma cova de onde saía um ar quente. Foi {cacadora:sozinho|sozinha}, como queria. O chão já não tem quem o leia." },
  ],
  abandono: { semAvancar: 5,
    texto: "Ninguém leu o chão. A vila foi atrás com forquilhas e tochas, numa noite sem lua, e voltaram menos do que foram, a correr, sem saber dizer o que tinham visto.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "Já sabes de onde veio, o que comeu para crescer e para que lado pende quando anda. Ainda não lhe viste a cara. Mas quem deixa pegadas do tamanho de uma porta deixou-te também o que não sabia que deixava: a maneira de o ler.",
  },
});

/* A CONSEQUÊNCIA DO PASSO 3, DEBAIXO DO MESMO TETO (meio; enredo 1,
   «Qualquer porto velho em uma tempestade»): o temporal tranca na mesma
   estalagem os que fugiram da aldeia queimada — e quem a queimou, a secar-
   -se à mesma lareira. Dizê-lo à sala, calar até à justiça, ou trocá-lo
   pelo nome de quem pagou. O servo é gente: esconde-se entre gente. */
const A_ESTALAGEM_DO_TEMPORAL = quest({
  id: "a_estalagem_do_temporal",
  titulo: "A Estalagem do Temporal",
  tipo: 1,
  enredo: 1,                                    // «Qualquer porto velho em uma tempestade»
  quando: ["meio"],
  afim: ["misterio", "jornada"],
  papeis: {
    estalagem: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["taverna", "guilda", "mercado"] },
    estalajadeira: { de: "elenco", do: "estalagem", rotulo: "quem trancou a porta por causa do temporal" },
    servo: { de: "fio", papel: "tenente", alcunha: "quem chegou com os que fugiam do fogo", rotulo: "quem chegou com os que fugiam do fogo" },
    orfa: { de: "elenco", proximo: "estalajadeira", rotulo: "{orfa:o que perdeu tudo no fogo|a que perdeu tudo no fogo}" },
  },
  mao: { tipo: "consequencia", contra: [3], papel: "servo", tambem: ["tenente"] },
  temperatura: "chama",
  estabelece: [["camada", "mao"]],
  gancho: "O temporal fechou a estrada ao fim da tarde, e {estalagem} encheu-se de gente molhada até ao teto: os que fugiram da aldeia que ardeu ontem, com o que conseguiram trazer às costas. {estalajadeira} trancou a porta — ninguém entra, ninguém sai até a chuva parar. Ao canto, {orfa} não chora nem come. Olha para cada cara, uma a uma, porque viu quem pegou o fogo, e jura que está aqui dentro, debaixo deste teto, a secar-se à mesma lareira.",
  etapas: [
    { id: "porta", texto: "Ficar em {estalagem} até o temporal passar",
      conclui: ["todos", ["esteve", "lugar:estalagem"], ["conversou", "papel:estalajadeira"]] },
    { id: "caras", texto: "Saber quem, debaixo deste teto, pegou o fogo",
      conclui: ["pelo_menos", 2, ["consultou", "papel:orfa"], ["consultou", "papel:estalajadeira"], ["descobriu", "lugar:estalagem"]] },
    { id: "noite", texto: "Decidir o que se faz de {servo} esta noite",
      conclui: ["algum", ["derrotou", "papel:servo"], ["escolheu", "noite", "denunciar"], ["escolheu", "noite", "esperar"], ["escolheu", "noite", "trocar"]],
      ramos: ["lamina", "denunciar", "esperar", "trocar"] },
    { id: "manha", texto: "Abrir a porta quando o temporal passar",
      conclui: ["todos", ["conversou", "papel:estalajadeira", 2], ["nenhum", ["esta_em", "lugar:estalagem"]]] },
  ],
  escolhas: {
    noite: { etapa: "noite", opcoes: {
      denunciar: {
        texto: "dizer em voz alta, à frente de todos, quem pegou o fogo",
        ganha: "A verdade diz-se onde tem de ser dita, à frente de quem perdeu a casa. Ninguém vai poder dizer amanhã que não sabia.",
        custa: "Uma sala cheia de gente que perdeu tudo, de porta trancada, com uma lareira e um culpado. Não vais conseguir segurar ninguém — e o que {servo} sabia acaba ali, antes de amanhecer.",
        efeitos: [{ tipo: "afeicao", papel: "orfa", n: 1 }, { tipo: "afeicao", papel: "estalajadeira", n: -1 }, { tipo: "relogio_regional", n: 1 }],
      },
      esperar: {
        texto: "calar até o temporal passar, e levar {servo} à justiça da cidade",
        ganha: "{servo} chega vivo à justiça, e com {servo:ele|ela} chega tudo o que sabe: quem paga, quem manda, onde fica a próxima aldeia.",
        custa: "Uma noite inteira debaixo do mesmo teto que quem pegou o fogo, com {orfa} a ver-te calar. De manhã {orfa} já não te olha como olhava — e quem cala o que sabe é o próximo a ter de explicar porquê.",
        efeitos: [{ tipo: "afeicao", papel: "orfa", n: -1 }, { tipo: "relogio_do_fio", n: -1 }, { tipo: "situacao", papel: "servo", situacao: "cativa" }],
      },
      trocar: {
        texto: "deixar {servo} sair no fim do temporal, a troco do nome de quem mandou",
        ganha: "Ficas com o nome que ninguém tem: o da mão que pagou o fogo. Vale mais do que a mão que o pegou.",
        custa: "Quem pegou fogo a uma aldeia sai pela porta com a chuva, livre, e vai pegar outro. E {orfa} vê-{servo:o|a} sair, e vê-te abrir-lhe a porta.",
        efeitos: [{ tipo: "inimigo", papel: "orfa" }, { tipo: "relogio_do_fio", n: -1 }],
      },
    } },
  },
  solucoes: {
    noite: {
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:servo"],
          texto: "{servo} fica no chão junto à lareira, com vida, e a sala inteira levanta-se. És tu que te pões à frente, e ninguém passa." },
        { id: "matou", texto: "{servo} cai junto à lareira, e a sala fica tão calada que se ouve a chuva no telhado. {orfa} aproxima-se, olha muito tempo, e volta para o canto." },
      ],
      denunciar: [{ texto: "Dizes em voz alta quem foi. Durante um momento, ninguém se mexe. Depois mexem-se todos ao mesmo tempo, e já não há nada que possas fazer senão olhar para outro lado até a sala voltar a ficar quieta." }],
      esperar: [{ texto: "Não dizes nada. Ficas de olhos abertos a noite inteira, de costas para a parede, e do outro lado da lareira {servo} também não dorme. Os dois sabem." }],
      trocar: [{ texto: "No fim da noite, junto à porta, {servo} diz-te um nome ao ouvido, e mais nada. A chuva parou. Abres-lhe a porta, e {orfa} vê." }],
    },
  },
  reviravoltas: [
    { id: "o_melhor_quarto",
      texto: "{estalajadeira} confessa, de pano na mão: {servo} já cá tinha estado há uma semana, a perguntar pelo caminho da aldeia e por quem lá guardava as colheitas. Pagou bem. {estalajadeira} deu-lhe o caminho e o melhor quarto — e não se perdoa.",
      gatilho: ["todos", ["etapa", "porta"], ["consultou", "papel:estalajadeira"], ["nenhum", ["etapa", "noite"]]],
      efeitos: [{ tipo: "quem_e", papel: "estalajadeira", linha: "deu o caminho da aldeia a quem a havia de queimar, a troco de moedas" }] },
    { id: "as_maos_embrulhadas",
      texto: "Ao pé da lareira, uma das caras molhadas tem as costas das mãos em carne viva, embrulhadas em pano limpo demais para quem fugiu de um fogo. Quem fugiu do fogo queimou as palmas a tirar coisas lá de dentro. Quem o pegou queimou as costas das mãos ao ir-se embora.",
      gatilho: ["todos", ["etapa", "porta"], ["descobriu", "lugar:estalagem"], ["nenhum", ["etapa", "noite"]]],
      efeitos: [{ tipo: "quem_e", papel: "servo", linha: "tem as costas das mãos queimadas, de se ir embora de um fogo" }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:orfa"], ["nenhum", ["derrotou", "papel:orfa"]]], ate: "noite",
      texto: "Acharam {orfa} de madrugada ao fundo da escada, com as mãos vazias. Toda a gente dormia. Quem via as caras uma a uma já não vê nenhuma, e debaixo deste teto há agora duas coisas a pôr na conta de alguém." },
  ],
  abandono: { semAvancar: 2,
    texto: "O temporal passou sem que dissesses nada. Abriram a porta ao nascer do sol, e quem tinha pegado o fogo saiu entre os que fugiam dele, molhado como eles, a caminho da aldeia seguinte.",
    efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "O temporal passa. A estrada abre-se, enlameada, e os que fugiram do fogo seguem por ela com o que trouxeram às costas. Já ninguém olha para as caras uma a uma. A aldeia queimada deixou de ser desgraça: é obra de alguém, e esse alguém já tem cara.",
    efeitos: [{ tipo: "afeicao", papel: "orfa", n: 1 }],
  },
});

/* A PISTA DOS PASSOS 3 E 4 QUE NÃO DÁ PARA AS DUAS (meio; enredo 23,
   «Onças da Prevenção», com as duas reviravoltas: há dois perigos ao
   mesmo tempo e não dá para os dois — e a pista era para distrair). Duas
   fogueiras à mesma hora: o trigo do inverno, ou quem dorme no hospício.
   Ou apanhar quem as acende antes do anoitecer. */
const AS_DUAS_FOGUEIRAS = quest({
  id: "as_duas_fogueiras",
  titulo: "As Duas Fogueiras",
  tipo: 1,
  enredo: 23,                                   // «Onças da Prevenção»: dois perigos, e não dá para os dois
  quando: ["meio"],
  afim: ["reinado", "arquipelago"],
  papeis: {
    informante: { de: "elenco", rotulo: "quem te trouxe o aviso" },
    servo: { de: "fio", papel: "tenente", alcunha: "quem acende as duas fogueiras", rotulo: "quem acende as duas fogueiras" },
    celeiro: { de: "lugar", e: "um sítio da cidade do ato", tipos: ["mercado", "guilda", "forja"] },
    hospicio: { de: "lugar", vizinho: "celeiro", tipos: ["templo", "casa de banhos", "taverna"] },
  },
  mao: { tipo: "pista", contra: [3, 4], papel: "servo" },
  temperatura: "fogueira",
  gancho: "{informante} chegou a correr, sem fôlego: ouviu numa taberna, atrás de uma parede fina, {servo} combinar duas fogueiras para esta noite, à mesma hora — uma em {celeiro}, onde está o trigo do inverno da cidade inteira, e outra em {hospicio}, onde dormem trinta que não têm mais onde dormir. A cidade leva meia hora de uma ponta à outra. Não há guarda para as duas. Há tu.",
  etapas: [
    { id: "aviso", texto: "Ouvir {informante}", conclui: ["conversou", "papel:informante"] },
    { id: "provas", texto: "Saber o que se puder antes do anoitecer",
      conclui: ["pelo_menos", 2, ["consultou", "papel:informante"], ["descobriu", "lugar:celeiro"], ["descobriu", "lugar:hospicio"], ["conversou", "papel:servo"]] },
    { id: "noite", texto: "Escolher a que fogueira vais",
      conclui: ["algum", ["escolheu", "fogo", "celeiro"], ["escolheu", "fogo", "hospicio"], ["derrotou", "papel:servo"]],
      ramos: ["celeiro", "hospicio", "lamina"] },
    { id: "cinza", texto: "Ver de manhã o que ficou de {hospicio}",
      conclui: ["todos", ["esteve", "lugar:hospicio"], ["conversou", "papel:informante", 2]] },
  ],
  escolhas: {
    fogo: { etapa: "noite", opcoes: {
      celeiro: {
        texto: "correr para {celeiro}, e salvar o trigo do inverno",
        ganha: "O trigo fica de pé, saca a saca: a cidade inteira vai comer este inverno, e ninguém vai ter de vender um filho por um pão.",
        custa: "Do outro lado da cidade, {hospicio} arde sem ninguém. Os que lá dormem saem pela janela, como podem, e há quem não saia. Vais ouvir dizer a vida inteira que escolheste o trigo.",
        efeitos: [{ tipo: "relogio_regional", n: -1 }, { tipo: "afeicao", papel: "informante", n: -1 }],
      },
      hospicio: {
        texto: "correr para {hospicio}, e tirar de lá quem dorme",
        ganha: "Tiras os trinta de lá, um a um, pela fumaça, e nenhum fica para trás. Há uma criança que não te larga a mão até de manhã.",
        custa: "{celeiro} arde até às pedras, com o trigo do inverno dentro. A cidade vai ter fome antes da primavera, e a fome escolhe sempre os mesmos.",
        efeitos: [{ tipo: "relogio_regional", n: 1 }, { tipo: "afeicao", papel: "informante", n: 1 }],
      },
    } },
  },
  solucoes: {
    noite: {
      celeiro: [{ texto: "Chegas a {celeiro} com as primeiras chamas a lamber a porta. Fazes corrente com quem aparece, baldes de mão em mão, até o fogo desistir. Ao longe, por cima dos telhados, vês a outra luz a crescer, e não te podes mexer." }],
      hospicio: [{ texto: "Entras em {hospicio} pela fumaça e sais com o primeiro ao colo, e voltas, e voltas. Quando o último está cá fora, a tossir na rua, o céu do outro lado da cidade está laranja, e cheira a pão queimado até de manhã." }],
      lamina: [
        { id: "poupou", quando: ["poupou", "papel:servo"],
          texto: "{servo} fica no chão de uma taberna, com vida, e com a pederneira ainda no bolso. Esta noite não arde nada." },
        { id: "matou", texto: "{servo} cai antes do anoitecer, e com a mão cai a pederneira. Esta noite não arde nada — e ninguém fica a saber para que eram, ao certo, as duas fogueiras." },
      ],
    },
  },
  reviravoltas: [
    { id: "o_recado_mandado",
      texto: "{informante} admite, à segunda pergunta, que não ouviu atrás de parede nenhuma: {informante:foi chamado|foi chamada} e disseram-lhe para te contar. Quem acende as fogueiras quer que saibas — e quer ver para que lado corres.",
      gatilho: ["todos", ["etapa", "aviso"], ["consultou", "papel:informante"], ["nenhum", ["etapa", "noite"]]],
      efeitos: [{ tipo: "quem_e", papel: "informante", linha: "foi mandado contar-te das duas fogueiras, para se ver para que lado corrias" }, { tipo: "avisa_vilao" }] },
    { id: "a_terceira_porta",
      texto: "Enquanto a cidade corria para as fogueiras, ninguém guardava a cadeia. De manhã, a cela de quem ia ser julgado esta semana estava aberta, e vazia. As duas fogueiras eram para os olhos de toda a gente. O que se queria estava noutro lado.",
      gatilho: ["todos", ["etapa", "noite"], ["nenhum", ["derrotou", "papel:servo"]], ["nenhum", ["etapa", "cinza"]]],
      efeitos: [{ tipo: "relogio_do_fio", n: 1 }] },
  ],
  falha: [
    { quando: ["todos", ["morto", "papel:informante"], ["nenhum", ["derrotou", "papel:informante"]]], ate: "noite",
      texto: "Acharam {informante} ao fim da tarde, num beco, com a boca cheia de cinza. Quem acende as fogueiras soube que o recado tinha chegado, e já não precisava de quem o levou." },
  ],
  abandono: { semAvancar: 2,
    texto: "Não foste a nenhuma. As duas arderam à mesma hora, e de manhã a cidade não sabia se havia de chorar por quem dormia ou pelo trigo, e chorou pelos dois.",
    efeitos: [{ tipo: "relogio_regional", n: 1 }, { tipo: "relogio_do_fio", n: 1 }] },
  fecho: {
    texto: "De manhã a cidade cheira a fumo. O que salvaste está salvo, e o que ardeu já não volta. Mas agora sabes como pensa quem acende fogueiras aos pares: escolhe por ti o que vais ter de perder — e foi isso que te mostrou de si.",
  },
});

/* A CULPA DE QUEM SOBREVIVEU (tipo 2): há onze anos, alguém fez a vigia
   da noite no lugar de quem anda com o herói, que tinha febre — e morreu
   nela. Desde então vão moedas sem bilhete para a casa dele. Agora o filho
   alistou-se para o mesmo posto. Contar, velar de longe, ou trocar a vigia
   outra vez (a história a repetir-se ao contrário). Do melhor (a caixa de
   lata devolvida, e uma vigia feita a dois) ao pior (a mesma noite, e
   ninguém vem render). A ponte: o posto é o caminho por onde ele entra. */
const A_VIGIA_TROCADA = quest({
  id: "a_vigia_trocada",
  titulo: "A Vigia Trocada",
  tipo: 2,
  quando: ["cedo", "meio", "fim"],
  afim: [],
  papeis: {
    quem: { de: "grupo", ou: "elo", rotulo: "quem anda contigo" },
    jovem: { de: "elenco", cidade: "uma cidade dos atos 2 ou 3", rotulo: "{jovem:o filho de quem fez a vigia trocada|a filha de quem fez a vigia trocada}" },
    viuva: { de: "elenco", proximo: "jovem", rotulo: "quem recebe moedas sem saber de quem" },
    posto: { de: "lugar", vizinho: "jovem", tipos: ["quartel", "cadeia", "docas"] },
  },
  mao: null,
  ponte: "o posto onde {jovem} vai servir guarda o caminho por onde a mão que tudo estraga quer entrar, numa cidade por onde um passo do vilão vai passar",
  temperatura: "chama",
  gancho: "{quem} manda moedas para uma casa onde nunca entrou: todos os meses, embrulhadas em pano, sem bilhete, há onze anos. Ontem, numa estalagem, ouviu dizer que {jovem:o rapaz dessa casa|a rapariga dessa casa} se alistou para a guarda de um posto de fronteira. {quem} ficou {quem:branco|branca}, pagou a conta duas vezes sem dar por isso, e de noite não dormiu: ficou {quem:sentado|sentada} à porta, de lâmina no colo, como quem faz uma vigia que não é sua.",
  etapas: [
    { id: "sinal", texto: "Perguntar a {quem} de quem é a vigia que faz à porta",
      espera: 2, acende: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 1]],
      conclui: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 2], ["conversou", "papel:quem", 2]] },
    { id: "conselho", texto: "Dizer a {quem} o que se deve a quem morreu no nosso lugar",
      conclui: ["algum", ["escolheu", "conselho", "pagar"], ["escolheu", "conselho", "viver"]],
      ramos: ["pagar", "viver"] },
    { id: "posto", texto: "Ir com {quem} a {posto}, onde {jovem} vai servir",
      ancora: { tipo: 1, concluidas: 1 },
      conclui: ["todos", ["esteve", "lugar:posto"], ["acompanha", "papel:quem"], ["conversou", "papel:jovem"]] },
    { id: "vigia", texto: "Estar ao lado de {quem} na noite da primeira vigia de {jovem}",
      conclui: ["algum", ["escolheu", "vigia", "contar"], ["escolheu", "vigia", "calar"], ["escolheu", "vigia", "trocar"]],
      ramos: ["contar", "calar", "trocar"] },
  ],
  escolhas: {
    conselho: { etapa: "conselho", opcoes: {
      pagar: {
        texto: "dizer a {quem} que uma vida dada se paga com a mesma moeda",
        ganha: "{quem} respira: há uma dívida, e as dívidas têm fim. Pela primeira vez em onze anos, a culpa tem a forma de uma coisa que se pode fazer.",
        custa: "Ensinas-lhe que a única maneira de pagar uma vida é pôr outra no lugar dela. E {quem} sabe muito bem qual.",
        efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }],
      },
      viver: {
        texto: "dizer a {quem} que quem morre no nosso lugar nos deixa uma vida para viver, e não para devolver",
        ganha: "{quem} ouve de ti o que nunca se atreveu a dizer a si {quem:mesmo|mesma}: que estar vivo não é um roubo.",
        custa: "Pões em causa onze anos de moedas e de noites sem dormir. Se {quem} não acreditar, vai ouvir nisto que a dívida não conta — e a culpa não sabe ficar sem nada para fazer.",
      },
    } },
    vigia: { etapa: "vigia", opcoes: {
      contar: {
        texto: "ficar ao lado de {quem} enquanto conta a {jovem} quem morreu no lugar de quem",
        ganha: "{jovem} fica a saber de onde vinham as moedas, e porque é que aquela vigia não acabou. Quem sabe porque se morreu num posto pensa duas vezes antes de lá ficar.",
        custa: "{jovem} pode ouvir que morreu alguém seu por causa de quem tem à frente. E pode não querer moedas, nem desculpas, nem voltar a ver {quem}.",
      },
      calar: {
        texto: "deixar {quem} ficar por perto, de guarda, sem dizer quem é",
        ganha: "{jovem} faz a primeira vigia sem saber que há alguém na sombra a fazê-la também, e {quem} vela pela vida que lhe pesa sem a pôr em causa.",
        custa: "Uma vigia a dois de que só um sabe. Se alguma coisa vier pela estrada esta noite, {jovem} não sabe que tem ajuda — e {quem} não tem o direito de lha oferecer.",
      },
      trocar: {
        texto: "deixar {quem} fazer a vigia no lugar de {jovem}, como alguém um dia a fez por {quem:ele|ela}",
        ganha: "{jovem} dorme esta noite, e a dívida de onze anos paga-se com a mesma moeda: uma vigia por outra.",
        custa: "É a mesma noite outra vez, ao contrário — e o posto é o caminho por onde alguma coisa vai entrar. Sem a confiança inteira de {quem} em ti, ninguém {quem:o|a} vai render a meio da noite.",
      },
    } },
  },
  solucoes: {
    conselho: {
      pagar: [{ texto: "{quem} acena devagar, e nessa noite dorme pela primeira vez em muito tempo — de lâmina ao lado da almofada, como quem já sabe o que vai fazer." }],
      viver: [{ texto: "{quem} não responde. Fica muito tempo a olhar para as próprias mãos, como se fossem de outra pessoa, e de manhã é {quem} quem pergunta quantos dias faltam para o posto." }],
    },
    vigia: {
      contar: [{ texto: "{quem} começa pela febre e acaba nos gritos. {jovem} não interrompe uma única vez. Tu ficas ao lado, perto o bastante para se tocarem os ombros." }],
      calar: [{ texto: "{quem} senta-se na sombra do muro, de lâmina no colo, a trinta passos de {jovem}, e não tira os olhos da estrada até amanhecer." }],
      trocar: [{ texto: "{quem} diz a {jovem} que vá dormir, que faz por {jovem:ele|ela}. {jovem} hesita, e depois vai. É exatamente a mesma frase de há onze anos." }],
    },
  },
  reviravoltas: [
    { id: "a_febre",
      texto: "{quem} conta por fim. Há onze anos, num posto de fronteira, era a sua vez de fazer a vigia da noite, e estava a arder em febre. Um companheiro de armas, com mulher e uma criança de dois anos, disse-lhe que fosse dormir, que fazia por {quem:ele|ela}. Nessa noite entraram pelo posto. {quem} acordou com os gritos, e chegou tarde. Desde então manda moedas a uma casa onde nunca teve coragem de bater.",
      gatilho: ["todos", ["etapa", "sinal"], ["conversou", "papel:quem", 3], ["nenhum", ["etapa", "vigia"]]],
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "faz há onze anos as vigias de quem morreu na sua, numa noite de febre" }] },
    { id: "a_caixa_de_lata",
      texto: "Em casa de {jovem}, {viuva} mostra-te de mãos a tremer uma caixa de lata com onze anos de moedas, todas por gastar. Nunca soube de quem vinham, e nunca lhes tocou: achava que eram de quem lhe matou o marido, a pagar a consciência. {jovem} alistou-se no mesmo posto para descobrir quem foi.",
      gatilho: ["todos", ["etapa", "posto"], ["consultou", "papel:viuva"], ["nenhum", ["etapa", "vigia"]]],
      efeitos: [{ tipo: "quem_e", papel: "viuva", linha: "guardou onze anos de moedas sem lhes tocar, a julgar que vinham de quem lhe matou o marido" }] },
  ],
  desfechos: [
    { id: "a_vigia_a_dois",
      quando: ["todos", ["escolheu", "vigia", "contar"], ["escolheu", "conselho", "viver"], ["afeicao", "papel:quem", 3], ["consultou", "papel:viuva"]],
      texto: "{quem} conta tudo à porta do posto, com {viuva} ao lado. {jovem} ouve até ao fim, vai buscar a caixa de lata e põe-na nas mãos de {quem}. «Não quero isto. Quero que me ensines a fazer uma vigia como ele fazia.» Fazem-na os dois nessa noite, e quando o sol nasce {quem} está a rir de alguma coisa que {jovem} disse.",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "jovem" }] },
    { id: "o_aceno",
      quando: ["escolheu", "vigia", "contar"],
      texto: "{quem} conta tudo. {jovem} ouve, não diz nada, e entra no posto para fazer a vigia {jovem:sozinho|sozinha}. Na manhã seguinte ainda lá está, de pé, e quando {quem} passa, acena uma vez. Só uma.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "contou a quem ficou sem pai porque é que aquela vigia não acabou, e recebeu um aceno" }] },
    { id: "o_estranho_que_madrugou",
      quando: ["escolheu", "vigia", "calar"],
      texto: "{quem} fica na sombra a noite inteira, de lâmina no colo. Nada vem pela estrada. De manhã, {jovem} passa por {quem:ele|ela} e cumprimenta-{quem:o|a} como a um estranho que madrugou. {quem} cumprimenta de volta. Nunca vai dizer mais do que isto.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "vela de longe por quem ficou sem pai na sua vigia, como um estranho que madrugou" }] },
    { id: "a_vigia_paga",
      quando: ["todos", ["escolheu", "vigia", "trocar"], ["afeicao", "papel:quem", 3]],
      texto: "{quem} faz a vigia de {jovem}, e alguma coisa vem pela estrada, como há onze anos. Desta vez, a meio da noite, estás tu ao lado. Chegam até ao portão, e não passam. De manhã {quem} limpa a lâmina e diz-te só: «Estamos quites. Ele e eu.» E dorme até ao meio-dia, como não dormia há onze anos.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "pagou a vigia de um morto com outra vigia, e dormiu" }] },
    { id: "as_moedas_sem_bilhete", padrao: true,
      texto: "{quem} nunca vai ao posto. As moedas continuam a ir todos os meses, embrulhadas em pano, para uma caixa de lata onde ninguém lhes toca.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "quem_e", papel: "quem", linha: "continua a mandar moedas a uma casa onde nunca bateu" }] },
    { id: "sem_jovem", cedo: true,
      quando: ["todos", ["morto", "papel:jovem"], ["nenhum", ["etapa", "vigia"]]],
      texto: "{jovem} morreu antes da primeira vigia. {quem} vai ao enterro e fica ao fundo, e no fim deixa em cima da campa um pano dobrado com moedas dentro. É a última vez.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "deixou as últimas moedas na campa de quem ficou sem pai na sua vigia" }] },
    { id: "a_vigia_sem_dono", cedo: true,
      quando: ["morto", "papel:quem"],
      texto: "{quem} morreu sem bater àquela porta. Levas tu o último pano com moedas, e decides tu o que dizes a quem o abrir." },
    { id: "a_mesma_noite",
      quando: ["todos", ["escolheu", "vigia", "trocar"], ["nenhum", ["afeicao", "papel:quem", 3]]],
      texto: "{quem} faz a vigia de {jovem}, {quem:sozinho|sozinha}, como alguém a fez um dia por {quem:ele|ela}. Alguma coisa vem pela estrada a meio da noite, e ninguém vem render. De manhã, {jovem} acorda num posto em silêncio e encontra à porta quem fez a vigia no seu lugar, de lâmina na mão — e percebe, sem que ninguém lho diga, que a história se repetiu inteira.",
      efeitos: [{ tipo: "morte", papel: "quem" }] },
  ],
  abandono: { semAvancar: 15, desfecho: "as_moedas_sem_bilhete" },
});

/* A TRAIÇÃO DE UM MESTRE (tipo 2): a cicatriz do último dia de escola
   não foi acidente — o mestre corta o braço da espada ao melhor aluno de
   cada década, para nunca ser superado. E vai dar a prova final a outro.
   Avisar o aprendiz, acusar diante da guilda, ou desafiar o mestre no
   lugar dele. Do melhor (a lâmina do mestre partida, e quatro braços
   erguidos ao fundo da sala) ao pior (o golpe guardado, e ninguém grita
   de que lado vem). A ponte: o mestre ensina as lâminas dele. */
const A_ULTIMA_LICAO = quest({
  id: "a_ultima_licao",
  titulo: "A Última Lição",
  tipo: 2,
  quando: ["cedo", "meio", "fim"],
  afim: [],
  papeis: {
    quem: { de: "grupo", ou: "elo", rotulo: "quem anda contigo" },
    mestre: { de: "elenco", cidade: "uma cidade dos atos 2 ou 3", rotulo: "quem ensinou {quem} a lutar" },
    aprendiz: { de: "elenco", proximo: "mestre", rotulo: "{aprendiz:o aprendiz novo|a aprendiz nova}" },
    sala: { de: "lugar", vizinho: "mestre", tipos: ["arena", "guilda", "quartel"] },
  },
  mao: null,
  ponte: "{mestre} ensina hoje as lâminas a quem serve a mão que tudo estraga, numa cidade por onde um passo do vilão vai passar",
  temperatura: "chama",
  pressupoe: [["convivencia", "papel:quem", 3], ["afeicao", "papel:quem", 1]],
  gancho: "{quem} tem uma cicatriz funda no antebraço da espada, e sempre disse que foi um acidente no último dia de escola. Ontem, numa feira, ouviu que {mestre}, quem {quem:o|a} ensinou a lutar, vai dar a prova final a {aprendiz:um aprendiz novo|uma aprendiz nova} daqui a uma semana. {quem} não disse nada. Mas de noite tirou a lâmina da bainha e ficou muito tempo a olhar para o antebraço, a abrir e a fechar a mão, como quem conta o que ainda lá está.",
  etapas: [
    { id: "sinal", texto: "Perguntar a {quem} como foi, de verdade, o último dia de escola",
      espera: 2, acende: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 1]],
      conclui: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 2], ["conversou", "papel:quem", 2]] },
    { id: "sala", texto: "Ir com {quem} a {sala}, e ver {mestre} a ensinar",
      ancora: { tipo: 1, concluidas: 1 },
      conclui: ["todos", ["esteve", "lugar:sala"], ["acompanha", "papel:quem"], ["conheceu", "papel:mestre"]] },
    { id: "conselho", texto: "Dizer a {quem} o que se deve a quem nos ensinou",
      conclui: ["algum", ["escolheu", "conselho", "perdoar"], ["escolheu", "conselho", "cobrar"]],
      ramos: ["perdoar", "cobrar"] },
    { id: "prova", texto: "Estar ao lado de {quem} no dia da prova de {aprendiz}",
      conclui: ["algum", ["escolheu", "prova", "avisar"], ["escolheu", "prova", "denunciar"], ["escolheu", "prova", "desafiar"]],
      ramos: ["avisar", "denunciar", "desafiar"] },
  ],
  escolhas: {
    conselho: { etapa: "conselho", opcoes: {
      perdoar: {
        texto: "dizer a {quem} que o que um mestre nos deu pesa mais do que o que nos tirou",
        ganha: "{quem} solta o ar que prendia há anos: pode guardar o mestre que teve sem guardar a ferida.",
        custa: "Ajudas {quem} a perdoar quem pode estar a fazer o mesmo, esta semana, a outra pessoa.",
        efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }],
      },
      cobrar: {
        texto: "dizer a {quem} que quem ensina a lutar e aleija de propósito deve contas",
        ganha: "{quem} ouve, pela primeira vez, alguém dizer em voz alta que não foi acidente.",
        custa: "Acordas uma raiva com anos. E a raiva de quem foi ensinado por {mestre} luta como {mestre} lhe ensinou — que é dizer, pior do que {mestre}.",
      },
    } },
    prova: { etapa: "prova", opcoes: {
      avisar: {
        texto: "ficar ao lado de {quem} enquanto avisa {aprendiz}, longe de {mestre}",
        ganha: "{aprendiz} fica a saber o que espera no fim da prova, e quem sabe o golpe que vem tem o braço onde o golpe não chega.",
        custa: "{aprendiz} admira {mestre} como {quem} admirava. Pode não acreditar — e contar a {mestre} quem veio avisar.",
      },
      denunciar: {
        texto: "levar {quem} a contar à guilda de armas, à frente de todos, o que {mestre} fez",
        ganha: "A verdade diz-se onde um mestre não a pode desmentir sozinho, e a prova de {aprendiz} faz-se diante de testemunhas.",
        custa: "É a palavra de {quem} contra a de um mestre com trinta anos de alunos. Se mais ninguém falar, {quem} sai da guilda com o nome de quem inveja quem o ensinou.",
      },
      desafiar: {
        texto: "deixar {quem} desafiar {mestre} para a prova, no lugar de {aprendiz}",
        ganha: "Ninguém mais leva a cicatriz: é {quem} que entra na sala de lâmina na mão, e {aprendiz} fica de fora a ver.",
        custa: "{mestre} ensinou-lhe tudo o que sabe — menos o golpe que guarda para o fim. Sem a confiança inteira de {quem} ao teu lado, não há quem lhe grite a tempo de que lado vem.",
      },
    } },
  },
  solucoes: {
    conselho: {
      perdoar: [{ texto: "{quem} acena, e passa o polegar pela cicatriz uma vez, devagar, como quem se despede de uma coisa." }],
      cobrar: [{ texto: "{quem} não diz nada. Mas nessa noite afia a lâmina até de madrugada, e o som chega a todos os quartos da estalagem." }],
    },
    prova: {
      avisar: [{ texto: "{quem} encontra {aprendiz} na fonte, de manhã cedo, e mostra-lhe o antebraço antes de dizer uma palavra. Depois mostra-lhe onde pôr a guarda." }],
      denunciar: [{ texto: "{quem} levanta-se no meio da guilda reunida e arregaça a manga. A sala cala-se. {mestre}, sentado na primeira fila, não se vira." }],
      desafiar: [{ texto: "{quem} entra na sala antes de {aprendiz} e pousa a lâmina no chão, à frente de {mestre}, como manda a regra antiga. {mestre} olha para a cicatriz, e sorri." }],
    },
  },
  reviravoltas: [
    { id: "o_golpe_por_baixo",
      texto: "{quem} conta, por fim, a tarde inteira. No último dia de escola, na prova final, {mestre} fez um golpe que nunca lhe tinha ensinado, por baixo da guarda, e cortou-lhe o tendão do braço da espada. Disse que foi a prova a correr mal. {quem} levou um ano a voltar a pegar numa lâmina, e nunca mais foi o melhor aluno de ninguém — que era, percebe agora, o que {mestre} queria.",
      gatilho: ["todos", ["etapa", "sinal"], ["conversou", "papel:quem", 3], ["nenhum", ["etapa", "prova"]]],
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "leva no braço o golpe que o mestre guardava para o melhor aluno" }] },
    { id: "as_cinco_cruzes",
      texto: "Nas paredes da sala de {mestre} estão gravados os nomes dos alunos de trinta anos. Ao lado dos melhores de cada década há uma cruz pequena. {aprendiz} diz-te, com orgulho, que é a marca de quem acabou a prova. Contas as cruzes: cinco. E nenhum dos cinco luta hoje.",
      gatilho: ["todos", ["etapa", "sala"], ["descobriu", "lugar:sala"], ["nenhum", ["etapa", "prova"]]],
      efeitos: [{ tipo: "quem_e", papel: "mestre", linha: "aleijou na prova final o melhor aluno de cada década, cinco em trinta anos" }] },
  ],
  desfechos: [
    { id: "a_lamina_partida",
      quando: ["todos", ["escolheu", "prova", "denunciar"], ["escolheu", "conselho", "cobrar"], ["afeicao", "papel:quem", 3], ["descobriu", "lugar:sala"]],
      texto: "{quem} conta à guilda, à frente de todos, e conta as cinco cruzes da parede. Ao fundo da sala, um a um, levantam o braço da espada quatro velhos alunos de {mestre}, todos com a mesma cicatriz. A guilda parte a lâmina de {mestre} sobre o joelho. {aprendiz} faz a prova nessa tarde, com {quem} a ensinar-lhe a guarda baixa.",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "aprendiz" }] },
    { id: "a_guarda_baixa",
      quando: ["escolheu", "prova", "avisar"],
      texto: "{aprendiz} ouve, e faz a prova na mesma — mas de guarda baixa, como {quem} lhe mostrou. Quando o golpe vem, por baixo, encontra aço. {mestre} olha para {quem}, do outro lado da sala, e percebe. Não diz nada. Nunca mais dá uma prova final.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "avisou o aluno novo do golpe que levou, e o golpe encontrou aço" }] },
    { id: "a_palavra_contra_o_mestre",
      quando: ["escolheu", "prova", "denunciar"],
      texto: "{quem} conta à guilda, e mais ninguém se levanta. {mestre} sorri com tristeza e diz que todos os mestres têm um aluno que não lhes perdoa terem sido melhores. {quem} sai da sala com o nome sujo — mas à porta {aprendiz} pergunta-lhe, baixinho, onde é que deve pôr a guarda.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "acusou o seu mestre diante da guilda, e só o aluno novo acreditou" }] },
    { id: "o_desafio_ganho",
      quando: ["todos", ["escolheu", "prova", "desafiar"], ["afeicao", "papel:quem", 3]],
      texto: "{quem} entra na sala no lugar de {aprendiz}. A luta é longa e feia. Quando o golpe guardado vem, por baixo da guarda, gritas tu de onde vem — e {quem} já lá está. {mestre} fica no chão de pedra com o braço da espada aberto no mesmo sítio. {quem} não lhe acaba a lição.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "inimigo", papel: "mestre" }] },
    { id: "a_cicatriz_calada", padrao: true,
      texto: "{quem} nunca volta a {sala}. A prova faz-se no dia marcado, e alguém sai de lá com o braço ao peito. {quem} ouve contar numa estalagem, e esfrega o antebraço sem dar por isso.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "quem_e", papel: "quem", linha: "soube que o mestre aleijou outro aluno, e não foi lá" }] },
    { id: "sem_mestre", cedo: true,
      quando: ["todos", ["morto", "papel:mestre"], ["nenhum", ["etapa", "prova"]]],
      texto: "{mestre} morreu antes da prova. {quem} vai ao enterro e fica ao fundo, com a mão no antebraço, sem saber se veio despedir-se ou ver com os próprios olhos.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "foi ao enterro de quem lhe ensinou tudo e lhe cortou o braço" }] },
    { id: "a_licao_por_dar", cedo: true,
      quando: ["morto", "papel:quem"],
      texto: "{quem} morreu antes da prova. Ficas tu com o que sabes do golpe por baixo da guarda, e só tu podes decidir se o levas a {aprendiz}." },
    { id: "o_golpe_guardado",
      quando: ["todos", ["escolheu", "prova", "desafiar"], ["nenhum", ["afeicao", "papel:quem", 3]]],
      texto: "{quem} entra na sala no lugar de {aprendiz}, e luta bem — melhor do que nunca. Mas o golpe guardado vem por baixo da guarda, como da outra vez, e ninguém grita de que lado. Desta vez {mestre} não corta o braço. {aprendiz} vê tudo da porta, e é a última lição que alguém aprende naquela sala.",
      efeitos: [{ tipo: "morte", papel: "quem" }] },
  ],
  abandono: { semAvancar: 15, desfecho: "a_cicatriz_calada" },
});

/* UM SEGREDO DE SANGUE (tipo 2): as mãos do carrasco são iguais às de
   quem anda com o herói, nó por nó. A casa que o criou comprou-o em
   criança, para ter herdeiro, e o primo que herdaria achou a carta da
   compra. Dizê-lo em praça, ceder a herança pelo silêncio, ou reclamá-la
   na mesma. Do melhor (a mão estendida ao fundo da praça) ao pior (o vinho
   da herança, que ninguém provou). A ponte: o primo vende a herança. */
const O_SANGUE_DO_CARRASCO = quest({
  id: "o_sangue_do_carrasco",
  titulo: "O Sangue do Carrasco",
  tipo: 2,
  quando: ["cedo", "meio", "fim"],
  afim: [],
  papeis: {
    quem: { de: "grupo", ou: "elo", rotulo: "quem anda contigo" },
    carrasco: { de: "elenco", cidade: "uma cidade dos atos 2 ou 3", rotulo: "quem enforca nesta cidade" },
    primo: { de: "elenco", proximo: "carrasco", rotulo: "{primo:o primo que herdaria|a prima que herdaria}" },
    cadafalso: { de: "lugar", vizinho: "carrasco", tipos: ["cadeia", "mercado", "quartel"] },
  },
  mao: null,
  ponte: "{primo} vende a herança, antes de a ter, à mão que tudo estraga, numa cidade por onde um passo do vilão vai passar",
  temperatura: "chama",
  gancho: "Na praça de {cadafalso}, num dia de forca, {quem} ficou a olhar para as mãos do carrasco e não para quem ia morrer. À saída, {carrasco} passou por vocês de capuz na mão e parou um instante, só um, a olhar para {quem} como se olha para uma coisa perdida há muito tempo. {quem} não dormiu. Diz que aquelas mãos são iguais às suas, nó por nó, e que isso não quer dizer nada.",
  etapas: [
    { id: "sinal", texto: "Perguntar a {quem} o que viu nas mãos de quem enforca",
      espera: 2, acende: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 1]],
      conclui: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 2], ["conversou", "papel:quem", 2]] },
    { id: "porta", texto: "Ir com {quem} à porta de {carrasco}",
      ancora: { tipo: 1, concluidas: 1 },
      conclui: ["todos", ["esteve", "lugar:cadafalso"], ["acompanha", "papel:quem"], ["conversou", "papel:carrasco"]] },
    { id: "nome", texto: "Dizer a {quem} o que vale um nome emprestado",
      conclui: ["algum", ["escolheu", "nome", "guardar"], ["escolheu", "nome", "largar"]],
      ramos: ["guardar", "largar"] },
    { id: "praca", texto: "Estar ao lado de {quem} quando {primo} vier cobrar o segredo",
      conclui: ["algum", ["escolheu", "sangue", "assumir"], ["escolheu", "sangue", "ceder"], ["escolheu", "sangue", "reclamar"]],
      ramos: ["assumir", "ceder", "reclamar"] },
  ],
  escolhas: {
    nome: { etapa: "nome", opcoes: {
      guardar: {
        texto: "dizer a {quem} que um nome que nos criou é nosso, venha o sangue de onde vier",
        ganha: "{quem} respira: ninguém lhe pode tirar a casa onde cresceu, nem quem lhe pegou ao colo nas noites de febre.",
        custa: "Dizes-lhe que pode virar as costas a {carrasco} sem dever nada. E {carrasco} cumpriu vinte anos um juramento para lhe dar esse nome.",
        efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }],
      },
      largar: {
        texto: "dizer a {quem} que um nome emprestado se devolve, quando se sabe a quem",
        ganha: "{quem} ouve de ti o que tinha medo de pensar: que as mãos iguais querem dizer alguma coisa, e que pode querer saber o quê.",
        custa: "Empurras {quem} para fora da única casa que conhece, na direção de um sangue que toda a gente atravessa a rua para não cumprimentar.",
      },
    } },
    sangue: { etapa: "praca", opcoes: {
      assumir: {
        texto: "ficar ao lado de {quem} enquanto diz em praça de quem é {quem:filho|filha}",
        ganha: "Já ninguém tem nada com que {quem:o|a} ameaçar: o segredo é dito pela boca de quem o carrega, e {carrasco} ouve-o dito em público.",
        custa: "Sangue de carrasco não come à mesa de ninguém nesta terra. {quem} perde a casa que {quem:o|a} criou, o nome e a herança — e ganha {carrasco:um pai|uma mãe} que toda a gente atravessa a rua para não cumprimentar.",
      },
      ceder: {
        texto: "deixar {quem} ceder a herança a {primo}, em troca de silêncio",
        ganha: "{quem} guarda o nome e a casa onde foi {quem:criado|criada}; {primo} guarda a herança; e ninguém precisa de saber de quem são aquelas mãos.",
        custa: "Paga-se um segredo, e quem recebe uma vez volta a pedir. E {carrasco} fica a ver, do fundo da praça, quem é seu comprar o direito de não o ser.",
      },
      reclamar: {
        texto: "deixar {quem} reclamar a herança na mesma, e dizer que sangue não é casa",
        ganha: "{quem} diz na cara de {primo} que quem {quem:o|a} criou {quem:o|a} quis, e que o sangue não lhe tira o que o amor lhe deu. É verdade, e diz-se de pé.",
        custa: "{primo} perde uma herança inteira por uma verdade que mais ninguém conhece — e há quem mate por menos. Sem a confiança inteira de {quem} ao teu lado, ninguém vai provar o vinho dessa noite.",
      },
    } },
  },
  solucoes: {
    nome: {
      guardar: [{ texto: "{quem} acena, e calça as luvas antes de sair da estalagem, como se fizesse frio." }],
      largar: [{ texto: "{quem} fica muito tempo calad{quem:o|a}. De manhã, é {quem} quem pergunta onde mora quem enforca." }],
    },
    praca: {
      assumir: [{ texto: "{quem} sobe ao degrau da fonte, no meio da praça, e diz alto de quem é {quem:filho|filha}. Há um silêncio tão grande que se ouve a corda da forca a ranger ao vento." }],
      ceder: [{ texto: "{quem} assina a renúncia na mesa de uma taberna, com a mão firme. {primo} sopra a tinta para secar, e sorri." }],
      reclamar: [{ texto: "{quem} rasga a renúncia ao meio, à frente de {primo}, e pousa os dois bocados na mesa. «Fico com o que é meu. E o que é meu é de quem me quis.»" }],
    },
  },
  reviravoltas: [
    { id: "a_crianca_vendida",
      texto: "{carrasco} conta de capuz no colo, sem levantar os olhos: há vinte e tal anos, a casa que criou {quem} perdeu uma criança no parto e precisava de um herdeiro. {carrasco} tinha uma criança e nenhum futuro para lhe dar — sangue de carrasco é carrasco. Entregou-a por uma bolsa e por um juramento de nunca mais se aproximar. Cumpriu. Até ao dia da forca.",
      gatilho: ["todos", ["etapa", "porta"], ["consultou", "papel:carrasco"], ["nenhum", ["etapa", "praca"]]],
      efeitos: [{ tipo: "quem_e", papel: "carrasco", linha: "deu a sua criança a uma casa de nome para não ser carrasco, e jurou nunca se aproximar" }] },
    { id: "a_carta_da_compra",
      texto: "{primo} já sabe. Achou numa arca da casa a carta da compra, com a bolsa anotada e o juramento assinado, e diz-te ao ouvido, numa taberna, o que quer: a herança toda antes da lua nova, ou a carta vai para a porta da igreja.",
      gatilho: ["todos", ["etapa", "porta"], ["conversou", "papel:primo"], ["nenhum", ["etapa", "praca"]]],
      efeitos: [{ tipo: "quem_e", papel: "primo", linha: "tem a carta que prova de quem é o sangue de quem anda contigo, e quer a herança por ela" }] },
  ],
  desfechos: [
    { id: "as_maos_iguais",
      quando: ["todos", ["escolheu", "sangue", "assumir"], ["escolheu", "nome", "largar"], ["afeicao", "papel:quem", 3], ["consultou", "papel:carrasco"]],
      texto: "{quem} diz na praça, alto, de quem é {quem:filho|filha}, e a praça cala-se. {carrasco} está ao fundo, de capuz na mão. {quem} atravessa a praça inteira até lá, devagar, e estende-lhe a mão — a mão igual, nó por nó. {carrasco} demora a pegar-lhe. Depois pega, e já não larga.",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "carrasco" }] },
    { id: "o_nome_devolvido",
      quando: ["escolheu", "sangue", "assumir"],
      texto: "{quem} diz na praça de quem é {quem:filho|filha}, e perde no mesmo dia a casa, o nome e a mesa onde comia. {carrasco} não se aproxima: cumpre o juramento até ao fim. Mas nessa noite há pão e uma manta à porta da estalagem, sem bilhete.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "disse em praça que é sangue do carrasco, e perdeu o nome por isso" }] },
    { id: "o_silencio_comprado",
      quando: ["escolheu", "sangue", "ceder"],
      texto: "{quem} assina a renúncia, e {primo} queima a carta à vossa frente. Ninguém vai saber. {quem} guarda o nome e perde a herança, e na forca seguinte não vai à praça: diz que tem coisas a fazer, e passa o dia a lavar as mãos.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "comprou com a herança o direito de ninguém saber de quem é o seu sangue" }] },
    { id: "sangue_nao_e_casa",
      quando: ["todos", ["escolheu", "sangue", "reclamar"], ["afeicao", "papel:quem", 3]],
      texto: "{quem} reclama a herança na cara de {primo}, e fica com ela. Nessa noite, à mesa, provas tu o vinho antes {quem:dele|dela}, por desconfiança — e cospes. {primo} sai da terra antes do sol. De manhã, {quem} vai levar a {carrasco} a primeira parte do que herdou.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "inimigo", papel: "primo" }] },
    { id: "as_luvas_no_verao", padrao: true,
      texto: "{quem} nunca volta à porta de {carrasco}. Passa a usar luvas, mesmo no verão, e quando há forca na praça vira as costas antes do fim.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "quem_e", papel: "quem", linha: "usa luvas para não ver nas suas as mãos de quem não quis conhecer" }] },
    { id: "sem_carrasco", cedo: true,
      quando: ["todos", ["morto", "papel:carrasco"], ["nenhum", ["etapa", "praca"]]],
      texto: "{carrasco} morreu antes de {quem} lhe dizer fosse o que fosse. Ninguém vai ao enterro de um carrasco. {quem} vai, e é a única pessoa lá, além de quem cava.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "foi ao enterro do carrasco, e era a única pessoa lá" }] },
    { id: "o_segredo_sem_dono", cedo: true,
      quando: ["morto", "papel:quem"],
      texto: "{quem} morreu sem dizer nada. A carta está na mão de {primo}, e as mãos iguais estão debaixo da terra. Só tu sabes — e decides tu se {carrasco} fica a saber quem perdeu." },
    { id: "o_vinho_da_heranca",
      quando: ["todos", ["escolheu", "sangue", "reclamar"], ["nenhum", ["afeicao", "papel:quem", 3]]],
      texto: "{quem} reclama a herança na cara de {primo}, e fica com ela. Nessa noite há festa na casa que {quem:o|a} criou, e ninguém prova o vinho antes {quem:dele|dela}. De manhã encontram-{quem:no|na} à mesa, de cabeça pousada nas mãos — as mãos iguais às de quem, ao fundo da praça, foi o único a chorar.",
      efeitos: [{ tipo: "morte", papel: "quem" }] },
  ],
  abandono: { semAvancar: 15, desfecho: "as_luvas_no_verao" },
});

/* A ESCOLHA ENTRE DOIS QUE SE AMAM (tipo 2): os dois velhos que criaram
   quem anda com o herói estão presos, e o juiz solta um se o outro
   confessar. Confessaram os dois, cada um a jurar pelo outro. Escolher
   qual volta para casa, ou confessar no lugar dos dois. Do melhor (a
   acusação paga desfeita, e os três à mesma mesa) ao pior (a cela
   trocada sem ninguém a procurar quem pagou, e as galés do rio). A ponte:
   a acusação foi paga por quem quer a terra deles. */
const QUARENTA_INVERNOS = quest({
  id: "quarenta_invernos",
  titulo: "Quarenta Invernos",
  tipo: 2,
  quando: ["cedo", "meio", "fim"],
  afim: [],
  papeis: {
    quem: { de: "grupo", ou: "elo", rotulo: "quem anda contigo" },
    um: { de: "elenco", cidade: "uma cidade dos atos 2 ou 3", rotulo: "quem criou {quem}, e jura que foi só {um:ele|ela}" },
    outro: { de: "elenco", proximo: "um", rotulo: "quem criou {quem}, e jura o mesmo" },
    cadeia: { de: "lugar", vizinho: "um", tipos: ["cadeia", "quartel", "templo"] },
  },
  mao: null,
  ponte: "a acusação contra {um} e {outro} foi paga pela mão que tudo estraga, que quer a terra deles, numa cidade por onde um passo do vilão vai passar",
  temperatura: "brasa",
  gancho: "Chegou recado para {quem}: os dois velhos que {quem:o|a} criaram estão presos em {cadeia}, acusados de esconder contrabando na adega. O juiz deu-lhes uma saída — que um confesse, e o outro vai para casa. Confessaram os dois no mesmo dia, cada um a jurar que o outro não sabia de nada. Quarenta invernos casados, e agora mentem um pelo outro diante da lei. {quem} leu o recado e disse só: «Vão querer que seja eu a escolher.»",
  etapas: [
    { id: "sinal", texto: "Perguntar a {quem} quem são os dois velhos do recado",
      espera: 2, acende: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 1]],
      conclui: ["todos", ["acompanha", "papel:quem"], ["afeicao", "papel:quem", 2], ["conversou", "papel:quem", 2]] },
    { id: "visita", texto: "Ir com {quem} a {cadeia}, ver os dois",
      ancora: { tipo: 1, concluidas: 1 },
      conclui: ["todos", ["esteve", "lugar:cadeia"], ["acompanha", "papel:quem"], ["conversou", "papel:um"], ["conversou", "papel:outro"]] },
    { id: "conselho", texto: "Dizer a {quem} se a verdade vale mais do que um dos dois",
      conclui: ["algum", ["escolheu", "conselho", "verdade"], ["escolheu", "conselho", "salvar"]],
      ramos: ["verdade", "salvar"] },
    { id: "juizo", texto: "Estar ao lado de {quem} diante do juiz",
      conclui: ["algum", ["escolheu", "juizo", "um"], ["escolheu", "juizo", "outro"], ["escolheu", "juizo", "eu"]],
      ramos: ["um", "outro", "eu"] },
  ],
  escolhas: {
    conselho: { etapa: "conselho", opcoes: {
      verdade: {
        texto: "dizer a {quem} que se procure a verdade, mesmo que custe os dois",
        ganha: "{quem} deixa de pensar em quem salvar e começa a pensar em quem pagou. É a pergunta certa, e é a única que pode tirar os dois.",
        custa: "A verdade leva tempo, e o juiz não espera. Se não chegar a tempo, os dois perdem a saída que tinham.",
      },
      salvar: {
        texto: "dizer a {quem} que se salve um, já, enquanto há saída",
        ganha: "{quem} deixa de esperar por um milagre: há uma porta aberta, e cabe uma pessoa por ela. Alguém vai dormir em casa.",
        custa: "Ensinas {quem} a escolher entre os dois que {quem:o|a} criaram. E nenhuma escolha dessas se desfaz, nem se esquece.",
        efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }],
      },
    } },
    juizo: { etapa: "juizo", opcoes: {
      um: {
        texto: "deixar {quem} levar ao juiz a confissão de {outro}, para que {um} vá para casa",
        ganha: "{um} volta para casa esta noite, e dorme na sua cama. Um dos dois está a salvo, e foi por mão de quem criaram.",
        custa: "{outro} fica a ver {um} sair pela porta da cela, e sorri, porque era o que queria. {quem} vai ouvir esse sorriso o resto da vida.",
      },
      outro: {
        texto: "deixar {quem} levar ao juiz a confissão de {um}, para que {outro} vá para casa",
        ganha: "{outro} volta para casa esta noite, e dorme na sua cama. Um dos dois está a salvo, e foi por mão de quem criaram.",
        custa: "{um} fica a ver {outro} sair pela porta da cela, e sorri, porque era o que queria. {quem} vai ouvir esse sorriso o resto da vida.",
      },
      eu: {
        texto: "deixar {quem} confessar no lugar dos dois",
        ganha: "Os dois vão para casa juntos, como estiveram quarenta invernos, e ninguém tem de escolher.",
        custa: "{quem} fica na cela que era deles, por um crime que não cometeu, à mercê de um juiz que foi pago por alguém. Sem a confiança inteira de {quem} em ti, ninguém vai procurar quem pagou antes de a sentença sair.",
      },
    } },
  },
  solucoes: {
    conselho: {
      verdade: [{ texto: "{quem} dobra o recado em quatro e pergunta-te, de olhos secos, a quem é que interessa a terra dos dois." }],
      salvar: [{ texto: "{quem} acena, e não volta a falar até de manhã. Tens a certeza de que passou a noite a decidir qual." }],
    },
    juizo: {
      um: [{ texto: "{quem} entrega ao juiz a confissão de {outro}. Pela grade, {outro} pisca-lhe o olho, como quando {quem} era criança e apanhava uma reprimenda que não merecia." }],
      outro: [{ texto: "{quem} entrega ao juiz a confissão de {um}. Pela grade, {um} faz-lhe um aceno pequeno, de aprovação, como quando {quem} acertava nas contas da mercearia." }],
      eu: [{ texto: "{quem} diz ao juiz, de pé e sem tremer, que o contrabando era seu. Os dois velhos gritam ao mesmo tempo que é mentira. O juiz manda calar os três." }],
    },
  },
  reviravoltas: [
    { id: "a_acusacao_de_vespera",
      texto: "Em {cadeia}, o carcereiro diz-te ao ouvido, por uma moeda: a acusação chegou escrita, com o nome dos dois e a data da prisão, uma semana antes de alguém ir à adega. Quem a escreveu sabia o que lá se ia achar.",
      gatilho: ["todos", ["etapa", "visita"], ["descobriu", "lugar:cadeia"], ["nenhum", ["etapa", "juizo"]]],
      efeitos: [{ tipo: "quem_e", papel: "um", linha: "foi preso por uma acusação escrita uma semana antes da busca" }] },
    { id: "a_venda_rasgada",
      texto: "{um} conta-te, quando {outro} não ouve, a verdade inteira: o contrabando não é de nenhum dos dois. Mas há um mês, {outro} assinou de boa-fé a venda da terra a um homem bem-educado, arrependeu-se, e rasgou-a. Foi a seguir que apareceu tijolo novo na adega.",
      gatilho: ["todos", ["etapa", "visita"], ["consultou", "papel:um"], ["nenhum", ["etapa", "juizo"]]],
      efeitos: [{ tipo: "quem_e", papel: "outro", linha: "assinou e rasgou a venda da terra, e foi a seguir que apareceu o contrabando na adega" }] },
  ],
  desfechos: [
    { id: "os_tres_a_mesa",
      quando: ["todos", ["escolheu", "juizo", "eu"], ["escolheu", "conselho", "verdade"], ["afeicao", "papel:quem", 3], ["descobriu", "lugar:cadeia"]],
      texto: "{quem} confessa no lugar dos dois, e o juiz manda-{quem:o|a} para a cela. Três dias depois, entras na sala do juiz com o carcereiro pela mão e a acusação escrita uma semana antes da busca. O juiz fica muito branco. Nessa noite os três jantam à mesma mesa, em casa, e {um} e {outro} discutem quem é que pôs sal a mais, como há quarenta invernos.",
      efeitos: [{ tipo: "marco", papel: "quem" }, { tipo: "aliado", papel: "um" }] },
    { id: "a_figueira",
      quando: ["escolheu", "juizo", "um"],
      texto: "{um} volta para casa, e {outro} fica. Na cela, {outro} pede a {quem} que regue a figueira do quintal, que {um} se esquece sempre. {quem} rega-a todas as manhãs. {um} senta-se debaixo dela à tarde, a olhar para o caminho da cadeia.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "escolheu qual dos dois que o criaram voltava para casa, e rega uma figueira por isso" }] },
    { id: "o_prato_a_mais",
      quando: ["escolheu", "juizo", "outro"],
      texto: "{outro} volta para casa, e {um} fica. Na cela, {um} pede a {quem} que não deixe {outro} comer sem companhia. {quem} janta lá todos os domingos, e há sempre um prato a mais na mesa, que ninguém tira.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "escolheu qual dos dois que o criaram voltava, e janta lá aos domingos com um prato a mais" }] },
    { id: "um_inverno_na_cela",
      quando: ["todos", ["escolheu", "juizo", "eu"], ["afeicao", "papel:quem", 3]],
      texto: "{quem} confessa no lugar dos dois. Os velhos saem juntos, de mão dada, a chorar e a ralhar. {quem} passa o inverno na cela, e tu vais lá todas as semanas com pão e notícias. Na primavera o juiz cansa-se do caso e solta-{quem:o|a} sem dizer porquê. Ninguém chegou a saber quem pagou.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: 5 }, { tipo: "quem_e", papel: "quem", linha: "passou um inverno numa cela no lugar dos dois que o criaram" }] },
    { id: "os_dois_na_cela", padrao: true,
      texto: "{quem} nunca vai a {cadeia}. Os dois velhos ficam presos, cada um a jurar pelo outro, até o juiz os mandar aos dois para as galés do rio. {quem} recebe a última carta deles, escrita a duas mãos, e não a abre.",
      efeitos: [{ tipo: "vinculo", papel: "quem", n: -10 }, { tipo: "quem_e", papel: "quem", linha: "deixou presos os dois que o criaram, a mentir um pelo outro" }] },
    { id: "a_casa_grande_demais", cedo: true,
      quando: ["todos", ["morto", "papel:um"], ["nenhum", ["etapa", "juizo"]]],
      texto: "{um} morreu na cela antes do julgamento, e {outro} deixou de jurar fosse o que fosse. {quem} leva {outro} para casa, e a casa fica grande demais.",
      efeitos: [{ tipo: "quem_e", papel: "quem", linha: "levou para casa um dos dois que o criaram, e a casa ficou grande demais" }] },
    { id: "a_escolha_sem_quem", cedo: true,
      quando: ["morto", "papel:quem"],
      texto: "{quem} morreu antes de chegar a {cadeia}. Os dois velhos ainda não sabem. Vais ter de lhes dizer tu — e, depois, de escolher tu." },
    { id: "as_gales_do_rio",
      quando: ["todos", ["escolheu", "juizo", "eu"], ["nenhum", ["afeicao", "papel:quem", 3]]],
      texto: "{quem} confessa no lugar dos dois, e ninguém vai atrás de quem pagou a acusação. A sentença sai ao fim de uma semana, escrita pela mesma mão. Os dois velhos voltam para casa de mão dada, e ao terceiro dia vêm dizer-lhes que {quem} não aguentou as galés do rio. {um} e {outro} já não mentem um pelo outro. Deixam de falar.",
      efeitos: [{ tipo: "morte", papel: "quem" }] },
  ],
  abandono: { semAvancar: 15, desfecho: "os_dois_na_cela" },
});

/* O lote, pela ordem: as oito do tipo 1 (as três tenentes do cedo à
   cabeça, a pista do vilão-bicho a meio), e as quatro do coração. A
   biblioteca concatena-o depois do lote 4. */
export const QUESTS_LOTE_5 = [
  O_PAO_QUE_SAI_DE_NOITE, A_BARCA_A_MEIO_DO_RIO, AS_CHAVES_DA_GUARDA, A_TORRE_DO_SINO,
  A_RUA_QUE_NAO_ACORDA, AS_PEGADAS_NO_BARRO, A_ESTALAGEM_DO_TEMPORAL, AS_DUAS_FOGUEIRAS,
  A_VIGIA_TROCADA, A_ULTIMA_LICAO, O_SANGUE_DO_CARRASCO, QUARENTA_INVERNOS,
];
