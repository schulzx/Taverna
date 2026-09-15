# K1 · o momento da reação (Fase K) — o bloco do `jogo`

*Para fundir em `mente/formas.md`. Nenhum `.js`, `.jsx`, `.mjs` foi tocado.*
*O Figma: página `A batalha` (`30:12`), quadros 1 a 9 + o quadro de decisões
`K1 · o momento da reação` (`63:2119`). A peça `A pergunta que expira`
(`31:518`) foi **usada**, nunca alterada.*

---

## O que mudou na segunda rodada (15/09)

**Os quadros deixaram de ter remendos, e não é por eu os ter escondido — é
porque as peças chegaram.** Na primeira rodada compus `Etapa=Direta` à mão
(uma instância de `Escolhendo` com um verbo oculto) e o leque com o trilho
oculto. Compus tudo outra vez do zero, primeiro a partir dos **átomos reais**
(`O chamado` + `O verbo com preço`) e depois, quando o `desenho` publicou as
variantes a meio desta rodada, **trocando as minhas composições pelas peças
dele**. Hoje não há um único `visible = false` meu em instância nenhuma.

O que ele entregou, e que fecha seis dos sete pedidos que eu tinha deixado:

| pedido meu (1.ª rodada) | como ficou |
|---|---|
| `Etapa=Direta` | **nasceu** — `84:3009`, **118 px** (56 do chamado + 62 do recuo) |
| o recuo no 1.º degrau | **pago** — `Etapa=Chamando` passou de 56 a **118 px** |
| `Escolhendo` sem trilho | **pago, e melhor** — nasceu o eixo **`Tempo=Parado`**, e `Escolhendo` **só existe** em Parado |
| `Etapa=Resolvida` | **nasceu** — `84:3194`, **56 px**, só em `Parado` |
| o recuo a ≥44 px | **pago** — `O verbo com preço` mede 48 nos dois papéis |
| os preços errados | **pagos** — `O chamado/Forma=Verbo` diz agora `sem PM · corta metade` |
| o `O interruptor` no fim do leque | **retirado por mim** — ver §2 |

E ele acrescentou uma coisa que eu tinha pedido por palavras e não por peça:
**`O verbo com preço` ganhou `Papel=Armado`**. O «primeiro verbo vem cheio»
deixou de ser um override meu e passou a ser uma variante.

**O que sobrou, e é um só:** em `Etapa=Resolvida` o **glifo mente no caso
*recusou*** — o cartão mostra a espada quando ninguém aparou. Tem de poder
esconder-se, pelo mesmo argumento com que `Papel=Recuo` escondeu o dele.
Deixei-o **visível de propósito** no quadro 9, segundo caso.

---

## reagir ao golpe que chega — o momento (substitui a entrada de D4)

- **quando** — *"o golpe do inimigo é resolvido e, antes de o dano virar PV, o
  sistema já tem tudo na mão: `a.r.dano` existe em `App.jsx:7572`, e
  `escolherReacao` (`reacoes.js:85`) decide sozinha e debita o PM da ficha em
  `:7577`. O jogador nunca toca. A janela é esse mesmo instante, com uma
  pergunta curta por cima."*

- **forma** — **A pergunta que expira** (`31:518`), ancorada na linha do
  veredito. **Três degraus, e a regra que escolhe um é a conta das reações que
  se aplicam** — porque `reacoesDe` filtra por perfil de combate e o caso comum
  tem **uma só**:

  | reações aplicáveis | o que aparece | altura | toques p/ reagir | toques p/ não reagir |
  |---|---|---|---|---|
  | **1** (o caso comum) | **`Etapa=Direta`** — o verbo armado + o recuo | **118 px** | **1** | **1** |
  | **2 ou mais** | `Chamando` (`reagir`) → `Escolhendo` (o leque) | 118 → 215 px | 2 | 1 |
  | **0** | nada abre | — | — | — |

  **Este grau é a forma desta fase, e não vai à pessoa.** A tabela muda o
  fluxo que ela ditou (*"se o player apertar, aparecem as opções"*), mas ela
  devolveu a forma à mesa em 15/09 — *reagir* e *recusar* ficam os dois no
  primeiro degrau, que é o que ela pediu — e entregar um toque que revela uma
  lista de um item, **em 12 classes de 12**, seria a timidez que ela proibiu.
  O caso de **uma** reação é o caso normal, e os quadros mostram-no primeiro.

  *Um marcial tem `aparar` e mais nada em `sofre_dano`; um conjurador tem
  `escudo_arcano`. O leque de dois ou mais só existe com habilidade na ficha
  (`contramagia` tem `exigeTipo: []` — ninguém a ganha por classe). **Desenhar
  o comum como se fosse o raro custava-lhe um toque em cada rodada.***

  **O recuo está nos dois degraus.** *Não reagir* é sempre **um** toque, e tem
  de ser: quem ignora a janela recebe o de hoje — e o de hoje **gasta PM**. O
  jogador que quer poupar PM é, hoje, o mais castigado pela janela; o recuo na
  chamada é o conserto disso.

  **A reação padrão não é uma preferência, é um botão cheio.** O primeiro verbo
  do leque vem **armado** — hoje é uma variante de verdade, `O verbo com preço`
  ***Papel=Armado*** — e é exactamente a escolha que `escolherReacao` faria
  hoje: `REACOES` está ordenada por prioridade e `escolherReacao` devolve a
  primeira que se aplica, logo **o verbo armado é a primeira linha da lista, e
  não há aqui nada a decidir em K3**. Vir cheio em vez de contornado é toda a
  interface de que a *"reação padrão"* pedida pela pessoa precisa: tocar +
  `Enter` = aceito o que o sistema faria. Nada para configurar, nada para
  lembrar. *(No 1280 a primeira linha leva também `Estado=Foco`, porque o foco
  de teclado existe; no telefone leva `Repouso`, porque não existe.)*

  **O preço vem na linha do verbo, sempre**, e sai de `reacoes.js:22-69`:
  `aparar · 0 PM — corta metade`. **A `chance` não é percentagem — é a forma da
  frase.** Certa: *corta metade*. Arriscada: *some do golpe, **ou não***. Esse
  *ou não* são quatro caracteres e é a divulgação inteira; oferecer *"corta
  tudo"* calando que `esquiva_agil` falha 2 em 5 seria mentir o preço. O
  **`3 em 5` vive na ficha**, que se lê devagar — nunca na janela, que se lê em
  4 s. É a fronteira certa: a janela é gameplay, a ficha é consulta.

