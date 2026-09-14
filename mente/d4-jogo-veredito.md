<!-- ESTE ARQUIVO NÃO É FONTE DE VERDADE. -->

# D4 · o veredito do `jogo` sobre as formas do `desenho`

O `desenho` fabricou; eu só pergunto uma coisa a cada peça: **ela serve ao
momento em que o jogador a encontra?** Onde serve, uma linha e sigo. Onde não
serve, ou serve com um preço que só aparece jogando, está escrito por quê.

**O placar:** das **21 formas** do §2 dele, **13 passam sem ressalva**,
**7 passam com ressalva de momento**, **1 é reprovada no lugar onde está**
(o interruptor `🎲` no cabeçalho — a peça está certa, o endereço não). Das
**5 peças novas** do §5, **todas as cinco são aprovadas como peça**; três
delas carregam ressalva de momento que veio junto no §2. A **correção do
`Impedido`** de D3 é aprovada sem uma vírgula de reserva.

E uma distinção que vale para o documento inteiro, porque sem ela metade do
que vem abaixo se lê ao contrário:

> **Mudo na tela ≠ mudo para quem não vê a tela.** Quando eu digo que um
> controle *pode ficar mudo*, digo que ele não carrega **razão escrita
> visível**. O nome acessível é obrigatório nos 15, sem exceção nenhuma — e
> hoje esse nome é o `title`, que é o pior lugar possível para ele estar.

---

## 1 · As 21 formas, uma a uma

### Passam sem ressalva — uma linha cada

- **2.4 · refazer a rolagem (o Destino)** — aprovada. É exatamente o pedido:
  *"o segundo dado vale — mesmo se for pior"* sai do `title` e vira Linha
  acesa. O momento é o único em que a lei *o veredito antes do clique* está
  quebrada dentro do único momento que já é jogo.
- **2.6 · mirar** (com a ressalva de convivência abaixo) — a decisão de mirar
  e mover serem **o mesmo alvo** está certa e o código já concordava
  (`grade-de-batalha.jsx:508`).
- **2.11 · abas** — aprovada. O filete embaixo, o contador como Selo neutro.
  *(Uma linha só de momento: o filete não espera o painel montar. Se o painel
  demora, a aba já está marcada — senão o jogador clica duas vezes.)*
- **2.17 · A Consequência** (com a ressalva do Balão abaixo) — os quatro tons
  e as duas fixações cobrem tudo que eu pedi, e matam o `title` como canal.
- **2.18 · o foco** — aprovada inteira, sem uma vírgula. Um anel só, nunca
  animado, 15,31:1. E os 256 alvos focáveis por combate com o anel apagado de
  propósito (`grade-de-batalha.jsx:519`) são o argumento que eu não tinha.
- **2.19 · Esperando × Impedido** — aprovada, **e fecha a divergência 4.3**.
  Ver §1.9 abaixo: o eixo dele resolveu o meu terceiro caso sem um terceiro
  estado, e eu não preciso ceder nada.
- **2.21 · o realce** — aprovada. O degrau 2 existe e não é véu, que era a
  coisa inteira. A minha lista dos nove momentos que sobem (D4 §4.5) vale como
  está.
- **A correção do `Impedido` de D3** (45% de opacidade → sem preenchimento,
  borda `line`, tinta cheia; **1,19:1 → 6,62:1**) — aprovada sem reserva, e
  registro o ganho de **momento**, que é maior do que o de contraste: um
  `Agir →` apagado mas **legível** é a diferença entre o jogador **ler** por
  que não pode e **adivinhar**. Adivinhar foi o defeito que D1 achou e que eu
  repeti nesta sessão. A peça de D3 tornava o remédio ilegível; a de hoje não.

*(As restantes sem ressalva — 2.3 parcialmente, 2.9 parcialmente, 2.13
parcialmente, 2.16 parcialmente — estão abaixo com a metade que precisa de
nota. O que não aparece citado abaixo está aprovado.)*

---

### 1.1 · **2.1 · A linha** — aprovada como peça, **com três coisas que o momento não pode perder**

A peça está certa e é a mais necessária da fase: 23 campos crus e nenhuma
primitiva. E a decisão de **o campo continuar editável enquanto o Mestre
escreve** é ganho de jogo puro — hoje ele bloqueia, e o jogador fica olhando.

Mas a peça, como está declarada, muda o gesto mais repetido do Taverna, e o
`desenho` não podia saber disto porque só se vê no dedo:

**(a) O `Enter` é o turno, e a peça o mata sem querer.** O campo do turno é um
`<input>` de uma linha, e `App.jsx:21216` diz o que acontece quando se aperta
`Enter`:

```
onKeyDown={(e) => e.key === "Enter" && agir(entrada)}
```

