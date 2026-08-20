/* ============================================================
   A ESTANTE (v9.86) — o acervo

   O motor da consulta mora em biblioteca.js. Aqui mora só o ACERVO, e
   ele é grande de propósito: a razão de o Bibliotecário existir é que
   uma forma repetida vira tique, e um repertório pequeno repete por
   aritmética, não por descuido. Com trinta e sete formas e uma janela de
   seis, a nona cena já era uma repetição inevitável.

   ---------------- O QUE CADA ENTRADA É ----------------

   Uma FORMA: o formato de como uma coisa que já existe no jogo chega à
   mesa. Nunca um acontecimento — o conteúdo continua vindo do relógio,
   da promessa, do vilão, e a ficção continua sendo escrita pela IA.

     `quando`  — a condição de estado que a abre. É o que faz disto uma
                 consulta de mestre e não uma tabela de sorteio.
     `forma`   — a instrução que viaja no envelope, curta de propósito.
     `evite`   — o modo de falhar específico DESTA forma. Toda forma tem
                 um jeito de sair errada, e é sempre o mesmo.
     `serve`   — o pilar que ela alimenta, para o holofote poder pedi-la.
     `peso`    — quanto ela concorre quando várias estão abertas.
     `sozinha` — se ela funciona SEM um fio atrás. As que têm isto podem
                 entrar num turno comum, onde não há nada chegando: elas
                 moldam a cena em vez de moldar a entrega de outra coisa.
                 É a diferença entre "faça o relógio chegar por um
                 mensageiro" e "esta cena tem uma regra que ninguém
                 explica".
     `precisa` — "gente" ou "passado", quando a forma exige que exista
                 histórico. Sem isto, o `evite` tinha de mandar a IA
                 escolher outra forma — e delegar à IA a pergunta "existe
                 passado nesta campanha?" é justamente o que esta casa
                 não faz: quem sabe é o sistema.

   ---------------- DE ONDE SAI ----------------

   Do ofício documentado das mesas estudadas aqui e da estrutura das
   grandes histórias — épicos de estrada, séries longas de formação,
   campanhas gravadas, mistérios, ascensões solitárias, tragédias, contos
   de fantasmas, romances de guerra. NÃO há citação nem trecho de
   nenhuma, e não poderia haver: o que serve a um programa não é o texto,
   é a estrutura — a única parte que funciona numa história que ainda não
   foi escrita.
   ============================================================ */

export const ESCOLAS = [
  { id: "saga", nome: "a saga longa", da: "o épico de estrada: o mundo é grande, a viagem cobra, e a notícia chega de longe já velha" },
  { id: "formacao", nome: "a série de formação", da: "o detalhe pequeno plantado cedo que só muito depois mostra para que servia" },
  { id: "mesa", nome: "a campanha gravada", da: "o holofote que gira, o respiro entre as pancadas, e o vilão que conversa antes de lutar" },
  { id: "misterio", nome: "o mistério", da: "a informação que falta é conhecida pelo herói: ele sabe o tamanho do buraco" },
  { id: "ascensao", nome: "a ascensão solitária", da: "o poder que sobe cobra em isolamento, e cada degrau muda quem trata o herói de igual" },
  { id: "tragedia", nome: "a tragédia", da: "o antagonista tem razão em alguma coisa, e o herói paga o preço de outra pessoa" },
  { id: "assombro", nome: "o conto de assombração", da: "o errado que não se explica: a regra do lugar, o que não devia estar ali, o silêncio na hora errada" },
  { id: "guerra", nome: "o romance de guerra", da: "a logística é o drama: o cansaço, a comida, quem não voltou, e a ordem que vem de longe" },
  { id: "picaresco", nome: "a estrada cômica", da: "gente pequena com problemas próprios atravessa a epopeia sem pedir licença" },
];
export function escolaPorId(id) { return ESCOLAS.find((e) => e.id === id) || null; }

/* ============================================================
   OS GESTOS — o movimento por baixo da forma

   A estante evitava repetir a mesma FORMA, e nada impedia que duas formas
   DIFERENTES fizessem o mesmo movimento. `mensageiro`, `rosto_conhecido`,
   `pela_crianca`, `procurador`, `ordem_de_longe` e `quem_ficou` são seis
   entradas distintas e uma única cena: alguém chega e fala comigo. Três
   delas seguidas passavam pela memória sem alarme nenhum e o jogador lia a
   mesma coisa três vezes.

   O gesto é o que a cena FAZ, abaixo do assunto. Ele é grosso de
   propósito — vinte e dois nomes para cento e noventa e uma formas —,
   porque uma taxonomia fina não distingue nada: se cada forma tivesse o
   próprio gesto, o gesto seria o id de novo.
   ============================================================ */
export const GESTOS = [
  { id: "chega_gente", diz: "alguém vem até mim e fala" },
  { id: "chega_coisa", diz: "uma coisa aparece: objeto, marca, escrito, som, cheiro" },
  { id: "falta", diz: "o que se nota é a ausência, ou a reação que não houve" },
  { id: "cheguei_tarde", diz: "o mundo já andou e eu chego depois" },
  { id: "oferece", diz: "me propõem, me dão, me abrem uma porta" },
  { id: "mostra_o_outro", diz: "o antagonista se mostra pelo que faz e pelo que crê" },
  { id: "cobra", diz: "a conta chega, e alguém paga" },
  { id: "fecha", diz: "uma possibilidade que eu tinha deixa de existir" },
  { id: "planta", diz: "uma coisa ganha atenção que ela ainda não merece" },
  { id: "colhe", diz: "uma coisa desta campanha volta com o sentido trocado" },
  { id: "respira", diz: "não há aposta nenhuma, e a cena vale por si" },
  { id: "bifurca", diz: "duas ou mais saídas, todas com preço" },
  { id: "aperta", diz: "tempo, espaço ou meio de sobra encolhem dentro da cena" },
  { id: "mostra_dentes", diz: "o perigo se exibe sem me morder ainda" },
  { id: "mostra_mundo", diz: "o mundo faz o que faria se eu não estivesse aqui" },
  { id: "mostra_lugar", diz: "o espaço é o assunto: altura, luz, som, uso" },
  { id: "mostra_corpo", diz: "o corpo entra: cansaço, marca, peso, reflexo" },
  { id: "me_ve", diz: "alguém reage a quem eu sou, certo ou errado" },
  { id: "fala", diz: "a forma da fala é o movimento, não o assunto dela" },
  { id: "duvida", diz: "fica de pé uma incerteza que a cena não resolve" },
  { id: "emoldura", diz: "o movimento é de enquadramento: onde a cena começa e quanto ela dura" },
  { id: "vinculo", diz: "quem anda comigo cobra, discorda, fica ou some" },
];
export function gestoPorId(id) { return GESTOS.find((g) => g.id === id) || null; }

/* ============================================================
   O ACERVO

   As famílias estão na ordem em que um mestre pensa a cena: como a
   coisa CHEGA, o que o inimigo OFERECE, o que a vitória CUSTA, o que
   fica PLANTADO, o que volta COLHIDO, onde a mesa RESPIRA, o que o
   jogador ESCOLHE, quem olha o herói NOS OLHOS, como o perigo mostra os
   DENTES, o MUNDO que continua sem ele, como as pessoas FALAM, o que o
   LUGAR faz, o que o TEMPO faz, o que o CORPO carrega, o que a DÚVIDA
   abre, e o que o VÍNCULO cobra.
   ============================================================ */
