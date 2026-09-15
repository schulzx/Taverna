# K1b · o relógio de 15 s, e o que ele cobra (bloco do `desenho`)

Etapa K1b. **Nenhum `.js`, `.jsx` ou `.mjs` foi tocado**, e o `App.jsx` está com a
outra mente. Arquivo Figma `Taverna — biblioteca` (`e5wJUzInAssoebx5npssKc`),
**ampliado, nunca duplicado**. Tudo ligado a variável; zero hex solto (conferido
por leitura de nós, não por imagem).

Duas coisas nesta etapa, e são independentes uma da outra:

1. **O cartão tem de aguentar 15 s sem virar ansiedade.** É ofício, e é meu.
2. **`lineStrong` nasce.** A proposta de K1 foi aprovada pela pessoa em 15/09.

---

# PARTE 1 · os quinze segundos

## O que a pessoa decidiu, e não se discute

- **O dano fica em segredo.** *"o dano vir surpresa e aumentar o relógio — daria
  mais emoção e realmente se compararia a uma reação."* A reação é **instinto,
  não cálculo**.
- **A janela sobe de 4 s para 15 s**, *"pra que fique tranquilo até pra pessoas
  com dificuldade"*. **Os 15 s são folga deliberada, e a folga é o ponto.**

## O problema, dito antes da solução

K1 desenhou um trilho que desce **linear durante 4 000 ms**. A leitura ingénua da
decisão da pessoa é trocar `4000` por `15000` e ficar por aí. **Isso estraga a
decisão dela.**

Uma barra que leva quinze segundos a esvaziar-se não lê como folga. Lê como
**pressão prolongada**, que é o oposto exato do que foi pedido — e por duas razões
que não são de gosto:

- **Movimento em visão periférica captura a atenção sem pedir licença.** O começo
  abrupto e o movimento são das poucas coisas que capturam atenção de forma
  involuntária, mesmo quando irrelevantes (**Yantis & Jonides**, *JEP:HPP* 1984,
  sobre o começo abrupto; **Franconeri & Simons**, *Perception & Psychophysics*
  2003, sobre movimento). Isto é um **RPG de texto**, e a lei da casa diz que a
  prosa é a protagonista. Uma barra a mexer-se durante 15 s são **quinze segundos
  de imposto sobre a leitura**, cobrados a cada golpe recebido.
- **E o pior: ela fica PIOR no seu único trabalho.** Um estímulo em movimento que
  está presente continuamente habitua-se. Ao segundo 14 — o segundo em que o
  relógio finalmente importa — a barra já está no canto do olho há catorze
  segundos, e já não anuncia nada. *Uma barra de 15 s é ao mesmo tempo mais cara
  e menos eficaz que uma barra de 4 s.*

## A decisão: **a barra não corre 15 s. Corre 4.**

E os 4 não são um número novo: **são os 4 000 ms que K1 mediu e provou** (1,5 s de
reconhecer + 0,513 s de Fitts com o `W` honesto da altura do chamado, dobrado por
causa de quem não estava a olhar = 4,03 s). K1 tinha esse número certo e usou-o no
sítio errado — como **a janela inteira**. Ele não é a janela: é o **prazo**.

> **Os 15 s partem-se em dois, e nenhum dos dois é novo.**
> **11 000 ms de folga**, em que não há relógio nenhum na tela.
> **4 000 ms de trilho** — o K1 inteiro, intacto, no fim.

**Porque é que isto é a folga que a pessoa pediu, e não um truque:** durante onze
segundos o cartão está lá, parado, e **não cobra nada**. Não há nada a mexer-se, não
há nada a encolher, não há nada a ficar vermelho. Quem lê devagar lê devagar. Quem
foi buscar café voltou. **A folga que não se vê é a única folga que se sente** — uma
folga com um cronómetro por cima é um prazo generoso, que ainda é um prazo.

E o trilho, ao nascer aos 11 s, faz uma coisa que uma barra contínua nunca poderia
fazer: **começa abruptamente.** É exatamente o começo abrupto que o Yantis & Jonides
descreve como capturador involuntário de atenção. *A mesma propriedade que torna
uma barra de 15 s um imposto torna uma barra que nasce aos 11 s um anúncio.*

### E isto responde ao risco oposto, que é real: a janela que não se anuncia perde-se

**A janela anuncia-se DUAS vezes**, com onze segundos de intervalo:

1. **Ao nascer** — o cartão entra (120 ms, `opacity` + `translateY(6px)`), na linha
   do veredito, com o cordão de `danger` na aresta. É o anúncio que K1 já tinha.
2. **Aos 11 000 ms** — o trilho nasce. E depois dele ainda sobram **os 4 000 ms
   completos** que K1 mediu para quem *não estava a olhar*.

Ou seja: **para perder esta janela é preciso falhar dois anúncios separados por
onze segundos, e o segundo deles deixa ainda o orçamento inteiro de K1 para
reagir.** A janela de 4 s de K1 pedia que se acertasse um anúncio só. Esta é
estruturalmente mais difícil de perder — e digo *estruturalmente*, não com um
número, porque **a probabilidade de falhar um anúncio não é coisa que eu possa
medir no Figma. É K4 que a mede**, e fica escrito aqui como a pergunta que ele tem
de fazer.

