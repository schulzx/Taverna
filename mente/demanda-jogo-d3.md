<!-- ESTE ARQUIVO NÃO É FONTE DE VERDADE. -->

# A demanda do `jogo` (medida em D3 · 14/09)

**A verdade sobre a cara de cada coisa é `mente/formas.md`, e só ela.**
Isto aqui é a MEDIÇÃO que o `jogo` fez percorrendo as telas de verdade
durante D3, para que o `desenho` fabricasse as peças da biblioteca sem
inventar estado nem variante. Ela é insumo de **D4 · as formas escritas**,
que é quem transforma medição em forma declarada.

Guardada aqui porque nasceu no scratchpad da sessão, que morre com ela — e
538 linhas de lugar-e-linha contados à mão são caras demais para se
remedir. Quando D4 fechar, o que valer terá migrado para `formas.md`, e
este arquivo passa a ser só a prova de que os números de lá foram medidos
e não estimados.

**Duas afirmações de D1 que esta medição DERRUBOU** (estão no corpo, mas
ficam aqui em cima porque quem lê só o topo precisa delas):

- *"a grelha não é clicável"* — **errado**. Cada casa alcançável é
  `role="button" tabIndex=0` com `onMover` (`grade-de-batalha.jsx:512-517`).
  O clique funciona; o que falta é **forma** — o alvo é um
  `<rect fill="transparent">`.
- *"a maioria dos bloqueados continua clicável"* — **errado**. Dos 36
  botões com opacidade condicional, **33 têm `disabled`** e o navegador
  recusa de verdade. **O defeito é o silêncio, não o clique fantasma.**

---
# A lista de demanda — o que as telas de jogo precisam da biblioteca (D3)

De: `jogo` · 14/09 · para o `desenho`, que fabrica.

Eu não desenhei nada aqui. Percorri as telas — menu, mesa, combate, tabuleiro,
painéis laterais, criação, Noite/Torneio, Duelo, sala ao vivo — lendo o código e
jogando a campanha salva em `localhost:5173`, e escrevi o que **falta ter forma**.
Cada peça vem com o número de lugares reais que a pedem hoje. Onde eu não
consegui medir, está dito.

**A regra desta lista:** o número decide se a peça entra. Eu não peço peça por
gosto; eu peço peça que ≥2 lugares reais já improvisam à mão. Onde eu peço
desenho novo — estado que o jogo não tem —, está marcado **[NOVO]**, para o
`desenho` saber que ali ele está inventando, não espelhando.

---

## O achado que reordena as prioridades

D1 disse que `cursor: not-allowed` aparece 4 vezes e há 8 opacidades — e
concluiu que *"a maioria dos controles bloqueados continua clicável com cursor
de mão"*. **Medi e essa segunda metade está errada, e o erro importa.**

Dos 36 botões com opacidade condicional, **33 têm `disabled`** — o clique É
recusado pelo navegador. Só três ficam translúcidos e clicáveis
(`App.jsx:3040`, `painel-guilda.jsx:331`, `painel-talentos.jsx:330`), e nos três
a translucidez é *informação* ("ele está fora em serviço"), não bloqueio.

O defeito verdadeiro é outro, e é pior:

> **44 controles desativados no projeto. 13 dizem a razão só num `title`
> (invisível no dedo). 31 não dizem nada.** E os 5 valores de opacidade
> (0.4 ×13, 0.45 ×14, 0.5 ×5, 0.55 ×4, 0.6 ×1) significam a mesma coisa.

E o caso que prova: `bloqueado = carregando || !!rolagem` (`App.jsx:20376`)
governa **15** desses controles. Quer dizer que "o Mestre está escrevendo" e
"há um dado esperando você" apagam a barra de ação **com exatamente o mesmo
cinza**, e nenhuma das duas se explica. O `Agir →` (`App.jsx:21211`) chega a
carregar **três** razões na mesma cara: o Mestre pensando, o dado pendente, e o
campo vazio.

Então a peça de botão não precisa de "um estado desativado". Precisa de
**três**, e eles são diferentes de verdade — está na peça 1.

