# V5 · a página — o momento (`jogo`, 25/09, noite)

## PARA O `desenho`, JÁ — o que tens de saber antes de fabricar

1. **O cartão é o `126:54` da pessoa, em três andares, e só o do meio rola.**
   Cabeçalho `129:4` (V5a, **no ar**, fixo) · corpo `129:15` (a prosa, **rola**) ·
   **pé = a soleira** (fixo, **só com oferta**; 0 px sem ela). O `parchment-footer`
   decorativo (`129:32`) já mora no fim do registo desde V5a (`FimDaPagina`, 0 px) e
   **não volta ao pé**: o pé do cartão passa a ser o sítio onde a cena oferece.
2. **A soleira entra no cartão, mas NÃO entra no que rola.** A razão de R15 continua
   de pé (`App.jsx` ~:23768: a oferta do Yorick viveu quatro turnos; a mensagem que a
   criou estava três ecrãs acima). O que muda é a moldura: sai a caixa própria entre o
   cartão e o compositor, e a soleira passa a ser **o pé do cartão, dentro da borda
   dele, separado da prosa por um fio de 1 px e NÃO por uma runa** — a runa do fim do
   registo (`FimDaPagina`, V5a) já está logo acima quando se lê o fim, e duas runas a
   30 px uma da outra são enfeite a gaguejar. Todas as peças de V3c ficam (`Oferta`,
   `Soleira`, o `+N`, o selo da janela, `chegada`, `impedida`, alvo ≥ 48). **O pé não
   pode custar mais px do que a caixa de hoje** (§4: 94 px a 375 com uma oferta, 62
   por oferta na mesa).
3. **A coluna de 65ch fica** (`.tv-coluna`, já aplicada): é o único desvio grande da
   composição da pessoa (a v3 corre a prosa a 1 086 px, ~137 car./linha; WCAG 1.4.8
   pede ≤ 80). O `padding 28` e o `gap 16` entre parágrafos da v3 entram como estão.
4. **A runa ornamental do meio da prosa (`129:20`) tem um sentido só: começa uma
   resposta do Mestre.** Uma por resposta, no sítio onde hoje está o cabeçalho
   `O MESTRE` (a `Voz`), e nunca dentro de uma resposta. A palavra `O MESTRE` sai (a
   página é dele; quem fala diferente é o jogador, e esse já tem forma própria, R3).
   **O botão de ouvir NÃO sai**: fica na ponta direita da runa, com o alvo de 48 que
   R2 lhe deu. A `Voz` com palavra fica só para a espera (`a preparar…`). §1.3.
5. **A abertura grande: a 1.ª FRASE da resposta (não o 1.º parágrafo) em
   `TIPOS.display` 28, semibold, entrelinha 1,35 — só em dois turnos**: a **chegada** a
   um lugar novo e a **primeira resposta da sessão**. Nos outros, prosa normal. Medido
   (§4): o 1.º parágrafo do Mestre tem 336–481 car. (o da v3, 170); em 28 custaria
   **+367 a +520 px a 375** — meia página. A 1.ª frase custa **+10 a +58 px**. Teto:
   frase com **mais de 110 car.** cai para `titulo` 20 (tabela, não medida de leiaute).
   É **uma peça com um eixo** (`Abertura = Nenhuma | Cerimónia`), e a cerimónia **é
   efémera, decai por turno** (como a `chegada` da soleira): no turno seguinte a frase
   volta a prosa. **Zero campo novo no save.**
6. **V5b (a cartela de chegada) não é outra peça: É esta** (§3). Na chegada a abertura
   JÁ é a cerimónia. O nome do lugar grande por cima repetiria o cabeçalho de V5a a
   80 px de distância — o mesmo defeito que me fez condenar o título do painel da sala.
   **V5b fecha dentro de V5**, sem nome repetido.
