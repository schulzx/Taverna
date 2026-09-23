# R6 · a prova jogada do *depois*

> # **15 dos 20 turnos usaram o campo de texto.**
>
> 3 saíram da soleira · 1 do painel do mapa · 1 do botão de acampar.

**O veredito, numa frase:** a premissa da Fase R **confirmou-se pela metade** —
o jogo **não** virou *point-and-click*, a prosa continua a ser respondida em
três de cada quatro turnos, e a regra de §4.1 de `mente/r1-jogo.md` aguentou; o
que não se confirmou é a promessa do outro lado, porque **a soleira só aprendeu
dois verbos** (aceitar contrato, convidar) e **em apenas 2 dos 20 turnos ela
ofereceu a coisa que eu ia mesmo fazer**.

**Não é regressão.** É uma fase que pagou a defesa e ainda não pagou a
proposta.

---

## 1 · O método

**Campanha nova**, para ser o mesmo terreno do *antes*: Fantasia medieval ·
Terras abertas · Jornada do Herói · Halda, ferreira, guerreira/cavaleira, órfã
da estrada. Mesa **1280×800**, `preview_start` sobre `.claude/launch.json`.
Medidas tiradas ao vivo por `read_page`/JS, nunca por imagem (a foto congela
com o painel oculto). Depois, o mesmo ecrã em **375×812** com `resize_window`.

**Turno** aqui é *uma decisão que faz o mundo andar* — frase enviada ao Mestre,
oferta tomada, viagem, acampamento. Abrir painel para **ler** não conta, e está
dito quando aconteceu. Cancelar um menu não conta (aconteceu uma vez, no
`Esperar`).

**O save do R1 não se perdeu:** está guardado em `localStorage` sob a chave
`backup_r1_save` na máquina onde isto correu. O save activo é o da sessão de
hoje.

---

## 2 · Os vinte turnos

| # | a cena ofereceu | eu fiz | de onde saiu |
|---|---|---|---|
| 1 | Elma do Braseiro pede que eu traga Sara das salinas — *"Você topa?"* | respondi que topo e perguntei onde ficam as salinas | **campo** |
| 2 | soleira: `Aceitar: Tirar Alba de lá` ◉205 · +166 XP · prazo 4 noites | aceitei | **soleira** |
| 3 | Olga ao lado, o esporo-rugidor por explicar | perguntei onde sumiu a Alba | **campo** |
| 4 | nada na soleira; as salinas ditas na prosa, não oferecidas | viajei pelo Mapa › ▸ ir (50 min) | **painel** |
| 5 | um homem agachado num tanque | perguntei se viu a Sara | **campo** |
| 6 | Sara à porta do moinho | disse-lhe que Elma pagou e perguntei porquê não voltou | **campo** |
| 7 | a corda do poço estoura, o balde cai | amarrei a corda e levei a Sara de volta | **campo** |
| 8 | Sara pede que eu dê um recado a Orso da Silva | procurei o Orso na praça | **campo** |
| 9 | Orso, recrutador, à minha frente | convidei-o para vir comigo | **campo** |
| 10 | Vila de Espinho dita na prosa; **não está no mapa** | saí a pé para lá | **campo** |
| 11 | um Batedor de faca — *"se for lutar é agora, se for falar que seja depressa"* | abri as mãos e falei | **campo** |
| 12 | `😵 Exausto · 🎲 desvantagem` aparece na barra | acampei (⛺) e dormi | **botão** |
| 13 | soleira: `Aceitar: Praga em o posto da estrada` ◉115 · prazo 6 noites | aceitei | **soleira** |
| 14 | o Batedor observa, eu com pão | ofereci-lhe metade do pão | **campo** |
| 15 | Olga pede: *"pode olhar o que tem dentro do baú?"* | arrombei o baú (dif. 17, +5) | **campo** |
| 16 | soleira: `Convidar Vero do Braseiro · tem preço` | cliquei | **soleira** |
| 17 | uma seta de sal aponta a noroeste | segui a seta | **campo** |
| 18 | Sara oferece o cantil e espera reacção | aceitei e prometi devolvê-lo cheio | **campo** |
| 19 | o posto da estrada, a 1,5 h a noroeste | fui a pé até lá | **campo** |
| 20 | uma voz manda pousar a espada à porta | pousei a espada e entrei | **campo** |