### O corolário de K1 pesa mais agora, e o novo formato é o que o salva

K1 escreveu que **contagem regressiva em segundos é o sistema a falar de si mesmo**.
A 15 s isso deixa de ser um corolário e passa a ser um desastre: um contador que
diz `15, 14, 13…` durante quinze segundos no meio de prosa não é um relógio de
jogo, **é um temporizador de bomba**.

Com o trilho no fim, a contagem conta **5, 4, 3, 2, 1**. K1 já tinha escrito que
*"quatro repintes é o sinal honesto mínimo"*; cinco cumpre-o. **A variante
`Tempo=Contagem` passa de inaceitável a correta sem mudar de forma — só de sítio.**

E daí sai uma regra tipográfica que é também um teto:

> **A contagem nunca mostra dois dígitos.** Um dígito lê-se como *"quase"*; dois
> lêem-se como *um prazo*, e são outro objeto. Logo **`trilho` nunca passa de
> 9 000 ms** — e a tabela abaixo já está no seu teto.

## `prefers-reduced-motion`: o bónus mantém o tamanho e muda de denominador

K1 dava **+1 000 ms** sob movimento reduzido, e a razão era exata: *uma barra lê-se
de canto de olho; um numeral exige fixar e ler* (uma fixação de ~200-250 ms por
leitura, e nenhuma taxa). Perguntei-me se a 15 s esse bónus ficava irrelevante.
**Fica — se for somado à janela. Não fica, se for somado ao trilho.**

| onde se soma | +1 000 ms vale | veredito |
|---|---|---|
| à **janela** (15 000 → 16 000) | **+6,7 %** | é não pagar nada; o bónus morre |
| ao **trilho** (4 000 → 5 000) | **+25 %** | **os mesmos +25 % que K1 mediu** |

**Decisão: o bónus soma-se ao trilho.** Ele mantém o valor (`1000`), mantém o
significado (o preço da fixação) e mantém a proporção. E repare-se no que isto diz
sobre o formato novo: **se a barra corresse os 15 s, manter a proporção de K1 exigiria
+3 750 ms e uma janela de 18,75 s, que é absurda.** *O trilho no fim não conserta só
a ansiedade — é o que salva o bónus de movimento reduzido de ser irrelevante ou
absurdo.* Não havia terceira hipótese.

## As tabelas (primeira lei da casa: se é número, é tabela)

**Onde vivem:** `src/reacoes.js`, ao lado de `RITMOS_DA_REACAO` e
`ESCADA_DO_SILENCIO`, que K1 já lá pôs. São tabelas de **regra**, não de estilo —
o que está nelas é *quanto tempo*, e tempo é jogo. O que é meu é a **repartição**.

```js
/* O RELÓGIO QUE SE VÊ — tudo em ms, contado do instante em que o cartão nasce.
 *
 * DOIS DONOS, UMA TABELA. `janela` é do `jogo` (a pessoa fixou 15 000 em 15/09).
 * `folga`, `trilho` e `aperto` são do `desenho`: dizem O QUE ESTÁ NA TELA e
 * QUANDO, que é a metade que faz 15 s lerem-se como folga em vez de como prazo.
 *
 * AS TRÊS INVARIANTES, e a suíte confere as três:
 *   folga + trilho === janela   — um cartão não pode mentir sobre o próprio tempo
 *   trilho <= 9000              — a contagem nunca chega a dois dígitos
 *   aperto < trilho             — o aperto é o FIM do trilho, não o trilho
 */
export const RELOGIO_DA_REACAO = [
  { id: "normal",  janela: 15000, folga: 11000, trilho: 4000, aperto: 1000 },
  { id: "folgado", janela: 19000, folga: 11000, trilho: 8000, aperto: 1000 },
  { id: "parado",  janela:     0, folga:     0, trilho:    0, aperto:    0 },
];

/* O bónus soma-se ao TRILHO, nunca à janela. O que ele paga é a diferença entre
 * ler uma barra de canto de olho e fixar um numeral, e essa diferença mora
 * inteira no trilho: +1000 sobre 4000 são os mesmos +25% que K1 mediu; +1000
 * sobre 15000 seriam +6,7%, que é não pagar. (`folgado` + contagem = 9 000,
 * exatamente o teto de um dígito: a tabela está cheia e não pode crescer.) */
export const BONUS_DO_TRILHO = { contagem: 1000, toque: 600 };
```

**E a escada do silêncio também muda de denominador, pela mesma razão.** K1 dobrava
a janela (4 000 → 8 000). A escada passa a dobrar **o trilho** (4 000 → 8 000, com a
folga intacta nos 11 000). Quem deixou expirar uma janela de 15 s não ficou sem
*aviso* — ficou sem *prazo*; dar-lhe mais folga seria dar-lhe mais do que já lhe
sobrava. **O número `8000` de K1 sobrevive byte a byte; muda o que ele mede.**

### O que está na tela, minuto a minuto — e **nenhuma peça nova**

