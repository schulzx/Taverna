# Pendências

O que se sabe que falta, com o motivo de ainda não ter sido feito. Uma
linha por item, e quem resolver apaga a linha.

Este arquivo existe porque a alternativa é lembrar — e a varredura da
v9.44 mostrou onde isso dá: regra escrita, ninguém liga o código, e o
jogador descobre jogando.

## Masmorra

- **~~Uma em cada oito masmorras é impossível de terminar.~~** RESOLVIDO na
  v9.53. O gerador ligava cada camada à seguinte sorteando destinos e sobrava
  sala sem pai — 58% das masmorras tinham órfã, e em 12% a órfã era a sala da
  CHAVE, com o portão do chefe trancado. Agora toda camada é reparada assim
  que nasce, e `garantirCaminhos` confere no fim. Medido: 0 órfãs em mil
  masmorras, chave sempre alcançável, 200/200 concluíveis.

- **~~O sorteio nunca alcançava o primeiro item de nenhuma tabela.~~**
  RESOLVIDO na v9.53. `sortear = arr[d(arr.length)]`, com `d(n)` devolvendo
  1..n: o índice 0 era inalcançável e uma em cada `n` chamadas caía fora da
  lista. Em 500 masmorras, 500 tinham passagem com a pista vazia. O mesmo
  `sortear` estava em `loot.js`, onde comia o primeiro prefixo, o primeiro
  sufixo e o primeiro poder de cada tabela.

- ~~**Mais da metade da masmorra é ignorável.**~~ RESOLVIDO na v9.54. Das três
  alavancas possíveis (portão com mais de um selo, prêmio por limpar tudo,
  chefe mais fraco a cada sala), entrou a terceira — a única que transforma
  explorar em DECISÃO em vez de virtude. Cada sala limpa tira 6% da vida do
  chefe, com teto em 40%: não trivializa o confronto, mas a diferença entre
  descer reto e limpar o andar aparece no primeiro golpe. E como cada sala
  também queima tocha e tempo, as duas pontas passam a puxar — o jogador
  escolhe onde parar, que era exatamente o que faltava.

- ~~**As tochas acabam antes de um terço da masmorra.**~~ RESOLVIDO na v9.54,
  em três partes. O número inicial passa a olhar o tamanho da masmorra (dá
  para CHEGAR ao chefe com folga, não para varrer tudo) — antes eram 6 a 8
  num lugar de até 11 salas, e o escuro no terço final não era tensão, era
  imposto. Existe agora um Feixe de Tochas no catálogo, barato de propósito,
  que se compra e se fabrica na bancada. E `tochaExtra`, que estava na tabela
  de RITMOS desde a v8.4 sem ninguém ler, enfim cobra: o passo cauteloso vê
  mais e queima mais, que era a metade da troca que não existia.

## Balanceamento — achado na varredura da v9.52

- **Cinco classes param de crescer no meio do caminho.** Medindo o dano POR
  TURNO (dano médio × ataques do turno, 400 rolagens por ponto), do nível 1 ao
  20:

  | classe | nv1 | nv5 | nv11 | nv20 | cresceu |
  |---|---|---|---|---|---|
  | Ladino | 7 | 13 | 24 | 41 | ×5,9 |
  | Guerreiro | 7 | 15 | 22 | 30 | ×4,3 |
  | Bruxo | 8 | 14 | 20 | 25 | ×3,1 |
  | Druida | 7 | 12 | 16 | 21 | ×3,0 |
  | Mago / Feiticeiro | 9 | 14 | 19 | 25 | ×2,8 |
  | Invocador | 8 | 12 | 16 | 21 | ×2,6 |
  | **Caçador / Engenheiro** | 7 | 15 | **15** | **15** | ×2,1 |
  | **Clérigo** | 8 | 15 | **15** | **15** | ×1,9 |
  | **Bardo / Monge** | 7 | 7–13 | 13 | **13** | ×1,9 |

  Caçador, Engenheiro, Clérigo, Bardo e Monge **congelavam no nível 5 ou 11** e
  não subiam mais nada até o 20. Um Monge nível 20 batia como um nível 5,
  enquanto o Ladino ao lado dele triplicava. A causa: quem não ganha o terceiro
  e o quarto ataque também não ganhava dado maior — os dois eixos de progressão
  passavam pela mesma porta.

  ~~RESOLVIDO~~ na v9.54, separando os eixos: quem NÃO chega ao terceiro ataque
  ganha o dado crescente na mesma escada dos conjuradores (11 e 17). Medido de
  novo, o vão entre um ganho e o seguinte caiu de **quinze níveis para seis**,
  e nenhuma classe passa mais de nove parada — nove é o do Guerreiro entre o
  terceiro e o quarto ataque, o único vão longo que se justifica, porque
  termina no maior salto isolado do jogo (34 → 50 de dano por turno).

  O Guerreiro mantém o dado de propósito. Dar-lhe dado por cima dos quatro
  ataques faria dele outra coisa: não o mestre das armas, o dono do combate.
  E o que sobrou é uma propriedade bonita — bônus fixos por golpe (arma,
  dádiva) favorecem quem bate muitas vezes; dados favorecem quem bate poucas.

  A ficha passou a mostrar os dois eixos na mesma pílula (`2 ataques × 2d6`) e
  a dizer o próximo degrau. Era metade da queixa: o Monge não só parava de
  crescer, ele não tinha como saber que tinha parado.

- ~~**Ação bônus nomeada não faz o que o nome diz.**~~ RESOLVIDO na v9.54 pelo
  caminho honesto: as descrições passaram a dizer o que o sistema faz — um
  segundo movimento no turno, gasto numa habilidade. Não pelo caminho
  contrário (dar de verdade os dois socos ao Monge e a ação inteira ao
  Guerreiro), porque a ação bônus renasce a cada rodada aqui: um Surto de Ação
  que valesse uma ação inteira TODA rodada daria ao Guerreiro o dobro de
  golpes permanente, e o Surto do 5e é uma vez por descanso.

- ~~**`ACOES_BONUS` tem "Bárbaro", que não é classe deste jogo**~~ RESOLVIDO na
  v9.54: entrada morta removida. Mago, Caçador, Bruxo, Engenheiro e Invocador
  seguem SEM ação bônus, e agora por decisão escrita: a segunda ação é a
  alavanca de poder mais forte deste combate — mais que dano, mais que defesa
  — e distribuí-la para tapar buraco de progressão (o do Caçador é da onda 3)
  seria pagar a dívida errada com a moeda mais cara.

- ~~**Trinta habilidades prometem número e não têm quem o cobre.**~~ RESOLVIDO:
  a v9.53 pagou doze e a v9.54 pagou as dezoito restantes. As cinco famílias:
  - ~~**Defesa temporária**~~ RESOLVIDO na v9.53: as cinco erguem uma GUARDA
    que soma à CA e vence por rodada, como a forma e a invocação.
  - ~~**Controle de inimigo**~~ RESOLVIDO na v9.54 em `controle.js`, a única
    das cinco que precisou entrar no motor do turno dos inimigos. Três verbos:
    VIRAR (Marionete, Discórdia — o inimigo passa a bater nos próprios e
    continua podendo ser derrubado por quem o controla), PARAR e CALAR (Selo
    de Interdito, Corte de Marionetes, Silêncio Que Grita — viram CONDIÇÃO, que
    o jogo já sabia cobrar) e PROVOCAR (Palco Aberto — todo inimigo vem para o
    herói e os companheiros rolam com vantagem). Mentira Luminosa entrou pela
    porta das invocações, que já sabe pôr uma criatura em campo por N turnos.
    O silêncio morde só quem conjura, e não vira um atordoamento de dois
    turnos: isso já é o Corte de Marionetes, e faria duas habilidades
    diferentes serem a mesma coisa mais barata.
  - ~~**Invulnerabilidade temporária**~~ RESOLVIDO na v9.53: as quatro entram
    como GUARDA, com uma escada deliberada — só a de UM turno (Vazio Perfeito)
    é absoluta e faz o golpe errar antes do dado; as de três e quatro turnos
    viram desvantagem, porque um combate inteiro sem poder ser acertado não é
    uma habilidade, é o fim do combate. Nada Me Alcança só morde feitiço.
  - ~~**Movimento e alcance**~~ RESOLVIDO na v9.54, e era maior do que parecia:
    a varredura achou **sete** habilidades dizendo "ignora" (quatro furam
    armadura, três furam cobertura) e **três** prometendo agir duas vezes, e
    não as seis mapeadas. As de "ignora" caíam no mesmo poço da Colheita
    Final — "Ignora cobertura, penumbra e distância neste disparo" não tem uma
    só palavra de violência, então a régua de habilidade ofensiva as
    descartava antes de qualquer conta e o PM saía da ficha à toa. Agora o
    leitor é consultado ANTES dela. Quem fura armadura rola contra o corpo nu
    (os 10 de base); quem fura cobertura rola como em campo aberto — e as duas
    portas ficam separadas, porque furar a couraça de alguém não faz o muro na
    frente dele desaparecer. A PRESSA dá duas AÇÕES na rodada (não dois
    golpes: quem conjura não bate) pela economia de ação que já existia. E o
    Passo do Vento, que dobrava o passo desde sempre, enfim ignora o terreno
    difícil que a descrição dele promete com todas as letras.
  - ~~**Reerguer que faltou**~~ RESOLVIDO na v9.53: Refrão Teimoso,
    Renascimento e Grande Necrópole entraram na tabela do `reerguerDe`, e o
    Refrão devolve a metade que a descrição dele promete com todas as letras.

- ~~**"Céu Escuro" diz "toda a área inimiga" e não é reconhecida como área.**~~
  RESOLVIDO na v9.54: a régua de `ehArea` pedia a preposição ("em área") e não
  reconhecia a coisa dita direto. Uma nuvem de flechas sobre a área inimiga
  acertava um arqueiro só.

- ~~**O conjurador do sexo masculino ataca com dano físico.**~~ RESOLVIDO na
  v9.54, e apareceu por acidente: a tabela de perfis do bestiário tem
  "feiticeira" e "mago" e nunca teve "feiticeiro", "arcanista" nem
  "conjurador" — todos caíam no perfil padrão. Achado ao testar o Silêncio Que
  Grita, que precisa saber quem conjura para saber quem calar.

- ~~**A exaustão se reanuncia todo turno.**~~ RESOLVIDO na v9.54 — e a causa
  não era a que esta linha supunha. A condição NÃO estava na ficha: quem a
  aplicava escrevia só no estado do React e deixava `personagemRef.current`
  para trás, e como quase todo o resto desta casa lê a ficha viva do ref e
  devolve o objeto inteiro, a primeira escrita seguinte apagava a exaustão
  sem saber que ela existia. No turno seguinte o herói estava descansado
  outra vez, o teste dava falso e a linha voltava. É a mesma armadilha que a
  v9.13 documentou nos espólios: quem escreve em um dos dois lugares escreve
  em nenhum.

## Testes e obstáculos

