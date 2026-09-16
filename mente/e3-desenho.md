# E3 · o desenho — a mesa volta ao Figma, e o arquivo desmente a folha

**Ciclo E3, `desenho`, 16/09/2026.** Uma etapa só de biblioteca: nenhum `.js`,
`.jsx`, `.mjs` foi tocado — o bastão do `App.jsx` ficou inteiro com o `oficial`,
que montava a tela da batalha em paralelo. Arquivo `Taverna — biblioteca`
(`e5wJUzInAssoebx5npssKc`), **ampliado e corrigido, nunca duplicado**. Zero hex
solto: as duas cores novas entraram ligadas a variável (`bg` · `VariableID:1:3`,
`ink` · `VariableID:1:7`).

**O que este ciclo tinha de fazer, e fez:** pagar a dívida que K4 confessou por
escrito — *"ninguém abriu o Figma neste ciclo"* —, e com ela descobrir que **a
lei «nenhuma decisão de design sai sem passar pelo Figma» não protege só o
código: protege o documento.** Das cinco coisas que este ciclo corrigiu, **três
eram frases desta folha que o próprio arquivo desmentia**, e nenhuma delas seria
encontrada sem abrir o arquivo.

---

# 1 · A dívida: 47 × 48, e como ela morreu

## 1.1 · O que estava

`A escolha` · `20:77` · *Forma=Pílula*, quatro estados. **Altura 47 px no
Figma; `ALVOS.piso = 48` no código** (`src/estilo.js:125`), escrito em K4 com o
comentário `/* toda peça em que se toca */`.

K4 deixou a divergência **declarada** em `formas.md` em três sítios, e escreveu
porquê sem a atenuar: *"a alternativa era não fechar a peça torta que K3
nomeou"*. **Declarada é melhor que escondida, e é pior que resolvida.**

## 1.2 · A aritmética do 47, e por que ela é o defeito

O 47 não era uma decisão. Era uma soma:

```
15 (enchimento de cima) + 15 (a linha de texto de 11 px) + 15 (enchimento de baixo)
+ 2 (o traço de 1 px, que conta para o HUG)  =  47
```

**Ninguém escolheu 47.** Foi o que sobrou de escolher um enchimento e um corpo de
letra. É a mesma doença que K4 mediu do outro lado, em código: a fila media 27,5
px porque `9 × 1,5 + 12 + 2` dá 27,5, **e nem 27 nem 48 estavam escritos em lado
nenhum**.

> ### Uma altura composta por enchimento e corpo de letra é uma altura que muda sozinha.
> Trocar a letra de 11 para 12 px — uma decisão de legibilidade, tomada por outra
> razão, noutro dia — move um alvo de toque **sem ninguém ter tocado numa medida
> de alvo**. A régua e o texto não podem ser o mesmo número.

## 1.3 · Como fechou, e não foi somando 0,5 px de cada lado

**O enchimento vertical foi a zero e a altura passou a ser fixa.** Os quatro
`corpo` — `20:34`, `20:39`, `20:44`, `20:51` — ficaram
`layoutSizingVertical = "FIXED"` a **48**, com `counterAxisAlignItems = "CENTER"`
a centrar a letra. A altura deixou de ser uma soma e passou a ser **o número da
tabela**, que é literalmente o que `minHeight: ALVOS.piso` já dizia em código.

**As três fontes que fazem do 48 o número certo, e elas concordam:**

| fonte | pede |
|---|---|
| WCAG 2.5.5 *Target Size*, nível AAA | 44 × 44 CSS px |
| Apple *Human Interface Guidelines* | 44 pt |
| Material Design *Touch target size* | 48 dp |

**48 é o menor número que passa nos três.** E é, além disso, a casa do
tabuleiro, a linha do recuo do leque e o piso do `Botao` — *um piso com quatro
leitores vale mais que quatro números parecidos*.

**A divergência deixou de existir.** `formas.md` já não a declara: a entrada
*"dizer de antemão como o herói se defende"* diz agora que fechou, com os quatro
nós citados. **Não volta a ser escrita.**

## 1.4 · E o 47 tinha resíduo espalhado pela folha

