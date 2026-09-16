# A pauta do desenho

A fila da **segunda mente** — a do visual. O `regente` pega daqui, uma etapa
por ciclo, independente da fila do sistema (`mente/pauta.md`).

Mesmos pesos do `CLAUDE.md`, com a tabela de design: `leve` e `médio` o ciclo
executa sozinho; `pesado` espera a pessoa. **Fluxo do jogo e mover o que o
jogador já usa são sempre `pesado`** — ali o custo é a memória de quem joga,
e nenhum número resolve. Paleta e tipografia são `médio` **se comprovadas**
pela régua dos quatro dentes.

A forma de cada coisa mora em `mente/formas.md`; o feito, em
`mente/diario-desenho.md`.

---

## Para a pessoa decidir (pesado)

Todos nasceram da medição de D1 (14/09). Nenhum é gosto: cada um tem o número
que o sustenta, e cada um mexe **no fluxo do jogo ou no que o jogador já usa**
— por isso espera.

**Os dois primeiros são de D4, e são a resposta ao pedido da pessoa de 14/09**
(*"não precisam ficar tímidos e trabalhar apenas o que já existe"*). Pela
régua nova, `pesado` é uma pergunta só — **o jogador teria de reaprender?** —
e nos dois a resposta é sim, com o que ele reaprende dito por escrito.

**E três nasceram em E1 (15/09), ao desenhar a tela de batalha** — estão logo
a seguir aos de D4, marcadas *(E1)*. As três são da mesma família e é honesto
dizê-lo: as três tratam do que acontece quando **o tabuleiro passa a ser onde
o jogo se joga**, e cada uma pede uma coisa ao motor que ele hoje não faz.

**E duas nasceram em K1 (15/09)**, marcadas *(K1)*. Vêm à pessoa por razões
opostas — uma porque **dá ao jogador informação que este jogo nunca lhe deu**, a
outra porque **paleta é identidade**.

**E uma nasceu em E2 (15/09)**, marcada *(E2)*, e está em primeiro porque é a
única aberta: as outras já foram respondidas.

**E três nasceram em W1 (16/09)**, marcadas *(W1)*, e vêm à frente da de E2 por
uma razão que não é de importância: **as três têm número corrido hoje, em Node,
sobre o código de hoje** — e duas delas foram medidas pelos dois seniores em
separado, com resultados que batem.

**E duas nasceram em W2 (16/09)**, marcadas *(W2)*, e estão **no topo** porque
são as duas metades da mesma coisa e **cada senior trouxe uma sem ver a do
outro**: o `jogo` deu à fala uma **consequência**, o `desenho` deu-lhe uma
**forma**. Separadas, cada uma é meia proposta — a do `jogo` sem a do `desenho`
é um efeito que o jogador não vê chegar; a do `desenho` sem a do `jogo` é um
traço bonito sobre uma fala que não muda nada. **Juntas, são a rodada da
caminhada a virar uma pergunta.**

**E duas nasceram em K2 (16/09)**, marcadas *(K2)*, e estão **no topo** por uma
razão que não é de gosto: **as duas acusam a própria casa de ter escrito uma lei
e não a ter posto em tabela.** A do `jogo` é a primeira lei do `CLAUDE.md`
(*determinismo por semente*) a valer só metade do jogo; a do `desenho` é um
número de acessibilidade que ele próprio citou num parágrafo em vez de o pôr numa
tabela. *Se é número, é tabela* — e as duas são a mesma lei a cobrar-se de quem a
escreveu.

**E duas nasceram em K3 (16/09)**, marcadas *(K3)*, e estão **no topo** porque
as duas são a mesma acusação vista de dois lados: **a Fase K construiu uma peça
excelente e mediu, no mesmo dia, que ela pergunta a coisa errada metade das
vezes.** A do `jogo` tem o número que dói; a do `desenho` é a única da pauta que
ficou **mais barata** por a etapa ter passado — a peça que ela precisava nasceu
hoje, e o que falta é alcance.

- [ ] **(K3) a janela pergunta sobre o golpe que menos importa — e há número** ·
  pesado · de: jogo · 16/09
  **O diagnóstico, corrido em 20 000 sementes sobre o motor real** (ladino nv 3 +
  2 companheiros contra 4 comuns, a mesa mais parecida com a campanha):
  a janela abre **no maior golpe da rodada em 36,09 %** das vezes; o golpe sobre
  o qual ele **é perguntado** faz **3,56** de dano, e o que chega **coberto, sem
  pergunta**, faz **5,86**. **63 % do dano da rodada chega sem ninguém lhe
  perguntar** (75 % para o ladino solo). E **metade das perguntas é sobre um
  golpe que errou** (50,09 %): *revidar · 0 PM* não é uma decisão, é um sim com
  relógio — e K1 matou `inimigo_cai` com exactamente esta frase (*«uma pergunta
  cuja resposta é sempre sim não é pergunta, é um diálogo de confirmação com
  relógio»*). **A janela abre em 98,6–100 % das rodadas** para sete das doze
  classes: **não existe rodada de descanso.**
  **As duas propostas, e a segunda é a forte:** (a) a janela **não abre num erro
  do inimigo** — corta 45–50 % das perguntas e põe as restantes no momento que
  dói; (b) a janela abre **no MAIOR golpe da rodada**, não no primeiro que
  qualifica — sobe de **36,09 % para 100 %** a fracção de perguntas feitas sobre
  o golpe que mais dói.
  **E o obstáculo, dito antes de a pessoa o descobrir:** **a trava de K2 proíbe as
  duas.** A asserção 05 exige `abre.ordem <= ordemDaReacaoDeHoje`; saltar um golpe
  faz a replicação de [R1] começar mais à frente e **o contra-ataque do golpe 0
  deixa de acontecer** — isso é regressão medida, não estilo. *A ordem da pergunta
  está soldada à ordem dos golpes, e foi a trava que a soldou.* **Vem à pessoa
  porque muda mecânica e porque contradiz uma asserção que ela já aprovou.**
  **O que se perde, dito por mim:** o jogador deixa de poder **recusar** o
  contra-ataque — e recusar compra alguma coisa de verdade.
  *(K4 mede a batida e é onde isto se decide com o jogador dentro.)*

- [ ] **(K3) no modo de alto contraste o Taverna não tem foco nenhum** ·
  pesado · de: desenho · 16/09
  **Não é «fraco»: é zero.** `forced-colors: active` — o alto contraste do
  Windows, que muita gente com baixa visão usa o dia inteiro — **remove
  `box-shadow` por especificação**, e o anel de foco da casa inteira é
  `box-shadow`. Logo, para esse jogador, **o indicador de foco de um RPG de texto
  jogado com teclado é nenhum**, que é exactamente o público que mais depende
  dele. **Medida, não adjectivo:** indicadores de foco visíveis sob
  `forced-colors` hoje = **0**; depois = todos.
  **E hoje ficou mais barata:** K3 fabricou `.tv-anel-foco` com as duas linhas de
  `outline` do `forced-colors` já dentro, e aplicou-a ao cartão e às quatro
  pílulas da ficha. **A peça existe e está provada.** O que falta é **alcance**, e
  é por isso que é pesado: passá-la pelos **215 `<button>`** que K2 contou e pelos
  **86 alvos do tabuleiro** com `outline: none` à mão
  (`grade-de-batalha.jsx:515-519`) é trabalho de etapa e muda o que um jogador
  vive. **Paga também a dívida de E1**, que está aberta desde 15/09.

- [ ] **(K2) o combate ganha uma semente, e o Duelo já provou que dá** ·
  pesado · de: jogo · 16/09
  **O diagnóstico, com o número.** A primeira lei desta casa diz *mesma semente,
  mesmo resultado, em qualquer máquina — é o único árbitro que um sistema sem
  servidor tem*. **Mas a campanha não tem semente nenhuma:** são **205 chamadas a
  `Math.random`** por ~50 módulos, sem um fio que as ligue. **E `src/duelo.js`
  tem zero** — `duelar(A, B, { semente })` e `sementeDaSala(...)` fazem o Duelo
  reprodutível de ponta a ponta desde D2/D3, e `src/semente.js` já exporta o
  gerador. ***A peça existe; falta ligá-la ao combate.***
  **A proposta, e a ordem é o que a torna barata:** `src/dado.js` com
  `fioDaLuta({ save, luta, rodada })`; o combate passa a receber **o rolador por
  parâmetro**, com `rolar = Math.random` por omissão — **exactamente a assinatura
  que `reacaoDoSilencio` já leva desde hoje**. Nada quebra no dia 1: quem não
  passa o rolador tem o jogo de hoje. **A reação é a primeira, porque K2 já a
  pagou**; depois `combate.js`, uma função por versão, cada uma com a varredura
  de sementes a provar que a extracção foi de graça.
  **Por que muda o que o jogador vive, e não é higiene:** hoje, quando ele perde
  e quer perceber porquê, a resposta é *"azar"*; com semente é *"a mesma luta,
  outra vez, igual"* — **e a diferença entre as duas frases é a diferença entre um
  jogo que se pode entender e um que se tem de aceitar.** O *"eu juro que apareceu
  diferente"* deixa de ser indecidível. **E toda etapa futura passa a poder PROVAR
  «o depois é igual ao antes» em vez de o declarar:** K2 gastou um ciclo inteiro a
  construir à mão, para **uma** função, a prova que uma semente daria de graça
  para o motor inteiro.
  **O risco, dito pelo próprio `jogo`:** são 205 chamadas, e tocá-las todas de uma
  vez é o tipo de mudança que parte o jogo em silêncio. **A defesa é não as
  tocar** — é o rolador por parâmetro, função a função, com `Math.random` a
  continuar a ser o valor por omissão até ao último dia. **Reversível em qualquer
  ponto.** O que ele não sabe dizer é quantas versões leva.
  **Por que é dela:** mexe no motor inteiro, não numa tela. *E a alternativa
  honesta seria apagar a linha do `CLAUDE.md`, que a mesa não tem autoridade para
  propor.*

- [ ] **(K2) a casa não tem régua para o alvo de toque — e tem duas populações
  de controlo sem nunca ter sabido** · pesado · de: desenho · 16/09
  **A medida, e são 215 `<button>` varridos** (194 calculáveis):

  | | mediana | abaixo de 24 px | abaixo de 44 px |
  |---|---|---|---|
  | **a casa, hoje** | **30 px** | **14 (7,2 %)** | **169 (87,1 %)** |
  | **as peças da Fase K** | **48 px** | 0 | 0 |

  **A proposta:** nasce `ALVO { minimo: 24, conforto: 44, denso: 32 }` ao lado de
  `T`, **com a fonte escrita em cada linha** (WCAG 2.2 SC 2.5.8 nível AA · Apple
  HIG e WCAG 2.5.5 AAA · e o alvo denso de uma fila de contadores, onde 44
  partiria a linha), o `Botao` de `ui.jsx` passa a lê-la, e um quarto teto em
  `check-formas.mjs` — **`TETO_DE_ALVO_MIUDO`, congelado em 14, que só pode
  descer**. *A tinta e o alvo são duas medidas diferentes:* a tinta pode medir
  30 px e o alvo 44, e a diferença sai de enchimento ou de um `::after`
  transparente — **que não custa um pixel de leiaute**.
  **Por que existem duas populações: porque ninguém escreveu o número.** O
  próprio `desenho` subiu a Pílula de 35 para 47 em K1 citando as três réguas —
  **e escreveu-as num parágrafo de um documento em vez de as pôr numa tabela**,
  que é a primeira lei desta casa aplicada ao avesso. *Um número de
  acessibilidade que vive numa prosa é um número que o próximo controlo não lê.*
  **O que o jogador vive, e é jogo e não higiene:** num telefone, **87 % dos
  controlos estão abaixo do confortável para um polegar**, e um toque falhado no
  meio de um combate por turnos não custa um toque — custa a hesitação de
  perceber por que não aconteceu nada, **com um relógio a correr**. A Fase K
  acabou de pôr na tela o controlo mais sensível a tempo que este jogo já teve:
  ***ele entra correto por acidente de alguém ter medido; o próximo entra correto
  por sorte.***
  **O risco, dito por ele:** crescer o alvo sem crescer a tinta **aproxima alvos
  vizinhos**, e o SC 2.5.8 tem uma excepção de espaçamento exactamente por isso —
  **e ele não mediu espaçamento**. Logo a tabela entra, e a aplicação entra **um
  arquivo de cada vez, medindo**. *E o terceiro caminho falta: nenhum pixel de
  tinta muda, mas quem assina que não piorou é o `jogo` jogando, e isso é K4.*
  **Por que é dela:** uma régua de alvo muda **o que o jogador toca em toda a
  interface**. Isso é fluxo.

- [ ] **(W2) o adversário ganha ouvido — a rodada em que o golpe é recusado
  passa a ser a rodada da voz** · do `jogo` · 16/09
  **O diagnóstico é a soma de três medições que já estavam na casa e que
  ninguém tinha somado:** toda luta corpo a corpo abre com **1,4 rodadas em que
  o jogador não tem nada para fazer, nada para ler e nada a perder** — **10 de
  10 plantas** recusam o corpo a corpo no turno 1, abertura média **19,95 m**
  (W1 §1); **7/7 turnos estéreis, 0 rolagens, 0 chamadas, 100 % sem narração**
  (X4); e a rodada **é de graça**, porque `App.jsx:11871` devolve `true` antes
  do `enviar`. **É o maior espaço vazio do combate e o único que não custa
  quota nenhuma para ser preenchido.**
  **A proposta liga quatro peças que já existem e nunca se viram** — o teste
  (`desafios.js:385` `intimidar`, perícia `intimidacao`, `social`), a condição
  (`condicoes.js:139` `amedrontado`, salva `presenca`, cd 12, **7 leitores**),
  a aplicação (`presenca-divina.js:154` **já a aplica a inimigos, com a linha
  escrita**) e o envelope da poção. **Zero mecânica nova, zero prosa nova,
  zero chamadas.**
  **A peça que falta é uma só, e é o coração:** `garantirLuta`
  (`adversario.js:211-260`) tem **trinta e tal campos — `rodada`, `minhaVida`,
  `heroiFamoso`, `saidas`, `escuro`, `temRefem` — e nenhum deles é "o que o
  herói disse"**. As quebras de intenção lêem `minhaVida < 0.4`,
  `protegidoQuebrou`, `rodada > 3`. **O adversário deste jogo não tem como
  ouvir.** Com um campo `foiAmeacado`, o `receoso` (`:628`) e o
  `fugir_ferido` (`:515`) ganham um segundo gatilho, e **o bando que recua
  porque alguém gritou é coisa que este jogo nunca viu.**
  **Estudo citado, e é de dentro de casa:** `adversario.js:784` escreve a lei
  *"NUNCA invente uma intenção que a Pauta não deu"* — e a Pauta tem trinta
  entradas de mundo e **zero de herói**. É o mesmo defeito que `reacoes.js` já
  tem e que a Fase K nasceu para corrigir.
  **O risco, dito pelo próprio `jogo`:** uma fala de graça numa rodada de graça
  é uma fala que **todo jogador fará em toda abertura de toda luta** — e aí o
  imposto de caminhada troca de roupa e continua imposto. **A defesa já está no
  código** (`chaveDaTentativa`, `desafios.js:710`: a segunda tentativa no mesmo
  lugar ouve *"você já tentou isso aqui"*, de graça) **mas é mais fraca do que
  ele escreveu**, e a adenda §8.1 diz porquê: a chave social é
  `lugar|alvo|<pessoa>|<tamanho>` e **o `tamanho` sai do texto do jogador —
  são seis chaves, não uma**. Há pedido ao `backend` para a chavear por
  `lugar|intimidacao|<inimigo>`.
  **Por que é pesado:** é campo novo e tabela nova em módulo puro, e **o
  jogador reaprende uma coisa grande — que a luta se pode ganhar sem um
  golpe.** Isso é fluxo.

