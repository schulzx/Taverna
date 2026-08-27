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

## O fim dos laços, e as famílias magras — v9.96

Duas pendências que se resolviam juntas, e é por isso que foram feitas
juntas: **os laços que terminam pertencem à família `perda`** — que era
exatamente onde havia espaço.

- **~~Nenhum laço terminava.~~** RESOLVIDO. Havia semente de romance, de
  rivalidade e de dívida, e nenhuma forma de um laço acabar **por
  desgaste** — só a despedida, que é ida embora. Um relacionamento que
  azeda sem ninguém trair é a coisa mais comum que existe entre pessoas, e
  o jogo não tinha uma linha sobre ela.

  Seis formas: o **esfriamento** (ninguém falta a nada; só ninguém procura
  mais), a **briga que não repara** (os dois com razão, e a frase que não
  dá para desdizer), **cada um virou outra coisa**, a **decepção** (vi uma
  mesquinharia e não desvejo), o **amor que termina** *sem grito, sem
  culpado e sem cena*, e **alguém que já não precisa de mim**.

  Nenhuma delas depende de antagonista, e nenhuma culpa ninguém — é o
  ponto inteiro. E todas terminam **sem reconciliação e sem ruptura**, que
  é o que as separa da despedida e o que faz doer.

  **Um laço não acaba antes de existir.** Medido: no começo da campanha a
  presença delas é **0%**; do meio em diante, 8–9%. Um "amor que termina"
  no dia 3 é um amor que a IA teria de inventar inteiro para poder
  terminar.

- **~~`mundo` e `laco` no teto.~~** RESOLVIDO. As duas estavam em 27% do
  acervo com a suíte permitindo 35%, e crescer qualquer uma exigia crescer
  as outras junto. Então as outras cresceram:

  | família | antes | agora |
  |---|---|---|
  | laço | 19 | 19 |
  | mundo | 19 | 19 |
  | enigma | 10 | **14** |
  | luta | 7 | **13** |
  | perda | 7 | **13** |
  | poder | 7 | **12** |

  **90 assuntos**, a maior família em **21%**, e a distância entre a maior
  e a menor caiu para 7. O teto deixou de apertar.

  A luta ganhou o **torneio**, a questão do **vencido**, o **bicho** (não
  um monstro: assustado antes de bravo), o **assaltante que eu conheço**,
  o treino que passa do ponto e a **ordem de matar**. O poder ganhou **meu
  nome agindo sem mim**, o **pedido impossível**, **delegar**, **o que eu
  já não posso fazer** e **o peso que só eu carrego**. O enigma ganhou a
  **versão que mudou**, o **mapa que não bate com o chão**, **alguém já
  sabia** e a **resposta que já tinha sido dita**.

  Na prática: o repertório de uma cena vai de **33 formas** no começo da
  campanha a **67** no fim.

### O quarto falso positivo da mesma família

A suíte reprovou `amor_que_acaba` por procurar a palavra "culpado" — e o
texto dizia *"acaba sem grito, **sem culpado** e sem cena"*. Era a
negação.

Antes: **"role"** dentro de *controle*, **"cobre"** de *cobrir*, **"voz"**
como fala. Quatro numa sessão, e a lição geral vale para todo teste desta
casa:

> **Um texto que PROÍBE uma coisa contém a palavra dessa coisa.** Procurar
> a palavra reprova exatamente a linha que faz a coisa certa.

É a mesma raiz do `\b` que já mordeu esta casa cinco vezes: casar um
pedaço em vez de casar a coisa.

### O que fica aberto

- **Nenhum laço se conserta.** Agora eles nascem e acabam, e não há forma
  de um voltar — a reaproximação depois do esfriamento, o perdão depois da
  decepção. É o par que falta.
- **Os fins não sabem de quem falam.** O sistema escolhe "um amor que
  termina" sem saber se há um casal registrado nesta campanha; a trava é
  `precisa: "gente"`, que só garante que existe alguém. Um campo de
  RELAÇÃO no registro de gente — quem é próximo de quem — resolveria, e
  serviria a muito mais que isto.

## O laço vira registro, e a onda sabe de quem fala — v9.97

As duas pendências eram a mesma peça vista de dois lados, e por isso
saíram juntas.

- **~~Os fins não sabiam de quem falavam.~~** RESOLVIDO. O sistema
  escolhia "um amor que termina" sem saber se havia um casal registrado: a
  trava era `precisa: "gente"`, que só garante que existe **alguém**. Com
  ela, o Mestre mandava terminar um amor que nunca começou — e a IA tinha
  de inventá-lo inteiro só para poder acabá-lo.

  O registro de gente ganhou **`laco`**: tipo (amizade, amor, rivalidade,
  dívida, aprendizado), força de 1 a 3, o dia em que começou, e se está
  rompido. `relacao` continua respondendo "de que lado essa pessoa está",
  que é pergunta de facção; `laco` responde **o que ela é de mim**, que é
  outra coisa — dá para ser aliado de quem não se conhece e inimigo de
  quem se amou.

- **~~E a onda não sabia de quem falava.~~** RESOLVIDO na mesma peça, e
  esta é a que mais muda a mesa. O envelope dizia *"ponha alguém no meu
  caminho"* e a IA escolhia — **e escolhia gente nova, porque inventar é
  mais fácil que lembrar.**

  Agora a SEMENTE escolhe um NOME do elenco que já existe, a onda o carrega
  até o preço, e todo envelope termina com *"e é com Marta: esta pessoa já
  existe nesta campanha e é dela que se trata, do começo ao fim desta
  história"*.

  E **só quem pede pessoa recebe nome**: um achado de documento e uma
  tentação de poder ficam sem, porque enfiar gente numa cena que não pede
  gente é o mesmo defeito com o sinal trocado.

- **~~Nenhum laço se consertava.~~** RESOLVIDO. A **reaproximação** (um
  diz alguma coisa que não é um pedido de desculpas, e o outro aceita como
  se fosse), o **perdão** (ela diz por que fez, e o motivo não a inocenta)
  e o **reconhecimento tardio** (eu julguei errado, e ela sabia e não se
  defendeu). Todos exigem um laço **rompido** — reatar sem ter rompido
  seria um laço nascendo do nada.

  E **quem reata não reata onde parou**: a força volta um degrau abaixo,
  porque fingir que nada aconteceu apagaria o que aconteceu.

### O círculo, medido

Trezentos turnos com três pessoas no elenco produziram, sozinhos, esta
relação:

```
amizade         → Marta: amizade, força 1
briga_que_fica  → Marta: rompido
rivalidade      → Marta: vira rivalidade
```

Três atos que nenhuma linha de código escreveu — saíram da onda, do
registro e do tempo. E só **3 de 26** clímaxes levaram nome: os outros 23
não falavam de ninguém, e corretamente.

### A garantia de leitor chegou aos laços

Todo tipo **exigido** tem de ter quem o **crie**, e todo tipo criado tem
de existir no catálogo. Foi o que pegou **"proteção"**, que viveu dez
minutos nesta versão: exigido por um assunto, criado por nenhum. O fim
daquele assunto virou o do **aprendizado**, que é o certo — o aprendiz que
supera o mestre.

### Quatro campos meus nasceram sem leitor nesta sessão

`bioma` e `longeDeCasa` (v9.93), `lacosDePe` e `contarLacos` (esta). Todos
apagados pela catraca no minuto seguinte. O padrão é meu e vale registrar:
**ao construir infraestrutura eu escrevo a API "completa", e a catraca vai
aparando o que ninguém pediu.** É exatamente o trabalho dela — e `bioma`
voltou na v9.94 quando catorze regras passaram a precisar dele.

### O que fica aberto

- **O laço não sobe ao prompt.** O Mestre sabe que Marta é um amor
  rompido; a IA não — ela só recebe o nome no envelope. Uma linha no
  resumo de gente ("Marta: amor, rompido no dia 40") custaria pouco e
  daria à narração o que hoje só o sistema enxerga.
- **Rivalidade e dívida não terminam.** São firmadas e nunca exigidas: os
  fins cobrem amizade, amor e aprendizado. Uma rivalidade que se resolve
  — no respeito ou no sangue — é material que falta.
- **O laço é sempre com o herói.** Não há laço entre dois NPCs, e é o que
  faria o mundo ter vida própria: dois nomes do registro que são alguma
  coisa um do outro, sem mim no meio.

## O laço sobe ao prompt, e passa a existir sem mim — v9.98

- **~~O laço não subia ao prompt.~~** RESOLVIDO. O Mestre sabia que Marta
  era um amor rompido; a IA não — ela só recebia o nome dentro do envelope
  da onda, e só no turno em que a onda falava. Fora dali, para a narração,
  **Marta era uma ferreira qualquer.**

  Custa uma expressão por pessoa no resumo de gente:

  ```
  • Marta (ferreira) — ROMPEU comigo (era amor, no dia 40)
  • Ubba (batedor) — amizade comigo, e é profunda · rivalidade com Lucan
  • Lucan (escriba) — dívida comigo · rivalidade com Ubba
  ```

- **~~Rivalidade e dívida não terminavam.~~** RESOLVIDO. Eram firmadas e
  nunca exigidas: nasciam e ficavam para sempre. O **fim da rivalidade**
  (por respeito ganho, por cansaço, ou porque um dos dois já não tem o que
  provar) e a **dívida que se acerta** — e o acerto não fica redondo para
  nenhum dos dois.

- **~~O laço era sempre com o herói.~~** RESOLVIDO, e é o que faz o mundo
  ter vida própria. Numa campanha só com `laco`, todo mundo existe em
  relação ao herói e mais ninguém tem história — **é a razão pela qual
  mundos de RPG parecem um teatro que só se monta quando o protagonista
  entra.**

  `entre` é o que a pessoa é dos OUTROS. As duas pontas andam juntas:
  guardar só de um lado é ter meia relação, e a metade que falta é a que
  ninguém lembra de olhar.

  Quatro assuntos novos nomeiam **duas** pessoas — *dois que não se
  suportam*, *dois que se procuram*, *uma conta entre dois conhecidos
  meus* — e um exige o par pronto: *os dois querem que eu escolha*. O
  envelope diz *"e é ENTRE Ubba e Lucan […] eu estou por perto, não no
  meio"*, e proíbe me pôr como causa.

### O que 400 turnos produziram sozinhos

```
paixao_subita     · Lucan → amor
amor_que_acaba    · Lucan rompe
romance           · Marta → amor
amor_que_acaba    · Marta rompe
perdao            · Lucan reata
dois_que_se_devem · Vaska ↔ Lucan (dívida)
perdao            · Marta reata
```

Duas relações inteiras com o herói, cada uma com nascimento, ruptura e
reconciliação — e uma dívida entre duas pessoas do elenco que não passa
por ele.

### A régua das famílias virou média

`laco` chegou a 26% e a minha régua era "abaixo de 25%" — um número que eu
escolhi de olho e que passou a reprovar por um ponto percentual. Mover o
alvo seria trapaça; mantê-lo seria deixar uma medida sem significado
governar o conteúdo.

Com seis famílias a média é 16,7%, e o que interessa é a **distância até
ela**: nenhuma pode valer o dobro da média (aí manda no sorteio) nem menos
da metade (aí não existe na prática).

### O que fica aberto

- **Os laços entre dois não terminam.** Uma rivalidade entre Ubba e Lucan
  nasce e fica: `firmaEntre` existe, `rompeEntre` não.
- **O elenco da onda é só quem está na cena.** Um par pode ser semeado
  entre duas pessoas presentes e depois nunca mais ser tocado se elas se
  separarem — o registro guarda, mas nada volta a puxá-lo.

## A partida de prova — v9.98

Uma campanha jogada do zero, com um Mestre falso no lugar da IA, para ver
os sistemas trabalhando de verdade. Voz escolhida: **Sombrio**.

### O que se viu em jogo

O prompt chegou com as duas peças novas: `A SUA VOZ — SOMBRIO` e a linha
do ritmo, que muda a cada movimento da onda. E a onda rodou inteira,
três vezes:

```
0  PREPARAÇÃO   "há alguma coisa se formando ao fundo, e ninguém deu por ela"
1  APERTA       "a coisa aperta, e dá para agir contra"
2  A FORMA      ← o Bibliotecário preenche o turno em que o compasso cala
3  O MUNDO RESPONDE + CUSTO + TESTE
4  A UM PASSO   "está a um passo de acontecer"
5  AGORA        "está acontecendo"
6  O MUNDO SE MEXE + O QUE FICOU
7  —            ← o respiro, mudo, como projetado
8  A FORMA
10 PREPARAÇÃO   ← a segunda onda começa
```

Também apareceram, sem serem procurados: `SEM TESTE — DECISÃO DO SISTEMA`
(a concessão do governador do dado), `DESTINO NÃO RECONHECIDO` (o
resolver recusando em vez de inventar), e a interceptação de "escuto a
mesa ao lado" como teste de Percepção.

Os quatro NPCs registrados durante a partida chegaram ao prompt na hora,
com papel, relação e lugar.

### O que NÃO deu para exercitar com um Mestre falso

- **O sistema de laços.** Ele precisa de um clímax de assunto que peça
  pessoa, e no dia 1 quase todos estão fechados por `momento` — 23% do
  acervo pede pessoa, e a maioria desses exige campanha por baixo. Foi
  verificado por simulação direta dos módulos (400 turnos, duas relações
  inteiras com nascimento, ruptura e reconciliação, mais uma dívida entre
  dois NPCs).
- **O vilão e o capítulo.** Andam por dia de campanha; a partida cobriu
  uma manhã.

### Uma coisa que a partida provou e eu não tinha certeza

`elencoDaCena` recebe NPCs cujo `local` a IA preenche livremente — e na
partida ela pôs `local: "aqui"`, que não é nome de cidade nenhuma. O
elenco resolve isso para **"aqui, paradeiro não registrado"**, que é o
lado seguro: o laço encontra candidatos em vez de nunca disparar. Era o
único ponto em que a cadeia inteira poderia falhar em silêncio.

### O que a partida deixou anotado

- **Uma sessão longa é difícil de dirigir por fora.** Testes de dado
  param o turno e exigem dois cliques (`Rolar`, depois `Continuar`), e um
  laço de automação que não os trate trava sem erro nenhum. Não é defeito
  do jogo — é nota para a próxima vez que alguém for testar assim.

## O acampamento, e o que só se arruma nele — v9.99

Quatro coisas relatadas de uma vez, e três delas eram a mesma: o
acampamento existia como botão e não como lugar.

### Quem escolhe onde se dorme

Era a IA. `localDeDescanso` sabia responder dentro de uma cidade — sede,
casa da facção, refúgio aliado, estalagem — e fora dos muros devolvia
"acampamento em campo aberto", que não é um lugar: é a ausência de um.
Dali para a frente quem inventava a clareira, a gruta ou o afloramento de
rocha era o Mestre, cena a cena, sem nada com que estar em desacordo — e
por isso o mesmo herói dormia três noites seguidas em três mundos.