**Campo: 15 · Soleira: 3 · Painel: 1 · Botão da tela: 1.**

---

## 3 · Os números que se mediam de graça, já que eu estava lá dentro

### 3.1 · A soleira ofereceu algo útil em quantos turnos?

| medida | turnos |
|---|---|
| a soleira tinha **só `Esperar`** | **9 de 20** |
| tinha uma oferta além de `Esperar` | 11 de 20 |
| a oferta **era a coisa que eu ia fazer** | **2 de 20** (T2 e T13) |
| a oferta era uma que **diz na cara que vai recusar** (`Convidar Vero · mais 5 dias de estrada juntos antes de decidir`) | **5 de 20** (T16–T20) |

**Dois verbos em vinte turnos.** A soleira carregou `aceitar contrato` e
`convidar`, e mais nada. Viajar, comprar, falar com quem está à minha frente,
responder a um pedido nomeado pela prosa — **nada disso chegou a ser oferta uma
única vez**, e a prosa nomeou coisas dessas em **12 dos 20 turnos**.

### 3.2 · Quantas vezes não soube o que fazer a seguir?

**Nenhuma.** A prosa deste jogo nunca me deixou sem ideia — e isso é um elogio
à prosa, não à tela.

Mas **três vezes não soube se a minha frase ia ser entendida** (T9 convidar,
T10 viajar para Vila de Espinho, T17 seguir a seta), e **duas dessas três
falharam em silêncio**: o convite foi respondido pelo Narrador e não pelo
sistema, e as duas viagens não me moveram um metro. É o defeito de R1 §2.5
(*"isto é o jogo a ensinar o jogador a desconfiar do campo de texto"*) **vivo,
inteiro, depois da fase**.

### 3.3 · A espera

Mediana do turno por texto: **10,7 s** (n=15; mín. 5,6 · máx. 22,0). No *antes*
era **14,3 s** — melhorou, e não foi esta fase que o fez.

Mas o número que interessa é outro: **tomar uma oferta da soleira custou 984 ms
e 990 ms**, contra 10,7 s por frase. **A oferta é onze vezes mais rápida que a
prosa, e a tela só me deu essa velocidade em 2 dos 20 turnos.** O ganho existe,
está provado, e está quase todo por gastar.

### 3.4 · A % de ecrã da prosa — e é aqui que a fase dói

Medido no mesmo instante, mesmo save, mesma soleira (uma oferta + `Esperar`),
pelo retângulo visível do contentor rolável da narrativa sobre a área do ecrã:

| | mesa 1280×800 | telefone 375×812 |
|---|---|---|
| **a prosa** | 1144×380 = **42,5 %** | 343×**151** = **15,7 %** |

**No telefone a barra de estado (180 px) é maior do que a página (151 px).** O
orçamento vertical inteiro, medido linha a linha:

```
  73 px  cabeçalho
 151 px  A PROSA                ← 18,6 % da altura
 149 px  a soleira
 180 px  a barra de estado      ← NIV · PV · PM · data · hora · estação · tempo · lugar · XP
  81 px  a fita dos prazos      ← um chip por contrato aceite
 102 px  o campo + Agir
  76 px  as abas
```

**588 dos 812 px — 72,4 % do telefone — são moldura.** E a moldura **cresce com
o jogo**: cada contrato que eu aceito pela soleira acrescenta um chip de prazo
à fita. **A fase deu ao jogador um botão que lhe custa a página.**

R12 mediu 51,5 % → 37,3 % e disse que o telefone pagava a fase. **Jogando, é
pior do que isso, e a culpa não é só da soleira:** a soleira são 149 px; a
barra de estado mais os prazos são **261 px**, e ninguém os mediu.

### 3.5 · O que a fase acertou, e não se diz de passagem

- **Os 20 verbos genéricos morreram.** Não senti falta deles uma única vez em
  vinte turnos. A regra de §4.1 estava certa: eram invenção do jogador vestida
  de oferta do mundo.
- **O `▸` virou porta.** `▸ Pessoas`, `▸ Mural`, `▸ Mercado`, `▸ Códex`,
  `▸ Correio` são botões de 48–50 px, na mesa e no telefone. O defeito de
  `{tag:"SPAN", clicavel:false}` está fechado.
