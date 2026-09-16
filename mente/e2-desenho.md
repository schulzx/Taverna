# E2 · o endereço do tabuleiro — o lado do desenho

**Fase E, etapa 2.** O `jogo` fechou o momento em `mente/e2-jogo.md`; este
documento é a **forma**: a marca que acende, o grau que faltava entre acesa e
apagada, a conta do telefone, o contraste de cada par novo, o nome acessível da
casa — e as três peças consertadas.

**Nada de código.** Nenhum `.js`, `.jsx` ou `.mjs` foi tocado. O que se lê aqui
saiu de medir a peça real no Figma e de ler o código de hoje.

---

## 0. A conta do par, conferida — ele tem razão, e pela razão errada

O `jogo` mediu que a linha do veredito anda **6,0 px por caractere** em mono
10 px e daí tirou um teto de **54 caracteres**. Fui à peça conferir, e a
conferência tem três resultados.

**1 · O avanço está certo, e agora está provado.** Li os nós de texto de
`109:2623` um a um: **doze amostras de `a frase`, mono 10 px Regular,
`letterSpacing` 0 %, todas com `largura / caracteres = 6,000`.** Não é a
aritmética de `0,6 em × 10 px` a confirmar-se a si própria — é a fonte desenhada
no arquivo a devolver o mesmo número doze vezes. *A conta dele está certa e
deixou de ser uma conta: é uma medida.*

**2 · A largura útil não é a que ele usou, e a peça é que sabe.** Ele escreveu
*"344 px na lateral (328 úteis)"* — 344 menos 16, supondo 8 px de enchimento de
cada lado. **Medida na peça `Consequencia`: o enchimento é zero.** O que come
largura é outra coisa, e ele não a contou: a `marca` de 4 px mais a goteira de
6 px do leiaute. **O útil é `largura − 10`, nunca `largura − 16`.**

| onde | largura | útil real | teto real |
|---|---|---|---|
| lateral de 1280 | 344 px | **334** | **55 caracteres** |
| telefone | 359 px | **349** | **58 caracteres** |

**3 · E a atribuição está ao contrário.** A tabela dele diz *"a curta, para o
telefone e para a lateral"*, como se as duas apertassem igual. **Não apertam: o
telefone é o lado LARGO** (58) e a lateral de 1280 é o estreito (55). Quem
reescrever uma frase a olhar para o telefone vai achar que tem 4 caracteres que
não tem.

**O veredito sobre o teto: 54 fica.** Não porque a conta dele estivesse certa —
os dois enganos quase se anularam —, mas porque **54 é o único número que
sobrevive ao lado estreito com margem**, e a margem é de 1 caractere. A catraca
que ele pediu (teste que falha acima de 54) é boa e eu assino-a.

### E o buraco que nenhum dos dois tinha visto, e é grande

A linha do veredito é mono **10 px num nó de largura fixa e sem quebra**. Perguntei
o que acontece quando o sistema operativo aumenta o texto — que é WCAG 1.4.4
(*Resize text*, AA), e o jogo é lido num telefone.

| zoom do sistema | avanço | teto |
|---|---|---|
| 100 % | 6,0 px | 55 |
| **115 %** | 6,9 px | **48 — a `curta` de 54 já não cabe** |
| 125 % | 7,5 px | 44 |
| 200 % | 12,0 px | **27** |

**A `curta` de 54 caracteres parte-se a 115 % de texto do sistema.** Não é um
caso raro: é o primeiro degrau que um telefone oferece. E o que ali se parte é
exactamente a coisa que a casa proíbe de apagar — *a razão nunca apaga*.

**A causa não é a frase. É a peça, e a peça é minha.** Ver §5.3.

---

## 1. A marca de borda, e o grau que faltava — decisão 1

### A pergunta, e a resposta curta

*A régua realçada basta, ou a marca precisa de mais um dente?*

**A régua realçada basta, e eu não acrescento dente nenhum ao cruzamento.** O
filete de 2 px que E1 desenhou **não vira um segundo sinal na casa** — ele é
recrutado para outra coisa, que é o que esta etapa precisava de facto.

A razão é a lei que E1 já escreveu e que vale tal e qual aqui: *o que é alvo tem
o custo escrito dentro.* No cruzamento de `K` com `14` está **a casa**, e a casa
acesa já carrega o endereço e o custo por dentro. Um dente na régua a apontar
para uma casa que se está a acender ao lado seria o terceiro canal a dizer o
mesmo — a mesma redundância que E1 concedeu tirar da borda por casa (12.3).