Um campo de **72px de altura mínima com prosa** é, na prática, um `textarea` —
e em `textarea` o `Enter` **quebra linha**. Ou seja: a peça, do jeito que está
escrita, troca em silêncio o gesto que o jogador usa **centenas de vezes por
campanha** por outro. Isso é reaprendizagem pura, e do tipo pior — ninguém lhe
avisa; ele só descobre que o turno não foi. **Condição de momento, inegociável:
`Enter` faz o turno acontecer; `Shift+Enter` quebra linha.** Se a peça não
puder garantir isso, ela não sobe ao campo do turno.

**(b) Duas linhas do que ele escreveu, sempre visíveis.** É o que sustenta a
altura de 72px e é o que eu quero dela: hoje, escrevendo uma frase média num
`<input>`, o começo sai pela esquerda e o jogador não relê o que está mandando
ao Mestre. Três linhas de Spectral 15 é a peça a ganhar o direito de existir.

**(c) A última fala do Mestre não pode sair da tela quando o teclado abre.** É
o momento da peça: o jogador escreve **respondendo** a alguma coisa. Se abrir o
teclado empurra a narração para fora, ele responde de memória.

### 1.2 · **2.2 · a chamada** — aprovada, e eu decido o caso que "uma por tela" não cobre

*Uma chamada por tela* é a regra certa e hoje há uma tela que a quebra, medida
por mim: no Torneio, entre lutas, o `⚔ A PRÓXIMA LUTA` (**54.912 px²**) e o
`Agir →` (**720 px²**) estão na mesma tela, a três centímetros um do outro.

**O momento decide, e a decisão é minha:** entre lutas **não há turno para
fazer acontecer**. Então ali a chamada é `⚔ A PRÓXIMA LUTA`, e o `Agir →`
desce a *Papel=Gesto* — ou não existe. Duas chamadas na mesma tela não é um
problema de tamanho: é o jogo a oferecer duas portas para a frente e nenhuma
delas ser *a* porta.

### 1.3 · **2.3 · o véu do dado** — aprovada, **e falta a porta**

Tudo certo, e a frase *"a pausa continua existindo"* sob `prefers-reduced-motion`
é a melhor linha do documento dele: a pausa é o jogo, não é a animação.

**A ressalva é da lei da casa, não do gosto:** toda animação tem de ter saída, e
esta acontece **dezenas de vezes por campanha**. Hoje ela não tem nenhuma. O
`quando` que eu ponho: **um piso de pausa que ninguém pula, e depois dele o
toque adianta.** Pisar no número antes de ele parar não faz nada; depois de ele
parar, qualquer toque vai direto ao veredito. **O que nunca se pula é o
veredito** — pular o veredito seria pular o jogo.

### 1.4 · **2.5 · A casa** — a peça está certa, **e 48px não cabe no telefone**

O piso de 48px está bem argumentado (HIG 44, Material 48dp, WCAG 2.5.5) e eu o
quero. Só que ele colide com um número que é meu, medido ao vivo: **o campo da
luta que joguei era 14×14**. `14 × 48 = 672 px` de tabuleiro, num telefone de
**375 px** de largura. Hoje a casa mede 27px embutida e 35px ampliada — e é
justamente por isso que ela mede isso.

**Três condições de momento, e são a Fase E inteira:**

1. **A casa nunca encolhe abaixo de 44px para o campo caber.** Quem encolhe é
   o campo visível, não o alvo. O tabuleiro passa a rolar/arrastar.
2. **Quando o combate abre, a casa do herói está na tela.** Sem isto a
   condição 1 é uma armadilha nova: um tabuleiro que rola e abre no lugar
   errado é pior do que um que não rola. *(É o defeito que eu medi: o campo
   abriu **429 px abaixo da borda** e o scroller ficou em `scrollTop = 0` de
   1129 possíveis.)*
3. ***Confirmando* não é para todo passo.** Dois toques por passo transforma o
   tabuleiro num formulário, e mover é o gesto mais repetido do combate depois
   de agir. **O segundo toque só existe quando o passo custa alguma coisa além
   de metros** — abrir a guarda para um golpe livre, terminar colado num
   inimigo, entrar em terreno que cobra. Passo limpo é **um toque**.

**E uma que é fabricação, e devolvo a ele:** *Sob o dedo* **não existe antes do
toque**. No telefone, entre "alcançável" e "confirmando" não há estado nenhum —
então o custo do passo, que hoje só aparece em `onMouseEnter`
(`grade-de-batalha.jsx:543`), precisa de um canal que não seja o rato: ou o
número nasce escrito dentro da casa no estado *Alcançável* (e aí 48px tem de
segurar dois ou três caracteres legíveis, o que é conta dele), ou vive numa
linha única ao lado do campo. **Escolher qual é dele; o que eu exijo é que
exista um.**