- **movimento** — o trilho desce **linear** durante a janela (uma curva de
  aceleração numa barra de tempo mente sobre o tempo). **Ao primeiro toque o
  trilho desaparece** — é esse o sinal de que o relógio parou, e não é preciso
  elemento nenhum novo para o dar. Sob `prefers-reduced-motion` o trilho nasce
  já como a variante *Tempo=Contagem* (a saída pousa no estado final, D5c). A
  saída do cartão é **140 ms, só opacidade**, e nunca anima leiaute.

- **onde vive** — Figma: peça `31:518` (do `desenho`); o momento em
  `A batalha` → `o momento da reação · 1` a `· 7` + o quadro `63:2119`.
  Código: **[ainda não existe]** — é K3.

- **por quê** — abaixo, decisão a decisão, cada uma com o número.

---

## 1 · o relógio, e ele corre uma vez só

**A chamada dura 4 000 ms. O leque NÃO expira.**

- **4 s, e de onde sai o número.** O limite de 1 s da NN/g (Nielsen 1993, a
  partir de Miller 1968) é de **resposta do sistema**; aqui quem responde é a
  pessoa, e o limite aplicável é o outro — os ~10 s da atenção. Dentro dessa
  faixa a conta é: **reconhecer** um elemento que apareceu na periferia enquanto
  se lê prosa (~1,5 s: sacada + interpretar *"o ogro te acerta"*) + **o gesto**
  (Fitts). São ~1,8-2,0 s para quem estava a olhar. **Dobro isso**, porque o
  caso que importa é o de quem **não** estava. Abaixo de 4 s, quem lê perde
  sistematicamente. Acima de ~6 s deixa de ser janela e passa a ser um modal
  que se pode ignorar — e com 2 a 4 janelas por combate cada segundo a mais é
  meio minuto de coxear por luta.

- **A conta de Fitts, refeita contra a peça real — e o número não mexe.**
  E1 escreveu a conta com `W = 344` quando a peça media **320**. Refiz as três
  hipóteses, com `D ≈ 638`, `a = 0,15`, `b = 0,10`:

  | `W` | o que é | `MT` | total dobrado |
  |---|---|---|---|
  | 320 | a peça que existia quando a conta foi escrita | **0,308 s** | 3,62 s |
  | 344 | a peça que existe hoje | **0,301 s** | 3,60 s |
  | **56** | a **altura** do chamado — e é esta a honesta | **0,513 s** | **4,03 s** |

  Corrigir 320 → 344 move a conta **sete milésimos**. E o meu erro maior não
  era esse: **o gesto é vertical** (da prosa, no campo, para a lateral em
  baixo), logo o `W` que conta não é a largura do cartão, é a **altura do
  alvo** — 56 px. Mesmo assim: 1,5 + 0,513 = 2,01 s, dobrado = **4,03 s**.
  **Continua 4 s**, e desta vez por cima em vez de por baixo.

  **Porque é que é pouco sensível, dito com o valor:** o termo de Fitts é
  logarítmico e vale **um sexto** do orçamento. Para o total sair de 4 s para
  5 s **só por causa de `W`**, `W` teria de cair de 344 para cerca de **7 px**
  — `0,10·Δlog₂ = 0,5` exige encolher o alvo ~32×. Quem manda nos 4 s é o
  **1,5 s de reconhecer**, e esse não vem da geometria: vem de estar a ler
  prosa. Quem quiser mudar os 4 s tem de atacar esse número, e a única forma de
  o atacar é K4 medir quantas janelas abrem por luta.
- **Por que o leque não expira.** Quem tocou **já respondeu**; o que expira é a
  chamada **por responder**, e é isso, literalmente, que a pessoa ditou
  (*"caso o tempo passe e o player não tenha clicado"*). Um segundo relógio por
  cima do preço escrito tornaria o preço decorativo — e obrigaria a **decorar o
  menu** para jogar bem, que é o sistema a falar de si mesmo pela porta dos
  fundos. O relógio compra a **tensão**; o leque paga com a **decisão**.
