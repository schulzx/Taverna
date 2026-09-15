# O diário do desenho

Um registro por ciclo da **segunda mente** — a do visual. O mais recente no
topo. O diário do sistema é `mente/diario.md`; os dois aparecem juntos na
página, separados pela fila a que pertencem.

Formato:

```
## dd/mm hh:mm · vX.YYY · <título do item> · commit <hash>
- **estado inicial:** suítes, o bastão do App.jsx, o que a pauta tinha
- **jogo / desenho:** o que a dupla decidiu, e onde ficou escrito
- **aprendiz / testes:** o que cada um construiu, em uma linha cada
- **o Figma:** o que entrou na biblioteca
- **a prova:** o número que sustenta a mudança (contraste, cliques, tempo)
- **decisões médias tomadas:** cada uma com o motivo
- **o que ficou:** o que não coube, o que foi para "pesado"
```

---

## 15/09 13:55 · v9.254 · E1 · a tela desenhada antes de existir · **a Fase E abre** · commit `PENDENTE`

A Fase D fechou a casa; **E1 é a primeira tela que esta mesa desenha inteira**,
e a primeira do projeto a nascer no Figma antes de existir em código. Nenhum
`.jsx`, `.js` ou `.mjs` foi tocado o ciclo inteiro — **E1 é desenho, E3 é que
constrói**, e essa fronteira foi a única regra que não se negociou.

- **estado inicial:** `.claude/ciclo-desenho-em-curso` não existia — criei-a.
  `.claude/ciclo-em-curso` era do `orquestrador` na **Fase X** (o motor de
  combate), na mesma árvore, e **não a toquei**. `.claude/app-jsx` **não
  existia e não foi criado**: E1 lê o `App.jsx` e não escreve nele, e o bastão
  ficou livre para a outra mente o ciclo inteiro. Suítes verdes à entrada:
  **183/183 · 11/11 varredores**.
- **jogo / desenho:** chamados **juntos, no mesmo turno, os dois em primeiro
  plano**, e depois **uma segunda rodada** — porque a primeira voltou com duas
  geometrias diferentes para a mesma tela, e duas geometrias é exatamente o
  defeito que esta mesa existe para impedir.

### O fato de hoje que mudou o conteúdo da tela

A mente do sistema descobriu, jogando (D5), que **`Atacar` não ataca**: ele faz
`setEntrada("Ataco ")`. Dos 20 botões de `Ações`, os 12 de cima só digitam, e
**nenhum dos 8 que entram no motor é de combate**. A Fase X já está a corrigi-lo
(`c3f4fd3`: X1 mede, **X2 faz o botão chamar o motor**). Então E1 **não desenhou
a tela do jogo de hoje — desenhou a do jogo que X2 vai entregar**: seis verbos
que disparam a ação, cada um com o preço escrito antes do clique. O texto livre
fica, e muda de emprego: *a frase deixa de ser a sintaxe obrigatória e vira o
tempero*.

### O que se soube ao medir, e que valeu o ciclo

- **O campo não é 16×16 — são dez plantas** (`grid.js:168-261`), de 7×18 a
  18×12, com a proporção a variar de **0,39** a **1,50**. Todo o briefing desta
  fase falava de "o 16×16". **Qualquer desenho que resolvesse uma planta
  quebraria em duas outras**, e a conta inteira foi refeita contra as dez.
- **Os 429 px não são altura — são arquitetura.** `PainelCombate`
  (`App.jsx:20510`) é montado **dentro** do rolador do log (`:20459`), depois de
  todas as mensagens: o tabuleiro é **filho do log** e por construção abre no
  fim dele. Nenhum ajuste de altura resolve isto. **É a condição de entrada de
  E3**, e estava a ser tratado como um número de CSS.
- **A gramática do endereço já existe** — `coordenadas.js:151`,
  `LETRAS_DA_GRADE` + `gradeDe()`, A1 no canto superior esquerdo. **Nenhuma
  tabela nova nasce em E2**: duas tabelas de letras no mesmo jogo seria a doença
  da casa um andar abaixo.
- **`⤢ ampliar` já não mente** (D5 derrubou o fato em 15/09), e o briefing desta
  etapa repetia-o. O `desenho` recusou-se a herdá-lo e foi conferir na fonte —
  **herdar engano é o erro**. O que continua quebrado no ampliar é outra coisa:
  o **veredito**, que chega depois, no log.

- **o Figma:** arquivo `Taverna — biblioteca` (`e5wJUzInAssoebx5npssKc`),
  **ampliado, nunca duplicado**. O `jogo` criou a página **`A batalha`**
  (`30:12`) com cinco quadros: `1280×860 · a luta` (`31:2`), `375×812 · a luta
  no telefone` (`40:447`), `a entrada` (`51:1141`), `a saída` (`51:1315`) e `o
  veredito antes do clique — Atacar armado` (`51:1489`). O `desenho` fabricou
  **quatro peças**, uma página cada: **A régua** (`30:11`, 4 variantes), **A
  vez** (`30:163`, 12), **A ficha curta** (`31:137`, 6) e **A pergunta que
  expira** (`31:518`, 4). Zero hex solto, tudo ligado a variável. *(Conferido
  por mim, por nó e não pela lista — `get_metadata` sem `nodeId` continua a
  mentir; e conferi também a olho, porque `get_screenshot` já serviu cache a
  esta mesa.)*

### A segunda rodada, e é por ela que este ciclo vale

A primeira rodada voltou com **duas geometrias para a mesma tela** — o `jogo`
compôs uma pilha de largura inteira; o `desenho` mediu os três arranjos
possíveis contra as dez plantas e recomendou duas colunas. **Duas geometrias é
exatamente o defeito que esta mesa existe para impedir**, e por isso devolvi a
etapa aos dois em vez de a fechar. Também não a fechei com o bloqueador que o
`jogo` tinha nomeado: **`A casa` era 148×48 e não ladrilhava** — os quadros
montavam-na dentro de um recorte de 48, deslocada −50 px. *Remendo numa peça
vira remendo no código de E3.*

| arranjo | altura útil do campo | plantas inteiras |
|---|---|---|
| pilha de largura inteira | 574 px | **1 de 10** — e a 18×12 falhava **por 2 px** |
| verbos e tira à direita | 710 px | 6 de 10 |
| **duas colunas** | campo **888 × 828** | **9 de 10** |

**O `jogo` cedeu, e escreveu porquê em vez de inventar um argumento:** *"não
tenho razão de momento que valha nove plantas"*. O arranjo novo fecha em
1280×860 exatos, **1248 dos 1280 px são conteúdo**, e o campo mostra a floresta
16×16 **inteira, as 256 casas**. De brinde, o `jogo` tirou o **cabeçalho** — a
sua própria lei a cobrar-lhe: *nada nesta tela diz que ela é uma tela*, e a
marca mais o `✓ salvo` custavam 48 px de altura ao campo. No telefone os mesmos
44 px compraram **uma linha inteira**: de 70 para **77 casas**.

E o arranjo pagou **duas dívidas de lado**, que é o sinal de que era o certo: a
lateral mede **344** e *A pergunta que expira* mede **344** — encaixa exato, e
em 1280 a reação cresce na lateral **sem tocar no campo**; e a linha de *A vez*,
que não cabia numa faixa de 375, cabe com folga na lateral — **a lista vertical
carrega nome, iniciativa e estado, que o selo compacto não carregava**.

**O bloqueador tinha causa pior do que o `jogo` viu, e a ironia ficou escrita.**
`A casa` media 148×48 porque *o custo* e *o preço* eram **duas linhas de legenda
de largura inteira por baixo do quadrado** — 73 px de conteúdo numa caixa de 48.
Hoje as sete variantes são **48×48 exatos**, com `a prova do ladrilho` na
página: 24 instâncias reais a passo de 48, sem um pixel de folga. E a ironia:
***`formas.md` sempre mandou "o custo escrito DENTRO da casa", e a peça de D4
escreveu-o fora*** — a discordância não era entre as duas mesas, era entre o
`desenho` e o que ele próprio tinha escrito. *(O 148 **não** virou variante, e é
recusa com motivo: *"custa um golpe livre"* são ~108 px em mono 9 e não cabem em
48 de lado nenhum; uma variante larga só devolveria o ladrilho que não ladrilha.
O preço é `A Consequência`, que já existia.)*

O `desenho` pagou junto os outros pedidos: **`Botao` passou a ter uma altura por
`Papel`×`Tamanho`** (a linha da razão reservada nos quatro estados — e não é
espaço morto: é onde a Consequência do preço se senta); **`Barra de medida`
estica e encolhe** (o trilho vai de 285 px a 48 entre 359 e 120 de caixa, porque
*quem absorve é o trilho, o único elemento cuja largura não carrega
informação*); **`A vez` ganhou o eixo `Forma`** — e o número é brutal: **oito
combatentes pedem 2.560 px em Linha e 472 px em Selo**; e **`A marca de borda`
nasceu** (`53:43`, 8 variantes), carregando **o endereço**, de modo que o jogador
lê `K14`, sabe para onde rolar, e pode dizer *"vou até K14"* **sem nunca ter
visto a casa**. Círculo é aliado e losango é inimigo — **as mesmas duas formas
do Selo de `A vez`**, de propósito.

### A discordância: os dois cederam ao mesmo tempo, e quem desempatou fui eu

**É a coisa mais rara que esta mesa produziu até hoje.** O `jogo` abriu que a
borda por casa e o contorno da união diziam a mesma coisa duas vezes; o `desenho`
respondeu com a régua. E na segunda rodada **cada um adotou o argumento do outro
e abandonou o seu**: o `jogo` passou a defender que **a borda fica** (o 1.4.11
exige que o indicador identifique **o componente**, e o componente é a casa, não
o conjunto); o `desenho`, que **a borda sai** (com o custo escrito dentro, a casa
já está marcada **por texto**, que não é cor e não depende de 1.4.11 de todo).
Dois lados trocados continuam a ser **duas formas para a mesma ação**, e por isso
**desempatei**, com um motivo que nenhum dos dois usou:

> ***Um canal que desaparece por regra não pode ser o único canal.*** O custo
> escrito **sai sozinho** quando a casa encolhe — a regra do próprio `desenho`
> manda o número descer para a linha do veredito abaixo de 26 px de lado, e some
> de vez no nível de leitura. Sem a borda, essas casas ficam **sem marca
> individual nenhuma**. E o texto que carregaria o peso mede **4,47:1**, que
> reprova o AA por 0,03. **A borda fica.**

**E as três condições do `desenho` entram na mesma, porque são verdadeiras
independentemente da decisão — e uma delas achou um defeito vivo:** o contorno da
mira usa `opacidade 0.6`, e **violeta a 60% sobre `bg` dá 2,68:1 e REPROVA o
WCAG 1.4.11** (`grade-de-batalha.jsx:433`); o âmbar a 60% dá 3,85:1 e passa. **A
borda por casa era o que vinha salvando a situação sem ninguém saber** — o que é,
por si só, o argumento mais forte para a manter. E a terceira condição amarra a
fase inteira: o traço mede `0.045` em unidades de casa, o que dá **2,16 px a 48
px de casa e 1,07 px a 23,8** — um fio. ***A união só pode dizer alguma coisa
porque a casa passou a ser 48: a régua do contorno e o piso de 48 px são a mesma
decisão.***

Sobrevive do primeiro lado do `jogo` uma regra para durar: contorno e borda **não
podem ter o mesmo ritmo**, ou as casas da beirada ganham linha dupla —
**tracejado a 60% contra cheia a 55%**. E fica a inversão escrita: **quem passa a
régua do WCAG é a borda, não o contorno** — se alguém um dia a apagar para
"limpar o tabuleiro", apaga o que passa.

### A dívida de D4 foi paga, e o motivo é que a razão dela expirou

**A pergunta que expira** não foi fabricada em D4 de propósito: *"é o coração de
uma proposta `pesado` que espera a pessoa, e peça feita para decisão não tomada é
trabalho inventado"*. A pessoa **aprovou a Fase K em 15/09** e devolveu a forma à
mesa. **A condição da dívida caiu; manter a dívida passou a ser o erro** — e a
peça nasce com a trava K2 escrita dentro dela: *não responder é uma resposta, e o
de sempre acontece*.

