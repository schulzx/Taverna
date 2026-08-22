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

/* ---------------- A RÉGUA DO PORTE (v9.93) ----------------
   Um cerco precisa de portão, uma revolta precisa de multidão e uma lei
   nova precisa de quem a assine. Sem esta régua, os três podiam germinar
   numa aldeia de cinquenta almas — e o Mestre pediria ao narrador uma
   cena que o lugar não comporta, que é a forma mais silenciosa de pedir
   invenção: a IA não tem como recusar, então ela inventa o portão.

   A ordem é a de `PORTES` em geografia.js. `ruina` e `fortaleza` ficam
   de fora da escada de propósito: a primeira não tem ninguém, e a segunda
   é pequena em gente e enorme em muro — ela entra por nome onde faz
   sentido, não por tamanho. */
const ESCADA = ["aldeia", "vila", "cidade", "capital", "metropole"];
const portePeloMenos = (s, min) => {
  const i = ESCADA.indexOf(String(s.porte || ""));
  /* porte desconhecido NÃO passa: num save antigo ou numa cena fora de
     cidade, afirmar que há portão é justamente o que se quer evitar */
  return i >= 0 && i >= ESCADA.indexOf(min);
};

/* ---------------- A RÉGUA DO CHÃO (v9.94) ----------------
   Oito biomas em geografia.js, e até aqui nenhum assunto perguntava por
   eles. Um pântano tem histórias que um deserto não tem — a febre, o que
   afunda, o guia que cobra caro —, e escrevê-las genéricas era desperdiçar
   a metade do mundo que o gerador já produz.

   `bioma` foi REMOVIDO da situação na v9.93 por ter nascido sem leitor, e
   volta agora pela porta certa: com regras que o consultam. É assim que um
   campo entra aqui — quando alguém precisa dele, nunca por completude. */
