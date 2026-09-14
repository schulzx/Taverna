<!-- ESTE ARQUIVO NÃO É FONTE DE VERDADE. -->

# D4 · a metade do `jogo` — o QUANDO

**A verdade sobre a cara de cada coisa é `mente/formas.md`, e só ela.** Isto
aqui é a metade que me cabe de D4: para cada ação que o jogador toca, *quando*
ela aparece, *o que ele quer ali*, *o que ela custa*, e **de que peça eu
preciso**. Não desenhei nada. Onde eu me peguei a querer uma borda, um raio ou
um milissegundo, parei e escrevi *"preciso de uma peça que faça X"* — o
`desenho` fabrica, e consolida isto em `formas.md` depois.

---

## 0 · Como medi, e os dois buracos que declaro antes de qualquer número

Joguei em `localhost:5173`, a 1280×860 e a 375×812: o menu, a campanha salva
(**O Fio de Prata · Brann**), Uma Noite (Capítulo e Torneio), uma luta de chave
aberta e jogada, o Duelo inteiro do começo ao veredito, e os painéis laterais.
O que está marcado *(medido)* saiu do DOM vivo por script; o que está marcado
*(código)* saiu de `arquivo:linha`.

**Buraco 1 — o Narrador está sem quota, outra vez.** A mesma frase de D1
apareceu na tela, inteira:

> `Limite diário alcançado (500 chamadas). Ele volta a zero à meia-noite — e se
> você chegou aqui jogando de verdade, me avise: o teto sobe.`

Então **não joguei um único turno narrado** — nem em Uma Vida, nem no Capítulo.
Tudo o que eu digo sobre *o turno* (o `Agir →`, a espera, o veredito do dado, a
pílula do log) está medido por código e por uma tela parada, **não por turno
vivido**. O combate eu consegui: `⚔ A PRÓXIMA LUTA` abre a luta pelo sistema,
localmente, e a luta abriu com o Mestre calado — foi ali que medi o tabuleiro,
o movimento e o `⛺`. **Cobertura com buraco declarado vale mais que cobertura
fingida**, e este é o buraco.

**Buraco 2 — a armadilha da casa mordeu, e é a que está escrita.** A primeira
aba não respondia a clique nenhum: cliquei `Continuar aventura` quatro vezes, a
árvore de acessibilidade não mudou uma linha, o console não acusou nada. Era
**buffer velho do dev-server** (`HMR mente depois de rename`, `CLAUDE.md`). Aba
nova, e o jogo abriu no primeiro clique. Registro porque eu quase escrevi *"o
botão de continuar não funciona"* como achado — e teria sido o terceiro engano
herdado desta fase.

---

## 1 · O censo do que o jogador toca, por momento

**231 controles** no projeto de tela *(medido: 232 pontos de `<button`/`<Botao`,
um deles falso positivo numa linha de comentário)*. Eles não são 231 formas:
são **onze famílias**. Abaixo, cada família com os lugares onde ela aparece, o
momento, e a peça de que precisa.

A coluna **↯** marca irreversível — onde a lei *o veredito antes do clique*
manda existir preço escrito antes do dedo.

---

### A · **Fazer o turno acontecer** — a chamada

> *o jogador escreveu (ou escolheu) e agora quer que o mundo ande*

| lugar | o verbo | quando | ↯ | tamanho *(medido)* |
|---|---|---|---|---|
| `App.jsx:21219` | **agir** (`Agir →`) | Uma Vida, todo turno | — | **45 × 16 px** |
| `App.jsx:21204` | **lutar a próxima** (`⚔ A PRÓXIMA LUTA`) | Torneio, entre lutas | — | **1144 × 48 px** |
| `App.jsx:4468` | **entrar na arena** (`À ARENA →`) | Duelo, montado | — | **591 × 54 px** |
| `App.jsx:4330` | **entrar na noite** (`ENTRAR NA NOITE / NA CHAVE →`) | Uma Noite, montada | — | **380 × 54 px** |
| `App.jsx:3674` | **forjar o mundo** | criação, fim | — | — |
| `App.jsx:3952` | **entrar em cena** | criação do herói, fim | — | — |
| `App.jsx:4060` | **entrar na sala** | sala ao vivo | — | — |

**O momento, e é o meu argumento inteiro:** a chamada é a última coisa que o
olho encontra antes de o turno existir. É o gesto mais repetido do jogo — um
por turno, centenas por campanha — e no **modo padrão absoluto** ele é o menor
controle da tela. *(medido, na mesma tela e na mesma sessão de Uma Noite: a
aba que abre a Bolsa mede 72 × 122 px = 8.784 px²; o `Agir →` mede 45 × 16 =
**720 px²**. A porta do inventário é **12 vezes** o botão que faz o turno
acontecer. E o `⚔ A PRÓXIMA LUTA`, três centímetros acima dele, é **76 vezes**
o `Agir →`.)*

**Peça:** Botão · *Papel Chamada*. Existe. O que falta é **uma só**: ver a
divergência 4.

---

### B · **Rolar o dado** — o único momento que já é jogo

| lugar | o verbo | quando | ↯ | peça |
|---|---|---|---|---|
| `App.jsx:21228` | **rolar** (`Rolar d20`) | o Mestre pediu um teste | — | Botão Chamada |
| `App.jsx:583` | **gastar o Destino** | dentro do véu do dado | **↯** | **A consequência** |
| `App.jsx:577` | **gastar heroísmo no dado** | idem | **↯** | A consequência |