7. **O painel da sala, na masmorra, deixa de dizer o lugar e passa a dizer a SALA**
   (§5). Esquerda: `[glifo da sala] TESOURO · POR RESOLVER`; direita: `chave` (se há)
   e `3/7`. A linha `Você está em: …` morre (é o que o título passa a dizer, −1 linha).
   As tochas saem do painel: estão no cabeçalho da página desde V5a, a 69 px dali.
8. **Zero movimento novo obrigatório.** A abertura não anima; a runa não anima.
9. **O `O MESTRE` do topo da área que rola** (a `Voz` com o ponto vivo, sempre lá,
   `muda` fora da espera) **só existe durante a espera**, e desce para onde a resposta
   vai nascer. Hoje a espera está dita duas vezes (`a preparar…` no topo, fora de
   vista quando se está no fim, e `O Mestre tece o destino…` em baixo): fica a de
   baixo, na forma da `Voz`. Custa hoje ~48 px no topo de toda cena.

---

## 1 · A página contra a v3 da pessoa (`126:5`) — o que entra, e cada desvio

**O que entra como está:** o cartão com borda e cantos (`126:54`), o cabeçalho
(`129:4`, V5a), o corpo sem balões com `gap 16` entre parágrafos e `24` entre blocos,
a runa `129:20` como divisória da prosa, a tinta `ink` da prosa, e o pé do cartão como
lugar (que V5a esvaziou do enfeite).

**Os desvios — cada um pode ser recusado sozinho, e cada um diz o que custa recusá-lo:**

| # | a v3 | V5 | porquê | se a pessoa recusar |
|---|---|---|---|---|
| D1 | prosa de parede a parede, 1 086 px (~137 car./linha) | **coluna de 65ch ao centro** (já no ar: 536 px, média **65–67**, máx. **73–75** car./linha a 1280) | WCAG 1.4.8 (≤ 80 car.); a margem é luz, não vazio | a prosa volta a ~137 car./linha: a linha longa perde o olho no regresso à esquerda |
| D2 | o 1.º parágrafo inteiro em 28, sempre | **a 1.ª frase**, em 28, **só na chegada e na 1.ª resposta da sessão** | o parágrafo do Mestre tem 2–3× o da v3; em 28 custaria meia página no telefone (§4) | cada resposta perde +367 a +520 px a 375 |
| D3 | uma runa entre dois blocos de prosa | **uma runa por resposta**, no lugar do rótulo `O MESTRE`, com o ouvir na ponta | a v3 é um só turno; o jogo tem muitos, e a runa passa a dizer *começa outra vez* | fica o rótulo `O MESTRE` de hoje (~32 px por resposta, +24 contra a runa) |
| D4 | o pé decorativo (`129:32`, 76 px) | **o pé é a soleira** (0 px sem oferta); o enfeite já está no fim do registo (V5a) | 76 px em todos os turnos para nada contra 0 px sem oferta | volta 76 px de enfeite fixo, ou a soleira fica fora do cartão como hoje |
| D5 | a v3 não tem a fala do jogador | **fica** (R3: itálico, recuada, `inkMeio`, filete) | um livro de jogo regista o que o jogador disse; sem ela, a resposta do Mestre responde a nada | a página perde a pergunta a que cada resposta responde |
| D6 | a v3 não tem linhas do sistema | **ficam** (os ladrilhos de V3b, os blocos) | são o que mudou no mundo (o mural, o diário) — jogo, não bastidor | o jogador deixa de ver *"Olga tem um trabalho no mural"* sem abrir nada |
| D7 | `padding 28` | **28 na mesa, 20 no telefone** (como hoje) | a 375 a coluna já tem 295 px e **35 car./linha** de média — abaixo dos 45 que a tipografia de livro pede (Bringhurst, 45–75); mais 16 px de margem tiram-lhe ~2 car. | o telefone fica com ~33 car./linha |
| D8 | Cormorant 20 / 28 | **Spectral 17 / 28 de hoje** | a letra é V2, medida à parte | — (não é desvio de V5: é V5 a não decidir por V2) |
| D9 | o véu de cor por cima do corpo (`129:31`, âmbar→ciano→rosa, 6–9 %) | **fica para V5c** (a luz da hora no fundo do cartão) | é o mesmo véu, e em V5c ele passa a dizer a hora — decidir-lhe a cor aqui e outra vez lá é fazê-lo duas vezes | — |