const chao = (s, ...quais) => quais.includes(String(s.bioma || ""));

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
    quando: (s) => s.emCidade && s.momento >= 0.35 && portePeloMenos(s, "vila"),
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
    quando: (s) => s.emCidade && s.momento >= 0.4 && portePeloMenos(s, "vila"),
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
    quando: (s) => s.emCidade && s.momento >= 0.3 && s.genteLonge > 0,
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
    quando: (s) => (s.temGrupo || s.gentePorPerto > 0) && s.momento >= 0.5,
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
    quando: (s) => s.emCidade && portePeloMenos(s, "vila"),
    preparo: "Comece a preparar uma ESCASSEZ: mostre alguma coisa deste lugar dependendo de UMA fonte — água, sal, ferro, remédio, uma estrada.",
    subindo: "A fonte falha ou encarece, e as pessoas começam a se comportar de forma diferente por causa disso.",
    vespera: "Está acabando hoje, e as pessoas já sabem disso.",
    agora: "Agora ACONTECE: falta de verdade, e a falta escolhe primeiro quem já tinha menos.",
    depois: "Mostre o que a falta reorganizou: quem virou importante, quem foi embora, e o que virou moeda.",
  },
  {
    id: "praga", familia: "mundo", peso: 2,
    nome: "uma doença",
    quando: (s) => s.emCidade && s.momento >= 0.3 && portePeloMenos(s, "vila"),
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
    quando: (s) => s.emCidade && portePeloMenos(s, "cidade"),
    preparo: "Comece a preparar uma LEI NOVA: mostre quem manda aqui incomodado com alguma coisa concreta e pequena.",
    subindo: "O incômodo vira regra: alguém é o primeiro a ser pego por ela, e o exemplo é público.",
    vespera: "O bando de guardas está fazendo a ronda desta rua agora.",
    agora: "Agora ACONTECE: a regra alcança a MIM ou a alguém de quem eu gosto, e cumpri-la custa alguma coisa real.",
    depois: "Mostre o que a lei criou sem querer: o contrabando, o favor, a fila, o jeitinho — e quem lucra com ele.",
  },
  {
    id: "descoberta_de_mapa", familia: "mundo", peso: 3,
    nome: "um caminho que ninguém usava",
    quando: (s) => (s.emViagem || s.emCidade) && s.diasAteVizinha > 0,
    preparo: "Comece a preparar uma DESCOBERTA DE CAMINHO: mostre alguém mencionando de passagem um lugar aonde não se vai mais, e o motivo banal de não se ir.",
    subindo: "Aparece uma razão concreta para ir: alguém foi, alguém precisa, ou o caminho de sempre fechou.",
    vespera: "A boca do caminho está ali, aberta, e ninguém vigia.",
    agora: "Agora ACONTECE: o caminho se abre de fato, e ele leva a alguma coisa que muda o tamanho do mundo conhecido.",
    depois: "Mostre o que a abertura mudou para os outros: quem passa a usar, quem perde com isso, e o que vem de volta por ali.",
  },
  {
    id: "festa", familia: "mundo", peso: 2,
    nome: "uma data que o lugar leva a sério",
    quando: (s) => s.emCidade && portePeloMenos(s, "vila"),
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
    quando: (s) => s.emCidade && s.momento >= 0.45 && portePeloMenos(s, "cidade"),
    preparo: "Comece a preparar uma SUCESSÃO: mostre quem manda neste lugar em atividade, e mostre que essa pessoa não é eterna.",
    subindo: "Começa a disputa por baixo: alianças pequenas, favores adiantados, gente sondando de que lado eu estou.",
    vespera: "Quem mandava não aparece há dois dias, e os outros já perceberam.",
    agora: "Agora ACONTECE: o lugar de quem mandava fica vago, e a disputa vem à luz.",
    depois: "Mostre com quem ficou, e o que a nova mão muda no dia a dia de quem mora aqui.",
  },

  /* ==================== A CORTE (capital e metrópole) ====================
     Uma corte tem histórias que um burgo não tem, e a régua do porte as
     tratava igual: tudo de "cidade" para cima abria as mesmas coisas. O
     que muda numa capital não é o tamanho — é que existe um LUGAR onde as
     decisões são tomadas, e gente cuja vida inteira é chegar perto dele. */
  {
    id: "audiencia", familia: "poder", peso: 3,
    nome: "uma audiência que eu consegui",
    quando: (s) => s.emCidade && portePeloMenos(s, "capital"),
    preparo: "Comece a preparar uma AUDIÊNCIA: mostre a máquina de quem manda — a antessala, a fila, quem decide quem entra, e o que custa furá-la.",
    subindo: "Meu nome entra na lista por um caminho torto, e alguém que também esperava perde o lugar por minha causa.",
    vespera: "É amanhã de manhã, e um secretário já me disse quanto tempo eu tenho.",
    agora: "Agora ACONTECE: eu entro, e a pessoa do outro lado tem menos tempo e mais poder do que eu esperava.",
    depois: "Mostre o que a audiência mudou no meu trânsito por este lugar: que portas se abriram, e quem passou a me achar perigoso por causa disso.",
  },
  {
    id: "intriga_de_corte", familia: "laco", peso: 3,
    nome: "uma intriga de corte",
    quando: (s) => s.emCidade && portePeloMenos(s, "capital") && s.pessoaNaCena,
    preparo: "Comece a preparar uma INTRIGA: mostre duas facções de corte se tratando com cortesia perfeita, e mostre uma delas me sendo simpática de graça.",
    subindo: "A simpatia vira convite, o convite vira pedido pequeno, e recusar já começa a ter custo.",
    vespera: "Os dois lados me procuraram no mesmo dia, e cada um acha que eu já escolhi.",
    agora: "Agora ACONTECE: os dois lados chocam em público e o que eu fiz — ou não fiz — aparece como prova.",
    depois: "Mostre de que lado a corte decidiu que eu estou, independentemente do que eu queria.",
  },
  {
    id: "julgamento", familia: "mundo", peso: 3,
    nome: "um julgamento público",
    quando: (s) => s.emCidade && portePeloMenos(s, "capital"),
    preparo: "Comece a preparar um JULGAMENTO: mostre uma acusação circulando, com as duas versões vivas e nenhuma prova ainda.",
    subindo: "A data é marcada e as pessoas começam a se posicionar — inclusive gente que eu conheço, e nem sempre do lado que eu esperava.",
    vespera: "É de manhã na praça, e já há gente escolhendo lugar para ver.",
    agora: "Agora ACONTECE: o julgamento corre à vista de todos, e o que decide não é a verdade.",
    depois: "Mostre o que a sentença fez com a cidade: quem comemora, quem some, e o que passa a ser dito em voz baixa.",
  },
  {
    id: "embaixada", familia: "mundo", peso: 2,
    nome: "gente de fora com poder",
    quando: (s) => s.emCidade && portePeloMenos(s, "capital"),
    preparo: "Comece a preparar uma EMBAIXADA: mostre a cidade se arrumando para receber gente de longe — o que se esconde, o que se pinta, quem é mandado embora antes.",
    subindo: "Os visitantes chegam e trazem costumes que aqui ofendem, e ninguém pode dizer nada.",
    vespera: "O banquete é hoje, e alguém já avisou que vai haver um pedido na mesa.",
    agora: "Agora ACONTECE: o que os de fora vieram buscar fica claro, e é maior do que a hospitalidade alcança.",
    depois: "Mostre o que ficou do encontro: o que foi prometido em nome de quem, e quem paga por isso.",
  },
  {
    id: "guilda_em_guerra", familia: "poder", peso: 3,
    nome: "duas guildas disputando",
    quando: (s) => s.emCidade && portePeloMenos(s, "cidade"),
    preparo: "Comece a preparar uma DISPUTA DE GUILDAS: mostre dois ofícios da cidade dependendo da mesma coisa — uma rota, uma matéria, um privilégio.",
    subindo: "A disputa sai do papel: entregas atrasam, gente é intimidada, e os dois lados procuram quem tenha mão pesada.",
    vespera: "Os dois lados marcaram assembleia para a mesma hora, e ninguém pretende ceder.",
    agora: "Agora ACONTECE: a disputa quebra em público, e a cidade tem de escolher a quem obedecer.",
    depois: "Mostre o preço que a cidade paga pela vitória de um dos dois: o que encareceu, o que sumiu, quem ficou sem ofício.",
  },

  /* ==================== O CHÃO (o bioma como assunto) ====================
     Oito biomas no gerador, e nenhum assunto perguntava por eles. Um
     pântano tem histórias que um deserto não tem, e escrevê-las genéricas
     era desperdiçar metade do mundo que o sistema já produz. */
  {
    id: "sede", familia: "mundo", peso: 4,
    nome: "a água acabando",
    quando: (s) => chao(s, "deserto"),
    preparo: "Comece a preparar a SEDE: mostre como a água funciona aqui — quem a guarda, quanto vale, e o que as pessoas fazem para não desperdiçar uma gota.",
    subindo: "Um ponto de água falha ou é tomado, e as contas de todo mundo mudam ao mesmo tempo.",
    vespera: "O que resta dá para hoje, e a próxima fonte fica a mais de um dia daqui.",
    agora: "Agora ACONTECE: falta água de verdade, e as pessoas param de ser razoáveis.",
    depois: "Mostre o que a sede fez com as regras deste lugar: o que passou a ser permitido, e o que ninguém mais faz de graça.",
  },
  {
    id: "tempestade_de_areia", familia: "mundo", peso: 3,
    nome: "a tempestade que apaga o caminho",
    quando: (s) => chao(s, "deserto"),
    preparo: "Comece a preparar uma TEMPESTADE: mostre quem lê o céu daqui e o que essa pessoa começa a fazer sem explicar.",
    subindo: "O ar muda de cor e de gosto, e quem sabe ler já está procurando abrigo em vez de terminar o serviço.",
    vespera: "Está vindo, dá para ver a parede dela na linha do horizonte, e o abrigo mais perto tem dono.",
    agora: "Agora ACONTECE: a tempestade chega e o mundo encolhe ao tamanho de um braço.",
    depois: "Mostre o que a areia cobriu e o que ela DESCOBRIU: o caminho sumiu, e alguma coisa que estava enterrada não está mais.",
  },
  {
    id: "degelo", familia: "mundo", peso: 3,
    nome: "o que o gelo guardava",
    quando: (s) => chao(s, "gelo", "montanha"),
    preparo: "Comece a preparar o DEGELO: mostre o gelo daqui como coisa viva — o que ele range, o que ele empurra, o que as pessoas evitam pisar.",
    subindo: "Alguma coisa aparece na borda do gelo que não devia estar ali, e quem mora aqui reconhece o que é.",
    vespera: "A rachadura cresceu de novo esta manhã, e dá para ver alguma coisa escura embaixo.",
    agora: "Agora ACONTECE: o gelo cede e entrega o que estava guardando, inteiro.",
    depois: "Mostre o que fazer com o que apareceu: quem o reclama, quem quer que volte para baixo, e o que ele muda do que se contava aqui.",
  },
  {
    id: "frio_que_mata", familia: "perda", peso: 3,
    nome: "o frio cobrando",
    quando: (s) => chao(s, "gelo"),
    preparo: "Comece a preparar o FRIO: mostre a rotina inteira deste lugar organizada em torno de não morrer congelado — a lenha, as horas, quem dorme com quem.",
    subindo: "Uma peça dessa rotina falha: falta lenha, alguém não volta na hora, um abrigo se perde.",
    vespera: "A noite vem em duas horas e não há lenha para as duas.",
    agora: "Agora ACONTECE: o frio alcança alguém, e é preciso decidir depressa quem entra no calor.",
    depois: "Mostre o que o frio levou e o que sobrou de rancor entre quem escolheu e quem foi escolhido.",
  },
  {
    id: "febre_do_pantano", familia: "perda", peso: 3,
    nome: "a febre que vem da água parada",
    quando: (s) => chao(s, "pantano"),
    preparo: "Comece a preparar a FEBRE: mostre que aqui todo mundo convive com ela — quem já teve, o que se toma, o que se evita fazer ao anoitecer.",
    subindo: "Alguém pega, e não é do jeito de sempre: mais rápido, ou fora da época.",
    vespera: "A pessoa piorou durante a noite e o remédio daqui já não está fazendo efeito.",
    agora: "Agora ACONTECE: a febre vira coisa séria, e o que cura está longe ou tem dono.",
    depois: "Mostre o que a febre deixou: quem cuidou de quem, o que foi queimado, e de quem os outros passaram a desconfiar.",
  },
  {
    id: "o_que_afunda", familia: "enigma", peso: 3,
    nome: "o que o pântano engoliu",
    quando: (s) => chao(s, "pantano"),
    preparo: "Comece a preparar um ACHADO NA LAMA: mostre que aqui as coisas somem para baixo e às vezes voltam — e mostre uma que voltou, sem importância.",
    subindo: "Volta uma segunda coisa, e essa tem dono conhecido.",
    vespera: "O nível baixou, e dá para ver a forma de alguma coisa grande onde não devia haver nada.",
    agora: "Agora ACONTECE: o que estava afundado aparece, e explica um sumiço que ninguém tinha ligado a ele.",
    depois: "Mostre quem preferia que aquilo continuasse embaixo, e o que essa pessoa faz agora.",
  },
  {
    id: "mata_que_olha", familia: "enigma", peso: 3,
    nome: "a mata reparando em mim",
    quando: (s) => chao(s, "floresta"),
    preparo: "Comece a preparar a MATA: mostre as regras que quem vive aqui cumpre sem discutir — o que não se corta, por onde não se anda, o que se deixa na entrada.",
    subindo: "Uma dessas regras é quebrada por alguém, e a mata responde de um jeito pequeno e específico.",
    vespera: "Os sons noturnos pararam todos ao mesmo tempo, e faz uma hora que não voltam.",
    agora: "Agora ACONTECE: a mata cobra a regra quebrada, e cobra de quem estiver por perto.",
    depois: "Mostre como o lugar volta ao normal — e o que as pessoas passam a deixar na entrada agora.",
  },
  {
    id: "fogo_na_mata", familia: "mundo", peso: 2,
    nome: "um incêndio",
    quando: (s) => chao(s, "floresta", "planicie"),
    preparo: "Comece a preparar um INCÊNDIO: mostre o quanto está seco, e mostre alguém usando fogo por um motivo perfeitamente comum.",
    subindo: "Há cheiro de queimado vindo da direção errada, e ninguém sabe de quem é.",
    vespera: "Dá para ver a linha de fumaça daqui, e o vento virou para cá.",
    agora: "Agora ACONTECE: o fogo chega ao que importa, e todo mundo larga o que estava fazendo.",
    depois: "Mostre o que queimou e o que o fogo abriu: o que dá para ver agora que a mata escondia.",
  },
  {
    id: "o_passo", familia: "mundo", peso: 3,
    nome: "o passo que fecha",
    quando: (s) => chao(s, "montanha", "colina"),
    preparo: "Comece a preparar O PASSO: mostre que tudo aqui depende de uma passagem só, e mostre a rotina de quem vive de atravessá-la.",
    subindo: "A passagem fica pior: uma pedra caiu, um trecho cedeu, e quem atravessa passa a cobrar mais.",
    vespera: "Dizem que fecha com a próxima chuva, e a próxima chuva vem hoje.",
    agora: "Agora ACONTECE: o passo fecha, e quem está de cada lado fica de cada lado.",
    depois: "Mostre o que o fechamento fez com os dois lados: o que encareceu, quem ficou separado de quem, e quem lucra com a volta longa.",
  },
  {
    id: "mare", familia: "mundo", peso: 3,
    nome: "a maré decidindo",
    quando: (s) => chao(s, "costa"),
    preparo: "Comece a preparar a MARÉ: mostre a vida daqui acertada por ela — as horas de sair, as de voltar, o que fica exposto e o que some.",
    subindo: "A maré vira o problema de alguém: um barco fora de hora, um caminho que só existe metade do dia, alguém que não voltou.",
    vespera: "A água começa a subir e falta menos de uma hora para cobrir o caminho.",
    agora: "Agora ACONTECE: a maré cobra a hora de quem não a respeitou.",
    depois: "Mostre o que a maré trouxe e o que ela levou, e quem já está na praia recolhendo.",
  },
  {
    id: "o_que_deu_a_praia", familia: "enigma", peso: 3,
    nome: "o que veio dar na praia",
    quando: (s) => chao(s, "costa"),
    preparo: "Comece a preparar um NAUFRÁGIO DE LONGE: mostre a praia daqui e o que costuma chegar nela, e quem tem direito ao que chega.",
    subindo: "Chega uma coisa que não é do costume, e a regra de quem fica com o quê não prevê esse caso.",
    vespera: "Está encalhado desde a maré da manhã, e já tem gente em volta.",
    agora: "Agora ACONTECE: o que veio do mar se revela — e não veio sozinho, ou não veio por acaso.",
    depois: "Mostre o que a costa faz com o achado: quem o divide, quem o esconde, e o que passa a ser esperado do mar.",
  },
  {
    id: "o_que_vem_de_longe", familia: "mundo", peso: 3,
    nome: "o que se vê chegando com um dia de antecedência",
    quando: (s) => chao(s, "planicie"),
    preparo: "Comece a preparar uma CHEGADA VISÍVEL: mostre que daqui se enxerga longe, e mostre alguém que passa o dia olhando o horizonte porque é o ofício dele.",
    subindo: "Aparece poeira na linha do horizonte, e ela não some — está vindo, e vai levar o dia inteiro para chegar.",
    vespera: "Dá para contar quantos são, e já dá para ver o que eles carregam.",
    agora: "Agora ACONTECE: o que vinha chega, e chega exatamente como se via de longe — o campo aberto não mente.",
    depois: "Mostre o que ficou de quem passou: o que foi comido, o que foi levado, e o rastro que leva para onde eles foram.",
  },
  {
    id: "colheita", familia: "mundo", peso: 3,
    nome: "a colheita",
    quando: (s) => chao(s, "planicie", "colina"),
    preparo: "Comece a preparar a COLHEITA: mostre o ano inteiro deste lugar dependendo dela — quem plantou o quê, quem deve a quem, o que já foi vendido antes de existir.",
    subindo: "Alguma coisa ameaça a colheita — tempo, praga, gente, prazo — e falta pouco para o ponto de colher.",
    vespera: "É preciso colher amanhã, e não há braços para tudo.",
    agora: "Agora ACONTECE: a colheita se decide num dia, e o que sobra é o que vai dar o ano.",
    depois: "Mostre o ano que essa colheita comprou ou tirou: quem passa fome, quem enriquece, e quem vai embora.",
  },
  {
    id: "atras_da_lomba", familia: "enigma", peso: 3,
    nome: "o que estava do outro lado",
    quando: (s) => chao(s, "colina"),
    preparo: "Comece a preparar O OUTRO LADO: mostre como se anda aqui — sempre subindo e descendo, sempre sem ver o que vem depois da próxima lomba.",
    subindo: "Chega sinal do outro lado sem que se veja o outro lado: fumaça, som, gado solto, gente descendo com pressa.",
    vespera: "Falta uma subida, e de cima dá para ver tudo de uma vez.",
    agora: "Agora ACONTECE: chego ao alto e o outro lado se mostra inteiro, de uma vez, e já estava assim há dias.",
    depois: "Mostre o que muda por eu ter visto: quem mais sabe, quem vai perguntar, e o que já não dá para fingir que não existe.",
  },

  /* ==================== OS LAÇOS, EM MUITAS FORMAS ====================
     O romance da v9.91 era um só — a convivência, o interesse, a
     declaração — e saía igual em toda campanha. Estas são formas
     distintas, não a mesma cena com outra luz: mudam a semente, a véspera
     e sobretudo o PREÇO. As mais duras pedem `momento` adiantado, porque
     um amor que custa caro precisa de campanha por baixo para custar. */
  {
    id: "paixao_subita", familia: "laco", peso: 3,
    nome: "uma paixão imprudente",
    quando: (s) => s.pessoaNaCena || s.emCidade,
    preparo: "Comece a preparar uma PAIXÃO SÚBITA: ponha alguém na cena fazendo uma coisa difícil muito bem, e deixe eu ver isso de perto. Sem apresentação e sem conversa.",
    subindo: "Nós dois arranjamos motivo para estar no mesmo lugar duas vezes no mesmo dia, e os dois sabemos que o motivo é ruim.",
    vespera: "Estamos sozinhos e nenhum dos dois inventou desculpa desta vez.",
    agora: "Agora ACONTECE: acontece rápido, e sem nenhum dos dois ter pensado direito.",
    depois: "Mostre a manhã seguinte pelo lado prático: o que ficou combinado sem ser dito, quem viu, e o que essa pressa vai custar a um dos dois.",
  },
  {
    id: "amor_proibido", familia: "laco", peso: 3,
    nome: "um amor do lado errado",
    quando: (s) => s.emCidade && s.momento >= 0.35,
    preparo: "Comece a preparar um AMOR DO LADO ERRADO: estabeleça bem as duas partes que aqui não se misturam — famílias, ofícios, fés, facções — e por que essa regra existe.",
    subindo: "Alguém de um lado e alguém do outro passam a se procurar, e os dois sabem exatamente o tamanho do problema.",
    vespera: "Alguém desconfiou e está esperando confirmação.",
    agora: "Agora ACONTECE: a coisa fica sabida, e as duas partes reagem conforme a regra que elas mesmas criaram.",
    depois: "Mostre o preço em quem NÃO estava apaixonado: as famílias, os aliados, quem fica sem falar com quem.",
  },
  {
    id: "amor_antigo", familia: "laco", peso: 3, precisa: "gente",
    nome: "alguém que eu já amei",
    quando: (s) => s.emCidade && s.momento >= 0.4 && s.genteLonge > 0,
    preparo: "Comece a preparar um AMOR ANTIGO: deixe cair uma referência a uma coisa que eu vivi com alguém desta campanha, dita por terceiros, sem drama.",
    subindo: "Essa pessoa está por perto e a vida dela seguiu — há outra pessoa, outro ofício, outra cidade.",
    vespera: "Nós dois vamos estar no mesmo lugar hoje, e os dois já sabemos.",
    agora: "Agora ACONTECE: nos encontramos, e nenhum dos dois é quem era.",
    depois: "Mostre o que sobrou depois: o que foi possível dizer, o que não coube, e o que cada um leva de volta para a própria vida.",
  },
  {
    id: "quem_me_quer", familia: "laco", peso: 3,
    nome: "alguém me quer e eu não",
    quando: (s) => s.pessoaNaCena || s.emCidade,
    preparo: "Comece a preparar uma AFEIÇÃO DESIGUAL: mostre alguém sendo útil a mim com uma frequência que ninguém pediu, e sendo boa gente de verdade.",
    subindo: "Essa pessoa começa a organizar a própria vida em torno da minha, e os outros já perceberam antes de mim.",
    vespera: "Ela vai dizer hoje: dá para ver que já ensaiou.",
    agora: "Agora ACONTECE: ela diz, e a palavra volta para mim.",
    depois: "Mostre o que a resposta fez com ela e com quem estava olhando — e deixe a pessoa continuar existindo aqui depois disso.",
  },
  {
    id: "triangulo", familia: "laco", peso: 2,
    nome: "outro quer a mesma pessoa",
    quando: (s) => s.emCidade && s.momento >= 0.3 && s.pessoaNaCena,
    preparo: "Comece a preparar um TRIÂNGULO: mostre duas pessoas que se interessam pela mesma terceira, e mostre as duas sendo dignas disso.",
    subindo: "A disputa fica visível para todo mundo menos para quem é disputado, e alguém tenta me pôr no meio.",
    vespera: "Os três vão estar na mesma mesa hoje à noite.",
    agora: "Agora ACONTECE: a terceira pessoa escolhe, e escolhe por um motivo que nenhum dos dois tinha previsto.",
    depois: "Mostre o que aconteceu com quem não foi escolhido — e não faça essa pessoa virar inimiga por isso.",
  },
  {
    id: "casamento_arranjado", familia: "laco", peso: 3,
    nome: "um casamento que é um contrato",
    quando: (s) => s.emCidade && portePeloMenos(s, "cidade") && s.momento >= 0.35,
    preparo: "Comece a preparar um CASAMENTO ARRANJADO: mostre duas casas com um problema comum que um casamento resolveria, e mostre os dois jovens sem opinião nenhuma no assunto.",
    subindo: "O acordo avança nas mãos dos velhos, e um dos dois jovens começa a procurar quem o escute.",
    vespera: "Assinam amanhã, e hoje à noite alguém vem falar comigo.",
    agora: "Agora ACONTECE: o acordo se cumpre ou se rompe na frente de todos, e o custo cai sobre quem tinha menos poder.",
    depois: "Mostre o que as duas casas ganharam e o que os dois jovens perderam — e o que passa a ser dito sobre mim por causa do meu papel nisso.",
  },
  {
    id: "refem_hospede", familia: "laco", peso: 2,
    nome: "um hóspede que não pode ir embora",
    quando: (s) => s.emCidade && portePeloMenos(s, "capital"),
    preparo: "Comece a preparar um REFÉM-HÓSPEDE: mostre alguém sendo tratado com honras excessivas neste lugar, e mostre que essa pessoa não sai sozinha.",
    subindo: "Fica claro de quem essa pessoa é a garantia, e o que acontece com ela se os de fora quebrarem o acordo.",
    vespera: "Chegou notícia de que o acordo foi quebrado lá longe.",
    agora: "Agora ACONTECE: a garantia é cobrada, e o hóspede deixa de ser hóspede à vista de todos.",
    depois: "Mostre quem defendeu a pessoa e quem achou justo — e o que isso ensina sobre este lugar.",
  },
  {
    id: "afilhado", familia: "laco", peso: 3,
    nome: "alguém poderoso me adota",
    quando: (s) => s.emCidade && portePeloMenos(s, "cidade") && s.fama >= 25,
    preparo: "Comece a preparar um PADRINHO: mostre alguém com poder reparando no que eu faço, e comentando com terceiros — nunca comigo.",
    subindo: "Começam a chegar facilidades que eu não pedi: uma porta aberta, um preço melhor, um problema que sumiu sozinho.",
    vespera: "A pessoa me manda chamar, e o recado é gentil demais para ser recusável.",
    agora: "Agora ACONTECE: ela diz o que espera de mim em troca do que já me deu.",
    depois: "Mostre como os outros passam a me tratar por eu ser de alguém — inclusive quem gostava de mim antes.",
  },
  {
    id: "mestre_e_aprendiz", familia: "laco", peso: 3,
    nome: "alguém quer aprender comigo",
    quando: (s) => s.nivel >= 5 && (s.pessoaNaCena || s.emCidade),
    preparo: "Comece a preparar um APRENDIZ: ponha alguém jovem por perto observando o que eu faço, sem falar comigo e sem atrapalhar.",
    subindo: "Essa pessoa começa a imitar o que eu faço — mal, e em situações onde imitar é perigoso.",
    vespera: "Ela vai fazer sozinha hoje, e não me avisou.",
    agora: "Agora ACONTECE: ela tenta, e o resultado é dela — bom ou ruim.",
    depois: "Mostre o que fica entre nós dois depois: o que ela aprendeu de fato, e o que ela aprendeu que eu não queria ensinar.",
  },
  {
    id: "inimigo_util", familia: "laco", peso: 3,
    nome: "um inimigo que preciso ao meu lado",
    quando: (s) => s.momento >= 0.45 && (s.temDerrotado || s.ordemDaFase >= 2),
    preparo: "Comece a preparar uma ALIANÇA INCÔMODA: mostre alguém que tem motivo real para me querer mal, e mostre essa pessoa sendo competente naquilo que ela faz.",
    subindo: "Aparece um problema que só se resolve com o que essa pessoa sabe, e os dois percebemos ao mesmo tempo.",
    vespera: "Nós dois estamos na mesma sala, e nenhum dos dois vai pedir primeiro.",
    agora: "Agora ACONTECE: trabalhamos juntos, e funciona — o que é pior do que se não funcionasse.",
    depois: "Mostre o que essa aliança custou à minha reputação e à dela, e o que continua exatamente igual entre nós.",
  },

  /* ============ ONDE O CHÃO ENCONTRA O TAMANHO ============
     Uma capital no gelo e uma aldeia no gelo abriam os mesmos assuntos de
     chão, e não são a mesma coisa: um povoado sobrevive ao lugar, uma
     cidade DEPENDE dele em escala — e essa dependência é política. */
  {
    id: "porto", familia: "mundo", peso: 3,
    nome: "o porto e o que ele traz",
    quando: (s) => chao(s, "costa") && portePeloMenos(s, "cidade"),
    preparo: "Comece a preparar o PORTO: mostre este lugar vivendo do que atraca — quem descarrega, quem cobra, quem espera notícia de um barco.",
    subindo: "Um barco esperado não chega, ou chega errado, e a cadeia inteira sente em um dia.",
    vespera: "A doca está parada e há gente demais nela sem ter o que fazer.",
    agora: "Agora ACONTECE: o que o porto trouxe — ou deixou de trazer — vira o assunto de todo mundo ao mesmo tempo.",
    depois: "Mostre o que o porto reorganizou: quem ficou sem trabalho, o que encareceu, e que rota passou a ser tentada por desespero.",
  },
  {
    id: "oasis", familia: "poder", peso: 3,
    nome: "quem manda na água",
    quando: (s) => chao(s, "deserto") && portePeloMenos(s, "vila"),
    preparo: "Comece a preparar a POLÍTICA DA ÁGUA: mostre que este lugar só existe por causa de uma fonte, e mostre quem administra o acesso a ela.",
    subindo: "Uma decisão sobre a água é tomada e prejudica um grupo inteiro, com toda a justificativa do mundo.",
    vespera: "O grupo prejudicado se reuniu, e a guarda da fonte foi dobrada.",
    agora: "Agora ACONTECE: a disputa pela fonte quebra, e quem controla a água controla tudo o mais.",
    depois: "Mostre a nova regra da água e quem ficou de fora dela.",
  },
  {
    id: "cidade_alimentada", familia: "mundo", peso: 3,
    nome: "uma cidade que come de fora",
    quando: (s) => chao(s, "gelo", "montanha", "deserto") && portePeloMenos(s, "cidade"),
    preparo: "Comece a preparar a DEPENDÊNCIA: mostre que este lugar não produz o que come, e mostre a linha por onde a comida chega.",
    subindo: "A linha atrasa. As primeiras medidas são administrativas e todo mundo finge que é normal.",
    vespera: "As reservas foram contadas em público e o número não é bom.",
    agora: "Agora ACONTECE: falta na cidade inteira ao mesmo tempo, e o tamanho dela vira o problema.",
    depois: "Mostre o que uma cidade grande faz quando tem fome: quem sai, quem é culpado, e a que preço a linha volta.",
  },
  {
    id: "entreposto", familia: "mundo", peso: 2,
    nome: "a vila que vive do pedágio",
    quando: (s) => chao(s, "montanha", "colina") && portePeloMenos(s, "vila") && s.diasAteVizinha > 0,
    preparo: "Comece a preparar o ENTREPOSTO: mostre este lugar existindo porque todo mundo tem de passar por aqui, e mostre o que se cobra por isso.",
    subindo: "Alguém encontra um jeito de não passar aqui, e a notícia se espalha entre os que pagam.",
    vespera: "A primeira caravana grande escolheu a outra rota, e dá para ver a poeira dela ao longe.",
    agora: "Agora ACONTECE: o desvio se confirma, e este lugar descobre o que é sem o pedágio.",
    depois: "Mostre o que a vila decide fazer para não morrer: baixar o preço, fechar o desvio à força, ou virar outra coisa.",
  },
];

export function assuntoPorId(id) { return ASSUNTOS.find((a) => a.id === id) || null; }
