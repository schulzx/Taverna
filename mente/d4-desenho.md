<!-- ESTE ARQUIVO NÃO É FONTE DE VERDADE (ainda). -->

# D4 · a FORMA — a metade do `desenho`

**A verdade sobre a cara de cada coisa é `mente/formas.md`.** Isto aqui é a
metade da forma do ciclo D4, escrita no mesmo turno em que o `jogo` escreve
o censo do que o jogador toca (`mente/d4-jogo.md`). Quando o `regente` pedir
a consolidação, o que valer daqui migra para `formas.md` — e este arquivo
passa a ser só a prova de que as formas foram **medidas**, e não achadas.

**Todos os `arquivo:linha` deste documento foram conferidos hoje, na árvore
viva** (que tem `App.jsx` modificado em relação a `eadef55`). Onde o número
de D1 ou de D3 não bateu, o número novo está aqui, com a razão.

---

## 1 · O que eu conferi antes de escrever — e o que caiu

D3 já tinha derrubado duas afirmações de D1. Conferi as duas, confirmei-as, e
**achei mais três**. A regra desta seção: nenhuma forma abaixo se apoia em
número que eu não tenha contado eu mesmo.

### O que estava certo (recontado por mim, hoje)

| o que se dizia | o que a contagem de hoje dá |
|---|---|
| 218 `<button>` crus contra 16 `<Botao>` | **218 / 16** — 6,8%, confirmado |
| `:focus-visible` = 0 | **0** ocorrências em `src/**` |
| `outline-none` / `outline:"none"` = 17 | **17** |
| 15 sobreposições (`fixed inset-0`) | **15** |
| `cursor: not-allowed` = 4 | **4**, três no `App.jsx` e uma em `ui.jsx:27` |
| 44 controles desativados, 105 `title` | **44** e **105** |
| `#fff` sobre `T.danger` = 3,42:1 | **3,42:1** (`App.jsx:2541`) |
| 33 dos 36 bloqueados têm `disabled` | confirmado — **o defeito é o silêncio** |
| a grelha **é** clicável | confirmado — `grade-de-batalha.jsx:514-517` |

### O que estava ERRADO (três correções novas, com a linha)

1. **"o interruptor `🎲` não tem estado, só `title`" — errado.**
   `App.jsx:20418` muda **duas** coisas ao ligar: a borda vai de `T.line`
   para `T.amber` e o glifo de `T.inkDim` para `T.amberSoft`. O estado
   existe em duas cores. **O que não existe é uma única letra**: o emoji é o
   mesmo nos dois estados, e as palavras "visíveis"/"ocultas" moram só no
   `title`, que não existe no dedo. O pedido muda: não é *"dê estado ao
   interruptor"*, é *"dê nome ao estado"* — e isso é outra peça (§2.14).

2. **"o `✕` tem 4 tamanhos" (D1) / "5 tamanhos" (`jogo`) — são 6.**
   O glifo aparece em **16 linhas** de `src/**`, em `text-[9px]`,
   `text-[10px]`, `text-[11px]`, `text-xs`, `text-sm` e `text-lg` — **seis**
   —, **5 com borda e 11 sem**. (`App.jsx:1505, 1588, 1840, 2534, 2772,
   2806, 3026, 3338, 20553, 20611, 20621`, `painel-guilda.jsx:131, 339`,
   `painel-heroismo.jsx:68`.)

3. **"13 assinaturas do botão primário" — recontei e são 10; mas o número
   que importa é outro: 37.**
   `background: T.amber` aparece **37 vezes** em `src/**`. Dessas, dez são
   botões, com **10 assinaturas distintas** (3 raios: `lg`/`xl`/`full`;
   6 alturas; 2 famílias tipográficas) — as outras 27 são selos, barras,
   pontos e preenchimentos. **É esse 37 que decide a gramática da escolha**
   (§3.b): o mesmo preenchimento diz "esta é a ação principal" e "esta opção
   está selecionada" em lugares diferentes da mesma tela.

4. **Bônus, e é do meu próprio D3: o `Impedido` da biblioteca é ilegível.**
   A peça do Botão caía a **45% de opacidade no corpo inteiro**. A conta:
   rótulo `inkDim` a 45% sobre âmbar a 45%, tudo sobre `bg`, dá **1,19:1** —
   abaixo de qualquer piso que exista. Dava para ver a olho nu na própria
   folha da biblioteca. **Corrigido hoje no Figma** (§5). A regra que sai
   daí está em §2.19.

5. **"5 desfoques" nos véus — são 4, e 4 sem desfoque nenhum.**
   Os 15 véus usam `blur(3px)`, `(4px)`, `(5px)`, `(6px)` — quatro — e
   **quatro não têm desfoque** (`App.jsx:1836, 21251, 21278, 21308`). As
   tintas de fundo são **9** (D1 acertou esse).

### E um número que ninguém tinha contado

**23 campos de texto** (`<input>`/`<textarea>`) em `src/**`, **19 deles no
`App.jsx`** — incluindo o do turno (`App.jsx:21216`). A ação central do
Taverna é **escrever**, e não existe uma primitiva de campo: são 23 campos
escritos à mão, num projeto onde `outline-none` aparece 17 vezes (15 no
`App.jsx`). É a peça nova mais óbvia da fase inteira, e nenhuma lista — nem
a minha de D1, nem a demanda do `jogo` em D3 — a tinha pedido (§2.1).

---

## 2 · As formas

Uma por família de ação. `quando` é do `jogo` e está escrito aqui **só como
a minha leitura** — onde o censo dele disser outra coisa, a dele vale.

### 2.1 · escrever o que você faz
- **quando** — o tempo todo. É a ação central do modo `historia` e o único
  jeito de o jogador falar com o mundo.
- **forma** — **A linha** (peça nova). Um campo de 72px de altura mínima,
  `panel` com borda `line`, canto 10, prosa em Spectral 15px (não mono: é
  prosa, e a prosa é a protagonista). Quatro estados: **Vazio**
  (marcador d'água em `inkDim`, 6,62:1), **Escrevendo** (borda `amber` +
  o anel de foco), **Esperando** (o campo continua editável — hoje ele
  bloqueia junto), **Impedido** (o campo continua editável; quem está
  impedido é a chamada). A chamada **vem dentro da peça**, à direita,
  carregando a razão.
