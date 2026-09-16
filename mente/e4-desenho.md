# E4 · o desenho — o anel que cumpre, e dez tintas que diziam uma cor e pintavam preto

**Ciclo E4, `desenho`, 16/09/2026.** Etapa só de biblioteca: nenhum `.js`,
`.jsx` ou `.mjs` tocado — o bastão do `App.jsx` ficou inteiro com o `oficial`.
Arquivo `Taverna — biblioteca` (`e5wJUzInAssoebx5npssKc`), **ampliado e
corrigido, nunca duplicado**. A lei fica em `mente/formas.md`, bloco de E4.

O que este ciclo tinha de fazer era pagar uma dívida de construção (o anel que
depende de `box-shadow`) e dar forma à casa alcançável. **Fez as duas — e
descobriu, ao abrir as peças para o fazer, que o problema não era a forma
faltar: era a forma não chegar ao pixel.**

---

# 1 · As peças fabricadas

| peça | nó | o que é |
|---|---|---|
| **`O anel de foco`** *(nova)* | conjunto **`166:4018`**, página `166:4004` | três variantes por `Superficie`: *Caixa* `166:4005` · *Dentro do SVG* `166:4009` · *Alto contraste* `166:4014`. A construção do anel deixa de ser lembrada e passa a ser escolhida |
| **`A casa` · `com foco`** | propriedade `com foco#164:0` + oito nós `anel de foco` (`164:106`…`164:113`) | o foco passa a ser **marca** componível com qualquer `Estado`, em vez de ser um `Estado` |
| **`A casa` · o anel muda de lado** | os mesmos oito nós | 56×56 a `−4` (por fora) → **48×48, `ink` 3 px `INSIDE`, raio 0** (por dentro) |
| **`Selo de estado` · a fenda do número** | `o numero#166:9`, `a palavra#166:0`, `com numero#166:18` | o selo passa a poder escrever um número que pode ser negativo |
| **`Selo de estado` · a prova** | `166:4783` | os quatro quadrantes de sinal × tom, em instâncias reais |
| **`Botao` · o anel de `Papel=Chamada`** | `167:4910`…`167:4913` | duas `DROP_SHADOW` → `o anel` + `o vao` absolutos, nas duas medidas |
| **`A escolha` · o anel das três formas** | *Cartao* · *Pilula* · *Aba*, `Estado=Foco` | duas `DROP_SHADOW` → geometria absoluta, zero crescimento |
| **`Barra de medida` · `o delta`** | `o delta#166:27` | `-3` (ASCII 45) → `−3` (U+2212 8722), e a camada passa a propriedade |
| **`O anel de foco` · a folha** | `166:4267` | a folha de construção ao lado do conjunto, com as três linhas de CSS |

---

# 2 · Como a peça do anel GARANTE, em vez de prometer

A decisão do `regente`: *o anel de foco não pode depender de `box-shadow`
sozinho, nunca* — nem em SVG, nem em alto contraste. A peça cumpre por três
mecanismos, e nenhum deles é «lembrar-se».

**Primeiro, a escolha é obrigatória.** `Superficie` é um eixo de variante: não
há como instanciar o anel sem dizer em que superfície ele vive. Cada variante
traz o CSS exacto na `description` do conjunto.

**Segundo, o que carrega é sempre `outline`.**

```
Caixa            outline: 2px solid ink; outline-offset: 2px;
                 box-shadow: 0 0 0 2px bg;      /* só o vão, decoração */
Dentro do SVG    outline: 3px solid ink; outline-offset: -3px;
Alto contraste   outline: 2px solid Highlight; outline-offset: 2px;
```

`outline` pinta em SVG (o `box-shadow` não), é preservado por `forced-colors` (o
`box-shadow` é removido por especificação), não ocupa leiaute (a `border` ocupa)
e não tem sintaxe de lista (onde o `none` invalida tudo em silêncio). **A sombra
fica no papel de decoração: pode morrer sem levar o anel com ela.**

**Terceiro, e é o que fecha: a biblioteca deixou de ensinar o contrário.**
Sobravam **cinco** anéis feitos só de sombra — dois no `Botao` *Papel=Chamada* e
três em `A escolha`. Os cinco convertidos a geometria absoluta, com o tamanho
medido antes e depois: **97×72, 76×57, 260×88, 260×48, 260×48 — iguais nos
dois lados.**