- **A aba escondida não gasta janelas.** O relógio só corre com
  `document.visibilityState === "visible"`. Quem muda de separador não volta a
  três expirações.

**A tabela, para K3 (`src/reacoes.js`):**

```js
export const RITMOS_DA_REACAO = [
  /* chamada/leque em ms; 0 = não expira */
  { id: "normal",  chamada: 4000, leque: 0, bonusContagem: 1000, bonusToque: 600 },
  { id: "folgado", chamada: 8000, leque: 0, bonusContagem: 1000, bonusToque: 600 },
  { id: "parado",  chamada:    0, leque: 0, bonusContagem:    0, bonusToque:   0 },
];
export const ESCADA_DO_SILENCIO = [
  { seguidas: 1, faz: "nada"     },
  { seguidas: 2, faz: "folgado"  },   // só a próxima janela, em silêncio
  { seguidas: 3, faz: "silencio" },   // pelo resto DESTA luta
];
```

**Cada linha de `RITMOS_DA_REACAO` chega por uma estrada diferente, e é de
propósito:** `normal` é o padrão, `folgado` **só a escada o dá** (nunca se
escolhe), `parado` **só o jogador o escolhe** (nunca acontece sozinho).

---

## 2 · quem lê devagar — generoso *e* configurável, e a generosidade vem primeiro

**Mudei de posição aqui, e digo porquê.** Eu queria um `O interruptor` no fim
do leque (*"perguntar com calma"*); o `desenho` recusou-o e pôs a preferência
numa fila de `A escolha` na **ficha**. **Ele tem razão no lugar, e eu tinha
razão no que faltava** — e a resolução é a fila dele com a minha opção dentro.

- **Automática, por prova, e é a primeira coisa.** Se uma janela expira, a
  **seguinte corre a 8 s**, em silêncio, sem aviso e sem menu. Quem era lento
  apanha-a agora. O contador zera à primeira resposta. **Ele nunca precisa de
  procurar uma definição para deixar de ser castigado por ser lento**, e isto
  não é controlo porque ninguém lhe toca. A escada fica **intacta**.

- **O interruptor na janela morreu, e morreu bem.** Um interruptor **mais** um
  seletor são dois mecanismos onde um chega, e o segundo teria de **chamar-se
  alguma coisa**, que é o sistema a falar de si mesmo. E a ficha é o sítio
  certo porque lá o jogador lê *"como o meu herói se defende"*, que é ficção,
  e não *"configurar reações"*, que é mecanismo.

- **A fila da ficha tem QUATRO, e cada uma tem um porquê diferente.**
  Quadro `a ficha — «quando um golpe chega»` (`84:3214`), quatro instâncias de
  `A escolha` *Forma=Pílula*, numa fila só que **quebra** quando não cabe.

  > **QUANDO UM GOLPE CHEGA**
  > `[✓ EU DECIDO]` `[EU DECIDO, SEM PRESSA]` `[APARAR SEMPRE]` `[DEIXAR PASSAR]`

  | opção | porquê ela existe | `id` de `RITMOS_DA_REACAO` |
  |---|---|---|
  | **eu decido** | o padrão, e o único marcado. É o jogo da Fase K. | `normal` |
  | **eu decido, sem pressa** | **esta é a minha, e sem ela o ritmo `parado` ficava inalcançável** — regra sem leitor é export morto. A quem pede mais tempo a resposta honesta é **tirar** o relógio, não duplicá-lo: a decisão continua a ser a mesma e continua a custar PM; o que sai é só a pressa. | `parado` |
  | **aparar sempre** | *(o verbo do próprio herói: um conjurador lê `ESCUDO SEMPRE`)* — **escolher um verbo É dizer "nunca me pergunte"**. A janela não abre; o sistema faz o que já faz hoje. | `normal`, com verbo travado |
  | **deixar passar** | a quarta, e é a que faltava: quem **nunca** quer gastar a reação tem de poder dizê-lo. Sem ela, a única forma de poupar a reação é **ignorar três janelas**, que é castigar quem já decidiu. | `normal`, com recuo travado |

  **`folgado` não está na fila, e é de propósito.** Cada linha de
  `RITMOS_DA_REACAO` chega por uma estrada diferente: `normal` é o padrão,
  **`folgado` só a escada o dá** (nunca se escolhe), **`parado` só o jogador o
  escolhe** (nunca acontece sozinho). Três estradas, três linhas, zero linhas
  sem leitor.

- **E isto é a conformidade, não um mimo** — o argumento é do `desenho` e eu
  assino-o: a **WCAG 2.2.1 (*Timing Adjustable*, nível A)** exige que um limite
  de tempo se possa ajustar, estender ou desligar. `sem pressa` desliga-o;
  `aparar sempre` e `deixar passar` removem a janela. **A fila é a saída de
  conformidade da Fase K inteira**, e por isso não é opcional.

---

## 3 · `prefers-reduced-motion` — e a janela dura **mais**

**Sob movimento reduzido a chamada é de 5 000 ms (+1 000).** E isto é a lei
*«não pode virar desvantagem de jogo»* transformada num número em vez de numa
promessa:

- **Uma barra lê-se de canto de olho; um número exige fixar e ler.** A barra dá
  *taxa* em visão periférica sem gastar uma sacada. A contagem gasta uma fixação
  (~200-250 ms) **por leitura**, e não dá taxa nenhuma. **Mesmo tempo seria menos
  tempo.** O `bonusContagem` é o preço dessa diferença.