| de → a | o que se vê | a variante, que **já existe** |
|---|---|---|
| **0 → 11 000** | o cartão, e nada mais. Sem trilho, sem contagem. | **`Tempo=Parado`** |
| **11 000 → 14 000** | o trilho, âmbar, a descer linear | `Tempo=Barra` · `Pressa=Sobra` |
| **14 000 → 15 000** | o trilho, `danger`, a acabar | `Tempo=Barra` · `Pressa=Pouco` |

**Isto é a lei *uma ação, uma forma* a pagar-se sozinha, e é o melhor momento da
etapa.** Fui ao Figma para fabricar uma variante *"cartão sem relógio"* e ela já
estava construída: **`Tempo=Parado` é exatamente isso**, e K1 construiu-a para outra
coisa — o ritmo `parado` da ficha (*«eu decido, sem pressa»*) e o leque, que não
expira. **A fase da folga não precisa de peça: precisa de uma transição entre duas
variantes que a biblioteca já tem.** Zero nós novos na peça.

E as proporções de `Pressa` continuam certas sem lhes tocar: K1 provou
`quanto sobra`/`quanto passou` = **62/38** em `Sobra` e **17/83** em `Pouco`. Num
trilho de 4 000 ms, 62 % são 2 480 ms restantes e 17 % são 680 ms — **dentro da banda
de `aperto` (1 000 ms)**, que é onde `Pouco` tem de cair. Conferido, não suposto.

### As linhas novas para a tabela de movimento (`formas.md` ~2224)

| o que | quanto | curva | sob `prefers-reduced-motion` |
|---|---|---|---|
| **o trilho nasce** (`Parado` → `Barra`) | **240 ms**, só `opacity` | `ease` | **vira `Tempo=Contagem`**, aparece a seco |
| o trilho corre | `trilho` (4 000 / 8 000) | **linear** | vira `Tempo=Contagem` |
| `Pressa=Sobra` → `Pouco` | 90 ms, só a tinta | `ease` | troca a seco |

**O trilho nasce CHEIO e já a descer** — os 240 ms de aparição correm dentro dos
4 000, não antes deles. No instante em que fica visível mostra o que resta, e nunca
mostra 100 % durante 240 ms parados, que seria um relógio a mentir 6 % do seu
tempo. *Classe nova para K3: **`tv-trilho-nasce`**.* As linhas de K1 ficam todas.

## As portas fechadas contra o vazamento do dano

A pessoa proibiu o número. **Um segredo só é segredo se for fechado por todos os
lados** — e há doze portas por onde o mesmo número entraria com outro rosto. Estão
desenhadas na folha de prova (secção *as portas fechadas*) e são estas:

| a porta | o que a fecha |
|---|---|
| **a cor** | a tinta do cartão nunca muda com o golpe. `amber → danger` acontece por **tempo** (o último segundo), nunca por tamanho de dano. |
| **o tamanho** | as oito variantes medem **344**. A altura sai do número de reações e do comprimento do verbo — nunca de `a.r.dano`. |
| **a espessura** | o cordão é 3 px sempre; o trilho é 4 px sempre. Nenhum dos dois é função de nada. |
| **o movimento da entrada** | 120 ms, `opacity` + `translateY(6px)`, a mesma curva para todo golpe. Nada escala: nem a distância, nem a duração, nem a amplitude. Nada de tremor proporcional. |
| **o ícone** | o glifo é o da **reação** (`reacoes.js.icone`), propriedade da reação e não do golpe. Um glifo que variasse com o golpe seria o número desenhado. |
| **a duração da janela** | **a mais subtil, e a que alguém vai querer abrir.** Se um golpe grande desse menos tempo, **o relógio SERIA o dano**, lido como duração. `janela` é constante do ritmo — nunca uma função do dano. O argumento sedutor (*"um golpe perigoso merece mais urgência"*) fica aqui recusado por escrito, para que a recusa seja deliberada e não acidental. |
| **quais reações aparecem** | o leque filtra por perfil e por PM (`reacoesDe`), nunca por *"valeria a pena contra este golpe"*. Esconder `aparar` num golpe pequeno faria a **ausência** dizer o tamanho. |
| **a ordem das reações** | a ordem é a da tabela, sempre a mesma. Uma ordem que se reordenasse por eficácia contra *este* golpe é um ranking do dano. |
| **o texto do preço** | sai de `reacoes.js.corta` como **proporção** — *corta metade*, *corta a maior parte*. **Nunca `9 vira 4`.** É por esta porta que o número entraria, e é a que a pessoa fechou à mão. |
| **a linha do golpe** | verbo + ator, a mesma gramática sempre. **Sem advérbio de intensidade** — *"com força"*, *"de raspão"*, *"em cheio"*: um advérbio é o número em três sílabas. |
| **o clarão do dano** | `.tv-dano` dispara **depois** de o dano assentar, nunca antes da janela. Um clarão pré-janela que escalasse com o golpe é o número pela porta dos fundos. |
| **a posição** | o cartão mora sempre na linha do veredito. Nunca mais perto, nunca maior, nunca mais acima por ser grave. |
| **a barra de PV do herói** | **a maior de todas.** `a.r.dano` já existe e ainda não virou PV. Se a barra de PV, o retrato ou o número se mexessem enquanto a janela está aberta, o jogador lia o dano **exato**, por subtração. **Nada na ficha se mexe antes de a janela resolver.** |