- ~~**"Se eu ficar pedindo testes infinitamente ele vai me dar testes
  infinitamente, mesmo que não tenha nada nem lógica."**~~ RESOLVIDO na v9.59
  em `desafios.js`. Relatado com quatro capturas, 17/08/2026: o herói no
  quarto de cima pedindo Percepção seis vezes seguidas — duas pagaram 168 e
  180 moedas, e as quatro seguintes bateram contra dificuldade 17 com o
  Mestre obrigado a narrar o vazio, uma vez atrás da outra.

  Três defeitos, e os três são o mesmo visto de ângulos diferentes: **o
  sistema não sabia contra o que se estava rolando.**

  1. **A dificuldade era sobre o herói**, não sobre o obstáculo. A conta era
     `12 + combate + masmorra + ameaça + nível/6`. Por isso o quarto virou 17
     e ficou 17 mesmo depois de esvaziado: o número nunca falou do quarto.
  2. **Não havia memória.** Nada registrava que aquele quarto já fora
     revirado. Numa mesa, "você já vasculhou aqui" é meia regra do jogo.
  3. **Quem pedia era o jogador.** Pedir "um teste de Percepção" é pedir o
     dado direto, pulando a parte em que se descobre se havia o que rolar.

  A ordem foi invertida: entra a AÇÃO declarada, sai um VEREDICTO — *rola*,
  *não precisa rolar*, *não dá desse jeito*, *você já tentou*, *aqui já foi
  vasculhado*. A dificuldade vem do obstáculo (a tranca de uma cadeia é pior
  que a de uma taverna, e é derivada da semente, então a mesma porta é a
  mesma porta para sempre). O livro de tentativas mora no save, e o que
  reabre um obstáculo fechado está **enumerado**: outra abordagem, ajuda,
  ferramenta nova, ou tempo declarado de sobra.

  Custo de falhar, decidido com o autor: tempo sempre, barulho onde faz
  sentido, e a falha crítica cobrando mais (esta última já existia).

  Os três tipos de rolagem passam a estar escritos: **teste de perícia**
  (o herói tenta), **salvaguarda** (algo acontece contra ele — e por isso
  ninguém a pede) e **jogada de ataque** (no tabuleiro).

- ~~**O prompt dizia "o jogador NÃO pede testes" e o código deixava.**~~
  RESOLVIDO na v9.64. A frase estava no `DESAFIOS_PROMPT` desde a v9.59, e
  embaixo dela havia uma segunda porta viva: nomear a perícia convocava o
  desafio correspondente e o dado saía.

  Por que a regra é essa, e não conforto de mesa: **quem escolhe a perícia
  escolhe o que existe.** "Peço Percepção" já afirma que há algo para ver;
  "peço Intuição" já afirma que há mentira. O dado então só decide se o
  herói alcança uma coisa que a própria pergunta plantou. Declarar a AÇÃO
  devolve a decisão a quem é dela — o mundo diz se há, e só depois o dado
  diz se você pega.

  Três coisas foram necessárias, e as duas últimas só apareceram no teste:

  1. o veredicto `naoSePede`, que recusa **e ensina** a frase que teria
     funcionado, tirada do mesmo catálogo que a leria — uma regra nova que
     só nega é uma regra que o jogador testa três vezes e abandona;
  2. o vocabulário teve de crescer junto. "Verifico o quarto se encontro
     algo" — o exemplo do próprio jogador — não casava nada. Tirar a porta
     de trás e manter o funil teria piorado o jogo em nome da regra;
  3. a fresta com nome próprio: metade das perícias carrega no nome o verbo
     da ação que cobre — "Arrombamento" tem "arromb", "Investigação" tem
     "investig" —, e o desafio casava pelo rótulo. A regra valia para
     Percepção e não valia para meia dúzia de outras, que é pior do que não
     valer para nenhuma. Agora, quando a frase é um pedido, o catálogo lê o
     que SOBRA dela sem a moldura e sem o nome da perícia.

- ~~**Escutar e rastrear rolavam contra o vazio.**~~ RESOLVIDO na v9.64, e
  é a outra metade do conserto da v9.59. Lá, a busca deixou de rolar contra
  o nada porque o mundo já sabia, item por item, o que estava escondido em
  cada canto. Escutar e rastrear não tinham essa base: rolavam **sempre**,
  contra dificuldade de catálogo, e a pergunta que sobrava — "havia mesmo
  alguém falando do outro lado?" — caía na IA, que responde pela cena que
  quer contar e não pelo lugar onde o herói está.

  Agora o oráculo responde antes do dado, com o que o código sabe do lugar
  e da hora, e a resposta entra no livro de fatos. Medido: há o que ouvir em
  75% num salão cheio e 20% numa cripta vazia; há rastro em 65% no campo,
  25% na rua de pedra, 45% sob chuva. Quando a resposta é não, não há
  rolagem, o lugar fica marcado e o envelope proíbe a meia-pista de consolo.

  ~~**Aberto:** falta o mesmo tratamento para "ele está mentindo?"~~
  RESOLVIDO na v9.65. A pergunta `estaMentindo` entrou, e é a única do
  catálogo que exige alvo NOMEADO: o texto dela carrega o nome da pessoa,
  porque sem isso o fato valeria para todas as pessoas da cena e duas
  conversas diferentes no mesmo dia herdariam a mesma resposta. Sem nome,
  não pergunta — o desafio rola como sempre rolou, que é o lado seguro. É
  `social` e não `perigo` porque a duração certa é o DIA: mentir é
  disposição, não posição de patrulha.

- ~~**Convencer, intimidar e enganar rolavam contra um 14 fixo.**~~
  RESOLVIDO na v9.65, em `social.js` — o mesmo 14 para arrancar uma fofoca
  de um bêbado e para convencer o capitão da guarda a abrir o portão. É o
  terceiro caso do mesmo defeito, e o mais usado dos três fora da luta: a
  busca rolava contra um número que descrevia o herói e não o quarto; a
  tranca, contra um que não sabia se a porta era de taverna ou de cadeia.

  E havia o lado pior: no SUCESSO, o quanto a pessoa cedia era inteiramente
  da IA. Um sistema em que o dado decide SE e a IA decide QUANTO não é um
  sistema, é uma formalidade antes da improvisação.

  A peça central é a **escada do pedido** — cinco degraus, de uma cortesia
  (8) a trair quem lhe paga (22) —, e cada degrau diz três coisas: quanto
  custa, o que o sucesso compra **exatamente**, e o que ele nunca compra.
  Somam-se a relação (dez graus, de cônjuge a inimigo), o papel (quem tem
  farda ou fé tem mais a perder), a fama e quatro **alavancas que o código
  confere**: ouro que está mesmo na bolsa (e sai dela), o segredo que o
  registro de pessoas guarda desde sempre e nunca tinha mexido num número,
  uma dívida anotada, e o aço à vista — este só para quem intimida.

  Duas propriedades foram desenhadas de propósito:

  - **o degrau padrão é 14.** Onde o sistema não lê o tamanho do pedido, o
    jogo se comporta como antes; a régua nova só morde onde há informação;
  - **prometer o que não se tem não desconta nada, e o sistema diz isso.**
    Antes o blefe falhava em silêncio e o jogador passava a partida achando
    que a oferta pesava.

  Medido: a mesma fofoca ao mesmo guarda custa 16, o portão 23, a traição
  27; o mesmo favor custa 9 ao amigo taverneiro, 19 ao guarda estranho e 25
  ao nobre inimigo. Ameaça e chantagem funcionam **e cobram**: quem as usa
  desce um degrau na relação daquela pessoa, tenha o dado dado certo ou não.

  E o livro de tentativas passou a chavear o social por **pedido e pessoa**,
  não por lugar — chavear pelo lugar faria o segundo assunto com o mesmo
  taverneiro ouvir "você já tentou isso aqui" e travaria a conversa inteira
  depois de uma recusa qualquer.

- ~~**Falhar era não acontecer nada.**~~ RESOLVIDO na v9.65. O herói
  tentava, o dado dizia não, e o Mestre ficava com a tarefa de narrar uma
  parede — a improvisação mais frequente que ainda sobrava para a IA.
  Agora toda falha cobra o custo do seu tipo, e **falhar por um ou dois não
  é falhar: é conseguir pagando**.

  A lista de `porPouco` é curta de propósito, e a razão é uma regra da casa:
  ela só vale onde o CÓDIGO consegue cobrar o preço. O que ele cobra hoje é
  minutos (o relógio anda de verdade), barulho (que vira pergunta ao
  oráculo, e a resposta é fato) e o livro de tentativas. Não vale no social
  — ali "consegui, mas caro" já é um degrau da escada — nem dentro da luta,
  onde o turno já é o preço.

  Medido, e dito sem maquiagem: onde o `porPouco` vale, a chance efetiva
  sobe cerca de **dez pontos** (numa dificuldade 15 com bônus +1: de 30%
  para 40%, dos quais 10 pagando). É o preço de trocar becos por decisões.

  ~~**Aberto:** um preço em PELE ficou de fora.~~ RESOLVIDO na v9.66, em
  três passos e nesta ordem, porque o primeiro é o que fazia falta:

  1. **A porta única do dano.** "O herói sofre X agora" era uma frase que o
     programa sabia dizer de cinco jeitos — uma varredura por
     `vida: Math.max(0, …)` acha cinco lugares, cada um resolvendo por
     conta própria. Nenhum reaproveitável por quem viesse depois, e é assim
     que se chega a um sexto. `sofrerNaPele` tira o PV da ficha VIVA,
     aplica a condição respeitando imunidade, e chama `resolverQueda` NA
     HORA — que é o ponto todo: cair a zero fora da luta já era resolvido,
     mas só depois de o Mestre responder, e um dano que zerava a barra
     antes disso deixava o herói andando com 0 PV até a IA devolver texto.
     A armadilha da masmorra passou a entrar por ela, e é isso que a torna
     uma porta e não o embrulho de uma chamada só. Os três sites de DENTRO
     do combate ficaram fora de propósito: aqueles terminam a rodada em
     `resolverQueda` de qualquer jeito, e puxá-los para cá resolveria a
     queda duas vezes na mesma rodada.

  2. **A queda ligada à salvaguarda** — a pendência de baixo, resolvida
     pela outra ponta. Cair é a coisa que acontece CONTRA o herói, e por
     isso é salvaguarda e não teste. A de Destreza é `meia`: passar não
     anula, corta pela metade. A altura é DERIVADA do lugar e da semente,
     como a dureza da tranca — a mesma parede tem sempre a mesma altura, e
     a frase manda sobre o lugar (quem diz "escalo o penhasco" está no
     penhasco). 1d6 por 3 m, com teto de 8 dados.

  3. **A tabela.** `pelePorPouco` e `peleSeca` são campos separados porque
     os dois lados não custam igual: subir machucado (`enfraquecido`) não é
     despencar. A tranca cobra 2 PV do ombro na vitória paga; o arcano e a
     medicina cobram a reserva.

  **Achado jogando, e é o mesmo bug pela QUARTA vez:** a primeira versão
  passava a dificuldade da queda por `dcDaFonte`, que soma nível/3. Faz
  sentido para o que uma criatura dispara — o veneno do que se caça no
  nível 12 é pior que o do nível 1 — e nenhum para um penhasco, que não
  fica mais alto porque o herói subiu de nível. Na tela: 10 metros viraram
  dificuldade **19** para um herói de nível 12. Agora `dcDaQueda` mora em
  `desafios.js`, olha só a altura (3 m → 12, 10 m → 17, 30 m → 20), e tem
  asserção com nome — uma conta que já voltou quatro vezes precisa de uma.

  **Aberto:** falhar em `estancar` deveria cobrar do PACIENTE, que é o que
  a mesa faria. O desafio não sabe QUEM está sendo tratado, e cobrar de um
  alvo que o sistema não identificou é inventar uma vítima. Por ora cobra a
  reserva de quem trata.

