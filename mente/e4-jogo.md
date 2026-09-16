# E4 · mover é fazer — as quatro aberturas, decididas

**Ciclo E4, `jogo`, 16/09/2026.** Duas lutas jogadas de ponta a ponta no
navegador, em aba nova — uma em 1280×860 (Torneio, A Muralha contra O Punho,
planta `cidade` 14×14) e outra em 375×812 (A Muralha contra O Voto, a mesma
planta). Mais uma leitura pura das dez plantas de `grid.js` em Node, que é de
onde vêm os dois números que decidem este documento. **Nenhum ficheiro de
código tocado; nada commitado; `VERSAO` intacta.**

**Os espaços de save:** as cinco chaves foram copiadas para `__e4_backup__*`
antes de qualquer coisa e repostas no fim **com o jogo desmontado**
(`/cenas/abissal.webp`, mesma origem, sem React montado), conferidas uma a uma
— ver §8. **`taverna_save_v1` (a campanha, 139 481 caracteres) nunca foi
tocada.**

**O Figma:** arquivo `Taverna — biblioteca` (`e5wJUzInAssoebx5npssKc`), página
**`A batalha`**, seis quadros novos — `166:3750`, `166:3752`, `166:3754`,
`166:3756`, `167:4916`, `168:4594` — mais o quadro escrito `169:4040`. Tudo
montado com peças que já existiam na biblioteca; **nenhuma peça desenhada por
mim** (o que faltou está pedido ao `desenho`, §6).

---

# 1 · O custo dentro da casa — e a medida que mudou o que eu ia escrever

A lei de E1 já estava escrita e eu vim para a confirmar: *o custo nasce escrito
dentro da casa já em «Alcançável», em mono 10 px; o endereço só nos dois
estados que já carregam texto.* Ia confirmá-la por obediência. **Confirmo-a por
medida, e a medida é melhor do que a lei.**

**Como o motor cobra um passo** (`grid.js:471-544`, lido, não suposto): busca
em largura de oito direcções, **1 quadrado por casa, 2 em terreno difícil**,
parede e corpo bloqueiam. Numa planta de chão liso, portanto, **o custo de uma
casa É o anel de Chebyshev em que ela está** — exactamente o que o olho conta
de graça ao olhar para uma grelha.

Então corri as dez plantas com o herói na casa de abertura
(`grid.js:569-575`) e 9 m de passo, e comparei o custo real com o que o olho
lê:

```
taverna     12× 9 | difíceis   0 | alcançáveis  83 | custo ≠ olho:  0   (0 %)
masmorra     7×18 | difíceis   0 | alcançáveis  48 | custo ≠ olho:  0   (0 %)
floresta    16×16 | difíceis  80 | alcançáveis  27 | custo ≠ olho: 27 (100 %)
estrada     18×12 | difíceis  54 | alcançáveis  38 | custo ≠ olho: 38 (100 %)
cidade      14×14 | difíceis   0 | alcançáveis  90 | custo ≠ olho:  0   (0 %)
caverna     14×14 | difíceis  56 | alcançáveis  27 | custo ≠ olho: 27 (100 %)
ruína       16×14 | difíceis  64 | alcançáveis  27 | custo ≠ olho: 27 (100 %)
navio       10×16 | difíceis   0 | alcançáveis  69 | custo ≠ olho:  0   (0 %)
gelo        16×16 | difíceis  80 | alcançáveis  27 | custo ≠ olho: 27 (100 %)
deserto     18×14 | difíceis  72 | alcançáveis  27 | custo ≠ olho: 27 (100 %)

TOTAL: 1990 casas · 406 difíceis (20 %) · 463 alcançáveis somadas
       173 com custo ≠ distância do olho = 37 %
```

Há **duas** leituras aqui e as duas importam.