### E uma porta que **não se fecha**, dita em vez de escondida

**A existência do cartão.** `reacoes.js:93-94` já recusa gastar reação em arranhão,
logo o cartão só abre acima desse patamar: **a sua existência diz *"isto não é um
arranhão"***. É **um bit, não uma magnitude**; é **regra, não desenho**; e já existia
antes desta etapa. O segredo que a pessoa pediu é o do **tamanho**, e esse fica
inteiro. Fica escrito porque um buraco calado é mentira.

### E o item da pauta que esta decisão mata

A pauta do `jogo` tem **«o número já existe — a conta feita antes do clique»**
(`pauta-desenho.md:40-71`), que propõe *"o ogro do beco — 9 de dano a caminho"* e
*"aparar · 0 PM — 9 vira 4, você fica em 13"*. **A decisão da pessoa recusa-o
diretamente.** Mas o item já tinha escrito a sua própria saída, e vale a pena ler
outra vez:

> *"E se a pessoa disser que não, a Fase K continua a fazer sentido — mas então o
> relógio tem de ser mais generoso, porque a conta passa a ser dele."*

**A pessoa disse que não E deu o relógio generoso, na mesma frase.** As duas metades
da decisão chegaram juntas, e não é coincidência: **os 15 s são o preço do segredo,
já pago.** Quem escrever a pauta que o item morreu tem de escrever isto também,
senão fica a parecer que a mesa perdeu um argumento em vez de o ter cobrado.

*(E a outra metade do argumento dele — «sem o número a ordem das reações nunca muda»
— cai sozinha no caso comum: com **uma** reação, o leque não tem ordem nenhuma. A
decisão é «gasto PM ou não», e o desconhecido é o que a torna aposta em vez de
conta. Que é, literalmente, o que a pessoa pediu.)*

## O que é meu na conta dos quatro inimigos, e o que é do `jogo`

A pauta de K1b diz que o relógio dispara **por golpe recebido**, e que com quatro
inimigos 15 s viram até um minuto de espera por rodada. **O agrupamento e o teto
são do `jogo`** — ele está nisso neste mesmo turno. O que é meu é uma restrição
sobre a forma, e entrego-lha como restrição e não como sugestão:

> **Nunca há dois cartões na tela ao mesmo tempo. Nunca.**
> Dois cartões são duas perguntas sob uma atenção só, e uma pilha de cartões é uma
> **lista de tarefas** — que é o objeto exato que a Fase K existe para não ser. A
> lateral de 344 px tem lugar para um.

**E o que isso lhe custa, dito para ele não descobrir tarde:** se dois golpes do
mesmo turno se agruparem, **a linha do golpe tem de dizer o facto agrupado numa
frase só** — e essa gramática é dele. Da minha parte não precisa de peça nova:
`Etapa=Chamando` estica para duas linhas sozinha, que é a mesma medida que K1
provou para o aviso do silêncio (quadro 9, quarto caso).

---

# PARTE 2 · `lineStrong` — a paleta ganha o degrau que faltava

**Aprovado pela pessoa em 15/09** (`pauta-desenho.md:73`). Nasce aqui.

## A doença, relembrada em três números

| | contra `panel` |
|---|---|
| `bg` | 1,07:1 |
| `panelSoft` | **1,07:1** |
| `line` | **1,29:1** |

As quatro superfícies da casa cabem dentro de **1,3:1** umas das outras: para a
**WCAG 1.4.11** (piso 3:1 para elemento não textual) **são uma superfície só**. A
única coisa na casa que dizia *"sou um controlo"* acima do piso era encher-se de
`amber` (**8,45:1**). **Ou grita, ou desaparece.**

**E a doença está escrita em código, duas vezes, na mesma forma:**

```
ui.jsx:26    primario ? "none"   : `1px solid ${T.line}`      (Botao)
ui.jsx:394   ativo ? T.amber : T.line                          (CartaoDeEscolha)
```

*Duas ternárias, o mesmo `else`, e o `else` é 1,29:1.* A biblioteca do Figma
concorda byte a byte — `Botao` (`9:170`) tinha **16** corpos contornados a `line` e
`A escolha` (`20:77`) tinha **9**. Não é uma suspeita minha: é o mesmo defeito
escrito nos dois lados da ponte.

## O valor: **`#70688C`**, confirmado — e a razão dele, corrigida

**As três medidas de K1 confirmam-se byte a byte:**

> `panel` **3,51:1** · `bg` **3,74:1** · `panelSoft` **3,27:1**

Todas acima do piso de 3:1 da WCAG 1.4.11. **O piso que o token instala na casa é o
pior dos três: 3,272.**

**Mas K1 escreveu uma coisa falsa sobre ele, e eu fui medir outra vez.** K1 diz que
`#70688C` é *"o degrau **mais baixo** que passa 3:1"*. **Não é.** K1 testou cinco
degraus de uma escada de 6 em 6 e este foi o mais baixo *daquela escada* — mas uma
varredura byte a byte na mesma reta de matiz mostra que **`#6B6387` já passa, a
3,040:1**, e que há **cinco** degraus entre os dois:

| | pior das três superfícies | folga sobre o piso |
|---|---|---|
| `#6B6387` | 3,040 | **1,3 %** |
| `#6C6488` | 3,085 | 2,8 % |
| `#6E668A` | 3,178 | 5,8 % |
| **`#70688C`** | **3,272** | **9,1 %** |

**O valor FICA em `#70688C`, e a razão muda de frase.** Não é *o mais baixo que
passa* — é **o mais baixo que passa com folga**. A diferença visual entre `#6B6387`
e `#70688C` é indistinguível; a diferença de margem não é, e a superfície mais
apertada (`panelSoft`, 3,27) é também a que mais provavelmente muda um dia. **Uma
fronteira com 1,3 % de folga é uma fronteira que a próxima mexida na paleta quebra
em silêncio.** *(É a segunda vez em duas rodadas que uma afirmação confortável
minha sobre contraste não sobrevive a ser medida. Da primeira foi o «cumprido com
folga em todos»; desta foi o «o mais baixo que passa». A lição é a mesma e ainda
não a aprendi: **não declarar o que se pode medir.**)*

## A regra que separa `lineStrong` de `line` — e é o que impede que ele vire "o novo line"

> **`line` é a linha que SEPARA.** Divisória, régua, filete, o `h-px` de
> `DivisoriaRunica` (`ui.jsx:315/317`). Não delimita alvo nenhum, e por isso 1.4.11
> não se lhe aplica: **`line` não está errado no seu trabalho.**
> **`lineStrong` é a linha que DELIMITA UM ALVO.** A borda de um controlo.

**`lineStrong` não substitui `line` — divide um significado que estava a fazer dois
trabalhos com uma cor só.** É por isso que o `scope` da variável é **só
`STROKE_COLOR`**: ele nunca é fundo e nunca é tinta. *(E há um número que o prova:
`ink` sobre `lineStrong` dá **4,09:1**, que reprova o AA de texto normal. Se alguém
o usar como cor de letra, quebra. O scope é o que o impede.)*

## Onde ele vive, e quem o lê

**Em `T`, em `src/estilo.js`** — **eu não escrevo o arquivo**. O que o executor
aplica é uma linha, e ela vai ao lado de `line`:

```js
line: "#2E2745", lineStrong: "#70688C",
```

**No Figma:** `VariableID:88:2`, coleção *Paleta semântica (T)*, valor `#70688C`,
`scopes: ["STROKE_COLOR"]`, e **ganhou nesta etapa o `codeSyntax` WEB
`T.lineStrong`** — era **a única das 28 variáveis sem a ponte de código**, porque
tinha nascido como proposta. A descrição deixou de dizer *"à espera da pessoa"*.

### Os ≥2 leitores, nomeados — e os dois existem **hoje**, sem esperar K3

1. **`src/ui.jsx:26`** — `Botao`, a borda do não-`primario`.
2. **`src/ui.jsx:394`** — `CartaoDeEscolha`, a borda do não-`ativo`.

**Não entram, e a recusa é o que mantém o token honesto:** `ui.jsx:315/317`
(divisória — separa, não delimita) e `ui.jsx:504` (`CartaoDeDado` — é um `<div>`, não
é alvo de toque). Esses ficam em `line`, que é onde devem estar.

### O que a catraca de D5 faz — **lido no varredor, não suposto**

Fui a `testes/check-formas.mjs` conferir, porque a pauta manda confirmar em vez de
presumir. As quatro coisas que importam:

- **`ZONAS_DE_TABELA` (`:244-247`): a zona `T` é `d5a: "isenta", d5b: "isenta"`.**
  Confirmado. Uma cor nova dentro da zona `T` não conta em nenhum dos dois dentes.
- **O teto por arquivo NÃO mexe.** `TETO_DE_LITERAIS["src/estilo.js"] = 13` conta
  literais **fora** das zonas (`:441`, `if (!dentro || dentro.d5a !== "isenta")`), e
  os 13 são os `rgba()` do `MOVIMENTO_CSS`. `lineStrong` nasce **dentro** da zona.
  **13 continua 13.** `TETO_DE_COR_DE_T["src/estilo.js"] = 13`: idem, pelo mesmo
  `if` em `:442`. **A catraca fica verde sem se lhe tocar.**
- **`ALCANCE_MINIMO.pisoDeZona: 10`** é um **piso**, não uma igualdade — e o
  comentário diz porquê, textualmente: *"`T` tem de poder ganhar a décima quinta cor
  sem ficar vermelho"*. A zona passa de 14 para 15 medidas. Verde.
- **A armadilha que eu quase não vi, e que é a única real:**
  `CORES_DE_T = new Set(Object.values(T).map(rgbDoHex))` (`:377`). **Acrescentar
  `lineStrong` acrescenta `70688c` ao conjunto do D5b** — e se `#70688C` estivesse
  escrito à mão em qualquer lugar de `src/`, esse arquivo passaria a ter uma cópia
  a mais e **a suíte ficaria vermelha no dia em que o token nascesse**, num arquivo
  sem relação nenhuma com esta etapa. **Medido: `#70688C` não aparece em `src/`,
  `testes/`, `api/` nem `index.html`. Zero ocorrências.** Verde — mas por medida, não
  por sorte.