- **a prova:**
  - **1232 de 1280 px são jogo (96,3%)**, contra os **560 px à esquerda com mais
    de metade da tela preta** de hoje.
  - **A casa passa de 23,8–36,6 px para 48 px** — e **nenhum dos quatro tamanhos
    de hoje chega aos 44** que a WCAG 2.5.5 (AAA), a HIG da Apple e o Material
    pedem. 48 é o menor número que passa nas três.
  - **No telefone, 70 casas sempre na tela**, sempre as certas — porque a câmara
    enquadra o herói na **área livre**, acima do que o polegar tapa. E **76 px
    voltam de graça** por a tela de batalha não ter trilho de abas: uma casa e
    meia.
  - Contrastes: `ink`/`bg` **15,31** · `inkDim`/`bg` **6,62** · `amberSoft`/`bg`
    **12,40** · `amber`/`bg` **9,00** · `onAccent`/`danger` **5,34**.
  - **Três buracos declarados com número, porque buraco calado é mentira:**
    `inkDim` sobre casa acesa dá **4,47:1** e reprova o AA **por 0,03** (a regra
    escrita é usar `amberSoft` ou `ink` dentro da casa); a moldura apagada
    `line`/`bg` dá **1,38:1** (a palavra é que carrega o estado); e o fundo do
    tabuleiro `#141020` está a **1,04:1** de `T.bg` — **literal solto que a
    catraca conta e que quebra o vão do anel de foco**. Trocá-lo por `T.bg` paga
    os dois de uma vez, e é item barato para E3.

### decisões médias tomadas (a segunda lei da mesa: decidir, e escrever o porquê)

- **A entrada é automática; a saída é confirmada.** Automática porque **um gesto
  pode ser recusado**, e quem recusa fica no estado medido (tabuleiro 429 px
  abaixo da borda, `scrollTop = 0` de 1129). Confirmada porque **o `⛺` já
  encerrou uma luta por engano**: durante a luta **não há porta nenhuma**; no fim
  há **uma**, larga, onde antes não havia nada.
- **Quem cede é a janela, não o alvo.** 48 px não dobra; o tabuleiro passa a ser
  uma **janela sobre um campo** que rola e arrasta. É a inversão exata do que lá
  está, onde o campo encolhe até caber e a casa fica com 27 px.
- **A câmara não persegue o inimigo longe** — a borda ganha a marca com o nome e
  a distância. *Arrancar o campo debaixo de quem está a planear é a coisa mais
  desorientadora que uma tela tática faz.* Uma exceção, e só uma: **se o golpe
  alcança o herói**, porque aí o que aconteceu é sobre ele.
- **A narração fica na tela.** A leitura literal do pedido — *"uma tela só com o
  grid"* — matava a prosa, que é a protagonista declarada da casa. Fica
  encolhida ao mínimo honesto: duas linhas no monitor, uma no telefone.
- **Nada nesta tela diz que ela é uma tela.** Sem título de modo, sem selo "em
  combate". *O jogador sabe que está numa luta porque a luta é o que está na
  tela* — é a lei de que o sistema não fala de si mesmo, aplicada a uma tela
  inteira.
- **O rótulo da iniciativa é `agora: Halvard`, não `ORDEM DE INICIATIVA`.** Se o
  trabalho da faixa é responder àquela pergunta, ela pode dizer a resposta.
- **A grelha é UM ponto de tabulação, não 256** (roving tabindex, padrão `grid`
  do WAI-ARIA), com o foco a entrar na casa do herói. E **a régua é
  `aria-hidden`**: o endereço vive no nome da casa, para quem ouve a tela ouvir
  `H20` e não duas listas de rótulos soltos.