- **movimento** — nenhum no campo. A borda troca de cor em 120ms; o anel de
  foco **não anima** (quem tabula depressa vê borrão, não foco). Sob
  `prefers-reduced-motion`, idêntico.
- **onde vive** — Figma: página `A linha`, conjunto `A linha` (4 variantes),
  composto com uma instância do `Botao`. · Código: **não existe.** São 23
  campos crus (`App.jsx:21216` é o do turno; os outros 22 estão listados na
  medição).
- **por quê** — o jogo inteiro passa por aqui e não tem peça. Enquanto não
  tiver, cada tela nova inventa o seu campo, e a mais importante de todas —
  a do turno — continua sendo a menor coisa da tela.
- **peso** — **médio** (fabricar a peça). Aplicá-la ao campo do turno é
  **pesado**: é o que o jogador já usa.

### 2.2 · mandar a ação (a chamada)
- **quando** — o fim de todo turno, nos quatro modos.
- **forma** — `Botao`, *Papel=Chamada*, *Tamanho=Normal*, **uma por tela**.
  Mono Bold 16px, canto 8, padding 16/28, `amber` com `onAccent` (8,49:1).
  A razão **nasce acesa**.
- **movimento** — `transform: none`; só a tinta muda, 120ms. Nada de pulsar
  a chamada: o que pulsa o tempo todo deixa de ser chamada.
- **onde vive** — Figma: `Botao` (24 variantes). · Código: `Botao`,
  `ui.jsx:19` — que hoje **não tem onde escrever a razão** e é usado 16
  vezes contra 218 botões crus.
- **por quê** — ver §3.d. Hoje a mesma frase tem três caras e a menor delas
  está no modo default.
- **peso** — **pesado** (§3.d).

### 2.3 · rolar o dado, e receber o veredito
- **quando** — todo teste de atributo. `App.jsx:512`.
- **forma** — **Véu**, *Peso=Pesado*. É a única coisa do jogo que já está
  certa, e a forma dela é a régua das outras: escurece, o d20 treme, **para**,
  e só então o número e o veredito. Fica como está, com uma correção: o fundo
  vira `bg` a 85% (hoje é `rgba(8,6,14,0.88)`, literal) e o desfoque, 4px.
- **movimento** — `tv-dice` (`tvShake .35s` + `tvGlow 1s`, ambos `infinite`)
  **até** a parada; depois, veredito em `tv-fade` 500ms. **O `infinite` tem
  de morrer quando o número sai** — hoje ele para porque o nó desmonta, o
  que é sorte de montagem, não desenho. Sob `prefers-reduced-motion`: sem
  tremor, o número aparece, a pausa **continua existindo** (a pausa é o jogo,
  não é a animação).
- **onde vive** — Figma: `Veu`, *Peso=Pesado*. · Código: `App.jsx:512`, sem
  primitiva.
- **por quê** — *"o único momento da sessão inteira em que senti que estava
  a jogar"* (o `jogo`, D1). O resto do jogo devia invejá-lo, e é isso que a
  escala de cerimônia (§2.21) existe para distribuir.
- **peso** — **leve** (só a tinta sai para tabela).

### 2.4 · refazer a rolagem (o Destino)
- **quando** — depois do número e antes do veredito, quando há Destino ou
  heroísmo.
- **forma** — `Botao` *Papel=Gesto* com **A Consequência** *fixação=Linha*
  presa embaixo: **"o segundo dado vale — mesmo se for pior"**, visível sem
  hover. Hoje essa frase inteira mora em `title` (`App.jsx:583-585`).
- **movimento** — nenhum.
- **onde vive** — Figma: `Botao` + `Consequencia`. · Código: **não existe**
  (a Consequência não tem primitiva; o botão é cru).
- **por quê** — a lei é *o veredito antes do clique*, e aqui o veredito está
  num atributo de rato. O `jogo` clicou sem saber que podia piorar.
- **peso** — **leve**. É tirar uma frase do `title` e pô-la na tela.

### 2.5 · mover para uma casa
- **quando** — todo turno de combate.
- **forma** — **A casa** (peça nova). Quadrado de **48px** (hoje 34),
  canto 3. Sete estados: *Repouso* (só a linha da grelha), *Alcançável*
  (`amber` 10% de fundo + **borda `amber` a 55%**), *Sob o dedo* (fundo 22%,
  borda cheia, **e o custo escrito dentro da casa**), *Confirmando* (fundo
  28%, borda 2px, o custo **e o preço**: "custa um golpe livre"), *Mira*
  (`violet` 16% + borda tracejada), *Impedida* (`line` 30%, sem borda),
  *Foco* (o anel).
- **movimento** — 90ms para entrar em *Sob o dedo* (abaixo de 100ms o toque
  parece instantâneo — NN/g, *Response Times: The 3 Important Limits*,
  Nielsen 1993, a partir de Miller 1968). *Confirmando* não anima: é uma
  pergunta, e pergunta que se move parece resposta. Sob
  `prefers-reduced-motion`: sem transição, os estados trocam a seco.
- **onde vive** — Figma: página `A casa`, conjunto `A casa` (7 variantes,
  props `o custo` e `o preco`). · Código: `grade-de-batalha.jsx:514` — um
  `<rect fill="transparent">`. **A forma não existe.**
- **por quê** — três razões medidas. (1) **O clique já existe e ninguém
  sabe**: `role="button" tabIndex=0` em `:515`, e o `jogo` passou três
  rodadas escrevendo "me aproximo". (2) **No telefone não há veredito
  nenhum**: a rota prevista (`:543`) só aparece em `onMouseEnter`, e a única
  descrição da casa é um `<title>` de SVG (`:520`) — dois canais de rato.
  (3) **O alvo é pequeno**: 34px contra os 44 da HIG da Apple, os 48dp do
  Material e os 44×44 do WCAG 2.5.5 (AAA). 48 é o menor número que passa nas
  três réguas.
  E a borda é o que carrega o recado, não o fundo: âmbar a 55% sobre `bg` dá
  **3,41:1** (passa o WCAG 1.4.11, não-texto); a 45% dá 2,65:1 e **reprova**.
  O fundo, em qualquer alfa entre 10% e 28%, fica entre **1,15:1 e 1,71:1** —
  ele é profundidade, nunca informação.