`acampamento.js` (v9.99) escolhe o sítio pelo que o sistema já sabia:
bioma da região, perna da estrada, meio da viagem, masmorra, lugar
nomeado dos arredores. **49 sítios**, entre 4 e 5 por bioma nos oito
biomas, mais masmorra, estrada, embarcado e comboio. Ordem de decisão: o
mais específico ganha — masmorra > lugar nomeado > viagem > cidade >
campo aberto.

Cada sítio carrega a **chave** do contexto que o gerou, e é isso que faz
levantar acampamento e montar de novo cinco minutos depois devolver o
mesmo afloramento de rocha. Só quando a chave muda o sorteio roda de novo.

E o `meio` da viagem passa a decidir se há chão embaixo: quem viaja de
navio dorme a bordo, quem viaja de caravana dorme no círculo de carroças.
Antes havia uma instrução em maiúsculas proibindo a estalagem — proibir o
errado não é o mesmo que dizer o certo.

### A terceira porta

O acampamento era de mão única: entrava-se para dormir e só se saía
dormindo. Como ele é também o único lugar onde se arruma o que se leva,
uma troca de magia custava uma noite inteira de mundo — e regra impagável
é regra que o jogador contorna. **Sair sem descansar** custa 20 minutos
de relógio, não cura nada, e o envelope diz à IA que não houve noite.

### O que só se arruma no acampamento

O relato: "as habilidades estão sendo preparadas fora do acampamento, e
ainda pior, no meio da batalha dá pra preparar magias".

A segunda é a que quebra o jogo. Se dá para trocar o caderno no meio da
luta, PREPARAR deixa de existir: o jogador esquece a magia certa, abre a
ficha, prepara a magia certa e fecha. O teto de quantas cabem na cabeça
continua valendo e não raciona mais nada, porque o que ele racionava era
a **aposta** — decidir de manhã sem saber o que a tarde traz.

A v9.33 tinha um bom motivo para pôr o caderno na ficha (o jogador
procurou lá e não achou) e concluiu que "preparar fora do descanso não
quebra nada". Quebrava: só não quebrava enquanto ninguém tentasse fazer
isso durante uma briga.

`podeArrumar` mora num lugar só e é lida por três: o caderno, a sintonia
e a tela. O painel **fica** na ficha — achar onde se arruma continua
valendo —, mas fora do acampamento ele mostra e não deixa mexer, dizendo
por quê e para onde ir. E a função recusa também, porque botão
desabilitado é sugestão e função que recusa é regra.

### A forja que morria ao abrir

`undefined is not an object evaluating 'ae.essencia'`. A v9.82 acrescentou
`unico` a `RARIDADES` e deliberadamente não o acrescentou a
`CUSTO_FORJA` — forjar a única peça do mundo seria fabricá-la. Mas a tela
percorria `RARIDADES` e lia `CUSTO_FORJA[rar].essencia`: na sexta volta o
custo era `undefined` e o painel inteiro caía. Não era o botão do único
que quebrava — era a forja.

A regra morava num só dos dois caminhos, que é como quase todo bug desta
casa nasce. Agora existe `RARIDADES_FORJAVEIS`, derivada da tabela de
custos, e a tela lê dali.

### De quebra: o bioma num lugar só

A mesma busca estava copiada em quatro lugares, e as quatro cópias tinham
o mesmo furo — fora de cidade devolviam "planicie". Quem forrageava no
meio de um pântano colhia flor de planície. `biomaDaqui()` responde por
todas, e em viagem usa o bioma da cidade de onde se partiu.

### Verificado na tela

- A forja abre com cinco raridades (Comum→Lendário), sem o único e sem erro.
- O acampamento montado num lugar nomeado: "dentro do Escudo das Velas",
  com a contração certa, e o envelope proibindo a volta à cidade.
- Sair sem descansar: 12:29 → 12:49, sem cura, com o envelope
  `[FIM DO ACAMPAMENTO — SEM DESCANSO]` no prompt.
- Um Mago fora do acampamento: as três magias visíveis, cinzas, travadas,
  com "🔒 isso se arruma no acampamento".
- O mesmo Mago acampado: botões vivos, 1/2 → 2/2 ao preparar.
- O mesmo Mago em combate: travados, com "🔒 no meio da luta não se
  arruma nada". Forçando o clique com o `disabled` removido, o contador
  não se move — a função recusa.

### Anotado para depois

- **Equipar não é gatilhado por nada.** Dá para vestir armadura completa
  no meio da luta. É a mesma família do caderno, mas o remendo certo não
  é proibir: é custar ação, e isso mexe na economia de turno.
- **O sítio não tem consequência.** Ele diz ONDE e só. Dormir exposto num
  ermo hostil e dormir numa gruta seca valem o mesmo — de propósito, por
  ora: um campo sem leitor seria mais uma regra escrita sem código atrás.

## O abrigo ganha leitor, e o corpo volta a ser corpo — v9.100

As duas coisas que a v9.99 deixou anotadas, fechadas.

### O sítio deixa de ser só um nome

A anotação era: "o sítio diz ONDE e só — dormir exposto num ermo e dormir
numa gruta seca valem o mesmo". Um campo sem ninguém que o leia é mais
uma regra escrita sem código atrás, e por isso o `abrigo` só entrou agora,
junto com quem o lê.

Os **49 sítios** declaram um dos três degraus — **ao relento** (20),
**sob algum teto** (28), **cama de verdade** (1 a bordo, mais as cidades)
— e o degrau move os **dados de vida** da noite inteira um para cada
lado. Os dados são o único recurso do jogo que só volta dormindo, e por
isso são o único em que dormir mal pode significar alguma coisa.

O meio da régua é o comportamento anterior, exatamente: metade dos dados,
como sempre foi. Quem dorme numa gruta continua onde estava. Quem chega à
estalagem ganha um; quem dorme na chuva perde um. Um dado é pouco de
propósito — não é para tornar o ermo impossível, é para que "aguento mais
meio dia de estrada e durmo com teto" volte a ser uma pergunta.

**E o piso e o teto engolem a régua com frequência.** No nível 1 há um
dado só; com quase tudo inteiro, o dado a mais não tem onde entrar. Isso
virou o problema interessante desta versão: o painel do acampamento
promete ANTES do clique e o descanso cumpre DEPOIS, e a primeira versão
repetia a fórmula nos dois lugares — duas fórmulas que divergiriam na
primeira mudança, e que já mentiam na primeira noite. `dadosQueVoltam`
passou a ser o único lugar onde a conta existe, com três leitores (o
descanso que aplica, a linha que anuncia, o painel que promete), e ela
devolve `valeu`: o ajuste que **sobrou** depois do piso e do teto. É o
único número que se pode mostrar sem prometer o que não vem — um número
que mente uma vez deixa de ser lido para sempre.

### O corpo volta a ser corpo

A outra anotação: dava para vestir armadura completa no meio da luta.

O remendo não foi proibir de equipar. Esta casa decidiu na v9.13 que
abrir a bolsa não custa o turno, e desmanchar uma decisão boa por causa
de outra seria trocar um problema por dois. O remendo é o **relógio**:
uma rodada tem seis segundos, e o que não cabe em seis segundos não cabe
numa rodada.

```
arma      1s   empunhar é um gesto de mão            → livre na luta
anel      2s   um anel entra num dedo                → livre na luta
amuleto   3s   passa pela cabeça e pronto            → livre na luta
escudo   60s   as correias passam pelo braço         → só fora da luta
elmo     60s   a fivela é debaixo do queixo          → só fora da luta
botas   120s   é preciso sentar e calçar             → só fora da luta
armadura 600s  as fivelas são nas costas             → só fora da luta
```

Não é regra nova: é a régua do 5e (arma é interação de objeto, armadura
leva minutos), escrita em segundos porque em segundos ela se explica
sozinha ao jogador. Vale para tirar tanto quanto para pôr — quem não
consegue afivelar no meio da briga também não consegue arrancar —, e vale
para o companheiro, que tem o mesmo corpo e a mesma rodada. Fora de
combate, tudo livre como sempre foi.

### De quebra: a contração que só conhecia o artigo definido

Apareceu na tela: **"Você monta acampamento uma estalagem em Forte do
Vigia"**. O `nome` de um sítio é uma continuação de frase e o mapa devolve
um sintagma com artigo indefinido; `comEm` (v9.39) só sabia contrair "a"
e "o". Agora sabe *em+uma=numa* e *em+um=num*, com "as" antes de "a" e
"uma" antes de "um" na ordem dos testes — senão o prefixo curto casa
primeiro e come a palavra errada.

`comDe` ficou de fora de propósito: "duma estalagem" é português correto
e não é o português que se fala nesta mesa.

E o único texto do mapa que já começa com a palavra que a frase acabou de
dizer — "acampamento na região" — perde a repetição em vez de ganhar
preposição.

### Verificado na tela

- Save antigo, acampado antes desta versão: o painel não mostra sítio
  nenhum e a noite rende o padrão. O caminho seguro é o que roda.
- Estalagem em Forte do Vigia, nível 8, 6 de 8 dados gastos: o painel
  prometeu "a noite inteira devolve um dado a mais" e a noite entregou
  **+5 (7/8)**, com a linha "🛏 cama de verdade: um dado de vida a mais
  de volta". Com o abrigo neutro (a taverna), nenhuma linha — não havia o
  que anunciar.
- Em combate, com quatro relíquias na mochila: **arma e amuleto entraram**;
  **elmo e armadura foram recusados**, cada um com a sua frase.

### Anotado para depois

- **O escudo é o caso duvidoso.** No 5e ele custa uma AÇÃO, não minutos;
  aqui ele caiu entre os que levam tempo, porque não existe caminho para
  gastar a ação a partir da ficha e inventar um contradiria a v9.13. Se
  um dia a economia de ação ganhar uma porta pela interface, o escudo é o
  primeiro que deve mudar de lado.
- **A cama de verdade é quase só da cidade.** Dos 49 sítios da tabela só
  a cabine do navio dá o degrau 2; todo o resto vem do mapa. É o desenho
  — o ermo não deveria ter hotel —, mas se um dia houver um refúgio
  construído pelo jogador, é ali que o terceiro degrau precisa aparecer
  fora dos muros.

# O MESTRE COMPLETO — segunda passada

*Duas perguntas novas: acabar com o resumo, e interpretar o vilão e os
aliados como sistemas vivos. As duas mudam o desenho — e uma delas o
melhora bastante.*

---

## PERGUNTA 1 — o resumo ainda é necessário?

### A conta, com números medidos

A campanha de prova tem 118 turnos e 37.147 caracteres de histórico —
mas ela foi jogada com um Narrador de mentira, e as narrações tinham 315
caracteres. Uma narração de verdade tem entre 1.200 e 2.000. Projetando
com 1.700 por turno (narração + ação do jogador):

| campanha | histórico completo | prompt total | cabe? |
|---|---|---|---|
| 100 turnos | ~170 mil chars (~47k tokens) | ~64k tokens | sim |
| 250 turnos | ~425 mil (~118k tokens) | ~135k | no limite |
| 500 turnos | ~850 mil (~235k tokens) | ~252k | **não** |

**O histórico completo funciona nos primeiros cento e cinquenta turnos e
quebra depois.** É o pior tipo de desenho: passa em todo teste e falha
exatamente na campanha que o jogador passou meses construindo.

E há um custo que não aparece na conta: contexto muito longo degrada
obediência. O prompt já carrega 17 mil tokens de regra; enterrá-los sob
oitenta mil tokens de narrativa é competir com a própria instrução.

### Mas a intuição por trás da pergunta está certa

Três coisas diferentes estão hoje embrulhadas na palavra "resumo":

1. **O CÂNONE** — fatos imutáveis que não podem ser contraditos. Isso
   **não é resumo**, é tabela de fatos, e continua.
2. **O LIVRO** — 220 palavras escritas por IA a cada 8 turnos, custando
   uma chamada. **Este é o que deve morrer**, e por uma razão nova: quase
   tudo o que ele resume virou dado estruturado. Registro de pessoas com
   laço, relógios, missões, fase do arco, plano do vilão, marcas,
   confidências, tentativas, descobertas, fama, lugares visitados. O
   livro está reescrevendo em prosa o que o sistema já sabe em campo.
3. **O HISTÓRICO BRUTO** — os últimos 18 turnos. Curto demais, e fica
   melhor quando o livro sair.

### O que entra no lugar: O REGISTRO, e dois leitores

Não é resumir nem mandar tudo. É a terceira coisa, e é o padrão do
conselho aplicado à memória.

**O REGISTRO** guarda UMA LINHA por turno, escrita por código a partir do
que o Mestre já sabia naquele instante:

```
turno 23 · no Escudo das Velas · Marta, Ubba · assunto: dívida
         · menti sobre de onde vim · peso 3 · viu: Marta
```

Quem estava (`elencoDaCena`), onde (`lugar`), de que tratava
(`compasso`), o que aconteceu (o veredicto, o brilho, o custo) e quanto
pesou — o sistema já tem os cinco no momento em que o turno acontece.
Nenhuma chamada de IA. ~120 caracteres por turno.

**E ele poda por PESO, não por idade.** O turno em que você matou alguém
fica para sempre; o turno em que você foi ao mercado sai em uma semana. É
como a memória funciona, e é computável.

Dois leitores em cima da mesma tabela:

- **O ARQUIVISTA** responde *"esta cena é com Marta, aqui, sobre dívida —
  o que já aconteceu que importa?"* e devolve três ou quatro linhas. Não
  resume: **recupera**. Custo fixo no prompt, para sempre — uma campanha
  de mil turnos entrega as mesmas quatro linhas.
- **O COBRADOR** responde *"o que o mundo ainda não cobrou?"* — é a
  Memória do Mundo da primeira passada, e agora tem onde morar.

### Veredicto

**Não mandar tudo. Matar o livro. Construir o Registro.**

De quebra: com o livro fora (~1.000 chars e uma chamada de IA a cada 8
turnos), dá para subir a janela de histórico bruto de 18 para ~30 turnos
sem custo líquido. O passado recente fica mais vivo e o passado remoto
passa a ser recuperado com precisão em vez de resumido com perda.

---

## PERGUNTA 2 — o Sistema Vilão e o Sistema Aliado

**As duas ideias são boas e melhoram o desenho.** Elas expõem uma
distinção que a primeira passada não tinha:

> **CONSELHEIRO** responde uma pergunta sobre a cena.
> **AGENTE** É alguém, e responde "o que EU faço".

O Bibliotecário é conselheiro. O vilão não pode ser: ele tem vontade,
tem plano, tem informação incompleta e age quando ninguém está olhando.
Isso é outra categoria, e tratá-la como catálogo de cena seria espremer a
coisa errada no molde certo.

---

### O SISTEMA VILÃO — "o vilão que sabe"

`vilao.js` já tem o PLANO: arquétipos, 9 passos, heranças, marcas,
alvos, quedas. O que falta é a CABEÇA.

#### 1. O que ele sabe — e o que ele NÃO sabe

A peça central, e a que a pergunta acertou em cheio. Um livro-razão do
que chegou até ele:

```
o quê · como chegou (viu · marca contou · boato · fama) · quando · certeza
```

As fontes já existem: as **marcas** do plano são ouvidos, a **fama** é o
que corre sozinho, as **confidências** dizem quem sabe o quê, o Registro
diz o que foi público.

