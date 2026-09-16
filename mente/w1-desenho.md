# W1 · a frase que se monta — o lado do desenho

**Fase W, etapa 1.** O `jogo` compõe o momento; este documento é a **forma**: o
verbo que se arma, o alvo que não é casa, o preço antes do clique, a desistência
que não é muda, e o que substitui o `hover` num jogo que se joga com o dedo.

**Nada de código.** Nenhum `.js`, `.jsx` ou `.mjs` foi tocado. O que se lê aqui
saiu de medir a peça real no Figma, de ler o código de hoje e de contar
caracteres um a um.

**O par corre em paralelo e não nos vemos.** Onde a minha decisão tocou a
composição, ela está escrita como **pedido ao `jogo`** (§9) e não como decreto.

---

## 0. Três coisas que eu fui conferir e estavam erradas — e uma delas é minha

### 0.1 · A casa *Alcançável* não tinha a borda que a decisão diz que ela tem

`formas.md` fechou, no desempate da borda × contorno: *Alcançável* é **banho
`amber` a 10 % MAIS borda `amber` a 55 %**, e a frase que encerra o item é
literal — ***"quem passa a régua do WCAG é a borda por casa, não o contorno"***.

Fui à peça. **`A casa` *Estado=Alcançável* (`18:7`) não tinha borda nenhuma.**
Só o banho. Medido:

| o que a casa alcançável tinha | medido | piso 1.4.11 |
|---|---|---|
| o banho `amber` 10 % sobre `bg` | **1,151:1** | **REPROVA** |
| a borda `amber` 55 % — que não existia | 3,406:1 | passaria |

**A peça que a mesa inteira citou como "a que passa a régua" era a única marca
da tela que não passava régua nenhuma.** É o meu defeito, é de E1, e sobreviveu
a E2 porque toda a gente leu a decisão em vez de abrir a peça.

**Reposta** — e reposta como **nó a 0,55**, nunca como alfa na tinta, que é a lei
desta peça paga em cinco tentativas (D4/E1: *alfa na opacidade do nó; na tinta
não* — alfa na tinta faz o render sair chapado e a leitura devolver o número
certo, que é o pior tipo de defeito). Nó `a borda`, 48×48, canto 3, traço 1 px
INSIDE, `opacity = 0,55`, conferido de volta numa chamada nova.

### 0.2 · As frases do veredito de hoje não cabem no teto que E2 instalou

E2 fixou **54 caracteres** para a linha do veredito (6,0 px/caractere, medido
doze vezes; útil = largura − 10; a lateral de 1280 é o lado estreito, com 55).
Fui contar as frases que o `App.jsx` imprime **hoje**:

| a frase de hoje | caracteres | px | veredito |
|---|---|---|---|
| `Ninguém de pé ao seu alcance.` | 29 | 174 | cabe |
| `Há parede no caminho até Halvard — contorne.` | 44 | 264 | cabe |
| `Halvard a 3 m — dentro dos seus 9 m de alcance.` | 47 | 282 | cabe, com 7 de margem |
| **`Longe demais — Halvard a 3 m, faltam 1,5 m. Aproxime-se primeiro.`** | **65** | 390 | **+11** |
| `Capitão dos Bandidos a 3 m — dentro dos seus 9 m de alcance.` | **60** | 360 | **+6** |
| **`Longe demais — Capitão dos Bandidos a 12 m, faltam 3 m. Aproxime-se primeiro.`** | **77** | 462 | **+23** |

Três coisas saem daqui, e a terceira é a que manda.

1. **`recusaDoGolpe` transborda sempre** (`App.jsx:1126-1131`) — 65 caracteres
   com o nome mais curto que existe na mesa. Não é um caso de borda: é o caso
   comum, porque **10 de 10 plantas recusam o ataque no turno 1** (medição de X1,
   no cabeçalho de `golpe.js`). *A frase que mais aparece no jogo é a única que
   não cabe.*
2. **O teto não é função da frase: é função do NOME.** `linhaDoGolpe` cabe com
   `Halvard` (7) e transborda com `Capitão dos Bandidos` (20). Nenhuma revisão de
   redacção conserta isso, porque o nome não é redacção — é conteúdo do mundo.
3. Em código nada trunca hoje (é um `<div>`, e `<div>` quebra). **O defeito não é
   truncar: é a linha do veredito pedir duas linhas sem que ninguém tenha
   decidido que ela tem duas.** O teto de 54 existe exactamente para que ela não
   peça. Ver §4, onde a segunda linha passa a ser desenho em vez de acidente.

### 0.3 · `formas.md` diz duas coisas diferentes sobre onde vive a linha do veredito

- `:2405` — *"uma `Consequencia` fixação=Linha, **colada sob a fileira**"*
- `:2501` — *"a reação mora na linha do veredito, **a faixa entre o campo e os
  verbos**"*
- `:2637` — a ordem de tabulação de E1: *de quem é a vez → **o campo** → *o
  veredito* → **os verbos***

**Duas das três dizem o mesmo, e a ordem de tabulação desempata sozinha**, porque
a ordem do DOM é a ordem visual (lei de E1, WCAG 2.4.3). **A linha do veredito
fica ENTRE o campo e os verbos**, e fica lá por uma razão que nenhuma das três
frases dá e que é a que interessa no telefone: **ela fica ACIMA do ponto de
toque dos verbos**, que é a regra da Apple HIG para o dedo (*Adjusting for the
finger*: o feedback vai onde a mão não tapa). Ver §6.

---

## 1. A forma do verbo armado — decisão 1

### A pergunta: eixo novo ou estado novo?

**Nem um nem outro à primeira. A resposta saiu de uma medida, e a medida derrubou
a minha primeira resposta.**

**Primeiro: `Armado` não pode ser um `Papel`.** Tentei-o — é o que K1 fez em
`O verbo com preço` (`Papel=Armado`). Aqui não dá, e o número diz porquê:

| | `Papel=Chamada` | `Papel=Gesto` |
|---|---|---|
| corpo | 53 px | 44 px |
| a variante inteira | 97×74 | 78×63 |

**Se `Armado` fosse `Papel`, o `Atacar` (Chamada) encolheria 9 px de altura e
19 px de largura no instante em que o jogador o armasse** — e empurrar leiaute
com o dedo a caminho do tabuleiro é exactamente o defeito que E1 já pagou uma
vez (*Impedido* era 19 px mais alto e empurrava o campo). **`Estado` preserva a
geometria do `Papel`; `Papel` não preserva nada.** Logo: **`Armado` é `Estado`.**