---

# AS PEÇAS

## 1 · O GESTO — o botão da casa

*(o que o jogador faz acontecer)*

**Lugares reais hoje: 234 controles** — 218 `<button>` crus contra 16 `<Botao>`
(6,8%). Descontando o que pertence às peças 2–5 e 8 (≈14 destrutivos, ≈11
saídas, ≈40 escolhas), sobram **≈165 gestos puros sem primitiva**.

- `src/App.jsx:21211` — `Agir →`, a ação principal do modo campanha
- `src/App.jsx:4330` — `ENTRAR NA NOITE →`, a mesma ação no modo Noite
- `src/App.jsx:4468` — `À ARENA`, a mesma ação no Duelo
- `src/App.jsx:21196` — `⚔ A PRÓXIMA LUTA`, a mesma ação no Torneio
- `src/painel-guilda.jsx` — 15 botões, **zero** primitivas
- `src/painel-talentos.jsx` — 12 botões, **zero** primitivas

Nove dos dez painéis usam zero `<Botao>`. E dos 16 `<Botao>` existentes, **14
são `primario`**: a variante secundária da primitiva praticamente não é usada —
os 218 crus *são* o secundário, escrito à mão 218 vezes.

### Os estados que ela precisa ter

| estado | existe hoje? | onde se prova |
|---|---|---|
| normal | sim | `ui.jsx:19` |
| pressionado / ativo (o botão que está ligado) | sim, em 12 gramáticas diferentes | `App.jsx:21096` (fundo âmbar), `:21100` (fundo violeta), `:3444` (violeta + borda), `:1937` (âmbar + peso 700) |
| **recusado com razão** — cinza, e a razão legível ao lado, sem hover | **NÃO** [NOVO] | os 13 que hoje escondem a razão em `title`: `App.jsx:1425, 2218, 2462, 3365, 3441, 20409, 20690, 20746, 20750, 21108, 21117`, `painel-diplomacia.jsx:111`, `painel-ficha.jsx:122` |
| **esperando** — "o Mestre está escrevendo", "há um dado na mesa" | **NÃO** [NOVO] | os 15 `disabled={bloqueado}`; hoje idênticos ao recusado permanente |
| recusado e mudo (sem razão possível) | sim, mas indistinguível dos dois acima | os 31 `disabled` sem `title` |
| **em foco** | **NÃO — está apagado de propósito** [NOVO] | `:focus-visible` tem **zero** ocorrências no projeto; há **17** `outline-none`/`outline:"none"` (14 campos de texto, o tabuleiro inteiro, 2 painéis) |
| perigoso | ver peça 2 |
| carregando (o próprio botão esperando) | **NÃO** | hoje a espera vive numa linha separada do log (`App.jsx:20492`), longe do botão que a causou |

**O que eu peço, em uma frase:** *uma peça de botão em que "não pode agora"
seja um lugar onde a razão cabe*, não um valor de opacidade. Se a forma não
tiver onde escrever "você ainda não escreveu nada" ou "o Mestre está
respondendo", os 31 mudos vão continuar mudos depois da biblioteca.

### As variantes

- **peso:** chamada (a ação principal da tela) · gesto (o comum) · recuo
  (voltar/cancelar — 6 lugares, `App.jsx:1505, 4063, 4327, 4467, 4505, 4526`,
  já em 3 formas)
- **tamanho:** dois, não mais. Hoje são **cinco** (`text-lg`, `text-sm`,
  `text-xs`, `text-[11px]`, `text-[10px]`, `text-[9px]`) e o que decide qual
  usar é o acaso da linha em que o botão nasceu.
- **com glifo / sem glifo / só glifo** — o "só glifo" é um caso à parte e está
  na peça 9.
- **largura:** cabe no conteúdo · ocupa a linha (há 20+ `w-full`/`flex-1`)

### Onde ela é o momento

