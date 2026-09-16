# As formas

**Uma ação, uma forma.** Este arquivo é onde o `jogo` e o `desenho` se
encontram, e é a única fonte de verdade sobre a cara de cada coisa que o
jogador toca. Quem constrói (`aprendiz`, `frontend`) lê daqui — e para,
quando não acha.

Se a mesma ação aparece com duas caras no jogo, uma delas é defeito. Não é
questão de gosto: é a lei da casa aplicada à interface.

A verdade visual mora em **dois lugares que não podem divergir**: a
biblioteca no **Figma** (o desenho) e as tabelas em código — `T` (a paleta
semântica), `MATERIAIS` (a paleta física das superfícies) e a folha de
estilo, todas em **`src/estilo.js`** desde D2; as primitivas em `ui.jsx`.
`constantes.js` continua reexportando tudo, para quem importava de lá não
precisar saber da mudança. O Code Connect amarra os dois. Este arquivo é o
índice em prosa dos dois, com o *porquê* — que nenhum dos dois guarda.

---

## O formato de uma forma

```
### <a ação, no verbo do jogador>
- **quando** — o momento em que aparece (dono: `jogo`)
- **forma** — o que é, e os estados (dono: `desenho`)
- **movimento** — o que se move, quanto tempo, com que saída
- **onde vive** — o componente no Figma · o componente em código
- **por quê** — a razão, no tom da casa
- **peso** — leve / médio / pesado (ver `CLAUDE.md`)
```

---

## As formas decididas (D4 · 14/09)

**Trinta formas.** Saíram de duas metades escritas no mesmo turno, sem uma ver
a outra: o **censo do que o jogador toca**, do `jogo` — 231 controles em onze
famílias, medidos no DOM vivo —, e a **medição da forma**, do `desenho`. O
`quando` de cada uma é do `jogo`, na palavra dele; a `forma` é do `desenho`.

**E depois o `jogo` julgou cada forma**, com uma pergunta só: *ela serve ao
momento em que o jogador a encontra?* O que ele reprovou ou ressalvou está
dobrado **dentro da forma a que pertence**, e não numa lista à parte — é assim
que a fronteira de autoria fica legível para quem construir amanhã: a forma de
um lado, o momento ao lado dela, e o nome de quem decidiu cada metade.

**O nome de uma forma é o verbo do jogador.** Não "botão destrutivo": *remover
um companheiro do grupo*. Quem procura aqui procura pelo que quer fazer, e não
pelo nome do mecanismo — é a mesma lei que proíbe o sistema de falar de si
mesmo na tela, aplicada ao índice.

Três avisos de leitura:

- **`[ainda não existe]`** em *onde vive* é dívida nomeada: a forma está
  decidida e o código não a tem. Aparece em **vinte e nove das trinta**, no todo
  ou em parte — a única que não a carrega é *"não pode agora"*, e só porque ela
  **existe errada** (`ui.jsx:27`, `opacity: 0.4`), que é pior que não existir.
  Dívida nomeada vale mais que dívida suposta.
- **Seis formas não têm controle nenhum hoje** — o sistema decide sozinho e o
  jogador lê o resultado. Elas têm forma declarada mesmo assim, e é isso que as
  torna cobráveis: **a forma diz o que deveria existir.**
- Toda forma que aposenta outra carrega **o caminho da prova**: medida, estudo
  citado com a origem, ou experiência jogada pelo `jogo`. *Achar* não é
  caminho.

---

### escrever o que você faz

- **quando** — o tempo todo, em Uma Vida e no Capítulo: é a ação central do
  jogo e o único jeito de o jogador falar com o mundo. O `quando` do `jogo`
  chega pelo avesso, na divergência do "não pode agora": *"você ainda não
  escreveu nada… um controle que se acende sozinho quando você digita não é
  impedimento — é o campo vazio a falar."*
- **forma** — **A linha** (peça nova). Campo de 72px de altura mínima, `panel`
  com borda `line`, canto 10, prosa em Spectral 15px — não mono: é prosa, e a
  prosa é a protagonista. Quatro estados: *Vazio* (marcador d'água em `inkDim`,
  **6,62:1**), *Escrevendo* (borda `amber` e o anel de foco), *Esperando* (o
  campo **continua editável** — hoje ele bloqueia junto com o botão),
  *Impedido* (o campo continua editável; quem está impedido é a chamada). A
  chamada **vem dentro da peça**, à direita, carregando a razão.
- **movimento** — nenhum no campo. A borda troca de cor em 120ms; o anel de
  foco **não anima** (quem tabula depressa vê borrão, não foco). Sob
  `prefers-reduced-motion`, idêntico.
- **onde vive** — Figma: página `A linha`, conjunto `A linha` (4 variantes),
  composto com uma instância do `Botao`. · Código: **[ainda não existe]** — são
  **23 campos de texto** escritos à mão em `src/**`, 19 deles no `App.jsx`,
  incluindo o do turno (`App.jsx:21216`), num projeto onde `outline-none`
  aparece 17 vezes.
- **por quê** — medida: o jogo inteiro passa por aqui e não tem primitiva.
  Enquanto não tiver, cada tela nova inventa o seu campo — e a mais importante
  de todas continua a ser a menor coisa da tela. **Nenhuma das duas listas
  desta fase tinha pedido esta peça**; ela apareceu ao contar.
- **condições de aceitação — do `jogo`, e não são nota de rodapé.** Esta peça
  **não sobe ao campo do turno** se qualquer uma das três cair. É um defeito
  que passa no build, passa na suíte, e **só o uso pega** — a mesma família da
  armadilha que o `CLAUDE.md` já guarda ("componente dentro do render mata o
  foco").
  1. **`Enter` manda o turno; `Shift+Enter` quebra linha.** O campo de hoje é
     um `<input>` de uma linha e `App.jsx:21216` faz `e.key === "Enter" &&
     agir(entrada)`. Um campo de 72px com prosa é, na prática, um `textarea` —
     e em `textarea` o `Enter` **quebra linha**. Adotar a peça sem esta regra
     **trocaria em silêncio o gesto mais repetido do Taverna**, centenas de
     vezes por campanha, sem avisar ninguém: o jogador só descobriria que o
     turno não foi. *"Nenhum ganho de tamanho paga trocá-lo em silêncio."*
  2. **No telefone, campo e chamada NÃO dividem a linha.** A peça **empilha**:
     o campo em cima com as suas três linhas de Spectral 15, a chamada embaixo
     ocupando a largura. A conta do `jogo` a 375×812: sobram ~343px de linha, a
     chamada nova pede ~140px, e o campo ficaria com ~195px — **doze ou treze
     caracteres de prosa visíveis por vez**, para escrever a ação central do
     jogo. A ironia útil é que empilhado o telefone ganha **o maior alvo dos
     quatro modos**, que é o que a plataforma pede. No desktop dividem a linha,
     onde há 1280px de sobra.
  3. **A última fala do Mestre não sai da tela com o teclado aberto.** O
     momento da peça é o jogador a **responder** a alguma coisa; se abrir o
     teclado empurra a narração para fora, *"ele responde de memória"* — e a
     peça troca "responder" por "lembrar".
  E a razão da altura, que é do `jogo` e sustenta os 72px: **duas linhas do que
  ele escreveu, sempre visíveis.** Hoje, num `<input>`, uma frase média sai pela
  esquerda e o jogador não relê o que está a mandar ao Mestre.
- **peso** — **médio** fabricar; **pesado** aplicá-la ao campo do turno, que é
  o que o jogador já usa.

### mandar a ação acontecer (a chamada)

- **quando** — *"o jogador escreveu (ou escolheu) e agora quer que o mundo
  ande"*. O fim de todo turno, nos quatro modos: `Agir →` (`App.jsx:21219`),
  `⚔ A PRÓXIMA LUTA` (`:21204`), `À ARENA →` (`:4468`), `ENTRAR NA NOITE / NA
  CHAVE →` (`:4330`), `forjar o mundo` (`:3674`), `entrar em cena` (`:3952`),
  `entrar na sala` (`:4060`). *"É o gesto mais repetido do jogo — um por turno,
  centenas por campanha."*
- **forma** — `Botao` *Papel=Chamada*, **uma por tela**. Mono Bold **16px**,
  canto 8, padding 16/28, `amber` com `onAccent` (**8,49:1**). *Largura* é
  variante — `cabe no conteúdo` ou `ocupa a linha` —, **não um segundo botão**.
  A razão **nasce acesa**. Ver a divergência *a ação principal entre os modos*.
- **movimento** — `transform: none`; só a tinta muda, 120ms. **Nada de pulsar a
  chamada**: o que pulsa o tempo todo deixa de ser chamada.
- **onde vive** — Figma: `Botao` (24 variantes). · Código: `Botao`,
  `ui.jsx:19` — usado **16 vezes contra 218 botões crus**, e **sem onde
  escrever a razão**: essa fenda é **[ainda não existe]**.
- **por quê** — medida do `jogo`, no DOM vivo: `Agir →` = **720 px²** contra
  `⚔ A PRÓXIMA LUTA` = **54.912 px²**, **76×**, e as duas **na mesma tela**. A
  ação mais importante do produto é o menor alvo do modo padrão absoluto.
- **o caso que "uma por tela" não cobria, e a decisão é do `jogo`:** no Torneio,
  **entre lutas, não há turno para fazer acontecer**. Ali a chamada é
  `⚔ A PRÓXIMA LUTA`, e o `Agir →` **desce a *Papel=Gesto*** — ou não existe.
  *"Duas chamadas na mesma tela não é um problema de tamanho: é o jogo a
  oferecer duas portas para a frente e nenhuma delas ser a porta."*
- **peso** — **pesado**.

### rolar o dado, e receber o veredito

- **quando** — *"o Mestre pediu um teste"* (`Rolar d20`, `App.jsx:21228`). O
  véu do dado é `App.jsx:512`. *"O tempo entre o número e o veredito é o
  jogo."*
- **forma** — **Véu**, *Peso=Pesado*. É a única coisa do jogo que já está
  certa, e a forma dela é a régua das outras: escurece, o d20 treme, **para**, e
  só então o número e o veredito. Fica como está, com uma correção de tabela: o
  fundo vira `bg` a 85% (hoje `rgba(8,6,14,0.88)`, literal) e o desfoque, 4px.
- **movimento** — `tv-dice` (`tvShake .35s` + `tvGlow 1s`, ambas `infinite`)
  **até** a parada; depois o veredito em `tv-fade` 500ms. **O `infinite` tem de
  morrer quando o número sai** — hoje ele para porque o nó desmonta, o que é
  sorte de montagem, não desenho. Sob `prefers-reduced-motion`: sem tremor, o
  número aparece, **e a pausa continua existindo** — a pausa é o jogo, não é a
  animação.
- **onde vive** — Figma: `Veu`, *Peso=Pesado*. · Código: `App.jsx:512`, sem
  primitiva — a peça em si é **[ainda não existe]**.
- **por quê** — experiência jogada, do `jogo`, duas fases seguidas: *"o único
  momento da sessão inteira em que senti que estava a jogar"*. O resto do jogo
  devia invejá-lo, e é isso que a escala de cerimônia distribui.
- **a porta que faltava, e é a lei da casa:** toda animação tem de ter saída, e
  esta acontece **dezenas de vezes por campanha** — hoje não tem nenhuma. O
  `quando` é do `jogo`: **um piso de pausa que ninguém pula, e depois dele o
  toque adianta.** Pisar no número antes de ele parar não faz nada; depois de
  parar, qualquer toque vai direto ao veredito. **O que nunca se pula é o
  veredito** — pular o veredito seria pular o jogo.
- **peso** — **leve** (só a tinta sai para tabela).

### refazer a rolagem (gastar o Destino, gastar heroísmo)

- **quando** — *"dentro do véu do dado"*, depois do número e antes do veredito
  (`App.jsx:583` e `:577`). Irreversível.
- **forma** — `Botao` *Papel=Gesto* com **A Consequência** *fixação=Linha*
  presa embaixo: **"o segundo dado vale — mesmo se for pior"**, visível sem
  hover, nascida acesa.
- **movimento** — nenhum.
- **onde vive** — Figma: `Botao` + `Consequencia`. · Código: **[ainda não
  existe]** — a frase inteira mora hoje em `title` (`App.jsx:583-585`), e o
  botão é cru.
- **por quê** — a lei é *o veredito antes do clique*, e aqui o veredito está num
  atributo de rato: **no telefone ele não existe**. O `jogo` clicou sem saber
  que podia piorar o próprio resultado.
- **peso** — **leve**. É tirar uma frase do `title` e pô-la na tela.

### mover para uma casa

- **quando** — todo turno de combate. *(medido ao vivo: **86 casas
  alcançáveis**, cada uma um `<rect fill="transparent">` com `outline: none` e
  sem `aria-label`; **27×27 px** no tabuleiro embutido e **35×35** no
  ampliado.)*
- **forma** — **A casa** (peça nova). Quadrado de **48px**, canto 3. Sete
  estados: *Repouso* (só a linha da grelha), *Alcançável* (`amber` 10% de fundo
  **+ borda `amber` a 55%**), *Sob o dedo* (fundo 22%, borda cheia, **e o custo
  escrito dentro da casa**), *Confirmando* (fundo 28%, borda 2px, o custo **e o
  preço**: "custa um golpe livre"), *Mira* (`violet` 16% + borda tracejada),
  *Impedida* (`line` 30%, sem borda), *Foco* (o anel).
- **movimento** — 90ms para entrar em *Sob o dedo* (abaixo de 100ms o toque
  parece instantâneo — NN/g, *Response Times: The 3 Important Limits*, Nielsen
  1993, a partir de Miller 1968). *Confirmando* **não anima**: é uma pergunta, e
  pergunta que se move parece resposta. Sob `prefers-reduced-motion`, os estados
  trocam a seco.
- **onde vive** — Figma: página `A casa`, conjunto `A casa` (7 variantes, props
  `o custo` e `o preco`). · Código: **[ainda não existe]** —
  `grade-de-batalha.jsx:514` é um retângulo transparente.
- **por quê** — três razões medidas. (1) **O clique já existe e ninguém sabe**:
  `role="button" tabIndex=0` em `:515`, e o `jogo` passou três rodadas a
  escrever *"me aproximo"*. (2) **No telefone não há veredito nenhum**: a rota
  prevista (`:543`) só aparece em `onMouseEnter`, e a única descrição da casa é
  um `<title>` de SVG (`:520`) — dois canais de rato. (3) **O alvo é pequeno**:
  27–35px contra os 44 da HIG da Apple, os 48dp do Material e os 44×44 do WCAG
  2.5.5 (AAA) — **48 é o menor número que passa nas três réguas**. E a borda é o
  que carrega o recado, não o fundo: âmbar a 55% sobre `bg` dá **3,41:1** (passa
  o WCAG 1.4.11, não-texto); a 45% dá 2,65:1 e reprova. O fundo, entre 10% e
  28%, fica entre **1,15:1 e 1,71:1** — é profundidade, nunca informação.
- **condições de momento, do `jogo`, e são a Fase E inteira.** O piso de 48px
  colide com um número dele, medido ao vivo: **o campo da luta era 14×14**, e
  `14 × 48 = 672 px` de tabuleiro num telefone de **375 px**. É por isso que a
  casa mede 27px hoje.
  1. **A casa nunca encolhe abaixo de 44px para o campo caber.** Quem encolhe é
     **o campo visível, não o alvo**: o tabuleiro passa a rolar e a arrastar.
  2. **Quando o combate abre, a casa do herói está na tela.** Sem isto a
     condição 1 é uma armadilha nova — *"um tabuleiro que rola e abre no lugar
     errado é pior do que um que não rola"*. É o defeito medido: o campo abriu
     **429 px abaixo da borda** e o scroller ficou em `scrollTop = 0` de 1129.
  3. ***Confirmando* não é para todo passo.** Dois toques por passo transformam
     o tabuleiro num formulário. **O segundo toque só existe quando o passo
     custa alguma coisa além de metros** — abrir a guarda a um golpe livre,
     terminar colado a um inimigo, entrar em terreno que cobra. **Passo limpo é
     um toque.**
- **e a devolução que o `jogo` fez ao `desenho`, decidida aqui:** *Sob o dedo*
  **não existe antes do toque** — no telefone, entre *Alcançável* e
  *Confirmando* não há estado nenhum, e o custo que hoje só aparece em
  `onMouseEnter` (`grade-de-batalha.jsx:543`) fica sem canal. **A decisão: o
  custo nasce escrito dentro da casa já em *Alcançável***, em mono 10px — `7,5`
  são três caracteres e 48px segura-os com folga —, **e quando o campo é grande
  demais para o número caber legível, ele desce para A Consequência *fixação=
  Linha* ao lado do campo**, nunca para um balão. Um canal que não seja o rato
  tem de existir; escolher qual era do `desenho`, e está escolhido.
- **peso** — **médio** fabricar; **pesado** trocar o alvo no jogo (é a Fase E).

### mirar uma habilidade, escolher o alvo

- **quando** — *"quando a ação tem alcance"*. E o bloco `Escolha o alvo` só
  existe com **mais de um** inimigo de pé (`App.jsx:3246`).
- **forma** — a **mesma peça A casa**, *Estado=Mira*. O que muda é a cor
  (violeta, **5,47:1** sobre `bg` na borda cheia) e o tracejado. **Uma ação, uma
  forma:** mirar e mover são o mesmo gesto sobre o mesmo alvo.
- **movimento** — igual ao de mover.
- **onde vive** — Figma: `A casa`, *Estado=Mira*. · Código: a regra já é uma só
  (`grade-de-batalha.jsx:508`, `clicavel = mirando ? tiro : indo`); a forma é
  que **[ainda não existe]**.
- **por quê** — o código já tratou os dois como o mesmo alvo. A forma estava
  atrás do código, que é raro e vale dizer.
- **a regra de convivência, do `jogo`: nunca as duas línguas ao mesmo tempo.**
  Selecionar uma habilidade com alcance põe a grelha inteira em *Mira*, e **o
  movimento deixa de ser oferecido** até ela ser largada. *"Um tabuleiro que
  pisca duas cores obriga o jogador a decodificar antes de decidir, e
  decodificar custa o turno."*
- **peso** — **médio**.

### ver quanto resta, e quanto acabou de sair

- **quando** — sempre no HUD; no golpe, em combate. São **18 barras**.
- **forma** — **Barra de medida**, com **dois eixos**: *Nível* (Alta · Baixa) ×
  ***Mudou*** (Não · Golpe · Ganho) — eixo novo de D4. *Golpe*: o pedaço que saiu
  fica no trilho em `danger` a 60% e o número (`−3`) fica **escrito** ao lado.
  *Ganho*: o pedaço que entrou chega em âmbar e assenta na cor da barra.
- **movimento** — 600ms para o rastro sumir; o número fica um turno. **Sob
  `prefers-reduced-motion` o rastro não anima — aparece e fica.** Nenhuma
  informação mora dentro do movimento: o movimento só diz *quando*.
- **onde vive** — Figma: `Barra de medida` (6 variantes). · Código: `BarraMini`,
  `ui.jsx:516` — **5 usos** contra 18 barras, 12 escritas à mão; o eixo *Mudou*
  é **[ainda não existe]**.
- **por quê** — a barra é o único órgão que reage ao golpe do inimigo e hoje só
  desliza em 700ms; dez das dezoito não têm transição nenhuma. E o `tv-agonia`
  fica **reprovado como está**: pulsa vermelho enquanto o herói estiver abaixo
  de um terço de vida — pode ser a cena inteira — e é uma das dez animações
  **sem** saída por `prefers-reduced-motion`.
- **o limite de frequência, e é o `quando` do `jogo`: a barra mostra o SALDO da
  resolução, não cada batida.** Numa rodada chegam vários golpes — três
  inimigos de pé são três golpes —, e `−3`, `−2`, `−4` a piscar um por cima do
  outro na mesma barra **não é informação, é tremor**. Um `−9` que assenta uma
  vez; o detalhe golpe a golpe fica no log, que é onde ele já está. *"Uma barra
  que pisca três vezes por rodada é a primeira coisa que o jogador aprende a
  ignorar."*
- **peso** — **médio**.

### ler o estado de uma coisa

- **quando** — *"a barra de status (`NIV · PV · PM · XP · data · lugar`), a
  ordem de iniciativa, os chips, os 73 selos"* — 73 lugares em 9 arquivos. E o
  achado do `jogo`: *"a barra de status não mostra as moedas. `◉ 240` só existe
  dentro do painel Bolsa"* — o número que decide toda compra, todo suborno e
  todo presente.
- **forma** — **Selo de estado**, com **dois eixos**: *Tom* (Neutro · Bom ·
  Aviso · Perigo) × ***Mudou*** (Não · Agora) — eixo novo de D4. **Ponto +
  palavra, sempre**: a cor nunca carrega o sentido sozinha (WCAG 1.4.1).
  *Mudou=Agora* é um **halo na própria cor do tom**, na gramática do `tvGlow`
  que a folha já tem.
- **movimento** — o halo pulsa **três vezes e para** (1,2s cada). Nada de
  `infinite`: das 13 classes de animação da casa, **5 são infinitas e só 3 têm
  saída**. Sob `prefers-reduced-motion` o halo não pulsa — e parado ele diz a
  mesma coisa.
- **onde vive** — Figma: `Selo de estado` (8 variantes). · Código: **[ainda não
  existe]** — são 73 `<span>` inline com quatro gramáticas de preenchimento.
- **por quê** — o `jogo` pediu um **tom** "mudou agora", e um tom era a resposta
  errada: o que mudou agora pode ser bom (o XP subiu), aviso (a tocha acaba) ou
  perigo (a fama caiu). Um quinto tom obrigaria a escolher entre dizer **o que
  é** e dizer **que acabou de mudar**. Por isso "agora" virou **eixo**, não cor.
  Com o Selo feito, o **cinturão do cabeçalho** (moedas, tocha, hora) é montagem
  do `jogo` e não custa desenho novo.
- **o corte do *Mudou=Agora*, e é regra para durar — do `jogo`.** A lei
  ambiciosa do `desenho` (*"todo valor de estado que muda entre um turno e o
  outro veste a marca"*) entrava em rota de colisão com a regra dele (*dois
  "mudou agora" na mesma tela é zero "mudou agora"*): um turno comum muda XP,
  moedas, hora e tocha — **quatro halos**, e a lei aplicada à letra apagava a
  peça. O corte:

  > **A marca é para o que aconteceu COM o jogador, não para o que ele fez.**

  Se ele gastou 20 moedas a comprar, **ele sabe** — não precisa de halo. Se
  levou 20 de multa, não sabe. **No máximo dois por turno**, com prioridade:
  (1) o que caiu e dói, (2) o que abriu porta nova, (3) o resto — que fica sem
  marca **e não perde nada, porque continua escrito**. E o lugar: **no número
  que mudou, no sítio onde o jogador vai olhar a seguir**, morrendo no turno
  seguinte.
- **peso** — **médio**.

### escolher um entre muitos

- **quando** — *"a criação de personagem é a primeira meia hora de quem chega, e
  nela o jogador aprende quatro línguas de escolher em quatro rolagens de
  tela."* ~40 lugares em **seis gramáticas**: cartão grande (`ui.jsx:389`, 11
  usos), **`<select>` do sistema operativo em 16 lugares**, stepper `−`/`+`
  (`App.jsx:3929/3932`, **24×24 px**), `+` da ficha (`painel-ficha.jsx:66`,
  **20×20**), três tamanhos de cartão na mesma tela de Uma Noite (164×93,
  334×78, 336×66) e pílulas em três cores.
- **forma** — **A escolha** (peça nova). *Forma* (Cartão · Pílula · Aba ·
  Contador · **Lista**) × *Estado* (Repouso · Escolhida · Impedida · Foco).
  Gramática única de **escolhido**: borda `amber` 1px **+ filete de 3px no lado
  de entrada** (à esquerda no cartão e na pílula, embaixo na aba) **+ o visto**.
  O *Contador* tem o piso de 44px — *"preciso de uma peça de escolha que saiba
  ser contador sem encolher para caber"*.
- **movimento** — 120ms na troca de borda; o filete cresce de 0 a 3px no mesmo
  tempo. Sob `prefers-reduced-motion`, aparece pronto.
- **onde vive** — Figma: página `A escolha`, conjunto `A escolha` (12 variantes:
  Cartão · Pílula · Aba × 4 estados). ***Contador* e *Lista* estão declarados e
  ainda não fabricados**, também no Figma — **[ainda não existe]**, e é melhor
  dizê-lo que deixar a contagem sugerir o contrário. · Código:
  `CartaoDeEscolha`, `ui.jsx:389` — **11 usos, todos na criação**. Pílula, aba,
  contador e lista: **[ainda não existe]**.
- **por quê** — medida: **`background: T.amber` tem 37 usos** em `src/**` e é a
  assinatura da ação principal. Usá-lo para dizer "selecionado" faz uma opção
  parecer a ação da tela — por isso **nunca preenchimento âmbar cheio para
  seleção**. O visto existe porque a cor não pode ser o único canal. E é a única
  família cujo defeito o jogador encontra **antes do primeiro turno**.
- **a ressalva do `jogo`, e eu aceito: o `<select>` NÃO sai todo.** D4 tinha
  escrito *"o `<select>` nativo sai"*; isso é verdade para lista curta e é
  **piora** para lista longa. *"O seletor nativo do sistema abre a roda do
  telefone e resolve 30 opções com um gesto; trinta pílulas desenhadas à mão
  viram um scroll dentro de um scroll"* — que é o defeito já medido no
  tabuleiro. Daí a variante ***Forma=Lista*** para conjunto longo, e **triagem
  dos 16 lugares por tamanho de lista, um a um** — nunca a mesma pílula para os
  dezasseis. *"Substituir os 16 pela mesma pílula é trocar quatro línguas por
  uma língua que gagueja nas listas grandes."*
- **peso** — **médio** fabricar; **pesado** trocar a criação de personagem.

### abrir e fechar um painel

