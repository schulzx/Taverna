# E1 · a tela desenhada antes de existir

**A tela de batalha do Taverna, decidida antes de haver uma linha de código.**
Do `jogo`, em par com o `desenho`, 15/09. Nada aqui é `.jsx`: é o momento, a
proporção, a ordem e o preço. A forma de cada peça é dele; a composição e o
*quando* são meus.

O pedido da pessoa, palavra por palavra (14/09):

> *"seria interessante uma tela para a batalha, pois é um momento importante e
> a maioria das outras funções ficariam inúteis — quando entrar em batalha, uma
> tela só com o grid e as funções de batalha e utilitários."*
> *"nosso grid pode ter letras e números, tipo um tabuleiro de xadrez, então se
> um player disser 'vou até H20' não teria a confusão que 'me aproximo do…'
> causa."*

E a segunda lei da mesa (15/09): *"decida como um designer UX e um game
designer experientes decidiriam"*. **O que está decidido aqui não volta para
ela.** O que volta está no fim, em *Para a pessoa decidir*, e é o que ela teria
de reaprender.

---

## O QUE EU PRECISO DO `desenho` — peça a peça, com o motivo

*(Este bloco vem primeiro de propósito: ele está a fabricar em paralelo.)*

### O que eu NÃO preciso — dito antes, para não nascer duas vezes

- **A barra dos verbos NÃO é peça nova.** É uma fileira de `Botao` — um
  *Papel=Chamada* (o `Atacar`), cinco *Papel=Gesto*, um *Papel=Recuo* (o
  `esperar`) — mais uma `Consequencia` *Forma=Linha* colada por baixo. Tudo
  existe. **Não fabrique uma "barra de combate".**
- **O tabuleiro em si NÃO é peça.** O chão, a parede com massa, a malha, o
  estorvo, as fichas com o rosto e o anel de vida já existem em SVG
  (`grade-de-batalha.jsx`) e são **cena**, não biblioteca. O que é peça é *a
  casa* — o alvo — e essa já é tua.
- **O véu da luta NÃO é peça nova.** `Veu` *Peso=Pesado* cobre a conta do fim.

### O que eu preciso, por ordem de quanto bloqueia

