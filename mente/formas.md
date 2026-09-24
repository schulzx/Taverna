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
  **[E3] O piso desta família é `ALVOS.piso` = 48, e não 44.** O 44 escrito acima
  é o mínimo do WCAG 2.5.5 (AAA), não o número desta casa — e a casa fechou o dela
  em K4. No Figma, *Pílula* e *Aba* medem **48** nos quatro estados; o *Cartão*
  mede 88 e passa por folga. Quando o *Contador* nascer, nasce a 48.
- **movimento** — 120ms na troca de borda; o filete cresce de 0 a 3px no mesmo
  tempo. Sob `prefers-reduced-motion`, aparece pronto.
- **onde vive** — Figma: página `A escolha`, conjunto `A escolha` (12 variantes:
  Cartão · Pílula · Aba × 4 estados). ***Contador* e *Lista* estão declarados e
  ainda não fabricados**, também no Figma — **[ainda não existe]**, e é melhor
  dizê-lo que deixar a contagem sugerir o contrário.
  **[E3] As alturas, lidas de volta do arquivo:** Cartão 88 (107 em *Impedida* —
  ver a dívida no bloco de E3), Pílula **48**, Aba **48**, e **o *Foco* mede
  exactamente o que o *Repouso* mede nas três formas**. · Código:
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
- **forma** — **uma fila só, de `A escolha` *Forma=Pílula*** (48 px), e **nenhuma
  peça nova**. *"Reação padrão"* e *"nunca me pergunte"* pareciam duas coisas — um
  interruptor mais uma lista. **São uma só: escolher um verbo É dizer "nunca me
  pergunte"**, e *"eu decido"* é apenas a opção que vem marcada.

  **[K4] A medida passou a sair de tabela, e o número fechou em 48.** A fila
  nasceu em K3 a **27,5 px** — 9 px de texto × 1,5 de entrelinha herdada, mais 12
  de `py-1.5`, mais 2 de borda — e a diferença atravessou **102 asserções sem uma
  falha** porque **nenhum dos dois números existia no código**. A altura passa a
  `ALVOS.piso` (`src/estilo.js`), e o piso é **48**: fecha o 47 que K1 deixou dito
  por não fechar, é o número da casa do tabuleiro e da linha do recuo do leque, e
  cabe no orçamento do telefone de W1 (48 + 24 = **72** contra o degrau de 75 —
  folga de 3 px em vez de 4, a mesma 13.ª fila).

  > **Quando um golpe chega** · `[✓ EU DECIDO]` · `[EU DECIDO, SEM PRESSA]` ·
  > `[APARAR SEMPRE]` · `[DEIXAR PASSAR]`

  Cada uma acende uma estrada de `RITMOS_DA_REACAO`, e **nenhuma linha fica sem
  leitor**: `eu decido` → `normal`; `eu decido, sem pressa` → **`parado`** (a
  janela abre e **espera**); `aparar sempre` → `normal` com o verbo travado;
  `deixar passar` → `normal` com o recuo travado. A terceira pílula traz **o verbo
  do herói**, nunca uma lista. `folgado` fica de fora de propósito: é o que a
  escada dá a quem **não pediu**.
- **onde vive** — Figma: a fila na ficha, com instâncias de `A escolha` (`20:77`)
  — **[E3] a divergência 47 × 48 está FECHADA, e fechou no Figma.** Os quatro
  `corpo` da *Forma=Pílula* (`20:34`, `20:39`, `20:44`, `20:51`) medem **48**,
  com o enchimento vertical a **zero**: a altura deixou de ser a soma do texto
  com o enchimento e passou a ser **o número da tabela**, que é o que `minHeight:
  ALVOS.piso` já dizia em código. *Não há divergência para declarar.* · Código:
  **`PilulaDeEscolha`, `src/ui.jsx`**, com a fila na ficha do `App.jsx`.
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
- ~~**`Atacar` é o único `Papel=Chamada` da tela.**~~ **[E3] REVOGADO em W1, e
  esta linha ficou de pé a contradizer a decisão.** `Atacar` é **`Papel=Gesto`
  com `Estado=Armado`** — a razão está escrita em *"`Atacar` perde o
  `Papel=Chamada`"* (decisão do `regente`, W1): *o âmbar cheio pertence ao que VAI
  acontecer, não ao que é popular*, e **só se pode armar o que tem fundo para
  inverter**. Fica a consequência, que é o que esta linha tinha de útil: a
  distinção de `Atacar` **não é cor de borda entre botões iguais** — é o bico e a
  inversão do armado. *Na tela da batalha não há `Papel=Chamada` nenhum.*
- **`Habilidades (✦)` é uma gaveta, não um verbo** — é uma **lista** que varia
  por classe, por nível e por PM, e *lista nunca entra em fileira fixa*: no dia
  em que o mago aprende a sétima magia, a fileira deixa de ser fixa.
- **Três fileiras de 44 px no telefone, e todas com a palavra inteira.** A
  fileira única não fecha: seis rótulos em 359 px pedem ~52 px cada, e
  `Empurrar` em 52 px **não é um rótulo, é um glifo mudo** — um verbo de combate
  que só se lê pelo símbolo é o sistema a falar por sinais.

### O veredito antes do clique, sobre o tabuleiro

**Uma `Consequencia` *fixação=Linha*, **entre o campo e os verbos**, sempre
presente, 24 px. Nunca balão** — já estava fechado que sobre o tabuleiro a
Consequência é sempre *Linha*, porque **quatro segundos de balão tapam
exatamente as casas para onde o jogador ia andar**.