**A chamada é o momento, e hoje ela encolhe quando mais importa.** A ação
principal do jogo — escrever o que você faz e mandar — é
`<Botao primario pequeno>Agir →</Botao>`: **mono de 12px, `px-3 py-1.5`**. A
mesma ação, no Duelo e na Noite, é uma faixa `tv-display` de 18px ocupando a
largura inteira. O modo "Uma Vida" é o modo default absoluto da casa e tem a
**menor** chamada do jogo inteiro. Isto é meu, não do `desenho`: eu peço que a
variante *chamada* exista com peso visual suficiente para ser a última coisa
que o olho encontra antes de o turno acontecer — e que seja a mesma nos quatro
modos. (Está na pauta como item da pessoa, `pauta-desenho.md:59`; a peça é
pré-requisito dele.)

---

## 2 · O GESTO QUE CUSTA — o destrutivo

*(o que não volta atrás)*

**Lugares reais hoje: 14** ações de perda irreversível, em 5 arquivos.

- `src/App.jsx:2541` — remover um companheiro do grupo (**`#fff` sobre
  `T.danger` = 3,42:1, reprova em WCAG AA**; verificado)
- `src/painel-guilda.jsx:339` — expulsar da guilda
- `src/painel-talentos.jsx:111` e `:416` — redistribuir atributos / tudo
  (`#1A0F0D`, 5,48:1)
- `src/painel-ascensao.jsx:72` e `:75` — encarar a prova / abandonar o rito
- `src/App.jsx:4615` — `Nova campanha`, que **substitui o save**
- `src/App.jsx:20750` — sair da masmorra ("o resto fica para trás")
- `src/App.jsx:1588` — abandonar contrato · `:1729` — recusar petição
- `src/painel-diario.jsx:107` — dar a missão por perdida
- `src/App.jsx:4707` — desfazer importação

**Três tintas de texto sobre vermelho, duas inventadas na hora, e a ilegível
está no único botão que apaga alguém.** `T.onAccent` sobre `danger` dá 5,34:1
e resolve — é correção de acessibilidade, não de gosto.

### Os estados

- **armado** — o gesto que ainda não destruiu (é o que se vê 99% do tempo)
- **confirmando** — existe em 3 dos 14 (`App.jsx:2537`,
  `painel-talentos.jsx:110` e `:415`), sempre como um bloco inline improvisado
  com borda vermelha. **Onze não confirmam nada.**
- **[NOVO] o preço escrito** — a lei da casa é *o veredito antes do clique*, e
  aqui ela está quebrada em 11 lugares. A peça precisa de um lugar para "o que
  se perde", visível, não em `title`.
- recusado com razão (`podeRespec` falso) — hoje: opacidade 0.45, sem razão

### A variante que eu peço, e é desenho novo

**[NOVO] o destrutivo de duas etapas numa peça só.** Hoje o "clica → aparece
uma caixinha vermelha ao lado → clica de novo" é remontado à mão três vezes,
com três larguras. Eu não peço um modal: peço que a própria peça saiba virar
pergunta no lugar, porque um modal para "remover Brann do grupo" é caro demais
e é justamente por isso que onze ações não têm nenhuma proteção.

### Onde ela é o momento

**`Nova campanha` é a coisa mais cara do jogo e está protegida pelo texto mais
distante.** O aviso *"Começar uma nova campanha substitui a anterior neste
dispositivo"* é rodapé no fim da página (`App.jsx:4714`); o botão que substitui
está em `:4615`, longe dali. Eu preciso que a peça carregue o aviso **dentro**
dela — é isso, e não a cor, que faz o destrutivo ser destrutivo.

---

## 3 · A SAÍDA — o fechar

*(o gesto de sair de onde se entrou)*

**Lugares reais hoje: 11 controles de fechar, em 8 formas visuais e 5
tamanhos.** Medido.

