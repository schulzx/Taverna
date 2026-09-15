# E1 · a tela desenhada antes de existir — o lado do desenho

**Fase E, etapa 1.** O `jogo` compõe a tela (página `A batalha` no Figma); este
documento é a **forma**: o casco, a conta de cada medida, o contraste de cada
par, o movimento com saída, o foco, e as peças fabricadas para que a tela dele
tenha de que ser feita.

**Nada de código.** Nenhum `.jsx`, `.js` ou `.mjs` foi tocado. O que se lê aqui
saiu de ler o código e medir, e o que foi construído está no Figma.

---

## 0. Três correções antes de começar — herdar engano é o erro

A pauta que abriu esta etapa carrega três frases que **já não são verdade**, e
duas delas vêm do próprio `formas.md`, corrigidas em D5 e ainda a circular.

1. **`⤢ ampliar` já não mente.** A demanda diz *"promete tela cheia e corta 33%
   do campo (D4 provou)"*. `formas.md` ~1862, escrito em **D5 (15/09)**, derruba
   isso: *"Hoje abre uma sobreposição de tela inteira com o campo 14×14 inteiro,
   legenda explícita e casas clicáveis — o `jogo` andou, de 20 m para 12 m,
   clicando."* Conferido na fonte: `grade-de-batalha.jsx:581` é
   `fixed inset-0 z-50 flex flex-col items-center justify-center p-4`, e o
   tabuleiro ampliado é `min(94vw, (68·largura/altura)vh)`. **O que continua
   quebrado no ampliar é outra coisa: o veredito.** O orçamento de movimento não
   entra na sobreposição, e o preço chega depois, no log.
   *Consequência para E1: a tela de batalha não nasce para consertar o ampliar —
   nasce para tornar o ampliar desnecessário.*

2. **O campo não é 16×16.** É o que `grid.js:168-261` disser. São **dez plantas**:
   12×9, 7×18, 16×16, 18×12, 14×14, 14×14, 16×14, 10×16, 16×16, 18×14. A mais
   larga tem **18 colunas**; a mais alta tem **18 linhas**. Toda conta deste
   documento é feita contra as dez, não contra uma.

3. **A causa dos 429 px está localizada, e é de arquitetura.** `PainelCombate`
   — e portanto o tabuleiro inteiro — é montado **dentro** do rolador da
   narrativa: `App.jsx:20510` fica dentro do `<div ref={areaRef}>` aberto em
   `App.jsx:20459`, **depois de todas as mensagens**. O tabuleiro não está
   "abaixo da dobra" por azar de altura: ele é **filho do log**, e por
   construção fica sempre no fim dele. Nenhum ajuste de altura resolve isto; só
   a inversão resolve. É a base da proposta ambiciosa (§9).

---

## 1. O casco da tela — as regiões, pelo que o jogador faz nelas

Seis regiões. O nome de cada uma é o que o jogador faz ali, nunca o mecanismo.

| região | o que o jogador faz | o que NÃO entra |
|---|---|---|
| **de quem é a vez** | sabe se pode agir agora | o nome do sistema de iniciativa |
| **o campo** | olha, escolhe a casa, anda, mira | tudo o que não é a luta |
| **o veredito** | lê o preço do que está prestes a fazer | histórico, contabilidade |
| **o que você faz** | dispara a ação | Persuadir, Enganar, Procurar, Ajudar, Intimidar |
| **quem está de pé** | sabe quem aguenta e quem cai | fichas completas, bolsa inteira |
| **o que acabou de acontecer** | lê a cena | o log inteiro |

**Ordem de leitura, e ela é a ordem do turno:** *de quem é a vez* → *o campo* →
*o veredito* → *o que você faz*. É a frase que o jogador pensa: «é a minha vez;
onde estou; o que isto custa; eu faço». *Quem está de pé* e *o que acabou de
acontecer* são consulta, e por isso ficam fora dessa linha, não no meio dela.

**A região que quase não entrou, e é lei da casa que entre.** A pessoa pediu
*"uma tela só com o grid e as funções de batalha e utilitários"*, e a leitura
literal disso mata a narração. **A narração não é outra função: é o jogo.** A
prosa é a protagonista — é a primeira frase do `CLAUDE.md` traduzida em
interface. Então *o que acabou de acontecer* fica, **encolhida ao mínimo
honesto**: no monitor, as duas últimas linhas do Mestre, sempre visíveis; no
telefone, **uma** linha, que abre por cima ao toque. Medida que sustenta o
número: Spectral 15 px com `leading-relaxed` (1,625) dá **24,4 px de linha** —
duas linhas mais respiro são **84 px**, uma linha são **28 px**.
*A decisão de quando a tela troca é do `jogo`; esta região ficar na tela é do
`desenho`, e fica registada aqui como decisão, não como pedido.*

**Os verbos que entram, e por que são seis.** `ACOES_PRONTAS` (`App.jsx:1071`)
tem doze, e **cinco não são de luta**: Procurar, Ajudar, Intimidar, Persuadir,
Enganar. Isso é a premissa da pessoa aplicada à letra — *"a maioria das outras
funções ficariam inúteis"*. Ficam **seis** verbos de combate (Atacar, Esquivar,
Empurrar, Derrubar, Correr, Esconder) mais Habilidades e a bolsa à mão. Doze
verbos no telefone pediriam três fileiras de 68 px = **204 px**; seis pedem duas
= **136 px**, e os 68 px que sobram são **uma casa e meia de campo**.

### A grelha responsiva — as mesmas regiões, de 1280×860 a 375×812

A regra da recomposição é uma só: **cada região mantém o mesmo vizinho.** *O que
você faz* é vizinho de baixo do *campo* nas duas plataformas; *quem está de pé*
é vizinho de lado no monitor e vira gaveta no telefone. Região que troca de
vizinho obriga a reaprender, e reaprender é da pessoa.

| região | 1280×860 | 375×812 |
|---|---|---|
| de quem é a vez | faixa no topo, largura inteira | faixa no topo, **só a linha da vez** — a lista abre ao toque |
| o campo | o maior bloco, centrado na casa do herói | idem, e com dois níveis (§2) |
| o veredito | linha de 24 px sob o campo | **a mesma linha**, 24 px |
| o que você faz | fileira sob o campo | grelha 3×2 sob o campo |
| quem está de pé | tira/lateral | **gaveta**, aberta pela faixa da vez |
| o que acabou de acontecer | duas linhas | uma linha, abre por cima |

