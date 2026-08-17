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