- **O campo cresceu de 35 para 65 px** e `Agir →` de 1 946 para 5 785 px².
  Nenhum controlo de ação abaixo do piso de 48 nesta tela, nos dois tamanhos.
- **O preço saiu do `title`** nas ofertas: `◉ 205 · +166 XP · +3 fama · assina
  Olga da Meia-Lua · prazo 4 noites`, aceso, sem rato, no telefone também.
- **O acampamento é a melhor tela do jogo fora do tabuleiro** — *"O TEMPO ESTÁ
  PAUSADO"*, três saídas com o custo escrito em cada uma.
- **O véu do dado continua a ser o momento em que isto parece um jogo.** Tirei
  dois `1` naturais, e o `🌠 Destino · de graça` salvou-me de um deles com o
  primeiro dado ainda na tela (`✧ REFEITO — O PRIMEIRO DADO DEU 1`). É a única
  coisa em vinte turnos que me fez reagir com o corpo.

---

## 4 · O que doeu jogando

Por ordem do que mais me tirou do jogo.

**1. Uma frase minha custou seis dias, e nada me avisou.** T10 — *"Saio a pé
para a Vila de Espinho"* — levou o calendário de **1 de Brumal 09:15** para
**7 de Brumal 06:47**. T20 — *"pouso a espada e entro no posto"* — de **8** para
**14 de Brumal**. Eu tinha na tela, naquele instante, um prazo de **4 noites**.
**Nenhuma ação desta tela diz quanto tempo custa antes de acontecer** — só o
`▸ ir` do mapa diz («50 min a pé»), e esse é o único. A moeda mais cara deste
jogo é o tempo, e é a única sem etiqueta.

**2. Cliquei `🌙 Descanso longo` e paguei três coisas que o botão não dizia.**
Ele diz *"tudo, uma vez por dia"*. O que aconteceu: `⚠ Prazo: Tirar Alba de lá
●○○○ (1/4) — mais uma noite passou` · `🥖 Comida acabou` · `💧 Água acabou`.
Três preços, nenhum na cara do botão, todos irreversíveis. É a lei da casa
quebrada num botão da tela principal, e é o mais fácil de consertar de tudo o
que está aqui.

**3. Uma oferta que só pode desperdiçar o turno.** `Convidar Vero do Braseiro`
traz escrito por baixo *"mais 5 dias de estrada juntos antes de decidir"* — ou
seja, **diz que vai recusar**. Cliquei. O jogo escreveu a frase por mim, o
sistema respondeu **exactamente o que o botão já dizia**, gastou uma chamada ao
Narrador, e **o botão continuou lá**, igual, pronto para o mesmo. Um controlo
que não pode mudar nada não pode ocupar a soleira: *nunca pode custar o turno*.

**4. `tem preço` não é um preço.** A mesma oferta diz `tem preço` e não diz
qual. Isso ensina o jogador a clicar para descobrir quanto custa — o contrário
exacto da lei.

**5. O número prometido não é o número pago.** Duas vezes, e com o mesmo sinal:

| a soleira prometeu | o sistema deu |
|---|---|
| `◉ 205 · **+166 XP** · +3 fama` | `◉ 205 (o combinado) · **191 XP** · +3 fama` |
| `◉ 115 · **+111 XP** · +3 fama` | `◉ 115 (o combinado) · **130 XP** · +3 fama` |

O ouro bate. O XP não — sempre ~15 % acima. A oferta mostra um número e o
recibo mostra outro; o veredito antes do clique só vale se for o mesmo veredito.

**6. O jogo pede-me para gastar ◉ e não me diz quanto eu tenho.** A barra de
estado tem dez coisas — nível, vida, mana, dia, hora, estação, tempo, lugar, XP
— e **não tem a bolsa**. Todas as ofertas da soleira são denominadas em ◉.

**7. Uma frase clara foi lida como outro verbo.** Escrevi *"Abro as mãos,
mostro que não saco arma, e falo depressa: «Procuro a Alba»"* e o sistema armou
**`vasculhar o lugar`, dificuldade 16, o meu bónus +1**. Uma frase sobre falar
virou um teste de Percepção que eu não pedi, e o dado já estava na tela quando
eu percebi.