- **A razão do `Botao` é a razão da RECUSA; o preço de uma ação que funciona é
  sempre `A Consequência`.** Foi uma discordância do `desenho` com o `desenho`,
  resolvida por escrito: as duas verdades coexistem na mesma tela (*"custa 2
  PM"* **e** *"o Mestre está a escrever"*), e dobrá-las numa fenda só obrigaria
  quem monta a escolher qual mostrar.

### O que ficou

- **Feio, e dito sem eufemismo:** um tabuleiro de 48 px num telefone de 375
  mostra **33% de um campo 16×16, e não há desenho que conserte isso** — a
  alternativa era encolher o alvo abaixo do piso de acessibilidade, e essa não é
  uma alternativa. O segundo nível de leitura ("ver o campo todo", onde **a casa
  não é alvo**) é um remendo honesto, e é um remendo.
- **Não coube:** a escala da Fase L (a régua saiu com fonte citada — HIG 11 pt,
  Material 11 sp —, mas a escala não foi construída); o eixo *Largura* do
  `Botao`, que leva o conjunto de 24 para 48 variantes e por isso ficou
  declarado e não pago; e o branco invisível que as peças de D3/D4 carregam na
  raiz (amostra de 3 em 3), que não pinta hoje e pinta no dia em que alguém ligar
  a visibilidade.
- **Não se soube:** se 48 px é o alvo **bom** ou só o mínimo — os três estudos
  dão o piso e nenhum diz qual é o bom num tabuleiro que se toca dezenas de vezes
  por luta; e **quanto deve durar a janela da pergunta que expira**, que é número
  de K1. E **a tela não foi jogada, porque ela não existe**: o par comparável só
  nasce em E3, e isso está escrito em vez de enfeitado.
- **Para a pessoa, três propostas ambiciosas** (a ambição é dever, e este ciclo
  entregou três): *o turno monta-se antes de acontecer* (encadear andar→atacar
  com o total a correr antes de pagar); *o tabuleiro conta o que o inimigo vai
  fazer* (telegrafia, ao modo do **Into the Breach**, Subset Games 2018); e *em
  combate, o texto deixa de ser o caminho da ação e passa a ser o caminho da
  fala* — **a única proposta desta fase que devolve quota ao Narrador em vez de
  lha cobrar**, e a quota acabou duas vezes nesta fase. As três estão em
  `mente/pauta-desenho.md`, com o risco de cada uma escrito pelo próprio autor.

---

## 15/09 12:10 · v9.252 · D5 · a catraca do desenho · **a Fase D fecha** · commit `73813da`

D1 mediu, D2 deu casa ao estilo, D3 fez a biblioteca e provou a leitura de
volta, D4 escreveu 30 formas. **Nada disso obriga ninguém a nada.** D5 é a
etapa que faz a Fase D valer **para sempre** em vez de valer hoje — e é a única
da fase que não melhora um pixel: ela impede que os outros quatro apodreçam no
primeiro ciclo distraído.

`testes/check-formas.mjs`, 585 linhas, **0,27 s**, **10 ok · 0 falhas no dia em
que nasceu**. Entra sozinho no `rodar-tudo.mjs`, que descobre `check-*.mjs` por
si — nenhuma linha a somar lá.

- **estado inicial:** `.claude/ciclo-desenho-em-curso` não existia — fila
  livre; criei-a. `.claude/ciclo-em-curso` era do `orquestrador` em **N1b**, na
  mesma árvore, e **não a toquei**. `.claude/app-jsx` **não existia e não foi
  criado**: D5 lê o `App.jsx` e não escreve nele — o bastão ficou livre para a
  outra mente o ciclo inteiro, e uma sabotagem que pedia o App foi trocada por
  `carta-taro.jsx` de propósito. Pauta de desenho: Fase D, 4 de 6.
- **jogo / desenho:** chamados **juntos, no mesmo turno, os dois em primeiro
  plano.** O `desenho` contou por script próprio e entregou a especificação
  executável — os regexes escritos, as tabelas de perdão prontas com motivo e
  data, e doze sabotagens. O `jogo` **jogou**: campanha `O Fio de Prata`, Brann
  nv 1, 7 turnos com o Narrador vivo, combate aberto, um dado rolado, um passo
  no tabuleiro — e, para D5c, **injetou `animation: none` nas 13 classes e
  jogou com elas ligadas**. Divergiram numa coisa, e ela está fechada por
  escrito em `mente/formas.md` com os dois lados (abaixo).
- **aprendiz / testes:** o `aprendiz` não foi chamado — D5 não constrói
  interface, e chamar uma mão para não a usar é ruído. O `testes` foi
  **emprestado da outra mente** e construiu o varredor a partir da
  especificação, rodou as sabotagens e voltou com duas discordâncias, as duas
  aceitas.
- **o Figma:** nada entrou, e é de propósito — D5 não desenha peça. A
  biblioteca continua nas 13 páginas de D4.

### A medição, e ela reproduz D1 byte a byte

O `desenho` mediu com script próprio antes de olhar o número de D1; o `testes`
mediu de novo, com código independente, antes de comparar com a especificação.
**Os três bateram.**

| o que D1 disse (14/09) | o que D5 mede (15/09) |
|---|---|
| 93 no `App.jsx` (40 hex + 53 rgba) | **93** — 40 e 53, os mesmos dois números |
| 242 nos arquivos de tela | **242**, na soma dos 11 arquivos |
| 67 "já são `T`" | **67** no recorte de D1 (24 hex + 43 rgba) |
| ~80 com a folha (corrigido por D2) | **80** exatos |
| 13 classes de animação, 3 com saída | **13 e 3** |
| 78 em módulos de dado | **77** — a única divergência |

**A divergência fica escrita em vez de explicada.** Falta um literal nos
módulos de dado contra a contagem de D1, e não se achou o fantasma; pode ser
arredondamento de D1 ou um literal que saiu num commit entre 14/09 e hoje.
Inventar a explicação seria pior que registrar o buraco.

O total do escopo inteiro (`src/**` + `index.html` + `api/*.js`) é **332**
literais em **17 arquivos**. `api/*.js` mede **0** — e não recebe entrada na
tabela, de propósito: **arquivo sem entrada tem teto zero**, e é assim que a
primeira cor solta de lá fica vermelha no dia em que nasce.

### Os três dentes, e o que cada um pega que os outros não pegam

- **D5a — quantidade.** A cor **nova**, de qualquer forma e qualquer valor,
  inclusive uma que não existe em lugar nenhum do projeto. É o único dente que
  segura o **pergaminho** e o **dado de jogo**, que não têm uma única cor de
  `T`. Teto por arquivo: **332**.
- **D5b — qualidade.** A cor **duplicada**, mesmo quando a contagem não mexe: é
  o único que morde a troca 1-por-1 de um hex de pergaminho por `#E8A33D`, onde
  D5a fica cego porque o total continua 41. **80**.
- **D5c — outro eixo por completo.** Movimento sem saída no
  `prefers-reduced-motion`. Não partilha uma linha de código com os outros dois.
  **13 classes, 3 com saída, 10 perdoadas e datadas.**

A sobreposição é declarada: colar `#E8A33D` novo no `App.jsx` dispara **os
dois** primeiros. Não é decoração — cada um é o único a disparar num caso que
o outro não vê, e as duas mensagens dizem coisas diferentes ("apareceu cor" e
"apareceu cópia"), que é o que diz a quem lê o vermelho qual conserto fazer.

### A decisão que faz desta uma catraca e não um cemitério

**Folga zero, nos dois sentidos.** A asserção não é `medido <= teto`, é
**`medido === teto`**; em D5c, igualdade de **conjuntos**.

O argumento do `desenho`, e é o que sustenta a etapa inteira: *um teto é um
retrato datado da dívida, não um alvo.* Com `<=` ele vira orçamento — a dívida
cai para 40, a tabela continua a dizer 93, e o dia em que alguém volta a pôr 50
literais **a catraca aplaude**. Com igualdade, o número na tabela é sempre
verdade e pode ser citado sem ninguém ir medir de novo. É o que faz o
`teste-ligacao` valer: a lista de perdão só vale enquanto é exata.

Daí as três falhas que são a regra anti-cemitério:

- `PERDÃO MORTO: .tv-fade já está no prefers-reduced-motion. Tire-a da lista.`
- `ENTRADA MORTA: <arquivo> tem teto 0. A dívida foi paga — tire a linha.`
- `DESCEU: src/rosto.jsx tem 11, o teto é 12. A dívida encolheu; desça o teto:`
  — e **imprime a linha pronta para colar**, com a data. É a única falha do
  projeto que é uma **boa notícia**, e o texto diz isso.

**Folga de N foi recusada, com o motivo:** uma folga de 2 é licença permanente
para dois literais novos por ciclo — a dívida a crescer em passo invisível. A
única coisa que a folga compra é não ter de editar um número.

**E a válvula é escrita, não secreta:** um teto pode **subir**, com motivo e
data na própria entrada. Não é licença, é custo — a linha aparece no diff e a
pessoa pergunta. O que a catraca proíbe é subir **calado**.

### A catraca foi provada contra o erro: 20 sabotagens, 14 morderam

Uma catraca que não foi testada contra o erro que ela deveria pegar é
decoração. Cada sabotagem foi aplicada num arquivo de cada vez e **restaurada
imediatamente** — nunca `git stash`, nunca `git checkout --`, com a outra mente
na mesma árvore.

**As 14 que morderam:**

| o que se fez | quem mordeu |
|---|---|
| `#C0504D` novo em `painel-ficha.jsx` | D5a 1→2 (cor inédita) |
| duplicar uma `<line stroke="#c8b98f">` no pergaminho | D5a 30→31 — o teto **segura o pergaminho** |
| `rgba(90,70,40,.3)` solto em `SUPERFICIES_CSS` | D5a 13→14 — prova que `estilo.js` é varrido fora das zonas |
| `"#B33"` em `api/_portao.js` | D5a 0→1 — `api/*.js` está mesmo no escopo |
| arquivo novo `painel-novo.jsx` com um hex | D5a 0→1 — arquivo desconhecido não passa por omissão |
| `#8C7A4A` → `#7BC98F` em `carta-taro.jsx` | **só D5b** 11→12, D5a mudo — o caso central do dente |
| `#eadfc1` → `rgba(234,228,214,0.9)` no mapa | **só D5b** — pega `rgba` com RGB de `T`, não só hex |
| `TINTA` de `rosto.jsx` → `#0E0C15` | só D5b 2→3 |
| `cartazTopo` → `#171322`, **dentro de `MATERIAIS`** | D5b **duas vezes** — e D5a calado, porque é zona |
| tirar `.tv-pisca` do `@media` | D5c `NOVA ANIMAÇÃO SEM SAÍDA` |
| `.tv-tremor` nova, sem entrada no `@media` | D5c — vermelha no dia em que nasce |
| pôr `.tv-fade` no `@media` **sem** a tirar do perdão | D5c `PERDÃO MORTO` |
| tirar um literal de `rosto.jsx` | `DESCEU`, com a linha pronta para colar |
| quebrar o formato de `export const T = {` | `A ZONA "T" DESAPARECEU` — sem o piso, a mensagem teria sido "SUBIU 14", que mente |

**As 6 que ela TEM de deixar passar, e passaram** — falso positivo é tão grave
quanto buraco, porque é assim que uma mesa aprende a desligar a catraca:
afinar o pergaminho trocando `#c8b98f` ↔ `#a08a5e`; uma cor de cabelo nova em
`semente.js`; **a 15.ª cor de `T`** (`warn: "#D8A85B"`); uma cor escrita dentro
de um comentário; e mexer nas `rgba(${r},${g},${b})` compostas por variável do
`ui.jsx`. Uma delas era **pegadinha deliberada** na lista dada ao `testes` — um
`#7BC98F` em `palco.js`, que parece o caso central de D5b e tem de ficar verde
porque os módulos de dado saíram do dente por escopo. Ficou verde.

### A discordância, fechada com os dois lados

**`desenho` × `jogo`, sobre a cor de dado de jogo.** Dos 99 literais que são
byte a byte uma cor de `T`, **19 vivem nos módulos de dado**.

- **O `desenho`:** `npcs.js: rival` = `#E8A33D` não é dado, é `T.amber` com
  outro nome. Trocar a paleta amanhã deixaria os rivais âmbares num jogo que já
  não é âmbar.
- **O `jogo`:** os seis patamares de devoção são uma **rampa** que o jogador lê
  de uma vez. Se `Devota` virar `T.amber`, no dia em que a Fase L esquentar o
  âmbar por contraste **o patamar muda de cor sozinho** e a rampa deixa de ser
  rampa. *Coincidir hoje não é depender.* E a alternativa — 20 perdões escritos
  no dia do nascimento — é *"inventário com outro nome"*, que foi exatamente o
  diagnóstico que reescreveu D5.

**Decisão do `regente`: ganhou o `jogo`, e o `desenho` ganhou a outra metade.**
Os módulos de dado saem de D5b **por escopo, não por perdão**, e continuam em
D5a, que segura o tamanho.

**E foi o número que confirmou o recorte:** 99 − 19 = **80** — exatamente o
item da pauta que paga D5b (*"os 80 literais que já são `T`"*). O dente e o
item que o paga passaram a medir a mesma coisa, o que não acontecia com 99.

### O achado do ciclo: **a saída não é o nome**

O `jogo` não leu a lista das 13 animações — ele **injetou `animation: none` nas
13 e jogou**. Três coisas caíram:

1. **`.tv-agonia` é inocente**, e era a suspeita nomeada na pauta desde D1.
   Quando `grave`, `App.jsx:20971-20972` já põe `border: 1px solid T.danger`
   estático, o anel do retrato, o rosto e a barra de PV rotulada com o número:
   **quatro afirmações paradas de "você está morrendo"**. O pulso é a quinta.
2. **`.tv-dice` é a culpada, e foi pega na tela.** A troca de número é
   **JavaScript** — `setInterval` de 70 ms por 1200 ms (`App.jsx:486`) — e
   `prefers-reduced-motion` **não a toca**. O tremor era a única coisa que dizia
   "ainda rolando", e numa falha com `dc != null` o fundo do resultado é
   idêntico ao do rolando. O `jogo` fotografou um hexágono **imóvel com 19**
   (que passaria no teste) que um segundo depois era **6** e "Falha". Ou seja:
   para quem pediu menos movimento, `animation: none` **deixa a pisca e tira o
   sentido** — é **estritamente pior**, e uma catraca que declarasse isso como
   sucesso estaria certificando uma regressão.
3. **`.tv-faixa` e `.tv-flutua` terminam em `opacity: 0`** e só não ficam
   grudadas na tela porque um `setTimeout` as remove. E `.tv-vira`: o verso
   nasce em `rotateY(180deg)`, e `none` deixaria a carta de subida de nível **de
   costas, para sempre**.

**A regra que saiu daí, e é condição escrita nas quatro entradas do perdão:**
*a saída por movimento reduzido pousa no estado **final** da animação, nunca no
inicial — e onde é a própria animação que faz a coisa sumir, a saída não pode
ser `none`.* Sem isto, a próxima faixa escrita neste molde fica para sempre por
cima do tabuleiro, com a suíte verde.

### Zona não é perdão

`src/estilo.js` **é varrido** — a pauta escreveu que *"uma catraca que perdoa a
própria tabela não protege nada"*. Mas varrê-lo inteiro faria **acrescentar uma
cor nova a `T` ficar vermelho**, e uma paleta que não pode crescer é sagrada,
que é o oposto da liberdade que a pessoa deu à mesa. O recorte é por **zona**:
`T` isenta dos dois dentes; **`MATERIAIS` isenta de D5a e VARRIDA por D5b** —
porque sem essa metade a zona seria uma **lavandaria**, e bastaria mover a
duplicata para dentro dela para ficar perdoada.

A consequência que fecha o argumento: com este recorte, `estilo.js` carrega
**13 dos 80** de D5b — **a folha da casa é a segunda maior devedora do próprio
dente que a protege**. Isso é a catraca a não perdoar a própria tabela, medido.

**Perdão é dívida — tem data e o item que a paga. Zona é lei — não tem
nenhuma das duas.**

### Os quatro buracos, declarados com número

Buraco escrito é dívida; buraco calado é mentira. A catraca **não** pega:

- **nome CSS**: **1** ocorrência no escopo inteiro (`ui.jsx`, `stroke="black"`).
  Um dente para uma ocorrência é decoração, e o regex morderia prosa.
- **`transition` fora da folha: 18** — a barra de vida 500 ms, PV/PM 300 ms, a
  cor do dado 400 ms. Atributo inline; o `@media` da folha não o alcança.
- **o contraste** — e este é o mais caro dos quatro, e entrou porque o `testes`
  discordou e tinha razão: o `#fff` sobre `T.danger` de `App.jsx:2541` dá
  **3,42:1 e reprova o AA**, e **nenhum dos três dentes o vê** — `#fff` não é
  cor de `T`, logo D5b é cego, e trocá-lo por outro branco qualquer passa por
  D5a. Contraste é conta de **cor**, não contagem de **texto**: mede um par
  (tinta, fundo) que teria de ser inferido do JSX sete níveis acima, e isso é
  **outro varredor**, não um quarto dente deste.
- **animadores em JS: 2** — o d20 e a ficha a andar. E a casa **já tem o padrão
  e usa-o uma vez só**: `ui.jsx:589`, `CampoDeBrasas`, com `window.matchMedia`
  — aplicado à **atmosfera**, e não às duas coisas que carregam informação de
  jogo.

### Decisões médias tomadas (e o motivo de cada uma)

1. **Folga zero em vez de `<=`** — porque um teto com folga vira orçamento, e
   um orçamento aplaude o retorno da dívida.
2. **Os módulos de dado fora de D5b por escopo** — porque 20 perdões no dia do
   nascimento é inventário, e porque a rampa de devoção tem de poder ficar
   parada quando o âmbar da interface se mover.
3. **`MATERIAIS` varrida por D5b** — porque uma zona que não é varrida vira
   lavandaria de duplicatas.
4. **O dente `ENTRADA MORTA`, proposto pelo `testes` e aceito** — a
   especificação escrevia *"a entrada sai da tabela, não fica a dizer 0"*, mas
   com `medido === teto` uma entrada `0` que mede `0` passaria verde para
   sempre. É a mesma lógica do `PERDÃO MORTO` virada para as tabelas de teto.
5. **O contraste declarado como quarto buraco, proposto pelo `testes` e
   aceito** — ele construiu o que estava escrito e disse a discordância em vez
   de a resolver sozinho, que é exatamente o combinado.
6. **O piso do alcance** (`pisoDeArquivosComCor`, `pisoDeLiterais`,
   `pisoDeClassesDeAnimacao`, `pisoDeZona`) — porque um bug na máscara de
   comentário que apagasse um arquivo inteiro passaria **verde medindo nada**,
   e catraca verde por vazio é pior que catraca nenhuma. Provado por sonda: sem
   o `pisoDeZona`, quebrar o formato de `export const T = {` dava "SUBIU 14";
   com ele, dá `A ZONA "T" DESAPARECEU`.

### Correções medidas à pauta

- **O pergaminho não tem irmãs.** `rosto.jsx` e `carta-taro.jsx` são **escuros**
  e são dívida comum — `carta-taro.jsx` carrega **8 cores de `T` exatas** e é o
  depósito mais rico de D5b fora do `App.jsx`; `rosto.jsx` tem `#7A1F1F`, que é
  `CABELO[8]` exato — cor de **dado** copiada para dentro da interface, a
  direção contrária e a única que é mesmo defeito.
- **E o pergaminho é sistema, provado por um acaso impossível:** **10 hexes
  aparecem nos DOIS arquivos, escritos separadamente, e cobrem 52 dos 71 usos**.
  Dívida acidental não concorda byte a byte em dois arquivos. Virou item
  próprio, e a casa dele é `MATERIAIS`, não `T`.
- **`⤢ ampliar` já não é mentiroso.** D1 e D4 escreveram que ele *"corta 33% do
  campo"*. Hoje abre uma sobreposição de tela inteira com o campo 14×14 inteiro
  e casas clicáveis — o `jogo` **andou, de 20 m para 12 m, clicando**. O que
  continua quebrado é o **veredito**: o orçamento de movimento não aparece
  dentro da sobreposição, e o preço chega depois, no log.

---

## A Fase D fecha — o antes e o depois

**O que a casa não sabia sobre o próprio visual em 14/09, antes de D1:**

Não sabia quantas cores tinha (a pauta dizia 15; são 14). Não sabia quantos
literais soltos tinha (a pauta dizia 30 no `App.jsx`; são 93, e 242 nos
arquivos de tela). Não sabia que havia uma **segunda paleta inteira escondida
dentro da string de `FONT_CSS`**, nem uma **terceira** dentro dos mapas. Não
sabia quantas animações tinha (a definição do `desenho` listava 7; são 13, e
duas das sete nem eram classes). Não sabia que **só 3 delas param** para quem
pede menos movimento. Não sabia que **6,8% dos controles** passam pela
biblioteca — 218 `<button>` crus contra 16 `<Botao>`. Não sabia que
`:focus-visible` **não aparece uma única vez** no projeto. E não sabia o que a
fase existia para achar: **10 famílias de ação com mais de uma forma, 4 delas
de significado** — entre elas o botão que apaga um companheiro, escrito em
`#fff` sobre vermelho, **3,42:1, reprovando o AA no único controle que apaga
alguém**.

Nada disso dava alarme. O contraste da paleta passa AA com folga, a WCAG não
tem piso de tamanho, e um literal de cor é sintaxe válida. **A casa estava
cega por construção, não por descuido.**

**O que ela passa a não poder mais esquecer:**

| a partir de hoje | o que a impede |
|---|---|
| uma cor nova escrita à mão | `check-formas` D5a — **332** é teto, não orçamento |
| uma cor que já tem nome em `T`, copiada | D5a **e** D5b, com mensagens diferentes |
| uma cor de `T` mudada para dentro de `MATERIAIS` para escapar | D5b varre a zona física |
| uma animação nova sem saída | D5c, vermelha **no dia em que nasce** |
| uma dívida paga que ficou no livro | `PERDÃO MORTO` / `ENTRADA MORTA` |
| uma dívida que encolheu e não foi registrada | `DESCEU`, com a linha pronta |
| a própria tabela de cor a violar a regra | `estilo.js` é varrido, e deve **13 dos 80** |
| a varredura a passar verde por ter medido nada | os quatro pisos de alcance |

E o que a fase deixa escrito, além do código: `src/estilo.js` (a folha com casa
própria, D2), **27 variáveis e 13 páginas no Figma** com a leitura de volta
provada (D3), **30 formas declaradas** com o verbo do jogador (D4), e uma
`mente/formas.md` de **1.868 linhas** onde toda divergência entre os dois
seniores está fechada **com os dois lados e quem cedeu em quê**.

**O preço, dito sem enfeite:** a Fase D **não melhorou um pixel do jogo**. Cinco
ciclos, e o jogador não vê diferença nenhuma. O que ela comprou é que, a partir
do sexto, cada melhoria custa uma vez em vez de duas — e não apodrece.

### Para a pessoa decidir — as duas propostas ambiciosas deste ciclo

Nenhuma é seguro, e nenhuma é gosto.

1. **`Atacar` ataca — os verbos de combate saem do autocompletar** (do `jogo`,
   `pesado`). O painel `Ações` tem duas fileiras: em cima **12 botões** que só
   fazem `setEntrada(a.texto)` — **`Atacar` não ataca, ele digita `"Ataco "` na
   caixa** — e embaixo **8 botões** que entram direto no motor por
   `declararAcaoRapida`. **Nenhum dos 8 é de combate.** Vasculhar, Escutar e
   Lembrar atravessam o motor; Atacar, Esquivar, Empurrar e Derrubar ficam do
   lado que escreve. **Experiência jogada, 15/09:** três ataques declarados em
   português sem ambiguidade, dentro de um combate aberto com iniciativa rolada
   — **zero rolagens de ataque**; o único dado da sessão foi de Intimidação, e
   o terceiro golpe virou uma cena em que todos conversam. Ao fim de 7 turnos:
   **PV 20/20, PM 6/6, XP 89/300** — os mesmos quatro números do primeiro
   turno. A lei da casa está invertida no pior lugar possível: *o Mestre é
   código, e a IA só narra* — mas **quem decide se o golpe aconteceu é a IA**.
2. **O Pergaminho — a prosa ganha material próprio** (do `desenho`, `pesado`).
   A medição achou **três paletas**, e a casa gastou a mais bonita delas
   inteira em mapas, que o jogador abre uma vez por sessão. Num RPG cuja
   primeira lei é *"a prosa é a protagonista"*, a narração é servida no mesmo
   `<div>`, com a mesma borda, que o inventário — e `tv-mono` tem **682 usos
   contra 315 do corpo**. A proposta é que a narração deixe de ser um painel e
   passe a ser **uma superfície**, com WCAG 2.2 SC 1.4.8, a HIG, o Material 3 e
   Bringhurst citados, e a prova jogada **com a mesma semente** — o mesmo
   texto, palavra por palavra, nos dois materiais.

**E a segunda depende da primeira lei desta etapa:** sem a catraca, um material
novo nasceria como mais 40 literais soltos e viraria a quarta paleta anônima do
projeto no ciclo seguinte. É esse o argumento inteiro de D5, e é por isso que o
item mais ambicioso da fase é o que mais depende dela.

### O que ficou, e o que eu não soube

- **Os 242 literais não se consertaram, de propósito.** A catraca nasce com a
  dívida **perdoada e datada**; a dívida se paga depois, em itens próprios —
  três deles abertos hoje (*o pergaminho ganha nome*, *os pigmentos do dado de
  jogo*, *a cor do primeiro pixel*). Confundir as duas coisas faria o ciclo
  inchar e a catraca nascer frouxa.
- **A cláusula "nenhum controle sem forma declarada" não entrou**, e não foi
  esquecimento: D1 já a tinha tirado de D5 por escrito. São **218 `<button>`**
  sem nenhum mecanismo de marcação que ligue um ao outro — só se pode exigir
  que todo controle tenha forma quando existir a primitiva que a carrega, e
  isso é *"`ui.jsx` ganha o que falta"*.
- **A máscara de comentário é textual, não um parser**, e é o ponto frágil do
  arquivo: uma string que contenha `/*` apagaria texto a mais **em silêncio**.
  O que dá confiança é que as contagens saíram idênticas às do `desenho` nos 17
  arquivos — se a máscara estivesse a comer um pedaço, algum número teria ficado
  abaixo. É para isso que os quatro pisos existem.
- **`hsl()` entra em D5a e não em D5b.** Uma `hsl()` que *seja* `T.amber`
  escapa ao segundo dente, porque não se escreveu conversor HSL→RGB. Medido:
  **zero `hsl` em todo o escopo** — um conversor seria código sem caso. Está em
  comentário, para ser deliberado e não acidental. É uma meia-fuga conhecida.
- **O que ficou feio:** `conferirTetos` recebe quatro argumentos só para que as
  mensagens de D5a e D5b digam coisas diferentes. Funciona, lê-se mal, e está
  dito aqui em vez de escondido.
- **O bastão do `App.jsx` não foi tomado** — nem uma vez, no ciclo inteiro.
- **O vermelho da outra mente:** não houve. O `orquestrador` fechou **N1b**
  (`061c5bf`, `08e1796`) antes da minha prova, e o `npm test` saiu
  **182/182 suítes verdes e 10/10 varredores limpos** — o décimo é o novo.

---

## 14/09 23:40 · v9.249 · D4 · as formas escritas · commit `e8b4c32`

**`mente/formas.md` deixou de estar vazio, e este é o primeiro ciclo sob a
liberdade nova.** A pessoa disse hoje que *"a timidez é o defeito, não a
ousadia"*, e a régua do pesado virou **uma pergunta só: o jogador teria de
reaprender?** O que o ciclo devolve é um arquivo de **30 formas declaradas**,
**quatro divergências de significado fechadas com os dois lados e quem cedeu
em quê**, e — o que eu não esperava — **um defeito achado na própria peça que
a mesa ia adotar**, que teria trocado em silêncio o gesto mais repetido do
jogo.

- **estado inicial:** `.claude/ciclo-desenho-em-curso` não existia — fila
  livre; criei-a. `.claude/ciclo-em-curso` era do `orquestrador` em **N1**, na
  mesma árvore, e **não a toquei**. `.claude/app-jsx` não existia e **não
  precisei do bastão**: D4 é escrita e Figma, e disse isso às três mãos por
  escrito. Antes de começar: **182/182 suítes verdes, 9/9 varredores limpos**.
  Pauta de desenho: Fase D, 3 de 6 feitas.
- **jogo / desenho:** chamados **juntos, no mesmo turno, os dois em primeiro
  plano**, e depois mais duas voltas — porque uma etapa de forma não fecha num
  turno e fingir que fecha é como a mesma ação ganha duas caras. Primeira
  volta, **em arquivos separados de propósito** (`mente/d4-jogo.md` e
  `mente/d4-desenho.md`): dois escritores no mesmo arquivo apagam-se, e o
  `formas.md` é um só. Segunda volta: o `desenho` consolidou `formas.md` com
  a arbitragem das quatro divergências; o `jogo`, ao mesmo tempo e noutro
  arquivo, **julgou as 21 formas dele contra o momento** — 13 passaram limpas,
  7 com ressalva, **1 reprovada no lugar**. Terceira volta: o `desenho` dobrou
  o veredito.
  A fronteira de autoria **funcionou como a pessoa a desenhou** e dá para
  medir: o `jogo` não desenhou uma peça, e o `desenho` não escolheu uma
  palavra. Onde os dois se tocaram, a divergência ficou escrita.
- **aprendiz / oficial / testes:** **nenhum dos três foi chamado, de
  propósito.** D4 não escreve código de produção. Um executor num ciclo sem
  código é ruído, não paralelismo — é a mesma decisão de D3, e continua certa.
- **o Figma:** o **mesmo** arquivo `Taverna — biblioteca`,
  `e5wJUzInAssoebx5npssKc`, ampliado de **8 para 13 páginas**. Nenhum segundo
  arquivo. Cinco peças novas — **A casa** (7 estados), **A escolha** (12),
  **O interruptor** (4), **A linha** (4) e **O realce** (2) — mais dois eixos
  novos (`Selo` *Mudou=Agora*, `Barra` *Mudou=Golpe/Ganho*). Tudo ligado a
  variável, zero hex solto.
  **E o `desenho` corrigiu a própria peça de D3**: o estado *Impedido* do
  Botão caía a 45% e dava **1,19:1** — ilegível. Agora é sem preenchimento com
  tinta cheia: **6,62:1**. O eixo mudou junto, e a mudança é a melhor frase do
  ciclo: os dois estados não se separam por *volta / não volta*, e sim por
  **quem tem de agir**.

### A prova

**`npm run build` limpo · 182/182 suítes verdes · 9/9 varredores limpos.**
Nenhum arquivo de `src/` foi tocado — o verde é o mesmo de antes, e é por isso
que ele prova pouco: **D4 não se defende por suíte, defende-se por número
escrito dentro de cada forma.** Os que decidiram alguma coisa:

| a decisão | o número que a sustenta |
|---|---|
| a chamada é uma peça só nos quatro modos | `Agir →` **720 px²** contra `⚔ A PRÓXIMA LUTA` **54.912 px²** = **76×**, **na mesma tela, a três centímetros** |
| a opacidade sai do "não pode agora" | 40% → **2,02:1** · 45% → 2,25:1 · 60% → 3,03:1 · o *Impedido* de D3 → **1,19:1** |
| o destrutivo troca de tinta | `#fff` sobre `danger` = **3,42:1 (reprova AA)** → `onAccent` = **5,34:1** |
| o alvo de fechar vai a 44px | quatro `✕` medidos a **~20px**; *"um alvo que o dedo erra rouba mais cena que um alvo grande"* |
| a reação precisa de controle | **6** reações com custo em PM, e `escolherReacao` gasta o PM do jogador sozinha (`App.jsx:7572`) |
| o tabuleiro tem de vir à tela | a luta abriu com o campo **429 px abaixo da dobra**, `scrollTop = 0` de 1129 |

### O defeito que o ciclo achou sozinho, e que vale mais que as 30 formas

O `desenho` fabricou **A linha** — o campo de escrita do turno, 72px, prosa em
Spectral. Ninguém tinha pedido a peça; ela apareceu ao contar (**23 campos de
texto escritos à mão**, 19 no `App.jsx`, num projeto com 17 `outline-none`).
O `jogo` foi ver o momento e achou o que nenhuma contagem acha: o campo do
turno é um **`<input>`** onde `App.jsx:21216` faz `Enter → agir`. Um campo de
72px com prosa é, na prática, um **`textarea`** — e em `textarea` o `Enter`
**quebra linha**.

Adotar a peça bonita sem essa regra **trocaria em silêncio o gesto mais
repetido do Taverna**, centenas de vezes por campanha. Build limpo, suíte
verde, e só o uso pegaria — a mesma família da armadilha que o `CLAUDE.md` já
guarda ("componente dentro do render mata o foco"). Ficou escrito em
`formas.md` como **condição de aceitação, não nota de rodapé**: `Enter` manda,
`Shift+Enter` quebra; no telefone campo e chamada **não dividem a linha**
(dividindo, sobrariam ~13 caracteres visíveis para escrever a ação central do
jogo); e a última fala do Mestre não sai da tela com o teclado aberto —
senão *"ele responde de memória"*, e a peça troca responder por lembrar.

**É exatamente para isto que a mesa anda em par.**

### As quatro divergências de significado — e quem cedeu em quê

Todas fechadas em `mente/formas.md`, com os dois lados escritos.

1. **confirmar / cancelar** → `Botao` *Papel=Recuo* nos doze lugares, sempre à
   esquerda do confirmar; o destrutivo é **O gesto que custa**, e o `#fff` de
   3,42:1 sai como **bug de acessibilidade, não como gosto**. **Ninguém
   cedeu** — a fronteira de autoria já resolvia: a forma é uma e é do
   `desenho`, a palavra é do momento e é do `jogo` (três palavras, amarradas
   ao momento). A cessão que o `jogo` deixou escrita (*"cedo para uma palavra
   só"*) **não foi gasta**, e ficou registrada: cessão guardada é o que faz a
   próxima divergência fechar depressa.
2. **fechar um painel** → o `✕` é da saída e de mais nada; as **cinco** ações
   de perda que hoje usam o glifo da porta passam ao gesto que custa, com o
   verbo escrito. **Cedeu o `jogo`:** a variante *discreta* deixa de ser
   escolha livre — o glifo pode ser pequeno, **o alvo nunca** (44px nas 15).
   **Cedeu o `desenho`:** a sobreposição da morte pode manter o fundo que não
   fecha, porque é momento — desde que **diga na tela** que não há saída.
3. **"não pode agora"** → dois estados, separados por **quem tem de agir**.
   Eu tinha arbitrado isto como cessão do `jogo` — *"o campo está vazio"*
   deixando de ser um terceiro estado —, e **o `jogo` recusou o rótulo**:
   *"ele não insistiu, fez melhor."* O eixo novo do `desenho` tornou a cessão
   **desnecessária**, e o `desenho` registrou assim em vez de alisar. É a
   **segunda cessão escrita e não cobrada** da fase, e as duas ficam de pé:
   uma divergência que fecha sem ninguém perder nada é a única que não deixa
   ressentimento no código. **Cedeu o `desenho`:** os glifos do cabeçalho
   podem ficar mudos na
   tela, e o `jogo` disse **nominalmente quais** (a caneca, o `↓`, os nove
   `✕` de fechar, o stepper, o `🔊`) e quais **não podem** (`⛺`, `📜`, `⚒`, o
   par `▲`/`✕` da guilda e os quatro `✕` que descartam). Com a regra que
   impede a leitura preguiçosa: **mudo na tela nunca é mudo para quem não vê
   a tela.**
4. **a ação principal entre os modos** → uma peça só, **mesma família e mesmo
   tamanho de letra**; a largura é variante. **Cederam os dois:** o `jogo` no
   tamanho (*"duas peças ensinam duas línguas; uma peça em dois tamanhos
   ensina uma"*), o `desenho` na largura (a faixa do Duelo e do Torneio, onde
   a chamada é cerimônia). O que **nenhum** cedeu — família e tamanho da
   letra — é a decisão, porque é `tv-display 18px` contra `tv-mono 12px` que
   faz parecer dois jogos.

**E a quinta, que estava aberta desde D3, fechou:** a *escala de cerimônia*. O
`desenho` fabricou o degrau que faltava (**O realce**) e o `jogo` trouxe a
lista — com **a regra antes da lista**, que é o que a faz sobreviver a
momentos novos: *sobe ao realce o que muda o que o jogador **pode fazer** a
partir de agora, e só na primeira vez; o que só muda um número fica em nota.*
Nove momentos sobem. E o `jogo` **aceitou por escrito o risco que o `desenho`
registrou**: não usar véu para conquista nenhuma.

### decisões médias tomadas

- **Fabricar cinco peças que não existiam** (`médio` pela tabela nova: *criar
  o que não existe*). O motivo é que **29 das 30 formas levam `[ainda não
  existe]`** em *onde vive* — a única que existe em código existe **errada**
  (`ui.jsx:27`, `opacity: 0.4`). Um arquivo de formas sem peça é uma lista de
  desejos; com peça, é uma encomenda.
- **Aposentar a opacidade como linguagem de "não pode agora"** (`médio`:
  *alterar a forma do que existe, quando a nova é comprovadamente melhor*).
  Comprovado por medida, e a medida é dura: **1,19:1** na peça que a própria
  mesa tinha desenhado ontem. O que não pode ser clicado ainda precisa ser
  lido.
- **Rodar a dupla em três voltas em vez de uma.** Custou mais; o retorno foi o
  `Enter` e a peça reprovada no lugar. Uma volta só teria entregue um arquivo
  bonito e um defeito montado.
- **Escrever forma para ação que não tem controle.** As seis entram em
  `formas.md` **com forma declarada e `[ainda não existe]`** — porque, como
  D1 avisou, o que não está na lista passa pela catraca por não existir.
  Declarar o que falta é o que torna a falta cobrável.
- **Mudar o `🎲` de lugar, não de peça.** Foi a única forma **reprovada** pelo
  `jogo`, e o que ele reprovou foi o **endereço**: um interruptor que governa
  o log não mora no cabeçalho, longe do que governa. O `desenho` cedeu no
  lugar e manteve a peça — e o registro diz isso com essas palavras, porque
  "a peça estava errada" e "a peça estava no sítio errado" são conclusões
  diferentes para quem ler daqui a um mês.
- **Duas decisões que o `desenho` tomou como suas**, porque o `jogo` lhas
  devolveu: *"é a sua vez"* passa de *Tom=Aviso* para ***Tom=Bom*** (não é
  um aviso, é a sua deixa) — com a nota afiada de que **se *Bom* e *Aviso*
  saírem parecidos de `T`, isso é defeito de tabela, não da forma**; e o
  custo do passo **nasce escrito na casa**, descendo à *Consequência* só
  quando não couber legível — porque um custo que só existe no rato não
  existe no telefone, que é o defeito que esta fase inteira persegue.
- **Não fabriquei *A pergunta que expira***, pedida por nome pelo `jogo`. Ela
  é o coração de uma proposta `pesado` que espera a pessoa, e **fabricar peça
  para decisão que não foi tomada é inventar trabalho**. Ficou nomeada como
  dívida, com o que teria de fazer, para que ninguém comece do zero no dia do
  sim.

### A ambição — o que fica para a pessoa decidir

A pessoa pediu que todo ciclo de design entregasse **ao menos uma proposta
ambiciosa**. Foram três, e as duas `pesado` estão no topo de
`mente/pauta-desenho.md`:

- **a rodada tem três batidas, e o jogador toca as três** — hoje as regras
  modelam três coisas do jogador (mover, agir, reagir) e ele toca **uma e
  meia**: numa luta inteira o `jogo` tocou **três** controles, dois deles
  casas e um o `⛺` que encerrou a luta por engano. **Reagir não tem controle
  nenhum** — e o melhor argumento é estudo citado com a origem dentro de casa:
  o cabeçalho de `src/reacoes.js` diz que *"no 5e e no BG3 metade da tensão do
  combate mora aqui"*, e sete linhas abaixo entrega a decisão ao sistema. **O
  módulo diagnostica o problema e depois o causa.** O que o jogador reaprende
  é **uma coisa só** — que o jogo pode lhe fazer uma pergunta no meio do turno
  do inimigo, e que não responder é resposta válida —, e a regra de segurança
  está escrita: **quem não responde, o sistema responde como hoje. Nada
  regride.**
- **o turno acontece mesmo quando o Narrador cala** — nasceu do buraco desta
  fase, e é a pergunta de produto que a mesa não pode responder sozinha.
- **nenhum número muda em silêncio** (do `desenho`) é `médio` pela régua nova
  — o jogador não reaprende nada — e foi para "Aberto". Duas das suas três
  peças já foram fabricadas hoje; o que falta é **conta, não tela**, e por
  isso é da fila do sistema.

### o que ficou

- **O buraco, declarado antes que alguém o descubra: o `jogo` não jogou um
  único turno narrado.** A quota do Narrador acabou (`Limite diário alcançado
  (500 chamadas)`) — pela **segunda** vez nesta fase, depois de D1. O combate
  foi medido com o Mestre calado e **a sala ao vivo não foi medida**: o que
  `formas.md` diz da sala é leitura de código, não experiência. Cobertura com
  buraco declarado vale mais que cobertura fingida.
- **Cinco afirmações de D1 não eram verdade**, e estão corrigidas em
  `formas.md` com a linha: o `🎲` **tem** estado visível (falta a **palavra**,
  `App.jsx:20418`); o `✕` tem **6** tamanhos, não 4; são **10** assinaturas de
  âmbar, não 13 — e o número que decide é **37 usos de `background: T.amber`**;
  os véus têm **4** desfoques, não 5; e o `⤢ ampliar` **tem** rótulo — o
  defeito dele não é ser mudo, é **mentir**: promete tela cheia e corta **33%**
  do campo, com o próprio título fora da tela. Somam-se às duas que D3 já
  tinha derrubado. **Herdar engano custa mais caro que medir de novo.**
- **Dívida do território do sistema, anotada e não consertada, como manda a
  lei.** Para o `conselheiro` pegar: (1) **`reacoes.js:96` sorteia com
  `Math.random()`** — a lei é determinismo por semente, e é pré-requisito da
  terceira batida; (2) **o orçamento de movimento não é escrito de volta**
  quando a luta não tem `economia` (`const novaEco = eco ? {...} : eco`), e é
  por isso que o medidor diz `9 de 9` depois de o jogador ter andado 7,5 m —
  **o `jogo` andou; quem mente é o medidor**, e isso derruba de vez a versão
  de D1 de que "não dá para se mover"; (3) o `⛺` **não escreve no log o que
  fez**; (4) `bloqueado` apaga quatro painéis que não têm nada com a rolagem
  (`App.jsx:20384`) — vai com G2.
- **O Code Connect continua impossível nesta conta** (`tier: pro`). Com sete
  peças novas ou alteradas, são agora **15 peças sem nó**, e o que impede a
  biblioteca de divergir do código em silêncio continua sendo um script que
  alguém tem de lembrar de rodar. Item da pessoa, já na pauta.
- **O que D4 não fez, e é de propósito:** não consertou nada. Nenhuma cor,
  nenhum botão, nenhuma tela. A etapa escreve a verdade e fabrica a peça; **a
  primeira montagem é D5 em diante**, e conserto de carona aqui seria o mesmo
  erro que D1 se recusou a cometer.

---

## 14/09 20:58 · v9.246 · D3 · a biblioteca no Figma, e a estrada de volta · commit `0e3ee81`

O primeiro ciclo em que o **Figma entrou de verdade**. A pessoa tinha feito a
pergunta certa — *"a interação com o Figma está sendo uma troca dos dois lados
ou apenas estamos usando as ferramentas do Figma?"* — e a resposta honesta até
ontem era **zero**: D1 e D2 não puseram um pixel lá. Hoje há um arquivo, 27
variáveis, cinco peças, e **duas respostas que valem mais que as peças**: uma
direção que funciona nos dois sentidos e provou-se, e um nó que **não existe
nesta conta** e que nenhuma perícia resolveria.

- **estado inicial:** `.claude/ciclo-desenho-em-curso` não existia — fila livre.
  `.claude/app-jsx` também não, e **não precisei do bastão**: D3 não toca o
  `App.jsx`. Árvore com `src/arena.js` e `src/combate.js` modificados (a outra
  mente, em B2) e mesmo assim **182/182 suítes verdes, 9/9 varredores limpos**
  antes de eu começar. Pauta de desenho: Fase D, 2 de 6 feitas.
- **jogo / desenho:** chamados **juntos, no mesmo turno, os dois em primeiro
  plano**, e pela primeira vez com a **autoria que a pessoa ajustou hoje**: o
  `desenho` fabrica toda peça, o `jogo` diz de que peças as telas precisam e
  compõe com elas. Na prática isso deu ao `jogo` um produto que ele nunca
  tinha tido — **a lista de demanda**, 538 linhas de lugar-e-linha contados —
  e impediu o defeito que a fronteira existe para impedir: nenhuma peça nasceu
  duas vezes. O que decidiram está em `mente/formas.md`, seção "A biblioteca
  no Figma"; a medição do `jogo` ficou em `mente/demanda-jogo-d3.md`.
- **aprendiz / testes:** **nenhum dos dois foi chamado, de propósito.** D3 não
  escreve código de produção — ela constrói a biblioteca e mede a estrada. Um
  executor num ciclo sem código para escrever é ruído, não paralelismo.
- **o Figma:** o arquivo `Taverna — biblioteca`, `fileKey`
  **`e5wJUzInAssoebx5npssKc`**
  (`https://www.figma.com/design/e5wJUzInAssoebx5npssKc`). **Um só** — o
  endereço está em `formas.md` para que o próximo ciclo amplie este e não crie
  o segundo. Entraram **27 variáveis** (14 de `T`, 13 de `MATERIAIS`) e
  **oito peças** em sete páginas — Botão, Fechar, Selo de estado, Barra de
  medida, Véu, A Consequência, O gesto que custa, e os 11 glifos com dois ou
  mais usos. Todas ligadas a variáveis, **zero hex solto**.

### A prova

**`npm run build` limpo · 182/182 suítes verdes · 9/9 varredores limpos.**

**O ida-e-volta: 26 de 27, e a divergência é de formato.** As 27 cores foram
puxadas de volta por `get_variable_defs` e comparadas com `src/estilo.js` por
máquina, num script que importa o módulo de verdade. A única que não bate é
`vinhetaCanto`: o código diz `rgba(4,3,8,.45)` e a volta traz `#04030873` —
o Figma guarda alfa **num byte**, e `0x73/255 = 0,45098`. `corticaFilete`
(`.4`) volta exata porque `0,4 × 255 = 102` é inteiro. **A regra que sai
daí, e que é o achado mais reaproveitável do dia:** alfa que não for múltiplo
exato de 1/255 não sobrevive à volta, e quem comparar isto por máquina um dia
tem de usar **tolerância de 1/255 no alfa, nunca igualdade de texto**.

**E a mão dupla foi provada, não suposta:** o valor de `amber` foi trocado
*dentro do Figma* para um verde impossível, a volta trouxe o verde, e a
comparação acusou a divergência sozinha (13/14). Restaurado, voltou a 14/14.
É o teste que a etapa existia para passar, e ele passou.

**Conferi os números eu mesmo, em vez de repetir os da mão** — é a parte do
ofício que não se delega: rodei o comparador (26/27 confirmado) e recalculei
os contrastes pela fórmula da WCAG. Batem todos: `#fff` sobre `danger`
**3,42:1** (reprova AA — e é o único botão que apaga um companheiro),
`#1A0F0D` **5,48:1**, e o `onAccent` que a biblioteca adota **5,34:1**. O anel
de foco novo dá **15,31:1**.

### Decisões médias tomadas

- **O `Botão` foi REFEITO, não ampliado — e quem o derrubou foi o `jogo`.**
  A peça da primeira rodada tinha *Tom × Estado × Tamanho* com um estado
  `Desativado` que era, no fundo, um valor de opacidade. A lista de demanda
  provou que **"não pode agora" são duas coisas diferentes**: `bloqueado =
  carregando || !!rolagem` governa **15** controles, e *"o Mestre está a
  escrever"* (isto volta) sai hoje **no mesmo cinza** de *"proibido"* (isto
  não volta). A peça virou 24 variantes, *Papel × Estado × Tamanho*, com
  **Esperando** e **Impedido** separados e uma **fenda para a razão** — que
  **nasce acesa**, de modo que os 31 controles mudos de hoje só podem ficar
  mudos por gesto deliberado de alguém. Esta é a fronteira nova funcionando
  exatamente como a pessoa a desenhou: o `jogo` não desenhou nada, e mesmo
  assim a peça mudou de forma por causa dele.
- **O destrutivo saiu do Botão e virou peça própria — *o gesto que custa*.**
  Ele faz o que nenhum botão faz: **pergunta no próprio lugar**, sem modal.
  A razão é medida: **11 das 14 ações irreversíveis não têm proteção nenhuma**
  hoje, e não é por descuido — é porque a única forma de perguntar que a casa
  tem é o modal, que é caro demais para "remover Brann". Uma pergunta barata
  é o que faz as onze passarem a existir. O Confirmar repete **o verbo**,
  nunca "Sim".

- **O anel de foco entra declarado como DESENHO NOVO**, não como espelho.
  `:focus-visible` tem **zero** ocorrências no projeto e `outline-none` tem
  **17**: desenhar foco aqui é inventar, e inventar contrabandeado como se já
  existisse é exatamente o que `formas.md` existe para impedir. A forma
  escolhida — `box-shadow: 0 0 0 2px T.bg, 0 0 0 4px T.ink` — foi escolhida
  para que o Figma e o CSS futuro sejam **a mesma construção**, não duas
  aproximações. Um anel só para todos os tons, porque `ink` sobre `bg` assenta
  no fundo da página e funciona igual no âmbar, no contorno e no vermelho.
- **A demanda do `jogo` virou arquivo versionado** (`mente/demanda-jogo-d3.md`),
  com um cabeçalho que diz **em letra grande que ele não é fonte de verdade**.
  Nasceu no scratchpad, que morre com a sessão, e 538 linhas de lugar-e-linha
  contados à mão são caras demais para remedir — mas uma segunda lista de peças
  com estados e variantes é, palavra por palavra, a segunda verdade que esta
  mesa existe para impedir. O cabeçalho é o que separa insumo de decisão.
- **Os 20 exports de um uso só ficaram FORA da biblioteca.** Biblioteca não é
  lugar de registrar furo: eles passam no `teste-ligacao` porque a linha de
  `import` conta como segundo leitor, e pô-los no Figma seria carimbar o furo
  como se fosse acervo.

### O que ficou

- **O NÓ NÃO EXISTE NESTA CONTA, e é o resultado mais importante do dia.**
  O Code Connect — a parte 3 de D3, *"o nó"* — responde, pelos **três**
  caminhos (`list_file_components_for_code_connect`,
  `get_code_connect_suggestions` e `add_code_connect_map`, ou seja **também
  o de escrita**), a mesma frase: *"You need a Dev or Full seat on an
  Organization or Enterprise plan to use Code Connect."* O `whoami` explica:
  a equipe é **`tier: pro`** com assento Full — **o assento existe, o plano
  não**. Logo **8 de 8 peças ficaram sem nó**, e não por falta de componente
  de código a que amarrar, que era o que a pauta previa. Enquanto não houver
  plano, o que impede a biblioteca e o `ui.jsx` de divergirem em silêncio é
  **um script que alguém tem de lembrar de rodar**. Subir de plano custa
  dinheiro: é **`pesado`**, foi para "Para a pessoa decidir", e a mesa não
  decide sozinha.
- **Um alarme meu que era falso, e a armadilha de verdade que ele revelou.**
  Eu quis conferir a volta sem depender da palavra da mão, chamei
  `get_variable_defs` no nó `0:1` e recebi *"You currently have nothing
  selected"* — o que me fez escrever, por uma hora, que a volta talvez
  exigisse um humano selecionando algo no desktop. **Não exige.** `0:1` é a
  `Page 1` original, vazia; a ferramenta não sabe dizer "este nó não tem
  variável" e **cai no caminho da seleção**, devolvendo uma frase que
  descreve outro problema. Apontada a um nó que **usa** variáveis, ela
  responde a frio: puxei eu mesmo `2:3` e `2:62` e recebi as 27, idênticas
  às de `estilo.js`. **A armadilha que fica escrita:** `get_metadata` **sem
  `nodeId` mente neste arquivo** — lista só `Page 1`, enquanto o arquivo tem
  **oito** páginas (o `use_figma` as vê todas). Confira sempre **por nó**;
  a lista de páginas por chave não serve.
- **O que continua POR PROVAR, e não vou escrever como provado.** O teste do
  `amber` prova que o valor **persiste no arquivo e é lido a frio** por
  chave + nó, por uma ferramenta diferente da que escreveu. Ele **não**
  prova que uma pessoa editando na interface do Figma chega ao código — a
  escrita foi pela Plugin API, não por mão humana na tela. É a diferença
  entre *"o código lê o Figma"* (provado hoje) e *"o designer edita e o
  código recebe"* (não provado). Fica para quem tiver a tela aberta.
- **Os quatro ícones mortos confirmados** — `IconeBandeira`, `IconeGota`,
  `IconeCirculoX`, `IconeFrasco`: zero usos fora da linha de import, exatamente
  como a pauta dizia. Ficaram de fora e continuam na fila do sistema.
- **`MATERIAIS` tem 13 entradas, não 11** — a pauta de D3 dizia 11 e estava
  errada; D2 já tinha escrito 13. A comparação por máquina corrigiu sozinha,
  que é a razão de ela existir.
- **`JetBrains Mono` não tem peso 600 no Figma** (há Regular, Medium 500 e
  Bold 700). `FONT_CSS` pede `wght@400;600`. É uma diferença real entre o que
  o navegador desenha e o que o Figma desenha — quem comparar tela contra tela
  vai tropeçar nela, e agora sabe por quê.
- **O véu da sobreposição não tem token.** O preto mora em `sombra()`, privado
  de `estilo.js`. A biblioteca resolveu com `bg` a 75% — melhor design *e* sai
  de tabela — mas **o código ainda escreve preto literal nesses 15 lugares**.
- **Duas afirmações de D1 caíram, e as duas eram minhas de dois ciclos atrás.**
  O `jogo` mediu e derrubou: *"a grelha não é clicável"* está **errado** (cada
  casa alcançável é `role="button" tabIndex=0` com `onMover`,
  `grade-de-batalha.jsx:512-517` — o clique funciona, o que falta é **forma**,
  o alvo é um `<rect fill="transparent">`); e *"a maioria dos bloqueados
  continua clicável"* também (dos 36 botões com opacidade condicional, **33
  têm `disabled`** e o navegador recusa de verdade — **o defeito é o silêncio,
  não o clique fantasma**). As duas mudam o pedido das etapas futuras, e por
  isso estão no topo de `demanda-jogo-d3.md` e na pauta.