- [ ] **(W2) o tabuleiro passa a desenhar o NÃO — a linha que sai do herói e
  não chega** · do `desenho` · 16/09
  **O diagnóstico saiu de contar o que o tabuleiro desenha hoje:** o passo
  previsto, o passo a acontecer, a mira, o alcance (duas vezes) e a área. **São
  seis desenhos, e os seis desenham coisas que VÃO acontecer.**
  > **O tabuleiro deste jogo nunca desenhou uma recusa. Tem seis formas para o
  > sim e zero para o não — e o não é o que acontece em 10 de 10 plantas, no
  > turno 1 de toda luta corpo a corpo.**
  **A proposta:** na rodada da recusa, uma linha reta sai da ficha do herói na
  direcção do alvo mais próximo **e pára onde o alcance acaba**. Um traço, e
  depois nada. **A distância que falta fica desenhada como o que é: um vão.**
  E tem **três estados, e é o terceiro que a torna a forma de W2** — na recusa
  por **distância** pára ao fim do alcance (*a espada chega até aqui*); na
  recusa por **parede** pára **na pedra**, antes do vão (*não é distância, é
  aquilo* — e as duas recusas que `App.jsx:1121` diz serem *"coisas
  diferentes"* passam a **parecer** diferentes em vez de se lerem diferentes);
  e **na fala a mesma linha chega, inteira, até à ficha** — ***a voz não tem
  alcance***. *A frase do `jogo` — "a 19,95 m a tua voz chega e a tua espada
  não" — deixa de precisar de ser escrita, porque está desenhada.*
  **Medida:** zero contas novas e zero peças novas. `vd.maisProximo.distanciaM`,
  `vd.alcanceM` e `vd.faltaM` já saem de `golpe.js:190-198`; as cores são o
  `T.amber` do passo e o `T.violetSoft` já corrigido; e a geometria da folga já
  foi medida em W1 §2.2 (o arco da vida pára a 0,47 da casa, logo a linha tem
  onde acabar sem tocar em ninguém).
  **Estudo citado, e é a lei desta casa:** ***o veredito antes do clique***.
  Hoje ela cumpre-se em texto e **não se cumpre em forma** — e o `desenho`
  provou que esse texto **vive dentro de uma gaveta que nasce fechada**. *Um
  veredito que depende de o jogador abrir uma gaveta não é um veredito antes do
  clique.* **A linha está sempre lá.**
  **O risco, dito por ele:** é **mais um traço** num tabuleiro que ele próprio
  já acusou de poder virar mosaico, e chega no momento mais carregado. **A
  defesa que ele propõe e não consegue provar:** a linha só existe **enquanto
  não há verbo armado** — arma-se um verbo e ela apaga-se, porque aí o
  tabuleiro voltou a falar de sins. *Está dita como suposição.*
  **Por que é pesado:** muda o que o tabuleiro **é** — de um mapa do possível
  para um mapa que também mostra o impossível —, e o jogador tem de reaprender
  a ler uma linha que não chega.

- [ ] **(W1) a luta abre onde a sala é comprida, e ninguém decidiu isso** ·
  pesado · de: jogo · 16/09
  **O acidente, e é de uma linha.** A abertura de toda luta sai de `posicionar`
  (`grid.js:569-575`): o herói em `y = altura − 1`, os inimigos em `y = 0`. Logo
  **a distância de abertura é a altura da planta, e mais nada.**
  > **A masmorra abre a 25,5 m porque é ESTREITA (7×18), não porque é longe.
  > A taverna abre a 12 m porque é BAIXA (12×9), não porque é apertada.
  > A razão de aspecto do desenho da planta decide a distância do combate.**

  **A conta, corrida em Node sobre `PLANTAS` × `posicionar`:** abertura média
  **19,95 m**; **10 de 10 plantas** recusam o corpo a corpo no turno 1; **1,4
  rodadas por luta são só caminhada** (2 na masmorra, no navio, no gelo e na
  floresta). **E o arqueiro não paga nada disto** — alcança em 10/10 no turno 1.
  *O jogo cobra um imposto de caminhada a quem luta de perto, e cobra-o por
  engano.*
  **A proposta.** A distância de abertura **sai de uma tabela** — por cenário e
  por como a luta começou — e **nunca dos cantos da planta**. A emboscada abre
  colada; a perseguição abre longe; a rixa de taverna abre a 3 m porque uma
  taverna é pequena. A regra: **pelo menos um inimigo dentro do primeiro passo
  de alguém.** *(O embrião já existe e ninguém reparou: `posicionar:573` já abre
  o inimigo `agil` a meio campo. Falta ser tabela em vez de booleano.)*
  **Porque muda o que o jogador vive:** hoje a primeira coisa que toda luta lhe
  ensina é *"ande em frente"*; com isto é *"onde é que eu me ponho"* — e o campo
  já tem tudo para essa pergunta valer (cobertura, terreno que cobra, golpe
  livre, alcance por tamanho). **A regra está toda lá; falta a luta começar perto
  o bastante para alguém a usar.**
  **Porque é dela:** é tabela nova e é `backend`; e o jogador reaprende uma coisa
  só, mas grande — **que a luta começa em contacto**. Isso é fluxo.
  **O risco, dito pelo próprio `jogo`:** a aproximação é onde a posição vale
  alguma coisa, e abrir tudo colado achataria o combate no sentido oposto. **A
  defesa é a própria tabela:** ela não diz "colado", diz *"dentro do primeiro
  passo de alguém"* — e "alguém" pode ser o arqueiro, o que deixa o corpo a corpo
  com uma rodada de aproximação que passa a ser **uma escolha** (avançar sob fogo
  ou cobrir-se) em vez de uma caminhada.

- [ ] **(W1) o tabuleiro deixa de esperar o verbo: toca-se o ALVO primeiro, e a
  fileira responde com o preço de cada verbo** · pesado · de: desenho · 16/09
  **O diagnóstico acusa o desenho que a própria etapa acabou de fazer, e é por
  isso que ele vale.** A lei da casa é *o veredito antes do clique*. No fluxo
  **verbo → alvo**, o jogador escolhe **o que quer fazer antes de saber o que
  aquilo custa**: o primeiro toque é um compromisso às cegas, e o veredito só
  chega depois dele. ***W1 melhora muito o segundo toque e não melhora nada o
  primeiro.***
  **A proposta: inverter.** Tocar `Halvard`, e a fileira inteira responde de uma
  vez — `ATACAR` *armado* `3 m, ao alcance`; `SALTAR` *impedido* `4,5 m — o seu
  passo chega a 3`. **Vários vereditos ao mesmo tempo, antes de qualquer
  compromisso. São os mesmos dois toques** — muda **quando** ele sabe o preço.
  **A medida que a torna barata, e ela é o achado:** a fenda da razão **já está
  reservada nos botões e já custa 57 px no telefone**, e hoje **não mostra
  nada**. A proposta **não pede um pixel novo nem uma peça nova** — `Botao`
  *Impedido* com `a razao` e `Botao` *Armado* já existem os dois. **É a primeira
  composição em que aquela fenda tem um trabalho que mais nada faz**, e fecha por
  cima o achado de E1 de que a fenda e os tons de `A Consequência` *foram
  construídos duas vezes por acidente*.
  **Porque é dela:** o jogador reaprende **a ordem dos dois toques**. É fluxo.
  **O risco, dito pelo `desenho`, e não é pequeno:** várias razões em mono 10 px
  por baixo de vários verbos **podem ser uma parede de texto no momento mais
  tenso da mesa** — lê-se bem numa folha e mal com o coração acelerado. *"Não
  resolvo isto com desenho: resolve-se jogando."* A defesa que ele deixa escrita:
  **só os verbos armados escrevem; os impedidos ficam calados até serem
  tocados** — corta a parede a metade e mantém o ganho inteiro, **e é suposição,
  não medida**.
  *(Escrita com a fileira de seis de E1. Com a fileira de quatro que W1 decidiu,
  o ganho é menor e o risco também — e o `regente` diz por escrito que isso
  **enfraquece a proposta**, porque `Atacar` é o único verbo da fileira que se
  arma: com quatro, a inversão responde por um. Ela só volta ao tamanho cheio se
  a pessoa responder "dar-lhes motor" ao item seguinte.)*

- [ ] **(W1) os três verbos de teatro: dar-lhes motor, ou tirá-los da tela** ·
  pesado · de: jogo · 16/09
  `golpe.js:222-254` escreve, com o motivo, que **`Esquivar`, `Empurrar` e
  `Derrubar` não chegam a motor nenhum** — X2 preferiu **escrever o buraco a
  remendá-lo**, e teve razão. **Está na mesa há uma fase, e W1 obriga-o a sair de
  lá:** uma barra fixa não pode carregar teatro, e foi por isso que a fileira de
  seis de E1 virou uma de quatro. *Uma barra fixa em que metade dos alvos não faz
  nada mecânico ensina, em duas lutas, a não confiar na barra.*
  **Duas saídas, e as duas são dela.**
  **Dar-lhes motor.** `Empurrar` e `Derrubar` são disputa de força, e o motor não
  tem disputa entre duas fichas — é a peça que falta. **`Esquivar` é a mais
  barata e a que mais muda o combate:** a condição `protegido` **já existe em
  `condicoes.js`** e nada a concede a partir de uma declaração do jogador; é a
  única decisão defensiva que o jogador hoje não tem.
  **Tirá-los.** Com W2 a transformar a caixa em fala, *"empurro com força"* passa
  a ser **uma fala**, e uma fala num sítio onde a fala mora não é uma perda. **O
  `jogo` defende esta, se só houver uma** — os doze botões de `Ações` são,
  medidos, **um teclado de atalhos**, e um teclado de atalhos é o oposto do que
  esta fase entrega. *Mas tira ao jogador coisa de que ele depende, logo é dela.*

- [ ] **(E2) a régua mostra a planta INTEIRA, e a janela é uma marca dentro dela** ·
  pesado · de: desenho · 15/09
  **A proposta.** A régua deixa de rotular só as casas que estão na tela e passa
  a rotular **a planta toda** — as 18 colunas cabem nos 337 px do telefone a
  18,7 px cada, que é exatamente o `N = 2` que E1 já calculou; **a letra nunca
  sai, e custa zero casas**. A janela do campo vira um trecho realçado *dentro*
  da régua, como a alça de uma barra de rolagem que soubesse dizer nomes.
  **O porquê, e é uma frase:** hoje a régua responde *"como se chama isto que eu
  vejo"*, e a pergunta que um campo de **33 %** faz o tempo inteiro é **"o que
  existe que eu não vejo"** — que nada na tela responde. É a frase de E1 (*"uma
  régua que começa em F conta que A–E existem"*) feita à letra em vez de por
  inferência, e é o que torna *"vou até K14"* dizível sobre uma casa que o
  jogador nunca viu.
  **Por que é dela e não da mesa:** a régua deixa de bater casa a casa com o
  tabuleiro — deixa de ser o cabeçalho congelado da planilha e passa a ser um
  mapa do campo. Isso é o jogador a reaprender o que a borda significa, e **o
  risco só se resolve jogando**: pode ser que duas escalas na mesma tela
  confundam mais do que a borda muda informa.
  *(A alternativa barata, se a pessoa recusar: a régua fica como está e a
  **marca de borda** — `A marca de borda` `53:43`, já desenhada, variante
  *Quem = A casa* — passa a falar pela casa que está fora da janela. Resolve o
  caso agudo e não resolve a pergunta geral. **Depende de E3**, porque hoje o
  tabuleiro sempre cabe e nada fica fora da janela.)*

- [x] **a resposta dele sobre como quer ser perguntado morre no fim da luta** · **APROVADA 15/09, com uma correção de lugar.** A pessoa: *"se concordar comigo, pode mexer no save; se não, apresente sua proposta."* **Claude discordou do lugar, não da correção:** preferência é **da pessoa, não do personagem**. No save ela nasce presa àquela campanha — mundo novo esquece de novo (o mesmo defeito, menor), importar save de outra pessoa importa as preferências dela, e **cada modo tem o seu espaço de save** (`modos.js`), logo Uma Vida, Uma Noite e o Duelo perguntariam três vezes. **Onde fica:** um espaço de preferências do jogador, fora do save, válido em todos os modos e campanhas — uma vez na vida em vez de uma por campanha. **Cuidados:** o espaço não viaja no `exportarSave` (senão volta o problema por outra porta); quem não tem preferência guardada joga exatamente como hoje; e a preferência é **do jogador sobre como ser perguntado**, nunca estado de jogo — nada que mude número entra ali. ·
  *(K1b)* · **pesado** · de: jogo + regente · 15/09
  **O número, e foi achado a medir outra coisa.** A escada do silêncio é a
  generosidade automática da Fase K: duas janelas expiradas e o jogo **cala-se
  pelo resto daquela luta**, sem menu e sem aviso. Funciona — e **reinicia na
  luta seguinte**. Quem nunca quis a janela paga **33 200 ms por luta** para a
  desligar outra vez, e **22,1 minutos ao longo de uma campanha de 40 lutas**,
  em silêncios que ele já pediu quarenta vezes. *O jogo esquece, todas as noites,
  uma coisa que ele já respondeu.*
  **Há saída barata e ela não serve:** fazer a escada atravessar a campanha em
  memória resolve a aritmética e perde-se no primeiro `F5`. A resposta honesta é
  **a preferência viver no save**, e é aí que isto sai das nossas mãos: **formato
  de save é pesado, e é da pessoa.**
  **O que ela decide, em uma pergunta:** *a ficha guarda como o herói se defende,
  ou isso recomeça a cada luta?* Se guardar, a fila de quatro pílulas de K1
  (*eu decido · sem pressa · aparar sempre · deixar passar*) deixa de ser uma
  preferência de sessão e passa a ser **parte da personagem** — que é, aliás, o
  que a ficção sempre disse que ela era.
  **O risco, dito:** um save que guarda preferência é um save que pode guardar
  mal, e a campanha é intocável. Mexer no formato pede a mesma cerimónia de
  qualquer mudança de save — migração, e um jogo antigo que abre sem a chave tem
  de cair no padrão `normal`, nunca em silêncio.
  **E o custo de não decidir é zero hoje:** K3 constrói com a escada por luta,
  como está, e o dia em que a pessoa disser sim é uma chave a mais no save.

- [x] **o dano aparece antes de doer** · **RECUSADA 15/09, e o relógio subiu junto.** A pessoa: *"acho que ficaria melhor o dano vir surpresa e aumentar o relógio — daria mais emoção e realmente se compararia a uma reação; talvez 15s, pra que fique tranquilo até pra pessoas com dificuldade."* **O que isso decide:** a reação é **instinto, não cálculo** — o jogador escolhe sem saber o tamanho do golpe, e é isso que a torna uma reação de verdade. O número medido que sustentava a proposta continua verdadeiro (o sistema TEM o dano na mão antes de doer) e deixa de ser usado, de propósito. *(K1)* · pesado · de: jogo · 15/09
  **A janela da reação é o único instante do jogo inteiro em que o sistema tem na
  mão um número que ainda não aconteceu.** `a.r.dano` existe em `App.jsx:7572` e
  só vira PV mais à frente. A proposta é usá-lo: a primeira linha do cartão deixa
  de ser *"o ogro do beco golpeia você"* e passa a **"o ogro do beco — 9 de dano a
  caminho"**, e cada verbo traz a conta **já feita** contra o PV que está na tira:
  > **aparar** · 0 PM — **9 vira 4**, você fica em 13
  > *deixar passar* · não gasta PM — **9 inteiros**, você fica em 8

  **Porque não é enfeite, e é o argumento todo.** Sem o número, as reações ficam
  na **mesma ordem em todas as lutas**: o jogador escolhe sempre a melhor que tem
  — que é **exactamente o que `escolherReacao` já faz por ele, e faz bem**. Nesse
  mundo a janela acrescenta toques e **muda nada**: é uma reimplementação manual
  de uma decisão automática correcta, que é a definição de um mecanismo que
  cansa. Com o número, a ordem **muda a cada golpe**: a 17/20 poupa-se o PM, a
  6/20 gasta-se tudo. **É a diferença entre um menu e uma decisão** — e é a única
  decisão que o sistema **não pode** tomar por ele, porque só ele sabe se está a
  guardar PM para o chefe. **E o argumento ficou mais forte em K1:** como o caso
  comum é **uma reação só**, sem o número a janela é literalmente uma lista de um
  item com ordem fixa.
  **E o relógio força a mão.** Ninguém faz `9 × 0,5` e compara com `17 PV` em
  quatro segundos enquanto lê prosa. Se a janela mostra proporções e lhe deixa a
  aritmética, o relógio **garante** que ele responde por hábito e não por leitura.
  ***Uma decisão de quatro segundos só se pode tomar sobre informação já
  calculada. Ou se mostra a conta, ou não se devia pôr relógio.***
  **Custo: zero mecânica nova, zero tabela nova** — é `Math.round(dano * corta)`
  corrido em pré-visualização, e cabe na fenda de preço que já existe (26 e 27
  caracteres, dentro dos 40 medidos): **mesma peça, mesma altura, zero píxeis a
  mais**.
  **O risco, dito pelo próprio `jogo`:** mostra o dado do inimigo antes de o
  jogador reagir, o que este jogo nunca fez. É uma facilitação — pequena, e **só
  para quem responde**: quem ignora tem o jogo de hoje, byte a byte. *"Ver o
  tamanho do machado que vem é o que a personagem veria."* **E se a pessoa disser
  que não, a Fase K continua a fazer sentido — mas então o relógio tem de ser mais
  generoso, porque a conta passa a ser dele.**

- [x] **`lineStrong`: a casa não sabe dizer "sou um controlo" sem gritar** · **APROVADA 15/09** — vira etapa da mesa: a paleta ganha o degrau que falta entre desaparecer e gritar. *(K1)*
  · pesado · de: desenho · 15/09
  **A medida que o apanhou:** `line`/`panel` = **1,29:1** e `panelSoft`/`panel` =
  **1,07:1**. As quatro superfícies da casa cabem dentro de 1,3:1 umas das outras
  — **para a WCAG 1.4.11 são uma superfície só**. Consequência prática: um
  controlo desta casa **ou se enche de `amber` (8,45:1) e grita, ou desaparece**.
  Não há meio-termo, e foi por isso que o recuo *deixar passar* — o botão de quem
  **não quer gastar PM** — teve de ser remendado com um override em vez de
  resolvido.
  **A proposta é um token só:** `lineStrong` = `#70688C`, **o degrau mais baixo**
  que passa 3:1 contra as três superfícies (panel 3,51 · bg 3,74 · panelSoft
  3,27). Foram testados cinco; `#645D7D` falha a 2,95.
  **Paga um remendo removido** (o override deixa de ser preciso), é **reversível
  por uma linha em `T`**, e tem **par comparável montado** na folha `74:64`.
  **O risco, dito:** cinco linhas contornadas podem ler-se como grelha — e isso
  está desenhado, não jogado. E só rende nos **6,8 %** de controlos que passam por
  `ui.jsx`. **Vai à pessoa porque paleta é identidade**, e identidade não é peso
  médio por mais pequena que seja a mudança.
  *(Nasceu de o `desenho` se desmentir: escreveu na primeira rodada que o piso de
  contraste estava "cumprido com folga em todos", foi medir, e não estava.)*

- [x] **a rodada tem três batidas, e o jogador toca as três** · **APROVADA 15/09 — e a pessoa devolveu a forma à mesa:** *"decida como designer UX e designer de games experientes, de forma que seja a melhor experiência jogável e visual"*. Vira a **Fase K**, e a mesa decide sem perguntar · pesado · de: jogo · 14/09
  **O que ele vive hoje.** Uma rodada de combate é: escrever uma frase, o
  sistema resolver tudo, e ler vinte linhas. As regras já modelam **três**
  coisas que são do jogador — mover, agir e reagir — e ele toca uma e meia.
  **Mover** já é clicável e ninguém sabe: quando a luta abriu, o tabuleiro
  estava **429 px abaixo da borda visível** e o scroller não rolou sozinho
  (`scrollTop = 0` de 1129 possíveis); rolado até ao fim, **41 das 86 casas**
  cabem na tela. **Agir** é um botão de **720 px²** (45×16) — enquanto, três
  centímetros acima, na mesma tela, o `⚔ A PRÓXIMA LUTA` mede **54.912 px²**.
  E **reagir não tem controle nenhum**: `src/reacoes.js` tem **seis** reações
  com gatilho, custo em PM e resolução, e `escolherReacao` escolhe sozinha a
  primeira que se aplica, **gastando o PM da ficha do jogador**
  (`App.jsx:7572`, débito em `:7577`). Numa luta inteira o `jogo` tocou
  **três** controles: duas casas e o `⛺` que encerrou a luta por engano.
  **As três batidas.** *Primeira:* a luta começa e **o campo é a primeira
  coisa que ele vê**. *Segunda:* antes de pisar, ele **vê o que o passo
  custa**, na casa, e o medidor de metros diz a verdade. *Terceira:* o golpe
  inimigo chega e, **antes de o dano assentar**, o jogo pergunta uma coisa
  curta — *"Aparar? — corta metade"*. Ele responde, ou não responde.
  **O que ele reaprende, e é uma coisa só:** que o jogo pode lhe fazer uma
  pergunta no meio do turno do inimigo, e que **não responder é uma resposta
  válida**. Nenhum botão sai do sítio, nenhum gesto antigo deixa de
  funcionar — mas isso é o fluxo do combate, e o fluxo é da pessoa.
  **Ao `backend`:** a janela é regra, sai de tabela nomeada; o padrão de quem
  não responde é **byte a byte** o `escolherReacao` de hoje; a catraca é uma
  frase — *mesma semente, ninguém responde, mesmo resultado de hoje*.
  **Regressão zero, provada em Node.** *(E uma dívida que aparece de graça:
  `reacoes.js:96` decide por `Math.random()` — a lei é determinismo por
  semente, e o sorteio da reação hoje não a cumpre.)*
  **Ao `desenho`:** a peça **A pergunta que expira**, que não existe e ficou
  nomeada em `formas.md` como dívida — um controle que aparece, oferece uma
  escolha com o preço escrito, e **some sozinho sem punir quem não
  respondeu**. Não é *O gesto que custa* (esse espera para sempre) nem um véu
  (esse toma a tela). Sem ela, a terceira batida não existe.
  **O risco, dito pelo `jogo`:** um jogo que espera resposta pode virar um
  jogo que cansa. Quatro defesas, e duas já são regra: (1) o sistema **já**
  recusa gastar reação em arranhão (`reacoes.js:93-94`), então a janela herda
  a parcimônia; (2) **uma por rodada**, que também já é regra; (3) **quem não
  responde, o sistema responde como hoje — nada regride**; (4) se o jogador
  deixar expirar algumas vezes seguidas, o jogo **para de perguntar** pelo
  resto da luta, sem nomear o mecanismo.
  **O melhor argumento é da própria casa** — estudo citado, e a origem é o
  cabeçalho de `src/reacoes.js`: *"no 5e e no BG3 metade da tensão do combate
  mora aqui: o golpe vem, e você tem uma janela para aparar…"*. Sete linhas
  abaixo, o mesmo comentário entrega a decisão ao sistema. **O módulo
  diagnostica o problema e depois o causa.** É o mesmo que a pessoa já
  aprovou em S1 — *o motor não muda; o que muda é quando o jogador fica
  sabendo* — aplicado à rodada em vez de à queda.

- [x] **`Atacar` ataca — os verbos de combate saem do autocompletar** · **RESPONDIDA 15/09 — virou a Fase X**, e X1 já mediu (v9.253) · pesado · de: jogo · 15/09 (D5)
  **O achado está dentro de um painel só, e ele tem duas metades.** O painel
  `Ações` (`App.jsx:20548`) tem duas fileiras separadas por uma linha
  tracejada. Em cima, `ACOES_PRONTAS` — **12 botões**, com `Atacar` em âmbar
  porque, diz o comentário da própria casa, *"é a ação que o jogador procura
  primeiro"* (`:20559`). Todos os 12 fazem a mesma coisa:
  `setEntrada(a.texto)`. **`Atacar` não ataca: ele digita `"Ataco "` na caixa
  de texto.** Embaixo, `ACOES_RAPIDAS` (`desafios.js:621`) — **8 botões** que
  chamam `declararAcaoRapida(id, motivo)` e entram **direto no sistema**, que
  decide se pede dado e já sabe responder *"você já tentou isso aqui"*.
  **Nenhum dos 8 é de combate.** Vasculhar, Investigar, Escutar, Lembrar,
  Convencer, Intimidar, Esgueirar, Arrombar — as coisas mais passivas do jogo
  atravessam o motor; **Atacar, Esquivar, Empurrar, Derrubar e Saltar** ficam
  do lado que escreve. A porta do motor existe, está provada, tem teste que
  confere botão contra desafio (`desafios.js:629-631`), e **nunca foi aberta
  para a violência**.
  **Experiência jogada (15/09, campanha `O Fio de Prata`, Brann nv 1, 7
  turnos com o Narrador vivo).** Declarei ataque **três vezes**, em português
  sem ambiguidade (*"puxo a espada e ataco Halvard na cara"*, *"avanço e
  golpeio Halvard com a espada"*, *"corro os últimos metros e enfio a espada
  em Halvard"*), dentro de um combate aberto, com iniciativa rolada e o
  tabuleiro montado. **Zero rolagens de ataque.** O único dado da sessão foi
  de **Intimidação** — uma prova social. O terceiro golpe virou uma cena em
  que todos conversam e *"Brann recua para sob a arcada"*: o combate
  simplesmente acabou, escrito. No fim dos 7 turnos: **PV 20/20, PM 6/6, XP
  89/300, relógio 08:45** — os mesmos quatro números do primeiro turno.
  **A régua da mesa aplicada ao pé da letra:** *"o jogo realmente está fazendo
  coisas — não só lendo e escrevendo"*. Hoje o verbo mais importante do jogo é
  literalmente autocompletar. E a lei da casa está invertida no pior lugar
  possível: *o Mestre é código, e a IA só narra* — mas **quem decide se o
  golpe aconteceu é a IA**. O motor de combate (a grade, o alcance, os metros,
  as 6 reações com custo em PM, o dano que flutua) fica esperando ser
  convidado por uma frase.
  **A forma, decidida e não perguntada:** `Atacar` deixa de preencher a caixa
  e passa a fazer o que a grade **já** faz para o movimento — acende o
  conjunto de alvos ao alcance e espera um toque. O jogador escolhe quem, vê
  o preço antes (alcance, o que sobra do turno), e o motor resolve. O que ele
  tiver escrito na caixa viaja junto como `motivo`, exatamente como
  `declararAcaoRapida(id, motivo)` já faz hoje com os 8 de baixo: **a frase
  deixa de ser a sintaxe obrigatória e vira o tempero**. Os mesmos 5 verbos,
  no mesmo lugar, com o mesmo rótulo.
  **O que ele teria de reaprender, e é uma frase:** que `Atacar` já não
  escreve a frase por ele — ele escolhe o alvo, e o que digitar passa a
  dizer *como*, não *se*.
  **O preço, dito por escrito:** o Narrador perde o veto sobre a violência, e
  algumas lutas vão ficar mais secas — às vezes o veto dele é boa escrita
  (foi o que me aconteceu, e a cena era boa). Três defesas: (1) a porta é a
  **mesma** dos outros 8, com o livro de tentativas inteiro atrás dela — nada
  de atalho novo; (2) o Narrador continua narrando o resultado, só deixa de
  decidir se a rodada existiu; (3) quem quiser a frase inteira continua
  podendo escrevê-la e apertar `Agir →` — nada é retirado, só deixa de ser
  obrigatório.
  **Ao `backend`:** os 5 verbos de combate precisam de linha no catálogo de
  `desafios.js` (é tabela, e o teste que já confere botão contra desafio passa
  a cobri-los). A regra não muda: alcance, dano e reação são os de hoje.
  Catraca: *mesma semente, mesmo alvo, mesmo resultado que a frase escrita
  produz hoje*.

- [x] **(E1) O turno monta-se antes de acontecer** · **APROVADA 15/09 — virou a Fase W** · pesado · de: jogo · 15/09 (E1)
  **O que ele vive hoje, contado toque a toque.** Uma rodada de combate é: abrir
  `Ações` (1), tocar `Atacar` (1, **que escreve `"Ataco "` na caixa**), escrever
  o alvo (~15 toques de teclado), tocar `Agir →` (1) — **e o golpe ainda pode
  não acontecer**. Medido a jogar em 15/09, campanha *O Fio de Prata*, 7 turnos
  com o Narrador vivo: três ataques declarados em português sem ambiguidade,
  dentro de um combate aberto, com iniciativa rolada e tabuleiro montado —
  **zero rolagens**. No fim, os mesmos quatro números do primeiro turno.
  **A proposta.** O turno deixa de ser uma declaração e passa a ser **uma frase
  que se monta no tabuleiro e se paga de uma vez**: o jogador encadeia *andar
  até H14 → atacar Halvard*, e a linha do veredito mostra **o total a correr** —
  os metros gastos, a ação gasta, os golpes livres que aquilo provoca — **antes
  de qualquer coisa acontecer**. Só então confirma. É o turno do 5e e do BG3, e
  é o que faz um turno tático parecer uma **decisão** em vez de uma submissão.
  **Por que é dela.** A regra de hoje é `App.jsx:3079` — *"Agir É encerrar"* — e
  isto pede ao motor que **segure um turno por confirmar**: é `backend`, é regra
  nova. E o jogador reaprende uma coisa só: **que agir deixou de encerrar, e que
  existe um momento entre escolher e pagar.**
  **O risco, dito pelo `jogo`:** um turno que se confirma é um turno com mais um
  toque. A defesa é que **o passo limpo continua a ser um toque** e o golpe
  limpo também — a montagem só existe quando o jogador **encadeia**, e encadear
  já é dizer que ele quer decidir antes de pagar. Quem não encadeia nunca vê a
  diferença.

- [x] **(E1) O tabuleiro conta o que o inimigo VAI fazer** · **APROVADA 15/09 — virou E5** · pesado · de: jogo · 15/09 (E1)
  **Experiência jogada:** numa luta inteira o `jogo` fez **zero decisões
  espaciais**, porque nada no campo pagava por estar num sítio em vez de noutro.
  Um tabuleiro onde a posição não muda nada é um tabuleiro decorativo — e este
  tem paredes com cobertura, terreno que cobra, alcance por tamanho e golpe
  livre por dar as costas. **A regra está toda lá; falta o jogador poder usá-la.**
  **A proposta.** Antes do turno do inimigo, **o campo mostra o que ele vai
  fazer**: as casas que ele ameaça acendem em contorno `danger`, com o alvo
  escrito. O jogador vê e decide — sair, cobrir-se, aceitar. **Estudo citado:**
  é o desenho do *Into the Breach* (Subset Games, 2018), o caso canônico — a
  dificuldade deixa de estar em adivinhar e passa a estar em **resolver**.
  **Por que é dela.** Exige que o motor **decida a ação do inimigo uma batida
  antes e a honre** — regra nova. E o jogador reaprende que **o tabuleiro diz o
  futuro**, que é a coisa mais forte que se lhe pode ensinar sobre esta tela.
  *(Tem um parente já aprovado: é a mesma ideia de S1 — o motor não muda, muda
  quando o jogador fica sabendo.)*
  **O risco.** Um campo que anuncia tudo tira o susto. A defesa é de tabela e
  não de desenho: **nem toda ação se anuncia** — o anúncio é atributo da
  criatura (o troll telegrafa, o assassino não), e aí **a ausência do anúncio
  passa a ser informação também**.

- [x] **(E1) Em combate, o texto deixa de ser o caminho da AÇÃO e passa a ser o caminho da FALA** · **APROVADA 15/09 — virou a Fase W** · pesado · de: desenho · 15/09 (E1)
  **A medida.** Dos 20 botões do painel `Ações`, **12 só digitam**
  (`ACOES_PRONTAS`, `App.jsx:1071-1084`, `setEntrada(a.texto)`); os 8 que entram
  no motor não são de combate. Para atacar, gasta-se **uma chamada ao Mestre**
  para que uma IA leia *"Ataco o ogro"* e descubra o que o motor já sabia.
  **A proposta.** Na tela de batalha, **toda ação mecânica acontece por toque** —
  verbo + casa, com o preço antes do clique — e **o Mestre narra o resultado uma
  vez por rodada**. O campo de texto fica e muda de emprego: já não é *"O que
  você faz?"*, é **"diga alguma coisa"** — a provocação, a parlamentação, a
  frase que o jogador quer que fique na crônica. Uma rodada passa de *N chamadas
  ao Mestre* para **uma**.
  **É a única proposta desta fase que DEVOLVE quota ao Narrador em vez de lha
  cobrar** — e a quota acabou duas vezes nesta fase (D1 e D4), deixando o jogo
  injogável. O combate é justamente o momento em que o motor é mais competente e
  a IA menos necessária.
  **O que ele reaprende, e é uma coisa só:** *em combate, não se escreve para
  agir — escreve-se para falar.* Nada sai do sítio fora da batalha.
  **A versão moderada, se a radical for longe demais:** o campo continua a
  aceitar ação escrita (inclusive *"vou até H20"*, que a régua torna possível),
  **mas deixa de ser o único caminho**. O ganho de chamadas é menor; o de
  ergonomia é o mesmo.
  **A ressalva honesta, e ela é grande, e é do próprio `desenho`:** este é um RPG
  de texto, e há risco real de que uma luta muda deixe de ser uma luta
  *narrada*. É por isso que é dela e não da mesa: **o que muda é o que o produto
  é**, não como ele se parece.

- [x] **O Pergaminho — a prosa ganha material próprio** · pesado · de: desenho · 15/09 (D5) · **APROVADA 15/09** — vira fase própria; depende de D5, que já está de pé
  **O que a medição de D5 mostra, e que ninguém foi procurar:** o Taverna tem
  **três paletas**, não uma. A semântica (`T`, 14 cores, 2.565 usos), a do
  **pergaminho** (71 literais em `painel-mapa` + `planta-cidade`, **zero** cores
  de `T` — uma paleta inteira, coerente e anônima, com 10 hexes escritos igual
  nos dois arquivos) e a do dado de jogo (77). A casa fabricou, sem decidir, um
  segundo material — papel velho sob luz quente — e **gastou-o inteiro em
  mapas**, que o jogador abre uma vez por sessão.
  **Cruzado com D1:** `tv-mono` tem **682 usos contra 315 do corpo e 108 do
  display**, e **542 dos 1.107 textos dimensionados (49%) são 9px ou 10px**. Num
  RPG cuja primeira lei escrita é *"a prosa é a protagonista"*, a prosa é
  servida no mesmo `<div>`, do mesmo material, com a mesma borda e o mesmo raio
  que o inventário — e metade do jogo está escrita na fonte que existe para
  dizer "isto é um número de máquina".
  **A proposta:** a narração deixa de ser um painel e passa a ser **uma
  superfície**. Um único lugar no jogo inteiro onde a interface se cala: sem
  mono, sem 9px, sem borda de painel, sem `T.line` — corpo Spectral no tamanho
  de leitura, medida travada entre 45 e 75 caracteres por linha, entrelinha de
  leitura, e a luz do pergaminho (que já existe, já é coerente e já está paga) a
  distinguir *"isto é a história a acontecer"* de *"isto é o sistema a
  informar"*. Toda a restante interface continua como está. Não é uma tela nova:
  é dar à coisa que o jogador lê durante noventa por cento da sessão um
  **material que nenhuma outra coisa do jogo tem**.
  **A prova, pelos três caminhos, e todos já estão ao alcance:**
  *Medida* — caracteres por linha, corpo em px, entrelinha e o par de contraste
  prosa/fundo, no telemóvel e no monitor, antes e depois. **Se qualquer par de
  contraste piorar, a proposta está errada por definição** — a lei é do
  `desenho` e vale contra ele. *Estudo citado* — WCAG 2.2 SC 1.4.8 *Visual
  Presentation* (largura máxima de 80 caracteres, entrelinha mínima de 1,5) e SC
  1.4.4 *Resize Text*; Apple HIG (corpo 17pt); Material 3 (*body-large* 16sp);
  Bringhurst, *The Elements of Typographic Style*, sobre a medida de 45–75
  caracteres. *Experiência jogada* — o `jogo` lê uma sessão de 6 turnos de Uma
  Vida no antes e no depois **com a mesma semente**: o mesmo texto, palavra por
  palavra, nos dois materiais. É o par comparável que a régua exige, e este
  projeto é dos poucos onde ele é exatamente reproduzível.
  **Por que é `pesado` e está aqui:** a pergunta é *"o jogador teria de
  reaprender?"*, e a resposta é **talvez sim** — a coluna de narração pode mudar
  de largura e de lugar na tela, e é o sítio para onde ele olha por omissão.
  Nada muda de nome, nada muda de fluxo, nenhum controle sai do lugar. Mas o
  sítio onde ele lê, sim. Isso é dela.
  **A dependência honesta:** esta proposta **precisa** de D5 fechado. Sem a
  catraca, um material novo nasce como mais 40 literais soltos num arquivo de 20
  mil linhas, e no ciclo seguinte é a quarta paleta anônima do projeto. Com a
  catraca, o Pergaminho **tem de** nascer como tabela — e portanto como um
  commit que se desfaz se a pessoa não gostar. É esse o argumento inteiro de D5,
  e é por isso que o item mais ambicioso desta fase é o que mais depende dela.

- [x] **o turno acontece mesmo quando o Narrador cala** · **RESPONDIDA 15/09 — virou X3 · X3b · X3c**, com a proposta do turno guardado aprovada pela pessoa · pesado · de: jogo · 14/09
  **Experiência jogada, duas vezes na mesma fase** (D1 e D4): a quota do
  Narrador acabou e **o jogo parou de ser jogável** — nem um turno de Uma
  Vida, nem um do Capítulo. Mas o achado que importa é o contrário: **o
  combate funcionou com o Mestre calado.** A luta abriu pelo sistema, o
  `jogo` andou no tabuleiro, o log escreveu o passo, e o Mestre não disse uma
  palavra. **O Taverna já tem um coração que bate sem a IA, e desliga-o por
  inteiro quando ela cala.**
  Depois: o turno resolve, o sistema escreve o que aconteceu na linguagem que
  já escreve (o dado, o dano, o passo, o espólio), e **a narração é o que
  falta, não o que impede**. É a lei da casa no caso extremo: *nunca pode
  custar o turno.*
  **É `pesado`** porque o jogador reaprende que existe um turno sem prosa, e
  porque a pergunta de baixo é de produto — *o que o Taverna é quando o
  Narrador não está?* Essa é dela, não da mesa. **Mas a mesa não pode calar
  sobre ela:** foi a única coisa que impediu esta fase inteira de medir um
  turno vivo.

- [x] **A batalha toma a tela** · **APROVADA 14/09 — virou a Fase E** (tela própria de batalha + tabuleiro com endereço)
  O `jogo` jogou e mediu: o campo tático de 16×16 vive dentro do scroller
  narrativo de **301 px de altura** com `overflow: hidden auto`. O painel
  `Ações` abre **abaixo da dobra** — clica-se e não aparece nada. `⤢ ampliar`
  promete "tela cheia" no `title` e abre **outro bloco dentro do mesmo
  scroller clipado**: o campo inteiro nunca foi visto, em partida nenhuma. Em
  1280×860 o jogo ocupa 560 px à esquerda e **mais de metade do ecrã fica
  preta**. Já estava marcado pesado no `CLAUDE.md`; agora tem a prova.
- [x] **O Duelo é jogado, não lido** · **APROVADA 14/09 — virou S1**
  **3 cliques do menu ao resultado final**, sem um turno pelo caminho. E o
  vencedor aparece **antes** das 48 linhas de log das três quedas — não há
  uma única linha de tensão no modo inteiro. Queda a queda, com o resultado
  por último.
- [x] **A sala ao vivo precisa de um momento partilhado** · **APROVADA 14/09 — virou S2**
  Testado em duas abas reais: a escolha sincroniza em ~1 s, o **resultado
  não**. Um lado viu a luta inteira; o outro ficou 10 s parado sem aviso,
  sem luz, sem "o duelo aconteceu". Mecanicamente correto (os selos batem);
  como experiência, dois jogadores lendo o mesmo PDF em salas separadas.
- [x] **O jogador precisa de uma forma de se mover que não dependa do
  Narrador** · **APROVADA 14/09 — virou E2+E4** (o tabuleiro ganha endereço de xadrez, e a casa vira clicável)
  Três rodadas escrevendo "me aproximo" e o log só reportava o movimento do
  **inimigo**. Clicar numa casa dentro do próprio retângulo tracejado dourado
  não faz nada — a grelha não é clicável. Ao fim: `9 de 9 m nesta rodada`,
  **nunca andei um metro**, com o jogo mandando "aproxime-se primeiro".
- [x] **`Esc` fecha, e o fundo fecha, em toda sobreposição** · **APROVADA 14/09 — virou G1**
  **15 sobreposições, 4 regras de fecho diferentes**, e `Escape` não fecha
  nenhuma (há 6 `onKeyDown` no `src/` inteiro, todos `Enter`). O jogador
  descobre caso a caso se sai clicando fora, num `✕` de 10px, ou num botão
  âmbar de 48px. É fluxo, e mexe no que o jogador já aprendeu.
- [x] **A escala de texto vira tabela** · **APROVADA 14/09 — virou a Fase L**, com a régua da pessoa: tamanhos comprovados por plataforma
  **18 degraus de tamanho**, e **542 dos 1.107 textos dimensionados (49%) são
  9px ou 10px** — em JetBrains Mono, a fonte "do que é máquina", que tem 682
  usos contra 315 do corpo. O contraste da paleta passa AA com folga
  (`inkDim` sobre `panel` = 6,21:1), e é por isso que nenhum alarme
  automático dispara: a WCAG não tem piso de tamanho. 18 degraus → 6 ou 7, e
  o piso sobe. Encosta em identidade visual e em toda tela.
- [x] **O nó entre o Figma e o código custa um plano** · **RESPONDIDA 14/09 — virou a Fase M**: o caminho dos tokens não precisa de Code Connect (D3 provou a leitura no plano atual); os componentes ficam com convenção + varredor, que é pior e é declarado. Subir de plano deixa de ser bloqueio e vira melhoria · de: regente · 14/09 (achado em D3)
  D3 entregou as variáveis e as peças, mas **não o nó**, e não por perícia:
  `list_file_components_for_code_connect` responde, literalmente, *"You need
  a Dev or Full seat on an Organization or Enterprise plan to use Code
  Connect"*. O `whoami` explica — a equipe é **`tier: pro`** com assento
  Full; o assento existe, **o plano não**. Sem Code Connect, a biblioteca e
  o `ui.jsx` **podem divergir em silêncio**: nada liga um componente do
  Figma ao componente de código, e a única amarra é um script de comparação
  que alguém tem de lembrar de rodar. É **pesado** por duas razões da tabela
  do `CLAUDE.md`: custa dinheiro, e muda como esta mesa trabalha. A mesa não
  decide isto sozinha — e enquanto não for decidido, **toda etapa de design
  carrega o risco de as duas verdades se separarem sem ninguém notar**.

- [x] **A ação principal tem a mesma cara nos três modos** · **APROVADA 15/09 — a mesa decide** (*"decida como designer UX e designer de games experientes"*). D4 já mediu: 720 px² contra 1144×48. Uma forma só, nos três modos · de: desenho · 14/09
  "aja agora" é `<Botao primario pequeno>Agir →</Botao>` (mono 12px) em
  `historia`, faixa `tv-display` de 18px no torneio, e outra faixa
  `tv-display` de 18px com padding diferente em `rapida`/`duelo`. O
  `CLAUDE.md` diz que modo é *"lente sobre o mesmo motor, nunca um segundo
  jogo"*; visualmente, hoje, é um segundo jogo. Mover o que o jogador já usa.
  *(**D4 decidiu a forma, e o número ficou pior do que parecia:** `Agir →` =
  45×16 = **720 px²** contra `⚔ A PRÓXIMA LUTA` = 1144×48 = **54.912 px²** —
  **76×**, e as duas **na mesma tela, a três centímetros uma da outra**. Não
  é divergência entre modos: é dentro de uma tela, e o modo **padrão
  absoluto** tem a menor chamada do jogo. A decisão está escrita em
  `formas.md`: uma peça só, mesma família e mesmo tamanho de letra, a largura
  como variante. **O que continua da pessoa é executá-la** — subir o `Agir →`
  de 12px para 16px mexe no que o jogador já usa, e o `jogo` achou a
  armadilha: o campo do turno é um `<input>` onde `Enter` manda, e a peça
  nova é um `textarea` onde `Enter` quebra linha. **Trocaria em silêncio o
  gesto mais repetido do jogo.**)*

## A lei que a pessoa deu à mesa (14/09)

> *"Nós estamos criando um jogo. Apesar de seu coração ser em leitura,
> devemos fazer o máximo para ter a experiência de um jogo e que ele
> realmente está fazendo coisas — não só lendo e escrevendo."*

Isto não é um item: é a régua de toda proposta desta fila. Sempre que o
`jogo` e o `desenho` escolherem entre uma forma que **conta** o que
aconteceu e uma forma que **deixa o jogador fazer**, a segunda ganha — e o
que não puder ser feito deve ao menos ser **visto acontecendo**, não
recebido pronto em prosa. A prosa continua sendo a protagonista; o que se
recusa é que ela seja a **única** coisa que o jogador toca.

## A terceira lei da mesa (15/09)

A pessoa, ao aprovar O Pergaminho: *"gostei muito de que essa sugestão já veio
com uma proposta e inclusive muito bem fundamentada. Gostaria que todas
viessem assim se possível — não precisa ter uma explicação gigante nem nada
do tipo, mas vir com uma proposta e dizendo o porquê é muito bacana."*

Então **toda proposta traz as duas coisas, e em poucas linhas**: o que fazer,
e por quê. Nunca só o diagnóstico — *"a escala de texto está errada"* não é
proposta; *"18 degraus viram 6, o piso sobe para 13px, porque metade do texto
hoje é 9–10px e a prosa é a protagonista"* é. E nunca uma parede de texto: o
porquê cabe numa frase se a proposta for boa. Quem não sabe dizer por que,
ainda não terminou de pensar.

Vale para as duas mentes: o `conselheiro` e o `regente` cobram isto de quem
propõe.

## A segunda lei da mesa (14/09)

> *"Faça da forma que um experiente designer de UI e game designer fariam."*

Quer dizer: **decida.** Onde um profissional experiente decidiria sozinho —
o tempo de uma barra, o tamanho de um alvo de toque, a ordem de um leque, o
que não perguntar ao jogador — **decida e escreva o porquê**, em vez de
devolver a escolha. A pessoa não quer ser consultada sobre ofício; quer ser
consultada sobre o que muda o jogo dela. Perguntar demais é uma forma de
timidez, e a timidez já é o defeito.

## Aprovado pela pessoa — executa como fase, UMA etapa por ciclo

### Fase M — o caminho dos tokens (o Figma manda, o código obedece)
Proposta da pessoa (14/09): *"os agentes de design ganham liberdade total
para criar e alterar layouts no Figma, desde que usem estritamente as
Variáveis e Estilos nativos. Antes de codificar, o Claude Code lê esses dados
brutos direto do arquivo pelo MCP e atualiza automaticamente um único arquivo
de estilos globais no repositório. Os agentes de programação usam apenas as
classes desse arquivo centralizado, garantindo que qualquer alteração visual
feita pelos designers seja replicada de forma idêntica, eliminando a chance
de o código ficar diferente ou baseado em achismos."*

**É viável, e — o que importa — não depende do plano.** D3 já provou a
leitura: `get_variable_defs` puxou as 27 variáveis a frio e bateu **26/27**
contra `src/estilo.js`, com a única divergência sendo formato de alfa (o
Figma guarda num byte: `.45` volta `0,45098`; a regra é comparar com
tolerância de 1/255). **Code Connect é outra coisa** — ele amarra
*componentes*, exige Organization/Enterprise, e **este caminho não o usa**.

**Duas correções de rumo, ditas antes de custar tempo:**
1. **Não há `tailwind.config.js`.** O Tailwind entra pela CDN no
   `index.html`, então o "arquivo único de estilos globais" já existe e é
   **`src/estilo.js`** (criado em D2). Não se cria um segundo.
2. **A direção se inverte, e isso tem preço.** Hoje `estilo.js` é a fonte e
   o Figma é o espelho. Aqui o Figma passa a mandar, e o arquivo vira
   **gerado** — logo não pode ser editado à mão nunca mais, e o erro de um
   designer chega à produção sozinho. Por isso a catraca não é opcional.

- [ ] **M1 · o gerador** · de: pessoa · 14/09
  Um script que lê as variáveis do arquivo do Figma e escreve `src/estilo.js`
  inteiro — cabeçalho dizendo que é gerado, a origem, e a data. Roda por
  comando, não por mágica. Determinístico: rodar duas vezes sem mexer no
  Figma não muda um byte.
- [ ] **M2 · a catraca que impede o desastre** · de: pessoa · 14/09
  Com o Figma mandando, um engano lá vira produção aqui. Então o gerado
  **passa por prova antes de valer**: contraste de cada par texto/fundo
  dentro da norma, nenhum token sumido que alguém ainda importe, nenhum
  valor fora de faixa. `npm test` vermelho se regredir — e a regra do teto
  de alfa (1/255) escrita onde se compara, não na memória de ninguém.
- [ ] **M3 · a deriva denunciada** · de: pessoa · 14/09
  Um varredor que compara o `estilo.js` do repositório com o Figma **e
  reclama quando divergem** — é o que substitui o Code Connect na metade dos
  tokens: não impede a deriva, mas não a deixa acontecer calada. Entra no
  `rodar-tudo.mjs`.
- [ ] **M4 · os componentes, sem Code Connect** · de: pessoa · 14/09
  A metade que o plano cobraria: amarrar componente do Figma a componente de
  código. Sem a ferramenta, a amarra é **convenção + varredor** — nome igual
  dos dois lados, declarado em `mente/formas.md`, e um `check-` que falha
  quando um existe sem o outro. **É pior que Code Connect e é honesto sobre
  isso:** prova hoje, não impede amanhã. Se a pessoa um dia subir de plano,
  esta etapa é substituída, não remendada.

### Fase W — o turno por toque (a ação deixa a caixa de texto) · **FECHADA 16/09**
Duas propostas do `jogo` e do `desenho` em E1, **aprovadas pela pessoa em
15/09**. São a metade de desenho da Fase X do sistema, e andam junto com ela.

> **A fase está fechada: W1 e W2 estão feitos, e os dois eram etapas de
> DECISÃO — `W3 · o gesto construído` é a mão que as constrói, e fica aberta.**
>
> **O que a fase descobriu, e é mais interessante do que o que ela propunha:**
> **os dois enunciados estavam errados, e os dois erros eram o mesmo erro** —
> descreviam um jogo que o código já tinha mudado e que ninguém reconferira.
> W1 prometia matar ~18 toques que **X2 já matara** (o caso comum eram 2). W2
> prometia devolver quota narrando *"uma vez por rodada"*, e **isso é o jogo
> desde a v9.13** (Δ = 0 no caso comum). *Em ambas, a etapa valeu mais pela
> medição do que pela proposta — e a lição é de método: **uma pauta que
> envelhece mente com a confiança de um documento.***
>
> **E a quota foi devolvida — só que por W1, uma etapa antes, e por outro
> caminho:** a abertura de toda luta corpo a corpo cai de ~22 toques e 1
> chamada para **2 toques e zero chamadas**, o que vale **−1,4 chamadas ao
> Mestre por luta**. **W2 acrescenta −1 por fala**, sobre uma base que hoje é
> zero porque o preço a proíbe.

**O que se media em E1:** uma rodada era abrir `Ações` (1 toque), tocar `Atacar`
(que **escrevia `"Ataco "` na caixa**), digitar o alvo (~15 toques), tocar
`Agir →` — **e o golpe ainda podia não acontecer**. Sete turnos jogados, três
ataques declarados sem ambiguidade, **zero rolagens**. E gastava-se **uma
chamada ao Mestre** para uma IA descobrir que *"Ataco o ogro"* significa
atacar o ogro, que o motor já sabia.

**CORRIGIDO em W1 (16/09), e a correção é do `jogo`: os ~18 toques já não são o
caso comum, e ninguém tinha contado.** X2 matou-os em combate — `Atacar` entra
por `declararGolpe` e **escolhe o alvo mais perto ao alcance sozinho**. Medido no
código de hoje: o caso comum são **2 toques** (abrir `Ações`, tocar `Atacar`), o
alvo escolhido **3** — e nesses 3 há um defeito, porque `declararGolpe`
(`App.jsx:11988`) **troca de alvo em silêncio** quando o escolhido não alcança.
**Os ~18 continuam verdadeiros fora de combate**, onde `Atacar` ainda enche a
caixa, e isso é deliberado: é pela frase que a briga **começa**.

**E o número grande da fase é outro, e ninguém o tinha** *(corrido em Node sobre
`PLANTAS` × `posicionar` pelo `jogo`, e **reconferido pelo `regente`** com uma
segunda passagem independente que bateu casa a casa)*: a abertura é de **19,95 m
em média**, **10 de 10 plantas** recusam o corpo a corpo no turno 1, e **1,4
rodadas por luta são pura caminhada**. **Não há botão de passar a vez**
(`App.jsx:3133`, desde a v9.13) — logo cada uma dessas rodadas custa **~20 toques
de teclado e uma chamada ao Mestre para não fazer nada**. *A abertura de toda
luta corpo a corpo custa hoje ~22 toques e 1 chamada; com `esperar`, 2 toques e
zero chamadas.* É o maior número desta fase e o mais barato de pagar.

- [x] **W1 · a frase que se monta** · **FEITO 16/09 · v9.262** — o gesto inteiro
  está decidido e escrito; **W3 constrói**. O turno passa a ser **verbo +
  alvo/casa por toque**, com o preço e o alcance antes do clique. **O caso comum
  cai de 2 toques para 1** (e a etapa corrigiu o enunciado: **X2 já tinha matado
  os ~18**, e ninguém contara); **a abertura de toda luta corpo a corpo cai de
  ~22 toques e 1 chamada para 2 toques e zero chamadas**, o que vale **−1,4
  chamadas ao Mestre por luta** — quota devolvida ao Narrador **uma etapa antes
  de W2**. A fileira é de **quatro e uma goteira** numa fila só (a lista é do
  `jogo`, e `golpe.js:222-254` prova que três dos seis de E1 não têm motor), o
  que **devolve 81 px ao campo: 91 casas em vez de 84**. **`Atacar` perde o
  `Papel=Chamada`** — o âmbar cheio passa a ser exclusivo do armado, e a
  distinção dele vira largura (163 contra 72/44/44, 359 exactos). **Só `Atacar`
  arma.** No telefone o gesto é **pressionar · arrastar · largar**, um contacto =
  um toque — *o arrasto é o `hover` que o dedo nunca teve* —, e a região do
  veredito reserva **71 px, sempre**, com o degrau medido (75 px = 13 filas,
  76 px = 12). **Zero peças novas:** `Botao` 24 → 26, `A casa` 7 → 8, e o
  conserto de *Alcançável*, que reprovava a 1.4.11 a **1,151:1** na peça que W1
  ia usar de base. **Três defeitos vivos achados e reconferidos à mão:** as
  frases de X2 transbordam hoje (**64–86 caracteres contra 54**), **é impossível
  tocar num inimigo** (`pointerEvents:"none"` + a casa ocupada fora de `podeIr`),
  e a mira reprova a 1.4.11. O escrito dos dois seniores fica em
  `mente/w1-jogo.md` e `mente/w1-desenho.md`; a forma, no bloco final de
  `mente/formas.md`. · de: pessoa · 15/09
- [ ] **W3 · o gesto construído** · de: regente · 16/09
  **O que W1 desenhou, montado.** A lista é fechada e cada linha tem sítio, e
  **três delas são defeitos vivos de hoje, não features** — conferidos à mão pelo
  `regente` no fecho de W1:
  - **as fichas têm de virar alvo.** `<g style={{ pointerEvents: "none" }}>`
    (`grade-de-batalha.jsx:648`) e a casa ocupada fora de `podeIr` (`:401`,
    `alcancaveisDe` com `ocupados`) são, **juntos, a razão de hoje ser impossível
    tocar num inimigo**. Com um verbo de criatura armado, a casa ocupada entra em
    `clicavel`. *Sem isto, W1 inteiro não tem primeiro toque.*
  - **`onMouseEnter` → `onPointerMove`** (`:759`): é correção, não port. Hoje a
    rota prevista e a casa sob o dedo são **dois canais de rato num jogo que se
    joga com o dedo**.
  - ~~**o violeta da mira a 74 %**~~ — **PAGO EM W2 (16/09, v9.264)**, e a cura
    não foi a que esta linha dizia. O 2,689 herdado de E1 fora medido contra
    `T.bg` **nu**, e o contorno corre por cima de cobertura e faixa de região:
    contra o pior chão real dava **2,575**, e **74 % de opacidade dava 3,235 —
    passava a norma e falhava o piso da casa (3,272)**. A decisão é **o token,
    não a opacidade**: `T.violet` → `T.violetSoft` em `grade-de-batalha.jsx`
    (`:633` e `:641`) → **3,615** (+40 %) e **4,432**. Opacidade e âmbar
    intocados. **Três ganhos de graça:** `violetSoft` **já era** a cor da
    retícula da mira e da legenda no mesmo arquivo (hoje o anel e o contorno
    falavam dois roxos diferentes); as duas línguas do tabuleiro passam de
    **42 % de diferença de força para 1,3 %**; e fica a regra — **`violet` é
    tinta de superfície, `violetSoft` é tinta de traço sobre o tabuleiro.**
  - **as quatro frases do golpe, e elas estão PRONTAS — só falta aplicar.**
    `LINHAS_DO_GOLPE` saiu da fila do motor em W2: a peça é de `src/golpe.js`,
    **nascido em X2, desta mesa**. A redacção está fechada e medida contra o
    teto de 54 de E2, **com o pior nome (18) e o pior número (`10,5`)**, numa
    gramática única — `{nome} a {distância} m — {veredito}.` — em que **o
    jogador aprende uma forma e passa a ler só a cauda**: `Ninguém de pé ao seu
    alcance.` (29) · `{n} a {d} m — faltam {f} m.` (fixo 26, pior 44) · `{n} a
    {d} m — parede, contorne.` (fixo 29, pior 47) · `{n} a {d} m — ao alcance.`
    (fixo 23, pior 41). **A recusa por distância mede hoje 60 com o nome VAZIO
    contra um teto de 54** — aparar o nome nunca a podia salvar, e por isso a
    cura é redacção. **`contorne` é a única ordem que sobrevive**, porque sem
    ela o reflexo depois de ler metros é andar a direito contra a pedra; e a
    parede **ganha um número que hoje não tem** (contornar 3 m e contornar 20 m
    são decisões diferentes). O aparo mora na tabela, **nunca no CSS**. Tudo em
    `mente/w2-desenho.md` §3.3-3.5, com as **cinco asserções** que lêem a
    tabela de volta. **É atómico:** `recusaDoGolpe` tem **dois** leitores
    (`App.jsx:11981` no chat, `:20910` na linha do veredito) e meia troca é a
    mesma regra em dois caminhos. **Precisa do bastão.**
  - **a linha do veredito não vive sempre na árvore — vive numa gaveta que
    nasce fechada.** Achado do `desenho` em W2, e **contraria um comentário do
    próprio arquivo**: `App.jsx:20900` diz *"ela vive sempre na árvore enquanto
    há luta"*, e **não vive** — está dentro de `{acoesAbertas && …}`, com
    `acoesAbertas` a nascer `false` (`:4896`) e **nada que a abra sozinha**,
    nem quando a luta começa, nem quando o golpe é recusado. `grep` devolve
    **três linhas e mais nenhuma**. **O `Atacar` apagado e a linha por baixo
    dele estão os dois lá dentro** — logo o veredito antes do clique só existe
    **depois de um toque**. *A reserva de 71 px de W1 não muda; muda a razão
    dela: reserva-se para o tabuleiro não saltar quando a gaveta abre.*
  - a fileira de **quatro e uma goteira** numa fila (`Atacar` · `✦` · `◆` ·
    goteira · `esperar`), `Botao` *Papel=Gesto*, **`Atacar` distinguido por
    largura (163 contra 72/44/44, 359 exactos) e tinta, nunca por preenchimento
    cheio** — o âmbar cheio é do armado e de mais ninguém;
  - `Estado=Armado` no `Botao` (inversão figura/fundo + o bico de 12×6 px +
    `aria-pressed`), e **só `Atacar` arma**;
  - `Estado=Alvo` em `A casa` — **os quatro cantos sobre a criatura**, nunca tinta
    no chão: *o golpe escolhe gente, e o passo escolhe chão*;
  - a segunda linha da desistência e a fila de pílulas do polegar, **exclusivas
    por estado** (ver o bloco de `formas.md`);
  - no telefone, **pressionar · arrastar · largar**, um contacto = um toque — *o
    arrasto é o `hover` que o dedo nunca teve*; largar sobre o herói ou fora do
    campo = **nada aconteceu**.
  **Depende de:** o pedido de W1 na `mente/pauta.md` (`esperar`,
  `declararGolpe(alvo, motivo)`, `LINHAS_DO_GOLPE`, `alvosDoVerbo`,
  `vereditoDoVerbo`) e, por baixo dele, a porta do tabuleiro que E2 pediu.
  **O que NÃO espera:** os três defeitos acima são de `grade-de-batalha.jsx`, são
  nossos, e podem ser pagos antes de qualquer porta nascer.
  **O bastão:** a fileira e a linha do veredito vivem no `App.jsx` (`:20840-20940`)
  — é trabalho do `oficial`, não do `aprendiz`.

- [x] **W2 · o texto ganha um SEGUNDO emprego** · **FEITO 16/09 · v9.264** — e
  a etapa **corrigiu o próprio enunciado em dois sítios**, com número.
  **1 · O nome estava errado, e a correcção é lei:** o campo **não pode**
  deixar de perguntar *"o que você faz?"*. Fora de combate é a única pergunta
  que existe; dentro dele é a porta de **onze verbos sem botão**. `"Ataco o
  ogro"` escrito na caixa continua a atacar o ogro, **pela mesma porta do
  botão** (`aplicarGolpeDoJogador`, chamada de `:11992` e `:13555`, e o
  comentário de `:13549` diz *"byte por byte"*). Recusar seria parede;
  traduzir em silêncio seria o defeito que W1 §0.1 já nomeou. **O texto não
  muda de emprego: ganha um segundo.**
  **2 · A promessa de quota era falsa, e o `jogo` provou-o:** *"o Mestre narra
  uma vez por rodada"* **descreve o jogo que existe desde a v9.13**, quando
  `agir` passou a encerrar o turno. `fecharMeuTurno` tem **quatro chamadores,
  mutuamente exclusivos, um `enviar` cada** — **a rodada comum custa 1 chamada
  hoje e custará 1 depois: Δ = 0.** O ganho verdadeiro é outro, é menor e é
  real: **−1 chamada e −1 rodada perdida por fala**, sobre uma base que hoje é
  **zero** — porque falar custa a rodada inteira (`:13595` fecha o turno e o
  inimigo revida). **W2 não poupa uma chamada: destrava um comportamento que
  hoje o preço proíbe.**
  **A fala é gesto:** **zero ações, uma por rodada, zero chamadas**, e viaja
  colada ao envelope por `notaRef` — **o molde é a poção** (`:19580`, em
  produção desde a v9.13: *"abrir a bolsa não é o turno"*). Teto de **240**
  caracteres (o `slice` que `falas.js:82` já usa), **e estourar recusa, não
  corta** — truncar em silêncio é `declararGolpe:11988` outra vez.
  **O que fica sem frase nenhuma: ZERO.** Os 14 eventos de X3b foram cruzados
  linha a linha com o que o código escreve sozinho — **11 sobrevivem inteiros
  ao silêncio, 2 pela metade, 1 não dispara para quem luta de arma** — e os
  três são **herança, já em `mente/pauta.md`**, não preço de W2. **A IA nunca
  foi a voz única de nenhum dos 14: foi a segunda voz de 11.** Um só evento
  muda de lugar (o desfecho do teste social, de parágrafo para frase) **e
  sobrevive**, porque `falaDoVeredicto` já é empurrada por código em `:15989`.
  **Dos três defeitos vivos de W1, um foi CONSTRUÍDO e dois ficaram, com o
  motivo:** o **violeta da mira** está pago (§4 abaixo); as **quatro frases**
  estão **fechadas e medidas** mas a troca é atómica e o **bastão do `App.jsx`
  esteve com a outra mente o ciclo inteiro** — **PAGAS EM 16/09, no ciclo de
  K2 · v9.267**, e a dívida durou exactamente um ciclo. As quatro saem de
  `LINHAS_DO_GOLPE` em `src/golpe.js`, com `TETO_DA_LINHA` ao lado e **18
  asserções novas** em `teste-golpe.mjs` (64 → 82) a ler a tabela de volta.
  Medido **depois**: fixos **29 · 26 · 29 · 23**, pior caso com o nome de 18
  **29 · 44 · 47 · 41**, e o pior dos 108 pares (27 nomes × 4 frases) é **47
  contra um teto de 54** — sete de folga. **Antes eram 29 · 80 · 55 · 64.**
  `recusaDoGolpe`, `linhaDoGolpe` e `maisPertoAoAlcance` mudaram de casa
  inteiras — *um varredor não lê JSX; lê isto*, e foi por isso que a linha que
  mais aparece no combate mediu 64 a 86 caracteres durante um ciclo sem
  ninguém a ver. **A conta que a mudança de casa deixou por pagar, e ela é
  nova:** apagar 33 linhas do `App.jsx` empurrava **133 endereços
  `src/App.jsx:<linha>`** cravados em nove arquivos de `testes/` — e alguns são
  verificados por varredor —, logo ficou no lugar **uma lápide de exactamente
  33 linhas**, com o próprio tamanho explicado dentro e a data de validade
  escrita. *Está em "Aberto".* · **tocar num inimigo**
  é de W3 **e era meia-verdade**: com a mira armada `noAlcance` **não exclui
  ocupados**, logo a casa por baixo da ficha **já responde hoje**. W3 não
  inventa mecanismo — acrescenta um segundo valor a um que já roda.
  O escrito dos dois seniores fica em `mente/w2-jogo.md` (com a `§8 · adenda`)
  e `mente/w2-desenho.md`; a forma, no bloco final de `mente/formas.md`. ·
  de: pessoa · 15/09

### Fase K — as três batidas da rodada (a reação ganha controle)
**Proposta do `jogo` em D4, aprovada pela pessoa em 14/09 — com o desenho
dela junto.** Hoje o jogador toca uma batida e meia: **seis reações gastam o
PM dele sem lhe perguntar** (`App.jsx:7572`). O argumento é estudo citado de
dentro de casa: `reacoes.js` escreve que no 5e e no BG3 metade da tensão do
combate mora na reação — e sete linhas depois entrega a decisão ao sistema.

**A forma, ditada pela pessoa:** *"um botão aparecendo (tipo um de rolagem de
dados) com uma barra de tempo ou timer, e ele tem alguns segundos para sumir.
Se o player apertar no botão, aparecem as opções para escolher qual será a
reação ou se não irá reagir. Caso o tempo passe e o player não tenha clicado,
o turno de reação acaba. Ele deve poder escolher também uma reação padrão ou
não reagir, caso não queira gastar PM."*

- [x] **K1 · o momento desenhado** · **FEITO 15/09 · v9.256** — o momento inteiro
  está desenhado no Figma e escrito em `formas.md`. **A chamada dura 4 000 ms** (1,5 s
  de reconhecer + 0,5 s de Fitts, dobrados para quem não estava a olhar), **o leque
  não expira** e por isso **não tem trilho**; sob `prefers-reduced-motion` a janela
  dura **mais** 1 000 ms, porque *uma barra lê-se de canto de olho e um numeral exige
  fixar* — a lei vira número em vez de promessa. **O caso comum resolve-se num
  toque:** 12 classes em 12 têm exactamente uma reação de `sofre_dano`, e o toque
  que revelava uma lista de um item morreu. O **recuo está no primeiro degrau**
  (hoje ignorar a janela **gasta PM**), a **preferência é uma fila de quatro pílulas
  na ficha** (e é a conformidade WCAG 2.2.1 da fase), e a janela **resolve-se no
  sítio** antes de ir ao log, que fica byte a byte o de hoje. No telefone o caso
  comum tapa **zero** do campo. Peças: `O chamado` (`62:2453`), `O verbo com preço`
  (`64:2446`), três glifos, e *A pergunta que expira* de 4 para 8 variantes.
  · de: pessoa · 14/09
  `jogo` e `desenho` em par, no Figma: o botão que chama, a barra que corre,
  o leque de opções, o estado de "não vou reagir", e a preferência
  (reação padrão / nunca me pergunte). **Duas decisões de desenhista
  experiente que a etapa tem de tomar, não perguntar:** quanto tempo a barra
  dura (e o que acontece com quem lê devagar — o tempo tem de ser
  configurável ou generoso, e `prefers-reduced-motion` não pode virar
  desvantagem de jogo), e como isto se comporta no celular, onde o polegar
  não está sobre o botão.
  *(**Meio caminho andado em E1: a peça existe.** *A pergunta que expira* foi
  fabricada — Figma `31:518`, 4 variantes (*Etapa* Chamando · Escolhendo ×
  *Tempo* Barra · Contagem). Era dívida declarada de D4, deixada por fazer
  porque *"peça feita para decisão não tomada é trabalho inventado"* — **a
  pessoa aprovou a Fase K em 15/09, a condição da dívida caiu, e manter a
  dívida passou a ser o erro**. Três decisões já vêm dentro dela: **o eixo
  *Tempo* É a saída por `prefers-reduced-motion`**, feito variante em vez de
  nota de rodapé justamente para não ser esquecido no dia de construir; **o
  tempo nunca aparece em segundos na variante *Barra*** (contagem regressiva no
  meio de uma narrativa é o sistema a falar de si mesmo); e **a trava K2 está
  escrita na própria peça** — *quem não responde tem o de hoje, byte a byte*.
  E E1 reservou-lhe o lugar na tela de batalha com um número: ela mora na
  **linha do veredito**, **sobrepõe e nunca empurra** (empurrar move as casas
  que o jogador está a ler no segundo em que tem de decidir depressa), e cresce
  para cima, ancorada em baixo — o topo do campo e a câmara nunca se mexem.
  **O que continua a faltar a K1 é o número do tempo**, que depende do ritmo da
  rodada e é do `jogo`.)*
- [x] **K1b · o relógio de 15 s, e o que ele cobra** · **FEITO 15/09 · v9.258** —
  **a barra não corre 15 s, corre 4.** K1 tinha o número certo no papel errado: os
  4 s que ele mediu são *o prazo*, não *a janela*. Onze segundos **sem relógio
  nenhum**, depois o trilho pelos 4 s medidos, depois o último segundo apertado —
  e quando a barra aparece o jogador tem ainda o orçamento inteiro de K1.
  **Zero peça nova.** A rodada de quatro inimigos passou de **60 000 ms para
  15 000** (−75,0 %); doze golpes, de 180 000 para 15 000 (−91,7 %); a luta de
  cinco rodadas de quem ignora tudo, de 300 000 para **33 200** (−88,9 %). Dois
  tetos em `TETO_DA_ESPERA`, porque um teto por rodada × rodadas sem limite não é
  teto. **O dano fica em segredo**, e não vaza: 12 portas visuais + 15 de sistema
  fechadas por escrito, **três delas viradas asserção**. `folgado` morreu com o
  motivo escrito. `src/ritmo-da-reacao.js` + **85 asserções**; `lineStrong` nasceu
  em `T` com dois leitores. O escrito dos dois seniores fica em
  `mente/k1b-jogo.md` e `mente/k1b-desenho.md`. · de: pessoa · 15/09
  **Decisão da pessoa (15/09):** a janela sobe de 4 s para **15 s** — *"pra
  que fique tranquilo até pra pessoas com dificuldade"* — e **o dano fica
  em segredo**. K1 tinha decomposto os 4 s (1,5 s de reconhecimento + 0,5 s
  de Fitts, dobrados); os 15 s são folga deliberada, e a folga é o ponto.
  **O que a etapa tem de resolver, e não é a pessoa que decide — é ofício:**
  o relógio dispara **por golpe recebido**, e numa rodada com quatro
  inimigos 15 s viram **até um minuto de espera** por rodada. Medir isso e
  desenhar a saída: a janela só corre quando há **de fato** reação possível
  (PM disponível, reação ainda não gasta na rodada), golpes do mesmo turno
  se agrupam em vez de enfileirar, e quem já respondeu não é perguntado de
  novo. **A folga é para quem precisa dela, não um pedágio para todos.**
  Catraca: o tempo total de espera por rodada tem teto medido, e a suíte o
  prova com quatro inimigos na mesa.
- [x] **K2 · a trava, antes de tudo** · **FEITA 16/09 · v9.267** — e ela apanhou
  o erro que K3 ia cometer. **O desenho óbvio (*a expiração resolve só o golpe
  da janela*) quebra a trava em 37,44 % das sementes**, medido em 120 000 pares:
  hoje o laço **repete** `escolherReacao` golpe a golpe quando a `chance` falha,
  e por isso o ladino esquiva **97,6 %** das rodadas e não 60,2 %. Custo
  silencioso do erro: **+12,4 % de dano ao furtivo.** A regra que fica:
  ***«coberto» quer dizer não gera segunda pergunta, nunca não gera reação***.
  `reacaoDoSilencio` (chama `escolherReacao`, não a copia; **sem parâmetro de
  tempo nenhum**, e é essa a prova de T2), `fecharAJanela` (portão de uma via —
  o segundo a chegar **não rola um dado**), `ATALHOS_DA_JANELA`, e a **nona
  porta `escondida`**, primeira da precedência: as outras oito dizem *«não
  perguntes»*, esta diz *«não esperes»*. `testes/teste-trava-da-reacao.mjs` com
  **107 asserções em 0,6 s** — e a **03 constrói o desenho errado e assere que
  ele diverge, pelo número**. Do lado da forma: a tabela do foco (**na
  expiração o foco não se mexe** — quem não respondeu não pediu nada), a lei
  *o trilho não tem relógio próprio*, e o dente **`D5e`**. **85 asserções de
  K1b estavam verdes com uma ficha que nunca rola um dado** — é a lição da
  etapa. Escrito em `mente/k2-jogo.md` e `mente/k2-desenho.md`.
  · de: pessoa · 14/09
  **Quem não responde, o sistema responde como hoje.** Regressão zero é
  condição de entrada, não consequência feliz: o jogo tem de continuar
  jogável exatamente como é para quem ignora o botão, para quem joga sem
  mouse, e para quem está numa aba lenta. Prova antes de a peça existir.
- [x] **K3 · a reação acontece** · **FEITA 16/09 · v9.270** — a janela existe, e
  o jogador faz alguma coisa no turno do inimigo pela primeira vez.
  **O que nasceu:** `src/painel-reacao.jsx` (o cartão), `src/palavras-da-reacao.js`
  (nove tabelas e três funções puras — zero frase montada dentro de um JSX), sete
  classes e o anel `.tv-anel-foco` em `src/estilo.js`, `TEMPOS_DO_CARTAO` +
  `temRelogio`/`janelaExpirouEm` em `ritmo-da-reacao.js`, e no `App.jsx` a cisão
  de `resolverRevide` numa continuação (`correrORestoDaRodada`) mais a fila de
  quatro pílulas na ficha. **97 → 102 asserções** na suíte nova.
  **As quatro obrigações de K2, cumpridas e conferidas:** os cobertos voltam ao
  laço por `reacaoDoSilencio(desde: abre.ordem)`; nenhuma resolução fora de
  `valeu === true`; o foco é guardado antes de mover e **não se mexe na
  expiração**; `escolherReacao` recebe sempre `persBase`.
  **E a decisão que salvou a fase:** *quem responde resolve-se pelo MESMO caminho
  de quem não responde.* A `chance` continua dentro de `escolherReacao` e o laço
  continua a tentar o golpe seguinte — o ladino esquiva **97,6 %**, como hoje, em
  vez de **100 %** de graça. Resolver directamente teria dado ao jogador que
  responde um mundo melhor que o de hoje, em silêncio.
  **As três dívidas de K1b, pagas:** a lista de espera de `teste-ligacao.mjs`
  voltou a ficar **vazia** (o credor era este ciclo); `tv-trilho-entra` existe; e
  **o `73 %` morreu** — o trilho nasce na proporção por `animation-delay` negativo
  calculado de `agora − t0`, não por número escrito à mão. *(`PISO_DO_GOLPE` em
  dois sítios continua de pé: é do `backend`, e está no pedido.)*
  **Conferido vivo**, no navegador, em aba nova: o anel acende sob `Tab` de
  verdade (`T.bg` 2 px + `T.ink` 4 px, e `:focus-visible` a `true` — o que K2 disse
  que não se prova em Node); o cartão mede **560 px** com o teto, **chamado 56 px
  e recuo 48 px**; o trilho é `tvJanelaTempo` 4 s linear, origem à esquerda, em
  `T.amber`, nascido já na proporção; as quatro pílulas trazem **o verbo do
  próprio herói** (*Esquiva Ágil sempre*); e a vez do mundo corre inteira pela
  continuação nova quando nenhuma porta abre.
  **O que o vivo apanhou e a suíte não:** o preço saía comprimido
  (`0PM—anula`); voltou à forma de `formas.md` (`0 PM — anula`) e o estouro de
  `escudo arcano` resolveu-se **na palavra** (`corta o grosso`), não no espaço em
  branco — com catraca a exigir a forma canónica.
  **E as duas que K2 não conseguiu provar em Node têm resposta, medida na tela:**
  o **foco de teclado** acende — `:focus-visible` a `true` e `box-shadow` de
  `T.bg` 2 px + `T.ink` 4 px, sob um `Tab` de verdade —, e **`O chamado` não
  ganhou eixo `Estado`**: nasceu `.tv-anel-foco`, transversal, que serve o
  chamado, o recuo, o leque e as quatro pílulas da ficha. *K1 tinha a conclusão
  certa pela razão errada.*
- [ ] **K4 · medir a batida** · de: pessoa · 14/09
  Quantas reações o jogador de fato escolhe, quantas expiram, quanto tempo
  ele leva, e se o combate ficou mais longo. **Se a batida nova cansar em
  vez de tensionar, isso aparece no número** — e a etapa diz, em vez de
  defender o que construiu.

### Fase E — a batalha tem tela, e o tabuleiro tem endereço
Decisão da pessoa (14/09): *"seria interessante uma tela para a batalha,
pois é um momento importante e a maioria das outras funções ficariam
inúteis — quando entrar em batalha, uma tela só com o grid e as funções de
batalha e utilitários."* E, para o mover: *"nosso grid pode ter letras e
números, tipo um tabuleiro de xadrez, então se um player disser 'vou até
H20' não teria a confusão que 'me aproximo do…' causa."*

Duas decisões que se resolvem juntas, porque a segunda só faz sentido na
primeira: hoje **o campo de 16×16 nunca foi visto inteiro**, vive num
scroller de 301px, e o painel `Ações` abre abaixo da dobra.

- [x] **E1 · a tela desenhada antes de existir** · de: pessoa · 14/09 · **feito v9.254**
  `jogo` e `desenho` **em par**, no Figma: o que a tela de batalha mostra e
  o que ela esconde, onde fica o tabuleiro, onde ficam as ações, o que
  acontece ao entrar e ao sair dela. O `jogo` decide o momento da troca (a
  batalha começa e a tela vira); o `desenho`, a forma. Nada de código.
  **Prova de entrada:** a proposta tem de caber em 1280×860 **e** num
  celular — a pessoa citou a plataforma como critério (ver a Fase L).

  **FEITO (15/09).** Página `A batalha` no Figma (`30:12`, **475 nós**) com
  cinco quadros, mais **quatro peças novas** do `desenho` (A régua, A vez, A
  ficha curta, A pergunta que expira). A forma decidida está em
  `mente/formas.md` — *A tela da batalha*; a conta inteira, em `mente/e1-jogo.md`
  (o momento) e `mente/e1-desenho.md` (a forma). **Nenhum `.jsx` foi tocado.**
  **Três coisas que se souberam ao medir e mudam as etapas seguintes:**
  (1) **o campo não é 16×16 — são dez plantas**, de 7×18 a 18×12, e qualquer
  desenho que resolvesse uma quebraria noutra; (2) **os 429 px não são altura,
  são arquitetura** — `PainelCombate` (`App.jsx:20510`) é montado **dentro** do
  rolador do log (`:20459`) e por construção abre no fim dele, o que torna a
  inversão **condição de entrada de E3**; (3) **a gramática do endereço já
  existe** (`coordenadas.js:151`), e por isso **E2 não fabrica tabela nova** —
  lê desta.
  **Números:** **1232 de 1280 px viram jogo (96,3%)** contra os 560 de hoje; a
  casa passa de 23,8–36,6 px para **48** (nenhum tamanho de hoje chega aos 44 de
  WCAG 2.5.5 / HIG / Material); no telefone, **70 casas sempre na tela**, e
  **76 px voltam de graça** por não haver trilho de abas.
  **Três buracos declarados:** `inkDim` sobre casa acesa reprova o AA por
  **0,03**; a moldura apagada dá **1,38:1** (a palavra carrega o estado); e o
  fundo do tabuleiro `#141020` está a **1,04:1** de `T.bg` — literal solto que
  a catraca conta **e** que quebra o vão do anel de foco. Trocá-lo por `T.bg`
  paga os dois, e é item barato de E3.
- [x] **E2 · o endereço do tabuleiro** · de: pessoa · 14/09 · **feito v9.260**
  **A metade visível fechou, e a outra metade virou pedido à pauta do sistema.**
  A régua está nas **duas bordas** (letras em cima, números à esquerda), fora do
  SVG, em calha de 22 px, mono 12 px, `aria-hidden` — e **as letras saem de
  `LETRAS_DA_GRADE`**, sem uma segunda tabela nascer. **Três graus**
  (*Repouso* · *Procurada* · *Realçada*), e o canal que não é cor é a
  **existência** do filete. Toda casa ganhou `role="gridcell"` e um
  **`aria-label` de quatro campos** (`endereço · quem está lá · o lugar · o
  veredito`); **o `<title>` saiu** — era também o balão do rato, que no telefone
  não existe e tapa as casas para onde o jogador ia andar. **O veredito nunca
  fica vazio:** antes, a casa que não dava simplesmente calava, e silêncio
  lê-se como *"nada a dizer"*, nunca como *"não dá"*.
  **No telefone a régua custa ZERO casas, e a prova não é a igualdade — é a
  folga:** sem ela sobravam 23 px e 40 px, **e uma casa pede 48**. Nenhuma
  daquelas folgas podia virar casa. 7 × 12 = **84 casas** nos dois cenários.
  **`#141020` → `T.bg`** de brinde: tira um literal da catraca **e** devolve o
  vão do anel de foco. Catraca nova: `testes/check-endereco-do-tabuleiro.mjs`.
  O escrito dos dois seniores fica em `mente/e2-jogo.md` e `mente/e2-desenho.md`.
  **O que NÃO fechou, e está pedido em `mente/pauta.md`:** *"vou até K14"*
  escrito continua a não chegar ao motor — **não há porta do tabuleiro em
  `turno.js`** (17 portas, nenhuma), e a frase cai na porta `destino`, que não
  tem guarda `!emCombate`, gasta uma chamada ao Mestre e **ninguém anda**.
  *(a demanda original:)* Colunas por letra, linhas por número. É o que torna *"vou até H20"*
  possível — e resolve, de quebra, a pendente de que **o jogador não
  consegue se mover**: hoje a grelha não é clicável e escrever "me aproximo"
  três rodadas não anda um metro. O endereço serve aos dois caminhos: o
  clique na casa e a frase escrita. Cuidado do `backend`: a conversão
  endereço↔coordenada é **regra**, sai de tabela e é provável em Node —
  não nasce dentro da tela.
  *(**E1 achou a tabela, e ela já existe**: `src/coordenadas.js:151` define
  `LETRAS_DA_GRADE = "ABCDEFGHIJKLMNOPQRST"` e `gradeDe()` devolve letra +
  (linha+1) — **A1 no canto superior esquerdo, sem letra saltada**, e as 20
  letras cobrem as dez plantas de `grid.js`, cuja maior largura é 18. É a grade
  do **ermo**, mas é a mesma pergunta e já tem resposta escrita. **E2 lê desta
  tabela e não fabrica a segunda** — duas tabelas de letras no mesmo jogo é a
  doença da casa um andar abaixo. Duas condições de E1: o log tem de **escrever
  o endereço de volta** (`você avança até H20`), senão o jogador nunca o
  aprende; e os endereços do **mundo** e do **tabuleiro** nunca aparecem na
  mesma tela.)*
- [ ] **E3 · a tela existe** · de: pessoa · 14/09
  Construir o que E1 desenhou. **Precisa do bastão do `App.jsx`**, e é a
  oportunidade da fila: cada pedaço da batalha que sair do App para um
  arquivo próprio compra independência permanente. Mover vale mais que
  remendar.
  *(**A condição de entrada, achada em E1, e sem ela nenhuma medida do desenho
  se cumpre:** o tabuleiro tem de **sair de dentro do rolador do log**.
  `PainelCombate` (`App.jsx:20510`) é montado dentro do `<div ref={areaRef}>`
  aberto em `:20459`, **depois de todas as mensagens** — o tabuleiro é filho do
  log e por construção abre no fim dele. Os **429 px abaixo da borda** não são
  um número de CSS a afinar: são essa árvore. **Nenhum ajuste de altura
  resolve; só a inversão resolve** — e é exatamente o caso em que mover vale
  mais que remendar. Item barato que vem de brinde: o fundo do tabuleiro
  `#141020` vira `T.bg`, o que tira um literal da catraca **e** devolve o vão
  do anel de foco.)*
- [ ] **E4 · mover é fazer** · de: pessoa · 14/09
  A casa clicável, o endereço escrito, o alcance visível antes do passo (o
  veredito antes do clique), e o log dizendo o que **você** fez — não só o
  que o inimigo fez. Medir: quantas rodadas o jogador consegue se mover de
  fato, contra as zero de hoje.
  *(**corrigido em D3**, e a correção muda o pedido: "a grelha não é
  clicável" está **errado**. Cada casa alcançável já é `role="button"
  tabIndex=0` com `onMover` — `grade-de-batalha.jsx:512-517`. **O clique
  funciona; o que não existe é FORMA**: o alvo é um
  `<rect fill="transparent">`. O pedido deixa de ser "torne clicável" e
  passa a ser "dê forma ao que já clica" — que é mais barato e é outra
  etapa.)*
  *(**E1 deu-lhe a forma, e deixou-lhe uma condição.** O canal que E4 tem de
  abrir é o do **telefone**: hoje a rota prevista só existe em `onMouseEnter`
  (`grade-de-batalha.jsx:543`) e a única descrição da casa é um `<title>` de
  SVG (`:520`) — **dois canais de rato, num jogo que se joga com o dedo**. A
  decisão de E1, e ela é regra: **o custo nasce escrito dentro da casa já em
  *Alcançável***, em mono 10 px, e o endereço só aparece nos dois estados que já
  carregam texto (*Sob o dedo* e *Confirmando*) — **86 endereços acesos ao
  mesmo tempo é a planilha**. E o veredito completo vive na **linha** sob o
  campo, nunca num balão: quatro segundos de balão tapam exatamente as casas
  para onde o jogador ia andar.)*

- [ ] **E5 · o tabuleiro conta o que o inimigo VAI fazer** · de: pessoa · 15/09
  **Aprovada em 15/09.** Experiência jogada: numa luta inteira o `jogo` fez
  **zero decisões espaciais**, porque nada no campo pagava por estar num
  sítio em vez de noutro. Antes do turno do inimigo, **as casas que ele
  ameaça acendem**, com o alvo escrito — o jogador vê e decide: sair,
  cobrir-se, aceitar. **O porquê que a torna barata:** a regra já está toda
  lá (paredes com cobertura, terreno que cobra, alcance por tamanho, golpe
  livre por dar as costas) — falta o jogador poder usá-la. Um tabuleiro onde
  a posição não muda nada é um tabuleiro decorativo.
  Cuidado herdado da Fase N: o que o campo mostra é **a intenção do degrau
  daquele inimigo**, não onisciência — um bruto não telegrafa um plano que
  não tem.

### Fase S — o Duelo e a sala ganham momento
Decisão da pessoa (14/09) sobre as duas: *"vamos corrigir."*

- [ ] **S1 · o Duelo é jogado, não lido** · de: pessoa · 14/09
  Hoje: **3 cliques do menu ao resultado**, e o vencedor aparece **antes**
  das 48 linhas de log. Queda a queda, com o resultado por último — e o
  jogador tocando alguma coisa entre uma queda e outra. O motor não muda:
  a luta já é determinística e já está calculada; o que muda é **quando o
  jogador fica sabendo**.
- [ ] **S2 · a sala ao vivo tem um momento partilhado** · de: pessoa · 14/09
  Medido em duas abas reais: a escolha sincroniza em ~1s, **o resultado
  não** — um lado viu a luta, o outro ficou 10s parado sem aviso. Os dois
  lados precisam ver *o duelo acontecendo*, ao mesmo tempo. Cuidado: o
  protocolo da sala (`api/sala`) é **pesado** — se a solução exigir mudá-lo,
  volta à pessoa.

### Fase G — os gestos que o jogador já conhece
Decisão da pessoa (14/09): *"vamos corrigir também."*

- [ ] **G1 · `Esc` fecha, e o fundo fecha** · de: pessoa · 14/09
  **15 sobreposições, 4 regras de fecho, e `Escape` não fecha nenhuma.**
  Uma regra só, em todas: `Esc` fecha, clique no fundo fecha, e o `✕` tem
  uma forma só (hoje são 8 visuais e 4 tamanhos). Catraca: nenhuma
  sobreposição nova nasce sem as duas saídas.
- [ ] **G2 · "não pode agora" recusa, e DIZ POR QUÊ** · de: pessoa · 14/09
  Achado de D1, da mesma família: **8 opacidades diferentes**, mas
  `cursor: not-allowed` aparece **4 vezes no projeto inteiro**.
  *(**corrigido em D3**: "a maioria continua clicável" está **errado**. Dos
  36 botões com opacidade condicional, **33 têm `disabled`** — o navegador
  recusa de verdade. **O defeito não é o clique fantasma, é o SILÊNCIO.**
  E o `jogo` mediu o que dói: `bloqueado = carregando || !!rolagem` governa
  **15** controles, e "o Mestre está escrevendo", "há um dado esperando" e
  "proibido para sempre" saem hoje **no mesmo cinza**. O `Agir →` carrega
  três razões na mesma cara. Então a etapa deixa de ser sobre o cursor e
  passa a ser sobre **a peça ter onde escrever a razão** — o que a
  biblioteca de D3 agora tem.)*

### Fase L — a letra, medida por plataforma
Decisão da pessoa (14/09): *"nosso texto precisa ter padrões e tem que ser
pensado na experiência do usuário em qual plataforma ele está usando; um
celular não deve ter letra muito pequena, mas ao mesmo tempo não muito
grande para não tomar muito espaço. Use tamanhos comprovados pra cada
plataforma."*

- [ ] **L1 · a escala, com fonte citada** · de: pessoa · 14/09
  Hoje: **18 degraus de tamanho, e 542 dos 1.107 textos (49%) são 9px ou
  10px** — em JetBrains Mono, a fonte "do que é máquina", que tem 682 usos
  contra 315 do corpo. Nenhum alarme dispara porque a WCAG não tem piso de
  tamanho; o contraste passa. A escala vira **tabela**, com um degrau por
  papel (prosa, rótulo, número, título) e **dois valores por degrau: toque
  e ponteiro**. *Comprovado* aqui significa **citar a origem** de cada piso
  (as diretrizes de plataforma e de acessibilidade que o `desenho` for
  buscar), não escolher por gosto — e o corpo de leitura é o degrau mais
  importante, porque a prosa é a protagonista.
- [ ] **L2 · a mesma tela nas duas mãos** · de: pessoa · 14/09
  Aplicar a escala e **provar nas duas plataformas** com a mesma tela lado
  a lado — o `desenho` tem as ferramentas de janela para emular o celular.
  Medir o que a pessoa citou como critério: legível sem apertar os olhos,
  e sem comer o espaço da cena. A fonte de máquina volta ao seu lugar: o
  que é número é mono, o que é prosa não.

### Fase D — a casa ganha um desenho (a mesa de design nasce)
Decisão da pessoa (14/09): três agentes novos — `jogo`, `desenho`, `aprendiz`
— trabalhando pelo Figma, com liberdade para mudar o que for preciso **desde
que comprovado**. Meta declarada: *"o melhor jogo de RPG com a melhor
experiência e qualidade de um AAA."*

Esta fase **não faz nada bonito ainda**, e é de propósito: ela constrói o
chão que impede o defeito que a pessoa nomeou (a mesma ação com duas caras).
Medir antes de mexer, como a Fase A ensinou — aqui aplicado ao visual.

- [x] **D1 · o inventário honesto** · de: pessoa · 14/09 · **feito v9.242 · `06e1fa9`**
  O retrato saiu, e quase todo número escrito aqui estava errado: `T` tem
  **14** cores (não 15); o `App.jsx` tem **93** literais de cor (não 30) e o
  projeto de tela tem **242**, dos quais **67 já são cores de `T`**
  disfarçadas; `FONT_CSS` tem **13** classes de animação (não 7) e só **3**
  com saída por `prefers-reduced-motion`; `ui.jsx` cobre **6,8%** dos
  controles (218 `<button>` crus contra 16 `<Botao>`). E o achado que a fase
  existe para achar: **10 famílias de ação com mais de uma forma, 4 delas de
  significado.** Medição inteira no diário. Correções de D2–D5 abaixo saíram
  daí.
- [x] **D2 · o estilo ganha casa própria** · de: regente · 14/09 · **feito v9.244 · `5cf555c`**
  `T` foi para `src/estilo.js` (que **não importa nada**), com reexport
  compatível em `constantes.js` — os 15 importadores não mudaram uma letra.
  A folha partiu em três: `FONT_CSS` (4 regras: o `@import` e as três
  famílias), `MOVIMENTO_CSS` (30: os 13 `@keyframes`, 16 classes e o
  `prefers-reduced-motion`) e `SUPERFICIES_CSS` (11: a barra de rolagem, o
  trilho de abas e o mural). Quem soma é `FOLHA`, **no `estilo.js`** —
  ordem de folha é regra de cascata, e regra não mora no `App.jsx`, que
  mudou exatamente duas linhas.
  **A contagem de D1 estava certa mas media outra coisa:** são **35**
  literais de cor na folha, não 21 — 21 próprios (os que D1 contou, dentro
  do bloco das superfícies) **mais 14 que já são cores de `T`**, que D1 não
  contou e são justamente as que interessam a D5b. Saíram 13 para a tabela
  nova `MATERIAIS` (a paleta **física**, irmã de `T` que é a **semântica**),
  8 pretos/brancos para os moldes internos `sombra()`/`brilho()`, e 1 hex
  (`#2E2745`, o polegar da barra) virou `${T.line}`. As 13 `rgba()` que já
  são `T` com alfa ficaram — esperam o helper `alfa()` de outro ciclo.
  **A prova de "zero diferença na tela"**, que é a única linha desta etapa:
  o *próprio parser do navegador* leu a folha de antes e a de agora e
  devolveu **as mesmas 45 regras, multiconjunto idêntico, zero divergência
  nos dois sentidos** — só a barra de rolagem mudou de posição (índice 11 →
  35), de propósito e sem colidir com nada.
  A armadilha do `T` do torneio (`App.jsx:10205` e `:10222`) **não chegou a
  existir**: nenhum ponto de uso de `T` no App foi tocado, porque o
  reexport tornou o regex desnecessário.
- [x] **D3 · a biblioteca no Figma, e a estrada de volta** · de: pessoa · 14/09 · **feito v9.246 · `0e3ee81`**
  **A resposta à pergunta da pessoa: a troca é de mão dupla nas VARIÁVEIS, e
  não existe nos COMPONENTES.** Arquivo `Taverna — biblioteca`, `fileKey`
  `e5wJUzInAssoebx5npssKc` — **um só; amplie este, não crie o segundo**.
  27 variáveis (14 de `T`, 13 de `MATERIAIS`) e 5 peças (Botão com 18
  variantes, Fechar, Selo, Barra, Sobreposição), todas ligadas a variável.
  O ida-e-volta bateu **26/27**, e a prova não é a contagem: é que trocar
  `amber` **dentro do Figma** para um valor impossível fez a comparação
  acusar sozinha, e restaurar devolveu o verde. A única divergência é de
  formato — **o Figma guarda alfa num byte**, então `rgba(4,3,8,.45)` volta
  `#04030873` (0,45098). Regra: **alfa que não for múltiplo exato de 1/255
  não sobrevive à volta; compare com tolerância de 1/255, nunca por texto**.
  **O Code Connect não foi feito porque NÃO É EXECUTÁVEL NESTA CONTA** — ver
  o item novo em "Para a pessoa decidir" logo abaixo. Sem ele, o que segura
  o Figma e o código juntos é a comparação por máquina, que **prova hoje e
  não protege amanhã**.
  *(reescrita em 14/09, depois da pergunta da pessoa: "a interação com o
  Figma está sendo uma troca dos dois lados ou apenas estamos usando as
  ferramentas do Figma?" — a pergunta certa, e a resposta até aqui era
  ZERO: D1 e D2 não puseram um pixel lá.)*

  **O teste de que a troca existe é um só: uma mudança feita NO Figma
  chega ao código sem ninguém reescrevê-la à mão.** Se a etapa terminar
  sem isso provado, ela terminou como arquivo bonito, não como terceira
  mente. Então D3 entrega três coisas, nesta ordem:

  1. **As variáveis, e a volta delas.** Criar o arquivo do Taverna e nele
     as variáveis espelhando `T` e `MATERIAIS` (`figma-create-new-file` é
     pré-requisito obrigatório do `create_new_file`; `figma-generate-library`
     junto de `figma-use`). Depois **puxar de volta com `get_variable_defs`
     e comparar com `src/estilo.js`** — ida e volta, mesmo valor. É o par
     mais barato de provar e o que torna a paleta editável no Figma.
  2. **Os componentes que têm a que se amarrar.** *(medido em D1: `ui.jsx`
     cobre **6,8%** dos controles — 218 `<button>` crus contra 16 `<Botao>`.
     Uma biblioteca espelhando `ui.jsx` cru amarraria quase nada.)* Entram
     as primitivas com **≥2 leitores reais**, mais os cinco controles que
     D1 provou existirem sem primitiva — **destrutivo, fechar,
     sobreposição, badge de estado, barra**. Ficam de fora os quatro ícones
     mortos. E fique dito: **`:focus-visible` tem zero ocorrências no
     projeto** — desenhar o estado de foco é inventar, não espelhar;
     legítimo, mas é desenho novo e vai para `formas.md` como tal.
  3. **O Code Connect, que é o nó.** Amarrar cada componente do Figma ao
     componente de código, para que não possam divergir em silêncio. Onde
     não houver componente de código a que amarrar, **diga** — é dívida a
     pagar extraindo primitiva, e é o que justifica o hábito de tirar tela
     do `App.jsx`.

  **O que a etapa deve relatar, sem enfeite:** quais direções funcionaram
  de verdade, quais foram só de ida, e quanto da biblioteca ficou sem nó.
  Uma troca de mão única declarada vale mais que uma troca de mão dupla
  suposta.
- [x] **D4 · as formas escritas** · de: pessoa · 14/09 · **feito v9.249 · `e8b4c32`**
  `mente/formas.md` deixou de estar vazio: **30 formas declaradas**, cada uma
  com `quando` (do `jogo`, palavra por palavra) / `forma` / `movimento` /
  `onde vive` / `por quê` / `peso`, nomeadas **pelo verbo do jogador**.
  **29 das 30 levam `[ainda não existe]`** em *onde vive* — e a única que
  existe em código existe **errada** (`ui.jsx:27`, `opacity: 0.4`). Seis são
  **ações sem controle**, a maior sendo **reagir ao golpe** (6 reações com
  custo em PM, e `escolherReacao` gasta o PM do jogador sozinha,
  `App.jsx:7572`). Os **15 controles sem rótulo** (9 mudos) entraram numa
  tabela com o verbo certo de cada um.
  **As 4 divergências de significado fecharam por escrito, com os dois lados
  e quem cedeu em quê** — e a quinta, a *escala de cerimônia* aberta desde
  D3, fechou com a regra antes da lista. A biblioteca do Figma foi de **8
  para 13 páginas** (A casa, A escolha, O interruptor, A linha, O realce),
  mais dois eixos novos e a **correção da peça de D3** cujo *Impedido* dava
  **1,19:1** e agora dá **6,62:1**.
  **O achado que pagou o ciclo:** a peça nova do campo de escrita seria um
  `textarea` onde o campo do turno é um `<input>` com `Enter → agir`
  (`App.jsx:21216`) — adotá-la sem regra **trocaria em silêncio o gesto mais
  repetido do jogo**. Virou condição de aceitação, não nota de rodapé.
  **Cinco afirmações de D1 caíram** (o `🎲` tem estado, o `✕` tem 6 tamanhos,
  são 10 assinaturas de âmbar, os véus têm 4 desfoques, e o `⤢ ampliar` não é
  mudo — **é mentiroso**: corta 33% do campo). Medição inteira no diário.
- [x] **D5 · a catraca do desenho** · de: pessoa · 14/09 · **feito v9.252 · `73813da`**
  *(reescrita por D1: como estava, era impossível. "Nenhuma cor literal fora
  da tabela" são **242 violações** hoje — e 71 delas são o pergaminho, um
  sistema legítimo à espera de nome; a regra ainda bate em `constantes.js`,
  ou seja **a tabela violaria a própria regra**. "Nenhum controle sem forma
  declarada" são **218 `<button>`** sem nenhum mecanismo de marcação que
  ligue um ao outro.)*
  `check-formas.mjs` entra no `rodar-tudo.mjs` em **três dentes que fecham
  em ordem, cada um verde no dia em que nasce**:
  - **D5a · a catraca do teto.** Grava a contagem atual de literais por
    arquivo (`App.jsx: 93`, `painel-mapa.jsx: 41`, …) e **falha se qualquer
    número subir**. Zero perdões, verde hoje, e a dívida só desce. É o molde
    de `varredura-*` que a casa já usa.
  - **D5b · a catraca do fácil.** Falha se aparecer literal que **já é uma
    cor de `T`** (hex idêntico, ou `rgba` com o RGB de `T`). Zero perdões
    assim que "os 80 literais que já são `T`" rodar.
    *(corrigido por D2: eram 67 quando a folha não era varrida; agora que
    ela mora em `src/estilo.js`, entram as **13 `rgba()` de dentro da
    folha** que já são `T` com alfa — 7 no `MOVIMENTO_CSS`, 6 no
    `SUPERFICIES_CSS`. **D5b depende do helper `alfa(cor, a)`**: sem ele o
    único jeito de calar a catraca é perdoar `estilo.js` inteiro, e uma
    catraca que perdoa a própria tabela não protege nada.)*
  - **D5c · a catraca do movimento.** Toda classe de animação em
    `MOVIMENTO_CSS` tem de aparecer no bloco `prefers-reduced-motion`.
    Zero perdões desde o primeiro dia, depois do item do movimento.
  **Escopo obrigatório: `src/**` + `index.html` + `api/*.js`.** Nunca o
  repositório inteiro — `testes/render-teste.mjs` é um bundle esbuild
  commitado com uma cópia de `T` e 56 hex, e daria 56 falsos positivos.
  A cláusula *"nenhum controle sem forma declarada"* **sai de D5** e vira
  etapa própria depois de D4 e de "`ui.jsx` ganha o que falta": só se pode
  exigir que todo controle tenha forma quando existir a primitiva que a
  carrega.

  **FEITO (15/09).** `testes/check-formas.mjs`, 585 linhas, 0,27 s, **10 ok ·
  0 falhas** no dia em que nasceu — e entra sozinho no `rodar-tudo.mjs`, que
  descobre `check-*.mjs` por si. D5a **332** literais em 17 arquivos; D5b **80**
  (e 80 é, exatamente, o item da pauta que o zera); D5c **13 classes, 3 com
  saída**. A medição **reproduz D1 byte a byte** — 93 no `App.jsx` (40 hex + 53
  rgba), 242 nos arquivos de tela, 67 no recorte de D1. Única divergência,
  escrita em vez de explicada: D1 anotou 78 nos módulos de dado e medem-se 77;
  não se achou o fantasma.
  **A lei que a catraca carrega é folga ZERO nos dois sentidos** —
  `medido === teto`, e em D5c igualdade de conjuntos. Com `<=` o teto vira
  orçamento; com igualdade o número é sempre verdade. Daí a regra
  **anti-cemitério**: um perdão que já não é preciso **falha** a catraca
  (`PERDÃO MORTO`, `ENTRADA MORTA`), e a falha de `DESCEU` **imprime a linha
  pronta para colar** — a única falha do projeto que é uma boa notícia.
  **E ela foi provada contra o erro: 20 sabotagens, 14 morderam e 6 passaram,
  todas como previsto** — incluindo as que ela **tem** de deixar passar (afinar
  o pergaminho, uma cor de cabelo nova, a 15.ª cor de `T`, cor em comentário,
  `rgba()` composta por variável). Detalhe inteiro no diário.
  **A discordância `desenho` × `jogo` sobre a cor de dado de jogo fechou por
  escrito em `mente/formas.md`**, com os dois lados: os módulos de dado ficam
  fora de D5b **por escopo, não por perdão**, e dentro de D5a. E foi o número
  que confirmou o recorte — 99 menos os 19 de dado dá **80**.
  **Quatro buracos declarados com número**, porque buraco calado é mentira: 1
  nome CSS, 18 `transition` fora da folha, **o contraste** (o `#fff` 3,42:1 de
  `App.jsx:2541` que nenhum dos três dentes vê) e 2 animadores em JS.
- [ ] **D6 · o sistema para de falar de si mesmo** · de: jogo · 14/09
  *(etapa nova, nascida de D1 — o `jogo` jogando achou a lei mais partida do
  dia, e ela não cabia em D5 como estava escrita.)*
  **13 strings de bastidor chegam à tela**, com a quota de API do autor à
  cabeça: `Limite diário alcançado (500 chamadas)… me avise: o teto sobe`
  (`api/_portao.js:174`), `sem gastar tokens` (`App.jsx:2796`), `semente` e
  `selo da luta` (`:4491`), `roster` ×4 (`:4402, 4416, 4461`), `o modelo
  forte` (`:3682`), `o sistema está traduzindo` (`:3770`), `espinha`
  (`:3587`), `tabelas geradoras` (`:3557`), `canal` (`:4381`). Limpar as
  strings, e **`check-formas.mjs` ganha um quarto dente**: lista negra de
  vocabulário de bastidor nas strings renderizadas (`token`, `semente`,
  `seed`, `selo`, `roster`, `preset`, `postura`, `modelo`, `prompt`,
  `canal`, `chamadas`, `o sistema`, `tabela`), com perdão escrito — e
  `api/*.js` **tem** de entrar no varrimento, porque a pior string de todas
  vem de lá e chega inteira ao jogador. Uma cor errada faz o jogo feio;
  `sem gastar tokens` no inventário faz o jogo deixar de ser um jogo.

  **Depois de D5**, a mesa propõe livremente pela pauta — a animação do
  dado, a batalha que toma a tela (essa é `pesado`, da pessoa), a paleta, o
  que for. Antes de D5, cada melhoria custaria o dobro e apodreceria na
  metade do tempo.

## Aberto (leve / médio — o ciclo pega daqui, o de maior valor primeiro)

- [ ] **o preço cala o risco nas duas reações que podem falhar** · médio · de:
  regente · 16/09 (K3) · **achado na conferência viva, não na suíte**
  Na tela, hoje, o cartão do ladino diz literalmente **`💨 esquiva ágil · 0 PM —
  anula`**. `esquiva_agil` tem `chance: 0.6`. **O preço promete uma certeza sobre
  uma aposta que falha 2 em 5** — e `formas.md:1076` já tinha escrito a proibição
  pelo nome: *«oferecer "corta tudo" calando que falha 2 em 5 seria mentir o
  preço»*. `contra_ataque` (0,55) tem o mesmo problema.
  **Porque acontece, com a conta:** `PALAVRAS_DA_CHANCE` existe e está certa, mas
  a fenda do preço tem **40 caracteres** (K1, medido a 375 px) e
  `esquiva ágil · 0 PM — anula · mais vezes que não` mede **48**. A regra de hoje
  — *a chance sai, o preço nunca se corta* — está certa na prioridade e errada no
  resultado: **as únicas duas reações cuja chance importa são exactamente as duas
  que nunca a mostram.**
  **Três saídas, e nenhuma é para decidir de fim de ciclo:** (a) a chance ganha
  **segunda linha** no cartão — K1b já deixou `Etapa=Chamando` esticar para duas,
  e o chamado tem 56 px; (b) o orçamento sobe, porque **K3 deu ao cartão um teto
  de 560 px** e os 40 caracteres foram medidos para 375 — *o número é de outra
  peça*; (c) a chance vira **glifo ou peso de traço**, sem custo de largura.
  **Precisa dos dois seniores**, e é a primeira coisa que K4 vai encontrar
  quando perguntar por que o jogador aceita a esquiva sem ler.

- [ ] **`#FF9A85` literal no número flutuante do tabuleiro** · leve · de:
  desenho · 16/09 (K3)
  `grade-de-batalha.jsx:282` pinta o número de dano que sobe do quadrado com um
  vermelho escrito à mão, **fora de `T`**, ao lado do `T.danger` que devia ser. É
  um tom que nunca passou por tabela nenhuma. **Uma linha**, e o `desenho`
  encontrou-o a ler a 13.ª porta do segredo do dano — não é de K3 e por isso não
  foi consertado de carona.

- [ ] **o dente `D5e.2` ficou com folga zero, e o conserto é melhorá-lo** ·
  leve · de: desenho · 16/09 (K3)
  `check-formas.mjs:765` compara `duracoesVistas.length >= queAnimam.size`. Antes
  de K3 eram **14 durações para 13 classes** (folga 1: `.tv-dice` declara duas);
  com as sete novas ficou **20 para 20** — verde, e **a próxima classe de duração
  variável fica vermelha sem nada de errado ter acontecido**. **O conserto é uma
  linha e torna o dente melhor, não mais frouxo:** contar à parte as classes cuja
  duração é `var(--…)` e **asserir que são exactamente uma** — `.tv-janela-tempo`
  é a única classe da casa cuja duração, por lei, não mora na folha. O dente passa
  a **provar a lei** em vez de apenas não tropeçar nela.

- [ ] **os 133 endereços de linha são uma catraca que qualquer edição do
  `App.jsx` desloca — e ela já cobrou uma lápide** · médio · de: regente ·
  16/09 (K2)
  **[K3, 16/09] Cobrou outra vez, no ciclo seguinte, e mais caro:** a janela da
  reação acrescentou **424 linhas** ao `App.jsx` e `check-acoes-do-jogador.mjs`
  passou a acusar **90 divergências — todas de endereço, nenhuma de
  comportamento**. Foram re-medidas à mão por um mapa de linhas antigo→novo. **É
  a segunda vez em dois ciclos**, e o segundo pagamento foi 2,7× o primeiro; a
  catraca não mede o jogo, mede o quanto o arquivo não se mexeu.
  **O achado, e ele saiu de pagar a dívida de W2:** ao levar três funções do
  `App.jsx` para `golpe.js`, apagar as 33 linhas empurrava **133 endereços
  `src/App.jsx:<linha>`** cravados em nove arquivos de `testes/` — o funil e as
  recusas de `acoes-do-jogador.mjs`, o `pushMsgs` de `check-acoes-do-jogador`,
  `check-formas`, a régua de combate, `teste-regua`, `teste-guardado`. **Alguns
  são verificados por varredor** (`pushMsgs segue em src/App.jsx:7504`), logo o
  deslocamento não é cosmético: é a medição a mentir com a suíte verde. Ficou no
  lugar **uma lápide de exactamente 33 linhas de comentário**, com o motivo do
  próprio tamanho escrito dentro.
  **A proposta:** o endereço deixa de ser um número e passa a ser **uma âncora
  de texto** — um trecho curto e único do código, que um varredor resolve em
  linha na hora de falhar. *É o mesmo movimento que a âncora de recusa fez nesta
  etapa quando a frase mudou de arquivo: `check-acoes-do-jogador` deixou de
  procurar num arquivo fixo e passou a dizer ONDE procura.* **Porquê:** um
  endereço de linha num arquivo de 21 mil linhas é uma catraca que só está certa
  até à próxima edição — e a casa acabou de pagar 33 linhas de comentário para
  não a partir. *É trabalho de uma tarde, e paga a lápide no mesmo dia.*

- [ ] **`A escolha` tem os dois defeitos que esta casa já conhece, e vai ser a
  peça que carrega o nome do inimigo** · médio · de: desenho · 16/09 (W1)
  Lidos em `20:77` ao confirmar que *Forma=Pílula* serve de alvo na fila do
  polegar. **Ela serve** — e `Estado=Escolhida` cobre também *"o que o toque único
  usaria"*, sem estado novo. **Mas faltam duas correções, e nenhuma é peça nova:**
  1. **`Pilula × Foco` mede 75 px contra os 47 das outras três — cresce 28 px.**
     Numa fila de alvos, **tabular empurraria o tabuleiro em mais de meia casa** —
     é o defeito do *Impedido* de E1 outra vez, na peça seguinte. E tem preço
     medido: **com o foco, a região do veredito vai a 105 px e a devolução de W1
     ao campo é ZERO.** *O anel tem de ser desenhado sem mudar a caixa.*
  2. **`rotulo`, `a marca` e `a razao` são CAMADAS, não propriedades**
     (`componentPropertyReferences` vazio nos três). É a doença que E2
     diagnosticou e curou em três peças — ***num componente cujo texto muda por
     instância, texto que não é propriedade é um override à espera de se
     apagar*** — e **esta é a quarta**, numa peça cujo rótulo vai ser **o nome de
     um inimigo**: muda em toda instância e em toda luta. `a razao` é a fenda que
     leva o `· 3 m`; existe, está escondida por omissão, e serve.
  **Por que o `desenho` não as pagou em W1:** é peça viva sob composição que o
  `jogo` ainda não reviu — a mesma condição que E1 pôs e E2 respeitou.

- [ ] **a reserva da razão sobe do botão para a fileira** · médio · de: desenho ·
  16/09 (W1)
  **Medido na peça, e é o terceiro round do mesmo achado.** O `Botao` *Gesto ·
  Normal* mede **63 px**, não 44, porque **reserva 19 px para a linha da razão
  nos quatro estados** — foi a correção que E1 fez para o *Impedido* não empurrar
  o tabuleiro, e estava certa. **Mas na fileira de batalha essa reserva não serve
  para nada:** os verbos partilham **uma** linha do veredito, e a razão nunca
  renderiza por botão (`mostrar a razao = false` em todos). E1 escreveu *"três
  fileiras de 44 px = 144"*; a peça mede **3×63 + 12 = 201**. **São 57 px a mais,
  e uma casa pede 48: a reserva da razão custa mais do que uma fila inteira de
  casas no telefone.**
  **O caminho, e não é mexer na peça:** *a reserva sobe de nível — do botão para
  a fileira*. Quem compõe uma fileira onde o *Impedido* pode aparecer reserva a
  altura **uma vez, na fileira**; quem compõe uma onde ele não pode não paga
  nada. **Mesmos pixels quando a razão pode acontecer, 57 px mais barato quando
  não pode.**
  **Por que o `desenho` NÃO o pagou em W1, e a recusa está certa pela terceira
  vez:** `A linha` (`22:46`) compõe quatro instâncias que dependem de `a razao`,
  e ***peça mudada em silêncio por baixo de uma composição é pior do que peça com
  espaço reservado***. É a mesma condição que E1 pôs e E2 respeitou — e agora tem
  o número que faltava para a fechar. *(Parente do item "a razão sai do `Botao` e
  passa a ser sempre `A Consequência`", mais abaixo: são o mesmo achado visto de
  dois lados, e fecham juntos quando o `jogo` rever `A linha`.)*

- [ ] **D5d · a catraca não vigia a própria paleta** · leve · de: desenho · 15/09
  **Achado a construir o `lineStrong`, e é um buraco na catraca que ele mesmo
  atravessou:** um token novo em `T` passa por **todos** os portões da casa com
  **zero** leitores. `teste-ligacao` §2 varre `^export` e um token é **propriedade
  de `T`**, não export; `check-formas` isenta a zona `T` de propósito (uma paleta
  que não pode crescer é sagrada, que é o oposto da lei). Resultado: a lei do
  export morto vale para toda regra da casa **menos** para a cor.
  **O dente:** toda chave de `T` tem **≥2 leitores** em `src/`. **Medido: `T` fica
  verde no dia em que nasce** — o mínimo é **8**, em `T.onSecond`. `MATERIAIS`
  fica **fora**, por escopo e com o motivo escrito: as 13 chaves têm 1 leitor
  cada, e está certo — há **uma** cortiça.
  **E aperta primeiro o token de quem o propôs:** `lineStrong` entrou com
  exactamente **2**, no piso, contra os 8 do segundo pior. *Uma catraca que estreia
  perdoando o seu autor não é catraca.*

- [ ] **a mira reprova o piso, e agora tem número exacto** · leve · de: desenho ·
  15/09 · **espera o bastão do `App.jsx`**
  O contorno da mira é violeta a 60 % sobre `bg` = **2,689:1** e reprova a
  WCAG 1.4.11. **O defeito é a opacidade, não o tom** — trocar a cor piora
  (`lineStrong` a 60 % = 2,071), e a mira tem de continuar violeta porque há três
  coleções na mesma tela. O conserto que E1 propôs (**70 % = 3,254**) fica
  **0,018 abaixo** do piso de 3,272 que o `lineStrong` instalou: *passa a norma e
  falha a casa.* **O número é 74 % (3,484).** Uma linha, em `App.jsx`.

_Os quinze abaixo saíram da medição de D1 (14/09). A ordem é por retorno:
o barato e mecânico primeiro, o que precisa de decisão depois. Vários só
fecham de verdade **depois de D2 e D5** — o item diz quando._

**Os quatro primeiros nasceram em E1 (15/09)** e são defeitos de **peça**, não
de tela: E3 vai montar com estas peças, e cada um deles vira um defeito no
código no dia em que for montado.

*(Três pedidos de E1 **não** estão nesta lista porque foram **pagos dentro da
própria etapa**, e vale dizer o que eram: `Botao` *Impedido* era **19 px mais
alto** que *Repouso* e **empurrava o tabuleiro** ao ficar indisponível — passou
a ter **uma altura por `Papel`×`Tamanho`**, com a linha da razão reservada nos
quatro estados, e ela não é espaço morto: é onde `A Consequência` do preço se
senta; `Barra de medida` tinha o trilho fixo em 90 px e truncava `17/20` em
`17/` no telefone — agora estica e encolhe, com o trilho a ir de 285 px a
**48** entre 359 e 120 de caixa, porque **quem absorve é o trilho, o único
elemento cuja largura não carrega informação**; e `A marca de borda` foi
**fabricada** — `53:43`, 8 variantes.)*

- [ ] **a razão sai do `Botao` e passa a ser sempre `A Consequência`** · médio · de: desenho · 15/09 (E1)
  É o fim de linha do achado de E1: o nó *"a razão"* do `Botao` existe só nas 12
  variantes em que ele **recusa**, e os tons *Impedimento* e *Espera* de
  `A Consequência` existem exatamente para isso — **foram construídos duas vezes
  por acidente**. O `desenho` **recusou fazê-lo nesta rodada, com motivo, e a
  recusa está certa:** `A linha` (`22:46`) compõe **quatro** instâncias de
  `Botao` que dependem de `a razao` e `mostrar a razao`, e apagá-las mudaria
  calada uma peça que o `jogo` não reviu. ***Peça mudada em silêncio por baixo
  de uma composição é pior do que peça com espaço reservado.*** Fecha quando o
  `jogo` rever `A linha`.
- [ ] **o eixo *Largura* do `Botao`** · médio · de: desenho · 15/09 (E1)
  `formas.md` diz que *Largura* é variante (*"cabe no conteúdo"* / *"ocupa a
  linha"*); no Figma o conjunto tem `Papel × Estado × Tamanho` **e nada mais**.
  Em *A pergunta que expira* os botões ocupam a linha **por sobreposição na
  instância**, que é a definição de um eixo em falta. **Não foi pago em E1 de
  propósito, e o motivo é um número:** o eixo leva o conjunto de 24 para **48**
  variantes, acima do teto de 30 que a disciplina de biblioteca recomenda; e a
  alternativa — mexer na estrutura interna das 24 — **mudaria calado toda
  composição que já as usa**, incluindo *A linha*. Pesa porque a condição 2 de
  *A linha* (*"no telefone a chamada ocupa a largura"*) depende dele.
- [ ] **a masmorra 7×18, o caso que nenhum quadro mostra** · leve · de: jogo · 15/09 (E1)
  Das dez plantas, **nove aparecem inteiras** no arranjo de duas colunas; a
  masmorra 7×18 transborda **58 px — uma casa e um quinto**, e é **a única que
  rola num monitor**. Portanto é o único caso em que as regras de enquadramento
  (o herói no centro da área livre; a câmara só se move quando é obrigada) e a
  marca de borda fazem trabalho de verdade no desktop — **e não tem quadro**. É
  o que o `jogo` comporia a seguir, e ele disse-o em vez de o esconder.
- [ ] **o branco invisível na raiz das peças de D3/D4** · leve · de: desenho · 15/09 (E1)
  Os componentes de D3/D4 carregam na raiz um preenchimento **branco invisível**
  (`visible: false`, sem variável) — o branco que `figma.createAutoLayout()` dá
  de nascença, **desligado em vez de removido**. Amostrados 3 de 3 (`Barra de
  medida`, `Botao`, `Consequencia`): todos o têm. **Não pinta nada hoje; pinta
  branco no dia em que alguém ligar a visibilidade**, e qualquer varredura de
  *zero hex solto* vai encontrá-lo. A regra de D4 continua certa e é só aplicá-la:
  **quadro que só organiza leva `fills = []`**, não `fills = [branco desligado]`.
  As quatro peças de E1 nascem sem ele. *(Contado por amostra, não por varredura
  do arquivo — e é por isso que é item e não nota.)*
- [ ] **dois números que E3 leva de graça, e um deles é uma reprovação viva** · leve · de: desenho · 15/09 (E1)
  Os dois são de **E3**, e ficam aqui para não se perderem se E3 demorar.
  (1) **O contorno da mira REPROVA o piso de não-texto hoje.**
  `grade-de-batalha.jsx:433` desenha a união com `opacidade={0.6}`, e **violeta a
  60% sobre `bg` dá 2,68:1** contra os 3:1 do WCAG 1.4.11 — o âmbar a 60% dá
  3,85:1 e passa, o violeta não. **0,6 → 0,7** dá 3,24:1 e passa. É um número, e
  só se viu porque a discordância da borda obrigou a medir o contorno sozinho.
  (2) **`#141020` → `T.bg`** no fundo do tabuleiro (`grade-de-batalha.jsx:367`):
  é **literal solto** que a catraca D5a conta **e** está a **1,04:1** de `T.bg`,
  o que faz o vão de 2 px do anel de foco não se separar. A troca é invisível a
  olho nu — 1,04:1 é menos que a diferença entre `panel` e `bg`, que é 1,07:1 —
  e **conserta os dois de uma vez**.

- [ ] **nenhum número muda em silêncio** · médio · de: desenho · 14/09 (D4)
  *A proposta ambiciosa do `desenho`, e ela é `médio` pela régua nova: a
  pergunta do pesado é "o jogador teria de reaprender?", e aqui a resposta é
  **não**. Nada muda de lugar, nada muda de nome, nenhum fluxo muda — o que
  hoje acontece calado passa a acontecer à vista.*
  **O diagnóstico:** o Taverna calcula um jogo inteiro e **conta** o
  resultado em prosa cinzenta. 225 moedas entraram em dois turnos e o número
  só existe dentro da Bolsa. O XP subiu e a barra já estava cheia quando o
  jogador olhou. A vida caiu e a barra deslizou em 700 ms sem dizer quanto. A
  primeira missão da campanha virou a quarta de seis pílulas iguais. **O jogo
  tem o padrão certo e usa-o uma vez só** — o véu do dado.
  **A lei proposta:** *todo valor de estado que muda entre um turno e o outro
  veste a marca de "mudou agora", no lugar onde ele vive.* Três peças, e
  **duas já foram fabricadas em D4**: o `Selo` com *Mudou=Agora* (halo, três
  pulsos, e para) e a `Barra` com *Mudou=Golpe/Ganho* (o pedaço que saiu fica
  visível, o número escrito, e a barra de XP **enche** no fim da missão em
  vez de já estar cheia). A terceira é **O Realce** no log, também feita.
  **O que falta é conta, não tela:** uma primitiva `Numero` que saiba a
  diferença entre o valor de agora e o do turno passado, e entregue
  `{ valor, delta, mudouAgora }`. Módulo puro, com suíte — **e por isso é da
  fila do sistema**, não desta: a mesa pede, o `backend` escreve.
  **O preço, dito por escrito:** movimento demais cansa, e esta lei põe
  movimento em muitos lugares ao mesmo tempo. Três defesas, todas na forma: o
  halo para depois de três pulsos; a marca vale **um turno** e some; e sob
  `prefers-reduced-motion` **nada pulsa** — parada, a marca diz o mesmo. Se
  ainda assim ficar demais, o corte é do `jogo`: **quais** números merecem a
  marca é momento. O `jogo` já pôs o seu teto: **no máximo dois por turno, e
  só para o que aconteceu *com* o jogador.**
  **A prova de que não é gosto** é a lei que a pessoa deu à mesa — *"devemos
  fazer o máximo para ter a experiência de um jogo e que ele realmente está
  fazendo coisas — não só lendo e escrevendo"* — aplicada ao único lugar onde
  cabe sem mexer em fluxo nenhum: os números que o jogo **já** calcula e
  **já** mostra, e que hoje mudam sem que ninguém veja.

- [ ] **os 80 literais que já são `T`** · leve · de: desenho · 14/09
  Dos 242 literais de cor nos arquivos de tela, **67 (28%) já são cores da
  tabela**: 24 hex idênticos a um valor de `T`, e 43 `rgba()` cujo RGB é
  exatamente uma cor de `T` com alfa — **44 deles só no `App.jsx`**. Um
  helper `alfa(cor, a)` e uma substituição mecânica apagam mais de um quarto
  da dívida. **O retorno mais barato da fase inteira**, e é ele que torna
  D5b zero-perdão.
  *(corrigido por D2: são **80**, não 67. D2 mudou a folha de casa e com
  isso ela passou a ser território varrido — dentro dela há mais **13**
  `rgba()` que já são `T` com alfa, 7 no `MOVIMENTO_CSS` e 6 no
  `SUPERFICIES_CSS`. D2 não as tocou de propósito: trocá-las à mão seria
  escrever a fórmula do `alfa()` treze vezes antes de ela existir. **Este
  item é agora pré-requisito de D5b**, não um vizinho dele.)*
  *(confirmado por D5, 15/09: são **80** exatos, e o dente D5b mede exatamente
  este número. Quando este item rodar, o teto de D5b vai a zero e as entradas
  **saem** da tabela — a catraca falha com `ENTRADA MORTA` se ficarem lá a
  dizer `0`.)*

- [ ] **o pergaminho ganha nome** · médio · de: desenho e jogo · 15/09 (D5)
  **71 literais em `painel-mapa.jsx` (41) + `planta-cidade.jsx` (30), e a prova
  de que é sistema é um acaso impossível: 10 hexes aparecem nos DOIS arquivos,
  escritos separadamente, e cobrem 52 dos 71 usos** — `#5C4A30` a tinta (×11),
  `#F0E6CC` o papel (×10), `#EADFC1`, `#6D5C40`, `#B4322E`, `#3A2E1C`,
  `#C9A45A`, `#A08A5E`, `#8D7A56`, e a família do mar. Dívida acidental não
  concorda byte a byte em dois arquivos.
  A casa dele **não é `T`** — `T` é semântica (`panel`, `line`, `danger`) e não
  deve crescer para `papel`, `tinta`, `estrada`, `mar`, `selo`. É
  **`MATERIAIS`**, a paleta física criada em D2, onde a cortiça já mora.
  **~11 tokens.**
  *(correção medida: as "irmãs em `rosto.jsx` e `carta-taro.jsx`" **não
  existem** — as duas são escuras e são dívida comum. `carta-taro.jsx` carrega
  8 cores de `T` exatas e é o depósito mais rico de D5b fora do `App.jsx`.)*
  Paga o perdão de D5a nos dois arquivos. E o `jogo` olhou e disse o que o
  torna barato: **é o único lugar do jogo onde a tela é clara**, e a fronteira
  entre as duas paletas é exatamente a borda do objeto desenhado — o título, as
  abas, a tira do lugar, o `✕` e a legenda são **100% `T`**. Não é vazamento, é
  moldura.

- [ ] **os pigmentos do dado de jogo** · leve · de: desenho · 15/09 (D5)
  77 literais em `semente.js` (38), `mapa.js` (13), `npcs.js` (10), `palco.js`
  (10) e `devocao.js` (6) — cabelo, pele, olhos, bioma, facção, relação,
  devoção. **Já obedecem à lei da casa** (estão dentro de tabelas nomeadas, ao
  lado de `rotulo` e `icone`), e por isso estão **fora de D5b por escopo**: uma
  cor de patamar que vira `T.amber` muda sozinha no dia em que a Fase L
  esquentar o âmbar, e a rampa de devoção deixa de ser rampa.
  O que sobra para este item é menor e é real: **`rosto.jsx` tem `#7A1F1F`, que
  é `CABELO[8]` exato** — cor de dado copiada para dentro da interface, a
  direção contrária e a única que é mesmo defeito.

- [ ] **a cor do primeiro pixel sai de uma fonte só** · leve · de: desenho · 15/09 (D5)
  `index.html` tem `<body style="background:#0E0C15">`, que é `T.bg` copiado à
  mão. **Possivelmente o único perdão eterno do projeto:** o `index.html` é
  servido **antes** do bundle e não tem como importar `T`. O item não é faxina,
  é uma decisão de duas linhas: o build **gera** essa linha a partir de `T`, ou
  a casa **aceita** a cópia e escreve isso no lugar onde ela vive. Hoje ela
  aparece nas duas tabelas da catraca com teto 1, sem data de validade.
- [ ] **uma forma para o destrutivo — e o contraste que reprova sai** · leve · de: desenho · 14/09
  O botão que **remove um companheiro do grupo** (`App.jsx:2540`) usa `#fff`
  sobre `T.danger`: **3,42:1, reprova em WCAG AA**. Os outros destrutivos
  (`painel-talentos.jsx:112` e `:417`, `painel-ascensao.jsx:72`) usam
  `#1A0F0D` (5,48:1, passa). São três tintas de texto-sobre-vermelho, duas
  inventadas na hora, e a ilegível está no único botão que apaga alguém.
  `T.onAccent` sobre `danger` dá 5,34:1 e resolve. Correção de
  acessibilidade, não de gosto.
- [ ] **`prefers-reduced-motion` cobre as 13 animações, não 3** · leve · de: desenho · 14/09
  Só `tv-anel-fora`, `tv-anel-dentro` e `tv-pisca` têm saída — e são as três
  menos importantes, o sigilo de espera de uma tela administrativa. As cinco
  **infinitas que rodam durante o jogo** não param para ninguém:
  `tv-dice`, `tv-pulse`, `tv-agonia`, `tv-reliquia`, `tv-anel-*`. `tv-agonia`
  pulsa vermelho **enquanto o herói estiver abaixo de ⅓ de vida** — pode ser
  a cena inteira. Fecha D5c.
- [ ] **nenhum veredito mora num `title`** · leve · de: jogo · 14/09
  A lei diz que toda ação irreversível mostra o preço antes. Hoje o preço do
  **Destino** (*"o segundo dado vale — mesmo se for pior"*) está num atributo
  `title`: invisível sem rato, inexistente no telemóvel. O `jogo` clicou sem
  saber que podia piorar. Mesmo defeito em `⤢` e no interruptor `🎲`, cujo
  **estado só existe no tooltip** — clicou, o emoji não mudou, e não ficou a
  saber se ligou ou desligou.
- [ ] **`⛺` em combate pergunta antes** · leve · de: jogo · 14/09
  Um emoji sem rótulo, clicado a meio de uma luta do torneio, **terminou a
  luta** — sem confirmação, sem dizer o que aconteceu ao adversário, sem
  ganhou/fugiu/desistiu. A ação mais irreversível da sessão inteira, atrás
  do controle mais mudo.
- [ ] **`tv-btn` não existe, e quatro ícones estão mortos** · leve · de: desenho · 14/09
  `tv-btn` é usada **5 vezes** em `painel-ascensao.jsx` e **não existe em
  `FONT_CSS` nem em lugar nenhum** — cinco botões carregando uma classe
  inerte que alguém no futuro vai tomar por padrão da casa. E
  `IconeBandeira`, `IconeGota`, `IconeCirculoX`, `IconeFrasco` nunca são
  renderizados: aparecem uma vez cada, **na linha de import gigante
  `App.jsx:163`**. Passam no `teste-ligacao` porque a lei conta "referência",
  e import é referência. **A catraca de export morto tem um furo do tamanho
  de uma linha de import** — fechá-lo é meio-item à parte, e é da outra fila.
- [ ] **`REVANCHE` faz revanche** · leve · de: jogo · 14/09
  O botão grande e dourado do resultado do Duelo devolve o jogador ao **ecrã
  de montagem**. O rótulo promete uma coisa e o clique faz outra.
- [ ] **o aviso cola-se ao botão que destrói** · leve · de: jogo · 14/09
  *"Começar uma nova campanha substitui a anterior neste dispositivo"* é
  **rodapé no fim da página**; o botão `Nova campanha` que substitui está
  longe dali. É a coisa mais cara do jogo, protegida pelo texto mais
  distante.
- [ ] **as moedas no cinturão** · leve · de: jogo · 14/09
  *(medido no jogo carregado)* A barra de status mostra **NIV, PV, PM, XP, o
  dia e o lugar** — e **não mostra o dinheiro**. `◉ 240` só existe **dentro**
  do painel Bolsa, e é o número que decide toda compra, todo suborno, todo
  presente e toda obra: o jogador abre uma gaveta para saber se pode pagar.
  Com o **Selo de estado** fabricado em D3/D4, o cinturão do cabeçalho é
  **montagem, não desenho novo** — nenhuma peça nova, nenhum fluxo mudado,
  nada para reaprender.
  *(substitui e absorve "as moedas existem no HUD", na fila desde D1: é o
  mesmo item, e agora tem a peça que o torna barato.)*
- [ ] **`.tv-margem-abas` é o padding-right da v9.197 outra vez, em
  `margin`** · leve · de: jogo · 14/09 (achado em D2)
  O comentário da própria classe conta, em vinte linhas, como uma
  declaração que vale 0 continuou mandando na cascata e colou o conteúdo na
  borda direita no telefone — e a correção da v9.197 matou o
  `padding-right` e **deixou o `margin-right: 0` vivo do lado**. A classe é
  usada em seis cartões (`App.jsx:3081, 3331, 20628, 20675, 20757, 21064`),
  todos com `mx-4 md:mx-8`; especificidade idêntica, e a nossa folha vem
  depois do Tailwind (CDN no `<head>`, ver `index.html:7`), então **ela
  ganha: 16px à esquerda e ZERO à direita**, nos seis. A declaração dentro
  do `@media (min-width: 768px)` é idêntica à base — ruído puro.
  É meia linha para apagar, e **não** foi apagada em D2 de propósito: a
  linha daquela etapa era *zero diferença na tela*, e esta muda pixel. É a
  mesma queixa de quem jogou no telefone, pela terceira vez no mesmo sítio.
- [ ] **o regex de `teste-celular.mjs:56` não afirma o que parece** · leve ·
  de: aprendiz · 14/09 (achado em D2)
  `!/padding-rights*:/` — o `s*` é "zero ou mais letras s" grudado em
  `right`, não um `\s*`. Passa hoje só porque não existe `padding-right`
  nenhum na folha; no dia em que voltar um `padding-right : 68px` com
  espaço, a catraca que existe para pegá-lo **não pega**. Uma barra
  invertida. (Território de teste de forma, logo desta fila.)
- [ ] **`T` ganha `dangerFundo` e `okFundo`** · leve · de: desenho · 14/09
  `#33201F` e `#1F3320` já existem, com **7 usos**, e são a única gramática
  de "estado com fundo" que o jogo tem. Estão fora da tabela por descuido,
  não por decisão.
- [ ] **vitória e derrota são dois ecrãs, e o meu campeão é marcado como
  meu** · médio · de: jogo · 14/09
  Medido lado a lado nas duas abas do PvP: quem perdeu e quem ganhou veem
  **o mesmo ecrã**, mesma cor, mesmo tamanho — `A Sombra vence · 2×1`. Nada
  diz qual dos dois campeões era do jogador. Para além da palavra do nome,
  os dois fins são pixel a pixel idênticos.
- [ ] **o turno diz de quem é a vez, no sítio onde se age** · médio · de: jogo · 14/09
  O painel `ORDEM DE INICIATIVA` marcou o inimigo como **`● AGINDO` por mais
  de 10 segundos enquanto o jogo esperava pelo jogador**. A linha do jogador
  não tinha marca nenhuma, e nada na barra de ação dizia "é a sua vez". Ele
  esperou, não soube se tinha travado, e descobriu escrevendo à sorte.
- [ ] **o momento merece um momento** · médio · de: jogo · 14/09
  A conclusão da primeira missão da campanha foi **a quarta de seis pílulas
  cinzentas do mesmo tamanho, na mesma cor, no mesmo tipo**, sem pausa, sem
  som, sem a barra de XP enchendo. Idem conquista desbloqueada, achado, e o
  nascimento silencioso de um sexto separador no menu. O jogo tem o padrão
  certo e usa-o uma vez só: **o modal do dado**, que escurece a tela, mostra
  `5 + 2 = 7` e depois "Falha" — *"o único momento da sessão inteira em que
  senti que estava a jogar"*. É o que o resto devia invejar.
- [ ] **uma gramática só para "escolher um entre N"** · médio · de: desenho e jogo · 14/09
  O `desenho` mediu no código: `CartaoDeEscolha` é usado 11 vezes, **todas na
  criação de personagem**; fora dali "escolha um da lista" é redesenhado à
  mão em 8 lugares, com "selecionado" ora borda âmbar, ora fundo violeta, ora
  só opacidade. O `jogo` tropeçou nas mesmas cinco gramáticas jogando —
  **quatro delas na mesma criação de personagem**: cartão grande, `<select>`
  nativo, botão-pílula, stepper `−`/`+`, aba-pílula. Junto: **"ação principal
  bloqueada" tem 3 comportamentos** (desativado com a razão escrita — bom;
  desativado e mudo — o `À ARENA →` que fez o jogador adivinhar; e ativo com
  erro vermelho longe do campo).
- [ ] **`ui.jsx` ganha o que falta** · médio · de: desenho · 14/09
  `BotaoDestrutivo`, `Fechar`, `Sobreposicao`, `Badge`, `Barra`. Hoje são
  **218 `<button>` crus contra 16 `<Botao>`** — nove dos dez painéis usam
  **zero** primitivas de botão, e 9 dos 11 componentes de layout têm um único
  leitor (o `App.jsx`): não são primitivas compartilhadas, são funções que
  saíram do App e continuaram a só servir ao App. **Sem isto, D4 escreve
  formas que nada obriga ninguém a usar.**
- [ ] **a segunda paleta ganha nome** · médio · de: desenho · 14/09
  `painel-mapa.jsx` (41 literais) + `planta-cidade.jsx` (30) têm **71
  literais e ZERO cores de `T`** — e concordam entre si: `#5C4A30` a tinta,
  `#F0E6CC` o papel, `#EADFC1`, `#6D5C40`, `#B4322E`. Não é sujeira: é uma
  **paleta de pergaminho inteira que o jogo já tem e nunca foi declarada**,
  com irmãs em `rosto.jsx` (`TINTA`, `PANO`, `PANO_FUNDO`, nomeadas em
  `const` local) e `carta-taro.jsx` (36 literais). Perdoá-las uma a uma em
  D5 seria registrar como dívida o que é design.
- [ ] **a chave do Torneio é visível durante o torneio** · médio · de: jogo · 14/09
  Depois de entrar na chave, as palavras "chave", "torneio" e "final" **não
  aparecem uma única vez**. O jogador não sabe em que ronda está nem quem
  falta.

- [ ] **a interface sai do App.jsx, uma tela por vez** · médio · de: regente · 14/09
  Medido em 14/09: `App.jsx` tem **21.295 linhas e 939 `style={{}}`** —
  **63% da interface do jogo**. Fora dele vivem 4.994 linhas e 580 estilos
  (11 painéis, `ui.jsx`, e os quatro desenhos). Enquanto a tela morar no
  `App.jsx`, toda etapa de design disputa o bastão com a mente do sistema.
  Cada tela levada para um `painel-*.jsx` próprio compra independência
  permanente — **prefira mover a remendar no lugar**. Não é uma etapa: é um
  hábito, e vale como meia-etapa em qualquer ciclo que já segure o bastão.
  Catraca: build limpo, suítes verdes, e a tela idêntica no navegador.

## Recusado (com o motivo — para a mente não propor de novo)

_(vazio)_
