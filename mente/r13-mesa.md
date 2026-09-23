# R13 · a moldura devolve a página, e a página ganha um rosto

**Especificação de construção**, escrita para o `oficial` construir no
`App.jsx` sem perguntar nada. Duas etapas, um desenho só.

| quem | o quê |
|---|---|
| `jogo` | o orçamento, o momento de cada peça, a ordem, o que se prova |
| `desenho` | a forma fechada das cinco peças, a cor, os contrastes, o Figma |

- **A forma fechada vive em `mente/formas.md`** (secções R13). Onde esta
  especificação e `formas.md` divergirem, **`formas.md` manda**.
- **O par visual** está no Figma `e5wJUzInAssoebx5npssKc`: a secção
  *R13 · O ORÇAMENTO DO ECRÃ* (`jogo`, cinco telas 1:1 em px reais) e as peças
  com eixos (`desenho`).
- **A prova que abriu a etapa:** `mente/r6-jogo.md` — 20 turnos jogados na tela
  principal, números tirados do DOM ao vivo.

**As duas medições bateram ao pixel.** O `jogo` e o `desenho` mediram a moldura
em separado, sem ver um o número do outro: **180 · 81 · 102**, bloco do herói
**87**, heroísmo **48**, três spans de **15**. *Duas medições independentes no
mesmo número é a melhor prova que este ciclo tem.*

---

## 0 · A régua, para quando houver dúvida durante a construção

1. **Nada que o jogador use para decidir pode desaparecer.** Recolher é mudar
   de morada, nunca apagar. Se uma escolha aqui obrigar a tirar-lhe informação
   de decisão do alcance, **está errada e pára**.
2. **Nunca pode custar o turno.** Nenhuma animação, transição ou recolhimento
   bloqueia o campo, atrasa o `Agir →` ou come um clique.
3. **O orçamento do §1 é lei.** Peça que não cabe encolhe ou não entra — não se
   rouba à página.
4. **Toda fiação nova em `try/catch` (`calou(...)`).**

---

## 1 · O orçamento do ecrã (lei desta etapa)

Medido no DOM ao vivo, mesmo save, 1 oferta viva e 2 prazos aceites.

**TELEFONE 375×812**

| faixa | hoje | A · com oferta | A · sem oferta | A+B · com | A+B · sem |
|---|---|---|---|---|---|
| cabeçalho | 73 | **—** | — | — | — |
| **a cinta** | — | **48** | 48 | **48** | 48 |
| **o rosto da cena** | — | — | — | **96** | 96 |
| **A PÁGINA** | **151** | **503** | **586** | **407** | **490** |
| a soleira | 149 | 83 | **0** | 83 | **0** |
| a barra de estado | 180 | — | — | — | — |
| a fita de prazos | 81 | — | — | — | — |
| o campo + Agir | 102 | 102 | 102 | 102 | 102 |
| as abas (fixas) | 76 | 76 | 76 | 76 | 76 |
| **página em %** | 18,6 % | **61,9 %** | **72,2 %** | **50,1 %** | **60,3 %** |
| **linhas de prosa** | **5,5** | **18,2** | **21,2** | **14,7** | **17,8** |
| **palavras visíveis** | **~38** | ~128 | ~149 | ~103 | ~124 |

**Cada coluna soma 812. É catraca, não conferência:** foi por não somar que as
duas primeiras versões deste orçamento saíram erradas — a do `jogo` e a do
`desenho`, com o mesmo erro e em separado. *Uma tabela de orçamento que não
fecha na altura do ecrã não é um orçamento; é uma lista de desejos.*

**Etapa A sozinha: a página passa de 151 para 503 px — 3,33× — e de ~38 para
~128 palavras visíveis. O telefone passa a mostrar um parágrafo inteiro deste
jogo (60–90 palavras) com folga; hoje é incapaz.**

**E o melhor número dos cinco é o do turno sem oferta: 586 px, 21,2 linhas.**
Em **9 dos 20 turnos** de R6 a soleira só tinha `Esperar`; com `Esperar`
mudado para o relógio, nesses turnos ela é **0 px**. *Quase metade dos turnos
deste jogo passam a ser quase só livro* — que era exactamente o defeito
apontado, visto pelo lado do ganho.

**MESA 1280×800**, com a mesma conta (cada coluna soma 800):