- **E a contagem não é `animation: none`.** D5 provou que `none` cego é
  estritamente pior (*"deixa a pisca e tira o sentido"*, no `tv-dice`), e a regra
  nova é que **a saída pousa no estado final**. Aqui não há animação a matar: o
  trilho é **substituído** pelo contador, que é texto movido por temporizador.
  Se mesmo assim for movimento a mais, **conta de segundo a segundo** — quatro
  repintes é o sinal honesto mínimo.
- **O eixo `Tempo` da peça é isto, e não uma nota de rodapé.** Foi essa a decisão
  do `desenho` em E1 e é a que impede que a saída seja esquecida no dia de
  construir.
- **E o eixo ganhou um terceiro valor nesta rodada: `Tempo=Parado`.** Ele
  serve duas coisas ao mesmo tempo, e é por isso que é bom: é o **ritmo
  `parado`** da ficha (*«eu decido, sem pressa»*) e é o **estado do leque**,
  que não expira. `Escolhendo` e `Resolvida` **só existem** em `Parado` — a
  regra deixou de ser uma nota minha e passou a ser impossível de construir ao
  contrário. É exactamente o que eu queria dizer com *"ao primeiro toque o
  trilho desaparece"*, dito em variante em vez de em prosa.

---

## 4 · a reação padrão, e o *nunca me pergunte*

- **A reação padrão** é o verbo **armado** (ver *forma*). Não se escolhe, não se
  configura, não se lembra: é a escolha do sistema, mostrada cheia. Um toque.
- **Não reagir** é o recuo, presente nos dois degraus. Um toque.
- **A escada é o *nunca me pergunte*, e ela pergunta-se sozinha:**
  1.ª expiração — nada. 2.ª seguida — a janela seguinte corre a 8 s, em silêncio.
  **3.ª seguida — o jogo pára de perguntar até ao fim desta luta.** Volta a
  perguntar na luta seguinte, sem lhe pedir nada.
  *Porquê três, e porquê com o degrau do meio dobrado:* duas leituras cabem numa
  expiração — *sou lento* e *não quero* — e só a escada as separa. Três chamadas
  ignoradas, a do meio com o dobro do tempo, é prova suficiente da segunda. E o
  custo de errar é **zero**: quem fica em silêncio recebe exactamente o jogo de
  hoje.
- **A primeira vez numa campanha antiga: não há tutorial, há uma frase.** A
  linha que a peça já traz — *"não responder é uma resposta: o de sempre
  acontece"* — é a integração inteira, e ensina a única coisa que precisa de ser
  ensinada: **ignorar isto não te faz mal**. Nenhum modal, nenhum selo de
  *novidade*, nenhum save tocado. Um save antigo não perde nada e aprende tudo de
  uma linha que também pode ignorar.
- **O *nunca me pergunte* permanente existe, e mora na ficha, não na janela.**
  É `aparar sempre` / `deixar passar` (§2). A escada continua a dar o
  temporário, por luta, sem perguntar. São coisas diferentes: a escada socorre
  quem **não decidiu**; a ficha obedece a quem **decidiu**.

- **O silêncio avisa, uma vez — aprovo a regra do `desenho`, e mudo-lhe o
  sítio.** Ele escreveu que quando o silêncio entra o jogo tem de o dizer uma
  vez, em linguagem de jogo, porque *mudança de comportamento sem aviso é o
  defeito que a lei da casa caça, mesmo quando a mudança é simpática*.
  **Ele tem razão e eu estava errado**: o meu silêncio total obrigava o jogador
  a descobrir por **ausência**, que é a pior maneira de aprender o que quer
  que seja — e ele nem sequer saberia distinguir *"o jogo parou de perguntar"*
  de *"não houve golpe que merecesse"*.

  **O que mudo é o sítio: não vai para o log.** O log é a ficção da luta, lida
  a frio; uma frase sobre os quatro segundos que acabaram de passar não é
  ficção nenhuma, e enfiá-la ali obrigaria a trava de K2 a comparar prosa.
  **O aviso é a primeira linha do ÚLTIMO cartão.** Na 3.ª expiração seguida o
  cartão resolve-se no sítio como sempre, mas em vez de *"você não teve tempo"*
  diz:

  > **você deixou passar três vezes · o instinto assume o resto da luta**

  **Custo: zero superfície nova, zero peça nova** — `Etapa=Resolvida` estica
  para as duas linhas sozinha (medido: quadro 9, quarto caso). E é
  **auto-limitado**: só pode aparecer uma vez, porque depois dele não há mais
  cartão nenhum. *O objecto que vai desaparecer é o sítio honesto para dizer
  que vai desaparecer.*

---

## 5 · o celular — o cartão **cobre os verbos**, e é por isso que é bom

Quadro `375×812 · a luta no telefone` (`40:447`); a composição está nos frames
5 e 6.

- **O chamado nasce onde o dedo já está**, e no telefone isso não briga com o
  olho: a base do campo (598) e o arco do polegar (620-764) estão a **22 px** um
  do outro. É a única vantagem que o telefone tem sobre o 1280 nesta tela, e
  usa-se.