**1. `A casa` tem de LADRILHAR — e hoje não ladrilha.** *(bloqueia o quadro do
tabuleiro; é o único pedido que trava a etapa)*
Medido no nó `18:31`: cada variante é um `COMPONENT` de **148×48**, com um
frame `quadrado` de 48×48 **centrado** dentro dele e os textos `o custo` e `o
preco` em `y=54`, isto é, **fora dos 48 px de altura da peça**. Um tabuleiro é
um ladrilhamento: 148 px de largura por casa põe 100 px de ar entre colunas
vizinhas, e o campo deixa de ser campo. **O que peço:** ou um eixo
*Densidade* (Ficha · Tabuleiro), ou a peça inteira reduzida a **48×48 com o
custo escrito DENTRO do quadrado**, que é o que a própria forma já decidiu em
`formas.md` (*"o custo nasce escrito dentro da casa já em Alcançável, em mono
10px"*). A folha de biblioteca continua a mostrar as sete variantes lado a
lado; é só o box que encolhe ao quadrado.

**2. `A casa` precisa do ENDEREÇO.** *(é o pedido literal da pessoa)*
Um terceiro texto, `o endereco` — `H20`, mono 10, **na primeira linha, acima do
custo**, dentro do quadrado —, **visível só em *Sob o dedo* e *Confirmando***.
Em *Alcançável* ele **não** aparece: 86 casas com endereço escrito ao mesmo
tempo é a planilha que a v9.125 matou. Três caracteres em 48 px cabem com folga
ao lado dos quatro de `4,5`. *(Sobre a armadilha de D4: pode ser propriedade de
texto — o que não pode é o texto **mudar por variante**. Aqui quem muda por
variante é a **visibilidade**, e essa é legítima.)*

**3. `A régua do campo` — peça nova.** ✅ **ELE FABRICOU, ENQUANTO EU ESCREVIA
ISTO — e os cinco quadros já estão compostos com ela.**
Pedi: duas orientações, ~20 px, letras em cima e números à esquerda, e um
estado ***Sob o alvo*** em que **a letra E o número acendem**, porque o
endereço são dois. Ele entregou **`A regua`** — nó **`30:11`**, 4 variantes
(*Eixo* Coluna · Linha × *Estado* Repouso · **Realcada**), 48×22 e 22×48.
**Serve exactamente**, e a minha régua desenhada à mão saiu dos cinco quadros.
A única diferença é de dois pixels (22 e não 20) — **cedi eu**, e a pilha
vertical devolveu-os tirando-os da linha do veredito: 22 em vez de 24. Continua
a fechar em 860 e em 812 exactos.
**O que fica dito, e é meu:** a régua é presa **à janela, não ao campo** (§6).
Quando o campo rola, os rótulos mudam e a régua fica colada à borda.

**4. `A faixa da vez` — e aqui nós dois desenhámos coisas diferentes.** ⚠️
Eu pedi uma **faixa horizontal** de selos compactos, no topo do campo, 56 px
(48 no telefone). Ele fabricou **`A vez`** — nó **`30:163`**, 12 variantes
(*Lado* Você · Aliado · Inimigo × *Vez* Agora · Espera · Já jogou · Caiu) —, e
ela é **uma LINHA de 320×48**: uma peça de lista vertical, não de faixa.

**Os dois lados, e nenhum está errado.** A linha dele é claramente melhor para
*ler a ordem inteira* — carrega nome, iniciativa e estado, e resolve o
`App.jsx:3206-3220` que ele mediu, com `rgba(232,163,61,0.10)` literal dentro
do JSX. **Mas 320×48 não cabe numa faixa:** em 375 px cabe **uma** linha, e a
pergunta *"de quem é a vez?"* voltaria a custar um gesto — que é o defeito que
esta tela existe para matar. Seis combatentes em lista vertical comem **288 px
dos 812** do telefone.

**A minha proposta, e é uma peça só e não duas:** ***`A vez` ganha um eixo
`Forma` (Linha · Selo)***. *Linha* é o que ele fez, para a lista que se abre e
para a coluna larga; *Selo* é a versão compacta (~72×40, ponto + nome + o
estado) para a faixa que está **sempre** na tela. Uma ação, uma forma — com
duas densidades declaradas, que é o que `Barra de medida` e `Botao` já fazem
com *Tamanho*. **Enquanto não existir, a faixa dos meus quadros está montada
com `Selo de estado`, que é o mais próximo que a biblioteca tem** — e isso é
remendo, não desenho. **A decisão da forma é tua.**

**5. `A marca de borda` — peça nova, pequena, e é o que impede a tela de
mentir.** *(ver §3, regra R5)*
O campo é maior que a janela. Quando alguma coisa acontece fora dela, a borda
daquele lado ganha um filete de 4 px mais uma aba com **nome e distância** —
`Halvard · 12 m ↑`. Quatro bordas, dois tons (*Perigo* · *Neutro*). Sem ela, a
única saída honesta seria a câmara perseguir tudo, e a câmara que persegue tudo
é a pior coisa que uma tela táctica faz.

**6. `A conta da luta` — pergunta antes de pedido.**
O fim do combate precisa da conta (espólio, XP, quem caiu) sobre o tabuleiro
apagado, com **uma porta só**. Eu acho que isto é `Veu` *Peso=Pesado* +
`O realce` *Grau=Realce* + um `Botao` *Papel=Chamada* de largura inteira, e
**nenhuma peça nova**. Confirma ou desmente — se desmentires, o motivo entra
aqui.

**7. `Barra de medida` cabe em 375?** *(medida, não gosto)*
A tira do herói carrega PV, PM, os metros que restam e os selos de acção, tudo
em 375 px. As seis variantes de `6:15` medem 138–164 px de largura; **duas já
são 276 e sobram 99 para o resto**. Ou há uma *Densidade=Compacta* (trilho +
número, sem rótulo, ~72 px), ou a tira do telefone quebra em duas linhas e come
16 px do campo. **Prefiro a compacta e digo porquê:** o rótulo `PV` é
redundante quando a barra vermelha está colada ao rosto do herói.

**8. A casa abaixo de 48 px, no "ver tudo".**
Existe um nível de zoom que é **só para olhar** (§3, R6). Ali a casa fica com
20–28 px e **deixa de ser alvo**. `A casa` *Estado=Impedida* diz "não dá" —
mas diz isso para uma casa de 48. Preciso de saber se *Impedida* continua
legível a 24 px, ou se o campo inteiro nesse zoom é outro tratamento (uma
mancha, e não um mosaico de casas mortas). **É a tua chamada; eu só declaro que
naquele estado nenhuma casa é tocável.**

**9. *Alcançável* esconde `o custo`, e a forma decidiu o contrário.**
Medido no nó `18:31`: nas sete variantes, `o custo` só está `visible` em *Sob o
dedo* e *Confirmando*. Mas a decisão escrita em `formas.md` é outra, e é
textual: *"o custo nasce escrito dentro da casa já em **Alcançável***". A peça
e a prosa discordam, e a prosa é que está certa — é o único canal de preço que
existe antes do toque. **O texto existe e está desligado; basta acendê-lo.**

**10. `Botao` *Impedido* é 19 px mais alto que *Repouso*.**
Medido: *Papel=Gesto* dá **44** em *Repouso* e **63** em *Impedido* (a razão
escrita cresce a peça). Uma barra de verbos em que um verbo impedido **empurra
o tabuleiro 19 px para cima** é uma barra que se mexe sozinha no meio do turno.
**O pedido: os quatro estados do `Botao` têm de ser isométricos** — a razão
cabe reservada, não acrescentada. Enquanto não for, esta tela põe a razão do
impedido **na linha do veredito**, que é o canal partilhado — e isso não fere a
lei *a razão nunca apaga*, porque ela continua escrita e na árvore; só muda de
endereço. Se discordares, escreve o teu lado aqui.

### A discordância que eu abro, com o meu lado e o teu

**A borda por casa e o contorno da união dizem a mesma coisa duas vezes.**
`A casa` *Alcançável* tem **borda âmbar a 55% por casa** (a que passa
3,41:1). O código desenha, e desenha bem, **o contorno da UNIÃO** do alcance —
`grade-de-batalha.jsx:40`, com o comentário a explicar exactamente porquê:
*"desenhar isso em vez de uma borda por célula é o que faz 'até onde eu chego'
virar uma FORMA — uma mancha com beirada — em vez de um mosaico de
quadradinhos"*.

**O meu lado:** com 86 casas alcançáveis, 86 bordas a 55% são 86 caixinhas, e o
tabuleiro volta a parecer a planilha que a v9.125 matou. **A proposta: o
contorno da união diz o ALCANCE; a casa só ganha borda própria a partir de
*Sob o dedo*.** Em *Alcançável* ela fica com o preenchimento a 10% e **o custo
escrito** — que é informação que o contorno não dá. Assim o âmbar a 55% fica
exactamente onde decide alguma coisa: na casa que está a ser considerada.
**O teu lado, que eu não vou fingir que não existe:** uma casa sem borda
própria perde o alvo como *objecto* — e o estado de foco do teclado passa a ser
a única borda de uma casa que não está sob o dedo. **A decisão é tua; o motivo
dos dois lados fica escrito, que é o que a lei da dupla pede.**

---

## 1 · O momento da troca

### A entrada é automática. E o motivo tem número.

A luta abre pelo sistema (`abrirCombate`) — o jogador não a pede. **Então a
tela também não se pede.** No turno em que o combate abre, a tela vira sozinha.

A alternativa era um gesto (*"entrar na batalha"*), e ela é pior por uma razão
medida: **um gesto pode ser recusado, e quem o recusa fica exactamente no
estado que esta fase existe para consertar** — o tabuleiro 429 px abaixo da
borda visível, o scroller em `scrollTop = 0` de 1129 possíveis, e 41 das 86
casas alcançáveis depois de rolar até ao fim. Uma tela que só conserta quem
aceita um convite não conserta nada.

**Não há aviso, e isso é decisão.** Um *"a batalha vai começar — ok?"* é uma
pergunta cuja única resposta possível é sim, e um diálogo cuja única resposta é
sim é um clique cobrado ao jogador para o sistema se sentir educado.

**O que acontece à prosa que estava na tela.** Ela não desaparece e não fica
atrás de um gesto: **as duas últimas falas do Mestre atravessam** e passam a ser
a faixa de abertura, por cima do tabuleiro, durante o primeiro turno. Motivo: a
fala que abre uma luta é *a descrição da luta a começar*. Cortá-la no instante
exacto em que ela está a fazer o seu trabalho é o pior corte possível. A partir
do segundo turno a faixa encolhe para **uma linha** — a última coisa que
aconteceu — e o resto do log fica a um gesto (§2).

**O movimento:** o tabuleiro cresce até ao lugar em **220 ms**, ease-out, e os
controles estão vivos desde o primeiro quadro — *nunca pode custar o turno*. Sob
`prefers-reduced-motion` a troca é a seco. 220 ms porque abaixo de ~100 ms a
troca parece um *corte* (o olho não acompanha a continuidade) e acima de ~300 ms
começa a ser espera; 220 é o meio da janela em que o olho segue o objecto e
aprende para onde a tela foi.

### A saída é confirmada. E o motivo também tem número.

Quando o último inimigo cai, **a tela NÃO volta sozinha**. O tabuleiro apaga
(`Veu` *Peso=Pesado*), e por cima vem **a conta**: espólio, XP, quem ficou
ferido, quem caiu. Debaixo dela, **uma porta só** — um `Botao` *Papel=Chamada*
de largura inteira, 48 de altura, a dizer **`seguir →`**.

Duas razões, e são opostas uma à outra — é por isso que a resposta é esta e não
uma das duas pontas:

1. **Voltar sozinho arranca a tela** no instante em que o jogador quer ler o que
   ganhou. O fim de uma luta é a única parte de uma luta que não tem pressa.
2. **Uma porta mal posta encerra a luta por engano** — e isto não é hipótese:
   numa partida minha o `⛺` encerrou uma luta inteira sem perguntar nada. Uma
   porta só, num sítio onde durante o combate não havia porta nenhuma, não pode
   ser tocada por engano: **não há memória muscular a apontar para lá**.

**E durante a luta não existe saída nenhuma.** O `⛺`, o `📜`, o trilho de abas
— todos somem (§2). O único modo de sair de um combate a meio é **fugir**, que é
uma jogada e não uma porta: usa `O gesto que custa`, *Etapa=Armado →
Perguntando*, com o preço escrito (*"os que estão colados ganham um golpe
livre"*). A peça existe e faz exactamente isto.

---

## 2 · O que a tela mostra, e o que ela esconde

A pessoa pediu *"uma tela só com o grid e as funções de batalha e utilitários"*.
Item a item, com o motivo.

### Sempre visível — cinco coisas, e só cinco

| o quê | porquê |
|---|---|
| **o tabuleiro** | é a razão de a tela existir. Tudo o resto é moldura. |
| **a tira do herói** — PV, PM, os metros que restam, a acção e a extra | são os quatro números que decidem toda escolha do turno, e hoje três deles vivem em painéis diferentes. Colada à borda de baixo, ao lado do polegar. |
| **a faixa da vez** | §4. |
| **os verbos** | §5. |
| **uma linha do que acabou de acontecer** (`O realce` *Grau=Nota*) | o log inteiro é ruído dentro de um turno; a última linha é a única que muda uma decisão. |

### A um gesto

- **o log da luta** — toque na linha do §anterior, ou arrastar para cima. O
  interruptor `🎲` das rolagens **vive aqui dentro**, junto do que governa, que
  é onde `formas.md` já o mandou pôr.
- **os companheiros** — um trilho compacto de PV/PM que abre em cartões. Em
  combate isto decide curar ou recuar, então fica perto; mas seis companheiros
  sempre abertos comem o campo.
- **a bolsa e as poções** — já não gastam o turno (v9.13). Ficam a um toque
  porque são a jogada de emergência, e uma jogada de emergência atrás de dois
  toques não é de emergência.
- **as habilidades (✦)** — uma gaveta na ponta direita da barra dos verbos. É
  uma **lista**, que varia por classe e por nível; lista nunca entra em fileira
  fixa (§5).

### Some durante a luta — e a lista é longa de propósito

Inventário, mapa, diário, códex, guilda, domínios, gestão, ascensão, **o trilho
de abas inteiro**, `Examinar`, `Tempo`, `⛺ acampar`, `📜 crônica`.

O critério é um só e é duro: **um controle que, tocado no meio de uma luta, ou
não faz nada ou termina a luta, não pode estar na tela da luta.** `Tempo` passa
horas. `⛺` acampa. O mapa viaja. `Examinar` apanha coisas do chão — e o chão
só interessa *depois*. Um controle que não pode ser usado ensina o jogador a
desconfiar da barra inteira, e desconfiar da barra custa o turno seguinte.

E a lei da casa aplicada à letra: **nada nesta tela diz que ela é uma tela.**
Não há título "modo batalha", não há selo "em combate", não há um botão a dizer
"sair do combate". O jogador sabe que está numa luta porque **a luta é o que
está na tela**.

---

## 3 · A proporção do tabuleiro — a decisão de ofício central

### O que eu medi, e que muda a pergunta

O campo **não é 16×16**. `grid.js` tem **dez plantas**, e nenhuma delas tem o
mesmo formato das outras:

| planta | campo | planta | campo |
|---|---|---|---|
| taverna | 12×9 | ruína | 16×14 |
| masmorra | **7×18** | navio | 10×16 |
| floresta | 16×16 | gelo | 16×16 |
| estrada | **18×12** | deserto | 18×14 |
| cidade | 14×14 | caverna | 14×14 |

**Máximo 18 de largura, máximo 18 de altura**, e a proporção varia de **0,39**
(masmorra, 7×18) a **1,50** (estrada, 18×12). Qualquer desenho que resolva "o
16×16" e não a família inteira quebra em duas plantas de dez. A 48 px por casa:
**864 px** no maior lado, nos dois eixos.

### As seis regras do enquadramento

**R1 — 48 px é o piso do alvo, e não dobra.** WCAG 2.5.5 (AAA) pede 44×44, a
HIG da Apple 44, o Material 48dp; `formas.md` fixou **48** por ser o menor
número que passa nas três. Quem encolhe **nunca** é o alvo.

**R2 — quem cede é a janela, não o campo.** O tabuleiro passa a ser uma
**janela sobre um campo**, que rola e arrasta. É a inversão exacta do que está
lá hoje, onde o campo encolhe até caber e a casa fica com 27 px embutida e 35
ampliada.

**R3 — quando a luta abre, a casa do herói está no centro da área livre.**
"Área livre" é a janela **menos a tira dos verbos**: o herói é empurrado para
cima, para fora da faixa que o próprio polegar tapa. Sem esta regra, a R2 é uma
armadilha nova — *"um tabuleiro que rola e abre no lugar errado é pior do que um
que não rola"*.

**R4 — a câmara só se move quando é obrigada.** Reenquadra quando quem age
chegaria a **menos de uma casa (48 px) da borda da janela** — nunca a cada
passo. Uma câmara que corrige todo passo faz o campo parecer escorregar debaixo
do jogador. Movimento: **180 ms**, ease-out; sob `prefers-reduced-motion`,
salta.

**R5 — na vez de um inimigo do outro lado do campo, a câmara NÃO vai atrás.**
A borda daquele lado ganha **`A marca de borda`** (pedido 5) com o nome e a
distância, tocável para olhar. Motivo: a decisão do jogador não depende de ver a
animação — depende do **resultado**, que chega na linha do que aconteceu e na
barra de vida do inimigo. E arrancar o campo debaixo de quem está a planear é a
coisa mais desorientadora que uma tela táctica faz.
**Uma excepção, e é a única: se a acção do inimigo ALCANÇA o herói**, a câmara
reenquadra para caberem os dois — porque aí o que aconteceu é sobre ele.

**R6 — existe um "ver tudo", e ele é para OLHAR, nunca para TOCAR.** Pinça, ou
o controle na borda, afasta até o campo inteiro caber; as casas caem para 20–28
px e **deixam de ser alvo**. É a versão honesta do que o `⤢ ampliar` promete
hoje e não cumpre — ele diz "tela cheia" no `title` e abre outro bloco dentro do
mesmo scroller clipado, **cortando 33% do campo**. Naquele estado a barra dos
verbos inteira fica `Botao` *Estado=Impedido*, com a razão escrita: **"toque no
campo para voltar a jogar"** — um gesto, não um mecanismo. Tocar em qualquer
sítio volta ao zoom jogável, centrado onde se tocou.

### Os números, nas duas telas que são prova de entrada

**1280×860 — e a metade preta acaba por construção.** A pilha vertical fecha
exactamente em 860, sem folga inventada:

```
cabeçalho                       48    0 → 48
a faixa da vez                  56    48 → 104
a régua do topo                 20    104 → 124
—— a janela do campo ———————— 576    124 → 700   (12 linhas × 48)
a linha do veredito             24    700 → 724
a barra dos verbos              88    724 → 812
a tira do herói                 48    812 → 860
                               ————
                                860
```

E a horizontal, que é onde a metade preta morre:

```
margem 24 │ régua 20 │ janela do campo 892 │ goteira 24 │ coluna 296 │ margem 24
```

= 1280 exactos. **1232 px de 1280 são jogo — 96,3%.** Hoje o jogo ocupa **560
px à esquerda e mais de metade da tela fica preta**.

**Na largura, o problema acaba: 892 px cabem 18 casas, e 18 é o máximo que
existe.** Todas as dez plantas aparecem inteiras na horizontal, sem rolar.
**Na altura, não — e digo o número em vez de o enfeitar:** 12 linhas de até 18.
Das dez plantas, **duas** (taverna 12×9 e estrada 18×12) aparecem **inteiras**;
as outras oito rolam **na vertical, e só na vertical**. Hoje o campo inteiro
vive num scroller de **301 px** com `overflow: hidden auto` — a 48 px por casa
isso são **seis linhas**, e as casas nem 48 têm: são 27 embutidas e 35
ampliadas.

**375×812 — retrato, e é critério de entrada.**

```
cabeçalho                       44    0 → 44
a faixa da vez                  48    44 → 92
a régua do topo                 20    92 → 112
—— a janela do campo ———————— 480    112 → 592   (10 linhas × 48)
a linha do veredito             24    592 → 616
a barra dos verbos             144    616 → 760
a tira do herói                 48    760 → 808
folga do indicador               4    808 → 812
```

Horizontal: `margem 8 │ régua 20 │ janela 339 │ margem 8` = 375. Janela **339 ×
480** → **7 colunas × 10 linhas = 70 casas** sempre na tela.

**A barra dos verbos no telefone é 144 e não 96, e a diferença é medida, não
sobra.** Tentei a fileira única e ela não fecha: em 359 px, seis rótulos com
palavra pedem ~52 px cada, e `Empurrar` em 52 px **não é um rótulo, é um glifo
mudo** — um verbo de combate que só se lê pelo símbolo é o sistema a falar por
sinais. Então são **três fileiras de 44**, e todas com a palavra inteira:

```
fila 1 ·  [ Atacar  235 ]            [ ✦  56 ]  [ ❝  56 ]
fila 2 ·  [ Mover 110 ] [ Esquivar 118 ] [ Empurrar 119 ]
fila 3 ·  [ Derrubar 120 ] [ Saltar 100 ] [ esperar 127 ]
```

**`Atacar` ocupa dois terços da primeira fileira**, e no telefone a diferença
dele deixa de ser "maior" e passa a ser **outra escala**: 235 px de largura
contra os 110–127 de todos os outros. É o único *Chamada* da tela.
O `esperar` continua *Papel=Recuo* e continua **na ponta**, que é a posição do
Recuo em toda a casa — só que na ponta da última fileira, e não da primeira.

**E o texto livre no telefone é um botão (`❝`), não um campo — e isso não lhe
tira nada.** Aberto, o teclado tapa metade do campo de qualquer maneira;
colapsado, ele **custa zero pixel ao tabuleiro até ao momento em que é usado**.
É a única troca desta tela em que esconder é melhor que mostrar, e é porque a
coisa escondida **traz o teclado consigo**.
Hoje o jogador vê **41 das 86 alcançáveis, e só depois de rolar sozinho até ao
fim de um scroller de 1129 px que não rolou sozinho.** A diferença que importa
**não é 77 contra 41**: é que estas 77 são **sempre as 77 certas**, porque a
câmara enquadra o herói (R3) e o segue quando precisa (R4).

**E escrevo isto em vez de o esconder: no telefone nunca se vê o campo
inteiro.** 7 de 18 colunas. É por isso que a R6 existe, e é por isso que ela é
só para olhar — fingir que 18 casas cabem em 375 px só se consegue com casas de
20 px, que é o defeito que estamos a consertar.

**A rotação: permitida, nunca forçada, nunca travada.** Em paisagem os dois
polegares estão nos lados, e uma tira em baixo é exactamente onde nada alcança
— então em paisagem **os verbos vão para uma coluna à direita e a tira do herói
para a esquerda**, e o campo fica no meio. A câmara guarda a mesma casa central
na rotação: rodar o telefone nunca perde o lugar.

---

## 4 · Onde vive a ordem da vez

**Uma faixa horizontal, no topo da área do campo, largura inteira, 56 px (48 no
telefone).** As três alternativas, e por que caem:

- **Coluna lateral** — rouba largura, e a largura é o eixo escasso: em 375 px
  uma coluna de 96 tira duas colunas de casas de sete.
- **Por cima das casas** — o tabuleiro é a única superfície que nunca pode
  carregar moldura. Ali o pixel é informação de jogo.
- **Dentro de um painel que se abre** — a pergunta *"de quem é a vez?"* é feita
  várias vezes por turno; uma resposta atrás de um gesto é uma resposta que se
  deixa de procurar.

**A forma:** um `Selo de estado` por combatente, na ordem, da esquerda para a
direita, com o **nome escrito** — nunca cor sozinha (WCAG 1.4.1). *Tom* por
lado: herói **Bom**, aliados **Neutro**, inimigos **Perigo**. Quem está a agir
leva ***Mudou=Agora***, os três pulsos do halo, e pára.

**Quantos se vêem:** **seis** em 375 px, **catorze** em 1280 (56 px cada, com
goteira). Com dez ou mais a faixa **rola na horizontal**, com o actor a um terço
da esquerda — e **o selo do herói fica fixado na ponta esquerda, separado por um
filete, e nunca sai**. A única coisa que ninguém pode ter de procurar rolando é
a sua própria vez.
**Quem cai sai da faixa** — não fica riscado. Uma luta de dez inimigos com sete
caídos seria uma faixa de cadáveres a empurrar os vivos para fora do olhar.

### Como o jogador sabe que é a vez dele sem ler a palavra "iniciativa"

**Três canais ao mesmo tempo, e nenhum deles é a palavra.**

1. **O selo dele** na faixa é o que carrega *Mudou=Agora*.
2. **O tabuleiro acende.** O contorno âmbar do alcance **só existe no turno
   dele** — é o sinal verdadeiro, e o código já o produz.
3. **Os verbos ficam vivos.** Na vez de outro, cada verbo é `Botao`
   *Estado=Esperando* com a razão escrita: **"é a vez de Halvard"**. O nome
   dele, não o nome do mecanismo.

E o rótulo da faixa **não é `ORDEM DE INICIATIVA`**: é a frase **`agora:
Halvard`**, à esquerda. Se o trabalho da faixa é responder àquela pergunta, ela
pode muito bem dizer a resposta. *(O tom `Bom` para "é a sua vez" já foi
fechado em D4 e fica: é o convite da rodada, não um aviso.)*

---

## 5 · Os controles de combate

**O facto que muda o conteúdo desta tela**, achado a jogar em D5 e já em fila
para o motor (X2): **`Atacar` não ataca.** Dos 20 botões do painel `Ações`
(`App.jsx:20548`), os 12 de cima fazem `setEntrada(a.texto)` — `Atacar` escreve
`"Ataco "` na caixa — e os 8 de baixo chamam `declararAcaoRapida(id, motivo)` e
entram no motor. **Nenhum dos 8 é de combate.** Vasculhar e Escutar atravessam o
sistema; Atacar, Esquivar, Empurrar, Derrubar e Saltar ficam do lado que
escreve. **Esta tela é desenhada para o jogo que vai existir**: os verbos
disparam o motor.

### Seis verbos, posições fixas, sempre os mesmos seis

Fixo, porque uma fileira que muda é uma fileira que se lê todo turno, e uma que
nunca muda aprende-se em duas lutas e usa-se sem olhar. A ordem é por quanto o
turno precisa de cada um:

| # | verbo | papel | porquê aqui |
|---|---|---|---|
| 1 | **`Atacar`** | `Botao` *Papel=Chamada*, **largura dupla** | é o verbo primeiro, e o código já o diz: *"é a ação que o jogador procura primeiro"*. Hoje a distinção dele é **uma cor de borda** entre doze botões iguais. Aqui é **tamanho e preenchimento** — e é o único Chamada da fileira. |
| 2 | **`Mover`** | *Gesto*, aceso por omissão | é o modo em que o tabuleiro já nasce; o botão existe para **voltar** da mira. Carrega os metros que restam na sua própria `Consequencia` *Linha*. |
| 3 | **`Esquivar`** | *Gesto* | é a única defesa que a mesa já tem, e a que custa o turno inteiro — precisa do preço escrito mais que qualquer outro. |
| 4 | **`Empurrar`** | *Gesto* | move o inimigo: é decisão espacial, e esta tela é sobre espaço. |
| 5 | **`Derrubar`** | *Gesto* | |
| 6 | **`Saltar`** | *Gesto* | |

E, **separado por uma goteira, na ponta esquerda**: **`esperar`**, `Botao`
*Papel=Recuo* — a posição que o Recuo tem em toda a casa. `formas.md` já o
decidiu em *não agir*, e ele é o oposto dos seis: é por isso que está do outro
lado da goteira e não no fim da fila.

`Habilidades (✦)` é **uma gaveta na ponta direita**, não um verbo. Motivo: é
uma lista que varia por classe, por nível e por PM. Lista nunca entra em fileira
fixa — no dia em que o mago aprende a sétima magia a fileira deixa de ser fixa.

### O veredito antes do clique

**Uma `Consequencia` *Forma=Linha*, colada por baixo da fileira, sempre
presente, 24 px.** Nunca balão: `formas.md` já fechou que **sobre o tabuleiro a
Consequência é sempre *Linha***, porque quatro segundos de balão tapam
exactamente as casas para onde o jogador ia andar.

A sequência, e é a mesma nos dois dispositivos:

1. **tocar (sem largar) ou pairar o verbo** → a linha enche com o preço geral, e
   **o campo pinta o conjunto que aquele verbo alcança**.
2. **largar / clicar** → o tabuleiro entra na mira daquele verbo.
3. **tocar uma casa** → a linha passa a ler o alvo: **`H20 · 4,5 m · custa um
   golpe livre`**.
4. **resolver** — e aqui a lei do passo limpo estende-se: **um golpe limpo num
   alvo já ao alcance é UM toque.** O segundo toque só existe quando o acto
   custa algo além de si mesmo (abrir a guarda, gastar a extra, terminar colado
   a quem ainda está de pé). Dois toques por acto transformam o tabuleiro num
   formulário — é a mesma frase que já governa o passo.

### Como se cancela uma mira já começada

**Três saídas, as três vivas ao mesmo tempo**, porque a única coisa que nunca
pode prender o jogador é um modo de mira:

- **`Esc`** (e o gesto de voltar, no telefone);
- **tocar o verbo outra vez** — ele está aceso enquanto armado (`A escolha`
  *Estado=Escolhida*);
- **tocar o campo fora do conjunto armado.**

E o estado armado **nunca é mudo**: enquanto há mira, a linha do veredito
termina com **"toque fora para desistir"**. Um véu sem saída que não *diz* que
tem saída é a armadilha que a peça *Véu sem retorno* existe para impedir — e
aqui ela estaria montada por acidente.

### Onde fica o texto livre agora

**Continua, e muda de papel.** Deixa de ser uma barra a competir com os verbos e
passa a ser **uma linha única por baixo deles**, 44 px, com o balão à esquerda —
e o convite muda de `"O que você faz?"` para **`como? (opcional)`**.

Porque isso passou a ser verdade: o que ele escreve já não decide **se** o golpe
acontece, diz **como** — viaja como `motivo`, exactamente como
`declararAcaoRapida(id, motivo)` já faz hoje com os oito de baixo. *A frase
deixa de ser a sintaxe obrigatória e vira o tempero.*

Duas regras que vêm com isso: **o campo nunca é `disabled` enquanto há um verbo
armado** — escrever e mirar são compatíveis, e é esse o ponto inteiro —, e no
telefone ele fica colapsado numa linha de 44 px que só cresce no foco, para não
comer o campo com um teclado que ainda não abriu.

---

## 6 · O endereço de xadrez

- **Colunas por letra (A…R — são 18, o máximo que existe), linhas por número
  (1…18).** Letra primeiro, número depois, porque foi assim que a pessoa
  escreveu: *"H20"*.
- **A régua é permanente, em duas bordas — topo e esquerda.** 20 px, mono 10,
  `inkDim`. Não nas quatro: duas bastam para ler um par, e as outras duas
  custariam 40 px de campo em 375 px, que é quase uma coluna de casas.
- **A régua é presa à JANELA, não ao campo.** Quando o campo rola, os rótulos
  mudam e a régua fica colada à borda. Uma régua que rola para fora é uma régua
  que desaparece no momento exacto em que serve: quando se está a olhar para
  uma casa longe.
- **Cada quarta linha da malha é um grau mais clara.** É a coisa mais barata que
  existe para trocar *"contar da borda"* por *"contar da linha grossa mais
  perto"* — é o que o xadrez ganha das casas alternadas e este tabuleiro não
  pode ter, porque o chão já carrega o terreno (lama, cobertura, região).
- **O endereço escrito dentro da casa só nos dois estados que já carregam
  texto** — *Sob o dedo* e *Confirmando* —, na primeira linha, acima do custo.
  Em *Alcançável*, só o custo. 86 endereços acesos ao mesmo tempo é a planilha.
- **No telefone, onde *Sob o dedo* não existe antes do toque**, o endereço tem
  segunda casa: **a linha do veredito lê sempre o endereço do alvo armado**.
  Um canal que não seja o rato tem de existir, e este existe nos dois.

### Como ele serve aos DOIS caminhos

O clique na casa e a frase *"vou até H20"* são a mesma coisa vista de dois
lados, e a régua é o que os liga: **o jogador lê `H20` na borda e escreve `H20`
na caixa.** Não precisa de mais nada da tela.

**O que eu declaro ao `backend` e não desenho** (a conversão é regra, sai de
tabela, é provável em Node e não nasce dentro da tela):

1. **A gramática JÁ EXISTE, e não pode nascer uma segunda.** `src/coordenadas.js:151`
   define `LETRAS_DA_GRADE = "ABCDEFGHIJKLMNOPQRST"` e `gradeDe()` devolve
   `` `${LETRAS_DA_GRADE[cx]}${cy + 1}` `` — **letra na horizontal, número na
   vertical, número a começar em 1**. É a grade do ermo, não a do combate, mas é
   a mesma pergunta e já tem resposta escrita. **O tabuleiro tem de ler desta
   tabela**, não fabricar outra: duas tabelas de letras no mesmo jogo é a doença
   que esta mesa existe para impedir, um andar abaixo.
2. **A origem é A1 no canto superior esquerdo** — que é o que `cy + 1` já faz, e
   é também o que o `y` de `grid.js` pede, porque ele cresce para baixo.
3. **As letras não saltam nenhuma** — 18 colunas são A…R, com o `I` incluído; a
   tabela de `coordenadas.js` já o confirma (vinte letras seguidas, sem buraco).
4. **O log tem de escrever o endereço de volta.** `você avança até H20`, e não
   `você avança`. Um endereço que o jogo nunca usa é um endereço que o jogador
   nunca aprende — e isto custa uma string, é o ensino mais barato que existe.

---

## 7 · O celular, onde a mão tapa o tabuleiro

É critério de entrada, e por isso está nos números do §3 e não aqui em baixo.
O que fica só aqui:

- **Os controles em baixo, o campo por cima.** A mão tapa a tira — que é o que
  ela está a tocar — e não o campo.
- **O arco do polegar**, numa pega de uma mão em 375×812, chega
  confortavelmente aos ~520–560 px de baixo. A tira dos verbos (88) e a do herói
  (56) vivem nos 144 px de baixo, fundo no arco. **O terço de baixo do campo
  também está dentro do arco** — e é exactamente por isso que a R3 enquadra o
  herói no centro da **área livre** e não no centro geométrico: empurra-o para
  cima, para fora da zona que o próprio polegar tapa ao tocar nele.
- **O estado *Sob o dedo* não existe antes do toque** (`formas.md` já o disse).
  A consequência prática, e é a razão de a linha do veredito ser permanente: o
  custo nasce **escrito dentro da casa** já em *Alcançável*, e o preço completo
  vive na linha. **Zero informação de combate depende de `hover`.** Hoje a rota
  prevista só existe em `onMouseEnter` (`grade-de-batalha.jsx:543`) e a única
  descrição da casa é um `<title>` de SVG — **dois canais de rato**, num jogo
  que se joga com o dedo.
- **A tela roda, e nunca é forçada** (§3).
- **Em retrato vê-se 7×11 = 77 casas.** Escrito sem eufemismo: **nunca o campo
  inteiro.**

---

## 8 · O lugar reservado para a reação (Fase K)

Não a desenho aqui. **Mas o lugar dela está marcado, e a marca é um número.**

**A reação vai morar na linha do veredito** — a faixa de 24 px entre o campo e
os verbos. Três razões:

1. **Já existe em todo estado da tela.** Uma peça que aparece do nada tem de
   arranjar lugar; uma que cresce de uma linha que já estava lá não empurra
   nada.
2. **Está dentro do arco do polegar**, e a reação é a única coisa desta tela que
   tem relógio a correr.
3. **É o sítio certo por significado:** entre o tabuleiro (o que acabou de
   acontecer) e os verbos (o que se pode fazer). Uma pergunta sobre um golpe que
   chega pertence exactamente ali.

**E a peça deixou de ser hipótese a meio desta etapa:** o `desenho` fabricou
***A pergunta que expira*** — nó **`31:518`**, 4 variantes (*Etapa* Chamando ·
Escolhendo × *Tempo* Barra · Contagem). **Com ela medida, a minha reserva de 96
px estava errada, e corrijo-a aqui em vez de a defender:**

| etapa | tamanho | o que faz à tela de 375 |
|---|---|---|
| *Chamando* | **344 × 193** | cabe em largura; em altura pede 193 |
| *Escolhendo* | **344 × 332** | 332 é **69% da janela do campo** (480) |

**A correcção, e é uma regra: a pergunta SOBREPÕE, nunca EMPURRA.** Empurrar
move as casas que o jogador estava a ler no exacto segundo em que ele tem de
decidir depressa — é a pior coisa que se pode fazer a uma janela com relógio.
Sobrepor deixa tudo onde estava.

**O orçamento, em números, e é o que fica reservado:**

- ela nasce **colada à linha do veredito e cresce para cima**, ancorada em
  baixo — o topo do campo nunca se mexe, e **a câmara nunca se mexe**;
- *Chamando* (193) come a linha do veredito (22) e **171 px do terço de baixo
  do campo**;
- *Escolhendo* (332) come também a barra dos verbos (144) — o que é correcto:
  **enquanto a pergunta está de pé, os verbos do seu turno não são a decisão**.
  Sobram 480 − 166 = **314 px de campo à vista**, e a casa do herói está dentro
  deles porque a R3 o enquadra na área **livre**, que é justamente a metade de
  cima;
- em 1280 a mesma peça cabe na coluna da direita (296 de largura contra 344 —
  **falta-lhe 48**, e é o único sítio onde ela não entra sem mudar de forma).
  **É o que eu peço a seguir, e não hoje:** uma densidade que caiba em 296, ou
  a decisão de que no desktop ela também sobrepõe o campo.

**A reserva, dita como restrição para quem construir:** *o terço de baixo da
janela do campo é território emprestado — nenhum elemento desta tela pode
depender de estar visível ali.* Com esta frase escrita hoje, a terceira batida
não nasce enfiada num canto daqui a duas fases.

---

## Para a pessoa decidir

### A · O turno monta-se antes de acontecer

**O que ele vive hoje, contado.** Uma rodada de combate é: abrir o painel
`Ações` (1 toque), tocar `Atacar` (1 toque, que **escreve `"Ataco "` na
caixa**), escrever o alvo (~15 toques de teclado), tocar `Agir →` (1 toque) — e
**o golpe ainda pode não acontecer**. Medido a jogar em 15/09, campanha *O Fio
de Prata*, 7 turnos com o Narrador vivo: **declarei ataque três vezes, em
português sem ambiguidade, dentro de um combate aberto, com iniciativa rolada e
o tabuleiro montado. Zero rolagens de ataque.** No fim: PV 20/20, PM 6/6, XP
89/300, relógio 08:45 — os mesmos quatro números do primeiro turno.

**A proposta.** O turno deixa de ser uma declaração e passa a ser **uma frase
que se monta no tabuleiro e se paga de uma vez**: o jogador encadeia *andar até
H14 → atacar Halvard*, e a linha do veredito mostra **o total a correr** — os
metros gastos, a acção gasta, os golpes livres que aquilo provoca — **antes de
qualquer coisa acontecer**. Só então ele confirma. É o turno do 5e e do BG3, e é
o que faz um turno táctico parecer uma **decisão** em vez de uma submissão.

**Porque isto é dela.** Hoje a regra é `App.jsx:3079` — *"Agir É encerrar"* — e
esta proposta pede ao motor que **segure um turno por confirmar**. Isso é
`backend` e é regra nova. E o jogador reaprende uma coisa, uma só: **que agir
deixou de encerrar, e que existe um momento entre escolher e pagar.** Isso é
fluxo, e fluxo é dela.

**A prova, pelos três caminhos.** *Experiência jogada* — a sessão acima, e a
outra em que numa luta inteira toquei **três** controles: duas casas e o `⛺` que
a encerrou por engano. *Medida* — hoje são 4 toques mais ~15 de teclado para um
golpe que pode não acontecer; com a frase montada são 2 toques para um golpe que
**acontece**, com o preço visto antes. *Estudo citado, e a origem é esta casa* —
o cabeçalho de `src/reacoes.js` escreve que *"no 5e e no BG3 metade da tensão do
combate mora"* na janela entre o golpe e a resposta; a outra metade mora nesta,
entre a escolha e o pagamento.

**O risco, dito por mim.** Um turno que se confirma é um turno com mais um
toque. A defesa: **o passo limpo continua a ser um toque** e o golpe limpo
também — a montagem só existe quando o jogador **encadeia**, e encadear já é
dizer que ele quer decidir antes de pagar. Quem não encadeia nunca vê a
diferença.

### B · O tabuleiro conta o que o inimigo VAI fazer

**O que ele vive hoje.** O golpe do inimigo chega como texto, depois de ter
acontecido. Resultado medido na mesma sessão: **fiz zero decisões espaciais**,
porque nada no campo pagava por estar num sítio em vez de noutro. Um tabuleiro
onde a posição não muda nada é um tabuleiro decorativo — e este tem paredes com
cobertura, terreno que cobra, alcance por tamanho e golpe livre por dar as
costas. **A regra está toda lá; o que falta é o jogador poder usá-la.**

**A proposta.** Antes do turno do inimigo, **o campo mostra o que ele vai
fazer**: as casas que ele ameaça acendem em contorno `danger`, com o alvo
escrito. O jogador vê e decide — sair, cobrir-se, aceitar. É o desenho do *Into
the Breach* (Subset Games, 2018), que é o caso canónico: a dificuldade deixa de
estar em adivinhar e passa a estar em **resolver**, e é a diferença entre um
combate que se sofre e um que se joga.

**Porque é dela.** Exige que o motor **decida a acção do inimigo uma batida
antes e a honre** — regra nova, `backend`. E o jogador reaprende que **o
tabuleiro diz o futuro**, que é a coisa mais forte que se lhe pode ensinar sobre
esta tela. *(E tem um parente já aprovado: é a mesma ideia de S1 — o motor não
muda, muda quando o jogador fica sabendo.)*

**O risco.** Um campo que anuncia tudo tira o susto. A defesa é de tabela e não
de desenho: **nem toda acção se anuncia** — o anúncio é um atributo da criatura
(o troll telegrafa, o assassino não), e aí a ausência do anúncio passa a ser
informação também.

---

## No Figma

Página **`A batalha`** — nó **`30:12`** —, no arquivo `Taverna — biblioteca`
(`e5wJUzInAssoebx5npssKc`). **Nenhum segundo arquivo.** Tudo ligado a variável,
**zero hex solto**; quadro que só organiza leva `fills = []`.

| quadro | nó | o que prova |
|---|---|---|
| **`1280×860 · a luta`** | `31:2` | a pilha fecha em 860 exactos e **1232 de 1280 são jogo**; 16 colunas e 12 linhas na janela; a metade preta acabou |
| **`375×812 · a luta no telefone`** | `40:447` | retrato, **7×10 = 70 casas**, a câmara no herói, os verbos todos com palavra e ≥44 px |
| **`a entrada — 220 ms, e a prosa atravessa`** | `35:175` | as duas últimas falas do Mestre por cima do campo que acabou de chegar |
| **`a saída — uma porta só`** | `35:372` | véu pesado, a conta da luta, e **um** `Botao` *Chamada* de 1232 px onde durante a luta não havia porta |
| **`o veredito antes do clique`** | `35:569` | `Atacar` armado, a grelha inteira em *Mira*, `Mover` impedido, e o preço escrito na linha |
| **painel de entrega** | `44:525` | as decisões, os dez pedidos e as armadilhas, ao lado dos quadros |

Instâncias usadas, sem nenhuma redesenhada por dentro: **`A casa`** (7 estados),
**`Botao`** (Chamada · Gesto · Recuo · Impedido · Foco), **`Selo de estado`**
(Tom × Mudou, na faixa da vez), **`Barra de medida`** (Alta · Baixa · Golpe),
**`Consequencia`** *Tom=Preço, Forma=Linha*, **`A escolha`** *Forma=Pílula*,
**`O realce`** *Grau=Realce*.

E **`A regua`** (`30:11`), do `desenho`, publicada a meio desta etapa e já
montada nos cinco quadros — a coluna `H` e a linha `12` em *Estado=Realcada*,
que é o *Sob o alvo* que eu tinha pedido.

**Duas coisas nestes quadros NÃO são instância, e estão declaradas:** a marca de
borda (pedido 5, ainda por fabricar) e o campo em si — chão, regiões, malha,
véu, contorno da união, fichas e estorvos —, que é **cena** e já existe em SVG.
A faixa da vez está montada com `Selo de estado` **à espera de `A vez`
*Forma=Selo*** (pedido 4): é remendo declarado, não desenho.

### As armadilhas do Figma que esta etapa pagou, e que ainda não estavam escritas

1. **Uma INSTÂNCIA nasce com o alfa em 1.** `createInstance()` de uma variante
   cujo preenchimento é uma variável **com opacidade** devolve a tinta ligada e
   o alfa **descartado** — o componente diz 0,1 e a instância renderiza 1. Não é
   o `setBoundVariableForPaint` de D4: é o `createInstance`, e também acontece
   ao **trocar de variante** com `setProperties`. As sete casas saem em âmbar
   chapado outra vez. **A cura:** depois de criar (ou de mudar variante),
   percorrer a instância e o componente em paralelo e **repor a opacidade a
   partir do componente, com duas atribuições** — a primeira é comida.
2. **`resize()` é ignorado dentro de auto-layout enquanto o nó estiver em
   `HUG`.** Um `Botao` de 235 px fica com os 118 do rótulo e ninguém avisa. A
   ordem é `layoutSizingHorizontal = "FIXED"` **e só depois** `resize()`. É a
   irmã da armadilha de D4, que dizia o contrário para nós soltos — as duas são
   verdade, em contextos diferentes, e é por isso que as duas ficam escritas.
3. **O `get_screenshot` e o `node.screenshot()` discordam.** O primeiro serve
   render em cache e mostrou, várias vezes nesta etapa, o estado **anterior** à
   escrita — âmbar chapado depois de o alfa já estar reposto, larguras velhas
   depois do `resize`. **Confira pelo dado lido de volta, nunca pela foto**; e
   se precisar de foto, use `await node.screenshot()` dentro do mesmo script.

---

## O que não coube, e o que eu não sei

- **O tempo da janela da reação** é da Fase K (K1) e não desta. Aqui reservei o
  espaço e o número (96 px); quanto dura a barra é decisão de lá.
- **Não joguei esta tela**, porque ela não existe. Tudo o que está aqui com
  número saiu de **medir o código e a tela de hoje** e de **jogar o que há
  hoje** — e onde é opinião de ofício, disse que é e disse porquê. A régua da
  casa exige par comparável: **o par desta etapa só existe em E3**, e é lá que a
  prova se paga.
- **Não sei o que acontece com seis companheiros e dez inimigos ao mesmo
  tempo.** A faixa da vez resolve dezasseis por rolagem e fixação, mas nunca vi
  uma luta assim; se ela existir, é a faixa que quebra primeiro.
- **A paisagem está decidida e não está desenhada.** O §3 diz o que acontece ao
  rodar o telefone — as tiras vão para os lados, o campo fica no meio — e não há
  quadro para isso. É uma decisão sem par visual, e fica assim dita em vez de
  fingir que foi provada.
- **O "ver tudo" (R6) está decidido e não está desenhado**, e é de propósito:
  depende do pedido 8 ao `desenho` (como é que uma casa diz "não sou alvo" a 24
  px). Desenhar antes da resposta era desenhar duas vezes.
- **Não medi o arco do polegar neste telefone.** Os ~520–560 px são do consenso
  de ergonomia móvel, não de uma medição minha nesta tela; usei-os só para
  decidir **a direcção** (empurrar o herói para cima), e essa direcção não muda
  com o número exacto.
- **O tabuleiro destes quadros é uma planta de dez.** Usei a floresta 16×16
  porque é a que a pessoa citou. As outras nove estão na tabela do §3 e a regra
  foi desenhada para a família inteira — mas quem quiser ver a masmorra 7×18
  numa tela de 1280 vai ter de compor esse quadro, e ele não existe.

---

# A segunda rodada

**O `regente` devolveu a etapa com um número do meu par, e o número derruba a
minha pilha.** Fica escrito aqui, e o que está acima **não foi reescrito** — um
arquivo que apaga o engano perde a prova de que ele foi corrigido.

## 1 · O arranjo final: duas colunas, e a conta que o decidiu

O `desenho` mediu os três arranjos possíveis contra as dez plantas de
`grid.js`, e a conta dele está certa:

| arranjo | altura útil do campo | plantas inteiras |
|---|---|---|
| **a pilha — a minha** | 596 − 22 de régua = **574** → 11,95 casas | **1 de 10** |
| verbos e tira à direita | 732 − 22 = **710** → 14,8 casas | 6 de 10 |
| **duas colunas — a dele** | campo 888 × 828 | **9 de 10** |

E o detalhe que me convenceu antes do resto: **a 18×12 falhava na minha pilha
por dois pixels.** Dois. Um número assim não se defende com argumento de
momento; defende-se mudando o arranjo.

**O argumento dele é de ofício e eu não tenho como o derrubar:** em 1280×860
**o eixo que sobra é o horizontal e o que falta é o vertical**, e empilhar gasta
o escasso para poupar o abundante. *"1 de 10 contra 9 de 10"* não é preferência,
é uma ordem de grandeza. **Não tenho razão de momento que valha nove plantas**,
e escrevo isso em vez de inventar uma.

**O arranjo, como ficou, e fecha em 1280×860 exactos:**

```
respiro 16 │ a coluna do campo 888 │ goteira 16 │ a lateral 344 │ respiro 16
respiro 16 │ ———— 828 de altura, as duas colunas ———— │ respiro 16
```

A coluna do campo, por dentro: **régua do topo 22 + janela 866×806**.
866 ÷ 48 = **18 colunas** — e 18 é a planta mais larga que existe.
806 ÷ 48 = **16 linhas**.

A lateral, de cima para baixo, e a ordem é a minha lei do §2 aplicada à letra —
**o que é sempre visível em cima, o que é um gesto no meio, o que se toca em
baixo**:

```
a ordem da vez (4 linhas de A vez + a rolagem)   220
o que acabou de acontecer (O realce)             114
ao seu lado                                       82
a um gesto: ⌃ o log da luta · ◆ bolsa (9)         44
—— folga ——                                       46
a linha do veredito                               15
a barra dos verbos (3 fileiras de 44)            144
o texto livre                                     44
a tira do herói (2 linhas)                        55
```

**O cabeçalho saiu, e é a minha própria lei a cobrar-me:** *nada nesta tela diz
que ela é uma tela*. A marca e o `✓ salvo` são moldura, não jogo — e em duas
colunas eles custavam 48 px de altura ao campo. Saíram.

## 2 · Quantas plantas cabem agora

**Nove de dez, inteiras, sem rolar nada.** Só a **masmorra 7×18** transborda, e
transborda **58 px — uma casa e um quinto** (18 × 48 + 22 de régua = 886 contra
os 828 da coluna). Contra **uma de dez** na pilha.

E o quadro `1280×860 · a luta` mostra isso de verdade: a **floresta 16×16
aparece inteira**, as 256 casas, com as réguas A…P e 1…16 nas duas bordas.
**A marca de borda saiu deste quadro**, e a razão é honestidade: com o campo
inteiro à vista não há nada fora da janela, e uma marca que aponta para nada
mente. Ela fica no telefone, onde tem mesmo o que marcar.

**O que os 96,3% de tela usada viraram:** continuam de pé, e melhoraram — 1248
dos 1280 px são conteúdo. O que mudou foi **para onde a largura vai**: antes ia
para uma coluna de 296 ao lado de um campo espremido; agora vai para um campo de
888 que não rola.

## 3 · O que mudou no telefone

A decisão nova tocou-o por uma razão só, e é a mesma: **o cabeçalho é moldura**.
Se ele saiu de 1280, sai de 375.

```
a faixa da vez            48    0 → 48
a régua do topo           22    48 → 70
—— a janela do campo ——— 528    70 → 598    (11 linhas × 48)
a linha do veredito       22    598 → 620
a barra dos verbos       144    620 → 764
a tira do herói           44    764 → 808
a folga do indicador       4    808 → 812
```

Janela **337 × 528** → **7 colunas × 11 linhas = 77 casas**, contra as 70 da
primeira rodada. Os 44 px do cabeçalho compraram **uma linha inteira e 4 px de
folga**. O resto não mudou: a faixa continua horizontal (no telefone a largura
**é** o eixo escasso, e ali o meu argumento do §4 continua de pé), os verbos
continuam em três fileiras com a palavra inteira, e o campo continua enquadrado
no herói dentro da área livre.

## 4 · A discordância da borda — FECHADA, e eu cedi

**O lado dele, com o número:** a borda âmbar a 55% sobre `bg` dá **3,41:1** e é
o que passa o **WCAG 1.4.11** (não-texto). O preenchimento, entre 10% e 28%,
fica entre **1,15:1 e 1,71:1** — profundidade, nunca informação. *E se o
contorno da união passar a carregar o alcance sozinho, ele tem de passar na
mesma régua.*

**O meu lado era:** 86 bordas a 55% são 86 caixinhas, e o tabuleiro volta a
parecer a planilha que a v9.125 matou; o contorno da união já diz "até onde eu
chego" como **forma**, com beirada.

**A decisão: a borda por casa FICA. Cedo eu, e cedo pelo número.** Duas razões,
e a segunda é mais forte que a primeira:

1. **O contorno passa a régua, mas não responde à pergunta certa.** O meu
   contorno é âmbar a 60%, 2,2 px, tracejado — portanto **acima dos 3,41:1**, e
   passaria. Mas o 1.4.11 exige que o indicador identifique **o componente**, e
   o componente é **a casa** (`role="button"`, uma por casa), não o conjunto.
   Uma casa no meio da mancha não tem beirada âmbar nenhuma: tem a malha, que é
   `line` e não diz "alvo". **O contorno identifica a região; a borda identifica
   o alvo.** São perguntas diferentes, e por isso não são duas formas da mesma
   coisa — eu estava errado a chamar-lhes duplicação.
2. **O defeito que eu temia já foi curado, e não por mim.** O que fazia 86
   bordas parecerem mosaico era serem **caixas vazias**. Com `A casa` corrigida,
   cada alcançável tem **o custo escrito dentro** (`4,5`, `1,5`, `6,0`) — deixa
   de ser uma caixa e passa a ser uma **etiqueta de preço**. Está nos quadros, e
   vê-se: nove casas com número dentro não lêem como planilha, lêem como campo.

**O corte que sobrevive do meu lado, e é regra para durar:** o contorno da união
e a borda por casa **não podem ter o mesmo ritmo**, ou as casas da beirada
ganham linha dupla. O contorno é **tracejado a 60%**; a borda é **cheia a 55%**.
Mesma família, cadências diferentes.

**E a inversão que fica escrita para quem construir:** *quem passa a régua do
WCAG é a borda por casa, não o contorno.* Se um dia alguém apagar a borda para
"limpar o tabuleiro", apaga o que passa — e o contorno, que parece o mais
visível dos dois, não o salva.

## 5 · O que o `desenho` corrigiu a meio, e o que ainda não

**Corrigido, e os quadros já usam:**

- **`A casa` ladrilha.** Passou de 148×48 para **48×48**, com `o custo` em 15,28
  e **`o endereco` em 4,4**, ambos dentro do quadrado, e `o custo` **visível já
  em *Alcançável***. **O remendo dos −50 px saiu de todos os quadros** — as
  casas são agora instâncias directas, sem quadro de recorte. Pedidos **1, 2 e 9
  pagos**.
- **`A regua`** (`30:11`) — pedido 3, montada nas duas bordas dos cinco quadros,
  com a coluna `H` e a linha `12` em *Realcada*.
- **`A vez`** (`30:163`) — e o arranjo novo **resolveu a discordância sozinho**:
  a linha de 320×48 dele cabe com folga na lateral de 344, e é lá que a ordem da
  vez vive agora. **O meu argumento do §4 contra a coluna valia para a pilha**,
  onde a largura era escassa; com duas colunas ele cai, e a lista vertical é
  melhor — carrega nome, iniciativa e estado, que o selo compacto não carrega.
  **O pedido 4 encolhe mas não morre:** a faixa do **telefone** continua a
  precisar de uma densidade compacta, porque em 375 px cabe **uma** linha de
  320. *Forma=Selo*, só para lá.
- **`A pergunta que expira`** (`31:518`) — e aqui o arranjo novo pagou uma dívida
  que eu tinha escrito no §8: ela mede **344 de largura**, e a lateral mede
  **344**. **Encaixa exactamente.** O *"faltam-lhe 48 px"* que eu escrevi deixou
  de existir — a reação cresce na lateral, por cima do log e da bolsa, e **não
  toca no campo**. Em 1280 a reserva do terço de baixo do campo já não é
  precisa; no telefone continua a ser.

**Ainda não corrigido, medido agora e não suposto:**

- **`Botao` *Impedido* continua 19 px mais alto** — *Gesto* dá 44 em *Repouso* e
  **63** em *Impedido*; *Chamada* dá 53 e **74**. Pedido 10, aberto. Por isso o
  `Mover` impedido do quadro do veredito continua com a razão **na linha do
  veredito** e não dentro do botão.
- **`Barra de medida` continua 138–164 px.** Na tira do telefone o `17/20` sai
  como `17/`. **Está assim no quadro de propósito**: é a prova do pedido 7, e
  apagá-la seria esconder o número que o sustenta.
- **`A marca de borda`** (pedido 5) continua por fabricar; está esboçada à mão no
  quadro do telefone, e declarada.

## 6 · O que continuou por resolver

- **A paisagem** e o **"ver tudo"** continuam decididos e não desenhados, pelas
  mesmas razões da primeira rodada — o segundo depende do pedido 8.
- **A masmorra 7×18** é a única planta que rola em 1280, e **não tem quadro**.
  Ela é o caso em que a regra de enquadramento (R3, R4) e a marca de borda (R5)
  fazem trabalho de verdade num monitor, e nenhum quadro o mostra. É o primeiro
  que eu comporia a seguir.
- **A ordem da vez com dez combatentes** continua por ver. Na lateral cabem
  **quatro** linhas de 48 mais a rolagem; quatro é menos do que eu queria, e é
  onde esta composição quebra primeiro.
- **Continuo sem ter jogado esta tela**, porque ela continua a não existir. O par
  comparável nasce em E3.

## 7 · Os nós, depois da segunda rodada

| quadro | nó |
|---|---|
| `1280×860 · a luta` | **`31:2`** |
| `a entrada — 220 ms, e a prosa atravessa` | **`51:1141`** |
| `a saída — uma porta só` | **`51:1315`** |
| `o veredito antes do clique — Atacar armado` | **`51:1489`** |
| `375×812 · a luta no telefone` | **`40:447`** |
| painel de entrega | **`44:525`** |

Os ids da primeira rodada (`35:175`, `35:372`, `35:569`) **morreram** com os
clones antigos: os três momentos foram recompostos a partir do arranjo novo.

## 8 · A armadilha do alfa morreu, e vale saber como

Na primeira rodada eu gastei **cinco tentativas** a repor o alfa que as
instâncias de `A casa` perdiam ao nascer, e escrevi a cura como um ritual: *"o
alfa é sempre a última escrita"*. **Deixou de ser preciso, e não porque eu
acertei — porque a peça mudou de gramática.**

Medido agora, no `A casa` corrigido: as sete variantes têm **`fills` a 100%** e
o alfa mora na **opacidade do nó** (`o banho`: 0,10 · 0,22 · 0,28 · 0,16 · 0,30
· 0,22). Corri a reposição em toda a página e ela corrigiu **zero** nós: as
instâncias já nasciam certas.

> **A regra, e é a mais útil que esta etapa achou:** o alfa posto na
> **opacidade do nó sobrevive ao `createInstance`**; o alfa posto na
> **opacidade da tinta não sobrevive**. Quem quiser uma peça com transparência
> que aguente ser instanciada põe-na no nó, nunca no *paint* — e aí a armadilha
> 1 da primeira rodada deixa de existir em vez de ser contornada.

*(As outras duas ficam de pé: `resize()` é ignorado em `HUG` dentro de
auto-layout, e `get_screenshot` serve render em cache. As duas morderam outra
vez nesta segunda rodada.)*