**A primeira: não há meio-termo.** Quatro plantas dão **0 %** e seis dão
**100 %**. Não existe a planta onde o número dentro da casa é «às vezes útil» —
ou ele confirma o que o olho já sabe, ou ele é o **único** canal que existe. E
como o jogador não sabe em que planta está antes de a ver, **a regra só serve
se for a mesma nas duas**. É isto que salva a lei de E1 da acusação de
planilha: não é decoração nas quatro, é a única forma de ela existir nas seis.

**A segunda, e é a que ninguém tinha visto:** nas seis plantas de chão que
cobra, **o herói abre DENTRO da lama**. A última fila é a região `dificil` —
`no matagal fechado`, `nas dunas`, e as outras quatro. O passo dele cai de
**~83 casas para 27** logo no primeiro fotograma, e o único sinal disso na tela
é o véu ser mais pequeno.

> ### O jogador paga metade do passo em 6 de 10 lutas, todas as lutas, e a tela nunca lhe diz que está a pagar. O véu diz-lhe *quanto* sobrou; não diz *que foi cobrado*.

E o erro, quando existe, não é aleatório: é **sempre um anel**. Quem conta
quadrados erra por **1,5 m** — que é exactamente a diferença entre *«ao
alcance»* e *«faltam 1,5 m»*, isto é, entre bater e não bater.

**A decisão, composta em `166:3750`:**

- **O custo nasce em `Alcançável`.** Não sob o dedo. Quem pousa o dedo numa
  casa **já escolheu**; quem precisa do número é quem ainda está a escolher, e
  esse está a olhar para o conjunto inteiro. Um custo que só aparece sob o dedo
  obriga a visitar 83 casas para comparar duas.
- **O endereço continua só em `Sob o dedo` e `Confirmando`**, como E1 mandou —
  e agora com razão dita: o endereço **não decide nada**. Decide-se pelo preço.
  83 endereços acesos é a planilha; 83 preços é o mapa.
- **A casa do herói e as casas fora do passo ficam mudas**, e a mudez é a
  informação. *O que é alvo tem o custo escrito dentro; o que não tem nada
  escrito dentro não é alvo.*

**A peça já existe inteira:** `A casa` (`18:31`) tem `o custo#18:0` com
omissão `"4,5"`, `o endereco#112:0`, `com foco#164:0` e os oito estados. **Esta
abertura não pede peça nenhuma ao `desenho` — só composição.**

---

# 2 · O alvo é a CASA. Nunca a ficha. E a ficha continua sem toque.

O pedido dizia *«mirar um inimigo é tocar a ficha, tocar a casa dele, ou os
dois?»*. **É a casa, e os `pointerEvents: none` da ficha ficam como estão** —
não por conservadorismo, por aritmética.

| | mede | contra o piso de 48 de K4 |
|---|---|---|
| a ficha (`r = lado × 0,40`, `grade-de-batalha.jsx:215`) | **38,4 px** | **abaixo** |
| a casa | **48 px** | **é o piso** |
| a criatura grande (4 casas) | **96 × 96 px** | duas vezes o piso |

Dar toque à ficha seria **pôr dois donos no mesmo pixel** e deixar uma costura
morta de ~5 px entre a borda do círculo e a borda da casa. E seria fabricar,
para a mesma acção, um alvo que a própria casa acabou de declarar pequeno
demais em K4. *Uma acção, uma forma.*

**A retícula que W1 fabricou já vive na casa, não na ficha** — `A casa ·
Estado=Alvo · 125:177`, quatro cantos de 2 px nos **11,4 px** de canto que o
arco da vida deixa livres, com **5,7 px de folga medidos** (W1, `formas.md`
§«Os quatro cantos»). A peça e a decisão chegaram ao mesmo sítio por caminhos
diferentes.

**E a criatura grande é UM alvo, não quatro.** Medido vivo hoje: o
`aria-label` já nomeia `O Punho` em **quatro** casas. Logo o alvo é o bloco.

## A metade que ninguém tinha dito: armar apaga o véu

Composto lado a lado em `166:3752`, e é a parte de que tenho mais certeza:

> **Armar um verbo de criatura APAGA o véu do passo.** O campo passa de *«onde
> posso parar»* para *«em quem posso bater»* — e **essa troca é o feedback do
> armado**, sem letreiro nenhum.

A razão é a que W1 já tinha escrito e que a construção ainda não usou: *o
conjunto do passo é de CASAS e é grande; o conjunto de um verbo de criatura é
de CRIATURAS e é minúsculo.* 83 casas âmbar e 1 alvo âmbar ao mesmo tempo
seriam **uma cor a dizer duas coisas**. E é de graça: os dois conjuntos já
vivem separados no código (`podeIr` × `noAlcance`, `grade-de-batalha.jsx:736`).

## Os toques, aplicando W1 a um alvo que é gente

| | |
|---|---|
| **1 toque** | um inimigo só → `Atacar` dispara direto *(medido vivo em E3: já funciona)* |
| **2 toques** | **verbo → alvo:** armar `Atacar` acende as casas dele; tocar uma resolve |
| **2 toques** | **alvo → verbo:** tocar a casa dele sem nada armado deixa na barra só os verbos que o alcançam, e a linha do veredito escreve o preço de cada um **antes** de qualquer escolha |

O comutativo de W1 fica cumprido, e o tecto de 3 toques nunca é atingido.

---

# 3 · O roving tabindex — e o número não é o que eu esperava medir

Fui contar as tabulações e trouxe outra coisa.

| medido hoje, `Tab` real, do topo da tela da luta até `Atacar` | |
|---|---|
| planta `cidade` 14×14, **passo cheio** | **84 paragens** |
| **a mesma luta**, depois de gastar o passo | **1 paragem** |
| planta `navio` 10×16, passo cheio *(E3)* | 69 paragens |
| as dez plantas, na casa de abertura | **28 a 91** |

> ### A distância até ao verbo não é longa — é IMPOSSÍVEL DE APRENDER.

Ela é o tamanho do conjunto alcançável, e o conjunto alcançável muda a cada
passo, a cada planta e a cada rodada. **Na mesma luta, na mesma tela, ela foi
84 e depois 1.** Ninguém forma o hábito *«Atacar fica a N tabulações»* quando
N nunca é o mesmo duas vezes. Não é fadiga de dedo: é que **a tela não tem
geografia estável para quem usa teclado**.

**O que muda:** a grelha passa a ser **uma** paragem, com as setas a andar por
dentro — o padrão `grid` da WAI-ARIA, que W1 já assumiu ao pôr `role="grid"` /
`role="gridcell"` nas 196 casas. Falta-lhe só o cursor.

**O número que eu espero depois, e é a catraca:**

> **paragens de tabulação entre o topo da tela da luta e `Atacar` = 2,
> variância = 0** — nas dez plantas, com o passo cheio e com o passo gasto.

**E o que ele compra, que é jogo e não conformidade.** Hoje o `Tab` anda pelo
conjunto alcançável **em ordem de DOM**, que é linha a linha sobre o tabuleiro
inteiro: da casa onde está, o `Tab` seguinte pode cair cinco casas ao lado.
Quem joga de teclado **não tem como dizer «a casa à minha esquerda»** — tem uma
lista, não um mapa. Com as setas por dentro ele ganha o que o rato sempre teve:
**um cursor que anda uma casa de cada vez sobre um mapa**. Isto não é o
tabuleiro ficar acessível; é o tabuleiro passar a ser **jogável** de teclado.

*(Composto e medido em `167:4916`.)*

---

# 4 · A decisão do telefone — e ela não é «gaveta ou não»

Medido no primeiro fotograma, 375×812, planta `cidade` 14×14:

| | |
|---|---|
| a tira de consulta | **y 48 → 192 = 144 px** (duas `A ficha curta` empilhadas) |
| a faixa da vez | y 208 → 260 |
| **a janela do campo** | **343 × 296** = 6,17 filas × 7,15 colunas |
| **casas inteiramente visíveis** | **30 de 196 = 15 %** |
| a régua, com `👣 9 de 9 m` e `⤢ ampliar` | **y = −198 e −215 — fora do ecrã, no primeiro fotograma** |
| a rolagem de entrada | `scrollTop 497`, `scrollLeft 193` — centra o herói |
| o inimigo, na entrada | **fora da janela** |

Duas notas antes da decisão. **A primeira é um elogio:** E3 abriu a luta sem se
ver a si próprio, e isso está **consertado** — hoje a rolagem centra o herói
(medido `scrollTop 497`, contra o `0` de E3). **A segunda é o preço do
conserto:** centrar o herói num campo de 6 filas **empurra o inimigo para fora
e leva a régua com ele**. *Ver-me passou a ser deixar de ver o ogro* — e agora
é por construção.

## A decisão: a tira não vira gaveta. É desfeita.

E a razão é que **ela nunca foi decidida — foi construída.**

**Os 144 px não existem em desenho nenhum.** O quadro do telefone de E1
(`40:447`, no Figma desde 15/09) tem: faixa da vez **48** + **campo 548** +
veredito 24 + verbos 144 + **tira do herói 44** + folga 4 = 812. A tira do
herói de E1 é **uma linha** com `você · PV 17/20 · PM 4/6 · 9 m`, no arco do
polegar. **A construção empilhou duas `A ficha curta` — que é peça de 288×150,
peça de MESA — no topo, e ficou com 296 px de campo.**

**A carga, item a item — e é por aqui que se decide, não pela altura:**

| o que a tira carrega | tem outra casa no ecrã, no mesmo instante? |
|---|---|
| `A Muralha` — o meu nome | **sim** — está na minha ficha do campo, rotulada «você» |
| `O Voto` — o nome dele | **sim** — na ficha dele e na linha do veredito |
| `18 m` — a distância | **sim, e pior:** a linha do veredito diz `a 18 m — faltam 16,5 m` |
| **PV 36/36** (meu) | não — **fica** |
| **PM 12/12** | não — **fica** |
| **⚔ ação · ✦ extra** | não — **fica** |
| **PV 28/28** (dele) | só como **arco** à volta da ficha a 48 px: lê-se como fracção, nunca como número — **fica** |

**Três de sete são cópias do que está no ecrã no mesmo instante.** Uma tira
43 % duplicada não se esconde numa gaveta: **esvazia-se.**

**O que isso devolve, contado:**

```
tira 144 → 24 px          faixa da vez 68 → 48 px (o número de E1)
campo 296 → 436 px = 9,08 filas
casas inteiras 30 → 48    de 15 % para 24 % do tabuleiro = +60 %
```

**E o tecto, dito por escrito antes que alguém o descubra por mim: 24 % ainda
não é um tabuleiro.** Os outros 76 % pedem `ESCALA_DA_CASA`, que é a proposta
de E3 e **está com a pessoa** — não a toquei nem por metade. Esta decisão é o
que dá para fazer sem ela, e é honestamente **metade do caminho**.

*(Composto lado a lado em `166:3754`.)*

---

# 5 · Onde vive o número que a pílula esconde

`mecanicaDe` (`condicoes.js:353`) devolve **sete** campos que mexem num número.
A fila de pílulas (`App.jsx:21576-21606`) desenha **quatro** — e os quatro
estão **fora da luta**, porque a tela da batalha esconde o HUD inteiro (E3
§4.1: onze botões visíveis, os onze da luta).

| campo | pílula | na tela da luta |
|---|---|---|
| `vantagem` / `desvantagem` | 🎲 | **nenhuma** |
| `perdeAcao` | ⛔ sem ação | **nenhuma** |
| `danoTurno` | −N PV/turno | **nenhuma** |
| `danoExtra` | +N dano | **nenhuma** |
| `defesa` | — | **nenhuma** |
| **`danoReduzido`** | — | **nenhuma** — e é o que H4 acabou de pagar para contar certo |
| **`danoRecebidoExtra`** | — | **nenhuma** |