**E o que ele não sabe é tão importante quanto.** Um vilão que sabe tudo
é dispositivo de enredo, não personagem. O sistema tem de guardar as duas
listas.

#### 2. A leitura — que pode estar ERRADA

~30 `LEITURAS` com `quando` sobre o estado de informação dele mais o
arquétipo: *"conclui que você trabalha para o outro lado"*, *"conclui que
você é comprável"*, *"conclui que você ainda não é ameaça"*.

**A melhor parte é a leitura errada.** Um vilão que te interpreta mal é
dramaticamente muito mais rico que um que acerta — e o erro é
*computável*, porque é função de informação incompleta. Nenhuma outra
peça do jogo consegue produzir isso.

#### 3. A resposta — ~50 movimentos

Não são os passos do plano; são as REAÇÕES. Testar, comprar, isolar,
assustar, imitar, presentear, ignorar de propósito (que é uma resposta),
mandar alguém, aparecer.

#### 4. O CORPO DO VILÃO — a ideia que muda mais coisa

A observação de que "um vilão pode ser um grupo de dragões ou um deus"
não é detalhe de sabor: muda a mecânica inteira.

| corpo | plano anda | matar "o vilão" | confronto é |
|---|---|---|---|
| **pessoa** | ritmo normal | acaba | uma cena |
| **conselho** | mais devagar (precisam concordar) | um cai, os outros seguem | política — e um pode debandar |
| **bando** | mais rápido e mais cru | a cabeça cai, o bando continua | vários confrontos |
| **deus / coisa** | por sinais, não por passos | não se mata assim | um rito, não uma luta |
| **instituição** | por regra e papel | não tem quem matar | um processo |

Isso resolve um limite silencioso de hoje: `podeCair` e `envelopeDaQueda`
assumem que o vilão é uma pessoa que morre. Com CORPO, a queda passa a
ter cinco formas, e a estrutura de capítulos (`historia.js`) ganha finais
que ela não conseguia escrever.

#### 5. A cadência

Um vilão que fala todo turno é praga. Ele age pelo relógio (já existe:
`DIAS_POR_PASSO = 6`) **mais** uma cadência de reação quando o herói faz
algo que chega até ele. E às vezes a resposta certa é o silêncio, que
tem de ser um movimento explícito do acervo — senão nunca acontece.

---

### O SISTEMA ALIADO — "quem anda comigo quer alguma coisa"

Hoje: `companheiros.js` infere classe e decide o turno de luta.
`vinculos.js` guarda um número. Fora do combate, o aliado é móvel.

#### 1. A vontade própria

~40 `VONTADES DE ALIADO` com etapas — pequenas, três passos, não nove:
achar alguém, pagar uma dívida, evitar uma cidade, provar uma coisa,
chegar a um lugar antes de uma data, proteger o herói de algo que ele não
sabe.

**E ela avança ou apodrece sozinha.** Se o herói nunca ajuda, resolve-se
mal — e é isso que faz a vontade ser real em vez de decorativa.

#### 2. A opinião, e o CÓDIGO

Não é número: é posição. ~50 `OPINIÕES` com `quando` sobre (o que o
herói fez, o código dessa pessoa, o vínculo). E cada aliado carrega duas
ou três coisas em que acredita — o **código**, que é a versão de aliado
das *linhas que não se cruzam*.

#### 3. O atrito entre aliados

**Já existe e está pronto:** o `entre` de `npcs.js` (v9.98) grava
relações entre dois NPCs nas duas pontas, e `assuntos.js` já tem quatro
assuntos que pedem duas pessoas. Dois aliados com uma rivalidade produzem
cena sem o herói no meio — que era exatamente o que aquele sistema foi
construído para permitir e ainda não tinha quem usasse.

#### 4. A hora de falar — o problema mais difícil

Um aliado que comenta todo turno é insuportável. A regra: ele fala quando
(a) toca a vontade dele, (b) cruza o código dele, (c) a onda está no
respiro, ou (d) faz N turnos que ele não fala e aconteceu algo.

**Teto duro: um aliado por turno.** Sem isso, quatro companheiros viram
quatro linhas de Pauta e a cena vira assembleia.

#### 5. A partida

Um aliado pode ir embora — vínculo no fundo, ou o código cruzado vezes
demais. **Tem de ser possível, senão as opiniões não valem nada.**

---

## A ESTRUTURA COMPLETA, revisada

### Três categorias, e agora elas têm nome

**CONSELHEIROS** — respondem uma pergunta sobre a cena (7)

| | responde | estado |
|---|---|---|
| Bibliotecário | que forma esta cena tem | ✅ 191 jogadas |
| Compasso | de que trata agora, e em que batida | ✅ 99 assuntos |
| Mestre da Mesa | o ritmo: temperatura, pilar, concessão | ✅ |
| Oráculo | sim/não sobre o mundo, e a iniciativa dele | ✅ |
| Árbitro | qual teste, quão difícil, o que custa falhar | ✅ 31 desafios |
| **Geógrafo** | onde, o que o lugar permite, o que é impossível | ⬜ |
| **Intérprete** | o que a gente em cena faz | ⬜ ~120 movimentos |

**AGENTES** — SÃO alguém, e respondem "o que eu faço" (3, todos novos)

| | é | tem de próprio |
|---|---|---|
| **Sistema Vilão** | o antagonista | plano, informação, leitura (que erra), corpo, cadência |
| **Sistema Aliado** | quem anda comigo | vontade com etapas, código, opinião, atrito, partida |
| **Adversário** | a oposição descartável de uma luta | intenção, prioridade de alvo, condição de quebra |

**REGISTROS** — guardam e devolvem (1 tabela, 2 leitores)

| | |
|---|---|
| **O Registro** | uma linha por turno; poda por peso, não por idade |
| ↳ Arquivista | "o que já aconteceu aqui, com essa gente, sobre isso" |
| ↳ Cobrador | "o que o mundo ainda não cobrou" |

**CRIAÇÃO** — decide uma vez e vira cânone (1)

| | |
|---|---|
| Léxico | como o mundo se chama e como ele funciona | ✅ |

**A ESPINHA**

| | |
|---|---|
| **A Pauta do Turno** | tudo o que o Mestre decidiu, em ordem, com orçamento |

---

## A ORDEM — FEITA (v9.101 → v9.112)

```
 1. B1   lugares e criaturas do léxico     v9.101-103   lexico.js
 2. A1   GEÓGRAFO + PAUTA                  v9.104       geografo.js · pauta.js
 3. R    O REGISTRO + Arquivista           v9.105       registro.js  (matou o livro)
 4. A2   INTÉRPRETE                        v9.106       interprete.js
 5. V    SISTEMA VILÃO                     v9.107       antagonista.js
 6. AL   SISTEMA ALIADO                    v9.108       aliado.js
 7. B2   raças pelo léxico                 v9.109       duas colunas
 8. A3   ADVERSÁRIO                        v9.110       adversario.js
 9. B3   equipamento pela FORMA            v9.111       17 formas · tudo ou nada
10. C    COBRADOR                          v9.112       cobrador.js  (o mundo lembra)
```

**O que sobrou de fora, e de propósito:** B4, as habilidades. O nome de
uma habilidade é IDENTIFICADOR em quinze lugares — `estaPreparada`,
`concedidaPorItem`, recarga, custo, combos, o caderno, e o Mestre
mandando `[HABILIDADE] Bola de Fogo`. O desenho existe (duas colunas,
mais tabela de tradução no prompt e busca reversa), é caro em prompt,
cria superfície de falha nova, e o ganho é menor que o do equipamento:
o jogador lê o nome de uma magia muito menos vezes do que lê o nome do
lugar onde está.

### O que as dez ensinaram, e que não está na lista de commits

**A CATRACA pagou o aluguel dela cinco vezes.** Campos órfãos em quatro
etapas — `euGanhei`/`euPerdi`/`noite` (Intérprete), `nivel` (Vilão),
quatro do contexto do ato (Aliado), quatro do estado da luta
(Adversário). Todos com o mesmo sintoma: a condição vira falsa para
sempre e ninguém percebe.

**A REDE virou peça obrigatória.** Três agentes nasceram mudos na cena
mais comum do jogo, porque nenhuma entrada do acervo batia. Todo acervo
novo termina em entradas de peso baixo que sempre servem, e todo teste
novo varre o espaço de situações procurando silêncio.

**O ESCOPO de um campo é parte do campo.** `poupei` da campanha e
`poupei` deste ato se chamam igual e querem coisas diferentes: o Aliado
pergunta quem você é, o Cobrador pergunta o que você fez naquele dia.
Passar um pelo outro produziu "a família de quem caiu aparece — por
poupei o último e mandei embora".

**O QUE O TESTE NÃO PEGA, a prova pega.** Duas partidas simuladas — 60
dias de campanha e 10 mil itens gerados — acharam repetição de forma,
truncagem no meio da palavra, plural irregular e um elmo classificado
como armadura leve. Nenhuma teria falhado um teste unitário.

**O TETO DE PROMPT é uma decisão, não um número.** Ele foi estourado
uma vez (etapa 8, por 100 caracteres) e o conserto não foi mover o
guarda: foi pôr o DESCANSO atrás de `!emCombate`, porque o código já
recusava descansar na luta e a regra morava só num dos dois lados.
Pior cena real: 78.945 (etapa 6) → 79.505 (etapa 10), com quatro
sistemas novos dentro.

**Por que o Registro subiu para o terceiro lugar:** ele responde a
pergunta 1, apaga uma chamada de IA a cada 8 turnos, e é de onde o Vilão
tira o que ele sabe e o Cobrador tira o que ele cobra. Construir o Vilão
antes seria construí-lo cego.

---

## O QUE ISSO CUSTA NA PAUTA, e como não estourar

Cada peça nova quer espaço. O orçamento, por linha:

```
ONDE        ~120   Geógrafo
QUEM        ~120   elenco (já existe)
MOMENTO     ~110   Compasso (já existe)
FORMA       ~130   Bibliotecário (já existe)
A GENTE     ~90 × até 3 presentes = 270   Intérprete
O ALIADO    ~90 × 1 (teto duro)           Sistema Aliado
O VILÃO     ~110   só quando ele age ou reage
ANTES       ~90 × até 3                   Arquivista
ACABOU DE   ~80    (já existe)
NÃO PODE    ~120   vetos reunidos
```

Teto proposto: **1.400 caracteres**, cortando por prioridade como o
léxico já faz. Hoje os envelopes somam algo próximo disso sem teto
nenhum — a Pauta não é gasto novo, é o primeiro controle.

---

## OS RISCOS NOVOS

**1. O vilão onisciente.** É a falha mais provável do Sistema Vilão, e a
defesa tem de ser estrutural: o que ele NÃO sabe é uma lista guardada, e
todo movimento dele precisa citar por qual fonte a informação chegou.
Sem essa exigência, o acervo vai derivar para "ele simplesmente sabe".

**2. O aliado tagarela.** Teto de um por turno, cadência própria, e o
silêncio como movimento explícito.

**3. O Registro inchar o save.** 1.000 turnos × 120 chars = 120 KB, num
save que já esbarra na cota do navegador. A poda por peso é obrigatória
desde o primeiro dia, não depois.

**4. Quatro sorteios por turno.** Geógrafo, Intérprete, Aliado e Vilão
sorteando no mesmo turno é superfície nova para dessincronizar semente —
o bug do continente da v9.102 em quatro cópias. Cada agente precisa do
próprio gerador derivado, e isso vira teste.

**5. A soma virar assembleia.** Dez sistemas escrevendo na mesma Pauta
pode produzir um turno em que tudo acontece ao mesmo tempo. A defesa é a
cadência POR SISTEMA — cada um com o próprio direito de falar, como o
Bibliotecário já tem — e a prioridade no corte.

# O MESTRE COMPLETO — desenho da estrutura definitiva

*Revisão de 68 módulos, 1.610 regras exportadas e os 55 blocos de prompt.
Escrito antes de qualquer código.*

---

## 1. O padrão que já existe, e que ainda não tinha nome

O Bibliotecário não é um módulo especial. Ele é uma FORMA, e essa forma já
foi construída cinco vezes nesta casa sem nunca ter sido nomeada. Nomeá-la
é o que permite repeti-la de propósito.

**O CONSELHEIRO tem seis peças:**

| peça | o que é | exemplo no Bibliotecário |
|---|---|---|
| **acervo** | catálogo de opções, cada uma com condição legível por máquina | 191 `JOGADAS` com `quando(situacao)` |
| **situação** | um retrato normalizado que o acervo sabe ler | `garantirSituacao` — 31 campos |
| **vetos** | o que NUNCA pode ser proposto, e que falha FECHADO | `VETOS` (veto quebrado corta, não passa) |
| **afinidades** | o que a situação torna mais provável — multiplicativo, com piso e teto | 9 `AFINIDADES`, produto travado em [0.2, 6] |
| **memória** | não repetir | `NAO_REPETIR = 8`, `NAO_REPETIR_GESTO = 3` |
| **envelope** | a resposta entregue como FATO, não como sugestão | `envelopeDaCena` |

E uma sétima peça que só alguns têm, e que é a que separa um conselheiro
bom de um barulhento: a **cadência** — de quanto em quanto tempo ele tem
direito de falar. O Bibliotecário fala de 2 em 2 turnos numa mesa fria e
nunca numa mesa em brasa.

### Os cinco conselheiros que já existem

| conselheiro | arquivo | responde | acervo |
|---|---|---|---|
| **Bibliotecário** | `estante.js` + `biblioteca.js` | que FORMA esta cena tem | 191 jogadas · 22 gestos · 9 escolas |
| **Compasso** | `assuntos.js` + `compasso.js` | de que a história trata AGORA e em que batida está | 99 assuntos · 6 famílias · 6 movimentos |
| **Mestre da Mesa** | `mestria.js` | o RITMO: temperatura, pilar faminto, concessão, brilho, aviso | 4 temperaturas · 3 pilares · 6 fios |
| **Oráculo** | `oraculo.js` | SIM ou NÃO sobre o mundo, e a iniciativa dele | 6 perguntas do sistema · 6 movimentos do mundo |
| **Árbitro** | `desafios.js` | qual teste, quão difícil, o que a falha custa | 31 desafios · 27 custos · 8 ações rápidas |

Seis mil linhas de conselheiro já construídas. O que segue é o que falta.

### E um conselheiro de outra natureza

O **Léxico** (v9.101) decide UMA VEZ, na criação, e o que ele decide vira
cânone que o código defende. É uma segunda espécie, e vale distinguir as
duas porque elas têm regras diferentes:

- **conselheiro de turno** — barato, frio, roda sempre, nunca chama IA
- **conselheiro de criação** — caro, roda uma vez, pode chamar IA, e o que
  produz é validado e congelado

Quase tudo o que vem abaixo é da primeira espécie.

---

## 2. As três ausências

### AUSÊNCIA 1 — O GEÓGRAFO (o espaço)

**O que existe:** `mapa`, `geografia`, `arredores`, `lugar`, `celulas`,
`viagem`, `comodos`, `toponimia`, `cena`, `grid`, `movimento`,
`masmorras`, `acampamento`. Treze módulos que sabem de espaço.