**Segundo: não é eixo.** Um eixo `Armado: sim/não` leva `Botao` de 24 a **48
variantes** — acima do teto de 30 que já recusou o eixo *Largura* — e, pior,
**fabrica variantes impossíveis**: `Armado × Impedido` e `Armado × Esperando`
não podem existir, porque *o verbo armado é, por definição, o que já passou pelo
filtro que o deixaria impedido*. É a lei que K1 escreveu ao recusar
`Armado×Impedido`: ***variante que não pode acontecer é export morto com outra
roupa.*** Um valor no eixo `Estado` não fabrica nenhuma; um eixo fabrica quatro.

### A decisão, e ela custa DUAS variantes, não vinte e quatro

> **`Botao` · `Estado` passa de 4 a 5 valores (`Repouso · Foco · Esperando ·
> Impedido · Armado`), e `Armado` existe só em `Papel=Gesto`, nos dois tamanhos.
> O conjunto vai de 24 a 26.**

As células vazias são a regra desenhada em vez de anotada — e o precedente é
desta mesma biblioteca (E2 deixou quatro células vazias em *A pergunta que
expira* para desenhar *o leque não tem trilho*).

- **`Recuo × Armado` não nasce:** `esperar` não tem alvo. Um Recuo armado é uma
  mira para lado nenhum.
- **`Chamada × Armado` nasceu e foi APAGADA na mesma etapa** — ver §1.3, que é o
  achado que vale a decisão inteira.

### 1.1 · O que distingue *armado* de *aceso*, sem ser cor (WCAG 1.4.1)

**Dois canais, e nenhum é matiz.**

**1 · A inversão figura/fundo.** Em repouso o verbo é **contorno**: corpo
transparente, filete `lineStrong` de 1 px, rótulo `ink`. Armado ele **enche**:
corpo `amber`, rótulo `onAccent`. Não é "outro tom do mesmo" — é a figura e o
fundo a trocar de lugar, que se lê sem separar matiz nenhum.

**2 · O bico.** Um triângulo de **12×6 px** em `onAccent`, encostado à aresta de
**cima** do corpo, a apontar para a linha do veredito que vive logo acima.
**É a única silhueta desta forma em toda a biblioteca** — não há nada com que se
confunda — e não diz só *"estou armado"*: diz ***"aquela linha é minha"***, que é
a coisa que faltava numa tela onde **uma linha serve seis botões e nada dizia de
qual**.

| par | medido | piso | veredito |
|---|---|---|---|
| o rótulo armado — `onAccent`/`amber` | **8,486:1** | 4,5 | passa |
| o corpo armado contra o painel — `amber`/`panel` | **8,448:1** | 3 | passa |
| o corpo armado contra o tabuleiro — `amber`/`bg` | **8,999:1** | 3 | passa |
| o bico — `onAccent`/`amber` | **8,486:1** | 3 | passa |
| o rótulo em repouso — `ink`/`panel` | **14,372:1** | 4,5 | passa |
| o filete em repouso — `lineStrong`/`panel` | **3,512:1** | 3 | passa |
| **`ink` sobre `amber` — a armadilha** | **1,701:1** | 4,5 | **REPROVA** |

**A última linha é um aviso, não uma medida ociosa.** Quem montar isto em código
vai clonar o botão de repouso e trocar o fundo para `T.amber` — e o rótulo, se
ficar em `T.ink`, cai para **1,701:1**. *O rótulo do verbo armado é `onAccent`, e
só `onAccent`.*

### 1.2 · O salto de leiaute é ZERO, e foi medido variante a variante

Fabricar isto ensinou uma coisa que eu não sabia e que quase deixei passar: **o
contorno de 1 px do corpo é INSIDE e conta para o HUG.** Ao tirá-lo (um corpo
cheio não precisa de traço), `Gesto` encolheu de **78 para 76 px**. Dois pixels,
no instante em que o dedo vai mirar.

> **A regra que nasce daqui: o armado HERDA o contorno do repouso do mesmo
> `Papel`, nunca o inventa.** Sem traço, `Gesto` encolhe 2 px; com traço,
> `Chamada` cresce 2 px. O contorno do corpo armado não é enfeite: **é o que
> segura a largura.**

Conferido pela leitura de volta das quatro caixas antes de eu apagar duas:

| `Papel` × `Tamanho` | repouso | armado | salto |
|---|---|---|---|
| Gesto · Normal | 78×63 | **78×63** | **0 × 0** |
| Gesto · Pequeno | 57×49 | **57×49** | **0 × 0** |

### 1.3 · O achado que mudou a decisão: `Atacar` não pode ser `Papel=Chamada`

Fiz o par comparável, fotografei-o, e a foto mostrou o que a árvore não mostra:
**`Papel=Chamada` em repouso JÁ É ÂMBAR CHEIO.** As duas caixas `ATACAR` — a de
repouso e a armada — eram **a mesma caixa amarela**, separadas por um triângulo
de 6 px de altura.