- `src/App.jsx:1840` — `✕` nu, `text-lg`, sem borda
- `src/App.jsx:3026` — `✕` nu, `text-[10px]`, sem borda
- `src/App.jsx:3338` — `✕` nu, `text-sm`, sem borda
- `src/App.jsx:20545` — `✕` nu, `text-[10px]`
- `src/App.jsx:20603` e `:20613` — `✕` em círculo de 20px com fundo `T.line`
- `src/App.jsx:2806` — `✕` em retângulo com borda
- `src/painel-heroismo.jsx:68` — `✕` nu, `text-xs`
- `src/painel-guilda.jsx:131` — `✕` com borda, `py-1`
- `src/carta-taro.jsx:190` — botão âmbar de 48px escrito `Fechar`
- `src/App.jsx:649` e `:21349` — `<Botao primario pequeno>Fechar</Botao>`

### O defeito que só aparece quando se lista tudo junto

**`✕` significa duas coisas diferentes no mesmo jogo.** Em
`painel-guilda.jsx:339` o `✕` **expulsa um membro da guilda**, e em
`App.jsx:2534` o `✕ remover` **tira alguém do grupo**. Nos outros nove lugares
o mesmo glifo só fecha um painel. Uma ação, uma forma — e aqui é o inverso:
**duas ações, uma forma**, sendo uma delas irreversível. O `✕` tem de ser da
saída e de mais nada; o destrutivo pede o seu próprio glifo (peça 2).

### Os estados

- normal · pressionado
- **[NOVO] em foco** — é o controle mais óbvio de se alcançar por teclado, e
  hoje nenhum deles tem anel de foco
- **[NOVO] área de toque** — quatro dos onze são `✕` de ~10px sem padding
  vertical. No telefone não se acerta.

### As variantes

- **discreta** (canto de painel lateral, `text-[10px]`) · **franca** (canto de
  sobreposição) · **declarada** (`Fechar` escrito, para a cerimônia que
  merece um botão de verdade)

### Onde ela é o momento

Não é. A saída é a única peça desta lista que **não** deve ser momento nenhum —
ela é a porta, e uma porta que chama atenção rouba a cena de quem está dentro.
O que eu preciso dela é que seja **sempre encontrável no mesmo lugar**, e é por
isso que ela importa: hoje o jogador descobre caso a caso se sai clicando fora,
num `✕` de 10px ou num botão âmbar de 48px.

---

## 4 · O VÉU — a sobreposição

*(o que toma a tela e faz o resto esperar)*

**Lugares reais hoje: 15**, medidos por `fixed inset-0`:
`App.jsx:357, 460, 512, 616, 691, 769, 875, 988, 1836, 21243, 21270, 21300,
21338`, `carta-taro.jsx:187`, `grade-de-batalha.jsx:581`.

**Quatro regras de fecho diferentes, e `Escape` não fecha nenhuma** (há 6
`onKeyDown` no `src/` inteiro, todos `Enter`). Confirmei uma a uma:

| como se sai | quantas |
|---|---|
| clique no fundo **e** botão | 3 (`App.jsx:616`, `carta-taro:187`, `grade:581`) |
| só um botão dentro | 6 |
| só o fundo | 1 (`App.jsx:1836`) |
| **só depois de decidir** (sem saída) | 5 (`:357` morte, `:875` recalibragem, `:21243/:21270/:21300`) |

E **cinco tintas de fundo diferentes** para a mesma ideia de "o mundo atrás
está pausado": `rgba(6,4,10,.94)`, `rgba(8,6,14,.85)`, `.88`, `.9`, `.92`,
`.94`, `rgba(0,0,0,.45)`, `rgba(0,0,0,.6)` — oito valores, quatro desfoques
(3, 4, 5, 6px) e três sem desfoque nenhum.

### Os estados

- entrando / saindo (hoje: `tv-fade`, 0.5s, e **sem saída por
  `prefers-reduced-motion`** — só 3 das 13 animações têm)
- **[NOVO] sem saída** — a sobreposição que exige decisão (a morte, a
  recalibragem) precisa **parecer** diferente da que se pode dispensar. Hoje
  são iguais e o jogador procura um `✕` que não existe.
- rolando por dentro (7 das 15 têm conteúdo maior que a tela)

### As variantes

- **peso do véu:** leve (o painel que só cobre) · pesado (a cerimônia) ·
  **[NOVO] sem retorno**