- ~~**A porta vigiada estava no catálogo e sem chamador.**~~ RESOLVIDO na
  v9.64. A pergunta existia desde a v9.62 e nada a chamava. Ela entra ANTES
  da tentativa de tranca — depois do resultado seria a IA escolhendo se
  houve testemunha conforme o que ficou dramático — e é ela que faz a
  escolha entre as vias significar alguma coisa: sem olhos por perto,
  barulho é só barulho e a gazua silenciosa não compra nada.


- ~~**O painel de Ações era uma porta dos fundos para o sistema inteiro.**~~
  RESOLVIDO na v9.59.1, e **achado jogando** — nenhuma suíte pegaria, porque
  o defeito estava no caminho que os testes não percorrem: a interface.

  Sob o título "Pedir um teste" havia seis botões que chamavam `pedirTeste`
  DIRETO — dificuldade velha, sem livro de tentativas, sem adjudicação. Toda
  a arquitetura da v9.59 tinha um atalho que a contornava, e por ele dava
  para farmar testes infinitos exatamente como na captura de tela original.

  É a **terceira vez na mesma sessão** que o mesmo bug aparece: uma regra que
  mora em um só de dois caminhos. Antes foram o resolver comendo o movimento
  local e o botão do mapa; agora o painel.

  Agora cada botão DECLARA uma ação, com a frase que um jogador escreveria, e
  entra pela mesma porta de tudo. E um botão a menos: **"Aguentar" era pedir
  uma salvaguarda**, e salvaguarda ninguém pede — o botão contradizia o
  sistema que deveria servir.

- ~~**"Você já conseguiu isso aqui" depois de uma busca bem-sucedida.**~~
  RESOLVIDO na v9.59.1, também achado jogando. Procurar não é conseguir:
  a frase soava como se não houvesse mais nada (e pode haver, mais fundo e
  mais difícil) e tratava revirar um quarto como tarefa que se conclui. Agora
  a busca repetida responde como a falha responde — "você já revistou isto
  assim" —, e reabre com ajuda, ferramenta ou tempo. Para uma porta aberta ou
  um guarda convencido, "já conseguiu" continua certo.

- ~~**A porta trancada não tinha como ser aberta.**~~ RESOLVIDO na v9.59.
  Quatro vias, cada uma com perícia, custo e barulho próprios: a chave,
  ferramentas de ladrão (Prestidigitação, silenciosa), uma magia que abra
  (Arcanismo, mais fácil), e força bruta (Arrombamento, mais difícil e
  **acorda a casa**). Pedir a via que não se tem NÃO vira teste difícil —
  vira "assim não dá, e olha o que abriria". É o que faz a escolha entre
  elas significar alguma coisa: o Ladino entra calado, o Guerreiro entra
  acordando todo mundo.

- ~~**A salvaguarda ainda não é disparada por nada.**~~ RESOLVIDO na v9.60 em
  `salvaguardas.js`. Era regra escrita sem código atrás — a v9.59 declarou
  que existem três rolagens e a segunda não tinha nada por baixo.

  Seis salvaguardas, uma por atributo, e **duas proficientes por classe** —
  é isso que faz o Guerreiro aguentar veneno (79% contra 50% do Mago) e o
  Mago aguentar a mente (70% contra 30%). Sem a proficiência, salvaguarda
  seria o atributo com outro nome e a classe não mudaria nada na hora em que
  o mundo bate de volta.

  Duas fontes de verdade, ligadas:

  1. **A armadilha de masmorra**, que era um bug silencioso: o dano da sala
     saía inteiro da ficha, sem nada entre o gatilho e o ferimento. Agora
     pede salvaguarda de Destreza, e passar **corta pela metade** em vez de
     anular — a armadilha já disparou e o herói já está dentro dela.
  2. **As aflições de golpe**, que já rolavam uma resistência escondida com
     atributo cru mais nível/4. Aquilo *era* uma salvaguarda sem saber que
     era; agora tem nome, o bônus certo e aparece na tela.

  De quebra, o Gnomo e o Sintético passaram a cobrar a vantagem contra
  efeitos mentais que as fichas deles prometiam desde a criação do jogo e
  que **nada, em lugar nenhum, lia** — e vantagem aqui é dois dados, não um
  bônus fixo, porque traduzir a promessa em "+3" seria trocá-la por outra
  coisa parecida.

- ~~**Salvaguarda de empurrão e de agarrão ainda não têm fonte.**~~
  RESOLVIDO na v9.68, e pelo lugar mais improvável: a varredura do prompt.

  As doze categorias precisavam de um MOMENTO em que disparassem. A queda
  achou o dela na v9.66, na falha de `escalada`. As outras acharam quando o
  canal `perigo` substituiu o pedido de rolagem da IA: agora que ela declara
  o que o MUNDO faz — "a teia desaba do teto" — e `fonteDaSalvaguarda` lê a
  frase, TODAS as doze passaram a ter porta. Medido em partida: a teia virou
  salvaguarda de Força, 16 de dano e a condição `agarrado`.

## Combate e habilidades

- ~~**Invocação fora de combate.**~~ RESOLVIDO na v9.54: cada invocação passa
  a carregar os DOIS relógios, e cada um vale no seu tempo — rodadas na luta,
  minutos no mundo (cinco por rodada). Das três saídas possíveis, esta é a
  única que não mente: proibir contradiria a ficção (chamar um batedor para
  vasculhar a mata é uso legítimo) e sumir na troca de cena é um prazo
  invisível, que o jogador não pode planejar. O relógio de minutos só corre
  fora da luta — deixar os dois juntos desfaria a fera no meio do combate por
  causa dos seis segundos que a rodada custa no calendário.

- **Gatilho `atacar` da invisibilidade, em jogo.** Coberto por teste e pelo
  caminho gêmeo (`conjurar`, esse verificado no navegador), mas nunca vi um
  golpe de arma derrubar a invisibilidade numa partida de verdade — nas
  tentativas o inimigo estava sempre fora de alcance. *(v9.45)*

- **Propriedade `sutil` e o resto do catálogo de armas.** Feito para as
  armas do catálogo; armas geradas pelo loot com nomes inventados caem na
  dedução por nome (`PISTAS_ARMA`), que não conhece "sutil". Uma rapieira
  lendária chamada "Presságio" vira arma marcial comum.

## Onde o herói está

- ~~**O sistema negava um lugar que ele mesmo tinha desenhado.**~~ RESOLVIDO
  na v9.58, e era o pior bug aberto do projeto — a mecânica que o jogador
  chamou de "importantíssima e crucial".

  "Vou até o Javali Cambaleante" respondia **"Não encontrei ... no que você
  conhece do mundo"**. A causa era uma ordem de portas: `interceptarMovimento`
  roda no envio, `talvezAndarNaCidade` roda depois, dentro do `enviar`. A
  frase tem "vou ate", então casava `querPartir`, e o resolver de destinos
  procurava o Javali entre as CIDADES do mapa. Não achava — é uma taverna —,
  imprimia a recusa, devolvia `true`, e o turno morria ali: quem sabia mover
  nunca chegava a rodar.

  A correção é uma condição: `querPartir(acao) && !alvoLocalPedido(acao)`.
  Quem tem um alvo a pé aqui não está pedindo estrada, e a estrada não pode
  nem opinar. Os dois caminhos passaram a compartilhar `lugaresDaqui()` e
  `moverParaLocal()` — se divergissem, um deles voltaria a mentir, e o que
  mente é sempre o que ninguém testa.

- ~~**"Não vi a opção no mapa para ir para o local manualmente."**~~
  RESOLVIDO na v9.58. A planta desenhava a taverna, a forja e o moinho e não
  deixava ir a nenhum: um mapa que mostra onde dá para ir e não deixa ir é um
  índice. Agora cada local tem "▸ ir", cada cômodo tem "▸ entrar", quem está
  num lugar tem "▸ voltar ao meio da cidade", e cada cidade conhecida no
  mapa-mundo tem "🧭 Viajar para". **O botão não é um atalho paralelo**: chama
  a mesma função que a frase chama e manda ao Mestre a mesma frase.

- ~~**O mapa abria no continente.**~~ RESOLVIDO na v9.58. O herói passa a
  maior parte da campanha dentro de um assentamento, e a pergunta que ele faz
  ao abrir o mapa é "para onde eu posso ir daqui?". A planta é a padrão
  quando há cidade sob os pés; o mundo continua a um clique, e volta a ser o
  padrão sozinho em viagem.

- ~~**Lugares dentro dos lugares: os cômodos.**~~ RESOLVIDO na v9.58 em
  `comodos.js`. A pergunta foi "quartos numa taverna funcionam?", e a resposta
  honesta era MEIO: a distância `dentro` existia desde a v9.54 e o Mestre
  podia registrar `lugar_atual: "o quarto de cima"` — mas era regra escrita
  sem código atrás. O sistema não SABIA que a taverna tem quartos, não sabia
  quantos, e não garantia que o quarto da primeira noite fosse o da terceira.
  E como a lista de destinos parava na porta do prédio, "subo para o quarto"
  não movia nada.

  Agora a hierarquia tem quatro níveis: mundo → cidade → local → cômodo. A
  planta do prédio é determinística, entra no prompt inteira, e cômodo
  restrito (a adega, a cripta, as celas) chega ao Mestre marcado como
  invasão. O `lugar` ganhou `dentroDe`, que é o que faz "desço para o salão"
  ter para onde descer.

- ~~**"desço para o salão" levava à sala dos fundos.**~~ RESOLVIDO na v9.58,
  achado pelo teste dos cômodos. `casaNome` casava prefixo sem exigir fim de
  palavra — "sala" é prefixo de "salao" —, e o desempate por número de
  pedaços dava a vitória ao nome mais longo. Duas correções: a palavra tem
  que acabar onde acaba (com o plural do português aceito nos dois sentidos,
  para "o quarto" achar "os quartos do sótão"), e **o nome inteiro ganha de
  tudo** — quem escreveu o nome exato já disse qual é.