A divergência não vivia só na entrada que K4 apontou. **O orçamento do telefone
de W1 fazia contas com o 47:**

| | dizia | diz |
|---|---|---|
| a fila de pílulas | 47 | **48** |
| a região reservada entre o campo e os verbos | 71 | **72** |
| a folga antes do degrau das 12 filas | 4 px | **3 px** |
| pílulas **e** segunda linha | 77 | 78 |

**Nenhuma conclusão de W1 muda:** 72 continua abaixo do degrau de 76, continuam a
ser **13 filas**, e a segunda linha da desistência continua a não caber. *O
número mudou; o veredito não* — e é por isso que se corrige em vez de se
reabrir. Corrigido nos dois sítios (a tabela da aritmética e o bloco citado).

---

# 2 · O `Estado=Foco` que crescia 28 px

## 2.1 · O que estava, medido nas três formas

| `A escolha` | Repouso | Foco **antes** | crescimento |
|---|---|---|---|
| **Pílula** | 47 | **75** | **+28** |
| **Aba** | 39 | 55 | +16 |
| **Cartão** | 88 | 104 | +16 |

**O +16 é a construção: um anel desenhado como dois quadros aninhados** — *anel
de foco* (traço 2 px) à volta de *o vão* (traço 2 px) à volta do *corpo* —, e
quatro traços de 2 px em auto-layout somam 8 px de cada lado.

**O +28 da Pílula é um erro por cima da construção:** o quadro de fora tinha
**8 px de enchimento em cima e em baixo** onde a Aba e o Cartão tinham 2. Doze px
a mais, sem razão nenhuma escrita.

> ### Um anel de foco que empurra o vizinho não é um indicador: é um alvo em movimento.
> E move-se contra quem menos o pode perder. Quem navega por teclado é
> **exactamente** quem a fila da ficha existe para servir — a fila nasceu para
> cumprir a WCAG 2.2.1 —, e a peça respondia-lhe fazendo o alvo saltar 28 px no
> instante em que ele chega lá. No telefone é o defeito que faz o dedo errar a
> pílula seguinte.

## 2.2 · O que ficou

**Zero crescimento nas três formas.** Os quadros de geometria saíram; o anel
passou a **duas `DROP_SHADOW` de raio 0**: alastramento **2** em `bg` (o vão) e
**4** em `ink` (o anel), por essa ordem — que é, carácter a carácter, o
`box-shadow: 0 0 0 2px T.bg, 0 0 0 4px T.ink` que esta folha decidiu em D3.

| `A escolha` | Repouso | Foco **agora** |
|---|---|---|
| Pílula | **48** | **48** |
| Aba | **48** | **48** |
| Cartão | 88 | 88 |

*(A Aba subiu de 39 para 48 pela mesma razão que a Pílula: é uma peça em que se
toca, e o piso é o piso. Não havia risco de composição — a Aba está
`[ainda não existe]` em código.)*

---

# 3 · O achado do ciclo: a folha declarava uma limitação que o próprio arquivo desmentia

## 3.1 · A frase falsa, e ela estava escrita duas vezes

`formas.md`, no bloco do anel de foco aplicado ao tabuleiro, escrevia:

> *"no Figma o anel é geometria porque o Figma não tem `box-shadow` de dois
> degraus"*

**É falso.** O Figma tem: duas `DROP_SHADOW` de raio 0 empilham-se exactamente
como a lista do CSS, com a de dentro a tapar a de fora. **E o `Botao` desta
mesma biblioteca já as usava desde D3** — `9:17`, `Papel=Chamada, Estado=Foco`,
com as cores ligadas a `bg` e a `ink` por variável.

> ### A folha justificou uma divergência com uma limitação da ferramenta que o próprio arquivo, na página ao lado, desmentia.
> E sobreviveu a K2, K3 e K4 — três ciclos — **porque em nenhum deles alguém
> abriu o arquivo.** A lei *"nenhuma decisão de design sai sem passar pelo
> Figma"* não existe só para o código não divergir do desenho. Existe para **o
> documento não inventar o desenho**.

## 3.2 · Mas a sombra do Figma não é o `box-shadow` do CSS — e a diferença apaga anéis em silêncio