- **A régua "≥2 leitores" tem duas leituras, e elas dão números bem
  diferentes.** Por *usos*, 25 dos 49 exports de `ui.jsx` qualificam; por
  *arquivos que os usam*, qualificam **6**. A biblioteca entrou pela primeira,
  mas a segunda é a que sustenta o diagnóstico de D1: quase tudo em `ui.jsx`
  saiu do `App.jsx` e continuou a servir só ao `App.jsx`.
- **A comparação é um script, não uma catraca.** Ela prova hoje e não protege
  amanhã. Virá-la `teste-*` exige ter o payload do Figma disponível offline, e
  isso é decisão de arquitetura que não se toma de passagem.
- **Duas peças da lista do `jogo` não entraram:** *a casa do tabuleiro* e *a
  escolha* — e a segunda é grande (**~40 lugares em 6 gramáticas**, quatro
  delas dentro da mesma criação de personagem). Ficam para o próximo ciclo,
  com a medição já feita.
- **O `Selo` ainda não tem o tom "mudou agora"**, e isso trava outra coisa: é
  pré-requisito do degrau *realce* da escala de cerimônia. **Os dois nascem
  juntos ou nenhum funciona.**
- **Um defeito cosmético que fica dito para não virar folclore:** a propriedade
  de texto da razão tem **um** valor padrão para o conjunto inteiro, então na
  folha do Figma a variante *Esperando* exibe a frase do *Impedido*. É feio e
  não é semântico — quem abrir a biblioteca vai estranhar, e agora sabe por quê.