| faixa | hoje | A · com oferta | A · sem | A+B · com |
|---|---|---|---|---|
| cabeçalho | 73 | — | — | — |
| a cinta | — | 48 | 48 | 48 |
| o rosto da cena | — | — | — | 96 |
| **A PÁGINA** | **396** | **588** | **650** | **492** |
| a soleira | 123 | 62 | 0 | 62 |
| estado + prazos | 68 + 38 | — | — | — |
| o campo + Agir | 102 | 102 | 102 | 102 |
| **página em %** | 49,5 % | **73,5 %** | **81,3 %** | **61,5 %** |
| **linhas de prosa** | 14,3 | **21,3** | **23,6** | **17,8** |

*(A mesa que o `jogo` publicou antes — 481 / 385 — tinha o mesmo erro de soma
da coluna do telefone, cometido em separado e não apanhado por ninguém. Fica
esta.)*

**A régua da prosa:** Spectral 17 px, entrelinha **27,6 px**, 63ch na mesa e
**40ch no telefone**. É daqui que saem as linhas e as palavras.

**E a moldura deixa de crescer.** Hoje cada contrato aceite custa ~40 px
permanentes de chip de prazo. Na cinta, o quarto contrato custa **zero**: o
prazo mais urgente ocupa a mesma linha e os outros estão a um toque.
*O jogo deixa de punir com menos jogo quem joga mais* — que era o defeito de
fundo, porque a peça construída para o jogador agir era a mesma que lhe
encolhia a página a cada uso.

---

## 2 · ETAPA A — a moldura devolve a página

### 2.1 · O que sai

| o que sai | âncora medida no DOM (telefone) | px |
|---|---|---|
| o cabeçalho | `div.flex.items-center.justify-between.px-4` — `top 0`, `h 73` | **73** |
| a barra de estado | `div.px-4.md:px-8.flex.items-center.gap-3` — 6 filhos, `top 373` | **180** (mesa 68) |
| a fita de prazos | `div.flex.items-center.gap-3.flex-wrap.px-4` — n chips, `top 552` | **81** (mesa 38) |

**334 px trocados por 48.**

**O cabeçalho sai por lei, não por orçamento.** São 73 px, no telefone, com
`[Início 48] "Taverna" (Cormorant 28) [⛺ 48] [🎲 48] [📜 48]` — e o que ali
está escrito é **o nome do produto a quem já está dentro dele**.
*O sistema não fala de si mesmo.* Os controlos são reais e sobrevivem (§2.3); a
faixa não.

Os seis filhos da barra de estado, para o `oficial` saber o que mexe:
`343×87` o botão da ficha (`NIV`+`PV`+`PM`) · `53×48` heroísmo · `159×15`
data+hora+estação · `46×15` clima · `128×15` lugar · `98×15` XP.

**E sai uma cópia, não uma função:** o bloco do herói é hoje
`onClick={() => setAba("gestao")}` **e** existe a aba `GESTÃO`. *Abrir a ficha
tem duas caras na mesma tela* — a lei-mãe desta mesa quebrada no sítio onde se
passam os 90 %. A cinta é a cara que fica; a aba mantém-se como aba.

### 2.2 · O que entra: **`A cinta`**, 48 px, fixa no topo

```
┌──────────────────────────────────────────────────────────┐
│ [rosto 32] ♥▓▓▓▓▓▓░ 18  ◈ 6   ◉ 342  │  06:13 · 3 noites │ 48
└──────────────────────────────────────────────────────────┘
  └────────── A FICHA (um alvo) ──────────┘ └── O TEMPO ───┘
        as cores do HERÓI (amber/violet)      a cor do MUNDO
```

**Dois alvos, não seis.** À esquerda é você; à direita é o mundo, e a cor diz
qual é qual sem ler. Forma, cor e contrastes: `formas.md`, R13, peça `A cinta`.

**A carga, e a régua que a decide:**

> **Fica sempre visível o que o jogador usa para decidir *enquanto* está a
> decidir. O que só importa quando muda, chega quando muda, e depois recolhe.**

Sai do censo dos 20 turnos de R6, item a item:

| item | olhei para decidir? | destino |
|---|---|---|
| `PV` | **sim, 1×** (T6 → decidiu o acampamento de T12) | **fica** |
| estado vivo (`Exausto`) | **sim, 1×, e foi ele que decidiu o turno** | **fica, e nunca recolhe** |
| relógio (dia+hora) | **sim, 2×** (T12, T19) | **fica** |
| prazo | **sim, 1×** (T13, antes de aceitar o 2.º contrato) | **fica, no relógio** |
| a bolsa | **não existia na tela** | **ENTRA** |
| lugar | 0× — a prosa diz sempre onde se está | **sai para o rosto (etapa B)** |
| `NIV` · `XP` · heroísmo | **0×** | recolhem para a ficha |
| `PM` | 0× (guerreira, nunca gastei mana) | recolhe — **volta sozinho** se a classe tiver mana ou ao primeiro ponto gasto |
| clima · estação | 0× — a prosa disse "chuva" e "sol" melhor que o ícone | recolhem para o toque no relógio |

**A bolsa é obrigatória:** a soleira ofereceu `◉205` e `◉115`, o mercado mostrou
30 preços entre `◉20` e `◉298`, e a tela **nunca** disse quanto o jogador tinha.
*Uma oferta com preço e sem saldo é meio veredito.*

**A cor paga R11.** Relógio, data, estação, lugar e a espera são exactamente os
**cinco significados** que `T.mundo` foi criado para tirar ao âmbar em R2 — e
que R11 contou e achou ainda âmbar, com `T.onMundo` a **zero leitores**. Na
metade direita da cinta os cinco passam a viver num sítio só, numa cor só.

### 2.3 · O momento da cinta

1. **Calma é o estado por omissão** — 48 px, nada pulsa, nada chama.
2. **Um estado vivo faz a cinta crescer para 72 px**, e é de propósito: *o que
   não cabe numa linha calma é exactamente o que tem de interromper.* Os 24 px
   saem da página e voltam quando o estado passa. Custo medido: em 20 turnos
   houve **um** estado vivo, durante **um** turno.
3. **O prazo a apertar não faz a cinta crescer** — muda o selo (§2.5).
4. **Nada na cinta anima por turno.** A barra de PV move-se quando o PV muda; o
   relógio troca de número quando o relógio troca. Mais nada. *Uma moldura que
   se mexe a cada turno é um pisca-pisca no canto do olho durante a leitura.*
5. **`✓ SALVO` sobrevive, e é meu para o salvar.** Ele vivia no cabeçalho que
   morre, e num jogo cujo save mora só no `localStorage` **é a única coisa que
   diz ao jogador que a vida dele está segura**. Passa a ser **transitório na
   cinta**: aparece ao gravar, some sozinho, **0 px de custo permanente** e
   nenhum deslocamento de leiaute (ocupa o lugar do relógio por instantes, ou
   flutua sobre ele — é forma, e é do `desenho`).

### 2.4 · Os três controlos do cabeçalho: onde vão parar

O cabeçalho morre com quatro botões dentro. **Nenhum se perde**, e a morada de
cada um sai do que eu usei em 20 turnos.

| botão | usos em 20 turnos | vai para | porquê |
|---|---|---|---|
| `⛺ Montar acampamento` | **1, e foi decisivo** | **o toque no relógio**, ao lado de `Esperar` | acampar *é* passar o tempo — o tempo mora onde o tempo se lê |
| `🎲 Rolagens: visíveis` | 0 | **os ajustes, dentro da ficha** | é uma **preferência de exibição**, não gameplay: *o sistema não fala de si mesmo* |
| `📜 Gerar crônica` | 0 | **a aba `Diário`** | a crónica mora no Diário; tê-la também no topo é uma ação com duas caras |
| `Início` | 1 tentativa, **e não fez nada** | **o pé da ficha** | é sessão, não cena. **E é defeito: clicá-lo na tela principal não navega** — o `oficial` conserta ou remove, não deixa o botão morto |

**O acampamento passa de 1 toque para 2, e eu defendo a troca com número:**
custa +1 clique **uma vez em 20 turnos**, e compra **73 px de página em todos
os 20**. E há a metade que a torna estritamente melhor — §2.6.

### 2.5 · `O selo de prazo` — conta ao contrário

`3 noites` → `2 noites` → **`esta noite`**. **Nunca `1/4`.** O `⚠` e o nome do
contrato saem da linha: o nome era o que a ocupava e é a parte que o jogador já
sabe; aparece no toque, com os outros prazos.