### 1.5 · **2.6 · mira** — aprovada, com uma regra de convivência

Âmbar para andar e violeta tracejado para mirar são duas línguas sobre a mesma
grelha. **Nunca as duas ao mesmo tempo:** selecionar uma habilidade com alcance
põe a grelha em *Mira* e o movimento deixa de ser oferecido até ela ser
largada. Um tabuleiro que pisca duas cores obriga o jogador a decodificar antes
de decidir, e decodificar custa o turno.

### 1.6 · **2.7 · a barra que diz o que saiu** — aprovada, **com um limite de frequência**

*"o número fica um turno"* está certo para um golpe. Só que numa rodada de
combate **chegam vários** — três inimigos de pé são três golpes, e o `−3`,
`−2`, `−4` piscando um por cima do outro na mesma barra não é informação, é
tremor.

**O `quando`: a barra mostra o SALDO da resolução, não cada batida.** Um
`−9` que assenta uma vez, e o detalhe golpe a golpe fica no log, que é onde ele
já está. Uma barra que pisca três vezes por rodada é a primeira coisa que o
jogador aprende a ignorar.

### 1.7 · **2.8 · o Selo com *Mudou=Agora*** — a peça é melhor do que o que eu pedi, **e entra em rota de colisão com a §6 dele**

Transformar "agora" em **eixo** em vez de quinto tom é melhor do que o meu
pedido, e eu adoto. **Mas** o §6 dele propõe a lei *"todo valor de estado que
muda entre um turno e o outro veste a marca"*, e eu escrevi em D4 §4.5 que
**dois "mudou agora" na mesma tela é zero "mudou agora"**. Um turno comum muda
XP, moedas, hora e tocha — quatro halos. A lei dele, aplicada à letra, apaga a
peça dele.

Ele mesmo escreveu que o corte é meu. **O corte, e é regra para durar:**

> **A marca é para o que aconteceu COM o jogador, não para o que ele fez.**

Se ele gastou 20 moedas comprando, ele sabe — não precisa de halo. Se levou 20
moedas de multa, não sabe. **No máximo dois por turno**, e a prioridade é: (1)
o que caiu e dói, (2) o que abriu porta nova, (3) o resto — que fica sem marca
e não perde nada, porque continua escrito.

### 1.8 · **2.9 · A escolha** — aprovada, era a minha primeira demanda, **e o `<select>` não sai todo**

Doze variantes, o filete no lado de entrada, o visto, e **nunca âmbar cheio
para dizer "selecionado"** — a razão dele (37 usos de `background: T.amber`, e
esse preenchimento é a assinatura da ação principal) é a melhor da folha. Uma
opção que parece a ação da tela é um erro que se comete uma vez e se paga a
partida inteira.

**A ressalva é de momento e vale para a criação de personagem**, que é a
primeira meia hora de quem chega: *"o `<select>` nativo sai"* é verdade para
listas curtas e é uma piora para as longas. O seletor nativo do sistema abre a
roda do telefone e resolve 30 opções com um gesto; trinta pílulas desenhadas à
mão viram um scroll dentro de um scroll, que é o defeito que eu já medi no
tabuleiro. **A peça precisa de uma forma *Lista* para conjunto longo** — ou os
16 lugares precisam de triagem por tamanho de lista, um a um. Substituir os 16
pela mesma pílula é trocar quatro línguas por uma língua que gagueja nas
listas grandes.

### 1.9 · **2.10 · abrir e fechar** — aprovada, e eu **nomeio** as que não fecham pelo fundo

`Esc` fecha, o fundo fecha, o `✕` no mesmo canto com 44px de alvo: aprovado, e
é a Fase G1. Ele me deixou a exceção; aqui está ela, nominal — **as únicas
sobreposições sem saída pelo fundo, e todas dizem por escrito que não têm:**

1. **o véu do dado com rolagem pendente** (`App.jsx:512`) — sair dali por
   acidente é abandonar um teste que o Mestre pediu;
2. **o véu da morte** (`App.jsx:357`) — já não tem porta, e é desenho;
3. **as três caixas de decisão do save** (`App.jsx:21265, :21295, :21323`) —
   substituir uma campanha por engano é a coisa mais cara que o jogo sabe
   fazer.

Todas as outras doze: as três portas. E o `✕` é da saída e de mais nada — as
cinco ações de perda que hoje se escondem atrás dele saem para *O gesto que
custa*, com o verbo escrito.

### 1.10 · **2.12 · o controle que é só um glifo** — ver §2, que é a resposta nominal