### 1.3 · Porque a runa substitui o `O MESTRE`

Medido a 375, rolado ao topo de uma cena: antes da primeira palavra do Mestre há **dois**
`O MESTRE` (o da espera, sempre lá, e o da resposta) — ~80 px de cabeçalhos (dois de
~32, mais os intervalos) para dizer duas vezes quem fala, numa página que só tem um narrador. A v3 não escreve `O MESTRE` em
lado nenhum: a página é dele. O que tem de ficar é **o que se faz** — ouvir a resposta —,
e isso é um botão, não um rótulo.

## 2 · A soleira no pé do cartão — o que muda para quem decide

**A ordem de leitura passa a ser a da pessoa:** a última frase do Mestre → a runa do
fim do registo → **a oferta, dentro da mesma moldura** → o campo. Hoje a oferta é uma
caixa ciano **fora** do cartão (a 1280, duas caixas de 62 px cada; a 375, 94 px com
uma e 150 com o `mais 1 oferta`), e lê-se como um cartaz pregado por baixo da página.
Dentro do pé, lê-se como **o que a cena põe na mesa**.

- **Não entra no que rola** (a razão de R15, que é jogada e continua certa).
- **1280:** as ofertas lado a lado **se couberem** (a mesa tem ~1 080 px de pé e cada
  oferta ~560), senão empilhadas, até ao teto de 2 (`SOLEIRA`). **375:** uma e o `+N`,
  como hoje.
- **Nada de V3c se perde:** a forma da `Oferta` (verbo, quem, onde, o selo da janela,
  o retorno), o `+N`, `chegada` / `assentada`, `impedida` com o Mestre fora, o alvo ≥ 48.
- **Px:** o pé paga-se com o que a caixa de hoje custava — a borda ciano e as margens
  próprias saem, o fio de 1 px entra. **Critério: o topo do campo não sobe nem desce
  mais de 2 px** (735 a 375, 706 a 1280) e a área que rola não encolhe.

## 3 · A abertura — em que turnos, quanto custa, e V5b

**Em que turnos.** (a) **A chegada**: o turno em que `lugarDaCena()` mudou (o
`lugarAntesRef` já o sabe, inerte desde R13-B). (b) **A primeira resposta da sessão**:
a primeira que o Mestre escreve depois de abrir o jogo (`sessaoRef.turnos`). Em R6, 10
das 21 respostas abriam com o lugar, e eram quase todas chegadas: é aí que a frase de
abertura é o lugar a ser dito.

**Efémera, e é o que a deixa sem custo de save.** A cerimónia é da resposta **deste**
turno; ao começar o seguinte, a frase volta a prosa (decai por turno, nunca por
relógio). Quem rola para trás lê o livro normal. **Nenhum campo novo nas mensagens.**
A resposta está no fim e a vista presa ao fundo: a frase encolher lá em cima não
empurra nada que se esteja a ler.

**Quanto custa**, medido no DOM (a 1.ª frase da última resposta, na coluna real):

| cena | frase | 375: 17 → 28 | 1280: 17 → 28 |
|---|---|---|---|
| dia | 48 car. | 55 → 113 (**+58**) | 28 → 76 (**+48**) |
| noite | 35 car. | 28 → 76 (**+48**) | 28 → 38 (**+10**) |

Uma frase de 110 car. a 375 chega a ~5 linhas (~190 px, +110): é o teto, e acima dele a
cerimónia cai para `titulo` 20. **Em linhas de prosa:** −2 a −4 a 375, −0 a −2 a 1280,
**só em ≤ 2 turnos por sessão**.