**O momento:** o selo **enche** na última noite — passa de texto sobre a cinta
a chip cheio. **A distinção é de FORMA, não de cor**, e a razão é medida pelo
`desenho`: um selo de três cores dava 1,26:1 em visão normal entre "calmo" e "a
apertar" — **pior do que o defeito que R9 acusou** (1,37). O chip cheio muda a
luminância da área em **6,37:1**, que sobrevive aos três daltonismos e ao
cinzento. *As outras duas diferenças não precisam de distinção de relance: são
um número que se lê.*

**Condição de sistema, e sem ela a peça mente:** o selo só pode dizer "3
noites" se o motor souber quantas restam **em tempo de calendário**. Medido em
R6: **passaram-se seis dias e o chip continuou `1/4`**, porque só conta noites
dormidas — o jogador vê o relógio saltar uma semana e o prazo parado, e conclui,
com razão, que o prazo não é a sério. *Uma peça que conta ao contrário mente
pior do que uma que conta a direito.* Vai a `mente/pedidos-ao-sistema.md`
(escrito pelo `desenho`) **como condição desta peça**.

### 2.6 · `O relógio` é o alvo do tempo

O toque abre **O TEMPO**, e lá dentro está tudo o que é tempo, numa ordem que é
minha:

1. **`Montar acampamento`** — primeiro, porque é o único que muda o estado do
   herói;
2. **`Esperar`** — `1h · 2h · 4h · 6h · 8h · 12h · 24h`, exactamente o menu de
   hoje, sem alteração de conteúdo;
3. **o calendário, a estação e o clima** — que recolheram da barra;
4. **todos os prazos**, com nome, por ordem de aperto.

**Isto paga uma trava já escrita.** `formas.md` §R1b tinha julgado que
*"`Esperar` nunca devia ter entrado na soleira"* e deixado: *"ou o `+N` vira
porta antes, ou o controlo de passar o tempo guarda o lugar que tinha"*.
**A saída não é escondê-lo atrás do `+N` — é dar-lhe casa.** O controlo de
passar o tempo não perdeu morada: **ganhou-a**.

**E a metade que torna o acampamento melhor do que era:** quando existe um
estado que o descanso cura — `Exausto`, PV baixo — **`Montar acampamento` sobe
à soleira como oferta**, com o que custa escrito (§5.2). Medido: em T12 o
`😵 Exausto` apareceu na barra e **a cura não foi oferecida em lado nenhum**;
eu tive de me lembrar do emoji no canto. Com isto, o turno em que eu realmente
acampei passa a **um** toque, não dois.

### 2.7 · `A soleira`