**8. O mundo do sistema e o mundo da prosa contradizem-se na mesma tela.** O
mapa diz `faltam 1153 km até Vila de Espinho` e `Elma · SE 89 km`; a prosa tem
a Elma a servir-me água a um metro de distância. E o contrato da Alba, que a
soleira me vendeu com *"prazo 4 noites"*, fica a **1 242 km** — é
matematicamente impossível, e nada no cartão o dizia.

**9. A missão fechou antes da história.** *"Tirar Sara de lá"* completou-se com
`Chegar a as salinas ✓ (1/1)` **no instante em que pisei lá** — `+57 moedas ·
+89 XP` — com a Sara ainda por encontrar, dentro de casa, na frase seguinte. A
recompensa chegou antes do resgate.

**10. O português do sistema racha em todo o lado.** `Praga em o posto da
estrada` · `Tirar Alba de lá` colado a `Chegar a as salinas` · `Aceitar: Praga
em as terras baixas` (no save do R1). Os rótulos são montados por concatenação
sem contrair a preposição, e aparecem **na soleira**, que é a peça nova da
fase — o sítio onde a costura mais se vê.

**11. A gaveta `✦` ao lado do campo tem duas coisas, e as duas são de combate.**
`Golpe Poderoso` e `Postura Defensiva`, numa tela sem inimigo, durante vinte
turnos. (E `Postura` é uma palavra de bastidor, à vista do jogador.)

**12. `Esperar` é a única constante da soleira e é um menu, não uma ação.**
Abre `1h·2h·4h·6h·8h·12h·24h·cancelar`. Em 9 dos 20 turnos foi **a única coisa
que a tela me ofereceu**.

---

## 5 · O que consertar a seguir, por ordem do que muda o que o jogador sente

1. **Toda ação da tela principal diz o que custa em tempo, antes.** *Porque uma
   frase minha comeu seis dias contra um prazo de quatro noites e nada me
   avisou — e o tempo é a única moeda deste jogo sem etiqueta.*
2. **O `🌙 Descanso longo` escreve na cara as três coisas que cobra** (a noite
   do prazo, a comida, a água). *Porque é a lei da casa quebrada no botão mais
   irreversível da tela, e é meia hora de trabalho.*
3. **Oferta que não pode mudar nada sai da soleira** — `Convidar Vero` com
   *"mais 5 dias antes de decidir"* vira estado, não botão. *Porque um controlo
   que só pode gastar o turno é o oposto de um controlo.*
4. **A soleira aprende o terceiro verbo, e é `ir`.** Todo lugar que a prosa
   nomeia **e o mapa conhece** vira oferta, com o tempo de viagem na cara.
   *Porque foi o que eu quis fazer em 4 dos 20 turnos e nunca me foi oferecido,
   e o `▸ ir` do mapa prova que a peça e o número já existem.*
5. **A bolsa (◉) entra na barra de estado.** *Porque todas as ofertas da
   soleira são denominadas numa moeda cujo saldo o jogador não vê.*
6. **O XP da oferta é o XP do recibo.** *Porque +166 prometido e 191 pago, duas
   vezes em duas, transforma o veredito antes do clique numa estimativa.*
7. **`tem preço` passa a dizer o preço.** *Porque ensinar a clicar para
   descobrir o custo é ensinar exactamente o hábito que esta lei proíbe.*
8. **Os rótulos do sistema contraem a preposição** (`no posto`, `nas terras
   baixas`, `às salinas`). *Porque a peça nova da fase é onde a costura aparece,
   e uma oferta que fala errado não convence ninguém a tocá-la.*

---

## 6 · R1 ou R12 — e a resposta é dada por medida, não por gosto

**R12, primeiro. E R1 a seguir — porque R12 é o que torna R1 pagável.**

R1 pede **96 px** no topo da página para a xilogravura da cena. Contou o preço
com honestidade sobre um número que já não é o de hoje: *"418 px no telefone,
passa a 322, de 51,5 % para 39,6 %"*.