**V5b é esta peça.** A cartela de V5a era *o nome grande quando se chega*. Com o
cabeçalho de V5a o nome já está escrito a 80 px, em âmbar, fixo; repeti-lo grande é o
mesmo facto duas vezes no mesmo ecrã, que é exactamente o que condeno no painel da sala
(§5). A cerimónia da chegada passa a ser **a frase do Mestre** — que é o que o jogador
vai ler de qualquer forma, e que em metade das chegadas já diz o lugar. **Fecho V5b
dentro de V5**; a ambição dele (a chegada ser um acontecimento) fica, e fica mais barata.

## 4 · O antes, medido agora (HEAD `1bb8f4d`)

**Montagem.** A 5173 serve a árvore, e em `src/` a árvore é o HEAD (conferido com
`git status` antes e depois). Chrome headless, perfil temporário, `/api` cortado (0
pedidos saíram), save injectado com o jogo desmontado: os saves de V1 (dia 08:00 com 1
oferta; noite 22:00 com 2) e a masmorra de V5a. Script `scratchpad/v5-jogo/medir.mjs`,
números em `antes.json` e `frase.json`, 12 fotos em `fotos-antes/`.

| | 375 × 812 | 1280 × 800 |
|---|---|---|
| **a coluna** | 295 px · **35–36 car./linha** (máx. 42) | 536 px · **65–67** (máx. 73–75) |
| **linhas de prosa à vista**, como abre (dia · noite · masmorra) | 7 · 8 · 0 | 8 · 8 · 0 |
| **linhas de prosa à vista**, rolado ao topo | 11 · 9 · 9 | 11 · 8 · 8 |
| **cabeçalhos `O MESTRE`** (noite, 4 respostas) | 5 (o da espera + 1 por resposta), ~32 px cada | 5 |
| **a página** (cabeçalho 69 + área) | 60 → 633 (1 oferta) · 577 (2) | 64 → 635 · 573 |
| **a soleira**, fora do cartão | **94 px** com 1 oferta (633–726), **150** com `mais 1 oferta` | **62 px por oferta**, empilhadas: 62 · 124 |
| **o topo do campo** | 735 | 706 |

(O 0 da masmorra "como abre" é o painel da sala no fim do registo, e é a decisão da
vez — V5 não lhe mexe, só ao título, §5.)

## 5 · O painel da sala, na masmorra — o que diz em vez do lugar

Hoje (`App.jsx` ~:23449): `[glifo] ANDAR 1 — DO SILÊNCIO` · `3 tochas` · `chave` ·
`2/7`, e por baixo `Você está em: Tesouro (ainda não resolvida)`. Com V5a, **o lugar e as
tochas já estão no cabeçalho**, 69 px acima.

**Decisão:** o título do painel passa a ser **a sala**, que é o que ele sabe e o
cabeçalho não: `[glifo do tipo] TESOURO · POR RESOLVER` à esquerda; à direita `chave`
(se há) e `2/7`. **A linha `Você está em:` morre** (é o título). **As tochas saem do
painel.** Com 0 tochas o título troca por `ÀS ESCURAS`, a `danger`, e a linha
`Sem tochas — vocês avançam às cegas, em desvantagem.` **fica**: é a regra a dizer o
preço, e esse é o veredito antes do clique. Ganho: **−1 linha (~18 px)** no painel e um
facto dito uma vez.

## 6 · O protocolo da prova do depois

O mesmo `medir.mjs` com `ROTULO=depois`, as mesmas três cenas a 375 e 1280, e mais uma
**chegada** e uma **abertura de sessão** (provocadas sem Mestre: a chegada por injecção
com `lugarAntesRef` diferente não se consegue de fora — por isso **harness**, como em V4,
com a peça da abertura e o eixo a mudar). **Qualquer um que caia e V5 não sobe:**