- ~~**A viagem não dizia ao Mestre quanto falta — nem para onde.**~~
  RESOLVIDO na v9.56. A linha que ele recebia turno após turno era `EM VIAGEM
  desde Nova do Norte (desde o dia 7)` — sem destino, sem progresso, sem
  nada. Por isso escrevia "a estrada segue" repetidamente: não tinha como
  saber que o terceiro dia é diferente do primeiro.

  E havia um erro de aritmética embaixo. A chegada era medida em DIAS DE
  CALENDÁRIO e o avanço em HORAS DE ESTRADA — dois relógios diferentes.
  **Acampar cinco dias numa clareira, sem andar um metro, fazia o herói
  chegar**: o tempo passava, logo a viagem acontecia.

  Agora a viagem conta ESTRADA PERCORRIDA, e só andar anda. A régua fecha
  dos dois lados: um dia de jornada tem 8 h de marcha, um avanço cobre 4
  dessas horas (meio dia), e o relógio anda meio dia de calendário — logo
  uma rota de 6,5 dias leva 13 avanços e gasta 6,5 dias. O Mestre recebe
  quanto falta e uma instrução de ritmo por faixa (começo / meio / falta
  pouco / último trecho), com a proibição de dizer os números na prosa.

- ~~**Rotas de setenta e cinco avanços.**~~ RESOLVIDO na v9.56, e só
  apareceu porque a conta acima passou a existir: o gerador produz travessias
  de até 37 dias de marcha, e a 4 h por avanço isso dava 75 cliques para
  atravessar o mapa. O modelo antigo escondia o número. A saída não foi
  encurtar o mundo — foi fazer o PASSO crescer com a viagem: trecho curto se
  anda em meios-dias, travessia épica se anda em semanas. Teto de 14
  avanços, e o relógio sai do mesmo número para os dois nunca discordarem.

- ~~**Forçar a marcha só queimava o dia.**~~ RESOLVIDO na v9.56: as três
  horas extras passam a cobrir ESTRADA, e duas marchas forçadas economizam
  um avanço inteiro. Até aqui a escolha custava exaustão e não aproximava o
  herói de lugar nenhum.

- ~~**Uma vez na estrada, nada avançava a estrada.**~~ RESOLVIDO na v9.56
  (etapa 2), e era o buraco mais fundo dos três. `detectarPartida` recusava
  quem já estava viajando com o comentário "quem cuida é o módulo" — e era
  verdade enquanto a chegada vinha do calendário: bastava o tempo passar.
  Com a viagem contando estrada percorrida, o herói ficaria a 7% do caminho
  para sempre. Entra `detectarSeguirViagem`, na mesma régua da casa (escreva
  o que você faz): "sigo viagem", "continuo", "toco em frente". Exige verbo
  de seguir E coisa de estrada, e por isso "sigo conversando com Bram" e
  "sigo o rastro do lobo" não andam um metro.

- ~~**A rota era um espaço liso.**~~ RESOLVIDO na v9.56 (etapa 2): as células
  do ermo (v9.54) já sabiam desenhar o caminho e ninguém as pendurava na
  jornada. Agora a rota tem TRECHOS, cada avanço cai num deles, e o Mestre
  recebe o trecho atual com o que há nele — permanente, igual na volta. Em
  viagem quem descreve o terreno é o registro da viagem: mandar o bloco do
  ermo junto seria dizer a mesma coisa duas vezes com palavras diferentes, e
  duas descrições do mesmo lugar é como o Mestre inventa uma terceira.

- ~~**Só dava para viajar dizendo o NOME do lugar.**~~ RESOLVIDO na v9.57
  (etapa 3) com `resolver.js`. Ninguém joga sempre pelo nome: diz-se "vamos
  para a capital", "quero ir ao porto do norte", "voltamos para onde
  estivemos". O sistema respondia a isso com silêncio, e o Mestre inventava
  um destino.

  Agora a descrição vira lugar. O resolver procura em tudo o que o próprio
  sistema gerou — nome, porte, região, continente, bioma, relação, domínio,
  o que já foi pisado — e no cânone e no elenco, que é como "a cidade onde
  encontramos o ferreiro" acha resposta. Devolve uma de quatro coisas: ACHEI
  (vai), AMBÍGUO (lista numerada), VAGO (mais de cinco: pede pista melhor)
  ou NADA (diz o que conhece).

  **Quem pergunta é o sistema, não o Mestre** — se ele desambiguasse estaria
  escolhendo, e escolher destino é do jogador; e se apenas perguntasse na
  prosa, a resposta voltaria como texto livre para ser interpretada de novo,
  o mesmo problema um turno depois. A resposta é um número.

  Na dúvida, NÃO MOVE. Um resolver que chuta teleporta o herói para o lugar
  errado, e isso custa a sessão.

- ~~**A pausa da viagem não existia.**~~ RESOLVIDO na v9.56 (etapa 2): uma
  luta na estrada agora PARA a viagem, e a pausa diz onde parou ("no 4º
  trecho de 13, junto às três pedras"). A pausa é LIDA, não guardada — se há
  luta e há jornada, a viagem está parada. Como só `viajar` anda, não há
  estado para sincronizar nem para esquecer de desfazer.

- ~~**"Vou até o Javali Cambaleante" e o sistema me deixa no centro.**~~
  RESOLVIDO na v9.55, e era o mais grave dos três achados da partida. O
  Mestre narrou a travessia da praça e a porta da taverna — impecável — e o
  marcador do mapa não saiu do lugar.

  O Mestre estava CERTO em não registrar nada: o prompt lhe diz, desde a
  v9.39, que `lugar_atual` é para o que fica FORA da cidade, e que voltar à
  cidade é `lugar_atual: null`. A taverna não é fora da cidade. O modelo do
  lugar tinha dois estados — "na cidade" e "fora dela" — e a cidade inteira,
  com as suas cinco a sete portas, cabia no primeiro.

  Agora quem move é o CÓDIGO, e move ANTES de o Mestre responder: o jogador
  escreveu o nome de um lugar que o sistema conhece, com um verbo de
  deslocamento; não há o que interpretar. Vale para os dois lados do muro —
  um local de dentro é `dentro` (sair leva minutos), um do cinturão é
  `arredores` (leva horas, e o relógio anda de verdade).

  A régua é estreita de propósito: exige o verbo E o nome. Falar de um lugar
  não é ir até ele — "pergunto ao guarda sobre a forja" tem o nome e não tem
  a viagem —, e um falso positivo aqui teleporta o herói, que é o erro que o
  `lugar.js` inteiro existe para impedir.

- ~~**Coisas da cidade caindo no mar.**~~ RESOLVIDO na v9.55. Em Rio das
  Águias o pomar cercado e o moinho de cima boiavam a oeste da muralha, e o
  Cais Torto ficava no meio da praça — o cinturão era plantado num raio fixo
  em volta do centro, sem ninguém perguntar onde estava a água. Agora o
  ângulo é dobrado para longe do mar (espelhado no eixo vertical, que é o
  eixo do mar), e quem vive de água — doca, cais, embarcadouro — vai PARA a
  linha d'água em vez do anel. A conta que desenha o mar e a que planta as
  coisas passaram a ser a mesma função.

- ~~**Dois nomes escritos um por cima do outro na planta.**~~ RESOLVIDO na
  v9.55: o ângulo de cada local era `i / (n - 1)`, e com isso o PRIMEIRO e o
  ÚLTIMO caíam no mesmo lugar (0 e 2π). Era o que colava "Feira Baixa" em
  "Javali Cambaleante". Dividir por `n` fecha a volta sem repetir.

- ~~**O nome cardeal mentia sobre onde a coisa estava.**~~ RESOLVIDO na
  v9.55. Os bancos de nome trazem "do Norte", "do Sul", "do Vento Sul", e o
  sorteio nunca olhou onde a cidade tinha caído: nascia "Nova do Norte" no
  canto de baixo do pergaminho com uma "Vila do Sul" logo acima. A régua é a
  do olho e não a do compasso — só recusa quando o nome está na METADE
  errada do mapa. Medido em 1.426 lugares gerados nos cinco moldes: zero com
  o cardeal fora de lugar.

- ~~**A rosa dos ventos não dizia para onde é o norte.**~~ RESOLVIDO na
  v9.55: a estrela existia desde sempre sem uma letra. Agora tem N, S, L e
  O, e eles obedecem à mesma convenção que a régua dos nomes usa — as duas
  precisam concordar, senão o mapa contradiz o próprio índice.

- ~~**A planta da cidade é a mesma para todo mundo.**~~ RESOLVIDO na v9.54
  com `formaDaCidade`, que lê os dois fatos que TODA cidade deste jogo tem em
  todos os moldes: quanta gente mora nela e em que chão ela está. Não lê o
  `porte` de propósito — são dezenove portes espalhados por cinco moldes
  ("fundeadouro", "andar-mestre", "posto avançado"), e uma tabela por nome
  seria uma lista para esquecer de atualizar. População é um número, e número
  compara sozinho.

  Aldeia de 190 almas não tem muralha nem portão; vila levanta paliçada;
  cidade paga pedra; capital paga pedra grossa. Uma rua só até haver dois
  destinos, e anel viário só na cidade grande. Costa tem água de um lado e
  cais; montanha nasce espremida; fortaleza é compacta — muita parede em
  volta de pouco chão. O tamanho na tela é uma ESCADA de cinco degraus e não
  um logaritmo: a primeira versão usava log da população e entregava uma
  aldeia de raio 27 ao lado de uma capital de 37, matematicamente correta e
  visualmente inútil.

  E o Mestre passou a receber a mesma linha — ele narrava portão, guarda e
  muralha numa aldeia que não tem nenhum dos três.

- ~~**Os arredores não estão no mapa-mundo das outras cidades.**~~ RESOLVIDO
  na v9.54 com a marca `pisada`, que é diferente de `descoberta` e a
  diferença importa: ouvir falar de uma vila revela o ponto no pergaminho;
  ter dormido nela revela o que fica em volta. Toda cidade pisada guarda o
  cinturão dela, desenhado apagado; a de agora continua cheia. Mapa velho é
  assim — o que você andou fica, mais fraco.

- ~~**Um lugar DENTRO de outro.**~~ RESOLVIDO na v9.54 com a distância
  `dentro`, lida do NOME do lugar por uma lista curta e literal (andar,
  porão, cripta, salão, corredor…). "de cima" não entra: o moinho de cima
  fica nos arredores, e é ali que ele fica. O texto do prompt muda junto — um
  andar de torre não é "fora da cidade", sair dele leva minutos e não horas,
  e o mundo que vem até o herói é quem sobe a escada, não quem passa na
  estrada.

## O vilão

- **A nêmese cria inimigos; ela precisa criar o VILÃO.** Pedido em
  18/08/2026. Hoje `MOVIMENTOS_DO_MUNDO` tem um fio de nêmese e o gerador
  sabe pôr um adversário no caminho — o que não existe é o arco. Um vilão
  não é um inimigo forte: é uma pessoa com um plano que anda enquanto o
  herói faz outra coisa, e é o andar do plano que faz o confronto final
  significar alguma coisa.

  O sistema completo tem quatro tempos, e cada um é uma decisão que hoje
  cairia na IA — que é exatamente onde ela não deve estar:

  1. **Criação.** Quem é, de onde saiu, o que quer, e por que o mundo o
     deixou chegar até aqui. Tem de nascer do que a campanha JÁ tem —
     uma facção, um nome do cânone, uma dívida do herói — como a
     iniciativa do mundo já faz: puxar fio aberto, nunca inventar um novo.
  2. **Apresentação.** O vilão aparece antes de ser combatido, e por obra
     dele: um decreto, um recado, um morto conhecido, um lugar fechado.
     Quem decide QUANDO é o relógio dele, não a conveniência da cena.
  3. **Desenvolvimento.** Um relógio próprio que anda com o tempo e com o
     que o herói faz ou deixa de fazer, com marcos visíveis — e com o
     vilão reagindo às derrotas que sofre, em vez de esperar parado.
  4. **Confronto.** Não um só: o primeiro em que ele escapa ou o herói
     escapa, e o último, cuja dificuldade e cujo elenco saem do que o
     relógio marcou. Perder um confronto do meio tem de custar alguma
     coisa que dê para ver.

  O que já existe e serve de base: relógios com gatilho e tamanho,
  facções e guerra, o cânone com vontades pendentes, o registro de pessoas
  com nome riscado, e o livro de fatos do oráculo. O que falta é o arquivo
  que amarra os quatro tempos e o envelope que entrega cada momento pronto
  ao Mestre, para o vilão parar de ser um adjetivo e virar um calendário.

- ~~**Quatro perícias da ficha não tinham como aparecer no jogo.**~~
  RESOLVIDO na v9.67, e era um buraco que dava para MEDIR: Acrobacia,
  Fortitude, Montaria e Atuação existiam na tela de personagem, custavam
  pontos para treinar, e não havia frase nenhuma no mundo que as
  convocasse. Um jogador podia gastar a especialização inteira em Acrobacia
  e nunca rolar uma.

  O catálogo foi de 15 para 31 entradas. Entraram as quatro órfãs e os
  momentos mais comuns de uma mesa que faltavam dentro das perícias já
  cobertas: **desarmar a armadilha** (numa masmorra cheia delas, e não
  havia como declarar que se tentava), atravessar a nado, saltar o vão,
  vencer o peso, escapar das cordas, orientar-se no ermo, ler um corpo,
  reconhecer um brasão, falsificar um documento, seguir alguém sem ser
  notado.

  A régua para entrar continua a mesma, e é o que separa isto de uma lista
  de gatilhos: **verbo de esforço declarado.** "Olho o cavalo" não é
  Montaria; "domo o cavalo que empinou" é. E o teste de cada entrada nova
  vem em par — a frase que ela deve reconhecer e a frase vizinha que ela
  NÃO pode roubar.

  Três achados no processo, e os três são bugs de fronteira:

  1. `buscar` é a primeira entrada do catálogo e rouba tudo que diz
     "examino" ou "procuro". Examinar um CORPO é Medicina; procurar ÁGUA
     no ermo é Sobrevivência. Cada leva nova devolve para `buscar` uma
     palavra que ela precisa recuar.
  2. `reconheço esse ___` de `fraqueza` engolia `reconheço esse brasão`.
     Reconhecer a criatura e reconhecer a heráldica caem as duas em
     Saberes — o que torna a confusão invisível no número e visível na
     ficção.
  3. **o `\b` que mata plural voltou.** `(moeda|dinheiro)\b` recusa
     "moedas", e o primeiro teste da leva pegou. É o bug que este projeto
     mais repete depois da regra sem código atrás.

- ~~**As dificuldades do catálogo eram 13, 14 e 15, e nenhuma sabia dizer
  por quê.**~~ RESOLVIDO na v9.67 com a régua: sete degraus nomeados, do
  `trivial` (5) ao `heroico` (25). Um número sem nome não se discute e não
  se ajusta — quem mexesse ali daqui a um mês olharia um 14 sem ter como
  saber se ele quis dizer "isso é difícil" ou "alguém digitou 14".

  Cinco entradas que marcavam 14 subiram para 15 (`incomum`), porque 14 não
  era degrau de nada. Um ponto em cada. E a linha que o jogador lê passou a
  nomear o degrau em vez de dizer "obstáculo comum" para tudo, inclusive
  para um 18 — o número e a etiqueta discordavam na cara dele.

  A asserção que impede o 14 de voltar: **todo número do catálogo é um
  degrau da régua**, e a suíte reprova qualquer valor solto.

- ~~**A lista do que NÃO se rola tinha três entradas.**~~ Ampliada para
  dez na v9.67, e cresceu **junto** com o catálogo de propósito: cada verbo
  novo que o sistema aprende a reconhecer traz consigo um punhado de frases
  parecidas que ele não pode confundir com esforço. Contar moedas, ler uma
  placa, montar acampamento, pagar a conta, rezar, amarrar o cavalo,
  respirar fundo. "Metade de um bom sistema de testes é a lista do que não
  se rola" — e ela estava com um terço do tamanho da outra metade.

- ~~**O prompt ainda ensinava a IA a pedir teste — e o código obedecia.**~~
  RESOLVIDO na v9.68, e era o maior buraco do projeto, escrito em letras
  grandes no lugar mais visível: uma seção inteira chamada **"ROLAGENS (o
  sistema rola e calcula; VOCÊ PEDE)"**, mais um campo `"rolagem"` no
  contrato de JSON com um parágrafo ensinando a preenchê-lo — dado,
  atributo, motivo, perfil de dificuldade.

  Não era só contradição de texto. Um dado pedido pela IA chega com
  `desafio: null`, e por isso **não passava por nada** do que foi construído
  da v9.59 para cá: sem livro de tentativas, sem dificuldade tirada do
  obstáculo, sem pergunta de oportunidade, sem custo da falha, sem preço em
  pele. Era a régua paralela mais completa que este jogo já teve, e vencia a
  oficial simplesmente por chegar primeiro.

  A varredura achou mais quatro pontas, três delas dormindo:

  - `TESTES_PROMPT` dizia que o jogador PODE pedir teste (a v9.64 acabou
    com isso) e que a IA pode sugerir um. Estava **importado e nunca
    montado** — a contradição não rodava, mas lia como política, e um bloco
    morto que lê como política é pior que nenhum: o próximo acredita nele.
  - `condicoes.js`: "faça o que se faz numa mesa: PEÇA A ROLAGEM".
  - `aflicoes.js`: "NÃO aplique nada: peça a rolagem apropriada".
  - o envelope `[HABILIDADES]`: "se incerto, peça a rolagem apropriada" —
    esta rodava, em todo turno de habilidade não ofensiva.

  **O que entrou no lugar** mantém para a IA o que é dela e tira o que não
  é. Ela continua declarando O QUE O MUNDO FAZ — "a teia desaba", "o degrau
  cede", "a taça estava envenenada" —, que é ficção; perde escolher qual
  salvaguarda, qual dificuldade, quanto dói e se pegou. O campo `perigo`
  substituiu `rolagem` no contrato, e `sanearResposta` força `rolagem: null`
  para que nem uma resposta antiga reabra o canal.