export const JOGADAS = [
  /* ============ A CHEGADA: como a pressão entra na cena ============ */
  {
    id: "mensageiro", gesto: "chega_gente", escola: "saga", serve: "social", peso: 4,
    quando: (s) => s.emCidade && !s.emCombate,
    forma: "Faça isto chegar por alguém que veio até mim de propósito — e o recado que essa pessoa traz é MENOR do que a coisa que ela deixa escapar sem querer.",
    evite: "não faça o mensageiro explicar a situação inteira nem entregar um resumo do que está em jogo",
  },
  {
    id: "ausencia", gesto: "falta", escola: "misterio", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => !s.emCombate,
    forma: "Não faça nada chegar: faça eu NOTAR QUE FALTA. Uma coisa que devia estar aqui não está, e a cena não explica por quê.",
    evite: "não diga o que aconteceu com o que sumiu, e não faça um personagem aparecer para explicar a ausência",
  },
  {
    id: "rosto_conhecido", gesto: "chega_gente", escola: "mesa", serve: "social", peso: 4, precisa: "gente",
    quando: (s) => s.pessoaNaCena || s.emCidade,
    forma: "Quem traz isto é alguém que eu JÁ CONHEÇO desta campanha. Comece pelo rosto, antes do assunto — eu tenho de reconhecer a pessoa antes de entender o que ela quer.",
    evite: "não invente um nome novo para isso: use gente que já apareceu nesta campanha",
  },
  {
    id: "ja_reagindo", gesto: "cheguei_tarde", escola: "saga", serve: "exploracao", peso: 3,
    quando: (s) => s.emCidade && !s.emMasmorra,
    forma: "Eu chego DEPOIS: quando entro na cena, outras pessoas já estão reagindo a isto. Mostre a reação delas primeiro, e o fato só pelo que a reação revela.",
    evite: "não deixe ninguém me narrar o acontecido em bloco; eu monto sozinho pelo que vejo",
  },
  {
    id: "objeto", gesto: "chega_coisa", escola: "formacao", serve: "exploracao", peso: 3, sozinha: true,
    quando: () => true,
    forma: "Isto chega como COISA, não como pessoa nem como palavra: um objeto que está onde não devia, e que fala sozinho.",
    evite: "não explique a origem do objeto e não deixe ninguém interpretá-lo para mim nesta cena",
  },
  {
    id: "no_meio_do_pequeno", gesto: "emoldura", escola: "mesa", serve: "social", peso: 3, sozinha: true,
    quando: (s) => !s.emCombate && !s.emMasmorra,
    forma: "Isto interrompe uma coisa PEQUENA e comum — uma refeição, um conserto, um pagamento. Gaste a primeira frase na coisa pequena e deixe ela inacabada.",
    evite: "não anuncie a interrupção com um silêncio dramático nem com todo mundo olhando para a porta",
  },
  {
    id: "pelo_barulho", gesto: "chega_coisa", escola: "assombro", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => !s.emCombate,
    forma: "Isto chega primeiro pelo SOM, e o som chega antes de qualquer explicação. Uma frase só de som, e depois a cena continua como se nada.",
    evite: "não descreva a fonte do som na mesma frase e não faça ninguém comentar que ouviu",
  },
  {
    id: "pela_multidao", gesto: "mostra_mundo", escola: "saga", serve: "social", peso: 3,
    quando: (s) => s.emCidade,
    forma: "Isto chega pelo movimento de MUITA GENTE: um deslocamento, uma fila que não existia, todo mundo indo para o mesmo lado. Eu vejo a corrente antes de saber a causa.",
    evite: "não me deixe parar alguém para perguntar e receber a resposta completa de primeira",
  },
  {
    id: "carta", gesto: "chega_coisa", escola: "formacao", serve: "exploracao", peso: 2,
    quando: (s) => s.emCidade || s.emViagem,
    forma: "Isto chega por escrito, e o texto é CURTO demais para o assunto — falta uma informação que quem escreveu achou óbvia.",
    evite: "não escreva a carta inteira e não faça ela explicar o contexto; o que falta nela é o ponto",
  },
  {
    id: "atraso", gesto: "cheguei_tarde", escola: "saga", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => s.emCidade || s.emViagem,
    forma: "A notícia chega VELHA: aquilo já aconteceu há tempo e o mundo já andou desde então. Deixe claro que eu estou reagindo tarde.",
    evite: "não diga exatamente quanto tempo passou e não faça ninguém se desculpar pelo atraso",
  },
  {
    id: "pela_crianca", gesto: "chega_gente", escola: "picaresco", serve: "social", peso: 2,
    quando: (s) => s.emCidade && !s.emCombate,
    forma: "Quem me conta é alguém que não entende o peso do que está contando — e conta como se fosse curiosidade, não notícia.",
    evite: "não faça essa pessoa perceber a gravidade no meio da fala e não deixe um adulto corrigi-la",
  },
  {
    id: "interrompido", gesto: "fala", escola: "mesa", serve: "social", peso: 3,
    quando: (s) => s.pessoaNaCena,
    forma: "Alguém começa a me dizer isto e é INTERROMPIDO antes de terminar — por outra pessoa, por um barulho, por medo. A frase fica pela metade e não volta nesta cena.",
    evite: "não deixe a pessoa retomar a frase depois e não me dê a metade que faltou por outro caminho agora",
  },
  {
    id: "rastro", gesto: "chega_coisa", escola: "misterio", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => !s.emCidade || s.emViagem || s.emMasmorra,
    forma: "Isto chega como MARCA no chão ou na parede: pegada, sangue, arranhão, cinza. Descreva o que se vê e nada do que aconteceu.",
    evite: "não interprete a marca para mim e não deixe um companheiro fazer a leitura completa",
  },
  {
    id: "pelo_cheiro", gesto: "chega_coisa", escola: "assombro", serve: "exploracao", peso: 2, sozinha: true,
    quando: (s) => !s.emCombate,
    forma: "O primeiro sinal é um CHEIRO fora de lugar, e ele chega antes de eu ver qualquer coisa. Use uma frase e não volte a mencioná-lo.",
    evite: "não nomeie a fonte do cheiro e não use comparação óbvia com sangue ou morte",
  },
  {
    id: "quem_foge", gesto: "mostra_mundo", escola: "guerra", serve: "exploracao", peso: 3,
    quando: (s) => s.emCidade || s.emViagem,
    forma: "Isto chega por quem está SAINDO: gente indo embora na direção contrária à minha, levando o que dá para carregar.",
    evite: "não pare a cena para uma entrevista; eles não querem conversar e é isso que informa",
  },
  {
    id: "pela_falta_de_reacao", gesto: "falta", escola: "assombro", serve: "social", peso: 3,
    quando: (s) => s.emCidade && s.pessoaNaCena,
    forma: "Acontece uma coisa que devia assustar todo mundo, e NINGUÉM AQUI reage. Eles já se acostumaram. Mostre a naturalidade deles, não o acontecimento.",
    evite: "não faça ninguém explicar por que estão acostumados nesta cena",
  },

  /* ============ A OFERTA: o ofício do antagonista ============ */
  {
    id: "cortesia", gesto: "mostra_o_outro", escola: "tragedia", serve: "social", peso: 5,
    quando: (s) => s.ordemDaFase >= 2,
    forma: "Quem age contra mim é EDUCADO. Sem ameaça, sem voz alta, sem discurso: a gentileza é o que assusta, porque ela mostra que a pessoa não precisa de mais nada.",
    evite: "não faça ninguém rir de canto de boca, dizer que sou interessante nem prometer que nos veremos de novo",
  },
  {
    id: "oferta_justa", gesto: "oferece", escola: "tragedia", serve: "social", peso: 5,
    quando: (s) => s.ordemDaFase >= 2 && !s.emCombate,
    forma: "Me ofereça alguma coisa que eu REALMENTE QUERO, por um preço que parece razoável. A oferta tem de ser boa de verdade — se ela é obviamente ruim, não é uma oferta, é uma cena de vilão.",
    evite: "não responda por mim, não deixe a oferta com uma pegadinha visível, e não me pressione a decidir agora",
  },
  {
    id: "espelho", gesto: "me_ve", escola: "tragedia", serve: "social", peso: 4, precisa: "passado",
    quando: (s) => s.ordemDaFase >= 3 && s.vilaoConhecido,
    forma: "Quem está do outro lado diz uma coisa VERDADEIRA sobre mim — algo que eu fiz nesta campanha e que não me deixa bem. Uma frase só, e sem lição de moral.",
    evite: "não invente um passado meu: use algo que aconteceu de verdade nesta campanha",
  },
  {
    id: "nao_esta_errado", gesto: "mostra_o_outro", escola: "tragedia", serve: "social", peso: 4,
    quando: (s) => s.ordemDaFase >= 3,
    forma: "Deixe a razão do outro lado APARECER, e deixe ela ser defensável. Quem fala não está tentando me convencer — está explicando, como quem já decidiu.",
    evite: "não transforme isto em debate e não me dê a réplica pronta; a palavra volta para mim com a dúvida em pé",
  },
  {
    id: "procurador", gesto: "chega_gente", escola: "mesa", serve: "social", peso: 4,
    quando: (s) => s.ordemDaFase >= 1 && s.ordemDaFase < 3,
    forma: "Quem faz isto trabalha PARA o outro lado e não se acha vilão: tem motivo próprio, e o motivo é comum — dívida, medo, família, emprego.",
    evite: "não deixe essa pessoa saber do plano inteiro nem falar em nome de quem manda",
  },
  {
    id: "poupar", gesto: "mostra_o_outro", escola: "tragedia", serve: "combate", peso: 3,
    quando: (s) => s.ordemDaFase >= 3 && s.vilaoConhecido && (s.pvBaixo || s.emCombate),
    forma: "O outro lado PODIA me acabar aqui e não acaba. Sem explicar por quê. A cena termina com ele indo embora e comigo inteiro.",
    evite: "não faça ninguém dizer que preciso viver por algum motivo, e não prometa um próximo encontro",
  },
  {
    id: "presente", gesto: "oferece", escola: "tragedia", serve: "social", peso: 3,
    quando: (s) => s.ordemDaFase >= 2,
    forma: "O outro lado me manda um PRESENTE, e o presente é útil de verdade. Sem bilhete explicativo, sem armadilha. Só chega.",
    evite: "não faça o presente ser envenenado nem amaldiçoado; o desconforto é ele ser genuinamente bom",
  },
  {
    id: "conhece_meu_nome", gesto: "me_ve", escola: "tragedia", serve: "social", peso: 4,
    quando: (s) => s.ordemDaFase >= 1,
    forma: "Quem age contra mim demonstra saber uma coisa específica sobre mim que eu não contei a ninguém aqui. De passagem, sem sublinhar.",
    evite: "não explique como essa pessoa soube e não me deixe descobrir isso nesta cena",
  },
  {
    id: "recruta", gesto: "mostra_o_outro", escola: "tragedia", serve: "social", peso: 3,
    quando: (s) => s.ordemDaFase >= 2 && s.emCidade,
    forma: "Alguém que eu conheço está sendo ATRAÍDO para o outro lado — e ainda não decidiu. A pessoa não esconde de mim: fala do assunto como quem pesa uma proposta de emprego.",
    evite: "não deixe essa pessoa se converter nesta cena e não me dê um argumento fácil para impedir",
  },
  {
    id: "custo_dele", gesto: "mostra_o_outro", escola: "tragedia", serve: "social", peso: 3,
    quando: (s) => s.ordemDaFase >= 3,
    forma: "Mostre que o outro lado também PERDEU alguma coisa para chegar onde chegou — sem pena, sem justificativa, como fato.",
    evite: "não transforme isso em história de origem contada em voz alta por ninguém",
  },
  {
    id: "regra_propria", gesto: "mostra_o_outro", escola: "tragedia", serve: "social", peso: 3,
    quando: (s) => s.ordemDaFase >= 2,
    forma: "O outro lado tem uma REGRA que ele mesmo cumpre, e a cena mostra ele cumprindo — mesmo quando quebrá-la seria melhor para ele.",
    evite: "não faça ninguém enunciar a regra em voz alta; ela aparece no que ele faz",
  },
  {
    id: "paciencia", gesto: "mostra_o_outro", escola: "tragedia", serve: "social", peso: 3,
    quando: (s) => s.ordemDaFase >= 3,
    forma: "Deixe claro que o outro lado tem TEMPO e eu não. Ele pode esperar anos; a minha janela é curta. Sem que ninguém diga isso.",
    evite: "não faça ninguém falar em prazos e não transforme isso em ameaça explícita",
  },
  {
    id: "ordem_de_longe", gesto: "chega_gente", escola: "guerra", serve: "social", peso: 3,
    quando: (s) => s.ordemDaFase >= 1 && s.ordemDaFase < 4,
    forma: "Quem age contra mim está CUMPRINDO ORDENS e discorda delas. Faz mesmo assim, e faz direito.",
    evite: "não deixe essa pessoa se rebelar nesta cena e não faça dela uma aliada disfarçada",
  },
  {
    id: "elogio", gesto: "me_ve", escola: "tragedia", serve: "social", peso: 3,
    quando: (s) => s.ordemDaFase >= 3 && s.vilaoConhecido,
    forma: "O outro lado me ELOGIA por uma coisa específica que eu fiz, e o elogio é sincero e técnico — de quem entende do ofício.",
    evite: "não faça disso zombaria e não termine com uma ameaça velada",
  },
  {
    id: "dois_lados_ruins", gesto: "duvida", escola: "tragedia", serve: "social", peso: 4,
    quando: (s) => s.ordemDaFase >= 2 && s.momento >= 0.4,
    forma: "Mostre que quem se opõe ao outro lado também faz coisas feias. Não para me confundir: porque é assim mesmo.",
    evite: "não me diga qual lado é pior e não coloque ninguém para arbitrar isso",
  },
  {
    id: "porta_aberta", gesto: "oferece", escola: "tragedia", serve: "social", peso: 3,
    quando: (s) => s.ordemDaFase >= 3 && s.vilaoConhecido,
    forma: "O outro lado deixa claro que a porta continua aberta para mim — a qualquer momento, sem rancor pelo que já fiz contra ele.",
    evite: "não faça disso chantagem e não estabeleça condições; a ausência de condições é o que incomoda",
  },
  {
    id: "trabalho_dele", gesto: "mostra_mundo", escola: "guerra", serve: "exploracao", peso: 3,
    quando: (s) => s.ordemDaFase >= 2,
    forma: "Mostre a MÁQUINA do outro lado funcionando: gente pagando, carregando, anotando, cumprindo turno. Burocracia, não maldade.",
    evite: "não faça essa gente parecer sinistra; o que assusta é ser rotina",
  },
  {
    id: "quem_ficou", gesto: "chega_gente", escola: "tragedia", serve: "social", peso: 3,
    quando: (s) => s.ordemDaFase >= 2 && s.emCidade,
    forma: "Alguém aqui já foi do outro lado e SAIU — e não quer falar disso. Deixe a recusa dizer mais do que uma explicação diria.",
    evite: "não arranque a história dessa pessoa nesta cena e não a faça pedir perdão",
  },
  {
    id: "imitacao", gesto: "mostra_mundo", escola: "misterio", serve: "social", peso: 3,
    quando: (s) => s.ordemDaFase >= 2 && s.momento >= 0.3,
    forma: "Alguém está copiando o MÉTODO do outro lado por conta própria, sem ter relação com ele. O método pegou.",
    evite: "não revele se há ligação real e não deixe ninguém investigar isso agora",
  },
  {
    id: "sem_odio", gesto: "mostra_o_outro", escola: "tragedia", serve: "social", peso: 4,
    quando: (s) => s.ordemDaFase >= 3,
    forma: "Deixe claro que aquilo NÃO é pessoal contra mim: eu sou um obstáculo, e obstáculos se removem. Sem raiva nenhuma.",
    evite: "não faça ninguém dizer literalmente que não é pessoal; mostre pela frieza do tratamento",
  },

  /* ============ O PREÇO: o que a vitória custa ============ */
  {
    id: "custo_lateral", gesto: "cobra", escola: "tragedia", serve: "exploracao", peso: 4,
    quando: (s) => s.momento >= 0.3,
    forma: "Isto cobra por um lado que não estava em jogo: não em mim, não no que eu estava protegendo — em outra coisa, que eu vou reconhecer.",
    evite: "não me culpe pelo custo e não faça ninguém apontar que a culpa é minha; mostre o estrago e cale",
  },
  {
    id: "porta_fecha", gesto: "fecha", escola: "misterio", serve: "exploracao", peso: 3,
    quando: (s) => s.momento >= 0.3 && !s.emCombate,
    forma: "Uma saída que eu TINHA some agora, em silêncio: um caminho que fecha, alguém que muda de lado, uma porta que deixa de estar aberta.",
    evite: "não anuncie que perdi uma opção e não me diga o que eu deveria ter feito antes",
  },
  {
    id: "alguem_pagou", gesto: "cobra", escola: "saga", serve: "social", peso: 4,
    quando: (s) => s.temPromessa || s.temLugarAbandonado || s.temDerrotado,
    forma: "A conta de uma escolha minha ANTERIOR chega agora — e quem pagou foi outra pessoa, que não escolheu nada. Mostre a pessoa, não a conta.",
    evite: "não faça essa pessoa me acusar; a cobrança é o fato existir, não o discurso sobre ele",
  },
  {
    id: "vitoria_com_data", gesto: "fecha", escola: "mesa", serve: "exploracao", peso: 3,
    quando: (s) => s.temRelogio && s.momento >= 0.2,
    forma: "O que eu ganhei é real e tem PRAZO. Deixe claro que funciona, e deixe visível — sem número e sem aviso — que não vai funcionar para sempre.",
    evite: "não diga quanto tempo resta e não transforme isso em contagem regressiva narrada",
  },
  {
    id: "conserto_pior", gesto: "cobra", escola: "tragedia", serve: "exploracao", peso: 3,
    quando: (s) => s.momento >= 0.4,
    forma: "Uma coisa que eu resolvi antes criou um problema NOVO em outro lugar — e o problema novo não é culpa de ninguém, é consequência.",
    evite: "não faça ninguém apontar a ligação; eu ligo os pontos sozinho",
  },
  {
    id: "quem_ocupa_o_vazio", gesto: "mostra_mundo", escola: "saga", serve: "social", peso: 3, precisa: "passado",
    quando: (s) => s.temDerrotado && s.momento >= 0.3,
    forma: "O lugar que eu esvaziei foi OCUPADO por outra coisa, e não necessariamente melhor. O vácuo não fica vazio.",
    evite: "não faça o sucessor ser obviamente pior nem obviamente melhor; ele apenas é outro",
  },
  {
    id: "preco_no_corpo", gesto: "mostra_corpo", escola: "guerra", serve: "combate", peso: 3,
    quando: (s) => s.pvBaixo || s.temCicatriz,
    forma: "O custo aparece no CORPO e nas coisas: o que rasgou, o que ficou torto, o que não fecha direito. Concreto e sem drama.",
    evite: "não me dê ferimento novo por conta própria e não descreva dor que o sistema não cobrou",
  },
  {
    id: "gratidao_pesada", gesto: "cobra", escola: "mesa", serve: "social", peso: 3,
    quando: (s) => s.emCidade && s.momento >= 0.3,
    forma: "Alguém me agradece por uma coisa, e o agradecimento vem com uma expectativa embutida que eu não pedi.",
    evite: "não transforme isso em missão nesta cena e não deixe a pessoa formular o pedido",
  },
  {
    id: "conta_antiga", gesto: "cobra", escola: "saga", serve: "social", peso: 3, precisa: "passado",
    quando: (s) => s.momento >= 0.35,
    forma: "Alguém aparece cobrando uma coisa antiga e SEM RAZÃO — a cobrança é injusta, e a pessoa acredita nela.",
    evite: "não deixe eu resolver isso com um argumento e não faça a pessoa reconhecer o erro",
  },
  {
    id: "custo_de_nao_agir", gesto: "cobra", escola: "tragedia", serve: "exploracao", peso: 3,
    quando: (s) => s.momento >= 0.3 && s.temRelogio,
    forma: "Mostre o que piorou porque eu estava OCUPADO em outro lugar. Não é castigo: é o mundo andando enquanto eu andava.",
    evite: "não faça ninguém dizer que eu deveria estar lá e não me dê chance de consertar agora",
  },
  {
    id: "recompensa_torta", gesto: "oferece", escola: "picaresco", serve: "social", peso: 2,
    quando: (s) => s.emCidade,
    forma: "A recompensa que me dão é sincera e IMPRESTÁVEL para mim — vale muito para quem dá, e nada para quem recebe.",
    evite: "não deixe ninguém perceber o desencontro e não converta isso em dinheiro nesta cena",
  },
  {
    id: "o_que_nao_volta", gesto: "fecha", escola: "tragedia", serve: "social", peso: 3,
    quando: (s) => s.momento >= 0.5,
    forma: "Mostre uma coisa que mudou e NÃO tem como voltar ao que era — não pela gravidade, mas porque o tempo passou por cima.",
    evite: "não ofereça um jeito de restaurar e não faça disso lamento explícito",
  },
  {
    id: "fatura_dividida", gesto: "cobra", escola: "guerra", serve: "social", peso: 3,
    quando: (s) => s.temGrupo && s.momento >= 0.3,
    forma: "O preço desta vez cai sobre QUEM ESTÁ COMIGO, não sobre mim. E eles absorvem sem reclamar.",
    evite: "não mate nem incapacite ninguém do meu grupo por conta própria; o sistema é quem cobra corpo",
  },
  {
    id: "ninguem_soube", gesto: "falta", escola: "tragedia", serve: "social", peso: 3,
    quando: (s) => s.momento >= 0.4,
    forma: "Uma coisa importante que eu fiz simplesmente NÃO CHEGOU a ninguém. Não houve reconhecimento e não vai haver.",
    evite: "não compense isso com um observador secreto e não prometa que um dia se saberá",
  },

  /* ============ O PLANTIO: o que fica armado ============ */
  {
    id: "detalhe_solto", gesto: "planta", escola: "formacao", serve: "exploracao", peso: 4, sozinha: true,
    quando: (s) => s.momento < 0.6,
    forma: "Dê a UM detalhe concreto mais atenção do que ele merece agora — um objeto, um hábito, uma marca, uma palavra. Sem sublinhar, sem comentar. Só demore um segundo a mais nele.",
    evite: "não diga que é importante, não faça personagem nenhum reparar nele, e não volte a ele nesta cena",
  },
  {
    id: "nome_repetido", gesto: "planta", escola: "misterio", serve: "social", peso: 3,
    quando: (s) => s.emCidade && s.momento < 0.7,
    forma: "Faça um NOME ser dito por alguém que não tem relação com quem o disse antes. Só o nome, de passagem, sem contexto novo.",
    evite: "não explique a coincidência e não deixe ninguém perguntar quem é",
  },
  {
    id: "regra_do_lugar", gesto: "mostra_mundo", escola: "assombro", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => s.emCidade || s.emMasmorra,
    forma: "Este lugar tem uma REGRA própria, e a cena a demonstra por alguém obedecendo-a — nunca por alguém explicando-a.",
    evite: "não faça um personagem recitar o costume local para mim; eu deduzo vendo",
  },
  {
    id: "gente_de_fundo", gesto: "planta", escola: "formacao", serve: "social", peso: 3, sozinha: true,
    quando: (s) => s.emCidade,
    forma: "Ponha na cena alguém de passagem com UM traço marcante e nenhuma função. Uma frase. Não volte a ela.",
    evite: "não dê a essa pessoa uma missão, uma dica ou um segredo; ela está só existindo",
  },
  {
    id: "porta_que_nao_abri", gesto: "planta", escola: "misterio", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => s.emCidade || s.emMasmorra,
    forma: "Mostre um caminho, uma porta ou um lugar que eu PODERIA ter tomado e não tomei. Sem convite e sem obstáculo — ele fica ali.",
    evite: "não me diga o que há do outro lado e não faça ninguém sugerir que eu vá",
  },
  {
    id: "palavra_estranha", gesto: "planta", escola: "misterio", serve: "social", peso: 3,
    quando: (s) => s.pessoaNaCena || s.emCidade,
    forma: "Alguém usa uma palavra ou expressão que eu não conheço, como se fosse óbvia, e segue falando.",
    evite: "não defina a palavra e não deixe ninguém explicá-la se eu não perguntar",
  },
  {
    id: "habito", gesto: "planta", escola: "formacao", serve: "social", peso: 3, sozinha: true, precisa: "gente",
    quando: (s) => s.pessoaNaCena,
    forma: "Mostre alguém que eu já conheço fazendo uma coisa que essa pessoa SEMPRE faz. Um gesto repetido, sem comentário.",
    evite: "não invente um hábito que contradiga o que a pessoa já mostrou nesta campanha",
  },
  {
    id: "conta_errada", gesto: "planta", escola: "misterio", serve: "exploracao", peso: 3,
    quando: (s) => s.emCidade && s.momento < 0.7,
    forma: "Um número não fecha: gente a menos, tempo a mais, peso que não bate. A cena mostra o desencontro sem apontá-lo.",
    evite: "não resolva a conta nesta cena e não faça ninguém notar em voz alta",
  },
  {
    id: "quem_olha", gesto: "planta", escola: "assombro", serve: "social", peso: 3, sozinha: true,
    quando: (s) => s.emCidade,
    forma: "Alguém está me observando e para quando eu olho. Uma vez, sem perseguição, sem confronto.",
    evite: "não faça essa pessoa fugir dramaticamente e não me deixe alcançá-la nesta cena",
  },
  {
    id: "material_errado", gesto: "planta", escola: "misterio", serve: "exploracao", peso: 2, sozinha: true,
    quando: (s) => s.emCidade || s.emMasmorra,
    forma: "Uma coisa aqui é feita do material ERRADO para o que ela é — bom demais, velho demais, caro demais para o lugar.",
    evite: "não explique de onde veio e não deixe ninguém avaliar o objeto para mim",
  },
  {
    id: "promessa_de_terceiro", gesto: "planta", escola: "formacao", serve: "social", peso: 3,
    quando: (s) => s.emCidade && s.pessoaNaCena,
    forma: "Alguém promete uma coisa a OUTRA PESSOA na minha frente. Não é comigo, e eu ouço.",
    evite: "não me envolva na promessa e não faça ninguém pedir que eu testemunhe",
  },
  {
    id: "medo_sem_causa", gesto: "duvida", escola: "assombro", serve: "social", peso: 3,
    quando: (s) => s.emCidade,
    forma: "Alguém aqui tem medo de uma coisa específica e comum — uma hora do dia, um som, uma direção. E não considera isso estranho.",
    evite: "não revele a causa do medo e não faça ninguém explicá-la por essa pessoa",
  },

  /* ============ A COLHEITA: o que volta ============ */
  {
    id: "retorno_torto", gesto: "colhe", escola: "formacao", serve: "social", peso: 5, precisa: "passado",
    quando: (s) => (s.temCicatriz || s.temDerrotado || s.temLugarAbandonado) && s.momento >= 0.35,
    forma: "Traga de volta uma coisa desta campanha com o SENTIDO trocado: o que era ajuda virou dívida, o que era vitória virou motivo, o que era seguro deixou de ser.",
    evite: "não reescreva o que aconteceu antes; o fato é o mesmo, só o que ele significa mudou",
  },
  {
    id: "eco", gesto: "colhe", escola: "formacao", serve: "social", peso: 3, precisa: "fala",
    quando: (s) => s.momento >= 0.5 && s.pessoaNaCena,
    forma: "Faça alguém repetir, sem saber, uma frase que já foi dita nesta campanha por outra pessoa e em outra situação. Sem comentar a repetição.",
    evite: "não invente a frase anterior: use uma que realmente já foi dita nesta campanha",
  },
  {
    id: "quem_lembra", gesto: "colhe", escola: "saga", serve: "social", peso: 3, precisa: "gente",
    quando: (s) => s.emCidade && s.momento >= 0.3,
    forma: "Alguém se lembra de mim de uma cena antiga, e lembra de um DETALHE que eu não achava importante.",
    evite: "não invente um encontro que não houve; use gente e cenas que existiram nesta campanha",
  },
  {
    id: "o_que_plantei", gesto: "colhe", escola: "formacao", serve: "exploracao", peso: 4, precisa: "passado",
    quando: (s) => s.momento >= 0.4,
    forma: "Uma coisa que eu fiz há tempo — sem intenção de consequência — deu FRUTO agora, e o fruto é bom.",
    evite: "não faça ninguém me parabenizar por isso e não transforme em recompensa material",
  },
  {
    id: "objeto_volta", gesto: "colhe", escola: "formacao", serve: "exploracao", peso: 3, precisa: "objeto",
    quando: (s) => s.momento >= 0.4,
    forma: "Um objeto que já apareceu nesta campanha reaparece em OUTRAS MÃOS, e ninguém acha isso notável.",
    evite: "não explique o percurso do objeto e não me deixe recuperá-lo nesta cena",
  },
  {
    id: "lugar_mudado", gesto: "colhe", escola: "saga", serve: "exploracao", peso: 4, precisa: "lugar",
    quando: (s) => s.temLugarAbandonado && s.momento >= 0.35,
    forma: "Um lugar que eu conheci está DIFERENTE — melhor ou pior, mas diferente do que eu deixei. Mostre a mudança e não a causa.",
    evite: "não faça ninguém narrar o que aconteceu lá desde então",
  },
  {
    id: "versao_da_minha_historia", gesto: "colhe", escola: "ascensao", serve: "social", peso: 4,
    quando: (s) => s.fama >= 25,
    forma: "Alguém conta uma coisa que EU fiz, sem saber que sou eu, e conta errado — com um detalhe que ficou melhor do que foi.",
    evite: "não me faça corrigir com sucesso e não deixe ninguém me reconhecer nesta cena",
  },
  {
    id: "filho_da_escolha", gesto: "colhe", escola: "tragedia", serve: "social", peso: 3, precisa: "passado",
    quando: (s) => s.momento >= 0.5,
    forma: "Alguém está vivendo a vida que uma escolha minha tornou possível — e não faz ideia disso.",
    evite: "não faça essa pessoa descobrir e não me dê crédito por isso na cena",
  },
  {
    id: "ferramenta_velha", gesto: "colhe", escola: "formacao", serve: "combate", peso: 3,
    quando: (s) => s.momento >= 0.45 && s.nivel >= 4,
    forma: "Uma coisa antiga e humilde que eu carrego resolve o problema de agora, e o resolve sem cerimônia.",
    evite: "não invente um item que eu não tenho; se não houver um, mostre um hábito antigo servindo",
  },
  {
    id: "quem_aprendeu", gesto: "colhe", escola: "mesa", serve: "social", peso: 3, precisa: "gente",
    quando: (s) => s.emCidade && s.momento >= 0.4,
    forma: "Alguém está imitando uma coisa que eu fiz — o jeito, o método, a solução. Mal imitada, e a sério.",
    evite: "não faça essa pessoa pedir para ser minha aprendiz nesta cena",
  },

  /* ============ O RESPIRO: onde a mesa descansa ============ */
  {
    id: "calmaria_com_dente", gesto: "respira", escola: "mesa", serve: "exploracao", peso: 4, sozinha: true,
    quando: (s) => s.temperatura === "fria" || s.temperatura === "morna",
    forma: "Cena calma, de verdade calma — e UMA coisa fora do lugar dentro dela, que a cena não comenta.",
    evite: "não faça a coisa fora do lugar virar perigo agora; ela fica lá, e é só",
  },
  {
    id: "gente_querendo", gesto: "respira", escola: "mesa", serve: "social", peso: 4, sozinha: true,
    quando: (s) => !s.emCombate && (s.pessoaNaCena || s.emCidade),
    forma: "Quem está nesta cena quer alguma coisa PEQUENA e própria, que não tem nada a ver comigo — e pede, ou tenta, ou atrapalha por causa disso.",
    evite: "não transforme o desejo dessa pessoa em missão nem em gancho; ela quer o que quer e pronto",
  },
  {
    id: "riso_verdadeiro", gesto: "respira", escola: "picaresco", serve: "social", peso: 2, sozinha: true,
    quando: (s) => (s.temperatura === "morna" || s.temperatura === "fria") && !s.emCombate,
    forma: "Deixe a cena ter graça — e que a graça venha de alguém sendo exatamente quem é, não de uma piada colocada por cima.",
    evite: "não quebre o tom do mundo, não faça ninguém falar como gente de hoje e não termine com uma tirada",
  },
  {
    id: "comida", gesto: "respira", escola: "picaresco", serve: "social", peso: 3, sozinha: true,
    quando: (s) => !s.emCombate,
    forma: "A cena gira em torno de COMIDA ou bebida: o que é, como está, quem serviu, quanto custa. Concreto e sem simbolismo.",
    evite: "não envenene nada, não esconda mensagem na comida e não faça disso uma metáfora",
  },
  {
    id: "trabalho_manual", gesto: "respira", escola: "guerra", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => !s.emCombate,
    forma: "Mostre alguém fazendo um TRABALHO com as mãos, bem-feito, do começo ao fim de uma etapa. A competência é o conteúdo.",
    evite: "não interrompa o trabalho com um acontecimento e não faça a pessoa filosofar sobre o ofício",
  },
  {
    id: "silencio_bom", gesto: "respira", escola: "mesa", serve: "social", peso: 2, sozinha: true,
    quando: (s) => s.temperatura !== "brasa" && (s.temGrupo || s.pessoaNaCena),
    forma: "Deixe passar um SILÊNCIO confortável entre mim e quem está aqui. Ninguém precisa preencher.",
    evite: "não use o silêncio para criar tensão e não faça ninguém quebrá-lo com uma revelação",
  },
  {
    id: "discussao_boba", gesto: "respira", escola: "picaresco", serve: "social", peso: 3, sozinha: true,
    quando: (s) => s.temGrupo || (s.emCidade && s.pessoaNaCena),
    forma: "Duas pessoas discutem uma coisa SEM IMPORTÂNCIA com convicção total, e não chegam a acordo.",
    evite: "não me peça para arbitrar e não faça a discussão revelar informação útil",
  },
  {
    id: "clima", gesto: "respira", escola: "saga", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => !s.emMasmorra,
    forma: "Deixe o TEMPO fazer o trabalho da cena: o calor, a chuva, o vento, a luz da hora. Uma frase física, sem simbolizar nada.",
    evite: "não use o clima para anunciar perigo e não faça tempestade coincidir com má notícia",
  },
  {
    id: "animal", gesto: "respira", escola: "picaresco", serve: "exploracao", peso: 2, sozinha: true,
    quando: (s) => !s.emCombate,
    forma: "Um bicho comum entra na cena com um problema próprio e sai. Não é presságio, não é aliado, não é ameaça.",
    evite: "não faça o animal reagir a mim de forma significativa e não o transforme em sinal",
  },
  {
    id: "musica", gesto: "respira", escola: "picaresco", serve: "social", peso: 2, sozinha: true,
    quando: (s) => s.emCidade && !s.emCombate,
    forma: "Alguém está tocando, cantando ou assobiando, e é mediano — nem bonito nem ruim. Faz parte do lugar.",
    evite: "não cite letra e não faça a música conter um aviso ou uma profecia",
  },
  {
    id: "conserto", gesto: "respira", escola: "guerra", serve: "exploracao", peso: 2, sozinha: true,
    quando: (s) => s.temperatura !== "brasa",
    forma: "A cena é sobre reparar o desgaste: remendar, afiar, lavar, contar o que sobrou. O tempo passa e nada acontece.",
    evite: "não faça a manutenção revelar um dano oculto e não interrompa com um chamado",
  },
  {
    id: "dormir_mal", gesto: "respira", escola: "guerra", serve: "exploracao", peso: 2, sozinha: true,
    quando: (s) => s.noite,
    forma: "Mostre a dificuldade banal de descansar aqui: o chão, o barulho, o frio, a hora errada. Sem sonho, sem visão.",
    evite: "não me dê pesadelo profético e não use isso para introduzir uma ameaça",
  },

  /* ============ A ESCOLHA: onde eu decido ============ */
  {
    id: "duas_portas", gesto: "bifurca", escola: "mesa", serve: "exploracao", peso: 4, sozinha: true,
    quando: (s) => s.momento >= 0.25 && !s.emCombate,
    forma: "Termine com DUAS possibilidades abertas e concretas, e as duas custam alguma coisa. Não sugira a terceira e não indique qual é a melhor.",
    evite: "não liste as opções como menu e não pergunte o que eu escolho; mostre as duas dentro da ficção e pare",
  },
  {
    id: "relogio_na_cena", gesto: "aperta", escola: "saga", serve: "combate", peso: 4,
    quando: (s) => s.temRelogio || s.temperatura === "brasa",
    forma: "Ponha um limite de TEMPO dentro da própria cena, visível e físico — algo que está acabando enquanto eu penso.",
    evite: "não diga quantos turnos tenho e não conte o tempo em voz de sistema",
  },
  {
    id: "buraco_conhecido", gesto: "duvida", escola: "misterio", serve: "exploracao", peso: 3,
    quando: (s) => s.momento >= 0.3,
    forma: "Deixe claro EXATAMENTE o que eu não sei — o tamanho do buraco, não o conteúdo dele. Eu decido sabendo que decido sem essa peça.",
    evite: "não me dê a peça que falta por acidente e não faça ninguém adivinhá-la em voz alta",
  },
  {
    id: "escolha_de_outro", gesto: "bifurca", escola: "tragedia", serve: "social", peso: 3,
    quando: (s) => s.pessoaNaCena && s.momento >= 0.3,
    forma: "A decisão não é minha: alguém decide na minha frente, e eu só posso assistir ou interferir de um jeito caro.",
    evite: "não me dê uma saída barata e não faça a pessoa pedir minha opinião",
  },
  {
    id: "custo_ja_pago", gesto: "bifurca", escola: "mesa", serve: "exploracao", peso: 3,
    quando: (s) => s.momento >= 0.35,
    forma: "Mostre que uma das opções JÁ FOI paga por alguém — desistir dela desperdiça o que essa pessoa deu.",
    evite: "não faça ninguém cobrar isso de mim em voz alta",
  },
  {
    id: "sem_tempo_de_saber", gesto: "aperta", escola: "guerra", serve: "combate", peso: 3,
    quando: (s) => s.emCombate || s.temperatura === "brasa",
    forma: "Eu tenho de agir AGORA com informação incompleta, e a cena deixa claro que esperar também é uma escolha com preço.",
    evite: "não me dê um instante extra de reflexão e não descreva o que eu não poderia perceber a tempo",
  },
  {
    id: "quem_pede", gesto: "bifurca", escola: "mesa", serve: "social", peso: 3,
    quando: (s) => s.pessoaNaCena,
    forma: "Alguém me pede uma coisa PEQUENA num momento em que eu tenho coisa grande para fazer. O pedido é legítimo.",
    evite: "não faça o pedido pequeno se revelar crucial e não puna a recusa",
  },
  {
    id: "aposta_visivel", gesto: "bifurca", escola: "mesa", serve: "combate", peso: 3,
    quando: (s) => s.momento >= 0.3,
    forma: "Deixe visível o que eu GANHO e o que eu PERCO nesta jogada, os dois concretos, antes de eu decidir.",
    evite: "não some com uma das pontas depois e não invente uma consequência que não estava à vista",
  },
  {
    id: "todo_mundo_olhando", gesto: "me_ve", escola: "ascensao", serve: "social", peso: 3,
    quando: (s) => s.fama >= 25 && s.emCidade,
    forma: "A decisão acontece com TESTEMUNHAS, e o que eu escolher vai ser contado adiante. Mostre quem está olhando.",
    evite: "não faça ninguém me pressionar em voz alta; o peso é a plateia existir",
  },
  {
    id: "sem_escolha_boa", gesto: "bifurca", escola: "tragedia", serve: "exploracao", peso: 4,
    quando: (s) => s.momento >= 0.5,
    forma: "As opções são todas ruins, e a cena não esconde isso. Não existe a saída inteligente.",
    evite: "não plante uma terceira via esperta e não deixe ninguém sugerir uma solução engenhosa",
  },
  {
    id: "escolher_por_ultimo", gesto: "bifurca", escola: "misterio", serve: "exploracao", peso: 2,
    quando: (s) => s.momento >= 0.3 && s.pessoaNaCena,
    forma: "Deixe outras pessoas escolherem antes de mim, e mostre o que aconteceu com elas. Eu decido depois, sabendo.",
    evite: "não faça o resultado delas ser conclusivo; o que serve para uma pode não servir para mim",
  },
  {
    id: "porta_estreita", gesto: "aperta", escola: "guerra", serve: "combate", peso: 3,
    quando: (s) => s.temGrupo && (s.emMasmorra || s.emCombate),
    forma: "Só cabe uma parte de nós, ou só dá para levar uma parte das coisas. A escolha é sobre o que fica para trás.",
    evite: "não alargue a passagem depois e não faça alguém se oferecer para ficar sem custo",
  },

  /* ============ O HOLOFOTE: quem me olha ============ */
  {
    id: "olhos_nos_olhos", gesto: "me_ve", escola: "mesa", serve: "social", peso: 4, sozinha: true,
    quando: (s) => s.pilarFaminto === "social" || s.pessoaNaCena,
    forma: "Alguém me trata como PESSOA e não como solução: pergunta de mim, repara em mim, ou simplesmente fica. Sem pedir nada.",
    evite: "não termine isso com um pedido de ajuda disfarçado nem com uma missão",
  },
  {
    id: "fama_chega_antes", gesto: "me_ve", escola: "ascensao", serve: "social", peso: 4,
    /* 10 é o degrau de "Conhecido" em fama.js — "nas tavernas da região,
       alguém já ouviu seu nome". A primeira versão desta linha pedia 3, num
       jogo cuja régua de fama vai a 100: a jogada dispararia no dia 1, e um
       desconhecido teria a própria lenda contada torta antes de ter feito
       qualquer coisa. Limiar na escala errada é regra sem código atrás. */
    quando: (s) => s.fama >= 10 || s.nivel >= 5,
    forma: "Alguém já sabe de uma coisa que eu fiz — e a versão que chegou até essa pessoa está TORTA. Ela me trata pela versão dela, não pela verdade.",
    evite: "não me deixe corrigir sem esforço e não faça a pessoa aceitar a correção na mesma fala",
  },
  {
    id: "sozinho_no_alto", gesto: "me_ve", escola: "ascensao", serve: "social", peso: 3,
    quando: (s) => s.nivel >= 8 && s.momento >= 0.4,
    forma: "Mostre o preço do que eu virei: alguém que antes falava comigo de igual agora não fala — por respeito, por medo, ou porque não alcança mais.",
    evite: "não faça ninguém dizer que mudei e não me dê uma cena de autocomiseração",
  },
  {
    id: "chamado_pelo_meu", gesto: "me_ve", escola: "mesa", serve: "combate", peso: 3, sozinha: true,
    quando: (s) => s.pilarFaminto === "combate" || s.nivel >= 3,
    forma: "Ponha na cena um problema com o FORMATO exato de uma coisa que eu sei fazer bem, e não avise que é para mim.",
    evite: "não deixe ninguém sugerir a solução e não facilite o problema por causa disso",
  },
  {
    id: "nao_sou_o_assunto", gesto: "me_ve", escola: "mesa", serve: "social", peso: 3, sozinha: true,
    quando: (s) => s.emCidade,
    forma: "A cena acontece e eu NÃO sou o centro dela: as pessoas tratam do que é delas e eu estou de passagem.",
    evite: "não faça ninguém me puxar para o meio e não converta isso em oportunidade para mim",
  },
  {
    id: "cobranca_de_igual", gesto: "me_ve", escola: "mesa", serve: "social", peso: 3, precisa: "gente",
    quando: (s) => s.pessoaNaCena && s.momento >= 0.3,
    forma: "Alguém que me conhece bem me cobra uma coisa DIRETA, sem rodeio e sem medo. Não é inimigo: é quem tem intimidade para isso.",
    evite: "não faça a pessoa se desculpar depois e não me dê uma resposta pronta que encerre o assunto",
  },
  {
    id: "expectativa", gesto: "me_ve", escola: "ascensao", serve: "social", peso: 3,
    quando: (s) => s.fama >= 25 || s.nivel >= 6,
    forma: "Alguém espera de mim uma coisa que eu nunca prometi, e trata isso como acordado.",
    evite: "não me deixe desfazer o mal-entendido facilmente e não faça a pessoa ficar magoada agora",
  },
  {
    id: "quem_nao_se_impressiona", gesto: "me_ve", escola: "picaresco", serve: "social", peso: 3,
    quando: (s) => s.fama >= 25 || s.nivel >= 6,
    forma: "Alguém aqui NÃO está impressionado comigo, e não por hostilidade: por indiferença genuína. Trata-me como trata todo mundo.",
    evite: "não revele depois que a pessoa é importante e não faça dela um desafio a vencer",
  },
  {
    id: "pedem_conselho", gesto: "me_ve", escola: "mesa", serve: "social", peso: 3,
    quando: (s) => s.nivel >= 5 && s.pessoaNaCena,
    forma: "Alguém me pede CONSELHO sobre uma coisa da vida dela que eu não tenho como saber. E espera de verdade.",
    evite: "não responda por mim e não faça a pessoa já ter a decisão tomada",
  },
  {
    id: "espelho_pequeno", gesto: "mostra_mundo", escola: "formacao", serve: "social", peso: 3,
    quando: (s) => s.nivel >= 4 && s.emCidade,
    forma: "Ponha alguém que está no ponto onde EU estava no começo — mesma pressa, mesmo erro, mesma coragem burra.",
    evite: "não me faça dar lição e não deixe essa pessoa me reconhecer como exemplo",
  },
  {
    id: "reconhecido_pelo_errado", gesto: "me_ve", escola: "ascensao", serve: "social", peso: 3,
    quando: (s) => s.fama >= 25,
    forma: "Me reconhecem por uma coisa MENOR que eu fiz, e não pela que importou. E é essa que ficou.",
    evite: "não deixe eu redirecionar a conversa para o feito maior com sucesso",
  },
  {
    id: "quem_depende", gesto: "cobra", escola: "tragedia", serve: "social", peso: 3,
    quando: (s) => s.momento >= 0.4 && s.emCidade,
    forma: "Mostre alguém cuja vida agora DEPENDE de eu continuar fazendo o que faço. Sem pedido, sem cobrança: só o fato.",
    evite: "não faça essa pessoa me procurar e não converta isso em missão",
  },
  {
    id: "olhar_do_grupo", gesto: "vinculo", escola: "mesa", serve: "social", peso: 3,
    quando: (s) => s.temGrupo,
    forma: "Alguém do meu grupo reage ao que eu fiz — com aprovação, com incômodo, com surpresa — e não comenta.",
    evite: "não faça essa pessoa iniciar uma conversa sobre isso nesta cena",
  },
  {
    id: "confianca_cega", gesto: "me_ve", escola: "tragedia", serve: "social", peso: 3,
    quando: (s) => s.fama >= 25 && s.pessoaNaCena,
    forma: "Alguém confia em mim MAIS do que deveria, com base em nada. E age conforme essa confiança.",
    evite: "não puna essa confiança nesta cena e não me deixe avisar a pessoa com sucesso",
  },

  /* ============ OS DENTES: como o perigo se mostra ============ */
  {
    id: "dentes_em_outro", gesto: "mostra_dentes", escola: "saga", serve: "combate", peso: 5,
    quando: (s) => !s.emCombate && s.momento >= 0.2,
    forma: "Mostre este perigo funcionando em OUTRA COISA primeiro — o que ele já fez, em quem, e como ficou. Eu vejo o resultado, não o ato.",
    evite: "não me atinja nesta cena e não faça o perigo reparar em mim ainda",
  },
  {
    id: "calmo_demais", gesto: "mostra_dentes", escola: "tragedia", serve: "combate", peso: 3,
    quando: (s) => s.ordemDaFase >= 2,
    forma: "O que ameaça está CALMO. Não corre, não grita, não se apressa — e é a calma que diz que ele não tem por que se apressar.",
    evite: "não descreva olhos frios nem sorrisos lentos; a calma aparece no que a coisa faz, não em adjetivo",
  },
  {
    id: "saida_visivel", gesto: "mostra_dentes", escola: "mesa", serve: "combate", peso: 4,
    quando: (s) => s.emMasmorra || s.emCombate || s.pvBaixo,
    forma: "O perigo vem COM a saída à vista: mostre o risco e, na mesma cena, mostre por onde daria para não pagá-lo.",
    evite: "não feche a saída depois de mostrá-la e não a apresente como armadilha óbvia",
  },
  {
    id: "numero_errado", gesto: "mostra_dentes", escola: "guerra", serve: "combate", peso: 3,
    quando: (s) => s.emCombate || s.emMasmorra,
    forma: "Deixe claro que são MAIS do que eu contava — não mostrando todos, mostrando o barulho de mais gente do que os que aparecem.",
    evite: "não invente inimigos: o sistema é quem monta a luta; sugira o volume e pare",
  },
  {
    id: "vem_devagar", gesto: "mostra_dentes", escola: "assombro", serve: "combate", peso: 3,
    quando: (s) => !s.emCombate,
    forma: "O perigo se aproxima DEVAGAR e eu tenho tempo de ver. A lentidão é a ameaça: ela não precisa correr atrás de mim.",
    evite: "não faça a coisa acelerar no fim da cena e não me atinja agora",
  },
  {
    id: "ja_estava_aqui", gesto: "mostra_dentes", escola: "assombro", serve: "combate", peso: 3,
    quando: (s) => s.emMasmorra || s.noite,
    forma: "A coisa já estava nesta cena desde o começo e eu só percebo agora. Releia a cena para mim com esse detalhe no lugar.",
    evite: "não me ataque de surpresa por isso; a percepção é o evento",
  },
  {
    id: "sinal_do_lugar", gesto: "mostra_dentes", escola: "assombro", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => s.emMasmorra || s.emViagem,
    forma: "O AMBIENTE avisa antes: o que os bichos fazem, o que o ar faz, o que parou de acontecer. Sem que ninguém interprete.",
    evite: "não deixe um companheiro traduzir o sinal e não faça o perigo chegar nesta cena",
  },
  {
    id: "perigo_com_rotina", gesto: "mostra_dentes", escola: "guerra", serve: "combate", peso: 3,
    quando: (s) => s.emMasmorra || s.emCidade,
    forma: "O que ameaça tem HORÁRIO e método: faz a mesma coisa sempre, e dá para saber quando. Mostre uma volta do ciclo.",
    evite: "não quebre o padrão nesta cena e não deixe ninguém me explicar o horário",
  },
  {
    id: "arma_errada", gesto: "mostra_dentes", escola: "guerra", serve: "combate", peso: 3,
    quando: (s) => s.emCombate || s.momento >= 0.4,
    forma: "Mostre que o que eu tenho na mão NÃO é o que resolve isto — sem me tirar nada, só deixando claro pelo que acontece.",
    evite: "não quebre nem tire meu equipamento; quem mexe na ficha é o sistema",
  },
  {
    id: "quem_ja_tentou", gesto: "mostra_dentes", escola: "saga", serve: "combate", peso: 3,
    quando: (s) => s.emCidade || s.emMasmorra,
    forma: "Mostre os restos de quem tentou isto antes de mim — equipamento, marcas, a posição em que ficaram. Sem inventário.",
    evite: "não me dê o que sobrou como loot; quem entrega item é o sistema",
  },
  {
    id: "aviso_ignorado", gesto: "chega_gente", escola: "assombro", serve: "social", peso: 3,
    quando: (s) => s.emCidade,
    forma: "Alguém me avisa de um jeito ruim — vago, supersticioso, sem credibilidade. O aviso é verdadeiro e a pessoa é pouco convincente.",
    evite: "não faça a pessoa provar que está certa nesta cena e não a torne ridícula",
  },
  {
    id: "custo_de_olhar", gesto: "duvida", escola: "assombro", serve: "exploracao", peso: 2,
    quando: (s) => s.emMasmorra || s.noite,
    forma: "Descubro uma coisa e a descoberta em si já muda alguma coisa — depois de ver, não dá para desver.",
    evite: "não me aplique efeito mecânico por isso; o preço aqui é de ficção",
  },
  {
    id: "erra_de_proposito", gesto: "mostra_dentes", escola: "tragedia", serve: "combate", peso: 3,
    quando: (s) => s.emCombate && s.ordemDaFase >= 3,
    forma: "O golpe que vem em mim erra de um jeito que deixa claro que foi de PROPÓSITO. Nenhuma explicação.",
    evite: "não faça ninguém comentar que foi de propósito e não repita isso na mesma luta",
  },
  {
    id: "perigo_que_pede", gesto: "mostra_dentes", escola: "assombro", serve: "combate", peso: 3,
    quando: (s) => s.emMasmorra && s.momento >= 0.3,
    forma: "O que ameaça QUER alguma coisa concreta e negociável, e demonstra isso agindo — não falando.",
    evite: "não abra negociação verbal nesta cena e não faça a coisa falar se ela não fala",
  },

  /* ============ O MUNDO GRANDE ============ */
  {
    id: "vida_que_continua", gesto: "mostra_mundo", escola: "saga", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => s.emCidade || s.emViagem,
    forma: "O mundo está fazendo uma coisa que NÃO tem relação comigo, e ela continua acontecendo enquanto eu ajo. Uma frase, sem me envolver.",
    evite: "não transforme isso em gancho, não faça ninguém me olhar e não volte a mencionar",
  },
  {
    id: "duas_versoes", gesto: "duvida", escola: "misterio", serve: "social", peso: 3,
    quando: (s) => s.emCidade && s.momento >= 0.2,
    forma: "Duas pessoas contam a MESMA coisa de dois jeitos incompatíveis, e nenhuma das duas está mentindo por mal.",
    evite: "não revele qual é a verdadeira e não deixe uma terceira pessoa arbitrar",
  },
  {
    id: "poder_cobra", gesto: "mostra_mundo", escola: "ascensao", serve: "exploracao", peso: 3,
    quando: (s) => s.momento >= 0.3,
    forma: "Mostre alguma coisa poderosa acontecendo no mundo e mostre, na mesma cena, o que ela CUSTOU a quem a fez.",
    evite: "não explique o sistema mágico e não faça disso uma aula sobre como o poder funciona",
  },
  {
    id: "preco_das_coisas", gesto: "mostra_mundo", escola: "guerra", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => s.emCidade,
    forma: "Mostre a economia do lugar por um detalhe: o que subiu de preço, o que sumiu das prateleiras, o que virou moeda.",
    evite: "não invente valores para o meu inventário; quem faz preço é o sistema",
  },
  {
    id: "lei_local", gesto: "mostra_mundo", escola: "guerra", serve: "social", peso: 3,
    quando: (s) => s.emCidade,
    forma: "Mostre a lei deste lugar sendo aplicada a OUTRA PESSOA, na minha frente, e ninguém achando estranho.",
    evite: "não me envolva no caso e não faça a punição ser espetacular",
  },
  {
    id: "noticia_de_longe", gesto: "mostra_mundo", escola: "saga", serve: "exploracao", peso: 3,
    quando: (s) => s.emCidade || s.emViagem,
    forma: "Chega notícia de um lugar distante que eu nunca visitei, sobre gente que eu não conheço. Interessante e inútil para mim.",
    evite: "não faça essa notícia virar gancho na mesma cena e não a conecte ao que estou fazendo",
  },
  {
    id: "geracao_anterior", gesto: "mostra_mundo", escola: "formacao", serve: "social", peso: 3,
    quando: (s) => s.emCidade && s.momento >= 0.2,
    forma: "Alguém velho compara isto com uma coisa de antes, e a comparação revela que este mundo já foi diferente.",
    evite: "não faça a pessoa contar a história inteira e não transforme isso em profecia",
  },
  {
    id: "obra_em_curso", gesto: "mostra_mundo", escola: "guerra", serve: "exploracao", peso: 2, sozinha: true,
    quando: (s) => s.emCidade,
    forma: "Uma construção, uma reforma ou uma demolição está em andamento aqui, e vai demorar. Mostre o incômodo cotidiano disso.",
    evite: "não esconda nada dentro da obra e não faça dela cenário de emboscada agora",
  },
  {
    id: "festa_alheia", gesto: "mostra_mundo", escola: "picaresco", serve: "social", peso: 2, sozinha: true,
    quando: (s) => s.emCidade,
    forma: "Está acontecendo uma comemoração que não é minha, com regras que eu não conheço, e ela não para por minha causa.",
    evite: "não me convide para o centro dela e não use a festa para esconder um ataque",
  },
  {
    id: "quem_manda_aqui", gesto: "mostra_mundo", escola: "guerra", serve: "social", peso: 3,
    quando: (s) => s.emCidade,
    forma: "Fica claro quem manda neste lugar por um GESTO pequeno — quem cede passagem, quem é servido primeiro, quem não paga.",
    evite: "não apresente essa pessoa formalmente e não a faça reparar em mim",
  },
  {
    id: "fronteira", gesto: "mostra_lugar", escola: "saga", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => s.emViagem,
    forma: "Mostre que eu atravessei uma fronteira invisível: o jeito de construir muda, o sotaque muda, o que se planta muda.",
    evite: "não coloque um posto de guarda para anunciar isso e não nomeie a divisa",
  },
  {
    id: "religiao_viva", gesto: "mostra_mundo", escola: "saga", serve: "social", peso: 2, sozinha: true,
    quando: (s) => s.emCidade,
    forma: "Mostre uma prática de fé cotidiana e específica deste lugar, feita por gente comum sem cerimônia.",
    evite: "não faça milagre, não confirme nem negue a divindade, e não converta ninguém",
  },
  {
    id: "o_que_sobrou_da_guerra", gesto: "mostra_mundo", escola: "guerra", serve: "exploracao", peso: 3,
    quando: (s) => s.emViagem || s.emCidade,
    forma: "Mostre uma marca de um conflito antigo que o lugar já incorporou ao cotidiano — usada para outra coisa hoje.",
    evite: "não conte a história do conflito e não faça um veterano aparecer para explicá-la",
  },
  {
    id: "mudanca_de_estacao", gesto: "mostra_mundo", escola: "saga", serve: "exploracao", peso: 2, sozinha: true,
    quando: (s) => !s.emMasmorra,
    forma: "Mostre o mundo se preparando para o que vem: a colheita, o frio, a chuva. Todo mundo trabalhando para o mês seguinte.",
    evite: "não use isso como metáfora do que vai acontecer comigo",
  },

  /* ============ A VOZ: como as pessoas falam ============ */
  {
    id: "fala_curta", gesto: "fala", escola: "guerra", serve: "social", peso: 3,
    quando: (s) => s.pessoaNaCena,
    forma: "Quem fala nesta cena fala POUCO — três, quatro palavras por vez. O que falta na fala aparece no que a pessoa faz.",
    evite: "não compense com narração explicando o que a pessoa quis dizer",
  },
  {
    id: "fala_torta", gesto: "fala", escola: "picaresco", serve: "social", peso: 3, precisa: "gente",
    quando: (s) => s.pessoaNaCena,
    forma: "Dê a quem fala um jeito PRÓPRIO de falar — uma palavra que repete, uma construção esquisita, um assunto para o qual sempre volta.",
    evite: "não use sotaque escrito foneticamente e não faça disso piada",
  },
  {
    id: "nao_responde", gesto: "fala", escola: "misterio", serve: "social", peso: 3,
    quando: (s) => s.pessoaNaCena,
    forma: "Eu pergunto e a pessoa responde OUTRA COISA — não por evasão, porque para ela aquilo é a resposta.",
    evite: "não deixe ninguém traduzir a resposta e não insista pela pessoa",
  },
  {
    id: "meio_da_conversa", gesto: "fala", escola: "mesa", serve: "social", peso: 3,
    quando: (s) => s.emCidade,
    forma: "Eu entro no MEIO de uma conversa alheia e pego um pedaço sem contexto. O pedaço faz sentido sozinho e não explica nada.",
    evite: "não me deixe ouvir o começo nem o fim e não faça ninguém repetir para mim",
  },
  {
    id: "mentira_pequena", gesto: "fala", escola: "misterio", serve: "social", peso: 3,
    quando: (s) => s.pessoaNaCena,
    forma: "Alguém mente para mim sobre uma coisa SEM IMPORTÂNCIA, e a mentira é detectável. O motivo não aparece.",
    evite: "não revele por que a pessoa mentiu e não me deixe confrontá-la com sucesso agora",
  },
  {
    id: "verdade_inconveniente", gesto: "fala", escola: "mesa", serve: "social", peso: 3,
    quando: (s) => s.pessoaNaCena,
    forma: "Alguém diz uma verdade constrangedora na frente de todo mundo, sem malícia — porque não ocorreu à pessoa calar.",
    evite: "não faça ninguém repreendê-la e não transforme isso em conflito agora",
  },
  {
    id: "conversa_paralela", gesto: "fala", escola: "picaresco", serve: "social", peso: 2, sozinha: true,
    quando: (s) => s.emCidade,
    forma: "Duas conversas acontecem ao mesmo tempo na cena e se atrapalham. Deixe as duas audíveis pela metade.",
    evite: "não faça as duas convergirem num sentido oculto",
  },
  {
    id: "pergunta_devolvida", gesto: "fala", escola: "mesa", serve: "social", peso: 3,
    quando: (s) => s.pessoaNaCena && s.momento >= 0.2,
    forma: "Alguém responde à minha pergunta com uma pergunta sobre MIM — direta, e difícil de responder de graça.",
    evite: "não responda por mim e não deixe a pessoa desistir se eu não responder",
  },
  {
    id: "quem_nao_fala_comigo", gesto: "fala", escola: "guerra", serve: "social", peso: 3,
    quando: (s) => s.temGrupo || s.pessoaNaCena,
    forma: "Duas pessoas conversam sobre a situação e falam UMA COM A OUTRA, não comigo, como se eu não estivesse decidindo nada.",
    evite: "não me incluam no fim da conversa por educação",
  },
  {
    id: "termo_tecnico", gesto: "fala", escola: "guerra", serve: "social", peso: 2,
    quando: (s) => s.pessoaNaCena,
    forma: "Alguém fala do próprio ofício com vocabulário técnico e não simplifica para mim. Eu entendo pela metade.",
    evite: "não traduza os termos e não faça a pessoa perceber que não entendi",
  },
  {
    id: "silencio_ruim", gesto: "fala", escola: "assombro", serve: "social", peso: 3,
    quando: (s) => s.pessoaNaCena && s.momento >= 0.3,
    forma: "Faço uma pergunta e ninguém responde. O silêncio dura, e a cena segue sem preenchê-lo.",
    evite: "não faça alguém ceder e responder no fim da cena",
  },

  /* ============ O LUGAR: o que o espaço faz ============ */
  {
    id: "espaco_apertado", gesto: "aperta", escola: "guerra", serve: "combate", peso: 3,
    quando: (s) => s.emMasmorra || s.emCombate,
    forma: "O ESPAÇO manda na cena: baixo, estreito, escorregadio, cheio. Mostre a limitação pelo que as pessoas não conseguem fazer.",
    evite: "não me aplique penalidade que o sistema não deu; a limitação é de ficção",
  },
  {
    id: "altura", gesto: "mostra_lugar", escola: "saga", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => s.emViagem || s.emCidade,
    forma: "Use a ALTURA: de cima se vê o que de baixo não se vê, e o que se vê muda o tamanho do problema.",
    evite: "não me revele informação de missão por causa da vista; o que se vê é paisagem",
  },
  {
    id: "lugar_usado_errado", gesto: "mostra_lugar", escola: "guerra", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => s.emCidade || s.emMasmorra,
    forma: "Este lugar foi feito para uma coisa e está sendo usado para OUTRA. Mostre os dois usos ao mesmo tempo.",
    evite: "não conte a história da mudança de uso",
  },
  {
    id: "luz", gesto: "mostra_lugar", escola: "assombro", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => s.emMasmorra || s.noite,
    forma: "A LUZ é o assunto: de onde vem, até onde vai, o que fica de fora. Descreva a borda dela.",
    evite: "não ponha nada no escuro nesta cena; a borda é o que interessa",
  },
  {
    id: "caminho_ruim", gesto: "aperta", escola: "saga", serve: "exploracao", peso: 3,
    quando: (s) => s.emViagem,
    forma: "O trajeto é o problema: a superfície, a inclinação, o que se enrosca. Faça o deslocamento custar atenção.",
    evite: "não me imponha dano nem exaustão; quem cobra o corpo é o sistema",
  },
  {
    id: "dentro_e_fora", gesto: "mostra_lugar", escola: "assombro", serve: "exploracao", peso: 2, sozinha: true,
    quando: (s) => s.emCidade || s.emMasmorra,
    forma: "Mostre a diferença brusca entre o lado de dentro e o de fora deste lugar — temperatura, som, cheiro, gente.",
    evite: "não faça a passagem ser mágica e não sugira que o lugar é maior por dentro",
  },
  {
    id: "quem_mora_aqui", gesto: "planta", escola: "mesa", serve: "social", peso: 3, sozinha: true,
    quando: (s) => s.emMasmorra || s.emCidade,
    forma: "Mostre sinais de que ALGUÉM VIVE aqui: onde dorme, o que come, o que guarda. Sem mostrar a pessoa.",
    evite: "não faça a pessoa aparecer nesta cena e não avalie se ela é perigosa",
  },
  {
    id: "lugar_lembra", gesto: "colhe", escola: "formacao", serve: "exploracao", peso: 3, precisa: "lugar",
    quando: (s) => s.momento >= 0.35,
    forma: "Este lugar se parece com outro onde eu já estive nesta campanha, e a semelhança é de detalhe, não de tipo.",
    evite: "não invente o lugar anterior: use um que existiu de fato",
  },
  {
    id: "obstaculo_burro", gesto: "aperta", escola: "picaresco", serve: "exploracao", peso: 2,
    quando: (s) => !s.emCombate,
    forma: "Uma dificuldade puramente prática e sem drama atrapalha: uma tranca emperrada, um degrau quebrado, algo pesado demais.",
    evite: "não faça isso esconder um perigo e não me peça teste; quem pede dado é o sistema",
  },
  {
    id: "eco_do_espaco", gesto: "mostra_lugar", escola: "assombro", serve: "exploracao", peso: 2, sozinha: true,
    quando: (s) => s.emMasmorra,
    forma: "Use o SOM do lugar: o que ecoa, o que abafa, quanto tempo demora a voltar. O tamanho se ouve antes de se ver.",
    evite: "não ponha uma resposta dentro do eco",
  },

  /* ============ O TEMPO: o que o relógio faz ============ */
  {
    id: "corte_seco", gesto: "emoldura", escola: "mesa", serve: "exploracao", peso: 3, sozinha: true,
    quando: (s) => s.temperatura !== "brasa",
    forma: "Corte o que não importa: pule direto para o instante seguinte que tem alguma coisa em jogo. Comece a cena tarde.",
    evite: "não resuma o que foi pulado e não peça licença para o corte",
  },
  {
    id: "demora", gesto: "emoldura", escola: "guerra", serve: "exploracao", peso: 3,
    quando: (s) => !s.emCombate,
    forma: "Deixe claro que isto vai DEMORAR — horas, dias — e que a espera é parte do custo. Mostre o tédio da espera.",
    evite: "não encha a espera com um acontecimento e não a resolva com um atalho",
  },
  {
    id: "hora_errada", gesto: "fecha", escola: "picaresco", serve: "social", peso: 3,
    quando: (s) => s.emCidade,
    forma: "Chego na hora errada: está fechado, já acabou, ainda não abriu, todo mundo dormindo. O mundo tem horário próprio.",
    evite: "não abra uma exceção para mim e não faça alguém me atender por gentileza",
  },
  {
    id: "enquanto_isso", gesto: "aperta", escola: "saga", serve: "exploracao", peso: 3,
    quando: (s) => s.temRelogio,
    forma: "Deixe entrever que outra coisa avançou enquanto eu fazia isto — por um sinal físico, nunca por um corte para outra cena.",
    evite: "não narre outro lugar e não use \"enquanto isso\"; eu só vejo o que dá para ver daqui",
  },
  {
    id: "cedo_demais", gesto: "emoldura", escola: "misterio", serve: "exploracao", peso: 2,
    quando: (s) => s.momento < 0.5,
    forma: "Chego antes de a coisa acontecer, e o que se vê é o PREPARO — as pessoas se arrumando para algo que ainda não começou.",
    evite: "não deixe o evento acontecer nesta cena e não me expliquem o que vai ser",
  },
  {
    id: "repeticao_do_dia", gesto: "emoldura", escola: "guerra", serve: "exploracao", peso: 2, sozinha: true,
    quando: (s) => !s.emCombate,
    forma: "Mostre que isto acontece TODO DIA aqui, do mesmo jeito, e que hoje não é diferente.",
    evite: "não quebre a rotina no fim da cena com um evento",
  },
  {
    id: "tarde_demais_por_pouco", gesto: "cheguei_tarde", escola: "tragedia", serve: "exploracao", peso: 3,
    quando: (s) => s.momento >= 0.4 && s.temRelogio,
    forma: "Chego pouco tempo depois: dá para ver que faltou pouco, pelo estado das coisas. Sem que ninguém calcule o quanto.",
    evite: "não me dê chance de alcançar e não faça ninguém dizer \"se você tivesse chegado antes\"",
  },
  {
    id: "sem_pressa_nenhuma", gesto: "emoldura", escola: "mesa", serve: "social", peso: 2, sozinha: true,
    quando: (s) => s.temperatura === "fria",
    forma: "Ninguém aqui tem pressa, e a cena acompanha esse ritmo. Deixe uma coisa acontecer devagar até o fim.",
    evite: "não introduza urgência no último parágrafo",
  },

  /* ============ O CORPO: o que se carrega ============ */
  {
    id: "cansaco", gesto: "mostra_corpo", escola: "guerra", serve: "exploracao", peso: 3,
    quando: (s) => s.emViagem || s.emMasmorra || s.pvBaixo,
    forma: "Mostre o cansaço no que é PRÁTICO: a mão que não fecha direito, a distância que parece maior, o que se derruba.",
    evite: "não me aplique exaustão nem penalidade; o sistema é quem mexe na ficha",
  },
  {
    id: "cicatriz_notada", gesto: "mostra_corpo", escola: "saga", serve: "social", peso: 3, precisa: "passado",
    quando: (s) => s.temCicatriz && s.pessoaNaCena,
    forma: "Alguém repara numa marca que eu carrego e reage — reconhece, evita olhar, ou pergunta do jeito errado.",
    evite: "não invente uma cicatriz que eu não tenho e não conte a história dela por mim",
  },
  {
    id: "fome", gesto: "mostra_corpo", escola: "guerra", serve: "exploracao", peso: 2,
    quando: (s) => s.emViagem || s.emMasmorra,
    forma: "A necessidade banal do corpo entra na cena — fome, sede, frio, bexiga — e atrapalha o que é importante.",
    evite: "não transforme isso em emergência e não faça disso comédia",
  },
  {
    id: "peso", gesto: "mostra_corpo", escola: "guerra", serve: "exploracao", peso: 2,
    quando: (s) => s.emViagem || s.emMasmorra,
    forma: "O que eu carrego pesa, e o peso aparece: onde marca, o que faz barulho, o que precisa ser reajustado.",
    evite: "não tire nada do meu inventário; quem mexe na carga é o sistema",
  },
  {
    id: "reflexo", gesto: "mostra_corpo", escola: "guerra", serve: "combate", peso: 3,
    quando: (s) => s.emCombate || s.temCicatriz,
    forma: "Meu corpo reage antes de mim: recuo, guarda, o passo que já sabe. Mostre a competência que virou automática.",
    evite: "não decida a minha ação por causa disso; o reflexo é descrição, não escolha",
  },
  {
    id: "sangue_visivel", gesto: "mostra_corpo", escola: "guerra", serve: "combate", peso: 3,
    quando: (s) => s.pvBaixo,
    forma: "O estrago está VISÍVEL para os outros, e eles reagem ao que veem — recuam, se oferecem, aproveitam.",
    evite: "não me cause dano adicional e não descreva ferimento que o sistema não registrou",
  },
  {
    id: "mao_firme", gesto: "mostra_corpo", escola: "mesa", serve: "combate", peso: 2,
    quando: (s) => s.nivel >= 5,
    forma: "Mostre uma competência minha em coisa PEQUENA e física, feita sem esforço, que outra pessoa acharia difícil.",
    evite: "não converta isso em teste nem em vantagem mecânica",
  },
  {
    id: "corpo_do_outro", gesto: "mostra_corpo", escola: "tragedia", serve: "social", peso: 3,
    quando: (s) => s.pessoaNaCena && s.momento >= 0.3,
    forma: "Mostre no corpo de OUTRA PESSOA o que a vida dela cobrou: as mãos, as costas, o que ela não faz mais.",
    evite: "não faça a pessoa contar como ficou assim",
  },

  /* ============ A DÚVIDA ============ */
  {
    id: "coincidencia", gesto: "duvida", escola: "misterio", serve: "exploracao", peso: 3,
    quando: (s) => s.momento >= 0.25,
    forma: "Duas coisas acontecem juntas de um jeito que PARECE ligação e pode não ser. Ponha as duas na mesma cena e cale.",
    evite: "não confirme nem negue a ligação e não deixe ninguém teorizar",
  },
  {
    id: "fonte_ruim", gesto: "duvida", escola: "misterio", serve: "social", peso: 3,
    quando: (s) => s.emCidade,
    forma: "A informação boa vem de quem não merece crédito: bêbado, criança, inimigo, louco. E está certa.",
    evite: "não valide a fonte nesta cena e não faça ninguém confirmar a informação",
  },
  {
    id: "peca_que_sobra", gesto: "duvida", escola: "misterio", serve: "exploracao", peso: 3,
    quando: (s) => s.momento >= 0.3,
    forma: "Tudo se explica, MENOS UMA COISA — e essa coisa fica pendurada, pequena e incômoda, sem ninguém apontá-la.",
    evite: "não resolva a peça que sobra e não a transforme em pista declarada",
  },
  {
    id: "resposta_boa_demais", gesto: "duvida", escola: "misterio", serve: "social", peso: 3,
    quando: (s) => s.pessoaNaCena && s.momento >= 0.3,
    forma: "Alguém me dá uma explicação que fecha PERFEITAMENTE. Perfeita demais, e ninguém repara nisso além de mim.",
    evite: "não revele se a explicação é falsa e não plante uma contradição óbvia",
  },
  {
    id: "quem_pergunta_de_mim", gesto: "duvida", escola: "misterio", serve: "social", peso: 3,
    quando: (s) => s.emCidade && s.fama >= 10,
    forma: "Fico sabendo que alguém andou perguntando de mim aqui. Sem descrição útil de quem era.",
    evite: "não me deixe encontrar essa pessoa nesta cena e não revele para quem ela trabalha",
  },
  {
    id: "muda_de_ideia", gesto: "duvida", escola: "misterio", serve: "social", peso: 3, precisa: "gente",
    quando: (s) => s.pessoaNaCena && s.momento >= 0.3,
    forma: "Alguém que já se posicionou nesta campanha mudou de posição, e trata a mudança como se sempre tivesse pensado assim.",
    evite: "não explique a mudança e não me deixe confrontar a pessoa com sucesso",
  },
  {
    id: "documento_incompleto", gesto: "duvida", escola: "misterio", serve: "exploracao", peso: 2,
    quando: (s) => s.emCidade || s.emMasmorra,
    forma: "Um registro escrito está incompleto — falta uma página, um trecho apagado, uma linha rasurada. O que sobrou é legível.",
    evite: "não reconstitua o que falta e não faça alguém lembrar do conteúdo",
  },
  {
    id: "ninguem_concorda", gesto: "duvida", escola: "misterio", serve: "social", peso: 3,
    quando: (s) => s.emCidade,
    forma: "Pergunto a mesma coisa a três pessoas e recebo três respostas diferentes, todas ditas com certeza.",
    evite: "não sinalize qual está certa e não faça uma quarta pessoa resolver",
  },

  /* ============ O VÍNCULO ============ */
  {
    id: "quem_fica", gesto: "vinculo", escola: "mesa", serve: "social", peso: 3,
    quando: (s) => s.temGrupo,
    forma: "Alguém do meu grupo faz uma coisa por mim sem avisar e sem cobrar. Mostre depois de feito.",
    evite: "não faça a pessoa mencionar o que fez e não me dê chance de agradecer agora",
  },
  {
    id: "discordancia_leal", gesto: "vinculo", escola: "mesa", serve: "social", peso: 3,
    quando: (s) => s.temGrupo && s.momento >= 0.3,
    forma: "Alguém do meu grupo DISCORDA do rumo e diz isso — e segue comigo mesmo assim.",
    evite: "não faça a pessoa ameaçar sair e não resolva a discordância nesta cena",
  },
  {
    id: "vida_propria", gesto: "vinculo", escola: "mesa", serve: "social", peso: 3,
    quando: (s) => s.temGrupo,
    forma: "Alguém que anda comigo tem um assunto próprio acontecendo agora, e ele não tem nada a ver com a aventura.",
    evite: "não converta o assunto dessa pessoa em missão e não o resolva nesta cena",
  },
  {
    id: "quem_apresenta", gesto: "vinculo", escola: "saga", serve: "social", peso: 3, precisa: "gente",
    quando: (s) => s.emCidade,
    forma: "Alguém que eu conheço me apresenta a outra pessoa, e a apresentação diz mais sobre quem apresenta do que sobre quem é apresentado.",
    evite: "não invente relações que não existem nesta campanha",
  },
  {
    id: "favor_devolvido", gesto: "vinculo", escola: "saga", serve: "social", peso: 3, precisa: "passado",
    quando: (s) => s.momento >= 0.35,
    forma: "Alguém devolve um favor antigo em MOMENTO RUIM — a ajuda chega, e chega atrapalhando.",
    evite: "não faça a ajuda ser inútil e não deixe a pessoa perceber que atrapalhou",
  },
  {
    id: "quem_nao_perdoou", gesto: "vinculo", escola: "tragedia", serve: "social", peso: 3, precisa: "passado",
    quando: (s) => s.momento >= 0.4,
    forma: "Alguém não me perdoou por uma coisa, e não vai perdoar. Trata-me com correção fria e nada mais.",
    evite: "não me dê oportunidade de reconciliação nesta cena",
  },
  {
    id: "presenca_calada", gesto: "vinculo", escola: "mesa", serve: "social", peso: 2,
    quando: (s) => s.temGrupo && s.pvBaixo,
    forma: "Alguém simplesmente FICA comigo, sem falar e sem resolver nada. A companhia é o gesto inteiro.",
    evite: "não faça essa pessoa dizer uma frase de conforto no fim",
  },
  {
    id: "ciume_de_oficio", gesto: "vinculo", escola: "picaresco", serve: "social", peso: 2,
    quando: (s) => s.emCidade && s.nivel >= 4,
    forma: "Alguém que faz o mesmo que eu me trata como concorrência, e trata mal com pequenez, não com grandeza.",
    evite: "não faça essa pessoa virar inimiga de verdade e não a humilhe",
  },
];

export function jogadaPorId(id) { return JOGADAS.find((j) => j.id === id) || null; }
