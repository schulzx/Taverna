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

## A última régua dupla do combate — v9.75

- **~~`combate_iniciar` não passava pelo orçamento.~~** RESOLVIDO. A
  emboscada da v9.74 era conferida e a lista antiga não — e é por ela que
  entra a maior parte das lutas do jogo: a nêmese, os eventos globais,
  tudo o que a IA abre por conta própria. Duas réguas para a mesma
  pergunta, e desta vez escrita de propósito, porque na v9.74 não coube.

  **A conferência aqui é mais branda que a da emboscada, e a diferença
  tem motivo.** Na emboscada o sistema constrói o encontro do zero e pode
  escolher. Aqui a cena já existe: pode ser o clímax de um arco, o
  confronto que a campanha inteira preparou, ou uma luta que o jogo QUER
  que o herói perca e fuja. Recusar seria o sistema apagando a história
  que o motor dele mesmo mandou construir.

  Então ele faz duas coisas e só duas:

  1. **Apara a multidão**, cortando pelo fim da lista — que é onde ficam
     as cópias ("Bandido 5", "Bandido 6"). Nunca remove um chefe, porque
     chefe é um, e nunca corta até zero. Medido: oito bandidos contra um
     nível 1 viram dois.
  2. **Não recusa o grande demais — avisa.** Um só inimigo acima do teto
     passa inteiro, porque é assim que se faz uma cena de fuga. O que
     muda é o envelope: o Mestre é obrigado a deixar a saída existir e
     visível desde a primeira frase, em vez de descobrir sozinho, três
     rodadas depois, que matou o jogador.

## A voz do narrador — v9.75

- **A temperatura sobe de 0.85 para 1.0**, a pedido de quem joga: "o
  narrador ficou muito contido". O relato é o outro lado da mesma moeda
  da v9.45, que DESCEU de 1.1 para 0.85 porque a prosa saía quebrada
  ("o Arco tinha fome; a laje esta"). As duas coisas são verdade ao mesmo
  tempo, e a janela entre "contido" e "agramatical" é estreita neste
  jogo. 1.0 fica dentro dela por pouco — meio degrau abaixo do que
  quebrou —, e o prompt encolheu bastante desde então (58,7k na cena
  comum contra os 90k daquela época), o que dá folga.

  **Se voltar a sair prosa quebrada, o conserto não pede redeploy:**
  `DS_TEMPERATURA=0.9` na Vercel vale no pedido seguinte.

- **A repetição ganhou alavanca própria.** "Fica sempre repetindo coisas"
  é a outra metade da queixa, e temperatura é o remédio errado para ela:
  temperatura mexe no quanto o modelo ARRISCA, não no quanto ele se
  repete. Quem mexe nisso é a penalidade de frequência, agora em 0.3
  (`DS_PENALIDADE`). É ela que desmancha o tique de reabrir toda cena com
  o mesmo cheiro de cevada.

  0.3 é conservador de propósito: penalidade alta em português estraga a
  concordância — o modelo foge das preposições e dos artigos que já
  gastou —, e este canal devolve JSON, que é o mesmo risco que derrubou a
  temperatura na v9.45. A penalidade de PRESENÇA fica em zero: ela empurra
  o modelo para assuntos novos, e assunto novo é justamente o que ele não
  pode inventar aqui.

- **O reserva obedecia a outra régua.** O Gemini nunca teve temperatura
  configurada — rodava no padrão da casa do Google —, então trocar de
  provedor trocava o tom do narrador sem que nada no jogo tivesse mudado.
  Agora os dois leem as mesmas variáveis.

## O mestre confere a ficha — v9.76

- **~~"Uso invisibilidade" funcionava com um herói nível 1 sem
  invisibilidade.~~** RESOLVIDO, e é o relato mais grave que este projeto
  recebeu em muitas versões.

  O sistema tinha catálogo de magias, árvore de habilidades por classe e
  a ficha do herói na mão — e não consultava nenhum dos três antes de o
  turno virar ficção. "Uso invisibilidade" não casava porta NENHUMA do
  despachante: não é comando, não é magia da ficha (justamente por não
  estar nela), não é desafio, não é pergunta ao mundo. Caía em `cena`, e a
  IA narrava o que foi pedido — porque narrar o que foi pedido é o
  trabalho dela.

  **A única coisa que separava o jogador de qualquer poder do jogo era
  escrever o nome dele.** O grimório, a árvore de talentos, os pontos de
  habilidade, o custo em PM e os vinte níveis de progressão viravam
  decoração: tudo o que eles gerenciam podia ser obtido de graça
  digitando uma frase.

  `poderes.js` fecha as DUAS formas da mentira:

  1. **O poder nomeado.** O nome é procurado no catálogo (261 poderes,
     magias mais a árvore inteira das classes). Existe no jogo e não está
     na ficha → o turno é recusado e nem chega ao Mestre.
  2. **O estado reclamado.** "Enquanto estou invisível, roubo a carta" não
     nomeia poder nenhum — afirma um estado. A pergunta aqui não é "tem a
     magia?", é "está assim AGORA?", e quem responde é a lista de efeitos
     ativos. Ter a magia guardada não é estar invisível.

  **As travas são metade do arquivo.** Só se recusa o que o catálogo
  conhece: "uso a corda", "uso a chave", "uso o mapa" não são poderes e o
  sistema não opina. E as palavras comuns ficam de fora — a árvore tem
  habilidades chamadas "Muralha", "Investida", "Escudo", e "uso a muralha
  para me esconder" é tática, não é reivindicar um talento de Guerreiro.
  As rubricas da árvore (classe, subclasse, especialização) também saem:
  ninguém "usa Bárbaro".

- **~~O turno morria dentro do resolver de destinos.~~** RESOLVIDO. A
  porta do destino imprimia "Não encontrei X no que você conhece do
  mundo" e devolvia `true` — o turno acabava ali e nada ia ao Mestre.

  `querPartir` é um teste de VERBO ("vou", "sigo", "volto"), então
  qualquer frase que carregue um deles por acidente caía no resolver de
  CIDADES, não achava cidade nenhuma com aquele nome e morria. O jogador
  escrevia uma ação e recebia um erro de mapa. Agora a porta RECUSA em
  vez de engolir, e a razão original — o Mestre não pode inventar o
  destino — passa a ser garantida por envelope, não por silêncio.

- **~~"Vou até o templo" não achava o templo.~~** RESOLVIDO. A busca era
  só por NOME, e os nomes vêm da toponímia: o templo de uma cidade se
  chama "A Basílica da Garça" e o de outra "Ermida do Vau". Ninguém
  decora isso, e ninguém deveria — o jogador diz o que a coisa É.

  E a primeira versão do conserto ainda falhou em jogo, pelo motivo que
  vale registrar: **uma palavra aponta para mais de um tipo.** O templo
  DENTRO da cidade e a capela do cinturão de FORA são tipos diferentes no
  gerador e a mesma coisa para quem escreve "vou à igreja". A cidade da
  prova não tinha templo dentro — tinha "o santuário à beira do caminho"
  fora —, e o pedido não achava nada. A função estava certa e a tabela
  estava curta. Agora dentro ganha de fora, e quando não há dentro, o
  cinturão atende: medido em jogo, "vou até o templo" leva a 26 minutos
  de caminhada até o santuário.