- ~~**A vantagem racial só valia no caminho que ia ser fechado.**~~
  RESOLVIDO na v9.68, e foi o achado colateral da varredura. O Elfo tem
  vantagem em Percepção e o Meio-elfo em Presença — frase que está na tela
  de criação desde a primeira versão. O código que a aplicava morava no
  caminho da rolagem pedida pela IA, com um comentário que dizia, com razão
  **para a época**, "este é o único ponto por onde todo teste do Mestre
  passa".

  Só que desde a v9.59 o teste normal deixou de passar por lá: ele nasce da
  ação declarada. Ou seja, o traço parou de valer para os testes que de fato
  acontecem, e ninguém tinha como notar — o dado simplesmente saía um pouco
  pior. Mudou de casa para `rolarDesafio`, com a regra da mesa: vantagem e
  desvantagem se anulam.

- ~~**"Vou na elfa bonita e digo: você caiu do céu?" não era nada.**~~
  RESOLVIDO na v9.69. A frase caía em `livre` — "digo" está na lista do que
  não se rola — e virava ficção pura: sem dado, sem torcida, sem prêmio nem
  consequência. É o momento mais comum de uma mesa e o sistema não tinha
  nada para ele.

  **O gatilho não pode ser a cantada.** Nenhum regex separa com segurança um
  galanteio de conversa fiada pelo CONTEÚDO, e tentar isso faria o sistema
  pedir dado a cada frase — que é justamente o que cansa. O gatilho é a
  ESTRUTURA: aproximar-se de alguém e dizer uma fala DIRIGIDA a essa pessoa.
  Quem escreve a própria fala está performando, e performar diante de um
  estranho é Presença.

  E o freio contra o teste a cada turno não é o regex: é o **livro de
  tentativas**. A chave social é pessoa + tamanho do pedido, então cada
  pessoa dá UMA primeira impressão; insistir ouve "você já tentou isso".

  A escada do pedido ganhou o degrau que faltava, `simpatia` (12) — o único
  em que não se pede coisa nenhuma, e sim que a pessoa queira ficar. Custa
  mais que arrancar uma fofoca porque fofoca é sobre o mundo e isto é sobre
  você.

  **Achado no caminho:** "dou uma cantada nela" contava como **ouro na
  mesa**. A alavanca do suborno aceitava o verbo `dou` solto, e a
  dificuldade caía três pontos por um dinheiro que ninguém ofereceu — só
  apareceu quando o degrau novo trouxe frases com "dou". E o `\b` que mata
  radical voltou pela terceira vez na mesma sessão: `elogi\b` não casa
  "elogio", `me aproximo d\b` não casa "dela".

- ~~**O mundo só andava para quem digitava.**~~ RESOLVIDO na v9.69, e foi
  a resposta à pergunta "todo turno passa mesmo pelo mestre?".

  O despachante governa todo turno que começa como TEXTO — isso se
  confirmou. Mas o RABO do turno (o relógio do mundo, o gatilho `turno_mundo`
  e a iniciativa) morava dentro do `agirInterno`, e por isso valia só para
  ele. Quem jogava pelos BOTÕES — andava pelo mapa, viajava pela planta,
  acampava — tinha um mundo congelado: os relógios de ameaça não andavam, o
  prazo da missão não corria, a nêmese não se mexia. O calendário virava, o
  mundo não. Um jogador podia atravessar meio continente clicando e chegar
  num mundo idêntico ao que deixou.

  É a forma de sempre — a regra que mora num só de dois caminhos — desta
  vez no lugar mais caro: não numa regra, no relógio. Virou
  `marcarTurnoDoMundo()`, e quem constitui um turno a chama, venha do
  teclado ou de um botão.

  **E os dois contadores não eram salvos.** Voltavam a zero a cada sessão:
  o gatilho dos relógios é a cada DOIS turnos e a iniciativa precisa de
  SEIS, então quem joga em sessões curtas tinha um mundo que nunca tomava a
  frente — e a causa não estava em regra nenhuma, estava num contador que
  ninguém guardava.

- **O combate ainda é chamado pela IA.** `mudancas.combate_iniciar` é dela;
  o sistema completa as fichas dos inimigos pelo bestiário, mas a DECISÃO
  de que a luta começa é da narração. É o último item da lista "o mestre
  chama os combates" que continua aberto, e ele tem duas metades bem
  diferentes:

  - **o herói ataca primeiro** — o sistema PODE ler isso, e hoje não lê:
    "ataco o bandido com a espada" não casa nada no catálogo. É a metade
    viável, e a que dá ao sistema a decisão mais decisiva do jogo;
  - **o mundo ataca primeiro** — a emboscada, o guarda que perde a
    paciência. Isso é ficção, e a ficção é dela; a forma certa é a mesma do
    campo `perigo`: ela declara a hostilidade e o sistema monta o encontro,
    escolhe a ameaça compatível e abre a luta.