E as duas condições que isto silencia:

- **`Enfraquecido`** (💧, `danoReduzido: 2`) — a pílula 🎲 aparece porque ele
  também dá desvantagem; **o −2 no dano que ele causa não aparece em lado
  nenhum.**
- **`Marcado`** (🔻, `danoRecebidoExtra: 2`, **e mais nada**) — nenhuma pílula
  mecânica existe para ele. O único canal é o `title=` da própria condição, que
  é **balão de rato**. **No telefone, um jogador com `Marcado` carrega uma
  condição cujo conteúdo mecânico inteiro é ilegível.**

## Ele vive na TIRA DO HERÓI, e é ali por três razões

`você · PV 36/36 · PM 12/12 · 9 m · −2 dano · +2 sofrido │ O Voto 28/34`

- **Não na linha do veredito.** Ela responde *«o que acontece se eu agir
  AGORA»* e tem tecto de 54 caracteres que quatro frases fabricadas já
  apertam. Um modificador **permanente** não é um acontecimento; pô-lo ali faz
  a linha deixar de ser sobre este clique.
- **Não no selo.** O selo é **identidade**, e E3 mediu que ele não muda uma vez
  em quatro rodadas. *Número que muda não mora em região que não muda.*
- **Na tira do herói**, porque é a única região da tela da luta que já responde
  *«como é que eu estou»* — **e porque é a região que a decisão do telefone
  acabou de comprar de volta.** O número chega onde já havia sítio para ele.

**A catraca, e é exacta:** *o conjunto de campos desenhados = o conjunto que
`mecanicaDe` devolve, menos `motivos`.* Hoje são 4 de 7, e os 4 estão fora da
luta. *Um número que o motor calcula e a tela esconde é a lei desta casa a
valer só de um lado.*

*(Composto em `166:3756`.)*

---

# 6 · O que pedi ao `desenho` — a lista de peças

Cinco, e cada uma com o porquê. **Nenhuma delas foi desenhada por mim.**

1. **`A casa · Estado=Alvo` · variante «alvo composto».** Hoje a retícula
   desenha-se **por casa**: numa criatura de 2×2 saem **quatro** retículas
   onde devia sair **uma**, nos cantos da criatura. Visível no meu próprio
   quadro `166:3752` — foi ao compor que eu vi.
2. **A tira do herói — uma linha, 44 px.** E1 desenhou-a dentro do quadro do
   telefone (`40:447`) e **ela nunca virou peça da biblioteca**. Precisa de
   dois campos que E1 não previu: **os modificadores do motor** (§5) e **a
   vida do adversário em número** (§4).
3. **O contorno de dentro** (a proposta ambiciosa, §7) — de onde, depois de
   chegar, o golpe **ainda** alcança. Segundo traço por cima do que já existe,
   e **nunca da mesma cor do de fora**.
4. **`A casa · Alcançável` em terreno que cobra.** O número é o mesmo; o que
   muda é que **ali ele é o único canal** (§1). Se o `desenho` achar que a
   lama precisa de marca própria por cima da hachura que já existe, a marca é
   dele — eu só trago a medida de que ela é invisível hoje.
5. **A grelha como uma paragem — o estado do cursor de teclado.** `Foco` já
   existe; falta o estado da casa que é a **posição lembrada** do cursor
   quando o foco está noutro sítio. Sem ele o roving tabindex não tem forma.

---

# 7 · A proposta ambiciosa — o tabuleiro passa a ter DOIS contornos

**Medido hoje, nas dez plantas, no meio da luta** (herói a 9 m de um inimigo
grande, 9 m de passo): de todas as casas onde ele pode terminar o passo,
quantas são casas de onde o golpe **ainda alcança**?