- **peso** — **médio** para fabricar; **pesado** para trocar o alvo no jogo
  (é o tabuleiro que o jogador já usa, e é a Fase E).

### 2.6 · mirar uma habilidade / escolher o alvo
- **quando** — quando a ação tem alcance.
- **forma** — a mesma peça **A casa**, estado *Mira*. O que muda é a cor
  (violeta, 5,47:1 sobre `bg` na borda cheia) e o tracejado. **Uma ação, uma
  forma**: mirar e mover são o mesmo gesto sobre o mesmo alvo.
- **movimento** — igual a §2.5.
- **onde vive** — Figma: `A casa`, *Estado=Mira*. · Código:
  `grade-de-batalha.jsx:508` (`clicavel = mirando ? tiro : indo`) — a regra
  já é uma só; só a forma é que não.
- **por quê** — o código já tratou os dois como o mesmo alvo. A forma estava
  atrás.
- **peso** — **médio**.

### 2.7 · ver quanto resta, e quanto acabou de sair
- **quando** — sempre no HUD; no golpe, em combate.
- **forma** — **Barra de medida**, agora com **dois eixos**: *Nível*
  (Alta · Baixa) × ***Mudou* (Não · Golpe · Ganho)** — eixo novo de hoje.
  *Golpe*: o pedaço que saiu fica no trilho em `danger` a 60% e o número
  (`−3`) fica escrito ao lado. *Ganho*: o pedaço que entrou chega em âmbar e
  assenta na cor da barra.
- **movimento** — 600ms para o rastro sumir; o número fica um turno. **Sob
  `prefers-reduced-motion` o rastro não anima — aparece e fica.** Nenhuma
  informação mora dentro do movimento: o movimento só diz *quando*.
- **onde vive** — Figma: `Barra de medida` (6 variantes). · Código:
  `BarraMini`, `ui.jsx:516` — **5 usos**, contra 18 barras no jogo e 12
  escritas à mão.
- **por quê** — a barra é o único órgão que reage ao golpe do inimigo e hoje
  ela só desliza em 700ms; dez das dezoito não têm transição nenhuma. E o
  `tv-agonia` fica **reprovado como está**: pulsa vermelho enquanto o herói
  estiver abaixo de ⅓ de vida — pode ser a cena inteira — e é uma das 10
  animações **sem** saída por `prefers-reduced-motion`.
- **peso** — **médio**.

### 2.8 · ler o estado de uma coisa
- **quando** — em toda linha de ficha, cartão, log e cabeçalho (73 lugares,
  9 arquivos, medido pelo `jogo`).
- **forma** — **Selo de estado**, agora com **dois eixos**: *Tom* (Neutro ·
  Bom · Aviso · Perigo) × ***Mudou* (Não · Agora)** — eixo novo de hoje.
  **Ponto + palavra**, sempre: a cor nunca carrega o sentido sozinha
  (WCAG 1.4.1). *Mudou=Agora* é um **halo na própria cor do tom**, na mesma
  gramática do `tvGlow` que a folha já tem.
- **movimento** — o halo pulsa **três vezes e para** (1,2s cada). Nada de
  `infinite`: das 13 classes de animação da casa, **5 são infinitas e só 3
  têm saída**. Sob `prefers-reduced-motion`, o halo não pulsa — fica parado,
  e parado ele já diz a mesma coisa.
- **onde vive** — Figma: `Selo de estado` (8 variantes). · Código: **não
  existe** — são 73 `<span>` inline com quatro gramáticas de preenchimento.
- **por quê** — o `jogo` pediu um **tom** "mudou agora" e um tom era a
  resposta errada: o que mudou agora pode ser bom (o XP subiu), aviso (a
  tocha acaba) ou perigo (a fama caiu). Um quinto tom obrigaria a escolher
  entre dizer **o que é** e dizer **que acabou de mudar**. Por isso "agora"
  virou um **eixo**, não uma cor.
- **peso** — **médio**.

### 2.9 · escolher um entre muitos
- **quando** — criação de personagem, inventário, talentos, alvos, abas —
  ~40 lugares em **6 gramáticas**, quatro delas na mesma criação.
- **forma** — **A escolha** (peça nova). *Forma* (Cartão · Pílula · Aba) ×
  *Estado* (Repouso · Escolhida · Impedida · Foco). A gramática única de
  **escolhido**: borda `amber` 1px **+ filete de 3px no lado de entrada**
  (à esquerda no cartão e na pílula, embaixo na aba) **+ o visto**. O
  `<select>` nativo sai: ele é a única coisa da tela que não é do Taverna.
- **movimento** — 120ms na troca de borda; o filete cresce de 0 a 3px no
  mesmo tempo. Sob `prefers-reduced-motion`, aparece pronto.
- **onde vive** — Figma: página `A escolha`, conjunto `A escolha` (12
  variantes). · Código: `CartaoDeEscolha`, `ui.jsx:389` — **11 usos, todos
  na criação de personagem**. Pílula, aba e stepper: **não existem**.
- **por quê** — **nunca preenchimento âmbar cheio para dizer "selecionado"**.
  `background: T.amber` tem 37 usos e é a assinatura da ação principal;
  usá-lo para seleção faz uma opção parecer a ação da tela. E o visto existe
  porque a cor não pode ser o único canal.
- **peso** — **médio** para fabricar; **pesado** para trocar a criação de
  personagem, que é a primeira meia hora de quem chega.