> ### A sombra de `Papel=Chamada` RENDERIZAVA, e foi por isso que E3 não a apanhou.
> E3 converteu `Gesto` e `Recuo` porque não se viam — corpo sem tinta, a
> armadilha daquele ciclo — e deixou `Chamada` de pé porque se via. **Ver no
> Figma não é o teste.** O teste é sobreviver ao alto contraste, e ali aquele
> anel era zero. Era a última promessa de anel feita só com sombra nesta casa, e
> é literalmente a dívida **A11**.

## 2.1 · E apareceu a QUINTA maneira de apagar um anel

E3 escreveu que há quatro. Há cinco, e a quinta estava ali ao lado:

> **`clipsContent` (Figma) / `overflow: hidden` (CSS) num ANCESTRAL corta o
> anel** — que é, por construção, desenhado fora da caixa.

**Medido:** o nó `Botao` de **todas as seis** variantes de `Estado=Foco` tinha
`clipsContent = true`, e o anel é desenhado a `−4`. **Os seis anéis que E3
construiu estavam a ser cortados desde o dia em que nasceram.** A foto de E3 diz
*"o anel aparece"* — e aparecia: a parte de baixo. À escala da miniatura, um
anel cortado em três lados lê-se como um anel.

Destravado nos seis, e conferido por foto isolada nas três famílias.

> **Um anel que se desenha fora da caixa confere-se no PAI, não no nó.** Nos
> dois lados — Figma e CSS — a propriedade do anel continua perfeita.

---

# 3 · O achado do ciclo: dez tintas que diziam uma cor e pintavam preto

A tarefa dizia *o alvo é hoje um `<rect fill="transparent">` — o clique funciona
e a forma não existe*. Fui à peça esperando fabricar a forma. **A peça já a
tinha:** `o banho` (âmbar 10 %), `a borda` (âmbar 1 px a 0,55) e `o custo` aceso
já em *Alcançável*, em JetBrains Mono Bold 10 px, exactamente como E1 mandou.

E depois fotografei-a.

> ### Uma tinta guarda DOIS valores — o literal e a variável ligada — e quando eles discordam, o que vai ao pixel pode não ser o que a variável diz.

`o custo` de *Alcançável* estava ligado a `amberSoft` **e** guardava o literal
`#000000`. O inspector devolvia `VariableID:1:10`, impecável. O pixel era preto.

| `o custo` sobre a casa alcançável (`bg` + banho âmbar 10 % = `#241B19`) | |
|---|---|
| o que estava (`#000000`) | **1,24:1** |
| o que ficou (`amberSoft` `#F5C878`) | **10,78:1** |
| o que a WCAG 1.4.3 pede | 4,5:1 |

**O número que a primeira lei desta casa manda escrever dentro da casa — *o que
é alvo tem o custo escrito dentro* — era invisível.**

E não era só o custo. **Varridas doze páginas, a doença apareceu dez vezes:**

| peça | nó | dizia | pintava |
|---|---|---|---|
| `A casa` *Alcancavel* | `o custo` | `amberSoft` | preto |
| `A casa` *Sob o dedo* | `o custo` · traço do `quadrado` | `amberSoft` · `amber` | preto · preto |
| `A casa` *Confirmando* | traço do `quadrado` | `amber` | preto |
| `A casa` *Mira* | traço do `quadrado` | `violet` | preto |
| `A casa` *Foco* | `o custo` · traço do `quadrado` | `amberSoft` · `amber` | preto · preto |
| `A casa` *Alvo* | `o custo` | `amberSoft` | preto |
| `A casa` (o topo) | `fills` | `bg` | preto |
| **`A regua` *Eixo=Linha, Estado=Procurada*** | `o rotulo` | `ink` | **preto** |

> ### As bordas de quatro estados da casa eram pretas sobre um tabuleiro preto. E o *grau do meio* da régua — o que E2 inventou de propósito, e mediu em 15,31:1 — não existia em metade dos eixos.
> E2 escreveu: *"sem ele a régua diz a mesma coisa quando o jogador escreveu `K`
> e quando escreveu `K14`"*. No eixo `Linha`, era isso que acontecia. **A
> decisão estava certa, a medida estava certa, e o pixel era outro.**

**Zero achados** em `Botao`, `Fechar + Selo`, `Barra + Veu`, `Consequencia`,
`A escolha`, `A vez`, `A ficha curta`, `A marca de borda`, `O verbo com preco`,
`A pergunta que expira` e `W1 · o verbo armado`. **A doença é das peças de E1 e
E2 — e são exactamente as duas que E4 ia pintar.**

A lei que fica, em `formas.md`: *sempre que se liga uma variável a uma tinta,
escreve-se o valor dela no literal também — porque o literal é o que sobra
quando alguma coisa corre mal, e um literal preto é a pior herança possível.*