- **O cartão ancora no topo da tira do herói (y 764) e cobre a barra dos
  verbos.** Duas razões, e a segunda é de segurança: (1) no turno do inimigo os
  seis verbos são **alvos mortos** — cobri-los não custa nada; (2) cobri-los
  **tira seis alvos errados do alcance do polegar** no segundo exacto em que
  errar custa caro.

- **As duas decisões da dupla batem, e batem porque a âncora é uma só.** O
  `desenho` escreveu *"o recuo fica onde o chamado estava"*; eu escrevi *"o
  cartão cobre a barra dos verbos"*. **Não há conflito: é a mesma linha.**
  Com o fundo em y 764, `Etapa=Chamando` ocupa 646–764 e o recuo dela ocupa os
  48 px de baixo (716–764); quando o leque abre, a última linha — *deixar
  passar* — cai exactamente nesses mesmos 716–764. **A escolha segura não se
  mexe um pixel entre os dois degraus**, o cartão cresce só para cima, e o que
  ele come primeiro é a barra dos verbos, que está morta. A trava de 150 ms é
  o que impede que isso vire armadilha para o toque que abriu o leque.

- **E agora está MEDIDO, com o campo por baixo — era o que faltava.** O campo
  vive de y 48 a 598: **550 px, onze filas de tabuleiro**.

  | o que abre | altura | topo | tapa do campo | em filas |
  |---|---|---|---|---|
  | **`Direta`** — o caso comum | 118 px | y 646 | **0 px** | **nenhuma** |
  | **`Escolhendo`** — 2 reações + recuo | 215 px | y 549 | **49 px** (8,9 %) | **uma** |
  | o tecto da peça — 5 linhas | 323 px | y 441 | 157 px (28,5 %) | três |

  **A resposta à pergunta do `desenho` é não, o leque não tapa tabuleiro a
  mais** — e o número que interessa não é o dele (325 de 812, que mistura o
  cartão com a tira e a faixa) mas este: **uma fila de onze, e só quando há
  duas reações.** No caso comum o cartão **morre inteiro dentro da barra dos
  verbos** e o tabuleiro fica intacto.

  **E o tecto de cinco linhas não é alcançável por classe nenhuma.** Em
  `sofre_dano` os `exigeTipo` dos três verbos de perfil são **disjuntos**
  (`escudo_arcano`→conjurador, `aparar`→marcial/misto, `esquiva_agil`→furtivo),
  e `contramagia` tem `exigeTipo: []`. Logo o máximo **por classe** é
  1 + Contramágica escrita na ficha = **2 reações**, que é a linha do meio da
  tabela. Cinco linhas exigiriam **três** reações escritas à mão numa ficha —
  possível de autorar, impossível de nascer.
- **Isto não renegoceia a geometria de E1 — lê a cláusula do telefone dela.**
  *Sobrepõe e nunca empurra*, *cresce para cima, ancorada em baixo*, *o topo do
  campo e a câmara nunca se mexem*: as quatro mantêm-se, e eu acrescento a
  quinta que E1 escreveu para o telefone — *controlos no arco do polegar*. No
  1280 a âncora é o fim da linha do veredito (o rato é livre); no 375 é o topo
  da tira (o polegar não é).
- **O tempo paga +600 ms no toque (4 600 ms), e não é a viagem.** A viagem é
  nula por desenho (~60 px, ~0,17 s por Fitts). O que o toque paga é: **não há
  `hover`**, logo o jogador de telefone não pode ler o preço antes de a janela
  existir, como o de rato pode; e é o aparelho com mais probabilidade de estar a
  ser olhado por metade. 600 ms ≈ uma fixação extra (~250 ms) + a diferença de
  aquisição entre toque e clique (~350 ms). **É um número de partida, e K4 é
  quem o corrige.**
- **Alvo mínimo: pago.** O chamado mede **56 px** e `O verbo com preço` mede
  **48** nos dois papéis — o recuo deixou de ser o botão mais pequeno da
  janela, que era o defeito mais feio de E1: 42 px no botão de quem não quer
  gastar PM.

---

## 6 · o gatilho — dois abrem, um não

- **`sofre_dano`: abre.** É o momento ditado — antes de o dano assentar.
- **`inimigo_erra`: abre.** `contra_ataque`, 0 PM: o inimigo abriu a guarda, e
  revidar é escolha (custa a reação da rodada e falha 45 das vezes em 100). A
  mesma peça serve; muda a primeira linha — *"o ogro erra e abre a guarda"* — e
  o verbo: *revidar · 0 PM — na mesma batida, ou não*.
- **`inimigo_cai`: NÃO abre.** Três razões:
  1. **É ganhar, não defender-se.** 0 PM, sem lado mau. *Uma pergunta cuja
     resposta é sempre sim não é pergunta — é um diálogo de confirmação com
     relógio*, que é um imposto.
  2. **O instante em que um inimigo tomba é o pior sítio do combate para pôr um
     menu.** É o momento mais carregado da luta e o único que o Narrador vai
     narrar de certeza.
  3. **`formas.md` já lhe deu forma e a forma continua certa:** *ser visto* — `O
     realce` na linha do log e a `Barra de medida` *Mudou=Golpe* no alvo. A peça
     cobre as duas; **a janela cobre só uma**. A pergunta da peça era do
     `desenho` e foi bem respondida; a pergunta do momento é minha e a resposta
     é diferente.