Esta é a descoberta que custou o ciclo, e ela vale mais que a correcção.

> ### O `box-shadow` do CSS nasce da CAIXA. A sombra do Figma nasce da SILHUETA PINTADA.

Um nó sem tinta tem silhueta vazia. A sombra **não desenha nada, sem erro e sem
aviso** — e o inspector continua a reportar as duas sombras, certinhas, na
propriedade `effects`. *O dado lido de volta diz que o anel existe. A foto diz
que não.*

**Medido, variante a variante:**

| `Botao` · `Estado=Foco` | o corpo tem | as duas sombras | o anel |
|---|---|---|---|
| `Papel=Chamada` | tinta sólida (`amber`) | presentes | **renderiza** |
| `Papel=Gesto` | só traço de 1 px | presentes | **NÃO renderiza** |
| `Papel=Recuo` | nem tinta nem traço | presentes | **NÃO renderiza** |

**E agora o que isto significa para a tela que E3 está a construir:**
`Papel=Gesto` são **os seis verbos da barra de batalha** (`Atacar`, `Mover`,
`Esquivar`, `Empurrar`, `Derrubar`, `Saltar`) e `Papel=Recuo` é o **`esperar`**.

> ### A biblioteca prometia um anel de foco a sete dos sete controlos da barra de batalha, e não o mostrava em nenhum.
> Indicador de foco visível na fileira de verbos, na véspera de ela virar pixel:
> **zero.** A peça dizia que cumpria a WCAG 2.4.7 e não cumpria — e ninguém podia
> saber lendo a propriedade, porque a propriedade estava certa.

**O conserto:** quatro variantes (`9:73`, `9:80`, `9:129`, `9:136`) passaram a
**anel absoluto** — dois quadros com `layoutPositioning = "ABSOLUTE"`, recuo de
−2 (traço `bg`, 2 px, `INSIDE`) e −4 (traço `ink`, 2 px, `INSIDE`), cantos
`raio + recuo`. **Absoluto não entra no auto-layout**, logo a promessa do
`box-shadow` mantém-se: *o anel não ocupa leiaute*. Conferido por foto: o anel
aparece; as alturas não se mexem (48 e 30, 67 e 49).

## 3.3 · A lei que fica, e ela responde ao dente que K4 comprou com número

K4 apanhou, no navegador, **três defeitos que 141 asserções e 20 varredores
deixaram passar**, e dois eram de forma. Somando o de E3, a família está
completa — e são **três**, não um:

> ### Toda peça que promete um anel ou uma sombra tem de dizer COMO não ser apagada, e há três maneiras de a apagar. Nenhuma delas dá erro.
>
> 1. **No código: estilo inline vence a folha, sempre.** O anel de `.tv-anel-foco`
>    morre debaixo de um `boxShadow` escrito no `style={{…}}` da própria peça. Foi
>    assim que a fila que existe para cumprir a **WCAG 2.2.1** passou a falhar a
>    **2.4.7** (K4 §5.2). *Sombra e anel escrevem-se na mesma declaração, ou não
>    se escrevem.*
> 2. **No CSS: `none` não é item de lista.** `box-shadow: <sombra>, <sombra>,
>    none` é inválido, e o parser **descarta a declaração inteira, em silêncio**.
>    O repouso tem de ser **uma sombra nula** (`inset 0 0 0 0 transparent`), nunca
>    a ausência de sombra — e o conserto do anel conserta de lambuja a transição,
>    porque `sombra nula → sombra` interpola e `none → sombra` não.
> 3. **No Figma: a sombra precisa de tinta.** Corpo sem tinta, anel inexistente,
>    propriedade intacta. Onde o corpo não pinta, **o anel é geometria absoluta**.
>
> **Os três apagam o mesmo anel, nos três lugares onde ele vive.** Uma peça que
> promete foco promete os três — e isto está agora escrito em `formas.md`, no
> bloco de E3, §3.

---

# 4 · O `Botao` saltava 2 px, e a calha da razão nunca existiu

## 4.1 · A frase da folha, e o que a leitura devolveu