- ~~**A narração prometia e a ficha não entregava.**~~ RESOLVIDO na v9.70,
  em `cobranca.js`. O Mestre tem um canal para declarar o que mudou —
  `mudancas.moedas`, `adicionar_itens` — e o sistema o aplica direitinho.
  Mas ele é um narrador: às vezes escreve a cena inteira, com o brilho das
  moedas na palma da mão, e esquece de preencher o campo. O jogador LÊ que
  ganhou cem moedas, olha a bolsa e continua com as mesmas.

  Não é bug de código: é a distância entre a ficção e a ficha, e ela sempre
  aparece do lado que ninguém confere. A partir dela, todo prêmio precisa
  ser verificado à mão — e essa dúvida come o jogo por dentro.

  O sistema passou a LER a narração, subtrair o que já foi declarado e
  creditar a diferença. No caso comum, em que o campo veio certo, a
  subtração dá zero e o arquivo inteiro não faz nada.

  **As travas importam mais que a detecção**, e a razão está escrita três
  parágrafos acima no próprio App: já houve aqui um cão de guarda que lia
  CONDIÇÕES na narração, e "o ar quente ainda preso na garganta" virou dois
  turnos de Agarrado. Por isso só entram quantia e item de catálogo, com
  verbo de aquisição e o herói como sujeito; qualquer negação na frase
  descarta a frase inteira; e há teto por turno.

  **O achado desta versão, e é grave: o dado manda mais que a narração.** Na
  primeira prova, o teste de furtividade FALHOU, o Mestre narrou o roubo
  dando certo assim mesmo, e o sistema creditou as cem moedas. A peça criada
  para a ficha obedecer à ficção tinha acabado de fazer a ficção passar por
  cima do dado — a inversão exata do que este projeto inteiro construiu. O
  envelope do teste já proibia entregar qualquer coisa na falha, mas uma
  regra que depende de o outro lado obedecer não é regra, é pedido.

  Agora a cobrança pergunta ao resultado antes de creditar, e a régua é uma
  só: **o que não é teste não rende nada.** Falha, tentativa já feita, ação
  impossível, mundo dizendo que não havia o que testar — em todas, o que a
  narração prometer fica fora da bolsa e o Mestre recebe a recusa por
  escrito. Medido na tela: dado 17 vs 15 creditou 100 moedas e a poção; a
  repetição sem dado creditou zero.

- ~~**A tela mostrava a contabilidade do motor.**~~ RESOLVIDO na v9.70.
  `🔮 "há saída pelos fundos?" — no fio (58%), rolou 93: Não, e ainda por
  cima… +8 cidade tem de tudo`: o jogador perguntou uma coisa ao mundo e
  recebeu de volta uma auditoria. A chance, a faixa, o número e os fatores
  não são jogáveis — não mudam o que ele pode fazer, não são escolha e não
  são informação do mundo. Ficou a pergunta e a resposta.

  E as perguntas que o SISTEMA faz a si mesmo saíram da conversa inteiras.
  Além do ruído, elas VAZAVAM: "há algo para escutar? — Sim" aparecia antes
  do teste, e "há vigia? — Sim" entregava o vigia antes da tentativa. O
  motor estava contando o final do filme para justificar o próprio trabalho.

  A régua que separa os dois casos: o dado do TESTE continua na tela
  inteiro, porque ali o jogador torce pelo número e ver o número é metade da
  graça. No oráculo ele quer saber do mundo, e o número é contabilidade.

## A ordem do turno

- ~~**A ordem do turno era o layout de um arquivo.**~~ RESOLVIDO em duas
  etapas, v9.61 e v9.63, em `turno.js`.

  Três bugs de uma única semana eram o mesmo bug: o resolver de destinos
  comendo "vou até o Javali Cambaleante", o botão do mapa chamando o
  movimento por fora da cadeia, e o painel de Ações chamando a rolagem por
  fora da adjudicação. Nenhum deles aparece em teste de módulo, porque o
  defeito não estava em módulo nenhum — estava na **ordem**, que não era um
  objeto, era a posição das linhas dentro do `agirInterno`.

  A **v9.61** fez a ordem virar dado: uma tabela de portas, cada uma com a
  pergunta que a abre e a razão escrita de estar onde está.

  Só que a tabela ainda não mandava em ninguém. Apenas o movimento
  consultava a decisão; comando, conjuração, ação declarada e oráculo
  continuavam a rodar por posição, **ganhando ou perdendo**. A tabela
  descrevia um turno *parecido* com o que o programa fazia, e "parecido" é
  onde moram os bugs de ordem. A discordância já era visível: com uma
  escolha pendente na tela, a tabela manda a **resposta** ganhar da
  **conjuração**, e o arquivo fazia o contrário — uma resposta que citasse o
  nome de uma magia lançaria a magia em vez de responder à pergunta.

  A **v9.63** fechou isso. Cada porta ganhou três campos — `fase` (paga o
  próprio tempo ou paga os 45 minutos do turno), `faz` (o executor) e
  `seRecusar` (para onde vai o turno quando a porta diz "não era comigo") —
  e `agirInterno` virou um laço sobre a cascata. Nada mais executa por
  estar escrito antes.

  O campo que não podia ter valor único é o `seRecusar`, e a razão é o
  Javali: `temAlvoLocal` abre a porta do desafio para **qualquer** frase que
  cite um lugar daqui, e a esmagadora maioria delas não é desafio nenhum —
  é só andar. Se a recusa caísse na porta de baixo, a estrada recolheria o
  que o desafio soltou e o bug voltava inteiro. Ela pula para o oráculo,
  porque a única outra coisa que uma ação declarada aqui ainda pode ser é
  uma pergunta sobre **aqui**.

  E o `faz` existe porque seis portas de viagem apontam para o mesmo
  `interceptarMovimento`: sem ele, uma porta que recusa faria o turno
  chamar o mesmo código duas vezes, e a segunda chamada mexe nos sinais de
  viagem depois de ele já ter decidido não viajar.

- ~~**Quem perguntava e quem respondia não liam a mesma coisa.**~~ RESOLVIDO
  na v9.63, e foi um achado da própria refatoração. "Esta frase é uma ação
  que o sistema adjudica?" tinha **duas** respostas: uma em `adjudicarAcao`,
  para agir, outra em `sinaisDoTurno`, para decidir de quem era o turno. E
  divergiam em dois pontos — só o adjudicador conhecia a segunda chance de
  `detectarPedidoDeTeste` (é ela que transforma "peço um teste de Percepção"
  num desafio de verdade), e só ele aceitava veredicto "livre" **com**
  chave. Enquanto o adjudicador rodava em todo turno a divergência não
  aparecia; ela ia estrear no instante em que ele passasse a rodar só quando
  a tabela mandasse. Os dois lados passaram a chamar `veredictoDaAcao`.

## A escola do mestre — v9.71

O despachante já mandava no turno inteiro, mas julgava cada turno
**sozinho**: sem memória do que a mesa vinha vivendo. É essa a diferença
entre um mestre de primeira sessão e um mestre rodado, e ela não é
imaginação — é **tempo**. O novato pede dado para tudo e cansa; deixa a
cena morrer sem perceber que morreu; planta um nome no dia 3 e nunca mais
o usa; mata com uma armadilha que ninguém teve como ver; dá o sucesso e
nada além dele.

`mestria.js` é a memória curta (dez turnos, quatro booleanos e um pilar
cada) e o repertório que se aplica sobre ela. **Ele não inventa nada** —
escolhe entre o que já existe e diz quando. E não sobe uma linha ao prompt
por turno: fala só por envelope, então só custa token no turno em que
decide alguma coisa.

- **A TEMPERATURA.** Quatro estados, e cada um manda em duas coisas: se o
  mestre pode dispensar um dado sem graça e se o mundo pode tomar a
  palavra. *Brasa* (luta ou perigo em curso) e *quente* (três dados nos
  últimos cinco) calam o mundo — interromper ali é roubar a cena mais
  quente que o jogador tem. *Fria* (cinco turnos sem dado, sem perigo e
  sem nada ganho) é a cena morta que ninguém percebeu.

- **O GOVERNADOR DO DADO.** "Não dá para fazer um teste a cada turno,
  chegaria um momento que ficaria cansativo." A saída errada seria pedir
  menos dado no geral — aí o jogo perde o que o faz jogo. Pede-se menos
  dado **sem aposta**, e nunca menos dado com aposta.

  A primeira versão desta régua estava errada e é o registro que importa:
  ela inferia "inofensivo" da **ausência** de uma linha em
  `CUSTO_DE_FALHAR`, e assim falsificar um documento e acalmar um bicho
  entravam na lista de dispensáveis só porque ninguém tinha escrito ainda
  o que a falha deles custa. Lacuna numa tabela virando permissão em
  outra. Agora a marca é positiva e mora no catálogo (`dispensavel`), só
  onde falhar significa **apenas não saber** — hoje quatro dos trinta e
  um. O que ninguém marcou, rola.

- **O FIO DA MEMÓRIA.** A iniciativa do mundo só puxava fios de pressão,
  todos olhando para a frente. Falta o que olha para trás: a promessa que
  o jogador fez, o nome que ele deixou para trás, a cicatriz, o lugar que
  descobriu e não voltou a ver, o inimigo que matou. Nada disso é
  inventado — está tudo registrado; o mestre só escolhe qual puxar quando
  a mesa esfria, e não repete o mesmo fio duas vezes seguidas.

- **O BRILHO.** 12 contra 11 e 25 contra 11 davam exatamente a mesma
  coisa. A falha tinha seis texturas e o sucesso tinha uma — um dado em
  que só a metade de baixo tem relevo é meio dado. Agora o 20 natural e a
  margem de dez pontos cobram uma coisa a mais do narrador, **em ficção**:
  informação além da pergunta, um detalhe que abre caminho, o feito visto
  por quem importa. Nunca em ouro — moeda e item são do sistema, e foi
  isso que a cobrança da v9.70 fechou.

- **A MORDIDA SEGURADA.** O perigo que pode derrubar se anuncia. Não por
  bondade: a morte que o jogador não teve como ver não é derrota, é
  sorteio. Quando o golpe levaria metade do que resta e a fonte nunca
  apareceu antes, o sistema segura e manda a cena recuar um instante — uma
  vez por fonte, porque da segunda em diante o jogador já sabe onde pisou.

- **~~O fio "o prazo aperta" nunca puxou uma vez.~~** RESOLVIDO na v9.71,
  e achado dentro da prova em jogo desta versão. A iniciativa do mundo
  procurava `m.ativa` e a missão guarda `status: "ativa"`. O predicado
  nunca foi verdadeiro: o terceiro fio mais pesado da tabela — peso 4, o
  prazo correndo e alguém cobrando — não saiu **uma única vez** desde que
  a v9.61 o escreveu. Regra escrita sem código atrás na forma mais
  silenciosa que ela tem: a que não quebra nada, só não acontece.