**O momento:** o véu do dado (`App.jsx:512`) é, ainda hoje, o único lugar da
sessão em que se sente que se está a jogar — escurece, o d20 treme, para, e só
então vem o veredito. **O tempo entre o número e o veredito é o jogo.**

**O que está quebrado, e é da lei:** o preço do **Destino** — *"o segundo dado
vale, mesmo se for pior"* — mora inteiro num `title`. É um atributo de rato: no
telefone ele **não existe**. O jogador paga um recurso sem saber que pode
piorar o resultado. **Peça: A consequência, fixação Linha, nascida acesa.**

**E falta um controle inteiro aqui:** com uma rolagem pendente, `bloqueado`
apaga 15 controles *(código: `App.jsx:20384`)* e o único caminho é rolar. **Não
existe "eu não tento"** — ver a secção 2.

---

### C · **Escolher um entre N** — a família mais partida do jogo

| gramática | onde | quando | tamanho *(medido)* |
|---|---|---|---|
| cartão grande + bolinha | `ui.jsx:389` (`CartaoDeEscolha`) | criação, 11 usos | — |
| `<select>` do sistema operativo | **16 lugares** *(medido)* | criação, correio, forja, governo | — |
| stepper `−`/`+` | `App.jsx:3929/3932` | atributos na criação | **24 × 24 px** |
| `+` no atributo | `painel-ficha.jsx:66` | subir de nível | **20 × 20 px** |
| cartão de campeão | `App.jsx:4424` | Uma Noite / Duelo | **164 × 93 px** |
| cartão de prato | `App.jsx:4290` | Uma Noite | **334 × 78 px** |
| cartão de história | `App.jsx:4317` | Uma Noite | **336 × 66 px** |
| pílula âmbar | `App.jsx:1937, 2557, 20848, 20914` | painéis | — |
| pílula violeta | `App.jsx:3130, 3366, 3444, 21100` | habilidades, magias | — |
| pílula vermelha | `App.jsx:3263` | **declarar alvo em combate** | — |
| aba grande | `App.jsx:1211` | os cinco painéis | **72 × 122 px** |

**O momento:** a criação de personagem é a primeira meia hora de quem chega, e
nela o jogador aprende **quatro línguas de escolher** em quatro rolagens de
tela. E na tela de Uma Noite eu contei, *medidas no mesmo ecrã*, **três
tamanhos de cartão de escolha** — 164×93, 334×78, 336×66 — para três perguntas
que são a mesma pergunta: *qual destes?*