- **quando** — 15 sobreposições, 11 controles de saída, 5 abas de 72×122 px, a
  bolsa de combate, a forja, `⤢ ampliar`, a ficha pela barra de status.
- **forma** — **Véu** (3 pesos) + **Fechar**. O **`✕` é da saída e de mais
  nada**. Três portas em toda sobreposição: **`Esc`, o fundo e o `✕`** — e o
  `✕` sempre no mesmo canto, com **44px de alvo em todas as 15**. O glifo
  continua pequeno; **o alvo é que cresce**.
- **movimento** — o véu entra com fade de 180ms (hoje `tv-fade` de 500ms — meio
  segundo é longo demais para o que abre dez vezes por sessão) e sai em 120ms.
  Sob `prefers-reduced-motion`: sem fade, sem deslocamento. **`tv-fade` não tem
  saída hoje.**
- **onde vive** — Figma: `Veu` e `Fechar`. · Código: **[ainda não existe]** nem
  um nem outro.
- **por quê** — medida, dos dois lados: 15 véus, **9 tintas de fundo**, 4
  desfoques + 4 sem desfoque, **4 regras de fecho**, **6 tamanhos de `✕`** (5
  com borda, 11 sem), e `Escape` não fecha nenhuma — há 6 `onKeyDown` em
  `src/**`, todos `Enter` ou espaço. O jogador descobre caso a caso se sai
  clicando fora, num `✕` de 10px ou num botão âmbar de 48px.
- **as exceções, nominais, e são do `jogo`.** O `desenho` deixou-lhe a exceção;
  aqui está ela por nome. **As únicas sobreposições sem saída pelo fundo — e
  todas dizem por escrito que não têm:**
  1. **o véu do dado com rolagem pendente** (`App.jsx:512`) — sair dali por
     acidente é abandonar um teste que o Mestre pediu;
  2. **o véu da morte** (`App.jsx:357`) — já não tem porta, e a ausência é
     desenho;
  3. **as três caixas de decisão do save** (`App.jsx:21265, :21295, :21323`) —
     substituir uma campanha por engano é a coisa mais cara que o jogo sabe
     fazer.
  **As outras doze: as três portas**, sem exceção.
- **peso** — **pesado** (Fase G1 — muda o que o jogador já aprendeu).

### navegar entre abas

- **quando** — o trilho lateral e inferior, o painel de gestão, a ascensão. As
  cinco abas medem **72×122 px** — *"a porta do inventário é 12 vezes o botão
  que faz o turno acontecer"*.
- **forma** — **A escolha**, *Forma=Aba*. O filete de 3px vai **embaixo**, e o
  contador (quando existe) é um **Selo** *Tom=Neutro*.
- **movimento** — 120ms; o filete **desliza** de uma aba para a outra em 180ms —
  uma coisa só a mover-se, não duas a trocar de cor. Sob
  `prefers-reduced-motion`: sem deslize.
- **onde vive** — Figma: `A escolha`, *Forma=Aba*. · Código: **[ainda não
  existe]** — `App.jsx:1211`, `painel-ascensao.jsx:118`, escritas à mão.
- **por quê** — a aba é uma escolha, não um botão. Hoje usa a gramática do botão
  nuns lugares e a da pílula noutros.
- **a linha de momento do `jogo`: o filete não espera o painel montar.** Se o
  painel demora, **a aba já está marcada** — senão o jogador clica duas vezes.
- **peso** — **pesado** (o trilho é o esqueleto da navegação).

### o controle que é só um glifo (os que não têm rótulo)

- **quando** — o cabeçalho, a barra do log, cada mensagem do Mestre, os
  painéis. *(medido por script: **15 controles sem uma única letra de rótulo —
  6 com `title`, 9 completamente mudos**. A varredura só pega os que cabem numa
  linha; à mão o `jogo` achou pelo menos mais 8 em linha composta. **O número
  honesto é ≥23.**)* **E o cabeçalho tem quatro botões, não cinco**
  (`App.jsx:20404, 20417, 20418, 20419`): a caneca, `⛺`, `🎲`, `📜`. O `⤢`
  vive no tabuleiro, o `↓` na barra do log (`App.jsx:21239`), o `🔊` em cada
  mensagem do Mestre (`App.jsx:20493`).
- **a distinção sem a qual esta forma se lê ao contrário, e é do `jogo`:**

  > **Mudo na tela ≠ mudo para quem não vê a tela.** *"Pode ficar mudo"* quer
  > dizer **sem razão escrita visível**. **O nome acessível é obrigatório nos
  > 15, sem exceção nenhuma** — e hoje esse nome é o `title`, que é o pior
  > lugar possível para ele estar.
- **forma** — `Botao` *Papel=Gesto*. **A variante só-glifo é exceção
  declarada**: só existe com **A Consequência** *fixação=Linha* presa, ou com o
  rótulo abaixo do glifo em telas largas. O glifo é **traçado** (`ui.jsx`),
  nunca emoji — emoji quebra no Windows e no telefone e não herda o token de
  cor. Piso de alvo: **44px**.
- **o verbo certo de cada um, o que hoje só vive num `title`, e — a coluna que
  faltava — se fica mudo na tela.** A decisão nominal é do `jogo`, porque o
  `desenho` cedeu neste ponto na divergência *"não pode agora"*: uma razão
  escrita em cada glifo do cabeçalho vira parede de texto, e parede de texto é
  outra forma de ruído.

  | glifo | o que o `title` diz | o que ele **faz** *(testado)* | o verbo certo | fica mudo na tela? |
  |---|---|---|---|---|
  | a caneca | `Início` | sai da partida para o menu | **sair para o menu** | **sim** — é a marca, no canto onde toda tela do mundo põe "voltar ao começo"; não custa nada (o jogo salva sozinho) e volta num clique. A posição carrega o sentido melhor que a palavra carregaria |
  | `↓` | `Ir para a última mensagem` | rola o log ao fim | **voltar ao fim** | **sim** — zero custo, reversível, glifo universal, e **só aparece depois de o jogador rolar para cima**: ele já sabe o que quer |
  | `✕` ×9 (os que fecham) | *(nada)* | fecha o painel | **fechar** | **sim** — é a porta, e **porta explicada rouba a cena de quem está dentro**. O que eles precisam é de **alvo de 44px**, não de palavra |
  | `−` / `+` do stepper | *(nada)* | tira/põe ponto de atributo | **tirar / pôr um ponto** | **sim** — o sentido do stepper é a posição em volta do número. **Mas o contador não fica mudo**: *"restam 2 pontos"* sempre visível ao lado |
  | `🔊` | `Ouvir o Mestre narrar…` | lê a mensagem em voz | **ouvir** | **sim** — preferência, reversível, e repete-se uma vez por mensagem. **Mudo pode; pequeno não**: é o menor alvo do jogo, **22×22 px no desktop E no telefone** |
  | `⛺` | `Montar acampamento` | acampa, **encerra a luta em curso** e a chave anda | **acampar (encerra a luta)** | **NÃO** — verbo escrito **e** *O gesto que custa* com o preço nomeado: *"acampar agora encerra a luta contra A Voz"* |
  | `📜` | `Gerar crônica` | **gasta uma chamada ao Mestre** | **escrever a crônica (custa uma chamada)** | **NÃO** — consome um recurso finito, e o fim dele apareceu duas vezes nesta fase. **Verbo e preço** |
  | `⚒` | `Desmontar → +N essência` | **destrói o item** para virar essência | **desmontar** | **NÃO** — o `title` escreve o ganho e cala a perda |
  | `▲` / `✕` da guilda | `Promover` / `Expulsar` | promove / **expulsa** | **promover** / **expulsar** | **NÃO, os dois** — lado a lado, do mesmo tamanho, sem uma letra, e só um apaga uma pessoa. **A armadilha está no par, não no glifo** |
  | `✕` ×4 (os que descartam) | *(nada)* | retirar cartaz, abandonar contrato, remover companheiro, descartar equipamento | **o verbo de cada um** | **NÃO** — e não é falta de rótulo: **é o glifo errado**. Saem do `✕` para o verbo |
  | `🎲` | `Rolagens de combate: visíveis/ocultas` | alterna as rolagens no log | **mostrar as rolagens** | **resolve-se mudando de lugar** — ver *ligar e desligar* |

  **Somando: o cabeçalho fica com um mudo (a caneca), dois falantes (`⛺`,
  `📜`) e um a menos (`🎲`).** É mais curto do que é hoje, e é o ponto.
- **movimento** — nenhum.
- **onde vive** — Figma: `Botao` + `Consequencia` + `Glifos` (11 ícones). ·
  Código: **[ainda não existe]** — `App.jsx:20404, 20417, 20418, 20419` são
  emoji cru dentro de `<span>`, com `title`.
- **por quê** — experiência jogada: o `⛺` **terminou uma luta do torneio** sem
  pergunta e sem dizer o que aconteceu ao adversário. E o número que fecha:
  *(medido na tela da campanha)* **dos 21 controles visíveis no desktop, 15 têm
  o lado menor abaixo de 44px**; no telefone, **14 de 25**. O piso é do
  `desenho` e é **44px** — Apple HIG 44pt, Material 48dp, WCAG 2.5.5.
- **e um que saiu desta lista:** o **`⤢ ampliar` não é mudo** — traz a palavra
  "ampliar" escrita ao lado do glifo (`grade-de-batalha.jsx:571`). O defeito
  dele não é falta de rótulo: **é o rótulo mentir**. Ver *O que D1 dizia e não
  era verdade*.
- **peso** — **leve** dar rótulo; **pesado** o que o `⛺` faz.

### saber de quem é a vez

- **quando** — todo turno de combate, no painel `ORDEM DE INICIATIVA`.
- **forma** — **Selo**, ***Tom=Bom***, *Mudou=Agora*, na **linha de quem está a
  agir** e **na barra de ação**, ao mesmo tempo. A marca vive onde se olha, não
  só onde se lê.
  **O tom mudou em D4, e a recusa é do `jogo`:** era *Aviso*, e *"'é a sua vez'
  não é um aviso — é a coisa boa da rodada, é o convite. Vestir o convite com a
  cor do problema ensina o jogador a ter um pequeno susto toda vez que chega a
  vez dele."* Ele recusou o tom e deixou ao `desenho` dizer qual é; **é *Bom***
  — o tom do que corre a favor de quem joga, o mesmo com que o jogo diz "você
  pode agir". *Aviso* fica para o que pede atenção sem ser perigo (a tocha a
  acabar). **E se um dia *Bom* e *Aviso* saírem da tabela com a mesma tinta,
  isso é defeito de `T` e é item** — o nome ensina antes da cor.
- **movimento** — os três pulsos do halo, e para.
- **onde vive** — Figma: `Selo de estado`. · Código: **[ainda não existe]** como
  peça; o painel marca `● AGINDO` à mão.
- **por quê** — medida do `jogo`: o inimigo ficou `● AGINDO` por mais de dez
  segundos **enquanto o jogo esperava pelo jogador**, e a linha do jogador não
  tinha marca nenhuma.
- **peso** — **médio** (a peça existe; o lugar é montagem do `jogo`).

### ligar e desligar

- **quando** — **junto do log que ele governa, e não no cabeçalho.** O
  interruptor das rolagens de combate sai de `App.jsx:20418` e vai para onde as
  rolagens moram: onde a palavra cabe e onde o efeito se vê no mesmo olhar.
- **forma** — **O interruptor** (peça nova). Corpo de **44px** de altura, trilho
  de 40×22, a cabeça de um lado ou do outro, **o rótulo do que liga** e **o
  estado escrito** (`a vista` / `ocultas`). Três canais: a palavra muda, o lado
  muda, a cor muda — e nenhum carrega o sentido sozinho.
- **movimento** — a cabeça atravessa em 150ms. Sob `prefers-reduced-motion`,
  troca de lado a seco.
- **onde vive** — Figma: página `O interruptor`, conjunto `O interruptor` (4
  variantes). · Código: **[ainda não existe]** — o alvo de hoje é um `p-1.5` em
  volta de um emoji de 13px, cerca de 25px.
- **por quê** — os dois lados mediram e os dois estavam enganados no mesmo
  sentido: o estado **existe** em duas cores (`App.jsx:20418`, borda `#2E2745` →
  `#E8A33D`, glifo `#9B93AC` → `#F5C878`) e **não existe em nenhuma palavra**.
  *"Um dado apagado pode significar 'desligado' tanto quanto 'indisponível', e
  nada na tela desempata."* O pedido não é *dê estado ao interruptor*: é **dê
  nome ao estado**.
- **a única forma reprovada de D4, e o que foi reprovado é o endereço — não a
  peça.** Três razões, todas de momento, todas do `jogo`:
  1. **Não é gameplay.** "Rolagens visíveis / ocultas" é preferência de leitura
     do log, e o cabeçalho é onde o jogador olha primeiro. A lei da casa é que
     só aparece na tela o que é jogo.
  2. **A peça não cabe ali.** Um trilho de 40×22 **mais** o rótulo do que liga
     **mais** o estado escrito, num cabeçalho de 375px que já carrega a marca, o
     nome da campanha, o selo de salvamento e mais três glifos. Ou o interruptor
     perde as palavras — e volta a ser o defeito que acabou de ser medido —, ou
     o cabeçalho estoura.
  3. **Nomear o mecanismo no cabeçalho é o sistema a falar de si mesmo.**
  **Cedeu o `desenho`, no lugar e não na peça.** No cabeçalho o `🎲` fica mudo
  **e continua defeituoso** — um dado apagado significa "desligado" tanto quanto
  "indisponível", e nada desempata; **não há saída boa nesse endereço**. *"Mudar
  de lugar resolve o que nenhuma quantidade de rótulo resolveria."*
- **peso** — **médio**.

### desfazer o que não volta

- **quando** — **14 ações irreversíveis, e onze não perguntam nada**: acampar
  (`App.jsx:20417`), remover do grupo (`:2534`), expulsar da casa
  (`painel-guilda:339`), nova campanha (`:4615`), sair da masmorra (`:20758`),
  abandonar contrato (`:1588`), retirar cartaz (`:1505`), recusar petição
  (`:1729`), descartar equipamento (`:2772`), desfazer importação (`:4707`),
  redistribuir (`painel-talentos:104, :409`), encarar a prova / abandonar o rito
  (`painel-ascensao:72, :75`), dar a missão por perdida (`painel-diario:107`).
- **forma** — **O gesto que custa**. *Etapa* (Armado · Perguntando) × *Estado*.
  **Armado não grita**: contorno, não preenchimento — um vermelho cheio o dia
  inteiro deixa de significar perigo na hora em que importa. O Confirmar repete
  **o verbo**, nunca "Sim". **O preço é campo obrigatório**, e o `quando` dele é
  do `jogo`: não *"tem a certeza?"*, mas *"acampar agora encerra a luta contra A
  Voz"*.
- **movimento** — a pergunta abre **no lugar**, 150ms, sem deslocar o que está
  em volta: o que empurra a página faz o dedo errar o alvo.
- **onde vive** — Figma: `Gesto que custa`. · Código: **[ainda não existe]** — o
  padrão "clica → caixinha vermelha → clica de novo" é remontado à mão três
  vezes, em três larguras.
- **por quê** — experiência jogada: o `⛺` mede 34×38 px, não tem uma letra de
  rótulo, e um clique fez `EM COMBATE` sumir, a chave andar de *A Voz* para *A
  Sombra*, **e nenhuma linha do log diz o que aconteceu com A Voz**. E medida:
  `App.jsx:2541` usa `#fff` sobre `T.danger` = **3,42:1, reprova AA**, no único
  botão que apaga um companheiro; `T.onAccent` sobre `danger` dá **5,34:1**. E
  `Nova campanha` tem o botão e o único aviso a **941 px** um do outro numa
  janela de 812 — **nunca podem estar na tela ao mesmo tempo**. O aviso vai para
  **dentro** da peça.
- **a metade que a peça NÃO resolve, e é do `jogo`: toda ação que a peça arma
  tem de escrever no log o que fez.** O `⛺` não falhou só em perguntar antes —
  **falhou em dizer depois**: um clique, a luta contra "A Voz" desapareceu, a
  chave andou para "A Sombra", e nenhuma linha do log diz o que aconteceu.
  *Ganhei, fugi, desisti?* A peça resolve o "antes"; **o "depois" é fiação, não
  forma**, e fica registado aqui para não se perder entre as duas mesas. *"Uma
  pergunta antes e um silêncio depois continuam a ser uma armadilha — só que
  educada."*
- **peso** — **leve** (o contraste); **médio** (a peça); **pesado** (pôr
  pergunta nas onze que hoje não perguntam — muda o fluxo).

### o que o jogo diz que vai acontecer

- **quando** — antes de todo clique que cobra alguma coisa. E é a forma pedida
  por nome em três lugares distintos do censo: o preço do Destino, o estado do
  `🎲`, o custo do passo.
- **forma** — **A Consequência**. 4 tons (Impedimento · Espera · Preço · Estado)
  × 2 fixações (Linha · Balão). **Nunca só-hover**: *Linha* vive sempre na
  árvore; *Balão* abre no dedo **e** no rato.
- **movimento** — o Balão abre em 120ms e não fecha sozinho antes de 4s —
  **exceto sobre o tabuleiro**. Ali **a Consequência é sempre *Linha***: quatro
  segundos de balão sobre o campo **tapam as casas para onde o jogador ia
  andar**, e é o único lugar onde a regra dos 4s trabalha contra o momento.
  Ressalva do `jogo`, aceite sem reserva.
- **onde vive** — Figma: `Consequencia`. · Código: **[ainda não existe]** — hoje
  o jogo tem **um** lugar para isto e é o `title`, **105 vezes**.
- **por quê** — é a lei *o veredito antes do clique* a ganhar onde morar. `title`
  é um canal de rato: 105 usos que **não existem no dedo**.
- **peso** — **médio**.

### o foco (transversal — não vem do censo, vem da varredura)

- **quando** — em toda peça, sempre. Esta forma **não foi pedida pelo `jogo`**:
  nasceu de contar `:focus-visible` em `src/**` e achar **zero**.
- **forma** — duas sombras de raio zero: 2px em `bg` abre o vão, 4px em `ink` é
  o anel — `box-shadow: 0 0 0 2px T.bg, 0 0 0 4px T.ink`. **Um anel só, em todos
  os tons** (`ink` sobre `bg` = **15,31:1**).
- **movimento** — **nenhum, nunca.** Foco que anima vira borrão para quem tabula
  depressa.
- **onde vive** — Figma: dentro de cada peça, como *Estado=Foco*. · Código:
  **[ainda não existe]** — `:focus-visible` tem 0 ocorrências e `outline-none`
  tem 17.
- **por quê** — WCAG 2.4.7 (foco visível) e 2.1.1 (teclado). Um jogo que só se
  joga com o dedo exclui quem navega por teclado — e o pior caso é o tabuleiro:
  **86 alvos focáveis por luta com o anel apagado de propósito**
  (`grade-de-batalha.jsx:519`).
- **peso** — **médio**.
- **armadilha do Figma, achada em D4:** `DROP_SHADOW` com spread **atravessa** um
  preenchimento transparente e enche o miolo da peça; o `box-shadow` do CSS não
  pinta por baixo da própria caixa. O anel no Figma é feito com **dois quadros
  encaixados** (56 com borda `ink` de 2px, 52 com borda `bg` de 2px), que dá
  exatamente o mesmo desenho.

### "não pode agora" (transversal)

- **quando** — `const bloqueado = carregando || !!rolagem` (`App.jsx:20384`)
  governa **15** `disabled` e mais **6** expressões de opacidade, com dois
  valores (0.4 ×3, 0.45 ×3). São **44 controles desativados, 31 mudos**, 13 com
  a razão só no `title`.
- **forma** — **dois estados, separados por quem tem de agir** (o eixo mudou em
  D4; em D3 era *volta / não volta*):
  - **Esperando** — *o sistema age.* Corpo em `panelSoft` com borda `line`, a
    tinta **cheia**, e a razão **em âmbar**: "o Mestre está a escrever".
  - **Impedido** — *você age.* **Sai o preenchimento**, fica a borda `line`, e a
    razão **em cinza diz o que fazer**: "escreva o que você faz", "role o dado".
  A razão **nasce acesa**: para ficar muda, alguém tem de a desligar de
  propósito.
- **movimento** — nenhum. O estado não pisca.
- **onde vive** — Figma: `Botao`, *Estado=Esperando* e *Estado=Impedido*
  (corrigidos em D4). · Código: `ui.jsx:27` — `opacity: 0.4`, que é o defeito.
- **por quê** — **a opacidade é o defeito, e tem número.** `inkDim` a 40% sobre
  `panel` dá **2,02:1**; a 45%, **2,25:1**; a 55%, 2,73:1; a 60%, **3,03:1**. O
  `Botao` inteiro a 40% deixa a chamada em **2,38:1**. E o *Impedido* da própria
  biblioteca de D3 dava **1,19:1**. Com a tinta cheia, `inkDim` sobre `bg` dá
  **6,62:1**. *A objeção honesta, e a resposta:* o WCAG isenta componentes
  **inativos** do piso de contraste (1.4.3 / 1.4.11) — mas **a razão não é um
  componente inativo**: é texto informativo, e não tem isenção nenhuma. Daí a
  regra da casa: **a razão nunca apaga.**
- **peso** — **médio**.

### a espera do Mestre

- **quando** — todo turno, entre o clique e a resposta.
- **forma** — a razão **em âmbar dentro do próprio botão que a causou**
  (`Botao` *Estado=Esperando* + `Consequencia` *tom=Espera*). Hoje ela vive numa
  linha separada do log (`App.jsx:20500`), longe do controle — e o botão, ao
  lado, apaga-se sem dizer nada.
- **movimento** — o d20 que gira fica, **e ganha saída**: hoje é `tv-dice`
  (`tvShake` + `tvGlow`, as duas `infinite`) e é uma das **10 sem
  `prefers-reduced-motion`**. Com menos movimento pedido, o glifo fica parado e
  a palavra continua: **a espera é dita por escrito, não por giro.**
- **onde vive** — Figma: `Botao` + `Consequencia`. · Código: **[ainda não
  existe]** ligado ao botão.
- **por quê** — estudo citado: 1 segundo é o limite do *fluxo de pensamento* e
  10 segundos o da atenção (NN/g, Nielsen 1993). A chamada do Mestre passa de 1s
  quase sempre — então a espera **tem** de ser dita onde o jogador acabou de
  clicar.
- **duas condições de momento, do `jogo`:**
  1. ***Esperando* é legível, mas não é clicável.** Se o campo continua editável
     e a chamada continua legível, **ela tem de continuar a recusar** — *"dois
     turnos mandados por engano é pior que um botão apagado"*.
  2. **Depois do limite de atenção, a razão muda de palavra.** A própria régua
     cobra isto: a chamada ao Mestre **passa dos 10s com frequência**, e uma
     palavra âmbar congelada por vinte segundos deixa de dizer "estou a
     escrever" e passa a dizer "travei". **O que nunca aparece é um número de
     segundos** — contagem regressiva no meio de uma narrativa é o sistema a
     falar de si mesmo.
- **peso** — **leve**.

### marcar o momento que merece um momento (a cerimônia)

- **quando** — é do `jogo`, e está fechado: ver *A escala de cerimônia*, nas
  Discordâncias. **Sobe ao realce o que muda o que o jogador PODE FAZER a partir
  de agora — e só na primeira vez.**
- **forma** — **O realce** (peça nova). A **mesma** entrada do log, marcada:
  filete `amber` a 55% acima e abaixo (**3,41:1**), a tinta em `amberSoft`
  (**12,40:1**) em vez de `violetSoft`, e um **Selo** *Mudou=Agora*. **Não
  interrompe, não custa clique, não tem porta — e é por isso que não é um véu.**
- **movimento** — os três pulsos do halo do Selo, e para. O bloco **não entra
  animado**: já nasce assim quando a linha chega ao log.
- **onde vive** — Figma: página `O realce`, conjunto `O realce` (2 variantes:
  *Nota* e *Realce*). · Código: a *Nota* existe (`App.jsx:2975`); o *Realce* é
  **[ainda não existe]**.
- **por quê** — a escala tem quatro degraus e **só os dois de cima são véu**.
  Sem o degrau 2, "isto foi importante" só tem véu disponível — e a taverna
  passa a interromper o jogador para lhe dar os parabéns. Medida: a conclusão da
  primeira missão da campanha é hoje a **quarta de seis pílulas cinzentas
  iguais**, no mesmo tipo, tamanho e cor de *"🗺 um lugar surgiu no mapa"*.
- **peso** — **médio** a peça; **pesado** a lista de momentos (é do `jogo`).

### gastar um recurso

- **quando** — *"`🩹 Gastar 1` (`App.jsx:20820`), as poções à mão (`:3123`), a
  bolsa em combate (`:3142`), `📜 Declarar · 2 pontos`
  (`painel-heroismo:94`), o milagre, a habilidade que come PM."* É a família que
  o §2 do `desenho` não cobria: **entra pelo censo do `jogo`.**
- **forma** — `Botao` *Papel=Gesto* + **A Consequência** *tom=Preço*,
  fixação Linha, **como fenda da peça** — não um `<span>` escrito à mão em cada
  sítio.
- **movimento** — nenhum.
- **onde vive** — Figma: `Botao` + `Consequencia`. · Código: os botões existem
  (crus); a fenda do preço é **[ainda não existe]**.
- **por quê** — *"é o único lugar onde o jogo já faz a coisa certa por hábito —
  as poções dizem `· não gasta o turno` ao lado, em texto."* Aqui a forma **não
  corrige, consolida**: tira do acaso o que hoje depende de quem montou a tela
  ter lembrado.
- **peso** — **leve**.

### acabar uma partida, e saber que foi você

- **quando** — o resultado do Duelo (`App.jsx:4504-4505`: `REVANCHE` 606×52 ·
  `MENU` 62×52) e o da Noite (`:4524-4526`), e o véu da morte (`:357`), sem
  porta. Família do censo que o §2 do `desenho` não cobria.