`formas.md` escreve desde E1: **`Botao` passou a ter *"uma altura por
`Papel`×`Tamanho`"*** — a correcção que impedia um botão de **crescer ao ficar
indisponível** e empurrar o tabuleiro. Lido de volta, corpo a corpo:

| corpo · Normal | Repouso / Foco | Esperando / Impedido | salto |
|---|---|---|---|
| `Chamada` | 53 | **55** | **+2** |
| `Gesto` | 44 | 44 | 0 |
| `Recuo` | **42** | **44** | **+2** |

**E1 curou 19 px dos 21. Os 2 que ficaram sobreviveram três ciclos.**

**A causa é uma propriedade, e ela é traiçoeira:**
`strokesIncludedInLayout = true`. O traço de 1 px **só existe nos estados em que
o botão recusa** — é o contorno que distingue *Esperando* e *Impedido* — e um
traço `INSIDE` **conta para o HUG** quando essa bandeira está ligada. Logo o
botão cresce **exactamente quando não pode ser premido**.

## 4.2 · E o segundo erro era pior, porque era invisível

**A reserva da linha da razão não era uma calha: era a altura fixa do quadro da
variante.** Em `Estado=Repouso` e `Estado=Foco` **não existe nó `razao` nenhum** —
há um quadro de 74 px com um conteúdo de 53 e **21 px de vazio por baixo**. Em
`Impedido`, a razão real mede `6 de goteira + 13 de linha` = **19**.

> ### A reserva estava 2 px errada desde o dia em que nasceu, e ninguém viu porque o outro erro a compensava ao contrário.

74 (o vazio reservado) contra 53 + 6 + 15 = 74 em *Impedido*: **batia**, porque
os 2 px de traço a mais cancelavam os 2 px de reserva a mais. **Tirar o traço da
conta expôs o erro que ele escondia** — e é por isso que este ciclo só o
encontrou depois de mexer noutra coisa.

> ### Uma reserva que não é um nó não é uma reserva: é uma coincidência entre dois números que ninguém ligou um ao outro.

## 4.3 · O conserto é estrutural, e é o mesmo da pílula

O quadro `Botao` passou a **altura fixa = corpo + 6 + 13**, com os filhos
alinhados ao topo (`primaryAxisAlignItems = "MIN"`), e a variante passou a
**abraçá-lo** (`primaryAxisSizingMode = "AUTO"`). **A calha existe mesmo quando
está vazia, e nenhum estado a pode mexer.** Lido de volta nas 26 variantes:

| | corpo (o alvo) | a peça (corpo + 6 + 13) |
|---|---|---|
| `Chamada` · Normal / Pequeno | **53** / 38 | **72** / 57 |
| `Gesto` · Normal / Pequeno | **48** / 30 | **67** / 49 |
| `Recuo` · Normal / Pequeno | **48** / 30 | **67** / 49 |

**Uma altura por `Papel`×`Tamanho`, e agora é verdade** — nos cinco estados,
incluindo o `Armado` de W1.

---

# 5 · Os alvos de toque sobem ao piso, e um deles reprovava a norma

| corpo · Normal | antes | agora | o que era |
|---|---|---|---|
| `Papel=Chamada` | 53 | **53** | já passava com folga |
| `Papel=Gesto` | 44 | **48** | no mínimo do WCAG, 4 abaixo da casa |
| `Papel=Recuo` | **42** | **48** | **abaixo do mínimo do WCAG 2.5.5 (AAA)** |

> ### `Papel=Recuo` em repouso media 42 px — dois abaixo dos 44 que a norma pede — e `Papel=Recuo` é o `esperar` da barra de batalha.
> A peça que a tela usa para *"não fazer nada"* era a única da biblioteca que
> reprovava a norma. E reprovava **só em repouso**: ficava conforme ao ficar
> indisponível.

## 5.1 · O que isto custa à tela da batalha: nada, e o número diz porquê

A aritmética de W1 dá à fileira de verbos **63 px**, que é a peça inteira — corpo
**mais** a calha da razão. Mas W1 também escreveu que **na fileira de batalha a
calha nunca é usada**, porque a fileira partilha uma linha do veredito.