### 2.10 · abrir e fechar um painel
- **quando** — 15 sobreposições e 11 controles de saída.
- **forma** — **Véu** (3 pesos) + **Fechar** (3 variantes). O `✕` é **da
  saída e de mais nada**. Uma regra de fecho só: `Esc` fecha, o fundo fecha,
  e o `✕` fica sempre no mesmo canto, com **44px de alvo** (o glifo continua
  pequeno; o alvo é que cresce).
- **movimento** — o véu entra com fade de 180ms (hoje `tv-fade` de 500ms —
  meio segundo é longo demais para uma coisa que abre dez vezes por sessão)
  e sai com 120ms. Sob `prefers-reduced-motion`: sem fade, sem deslocamento.
  **`tv-fade` não tem saída hoje.**
- **onde vive** — Figma: `Veu` e `Fechar`. · Código: **não existe** nem um
  nem outro.
- **por quê** — 15 véus, **9 tintas de fundo**, 4 desfoques + 4 sem desfoque,
  4 regras de fecho, 6 tamanhos de `✕`, e `Escape` não fecha nenhuma (há 6
  `onKeyDown` em `src/**`, todos `Enter`). O jogador descobre caso a caso se
  sai clicando fora, num `✕` de 10px ou num botão âmbar de 48px.
- **peso** — **pesado** (é a Fase G1 — muda o que o jogador já aprendeu).

### 2.11 · navegar entre abas
- **quando** — o trilho lateral/inferior, o painel de gestão, a ascensão.
- **forma** — **A escolha**, *Forma=Aba*. O filete de 3px vai **embaixo**, e
  o contador (quando existe) é um **Selo** com *Tom=Neutro*.
- **movimento** — 120ms; o filete desliza de uma aba para a outra em 180ms
  (uma coisa só se movendo, não duas trocando de cor). Sob
  `prefers-reduced-motion`: sem deslize.
- **onde vive** — Figma: `A escolha`, *Forma=Aba*. · Código: **não existe**
  (`App.jsx:1215`, `painel-ascensao.jsx:118`, escritas à mão).
- **por quê** — a aba é uma escolha, não um botão. Hoje ela usa a gramática
  do botão em uns lugares e a da pílula noutros.
- **peso** — **pesado** (o trilho é o esqueleto da navegação).

### 2.12 · o controle que é só um glifo
- **quando** — o cabeçalho do jogo: `⛺` acampar, `🎲` rolagens, `📜`
  crônica, a caneca (início), `⤢` ampliar. **15 botões sem uma letra de
  rótulo, 9 completamente mudos.**
- **forma** — `Botao` *Papel=Gesto*, **variante só-glifo é exceção
  declarada**: ela só existe com **A Consequência** *fixação=Linha* presa,
  ou com o rótulo aparecendo abaixo do glifo em telas largas. O glifo é
  **traçado** (`ui.jsx`), nunca emoji: emoji quebra no Windows e no telefone
  e não herda o token de cor.
- **movimento** — nenhum.
- **onde vive** — Figma: `Botao` + `Consequencia` + `Glifos` (11 ícones).
  · Código: `App.jsx:20404, 20417, 20418, 20419` — emoji cru dentro de
  `<span>`, com `title`.
- **por quê** — `⛺` **terminou uma luta do torneio** sem confirmação e sem
  dizer o que aconteceu ao adversário: a ação mais irreversível da sessão
  atrás do controle mais mudo. `📜` gasta uma chamada ao Mestre. Nenhum dos
  dois diz nada.
- **peso** — **leve** (dar rótulo); **pesado** o que o `⛺` faz (§2.16).

### 2.13 · saber de quem é a vez
- **quando** — todo turno de combate.
- **forma** — **Selo**, *Tom=Aviso*, *Mudou=Agora*, na **linha de quem está
  agindo** e **na barra de ação**, ao mesmo tempo. A marca vive onde se
  olha, não só onde se lê.
- **movimento** — os três pulsos do halo, e para.
- **onde vive** — Figma: `Selo de estado`. · Código: **não existe** como
  peça; o painel `ORDEM DE INICIATIVA` marca `● AGINDO` à mão.
- **por quê** — medido pelo `jogo`: o inimigo ficou `● AGINDO` por mais de
  10 segundos **enquanto o jogo esperava pelo jogador**, e a linha do jogador
  não tinha marca nenhuma.
- **peso** — **médio** (a peça existe; o lugar é montagem do `jogo`).

### 2.14 · ligar e desligar
- **quando** — as rolagens de combate (`App.jsx:20418`), e tudo que vier
  depois.
- **forma** — **O interruptor** (peça nova). Corpo de **44px de altura**,
  trilho de 40×22, a cabeça de um lado ou do outro, **o rótulo do que liga**
  e **o estado escrito** (`a vista` / `ocultas`). Três canais: a palavra
  muda, o lado muda, a cor muda — e nenhum deles carrega o sentido sozinho.
- **movimento** — a cabeça atravessa em 150ms. Sob `prefers-reduced-motion`:
  troca de lado a seco.
- **onde vive** — Figma: página `O interruptor`, conjunto `O interruptor`
  (4 variantes). · Código: **não existe**.
- **por quê** — a correção nº1 da §1: o estado **existe** em duas cores e não
  existe em nenhuma palavra. O alvo de hoje é um `p-1.5` em volta de um emoji
  de 13px — cerca de 25px, contra os 44 da régua.
- **peso** — **médio**.

### 2.15 · o momento que merece um momento
- Ver §2.21 e §3 (a escala de cerimônia continua **aberta** com o `jogo`).

### 2.16 · desfazer o que não volta
- **quando** — 14 ações irreversíveis, **11 sem confirmação nenhuma**.
- **forma** — **O gesto que custa**. *Etapa* (Armado · Perguntando) ×
  *Estado*. Armado **não grita**: contorno, não preenchimento — um vermelho
  cheio o dia inteiro deixa de significar perigo na hora em que importa. O
  Confirmar repete **o verbo**, nunca "Sim". O preço é campo obrigatório.
- **movimento** — a pergunta abre no lugar, 150ms, sem deslocar o que está
  em volta (o que empurra a página faz o dedo errar o alvo).
- **onde vive** — Figma: `Gesto que custa`. · Código: **não existe** — o
  padrão "clica → caixinha vermelha → clica de novo" é remontado à mão três
  vezes, em três larguras.