### 1.11 · **2.13 · de quem é a vez** — aprovada, **com o tom errado**

A decisão de a marca viver **na linha de quem age e na barra de ação ao mesmo
tempo** é exatamente o remédio do que eu medi (o inimigo `● AGINDO` por mais de
10 segundos enquanto o jogo esperava **por mim**).

**Mas *Tom=Aviso* está errado, e é de momento.** "É a sua vez" não é um aviso —
é a coisa boa da rodada, é o convite. Vestir o convite com a cor do problema
ensina o jogador a ter um pequeno susto toda vez que chega a vez dele. **O tom
de "sua vez" é o mesmo tom que o jogo usa para "você pode agir"**, e qual é
esse é do `desenho`; o que eu recuso é o de aviso.

### 1.12 · **2.14 · O interruptor** — **a peça passa, o endereço não**

A peça está certa: 44px, três canais (a palavra muda, o lado muda, a cor muda),
e o diagnóstico dele é melhor que o meu — o estado **existe** em duas cores e
não existe em **nenhuma palavra**.

**Reprovo o lugar.** Três razões, e as três são de momento:

1. **Não é gameplay.** "Rolagens de combate: visíveis / ocultas" é uma
   preferência de leitura do log. O cabeçalho é o lugar onde o jogador olha
   primeiro, e a lei da casa é que só aparece na tela o que é jogo.
2. **A peça não cabe ali.** Um trilho de 40×22 **mais** o rótulo do que liga
   **mais** o estado escrito, num cabeçalho de 375px que já carrega a marca, o
   nome da campanha, o selo de salvamento e mais três glifos. Ou o interruptor
   perde as palavras — e volta a ser o defeito que ele acabou de medir —, ou o
   cabeçalho estoura.
3. **Nomear o mecanismo no cabeçalho é o sistema a falar de si mesmo.**

**O `quando`: o interruptor vai para onde as rolagens moram** — junto do log
que ele governa, onde a palavra cabe e onde o efeito se vê no mesmo olhar. O
cabeçalho fica com um botão a menos, e isso é ganho, não perda.

### 1.13 · **2.16 · O gesto que custa** — aprovada, e a peça **não resolve a metade que dói**

*Armado não grita* (contorno, não preenchimento) é a razão certa pela razão
certa: um vermelho cheio o dia inteiro deixa de significar perigo na hora em
que importa. O Confirmar repetindo **o verbo** em vez de "Sim" idem. O preço
como campo obrigatório é a lei da casa virando peça. Aprovado.

**A ressalva é que a peça chega tarde no caso pior.** O `⛺` que eu cliquei não
falhou só em perguntar antes — **falhou em dizer depois**. Um clique, a luta
contra "A Voz" desapareceu, a chave andou para "A Sombra", e **nenhuma linha do
log diz o que aconteceu com A Voz**: ganhei, fugi, desisti? A peça resolve o
"antes"; o "depois" é fiação, não forma, e eu registro aqui para não se perder
entre as duas mesas: **toda ação que a peça arma tem de escrever no log o que
fez.** Uma pergunta antes e um silêncio depois continuam sendo uma armadilha —
só que educada.

### 1.14 · **2.17 · A Consequência** — aprovada, **menos o Balão sobre o tabuleiro**

*"o Balão não fecha sozinho antes de 4s"* é bom em toda a parte e é ruim num
lugar só: **sobre o campo de batalha**, onde quatro segundos de balão tapam as
casas para onde o jogador ia andar. **No tabuleiro, a Consequência é sempre
*Linha*.** Em todo o resto, aprovada como está.

### 1.15 · **2.19 · Esperando × Impedido** — aprovada, **e a divergência 4.3 fecha sem eu ceder**

Eu tinha escrito que cederia se ele insistisse em pôr o campo vazio em
*Esperando*. **Ele não insistiu — ele fez melhor.** Ao trocar o eixo de
*volta / não volta* para **quem tem de agir**, o campo vazio cai naturalmente
em *Impedido* ("você age: escreva o que você faz"), que é exatamente o que eu
queria dizer com "é o campo vazio a falar". **Dois estados, três razões, e cada
razão no estado certo.** Divergência fechada, sem perda dos dois lados.

Uma metade dela continua sendo minha e não é forma: **"há um dado à espera" não
devia apagar a barra inteira.** Hoje `bloqueado` apaga `Ações`, `Habilidades`,
`Examinar` e `Tempo` (`App.jsx:20384`), que não têm nada com a rolagem. Devia
apagar o `Agir →` e acender o `Rolar d20`. Isso é fiação, e vai com G2.

### 1.16 · **2.20 · a espera do Mestre** — aprovada, **com duas condições de momento**

