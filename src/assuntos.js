/* ============================================================
   OS ASSUNTOS (v9.91) — do que a onda é feita

   "Podemos expandir a estrutura de arcos e dentro do arco ter camadas e
   etapas, algumas fixas e outras sorteadas, seguindo uma fórmula
   infalível. Assim o sistema pode ir mandando para o mestre 'comece a
   preparar uma briga' e depois 'agora comece a briga'."

   A FÓRMULA é a onda, e ela é FIXA: respiro, semente, subida, véspera,
   clímax, preço, e de volta ao respiro. Ela mora em compasso.js e não
   muda nunca — é ela que impede a campanha de virar uma sequência de
   pancadas sem ar, e também de virar uma tarde de conversa que nunca
   chega a lugar nenhum.

   O ASSUNTO é o que é SORTEADO, e mora aqui: do que essa onda trata. Uma
   briga, um romance, uma traição, uma dívida que vence, uma descoberta
   que muda o mapa. O assunto é escolhido na SEMENTE e carregado até o
   PREÇO — e é isso que produz o efeito que o pedido descreve: o sistema
   avisa cedo, o Mestre prepara o terreno, e quando a coisa acontece ela
   parece que estava vindo desde sempre. Porque estava.

   ---------------- OS CINCO TEMPOS DE CADA ASSUNTO ----------------

   `preparo`  — na SEMENTE. "Comece a preparar." Nada acontece ainda: o
                que entra é o material de que a coisa vai precisar.
   `subindo`  — na SUBIDA. Agora aperta, e o jogador já pode agir contra.
   `vespera`  — na VÉSPERA. Um turno só, e o mais importante dos cinco: é
                a última chance de o jogador escolher como encontra o que
                vem. Sem ela o clímax vira emboscada do sistema.
   `agora`    — no CLÍMAX. Acontece.
   `depois`   — no PREÇO. O que ficou. Nunca é "e tudo voltou ao normal".

   ---------------- O QUE NENHUM ASSUNTO FAZ ----------------

   Inventar o que é do sistema. Nenhum destes textos manda a IA abrir
   combate, criar item, cobrar moeda ou matar alguém: quem faz isso é o
   código, pelos canais que já existem. O assunto diz DO QUE a cena
   trata; o sistema continua dizendo o que é verdade.
   ============================================================ */

export const FAMILIAS = [
  { id: "luta", nome: "a luta", diz: "o que se resolve com o corpo e com o risco", pilar: "combate" },
  { id: "laco", nome: "os laços", diz: "o que se resolve entre duas pessoas, e o que se quebra nelas", pilar: "social" },
  { id: "enigma", nome: "o enigma", diz: "o que está escondido, e o preço de descobrir", pilar: "exploracao" },
  { id: "mundo", nome: "o mundo", diz: "o que é maior que o herói e acontece de qualquer jeito", pilar: "exploracao" },
  { id: "perda", nome: "a perda", diz: "o que se tem e se deixa de ter", pilar: "social" },
  { id: "poder", nome: "o poder", diz: "o que o herói vira, e o que isso cobra dele", pilar: "combate" },
];
export function familiaPorId(id) { return FAMILIAS.find((f) => f.id === id) || null; }