- **por quê** — `App.jsx:2541` usa `#fff` sobre `T.danger` = **3,42:1,
  reprova AA**, e é **o único botão que apaga um companheiro**.
  `T.onAccent` sobre `danger` dá **5,34:1** e resolve. E `Nova campanha`
  (que substitui o save) é protegida por um rodapé que fica no fim da
  página, longe do botão — o aviso vai **para dentro da peça**.
- **peso** — **leve** (o contraste); **médio** (a peça); **pesado** (pôr
  pergunta nas 11 que hoje não perguntam — muda o fluxo).

### 2.17 · o que o jogo diz que vai acontecer
- **quando** — antes de todo clique que cobra alguma coisa.
- **forma** — **A Consequência**. 4 tons (Impedimento · Espera · Preço ·
  Estado) × 2 fixações (Linha · Balão). **Nunca só-hover**: *Linha* vive
  sempre na árvore; *Balão* abre no dedo **e** no rato.
- **movimento** — o Balão abre em 120ms e não fecha sozinho antes de 4s.
- **onde vive** — Figma: `Consequencia`. · Código: **não existe** — hoje o
  jogo tem **um** lugar para isto e é o `title`, 105 vezes.
- **por quê** — é a lei *o veredito antes do clique* ganhando onde morar.
- **peso** — **médio**.

### 2.18 · o foco (transversal, e é desenho novo)
- **forma** — duas sombras de raio zero: 2px em `bg` abre o vão, 4px em `ink`
  é o anel — `box-shadow: 0 0 0 2px T.bg, 0 0 0 4px T.ink`. **Um anel só,
  em todos os tons** (`ink` sobre `bg` = **15,31:1**).
- **movimento** — **nenhum, nunca.** Foco que anima vira borrão para quem
  tabula depressa.
- **onde vive** — Figma: dentro de cada peça, como *Estado=Foco*. · Código:
  **não existe** — `:focus-visible` tem 0 ocorrências e `outline-none` tem
  17.
- **por quê** — WCAG 2.4.7 (foco visível) e 2.1.1 (teclado). Um jogo que só
  se joga com o dedo exclui quem navega por teclado — e o pior caso é o
  tabuleiro: **256 alvos focáveis por combate com o anel apagado de
  propósito** (`grade-de-batalha.jsx:519`).
- **peso** — **médio**.
- **Armadilha do Figma, achada hoje:** no Figma, `DROP_SHADOW` com spread
  **atravessa** um preenchimento transparente e enche o miolo da peça; o
  `box-shadow` do CSS não pinta por baixo da própria caixa. Então o anel no
  Figma é construído com **dois quadros encaixados** (56 com borda `ink` de
  2px, 52 com borda `bg` de 2px), que dá exatamente o mesmo desenho — e é o
  que está nas peças novas.

### 2.19 · "não pode agora" (transversal)
- **forma** — **dois estados, e o eixo deles mudou hoje.** D3 dizia
  *volta / não volta*. A régua nova é **quem tem de agir**:
  - **Esperando** — *o sistema age.* O corpo fica em `panelSoft` com borda
    `line`, a tinta cheia, e **a razão em âmbar**: "o Mestre está
    escrevendo". O jogador não faz nada e isto volta sozinho.
  - **Impedido** — *você age.* **Sai o preenchimento**, fica a borda `line`,
    e a razão **em cinza diz o que fazer**: "escreva o que você faz",
    "role o dado".
- **movimento** — nenhum. O estado não pisca.
- **onde vive** — Figma: `Botao`, *Estado=Esperando* e *Estado=Impedido*
  (corrigidos hoje). · Código: `ui.jsx:27` — `opacity: 0.4`.
- **por quê** — **a opacidade é o defeito, e tem número.** `inkDim` a 40%
  sobre `panel` dá **2,02:1**; a 45%, **2,25:1**; a 55%, **2,73:1**; a 60%,
  **3,03:1**. O `Botao` inteiro a 40% (`ui.jsx:27`) deixa a chamada em
  **2,38:1**. E a peça de D3, a 45% sobre âmbar, dava **1,19:1**. Nenhum
  desses números é legível. Com a tinta cheia, `inkDim` sobre `bg` dá
  **6,62:1**.
  *A objeção honesta, e a resposta:* o WCAG isenta componentes **inativos**
  do piso de contraste (1.4.3/1.4.11). Mas **a razão não é um componente
  inativo** — é texto informativo, e não tem isenção nenhuma. Por isso a
  regra da casa: **a razão nunca apaga.** O `Agir →` de `App.jsx:21219`
  carrega três razões (`bloqueado = carregando || !!rolagem`,
  `App.jsx:20384`, mais o campo vazio): **uma é Esperando e duas são
  Impedido**, e hoje as três saem no mesmo cinza.
- **peso** — **médio**.

### 2.20 · a espera do Mestre
- **quando** — todo turno, entre o clique e a resposta.
- **forma** — a razão **em âmbar dentro do próprio botão** que a causou.
  Hoje ela vive numa linha separada do log (`App.jsx:20500`: um
  `tv-fade tv-mono text-xs` em `inkDim` com um d20 girando), longe do
  controle que a causou — e o botão, ao lado, apaga-se sem dizer nada.
- **movimento** — o d20 que gira fica, e **ganha saída**: hoje ele é
  `tv-dice` (`tvShake` + `tvGlow`, as duas `infinite`) e é uma das **10 sem
  `prefers-reduced-motion`**. Com menos movimento pedido, o glifo fica
  parado e a palavra continua: a espera é dita por escrito, não por giro.
- **onde vive** — Figma: `Botao` *Estado=Esperando* + `Consequencia`
  *tom=Espera*. · Código: **não existe** ligado ao botão.
- **por quê** — 1 segundo é o limite do *fluxo de pensamento* e 10 segundos
  o da atenção (NN/g, Nielsen 1993). A chamada do Mestre passa de 1s quase
  sempre — então a espera **tem** de ser dita no lugar onde o jogador acabou
  de clicar.