**Logo o que o `oficial` monta é o corpo, e o corpo é 48.** A fileira de verbos
custa **48 px, não 63 nem 44** — e os 48 estão *abaixo* do número com que W1 fez
o orçamento. **Subir ao piso não come uma fila de casas: devolve 15 px.**

## 5.2 · E `Tamanho=Pequeno` passa a ter uma regra escrita

`Pequeno` mede 38 / 30 / 30 — **abaixo do piso e abaixo da norma**. Não o subi:
subir apaga a diferença entre `Normal` e `Pequeno` e a variante deixa de ter
razão de existir. Em vez disso ficou escrito, em `formas.md`:

> ***`Tamanho=Pequeno` é proibido no telefone e proibido como alvo primário em
> qualquer largura.*** Existe para densidade de ponteiro. **Quem o usar fora
> disso está a escrever um defeito de acessibilidade com uma variante da
> biblioteca** — e agora não pode dizer que não sabia.

---

# 6 · As peças de E3, conferidas uma a uma

| peça · nó | **promete** | **estava** | **ficou** |
|---|---|---|---|
| **A régua** · `30:11` | calha de 22, casa de 48, três graus | 48×22 · 22×48, 6 variantes | **bate — nada a fazer** |
| **A vez** · `30:163` | faixa de 56 (48 no telefone); 2 560 px em Linha por oito | Linha 320×48 (8 × 320 = **2 560** ✓), Selo 48×48, 24 variantes | **bate** |
| **A ficha curta** · `31:137` | tirar do `<title>` o que se sabe do inimigo | 288×150 (152 em *Caído*), 6 variantes | **bate** |
| **A pergunta que expira** · `31:518` | 344 de largura, encaixa na lateral de 344 | 344 nas oito variantes (118 · 215 · 56 de altura) | **bate** |
| **`Consequencia` *Linha*** · `11:35` | a linha do veredito, **24 px** | peça de **15**, faixa composta de **22** | **faixa 22 → 24** (`40:451`), e fica escrita a distinção |
| **`Botao` *Papel=Chamada*** · `9:170` | *"o único da tela"* | 53 px, salto de 2 px entre estados | **a peça bate; a FRASE estava revogada** (ver §7) |
| **`Botao` *Papel=Recuo*** · `9:170` | o `esperar`, piso de 48, anel de foco | **42**, e **sem anel visível** | **48, e o anel existe** |
| **`Botao` *Papel=Gesto*** · `9:170` | os seis verbos, piso de 48, anel de foco | 44, e **sem anel visível** | **48, e o anel existe** |
| **`A escolha` *Pílula*** · `20:77` | 48, foco sem crescer | 47, foco a 75 | **48 / 48** |

## 6.1 · Os 24 px da `Consequencia` são da REGIÃO, não da peça

A peça mede **15 px** — uma linha de 10 px a 150 % — e **assim tem de ser**. Os
24 são a **calha reservada** onde ela se senta, e a distinção importa porque a
folha escrevia o 24 ao lado do nome da peça, o que convida a construir uma peça
de 24.

Na tela composta do telefone (`40:447`) a faixa *a linha do veredito* media
**22**. Corrigida para **24**, com os 2 px pagos pelo campo (550 → 548), de modo
que a soma das seis regiões continua a dar **812** exactos.

**E fica a regra que o número sozinho não carrega:**

> ### A faixa do veredito é um PISO, nunca uma altura fixa.
> A 115 % de texto do sistema o avanço vai de 6,0 a 6,9 px por carácter e a frase
> quebra em duas linhas: pede **30**. Uma faixa fixa em 24 **corta a razão**, que
> é exactamente o que o eixo `Largura` de E2 existe para impedir. *Reservar 24 é
> impedir o tabuleiro de saltar; fixar 24 é impedir o jogador de ler.*

---

# 7 · A discordância que encontrei já resolvida — e a folha ainda dizia as duas coisas

A tarefa pedia-me para conferir **`Botao` *Papel=Chamada* (o `Atacar`, o único da
tela)**. Conferi a peça: bate. **Mas a frase está revogada desde W1.**