> ### E3 aprendeu que *o dado lido de volta pode estar certo sobre uma coisa que não se desenha*. E4 aprendeu o gémeo, e é pior: o dado lido de volta pode estar certo sobre uma coisa que se desenha de OUTRA cor.

---

# 4 · O foco numa grelha: por que a peça teve de mudar de forma

O `jogo` contou **69 toques de `Tab`** até ao `Atacar`, e a cura é *roving
tabindex*. Isso não é só menos toques: **muda o que a peça tem de saber
desenhar.**

Com um ponto de paragem só, **a casa focada e a casa sob o dedo passam a ser
casas DIFERENTES ao mesmo tempo** — o teclado numa, o rato noutra. Uma peça cujo
foco é um valor de `Estado` só sabe desenhar uma das duas.

> ### Foco não é uma espécie de casa: é uma marca sobre uma casa. `Estado` diz o que a casa É; `com foco` diz onde o teclado está.

`A casa` ganha a booleana `com foco` (por omissão **false**), ligada ao `visible`
do anel nas oito variantes. `Estado=Foco` fica **aposentada** e escrita como tal
na `description` — equivale a `Estado=Sob o dedo` + `com foco`.

**Não a apaguei**, e a razão tem número: **12 instâncias vivas** na página
`A batalha`, que é do `jogo`. *Peça mudada em silêncio por baixo de uma
composição é pior do que peça com espaço reservado* — a regra que E3 invocou
contra si próprio, aplicada aqui.

**O anel mudou de lado, e isso é conserto:** estava por **fora** (56×56 a `−4`),
e **uma casa tem oito vizinhas coladas** — o anel da casa focada pintava por cima
da borda de alcance das oito. Passou a `48×48, ink 3 px INSIDE, raio 0`, que é
carácter a carácter o `outline: 3px solid ink; outline-offset: -3px` que
`estilo.js` já escreve. *O Figma e o código deixaram de discordar sobre onde o
anel vive.*

E3 já tinha fabricado `.tv-anel-foco-no-campo` e a tarefa mandou usá-la, não
fabricar a segunda. **É o que a peça agora aponta**, pelo nome, na
`description`.

## 4.1 · O endereço: a lei de E1 dita pelo motivo dela

E1 escreveu *"o endereço só nos dois estados que já carregam texto"* e deu a
razão: **86 endereços acesos ao mesmo tempo é a planilha.** A peça mostrava-o em
**cinco**. E *Mira* acende **o alcance inteiro de uma habilidade** — dezenas de
casas. *Era literalmente a planilha que a lei existe para impedir.*

Aplicando o motivo em vez da letra:

> ### O endereço aparece na casa que o jogador está a APONTAR — com o dedo, o cursor ou o teclado — e em mais nenhuma. É sempre no máximo UMA.

E isto não é invenção minha: `grade-de-batalha.jsx:463` já escreve
`const apontada = focada || sobre`, com o comentário *"pelo foco do teclado antes
do rato"*. **O código já vivia a lei; era a peça que não.** Apagado em *Mira* e
em *Alvo*.

---

# 5 · O alvo que é gente, e a cor que é a mesma de propósito

A pergunta do `regente` era medível: *se o estado mirado de um inimigo e o
realçado de uma casa forem a mesma cor, o jogador aprende que a cor não quer
dizer nada.* **Medido na peça:**

| estado | tinta | sobre `bg` | a silhueta |
|---|---|---|---|
| *Alcancavel* | banho âmbar 10 % + borda 1 px a 0,55 | **3,406:1** | moldura contínua, fina |
| *Sob o dedo* | banho âmbar 22 % + borda 1 px cheia | **8,999:1** | moldura contínua, grossa |
| *Mira* | banho violeta 16 % + traço 1,5 px **tracejado** | **5,47:1** | tracejado — a segunda língua |
| *Alvo* | banho âmbar 10 % + **quatro cantos** 2 px cheios | **8,999:1** | **cantos, não moldura** |

**A cor é a mesma por decisão de W1** — *âmbar é «o que você pode fazer agora»*,
e o que muda entre verbos não é a cor: é o conjunto e a palavra na linha do
veredito. *Seis cores para seis verbos é o que essa regra existe para impedir.*
**O canal que separa é a silhueta**, e as quatro são distinguíveis sem cor
nenhuma.

## 5.1 · E a lei do «escrito dentro» partia-se na casa ocupada

Aplicada literalmente a `Estado=Alvo`, a lei de E1 não fecha — e a razão é
geometria, medida na peça:

- a ficha da criatura tem `r = 0,40` da casa e o arco da vida corre em **0,47**;
- `o custo` vive em `(15, 28)` com 18×13 — **no centro exacto da ficha**;
- `o endereco` vive em `(4, 4)` com 17×12 — **debaixo do arco da vida**.

> ### As duas fendas de texto da casa caem debaixo do corpo que a ocupa. Uma casa que é gente não pode levar o número.

A lei reescrita, e é a que fica em `formas.md`:

> ### O que é alvo carrega uma marca desenhada POR DENTRO da casa — o custo escrito, quando a casa é chão; os quatro cantos, quando a casa é gente. O que não tem nada por dentro não é alvo.

Continua a servir o «ver tudo» (a 20–28 px nada se escreve e nada é alvo) e
passa a servir o caso que a partia.

---

# 6 · A gramática do número que pode ser negativo

**O que já existia, e são duas coisas:**

1. **`Barra de medida` · `o delta`** — mono 11 px, `+3` no *Ganho* e `-3` no
   *Golpe*. A única peça da casa que já escrevia um número com sinal.
2. **`Consequencia` *Tom=Preco*** — o preço como fenda da peça, não como
   `<span>` escrito à mão em cada sítio (`formas.md`, *gastar um recurso*).

**O que faltava** é o que o motor passou a saber dizer depois de H4 (v9.276):
`mecanicaDe` devolve `danoReduzido` (**enfraquecido** — bate menos),
`danoRecebidoExtra` (**marcado** — apanha mais) e `defesa`, e a fila do HUD
(`App.jsx:21603`) mostra **só `mec.danoExtra > 0`**. *Três números que o motor
calcula e ninguém lê.*

> ### A casa só tinha gramática para bónus. O `+` era verde e o `−` era vermelho — e isso funcionou enquanto os dois únicos números visíveis calhavam de ter o sinal do lado do tom.

**O que nasceu:** `Selo de estado` ganha `o numero`, `a palavra` e a booleana
`com numero` (por omissão **false**: tamanhos conferidos, 67×22 e 68×23 antes e
depois — **nenhuma instância existente muda**).

> ### O SINAL diz a aritmética. O TOM diz a favor de quem a conta pende. Os dois PODEM discordar — e escolher o tom pelo sinal é o defeito.

| `Tom` | escreve | lê-se |
|---|---|---|
| Bom | `+2 DANO` | um mais a seu favor |
| Bom | `−2 DANO SOFRIDO` | um **menos** a seu favor |
| **Perigo** | **`−2 DANO`** | **enfraquecido — um menos contra si** |
| **Perigo** | **`+2 DANO SOFRIDO`** | **marcado — um mais contra si** |

As duas de baixo são as que a casa não sabia dizer. Provadas em instâncias
reais: `166:4783`.

**E a palavra continua a fazer o trabalho que a cor não pode fazer sozinha**
(WCAG 1.4.1): ponto + número + palavra, e é `DANO` contra `DANO SOFRIDO` que
separa os dois vermelhos.

## 6.1 · O sinal de menos é `U+2212`

`Barra de medida` escrevia `-3` (ponto de código **45**); o `App.jsx` escreve
`−3` (**8722**). Corrigido nas quatro variantes.

> Em JetBrains Mono o **avanço** é o mesmo — medido: `+2` e `−2` medem **11 px**
> a 9 px de corpo, e uma coluna de selos não treme. O que difere é o **glifo**: o
> hífen é curto e alto, o menos tem a largura e a altura da barra do `+`. `-3` ao
> lado de `+3` tem o traço a outra altura; `−3` ao lado de `+3` não tem.

---

# 7 · As divergências novas, e o que fiz com cada uma

| divergência | resolvida? |
|---|---|
| dez tintas com literal a discordar da variável | **sim** — curadas, e a lei escrita |
| cinco anéis feitos só de sombra | **sim** — convertidos a geometria, tamanho igual |
| seis anéis do `Botao` cortados pelo pai | **sim** — `clipsContent` destravado nos seis |
| o anel da casa por fora, contra o código que o põe por dentro | **sim** — a peça foi ao código |
| o endereço aceso em cinco estados, contra a lei dos dois | **sim** — apagado em *Mira* e *Alvo*, e a lei reescrita pelo motivo |
| `o delta` em hífen ASCII contra o `−` do código | **sim** |
| a palavra do `Selo` era camada, não propriedade (o **quinto** sítio com a doença de E2) | **sim** |
| `Selo` escreve a 9 px, o `App.jsx` a 10 px | **não** — é `TIPOS`, que está com a pessoa. **Declarada, não coçada** |
| `A escolha` *Forma=Aba* tem cantos mistos e o anel novo é uniforme | **não** — 1 px em dois cantos, declarada |
| `O interruptor` constrói o anel ao contrário (`o vao` dentro do `anel`) | **não** — não cortava nada, e é a sexta construção; devia ser a primeira |
| `Estado=Sob o dedo` chama-se mal (é *a casa apontada*) | **não** — renomear a opção parte as instâncias |