- **peso** — **leve**.

### 2.21 · a cerimônia (o degrau que faltava)
- **quando** — **é do `jogo`.** Eu fabrico o degrau; quais momentos sobem é
  momento, e momento é dele.
- **forma** — **O realce** (peça nova). A **mesma** entrada do log, marcada:
  filete `amber` a 55% acima e abaixo (**3,41:1**), a tinta em `amberSoft`
  (**12,40:1**) em vez de `violetSoft`, e um **Selo** com *Mudou=Agora*.
  Não interrompe, não custa clique, não tem porta — **e é por isso que não é
  um véu.**
- **movimento** — os três pulsos do halo do Selo, e para. O bloco não entra
  animado: ele **já nasce** assim quando a linha chega ao log.
- **onde vive** — Figma: página `O realce`, conjunto `O realce` (2
  variantes: *Nota* e *Realce*). · Código: **não existe** — a *Nota* é
  `App.jsx:2975` (`tv-mono text-xs px-3 py-1.5 rounded-full`, `panelSoft`
  com `violetSoft`), conferida.
- **por quê** — a escala inteira tem quatro degraus e **só os dois de cima
  são véu**: 1 nota · 2 realce · 3 véu leve/pesado · 4 véu sem retorno. Sem o
  degrau 2, "isto foi importante" só tem véu disponível — e a taverna passa
  a interromper o jogador para lhe dar os parabéns. A conclusão da primeira
  missão da campanha é hoje a **quarta de seis pílulas cinzentas iguais**.
- **peso** — **médio** para a peça; **pesado** para a lista de momentos
  (é do `jogo`, e mexe no ritmo do jogo).

---

## 3 · As quatro divergências de significado

Cada uma com **o meu lado**, **a forma única** e **onde eu cedo**. A linha do
"eu cedo" não é diplomacia: é o que faz a divergência fechar em dois turnos
em vez de virar duas implementações.

### a · confirmar e cancelar

**O que há hoje (conferido):** três "cancelar" sem nada em comum —
`App.jsx:1672` (borda `line`, `px-3 py-2`, 10px), `App.jsx:2542` (borda
`line`, `px-2 py-1`, 10px) e `App.jsx:21079` (**sem borda nenhuma**, 12px, só
`color: T.inkDim`). E o confirmar que apaga um companheiro (`App.jsx:2541`)
usa `#fff` sobre `T.danger` = **3,42:1**, contra os `#1A0F0D` (5,48:1) dos
outros destrutivos.

**O meu lado.** O cancelar **não é um botão de tom baixo: é o Recuo**, e
recuar tem forma própria — sem preenchimento, com borda `line`, tinta
`inkDim` (6,21:1 sobre `panel`), **sempre à esquerda do confirmar**. O que
está em `:21079` sem borda nenhuma não parece um botão numa fila de botões, e
isso não é estilo: é um alvo que o olho não acha.

**A forma única.** `Botao` *Papel=Recuo* para o cancelar, em todos os
lugares. Para o confirmar destrutivo, **O gesto que custa**, com
`T.onAccent` sobre `danger` = **5,34:1**. O Confirmar repete o **verbo**
("remover Brann"), nunca "Sim" — porque um "Sim" fora de contexto é a coisa
mais fácil de clicar por engano.

**Se o `jogo` insistir em pôr o confirmar à esquerda** (a convenção de
Windows e de alguns fluxos de jogo), **eu cedo**, porque a ordem dos dois é
convenção de plataforma e não tem número que decida — e porque a ordem
**consistente** vale mais do que qual das duas é. O que eu não cedo é o
`#fff`: 3,42:1 reprova, e reprovação de contraste é bug, não gosto.

### b · fechar um painel

**O que há hoje (conferido):** 15 sobreposições, **9 tintas de fundo**, 4
desfoques + 4 sem, **4 regras de fecho**, `✕` em **6 tamanhos** (5 com borda,
11 sem), `Escape` não fecha nenhuma — e o mesmo `✕` que fecha painel em nove
lugares **expulsa um membro da guilda** em `painel-guilda.jsx:339`.

**O meu lado.** Duas ações não podem ter uma forma, **ainda mais quando uma
é irreversível**. O `✕` é da saída e de mais nada; expulsar usa **O gesto que
custa**. E a saída tem de ser **encontrável sem procurar**: mesmo canto,
mesmo tamanho de alvo (44px), em todas as 15.

**A forma única.** `Fechar`, 3 variantes (discreta · franca · declarada), o
glifo pequeno dentro de um alvo grande, `Esc` fecha, o fundo fecha — exceto
no *Véu sem retorno*, onde **a ausência de porta é desenho** e a peça diz
por escrito que não há.

**Se o `jogo` insistir em manter o clique-no-fundo desligado em alguma
sobreposição específica** (por exemplo a da morte, para o jogador não sair
por acidente), **eu cedo**, porque é momento e momento é dele — desde que a
sobreposição **diga na tela** que não há saída, que é a única coisa que hoje
falta. O que eu não cedo é o `✕` que expulsa: uma ação irreversível não usa
o glifo da porta.

### c · "não pode agora"

**O que há hoje (conferido):** 44 desativados, **31 mudos**, 13 com a razão
só no `title`, 8 valores de opacidade para a mesma ideia, e
`bloqueado = carregando || !!rolagem` (`App.jsx:20384`) governando 15
controles — o `Agir →` (`App.jsx:21219`) carrega **três** razões na mesma
cara.

**O meu lado.** A opacidade tem de sair, e a conta é o argumento: 40% → 2,02:1,
45% → 2,25:1, 60% → 3,03:1, e o `Impedido` da própria biblioteca de D3 dava
**1,19:1**. **O que não pode ser clicado ainda precisa ser lido.** E os dois
estados se separam por **quem tem de agir** (§2.19), não por quanta luz o
botão perdeu.

**A forma única.** `Botao` com *Esperando* (âmbar, o sistema age) e
*Impedido* (cinza, você age, e a razão diz o quê). A razão **nasce acesa**:
para ficar muda, alguém tem de desligá-la de propósito.