### A lei do export morto: ela **não morde**, e isso é um buraco

`testes/teste-ligacao.mjs:104` varre com
`/^export (?:async )?(?:function|const|class) (\w+)/gm` — **nomes de export de topo**.
`lineStrong` é uma **propriedade de `T`**, não um export. **A catraca não o vê.**

Então: **um token com zero leitores passa por todos os portões desta casa.** D5a é
cego (zona isenta), D5b é cego (zona isenta), `teste-ligacao` é cego (não é export).
Os meus dois leitores são uma **promessa**, e esta casa não aceita promessas. É daí
que sai a proposta ambiciosa, mais abaixo.

## Os 31 nós, em 3 peças (aplicado no Figma nesta etapa)

| peça | nó | quantos | o que mudou |
|---|---|---|---|
| **`Botao`** | `9:170` | **16** | os corpos contornados trocaram `line` → `lineStrong`. É a peça que `ui.jsx` espelha. |
| **`A escolha`** | `20:77` | **9** | os corpos **não escolhidos** (`Repouso`, `Impedida`, `Foco` das três formas). `Escolhida` continua em `amber`: os dois extremos já existiam — **faltava o meio**. |
| **`O verbo com preço`** | `64:2446` | **6** | `Papel=Gesto` ×3 trocou `line` → `lineStrong`; **`Papel=Recuo` ×3 ganhou contorno pela primeira vez** (`64:2423`, `64:2431`, `64:2439`). |

**Por que `A escolha` era a que mais precisava:** a fila *«quando um golpe chega»* da
ficha são quatro instâncias de `Forma=Pílula`, e **três delas estão sempre por
escolher**. Essa fila é a **saída de conformidade da WCAG 2.2.1 da Fase K inteira** —
e *um controlo de acessibilidade que não se lê como controlo é uma saída que não
existe*. O token entra pela porta certa.

*(Nota de precisão: `Estado=Impedido`/`Impedida` é **isento** da 1.4.11 — a norma
exempta componentes inativos. Levam `lineStrong` na mesma, por consistência
geométrica, e a isenção é o que torna legal a opacidade de 0,4 que os apaga.)*

## O remendo que ele paga — **7 overrides, apagados**

K1 confessou-o assim: *"O recuo sem borda parece texto, não controle — e eu
aceitei-o em vez de o resolver. Subi-lhe o verbo a `ink` (override declarado na
composição)."* **Fui procurar o remendo e ele são sete nós**, um por variante de
`A pergunta que expira` que carrega um recuo — todos o nó `o verbo` (`;64:2426`):

| variante | nó |
|---|---|
| `Etapa=Direta, Tempo=Barra` | `I84:3014;64:2426` |
| `Etapa=Direta, Tempo=Contagem` | `I84:3037;64:2426` |
| `Etapa=Direta, Tempo=Parado` | `I84:3059;64:2426` |
| `Etapa=Chamando, Tempo=Barra` | `I84:2617;64:2426` |
| `Etapa=Chamando, Tempo=Contagem` | `I84:3082;64:2426` |
| `Etapa=Chamando, Tempo=Parado` | `I84:3105;64:2426` |
| `Etapa=Escolhendo, Tempo=Parado` | `I70:84;64:2426` |

**Estão desfeitos: os sete voltaram a `inkDim`**, que é o valor da peça. E os sete
corpos herdaram o contorno `lineStrong` do componente — conferido nó a nó, por
leitura.

**E o remendo era pior do que K1 pensava.** Ao subir o verbo do recuo a `ink`
(**14,37:1**), ele ficava com **exatamente a mesma voz do gesto**, que também é `ink`.
*A hierarquia entre «agir» e «não agir» desaparecia* — o remendo não tapava só um
buraco de contraste, achatava a peça. Agora **a fronteira vem do traço e a
hierarquia vem da tinta**, que é o lugar de cada uma.

**A casa passa a ter três degraus de voz** — cheio (`amber`, 8,45:1) · contornado
(`lineStrong` + `ink`) · contornado-e-mudo (`lineStrong` + `inkDim`) — em vez de dois
e um buraco.

## A mira — medida, e **não se resolve com `lineStrong`**

O contorno da mira (`grade-de-batalha.jsx:433`, `T.violet` a `opacidade={0.6}` sobre
`bg`) dá **2,68:1** e reprova o piso de não-texto. **Fui medir o que `lineStrong` faz
por ela, e a resposta honesta é: nada. Não force.** Três medidas:

1. **Trocar a cor no lugar PIORA.** `lineStrong` a 60 % sobre `bg` = **2,07:1**,
   abaixo dos 2,68 de hoje. **O defeito é a opacidade, não o matiz** — e é a mesma
   armadilha em que K1 caiu ao propor `panelSoft` como fundo do controlo discreto.
2. **A mira tem de continuar violeta.** Em mira há **três** coleções na tela ao mesmo
   tempo — o alcance em violeta, a área que a magia varre em `danger` (`:445`), o
   movimento em âmbar. Um cinzento neutro funde duas delas, e `formas.md` já decidiu
   que a mira precisa de as separar.
