# MM11 · a quinta sessão de prova — transcrição

> **Campanha:** *Prova da Mesa V* · Uma Vida · Fantasia medieval · Terras abertas · Jornada do Herói · voz por omissão
> **Herói:** Gaspar Torquato — homem, Meio-orc, Clérigo (Sacerdote), Herborista, Acólito Fugitivo. Pontos: Vigor +2 · Percepção +2 ·
> Presença +1 · Força +1. 20 PV, 14 PM, 15 moedas, treinado em Intuição. Conceito: *clérigo que fugiu do mosteiro de um deus que
> cobrava demais e agora cura quem não pode pagar*. Outro sexo, outra raça, outra classe e outro antecedente que a Iara, a Brites,
> a Sibila (o sexo repete o do Tobias) — e é a primeira sessão de **homem Clérigo**.
> **Companheiro de antes:** Hakon Guarda-Portão — Guerreiro, "credor", 12 PV, no grupo desde o turno 1. Na pauta: *"dívida comigo · o
> homem a quem o herói deve mais do que dinheiro; conhecem-se há 2 anos · antes de andar com o herói: taverneiro(a)"*.
> **Respostas do Mestre: 64** (64 chamadas ao Narrador; **46 de cena** e **18 de combate e morte**; mais o Léxico na criação). Um dia
> de jogo: 1 de Brumal 08:00 → 16:12. Nenhuma chamada falhou por defeito do jogo; **três foram recusadas (HTTP 402, "Insufficient
> Balance")** entre M9 e M10, porque o crédito dos dois provedores acabou a meio da sessão — o jogo mostrou a voz de mundo *"a mesa
> do Mestre está fechada por agora… a sua frase espera por você"*, guardou a frase, e ao recarregar o crédito "Continuar aventura"
> devolveu-a no campo (**a recusa foi bem tratada**). A sessão acabou **num combate sem saída** (M55–M64): o herói morreu, passei o
> fio a Inês Torquato, e a luta continuou aberta com todos caídos e o Dragão a 3/29 PV.
> **Jogada por:** o `tester`, a 11/10, sobre `v9.393` (`9e6f656`), navegador do painel (**800×451**), campanha nova criada pela tela.
> **Como se conferiu:** um gancho em `fetch` mandou **toda** chamada a `/api/*` — hora, endereço, tamanho, o pedido inteiro e a
> resposta — para um servidor local que guardou um JSONL no scratchpad (`registo-s5.jsonl`, 130 chamadas). Quem chamou saiu do
> prompt de sistema. Cada resposta foi lida contra a pauta desse turno por scripts (só os números e as linhas de que se precisou;
> nenhum prompt inteiro foi lido) e contra o save. O localStorage foi lido antes (`taverna_cfg_golpe_final=perguntar`,
> `taverna_cfg_rolagens=1`) e, no fim, **com o jogo desmontado**, apagou-se só a chave que a sessão criou — `taverna_save_v1` —, e as duas de antes ficaram, com os mesmos valores, por leitura (o rascunho não chegou a existir).
> **Medida de passagem:** ao fim, `npcs` = 4 (um deles **o taverneiro, registado como "Taverna Candeia Faiscante"**, e **Edric duas
> vezes**), `canone` = 10 entradas, `prometido.sementes` = **8** (5 cobradas, 1 paga, 2 abertas), `reviravolta` e
> `reviravoltaMaior` = **null**, a missão do fio **0 de 2 etapas** e a espinha com 1 marco feito.

Convenção: a das quatro primeiras. **J** é o que o jogador escreveu (ou tocou). **M** é o Mestre, encurtado com "…" e nunca
reescrito; o número é o da resposta (M1–M64). `SISTEMA` são as linhas da tela que não são do Mestre. À margem, em *itálico*, o que
se provou ou partiu. **Os combates não têm campo de texto** (só botões e um "como?" opcional), por isso as linhas J do combate são o que cliquei.

---

## Parte 1 — a chegada, a Candeia e o mercado (M1–M12)

**J0** (a abertura — o Mestre abre a campanha)
**M1** A estrada de terra batida desemboca na porta de Casa da Fonte, e a cidade cheira a cera, tinta e perfume caro — cheiro de quem vive de vender o que os outros trazem. A muralha de pedra cinzenta ergue-se diante de você, com dois guardas de capacete lustroso no portão, e um deles já estende a mão sem levantar os olhos da prancheta. "Salvo-conduto. Selo e nome. Sem isso, não passa." Hakon Guarda-Portão, ao seu lado, ri baixo e cutuca sua costela com o cotovelo. "Pois é. Cidade fina, essa. Cobram até pra respirar." A…
*a lei da porta é dita à chegada ("Salvo-conduto. Selo e nome"); Hakon cobra à vista; um morto, uma ordem e um nome (Edric) no primeiro parágrafo. `lei.porCidade` fica vazio.*

**J2** Hakon, de onde nos conhecemos mesmo? E por que continuas ao meu lado? Quem foi Edric para o homem que morreu?
**M2** Hakon ri, um som baixo e rouco, e cospe no chão antes de responder. "De onde nos conhecemos? Ora, Torquato, do jeito que todo mundo conhece um Guarda-Portão: você me devia, e eu cobro andando junto." Ele ajusta o cinto, olhando a praça, e a voz baixa um tom. "Faz dois anos. Você não lembra porque estava ocupado demais fugindo. Eu não esqueci porque perdi a pousada por sua causa. Mas agora somos sócios: você me paga, eu não te perco de vista. Simples." Há um peso aí, mas não é só dívida — é como se ele tivesse…
*respondeu 3 de 3; "dois anos" e "taverneiro" vêm da pauta; a pousada e "o último recado" não.*

**J3** Vamos à Candeia Faiscante falar com Osric. Quero ver como é o lugar por dentro e pergunto ao taverneiro: o que sabe de Edric?
**M3** A porta da Candeia Faiscante range quando você a empurra, e o cheiro de cerveja azeda e gordura queimada sai de dentro como um bafo. O salão é escuro, com mesas de madeira gasta encostadas nas paredes e um fogo baixo na lareira, lançando sombras que dançam. Atrás do balcão, um draconato de escamas opacas e um olho coberto por uma bandagem seca uma caneca sem pressa. Ele levanta os olhos quando você entra e sorri, um sorriso que não sobe ao outro olho. "Bem-vindo, forasteiro. Bebe ou pergunta? Porque perguntar…
*Edric a 12 km: do sistema. O taverneiro nunca diz o nome — o Cronista o registará como "Taverna Candeia Faiscante".*

**J4** Quanto custa um quarto por uma noite? E me diz uma coisa, taverneiro: quem manda nesta cidade, e o que eu preciso saber da lei daqui para não acabar na cadeia?
**M4** O draconato inclina a cabeça, o olho bom fixo em você. "Quarto? Oito cunhas, com direito a cama e a fechadura. Se quiser janta junto, são mais três." Ele larga a caneca e apoia as mãos no balcão, as escamas fazendo um ruído seco. "Quem manda aqui? Os mordomos do cântaro. A lei é a deles: mantenha seu juramento, e nada lhe cobram. Quebre uma promessa, e eles cobram. Simples." Hakon se aproxima, balançando a cabeça. "Isso não responde a pergunta dele, réptil. Como é que se vive com essa gente?" O taverneiro sorri de…
*quarto (8–15) e lei do sistema; o salvo-conduto reaparece só como garrancho. Duas leis.*

**J5** Pago a cerveja e pergunto baixo: ouvi na estrada falar de um lugar a nordeste, a Boca de Pedra Torta. Por que ninguém diz esse nome em voz alta? O que mora lá?
**M5** O draconato aceita as moedas e desliza uma caneca de cerveja escura pelo balcão, sem tirar o olho bom de você. "A Boca de Pedra Torta?" Ele baixa a voz, o corpo inclinado sobre o balcão como se a própria madeira pudesse ouvir. "As pessoas daqui não dizem esse nome porque acham que ele atrai o que mora lá. É uma caverna, a quatro horas de marcha para o nordeste. Já subiu gente para caçar, e voltou contando que as paredes sussurram. Mas o que mora lá... ninguém sabe direito. Só dizem que ninguém que entrou de noite…
*a Boca a 4 h a nordeste: do sistema; "ninguém que entrou de noite voltou": do Mestre.*

**J6** Agradeço, termino a cerveja e saio para a praça. Procuro o mural de cartazes… (o sistema leu "vasculhar o lugar", teste de Percepção 5+2=7, falha)
**M6** Você começa a observar a sala, procurando algum sinal de Edric nas sombras, mas seus olhos passam pelas mesas e não encontram nada além de migalhas e manchas de cerveja. Você remexe um pouco, mas logo seus movimentos atraem a atenção do taverneiro, que ergue o olho bom e franze a testa. "Ei, forasteiro, se vai derrubar as coisas, avisa antes." Hakon solta uma risada baixa e balança a cabeça. O silêncio da sua busca se quebra, e a sala parece menor agora, com todos os olhares caídos sobre você. O taverneiro volta a…
***defeito A**: "saio e procuro o mural" lido como "vasculhar o lugar" (Percepção 5+2 vs 13, falha): a busca foi narrada **na taverna**; "o lugar fica remexido, o que qualquer um nota".*

**J7** Saio da taverna, sem remexer em mais nada, e caminho até a praça. Procuro o mural de cartazes no meio dela.
**M7** Você sai da Candeia Faiscante e a luz da praça do Mercado do Ogro bate em você como um balde de água fria. O pregão dos vendedores enche o ar, e Hakon caminha ao seu lado, resmungando baixo. "Não sei por que ainda procuramos mural. Aqui tem mais espião que peixe no rio." Você atravessa a multidão até o meio da praça, onde um poste de madeira escura sustenta um mural de tábuas gastas, cobertas de cartazes amarelados e anúncios rasgados. Você estica o pescoço para ler, mas antes que consiga, uma mulher de manto…
*só depois de eu reescrever a frase ("sem remexer em mais nada") é que o herói chega à praça.*

**J8** Leio os cartazes do mural, um por um, com calma.
**M8** Você se aproxima do mural e começa a ler os cartazes, um por um, com calma. A tinta de alguns borrou com a chuva da primavera, e o paper antigo range sob seus dedos. Hakon fica ao seu lado, os braços cruzados, e assovia baixo, impaciente. "Isso aí não paga dívida, Torquato." Um vendedor de vassouras grita preço ao lado, e a multidão do mercado se agita em volta, mas ninguém presta atenção em você. Você encontra avisos de procura, anúncios de trabalho e promessas de recompensa, mas nada sobre Edric. O sol da manhã…
*a leitura do mural não dá **um** cartaz; "o paper antigo" (palavra inglesa); `mural` = [] no save.*

**J9** Deixo o mural. Hakon, chega de resmungar. Vamos ao mercado: quero comprar tochas, uma corda e rações para uns três dias de estrada. Quanto custa tudo?
**M9** Você se afasta do mural, e Hakon solta um suspiro exagerado. "Resmungar? Eu só falo o que penso. E penso que esse tal Osric não estava na taverna e o lagarto do balcão só nos enrolou. Mas se vamos ao mercado, então se apresse: o dia está só começando e já andamos mais do que um monge em jejum." O Mercado do Ogro ferve à sua volta: bancas de madeira escura exibem panos tingidos, potes de mel, facas baratas e saquinhos de especiarias. O cheiro de cera e tinta se mistura ao sal e ao couro curtido. Você avista a banca…
*preço inventado; **Hakon**: "esse tal Osric não estava na taverna e o lagarto do balcão só nos enrolou".*

**J10** Pago as onze cunhas pela corda boa, as tochas e as rações. Anão… viste passar alguém que procurasse um tal de Edric? (o oráculo respondeu por cima: "Sim, e ainda mais…")
**M10** O anão morde o barbante e solta uma risada curta. "Onze cunhas, então. Fechado." Ele junta as tochas, a corda boa e as rações num embrulho de pano grosso e empurra para você, sem pressa. Quando você pergunta sobre Edric e a Ponte Lenta, ele para, os olhos baixos, e o rosto dele se fecha um pouco. "Um tal de Edric? Vi sim, há uns dois dias. Um sujeito magro, com uma cicatriz no queixo, comprou rações e perguntou se alguém andava perguntando por ele. Disse que ia para a Ponte Lenta, e que se alguém atrás dele…
*o oráculo rolou 5 ("SIM, E AINDA MAIS") e o Mestre pôs o corpo (magro, cicatriz, moeda falsa). **As 11 cunhas não foram debitadas**; o herói já tinha 10 rações e 5 tochas.*

**J11** Pego a moeda falsa e o recado e examino a moeda de perto, o fio de cobre. Pergunto ao anão onde se faz moeda assim, e quanto ele quer pelo que sabe do Edric.
**M11** Você pega a moeda e a examina de perto. O fio de cobre é fino, quase invisível, mas corre pelo centro como uma veia escura. O anão apoia os cotovelos na banca e sorri, um sorriso que não esconde nada. "Moeda assim? Só os cambistas do beco têm mão pra isso. Mas esse fio aí é novo até pra eles. Eu diria que é de fora, ou de alguém que quer parecer de fora." Ele cruza os braços. "E pelo que sei do Edric, já te contei. Agora, se quiser mais, custa. Cinco cunhas. E não é pela moeda, é pelo risco." Hakon solta um…
*respondeu 2 de 2 (cambistas do beco: inventado, sem custo).*

**J12** Pago as cinco cunhas. Agora conta o que ainda não contou: a que horas ele passou, que direção tomou, e se ia sozinho.
**M12** O anão pega as cinco cunhas e as desliza para dentro do avental com um gesto rápido. "Às vésperas do meio-dia, dois dias atrás. Ia sozinho, com uma trouxa pequena e um passo que não olhava para trás. Tomou a estrada do norte, e disse que na Ponte Lenta os relógios andam tortos." Ele baixa a voz, olhando de relance para os lados. "E não me pergunte mais, porque o que ele carregava fazia tilintar como vidro, e o cheiro era de coisa que não se compra no Mercado do Ogro." Hakon se adianta, o queixo duro. "Vidro e…
*−5 moedas, +17 XP. Fecha a multidão que "engole vocês".*

---

## Parte 2 — a estrada e a espera de propósito (M13–M27)

*Daqui a M27 **empaquei de propósito**: do M16 ao M27 não toquei o fio — sentei na margem, contei as tochas, dormi, pedi histórias
a Hakon. Ver "O mundo que anda quando empacas".*

**J13** Chega de conversa, Hakon. Vamos atrás dele: tomamos a estrada do norte para a Ponte Lenta, em Rio Profundo.
**M13** Hakon já está se virando para a estrada quando você fala, o passo largo e a mão no cabo da espada. "Finalmente. Estava começando a achar que você ia comprar a cidade inteira primeiro." A estrada do norte se abre diante de vocês, batida e poeirenta, ladeada por moitas e ervas altas. O rio corre ali perto, e o barulho da água na roda da azenha se mistura ao canto dos pássaros. Vocês atravessam a ponte que balança — tábuas gastas rangendo sob as botas — e seguem para o norte, deixando Casa da Fonte para trás. O céu…
*S: "azenha do rio, 32 min". Hakon pergunta por Osric como alguém que ainda não vimos.*

**J14** O draconato do balcão da Candeia era o Osric, não era? Ele nunca disse o próprio nome. Hakon, por que falas dele como se não o tivéssemos visto? E quanto falta até a Ponte Lenta?
**M14** Hakon estreita os olhos para a estrada e solta um grunhido. "Pode ser, Torquato. Mas o lagarto não estava exatamente se apresentando. Se ele era o Osric, então mentiu para nós e ficou de olho enquanto você remexia a taverna. E se ele não era, então o Osric anda escondido e mandou um capanga. De todo jeito, voltar lá agora seria como pedir um tapa na cara." Ele chuta uma pedra do caminho e continua. "E de distância, são doze quilômetros, o anão já disse. Com esse sol, chegamos antes do meio-dia na Ponte Lenta. Mas…
*esquiva: "pode ser… se ele era, mentiu". O sistema sabia (missão: Osric na Candeia). S: o `lugar` passa a "Ponte Lenta (arredores de Casa da Fonte)" **sem eu ter chegado**; 9h.*

**J15** Continuamos a caminhar até chegarmos à Ponte Lenta. Quando a vir, paro a uma distância segura e observo o lugar e quem está nele antes de me aproximar.
**M15** Você e Hakon caminham pela estrada do norte, e o mato dos dois lados começa a se fechar, com o cheiro de terra úmida subindo do chão. Depois de quase meia hora, a Ponte Lenta aparece diante de vocês: uma extensa ponte de madeira escura, torta, com tábuas gastas e cordas velhas, balançando sobre um rio de águas barrentas. No meio dela, um homem magro está parado, de costas, os ombros caídos, como se esperasse alguém. Hakon puxa a espada e se agacha ao seu lado, os olhos fixos no homem. "É o Edric? Ou só mais um…
*"depois de quase meia hora": 12 km em ~40 min de relógio. Um homem magro de costas na ponte. S: "Corwin o Silencioso tem um trabalho no mural".*

**J16** Não vou ao homem ainda. Sento na margem, bebo da água do rio e pergunto a Hakon se ele sabe nadar e há quanto tempo anda com espada.
**M16** Você se senta na margem, sentindo a grama úmida ceder sob você, e leva as mãos em concha para beber a água barrenta do rio. Hakon fica de pé, os olhos ainda presos no homem da ponte, e demora a responder. "Nadar? Sei. Mas não gosto. Água fria me dá cãibra e cãibra em cobrador é sinal de azar." Ele tira a espada da bainha e apoia a ponta no chão, como se a pergunta o tivesse feito lembrar do peso. "E esta aço me acompanha faz uns quinze anos, desde antes de eu virar Guarda-Portão. Mas te digo: quem fica parado numa…

**J17** Continuo sentado. Tiro da bolsa o símbolo sagrado riscado e o viro nos dedos, em silêncio, pensando na ordem de que fugi. Hakon, o que achas que a ordem faria se me achasse aqui?
**M17** O sol já subiu um pouco, e a luz atravessa as folhas, desenhando sombras finas na sua mão enquanto você gira o símbolo sagrado riscado. Hakon se agacha ao seu lado, os olhos ainda na ponte, e demora a responder. "A ordem? Te levariam de volta amarrado, e se resistisse, te deixariam no chão da capela até ajoelhar. E não ia adiantar rezar, porque eles é que mandam nos santos." Ele cuspiu no rio, e a água levou a saliva embora. "Mas não vão te achar aqui. Quem foge de mosteiro não fica parado em beira de rio.…

**J18** Aproveito a espera para limpar a lama das botas, contar as moedas e conferir as tochas e as rações da bolsa. Quantas tochas e rações tenho ao certo?
**M18** Você fica sentado na margem, o sol subindo devagar, e começa a limpar a lama das botas com um punhado de grama seca. Hakon, ao seu lado, desvia os olhos da ponte e observa seus movimentos. "Cuidado com a mão, Torquato. Lama de rio esconde pedra afiada e pedra afiada esconde dívida antiga." Ele solta um riso baixo, mas os olhos continuam duros. Você então conta as moedas no saquinho de couro — o peso é pequeno, mas suficiente para um quarto e uma refeição, se preciso. Depois confere as tochas e as rações na bolsa:…

**J19** Tiro um cochilo curto à sombra de uma árvore, deixando Hakon vigiar. Acordo quando o sol passar da copa.
**M19** Você se recosta à sombra de uma árvore de folhas largas, e o cansaço da estrada pesa de repente nos ombros. Hakon fica de vigília, a espada apoiada no ombro, os olhos indo da ponte para a estrada e da estrada para o rio. O homem na ponte não se moveu. O som da água correndo é baixo e constante, como uma respiração. Você fecha os olhos por um instante, e quando os abre, o sol já passou da copa, descendo para a tarde. Hakon encosta-se no tronco, mastigando um pedaço de carne-seca. "Você ronca pouco, Torquato. Isso é…

**J20** Levanto, espreguiço e pergunto a Hakon que horas são e se vale a pena esperar até o homem sair da ponte, ou se ele pode ficar ali o dia inteiro.
**M20** Você se levanta, espreguiçando os ombros cansados, e Hakon pisca devagar, o sol da tarde atravessando as folhas. "Horas? O sol ainda não passou da copa, mas o dia não espera. E aquele ali..." Ele aponta com o queixo para o homem da ponte. "Pode ficar plantado até a noite, e pior: pode ser isca. Se fosse eu, ou ia para cima ou dava a volta. Mas você é o clérigo; eu só guardo a porta." Hakon solta um riso curto e se encosta de novo no tronco, a espada descansando na coxa, os olhos fixos em você à espera de uma…
***M20 = o 4.º turno sem avanço: o sinal chega à pauta** ("um presságio gratuito"); a tela ganha o sol e uma pergunta sem resposta.*

**J21** Não vou a nenhum lado. Pergunto a Hakon o que ele sabe da vida dos clérigos de mosteiro, e se acha que os deuses cobram caro. Depois fico a olhar as nuvens.
**M21** Hakon solta um grunhido, e por um momento o som do rio fica mais alto que a voz dele. "Clérigo de mosteiro? Sei que dormem em pedra fria e acordam antes do sol. E que os deuses cobram caro, sim — mas pagam mal." Ele se senta na margem, ao seu lado, e arranca uma folha de grama para morder. "Minha avó dizia que todo deus é sócio de um cobrador. E olha que ela rezava todos os dias, a velha." Hakon ri baixo, mas não tira os olhos do homem da ponte, que continua imóvel como um poste carunchado. "Agora me diz, Gaspar:…

**J22** Respondo a Hakon: depende de quem viesse. Fico mais um tempo sentado, brincando com uma pedra do rio, sem decidir nada. Pergunto se ele quer dividir a carne-seca.
**M22** Hakon solta um riso curto, como se já esperasse a resposta. "Depende de quem viesse. Pois então reze para que, se vierem, venham devagar e com fome, porque a porta é a espada, e a espada é eu." Ele se senta ao seu lado, arrancando um tufo de grama e atirando-o no rio. Você fica mais um tempo sentado, os dedos girando uma pedra lisa do rio. O sol da tarde desce devagar, e o barulho da água enche o ar entre vocês. Quando você oferece a carne-seca, Hakon divide sem cerimônia, rasgando o pedaço com os dentes. "Dívida…

**J23** Deito de costas na grama e fecho os olhos, ouvindo o rio. Não faço mais nada. Digo a Hakon que acorde-me se algo mudar.
**M23** Hakon solta um grunhido, e por um momento o som do rio fica mais alto que a voz dele. "Deitar? Agora? Torquato, esse homem na ponte já parece ter criado raiz, e você quer tirar um segundo cochilo?" Ele se ajeita na sombra, a espada atravessada no colo, e olha de relance para você. "Tudo bem, durma. Mas se ele se mexer, eu grito e acordo até os mortos." O barulho da água se torna constante, e o cheiro de terra molhada sobe da margem. Você sente o peso do sol no rosto, mas uma águia grita alto, cortando o céu, e…
***o 7.º: "alguém vem buscar-te"** chega à pauta ("na taverna"); a tela tem uma águia.*

**J24** Abro um olho e pergunto: alguma coisa mudou? Alguém na estrada, algum barulho? Continuo deitado, sem sair do lugar.
**M24** Hakon solta um grunhido, e por um momento o som do rio fica mais alto que a voz dele. "Mudou nada. O desgraçado na ponte ainda é uma estátua. E a estrada... silêncio. Até os bichos parecem estar de luto." Ele se ajeita na sombra, a espada atravessada no colo, e olha de relance para você. "Mas se você quer dormir de novo, dorme. Eu fico de olho no poste carunchado." O barulho da água se torna constante, e o cheiro de terra molhada sobe da margem. Você sente o peso do sol no rosto, mas uma águia grita alto, cortando…

**J25** Respondo que tenho fome e peço a Hakon que fale de outra coisa qualquer, qualquer história de estrada. Fico onde estou, sem tocar na ponte nem no homem.
**M25** Hakon solta um grunhido, e por um momento o som do rio fica mais alto que a voz dele. "História de estrada? Vou contar a do dia em que caiu um raio numa carroça cheia de queijo e o dono saiu ileso, mas ficou com medo de trovão para o resto da vida. Ele agora dorme com a cabeça enfiada num tonel." Ele ri baixo e se ajeita na sombra, a espada atravessada no colo. "Mas o caso é que o queijo fedia a chifre queimado por duas léguas, e eu nunca mais comi queijo sem olhar para o céu primeiro." O barulho da água se torna…

**J26** Peço outra história, Hakon. E espreguiço outra vez; ainda não quero me mexer da sombra.
**M26** Hakon ri baixo, e o som se mistura ao barulho da água. "Outra história? Então escuta essa: uma vez, a caminho de uma cidade, vi um homem de costas para a estrada, parado sob uma árvore, sem se mexer. Fiquei com medo; achei que era assombração. Quando cheguei perto, era um espantalho velho, esquecido por um lavrador." Ele faz uma pausa, e o rio continua a correr. "Mas o tal lavrador tinha morrido há três anos, e ninguém sabia quem continuava trocando a roupa do espantalho a cada lua nova." Ele se inclina para trás,…
***o 10.º: "o mundo cobra"** chega à pauta ("desabamento, enchente, bloqueio"); a tela tem uma história de espantalho.*

**J27** Fico. Pergunto a Hakon se ele não acha esquisito que ninguém passe por esta estrada o dia inteiro.
**M27** Hakon solta um grunhido e olha para a estrada vazia, com as mãos apoiadas na espada. "Esquisito? É a primeira vez que você vê uma estrada sem alma? Em dia de feira, o povo fica na cidade. Mas não se engane: estrada parada é como panela sem fogo—ou ninguém tem pressa, ou ninguém quer ser visto." Ele se senta ao seu lado, nas costas, e joga uma pedra no rio. O homem na ponte continua imóvel, com os ombros caídos. "Se eu fosse você, começava a desconfiar até do silêncio. O Osric não ia ficar plantado à toa; deve ter…
*a única notícia do mundo em 12 respostas: uma frase de Hakon.*

---

## Parte 3 — a ponte (M28–M38)

**J28** Basta. Levanto, ajeito o símbolo no cinto e caminho devagar para a ponte, com Hakon meio passo atrás. Chego perto do homem de costas e digo: "Procuro um homem chamado Edric. És tu?"
**M28** Hakon solta o ar devagar, e o som da bainha da espada deslizando para fora é baixo, mas claro. "Então vamos." Ele se levanta com você, e os dois caminham em silêncio até a ponte. A madeira estala a cada passo, e a corda da lateral range como um osso apertado. O homem de costas ouve vocês se aproximarem, mas não se move. Você para a dois passos dele, o símbolo no cinto, e pergunta. Por um instante, só o rio responde. Então o homem vira o rosto—magro, uma cicatriz no queixo—e olha para você com os olhos de quem já…
*primeira resposta depois do empaque: Edric abre "Depende. Quem pergunta?" — e casa com o anão (magro, cicatriz).*

**J29** Digo: "Meu nome é Gaspar Torquato. Um homem a quem devo a vida morreu me pedindo que te achasse. E a ordem de que fugi anda atrás da mesma coisa que tu. Por que ficas parado nesta ponte, e o que carregas que tilinta como vidro?"
**M29** O homem magro da cicatriz no queixo vira o rosto devagar, e por um instante o rio inteiro parece passar dentro dos olhos dele. "Gaspar Torquato... então é você." A voz é baixa, arrastada, e ele não larga a beira da ponte. "Fico parado porque é aqui que as estradas se despedem. Quem atravessa, não volta. E o que carrego..." Ele afasta o capote surrado, e o tilintar de vidro vem de uma corrente de amuletos de cegonha, cada um com um fio de lã preta. "...são promessas que peguei pelo caminho. Cada uma, uma vida que…
*a ordem **já passou perguntando por você**: a sombra do vilão, bem plantada; o amuleto de cegonha com fio de lã preta.*

**J30** Respondo sem tirar a mão do símbolo: "Quero cumprir o último pedido de um moribundo. Mas ainda não me disseste se és o Edric. E quem da ordem passou por aqui, quando, e quantos eram?"
**M30** O homem magro da cicatriz no queixo vira o rosto devagar, e por um instante o rio inteiro parece passar dentro dos olhos dele. "Edric? Esse nome não me diz nada — talvez um dia tenha dito, mas a ponte leva os nomes com as águas." A voz é baixa, arrastada, e ele não larga a beira da ponte. "Mas a ordem... essa eu vi. Cinco dias atrás, três homens de pano preto. Perguntaram por um clérigo fugido, Gaspar Torquato, e por um homem magro com cicatriz no queixo. Mostraram um pano com um símbolo riscado, igual ao que você…
*"cinco dias atrás, três de pano preto, uma moeda de ferro fria como mão de morto".*

**J31** Tiro do bolso a moeda falsa de prata com o fio de cobre e a estendo na palma. "Um anão do Mercado do Ogro guardou esta moeda que um magro de cicatriz no queixo lhe deu, há dois dias, e disse que ia à Ponte Lenta. Tu tens a cicatriz. Reconheces a moeda?"
**M31** A moeda falsa brilha fraca na sua palma, o fio de cobre quase sumindo entre os dedos. O homem magro da cicatriz no queixo se inclina um pouco, o rosto marcado pelo sol e pela espera, e por um instante os olhos dele se estreitam, como quem reconhece uma dor antiga. "Oh, essa moeda... Comprei pão com ela uma vez, e o padeiro cuspiu no chão quando mordi. Disse que era melhor que a prata de verdade: não faz barulho no bolso, não atrai cobrador." Ele solta um riso curto, sem dente, e se endireita. "Mas isso lá vai, os…

**J32** Não acredito nele… tento ler se ele está mentindo (Intuição 15+4=19 vs 15, sucesso)
**M32** O homem magro da cicatriz no queixo vira o rosto devagar, e por um instante o rio inteiro parece passar dentro dos olhos dele. "Moeda? Ah, essa aí... o padeiro cuspiu no chão quando eu paguei com ela. Disse que valia menos que o mofo do balcão." Ele solta um riso curto, que se perde no barulho da água. "Mas se o anão guardou, é porque tem olho bom. Eu só a dei para me livrar do troco." Os amuletos de cegonha tilintam no peito dele. A ponte balança, e a madeira estala sob os pés de vocês. O homem volta a encarar a…
***o sucesso (19 vs 15) não muda a cena**: a resposta repete a esquiva e devolve a pergunta.*

**J33** "Disseste que não conheces nenhum homem magro de cicatriz, e foste tu quem deu a moeda ao anão. Tu és o Edric. Ninguém aqui quer te fazer mal. Sou clérigo; se estás ferido ou doente, eu cuido. Diz-me o que tens, e o que o moribundo queria que eu te dissesse."
**M33** O homem magro da cicatriz no queixo vira o rosto devagar, e por um instante o rio inteiro parece passar dentro dos olhos dele. "Edric... há quanto tempo não ouço esse nome." A voz é baixa, arrastada, e ele não larga a beira da ponte. "Sim, sou eu. E não estou ferido, não do jeito que você pensa. O moribundo... quem era?" Os amuletos de cegonha tilintam no peito dele. A ponte balança, e a madeira estala sob os pés de vocês. Hakon, atrás de você, mantém a mão na espada, calado. "Se você é um clérigo, então reze.…
*"sim, sou eu… parado nesta ponte há cinco dias" (o anão o viu **no mercado há dois**).*

**J34** Respondo: "Foi só isso. Segurou meu pulso e pediu que eu fosse a Casa da Fonte atrás de Edric. Não deu o próprio nome. Agora cumpre tua parte: por que estás parado aqui há cinco dias, e o que carregas que a ordem quer?"
**M34** Edric vira o rosto devagar, e por um instante o rio inteiro parece passar dentro dos olhos dele. "Cinco dias... o suficiente para a ordem farejar e para você, clérigo, chegar atrasado." A voz é baixa, arrastada, e ele não larga a beira da ponte. "Estou parado porque atravessar agora é cair na rede. Eles rondam a margem norte, e eu não sou páreo para três de pano preto." Os amuletos de cegonha tilintam, e ele desvia os olhos para a água. "O que carrego? O moribundo me deu um nome, e a ordem quer esse nome. Paga-se…

**J35** Tiro da bolsa duas rações e o odre de água e entrego a Edric sem exigir nada. "Come. Depois me diz que nome o moribundo te deu, e de quem era."
**M35** Edric olha para as rações como quem já esqueceu o gosto de pão. Estende a mão magra, e os amuletos de cegonha tilintam quando ele pega a comida. "Não devia. Mas a fome não pergunta." Ele come devagar, os olhos na água, e bebe do odre com sede de muitos dias. A ponte balança, e o rio continua a correr lá embaixo. Hakon, atrás de você, mantém a mão na espada e observa a estrada vazia. "O moribundo... era apenas um homem com um nome preso nos dentes. Disse: 'Quando encontrar Edric, diga que a chave está no nome de…
*`suprimentos` 10→10: dar rações **não debitou**. A chave "está no nome de Osric Pé-Leve" na boca do moribundo, via Hakon.*

**J36** Digo: "Então a chave está em Osric, e Osric está na Candeia Faiscante, atrás de nós. Mas tu não podes voltar e eu não confio na estrada do norte. Um taverneiro falou da Boca de Pedra Torta, a quatro horas a nordeste, perto deste caminho. Sabes o que há lá?…
**M36** Edric parece ponderar, os olhos fixos na água barrenta. "A Boca de Pedra Torta? Só ouvi falar. Dizem que é uma caverna com uma boca grande de pedra torta, como se estivesse rindo. Mas ninguém fala o nome em voz alta, e ninguém que entrou de noite voltou." Ele se endireita, e os amuletos de cegonha tilintam. "Se você quiser voltar à cidade sem a ordem ver, talvez haja caminho por lá. Mas passagem, não sei. E esconderijo, também não." A ponte balança, e a madeira estala. Hakon, atrás de você, mantém a mão na espada,…

**J37** Digo a Edric que espere escondido sob a ponte até eu voltar, e que não atravesse. Depois digo a Hakon: "Vamos à Boca de Pedra Torta. Se há caminho por lá, quero vê-lo antes da ordem." E pego a estrada para a Boca.
**M37** Edric assente devagar, e os amuletos de cegonha tilintam quando ele se move. "Vou esperar. A ponte me deve isso." Hakon solta um grunhido e se vira para a trilha. "Então andem logo. A Boca de Pedra Torta fica a quatro horas daqui, e o sol não vai parar de subir por nossa causa." A estrada de terra se estende à frente, ladeada por árvores que deixam a luz passar em manchas. O cheiro de terra molhada sobe do chão, e o rio continua a correr atrás, como se a despedida já fosse uma memória.
*narra a partida; o `lugar` ainda era a ponte.*

**J38** Caminhamos as quatro horas até a Boca de Pedra Torta, com pausas curtas para beber água. Quando chegar, paro diante da entrada.
**M38** A trilha se estreita, e o cheiro de terra molhada dá lugar a um silêncio pesado, como se as árvores contivessem a respiração. Hakon cambaleia um pouco, suando, mas mantém o passo, a mão firme no cabo da espada. À frente, a floresta se abre numa clareira de pedra, e ali está a Boca de Pedra Torta: uma caverna baixa, com uma entrada larga, torta como uma boca que riu demais. O sol bate de través e não entra; a escuridão começa logo depois da borda, densa e parada. Um esqueleto jaz encostado numa árvore, os ossos…
*S: "A Boca a 18 km — 1 dia de marcha, 50%" e **DIFÍCIL… 175 de poder contra 961 — 5.5× menos**; navegação 19 vs 10; título **Andarilho**. 245 min de relógio. O Mestre narra a chegada.*

---

## Parte 4 — a Boca de Pedra Torta e o guardião (M39–M46)

**J39** Antes de entrar, examino o esqueleto e a lança quebrada encostados na árvore: de quem foi, há quanto tempo, e se tem algo útil ou algum sinal da ordem.
**M39** O esqueleto está encostado na árvore, meio coberto de musgo e hera, como se a floresta o estivesse engolindo devagar. A lança quebrada ao lado, a ponta cravada no chão, enferrujada e torta. Hakon se aproxima, respira com esforço, e observa em silêncio enquanto você examina. O osso da perna esquerda está partido em dois, e o crânio, rachado na têmpora, ainda guarda um elmo de couro podre. Não há bolsa nem arma além da lança, mas as falanges da mão direita estão abertas, como se tivessem soltado alguma coisa. O…
*o esqueleto ("as falanges abertas, como se tivessem soltado alguma coisa") é a melhor linha de objeto da sessão — e **ninguém a cobra** depois.*

**J40** Acendo uma tocha, entrego outra a Hakon e entro na Boca de Pedra Torta, devagar, com ele ao meu lado. Procuro o caminho principal.
**M40** A tocha acende com um estalo, e a luz dança nas paredes de pedra torta, como se a caverna risse de vocês. Hakon se adianta, a outra tocha erguida, e os passos de vocês ecoam na escuridão. O chão desce em lajes gastas, e o cheiro de raiz podre sobe da umidade. À frente, o salão se alarga, e a luz da tocha arranca da penumbra uma inscrição gasta na verga de uma porta baixa, um caminho à direita marcado por moedas soltas no chão, e, à esquerda, correntes penduradas que balançam sem vento, tilintando num lugar mais…
*S: "você acende a primeira das suas 5 tochas". Entrou: certo. "Dois caminhos" onde o mapa tem três.*

**J41** Escolho o caminho das correntes que balançam sem vento e tilintam. Vou à frente com a tocha, olhando bem o chão antes de cada passo. Hakon fica a dois passos atrás.
**M41** Você ergue a tocha e avança pelo vão das correntes, e o tilintar se espalha como riso de moedas. O chão é de pedra lisa, fria, e a cada passo as correntes roçam seus ombros, balançando sem vento. Hakon vem atrás, a tocha lançando sombras longas, o aço da espada meio fora da bainha. À frente, a passagem se curva e desce, e as correntes vão rareando, como se desistissem de guiar. O ar esfria e fica parado, com cheiro de ferro velho. A luz da tocha vacila na sua mão. Hakon para e sussurra: "Gaspar... você viu isso?"…
*escrevi "escolho as correntes" e **o jogo não moveu** (só o botão da passagem move); o Mestre narra o corredor.*

**J42** Não toco na moeda. Agacho e passo a tocha rente ao chão… (Percepção 5+2=7, falha)
**M42** A tocha estala, e as chamas lambem o ar frio. Você se agacha, rastreia o chão, corre os dedos pelas fendas e pelo musgo escuro. Hakon segura a tocha sobre sua cabeça, e a luz revela poeira, pequenos ossos de rato, marcas de arrasto antigas. Os olhos dele percorrem o mesmo caminho que os seus, e ele resmunga baixo: "Isso aqui já foi remexido. Alguém deixou a poça de lado e calçou a pedra." O lugar fica ainda mais quieto, como se a caverna prendesse o riso. Vocês não encontram nada, e o rastro de vocês fica marcado…
*Percepção 5+2 vs 13, falha; "o lugar fica remexido" outra vez (a mesma frase da taverna).*

**J43** (clico na passagem "correntes penduradas": a sala do guardião; iniciativa; "Encontro fácil", Troll)
**M43** O fio atravessa a passagem, quase invisível, e se rompe com um estalo seco. Lâminas enferrujadas saltam da pedra e cravam no seu braço. Hakon rosna e puxa a espada, enquanto o Troll se ergue das sombras, enorme, com dentes amarelos e osso exposto no ombro. Ele encara você e avança um passo, rangendo os pés, empurrando correntes para o abismo. Hakon se prepara ao seu lado, a respiração pesada, e o Troll solta uma golfada de ar podre. A luz da sua tocha treme.
*S: iniciativa; "Encontro fácil"; **o guardião da chave: Troll**. "Lâminas enferrujadas cravam no seu braço" e **PV 20/20**.*

**J44** (esperar — Hakon derruba o Troll; escolho "Poupar")
**M44** Hakon avança um passo e gira o corpo, a espada em arco pesado. O golpe pega o Troll na lateral da cabeça, e o osso range como madeira velha antes de a criatura desabar de joelhos, os olhos revirando para trás. Ele despenca de cara no chão de pedra, e a poeira sobe em volta. Hakon mantém o fio junto ao pescoço do Troll, a respiração ofegante, mas não desfere o corte. "Fica aí," ele rosna. Você sente o braço latejar do corte da armadilha, e a tocha estala baixo. Ao lado do corpo desacordado, meio encoberto por uma…
*Hakon derruba o Troll em 1 rodada; o jogo pergunta **Poupar / Matar** (escolhi poupar). S: +13 moedas, +31 XP, +1 essência, **a CHAVE do portão lacrado**.*

**J45** (clico na passagem "musgo luminoso": o santuário)
**M45** O refúgio é uma bolha de ar parado e luz fria. Uma estátua de pedra, sem rosto, com as mãos em concha, ergue-se no centro, e um fio de água escorre entre os dedos dela, caindo numa bacia gasta. O som é quase um sussurro. Hakon se deixa escorregar pela parede, a espada descansando sobre os joelhos, os olhos fechados por um instante. Quando ele os abre, olha para você sem levantar a voz: "Lembra da dívida? Aquela que você disse que pagaria quando a estrada endireitasse. Pois a estrada entortou." Ele pega o cantil,…
*o santuário (~25% de PV e PM, tudo cheio): Hakon pergunta "lembra da dívida?". O Troll poupado **é lembrado** ("continua desacordado").*

**J46** Bebo um gole e respondo, baixo: "Lembro, Hakon. Mas diz-me por inteiro: quanto te devo, e por que perdeste a pousada por minha causa? Não quero morrer sem saber o tamanho da dívida."
**M46** Hakon gira o cantil entre os dedos, depois bebe um gole e devolve para você, sem pressa. "Vinte cunhas, Torquato. E a pousada, bom... a pousada era o que me fazia acordar de manhã. Perdi porque apostei em você, e você sumiu sem deixar recado. Os credores vieram com machados e tochas; eu ainda paguei o que pude com o que tinha. Mas a dívida que importa não é a de prata." Ele se endireita, e a luz fria da estátua corta o rosto dele, deixando as cicatrizes mais fundas. "É a de não ter ninguém para ficar de guarda…
*respondeu concreto (vinte cunhas) e empurra uma vez ("foca em Osric").*

---

## Parte 5 — o Dragão, a queda e a luta que não acaba (M47–M64)

*18 respostas. Do M50 ao M54 e do M58 ao M64 o jogador só pode carregar em "esperar": estão encurtadas a uma frase cada.*

**J47** (clico no portão lacrado: a sala do chefe, "Encontro mortal")
**M47** A sala do chefe é uma catedral de pedra torta, e no centro dela o Dragão Jovem se ergue, com escamas que mudam de cor na luz das tochas. As correntes penduradas balançam ao redor, e um fogo fraco arde em alguma fenda no chão. O bicho é grande demais para o…
*S: **Dragão Jovem (grande, 29 PV), "Encontro mortal"**; iniciativa 22 contra 17 e 8.*

**J48** (esperar com a Luz Sagrada na mira: 12 de dano; o Dragão responde)
**M48** O sopro incandescente do Dragão Jovem atravessa a sala e explode contra você, queimando a capa e lançando Hakon para trás. Você consegue erguer a lâmina a tempo, e o golpe da cabeçada desvia de raspão, mas ainda assim o mundo gira. A fúria da sua origem…
*Luz Sagrada: 12 de dano. O Dragão: **Cabeçada** 14 → "Fúria persistente: 1 PV". A prosa diz **sopro**.*

**J49** (Atacar com a maça: erro; caio a 0 PV)
**M49** A espada de Hakon abre um rasgo profundo no flanco do dragão, e o sangue escorre pelas escamas. O bicho solta um rugido que treme as correntes e recua um passo, o olho dourado girando para a saída. A sua lâmina corta o ar, erra, e nesse instante o sopro…
*erro de ataque; o Dragão: 16 → 0 PV; Hakon, crítico: 14 (Dragão 3/29). **Cura Leve não saiu** (duas tentativas de mirar).*

**J50** (esperar — o turno do mundo)
**M50** O sopro incandescente varre o chão e engole Hakon por inteiro. A espada dele gira no ar e crava na pedra, e ele tomba de lado, sem soltar um grito. O dragão se vira para você, mas não avança; recua um passo, a cauda raspando as correntes. Lá fora, o vento…
*Hakon cai (17 + 17). "O sopro engole Hakon…".*

**J51** (esperar — o turno do mundo)
**M51** O sopro incandescente do dragão incendeia o ar entre vocês, e Hakon cai de joelhos, a espada escapando dos dedos. O dragão avança sobre ele, e a cabeçada o lança contra a parede. O mundo treme, e tudo escurece. Lá fora, uma raiz estala, alta, e o chão treme…

**J52** (esperar — o turno do mundo)
**M52** O chão frio gruda na sua bochecha, e o gosto de ferrugem enche a boca. O peito sobe e desce, devagar, mas você não vê mais a luz da tocha — só um borrão que arde atrás das pálpebras. Perto, a respiração do dragão vem em golfadas pesadas, e o chão treme quando…

**J53** (esperar — o turno do mundo)
**M53** O chão treme sob o peso do dragão, e o ar estremece com o seu rugido. Você está caído, a visão turva, ouvindo o som das garras raspando a pedra. Perto, Hakon jaz imóvel, o sangue escorrendo de um corte na testa. O dragão investe contra a escuridão, tentando…

**J54** (esperar — o turno do mundo)
**M54** O sopro incandescente do dragão atravessa o ar e engole Hakon, que cai de joelhos, a espada escapando da mão. Ele tomba de lado, e o sangue escorre do corte na testa. Você está caído, a visão escura, sentindo o chão tremer a cada passo do dragão. O bicho…

**J55** (esperar — o turno do mundo)
**M55** Tudo esfria. O peso do próprio corpo fica distante, e a pedra sob você parece recuar. O som do dragão some atrás de um zumbido grosso, e a escuridão se fecha por dentro. O último ar sai lento, e a mão que segurava a tocha afrouxa. Depois, nada.
***a morte**: 3 falhas ("5, 2, 6"). S: "Você tomba. O que vem depois é escolha sua — e custa." Voltar custa ◉120 (não tinha); **Passar o fio**: nível 3, ◉7.*

**J56** (a morte: "Continuar" → passo o fio a Inês Torquato)
**M56** A notícia da morte de Gaspar corre como fogo em palha seca. Pela manhã, a carroça de Inês Torquato vence as últimas léguas até a Boca de Pedra Torta, e a boca torta da caverna parece rir dela. Inês é magra, calejada pelo tempo e pelas estradas, e carrega a…
*a herdeira "chega de carroça pela manhã" — **com a luta aberta** (Dragão a 1,5 m, 3/29; Hakon 0/12).*

**J57** (Inês entra na luta aberta: Atacar; erra; cai a 0 PV)
**M57** A lâmina de Inês gira torta, raspando as escamas sem ferir, e o Dragão Jovem responde com o sopro incandescente. O fogo lambe as roupas dela e gruda na pele, queimando. Ela ainda consegue desviar da cabeçada, mas o mundo gira. O braço falha, a visão escurece,…
*Inês ataca, erra; o Dragão 15 + 16 = **31 de dano** a um herói de 22 PV.*

**J58** (esperar — o turno do mundo)
**M58** Tudo escurece. O chão frio sobe para encontrar o rosto de Inês, e o fogo na manga ainda lambe a pele, crepitando baixinho. Perto, a respiração do dragão se afasta, as garras raspando nas pedras. Hakon ruge e segura a espada com as duas mãos, os pés firmes no…

**J59** (esperar — o turno do mundo)
**M59** O fogo na manga de Inês se apaga sozinho, as brasas morrendo contra o chão frio. Hakon corre até ela e ajeita o corpo, o rosto sujo de fuligem, os dentes cerrados. "Levanta, Torquato... levanta, porra." A mão dele aperta o ombro dela, firme, procurando pulso.…

**J60** (esperar — o turno do mundo)
**M60** A mão de Hakon aperta o ombro de Inês, e ele percebe que o pulso ainda bate, fraco, mas bate. Ele a vira de lado e limpa a fuligem do rosto dela com a manga rasgada. "Fica comigo, Torquato. Ainda não." A tocha caída estala, e o cheiro de couro queimado se…
*"o dragão sumiu" — o painel: **a 1,5 m, 3/29**.*

**J61** (esperar — o turno do mundo)
**M61** Hakon se ajoelha ao lado de Inês e rasga a própria camisa para estancar o sangramento. As mãos dele tremem, mas o corte é firme. "Torquato, me escuta. Ainda não acabou." A respiração de Inês é um fio que vem e falha, e o peito quase não se move. A tocha caída…

**J62** (esperar — o turno do mundo)
**M62** O cheiro de fumaça e couro queimado impregna a sala. Hakon ajoelhado ao seu lado, com as mãos sujas de fuligem, ainda pressiona o pano contra o corte na sua testa. A respiração de Inês é um fio quase invisível. "Torquato... fica comigo." A voz dele sai baixa,…

**J63** (esperar — o turno do mundo)
**M63** Hakon puxa Inês pelos ombros para perto do vão da porta, longe do cheiro de queimado. Ele fica de costas, protegendo-a, e os olhos fixos na escuridão do corredor. "Se ele voltar, eu grito. Fica quieta." A tocha caída estala uma última vez e morre. No escuro,…

**J64** (esperar — o turno do mundo)
**M64** Tudo esfria. O peso do corpo de Inês afunda, e a pedra sob ela parece recuar. O som do mundo some atrás de um zumbido grosso, e a escuridão se fecha por dentro. Hakon ainda pressiona o pano contra a testa dela, mas a mão dele já não treme. O último ar sai…
*a morte de Inês **em prosa** ("o peito dela não volta a subir") enquanto os testes de morte dizem "resiste"; a luta **não termina**; fechei aqui.*

---

## As perguntas, contra o sistema

| # | resp. | pergunta | o que o Mestre disse | veio de | onde |
|---|---|---|---|---|---|
| 1 | M2 | de onde nos conhecemos, por que continuas ao meu lado? | "faz dois anos… perdi a pousada por sua causa" | **sistema** (+ inventado a pousada) | PESSOAS CONHECIDAS: "conhecem-se há 2 anos · antes: taverneiro"; a pousada é do Mestre |
| 2 | M3 | o que sabe o taverneiro de Edric? | "visto na Ponte Lenta, doze quilômetros ao norte" | **sistema** | PERGUNTOU / marco: "Edric está em A Ponte Lenta, em Rio Profundo — 12 km ao norte" |
| 3 | M4 | quanto custa um quarto? | "oito cunhas, com cama e fechadura; janta, mais três" | **sistema** | PREÇOS COMUNS: "quarto bom ◉ 8–15 · refeição boa ◉ 3–5" |
| 4 | M4 | quem manda, qual a lei? | "os mordomos do cântaro… mantenha seu juramento" | **sistema** | o Léxico: "a guarda = os mordomos", "COMO A LEI COBRA AQUI". A lei da porta (salvo-conduto) só volta como garrancho |
| 5 | M5 | o que mora na Boca, por que ninguém diz o nome? | "caverna a 4 h a nordeste… as paredes sussurram… ninguém sabe" | **sistema** (distância) + **inventado** (os sussurros) | "A 4 horas de marcha, a nordeste, fica A Boca de Pedra Torta" |
| 6 | M9 | quanto custam tochas, corda e rações para 3 dias? | "dez cunhas, mais uma pela corda boa" | **inventado** (e **o herói já tinha 10 rações e 5 tochas**) | não há preço de kit na tabela |
| 7 | M10 | viste Edric, ouviste da Ponte Lenta? | "um magro com cicatriz… moeda falsa com fio de cobre… 'não volta atrás'" | **sistema** (o oráculo disse SIM, E AINDA MAIS) + **inventado** o corpo | "chance 58% (no fio), rolou 5" — o rosto e a moeda nasceram aqui |
| 8 | M11 | onde se faz moeda assim? | "só os cambistas do beco… o fio é novo, de fora" | **inventado** | nenhuma linha de cambistas |
| 9 | M12 | a que horas, que direção, ia sozinho? | "vésperas do meio-dia, dois dias atrás, estrada do norte, sozinho" | **inventado** | nenhuma; mas o fio dizia Ponte Lenta ao norte |
| 10 | M14 | o draconato era o Osric? | "Pode ser… se ele era, mentiu" | **esquivada** — o sistema **sabia** | missão: `falar_com Osric Pé-Leve` em A Candeia Faiscante; o Mestre nunca o nomeou |
| 11 | M18 | quantas tochas e rações tenho? | "cinco tochas e **três** rações" | **errada contra o save** | a pauta e o save diziam **10 rações**, 5 tochas |
| 12 | M20 | que horas são? | "o sol ainda não passou da copa" (no M19 já passara) | **esquivada e contradita** | o relógio estava na pauta (RODAPÉ) |
| 13 | M30 | quem da ordem passou, quando, quantos? | "cinco dias atrás, três de pano preto, moeda de ferro fria" | **inventado** (sombra boa) | o `antagonista` é outro (um chefe), ver Coerência |
| 14 | M33–M35 | que nome te deu o moribundo? | "a chave está no nome de Osric Pé-Leve" | **sistema** (a missão) | o único elo que fecha o fio; vem na boca de Hakon/de Edric |
| 15 | M39 | de quem é o esqueleto, há quanto tempo, tem algo? | "sem bolsa… falanges abertas, como se tivessem soltado algo" | **inventado**, bem | nenhuma; deixou um objeto que ninguém cobrou |
| 16 | M46 | quanto te devo, e a pousada? | "vinte cunhas… a dívida que importa não é a de prata" | **inventado** (o número) + sistema ("mais do que dinheiro") | "dívida comigo · mais do que dinheiro" |

**Contagem:** 16 perguntas contra o sistema — **5 do sistema, 8 inventadas, 2 esquivadas, 1 errada contra o save**; a 4.ª deu 4 / 9 / 1 / 0.
**O sistema sabia e não entregou em 3** (o taverneiro é Osric; as rações; o relógio) — nenhuma era matéria que faltasse.

---

## O custo — cada chamada, com dono

| quem | chamadas | tokens entrada (cache) | saída | tempo médio |
|---|---|---|---|---|
| Narrador | **64** (+1 recusada) | 2.597.756 (1.452.800 em cache, 56%) | 14.525 | 7,3 s |
| Cronista | 63 (+2 recusadas) | 172.574 (145.920 em cache) | 9.408 | 1,8 s |
| Léxico | 1 | 4.779 | 7.021 | 77 s |
| Revisor de continuidade | 1 | 530 | 157 | 1,6 s |

- **Chamadas por resposta: 2,02** (a 4.ª, 2,19; a 3.ª, 2,27). Só um Revisor em 64 respostas.
- **Pedido do Narrador (caracteres): pico 150.918** (a 4.ª: 138.059) e **system 74.957** (a 4.ª: 72.383). O pico está **dentro de uma
  masmorra** (system maior + a cidade ausente do pedido); o teto de prompt não foi estourado, mas **o system cresceu 2.574 caracteres
  desde a 4.ª**.
- **Os 18 turnos de morte e de luta presa custaram 28% das chamadas do Narrador** (18 de 64) para dizer, com variações mínimas, a
  mesma frase — ver defeito 1.

---

## A escuta, turno a turno (v9.393, 11/10)

*O que a pessoa pediu na 4.ª (ouvir, responder, reagir primeiro, empurrar no máximo uma vez) e o que o Mestre fez agora.* Medido no
registo (as 64 chamadas do Narrador), por script, sem ler o registo inteiro. **Empurrão** = envelope que puxa história que ninguém
pediu (`empurraoDe`). **Origem** de cada coisa sem nexo: **(a)** veio pronta da pauta ou do prompt · **(b)** o modelo juntou dois
fatos que não casam · **(c)** inventou sem base.

| T | o jogador | perg. | reage 1.º | respondeu | empurr. | o que não faz sentido · origem |
|---|---|---|---|---|---|---|
| 2 | de onde nos conhecemos; por que ao meu lado; quem foi Edric | sim | sim | **3/3** | 0 | Hakon: "ele me chamou de 'o último recado'" — quem chamou quem? (c) |
| 3 | Candeia: o que sabes de Edric | sim | sim | sim | 0 | o taverneiro nunca diz o nome (a: nada na cena o manda dizer) |
| 4 | quarto? quem manda? a lei? | sim | sim | **2/2** | 0 | duas leis: "salvo-conduto" (a abertura) e "juramento dos mordomos" (o Léxico) (a) |
| 5 | a Boca de Pedra Torta | sim | sim | sim | 0 | "o caminho passa perto da Boca" (c) |
| 6 | saio, procuro o mural | não | **não** | — | 0 | lido como "vasculhar o lugar": busca narrada **na taverna** (a: o Intérprete) |
| 7 | caminho até a praça | — | sim | — | 1 (forma) | "o mural está ali, esperando" |
| 8 | leio os cartazes | — | sim | **vago** | 0 | "avisos, anúncios e promessas, nada sobre Edric": **nenhum cartaz**; "o *paper* antigo" (c) |
| 9 | tochas, corda, rações: quanto? | sim | sim | sim | 0 | preço inventado; Hakon: "o tal Osric não estava na taverna" (b) |
| 10 | pago; viste Edric? | sim | sim | sim | 0 | o corpo de Edric nasce aqui (c) sobre um SIM do oráculo (a) |
| 11 | a moeda; onde se faz | sim | sim | **2/2** | 0 | cambistas do beco (c) |
| 12 | pago 5; hora, direção, sozinho | sim | sim | **3/3** | 1 (compasso) | — |
| 13 | estrada do norte | — | sim | — | 1 (compasso) | Hakon pergunta "Esse Osric… você confia nele?" quando o herói vai atrás de **Edric**, e fala de Osric como de alguém que ainda não vimos (a: a pauta dizia "Procurar Osric") |
| 14 | era o Osric? / por que falas assim? / quanto falta? | sim | sim | **1/3** | 1 (mundo) | "Pode ser… se ele era, mentiu"; o Mestre **inventa que o taverneiro mentiu** (c) |
| 15 | caminho até a ponte | — | sim | — | 1 (mural) | "depois de quase meia hora a Ponte Lenta aparece": 12 km em ~30 min (a: relógio) |
| 16–27 | **(12 turnos de empaque)** rio, nadar, símbolo, tochas, cochilo, horas, clérigos, pedra, deitar, "mudou algo?", histórias, "estrada vazia" | 7 | 12/12 | **5/7** (M18 errada, M20 parcial) | 7 em 12 | "Hakon solta um grunhido…" 4× e "uma águia grita…" 3× (c); Hakon: "Vamo-nos a Ponte Lenta" estando na ponte (b) |
| 28 | abordo o homem: "és Edric?" | sim | sim | sim | 0 | — |
| 29 | quem sou eu; por que parado; o que tilinta | sim | sim | **3/3** | 0 | "a ordem já passou perguntando por você" (c, boa) |
| 30 | és Edric? quem da ordem, quando, quantos | sim | sim | **3/3** | 0 | "cinco dias atrás" × o anão: "dois dias" (c) |
| 31 | a moeda falsa | sim | sim | sim (esquiva de personagem) | 0 | — |
| 32 | leio se mente (Intuição 19 vs 15, **sucesso**) | não | sim | — | 0 | **o sucesso não muda a cena**: nenhuma leitura de mentira (a) |
| 33 | "tu és o Edric" | sim | sim | sim | 1 (compasso) | "parado há cinco dias" × o anão (c) |
| 34 | o que o moribundo disse | sim | sim | sim | 1 (mundo) | Edric pergunta quem era o moribundo, e o herói **sabe** (b) |
| 35 | dou rações e água | — | sim | — | 1 (forma) | `suprimentos` 10→10: **sem efeito** (a) |
| 36–37 | a Boca serve de passagem; "vou à Boca" | sim | sim | sim | 0 | texto narra a saída; o `lugar` ainda era a ponte (a) |
| 38 | caminhamos as 4 h | — | sim | — | 1 (forma) | S: "a 18 km, 1 dia de marcha, 50%" e o Mestre já narra a chegada (a) |
| 39 | examino o esqueleto | sim | sim | parcial (3/4) | 0 | — |
| 40–45 | entro; correntes (texto); procuro armadilhas; guardião; santuário | — | 5/6 | — | 1 | "Dois caminhos" onde há três (c); **"escolho as correntes" não move** (só o botão) (a); **PV 20/20** depois de "lâminas cravam no braço" (a) |
| 46 | quanto te devo? | sim | sim | sim | 0 | — |
| 47–64 | **combate e morte** | — | — | — | 0 | ver defeito 1 e 2 |

**Os números.**
- **Respondeu à pergunta em 20 de 24** turnos com pergunta (23 de 24 contando as 3 parciais; **1 errada contra o save**, M18).
  A 4.ª: 11 de 16 (14 contando as parciais). **Reagiu primeiro em 38 de 41** turnos de jogador (a 4.ª: 14 de 16 só nos de
  pergunta); as 3 falhas são de **ação mal lida ou resultado ignorado** (M6, M32, M41), nenhuma de pergunta.
- **Empurrões: 17 em 64 chamadas — 17 nas 40 de cena, 0 nas 24 de combate — e nunca mais de 1 por resposta.** A 4.ª: 23 em 18 dos 24
  turnos, e 4 de uma vez. A regra de uma ponte por turno **aguentou**.
- **A frase do jogador** é **a última linha do pedido em 52 de 52** os pedidos que a têm (os outros 12 nascem de um clique ou de uma
  rolagem), a **≤ 639 caracteres do fim** (mediana 213). A 4.ª: a 7–14 mil. Aguentou.
- **Origem das 15 coisas sem nexo da lista de coerência:** (a) **8** vieram prontas da pauta ou do motor · (b) **4** o modelo juntou
  dois fatos que não casam · (c) **3** inventou sem base. (As 8 respostas inventadas às perguntas estão na outra tabela.)
- **O sistema sabia e não entregou:** das **4 respostas que falharam** (M14 esquivada, M18 errada, M20 esquivada, M39 parcial), o
  sistema **sabia em 3** (o taverneiro é Osric; as rações; as horas).

---

## O mundo que anda quando empacas

Empaquei **12 respostas seguidas** (M16–M27), fora do fio. O contador (`escuta.semAvanco`) e o que o Narrador recebeu:

| resposta | turnos sem avanço (no envio) | o degrau que a pauta trouxe (cópia da linha) | o que o Narrador fez | apareceu na tela? |
|---|---|---|---|---|
| M20 | **4** | "e o mundo dá um sinal na direção de *Procurar Osric Pé-Leve na Candeia Faiscante*: um presságio gratuito — clima, ave, sonho" | "o sol da tarde…", Hakon sem resposta à hora | **não** (só o clima) |
| M21–M22 | 5–6 | o mesmo sinal | Hakon responde sobre clérigos e pergunta ao herói | **não** |
| M22 | 6 | **RELÓGIO COMPLETO — ACONTECIMENTO DO SISTEMA**: "O rebate em Casa da Fonte: *gente armada entra em Casa da Fonte a perguntar por Edric, e já sabe que o herói também pergunta*" | nada | **não** |
| M23 | **7** | "e alguém vem até mim, com motivo próprio… : um NPC procura o herói **na taverna** com pedido ligado à principal" | "uma águia grita" | **não** (e o herói estava no rio) |
| M24–M25 | 8–9 | o mesmo | a mesma águia, o mesmo grunhido | **não** |
| M26 | **10** | "e esperar já custa: desabamento, enchente, bloqueio: sobram os caminhos que importam, e aponta para *Procurar Osric Pé-Leve na Candeia Faiscante*" | uma história de Hakon sobre um espantalho | **não** |
| M27 | 11 | o mesmo | Hakon: "o Osric não ia ficar plantado à toa; deve ter mandado alguém atrás de nós" | **uma frase** (e é só dele) |

- **Quando:** a escada subiu **exatamente nos degraus 4, 7 e 10** (a máquina cumpre a tabela).
- **Como:** **0 de 3 degraus virou cena.** Ninguém veio, nada caiu, o rio não encheu. **A única notícia do mundo foi uma frase de
  Hakon no M27.** O acontecimento do relógio completo (gente armada em Casa da Fonte) entrou **uma vez** no pedido e **não foi dito**.
- **Para onde apontava:** o passo era sempre **"Procurar Osric na Candeia"** — o lugar que eu tinha deixado havia 12 km e 40 minutos de
  relógio — e "um NPC procura o herói **na taverna**" (eu estava na margem de um rio). O sinal foi para a cena errada.
- **A prosa do vazio:** em 12 respostas de empaque, **4 repetem verbatim** "Hakon solta um grunhido, e por um momento o som do rio
  fica mais alto que a voz dele" e **3** "uma águia grita alto, cortando o céu, e depois o silêncio volta, com o rio a correr". É
  o Mestre a **ocupar o espaço** que a escada devia ter mudado.
- **As caminhadas** (M13–M15, 12 km; M37–M38, 4 h) **não tiveram um único encontro de estrada**, nem acampamento.

---

## O que a sessão tinha de provar

| item (v9.371 → v9.393) | aguentou? | como / porquê |
|---|---|---|
| **1. a escuta** | **sim, com um furo** | respondeu 20/24 (23/24 com parciais; 1 errada), reagiu primeiro 38/41, empurrões 17 em 64 e nunca mais de 1. O furo: ação que o Intérprete lê mal (M6) e o **sucesso de um teste que não muda a cena** (M32, Intuição 19 vs 15) |
| **2. o mundo anda quando empacas** | **não** | a máquina entrega o sinal (4.º), o "vem buscar" (7.º) e o "cobra" (10.º) e um relógio completo, **nesses turnos exatos**; o Narrador não materializa nenhum, e o passo aponta para onde o herói já não está |
| **3. a lei da abertura** | **em parte** | à chegada, dita ("Salvo-conduto. Selo e nome. Sem isso, não passa", M1). Perguntada (M4), o Mestre dá a **outra** lei (os mordomos, o juramento) e a da porta só volta como garrancho na parede. Na ponte, "a ponte não deixa ninguém passar sem pagar" **casa** com `porta: "pedido na porta e cobrado nas pontes"` |
| **4. o mural sem gente da história; cartaz vence em 3 dias** | **não** | o único cartaz é **"A caçada de Corwin o Silencioso"** — e Corwin é o recrutador **que guarda o marco 2 da espinha** (A Biblioteca do Peregrino) e consta de A GENTE. A leitura do mural (M8) não deu cartaz concreto. A validade de 3 dias **não se provou** (dia 1) |
| **5a. respostas casam com o fio do marco** | **em parte** | o marco 1 pedia *"Edric diz a verdade inteira, ou só a que lhe convém?"* e a cena fez exatamente isso (nega o nome, depois "sim, sou eu"). Mas Edric, na espinha, é **"músico de canto"**; no jogo é um foragido magro de cicatriz — o corpo veio de um SIM do oráculo, não do marco |
| **5b. o antagonista: obra ou sombra, o nome no fim** | **o nome, sim; a sombra, não** | **"Mão Fria" não foi dita em nenhuma das 64 narrações**, e "um prego dobrado em gancho" (a assinatura) **tampouco**. A sombra que o Mestre pôs foi **"a ordem"** (três de pano preto, moeda de ferro "fria como mão de morto" — um eco bom, por acaso) e **não é o antagonista do fio**, que é um chefe |
| **5c. um vilão só** | **não** | o fio diz **"Dragão Jovem a Mão Fria"**; a lista de CHEFES diz **"Golem de Pedra a Mão Fria — LINHA PRINCIPAL, nível 14"**; a Boca tem um **Dragão Jovem sem nome**; o ato 1 promete **"Dragão Jovem a Viúva de Ferro"**; a narração oferece **"a ordem"**. Quatro candidatos |
| **5d. contradições e origem** | **15** | ver "A coerência": 8 (a) da pauta/motor, 4 (b) de dois fatos, 3 (c) inventadas |
| **6. a espinha enxuta** | **não chegou ao ato 1; as batidas não chegam ao prompt** | as batidas existem no save (cena, em jogo, pergunta: "Edric é a última ponta viva de os votos que o herói quebrou", pessoal e ligado ao antecedente), mas **0 dos 64 pedidos as trazem**: nem "votos que o herói quebrou", nem "a verdade inteira". Um "descobrir" que revele segredo e a reviravolta do ato 1 **não se jogaram** (a sessão acabou no ato 0). **Latente:** `{sombra}` literal em 4 marcos, e "de os/de a" por contrair |
| **7. as promessas** | **plantadas 8 · guardadas 8 · cobradas 6 · pagas em cena 3** | `prometido.sementes` guarda as 8 ("o último recado", "Edric não volta atrás", "a ponte não deixa passar sem pagar", "a ordem já passou", "por que parado", "a chave está no nome de Osric", "a moeda antiga que some", "paga a dívida quando a estrada endireitar"). **Cobrada** conta *a linha ter entrado no pedido* (O QUE VOLTA em M7, M13, M33, M35, M38; O PASSADO VOLTA em M15), **não** a cena a honrar: em M13 "Edric não volta atrás" voltava "agora" e a resposta foi sobre Osric. **Pagas de verdade: a ordem (M30), o porquê (M34) e a chave (M35)**. Abertas: a moeda do vão, a dívida |
| **8. os fechos** | **melhorou, e criou uma muleta nova** | em 46 respostas de cena: **pergunta ou escolha 13 · silêncio 11 · presságio 9 · corte/imagem 9 · consequência 2 · fato ou gancho 2** (a 4.ª: 27 presságios em 42). Mas **24 de 46 fecham em "à espera / calado / em silêncio / imóvel"** |
| **9. os fios da estrada** | **não provado** | **0 encontros** em duas caminhadas (12 km e 4 h); não houve acampamento. Nenhum fio solto novo, e nenhum fio |
| **10a. a masmorra certa à porta** | **sim** | "vou à Boca" levou à Boca (M38), com o veredito antes da porta; "acendo uma tocha, entro" entrou (M40). O painel diz "camada 0 · 5 tochas" |
| **10b. o veredito com o teu estado** | **em parte** | "DIFÍCIL: acima de você… 175 de poder (você 115 + 1 no grupo) contra 961 — 5.5× menos" chegou antes da porta, **com o grupo contado**; exaustão 0 e 5 tochas **não aparecem** (não havia o que mostrar). Prova sem fadiga: **não provado** |
| **10c. a narração inteira** | **sim** | **64 de 64** terminam em pontuação; **0** com aspas ímpares |
| **10d. o relógio da marcha** | **sem 12 h, mas curto** | nada de 12 h por uma caminhada curta; porém **12 km em ~40 min** (M13–M15) quando a marcha normal é 24 km/dia, e a Boca "a 18 km — 1 dia de marcha" saiu em **4 h 5 min** com o Mestre a narrar a chegada |
| **10e. "falar com X" fecha** | **não** | a missão `O rasto de Edric` ficou em **0 de 2 etapas** depois de eu falar com Edric durante 10 respostas. A espinha fechou "Encontrar Edric"; a missão, não. E "falar com Osric" **nunca pôde fechar**: o taverneiro nunca foi nomeado e o Cronista o registou como **"Taverna Candeia Faiscante"** |
| **10f. a descida inteira, com a companheira** | **entrar, guardião, chave, chefe: sim · sair: não** | entrei (M40), o **Troll guardião** caiu para Hakon num golpe, **poupei-o** e o Mestre **lembrou-o** duas respostas depois ("o Troll continua desacordado no corredor"); a CHAVE veio dos despojos; o santuário; o portão abriu (M47) — e o **Dragão Jovem** ("Encontro mortal", 29 PV, 31 de dano por rodada) matou a heroína em 8 rodadas. Hakon esteve em todas as salas |

---

## A coerência: as contradições, e de onde vieram

| # | o que não casa | origem |
|---|---|---|
| 1 | O taverneiro draconato **nunca diz o nome**; a missão manda "falar com Osric na Candeia" (40 pedidos seguidos); Hakon: "o lagarto do balcão só nos enrolou"; o Cronista o regista como **"Taverna Candeia Faiscante"** | (a) a pauta mandou procurar um nome que a cena nunca deu · (b) |
| 2 | Edric é **"músico de canto"** na espinha e **"foragido magro com cicatriz"** na cena | (b) dois fatos |
| 3 | Edric: "parado há **cinco dias** na ponte" × o anão: "esteve **aqui há dois dias**, às vésperas do meio-dia" | (c) inventada |
| 4 | **12 km em ~40 min**; a Boca "1 dia de marcha / 50%" × a chegada narrada em 4 h | (a) o relógio |
| 5 | "cinco tochas e **três** rações" × `suprimentos`: **10** rações | (c) |
| 6 | Compra de 11 cunhas para o que o herói **já tinha**, e **não debitada** (só os 5 da informação) | (a) o Mestre vende o que o motor já deu |
| 7 | O antagonista do fio é **Dragão Jovem a Mão Fria**; a lista de chefes diz **Golem de Pedra a Mão Fria**; a Boca tem **um Dragão sem nome**; o ato 1, **Dragão Jovem a Viúva de Ferro**; a sombra da cena é **"a ordem"** | (b) |
| 8 | Duas leis: salvo-conduto (a abertura) × juramento dos mordomos (o Léxico) | (a) |
| 9 | O Mestre diz "dois caminhos" na Boca; o mapa tem **três** passagens; mistura moedas (o caminho das moedas) nas correntes | (c) |
| 10 | Armadilha: "lâminas cravam no seu braço" e **PV 20/20**; depois "o braço latejar" | (a) o motor não aplicou |
| 11 | O Dragão faz **"Cabeçada estonteante"** (14 e 16 de dano) e a prosa diz **"o sopro incandescente… explode contra você"** | (b) |
| 12 | "O dragão **sumiu**" (M60–M62) × **a 1,5 m, 3/29 PV**; "Hakon grita do vão da porta" × **0/12, caído** | (b) |
| 13 | "**Você estabiliza**" e logo dois testes de morte falhados; a prosa diz "o peito dela não volta a subir" enquanto o dado diz "resiste" | (a) o motor × (c) |
| 14 | O herdeiro chega "pela manhã, de carroça… Hakon está **do lado de fora**" enquanto a luta está aberta (a 1,5 m do Dragão, Hakon 0/12) | (a) o App passa o fio sem fechar a luta |
| 15 | **O "relógio completo"** (gente armada a perguntar por Edric) × a cena: nenhuma menção | (a) |

---

## Os defeitos, pela ordem em que partem a sessão

1. **A luta não tem saída (bloqueia a sessão).** Todos caídos e estabilizados, o inimigo a 1,5 m com 3/29 PV **não age**, e "esperar"
   gira para sempre: **18 chamadas do Narrador (28%)** para repetir a mesma imagem. O "passar o fio" **entra no meio da luta
   aberta** (Inês, nível 3, vai ao chão à primeira rodada e a luta continua). *Gravidade: pesada — a campanha não passa daqui.*
2. **A prosa e o dado dizem coisas diferentes.** Sopro × cabeçada; "o dragão sumiu" × a 1,5 m; Hakon de pé × 0/12; "estabiliza" ×
   novo teste de morte; lâminas no braço × PV 20/20; "o peito não volta a subir" × "resiste". É a lei da casa ("quando a prosa e as
   regras discordam, o jogador para de confiar nas duas") **na única cena em que a vida está em jogo**.
3. **O mundo não vem a quem pára.** A escada entrega o sinal, o "vem buscar", o "cobra" e um relógio completo no turno exato —
   e **nada vira cena** em 12 respostas, com o passo a apontar para a taverna que o herói já deixou.
4. **O fio parte-se em três.** A missão (0/2), a espinha (1 marco) e o registo de pessoas (o taverneiro é "Taverna Candeia
   Faiscante"; Edric é duas pessoas) **não concordam**. O jogador fala com Edric 10 respostas e a missão nunca avança.
5. **Ação mal lida e resultado ignorado.** "Saio e procuro o mural" → vasculhar a taverna (M6); **Intuição 19 vs 15 sem uma linha de
   leitura** (M32); dar rações sem efeito (M35); "escolho as correntes" narrado mas **sem mover** (M41); compra narrada sem
   débito (M10). Cinco vezes o jogador fez e **o jogo não registou**.
6. **O mural e a gente da história.** O único cartaz é de **Corwin**, o guardião do marco 2; a leitura do mural não dá cartaz.
7. **A muleta nova: "à espera / calado".** 24 de 46 fechos; "Hakon solta um grunhido…" 4×, "mantém a mão na espada, calado" 4×, a
   águia 3×. Trocou-se um presságio por uma pausa.
8. **Um chefe de nível 7 no ato 0, sem relação com o fio.** O veredito avisa ("5.5×, é onde se morre") e o jogo deixa abrir o
   portão; o Dragão não é o antagonista (ver coerência 7), e o encontro vence o nível 1 em 8 rodadas.
9. **O campo de batalha a 800×451 não deixa mirar a cura.** A grade é uma tira de ~60 px; "Cura Leve" exige tocar a casa-alvo,
   dois toques erraram, o estado "mirando Cura Leve — toque onde cai" **ficou preso entre turnos**; **não consegui curar-me**.
10. **Latente.** `{sombra}` por resolver em 4 `emJogo` da espinha; "de os / de a"; "o *paper* antigo".

---

## A qualidade da campanha

*A pedido da pessoa, a mesma régua da 4.ª.* Joguei como jogaria uma mesa: perguntei o que perguntaria ao Matt, agi, reagi, e
**empaquei de propósito** numa parte. Notas de 0 a 5, com a passagem.

| # | ponto | 4.ª | **5.ª** | porquê, com a passagem |
|---|---|---|---|---|
| 1 | **o gancho: dá vontade de ir?** | 4 | **4** | "um homem a quem devia a vida, morrendo, segurou seu pulso e pediu que fosse a Casa da Fonte atrás de Edric. E a ordem de que fugiu procura a mesma coisa"; a Boca que ninguém diz em voz alta; a moeda falsa com fio de cobre. Dá vontade de ir à ponte. Perde 1 porque o "Osric" que fecha o fio **nunca tem cara** |
| 2 | **o mundo e o lugar: específicos ou genéricos?** | 4 | **3** | "o padeiro cuspiu no chão quando mordi… disse que era melhor que a prata de verdade: não faz barulho no bolso, não atrai cobrador"; "cunhas", "mordomos", "feira do pôr-do-sol". Mas a cidade é um fundo ("o Mercado ferve") e **o rio, o cheiro de terra molhada e a águia fazem 22 de 46 respostas** |
| 3 | **as personagens: querem, têm voz, lembram-se de ti?** | 3 | **3** | Edric — **"Reze para que a ordem não o encontre antes de você descobrir o que eu carrego"**; Hakon — "Dívida não enche barriga, mas carne com dívida desce melhor"; o anão — "o risco é meu". Lembram: o Troll poupado volta; Hakon recorda a dívida **duas vezes**. Mas Hakon é **um só gracejo** (cobrador, dívida) e o taverneiro **não tem nome** |
| 4 | **o que está em jogo: pessoal e concreto?** | 3 | **3** | "a ordem que quer esse nome"; "a chave está no nome de Osric"; a dívida de Hakon ("a de não ter ninguém para ficar de guarda quando a minha hora chegar"). Pessoal e concreto, **sem prazo na tela** — o relógio que enche ("o rebate") **não se diz** |
| 5 | **a reviravolta e a revelação** | 3 | **3** | Houve duas, **ambas do Mestre**: Edric nega o próprio nome e depois "sim, sou eu"; o moribundo deixa **um nome**, não uma coisa. `reviravolta = null` e `reviravoltaMaior = null`; **o "descobrir" não se jogou** |
| 6 | **a escalada e o ritmo** | 2 | **3** | M28–M38, a ponte, é **a melhor cena das cinco sessões** (a negação do nome, a ordem de pano preto, o amuleto de cegonha, a chave no nome de Osric). O empaque cai a zero **por culpa do mundo, não da prosa**; a descida sobe (Troll, santuário, chefe); e **termina num ciclo de morte de 18 respostas** |
| 7 | **a agência: as tuas escolhas mudaram algo?** | 3 | **3** | **Poupar o Troll voltou duas respostas depois**; contar a Edric o que o moribundo disse, e "o nome de Osric" seguiu. Mas dar rações **não debitou**, a Intuição 19 **não leu nada**, a ordem **nunca reagiu** a eu ter chegado, e o herói **não decidiu** o que fez a morte |
| 8 | **a prosa** | 3 | **3** | "Estrada parada é como panela sem fogo — ou ninguém tem pressa, ou ninguém quer ser visto"; "uma voz baixa e arrastada, como se tivesse vindo de dentro da madeira podre". Os 27 presságios da 4.ª viraram **9**; entrou **"à espera/calado" em 24 de 46** e repetições **verbatim** (4×, 4×, 3×) |
| 9 | **o fecho de sessão** | 2 | **2** | Acabei com **uma heroína morta, uma herdeira a 0/22, um companheiro caído, um Dragão a 3/29 e uma luta que não acaba**. Quero jogar a próxima por causa de **uma coisa só**: o nome de Osric (e a minha memória, não o save, a guarda) |

**Média: 3,0 de 5** — **a mesma da 4.ª**, e é o dado mais honesto desta sessão: a escuta tirou o ruído (nenhum empurrão a mais, 20 de 24 respostas, a frase do jogador no fim), e **deixou ver o vazio por baixo**. A 4.ª esfriava no corte do recado; a 5.ª **aquece e esfria conforme eu empurro**: a primeira metade (M1–M15) e a ponte (M28–M38) valem ~3,7; o empaque (M16–M27) ~2,3; a descida e a morte (M39–M64) ~2,4.

### Onde a história esfria, e por quê

**1. Quando o jogador pára, o mundo diz que vem e não vem (M16–M27).** A escada cumpre a tabela e o Narrador **não a cumpre**: o sinal, o NPC que vem buscar, o desabamento e o relógio completo chegam ao pedido e a resposta é uma anedota de Hakon. O passo aponta para "Procurar Osric na Candeia", onde o herói já não está, e o NPC "na taverna" chega a um rio. A frieza **não é da prosa**: é de uma intervenção que **não tem cena para onde ir**.

**2. O fio que o Mestre inventa não é o fio que o sistema guarda (M3–M35).** A cena entrega Edric, a ordem, o amuleto de cegonha e **um nome** — e o motor guarda **uma missão a 0/2**, um taverneiro registado como lugar, e uma espinha que diz que Edric é "músico". O Narrador sabe "Procurar Osric" e **nunca o nomeia**; o jogador não tem **para onde voltar**.

**3. O chefe não é de ninguém (M47–M64).** O Dragão que mata a heroína **não tem relação com a ordem, nem com Edric, nem com Osric**; o antagonista do fio é **outro** (e de outra espécie na outra tabela). Perde-se a única coisa que faria a morte **valer a pena contar**: ela diz respeito a alguém.

**4. A morte e o herdeiro não fecham (M55–M64).** A mais forte cena de agência do jogo (perder a heroína) cai num **ciclo** que repete uma imagem 18 vezes e **deixa o herdeiro numa luta que não acaba**.

### O que o sistema dá ao Narrador nesses momentos, e o que não dá

| o Narrador recebe | o que é | o que lhe falta |
|---|---|---|
| **A escada** (sinal / vem buscar / cobra) | uma frase de forma ("um presságio gratuito", "um NPC procura o herói na taverna") | **um fato verificável com nome e lugar** e **o lugar onde o herói está** (hoje o passo é o da missão, não o da cena) |
| **O relógio completo** ("o rebate: gente armada pergunta por Edric") | um acontecimento do sistema, uma vez | **uma regra de que não se ignora**: o Narrador pode calá-lo sem custo |
| **O QUE VOLTA** | a frase prometida | **a cena** que a honra: "cobrada" conta a linha ter entrado no pedido |
| **A pista da missão** (`falar_com Osric na Candeia`) | o nome de quem o herói devia procurar | **o taverneiro dizer-se Osric** na primeira cena em que o herói lhe fala |
| **A espinha** (batidas) | cena, em jogo, pergunta (pessoais, do antecedente) | **chegar ao pedido**: hoje 0 de 64 pedidos as trazem |
| **O estado do combate** | a lista de quem agiu | **quem está de pé, onde está o inimigo, qual golpe**; a prosa inventa "sopro" para uma cabeçada |

### Os 3 consertos de maior efeito

1. **A escada deve entregar um fato com cara, no sítio onde o herói está, e o relógio completo entra na cena.** O passo sai da *cena atual* ("estás na Ponte Lenta: o homem da ponte"), as intervenções falam do lugar ("na taverna" → pelo `lugar`), e o degrau `vem_buscar`/`cobra` e o relógio completo ganham **uma linha de FATO obrigatório** (um nome, uma frase dita) que o Narrador tem de pôr na cena. **Médio** (liga um sinal que já existe a um tracker que já existe; dentro da Fase MM) · `escuta.js` (`RUMOS`, o passo), `encalhe.js` (`INTERVENCOES`), `pauta.js`, `App.jsx` (a ligação).
2. **Fechar o laço pista → pessoa → missão → espinha.** A pista da abertura **manda o taverneiro dizer-se Osric** na primeira cena em que o herói lhe fala; o Cronista **nunca regista um lugar como pessoa** e **funde "o homem da ponte" com o nome que ele disse**; `falar_com` fecha pelo `canone`/`pessoas` quando a espinha já fechou o marco. **Leve a médio** (bug com teste que prova + ligar sinal dormente) · `abertura.js`, `missoes.js`, o prompt do Cronista, `pauta.js`.
3. **A luta tem de ter saída e a prosa tem de ler o dado.** Quando o grupo todo está caído ou estável e o inimigo (≤ 3 PV) não age, **o motor encerra** (o inimigo foge, ou o grupo é salvo); o "passar o fio" **fecha a luta** antes de abrir a cena do herdeiro; o estado vivo (quem está de pé, onde, qual golpe) **entra na narração** do combate. **Pesado** (muda o que o jogador vive; dentro da Fase MM, reversível por commit) · o motor de combate (turno do caído), `App.jsx` (passar o fio), `prompt.js` (o que aconteceu).

*(Fora dos três, para a **prosa**: uma linha de regra — "não feche em alguém calado à espera; feche num facto, num pedido ou numa imagem nova" — e uma lista de "frases já ditas nesta sessão" cortam o "Hakon solta um grunhido…". É voz do Narrador em massa, logo **pesado**; `prompt.js`.)*

---

## O veredito

**O nosso Mestre toca uma sessão à la Matt Mercer? Na conversa, sim, e melhor do que na 4.ª. Quando o jogador pára, e quando o dado pesa, não.**

**Na conversa, sim.** Em 24 turnos com pergunta, **20 respostas inteiras**, 3 parciais e **uma errada contra o save**; reagiu primeiro em 38 de 41; **nunca mais de um empurrão**; a frase do jogador no fim do pedido; os presságios caíram de 27 para 9. A ponte (M28–M38) é a melhor cena que joguei neste jogo: Edric nega o nome, a ordem já passou, os amuletos de cegonha, "a chave está no nome de Osric". Poupar o Troll **volta**. A recusa de API foi **bem tratada**.

**Quando paro, não.** O sistema **sabe** que estou parado — a escada subiu nos turnos 4, 7 e 10, o relógio encheu — e o Mestre **não conta nada disso**, a apontar para uma taverna que o herói deixou há 12 km. **Doze respostas e uma frase de Hakon** é o mundo à espera, não o mundo a mexer.

**Quando o dado pesa, não.** Um chefe de nível 7 num ato 0, sem relação com a ordem, **mata em 8 rodadas**; a prosa diz sopro onde a mecânica diz cabeçada; o herdeiro **herda uma luta aberta**; e a sessão acaba num **ciclo de 18 respostas** que o jogo não sabe fechar.

**Os cinco que mexem a sessão, pela ordem:** (1) a luta sem saída; (2) a prosa que contradiz o dado; (3) a escada que não vira cena; (4) o fio que parte em três (missão 0/2, espinha 1, taverneiro-lugar); (5) a ação que o jogo não regista (rações, Intuição, mural, correntes, compra). **E a proposta que mais mudaria o que o jogador vive** é o conserto 1+2: *um fato com cara quando o herói pára, e um nome quando o herói pergunta.*

| | 1.ª (v9.332) | 2.ª (v9.340) | 3.ª (v9.347) | 4.ª (v9.371) | **5.ª (v9.393)** |
|---|---|---|---|---|---|
| respostas jogadas | 49 | 10 (o teto) | 30 | 42 | **64** (46 de cena + 18 de combate/morte) |
| janela do painel | 374×310 | 374×310 | 374×310 | 800×451 | **800×451** |
| herói | Iara · Meio-elfo · Ladina | Brites · Anã · Guerreira | Tobias · Halfling · Caçador | Sibila · Tiefling · Bruxo | **Gaspar · Meio-orc · Clérigo** |
| perguntas do sistema | 5 de 12 | 7 de 12 | 4 de 15 | 4 de 14 | **5 de 16** (8 inventadas, 2 esquivadas, 1 errada) |
| inventadas / perdidas | 4 / 1 | 2 / 0 | 4 (+1) / 5 | 9 (+1) / 0 | **8 / 0** (1 errada contra o save) |
| onde a sessão partiu | T5 (a história fechou) | T11 (o teto da API) | M12–M15 (o guardião mudo) | M22–M26 (a porta) e M35 (o chefe) | **M16–M27 (o mundo não vem) e M47–M64 (o chefe e a luta presa)** |
| missões fechadas sem jogar · tramas forçadas · "você mudou" | 3 · 4 · 4 | 0 · 0 · 0 | 0 · 0 · 0 | 2 · 0 · 0 | **0 · 0 · 0** (e a que devia fechar, não fechou: 0/2) |
| recusas falsas de lugar | — | 4 em 10 | 12 em 30 | 0 em 42 | **0 em 64** |
| respondeu à pergunta | — | — | — | 11 de 16 | **20 de 24** |
| reagiu primeiro | — | — | — | 14 de 16 | **38 de 41** |
| empurrões por resposta | — | — | — | 23 em 18/24 turnos (até 4) | **17 em 64, máx. 1** |
| o mundo anda quando empacas | — | — | — | nunca (a escada não disparou) | **a escada dispara (4/7/10); 0 de 3 vira cena** |
| fechos de presságio | — | — | — | 27 de 42 | **9 de 46** (e 24 de 46 em "à espera") |
| o "como" do golpe final chega | 0 de 3 | — | 0 de 2 | 1 de 1 | **não provado** (a escolha "Poupar" chegou; o "como" do companheiro não) |
| a sala limpa fica limpa | não | — | não | não provado | **não provado** (o Troll poupado é lembrado) |
| a masmorra acaba (guardião, chave, chefe) | — | — | não | o guardião e a chave; o chefe matou | **guardião, chave, portão; o chefe matou em 8 rodadas** |
| a companheira é uma pessoa só | — | — | não | sim | **sim** |
| a segunda pessoa | — | — | 30 de 30 | 24 de 42 | **sem "Sibi" e sem erro de pessoa**; ("você" em 17 de 64) |
| chamadas por resposta | ~2,0 | 3,6 | 2,27 | 2,19 | **2,02** |
| pedido do Narrador (car.) | — | — | 126.675 | 138.059 (system 72.383) | **150.918 (system 74.957)** |
| nota da campanha | — | — | — | 3,0 de 5 (3,7 / 1,6) | **3,0 de 5** (3,7 / 2,3 / 2,4) |