**O ganho de graça no telefone:** a tela de batalha **não tem trilho de abas**
(Gestão/Diário/Bolsa/Mapa/Códex são exatamente "as funções que ficariam
inúteis"). Isso devolve os **76 px** que `.tv-espaco-abas` reserva
(`estilo.js:245`, `4.75rem`) — **uma casa e meia inteira**, de graça, sem
apertar nada.

---

## 2. A proporção do tabuleiro, resolvida com conta

**O piso não se negocia: a casa mede 48 px.** É a decisão de D4, e o número tem
três origens que concordam — WCAG 2.5.5 (AAA) 44×44, Apple HIG 44 pt, Material
48 dp. 48 é o menor que passa nas três. *Quem encolhe é o campo visível, nunca o
alvo* (condição 1 do `jogo`, D4).

### O que se vê hoje, para haver com que comparar

| | casa | como |
|---|---|---|
| embutido, 16×16 | **23,8 px** | `largura × min(40, 380/altura)` = 380 px de tabuleiro |
| embutido, 14×14 | **27,1 px** | o 27×27 medido em D4 |
| ampliado, 16×16, 1280×860 | **36,6 px** | `min(94vw, 68vh)` = 584,8 px |
| ampliado, 14×14, 1280×720 | **35,0 px** | o 35×35 medido em D4 |

**Nenhum dos quatro chega a 44.** O maior alvo que o jogo oferece hoje para a
decisão espacial do combate é **36,6 px**, e só dentro de uma sobreposição.

### 1280×860 — a conta, e o que ela cobra de quem compõe

O `jogo` compôs `A batalha` em pilha de largura inteira: cabeçalho 48 · faixa da
vez 56 · **o corpo 596** · veredito 24 · verbos 88 · tira do herói 48 = 860. A
soma fecha, e a conta do campo é esta:

- largura: 1280 − 32 de respiro − 22 de régua = **1226 px** → 25,5 casas. **As
  dez plantas cabem na largura** (a mais larga pede 18 × 48 + 22 = 886) e ainda
  sobram 340 px.
- altura: 596 − 22 de régua = **574 px** → **11,95 casas**.

| plantas de `grid.js` | pede (altura) | cabe em 596? |
|---|---|---|
| 12×9 | 454 px | **sim** |
| 18×12 | 598 px | **não — por 2 px** |
| 14×14 ×4 | 694 px | não |
| 16×16 ×2 · 10×16 | 790 px | não |
| 7×18 | 886 px | não |

**1 de 10 cabe inteira.** E o 18×12 falha por **dois pixels** — dois pixels a
mais no corpo, ou dois a menos na régua, compram uma planta inteira. Este é o
número mais barato deste documento e fica escrito para não se perder.

**As duas alternativas, com a conta, porque a decisão de onde ficam as regiões é
do `jogo` e ele merece o número:**

- **Meio caminho — verbos e tira do herói vão para a direita.** O corpo passa de
  596 para **732 px** (596 + 88 + 48). 732 − 22 = 710 → **14,8 casas**. Cabem
  12×9, 18×12 e as quatro de 14 linhas: **6 de 10.**
- **Duas colunas — o campo toma a altura toda, tudo o mais numa lateral de
  344 px.** Coluna do campo: 1248 − 344 − 16 = **888 px** de largura por **828
  px** de altura. Entra 18×48 + 22 = 886 ≤ 888 na largura, e 16×48 + 22 = 790 ≤
  828 na altura. **9 de 10 cabem inteiras**; só a 7×18 (886 px de altura)
  transborda, e transborda **58 px — uma casa e um quinto.**

**A recomendação do `desenho`, e a razão é medida, não gosto:** duas colunas. Em
1280×860 *"mais de metade da tela fica preta"* à direita — o eixo que sobra é o
horizontal, e o eixo que falta é o vertical. Empilhar gasta o eixo escasso para
poupar o abundante. **1 de 10 contra 9 de 10** é a diferença entre um tabuleiro
que rola quase sempre e um que quase nunca rola. *Se o `jogo` tiver razão de
momento para manter a pilha, a razão vale mais que a minha conta e fica escrita
ao lado dela — mas a conta fica.*

### 375×812 — o que cede, com quanta folga, e por quê

Regiões do `jogo` recompostas: 48 + 56 + 24 + 88 + 48 = **264 px de moldura**,
mais 8 de respiro embaixo → campo = **540 px**; com os 76 px devolvidos pelo
trilho de abas ausente, **616 px**. Menos a régua: **594 px → 12,4 casas.**
Largura: 375 − 16 − 22 = **337 px → 7,02 casas.**

**Num campo 16×16 o telefone mostra 7 × 12 = 84 das 256 casas — 33%.**
Num 14×14, 84 de 196 — 43%. É a verdade da aritmética: 16 × 48 = 768, e o
telefone tem 375. **Metade do campo não cabe, e nenhum desenho faz caber.**

**A folga, e por que é esta.** 337 − 7 × 48 = **1 px**. Folga de um pixel é folga
nenhuma, e a tentação é encolher a casa para "fechar certo". **Não se encolhe.**
A folga não é engenhada no recorte: **é engenhada no enquadramento** — o campo
abre **centrado na casa do herói** (condição 2 do `jogo`), e a sobra cai partida
nas duas bordas. Quem diz que há mais campo não é sombra nem gradiente: **é a
régua.** Uma régua que começa em F conta que A–E existem. Esse é o segundo
trabalho do endereço de xadrez, e é o que o torna obrigatório num campo que não
cabe na tela.

### O segundo nível — "ver o campo todo", e ali a casa NÃO é alvo

Com 33% visíveis, um nível de leitura não é luxo: é o único jeito de ver a forma
da luta. **Dois níveis, e a fronteira entre eles é dita por afordância, não por
aviso.**

- **A mesa** (48 px) — o nível de jogo. A casa é alvo. **O custo nasce escrito
  dentro da casa alcançável**, em mono 10 px (decisão de D4). Conta: JetBrains
  Mono anda 0,6 em por caractere → `7,5` são 3 × 6 = **18 px** dentro de 48, com
  15 px de sobra de cada lado.
- **O campo** (cabe na tela) — o nível de leitura. A casa **não é alvo**. No
  telefone um 16×16 cai para (375 − 38)/16 = **21 px**, menos de metade do piso.

**Como o jogador sabe que ali não se toca, sem ninguém lhe dizer:** *no nível de
leitura nada está aceso.* Some o contorno tracejado do alcance, some o custo
dentro da casa, some o realce da régua. **A regra, e ela é a mesma nos dois
níveis: o que é alvo tem o custo escrito dentro; o que não tem nada escrito
dentro não é alvo.** O único gesto que resta é *tocar para voltar à mesa naquela
casa* — um gesto, dito numa linha sob o campo. Um campo apagado não convida a
tocar; um campo aceso convida. A afordância é a mesma que já governa *A casa*
(*Alcançável* × *Impedida*), aplicada a escala em vez de a estado — nenhuma
gramática nova.

**E o custo desaparece sozinho, pela regra que D4 já escreveu:** *"quando o campo
é grande demais para o número caber legível, ele desce para A Consequência
fixação=Linha ao lado do campo"*. Aqui isso ganha número: três caracteres de
mono 10 px mais 4 px de respiro de cada lado pedem **26 px**. Abaixo de 26 px de
lado o número sai — e 26 já está muito abaixo de 44, de modo que **o número sai
sempre antes de a casa deixar de ser alvo**. As duas regras não podem
contradizer-se, e é por isso que os números foram escolhidos nesta ordem.

---

## 3. A régua do endereço de xadrez

### A gramática não é nova, e isso é lei

`src/coordenadas.js:151` já define
`LETRAS_DA_GRADE = "ABCDEFGHIJKLMNOPQRST"`, e `gradeDe()` (`:157`) escreve
`LETRA` + `linha + 1` — **letra na horizontal, número na vertical, número a
começar em 1**. É o endereço que `enderecoDe()` (`:199`) entrega ao Mestre todo
turno no pergaminho. **O tabuleiro usa a mesma tabela.** Uma segunda gramática de
endereço seria uma segunda verdade sobre o mesmo chão — a doença que esta mesa
existe para impedir, um andar acima.

As 20 letras cobrem tudo: a planta mais larga de `grid.js` tem 18 colunas. **Não
nasce tabela nova nesta etapa** — nem para as letras, nem para o sentido.

**O norte continua para cima.** No SVG o `y` cresce para baixo e
`coordenadas.js` já declara que os rumos obedecem a essa convenção; os números da
régua crescem para baixo com ele. Se o mapa apontasse para um lado e o tabuleiro
para o outro, o jogador veria a contradição antes de ver qualquer outra coisa.

**O aviso para o `backend`, em E2:** `H12` no pergaminho e `H12` no tabuleiro são
espaços diferentes. A conversão endereço↔coordenada é **regra, sai de tabela e é
provável em Node** (a própria E2 já diz isso). O que o desenho acrescenta é uma
condição de tela: **os dois endereços nunca aparecem juntos**, porque a tela de
batalha esconde o mundo.

### A tipografia, e ela não contraria a Fase L

**JetBrains Mono Bold**, 12 px no toque / **11 px no ponteiro**. Três razões:

1. **Um endereço é máquina**, e a casa já reserva o mono para o que é máquina.
2. **11 px é piso citado**, não gosto: Apple HIG dá 11 pt como o menor tamanho
   recomendado, e o menor papel de tipo do Material (*labelSmall*) é 11 sp.
   **Não 9 nem 10** — 542 dos 1.107 textos do jogo estão em 9 ou 10 px, e é
   exatamente essa a dívida que a Fase L (L1) existe para pagar. A régua nasce
   já do lado certo da decisão que ainda não foi tomada.
3. **`LETRAS_DA_GRADE` contém I e O**, que em letra proporcional se confundem com
   1 e 0 — e uma régua é feita de letras e números lado a lado. Em JetBrains Mono
   o `I` maiúsculo tem serifa em cima e embaixo e o zero é pontuado: **a própria
   fonte desempata.** Foi o argumento que fechou a escolha do mono, e não a
   preferência estética.
   *Não conferido, e fica dito: se o zero pontuado que o Figma desenha bate com o
   que o navegador desenha.* É primo da diferença que D3 já achou (JetBrains Mono
   não tem peso 600 no Figma — **reconferido hoje e continua verdade**: o Figma
   oferece Thin, ExtraLight, Light, Regular, Medium, Bold e ExtraBold, e nenhum
   SemiBold).

### Onde ela vive, e se cola

**Na calha, fora do SVG, sobre `bg`.** Dentro do tabuleiro ela disputaria com as
fichas e com os nomes de região que já estão escritos no chão
(`grade-de-batalha.jsx:385`), e cairia de 6,62:1 para 6,37:1.

**Cola nas bordas do campo visível, não no tabuleiro.** Quando o campo rola, as
letras ficam na aresta de cima e os números na aresta da esquerda, rolando cada
um só no próprio eixo. É o cabeçalho congelado da planilha, e a razão é dura:
**uma régua que rola para fora é uma régua que se tem de ir buscar**, e ir buscar
é exatamente o custo que o endereço existe para tirar.

### Quando a coluna fica estreita demais para uma letra legível

**Rotula uma a cada N, com N = ⌈30 / lado⌉**, e as outras levam só um traço —
que é o que uma régua de verdade faz.

Os 30 px são conta: a etiqueta mais larga são dois dígitos de mono 11 px =
**13,2 px**, e duas etiquetas não se lêem como duas com menos de ~16 px de vão.
13,2 + 16 = 29,2 → **30**. Na mesa (48 px) N = 1. No nível de leitura mais
apertado que existe — 18 colunas em 375 px, 18,8 px de lado — N = 2.
**A letra nunca precisa de sair.**

### A régua é `aria-hidden`; o endereço vive no nome da casa

Um leitor de tela a ler a régua leria 34 letras e números seguidos sem sentido
nenhum. O endereço mora no **nome acessível de cada casa**, e nesta ordem:

> `H12 · no beco estreito · dá para chegar aqui — custa 4,5 m`

Endereço primeiro (é por ele que o jogador vai falar), nome do lugar a seguir (é
por ele que o Mestre narra), veredito no fim. É o `<title>` de
`grade-de-batalha.jsx:510-511` reescrito com o endereço à frente — **e passa a
ser um nome acessível de verdade, não um balão de rato.**

---

## 4. Os estados e o contraste, medidos

Tudo contra `T` de `src/estilo.js`. Piso de texto: **WCAG 1.4.3 AA = 4,5:1**.
Piso de indicador não-textual: **WCAG 1.4.11 = 3:1**.

### Os pares da tela

| par | medido | piso | veredito |
|---|---|---|---|
| `ink` / `bg` — a prosa, o anel de foco | **15,31:1** | 4,5 | passa |
| `inkDim` / `bg` — a régua em repouso | **6,62:1** | 4,5 | passa |
| `amberSoft` / `bg` — a régua realçada | **12,40:1** | 4,5 | passa |
| `amber` / `bg` — o filete da régua (não-texto) | **9,00:1** | 3 | passa |
| `ink` / `panel` — nome na ficha curta | **14,37:1** | 4,5 | passa |
| `inkDim` / `panel` — endereço, alcance, notas | **6,21:1** | 4,5 | passa |
| `amberSoft` / `panel` — a contagem do tempo | **11,64:1** | 4,5 | passa |
| `danger` / `panel` — selo de ameaça | **5,32:1** | 4,5 | passa |
| `ok` / `panel` — selo de aliado de pé | **9,19:1** | 4,5 | passa |
| `onAccent` / `amber` — número no selo da sua vez | **8,49:1** | 4,5 | passa |
| `onAccent` / `ok` — número no selo do aliado | **9,23:1** | 4,5 | passa |
| `onAccent` / `danger` — número no selo do inimigo | **5,34:1** | 4,5 | passa |
| `ink` sobre casa acesa (`amber` 22% sobre `bg`) | **10,34:1** | 4,5 | passa |
| `inkDim` sobre casa acesa (`amber` 22%) | **4,47:1** | 4,5 | **REPROVA por 0,03** |
| `amberSoft` sobre casa acesa (`amber` 22%) | **8,38:1** | 4,5 | passa |
| moldura da vez: `amber` / `ok` / `danger` sobre `bg` | 9,00 · 9,79 · **5,67:1** | 3 | passam |
| fundo da vez (o tom a 10%) | **1,15 a 1,16:1** | — | profundidade, nunca informação |
| `line` / `bg` — a moldura apagada | **1,38:1** | 3 | **REPROVA — declarado abaixo** |
| `bg` / `#141020` (o fundo do tabuleiro) | **1,04:1** | 3 | **REPROVA — e vira item** |

### Os três buracos, com número, porque buraco calado é mentira

1. **`inkDim` sobre casa acesa dá 4,47:1 e reprova o AA por três centésimos.**
   Aparece se alguém escrever o custo da casa em `inkDim`. **A regra que fecha o
   buraco: dentro da casa acesa a tinta é `amberSoft` (8,38:1) ou `ink`
   (10,34:1) — nunca `inkDim`.** Fica escrito porque é o tipo de troca que um
   olho aprova e uma conta reprova.

2. **A moldura de `Vez=Espera` / `Ja jogou` / `Caiu` é `line` sobre `bg` =
   1,38:1, e reprova 1.4.11.** Fica de propósito: naqueles estados o que
   identifica o estado é **a palavra** (`inkDim`, 6,62:1), e a moldura é só a
   caixa. **Se um dia a moldura passar a ser o único sinal, este número é o
   defeito**, e está aqui para ser encontrado nesse dia.

3. **O fundo do tabuleiro é `#141020`, um literal (`grade-de-batalha.jsx:367`),
   e está a 1,04:1 de `T.bg`.** Duas consequências e uma decisão:
   - é um literal solto que a catraca D5a conta;
   - e **quebra o anel de foco**: o anel é `0 0 0 2px T.bg, 0 0 0 4px T.ink`, e o
     vão de 2 px em `bg` **não se separa** de `#141020` a 1,04:1.
   **Decisão: o fundo do tabuleiro passa a ser `T.bg`.** A diferença é invisível
   a olho nu (1,04:1 é menos que a diferença entre `panel` e `bg`, que é 1,07:1),
   paga um literal e conserta o vão do anel de uma vez. É **item**, e é barato.

### O que a cor nunca carrega sozinha

Todo estado desta tela tem **três canais** (WCAG 1.4.1): *A vez* muda a palavra,
a moldura e o fundo; *A ficha curta* muda a palavra, a moldura e o risco no nome;
*A casa* muda a borda, o fundo e o custo escrito. **Quem não distingue vermelho
de verde lê exatamente a mesma coisa.**

### O que caiu não apaga

Nenhuma opacidade em lugar nenhum desta tela. É a correção de D4 aplicada à
letra: `inkDim` a 45% dá **2,25:1** e a 40% dá **2,00:1**; cheio dá **6,62:1**.
*Caiu* diz-se com tinta cheia, nome riscado, medida a zero e a palavra `caiu` em
`danger`. Quem caiu continua legível, porque continua a contar para a ordem.

---

## 5. O movimento, com saída

**Uma curva só para o que se move** — `cubic-bezier(.2,.7,.3,1)`, que a folha já
usa em `.tv-vira`. **Linear só para o que mede tempo**, porque uma curva de
aceleração numa barra de tempo mente sobre o tempo.

| o que | quanto | curva | sob `prefers-reduced-motion` |
|---|---|---|---|
| entrar / sair da batalha | **140 ms**, só opacidade | `ease` | idêntico ou a seco — termina em `opacity: 1` |
| a casa entra em *Sob o dedo* | **90 ms** | `ease` | troca a seco |
| a régua acende (coluna + linha) | **90 ms** | `ease` | troca a seco |
| o veredito aparece | **120 ms** | `ease` | idêntico |
| a vez passa de uma linha para outra | **200 ms** | `cubic-bezier(.2,.7,.3,1)` | troca a seco |
| o halo do Selo *Mudou=Agora* | 3 × 1,2 s **e para** | `ease` | não pulsa |
| a barra da pergunta que expira | o tempo da janela | **linear** | vira **número que conta** |

**As três leis que governam a tabela:**

1. **A régua acende nos mesmos 90 ms da casa, e isso não é coincidência: é o
   mesmo evento.** Um evento tem uma duração. Dois números para a mesma coisa
   seriam duas verdades.
2. **A tela não anima leiaute.** Só `opacity` e `transform`. Animar leiaute
   durante um turno é, literalmente, *custar o turno* — e o que empurra a página
   faz o dedo errar o alvo.
3. **Nada de `infinite` nesta tela.** Das 13 classes da casa, 5 são infinitas e
   só 3 têm saída (medida de D5c).

**A tela de batalha NÃO usa `.tv-fade`.** `tvFade` dura 500 ms **e move**
(`translateY(8px)`, `estilo.js:129`). Numa tela que abre dezenas de vezes por
campanha, 500 ms está três vezes acima do limite de 0,1 s em que um gesto ainda
parece instantâneo (NN/g, *Response Times: The 3 Important Limits*, Nielsen 1993,
a partir de Miller 1968), e o deslocamento faz o campo *nascer* em vez de *já
estar lá*. **O que entra é a moldura; o tabuleiro já está lá.**

**As classes novas, e cada uma nasce com a saída escrita** — é a catraca D5c, que
morde por igualdade de conjuntos, e cada uma pousa no estado **final**:

| classe | o que faz | a saída, e por que pousa certo |
|---|---|---|
| `tv-batalha-entra` | opacidade 0 → 1 em 140 ms | `animation: none` — termina em `opacity: 1` ✔ |
| `tv-regua-acende` | a tinta da etiqueta em 90 ms | `animation: none` — termina acesa ✔ |
| `tv-vez-passa` | a linha da vez em 200 ms | `animation: none` — termina no estado novo ✔ |
| `tv-janela-tempo` | o trilho desce, linear | **a saída NÃO é `none`**: a barra vira contagem. A informação mora dentro do movimento, e `none` apagá-la-ia. É a variante *Tempo=Contagem* da peça. |

A última linha é a regra de D5 aplicada antes de doer: *a saída pousa no estado
final, e onde é a própria animação que carrega a informação, a saída não pode ser
`none`.*

---

## 6. O anel de foco, aplicado

**A forma não muda** — `box-shadow: 0 0 0 2px T.bg, 0 0 0 4px T.ink`, um anel só
em todos os tons, `ink` sobre `bg` = **15,31:1**. O que E1 acrescenta é **como
ele se comporta sobre 256 casas**.

### A grelha é UM ponto de tabulação, não 256

Hoje cada casa alcançável é `role="button" tabIndex=0` com `outline: none`
(`grade-de-batalha.jsx:515-519`) — **86 alvos focáveis por luta, com o anel
apagado de propósito**. Tabular por dentro de um tabuleiro é um padrão resolvido,
e o padrão tem nome: **o `grid` do WAI-ARIA Authoring Practices**, com *roving
tabindex*.

- **uma casa tem `tabIndex=0`, todas as outras `-1`.** Tab entra no campo uma vez
  e sai uma vez.
- **as setas andam casa a casa**; `Enter` / `Espaço` agem; `Esc` sai do campo e
  devolve o foco aos verbos.
- **o foco entra na casa do herói**, sempre — a mesma regra que manda o campo
  abrir centrado nele. Um tabuleiro que rola e abre no lugar errado é pior que um
  que não rola, e um foco que entra no lugar errado é a mesma armadilha com
  teclado.

### A ordem de tabulação é a ordem do DOM, e por isso a ordem do DOM é desenho

Reordenar com `tabindex` positivo é o remendo que WCAG 2.4.3 existe para
recusar. Então a ordem visual e a ordem do DOM são **a mesma**:

> de quem é a vez *(não focável — é leitura)* → **o campo** → o veredito *(não
> focável)* → **os verbos** → **quem está de pé** → a última fala → **sair**

**O primeiro Tab cai no campo**, que é o assunto da tela. **`sair` é o último**,
de propósito: é a porta, e ninguém deve tropeçar nela na primeira tecla.

**E a única exceção, que é boa UX e não é remendo:** quando um verbo com alcance
entra em *Mira*, **o foco salta sozinho para o campo**, na casa do alvo mais
provável. Sem isso o teclado paga dois Tabs por ataque; com isso paga zero. É a
regra de convivência do `jogo` (*nunca as duas línguas ao mesmo tempo*) a
produzir, de graça, o atalho de teclado certo.

### O vão do anel, sobre o campo — dito com número

Sobre o tabuleiro de hoje (`#141020`) o vão de 2 px em `bg` dá **1,04:1** e não
se separa; o anel de `ink` continua a dar **14,73:1** e carrega o trabalho
sozinho. **Com o fundo do tabuleiro em `T.bg` (§4, buraco 3) o vão volta a
funcionar como desenhado.** A forma do anel não muda — muda o fundo, que é onde o
defeito estava.

---

## 7. As peças fabricadas

Arquivo **`Taverna — biblioteca`**, `fileKey` `e5wJUzInAssoebx5npssKc`. **Nenhum
segundo arquivo.** Uma página por peça; a página `A batalha` é do `jogo` e não
foi tocada. Todas as cores ligadas a variável, **zero hex solto**, quadro que só
organiza com `fills = []`.

### 7.1 · A régua — página `A regua` · nó **`30:11`**

- **por que não existia:** o campo nunca teve endereço. O pedido da pessoa
  (*"vou até H20"*) não tinha forma nenhuma, e a gramática que o resolve já
  existia em `coordenadas.js:151` sem nunca ter chegado ao tabuleiro.
- **4 variantes:** *Eixo* (Coluna · Linha) × *Estado* (Repouso · Realçada).
- **medidas:** Coluna 48×22, Linha 22×48 — batendo casa a casa com *A casa*.
  Mono Bold 12 px (toque) / 11 px (ponteiro). Filete de 2 px na aresta interna
  quando realçada.
- **variáveis ligadas:** `bg` (fundo), `inkDim` (repouso), `amberSoft`
  (realçada), `amber` (o filete).

### 7.2 · A vez — página `A vez` · nó **`30:163`**

- **por que não existia:** é remontada à mão em `App.jsx:3206-3220`, com
  `rgba(232,163,61,0.10)` e um `boxShadow` literais no meio do JSX, e repete-se 4
  a 8 vezes por luta em **dois** lugares (a faixa do alto e a lista). Repetição
  com literal dentro é a definição do que uma peça tira do acaso. E o defeito que
  o `jogo` mediu: *o inimigo ficou `● AGINDO` por mais de dez segundos enquanto o
  jogo esperava pelo jogador, e a linha do jogador não tinha marca nenhuma.*
- **12 variantes:** *Lado* (Voce · Aliado · Inimigo) × *Vez* (Agora · Espera ·
  Ja jogou · Caiu).
- **48 px de altura** — a linha **abre a ficha curta** ao toque, logo é alvo.
- **a decisão de tom:** *Agora* acende no tom do lado — `amber` para você (o
  *Bom* que D4 fechou: *"é a coisa boa da rodada, é o convite"*), `ok` para o
  aliado, `danger` para o inimigo. **O inimigo a agir É o perigo**, e vestir isso
  de perigo não é erro: é a verdade da rodada. A palavra desempata — `sua vez`
  para você, `agindo` para os outros.
- **variáveis ligadas:** `amber` · `ok` · `danger` (fundo a 10% e moldura),
  `amberSoft` (a palavra acesa), `line` (moldura apagada e trilho), `panelSoft`
  (selo apagado), `ink` · `inkDim` (nome e palavra), `onAccent` (número no selo
  aceso), `panel` (a folha).

### 7.3 · A ficha curta — página `A ficha curta` · nó **`31:137`**

- **por que não existia:** o que se sabe de um inimigo mora num `<title>` de SVG
  (`grade-de-batalha.jsx:510-511`) — **canal de rato, que no telefone não
  existe**. Os aliados têm cartões (`App.jsx:3160-3196`); os inimigos não têm
  nada. A peça **não inventa informação nenhuma**: põe na árvore o que o `<title>`
  já diz.
- **6 variantes:** *Lado* (Voce · Aliado · Inimigo) × *Estado* (De pe · Caido).
- **a primeira linha depois do nome é o endereço** — `K14 · no beco estreito · a
  6 m`: a casa primeiro, porque é por ela que o jogador fala; o nome do lugar a
  seguir, porque é por ele que o Mestre narra. **As duas línguas na mesma linha,
  na ordem em que servem.**
- **compõe, não redesenha:** a medida de vida é uma **instância** de `Barra de
  medida`; os selos seguem a gramática do `Selo de estado` (ponto + palavra).
- **variáveis ligadas:** `panel` (corpo), `amber` · `ok` · `danger` (moldura e
  selos), `ink` · `inkDim` (nome, endereço, alcance), `amberSoft` (selo de
  aviso), `line` (caído), `bg` (a folha).

### 7.4 · A pergunta que expira — página `A pergunta que expira` · nó **`31:518`**

**Esta é uma dívida nomeada, paga — e o motivo de a pagar agora é que a razão de
a adiar expirou.** D4 deixou-a por fabricar de propósito: *"é o coração de uma
proposta `pesado` que espera a pessoa, e peça feita para decisão não tomada é
trabalho inventado."* A pessoa **aprovou em 15/09**
(`pauta-desenho.md:28` — *"a rodada tem três batidas"*, APROVADA, vira a Fase K)
e devolveu a forma à mesa. **A condição da dívida caiu; manter a dívida passou a
ser o erro.** K1 pede-a por nome, e a tela de batalha tem de lhe reservar lugar.

- **4 variantes:** *Etapa* (Chamando · Escolhendo) × *Tempo* (Barra · Contagem).
- **a forma veio ditada pela pessoa** (14/09): *"um botão aparecendo (tipo um de
  rolagem de dados) com uma barra de tempo… se o player apertar, aparecem as
  opções."* Daí os dois degraus de *Etapa*.