## 6b · as duas perguntas ao motor — registadas, não resolvidas

Nenhuma das duas é minha para decidir: as duas são do `backend`, e vão à pauta
do sistema.

1. **O `oportunidade` automático consome a reação da rodada?** Se consome, há
   um desenho melhor à espera — *o silêncio numa rodada guarda a reação para o
   golpe livre* — e recusar uma pergunta passa a **comprar** alguma coisa em
   vez de só poupar PM. Hoje eu não sei dizer ao jogador o que ele ganha por
   recusar, e isso é um preço que não consigo escrever na fenda.
2. **`reacoes.js:96` rola a `chance` com `Math.random()` ANTES de oferecer** —
   `if (r.chance != null && Math.random() > r.chance) continue;`. Isso **já
   viola hoje o determinismo por semente**, e na Fase K fica *visível*: uma
   Esquiva Ágil que o dado já recusou **nunca entra na lista**, e o jogador vê
   **listas diferentes com a mesma semente**. Com `escolherReacao` a decidir
   sozinha ninguém reparava; com a lista na tela, repara-se.

---

## 7 · a trava K2, desenhada — o que ele vê quando ninguém responde

**Byte a byte é sobre o resultado, não sobre a apresentação** — e o desenho tem
duas obrigações aqui:

- **A janela abre exactamente quando `escolherReacao` devolveria não-nulo hoje.**
  Nem um instante a mais. Em particular **não abre em arranhão**
  (`reacoes.js:93-94`): deixar o jogador reagir a um arranhão seria **mecânica
  nova** (é do `backend`), e triplicaria a contagem de janelas por luta, o que
  ataca a primeira das quatro defesas. Como o **conjunto de momentos** é
  idêntico, a catraca de K2 fica trivial de escrever: *mesma semente, ninguém
  responde, mesmo resultado de hoje*.
- **O cartão não desaparece: resolve-se no sítio.** Nos últimos instantes o
  verbo é substituído pela linha que o sistema produziu, ela fica **1,2 s** e o
  cartão sai a **140 ms, só opacidade**. É a variante **`Etapa=Resolvida`**
  (`84:3194`, **56 px**, só em `Tempo=Parado` — que é a verdade: já não há
  relógio). **Três coisas de graça:** a resposta chega **onde a pergunta foi
  feita** (hoje chega num log de que ele pode ter rolado para longe); o
  contrato ensina-se sozinho, uma vez por expiração — *ignorei, aconteceu
  algo, e correu bem*; e o **PM aparece onde a escolha foi oferecida**.

### `Etapa=Resolvida` e as três frases do log são o mesmo facto em dois tempos — e não se contradizem, desde que se fixe qual é qual

Confirmado, e a regra que os separa é esta: **o LOG fica com a linha de hoje,
byte a byte. O CARTÃO é a superfície nova, e só ele carrega o preâmbulo dos
quatro segundos.** Assim a trava de K2 **nunca tem de comparar prosa** — compara
resultado, que é o que "byte a byte" queria dizer.

Isso resolve a única contradição real que havia entre os dois blocos: o
`desenho` escreveu a frase de `expirou` como *"você não teve tempo · o instinto
aparou por você · 4 de dano evitado"* — **e essa frase, no log, mudaria a linha
que `resolverReacao` escreve hoje**, o que partiria a trava. Ela é boa; é só
que ela é do cartão.

**As quatro saídas, escritas uma vez só** (quadro 9, `85:2525`):

| caso | o cartão, nos seus últimos 1,2 s | o log |
|---|---|---|
| **respondeu** | *você aparou a tempo* · `4 evitado · 9 vira 5` | a linha de hoje, byte a byte |
| **recusou** | *você deixou o golpe passar* · `9 inteiros · você fica em 8` | **a única frase nova**: `você deixou o golpe passar · 9 de dano` |
| **expirou (1.ª e 2.ª)** | *você não teve tempo · o instinto aparou* · `4 evitado · 9 vira 5` | a linha de hoje, byte a byte |
| **expirou (3.ª, e é o último cartão)** | *você deixou passar três vezes · o instinto assume o resto da luta* · `4 evitado · 9 vira 5` | a linha de hoje, byte a byte |

**Três das quatro não inventam frase nenhuma**, porque em três delas o sistema
fez exactamente o que faz hoje. **A única nova é `recusou`, e ela é nova
precisamente porque hoje não pode acontecer:** `escolherReacao` nunca recusa
por ele. *A frase nova é a medida exacta da mecânica nova — uma.*
- **No silêncio (3.ª expiração seguida) não há cartão nenhum** — o jogo de hoje,
  inteiro, sem uma linha a mais. É o frame 4.

---

## ao `desenho`: o que ficou, depois de compor com as peças reais

**Sete dos oito pedidos da 1.ª rodada estão pagos** (a tabela no topo). Os
quadros 1, 2, 3, 5, 6, 7, 8 e 9 estão compostos com as **variantes reais** e
**não há um único remendo** — nem verbo oculto, nem trilho oculto, nem preço
corrigido à mão sobre um número errado da peça.

Sobra **um**, e nasceu hoje:

1. **Em `Etapa=Resolvida`, o glifo mente no caso *recusou*.** O cartão mostra a
   espada quando ninguém aparou. Precisa de o poder esconder — e o argumento é
   o teu, palavra por palavra: *nenhum glifo desta casa diz "deixar passar" sem
   mentir, e inventar um seria dar nome de mecanismo a uma abstenção*. Foi por
   isso que `Papel=Recuo` escondeu o dele. **Deixei-o visível de propósito** no
   quadro 9, segundo caso, para não mentir sobre o estado da peça.

E uma observação que pode ser obra em curso — **vi-a ao fechar, 15/09**:
`O chamado / Forma=Verbo` deixou de ocupar os 341 px e passou a **abraçar o
texto**. Isso encolhe o trilho junto com ele, e o trilho é a única coisa da
peça cujo **comprimento carrega o sentido** (é a tua frase, e o Cleveland &
McGill é teu): se o 100 % do relógio muda de tamanho com o comprimento do
verbo, *"quanto falta"* deixa de se ler contra uma escala comum. **O trilho
tem de medir a largura da janela, mesmo que o botão não meça.**

E **dois achados que são de código, não de peça** (ficam para K3):

2. **O emoji não sobrevive à mono da casa.** `resolverReacao`
   (`reacoes.js:115`) mete `reacao.icone` — `⚔`, `🛡`, `🚫` — **dentro da
   própria frase**, e vi o quadrado da fonte quando compus o cartão resolvido.
   Tem de ser trocado pelo glifo vectorial, que é exactamente a razão por que os
   três glifos novos nasceram: **emoji não herda a variável de cor**.
3. **O número errado do diário de E1 fica corrigido aqui:** *«a lateral mede 344
   e A pergunta que expira mede 344 — encaixa exacto»* estava errado por 24 px
   (a peça media 320). Hoje mede 344 e a frase passou a ser verdadeira — mas
   **passou a ser verdadeira por o `desenho` ter mexido na peça**, não por a
   frase estar certa quando foi escrita.

### uma descoberta que encolhe um pedido futuro

Antes de as variantes chegarem, compus `Direta` e `Chamando` lado a lado a
partir dos átomos — e **são a mesma composição**: cordão + `O chamado` + uma
faixa com `O verbo com preço` *Papel=Recuo*. **A única diferença é o eixo
`Forma` do chamado** (`Verbo` contra `Chamada`), que já existia. O `desenho`
chegou à mesma estrutura por conta própria, e é por isso que `Direta` e
`Chamando` medem os dois exactamente 118 px. Fica escrito porque tem uma
consequência: **se a pessoa aprovar a proposta ambiciosa, não é preciso desenho
nenhum novo — é trocar o valor de um eixo.**

---

## a proposta ambiciosa — **o dano aparece antes de doer**

*(quadro 7 · `o momento da reação · 7`, lado a lado com o quadro 1)*

**Ela mantém-se, e ganhou um par.** O `desenho` provou por contagem que o caso
comum é **uma reação só** — e isso **reforça** este pedido em vez de o
enfraquecer: *sem o número, uma lista de um item com ordem fixa é literalmente
`escolherReacao` reimplementado à mão, e a janela inteira passa a ser dois
toques que não mudam nada; com o número, mesmo a lista de um item vira decisão,
porque a pergunta deixa de ser "qual?" e passa a ser "vale?"* — e essa é a
única pergunta que o sistema não pode responder por ele.

**E o preço do desenho, medido nesta rodada, é zero.** Compus o quadro 7 com a
mesma `Etapa=Direta`, e a conta cabe **na fenda de preço que já lá está**:
`9 vira 4 · você fica em 13` são 26 caracteres e `9 inteiros · você fica em 8`
são 27 — os dois dentro do orçamento de 40 que o `desenho` mediu para a mono 10
a 344. **Mesma peça, mesma altura (118 px), mesmo número de linhas, palavras
diferentes.** A proposta não custa um pixel.

Hoje o jogador conhece todo número **depois** de ele ser facto. A janela da
reação é o **único instante do jogo inteiro** em que o sistema tem na mão um
dano que ainda não aconteceu: `a.r.dano` existe em `App.jsx:7572` e só vira PV
mais à frente.

Então a primeira linha do cartão deixa de ser *"o ogro do beco golpeia você"* e
passa a **"o ogro do beco — 9 de dano a caminho"**, e cada verbo traz a conta já
feita, contra o PV que está na tira:

> **aparar** · 0 PM — **9 vira 4**, você fica em 13
> *deixar passar* · não gasta PM — **9 inteiros**, você fica em 8

**Por que isto não é enfeite, e é a prova.** Sem o número, as seis reações ficam
ordenadas na **mesma ordem em todas as lutas**: o jogador escolhe sempre a melhor
que tem — que é **exactamente o que `escolherReacao` já faz por ele, e faz bem**.
Nesse mundo a janela acrescenta dois toques por rodada e **muda nada**: é uma
reimplementação manual de uma decisão automática correcta, que é a definição de
um mecanismo que cansa. Com o número, a ordem **muda a cada golpe**: a 17/20
poupa-se o PM, a 6/20 gasta-se tudo. **É a diferença entre um menu e uma
decisão** — e é a única decisão que o sistema **não pode** tomar por ele, porque
só ele sabe se está a guardar PM para o chefe.