**Peça: NÃO EXISTE.** *A escolha* era a peça 8 da minha demanda de D3 e ficou
de fora da biblioteca por tamanho (`diario-desenho.md`, D3: *"duas peças da
lista do `jogo` não entraram: a casa do tabuleiro e a escolha"*). **Eu peço de
novo, e subo a prioridade**, porque é a única família cujo defeito o jogador
encontra **antes de jogar o primeiro turno**.

E há um pedido dentro do pedido que é de momento, não de forma: **o stepper de
atributo tem 24 px e o `+` da ficha tem 20 px** — são os dois controles da
decisão mais consequente da vida de um personagem, e são os menores alvos do
jogo inteiro depois do `🔊`. Preciso de uma peça de escolha que saiba ser
*contador* sem encolher para caber.

---

### D · **Abrir e fechar um lugar**

**Abrir** — 5 abas (72×122), `⚔ Ações`, `✦ Habilidades`, `🔍 Examinar`,
`🕐 Tempo` *(medidos: 27 px de altura no desktop, 40 px no telefone)*, a bolsa
de combate, a forja, `⤢ ampliar`, a ficha pela barra de status.

**Fechar** — e aqui está o defeito que só aparece quando se lista tudo junto.
**O `✕` aparece em 14 controles e significa QUATRO coisas** *(código)*:

| o que o `✕` faz | quantos | onde | ↯ |
|---|---|---|---|
| **fecha** um painel | 7 | `App.jsx:1840, 2806, 3026, 3338, 20553`, `painel-guilda:131`, `painel-heroismo:68` | — |
| **tira da seleção** | 2 | `App.jsx:20611` (desarmar milagre), `:20621` (desarmar habilidade) | — |
| **descarta / abandona** | 4 | `App.jsx:1505` (retirar cartaz), `:1588` (abandonar contrato), `:2534` (remover companheiro do grupo), `:2772` (descartar equipamento) | **↯** |
| **expulsa da guilda** | 1 | `painel-guilda.jsx:339` | **↯** |

D3 escreveu *"duas ações, uma forma"*. **São quatro**, e cinco delas não voltam
atrás. O caso que dói mais é `painel-guilda.jsx:338-339`: **`▲` promover e `✕`
expulsar, lado a lado, do mesmo tamanho, os dois sem uma letra de rótulo**, e
só um deles é irreversível.

**Peça: Fechar** (existe) — e a regra que eu ponho no `quando`: **o `✕` é da
saída e de mais nada.** As cinco ações de perda saem do `✕` e passam ao *gesto
que custa*, com o **verbo escrito**.

**E `Escape` não fecha nada** *(medido em 2 das 15 sobreposições — o painel
lateral e o tabuleiro ampliado; as outras 13 por código: `Escape` tem **zero**
ocorrências em `src/`, e os 6 `onKeyDown` do projeto são `Enter` ou espaço)*.
No painel lateral o fundo fecha e o `✕` fecha; no tabuleiro ampliado o fundo
fecha e o `Fechar e agir →` fecha; `Esc` não fecha nenhum dos dois.

---

### E · **O que não volta atrás** — 14 ações, e o `⛺` é a pior

| lugar | o verbo | quando | pergunta hoje? |
|---|---|---|---|
| `App.jsx:20417` | **acampar** (`⛺`) | qualquer momento, inclusive **no meio da luta** | **não** |
| `App.jsx:2534` | **remover do grupo** | painel Pessoas | sim (caixa improvisada) |
| `painel-guilda:339` | **expulsar da casa** | painel Guilda | **não** |
| `App.jsx:4615` | **nova campanha** (substitui o save) | menu | **não** |
| `App.jsx:20758` | **sair da masmorra** | dentro da masmorra | **não** |
| `App.jsx:1588` | **abandonar contrato** | Mural | **não** |
| `App.jsx:1505` | **retirar cartaz** | Mural | **não** |
| `App.jsx:1729` | **recusar petição** | Correio | **não** |
| `App.jsx:2772` | **descartar equipamento** | Bolsa | **não** |
| `App.jsx:4707` | **desfazer importação** | menu | **não** |
| `painel-talentos:104, :409` | **redistribuir** atributos / tudo | Talentos | sim ×2 |
| `painel-ascensao:72, :75` | **encarar a prova / abandonar o rito** | Ascensão | **não** |
| `painel-diario:107` | **dar a missão por perdida** | Diário | **não** |

**Onze de catorze não perguntam nada.** E o `⛺` eu **joguei**, e é pior do que
D1 contou *(medido, ao vivo, numa luta de chave contra "A Voz")*:

1. o botão mede **34 × 38 px** e não tem uma letra de rótulo — o nome dele vive
   num `title`;
2. um clique, sem pergunta, e `EM COMBATE` **sumiu**;
3. o `⚔ A PRÓXIMA LUTA — A Voz` virou `⚔ A PRÓXIMA LUTA — **A Sombra**` — ou
   seja, **a chave andou**;
4. e **nenhuma linha do log diz o que aconteceu com A Voz.** Procurei: zero
   ocorrências do nome depois do clique. Ganhei? Fugi? Desisti? O jogo não diz.

A ação mais irreversível da sessão, atrás do controle mais mudo, **e sem
veredito nem depois do clique**.

**Peça: O gesto que custa** (existe, e é exatamente o que falta). O meu `quando`
para ela: **ela pergunta no lugar, e a pergunta carrega o preço** — não "tem a
certeza?", mas *"acampar agora encerra a luta contra A Voz"*. E o
`Nova campanha`: *(medido)* **o botão e o único aviso que o jogo dá estão a
941 px um do outro, numa janela de 812** — os dois **nunca podem estar na tela
ao mesmo tempo**. O aviso tem de morar **dentro** da peça.

---

### F · **Gastar um recurso**

`🩹 Gastar 1` (dado de vida, acampamento, `App.jsx:20820`), as poções à mão
(`App.jsx:3123`), a bolsa em combate (`:3142`), `📜 Declarar · 2 pontos`
(`painel-heroismo:94`), o milagre, a habilidade que come PM.

**O momento:** é o único lugar onde o jogo já faz a coisa certa por hábito — as
poções dizem `· não gasta o turno` ao lado, em texto. **Peça: Botão + A
consequência**, e o que eu quero é que essa frase deixe de ser um `<span>`
escrito à mão em cada sítio e passe a ser a fenda da peça.

---

### G · **Mover-se no tabuleiro** — a peça que não existe

*(medido, ao vivo, numa luta aberta)*

- **86 casas alcançáveis** são `role="button"`, e cada uma é um
  `<rect fill="transparent">` com `outline: none` e **sem `aria-label`**.
- Cada casa mede **27 × 27 px** no tabuleiro embutido e **35 × 35 px** no
  ampliado.
- **Quando o combate abriu, o tabuleiro não estava na tela.** O scroller da
  narrativa mede 466 px e guardava 1595 px; o tabuleiro (380 × 380) começa em
  `y = 974`, **429 px abaixo da borda visível**, e o scroller **não rolou
  sozinho** (`scrollTop = 0` de 1129 possíveis).
- Rolado até ao fim, **41 das 86 casas** ficam visíveis. Metade do tabuleiro
  alcançável não cabe.

**O momento:** é o momento inteiro da Fase E. O jogador entra numa luta e a
primeira coisa que ele tem de fazer para poder lutar é **rolar um log de texto
à procura do campo de batalha**.

**Peça: a casa do tabuleiro — NÃO EXISTE**, e é a segunda das duas que ficaram
de fora da biblioteca em D3. Eu não peço o endereço (é regra, é do `backend`);
peço **a casa como peça**, com o custo do passo visível antes do passo, e num
alvo que o dedo acerte.

---

### H · **Ler o estado** — o que não se clica

A barra de status (`NIV · PV · PM · XP · data · lugar`), a ordem de iniciativa,
os chips `⚔ ação` / `✦ extra` / `👣 9 de 9 m`, os 73 selos `<span>`, as 18
barras.

**O momento, e é um achado novo:** *(medido, no jogo carregado)* a barra de
status mostra **NIV, PV, PM, XP, dia e lugar** — e **não mostra as moedas**.
`◉ 240` só existe **dentro** do painel Bolsa. O jogador não vê o que tem sem ir
procurar, e é o número que decide toda compra, todo suborno e todo presente.

**Peça: Selo de estado** (existe) + o tom **"mudou agora"**, que ainda não foi
feito. O cinturão de estado do cabeçalho (moedas, tocha, hora) é montagem minha
assim que o Selo existir — não custa desenho novo.

---

### I · **O fim de uma partida**

| lugar | controles | o que falta |
|---|---|---|
| `App.jsx:4504-4505` | `REVANCHE` *(medido: 606 × 52)* · `MENU` *(62 × 52)* | `REVANCHE` **não faz revanche**: devolve ao ecrã de montagem |
| `App.jsx:4524-4526` | `OUTRA NOITE` · `DAR A ELE UMA VIDA` · `MENU` | — |
| `App.jsx:357` | o véu da morte, sem porta | — |

**O momento, e eu joguei o Duelo inteiro para o medir:** do menu ao resultado
final foram **3 cliques e 1,2 segundo**. O ecrã do resultado tem **52 linhas de
texto** — o vencedor no topo, as três quedas por baixo — e **zero delas dizem
"você"** *(medido: a busca por `você|seu campeão|VOCÊ` no ecrã inteiro devolve
nada)*. Eu escolhi A Muralha e ela venceu, e **nada na tela marca qual dos dois
campeões era meu.**

---

### J · **A sala ao vivo** · K · **Guardar e trazer**

`Criar uma sala`, `Entrar com código`, `ABRIR O CANAL`, o botão de copiar o
código, `Sair da sala` *(mudo — só `title`)*; `Guardar em arquivo`,
`Trazer de arquivo`, `desfazer importação`, `Recarregar`.

Não os joguei nesta sessão (a sala precisa de duas abas e do Mestre vivo; o
Mestre está sem quota). **Declarado como não medido.**

---

## 2 · As duas coisas que D1 disse que faltavam ao censo

### 2.1 · As ações sem controle — **seis**, e a primeira é grande

1. **A reação.** `reacoes.js` tem **seis** reações com gatilho, custo em PM e
   resolução — Contramágica, Escudo Arcano, Aparar, Esquiva Ágil, Contra-ataque
   e as seguintes. O golpe chega, `escolherReacao` *(reacoes.js:85)* escolhe **a
   primeira da lista que se aplica**, `resolverReacao` rola, e o PM sai da ficha
   do jogador *(código: `App.jsx:7569-7578`, `pmReacaoRef`)*. **O jogador nunca
   toca.** O próprio cabeçalho do módulo escreve: *"No 5e e no BG3 metade da
   tensão do combate mora aqui"* — e a linha seguinte entrega a decisão ao
   sistema. É a ação sem controle mais cara do jogo, e é a base da minha
   proposta ambiciosa.
2. **O ataque de oportunidade do jogador.** Quando um inimigo dá as costas, o
   golpe livre do herói rola sozinho *(`App.jsx:13542`)*. É o único ataque do
   jogo que acontece fora do turno, e ele passa como uma linha de log.
3. **A ação extra (`✦ extra`).** É um chip aceso na barra do combate — um
   recurso de verdade, contado pela economia — e **não tem um único controle**.
   Só se gasta escrevendo prosa e torcendo para o Mestre entender.
4. **Não agir.** O botão *encerrar turno* saiu de propósito
   *(`App.jsx:3079`: "Agir É encerrar")*. Consequência: quem quer esperar,
   segurar a ação ou simplesmente não fazer nada **tem de escrever uma frase** —
   e gastar uma chamada ao Mestre para dizer que não faz nada.
5. **Recusar o teste de dado.** Com `rolagem` pendente, `bloqueado` apaga 15
   controles e o único caminho para a frente é `Rolar d20`. Não existe *"eu não
   tento"*, nem *"eu desisto do teste"*.
6. **Declarar alvo com um inimigo só.** O bloco `Escolha o alvo` só renderiza
   com **mais de um** inimigo de pé *(`App.jsx:3246`)*. Contra um inimigo
   sozinho não há controle de alvo nenhum — o que é razoável —, mas também não
   há onde dizer *onde* se mira, porque a mira só existe com uma habilidade
   selecionada.

**E um sétimo que é meio-caso, e prefiro nomeá-lo:** `👣 9 de 9 m nesta rodada`
**parece** um mostrador de recurso e está congelado (ver 3.5). Um controle que
mente é pior que um controle que falta.

### 2.2 · Os controles sem rótulo — **15 pela varredura, ≥23 na verdade**

*(medido por script: 15 controles sem uma única letra de rótulo — **6 com
`title`, 9 completamente mudos**. A varredura só pega os que cabem numa linha;
à mão achei pelo menos mais 8 em linha composta. O número honesto é **≥23**.)*

Os do cabeçalho, que é onde o jogador olha primeiro — e note-se que o **nome
que o leitor de tela anuncia é o `title`**, porque não há mais nada:

| glifo | o que o `title` diz | o que ele **faz** *(testado)* | o verbo certo |
|---|---|---|---|
| a caneca (glifo traçado) | `Início` | sai da partida para o menu | **sair para o menu** |
| `⛺` | `Montar acampamento` | acampa **e encerra a luta em curso**, e a chave anda | **acampar (encerra a luta)** |
| `🎲` | `Rolagens de combate: visíveis/ocultas` | alterna mostrar as rolagens no log | **mostrar as rolagens** |
| `📜` | `Gerar crônica` | **gasta uma chamada ao Mestre** | **escrever a crônica (custa uma chamada)** |
| `↓` | `Ir para a última mensagem` | rola o log ao fim | **voltar ao fim** |
| `⤢ ampliar` | `Abrir o campo em tela cheia` | abre um véu que **corta 33% do campo** (ver 3.4) | **ver o campo maior** |
| `▲` / `✕` | `Promover` / `Expulsar` | promove / **expulsa** | **promover** / **expulsar** |
| `⚒` | `Desmontar → +N essência` | desmonta o equipamento | **desmontar** |
| `−` / `+` | *(nada)* | tira/põe ponto de atributo | **tirar / pôr um ponto** |
| `✕` ×9 | *(nada)* | fecha, desarma, descarta ou expulsa | *ver a família D* |
| `🔊` | `Ouvir o Mestre narrar…` | lê a mensagem em voz | **ouvir** |

**Os `🔊` são o menor alvo do jogo** *(medido: 22 × 22 px no desktop **e** no
telefone, um por mensagem do Mestre)*.

**E o número que resume as duas secções** *(medido na tela da campanha)*: dos
**21 controles** visíveis no desktop, **15 têm o lado menor abaixo de 44 px**;
no telefone (375×812) são **14 de 25**. 44 px é o piso das diretrizes de
plataforma para alvo de toque (Apple HIG 44 pt; Material 48 dp; WCAG 2.5.5).
**Peça: não é peça nova — é o `tamanho` do Botão ter um piso**, e é do `desenho`
dizer qual. Eu só digo quantos estão abaixo dele.

---

## 3 · O que de D1 não era verdade — cinco correções, três delas novas

As duas primeiras já tinham caído em D3 e eu as repito só para não voltarem:

1. **"a grelha não é clicável" — ERRADO.** Cada casa alcançável é
   `role="button" tabIndex=0` com `onMover`
   *(`grade-de-batalha.jsx:512-517`)*. **Confirmado ao vivo: 86 alvos.** O
   clique funciona; o que falta é forma.
2. **"os bloqueados continuam clicáveis" — ERRADO.** 33 dos 36 têm `disabled`.
   **O defeito é o silêncio**, não o clique fantasma.

E três que eu derrubo agora, medidas nesta sessão:

3. **"o interruptor `🎲` tem o estado só no tooltip; cliquei e o emoji não
   mudou" — ERRADO.** *(medido, alternando o botão e lendo o estilo computado
   antes e depois)*: a borda vai de `#2E2745` a `#E8A33D` e a tinta do glifo vai
   de `#9B93AC` a `#F5C878`. **Dois canais mudam.** O emoji de facto não muda —
   e era isso que eu estava a olhar. **O defeito verdadeiro é outro e continua
   grave: o estado é visível e NÃO TEM NOME.** Um dado apagado pode significar
   "desligado" tanto quanto "indisponível", e nada na tela desempata. Não é
   *falta de estado*: é *estado sem palavra*. **Peça: A consequência, tom
   Estado.**