- **tamanho da moldura:** `max-w-sm` até `max-w-3xl` — hoje são **seis**
  larguras diferentes, sem regra

### Onde ela é o momento

**Aqui é onde o jogo inteiro acerta uma vez e erra dez, e é a coisa mais
importante que eu tenho a dizer nesta lista.** O modal do dado
(`App.jsx:512`) é o único lugar da sessão em que se sente que se está jogando:
escurece a tela, o d20 treme, para, e só então aparece `5 + 2 = 7` e "Falha".
O tempo entre o número e o veredito é o jogo.

E ao lado dele, com o mesmo mecanismo disponível: **a conclusão da primeira
missão da campanha é a quarta de seis pílulas cinzentas do mesmo tamanho** no
log (`App.jsx:2975` — `px-3 py-1.5 rounded-full`, `T.panelSoft`,
`T.violetSoft`). Conquista desbloqueada, achado raro e o nascimento de um
sexto painel: todos a mesma pílula cinzenta.

Então o que eu peço do `desenho` não é "um modal". É **uma escala de
cerimônia**: o véu precisa de uma variante que diga *isto foi importante*
sem custar um clique ao jogador — porque um modal por conquista seria pior que
o silêncio. É a peça de maior risco de desenho da lista e é onde eu quero
desenhar junto, não receber pronto.

---

## 5 · O SELO — o estado que se lê sem clicar

*(a etiqueta que diz o que uma coisa é agora)*

**Lugares reais hoje: 73** `<span>` inline, arredondado, mono pequeno, com cor
própria — em **9 arquivos**: `App.jsx` 47, `painel-ficha` 6, `painel-guilda` 5,
`painel-ascensao` 4, `painel-mapa` 4, `painel-diario` 2, `painel-diplomacia` 2,
`grade-de-batalha` 2, `painel-talentos` 1.

- `src/App.jsx:1263` — `VOCÊ`, fundo âmbar cheio
- `src/App.jsx:1387` — a relação com um NPC, só borda na cor da relação
- `src/App.jsx:1544-1546` — `+XP`, `fama`, `item`: três selos só-borda
- `src/App.jsx:717` — `+2 PV MÁX` na subida de nível, fundo âmbar a 7%
- `src/App.jsx:3077` — `⚔ ação` no combate, borda + opacidade 0.45 quando gasta
- `src/App.jsx:1224` — o **contador** na aba (número em círculo violeta)
- `src/grade-de-batalha.jsx:550` — o alcance da habilidade

**Quatro gramáticas de preenchimento**: só borda (50), fundo cheio (18), fundo
com alfa (3), só cor de texto (2). A mesma ideia — "este é o estado disto" —
com quatro caras, e o que decide qual usar é onde foi escrito.

### Os estados / tons

- **neutro** (informativo) · **bom** (`T.ok`) · **aviso** (`T.amber`) ·
  **ruim** (`T.danger`) · **especial** (`T.violet`)
- **gasto** — o recurso que existe mas já foi usado. Hoje: opacidade 0.45
  (`App.jsx:3077`), e é a única ocorrência da ideia no jogo inteiro.
- **[NOVO] novo / mudou agora** — não existe. É o que faz falta em toda a
  família de "o momento merece um momento": o XP que subiu, a fama que mudou,
  a relação que virou. O número muda e nada pisca.

### As variantes

- **com contador** (o `4` no canto da aba, `App.jsx:1224` — hoje único)
- **com glifo** (há ~20 com emoji embutido no texto, o que quebra no
  telefone/Windows — é caso de glifo traçado, como o menu já fez)
- **dois tamanhos**: o de 9px que vive dentro de um cartão e o de 10-11px que
  vive sozinho numa linha

### Onde ela é o momento

**O selo é o HUD que o jogo não tem.** 225 moedas ganhas em dois turnos e o
número só vive dentro do painel Bolsa — o jogador não vê o que tem sem ir
procurar. Assim que o selo existir como peça, o cinturão de estado do
cabeçalho (moedas, XP, tocha, hora) é montagem minha e não custa desenho novo.