**E1 deu o `Chamada` ao `Atacar` com a razão certa para a tela dela** (*"é a ação
que o jogador procura primeiro"*) — numa tela em que `Atacar` só enchia uma
caixa de texto. Agora `Atacar` ataca, e agora um verbo pode armar-se. **O âmbar
cheio é a voz mais forte desta tela, e ela tem de pertencer ao que VAI
ACONTECER, não ao que é popular.** Gasto em repouso, não sobra nada para o
momento em que importa.

> ### A decisão: os seis verbos são `Papel=Gesto`. O âmbar cheio é exclusivo de `Estado=Armado`. `Papel=Chamada` sai da tela de batalha.
>
> **E a regra geral que fica:** *só se pode armar o que tem fundo para inverter.*

Três coisas caem de graça com ela:

1. **`Chamada × Armado` foi apagada** (`Botao` fica em **26**, não 28). *Uma
   variante que não se distingue da vizinha é pior do que variante nenhuma* — e
   foi uma **foto** que o provou, o que é raro nesta casa e vale dizer: a lei
   *confira pelo dado, nunca pela foto* protege contra a foto que **mente**; não
   proíbe a foto de mostrar o que o dado não tem como mostrar, que é *duas coisas
   parecerem-se*.
2. **A fileira fica uniforme.** Com `Chamada` lá dentro, a fileira 1 media 74 px
   e as outras duas 63 — **11 px de degrau** numa grade que devia ser regular.
   Seis `Gesto` medem 63 os seis.
3. Some a excepção de E1 *"`Atacar` é o único `Papel=Chamada` da tela"*, que era
   a única linha da composição que obrigava quem monta a tratar um dos seis
   diferente dos outros cinco.

### 1.4 · E a colisão de nome com K1, dita antes que alguém tropece

K1 já tem **`O verbo com preço` · `Papel=Armado`** (`82:2586`, `82:2593`) — a
reação do leque que vem pré-escolhida. **São a mesma ideia em alturas
diferentes**, e a prova de que está certo é que **a forma saiu igual sem eu
olhar**: corpo `amber`, letra `onAccent`, 8,486:1 nos dois. *Uma ação, uma
forma.* A diferença é só quem arma: lá é a composição, aqui é o jogador — e é
por isso que o meu tem saída (§4) e o dela não precisa.

---

## 2. A forma do alvo — decisão 2

### 2.1 · *Alcançável* é propriedade de CASA; *alvo* é propriedade de CRIATURA

É a distinção que o brief pediu, e ela não é sutileza de vocabulário — **é a
razão de hoje não se conseguir tocar num inimigo.**

- **alcançável** — *"eu posso terminar o meu passo aqui"*. É de uma **casa**
  vazia. A peça existe: `A casa` *Alcançável*.
- **alvo** — *"este verbo age sobre isto"*. É de uma **criatura**. **A peça não
  existia, e o alvo também não existe em código:**

> **Hoje é literalmente impossível tocar num inimigo no tabuleiro.** As fichas
> são desenhadas dentro de `<g style={{ pointerEvents: "none" }}>`
> (`grade-de-batalha.jsx:648`), e a casa por baixo delas **também não é
> clicável**, porque `podeIr` exclui os quadrados ocupados (`:401`, `alcancaveisDe`
> com `ocupados`). **O tabuleiro tem 84 alvos de toque e nenhum deles é um
> inimigo.**

Isto é o que obriga o jogador a escrever `Ataco Halvard` com o dedo: **não é
preferência, é que não há onde tocar.** É o achado mais importante que eu levo
desta etapa para a porta que falta (§8).

### 2.2 · A forma: os quatro cantos, e não um anel — e é geometria, não gosto

A tentação óbvia é um anel à volta da ficha. **Não cabe, e o número é exacto.**

Medido em `grade-de-batalha.jsx:215-220`: a ficha tem `r = lado × 0,40` e o arco
da vida corre em `rArco = r + lado × 0,07` = **0,47 da casa**. Uma casa tem
**0,5** de meia-largura. **Sobram 0,03 de casa — 1,4 px numa casa de 48.** Não
há onde pôr um segundo anel, e quem o puser fica com dois anéis concêntricos a
1,4 px um do outro, um dos quais é a barra de vida.

**Mas a casa não é um círculo, e é aí que está o espaço.** A meia-diagonal mede
**0,707**; o arco pára em 0,47. **O canto tem 0,237 de casa livre — 11,4 px a
48 px de lado.** *O canto é o único pedaço de uma casa ocupada que sobra vazio.*

> **`A casa` ganha `Estado=Alvo`: quatro cantos em `amber` cheio, traço de 2 px,
> braço de 9 px.** 7 → **8 variantes** (`18:31`).

Com braço de 9 px o ponto mais interior da mira fica a **28,3 px do centro**
(`√(15² + 24²)`) contra os **22,6 px** do arco da vida: **5,7 px de folga,
medidos**, e a mira nunca encosta na barra de vida de ninguém.

E os cantos fazem uma quarta coisa de graça: **são a silhueta universal da
mira** (a retícula de visor), o que poupa ensino.

### 2.3 · Os três graus, e o que os separa não é matiz

| grau | a marca | medido sobre `bg` | o canal que não é cor |
|---|---|---|---|
| **alcançável** | borda de 1 px, `amber` **55 %** | **3,406:1** | contorno contínuo, fino |
| **alvo** | quatro cantos de 2 px, `amber` **100 %** | **8,999:1** | **forma** — cantos, não moldura |
| **sob o dedo** | borda cheia de 1 px + banho 22 % | **8,999:1** | banho, que os outros dois não têm |

**Entre *alcançável* e *alvo* mudam três coisas ao mesmo tempo** — luminância
(3,4 → 9,0), espessura (1 → 2 px) e **silhueta** (moldura → cantos) — e só a
primeira é cor. Quem não separa matizes lê a diferença pela silhueta sozinha.

### 2.4 · O conjunto armado sobre 84 casas — e por que ele não é um mosaico

O medo legítimo é o da v9.125: *86 bordas são 86 caixinhas, e o tabuleiro volta
a parecer a planilha*. **Com verbos, não volta, e a razão é aritmética:**

> **O conjunto do `Mover` é um conjunto de CASAS e é grande (84 no telefone). O
> conjunto de todos os outros cinco verbos é um conjunto de CRIATURAS e é
> minúsculo** — quantos inimigos de pé há numa luta, um a seis. **Armar `Atacar`
> não acende 84 casas: acende duas.**

Daí a regra de cor, que evita a catástrofe de seis cores para seis verbos:

- **O conjunto armado é sempre `amber`**, seja qual for o verbo. *Âmbar é "o que
  você pode fazer agora"*, e o que muda entre verbos **não é a cor: é o conjunto
  e a palavra na linha do veredito.**
- **O violeta continua reservado ao alcance de habilidade** e o `danger` à área
  que a magia varre — são um **segundo sistema**, não um sexto verbo, e a regra
  de convivência do `jogo` (*nunca as duas línguas ao mesmo tempo*) mantém-nas em
  dois no máximo.

**E o número herdado que esta etapa USA e não refaz:** a união violeta da mira
mede **2,689:1** a 60 % e reprova o 1.4.11; **74 % dá 3,484:1** e é o número que
a pauta já fixou (*70 % passaria a norma a 3,254 e falharia o piso de 3,272 que o
`lineStrong` instalou*). Uma linha, em `App.jsx`. **Continua por pagar, e o
conjunto armado torna-a mais urgente, não menos** — porque agora o violeta e o
âmbar aparecem na mesma tela mais vezes.

---

## 3. A forma do preço e do alcance antes do clique — decisão 3

**A linha do veredito já existe, já é `Consequencia` *fixação=Linha*, e já mede
24 px** (`App.jsx:20908-20912`). **Não nasce peça nova.** O que muda é o que ela
diz e quantas linhas tem.

### 3.1 · A gramática do armado, e ela tem orçamento

> **`{verbo} {nome} — {distância} m, ao alcance`**

| frase | caracteres | px |
|---|---|---|
| `Atacar Halvard — 3 m, ao alcance` | 32 | 192 |
| `Atacar Capitão dos Bandidos — 3 m, ao alcance` | 45 | 270 |
| `Mover até K14 — 6,0 m, e abre a guarda` | 38 | 228 |
| `Empurrar Halvard — 1,5 m, corpo a corpo` | 39 | 234 |
| `Atacar — ninguém ao alcance, aproxime-se` | 40 | 240 |

**O custo fixo, com o pior verbo (`Empurrar`, 8) e a pior distância (`12,5 m`,
6):** 8 + 1 + 3 + 6 + 12 = **30 caracteres. Sobram 24 para o nome.**

### 3.2 · A lei que resolve o problema do nome, e é nova

§0.2 provou que quem estoura o teto não é a redacção: **é o nome**, que é
conteúdo do mundo e não se reescreve. Então:

> ### O nome é o único campo que se apara. O número nunca. A saída nunca.
>
> Quando a frase passa de 54, **o nome trunca com reticência** (`Capitão dos
> Band…`), e nada mais. **Porque o nome é o único dos quatro campos que o jogador
> já sabe** — ele está a olhar para a ficha, foi ele que a escolheu. O número e a
> saída são precisamente as duas coisas que ele **não** sabe.

E ela é a mesma lei em cima da recusa de hoje, que é o caso que mais aparece:
`Longe demais — Capitão dos Band… a 12 m, faltam 3 m.` cabe; a frase de hoje, com
77, não cabia por 23.

### 3.3 · O que muda na linha quando há verbo armado — e custa 6 px

**Duas linhas, por desenho e não por transbordo.** A de cima é o que acontece; a
de baixo é como desistir (§4).

O custo, medido: a linha de hoje tem `minHeight: 24` (`App.jsx:20909`); E2 mediu
**duas linhas de mono 10 px em 30 px** (a prova dos 101 caracteres a 344).

> **6 px. E 6 px não é casa nenhuma** — uma casa pede 48. É a mesma aritmética de
> E2 §2: paga-se de folga, e o campo não perde uma fila.

**A peça que faz isto já existe e foi feita em E2:** `Consequencia`
*Largura=Ocupa a linha* (`116:12` para *Tom=Preço*) — largura fixa, frase em
`FILL`, `textAutoResize: HEIGHT`: **quebra em vez de crescer.** Sem o eixo que E2
fabricou, esta decisão não seria possível; com ele, **é uma troca de variante.**

### 3.4 · A linha muda de tom, e o tom já existe

| quando | `Tom` | a marca |
|---|---|---|
| nenhum verbo armado, há alvo | `Estado` | é informação, não é preço |
| verbo armado, alvo escolhido | **`Preço`** | é o que vai custar |
| verbo armado, nada ao alcance | **`Impedimento`** | a recusa, com a razão |
| o Mestre a escrever | `Espera` | o que já existe |

Nenhum tom novo. Os quatro de D4 chegam.

---

## 4. A forma da desistência — decisão 4

**Três saídas vivas ao mesmo tempo**, como E1 escreveu: `Esc` (e o gesto de
voltar), **tocar o verbo outra vez**, e **tocar o campo fora do conjunto
armado**. O que E1 não pôde decidir, porque o verbo ainda não tinha forma
armada, é **onde é que isso se diz**.

### A pergunta do brief: *"toque fora para desistir" cabe nos 54? Se não, o que cai?"*

**Cabe — 24 caracteres, 144 px.** `Esc ou clique fora para desistir` mede 32.
**Nenhum dos dois é o problema.** O problema é que **não cabe na MESMA linha do
preço**: `Atacar Halvard — 3 m, ao alcance · toque fora para desistir` mede 57 e
estoura por 3, e com um nome de mundo estoura por vinte.

> ### A decisão: a desistência não divide a linha do preço. Ela é a SEGUNDA linha, e é FIXA.
>
> | canal | a frase | caracteres |
> |---|---|---|
> | dedo | `toque fora para desistir` | 24 |
> | ponteiro | `Esc ou clique fora para desistir` | 32 |

**E ser fixa é a decisão, não um efeito colateral.** Uma segunda linha que nunca
muda aprende-se numa luta e deixa de ser lida na seguinte — **é o ensino mais
barato que existe, e o único que não cobra atenção depois de aprendido.** Uma
frase condicional (*"aparece quando sobra espaço"*) ensinaria o jogador a não
confiar nela, que é pior do que não a ter.

### E o estado armado nunca é mudo — agora por três canais, não por um

E1 escreveu a lei (*"um véu sem saída que não diz que tem saída é a armadilha que
a peça `Véu sem retorno` existe para impedir"*). Ela cumpre-se assim:

1. **a segunda linha**, que é texto e está na árvore de acessibilidade;
2. **o bico**, que é forma e diz *"este verbo é o dono daquela linha"* — e um
   verbo que se pode apontar é um verbo que se pode tocar outra vez;
3. **a inversão figura/fundo**, que faz do verbo armado o único preenchido da
   fileira — *o que se acende com um toque apaga-se com o mesmo toque* é a
   gramática de interruptor que não precisa de ser escrita.

**E o canal de máquina:** o verbo armado é `aria-pressed="true"`. Não é um estado
inventado — é o estado que a norma já tem para *"este controlo está ligado"*, e
é o que faz a segunda linha e o bico chegarem a quem não vê nem um nem outro.

---

## 5. O movimento — o que o armado acrescenta, com a saída escrita à nascença

A tabela de E1 fica. **Três linhas novas, e nenhuma delas inventa duração:**

| o que | quanto | curva | sob `prefers-reduced-motion` |
|---|---|---|---|
| o verbo enche ao armar-se | **90 ms**, `background` + `color` | `ease` | troca a seco, pousa cheio |
| o conjunto armado acende no campo | **90 ms**, só `opacity`, **a camada inteira de uma vez** | `ease` | aparece a seco |
| o verbo esvazia ao desarmar | **90 ms** | `ease` | troca a seco |

**As três leis, e a primeira é a de E1 a valer outra vez:**

1. **90 ms, e não é escolha: é o mesmo evento.** A casa entra em *Sob o dedo* em
   90 ms, a régua acende em 90 ms — e o verbo a encher e o campo a acender **são
   o mesmo acontecimento visto em dois sítios**. Dois números para a mesma coisa
   seriam duas verdades. (E 90 ms fica abaixo do limite de 100 ms em que um gesto
   ainda parece instantâneo — NN/g, *Response Times: The 3 Important Limits*,
   Nielsen 1993, a partir de Miller 1968.)
2. **O conjunto acende como UMA camada, nunca casa a casa.** Oitenta e quatro
   animações escalonadas são um efeito bonito que custa o turno — e animar
   leiaute é proibido nesta tela.
3. **Classes novas: `tv-verbo-arma` e `tv-verbo-desarma`, ambas com saída
   `animation: none`** (pousam no estado final, que é onde a informação está).
   **Nenhuma `infinite`.** É a lei de D5c cobrada antes de doer.

**O bico não anima.** Ele é parte do corpo e aparece com ele — um triângulo a
crescer sozinho seria um segundo acontecimento onde só há um.

---

## 6. O celular — e o que substitui o `hover`

**Esta é a decisão mais importante da etapa, e a resposta honesta é que o `hover`
não se substitui por um gesto.**

### 6.1 · Primeiro, o que hoje é de rato e não devia ser

- a rota prevista só existe em `onMouseEnter` (`grade-de-batalha.jsx:759`);
- `rotaPrevista` depende de `sobre`, que só o rato escreve (`:421-426`);
- e o cabeçalho `↳ 4,5 m até ali` (`:786`) só aparece com `sobre`.

> **`onMouseEnter` → `onPointerMove` não é um port: é uma correção.** Os eventos
> de ponteiro cobrem rato **e** dedo no mesmo caminho de código. O desktop não
> perde nada, o telefone ganha tudo, e some a razão de existirem dois canais
> para a mesma informação. **É a coisa mais barata desta etapa inteira.**

### 6.2 · Mas o dedo tapa a casa, e isso é medida, não opinião

A casa mede **48 px** (o piso das três réguas). A polpa do indicador adulto mede
**16–20 mm** (MIT Touch Lab, *Human Fingertip to 3D Object Contact*, Dandekar
et al. 2003), que a ~160 ppi dá **~100–125 px**. **O dedo tapa a casa que toca,
sempre, em qualquer telefone.** Logo:

> **O número escrito dentro da casa não é legível DURANTE o toque. Só antes
> dele.** Qualquer desenho que ponha a informação de combate debaixo do dedo está
> a desenhar para uma mão que não existe.

### 6.3 · A resposta: o conjunto fala todo de uma vez, antes de o dedo aterrar

> ### O `hover` não é substituído por um gesto. É substituído por a tela deixar de precisar de um.
>
> **Armar o verbo acende o conjunto inteiro, com o preço escrito dentro de cada
> casa, ANTES de qualquer dedo tocar no campo** (é a decisão de E1 12.2 — *o
> custo nasce escrito dentro de toda casa Alcançável* — a ganhar o seu verdadeiro
> trabalho). O jogador **lê primeiro e toca depois**. **O toque é o compromisso,
> não a pergunta.**

Três consequências, e a terceira é um pedido ao `jogo`:

1. **O rato pergunta antes; o dedo confirma depois.** No rato a rota desenha-se
   ao passar; no dedo ela desenha-se **na largada**, como confirmação de 90 ms
   antes de a ficha andar. *As duas leem a mesma frase* — a da linha do veredito.
2. **A linha do veredito fica acima dos verbos, que é onde a mão não está**
   (§0.3). Quando o polegar prime um verbo, a linha está **acima** do ponto de
   toque — HIG, *Adjusting for the finger*. Quando o dedo sobe ao campo, a linha
   fica **debaixo** da mão: e é exactamente por isso que a informação que decide
   **não pode morar lá**, e mora dentro das casas.
3. **O arrasto corrige, não consulta.** Com o dedo em baixo, arrastar muda o alvo
   e a linha acompanha; levantar compromete. Quem largar em cima de uma casa que
   não é alvo **desiste** — que é a terceira saída de §4, ganha de graça.

### 6.4 · A aritmética da fileira, e ela tem um buraco de 57 px que eu não posso fechar sozinho

E1 escreveu **três fileiras de 44 px**. Medido na peça, o `Botao` *Gesto ·
Normal* mede **63 px**, porque **reserva 19 px para a linha da razão nos quatro
estados** — foi a correcção que E1 fez para o *Impedido* não empurrar o campo.

| | E1 escreveu | a peça mede |
|---|---|---|
| três fileiras + duas goteiras de 6 | 3×44 + 12 = **144 px** | 3×63 + 12 = **201 px** |

> **São 57 px a mais — e uma casa pede 48. A reserva da razão custa mais do que
> uma fila inteira de casas no telefone.**

**E na fileira de batalha essa reserva não serve para nada**, porque os seis
verbos partilham **uma** linha do veredito: a razão nunca renderiza por botão
(`mostrar a razao = false` nos seis).

**Não mexi na peça, e a recusa tem motivo escrito:** `A linha` (`22:46`) compõe
quatro instâncias que dependem de `a razao`, e ***peça mudada em silêncio por
baixo de uma composição é pior do que peça com espaço reservado*** — é a condição
que E1 pôs e que E2 respeitou. **O caminho está desenhado e é este:** *a reserva
sobe de nível — do botão para a fileira*. Quem compõe uma fileira onde o
`Impedido` pode aparecer reserva a altura **uma vez, na fileira**; quem compõe
uma onde ele não aparece não paga nada. Mesmos pixels quando a razão pode
acontecer, **57 px mais barato quando não pode.** Vai para a pauta com o número.

---

## 7. O que entrou no Figma

Arquivo `Taverna — biblioteca`, `e5wJUzInAssoebx5npssKc`. **Ampliado, nunca
duplicado.** Zero hex solto: tudo ligado a variável de `T`.

| peça · nó | o que mudou | variantes |
|---|---|---|
| **`Botao`** · `9:170` | `Estado` ganha **`Armado`** | 24 → **26** |
| ↳ `124:7` | `Papel=Gesto, Estado=Armado, Tamanho=Normal` — **novo** | 78×63 |
| ↳ `124:3333` | `Papel=Gesto, Estado=Armado, Tamanho=Pequeno` — **novo** | 57×49 |
| ↳ *(apagados)* `124:2`, `124:3328` | `Chamada × Armado`, nos dois tamanhos — §1.3 | — |
| **`A casa`** · `18:31` | `Estado` ganha **`Alvo`** | 7 → **8** |
| ↳ `125:177` | `Estado=Alvo` — os quatro cantos — **novo** | 48×48 |
| ↳ `18:7` | *Alcançável* **recuperou a borda de 55 %** que a decisão manda — §0.1 | — |
| **página `W1 · o verbo armado`** · `125:3486` | nova | — |
| ↳ `126:2` | quadro **`o par comparável — a fileira em repouso e armada`** | 806×378 |
| ↳ `128:3489` | quadro **`alcançável NÃO é alvo — a casa e a criatura`** | 796×392 |

**Nenhuma peça nova nasceu.** Duas cresceram um estado cada, e uma foi
consertada. `Consequencia` **não** cresceu: o eixo `Largura` que E2 fabricou já
serve §3.3 tal e qual.

### As armadilhas do Figma, reconfirmadas — e uma delas apagou trabalho meu

1. **`clone()` não copia `componentPropertyReferences`** (K1b). Apanhou-me
   **duas vezes na mesma etapa**: no `o endereco` de `A casa` e no `rotulo` do
   `Botao`. **E a segunda só apareceu numa foto** — `setProperties({rotulo:
   "ATACAR"})` correu sem erro nenhum e o botão continuou a dizer `AGIR`.
   *Ela não falha: ignora.*
2. **Um script que estoura desfaz a transação inteira.** O conserto da borda de
   *Alcançável* corria dez linhas antes do erro e **voltou atrás sem aviso** — eu
   só o soube porque o reli numa chamada nova. *Depois de um erro, nada do que
   correu antes dele aconteceu.*
3. **`node.query()` não aceita espaço no atributo.** `query("TEXT[name=o
   custo]")` devolve `null` em silêncio até alguém lhe tocar. Use `findOne`.
4. **`setBoundVariableForPaint` mais `paint.opacity` não é o caminho em
   `A casa`** — nesta peça o alfa mora na **opacidade do nó**, e a lei é de D4,
   paga em cinco tentativas.

---

## 8. O que depende da porta que falta (para o `backend`)

Desenhei supondo que ela vai existir. **O que a minha forma exige dela, e nada
mais:**

1. **`alvosDoVerbo(verbo, estado)` → `{ casas: Set, criaturas: [] }`.** Sem isto
   não há conjunto armado para acender, e **o conjunto é a coisa inteira** — é ele
   que substitui o `hover` (§6.3).
2. **`vereditoDoVerbo(verbo, alvo)` → `{ curta, custoM, penalidade, razao }`, com
   `curta ≤ 54`**, e uma catraca que falhe acima disso. **A `curta` é lida duas
   vezes** — pela linha do veredito e pelo `aria-label` da casa —, que é a lei de
   E2, e é o que faz o ouvido e o olho receberem a mesma frase.
3. **O truncamento é do lado da tabela, não da tela**, e apara **só o nome**
   (§3.2). Uma frase já aparada é uma frase; uma frase aparada por CSS é uma
   frase partida.
4. **As fichas têm de virar alvo.** `pointerEvents: "none"`
   (`grade-de-batalha.jsx:648`) e a casa ocupada fora de `podeIr` (`:401`) são,
   juntos, a razão de **hoje não haver como tocar num inimigo** (§2.1). Com um
   verbo de criatura armado, a casa ocupada tem de entrar em `clicavel`.
5. **`onMouseEnter` → `onPointerMove`** (`:759`) — §6.1.
6. **O violeta da mira a 74 %** (`:611`, `opacidade={0.6}`) — 2,689 → **3,484**.
   Herdado, ainda por pagar, e mais urgente agora (§2.4).
7. **`recusaDoGolpe` tem de encolher** (`App.jsx:1126-1131`): 65 caracteres com o
   nome mais curto da mesa, 77 com um nome de mundo (§0.2).

---

## 9. Os pedidos ao `jogo` — onde a forma tocou a composição

Cinco, e nenhum é decreto. O `regente` reconcilia.

1. **Os seis verbos são `Papel=Gesto`; `Atacar` perde o `Papel=Chamada`** (§1.3).
   Isto derruba uma linha de E1 que é composição, e a prova é uma foto: as duas
   caixas eram a mesma caixa amarela.
2. **A ordem vertical é campo → linha do veredito → verbos** (§0.3), e a razão
   final é o polegar, não a semântica.
3. **Quais verbos se armam.** `Esquivar` age sobre quem o faz: **não tem alvo,
   logo não se arma** — resolve num toque. `esperar` idem. **Armar um verbo que
   não tem para onde apontar é o formulário que a lei do passo limpo proíbe.**
   Quais dos seis estão nesse caso é momento, e é dele.
4. **No telefone, a rota desenha-se na LARGADA, não durante o arrasto** (§6.3),
   porque durante o arrasto ela está debaixo da mão.
5. **A segunda linha da desistência é fixa e nunca muda** (§4). Se ele quiser que
   ela some depois de N lutas, isso é ensino com memória, e é dele — mas eu
   recomendo que não, pela mesma razão por que não se tira o cinto depois de se
   aprender a conduzir.

---

## 10. O que eu decidi NÃO fazer

- **Não fabriquei o eixo `Largura` do `Botao`.** Continua por pagar e continua
  bloqueado pelo mesmo: `A linha` compõe quatro instâncias e o `jogo` ainda não
  a reviu. E agora está **pior**, não melhor: com `Armado`, o eixo levaria o
  conjunto de 26 a **52**. *Digo-o porque a pauta merece o número actualizado.*
- **Não mexi na reserva da razão do `Botao`**, apesar dos 57 px (§6.4). Mudar
  uma peça por baixo de uma composição que o `jogo` não reviu é a regra da casa,
  e ela vale contra mim também.
- **Não fiz `Consequencia` crescer.** Pensei num terceiro valor de `Forma`
  (*Linha com bico*) e **recusei-o**: eram **+8 variantes** para uma coisa que o
  bico do `Botao` faz de graça, e o dono do estado é o verbo, não a linha.
- **Não desenhei o alvo de área** (a magia que varre casas). É `danger`, é a
  segunda língua, e a regra de convivência do `jogo` mantém-nas separadas — pegar
  nela agora seria desenhar para uma decisão que ninguém tomou.
- **Não toquei em `O verbo com preço`.** A colisão de nome fica **escrita** (§1.4)
  em vez de resolvida por renomeação, porque renomear `Papel=Armado` mexeria em
  *A pergunta que expira*, que o `jogo` acabou de rever.

---

## 11. Para a pessoa decidir — a proposta ambiciosa

### O tabuleiro deixa de esperar o verbo. Toca-se o ALVO primeiro, e os seis verbos respondem com o preço de cada um.

**O diagnóstico, e ele acusa o desenho que eu acabei de fazer.** A lei desta casa
é *o veredito antes do clique*. No fluxo **verbo → alvo**, o jogador tem de
escolher **o que quer fazer antes de saber o que aquilo custa**: o primeiro toque
é um compromisso às cegas, e o veredito só chega depois dele. **W1 melhora muito
o segundo toque e não melhora nada o primeiro.**

**A proposta: inverter.** Tocar `Halvard` — e a fileira inteira responde de uma
vez:

| | |
|---|---|
| `ATACAR` | *armado* · `3 m, ao alcance` |
| `EMPURRAR` | *armado* · `1,5 m, corpo a corpo` |
| `DERRUBAR` | *impedido* · `precisa de estar colado` |
| `SALTAR` | *impedido* · `4,5 m — o seu passo chega a 3` |
| `MOVER` | *armado* · `4,5 m até ao lado dele` |

**Seis vereditos ao mesmo tempo, antes de qualquer compromisso.** Segundo toque
resolve. **São os mesmos dois toques** — muda **quando** o jogador sabe o preço.

**Comprovado, pelos três caminhos:**

- **Medida — e é a que faz a proposta ser barata.** A fenda da razão **já está
  reservada nos seis botões e já custa 57 px no telefone** (§6.4), e hoje **não
  mostra nada**. Esta proposta não pede um pixel novo: **gasta o espaço que já
  está pago.** E não pede peça nenhuma — `Botao` *Impedido* com `a razao` e
  `Botao` *Armado* já existem, os dois.
- **Estudo citado.** É a lei escrita desta casa (*o veredito antes do clique*) e
  é o achado que E1 registou e a pauta ainda tem por fechar: *os tons
  `Impedimento` e `Espera` de `A Consequência` e a fenda da razão do `Botao`
  **foram construídos duas vezes por acidente***. Esta proposta é a primeira
  composição em que essa fenda tem um trabalho que mais nada faz.
- **Experiência jogada — e é a que falta, e digo-o como o buraco que é.** Não
  joguei isto. **É a razão de a proposta ser da pessoa e não minha.**

**O que o jogador teria de reaprender, e é por isso que é dela:** *a ordem dos
dois toques*. É fluxo, e fluxo é da pessoa pela régua que ela própria deu.

**O risco, dito por mim, e não é pequeno.** Seis razões em mono 10 px por baixo
de seis verbos **podem ser uma parede de texto no momento mais tenso da mesa** —
seis frases a aparecerem de uma vez é exactamente o tipo de coisa que se lê bem
numa folha e mal com o coração acelerado. **Não resolvo isto com desenho:
resolve-se jogando.** Uma defesa possível, que deixo escrita: **só os verbos
*armados* escrevem; os *impedidos* ficam impedidos e calados até serem tocados.**
Isso corta a parede a metade e mantém o ganho inteiro — mas é uma suposição, não
uma medida.

---

## 12. O que ficou feio, e o que eu não soube

**Feio.**

- **`Estado=Armado` existe só em `Papel=Gesto`**, e um eixo com buracos é sempre
  uma peça que exige que se leia a documentação antes de usar. Está defendido
  (§1, §1.3) e tem precedente na própria biblioteca; não é elegante.
- **O bico mede 12×6 px.** É o canal de forma em que assenta metade da distinção
  *armado × qualquer outra coisa*, e **é a coisa mais pequena desta etapa**. Se
  ele desaparecer no telefone ao sol, sobra a inversão figura/fundo — que chega —,
  mas o *"aquela linha é minha"* morre, e é a parte que eu mais gosto.
- **A linha do veredito passa a ter duas linhas no estado mais comum do combate.**
  São 6 px, e eu provei que 6 px não é casa nenhuma. Continua a ser a região da
  tela que mais cresce em W1, e a que E1 já dizia ter menos certeza.
- **Eu fabriquei `Chamada × Armado` e apaguei-o na mesma etapa.** O trabalho
  perdido foi pequeno; o que incomoda é que **a árvore me deixou fabricá-lo sem
  nunca me dizer que as duas caixas eram iguais.** Foi a foto — o canal de que
  esta casa desconfia por escrito.

**Não soube.**

- **Se 90 ms é o tempo certo para o campo inteiro acender.** Herdei-o da casa,
  onde ele vale para **uma** casa a acender. Oitenta e quatro ao mesmo tempo
  podem pedir mais, ou podem parecer um flash. **Não medi, e não há como medir
  sem o campo a correr.**
- **Se o conjunto armado de `Mover` continua a não ser um mosaico.** O meu
  argumento (§2.4) é que os verbos de criatura acendem duas casas — **mas `Mover`
  acende as 84**, e para `Mover` o problema da v9.125 está intacto. *O que me
  salva é que `Mover` é o que já existe hoje; o que me incomoda é que eu não
  melhorei nada nele.*
- **Quantos caracteres o nome de um inimigo tem, de facto.** Orçamentei 24 a
  partir de dois exemplos que eu próprio inventei. **O número honesto sai de
  varrer os bestiários, e isso é leitura de tabela que eu não fiz.**
- **Se `aria-pressed` é o papel certo para um verbo que arma um tabuleiro
  inteiro.** É o que a norma tem para *"ligado"*, e encaixa. Mas um botão que
  muda o significado de 84 outros alvos talvez seja um `radio` de um grupo, e
  **não sei dizer qual sem ouvir um leitor de tela a sério.**

---

---

# A segunda rodada — a reconciliação

O `regente` decidiu três coisas e devolveu-me quatro perguntas. As três decisões
estão no bloco de `formas.md`; aqui ficam **as respostas com os números**.

## 13. A aritmética da fileira, refeita — e a devolução verdadeira é 81, não 138

**Só há uma linha de base comparável, e é a de E2:** telefone com a régua, útil
337×594, **7 colunas × 12 filas de 48 = 84 casas**, folga 1 px e 18 px. Nela os
verbos custavam os **144 px que E1 escreveu** e a linha do veredito 24.

| | verbos | região | campo | filas | casas | contra E2 |
|---|---|---|---|---|---|---|
| E2 · publicado (E1 no papel) | 144 | 24 | 594 | 12 | 84 | — |
| **E1 com a peça REAL** (3 × 63 + 12) | **201** | 24 | 537 | **11** | **77** | **−1 fila** |
| **W1 · uma fila de quatro** | **63** | 24 | 675 | **14** | **98** | **+2 filas, +14 casas** |
| W1 · + a segunda linha | 63 | 30 | 669 | 13 | 91 | +1 fila |
| **W1 · + pílulas (47)** | 63 | **71** | 628 | **13** | **91** | **+1 fila, +7 casas** |
| W1 · pílulas **e** segunda linha | 63 | 77 | 622 | **12** | 84 | **+0** |

> **A devolução verdadeira é 81 px.** Os 138 (201 − 63) comparam contra um
> leiaute que **nunca foi construído** e cujos 201 px **já custavam uma fila** —
> citá-los seria contar o mesmo pixel duas vezes. O `jogo` disse 88 partindo dos
> 132 de E1 sem goteiras; **o número contra o único campo publicado é 81, e 81
> são 2 filas inteiras.**

**E o achado dos 19 px ganha o seu peso em casas:** a fileira de três de E1,
construída com a peça real, **teria custado uma fila — 84 → 77 casas.** Era isso
que estava por baixo do número, e agora está dito na moeda certa.

## 14. A colisão resolvida — e o degrau é 75 → 76

Varri a região px a px. **A 75 px há 13 filas; a 76 px há 12.** Não é
extrapolação: é onde o chão parte.

> ### No telefone a região reserva 71 px, sempre: 47 da fila de pílulas + 24 da linha do veredito. Sobram 4 px antes do degrau.
>
> **A segunda linha da desistência não cabe no telefone: custa 6 px e
> exactamente 7 casas.** Na mesa, onde não há pílulas nem escassez, **fica.**

**E não é só orçamento — as duas dizem o mesmo por dois canais.** A frase diz
*"toque fora para desistir"*; a fila de pílulas **torna-o visível**: há alvos
acesos, um está escolhido, tocar o escolhido outra vez apaga-o, tocar fora
desarma. É a lei que tirou o `<title>` em E2 — *duas verdades sobre a mesma
coisa* —, e quando o segundo canal é uma fila de 47 px debaixo do polegar,
**o que se dispensa é a frase.**

**A reserva é única e pelo pior caso, como E1 fez com a linha da razão.** A
região **não encolhe** quando não há pílulas — reservar uma vez é o que impede o
tabuleiro de saltar no instante em que o verbo arma.

**O risco, e eu não o escondo:** no telefone o recado da saída passa de **frase**
a **forma**, e nada ensina a forma a quem joga pela primeira vez. **Se o `jogo` a
quiser lá, cabe — e custa 7 casas.** O número está escrito; a escolha é dele.

## 15. `A escolha` *Forma=Pílula* chega — e faltam duas correcções de peça

**Chega, e `Estado=Escolhida` cobre também *"este é o que o toque único
usaria"*.** Não são dois estados: **o alvo pré-escolhido É uma escolha, só não
foi ainda o jogador que a fez** — e o código já a faz hoje
(`maisPertoAoAlcance`, `App.jsx:20847`). Quem diz quem escolheu não é uma marca
diferente: **é o nome escrito na linha do veredito.** Uma marca para "escolhi eu"
contra "escolheu o sistema" seria uma distinção que só o sistema entende — e o
sistema não fala de si mesmo.

**Mas a peça não serve tal e qual. Lido na peça (`20:77`), e nenhum dos dois é
peça nova:**

1. **`Forma=Pílula, Estado=Foco` mede 75 px contra os 47 das outras três —
   cresce 28 px.** Numa fila de alvos, **tabular empurra o tabuleiro em mais de
   meia casa**, que é exactamente o defeito do *Impedido* de E1. É também o que
   faz a última linha da tabela do §13: com o foco, a região vai a **105 px** e a
   devolução é **zero**. **O anel tem de ser desenhado sem mudar a caixa.**
2. **`rotulo`, `a marca` e `a razao` são CAMADAS, não propriedades** —
   `componentPropertyReferences` vazio nos três. É a doença que E2 curou em três
   peças, e **esta é a quarta** — numa peça cujo rótulo vai ser o nome de um
   inimigo, isto é, muda em toda instância e em toda luta. *(`a razao` é a fenda
   que leva o `· 3 m`: existe, está escondida por omissão, e serve.)*

**As duas são minhas e vão à pauta.** Não as paguei aqui pela mesma razão de
sempre: são peça viva por baixo de composição que o `jogo` não reviu.

## 16. As três decisões do `regente`, e o que elas me custaram

- **A fileira de quatro** apaga o meu §6.4 como *problema* e transforma-o em
  *achado com preço*: já não há três filas para pagar, mas o buraco de 19 px
  continua lá, agora medido em casas (§13).
- **`Atacar` perde o `Papel=Chamada` e ganha a largura.** Ganhei a de `Papel` e o
  `jogo` ganhou a diferença — e **está certo assim**: a minha objecção nunca foi
  que `Atacar` não deva destacar-se; foi que **não pode destacar-se com a mesma
  tinta do armado**. Largura resolve-o sem tocar no canal que agora significa
  outra coisa.
- **Só `Atacar` se arma** responde ao meu pedido 3 melhor do que eu o tinha
  escrito: eu perguntei *quais verbos se armam*; a resposta foi tirar da fileira
  todos os que não têm alvo. **A pergunta desaparece em vez de ser respondida**,
  que é sempre a melhor forma de a fechar.

## 17. E a contradição de `formas.md` está corrigida

A linha que dizia *"colada sob a fileira"* (§0.3) passa a dizer **"entre o campo
e os verbos"**, com a nota do porquê: duas passagens contra uma, e o desempate
nem precisou de maioria — **o lugar certo é acima dos verbos porque é onde a mão
NÃO está quando o polegar os prime.** *Uma fonte da verdade a dizer duas coisas
é o defeito que ela existe para não ter.*

---

*Fase W1 · `desenho` · 15–16/09. O par é o `jogo`; o desempate é do `regente`;
a forma inteira vive no bloco de `mente/formas.md`.*