- `formas.md`, bloco de E1: *"**`Atacar` é o único `Papel=Chamada` da tela.**"*
- `formas.md`, bloco de W1: *"**`Atacar` perde o `Papel=Chamada`** — decisão do
  `regente`, e a prova é uma foto"*, porque *"o âmbar cheio é a voz mais forte
  desta tela, e pertence ao que VAI ACONTECER, não ao que é popular"*, e **só se
  pode armar o que tem fundo para inverter**.

**Duas passagens da fonte da verdade a dizer o contrário uma da outra** — que é
precisamente o defeito que W1 nomeou ao consertar o lugar da linha do veredito:
*"uma fonte da verdade a dizer duas coisas é o defeito que ela existe para não
ter"*. **Não decidi nada aqui:** a decisão é do `regente` e já tinha sido tomada.
Riscei a linha de E1, apontei-a para a decisão de W1 e guardei o que ela tinha de
útil — que a distinção de `Atacar` não pode ser *uma cor de borda entre botões
iguais*. **Na tela da batalha não há `Papel=Chamada` nenhum.**

---

# 8 · O que fica por pagar, com número e com o motivo

1. **A tela da batalha composta no Figma é a de E1, e W1 nunca lá chegou.** Em
   `40:447` a barra dos verbos são **três fileiras de 44 px = 144**; W1 decidiu
   **uma fila de quatro**. *A página `A batalha` é do `jogo`* — por isso declaro
   em vez de recompor, mas o número fica: **quem olhar aquela tela vê 81 px de
   verbos a mais e uma decisão a menos.** Só a faixa do veredito foi corrigida,
   porque esse era um número meu.
2. **`A escolha` *Forma=Cartão*, `Estado=Impedida`, mede 107 contra 88 — +19 px.**
   É a doença que o `Botao` acabou de curar, na peça ao lado: a razão aparece em
   vez de estar reservada, e **numa lista de escolhas uma opção que fica
   indisponível empurra as de baixo**. Não paguei porque o Cartão tem **11 usos
   em produção** (`CartaoDeEscolha`, na criação de personagem) e crescer 19 px em
   todas é mudança de composição, não de peça. *Peça mudada em silêncio por baixo
   de uma composição é pior do que peça com espaço reservado* — a mesma regra que
   E1 invocou, aplicada a mim.
3. **`rotulo`, `a marca` e `a razao` continuam camadas e não propriedades** em `A
   escolha`. Quarta peça com a doença que E2 curou em três. Aberta desde K4,
   continua aberta.
4. **`Contador` e `Lista` continuam por fabricar.** Quando nascerem, nascem a 48.
5. **Nada disto foi visto num navegador**, porque neste ciclo não houve código meu
   para ver — e é honesto dizer que **o dente de K4 continua por cravar do meu
   lado**. O anel que o Figma agora mostra pode ser apagado por um `style` inline
   no dia em que alguém instanciar estas peças, e **a única coisa que o impede é
   a lei escrita em `formas.md` §3 do bloco de E3 — que é papel, não catraca.**
   *A catraca certa seria um dente de `check-formas.mjs` a proibir `boxShadow`
   inline em qualquer controlo que carregue `.tv-anel-foco`*, e isso é código,
   logo é de outro.

---

# 9 · As armadilhas do Figma que E3 pagou

Somam-se às de D3, D4, E1 e K1, que continuam de pé.

1. **A sombra precisa de tinta** (§3.2). É a armadilha do ciclo, não dá erro, e
   **mente ao verificador**: a propriedade lida de volta diz que o anel está lá.
   *Confira pelo dado lido de volta* protege contra a foto que mente; **não
   protege contra o dado que está certo sobre uma coisa que não se desenha.**
   Para esta classe só há um instrumento: **olhar.**
2. **`strokesIncludedInLayout = true` põe o traço na altura de um quadro em HUG.**
   Um estado que acrescenta traço acrescenta tamanho — em silêncio, e é assim que
   um botão cresce ao ficar indisponível.