4. **"`⤢ ampliar` abre outro bloco dentro do mesmo scroller clipado" —
   ERRADO.** Ele abre um véu de verdade — `fixed inset-0 z-50`
   *(`grade-de-batalha.jsx:581`)*. **Mas o defeito real é pior e é novo**
   *(medido a 1280×720)*: o véu é uma coluna centrada com `overflow: visible`,
   e o conteúdo (título + tabuleiro de 490 px + legenda + botão) não cabe. O
   resultado:
   - o próprio título, `CIDADE · 14×14 QUADRADOS DE 1,5 M`, fica em
     **`top = −184`** — **fora da tela**;
   - o tabuleiro fica em **`top = −160`**: **160 dos 490 px (33%) do campo estão
     acima da borda da janela**, e o véu **não rola**;
   - e o campo ocupa **490 × 490 de 1280 × 720 = 26% da tela** — num ecrã cuja
     única função é mostrar o campo.

   **O controle que promete "tela cheia" mostra MENOS campo do que promete.**

5. **"`9 de 9 m nesta rodada` — nunca andei um metro" — ERRADO, e errado duas
   vezes.** *(medido: cliquei numa casa alcançável e depois noutra)*

   ```
   👣 Você vai de no beco estreito para sob a arcada — 7,5 m gastos, restam 1,5 m.
   👣 Você vai de sob a arcada para no beco estreito — 6 m gastos, restam 3 m.
   ```

   **Eu andei.** O movimento funciona, cobra o caminho e nomeia os lugares. O
   que está partido é outra coisa, e é dupla:
   - **o segundo passo gastou 6 m quando só deviam restar 1,5** — o orçamento
     reinicia a cada passo;
   - **o chip nunca saiu de `9 de 9 m`**, em passo nenhum.

   A causa está à vista no tratador do movimento: `const novaEco = eco ? {
   ...eco, movM: sobra } : eco;` — **quando a luta não tem `economia`, o
   movimento gasto é deitado fora**. E a luta da chave não tem: o literal que a
   abre *(`App.jsx:21199`)* não traz o campo. **Isto é defeito de regra e é do
   `backend`** — eu registo, não conserto. Mas muda o pedido de desenho: não é
   *"dê ao jogador uma forma de se mover"*, é **"faça o medidor dizer a
   verdade"**, e é mais barato.