**Se o `jogo` insistir que alguns controles devem ficar mudos** — por
exemplo os do cabeçalho, onde uma razão escrita em cada um viraria uma parede
de texto —, **eu cedo para esses**, porque uma tela cheia de explicações é
outra forma de ruído, e ele é quem sabe o que a cena aguenta. O que eu não
cedo é o `Agir →`: é a ação central do jogo, as três razões são distintas, e
ficar mudo ali foi o que fez o `jogo` adivinhar.

### d · a ação principal entre os modos

**O que há hoje (conferido):** `Agir →` é `<Botao primario pequeno>`
(`App.jsx:21219`) — mono 12px, `px-3 py-1.5` (`ui.jsx:22`). No Torneio e na
Noite a mesma ação é uma faixa `tv-display` de 18px ocupando a linha
(`App.jsx:21204`, `:4504`, `:4524`), com **paddings diferentes entre si**
(`py-2.5` contra `py-3`).

**O meu lado.** O `CLAUDE.md` diz que modo é *"lente sobre o mesmo motor,
nunca um segundo jogo"*. Hoje **o modo default absoluto tem a menor chamada
do jogo inteiro** — a ação mais importante do produto é o menor alvo da tela
em que ela vive. Isso não é uma inconsistência estética: é a hierarquia
invertida no lugar de maior tráfego.

**A forma única.** `Botao` *Papel=Chamada, Tamanho=Normal*, **a mesma nos
quatro modos**, dentro da peça **A linha**: 16px, padding 16/28, `amber` com
`onAccent` (8,49:1), a razão presa embaixo. Uma chamada por tela.

**Se o `jogo` insistir que o Duelo e o Torneio precisam da faixa larga**
(porque ali a chamada é cerimônia — "À ARENA" é uma porta, não um turno),
**eu cedo, e com gosto**: a faixa vira uma *variante de largura* da mesma
peça (`cabe no conteúdo` / `ocupa a linha`), não um segundo botão. Cedo na
**largura**; não cedo na **família tipográfica nem no tamanho da letra** —
duas famílias para a mesma ação é o que faz parecer dois jogos, e é o que
`tv-display 18px` contra `tv-mono 12px` faz hoje.

---

## 4 · As seis cosméticas — qual vence, e por quê

1. **As assinaturas do botão âmbar (10 distintas, 37 usos de
   `background: T.amber`)** — vence `Botao` *Chamada*, canto 8, mono Bold,
   **dois** tamanhos. Porque 3 raios × 6 alturas × 2 famílias não é
   vocabulário, é acaso da linha em que o botão nasceu.
2. **Os 15 véus (9 fundos, 4 desfoques + 4 sem)** — vence **o próprio `bg`
   com alfa**: 60% (leve) · 85% (pesado) · 94% (sem retorno), desfoque 4px
   em todos. Porque nove tintas dizem a mesma coisa, saem de fora da tabela,
   e a que muda entre os pesos **não é a opacidade, é se existe porta**.
3. **As 4 gramáticas do veredito antes do clique** — vence **A Consequência**,
   e o `title` deixa de ser uma delas. Porque `title` é um canal de rato:
   105 usos que não existem no dedo.
4. **As 5 formas de dizer erro** — vence **A Consequência** *tom=Impedimento*,
   **presa ao campo que errou**, nunca um vermelho no fim do formulário.
   Porque erro longe do campo faz o jogador procurar, e procurar é o custo
   que a forma existe para não cobrar.
5. **Os dois vermelhos** — vence `T.danger`. Conferido: fora dele o `App.jsx`
   ainda tem `#E8615B` e `#E07070`, e as telas têm `#FF9A85`
   (`grade-de-batalha.jsx`) e `#B4322E` (`painel-mapa`/`planta-cidade`) —
   este último **não é sujeira, é a paleta de pergaminho**, e essa fica, com
   nome próprio (é item da fila). Os três primeiros saem.
6. **Os dois sinais de menos** — vence **`−` (U+2212)**, que é o que o jogo
   já usa para custo (`App.jsx:8296`, `:8419`, `arena.js:258`). E fica dito o
   que eu achei conferindo: **o mesmo caractere é botão em
   `App.jsx:3930`** (o stepper `−`/`+`). Um glifo que ora é número ora é
   controle precisa que o controle seja outra coisa — o stepper vira
   **A escolha** *Forma=Contador*, com os sinais desenhados, não escritos.

---

## 5 · O que entrou no Figma hoje

Arquivo **`Taverna — biblioteca`**, `e5wJUzInAssoebx5npssKc` — **o mesmo**,
ampliado. Nenhum segundo arquivo. Tudo ligado a variável, **zero hex solto**,
e todo quadro que só organiza com `fills = []`.

**Cinco peças novas, uma página cada:**

| peça | página · nó | variantes | por que ela não existia |
|---|---|---|---|
| **A casa** | `A casa` · `18:31` | 7 (*Estado*) | o alvo do tabuleiro é um `<rect fill="transparent">` |
| **A escolha** | `A escolha` · `20:77` | 12 (*Forma × Estado*) | ~40 lugares em 6 gramáticas |
| **O interruptor** | `O interruptor` · `21:31` | 4 (*Valor × Estado*) | o estado tem duas cores e nenhuma palavra |
| **A linha** | `A linha` · `22:46` | 4 (*Estado*) | 23 campos de texto e nenhuma primitiva |
| **O realce** | `O realce` · `25:13` | 2 (*Grau*) | o degrau 2 da cerimônia |

**Dois eixos novos em peças que já existiam:**

- **Selo de estado** — ganhou ***Mudou* (Não · Agora)**: 4 → **8** variantes.
- **Barra de medida** — ganhou ***Mudou* (Não · Golpe · Ganho)**: 2 → **6**.

**Uma correção, e é minha:**

- **Botão** — as **6** variantes *Estado=Impedido* deixaram de cair a 45% de
  opacidade (**1,19:1** na Chamada) e passaram a **sem preenchimento, borda
  `line`, tinta cheia** (**6,62:1**). A descrição do conjunto no Figma
  registra a correção e o motivo, para quem abrir a peça amanhã.