### O estado intermédio — e a peça de 4 variantes não tinha mesmo

O `jogo` pediu: a coluna acende **antes** do número, enquanto ele escreve
`K1`→`K14`. Tentei resolver com as 4 variantes que já existiam, e não dá, por
uma razão que só aparece quando se escreve a frase toda:

> **Se *Realçada* serve tanto para "a metade que eu tenho" como para "o endereço
> inteiro", então a régua diz a mesma coisa quando o jogador escreveu `K` e
> quando escreveu `K14`.** E são estados diferentes: no primeiro **nada é
> accionável** — não há casa, não há custo, `Enter` não faz nada. No segundo há
> um destino e um preço.

**Decisão: `A regua` ganha um terceiro grau no eixo *Estado* — `Procurada`.**
4 → **6 variantes** (`30:11`), abaixo do teto de 30.

| grau | a letra | o filete | o que quer dizer |
|---|---|---|---|
| **Repouso** | `inkDim` — 6,62:1 | nenhum | a régua é mobília |
| **Procurada** | `ink` — 15,31:1 | 2 px em **`lineStrong`** — 3,74:1 | *"eu li o `K`. ainda não há endereço."* |
| **Realçada** | `amberSoft` — 12,40:1 | 2 px em `amber` — 9,00:1 | *"o endereço está inteiro e aponta para uma casa."* |

**Por que `ink` e não um âmbar mais fraco.** Se *Procurada* fosse âmbar pálido, a
diferença para *Realçada* seria **só saturação** — e saturação é a distinção que
primeiro morre num telefone ao sol e a que menos existe para quem não separa
matizes quentes. Em `ink` a diferença é **luminância** (15,31 contra 12,40 e
contra 6,62), que sobrevive a tudo.

**E o canal que não é cor, que é o que a regra pede.** Entre *Repouso* e
*Procurada* o que muda **não é a cor: é a existência do filete.** Presença
contra ausência não depende de ver cor nenhuma. Entre *Procurada* e *Realçada* a
cor muda nos dois elementos — e aí o terceiro canal **não está na régua, está na
tela**: o endereço completo é o único dos dois que **acende a casa no campo, com
o custo escrito dentro**. Quem não separa âmbar de branco lê a mesma informação
pela casa que acendeu.

### `lineStrong` serve aqui, e serve exactamente aqui

A pessoa perguntou-me directamente. **Serve, e é o caso de uso para que ela
nasceu.** `lineStrong` (`#70688C`, K1b) tem escopo `STROKE_COLOR` na variável do
Figma e a nota em `estilo.js` di-lo à letra: *"escopo é só borda de controlo"*.
**O filete da régua é uma borda de controlo.** Medido: `lineStrong`/`bg` =
**3,74:1**, acima do piso de 3:1 da WCAG 1.4.11, com 24 % de folga.

**E ela resolve um problema que o âmbar não resolvia:** sem `lineStrong` eu teria
de fazer *Procurada* com um âmbar a menos de 100 % de opacidade, que é
exactamente a doença que D4 corrigiu (opacidade a fingir de cor) e que E1 proibiu
nesta tela — *"nenhuma opacidade em lugar nenhum"*. **O degrau novo da paleta
comprou-me o grau novo do estado sem eu ter de inventar meio-tom.**

*A ressalva, medida:* `lineStrong`/`line` = **2,71:1, reprova.** O filete de
*Procurada* só passa sobre `bg` (3,74), `panel` (3,51) e `panelSoft` (3,27).
**Sobre `line` não passa** — e como a régua vive na calha sobre `bg` (E1 §3), não
passa a ser um problema hoje. Fica escrito para o dia em que alguém encostar a
régua a uma moldura.

### `A marca de borda` passa a saber falar de um lugar

O `jogo` decidiu que a casa acesa pela frase e fora da janela **não traz a câmara
atrás** — quem fala é a marca de borda (§7.1 dele). Fui usar a peça e ela não
servia: `A marca de borda` só sabia dizer **Aliado** e **Inimigo**. Uma casa não
é nem um nem outro. Dizer `K1` num corpo vermelho de inimigo seria o jogo a
inventar uma ameaça que não existe.

**Decisão: `A marca de borda` ganha `Quem = A casa`.** 8 → **12 variantes**
(`53:43`).

- **a forma é um quadrado**, ao lado do círculo do aliado e do losango do
  inimigo — e é o quadrado porque é literalmente o que a coisa é: uma casa do
  tabuleiro. Três formas, três significados, **zero dependência de cor**.