| # | critério | como |
|---|---|---|
| 1 | **lado a lado com o `126:5`** | captura a 1280 × 912 (o tamanho do quadro), recortada à página, ao lado do PNG do Figma; tabela de caixas: borda do cartão, cabeçalho 69, `padding` do corpo, `gap` entre parágrafos (16) e blocos (24), a runa, o pé. **Cada diferença ou é um desvio da tabela do §1 (D1–D9), ou é defeito.** E a abertura: uma frase em 28 semibold na chegada, lado a lado com o `129:17` |
| 2 | **a coluna** | 1280: média ≤ 70 e máx. ≤ 80 car./linha; 375: não desce dos 35 de hoje |
| 3 | **linhas de prosa** | fora dos turnos de cerimónia: **≥ as de hoje** em cada cena (como abre e no topo); rolado ao topo, **+1 no mínimo** (saem o `O MESTRE` da espera e os rótulos por resposta) |
| 4 | **a soleira** | dentro da borda do cartão, fora do que rola; o topo do campo a ±2 px de 735 / 706; área que rola ≥ a de hoje; 0 px sem oferta; o `+N`, a janela, o retorno e `impedida` presentes; alvos ≥ 48 |
| 5 | **a abertura** | só nos dois turnos; decai no seguinte; teto de 110 car.; `reduce` e sem ele: **0 animações**; nenhum campo novo no save (`JSON.stringify` do save antes e depois de um turno com cerimónia tem as mesmas chaves) |
| 6 | **o painel da sala** | o lugar dito **1 vez** na tela da masmorra (hoje 2); as tochas 1 vez (hoje 2); o preço do escuro presente com 0 tochas |
| 7 | **o ouvir** | presente em cada resposta, alvo 48, a 1 toque |
| 8 | **os cinco segundos** | as cinco respostas à primeira, nas seis telas |
| 9 | **a casa** | build limpo, `npm test` verde, a tela de combate intocada (a mesma captura de V4, diferença 0) |
| 10 | **joguei** | as duas cenas e uma chegada no harness, e escrevo se a página é um livro que se lê ou uma conversa que se rola |

## 7 · A proposta ambiciosa — **a página vira à chegada**

Com a abertura a dizer *chegaste* e o registo cada vez mais comprido, o livro de um
dia inteiro de jogo é um rolo sem capítulos. **Proposta:** a chegada **fecha o capítulo
anterior** — tudo o que está acima da runa da chegada recolhe numa linha
`▸ Torre da Fonte · 14 respostas` (um toque abre-o), e a página começa, com a
cerimónia, no lugar novo. O jogador sente que **mudou de sítio** porque a página mudou,
e o registo deixa de ser uma parede: é um livro com capítulos com o nome dos lugares.

**Porque faria o jogo ser lembrado:** é o gesto do livro-jogo (virar a página) no único
momento em que ele é verdade. **O que arrisca:** perder o contexto recente (a conversa que
levou à viagem); por isso só recolhe **à chegada**, nunca por quantidade, e a última
resposta antes da partida fica aberta. **O que precisa:** nada do motor — a chegada já se
sabe, e recolher é forma (a peça é do `desenho`). **Peso: médio de design** (muda a
composição do registo, não o fluxo; um commit revertido desfá-lo). Proponho-a como
**V5d**, depois de V5 estar provado, porque sem a abertura ela não tem onde começar.

---

## 8 · A prova jogada de V5 — o resultado (`jogo`, 25/09, noite)