---

## 6 · A MEDIDA — a barra

*(quanto ainda resta)*

**Lugares reais hoje: 18 barras**, e só **6** passam pela primitiva
(`BarraMini`, `ui.jsx:516`). **Três componentes de barra distintos**, dois
deles locais e privados do próprio arquivo:

- `src/ui.jsx:516` — `BarraMini`, a única compartilhada (5 usos:
  `App.jsx:1270, 1271, 1272, 3290, 21014`)
- `src/painel-ficha.jsx:90` — `Barra` local, com gradiente e variante `forte`
- `src/painel-guilda.jsx:28` — `Barra` local, sem rótulo
- e mais **12 barras escritas inteiramente à mão**: `App.jsx:936, 1283, 2366,
  2395, 3182, 3189, 20995`, `grade-de-batalha.jsx:362`,
  `painel-ascensao.jsx:138, 187`, `painel-codex.jsx:58`,
  `painel-diplomacia.jsx:62`, `painel-ficha.jsx:278, 524`, `painel-mapa.jsx:427`

Alturas: `h-1`, `h-1.5`, `h-2`, `h-full` dentro de trilhos de 4 a 10px. Cantos:
`rounded-full`, `rounded`, `rounded-sm`, e um sem canto. Transições: `700ms`,
`500ms`, e dez sem transição nenhuma.

### Os estados

- cheia · parcial · **baixa** (existe em 2 de 18: `BarraMini` com `corBaixa`, e
  `painel-diplomacia.jsx:62` com três faixas de cor) · vazia
- **[NOVO] o dano que acabou de acontecer** — a barra encolhe em 700ms e
  pronto. Não há rastro, não há número flutuante, não há nada que diga
  *quanto*. Este é o pedido que eu mais quero: em combate, a barra é o único
  lugar onde o golpe do inimigo vira coisa visível, e hoje ela só desliza.
- **[NOVO] ganho** (a barra de XP enchendo ao fim da missão) — não existe

### As variantes

- **com rótulo e números** (`PV 20/20`) · **nua** (dentro de um cartão apertado)
- **fina** (o anel de vida no tabuleiro, `grade-de-batalha.jsx:362`) ·
  **grossa** (o herói na barra de status)
- **segmentada** — não existe e eu não peço: só faz sentido se a regra tiver
  degraus, e não tem.

### Onde ela é o momento

**A barra de vida do herói é o único órgão do jogo que reage a dano, e é o
lugar onde "estou jogando" mora.** Já há `tv-agonia` pulsando vermelho abaixo
de ⅓ de vida (e **sem saída por `prefers-reduced-motion`** — eu reprovo isso
como está: pode ser a cena inteira pulsando para quem pediu menos movimento).
O que falta é o **golpe**: a queda da barra precisa ser legível como evento,
não como transição de CSS.

---

# AS QUE FALTAM (as que percorrer as telas mostrou, com o mesmo rigor)

## 7 · A CASA DO TABULEIRO — o quadrado clicável

*(onde eu posso pisar)*

**Lugares reais: 1 componente, 256 instâncias por combate**
(`grade-de-batalha.jsx:503-523`), e ele reaparece na versão ampliada
(`:586`) — **dois** lugares de montagem, mais o mapa do mundo
(`painel-mapa.jsx`) e a planta da cidade (`planta-cidade.jsx`), que resolvem o
mesmo problema — "esta região da tela é um alvo" — com desenho próprio.

### A correção que eu devo a D1

D1 escreveu que *"a grelha não é clicável"*. **Está errado.** Cada quadrado
alcançável é `role="button" tabIndex=0` com `onMover` e `onKeyDown`
(`grade-de-batalha.jsx:512-517`). O clique funciona. O que não existe é a
**forma**: o alvo é um `<rect fill="transparent">`, e a única pista de que ali
se pode clicar é um tracejado dourado em volta de uma área de 34px por casa.
Eu joguei três rodadas escrevendo "me aproximo" sem descobrir que bastava
clicar — e o problema não era o handler, era que **nada na tela diz que a casa
é um botão**. Isso muda o pedido: não é "torne clicável", é "dê forma ao que já
clica".