3. **`strokesIncludedInLayout` só existe em quadro com `layoutMode`.** Escrevê-lo
   num quadro absoluto acabado de criar estoura com *"Can only set
   strokesIncludedInLayout on nodes with layoutMode !== NONE"* e **mata o script a
   meio do laço**, deixando metade dos nós criados. *Um script que cria nós tem de
   poder correr duas vezes* — o daqui apaga `o anel` e `o vao` antes de os criar,
   e foi por isso que a segunda tentativa não duplicou nada.
4. **`cornerRadius` devolve um símbolo quando os cantos diferem**, e
   `JSON.stringify` de um símbolo **estoura com `cannot convert symbol to
   string`** — não devolve `null` e não avisa. Todo leitor de propriedades desta
   casa passa por um `typeof v === "symbol"`.

---

# 10 · A proposta ambiciosa, escrita na pauta

**`(E3) a letra tem um piso, e hoje 652 lugares estão abaixo dele — `TIPOS`, a
irmã de `ALVOS`** · *pesado* · em `mente/pauta-desenho.md`, *Para a pessoa
decidir*.

| tamanho | ocorrências em `src/` |
|---|---|
| `text-[8px]` | 12 |
| `text-[9px]` | **223** |
| `text-[10px]` | **313** |
| `text-[11px]` | 104 |
| **abaixo de 12 px** | **652** |
| `text-xs` (12 px) | 205 |

**Três em cada quatro letras pequenas deste jogo estão abaixo do piso que esta
casa já citou por escrito**, e não há tabela nenhuma: `ALVOS` não tem irmã
tipográfica, logo o tamanho da letra é um literal de Tailwind espalhado por 14
ficheiros — a doença que a primeira lei do `CLAUDE.md` existe para caçar.

> ### O piso do polegar virou tabela em K4. O piso do olho continua a ser um literal, e é o mesmo tipo de número: um que o corpo do jogador impõe e o código não pode inventar.

**A prova, pelos três caminhos:** *medida* — os 652, por varredura; *estudo
citado* — **e a fonte é esta própria casa**: E2 fixou 12 px para a régua no
telefone e escreveu porquê (*"um degrau acima do piso citado — HIG 11 pt,
Material 11 sp"*), somando-se a WCAG 1.4.4; *experiência jogada* — **falta**, e é
o que peço ao `jogo` no ciclo em que isto entrar.

**E ela encontra-se com a proposta de K4 por outra porta:** a fila «quando um
golpe chega» vive a 9 px e, para ir a 12, a mesa precisa de 3 a 4 filas onde hoje
tem 2 — **porque o painel mede 320 px**. *As duas pagam-se melhor juntas.*

---

# 11 · O que este ciclo aprendeu, e vale mais que qualquer das correcções

**Das cinco coisas corrigidas, três eram frases desta folha que o arquivo
desmentia:** o Figma não tinha sombra de dois degraus (tinha, e a peça ao lado
usava-a); o `Botao` tinha uma altura por `Papel`×`Tamanho` (não tinha, faltavam 2
px em oito variantes); `Atacar` era o único `Papel=Chamada` da tela (já não era,
desde W1).

> ### A lei «nenhuma decisão de design sai sem passar pelo Figma» não protege só o código de divergir do desenho. Protege o documento de inventar o desenho.
> Um documento que ninguém confronta com o arquivo **não envelhece: apodrece**, e
> apodrece para dentro, porque cada ciclo que o cita sem o abrir acrescenta-lhe
> uma camada de autoridade. **Três ciclos citaram a limitação do `box-shadow`
> como se fosse um facto.** Nenhum deles abriu o ficheiro onde a resposta estava,
> na página ao lado.

**E a segunda, mais barata de dizer e mais cara de aprender:** *o dado lido de
volta pode estar certo sobre uma coisa que não existe.* As duas sombras estavam
na propriedade `effects` de `Papel=Gesto` e de `Papel=Recuo`, com as variáveis
ligadas, impecáveis — **e não desenhavam nada.** A regra da casa
(*confira pelo dado, nunca pela foto*) protege contra a foto que mente; **não
protege contra o dado verdadeiro sobre um pixel que não chega a existir.** Para
essa classe só há um instrumento, e K4 já o tinha nomeado noutra língua:
**abrir e olhar.**