- **não é véu e não é *O gesto que custa*.** O véu toma a tela; o gesto que custa
  espera para sempre. Esta espera pouco e vai-se embora. Fica **presa à linha do
  golpe** por um filete de 3 px em `danger` na aresta esquerda — o cordão
  umbilical que diz que ela pertence àquele golpe, não à tela.
- **o eixo *Tempo* é a saída por movimento reduzido, e é variante de propósito.**
  Fazer da saída uma **variante** em vez de uma nota de rodapé é o que impede que
  ela seja esquecida no dia de construir.
- **quem não responde tem o de hoje, byte a byte** — escrito na própria peça, e
  não é decoração: é a trava K2.
- **o tempo nunca aparece em segundos na variante *Barra***: contagem regressiva
  no meio de uma narrativa é o sistema a falar de si mesmo. O número só existe na
  variante em que ele **é** o canal.
- **variáveis ligadas:** `panel` (corpo), `danger` (moldura e filete), `ink` (a
  linha do golpe), `inkDim` (a nota), `line` (trilho), `amber` (o tempo),
  `amberSoft` (a contagem), `bg` (a folha). Compõe **`Botao`** e
  **`Consequencia`**.

### O que eu decidi NÃO fabricar, e vale tanto quanto fabricar

- **O alvo do golpe.** *A casa* `Estado=Mira` + *A Consequência* `tom=Preço,
  fixação=Linha` **bastam**, e a regra que as junta já está escrita
  (`formas.md`: sobre o tabuleiro a Consequência é **sempre** *Linha*, porque
  quatro segundos de balão tapam as casas para onde o jogador ia andar). Uma peça
  nova aqui seria a segunda cara da mesma ação.