3. **Não é para lá.** O scope de `lineStrong` é a borda de um **controlo**; uma casa
   de tabuleiro com contorno de união não é um controlo contornado.

### Mas ele faz pela mira outra coisa, que vale mais: **dá-lhe uma régua**

E1 propôs consertar a mira subindo a união violeta para **70 %** = **3,254:1**. Isso
passa a WCAG. **Mas fica 0,018 ABAIXO do piso de 3,272 que o próprio `lineStrong`
instala na casa.**

> **Passa a norma e falha a casa** — e é exatamente a mesma forma do defeito que E1
> já tinha encontrado no texto sobre casa acesa, que *"reprova o AA por 0,03"*.
> A casa tem duas medidas a 0,0x do piso, e nenhuma das duas foi arredondada.

| violeta sobre `bg` | medido | veredito |
|---|---|---|
| 60 % (hoje) | 2,689 | reprova a WCAG |
| **70 % (o conserto de E1)** | **3,254** | passa a WCAG, **falha o piso da casa por 0,018** |
| **72 %** | **3,358** | o mínimo |
| **74 %** | **3,484** | **o número honesto** |

**É uma linha em `grade-de-batalha.jsx:433`, é de E3, e agora tem régua.** *Antes de
`lineStrong` a casa não tinha número nenhum com que julgar aquele 70 % — só a norma,
que é um chão e não um padrão.*

---

# A PROPOSTA AMBICIOSA · **D5d — o token semântico sem leitor**

*(Nasceu de um buraco que eu encontrei ao tentar cumprir a lei do export morto para
o meu próprio token, e descobrir que não havia como a cumprir.)*

## O achado

**Um token novo em `T` passa por todos os portões desta casa com zero leitores.**

- **D5a** é cego — a zona `T` é isenta, e tem de ser (uma paleta que não pode
  crescer é sagrada).
- **D5b** é cego — pela mesma isenção.
- **`teste-ligacao`** é cego — varre `^export const|function|class`, e uma chave de
  tabela não é um export.

**A casa tem uma catraca para regra sem leitor e nenhuma para cor sem leitor.** E a
lei é a mesma lei: *export morto mente*. Um significado com um utilizador só não é
um significado — é um valor local com um nome pomposo, e ele apodrece igual.

## A proposta: um quarto dente, e ele aplica-se **só a `T`**

> **D5d — toda chave de `T` tem ≥2 leitores em `src/`.**
> Teto zero: o número é `2`, e a asserção é igualdade com a lista de perdão, como os
> outros três dentes.

**Medido hoje, e é a parte que torna isto barato:**

| | mínimo de leitores | chaves com <2 |
|---|---|---|
| **`T`** (14 chaves) | **8** (`T.onSecond`) | **0** |
| `MATERIAIS` (13 chaves) | 1 | **13** |

**`T` fica verde no dia em que o dente nasce**, com o mínimo a 8 — quatro vezes o
piso. Não é um dente que obriga a arrumar nada: é um dente que **congela uma saúde
que já existe**, que é exatamente o que a casa diz que um teto é (*um retrato datado
da dívida*).

### E `MATERIAIS` fica **de fora, por escopo e não por perdão** — a mesma forma da arbitragem de D5b

As 13 chaves de `MATERIAIS` têm **exatamente 1 leitor cada**, e isso está certo:
`corticaFilete` é usada uma vez porque **há uma cortiça**. A paleta física descreve
um objeto; a semântica descreve um *significado*, e um significado que só serve um
sítio não é semântico. **`T` e `MATERIAIS` respondem a leis diferentes porque são
tabelas de tipos diferentes** — que é, palavra por palavra, a distinção que D2 já
escreveu e que D5b já usou uma vez.

### O que isto custaria ao meu próprio token, e é por isso que eu o proponho

**`lineStrong` entraria com exatamente 2 leitores** (`ui.jsx:26` e `ui.jsx:394`) —
**no piso, com zero folga**, e seria de longe a entrada mais apertada de `T`, contra
os 8 do segundo pior. **Uma catraca que só aperta os outros não é uma catraca.** Se
alguém apagar uma daquelas duas ternárias, o token fica vermelho no dia seguinte, e
é assim que deve ser: hoje ele podia ficar sozinho na tabela para sempre, a dizer
que a casa resolveu um problema que voltou a ter.

### O peso, e por que não o rebaixo

**É `pesado`** — mexe numa catraca, e catraca é a coisa que a casa usa para não ter
de confiar em ninguém. Mas é o tipo de `pesado` mais barato que há: **uma tabela e
uma asserção, verdes no dia em que nascem, num arquivo que já existe.** Não pede
refatoração de nada.

**O risco, dito por mim:** o dente conta ocorrências de texto (`\bT\.chave\b`), e
texto conta comentários e nomes parecidos. É o mesmo risco que os outros três dentes
já correm e resolvem com a máscara de comentário que `check-formas.mjs` já tem
escrita (`mascararComentarios`, `:350`) — logo o custo é reutilizar uma função, não
inventar uma.

---

## O que ficou feio, o que não coube, e o que não soube

**Feio, e é meu:**