### As duas metades que faltavam — v9.72

- **~~O holofote não via o pilar social.~~** RESOLVIDO. O pilar saía só do
  desafio que rolou, então servia ao turno com dado e deixava de fora o
  que mais acontece: a conversa. Um turno inteiro de taverna entrava como
  `null`, e uma campanha feita de taverna podia acusar fome de "a gente" —
  o holofote apontando para a luz acesa.

  O sinal agora é o **texto do jogador**, e ele é honesto por um motivo: o
  pilar não pergunta o que existe na cena, pergunta que tipo de jogo o
  jogador acabou de jogar. Quem escreve "pergunto ao ferreiro" jogou o
  pilar social, esteja o ferreiro registrado no elenco ou não — e é essa a
  diferença para `pessoaNaFrente`, que depende do cadastro e devolve nada
  numa cidade cujos nomes o Mestre ainda não registrou. A conversa ganha
  do deslocamento de propósito: *"vou até a elfa e digo que ela caiu do
  céu"* é uma cena social com um passo de caminhada dentro, não o
  contrário. O botão da planta marca o próprio pilar, porque ali não há
  texto de jogador para ler.

  O falso positivo aqui é barato: o pilar só sugere um lado ao envelope do
  fio, e o envelope já manda não forçar se não couber.

- **~~`tentativaFalha` estava sempre vazio.~~** RESOLVIDO. O fio mais forte
  dos seis nasceu sem fonte: o livro de tentativas sabia que o herói tinha
  falhado e **não sabia dizer em quê**, porque a chave é normalizada
  (minúscula, sem acento) e não há texto legível nela.

  O livro agora guarda também como a coisa se escreve, e `fracassoEsquecido`
  lê de volta com três filtros — só falha, nada de lugar já esgotado, e
  nada de hoje (o que aconteceu neste mesmo dia ainda está na cena; trazê-lo
  de volta como memória é a cara de um sistema mal ajustado). Vence o mais
  antigo, que é o mais esquecido. E insistir **refresca a data**: quem
  tentou ontem não abandonou nada, e sai da fila do esquecimento.

  O texto é o do primeiro registro — reescrevê-lo a cada insistência
  trocaria a lembrança pela última tentativa. Save antigo, sem rótulo, não
  vira frase e não quebra nada.

## O primeiro golpe — v9.73

"O mestre chama os combates." O combate tem duas metades e só uma é
ownable: o mundo atacando primeiro é ficção, e ficção é da IA. Quando o
JOGADOR declara violência, não há o que decidir — ele declarou.

E não era assim. "Ataco o bandido" não casava nada no catálogo, caía em
`cena`, e o que acontecia dependia do humor da cena que a IA tinha na
cabeça: às vezes o painel abria, às vezes o golpe virava um empurrão
narrado, às vezes o alvo "recuava assustado". O jogador aprende rápido
que atacar é sugerir.

`agressao.js` lê a declaração e devolve um de três desfechos. **Os dois
que NÃO abrem luta são o que faz a peça ser segura de existir:**

1. **Alvo no registro e na cena** → o sistema monta a ficha dele pelo
   PAPEL (`PESO_DO_PAPEL`: quem vive de armas devolve o golpe melhor que
   quem vive de vender cerveja), abre o combate e manda a IA narrar só a
   investida — sem decidir se acertou, sem fazer o alvo recuar, e sem
   desfazer o que o jogador fez.
2. **Alvo é do meu grupo** → não abre nada e não vai ao Mestre. Virar
   companheiro em inimigo mexe em ficha, vínculo e elenco.
3. **Ninguém com esse nome aqui** → também não abre. Inventar o alvo
   seria deixar o jogador ESCREVER o inimigo em vez de encontrá-lo
   ("ataco o dragão ancião" no nível 1), e com isso o orçamento de
   encontro, o bestiário e o mapa deixariam de significar qualquer coisa.
   O turno vai com uma ordem de duas saídas: abra o combate agora, ou
   diga que não há quem atacar. O que ela não pode mais é narrar a briga
   sem painel aberto.

E o alvo NUNCA é escolhido por eliminação, nem com uma pessoa só na
cena — que é o contrário do que o teste social faz, e de propósito:
errar o alvo lá custa uma linha, errar aqui abre uma luta contra quem o
jogador não quis tocar.

- **~~A masmorra lutava sem tabuleiro e sem iniciativa.~~** RESOLVIDO na
  v9.73, e é o achado desta versão. Havia TRÊS portas para abrir combate
  com três níveis de equipamento: a da IA (completa), a do modo criativo
  (`equiparCombate`, quase completa) e a da masmorra —
  `combateRef.current = { inimigos }` e mais nada, desde a v7.0. O bloco
  que monta terreno, iniciativa, orçamento e traços de abertura morava
  dentro do `aplicarResposta`, atrás de `if (houveIniciar)`, isto é,
  atrás de a IA ter mandado `combate_iniciar`.

  Ou seja: o lugar onde o jogador mais luta era o pior equipado. Agora
  existe `abrirCombate`, a porta única, e a masmorra e a IA passam por
  ela. Medido em jogo: a emboscada da cripta abriu com terreno, tamanhos,
  ordem de iniciativa e selo de encontro — nenhum dos quatro existia ali.

- **~~O fio "alguém desta cidade avança a própria vontade" nunca puxou.~~**
  RESOLVIDO na v9.73. Irmão do `m.ativa` da v9.71 e achado na mesma
  varredura: a linha lia `npcs[cidadeAtual].gente`, e o registro de
  pessoas é indexado por NOME — `elencoDaCena` sempre soube disso. O
  acesso devolvia `undefined`, o `.gente` devolvia `[]`, e o fio de peso
  3 ficou mudo. **Duas das seis vozes do mundo estavam caladas**, e
  nenhuma das duas quebrava nada: só não acontecia.

### O que fica aberto aqui

- **O modo criativo ainda tem porta própria.** `/combate` e `/encontro`
  usam `processarCombate` + `equiparCombate` e ficam sem os traços de
  abertura e sem o custo do dia. É ferramenta de teste, não jogo, e por
  isso não entrou nesta leva — mas são três portas de novo, e esta casa
  já sabe onde isso termina.

- **A metade que continua sendo da IA.** O mundo atacando primeiro segue
  chegando por `combate_iniciar`. A forma certa é a do canal `perigo`:
  ela declara a hostilidade, o sistema monta o encontro com uma ameaça
  compatível e abre a luta. Falta o passo do meio — traduzir "os bandidos
  saltam do mato" em uma lista de inimigos com orçamento conferido.

- **O tamanho do Rato Gigante.** A emboscada da prova trouxe "Rato
  Gigante é enorme (3×3 quadrados)". Ou a tabela de tamanhos lê o
  "Gigante" do nome, ou o padrão está errado — de todo jeito, um rato não
  ocupa nove quadrados.

## A outra metade da briga — v9.74

A v9.73 deu ao sistema a metade que era dele. Esta é a outra ponta, e a
divisão é a mesma da casa inteira:

**ELA diz que há hostilidade e de que tipo** — isso é cena, é dela, e o
sistema não inventa nada disso. **O SISTEMA decide o encontro** — quantos
são e se aquilo cabe no herói que está na frente, porque isso é conta.

Antes disto ela mandava `combate_iniciar` com a lista inteira montada por
conta própria e o sistema só carimbava um selo depois do fato consumado.
O selo DESCREVIA; não decidia. Um narrador com o dia inspirado punha seis
ogros contra um herói de nível 2, e o sistema anunciava educadamente que
aquilo ia matar o jogador.

`emboscada.js` lê a investida no canal `perigo` — o mesmo por onde já
entram as armadilhas e os elementos — e devolve um de três desfechos:

1. **Encontro montado.** A criatura vem do BESTIÁRIO, a quantidade vem da
   frase, e o teto vem do orçamento do herói. Seis ogros contra um nível 1
   viram dois, e o envelope diz por quê: "6 contra mim não seria um
   encontro difícil, seria um acidente. Narre o número que o sistema pôs
   — quem não veio, não veio."

2. **Desproporcional.** Aparar a quantidade resolve seis ogros; não
   resolve UM dragão ancião. Um é um, passa por qualquer teto de
   contagem, e continua sendo a morte certa. O sistema não sabe encolher
   um dragão sem inventar um dragão menor, então recusa e devolve duas
   saídas — e a primeira é a boa: **mantenha a ameaça, mas longe.**
   Ameaça vista de perto e não enfrentada é das melhores coisas que uma
   cena tem; o que ela não pode é alcançar o herói agora.

3. **Sem ficha.** Criatura fora do bestiário: o sistema não sabe quantos
   PV tem uma "Aberração do Sétimo Selo" e não inventa. Duas saídas de
   novo — declare `combate_iniciar` com algo do catálogo, ou deixe claro
   que aquilo não me alcança neste turno.

A régua da detecção é o **VERBO, não o substantivo**: "há bandidos na
estrada" é cenário, "os bandidos saltam do mato" é uma investida. E ficam
de fora a emboscada lembrada, a contada por terceiros e a condicional —
o aviso de que algo PODERIA atacar é tensão, e virar luta a partir dele
rouba do jogador a decisão de recuar.

- **~~Todo "X Gigante" era Enorme.~~** RESOLVIDO na v9.74. Havia cinco
  listas de tamanho testadas do maior para o menor, e "gigante" morava na
  dos Enormes porque o bestiário tem uma criatura chamada Gigante. Só que
  quase nunca é a espécie: é ADJETIVO. **Rato Gigante ocupava nove
  quadrados** e alcançava três metros parado. E "aranha gigante" e
  "javali gigante" estavam escritos na lista dos Grandes sem nunca serem
  alcançados — duas linhas de tabela que existiam e não faziam nada.

  A regra nova é a do português: a primeira palavra é a espécie, o resto
  qualifica. Rato é pequeno, "gigante" empurra um degrau, Rato Gigante é
  médio. E as duas pontas da mesma espécie deixam de ter o mesmo tamanho:
  Dragão Jovem é grande, Dragão é enorme, Dragão Ancião é imenso.

- **~~O modo criativo tinha porta própria.~~** RESOLVIDO. `/combate` e
  `/encontro` passam por `abrirCombate` como os outros dois.

### O que fica aberto aqui

- **O teto é sempre "mortal".** O sistema apara até o degrau mais alto da
  tabela, o que quer dizer que quase toda emboscada montada sai mortal
  para um herói de nível baixo. É defensável — a ficção pediu o número e
  mortal é um degrau legítimo — mas vale medir numa campanha de verdade
  se isso não deixa o jogo mais duro do que a mesa aguenta.

- **`combate_iniciar` continua sem orçamento.** A emboscada pelo canal
  `perigo` é conferida; a lista que a IA manda pelo campo antigo, não. São
  dois caminhos com duas réguas, que é a forma exata do bug que esta casa
  mais repete — mas fechar o campo antigo mexe em masmorra, nêmese e
  eventos globais, e não cabia nesta leva.