**O que falta:** uma superfície de consulta, e DOIS julgamentos que hoje
ninguém faz.

1. **O que o lugar PERMITE.** Um corredor não comporta oito inimigos
   flanqueando. Um pântano não comporta uma carga a cavalo. Uma taverna
   cheia não comporta um duelo sem plateia. Hoje quem arbitra isso é a IA,
   e ela arbitra sempre a favor da cena que já tem na cabeça.
2. **O deslocamento impossível.** "Ele acabou de chegar de Monte do Vigia"
   — são dois dias, e passaram-se três horas. É um detector, irmão dos que
   moram em `violacoesDoTurno`.

O "onde está cada um" já existe e funciona: `elencoDaCena` foi visto
rodando na partida de prova.

**Acervo:** ~40 `AFORDÂNCIAS DO ESPAÇO` — cada uma diz o que o tipo de
lugar comporta e o que ele impede, com `quando` sobre (tipo de lugar,
bioma, dentro/fora, quantos cabem, luz, saídas).

---

### AUSÊNCIA 2 — O INTÉRPRETE (a gente)

**A maior de todas, e a que mais muda o jogo.**

Hoje NADA no sistema decide o que uma pessoa FAZ. Confirmado por varredura:
`npcs.js` é registro (quem ela é), `social.js` é a conta da persuasão
(consigo convencê-la), `mundo-base.js` dá `vontade` e `modo` (sabor para
o prompt). O único `comportamento` do código é de BICHO, e é uma palavra
solta.

Quem decide o que Marta faz quando o herói mente na frente dela é a IA,
livre. E é exatamente daí que vem a incoerência que este projeto passou
dois anos combatendo em todas as outras frentes: a ferreira desconfiada
que de repente conta tudo, o guarda subornável que de repente é íntegro, o
amigo que não reage ao que acabou de ver.

**O acervo:** ~120 `MOVIMENTOS DE PESSOA`, em ~10 gestos (esquiva,
aproxima, testa, cobra, protege, entrega, recua, ameaça, oferece, cala).
Cada um com `quando` sobre uma **situação de pessoa** normalizada:

```
quem é       papel, temperamento, o que quer, o que teme
comigo       relação, laço, força do laço, o que me deve, o que eu sei dela
agora        o que acabou de acontecer, quem mais escuta, onde estamos,
             se ela está em perigo, se mentiram para ela, se foi tocada
             no que ela esconde
```

**A peça que só este conselheiro tem: as LINHAS QUE NÃO SE CRUZAM.** Cada
pessoa carrega uma ou duas coisas que ela nunca faz — e isso é um VETO
por pessoa, não por cena. É o que impede a IA de fazer o covarde heroico
porque a cena pediu.

**Os companheiros entram aqui**, e não em módulo próprio: um companheiro é
um NPC que está sempre presente. Ganha peso maior por isso. Hoje eles são
móveis fora do combate — `companheiros.js` dá classe e decisão de luta, e
mais nada.

**A regra que protege a narração** — e ela vale para o conselho inteiro,
mas aqui é vital:

> **O Mestre decide O QUE e COM QUEM. Nunca o COMO.**
>
> O Intérprete diz *"Marta muda de assunto e olha para a porta"*. Ele
> nunca diz *"Marta diz: '…'"*. A fala é do Narrador, sempre.

---

### AUSÊNCIA 3 — O ADVERSÁRIO (a oposição como cena)

`combate.js` sabe a mecânica (`turnoDosInimigos`), `orcamento.js` sabe se
a luta é justa, `emboscada.js` pega a investida. Mas a única coisa que o
sistema sabe sobre a VONTADE do inimigo é `querFugir`.

Um Mestre nunca roda "seis goblins atacam". Ele roda "seis goblins estão
te empurrando para a beira do poço". Essa é a diferença entre um combate e
uma cena, e ela é decidível.

**Acervo:** ~40 `INTENÇÕES DE LUTA`, com `quando` sobre (que criatura,
quantos, terreno, quem está ganhando, há reféns, há saída). Cada uma
dita:

- **o que a oposição quer** — matar, capturar, atrasar, empurrar para
  algum lugar, proteger uma coisa, arrancar uma informação, fugir com algo
- **prioridade de alvo** — o ferido, o conjurador, o que carrega a coisa
- **a condição de quebra** — em que ponto isto desmonta e vira outra coisa

Isso alimenta `turnoDosInimigos` (prioridade de alvo é mecânica) E o
envelope (a intenção é ficção). Duas saídas do mesmo acervo.

---

## 3. A quarta ausência, que não é um conselheiro

### A MEMÓRIA DO MUNDO (o livro-razão)

`consequencias.js` é só o preço de uma falha crítica. `fama`, `reino`,
`decretos`, `correio` reagem cada um na sua pista. Nada responde:

> **"O herói fez X há três dias. O que o mundo faz sobre isso AGORA?"**

Isto não é um acervo com `quando` — é um **livro-razão**. Cada ato
notável vira uma linha:

```
o quê · quando · onde · quem viu · peso · já cobrado?
```

E um conselheiro pequeno em cima dele decide quando o mundo cobra, e por
qual das ~30 formas de cobrança (o boato que volta torto, o parente que
aparece, a conta que chega, a porta que se fecha, o presente de quem
lembrou).

As peças já existem espalhadas: `contadores`, `confidencias`,
`tentativas`, `descobertas`, as `marcas` do vilão, `fatos` do oráculo.
O que falta é o registro único e o cobrador.

---

## 4. A PAUTA DO TURNO — o que amarra tudo

Hoje o Mestre fala em envelopes soltos, empilhados em `notaRef`. Funciona,
está testado, e não escala: cada conselheiro novo empilha mais um.

A **Pauta** é a mesma informação, ordenada e única — e é a forma literal do
que foi pedido: *"o mestre passa os pontos e o narrador liga"*.

```
[PAUTA DO TURNO 41]
ONDE      no Escudo das Velas, dentro de Forte do Vigia. Chove.
          O lugar comporta: conversa baixa, saída pelos fundos. Não comporta: correria.
QUEM      Marta (ferreira · rompeu comigo) · Ubba (amizade profunda)
MOMENTO   subida da onda — "a dívida que se acerta", com Ubba
FORMA     uma confidência ao pé do balcão
A GENTE   Marta muda de assunto se tocarem no irmão
          Ubba se põe entre mim e a porta
ACABOU DE falhei em escutar (Percepção 11 vs 13)
NÃO PODE  ninguém sabe da carta · Cedric está a dois dias daqui
```

**Por que ela vem cedo e não no fim:** três conselheiros novos, cada um
escrevendo o próprio envelope, e depois um refactor juntando os três — é
fazer o trabalho duas vezes. A Pauta nasce junto do primeiro conselheiro
novo e os outros já nascem dentro dela.

**Por que ela não é só cosmética:** ela dá o único lugar onde se pode
ORÇAR o que o Mestre diz por turno. Hoje não há teto para envelopes
empilhados. Com a Pauta há — e ela corta por prioridade, como o léxico já
faz.

---

## 5. O que eu NÃO transformaria em conselheiro

Um desenho sem espaço negativo é uma lista de desejos. Estes ficam de
fora, e por motivo:

- **A textura sensorial** (cheiro, som, luz). É o ofício do Narrador, e é
  a única coisa que ele faz melhor que qualquer tabela. Um conselheiro
  aqui produziria descrição por catálogo, que é o oposto do que se quer.
- **O diálogo.** Mesma razão, com força dobrada. O Intérprete diz o que a
  pessoa FAZ; a fala é do Narrador.
- **A física fina** (isto pega fogo? o gelo aguenta?). `desafios.js` já
  cobre o que vira teste. O resto é improviso, e improviso é dele.
- **O tempo** — `calendario` + `relogios` já são conselheiros em tudo
  menos no nome.
- **A recompensa** — `loot`, `afixos`, `relicas`, `conquistas` cobrem o
  mecânico; a batida `preço`/`depois` do compasso cobre o dramático.
- **A economia** — `economia.js` + `mercado.js` + `orcamento.js` já
  decidem tudo o que é decidível.

---

## 6. A ordem, e por quê

### Trilha A — os conselheiros

**A1. O GEÓGRAFO + a PAUTA (juntos).**
O menor dos três, o que já foi pedido por nome, e o que reúne dado que já
existe. A Pauta nasce como a entrega DELE — um consumidor só, provado em
jogo, sem refactor de big-bang. Depois os outros adotam.

**A2. O INTÉRPRETE.**
O maior ganho por caractere de prompt gasto, e o acervo mais caro de
escrever (~120 movimentos, na escala do `estante.js`). Faz o mundo parar
de ser um teatro que só se move quando o herói entra.

**A3. O ADVERSÁRIO.**
Depende do Geógrafo (a intenção usa o terreno) e fica muito melhor com o
Intérprete (um inimigo é gente). Por isso é terceiro, não por ser menor.

**A4. A MEMÓRIA DO MUNDO.**
Depende de todos os outros para ter o que cobrar, e é a que fecha o
círculo: o mundo passa a lembrar.

### Trilha B — o léxico continua descendo

Independente da trilha A, e cada item é pequeno:

**B1. Lugares e criaturas.** `locaisDaCidade` e `criaturasDaRegiao`. O
`tipo` é mecânico e fica; só o NOME muda. **Risco zero** — é a taverna e
a capela que aparecem no mapa hoje, num mundo que não tem nenhuma das
duas. Deveria vir logo: é o que resta mais visível.

**B2. Raças jogáveis.** Apelido por cima do mesmo bônus. O card já mostra
o bônus, e não há proficiência envolvida.

**B3. Equipamento pela FORMA.** As três regras já escritas: o nome vem do
formato mecânico e nunca do item; o mapeamento é total, nunca parcial; a
ficha nunca mente. Mais um teste que proíba um nome de um balde aparecer
em outro.

**B4. Habilidades.** Por último, ou nunca — o nome é identificador.

### A ordem que eu tocaria de fato

```
1. B1  lugares e criaturas       (pequeno, visível, risco zero)
2. A1  Geógrafo + Pauta          (a espinha)
3. A2  Intérprete                (o maior ganho)
4. B2  raças                     (pequeno, encaixa no intervalo)
5. A3  Adversário
6. B3  equipamento pela forma
7. A4  Memória do Mundo
```

---

## 7. Os riscos, sem maquiar

**1. O prompt.** Três conselheiros novos querendo espaço é o risco número
um. A cena comum está em 61,4 mil com teto declarado de 62. As defesas:
as PORTAS DA CENA (já existem), a Pauta com orçamento próprio e corte por
prioridade, e a regra de que o Intérprete gasta uma linha POR PESSOA
PRESENTE — não por pessoa registrada.

**2. O Narrador ficar sem nada para fazer.** Se o Mestre decide demais, a
prosa seca. A defesa é a regra do COMO: nenhum conselheiro descreve, nomeia
fala ou escolhe adjetivo. E o bloco LIBERDADE CRIATIVA continua valendo,
com uma linha nova — *quanto mais o envelope diz, mais ousadia cabe dentro
dele*.

**3. O tamanho dos acervos.** `estante.js` tem 1.296 linhas e levou uma
sessão inteira. O Intérprete é dessa escala. Não dá para fazer em meia
hora, e fingir que dá é o que produz catálogo raso.

**4. A garantia de leitor, multiplicada.** Cada conselheiro novo traz
campos novos na situação. A catraca desta casa — todo campo que um
`quando` lê tem de ser normalizado E entregue — passa a valer sobre
quatro situações diferentes. Precisa de um teste que percorra os quatro
acervos e confira campo por campo, como o do Bibliotecário já faz.

**5. Determinismo.** Quatro conselheiros sorteando no mesmo turno é
superfície nova para dessincronizar semente — o bug do continente da
v9.102 em quatro cópias. Cada um precisa do próprio gerador derivado.

## O léxico do mundo — v9.101

O relato: "se eu criar um mundo sobre Solo Leveling e colocar sobre os
caçadores, quase não vão falar sobre isso; o nosso mundo gerado é
genérico".

### Por que era genérico

A causa não era a IA desobedecer — era o sistema. Todo gerador desta casa
já é parametrizado por gênero e resolve num banco:

```js
const ocupacoes = OCUPACOES[g] || OCUPACOES["Fantasia medieval"];
```

`locaisDaCidade`, `genteDoLocal`, `criaturasDaRegiao`, `nomeCidade`,
`pessoaDiversa` — todos fazem isso. **A costura já existia.** O que não
existia era uma sétima entrada: a lista de bancos tem seis e está fechada
em `constantes.js`. A descrição do jogador era o único lugar do sistema
que sabia de caçadores, e chegava ao prompt como uma linha solta enquanto
o sistema despejava ferreiro, taverneiro e capela por cima. A IA obedecia
o sistema acima da descrição — que é exatamente o que ela foi treinada a
fazer aqui.

### As duas metades, e a segunda importa mais

**Vocabulário:** onze palavras que mudam a cor de tudo. Masmorra é
portal, criatura é besta, taverna é sede da guilda. Barato e visível.

**Como as coisas funcionam aqui:** quinze sistemas do código ganham a
forma que têm NESTE mundo. Não é mecânica nova — as salas, o chefe, a
chave e as tochas continuam sendo `masmorras.js`, com os mesmos números.
O que muda é que o Mestre passa a saber que aqui aquilo *se apresenta*
como um portal que se abre sozinho num lugar público e não fecha enquanto
o chefe lá dentro respirar. O sistema é o esqueleto; o léxico é a carne.

### As quatro regras

1. **Palavras, nunca números.** Nada de habilidade, magia, custo, dano,
   dificuldade ou raridade — o catálogo é onde o equilíbrio mora. Um
   léxico que pudesse escrever "rank S dá +5" seria um jailbreak.
2. **Campo a campo, e vazio quer dizer "use o seu".** A validação não
   aceita nem recusa o léxico inteiro: cada campo passa sozinho, e o que
   falha fica vazio. Um mundo com metade do léxico é melhor que um sem
   nenhum, e muito melhor que um que não abre.
3. **O mundo que a obra evoca, não a obra.** Se a descrição citar uma
   história que existe, gera-se as regras e os papéis que ela evoca, com
   nomes próprios novos. O mundo fica do jogador, não é cópia.
4. **Cada adaptação chega na cena que a usa.** Quinze adaptações no
   prompt de toda cena seriam mil e quinhentos caracteres para explicar,
   na taverna, como funciona uma masmorra. Elas viajam pelas PORTAS DA
   CENA que já existiam; só quatro ficam sempre ligadas, porque são o
   mundo e não o momento.

### O orçamento, que foi o problema difícil

O bloco sem limite custava **5.648 caracteres** no pior caso e estourava
os dois tetos do prompt. Um teto por campo não resolveria (quinze
adaptações de 170 já dão 2.550). O que resolve é **teto no total,
preenchido por prioridade**: vocabulário, lei, a adaptação da cena que
está aberta AGORA, e o resto se sobrar. `TETO_DO_BLOCO = 1700`, com a
moldura contada dentro — um orçamento que ignorasse o próprio cabeçalho
estouraria por 350 toda vez.