- **A escala de cerimônia ficou ABERTA de propósito**, e é a primeira entrada
  real das "Discordâncias" de `formas.md`. O `jogo` pediu para desenhar junto
  em vez de receber pronto; o `desenho` entregou o Véu incompleto e escreveu
  os dois lados, com uma proposta de **quatro degraus em que só os dois de
  cima são véu**. O risco está registrado por escrito e é o tipo de coisa que
  só se vê antes: **sem o degrau do meio, o `jogo` vai usar o véu leve para
  conquistas — porque é o que a biblioteca lhe dá — e a taverna passa a
  interromper o jogador para lhe dar os parabéns.**

---

## 14/09 18:40 · v9.244 · D2 · o estilo ganha casa própria · commit `5cf555c`

O primeiro ciclo em que o **bastão do `App.jsx` valeu de verdade** — e o
resultado mais útil da etapa não é o arquivo novo, é o que o bastão ensinou
sobre si mesmo (no fim deste bloco).

- **estado inicial:** `.claude/app-jsx` **não existia** — bastão livre,
  tomei-o antes de tocar o arquivo e **apaguei-o assim que as duas linhas do
  `App.jsx` ficaram prontas**, muito antes do fim do ciclo, como manda a
  regra. A outra mente rodava B2 na mesma árvore o tempo todo. Pauta de
  desenho: Fase D, 1 de 6 feita.