**E uma correção menor, para não virar folclore:** D1 escreveu *"o campo de
16×16"*. Na luta que joguei o campo era **14×14** *(medido)*. O tamanho varia
com o lugar; 16×16 é um caso, não a regra.

---

## 4 · As 4 divergências de significado — o meu lado, e onde eu cedo

### 4.1 · confirmar / cancelar

**O meu lado.** Cancelar não é um botão: é **a saída de emergência**. O momento
é sempre o mesmo — o jogador armou alguma coisa cara e mudou de ideias — e o
que ele precisa ali é reconhecer a porta **sem ler**. Hoje não reconhece:
*(código)* são **12 lugares, 4 palavras e 5 tamanhos**: `cancelar` ×5
(`App.jsx:1672, 2542, 21079`, `painel-talentos:112, :417`), `VOLTAR` ×2
(`:4327, :4467`), `voltar`/`voltar ao menu` ×2 (`:4063`,
`painel-heroismo:97`), `manter como está` ×3 (`:21265, :21295, :21323`) — e
**dois deles não têm borda nenhuma** (`:21079` e `:4063`, este último um
sublinhado). No meio de uma fila de botões, um texto sublinhado não parece um
botão.

E o pior caso continua onde D1 o deixou: o botão que **remove um companheiro do
grupo** *(`App.jsx:2541`)* usa `#fff` sobre `T.danger` — **3,42:1, reprova em
WCAG AA** —, e é o único botão do jogo que apaga alguém.