**A composição funcionou, e isso é o que prova que é uma biblioteca e não um
álbum:** `A linha` monta uma **instância** do `Botao` e troca-lhe o estado e
a razão por propriedade; `O realce` monta uma **instância** do `Selo` com
*Mudou=Agora*. Nenhuma peça foi redesenhada por dentro de outra.

### As armadilhas novas (as três custaram tentativa)

1. **`setBoundVariableForPaint` devolve a tinta com `opacity: 1`** — o alfa
   que você passou é descartado em silêncio. Quem quiser âmbar a 22% tem de
   **reaplicar a opacidade depois de ligar a variável**. Na primeira
   tentativa as sete casas saíram em âmbar chapado.
2. **`resize()` trava os dois eixos em `FIXED`** — inclusive os que você
   acabou de pôr em `AUTO`/`HUG`. Foi o que fez o conjunto `A escolha` nascer
   com 80px de altura e as 12 variantes empilhadas umas sobre as outras.
   A ordem é: `resize()` **primeiro**, modos de dimensionamento **depois**.
3. **Uma propriedade de TEXTO tem um valor padrão para o conjunto inteiro** —
   então **nenhum texto que muda por variante pode ser propriedade**. Foi
   isto que fez a folha de D3 mostrar a frase do *Impedido* na variante
   *Esperando*, e foi isto que fez o interruptor dizer "a vista" nos quatro.
   No interruptor eu **apaguei a propriedade** e devolvi a palavra a cada
   variante; a de D3 fica para a consolidação.
4. *(confirmada, de D3)* **`get_metadata` sem `nodeId` mente** — continua
   devolvendo só `Page 1`. As **13 páginas** de hoje só aparecem por nó.

---

## 6 · A proposta ambiciosa — **nenhum número muda em silêncio**

A pergunta do peso pesado é uma só: **o jogador teria de reaprender?**
Aqui a resposta é **não**. Nada muda de lugar, nada muda de nome, nenhum
fluxo muda. O que muda é que **o que hoje acontece calado passa a acontecer
à vista**.

**O diagnóstico, em uma frase:** o Taverna calcula um jogo inteiro e **conta**
o resultado em prosa cinzenta. 225 moedas entraram em dois turnos e o número
só existe dentro do painel Bolsa. O XP subiu e a barra já estava cheia quando
o jogador olhou. A vida caiu e a barra deslizou em 700ms sem dizer quanto. A
primeira missão da campanha foi concluída e virou a quarta de seis pílulas
iguais. **O jogo tem o padrão certo e usa-o uma vez só** — o véu do dado.

**A lei que eu proponho:** *todo valor de estado que muda entre um turno e o
outro veste a marca de "mudou agora", no lugar onde ele vive.* Uma gramática
só, três peças, e duas delas já estão feitas:

1. **O Selo com *Mudou=Agora*** — feito hoje. O halo na cor do próprio tom,
   três pulsos, e para. Serve ao XP, à fama, à relação, à hora, à tocha.
2. **A Barra com *Mudou=Golpe/Ganho*** — feito hoje. O pedaço que saiu fica
   visível em `danger`, o número fica escrito, e a barra de XP **enche** no
   fim da missão em vez de já estar cheia.
3. **O Realce no log** — feito hoje. A linha que importa deixa de ser a
   quarta pílula cinzenta e continua **não custando um clique**.

**O que falta para a lei valer, e é pequeno:** uma primitiva `Numero` que
saiba a diferença entre o valor de agora e o do turno passado. Ela é
**conta**, não tela — cabe num módulo puro, com suíte, e entrega ao App só
`{ valor, delta, mudouAgora }`. É o tipo de órgão que esta casa sabe fazer
de olhos fechados.

**O que isso muda no que o jogador vive:** a diferença entre *ler que você
levou três de dano* e *ver os três saírem da sua barra*. É literalmente a
lei que a pessoa deu à mesa — *"devemos fazer o máximo para ter a experiência
de um jogo e que ele realmente está fazendo coisas — não só lendo e
escrevendo"* — aplicada ao único lugar onde ela cabe sem mexer em fluxo
nenhum: **os números que o jogo já calcula e já mostra, e que hoje mudam sem
que ninguém veja.**

**O preço, dito por escrito:** movimento demais cansa, e esta lei põe
movimento em muitos lugares ao mesmo tempo. Três defesas, todas na forma:
o halo **para depois de três pulsos**; a marca vale **um turno** e some; e
sob `prefers-reduced-motion` **nada pulsa** — a marca fica parada, e parada
ela diz a mesma coisa. Se mesmo assim ficar demais, o corte é do `jogo`:
**quais** números merecem a marca é momento, e momento é dele.

**Uma segunda, menor, que eu proponho junto porque a primeira a torna
barata:** com o Selo existindo como peça, **o cinturão de estado do
cabeçalho** (moedas, XP, tocha, hora) deixa de custar desenho novo — é
montagem. Hoje o jogador não vê o que tem sem ir procurar.

---

## 7 · O que fica por fazer, e de quem é

- **A escala de cerimônia continua ABERTA**, e agora com o degrau 2
  fabricado. O que falta é a lista: **quais momentos sobem de 1 para 2**. É
  do `jogo`, e os dois — o degrau e a lista — nascem juntos ou nenhum
  funciona.
- **O Code Connect continua impossível nesta conta** (`tier: pro`). Com
  **sete** peças novas ou alteradas hoje, são agora **15 peças sem nó**, e o
  que impede a biblioteca de divergir do código em silêncio continua sendo um
  script que alguém tem de lembrar de rodar. Item da pessoa.
- **O defeito cosmético de D3** (a propriedade de texto da razão mostrando a
  frase errada na variante *Esperando*) tem agora diagnóstico e receita —
  §5.3. Fica para a consolidação, para não tocar a peça do Botão duas vezes
  no mesmo turno.
- **`JetBrains Mono` continua sem peso 600 no Figma** (Regular/Medium/Bold).
  As peças novas usam Bold, como as de D3.