export const ASSUNTOS = [
  /* ==================== A LUTA ==================== */
  {
    id: "briga_de_rua", familia: "luta", peso: 4,
    nome: "uma briga que começa pequena",
    quando: (s) => s.emCidade && !s.emCombate,
    preparo: "Comece a preparar uma BRIGA, e comece pelo que não é briga: mostre duas partes que se estranham aqui — um desprezo antigo, uma cobrança, um lugar que os dois querem. Eu não preciso estar envolvido ainda.",
    subindo: "O atrito entre aquelas partes aperta e agora me toca de raspão: um dos lados me quer do lado dele, ou o outro decidiu que eu já escolhi.",
    vespera: "Os dois lados estão no mesmo lugar, e alguém já pôs a mão onde não devia.",
    agora: "Agora ACONTECE: o atrito vira violência aqui, na minha frente, com as pessoas que você já mostrou.",
    depois: "Mostre o que ficou depois: quem apanhou, quem sumiu, quem passou a me dever, e o que a cidade decidiu achar de mim.",
  },
  {
    id: "emboscada_estrada", familia: "luta", peso: 4,
    nome: "uma emboscada na estrada",
    quando: (s) => s.emViagem || (!s.emCidade && !s.emMasmorra),
    preparo: "Comece a preparar uma EMBOSCADA. Ainda não: mostre o terreno que serviria para uma — onde a estrada estreita, o que impede ver adiante, o silêncio que não devia estar ali.",
    subindo: "Os sinais deixam de ser paisagem: rastro fresco, coisa recém-mexida, um bicho que fugiu do que não sou eu.",
    vespera: "O terreno à frente é exatamente aquele, e não há como contorná-lo antes do escuro.",
    agora: "Agora ACONTECE: o que estava esperando se mostra, e se mostra do jeito que o terreno permitia — não do nada.",
    depois: "Mostre o custo da estrada depois disso: o que ficou para trás, o que atrasou, e o que eu vou ter de carregar até a próxima parada.",
  },
  {
    id: "cacada", familia: "luta", peso: 3,
    nome: "alguém veio atrás de mim",
    quando: (s) => s.fama >= 25 || s.ordemDaFase >= 2,
    preparo: "Comece a preparar uma CAÇADA — a mim. Mostre que perguntaram por mim aqui: alguém descreveu meu rosto, pagou por informação, ou deixou recado com quem não devia.",
    subindo: "Quem me procura chegou perto: reconhecem meu nome onde eu não o disse, e alguém que me conhece está com medo de ser visto comigo.",
    vespera: "Quem me procura está nesta rua, e sabe em que porta bater.",
    agora: "Agora ACONTECE: quem me caça me encontra, e não erra o lugar nem a hora.",
    depois: "Mostre o que essa caçada mudou: quem sabe onde eu estou agora, quem deixou de querer minha companhia, e o que eu não posso mais fazer em público.",
  },
  {
    id: "cerco", familia: "luta", peso: 3,
    nome: "um cerco",
    quando: (s) => s.emCidade && s.momento >= 0.35,
    preparo: "Comece a preparar um CERCO. Mostre a preparação pelo lado de dentro: gente estocando, portas reforçadas, quem está indo embora enquanto dá.",
    subindo: "O cerco se fecha em volta: as saídas viram três, depois duas, e alguém decide que a culpa é de quem chegou de fora — de mim.",
    vespera: "As portas se fecham ao anoitecer, e é agora que se decide de que lado delas eu fico.",
    agora: "Agora ACONTECE: o cerco aperta de verdade e não há mais o que preparar.",
    depois: "Mostre a cidade depois: o que foi queimado, quem manda agora, e a conta que os que ficaram vão cobrar de alguém.",
  },
  {
    id: "duelo", familia: "luta", peso: 3,
    nome: "um duelo com nome e hora",
    quando: (s) => s.emCidade && s.pessoaNaCena && s.momento >= 0.3,
    preparo: "Comece a preparar um DUELO: uma ofensa entre duas pessoas específicas, dita em público, do tipo que este lugar não deixa passar em branco.",
    subindo: "A ofensa vira compromisso: há hora, há lugar, há gente que já apostou, e sair disso agora custa mais que entrar.",
    vespera: "É hoje, e a hora já foi dita em voz alta na frente de todos.",
    agora: "Agora ACONTECE: os dois se encontram na hora marcada, com plateia.",
    depois: "Mostre o que o duelo decidiu além de quem venceu: o que mudou de dono, quem perdeu a palavra, e quem passou a ter medo de quem.",
  },
  {
    id: "monstro_do_lugar", familia: "luta", peso: 3,
    nome: "a coisa que mora aqui",
    quando: (s) => s.emMasmorra || s.emViagem,
    preparo: "Comece a preparar A COISA QUE MORA AQUI. Mostre o que ela fez, nunca ela: o estrago, o padrão, o que as pessoas deixaram de fazer por causa dela.",
    subindo: "Ela está mais perto do que o estrago sugeria — e alguma coisa nova indica que ela reparou em mim.",
    vespera: "O estrago fresco é de horas, não de dias — e aponta para onde eu estou indo.",
    agora: "Agora ACONTECE: ela aparece inteira, e é do tamanho que o estrago já dizia.",
    depois: "Mostre o lugar sem ela — ou com ela ainda por aí: o que volta a funcionar, o que não volta, e quem não acredita que acabou.",
  },
  {
    id: "revolta", familia: "luta", peso: 2,
    nome: "gente comum decidindo revidar",
    quando: (s) => s.emCidade && s.momento >= 0.4,
    preparo: "Comece a preparar uma REVOLTA: mostre a paciência acabando em gente que não é guerreira — o preço que subiu de novo, a humilhação repetida, o funeral que ninguém pagou.",
    subindo: "A paciência vira organização: alguém está contando cabeças, e uma data começa a circular sem ser dita em voz alta.",
    vespera: "A rua está cheia de gente que não devia estar na rua a esta hora.",
    agora: "Agora ACONTECE: a gente comum revida, mal armada e a sério.",
    depois: "Mostre quem pagou pela revolta — quase nunca quem a começou —, e o que ficou pior mesmo tendo dado certo.",
  },

  /* ==================== OS LAÇOS ==================== */
  {
    id: "romance", familia: "laco", peso: 4,
    nome: "um romance",
    quando: (s) => s.pessoaNaCena || s.emCidade,
    preparo: "Comece a preparar um ROMANCE, e comece pelo mundano: ponha alguém no meu caminho por um motivo que não tem nada a ver comigo, e deixe essa pessoa ser interessante ANTES de ser possível.",
    subindo: "A convivência vira escolha: essa pessoa procura a minha companhia sem inventar desculpa, e alguma coisa nela fica difícil de ignorar.",
    vespera: "Ficamos os dois sem ter mais o que fazer ali, e nenhum dos dois vai embora.",
    agora: "Agora ACONTECE: o interesse fica dito ou fica claro — por gesto, por risco corrido, por uma frase que não dá para desdizer. E a palavra volta para mim.",
    depois: "Mostre o que isso mudou no cotidiano: o que ficou diferente entre nós dois, quem reparou, e o que essa pessoa passa a esperar sem cobrar.",
  },
  {
    id: "amizade", familia: "laco", peso: 3,
    nome: "uma amizade que se prova",
    quando: (s) => s.temGrupo || s.pessoaNaCena,
    preparo: "Comece a preparar uma AMIZADE: mostre alguém dividindo comigo uma coisa pequena e própria — comida, uma queixa, um ofício. Sem pedir nada.",
    subindo: "Essa pessoa começa a contar comigo em coisas em que não precisava, e a incomodar-se com o que me incomoda.",
    vespera: "Essa pessoa está prestes a entrar numa encrenca que é minha, e já se levantou.",
    agora: "Agora ACONTECE: ela faz alguma coisa por mim que custa caro a ela, e faz sem avisar.",
    depois: "Mostre a conta que ninguém cobrou: o que essa pessoa perdeu por ter feito aquilo, e como ela evita o assunto.",
  },
  {
    id: "traicao", familia: "laco", peso: 4,
    nome: "uma traição",
    quando: (s) => (s.temGenteConhecida || s.temGrupo) && s.momento >= 0.35,
    preparo: "Comece a preparar uma TRAIÇÃO. Nada de suspeita ainda: mostre alguém próximo com um PROBLEMA meu-alheio — uma dívida, uma família presa, um medo. Deixe o problema respirar sozinho.",
    subindo: "Aquele problema aperta e a pessoa começa a proteger informação: uma resposta vaga onde antes havia franqueza, uma ausência mal explicada.",
    vespera: "A pessoa está a sós com a coisa que ela pode entregar, e sabe que eu confio nela.",
    agora: "Agora ACONTECE: fica claro que essa pessoa entregou alguma coisa minha — e fica claro POR QUÊ. O motivo não pode ser dinheiro puro.",
    depois: "Mostre o buraco que a traição deixou: o que eu não posso mais fazer, quem tomou o lugar dessa pessoa, e o que ela ganhou de fato.",
  },
  {
    id: "reencontro", familia: "laco", peso: 3, precisa: "gente",
    nome: "um reencontro",
    quando: (s) => s.emCidade && s.momento >= 0.3,
    preparo: "Comece a preparar um REENCONTRO: deixe cair o nome de alguém que eu já conheci nesta campanha, dito por outra pessoa, sem que ninguém explique nada.",
    subindo: "O nome volta com endereço: essa pessoa está por perto, e alguém deixa escapar em que estado ela anda.",
    vespera: "Está do outro lado da praça, e ainda não me viu.",
    agora: "Agora ACONTECE: nós dois nos encontramos, e a pessoa não é mais quem eu deixei.",
    depois: "Mostre o que o reencontro fez com os dois: o que foi dito, o que não coube, e se ela volta a sumir.",
  },
  {
    id: "rivalidade", familia: "laco", peso: 3,
    nome: "uma rivalidade",
    quando: (s) => s.emCidade,
    preparo: "Comece a preparar uma RIVALIDADE: ponha alguém competente no mesmo ofício que o meu, fazendo o meu trabalho bem, sem hostilidade nenhuma.",
    subindo: "A comparação começa a ser feita em voz alta por terceiros, e um de nós dois perde alguma coisa concreta para o outro.",
    vespera: "Estamos os dois inscritos na mesma coisa, e falta uma hora.",
    agora: "Agora ACONTECE: eu e essa pessoa ficamos frente a frente na mesma tarefa, e só um pode ganhá-la.",
    depois: "Mostre o respeito que sobra ou o rancor que fica — e o que a plateia decidiu contar sobre nós dois.",
  },
  {
    id: "familia", familia: "laco", peso: 2,
    nome: "gente que reclama parentesco",
    quando: (s) => s.emCidade && s.fama >= 25,
    preparo: "Comece a preparar uma questão de FAMÍLIA: alguém deste lugar reconhece uma coisa em mim — um traço, um nome, um objeto — e reage antes de explicar.",
    subindo: "A ligação ganha corpo: aparece quem confirma, quem desmente e quem tem interesse em qual das duas versões vale.",
    vespera: "A pessoa vem vindo até mim, com testemunhas atrás.",
    agora: "Agora ACONTECE: a pessoa diz o que quer de mim por causa desse parentesco, e o que quer é concreto.",
    depois: "Mostre o que essa história me acrescentou e o que ela me custou perante os outros.",
  },
  {
    id: "divida_de_honra", familia: "laco", peso: 3,
    nome: "uma dívida de honra",
    quando: (s) => s.pessoaNaCena,
    preparo: "Comece a preparar uma DÍVIDA DE HONRA: alguém me faz um favor que eu não pedi e recusa pagamento, dizendo que não é nada.",
    subindo: "Essa pessoa passa a aparecer onde eu estou, sem cobrar, e outros começam a tratá-la como se ela tivesse direito a alguma coisa minha.",
    vespera: "A pessoa me chama de lado com o jeito de quem vai cobrar.",
    agora: "Agora ACONTECE: ela pede o que quer, e o que pede é maior do que o favor foi.",
    depois: "Mostre o que sobra do acerto: se ficou pago, se ficou pela metade, e o que os outros acham que eu sou por causa disso.",
  },
  {
    id: "despedida", familia: "laco", peso: 2,
    nome: "uma despedida",
    quando: (s) => (s.temGrupo || s.temGenteConhecida) && s.momento >= 0.5,
    preparo: "Comece a preparar uma DESPEDIDA: mostre alguém do meu convívio com uma vida própria puxando para outro lado — um ofício, uma família, um lugar de origem.",
    subindo: "Aquilo aperta e a pessoa começa a se despedir sem dizer que se despede: entrega coisas, resolve pendências, fala do futuro sem se incluir.",
    vespera: "As coisas dela estão amarradas, e a carroça sai ao amanhecer.",
    agora: "Agora ACONTECE: essa pessoa vai embora de verdade, e a cena é curta.",
    depois: "Mostre a falta no lugar exato onde ela aparece: a tarefa que ninguém faz, a fala que ninguém diz, o hábito que ficou sem par.",
  },

  /* ==================== O ENIGMA ==================== */
  {
    id: "sumico", familia: "enigma", peso: 4,
    nome: "alguém sumiu",
    quando: (s) => s.emCidade,
    preparo: "Comece a preparar um SUMIÇO: mostre a rotina de alguém deste lugar, funcionando normalmente, com nome e ofício. Só isso.",
    subindo: "Essa pessoa falta onde nunca faltou, e as explicações que dão não combinam entre si.",
    vespera: "O lugar de onde a pessoa sumiu está aberto, e ninguém entrou ainda.",
    agora: "Agora ACONTECE: aparece o que sobrou dela — ou a prova de que ela foi levada. Uma coisa concreta, não uma conclusão.",
    depois: "Mostre o que a cidade faz com isso: quem procura, quem prefere não procurar, e o que passa a ser evitado à noite.",
  },
  {
    id: "documento", familia: "enigma", peso: 3,
    nome: "um papel que não devia existir",
    quando: (s) => s.emCidade || s.emMasmorra,
    preparo: "Comece a preparar um ACHADO ESCRITO: mostre que este lugar guarda registros — quem escreve, onde fica, quem tem a chave.",
    subindo: "Um pedaço desse registro aparece fora do lugar, e alguém fica visivelmente incomodado com isso.",
    vespera: "O papel está a uma sala de distância, e quem o guarda saiu.",
    agora: "Agora ACONTECE: o documento chega inteiro à minha mão, e o que ele diz contradiz o que todo mundo aqui repete.",
    depois: "Mostre o que fazer com a verdade custa: quem quer o papel de volta, quem já sabia, e quem prefere que eu não tivesse achado.",
  },
  {
    id: "impostor", familia: "enigma", peso: 3, precisa: "gente",
    nome: "alguém não é quem diz ser",
    quando: (s) => s.pessoaNaCena && s.momento >= 0.3,
    preparo: "Comece a preparar um IMPOSTOR: estabeleça bem quem alguém DIZ ser — ofício, origem, história —, de forma detalhada e crível.",
    subindo: "Um detalhe dessa história não fecha, e a pessoa corrige rápido demais, ou alguém de fora estranha em voz baixa.",
    vespera: "A prova está prestes a aparecer na frente de todo mundo, e a pessoa ainda não sabe.",
    agora: "Agora ACONTECE: fica provado que a pessoa é outra coisa — mas o que ela é, de fato, ainda não fica claro.",
    depois: "Mostre o estrago da mentira depois de descoberta: o que ela conseguiu enquanto durou, e quem confiou nela por minha causa.",
  },
  {
    id: "ruina", familia: "enigma", peso: 3,
    nome: "uma ruína com dono antigo",
    quando: (s) => s.emViagem || s.emMasmorra,
    preparo: "Comece a preparar uma RUÍNA: mostre que este lugar teve outro antes — uma pedra que não combina, um caminho que ia para lugar nenhum, um nome velho que ninguém usa.",
    subindo: "O que era paisagem vira sinal: há um jeito de entrar, e há sinal de quem entrou antes de mim.",
    vespera: "A entrada está aberta e o dia ainda tem luz — mas não muita.",
    agora: "Agora ACONTECE: o que estava guardado ali se revela, e é maior do que a ruína sugeria.",
    depois: "Mostre o que veio junto com a descoberta: quem soube que eu estive lá, e o que se abriu ao ser aberto.",
  },
  {
    id: "boato_verdadeiro", familia: "enigma", peso: 2,
    nome: "um boato que era verdade",
    quando: (s) => s.emCidade,
    preparo: "Comece a preparar um BOATO: deixe circular uma versão absurda de alguma coisa, contada por gente sem credibilidade, e deixe as pessoas rirem dela.",
    subindo: "Uma parte do absurdo se confirma de um jeito banal, e quem ria para de rir.",
    vespera: "Quem debochava do boato acabou de calar-se no meio de uma frase.",
    agora: "Agora ACONTECE: o boato era verdade — e a parte verdadeira é a que ninguém achava importante.",
    depois: "Mostre o que acontece com quem avisou e com quem debochou, e o que passa a ser levado a sério agora.",
  },
  {
    id: "codigo", familia: "enigma", peso: 2,
    nome: "um sinal que se repete",
    quando: (s) => s.momento >= 0.25,
    preparo: "Comece a preparar um SINAL REPETIDO: ponha uma marca, um gesto ou uma palavra em UM lugar, sem nenhum destaque.",
    subindo: "A mesma marca aparece num segundo lugar que não tem relação nenhuma com o primeiro.",
    vespera: "As duas marcas se encontram nesta rua, e a terceira é aqui.",
    agora: "Agora ACONTECE: eu encontro o sentido da marca — e ela está apontando para alguma coisa que já está em andamento.",
    depois: "Mostre o que a marca já produziu enquanto eu não entendia, e quem mais sabia ler aquilo.",
  },

  /* ==================== O MUNDO ==================== */
  {
    id: "escassez", familia: "mundo", peso: 3,
    nome: "uma escassez",
    quando: (s) => s.emCidade,
    preparo: "Comece a preparar uma ESCASSEZ: mostre alguma coisa deste lugar dependendo de UMA fonte — água, sal, ferro, remédio, uma estrada.",
    subindo: "A fonte falha ou encarece, e as pessoas começam a se comportar de forma diferente por causa disso.",
    vespera: "Está acabando hoje, e as pessoas já sabem disso.",
    agora: "Agora ACONTECE: falta de verdade, e a falta escolhe primeiro quem já tinha menos.",
    depois: "Mostre o que a falta reorganizou: quem virou importante, quem foi embora, e o que virou moeda.",
  },
  {
    id: "praga", familia: "mundo", peso: 2,
    nome: "uma doença",
    quando: (s) => s.emCidade && s.momento >= 0.3,
    preparo: "Comece a preparar uma DOENÇA: uma tosse, uma febre, um caso só — tratado como caso isolado por quem entende.",
    subindo: "Deixa de ser um caso. Alguém competente admite que não sabe o que é, e as medidas começam.",
    vespera: "Fecharam a primeira casa, e há gente decidindo se fecha a segunda.",
    agora: "Agora ACONTECE: a doença passa do controle de quem cuidava dela, e a cidade tem de escolher o que sacrificar.",
    depois: "Mostre o que a doença deixou: quem cuidou de quem, quem fugiu, e a desconfiança que fica entre vizinhos.",
  },
  {
    id: "guerra_distante", familia: "mundo", peso: 3,
    nome: "uma guerra que se aproxima",
    quando: (s) => s.momento >= 0.35,
    preparo: "Comece a preparar uma GUERRA DISTANTE: notícia de longe, sem urgência, do tipo que as pessoas comentam e esquecem.",
    subindo: "A guerra encosta: passa gente fugindo dela, ou passa gente recrutando para ela.",
    vespera: "Dá para ouvir daqui, e a fumaça não vem de cozinha.",
    agora: "Agora ACONTECE: a guerra chega ao lugar onde eu estou, e ela não veio me buscar — eu é que estava no caminho.",
    depois: "Mostre o que a passagem da guerra fez: o que foi levado, quem ficou devendo a quem, e o que ninguém repõe.",
  },
  {
    id: "lei_nova", familia: "mundo", peso: 2,
    nome: "uma lei nova",
    quando: (s) => s.emCidade,
    preparo: "Comece a preparar uma LEI NOVA: mostre quem manda aqui incomodado com alguma coisa concreta e pequena.",
    subindo: "O incômodo vira regra: alguém é o primeiro a ser pego por ela, e o exemplo é público.",
    vespera: "O bando de guardas está fazendo a ronda desta rua agora.",
    agora: "Agora ACONTECE: a regra alcança a MIM ou a alguém de quem eu gosto, e cumpri-la custa alguma coisa real.",
    depois: "Mostre o que a lei criou sem querer: o contrabando, o favor, a fila, o jeitinho — e quem lucra com ele.",
  },
  {
    id: "descoberta_de_mapa", familia: "mundo", peso: 3,
    nome: "um caminho que ninguém usava",
    quando: (s) => s.emViagem || s.emCidade,
    preparo: "Comece a preparar uma DESCOBERTA DE CAMINHO: mostre alguém mencionando de passagem um lugar aonde não se vai mais, e o motivo banal de não se ir.",
    subindo: "Aparece uma razão concreta para ir: alguém foi, alguém precisa, ou o caminho de sempre fechou.",
    vespera: "A boca do caminho está ali, aberta, e ninguém vigia.",
    agora: "Agora ACONTECE: o caminho se abre de fato, e ele leva a alguma coisa que muda o tamanho do mundo conhecido.",
    depois: "Mostre o que a abertura mudou para os outros: quem passa a usar, quem perde com isso, e o que vem de volta por ali.",
  },
  {
    id: "festa", familia: "mundo", peso: 2,
    nome: "uma data que o lugar leva a sério",
    quando: (s) => s.emCidade,
    preparo: "Comece a preparar uma DATA: mostre a preparação dela sem explicar o que é — o que se limpa, o que se cozinha, quem chega de fora.",
    subindo: "A cidade muda de rotina por causa dela, e as regras normais ficam suspensas de um jeito específico.",
    vespera: "Começa ao pôr do sol, e todo mundo já está no lugar onde vai estar.",
    agora: "Agora ACONTECE: a data chega, e nela é possível o que não é possível nos outros dias.",
    depois: "Mostre a manhã seguinte: o que foi feito na véspera e não se desfaz, e quem passou a linha.",
  },

  /* ==================== A PERDA ==================== */
  {
    id: "divida_vence", familia: "perda", peso: 3,
    nome: "uma dívida que vence",
    quando: (s) => s.emCidade || s.temPromessa,
    preparo: "Comece a preparar uma DÍVIDA: estabeleça que alguém deve alguma coisa a alguém, com prazo, e que isso é normal aqui.",
    subindo: "O prazo aperta e o devedor começa a se mexer: vende o que não devia, pede o que não pode pagar, ou some.",
    vespera: "O prazo vence hoje, e o credor está sentado esperando à vista de todos.",
    agora: "Agora ACONTECE: a dívida vence e o credor cobra do jeito que este lugar permite cobrar.",
    depois: "Mostre o que a cobrança tirou e de quem: quase nunca de quem devia, quase sempre de quem estava por perto.",
  },
  {
    id: "casa_perdida", familia: "perda", peso: 3, precisa: "lugar",
    nome: "um lugar que deixa de ser meu",
    quando: (s) => s.momento >= 0.4,
    preparo: "Comece a preparar a PERDA DE UM LUGAR: mostre um lugar desta campanha funcionando bem, com gente dentro fazendo o de sempre.",
    subindo: "Aparece a ameaça àquele lugar, e ela é burocrática ou lenta — não dá para resolver com o corpo.",
    vespera: "O papel vai ser lido em voz alta amanhã cedo, e já está assinado.",
    agora: "Agora ACONTECE: o lugar deixa de ser acessível a mim, e a mudança é formal e definitiva.",
    depois: "Mostre onde foi parar quem estava lá dentro, e o que aquele lugar virou.",
  },
  {
    id: "morte_natural", familia: "perda", peso: 2, precisa: "gente",
    nome: "alguém morre sem violência",
    quando: (s) => s.emCidade && s.momento >= 0.45,
    preparo: "Comece a preparar uma MORTE SEM VIOLÊNCIA: mostre alguém velho ou doente desta campanha ainda em atividade, fazendo o que faz.",
    subindo: "Essa pessoa desacelera de um jeito que os outros já entenderam antes de mim.",
    vespera: "A pessoa mandou chamar quem ela quer ver, e eu estou na lista.",
    agora: "Agora ACONTECE: ela morre, e não há culpado, luta nem lição.",
    depois: "Mostre o vazio prático que ficou: o que ela sabia e ninguém mais sabe, e quem vai ter de aprender.",
  },
  {
    id: "reputacao", familia: "perda", peso: 3,
    nome: "meu nome vira outra coisa",
    quando: (s) => s.fama >= 25,
    preparo: "Comece a preparar uma VIRADA DE REPUTAÇÃO: mostre uma versão do que eu fiz circulando com um detalhe torto, dita por quem me acha ótimo.",
    subindo: "A versão torta cresce e passa a ser repetida por gente que não me conhece — e uma parte dela não é falsa.",
    vespera: "A versão torta acabou de chegar a quem tinha poder de agir sobre ela.",
    agora: "Agora ACONTECE: alguém age contra mim com base nessa versão, e age com razão do ponto de vista dela.",
    depois: "Mostre onde a versão nova pegou: que portas fecharam, quem passou a me olhar diferente, e o que eu não consigo mais desmentir.",
  },
  {
    id: "sacrificio_alheio", familia: "perda", peso: 3,
    nome: "alguém paga no meu lugar",
    quando: (s) => (s.temGrupo || s.temGenteConhecida) && s.momento >= 0.5,
    preparo: "Comece a preparar um SACRIFÍCIO ALHEIO: mostre alguém assumindo uma responsabilidade pequena que era minha, sem alarde.",
    subindo: "Essa responsabilidade cresce e a pessoa não devolve: ela decide que aquilo é dela agora.",
    vespera: "A pessoa está indo sozinha para o lugar onde a conta vai ser cobrada.",
    agora: "Agora ACONTECE: a conta chega, e é essa pessoa quem paga — não eu.",
    depois: "Mostre o que ficou entre nós dois depois: o que ela não cobra, e o que eu passo a dever sem ninguém ter dito.",
  },

  /* ==================== O PODER ==================== */
  {
    id: "tentacao", familia: "poder", peso: 3,
    nome: "um poder oferecido",
    quando: (s) => s.momento >= 0.35,
    preparo: "Comece a preparar uma OFERTA DE PODER: mostre que existe, neste mundo, uma coisa que dá vantagem real — e mostre alguém usando-a bem.",
    subindo: "Essa coisa fica ao meu alcance, e o preço dela aparece: não é impossível de pagar, e é isso que a torna tentadora.",
    vespera: "A coisa está ao alcance da minha mão, e não há ninguém olhando.",
    agora: "Agora ACONTECE: a oferta é feita a MIM, com o preço na mesa, e a palavra volta para mim.",
    depois: "Mostre o que a decisão fez comigo aos olhos dos outros — inclusive se eu recusei.",
  },
  {
    id: "responsabilidade", familia: "poder", peso: 3,
    nome: "gente esperando ordem",
    quando: (s) => s.nivel >= 5 && s.emCidade,
    preparo: "Comece a preparar uma RESPONSABILIDADE: mostre um grupo de pessoas com um problema comum e sem ninguém que resolva.",
    subindo: "Essas pessoas começam a me consultar em coisas pequenas, e a repetir o que eu digo como se fosse decisão.",
    vespera: "Todos pararam de falar e estão esperando eu dizer alguma coisa.",
    agora: "Agora ACONTECE: elas me pedem uma decisão que vai custar caro a alguém do próprio grupo.",
    depois: "Mostre o que a decisão fez com o grupo: quem obedeceu, quem saiu, e o que passou a ser esperado de mim.",
  },
  {
    id: "limite", familia: "poder", peso: 3,
    nome: "o limite do que eu sou",
    quando: (s) => s.pvBaixo || s.momento >= 0.6,
    preparo: "Comece a preparar um LIMITE: mostre uma tarefa do tipo que eu resolvo bem, e mostre alguém competente falhando nela.",
    subindo: "A mesma espécie de tarefa aparece maior, e o que costumava bastar visivelmente não basta mais.",
    vespera: "A coisa está do outro lado da porta, e do tamanho que era.",
    agora: "Agora ACONTECE: eu encaro a coisa no tamanho dela, e ela é maior do que eu sozinho.",
    depois: "Mostre o que eu precisei pedir, e a quem — e o que pedir custou.",
  },
  {
    id: "sucessao", familia: "poder", peso: 2,
    nome: "quem fica no lugar de quem manda",
    quando: (s) => s.emCidade && s.momento >= 0.45,
    preparo: "Comece a preparar uma SUCESSÃO: mostre quem manda neste lugar em atividade, e mostre que essa pessoa não é eterna.",
    subindo: "Começa a disputa por baixo: alianças pequenas, favores adiantados, gente sondando de que lado eu estou.",
    vespera: "Quem mandava não aparece há dois dias, e os outros já perceberam.",
    agora: "Agora ACONTECE: o lugar de quem mandava fica vago, e a disputa vem à luz.",
    depois: "Mostre com quem ficou, e o que a nova mão muda no dia a dia de quem mora aqui.",
  },
];

export function assuntoPorId(id) { return ASSUNTOS.find((a) => a.id === id) || null; }