E há um agravante que eu quero registrado: a linha 519 é
`style={{ cursor: ..., outline: "none" }}`. **256 alvos focáveis por teclado
com o anel de foco explicitamente apagado.** Quem joga pelo teclado tabula
por 256 elementos invisíveis.

### Os estados

- **alcançável** (hoje: tracejado dourado coletivo, não por casa)
- **sob o cursor, com a rota e o custo** (hoje existe: `↳ 4,5 m até ali`, mas
  só no rato — `grade-de-batalha.jsx:543`. No dedo não há "passar por cima".)
- **ocupada** (por mim, por aliado, por inimigo — 3 cores)
- **na mira / na área da magia** (existe, tracejado roxo e vermelho)
- **fora de alcance** (hoje: escurecido)
- **[NOVO] em foco** — apagado de propósito, ver acima
- **[NOVO] pressionada / confirmando** — não existe. Clicar move
  imediatamente. Num tabuleiro com "sair de perto custa um golpe livre"
  (`:535`), mover sem confirmação é a lei do veredito antes do clique quebrada
  no lugar mais caro do jogo.

### As variantes

- **casa de combate** (1,5 m, 34px) · **região de mapa** (irregular) ·
  **lote de cidade**

### Onde ela é o momento

É o momento inteiro da Fase E. *"Vou até H20"* só existe se a casa tiver
endereço **e** forma. Eu não peço o endereço aqui (é regra, é do `backend`);
peço a **casa como peça**, com o custo visível antes do passo, nas duas mãos —
porque no telefone hoje não há hover, e portanto não há veredito nenhum.

---

## 8 · A ESCOLHA — uma entre muitas

*(escolher, e ver que escolheu)*

**Lugares reais hoje: ~40**, em **6 gramáticas diferentes**, quatro delas na
mesma tela de criação de personagem:

| gramática | onde | quantos |
|---|---|---|
| cartão grande, borda âmbar + bolinha | `ui.jsx:389` `CartaoDeEscolha` | 11, **todos na criação** |
| `<select>` nativo do sistema operacional | `App.jsx:1328, 1334, 1340, 1346, 2803` | 16 |
| pílula com fundo âmbar | `App.jsx:1937, 2557, 20848, 20914` | 14 (medidos por fundo condicional) |
| pílula com fundo violeta | `App.jsx:3130, 3366, 3444, 21100`, `painel-talentos.jsx:327` | — |
| aba com borda âmbar + fundo `panelSoft` | `App.jsx:1215`, `painel-ascensao.jsx:118` | — |
| stepper `−`/`+` | `App.jsx:3930/3933`, `painel-ficha.jsx:68` | 3 |

"Selecionado" é, hoje: ora borda âmbar, ora fundo âmbar, ora fundo violeta,
ora fundo `panelSoft`, ora fundo vermelho (`App.jsx:3265`, escolher alvo em
combate), ora só uma bolinha, ora `fontWeight: 700`.

### Os estados

- não escolhido · **escolhido** · **desabilitado com razão** (o molde que o
  nível não permite) · **em foco** [NOVO] · **recém-escolhido** [NOVO]

### As variantes

- **cartão** (quando a opção precisa de descrição) · **pílula** (quando o nome
  basta) · **aba** (quando muda a tela toda) · **contador** (quando é número)
- **um só** / **vários** — a distinção existe no jogo (alvos de combate são
  vários, `App.jsx:3263`) e não existe na forma

### Onde ela é o momento

A criação de personagem é a primeira meia hora de quem chega, e passa por
**quatro** gramáticas de escolha em quatro rolagens de tela. Não é momento de
espetáculo; é o momento em que o jogador aprende a língua do jogo, e ele está
aprendendo quatro.

---

## 9 · O CONTROLE SEM RÓTULO — e o pedido que resolve os dois