**(a) Sem oferta, ocupa 0 px** — sem margem, sem borda. Já estava escrito assim
desde R1 (*"vazia não deixa buraco: região que reserva espaço para nada é
mobília a mentir"*); o que existe hoje não é a peça a reservar espaço, é o
`Esperar` a ser uma oferta que nunca devia ter sido. **Medido: em 9 dos 20
turnos a soleira não tinha mais nada — 149 px de moldura, em quase metade dos
turnos, para não oferecer nada.**

**(b) Oferta que não pode mudar nada não é oferta.** Medido em R6: a soleira
mostrou `Convidar Vero do Braseiro` com o subtítulo *"mais 5 dias de estrada
juntos antes de decidir"* — **o botão diz que vai recusar**. Clicá-lo escreveu
a frase, gastou uma chamada ao Narrador, o sistema respondeu **exactamente o
que o botão já dizia**, e o botão ficou lá, igual, pronto para o mesmo.

> **Regra:** oferta cuja pré-condição o sistema já sabe que falha **não entra na
> soleira**. Vira **estado** — a informação fica (é o veredito antes do clique a
> funcionar), o **toque sai**.

**(c) Na mesa, as ofertas ficam lado a lado** (62 px em vez de 123): o contentor
tem 1 144 px de largura e chega e sobra para duas. No telefone empilham com o
`+N`, que é **porta de 48 px e diz o número**, como R1b fixou.

**(d) O teto não muda:** 2 na mesa, 1 no telefone.

**(e) O salto de leiaute é ZERO, e é isto que responde à objecção que eu abri
contra mim:** a soleira vive no convés, colada ao campo. **Quando nasce, empurra
o campo para baixo e a prosa não se move um pixel** — o que o jogador está a ler
fica onde está. É a mesma lei que `formas.md` já fixou no tabuleiro.
*Divergência fechada a favor do `desenho`, com a razão dele.*

### 2.8 · O que NÃO muda (para não se inventar)

- O campo do turno e o `Agir →` ficam **exactamente** como estão — 65 px,
  `Enter` manda, `Shift+Enter` quebra. **Trocar isto em silêncio é o defeito que
  passa no build e só o uso pega.**
- As cinco abas ficam onde estão e com o nome que têm. *A Fase R já tirou ao
  jogador as quatro abas do momento e os 20 verbos no mesmo dia.*
- As portas `▸` ficam como estão — são botões de 48–50 px e funcionam.
- O véu do dado e o mercado não se tocam.

---

## 3 · ETAPA B — o rosto da cena

**Não se constrói antes da etapa A.** Hoje a página tem 151 px no telefone;
tirar-lhe 96 deixa **55 px = 2 linhas**, e aí a xilogravura não é um livro
ilustrado, é uma legenda. **A ordem é aritmética, não preferência.**

**Geometria:** faixa de **96 px** no topo do papel, dentro da página, fixa (não
rola com a prosa).

**O motor já existe:** `hashSemente` + `rng` + `escolher` de `src/semente.js`,
as três funções puras que o `rosto.jsx` já usa. Semente:
`hashSemente(semente_do_mundo + "|" + bioma + "|" + lugar)`.

**A gravura é composta, e é isso que a torna possível em um ciclo:** são **30
biomas** (`moldes.js`, quatro moldes × 7–8), e nenhuma biblioteca de 30 gravuras
é honesta. Três bandas (céu · horizonte · chão), sete gramáticas de silhueta e
cinco hachuras cobrem os 30; a semente decide a variação. Bioma desconhecido
não dá buraco: dá horizonte liso com hachura, que é uma gravura legítima.

### O momento, que é meu

1. **Aparece sempre.** É o topo do papel, não um acontecimento.
2. **Muda só quando o lugar muda.** Não por turno, não por hora: a **luz**
   desliza com a hora (quatro luzes), a **gravura** não.
3. **A gravura NÃO anima na chegada** — concordo com o `desenho`, e a razão é
   de jogo: uma imagem que transiciona a cada cena é **um piscar por turno**, e
   *nunca pode custar o turno*.
4. **Mas a chegada tem de se notar, e não inventa peça para isso:** o **nome do
   lugar** chega com o eixo **`Chegada`** que `A oferta` já tem — *decai por
   turno, nunca por tempo*, que é a lei que o `desenho` ganhou em R1 (*uma marca
   que morre por tempo morre enquanto o jogador está a pensar*). **Uma ação, uma
   forma:** a marca de "isto é novo" já existe nesta casa e serve aqui.
5. **O lugar sai da cinta** quando esta etapa entra — é a etapa B a pagar parte
   dos seus próprios 96 px.

**O que devolve em prosa, contado:** das 21 mensagens de prosa de R6, **10 abrem
com descrição de lugar, hora ou clima**, média de **14,3 palavras** — **37 % das
38 palavras que o telefone mostra hoje**. E as 10 são quase todas **chegadas a
um lugar novo**: o rosto devolve a frase de abertura exactamente nos turnos em
que o jogador está mais perdido. *(Número corrigido contra mim: tinha estimado
11 de 20 e ~25 palavras; fui contar e é menos. Fica o menor, que é o
verdadeiro.)*

---

## 4 · Os dois defeitos de composição que esta etapa também paga

Ficam aqui e não numa pauta futura por uma razão de jogo: **a etapa A põe o
relógio e o prazo no centro da tela, e um relógio em destaque sobre ações que
não dizem o que custam é uma promessa que a tela não cumpre.**

### 4.1 · Toda ação da tela principal diz o que custa em tempo, antes

**Medido:** em 20 turnos, **uma única ação disse o seu custo em tempo antes de
ser tomada** — o `▸ ir` do mapa (*"50 min a pé"*). Duas frases minhas custaram
**seis dias de calendário cada** (`1 → 7 de Brumal`; `8 → 14 de Brumal`), com um
prazo de **4 noites** na tela.

**Constrói-se:** cada oferta da soleira, cada saída do acampamento e cada viagem
trazem a **duração estimada** antes do toque, com a gramática do `▸ ir`. *O
campo de texto fica de fora desta etapa* — é a proposta ambiciosa de
`r6-jogo.md` §7 e é da pessoa.

### 4.2 · O acampamento escreve o que cobra

**Medido:** `🌙 Descanso longo` diz *"tudo, uma vez por dia"*. O que aconteceu:
`⚠ Prazo: Tirar Alba de lá ●○○○ (1/4) — mais uma noite passou` ·
`🥖 Comida acabou` · `💧 Água acabou`. **Três preços irreversíveis, nenhum na
cara do botão.**

**Constrói-se:** as três saídas (`curto`, `longo`, `sair sem descansar`)
escrevem cada uma **o que cobram**, a noite de prazo incluída.

---

## 5 · O que se prova

1. **O orçamento, medido de volta**, no telefone (375×812) e na mesa
   (1280×800), faixa a faixa contra a tabela do §1. **Se a página não chegar aos
   503 px no telefone com uma oferta viva, e aos 586 sem oferta, a etapa A não
   fechou** — e diz-se, não se arredonda. **A soma de cada coluna tem de dar
   812 (telefone) e 800 (mesa):** é a catraca que faltou às duas primeiras
   versões deste orçamento.
2. **O gesto do campo não mudou:** `Enter` manda, `Shift+Enter` quebra.
3. **O piso de 48** em todo controlo novo: os dois alvos da cinta, o selo, o
   `+N`, e cada item do TEMPO.
4. **Uma ação, uma forma:** `passarTempo` e `acampar` têm **um** ponto de
   entrada cada na tela principal. Se aparecer um segundo, é defeito. Idem
   "abrir a ficha", que hoje tem dois.
5. **Nenhum botão morto:** o `Início` que não navega sai ou passa a navegar.
6. **`prefers-reduced-motion`** no crescimento da cinta e na luz do rosto, com
   corte seco.
7. **O teto de prompt não cresceu.** Nada disto soma bloco estático ao prompt.
8. **A prova jogada, outra vez.** Eu volto a jogar 20 turnos e meço: a página em
   px, as palavras visíveis, e **quantos turnos usaram o campo de texto** — que
   em R6 foram **15 de 20**, e é esse o número que não pode cair. *Uma tela que
   devolve a página e mata a prosa teria trocado um defeito por outro.*

---

## 6 · Se não couber

**A ordem de sacrifício, decidida agora para não se decidir no cansaço:**

1. Primeiro cai **a etapa B** (o rosto). É o prémio, não a condição.
2. Depois cai **§4.1** (o custo em tempo em todos os controlos), ficando o
   `▸ ir`, que já o faz, e o acampamento do §4.2.
3. **Nunca cai a cinta.** Sem ela a etapa A não existe: os 334 px de cabeçalho
   + estado + prazos são o réu, e trocá-los por uma versão mais pequena da mesma
   coisa seria ter feito nada.

**E a correcção da aritmética muda o estatuto da etapa B, o que eu tenho de
dizer contra a minha própria ordem de sacrifício.** Com a página a ir a
**586 px num turno sem oferta — 72 % do telefone —**, a tela passa a ser
*um muro de texto com uma cinta em cima*. A pessoa não pediu um leitor: pediu
que *"a gameplay seja interativa e interessante pra prender o jogador, e o
design e visual sejam estimulantes e chamativos como um bom jogo"*. **Os 96 px
do rosto deixam de ser um prémio e passam a ser o que impede a etapa A de
acertar no número e errar no pedido** — e agora custam **16 % da página em vez
de 64 %**. *B continua depois de A, e deixou de ser opcional.*

**E o espaço libertado NÃO vai para mais botões.** Com 586 px de página, uma
oferta custa 14 % em vez de 55 %, e seria tentador subir o teto do telefone de
1 para 2. **Não sobe.** O que defende esta fase é a medida de R6 — **15 dos 20
turnos no campo de texto** —, e encher a soleira porque agora cabe é o caminho
mais curto para o *point-and-click* que essa medida existe para apanhar.
4. **Nunca cai a bolsa.** É uma linha de informação e fecha um defeito inteiro.
5. **Nunca cai o `✓ SALVO`.** É a única coisa que diz ao jogador que a vida dele
   está segura, e o save deste jogo mora só no navegador dele.

> **A régua de desempate é a da pessoa:** *o melhor RPG de mesa do mundo.*
> Devolver 286 px e voltar a enchê-los de moldura é ter cumprido a letra e
> falhado o pedido.