Resultado medido: **1.659 caracteres no pior caso**, cena comum em 61,4
mil, teto em 83,5 mil.

**E os dois guardas do prompt mudaram, deliberadamente.** O teto subiu de
82 para 85 mil — é a soma sintética de todas as portas abertas ao mesmo
tempo, que nenhuma cena real produz. E a linha "a cena comum continua
ENCOLHENDO" foi **substituída** por uma melhor: *o léxico nunca custa
mais que o orçamento dele*. Aquela media uma tendência, e a tendência era
boa enquanto o que entrava valia menos que o que já estava; deixou de
servir no dia em que entrou algo que vale mais. O que precisa de guarda
daqui para a frente não é o tamanho do prompt — é o custo deste recurso,
que tem orçamento próprio e não pode crescer sozinho.

De quebra, a **economia foi para trás da porta do mercado**: dois mil
caracteres de faixas de preço são âncoras excelentes onde há com quem
negociar e peso morto no fundo de uma masmorra.

### O bug que a partida de teste pegou

A primeira versão passava a resposta pelo `extrairJSON` do jogo — o
leitor de JSON da casa, o caminho óbvio. Só que ele termina em
`sanearResposta`, que devolve exatamente `{narrativa, perigo, rolagem,
mudancas, sugestoes}` e **descarta o resto**. O léxico chegava inteiro do
modelo e era jogado fora em silêncio: a criação não quebrava, nada
avisava, e o mundo saía genérico como antes — que é o caminho de falha
previsto do léxico, e por isso o bug não deixava rastro nenhum.

É a armadilha de sempre desta casa, do outro lado: **reusar um leitor
construído para outro contrato**. O léxico ganhou o seu, com teste.

### Verificado na tela

Campanha criada do zero com a descrição de um mundo de caçadores e
portais, com o Léxico respondido por stub:

- A tela do personagem disse "o seu mundo foi lido" enquanto a ficha era
  montada — a chamada sai ao fim da tela do mundo e não segura ninguém.
- O prompt do primeiro turno trouxe o bloco inteiro: vocabulário, a lei,
  as adaptações de **cidade e mercado** (a cena era urbana), as quatro de
  sempre, as ausências e como se fala. A adaptação da **masmorra não
  estava lá** — a porta estava fechada.
- O elenco pronto veio inteiro deste mundo: *funcionário da Associação,
  curandeiro de guilda, repórter, vendedor de equipamento*; povos *civil,
  caçador desperto, guia*; cidades *Porto Alto, Setor Leste*. **Nenhum
  ferreiro, taverneiro ou escriba em lugar nenhum do prompt.**
- Ao entrar num portal, o envelope chegou na frente:
  `[NESTE MUNDO — O LUGAR PERIGOSO] portais se abrem sozinhos… e não
  fecham enquanto o chefe lá dentro respirar` — e a porta da masmorra
  abriu no prompt do mesmo turno.

### O que FALTA, e é bastante

Esta versão fez o **prompt** e o **povoamento que a IA usa**. A base
gerada por código continua genérica, e é a fase 2:

- **Os NOMES PRÓPRIOS de pessoa.** O ponto mais visível que ficou:
  "Alaric Punho-de-Pedra, vendedor de equipamento" num mundo moderno. O
  léxico não tem campo de nomes, e `nomePessoa` continua lendo o banco do
  gênero. É o primeiro item da fase 2 e o mais barato.
- **As raças jogáveis** na criação do personagem continuam Elfo, Anão,
  Halfling. Elas têm bônus de atributo, então são catálogo — mas nada
  impede um apelido por cima do mesmo bônus.
- **`locaisDaCidade`, `genteDoLocal`, `criaturasDaRegiao`,
  `chefesDoMundo`, `segredosDaCidade`** ainda sorteiam das tabelas
  medievais. É onde mora a taverna e a capela que o jogador vê no mapa.
- **Os nomes das cidades do MAPA** vêm de `geografia.js`, que roda na
  criação e tem gerador próprio (o `cidades` do léxico só alimenta o
  banco que a IA usa para inventar). Precisa da ordem certa: o léxico
  chega antes da ficha, mas o mapa é gerado ao começar.
- **A premissa** — a história pré-moldada. Fica para depois, e não pede
  motor novo: `historia.js`, `vilao.js` e `compasso.js` já sabem tocar
  uma história que se completa; falta semeá-los com o mundo em vez de com
  o genérico.
- **O Geógrafo** — não começou.

## Os nomes próprios são deste mundo — v9.102

O buraco mais visível da v9.101: um mundo de caçadores modernos gerava
**"Alaric Punho-de-Pedra, vendedor de equipamento de caçada"**. Os ofícios
e os povos já vinham do léxico; os nomes continuavam saindo do banco do
gênero, e a incoerência ficava dentro da mesma linha da ficha.

Nome próprio é o campo **mais seguro** do léxico inteiro: não há mecânica
atrás de um nome. Nada no sistema consulta "Aldric" para decidir coisa
nenhuma — o registro de gente é por chave, e a chave é o nome que estiver
lá.

### O que passou a ser do mundo

- **Gente:** primeiros nomes masculinos e femininos, e sobrenomes. Vale
  para o elenco pronto do prompt, para a gente da base de cada cidade,
  para os chefes humanoides e para o dado de nome da criação.
- **Cidades do mapa:** duas listas de partes que se combinam. Oito nomes
  prontos não bastariam — um continente tem vinte e cinco assentamentos e
  eles repetiriam na terceira região. As partes dão centenas.
- **A terra maior:** o continente onde a campanha acontece. Só o
  primeiro: os outros continuam saindo das sílabas, porque um léxico que
  nomeasse continentes que ele não descreveu estaria inventando lugares.

### Tudo ou nada, por banco

Meio banco daqui com meio banco medieval poria "Aldric" ao lado de
"Min-ji" na mesma taverna — pior que qualquer um dos dois puros. Então
`nomesDo` exige os três campos e `partesDeCidade` exige os dois; faltando
um, o banco inteiro cai no genérico.

### Quatro bugs que a medição achou