---


# 6b · As duas peças que o `jogo` pediu ao compor, e nasceram no mesmo turno

`mente/e4-jogo.md` §6 pede cinco peças. Duas caem dentro do mandato de E4 e
foram fabricadas antes de o ciclo fechar.

## `A mira` — a retícula é da CRIATURA, não da casa

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

## `a paragem` — a posição lembrada do cursor de teclado

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

---

# 8 · O que ficou por fazer, honesto

1. **As 12 instâncias de `Estado=Foco` em `A batalha`** continuam aposentadas e
   por migrar. A página é do `jogo`.
2. **Nada disto foi visto num navegador**, porque neste ciclo não houve código
   meu. O dente de K4 continua por cravar do meu lado: o que impede o anel de
   morrer no dia em que alguém instanciar estas peças **continua a ser papel**.
   A catraca certa é um dente que proíba `boxShadow` inline em qualquer controlo
   que carregue `.tv-anel-foco` — e isso é código, logo é de outro. **É também,
   palavra por palavra, o que a proposta ambiciosa deste ciclo pede.**
3. **Não toquei em `TIPOS` nem em `ESCALA_DA_CASA`**, que estão com a pessoa —
   nem parcialmente. O 9-contra-10 do `Selo` é o sítio onde a mão coçou, e está
   escrito em vez de feito.
4. **Varri doze das vinte e quatro páginas.** As doze que faltam são páginas de
   composição e de peças que a tela da batalha não usa; a doença das tintas pode
   estar lá, e não olhei.

---

# 9 · A proposta ambiciosa

**`(E4) o foco deixa de ser opção e passa a ser o padrão da casa — e a classe
passa a existir só para DESLIGAR`** · *pesado* · em `mente/pauta-desenho.md`,
*Para a pessoa decidir*.

Cinco maneiras silenciosas de apagar um anel, e **218 `<button>` crus contra 16
`<Botao>` — 6,8 % dos controlos passam por `ui.jsx`**. A tela da batalha nasceu
com `outline: none` inline em **67 dos 80** elementos focáveis; a barra de
batalha tinha **0 de 7** controlos com anel visível; E4 achou os seis anéis do
`Botao` cortados desde a nascença e cinco ainda feitos de sombra.

> ### Cinco ciclos seguidos encontraram a mesma classe de defeito em sítios diferentes. O que se repete não é o erro: é o ónus estar do lado errado.

A folha passa a dar o anel a `:focus-visible` de tudo o que é focável, com a
superfície decidida por selector, e a classe passa a servir só para desligar, em
casos nomeados. *Um controlo novo nasce acessível, e um defeito passa a exigir
um acto explícito.* Prova por medida e por estudo citado (WCAG 2.4.7 e 2.4.11,
CSS Color Adjust 1 sobre `forced-colors`, Selectors 4 sobre `:focus-visible`);
**falta a experiência jogada**, e é o que peço ao `jogo`.

---

# 10 · As armadilhas do Figma que E4 pagou

Somam-se às de D3, D4, E1, E2, K1 e E3.

1. **`clipsContent` num ancestral corta um anel absoluto.** Não dá erro, e à
   escala da miniatura lê-se como presente.
2. **O literal e a variável são dois valores.** Ligar a variável não reescreve o
   literal, e o literal pode ganhar. **Escreva os dois.**
3. **`addComponentProperty` com `visible` é atropelado por um `node.visible`
   escrito depois** — o valor por omissão da propriedade passa a ser o do nó.
   Confira `componentPropertyDefinitions` **numa chamada nova** (a armadilha de
   E2: a leitura imediata devolve o estado anterior) e reponha com
   `editComponentProperty`.
4. **Uma propriedade de texto tem UM valor por omissão por CONJUNTO**, não por
   variante: ligar `o delta` às quatro variantes da `Barra` escreveu `−3` por
   cima do `+3` do *Ganho*. *O sinal é conteúdo, e quem compõe escreve-o.*
5. **O fundo do conjunto é branco por omissão**, e um anel claro sobre branco
   não se lê. Um conjunto desta casa pinta-se de `bg` antes de se fotografar —
   senão confere-se a peça num chão que o jogo não tem.