**A forma única que eu proponho:** *Papel Recuo* do Botão, uma só, em todos os
doze lugares — e **a palavra amarrada ao momento, não à linha em que nasceu**:
dentro de uma pergunta armada é sempre `cancelar`; numa tela de montagem é
sempre `VOLTAR`; numa proposta do sistema é sempre `manter como está` (porque
ali o jogador não desiste de nada — ele recusa uma mudança).

**Se o `desenho` insistir em uma palavra só — `cancelar` em tudo —, eu cedo,
porque** o que eu quero do momento é o reconhecimento de relance, e uma palavra
só entrega isso mais depressa que três. Perco a nuance de *"manter como está"*;
ganho a leitura sem esforço, que é o que a saída de emergência pede.

---

### 4.2 · fechar um painel

**O meu lado.** A saída é a única peça desta lista que **não deve ser momento
nenhum**: é a porta, e uma porta que chama a atenção rouba a cena de quem está
dentro. O que eu preciso dela é que esteja **sempre no mesmo canto** e que o
dedo a acerte. Hoje: 8 formas visuais, 5 tamanhos, e — o achado desta sessão —
**o mesmo `✕` tem quatro significados, cinco deles irreversíveis** (ver a
família D).

**A forma única que eu proponho, e são duas regras:**
1. **O `✕` é da saída e de mais nada.** As cinco ações de perda saem dele e
   passam ao *gesto que custa*, **com o verbo escrito** — `expulsar`,
   `descartar`, `abandonar`, `remover`. Um glifo que às vezes fecha e às vezes
   apaga alguém é uma armadilha, não uma economia de espaço.
2. **Três portas em toda sobreposição: `Esc`, o fundo, e o `✕`** — menos as de
   decisão obrigatória, que não têm nenhuma e **dizem por escrito que não têm**
   (o *véu sem retorno* já resolve isto, e é a parte da peça que eu mais
   aprovo).

**Se o `desenho` insistir em que a saída tenha uma forma só — a "franca", do
mesmo tamanho no painel lateral e no véu — e que a variante "discreta" morra,
eu cedo, porque** eu pedi a discreta para não roubar a cena, e os quatro `✕` de
~20 px que eu medi provam que a discrição virou defeito: **um alvo que o dedo
erra rouba muito mais cena do que um alvo grande.**

---

### 4.3 · "não pode agora"

**O meu lado, medido.** `const bloqueado = carregando || !!rolagem`
*(`App.jsx:20384`)* governa **15** `disabled={bloqueado}` e mais **6**
expressões de opacidade, com dois valores (0.4 ×3, 0.45 ×3). Quer dizer que **o
Mestre estar a escrever** e **haver um dado à espera** apagam a barra de ação
com exatamente o mesmo cinza. E o `Agir →` carrega **três** razões na mesma
cara — as duas acima mais *o campo está vazio*.

A separação *Esperando* × *Impedido* que o `desenho` fez no Botão está certa, e
a minha metade é dizer **qual das três é qual**:

- *"o Mestre está a escrever"* → **Esperando**. Volta em segundos, sozinho.
- *"há um dado à espera"* → **Esperando**, mas com um `quando` diferente:
  **não devia apagar a barra inteira.** Hoje apaga `Ações`, `Habilidades`,
  `Examinar` e `Tempo`, que não têm nada com a rolagem. Devia apagar só o
  `Agir →` e acender o `Rolar d20`.
- *"você ainda não escreveu nada"* → **nem um nem outro**. É o *Repouso* do
  botão com a razão à mostra, porque o que o desbloqueia é a próxima tecla do
  próprio jogador. **Um controle que se acende sozinho quando você digita não é
  impedimento — é o campo vazio a falar.**

**Se o `desenho` insistir em que o campo vazio também use *Esperando*, eu cedo,
porque** o meu ganho ali é conceitual e o dele é de leitura: **dois estados
aprendem-se mais depressa que três**, e a razão escrita — *"escreva o que você
faz"* — já carrega sozinha a diferença que eu queria dar pela forma.