- **forma** — `Botao` *Papel=Chamada* (uma por tela) para `REVANCHE` / `OUTRA
  NOITE`; *Papel=Recuo* para `MENU`, **à esquerda**. E **Selo** *Tom=Bom,
  Mudou=Agora* **no campeão do jogador** — no topo e em cada uma das três
  quedas. **Posse lê-se, não se deduz.**
- **movimento** — nenhum além do Selo.
- **onde vive** — Figma: `Botao` + `Selo de estado`. · Código: os botões
  existem; a marca de posse é **[ainda não existe]**.
- **por quê** — medida do `jogo`, no ecrã inteiro: *"52 linhas de texto… e zero
  delas dizem 'você'. Eu escolhi A Muralha e ela venceu, e nada na tela marca
  qual dos dois campeões era meu."* **E fica registrado que `REVANCHE` não faz
  revanche** — devolve ao ecrã de montagem. Isso é regra, é do `backend`, e a
  forma só fica certa quando o rótulo disser o que o botão faz.
- **peso** — **leve** (o Selo).

### abrir ou entrar numa sala ao vivo

- **quando** — `Criar uma sala`, `Entrar com código`, `ABRIR O CANAL`, copiar o
  código, `Sair da sala` — este **mudo, só `title`**. **Família declarada NÃO
  MEDIDA:** a sala precisa de duas abas e do Mestre vivo, e o Mestre está sem
  quota.
- **forma** — `Botao` *Papel=Chamada* para abrir e entrar; o **código da sala** é
  **A linha** *Estado=Vazio* com marcador d'água; copiar é `Botao` *Papel=Gesto*
  com **A Consequência** *tom=Estado* a dizer "copiado" **na árvore** — nunca um
  aviso que some sozinho; `Sair da sala` é **O gesto que custa**, com o verbo
  escrito, porque sair derruba a sessão de quem ficou.
- **movimento** — nenhum.
- **onde vive** — Figma: peças existentes, nenhuma nova. · Código: os botões
  existem; a forma é **[ainda não existe]**.
- **por quê** — a única saída irreversível **compartilhada** do jogo é hoje um
  botão mudo. **E esta forma está decidida sem ter sido vista viva** — está aqui
  com a ressalva, não sem ela. Ver *O que ficou*.
- **peso** — **médio**, e **confirmar antes de construir**.

### guardar e trazer o jogo

- **quando** — `Guardar em arquivo`, `Trazer de arquivo`, `desfazer importação`
  (`App.jsx:4707`), `Recarregar`, e `Nova campanha` (`:4615`), que **substitui o
  save**. Família do censo.
- **forma** — **O gesto que custa** em tudo que substitui ou apaga save, com o
  preço **dentro da peça**. `Guardar`/`Trazer` são `Botao` *Papel=Gesto*.
- **movimento** — nenhum.
- **onde vive** — Figma: `Gesto que custa`. · Código: **[ainda não existe]**.
- **por quê** — medida: o botão e o aviso a **941 px** de distância numa janela
  de 812. Um aviso que não pode partilhar a tela com o botão não é um aviso.
- **peso** — **médio**.

---

### As seis ações sem controle

O sistema decide, gasta o recurso do jogador, e o jogador lê o resultado. **Uma
ação sem controle tem forma declarada mesmo assim** — a forma diz o que deveria
existir, e é isso que a torna cobrável. As seis estão marcadas **`[ainda não
existe]`** em *onde vive* por definição: nenhuma tem controle nenhum.

**O `jogo` julgou uma a uma se a forma declarada já as faz existir.** Duas
bastam e não pedem nada (*o golpe livre*, que é a sexta reação da mesma janela,
e *mirar com um inimigo só*). Três não bastam **e não pedem peça nova, pedem
fiação** (*a ação extra*, *não agir*, *recusar o teste*). **Uma só pede peça, e
é a maior: a reação** — e a peça dela fica, de propósito, por fabricar.

### reagir ao golpe que chega

*(Reescrita em **K1**, 15/09. A entrada de D4 descrevia uma peça por fabricar e
uma decisão por tomar; hoje a peça existe e a decisão foi tomada. O que ficou de
D4 e continua verdade está mantido palavra por palavra.)*