- **O leque de verbos.** Não é peça: é **uma fileira de `Botao`** com **um**
  `Papel=Chamada` — e em combate a chamada é o ataque, porque depois de X2 é ele
  que *manda a ação acontecer* — e o resto em `Papel=Gesto`, **cada um com uma
  instância de `A Consequência` `tom=Preço` por baixo** (ver o achado 7.5). O
  arranjo da fileira é composição, e composição é do `jogo`.
- **O casco da batalha.** As regiões são composição, não peça. Um quadro-mestre
  na biblioteca duplicaria o quadro que o `jogo` está a compor em `A batalha` e
  as duas divergiriam na semana seguinte.
- **A régua do mundo.** Já existe e é `coordenadas.js`. A peça 7.1 espelha-a; não
  a substitui.

### 7.5 · Dois achados sobre o `Botao`, medidos ao fabricar

**Achado A — um botão que funciona não tem onde escrever o preço.** O nó
*"a razão"* do conjunto `Botao` existe **apenas** em `Estado=Esperando` e
`Estado=Impedido` — as 12 variantes em que ele **recusa**. Nas 12 de *Repouso* e
*Foco* não há nó nenhum. E `formas.md` apoia-se nessa fenda em três formas
distintas (*gastar um recurso*, *refazer a rolagem*, *o controle que é só um
glifo*), que são todas ações que **funcionam**.