- **a cor é `amber`** — 9,00:1 sobre `bg`, 8,45:1 sobre `panel`. É o tom do
  *seu* movimento em toda a casa (D4: *"é a coisa boa da rodada, é o convite"*),
  e separa-se do `ok` do aliado e do `danger` do inimigo sem ambiguidade.
- **o endereço continua em `ink`/`panel` — 14,37:1.**

**E foi esta peça que fechou o pedido da pessoa.** *"O jogador tem de conseguir
dizer 'vou até K14' sem nunca ter visto a casa."* Com `Quem=A casa`, ele escreve
`K1`, a casa está fora da janela, e **a borda responde-lhe com `K1` e a seta** —
o jogo confirmou o endereço de uma casa que nenhum dos dois está a ver. É o
terceiro momento do ensino do `jogo` (§4 dele) a acontecer **enquanto ele
escreve**, e não só quando um inimigo se move.

### Onde isto está provado

Página **`A regua`**, quadro **`E2 · a coluna acende ANTES do numero — o estado
intermedio`** (`117:2`). Três painéis, com peças reais:

| passo | o que ele escreveu | a régua | o campo | a linha do veredito |
|---|---|---|---|---|
| 1 | `K` | coluna K em *Procurada* | nada aceso | **calada** |
| 2 | `K1` | coluna K em *Procurada* | **`A marca de borda` *Quem=A casa*** com `K1` | **calada** — o endereço ainda pode crescer |
| 3 | `K14` | K e 14 em *Realçada* | `A casa` *Sob o dedo* com `6,0` dentro | `K14 · 6,0 m de 9 · restam 3,0` |

**O passo 2 é o quadro que justifica a etapa inteira**, e é o que eu não teria
desenhado se tivesse ilustrado o exemplo do `jogo` à letra: `K1` é um prefixo
**válido e fora da janela**, e é ali — não em `K14` — que se vê por que é que a
marca tinha de aprender a dizer um lugar.

---

## 2. O celular — a decisão dura, e ela custa zero

**A conta dos dois lados**, com os números de E1 (375 de largura, casa 48,
respiro 16, régua 22, campo de 616 px de altura depois dos 76 devolvidos pelo
trilho de abas ausente):

| | útil | colunas | linhas | **casas inteiras** | folga |
|---|---|---|---|---|---|
| **sem a régua** | 359 × 616 | 7 | 12 | **84** | 23 px · 40 px |
| **com a régua** | 337 × 594 | 7 | 12 | **84** | 1 px · 18 px |

> ### O custo da régua no telefone é **0 colunas, 0 linhas, 0 casas.**

**E a prova não é a igualdade dos dois números — é a folga.** Sem a régua sobrava
**23 px na largura e 40 px na altura**, e **uma casa pede 48**. Nenhuma daquelas
folgas podia virar casa; nenhuma delas era campo. **A régua foi paga inteira de
espaço que casa nenhuma podia ocupar.** Se a folga sem régua fosse de 50 px, a
régua custaria uma coluna e eu teria de escrever o que cedia. Não é o caso, e é
isso que torna a decisão fácil em vez de dura.

*E a folga de 1 px que sobra não é para fechar certo:* E1 já decidiu que o campo
abre **centrado na casa do herói** e a sobra parte-se nas duas bordas. Com 1 px
de folga, as 7 colunas inteiras continuam garantidas — meio pixel de cada lado
não come coluna nenhuma.

**Provado, não afirmado:** página `A regua`, quadro **`E2 · a regua custa ZERO
casas no telefone`** (`119:44`) — os dois campos lado a lado em 375 px, malha de
48 px desenhada, sete colunas e doze linhas contadas em ambos.

### A letra no telefone: **12 px**, e 22 px de calha aguentam

Medido **na peça**, não estimado:

- a linha do glifo de mono Bold 12 px mede **16 px** — numa calha de 22 px sobram
  **3 px em cima e 3 embaixo**;
- a etiqueta mais larga (dois dígitos, `12`) mede **15 px** — numa calha de 22 px
  sobram **3,5 px de cada lado**.

**Aguenta, e aguenta com folga em todos os quatro lados.** E 12 px é a escolha
certa e não o mínimo: os pisos citados são 11 (Apple HIG 11 pt, Material
*labelSmall* 11 sp), e **ficar um degrau acima do piso é o que faz a régua
sobreviver ao jogador que já aumentou o texto do sistema** — que, como o §0
acabou de mostrar, é um jogador que existe.