- **jogo / desenho:** chamados **juntos, no mesmo turno, os dois em primeiro
  plano**. D2 não decide forma nenhuma — é refatoração —, então dei a cada um
  a metade que ainda era decisão de verdade: ao `desenho`, **nomear** as
  cores que iam sair da string; ao `jogo`, **o que pode dar errado para quem
  está jogando** quando 156 linhas de CSS mudam de ordem. Os dois voltaram
  com o mesmo achado que eu não tinha pedido a nenhum (ver "a caixa errada"),
  o que é a melhor prova de que o par vale mesmo quando a etapa parece
  mecânica. O que decidiram está em `mente/formas.md`, seção "As superfícies".
- **aprendiz:** construiu `src/estilo.js` inteiro, partiu a folha, repontou
  as cinco suítes que liam `constantes.js` como texto, e escreveu a seção
  nova da `teste-arte`. Patch do `App.jsx` pelo padrão `.cjs` com âncora que
  falha — duas linhas, e nenhuma delas encosta num ponto de uso de `T`.
- **testes:** não chamado. A suíte que esta etapa precisava é de forma
  (`teste-arte`), e mora nesta fila.
- **o Figma:** nada entrou. A biblioteca é D3.

### A prova

**`npm run build` limpo · 182/182 suítes verdes · 9/9 varredores limpos.**