```
taverna   12/79 (15%)   masmorra  8/65 (12%)   floresta 4/52 (8%)
estrada    4/38 (11%)   cidade    8/99  (8%)   caverna  4/45 (9%)
ruína      4/45  (9%)   navio     8/85  (9%)   gelo     4/52 (8%)
deserto    4/45  (9%)

TOTAL: 605 alcançáveis · 60 úteis = 10 %. Nenhuma planta passa de 15 %.
```

> ### Noventa por cento do campo âmbar são casas onde eu chego e o turno acaba. A tela desenha 545 decisões que são a mesma decisão.

**A proposta:** o conjunto do passo deixa de ter **um** contorno e passa a ter
**dois**. O de fora é o de hoje — *onde posso terminar o passo*, o **legal**. O
de dentro é novo — *de onde, depois de chegar, o golpe ainda alcança*, o
**útil**. Entre os dois: *chego, e o turno acaba*.

**A prova, pelos três caminhos:**

1. **Medida** — os 10 % acima.
2. **Experiência jogada** — E3 fez **zero** decisões espaciais numa luta
   inteira. Eu fiz **uma**, repetida: *«ir o mais longe que der»*. E é a
   decisão certa, **sempre**, porque a borda de fora do conjunto custa
   exactamente o mesmo que a de dentro e nada na tela distingue *chegar* de
   *chegar e bater*.
3. **A lei desta casa, aplicada ao único verbo que ainda não a cumpre** — *o
   veredito antes do clique*. O golpe mostra o preço. A reacção mostra o preço.
   **O passo mostra só a legalidade** — «dá para chegar aqui» — e cala a
   consequência, que é a única coisa que se está a decidir. *Oitenta e três
   casas desenhadas iguais não são oitenta e três escolhas: são um campo.*

**Peso: pesado** — muda o que o jogador **lê** no campo, e é dele a decisão.
**Não depende do motor:** `alcanca()` já responde à pergunta casa a casa — foi
assim que este número foi medido. **E não toca** nas duas propostas de E3 que
estão com a pessoa (`TIPOS` e `ESCALA_DA_CASA`).

*(Composto em `168:4594`.)*

---

# 8 · A condição que não fechou, e o que a tela faz então

**Não fechou.** Reproduzido hoje, telefone, planta `cidade`, rodada 1, **sem
agir**:

```
H14 → H11 → H8 → I8   = 7 casas = 10,5 m numa só rodada
👣 9 de 9 m nesta rodada     — parado em TODOS os passos
conjunto alcançável          83 → 122 → 153 → 143   (cresce)
```

E há uma pista que vale ao `backend`: **o código do débito está certo.**
`App.jsx:14614-14636` calcula `sobra = restante − chk.custoM` e escreve
`{ ...eco, movM: sobra }`. **O que chega à régua não é ele** — `passoDaBatalha`
(`:20804`) cai no valor por omissão `pp.metros`. Não diagnostico mais do que
isto: é do motor.

## O que a tela faz se continuar de graça — decidido, e é o item 5 do relato

**O custo dentro da casa CONTINUA.** Ele é verdade sobre **um** passo:
*«chegar aqui custa 4,5 m»* é exacto mesmo num mundo onde a rodada não soma.

**O que NÃO pode nascer é o denominador.** Nada na tela deve escrever
*«4,5 dos seus 9»*, *«sobra 4,5»* nem forma nenhuma de total — porque **o total
é que é a mentira**. E a segunda linha do estado armado deixa de dizer *«9 m
nesta rodada»* e diz só *«toque a casa onde quer parar»*.

> **Um preço unitário verdadeiro pode viver sem orçamento. Um orçamento falso
> não pode viver de todo.**

---

# 9 · Dois defeitos apanhados a jogar, e são desta mesa

**9.1 · `Mover` arma com o conjunto vazio.** Com 0 m de passo o verbo aceita o
toque, fica `aria-pressed="true"`, e a linha do veredito escreve *«toque a casa
onde quer parar · toque o verbo outra vez para desistir»* — **e não há casa
nenhuma para tocar** (medido: `clicáveis: 0`). A linha que E3 elogiou como o
melhor da tela é, neste estado, a que mente.