---

## 3. O contraste de cada par novo, medido contra `T`

Piso de texto **4,5:1** (WCAG 1.4.3 AA); piso de indicador **3:1** (1.4.11).

| par | medido | piso | veredito |
|---|---|---|---|
| régua *Repouso* — `inkDim`/`bg` | **6,62:1** | 4,5 | passa |
| régua *Procurada*, a letra — `ink`/`bg` | **15,31:1** | 4,5 | passa |
| régua *Procurada*, o filete — **`lineStrong`/`bg`** | **3,74:1** | 3 | passa |
| régua *Realçada*, a letra — `amberSoft`/`bg` | **12,40:1** | 4,5 | passa |
| régua *Realçada*, o filete — `amber`/`bg` | **9,00:1** | 3 | passa |
| marca *A casa*, a moldura e o quadrado — `amber`/`panel` | **8,45:1** | 3 | passa |
| marca *A casa*, o endereço — `ink`/`panel` | **14,37:1** | 4,5 | passa |
| marca *A casa* sobre o tabuleiro — `amber`/`bg` | **9,00:1** | 3 | passa |
| marca *Aliado* · *Inimigo* sobre o tabuleiro — `ok`·`danger`/`bg` | **9,79** · **5,67:1** | 3 | passam |
| **o corpo da marca sobre o tabuleiro — `panel`/`bg`** | **1,07:1** | 3 | **REPROVA — declarado abaixo** |
| o filete *Procurada* sobre `panel` | **3,51:1** | 3 | passa |
| o filete *Procurada* sobre `panelSoft` | **3,27:1** | 3 | passa |
| **o filete *Procurada* sobre `line`** | **2,71:1** | 3 | **REPROVA — proibido** |

### Os dois buracos, com número

1. **O corpo da marca de borda não se separa do tabuleiro: 1,07:1.** É a mesma
   família do buraco 3 de E1 (`#141020` contra `bg`), e a decisão é a mesma:
   **quem separa a marca do campo é a moldura**, que mede 9,79 · 5,67 · 9,00 —
   todas acima de 3:1. **Fica escrito porque no dia em que alguém tirar a moldura
   da marca, ela desaparece dentro do tabuleiro** e nada no código vai avisar.
2. **`lineStrong` sobre `line` reprova a 2,71:1.** O filete de *Procurada* é
   legal sobre `bg`, `panel` e `panelSoft`, e **ilegal sobre `line`**. A régua
   vive sobre `bg` (E1 §3) e por isso não dói hoje. É a primeira reprovação que
   `lineStrong` colecciona desde que nasceu, e vale a pena tê-la anotada: ela é
   um degrau, não uma cor forte.

---

## 4. O nome acessível da casa — decisão 4

### `aria-label`, e o `<title>` sai

**A pergunta é boa e a resposta não é "os dois".** Hoje
`grade-de-batalha.jsx:509-520` põe um `<title>` dentro de um `<rect
role="button">`. O `<title>` de SVG *chega* a produzir nome acessível — mas ele
faz **duas coisas ao mesmo tempo**, e uma delas é um defeito conhecido desta
casa:

1. **`<title>` é também o balão do rato.** É um canal que **no telefone não
   existe** — o argumento que E1 já usou para fabricar `A ficha curta` (12.7).
2. **E é um balão sobre o tabuleiro.** A frase tem ~57 caracteres; em balão são
   ~340 px a aparecer por cima do campo depois de um segundo de paragem —
   **exactamente o que `formas.md` proíbe**: *quatro segundos de balão tapam as
   casas para onde o jogador ia andar.* O balão do rato é o balão que nós
   recusámos, entregue pelo navegador em vez de por nós.
3. `aria-label` é computado **antes** do nome nativo e não tem ambiguidade de
   suporte entre leitores.

**Decisão: `aria-label` carrega o nome; o `<title>` é removido, não duplicado.**
Duas strings a descrever a mesma casa seriam duas verdades sobre o mesmo chão —
a doença que esta mesa existe para impedir.

**E não se perde informação, o que é o que torna a remoção segura.** O que o
`<title>` dava ao rato já está noutro sítio, por decisão anterior: o **custo**
mora dentro da casa (E1 12.2), o **veredito** mora na linha do veredito
(`formas.md`), e o **nome da região** já está escrito no chão do tabuleiro
(`grade-de-batalha.jsx:385`).