A árvore viva mostrava **181/182**, com `teste-regua.mjs` vermelho — e ele
**não é meu**: a outra mente está reescrevendo `testes/regua-combate.mjs` em
B2 neste momento, e as medições dela mudaram (a 1ª queda foi de 4,41 para
4,72). Território do sistema, não consertei e não commitei. Para não subir no
escuro, provei o que realmente importa: extraí `HEAD` para uma cópia isolada,
copiei **só os meus oito arquivos** por cima e rodei a suíte lá — **182/182**.
É a pergunta certa quando duas mentes dividem uma árvore: não "a minha árvore
está verde", e sim **"o commit que eu vou empurrar deixa o `main` verde"**.

**E a prova de "zero diferença na tela"**, que era a única linha da etapa.
Não confiei em contagem minha nem em script meu: pus o **próprio parser do
navegador** a ler as duas folhas. Extraí a folha de `HEAD` para um ficheiro
temporário, servi-a ao lado da nova, e comparei `cssRules` contra `cssRules`
como multiconjunto:

```
regras antes: 45   regras depois: 45
só no antes:  []   só no depois:  []
VEREDITO: IDENTICO
```

O `@import` é a regra `[0]` (se caísse do topo, as três fontes do jogo
morriam **em silêncio**); `document.fonts.check` dá verdadeiro para
Cormorant, Spectral e JetBrains, e o computado na tela é
`"Cormorant Garamond", Georgia, serif` — a fonte certa, não o fallback. Sonda
viva nas quatro superfícies: cortiça `rgb(26,20,36)` com moldura
`rgb(59,42,27)` e **5** gradientes de grão, cartaz nas três paradas exatas,
percevejo de latão e o roxo, vinheta `fixed` com `pointer-events: none`.
**Aba nova**, porque houve rename e o HMR mente. A campanha em curso (*O Fio
de Prata*) nunca foi aberta: as sondas renderizaram fora da tela, no menu.

**A contagem de D1 estava certa e media outra coisa.** São **35** literais de
cor na folha, não 21: os 21 de D1 são os **próprios** do bloco das
superfícies, e faltavam **14 que já são cores de `T`** — exatamente as que
interessam a D5b. Corrigido na pauta.

### Decisões médias, com o motivo

1. **`MATERIAIS`, e não mais entradas em `T`.** `T` é a paleta *semântica* (o
   que a cor **significa**); `MATERIAIS` é a *física* (de que o objeto é
   **feito**). A cortiça não é "o fundo do painel": é madeira, e continua
   madeira no dia em que o tema mudar de humor. Misturá-las faria a tabela
   mentir sobre que tipo de decisão cada linha é. Em **português**, porque a
   lei da casa é essa — o inglês de `T` é herança da extração do `App.jsx`,
   não uma escolha, e o prefixo já desambigua no ponto de uso.
2. **Sombra e brilho viram molde interno, não entrada de tabela.** Oito
   `rgba(0,0,0,x)`/`rgba(255,255,255,x)` que diferem **só no alfa**: seis
   entradas nomeadas esconderiam o único número que importa. `sombra(a)` e
   `brilho(a)` são privados, recebem o alfa como **string** (`sombra(".55")`)
   para render byte idêntico — num arquivo cujo contrato é "zero diferença",
   `0.55` e `.55` são a mesma cor com outro texto, e o texto conta.
3. **O `alfa(cor, a)` NÃO entrou.** Ele converte hex→rgb, que é lógica de
   verdade e merece suíte própria; e cobriria só metade do problema hoje.
   Cada transformação a mais é uma chance a mais de quebrar a única promessa
   da etapa. Fica como pré-requisito escrito de D5b.
4. **`FOLHA` mora no `estilo.js`, não no `App.jsx`.** A ordem da folha é
   regra de cascata — `FONT_CSS` primeiro porque o `@import` tem de ser o
   primeiro —, e regra não mora em quem monta a tela. O `App.jsx` pede
   `FOLHA` e pronto.
5. **A caixa errada, achada pelos dois independentemente.** `.tv-vira-palco`,
   `.tv-vira-face` e `.tv-vira-verso` **não declaram `animation`** e, pela
   letra do enunciado, cairiam nas superfícies. Foram para `MOVIMENTO_CSS`:
   sem o `perspective` e o `backface-visibility`, a carta gira e **não se vê
   nada**. Ficou comentado no arquivo, para o próximo não as "limpar".
6. **`FONT_CSS` não ganhou ponte de compatibilidade.** Tinha exatamente dois
   leitores, ambos repontados aqui. Um reexport sem leitor seria export morto
   no dia em que nascesse — que é a lei que a `teste-ligacao` existe para
   defender. Só `T` ganhou ponte, e essa tem 15 leitores.
7. **A catraca virou defesa da cascata.** `MOVIMENTO_CSS` nasceria com um
   leitor só e quebraria a `teste-ligacao`. Em vez de um perdão, ganhou uma
   seção na `teste-arte` que congela **as duas ordens que mudam pixel**:
   `.tv-fade` antes de `.tv-reliquia` (é isso que faz a carta rara pulsar em
   vez de só aparecer) e o `prefers-reduced-motion` depois dos anéis (uma
   media query não soma especificidade — subi-la dá um acessível que não
   funciona, calado). O segundo leitor deixou de ser pedágio e virou proteção.

### O bastão — o que funcionou e o que falta nele

Funcionou: tomei, usei, **apaguei na hora** (o `App.jsx` estava pronto na
metade do ciclo), e a outra mente trabalhou o tempo todo ao lado sem um
encontrão. Três defeitos do protocolo, que este ciclo expôs:

- **O bastão protege um arquivo; o perigo é a suíte.** Nunca disputei o
  `App.jsx`, e ainda assim a outra mente me deixou vermelho — por
  `regua-combate.mjs`, que não é do meu território nem do bastão. A condição
  de subida "`npm test` inteiramente verde" **é refém de quem não tem bastão
  nenhum**. O que a salvou foi a cópia isolada de `HEAD` + os meus arquivos;
  **isso devia estar escrito no roteiro**, e não ser invenção de ocasião.
- **`git stash` é uma arma apontada para o vizinho.** O `aprendiz` usou-o
  para provar de quem era o vermelho, e por um instante **tirou da árvore o
  ficheiro que a outra mente estava a editar**. Funcionou por sorte. A regra
  devia ser explícita: com duas mentes vivas, **nada de `stash`, nada de
  `checkout --`** — diagnostica-se com `git show HEAD:<ficheiro>` e uma cópia.
- **O bastão não tem como ser devolvido cedo de forma visível.** Apaguei-o a
  meio, o que é o certo, mas nada no repositório regista que ele existiu e
  foi entregue — a outra mente não tem como saber que o `App.jsx` esteve
  ocupado das 15:02 às 15:20. Um registo de entrega (linha no diário ou no
  painel) fecharia isso.

### O que ficou

Duas coisas achadas e **não** consertadas, ambas na pauta: o
`.tv-margem-abas`, que é o `padding-right` da v9.197 outra vez (agora em
`margin`, a ganhar de `mx-4` em seis cartões, e é a queixa do telefone pela
terceira vez); e um `\s` sem barra invertida no regex de
`teste-celular.mjs:56`, que faz a asserção valer menos do que parece.
Nenhuma das duas entrou aqui porque **as duas mudam pixel ou mudam o que a
catraca afirma**, e a linha desta etapa era zero diferença. Registar é mais
honesto do que consertar de carona.

---

## 14/09 16:20 · v9.242 · D1 · o inventário honesto · commit `06e1fa9`

O primeiro ciclo da segunda mente, e ele não muda uma linha de tela de
propósito: **mede**. A Fase A ensinou que medir antes de mexer é o que faz a
mudança seguinte valer; aqui é o mesmo, aplicado ao visual. O resultado tem
um lado desconfortável — **quase todo número que a própria pauta escrevia
estava errado**, e por muito.

- **estado inicial:** 181/181 suítes verdes, 9/9 varredores limpos.
  `.claude/app-jsx` não existia: **ninguém tocou o `App.jsx` neste ciclo**,
  nem eu — D1 é inventário, e o bastão ficou livre para a outra mente, que
  rodava B1 na mesma árvore ao mesmo tempo. Pauta de desenho: Fase D, 0 de 5.
  `mente/formas.md` vazio.
- **jogo / desenho:** chamados **juntos, no mesmo turno**, como manda a mesa
  — forma sem momento e momento sem forma é como nasce a mesma ação com duas
  caras. O `desenho` contou o código por script; o `jogo` **jogou**: campanha
  criada do zero, 6 turnos de Uma Vida, uma partida inteira de Duelo, uma de
  Duelo PvP em duas abas reais, e 3 rodadas do Torneio.
- **aprendiz / testes:** não foram chamados. D1 não constrói nada, e chamar
  uma mão para não usá-la é ruído.
- **o Figma:** nada entrou. A biblioteca é D3, e D1 existe justamente para
  D3 não nascer espelhando o erro (ver abaixo).

### A medição

**As cores.** `T` tem **14** cores, não 15 — está em `src/constantes.js:26`
e dá para contar à mão. São **2.565 usos**, e quatro cores carregam 55% de
tudo: `inkDim` (581), `line` (344), `amber` (272), `ink` (217). O Taverna é,
literalmente, texto cinza sobre painel escuro com borda roxa e acento âmbar.
Três pares são quase-duplicatas pelo valor, não pelo nome — `panel`/`panelSoft`
(ΔL* ≈ 3,4), `onAccent`/`onSecond` (diferença perceptual quase nula, e
`onSecond` tem **8 usos** contra 54 da gêmea), `bg`/`onSecond` (quando a
tinta cai sobre o fundo, some).

**Os literais fora da tabela: a pauta dizia 30, são 242.** Só o `App.jsx` tem
**93** (40 hex + 53 `rgba`) — **3,1× o escrito**. O erro tem explicação: a
contagem antiga olhou hex e ignorou `rgba()`, que hoje é a maioria. Total nos
arquivos de tela: **242**. Fora deles, mais 78 em módulos de dado (cor de
cabelo, de bioma, de divindade — *dado de jogo*, categoria à parte e não o
mesmo defeito) e **49 em `constantes.js`**, dos quais **21 são uma segunda
paleta escondida dentro da string de `FONT_CSS`** (a cortiça, a moldura, o
cartaz, o percevejo, a vinheta). A tabela de cor tem uma paleta não declarada
por dentro.

Desses 242, **67 (28%) já são cores de `T`** — 24 hex idênticos, 43 `rgba`
com o RGB de `T` e alfa. Um helper e uma substituição mecânica apagam mais de
um quarto da dívida. Os outros 175 não são todos descuido: **71 deles, em
`painel-mapa.jsx` + `planta-cidade.jsx`, são uma paleta de pergaminho inteira
e coerente, com zero cores de `T`**. Não é sujeira à espera de faxina; é um
sistema à espera de nome.

**O movimento.** `FONT_CSS` tem **13** classes de animação, não 7 — e duas
das sete que a definição do `desenho` listava (`tv-glow`, `tv-shake`) nem são
classes, são `@keyframes` consumidos por outras. **3 de 13 têm saída por
`prefers-reduced-motion`**, e são as três menos importantes (o sigilo de
espera de uma tela administrativa). As cinco infinitas que rodam durante o
jogo não param para ninguém — `tv-agonia` pulsa vermelho **enquanto o herói
estiver abaixo de ⅓ de vida**, o que pode ser a cena inteira. As famílias
estão todas vivas, mas na proporção errada: `tv-mono` tem **682** usos contra
315 do corpo e 108 do display — a lei diz *"a prosa é a protagonista"*, e a
medição diz que a interface é escrita na fonte que existe para dizer "isto é
um número de sistema". Cruzado com a escala: **542 dos 1.107 textos
dimensionados (49%) são 9px ou 10px**, em 18 degraus de tamanho e 11 raios de
canto.