**A regra:** *verbo cujo conjunto armado é vazio não arma, e a linha diz
porquê.* O número já existe no render (`podeIr.size`), e o caso vai passar a
ser **comum** no dia em que o passo debitar — que é o dia seguinte ao do pedido
de §8.

**9.2 · Quando o passo acaba, o campo perde todos os alvos de toque** e a tela
inteira fica com **12** elementos focáveis. Para o rato isso está certo. Para o
teclado é **a prova viva** do porquê de §3: a geografia desaparece inteira, e
`Atacar` salta de 84 tabulações para 1 sem nada ter mudado de sítio.

**Duas coisas boas, ditas por justiça:** `Atacar` deixou de ser `disabled` e
passou a `aria-disabled` — **continua na ordem de tabulação**, que era a
queixa de E3 §2. E o `⤢ ampliar` mede hoje **48 px** (era 68×19). As duas
correcções de K4/E3 estão vivas. *O `⤢` continua a sair do ecrã com a régua —
mas isso agora é §4, não é dele.*

---

# 10 · Os espaços de save

| chave | antes | depois de jogar | reposta |
|---|---|---|---|
| `taverna_save_v1` (**a campanha**) | 139 481 | 139 481 | 139 481 — **nunca tocada** |
| `taverna_rapida_v1` | 30 119 | 26 582 | **30 119** ✓ |
| `taverna_mesa_ARENA7` | 10 577 | 10 577 | 10 577 |
| `taverna_mesa_ARENAA` | 2 817 | 2 817 | 2 817 |
| `taverna_cfg_rolagens` | 1 | 1 | 1 |

Reposição **com o jogo desmontado** (`/cenas/abissal.webp`, mesma origem, sem
React montado), pela lei do autosave. As cinco cópias `__e4_backup__*` e o
`__e4_manifesto__` foram apagados; o `localStorage` terminou com exactamente as
cinco chaves originais, conferidas uma a uma, comprimento a comprimento.

---

# 11 · O que fica por decidir — honesto

- **Onde vive o denominador do passo** quando o passo passar a debitar. A régua
  sai do ecrã no primeiro fotograma do telefone (medido: `y = −198`), logo o
  `👣` **tem** de sair dela. Se vai para a tira do herói (onde E1 o pôs) ou
  para a segunda linha do estado armado, **não decidi** — depende de o motor
  fechar primeiro, e decidir antes seria escolher a casa de um número que ainda
  não existe.
- **A marca de borda fica composta e não montada.** `turnoDosInimigos` continua
  a deitar fora o `onde`; o pedido está aberto desde o começo do ciclo. A peça
  (`A marca de borda`, `53:43`, 8 variantes) está pronta desde E1 e fica pronta
  para o dia em que houver dados.
- **Se o contorno de dentro deve existir para os verbos que não são o golpe**
  (`Empurrar`, `Derrubar`). Medi só o golpe. Com seis verbos, seis contornos
  seria exactamente o defeito que esta etapa passou o ciclo inteiro a evitar —
  mas responder «só o golpe» sem medir os outros também é escolher no escuro.

---

# 12 · A armadilha de instrumento deste ciclo

**Jogar enquanto a outra mão constrói custa a sessão.** O `oficial` tinha o
bastão do `App.jsx` (tomado às 18:05Z, um minuto antes de eu abrir o jogo) e
salvou a meio da minha segunda rodada: **o HMR recarregou a aba de volta ao
menu e a luta perdeu-se**, com uma medição por acabar. Não é defeito de
ninguém — é o preço de duas mãos na mesma árvore, e a lição é de método:
**meça em lotes fechados.** Toda medição que precise de mais de uma chamada de
ferramenta deve caber numa só, porque entre duas chamadas cabe um `save` do
vizinho. Foi assim que as medições de §1, §3 e §4 sobreviveram, e é por isso
que a de §8 foi refeita três vezes.
