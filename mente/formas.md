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

- **quando** — *"`reacoes.js` tem seis reações com gatilho, custo em PM e
  resolução — Contramágica, Escudo Arcano, Aparar, Esquiva Ágil, Contra-ataque e
  as seguintes. O golpe chega, `escolherReacao` (`reacoes.js:85`) escolhe a
  primeira da lista que se aplica, `resolverReacao` rola, e o PM sai da ficha do
  jogador (`App.jsx:7572`, `pmReacaoRef`). **O jogador nunca toca.**"*
- **forma** — **A pergunta que expira** (peça pedida por nome pelo `jogo` em D4
  e **ainda não fabricada**). Um bloco preso à linha do golpe, **não um véu**:
  nasce com o verbo e o preço na mesma linha — *"Aparar — 2 PM, corta metade"* —,
  tem um `Botao` *Papel=Gesto* por reação disponível e um *Papel=Recuo* que diz
  **"deixar passar"**. O tempo que resta é uma **Barra de medida**, não uma
  animação: informação dentro de movimento é informação perdida sob
  `prefers-reduced-motion`. **Quem não responde não é punido** — o sistema
  responde exatamente como hoje.
- **movimento** — a janela **não pisca e não empurra** o que está em volta. A
  barra do tempo desce linear; sob `prefers-reduced-motion` vira um número que
  conta.
- **onde vive** — Figma: **[ainda não existe]** — é a única peça pedida em D4
  que não foi fabricada. · Código: **[ainda não existe]**.
- **por quê** — estudo citado, e a origem é esta casa: o cabeçalho de
  `src/reacoes.js` escreve *"No 5e e no BG3 metade da tensão do combate mora
  aqui: o golpe vem, e você tem uma janela para aparar…"* — e a linha seguinte
  do mesmo comentário entrega a escolha ao sistema. **O módulo diagnostica o
  problema e depois causa-o.** E experiência jogada: numa luta inteira o `jogo`
  tocou **três** controles — duas casas e o `⛺` que a encerrou por engano —,
  com seis reações disponíveis e nada onde tocar.
- **dívida nomeada, e de propósito não paga em D4.** *A pergunta que expira*
  **não foi fabricada**, e isso é decisão: ela é o coração de uma proposta
  `pesado` que **espera a pessoa**, e **fabricar peça para decisão que não foi
  tomada é inventar trabalho**. Fica escrito o que ela teria de fazer, para que
  no dia do "sim" ninguém comece do zero: *aparece, oferece uma escolha com o
  preço escrito, e **some sozinha se ninguém responder, sem punir quem não
  respondeu**.* Quatro defesas já decididas pelo `jogo`, e três delas já são
  regra: o sistema **já** recusa gastar reação em arranhão (`reacoes.js:93-94`),
  **uma por rodada** já é regra, **quem não responde tem o de hoje byte a byte**
  — e se o jogador deixar a janela expirar algumas vezes seguidas, **o jogo para
  de perguntar** pelo resto da luta, sem lhe dizer que existe um mecanismo e sem
  lhe pedir preferência nenhuma.
- **peso** — **médio** a peça; **pesado** a janela, porque é momento novo no
  meio do turno e quem decide isso é a pessoa.

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