---

### 4.4 · a ação principal entre os modos

**O meu lado, e agora tem número.** *(medido, no DOM vivo)*

| modo | a chamada | tamanho | área | fonte |
|---|---|---|---|---|
| `historia` (**o padrão absoluto**) | `Agir →` | 45 × 16 | **720 px²** | JetBrains Mono 12 |
| `rapida` · Torneio | `⚔ A PRÓXIMA LUTA` | 1144 × 48 | **54.912 px²** | Cormorant 18 |
| `duelo` | `À ARENA →` | 591 × 54 | **31.914 px²** | Cormorant 18 |
| `rapida` · Noite | `ENTRAR NA NOITE →` | 380 × 54 | **20.520 px²** | Cormorant 18 |

**76 vezes**, entre a menor e a maior. E o caso que mata a discussão: **as duas
extremas estiveram na MESMA tela, na mesma sessão, a três centímetros uma da
outra** — o `⚔ A PRÓXIMA LUTA` fica acima do campo de escrita onde o `Agir →`
vive. Não é divergência entre modos: **é divergência dentro de uma tela.**

O `CLAUDE.md` diz que modo é *"lente sobre o mesmo motor, nunca um segundo
jogo"*. Visualmente, hoje, são dois jogos — e o modo **padrão**, o que a pessoa
chamou de *Uma Vida* e protegeu com regressão zero, tem a **menor** chamada de
todas.

**A forma única que eu proponho:** a chamada é **uma peça só**, na variante
grande — a do Duelo. O `Agir →` sobe até ela.

**Se o `desenho` insistir em que a chamada da campanha fique menor que a do
Duelo — e ele tem um argumento real, porque ali ela divide a linha com o campo
de escrita e uma faixa de 18 px empurraria o campo para fora do telefone —,
eu cedo, desde que seja a MESMA PEÇA no maior tamanho que couber ali.** Porque
o que eu não posso aceitar não é o tamanho: é serem **duas peças diferentes**.
Duas peças ensinam duas línguas; uma peça em dois tamanhos ensina uma.

---

### 4.5 · A escala de cerimônia — **fechada** (a resposta que o `desenho` pediu)

O `desenho` propôs quatro degraus — **nota · realce · véu leve/pesado · véu sem
retorno** — e deixou comigo *quais momentos sobem de 1 para 2*. **Aceito os
quatro degraus, e aceito por escrito o risco que ele registou: comprometo-me a
não usar véu leve para conquista nenhuma.**

**A regra, antes da lista** — porque uma regra sobrevive a momentos novos e uma
lista não:

> **Sobe ao realce o que muda o que o jogador PODE FAZER a partir de agora — e
> só na primeira vez.** O que só muda um número fica em nota.