*A condição que vem junto:* `aria-label` num `<rect>` **sem `role` é ignorado**.
Logo a grelha tem de ser o `grid` do WAI-ARIA que E1 já decidiu em §6 — casca
`role="grid"`, cada casa `role="gridcell"`, *roving tabindex*. **Hoje a casa
inalcançável não tem `role` nenhum** (`:515`), e é precisamente ela que mais
precisa de ser lida: é a que explica por que não dá.

### A forma exacta

> **`endereço · quem está lá · o lugar · o veredito`**

Quatro campos, separados por `·`, **sempre nesta ordem e sempre todos os que se
aplicam**. O endereço à frente pela razão que o `jogo` fechou em §5: quem tabula
ouve oitenta e seis nomes de casa seguidos, e **o endereço é o único campo que
muda sempre** — é a única ordem que deixa saltar.

| caso | o nome acessível |
|---|---|
| vazia, ao alcance | `K14 · no beco estreito · dá para chegar aqui — custa 4,5 m` |
| vazia, com o chão a cobrar | `K14 · no beco estreito, terreno difícil, cobertura +2 · dá para chegar aqui — custa 6,0 m` |
| **fora de alcance** | `K14 · no beco estreito · K14 fica a 12 m — o seu passo chega a 9. Vá até K11.` |
| ocupada | `K14 · Halvard, 12 de 18 PV · no beco estreito · Halvard está em K14 — dá para chegar a K13.` |
| parede | `K14 · pedra · K14 é pedra — do lado de cá chega-se a K12.` |
| você | `K14 · você · no beco estreito · você já está em K14.` |
| em mira | `K14 · no beco estreito · dá para fazer Bola de Fogo cair aqui` |
| o passo acabou | `K14 · no beco estreito · o seu passo acabou — K14 fica para o próximo turno.` |

### A lei que faz isto valer a pena, e ela é minha

> **O nome acessível não tem prosa própria. O último campo é, palavra por
> palavra, a `curta` de `RECUSAS_DO_PASSO`.**

Três razões, e a terceira é a que decide:

1. **O ouvido e o olho leem a mesma frase.** Quem ouve `K14 fica a 12 m — o seu
   passo chega a 9. Vá até K11.` e quem lê a linha do veredito recebem o mesmo
   texto, não duas redacções do mesmo facto.
2. **Uma tabela, um sítio para reescrever.** *Se é número, é tabela* — e uma
   frase de recusa é a coisa que mais se reescreve num jogo (o `jogo` já o disse
   em §6.3). Uma segunda redacção escondida num `aria-label` é uma segunda
   verdade que ninguém revê.
3. **A catraca dos 54 caracteres passa a proteger os dois canais de uma vez.**
   Sem esta lei, o teste garante a linha do veredito e **não garante nada** do
   que o leitor de tela diz.

*E o que o campo do veredito nunca faz: ficar vazio.* Hoje, quando a casa não é
alcançável, o `<title>` simplesmente acaba (`:511`) — e **silêncio lê-se como
"não há nada a dizer", não como "não dá"**. O terceiro campo diz sempre o que
acontece se ele agir ali, inclusive quando a resposta é não.

---

## 5. As peças consertadas — e a doença era a mesma nas três

### 5.1 · `A casa`: `o endereco` era camada, agora é propriedade — o pedido do par

O achado dele está certo e confirmei-o na fonte: `componentPropertyDefinitions`
expunha `o custo#18:0` e mais nada; `o endereco` era um `TEXT` chamado
`o endereco` dentro de cada variante, a nascer com `H12`.

**Feito:** `o endereco#112:0`, propriedade de texto, **ligada nas sete
variantes** (`18:31`). Ao lado de `o custo`, como os gémeos que sempre foram.

**E provado, porque ele pediu prova e a prova é o ponto:** instância real
(`112:3249`), escrita com `K14`, e depois **trocada de variante três vezes**:

| passo | variante | `o endereco` lido de volta |
|---|---|---|
| escrito `K14` | Sob o dedo | **`K14`** |
| trocou para *Mira* | Mira | **`K14`** |
| trocou para *Confirmando* | Confirmando | **`K14`** |
| voltou a *Sob o dedo* | Sob o dedo | **`K14`** |

Sobrevive. Antes, cada uma daquelas trocas devolvia `H12` — numa peça que troca
de variante **a cada toque**.

### 5.2 · A mesma doença estava em mais duas peças, e uma delas é pior

Fui conferir as vizinhas e achei o mesmo defeito em dois sítios, os dois meus:

- **`A regua`:** o rótulo era a camada `a letra` / `o numero`. **Numa peça de que
  há 18 instâncias por tabuleiro e cujo estado troca a cada tecla.** Se o
  `o endereco` de `A casa` era grave, este era pior: 18 rótulos a reverter para
  `H` de cada vez que a coluna acende. **Feito:** `o rotulo#115:0`, ligado nas
  seis variantes, e as camadas renomeadas para `o rotulo` nos dois eixos — um
  nome só, porque é uma propriedade só.
- **`A marca de borda`:** `o endereco` era camada nas oito variantes — **na peça
  cujo trabalho inteiro é carregar um endereço**. **Feito:**
  `o endereco#116:8`, ligado nas doze.

**A lição, e é para mim:** *num componente cujo texto muda por instância, texto
que não é propriedade é um override à espera de se apagar.* O `jogo` apanhou-a
numa peça; ela estava em três.

### 5.3 · `Consequencia` ganha o eixo `Largura` — e é isto que conserta o §0

**A causa de as cinco recusas transbordarem não era o comprimento das frases.**
Medido na peça: `Consequencia` *Forma=Linha* é **HUG nos dois eixos, com
`textAutoResize: WIDTH_AND_HEIGHT` e sem `maxLines`.** Ela **não sabe ser
estreita.** Não há como dizer-lhe "tu tens 344" — ela cresce até onde a frase
quiser, que foi exactamente o que o `jogo` viu acontecer a 606 px.

**Isto é o achado B de E1 a morder pela segunda vez.** Lá era o `Botao` sem eixo
de largura; aqui é a `Consequencia`. E1 declarou o item e não o pagou. **Pago-o
aqui**, e pago-o nesta peça e não no `Botao` por uma razão de segurança: as
variantes de hoje ficam **intocadas e continuam a ser o padrão**.

**Feito:** `Consequencia` 8 → **16 variantes** — *Tom* (4) × *Forma* (2) ×
**`Largura` (Cabe no conteudo · Ocupa a linha)**.

- **`Cabe no conteudo`** é o comportamento de hoje, byte a byte, e é o valor
  **por omissão**. *Nenhuma instância existente muda.* Foi a condição que E1
  pôs em 12.4 e que eu respeito aqui: *uma peça mudada em silêncio por baixo de
  uma composição é pior do que uma peça com espaço reservado.*
- **`Ocupa a linha`** é largura fixa (344 por omissão) com a frase em `FILL` e
  `textAutoResize: HEIGHT`: **ela quebra em vez de crescer.**
- e o ponto da `marca` passou a viver numa calha da altura de uma linha, para
  **ficar na primeira linha** quando a frase quebra, em vez de descer para o
  meio do bloco.

**Provado:** a recusa do caso comum — os **101 caracteres** que pediam 606 px —
numa instância real a 344: **duas linhas, 30 px de altura, largura 344.** Está na
página `Consequencia`, quadro `a prova da quebra — 101 caracteres em 344 px`.

**E o que isto muda na decisão do `jogo`, que é mais do que parece.** Ele recusou
pedir-me uma `Consequencia` de duas linhas porque *"custa 15 px, que o telefone
não tem"* e porque *"uma peça que só funciona num dos dois dispositivos é a mesma
doença"*. **A recusa dele estava certa para a peça que ele tinha — e a peça que
ele tinha era o problema.** O que existe agora não é uma variante de duas linhas:
é **uma peça que ocupa a largura que lhe derem e cresce só quando a frase não
cabe**. Uma linha no caso normal; duas quando a alternativa seria truncar.

**A tabela de duas colunas dele continua certa e continua a ser a primeira
defesa** — a `curta` é o que se escreve e o que a catraca guarda. O eixo novo é a
**rede por baixo**: no dia em que o jogador aumentar o texto do sistema, a razão
quebra em vez de ser cortada. *A razão nunca apaga* deixa de depender de ninguém
contar caracteres certo.

**E onde vêm os 15 px, no telefone, quando ela quebra.** Da tira *o que acabou de
acontecer* — que E1 pôs em **uma linha de 28 px** no telefone, e que é
**consulta**, não decisão. Uma recusa cortada a meio custa o turno; meia linha de
prosa a menos durante os segundos em que uma recusa está na tela não custa nada.
**E é reversível sozinha:** a recusa some, a linha volta.

---

## 6. O que eu decidi NÃO fazer