**As primitivas.** O número que resume: **218 `<button>` crus contra 16
`<Botao>` — 6,8% dos controles do Taverna passam por `ui.jsx`**. Nove dos dez
painéis usam zero primitivas de botão. Dos 49 exports, 33 são ícones, e dos
11 componentes de layout **9 têm um único leitor: o `App.jsx`** — não são
primitivas compartilhadas, são funções que saíram do App e continuaram a só
servir ao App. `:focus-visible` não aparece **uma vez** no projeto, e
`aria-*`/`role=` aparece zero vez nos dez painéis.

### O achado que a fase existe para achar

> **10 famílias de ação aparecem hoje com mais de uma forma. 4 são de
> significado** — o jogador teria de reaprender, ou uma das formas está
> errada. As outras 6 são cosméticas.

As quatro que doem:

1. **confirmar/cancelar** — quatro "cancelar" sem nada em comum além da cor,
   um deles **sem borda nenhuma** (`App.jsx:21070`), que no meio de uma fila
   de botões não parece um botão. E o pior achado isolado do inventário: o
   botão que **remove um companheiro do grupo** (`App.jsx:2540`) usa `#fff`
   sobre `T.danger` — **3,42:1, reprova em WCAG AA**. Os outros destrutivos
   usam `#1A0F0D` (5,48:1). Três tintas de texto-sobre-vermelho, duas
   inventadas na hora, e a ilegível está no único botão que apaga alguém.
2. **fechar um painel** — **8 formas visuais, 4 regras de fecho, e `Escape`
   não fecha nenhuma das 15 sobreposições** (há 6 `onKeyDown` no `src/`
   inteiro, todos `Enter`). Quatro tamanhos do mesmo `✕`, e o mesmo gesto ora
   é um glifo de 10px no canto, ora um botão âmbar de 48px no centro.
3. **"não pode agora"** — **8 opacidades diferentes** em 41 lugares, mas
   `disabled=` em 42 dos 218 botões e `cursor: not-allowed` **4 vezes no
   projeto, todas dentro de `ui.jsx`**. A maioria dos controles bloqueados
   fica translúcida e **continua clicável, com cursor de mão**: o clique não
   é recusado, apenas não acontece.
4. **a ação principal entre os modos** — `Agir →` é mono 12px em `historia`,
   faixa `tv-display` 18px no torneio, outra faixa `tv-display` 18px em
   `rapida`/`duelo`. O `CLAUDE.md` diz que modo é *"lente sobre o mesmo
   motor, nunca um segundo jogo"*. Visualmente, hoje, é um segundo jogo.

As cosméticas, pela escala: **13 assinaturas visuais distintas do botão
primário** (3 raios, 6 alturas, 2 famílias tipográficas — todas dizendo
`background: T.amber`), **15 overlays com 9 fundos, 5 desfoques e 2
z-index** (o de `App.jsx:459` é `z-40` e passa por baixo de qualquer `z-50`
aberto), **4 gramáticas para o veredito antes do clique**, 5 formas de dizer
erro, 2 vermelhos e 2 sinais de menos para o mesmo dano.

### O que o `jogo` viu jogando (e que nenhuma contagem acha)

O `desenho` leu o código; o `jogo` sentou-se e jogou. Metade do que ele trouxe
**não aparece numa contagem de `style={{}}`** — e é por isso que a mesa anda
em par.

- **O Duelo não é jogado, é relatado.** **3 cliques do menu ao resultado
  final**, sem um turno pelo caminho — e o vencedor aparece **antes** das 48
  linhas de log das três quedas. Não há uma linha de tensão no modo inteiro.
- **Vitória e derrota são o mesmo ecrã.** Comparado lado a lado nas duas abas
  do PvP: quem perdeu vê `A Sombra vence · 2×1` na mesma cor e no mesmo
  tamanho que quem ganhou. Nada marca qual campeão era do jogador.
- **A batalha não cabe.** O campo de 16×16 e o painel `Ações` vivem dentro do
  scroller narrativo de **301 px** com `overflow: hidden auto`: clica-se em
  `Ações` e **não aparece nada** — está abaixo da dobra. `⤢ ampliar` promete
  tela cheia e abre outro bloco dentro do mesmo scroller clipado. **O campo
  inteiro nunca foi visto.**
- **Não dava para saber de quem era a vez.** O inimigo ficou `● AGINDO` por
  mais de 10 s enquanto o jogo esperava pelo jogador, cuja linha não tinha
  marca nenhuma. Depois, 3 rodadas escrevendo "me aproximo" com o log só
  reportando o movimento do adversário, a grelha não sendo clicável, e o
  resultado `9 de 9 m nesta rodada` — **nunca andou um metro**, com o jogo
  mandando "aproxime-se primeiro".
- **Um emoji sem rótulo terminou a luta.** `⛺` clicado a meio do combate
  encerrou a partida do torneio sem confirmação e sem dizer o que aconteceu.
  A ação mais irreversível da sessão, atrás do controle mais mudo. E o
  veredito do **Destino** (*"o segundo dado vale — mesmo se for pior"*) mora
  num atributo `title`: invisível sem rato, inexistente no telemóvel.
- **O momento não é marcado.** A conclusão da primeira missão da campanha foi
  a **quarta de seis pílulas cinzentas idênticas**, sem pausa, sem som, sem a
  barra de XP enchendo. O jogo tem o padrão certo e usa-o uma vez só: o modal
  do dado, que escurece a tela e revela "Falha" em vermelho — *"o único
  momento da sessão inteira em que senti que estava a jogar"*.
- **E a lei mais partida do dia não é de cor, é de texto.** *"O sistema não
  fala de si mesmo"* — **13 strings de bastidor chegam à tela**, com a quota
  de API do autor à cabeça: `Limite diário alcançado (500 chamadas)… me
  avise: o teto sobe` (`api/_portao.js:174`, renderizado no log de jogo),
  `sem gastar tokens`, `semente`, `selo da luta`, `roster` ×4, `o modelo
  forte`, `espinha`, `tabelas geradoras`, `canal`. Uma cor errada faz o jogo
  feio; `sem gastar tokens` no inventário faz o jogo deixar de ser um jogo.

### A prova

| o que a pauta dizia | o que a medição achou |
|---|---|
| 15 cores em `T` | **14** |
| 30 literais no `App.jsx` | **93** (242 no projeto de tela) |
| 7 animações | **13** classes (3 com saída) |
| — | **218 `<button>` crus / 16 `<Botao>`** = 6,8% |
| — | **10 famílias de ação com duas caras**, 4 de significado |
| — | **13 strings de bastidor na tela** |
| — | `#fff` sobre `T.danger` = **3,42:1**, reprova AA |

### decisões médias tomadas

- **Corrigi a Fase D em quatro pontos, em vez de a executar como escrita.**
  Foi assim que A1 e P1 acertaram as suas fases, e a régua aqui é a mesma:
  medição que contradiz a pauta corrige a pauta, não se cala.
  - **D2** dizia que levar `T` e `FONT_CSS` para `src/estilo.js` é "zero
    diferença na tela". É verdade para `T`; **não é para `FONT_CSS`**, que
    não é tabela e sim 156 linhas de CSS com 21 cores literais próprias e 4
    classes de layout. Mover inteiro só mudaria o arquivo onde o problema
    mora — e D5 não conseguiria varrer as cores de `FONT_CSS` sem varrer a si
    mesma. D2 agora parte o destino em três: `FONT_CSS`, `MOVIMENTO_CSS`,
    `SUPERFICIES_CSS`. Ficou registrada a armadilha que custaria caro:
    **`App.jsx:10205` e `:10222` têm uma variável local chamada `T` que é o
    torneio**, não o tema; patch por regex sobre `\bT\b` no App atinge-as.
  - **D3** ia nascer espelhando `ui.jsx` cru — 49 componentes, 33 ícones, 4
    mortos, e **sem** os cinco controles onde a divergência de verdade mora.
    A biblioteca espelharia os 6,8%. Agora entram as primitivas com ≥2
    leitores reais **mais** destrutivo, fechar, sobreposição, badge e barra.
    E ficou dito que desenhar o foco no Figma é **inventar**, não espelhar.
  - **D4** catalogava botões. O `jogo` mostrou ações que o jogador toca e que
    **não são controles** (mover em combate, que o jogo manda fazer e não dá
    forma de fazer) e controles **sem rótulo** (`⛺`, `🎲`, `⤢`). Sem estarem
    na lista, passam pela catraca por não existirem.
  - **D5 era impossível como estava.** "Nenhuma cor literal fora da tabela"
    são 242 violações hoje — uma lista de perdão com 242 entradas não é
    catraca, é inventário com outro nome; e a regra bate em `constantes.js`,
    ou seja **a tabela violaria a própria regra**. "Nenhum controle sem forma
    declarada" são 218 `<button>` sem nenhum mecanismo que ligue um ao outro.
    Reescrita em **três dentes que fecham em ordem, cada um verde no dia em
    que nasce**: D5a a catraca do teto (a contagem atual congelada, falha se
    subir — zero perdões, verde hoje, a dívida só desce), D5b a catraca do
    fácil (literal que já é cor de `T`), D5c a catraca do movimento. A
    cláusula dos controles **sai de D5** e vira etapa depois de D4: só se
    exige forma de todo controle quando existir a primitiva que a carrega.
    Escopo fixado em `src/**` + `index.html` + `api/*.js` — nunca o
    repositório inteiro, porque **`testes/render-teste.mjs` é um bundle
    esbuild commitado com uma cópia de `T` e 56 hex** e daria 56 falsos
    positivos a quem globasse ingenuamente.
- **Abri D6 · o sistema para de falar de si mesmo.** A lei mais partida do
  dia não cabia em D5 como estava escrita, e é grande demais para virar item
  solto: 13 strings, e `check-formas.mjs` ganha um quarto dente com lista
  negra de vocabulário de bastidor — **com `api/*.js` no varrimento**, porque
  a pior string de todas vem de lá e chega inteira ao jogador.
- **Corrigi os números errados em `.claude/agents/desenho.md`** (15 cores, 7
  animações, quatorze painéis). Cabeçalho errado é `leve` pela tabela, e
  deixá-lo mentir significava que todo `desenho` futuro leria a mentira antes
  de medir.

### o que ficou

- **Nada foi consertado — nem uma cor.** A etapa é o retrato, e conserto de
  carona é exatamente o erro que ela existe para não cometer. Os 67 literais
  que já são `T` estão medidos e esperando; foram **deliberadamente** deixados
  em paz.
- **7 itens foram para "Para a pessoa decidir"**, todos com o número que os
  sustenta: a batalha tomando a tela, o Duelo jogado queda a queda, a sala ao
  vivo com momento partilhado, mover sem depender do Narrador, `Esc` fechando
  as 15 sobreposições, a escala de texto virando tabela, e a ação principal
  igual nos três modos. **15 foram para "Aberto"** (leve e médio), na ordem
  do retorno.
- **A cobertura tem buracos declarados.** O `desenho` não jogou: a seção das
  10 famílias é leitura de código, e se duas formas nunca aparecem na mesma
  sessão, o custo real é menor que o número sugere — cruzar com o `jogo`
  antes de D4. E **o Narrador morreu a meio da sessão** (quota diária de 500
  chamadas), então **O Capítulo não foi jogado e nenhuma tela de vitória ou
  morte de Uma Vida foi vista**. O que se diz aqui sobre "o fim" vale só para
  o Duelo.
- **Vermelho do outro território, não consertado, como manda a lei:** o
  `jogo` achou frases montadas por concatenação que se partem na tela — *"Em
  a areia aberta"*, *"está em atrás do bloco de gelo"*, *"Chegar a a
  capela"* — e uma missão dada como concluída (`Tirar Halvard de lá`) no
  mesmo turno em que o Narrador escreveu que a capela estava vazia. É regra e
  texto de motor: fila do sistema, não desta. Fica aqui anotado para o
  `conselheiro` pegar.
- **Colisão de nomes entre as duas filas:** `mente/pauta.md` tem um `D2 · O
  Duelo na mesa` e um `D3 · As duas portas da arena`, e `pauta-desenho.md`
  tem outro `D2` e outro `D3`. Quatro etapas vivas com dois nomes. Não é
  design, mas vai custar um mal-entendido a alguém — a próxima fase de uma
  das filas que escolha outra letra.

---

## 14/09 · a segunda mente nasce · (ainda sem ciclo)
- **estado inicial:** `jogo`, `desenho` e `aprendiz` criados e nunca
  chamados; Fase D aprovada, 0 de 5; `mente/formas.md` vazio.
- **o que se fez:** a fila do desenho ganhou pauta e diário próprios, um
  `regente` para conduzi-la, e um bastão para o `App.jsx` — que é o único
  lugar onde as duas mentes se encontram.
- **o que ficou:** o primeiro ciclo de desenho ainda não rodou.