1. **O molde vencia o léxico, sempre.** `nomeCidade` punha o molde na
   frente com um argumento que soava bem ("uma torre nomeia os degraus
   dela melhor que qualquer outro") e estava errado por um fato: o molde
   PADRÃO traz `NOMES_SUPERFICIE`, que é palavra por palavra o banco
   genérico. O mundo de caçadores nascia com "Monte do Rei". A divisão
   certa é outra — o molde diz a FORMA (topologia, portes, biomas), o
   léxico diz a IDENTIDADE, e identidade ganha de sabor padrão.
2. **O nome do continente pulava o sorteio.** Quando o léxico tinha um
   nome, o `do/while` era saltado — e saltar o sorteio é não consumir o
   gerador, o que desalinha TODA a geração daí para baixo. O mesmo mundo
   nascia com outro número de cidades só por ter ganhado um nome.
   Determinismo por semente se quebra assim.
3. **`pessoaDiversa` nomeava sem o léxico.** Povo e ofício daqui, nome de
   lá — a pior das três combinações, porque a incoerência cabe numa linha
   só.
4. **E `elencoDiverso` re-sorteava o nome depois.** O reequilíbrio de
   gênero chama `nomePessoa` de novo, e essa segunda chamada não recebia
   o léxico. O nome nascia certo e era sobrescrito na linha seguinte. A
   regra morava em dois caminhos e um deles não sabia dela — de novo.

### De quebra: o cardeal sozinho também mente

`nomeMenteSobreOLugar` (v9.55) recusa "Vila do Norte" no sul do mapa. Os
bancos de sempre só produzem a forma com preposição, e por isso a régua
nunca precisou olhar para "Norte" solto. O léxico produz: um mundo urbano
nomeia "Setor Leste" e "Cidade Sul", e a medição achou uma "Sul" no alto
do mapa. As quatro expressões passaram a aceitar a palavra sozinha.

### Verificado na tela

Campanha criada do zero com um mundo de caçadores:

```
ELENCO: Camila Costa (caçador desperto, corretor de essência) ·
        Diego Almeida (guia, repórter) · Yuna Park (caçador rank E) ·
        Ren Silva (civil, repórter) · Rafael Sung (curandeiro de guilda)
MAPA:   Novo Central · Zona Marítima · Bairro Central · Porto Nova …
TERRA:  a Península de Hanbeom
```

Vinte e cinco cidades, nenhuma do banco medieval, nenhum nome de fantasia
no elenco.

---

## O RESKIN DE EQUIPAMENTO — desenho, sem código ainda

A pergunta que abriu isto, e ela é a certa:

> "se ele cria um mundo de Harry Potter ele não vê machado de matar
> dragão, e sim varinha de matar dragão, mas isso ainda ficaria difícil
> de equilibrar pois uma classe que não consegue usar um machado
> conseguiria provavelmente usar uma varinha, e ao ver varinha ele
> acharia que o item realmente fosse uma varinha, mas na verdade o
> sistema vê como um machado"

### O problema tem nome: o apelido cria uma promessa falsa

Um item desta casa carrega três camadas, e só uma delas pode mudar:

1. **A MECÂNICA** — 1d12, duas mãos, marcial, Força, corte. Intocável.
2. **A AFORDÂNCIA** — o que o jogador precisa entender para decidir: é
   pesada, ocupa as duas mãos, pede treino marcial, é corpo a corpo, rola
   em Força. É isto que "varinha" mente sobre.
3. **A APARÊNCIA** — a palavra.

Renomear a camada 3 é seguro. Renomear de um jeito que contradiga a
camada 2 é o desastre que a pergunta descreve.

### A regra que resolve: o nome vem da FORMA, não do item

O léxico **não renomeia itens**. Ele escreve um banco de nomes **por
formato mecânico** — e o formato já existe no código (`CAT_ARMA`,
`CAT_ARMADURA`, `PROPS`, os sete slots). O código sorteia o nome do balde
que corresponde ao que a peça REALMENTE é:

```
marcial · corpo · duas mãos · Força   → "cajado de guerra", "báculo de duelo"
simples · distância · Destreza        → "varinha de arremesso", "pó de fada"
armadura pesada                       → "manto de duelo reforçado"
```

Um machado nunca vira varinha, porque "varinha" mora no balde das armas
leves à distância. E a promessa deixa de ser falsa: um cajado de guerra
PARECE pesado, PARECE de duas mãos, PARECE pedir treino — que é
exatamente o que ele é.

### A segunda regra: o mapeamento é TOTAL, nunca parcial

A tentação seguinte seria dizer "num mundo de Harry Potter não existe
armadura pesada, então não gere". **Isso quebra o balanço:** a defesa do
herói é calculada sobre uma escada de armaduras, e tirar um degrau tira
CA do jogo inteiro.

Então o léxico é OBRIGADO a nomear todos os formatos. Se o mundo parece
não ter armadura pesada, ele tem de inventar o equivalente DELE — "vestes
de duelo encantadas", "manto de aurors". E isso é uma pergunta de
construção de mundo melhor do que a que a gente faria de outro jeito.

Consequência prática: para equipamento, a validação é **tudo ou nada**,
ao contrário do resto do léxico. Um mundo com metade das armas renomeadas
lê como mundo quebrado; um mundo com nenhuma lê como mundo genérico, que
é honesto.

### A terceira regra: a ficha nunca mente

A ficha já mostra a forma ao lado do nome — na partida de teste apareceu
`A Comedora de Reis · ARMA · ÚNICO · 1D6 · FORÇA`. Com o reskin ela
passaria a ser a rede de segurança oficial: o nome é do mundo, a linha
de baixo é do sistema, e ela é obrigatória.

### Onde eu NÃO mexeria: habilidades e classes

Aqui a resposta é diferente, e é um "não" quase categórico. **O nome de
uma habilidade é um IDENTIFICADOR**, não um rótulo:

- `estaPreparada(pers, hab)` casa por `hab.nome`
- `concedidaPorItem` casa `item.concede === hab.nome`
- o Mestre manda `[HABILIDADE] Bola de Fogo` e o sistema procura por nome
- recarga, custo, combos e o caderno todos indexam por nome

Apelidar um identificador é como se troca tudo de lugar sem querer. Se um
dia valer a pena, o desenho seria: **duas colunas** (`nome` canônico,
que o código usa e nunca muda, e `comoSeChama`, que só a tela e a
narração veem), mais uma tabela de tradução no prompt e uma busca reversa
para quando a IA escrever o apelido de volta. É caro em prompt, cria uma
superfície de falha nova, e o ganho é menor que o do equipamento — o
jogador lê o nome de uma magia muito menos vezes do que lê o nome do
lugar onde está.

**Raças** ficam no meio: o bônus é visível no card e não há proficiência
envolvida, então um apelido por cima do mesmo bônus é barato e seguro. É
o candidato natural depois do equipamento.

### A ordem que eu proporia

1. **Lugares e criaturas** (`locaisDaCidade`, `criaturasDaRegiao`) — o
   `tipo` é mecânico e fica; só o NOME muda. Risco zero, e é a taverna e
   a capela que aparecem no mapa hoje.
2. **Raças jogáveis** — apelido por cima do mesmo bônus.
3. **Equipamento pela forma**, com as três regras acima e um teste que
   proíba um nome de um balde aparecer em outro.
4. **Habilidades** — provavelmente nunca, ou por último, e só com as duas
   colunas.

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

## v9.115 — dificuldade, raids, e o diálogo pela metade

### O que ficou provado

- **Dificuldade** em quests e masmorras: quatro patamares relativos, medidos
  contra nível + atributo concentrado + equipamento + grupo, com teto de
  compensação (quem apanha é o herói). O tooltip abre a conta inteira, para o
  jogador saber se falta nível, gente ou espada. Duas portas que discordavam
  passaram a concordar: o mapa anunciava "Poço de Raízes, nível 11" e quem
  entrava recebia uma masmorra feita no nível do herói.
- **Raids**: chamado com 10 a 30 convocados conforme o porte, chefe 6 a 15
  níveis acima, horda em maré, nível mínimo dos dois lados, e a hoste inteira
  no grupo até acabar. A rodada tem FRENTE (massa, resolvida por código) e
  DUELO (o painel de sempre). Cem raids simuladas antes de ligar à tela.

### O diálogo: o que caiu, o que foi consertado, o que falta

Cinco experimentos, ~130 turnos contra a API real. **Caíram**: a voz sozinha,
o tamanho do prompt (87 mil caracteres), o histórico (18 turnos encadeados) e
o vazamento de envelope — nenhuma reproduziu o defeito.

**Consertado e medido**: a voz taverneiro pedia "frase quebrada, fragmento sem
verbo" e "ninguém fala bonito", e a única forma que o modelo tem de falar feio
em português é errar concordância (2,9% → 0%). E o rótulo de sistema na boca de
gente — duas capturas da partida: "— Você quer causar boa impressão" (rótulo de
`desafios.js`) e "— A data chegou" (texto do envelope).

**FECHADO (v9.116), e a hipótese que eu tinha era falsa.** Eu suspeitava do
provedor de reserva: o `/api/mestre` cai do DeepSeek para o Gemini em
silêncio, e os dois rodavam os mesmos números de temperatura e penalidade —
que não são a mesma escala nas duas APIs. Fiz a resposta dizer QUEM estava
na fila e QUEM caiu, e a fila respondeu:

```
fila: ["gemini","deepseek"]   ← o gemini na frente, a pedido
respondeu: deepseek
falharam: gemini (429: "Your prepayment credits are depleted")
```

O reserva está sem crédito. Ou seja: **todo turno que o jogador já jogou foi
servido pelo DeepSeek** — os mesmos ~130 turnos que eu medi. A hipótese
morreu com evidência.

Sobra o que já estava consertado, e a conferência final com o prompt real de
hoje (87.652 caracteres, voz taverneiro) deu **0 de 31 falas com erro de
gramática**, contra 2,9% antes — com o registro inteiro no lugar ("cê", "tá",
"num tem cara de quem vai voltar", palavrão à vontade).

**Um defeito NOVO, e não é de código:** o jogo não tem reserva. Se o DeepSeek
sair do ar ou acabar o crédito, não há Mestre nenhum — o Gemini falha em
todas as tentativas. Recarregar o crédito do Gemini (ou tirar a chave, para
o erro ser honesto) é decisão de quem paga.

## v9.116 — o PODER

Um índice numérico para "quão forte é isto", e ele passou a mandar na
dificuldade no lugar do delta de nível.

- **Os âncoras do pedido são teste**: nível 5 típico dá 414, nível 20 típico
  dá 48,1 mil. Quem mexer num peso e quebrá-los descobre no teste.
- **Base vezes multiplicador**, e não base mais pontos: é o que faz
  equipamento continuar importando no fim do jogo.
- **Tudo o que fortalece tem número**, e há uma varredura que percorre afixos,
  dádivas e 200 itens gerados atrás de efeito sem peso. Zero sem peso, zero
  peso sobrando.
- **Na tela**: o total e a conta aberta na ficha, o valor de cada peça
  equipada, a TROCA na mochila, o poder de cada companheiro comparado ao seu,
  a hoste e o chefe da raid.
- A dificuldade virou DIVISÃO em vez de subtração, e os cortes não se moveram:
  três acima ainda é Fácil, seis abaixo ainda é Difícil.

## v9.117 — as quests passam a ser do Mestre

Três defeitos numa partida real, na mesma missão: "matar três lobos num
lugar que se chamava A Loja do Norte", "quando cheguei os lobos não estavam
lá", "iam me mandando de lugar em lugar e não chegava nunca".

- **O terceiro era estrutural, e é o pior que este projeto já teve.** A
  etapa `derrotar` só CONFERIA se você tinha matado o bicho. Nada, em lugar
  nenhum do código, fazia o bicho aparecer — a missão era um pedido ao
  Narrador para abrir um combate que o prompt o proíbe de abrir. Ele
  obedeceu às duas ordens da única forma possível: pegadas e sombras, para
  sempre. Agora quem entrega é o sistema, e a etapa tem ENDEREÇO.
- **O ninho não é na loja.** O molde da praga recebia `local`, que é o lugar
  de TRABALHO de quem pede. Passou a receber o ermo — os pontos fora dos
  muros, que existiam desde a v9.9 e que nenhum molde tinha lido.
- **O mundo genérico em silêncio.** A leitura do léxico é uma chamada só, no
  instante mais frágil do jogo, e não tinha retentativa. Agora tem duas, e
  se as duas caírem o jogador FICA SABENDO.

E a mudança que o pedido trouxe: **quest é do Mestre, mural é do mundo.** A
trama carrega uma INTENÇÃO tirada da etapa do arco e da fase do vilão — os
sistemas que já sabiam para onde a história ia e que nunca tinham sido
consultados na hora de dar missão. Quando a fase do vilão pede uma batida,
ela é a intenção, e o sorteio não opina. O que acontece no meio (a
emboscada, o encontro, a presa) é executado pelo CÓDIGO. O mural continua
sorteado e opcional; a trama não é.

## v9.118 — o mundo passa a ter endereço

O pedido: coordenadas em tudo, com o Geógrafo por conta das do herói e das
de quem faz parte da história, para que a tela mostre o jogador em tempo
real e o Mestre receba a posição exata em todo turno — não só o nome.

O jogo já tinha posição. O que ele nunca teve foi UMA posição: cada módulo
que falava de espaço inventou o seu jeito de dizer onde, e um mundo com
seis jeitos de dizer "onde" não sabe onde nada está. Três defeitos que
estavam lá dentro, e que só apareceram quando se pôs uma régua entre os
módulos em vez de dentro de cada um:

- **O cinturão mentia por cinquenta vezes.** Um arredor nascia com `dist =
  6 + rnd() * 5` unidades do mapa — de 150 a 275 km — enquanto o mesmo
  registro dizia que aquele moinho ficava a 35 minutos a pé. Duas verdades
  sobre a mesma coisa, e a que o jogador via desenhada era a errada. Agora
  a coordenada é DERIVADA da caminhada e não pode mais discordar dela.
- **O marcador da estrada estava cravado no meio.** `pontoDoHeroi` usava
  fração 0,5 fixa desde a v9.29, com o comentário honesto de que mostrar no
  meio era a leitura honesta de "estou indo" — e era, enquanto ninguém
  media a estrada. Desde a v9.56 a jornada conta minutos andados de minutos
  totais: a tela mentia com um número que o sistema tinha certo do lado.
- **Lugar não tinha ponto nenhum.** "dentro", "arredores" e "perto" são
  três palavras onde devia haver um número — dois lugares "nos arredores"
  podiam estar em lados opostos da cidade e nada sabia disso.

DUAS ESCALAS, e a separação é a decisão de projeto que sustenta o resto:
`x,y` são o pergaminho (unidades de 25 km) e `mx,my` são METROS a partir
dali. Poderiam ser um número só e não podem: doze metros valem 0,00048
unidade, e um float que carrega o continente perde a mesa do canto na
terceira casa. E o que não tem posição devolve `null`, nunca o centro do
mapa — um paradeiro desconhecido no meio do pergaminho fica a uma distância
exata de tudo, e ninguém percebe.

O que a sonda ensinou sobre o ORÇAMENTO, e vale registrar porque foi o
único lugar em que quase se pagou caro: a vizinhança com rumo e distância
custa ~170 caracteres, e pendurada no ONDE (prioridade 1) ela empurrava
para fora, numa cena cheia, a segunda pessoa presente, a FORMA da cena, a
linha do Intérprete e a do Vilão. Quatro coisas que fazem a cena, por três
moinhos aonde ninguém ia. O endereço (17 caracteres) ficou no ONDE; a
vizinhança virou a seção DAQUI, de prioridade baixa, e quem decide se ela
cabe é o orçamento — que decide certo.

E dois achados de tabela, dos que só aparecem quando se mexe:

- O bloco fixo dos ARREDORES repetia, palavra por palavra, as duas regras
  que o envelope já dizia logo abaixo da lista, atrás de uma porta que só
  abre quando o envelope existe: ele nunca apareceu sozinho. Saiu, e pagou
  a linha nova do Geógrafo com troco (cena comum 61.486 → 61.225).
- **Uma porta tem DOIS leitores possíveis nesta casa.** Sem nenhum
  `so("cidade", …)` sobrando, a porta `cidade` parecia abrir para o vazio —
  e quase foi removida. Quem a lê é o LÉXICO, que tem "COMO É UM
  ASSENTAMENTO" pendurado nela desde a v9.101; tirá-la apagaria em silêncio
  a explicação de como uma cidade se apresenta neste mundo. A invariante
  nova mede os dois leitores.

Margem que ficou apertada e vale vigiar: a PIOR CENA REAL está em 79.916 de
um teto de 80.000. O guarda não foi movido.

## v9.119 — o elenco ganha posição, e a quest passa a ser só do Mestre

Duas coisas no mesmo pedido, e a segunda é a que muda o jogo.

**AS PESSOAS TÊM PONTO, E ELE É DERIVADO.** O registro sempre soube o
`local` de cada um ("atrás do balcão do Quintal", "em Rio do Sul"), e local
nunca foi posição: não dava para perguntar quem está perto, para que lado,
nem a quantos dias. O Geógrafo passou a ler esse mesmo texto e devolver
coordenada — e a decisão de não GUARDAR um `coord` na ficha é a lição do
cinturão da v9.118: um segundo fato sobre a mesma pessoa fica velho no
instante em que o Mestre escreve um `local` novo. A leitura tem cinco
degraus, do que sabe mais para o que sabe menos, e o último é `null`:
paradeiro não registrado é uma resposta. O que é palpite ("atrás do
balcão" não nomeia cidade nenhuma — supõe-se aqui) vai marcado como
palpite na tela, porque um chute desenhado como fato é pior que nenhum
desenho.

Isso é da TELA, não do prompt: o Mestre já recebe quem está presente pelo
elenco da cena e quem não chega pelo veto, e nenhum dos dois precisa da
coordenada para dizer o que diz.

**NINGUÉM MAIS OFERECE MISSÃO NUMA CONVERSA.** Havia três fontes de missão
disputando as mesmas oito vagas do diário: a trama do Mestre (v9.117, com a
intenção do arco e a fase do vilão, não opcional), a pessoa que o sistema
escolhia para abordar o herói, e o campo `missao_oferecida`. As duas
últimas eram opcionais, negociadas na cena, e o jogador não tinha como
distinguir o fio da história de um bico de aldeão.

Agora só existe um lugar onde se procura trabalho. Quem quer o herói num
serviço PREGA UM CARTAZ e menciona que pregou; o resto está no mural, em
duas pilhas — o mundo em cima, como sempre, e "Oferecidos a você" embaixo.
Os oferecidos atravessam a renovação do mural: foram pregados por alguém,
não sorteados, e apagá-los num descanso longo seria o mundo esquecer um
pedido que ele mesmo fez.

Na tela, uma linha por trabalho: "Fulano tem um trabalho no mural." As duas
linhas do aviso antigo e o "👤 Fulano entrou para o elenco" saíram.

**A MIGRAÇÃO, e por que ela não é opcional.** O save do jogador tinha TRÊS
missões "oferecida" paradas no diário — exatamente a coisa que saiu de
cena. Deixá-las ali manteria na tela o que se pediu para tirar. Ao
carregar, o que converte vira cartaz na pilha dos oferecidos; o que NÃO
converter fica onde está, com o botão de sempre. É por isso que
`responderOferta`, `envelopeDeAceite` e `envelopeDeRecusa` continuam de pé:
migração que perde alguma coisa em silêncio é pior do que migração nenhuma.

Três coisas saíram por serem repetição, e o orçamento pagou a conta:

- `envelopeDeOferta` — dizia "narre a oferta e PARE, esperando a resposta",
  e ninguém mais faz uma oferta. Regra sem quem a dispare.
- A regra "aceitar e recusar são botões do jogador" no bloco fixo das
  missões: nas únicas vezes em que ainda pode disparar (save antigo), quem
  a diz é o próprio `envelopeDeAceite`, palavra por palavra.
- "Ninguém oferece missão numa conversa" estava escrita nos DOIS blocos, e
  os dois entram pela mesma porta (`missao`) — sempre juntos.

Dois defeitos achados na própria tela, não nos testes: o herói aparecia na
lista "onde está cada um" (o Mestre registra o personagem do jogador no
elenco de vez em quando) contradizendo o ⌖ logo acima; e "Cartazes
disponíveis" ficava com um título e nada embaixo quando o mural só tinha
oferecidos — escondendo justamente o botão de procurar cartazes.

## v9.120 — a abertura, o sobrenome e a segunda cadeira

### A abertura, e a peça mecânica que faltava nela

O pedido de abertura era UMA linha: "apresente o mundo com riqueza, situe
meu personagem numa cena marcante e termine com um gancho". O resultado era
o jogador CAÍDO no mundo — uma taverna bonita, um estranho interessante, e
nenhuma resposta para as duas perguntas que ele de fato tem no primeiro
minuto: que lugar é este, e o que eu vim fazer aqui.

Agora ela tem quatro partes (o mundo e a lei dele · onde estou · quem eu
sou NESTE mundo · o primeiro fio). E a parte que não é texto: **a trama é
forçada na abertura.** O compasso nasce em `respiro` — é o padrão de
`garantirCompasso` — e por isso a primeira cena da campanha era a única em
que o Mestre não tinha intenção nenhuma na mão. A indução começa
justamente ali.

Provado na campanha de teste: o Mestre abriu com a lei do mundo ("todo nome
riscado na parede é uma promessa à montanha"), situou a heroína na praça em
frente à Casa do Sino, disse o que o passado dela significa ali ("vale mais
que pedras — e também fecha portas") e pôs o taverneiro a puxar a trama que
o sistema tinha acabado de criar.

### O sobrenome

Dois campos, porque não servem para a mesma coisa: quem tem intimidade chama
pelo primeiro, quem não tem chama pelo de família — e essa escolha, feita
fala a fala, mostra distância sem ninguém precisar explicar. `nome` continua
sendo o nome INTEIRO, e tem de continuar: cento e poucos lugares deste
código casam pessoa por ele. Na tela: "— Vantel. — Belmiro chama, e o nome
sai estranho, como se ele tivesse ensaiado."

### A segunda cadeira

`sala.js` (a regra) + `transporte.js` (o fio) + a costura no App. O arquivo
da regra é pequeno de propósito: o GRUPO já sabia quase tudo. Um companheiro
decidido por um humano é a mesma peça no tabuleiro, com outra mão em cima —
e é por isso que a mesa coube sem refazer o turno.

Três decisões que vale registrar:

- **Um anfitrião, e ele manda.** Sem servidor não há árbitro neutro: se os
  dois lados calculassem o turno, dois dados decidiriam a mesma rolagem e o
  jogo teria duas verdades sobre o mesmo golpe.
- **A ordem é fixa** — jogador 1, jogador 2, e só então o Mestre. É o que
  permite ao segundo responder ao primeiro dentro do MESMO turno; sem isso
  seriam dois jogos de um jogador se revezando. Provado na tela: "Kael,
  atrás de Íris, não perde o ritmo: — Quanto paga?"
- **O mundo atravessa em `salvar`**, e não no fim do turno: TODO caminho que
  muda o jogo passa por lá (turno, combate, mercado, descanso). Pendurar a
  publicação num só deles deixaria o convidado com uma tela velha nos outros.

**O QUE ESTA VERSÃO NÃO FAZ, e está escrito no arquivo e na tela.** O canal
de hoje é o do NAVEGADOR: duas abas, duas janelas ou dois perfis na MESMA
máquina. Ele não atravessa a internet, e não existe forma de atravessar sem
um terceiro ponto que guarde e repasse — uma função serverless não guarda
estado entre chamadas, e o WebRTC precisa de alguém para apresentar um lado
ao outro. É uma escolha de infraestrutura, e é de quem paga a conta. O que
o desenho garante é que ela custe UM arquivo: sala, cadeiras, ordem das
ações e sincronização do mundo já funcionam por cima da interface do
transporte e foram testados por ela.

Dois defeitos achados na tela e não nos testes:

- **Zulmira do Sino pregou dois cartazes no mesmo turno** — um pelo trabalho
  que o sistema escolheu por ela, outro pelo que o Mestre relatou da cena.
  Títulos diferentes, mesma pessoa. A regra que resolve já estava escrita em
  `ofertas.js` desde a v9.37 ("cada pessoa tem UM trabalho, para sempre");
  faltava valer também para o que a ficção prega.
- **"O ninho de as figueiras"** — a contração era feita à mão no molde e só
  conhecia o artigo "a ". Passou a sair de `comDe`/`comEm`, em `lugar.js`:
  contração é regra do português, não do molde, e cada molde que inventa a
  sua erra num caso diferente.

Margem a vigiar: a soma sintética de todas as portas está em 89.943 de
90.000. A porta `sala` não custa nada a quem joga sozinho — a cena comum
não se moveu (61.225) —, mas o guarda do pior caso ficou no fio.

## v9.121 — a sala atravessa a internet

O que faltava para a mesa de dois sair da mesma máquina era um ponto de
encontro. `api/sala.js` é ele: o lado de lá do transporte, a caixa onde os
recados ficam enquanto o outro jogador não olha. Upstash Redis por REST,
escolhido por um motivo concreto e não por preferência — é um `fetch`, e
por isso **não entrou dependência nova** no `package.json`, que neste
projeto está fora do git de propósito.

**DUAS CHAVES, e a separação é o desenho inteiro.** A `fila` guarda recados
pequenos; o `mundo` mora numa chave que se sobrescreve. O save passa dos 80
KB e o convidado pergunta "mudou alguma coisa?" a cada dois segundos: se o
mundo andasse na fila, ele estaria puxando 80 KB para ouvir "não", e uma
sessão de sessenta turnos deixaria cinco megabytes de saves velhos que
ninguém vai ler. Na fila anda um ponteiro de poucos bytes.

O transporte **parte e remonta** o recado sem que ninguém acima saiba — foi
por isso que `sala.js` e o App não mudaram de uma linha. E os dois canais (a
aba do lado e a rede) ficam abertos juntos, com o carimbo compartilhado:
quem joga na mesma máquina continua recebendo na hora, e ninguém precisa
escolher um modo.

Um defeito pego antes de rodar, na releitura: publicar adiantava o índice de
leitura até o fim da fila, "para não reler o próprio recado" — e com isso
pulava o que o outro tivesse publicado no meio-tempo, que é justamente a
ação dele no turno. Quem descarta o eco é o carimbo, que já fazia esse
trabalho e não descarta mais nada.

Provado contra o deploy de verdade, não em simulação: publicar, ler só o que
é novo, o ponteiro do mundo, buscar o mundo, recusar código malformado e
limpar a sala. E na tela — um participante que chegou **só pela rede**, sem
tocar no canal local do navegador, foi sentado pelo anfitrião e recebeu a
sala de volta pelo mesmo caminho.

Duas coisas que o checador ganhou de brinde: `async` entrou na lista de
palavras-chave do `check-imports` (a falta era dele, não do código: qualquer
arquivo com uma arrow assíncrona virava suspeita), e a prova de que a rota
não julga regra de jogo passou a medir o CÓDIGO em vez da prosa — a primeira
versão procurava a palavra "cadeira" e batia no comentário que explica
justamente que a rota não sabe o que é uma cadeira.

**Pendente do lado de quem paga a conta:** o `KV_REST_API_TOKEN` foi colado
num log de conversa e precisa ser rotacionado no painel do Upstash.

## v9.122 — a sala travava com as duas fichas prontas

Dois defeitos da primeira sala de verdade, os dois só visíveis com duas
pessoas de fato sentadas.

**A AVENTURA NÃO ABRIA.** As duas fichas ficavam marcadas como prontas e a
tela não saía do lugar. O começo estava pendurado num caminho só — o
anfitrião apertando "Começar aventura" —, e ali ele perguntava se estava
todo mundo pronto. Quando a segunda ficha chega DEPOIS, pelo fio, ninguém
refazia a pergunta.

É a regra desta casa outra vez, e desta vez ela mordeu a peça mais nova:
**toda regra que mora num só de dois caminhos vira bug.** O recado de AÇÃO
já fazia certo (confere `turnoCompleto` e dispara); o de FICHA não conferia
`todosProntos`. As provas agora medem os dois caminhos — um só deles verde
era exatamente o estado que travou a sala.

**O LÉXICO NÃO CHEGAVA NO CONVIDADO.** A leitura do mundo é assíncrona e
leva quase um minuto — é o que a tela de criação diz enquanto o jogador
monta a ficha. O anfitrião publicava a sala no instante em que o mundo era
criado, ou seja ANTES de o léxico existir, e nada republicava depois. E a
outra metade do mesmo defeito estava do lado de lá: o convidado só aceitava
o mundo se ainda não tivesse um (`if (r.mundo && !mundoRef.current)`), então
recusaria a versão nova mesmo se ela chegasse.

O resultado era o convidado escolhendo raça e classe com os nomes genéricos
no único momento em que isso se vê. Provado depois do conserto: nas duas
telas, "Estivador · Mareeiro · Guindaste · Moço de Cais".

**E uma terceira coisa, achada na releitura e não na tela.** O canal fica
aberto a sessão inteira e guardava a função que recebeu na hora em que foi
aberto — a de UM render. Enquanto ela só mexia em refs, isso passou
despercebido; a partir do momento em que o recado de ficha precisa chamar
`iniciar`, que lê estado de verdade, a função velha começaria a abrir a
campanha com o mundo de antes. Agora o canal chama um ponteiro que se
atualiza a cada render — o mesmo padrão que `salvarRef2` já usava aqui.

A tela também parou de mentir: com as duas fichas prontas ela dizia
"esperando a do outro jogador" logo abaixo dos dois ✓.

## v9.123 — a sala nova herdava o mundo da anterior

Achado jogando, na segunda sala: criar uma sala nova pulava a criação do
mundo e caía direto na ficha.

`mundo` e `nomeCampanha` são estado do componente e **sobrevivem à volta ao
menu**. A tela da sala decidia o próximo passo perguntando se eles existiam
— e existiam: eram os da sala anterior. A sala nova nascia com o mundo E o
léxico da antiga, e o convidado receberia esse mundo como se fosse o
combinado. Uma sala é uma campanha nova; esquecer o mundo ao abrir ou entrar
numa é o que faz a pergunta da tela ter resposta verdadeira.

**O defeito de desenho por trás** vale mais do que o sintoma: era UM botão
adivinhando para onde ir a partir de um estado que podia mentir
(`setFase(mundo && nomeCampanha ? "personagem" : "mundo")`). Agora são dois
botões e duas ações. Botão que infere a intenção erra quando o estado mente,
e o estado sempre acaba mentindo.

**E a ficha passou a esperar o léxico.** A leitura do mundo leva de meio
minuto a dois, e é ela que dá nome à raça e ao ofício deste lugar. O
convidado caía na ficha antes dela e escolhia entre "Humano, Elfo, Anão" num
mundo de caçadores de espíritos. Agora a sala publica `lendo` junto do
mundo, a tela mostra a leitura como o passo atual e o botão de montar a
ficha some dos dois lados enquanto ela dura.

Isso é uma diferença deliberada em relação ao jogo de um jogador só, onde a
leitura nunca travou o botão (v9.101). A razão: na sala há uma sala de
espera que não existe sozinho, e o custo de montar cedo é maior — são duas
pessoas, e a tela do convidado depende do léxico do anfitrião. A espera
sempre termina: quando a leitura FALHA, o anfitrião avisa a sala do mesmo
jeito, e os dois entram com o mundo genérico em vez de esperar para sempre.

Uma linha da tela que a prova na tela pegou: durante a leitura ela dizia
"📖 Lendo o mundo…" e "O mundo ficou pronto. Monte o seu personagem." uma
embaixo da outra.

## v9.124 — a vez à vista

A ordem fixa do turno (jogador 1, jogador 2, depois o Mestre) existe para o
segundo poder responder ao primeiro DENTRO do mesmo turno — combinar um
gesto, responder uma pergunta, segurar a porta enquanto o outro sobe.

Só que o que o outro escreveu **só aparecia quando os dois já tinham
fechado**. A afordância existia no prompt e não existia na tela, e sem ela a
ordem não servia para nada: era um revezamento com aparência de mesa.

A faixa fica ACIMA da caixa de escrever, e não no log, de propósito. O que
está escrito ainda não aconteceu — é intenção, e pode ser trocada até o
turno sair. Uma linha no log seria um fato; a faixa é uma mesa com as cartas
viradas para cima, e ela some quando o turno vira fato.

Duas coisas saíram junto:

- **O log parou de dar recibo.** Duas linhas de "✍ Você escreveu. Esperando
  Fulano…" por turno enchiam a cena de burocracia, e a faixa diz a mesma
  coisa melhor: mostra o texto inteiro de quem escreveu.
- **`quemFalta` e `salaCheia` saíram da fonte.** Depois da faixa, as duas
  ficaram sem leitor nenhum em `src/` — vivas só nas provas, que é o
  loophole do `check-mortas` e não uma justificativa. Regra exportada que só
  as provas usam é regra sem dono.

E o convidado passou a saber que o turno saiu: quem chama o Mestre é o
anfitrião, então o convidado não tem `carregando` — entre a faixa sumir e a
narração chegar havia quinze segundos de tela parada que não dizia se tinha
travado ou se estava trabalhando.

Provado na tela, com as duas abas: a convidada perguntou, a faixa apareceu
nos dois lados com o texto dela, o anfitrião leu e RESPONDEU dentro do mesmo
turno — e o Mestre resolveu os dois na ordem, com a taverneira respondendo à
pergunta da Clara na cena.

## v9.125 — o campo de batalha desenhado

A regra do combate tático já existia inteira desde a v9.34: parede, estorvo,
terreno difícil, cobertura, linha de visão, alcance por faixa, tamanho de
miúdo a imenso, caminho com custo, área de efeito. O que faltava era a
PINTURA.

A malha era feita de `<button>` num `inline-grid` de CSS, com emoji dentro e
um pixel de vão. Dizia a verdade inteira e parecia uma planilha — o resto do
jogo é grimório noturno, e a luta, que é o momento mais tenso da mesa, era o
único lugar com cara de Excel. E o lado do quadrado ficava preso entre 9 e
18 px: 18 px não é alvo de dedo, então no telefone o tabuleiro compacto era
decorativo e só a tela cheia servia para jogar.

Agora é SVG, num arquivo próprio (`grade-de-batalha.jsx`, 164 linhas a menos
no `App.jsx`). **Nenhuma regra mudou**: os mesmos alcançáveis de
`alcancaveisDe`, a mesma área de `quadradosDaArea`, o mesmo `onMover` que
cobra o caminho e o golpe livre. O quadrado virou uma unidade e o tamanho
virou problema do CSS, então o mesmo desenho serve o polegar e o mouse.

O que mudou de desenho, e por quê:

- **O véu, em vez da mancha.** A primeira versão pintava de dourado o que dá
  para alcançar — e o alcance quase sempre é a maior parte do campo, então o
  tabuleiro inteiro virava lama com buracos onde havia gente. Escurecer o
  que NÃO se alcança diz a mesma coisa pelo avesso e deixa o chão em paz. A
  cor do contorno é que carrega o sentido: âmbar é o seu passo, violeta é o
  alcance da habilidade.
- **Sem buracos.** Quadrado ocupado não é alcançável — não dá para parar em
  cima de ninguém — e sem tapar esses furos cada ficha dentro do seu passo
  ganhava um tracejado em volta e uma sombra embaixo: a tela dizia
  "selecionado" onde a regra dizia apenas "ocupado". O que não escoa até a
  borda do campo é buraco, e entra no conjunto só para o desenho.
- **A inicial, e não o emoji.** 🧍🛡👹 eram invisíveis nos 18 px antigos e
  viraram desenho animado colorido quando o quadrado cresceu — bitmap de
  outra paleta no meio de um jogo âmbar sobre violeta. A inicial no serifado
  da casa é ficha de tabuleiro: diz QUEM é aquilo, não só de que lado está.
  A legenda mudou junto, porque legenda que descreve o desenho anterior
  ensina o jogador a procurar o que não está lá.
- **O passo anda.** `caminhar` sempre devolveu o caminho e nada olhava para
  ele: o x,y trocava e a ficha aparecia do outro lado do salão. Agora a rota
  é refeita entre onde ele estava e onde está — mesma busca, determinística
  — e a ficha a percorre quadrado a quadrado, com o rastro desenhado atrás.
  Passar o cursor por um quadrado alcançável mostra a rota pontilhada e
  quanto custa antes do clique.
- **As regiões viraram legenda de planta baixa.** O Mestre narra "no vão da
  porta", nunca "quadrado 3,8". O nome só existia no balão de ajuda; agora
  está escrito no canto de cada faixa — no canto, e não no meio, porque o
  meio é por onde as fichas andam.
- **O compacto continua sendo um relance.** Deixar o SVG crescer à vontade
  cai no defeito oposto, que a v9.34 já tinha diagnosticado: um campo de
  16×16 com 34 px de lado empurra a narração para fora da tela. O teto é a
  ALTURA — 320 px — e o quadrado fica com o que sobrar. A tela cheia é que
  serve o dedo.

Provado numa bancada temporária que montou os três cenários fora de um
combate real: taverna, masmorra e floresta, com ogro de 2×2, magia de área e
mira. O passo foi medido no relógio — herói em (1,3), clique em (6,8), rastro
crescendo a cada 60 ms e a ficha chegando em ~360 ms pela rota curva
`(1,3)→(1,4)→(2,5)→(3,5)→(4,6)→(5,7)→(6,8)`. A bancada foi apagada.

Quatro provas da suíte nova nasceram erradas, casando com o COMENTÁRIO que
explicava a remoção do emoji em vez de com o código — o mesmo deslize que
esta base já corrigiu uma vez. Agora `teste-grade.mjs` mede o arquivo sem os
comentários.

## v9.126 — a carta de tarô

O rosto já existia desde a v8.8, e é bom: `tracos()` deriva pele, cabelo,
olhos, penteado, barba e cicatriz de uma semente fixada na criação, e o mesmo
personagem dá sempre a mesma cara — sem IA de imagem, sem custo, sem um byte
de arquivo, para um elenco que não tem fim. O que faltava era um lugar onde
esse rosto fosse GRANDE. Numa bolinha de 44 px o rosto é um crachá: serve
para não confundir dois companheiros e nada mais.

Agora todo retrato do jogo abre uma carta. Moldura de régua dupla com
lavrado nos cantos, nicho em arcada com raios atrás da cabeça, o busto com
veste e gola, o naipe, o nome gravado e a linha de raça e ofício.

**Três coisas são derivadas, e nenhuma é sorteada na hora:**

- **O número é o nível, em romano.** Uma carta cujo número sobe é a única
  numeração honesta aqui: diz onde a pessoa está agora, e muda com ela.
- **O naipe é o atributo mais alto** — espada, flecha, escudo, livro, cálice,
  olho. Não é enfeite: é a frase mais curta que se pode dizer sobre alguém
  que ainda não se conhece, e sai de um número que o sistema já tem. O empate
  cai para a ordem em que a ficha mostra os atributos, que é a ordem que o
  jogador já leu. Quem não tem atributo nenhum — um figurante, um bicho —
  recebe naipe pela semente: nenhuma carta nasce sem naipe, do mesmo jeito
  que nenhum agente nasce mudo.
- **A veste, o forro e o céu saem da semente**, então a carta de Fulano é
  sempre a mesma carta.

**A arrumação que isso obrigou.** O rosto morava soldado dentro do `Retrato`,
que é uma bolinha. Copiá-lo para a carta teria criado duas versões da mesma
pessoa, e elas divergiriam no primeiro ajuste — uma pessoa com dois rostos
dependendo de onde se olha é o tipo de defeito que ninguém reporta porque
parece impressão. Então virou peça, e as duas molduras pedem a mesma peça:

- `semente.js` — a conta: hash, gerador, sorteio preso à semente, traços,
  estado do ferimento. Saiu de dentro de um `.jsx` porque nenhuma prova em
  Node conseguia sequer importar de lá.
- `rosto.jsx` — o desenho da cara, e só.
- `taro.js` — o número e a escolha do naipe.
- `carta-taro.jsx` — a moldura, o nicho e os seis emblemas.

**E o retrato abre a própria carta.** A alternativa era o App guardar "que
carta está aberta" e enfiar um callback em cada painel que desenha gente —
são sete lugares, dentro de quatro componentes que não sabem nada sobre
cartas. Prop atravessando componente que não usa é exatamente como uma regra
deixa de valer num dos caminhos: alguém acrescenta o oitavo retrato e esquece
de passar. Aqui basta entregar a PESSOA; sem ela, o retrato continua a
bolinha muda que sempre foi. O único que não abre carta é o do cabeçalho:
ele já é o botão que abre a ficha, e botão dentro de botão passa no teste e
falha no dedo.

Duas correções durante o trabalho, as duas do mesmo tipo — regra reescrita
dentro do desenho:

- a primeira versão pôs o rosto a 3,05 de escala e ele engoliu o nicho: virou
  o crachá do grupo ampliado, com um par de ombros espremido embaixo. Uma
  carta de tarô é FIGURA — a cabeça ocupa o terço de cima e o corpo sustenta
  o resto.
- a carta reescreveu à mão os limiares do ferimento (0,25 / 0,55 / 0,33 /
  0,66) que `estadoDe` já define. Dois lugares decidindo quando alguém está
  grave é o começo de uma carta que mostra sangue enquanto a bolinha do grupo
  mostra a pessoa inteira.

E três provas da suíte nova nasceram medindo a coisa errada: `semente=`
contado como `ente=`, `opacity="0.25"` contado como limiar de ferimento, e
uma conta minha de cabeça (10/30 é 0,333 — maior que 0,33, logo "ferido" e
não "grave"). Todas corrigidas para medir o que roda.

## v9.127 — a tábua, o papel e a vinheta

O mural é a única tela do jogo que representa um OBJETO do mundo: uma tábua
com papéis pregados nos portões e nas tavernas. Enquanto foi uma lista de
retângulos iguais dentro de um painel igual a todos os outros, isso não
aparecia em lugar nenhum.

Agora as duas pilhas — os cartazes da cidade e os que alguém pregou depois de
falar com o herói — dividem a mesma tábua de cortiça, com moldura de madeira,
e cada papel tem seu percevejo. **Âmbar é da cidade, roxo é de alguém que
falou com você**: a cor da cabeça do alfinete diz de que pilha o papel é sem
gastar uma palavra a mais na tela.

Tudo é gradiente, sombra e borda. **Nem um arquivo de imagem entrou no
repositório**, e a prova defende isso: um `url()` na folha de estilo é a
primeira imagem entrando pela porta dos fundos, e ela muda como a Vercel
constrói e quanto o jogador baixa.

E nada de cortiça bege com papel creme. O jogo é âmbar sobre violeta escuro;
uma tábua clara no meio disso não seria charme, seria mancha — e o texto
claro sobre ela ficaria ilegível.

**O giro de cada cartaz sai do id, e não de um sorteio.** Um papel que muda
de ângulo a cada vez que a tela redesenha não está pregado, está tremendo. O
mesmo cartaz tem sempre a mesma inclinação, e passar o dedo por cima o
levanta e o endireita — o giro mora no embrulho e o levantar no papel,
justamente para os dois não brigarem.

**A vinheta** escurece o canto da tela para o meio, onde a narração acontece,
parecer iluminado. Duas decisões dela são de segurança e não de gosto:
`pointer-events: none`, porque uma camada fixa por cima do jogo inteiro sem
isso deixa o jogo bonito e inerte — e o sintoma ("não consigo clicar em
nada") não aponta para o enfeite; e `z-index: 1`, abaixo de tudo que é
painel (o cabeçalho é z-30, a gaveta lateral z-40, as janelas z-50), porque
uma vinheta por cima disso escureceria justamente a ficha e o mural, que é
onde se lê número.

Três coisas foram consertadas depois de olhar a tela: a cortiça não tinha
textura visível (as manchas estavam claras demais para o fundo escuro), a
moldura de madeira sumia contra o fundo do app, e o percevejo pairava ACIMA
da borda do papel como uma continha solta no ar em vez de atravessá-lo.

**O que NÃO foi feito, e por quê.** A moldura lavrada na ficha ficou de fora.
A carta de tarô e a tábua já carregam o vocabulário de ornamento, e uma
terceira moldura no mesmo jogo vira ruído; além disso a ficha mora dentro da
gaveta lateral, e eu não conseguiria vê-la sem uma campanha inteira rodando —
não vale entregar enfeite que não olhei.

## v9.129 — a espinha: fase 1 do plano

O mundo sempre nasceu inteiro e determinístico da semente: regiões, cidades,
fações, masmorras, esconderijos, segredos, gente, chefes. A HISTÓRIA não. Ela
era o que o Narrador improvisava mais os sorteios de `tramas.js` — e era por
isso que ela era a única coisa da mesa que ninguém conseguia conferir. Onde
não há decisão tomada antes, quem decide é quem está falando na hora.

`historia.js` já tinha a FORMA — as estruturas dramáticas, os marcos que
pesam, o custo que cada momento cobra para virar. Faltava o CONTEÚDO. É isso
que `saga.js` estende, uma vez só, na criação do mundo.

**Três regras sustentam o resto:**

1. **A espinha só aponta para o que existe.** Cidade do mapa, gente da base,
   bicho daquela região, chefe que o mundo já criou. Um marco que aponte para
   quem não existe é a caçada dos três lobos em escala de campanha.
2. **Toda condição é do vocabulário que já se confere.** As etapas de
   `missoes.js` têm `ver()`; a espinha não inventa um segundo jeito de dizer
   "cumprido", porque dois jeitos seriam dois jeitos de discordar.
3. **O ato é dimensionado pela conta do próprio arco.** `custoDaEtapa` já
   dizia quanto peso cada momento precisa para virar; a espinha põe marcos
   até somar isso. O arco passa a virar quando os marcos do ato acabam, em
   vez de virar por acúmulo de acaso.

**A seção `momento` da Pauta finalmente tem leitor.** Ela estava declarada em
`pauta.js` desde a v9.104 — "a batida da história", prioridade 3 — e nunca era
preenchida. A espinha é exatamente o que faltava ali.

**Uma etapa nova: `revelar`.** A primeira sonda estendeu uma espinha inteira
que se cumpria ANDANDO: "o que a capela esconde" fechava com `ir_a`, presença,
que é o defeito que a v9.128 acabou de consertar no resgate. Agora a condição
lê `base.revelados` — a lista do que já foi apresentado em cena.

**Dois feitios ficaram de fora, e as ausências estão escritas no arquivo:**

- **Entrega.** `levar_a` confere se o item está na bolsa, e nada no jogo põe
  "o fardo pesado demais para um só" na mão do herói. A primeira sonda estendeu
  justamente esse marco como abertura da campanha — impossível de cumprir, bem
  no lugar onde a história começa.
- **Masmorra.** "Descer em X" só se cumpriria por `ir_a`, e chegar à boca da
  mina não é descer. A masmorra sabe quais salas foram resolvidas mas não
  publica um sinal de CONCLUÍDA que as etapas saibam ler.

Outras três coisas que a sonda pegou antes de qualquer jogador: o confronto
final nascia em PRIMEIRO lugar do ato (e o resto do ato acontecia depois do
clímax); "acabar com Lich ×3" — matilha é coisa de bicho pequeno, e agora
`quantos` sai da ameaça; e a campanha abria com três "encontrar fulano" em
fila, que não é um começo, é uma lista de chamada.

**Save antigo não ganha espinha.** Estender no meio de uma campanha em curso
inventaria um passado que ninguém viveu — a espinha fica vazia e o jogo segue
como sempre seguiu.

E não há resumo de progresso exportado: uma barra dizendo "12 de 29 marcos"
conta ao jogador que existe uma estrutura, e saber que faltam dezessete é
saber que a história não acaba agora.

## v9.130 — procurar alguém: fase 2 do plano

"Procuro por sinais de Ione". O sistema abriu VASCULHAR O LUGAR, pediu
Percepção, o herói passou — e recebeu uma arma escondida com pressa e sessenta
moedas. Nada de Ione.

**A regra já estava escrita.** O desafio `buscar` tem um guarda cujo próprio
comentário diz, com todas as letras: *"PROCURAR UMA PESSOA NÃO É VASCULHAR UM
LUGAR, e a diferença é cara"*. Só que o guarda é uma **lista de palavras** —
taverneiro, ferreiro, mercador, guarda, alguém — e Ione não é nenhuma delas.
Ele sabia reconhecer ofícios e não sabia reconhecer gente.

E o jogo conhece Ione. Ela está no elenco, ou na base da cidade, ou é um marco
da espinha. A pergunta certa nunca foi "esta frase tem palavra de pessoa?" —
era **"esta frase tem o nome de alguém que existe?"**.

Entrou um segundo guarda, `naoSeCom`, que pergunta ao CONTEXTO em vez de
adivinhar pelo texto — que é o que esta casa faz em todo o resto. E há uma
lista só de quem o jogo conhece: elenco vivo, grupo, gente desta cidade e quem
a espinha promete. Uma só, de propósito: duas listas de quem existe seriam
dois mundos.

**Procurar alguém deixou de ser um teste contra a tabela de tesouro.** Virou
pergunta ao mundo, com seis respostas e nenhuma em moedas: ela anda com você;
está aqui à vista; está aqui e não quer ser achada (aí sim há dado, e o que
está em jogo é ela); está em outro lugar, com rumo e distância; morreu; ou
nunca passou por aqui — e saber isso é informação, que é o que uma procura
devia render mesmo quando falha.

**A SITUAÇÃO DE CADA UM.** Gente marcante deixou de ser um fato para o Narrador
citar e passou a ter estado: `livre`, `escondida`, `cativa`, `ferida`, `morta`,
com onde e com quem. Sem isso não há resgate que se possa conferir — "tirar
Ione de lá" precisa de um "lá" e de um estado que mude quando ela sai. Morrer
agora escreve nos dois lugares: a lista de mortos, que metade do jogo já lê, e
a situação, que a procura consulta.

Três defeitos meus, achados por sonda antes de qualquer jogador:

- `situacaoDe` comparava a chave normalizada contra a lista de mortos **crua**,
  então todo morto de save antigo voltava a `livre` — o tipo de engano que só
  aparece quando alguém procura um defunto.
- O rumo saía como `[object Object]` na cara do jogador: `rumoEntre` devolve o
  rumo inteiro, e o que entra numa frase é o rótulo dele.
- Quem estava **cativa** era encontrada "sem dificuldade", porque o degrau da
  gente da cidade devolvia `aqui` sem olhar o estado.

E uma prova minha nasceu errada: ela media a palavra "tesouro" e pegava a
própria proibição do envelope ("não transforme isto em achado de tesouro").
O que não pode existir é PAGAMENTO, e é isso que ela mede agora.

## v9.131 — o contrato do Narrador

Pergunta do autor: já que a IA não é mais o Mestre e só narra, tudo o que
está no prompt ainda é necessário?

**Medido, e a resposta é sim — mas em outra forma do que eu supus.** A
primeira medição que fiz atribuiu errado: o regex de cabeçalho engoliu tudo
depois de "ROLAGENS" até o próximo título em caixa alta, e me fez ver um
bloco de 13.896 caracteres de instrução de rolagem que não existe. Medido por
ITEM, o prompt é plano: 191 itens, o maior com 4.823, e nenhum bloco gordo de
"como decidir".

O que ele tem é outra coisa:

```
90,5%  proibição ou atribuição ao sistema   (155 itens)
 3,1%  ofício de narrar                     (8 itens)
 4,9%  fato do mundo                        (28 itens)

46× "NÃO"   26× "NUNCA"   8× "PROIBIDO"   112× "o sistema"
```

O prompt não está cheio de regras de decisão. Está cheio da **cicatriz de
cada decisão que foi tirada da IA**: cada sistema que virou código deixou
para trás uma proibição avisando que ela não decide mais aquilo.

**E a contradição estava na primeira linha.** O prompt abria com *"Você é o
Mestre de um RPG de mesa por chat… e arbitre as regras com justiça"* — e
gastava os outros 58 mil caracteres tomando isso de volta.

Agora ele abre com o CONTRATO: o Narrador sabe que o Mestre desta mesa é o
sistema, que já leu a cena, consultou os conselheiros, rolou o que havia e
decidiu; e que o trabalho dele é o que nenhum código faz — contar como
aconteceu, com a voz de um mestre de mesa que tem a história inteira na
cabeça.

**O contrato foi pago com duplicação, não com corte.** Ele custou 719
caracteres e disparou o gatilho que o plano já tinha sinalizado: a cena
sintética de todas as portas estava a 57 caracteres do teto. A regra da casa
proíbe consertar orçamento raspando ou movendo guarda, então saiu o que o
contrato passou a dizer:

- `TURNO_PROMPT` inteiro, de `turno.js`. Ele se chamava "QUEM DECIDE O QUÊ" e
  era, palavra por palavra, o contrato: a mesma divisão, a mesma regra do
  envelope. Duas cópias da fronteira entre o sistema e quem narra é o começo
  de duas fronteiras.
- Três frases de `LIBERDADE CRIATIVA` — inclusive *"o SISTEMA decide o que
  existe e o que acontece; VOCÊ decide como aquilo se parece"*, que era a
  terceira cópia da mesma frase no mesmo prompt.
- A frase dos envelopes já rolados, em `COLCHETES SÃO META`.

Resultado: pior cena real de 80.670 para **79.542**, sintética de 90.662 para
**89.534** — e a folga do gatilho voltou de 57 para 466 caracteres.

**O QUE NÃO FOI FEITO, E POR QUÊ.** As 46 proibições continuam lá. Apagá-las
em bloco seria regressão: muitas nasceram porque o modelo fez a coisa errada,
e estão registradas neste arquivo. O critério para apagar uma é objetivo, e
vira fase própria do plano: **uma proibição só sai quando um sistema torna o
mau resultado impossível** — quando o envelope é autoridade e o código
sobrescreve. Proibição que protege algo que nenhum sistema cobre não é
excesso de texto: é conselheiro faltando.