A razão em âmbar **dentro do botão que a causou** está certa, e a citação de 1s
(fluxo de pensamento) e 10s (atenção) é a régua boa.

1. **Esperando não é clicável.** Se o campo continua editável (§2.1) e a
   chamada continua legível, ela tem de continuar **recusando** — dois turnos
   mandados por engano é pior que um botão apagado.
2. **A própria régua dele cobra a segunda:** a chamada ao Mestre **passa dos
   10s com frequência**, e uma palavra âmbar congelada por vinte segundos
   deixa de dizer "estou escrevendo" e passa a dizer "travei". Depois do limite
   de atenção, **a razão muda de palavra**. O que nunca aparece é um número de
   segundos: contagem regressiva no meio de uma narrativa é o sistema a falar
   de si mesmo.

---

## 2 · Os 15 sem rótulo — **quais ficam mudos, nominalmente**

O `desenho` cedeu neste ponto e a razão dele é boa: uma razão escrita em cada
glifo do cabeçalho vira parede de texto, e parede de texto é outra forma de
ruído. Então a decisão é minha, e vai por nome.

**Antes, a correção de uma coisa que eu mesmo listei errado em D4 §2.2:** o
**`⤢ ampliar` não é mudo** — ele traz a palavra "ampliar" escrita ao lado do
glifo (`grade-de-batalha.jsx:571`). O defeito dele não é falta de rótulo, é o
rótulo **mentir**: promete tela cheia e mostra 26% da tela, com 33% do campo
acima da borda da janela. Sai desta lista e fica na dele.

**E a segunda correção:** o cabeçalho tem **quatro** botões, não cinco
(`App.jsx:20404, 20417, 20418, 20419`): a caneca, `⛺`, `🎲`, `📜`. O `⤢` vive
no tabuleiro, o `↓` na barra do log (`App.jsx:21239`), o `🔊` em cada mensagem
do Mestre (`App.jsx:20493`).

### Podem ficar mudos — sem razão escrita na tela

| controle | onde | por que o momento aguenta |
|---|---|---|
| **a caneca** (`Início`) | cabeçalho, à esquerda | é a marca, no canto onde toda tela do mundo põe "voltar ao começo"; **não custa nada** (o jogo salva sozinho) e volta num clique. A posição carrega o sentido melhor que uma palavra carregaria. |
| **`↓`** (voltar ao fim) | barra do log | zero custo, reversível, glifo universal, e **só aparece quando o jogador já rolou para cima** — ou seja, ele já sabe o que quer. |
| **os nove `✕` que fecham** | os painéis e véus | é a porta. **Porta explicada rouba a cena de quem está dentro** — foi o que eu argumentei na divergência 4.2 e continua a valer. O que eles precisam é de alvo de 44px, não de palavra. |
| **`−` / `+` do stepper** | criação e ficha | o sentido de um stepper é a posição em volta do número; a palavra ali seria ruído. **Mas o contador não pode ficar mudo**: "restam 2 pontos" tem de estar visível ao lado, sempre. É a decisão mais consequente da vida do personagem. |
| **`🔊`** (ouvir) | em cada mensagem | preferência, reversível, zero custo, e repete-se uma vez por mensagem — rotular cada um seria a parede de texto de que ele falou. **Mas é o menor alvo do jogo (22×22 px no desktop E no telefone)**, e isso não é dispensa: mudo pode, pequeno não. |

### **Não podem** ficar mudos — e estes são inegociáveis

| controle | onde | o que ele faz, e por isso precisa do verbo |
|---|---|---|
| **`⛺`** | cabeçalho | **encerra a luta em curso** e faz a chave andar, sem perguntar e sem dizer depois. Precisa do verbo escrito **e** de *O gesto que custa* com o preço nomeado: *"acampar agora encerra a luta contra A Voz"*. É a ação mais irreversível da sessão atrás do controle mais mudo. |
| **`📜`** | cabeçalho | **gasta uma chamada ao Mestre** — um recurso finito e esgotável, e eu vi o fim dele duas vezes nesta fase. Um clique sem rótulo que consome o que faz o jogo existir é a definição de preço escondido. Verbo **e** preço. |
| **`⚒`** (desmontar) | equipamento | **destrói o item** para virar essência. O `title` diz `Desmontar → +N essência` — o ganho está escrito e a perda não. |
| **`▲` promover / `✕` expulsar** | `painel-guilda.jsx:338-339` | **lado a lado, do mesmo tamanho, os dois sem uma letra**, e só um deles apaga uma pessoa. Nem o ▲ pode ficar mudo: um par mudo em que um dos dois destrói é uma armadilha, e a armadilha está no par, não no glifo. |
| **os quatro `✕` que descartam** | `App.jsx:1505, 1588, 2534, 2772` | retirar cartaz, abandonar contrato, remover companheiro, descartar equipamento. Não é falta de rótulo: é **o glifo errado**. Saem do `✕` e vão para o verbo. |