**Montagem.** *Depois* = a árvore do `oficial` na 5173 (não commitada). O mesmo
`medir.mjs` (`ROTULO=depois`), as mesmas três cenas a 375 e a 1280, Chrome headless,
`/api` cortado (0 pedidos saíram). **A cerimónia foi provada num harness** com as peças
reais (`Prosa`, `DivisoriaRunica` com o `BotaoDeOuvir`, `FimDaPagina`, a `FOLHA`), os
textos verdadeiros do Mestre dos saves de V1, a altura e a largura da página medidas no
jogo vivo, e **a fiação de rolagem do App** (a vista corre ao fim quando chega resposta, e
a cerimónia acende num efeito do mesmo commit). Custo: **0 chamadas, 0 cêntimos**.
Ficheiros em `scratchpad/v5-jogo/`: `depois.json`, `sonda.json`, `lado.json`,
`lado-1280x912.png`, `fotos-depois/`, e `harness/` (`cerimonia.mjs` → `cerimonia.json`,
`tempo-app.mjs`).

### 8.1 · A cerimónia — **o achado do `desenho` confirma-se, e é pior do que ele disse**

**(a) Nasce fora de vista em todas as respostas reais.** As cinco respostas do Mestre nos
saves têm **1 137 a 1 880 car.** Com a vista presa ao fim:

| | resposta | a cerimónia fica a | vista? |
|---|---|---|---|
| 375, noite (1 137 car.) | 980 px numa área de 448 | **−692 px** (acima do topo) | não |
| 375, dia (1 880 car.) | 1 533 px / 504 | **−1 217** | não |
| 1280, noite | 566 / 442 | **−230** | não |
| 1280, dia | 897 / 502 | **−529** | não |
| cortada a 300 car. | 269 (375) · 159 (1280) | +19 · +178 | **sim** |
| cortada a 500 car. | 478 · 285 | −190 · +51 | só na mesa |

**A cerimónia só se vê em respostas de até ~300 car. no telefone e ~500 na mesa.** Os
saves não têm nenhuma assim: **0 de 5**.

**(b) E custa o fim.** A cerimónia acende **depois** de a vista ter corrido ao fim. A
frase grande empurra a resposta **53 a 64 px para baixo**, e a âncora não compensa
(`overflow-anchor: auto`, mas a cerimónia está dentro do próprio nó que ancora). Com a
temporização do App (`smooth`, o mesmo commit): **o fim fica 63 px abaixo da vista a 375
e 53–54 a 1280**. São as duas últimas linhas da resposta e a runa do fim do registo.
**Nos dois únicos turnos que deviam ser especiais, o jogador não vê o começo nem o fim.**

**Provei o conserto óbvio, e ele não chega.** Voltar a ancorar ao fim depois de a
cerimónia acender devolve o fim (**0 px** em 4 de 4). Mas empurra a cerimónia ainda mais
para cima: a 375, até a resposta de 300 car. a perde (+19 → −44). **Com a vista presa ao
fim, a cerimónia e o fim são soma zero:** qualquer resposta mais alta que a área esconde
um dos dois.

**O resto da cerimónia está certo, e fica provado.** 28 px, peso 500, na 1.ª frase
(`A praça se acalma quando o sol cai.` · `A manhã em Torre da Fonte cheira a cera e
tinta.`). **Decai** no turno seguinte (4 de 4). **0 animações**, com e sem `reduce`. A
marca é estado do React (`useState`), não vai ao save.

### 8.2 · "A resposta chega pelo começo" — muda o veredito?

**Sim, muda o que se faz com a cerimónia. Não muda que V5 sobe.** A razão é que o defeito
de fundo **não é de V5, é mais velho do que ela**: **hoje, no telefone, o jogador cai no
fim de uma resposta de 980 px e lê as últimas 12 linhas primeiro**. Os primeiros 60 %
estão acima da vista, e é preciso rolar para trás para começar a ler. A cerimónia só o
tornou visível, porque pôs no começo uma coisa feita para ser vista. Medido no harness,
com a vista parada no início da resposta nova: **a cerimónia fica a 48 px do topo e
vêem-se 12 linhas a partir da primeira** (14 no dia); o `desenho` mediu 72 px e 11
linhas. **É a mesma peça a funcionar**, e também conserta a leitura de todos os turnos,
não só dos dois cerimoniais.