**Sobem ao realce (degrau 2):**
1. **missão concluída** — hoje é a quarta de seis pílulas cinzentas iguais;
   *(medido na campanha carregada: `✦ MISSÃO CONCLUÍDA: Tirar Halvard da Foz
   de lá — +57 moedas · +89 XP`, no mesmo tipo, tamanho e cor de "🗺 um lugar
   surgiu no mapa")*;
2. **conquista desbloqueada**;
3. **um separador novo nasce no menu** (o Códex, a Ascensão) — é literalmente
   uma porta nova na tela, e hoje nasce em silêncio;
4. **a primeira vez que alguém entra no grupo**;
5. **a casa/guilda aceita você** (ou o expulsa);
6. **um título novo fica disponível**;
7. **uma habilidade ou magia nova fica disponível** — muda o que se pode fazer
   no turno seguinte;
8. **a fama muda de patamar**;
9. **uma facção vira aliada ou inimiga** — muda quem abre a porta.

**Ficam em nota (degrau 1), e é decisão, não esquecimento:** +XP, +moedas, item
recolhido, lugar novo no mapa, tempo a passar, cada linha de combate, *"fulano
tem um trabalho no mural"*. São frequentes, e realce frequente deixa de ser
realce em duas sessões.

**Continuam véu (3) os que já são:** o dado, a subida de nível, o espólio
revelado, a cerimónia do lugar novo, a carta do taró. **E sem retorno (4):** a
morte, a recalibragem e as três caixas de decisão do save.

**O `quando` do Selo "mudou agora"**, que nasce junto do degrau 2: ele aparece
**no número que mudou, no sítio onde o jogador vai olhar a seguir**, morre no
turno seguinte, e **nunca em duas coisas ao mesmo tempo** — dois "mudou agora"
na mesma tela é zero "mudou agora".

---

## 5 · A proposta ambiciosa

### 5.1 · **A rodada tem três batidas, e o jogador toca as três**

Hoje uma rodada de combate é: *escreve uma frase → o sistema resolve tudo →
lê vinte linhas.* As regras já modelam **três** coisas que são do jogador —
**mover**, **agir** e **reagir** — e:

- **mover** tem controle, mas o controle é invisível (`<rect
  fill="transparent">`), fica **429 px abaixo da dobra** quando a luta abre, e
  o medidor dele está congelado em `9 de 9`;
- **agir** tem uma chamada de **720 px²** e resolve-se escrevendo;
- **reagir** — **seis reações, custo em PM, gatilho e resolução, tudo pronto em
  `reacoes.js`** — **não tem controle nenhum**. O sistema escolhe a primeira da
  lista, gasta o PM do jogador, e o jogador lê o resultado.

**A proposta:** quando o combate abre, o jogo deixa de ser *uma conversa com um
tabuleiro por baixo* e passa a ser *um tabuleiro com uma conversa por baixo* —
e as três batidas ganham lugar de ser tocadas:

1. **O tabuleiro vem primeiro.** No instante em que `combate` existe, o campo é
   a primeira coisa visível. *(É a Fase E, já aprovada pela pessoa. O que eu
   acrescento é a medida do porquê: o campo abriu a 429 px abaixo da borda e o
   scroller não rolou sozinho — `scrollTop = 0` de 1129.)*
2. **O passo diz a verdade antes e depois.** O custo do passo já é calculado
   (`caminhar` devolve `custoM`, e o log escreve *"7,5 m gastos, restam
   1,5 m"*). Falta só isso aparecer **na casa, antes do clique** — e o medidor
   parar de mentir.
3. **A reação vira uma janela.** O golpe chega, e **antes** de o dano assentar
   o jogo pergunta, numa janela curta e que não bloqueia o turno: *"Aparar? —2
   PM, corta metade"*. Quem não responde, o sistema responde por ele exatamente
   como hoje (a regra não muda, o padrão não muda, ninguém fica pior). Quem
   responde, **joga**.

**A prova, pelos três caminhos que a casa aceita:**

- **Medida:** numa luta inteira eu toquei **três** controles — duas casas e o
  `⛺` que a encerrou por engano. Tinha seis reações disponíveis e um recurso
  `✦ extra` aceso, e não havia onde tocar em nenhum dos dois.
- **Estudo citado, com a origem:** o cabeçalho de `src/reacoes.js`, escrito por
  esta casa: *"No 5e e no BG3 metade da tensão do combate mora aqui: o golpe
  vem, e você tem uma janela para aparar…"* — e a linha seguinte do mesmo
  comentário entrega a escolha ao sistema. **O módulo diagnostica o problema e
  depois causa-o.**
- **Experiência jogada:** joguei o Duelo inteiro (3 cliques, 1,2 s, 52 linhas)
  e abri uma luta de chave. Em nenhuma das duas eu **decidi** nada dentro de
  uma rodada. O que eu senti nas duas foi o mesmo: *estou a ler o relatório de
  uma luta que já aconteceu.*

**E é coerente com o que a pessoa já aprovou:** S1 diz, com todas as letras,
*"o motor não muda: a luta já é determinística e já está calculada; o que muda
é quando o jogador fica sabendo"*. Isto é o mesmo princípio aplicado à rodada
em vez de à queda.

**Peso: `pesado`.** Pela pergunta nova do `CLAUDE.md` — *o jogador teria de
reaprender?* — a resposta é **não** para as batidas 1 e 2 (ele ganha uma tela
melhor para o que já faz), mas é **sim** para a batida 3: a janela da reação é
um momento novo no meio do turno, e quem decide se o combate desta casa passa a
ter uma janela de decisão é a pessoa, não a mesa. **Proponho assim mesmo**,
porque o meu ofício é dizer o que o jogo devia ser.

**De que peças eu precisaria:** a **casa do tabuleiro** (não existe), a
**consequência** (existe) para o custo do passo e para a pergunta da reação, e
**uma peça que eu não sei nomear: a pergunta que expira.** Um controle que
aparece, oferece uma escolha, e **some sozinho se ninguém responder, sem punir
quem não respondeu**. Não é o *gesto que custa* (esse espera para sempre) nem
um véu (esse toma a tela). Se ela não existir, a batida 3 não existe. **Isso é
do `desenho`.**

### 5.2 · **O segundo, menor, e sem pergunta nenhuma para a pessoa**

**As moedas entram no cinturão do cabeçalho.** *(medido)* A barra de status já
mostra NIV, PV, PM, XP, o dia e o lugar — e **não** mostra o dinheiro. `◉ 240`
vive só dentro do painel Bolsa, e é o número que decide toda compra, todo
suborno, todo presente e toda obra. É montagem minha com o Selo que já existe,
não custa desenho novo, não muda fluxo nenhum, e o jogador deixa de ter de
abrir uma gaveta para saber se pode pagar. **Peso: `leve`.**

---

## 6 · O que eu devo ao `desenho`, em uma lista

**Peças que faltam e que eu peço por nome:**

1. **a casa do tabuleiro** — não entrou em D3, e é a família G inteira.
2. **a escolha (um entre N)** — não entrou em D3, e é a primeira coisa que quem
   chega encontra.
3. **a pergunta que expira** — nova, para a batida 3 da proposta 5.1.
4. **o Selo "mudou agora"** — pedido em D3, ainda por fazer; sem ele o degrau
   *realce* não existe, e eu acabo de me comprometer a não usar véu no lugar
   dele.

**Peças que já existem e que eu uso, com o `quando` dito acima:** Botão (Papel
Chamada / Gesto / Recuo, com Esperando × Impedido), A consequência, O gesto que
custa, Fechar, Selo de estado, Barra de medida, Véu (três pesos), os 11 glifos.

**E uma coisa que não é peça e que eu registo para o `backend`:** o orçamento de
movimento não é escrito de volta quando a luta não tem `economia`
*(`const novaEco = eco ? { ...eco, movM: sobra } : eco;`, e o literal da luta
da chave em `App.jsx:21199` não traz o campo)*. O jogador anda de graça e o
medidor fica em `9 de 9`. **Regra, não forma. Não é minha para consertar.**