> **EMENDA DE K1b (15/09) — leia isto antes do resto da entrada.** Duas decisões
> da pessoa e uma medida do ofício mudaram três números desta entrada. **O texto
> de K1 fica**, porque a intenção tem de sobreviver à mudança; onde ele já não é
> verdade, está marcado `[K1b]` no sítio.
>
> **1 · O dano fica em segredo, e é decisão da pessoa.** Ela recusou *"o dano
> aparece antes de doer"*: *"acho que ficaria melhor o dano vir surpresa e
> aumentar o relógio — daria mais emoção e realmente se compararia a uma
> reação."* **A reação é instinto, não cálculo.** O número medido que sustentava
> a proposta continua verdadeiro — o sistema **tem** `a.r.dano` na mão antes de
> doer — e **deixa de ser usado, de propósito**. Não se reintroduz por outra
> porta: **doze portas visuais e quinze portas de sistema estão fechadas por
> escrito** em `mente/k1b-desenho.md` e `mente/k1b-jogo.md`, e **três delas são
> asserção** em `testes/teste-ritmo-da-reacao.mjs`. A mais subtil, e a que quase
> passou: **a duração da janela** — um golpe grande com menos tempo faria o
> relógio *ser* o dano. E a que estava aberta sem ninguém ver: **o conteúdo da
> lista** — os `minDano` diferem por reação, logo uma oferta filtrada por dano
> mudaria de tamanho com a faixa do golpe. A regra que a fecha: **o limiar decide
> SE a janela abre, nunca O QUE ela oferece** — e paga duas vezes, porque a lista
> passa a ser a mesma em toda a luta.
>
> **2 · A janela é de 15 000 ms** (*"pra que fique tranquilo até pra pessoas com
> dificuldade"*), não de 4 000. `[K1b]`
>
> **3 · E a barra NÃO corre 15 s — corre 4.** É a resposta de ofício ao problema
> que os 15 s criam: **quinze segundos de barra a descer não leem como folga,
> leem como pressão prolongada**, que é o oposto exato do que ela pediu.
> **K1 tinha o número certo no papel errado:** os 4 s que ele mediu e provou
> (1,5 s de reconhecer + 0,513 s de Fitts, dobrados = 4,03 s) não são *a janela*
> — são *o prazo*. Então: **onze segundos sem relógio nenhum**, depois o trilho
> pelos 4 s medidos, depois o último segundo em `danger`. Quando a barra
> finalmente aparece, o jogador tem ainda **o orçamento inteiro de K1** para
> reagir, e a maioria das janelas resolve-se **sem relógio nenhum**.
> *Estudo citado:* movimento periférico captura atenção involuntariamente
> (Yantis & Jonides 1984; Franconeri & Simons 2003) — 15 s de barra são 15 s de
> imposto sobre a prosa **e** menos eficazes ao segundo 14, por habituação. Uma
> barra de 15 s é mais cara *e* pior no seu único trabalho.
> **Peça nova: nenhuma.** `Tempo=Parado` já era a janela sem relógio, construída
> em K1 para outra coisa.
>
> ```js
> /* src/ritmo-da-reacao.js — o relógio que se vê.
>    INVARIANTES, e a suíte confere os três em toda linha com janela > 0:
>      folga + trilho === janela  ·  trilho <= 9000  ·  aperto < trilho
>    O teto do trilho é o que garante que a contagem regressiva do
>    `prefers-reduced-motion` NUNCA tem dois dígitos: 4,3,2,1 — e não 15
>    numerais, que é um temporizador de bomba. */
> { id: "normal", janela: 15000, folga: 11000, trilho: 4000, aperto: 1000, bonusContagem: 1000, bonusToque: 600 }
> { id: "parado", janela:     0, folga:     0, trilho:    0, aperto:    0, bonusContagem:    0, bonusToque:   0 }
> ```
>
> **Os bónus somam-se ao TRILHO, não à janela**, e isso é medida: `+1 000` sobre
> `4 000` são os mesmos **+25 %** que K1 mediu para a contagem; sobre `15 000`
> seriam **+6,7 %**, que é não pagar.
>
> **4 · `folgado` morreu, e o motivo fica.** `[K1b]` K1 propôs `folgado: 8000`
> quando `normal` eram 4 000. Com `normal` a 15 000, um `folgado` mais curto é
> castigo e um mais longo **não tem estrada que o alcance** — e regra sem leitor
> é export morto no dia em que nasce. A hipótese *"ele é só lento"* desapareceu:
> **15 000 / 4 030 = 3,72×** o tempo medido. **A escada do silêncio perdeu o
> degrau do meio** e passou a duas linhas. Quem quer o jogo à sua espera tem
> `parado` (*sem pressa*, na ficha) — que continua a ser a conformidade
> **WCAG 2.2.1** da fase inteira.

- **quando** — *"`reacoes.js` tem seis reações com gatilho, custo em PM e
  resolução — Contramágica, Escudo Arcano, Aparar, Esquiva Ágil, Contra-ataque e
  Ataque de Oportunidade. O golpe chega, `escolherReacao` (`reacoes.js:85`)
  escolhe a primeira da lista que se aplica, `resolverReacao` rola, e o PM sai da
  ficha do jogador (`App.jsx:7572`, débito em `:7577`). **O jogador nunca
  toca.**"* A janela é esse mesmo instante — `a.r.dano` já existe e ainda não
  virou PV.

- **forma** — **A pergunta que expira** (`31:518`, **8 variantes**), ancorada na
  linha do veredito. **Três degraus, e quem escolhe um é a contagem das reações
  que se aplicam ao gatilho** — porque `reacoesDe` filtra por perfil de combate:

  | reações aplicáveis | o que aparece | toques p/ reagir | toques p/ não reagir |
  |---|---|---|---|
  | **1** (o caso comum) | **`Etapa=Direta`** — o verbo com o preço + o recuo | **1** | **1** |
  | **2 ou mais** | `Chamando` (o chamado) → `Escolhendo` (o leque) | 2 | **1** |
  | **0** | nada abre | — | — |

  **O caso comum é o de uma reação, e isso é contagem, não impressão:** as
  **doze** classes do jogo repartem-se por quatro perfis, e **os quatro têm
  exactamente uma** reação de `sofre_dano` — marcial e misto *Aparar*, furtivo
  *Esquiva Ágil*, conjurador *Escudo Arcano*. A segunda só existe com
  **Contramágica escrita na ficha**, e `contramagia` tem `exigeTipo: []`, logo
  nunca entra por classe. **12 em 12.** Desenhar o comum como se fosse o raro
  custava um toque em cada rodada a todo o jogador, para revelar uma lista de um
  item.

  **O recuo está nos dois degraus, e é o conserto do defeito que a fase existe
  para corrigir.** *Não reagir* é sempre **um** toque. Hoje **ignorar a janela
  gasta PM** — quem quer poupar PM é o mais castigado por ela —, e sem o recuo no
  primeiro degrau poupar PM custaria dois toques sob relógio.

  **A reação padrão não é uma preferência, é um botão cheio.** O primeiro verbo
  vem **armado** (`O verbo com preço` *Papel=Armado*) e é exactamente a escolha
  que `escolherReacao` faria hoje. Tocar, ou `Enter`, = *aceito o que o sistema
  faria*. Nada para configurar, nada para lembrar.

  **O preço vem na linha do verbo, sempre, e sai de `reacoes.js:22-69`** —
  `aparar · 0 PM — corta metade`. **A `chance` não é percentagem: é a forma da
  frase**, de `PALAVRAS_DA_CHANCE` (abaixo). O `3 em 5` vive **na ficha**, que se
  lê devagar, nunca na janela, que se lê em quatro segundos: *a janela é
  gameplay, a ficha é consulta*.

- **o relógio, e corre uma vez só** — **a chamada dura 4 000 ms; o leque não
  expira.** Os 4 s não saem do limite de 1 s da NN/g (esse é de *resposta do
  sistema*; aqui quem responde é a pessoa, e o limite aplicável é o dos ~10 s da
  atenção). Saem de uma soma: **reconhecer** um elemento que nasceu na periferia
  enquanto se lê prosa (~1,5 s) + **o gesto** (~0,5 s por Fitts, com o `W`
  honesto, que é a **altura** do chamado — 56 px —, porque o gesto é vertical) =
  2,01 s, **dobrado**, porque o caso que importa é o de quem **não** estava a
  olhar. A conta é pouco sensível à peça: para o total chegar a 5 s só por `W`,
  `W` teria de cair para ~7 px. **Quem manda nos 4 s é o 1,5 s de reconhecer**, e
  esse só K4 corrige. *(E o relógio só corre com a aba visível: mudar de separador
  não custa janelas.)*
  **Porque o leque não expira:** quem tocou **já respondeu**, e o que expira é a
  chamada **por responder** — que é literalmente o que a pessoa ditou. Um segundo
  relógio por cima do preço escrito tornaria o preço decorativo e obrigaria a
  **decorar o menu** para jogar bem, que é o sistema a falar de si mesmo pela
  porta dos fundos. *O relógio compra a tensão; o leque paga com a decisão.*
  Por isso **o leque não tem trilho**: uma barra parada mentiria sobre a forma, e
  **o desaparecimento do trilho é o sinal de que o relógio parou** — sem custar
  elemento nenhum.

- **quem lê devagar — generoso *e* configurável, e a generosidade vem primeiro**
  — ~~se uma janela expira, **a seguinte corre folgada (8 s), em silêncio**~~
  `[K1b: o degrau do meio morreu — com a janela a 15 s, 8 s seria castigo e nada
  o alcançava. A escada tem duas linhas: 1 → nada, 2 → silêncio pelo resto DESTA
  luta.]* Sem aviso e sem menu; o contador zera à primeira resposta. **Ninguém
  tem de procurar uma definição para deixar de ser castigado por ser lento.** É a
  `ESCADA_DO_SILENCIO`, e **não é um controlo, porque ninguém lhe toca.**

- **o que a rodada cobra — e é o item inteiro de K1b** — o relógio dispara **por
  golpe recebido**, e numa rodada com quatro inimigos 15 s viram **até um minuto
  de espera**. **A folga é para quem precisa dela, não um pedágio para todos.**
  A saída é **uma janela por RODADA**, e ela não é remendo: `turnoDosInimigos`
  (`combate.js:242`) já devolve a rodada inteira **numa lista só** antes de
  qualquer golpe ser mostrado, e `reacaoUsadaRef` (`App.jsx:7657`) já é um
  recurso **por rodada**. *Agrupar é a forma em que os dados já chegam.*

  | | antes | depois | |
  |---|---|---|---|
  | quatro inimigos comuns (4 golpes) | 60 000 ms | **15 000** | **−75,0 %** |
  | quatro lendários nível ≥12 (12 golpes) | 180 000 | **15 000** | **−91,7 %** |
  | luta de 5 rodadas, quem ignora tudo | 300 000 | **33 200** | **−88,9 %** |

  **Dois tetos, e o segundo é que é o teto de verdade:** um teto por rodada
  multiplicado por rodadas sem limite não é teto nenhum. `msPorRodada` =
  **16 600** (15 000 + 1 000 de contagem + 600 de toque); `msEntreRespostas` =
  **33 200** (duas janelas até a escada calar a luta). **`parado` conta zero** —
  quem escolheu que o jogo o espere não está a ser feito esperar.

  **A janela só corre quando há de facto reação possível**, e as razões de não
  abrir são **tabela nomeada** (`PORTAS_DA_JANELA`), não `if` espalhado: em
  precedência — `preferencia` · `silencio` · `reacao_gasta` · `ja_respondeu` ·
  `sem_reacao` · `sem_pm` · `so_magia` · `arranhao`. Quem já respondeu não é
  perguntado de novo na mesma rodada; os outros golpes ficam **cobertos**, não
  enfileirados.

  **`so_magia` é a oitava e hoje é inalcançável — e isso está escrito, não
  escondido.** A mão que construiu foi verificar em vez de fingir o caso:
  `reacoesDe` dá **sempre** ao herói a reação de `sofre_dano` do seu perfil
  (`perfilCombate` devolve `marcial` até para classe desconhecida), e essas
  custam 0, 0 e 2 PM — menos que os 3 PM da Contramágica, a única com `soMagia`.
  Quem paga a Contramágica paga também a sua, e a sua não morde só magia: a
  lista **nunca** fica "só magia". A suíte **assere que a porta não aparece**,
  com o porquê acima da asserção — *o dia em que nascer uma reação mágica barata,
  a linha fica vermelha e quem a vir escreve o caso real.* **Uma porta sem caso é
  dívida; sem caso e sem aviso é armadilha.**

  *Onde vive:* `src/ritmo-da-reacao.js` (puro, sem React, sem `Math.random`) e
  `testes/teste-ritmo-da-reacao.mjs` — **85 asserções**, incluindo as **três que
  provam que o dano não vaza** e a **paridade com `escolherReacao`** em 164 casos.

- **movimento** — a janela **não pisca e não empurra**. O trilho desce
  **linear** (*uma curva de aceleração numa barra de tempo mente sobre o tempo*),
  **é a aresta de baixo do próprio botão** — o botão esvazia-se de si mesmo, em
  vez de o olho ter de encontrar um segundo objecto no segundo em que decide — e
  **mede sempre a largura da janela, nunca o comprimento do verbo**: senão
  `APARAR` e `ESCUDO ARCANO` dariam dois relógios diferentes para o mesmo tempo.
  **E o cheio é uma proporção, nunca um número de píxeis** — a regra custou a
  descoberta: o cheio era de **213 px fixos**, logo o *mesmo estado nominal* dava
  **62 % a 344, 60,7 % a 351** e outra coisa qualquer numa fenda estreita. *Um
  relógio medido em píxeis não é um relógio, é um desenho de um relógio.* Para K3:
  **o trilho `width: 100%` da janela, o cheio `width: N%` do trilho.** Provado a
  296 · 344 · 351 · 420 px, com verbo curto e verbo longo: **62 % nos oito casos.**
  Ao primeiro toque o trilho **desaparece**. Sob `prefers-reduced-motion` nasce já
  como `Tempo=Contagem` (*a saída pousa no estado final*), e **a janela dura mais
  1 000 ms**: *uma barra lê-se de canto de olho, um numeral exige fixar* — mesmo
  tempo seria menos tempo. Do dado herda-se o **sentido** (`IconeD20` = *o acaso
  decide agora*) e **recusa-se o movimento**: `.tv-dice` é duas animações
  `infinite` que D5 mediu como *"deixa a pisca e tira o sentido"* sob
  `animation: none`. **Aqui o glifo está parado e quem se move é o tempo**, uma
  vez só, até ao fim.

- **o gatilho — dois abrem, um não.** `sofre_dano` abre (o momento ditado).
  `inimigo_erra` abre (*revidar · 0 PM — na mesma batida, ou não*). **`inimigo_cai`
  não abre:** é ganhar, não defender-se — 0 PM, sem lado mau, e *uma pergunta cuja
  resposta é sempre sim não é pergunta, é um diálogo de confirmação com relógio*;
  e o instante em que um inimigo tomba é o pior sítio do combate para pôr um menu.
  A forma que `formas.md` já lhe deu — *ser visto* — continua certa.

- **a trava K2, desenhada** — **a janela abre exactamente quando
  `escolherReacao` devolveria não-nulo hoje**, nem um instante a mais: em
  particular **não abre em arranhão** (`reacoes.js:93-94`), porque deixar reagir a
  um arranhão seria mecânica nova e triplicaria a contagem de janelas por luta.
  Como o **conjunto de momentos é idêntico**, a catraca fica trivial de escrever:
  *mesma semente, ninguém responde, mesmo resultado de hoje.*
  **E o cartão não desaparece: resolve-se no sítio** (`Etapa=Resolvida`) — o verbo
  é substituído pela linha que o sistema produziu, que fica ~1,2 s e sai a 140 ms.
  Três coisas de graça: a resposta chega **onde a pergunta foi feita** (hoje chega
  num log de que ele pode ter rolado para longe); **o contrato ensina-se sozinho**,
  uma vez por expiração — *ignorei, aconteceu algo, e correu bem*; e **o PM aparece
  onde a escolha foi oferecida**. Depois a linha fica no log, e **o log fica byte a
  byte o de hoje** — só o cartão carrega o preâmbulo dos quatro segundos. Das
  quatro saídas **só uma frase é nova, `recusou`, e é nova porque hoje não pode
  acontecer.**
  **E a regra do glifo na resolução: o glifo aparece quando houve gesto.**
  `respondeu` e `expirou` diferem em **quem** agiu, não em **se** agiu — nos dois
  casos uma reação aconteceu, o glifo dela é verdadeiro nos dois, e o que os separa
  são as palavras (*"você aparou o golpe"* contra *"o instinto aparou por você"*).
  **`recusou` é a única sem gesto e a única sem glifo** — e não se inventou um
  glifo neutro porque **a regra já existia**: `Papel=Recuo` não tem glifo, porque
  nenhum glifo desta casa diz *deixar passar* sem mentir. *A resolução de um recuo
  herda a regra do recuo*, e um sinal novo para "nada aconteceu" seria o mecanismo
  a falar de si mesmo. *(Mecanicamente: o glifo vive numa **coluna fixa de 22 px**,
  porque esconder um filho de auto-layout colapsa o espaço e **arrasta as
  palavras** — com glifo e sem, o texto começa no mesmo x.)*

- **onde vive** — Figma: **`A pergunta que expira`** (`31:518`, 8 variantes,
  *Etapa* Direta·Chamando·Escolhendo·Resolvida × *Tempo* Barra·Contagem·Parado,
  **não preenchida de propósito** — as células vazias são a regra do trilho
  desenhada), **`O chamado`** (`62:2453`) e **`O verbo com preço`** (`64:2446`);
  o momento composto em `A batalha` → `o momento da reação · 1` a `· 9`, a ficha,
  e o quadro de decisões `63:2119`. · Código: **[ainda não existe]** — é K3.

- **por quê** — estudo citado, e a origem é esta casa: o cabeçalho de
  `src/reacoes.js` escreve *"No 5e e no BG3 metade da tensão do combate mora
  aqui: o golpe vem, e você tem uma janela para aparar…"* — e a linha seguinte
  do mesmo comentário entrega a escolha ao sistema. **O módulo diagnostica o
  problema e depois causa-o.** E experiência jogada: numa luta inteira o `jogo`
  tocou **três** controles — duas casas e o `⛺` que a encerrou por engano —,
  com seis reações disponíveis e nada onde tocar.

- **peso** — **médio** a peça e o momento; a janela era `pesado` e **a pessoa
  aprovou-a em 15/09**, devolvendo a forma à mesa: *"decida como designer UX e
  designer de games experientes"*.

### dizer de antemão como o herói se defende (a preferência, K1)

- **quando** — na ficha, fora do combate. É onde a pessoa pediu *"escolher também
  uma reação padrão ou não reagir, caso não queira gastar PM"*.
- **forma** — **uma fila só, de `A escolha` *Forma=Pílula*** (47 px), e **nenhuma
  peça nova**. *"Reação padrão"* e *"nunca me pergunte"* pareciam duas coisas — um
  interruptor mais uma lista. **São uma só: escolher um verbo É dizer "nunca me
  pergunte"**, e *"eu decido"* é apenas a opção que vem marcada.

  > **Quando um golpe chega** · `[✓ EU DECIDO]` · `[EU DECIDO, SEM PRESSA]` ·
  > `[APARAR SEMPRE]` · `[DEIXAR PASSAR]`

  Cada uma acende uma estrada de `RITMOS_DA_REACAO`, e **nenhuma linha fica sem
  leitor**: `eu decido` → `normal`; `eu decido, sem pressa` → **`parado`** (a
  janela abre e **espera**); `aparar sempre` → `normal` com o verbo travado;
  `deixar passar` → `normal` com o recuo travado. A terceira pílula traz **o verbo
  do herói**, nunca uma lista. `folgado` fica de fora de propósito: é o que a
  escada dá a quem **não pediu**.
- **onde vive** — Figma: a fila na ficha, com instâncias de `A escolha` (`20:77`).
  · Código: **[ainda não existe]** — é K3.
- **por quê** — **é a conformidade, não um mimo.** A **WCAG 2.2.1 (*Timing
  Adjustable*, nível A)** exige que um limite de tempo se possa ajustar, estender
  ou desligar. Uma janela de reação não se alonga sem deixar de ser o que é —
  mas **escolher um verbo fixo desliga o limite de tempo** sem tocar na mecânica de
  quem não o desligou, e *sem pressa* **estende-o sem fim**. Cumprida duas vezes.
  E mora **na ficha** porque ali o jogador lê *"como o meu herói se defende"*, que
  é ficção — e não *"configurar reações"*, que é mecanismo.
- **peso** — **médio**.

### as palavras do risco (`PALAVRAS_DA_CHANCE`, K1)

Três das seis reações têm `chance` (0,4 a 0,6), e oferecer *"corta tudo"* calando
que falha 2 em 5 seria **mentir o preço**. A percentagem não entra: *um duelista
não sabe "60 %", sabe que costuma dar.* A tabela é lida de `reacoes.js`:

| `chance` | na janela (≤40 car.) | na ficha |
|---|---|---|
| ≥ 0,70 | `quase sempre` | `quase sempre dá certo` |
| 0,50 – 0,69 | `mais vezes que não` | `dá certo mais vezes que não` |
| 0,30 – 0,49 | `de vez em quando` | `dá certo de vez em quando` |
| < 0,30 | `raramente` | `raramente dá certo` |

**A direcção da frase é sempre a mesma** — o que acontece quando **dá certo**.
Misturar *"costuma dar certo"* com *"às vezes falha"* na mesma lista é
enquadramento invertido, e enquadramento invertido **muda a decisão sem mudar o
facto** (Tversky & Kahneman, *Science*, 1981). *(A segunda coluna existe porque
o orçamento da fenda do preço é de 40 caracteres: mudou-se o lugar, nunca o
facto.)*

### dar o golpe livre (o ataque de oportunidade)

- **quando** — *"quando um inimigo dá as costas, o golpe livre do herói rola
  sozinho (`App.jsx:13542`). É o único ataque do jogo que acontece fora do
  turno, e ele passa como uma linha de log."*
- **forma** — enquanto for automático por regra, a forma é **ser visto**: **O
  realce** na linha do log (degrau 2) e a **Barra de medida** *Mudou=Golpe* no
  alvo. **E o `jogo` fechou-a por tabela:** o golpe livre **é a sexta reação de
  `reacoes.js`** (`oportunidade`, gatilho `inimigo_cai`), logo **a mesma janela
  cobre as duas** — **nenhuma peça nova nasce por causa desta**.
- **movimento** — os três pulsos do Selo, e para.
- **onde vive** — Figma: `O realce` + `Barra de medida`. · Código: **[ainda não
  existe]**.
- **por quê** — um ataque do herói que acontece fora do turno e sai com a mesma
  cara de qualquer linha de log ensina que nada do que o herói faz é notável.
- **peso** — **leve** (o realce); **pesado** se virar escolha.

### gastar a ação extra

- **quando** — *"o `✦ extra` é um chip aceso na barra do combate — um recurso de
  verdade, contado pela economia — e não tem um único controle. Só se gasta
  escrevendo prosa e torcendo para o Mestre entender."*
- **forma** — o chip deixa de ser **Selo** e passa a **A escolha**
  *Forma=Pílula*, *Estado* (Repouso · Escolhida · Impedida), com **A
  Consequência** *tom=Preço* presa. Sem nada para gastar, *Impedida* **com a
  razão escrita**.
- **movimento** — 120ms na borda, como toda *A escolha*.
- **onde vive** — Figma: `A escolha` + `Consequencia`. · Código: **[ainda não
  existe]** — hoje é um `<span>` aceso.
- **por quê** — hoje o chip tem **a forma de "ler o estado" e a função de
  "gastar um recurso"**: a forma mente sobre a função. A lei da casa é *uma
  ação, uma forma* — e a recíproca, que ninguém tinha escrito: **uma forma, uma
  ação.**
- **e o `jogo` fechou o que faltava, que não era peça: era o `quando`.** *Depois
  de agir, se o recurso continuar aceso, o jogo oferece o que ele ainda pode
  fazer.* As duas peças já existem (*A escolha* e a chamada); **o que falta é
  fiação, não demanda de desenho**, e fica registado como tal.
- **peso** — **médio**.

### não agir (esperar, segurar a ação)

- **quando** — *"o botão encerrar turno saiu de propósito (`App.jsx:3079`:
  'Agir É encerrar'). Consequência: quem quer esperar, segurar a ação ou
  simplesmente não fazer nada tem de escrever uma frase — e gastar uma chamada
  ao Mestre para dizer que não faz nada."*
- **forma** — `Botao` *Papel=Recuo* **dentro da peça A linha**, à esquerda da
  chamada — a mesma posição que o Recuo tem em toda a casa. O rótulo é o verbo:
  **`esperar`**. **A Consequência** *tom=Preço* diz o que se ganha ("mantém a
  ação para a reação"). **Não é um cancelar: é uma jogada**, e por isso não usa
  a palavra do cancelar.
- **movimento** — nenhum.
- **onde vive** — Figma: `Botao` dentro de `A linha`. · Código: **[ainda não
  existe]**.
- **por quê** — medida: uma chamada ao Mestre para dizer que não se faz nada
  custa o mesmo que uma chamada que faz — e o teto de chamadas é o que tirou o
  Narrador do ar em D1 e outra vez em D4. Se *"Agir É encerrar"* continuar a ser
  a regra, isto é do `backend`; a forma fica escrita à espera. **O `jogo`
  chama-lhe a mais barata das seis** — não custa uma peça nova: é o Recuo **ao
  lado da chamada, em combate**.
- **peso** — **médio** a forma; **pesado** se mexer na regra.

### recusar o teste de dado

- **quando** — *"com `rolagem` pendente, `bloqueado` apaga 15 controles e o
  único caminho para a frente é `Rolar d20`. Não existe 'eu não tento', nem 'eu
  desisto do teste'."*
- **forma** — `Botao` *Papel=Recuo* ao lado do `Rolar d20`, dentro do véu do
  dado, com **O gesto que custa** se recusar tiver preço. **E a decisão que
  ninguém contestou:** o dado pendente **não apaga a barra inteira** — apaga só
  o `Agir →` e **acende** o `Rolar d20`; `Ações`, `Habilidades`, `Examinar` e
  `Tempo` ficam vivos, porque não têm nada com a rolagem.
- **movimento** — nenhum.
- **onde vive** — Figma: `Botao` + `Veu`. · Código: **[ainda não existe]**.
- **por quê** — um véu sem saída que não **diz** que não tem saída é a armadilha
  que a peça *Véu sem retorno* existe para impedir; aqui ela está montada por
  acidente, com quinze controles apagados a dizer o mesmo cinza.
- **ressalva de regra, e é do `backend`:** **desistir de um teste tem de ter
  consequência de tabela** — senão é um botão de *"nada acontece"*, e um botão
  que não faz nada é pior que um botão que falta.
- **peso** — **médio**; **pesado** se recusar mudar a regra.

### dizer onde se mira quando há um inimigo só

- **quando** — *"o bloco `Escolha o alvo` só renderiza com mais de um inimigo de
  pé (`App.jsx:3246`). Contra um inimigo sozinho não há controle de alvo nenhum
  — o que é razoável —, mas também não há onde dizer onde se mira, porque a mira
  só existe com uma habilidade selecionada."*
- **forma** — **A casa**, *Estado=Mira*, disponível **sem habilidade
  selecionada** quando há um inimigo só. Nenhuma peça nova: é o mesmo gesto
  sobre o mesmo tabuleiro.
- **movimento** — igual ao de mover.
- **onde vive** — Figma: `A casa`, *Estado=Mira*. · Código: **[ainda não
  existe]**.
- **por quê** — *onde* se acerta é decisão de jogo em toda luta, não só nas que
  têm dois inimigos. A forma já está paga pela casa do tabuleiro; o que falta é
  deixá-la aparecer.
- **e o `jogo` fechou-a: a forma declarada BASTA.** Com um inimigo de pé a mira
  só faz sentido com habilidade selecionada, e aí é *A casa*, *Estado=Mira*.
  **Nada a pedir** — é a única das seis que não deixa dívida nenhuma.
- **peso** — **leve** na forma, **médio** na fiação.

---

## As seis cosméticas — qual venceu, e por quê

Seis conflitos sem significado em disputa: só uma cara a mais para a mesma
coisa. Ganham por contagem, não por gosto.

1. **As assinaturas do botão âmbar** (10 distintas em **37 usos de
   `background: T.amber`**) — vence `Botao` *Papel=Chamada*, canto 8, mono Bold,
   **dois tamanhos**. Porque 3 raios × 6 alturas × 2 famílias não é vocabulário:
   é o acaso da linha em que cada botão nasceu.
2. **Os 15 véus** (9 tintas, 4 desfoques + 4 sem) — vence **o próprio `bg` com
   alfa**: 60% leve · 85% pesado · 94% sem retorno, desfoque 4px em todos.
   Porque nove tintas dizem a mesma coisa, saem de fora da tabela, e **o que
   muda entre os pesos não é a opacidade: é se existe porta.**
3. **As 4 gramáticas do veredito antes do clique** — vence **A Consequência**, e
   o `title` **deixa de ser uma delas**. Porque `title` é canal de rato: 105 usos
   que não existem no dedo.
4. **As 5 formas de dizer erro** — vence **A Consequência** *tom=Impedimento*,
   **presa ao campo que errou**, nunca um vermelho no fim do formulário. Porque
   erro longe do campo faz procurar, e procurar é o custo que a forma existe
   para não cobrar.
5. **Os dois vermelhos** — vence `T.danger`. Saem `#E8615B` e `#E07070`
   (`App.jsx`) e `#FF9A85` (`grade-de-batalha.jsx`). **`#B4322E`
   (`painel-mapa`/`planta-cidade`) fica**: não é sujeira, é a paleta de
   pergaminho, e ganha nome próprio em `MATERIAIS`.
6. **Os dois sinais de menos** — vence **`−` (U+2212)**, que é o que o jogo já
   usa para custo (`App.jsx:8296`, `:8419`, `arena.js:258`). E fica dito o que
   apareceu ao conferir: **o mesmo caractere é botão em `App.jsx:3930`** (o
   stepper). Um glifo que ora é número ora é controle obriga o controle a ser
   outra coisa — o stepper vira **A escolha** *Forma=Contador*, com os sinais
   **desenhados**, não escritos.

---

## As superfícies (decidido em D2 · 14/09)

As superfícies não são ações, então não cabem no formato acima: ninguém
*clica* numa cortiça. Mas elas têm forma, e a forma delas tinha virado
trinta e cinco números soltos dentro de uma string de CSS. Ficam aqui.

**A regra que as separa de `T`.** `T` é a paleta **semântica** — o que uma
cor *significa* (tinta, perigo, acerto, acento). `MATERIAIS` é a paleta
**física** — de que um objeto do mural é *feito* (madeira, papel, latão).
São dois tipos de decisão e não podem morar na mesma tabela fingindo ser o
mesmo tipo: uma muda quando o jogo muda de humor, a outra quando a tábua
deixa de ser tábua.

### O degrau que faltava — `lineStrong` (aprovado pela pessoa, feito em K1b · 15/09)

**A medida que o apanhou, e nasceu de o `desenho` se desmentir:** ele escreveu
que o piso de contraste estava *"cumprido com folga em todos"*, foi medir, e não
estava. `line`/`panel` = **1,295:1** e `panelSoft`/`panel` = **1,073:1** — **as
quatro superfícies da casa cabem dentro de 1,3:1 umas das outras, e para a
WCAG 1.4.11 são uma superfície só.** Consequência prática, e é o defeito inteiro:
um controlo desta casa **ou se enche de `amber` (8,45:1) e grita, ou
desaparece.** Não havia meio-termo.

**`lineStrong` = `#70688C`** — `panel` **3,512:1** · `bg` **3,741:1** ·
`panelSoft` **3,272:1**, os três acima do piso de 3:1 para não-texto.

**E a razão que K1 deu para o valor era falsa, o que fica dito.** K1 escreveu
*"o degrau mais baixo que passa"*; `#6B6387` passa a **3,040**. O valor fica, com
a frase corrigida: **é o mais baixo que passa com folga** — **9,1 %** acima do
piso, contra **1,3 %**. *Um número certo com uma razão errada é uma armadilha
para quem vier depois afinar o token.*

- **Dois leitores reais, hoje, sem esperar K3** — a lei do export morto vale para
  a paleta: `Botao` (`ui.jsx:26`) e `CartaoDeEscolha` (`ui.jsx:396`), as duas
  ternárias com o mesmo `else` a 1,295:1. Só a borda do estado **não-acentuado**
  muda; o ramo âmbar e toda a espessura ficam byte a byte.
- **Paga um remendo:** os **7 overrides** de `ink` no verbo do recuo em *A
  pergunta que expira* (`;64:2426`) foram apagados, de volta a `inkDim`. Era pior
  do que K1 pensava — o `ink` dava ao recuo **a mesma voz do gesto** e achatava a
  hierarquia entre *reagir* e *deixar passar*.
- **A catraca de D5 foi lida, não suposta:** a zona `T` é isenta de D5a e D5b, os
  tetos de `estilo.js` não mexem, e `#70688C` **não aparece escrito à mão em
  parte nenhuma do projeto** (medido: zero ocorrências) — que é o que faria D5b
  morder. No Figma entrou como variável com `codeSyntax` WEB `T.lineStrong`, e
  aplicado a **31 nós em 3 peças**.
- **A mira NÃO se resolve com ele, e digo-o em vez de forçar.** O contorno da
  mira é violeta a 60 % sobre `bg` = **2,689:1** e reprova. Trocar a cor **piora**
  (`lineStrong` a 60 % = **2,071**): o defeito é a **opacidade**, não o tom, e a
  mira tem de continuar violeta porque há três coleções na mesma tela. O que
  `lineStrong` lhe dá é **régua**: o conserto que E1 propôs (70 % = **3,254**)
  fica **0,018 abaixo** do piso de 3,272 que o token instala — *passa a norma e
  falha a casa*. **O número honesto é 74 % (3,484)**, e fica como dívida para a
  Fase E: a mira vive no `App.jsx`, cujo bastão era da outra mente.

- **a cortiça** (`corticaFundo`, `corticaMoldura`, `corticaFilete`) — a
  tábua é o fundo escuro, a moldura é a madeira de sete pixels, o filete é
  o fio claro por dentro dela. Nenhum arquivo de imagem: gradiente, borda e
  sombra, e a `teste-arte` defende isso.
- **o cartaz** (`cartazTopo`, `cartazMeio`, `cartazPe`) — o papel é um
  degradê de três paradas, não uma cor chapada, porque papel pregado pega
  luz de um lado só.
- **o percevejo** (`percevejoBrilho`, `percevejoCorpo`, `percevejoBase`, e
  as três irmãs `percevejoRoxo*`) — brilho, corpo e base são a esfera de
  latão vista de cima. A cabeça roxa diz "isto foi oferecido a você" sem
  gastar uma palavra na tela.
- **a vinheta** (`vinhetaCanto`) — o canto escurece e o meio parece
  iluminado. A coisa mais barata que existe para dar profundidade.

**Sombra e brilho não são material.** `rgba(0,0,0,x)` e `rgba(255,255,255,x)`
não entram em `MATERIAIS`: são ausência e excesso de luz, e o que varia
entre os oito usos é só o alfa. Moram em dois moldes internos de
`estilo.js` — `sombra(a)` e `brilho(a)` — para que a decisão "a sombra da
casa é neutra" exista **num** lugar, e não em seis entradas que diferem no
último caractere.

**Os valores não moram aqui.** Moram em `src/estilo.js`, que é o único
lugar onde podem ser editados. Este parágrafo guarda o *porquê*; duplicar
treze hex em prosa seria criar a segunda verdade que este arquivo existe
para impedir.

**Dívida registrada, de propósito não paga em D2** (a linha de D2 era *zero
diferença na tela*, e cada uma destas mudaria pixel ou exigiria máquina
nova):

- `percevejoRoxoCorpo` é `#8A78D8` e `T.violet` é `#8B7BD8` — três de 255
  de diferença, invisível a olho nu. É quase certamente a mesma decisão
  escrita duas vezes, mas *quase* não basta: unificar é item futuro.
- `corticaFundo` está a três pontos de `T.panel`, e `cartazMeio` a sete de
  `T.panelSoft`. Mesma conversa.
- **treze** `rgba()` dentro da folha já são cores de `T` com alfa (sete no
  movimento, seis nas superfícies). Elas esperam o helper `alfa(cor, a)` do
  item *"os 67 literais que já são `T`"* — e quando ele vier, **o escopo
  daquele item é 80, não 67**.

---

## A biblioteca no Figma (decidido em D3 · 14/09)

**Onde ela mora.** Arquivo `Taverna — biblioteca`, na equipe de Eliabby
Moreira. `fileKey` **`e5wJUzInAssoebx5npssKc`** —
`https://www.figma.com/design/e5wJUzInAssoebx5npssKc`. **Um só**: quem vier
depois amplia este arquivo, não cria o segundo. Um segundo arquivo é a
mesma doença que esta mesa existe para impedir, um andar acima.

**A estrada é de mão dupla, e isso foi medido, não suposto.** As 27 cores
das duas tabelas entraram como variáveis; foram puxadas de volta por
`get_variable_defs` e comparadas com `src/estilo.js` **por máquina**, num
script que importa o módulo de verdade. Bateram **26 de 27**. Depois o
valor de `amber` foi trocado *dentro do Figma* para um verde impossível, a
volta trouxe o verde, e a comparação acusou a divergência sozinha — é esse
o teste que prova que a troca existe. O valor foi restaurado.

**A única divergência é de formato, e vale saber.** O Figma guarda alfa em
um byte. `vinhetaCanto` é `rgba(4,3,8,.45)` no código e volta como
`#04030873`: `0x73 / 255 = 0,45098`, um milésimo acima. `corticaFilete`
(`.4`) volta exata, porque `0,4 × 255 = 102` é inteiro. **Portanto: alfa
que não for múltiplo exato de 1/255 não sobrevive à ida e volta.** Quem
comparar isto por máquina um dia tem de comparar com tolerância de 1/255 no
alfa — nunca por igualdade de texto.

**A ponte tem nome de código.** Cada variável leva `codeSyntax` WEB igual
ao caminho real em JS — `T.bg`, `MATERIAIS.corticaFundo` — e não uma CSS
custom property, que o projeto não tem. É por isso que o que volta do Figma
já vem com a chave do código: a comparação não precisa adivinhar o par.

**E o que a volta NÃO prova, dito antes que alguém suponha.** Ela prova que
o valor vive no arquivo e é lido por chave + nó, **sem ninguém selecionar
nada** — `get_variable_defs(fileKey, nodeId)` responde a frio, e foi
repetido em sessão separada. Ela **não** prova que uma pessoa editando a
variável na interface do Figma chega ao código: o valor de prova foi escrito
pela API de plugin. É plausível que dê no mesmo (o valor mora no arquivo,
não no caminho da escrita), mas plausível não é medido, e esta casa não
escreve suposição como se fosse número.

**A armadilha que custou uma investigação: `get_metadata` sem `nodeId`
MENTE.** Pedida a listagem de páginas do arquivo por chave, ela devolve
**só `Page 1`** — a página original, vazia. As sete páginas existem: o
`use_figma` dentro do arquivo lista as sete, o `get_metadata` **com**
`nodeId` devolve a subárvore inteira, e o `get_variable_defs` lê as
variáveis delas. Quem conferir este arquivo pela listagem de páginas vai
concluir que ele está vazio, e vai estar errado. **Confira por nó, nunca
pela lista.** (E `get_variable_defs` apontado a uma PÁGINA — `0:1` — não
falha dizendo "página não serve": cai no caminho da seleção e responde
*"You currently have nothing selected"*, que faz parecer que a ferramenta
exige um humano no desktop. Não exige. Exige um nó que **use** variáveis.)

### As peças que entraram

Entram as primitivas com **leitor real** — uso fora de linha de `import`.
A contagem foi refeita: dos 49 exports de `ui.jsx`, **25 têm dois ou mais
usos reais**, 20 têm exatamente um, e **4 têm zero** (`IconeBandeira`,
`IconeGota`, `IconeCirculoX`, `IconeFrasco`) — os mesmos quatro que a pauta
já nomeava, agora confirmados. Ficam de fora.

- **Botão** (`Botao` de `ui.jsx`; 234 controles no jogo, 218 deles crus) —
  24 variantes: *Papel* (Chamada · Gesto · Recuo) × *Estado* (Repouso ·
  Foco · Esperando · Impedido) × *Tamanho* (Normal · Pequeno), mais três
  propriedades: `rotulo`, `a razao`, `mostrar a razao`.

  **A primeira versão desta peça estava errada e foi refeita.** Ela tinha
  um estado *Desativado* — e o `jogo` provou que "não pode agora" são
  **duas coisas diferentes que hoje saem com o mesmo cinza**:
  `bloqueado = carregando || !!rolagem` governa **15** controles, e "o
  Mestre está a escrever" e "há um dado à espera" apagam a barra de ação de
  forma idêntica. O `Agir →` carrega três razões na mesma cara.

  Então **Esperando** fica opaco, com a forma intacta e a razão em âmbar —
  *isto volta*. **Impedido** cai a 45% com a razão em cinza — *isto não
  volta agora*. A diferença lê-se sem ler.

  **E a razão é um nó, não um `title`.** Ela existe na árvore, no dedo e no
  leitor de tela. Nos dois estados ela **nasce acesa**: apagá-la é um gesto
  deliberado de quem monta a tela. Era isso que faltava aos 31 botões mudos
  de hoje — alguém *ter de escolher* o silêncio.

  *Papel* substituiu *Tom* porque a escolha real não é uma cor: é que tipo
  de ação aquilo é. E **Destrutivo saiu do Botão** — virou peça própria,
  porque faz o que nenhum botão faz: pergunta.
- **A consequência** — 4 tons (Impedimento · Espera · Preço · Estado) × 2
  fixações (Linha · Balão). É a peça que o `jogo` pediu por nome, e a razão
  é dura: hoje o jogo tem **um** lugar para dizer o que vai acontecer, e é
  o `title` — um atributo de rato. Por causa dele o preço do Destino é
  invisível no telemóvel, 13 bloqueios não dizem porquê, o interruptor das
  rolagens não tem estado legível, e o `⛺` termina uma luta sem avisar.
  **A regra que ela carrega: nunca só-hover.** *Linha* vive sempre na
  árvore; *Balão* abre no dedo **e** no rato — se só abrir no rato, não é
  esta peça, é o `title` outra vez.
- **O gesto que custa** — *Etapa* (Armado · Perguntando) × *Estado*
  (Repouso · Foco), com o preço como campo obrigatório. São 14 ações
  irreversíveis no jogo e **onze não confirmam nada**. A peça vira pergunta
  **no próprio lugar**: não é modal, porque um modal para "remover Brann do
  grupo" é caro demais — e é por ser caro que onze delas hoje não têm
  proteção nenhuma. *Armado* não grita (contorno, não preenchimento): um
  vermelho cheio a gritar o dia inteiro deixa de significar perigo na hora
  em que importa. O Confirmar repete o **verbo**, nunca "Sim". E
  `onAccent` sobre `danger` dá 5,34:1, contra os 3,42:1 do `#fff` que hoje
  está no único botão que apaga alguém.
- **Fechar** — sair sem decidir. Hoje o xis é escrito à mão em cada tela,
  em **8 formas visuais e 5 tamanhos**. Não é destrutivo e nunca pergunta.
  **E o `✕` é da saída e de mais nada:** hoje o mesmo glifo fecha um painel
  em nove lugares e **expulsa um membro da guilda** noutro — duas ações,
  uma forma, sendo uma delas irreversível. O que expulsa usa o gesto que
  custa.
- **Selo de estado** — diz em que estado uma coisa está, e não se clica.
  Quatro tons (Neutro · Bom · Aviso · Perigo), **ponto mais palavra**: a cor
  sozinha nunca carrega o sentido, porque quem não distingue vermelho de
  verde tem de ler a mesma coisa.
- **Barra de medida** (`BarraMini` de `ui.jsx`) — rótulo, trilho e o número
  escrito, porque a barra sozinha não diz *4 de 20*. Dois níveis, e o corte
  é a regra que o código já tem: **abaixo de um terço** a cor vira perigo, e
  o número vira perigo com ela.
- **Véu** — 3 pesos (Leve · Pesado · Sem retorno). São 15 sobreposições no
  jogo, com **quatro regras de fecho, oito tintas de fundo e seis
  larguras** — e `Escape` não fecha nenhuma. **O que muda entre os pesos
  não é a opacidade: é se existe porta.** Leve e Pesado têm a saída no
  canto; *Sem retorno* **não tem**, e a ausência é desenho, não
  esquecimento — hoje o jogador procura um `✕` que nunca existiu, e por
  isso a peça diz por escrito que não há. O véu é sempre o próprio `bg` com
  alfa (60% / 85% / 94%): oito tintas viram três, e as três são a mesma
  cor. **Esta peça está incompleta de propósito** — ver as Discordâncias.

- **Os glifos** — os **11** ícones de `ui.jsx` com dois ou mais usos reais
  (`IconeD20`, `IconeCaneca`, `IconeSeta`, `IconeLivro`, `IconeFaiscas`,
  `IconeCaveira`, `IconeEspada`, `IconeOlho`, `IconeDado`, `IconeCheck`,
  `PontoAtivo`). Geometria idêntica à do código, caractere por caractere; o
  que muda é que a cor é **variável ligada**, não hex. Entram como
  componentes e não como imagem pela mesma razão que no código: um ícone
  que é arquivo não herda o token.

  **Os 20 de um uso só NÃO entraram**, e é decisão, não esquecimento: eles
  passam na catraca de hoje porque a linha de `import` conta como o segundo
  leitor. Biblioteca não é lugar de registrar furo.

### O que D4 acrescentou à biblioteca (14/09)

Mesmo arquivo, `e5wJUzInAssoebx5npssKc`. **Nenhum segundo arquivo.** Tudo ligado
a variável, **zero hex solto**, e todo quadro que só organiza com `fills = []`.

**Cinco peças novas, uma página cada:**

| peça | página · nó | variantes | por que ela não existia |
|---|---|---|---|
| **A casa** | `A casa` · `18:31` | 7 (*Estado*) | o alvo do tabuleiro é um `<rect fill="transparent">` |
| **A escolha** | `A escolha` · `20:77` | 12 (*Forma × Estado*) | ~40 lugares em 6 gramáticas |
| **O interruptor** | `O interruptor` · `21:31` | 4 (*Valor × Estado*) | o estado tem duas cores e nenhuma palavra |
| **A linha** | `A linha` · `22:46` | 4 (*Estado*) | 23 campos de texto e nenhuma primitiva |
| **O realce** | `O realce` · `25:13` | 2 (*Grau*) | o degrau 2 da cerimônia |

**Dois eixos novos em peças que já existiam:**

- **Selo de estado** — ganhou ***Mudou*** (Não · Agora): 4 → **8** variantes. O
  `jogo` tinha pedido um **tom** "mudou agora"; um tom obrigaria a escolher
  entre dizer *o que é* e dizer *que acabou de mudar*. Virou eixo.
- **Barra de medida** — ganhou ***Mudou*** (Não · Golpe · Ganho): 2 → **6**.

**Uma correção, e é da própria peça de D3 — vale mais escrita que escondida:**

- **Botão.** As **6** variantes *Estado=Impedido* caíam a **45% de opacidade no
  corpo inteiro**. A conta: rótulo `inkDim` a 45% sobre âmbar a 45%, tudo sobre
  `bg`, dá **1,19:1** — abaixo de qualquer piso que exista, e visível a olho nu
  na própria folha da biblioteca. Passaram a **sem preenchimento, borda `line`,
  tinta cheia**: **6,62:1**. **E o eixo mudou junto**: *Esperando* × *Impedido*
  deixou de se separar por *volta / não volta* e passa a separar-se por **quem
  tem de agir** — o sistema, ou você. A descrição do conjunto no Figma regista a
  correção e o motivo. **Uma peça corrigida com o motivo escrito vale mais que
  uma peça que nunca errou.**

**A composição funcionou, e é isso que prova biblioteca em vez de álbum:** `A
linha` monta uma **instância** do `Botao` e troca-lhe o estado e a razão por
propriedade; `O realce` monta uma **instância** do `Selo` com *Mudou=Agora*.
Nenhuma peça foi redesenhada por dentro de outra.

**O que foi declarado e NÃO foi fabricado — de propósito, e cada um com a razão:**

- ***A pergunta que expira*** — o controle que aparece, oferece uma escolha e
  **some sozinho se ninguém responder, sem punir quem não respondeu**. Não é o
  *gesto que custa* (esse espera para sempre) nem um véu (esse toma a tela). Não
  foi fabricada porque **é o coração de uma proposta `pesado` que espera a
  pessoa**, e peça feita para decisão não tomada é trabalho inventado. Fica em
  dívida, com nome e com a especificação escrita na forma *reagir ao golpe que
  chega*.
- ***A escolha*, variantes *Contador* e *Lista*** — declaradas em D4, o conjunto
  no Figma continua com **12** (Cartão · Pílula · Aba × 4 estados). *Contador*
  nasceu do stepper de 24px; *Lista* nasceu da ressalva do `jogo` de que **o
  `<select>` nativo não sai das listas longas**. Ambas **[ainda não existe]**,
  dito aqui para a contagem não sugerir o contrário.

**As armadilhas novas do Figma (as três custaram tentativa):**

1. **`setBoundVariableForPaint` devolve a tinta com `opacity: 1`** — o alfa que
   você passou é descartado em silêncio. Quem quiser âmbar a 22% tem de
   **reaplicar a opacidade depois de ligar a variável**. Na primeira tentativa
   as sete casas saíram em âmbar chapado.
2. **`resize()` trava os dois eixos em `FIXED`** — inclusive os que você acabou
   de pôr em `AUTO`/`HUG`. Foi o que fez `A escolha` nascer com 80px de altura e
   as 12 variantes empilhadas umas sobre as outras. A ordem é: `resize()`
   **primeiro**, modos de dimensionamento **depois**.
3. **Uma propriedade de TEXTO tem um valor padrão para o conjunto inteiro** —
   logo **nenhum texto que muda por variante pode ser propriedade**. Foi isto
   que fez a folha de D3 mostrar a frase do *Impedido* na variante *Esperando*,
   e o interruptor dizer "a vista" nas quatro. No interruptor a propriedade foi
   **apagada** e a palavra devolvida a cada variante.
4. *(confirmada, de D3)* **`get_metadata` sem `nodeId` mente** — continua a
   devolver só `Page 1`. As **13 páginas** de hoje só aparecem por nó.

**A conta do Code Connect subiu.** Com **sete** peças novas ou alteradas em D4,
o que a secção seguinte conta como *8 de 8 sem nó* são hoje **15 sem nó**. O
diagnóstico dela não mudou: continua a ser plano de conta, não desenho.

### O nó que não se pôde dar: o Code Connect

**Zero peças ficaram amarradas, e não pela razão que a pauta previa.** A
pauta esperava que faltasse componente de código a que amarrar. Faltou
outra coisa: **o plano da conta não permite a ferramenta.** Os três
caminhos — `list_file_components_for_code_connect`,
`get_code_connect_suggestions` e `add_code_connect_map` — respondem a mesma
frase: *"You need a Dev or Full seat on an Organization or Enterprise plan
to use Code Connect."* A conta é `pro` com assento Full; falta o plano, não
o assento.

Então **8 de 8 peças estão sem nó**, e enquanto estiverem, **o que impede a
biblioteca de divergir do código em silêncio é o script de comparação** —
que prova hoje e não protege amanhã. Isto é dívida nomeada, não fracasso:
é decisão de quem paga o Figma, e não de desenho.

### O anel de foco é DESENHO NOVO, e fica dito

`:focus-visible` tem **zero ocorrências no projeto**. Desenhar o estado de
foco não é espelhar o que existe: é inventar. Legítimo, e necessário — um
jogo que só se joga com o dedo exclui quem navega por teclado — mas é
desenho novo e entra declarado, não contrabandeado como se já fosse assim.

**A forma:** duas sombras de raio zero — a de dentro, 2px em `bg`, abre o
vão; a de fora, 4px em `ink`, é o anel. É exatamente um
`box-shadow: 0 0 0 2px T.bg, 0 0 0 4px T.ink`, e foi escolhido por isso: o
que está no Figma e o CSS que um dia o implementa são a mesma construção,
não duas aproximações uma da outra.

**Um anel só, em todos os tons.** `ink` sobre `bg` é o maior contraste que
a casa tem, e o anel assenta no fundo da página, não no botão — então
funciona igual no âmbar, no contorno e no vermelho. Um anel por tom seria
bonito e seria três decisões onde cabe uma.

### O que se achou pelo caminho, e ainda não tem dono

- **`MATERIAIS` tem 13 entradas, não 11.** A pauta de D3 dizia 11; o
  arquivo tem 13, e D2 já tinha escrito 13. Corrigido aqui porque a
  comparação por máquina conta sozinha.
- **`JetBrains Mono` não tem peso 600 no Figma.** `FONT_CSS` carrega
  `wght@400;600`; o Figma oferece Regular, Medium (500) e Bold (700) — não
  há SemiBold. Os rótulos da biblioteca usam Bold. É uma diferença real
  entre o que o navegador desenha e o que o Figma desenha, e quem comparar
  tela contra tela vai tropeçar nela.
- **O véu da sobreposição não tem token.** O preto do fundo escuro mora em
  `sombra()`, que é privado de `estilo.js` e não sai. A biblioteca resolveu
  com `bg` a 75%, que é melhor design *e* usa tabela — mas o código ainda
  escreve preto literal nesses lugares.
- **Um quadro de arranjo não tem cor.** `figma.createAutoLayout()` nasce
  branco, e um branco não declarado é a mesma doença que a casa caça em cor
  literal — só que invisível até alguém tirar a foto. Foram quatro, e
  saíram. Fica a regra: quadro que só organiza leva `fills = []`.

---

## Discordâncias resolvidas

Quando o `jogo` e o `desenho` divergem, a decisão fica aqui **com os dois
lados escritos** — nunca em dois códigos diferentes. Uma divergência
registrada é barata; duas implementações da mesma ação custam para sempre.

### A escala de cerimônia — FECHADA em D4 (aberta em D3 · 14/09)

**Em D3 isto não era uma discordância resolvida: era uma decisão deixada em
aberto de propósito**, porque o `jogo` pediu para desenhar junto e receber
pronto seria atropelá-lo. **Em D4 ele respondeu.** O que se segue é o lado do
`desenho`, como foi escrito; a resposta do `jogo` e a decisão estão no fim.

**O que o `jogo` disse.** O modal do dado (`App.jsx:512`) é o único lugar da
sessão em que se sente que se está a jogar: escurece a tela, o d20 treme,
para, e só então aparece o veredito. *O tempo entre o número e o veredito é
o jogo.* E ao lado dele, com o mesmo mecanismo disponível, **a conclusão da
primeira missão da campanha é a quarta de seis pílulas cinzentas iguais**
no log. Ele pediu uma variante do véu que diga *isto foi importante* — **e
avisou que um modal por conquista seria pior que o silêncio.**

**O que eu respondo, e é a parte que precisa do aval dele.** O pedido não
cabe no véu, e é por isso que a peça foi entregue incompleta. Um véu **é**
uma interrupção: qualquer variante dele custa um clique, por mais leve que
seja o fundo. Se a resposta a "isto foi importante" for um véu, o jogo
ganha um véu por conquista — exatamente o que ele não quer.

**A minha proposta: a escala tem quatro degraus e só os dois de cima são
véu.**

1. **nota** — a pílula no log. Não interrompe. É o que tudo é hoje.
2. **realce** — *o degrau que falta.* A mesma entrada do log, marcada: um
   filete acima e abaixo, a tinta em âmbar, e o Selo *"mudou agora"*.
   Continua a não interromper e continua a não custar clique. **É aqui que
   a primeira missão e a conquista deviam viver**, e não num véu.
3. **véu leve / pesado** — toma a tela, e tem porta. O dado, o achado, a
   subida de nível.
4. **véu sem retorno** — toma a tela e exige decisão. A morte, a
   recalibragem.

**O que fica em aberto, e é dele:** *quais* momentos sobem de 1 para 2. Eu
sei fabricar o degrau; **quando ele aparece é momento, e momento é do
`jogo`.** O Selo *"mudou agora"* que o degrau 2 precisa também está na
lista dele como [NOVO] e ainda não foi feito — os dois nascem juntos ou
nenhum funciona.

**O risco que eu assumo por escrito:** se o degrau 2 não existir, o `jogo`
vai acabar por usar o véu leve para conquistas — porque é a única coisa que
a biblioteca lhe dá — e a taverna passa a interromper o jogador para lhe
dar os parabéns. Prefiro registrar isto agora do que descobri-lo montado.

#### A resposta do `jogo`, e a decisão (D4)

O `jogo` **aceitou os quatro degraus** e **aceitou por escrito o risco
registado**: *"comprometo-me a não usar véu leve para conquista nenhuma."* O
degrau 2 foi fabricado no mesmo turno (`O realce`, e o `Selo` *Mudou=Agora* de
que ele depende). **Os dois nasceram juntos, como tinha de ser.**

**A regra vem antes da lista, e é dele — porque regra sobrevive a momento novo
e lista não:**

> **Sobe ao realce o que muda o que o jogador PODE FAZER a partir de agora — e
> só na primeira vez.** O que só muda um número fica em nota.

**Sobem ao realce (degrau 2) — nove momentos:**

1. **missão concluída** — hoje a quarta de seis pílulas cinzentas iguais
   *(medido na campanha carregada: `✦ MISSÃO CONCLUÍDA: Tirar Halvard da Foz de
   lá — +57 moedas · +89 XP`, no mesmo tipo, tamanho e cor de "🗺 um lugar surgiu
   no mapa")*;
2. **conquista desbloqueada**;
3. **um separador novo nasce no menu** (o Códex, a Ascensão) — é literalmente
   uma porta nova na tela, e hoje nasce em silêncio;
4. **a primeira vez que alguém entra no grupo**;
5. **a casa/guilda aceita você** (ou o expulsa);
6. **um título novo fica disponível**;
7. **uma habilidade ou magia nova fica disponível** — muda o que se pode fazer
   no turno seguinte;
8. **a fama muda de patamar**;
9. **uma facção vira aliada ou inimiga** — muda quem abre a porta.

**Ficam em nota (degrau 1), e isto é decisão, não esquecimento:** +XP, +moedas,
item recolhido, lugar novo no mapa, tempo a passar, cada linha de combate,
*"fulano tem um trabalho no mural"*. São frequentes, e **realce frequente deixa
de ser realce em duas sessões**.

**Continuam véu (3):** o dado, a subida de nível, o espólio revelado, a
cerimônia do lugar novo, a carta do taró. **Sem retorno (4):** a morte, a
recalibragem e as três caixas de decisão do save.

**E o `quando` do Selo *"mudou agora"*, que nasce com o degrau 2:** ele aparece
**no número que mudou, no sítio onde o jogador vai olhar a seguir**, morre no
turno seguinte, e **nunca em duas coisas ao mesmo tempo** — *dois "mudou agora"
na mesma tela é zero "mudou agora".*

---

### confirmar / cancelar — FECHADA (D4 · 14/09)

**O que há hoje, conferido pelos dois.** *(código)* **12 lugares, 4 palavras, 5
tamanhos**: `cancelar` ×5 (`App.jsx:1672, 2542, 21079`, `painel-talentos:112,
:417`), `VOLTAR` ×2 (`:4327, :4467`), `voltar` / `voltar ao menu` ×2 (`:4063`,
`painel-heroismo:97`), `manter como está` ×3 (`:21265, :21295, :21323`) — e
**dois sem borda nenhuma** (`:21079`, e `:4063` que é um sublinhado). E o
confirmar que **remove um companheiro do grupo** (`App.jsx:2541`) usa `#fff`
sobre `T.danger` = **3,42:1**, contra os `#1A0F0D` (5,48:1) dos outros
destrutivos.

**O lado do `desenho`.** Cancelar **não é um botão de tom baixo: é o Recuo**, e
recuar tem forma própria — sem preenchimento, borda `line`, tinta `inkDim`
(**6,21:1** sobre `panel`), **sempre à esquerda do confirmar**. Um texto
sublinhado no meio de uma fila de botões não é estilo: é um alvo que o olho não
acha.

**O lado do `jogo`.** Cancelar é **a saída de emergência**, e o que o jogador
precisa ali é reconhecê-la **sem ler**. Mas a palavra tem de ser **do momento, e
não da linha em que nasceu**: dentro de uma pergunta armada é sempre
`cancelar`; numa tela de montagem é sempre `VOLTAR`; numa proposta do sistema é
sempre `manter como está` — porque ali o jogador **não desiste de nada: recusa
uma mudança**.

**A decisão.** Forma única: `Botao` *Papel=Recuo* nos **doze** lugares, **sempre
à esquerda do confirmar**. O confirmar destrutivo é **O gesto que custa**, com
`T.onAccent` sobre `danger` = **5,34:1**; **o `#fff` de 3,42:1 sai, e sai como
bug de acessibilidade, não como gosto.** O Confirmar repete o **verbo**
("remover Brann"), nunca "Sim" — um "Sim" fora de contexto é a coisa mais fácil
de clicar por engano. **E a palavra fica com o `jogo`: três, amarradas ao
momento.**

**Quem cedeu:** ninguém, e vale escrever porquê. **A fronteira de autoria já
resolvia**: a forma é uma e é do `desenho`; a palavra é do momento e é do
`jogo`. O `jogo` tinha deixado a cessão escrita — *"se o `desenho` insistir em
uma palavra só, eu cedo"* — e **ela não foi gasta**. Fica registada: **uma
cessão guardada é o que faz a próxima divergência fechar depressa.**

---

### fechar um painel — FECHADA (D4 · 14/09)

**O que há hoje, conferido pelos dois.** 15 sobreposições, **9 tintas de
fundo**, 4 desfoques + 4 sem, **4 regras de fecho**, `✕` em **6 tamanhos** (5
com borda, 11 sem), `Escape` não fecha nenhuma *(medido em 2 das 15; as outras
13 por código: `Escape` tem zero ocorrências em `src/`)*. E o censo do `jogo`
achou o que faltava: **o mesmo `✕` significa QUATRO coisas em 14 controles** —
fecha um painel (7), tira da seleção (2), **descarta/abandona (4)**, **expulsa
da guilda (1)**. D3 escreveu *"duas ações, uma forma"*. **São quatro, e cinco
delas não voltam atrás.**

**O caso que dói mais:** `painel-guilda.jsx:338-339` — **`▲` promover e `✕`
expulsar, lado a lado, do mesmo tamanho, os dois sem uma letra de rótulo**, e só
um deles é irreversível.

**A decisão.** O **`✕` é da saída e de mais nada.** As **cinco** ações de perda
que hoje usam o glifo da porta passam a **O gesto que custa, com o verbo
escrito** — `expulsar`, `descartar`, `abandonar`, `remover` —, incluindo o `✕`
que expulsa da guilda (`painel-guilda.jsx:339`). **Três portas em toda
sobreposição: `Esc`, o fundo e o `✕`.**

**Cedeu o `jogo`:** a variante *discreta* do `Fechar` **deixa de ser escolha
livre** — **o glifo pode ser pequeno, o alvo nunca**: **44px em todas as 15**,
mesmo canto. O argumento é dele, e é dele que vale a pena citar: *"um alvo que o
dedo erra rouba muito mais cena do que um alvo grande"* — medido nos quatro `✕`
de ~20px. Ele tinha pedido a discrição para a porta não roubar a cena; a
discrição virou o defeito.

**Cedeu o `desenho`:** a sobreposição da morte **pode manter o clique-no-fundo
desligado** — momento é do `jogo` —, **desde que diga na tela que não há
saída**, que é exatamente o que hoje falta. É o *Véu sem retorno*, e a ausência
de porta só é desenho quando está escrita.

---

### "não pode agora" — FECHADA (D4 · 14/09)

**O que há hoje, conferido pelos dois.** `const bloqueado = carregando ||
!!rolagem` (`App.jsx:20384`) governa **15** `disabled` e **6** expressões de
opacidade, com dois valores (0.4 ×3, 0.45 ×3). **44 desativados, 31 mudos**, 13
com a razão só no `title`, **8 valores de opacidade para a mesma ideia**. O
`Agir →` (`App.jsx:21219`) carrega **três razões na mesma cara**.

**A decisão, e a conta é o argumento.** **A opacidade sai:** 40% → **2,02:1**,
45% → **2,25:1**, 60% → **3,03:1**, e o *Impedido* da própria peça de D3 dava
**1,19:1**. Ficam **dois estados, separados por quem tem de agir**: *Esperando*
(o sistema age) e *Impedido* (você age, e a razão diz o quê).

**Cedeu o `jogo`:** *"o campo está vazio"* **deixa de ser um terceiro estado** e
entra em *Impedido*, com a razão *"escreva o que você faz"*. E cedeu **pela
razão dele mesmo**: **"dois estados aprendem-se mais depressa que três"**, e
porque a razão escrita já carrega sozinha a diferença que ele queria dar pela
forma.

**E aqui há uma discordância pequena que sobrevive, e que é melhor escrita que
alisada.** No veredito de D4 o `jogo` **recusou o rótulo de cessão**: *"eu tinha
escrito que cederia se ele insistisse em pôr o campo vazio em Esperando. Ele não
insistiu — ele fez melhor. Ao trocar o eixo para **quem tem de agir**, o campo
vazio cai naturalmente em Impedido, que é exatamente o que eu queria dizer com 'é
o campo vazio a falar'. Divergência fechada, sem perda dos dois lados."* **Ele
tem razão no essencial** e o resultado é o mesmo: dois estados, três razões, cada
razão no estado certo. Fica registado assim, e não como cessão: **a cessão estava
escrita e não foi cobrada, porque a forma nova a tornou desnecessária.** É a
segunda cessão guardada desta fase, e guardar é o que faz a próxima fechar
depressa.

**Cedeu o `desenho`:** **os glifos do cabeçalho podem ficar mudos.** Uma razão
escrita em cada um vira parede de texto, e **é o `jogo` quem sabe o que a cena
aguenta**. **E ele pagou a cessão por nome**, em D4: a coluna *"fica mudo na
tela?"* da forma *o controle que é só um glifo* diz, um a um, quais ficam (a
caneca, o `↓`, os nove `✕` que fecham, o `−`/`+` do stepper, o `🔊`) e quais
**não podem** ficar (`⛺`, `📜`, `⚒`, o par `▲`/`✕` da guilda, os quatro `✕`
que descartam). **Com uma linha que vale por toda a divergência: mudo na tela
≠ mudo para quem não vê a tela — o nome acessível é obrigatório nos 15.**

O que o `desenho` não cede é o `Agir →`: é a ação central, as três razões são
distintas, e ficar mudo ali foi o que fez o `jogo` adivinhar.

**E o que ninguém contestou, que por isso é decisão, e é dele:** **o dado
pendente não apaga a barra inteira.** Hoje apaga `Ações`, `Habilidades`,
`Examinar` e `Tempo`, que não têm nada com a rolagem. Deve apagar **só o
`Agir →`** e **acender o `Rolar d20`**.

---

### a ação principal entre os modos — FECHADA (D4 · 14/09)

**O número que fecha a discussão é do `jogo`, medido no DOM vivo:**

| modo | a chamada | tamanho | área | fonte |
|---|---|---|---|---|
| `historia` (**o padrão absoluto**) | `Agir →` | 45 × 16 | **720 px²** | JetBrains Mono 12 |
| `rapida` · Torneio | `⚔ A PRÓXIMA LUTA` | 1144 × 48 | **54.912 px²** | Cormorant 18 |
| `duelo` | `À ARENA →` | 591 × 54 | **31.914 px²** | Cormorant 18 |
| `rapida` · Noite | `ENTRAR NA NOITE →` | 380 × 54 | **20.520 px²** | Cormorant 18 |

**76×** entre a menor e a maior — **e as duas extremas estiveram na MESMA tela,
na mesma sessão, a três centímetros uma da outra.** Não é divergência entre
modos: **é divergência dentro de uma tela**, e o modo **padrão absoluto** tem a
menor chamada do jogo inteiro. O `CLAUDE.md` diz que modo é *"lente sobre o
mesmo motor, nunca um segundo jogo"*; visualmente, hoje, são dois.

**A decisão.** **Uma peça só nos quatro modos:** `Botao` *Papel=Chamada*,
**mesma família tipográfica e mesmo tamanho de letra (16px)**, dentro da peça
**A linha**. **A largura é variante** — `cabe no conteúdo` / `ocupa a linha` —,
**não um segundo botão**.

**Cederam os dois, e é por isso que fecha.** O `jogo` cedeu **no tamanho**:
queria o `Agir →` a subir à faixa grande, aceita a menor **desde que seja a
mesma peça** — *"duas peças ensinam duas línguas; uma peça em dois tamanhos
ensina uma."* O `desenho` cedeu **na largura**: queria uma chamada só, aceita a
faixa do Duelo e do Torneio como variante, **porque ali a chamada é cerimônia**
(`À ARENA` é uma porta, não um turno).

**O que nenhum dos dois cedeu — e por isso é a decisão:** **a família e o
tamanho da letra.** `tv-display 18px` contra `tv-mono 12px` é exatamente o que
faz parecer dois jogos.

**E o risco, por escrito, porque é para não ser descoberto montado:** subir a
chamada do `historia` de 12px para **16px pode empurrar o campo de escrita no
telefone** (375×812), onde ela divide a linha com **A linha**. **É a prova que
L2 deve**, e fica nomeada aqui.

**O `jogo` mediu o risco e pôs preço nele.** A 375×812, descontadas as margens,
sobram **~343px** de linha; a chamada nova (mono Bold 16px, padding 16/28) pede
**~140px de largura e ~60px de altura**. Se a chamada e o campo dividirem a
linha, o campo fica com **~195px — doze ou treze caracteres de prosa visíveis
por vez**, para escrever a ação central do jogo. **Então a decisão fica
condicionada a três coisas, e nenhuma é sobre o botão** (as três são as
*condições de aceitação* de **A linha**):

1. **o `Enter` manda o turno**, `Shift+Enter` quebra linha;
2. **no telefone a peça empilha** — campo em cima com três linhas de prosa,
   chamada embaixo ocupando a largura (e assim o telefone ganha o **maior** alvo
   dos quatro modos, que é o que a plataforma pede); no desktop dividem a linha;
3. **a última fala do Mestre continua à vista** com o teclado aberto.

*"Se essas três estiverem de pé, o `Agir →` pode subir aos 16px nos quatro modos
e eu assino embaixo. Se alguma cair, a chamada da campanha fica como está e
perdemos só simetria — que é o barato de perder."* **A simetria é o item
negociável desta divergência; o gesto do `Enter` não é.**

---

## O que D1 dizia e não era verdade

**Oito correções novas em D4**, mais as duas que D3 já tinha derrubado.
**Herdar engano é o erro que esta seção existe para impedir** — e nesta fase
quase aconteceu três vezes. Duas das oito são de cada mesa **sobre si mesma**,
o que vale registar: quem só corrige o outro não está a conferir, está a
discutir.

**As três do `desenho`, com a linha:**

1. **"o interruptor `🎲` não tem estado, só `title`" — errado.**
   `App.jsx:20418` muda **duas** coisas ao ligar: a borda vai de `T.line` para
   `T.amber` e o glifo de `T.inkDim` para `T.amberSoft`. **O estado existe em
   duas cores.** O que não existe é **uma única letra**: o emoji é o mesmo nos
   dois estados, e as palavras "visíveis"/"ocultas" moram só no `title`, que não
   existe no dedo. O pedido muda: não é *dê estado ao interruptor*, é **dê nome
   ao estado**.
2. **"o `✕` tem 4 tamanhos" (D1) / "5" (`jogo`, D3) — são 6.** O glifo aparece
   em **16 linhas** de `src/**`, em `text-[9px]`, `text-[10px]`, `text-[11px]`,
   `text-xs`, `text-sm` e `text-lg`, **5 com borda e 11 sem** (`App.jsx:1505,
   1588, 1840, 2534, 2772, 2806, 3026, 3338, 20553, 20611, 20621`,
   `painel-guilda.jsx:131, 339`, `painel-heroismo.jsx:68`).
3. **"13 assinaturas do botão primário" — são 10; e o número que decide é
   outro: 37.** `background: T.amber` aparece **37 vezes** em `src/**`. Dez são
   botões, com **10 assinaturas distintas** (3 raios, 6 alturas, 2 famílias); as
   outras **27 são selos, barras, pontos e preenchimentos**. É o **37** que
   decide a gramática da escolha: o mesmo preenchimento diz *"esta é a ação
   principal"* e *"esta opção está selecionada"* em lugares diferentes da mesma
   tela.
4. **"5 desfoques nos véus" — são 4, e 4 sem desfoque nenhum.** Os 15 véus usam
   `blur(3px)`, `(4px)`, `(5px)` e `(6px)`, e **quatro não têm desfoque**
   (`App.jsx:1836, 21251, 21278, 21308`). As tintas de fundo são **9** — esse D1
   acertou.

**As três do `jogo`, medidas ao vivo:**

5. **"`⤢ ampliar` abre outro bloco dentro do mesmo scroller clipado" — errado, e
   o defeito real é pior.** Ele **é** um véu de verdade (`fixed inset-0 z-50`,
   `grade-de-batalha.jsx:581`). Mas *(medido a 1280×720)* é uma coluna centrada
   com `overflow: visible` e o conteúdo não cabe: **o próprio título fica em
   `top = −184`, fora da tela**; o tabuleiro em `top = −160`, ou seja **160 dos
   490 px (33%) do campo estão acima da borda da janela**, e **o véu não rola**.
   O campo ocupa 490×490 de 1280×720 = **26% da tela**, num ecrã cuja única
   função é mostrar o campo. **O controle que promete "tela cheia" mostra MENOS
   campo do que promete.** **E a segunda metade da correção é do próprio `jogo`,
   sobre si mesmo:** ele tinha-o listado entre os controles sem rótulo, e **o
   `⤢ ampliar` não é mudo** — traz a palavra "ampliar" escrita ao lado do glifo
   (`grade-de-batalha.jsx:571`). **O defeito dele não é ser mudo: é mentir.** Sai
   da lista dos sem rótulo e fica nesta.
6. **"`9 de 9 m nesta rodada` — nunca andei um metro" — errado. Ele andou.**
   *(medido, dois cliques em casas alcançáveis)*: `👣 Você vai de no beco
   estreito para sob a arcada — 7,5 m gastos, restam 1,5 m.` **O movimento
   funciona, cobra o caminho e nomeia os lugares.** **Quem mente é o medidor**, e
   de duas formas: o segundo passo gastou 6 m quando só deviam restar 1,5 (o
   orçamento reinicia a cada passo) e o chip **nunca saiu de `9 de 9 m`**. A
   causa está à vista no tratador do movimento — `const novaEco = eco ? { ...eco,
   movM: sobra } : eco;` —: **quando a luta não tem `economia`, o movimento
   gasto é deitado fora**, e a luta da chave (`App.jsx:21199`) não traz o campo.
   **É defeito de regra e é do `backend`.** E muda o pedido de desenho: não é
   *dê ao jogador uma forma de se mover*, é **faça o medidor dizer a verdade** —
   e é mais barato.
7. **Os controles mudos são mais do que a varredura acha.** A varredura só pega
   os que cabem numa linha: **15 sem rótulo, 9 completamente mudos**. À mão, o
   `jogo` achou **pelo menos mais 8** em linha composta. **O número honesto é
   ≥23**, e quem contar por script outra vez vai voltar a achar 15.

**E uma que o `desenho` escreveu errado, corrigida pelo `jogo`:**

8. **"o cabeçalho tem cinco glifos" — são quatro.** `App.jsx:20404, 20417,
   20418, 20419`: **a caneca, `⛺`, `🎲`, `📜`**. O `⤢` vive no tabuleiro, o
   `↓` na barra do log (`App.jsx:21239`) e o `🔊` em cada mensagem do Mestre
   (`App.jsx:20493`). A correção importa porque a decisão que sai daí é de
   lotação: com o `🎲` a mudar de endereço, **o cabeçalho fica com três**.

**E as duas que D3 já tinha derrubado, repetidas para não voltarem:**

9. **"a grelha não é clicável" — errado.** Cada casa alcançável é
   `role="button" tabIndex=0` com `onMover` (`grade-de-batalha.jsx:512-517`).
   **Confirmado ao vivo: 86 alvos.** O clique funciona; **o que falta é forma.**
10. **"os bloqueados continuam clicáveis" — errado.** **33 dos 36** têm
    `disabled`. **O defeito é o silêncio**, não o clique fantasma.

**Uma menor, para não virar folclore:** D1 escreveu *"o campo de 16×16"*. Na
luta jogada o campo era **14×14** *(medido)*. O tamanho varia com o lugar; 16×16
é um caso, não a regra.

---

## O que ficou — e o buraco, declarado

**O `jogo` não jogou um único turno narrado.** O Narrador está sem quota — a
mesma frase de D1, inteira na tela: *"Limite diário alcançado (500 chamadas)."*
O combate foi medido **com o Mestre calado** (a luta de chave abre pelo sistema,
localmente), e tudo o que este arquivo diz sobre **o turno** — o `Agir →`, a
espera, o veredito do dado, a pílula do log — saiu de código e de uma tela
parada, **não de turno vivido**.

**E a sala ao vivo não foi medida de todo** — precisa de duas abas e do Mestre
vivo. A forma dela está decidida aqui **sem ter sido vista viva**, e está aqui
com a ressalva escrita em vez de sem ela.

**Cobertura com buraco declarado vale mais que cobertura fingida.** Quem
construir a partir deste arquivo precisa de saber exatamente isto: a lista da
sala não foi vista a funcionar, e o turno narrado não foi jogado nesta fase.

**O placar do veredito, para quem quiser saber o que foi conferido e o que
passou direto.** O `jogo` julgou as 21 formas do `desenho` uma a uma, com uma
pergunta só — *ela serve ao momento em que o jogador a encontra?* **Treze
passaram sem ressalva. Sete passaram com ressalva de momento** (e as ressalvas
estão dobradas nas formas, ao lado da forma, para a fronteira de autoria ficar
legível). **Uma foi reprovada, e no lugar, não na peça**: o interruptor `🎲` no
cabeçalho. Das cinco peças novas, **as cinco foram aprovadas como peça**, e a
correção do *Impedido* de D3 passou sem uma vírgula de reserva.

**O resto do que fica, e de quem é:**

- **A pergunta que expira** — pedida por nome e **deliberadamente não
  fabricada**: é o coração de uma proposta `pesado` que espera a pessoa, e
  fabricar peça para decisão que não foi tomada é inventar trabalho. O que ela
  teria de fazer está escrito na forma *reagir ao golpe que chega*, para que no
  dia do "sim" ninguém comece do zero. É do `desenho`.
  *(**Paga em E1 e terminada em K1.** O "sim" veio a 15/09; a peça existe em
  `31:518` com 8 variantes, e a especificação que D4 deixou escrita foi lida de
  volta linha a linha em vez de se começar do zero — que era exactamente para isto
  que ela tinha sido escrita.)*
- **O Code Connect** — **15 peças sem nó**, e o que impede a biblioteca de
  divergir do código em silêncio continua a ser um script que alguém tem de
  lembrar de rodar. É plano de conta: **item da pessoa**.
- **O orçamento de movimento** que não é escrito de volta quando a luta não tem
  `economia`, e o `REVANCHE` que **não faz revanche**. **Regra, não forma: são
  do `backend`**, e estão registados aqui só para não se perderem.
- **`reacoes.js:96` sorteia com `Math.random()`.** A lei da casa é
  **determinismo por semente**, e a escolha da reação hoje não a cumpre. É do
  `backend`, e é **pré-requisito** da janela da reação: uma pergunta que expira
  sobre um sorteio não determinístico não tem catraca possível.
- **O `⛺` não escreve no log o que fez.** A peça resolve a pergunta antes; **o
  silêncio depois é fiação**, e é do `frontend`.
- **`bloqueado` apaga quatro painéis que não têm nada com a rolagem**
  (`App.jsx:20384`). Fiação, vai com G2.
- **`JetBrains Mono` continua sem peso 600 no Figma** (Regular/Medium/Bold). As
  peças usam Bold — é uma diferença real entre o que o navegador desenha e o que
  o Figma desenha.

---

## A catraca do desenho (decidido em D5 · 15/09)

D4 escreveu 30 formas e D3 fez a biblioteca; nada disso obriga ninguém a nada.
`testes/check-formas.mjs` é o que faz a Fase D valer **para sempre** em vez de
valer hoje: três dentes, cada um o único a pegar o seu caso, e cada um verde no
dia em que nasceu.

- **D5a — quantidade.** A cor **nova**, de qualquer forma e qualquer valor. É o
  único dente que segura o pergaminho e o dado de jogo, que não têm uma única
  cor de `T`. Teto por arquivo, **332 hoje**.
- **D5b — qualidade.** A cor **duplicada**, mesmo quando a contagem não mexe: é
  o único que morde a troca 1-por-1 de um hex de pergaminho por `#E8A33D`.
  **80 hoje** — e 80 é, exatamente, o item da pauta que o zera.
- **D5c — o movimento.** Toda classe de `MOVIMENTO_CSS` que declara `animation`
  tem de aparecer no `prefers-reduced-motion`. **13 classes, 3 com saída.**

### A lei que a catraca carrega: folga zero, nos dois sentidos

A asserção não é `medido <= teto`, é **`medido === teto`**; em D5c, igualdade
de **conjuntos**. Um teto é um retrato datado da dívida, não um alvo — com `<=`
ele vira orçamento, e o dia em que alguém volta a pôr cinquenta literais a
catraca aplaude. Com igualdade, o número na tabela é **sempre verdade** e pode
ser citado sem ninguém ir medir de novo.

Daí a regra **anti-cemitério**, que é o que separa uma lista de perdão de um
cemitério: **um perdão que já não é preciso FALHA a catraca.**

- `PERDÃO MORTO: .tv-fade já está no prefers-reduced-motion. Tire-a da lista.`
- `ENTRADA MORTA: <arquivo> tem teto 0. A dívida foi paga — tire a linha.`
- `DESCEU: <arquivo> tem 90, o teto é 93. A dívida encolheu; desça o teto:` — e
  **imprime a linha pronta para colar**. É a única falha do projeto que é uma
  boa notícia, e o texto diz isso.

A válvula é escrita, não secreta: um teto pode **subir** com motivo e data na
própria entrada. Não é licença, é custo — a linha aparece no diff, e a pessoa
pergunta. O que a catraca proíbe é subir **calado**.

### Zona não é perdão

`src/estilo.js` **é varrido** — *"uma catraca que perdoa a própria tabela não
protege nada"*. Mas varrê-lo inteiro faria **acrescentar uma cor nova a `T`
ficar vermelho**, e uma paleta que não pode crescer é sagrada, que é o oposto
da lei da casa. O recorte é por **zona**, não por arquivo:

| zona | D5a | D5b |
|---|---|---|
| `T` | isenta | isenta |
| `MATERIAIS` | isenta | **VARRE** |

D5b varre `MATERIAIS` porque **sem isso a zona seria uma lavandaria**: bastava
mover a duplicata para dentro dela e ela ficava perdoada. O dia em que
`cartazTopo` for `#171322` é o dia em que a paleta física virou um alias da
semântica com outro nome. Medido: `MATERIAIS` duplica **zero** cores de `T`.

**Perdão é dívida — tem data e o item que a paga. Zona é lei — não tem nenhuma
das duas.**

### Discordância resolvida: a cor de dado de jogo (`desenho` × `jogo`)

**O lado do `desenho`.** Dos 99 literais que são byte a byte uma cor de `T`,
**19 vivem nos módulos de dado** (`semente.js`, `mapa.js`, `npcs.js`,
`palco.js`, `devocao.js`). `npcs.js: rival` = `#E8A33D` não é dado, é `T.amber`
com outro nome — a cor de acento da interface copiada à mão para dentro de uma
tabela de jogo. Trocar a paleta amanhã deixaria os rivais âmbares num jogo que
já não é âmbar. D5a pode ignorar a diferença; D5b não pode.

**O lado do `jogo`.** Os seis patamares de devoção são uma **rampa** que o
jogador lê de uma vez — Santa, Devota, Simpática, Indiferente, Herege, Hostil.
Se `Devota` virar `T.amber`, no dia em que a Fase L esquentar o âmbar por
contraste **o patamar muda de cor sozinho** e a rampa deixa de ser rampa.
**Coincidir hoje não é depender.** E a alternativa — 20 perdões escritos no dia
do nascimento — é *"inventário com outro nome"*, que foi exatamente o
diagnóstico que reescreveu D5.

**A decisão do `regente`: ganhou o `jogo`, e o `desenho` ganhou a outra
metade.** Os módulos de dado ficam **fora de D5b por escopo, não por perdão** —
e continuam **dentro de D5a**, que segura o tamanho: uma cor nova solta lá
dentro faz o número subir, e sobe com motivo escrito.

**A confirmação de que o recorte é o certo veio do número:** 99 − 19 = **80**,
exatamente o item da pauta que paga D5b. O dente e o item que o paga passaram a
medir a mesma coisa — o que não acontecia com 99.

### A saída não é o nome (a condição que D5c carrega)

O `jogo` injetou `animation: none` nas 13 classes e **jogou com elas**. O
achado muda o que a lista de perdão significa, e por isso quatro entradas
nascem com "a saída não é `none`" escrito:

- **`.tv-agonia` é inocente** — era a suspeita da pauta, e não é. Quando
  `grave`, `App.jsx:20971-20972` já põe `border: 1px solid T.danger` estático,
  o anel do retrato, o rosto e a barra de PV rotulada com o número: quatro
  afirmações **paradas** de "você está morrendo". O pulso é a quinta. Parado, o
  jogador ainda sabe.
- **`.tv-dice` é a culpada, e foi pega na tela.** A troca de número é
  **JavaScript** — `setInterval` de 70 ms por 1200 ms (`App.jsx:486`) — e
  `prefers-reduced-motion` não a toca. O tremor era a **única** coisa que dizia
  "ainda rolando", e numa falha com `dc != null` o fundo do resultado é idêntico
  ao do rolando. O `jogo` fotografou um hexágono imóvel com **19** (que
  passaria) que um segundo depois era **6** e "Falha". Para quem pediu menos
  movimento, `animation: none` **deixa a pisca e tira o sentido** — é
  estritamente pior. Condição: sob movimento reduzido o dado **não pisca**;
  mostra um "rolando" parado e revela o valor de uma vez.
- **`.tv-faixa` e `.tv-flutua`** terminam em `opacity: 0` e só não ficam
  grudadas porque um `setTimeout` as remove (3200 ms e 1400 ms). E **`.tv-vira`**:
  o verso nasce em `rotateY(180deg)`, e `none` deixa a carta de subida de nível
  **de costas, para sempre**.

**A regra, e é condição escrita, não nota de rodapé:** *a saída por movimento
reduzido pousa no estado **final** da animação, nunca no inicial — e onde é a
própria animação que faz a coisa sumir, a saída não pode ser `none`.*

### Os buracos, declarados com número

Um buraco escrito é dívida; um buraco calado é mentira. A catraca **não** pega:

- **nome CSS** (`white`, `black`): **1** ocorrência no escopo inteiro
  (`ui.jsx`, `stroke="black"`). Um dente para uma ocorrência é decoração, e o
  regex morderia prosa.
- **`transition` fora do `estilo.js`: 18** — a barra de vida 500 ms
  (`App.jsx:21003`), PV/PM 300 ms, a cor do dado 400 ms. Atributo inline; o
  `@media` da folha **não o alcança**.
- **o contraste** — `#fff` sobre `T.danger` dá 3,42:1 e reprova o AA
  (`App.jsx:2541`), e **nenhum dos três dentes o vê**: `#fff` não é cor de `T`,
  logo D5b é cego, e trocá-lo por outro branco qualquer passa por D5a. É o mais
  caro dos quatro buracos. Contraste é conta de **cor**, não contagem de
  **texto** — mede um par (tinta, fundo) que teria de ser inferido do JSX, sete
  níveis acima, e isso é outro varredor, não um quarto dente deste.
- **animadores em JS: 2** — o d20 cuspindo 17 números por segundo
  (`App.jsx:486`) e a ficha andando 55–110 ms por passo
  (`grade-de-batalha.jsx:265`). E a casa **já tem o padrão e usa-o uma vez só**:
  `ui.jsx:589`, `CampoDeBrasas`, com `window.matchMedia` — aplicado à
  **atmosfera**, e não às duas coisas que carregam informação de jogo.

### Correções medidas à pauta

- **O pergaminho não tem irmãs.** A pauta dizia que `rosto.jsx` e
  `carta-taro.jsx` eram parentes da paleta de mapa. **São escuros**, e são
  dívida comum: `rosto.jsx` tem `#EAE4D6` (= `T.ink`) e `#7A1F1F`
  (= `CABELO[8]`, cor de **dado** copiada para dentro da interface);
  `carta-taro.jsx` carrega **8 cores de `T` exatas** e é o depósito mais rico de
  D5b fora do `App.jsx`.
- **E o pergaminho é sistema, provado por um acaso impossível:** **10 hexes
  aparecem nos DOIS arquivos, escritos separadamente, e cobrem 52 dos 71 usos**
  (`#5C4A30` a tinta ×11, `#F0E6CC` o papel ×10, `#EADFC1`, `#6D5C40`,
  `#B4322E`, `#3A2E1C`, `#C9A45A`, `#A08A5E`, `#8D7A56`, e a família do mar).
  Dívida acidental não concorda byte a byte em dois arquivos. A casa dele não é
  `T` (que é semântica, e não deve crescer para `papel`, `tinta`, `estrada`,
  `mar`, `selo`) — é **`MATERIAIS`**, a paleta física, onde a cortiça já mora.
  São **2 arquivos, 71 literais, ~11 tokens**: mais barato de declarar do que a
  pauta supunha.
- **`⤢ ampliar` já não é mentiroso.** D1 e D4 escreveram que ele *"abre outro
  bloco dentro do mesmo scroller clipado"* e *"corta 33% do campo"*. Hoje abre
  uma sobreposição de tela inteira com o campo 14×14 inteiro, legenda explícita
  e casas clicáveis — o `jogo` **andou, de 20 m para 12 m, clicando**. O que
  continua quebrado é o **veredito**: o orçamento de movimento não aparece
  dentro da sobreposição, e o preço chega depois, no log.

---

## A tela da batalha (decidido em E1 · 15/09)

**A primeira tela que esta mesa desenha inteira**, e a primeira que nasce no
Figma antes de existir em código. O `jogo` compôs (página `A batalha`, nó
`30:12`); o `desenho` fabricou as peças, uma página cada. Nenhum `.jsx` foi
tocado: **E1 é desenho, E3 é que constrói.**

O pedido da pessoa, palavra por palavra (14/09): *"uma tela para a batalha,
pois é um momento importante e a maioria das outras funções ficariam
inúteis — quando entrar em batalha, uma tela só com o grid e as funções de
batalha e utilitários"*; e *"nosso grid pode ter letras e números, tipo um
tabuleiro de xadrez, então se um player disser 'vou até H20' não teria a
confusão que 'me aproximo do…' causa"*.

O detalhe de cada decisão, com a conta inteira, vive em `mente/e1-jogo.md`
(o momento) e `mente/e1-desenho.md` (a forma). Aqui fica o que é **lei**.

### Três coisas que se souberam ao medir, e que mudam a pergunta

1. **O campo não é 16×16 — são dez plantas.** `grid.js:168-261`: 12×9, 7×18,
   16×16, 18×12, 14×14, 14×14, 16×14, 10×16, 16×16, 18×14. Máximo 18 de
   largura e 18 de altura; a proporção vai de **0,39** (masmorra) a **1,50**
   (estrada). **Todo desenho desta tela mede contra as dez, nunca contra uma.**
2. **Os 429 px não são altura, são arquitetura.** `PainelCombate`
   (`App.jsx:20510`) é montado **dentro** do rolador do log (`:20459`), depois
   de todas as mensagens. O tabuleiro é **filho do log**, e por construção fica
   sempre no fim dele. Nenhum ajuste de altura resolve; só a inversão resolve.
   **É a condição de entrada de E3.**
3. **A gramática do endereço já existe, e não pode nascer uma segunda.**
   `src/coordenadas.js:151`: `LETRAS_DA_GRADE = "ABCDEFGHIJKLMNOPQRST"` e
   `gradeDe()` devolve letra + (linha+1) — **A1 no canto superior esquerdo**,
   sem letra saltada. É a grade do ermo, mas é a mesma pergunta e já tem
   resposta escrita. **O tabuleiro lê desta tabela**, e é o cuidado que E2 já
   trazia: a conversão é regra, sai de tabela, é provável em Node.

### A geometria: duas colunas, e quem cede é a janela — nunca o alvo

**O piso não se negocia: a casa mede 48 px.** É a decisão de D4, e o número tem
três origens que concordam — WCAG 2.5.5 (AAA) 44×44, Apple HIG 44 pt, Material
48 dp. **48 é o menor que passa nas três**, e **nenhum dos quatro tamanhos de
hoje lá chega**: 23,8 px no embutido 16×16, 27,1 no embutido 14×14, 36,6 no
ampliado. *Quem encolhe é o campo visível, nunca o alvo* — o tabuleiro passa a
ser uma **janela sobre um campo**, que rola e arrasta. É a inversão exata do que
está lá hoje.

**O arranjo saiu de uma conta, não de um gosto.** Os três possíveis, medidos
contra as dez plantas:

| arranjo | altura útil do campo | plantas inteiras |
|---|---|---|
| pilha de largura inteira | 574 px → 11,95 casas | **1 de 10** (e a 18×12 falha **por 2 px**) |
| verbos e tira à direita | 710 px → 14,8 casas | 6 de 10 |
| **duas colunas** | campo **888 × 828** | **9 de 10** |

**Duas colunas, e a razão é de ofício:** em 1280×860 *"mais de metade da tela
fica preta"* à direita — **o eixo que sobra é o horizontal e o que falta é o
vertical**, e empilhar gasta o escasso para poupar o abundante. *1 de 10 contra
9 de 10 não é preferência, é uma ordem de grandeza.*

```
respiro 16 │ a coluna do campo 888 │ goteira 16 │ a lateral 344 │ respiro 16
           └ régua 22 + janela 866×806 = 18 colunas × 16 linhas
```

- **1248 dos 1280 px são conteúdo**, contra os **560 px à esquerda com mais de
  metade da tela preta** de hoje. E o que mudou não foi só a percentagem: foi
  **para onde a largura vai** — antes para uma coluna estreita ao lado de um
  campo espremido, agora para um campo que não rola.
- **Nove das dez plantas aparecem inteiras, sem rolar nada.** Só a masmorra
  7×18 transborda, e transborda **58 px — uma casa e um quinto**.
- **O cabeçalho saiu**, e foi a própria lei da tela a cobrá-lo: *nada nesta tela
  diz que ela é uma tela*. A marca e o `✓ salvo` são moldura, não jogo, e
  custavam 48 px de altura ao campo.
- **No telefone: janela 337×528 → 7 colunas × 11 linhas = 77 casas**, sempre as
  certas, porque a câmara enquadra o herói na **área livre**. Escrito sem
  eufemismo: **nunca o campo inteiro** — 16 × 48 = 768 e o telefone tem 375, e
  **nenhum desenho faz caber**. A alternativa era encolher o alvo abaixo do piso
  de acessibilidade, e essa não é uma alternativa.
- **Existe um "ver tudo", e ele é para OLHAR, nunca para TOCAR.** As casas caem
  para 20–28 px e **deixam de ser alvo**. Como o jogador sabe, sem ninguém lhe
  dizer: *no nível de leitura nada está aceso* — some o contorno do alcance,
  some o custo dentro da casa, some o realce da régua. **A regra vale nos dois
  níveis: o que é alvo tem o custo escrito dentro; o que não tem nada escrito
  dentro não é alvo.**

**As regras de enquadramento, que são o que impede a janela de virar armadilha:**

1. **Quando a luta abre, a casa do herói está no centro da área livre** — a
   janela menos a tira dos verbos, para o herói ficar fora da faixa que o
   próprio polegar tapa. *Um tabuleiro que rola e abre no lugar errado é pior do
   que um que não rola.*
2. **A câmara só se move quando é obrigada** — reenquadra quando quem age
   chegaria a **menos de uma casa da borda**, nunca a cada passo. *Uma câmara
   que corrige todo passo faz o campo parecer escorregar debaixo do jogador.*
3. **Na vez de um inimigo do outro lado do campo, a câmara NÃO vai atrás** — a
   borda ganha a marca com o nome e a distância. *Arrancar o campo debaixo de
   quem está a planear é a coisa mais desorientadora que uma tela tática faz.*
   **Uma exceção, e só uma: se a ação do inimigo alcança o herói**, porque aí o
   que aconteceu é sobre ele.
4. ***Confirmando* não é para todo passo.** O segundo toque só existe quando o
   ato custa alguma coisa além de si mesmo. **Passo limpo é um toque; golpe
   limpo também.**

### As seis regiões, nomeadas pelo que o jogador faz nelas

| região | o que o jogador faz ali | o que NÃO entra |
|---|---|---|
| **de quem é a vez** | sabe se pode agir agora | o nome do sistema de iniciativa |
| **o campo** | olha, escolhe a casa, anda, mira | tudo o que não é a luta |
| **o veredito** | lê o preço do que está prestes a fazer | histórico, contabilidade |
| **o que você faz** | dispara a ação | Persuadir, Enganar, Procurar, Ajudar, Intimidar |
| **quem está de pé** | sabe quem aguenta e quem cai | fichas completas, bolsa inteira |
| **o que acabou de acontecer** | lê a cena | o log inteiro |

**A ordem de leitura é a ordem do turno:** *de quem é a vez* → *o campo* → *o
veredito* → *o que você faz*. É a frase que o jogador pensa: «é a minha vez;
onde estou; o que isto custa; eu faço». As outras duas são consulta, e por
isso ficam **fora** dessa linha, não no meio dela.

**A regra da recomposição, de 1280×860 para 375×812: cada região mantém o
mesmo vizinho.** Região que troca de vizinho obriga a reaprender, e reaprender
é da pessoa — não da mesa.

### A região que quase não entrou, e é lei da casa que entre

A leitura literal de *"uma tela só com o grid"* **mata a narração**. A decisão
do `desenho`, registada como decisão e não como pedido: **a narração fica.** A
prosa é a protagonista — é a primeira frase do `CLAUDE.md` traduzida em
interface. Fica **encolhida ao mínimo honesto**: no monitor as duas últimas
linhas do Mestre, sempre visíveis; no telefone **uma**, que abre por cima ao
toque. O número que a sustenta: Spectral 15 px com entrelinha 1,625 dá
**24,4 px de linha** — duas linhas mais respiro são 84 px, uma linha são 28.

### O que some durante a luta, e o critério é duro

Inventário, mapa, diário, códex, guilda, domínios, gestão, ascensão, **o
trilho de abas inteiro**, `Examinar`, `Tempo`, `⛺ acampar`, `📜 crônica`.

**O critério: um controle que, tocado no meio de uma luta, ou não faz nada ou
termina a luta, não pode estar na tela da luta.** `Tempo` passa horas, `⛺`
acampa, o mapa viaja. *Um controle que não pode ser usado ensina o jogador a
desconfiar da barra inteira, e desconfiar da barra custa o turno seguinte.*

O ganho de graça no telefone: sem trilho de abas, voltam os **76 px** que
`.tv-espaco-abas` reserva (`estilo.js:245`) — **uma casa e meia**.

**E a lei da casa aplicada à letra: nada nesta tela diz que ela é uma tela.**
Sem título "modo batalha", sem selo "em combate", sem botão "sair do combate".
*O jogador sabe que está numa luta porque a luta é o que está na tela.*

### A entrada é automática; a saída é confirmada — e as duas têm número

- **Entrada automática**, porque um gesto pode ser **recusado**, e quem recusa
  fica exatamente no estado medido: tabuleiro 429 px abaixo da borda,
  `scrollTop = 0` de 1129 possíveis. *Um convite que se pode declinar é um
  convite que devolve o jogador ao defeito.*
- **Saída confirmada, e durante a luta não há porta nenhuma.** O motivo é
  medido: o `⛺` **encerrou uma luta por engano** numa partida do `jogo`. No fim
  há **uma** porta, larga, onde antes não havia nenhuma. Uma porta a menos
  durante, uma porta a mais depois.

### O endereço de xadrez

- **Colunas por letra (A…R — 18 é o máximo que existe), linhas por número
  (1…18).** Letra primeiro, número depois, porque foi assim que a pessoa
  escreveu: *"H20"*.
- **A régua é permanente, em duas bordas — topo e esquerda.** Não nas quatro:
  duas bastam para ler um par, e as outras duas custariam 40 px de campo em
  375 px, que é quase uma coluna de casas.
- **A régua é presa à JANELA, não ao campo.** Quando o campo rola, os rótulos
  mudam e a régua fica colada à borda. *Uma régua que rola para fora é uma
  régua que desaparece no momento exato em que serve.*
- **Mono Bold 12 px (toque) / 11 px (ponteiro)** — HIG 11 pt, Material 11 sp; e
  **mono porque `I`/`O` contra `1`/`0` só se desempatam em mono**. É escolha com
  fonte citada, e **não constrói a escala da Fase L nem a contraria**.
- **A régua é `aria-hidden`; o endereço vive no nome da casa** — quem ouve a
  tela ouve `H20`, e não duas listas de rótulos soltos.
- **Cada quarta linha da malha é um grau mais clara.** É a coisa mais barata
  que troca *"contar da borda"* por *"contar da linha grossa mais perto"* — o
  que o xadrez ganha das casas alternadas e este tabuleiro não pode ter, porque
  o chão já carrega o terreno.
- **O endereço escrito dentro da casa só nos dois estados que já carregam
  texto** — *Sob o dedo* e *Confirmando*. *86 endereços acesos ao mesmo tempo é
  a planilha.* No telefone, onde *Sob o dedo* não existe antes do toque, o
  endereço tem segunda casa: **a linha do veredito lê sempre o endereço do alvo
  armado.**
- **Ele serve aos dois caminhos, e a régua é o que os liga:** o jogador **lê
  `H20` na borda e escreve `H20` na caixa**. Não precisa de mais nada da tela.
- **Ao `backend`, em E2: o log tem de escrever o endereço de volta** —
  `você avança até H20`, e não `você avança`. *Um endereço que o jogo nunca usa
  é um endereço que o jogador nunca aprende*, e isto custa uma string: é o
  ensino mais barato que existe.
- **Condição do `desenho`:** os endereços do **mundo** e do **tabuleiro** nunca
  aparecem na mesma tela. Mesma gramática, duas grades — vê-las juntas é
  aprender que `H20` tem dois significados.

### Os verbos que disparam a ação (a tela é desenhada para depois de X2)

**O fato que muda o conteúdo desta tela:** `Atacar` não ataca — ele faz
`setEntrada("Ataco ")`. Dos 20 botões de `Ações`, os 12 de cima só digitam, e
**nenhum dos 8 que entram no motor é de combate**. X2 corrige isso no motor;
**E1 desenha para o jogo que vai existir.**

- **Seis verbos, posições fixas, sempre os mesmos seis.** Fixo porque *uma
  fileira que muda é uma fileira que se lê todo turno, e uma que nunca muda
  aprende-se em duas lutas e usa-se sem olhar*. **A lista é do `jogo`** (é
  composição e momento): `Atacar`, `Mover`, `Esquivar`, `Empurrar`, `Derrubar`,
  `Saltar` — e **`esperar`** separado por uma goteira, `Papel=Recuo`, que é a
  posição do Recuo em toda a casa. *(O `desenho` chegou a nomear `Correr` e
  `Esconder` ao contar a altura da fileira; a contagem é dele, a lista é do
  `jogo`, e fica esta — para não haver duas listas.)*
- **`Atacar` é o único `Papel=Chamada` da tela.** Hoje a distinção dele é *uma
  cor de borda entre doze botões iguais*; aqui é **tamanho e preenchimento**.
  No telefone a diferença deixa de ser "maior" e passa a ser **outra escala**:
  235 px contra os 110–127 dos outros.
- **`Habilidades (✦)` é uma gaveta, não um verbo** — é uma **lista** que varia
  por classe, por nível e por PM, e *lista nunca entra em fileira fixa*: no dia
  em que o mago aprende a sétima magia, a fileira deixa de ser fixa.
- **Três fileiras de 44 px no telefone, e todas com a palavra inteira.** A
  fileira única não fecha: seis rótulos em 359 px pedem ~52 px cada, e
  `Empurrar` em 52 px **não é um rótulo, é um glifo mudo** — um verbo de combate
  que só se lê pelo símbolo é o sistema a falar por sinais.

### O veredito antes do clique, sobre o tabuleiro

**Uma `Consequencia` *fixação=Linha*, colada sob a fileira, sempre presente,
24 px. Nunca balão** — já estava fechado que sobre o tabuleiro a Consequência é
sempre *Linha*, porque **quatro segundos de balão tapam exatamente as casas
para onde o jogador ia andar**.

A sequência, e é a mesma nas duas plataformas:

1. **tocar sem largar / pairar o verbo** → a linha enche com o preço geral, e o
   campo pinta o conjunto que aquele verbo alcança;
2. **largar / clicar** → o tabuleiro entra na mira daquele verbo;
3. **tocar uma casa** → a linha lê o alvo: **`H20 · 4,5 m · custa um golpe
   livre`**;
4. **resolver** — e a lei do passo limpo estende-se ao golpe: **um golpe limpo
   num alvo já ao alcance é UM toque.** O segundo toque só existe quando o ato
   custa algo além de si mesmo. *Dois toques por ato transformam o tabuleiro
   num formulário* — é a mesma frase que já governa o passo.

**Cancelar uma mira tem três saídas, as três vivas ao mesmo tempo:** `Esc` (e o
gesto de voltar, no telefone), tocar o verbo outra vez, ou tocar o campo fora
do conjunto armado. E **o estado armado nunca é mudo**: enquanto há mira, a
linha termina com **"toque fora para desistir"**. *Um véu sem saída que não diz
que tem saída é a armadilha que a peça `Véu sem retorno` existe para impedir —
e aqui ela estaria montada por acidente.*

**O `Botao` não escreve preço, e isso ficou decidido por escrito** — uma
discordância do `desenho` com o `desenho`: o nó *"a razão"* do `Botao` existe só
em `Esperando` e `Impedido`, as 12 variantes em que ele **recusa**, e está certo
onde está. **A razão do Botão é a razão da RECUSA; o preço de uma ação que
funciona é sempre `A Consequência`, instância própria, presa ao botão.** As duas
verdades coexistem na mesma tela (*"custa 2 PM"* **e** *"o Mestre está a
escrever"*), e dobrá-las numa fenda só obrigaria quem monta a escolher qual
delas mostrar.

### Onde vive a ordem da vez

**Uma faixa horizontal no topo da área do campo, largura inteira, 56 px (48 no
telefone).** As três alternativas caíram com motivo: **coluna lateral** rouba
largura, e a largura é o eixo escasso (em 375 px, 96 px de coluna tiram duas
colunas de casas de sete); **por cima das casas** não, porque *o tabuleiro é a
única superfície que nunca pode carregar moldura — ali o pixel é informação de
jogo*; **dentro de um painel que se abre** não, porque *"de quem é a vez?"* se
pergunta várias vezes por turno, e **uma resposta atrás de um gesto é uma
resposta que se deixa de procurar**.

- Um `Selo de estado` por combatente, na ordem, com o **nome escrito** — nunca
  cor sozinha (WCAG 1.4.1). Quem age leva ***Mudou=Agora***, três pulsos, e para.
- **Seis cabem em 375, catorze em 1280.** Com dez ou mais a faixa rola na
  horizontal — e **o selo do herói fica fixado na ponta esquerda e nunca sai**.
  *A única coisa que ninguém pode ter de procurar rolando é a sua própria vez.*
- **Quem cai sai da faixa**, e não fica riscado: *uma luta de dez inimigos com
  sete caídos seria uma faixa de cadáveres a empurrar os vivos para fora do
  olhar.*
- **O rótulo não é `ORDEM DE INICIATIVA`: é `agora: Halvard`.** Se o trabalho da
  faixa é responder àquela pergunta, ela pode dizer a resposta — e é a lei de
  que o sistema não fala de si mesmo, aplicada a um rótulo.
- **O jogador sabe que é a vez dele por três canais, e nenhum é a palavra:** o
  selo dele acende; **o tabuleiro acende** (o contorno do alcance só existe no
  turno dele, e o código já o produz); e os verbos ficam vivos — na vez de outro
  cada verbo é `Botao` *Esperando* com a razão escrita **"é a vez de Halvard"**,
  o nome dele e não o nome do mecanismo.

### O celular, onde a mão tapa o tabuleiro

É **critério de entrada**, não apêndice — a pessoa citou a plataforma como
régua (Fase L).

- **Os controles em baixo, o campo por cima:** a mão tapa a tira, que é o que
  ela está a tocar, e não o campo.
- **O arco do polegar** numa pega de uma mão em 375×812 chega aos ~520–560 px
  de baixo. As tiras vivem nos 144 px de baixo, fundo no arco. **O terço de
  baixo do campo também está dentro do arco** — e é por isso que o
  enquadramento põe o herói no centro da **área livre** e não no centro
  geométrico: empurra-o para fora da zona que o próprio polegar tapa ao tocá-lo.
- ***Sob o dedo* não existe antes do toque**, logo **zero informação de combate
  depende de `hover`**. Hoje a rota prevista só existe em `onMouseEnter`
  (`grade-de-batalha.jsx:543`) e a única descrição da casa é um `<title>` de
  SVG: **dois canais de rato, num jogo que se joga com o dedo.**
- **O texto livre no telefone é um botão (`❝`), não um campo** — aberto, o
  teclado tapa metade do campo de qualquer maneira.
- **A tela roda, e nunca é forçada.**

### O texto livre continua, e muda de papel

Deixa de ser uma barra a competir com os verbos e passa a ser uma linha única
por baixo deles, 44 px — e o convite muda de `"O que você faz?"` para
**`como? (opcional)`**. O que ele escreve já não decide **se** o golpe
acontece; diz **como**, e viaja como `motivo`, exatamente como
`declararAcaoRapida(id, motivo)` já faz hoje com os oito de baixo. *A frase
deixa de ser a sintaxe obrigatória e vira o tempero.*

**Duas regras vêm com isso:** o campo **nunca é `disabled` enquanto há um verbo
armado** — escrever e mirar são compatíveis, e é esse o ponto inteiro —, e no
telefone ele fica colapsado em 44 px que só crescem no foco.

### O lugar da reação (Fase K) fica reservado hoje, e a reserva é um número

**A reação mora na linha do veredito**, a faixa entre o campo e os verbos. Três
razões: ela **já existe em todo estado da tela** (uma peça que aparece do nada
tem de arranjar lugar; uma que cresce de uma linha que já estava lá não empurra
nada); está **dentro do arco do polegar**, e a reação é a única coisa desta tela
com relógio a correr; e é o **sítio certo por significado** — entre o que acabou
de acontecer e o que se pode fazer.

**A regra, e ela é dura: a pergunta SOBREPÕE, nunca EMPURRA.** *Empurrar move as
casas que o jogador estava a ler no exato segundo em que ele tem de decidir
depressa — é a pior coisa que se pode fazer a uma janela com relógio.* Ela nasce
colada à linha do veredito e cresce **para cima**, ancorada em baixo: o topo do
campo nunca se mexe, e **a câmara nunca se mexe**.

**A reserva, dita como restrição para quem construir:** *o terço de baixo da
janela do campo é território emprestado — nenhum elemento desta tela pode
depender de estar visível ali.* Com esta frase escrita hoje, a terceira batida
não nasce enfiada num canto daqui a duas fases.

**K1 ocupou a reserva, e sobrou quase tudo** (medido com o campo por baixo, no
quadro de 375×812). O campo vive de y 48 a 598 — 550 px, **onze filas**; o cartão
ancora em baixo, em y 764, no topo da tira do herói:

| o que abre | altura | abre em | tapa do campo |
|---|---|---|---|
| `Etapa=Direta` (o caso comum) | 118 | y 646 | **zero** — morre dentro da barra dos verbos |
| `Etapa=Escolhendo`, duas reações | 215 | y 549 | **49 px — uma fila de onze** |
| o tecto de cinco linhas | 323 | y 441 | 157 px / três filas — **e é inalcançável** |

**O tecto não acontece:** em `sofre_dano` os `exigeTipo` são disjuntos, logo o
máximo por classe é **1 + Contramágica da ficha = 2**.

**E o cartão cobre a barra dos verbos de propósito, por duas razões, e a segunda é
de segurança:** no turno do inimigo os seis verbos são **alvos mortos**, logo
cobri-los não custa nada; e cobri-los **tira seis alvos errados do alcance do
polegar** no segundo exacto em que errar custa caro.

**A âncora é uma só, e é isso que faz as duas regras baterem:** o chamado ocupa
646–764 com o recuo nos 48 px de baixo, e o leque põe *deixar passar* exactamente
nos mesmos 716–764. **A escolha segura não se mexe um pixel** — fica sempre
debaixo do polegar, e as que comprometem exigem um alcance deliberado. A trava de
150 ms é o que impede que isto vire armadilha.

**No telefone o tempo paga +600 ms** (4 600 ms), e **não é a viagem** — essa é
nula por desenho (~60 px). É que **não há `hover`**: o jogador de telefone não
pode ler o preço antes de a janela existir, como o de rato pode. *É um número de
partida, e K4 é quem o corrige.*

### O movimento da tela, com saída

**Uma curva só para o que se move** — `cubic-bezier(.2,.7,.3,1)`, que a folha
já usa em `.tv-vira`. **Linear só para o que mede tempo**, porque *uma curva de
aceleração numa barra de tempo mente sobre o tempo*.

| o que | quanto | curva | sob `prefers-reduced-motion` |
|---|---|---|---|
| entrar / sair da batalha | **140 ms**, só opacidade | `ease` | a seco — termina em `opacity: 1` |
| a casa entra em *Sob o dedo* | **90 ms** | `ease` | troca a seco |
| a régua acende (coluna + linha) | **90 ms** | `ease` | troca a seco |
| o veredito aparece | **120 ms** | `ease` | idêntico |
| a vez passa de uma linha para outra | **200 ms** | `cubic-bezier(.2,.7,.3,1)` | troca a seco |
| o halo do Selo *Mudou=Agora* | 3 × 1,2 s **e para** | `ease` | não pulsa |
| o chamado entra (K1) | **120 ms**, `opacity` + `translateY(6px)` | `cubic-bezier(.2,.7,.3,1)` | aparece a seco, já no lugar |
| a barra da pergunta que expira | o tempo da janela | **linear** | vira **número que conta** |
| o leque abre (K1) | **160 ms**, `opacity` + `transform` | `cubic-bezier(.2,.7,.3,1)` | troca a seco |
| `Pressa=Sobra` → `Pouco` (K1) | **90 ms**, só a tinta | `ease` | troca a seco |
| a janela sai — respondida **ou** expirada (K1) | **140 ms**, só `opacity` | `ease` | some a seco |

**As três leis que governam a tabela:**

1. **A régua acende nos mesmos 90 ms da casa, e não é coincidência: é o mesmo
   evento.** Um evento tem uma duração; dois números para a mesma coisa seriam
   duas verdades.
2. **A tela não anima leiaute — só `opacity` e `transform`.** Animar leiaute
   durante um turno é, literalmente, *custar o turno*, e o que empurra a página
   faz o dedo errar o alvo.
3. **Nada de `infinite` nesta tela.** Das 13 classes da casa, 5 são infinitas e
   só 3 têm saída (medida de D5c).

**A tela de batalha NÃO usa `.tv-fade`:** `tvFade` dura 500 ms **e move**
(`translateY(8px)`, `estilo.js:129`) — três vezes acima do limite de 0,1 s em
que um gesto ainda parece instantâneo (NN/g, *Response Times: The 3 Important
Limits*, Nielsen 1993, a partir de Miller 1968), e o deslocamento faz o campo
**nascer** em vez de **já estar lá**. *O que entra é a moldura; o tabuleiro já
está lá.*

**E a regra que D5c cobra antes de doer:** cada classe nova nasce com a saída
escrita, e **a saída pousa no estado final** — `tv-batalha-entra`,
`tv-regua-acende` e `tv-vez-passa` saem com `animation: none` porque terminam
acesas. **`tv-janela-tempo` é a exceção, e a exceção é lei:** ali *a informação
mora dentro do movimento*, e `none` apagá-la-ia — a saída dela é **virar
contagem**, que é a variante *Tempo=Contagem* da peça.

**As classes de K1, com a saída escrita à nascença:** `tv-chamado-entra`,
`tv-leque-abre`, **`tv-janela-tempo`** e `tv-janela-sai`. Nenhuma `infinite`.

### O teclado numa janela com relógio (K1)

Uma janela que expira **tem** de se responder sem rato, ou o relógio é uma
barreira em vez de uma tensão.

- Ao nascer, **o foco vai para o chamado** (gestão de foco na revelação, ARIA APG).
- Aberto o leque, as respostas são **`role="menu"` com UM ponto de tabulação** —
  setas andam linha a linha, `Enter`/`Espaço` respondem, `Escape` é *deixar
  passar*. É o mesmo *tabindex* rotativo que E1 deu às 256 casas, pela mesma razão.
- **O foco entra na primeira reação, nunca no recuo:** quem carrega em `Enter` por
  reflexo não pode acabar a recusar sem querer.
- **`1`..`4` escolhem, `0` deixa passar**, e os números **só acendem quando o
  último dispositivo foi o teclado** — como um acelerador de menu só aparece com
  `Alt`. Sob relógio, o teclado deixa de ter viagem nenhuma.
- **Trava de 150 ms** nas linhas recém-reveladas, para o toque que abriu o leque
  não atravessar para a linha que nasceu debaixo do dedo.
- **O anel não muda** e **não é eixo de variante** em `O chamado`: *o chamado está
  focado desde o instante em que existe*, logo uma variante *Foco* seria a única
  alguma vez usada. É forma transversal, em `:focus-visible`.

### O anel de foco, aplicado a um tabuleiro

A forma não muda — `box-shadow: 0 0 0 2px T.bg, 0 0 0 4px T.ink`, `ink` sobre
`bg` = **15,31:1**. O que E1 acrescenta é **como ele se comporta sobre 256
casas**, e hoje cada casa alcançável é `role="button" tabIndex=0` com
`outline: none` (`grade-de-batalha.jsx:515-519`) — **86 alvos focáveis por
luta, com o anel apagado de propósito**.

- **A grelha é UM ponto de tabulação, não 256.** É o padrão `grid` do WAI-ARIA
  com *roving tabindex*: uma casa tem `tabIndex=0` e todas as outras `-1`; as
  setas andam casa a casa, `Enter`/`Espaço` agem, `Esc` sai e devolve o foco aos
  verbos. **Tab entra no campo uma vez e sai uma vez.**
- **O foco entra na casa do herói**, sempre — a mesma regra que manda o campo
  abrir centrado nele. *Um tabuleiro que rola e abre no lugar errado é pior que
  um que não rola, e um foco que entra no lugar errado é a mesma armadilha com
  teclado.*
- **A ordem de tabulação é a ordem do DOM, e por isso a ordem do DOM é
  desenho** — reordenar com `tabindex` positivo é o remendo que a WCAG 2.4.3
  existe para recusar. A ordem é: *de quem é a vez* (não focável, é leitura) →
  **o campo** → *o veredito* (não focável) → **os verbos** → **quem está de pé**
  → a última fala → **sair**. O primeiro Tab cai no campo, que é o assunto da
  tela; **`sair` é o último**, de propósito: é a porta, e ninguém deve tropeçar
  nela na primeira tecla.
- **A única exceção, e é boa UX e não remendo:** quando um verbo com alcance
  entra em *Mira*, **o foco salta sozinho para o campo**, na casa do alvo mais
  provável. Sem isso o teclado paga dois Tabs por ataque; com isso paga zero. É
  a regra de convivência do `jogo` — *nunca as duas línguas ao mesmo tempo* — a
  produzir de graça o atalho de teclado certo.
- **O vão do anel, com número:** sobre o fundo de tabuleiro de hoje (`#141020`)
  o vão de 2 px em `bg` dá **1,04:1** e não se separa; o anel de `ink` dá
  14,73:1 e carrega o trabalho sozinho. **Com o fundo do tabuleiro em `T.bg` o
  vão volta a funcionar como desenhado** — a forma do anel não muda; muda o
  fundo, que é onde o defeito estava.

### Discordância resolvida: a borda por casa × o contorno da união (`jogo` × `desenho`)

**O `jogo` abriu:** *"as duas dizem a mesma coisa duas vezes"*. `A casa`
*Alcançável* tem **borda âmbar a 55% por casa**, e o código já desenha **o
contorno da UNIÃO** do alcance (`grade-de-batalha.jsx:40`), com o comentário da
própria casa a explicar porquê: *"desenhar isso em vez de uma borda por célula é
o que faz 'até onde eu chego' virar uma FORMA — uma mancha com beirada — em vez
de um mosaico de quadradinhos"*. Com 86 casas alcançáveis, **86 bordas são 86
caixinhas**, e o tabuleiro volta a parecer a planilha que a v9.125 matou.

**O `desenho` respondeu com a régua:** a borda âmbar a 55% sobre `bg` dá
**3,41:1** e é o que passa o **WCAG 1.4.11** (não-texto); a 45% dá 2,65:1 e
reprova. O preenchimento, entre 10% e 28%, fica entre **1,15:1 e 1,71:1** — é
profundidade, **nunca informação**. E se o contorno passasse a carregar o
alcance sozinho, teria de passar na mesma régua.

**E então aconteceu a coisa mais rara desta mesa: os dois cederam ao mesmo
tempo, um para o outro, em direções opostas** — cada um adotou o argumento do
outro e abandonou o seu. O `jogo` passou a defender que **a borda fica**; o
`desenho`, que **a borda sai**. Como isso continua a ser *duas formas para a
mesma ação*, **quem desempatou foi o `regente`**, e o motivo fica escrito.

**O lado a que o `jogo` chegou (a borda fica):** o contorno é âmbar a 60% e
**passaria** a régua. Mas o 1.4.11 exige que o indicador identifique **o
componente**, e o componente é **a casa** (`role="button"`, uma por casa), não o
conjunto. Uma casa no meio da mancha não tem beirada âmbar nenhuma: tem a malha,
que é `line` e não diz "alvo". **O contorno identifica a região; a borda
identifica o alvo.** E o mosaico que ele temia já estava curado por outra via:
com o custo escrito dentro, a casa deixa de ser caixa vazia e vira **etiqueta de
preço** — *nove casas com número dentro não leem como planilha, leem como campo*.

**O lado a que o `desenho` chegou (a borda sai):** com o custo escrito dentro de
toda casa *Alcançável*, **a casa já está marcada individualmente, e por texto** —
que não é cor, e por isso não depende de 1.4.11 de todo. A borda passaria a ser
o terceiro canal a dizer o mesmo, contra a sua própria regra: *o que é alvo tem o
custo escrito dentro*.

**O desempate: a borda FICA — e fica por uma razão que nenhum dos dois usou.**
*Um canal que desaparece por regra não pode ser o único canal.* O custo escrito
**sai sozinho** quando a casa encolhe: a regra do próprio `desenho` manda o
número descer para a linha do veredito abaixo de **26 px de lado**, e some de
vez no nível de leitura. Se a borda tiver saído, essas casas ficam **sem marca
individual nenhuma**. E o texto que carregaria o peso mede hoje **4,47:1** —
reprova o AA por 0,03. **Uma marca condicional não substitui uma marca
permanente**, e a redundância deixa de ser desperdício no instante em que um dos
dois canais tem data para sumir.

**Mas as três condições que o `desenho` pôs entram na mesma, porque são
verdadeiras independentemente da decisão — e uma delas achou um defeito vivo:**

| a união, hoje | medido | WCAG 1.4.11 (3:1) |
|---|---|---|
| âmbar a 60% sobre `bg` | **3,85:1** | passa |
| **violeta a 60% sobre `bg`** | **2,68:1** | **REPROVA** |
| violeta a 70% sobre `bg` | **3,24:1** | passa |

**O contorno da mira reprova o piso de não-texto hoje, a 2,68:1**
(`grade-de-batalha.jsx:433`, `opacidade={0.6}`) — e a borda por casa é o que
tem estado a salvar a situação sem ninguém saber. **É achado, não detalhe**, e é
o argumento mais forte a favor de manter a borda: ela já era carregadora.
Condições: união âmbar **≥ 60%**, união violeta **≥ 70%** (número, e é de E3),
traço **≥ 2 px** — e a terceira amarra tudo, porque o contorno mede `0.045` em
unidades de casa, o que dá **2,16 px a 48 px de casa e 1,07 px a 23,8** — um
fio. **O contorno só pode dizer alguma coisa porque a casa passou a ser 48:** a
régua do contorno e o piso de 48 px são a mesma decisão.

**E uma exceção que fica, do `desenho`: *Mira* mantém o tracejado por casa.** Em
mira há **duas** coleções violetas na tela ao mesmo tempo — o alcance e a área
que a magia varre (`:445`, em `danger`) —, e uma união sozinha não separa *"onde
posso fazer cair"* de *"o que isto pega"*.

**O que sobrevive do primeiro lado do `jogo`, e é regra para durar:** o contorno
da união e a borda por casa **não podem ter o mesmo ritmo**, ou as casas da
beirada ganham linha dupla. **O contorno é tracejado a 60%; a borda é cheia a
55%** — mesma família, cadências diferentes.

**E a inversão, escrita para quem construir:** *quem passa a régua do WCAG é a
borda por casa, não o contorno.* Se um dia alguém apagar a borda para "limpar o
tabuleiro", **apaga o que passa** — e o contorno, que parece o mais visível dos
dois, não o salva.

### O que E1 acrescentou à biblioteca

Mesmo arquivo, `e5wJUzInAssoebx5npssKc`. **Nenhum segundo arquivo.** Uma página
por peça; a página `A batalha` é do `jogo` e nenhuma peça foi redesenhada por
dentro de outra. Zero hex solto, tudo ligado a variável.

| peça | página · nó | variantes | por que não existia |
|---|---|---|---|
| **A régua** | `A regua` · `30:11` | 4 (*Eixo × Estado*) | o campo nunca teve endereço, e a gramática que o resolve já existia em `coordenadas.js` sem nunca ter chegado ao tabuleiro |
| **A vez** | `A vez` · `30:163` | **24** (*Lado × Vez × Forma*) | era remontada à mão em `App.jsx:3206-3220`, com `rgba()` e `boxShadow` literais no meio do JSX, 4 a 8 vezes por luta em **dois** lugares |
| **A ficha curta** | `A ficha curta` · `31:137` | 6 (*Lado × Estado*) | o que se sabe de um inimigo mora num `<title>` de SVG — **canal de rato, que no telefone não existe**; os aliados têm cartões, os inimigos não tinham nada |
| **A pergunta que expira** | `A pergunta que expira` · `31:518` | 4 (*Etapa × Tempo*) | dívida declarada de D4, paga porque a razão de a adiar expirou |
| **A marca de borda** | `A marca de borda` · `53:43` | 8 (*Quem × Aresta*) | num telefone de 375 o campo mostra 7 de 16 colunas: **mais de metade dos combatentes pode estar fora da tela a qualquer momento** |

E **três peças que existiam foram corrigidas** — `A casa`, `Botao` e `Barra de
medida`. *(Detalhe abaixo.)*

**Duas decisões de peça que valem como lei, e não como nota:**

- **`A marca de borda` carrega o endereço, e é por isso que funciona.** `K14` é a
  mesma casa da régua e da ficha curta: **o jogador lê a marca, sabe para onde
  rolar, e pode dizer *"vou até K14"* sem nunca ter visto a casa.** A marca, a
  régua e a casa são **três formas do mesmo endereço** — e *procurar é o custo
  que o endereço existe para não cobrar*. Três canais: a **forma** diz quem, a
  **seta** diz para onde, o **texto** diz onde exatamente; a cor é o quarto e o
  único dispensável. Ela mede **44 px e não 48**, e isso é decisão: *a marca vive
  na moldura, não na malha — não ladrilha nada e não tem de bater com passo
  nenhum.* E **a posição ao longo da aresta muda a seco**: uma marca que persegue
  o inimigo pela borda é movimento periférico durante o turno inteiro, *e
  movimento periférico é a coisa que mais rouba a leitura da cena*.
- **O vocabulário de forma é um só em toda a tela: círculo é aliado, losango é
  inimigo** — as mesmas duas formas no Selo de `A vez` e na marca de borda, de
  propósito. Foi o que permitiu dizer *quem* sem palavra numa faixa onde **oito
  nomes seriam oito truncagens, e um nome truncado não é um nome**. E *Caiu*
  ganhou **um risco atravessado**: sem ele, caído e espera eram o mesmo selo com
  o número mais apagado — um canal a menos.

### A dívida paga, a corrigida, e as que ficam abertas com número

- **Paga:** ***A pergunta que expira*** existe (`31:518`, 4 variantes). D4
  deixou-a por fabricar de propósito — *"peça feita para decisão não tomada é
  trabalho inventado"* —, **a pessoa aprovou a Fase K em 15/09, e a condição da
  dívida caiu: manter a dívida passou a ser o erro.** Ela nasce com a trava K2
  escrita dentro: *quem não responde tem o de hoje, byte a byte*. E o arranjo de
  duas colunas pagou de lado outra dívida: ela mede **344** de largura e a
  lateral mede **344** — **encaixa exatamente**, e em 1280 a reação cresce na
  lateral **sem tocar no campo**.
- **Corrigida a meio da etapa, e a causa era pior do que parecia:** ***A casa***
  media 148×48 e **não ladrilhava** — porque *o custo* e *o preço* eram **duas
  linhas de legenda de largura inteira por baixo do quadrado**, 73 px de conteúdo
  numa caixa de 48. Passou a **48×48** nas sete variantes, com o custo e o
  endereço **dentro** do quadrado e **o custo visível já em *Alcançável***. **E a
  ironia fica escrita, porque vale mais que a correção:** *este arquivo sempre
  mandou "o custo escrito DENTRO da casa", e a peça de D4 escreveu-o fora* — a
  discordância não era entre as duas mesas, era **entre o `desenho` e o que ele
  próprio tinha escrito**. *(O 148 não virou variante, e é recusa com motivo:
  "custa um golpe livre" são ~108 px em mono 9 e não cabem em 48 de lado nenhum;
  uma variante larga só devolveria o ladrilho que não ladrilha. O preço é `A
  Consequência`, que já existia.)*
- **Pagas na mesma rodada:** **`Botao`** passou a ter **uma altura por
  `Papel`×`Tamanho`** — antes *Impedido* era 19 px mais alto que *Repouso*, e
  numa barra encostada ao campo **um botão que cresce ao ficar indisponível
  empurra o tabuleiro**. A linha da razão fica reservada nos quatro estados, e
  **não é espaço morto: é onde `A Consequência` do preço se senta.** **`Barra de
  medida`** estica e encolhe (trilho de 285 px a **48** entre 359 e 120 de
  caixa) — *quem absorve é o trilho, o único elemento cuja largura não carrega
  informação*. E **`A vez`** ganhou o eixo ***Forma*** (Linha · Selo), 12 → **24
  variantes**, com o número que o justifica: **oito combatentes pedem 2.560 px
  em Linha e 472 px em Selo**.
- **Abertas, e cada uma com o motivo de o estar:** **a razão sai do `Botao` e
  passa a ser sempre `A Consequência`** — é o fim de linha certo (os tons
  *Impedimento* e *Espera* foram construídos duas vezes por acidente), e o
  `desenho` **recusou fazê-lo agora com motivo**, porque `A linha` compõe quatro
  instâncias que dependem de `a razao`, e ***peça mudada em silêncio por baixo de
  uma composição é pior do que peça com espaço reservado***. E **o eixo
  *Largura* do `Botao`**, que este arquivo declara e o Figma não tem: leva o
  conjunto de 24 para **48** variantes, acima do teto de 30 da disciplina de
  biblioteca — **declarado e não pago**.

### As armadilhas do Figma que E1 pagou (e uma que morreu)

Somam-se às quatro de D3/D4, que continuam de pé.

1. **`createInstance()` nasce com o alfa da TINTA em 1** — o componente diz 0,1
   e a instância renderiza 100%; acontece também ao trocar variante com
   `setProperties`. **Mas a cura não é repor o alfa: é mudar de gramática.**
   Quando `A casa` passou a guardar o alfa **na opacidade do nó** em vez de na
   da tinta, a reposição corrida na página inteira corrigiu **zero** nós. A
   regra, e é a que fica: ***o alfa no nó sobrevive ao `createInstance`; o alfa
   na tinta não.*** Custou cinco tentativas antes de ser entendida — e **a cura
   de D4 estava errada**: reaplicar o alfa no paint faz a leitura devolver
   `0,22` e **o render sair chapado**, que é o pior tipo de defeito, o que mente
   ao verificador. *(Pelo caminho apanhou-se outra: o `anel de foco` de D4
   continha uma **terceira cópia do ladrilho** lá dentro — era ela que pintava
   sólido.)*
2. **`resize()` é ignorado dentro de auto-layout enquanto o nó estiver em
   `HUG`** — fixe primeiro, redimensione depois. É a irmã (e o contrário) da
   armadilha de D4 para nós soltos: lá era `resize()` **primeiro** e os modos
   depois.
3. **`get_screenshot` e `node.screenshot()` discordam** — o primeiro serviu
   render em cache várias vezes, a duas mãos diferentes e ao `regente`.
   **Confira pelo dado lido de volta, nunca pela foto.**
4. **Recompor mata os ids.** Os três quadros de momento foram refeitos a partir
   do arranjo novo, e `35:175` / `35:372` / `35:569` **deixaram de existir**.
   Quem citar nó de Figma em documento tem de o reconferir depois de qualquer
   recomposição — um id morto é uma referência que mente em silêncio.

---

## K1 · as peças do momento da reação (15/09)

**Uma etapa só de desenho, a segunda seguida.** Nenhum `.js`, `.jsx` ou `.mjs` foi
tocado; o bastão do `App.jsx` ficou livre para a outra mente o ciclo inteiro.
Arquivo `Taverna — biblioteca` (`e5wJUzInAssoebx5npssKc`), **ampliado, nunca
duplicado**. Zero hex solto.

| peça | página · nó | variantes | por que não existia |
|---|---|---|---|
| **O chamado** | `O chamado` · `62:2453` | **8** (*Forma* Chamada·Verbo × *Tempo* Barra·Contagem·Parado × *Pressa* Sobra·Pouco) | a pessoa pediu **um botão**, e E1 entregou um painel de 193 px com um botão lá dentro. **O botão nunca foi peça** — era uma região de outra peça, e por isso não podia aparecer sozinho nem ser o verbo directo quando só há uma reação |
| **O verbo com preço** | `O verbo com preco` · `64:2446` | **6+** (*Papel* Gesto·Recuo·Armado × *Estado* Repouso·Foco·Impedido) | porque **o `Botao` só tem fenda de razão nas 12 variantes em que ele RECUSA**. *Um botão que funciona não tem onde escrever o preço* — e a lei da casa é **o veredito antes do clique** |
| **IconeEscudo · IconeEsquiva · IconeContramagia** | `Glifos` · `61:2` `61:4` `61:6` | — | `reacoes.js` tem seis reações com `icone` e a biblioteca tinha glifo vectorial para três. As outras três usavam **emoji, e emoji não herda a variável de cor** — a primeira lei da casa aplicada ao visual |

**Ampliada:** ***A pergunta que expira*** — de 4 para **8 variantes**, *Etapa*
(Direta · Chamando · Escolhendo · Resolvida) × *Tempo* (Barra · Contagem ·
Parado), **com quatro células deixadas vazias de propósito**: são a regra *o leque
não tem trilho* desenhada em vez de anotada.
**Corrigida:** ***A escolha*** — a Pílula subiu de **35 para 47 px**. Nasceu em D4
com o piso de 44 escrito por extenso e ficou **abaixo dele** (WCAG 2.5.5 AAA; HIG
44 pt; Material 48 dp), e é a forma que vai para a ficha, logo para o polegar. O
piso saiu do **enchimento**, não do texto. *Conferido antes de mexer: zero
instâncias de `Forma=Pilula` no arquivo inteiro.*

### As cinco medidas que valeram a etapa

1. **A peça media 320, e três documentos diziam 344** — o diário de E1, esta
   folha, e **o próprio nome do quadro**. Hoje mede 344, conferido variante a
   variante. *O encaixe na lateral funcionava por elasticidade, o que é a forma
   mais silenciosa de um número errado sobreviver.*
2. **O cordão umbilical existia só na descrição.** E1 escreveu *"o filete de 3 px
   em `danger` na aresta esquerda"* e **não o construiu**. Existe.
3. **`Chamando`: 193 → 118 px (−39 %)** e **`Escolhendo`: 332 → 217 (−35 %)**, com
   o mesmo número de opções; no tecto (duas reações + recuo) mede **321** — *o
   tecto novo é mais baixo que o chão velho.*
4. **Cinco factos errados, em 18 nós, e quatro deles ocultos.** A peça dizia
   `Aparar 2 PM` (`pm: 0`), `Escudo Arcano 3 PM` (`pm: 2`), *"absorve quase todo o
   golpe"* (`corta: 0.6`, e o catálogo diz *"a maior parte"*), e uma palavra de
   risco **que não existia na tabela**. Foram lidos **todos os nós de texto das
   três páginas**, campo a campo contra `reacoes.js:22-69`, em vez de se olhar
   imagens — e *invisível é o que sobrevive a uma revisão a olho*. **Uma peça que
   mente sobre a tabela é pior que peça nenhuma:** é a primeira lei da casa
   invertida dentro da biblioteca.
5. **O pior caso partiu a peça, e só apareceu porque alguém o encheu.**
   `Forma=Verbo` fora proposta como padrão sem nunca ter levado a frase mais
   longa: *"ESCUDO ARCANO"* esmagou-se a 34 px, três linhas de três letras — e
   **5 das 12 classes são conjuradoras**. O botão foi refeito (o preço desceu para
   baixo do verbo, fenda 126 → 277 px) e a tipografia passou a separar **reação**
   (Spectral) de **ordem** (mono caps). *Propor como padrão uma variante que nunca
   se encheu com o pior caso é a forma educada de não ter medido.*

### A armadilha nova do Figma, e ela explica um mistério antigo

**O `COMPONENT_SET` não cresce quando se lhe acrescenta variante** — o que fica
fora dos limites **renderiza como uma tira de 8 px, sem aviso**. Foi isto que
serviu de "`get_screenshot` mentiu" a três mãos diferentes desde E1: **a árvore
tinha razão todas as vezes.** A regra de E1 fica e ganha causa: *confira pelo dado
lido de volta, nunca pela foto* — e, ao acrescentar variante, **redimensione o
conjunto**.
*(E uma segunda, que quase pôs "anula · mais vezes que não" debaixo de Escudo
Arcano em quatro folhas: **reler `characters` dentro do laço lê nós já mutados**
por instâncias aninhadas que herdaram a correção a meio. Confira depois, nunca
durante.)*

**Mais duas, das que desfazem o próprio conserto sem dar erro:**

5. **`primaryAxisSizingMode = "FIXED"` num frame horizontal É a largura** — escrito
   **depois** de um `FILL`, sobrepõe-se-lhe **em silêncio**. Foi assim que o
   `desenho` desfez a própria correção do trilho uma vez.
6. **O Figma recusa `FILL` num nó fora do leiaute e continua a reportar `FIXED`**,
   sem erro. Ali não renderiza, logo não pode medir mal — mas quem ler a
   propriedade de volta vai encontrar uma mentira que não é uma.


---

# O endereço na borda — a régua, a marca e a leitura (E2, `desenho` · 15/09)

Fecha o que E1 abriu e o que `e2-jogo.md` pediu. **Regra da fase: não nasce
tabela de letras nova.** `LETRAS_DA_GRADE` (`coordenadas.js:151`) é a única
gramática, para o mundo e para o tabuleiro.

## A régua tem TRÊS graus, não dois

`A regua` · `30:11` · **6 variantes** — *Eixo* (Coluna · Linha) × *Estado*
(Repouso · **Procurada** · Realçada).

| grau | a letra | o filete de 2 px | quando |
|---|---|---|---|
| **Repouso** | `inkDim` · 6,62:1 | nenhum | sempre |
| **Procurada** | `ink` · 15,31:1 | **`lineStrong`** · 3,74:1 | ele escreveu `K` e ainda não há número |
| **Realçada** | `amberSoft` · 12,40:1 | `amber` · 9,00:1 | o endereço está inteiro e aponta para uma casa |

- **Por que existe o grau do meio.** Sem ele a régua diz a mesma coisa quando o
  jogador escreveu `K` e quando escreveu `K14` — e são estados diferentes: no
  primeiro **nada é accionável**, no segundo há destino e preço.
- **O canal que não é cor:** de *Repouso* para *Procurada* muda a **existência**
  do filete, não a cor dele. De *Procurada* para *Realçada* o terceiro canal está
  **fora da régua**: só o endereço completo acende a casa no campo.
- **`Procurada` é `ink` e não um âmbar fraco**, de propósito: a diferença fica
  em **luminância**, não em saturação — e saturação é o que morre primeiro num
  telefone ao sol.
- **`lineStrong` é legal sobre `bg` (3,74), `panel` (3,51) e `panelSoft`
  (3,27); é ILEGAL sobre `line` (2,71:1).** A régua vive sobre `bg`, logo passa.
- **Movimento:** 90 ms por degrau, o mesmo número da casa, porque é o mesmo
  evento. Sob `prefers-reduced-motion`, `animation: none` — pousa no estado
  final nos dois degraus. **Não nasce classe nova.**
- **O canto da régua (22×22) é `bg` e não leva rótulo.** `A1` não se escreve
  duas vezes.

## O custo da régua no telefone é ZERO — medido dos dois lados

375 de largura · casa 48 · respiro 16 · régua 22 · campo de 616 px (E1).

| | útil | colunas × linhas | casas inteiras | folga |
|---|---|---|---|---|
| sem a régua | 359 × 616 | 7 × 12 | **84** | 23 px · 40 px |
| **com a régua** | 337 × 594 | 7 × 12 | **84** | 1 px · 18 px |

**A prova não é a igualdade — é a folga.** Sem a régua sobravam 23 px e 40 px, e
**uma casa pede 48**. Nenhuma daquelas folgas podia virar casa. *A régua é paga
inteira de espaço que casa nenhuma podia ocupar.* Quadro `119:44`, página
`A regua`.

**A letra no telefone é 12 px, e 22 px de calha aguentam** — medido na peça: a
linha do glifo mede **16 px** (3 px de folga em cima e embaixo) e dois dígitos
medem **15 px** (3,5 px de cada lado). 12 e não 11 porque **um degrau acima do
piso citado** (HIG 11 pt, Material 11 sp) é o que sobrevive ao jogador que já
aumentou o texto do sistema.

## A marca de borda aprende a falar de um LUGAR

`A marca de borda` · `53:43` · **12 variantes** — *Quem* (Aliado · Inimigo ·
**A casa**) × *Aresta* (Cima · Direita · Baixo · Esquerda).

- **Quem=A casa** é a casa que a frase acendeu e que está fora da janela. A
  câmara **não** vai atrás (`e2-jogo.md` §7.1); quem fala é a borda.
- **Três formas, zero dependência de cor:** círculo = aliado, losango = inimigo,
  **quadrado = a casa do tabuleiro**.
- **`amber`** — 9,00:1 sobre `bg`, 8,45:1 sobre `panel`. O endereço em `ink`
  sobre `panel` = 14,37:1.
- **O corpo da marca é `panel` e está a 1,07:1 do tabuleiro.** Quem a separa do
  campo é **a moldura** (9,79 · 5,67 · 9,00). *No dia em que alguém tirar a
  moldura, a marca desaparece dentro do tabuleiro e nada avisa.*

## O nome acessível da casa: `aria-label`, e o `<title>` SAI

> **`endereço · quem está lá · o lugar · o veredito`**

| caso | o nome |
|---|---|
| vazia, ao alcance | `K14 · no beco estreito · dá para chegar aqui — custa 4,5 m` |
| o chão cobra | `K14 · no beco estreito, terreno difícil, cobertura +2 · dá para chegar aqui — custa 6,0 m` |
| fora de alcance | `K14 · no beco estreito · K14 fica a 12 m — o seu passo chega a 9. Vá até K11.` |
| ocupada | `K14 · Halvard, 12 de 18 PV · no beco estreito · Halvard está em K14 — dá para chegar a K13.` |
| parede | `K14 · pedra · K14 é pedra — do lado de cá chega-se a K12.` |
| você | `K14 · você · no beco estreito · você já está em K14.` |
| em mira | `K14 · no beco estreito · dá para fazer Bola de Fogo cair aqui` |

- **Por que `aria-label` e não `<title>`.** O `<title>` de SVG é **também o balão
  do rato** — um canal que no telefone não existe, e um balão de ~340 px por cima
  do campo, que é **exactamente o que esta folha já proíbe**: *quatro segundos de
  balão tapam as casas para onde o jogador ia andar.* Duas strings para a mesma
  casa seriam duas verdades; o `<title>` **sai, não se duplica**.
- **Nada se perde:** o custo já está dentro da casa, o veredito na linha do
  veredito, o nome da região escrito no chão (`grade-de-batalha.jsx:385`).
- **Condição:** `aria-label` num `<rect>` sem `role` é ignorado. A grelha tem
  de ser o `grid` do WAI-ARIA de E1 §6 — `role="gridcell"` em **todas** as casas,
  alcançáveis **ou não**. Hoje a casa impedida não tem `role` nenhum
  (`grade-de-batalha.jsx:515`), e é a que mais precisa de ser lida.
- **LEI: o nome acessível não tem prosa própria.** O último campo é, palavra por
  palavra, a `curta` de `RECUSAS_DO_PASSO`. O ouvido e o olho leem a mesma
  frase, há um só sítio para a reescrever, e **a catraca dos 54 caracteres passa
  a proteger os dois canais**.
- **O campo do veredito nunca fica vazio.** Hoje o `<title>` da casa
  inalcançável simplesmente acaba, e **silêncio lê-se como "nada a dizer", não
  como "não dá"**.

## Texto que muda por instância é PROPRIEDADE, nunca camada

O `jogo` apanhou a doença numa peça; estava em três. Todas consertadas:

| peça | propriedade nova | por que doía |
|---|---|---|
| `A casa` `18:31` | `o endereco#112:0` (7 variantes) | troca de variante **a cada toque** |
| `A regua` `30:11` | `o rotulo#115:0` (6 variantes) | **18 instâncias por tabuleiro**, e o estado troca a cada tecla |
| `A marca de borda` `53:43` | `o endereco#116:8` (12 variantes) | a peça cujo trabalho **inteiro** é carregar um endereço |

**Provado em `A casa`:** instância real escrita com `K14`, trocada para *Mira*,
*Confirmando* e de volta a *Sob o dedo* — **`K14` nas quatro leituras.** Antes,
cada troca devolvia `H12`.

> **A regra: num componente cujo texto muda por instância, texto que não é
> propriedade é um override à espera de se apagar.**

## `Consequencia` ganha o eixo `Largura` — a razão deixa de poder ser cortada

`Consequencia` · `11:35` · **16 variantes** — *Tom* (4) × *Forma* (2) ×
**`Largura` (Cabe no conteudo · Ocupa a linha)**.

- **A causa das cinco recusas transbordarem não eram as frases.** A peça era
  **HUG nos dois eixos, `WIDTH_AND_HEIGHT`, sem `maxLines`**: ela **não sabia
  ser estreita**, e crescia até onde a frase quisesse.
- **`Cabe no conteudo` é o de hoje, byte a byte, e é o valor por omissão** —
  *nenhuma instância existente muda*.
- **`Ocupa a linha`** é largura fixa com a frase em `FILL` e
  `textAutoResize: HEIGHT`: **quebra em vez de crescer**. O ponto da `marca`
  vive numa calha da altura de uma linha, para ficar na **primeira** linha.
- **Provado:** os 101 caracteres que pediam 606 px, numa instância a 344 → **duas
  linhas, 30 px**. Quadro `a prova da quebra`, página `Consequencia`.
- **É o achado B de E1 (`Botao` sem eixo de largura) a morder pela segunda vez**,
  pago aqui porque aqui era pagável sem mexer em composição nenhuma.

### O teto da linha do veredito — conferido, corrigido e ainda frágil

- **O avanço são 6,0 px/caractere, e agora é medida:** doze amostras de `a frase`
  em `109:2623`, todas com `largura / caracteres = 6,000`.
- **O útil é `largura − 10`** (a `marca` de 4 px mais a goteira de 6), **nunca
  `− 16`**: o enchimento da peça é zero. Lateral 344 → **334 úteis → 55**;
  telefone 359 → **349 → 58**.
- **A atribuição da tabela do `jogo` está ao contrário:** o telefone é o lado
  **largo** (58); quem aperta é a **lateral de 1280** (55).
- **O teto de 54 fica**, com 1 caractere de margem, e a catraca que falha acima
  de 54 é boa.
- **E ele parte-se a 115 % de texto do sistema** (WCAG 1.4.4): o avanço vai a
  6,9 px e o teto a **48**. A 200 %, a **27**. **É o eixo `Largura` que segura
  isto** — a razão quebra em vez de ser cortada. No telefone os 15 px saem da
  tira *o que acabou de acontecer*, que é **consulta e não decisão**, e voltam
  sozinhos quando a recusa some.

## Duas armadilhas novas do Figma — a primeira apaga trabalho sem dar erro

1. **`clone()` NÃO copia `componentPropertyReferences`.** As oito variantes
   clonadas de `Consequencia` nasceram com a referência vazia, e
   `setProperties` corria **sem erro e sem efeito**. *Depois de clonar uma
   variante, releia `componentPropertyReferences` e religue.*
2. **A leitura imediata a seguir a `setProperties` devolve o estado anterior.**
   A mesma prova deu 15 px de altura na chamada em que foi escrita e 30 px na
   seguinte. **Confira numa chamada nova, nunca na mesma.**