## Mestre e prompt

- ~~**O prompt de sistema ainda passa de 75 mil caracteres**~~ RESOLVIDO na
  v9.54 pelo caminho que esta linha previa: mandar por turno só o que a cena
  usa. São dezoito portas em `PORTAS_DA_CENA`, cada uma com a pergunta que a
  abre e o motivo escrito ao lado.

  A régua para gatear um bloco tem duas perguntas, e as duas precisam de
  "sim": (1) ele fala de uma situação que ou está acontecendo ou não está?
  (2) o sistema SABE dizer se ela está acontecendo, sem adivinhar? O oráculo
  falha na segunda — não dá para saber se o jogador vai fazer uma pergunta
  fechada — e por isso ficou. **Na dúvida, o bloco fica**: uma regra ausente
  custa um turno ruim, e um turno ruim custa mais do que os quinhentos
  caracteres que ela pesava.

  Medido: **25% a menos** numa cena de taverna ou de estrada, 15% em combate,
  e o tamanho cheio quando tudo está acontecendo de uma vez. Menos do que o
  terço estimado no plano, e é o número honesto.

  Um efeito colateral que quase virou bug: o prompt era remontado em ONZE
  eventos espalhados e não a cada turno. Com as portas isso deixou de bastar
  — um combate que abrisse depois da última remontagem subiria sem as regras
  de terreno e de economia de ação, e o Mestre inventaria as duas sem
  ninguém saber por quê. Agora ele se refaz antes de cada chamada.

  `teste-prompt.mjs` continua guardando as regras que não podem voltar, e
  `teste-onda5.mjs` guarda quais podem sair e quais nunca saem.

- **Temperatura em 0.85** (v9.45, era 1.1). Escolhida contra a prosa
  quebrada que apareceu em jogo; se ficar previsível demais, `DS_TEMPERATURA`
  ajusta pela Vercel sem redeploy. Falta jogar o suficiente para saber.

## Mundo

- **A planta da cidade é sempre o mesmo desenho.** ABERTO. Relatado jogando,
  17/08/2026: "tem sempre o mesmo desenho, muda apenas o nome das coisas".
  E é verdade — a v9.54 fez a FORMA variar (raio, muralha, ruas, praça,
  água, aperto) a partir da população e do bioma, mas a TOPOLOGIA é uma só:
  praça redonda no centro, uma ou duas ruas retas cruzando no meio, locais
  distribuídos em dois anéis concêntricos, portões onde a rua encontra o
  muro. Trocar os nomes não troca a planta, e o olho reconhece a planta.

  O que falta é variedade de traçado, não de rótulo. Umas linhas de ataque,
  da mais barata para a mais cara:

  - **Traçados alternativos por bioma e origem**: cidade de rio se estica
    ao longo da margem (linear, ponte no meio); cidade de montanha sobe em
    terraços; cidade de estrada é uma rua-mestra com casario dos dois lados;
    porto é meia-lua voltada para a água. A escolha sai da semente + bioma,
    como tudo aqui.
  - **Bairros em vez de anéis**: agrupar locais por afinidade (mercado e
    docas juntos, templo e cemitério juntos, quartel colado ao portão) em
    vez de espalhar por ângulo. Isso já muda a leitura do mapa sozinho.
  - **Ruas irregulares**: as duas retas que se cruzam são o que mais
    denuncia o gerador. Uma malha levemente torta, ou radial, ou em espinha
    de peixe, muda o desenho inteiro com pouca conta.
  - **Acidentes**: o rio que corta, a colina com a cidadela em cima, a
    ruína dentro dos muros, a muralha velha por dentro da nova.

  O critério de pronto é o mesmo dos nomes: gerar algumas centenas de
  plantas e conseguir dizer, olhando, que não são a mesma cidade repintada.

- ~~**"Em três das criações tive os mesmos nomes."**~~ RESOLVIDO na v9.58 em
  `toponimia.js`. Medi antes de mexer: a distribuição do sorteio era uniforme,
  não havia viés. O problema era o TAMANHO do banco — 25 tavernas escritas à
  mão, 5 mercados, 4 forjas, 3 arenas. Um mundo nasce com catorze
  assentamentos e **todos têm mercado**: pela conta do aniversário, a chance
  de dois mercados saírem iguais no mesmo mundo era de praticamente 100%, e
  foi por isso que a "Feira Baixa" apareceu duas vezes na mesma planta.

  A saída não foi embaralhar melhor, foi ter vocabulário: substantivo com
  gênero e número, adjetivo que concorda, complemento já preposicionado, três
  padrões. Dá 9.792 nomes de taverna e ~1.500 por tipo de local, por gênero
  de campanha. **Medido**: a repetição dentro de um mundo caiu de ~100% para
  6,7% em 300 mundos.

  O que isto **não** promete é unicidade — `locaisDaCidade` é chamado uma
  cidade por vez (do painel do mapa inclusive), e uma função determinística
  que precisasse do mundo inteiro para nomear uma forja seria pior que o
  problema. O que se compra é probabilidade.

- ~~**O local citado em cena nunca virava cânone.**~~ RESOLVIDO na v9.58, e
  só apareceu porque os nomes novos o revelaram. Quase todo local agora nasce
  com artigo ("A Taça Negra"), e ninguém escreve em português "a porta de A
  Taça Negra" — escreve "da Taça Negra". A fronteira de palavra em `cita`
  rejeitava o "d" da contração, e o local mencionado nunca era promovido.
  O bug já existia para as tavernas, que sempre tiveram artigo; só não
  aparecia porque os outros tipos não tinham. Agora `cita` tenta também sem
  o artigo.

- ~~**Estágio 2 da geração de mundo: as células do ermo.**~~ RESOLVIDO na
  v9.54 em `celulas.js`. O pergaminho de 100 por 100 virou uma grade de 20
  por 20, e cada célula sabe três coisas: que terreno é, quão longe da gente
  está e o que há nela de notável. Determinística pela semente — a feição do
  quarto dia de estrada é a mesma na volta, e é isso que separa um mundo de
  um gerador de frases.

  Uma decisão que vale registrar: **o bioma da célula não é sorteado**, é
  herdado do assentamento mais próximo. Sortear daria um mundo de retalhos
  (deserto colado em geleira), e um mundo de retalhos é pior do que nenhum,
  porque contradiz o que o jogador vê no mapa.

- ~~**Estágio 3: o eixo extra por molde.**~~ RESOLVIDO na v9.54 dentro do
  estágio 2, que era o lugar onde ele significava alguma coisa. A Torre e o
  Braço Estelar declaram um eixo `z` desde a v9.40 e ele nunca passou de um
  rótulo; agora a célula o carrega e o perigo cresce com a altura, pela
  mesma `fatorDePerigo` que o molde já declarava e que ninguém chamava. Onde
  o molde não tem `z`, nada muda — que era o critério combinado.

## Craft e economia

- ~~**Essência só vem de desmontar.**~~ RESOLVIDO na v9.54. Era um círculo
  fechado: quem não acha equipamento não desmonta, quem não desmonta não
  forja, e quem não forja continua sem achar — o jogador que mais precisava
  da forja era o que menos podia usá-la. A segunda fonte é o que ele já está
  fazendo: matar coisa difícil. Bicho comum e fraco não deixam nada (um bando
  de goblins segue rendendo só moeda); competente deixa 1, elite 3, lendário
  8, e o chefe da masmorra deixa 10 + nível×1,5 — a maior fonte do jogo, e o
  momento em que ele mais quer forjar alguma coisa. A régua: um chefe paga
  sozinho uma forja incomum, e nem o chefe de nível 20 paga uma épica.

- **A bancada não avisa que está pronta.** As receitas ficam atrás de um
  acordeão fechado dentro do inventário; o contador "N prontas" só aparece
  depois de abrir a bolsa e reparar. Colher uma erva na estrada devia
  acender alguma coisa.

## Miudezas

- ~~**A fama chega ao teto cedo e para.**~~ RESOLVIDO na v9.54 com dois
  degraus novos — **Nome de Canção** (85) e **Mito em Vida** (100) —,
  deliberadamente diferentes em NATUREZA e não em grau: virar canção é perder
  o controle da própria história, virar mito é o mundo deixar de acreditar
  que você é gente. O topo ganhou marco próprio no Códex.

- ~~**Duas conquistas diferentes chamadas "Lenda Viva".**~~ RESOLVIDO na
  v9.54: uma era fama 70, a outra conhecer 30 pessoas — mesmo nome e mesmo
  título na tela. A segunda virou "Cidade Inteira".

## O que a sonda passou — e não vira pendência

Registrado para ninguém gastar tempo reconferindo. Medido em v9.52:

- **Companheiros.** Entram com classe e duas habilidades do catálogo, chegam
  ao nível 5 com sete habilidades depois de 10 mil XP, e decidem de verdade
  em combate (200 decisões: 82 ataques, 118 habilidades — não é repetição).
- **Morte do herói.** Em 2.000 quedas a 0 PV: 39% morre, 43% estabiliza, 18%
  volta com o 20 natural. A curva está no lugar.
- **Descanso longo.** Limpa todas as doze condições ruins do catálogo e
  preserva Abençoado e Inspirado. O curto limpa só sangramento, cegueira e
  fogo, que é o desenho.
- **Mercado.** Estoque proporcional ao porte: 3 mercadores e 15 itens numa
  capital, 1 e 5 numa vila, com preço aferido pelo sistema.
- **Fuga do inimigo.** Um lacaio a 1 de 20 PV foge em 51% das rodadas.
- **Ascensão.** Deicídio e relíquia têm três provas cada; a Via da Fé não tem
  prova nenhuma **por desenho** — ali se sobe acumulando fiéis, e é isso que
  a torna "lenta, segura e legítima".
- **Diplomacia.** Os cinco tratados existem e estão ligados ao mapa.
- **Encontros de estrada.** Cinco variedades por bioma, em cinco tipos
  (perigo, achado, cena, viajante, tranquilo) — os oito biomas cobertos.
- **Relógios.** Quatro tipos (ameaça, caçada, oportunidade, obra), três
  tamanhos, gatilho por noite. **Missões**: catálogo de etapas completo com
  conferência automática. **Decretos, correio, reino, oráculo, sintonia,
  vínculos, legado, heroísmo**: catálogos cheios e funções no lugar.
- **Grimório**: 85 magias. **Conquistas**: 67 no catálogo.

## O que ainda não foi jogado de ponta a ponta

A sonda mede os módulos; ela não substitui a partida. Continua sem
verificação **na tela**:

- A masmorra jogada sala a sala pela interface (o painel, o ritmo, a busca).
- O acampamento e as conversas de vínculo.
- Comprar e vender de fato, com moeda saindo do bolso.
- A tela de tombamento do herói.
- Diplomacia e correio exercitados com uma facção real.

## Fora do jogo

- **Geração de imagem.** Adiado desde cedo. Exige `api/imagem.js` com a
  chave em variável de ambiente da Vercel (nunca no cliente) e IndexedDB ou
  URL externa para guardar — a cota do localStorage já está apertada.