### E o caso que se resolve mudando de lugar

**`🎲`** — no cabeçalho, **fica mudo e continua defeituoso**: um dado apagado
significa "desligado" tanto quanto "indisponível", e nada desempata. Não há
saída boa **nesse endereço**. Por isso o meu veredito do §1.12: ele sai do
cabeçalho, vai para junto do log que governa, e lá é o interruptor com as
palavras. **Mudar de lugar resolve o que nenhuma quantidade de rótulo
resolveria no cabeçalho.**

**Somando: o cabeçalho fica com um mudo (a caneca), dois falantes (`⛺`, `📜`)
e um a menos (`🎲`).** É o cabeçalho mais curto do que é hoje, e é o ponto.

---

## 3 · O `Agir →` a 16px nos quatro modos — **o que o momento não aguenta perder**

Eu cedi no tamanho (a mesma peça, o maior tamanho que couber); ele cedeu na
largura (*cabe no conteúdo* / *ocupa a linha* como variante, não como segundo
botão). O acordo está fechado e é bom: **uma peça, duas larguras, uma família
tipográfica.** Duas famílias para a mesma ação é o que faz parecer dois jogos.

O risco que sobra é o telefone, e ele é real. A conta, com os números que eu
medi a 375×812: descontadas as margens, sobram ~343px de linha. A chamada nova
— mono Bold 16px com padding 16/28 — pede à volta de **140px de largura e
~60px de altura** (hoje o `Agir →` inteiro mede **45 × 16 px**). Se a chamada e
o campo dividirem a linha, o campo fica com ~195px: **doze ou treze caracteres
de prosa visíveis por vez**, para escrever a frase que é a ação central do
jogo.

**Então o que o momento não aguenta perder, em três linhas, e nenhuma delas é
sobre o botão:**

1. **O `Enter`.** É o §1.1(a) e é a mais importante das três. O gesto de mandar
   o turno é `Enter`, foi sempre `Enter`, e **nenhum ganho de tamanho paga
   trocá-lo em silêncio.** `Enter` manda; `Shift+Enter` quebra linha.
2. **Duas linhas do que ele escreveu.** No telefone, a chamada e o campo **não
   dividem a linha**: a peça empilha — o campo em cima com as suas três linhas
   de prosa, a chamada embaixo ocupando a largura. A ironia útil é que assim o
   telefone ganha o **maior** alvo dos quatro modos, que é exatamente o que a
   plataforma pede. No desktop dividem a linha, onde há 1280px de sobra.
3. **A última fala do Mestre à vista.** Com o teclado aberto, o jogador tem de
   continuar vendo a que ele está respondendo. Um campo que cresce e empurra a
   cena para fora troca "responder" por "lembrar".

Se essas três estiverem de pé, o `Agir →` pode subir aos 16px nos quatro modos
e eu assino embaixo. Se alguma cair, a chamada da campanha fica como está e
perdemos só simetria — que é o barato de perder.

---

## 4 · As duas ações sem controle que eu medi: a forma declarada **basta**?

Das seis de D4 §2.1, a pergunta do `regente` é se a forma do `desenho` já as
faz **existir**. Uma a uma, curto:

- **a reação** — **não basta, e ele sabe**: a peça não existe. É a
  *pergunta que expira*, e é o item 1 da proposta abaixo.
- **o ataque de oportunidade do jogador** — **basta**, e por tabela: é a sexta
  reação de `reacoes.js` (`oportunidade`, gatilho `inimigo_cai`). A mesma
  janela cobre as duas; nenhuma peça nova.
- **a ação extra (`✦ extra`)** — **não basta.** É um recurso contado pela
  economia, aceso na barra, e **não tem um único controle**. A forma dele é *A
  escolha* (existe) mais a chamada (existe): o que falta não é peça, é o
  `quando` — e o `quando` é *depois de agir, se o recurso continuar aceso, o
  jogo oferece o que ele ainda pode fazer*. Fica registrado como fiação, não
  como demanda de desenho.
- **não agir** — **não basta, e é o mais barato de todos.** Hoje quem quer
  esperar **tem de escrever uma frase e gastar uma chamada ao Mestre para dizer
  que não faz nada.** A forma é `Botao` *Papel=Recuo* ao lado da chamada, em
  combate, e não custa uma peça nova.
- **recusar o teste de dado** — **não basta**, mesma família do anterior, mesma
  peça, e é o Recuo dentro do véu do dado. *Ressalva de regra, e é do `backend`:
  desistir de um teste tem de ter consequência de tabela, senão é um botão de
  "nada acontece".*