- **~~O jogador via os métodos do mestre.~~** RESOLVIDO. Saíram da tela o
  fio da memória ("🧵 notícia chega do lugar que você descobriu e não
  voltou a ver"), a iniciativa do mundo ("🌍 O mundo se mexe") e o corte
  do encontro ("⚖ 8 eram demais para este patamar").

  As três eram a mesma coisa: o sistema anunciando o que ia fazer logo
  antes de a IA fazê-lo — duas vozes contando o mesmo, e a primeira
  estragando a segunda. Pior no fio: o jogador lia o RÓTULO do fio e só
  depois lia a cena que o encena. O que fica na tela continua sendo o que
  é gameplay — o dado, o que entrou na bolsa, onde o herói está.

## O ofício da cena — v9.77

"Melhorou um pouco, mas não sinto que o mestre está mestrando" veio junto
com um pedido de treinar também **o lado que fica com a IA**. A v9.75
atacou o mecanismo — temperatura e penalidade de frequência —, e isso é
metade: temperatura muda o quanto o modelo arrisca, não o quanto ele sabe
narrar.

O prompt já tinha uma seção de ritmo, mas ela era toda de nível de
CAMPANHA: plot twists preparados, respeitar a agenda do jogador, não
reciclar o inimigo derrotado. Nada sobre a frase e a cena, que é onde
moram as duas queixas.

Cinco regras, e cada uma ataca um defeito com nome:

- **Abra diferente a cada vez** — um som antes da imagem, alguém já
  falando, um movimento, um cheiro, um objeto fora do lugar, ninguém. É
  o ataque direto ao "fica sempre repetindo", junto com a proibição de
  reabrir um lugar com a mesma frase de ambiente de antes.
- **Um detalhe concreto vale três adjetivos** — não "uma bebida forte",
  "aguardente de centeio". É o ataque ao "contido": prosa vaga soa
  cautelosa porque não se compromete com nada.
- **Quem está em cena quer alguma coisa**, e mostra na primeira fala.
  Ninguém está ali só para responder ao herói.
- **Não narre o que eu sinto nem o que eu decido.** "Você sente um
  calafrio", "você percebe que é perigoso" — é o erro mais comum de
  mestre de IA e o que mais faz a narração soar como resumo.
- **Corte antes de explicar.** Termine na imagem, não no que ela
  significa.

**E o bloco entrou PAGO**, sem crescer o orçamento — as duas
contradições que ele custou estavam no prompt havia versões:

- **~~O prompt mandava narrar a viagem inteira.~~** "NUNCA resolva
  grandes deslocamentos num pulo. Descreva a jornada com etapas,
  bifurcações, encontros" — e trinta linhas abaixo, no bloco de sinais,
  "viagem:<destino> … NÃO narre a viagem inteira, só a partida". Duas
  ordens opostas sobre a mesma coisa, e a primeira descrevia um sistema
  que deixou de existir na v9.56, quando a viagem virou trecho, clima e
  encontro por código.
- **~~E mandava oferecer alternativas prontas.~~** "Apresente ganchos
  concretos: 'a estrada leva três dias; partimos ao amanhecer ou há algo
  a resolver antes?'" — o exemplo É uma pergunta com duas alternativas
  prontas, e a linha seguinte proíbe exatamente isso ("NUNCA ofereça
  opções … nem pergunte 'o que você faz?' com alternativas prontas").

Também compactado o bloco de DIVERSIDADE VIVA sem tirar nenhuma das
exigências dele — só o rodeio.

## Ter não é poder usar — v9.78

A v9.76 fechou "não tenho". Faltavam os dois degraus seguintes, e os dois
são tão comuns quanto o primeiro.

- **~~TER a habilidade e não ter com que pagá-la.~~** RESOLVIDO. O herói
  sabe a magia, escreve o nome, e o sistema deixava passar porque o nome
  está na ficha — sem olhar os PM nem a recarga.

  O painel de habilidades sempre soube disso: desenha a magia apagada
  quando falta mana e mostra o contador da recarga. Só que **o painel é um
  caminho e o teclado é outro**, e toda regra que mora num só de dois vira
  bug — quem clicava obedecia à economia, quem digitava o mesmo nome não
  pagava nada. Medido em jogo: "uso Reescrever o Instante" com 6 PM
  responde "custa 8 PM e você tem 6". O desconto de PM das dádivas entra
  na conta, ou o teclado voltaria a discordar do painel, agora para o lado
  severo.

- **~~"Bebo a poção de cura" curava sem gastar a poção.~~** RESOLVIDO, e
  este era o buraco mais antigo dos três: `usarConsumivelUI` existe desde
  sempre — rola o dado do frasco, aplica na ficha, tira o item da bolsa e
  salva —, **mas só era alcançável pelo botão**. Quem escrevia a mesma
  frase caía na cena, e a IA narrava a cura: o herói ficava curado na
  ficção, com a poção intacta na bolsa e os PV intactos na ficha.

  Aqui a resposta boa é a positiva: com o frasco na bolsa o sistema BEBE
  de verdade, pelo mesmo código do botão. Sem o frasco, recusa. Medido:
  PV 1 → 6, dois itens viram um; a segunda tentativa responde "você não
  tem Poção de Cura Pequena na bolsa".

- **~~E o ref da ficha não acompanhava o consumível.~~** RESOLVIDO, e é o
  achado que a prova em jogo entregou de brinde: `usarConsumivelUI` fazia
  `setPersonagem(p)` sem `personagemRef.current = p`. **O furo não era do
  caminho novo — era do botão.** Quem clicava "usar" no painel e agia em
  seguida mandava ao Mestre uma ficha ANTERIOR à poção, porque o `enviar`
  monta o turno a partir de `fichaViva()`, que lê o ref. A poção aparecia
  na tela, o save daquele instante guardava certo, e o salvamento do turno
  seguinte — montado sobre a ficha velha — desfazia tudo: os PV voltavam e
  o frasco reaparecia na bolsa.

### O que fica aberto aqui

- **Digitar o nome de uma habilidade que você TEM ainda não a executa.**
  O sistema já recusa quando falta PM ou recarga, mas quando sobra, a
  frase vai para a IA e nada é cobrado: nem os PM, nem a recarga, nem o
  efeito de regra. É o gêmeo positivo do que a poção acabou de ganhar, e
  o caminho é o mesmo — só que o do painel resolve várias habilidades
  selecionadas de uma vez, com ordem e custo, e apontar o teclado para
  ele exige cuidado maior que o do frasco.

- **A bolsa só é conferida para CONSUMÍVEIS.** "Saco a espada élfica" ou
  "uso a corda" continuam passando sem que o sistema olhe o inventário, e
  é de propósito por enquanto: equipamento comum não tem catálogo fechado
  como as poções, e recusar "uso a corda" por não achar uma corda seria
  transformar cada objeto plausível de mochila num erro.

## A metade positiva — v9.79

- **~~Digitar o nome de uma habilidade que você TEM não a executava.~~**
  RESOLVIDO. A v9.78 passou a recusar quando falta PM ou recarga; quando
  sobrava, a frase ia para a IA e **nada era cobrado** — nem os PM, nem a
  recarga, nem o efeito de regra. O herói "usava" a Postura Defensiva na
  ficção e continuava com a mana cheia e sem defesa nenhuma na ficha.

  O conserto NÃO reescreve a execução: aponta o teclado para o caminho do
  PAINEL, que já resolve tudo — a trava da armadura, o caderno da magia
  guardada, o ritual, os PM com o desconto das dádivas, a recarga, a
  economia de ação em combate e o combo. Reescrever aquela sequência para
  o texto criaria a segunda régua no lugar exato onde a v9.78 acabou de
  fechar a primeira.

  **Sem verbo de uso, não é declaração.** "Adoto uma postura defensiva e
  espero" é descrição de postura, não o talento de Guerreiro — disparar a
  habilidade ali cobraria PM de quem só estava narrando. Medido em jogo:
  "ativo Postura Defensiva" tirou a mana de 6 para 4 e pôs o efeito na
  ficha; "adoto uma postura defensiva e espero" não cobrou nada.

  **As três metades encaixam sem se morder:** quem NÃO tem é recusado
  pela v9.76; quem tem e não pode pagar, pela v9.78; quem tem e pode
  pagar sai por aqui.

## O que a raridade compra — v9.80

Dois relatos, e são o mesmo defeito visto de dois lados: *"apareceu no
mercado uma bota lendária de asas, e a raridade dela era comum"* e *"os
itens não têm efeitos, apenas atributos — se um item dá apenas atributo,
não faz diferença qual item eu uso"*.

- **~~O nome mentia porque havia duas fontes soltas.~~** RESOLVIDO. O nome
  se montava de prefixo + base + sufixo, e NENHUM dos três olhava a
  raridade. A lista de prefixos tinha "Lendário" ao lado de "Rústico" com
  o mesmo peso; a de bases tinha "Botas Aladas" ao lado de "Botas de
  Couro", também com o mesmo. Um item comum saía "Botas Aladas
  Lendárias", com defesa 1 e nada mais.

  O jogador não tem como saber que o nome é decorativo: ele lê "alada" e
  "lendária" e espera asas e lenda. E depois de receber um pedaço de
  couro, **todo nome bonito do jogo perde o crédito**. Agora prefixo tem
  peso e base tem degrau mínimo — nenhum dos dois aparece abaixo do seu.

- **~~E a raridade não comprava nada além de número.~~** RESOLVIDO. O item
  tinha um campo `poder`, e ele era TEXTO: "Nunca perde o fio", "Brilha
  quando perigo se aproxima" — frases lidas por ninguém, porque nenhuma
  linha de código consultava aquele campo. O que valia mecanicamente era
  só `atributos`, e atributo é a mesma coisa em qualquer raridade, só que
  maior.

  Cada degrau agora compra o seu: **comum** o número e só (é o piso, e
  ele tem de existir); **incomum** um traço menor; **raro** um poder dos
  que mudam a conta; **épico** dois, um deles pesado; **lendário** dois
  mais uma CONCESSÃO — uma habilidade do catálogo posta na mão do herói,
  sem custo de PM. É a bota alada que dá Voo, o exemplo do próprio
  relato.

  **O truque que fez isso caber:** os efeitos falam a mesma língua das
  dádivas (`danoExtra`, `ataqueExtra`, `descontoPM`, `criticoEm`,
  `movimento`…). Não foi economia de digitação — é que os leitores delas
  já existem e já são chamados de dentro do combate, do movimento e das
  rolagens. Um vocabulário próprio para item obrigaria a escrever um
  segundo conjunto de leitores, e esta casa já sabe onde isso termina.

- **~~E o item perdia os poderes ao entrar na ficha.~~** RESOLVIDO, e é o
  achado que a prova em jogo entregou. A normalização de
  `adicionar_equipamento` copiava seis campos e descartava o resto — e o
  resto era justamente o que passou a fazer o item valer alguma coisa. A
  bota lendária chegava à ficha com o nome certo, a raridade certa, a
  linha de poder escrita no campo de texto, e **sem `poderes` nem
  `concede`**: parecia lendária na tela e não fazia nada. O mesmo defeito
  da versão inteira, reaberto três metros adiante, na fronteira entre
  quem gera e quem guarda.

- **A sintonia passou a medir o degrau, não o texto.** Enquanto `poder`
  era enfeite, "tem poder escrito" e "é raro" davam quase na mesma. Agora
  todo item de incomum para cima carrega uma linha de poder, e a régua
  antiga faria o couro incomum ocupar um dos TRÊS lugares de sintonia —
  um teto que existe para as peças que mudam o jogo.

### O que fica aberto aqui

- **A tabela de poderes é curta** — vinte, cobrindo os sete slots. É o
  suficiente para o degrau significar alguma coisa, mas dois épicos do
  mesmo slot ainda se parecem demais. Crescer a tabela é barato e não
  mexe em código nenhum: cada entrada nova só precisa de um campo de
  efeito que já tenha leitor, e a suíte cobra isso.

- **Os itens que já estão em saves antigos não ganham poderes.** Eles
  continuam com `atributos` e o texto antigo, e funcionam como sempre
  funcionaram. Recalcular equipamento guardado seria reescrever o que o
  jogador já conquistou — e a forja existe justamente para trocar o
  velho pelo novo.

## O arsenal — v9.81

"Prossiga com novas entradas para termos um arsenal gigante e
diversificado." A tabela tinha vinte poderes para sete slots, e o limite
**não era falta de ideia: era falta de CAMPO**. Com nove campos de efeito
lidos, dois épicos do mesmo slot saíam iguais — e "item lendário tem de
ser lendário" não se sustenta se todos os lendários forem o mesmo item
com outro nome.

Então a paleta veio primeiro, e ela é a parte que importa. **Cinco campos
novos, e nenhum inventado** — cada um se pendurou num gancho que já
existia:

- `imunidades` → `imuneA`, que já servia às dádivas. O elmo que não deixa
  o medo entrar passa a valer tanto quanto a dádiva que faz o mesmo.
- `vantagem` → leitor novo (`vantagemDeItem`), pendurado no mesmo ponto
  onde a vantagem racial já entrava, dentro de `rolarDesafio`.
- `iniciativa` → leitor novo, somado onde `iniciativaDeTraco` já era.
- `resist` e `elemento` → **não ganharam leitor**: são dobrados em
  `atributos`, porque `danos.js` lê os dois de lá desde sempre. Dobrar em
  vez de criar leitor é a mesma escolha de sempre — a pergunta já tinha
  dono.

Com isso a tabela foi de 20 para **62 poderes**, todo slot com pelo menos
sete e cada degrau com escolha de sobra. Entram famílias inteiras que
antes não cabiam: os seis elementos de arma, as sete resistências, as
imunidades a condição (medo, atordoamento, veneno, sangramento, queda,
encantamento) e as vantagens por atributo.

- **E no lendário os DOIS poderes são fortes.** O épico compra "dois, e um
  deles pesa"; o lendário não podia sair com um traço menor no segundo
  lugar — "Passo Largo + Passo Leve" numa peça de lenda lê como um item
  bom com um enfeite ao lado. Onde o slot não tiver dois fortes, cai no
  resto e ninguém fica sem poder.

**A trava continua sendo a mesma, e é ela que deixa a tabela crescer sem
medo:** todo campo de efeito precisa estar em `LEITOR_DO_EFEITO`, e a
suíte cobra isso poder por poder. Uma entrada nova escrita com um campo
sem leitor não passa — que é exatamente o defeito que a v9.80 veio
consertar, e a única forma de ele voltar.

### O que fica aberto aqui

- **Poder de item ainda é sempre passivo.** Tudo o que a tabela concede
  vale enquanto o item está equipado e sintonizado; não há nada que o
  jogador ATIVE ("uma vez por dia, esta lâmina..."). O gancho existe — as
  dádivas já têm recurso que se gasta e contador que zera no descanso —,
  mas o item precisaria aparecer numa lista de coisas usáveis, e isso é
  UI além de regra.

- **Nada distingue duas peças do mesmo poder.** Duas armas com "Sede"
  são idênticas fora o nome. Um degrau de intensidade por raridade (Sede
  2 no raro, 3 no épico, 4 no lendário) seria barato e daria textura sem
  aumentar a tabela.

## As relíquias — v9.82

"Podem existir os itens únicos, que são acima dos lendários, e estes
tenham um poder ativo. Podem existir habilidades únicas que só são
adquiridas ao adquirir um item único. Assim um personagem nível 20 pode
conseguir batalhar com um semideus com mais facilidade."

Três coisas separam uma relíquia de um lendário, e as três importam:

1. **Ela não é sorteada — é escrita.** O lendário nasce de base + prefixo
   + sufixo, e por isso existem milhares deles. A relíquia tem nome
   próprio, história própria e poderes próprios, escritos à mão. Duas
   campanhas nunca terão a "mesma" Comedora de Reis: terão A Comedora de
   Reis, e ela é uma só.

2. **Ela tem um poder ATIVO.** Tudo o que o arsenal da v9.81 concede é
   passivo: vale enquanto está no corpo. A relíquia tem um gesto — uma
   vez por dia, o portador FAZ alguma coisa com ela. É a diferença entre
   carregar poder e usar poder, e é o que dá à peça um lugar na memória
   da campanha.

3. **Os passivos dela são dela.** Não saem do catálogo geral: são
   escritos junto com a peça e não aparecem em item nenhum. É o que
   "habilidades únicas que só são adquiridas ao adquirir um item único"
   pede, ao pé da letra.

**E a pimenta é medida.** Uma relíquia deve fazer um nível 20 encarar um
semideus com mais CHANCE, não com garantia. O vocabulário do ativo é
pequeno e fechado — curar uma fração, devolver mana, tirar condição,
erguer quem caiu, um bônus temporário — e nenhum deles mata, atordoa ou
resolve a luta. Quem ganha continua sendo quem jogou melhor. A suíte
cobra isso: nenhum ativo cura mais de 60% do corpo, e o vocabulário não
aceita campo fora dos cinco.

O contador é por **DIA da campanha**, e não por descanso: descanso se
força, dia não. Sem isso a relíquia viraria um botão de "recuperar tudo"
apertado três vezes na mesma luta.

- **A trava da v9.80 vale aqui também.** Os passivos das relíquias não
  estão em `PODERES`, mas falam o mesmo vocabulário — e a suíte confere,
  poder por poder, que todo campo tem leitor. Um passivo escrito com
  campo novo não passa.

- **`essenciaDe` usava `||` em vez de `??`.** O único rende ZERO essência
  de propósito — desmontar a única peça do mundo por vinte de pó seria
  destruí-la —, e `|| 2` transformava esse zero de volta em dois. O botão
  da forja voltaria a aparecer sobre ela.

### O que fica aberto aqui

- **A única fonte é o modo criativo (`/relica`).** É deliberado: uma peça
  que existe uma vez no mundo não pode cair de um baú aleatório — precisa
  de um lugar na história, e quem decide esse lugar é quem joga. Mas
  falta a ponte natural: o chefe de masmorra em nível alto, a nêmese
  abatida, o cofre do vilão. Quando o sistema de vilão existir, é ele que
  deve entregar a primeira.

- **O gesto só se aciona escrevendo.** Não há botão na ficha nem no
  painel de combate — o jogador precisa saber que a relíquia tem um nome
  e escrevê-lo. A linha do item já mostra `◈ Banquete (uma vez por dia)`,
  mas um botão ao lado da sintonia seria o lugar óbvio.

- **Dez relíquias, e nenhuma para escudo além de uma.** O catálogo cobre
  seis slots; cresce como qualquer tabela desta casa — uma entrada nova
  só precisa de campos com leitor, e a suíte cobra.

## O vilão — v9.83

"O sistema nêmesis não será um gerador de inimigos, ele será o vilão. Ele
não aparecerá mais na ficha do jogador — o jogador não precisa saber quem
é seu nêmesis, porque quando o vilão aparecer, ele saberá, e não
esquecerá."

**O que havia.** Um nome sorteado, um título sorteado, um motivo sorteado
de uma lista de seis, e um número: `odio`, subindo de dois a cinco por dia
até cem. Em 30, difamação; em 55, sabotagem; em 80, assassinos; em 100, o
confronto. Sempre nessa ordem, sempre nesse ritmo, em toda campanha que
este jogo já teve. E enquanto o número corria, **nada acontecia no mundo**.

E o pior estava na tela: **"🎭 nêmesis: Sarna · ódio 42"**, num canto da
ficha, desde o primeiro dia. O jogador conhecia o nome do inimigo antes de
qualquer cena, via o ódio subir como quem acompanha um carregamento, e
quando a pessoa enfim aparecia já não havia revelação nenhuma para
acontecer. **O sistema entregava o final na primeira página.**

`vilao.js` reescreve isso a partir do que as histórias que ficaram fazem:

- **AS FASES.** Cinco degraus — rumor, marca, mão, rosto, guerra — e o que
  muda entre eles não é o quanto ele bate: é **o quanto o jogador sabe**.
  Nas três primeiras o sistema PROÍBE nomear, proíbe dizer que há alguém
  por trás, e proíbe as palavras "vilão" e "nêmesis". Juntar os pontos é
  o prazer do jogador, e entregá-los prontos é roubar a cena que ainda
  vai acontecer.

- **A REVELAÇÃO NÃO É UMA LUTA.** Quem luta com o vilão na estreia não
  tem clímax depois. Ele aparece para conversar, oferecer ou cobrar, e
  vai embora inteiro — e o envelope pede a melhor fala da campanha até
  ali, para alguém que acredita no que diz e sabe o que o herói fez.

- **ELE NASCE DE COMO VOCÊ JOGOU.** Seis arquétipos, cada um com uma
  `nasceDe` que lê o registro do jogador: quem resolveu tudo no aço atrai
  o Espelho; quem tomou cidades atrai o Herdeiro; quem desceu masmorras
  atrás de poder atrai o Faminto. O vilão de cada campanha é o retrato do
  jogador com um passo a mais — e quem não tem história ainda tem vilão,
  porque o Arquiteto nasce de qualquer um.

- **ELE TEM UM PLANO, E ESTÁ GANHANDO.** Nove passos, e cada um TIRA
  alguma coisa — escolhida entre o que o jogador tem de verdade: a pessoa
  cujo nome ele escreveu, a cidade que ele tomou, a promessa que ele fez.
  Ameaçar "o reino" é meteorologia. O plano chega ao fim mesmo se o herói
  nunca interferir, e é por isso que ele tem motivo para atrapalhar antes
  de saber contra quem.

- **ELE NÃO CAI ANTES DA HORA.** Vilão derrubado de primeira é monstro
  com nome — e a IA narra a morte dele com a melhor das intenções, porque
  a cena pedia um desfecho. O sistema recusa, e a recusa não é "nada
  aconteceu": ele escapa CUSTANDO alguma coisa. Uma peça fica para trás,
  um plano atrasa, alguém que estava com ele morre no lugar.

- **E a morte dele muda o mundo.** O envelope da queda proíbe sucessor e
  "plano maior", e manda narrar o que ele DEIXOU: gente que acreditava
  nele e agora não tem no que acreditar, um lugar que continua nas mãos
  dele mesmo depois de morto, uma frase que as pessoas ainda repetem.

**A segunda porta por onde a revelação vazava** também fechou: o vilão
entrava no registro de pessoas no dia em que nascia, com "NÊMESIS do
herói" escrito na ficha — e o registro sobe ao prompt em TODO turno.
A IA sabia o nome desde o primeiro dia. Agora ele entra no elenco na
revelação.

E o sistema fala em voz de sistema **duas vezes na campanha inteira**: na
revelação e na queda. Nas outras fases ele cala e deixa a cena falar.

### O que fica aberto aqui

- **O vilão não entrega a relíquia.** A v9.82 deixou anotado que uma peça
  única precisa de um lugar na história, e que o vilão seria o dono desse
  lugar. O gancho existe dos dois lados e ainda não foi ligado: o cofre
  dele, o que ele tirou de alguém, o que fica no chão quando ele cai.

- **O plano não reage ao que o herói faz.** Ele avança por dia, e
  atrapalhá-lo não o atrasa — não há como o jogador "quebrar um passo".
  A fase da guerra promete um plano atacável e o envelope pede isso à
  ficção, mas o sistema ainda não tem onde registrar um passo desfeito.

- **Um vilão por campanha.** Quando ele cai, não nasce outro. A fama
  volta a poder gerar um, mas a peça não sabe encadear — o segundo seria
  um estranho começando do rumor, sem nenhuma relação com o primeiro.

## O arco casa com o vilão — v9.84

"Case esse sistema com o sistema de arcos, e não deixe nada visível, não
queremos nenhum spoiler. A única coisa visível é o tipo de história que o
player escolheu. O sistema de vilão deve ser tão bem elaborado que o fim
do arco dele será o fim do capítulo."

- **~~O arco andava por contagem.~~** RESOLVIDO. Cada missão concluída,
  relógio cheio ou ameaça abatida somava marcos, e a cada tanto o momento
  virava. Era um **termômetro de atividade**: um jogador que fizesse vinte
  favores pequenos chegava ao momento mais escuro da história sem nunca
  ter tido contra quem.

  O arco de uma história não anda porque o herói andou — anda porque o
  ANTAGONISTA andou. As duas peças viraram uma: a fase do vilão É o
  momento do arco. Na Jornada do Herói o encaixe é um a um: a marca leva
  à Travessia, a mão às Provações, **a revelação ao Abismo**, a guerra à
  Transformação, a queda ao Retorno.

  Os marcos não sumiram: continuam contando enquanto não há vilão, porque
  o começo de uma campanha é mesmo feito de andar. O que eles não podem
  mais é levar a história à segunda metade sozinhos.

- **~~A tela de criação listava o arco inteiro.~~** RESOLVIDO. "O CHAMADO
  → A TRAVESSIA → PROVAÇÕES → O ABISMO → A TRANSFORMAÇÃO → O RETORNO",
  antes de o jogador escrever o nome do personagem. O diário tinha tirado
  a fila de etapas na v9.28 pela razão certa — ver que está em "Provações"
  é saber que ainda vem "O Abismo" — e a tela de criação continuou
  mostrando a mesma coisa, inteira, no primeiro minuto.

  E a **descrição** de cada estrutura enumerava as mesmas batidas em prosa
  ("o chamado, as provações, o abismo e o retorno transformado"). As
  quatro foram reescritas para dizer o que a história PROMETE, não a
  ordem em que ela acontece.

- **~~O nome da etapa subia ao prompt.~~** RESOLVIDO. Ia como `momento
  interno "O Abismo"`, e uma IA que sabe que está no Abismo escreve como
  quem sabe: anuncia o tom, antecipa a queda, escolhe as palavras do
  rótulo. A proibição de contar ao jogador já existia e não bastava,
  porque **o vazamento não é dizer o nome — é escrever a etiqueta em vez
  da cena**. Sobe só a direção.

- **~~E o fim do arco pedia um novo arco.~~** RESOLVIDO. Três das quatro
  estruturas terminavam mandando a IA "perguntar se o jogador deseja um
  novo arco" — e o envelope do capítulo proíbe exatamente isso. Duas
  ordens opostas no mesmo prompt, que é a forma exata do bug que esta
  casa mais repete.

### O fim do capítulo

As duas coisas têm de se encontrar: **o vilão caiu E o arco chegou ao
último momento**. Uma sem a outra não fecha nada — matá-lo no meio o
sistema não deixa (v9.83), e chegar ao fim sem derrubá-lo é o clímax por
acontecer.

O jogador lê uma linha: "📖 Fim do capítulo 1". Nada de etapa, nada de
estrutura. E o Mestre recebe a ordem de fazer um EPÍLOGO — não um resumo
—, proibido de anunciar o próximo vilão, de dizer a palavra "capítulo" e
de perguntar o que fazer agora: o silêncio depois do fim é parte do fim.

### A porta dos capítulos

`historia` guarda `capitulo` e `capitulos[]`, e `abrirCapitulo` já existe:
volta ao primeiro momento, zera marcos, incrementa o número, permite
trocar a estrutura e **mantém o mundo inteiro** — cidades, gente, mapa,
cânone. O capítulo anterior fica registrado com o vilão que o fechou.

### O que fica aberto aqui

- **A porta não tem maçaneta ainda.** `abrirCapitulo` existe e ninguém a
  chama: falta a tela que oferece "começar o próximo capítulo" depois do
  epílogo, e as três formas que o pedido menciona — o mesmo herói anos
  depois, um herói novo no mesmo mundo, ou uma história que acontece
  *durante* a anterior. A última é a mais interessante e a mais cara: o
  mundo teria de ser lido no estado de um dia passado.

- **O vilão não renasce com o capítulo.** `abrirCapitulo` reinicia o arco
  mas não gera o vilão do capítulo novo, e o antigo continua no save como
  derrotado. O segundo capítulo começaria sem antagonista até a fama
  gerar outro — e sem nenhuma relação com o primeiro, quando a relação é
  justamente o que faz uma campanha ter capítulos em vez de sessões.

## O Bibliotecário, e a varredura que ele trouxe — v9.85

"E se criarmos um sistema treinado em histórias? Ele seria uma base de
consulta do mestre. E temos que ter certeza que todos os sistemas estão
ligados ao mestre, pois para ele tocar o mundo ele tem que ter controle
sobre o mundo."

- **~~O mestre sabia O QUÊ e não sabia COMO.~~** RESOLVIDO. Ele escolhia
  bem qual fio puxar — o relógio quase cheio, a promessa aberta, o passo
  do vilão — e o envelope pedia sempre a mesma coisa: *"traga isto à cena
  em duas ou três frases"*.

  Pedido igual todo turno recebe resposta igual todo turno. **A repetição
  do narrador nunca foi falta de temperatura**: subir a temperatura fez a
  IA variar as palavras, e o que se repetia era a jogada.

  A estante tem **37 formas** e cada uma tem um `quando`, que é o que faz
  disto uma consulta de mestre e não um sorteio: a cortesia do inimigo só
  abre da fase da mão em diante, o espelho exige que ele já tenha
  mostrado o rosto, em brasa não se respira e em combate não se planta.
  Sem antagonista nenhuma forma do "outro lado" abre — pedir a forma do
  inimigo quando não há inimigo é pedir à IA que invente um.

  **Custa zero token por turno.** Fala só dentro de um envelope que já ia
  ser enviado. E o nome da jogada não viaja: sobe a forma, nunca a
  etiqueta — uma IA que sabe que está fazendo "o mensageiro" escreve o
  mensageiro genérico que ela já viu mil vezes.

### A varredura

Em vez de ler tudo procurando desligamento, a pergunta virou mecânica:
**quantas vezes cada `export` aparece em todo o código e em todas as
provas?** Uma ocorrência é a definição — se não há segunda, a regra foi
escrita e nunca chamada.

**1508 regras, 0 módulos mudos, 26 sem leitor.** Duas eram regra de jogo:

- **~~"Comando: Atacar" era comprável e inerte.~~** RESOLVIDO. Custa um
  ponto no rank 2 e promete "sua invocação ataca com fúria redobrada". O
  leitor dela (`temComandoAtacar`) estava escrito em invocacoes.js, ao
  lado de três irmãos ligados, e **ninguém o chamava**. É a pior versão
  do bug desta casa: o jogador PAGA por ela.

  Fúria redobrada virou vantagem no ataque, e não uma ação a mais — a
  ação a mais já é a Voz de Comando, oito linhas abaixo, e duas
  habilidades da mesma árvore fazendo a mesma coisa é pior que uma que
  não faz nada.

- **~~`TIPOS_DE_ALVO` nunca foi lida.~~** RESOLVIDO. `escolherAlvo`
  repetia a ordem à mão num encadeado de ternários e nunca olhava para a
  tabela logo acima. Com ela ficou morto o `comoDoi`, que diz **que
  espécie de ferida** o alvo é: o envelope mandava um nome cru, e "ele
  pôs a mão em Marta" e "ele pôs a mão em Vale Torto" chegavam à IA com o
  mesmo peso.

### A catraca

Ter certeza uma vez não serve. A varredura virou suíte, com a lista do
que já se sabe morto **congelada com o motivo de cada perdão** — e ela
anda nos dois sentidos: uma regra nova sem leitor quebra a suíte no dia
em que nasce, e um perdão que ganhou leitor tem de sair da lista, senão
ela cresce e vira decoração.

### O que fica aberto aqui

- **O gerador de nêmese antigo continua em fama.js.** `gerarNemesis`,
  `LIMIARES_NEMESIS` e `ACOES_NEMESIS` foram substituídos pelo vilão na
  v9.83 e ninguém os chama. Estão perdoados na catraca com o motivo
  escrito, mas dois sistemas de antagonista no mesmo repositório é uma
  armadilha para quem for mexer nisso depois. O mesmo vale para
  `decaimentoFe` em divindades.js, duplicata da míngua que devocao.js já
  roda todo dia.

- **A estante não consulta o histórico da campanha.** Três formas
  (`rosto_conhecido`, `espelho`, `eco`) dependem de haver passado, e hoje
  quem decide se há é a IA — o `evite` manda escolher outra forma se não
  houver. O mestre poderia saber disso e não oferecer a forma.

- **A forma não chega ao turno comum.** O Bibliotecário só fala nos três
  envelopes de iniciativa. A cena normal — a maior parte dos turnos —
  continua sem forma nenhuma, e é onde a repetição mais aparece.

## A estante fica grande, e a forma chega ao turno comum — v9.86

"Prossiga e finalize as três coisas anotadas, também preencha o
bibliotecário com muitos dados para ele ter uma ampla biblioteca."

- **~~Trinta e sete formas eram poucas.~~** RESOLVIDO. **191 formas, em
  nove escolas.** Não era generosidade: com trinta e sete e uma janela de
  seis, a nona cena já era uma repetição inevitável — repertório pequeno
  repete por aritmética, não por descuido.

  O acervo saiu para `estante.js` e o motor ficou em `biblioteca.js`.
  Dezesseis famílias, na ordem em que um mestre pensa a cena: como a
  coisa CHEGA, o que o inimigo OFERECE, o que a vitória CUSTA, o que fica
  PLANTADO, o que volta COLHIDO, onde a mesa RESPIRA, o que o jogador
  ESCOLHE, quem olha o herói NOS OLHOS, como o perigo mostra os DENTES, o
  MUNDO que continua sem ele, como as pessoas FALAM, o que o LUGAR faz, o
  que o TEMPO faz, o que o CORPO carrega, o que a DÚVIDA abre e o que o
  VÍNCULO cobra.

  A janela de repetição subiu de seis para oito, e a memória de doze para
  dezesseis — ela pôde crescer porque o acervo cresceu junto.

- **~~A forma não chegava ao turno comum.~~** RESOLVIDO, e era a mais
  importante das três. O Bibliotecário nascia falando só nos três
  envelopes de iniciativa — e esses três são raros **de propósito**: a
  cadência do mundo é larga porque um mundo que interrompe toda hora é
  barulhento, não vivo.

  Quer dizer que a forma chegava a um turno em cada dez, e os outros nove
  continuavam exatamente como antes. **E é neles que a repetição
  aparece, porque são eles que se repetem.**

  Entram só as formas marcadas `sozinha` — as **48** que moldam a CENA em
  vez de moldar a entrega de outra coisa. "Termine com duas portas
  abertas" funciona sem fio nenhum atrás; "faça isto chegar por um
  mensageiro" não funciona sem o *isto*, e pedi-la num turno vazio é
  pedir à IA que invente o *isto*.

  Cadência de três turnos, nunca em combate e nunca em brasa: o turno de
  luta já vem cheio de voz de sistema, e dizer à IA como compor a cena
  enquanto o sistema resolve iniciativa, dano e posição é atropelar a
  única parte que ainda era dela. E nunca duas formas no mesmo turno —
  isso seria o sistema falando por cima de si mesmo.

- **~~O histórico ficava nas mãos da IA.~~** RESOLVIDO. Vinte e uma
  formas dependem de haver passado, e até aqui quem decidia se havia era
  a IA: o `evite` mandava "escolher outra forma se não houver".

  Delegar essa pergunta é exatamente o que esta casa não faz. Quem sabe
  se há gente conhecida e se há campanha vivida é o **sistema** — o
  registro de pessoas e os feitos do arco estão do lado de cá. Uma IA que
  recebe *"traga alguém que você já conhece"* numa campanha de dois dias
  faz a única coisa que pode: inventa a pessoa.

  Duas travas separadas, porque são coisas diferentes: `temGenteConhecida`
  (há nome no registro) e `temPassado` (há feitos, derrotados ou
  cicatrizes). Ter conhecido gente não é ter vivido.

- **~~Dois sistemas de antagonista no mesmo repositório.~~** RESOLVIDO. O
  gerador de nêmese antigo (`gerarNemesis`, `LIMIARES_NEMESIS`,
  `ACOES_NEMESIS`) saiu de fama.js, e a duplicata da míngua da fé saiu de
  divindades.js. Nos dois lugares ficou uma lápide dizendo para onde a
  regra mudou.

  Ficar não era neutro: `gerarNemesis` é o primeiro nome que uma busca
  encontra, e o campo `odio` que ele produzia ainda vive em saves
  antigos, que `garantirVilao` migra. Quem restaurasse a função teria dois
  sistemas escrevendo no mesmo lugar do save.

  E o perdão da catraca não serve para código morto que dá para apagar:
  serve para o que precisa continuar existindo sem leitor.

### O que fica aberto aqui

- **A forma não sabe o que já foi narrado.** A estante evita repetir a
  mesma FORMA, mas nada impede que duas formas diferentes produzam cenas
  parecidas — dois "alguém chega trazendo" seguidos, por caminhos
  distintos. Faltaria uma memória do que a IA de fato escreveu, e essa é
  a parte que o sistema não lê.

- **A cadência é fixa em três.** Deveria responder à temperatura da mesa:
  numa mesa fria a forma ajuda mais e podia vir mais cedo; numa mesa
  quente ela atrapalha e podia esperar. O `podeFormaDeCena` já recebe a
  situação inteira — falta usá-la.

- **`precisa` só tem dois valores.** Há formas que dependem de coisas
  mais específicas — uma frase realmente dita antes (`eco`), um objeto
  que apareceu de fato (`objeto_volta`) — e hoje as duas passam pela
  trava genérica de "passado". Uma trava por tipo de memória seria mais
  honesta.

## O gesto por baixo da forma — v9.87

- **~~Duas formas diferentes faziam a mesma cena.~~** RESOLVIDO, e o
  diagnóstico anterior estava errado. Eu tinha anotado que faltava "uma
  memória do que a IA de fato escreveu" — não falta. O problema era do
  lado de cá: `mensageiro`, `rosto_conhecido`, `pela_crianca`,
  `procurador`, `ordem_de_longe` e `quem_ficou` são **seis entradas
  distintas e uma única cena** — alguém chega e fala comigo. Três delas
  seguidas passavam pela memória sem alarme nenhum, e o jogador lia a
  mesma coisa três vezes com nomes diferentes na estante.

  Toda forma ganhou um **gesto**: o que a cena FAZ, abaixo do assunto.
  Vinte e dois nomes para 191 formas, e grosso de propósito — se cada
  forma tivesse o próprio gesto, o gesto seria o id de novo. A janela do
  gesto é curta (três) porque proibir "alguém chega e fala" por oito
  turnos proibiria metade do que uma cena de cidade pode ser.

- **~~E os vetos casavam TEXTO.~~** RESOLVIDO de quebra. Eles testavam
  trechos da própria `forma` (`/respiro|calma, de verdade calma|ter
  graça/`), o que é frágil ao ponto de sumir sozinho: bastava reescrever
  uma frase para o veto parar de cortar sem que nada quebrasse. Agora
  leem `gesto`, e por isso cortam a família inteira em vez das quatro
  formas cujo texto eu tinha lembrado de listar.

- **~~A cadência era um número fixo.~~** RESOLVIDO. Três turnos tratava
  igual duas mesas opostas. Numa mesa **fria** — cinco turnos sem dado,
  sem perigo e sem nada ganho — a forma é o socorro, e fazê-la esperar é
  deixar a cena morrer mais um pouco antes de acudir. Numa mesa **quente**
  já há voz demais.

  ```
  fria   → 2      morna → 3      quente → 6      brasa → nunca
  ```

  Tabela com o motivo de cada linha, e o motivo entra na mensagem de
  espera: quem for depurar tem de saber por que esperou seis e não três.

- **~~`precisa` era grosso demais.~~** RESOLVIDO. "Passado" cobria três
  memórias diferentes: a forma que pede uma FRASE já dita, a que pede um
  OBJETO que apareceu e a que pede um LUGAR onde estive. Um herói com
  três cicatrizes e nenhum quilômetro rodado tem passado de sobra e
  nenhum lugar de que se lembrar.

  Cinco exigências, e viraram **tabela** com garantia de leitor: uma
  forma que declare exigência sem linha correspondente quebra a suíte, em
  vez de abrir sempre porque nenhum veto a conhecia.

### O veto falhava ABRINDO

Achado ao ligar a tabela: `consultarBiblioteca` engolia a exceção de um
veto quebrado e deixava a forma passar. É a classe de bug que esta casa
mais repete, na versão mais cara — **lacuna virando permissão**, a mesma
de `seguraOTeste` na v9.71.

Invertido: veto que lança agora **corta**. Um veto com defeito que corta
demais aparece na hora, porque a estante encolhe; um que libera demais só
aparece quando a IA já narrou o que não devia.

### O que fica aberto aqui

- **O gesto não sabe o que o JOGADOR fez.** A memória cobre o que o
  sistema mandou, e o jogador que passa três turnos conversando recebe
  formas de conversa sem que nada perceba a redundância. `pilarDoTexto`
  já lê o texto dele e já alimenta a mesa — faltaria o gesto olhar para
  esse sinal também.

- **`peso` é fixo por forma.** Uma forma que serve muito bem à cena atual
  concorre com o mesmo peso de uma que mal cabe. O `quando` é binário:
  abre ou não abre. Uma nota de ADERÊNCIA — o quanto ESTA forma serve a
  ESTA situação — deixaria o sorteio mais fino sem tirar a variedade.

- **`temFalaAnterior` conta mensagens, não falas.** Doze narrações do
  Mestre é um limiar honesto para "já se conversou", mas não é a mesma
  coisa que existir uma frase memorável para ecoar. Só a IA sabe disso, e
  é o único caso em que devolver a pergunta a ela seria defensável.

## A aderência: o `quando` deixa de ser a palavra final — v9.88

- **~~`peso` era fixo por forma.~~** RESOLVIDO. O `quando` é binário —
  abre ou não abre —, e isso bastava enquanto o acervo era pequeno,
  porque quase tudo que abria servia. Com 191 formas abertas ao mesmo
  tempo, `dentes_em_outro` pesava o mesmo no começo da campanha e no
  clímax, e `colhe` competia de igual com `planta` num mundo onde ainda
  não havia nada plantado.

  A saída óbvia — uma função `cabe` em cada entrada — seria 191 regras
  para manter, quase todas repetindo a mesma ideia. São **nove regras
  gerais** aplicadas ao acervo inteiro, cada uma devolvendo um
  multiplicador. Medido no jogo rodando:

  ```
  começo do arco   planta:117   mostra_mundo:98   fala:82
  fim do arco      mostra_mundo:103  colhe:95     fala:74
  mesa fria        mostra_mundo:87  me_ve:66  fala:65  chega_gente:62
  mesa quente      me_ve:114  fala:109  mostra_mundo:86  vinculo:76
  ferido, masmorra mostra_o_outro:93  mostra_dentes:79  me_ve:58  mostra_corpo:56
  ```

  **Nenhuma linha zera.** Afinidade não é veto: o que o `quando` abriu
  continua possível mesmo quando não é o mais indicado, e é dessa cauda
  que vem a cena que ninguém esperava. Piso 0,2 e teto 6.

  E a linha mais útil é contra a intuição: **mesa fria pede
  acontecimento, não respiro.** Mesa fria são cinco turnos sem dado, sem
  perigo e sem nada ganho — mais uma cena calma sobre uma cena morta é a
  morte confirmada. Sem essa linha a régua faria o contrário, porque as
  formas de respiro só abrem em mesa fria ou morna e teriam a fria só
  para elas.

- **~~O holofote era caso especial no meio do sorteio.~~** RESOLVIDO de
  quebra. Ele estava escrito à mão dentro de `consultarBiblioteca`;
  virou a primeira linha da tabela, para que todo o peso da decisão more
  num lugar só — que é o que impede a próxima regra de nascer solta como
  esta estava.

- **~~O gesto não sabia o que o JOGADOR fez.~~** RESOLVIDO. A memória
  cobria o que o sistema mandou e era cega para o outro lado da mesa: um
  jogador que passa três turnos conversando recebia formas de conversa
  sem que nada percebesse a redundância — o gesto nunca se repetia e a
  cena se repetia mesmo assim, **porque metade dela vinha dele**.

  `pilarRepetido` é o irmão de `pilarFaminto` e o oposto dele: um olha o
  que está em falta, o outro o que está em excesso. Dois em três turnos,
  e não três em três, porque a régua não é "ele só fez isso" — é "isto é
  o que ele vem fazendo". As duas forças puxam em sentidos contrários, e
  é assim que tem de ser.

- **~~`temFalaAnterior` contava narrações.~~** RESOLVIDO como dava. Doze
  parágrafos de travessia e descrição não deixam uma frase para ecoar;
  agora conta narração que tem fala dentro (aspas ou travessão). Continua
  proxy — se há uma frase *memorável* só a IA sabe, e este segue sendo o
  único caso em que devolver a pergunta a ela seria defensável.

### O que fica aberto aqui

**Nada — e as três coisas que eu tinha anotado aqui eram falsas.**

Foram escritas por dedução, sem medir nenhuma. As três dissolveram no
primeiro contato com um número, e ficam registradas com a medição para
que ninguém as reabra por leitura do código:

- **~~"Duas cenas de tom idêntico seguidas."~~** NÃO ACONTECE. Em 2.000
  sorteios, quatro gestos sombrios seguidos não saíram uma vez; a maior
  sequência foi 3, e o "ar" (respiro, vínculo, olhar) ficou SEMPRE acima
  do sombrio — 26% contra 7% no começo do arco, 21% contra 19% no
  clímax. O tom já acompanha o arco sozinho, porque o momento e a fase do
  vilão já entram na aderência. Um campo de TOM na estante seria uma
  quarta régua medindo o que três já medem.

- **~~"As afinidades empilham e empatam no teto."~~** NÃO ACONTECE. Em
  7.640 combinações de forma e cena, o teto de 6 foi alcançado ZERO
  vezes; o máximo observado foi 5,4. O teto está fazendo o que um teto
  deve fazer — existir sem apertar.

- **~~"`mostra_mundo` ganha por tamanho."~~** NÃO É POR TAMANHO. Ele sai
  em 14% dos sorteios contra 10% do acervo, e a diferença é exatamente o
  ×1,4 que a linha `onde_eu_estou` dá ao mundo numa cidade. O mesmo vale
  para `fala` (6% do acervo, 10% do sorteio, ×1,5 com gente na cena).
  Não é viés estrutural: é a tabela fazendo o que foi mandada fazer, na
  cena em que foi mandada.

A lição fica junto, porque ela é mais útil que os três itens: **item de
pendência escrito por dedução vale menos que zero.** Ele parece trabalho
identificado, sobrevive a revisões porque ninguém o questiona, e manda a
próxima sessão gastar horas num defeito que não existe. Se dá para medir,
mede-se antes de anotar.

## A harmonia: o sistema passa a falar com uma voz só — v9.89

"O sistema todo precisa estar em perfeita harmonia. Imagino que pelo
funcionamento atual, algo deve estar confuso quanto ao funcionamento, se
é pelo mestre ou pela IA."

Estava, e a raiz era o **prompt fixo** — não os sistemas novos. Três
sistemas nasceram em versões seguidas (o Mestre na v9.71, o vilão na
v9.83, o Bibliotecário na v9.85), cada um provado sozinho, e ninguém
tinha provado o ENTRE.

- **~~Uma "regra-mestra" devolvia à IA tudo o que o Mestre tirou.~~**
  RESOLVIDO, e era a confusão inteira. `prompt.js` mandava, todo turno:
  *"LIBERDADE CRIATIVA (**regra-mestra — vem ANTES de qualquer cautela**)
  […] **Invente tramas, viradas, detalhes e gente nova à vontade** […] As
  ÚNICAS proibições deste jogo são fatuais."*

  Os envelopes dizem *"NÃO abra trama nova"*, *"NÃO invente missão, item,
  moeda nem nome de gente que o jogo não tenha"*. A linha do prompt não só
  contradizia — ela **se declarava acima**, e classificava a proibição do
  envelope como não estando entre as proibições do jogo. Quando os dois
  colidiam, o prompt mandava a IA ficar contra o Mestre. E ele fala todo
  turno; o envelope, num a cada três.

  A ousadia ficou inteira — ela nasceu porque o narrador era tímido, e
  essa metade continua necessária. O que mudou foi ela ganhar OBJETO: a
  divisão que `turno.js` escreveu na v9.61 e que nunca tinha chegado ao
  prompt. O sistema decide o que existe e o que acontece; a IA decide como
  aquilo se parece e o que significa. E o envelope deixou de ser "cautela"
  para ser **o mundo falando**.

- **~~O prompt ensinava um vilão de desenho.~~** RESOLVIDO. *"O vilão é
  mau de verdade: cruel, manipulador, capaz de atrocidades"* — contra
  *"sem ameaça, sem voz alta, sem discurso: a gentileza é o que assusta"*
  e *"deixe a razão do outro lado ser defensável"*. Dois professores, e o
  do prompt falava todo turno. O perigo dele passou a morar no que ele FAZ
  e no que ele CRÊ. Nenhum outro personagem foi amansado.

- **~~As marcas do vilão repetiam em 100% das campanhas.~~** RESOLVIDO.
  `avancarPlano` empilhava o alvo sem conferir nada e `escolherAlvo`
  sorteava de uma lista curta. Medido: 300 campanhas simuladas com elenco
  realista, **300 com marca repetida**. O envelope da revelação saía
  dizendo *"o que ele já me tirou: Marta, Marta, Marta"* — que não é uma
  lista de perdas, é um defeito de contagem contado como ficção. Agora 0
  em 300, e **nenhum passo no vazio**: deduplicar só na entrada faria ele
  sortear quem já levou e não registrar nada, que é pior que repetir
  porque some sem deixar rastro.

- **~~A revelação levava uma forma sorteada grampeada.~~** RESOLVIDO. A
  revelação e a queda já vêm COMPOSTAS — dizem a cena inteira. O
  Bibliotecário colava uma das 140 formas em cima, e oito delas mandam o
  oposto de *"dê a ele a melhor fala da campanha até aqui"*:
  `fala_curta`, `nao_responde`, `silencio_ruim`, `interrompido`. Nas
  outras fases a forma continua entrando, que é onde o envelope diz o QUE
  e a forma diz o COMO.

- **~~A mesa não sabia que o vilão se mexeu.~~** RESOLVIDO.
  `processarNemesisDiaria` não tocava em `mesaRef` nem na textura — zero
  referências. O passo do vilão, que é a maior pressão que este jogo
  produz, não esquentava nada: a temperatura podia ler "fria" no turno
  seguinte e mandar o mundo puxar um fio da memória JUNTO. Ele entra como
  **perigo**, não como luta — ele ainda não veio em pessoa.

### O que foi verificado e está são

Registrado para ninguém reabrir por leitura:

- **Os dez detectores do portão estão ligados.** `detectarMorteIndevida`,
  `detectarAscensaoNarrada` e os outros oito têm zero referência direta no
  App e entram todos por `violacoesDoTurno`, que roda em toda resposta.
- **Não há empilhamento de envelopes em jogo comum.** Medido em turnos
  reais: 1 a 2 por turno, nunca mais.
- **Os geradores de vida existem em produção**, por
  `processarDescansoLongoEventos`.

### O que fica aberto

- **A maçaneta da porta dos capítulos** (v9.84) — `abrirCapitulo` existe e
  ninguém a chama. É a próxima.
- **O vilão não entrega relíquia** e **o plano dele não reage ao herói**:
  não há como quebrar um passo. Os dois são do desenho original e ficaram.
- **Um vilão por campanha** — nada encadeia depois que ele cai, e é
  justamente disso que o sistema de capítulos vai precisar.

## A maçaneta, e o vilão que herda — v9.90

- **~~A porta dos capítulos não tinha maçaneta.~~** RESOLVIDO.
  `abrirCapitulo` existia desde a v9.84 e **ninguém a chamava**. Agora ela
  aparece depois do epílogo, uma vez, com as três formas que você pediu:

  | forma | quem | quando |
  |---|---|---|
  | **Anos depois** | o mesmo herói | +5 anos |
  | **Outra pessoa** | herói novo | onde parou |
  | **Antes do fim** | herói novo | antes da queda |

  Nas três **o mundo fica inteiro**: cidades, gente, mapa, cânone,
  descobertas, o que foi saqueado e quem morreu. É a única coisa que
  separa um capítulo novo de uma campanha nova — apagar isso faria as duas
  serem a mesma coisa com nomes diferentes. O que some é o que pertence ao
  **herói**: contadores, conquistas, título, quests.

  O painel não pode ser reaberto, e é de propósito: a porta de um capítulo
  que fechou só existe no instante em que ele fecha. Oferecê-la de novo
  transformaria o fim numa opção de menu.

- **A regra do prólogo.** "Antes do fim" é a única das três que mexe na
  regra do jogo, e é o que a torna interessante em vez de confusa: **o
  desfecho é fato**. O jogador pode vencer batalhas e mudar tudo o que o
  registro não escreveu, mas nada do que ele conquistar desfaz o que já
  foi contado — se a ação vai na direção de impedir o inevitável, ela
  custa caro e chega tarde. E ele não sabe que está num prólogo: para ele
  aquilo é o presente. O vilão do capítulo anterior continua vivo lá,
  porque é ele que o jogador vai cruzar antes de saber o fim.

- **~~Um vilão por campanha.~~** RESOLVIDO, e era a metade que faz um
  capítulo ser capítulo. Um que começa sem antagonista e depois ganha um
  gerado do zero pela fama é uma sessão nova que por acaso usa o mesmo
  mapa.

  Seis **heranças**, e nenhuma é "o irmão gêmeo do vilão". A regra que as
  organiza: o novo antagonista não continua o plano do anterior — ele
  nasce do **buraco que a queda dele abriu**, e esse buraco foi o herói
  quem fez.

  - **o órfão** — enterrou o morto e nunca aceitou o motivo
  - **o herdeiro do plano** — servia a ele e conhece as peças que ficaram
  - **o vazio** — ocupou o lugar vago na semana seguinte, sem disputa
  - **o aviso** — é a coisa contra a qual o morto passava a vida se preparando
  - **a obra** — o que ele pôs de pé, e que não parou quando ele parou
  - **o caçador** — recebeu a tarefa de achar quem o derrubou

  Duas herdam a **crença** inteira. Quando ela sobrevive, o jogador
  reencontra o argumento que já ouviu na boca de outro rosto — e é aí que
  uma campanha começa a parecer uma só história. As marcas **não** são
  herdadas: são o que o herói perdeu para o morto, e passá-las adiante
  faria o novo cobrar uma conta que não é dele.

  O herdeiro começa no rumor, desconhecido, com assinatura própria. O
  segundo capítulo recomeça pelo clima, senão a revelação dele já nasce
  gasta.

### Uma armadilha de ferramenta que custou uma rodada

`App.jsx` virou **CRLF** no commit anterior (git `core.autocrlf`), e todo
padrão multilinha dos meus scripts de patch passou a falhar — em
silêncio, relatando "não achei" como se o texto tivesse mudado de lugar.
Os patchers desta casa agora detectam o final de linha do arquivo e
convertem o padrão. Vale para os oito arquivos que já estão em CRLF:
App.jsx, especializacoes, geografia, masmorras, mundo-base, nomes,
painel-mapa e subclasses.

### O que fica aberto

- **O plano do vilão não reage ao herói.** Não há como quebrar um passo:
  ele anda a cada seis dias faça o jogador o que fizer. É a última peça
  grande do sistema de vilão.
- **O prólogo não rebobina o mundo.** "Antes do fim" volta o calendário e
  trava o cânone, mas o mapa, os NPCs e o que foi descoberto seguem no
  estado de hoje — o jogo não versiona o mundo por dia. Na prática o
  prólogo é jogado num mundo que já viu coisas que ainda não aconteceram,
  e só o envelope segura a incoerência.
- **As relíquias do vilão** continuam sem entrega, e os ativos delas
  continuam sem botão.

## O compasso: a camada rápida do arco — v9.91

"Podemos expandir a estrutura de arcos e dentro do arco ter camadas e
etapas, algumas fixas e outras sorteadas, seguindo uma fórmula infalível.
Assim o sistema pode ir mandando para o mestre 'comece a preparar uma
briga' e depois 'agora comece a briga'."

- **~~Entre dois momentos do arco não havia forma nenhuma.~~** RESOLVIDO.
  O arco é a camada mais lenta que existe — seis momentos ao longo de uma
  vida de jogo. Entre dois deles cabem cinquenta turnos, e esses cinquenta
  turnos não tinham ritmo: o mundo se mexia por cadência, o vilão andava
  por calendário, e o resto era o que o jogador quisesse. Uma campanha
  podia passar quinze turnos sem nada e depois três lutas seguidas, **e
  nenhuma peça do sistema estava errada**.

### A onda é a fórmula, e ela é fixa

```
respiro → semente → subida → véspera → CLÍMAX → preço → respiro…
          ↑ "comece a preparar"          ↑ "agora"
```

Ela não escolhe o que acontece — garante que sempre haja **ar antes da
pancada e conta depois dela**. Um jogo que só sobe cansa; um que nunca
sobe não é jogo.

**A véspera é a peça que importa.** Um turno só, e o mais importante dos
seis: é a última chance de o jogador escolher COMO encontra o que vem.
Sem ela o clímax é emboscada do sistema — e emboscada do sistema é a
diferença entre um jogo difícil e um jogo injusto.

**O respiro é mudo.** Mandar "agora descanse" é o sistema atrapalhando
exatamente o movimento que existe para ele calar.

### O assunto é o que é sorteado

**36 assuntos em seis famílias** — a luta, os laços, o enigma, o mundo, a
perda, o poder. Cada um com os **cinco tempos**: o que plantar, como
aperta, a véspera, o que acontece e o que fica. O assunto é escolhido na
semente e carregado até o preço, e é daí que vem o efeito pedido: o
sistema avisa cedo, o Mestre prepara o terreno, e quando a coisa acontece
ela parece que estava vindo desde sempre. Porque estava.

### A promessa, medida em 600 turnos

| medida | resultado |
|---|---|
| clímaxes | 52 |
| turnos de respiro | 154 |
| menor vão entre clímaxes | **8** (nunca colados) |
| maior vão entre clímaxes | **15** (nunca entedia) |
| clímaxes com semente antes | 52/52 |
| clímaxes com véspera antes | 52/52 |
| assuntos distintos | 28 |
| famílias repetidas coladas | 0 |

### As travas

- **A onda ESPERA** em combate, masmorra e viagem: um clímax de compasso
  disparando dentro de uma luta que o jogador já está travando são duas
  cenas grandes no mesmo turno, e a segunda apaga a primeira.
- **A forma do Bibliotecário cede a vez** quando o compasso fala. Não por
  hierarquia: o envelope do compasso já diz do que a cena trata e em que
  tempo, e uma forma por cima seria duas instruções de composição para a
  mesma cena.
- **Ao prompt sobe só a TENSÃO**, nunca o movimento nem o assunto. Uma IA
  que sabe que está na "véspera" escreve véspera; uma que sabe que a
  tensão é alta escreve uma cena tensa, que é o que se queria. Mesma
  régua do nome da etapa na v9.84.

### Duas armadilhas de ferramenta, e a segunda foi pior

Um id com cedilha (`caçada`) escapou de novo — segundo caso depois de
`ciume_de_ofício`. A suíte agora cobra ASCII em todo id.

E ao consertar uma asserção pelo shell, o `\b` da regex virou um
**backspace literal** (0x08). A regex parou de casar qualquer coisa e a
asserção **passou por estar vazia** — que é pior que falhar, porque uma
falha aparece e um teste oco não. Regex com `\b` não passa mais por
`node -e` no shell: vai por arquivo.

### O que fica aberto

- **O compasso não conhece a geografia fina.** Ele sabe se estou em
  cidade, estrada ou masmorra, mas não a que distância está o que ele
  quer usar — um assunto de cerco pode germinar na véspera de eu partir.
  O pedido mencionava isso e ficou por fazer.
- **A onda não conversa com o vilão.** O passo dele e o clímax do
  compasso podem cair no mesmo turno; nada os coordena.

## As vozes do narrador — v9.92

"Modos de narrador. Podemos ter o narrador épico, que criará histórias
como Senhor dos Anéis e Harry Potter; o narrador taverneiro, tipo Vox
Machina e Mighty Nein; o que cria histórias tipo Frieren. Essas narrações
não ficam apenas em modo de narrar, mas sim em tons e expressões — o
taverneiro fala palavrões e gírias."

**Oito vozes**, escolhidas na criação do mundo:

```
⚔ Épico          grave, largo e antigo — o mundo pesa mais que o herói
🍺 Taverneiro     solto, sujo e falado — ninguém está impressionado
🍂 Contemplativo  calmo, terno e sem pressa — o pequeno é que é grande
🕯 Sombrio        frio, concreto e paciente — o mundo não quer o herói aqui
🎭 Picaresco      leve e cheio de gente — o mundo é engraçado porque é gente demais
📜 Cronista       sóbrio e factual — conta como quem viu, não como quem sente
🔥 Febril         intenso e acelerado — tudo é agora, e agora é grande
🌙 Fábula         encantado e cruel — o mundo tem regras, e elas se cumprem
```

**O que a voz NÃO toca — e é o que a torna barata:** nada da estrutura. O
arco é o mesmo, o compasso é o mesmo, o vilão nasce igual, o Bibliotecário
escolhe as mesmas formas. Trocar de voz não muda **uma** decisão do
sistema. É por isso que dá para ter oito sem multiplicar o jogo por oito.

**O que ela toca**, e é mais que "estilo": o tamanho da frase, o que se
descreve e o que se corta, o quanto cabe palavrão, como as pessoas se
tratam, e de onde vem a graça. Cada voz tem **seis campos** — o que faz, o
erro característico dela, o ritmo do período, o léxico, a fonte do humor,
e uma frase de exemplo no registro certo. O exemplo é a metade que faz as
outras funcionarem: voz é a coisa que a IA mais erra por falta de amostra.

O palavrão foi o exemplo do pedido e é a prova de que as vozes diferem de
verdade: o taverneiro tem *"palavrão à vontade quando cabe no
personagem"*; o épico, *"ninguém xinga: a raiva sai por gesto"*; a fábula,
*"sem palavrão — aqui as palavras têm poder e ninguém as gasta à toa"*.

### O orçamento foi pago, e o compasso pagou

O bloco da voz custa ~1.500 caracteres em todo turno. Ele foi pago com o
que a v9.91 tornou obsoleto:

- **`RITMO E VARIEDADE NARRATIVA`** (−671) — quatro linhas mandando a IA
  "alternar conscientemente entre os elementos", "não repetir o loop de
  urgências" e "plantar pistas 5-10 cenas antes de um twist". É
  exatamente o que o compasso faz agora, e a IA fazia **cego**, sem ver a
  curva. Ficaram dois maestros, e o do prompt regia de olhos fechados.
- **`DESFECHOS TÊM PESO`** (−355) — a metade que dizia "não ressuscite a
  mesma ameaça" virou código: o vilão derrubado não volta (v9.83), o
  capítulo fecha (v9.84) e o seguinte nasce por herança em vez de ser o
  mesmo reciclado (v9.90).
- **`ESTILO`** (−142) e o teto de palavras (−90) — o primeiro dizia como
  narrar, que agora é da voz; o segundo mandava a IA adivinhar quando o
  momento é grande, e o compasso manda a tensão em todo turno.

**Teto 81.289 · cena comum 58.934**, abaixo do fio de 59.000.

### O que fica aberto

- **A voz não pode ser trocada depois.** Ela é escolhida na criação e
  fica. Trocar no meio é barato tecnicamente (é um campo de `mundo`), mas
  não há tela para isso — e um capítulo novo seria o momento natural de
  oferecer a troca.
- **A voz não conversa com o compasso.** Um clímax na voz contemplativa e
  um respiro na voz febril são os dois momentos em que a voz e o ritmo
  puxam para lados opostos, e nada os concilia hoje.

## O Mestre passa a saber ONDE — v9.93

"A questão da localização e geografia o mestre tem que saber: ele sabe
onde o player está e onde os personagens estão."

- **~~O compasso não conhecia a geografia.~~** RESOLVIDO — e era do pedido
  original, deixado por fazer na v9.91. O buraco era concreto: um assunto
  de **cerco** germinava numa aldeia de cinquenta almas que não tem porta
  para fechar, e um **reencontro** podia ser escolhido com a única pessoa
  conhecida da campanha sentada na minha frente.

  Nos dois casos o Mestre pedia ao narrador uma cena que o mundo não
  comporta — e a IA **não tem como recusar**, então ela inventa o portão.
  É a forma mais silenciosa de pedir invenção que existe neste jogo.

  O mapa sempre soube (porte, região, rotas com dias) e o registro de
  gente sempre soube quem está aqui e quem não está. O que faltava era o
  Mestre **perguntar antes de decidir**.

  Quatro campos: `porte`, `gentePorPerto`, `genteLonge`, `diasAteVizinha`.
  E dez assuntos passaram a consultá-los — cerco, revolta, escassez,
  praga, lei nova, sucessão e festa pedem tamanho; reencontro pede alguém
  que **não** esteja aqui; despedida pede alguém que esteja; descoberta de
  caminho pede que haja para onde ir.

  **Porte desconhecido não passa.** Num save antigo ou fora de cidade,
  afirmar que há portão é justamente o que se quer evitar: o lado seguro
  de uma lacuna é o silêncio, nunca a permissão.

  Medido: a aldeia isolada dá `romance`, `cacada`, `briga_de_rua`; a
  cidade dá `cerco`, `casa_perdida`, `impostor`. E a aldeia continua com
  17 assuntos — a régua não esvaziou o lugar pequeno.

- **~~A onda não conversava com o vilão.~~** RESOLVIDO. O passo dele e o
  clímax do compasso podiam cair no mesmo turno, e nada os coordenava — o
  **mesmo** defeito que `segurar` já resolvia para combate, masmorra e
  viagem, só que ninguém tinha ligado o vilão nele.

  E ele ganha sempre: a onda é cíclica e pode esperar um turno sem perder
  nada; o passo do vilão acontece uma vez a cada seis dias de campanha.
  Adiar o raro para não atropelar o frequente seria trocar a peça grande
  pela pequena. O turno não se perde — ele volta ao contador.

- **~~A voz não podia ser trocada depois.~~** RESOLVIDO, e num lugar só: o
  painel do capítulo novo. É o único ponto da campanha em que trocar a
  boca não soa como o narrador tendo uma crise no meio de uma frase —
  entre um epílogo e uma abertura. Trocar é trocar **um campo** de
  `mundo`; o prompt inteiro se remonta na chamada seguinte porque
  `vozPrompt` lê dali. Sem estado novo.

### E a garantia de leitor pegou o autor dela

Eu acrescentei **seis** campos de geografia. Quatro acharam uso na hora;
`bioma` e `longeDeCasa` entraram "por completude", nenhum assunto os
consultava, e a garantia de leitor os flagrou no mesmo minuto — a mesma
doença que passei a sessão inteira caçando, agora no meu próprio código
novo.

Foram **removidos**. Forçar um `quando` para justificá-los seria escrever
uma regra que serve à tabela em vez de servir à cena. Quando um assunto
precisar de bioma, são três linhas — e o checador cobra o leitor na hora
em que ele nascer.

A garantia também aprendeu duas coisas verdadeiras: que a entrega pode vir
por **spread** de um segundo montador (`lugarDaMesa`), e que `assuntos.js`
também **lê** a situação. Nenhuma das duas afrouxa nada — ela continua
exigindo que todo campo normalizado seja entregue e todo campo entregue
seja lido, e passou a enxergar as duas pontas que existem de verdade.

### O que fica aberto

- **Capital e cidade são a mesma coisa** para a régua: nenhum assunto
  distingue as duas pontas de cima da escada, e uma corte tem histórias
  que um burgo não tem.
- **O bioma não entra em nada.** Um assunto de deserto, de gelo ou de
  pântano teria material próprio, e o mapa já guarda o campo.

## A corte e o chão — v9.94

Duas ampliações puras. **55 assuntos** agora, contra 36 na v9.91.

- **~~Capital e cidade eram a mesma coisa.~~** RESOLVIDO. A régua do porte
  tratava tudo de "cidade" para cima igual, e o que muda numa capital não
  é o tamanho: é que existe um **lugar onde as decisões são tomadas**, e
  gente cuja vida inteira é chegar perto dele.

  Cinco assuntos que só a capital tem: a **audiência** (a antessala, a
  fila, o que custa furá-la), a **intriga de corte** (duas facções sendo
  simpáticas de graça), o **julgamento público** (onde o que decide não é
  a verdade), a **embaixada** (gente de fora com costumes que aqui
  ofendem, e ninguém pode dizer nada) e a **guerra de guildas** — esta no
  degrau de baixo, porque já existe onde há ofícios organizados.

- **~~O bioma não entrava em nada.~~** RESOLVIDO, e a história dele é a
  prova de que a catraca funciona nos dois sentidos: `bioma` foi
  **removido** da situação na v9.93 por ter nascido sem leitor, e **volta
  agora** porque quatorze regras o consultam. É assim que um campo entra
  nesta casa — quando alguém precisa dele, nunca por completude.

  Cada bioma ganhou a sua propriedade dramática, não uma paisagem
  diferente para a mesma cena:

  | bioma | o que só ele tem |
  |---|---|
  | deserto | a **sede**; a **tempestade** que apaga o caminho e desenterra o que estava embaixo |
  | gelo | o **degelo** — o que o gelo guardava; o **frio** obrigando a escolher quem entra no calor |
  | pântano | a **febre** da água parada; **o que afundou** e voltou |
  | floresta | a **mata que repara em mim** (regras que se cumprem sem discutir); o **incêndio** |
  | montanha | o **passo que fecha**, e cada lado fica do seu lado |
  | costa | a **maré** cobrando a hora de quem não a respeitou; **o que veio dar na praia** |
  | planície | **o que se vê chegando** com um dia de antecedência — o campo aberto não mente; a **colheita** |
  | colina | **o outro lado da lomba**, que já estava assim há dias |

  Medido: os oito biomas ficam entre **8% e 13%** do sorteio. Nenhum é
  decorativo e nenhum domina.

  **Bioma vazio não abre nada do chão** — num save antigo ou numa cena sem
  lugar, afirmar que há deserto é o mesmo erro do portão inventado numa
  aldeia.

### Um homógrafo custou uma rodada

A suíte reprovou dois assuntos corretos por causa de **"cobre"**: ela
procurava o imperativo de *cobrar* (mandar a IA cobrar do jogador) e
casou com a terceira pessoa de *cobrir* — "a hospitalidade cobre", "a
regra não cobre esse caso". O guarda passou a pedir o **objeto** ("cobre
me", "cobre moeda", "cobre PV"), que é onde o risco real mora, e o
envelope do preço já proíbe a coisa por escrito de qualquer modo.

É primo do `\b` que já mordeu esta casa cinco vezes: a diferença entre
casar uma palavra e casar um pedaço de outra.

### O que fica aberto

- **A corte não tem assunto de laço próprio.** Casamento arranjado,
  refém-hóspede e afilhado político são material de capital que ficou de
  fora — a família `laco` só ganhou a intriga.
- **O bioma não conversa com o porte.** Uma capital no gelo e uma aldeia
  no gelo abrem os mesmos assuntos de chão, e uma corte que depende de
  degelo para comer é outra história.

## Os laços em muitas formas — v9.95

"Romance é importante nas histórias, até nas mais sombrias — daí depende
do romance né, um romance mais sombrio ou mais besteirol dependendo da
história."

- **~~Havia UM romance.~~** RESOLVIDO. Ele tinha uma forma só — a
  convivência, o interesse, a declaração — e saía igual em toda campanha.

  E a observação do pedido é a que aponta o conserto certo: um romance
  sombrio e um besteirol **não são o mesmo assunto narrado com outra
  voz**. São formas diferentes, com semente, véspera e sobretudo **preço**
  diferentes. A voz muda o timbre; ela não inventa o leque.

  A família dos laços foi de 9 para **19**. Sete formas de romance —
  o romance lento, a **paixão imprudente**, o **amor do lado errado**, o
  **amor antigo** (alguém que eu já amei, e a vida dela seguiu), **alguém
  me quer e eu não**, o **triângulo**, o **casamento-contrato** — e mais o
  aprendiz, o padrinho, o refém-hóspede, o inimigo que preciso ao meu lado.

- **~~A corte não tinha laço próprio.~~** RESOLVIDO, era a pendência da
  v9.94: **casamento arranjado** (cidade), **refém-hóspede** e **intriga
  de corte** (capital), **afilhado político** (cidade + fama).

- **~~O bioma não conversava com o porte.~~** RESOLVIDO, a outra
  pendência. Uma capital no gelo e uma aldeia no gelo abriam os mesmos
  assuntos de chão, e não são a mesma coisa: **um povoado sobrevive ao
  lugar; uma cidade depende dele em escala — e essa dependência é
  política.** O **porto** (costa + cidade), a **política da água** (deserto
  + vila), a **cidade que come de fora** (gelo/montanha/deserto + cidade),
  o **entreposto** que vive do pedágio (montanha/colina + vila + haver
  para onde ir).

### Quem separa as leves das duras não é a voz — é a estrutura

Medido, com a mesma cena em três pontos da campanha:

| onde | laços abertos |
|---|---|
| começo, aldeia | **8** — romance, amizade, paixão súbita, rivalidade, aprendiz |
| meio, cidade | **16** — a traição na frente; abrem amor proibido, amor antigo, casamento-contrato |
| fim, capital | **19** — todos, com refém-hóspede, intriga de corte e inimigo útil |

Um amor que custa caro **precisa de campanha por baixo para custar**. E as
leves estão lá desde o primeiro dia: um jogo em que só se pode amar depois
da metade é um jogo sem juventude.

### O terceiro homógrafo

A suíte reprovou um assunto correto por procurar a palavra "voz": o
`julgamento` diz *"o que passa a ser dito em voz baixa"* — fala, não o
sistema de vozes. Antes disso foram **"role"** dentro de *controle* e
**"cobre"** de *cobrir*.

A lição virou regra: **um teste de acoplamento procura o acoplamento, não
a palavra.** Agora ele verifica que nenhum `quando` lê a voz e que nenhum
texto manda narrar num modo — as duas coisas que de fato quebrariam a
divisão, e nenhuma delas confundível com português comum.

### O que fica aberto

- **69 assuntos e a família `mundo` empatou com `laco` em 19.** As duas
  estão no teto do que a suíte permite (35% do acervo). Crescer qualquer
  uma das duas agora exige crescer as outras junto.
- **Nenhum laço termina.** Há sementes de romance, de rivalidade e de
  dívida, e nenhuma forma de um laço **acabar** por desgaste — só a
  despedida, que é ida embora. Um relacionamento que azeda sem ninguém
  trair é material que falta.

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