- **Escrevi em K1 que `#70688C` era «o degrau mais baixo que passa», e não era.**
  Cinco degraus abaixo dele também passam. O valor sobrevive porque a razão certa
  (*o mais baixo com folga*) é melhor que a razão errada — mas eu não sabia disso
  quando o escolhi; escolhi-o porque a minha escada tinha o passo grosso, e depois
  contei a história como se tivesse sido deliberado. **Duas rodadas, duas
  afirmações confortáveis sobre contraste que não sobreviveram a uma medição.**
- **Bati na armadilha registada da própria casa, no meio desta etapa.** Escrevi um
  script de medição com template-literal por `heredoc` de bash, e o shell comeu as
  escapes do regex — o script correu, não deu erro nenhum, e devolveu **zero
  leitores para todas as 27 chaves**. Por um instante acreditei. O `CLAUDE.md` tem
  isto escrito com todas as letras (*"Bash come crase e escape… e não avisa"*), eu
  tinha-o lido nesta mesma sessão, e caí na mesma. **O que me salvou foi o número
  ser absurdo**, não a disciplina — se a resposta errada fosse plausível, tinha ido
  para o bloco.

**Não coube:**

- **Não apliquei `lineStrong` a `A ficha curta`, `A casa`, `A vez` nem `A marca de
  borda`.** A moldura apagada de `A casa` mede **1,38:1** e E1 declarou-a buraco com
  a razão *"a palavra carrega o estado"* — **se a moldura é decoração, 1.4.11 não se
  lhe aplica e subi-la seria pôr 256 contornos fortes num tabuleiro.** Deixei-a. Mas
  *deixei-a por argumento, não por medida*: não joguei um tabuleiro com molduras a
  3,5:1 para saber se ficava melhor ou pior. Fica dito.
- **Não fiz a variante `Tempo=Degraus`** — um trilho que desce em quatro saltos de
  1 000 ms em vez de continuamente, que seria uma saída de movimento reduzido com
  **menos** repintes que os cinco numerais **e** sem falar de si mesmo em números.
  Acho que é melhor que `Tempo=Contagem`, e **não a proponho porque não a medi**:
  K1 escolheu a contagem com um argumento escrito, e trocar um argumento escrito por
  um palpite meu é o quarto caminho — *achar* —, que continua proibido.

**Não soube:**

- **Se onze segundos é o número certo para a folga.** Os 4 000 do trilho são
  medidos; os 11 000 são **o que sobra** de uma decisão da pessoa. Se ela tivesse
  dito 12 s, a folga seria 8 000 e nada mais mudava. **A repartição é defensável; a
  fronteira exata entre as duas partes não é medida — é aritmética a partir do
  número dela.**
- **Se o trilho a nascer aos 11 s assusta.** Tenho o estudo do começo abrupto a
  dizer que ele *captura atenção*, o que é o que eu quero. **Não tenho nada a dizer
  se ele é vivido como cortesia ou como chicote**, e essa diferença é jogada, não
  medida. É a primeira coisa que K4 tem de perguntar.
- **Quantas janelas abrem por luta.** Continua a ser a pergunta de K1 que ninguém
  respondeu, e agora pesa mais: a 15 s, quatro janelas por rodada são um minuto.
  **É do `jogo`, e é desta etapa dele.**
- **Se cinco linhas contornadas a 3,5:1 se leem como grelha.** É o risco que K1
  declarou para `lineStrong` e ele continua por jogar — só que agora está aplicado a
  31 nós em vez de proposto. **Se K4 disser que sim, sai de tabela num commit**, que
  é o teste de reversibilidade que a pessoa pôs e a razão de isto ser um token.

---

## Inventário dos nós tocados nesta etapa

| nó | o quê |
|---|---|
| `VariableID:88:2` | **`lineStrong`** — ganhou `codeSyntax` WEB `T.lineStrong` (era a única das 28 sem ponte) e a descrição deixou de dizer "proposta" |
| `9:170` (16 nós) | `Botao` — os corpos contornados: `line` → `lineStrong` |
| `20:77` (9 nós) | `A escolha` — os corpos não escolhidos: `line` → `lineStrong` |
| `64:2446` (6 nós) | `O verbo com preço` — `Gesto` ×3 trocou; **`Recuo` ×3 ganhou contorno** (`64:2423`, `64:2431`, `64:2439`) |
| 7 nós `;64:2426` | **o remendo apagado** — o verbo do recuo voltou de `ink` a `inkDim` |
| **`100:3053`** | **`K1b · a prova`** — folha nova na página `A pergunta que expira` (`31:242`), 1500×2082 |
| `100:3057` | secção *os quinze segundos* — a faixa 11/3/1 e os três momentos montados com variantes existentes |
| `102:429` | secção *as portas fechadas* — as 12 portas + a que não fecha |
| `103:429` | secção *lineStrong — a proposta virou decisão* — o par comparável e os números |

**Nenhuma peça nova nasceu, e isso é o resultado de que mais me orgulho nesta
etapa**: a fase da folga precisava de um cartão sem relógio, e `Tempo=Parado` já
estava construído — por K1, para outra coisa. *A lei «uma ação, uma forma» só se
paga quando alguém vai procurar antes de desenhar.*