*(Corrigido em W1. Esta linha dizia "colada sob a fileira" e contradizia as
outras duas passagens desta folha — a reserva da reação, que a põe "entre o
campo e os verbos", e a ordem de tabulação de E1, que é `campo → veredito →
verbos` e que, sendo ordem do DOM, **é** a ordem visual. Duas contra uma, e o
desempate nem precisou de ser por maioria: o lugar certo é acima dos verbos
porque é onde a mão NÃO está quando o polegar os prime — Apple HIG, `Adjusting
for the finger`. **Uma fonte da verdade a dizer duas coisas é o defeito que ela
existe para não ter.**)*

*(**[E3] Os 24 px são da REGIÃO, não da peça, e o Figma dizia 22.** A peça
`Consequencia` *Forma=Linha* mede **15 px** — uma linha de 10 px a 150 % —, e
**assim tem de ser**: a região é a calha reservada onde ela se senta. Na tela
composta do telefone (`40:447`) a faixa *a linha do veredito* media **22**, dois
a menos que esta folha promete: **corrigida para 24 em E3**, com os 2 px pagos
pelo campo (550 → 548). E fica a regra que o número sozinho não carrega: **a
faixa é um piso, nunca uma altura fixa** — a 115 % de texto do sistema a frase
quebra em duas linhas e pede **30**, e uma faixa fixa em 24 corta a razão em vez
de a deixar crescer, que é exactamente o que o eixo `Largura` existe para
impedir.)*

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

**[K3] E as três que faltavam à tabela, com a saída escrita igual:**

| o que | quanto | curva | sob `prefers-reduced-motion` |
|---|---|---|---|
| **o trilho nasce** (`tv-trilho-entra`) | **90 ms**, só `opacity` | `ease` | aparece a seco |
| **o trilho some ao primeiro toque** (`tv-trilho-sai`) | **90 ms**, só `opacity` | `ease` | some a seco |
| **o verbo vira a linha resolvida** (`tv-resolve`) | **120 ms**, só `opacity` | `ease` | troca a seco |

**[K3] E duas correções de propriedade, que são de ofício e não de tempo.** *(A
conta inteira, com os números e o que cada uma custa, em `mente/k3-desenho.md`.)*

1. **O cheio do trilho é `transform: scaleX()`, nunca `width`.** A lei 2 desta
   mesma tabela proíbe animar leiaute — e `scaleX` não tem unidade, logo **não há
   píxel nenhum na declaração para alguém copiar**. O defeito dos 213 px fixos
   deixa de ser regra a lembrar e passa a ser coisa que não há por onde escrever.
2. **O trilho nasce na proporção pelo `animation-delay` negativo**, calculado de
   `agora − t0` — e não por um número escrito à mão. Não há `100 %` na folha, e
   também não há `73 %`: os dois seriam um número que o relógio não produziu. É a
   lei de K2 (*o trilho não tem relógio próprio*) cumprida com um relógio só.
   **A escala do trilho é `trilhoMs`, não `janelaMs`** — a barra promete o
   **prazo**, e a folga é não-medida por decisão de K1b.

**[K3] E a saída de `tv-janela-tempo`, agora com o mecanismo:** `animation: none`
sozinho congelaria o cheio em `scaleX(1)` — **uma barra cheia e parada, a pior
mentira possível sobre o tempo.** A saída pousa em `scaleX(0)`: invisível, e quem
conta o tempo passa a ser o numeral, que é o que *Tempo=Contagem* é.

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

**[K3] A forma em código é `.tv-anel-foco`, em `SUPERFICIES_CSS`** (o anel não
anda), e vem com cinco regras: **`box-shadow`, nunca `border`** — `border` ocupa
leiaute e faria a fila de quatro pílulas da ficha **mexer-se quando o foco entra**,
que é um alvo em movimento para o jogador de teclado, que é exatamente quem aquela
fila existe para servir (é o defeito que K2 §1.6 encontrou: no Figma o anel era
geometria — **e a razão escrita para isso, *"o Figma não tem `box-shadow` de dois
degraus"*, é FALSA, corrigida em E3**: tem, e o `Botao` desta mesma biblioteca já
o usava desde D3. Ver *"O anel no Figma tem duas construções"*, no bloco de E3);
**nada de
`outline: none` fora do bloco `:focus-visible` que instala o anel**; **a goteira de
8 px da fila absorve os 4 px do anel com metade de folga — deslocamento zero,
medido**; **`overflow: hidden` de um antepassado corta-o**; e **`box-shadow` não
soma entre regras** — sombra e anel escrevem-se na mesma declaração ou o foco apaga
a sombra. **E `forced-colors: active` remove `box-shadow` por especificação**, logo
o anel precisa de duas linhas de `outline` ali, ou não existe para quem joga em alto
contraste. *(A classe inteira, pronta para colar, em `mente/k3-desenho.md` §2.)*

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

---

# A frase que se monta — o verbo, o alvo e o preço (W1 · 16/09)

**O turno deixa de ser declaração digitada e passa a ser verbo + alvo, por
toque, com o preço e o alcance antes do clique.** O `jogo` compôs o momento em
`mente/w1-jogo.md`; o `desenho` fabricou a forma em `mente/w1-desenho.md`; **as
três decisões de desempate são do `regente`** e estão marcadas como tais.

**Regra da fase: nenhuma peça nova nasceu.** Duas cresceram um estado cada, uma
foi consertada, e o eixo `Largura` que E2 fabricou fez todo o trabalho da
segunda linha sem precisar de mais nada.

## A fileira é de QUATRO, numa fila só — decisão do `regente`

`Atacar` · `✦` · `◆` · goteira · `esperar`. **A lista é do `jogo`**, e ele
prova-a em motor, não em gosto: `golpe.js:222-254` declara que `Esquivar`,
`Empurrar` e `Derrubar` **não chegam a motor nenhum** (a frase que escrevem não
casa detector de ataque nem desafio do catálogo), `Saltar` espera a porta do
tabuleiro, e `Mover` seria a segunda forma do passo, que já se dá tocando a
casa. **Eles não desaparecem: ficam na gaveta `Ações`, a escrever na caixa.**

> ***Uma fileira fixa de seis em que três não fazem nada ensina, em duas lutas,
> que a fileira não é de confiança.***

**E `Atacar` continua a ser o primeiro entre iguais — mas paga-se na LARGURA,
não no preenchimento:** 163 px contra 72 · 44 · 44, que fecham os 359 úteis do
telefone exactos. É a fórmula do `jogo` (*"paga-se no preenchimento e na tinta,
não no tamanho"*) com o preenchimento trocado por largura, porque o
preenchimento cheio passou a significar outra coisa — ver a decisão seguinte.

## O verbo armado

`Botao` · `9:170` · 24 → **26 variantes** — `Estado` ganha **`Armado`**, só em
`Papel=Gesto`, nos dois tamanhos (`124:7`, `124:3333`).

- **`Armado` é ESTADO, não `Papel` e não eixo.** Como `Papel`, o `Atacar`
  encolheria **9 px de altura e 19 px de largura** ao armar-se, que é o defeito
  que E1 já pagou uma vez (o *Impedido* 19 px mais alto a empurrar o tabuleiro):
  ***`Estado` preserva a geometria do `Papel`; `Papel` não preserva nada.*** Como
  eixo, levaria o conjunto a **48** e fabricaria `Armado × Impedido` e
  `Armado × Esperando`, que não podem existir — *variante que não pode acontecer
  é export morto com outra roupa* (lei de K1).
- **`Recuo × Armado` não nasce:** `esperar` não tem alvo.
- **Dois canais o distinguem, e nenhum é matiz** (WCAG 1.4.1): a **inversão
  figura/fundo** (contorno `lineStrong` + `ink` → corpo `amber` + `onAccent`) e
  **o bico**, um triângulo de 12×6 px em `onAccent` encostado à aresta de cima,
  a apontar para a linha do veredito. **É a única silhueta desta forma na
  biblioteca**, e não diz só *"estou armado"*: diz ***"aquela linha é minha"***,
  que é o que faltava numa tela onde uma linha serve a fileira toda.
- **`aria-pressed="true"`** — é o estado que a norma já tem para *"ligado"*, e é
  o que faz o bico e a inversão chegarem a quem não vê nem um nem outro.

| par | medido | piso | veredito |
|---|---|---|---|
| o rótulo armado — `onAccent`/`amber` | **8,486:1** | 4,5 | passa |
| o corpo armado sobre o painel — `amber`/`panel` | **8,448:1** | 3 | passa |
| o corpo armado sobre o tabuleiro — `amber`/`bg` | **8,999:1** | 3 | passa |
| **`ink` sobre `amber` — a armadilha de quem clonar** | **1,701:1** | 4,5 | **REPROVA** |

**A armadilha é escrita porque vai acontecer:** quem montar isto clona o botão
de repouso e troca o fundo para `T.amber`. Se o rótulo ficar em `T.ink`, cai a
**1,701:1**. *O rótulo do verbo armado é `onAccent`, e só `onAccent`.*

### O salto de leiaute é ZERO, e o contorno é que o segura

O contorno de 1 px do corpo é **INSIDE e conta para o HUG**. Tirá-lo — um corpo
cheio não precisa de traço — encolheu `Gesto` de **78 para 76 px**.

> **O armado HERDA o contorno do repouso do mesmo `Papel`, nunca o inventa.**
> O contorno do corpo armado não é enfeite: **é o que segura a largura.**

Conferido por leitura de volta: `Gesto · Normal` 78×63 nos dois estados;
`Gesto · Pequeno` 57×49 nos dois. **0 × 0.**

### `Atacar` perde o `Papel=Chamada` — decisão do `regente`, e a prova é uma foto

`Papel=Chamada` **em repouso já é âmbar cheio**. No par comparável (`126:2`), a
caixa `ATACAR` em repouso e a armada eram **a mesma caixa amarela**, separadas
por um triângulo de 6 px. E1 deu-lhe o `Chamada` com a razão certa para a tela
dela — numa tela em que `Atacar` só enchia uma caixa de texto.

> **O âmbar cheio é a voz mais forte desta tela, e pertence ao que VAI
> ACONTECER, não ao que é popular.** Gasto em repouso, não sobra nada para o
> momento em que importa.
>
> **A regra que fica: só se pode armar o que tem fundo para inverter.**

`Chamada × Armado` foi **fabricada e apagada na mesma etapa** — *uma variante
que não se distingue da vizinha é pior do que variante nenhuma*. E vale dizer
qual canal a apanhou: **foi a foto**. A lei da casa (*confira pelo dado, nunca
pela foto*) protege contra a foto que **mente**; não proíbe a foto de mostrar o
que o dado não tem como mostrar, que é *duas coisas parecerem-se*.

### Só `Atacar` se arma — decisão do `regente`

`✦` e `◆` são gavetas (abrem painel), `esperar` resolve num toque, e os três
verbos sem alvo saíram da fileira. **Na barra de batalha há exactamente um verbo
que arma** — e isso responde, sem discussão, à regra do `desenho`: *armar um
verbo que não tem para onde apontar é o formulário que a lei do passo limpo
proíbe*.

## O alvo — e ele não é uma casa

`A casa` · `18:31` · 7 → **8 variantes** — `Estado` ganha **`Alvo`**
(`125:177`).

- **alcançável** é propriedade de **casa** (*"posso terminar o meu passo aqui"*);
  **alvo** é propriedade de **criatura** (*"este verbo age sobre isto"*). *O
  golpe escolhe gente, não chão* — foi o pedido do `jogo`, e os dois chegaram-lhe
  em paralelo sem se verem.
- **HOJE É IMPOSSÍVEL TOCAR NUM INIMIGO.** As fichas são desenhadas dentro de
  `<g style={{ pointerEvents: "none" }}>` (`grade-de-batalha.jsx:648`) e a casa
  por baixo delas **também não é clicável**, porque `podeIr` exclui os quadrados
  ocupados (`:401`). **O tabuleiro tem 84 alvos de toque e nenhum deles é um
  inimigo.** Não é preferência do jogador escrever `Ataco Halvard`: *é que não há
  onde tocar.*

### Os quatro cantos, e não um anel — e a razão é geometria

A ficha mede `r = lado × 0,40` e o arco da vida corre em `rArco = r + 0,07`
(`grade-de-batalha.jsx:215-220`) = **0,47 da casa**, contra os 0,5 da
meia-largura: **sobram 1,4 px numa casa de 48.** Não há onde pôr um segundo anel.

**Mas a casa não é um círculo.** A meia-diagonal mede **0,707**: o canto tem
**0,237 de casa livre — 11,4 px.** *O canto é o único pedaço de uma casa ocupada
que sobra vazio.* Com braço de **9 px** e traço de **2 px**, o ponto mais
interior da mira fica a **28,3 px** do centro contra os **22,6** do arco:
**5,7 px de folga, medidos.** E os cantos são a silhueta universal da retícula,
o que poupa ensino.

| grau | a marca | sobre `bg` | o canal que não é cor |
|---|---|---|---|
| **alcançável** | borda 1 px, `amber` 55 % | **3,406:1** | moldura contínua, fina |
| **alvo** | quatro cantos, 2 px, `amber` cheio | **8,999:1** | **silhueta** — cantos, não moldura |
| **sob o dedo** | borda cheia + banho 22 % | **8,999:1** | o banho, que os outros não têm |

### CONSERTO: *Alcançável* não tinha a borda que esta folha manda

O desempate da borda × contorno fechou *"banho 10 % **mais** borda `amber` a
55 %"* e encerrou com *"quem passa a régua do WCAG é a borda por casa, não o
contorno"*. **A peça `18:7` não tinha borda nenhuma.** Só o banho — **1,151:1**,
contra o piso de 3:1 da 1.4.11.

> **A peça que a mesa inteira citou como "a que passa a régua" era a única marca
> da tela que não passava régua nenhuma.** Sobreviveu a E1 e a E2 porque toda a
> gente leu a decisão em vez de abrir a peça.

Reposta, e reposta como **nó a 0,55** — nunca alfa na tinta, que é a lei desta
peça paga em cinco tentativas (alfa na tinta faz o render sair chapado **e** a
leitura devolver o número certo, que é o pior tipo de defeito).

### O conjunto armado não é um mosaico, e é aritmética

> **O conjunto do passo é de CASAS e é grande (84 no telefone). O conjunto de um
> verbo de criatura é de CRIATURAS e é minúsculo.** Armar `Atacar` não acende 84
> casas: acende duas.

- **O conjunto armado é sempre `amber`**, seja qual for o verbo — *âmbar é "o que
  você pode fazer agora"* —, e o que muda entre verbos **não é a cor: é o
  conjunto e a palavra na linha do veredito.** É o que impede seis cores para
  seis verbos.
- **O violeta continua reservado ao alcance de habilidade** e o `danger` à área
  que a magia varre: são um segundo sistema, e a regra de convivência do `jogo`
  (*nunca as duas línguas ao mesmo tempo*) mantém-nas em duas no máximo.

## O preço e o alcance antes do clique

> **`{verbo} {nome} — {distância} m, ao alcance`**

**Custo fixo, com o pior verbo (`Empurrar`, 8) e a pior distância (`12,5 m`, 6):
30 caracteres. Sobram 24 para o nome.**

### As frases de X2 JÁ transbordam hoje, em produção — medido pelos dois

| a frase de hoje | caracteres | contra o teto de 54 |
|---|---|---|
| `Halvard a 3 m — dentro dos seus 9 m de alcance.` | 47 | cabe, com 7 de margem |
| `Capitão dos Bandidos a 3 m — dentro dos seus 9 m de alcance.` | **60** | **+6** |
| **`Longe demais — Halvard a 3 m, faltam 1,5 m. Aproxime-se primeiro.`** | **65** | **+11** |
| **`… Capitão dos Bandidos a 12 m, faltam 3 m. Aproxime-se primeiro.`** | **77** | **+23** |

**`recusaDoGolpe` (`App.jsx:1126-1131`) transborda com o nome mais curto da
mesa** — e é a frase que mais aparece no jogo, porque **10 de 10 plantas recusam
o ataque no turno 1** (medição de X1, no cabeçalho de `golpe.js`).

> ### LEI: o nome é o único campo que se apara. O número nunca. A saída nunca.
>
> Quem estoura o teto não é a redacção — **é o nome**, que é conteúdo do mundo e
> não se reescreve. Quando a frase passa de 54, **o nome trunca com reticência**
> (`Capitão dos Band…`) e nada mais, **porque o nome é o único dos campos que o
> jogador já sabe**: ele está a olhar para a ficha. O número e a saída são
> exactamente as duas coisas que ele não sabe.
>
> **E apara-se do lado da tabela, nunca por CSS.** Uma frase já aparada é uma
> frase; uma frase aparada por CSS é uma frase partida.

### A segunda linha custa 6 px — e 6 px são 7 casas

`Consequencia` *Largura=Ocupa a linha* (`116:12`) **quebra em vez de crescer** —
sem o eixo que E2 fabricou, isto não seria possível; com ele, é uma troca de
variante. A linha de hoje tem `minHeight: 24` (`App.jsx:20909`); duas linhas de
mono 10 px medem **30 px** (E2, a prova dos 101 caracteres).

Os tons não mudam: `Estado` sem verbo armado, **`Preço`** com alvo,
**`Impedimento`** sem alvo, `Espera` para o Mestre. Os quatro de D4 chegam.

## A desistência

**Três saídas vivas ao mesmo tempo:** `Esc` (e o gesto de voltar), **tocar o
verbo outra vez**, **tocar o campo fora do conjunto armado**.

`toque fora para desistir` mede **24** caracteres; `Esc ou clique fora para
desistir` mede **32**. **Nenhum dos dois é o problema** — o problema é que não
cabem na mesma linha do preço (`Atacar Halvard — 3 m, ao alcance · toque fora
para desistir` mede 57, e com um nome de mundo estoura por vinte).

- **Na mesa: a desistência é a SEGUNDA LINHA, fixa.** E ser fixa é a decisão:
  *uma segunda linha que nunca muda aprende-se numa luta e deixa de ser lida na
  seguinte — é o ensino mais barato que existe.* Uma frase condicional ensinaria
  o jogador a não confiar nela.
- **No telefone ela NÃO existe, e o preço dela está escrito abaixo.**

**O estado armado nunca é mudo, e agora por quatro canais:** a segunda linha (ou,
no telefone, a fila de pílulas), **o bico**, **a inversão figura/fundo** — *o que
se acende com um toque apaga-se com o mesmo toque* é a gramática de interruptor
que não precisa de ser escrita — e **`aria-pressed`**.

## A aritmética da fileira, contra a única linha de base comparável

**A linha de base é a de E2**, e só ela: telefone, com a régua, útil 337×594,
**7 colunas × 12 filas de 48 = 84 casas**, folga 1 px e 18 px. Nela os verbos
custavam os **144 px** que E1 escreveu (3×44 + 2 goteiras de 6) e a linha do
veredito custava 24.

| | verbos | região do veredito | campo | filas | casas | contra E2 |
|---|---|---|---|---|---|---|
| **E2 · publicado (E1 no papel)** | 144 | 24 | 594 | 12 | 84 | — |
| **E1 com a peça REAL** (3 filas de 63) | **201** | 24 | 537 | **11** | **77** | **−1 fila, −7 casas** |
| **W1 · uma fila de quatro** | **63** | 24 | 675 | **14** | **98** | **+2 filas, +14 casas** |
| W1 · + a segunda linha | 63 | 30 | 669 | 13 | 91 | +1 fila |
| **W1 · + a fila de pílulas (48)** | 63 | **72** | 627 | **13** | **91** | **+1 fila, +7 casas** |
| W1 · pílulas **e** segunda linha | 63 | 78 | 621 | **12** | 84 | **+0 — o ganho inteiro come-se** |

*(**[E3] Estas duas linhas diziam 47 e 71/77.** A pílula fechou em **48** — é a
divergência 47 × 48, e ela morreu no Figma em E3. **Nenhuma conclusão da tabela
muda:** 48 + 24 = 72 continua abaixo do degrau de 76, e a folga passa de 4 px a
**3**. O número mudou; o veredito não.)*

**A devolução verdadeira é 81 px, não 138.** Os 138 comparam contra um leiaute
que nunca foi construído e cujos 201 px **já custavam uma fila** — citá-los seria
contar o mesmo pixel duas vezes. *Contra o único número publicado, a fila única
devolve 81 px, e 81 px são 2 filas de casas.*

**E o buraco de 19 px é o que explica a segunda linha da tabela:** o `Botao`
*Gesto · Normal* mede **63 px**, não 44, porque **reserva 19 px para a linha da
razão nos quatro estados** — a correcção que E1 fez para o *Impedido* não
empurrar o campo. Na fileira de batalha essa reserva **nunca é usada**, porque a
fileira partilha uma linha do veredito. *A reserva sobe de nível — do botão para
a fileira* — e fica na pauta com o número: **não se paga aqui**, porque `A linha`
(`22:46`) compõe quatro instâncias que dependem dela, e ***peça mudada em
silêncio por baixo de uma composição é pior do que peça com espaço reservado.***

## A colisão da região do veredito, resolvida com o degrau exacto

Duas coisas queriam crescer no mesmo sítio: a **segunda linha** do `desenho`
(+6 px) e a **fila de pílulas de alvo** do `jogo` (47 px, dentro do arco do
polegar). **O degrau está medido: a 75 px de região há 13 filas; a 76 px há 12.**

> ### No telefone a região entre o campo e os verbos reserva 72 px, sempre, e nunca se mexe.
>
> **48** (a fila de pílulas — `ALVOS.piso`) + **24** (a linha do veredito, uma
> linha) = 72, com **3 px** de folga antes do degrau. **A segunda linha da
> desistência não cabe: custa 6 px e exactamente 7 casas.**
>
> *(**[E3] Dizia 47 e 71.** A pílula fechou em 48 e a folga desceu de 4 px a 3 —
> **continua a haver folga, e continuam a ser 13 filas.**)*

**E não é só orçamento — as duas dizem o mesmo por dois canais.** A frase diz
*"toque fora para desistir"*; **a fila de pílulas torna-o visível**: há alvos
acesos, um está escolhido, tocar o escolhido outra vez apaga-o e tocar fora da
fila desarma. É a mesma lei que tirou o `<title>` em E2 — *duas verdades sobre a
mesma coisa* —, e quando o segundo canal é uma fila de 47 px que o polegar
alcança, **o que se dispensa é a frase.**

- **Na mesa (ponteiro) não há fila de pílulas nem escassez de campo: a segunda
  linha fica.**
- **A reserva é única e pelo pior caso**, como E1 fez com a linha da razão: a
  região não encolhe quando não há pílulas. *Reservar uma vez é o que impede o
  tabuleiro de saltar quando o verbo arma.*
- **O risco, dito:** no telefone o recado da saída passa de **frase** a **forma**,
  e nada ensina a forma a quem joga pela primeira vez. **Se o `jogo` quiser a
  frase lá, ela cabe — e custa 7 casas.** O número está escrito; a escolha é de
  composição.

## `A escolha` *Forma=Pílula* serve de alvo — com duas correcções, e sem estado novo

`A escolha` · `20:77` · *Forma* (Cartão · Pílula · Aba) × *Estado* (Repouso ·
Escolhida · Impedida · Foco).

**Chega, e `Estado=Escolhida` cobre também *"este é o que o toque único
usaria"*** — porque não são dois estados: **o alvo pré-escolhido É uma escolha,
só não foi ainda o jogador que a fez**, e o código já a faz hoje
(`maisPertoAoAlcance`, `App.jsx:20847`). *O sistema não esconde quem escolheu:
escreve o nome na linha do veredito.* Uma marca diferente para "escolhi eu" e
"escolheu o sistema" seria distinção que só o sistema entende — e o sistema não
fala de si mesmo.

**Mas a peça não serve tal e qual, e faltam duas coisas — nenhuma delas é peça
nova:**

1. **`Estado=Foco` mede 75 px contra os 47 dos outros três — cresce 28 px.** Numa
   fila de alvos, tabular **empurra o tabuleiro em mais de meia casa**, que é
   precisamente o defeito do *Impedido* de E1. **O anel tem de ser desenhado sem
   mudar a caixa.** *(E é o que faz a última linha da tabela acima: com o foco, a
   região vai a 105 px e a devolução é zero.)*
2. **`rotulo`, `a marca` e `a razao` são CAMADAS, não propriedades**
   (`componentPropertyReferences` vazio nos três). É a doença que E2 diagnosticou
   e curou em três peças — ***num componente cujo texto muda por instância, texto
   que não é propriedade é um override à espera de se apagar*** — e **esta é a
   quarta**, numa peça cujo rótulo vai ser o nome de um inimigo, isto é, muda em
   toda instância e em toda luta. `a razao` é a fenda que leva o `· 3 m`.

## O celular, e o que substitui o `hover`

- **`onMouseEnter` → `onPointerMove` não é um port: é uma correcção.** Os eventos
  de ponteiro cobrem rato **e** dedo no mesmo caminho de código. O desktop não
  perde nada, o telefone ganha tudo, e some a razão de existirem dois canais para
  a mesma informação. Hoje a rota prevista só vive em `onMouseEnter`
  (`grade-de-batalha.jsx:759`), `rotaPrevista` depende de `sobre` (`:421-426`), e
  o `↳ 4,5 m até ali` idem (`:786`). **É a coisa mais barata desta fase.**
- **O dedo tapa sempre a casa.** A casa mede 48 px; a polpa do indicador adulto
  mede 16–20 mm (MIT Touch Lab, *Human Fingertip to 3D Object Contact*, Dandekar
  et al. 2003), que a ~160 ppi dá ~100–125 px. **O número escrito dentro da casa
  não é legível DURANTE o toque — só antes dele.** Qualquer desenho que ponha a
  informação de combate debaixo do dedo está a desenhar para uma mão que não
  existe.

> ### O `hover` não é substituído por um gesto. É substituído por a tela deixar de precisar de um.
>
> **Armar o verbo acende o conjunto inteiro, com o preço escrito dentro de cada
> casa, ANTES de qualquer dedo tocar no campo.** O jogador lê primeiro e toca
> depois. **O toque é o compromisso, não a pergunta.**

- **O rato pergunta antes; o dedo confirma depois.** No rato a rota desenha-se ao
  passar; **no dedo desenha-se na LARGADA**, como confirmação de 90 ms antes de a
  ficha andar — porque durante o arrasto ela está debaixo da mão. *As duas leem a
  mesma frase.*
- **O arrasto corrige, não consulta.** Com o dedo em baixo, arrastar muda o alvo
  e a linha acompanha; levantar compromete; **largar fora do conjunto desiste** —
  que é a terceira saída, ganha de graça.

## O movimento, com a saída escrita à nascença

| o que | quanto | curva | sob `prefers-reduced-motion` |
|---|---|---|---|
| o verbo enche ao armar-se | **90 ms**, `background` + `color` | `ease` | troca a seco, pousa cheio |
| o conjunto acende no campo | **90 ms**, só `opacity`, **a camada inteira de uma vez** | `ease` | aparece a seco |
| o verbo esvazia ao desarmar | **90 ms** | `ease` | troca a seco |

1. **90 ms não é escolha: é o mesmo evento.** A casa entra em *Sob o dedo* em
   90 ms e a régua acende em 90 ms — **o verbo a encher e o campo a acender são o
   mesmo acontecimento visto em dois sítios.** Dois números seriam duas verdades.
   (E 90 ms fica abaixo dos 100 ms em que um gesto ainda parece instantâneo —
   NN/g, *Response Times*, Nielsen 1993, a partir de Miller 1968.)
2. **O conjunto acende como UMA camada, nunca casa a casa.** Oitenta e quatro
   animações escalonadas são um efeito bonito que custa o turno.
3. **Classes novas: `tv-verbo-arma` e `tv-verbo-desarma`, as duas com saída
   `animation: none`** — pousam no estado final, que é onde a informação está.
   **Nenhuma `infinite`.**
4. **O bico não anima.** É parte do corpo e aparece com ele: um triângulo a
   crescer sozinho seria um segundo acontecimento onde só há um.

## O que W1 deixa para quem constrói

**Para o `backend` — a porta do tabuleiro, e o que a forma exige dela:**

1. **`alvosDoVerbo(verbo, estado)` → `{ casas, criaturas }`.** Sem ela não há
   conjunto para acender — e **o conjunto é a coisa inteira**, porque é ele que
   substitui o `hover`.
2. **`vereditoDoVerbo(verbo, alvo)` → `{ curta, custoM, penalidade, razao }`, com
   `curta ≤ 54` e catraca que falhe acima disso.** A `curta` é lida **duas
   vezes** — a linha do veredito e o `aria-label` da casa (lei de E2) —, e o
   truncamento do nome vive **aqui**, não no CSS.
3. **As fichas têm de virar alvo:** `pointerEvents: "none"` (`:648`) e a casa
   ocupada fora de `podeIr` (`:401`).
4. **`onMouseEnter` → `onPointerMove`** (`:759`).
5. **`recusaDoGolpe` tem de encolher** (`App.jsx:1126-1131`): 65 caracteres com o
   nome mais curto da mesa.
6. **O violeta da mira a 74 %** (`grade-de-batalha.jsx:611`, `opacidade={0.6}`):
   **2,689 → 3,484**. Herdado de E1/E2, ainda por pagar, e **mais urgente agora**,
   porque o âmbar e o violeta passam a partilhar a tela mais vezes. *(O número de
   linha nos documentos anteriores era `:433` e está velho.)*

**Para o `desenho`, na pauta:**

- **a reserva de 19 px sobe do botão para a fileira** — 57 px no telefone, e uma
  fila de casas.
- **`A escolha` *Forma=Pílula*: o foco que cresce 28 px, e os três textos que são
  camada e deviam ser propriedade.**
- **o eixo `Largura` do `Botao`** continua bloqueado, e **pior**: com `Armado`,
  levaria o conjunto de 26 a **52**.

## As armadilhas do Figma, reconfirmadas — e uma delas apagou trabalho

1. **`clone()` não copia `componentPropertyReferences`** (K1b). Apanhou duas
   vezes na mesma etapa — o `o endereco` de `A casa` e o `rotulo` do `Botao` — e
   **a segunda só apareceu numa foto**: `setProperties` correu sem erro nenhum e
   o botão continuou a dizer `AGIR`. *Ela não falha: ignora.*
2. **Um script que estoura desfaz a transação INTEIRA.** Um conserto que correu
   dez linhas antes do erro **voltou atrás sem aviso**. *Depois de um erro, nada
   do que correu antes dele aconteceu* — releia numa chamada nova.
3. **`node.query()` não aceita espaço no atributo.** `query("TEXT[name=o
   custo]")` devolve `null` em silêncio. Use `findOne`.
4. **Em `A casa`, o alfa mora na opacidade do NÓ, nunca na tinta** — a lei de D4,
   paga em cinco tentativas, e ela apanhou o conserto da borda de 55 %.

**No Figma (`e5wJUzInAssoebx5npssKc`):** `Botao` `9:170` (novos `124:7`,
`124:3333`; apagados `124:2`, `124:3328`) · `A casa` `18:31` (novo `125:177`;
consertado `18:7`) · página `W1 · o verbo armado` `125:3486`, com os quadros
`126:2` (*o par comparável*) e `128:3489` (*alcançável não é alvo*).

---

# O segundo emprego — a fala, as quatro frases e o violeta (W2 · 16/09)

**O campo não muda de emprego: ganha um.** O `jogo` compôs o momento em
`mente/w2-jogo.md`; o `desenho` mediu a forma em `mente/w2-desenho.md`.

**Regra da fase, e ela é a notícia: nenhuma peça nova, nenhuma variante nova,
nenhum token novo.** `Campo` fica em 12, `Consequencia` fica como está, `T` fica
com as suas 14 cores. A etapa inteira coube no que já existia.

## O campo fica exactamente como está — e o convite é o momento

`Campo` · `133:90` · **12 variantes, intocadas.** `a dica` já é propriedade TEXT
(padrão `Fale, aja, explore…`), `Tom` é *o que está armado*
(Neutro · Âmbar=milagre · Violeta=habilidade · Erro), `Estado` é
Repouso · Foco · Desativado.

**O quinto estado do `placeholder` foi redigido, medido — `O que você faz? A voz
alcança.`, 30 caracteres contra os 35 da dica mais longa que embarca — e
RECUSADO.** Quatro razões, e a segunda é a que manda:

1. o `jogo` já pôs `A voz alcança.` na linha do veredito, e a mesma frase em dois
   sítios são **duas verdades sobre a mesma coisa** (a lei que tirou o `<title>`
   em E2);
2. > **o `placeholder` apaga-se no primeiro caractere digitado.** Um convite a
   > falar que morre quando a fala começa é um convite que não se pode reler — e
   > o momento em que se precisa de o reler é a meio da frase.
3. **o eixo `Tom` já significa uma coisa.** Convidar pela borda pedia um quinto
   `Tom`, e o eixo passaria a dizer *o que está armado* **e** *em que rodada
   estamos*. E quem reaproveitasse `Tom=Erro` pagava **19 px** de empurrão
   (72 px contra os 53 das outras nove) no instante em que o jogador olha para o
   tabuleiro — o defeito do *Impedido* de E1, pela terceira vez;
4. **o convite já lá está, e está sempre:** a dica de repouso começa por
   **"Fale"**.

**O que torna o momento legível não é uma palavra — é o que está apagado à volta
dela.** Na rodada da recusa, `Atacar` vem `disabled` (`:20877`, `:20880`), o véu
está no máximo, e **o campo é o único controlo da tela que não foi recusado nem
gasto.** *O convite é a ausência de alternativa, não um anúncio* — é a forma mais
dura de "o sistema não fala de si mesmo".

**Dívida de peça, declarada:** o padrão de `a dica` na peça é `Fale, aja,
explore…` e o código diz `O que você faz? Fale, aja, explore…`. **A peça perdeu a
pergunta.** Não foi corrigida: `Campo` está por baixo de composições que o `jogo`
não reviu.

## A linha do veredito e o chat são DUAS regiões, e andavam a ser uma

| | **a linha do veredito** | **o chat** |
|---|---|---|
| quando | **antes** do clique | **depois** do facto |
| onde | `App.jsx:20909` | `pushMsgs` |
| tipografia | `tv-mono` 10 px, `minHeight: 24` | prosa, largura da conversa |
| teto | **54** | **nenhum**, quebra |

> **O golpe, o passo e a reação não partilham a linha do veredito: partilham o
> CHAT.** O molde da poção escreve em `pushMsgs` (`:19575`). A fala tem uma linha
> em cada região: *"a voz alcança"* é veredito, *"o bandido hesita"* é desfecho.

**E a linha do veredito NÃO vive sempre na árvore.** Ela está dentro de
`{acoesAbertas && …}` (`:20840`), e `acoesAbertas` nasce `false` (`:4896`) sem
nada que a abra sozinha — **contra o comentário de `:20900`, que diz o
contrário.** *Um veredito que depende de o jogador abrir uma gaveta não é um
veredito antes do clique.* É de W3, e fica com endereço.

### O glifo do chat nomeia o ASSUNTO, nunca o veredito

É a gramática não escrita de 97 glifos em uso: `⚔` golpe · `📏` distância ·
`👣` passo · `🎲` dado · `☠` morte · `⏳` o relógio do turno.

> **A fala é `💬`** — livre no chat (a única ocorrência no `src/` é
> `missoes.js:109`, ícone de tipo de missão), e **irmão do `IconeBalao` que a
> caixa já usa** (`:21552`). *A linha que o campo produziu usa a marca do campo.*
> Vale também para a recusa da segunda fala da rodada (`💬`, não `⏳`: o assunto
> é a fala, não o relógio).

### A segunda linha do veredito custa 6 px e ZERO casas

Uma linha de mono 10 px ocupa 24 px; duas ocupam 30 (E2). **W1 já tinha reservado
esses 6 px para a linha da desistência e recusou-lha no telefone** (71 → 77 px,
e o degrau está em 75/76: 7 casas).

> **Não colidem, por construção: a desistência só existe com um verbo ARMADO; a
> voz só existe com o golpe RECUSADO — e um verbo recusado não se arma.**

E na rodada da recusa **não há fila de pílulas** (nada está armado, não há alvos):
a região pede **30 px** dentro dos **71 que W1 reserva pelo pior caso**, com
41 px de folga. *A reserva única pelo pior caso paga esta etapa sem negociação.*
A segunda linha é `Consequencia` *Forma=Linha*, **`Tom=Estado`** — a de cima já é
o `Impedimento`, e a de baixo é o que **não** está impedido.

## As quatro frases do golpe — `LINHAS_DO_GOLPE`, e ela mora em `golpe.js`

**Três das quatro transbordam hoje, e a pior transborda com um nome de ZERO
caracteres, por 8** (62 de custo fixo contra 54). **Aparar o nome não a salva.**

> ### A lei de W1 (*"o nome é o único campo que se apara"*) é sobre TRUNCAR. O que esta frase precisa é de ser REDIGIDA — e são coisas diferentes: *aparar* é cortar um facto que a frase decidiu dizer; *redigir* é a frase decidir dizer menos factos.

**A gramática, e ela é a decisão — não as frases:**

> ### `{nome} a {distância} m — {veredito}.`
>
> Três das quatro partilham-na, e **só muda o que vem depois do travessão**: o
> jogador aprende uma forma e passa a ler só a cauda. A quarta é excepção porque
> não há alvo de que dizer distância.

Teto **54** (E2) · pior nome das tabelas **18** (`Sentinela Blindada`, conferido
pelos dois em varreduras independentes) · pior número de `metrosTxt` **4**
(`10,5`, `grid.js:50`).

| id | a frase | fixo | sobra p/ nome | pior caso |
|---|---|---|---|---|
| `semAlvo` | `Ninguém de pé ao seu alcance.` | **29** | — | 29 |
| `distancia` | `{n} a {d} m — faltam {f} m.` | **26** | 28 | **44** |
| `parede` | `{n} a {d} m — parede, contorne.` | **29** | 25 | **47** |
| `aoAlcance` | `{n} a {d} m — ao alcance.` | **23** | 31 | **41** |

**Cai a ordem, nunca o número e nunca o nome** (contrato do `jogo`) — com uma
excepção medida: **`contorne` fica.** `App.jsx:1121` escreve porquê — *"andar
resolve a distância e não resolve a parede"* —, e sem ela o reflexo depois de ler
metros é andar a direito contra a pedra. **E a parede GANHA um número que hoje
não tem:** contornar 3 m e contornar 20 m são decisões diferentes.

**A casa é `src/golpe.js`, não `estilo.js`.** O cabeçalho de `estilo.js` recusa-a
sozinho: a folha saiu de `constantes.js` para não ter *"duas mesas diferentes no
mesmo balcão"*, e **não importa nada, de propósito** — a tabela precisa de
`metrosTxt`. E `App.jsx:1106` já diz que quem mede é `golpe.js`; a única razão
escrita para as funções viverem no App é *"fora do corpo que renderiza"*.
**Um varredor não lê JSX; lê isto.** `recusaDoGolpe`, `linhaDoGolpe` e
`maisPertoAoAlcance` mudam de casa inteiras, e **o aparo mora na tabela, nunca na
tela.**

**A catraca, cinco asserções, e as cinco lêem a tabela de volta:** o `fixo`
declarado bate com a própria frase · `fixo + 18 ≤ 54` · os 27 nomes do bestiário
cabem · um nome sintético de 200 cabe e acaba em `…` · **nenhum nome de ≤ 25 é
aparado**.

> **O teto de nome na fonte não é condição** — a entrada mais apertada só apara
> acima de **25**, e o máximo das tabelas é 18. Subscreve-se na mesma, com
> número: **`limpar(nome, 24)`**, que é o maior que nunca faz o aparo morder.

## O violeta da mira — e 74 % não chega

**O número herdado (2,689 a 60 %) foi medido contra `T.bg` NU.** O contorno corre
na fronteira da união, e por baixo dele há chão mais claro: a faixa de região
(`:559`), a **cobertura** (`:573`) e o traço da lama (`:572`).

| a linha | chão nu | **cobertura + faixa** | a lama |
|---|---|---|---|
| hoje — `T.violet` @ 60 % | 2,679 | **2,575** | 1,892 |
| **@ 74 %** — o número da pauta | 3,485 | **3,235** | 2,187 |
| **`T.violetSoft` @ 60 %** | 3,781 | **3,615** | 2,623 |
| `T.amber` @ 60 % (o passo) | 3,847 | 3,662 | 2,682 |

> ### 74 % dá **3,235** contra o pior chão inteiro: passa a norma (**WCAG 2.1 SC 1.4.11**, 3:1) e **falha o piso da casa (3,272)** por 0,037. E 75 % passaria por 1,5 % — exactamente o *"degrau mais baixo que passa"* que o `lineStrong` recusou por escrito.
>
> ### A correcção não é opacidade. É o token: `T.violet` → **`T.violetSoft`** em `grade-de-batalha.jsx:611` e `:619`. Uma palavra em cada linha. **2,575 → 3,615** (+40 %), e `:619` de 3,034 → 4,432.

**A opacidade não se toca e o âmbar não se toca** (3,662, já passa os dois pisos).
Três ganhos que não são acessibilidade:

- **`T.violetSoft` já é a cor da mira** (`:641-643`, e a legenda em `:837`).
  Hoje o anel da mira e o contorno do alcance dela falam em **dois roxos
  diferentes**;
- **as duas línguas do tabuleiro ficam iguais em força**: hoje a mira é **42 %
  mais fraca** que o passo (2,575 contra 3,662); depois, 1,3 % de diferença.
  *Um tabuleiro que fala duas línguas não pode dizer uma delas mais baixo;*
- **a regra que fica:** `violet` é tinta de **superfície** (corpo, borda, sobre
  `panel`); **`violetSoft` é tinta de traço sobre o tabuleiro.**

### A lama, e ela NÃO é do violeta — dívida com número

Falha para os dois quase igual (**2,623** violetSoft · **2,682** âmbar), em
**14,0 %** do comprimento da fronteira (largura 0,07 / passo 0,5), e só onde ela
faz aresta com terreno difícil. **Nenhuma alfa a cura:** a 0,12 o contorno ainda
mede 3,265 e a lama já desapareceu (**1,171:1** contra o chão). Escurecer a cor
faz o mesmo.

> **A correcção completa é uma ORLA:** uma segunda linha sob o `Contorno`
> (`:201`), em `T.bg`, a 1,6× a largura — a solução de cartografia para uma linha
> que atravessa terrenos. A cor adjacente passa a ser sempre `T.bg` e o rácio é
> **3,781 em todo o tabuleiro**, para os dois contornos e para o `danger`.
> **Não é deste ciclo** (toca o `Contorno`, logo toca tudo de uma vez), e fica
> escrita para ninguém a redescobrir.

## O que W2 deixa para quem constrói

1. **`LINHAS_DO_GOLPE` + `TETO_DA_LINHA` + o aparo em `src/golpe.js`**, e as três
   funções mudadas de casa. Catraca em `testes/teste-golpe.mjs`.
2. **`T.violet` → `T.violetSoft`** em `grade-de-batalha.jsx:611` e `:619`.
3. **`💬`** para a linha da fala e para a recusa da segunda fala da rodada.
4. **A segunda linha do veredito**, `Consequencia` *Forma=Linha* · *Tom=Estado*,
   dentro dos 71 px já reservados.
5. **O campo não se toca.**

**No Figma (`e5wJUzInAssoebx5npssKc`):** página `W2 · o segundo emprego`
`136:2`, com `136:3` (*a quinta dica — e é só uma dica*), `136:28` (*as quatro
frases contra o teto de 54*, com a régua de 324 px) e `137:16` (*o violeta da
mira — 2,575 → 3,615*, seis células sobre os três chãos reais). `Campo`
`133:90` foi **lido e não tocado**.

---

# A trava — quem não responde tem o jogo de hoje (K2 · 16/09)

**K2 não redesenha nada de K1 nem de K1b.** Ela prova a trava, e a prova
acontece **antes de a peça existir** — que é a ordem que a pessoa pediu, e é o
que impede a peça de nascer com o defeito que ela deveria evitar. O escrito dos
dois seniores vive em `mente/k2-jogo.md` e `mente/k2-desenho.md`.

> ## O contrato, numa frase
> **Quando o jogador não responde, K3 tem de chamar `escolherReacao` as mesmas
> vezes, com os mesmos argumentos, na mesma ordem, e deixar os mesmos dezasseis
> efeitos nos mesmos sítios — incluindo o número de rolos de `Math.random`.**

## O erro que quase nasceu, e ele tem número

O desenho óbvio de K3 — *a expiração resolve só o golpe da janela* — **quebra a
trava em 37,44 % das sementes**, medido em 120 000 pares. Hoje o laço **repete**
`escolherReacao` golpe a golpe quando a `chance` falha: o ladino esquiva
**97,6 %** das rodadas, não 60,2 %; o contra-atacante **96,4 %**, não 55,6 %.
Custo silencioso do erro: **+12,4 % de dano sofrido por rodada** ao furtivo.

> ### «Coberto» quer dizer *não gera segunda pergunta*, nunca *não gera reação*. A janela agrupa a PERGUNTA; ela não agrupa a MECÂNICA.

*As 85 asserções de K1b estavam verdes com uma ficha que nunca rola um dado. Uma
catraca que só sabe dizer «o certo está certo» não protege de nada* — por isso a
suíte **constrói o desenho errado e assere que ele diverge**, pelo número.

## Sem mouse — e a trava é a última linha da tabela

| o instante | o foco | por quê |
|---|---|---|
| a janela abre | vai para a parada 1 do cartão | a única viagem que o sistema faz por ele, e poupa-lhe Tab dentro de uma janela com relógio |
| ele responde | **volta ao elemento anterior** | o foco não pode cair no `<body>`: guardar o elemento antes de mover é obrigação de K3 |
| ele recusa | idem | recusar é uma resposta |
| **a janela EXPIRA** | **não se mexe** | **quem não respondeu não pediu nada** |
| o cartão resolvido sai | não se mexe | `Etapa=Resolvida` não contém alvo nenhum — é leitura, não controlo |

**O foco só se move para quem agiu; nunca para quem não agiu.** E **a janela
nunca rouba o foco do campo de texto**: com o campo focado ela existe, mostra-se
e expira — *roubar o foco resolveria a ergonomia de um jogador e partiria a de
outro, e a expiração não é castigo, é a trava a funcionar.*

**Paridade de gestos, virada tabela** (`ATALHOS_DA_JANELA`): aceitar e recusar
custam **1 toque e 1 tecla**; escolher um segundo verbo custa uma tecla a mais —
**e o leque não expira, logo a tecla a mais não é paga em tempo.** *A paridade
que interessa não é de gestos: é de resultado sob relógio.*

**Dívida de peça declarada:** `O chamado` **não tem `Estado=Foco`**, e a razão
que K1 deu (*"está focado desde que existe"*) é falsa — `Etapa=Direta` tem
**duas** paradas, não uma.

**O alvo de toque, medido no código** (215 `<button>`, 194 calculáveis): menor
**20**, mediana **30**; **7,2 %** abaixo dos 24 px da WCAG 2.2 SC 2.5.8, 87,1 %
abaixo dos 44 da Apple HIG, 91,2 % abaixo dos 48 do Material. **A peça da Fase K
entra a 48 / 56 / 47 — acima de tudo.**

## A aba lenta

> ## O trilho não tem relógio próprio. Ele é uma leitura do relógio da janela.
>
> Tudo o que se vê deriva de `agora − t0`, lido do relógio de parede. **Dois
> relógios são um a mais.** Anima-se a **entrada e a saída** do objeto (`tv-trilho-nasce`, `tv-trilho-sai`); **nunca o valor que ele mede.**

**A aba escondida não abre janela nenhuma** — porta `escondida`, a nona, e ela é
a **primeira** da precedência: as outras oito dizem *«não perguntes»*, esta diz
*«não esperes»*. Resolve como hoje **na hora**, e **não alimenta a escada do
silêncio**: uma expiração que o jogador nunca viu não é uma expiração dele.

**A janela expira ao relógio de parede, olhasse alguém ou não** — senão mudar de
aba congelaria o combate, e o resultado passaria a depender da visibilidade, que
nenhuma semente reproduz. **Aos 40 s ele vê nada de novo: o log, byte a byte o
jogo de hoje.** *Isso é a trava, não um buraco.*

**A corrida que mata resolve-se com um portão de uma via**, e o segundo a chegar
**não rola um dado sequer** — *um resultado deitado fora que rolou um dado é pior
do que um resultado errado: o erro aparece, e o desalinhamento não.*

**O `+1 s` de `prefers-reduced-motion` não é vantagem de jogo:** vive inteiro nos
últimos 27 % da janela e vale ~4 fixações (Rayner 1998), sobre uma decisão
binária. **Mas a lei dos bónus era só de direcção e não tinha teto** — a outra
metade fica escrita.

## O dente `D5e` — o relógio da tela conta tempo, nunca quadros

Três asserções em `check-formas.mjs`: nenhuma classe de `MOVIMENTO_CSS` anima uma
duração do relógio da reação · um piso de alcance (≥10 classes, ≥8 números lidos
da tabela), *porque catraca verde por vazio é pior que catraca nenhuma* ·
`TETO_DE_CONTADOR_DE_QUADRO` congelado (ui 2 · App 2 · grade 1).

**O anti-padrão já vivia na casa:** `grade-de-batalha.jsx:385` conta **tiques**
(`i += 1`), não tempo. Cosmético ali; **fatal se copiado para o trilho.** É o
endereço que o teto guarda.

> **Uma colisão fica ESCRITA, e é decisão do `regente`:** `.tv-dice` declara
> `tvGlow 1s`, e 1 000 ms é exactamente `aperto` e `bonusContagem`. É
> **coincidência, não cópia** — o brilho do d20 existe desde antes de haver
> relógio de reação. **Não se afina `tvGlow` para a catraca ficar verde:** um
> teste que dita a duração de uma animação viva é o rabo a abanar o cão. Fica em
> `COLISAO_DE_RELOGIO_ESCRITA`, com data e razão, sob a regra anti-cemitério —
> **uma entrada declarada é uma declaração; 242 eram um inventário.**

---

# A reação acontece — o cartão, o relógio e as quatro saídas (K3 · 16/09)

**K3 é a etapa que constrói, e por isso ela não redesenha nada.** K1 decidiu a
forma, K1b o tempo, K2 a trava; aqui a peça nasce em código. O escrito dos dois
seniores vive em `mente/k3-jogo.md` e `mente/k3-desenho.md` — e este bloco é só
o que ficou de pé depois de construído e conferido vivo.

> ## O que o jogador vê, numa frase
> **O golpe chega, um cartão nasce em cima da linha do veredito com o facto, o
> verbo já armado e o preço; quinze segundos depois ele resolve-se sozinho — e
> o jogador nunca lê o nome de nenhum mecanismo.**

## As quatro saídas, e o que as separa é a gramática

`respondeu` e `expirou` diferem em **quem** agiu, não em **se** agiu. A regra que
gera a tabela cabe numa linha e é catraca em `testes/teste-painel-reacao.mjs`:

> **Toda linha da coluna «você» começa por `você `. Toda linha da coluna «não foi
> você» termina em ` por você`.** Uma frase que não obedeça às duas é defeito de
> tabela, não de gosto — *a diferença entre as duas saídas tem de caber na
> gramática, senão ela tem de ser explicada, e explicar é o sistema a falar de si
> mesmo.*

`recusou` é a única sem gesto e a única sem glifo, e **não escreve nada no log** —
o golpe inteiro já aparece na linha `🛡` de sempre, e uma linha a dizer *"nada
aconteceu"* seria o mecanismo a falar de si. O que ela escreve é **a nota ao
Narrador**, que é por turno e não toca no teto do prompt.

As palavras moram em `src/palavras-da-reacao.js` — nove tabelas e duas funções
puras, **zero frase montada dentro de um JSX**.

## O relógio: um só, e o trilho é uma leitura dele

Onze segundos **sem relógio nenhum**, depois quatro de trilho, e o último em
`danger`. O cheio é `transform: scaleX()` com `animation-delay` **negativo**
calculado de `agora − t0`: a barra nasce na proporção que lhe cabe e **não há
número de píxeis nem percentagem escrita em lado nenhum**. A expiração é do
relógio de parede; `animationend` não decide nada.

## Quatro decisões deste `regente`, e cada uma tem o seu motivo

1. **Quem responde resolve-se pelo MESMO caminho de quem não responde**
   (`reacaoDoSilencio` a partir de `abre.ordem`). Parece um detalhe de fiação e é
   a decisão que salva a fase: a `chance` continua a viver dentro de
   `escolherReacao` e o laço continua a tentar o golpe seguinte quando ela falha
   — **o ladino esquiva 97,6 %, como hoje, em vez de 100 % de graça.** Resolver a
   reação directamente teria dado ao jogador que responde um mundo melhor que o
   de hoje, em silêncio, e sem ninguém ter decidido isso.
2. **O envelope não espera o cartão.** A resolução vai ao Mestre assim que a
   rodada resolve; o cartão vive os seus 1 200 ms **por cima** da espera de
   ~13,4 s que já existia. Poupa 1,2 s por rodada e não custa nada a ninguém.
3. **O cartão diz o saldo de PM, não só o preço** — e é conserto de uma colisão
   medida: no telefone (375 px) o cartão tapa **57 % da tira do herói**, e o que
   fica por baixo é **a barra de PM inteira**, no segundo exacto em que ele pede
   ao jogador que decida gastar PM. *Mostrar o preço e esconder a bolsa é meio
   veredito.* A etiqueta só aparece quando alguma reação oferecida custa PM.
4. **O cartão tem teto de 560 px.** A região do veredito varia **288 → 1 400 px**
   (4,86×): sem teto, a regra do trilho (*mede a largura da janela*) daria um
   relógio de 1 400 px de percurso no monitor. K1 compôs num quadro de 375 e
   ninguém tinha fechado a outra ponta.

## `deixar passar` é fiação, não regra — e a distinção custou um defeito

`ritmoDaRodada` faz o certo ao fechar a rodada por `preferencia`: ela responde
*«não perguntes»*, e não perguntar está correcto para `aparar sempre` **e** para
`deixar passar`. Quem sabe a diferença é **o App**, que tem a preferência na mão.
Sem essa linha, a pílula que promete *nunca reajas* deixava o motor de hoje reagir
e **gastar o PM na mesma** — o oposto exacto do que o jogador escolheu.

## A fila da ficha é a conformidade, não um mimo

> **Quando um golpe chega** · `[✓ EU DECIDO]` · `[EU DECIDO, SEM PRESSA]` ·
> `[APARAR SEMPRE]` · `[DEIXAR PASSAR]`

**WCAG 2.2.1 (*Timing Adjustable*, nível A)** cumprida duas vezes: escolher um
verbo **desliga** o limite de tempo, e *sem pressa* **estende-o sem fim**. E mora
na ficha porque ali o jogador lê *"como o meu herói se defende"*, que é ficção —
e não *"configurar reações"*, que é mecanismo.

---

# O alvo de toque sai de tabela — a pílula, o piso e a régua da aparição (K4 · 16/09)

## A pílula media 27,5 e o desenho dizia 48 — e o defeito não era o enchimento

A fila da ficha compunha a altura do alvo somando `text-[9px]` (que dá **só**
`font-size`, e herda a entrelinha 1,5 do preflight do Tailwind), `py-1.5` e a
borda: **13,5 + 12 + 2 = 27,5**. **Nem 27 nem 48 estavam escritos em lado
nenhum** — e é por isso que as 102 asserções de K3 passaram verdes: *não há texto
que uma suíte possa ler de volta.* A primeira lei da casa falhada na sua forma
mais limpa: **não havia número errado, havia número ausente.**

> ### Uma altura composta por `font-size` + enchimento é uma altura que muda sozinha.
> Trocar `text-[9px]` por `text-[10px]` — uma decisão de legibilidade — move o
> alvo de toque 1,5 px sem ninguém ter tocado numa medida de alvo. **A régua e o
> texto não podem ser o mesmo número.**

## O defeito real: a fila montava a peça à mão, e inventou uma quinta gramática

`A escolha` *Forma=Pílula* **nunca existiu em código** — esta folha dizia-o por
extenso. Sem primitiva, a fila copiou a pílula mais próxima (as sub-abas da
gestão, o ritmo de marcha) e herdou três defeitos que a peça não tem:

| lei desta folha | o que a fila fazia | o número |
|---|---|---|
| nunca preenchimento âmbar cheio para seleção | `background: ativo ? T.amber` | `T.amber` tem 37 usos e é a assinatura da **ação** |
| borda `amber` + filete de 3 px + o visto | só o visto | 1 dos 3 canais |
| borda de controlo é `lineStrong` | `T.line` | **1,295:1**, reprova o SC 1.4.11 (`lineStrong` dá 3,512:1) |

**E uma quarta, de leitor de ecrã:** `aria-pressed` media **0 ocorrências em
`src/`**, em **221 `<button>`**. A fila que existe para cumprir a WCAG 2.2.1
falhava a 4.1.2. **A família tem 19 membros** (a ficha do `App.jsx` era um deles;
ficam 18, e o dente **D5f** de `check-formas.mjs` congela o número).

## `ALVOS`, e por que o piso é 48

`ALVOS = { piso: 48, chamado: 56 }`, em `src/estilo.js`, exportado por
`constantes.js` como `T` já é. **48 e não 47:** 44 é o mínimo do WCAG 2.5.5, 48 é
o do Material, é a casa do tabuleiro, é a linha do recuo do leque — e fecha o
número que K1 deixou dito por não fechar. **Um piso, quatro leitores**, em vez de
quatro números parecidos. O orçamento do telefone de W1 aguenta: 48 + 24 = **72**
contra o degrau de **75**.

**O `LARGURA_MAXIMA_PX = 560` fica fora, de propósito:** é tecto de largura, não
piso de alvo, e uma tabela com dois sentidos é a próxima dívida.

**O custo, medido:** a região da ficha vai de **98,5 px** a **139,5** (+41), e a
**195,5** (+97) no único caso em que passa a três filas. **Zero filas a mais no
telefone**, nos quatro heróis possíveis. E fica dito o que não se consertou: na
mesa a segunda fila falha por **5 px** no pior caso e passa por **0,4 px** no
penúltimo — *uma fila decidida por fracções de pixel não é um leiaute*, e o que a
decide não é a peça: é o painel de 320 px, que dá à mesa uma coluna **24 % mais
estreita que a do telefone** (258 contra 321).

## A régua da aparição — quando uma peça deixa de ser acontecimento

A informação que o simples *aparecer* de uma peça carrega é **`−log₂(p)`**, com
`p` a fracção das unidades de jogo em que ela aparece (Shannon, 1948). Não é
analogia; é a definição.

| | `p` | bits |
|---|---|---|
| a janela da reação, hoje (7 das 12 classes) | 0,986 | **0,020** |
| a mesma janela, abrindo só em golpe que acerta | 0,492 | **1,023** |

> ### Acima de 1 bit é acontecimento. Abaixo de 0,1 bit é moldura. E uma moldura com relógio é um pedágio.

**Hoje o cartão está a 0,020 — cinco vezes abaixo do chão da moldura.** Abrir só
em golpe que acerta multiplica por **50** a informação da aparição, **pagando com
metade das interrupções**.

**Os estudos:** Mackworth (1948) mede o *vigilance decrement* — a deteção de um
sinal recorrente degrada-se dentro da primeira meia hora; Anderson *et al.*
(CHI 2015) mostram por fMRI que a resposta a um aviso repetido cai ao fim de
poucas repetições, e que **variar a forma atrasa a habituação** — a nossa peça
aparece com a mesma cara em 12 classes de 12; Bailey & Konstan (2006) mostram que
o custo de uma interrupção depende do **momento**, não do conteúdo — que é o
*62,4 % do dano chega sem pergunta* dito noutra língua.

## O veredito de forma da Fase K

**A peça está certa e o ritmo está errado.** O caso comum é binário
(*Etapa=Direta*, 12 classes em 12 — o chão da lei de Hick), **73 % da janela não
tem relógio** (11 s de 15), há saída em todos os estados e o limite de tempo
desliga-se por duas estradas (WCAG 2.2.1). **O que cansa não é a forma: é
acontecer quase sempre.**

**E uma peça que precisa de reimprimir a informação que tapa não tem defeito de
conteúdo: tem defeito de endereço.** O cartão tapa **57 % da tira do herói** no
telefone, incluindo a barra de PM, e K3 consertou-o escrevendo o saldo de PM lá
dentro. O conserto está certo; **o diagnóstico fica escrito com ele.**

## E a lei que este ciclo aprendeu de novo, no sítio mais caro

**Comentário com crase dentro de um template-literal fecha a string.** As quatro
linhas de comentário que explicavam `.tv-escolha-troca` traziam oito crases dentro
de `MOVIMENTO_CSS`, e `src/estilo.js` deixou de carregar: `<body>` com 103 bytes,
tela preta, um `SyntaxError` na consola — e **o build tinha sido dado por limpo**.
A folha de estilo desta casa é uma string de 300 linhas, e **todo comentário
dentro dela é conteúdo, não comentário de JavaScript**. Escreve-se *formas.md:355*
sem crase, ou não se escreve. *A conferência viva é o único lugar onde isto
aparece — foi o terceiro defeito em dois ciclos que a suíte deixou passar e o
navegador apanhou em trinta segundos.*

---

# A mesa volta ao Figma — o alvo, o anel e a calha que não existia (E3 · 16/09)

**Arquivo `Taverna — biblioteca` (`e5wJUzInAssoebx5npssKc`), ampliado e corrigido,
nunca duplicado.** Nenhum `.js`, `.jsx` ou `.mjs` foi tocado: o bastão do
`App.jsx` ficou inteiro com o `oficial` o ciclo todo. **Zero hex solto** — cada
cor nova entrou ligada a variável (`bg` · `VariableID:1:3`, `ink` ·
`VariableID:1:7`).

## 1 · A divergência 47 × 48 está fechada, e fechou no Figma

`A escolha` · `20:77` · *Forma=Pílula*, os quatro `corpo`: **`20:34`, `20:39`,
`20:44`, `20:51` — 47 → 48.**

**E o modo como fechou importa mais que o número.** Não se acrescentaram 0,5 px
de enchimento em cima e em baixo: **o enchimento vertical foi a zero e a altura
passou a ser fixa.** Antes o 47 era `15 + 15 de texto + 15 + 2 de traço`; agora é
**48, escrito**. É a lição de K4 feita estrutura:

> ### A régua e o texto não podem ser o mesmo número — e no Figma isso escreve-se pondo o enchimento a zero.
> Enquanto a altura for `enchimento + texto`, trocar `text-[9px]` por
> `text-[10px]` — uma decisão de legibilidade — move um alvo de toque sem ninguém
> ter tocado numa medida de alvo. **Com a altura fixa, a legibilidade e o polegar
> deixam de partilhar um número.**

**Os três estudos que sustentam o 48, e eles concordam:** WCAG 2.5.5 (AAA) pede
**44×44**; a Apple HIG pede **44 pt**; o Material pede **48 dp**. **48 é o menor
número que passa nos três** — e é o número que o código já tinha em
`ALVOS.piso`. *A divergência não existe mais e não volta a ser declarada.*

## 2 · O foco não muda o tamanho de alvo nenhum — e agora é verdade nas três formas

| `A escolha` | Repouso | Foco **antes** | Foco **agora** |
|---|---|---|---|
| **Pílula** | 48 | **75** (+28) | **48** |
| **Aba** | 48 | 55 (+16) | **48** |
| **Cartão** | 88 | 104 (+16) | **88** |

**O defeito era geometria:** o *Foco* embrulhava o corpo em dois quadros — *anel
de foco* e *o vão* — que **somavam ao leiaute**. Na Pílula o quadro de fora tinha
**8 px de enchimento em cima e em baixo em vez de 2**, e é daí que vinham os 28.

> ### Um anel de foco que empurra o vizinho não é um indicador: é um alvo em movimento.
> E ele move-se **na direcção de quem menos o pode perder** — o jogador de
> teclado, que é exactamente quem a fila da ficha existe para servir. No telefone
> é pior: é o defeito que faz o dedo errar.

**A fila de quatro pílulas com goteira de 8 px absorve os 4 px do anel com metade
de folga — deslocamento zero**, e esse número (já escrito em *"O anel de foco,
aplicado a um tabuleiro"*) só é verdade porque o anel deixou de ocupar leiaute.

## 3 · O anel no Figma tem DUAS construções, e a razão é dura de descobrir

**A frase que esta folha escrevia — *"no Figma o anel é geometria porque o Figma
não tem `box-shadow` de dois degraus"* — é falsa.** Tem: duas `DROP_SHADOW` de
raio **0**, deslocamento **0**, alastramento **2** (em `bg`) e **4** (em `ink`),
pela ordem do CSS, e a de dentro tapa a de fora exactamente como o `box-shadow`
faz. **O `Botao` desta mesma biblioteca já a usava desde D3** — a folha declarava
uma limitação que o próprio arquivo desmentia, e **ninguém abriu o arquivo para
ver**. *É a lição de K4 outra vez, do outro lado: o documento mentiu sobre a
ferramenta em vez de mentir sobre o código.*

**Mas a sombra do Figma não é o `box-shadow` do CSS, e a diferença apaga anéis
em silêncio:**

> ### O `box-shadow` do CSS nasce da CAIXA. A sombra do Figma nasce da SILHUETA PINTADA.
> Um corpo sem tinta tem silhueta vazia — e a sombra **não desenha nada, sem erro
> e sem aviso.**

**Medido, e é o achado mais caro do ciclo:**

| `Botao` · `Estado=Foco` | o corpo tem | o anel de sombra |
|---|---|---|
| `Papel=Chamada` | tinta sólida (`amber`) | **renderiza** |
| `Papel=Gesto` | só traço de 1 px | **NÃO renderiza** |
| `Papel=Recuo` | nem tinta nem traço | **NÃO renderiza** |

**`Papel=Gesto` são os seis verbos da tela da batalha e `Papel=Recuo` é o
`esperar`.** A biblioteca declarava um anel de foco para eles e **não o mostrava
em nenhum** — indicador de foco visível, na peça que E3 está a montar: **zero**.
Quatro variantes (`9:73`, `9:80`, `9:129`, `9:136`) passaram a **anel absoluto**:
dois quadros `layoutPositioning = "ABSOLUTE"` com recuo de −2 (traço `bg`) e −4
(traço `ink`), 2 px cada, `INSIDE`. **Absoluto não entra no auto-layout**, logo é
a mesma promessa do `box-shadow`: *o anel não ocupa leiaute*.

**A lei que fica, e ela responde ao dente que K4 comprou com número:**

> ### Toda peça que promete um anel ou uma sombra tem de dizer COMO não ser apagada — e a lista é de três, não de uma.
> 1. **No código, estilo inline vence a folha sempre.** O anel que vive em
>    `.tv-anel-foco` morre debaixo de um `boxShadow` escrito no `style={{…}}`
>    — foi assim que a fila que existe para cumprir a WCAG 2.2.1 passou a falhar
>    a 2.4.7 (K4 §5.2). **Sombra e anel escrevem-se na mesma declaração, ou não
>    se escrevem.**
> 2. **No CSS, `none` não é item de lista.** `box-shadow: <sombra>, <sombra>,
>    none` é inválido e o navegador **descarta a declaração inteira, em
>    silêncio**. O repouso é **uma sombra nula** (`inset 0 0 0 0 transparent`),
>    nunca a ausência de sombra — e de lambuja a transição volta a interpolar.
> 3. **[E3] No Figma, a sombra precisa de tinta.** Corpo sem tinta, anel
>    inexistente. Onde o corpo não pinta, **o anel é geometria absoluta** — e
>    isso escreve-se na peça, não se descobre na foto.
>
> **Os três apagam o mesmo anel, nos três lugares onde ele vive, e nenhum dá
> erro.** Uma peça que promete foco promete os três.

## 4 · O `Botao` saltava 2 px, e a calha da razão não existia

**A folha dizia, desde E1, *"uma altura por `Papel`×`Tamanho`"*, e isso nunca foi
verdade.** Lido de volta, variante a variante:

| corpo · Normal | Repouso / Foco | Esperando / Impedido |
|---|---|---|
| `Chamada` | 53 | **55** |
| `Gesto` | 44 | 44 |
| `Recuo` | **42** | **44** |

**A causa é uma propriedade:** `strokesIncludedInLayout = true`. O traço de 1 px
só existe nos estados em que o botão **recusa**, e **conta para o HUG** — logo o
botão **cresce ao ficar indisponível**, que é exactamente o defeito de 19 px que
E1 julgou ter curado. *E1 curou 19 dos 21; os 2 que ficaram sobreviveram porque
se cancelavam com um segundo erro (ver a seguir).*

**E o segundo erro era pior: a reserva da razão não era uma calha — era a altura
fixa do quadro da variante.** Em *Repouso* e *Foco* **não existe nó `razao`
nenhum**: havia só um quadro alto de 74 e um conteúdo de 53, com 21 px de vazio
por baixo. Em *Impedido* a razão real mede `6 de goteira + 13` = **19**.
**A reserva estava 2 px errada desde o dia em que nasceu**, e ninguém viu porque
os 2 px do traço a compensavam ao contrário.

> ### Uma reserva que não é um nó não é uma reserva: é uma coincidência de dois números que ninguém ligou.

**O conserto é estrutural, e é o mesmo da pílula:** o quadro `Botao` passou a
**altura fixa = corpo + 6 + 13**, com os filhos alinhados ao topo, e a variante
passa a **abraçá-lo**. A calha existe agora mesmo quando está vazia, e nenhum
estado a pode mexer.

## 5 · Os alvos de toque do `Botao` sobem ao piso — e é conformidade, não gosto

| corpo · Normal | antes | agora | o que era |
|---|---|---|---|
| `Papel=Chamada` | 53 | **53** | já passava |
| `Papel=Gesto` | 44 | **48** | no mínimo do WCAG, 4 abaixo da casa |
| `Papel=Recuo` | **42** | **48** | **abaixo do mínimo do WCAG 2.5.5 (AAA)** |

**`Papel=Recuo` em repouso media 42 px — dois abaixo dos 44 que a norma pede** —,
e `Papel=Recuo` é o `esperar` da barra de batalha. *A peça que a tela usa para
"não fazer nada" era a única que reprovava a norma.*

**As alturas por `Papel`×`Tamanho`, e agora saem de uma tabela só:**

| | corpo (o alvo) | + goteira 6 + calha 13 = a peça |
|---|---|---|
| `Chamada` · Normal / Pequeno | **53** / 38 | 72 / 57 |
| `Gesto` · Normal / Pequeno | **48** / 30 | 67 / 49 |
| `Recuo` · Normal / Pequeno | **48** / 30 | 67 / 49 |

**`Tamanho=Pequeno` fica abaixo do piso, e isso passa a ser uma regra escrita e
não um descuido:** 30 px não é alvo de polegar. ***`Pequeno` é proibido no
telefone e proibido como alvo primário em qualquer largura*** — existe para
densidade de ponteiro, onde a norma permite o alvo pequeno com um equivalente
acessível ao lado. **Quem o usar fora disso está a escrever um defeito de
acessibilidade com uma variante da biblioteca**, e agora não pode dizer que não
sabia.

## 6 · As peças de E3, conferidas uma a uma contra o que esta folha promete

| peça · nó | **promete** | **estava** | **ficou** |
|---|---|---|---|
| **A régua** · `30:11` | calha de 22, casa de 48, 3 graus | 48×22 · 22×48, 6 variantes | **bate — nada a fazer** |
| **A vez** · `30:163` | faixa de 56 (48 no telefone); Linha 2 560 px / Selo 472 px por oito | Linha 320×48 (8 × 320 = 2 560 ✓), Selo 48×48, 24 variantes | **bate** |
| **A ficha curta** · `31:137` | o que se sabe do inimigo sai do `<title>` | 288×150 (152 em *Caído*), 6 variantes | **bate** |
| **A pergunta que expira** · `31:518` | 344 de largura, encaixa na lateral de 344 | 344 nas oito variantes; 118 · 215 · 56 de altura | **bate** |
| **`Consequencia` *Linha*** · `11:35` | a linha do veredito, **24 px** | peça de **15**, faixa composta de **22** | **faixa 22 → 24** (`40:451`), e fica escrito que **24 é piso da região, não altura da peça** |
| **`Botao` *Papel=Chamada*** · `9:170` | *"o único da tela"* | 53 px, sem salto de estado | **a peça bate; a FRASE é que estava revogada** — W1 tirou o `Chamada` do `Atacar`, e a linha ficou de pé a contradizê-lo |
| **`Botao` *Papel=Recuo*** · `9:170` | o `esperar`, piso de 48 | **42**, e sem anel de foco visível | **48, e o anel existe** |
| **`Botao` *Papel=Gesto*** (os seis verbos) | piso de 48, anel de foco | 44, e **sem anel de foco visível** | **48, e o anel existe** |
| **`A escolha` *Pílula*** · `20:77` | 48, foco sem crescer | 47, foco a 75 | **48 / 48** |

## 7 · O que E3 deixa por pagar, com número e com o motivo

1. **A tela da batalha composta no Figma é a de E1, e W1 nunca lá chegou.** Em
   `40:447` (telefone) a barra dos verbos são **três fileiras de 44 = 144 px**;
   W1 decidiu **uma fila de quatro, 63**. *A composição é do `jogo` e a página `A
   batalha` é dele* — por isso **declaro em vez de recompor**, mas fica com o
   número: **quem olhar aquela tela vê 81 px de verbos a mais e uma decisão a
   menos.** Só a faixa do veredito foi corrigida (22 → 24), porque essa era um
   número meu.
2. **`A escolha` *Forma=Cartão*, `Estado=Impedida`, mede 107 contra 88 — +19 px.**
   É a mesma doença que o `Botao` acabou de curar: a razão aparece em vez de estar
   reservada. **Numa lista de escolhas, uma opção que fica indisponível empurra as
   de baixo.** Não paguei porque o Cartão tem **11 usos em produção**
   (`CartaoDeEscolha`, criação de personagem) e crescer 19 px em todas é mudança
   de composição, não de peça.
3. **`rotulo`, `a marca` e `a razao` continuam camadas e não propriedades** em `A
   escolha` — a quarta peça com a doença que E2 curou em três. Aberta desde K4.
4. **`Contador` e `Lista` continuam por fabricar**, e quando nascerem nascem a 48.
5. **Nenhuma destas correcções foi vista num navegador**, porque neste ciclo não
   houve código meu para ver. **O dente de K4 continua por cravar do meu lado:**
   *o anel que o Figma agora mostra ainda pode ser apagado por um `style` inline
   no dia em que alguém instanciar estas peças*, e a única coisa que o impede é a
   lei escrita em §3 — que é papel, não catraca.

## 8 · As armadilhas do Figma que E3 pagou

Somam-se às de D3/D4/E1/K1, que continuam de pé.

1. **A sombra precisa de tinta** (§3). É a armadilha do ciclo, e não dá erro.
2. **`strokesIncludedInLayout = true` faz o traço mexer na altura de um quadro em
   HUG.** Um estado que acrescenta traço acrescenta tamanho — em silêncio.
3. **`strokesIncludedInLayout` só existe em quadro com `layoutMode`.** Escrevê-lo
   num quadro absoluto acabado de criar **estoura** com
   *"Can only set strokesIncludedInLayout on nodes with layoutMode !== NONE"*, e o
   script morre a meio do laço. *Um script que cria nós tem de poder correr duas
   vezes:* o daqui apaga `o anel` e `o vao` antes de os criar.
4. **`cornerRadius` devolve um símbolo quando os cantos diferem**, e
   `JSON.stringify` de um símbolo **estoura com `cannot convert symbol to
   string`** — não devolve `null`, não avisa. Todo leitor de propriedades desta
   casa passa por um `typeof v === "symbol"`.

---

## A tela da batalha existe (construída em E3 · 16/09)

**E1 desenhou, E3 construiu** — e a lei desta secção é o que a construção
provou, corrigiu ou desmentiu do que E1 tinha escrito. O relato do momento fica
em `mente/e3-jogo.md` (duas lutas inteiras, jogadas); o da forma, em
`mente/e3-desenho.md`.

### A QUARTA maneira de apagar um anel de foco, e é a pior das quatro

O `desenho` escreveu neste mesmo ciclo que há **três** maneiras de apagar um
anel — estilo inline por cima, `none` dentro de uma lista de sombras (invalida
a lista inteira, em silêncio), e tinta em falta na peça. **A construção achou a
quarta, e ela não estava em lado nenhum:**

> **`box-shadow` não pinta em elemento SVG.** Um `<rect>` não é caixa CSS: a
> regra é **aceite**, a folha fica válida, o `getComputedStyle` devolve o valor
> pedido — **e nada é desenhado.**

É a pior das quatro porque é a única em que **a propriedade continua a dizer que
o anel existe**. As outras três deixam rasto: o inline vê-se no elemento, o
`none` mata a lista toda, a tinta em falta vê-se na peça. Esta não deixa nenhum —
e `.tv-anel-foco`, que é a peça certa em toda a casa, **seria a mentira** se
fosse aplicada a uma casa do tabuleiro.

**A forma decidida:** `.tv-anel-foco-no-campo`, em `estilo.js`, com
`outline: 3px solid ink` e `outline-offset: -3px`. Desenha **dentro** da casa,
logo não rouba pixel à vizinha — e `outline` é preservado por `forced-colors`
sem precisar da exceção que o `box-shadow` obriga a escrever. **Medido vivo, com
o teclado: 15,31:1 sobre o tabuleiro.**

**E a armadilha de medição que quase enganou quem media:** `.focus()` por script
**não acende `:focus-visible`**. Quem confere um anel tem de chegar ao elemento
**pela tecla `Tab`**, ou mede um estado que o jogador nunca vê.

**O número que justifica a secção inteira:** a tela nasceu com
**`outline: "none"` inline em 67 dos 80 elementos focáveis** — a primeira das
quatro doenças, aplicada casa a casa. *A suíte estava verde: 198 asserções e 14
varredores.* **Só o navegador a viu.**

### As duas medidas de E1 que a construção desmentiu, com a conta

1. **O campo não mede 828 px de altura, mede 583 — e 828 nunca coube na própria
   mobília de E1.** A soma: campo 828 + narração 84 + faixa da vez 56 + veredito
   24 + verbos 48 + texto livre 44 + respiros 32 = **1 116 px contra os 860 da
   tela**. A consequência é dura e fica escrita: **cabem 2 das 10 plantas
   inteiras, não as nove que E1 prometeu.** A masmorra 7×18 fica com onze colunas
   de vazio (528 px) **e seis filas sempre escondidas** — desperdício na largura e
   cegueira na altura ao mesmo tempo, num mapa cuja pergunta é *o que está entre
   você e a saída*.
2. **No telefone são 6 filas, não as 12 de E2** — e a diferença tem nome: **a
   tira de consulta come 144 px do topo**, e o orçamento de E2 não tinha tira
   nenhuma. Medido: campo 343 × 296, **24 de 160 casas = 15 % do tabuleiro**.

**As duas contas estavam certas quando foram feitas.** O que faltou foi somá-las
com o resto da mobília — e é por isso que a soma de `TELA_DE_BATALHA`
(`respiro + campo + goteira + lateral + respiro = 1280`) é lida de volta pela
suíte: *um número que se soma com os outros não pode ser afinado sozinho.*

### O enquadramento de entrada, que é regra e não afinação

A **regra 1 de E1** está construída e sai de tabela: `reservaDaReacao: 1/3` e
`folgaDaBorda: 1` em `TELA_DE_BATALHA`. A área livre é o que sobra **por cima da
reserva**, e o herói fica no meio dela — nunca no centro geométrico, para ficar
fora da faixa que o próprio polegar tapa. A **regra 2** também (só reenquadra
quando o herói chegaria a menos de uma casa da borda). A **regra 3** sai de graça
e **por construção**: o efeito só escuta a casa do herói, logo a câmara nunca vai
atrás do inimigo do outro lado do campo. *Falta-lhe a outra metade* — a marca na
borda com o nome e a distância —, e essa é de E4.

**E nasceu morto à primeira, do jeito que esta casa já conhece:** suíte verde,
varredor verde, e **o herói a 603 px numa janela de 592**. A causa é de tempo, não
de conta: o efeito corria **antes de a janela ter tamanho**, e um `scrollTo` sobre
altura zero **não faz nada, em silêncio**. Duas batidas de `requestAnimationFrame`
resolveram — e as duas estão declaradas no teto de `check-formas` com a razão na
própria linha, porque **não contam tempo**: correm uma vez e cancelam ao sair.

**A ressalva, medida e deixada à mesa:** com o herói na última fila da planta, o
rolador bate no fim e ele fica a **90 % da janela — dentro do terço emprestado à
reação**. Curá-lo exige **folga de rolagem por baixo do campo**, e *um campo que
rola para o nada* é decisão de desenho, não de construção. Fica na fila.

### O que a luta viva provou que está certo

Dito porque elogio sem número não vale, e estes têm: **zero sobreviventes** dos
treze controlos proibidos; **nada na tela diz que ela é uma tela**; **passo limpo
= 1 toque, golpe limpo = 1 toque**; a casa mede **48 × 48**; a linha do veredito
mede **888 × 24 e nunca esteve vazia, em estado nenhum**; a porta do fim é **uma,
888 × 48**, e **durante a luta não há porta nenhuma**. E a frase do `jogo` sobre o
que a tela faz de melhor: *a linha do veredito acende o `Atacar` no instante em
que diz **ao alcance***.

### Três leis pequenas que a construção fixou

- **A terceira saída do gesto vive na JANELA do campo, não na casa.** A casa fora
  do alcance não tem ouvinte, e transformar as 84 em botões de cancelar seria dar
  significado a 84 alvos para uma ação que já tem dois.
- **`aria-disabled` em vez de `disabled`** no verbo principal: `Atacar` nasce
  indisponível e **continua a existir** para quem navega por teclado ou ouve a
  tela. *Um controlo apagado da ordem de tabulação é um controlo que não existe.*
- **O alvo não se negocia, nem no canto.** `⤢ ampliar` media **68 × 19**; passou a
  **76 × 48** com anel de foco, e custou 29 px à fileira do cabeçalho — menos de
  uma casa. Era o controlo que abre a única vista onde a luta inteira se vê, e era
  o mais pequeno da tela.

### A vez dizia o nome errado, e a honestidade custou uma linha

`combate.ordem` é rolada **uma vez** na abertura e **nunca roda**: não há cursor
de vez em `combate.js`. A tela dizia *"quem age é o primeiro da ordem"* e por isso
anunciava o goblin **enquanto o jogador jogava**, rodada após rodada. A construção
**não inventou o cursor** — passou a dizer o que este motor de facto faz (*agir
encerra o turno; o mundo responde na mesma batida; a vez volta ao herói*) e deixou
`combate.vez` lido à frente, para o dia em que o motor der um cursor. Medido vivo:
**`agora: A Flecha`** — o nome do herói. *O pedido está em
`mente/pedidos-ao-sistema.md`; o **Mudou=Agora** de três pulsos que E1 desenhou
não pode existir antes dele.*

---

# O anel que cumpre, o custo dentro da casa e o número que pode ser negativo (E4, `desenho` · 16/09)

Etapa só de biblioteca: nenhum `.js`, `.jsx` ou `.mjs` foi tocado — o bastão do
`App.jsx` ficou inteiro com o `oficial`. Arquivo `Taverna — biblioteca`
(`e5wJUzInAssoebx5npssKc`), ampliado e corrigido, nunca duplicado.

## 1 · A LEI DA PEÇA DO ANEL: o anel nunca depende de `box-shadow` sozinho

`O anel de foco` · página e conjunto novos · **`166:4018`** · eixo `Superficie`
(*Caixa* `166:4005` · *Dentro do SVG* `166:4009` · *Alto contraste* `166:4014`).

> ### O que carrega o anel é sempre `outline`. `box-shadow` só pode pintar o vão, e só como decoração que pode morrer sem levar o anel com ela.

**Porque há CINCO maneiras de apagar um anel de foco, e nenhuma delas dá erro.**
E3 tinha quatro; E4 achou a quinta, no Figma e no CSS ao mesmo tempo:

| # | onde | o que faz | deixa rasto? |
|---|---|---|---|
| 1 | código | **estilo inline vence a folha** — um `boxShadow` no `style={{}}` apaga o da folha | vê-se no elemento |
| 2 | CSS | **`none` não é item de lista** — `box-shadow: a, b, none` é inválido e o parser **descarta a declaração inteira, em silêncio** | mata a lista toda |
| 3 | SVG | **`box-shadow` não pinta em elemento SVG** — um `<rect>` não é caixa CSS; a regra é aceite e nada é desenhado | **nenhum** |
| 4 | alto contraste | **`forced-colors: active` REMOVE `box-shadow` por especificação** — o anel não fica fraco, fica **zero** | **nenhum** |
| 5 | **ancestral** | **`clipsContent` / `overflow: hidden` num pai CORTA o anel** — que é desenhado fora da caixa | **nenhum**; à escala da miniatura lê-se como presente |

**3 e 4 são a mesma ausência, e é por isso que a escolha é `outline`:** ele
sobrevive às cinco — pinta em SVG, é preservado por `forced-colors`, não se
escreve na mesma declaração que uma sombra, não tem sintaxe de lista, e o corte
do §5 é o único que ainda o atinge (e atinge-o em CSS **e** no Figma, com a
mesma causa: um pai que recorta).

**As três construções, e a superfície é que decide — não quem compõe:**

| `Superficie` | o CSS | porquê |
|---|---|---|
| **Caixa** | `outline: 2px solid ink; outline-offset: 2px` **+** `box-shadow: 0 0 0 2px bg` | botão, pílula, cartão. A sombra é só o vão: pode morrer sem levar o anel. Não ocupa leiaute — nenhum vizinho se mexe |
| **Dentro do SVG** | `outline: 3px solid ink; outline-offset: -3px` | a casa, a marca de borda, o glifo. **Por dentro** porque a casa tem **oito vizinhas coladas** e um anel externo pinta por cima delas. Sem vão: 3 px de `ink` sobre `bg` dão **15,31:1** e carregam sozinhos. **O raio do anel é ZERO** — `outline-offset: -3` reduz o raio 3 do corpo a 3−3 |
| **Alto contraste** | `outline: 2px solid Highlight; outline-offset: 2px` | `forced-colors: active`. **Nenhum `box-shadow`.** As cores são do SISTEMA (`Canvas`, `ButtonText`, `Highlight`) e por isso são **literais**: é a única peça desta biblioteca onde um literal está certo, porque a cor é do jogador e não nossa |

### Como a peça GARANTE, em vez de prometer

Uma lei escrita numa folha é papel. O que a peça faz é **tirar a escolha de quem
compõe**: não há como instanciar um anel sem escolher uma `Superficie`, e cada
variante traz a sua construção escrita na `description` do conjunto. Quem copiar
o anel da Caixa para dentro de um `<svg>` vê que copiou a variante errada.

**E a biblioteca deixou de ensinar o contrário.** Varridas as peças com foco,
sobravam **cinco** anéis feitos só de sombra — e os cinco foram convertidos a
geometria absoluta, com o tamanho medido antes e depois:

| peça · nó | estava | ficou | tamanho |
|---|---|---|---|
| `Botao` *Chamada, Foco, Normal* · `9:22` | duas `DROP_SHADOW` | `o anel` + `o vao` absolutos | 97×72 → **97×72** |
| `Botao` *Chamada, Foco, Pequeno* · `9:29` | duas `DROP_SHADOW` | idem | 76×57 → **76×57** |
| `A escolha` *Cartao, Foco* | duas `DROP_SHADOW` | idem | 260×88 → **260×88** |
| `A escolha` *Pilula, Foco* | duas `DROP_SHADOW` | idem | 260×48 → **260×48** |
| `A escolha` *Aba, Foco* | duas `DROP_SHADOW` | idem | 260×48 → **260×48** |

**Zero crescimento nas cinco** — `layoutPositioning = "ABSOLUTE"` não entra em
auto-layout, que é exactamente a promessa do `outline`.

> ### A sombra do `Botao` *Papel=Chamada* RENDERIZAVA, e foi por isso que E3 não a apanhou.
> E3 converteu `Gesto` e `Recuo` porque **não se viam** (corpo sem tinta, a
> armadilha daquele ciclo) e deixou `Chamada` de pé porque **se via**. *Ver no
> Figma não é o teste.* O teste é sobreviver ao alto contraste — e ali aquele
> anel era zero. Era a última promessa de anel feita só com sombra nesta casa, e
> é literalmente a dívida **A11**.

### A quinta maneira, medida

`Botao`: o nó `Botao` de **todas as seis** variantes de `Estado=Foco` tinha
`clipsContent = true`, e o anel é desenhado a `−4`. **Os seis anéis que E3
construiu estavam a ser cortados desde o dia em que nasceram.** A foto de E3
diz *"o anel aparece"* e aparecia — a parte de baixo. Destravado nos seis.

> **Um anel que se desenha fora da caixa tem de ser conferido no pai, não no
> nó.** No Figma chama-se `clipsContent`; em CSS chama-se `overflow: hidden`;
> nos dois a propriedade do anel continua perfeita.

**E a armadilha de medição continua de pé:** `.focus()` por script **não acende
`:focus-visible`**. Confere-se com `Tab`, ou mede-se um estado que o jogador
nunca vê.

---

## 2 · A casa alcançável tem forma — e a forma estava a pintar PRETO

A peça `A casa` (`18:31`) já tinha tudo o que E1 mandou: `o banho` (âmbar 10 %),
`a borda` (âmbar 1 px a 0,55 de nó, **3,406:1**) e **`o custo` aceso já em
*Alcançável*, em JetBrains Mono Bold 10 px**. *A forma não faltava; faltava
chegar ao pixel.*

> ### Uma tinta guarda DOIS valores — o literal e a variável ligada — e quando eles discordam, o que vai ao pixel pode não ser o que a variável diz.

`o custo` de *Alcançável* estava ligado a `amberSoft` **e** guardava o literal
`#000000`. A propriedade lida de volta dizia `VariableID:1:10`. O pixel saía
preto.

| | sobre a casa alcançável (`bg` + banho âmbar 10 % = `#241B19`) |
|---|---|
| o que estava (`#000000`) | **1,24:1** |
| o que ficou (`amberSoft`) | **10,78:1** |

**WCAG 1.4.3 pede 4,5:1.** O número que a lei desta casa manda escrever dentro
da casa — *o que é alvo tem o custo escrito dentro* — era **invisível**.

**E não era só o custo.** Varridas doze páginas da biblioteca, a doença apareceu
**dez vezes, e só nas duas peças que são o tabuleiro:**

| peça | nó | dizia | pintava |
|---|---|---|---|
| `A casa` *Alcancavel* | `o custo` | `amberSoft` | preto |
| `A casa` *Sob o dedo* | `o custo` · `quadrado` (traço) | `amberSoft` · `amber` | preto · preto |
| `A casa` *Confirmando* | `quadrado` (traço) | `amber` | preto |
| `A casa` *Mira* | `quadrado` (traço) | `violet` | preto |
| `A casa` *Foco* | `o custo` · `quadrado` (traço) | `amberSoft` · `amber` | preto · preto |
| `A casa` *Alvo* | `o custo` | `amberSoft` | preto |
| `A casa` (o topo) | `fills` | `bg` | preto |
| **`A regua` *Eixo=Linha, Estado=Procurada*** | `o rotulo` | `ink` | **preto** |

> ### As bordas de quatro estados da casa eram pretas sobre um tabuleiro preto, e o *grau do meio* da régua não existia em metade dos eixos.
> E2 fixou **três graus** para a régua e mediu *Procurada* em `ink`, **15,31:1**.
> No eixo `Linha` ela pintava **1,0:1**. *Metade do grau que E2 inventou nunca
> chegou a ser visto.*

As dez curadas, escrevendo o valor da variável no literal. **Zero achados** em
`Botao`, `Fechar + Selo`, `Barra + Veu`, `Consequencia`, `A escolha`, `A vez`,
`A ficha curta`, `A marca de borda`, `O verbo com preco`, `A pergunta que
expira` e `W1 · o verbo armado` — a doença é das peças de E1/E2, e são as duas
que E4 ia pintar.

> **A lei da tinta:** *um `paint` cujo literal discorda da variável ligada é um
> defeito, mesmo quando a variável está certa.* Sempre que se liga uma variável
> a uma tinta, **escreve-se o valor dela no literal também** — porque o literal é
> o que sobra quando alguma coisa corre mal, e um literal preto é a pior
> herança possível.

---

## 3 · O foco é uma MARCA, não um estado — e é o *roving tabindex* que o obriga

`A casa` ganha a propriedade booleana **`com foco`** (`com foco#164:0`, por
omissão **false**), ligada ao `visible` de um nó `anel de foco` presente nas
**oito** variantes.

**A razão é aritmética, não gosto.** Com um ponto de paragem só e as setas por
dentro, **a casa focada e a casa sob o dedo passam a ser casas DIFERENTES ao
mesmo tempo** — o teclado numa, o rato noutra. Uma peça cujo foco é um valor de
`Estado` só sabe desenhar uma das duas.

> ### Foco não é uma espécie de casa: é uma marca sobre uma casa. `Estado` diz o que a casa É; `com foco` diz onde o teclado está.

`Estado=Foco` fica **aposentada** e escrita como tal na `description`: equivale a
`Estado=Sob o dedo` + `com foco`. **Não a apaguei** — tem **12 instâncias vivas**
na página `A batalha`, que é do `jogo`, e *peça mudada em silêncio por baixo de
uma composição é pior do que peça com espaço reservado*. O anel dela continua
aceso e sem ligação à booleana; a migração é do `jogo`, quando recompuser a
página.

**O anel da casa mudou de lado**, e isto é conserto, não preferência: estava um
quadro de **56×56 a `−4`** — por **fora** —, e uma casa tem oito vizinhas
coladas. Passou a **48×48, traço `ink` de 3 px `INSIDE`, raio 0**, que é
carácter a carácter o `outline: 3px solid ink; outline-offset: -3px` que
`estilo.js` já escreve. *O Figma e o código deixaram de discordar sobre onde o
anel vive.*

### O endereço: a lei de E1 dita pelo motivo dela

E1 escreveu *"o endereço só nos dois estados que já carregam texto — Sob o dedo
e Confirmando"*, e deu a razão: **86 endereços acesos ao mesmo tempo é a
planilha.** A peça mostrava-o em **cinco** estados. O motivo, aplicado, dá uma
lei melhor:

> ### O endereço aparece na casa que o jogador está a APONTAR — com o dedo, o cursor ou o teclado — e em mais nenhuma. É sempre no máximo UMA.

E isto não é invenção: `grade-de-batalha.jsx:463` já escreve
`const apontada = focada || sobre`, com o comentário *"pelo foco do teclado antes
do rato"*. **O código já vive a lei; era a peça que não.**

| estado | é singular? | o endereço |
|---|---|---|
| *Sob o dedo* · *Confirmando* · `com foco` | sim, no máximo uma | **aceso** |
| *Mira* | **não** — acende o alcance inteiro da habilidade, dezenas de casas | **apagado** *(corrigido em E4)* |
| *Alvo* | não — e a casa tem uma ficha por cima | **apagado** *(corrigido em E4)* |

*(Dívida de nome declarada: `Estado=Sob o dedo` chama-se mal — é *a casa
apontada*, e o código já lhe chama isso. Não renomeei a opção de variante porque
renomear parte as instâncias.)*

---

## 4 · O alvo que é gente: a marca é a SILHUETA, e a cor é a mesma de propósito

A pergunta era: *se o inimigo mirado e a casa realçada forem a mesma cor, o
jogador aprende que a cor não quer dizer nada.* **Medido na peça, a resposta é
que a cor é a mesma por decisão de W1 e o canal que separa não é a cor:**

| estado | tinta | contraste sobre `bg` | a silhueta |
|---|---|---|---|
| *Alcancavel* | banho âmbar 10 % + borda 1 px a 0,55 | **3,406:1** | moldura contínua, fina |
| *Sob o dedo* | banho âmbar 22 % + borda 1 px cheia | **8,999:1** | moldura contínua, grossa |
| *Mira* | banho violeta 16 % + traço 1,5 px **tracejado** | **5,47:1** | tracejado — e é a segunda língua |
| *Alvo* | banho âmbar 10 % + **quatro cantos** 2 px cheios | **8,999:1** | **cantos, não moldura** |

**O âmbar é «o que você pode fazer agora» e não muda com o verbo** (W1). O que
muda é o conjunto e a palavra na linha do veredito. *Seis cores para seis verbos
é o que esta regra existe para impedir.*

### E a lei do «escrito dentro» ganha a metade que lhe faltava

E1: *o que é alvo tem o custo escrito dentro; o que não tem nada escrito dentro
não é alvo.* Aplicada literalmente a `Estado=Alvo`, ela parte-se — e a razão é
geométrica, medida na peça:

- a ficha da criatura tem `r = 0,40` da casa e o arco da vida corre em **0,47**;
- `o custo` vive em `(15, 28)` com 18×13 — **no centro exacto da ficha**;
- `o endereco` vive em `(4, 4)` com 17×12 — **debaixo do arco da vida**.

> ### As duas fendas de texto da casa caem debaixo do corpo que a ocupa. Uma casa que é gente não pode levar o número.

**A lei reescrita, e é esta que fica:**

> ### O que é alvo carrega uma marca desenhada POR DENTRO da casa — o custo escrito, quando a casa é chão; os quatro cantos, quando a casa é gente. O que não tem nada por dentro não é alvo.

Continua a servir o «ver tudo» (a 20–28 px nada se escreve e nada é alvo) e
passa a servir a casa ocupada, que era o caso que a partia.

---

## 5 · O número que pode ser negativo

**O que já existia,** e são duas coisas:

1. **`Barra de medida` · `o delta`** (`6:15`) — mono 11 px, `+3` no *Ganho* e
   `-3` no *Golpe*. É a única peça da casa que já escrevia um número com sinal.
2. **`Consequencia` *Tom=Preco*** (`11:35`) — o preço ao lado do gesto, como
   fenda da peça e não como `<span>` escrito à mão.

**O que faltava** é o que o motor passou a poder dizer depois de H4 (v9.276):
`mecanicaDe` devolve `danoReduzido` (**enfraquecido** — você bate menos),
`danoRecebidoExtra` (**marcado** — você apanha mais) e `defesa`, e a fila de
pílulas do HUD mostra **só `mec.danoExtra > 0`**. *Três números que o motor
calcula e ninguém lê.*

> ### A casa só tinha gramática para bónus: o `+` era verde e o `−` era vermelho, e isso funcionou enquanto os dois únicos números visíveis calhavam de ter o sinal do lado do tom.

**A forma que nasce:** `Selo de estado` (`5:29`) ganha três fendas —
`o numero#166:9`, `a palavra#166:0` e a booleana `com numero#166:18` (por
omissão **false**: nenhuma instância existente muda; tamanhos conferidos, 67×22
e 68×23 antes e depois).

> ### O SINAL diz a aritmética. O TOM diz a favor de quem a conta pende. Os dois PODEM discordar — e escolher o tom pelo sinal é o defeito.

| `Tom` | escreve | lê-se |
|---|---|---|
| Bom | `+2 DANO` | um mais a seu favor |
| Bom | `−2 DANO SOFRIDO` | um **menos** a seu favor |
| **Perigo** | **`−2 DANO`** | **enfraquecido — um menos contra si** |
| **Perigo** | **`+2 DANO SOFRIDO`** | **marcado — um mais contra si** |

**As duas de baixo são as que a casa não sabia dizer.** Provadas no Figma, em
instâncias reais: `a prova do sinal contra o tom` · `166:4783`, página
`Fechar + Selo`.

E a cor continua a não carregar sozinha (WCAG 1.4.1): **ponto + número +
palavra**, e é a palavra que separa `DANO` de `DANO SOFRIDO`.

### O sinal de menos é `U+2212`, nunca o hífen ASCII

`Barra de medida` escrevia `-3` (ponto de código **45**) enquanto o `App.jsx`
escreve `−3` (**8722**). Corrigido nas quatro variantes, e `o delta` passou a
propriedade (`o delta#166:27`).

> Em JetBrains Mono o **avanço** é o mesmo — medido: `+2` e `−2` medem ambos
> **11 px** a 9 px de corpo. O que difere é o **glifo**: o hífen é curto e alto,
> o menos tem a largura e a altura da barra do `+`. Numa fila de selos, `-3` ao
> lado de `+3` tem o traço a outra altura; `−3` ao lado de `+3` não tem.

---

## 6 · O que E4 deixa declarado, com número

1. **As 12 instâncias de `Estado=Foco` em `A batalha`** continuam no estado
   aposentado. A migração para `Sob o dedo + com foco` é do `jogo`.
2. **`Selo de estado` escreve a 9 px e o `App.jsx` escreve a 10 px** nas quatro
   pílulas do HUD (`text-[10px]`). É divergência real e **não a toquei**: mexer
   no corpo da letra é `TIPOS`, que está com a pessoa. Quem construir, construa
   a **10** e a peça segue depois.
3. **`A escolha` *Forma=Aba*** tem cantos mistos (`cornerRadius` devolve
   símbolo) e o anel novo tem cantos uniformes. Em CSS o `outline` seguiria os
   mistos. Aproximação declarada, de 1 px em dois cantos.
4. **`O interruptor`** constrói o anel ao contrário das outras (`o vao` **dentro**
   de `anel de foco`, em vez de irmãos absolutos). Não cortava nada, por isso não
   lhe toquei — mas é a sexta construção de anel da biblioteca e devia ser a
   primeira.
5. **`Estado=Alvo` não tem custo escrito e isso agora é lei** (§4) — mas *que*
   número um verbo de criatura mostraria, se mostrasse, é do `jogo`. A fenda
   existe e está apagada.
6. **Nada disto foi visto num navegador**, porque neste ciclo não houve código
   meu. O que impede o anel de morrer no dia em que alguém instanciar estas peças
   continua a ser papel — **a catraca certa é um dente que proíba `boxShadow`
   inline em qualquer controlo que carregue `.tv-anel-foco`**, e isso é código,
   logo é de outro.


## 6b · As duas peças que o `jogo` pediu ao compor, e nasceram no mesmo turno

`mente/e4-jogo.md` §6 pede cinco peças. Duas caem dentro do mandato de E4 e
foram fabricadas antes de o ciclo fechar.

### `A mira` — a retícula é da CRIATURA, não da casa

`A mira` · conjunto **`172:5328`** · eixo `Tamanho` (*Uma casa* `172:5301` ·
*Duas casas* `172:5310` · *Três casas* `172:5319`).

**O defeito que o `jogo` viu ao compor** (quadro `166:3752`): a retícula vivia
dentro de `A casa · Estado=Alvo`, logo desenhava-se **por casa** — numa criatura
de 2×2 saíam **quatro** retículas onde devia sair **uma**.

> ### Uma marca que diz «este verbo age sobre ISTO» tem de ter o tamanho do isto.

- **Cantos e não anel, e é geometria:** a ficha mede `r = 0,40` da casa e o arco
  da vida corre em **0,47** contra os 0,5 da meia-largura — **sobram 1,4 px numa
  casa de 48**, e não há onde pôr um anel. Mas a casa não é um círculo: a
  meia-diagonal mede **0,707** e o canto tem **0,237 de casa livre, 11,4 px**. *O
  canto é o único pedaço de uma casa ocupada que sobra vazio.*
- **O braço é 9 px e o traço 2 px, e NÃO crescem com o tamanho.** Numa casa de 48
  a ponta mais interior fica a **28,3 px** do centro contra os **22,6** do arco:
  **5,7 px de folga**, medidos (W1). Numa criatura maior o arco cresce e o braço
  não, logo **a folga só aumenta** — e os cantos continuam a ler-se como cantos
  em vez de virarem uma moldura.
- **`amber` cheio, 8,999:1 sobre `bg`.** A cor é a mesma de *Alcançável* **de
  propósito**; quem separa é a silhueta.

*(`A casa · Estado=Alvo` mantém a sua retícula interna para o caso 1×1, que é a
esmagadora maioria. Dívida declarada: são duas cópias da mesma geometria, e a da
casa devia passar a ser uma instância desta. Não o fiz porque `Estado=Alvo` tem
instâncias vivas e trocar geometria por instância dentro de uma variante é
mudança que se vê.)*

### `a paragem` — a posição lembrada do cursor de teclado

`A casa` ganha a segunda booleana, **`a paragem#172:0`** (por omissão **false**),
nas oito variantes. *Roving tabindex* guarda o `tabindex="0"` numa célula; sem
forma, **o jogador não sabe onde vai cair quando voltar com o `Tab`**.

> ### `com foco` diz onde o teclado ESTÁ. `a paragem` diz onde ele VOLTA. Nunca acendem na mesma casa, e há no máximo uma de cada no tabuleiro inteiro.

| | o traço | sobre `bg` |
|---|---|---|
| **`com foco`** | `ink`, **3 px**, por dentro, raio 0 | **15,31:1** |
| **`a paragem`** | `inkDim`, **2 px**, por dentro, raio 0 | **6,63:1** |

**Dois canais, e nenhum deles é só a cor:** a **luminância** (um degrau de 2,3×,
que é a gramática que E2 escolheu para a régua — *"a diferença fica em
luminância, não em saturação, e saturação é o que morre primeiro num telefone ao
sol"*) e a **espessura**. E um terceiro que veio de graça: **o anel tem cantos
rectos e a borda de *Alcançável* tem raio 3** — o anel lê-se como outro objecto,
não como uma borda mais grossa.

**E a defesa de por que a luminância chega aqui, onde noutros sítios não
chegaria:** a distinção que importa **não é entre duas casas — é entre dois
momentos**. O jogador vê o anel forte enquanto o teclado está na grelha e o
fraco quando não está; nunca tem os dois lado a lado para comparar. Provado em
instâncias reais: `a prova dos dois graus do cursor`, página `A casa`.

*(Das cinco peças pedidas, ficam três por fabricar — a tira do herói, o contorno
de dentro e a marca do terreno que cobra. As três são de composição de tela e
nascem no ciclo em que a tela for recomposta.)*

## 7 · As armadilhas do Figma que E4 pagou

Somam-se às de D3, D4, E1, E2, K1 e E3.

1. **`clipsContent` num ancestral corta um anel absoluto** (§1). Não dá erro, e à
   escala da miniatura lê-se como presente. *Confira o pai, não o nó.*
2. **O literal e a variável são dois valores** (§2). Ligar a variável não
   reescreve o literal, e o literal pode ganhar. **Escreva os dois.**
3. **`addComponentProperty` com `visible` é atropelado por um `node.visible`
   escrito depois** — o valor por omissão da propriedade passa a ser o do nó.
   Confira `componentPropertyDefinitions` **numa chamada nova** e reponha com
   `editComponentProperty`.
4. **Uma propriedade de texto tem UM valor por omissão por CONJUNTO**, não por
   variante: ligar `o delta` às quatro variantes da `Barra` escreveu `−3` por
   cima do `+3` do *Ganho*. *O sinal é conteúdo, e quem compõe escreve-o.*


---

# O passo ganha preço, e o alvo ganha casa (E4 · `jogo` · 16/09)

Escrito depois de duas lutas jogadas (mesa e telefone) e de uma leitura das dez
plantas de `grid.js` em Node. O documento longo é `mente/e4-jogo.md`; a
composição vive na página **`A batalha`** do Figma, quadros `166:3750`,
`166:3752`, `166:3754`, `166:3756`, `167:4916`, `168:4594` e `169:4040`.

## A lei do custo dentro da casa deixa de ser gosto e passa a ter número

E1 mandou que **o custo nascesse escrito dentro da casa já em *Alcançável***, em
mono 10 px, com o endereço só nos dois estados que já carregam texto. Vinha
confirmá-la por obediência; confirmo-a por medida, e a medida diz mais do que a
lei dizia.

O motor cobra o passo em quadrados — **1 por casa, 2 em terreno difícil**
(`grid.js:496`). Em chão liso, portanto, **o custo de uma casa É o anel em que
ela está**: o número escrito repete o que o olho conta de graça. Nas dez plantas,
com o herói na casa de abertura:

| | |
|---|---|
| plantas de chão liso (`taverna`, `masmorra`, `cidade`, `navio`) | **0 %** das casas alcançáveis custam algo diferente do que o olho lê |
| plantas de chão que cobra (as outras seis) | **100 %** |
| somadas | 173 de 463 = **37 %** |

**Não há meio-termo, e é isso que salva a lei da acusação de planilha.** Ou o
número confirma, ou ele é o único canal que existe — e o jogador não sabe em que
planta está antes de a ver, logo **a regra só serve se for a mesma nas duas**.

E o que estava escondido por baixo: **nas seis, o herói ABRE dentro da lama.** O
passo cai de ~83 casas para **27** no primeiro fotograma, e o único sinal é o véu
ser menor. *O véu diz quanto sobrou; nunca diz que foi cobrado.* Quando o erro
existe ele é **sempre um anel** — 1,5 m, que é a diferença exacta entre «ao
alcance» e «faltam 1,5 m».

> **LEI, e ela liga as duas metades da tela:** o que é alvo tem o custo escrito
> dentro; o que não tem nada escrito dentro não é alvo.

E a razão de o número nascer em *Alcançável* e não sob o dedo, dita para não se
perder: **quem pousa o dedo já escolheu.** Quem precisa do número é quem ainda
está a escolher, e esse está a olhar para o conjunto inteiro. Um custo que só
aparece sob o dedo obriga a visitar 83 casas para comparar duas.

## O alvo é a CASA, e a ficha continua sem toque — por aritmética

W1 perguntou se mirar um inimigo é tocar a ficha, a casa, ou os dois. **É a
casa**, e os `pointerEvents: none` da ficha ficam:

| | mede | contra o piso de 48 de K4 |
|---|---|---|
| a ficha (`r = lado × 0,40`) | **38,4 px** | **abaixo** |
| a casa | **48 px** | é o piso |
| a criatura grande, 4 casas | **96 × 96 px** | o dobro |

Dar toque à ficha seria **dois donos no mesmo pixel** e uma costura morta de
~5 px entre o círculo e a borda — e fabricar, para a mesma acção, um alvo que
esta casa acabou de declarar pequeno demais. *Uma acção, uma forma.* A retícula
de quatro cantos que W1 fabricou já se desenha **na casa** (`125:177`, nos
11,4 px de canto que o arco da vida deixa); a peça e a decisão chegaram ao mesmo
sítio por caminhos diferentes.

**E a criatura grande é UM alvo, não quatro** — o `aria-label` já nomeia o mesmo
inimigo em quatro casas.

> **E armar um verbo de criatura APAGA o véu do passo.** O campo passa de «onde
> posso parar» para «em quem posso bater», e **essa troca é o feedback do
> armado**. 83 casas âmbar e 1 alvo âmbar ao mesmo tempo seriam uma cor a dizer
> duas coisas. É de graça: os dois conjuntos já vivem separados no código
> (`podeIr` × `noAlcance`).

## A tira do telefone não vira gaveta: é desfeita — e a razão é a carga

Medido no primeiro fotograma, 375×812: tira de consulta **144 px**, janela do
campo **343 × 296** = 6,17 filas, **30 de 196 casas inteiras = 15 %**, e a régua
— com o `👣` e o `⤢ ampliar` — em **y = −198, fora do ecrã**.

**Os 144 px não existem em desenho nenhum.** O quadro do telefone de E1
(`40:447`) põe **548 px de campo** e resolve o herói numa tira de **44 px**
(`você · PV · PM · 9 m`), no arco do polegar. A construção empilhou duas `A ficha
curta` — **peça de 288×150, peça de mesa** — no topo.

E a tira é **43 % duplicada**: o meu nome está na minha ficha do campo, o nome
dele está na ficha dele **e** na linha do veredito, e a distância está na linha
do veredito com mais informação (`a 18 m — faltam 16,5 m`). O que **não** tem
outra casa é PV, PM, os selos de acção, e a vida dele — que só existe como arco
a 48 px, legível como fracção e nunca como número.

*Uma tira 43 % duplicada não se esconde numa gaveta: esvazia-se.* Contado:
144 → 24 px, campo 296 → 436 = 9,08 filas, casas inteiras **30 → 48**, de 15 %
para **24 %: +60 %**, sem tocar na escala da casa. **E o tecto, dito antes que
alguém mo descubra: 24 % ainda não é um tabuleiro.** Os outros 76 % pedem
`ESCALA_DA_CASA`, que é de E3 e está com a pessoa.

## Onde vive o número que a pílula esconde

`mecanicaDe` devolve **sete** campos que mexem num número; a fila de pílulas
desenha **quatro**, e os quatro estão **fora da luta**. `Enfraquecido` mostra a
desvantagem e cala o `−2`; **`Marcado` não tem pílula mecânica nenhuma** — o
único canal é o `title=`, que é balão de rato, que no telefone não existe.

**Vive na tira do herói** — a linha de 44 px que a decisão do telefone acaba de
comprar de volta. Não na **linha do veredito**, que responde «o que acontece se
eu agir AGORA» e tem tecto de 54 caracteres: um modificador permanente não é um
acontecimento. Não no **selo**, que é identidade e que E3 mediu imóvel por quatro
rodadas — *número que muda não mora em região que não muda*.

> **Catraca:** o conjunto de campos desenhados = o conjunto que `mecanicaDe`
> devolve, menos `motivos`. *Um número que o motor calcula e a tela esconde é a
> lei desta casa a valer só de um lado.*

## As cinco peças que o `jogo` pede ao `desenho`

1. **`A casa · Estado=Alvo` · variante «alvo composto»** — hoje a retícula
   desenha-se por casa, e numa criatura de 2×2 saem quatro retículas onde devia
   sair uma, nos cantos da criatura. Vi-o ao compor, no meu próprio quadro.
2. **A tira do herói, uma linha de 44 px** — E1 desenhou-a dentro do quadro do
   telefone e **ela nunca virou peça da biblioteca**; e precisa de dois campos
   novos: os modificadores do motor, e a vida do adversário em número.
3. **O contorno de dentro** (a proposta ambiciosa) — segundo traço por cima do
   que já existe, e **nunca da mesma cor do de fora**.
4. **`A casa · Alcançável` em terreno que cobra** — o número é o mesmo; o que
   muda é que ali ele é o único canal. Se a lama precisar de marca própria por
   cima da hachura, a marca é do `desenho`: eu só trago a medida de que ela hoje
   é invisível.
5. **O estado do cursor de teclado na grelha** — `Foco` existe; falta a casa que
   é a **posição lembrada** do cursor quando o foco está noutro sítio. Sem ela o
   roving tabindex não tem forma.

## A proposta ambiciosa: o campo deixa de ter um contorno e passa a ter dois

Medido nas dez plantas, no meio da luta (herói a 9 m de um inimigo grande):
**605 casas alcançáveis somadas, 60 de onde o golpe ainda alcança = 10 %.**
Nenhuma planta passa de 15 %.

> **Noventa por cento do campo âmbar são casas onde eu chego e o turno acaba. A
> tela desenha 545 decisões que são a mesma decisão.**

O contorno de fora é o de hoje — *onde posso terminar o passo*, o **legal**. O de
dentro é novo — *de onde, depois de chegar, o golpe ainda alcança*, o **útil**.
Entre os dois: chego, e acabou. **Peso: pesado**, porque muda o que o jogador lê
no campo. Não depende do motor: `alcanca()` já responde casa a casa — foi assim
que o número foi medido.

## Dois defeitos que só se vêem jogando

- **`Mover` arma com o conjunto vazio.** Com 0 m de passo o verbo aceita o toque,
  fica `aria-pressed="true"` e a linha do veredito escreve *«toque a casa onde
  quer parar»* — **e não há casa nenhuma**. A linha que E3 elogiou como o melhor
  da tela é, neste estado, a que mente. **Regra: verbo cujo conjunto armado é
  vazio não arma, e a linha diz porquê.**
- **A distância de teclado até `Atacar` respira com o passo** — 84 paragens de
  `Tab` com o passo cheio e **1** com o passo gasto, na mesma luta; 28 a 91 nas
  dez plantas. *Não é longa: é impossível de aprender.* Com a grelha a ser uma
  paragem e as setas por dentro, a catraca é **2, com variância 0**.

## E o que a tela faz se o passo continuar de graça (continua — medido hoje)

`H14 → H11 → H8 → I8` = 7 casas = **10,5 m numa só rodada**, com o contador
parado em `9 de 9` e o conjunto a crescer 83 → 122 → 153 → 143.

**O custo dentro da casa continua** — ele é verdade sobre *um* passo. **O que não
pode nascer é o denominador:** nada na tela deve escrever «4,5 dos seus 9»,
«sobra 4,5», nem forma nenhuma de total, porque o total é que é a mentira.

> **Um preço unitário verdadeiro pode viver sem orçamento. Um orçamento falso não
> pode viver de todo.**


## R1 · o sistema de decisões da tela principal (`jogo` · 23/09)

*Aberto pela ordem da pessoa de 23/09: "começando pela tela principal que é onde
se passa 90% do jogo… Vamos mudar também o sistema de decisões." O documento
longo, com o método para refazer as medidas, está em `mente/r1-jogo.md`.*

### a oferta do mundo (forma NOVA, pedida ao `desenho`)

- **quando** — todo turno fora de combate, sempre que o sistema torna alguma
  coisa possível: um contrato disponível, um lugar alcançável, uma pessoa em
  cena com verbo, um mercado aberto aqui, uma missão que pede resposta.
- **forma** — **A oferta** (peça nova, do `desenho`). Carrega **verbo + preço +
  o que dá**, aceso à nascença, **nunca em `title`**. Protótipo que já acerta o
  conteúdo: o cartão de contrato de `PainelMural` (◉60 · +80 XP · +3 fama ·
  quem assina · onde). Eixos pedidos: *Tom* (o que o mundo oferece · o que custa
  · o que é irreversível) × *Estado* (Repouso · Foco · Impedida · Já tomada).
  Alvo no piso de `ALVOS.piso` = 48.
- **onde vive** — **A faixa** (peça nova, do `desenho`): região fixa entre a
  narrativa e o campo, **fora do rolamento**. · Código: **[ainda não existe]**.
- **a decisão de momento, e é do `jogo`: a faixa NÃO vive dentro da conversa.**
  Considerada e recusada. A razão é jogada: a oferta do Yorick continuou válida
  **quatro turnos**, e ao quarto a mensagem que a criou estava três ecrãs acima.
  *A oferta persiste; a mensagem passa.* O momento recupera-se pela marca do
  novo (`O realce` + `Selo` *Mudou=Agora*, já declarados — o `desenho` confirma
  ou recusa por escrito).
- **a regra que a governa, e é o que a impede de virar point-and-click** — **a
  faixa só oferece o que o SISTEMA sabe e o jogador não consegue adivinhar.**
  Atacar, persuadir, procurar, esconder-se são **invenção do jogador** e ficam no
  campo. Aceitar um contrato por ◉60, viajar, comprar, convidar são **oferta do
  mundo**, e o jogador não os inventa: não sabe que existem, nem o preço, nem as
  palavras que a porta reconhece. *O teste, em caso de dúvida: o jogador podia ter
  pensado nisto sozinho?*
- **por quê** — experiência jogada + medida, 23/09, no DOM vivo a 1024×768:
  - escrevi *"Aceito o trabalho do Yorick. Sessenta está bom."*, esperei
    **14,3 s**, e **o contrato não foi aceite**. O Narrador improvisou **◉80**
    contra os **◉60** da tabela. *O jogador disse sim e o jogo não ouviu — e a
    IA inventou economia, porque a única porta para dizer sim era a prosa.*
  - o Mestre escreve `▸ Mural — há um mural onde se lê o que a região precisa.`
    e no DOM é `{tag:"SPAN", clicavel:false, cursor:"auto"}`. **O jogo desenha a
    seta e não põe a porta.** Nove afordâncias no primeiro ecrã, **zero**
    tocáveis.
  - **50 verbos de sistema** atrás das quatro abas (`PainelLateral`,
    `App.jsx:1882`) contra **17 portas** que o texto livre abre
    (`PORTAS_DO_TURNO`, `turno.js`). **Nenhuma ponte**, e nada na tela diz de que
    lado está o verbo que o jogador quer: *"compro uma corda"* resolve,
    *"aceito o trabalho"* não.
  - **0 de 20** controlos de ação da tela principal diz o preço na tela. Oito têm
    `title`, e o que lá está é **descrição, não preço** — e `title` não existe no
    telefone.
  - `Agir →` = 69×28 = **1 946 px²**; a aba `Bolsa` = 72×72 = **5 184 px²**.
    **2,7×** o botão que faz o turno acontecer.
  - as quatro abas do momento medem **27 px**, `Agir →` **28**, as ações rápidas
    **30**, os `🔊` **22** — contra `ALVOS.piso` = **48**.
  - **defeito, e é leve:** o `↓` (46×46 = 2 116 px²) **sobrepõe-se** ao `Agir →`,
    confirmado por interseção de retângulos. O atalho de rolamento é maior que a
    chamada da tela e está por cima dela.
  - espera do Mestre: **30 chamadas em 6 turnos**, mediana de turno **14,3 s**,
    4 de 5 acima de 10 s (NN/g, Nielsen 1993). Durante ela, `bloqueado` apaga a
    tela **inteira**: não há uma só decisão possível enquanto o Mestre escreve.
  - **6 de 6 turnos** foram ler prosa → escrever frase → esperar → ler prosa.
    Contra a lei da pessoa de 14/09 (*"não só lendo e escrevendo"*): **100 %
    ler-e-escrever**.
- **a testemunha de acusação** — no mesmo dia, o combate abriu-se sozinho e os
  mesmos verbos mediam **48 px**, com `Esqueleto 1 a 19,5 m — faltam 18 m` na
  tela. **As fases E, K e W ensinaram o tabuleiro a oferecer, a marcar preço e a
  armar o verbo — e o tabuleiro é o desvio.** A resposta para a tela principal já
  está construída e a correr em produção; nunca foi aplicada aos 90 %.
- **o que NÃO pede ao `backend`** — nenhuma mecânica, tabela ou número novo. Os
  50 verbos existem e têm suíte. O que se pede é **fiação**: que o turno saiba
  dizer que ofertas estão vivas, a partir de estado que o App já tem em mãos.
- **o que o jogador perde, dito sem maquilhar** — a página em branco. Ofertas
  ancoram, e o risco real é a prosa deixar de ser respondida. A regra acima é a
  defesa, e é uma defesa de desenho, não uma garantia. **A catraca, que o `jogo`
  escreve contra si próprio:** depois de construída, 20 turnos e contar quantos
  usaram o campo. Perto de zero = a proposta é **regressão**, e é o `jogo` quem
  tem de o dizer.
- **peso** — **pesado** (muda o que o jogador faz e em que ordem, e tira-lhe
  controlos de que depende). As metades que **não** esperam: as linhas `▸`
  passarem a abrir o que anunciam (médio), o `↓` deixar de tapar o `Agir →`
  (leve), o piso de 48 nos controlos de ação (médio), a espera deixar de apagar
  a tela inteira (médio), o preço sair do `title` (médio).
- **dívida declarada** — **não passou pelo Figma**: não há ferramenta de Figma
  nesta sessão (só `DesignSync`, que é outra coisa). Fica como dívida com motivo,
  não como esquecimento; o par visual está pedido ao `desenho` por mensagem, com
  todos estes números.


---

## R1 · a tela principal (23/09 · `desenho` × `jogo`)

A pessoa mandou focar no visual e na experiência da tela onde se passa 90 % do
jogo — a da narrativa, não a de batalha — e autorizou trocar paleta, tipografia,
nomes e posições. O censo está em `mente/r1-desenho.md`; o do `jogo`, em
`mente/r1-jogo.md`. Aqui fica só o que é **forma**.

### a lei nova: o `▸` fica reservado ao que se toca

O Mestre escreve `▸ Mural — há um mural onde se lê o que a região precisa.` e no
DOM isso é um `<span>` com `cursor: auto`. **A seta é o glifo universal de "vá
aqui".** O sistema desenha uma afordância e não a honra — e o jogador que a segue
não encontra nada.

**A regra:** o `▸` só aparece onde há toque. Ou o glifo sai, ou a coisa passa a
tocar-se. Onde o que a seta anuncia é uma porta que o mundo abriu, a resposta
certa é a segunda, e a peça chama-se `A oferta`.

Achado pelo `jogo`, medido no DOM vivo; a lei é do `desenho`.

### a lei nova: cor viva só em coisa com que se interage

Copiada, com a fonte. No redesenho de Sunless Skies a Failbetter restringiu a
paleta e **reservou as cores mais vivas à interação e aos pontos importantes**
(<https://www.gamedeveloper.com/design/reading-by-gaslight-a-look-inside-sunless-skies-ui-redesign>),
e o princípio de arte do estúdio é *"o Unterzee é escuro por defeito… a luz que
há, trazes tu"*. Num fundo quase-preto, cada brilho compete com a prosa.

**A regra:** `amber`, `violet` e `mundo` só em coisa com que o jogador interage
ou que ele tem de notar. Tudo o resto vive nos neutros. **É varrível**, e por
isso é lei e não gosto.

O número que a obriga: **o âmbar carrega hoje 24 significados diferentes** na
tela principal — a voz do Mestre, o "✓ salvo", o acampar, as rolagens, a crônica,
o nível, a barra de PV, "Ações", "Tempo", a moldura do painel de ações, o
veredito do golpe, a aba ativa, a moldura do acampamento, os dados de vida, o
objeto sintonizado, a tocha, a chave, o "procurar nesta sala", a linha da raid, o
lugar, a rolagem pendente, o botão de voltar ao fim, a próxima luta, a cerimônia.

### a lei nova: nenhum acento carrega sentido sozinho

Simulando os três daltonismos sobre a paleta **de hoje**, descobriu-se um defeito
que existe e nunca tinha sido medido:

| par | protanopia | deuteranopia | tritanopia |
|---|---|---|---|
| `ok` × `amber` | 1,29 | **1,02** | 1,10 |
| `ok` × `danger` | 2,22 | **1,49** | 1,73 |

O verde do "tudo bem" e o vermelho do "você está a morrer" ficam a 1,49:1 um do
outro. A paleta proposta melhora isso em 1 % — **não resolve.**

**A regra:** cada acento tem **glifo e posição fixos**, e a cor é a segunda
leitura, nunca a primeira. Uma peça que distingue dois estados só por cor é
defeito, mesmo que os dois tons passem a catraca.

### `A oferta` — decidida, e o eixo é do `jogo`

O que o mundo acabou de tornar possível, tocável no sítio onde o mundo o disse.
Pedida pelo `jogo`; fabricada pelo `desenho`.

| eixo | valores | o que decide |
|---|---|---|
| `Tom` | Convite · Preço · Sem volta | `mundo` · `amber` · `danger` |
| `Estado` | Repouso · Foco · Impedida · Tomada | herda a gramática de `Botao` |
| `Chegada` | Assentada · Agora | a marca de "novo neste turno" |

- **Alvo: `ALVOS.piso` (48).** Não é número novo.
- **Três campos obrigatórios na tela, nenhum em `title`: o verbo, o preço, o
  retorno.** O `jogo` mediu que **zero** dos 20 controles de ação de hoje diz o
  preço na tela, e que oito o escondem num `title` — balão de rato, que no
  telefone não existe. *"O veredito antes do clique" é lei da casa e está a ser
  cumprida por um canal que metade dos aparelhos não tem.*
- **Composta, não redesenhada:** instância de `Botao` para o verbo, instância de
  `Consequencia` *Largura=Longa* para o preço.
- **Tipo:** verbo em Spectral 15 (é fala, não máquina); preço e retorno em mono
  13; quem/onde em `inkMeio` 13. Nada abaixo de 12.

**A coincidência que vale registar:** o `jogo` pediu um eixo de três valores sem
saber que o `desenho`, por aritmética de cor, tinha acabado de propor um terceiro
acento. Os três valores dele e os três acentos batem um a um. Não é sorte — é o
mesmo problema visto dos dois lados.

### `A soleira` — o nome, e a recusa do nome anterior

Onde as ofertas moram: região fixa entre a página e o campo do turno, **fora do
rolamento**.

**O `jogo` chamou-lhe `A faixa` e disse que o nome era do `desenho`. O
`desenho` recusa esse nome, e por lei:** já existe `FaixaRelogios` na mesma tela
e `tv-faixa` na folha. Duas coisas com o mesmo nome no mesmo ecrã é a doença
"uma ação, uma forma" um andar acima. **`A soleira`** — a pedra da porta, onde
está o que o mundo abriu e você ainda não atravessou.

- **Vazia não deixa buraco:** altura 0, sem margem, sem borda. Região que reserva
  espaço para nada é mobília a mentir.
- **Teto de 3 na mesa, 1 no telefone**, com "mais N" a abrir o resto. A conta:
  3 × 48 + 2 × 8 = 160 px, dentro dos 319 px de mobília medidos no telefone,
  **sem tocar na página**, porque saem dos 20 verbos que se aposentam.
- **No telefone desfaz-se, não vira gaveta** — a lição de E4: *uma tira duplicada
  não se esconde, esvazia-se.*
- **A razão de existir é jogada, e é do `jogo`:** a oferta do Yorick continuou
  válida por **quatro turnos**; colada à mensagem teria ficado três ecrãs acima.

### `A voz` — o cabeçalho de quem fala dentro da página

Não foi pedida por ninguém; a tela precisa dela. Hoje o "Mestre" é um `<div>` de
10 px mono com um botão de ouvir de **22×22** colado, escrito à mão em dois
sítios do mesmo ficheiro. Com a narração a virar página, é ele que separa uma voz
da seguinte — e é onde esse botão ganha os seus 48 px.

Eixos: `Quem` (Mestre · Você · O mundo) × `Voz` (Muda · A ler · A preparar).

---

## Discordâncias de R1, resolvidas por escrito

### a marca de "novo neste turno" — FECHADA a favor do `desenho`

**O `jogo`** pediu ao `desenho` que confirmasse que o `Selo` *Mudou=Agora* e
`O realce` servem para marcar a oferta que nasce neste turno.

**O `desenho` recusa os dois:**

1. `O realce` é o **degrau 2 da cerimônia**, e está escrito assim nesta folha.
   Usá-lo aqui transformaria cada contrato num acontecimento — e a régua da
   aparição diz o contrário: *uma peça que aparece sempre deixa de ser
   acontecimento.*
2. `Selo` é um **estado** de uma coisa. Uma oferta não é um estado: é uma porta.
   Um selo colado a ela diria "esta oferta está nova", que é uma frase sem
   sentido.

**O que fica em vez disso:** o eixo `Chegada` **dentro** de `A oferta`. Uma marca
que se pode aplicar a qualquer coisa acaba aplicada a tudo; presa à peça, só pode
significar o que a peça significa.

**E ela decai no turno seguinte, não por relógio** — o jogo tem turnos, e uma
marca que morre por tempo morre enquanto o jogador está a pensar.

### os 20 verbos prontos — FECHADA com emenda

**O `jogo`** propôs aposentar os 12 `ACOES_PRONTAS` e as 8 `ACOES_RAPIDAS`: 20
botões iguais em todas as cenas do jogo para sempre, e nenhum fala desta cena.
Nenhum diz Quorin, Yorick, terras baixas, mural. A linha que ele traça, e que o
`desenho` adota inteira:

> **a soleira só oferece o que o SISTEMA sabe e o jogador não consegue adivinhar
> (contratos, lugares, pessoas, preços); os verbos que são invenção do jogador
> — atacar, persuadir, procurar — ficam no campo, porque são dele.**

**A emenda do `desenho`, aceite:** `Atacar` não é igual aos outros e o código
prova-o — tem veredicto vivo (`vereditoDoGolpeAgora`), tem estado *Impedido*, e
tem a linha de consequência que diz **onde** o golpe cai ou **porquê** não
alcança. É peça provada, paga em W1 e W2. Aposentá-la com as outras 19 seria
deitar fora a única que funciona.

**`Atacar` não se aposenta: muda de casa.** Não é uma "ação pronta" — é o verbo
do combate, e pertence onde o combate está.

### o Figma, e a dívida declarada pelos dois

**Nenhum dos dois seniores tinha ferramenta de Figma na sessão de R1.** Ambos
procuraram, em separado, e ambos encontraram só `DesignSync`, que é outra coisa.

A lei da casa diz que nenhuma decisão de design sai sem passar pelo Figma.
**Portanto nada em R1 é decisão: é proposta.** O par antes/depois existe
*renderizado* (<https://claude.ai/artifact/A5aShQ3P28ACTdbJmQAPL8>), não desenhado
no arquivo `e5wJUzInAssoebx5npssKc`.

**A condição de fecho, escrita para quem tiver as ferramentas:**

1. as **24 variáveis** da paleta proposta entram como variáveis, com
   `codeSyntax` WEB igual ao caminho real em JS (`T.pagina`, `T.mundo`…);
2. os **dois quadros do par** (375×812, antes e depois) entram como quadros;
3. `A oferta`, `A soleira` e `A voz` entram como conjuntos com os eixos acima —
   e **`A oferta` monta instâncias** de `Botao` e `Consequencia`, não as
   redesenha por dentro.

Fica escrito como dívida com motivo, **não como esquecimento**.

### R1 · o que o `jogo` e o `desenho` fecharam entre si (23/09)

Trocado por mensagem no mesmo dia, cada um com a sua medição feita sem ver a do
outro. **Nenhuma destas ficou por resolver — não há discordância aberta em R1.**

1. **`A faixa` morreu; a peça chama-se `A soleira`.** Recusa do `desenho`, por
   lei e não por gosto: já existe `FaixaRelogios` **na mesma tela** e `tv-faixa`
   na folha, e dois nomes iguais no mesmo ecrã é *uma ação, uma forma* violada um
   andar acima. O `jogo` aceitou sem reserva: *a pedra da porta, onde está o que
   o mundo abriu e você ainda não atravessou* diz a peça inteira numa imagem.

2. **A marca do novo é o eixo `Chegada` DENTRO de `A oferta`, e decai por TURNO.**
   O `jogo` tinha pedido `O realce` + `Selo Mudou=Agora`; o `desenho` recusou os
   dois — `O realce` é o degrau 2 da cerimônia e transformaria cada contrato num
   acontecimento (contra a régua da aparição), e um `Selo` diz o *estado* de uma
   coisa, mas uma oferta não é um estado, é uma porta. **O `jogo` aceitou e
   registou que o argumento decisivo era do ofício dele e veio do outro lado:**
   *"uma marca que morre por tempo morre enquanto o jogador está a pensar"* — e a
   medida sustenta-o, com mediana de **14,3 s** de espera e prosa longa para ler
   antes de decidir.

3. **`Atacar`: não havia discordância, havia dois botões com o mesmo rótulo.**
   O `desenho` emendou que `Atacar` não se aposenta com os outros 19 porque tem
   veredicto vivo, *Impedido* e linha de consequência. **Verdade — e essa peça
   está DENTRO do combate, e não nesta tela:** `App.jsx:20844` lê
   `emBatalha && combate ? vereditoDoGolpeAgora() : null`. O `Atacar` da tela
   principal não tem nada disso: escreve `"Ataco "` na caixa
   (`ACOES_PRONTAS`, `App.jsx:1108`) e devolve o cursor. **Esse morre com os
   outros 19, pela regra, sem exceção** — "Ataco o bandido" é invenção do
   jogador, e o campo é a casa dele. A peça do tabuleiro fica intocada.

4. **O terceiro caso do `Atacar` foi TRAVADO pelo `jogo`, contra o próprio
   `jogo`.** Ia propor-se que, havendo hostil na cena, atacar virasse oferta com
   alvo e alcance — seria a primeira vez que o veredicto antes do clique aparecia
   fora do combate. **Não se propõe: o sistema não sabe.** O veredicto está
   fechado atrás de `emBatalha && combate`, e fora da luta ninguém mede distância.
   Pedir a peça seria pedir forma para um número que não existe — *o `jogo` a
   inventar mecânica, que é a única coisa que este ofício não pode fazer.* Fica
   como **pedido ao sistema**, escrito como pedido: *o veredicto do golpe sabe
   responder fora do combate?* Se sim, a oferta nasce; se não, a soleira não fica
   pior.

5. **`A voz` tem TRÊS valores em `Quem`, não quatro — contado, não achado.**
   Autores de mensagem no `App.jsx`: `sistema` (503), `jogador` (43),
   `mestre` (1). **Não há quarto**, nem na sala de dois — o que o outro jogador
   faz chega como `sistema`. E a decisão de momento, que é do `jogo`: **o NPC que
   fala não é uma quarta voz.** Yorick e Quorin falam em travessão dentro da prosa
   do Mestre e continuam lá — *numa mesa de verdade o Mestre É a voz dos NPC*.
   Separá-los daria a um RPG a cara de uma aplicação de conversa, e obrigaria o
   narrador a devolver fala estruturada, que ele não devolve.

6. **Requisito de momento sobre a narração virar página (do `jogo` ao `desenho`).**
   A mudança está certa e o `1,039:1` prova que o balão do Mestre é uma borda à
   volta de nada. Mas **o balão do JOGADOR não é decoração:** durante os 14,3 s de
   espera, com `bloqueado` a apagar a tela inteira, a frase que ele acabou de
   escrever é **o único sinal de que o turno foi enviado**. *Uma espera muda de
   catorze segundos é o jogador a perguntar se clicou.* A forma é do `desenho`;
   o requisito é do `jogo`: **o que acabei de mandar distingue-se do que o mundo
   respondeu, e fica visível enquanto espero.**

7. **Reparo do `jogo` ao `mundo` (#79D6C6), aceite como reparo e não como
   recusa.** A aritmética do `desenho` é irrespondível — o âmbar carrega **24
   significados** na tela principal, e o terceiro acento tem de existir. Mas o
   verde-água lê-se, em jogos, como *seguro* e *cura*, e a oferta mais comum da
   sessão foi *"ir para as terras baixas"* — que não custa nada para aceitar e
   pode matar o herói. **`Tom=Convite` quer dizer *o mundo abriu isto*, nunca
   *isto é seguro*.** Onde há perigo conhecido, quem fala é o campo do **retorno**,
   que é obrigatório na peça e é texto. *Uma cor que mente uma vez deixa de ser
   lida para sempre.*

8. **A dívida do Figma é dos DOIS, com o mesmo motivo.** Nenhum dos dois tem as
   ferramentas do arquivo nesta sessão (existe `DesignSync`, que é outra coisa).
   Declarada, com a condição de fecho no `r1-desenho.md` §7.

9. **A terceira prova está por pagar, e o `jogo` escreveu o número contra si.**
   Quando os três baratos fecharem (piso da letra, piso do alvo, coluna de 65ch),
   joga-se o antes e o depois: turnos até ao primeiro contrato aceite · toques por
   decisão · segundos por turno · **e quantos dos 20 turnos usaram o campo de
   texto**. *Perto de zero = a soleira virou point-and-click, a prosa deixou de ser
   respondida, e o `jogo` declara regressão.*

### R1 · as duas correções do `desenho`, e a resposta ao requisito 6 (23/09)

Escritas depois de o `jogo` responder. **Nas duas, quem tinha razão era ele** —
e numa delas por um motivo mais duro do que o que ele deu.

#### 1 · O `Atacar`: o `desenho` defendeu o botão errado

A emenda do `desenho` foi: *"`Atacar` tem veredicto vivo, estado Impedido e linha
de consequência; é peça provada em W1/W2, não se aposenta"*. **O raciocínio estava
certo e o alvo estava errado.** Verificado no código, depois do reparo:

- `App.jsx:1108` — o `Atacar` de `ACOES_PRONTAS`, que é o da tela principal:
  `{ icone: "⚔", glifo: IconeEspada, rotulo: "Atacar", texto: "Ataco " }`.
  **Escreve sete caracteres na caixa e devolve o cursor.** É um atalho de teclado.
- `App.jsx:11753` — `vereditoDoGolpeAgora` abre com `const comb = combateRef.current;
  if (!comb) return null;`. **Fora de combate não há veredicto**, logo não há
  *Impedido*, não há alvo, não há alcance.
- E o próprio comentário do ficheiro já o dizia, em `App.jsx:21101`: *"com a luta
  aberta, `Atacar` ATACA… FORA de combate ele continua enchendo a caixa"*.

**O `desenho` leu um comentário sobre um botão e atribuiu-o a outro com o mesmo
rótulo.** A peça que ele defendia é real, é boa e vive no tabuleiro — e ninguém
lhe estava a tocar. O `Atacar` da tela principal **morre com os outros 19**.

*A lição, e ela já estava escrita nesta folha por outras mãos: uma peça corrigida
com o motivo escrito vale mais que uma peça que nunca errou. O mesmo vale para
uma emenda.*

#### 2 · O acento `mundo` é RETIRADO — e o número é pior que o argumento

O `jogo` reparou que um verde-água *promete seguro e cura*, e que
`Tom=Convite` não pode prometer segurança: a oferta mais comum da sessão dele foi
*"ir para as terras baixas"*, que não custa nada e pode matar o herói. **Ele tinha
razão, e a medição mostra que o problema não é cultural — é ótico:**

| par | distância de matiz | razão de luz | protanopia | deuteranopia | tritanopia |
|---|---|---|---|---|---|
| `mundo` #79D6C6 × `ok` #8FE0A2 | **36°** | **1,09:1** | 1,07 | 1,10 | 1,08 |

**A 36 graus e 1,09:1, o "o mundo abriu isto" e o "está tudo bem" são a mesma cor
para o olho** — e ficam a 1,07–1,10 sob os três daltonismos. Não é uma associação
a desfazer com disciplina: é uma colisão.

Procurou-se a substituição, e ela não existe: `#7FC5E0` (azul-gelo) afasta-se do
`ok` (63° / 1,22) mas fica a **1,00:1 do âmbar em deuteranopia**; `#8FB8DC`
(azul-aço) dá 1,03:1 contra o âmbar. **Cinco acentos saturados não cabem na faixa
de luz desta paleta.** Qualquer quinto colide com um dos quatro.

**A decisão, e ela é melhor do que a cor que substitui:**

1. **O mundo ambiente — relógio, data, estação, lugar, a espera — vai para os
   neutros** (`inkDim` sobre `chao`). É a lei que o próprio `desenho` acabara de
   escrever três secções acima: *cor viva só em coisa com que se interage ou que
   se tem de notar*. Um relógio não é nenhuma das duas. **A lei nova apanhou o
   token novo, e o token novo é que cai.**
2. **`Tom` em `A oferta` deixa de ser três cores e passa a ser a rampa que o
   `Botao` já tem** — a mesma que D4 fixou quando corrigiu o *Impedido*:
   - `Convite` — **sem preenchimento**, borda `bordaViva`, tinta cheia.
   - `Preço` — borda `amber`, e o preço escrito em `amber`.
   - `Sem volta` — borda `danger`, e o preço escrito em `danger`.

**E isto mata a armadilha que o `jogo` viu, em vez de a gerir:** `Convite` deixa
de dizer *isto é seguro* porque deixa de dizer seja o que for. É a **ausência de
um aviso**, não a promessa de uma segurança. Quem fala de risco é o campo do
**retorno**, que é obrigatório na peça e é texto — como o `jogo` pediu.

**O que continua verdade sem o acento novo:** o âmbar tinha 24 significados, e a
lei *cor viva só em coisa com que se interage* tira-lhe os do chassis (o "✓ salvo",
os botões de cabeçalho, o "Tempo", as molduras dos painéis) e os do mundo ambiente.
O que lhe sobra é **conteúdo e ação primária** — que é exatamente a arquitetura que
a Baldur's Gate 3 publica. **A paleta desce de 24 para 21 tons e de 7 para 5
famílias de matiz, e fica melhor.**

#### 3 · A resposta ao requisito 6: o que eu mandei, enquanto espero

O `jogo` pediu, e o requisito é justo: com a narração a virar página, a fala do
jogador não pode ser engolida, porque durante os 14,3 s de espera — com
`bloqueado` a apagar a tela — ela é **o único sinal de que o turno foi enviado**.

**A forma, e ela não é peça nova: é um eixo em `A voz`.**

`A voz` ganha `Resposta` (**Veio · Espera-se**), válido só em `Quem=Você`:

- **A distinção, que vale sempre:** a fala do jogador fica na página — um livro
  também regista o que você disse — mas em **itálico, recuada, em `inkMeio`
  (a tinta quente mais fraca) e com filete próprio**. Nunca tem a cor nem o peso
  da prosa do Mestre. É a mesma página, outra mão.
- **`Resposta=Espera-se`:** o filete passa de `bordaViva` a **`amber`** — a cor
  do Mestre, porque é ele que ainda não respondeu — e **respira**: pulso lento de
  1,6 s **no filete, nunca no texto**. A prosa não se move um pixel, e por isso
  isto não pode custar a leitura nem o turno.
- **A saída é o acontecimento, não o relógio:** quando a resposta chega, o filete
  assenta em `bordaViva` e o pulso para. Nada expira sozinho.
- **`prefers-reduced-motion`:** o pulso não acontece; o filete fica `amber` fixo e
  a legenda diz *"o Mestre está a tecer"* — a mesma informação, sem movimento.
- **A página ancora-se na fala pendente:** durante a espera, a última coisa
  visível é o que você acabou de mandar. Se a única coisa viva no ecrã é a prova
  de que o jogo o ouviu, essa prova tem de estar à vista.

*Uma espera muda de catorze segundos é o jogador a perguntar se clicou — e a
resposta a isso não é uma roda a girar, é a sua própria frase, viva, à espera.*

---

### R4a · o piso de 45 caracteres não vale para telefone, e fica escrito por quê (23/09 · `aprendiz`)

O `oficial` mediu a coluna já ligada (`TIPOS.prosa` = 17px + `.tv-coluna`) no
telefone: **35 caracteres por linha**, e fez a conta — 45 caracteres a 17px
pedem **387px de texto**, e o ecrã do telefone (375×812) tem **375px
inteiros**, sem descontar margem nenhuma. *O piso de 45 é aritmeticamente
inalcançável nesse corpo, em qualquer largura de coluna que caiba no
aparelho.*

**A decisão: o piso de 45 caracteres não se aplica ao telefone.** `TIPOS.prosa`
continua um degrau só — 17px, nos dois aparelhos. Não nasce um oitavo degrau
para encolher a prosa exatamente na tela onde ela mais precisa de ser lida.

**A conta que fecha a decisão, e é só aritmética (Medida, não Estudo — a
largura de coluna do telefone não foi remedida ao vivo nesta etapa; o número
sai do que o `oficial` já mediu, e essa é a dívida declarada abaixo).** A
largura de caracteres é fixa para uma dada largura de coluna: o glifo médio
de uma fonte escala com o corpo, então caracteres-por-linha é
inversamente proporcional ao tamanho da letra, para a MESMA coluna. Se 17px
dá 35 caracteres, atingir 45 pede um corpo de **17 × 35 ÷ 45 ≈ 13,2px** —
abaixo de `TIPOS.corpo` (15, a fala) e quase no chão de `TIPOS.rotulo` (13, a
voz DA MÁQUINA). Encolher a protagonista da tela até quase o tamanho do
rótulo que a acompanha reabriria, na peça que existe para curar a doença, a
doença que R1 mediu: **363 de 575 tamanhos do projeto abaixo de 12px, a pior
região sendo exatamente esta.** Um piso de linha que só se cumpre desfazendo
o piso da letra não é piso — é troca, e a casa já decidiu qual das duas
guardar quando as duas não cabem juntas.

**Por que o número de Bringhurst não é lei aqui, e a WCAG não obriga nada.** A
1.4.8 (AAA) fixa só o TETO — "largura não maior que 80 caracteres" — e não
escreve piso nenhum; os 45–75 (66 de referência) são de Bringhurst, pensados
para coluna de livro ou janela de desktop, onde LARGURA e CORPO DA LETRA são
dois eixos que se ajustam um ao outro — o leitor redimensiona a janela, ou o
tipógrafo escolhe a caixa. No telefone só um dos dois é livre: a largura é o
aparelho, 375px, e não se negocia; o corpo é o que sobraria para ajustar — e é
exatamente esse ajuste que o parágrafo acima recusa, porque o corpo tem piso
próprio e mais duro (a legibilidade da protagonista, que é o motivo de esta
fase inteira existir). **Quando os dois pisos não cabem na mesma largura, vale
o piso da letra.**

**O que continua a valer no telefone:** o teto (80 caracteres / `.tv-coluna`
65ch — 35 está a 22% dele, folga grande) e o piso da letra (`TIPOS.piso` = 12,
`TIPOS.prosa` = 17, os dois intactos). O que deixa de valer é o piso de linha
da secção 1.2 de `r1-desenho.md`: ele descreve um defeito real na paleta
ANTIGA (15px, balão de `max-width:85%`), mas não é mais o alvo certo depois
que `TIPOS`/`.tv-coluna` (R2) mudaram o que compõe a linha.

**Dívida que fica aberta, e não é desta etapa.** 35 caracteres continua uma
linha curta — mais perto do extremo que a própria Baymard também penaliza (uma
linha curta demais obriga o olho a saltar de linha com mais frequência que uma
de 60–70). A saída certa não é a letra: é a LARGURA da coluna no telefone —
seja o item 6 de `r1-desenho.md` (o rosto da cena, que tira 96px da página em
troca de orientação), seja rever quanto padding a página do telefone reserva
hoje ao redor da coluna. As duas são trabalho de TELA, não de tipo, e por isso
ficam para quem tem o bastão do `App.jsx`, não para esta etapa (`ui.jsx` /
`estilo.js`). Fica também a dívida do método: este número não foi remedido ao
vivo por mim — herda a medida que o `oficial` já tinha feito, porque tocar o
jogo vivo para conferir a coluna exigiria uma campanha aberta, e essa etapa
está com o bastão do `App.jsx` na mão do `oficial` ao mesmo tempo.

### R1b · a régua da soleira estava escrita para OBJETOS e devia estar escrita para ESTADOS (`jogo`, 23/09)

**Correção do `jogo` à lei que o próprio `jogo` escreveu em R1.** Veio ao
construir: o `oficial` mediu que **o mural nunca fica vazio por desenho**, logo a
soleira nunca ficaria vazia — e a tábua da cidade estaria lá em todo turno, em
toda cidade, empurrando a prosa de **58,1 %** para **38,7 %** com o teto de 3.

**A lei de R1 dizia:** *a soleira só oferece o que o sistema sabe e o jogador não
consegue adivinhar* — teste: *o jogador podia ter pensado nisto sozinho?*

**Aplicado com honestidade, o teste responde em dois tempos:**
· **a tábua da cidade — sim, podia.** Depois da primeira cidade ele sabe que
  cidades têm tábua. *O que se aprende a esperar, adivinha-se.* → **mobília**.
· **o Yorick a olhar para ele à espera de resposta — não, não podia.** Não sabia
  que alguém pregou coisa nova, nem o preço. → **oferta**.

> **A régua não separa OBJETOS, separa ESTADOS.** A tábua é **lugar**, e está
> sempre lá. Um papel que alguém acabou de pregar, **e por que ainda se espera
> resposta**, é oferta — e **deixa de o ser quando ninguém está à espera**.

**A prova de que isto está certo é que o código já o sabia, e a mesa não reparou.**
O `PainelMural` tem **duas listas com títulos diferentes**, e tem-nas há mais
tempo que esta mesa:

```
CARTAZES DISPONÍVEIS      ← acervo do lugar
OFERECIDOS A VOCÊ         ← alguém espera resposta sua
```

**A soleira leva só `OFERECIDOS A VOCÊ`. Nunca `CARTAZES DISPONÍVEIS`.**
A mobília chega pela porta — o `▸ Mural`, que deixou de ser `SPAN` e é `BUTTON`
de 48 px. *A gramática de um lugar é uma porta, não um cartão de oferta.*

**O teto, decidido pelo `jogo` com a conta do `regente`:** **2 na mesa, 1 no
telefone.** Cada oferta custa 54 px ≈ **8 pontos de prosa**; com 2 a página fica
em **50,1 %**, que se paga; com 3 fica em **38,7 %**, um terço da protagonista, e
não se assina. Com a tábua fora, o turno típico tem **0 ou 1** oferta (na sessão
de R1 o máximo de ofertas vivas ao mesmo tempo foi **uma**), logo o teto é um
travão que quase nunca se toca. **E o teto é uma promessa sobre a prosa, não
sobre as ofertas:** o que não cabe vai para a porta do `+N`.

**A ordem por perecibilidade encolhe de cinco para três, e melhora:** *quem espera
resposta · quem está em cena · o papel que alguém acabou de pregar*. Saem a tábua
e o mercado, que não eram perecíveis. **O princípio que a sustenta: a soleira é *o
que você perde se não agir agora* — e mobília não se perde.**

### R1b · `Esperar` não é oferta, e a soleira não é onde se põe o que sobrou

Veredito do `jogo` **contra a própria etapa**. Pela mesma régua: *o jogador podia
ter pensado em esperar sozinho?* **Podia — é a coisa mais óbvia do mundo.**
`Esperar` **nunca devia ter entrado na soleira**; entrou porque a etapa lhe tirou
a aba `Tempo` e não lhe deu casa. *A soleira virou o sítio onde se põe o que
sobrou, que é como todas as gavetas começam.*

**E o achado do `regente` é o diagnóstico de R1 outra vez, no mesmo dia:**
`passarTempo` move o relógio, vira o dia, cobra a renda e muda o clima, e
**"espero doze horas" faz o Mestre narrar doze horas sem mexer num único número**
— um verbo de sistema **sem porta de texto**, a família dos 50 contra 17.

- **A resposta certa não é de desenho: é dar-lhe a porta de texto.** Vai como
  **pedido ao sistema**, irmão do pedido sobre o veredicto do golpe fora do
  combate. Com a porta, `Esperar` sai da interface e o problema dissolve-se.
- **Até lá, e é uma trava:** **não sobe o telefone com `Esperar` atrás do `+N`.**
  Ou o `+N` vira porta antes, ou o controlo de passar o tempo guarda o lugar que
  tinha. Remover uma função que mexe no relógio, no dia, na renda e no clima, e
  deixar no lugar uma frase que o jogador não sabe que se toca, é **pesado**.
- **E o `+N` é botão mesmo depois de tudo resolvido, por uma razão que envergonha
  a mesa:** `"+N ofertas"` como texto **é o defeito do `▸ Mural` a renascer dentro
  da peça que se construiu para o matar** — uma marca que promete que há mais e
  não se toca. Régua: porta, 48 px, **e diz quantas** — um número é o único jeito
  de o jogador saber se vale a pena abrir.

---

## R13 · o orçamento do ecrã, e a moldura que devolve a página (`jogo`, 23/09)

**O par visual está no Figma** — `e5wJUzInAssoebx5npssKc`, secção
*R13 · O ORÇAMENTO DO ECRÃ*, cinco telas **1:1, em px reais**: telefone
hoje → depois de A → depois de A+B, e mesa hoje → depois. Nenhuma faixa ali é
estimativa: todas saíram do DOM ao vivo, no mesmo save, durante os 20 turnos de
R6 (`mente/r6-jogo.md`).

### a lei nova: o ecrã tem orçamento, e o orçamento é lei antes de ser medida

Esta mesa desenhou nove etapas sem nunca ter escrito **quanto do ecrã cada
peça pode comer**. Por isso R1 pôde orçamentar os seus 96 px contra uma página
de 418 que já não existia, e por isso a soleira pôde nascer com 149 px sem
ninguém somar. **Cor é número, logo é tabela** — e **altura também é número**.

**O orçamento, medido (telefone 375×812, save real com 1 oferta viva e 2
prazos aceites):**

| faixa | hoje | depois de A | depois de A+B |
|---|---|---|---|
| cabeçalho | 73 | 73 | 73 |
| **o rosto da cena** | — | — | **96** |
| **A PÁGINA** | **151** | **503** (586 sem oferta) | **407** (490 sem oferta) |
| a soleira | 149 | 96 · **0 quando não há oferta** | 96 · 0 |
| a barra de estado | 180 | — | — |
| a fita de prazos | 81 | — | — |
| **a linha do herói** | — | **48** | **48** |
| o campo + Agir | 102 | 102 | 102 |
| as abas | 76 | 76 | 76 |
| **a página, em %** | **18,6 %** | **61,9 %** (72,2 %) | **50,1 %** (60,3 %) |
| **linhas de prosa** | **5,5** | **18,2** (21,2) | **14,7** (17,8) |
| **palavras visíveis** | **~38** | ~128 (~149) | ~103 (~124) |

**Cada coluna soma 812, e isso é catraca.** As duas primeiras versões deste
orçamento — a do `jogo` e a do `desenho`, feitas em separado — **erraram pelo
mesmo motivo: listaram a soleira a encolher e não somaram os px de volta à
página.** *Uma tabela de orçamento que não fecha na altura do ecrã não é um
orçamento; é uma lista de desejos.*

**Mesa 1280×800:** página **396 → 588** só com A (**73,5 %**) e **492** com o
rosto (**61,5 %**) — a soleira passa de duas ofertas empilhadas (123 px num
contentor de 1 144 de largura) para uma linha (62), e cabeçalho (73) +
estado+prazos (106) viram a cinta de 48.

**O número que fecha o caso, e é o que ninguém tinha:** a prosa é **Spectral
17 px / entrelinha 27,6 px**, coluna de 63ch na mesa e **40ch no telefone**.
Logo hoje o telefone mostra **5,5 linhas ≈ 38 palavras**. Um parágrafo deste
jogo tem 60–90. **O telefone não consegue mostrar um parágrafo inteiro.** Não é
apertado: é incapaz.

**E o defeito de fundo, que é de jogo e não de forma:** a moldura **cresce com
o jogo**. Cada contrato aceite pela soleira acrescenta um chip de prazo de
~40 px. **A tela pune o jogador por jogar** — a peça que a Fase R construiu
para ele agir é a mesma que lhe encolhe a página a cada uso.

### a régua de quem fica sempre na tela

> **Fica sempre visível o que o jogador usa para decidir *enquanto* está a
> decidir. O que só importa quando muda, chega quando muda, e depois recolhe.**
> *Estar sempre visível não é a única forma de estar disponível — mas nada que
> ele use para decidir pode desaparecer.*

A régua não é opinião: sai do censo dos 20 turnos de R6, item a item.

| item da barra | olhei para decidir? | destino |
|---|---|---|
| `PV` | **sim, 1×** (T6 → decidiu o acampamento de T12) | **fica** |
| estado vivo (`Exausto`) | **sim, 1×, e foi ele que decidiu** | **fica, e nunca recolhe** |
| relógio (data+hora) | **sim, 2×** (T12, T19) | **fica** |
| prazo | **sim, 1×** (T13, antes de aceitar o 2.º contrato) | **fica, no relógio** |
| a bolsa | **não existe na tela** | **ENTRA** |
| lugar | 0× — soube sempre pela prosa | **sai: o rosto da cena di-lo melhor** |
| `NIV` | 0× | recolhe para a ficha |
| `PM` | 0× (guerreira; nunca gastei mana em 20 turnos) | recolhe — **volta sozinho** ao primeiro ponto gasto ou ao primeiro herói com magia |
| `XP` | 0× | recolhe para a ficha |
| clima · estação | 0× — a prosa disse "chuva" e "sol" melhor que o ícone | recolhe para o rosto da cena |
| heroísmo | 0× como número (usei-o 1×, e no véu do dado) | recolhe |

**A bolsa entra, e vale mais do que os dois que saem**, com número: em 20
turnos a soleira ofereceu 205 e 115 moedas, o mercado mostrou 30 preços entre
20 e 298, e **a tela nunca disse quanto eu tinha**. `XP 178/300` e `NIV 1` não
decidem nada sozinhos; **a moeda é o denominador de todas as ofertas e de todo
o mercado**. *Uma oferta com preço e sem saldo é meio veredito.*

### `Esperar` sai da soleira e vai para o relógio — e isto fecha a trava de R1b

`formas.md` §R1b já tinha julgado que **`Esperar` nunca devia ter entrado na
soleira**, e deixou uma trava: *"ou o `+N` vira porta antes, ou o controlo de
passar o tempo guarda o lugar que tinha"*. **R6 mediu o custo dessa dívida: em
9 dos 20 turnos a soleira não tinha mais nada — 149 px de moldura em quase
metade dos turnos para não oferecer nada.**

**A saída não é esconder: é dar-lhe casa.** `Esperar` passa a ser **o toque no
relógio da linha do herói**. Não é remoção, é mudança de morada — e é
*uma ação, uma forma*: **o tempo mora onde o tempo se lê.** A trava está paga.

**E de passagem fecha R11.** `T.mundo` nasceu em R2 com uma justificação
exacta — tirar ao âmbar **cinco** significados: *relógio, data, estação, lugar
e a espera*. R11 contou e disse a verdade: `T.onMundo` tinha **zero** leitores e
os cinco continuavam âmbar. **A linha do herói é onde os cinco se juntam pela
primeira vez, e `mundo` é a cor deles.** Um acento que não tira trabalho a
nenhum outro é só mais uma cor; este passa a tirar.

### a soleira deixa de existir quando não tem o que oferecer

Não encolhe, não fica vazia a fingir: **ocupa 0 px**. Uma faixa vazia é uma
promessa por cumprir em todos os turnos.

**A divergência que eu abro contra mim mesmo, para não a descobrir depois:**
uma soleira que aparece e desaparece **mexe a página debaixo dos olhos do
jogador**, e isso é exactamente o defeito que esta casa persegue noutros
sítios. Duas saídas, e a escolha é do `desenho` porque é de forma:
**(a)** a página cresce e encolhe, e o movimento é a informação — *apareceu
coisa nova*; **(b)** a página fica fixa no tamanho menor e a soleira entra por
cima do rodapé. **Eu prefiro (a)** e digo porquê do meu lado: nos 20 turnos, a
oferta apareceu **3 vezes** e nas 3 foi acontecimento — a página encolher *é*
a notícia. **Fechada a favor dele**, com a razão que a casa já tinha
escrita: a soleira vive no convés, colada ao campo — ao nascer empurra o campo
para baixo e **a prosa não se move um pixel**. O salto de leiaute é **zero**.
Eu propus escolher entre duas saídas quando existia uma terceira, melhor.

### o momento do rosto da cena (etapa B) — o que é meu

1. **Quando aparece:** sempre. É o topo do papel, não um acontecimento.
2. **Quando muda:** **só quando o lugar muda.** Não muda por turno, não muda
   por hora — a luz da faixa desliza com a hora, a gravura não. *Uma imagem que
   muda a cada turno vira um pisca-pisca e deixa de informar.*
3. **A transição entre lugares é onde ele ganha o ordenado:** a troca é o único
   movimento da tela principal, e é ela que diz *saíste de um sítio e chegaste a
   outro* — que é a coisa que o jogo hoje só diz numa linha de sistema.
   **Regra minha, e não se negocia: a transição não bloqueia o campo.** Ela
   corre por cima de um turno que já pode ser escrito, e respeita
   `prefers-reduced-motion` com corte seco. *Nunca pode custar o turno.*
4. **O que ele faz a prosa deixar de repetir — contado, não suposto.** Das 21
   mensagens de prosa desta sessão, **10 abrem com descrição de lugar, hora ou
   clima** (*"A praça cheira a cera e tinta…"* · *"O sal estala sob as botas…"*
   · *"A estrada para Vila de Espinho se estende sob um céu pesado…"* ·
   *"A chuva começa fina, depois grossa…"*), com **média de 14,3 palavras**.
   Num ecrã que mostra 38, são **37 % do que o jogador vê**. E as 10 são quase
   todas **chegadas a um lugar novo** — ou seja, o rosto devolve a frase de
   abertura **exactamente nos turnos em que o jogador está mais perdido**.
   *(Número corrigido contra mim: tinha dito 11 de 20 e ~25 palavras de cabeça,
   fui contar e é menos. Fica o menor, que é o verdadeiro.)*
5. **O veto que eu ponho e que é meu pôr:** **B não sobe antes de A.** Hoje a
   página tem 151 px; tirar-lhe 96 deixa **55 px = 2 linhas**, e aí a
   xilogravura não é um livro ilustrado, é uma legenda. **A ordem não é
   preferência, é aritmética.**

### os quatro defeitos de R6, e quais são de moldura

| defeito medido em R6 | é de quê | onde se paga |
|---|---|---|
| a bolsa fora da tela, com todas as ofertas denominadas nela | **moldura** | **etapa A** — entra na linha do herói |
| `Convidar Vero` traz escrito *"mais 5 dias antes de decidir"*, é clicável, gasta uma chamada ao Narrador e responde o que já estava escrito | **moldura** (é a soleira) | **etapa A** — oferta que não pode mudar nada **não é oferta**: vira estado, sem toque |
| só o `ir` do mapa diz o custo em tempo; uma frase minha comeu **seis dias** contra um prazo de 4 noites | composição de cada controlo | **R13, spec para o `oficial`** — sem isto o relógio novo não significa nada |
| `Descanso longo` cobra a noite do prazo, a comida e a água, e não escreve nenhuma | composição de um controlo | **R13, spec para o `oficial`** |

**Os dois últimos ficam aqui e não numa pauta futura** por uma razão de jogo:
a etapa A põe o relógio e o prazo no centro da tela. **Um relógio em destaque
sobre ações que não dizem o que custam é uma promessa que a tela não cumpre** —
seria dar ao jogador o mostrador e esconder-lhe o preço.

### o selo de prazo conta o que FALTA, não o que passou

Medido jogando: o chip diz `1/4`, que é **passos gastos**, quando a pergunta do
jogador é *"dá para ir ao posto e ainda voltar a tempo?"*. E há o defeito que só
o uso pega: **passaram-se seis dias de calendário e o chip continuou `1/4`**,
porque só conta noites dormidas. O jogador vê o relógio saltar uma semana e o
prazo parado, e conclui, com razão, **que o prazo não é a sério**.

> **Régua:** o prazo diz **quanto falta** (`Alba: 3 noites`), nunca quanto
> passou; e **o nome do contrato não ocupa a linha** — o nome é a parte que o
> jogador já sabe.

### as peças pedidas ao `desenho` (eu componho, ele fabrica)

1. **`A linha do herói`** — 48 px, e **a linha inteira é o alvo** que abre a
   ficha (um alvo, não seis). Carga: `PV` · `PM` (condicional) · a bolsa ·
   relógio+prazo · os estados vivos. Eixos do momento, que são meus:
   *Calma · Um estado vivo · Prazo a apertar*.
2. **`O selo de prazo`** — cabe na linha, conta o que falta, vira `danger` na
   última noite.
3. **`O relógio`** — peça **tocável**, porque é para lá que vai o `Esperar`.
4. **`O rosto da cena`** — 96 px, xilogravura por semente, a luz pela hora.
5. **`A soleira` ausente** — a forma de não estar lá.

*Assinatura do `desenho` pendente nesta secção; onde ele divergir, o lado dele
entra por baixo de cada item, nunca em dois códigos.*

### R13 · o que o `jogo` e o `desenho` fecharam entre si (23/09)

**As duas medições bateram ao pixel, sem terem visto uma a outra:** 180 · 81 ·
102, bloco do herói 87, heroísmo 48, três spans de 15. *Duas medições
independentes no mesmo número é a melhor prova que este ciclo tem*, e fica
escrito assim.

**Correcções ao que eu (`jogo`) escrevi acima, e todas contra mim:**

1. **`A linha do herói` passa a chamar-se `A cinta`** — recusa dele, por lei, e
   aceite sem reserva. Duas razões, e as duas são melhores do que o meu nome:
   `A linha` **já existe** em `formas.md` (a peça de 72 px do campo do turno,
   D4), e **a peça não é só do herói** — metade dela é do mundo, e é essa metade
   que paga R11.
2. **O cabeçalho (73 px) também morre, e eu não o tinha na conta.** Ele
   dissecou-o: `[Início 48] "Taverna" (Cormorant 28) [⛺ 48] [🎲 48] [📜 48]` —
   **setenta e três pixels, no telefone, para escrever o nome do produto a quem
   já está dentro dele.** *O sistema não fala de si mesmo*, e aqui ele diz o
   próprio nome. Foi o melhor achado da etapa e não é meu.
3. **"Abrir a ficha" tem hoje DUAS caras** — o bloco do herói é
   `onClick={() => setAba("gestao")}` **e** existe a aba `GESTÃO`. A lei-mãe
   desta mesa quebrada na tela onde se passam os 90 %.
4. **O orçamento sobe, por causa de 2 — e as duas primeiras contas estavam
   erradas, as duas pelo mesmo motivo.** `jogo` publicou 417/321; `desenho`
   publicou 437/341; **nenhuma somava 812**, porque ambos listaram a soleira a
   encolher e não somaram os 66 px de volta à página. O `desenho` apanhou-o ao
   somar as faixas, que é o que qualquer um de nós devia ter feito antes de
   publicar. **Os números certos: 503 px com oferta, 586 sem oferta, 407 com o
   rosto, 490 com o rosto e sem oferta** — 3,33× a página de hoje. **E o erro da
   mesa (481/385) era meu, cometido em separado, e ninguém o apanhou: são
   588/492.** *Fica escrito com o erro à frente, porque um orçamento é a coisa
   desta etapa que mais gente vai copiar sem reconferir.*
5. **A minha divergência contra mim (a soleira que some mexe a página) está
   fechada a favor dele, e a razão já cá estava:** a soleira vive no convés,
   colada ao campo; **ao nascer empurra o campo para baixo e a prosa não se move
   um pixel.** O salto de leiaute é **zero**. Eu tinha proposto uma escolha
   entre duas saídas quando a casa já tinha a terceira escrita.
6. **O selo de prazo não distingue por cor, distingue por forma.** Ele mediu
   antes de construir e o selo de três cores **reprovava em visão normal**:
   1,26:1 entre "calmo" e "a apertar" — **pior do que o defeito que R9 acusou**
   (1,37). A última noite **enche** (chip cheio, 6,37:1 de luminância), e as
   outras duas diferenças são um número que se lê. *Bom que se meça antes de
   construir e não depois.*

**O que ficou meu, e ele assinou:** a régua de quem fica sempre na tela, a
carga da cinta item a item pelo censo dos 20 turnos, a bolsa como obrigatória,
o `Esperar` a mudar-se para o relógio, o prazo a contar ao contrário, e a ordem
**A antes de B** — *aritmética, não preferência*.

**O que eu acrescentei depois de ele fechar as peças, e é composição:**

- **Os quatro botões do cabeçalho que morre não se perdem**, e a morada de cada
  um sai do que eu usei em 20 turnos: `⛺` (1 uso, decisivo) **vai para o toque
  no relógio**, ao lado do `Esperar` — *acampar é passar o tempo*; `🎲 rolagens`
  (0 usos) é **preferência de exibição** e sai da tela principal; `📜 crónica`
  (0 usos) **vai para o `Diário`**, que é onde a crónica mora; `Início` (1
  tentativa, **e não fez nada** — é defeito) vai para o pé da ficha.
- **E a troca do acampamento é estritamente melhor, não só mais barata:**
  quando existe um estado que o descanso cura, **`Montar acampamento` sobe à
  soleira como oferta**. Medido em T12: o `😵 Exausto` apareceu na barra e **a
  cura não foi oferecida em lado nenhum** — eu tive de me lembrar do emoji no
  canto. O turno em que eu realmente acampei passa a **um** toque, não dois.
- **`✓ SALVO` sobrevive ao cabeçalho que o alojava.** Num jogo cujo save mora só
  no `localStorage` do jogador, **é a única coisa que lhe diz que a vida dele
  está segura**. Passa a transitório na cinta: aparece ao gravar, some sozinho,
  **0 px permanentes e zero deslocamento de leiaute**.
- **A gravura não anima na chegada** — concordo com ele, e a razão é de jogo:
  uma imagem que transiciona a cada cena é **um piscar por turno**, e *nunca
  pode custar o turno*. **Mas a chegada tem de se notar, e não inventa peça:**
  o **nome do lugar** chega com o eixo **`Chegada`** que `A oferta` já tem —
  *decai por turno, nunca por tempo*, que é a lei que ele ganhou em R1. Uma
  ação, uma forma; a marca de "isto é novo" já existe nesta casa.

**A dívida do Figma, declarada pelos dois em R1, está paga nesta sessão.** O
`jogo` pôs a secção *R13 · O ORÇAMENTO DO ECRÃ* (cinco telas 1:1 com as faixas
em px reais — o diagrama do orçamento, que é composição); o `desenho` põe as
variáveis, as peças com eixos e o par renderizado a 375×812. *São coisas
diferentes e não se duplicam: uma diz quanto cada faixa pesa, a outra diz com
que cara.*

**A especificação de construção está em `mente/r13-mesa.md`**, detalhada ao
ponto de o `oficial` a construir sem perguntar.

---

## R13 · a fabricação — a forma fechada de cada peça (`desenho`, 23/09)

O `jogo` compôs o momento (`mente/r13-mesa.md`); aqui fica **de que cada peça é
feita**. Tudo o que está em `T.` sai de `src/estilo.js` — **nenhum literal de
cor nasce nesta etapa**, e é isso que faz a mudança desfazer-se num commit.

**O que todas as peças herdam, e não se repete em cada uma:**
o alvo é `ALVOS.piso` (48); a letra sai de `TIPOS` e **nada desce de 12**; o
anel de foco é `tv-anel-foco` com a lei de E4 (nunca só `box-shadow`); todo
movimento tem saída e respeita `prefers-reduced-motion`.

---

### `A cinta` — o topo do telefone, 48 px, e substitui três faixas

**Medidas.** Altura **48** (`Estado=Calma` e `Estado=Prazo a apertar`) e **72**
(`Estado=Um estado vivo`). Largura 100 %. Enchimento lateral **12**.

> **CORRIGIDO EM 23/09, COM A CINTA NO AR — e a correcção é contra mim.**
> Esta secção dizia ficha **186**, tempo **98** e folga **67**. Eram números
> **orçados**; a régua, lida no DOM com a peça construída, deu **194 e 145**.
> **O tempo estava 47 px optimista:** o selo mede 76 e não 53 (ampulheta 12 +
> 4 + `3 noites` 60) e o `+N` mais o respiro custam outros 20 que ninguém
> somara. *É o mesmo erro do orçamento VERTICAL, cometido no eixo que sobrou —
> e desta vez sem ninguém do outro lado da mesa para o apanhar.*

```
375 úteis − 24 de enchimento = 351
a ficha   : medida no DOM                          = 194
o tempo   : medido, com "3 noites +1"              = 145
folga     : 351 − 194 − 145                        =  12
```

**E o pior caso não cabia.** Na última noite o selo ENCHE e passa de 76 a
**105** (`esta noite` em negrito, 72, mais 16 de enchimento do chip): o tempo
vai a **174**, e 194 + 174 + 24 = **392 num ecrã de 375**. *A cinta
transbordava exactamente na noite em que ela mais importa.*

**Quem cede é a ficha, e a razão é de significado e não de espaço:**

> **O comprimento de um trilho é uma RAZÃO, não uma medida.** Um trilho de
> 40 px diz exactamente o que um de 56 diz, porque o que informa é a fracção
> cheia. Já `esta noite` não encolhe sem mentir.

Daí `CINTA.trilho` (56) e `CINTA.trilhoMinimo` (40), e a catraca do pior caso:

```
2 × enchimento + fichaMinima + tempoMaximo  ≤  375
24             + 170         + 174          =  368     ✓ 7 px
com enchimento 16:                             376     ✗ transborda
```

**O enchimento é 12 e não 16 por esta conta**, e já não pela folga — com 16
a linha não cabe. *A catraca em `testes/teste-r13-pecas.mjs` passou a guardar
o pior caso em vez do típico; a asserção antiga guardava `folgaMinima >= 67`,
que era a minha estimativa promovida a piso. Uma catraca que guarda uma
estimativa não guarda nada: basta a medida chegar para ela ficar vermelha por
ter razão.*

**Superfície e fio.** Fundo `T.panel`. **Fio só em baixo, 1 px, `T.lineStrong`.**
Medido, e é por isto e não por gosto:

| par | medido | veredito |
|---|---|---|
| `panel` × `bg` | **1,08:1** | a cinta **não se separa** do fundo |
| `panel` × `pagina` | **1,33:1** | nem da página |
| `line` × `panel` | 1,53:1 | um fio de `line` não seria fio nenhum |
| **`lineStrong` × `panel`** | **3,84:1** | passa a 1.4.11 (pede 3:1) |

*É também o segundo leitor estrutural de `lineStrong` na tela principal — R1
mediu **um** em toda a tela, o trilho e os treze painéis.*

**Dois alvos, e só dois.**

| alvo | o que leva | largura | abre |
|---|---|---|---|
| **a ficha** | rosto 32 · PV · PM · bolsa | ~186, flexível | a aba `gestao` |
| **o tempo** | a hora · `O selo de prazo` | ~98 | `O painel do tempo` |

Os dois medem **48 de altura** — a banda inteira. Nada mais na cinta se toca.

**A cor faz o corte, e o corte é semântico:** à esquerda são as cores do herói
(`T.amber`, `T.violetSoft`, `T.amberSoft`); à direita é `T.mundo`, e só ali.
*Quem olha sabe qual metade é sua sem ler uma palavra.*

**Os pares, todos medidos sobre `T.panel`:**

| o quê | token | contraste |
|---|---|---|
| o número de PV/PM/bolsa | `T.ink` | **14,71:1** AAA |
| a bolsa, o glifo | `T.amberSoft` | **11,05:1** AAA |
| a hora e o selo calmo | `T.mundo` | **10,09:1** AAA |
| a barra de PV | `T.amber` | **8,02:1** AAA |
| a barra de PM | `T.violetSoft` | **7,78:1** AAA |
| PV grave · a última noite | `T.danger` | **6,37:1** AA |
| o rótulo de máquina | `T.inkDim` | 6,44:1 AA |

**Zero reprovam; nove de dez são AAA.** O pior par é `danger`, a 41 % acima do
piso AA.

**As barras de recurso.** Trilho 56×6, raio 3, `T.panelSoft`; o cheio no token
do recurso. **O comprimento é o canal primário e a cor é o segundo** — e isto
é lei, não observação: `amber` × `danger` mede **1,26:1 em visão normal** e
**1,21:1 em deuteranopia**. Um PV que só mudasse de cor no grave não mudaria de
nada para quem não vê vermelho. Os três canais do PV grave, e os três já
existem — **só nunca tinham sido escritos como razão**:

1. **o comprimento** da barra (≤ 1/3);
2. **o rosto**, que `estadoDe()` põe em *grave* (`src/semente.js`);
3. **`tv-agonia`**, o pulso do bloco.

**A carga, e a régua que a decide.** Do censo dos 20 turnos de R6:

> **Fica sempre na tela o que o jogador usa para decidir *enquanto* decide; o
> que só importa quando muda, chega quando muda e depois recolhe.**

| fica | recolhe para a ficha | muda de casa |
|---|---|---|
| PV · a hora · o prazo mais urgente · **a bolsa** · os estados vivos | `NIV` · `XP` · clima · estação · **PM cheio de quem não usa mana** | `📍 lugar` → `O rosto da cena` |

**`PM` volta sozinho** no instante em que o herói tem magia ou gasta o primeiro
ponto — não é uma preferência, é um estado. **Os estados vivos não recolhem
nunca:** foi o único item da barra que mudou uma decisão em 20 turnos.

**`Estado=Um estado vivo` cresce para 72, e é de propósito.** *O que não cabe
numa linha calma é exactamente o que tem de interromper.* A segunda fila leva
um chip por estado, com o **que ele faz ao dado escrito por palavras** (`− no
dado`), nunca só a cor — a mesma lei do selo.

---

### `O selo de prazo` — conta o que falta, e distingue-se por **forma**

Vive dentro do alvo do tempo. **Nunca mostra o nome do contrato**: era o que
ocupava a linha na fita antiga, e é a parte que o jogador já sabe.

**A medição que mudou o desenho antes de ele existir.** O primeiro esboço tinha
três cores. Medido:

| par | normal | protanopia | deuteranopia | tritanopia |
|---|---|---|---|---|
| calmo × a apertar (`mundo`×`amber`) | **1,26** | 1,51 | **1,12** | **1,27** |
| a apertar × última (`amber`×`danger`) | **1,26** | 1,36 | **1,21** | **1,27** |
| calmo × última (`mundo`×`danger`) | 1,59 | 2,04 | 1,36 | 1,62 |

**O defeito que R9 acusou (`ok`×`amber`) é 1,37:1 em visão normal.** O selo de
três cores seria **pior do que o defeito que esta etapa foi mandada não
herdar.** *Mediu-se antes de construir, e é por isso que não foi construído.*

**Os quatro canais, por ordem de força:**

1. **A areia da ampulheta** desenha a fracção que falta. Geometria pura —
   sobrevive aos três daltonismos, ao cinzento e ao tamanho. **É o canal
   primário**, e nasceu de reparar que o glifo já era um medidor.
2. **A palavra e o número**: `5 noites` · `2 noites` · **`esta noite`**.
3. **A forma**: `Aperto=Esta noite` **enche** — chip `T.danger` com `T.onAccent`
   dentro, raio 4, enchimento 8×4. A área muda de luminância em **6,37:1**, e
   luminância não é cor.
4. **A cor** — e é a **última** leitura, nunca a primeira.

**Por que as outras duas não precisam de um canal forte:** `5 noites` e
`2 noites` não são estados que se distinguem de relance — **são um número que
se lê**. O único que tem de saltar aos olhos é a última noite, e esse enche.

| `Aperto` | areia | palavra | forma | cor |
|---|---|---|---|---|
| **Folgado** (≥3) | cheia (0,85) | `N noites` | texto | `T.mundo` |
| **A apertar** (2–1) | a terço (0,33) | `N noites` | texto | `T.amber` |
| **Esta noite** (0) | um fio (0,08) | `esta noite` | **chip cheio** | `T.onAccent` sobre `T.danger` |

**`Quantos` (Um · Um e mais N):** com mais de um prazo vivo, `+2` em
`T.inkDim` mono 12 à direita do selo. O toque abre-os todos.

**A condição, e sem ela a peça mente pior do que a de hoje:** o motor tem de
saber **quantas noites restam em tempo de calendário**. Hoje o chip conta
noites dormidas, e ficou `1/4` enquanto o calendário andava de 1 para 14 de
Brumal — **treze dias**. Uma peça que conta ao contrário **expõe** esse defeito
em vez de o esconder. Está em `mente/pedidos-ao-sistema.md`.

---

### Os quatro glifos, desenhados — e são 4 dos ~21 que R8 conta

Quadro **12×12**, o mesmo de `IconeGota` e `IconeCheck`. Tinta única, como em
`rosto.jsx`. Saem para `src/ui.jsx`.

| peça | construção |
|---|---|
| `IconeVida` | `M 6 10.6 C 2 7.9 0.7 5.7 0.7 4 C 0.7 2.4 2 1.3 3.4 1.3 C 4.5 1.3 5.5 1.9 6 2.8 C 6.5 1.9 7.5 1.3 8.6 1.3 C 10 1.3 11.3 2.4 11.3 4 C 11.3 5.7 10 7.9 6 10.6 Z` — cheio |
| `IconeMana` | losango `M 6 0.7 L 11.3 6 L 6 11.3 L 0.7 6 Z` a traço 1,1 + miolo `M 6 3.7 L 8.3 6 L 6 8.3 L 3.7 6 Z` cheio |
| `IconeBolsa` | aro `r 5,5` a traço 1,1 + miolo `r 2,2` cheio, ambos em (6,6) |
| `IconeAmpulheta` | `M 2.6 1 L 9.4 1 L 6 6 L 9.4 11 L 2.6 11 L 6 6 Z` a traço 1,05 + **a areia** |

**A areia é uma função, não um desenho.** `h = 5 × max(0,08, min(1, fração))`,
meia-base `0,68 × h`, e o triângulo é
`M 6 11 L (6−meia) 11 L 6 (11−h) L (6+meia) 11 Z`. O piso de 0,08 existe para
que "esta noite" ainda **tenha** areia — um triângulo de altura zero lê-se como
um erro de desenho, não como urgência.

---

### `O sinal de guardado` — 0 px permanentes, e ainda assim se vê

Ele vivia no cabeçalho que morre, e **num jogo cujo save mora só no
`localStorage` é a única coisa na tela que diz ao jogador que a vida dele está
segura**. Duas camadas, para não depender de uma só:

1. **A marca da chapa acende.** O fio de 1 px do pé da cinta passa de
   `T.lineStrong` a `T.ok` e **varre uma vez**, da esquerda para a direita,
   **600 ms**. Zero px, zero deslocamento — *é a própria borda do que guarda o
   seu estado a dizer que o guardou.*
2. **`✓ guardado`**, mono `TIPOS.maquina` em `T.ok`, **na folga**, posicionado
   em absoluto. Não empurra nada e não tapa tinta nenhuma.

**A ESCOLHA, feita com a régua e não com as três hipóteses.** Mediu-se o rótulo
no navegador com a fonte carregada: **`✓ guardado` pede 74 px** e **`guardado`
sozinho pede 58**. A folga a 375 px é **12**. As três saídas propostas eram
*encolher o rótulo*, *o tempo ceder 7 px* ou *o telefone assumir a varredura* —
e **as duas primeiras não eram saídas: o buraco não é de 7 px, é de 62.** Com o
tempo a ceder 7 sobram 19, e nem `guardado` sozinho cabe.

**Fica a terceira, e fica por CONTA e não por limiar afinado:**

```
o rótulo entra quando   folga ≥ rotuloDoGuardado
largura mínima       =  24 + 194 + 145 + 74 − 1  =  436 px
```

`CINTA.larguraParaORotulo`, e a suíte lê a **conta** de volta, não o número —
o dia em que a cinta mudar de repartição é o dia em que a linha fica vermelha,
que é o que se quer. **O respiro não é termo desta conta**, e isso é decisão:
o rótulo **centra-se** na folga, logo os pixels que sobram distribuem-se
sozinhos à medida que o ecrã cresce; pedir respiro ao limiar seria contar duas
vezes o mesmo espaço.

**No telefone é sempre a varredura** — e isso deixa de ser uma degradação
envergonhada para passar a ser o que a peça é lá: *a borda do que guarda o teu
estado a dizer que o guardou.* O rótulo é um ganho de ecrã largo. `prefers-reduced-motion`: sem varredura — o fio fica `T.ok` 1,2 s e
desvanece. E `aria-live="polite"` diz *guardado* a quem não vê nenhuma das duas.

---

### `O rosto da cena` — 96 px, e o motor já existe

**Não nasce um segundo motor.** `hashSemente` + `rng` + `escolher`, de
`src/semente.js` — as três funções puras que `rosto.jsx` já usa e que já se
provam em Node. A semente é
`hashSemente(semente_do_mundo + "|" + bioma + "|" + lugar)`. **Mesma semente,
mesma cripta, em qualquer máquina** — a primeira lei da casa aplicada a uma
imagem.

**Por que é composta e não uma biblioteca de desenhos, e o número obriga:**
são **30 biomas**, não 8. `src/moldes.js` tem quatro moldes — superfície, torre,
mar, estelar — com 7 a 8 cada. *Trinta gravuras não são honestas num ciclo.*

**Três bandas, e a gramática é curta de propósito:**

| banda | px | de que é feita |
|---|---|---|
| **o céu** | 0–62 | gradiente da luz + o astro + hachura que adensa para o horizonte |
| **o horizonte** | ~40–62 | **a silhueta do bioma** — uma massa de tinta, sem meio-tom |
| **o chão** | 62–96 | a cor da luz + hachura diagonal + a linha do chão |

**Sete gramáticas de silhueta** cobrem os 30 biomas: *duna* (deserto, gelo,
costa, planície de sal) · *copa* (floresta, selva, jardim) · *crista* (colina,
montanha, recife) · *coluna* (salão, biblioteca, santuário, oficina) · *vaga*
(mar aberto, enseada, águas fundas) · *véu* (pântano, bruma, nebulosa) ·
*arco* (orbital, estação, cinturão). **Cinco hachuras de chão**: seca ·
molhada · pedra · lajeado · nenhuma (o vazio).

**A hora não muda o desenho: muda a luz.** Quatro receitas × qualquer cena, e
elas entram em `src/estilo.js` como `LUZ_DA_CENA` — *cor é número, logo é
tabela*:

> ### A CORRECÇÃO DE 23/09 — o buril desaparecia à noite
>
> O `aprendiz` mediu a tinta contra o chão de cada luz e trouxe o número sem
> que lho pedissem: **dia 1,57 · entardecer 1,29 · madrugada 1,18 · noite
> 1,08.** A 1,08 a hachura não existe; a 1,32 contra o céu **a própria
> silhueta mal se lê — e a silhueta É a peça.** `Mar Aberto`, `Órbita Alta` e
> `Cinturão` à noite eram rectângulos escuros com uma legenda por baixo.
>
> **E não eram os valores: era a tinta única.** A prova é aritmética:
>
> - a legenda em AAA (`ink` ≥ 7:1) exige um chão com **L ≤ 0,0775**;
> - uma hachura **escura** (≥ 3:1) exige um chão com **L ≥ 0,1108**.
>
> **Não há chão que sirva aos dois.** Com uma tinta escura só, ou a legenda
> perde AAA ou o buril não se vê — e a legenda diz *onde o jogador está*, que
> é a razão de a faixa existir.

### A lei que sai daí, e ela é física antes de ser estética

> **Acima do horizonte o buril escurece; abaixo dele, clareia.**
> O céu é a fonte de luz: marca-se **tirando-lhe** luz (`tinta`).
> O chão é sombra: marca-se **dando-lha** (`talho`).

**Não é invenção nossa.** Na **gravura de linha branca** (Thomas Bewick, *wood
engraving*) o bloco é escuro e o buril **tira** matéria: a marca é a luz que
entra, não a tinta que se põe. É por isso que `tinta` continua **uma** e no
topo da tabela — a massa da silhueta é sempre o bloco por cortar — e `talho`
é **novo e por luz**.

| luz | céu (alto) | céu (horizonte) | chão | **talho** | o astro |
|---|---|---|---|---|---|
| madrugada | `#241F2B` | `#7D6F7D` | `#221C22` | `#988E95` | `T.amberSoft` a 0,55, baixo |
| dia | `#54432F` | `#A4875F` | `#332A1D` | `#AA9C83` | `T.amberSoft` a 0,40, alto |
| entardecer | `#4A3524` | `#C16429` | `#2E2418` | `#B9906A` | `T.danger` a 0,60, baixo |
| noite | `#14131C` | `#576675` | `#161318` | `#7F8C95` | `T.mundoSoft` a 0,50, alto |

**A madrugada passou de castanho a lilás-cinza**, e por medida: em tom quente
ela era indistinguível do entardecer (**1,17:1 de luz e 6° de matiz**). A luz
de antes do sol é fria de verdade; o sol que nasce volta pelo `astro`, que é
um **ponto** e não um campo.

**Os cinco pisos, medidos, e o mais apertado tem 11 % de folga:**

| o que é | piso | madrugada | dia | entardecer | noite |
|---|---|---|---|---|---|
| a silhueta × o céu ao horizonte | 3:1 | 4,10 | 5,79 | 4,78 | **3,32** |
| o talho do chão × o chão | 3:1 | 4,20 | 4,22 | 4,22 | 4,19 |
| a legenda `ink` × o chão | 7:1 | 14,14 | **11,98** | 12,92 | 15,65 |
| a legenda `mundo` × o chão | 4,5:1 | 9,70 | **8,22** | 8,86 | 10,74 |
| a marca da chapa × o `ceuAlto` | 3:1 | 7,92 | **4,78** | 5,82 | 9,32 |

O talho do **céu** fica em 1,86–2,31:1 e **está isento por escrito**: ele não
carrega informação nenhuma — é textura, e a 1.4.11 cobre *gráficos que
transmitem informação*. O piso dele é só ser perceptível (≥ 1,5), e é.

**Duas coisas que a tabela promete além dos pisos, e a suíte pode ler:**

1. **O chão é sempre mais escuro que a página** (L 0,0070–0,0245 contra
   0,0305). É onde moram as palavras da legenda, e *a prosa continua a ser a
   superfície protagonista*. O **céu** pode ser mais claro — é um céu.
2. **As quatro distinguem-se umas das outras**, por luz ≥ 1,2:1 **ou** matiz
   ≥ 25°. Zero pares iguais.

Os pisos vivem em `LUZ_DA_CENA.pisos` para a suíte os ler de volta: *uma
catraca que guarda um número que ela própria não vê não é uma catraca.*

### O que falta para a lei valer na tela — e é do `oficial`, não meu

`src/rosto-da-cena.jsx` lê `LUZ_DA_CENA.tinta` e pinta com ela **as quatro
coisas**: a silhueta, o talho do céu, o talho do chão e a linha do chão. As
duas últimas têm de passar a `talho`. **São três linhas, e não mudam forma
nenhuma — mudam de que número a mesma forma é feita:**

```
const tinta = LUZ_DA_CENA.tinta;          /* o BLOCO: silhueta e talho do céu */
const talho = luz.talho || tinta;         /* o BURIL abaixo do horizonte */

<Talhos linhas={g.d.chao} largura={0.75} opacidade={0.85} tinta={talho} />
<path ... d={g.linhaDoChao} stroke={talho} ... />
```

**A opacidade tem de subir de 0,5 para 0,85, e o número é medido:** o talho
composto sobre o chão dá **2,27:1 a 0,50** (reprova), **3,55 a 0,75** e
**4,19 a 0,85**. O mínimo viável é 0,75; 0,85 é o valor para que a tabela foi
resolvida.

*Enquanto estas três linhas não entrarem, metade da correcção está na tela e
metade não: a silhueta já se lê contra o céu (medido no ar: madrugada passou
de 1,70 para 4,10), e o chão continua uma barra lisa.*

**A legenda** mora na banda do chão: o lugar em Spectral Medium `TIPOS.corpo`
(15) em `T.ink`, e **a hora por palavra** em mono `TIPOS.maquina` em `T.mundo`.
Medida nas quatro luzes — pior par **`ink` × chão de dia = 10,60:1**, AAA com
51 % de folga. `T.mundo` nunca desce de 7,27:1.

**A marca da chapa.** A faixa fecha-se em cima e em baixo com **1 px de
`T.inkMeio`**, e o token não foi escolhido: foi o único que sobreviveu à
medição.

| candidato | × a cinta | × a página | pior dentro da faixa | veredito |
|---|---|---|---|---|
| `paginaFio` | 3,06 | 2,30 | **1,67** | reprova |
| `lineStrong` | 3,84 | 2,89 | **2,10** | reprova |
| a tinta da gravura | 1,13 | 1,50 | **1,08** | reprova |
| **`inkMeio`** | 8,75 | 6,59 | **4,78** | **passa** |

*E é o que um prelo deixa no papel: a marca da chapa.*

**Não anima.** Uma imagem que transiciona a cada cena é **um piscar por turno**,
e *nunca pode custar o turno*. A chegada a um lugar novo marca-se **no nome**,
pelo eixo `Chegada` que `A oferta` já tem — *decai por turno, nunca por
relógio*. **Zero movimento novo nesta etapa.**

**Como se degrada, e nenhum destes casos dá buraco:**

- **bioma desconhecido** → horizonte liso com hachura, que é uma gravura
  legítima e não um erro;
- **`prefers-reduced-motion`** → nada muda, porque nada se move;
- **alto contraste (`forced-colors`)** → a faixa perde as cores por
  especificação e fica a silhueta a traço sobre o fundo do sistema; **a legenda
  continua a dizer o lugar e a hora por palavras**, que é o que ali importa;
- **ecrã estreito** → a silhueta é desenhada em coordenadas de 0 a 100 e
  escalada; a legenda trunca o lugar com reticências e **nunca a hora**.

**A dívida desta peça, declarada:** a hachura do protótipo é **regular, e um
buril não é**. O espaçamento e o ângulo de cada linha têm de sair do mesmo
`rng` — uma gravura com hachura métrica lê-se como *padrão*, não como *talho*.
Está especificado, não está desenhado.

---

### As duas leis que esta etapa acrescenta

**1 · O que está sempre na tela é o que se usa *enquanto* se decide.**
Tudo o resto chega quando muda e depois recolhe. É varrível: uma faixa
permanente cujo conteúdo não mudou numa sessão inteira é mobília.
*Origem: Nielsen Norman Group, «Progressive Disclosure» (Jakob Nielsen, 2006),
<https://www.nngroup.com/articles/progressive-disclosure/> — e o censo dos 20
turnos, que é a metade que nenhuma diretriz podia dar.*

**2 · A tela não escreve o nome do produto.**
Extensão directa de *o sistema não fala de si mesmo*. O jogador sabe em que
jogo está. **73 px, no aparelho mais apertado, era o preço de lho repetir.**

---

### O Figma — a dívida de R1 paga, e o que se achou ao pagá-la

Arquivo `e5wJUzInAssoebx5npssKc`.

**O que se achou, e ninguém tinha reportado: a biblioteca estava a mostrar a
paleta PRÉ-R2.** `bg` era `#0e0c15` quando o código diz `#131120`; `ink` era
`#eae4d6`; `danger` era `#d86a5b` — **dez valores errados** — e **nove tokens
não existiam** (`pagina`, `paginaAlta`, `paginaFio`, `inkMeio`, `mundo`,
`mundoSoft`, `onMundo`, `okFundo`, `perigoFundo`). *A fonte da verdade visual
estava a mostrar as cores que o código abandonou no próprio dia em que R2 as
trocou* — quem abrisse a biblioteca desenhava no passado.

- **Fundações:** 24 variáveis na *Paleta semântica (T)* — 10 corrigidas, 9
  criadas —, todas com `scopes` explícitos e `codeSyntax` WEB igual ao caminho
  JS (`T.mundo`).
- **Uma colecção nova, e ela é a forma certa de `LUZ_DA_CENA`:**
  *Luz da cena*, cinco variáveis (`ceuAlto`, `ceuBaixo`, `chao`, `astro`,
  `tinta`) × **quatro modos** (Madrugada · Dia · Entardecer · Noite). Cada
  variante do rosto **fixa o seu modo** — e é assim que quatro desenhos
  passam a ser **um desenho com quatro luzes**. Em código vive em
  `src/estilo.js` **ao lado de `MATERIAIS`, não dentro de `T`**: não diz o que
  a cor *significa*, diz **que luz há na cena**.
- **`R13 · a cinta`:** `A cinta` (3 estados) e `O selo de prazo` (3 apertos).
- **`R13 · o rosto da cena`:** `O rosto da cena` nas quatro luzes.
- **Auditado por máquina, e o número é o contrato desta mesa:**
  **219 pinturas, 219 ligadas a variável, zero cor literal** — 78 na cinta e
  no selo, 141 no rosto. *A primeira auditoria deu 34,8 % no rosto, e a causa
  foi bem pequena e bem típica: 92 hachuras chamavam-se `Vector` e a ligação
  procurava-as por nome. Passou a casar pela cor.* **Uma catraca que confia no
  nome de uma camada não é uma catraca.**
- **`R13 · o par, antes e depois`:** as duas telas **375×812**, a mesma cena e
  o mesmo save. *A dívida que os dois declararam em R1 fica paga pelos dois no
  mesmo dia* — o `jogo` com o orçamento em faixas, o `desenho` com as caras.

---

## R15 · a soleira aprende a ouvir (`jogo`, 23/09)

*A composição longa, com o censo turno a turno e o método, está em
`mente/r15-mesa.md`. Aqui fica só o que é **lei de forma**.*

**O número que abriu a etapa, e é o censo ao contrário dos 20 turnos de R6:**
em **5 de 20** havia uma oferta legítima por nascer com o motor de hoje (um
deles já pago por R13); em **mais 4** havia oferta legítima que **o motor não
sabe ver**; e em **9** não havia nenhuma, e está certo que não houvesse.
**A soleira acerta hoje em 2 de 20. Com esta etapa, 6. Com o motor, 10.**

### a lei nova: a peneira tem DUAS portas, e uma delas basta

`formas.md` §R1b fixou: *"a soleira é o que você perde se não agir agora — e
mobília não se perde"*. **A régua é boa e continua. Tinha um buraco, e foi R13
que o tapou sem lhe dar nome:** `Montar acampamento` **não perece** — o
acampamento está lá amanhã — e entrou na soleira, e está certo que tenha
entrado.

> **A soleira leva o que FECHA, e leva a saída do que COBRA.**
>
> 1. **Fecha** — a porta some se ele não agir: quem está *nesta* cena, a
>    petição que expira, o que o chão guarda e fica para trás no próximo passo.
> 2. **Cobra** — o estado não some, mas corre um preço enquanto durar: a
>    estrada (uma ração, uma água, uma noite de cada prazo e uma rolagem de
>    encontro por dia), o corpo que pede (desvantagem em todo o dado).
>
> **E continua a valer o segundo teste, o de R1:** se a frase é invenção do
> jogador — atacar, persuadir, procurar, perguntar —, a casa dela é o campo,
> mesmo que passe nas duas portas acima.

**`Esperar` falha as três:** nada fecha, nada cobra, e a ideia é dele. *Saiu em
R13 e não volta.*

**A porta 2 abre-se para exactamente dois estados, os dois nomeados aqui, os
dois com handler no motor, um deles já construído.** Não é uma licença: é uma
lista fechada, e crescer nela é matéria de outra etapa, com outro censo.

### a lei nova: o preço da soleira paga-se em ATENÇÃO, não em pixels

**Medido, jogando o depois de R13:** a página do telefone foi de **151 para
586 px**, e uma oferta custa **83**. A mesma oferta que em R6 tomava **50 %**
de (página + soleira) toma hoje **14 %**.

**O argumento que matou `Esperar` — *custa página demais* — morreu com R13.**
Se a régua fosse feita de pixels, teria de se abrir, e o `jogo` teria de o
dizer.

> **Não se abre. O que defende a soleira nunca foram os pixels: é a taxa de
> acerto.** R6 mediu-a: a soleira ofereceu alguma coisa em **11 dos 20** turnos
> e foi a coisa que o jogador ia mesmo fazer em **2**. **18 %.** A 18 % o
> jogador aprende a não olhar — e uma região em que não se olha não devolve
> 10× coisa nenhuma, por mais barata que seja.
>
> **Pixels devolvem-se encolhendo a peça. Atenção só se devolve acertando.**

**E é isto que mantém o teto de 1 no telefone, com uma razão melhor do que a
de R13:** subir para 2 significa, *por construção*, que o segundo lugar é
ocupado pelo item que o jogador queria **menos**. Não acrescenta um acerto —
**baixa a média e ensina a desconfiar.** *O teto de 1 não é um orçamento de
espaço; é uma promessa de que o que está ali é o melhor que o jogo tinha.*

### a ordem: duas filas, e o desempate decidido antes do cansaço

**Fila A — o que FECHA**, ordenada pelo que fecha mais cedo:
`petição do correio (prazo − dia)` › `quem está em cena e espera` ›
`o papel acabado de pregar` › `o que o chão guarda aqui`.

**Fila B — o que COBRA**, no máximo **uma**:
`Seguir viagem` (jornada aberta) · `Montar acampamento` (o corpo pede).

> **Ganha a fila A. A fila B só ocupa lugar quando a A está vazia.**
> A razão é jogada: *o que cobra está lá no turno seguinte também — a estrada
> não foge, o cansaço não passa sozinho. O que fecha, não.* Perder uma petição
> por ter visto a estrada é perder; ver a estrada um turno depois custa um
> turno.
>
> **Na mesa (2 lugares) a fila B tem o segundo garantido**, porque lá não tira
> nada a ninguém. **Teto: 1 no telefone, 2 na mesa** — não muda.

**Testado contra os casos:** o choque entre as duas filas é **raro por
construção** — na estrada não há mural, nem mercado, nem quem pregue cartazes,
e o correio chega em cidade. **Nos 20 turnos de R6 as duas filas nunca teriam
competido.** A régua existe para o dia em que competirem.

### os quatro verbos que entram, e os três primeiros são surfacing puro

Nenhum pede número novo, tabela nova ou porta nova ao motor.

**1 · `Seguir para {destino}`** — fila B.
Condição: `jornadaRef.current` viva.
Preço: `emTempo(minutosPorAvanco(j))`. Retorno: `progressoDaViagem(j)` —
`faltamMin` / `turnosRestantes`, na gramática de `linhaDaViagem(j)`.
`tom: preco` · `precisaDoNarrador: true` · `aoClicar: viajar(j.para)`.
**A razão, e é uma frase do próprio jogo:** a tela imprime, no primeiro avanço,
`· escreva que segue viagem para avançar` (`App.jsx:20942`). *Um verbo com custo
calculado, determinístico, e com **zero** portas de toque — o jogo a pedir a
senha.* Medido em R6: duas viagens escritas no campo que não moveram o herói
um metro, uma delas a custar seis dias contra um prazo de quatro noites.

**2 · `Pagar o que {nome} pede`** — fila A.
**Corrige uma decisão de R13 que estava errada, e a prova é uma função que já
existe.** R13 escreveu *"oferta cuja pré-condição o sistema já sabe que falha
vira estado, o toque sai"*. `Convidar Vero · tem preço` **não era** uma oferta
que não podia mudar nada: **era a oferta certa com o verbo errado.**
`bancarOConvite(nome)` (`App.jsx:20295`) paga a exigência, confere
`v.exigencia.moedas` contra a bolsa, e vive duas gavetas abaixo.

| `vereditoDoConvite` diz | a soleira oferece |
|---|---|
| `aceita` | `Convidar {nome}` — como hoje |
| `exige` **e há saldo** | **`Pagar o que {nome} pede`**, com o preço e o saldo na cara |
| `exige` **e não há saldo** | **nada** |
| `recusa` | nada — como hoje |

**Defeito vivo, e é a lei de R13 que nunca chegou ao código:** a soleira filtra
`recusa` e **deixa entrar `exige`** (`App.jsx:21612`) — o botão morto de R6
continua lá. *Uma lei sem catraca é uma intenção.*
**E é a cinta de R13 que torna esta oferta legível:** sem a bolsa na tela, o
preço seria outro `tem preço`.

**3 · `Aceitar o que {quem} pede`** — fila A, e a mais perecível do jogo.
`correio.peticoes` nasce com `prazo: dia+3` e **expira sozinha** em
`processarDiaCorreio` (`correio.js:269`). O veredito já está escrito:
`leituraDaPeticao(p)` (`correio.js:196`) devolve `{aceitar, recusar, perigoso}`
**em palavras**, da mesma tabela que `resolverPeticao` aplica. *Há uma função
nesta casa cujo único propósito é cumprir a lei do veredito, e ela fala para
uma aba que só abre se já houver cartas.*

> **Decisão do `jogo`, declarada para o `desenho` poder recusar:** a petição tem
> duas respostas e `A oferta` tem um verbo. **A soleira leva só o `aceitar`.**
> Recusar não é uma oferta — *a soleira é onde o mundo oferece, não um
> formulário com duas caixas* — e **deixar expirar já é recusar**. A recusa
> explícita fica onde sempre esteve, atrás do `▸ Correio`.
> *Se a peça devia ter duas faces, é do `desenho` dizê-lo, e o lado dele entra
> por baixo deste parágrafo.*

**4 · `Convidar` — não é verbo novo, é ALCANCE.**
Em T9 de R6 o convite estava na gramática e **não apareceu**. Vira catraca:
**um NPC que a prosa pôs em cena neste turno e que o sistema conhece tem de
chegar à soleira**; não chegando, é defeito, não desenho.

### o que NÃO entra, e é metade da lei

| não entra | por quê |
|---|---|
| `Esperar` / passar o tempo | nada fecha, nada cobra, e o jogador pensa nisso sozinho. Mora no relógio (R13) |
| **`Ir a <lugar do mapa>`** | **é a tábua da cidade com outra roupa** — em todo turno de toda cidade, e cresce com o mapa. Ver a reversão abaixo |
| comprar / o mercado | R5b: está aberto amanhã |
| a tábua / os cartazes do acervo | R1b: mobília. Só `OFERECIDOS A VOCÊ` sobe |
| trabalhos da casa (guilda) | existem todos os dias enquanto houver casa |
| beber poção fora do combate | não cobra (nada bate fora da luta, e é ação bónus). **E duplicaria `Montar acampamento` para o mesmo estado** — dois botões para "o corpo pede" é a doença |
| forragear | sempre disponível e custa meio dia. Mobília cara |
| subir de nível / gastar pontos | `ModalNivel` já é modal bloqueante — uma segunda porta seria **duas formas para uma ação** |
| cumprir exigência diplomática | a potência não está na cena e o estado não corre relógio |
| **prazo na última noite** | **não há verbo para onde apontar.** A informação já está na cinta e o selo vira `danger`. *Entre a forma que conta e a forma que deixa fazer ganha a segunda — mas aqui não há segunda, e inventá-la seria inventar mecânica* |
| entregar missão · escolher dádiva · portal · caçada · masmorra | **não existem como gesto no motor.** Vão a `pedidos-ao-sistema.md` |

### a reversão: `ir` não entra, e o `jogo` reverte-se a si mesmo

`mente/r6-jogo.md` §5 dizia, como recomendação do próprio `jogo`:
*"a soleira aprende o terceiro verbo, e é `ir`"*. **Retirado, e a peneira é dele
e vota contra ele:** *todo lugar que o mapa conhece* é a definição de mobília —
está lá em todo turno, não perde valor, e a lista cresce a cada cidade
descoberta. **É a tábua da cidade de sapatos novos.**

**E o que faltava em T4 não era um verbo: era uma porta onde o mundo falou.** A
prosa disse *"as salinas ficam ao norte, uns cinquenta minutos a pé"* e a frase
não se tocava. **A forma disso já existe nesta casa e chama-se `▸`**, que R3
transformou de `SPAN` em botão de 48 px.

> **Uma ação, uma forma:** um lugar que a prosa nomeia e o mapa conhece é **uma
> porta na linha em que foi dito**, não um cartão na soleira. *A soleira é onde
> o mundo oferece; o `▸` é onde o mundo abre.*

Falta ao motor que uma linha `▸` possa apontar para um **lugar** e não só para
uma **aba** (`abrirPortaDoSistema` só lê `porta.aba`). Está em
`pedidos-ao-sistema.md`.

### a peça que o `jogo` pede ao `desenho`, e é a dívida mais velha desta fase

**`A oferta` nunca entrou na biblioteca do Figma.** R1 declarou-a como dívida
com motivo; R13 fabricou `A cinta`, `O selo de prazo` e `O rosto da cena`; e a
peça que carrega todo o sistema de decisões continua a existir só em
`ui.jsx:928`. **O `jogo` compôs com ela e não a desenhou, que não é dele.**

Pedido, com os eixos que R1 já fixou (`Tom` × `Estado` × `Chegada`) e **uma
pergunta que é do `desenho` responder:**

> As duas ofertas da **fila B** — `Seguir viagem` e `Montar acampamento` — não
> são um *Convite* nem um *Preço* nem um *Sem volta*. São **a saída de um
> estado que cobra**. O `jogo` não sabe se isso é um **quarto valor de `Tom`**
> ou um **eixo novo**, e não decide: *a peça é dele.*
>
> O que o `jogo` sabe dizer é o momento: **a fila B não é um acontecimento.**
> Ela está lá enquanto o estado durar, e portanto **não pode usar `Chegada =
> Agora`** — uma marca de "isto é novo" que dura cinco turnos deixa de
> significar novo e passa a significar ruído. *A fila A chega; a fila B está.*

### a divergência que o `jogo` abre contra si próprio, para não a descobrir depois

**Quatro verbos novos movem ~4 turnos do campo para a soleira, e o campo cai de
15/20 (75 %) para ~11/20 (55 %).** R13 escreveu que **15 é o número que não pode
cair**. Ele cai, e é o `jogo` quem tem de o dizer.

> **O piso novo é 10 de 20 — metade. E a razão de poder descer de 15 para 10 é
> que os turnos que se movem não eram prosa a ser respondida:** T10 e T19 foram
> frases que o jogo **ignorou** (duas viagens que não moveram o herói um metro)
> e T16 foi um turno **gasto num botão morto**.
> **Mover um turno que falhou não é perder prosa — é parar de mentir.**
>
> Abaixo de 10 o jogo virou *point-and-click*, e a culpa é do `jogo`.

### o campo do turno tem duas formas, e ninguém tinha medido

Medido no DOM hoje: na tela principal o campo é `<textarea>`; **dentro do
combate é `<input>`**. **Uma ação, duas formas** — e não é cosmético: num deles
`Shift+Enter` quebra linha e no outro não há linha para quebrar.
**É do `desenho` fechar a forma e do `oficial` construir.**

### o que R15 mede e não conserta

- **`Praga em o posto da estrada`** — o defeito #10 de R6, visto outra vez hoje.
  A preposição continua por contrair, e continua a aparecer na peça mais nova
  da fase.
- **`Fugir` não existe no tabuleiro.** Jogado hoje: escrever *"recuo depressa
  pela estrada e fujo dos javalis"* deixou a heroína no sítio e deu a rodada aos
  três, que acertaram todos — **18 → 3 PV**. Seis verbos no tabuleiro
  (`Atacar · Mover · Esquivar · Empurrar · Derrubar · Saltar`) e nenhum é
  `Fugir`. → `pedidos-ao-sistema.md`, e é o mais caro dos pedidos.

---

## R15 · a fabricação — o buril, o piso do astro, o esbatimento e as duas peças novas (`desenho`, 23/09)

O `jogo` decidiu **que verbos entram** (`mente/r15-mesa.md`); aqui fica **de que
cada coisa é feita**. Tudo sai de `src/estilo.js` — nenhum literal de cor nasce
nesta etapa, e é isso que faz a mudança desfazer-se num commit.

**O par visual está no Figma** (`e5wJUzInAssoebx5npssKc`): as páginas
*R15 · o ceu talhado a branco* (o antes/depois das quatro luzes, três alfas) e
*R15 · a soleira aprende verbos* (a oferta, a dobra, o esbatimento).

---

### 1 · O céu ganha o seu buril — e a lei do buril estava errada, não o valor

A entrega de R13 declarou a dívida com o número: **o talho do céu mede 1,09 na
noite contra um piso de 1,5.** O `aprendiz` provou que não se conserta por
opacidade (a 1,0, tinta chapada, a noite chega a 1,18) nem mudando onde a
hachura começa (*a travessia é y=8/14/29/40 conforme a luz, e fazer a geometria
depender da luz partia a lei da peça*). **As duas eliminações estavam certas, e
é por isso que a saída não estava lá: o defeito era a lei.**

**A lei de R13 dizia:**

> Acima do horizonte o buril escurece; abaixo dele, clareia.
> *O céu é a fonte de luz: marca-se tirando-lhe luz.*

**E "o céu é a fonte de luz" é verdade DO HORIZONTE, não do céu.** O céu desta
peça é um gradiente, e o alto dele é escuro nas quatro luzes:

```
ceuAlto L:  noite 0,0070 · madrugada 0,0153 · entardecer 0,0413 · dia 0,0610
tinta   L:  0,0036
```

Ao alto da noite, o buril e o campo estão a **1,03:1** um do outro **antes de se
pôr uma gota de alfa**. *Nenhum alfa salva uma diferença que não existe* — que é
exactamente o que a medida do `aprendiz` dizia, lida ao contrário.

**E erguer o céu também não salva, e isto elimina-se com conta:** para `tinta` a
0,45 chegar a 1,5 sobre o topo do céu seria preciso `L(ceuAlto) >= 0,1606`, um
cinzento médio. **A noite deixaria de ser noite para que a textura dela se
visse.**

#### A lei geral, e é mais curta do que a que substitui

> **A MARCA É O CONTRÁRIO DO CAMPO QUE A RECEBE.**
> Campo claro, o buril põe tinta. Campo escuro, o buril tira-a.

O chão é escuro nas quatro luzes: `talho`, sempre. O céu é escuro em cima nas
quatro: **`talhoDoCeu`, sempre.** A silhueta não é marca — é **massa** — e
continua `tinta`, uma, nas quatro luzes. **`tinta` recua para o que esta folha
sempre disse que ela era.**

**E isto não é menos Bewick, é mais.** Na gravura de linha branca o céu é
cortado a branco; **o talho escuro no céu era a parte não-Bewick da nossa própria
receita.**

#### A prova de que é melhor pintura, e não só melhor piso

A hachura adensa para o horizonte (passo 11 px em cima, 3 em baixo) e o gradiente
**clareia** para o horizonte. Com marca escura, as duas puxavam em sentidos
contrários. Medida a profundidade do céu — a razão de luz entre o alto e o
horizonte, já com a cobertura da hachura:

| luz | céu nu | hoje (tinta) | com `talhoDoCeu` | ganho |
|---|---|---|---|---|
| madrugada | 2,64 | 2,16 (**-18 %**) | **3,20** (+21 %) | **+48 %** |
| dia | 2,21 | 1,81 (**-18 %**) | **2,47** (+12 %) | **+36 %** |
| entardecer | 2,23 | 1,82 (**-19 %**) | **2,56** (+15 %) | **+41 %** |
| noite | 2,50 | 2,10 (**-16 %**) | **3,23** (+29 %) | **+54 %** |

**A textura estava a apagar entre 16 % e 19 % da profundidade que o gradiente
declarava.** *Era por isto que o céu se lia chato mesmo onde o piso passava: a
peça lutava contra si mesma, e nenhuma medida de contraste sozinha o diria.*

#### Os valores, e nenhum deles é escolhido

`talhoDoCeu` é o próprio `ceuBaixo` — a cor do horizonte, o ponto mais claro do
campo — **erguido 65 % em direcção ao branco, com um k só para as quatro**. Vive
em `LUZ_DA_CENA.erguerOTalhoDoCeu` para a suíte **refazer a conta** em vez de
comparar hexes: uma tabela que se recalcula não se afina à mão.

| luz | `talhoDoCeu` | a textura ao topo | hoje |
|---|---|---|---|
| madrugada | `#D2CDD2` | **3,04** | 1,20 |
| dia | `#DFD5C7` | **2,43** | 1,59 |
| entardecer | `#E9C9B4` | **2,59** | 1,43 |
| noite | `#C4C9CF` | **3,11** | **1,09** |

**E o alfa sobe de 0,45 para 0,85 — o mesmo dos dois buris**, por razão e não
por afinação: **um corte de buril não é translúcido, é o papel.** Os 0,45 eram
herança do tempo da tinta escura, onde o alfa não fazia diferença nenhuma. Com
marca clara o alfa trabalha. *Um número, dois buris* — e ele sai de
`rosto-da-cena.jsx`, onde estava solto, para `LUZ_DA_CENA.alfaDoTalho`.

**O 0,85 foi escolhido contra o 0,65 no Figma, com os dois desenhados**: a 0,65
o pior ponto é 1,82 e o dia continua lavado; a 0,85 é 2,14 e **a densidade
lê-se como profundidade**, que é o trabalho que a hachura tem.

#### O piso continua 1,5, e o que não regride

**Um piso é uma razão, não um recorde.** A razão não mudou — a textura não
carrega informação. O que mudou é que **passa**: o pior ponto das quatro luzes
vai de **1,09 (27 % abaixo)** para **2,14 (43 % acima)**.

| | antes | depois |
|---|---|---|
| a silhueta x o céu ao horizonte | 3,32 · 4,14 · 4,78 · 5,79 | **4,87 · 5,70 · 6,19 · 7,35** |
| a marca da chapa x o céu ao topo | 8,13 · 4,78 · 5,82 · 9,32 | 6,27 · **3,73** · 4,51 · 7,48 |

**A silhueta melhora nas quatro** — o campo atrás dela ficou mais claro. A marca
da chapa desce e **nenhuma reprova**: o par mais apertado é o dia, a **3,73
contra um piso de 3 (+24 %)**. O talho do chão e a legenda não se tocam.

---

### 2 · O astro ganha piso — e escrevê-lo é recusar escrever um número

O `aprendiz` mediu-o e **recusou-se a pôr asserção**, com a razão certa:
*inventar aqui um número que o `desenho` não escreveu seria a suíte a legislar
sobre a forma.* Os números eram **entardecer 1,42 · dia 2,00 · madrugada 2,17 ·
noite 3,77**.

> **O piso é 3:1, e é o piso que já existe.** Esta tabela tem exactamente UM
> piso para "uma forma que se tem de distinguir" — o 3 de `silhuetaNoCeu`, de
> `talhoNoChao` e de `chapaNoCeu`, que sai da WCAG 1.4.11. **O astro é uma
> forma.** Dar-lhe piso próprio seria a segunda tabela.

**E não é o piso da textura (1,5):** uma textura *pode* dissolver-se em tom — é
para isso que serve. **Um disco que se dissolve não lê como tom, lê como
borrão.**

**O entardecer obrigou a decisão, e é o caso que prova que não era afinação:**
com `T.danger` **nenhum alfa chega a 2,0** — a 1,0, opaco, dá **1,77**. *O sol
do entardecer era mais escuro do que o céu que ele acende.* Varridos os 24
tokens de `T`, **`T.ink` é o único que passa 3:1 nas quatro luzes**, e é o que
devia ser desde o princípio: **o astro é o sítio onde o bloco é cortado até ao
papel**, e `ink` é o papel desta casa.

| luz | hoje | `T.ink` a 0,85 |
|---|---|---|
| madrugada | 2,17 (`amberSoft` 0,55) | **4,04** |
| dia | 2,00 (`amberSoft` 0,40) | **4,88** |
| entardecer | **1,42** (`danger` 0,60) | **3,41** |
| noite | 3,77 (`mundoSoft` 0,50) | **9,43** |

**Três coisas que isto paga de enfiada:**

1. **`astro` e `astroAlfa` sobem ao topo da tabela**, ao lado de `tinta`. Quatro
   cópias do mesmo valor por modo é "a mesma cor escrita quatro vezes" — a
   doença que a própria nota de `LUZ_DA_CENA` nomeia. **A tabela perde 8
   entradas e ganha 2.**
2. **Fecha a excepção que R13 declarou:** *"o astro é o único ponto da faixa
   onde um acento da casa entra na paisagem."* Já não entra — **a paisagem fica
   sem acento nenhum**, e a lei de R1 (*cor viva só em coisa com que se
   interage*) deixa de ter um buraco.
3. **A hora continua a colorir o sol — através do céu, não do token.** A 0,85 o
   campo atravessa 15 % do disco: sobre um céu lilás o astro lê frio; sobre o
   laranja do entardecer, quente. *A hora muda a luz, não o desenho* — aplicada
   um andar mais fundo.

**`astroAlto` fica por luz**, porque esse distingue de verdade. *Posição é luz;
opacidade era afinação.*

#### A dívida deste piso, declarada com o número

Os 3,41 do entardecer são contra o céu **nu** — a mesma régua com que a silhueta
é medida, e **duas réguas para duas formas seria pior do que uma régua
imperfeita**. Contra um céu **já talhado** o entardecer dá **2,56**, porque o
talho claro levanta o campo à volta do disco. Vê-se nos quadros do Figma.

> **O segundo canal do astro não é cor: é ser o único SÓLIDO num campo talhado.**
> Textura sobrevive ao cinzento e aos três daltonismos — a mesma razão pela qual
> a areia da ampulheta é geometria.
>
> **A condição desse canal é que o talho PARE na borda do astro**, e hoje
> corta-lhe por cima. **Isso é forma (`gravura-da-cena.js`), não valor, e não o
> inventei aqui** — vai para quem constrói, como a etapa mandou.

---

### 3 · `O esbatimento` — e a primeira coisa a dizer é o que ele é

O `oficial` declarou a dívida e **não inventou o remédio, porque é forma**: a
primeira linha da prosa corta-se ao rolar sob a gravura. Não é sobreposição
(medido: `sobrepoe: false`) — *só que agora a cabeça é uma imagem, e uma linha
meio engolida por um desenho lê-se pior do que meio engolida por uma borda lisa.*

> **Um esbatimento não é decoração: é uma região declarada ILEGÍVEL.**
> Uma máscara de alfa sobre texto não o adoça — apaga-o por graus. Logo a altura
> dele é o seu custo, e a lei que o rege não é estética:
> **nunca pode esconder uma linha inteira.**

**O número sai de duas medidas e de nenhum gosto:**

1. **0,54** — o alfa em que a prosa deixa de ser AA. `T.ink` sobre `T.pagina`
   mede **11,08:1**; composto a alfa `a`, cai abaixo de 4,5:1 **exactamente em
   `a = 0,54`** (a 0,54 dá 4,41; a 0,56 dá 4,62). Logo a banda ilegível de um
   esbatimento de altura `h` é `0,54 x h`.
2. **27,6 px** — a entrelinha da prosa (`TIPOS.prosa` 17 x 1,625, o
   `leading-relaxed` que a tela já usa), a régua de R13.

**O teto, e a suíte refá-lo:**

```
alfaAA x altura  <  entrelinhaDaProsa / 2
0,54   x   24    =  12,96  <  13,8          OK
```

**24 é o maior inteiro par abaixo do teto de 25,6** — o teto menos o
arredondamento, não um gosto. E há um piso por baixo: **abaixo de ~12 px um
gradiente deixa de se ler como esbatimento e volta a ser uma borda, só que
desfocada — que é o defeito original com mais um passo.**

#### E o número encontrou-se com outro que já lá estava

A região da prosa tem **`py-6` = 24 px** de enchimento no topo, hoje, sem esta
tabela. Com o esbatimento à mesma altura, em `scrollTop = 0` **ele cobre apenas
enchimento**: a primeira linha do primeiro turno nasce à luz inteira, e a peça
custa **zero px de página e zero deslocamento**. *Duas contas independentes que
caem no mesmo número.*

**A construção:** `mask-image` na **própria região que rola**, nunca numa camada
por cima — uma máscara não é um elemento e **não intercepta um único clique**.
*"Nunca pode custar o turno" cumprido por construção, não por cuidado.* Três
batentes escalonados (0 -> 0,35 -> 0,80 -> 1) e não uma rampa linear, pela mesma
razão que a barra de PV é comprimento: a percepção de luminância não é linear, e
uma rampa linear lê-se como um degrau no fim.

**Como se degrada:** `prefers-reduced-motion` — nada muda, **porque nada se
move**: um esbatimento não é animação, é uma borda com espessura.
`forced-colors: active` — **sai inteiro**, porque uma máscara de alfa apaga texto
por graus e ali o sistema não tem como o repor; e nesse modo a cabeça já não é
uma imagem, é um contorno, contra o qual um corte recto lê bem. Sem
`mask-image` — a prosa fica como está hoje, degradação nula.

---

### 4 · `A oferta` ganha o quarto campo — e o teto de campos é lei nova

A `Oferta` de R1 tem três campos porque **três era o que cabia**: a soleira era
55 % do ecrã. Depois de R13 é 14 %, e o orçamento que a apertava deixou de
existir.

**O que isso não autoriza é enchê-la**, e o `jogo` chegou ao mesmo sítio por
outro caminho (`r15-mesa.md` §6.3): *"o preço da soleira não se paga em pixels,
paga-se em atenção — e a atenção tem um tecto mais baixo."* **Espaço que sobra
não é convite; é margem.**

> **O quarto campo entra pela peneira, não por caber.** A peneira é do `jogo`:
> *a soleira é o que o jogador perde se não agir agora.* **Uma peça cuja razão
> de existir é a perda tem de dizer quanto tempo falta**, e a de hoje não diz.

Medido em R6: **a oferta do Yorick esteve viva quatro turnos e a tela nunca
disse que eram quatro.** E o `jogo` trouxe, em §3.3, o verbo cuja propriedade
que o define é o prazo — `Responder a quem escreveu`, que expira em
`processarDiaCorreio`. *Ele escreveu a janela na linha do preço sem me perguntar,
e é onde ela vai.*

**`Tom` x `Estado` x `Chegada` continuam. Entra `Janela`:**

| `Janela` | o que mostra |
|---|---|
| **Nenhuma** | a oferta não expira — **o selo não aparece e não deixa buraco** |
| **Folgado** | `4 turnos` / `5 noites`, areia cheia, `T.mundo` |
| **A apertar** | `2 turnos`, areia a terço, `T.amber` |
| **Agora ou nunca** | **chip cheio** `T.danger`, areia a um fio |

**E a janela não é texto: é `O selo de prazo`, que já existe.** *Uma ação, uma
forma.* A peça ganha um eixo — **`Conta` (Noites · Turnos)** — e **não um
gémeo**: a petição do `jogo` conta noites de calendário, uma oferta de encontro
conta turnos, e **a areia da ampulheta é a mesma geometria nos dois**. O canal
primário continua a ser a areia, que sobrevive ao cinzento e aos três
daltonismos; a cor é a última leitura.

#### O teto de campos é QUATRO, e é lei

`SOLEIRA.camposDaOferta = 4` — verbo · preço · retorno · janela. **O quinto
campo faz a oferta deixar de se ler de relance e passar a ser um formulário**, e
uma soleira de formulários é o *point-and-click* que a medida dos 990 ms existe
para apanhar. É varrível, e por isso é lei e não gosto.

#### O custo, medido no Figma e não orçado

| | px |
|---|---|
| a oferta de hoje | **83-93** |
| a oferta de R15 (três filas) | **108** |
| com o chip cheio de `Agora ou nunca` | **116** |
| **`Janela=Nenhuma`** | **108 — o mesmo** |

> **A janela é GRÁTIS, e é isso que a medida diz:** tirá-la deixa a oferta nos
> mesmos 108 px, porque ela viaja numa linha que já existia — partilha a do
> preço, alinhada à direita. **O que custa os ~20 px é o verbo ser um alvo de
> 48 a sério e o retorno ter a sua linha**, e isso custa **0,72 linhas de prosa
> (~5 palavras)** no telefone.
>
> **Quem cede é o RETORNO**, e ele é o único que pode: o preço é um número que
> não encolhe sem mentir, a janela é uma contagem que não encolhe sem mentir.
> **O retorno é prosa, e prosa trunca** — pelo fim, com reticências.

**E há um número que NÃO é meu e vai ao `jogo`:** com a oferta a 108, a página
do telefone em A+B-com-oferta passa de **407 px (50,1 %)** para **382 px
(47,0 %)** — **abaixo da linha de 50 % que a mesa assinou em R5a.** O orçamento
é dele (`r13-mesa.md` §1: *"o orçamento é lei"*), e **gastá-lo sozinho seria eu
a decidir o que não é meu**. Nos 9 de 20 turnos sem oferta nada muda: a soleira
é 0 px e a página fica nos 586.

#### A pergunta que o `jogo` me fez, respondida — `A oferta` NÃO ganha duas faces

Ele escreveu (§3.3): *"se o `desenho` achar que a peça devia ter duas faces, que
escreva por baixo deste parágrafo e a decisão é dele, que a peça é dele."*

**Não ganha, e a razão de forma é mais forte do que a dele.** Ele disse que a
soleira é onde o mundo oferece, não um formulário com duas caixas. A metade que
falta:

> **Uma oferta com dois verbos deixa de ser uma PORTA e passa a ser uma
> PERGUNTA — e esta casa já tem a peça da pergunta com duas respostas.**
> É `O chamado` (K1/K3), que tem relógio, leque, e **a recusa no primeiro
> degrau**. Se a recusa da petição alguma vez tiver de estar na tela, ela não é
> uma segunda face de `A oferta`: **é `O chamado`, que já existe e já a tem.**

E há a aritmética: duas faces são **dois alvos de 48** (a oferta vai a 156 px,
+48) ou um alvo partido, e um alvo partido **torna ambígua qual é a ação
primária** — numa peça cuja gramática inteira é *um verbo, um preço*.
**Divergência fechada a favor do `jogo`, com a razão do `desenho`.**

---

### 5 · `A dobra` — a forma que R10 deixou por nomear, e é agora que se nomeia

O `aprendiz` precisou dela para o `+N` da soleira, viu que a forma fechada
(*Véu + Fechar*) é para sobreposições, **compôs com peças que já são lei em vez
de inventar**, e escreveu a dívida: *"vai reaparecer — abas, inventário, bolsa
—, e na segunda vez já não é composição, é forma por nomear."*

**Reapareceu.** Com quatro verbos e teto 1 no telefone, o `+N` deixa de ser raro
e passa a ser **o caminho normal**. Então nomeia-se.

**`A dobra` — revelar mais itens na própria lista.** O nome é o da folha de
papel: dobra-se, e o que lá está continua lá.

| eixo | valores |
|---|---|
| `Estado` | **Dobrada** · **Aberta** |

- **48 px** (`ALVOS.piso`), largura da lista, raio 8, `T.panel`.
- **Borda `T.lineStrong` TRACEJADA**, e é de propósito: **é a única peça da
  soleira que não é uma porta do MUNDO — é uma porta da LISTA.** O tracejado
  diz isso sem uma palavra, e não gasta cor nenhuma (a lei de R1: *cor viva só
  em coisa com que se interage* — ela é interagível, mas não é uma oferta, e
  dar-lhe um acento seria pô-la a competir com as ofertas que ela esconde).
- **Diz o número E o substantivo:** `mais 3 ofertas`, **nunca só `+3`**. Aberta,
  diz `dobrar de volta`.
- **`T.ink` no rótulo, `T.inkDim` no glifo.**

#### A lei da dobra, e ela resolve o conflito com o teto

> **O teto protege a página do SISTEMA, não do jogador.**
>
> A soleira nunca passa do teto (1 no telefone, 2 na mesa) **por decisão do
> jogo**. A dobra passa-o **por decisão de quem joga** — e por isso pode.
> *Um teto que o jogador não pode levantar não é um teto: é uma porta trancada.*

- **Fica no pé da soleira, colada ao campo, e abre para baixo — contra o campo.**
  **A prosa não se move um pixel**, que é a lei que R13 §2.7e já fixou para a
  oferta que nasce.
- **Fecha-se no mesmo alvo**, que continua a ser o último da lista: *o polegar
  não volta a procurar.*
- **Não é um véu.** Um véu de tela inteira para mostrar duas ofertas a mais é
  desproporcionado — era exactamente o que o `aprendiz` recusou, e a recusa dele
  fica escrita como a razão desta peça existir.
- **`prefers-reduced-motion`:** aparece e desaparece sem transição. Nunca
  bloqueia, nunca atrasa o `Agir ->`.

**Nasce para todos**, como a lei manda: abas, inventário e bolsa passam a ter
esta forma disponível, e **a próxima vez que alguém precisar de "mostrar mais na
própria lista" já não compõe — instancia.**

---

### 6 · O Figma, e um achado que devia envergonhar-nos

**A biblioteca tinha voltado a derivar, no mesmo dia.** A colecção *Luz da cena*
nasceu em R13 com os valores de antes da correcção do buril: a madrugada estava
**castanha (`#2A2219`)** quando o código já a tinha em **lilás (`#241F2B`)**, o
`ceuBaixo` da noite era `#2E2620` contra `#576675`, **e `talho` não existia de
todo.** **Nove dos doze valores de céu e chão estavam errados**, e ninguém o
reportou — a correcção de 23/09 entrou no código e não no Figma.

*É a mesma doença que esta mesa apanhou em R13 (a biblioteca mostrava a paleta
pré-R2) — e reapareceu **uma etapa depois**, o que prova que corrigir à mão não
é conserto, é adiamento.* **A proposta que sai daqui está na pauta.**

- **`Luz da cena` reparada e ampliada:** 21 valores corrigidos ou criados, mais
  **`talho`** e **`talhoDoCeu`** — 7 variáveis x 4 modos.
- **`R15 · o ceu talhado a branco`:** o par, com a **hachura real** —
  `hashSemente` + `rng` + `talhos` + `hachuraDoCeu` portados byte a byte de
  `src/`, mesma semente dos dois lados, **12 faixas** (hoje · 0,65 · 0,85) nas
  quatro luzes. *O que muda é a tinta, não o desenho, e o par prova-o.*
- **`R15 · a soleira aprende verbos`:** `A oferta` nos três apertos e sem
  janela, `A dobra` nos dois estados, `O esbatimento` antes/depois.
- **E o Figma apanhou um defeito meu:** a fila do verbo saiu a **44 px**, abaixo
  de `ALVOS.piso`. Só se viu ao **medir o quadro construído** — como em R13,
  quando a cinta orçada em 186/98 deu 194/145. *Duas etapas seguidas em que o
  número orçado mentiu e o medido salvou.*