**Mas não a enfio em V5.** Muda **onde a vista pousa em cada turno**, que é o gesto
que o jogador repete mais vezes do que qualquer outro. Tem casos que precisam de prova
própria:
- a rolagem pendente, que hoje já segura a vista;
- as linhas do sistema que chegam depois da resposta, que não podem arrastar a vista;
- a seta de "ir ao fim";
- a resposta curta, que deve continuar a ancorar no fim;
- não saltar enquanto se lê.

Um commit revertido desfá-la, e por isso deve ter o seu. **É a etapa seguinte, V5e, e
recomendo-a antes de V6.** Sem ela, D2 é uma promessa que ninguém vê, e a leitura no
telefone começa pelo fim.

### 8.3 · Os critérios do §6

| # | critério | resultado |
|---|---|---|
| 1 | **lado a lado com o `126:5`** (1280 × 912, `lado-1280x912.png`) | **passou.** Cabeçalho 69 · corpo com `padding 28` · parágrafos a 16 · a runa com o ouvir · o pé com a oferta · o cartão com borda e cantos. **Cada diferença da página está em D1–D17.** A runa ocupar só a largura da coluna (536 e não 1 086) é consequência de D1. Há **uma diferença fora da lista, e não é da página**: a grelha. O cartão vai de 32 a 1 176 px e no nó de 24 a 1 166, com o topo em 64 contra 90. Isso é a cinta de 48 (V4, `142:2`) e o trilho, que é V7. Escrevo-a para o `144:2` como nota, não como desvio de V5 |
| 2 | **a coluna** | **passou**: 536 px na mesa (média 66–67, máx. 73–75 car./linha) e 295 no telefone, **igual** a hoje. A média do telefone desce de 35 para 33 porque agora há mais fins de parágrafo curtos; a largura é a mesma |
| 3 | **linhas de prosa** | **no topo, passou**: +1 a +2 em todas as seis telas (dia 11→12 e 11→12; noite 9→10 e 8→10; masmorra 9→10 e 8→10). **Como abre: 5 de 6 iguais ou melhores (dia-375 7→8), e 1 cai: noite-375 8→7.** A área é a mesma (448 = 448). A última linha visível subiu 40 px porque o fim do registo tem agora os espaçamentos do nó: `padding` de baixo 28 (era 24) e 24 entre blocos (era 16). O bloco do sistema de 152 px entre a resposta e a runa final paga isso duas vezes. **Não bloqueia**: é o espaçamento que a pessoa pediu, custa 1 linha numa vista presa ao fundo e ganha 1–2 no topo. **O conserto leve, se se quiser:** entre uma resposta e as linhas do sistema **do mesmo turno**, 16 e não 24 (24 é entre turnos) |
| 4 | **a soleira** | **passou**: dentro do cartão (`.tv-pe-da-pagina`) e fora do que rola, nas seis telas. **Topo do campo imóvel: 735 / 706** (6 de 6). Área que rola igual ou +2 (440 → 442). **O pé custa o que a caixa custava:** 94 = 94 (375, uma oferta), 150 = 150 (com `mais 1 oferta`), 62 = 62 e 124 → 122 (1280). A janela (`4 noites`), o retorno (`◉ 140`) e o `+N` estão lá, e os alvos têm 48 |
| 5 | **a abertura** | **FALHOU** (8.1): nasce fora de vista em 5 de 5 respostas reais e, no turno dela, empurra o fim da resposta 53–64 px para baixo da vista. A forma (28/500), o decaimento, 0 animações e 0 save passaram |
| 6 | **o painel da sala** | **passou**: o lugar dito **1 vez** na tela da masmorra (era 2), as tochas **1 vez** (era 2), `TESOURO · POR RESOLVER` e `2/7`. `ÀS ESCURAS` foi visto pelo `oficial`; eu não o provoquei |
| 7 | **o ouvir** | **passou**: 4 botões para 4 respostas, cada um no fim da runa, com 48 × 48 |
| 8 | **os cinco segundos** | **passou nas seis**: onde (`TORRE DA FONTE`, `ANDAR 1 · DO SILÊNCIO`) · que horas (`22:00` / `NOITE`) · PV `14` · dinheiro `15` · o que fazer (a oferta no pé do cartão e o campo). **Zero `O MESTRE`** em lado nenhum (eram 5 na noite) |
| 9 | **a casa** | build e suítes verdes, pelo `oficial` (216/216, 15/15). A tela de combate não foi tocada pelos scripts de V5 (`painel-batalha` e `grade-de-batalha` fora do diff) |