**E o relógio força a mão.** Um jogador não faz `9 × 0,5` e compara com `17 PV`
em 4 segundos enquanto lê prosa. Se a janela mostra proporções e lhe deixa a
aritmética, o relógio **garante** que ele responde por hábito e não por leitura —
e mecânica respondida por hábito é o sistema automático com passos a mais. **Uma
decisão de 4 segundos só se pode tomar sobre informação já calculada.** Ou se
mostra a conta, ou não se devia pôr relógio.

**Custo: zero mecânica nova, zero tabela nova.** É a fórmula que
`resolverReacao` já corre (`Math.round(dano * corta)`) executada em
pré-visualização. Ao `backend` pede-se uma coisa só: o dano cru e o verbo, antes
de assentar — e os dois já estão no sítio.

**É a lei da casa aplicada onde nunca foi.** *O veredito antes do clique* existe
no Taverna inteiro para o que se **gasta**. Esta é a primeira vez que ele se
aplica ao que se **evita**.

**O risco, dito por mim.** Mostra o dado do inimigo antes de o jogador reagir, o
que este jogo nunca fez. É uma facilitação — pequena, e **só para quem
responde**: quem ignora tem o jogo de hoje, byte a byte. A troca parece-me
certa: ver o tamanho do machado que vem é o que a personagem veria, e é a única
coisa que torna honesta uma escolha de quatro segundos. **Se a pessoa disser que
não, a Fase K continua a fazer sentido — mas então eu diria que o relógio devia
ser mais generoso, porque a conta passa a ser dele.**

---

## o que ficou feio, e o que não soube

**Feio, e assumo:**

- **Compus tudo duas vezes.** Construí `Direta`, o leque sem relógio e o cartão
  resolvido à mão, a partir dos átomos, e minutos depois o `desenho` publicou as
  variantes — e deitei fora as minhas composições. Não foi trabalho perdido (a
  minha `Direta` media 130 e a dele mede 118: **a peça dele é melhor, e por
  12 px**), mas foi trabalho feito por não termos olhado um para o outro à
  primeira. É o mesmo defeito que quase matou E1, e desta vez custou-me uma
  rodada inteira de composição.
- **O meu `Etapa=Resolvida` estava mais gordo que o necessário.** Eu tinha
  desenhado 70 px com uma moldura de 12 px em volta; ele fez 56 com o glifo à
  esquerda e as duas linhas ao lado. O meu era um painel; o dele é uma linha —
  e o que se resolve num cartão que está a morrer **é** uma linha.
- **A `Estado=Foco` contra a `Estado=Repouso` em `O verbo com preço` quase não
  se distingue** quando vistas lado a lado no leque. Reparei ao compor o quadro
  3 e não a resolvi — pus `Papel=Armado` na primeira linha, que resolve o
  *"qual é a padrão"* pela tinta, e o anel de foco ficou a ser um segundo canal
  fraco. Se K3 medir que ninguém vê o foco de teclado no leque, volta.

**Não soube:**

- **Não sei quantas janelas abrem por luta.** Estimei 2 a 4 a partir do
  *uma por rodada* e da parcimónia de `reacoes.js:93-94`, mas não contei numa
  luta real. **Todo o argumento dos 4 s contra os 8 s assenta nesse número** — é
  a primeira coisa que K4 tem de medir, e se forem 8 por luta, 4 s é demais.
- **Os 600 ms do toque são o número mais fraco desta página.** É uma soma de
  dois valores de manual (uma fixação + a diferença toque/clique), não uma
  medida minha. Assumo-o como ponto de partida.
- **Não joguei o depois.** Este ciclo é desenho: o que eu joguei foi o **antes**
  (a luta em que toquei três controlos). A prova por experiência jogada desta
  fase só existe depois de K3.
- **A fila da ficha quebra em duas linhas a 351 px, e eu não sei se isso a
  torna pior.** As quatro pílulas somam 545 px + goteiras; a 351 vão a duas
  linhas, a 1280 vão a uma. Escolhi deixá-la quebrar em vez de encurtar
  *"eu decido, sem pressa"*, porque a frase é a opção inteira — mas não medi
  se uma fila de quatro em duas linhas ainda se lê como *uma* escolha.

---

## onde está tudo, no Figma

Página `A batalha` (`30:12`), arquivo `e5wJUzInAssoebx5npssKc`:

| quadro | o que mostra | nó |
|---|---|---|
| 1 | `Etapa=Direta` — o caso comum, um toque | `60:1234` |
| 2 | `Etapa=Chamando` com o recuo já no 1.º degrau | `58:1161` |
| 3 | `Etapa=Escolhendo` — o leque, sem relógio, 1.º verbo armado | `59:1006` |
| 4 | o silêncio (a trava K2): nenhum cartão | `60:1868` |
| 5 | telefone · `Direta`, e **zero** do campo tapado | `60:2221` |
| 6 | telefone · o leque, e **uma fila** tapada | `60:2529` |
| 7 | **a proposta ambiciosa** — a conta já feita, zero píxeis a mais | `60:2837` |
| 8 | `Etapa=Resolvida` — a expiração resolve-se no sítio | `84:2645` |
| 9 | as **quatro saídas**, e o que cada uma deixa no log | `85:2525` |
| — | a ficha · *«quando um golpe chega»*, a fila de quatro | `84:3214` |
| — | o quadro de decisões (este bloco, em tela) | `63:2119` |