- **declarar alvo com um inimigo só** — **basta.** Com um inimigo de pé a mira
  só faz sentido com habilidade selecionada, e aí é *A casa*, estado *Mira*.
  Nada a pedir.

---

## 5 · As propostas, escritas para a pauta

*(Copiar daqui para `mente/pauta-desenho.md`. A primeira vai para "Para a
pessoa decidir"; a segunda e a terceira, para onde diz o item.)*

---

### → para **"Para a pessoa decidir (pesado)"**

- [ ] **a rodada tem três batidas, e o jogador toca as três** · pesado · de: jogo · 14/09
  **O que ele vive hoje.** Uma rodada de combate é: escrever uma frase, o
  sistema resolver tudo, e ler vinte linhas. As regras já modelam **três**
  coisas que são do jogador — mover, agir e reagir — e ele toca uma e meia.
  **Mover** já é clicável e ninguém sabe: quando a luta abriu, o tabuleiro
  estava **429 px abaixo da borda visível** e o scroller não rolou sozinho
  (`scrollTop = 0` de 1129 possíveis); rolado até ao fim, **41 das 86 casas**
  cabem na tela. **Agir** é um botão de **720 px²** (45×16) — enquanto, três
  centímetros acima, na mesma tela, o `⚔ A PRÓXIMA LUTA` mede **54.912 px²**.
  E **reagir** não tem controle nenhum: `src/reacoes.js` tem **seis** reações
  com gatilho, custo em PM e resolução — Contramágica, Escudo Arcano, Aparar,
  Esquiva Ágil, Contra-ataque e Ataque de Oportunidade —, e `escolherReacao`
  escolhe sozinha a primeira que se aplica, **gastando o PM da ficha do
  jogador** (`App.jsx:7572`, e o débito em `:7577`). Numa luta inteira eu toquei
  **três** controles: duas casas e o `⛺` que encerrou a luta por engano.
  **O que ele viveria depois, nas três batidas.** *Primeira:* a luta começa e
  **o campo é a primeira coisa que ele vê** — não um log de texto que ele tem
  de rolar à procura do lugar onde a luta acontece. *Segunda:* antes de pisar,
  ele **vê o que o passo custa**, na casa, e o medidor de metros diz a verdade
  (hoje ele fica preso em `9 de 9` mesmo depois de andar 7,5 m). *Terceira:*
  o golpe inimigo chega e, **antes de o dano assentar**, o jogo pergunta uma
  coisa curta: *"Aparar? — corta metade"*. Ele responde, ou não responde. Se
  não responder, acontece exatamente o que acontece hoje.
  **Por que é `pesado`, e o que ele reaprende.** A pergunta da tabela é uma só
  — *o jogador teria de reaprender?* Para as batidas 1 e 2 a resposta é **não**:
  nada muda de nome, nada muda de lugar, ele ganha uma tela melhor para o que
  já faz. Para a batida 3 a resposta é **sim, e é uma coisa só**: ele aprende
  **que o jogo pode lhe fazer uma pergunta no meio do turno do inimigo, e que
  não responder é uma resposta válida.** Mais nada. Nenhum botão sai do sítio,
  nenhum gesto antigo deixa de funcionar. Mas isso é o fluxo do combate, e o
  fluxo é da pessoa.
  **O que pede ao `backend`.** A janela é **regra, e regra não nasce dentro da
  tela**: a duração sai de uma tabela nomeada; o padrão de quem não responde é
  **byte a byte** o `escolherReacao` de hoje; e a catraca da suíte é uma frase
  — *mesma semente, ninguém responde, mesmo resultado de hoje*. **Regressão
  zero, provada em Node.** *(E uma dívida que aparece de graça, e é da casa:
  `reacoes.js:96` decide por `Math.random()`. A lei é determinismo por semente,
  e o sorteio da reação hoje não a cumpre.)*
  **O que pede ao `desenho`.** Uma peça que não existe e que eu não soube
  nomear: **a pergunta que expira.** Um controle que aparece, oferece uma
  escolha com o preço escrito, e **some sozinho se ninguém responder, sem punir
  quem não respondeu**. Não é *O gesto que custa* (esse espera para sempre) nem
  um véu (esse toma a tela). Sem ela, a batida 3 não existe.
  **O risco, dito por mim.** Um jogo que espera resposta pode virar um jogo que
  cansa. Quatro defesas, e a primeira já está escrita nas regras: (1) o sistema
  **já** recusa gastar reação em arranhão (`reacoes.js:93-94` exige dano acima
  de um limite), então a janela herda essa parcimônia e não aparece a cada
  golpe; (2) **uma por rodada**, que também já é regra; (3) **quem não responde,
  o sistema responde como hoje — nada regride, ninguém fica pior**; (4) se o
  jogador deixar a janela expirar algumas vezes seguidas, o jogo **para de
  perguntar** pelo resto da luta, sem lhe dizer que existe um mecanismo, sem
  lhe pedir uma preferência, sem nomear nada.
  **E o melhor argumento é da própria casa.** O cabeçalho de `src/reacoes.js`,
  escrito aqui: *"No 5e e no BG3 metade da tensão do combate mora aqui: o golpe
  vem, e você tem uma janela para aparar, se esquivar, erguer um escudo arcano
  ou revidar."* Sete linhas abaixo, o mesmo comentário entrega a decisão ao
  sistema: *"o SISTEMA decide se vale a pena e rola o dado"*. **O módulo
  diagnostica o problema e depois o causa.** Isto é coerente com o que a pessoa
  já aprovou em S1 — *"o motor não muda: a luta já é determinística e já está
  calculada; o que muda é quando o jogador fica sabendo"* — aplicado à rodada
  em vez de à queda.

- [ ] **o turno acontece mesmo quando o Narrador cala** · pesado · de: jogo · 14/09
  **Experiência jogada, duas vezes na mesma fase** (D1 e D4): a quota do
  Narrador acabou e **o jogo parou de ser jogável** — nem um turno de Uma Vida,
  nem um do Capítulo. A tela entrega ao jogador, inteira, uma frase de
  bastidor: *"Limite diário alcançado (500 chamadas)"* (`api/_portao.js:174`,
  já catalogada em D6). Mas o achado que importa é o contrário: **o combate
  funcionou com o Mestre calado.** `⚔ A PRÓXIMA LUTA` abriu a luta pelo
  sistema, eu andei no tabuleiro, o log escreveu *"Você vai de no beco estreito
  para sob a arcada — 7,5 m gastos"*, e o Mestre não disse uma palavra. **O
  Taverna já tem um coração que bate sem a IA, e desliga-o por inteiro quando
  ela cala.**
  **O que ele viveria depois:** o turno resolve, o sistema escreve o que
  aconteceu na linguagem que ele já escreve (o dado, o dano, o passo, o
  espólio), e **a narração é o que falta, não o que impede**. Quando o Narrador
  volta, ele narra; quando não volta, o jogo continua sendo um jogo — mais seco,
  jogável. É a lei da casa aplicada ao caso extremo: *nunca pode custar o
  turno.*
  **É `pesado` porque muda o fluxo** e porque a resposta à pergunta da tabela é
  **sim**: o jogador reaprende que existe um turno sem prosa. É uma pergunta de
  produto — *o que o Taverna é quando o Narrador não está?* — e essa é dela,
  não da mesa. **Mas a mesa não pode calar sobre ela**, porque foi a única
  coisa que impediu esta fase inteira de medir um turno vivo.

---

### → para **"Aberto (leve / médio)"**

- [ ] **as moedas no cinturão** · leve · de: jogo · 14/09
  *(medido no jogo carregado)* A barra de status mostra **NIV, PV, PM, XP, o
  dia e o lugar** — e **não mostra o dinheiro**. `◉ 240` só existe **dentro**
  do painel Bolsa, e é o número que decide toda compra, todo suborno, todo
  presente e toda obra: o jogador tem de abrir uma gaveta para saber se pode
  pagar. Com o **Selo de estado** fabricado (D4), o cinturão do cabeçalho é
  **montagem, não desenho novo** — nenhuma peça nova, nenhum fluxo mudado,
  nada para reaprender.
  *(Substitui e absorve "as moedas existem no HUD", já na fila desde D1: o
  item é o mesmo e agora tem a peça que o torna barato.)*

---

## 6 · O que eu registro e não é meu para consertar

1. **`reacoes.js:96` sorteia com `Math.random()`.** A lei da casa é
   determinismo por semente, e a escolha da reação hoje não a cumpre. **Do
   `backend`**, e é pré-requisito da batida 3.
2. **O orçamento de movimento não é escrito de volta quando a luta não tem
   `economia`** (`const novaEco = eco ? { ...eco, movM: sobra } : eco;`, e o
   literal da luta da chave em `App.jsx:21199` não traz o campo). O jogador
   anda de graça e o medidor mente `9 de 9`. **Do `backend`.**
3. **O `⛺` não escreve no log o que fez.** A peça resolve a pergunta antes;
   o silêncio depois é fiação. **Do `frontend`.**
4. **`bloqueado` apaga quatro painéis que não têm nada com a rolagem**
   (`App.jsx:20384`). Fiação, vai com G2.