### 8.4 · Os dois senões do `oficial` (a gaveta, D17)

- **A tira de ~8 px do cartão de cima, debaixo do título preso.** O número que o põe lá
  está escrito à mão: `ALFORJE.focoAbaixoDoCabecalho` = 92 (20 + 56 + 16). A tira quer
  dizer que o cabeçalho preso mede ~84, não os 76 que a conta supôs. **Lê um pouco pior**:
  parece que o cartão pedido não é o primeiro. **Conserto leve:** o `scroll-margin-top` sai
  da altura **medida** do cabeçalho preso mais 16, e não de uma soma. Vai com V5.
- **As sub-abas ainda rolam para fora de vista.** O que eu disse em V4 que lia pior era
  **o título e o `✕` a desaparecerem**, porque sem eles não se sabe em que sala se está
  nem como sair. Isso ficou consertado. Sem as sub-abas à vista, o jogador sabe onde está
  (o título, e os cartões são o grupo) e sai com um toque. **Não bloqueia**, e vai para V7,
  que refaz as salas e as suas portas inteiras.

### 8.5 · O que muda para quem joga, em número

- **0 cabeçalhos `O MESTRE`** (eram 5 numa noite de 4 respostas); cada resposta abre com a
  runa e o ouvir;
- **a espera diz-se onde a resposta vai nascer**, à vista: antes estava no topo, a
  **1 454 px** (medida do `desenho`) de quem está no fim;
- **a oferta mora dentro da página**, sem caixa ciano, pelos mesmos px (94 / 62);
- **+1 a +2 linhas de prosa** à vista quando se rola até ao começo de uma cena, e o topo do
  campo não se mexe um píxel;
- **na masmorra, o lugar e as tochas ditos uma vez**, e o painel passa a dizer **a sala**.

### 8.6 · Veredito

**Sobe com um conserto: a cerimónia fica apagada até V5e.** É uma linha: o efeito não
marca `abertura`. `ABERTURA` e `Prosa` ficam, com a suíte a lê-los. **Não é timidez, é a
prova:** acesa, a cerimónia não se vê em 5 de 5 respostas reais e custa as duas últimas
linhas da resposta nos dois turnos em que devia brilhar. Re-ancorar devolve o fim e
esconde-a ainda mais (8.1).

**No mesmo commit, leve:** o `scroll-margin-top` da gaveta vem da altura medida (8.4).

**A seguir, antes de V6: V5e · "a resposta chega pelo começo"**, a ambiciosa do
`desenho`, **com o meu apoio e com número**:
- hoje, no telefone, a leitura começa pelo fim de uma resposta de 980 px;
- com V5e, a cerimónia fica a 48 px do topo e vêem-se 12 linhas desde a primeira.

V5e religa a cerimónia, e é aí que D2 passa a ser jogo. **A prova de V5e tem de cobrir:**
- a resposta curta, que continua a ancorar no fim;
- a rolagem pendente;
- as linhas do sistema que chegam depois, que não arrastam a vista;
- a seta de "ir ao fim";
- nenhum salto enquanto se lê.

Joguei as duas cenas lado a lado a 375. **O depois lê-se como um livro:** a página é do
Mestre sem ninguém o anunciar, e a oferta é da cena, não um cartaz por baixo dela. O antes
lê-se como uma conversa com etiquetas.