- **Nenhum dente novo no cruzamento da régua.** §1. A casa acesa já o diz.
- **Nenhuma peça nova nesta etapa.** Três conjuntos ganharam variantes e três
  ganharam propriedade; **zero peças nasceram**. Era a promessa do `jogo` (*"nenhum
  arquivo novo, nenhuma peça nova"*) e ela cumpre-se.
- **Não toquei no eixo `Largura` do `Botao`** (E1, achado B). Continua por pagar,
  e continua bloqueado pela mesma coisa: `A linha` compõe quatro instâncias dele
  e o `jogo` ainda não a reviu. **Mas a `Consequencia` mostra o caminho e o custo
  (8 → 16 variantes, zero instâncias mexidas), e isso derruba metade da objecção
  de E1** — que era o salto para 48 variantes. Fica item, agora com precedente.
- **Não desenhei o alcance do golpe medido a partir de uma casa onde o herói
  ainda não está** — o que o `jogo` avisou que a proposta ambiciosa dele me
  custaria. **De propósito: aquilo é peça para uma decisão que a pessoa ainda não
  tomou**, e peça feita para decisão não tomada é trabalho inventado (a regra de
  D4, que E1 já aplicou e depois pagou quando a condição caiu).

---

## 7. As armadilhas novas do Figma — duas, e a primeira apaga trabalho em silêncio

1. **`clone()` NÃO copia `componentPropertyReferences`.** Clonei oito variantes
   de `Consequencia` para lhes dar o eixo `Largura`; **as oito nasceram com a
   referência vazia**, de modo que `setProperties({"a frase#11:0": …})` corria
   **sem erro nenhum** e não mudava letra nenhuma. Descobri porque a prova da
   quebra devolveu `chars: 19` — o texto por omissão — em vez dos 101 que eu
   acabara de escrever. **É a armadilha mais perigosa que encontrei nesta
   biblioteca: ela não falha, ela ignora.** A regra: *depois de clonar uma
   variante, releia `componentPropertyReferences` e religue.*
2. **A leitura imediata a seguir a `setProperties` pode devolver o estado
   anterior.** A prova da quebra devolveu 15 px de altura na chamada em que foi
   escrita e 30 px na chamada seguinte. Prima da armadilha que `formas.md` já
   regista (*reler `characters` dentro do laço lê nós já mutados*). **Confira
   numa chamada nova, nunca na mesma.**

---

## 8. O que esta etapa deixa para as seguintes

- **para o `backend` (E2):** a `curta` de `RECUSAS_DO_PASSO` é lida **duas
  vezes** — pela linha do veredito e pelo `aria-label` da casa (§4). A catraca
  dos 54 caracteres protege as duas.
- **para o `frontend` (E3):** a grelha tem de virar `role="grid"` com
  `role="gridcell"` em **todas** as casas, alcançáveis ou não; sem isso o
  `aria-label` da casa impedida é ignorado. E o `<title>` sai.
- **para o `frontend` (E3), herdado e ainda por pagar:** `#141020` → `T.bg`; a
  união violeta de 0,6 → 0,7.
- **item do `desenho`:** o eixo `Largura` do `Botao` — agora com precedente e com
  o custo medido.
- **item do `desenho`, novo:** a régua em *Procurada* pede uma classe de
  movimento. E1 fixou `tv-regua-acende` em 90 ms para **um** acender; agora são
  dois degraus. **A decisão é que é o mesmo evento e a mesma duração** — 90 ms
  de `Repouso` para `Procurada` e 90 ms de `Procurada` para `Realçada` —, e a
  saída de `prefers-reduced-motion` continua a ser `animation: none`, que pousa
  no estado final em ambos os degraus. Não nasce classe nova.

---

## 9. Para a pessoa decidir — a proposta ambiciosa

### A régua deixa de ser a borda do campo e passa a ser **a régua do tabuleiro inteiro**

**O que ele vive hoje, e é o número mais feio desta fase inteira.** No telefone o
jogador vê **84 de 256 casas — 33 %.** E1 mediu-o, chamou-lhe remendo honesto e
ofereceu um segundo nível de leitura que obriga a **trocar de nível** para ver a
forma da luta. A régua, tal como está, **descreve só a janela**: começa em `F` e
acaba em `L`, e o que existe fora dela é uma dedução.

**A proposta: a régua mostra a planta toda, sempre, e a janela é uma marca
dentro dela.** As 18 colunas cabem nos 337 px da calha — a 18,7 px por coluna,
que é o `N = ⌈30/lado⌉ = 2` que E1 já calculou: **rotula uma sim, uma não, e a
letra nunca sai.** As sete colunas visíveis ganham um bloco de fundo em
`panelSoft`; as onze que não se veem ficam em `Repouso`. **O jogador passa a ver,
sem tocar em nada, que o campo vai de `A` a `R` e que ele está a olhar para
`F`–`L`.**

**Porque isto muda o que ele vive.** Porque a régua deixa de responder *"como se
chama isto que eu vejo"* e passa a responder **"o que existe que eu não vejo"** —
que é a pergunta que um campo de 33 % faz o tempo inteiro, e a única a que hoje
nenhuma parte da tela responde. **E é ela que torna a porta B utilizável a
sério:** escrever `R14` deixa de exigir fé em que a coluna `R` exista.

**Comprovado, pelos três caminhos:**

- **Medida.** 337 px de calha ÷ 18 colunas = 18,7 px, e o `N=2` de E1 diz que a
  etiqueta continua legível. **Custo em casas de campo: zero** — a calha já lá
  está, com a altura que já tem. É a mesma aritmética do §2: paga-se de folga.
- **Estudo citado.** É o *minimap* e é a *scrollbar* — dois padrões em que a
  posição da janela dentro do todo é desenhada **na mesma superfície** que já
  serve de eixo. E é literalmente o que E1 escreveu e não construiu: *"quem diz
  que há mais campo não é sombra nem gradiente: é a régua. Uma régua que começa
  em F conta que A–E existem."* **A proposta é fazer essa frase à letra em vez de
  por inferência.**
- **Experiência jogada — e é a que falta.** Não joguei isto. **Digo-o como o
  buraco que é**, e é a razão de a proposta ser da pessoa e não minha.

**O que o jogador teria de reaprender, e é por isso que é dela:** a régua deixa
de ser uma legenda e passa a ser **um controlo** — tocar numa coluna distante
leva a janela até lá. É um gesto novo numa coisa que hoje não se toca, e gesto
novo é fluxo.

**O risco, dito por mim.** Uma régua que mostra 18 colunas quando o campo mostra
7 **deixa de bater casa a casa com o tabuleiro** — e o alinhamento da letra com a
coluna por baixo dela é a coisa que faz uma régua ser lida sem esforço. É uma
troca real: *saber que existe mais* contra *ler o que está à frente sem pensar*.
**Não a resolvo com desenho: resolve-se jogando**, e é a medida que E3 tem de
fazer.

---

## 10. O que ficou feio, e o que eu não soube

**Feio.**

- **O grau *Procurada* distingue-se de *Realçada* por cor, e só por cor, dentro
  da régua.** O terceiro canal existe (a casa acende), mas **está noutro sítio da
  tela**. É defensável e está defendido em §1; não é elegante.
- **`Consequencia` tem agora 16 variantes para resolver um problema que era de
  uma.** O eixo `Largura` só interessa de facto às quatro *Linha*; as quatro
  *Balão* ganharam-no por completude do conjunto, que é uma exigência do Figma e
  não uma necessidade do desenho.
- **A tira de *o que acabou de acontecer* paga os 15 px da recusa que quebra**
  (§5.3), e ela já era a região de que E1 tinha menos certeza. **A região mais
  frágil da tela é a que eu escolhi para absorver o pior caso de outra.**

**Não soube.**

- **Se 350 ms é o tempo certo para a linha do veredito esperar a mão parar.** O
  `jogo` disse que o número é de ofício; eu não o melhorei. Continua por medir, e
  é medida de gente a escrever, não de peça.
- **Se o `I` serifado e o zero pontuado do JetBrains Mono do Figma batem com os
  do navegador.** É o elo que sustenta a escolha do mono desde E1, e **continua
  por medir** — reconferi que o Figma não oferece peso 600, e é o mesmo tipo de
  divergência.
- **Se `Procurada` se lê num telefone ao sol.** `ink` contra `inkDim` são 15,31
  contra 6,62 — a conta diz que sim com folga enorme. A conta é feita para um
  ecrã a 100 % de brilho num quarto, que não é onde se joga no telefone.
- **Quanto do quadro do §1 sobrevive ao campo a rolar.** Os três painéis mostram
  a régua presa à janela com a janela parada. **O que acontece à coluna
  *Procurada* quando o campo rola e o `K` sai da janela** é a pergunta seguinte,
  e a resposta provável é a marca de borda — mas não a desenhei.

---

*Fase E2 · `desenho` · 15/09. O par é o `jogo`, que fechou o momento em
`mente/e2-jogo.md`.*