> **A decisão, e é uma discordância do `desenho` com o `desenho`, resolvida por
> escrito:** *"a razão"* do `Botao` é **a razão da RECUSA**, e está certa onde
> está. **O preço de uma ação que funciona é sempre `A Consequência`, instância
> própria, presa ao botão** — nunca uma fenda do botão. As duas verdades podem
> coexistir na mesma tela (*"custa 2 PM"* **e** *"o Mestre está a escrever"*), e
> dobrá-las numa fenda só obrigaria quem monta a escolher qual delas mostrar. É
> assim que *A pergunta que expira* foi montada, e é assim que o leque de verbos
> se monta.

**Achado B — o `Botao` não tem eixo de largura.** `formas.md` diz que *Largura* é
variante (*"cabe no conteúdo"* / *"ocupa a linha"*); no Figma o conjunto tem
`Papel × Estado × Tamanho` e nada mais. Em *A pergunta que expira* os botões
ocupam a linha **por sobreposição na instância**, que é a definição de um eixo em
falta. **Não foi corrigido nesta etapa, de propósito:** acrescentar o eixo leva o
conjunto de 24 para 48 variantes (acima do teto de 30 que a própria disciplina de
biblioteca recomenda), e a alternativa — mexer na estrutura interna das 24 —
mudaria calado toda composição que já as usa, incluindo *A linha*. **É item, com
o número, e é do `desenho`.** Pesa porque a condição 2 de *A linha* (*"no
telefone a chamada ocupa a largura"*) depende dele.

**Achado C, menor e para não virar folclore:** os componentes de D3/D4 carregam
na raiz um preenchimento **branco invisível** (`visible: false`, sem variável) —
o branco que `figma.createAutoLayout()` dá de nascença, desligado em vez de
removido. Amostrados 3 de 3 (`Barra de medida`, `Botao`, `Consequencia`): todos o
têm. Não pinta nada hoje; pinta branco no dia em que alguém ligar a visibilidade,
e qualquer varredura de *zero hex solto* vai encontrá-lo. A regra de D4 continua
certa e é só aplicá-la: **quadro que só organiza leva `fills = []`**, não
`fills = [branco desligado]`. As quatro peças novas nascem sem ele.

---

## 8. O que esta etapa deixa para as seguintes

- **para E2 (`backend`):** a conversão endereço↔coordenada sai de
  `LETRAS_DA_GRADE` e **não nasce dentro da tela**. Condição do desenho: os
  endereços do mundo e do tabuleiro **nunca aparecem na mesma tela**.
- **para E3 (`frontend`):** o tabuleiro tem de **sair de dentro do rolador do
  log** (`App.jsx:20510` dentro de `:20459`). Enquanto for filho do log, ele abre
  no fim do log, e nenhuma medida deste documento se cumpre.
- **para E4:** o custo escrito **dentro** da casa alcançável — é o canal que
  substitui o `onMouseEnter` de `grade-de-batalha.jsx:543`, que no dedo não
  existe.
- **para a Fase K:** a peça existe (7.4). O que falta é o momento, e é do `jogo`.
- **item do `desenho`:** o eixo *Largura* do `Botao` (achado B).
- **item barato, e paga duas coisas:** o fundo do tabuleiro `#141020` → `T.bg`.

---

## 9. Para a pessoa decidir — a proposta ambiciosa

### O campo de texto deixa de ser o caminho da AÇÃO e passa a ser o caminho da FALA

**O que o jogador vive hoje.** Para atacar, ele abre `Ações`, toca `Atacar`, e o
botão **escreve `"Ataco "` na caixa de texto** (`App.jsx:20564`,
`setEntrada(a.texto)`). Ele completa a frase, carrega em `Agir →`, e **uma
chamada ao Mestre** é gasta para que uma IA leia "Ataco o ogro" e descubra o que
o motor já sabia. **Dos 20 botões do painel `Ações`, 12 só digitam**
(`ACOES_PRONTAS`, `App.jsx:1071-1084`); os 8 que entram no motor
(`ACOES_RAPIDAS`) não são de combate.

**A proposta.** Na tela de batalha, **toda ação mecânica acontece por toque** —
verbo + casa, com o preço antes do clique — e **o Mestre narra o resultado, uma
vez por rodada**. O campo de texto continua na tela e muda de emprego: já não é
*"O que você faz?"*, é **"diga alguma coisa"** — a provocação, a parlamentação, a
frase que o jogador quer que fique na crónica. Uma rodada passa de *N chamadas ao
Mestre* para *uma*.

**Comprovado, pelos três caminhos:**

- **Medida.** 12 de 20 botões do painel de ação só escrevem texto. A ação central
  do modo padrão, `Agir →`, mede **720 px²** — o menor alvo do jogo — enquanto o
  campo de batalha é um `<rect fill="transparent">` de 27 px. O caminho caro é o
  que está ergonomicamente pior.
- **Estudo citado, e a origem é esta casa.** `src/reacoes.js` escreve que *"no 5e
  e no BG3 metade da tensão do combate mora aqui"* — e sete linhas depois entrega
  a decisão ao sistema. A mesma inversão acontece com o ataque: o motor sabe
  resolver, e pede-se à prosa que autorize.
- **Experiência jogada.** Numa luta inteira o `jogo` tocou **três** controles — e
  um deles encerrou a luta por engano. E o Narrador ficou **sem quota duas
  vezes** (D1 e D4: *"Limite diário alcançado (500 chamadas)"*), com o combate a
  ser medido com o Mestre calado — o que prova, de lado, que **a luta já roda sem
  ele**: a luta da chave abre localmente, pelo sistema.

**O que o jogador teria de reaprender, e é uma coisa só:** *em combate, não se
escreve para agir — escreve-se para falar.* Nada sai do sítio fora da batalha.

**A versão moderada, se a radical for longe demais:** o campo continua a aceitar
ação escrita (inclusive *"vou até H20"*, que a régua acabou de tornar possível),
**mas deixa de ser o único caminho** — e o botão passa a chamar o motor em vez de
digitar. O ganho de chamadas é menor; o ganho de ergonomia é o mesmo.

**O que ganha, em números que já existem:** uma campanha deixa de gastar o teto
de chamadas com combate, que é o momento em que o motor é mais competente e a IA
menos necessária. **E é a única proposta desta etapa que devolve quota ao
Narrador em vez de lha cobrar.**

**A ressalva honesta, e ela é grande:** este é um RPG de texto, e há um risco
real de que uma luta muda deixe de ser uma luta *narrada*. É por isso que a
decisão é da pessoa e não da mesa: **o que muda é o que o produto é**, não como
ele se parece.

---

## 10. O que ficou feio, o que não coube, e o que eu não soube

**Feio.**

- **Um tabuleiro de 48 px num telefone de 375 px mostra 33% do campo, e não há
  desenho que conserte isso.** O segundo nível de leitura é um remendo honesto, e
  é um remendo: o jogador tem de trocar de nível para ver a forma da luta. A
  alternativa era encolher o alvo abaixo do piso de acessibilidade, e essa não é
  uma alternativa.
- **A pilha que o `jogo` compôs cabe 1 planta de 10 inteira**, e a alternativa
  que cabe 9 recompõe a tela dele. Escrevi a conta e a recomendação; **não
  recompus a tela dele**, e a decisão fica com o par — o que significa que este
  documento pode estar a descrever uma geometria que não vai ser a escolhida.
- **`inkDim` sobre casa acesa reprova o AA por 0,03.** Está conservado com uma
  regra em vez de uma tabela, e regra escrita é mais frágil que número em tabela.

**Não coube.**

- **A letra por plataforma (Fase L).** Escolhi 11/12 px para a régua com fonte
  citada, mas **não construí a escala** — e portanto os outros textos desta tela
  (15 px na prosa, 11 px nas notas) estão escolhidos um a um, que é exatamente o
  que L1 existe para acabar. Não contrariam nada de L; também não a antecipam.
- **O eixo *Largura* do `Botao`** (achado B) — declarado, não pago.
- **O branco invisível nas peças de D3/D4** (achado C) — contado por amostra de
  3, não por varredura completa do arquivo.
- **As cores novas nasceriam vermelhas na catraca.** Nenhuma nasceu: as quatro
  peças usam só as 14 de `T`. Mas as **quatro classes de movimento** propostas
  em §5 nascerão vermelhas em D5c no dia em que forem escritas, e isso é
  intencional — cada uma já traz a linha do `prefers-reduced-motion` ao lado.

**Não soube.**

- **Se o zero pontuado e o `I` serifado do JetBrains Mono do Figma batem com os
  do navegador.** É o argumento que sustenta a escolha do mono para a régua, e é
  o único elo da cadeia que não medi. Prima da diferença que D3 já achou (sem
  peso 600 no Figma — reconferido hoje, continua verdade).
- **Se 48 px é o alvo certo ou só o alvo mínimo.** Os três estudos dão o piso;
  nenhum diz qual é o **bom** num tabuleiro que se toca dezenas de vezes por
  luta. Isto só se sabe jogando, e o Narrador está sem quota — a Fase E vai ter
  de medir isto ela mesma.
- **Quanto tempo deve durar a janela da pergunta que expira.** A peça está feita;
  o número não está, e é decisão de K1 com o `jogo` — porque depende do ritmo da
  rodada, que é dele.
- **Se a tira de "o que acabou de acontecer" com uma linha só, no telefone, é
  suficiente para a prosa não morrer.** Defendi-a com a régua da tipografia
  (24,4 px de linha), não com experiência jogada. É a decisão desta etapa de que
  tenho menos certeza.

---

*Fase E1 · `desenho` · 15/09. O par é o `jogo`, que compõe `A batalha`.*

---

# A segunda rodada

O `jogo` compôs a tela com as peças e devolveu **um bloqueador e nove pedidos**.
O que está acima **não foi reescrito** — o percurso é que prova o ofício, e uma
peça corrigida com o motivo escrito vale mais que uma peça que nunca errou.

## 11. O bloqueador: `A casa` media 148 px e não ladrilhava

**O achado do `jogo` está certo, e a causa é pior do que ele viu.** A peça de D4
media **148×48**. O quadrado era 48×48, mas `o custo` e `o preço` eram **duas
linhas de legenda de largura inteira por baixo dele**, num auto-layout vertical
espremido a 48 de altura — 48 + 13 + 12 = 73 px de conteúdo dentro de uma caixa
de 48. Quem a usasse num tabuleiro tinha de recortar 48 de 148 e deslocar
−50 px por casa, que foi exatamente o que aconteceu nos cinco quadros de
`A batalha`. **Remendo na peça vira remendo no código de E3.**

**E a ironia é que a forma escrita já estava certa.** `formas.md` manda *"o custo
escrito **dentro** da casa"*. A peça de D4 escreveu-o **fora**. A discordância
não era entre o `jogo` e o `desenho`: era entre o `desenho` e o que ele próprio
tinha escrito.

**O que foi feito.** As sete variantes são hoje **48×48 exatos**, `layoutMode:
NONE`, e tudo o que a casa diz cabe dentro dela. Provado, não afirmado: a página
`A casa` leva agora **`a prova do ladrilho`** — 24 instâncias reais a passo de
48, 6×4, sem um pixel de folga nem de sobreposição.

**O 148 não virou variante, e a recusa é o ponto.** A sugestão do `regente` era
que, se o 148 servia a um caso legítimo, ele virasse eixo. Não serve:
*"custa um golpe livre"* são 20 caracteres, ~108 px em mono 9 — **não cabem em 48
de lado nenhum**, e uma variante larga só devolveria o ladrilho que não ladrilha.
**O preço é `A Consequência` (`Tom=Preço, Forma=Linha`) na linha do veredito sob
o campo** — a peça que já existe para isso, e a regra que `formas.md` já
escrevera: *sobre o tabuleiro a Consequência é sempre Linha, nunca balão, porque
quatro segundos de balão tapam as casas para onde o jogador ia andar*. **Uma peça
a menos, nenhuma informação a menos.**

### A armadilha nova do Figma, que custou três tentativas e corrige D4

D4 escreveu: *"`setBoundVariableForPaint` devolve a tinta com `opacity: 1` —
reaplique o alfa depois de ligar a variável."* **A segunda metade dessa frase é
falsa, e é falsa de um modo que engana:** reaplicar o alfa no paint faz a
**leitura de volta devolver `0,22`** e o **render sair chapado**. As sete casas
saíram em âmbar sólido três vezes seguidas, com o script a jurar que estavam a
22%.

> **A regra que funciona, e é estrutural:** o alfa de uma cor ligada a variável
> mora na **opacidade do NÓ**, nunca na do paint. `quadrado` carrega só a borda;
> um filho `o banho` carrega a cor cheia com `opacity` de nó. **Quem comparar
> esta peça por script tem de ler `banho.opacity`, não `fills[0].opacity`.**

E um terceiro achado, que explicava o último caso teimoso: **o `anel de foco` de
D4 continha uma TERCEIRA cópia do ladrilho lá dentro** (`anel de foco` → `o vão`
→ `quadrado` 48×48, com fill de alfa de paint). Era ela que pintava sólido, e era
ela que o meu primeiro `findOne("quadrado")` apanhava em vez do ladrilho real.
Foi limpa: o anel é hoje **só os dois contornos** (56 em `ink`, 52 em `bg`).

## 12. Os oito pedidos, um a um

### 12.1 · O endereço dentro da casa — feito, e com dois estados a mais

O `jogo` pediu o endereço em *Sob o dedo* e *Confirmando*. **Entrou nos quatro**,
e os dois que acrescentei têm razão:

- ***Foco* é o "sob o dedo" de quem joga por teclado.** Sem o endereço ali, quem
  tabula pela grelha não sabe onde está — e a grelha é um só ponto de tabulação
  justamente para se andar por ela às cegas (§6).
- ***Mira* é onde o jogador está prestes a nomear a casa em voz alta.** Esconder
  o endereço exatamente no momento em que ele serve seria o oposto do pedido da
  pessoa.

Mono Regular **9 px**, canto de cima, na gramática de `coordenadas.js:151`.

### 12.2 · `Alcançável` voltou a mostrar o custo — a peça é que estava errada

**Corrigido sem discussão, porque a forma escrita é lei.** `formas.md` ~241
fechou isto entre as duas mesas, com o motivo: *no telefone não há
`onMouseEnter`, e sem o custo escrito o veredito antes do clique **não existe**
naquela plataforma*. A peça de D4 escondia-o até *Sob o dedo* e **contrariava a
forma escrita**. Duas verdades sobre a mesma casa é precisamente o defeito que
este arquivo existe para impedir — e neste caso quem estava errado era o Figma,
não a prosa.

### 12.3 · A borda por casa × o contorno da união — **concedo, com condição medida**

**O lado do `jogo`:** a borda âmbar por casa e o contorno da união dizem a mesma
coisa duas vezes. Que a união diga o alcance, e a casa só ganhe borda a partir de
*Sob o dedo*.

**O lado do `desenho`, e é onde eu tinha o contra-argumento:** a borda a 55% é
que dá os 3,41:1 do WCAG 1.4.11; o fundo entre 10% e 28% fica em 1,15–1,71:1, que
é profundidade e não informação. Se a união carregar o recado sozinha, **ela tem
de passar na mesma régua**.

**A decisão: ele tem razão, e a razão é uma regra minha.** Com o custo escrito
dentro de toda casa *Alcançável* (12.2), **a casa já está marcada
individualmente, e por texto** — que não é cor, e por isso não depende de 1.4.11
de todo. A borda passava a ser o terceiro canal a dizer o mesmo. É a aplicação
literal do que escrevi em §2: *o que é alvo tem o custo escrito dentro*.

**Mas a concessão tem três condições, e elas são a minha metade — todas medidas
agora, e uma delas denuncia um defeito que já existe hoje:**

| a união, hoje | medido | WCAG 1.4.11 (3:1) |
|---|---|---|
| âmbar a 60% sobre `bg` | **3,85:1** | passa |
| **violeta a 60% sobre `bg`** | **2,68:1** | **REPROVA** |
| violeta a 70% sobre `bg` | **3,24:1** | passa |

`grade-de-batalha.jsx:433` desenha o contorno com
`cor={mirando ? T.violet : T.amber}` e `opacidade={0.6}`. **Logo: o contorno da
mira reprova o piso de não-texto hoje, a 2,68:1** — e enquanto a casa também
tinha borda isso era redundância a salvar a situação. **Tirar a borda por casa
torna esse defeito carregador.**

> **As três condições:** união âmbar **≥ 60%** (3,85:1); união violeta
> **≥ 70%** (3,24:1) — é mudança de número, e é de E3; traço **≥ 2 px**. A
> terceira é a que amarra tudo: o contorno mede `largura: 0.045` em unidades de
> casa, o que dá **2,16 px a 48 px de casa e apenas 1,07 px a 23,8 px** — um fio.
> **A união só pode carregar o recado sozinha porque a casa passou a ser 48.** A
> concessão e o piso de 48 px são a mesma decisão.

**E uma exceção que fica: *Mira* mantém o tracejado por casa.** Em mira há
**duas** coleções violetas na tela ao mesmo tempo — o alcance e a área que a
magia varre (que o código pinta em `danger`, `:445`) — e uma união sozinha não
separa *"onde posso fazer cair"* de *"o que isto pega"*.

### 12.4 · `Botao` *Impedido* 19 px mais alto — corrigido, e só até onde é seguro

O defeito é real: na barra de verbos encostada ao tabuleiro, um botão que cresce
ao ficar impedido **empurra o campo** — o tabuleiro muda de tamanho porque uma
ação ficou indisponível.

**Feito: uma geometria por `Papel` × `Tamanho`.** A linha da razão passa a ser
**reservada em todos os quatro estados**.

| grupo | antes (Repouso → Impedido) | agora |
|---|---|---|
| Chamada Normal | 53 → 74 | **74** |
| Chamada Pequeno | 38 → 59 | **59** |
| Gesto Normal | 44 → 63 | **63** |
| Gesto Pequeno | 30 → 49 | **49** |
| Recuo Normal | 42 → 63 | **63** |
| Recuo Pequeno | 28 → 49 | **49** |

**E a linha reservada não é espaço morto:** na barra de verbos ela é onde `A
Consequência` *tom=Preço* se senta. O botão que funciona mostra o preço; o botão
que recusa mostra a razão. **Mesma linha, mesma altura, sempre.**

**O que eu NÃO fiz, e é recusa com motivo.** O fim de linha correto é o achado A
(§7.5) levado ao fim: **a razão sai do `Botao` por completo** e passa a ser
sempre `A Consequência` — os tons *Impedimento* e *Espera* existem exatamente
para isso e foram construídos duas vezes por acidente. **Não o fiz nesta rodada**
porque `A linha` compõe **quatro** instâncias de `Botao` que dependem das
propriedades `a razao` e `mostrar a razao` (conferido: `22:46`), e apagá-las
mudaria calada uma peça que o `jogo` não reviu. **Uma peça mudada em silêncio por
baixo de uma composição é pior do que uma peça com espaço reservado.** Fica item,
com o número e com o caminho.

**A largura continua a saltar (78 → 141) e isso é da composição**, não da peça:
uma barra de verbos põe os botões em `FILL` e o salto desaparece. O que a peça
não podia resolver sozinha era a altura, e a altura está resolvida.

### 12.5 · `Barra de medida` não cabia em 375 — corrigido

**A causa:** a raiz e o quadro interno eram **HUG nos dois eixos** e o `trilho`
era **FIXO em 90 px**. A peça não esticava nem encolhia: a largura era ditada
inteiramente pelo conteúdo.

**Feito:** raiz `FIXED` em 160 com `minWidth: 120`; o quadro interno em `FILL`; o
`trilho` em `FILL` com `minWidth: 48`; e o alinhamento interno passou a `MIN` —
sem isso a folga crescia no **vão** em vez de no trilho, que era o defeito
visível. Medido numa tira de prova:

| caixa | trilho |
|---|---|
| 359 px (um telefone com respiro) | 285 px |
| 288 px (a ficha curta) | 214 px |
| 200 px | 126 px |
| 140 px | 66 px |
| 120 px (o piso) | **48 px** |

O rótulo e o número continuam a abraçar; **quem absorve é o trilho**, que é o
único elemento cuja largura não carrega informação.

### 12.6 · `A vez` ganhou o eixo `Forma` — o `jogo` pediu e a conta dá-lhe razão

**12 → 24 variantes:** *Lado* × *Vez* × **`Forma` (Linha · Selo)**.

A *Linha* mede 320×48 e serve a lateral de 344. Numa **faixa de largura inteira**
ela não serve, e o número é brutal: **oito combatentes em Linha pedem 2.560 px** e
a faixa tem 1.280. **Em Selo os mesmos oito ocupam 472 px** — provado na página
com `a prova da faixa de 1280`, que cabe com 808 px de folga.

**O Selo é 48×48 e continua a ser alvo** (toque abre `A ficha curta`) — nenhuma
exceção de tamanho.

**O que ele guarda e o que ele larga:** guarda o número da iniciativa, de quem é
a vez e de que lado; larga o nome e a medida de vida. **Oito nomes de combatente
numa faixa de 1.280 seriam oito truncagens, e um nome truncado não é um nome.**

**E resolver o "quem" sem palavra obrigou a um vocabulário, que é o achado
bonito desta rodada:** o aliado leva um **círculo**, o inimigo um **losango** —
**as mesmas duas formas de `A marca de borda`**, de propósito —, e **você** leva a
palavra `voce` escrita, porque o herói é o único que precisa de ser lido nomeado
de relance. *Caiu* ganhou **um risco atravessado em `danger`**: sem ele, caído e
espera eram o mesmo selo com o número mais apagado — um canal a menos, apanhado
ao olhar a prova.

### 12.7 · `A marca de borda` — peça nova, página `A marca de borda` · nó **`53:43`**

- **por que precisa de existir, e o número é o mesmo que manda em toda a fase:**
  num telefone de 375 o campo mostra 7 de 16 colunas. **Mais de metade dos
  combatentes pode estar fora da tela a qualquer momento.** Sem esta peça, a
  única forma de saber que há um inimigo a flanquear é rolar o campo à procura —
  e procurar é o custo que o endereço existe para não cobrar.
- **8 variantes:** *Quem* (Aliado · Inimigo) × *Aresta* (Cima · Direita · Baixo ·
  Esquerda). 56×44 nas horizontais, 78×44 nas verticais.
- **ela carrega o endereço, e é por isso que funciona.** `K14` é a mesma casa da
  régua e da ficha curta. O jogador lê a marca, sabe para onde rolar, e pode
  dizer *"vou até K14"* **sem nunca ter visto a casa**. A marca, a régua e a casa
  são três formas do **mesmo** endereço.
- **três canais:** a **forma** diz quem, a **seta** diz para onde, o **texto** diz
  onde exatamente. A cor é o quarto e o único dispensável.
- **44 px porque é alvo** (toque leva a câmara até lá). Aqui não são os 48 da
  casa: a marca vive na moldura, não na malha — **não ladrilha nada e não tem de
  bater com passo nenhum.**
- **movimento:** aparece e some em 140 ms de opacidade, e **a posição ao longo da
  aresta muda a seco**. Uma marca que persegue o inimigo pela borda é movimento
  periférico durante o turno inteiro, e movimento periférico é a coisa que mais
  rouba a leitura da cena.
- **variáveis ligadas:** `panel` (corpo), `ok` · `danger` (moldura, seta, forma),
  `ink` (endereço), `bg` (a folha).
- **contraste:** endereço `ink`/`panel` **14,37:1**; moldura e seta `ok`/`panel`
  **9,19:1** e `danger`/`panel` **5,32:1**. Passam.

### 12.8 · O arranjo em duas colunas — o que mudou nas peças

O `regente` mandou recompor em duas colunas (**9 de 10 plantas** contra **1 de
10**). Uma medida minha mudou por causa disso: **`A pergunta que expira` desceu de
344 para 320 px**, para caber na lateral de 344 com respiro — a mesma largura de
`A vez` *Forma=Linha*. As outras já serviam.

### 12.9 · `#141020` → `T.bg` — dito, e é de E3

Fica repetido aqui porque é a linha que paga dois buracos de uma vez: o fundo do
tabuleiro (`grade-de-batalha.jsx:367`) é **literal solto** que a catraca D5a
conta, **e** está a **1,04:1** de `T.bg`, o que faz o vão de 2 px do anel de foco
não se separar. Trocar por `T.bg` é invisível a olho nu (1,04:1 é menos que a
diferença entre `panel` e `bg`, que é 1,07:1) e conserta os dois. **É de E3.**

## 13. O estado da biblioteca depois da segunda rodada

| peça | página · nó | variantes | tamanhos |
|---|---|---|---|
| **A casa** *(refeita)* | `A casa` · `18:31` | 7 | **48×48, todas** |
| **A régua** | `A regua` · `30:11` | 4 | 48×22 · 22×48 |
| **A vez** *(+ eixo Forma)* | `A vez` · `30:163` | **24** | 320×48 · 48×48 |
| **A ficha curta** | `A ficha curta` · `31:137` | 6 | 288×150 |
| **A pergunta que expira** *(320)* | `A pergunta que expira` · `31:518` | 4 | 320×193…344 |
| **A marca de borda** *(nova)* | `A marca de borda` · `53:43` | 8 | 56×44 · 78×44 |
| **Botão** *(geometria uniforme)* | `Botao` · `9:170` | 24 | uma altura por `Papel`×`Tamanho` |
| **Barra de medida** *(estica e encolhe)* | `Barra + Veu` · `6:15` | 6 | 160×13/15, `min 120` |

**Duas provas ficaram no arquivo, e ficam de propósito** — uma afirmação que se
pode ver vale mais que uma que se tem de acreditar: `a prova do ladrilho` (24
casas a passo de 48) e `a prova da faixa de 1280` (8 selos em 472 px).

## 14. O que continua aberto depois desta rodada

- **A razão sai do `Botao`** e passa a ser sempre `A Consequência` — item, com o
  caminho escrito em 12.4. Bloqueado por `A linha`, que o `jogo` ainda não reviu.
- **O eixo `Largura` do `Botao`** (§7.5, achado B) — continua por pagar.
- **A opacidade da união violeta: 0,6 → 0,7** (12.3) — é número, é de E3.
- **`#141020` → `T.bg`** (12.9) — é de E3.
- **A escala da Fase L** — nada nesta rodada a contraria; nada a antecipa.

**E o que eu não soube nesta rodada:** se o *Selo* de `A vez` continua legível
com **doze** combatentes (576 px cabem em 1.280, mas doze selos de 48 px lado a
lado passam a ser uma fileira de números sem nome, e não tenho como saber onde é
o limite sem jogar). O piso que escrevi é **até oito**; acima disso é medida que
falta.

---

*Segunda rodada de E1 · `desenho` · 15/09.*