*(o botão cujo significado só existe no `title`)*

**Lugares reais hoje: 15 botões sem uma única letra de rótulo** — 6 com
`title`, **9 completamente mudos**. E **105 `title=` no projeto inteiro**,
dos quais os que carregam veredito são invisíveis no telefone.

- `src/App.jsx:20409` — `⛺`, `title="Montar acampamento"`. Clicado a meio de
  uma luta do torneio, **terminou a luta**, sem confirmação e sem dizer o que
  aconteceu ao adversário. A ação mais irreversível da sessão atrás do
  controle mais mudo.
- `src/App.jsx:20410` — `🎲`, um **interruptor** cujo estado só existe no
  `title` (`"Rolagens de combate: visíveis"` / `"ocultas"`). Cliquei, o emoji
  não mudou, e não fiquei sabendo se liguei ou desliguei.
- `src/App.jsx:20411` — `📜`, `title="Gerar crônica"` — e gerar crônica
  **gasta uma chamada ao Mestre**.
- `src/App.jsx:20396` — a caneca, `title="Início"` (sai do jogo)
- `src/grade-de-batalha.jsx:569` — `⤢ ampliar`, `title="Abrir o campo em tela
  cheia"` — e o que abre **não é tela cheia**
- `src/App.jsx:583` — o botão **Destino**, cujo preço verdadeiro (*"o segundo
  dado vale — mesmo se for pior"*) está inteiro no `title`. Cliquei sem saber
  que podia piorar.

### O pedido, e ele é um só para as duas famílias

**[NOVO] `A CONSEQUÊNCIA` — uma peça que prende a um controle a frase do que
vai acontecer, visível sem hover, nas duas plataformas.**

Hoje o jogo tem exatamente um lugar para isso e é o `title`, que é um atributo
de rato. É por causa dele que:
- 13 controles bloqueados não dizem por quê,
- o preço do Destino é invisível no telefone,
- um interruptor não tem estado legível,
- e `⛺` termina uma luta sem avisar.

Eu não sei se a forma disso é um subtítulo dentro do botão, uma linha abaixo,
um balão que também abre no toque, ou três coisas. **Isso é do `desenho`.** O
que eu preciso é que a peça exista, porque enquanto ela não existir a lei
*"o veredito antes do clique"* não tem onde morar, e ela é a lei que separa
este jogo de um formulário.

Os **9 botões mudos** e o interruptor `🎲` são o mesmo pedido pelo outro lado:
**o glifo precisa de rótulo, e o interruptor precisa de estado visível.** A
peça de botão (1) resolve isso se a variante "só glifo" for a exceção
declarada e não o padrão — e se ela obrigar o rótulo a existir em algum lugar
que o dedo alcança.

---

# O RESUMO, para o `desenho` priorizar

| # | peça | lugares reais | o estado que falta hoje |
|---|---|---|---|
| 1 | **o gesto** (botão) | **234** (218 crus) | recusado **com razão**; esperando; foco |
| 5 | **o selo** (estado) | **73** em 9 arquivos | "mudou agora" |
| 6 | **a medida** (barra) | **18** (só 6 na primitiva) | o dano visível; o ganho |
| 4 | **o véu** (sobreposição) | **15** (4 regras de fecho) | "sem retorno"; a escala de cerimônia |
| 9 | **o controle sem rótulo** | **15** (9 mudos) + 105 `title` | **a consequência visível** |
| 2 | **o gesto que custa** | **14** (11 sem confirmação) | o preço escrito; a confirmação na peça |
| 3 | **a saída** (fechar) | **11** em 8 formas | foco; área de toque |
| 8 | **a escolha** | **~40** em 6 gramáticas | foco; "recém-escolhido" |
| 7 | **a casa do tabuleiro** | 2 montagens × 256 | forma de alvo; foco (apagado); confirmação |

**Transversal a todas: o foco.** `:focus-visible` = 0 ocorrências;
`outline-none` = 17. Nenhuma peça desta lista pode sair da biblioteca sem
estado de foco, e é desenho novo em todas.