**Medi hoje, jogando, num save real com dois contratos aceites: a página no
telefone tem 151 px.** Tirar-lhe 96 deixa **55 px** — três linhas de prosa
debaixo de uma faixa maior do que elas. **R1 construído hoje não é um livro
ilustrado: é uma legenda por baixo de uma imagem.** E a peça mais bonita que
esta mesa desenhou morreria por causa de um orçamento que ninguém lhe mediu.

R12 também não está bem formulada, e digo-o porque é do meu ofício: ela acusa a
soleira (149 px) e não viu o réu maior. **A barra de estado são 180 px e a fita
dos prazos são 81 — 261 px contra os 151 da história.** Dez informações, sem a
única que as ofertas usam. *A moldura é maior do que o quadro, e cresce a cada
contrato que o jogador aceita.*

Então R12 é o item, com o alvo corrigido: **o telefone devolve ~180 px à
página**, vindos da barra de estado e da fita de prazos antes de virem da
soleira. Feito isso, a página passa de 151 para ~330 px, R1 cabe com os seus 96
e ainda sobram 234 — **mais prosa do que há hoje, com a cena a ganhar um rosto.**

**A ordem é essa e a razão é aritmética: R12 não é o preço de R1, é a condição
dela.**

---

## 7 · Para a pessoa decidir — a proposta ambiciosa

> ### O turno diz quanto tempo custa, e o relógio passa a ser o tabuleiro.
>
> Hoje, nesta tela, **escrever uma frase é apostar um número que ninguém lhe
> mostra.** Eu escrevi *"saio a pé para a Vila de Espinho"* e paguei **seis
> dias**. Escrevi *"pouso a espada e entro"* e paguei **outros seis**. Tinha, na
> mesma tela, um contrato com **quatro noites** de prazo e um cartaz a dizer
> `1/4`. Em vinte turnos, **uma única ação do jogo inteiro me disse o que ia
> custar em tempo antes de eu a tomar** — o `▸ ir` do mapa, que escreve *"50 min
> a pé"*.
>
> A proposta: **o tempo vira o custo visível de tudo**. Cada oferta da soleira,
> cada saída do acampamento, cada viagem e — a parte que muda o produto — **o
> próprio campo de texto** trazem um selo de duração antes do toque: *«isto
> leva cerca de meio dia»*, *«isto leva uma noite»*, *«isto leva a semana»*. E a
> fita dos prazos deixa de ser um chip de contabilidade e passa a ser o que ela
> realmente é: **o relógio da história a andar contra o herói**.
>
> **O que a senhora ganha:** os prazos deixam de ser decoração e passam a ser a
> tensão do jogo — *"dá para ir ao posto e ainda voltar a tempo da Alba?"* é uma
> pergunta de jogo, e hoje é impossível fazê-la. O jogo passa a ter, fora do
> combate, a coisa que o combate tem e que a tela principal nunca teve: **uma
> decisão com preço e com relógio.**
>
> **O que a senhora arrisca:** que escrever livremente pareça caro, e que o
> jogador escreva menos para não gastar o dia. A defesa é que o selo é uma
> *estimativa da cena*, não uma cobrança da frase — e que eu volto a jogar vinte
> turnos e conto outra vez.
>
> **Por que é sua e não nossa:** porque muda o que o jogador está a decidir em
> cada turno, e isso é o produto.

---

## 8 · Dívidas declaradas

1. **Não passou pelo Figma.** Continuo sem ferramenta de Figma nesta sessão. É
   dívida com motivo, como em R1, e o par visual das oito propostas de §5 tem de
   ser feito com o `desenho` antes de qualquer uma ir a construir.
2. **Uma campanha, uma semente, um herói.** Vinte turnos são o que foi pedido e
   é pouco para um número fino; o que aqui está com número está medido no DOM ao
   vivo, e o que é impressão está dito como impressão.
3. **Não houve combate nestes vinte turnos** — a amostra é a tela principal
   pura, que é o que R6 pedia, e portanto não diz nada sobre o tabuleiro.
4. **A definição de "% de prosa" não é a de R12.** Aqui é o retângulo visível do
   contentor rolável sobre a área do ecrã; R12 usou outra. Os dois números desta
   secção (42,5 % e 15,7 %) são comparáveis **entre si**, não com os 51,5/37,3
   de R12. O que se compara com R12 é o orçamento vertical em px, que está
   inteiro em §3.4.
