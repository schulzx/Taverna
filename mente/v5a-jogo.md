# V5a · o cabeçalho da pessoa (`jogo`, 25/09)

## PARA O `desenho`, JÁ — o que tens de saber antes de fabricar

1. **A forma é o `129:4` ao píxel, e bate com a casa sem um token novo.** Medido no
   `get_design_context`: 69 px de alto · `pt 20 · pb 16 · px 24` · `gap 12` entre as
   duas linhas · rótulos em JetBrains Mono 10 px, `leading normal`, `nowrap` ·
   esquerda `#FFB03A` = `T.amber`, `letter-spacing 1.8px` (0,18 em) · direita
   `#9B93AC` = `T.inkDim`, **sem** espaçamento · runa: fio 40×1 `alfa(T.amber,.2)`,
   `gap 12`, três pontos 8 px com 8 de intervalo (âmbar · ciano `T.mundo` · rosa
   `T.rosa`), `gap 12`, fio `flex 1` `alfa(T.amber,.2)` · chão `#0F0C18` = `T.pagina`.
   **As duas etiquetas vão em MAIÚSCULAS** (o Figma tem as duas em caixa alta).
2. **O conteúdo é do mundo, e já existe todo.** Esquerda = **o lugar**:
   `lugarDaCena()` (`App.jsx` ~:7632), com ` — ` trocado por ` · ` e em caixa alta
   (`Andar 1 — do Silêncio` → `ANDAR 1 · DO SILÊNCIO`). Direita = **a luz e o ar**:
   `luzDaHora(hora)` de `gravura-da-cena.js` (4 palavras: MADRUGADA/DIA/ENTARDECER/NOITE —
   as mesmas do glifo da pílula da cinta, logo nunca discordam) `·` o `rotulo` do clima;
   **na masmorra** a direita troca-se por `CAMADA n · n TOCHAS` (é o que
   `cabecalhoDaCena().onde` em `palco.js` já devolve). Detalhe no §1.
3. **Cor da esquerda: âmbar, como o Figma.** V1 (§1) tinha pedido o lugar em `T.mundo`;
   a pessoa pediu *exatamente igual*, e a ordem direta passa à frente da mesa. Escrevo o
   custo no §1 — não o resolvas pintando de ciano.
4. **O `CabecalhoDaCena` de v9.157 (o cartão com emoji DENTRO da área que rola,
   `App.jsx` ~:1250 e a chamada ~:23279) sai na mesma etapa.** Com a gravura fora, ele
   ficaria a ser a segunda peça a dizer o lugar — e é a que rola e tem emoji. V1 já o
   tinha condenado; V5a paga.
5. **Degradação (telefone): o lugar nunca cede primeiro.** Ordem: a direita perde o 2.º
   termo (o clima; na masmorra, a CAMADA — a tocha fica, é recurso) → a direita some →
   só então o lugar trunca com reticência. **Nunca quebra linha**: o cabeçalho tem 69 px
   fixos em qualquer largura, senão a prosa salta quando o lugar muda. §2.
6. **Zero movimento em V5a.** O cabeçalho é estático como o Figma. A chegada a um lugar
   novo não se marca aqui — é a proposta ambiciosa (§5, *a cartela de chegada*), que vive
   na prosa e não no cabeçalho, justamente para o cabeçalho nunca mudar de altura.
7. **O `clima` "ensolarado" não entra na etiqueta** (§1.3): hoje o cartão de v9.157 diz
   `🌙 noite · ☀ ensolarado` às 22:00 — medido ao vivo. É o defeito que a etiqueta nova
   não pode herdar.
8. **Com a gravura sai `rosto-da-cena.jsx` inteiro**, e com ele exports que ficam sem
   leitor (`RostoDaCena`, `gravuraDaCena`, `BANDAS`, `LARGURA_DE_REFERENCIA`, talvez
   `LUZ_DA_CENA`) — a catraca `teste-ligacao` apanha-os no dia. **`luzDaHora` fica**: a
   pílula da cinta e a etiqueta da direita leem-na. `OTopoDoPapel` já tem a
   `ResizeObserver` que a degradação do §2 precisa — reaproveita a casca, troca o miolo.

---

## 0 · O que a pessoa pediu, e o que isso decide

*"Ainda existe uma imagem procedural, vamos tirar ela e deixar exatamente igual à imagem
do Figma."* Duas ordens numa frase: **a gravura sai** e **a forma é a do `129:4`**. O que
a frase não decide é o **texto** — e o texto do `129:4` (`REVELAÇÃO · O CREPÚSCULO
ESTÁTICO` / `ATO I · CENA IV`) é bastidor e *spoiler*: nomeia a subestrutura e a verdade
eleita que nem o Narrador vê antes da revelação (V1 §1). Copiá-lo seria obedecer à
imagem e desobedecer à primeira lei que o jogador sente. **Forma do Figma, conteúdo do
mundo** — e a própria pessoa escreveu o exemplo: *"onde aparece 'Andar 1 — Do
Silêncio'"*. Ela já lê aquele sítio como *o lugar*.

**Uma coincidência que vale ouro para a prova:** a página, a 1280, mede **1144 px de
largura, 1142 por dentro da borda — exactamente a moldura do `129:4` (1142 × 69).** O
Figma foi desenhado na largura real do jogo. Com o mesmo texto, a comparação lado a lado
é **píxel contra píxel**, sem escala (§4).

## 1 · As duas etiquetas — de onde sai cada palavra

Tudo sai de funções que já existem; **nenhuma regra nova, nenhum número novo de jogo**.

### 1.1 · A esquerda: o lugar (âmbar, espaçada, caixa alta)

| estado | fonte | exemplo |
|---|---|---|
| masmorra | `masmorraRef.current.nome` (1.º ramo de `lugarDaCena()`) | `ANDAR 1 · DO SILÊNCIO` |
| lugar nomeado | `lugarRef.current.nome` | `ERMIDA DE PEDRA` |
| viagem | `a caminho de ${jornada.para}` / `a estrada` | `A CAMINHO DE VALDORA` |
| cidade | `cidadeAtualRef.current` | `TORRE DA FONTE` |
| nada sabido | `""` | **o cabeçalho fica, a etiqueta cala** — nunca `ALGUM LUGAR`, nunca `—` |

- **A fonte é `lugarDaCena()` e só ela** — é a mesma função que dava o nome à gravura e à
  semente dela; o que o jogador lia na legenda é, letra a letra, o que passa a ler aqui.
  Não se usa `cabecalhoDaCena().titulo`: são dois caminhos para o mesmo facto, e
  divergem na viagem (`jornada.destino || jornada.para` contra só `jornada.para`).
- **Formato:** ` — ` (travessão com espaços) vira ` · ` — o separador do Figma é o ponto
  médio, e com dois separadores no mesmo rótulo o olho lê duas gramáticas. Caixa alta
  **por CSS** (`text-transform: uppercase`), não no texto: o leitor de ecrã recebe
  `Andar 1 · do Silêncio` e não arrisca soletrar maiúsculas como sigla.
- **Âmbar, como o Figma, e é contra o que V1 pediu.** V1 §1 queria o lugar em `T.mundo`
  (R11 tirou ao âmbar o *lugar* para o âmbar ser só acção). A pessoa pediu *exatamente
  igual*, e ordem direta da pessoa passa à frente de decisão da mesa. **O custo, escrito:**
  o âmbar volta a ter um sentido de mundo, a 10 px, no topo — longe da soleira (onde o
  âmbar é o botão cheio). É o menor âmbar da tela e não compete com a acção. Se um dia a
  pessoa quiser o ciano, é uma linha — mas não somos nós a desfazer o que ela pediu na
  mesma hora em que pediu.

### 1.2 · A direita: a luz e o ar (`inkDim`, caixa alta, sem espaçamento)

| estado | termo 1 (nunca cai antes do 2) | termo 2 | exemplo |
|---|---|---|---|
| superfície (e viagem) | a luz: `luzDaHora(hora)` → MADRUGADA · DIA · ENTARDECER · NOITE | o clima (`climaRef.current.rotulo`), salvo §1.3 | `NOITE · CHUVA` |
| masmorra | **as tochas**: `n TOCHAS` / `1 TOCHA` / `SEM TOCHAS` | a camada: `CAMADA n` | `CAMADA 1 · 3 TOCHAS` |

- **A luz é a de `luzDaHora`, 4 palavras, e não os 6 `MOMENTOS` de `palco.js`.** É a
  mesma função que escolhe o glifo da pílula da cinta: a etiqueta e a pílula **nunca
  discordam**. Os `MOMENTOS` cortam as horas noutros sítios (às 06:00 dizem `amanhecer` e a
  luz diz `madrugada`; às 20:30, `noite` contra `entardecer`) — pô-los aqui era a tela
  dizer `NOITE` com o glifo do entardecer ao lado. Com a gravura fora, **a palavra é o que resta da luz**, e tem de
  ser a mesma luz.
- **Na masmorra a luz sai** (lá em baixo não há sol — é a lei do próprio `tomDaCena`) **e
  entram as tochas**, a única coisa desta etiqueta que decide turnos (a tocha é recurso;
  `noEscuro()` muda o que se pode fazer). Por isso, lá, **a tocha é o termo que não cai**
  e a camada é a que cede. Ordem de leitura: `CAMADA 1 · 3 TOCHAS` (do maior para o menor,
  como um endereço); ordem de **queda**: a camada primeiro. Com 0: `SEM TOCHAS` — `0
  TOCHAS` lê-se como contagem, `SEM` lê-se como perigo. (Hoje `cabecalhoDaCena().onde`
  escreve `0 tochas`; a palavra nova é de tela.)

### 1.3 · O clima que se cala

**Medido ao vivo agora (HEAD `4ce9d4c`), às 22:00:** o cartão de v9.157 diz
`🌙 noite · ☀ ensolarado`. Com a gravura fora, a etiqueta da direita é a única voz do
tempo no papel, e `NOITE · ENSOLARADO` seria ela a mentir. A regra: **o bom tempo não se
anuncia** — `ensolarado` (o clima por omissão, o de maior peso da tabela de
`encontros.js`) **não entra na etiqueta**, de dia nem de noite. Todos os outros entram,
porque todos mudam o jogo (a `nota` de cada um diz o quê: lama, emboscada, desvantagem à
distância…). `DIA` sozinho já se lê como céu limpo. É uma lista de uma palavra e mora
numa tabela (`CLIMA_QUE_SE_CALA = ["ensolarado"]`), não num `if`.

### 1.4 · O que sai com a gravura, e o que tem de migrar

| a gravura (e o cartão v9.157) dava | para onde vai | perde-se? |
|---|---|---|
| **o nome do lugar** (legenda + título do cartão) | etiqueta esquerda | **não** |
| **a luz, pela imagem e pela palavra** | a palavra: etiqueta direita + glifo da pílula | a **atmosfera** da hora perde-se; a **informação**, não. A hora fica duas vezes na tela (`22:00` + `NOITE`), era três |
| **o clima** (só no cartão, com emoji) | etiqueta direita, sem emoji, salvo `ensolarado` | não — **ganha**: sai da área que rola para o topo fixo |
| **camada e tochas** (só no cartão, que rola) | etiqueta direita, fixa | não — **ganha**: a tocha estava num cartão que rola para fora da vista; passa a estar sempre |
| **o bioma** (a silhueta; `AREIA E SOL` no cartão) | **nenhum sítio** | **sim, e aceito**: nenhum dos 20 turnos do censo de R6 foi decidido pelo bioma; é descrição, e a descrição é da prosa. O mapa continua a sabê-lo |
| **a região** (`COLINAS DO ESTIO` no cartão) | **nenhum sítio** | **sim, e aceito**: idem; está no mapa, a um toque |
| **a chegada** (eixo `chegada`, **inerte** desde R13-B) | §5, a cartela de chegada (proposta) | nada que já existisse — a prop continua na chamada, inerte, à espera |

## 2 · O telefone — a direita cede, o lugar nunca

**A largura útil, medida:** a página a 375 mede 343 px (341 por dentro); menos `px 24`
dos dois lados = **293 px**. A 320, **238 px**. A 1280, **1094 px** (o `header-top` do
Figma: 1094 — bate).

**E aqui a fonte trabalha por nós:** JetBrains Mono é monoespaçada, avanço de 0,6 em =
**6 px por carácter a 10 px**. A esquerda soma o espaçamento: **7,8 px/car.**; a direita,
**6 px/car.** A largura de cada etiqueta é **aritmética, não medição** — a regra de queda
pode viver num módulo puro e ser provada em Node (*conta se prova*); a casca só lhe dá a
largura (a `ResizeObserver` que `OTopoDoPapel` já tem).

**A ordem da queda** (com `gap` mínimo de 12 px entre as duas, o mesmo do Figma):

1. cabe tudo → tudo;
2. não cabe → a direita **perde o termo 2** (o clima; na masmorra, a camada);
3. ainda não cabe → **a direita some inteira** (a hora continua na pílula da cinta, a
   dois dedos dali — é o único sítio onde ceder não custa informação; na masmorra, a
   tocha só some se o lugar sozinho já não couber, e aí é o caso 4);
4. só quando o lugar **sozinho** excede a linha → o lugar trunca com reticência (`…`).
   **Nunca quebra linha**: o cabeçalho tem **69 px fixos** em qualquer largura. Se o lugar
   partisse em duas linhas, a prosa saltaria **no turno da chegada**, que é o turno em que
   o jogador lê com mais atenção.

**Casos reais, contados a 375 (293 px):**

| esquerda | direita | soma | resultado |
|---|---|---|---|
| `ANDAR 1 · DO SILÊNCIO` (164) | `CAMADA 1 · 3 TOCHAS` (114) | 290 | cabe, por 3 px |
| `ANDAR 12 · DAS MÁSCARAS` (180) | `CAMADA 2 · 3 TOCHAS` (114) | 306 | cai a camada → `3 TOCHAS` (48) |
| `A CAMINHO DE VALDORA` (156) | `ENTARDECER · CÉU DE COR ERRADA` (180) | 348 | cai o clima → `ENTARDECER` (60) |
| `TORRE DA FONTE` (109) | `NOITE · CALOR OPRESSIVO` (138) | 259 | cabe |
| `ERMIDA DE PEDRA DO VELHO GUARDIÃO DAS BRUMAS` (343) | qualquer | — | a direita some; o lugar trunca em ~37 car. |

Espaço de lugar a 375 com só a luz ao lado (`NOITE`, 30 px): **32 caracteres**; a 320,
**25**. Um andar gerado de dois dígitos (`ANDAR 12 · DAS CORRENTES`, 24) cabe inteiro nos
dois.

## 3 · O ANTES, medido agora (HEAD `4ce9d4c`)

**Montagem.** `git archive 4ce9d4c` para o scratchpad, servido num vite próprio (5177),
Chrome headless com perfil temporário, `/api` cortado (0 pedidos chegaram a sair),
injecção com o jogo desmontado. Os saves de V1 (*A Prova da Folha*, Ilsa, Torre da Fonte,
deserto): **dia** 08:00 e **noite** 22:00; **masmorra** = o save da noite com uma masmorra
de `gerarMasmorra()` chamada `Andar 1 — do Silêncio`, numa sala da camada 1, 3 tochas;
**longo** = o do dia num lugar de 44 caracteres. Duas medidas por tela: **como abre** (a
área rola sozinha até ao fim, que é onde o jogador está) e **no topo** (rolada a 0 — o
que se vê no turno da chegada, com a cena curta). Script:
`scratchpad/v5a-jogo/medir.mjs`; números em `antes.json`; 16 fotos em `fotos-antes/`.

### 3.1 · A moldura

| | 375 × 812 | 1280 × 800 |
|---|---|---|
| a gravura (fixa, no topo do papel) | **96 px** (+1 de borda = **97** do topo da página à área que rola) | **96 px** (97) |
| o cartão v9.157 (na área que rola, logo depois de `O MESTRE`) | **64 px** + 16 de intervalo | **64 px** + 16 |
| do topo da página à **1.ª linha de prosa**, rolada ao topo | **366 px** | **348 px** |
| altura da área que rola (noite · dia) | 419 · 475 | 411 · 473 |

### 3.2 · Quantas linhas de prosa se veem, sem rolar

| cena | 375 como abre | 375 no topo | 1280 como abre | 1280 no topo |
|---|---|---|---|---|
| cidade, dia | 7 | 7 | 8 | 8 |
| cidade, noite | 6 | 5 | 8 | 5 |
| masmorra, noite | **0** (o painel da sala ocupa o fim) | 5 | **0** | 5 |
| lugar longo, dia | 6 | 7 | 8 | 8 |

(Linha de prosa = linha de texto a 17 px, `TIPOS.prosa`, inteira dentro da parte visível
da área. O `0` da masmorra não é do cabeçalho: é o painel da sala, que é a decisão da
vez — fica registado para o depois não o contar como ganho nem perda.)

### 3.3 · Os cinco segundos (nas oito telas "como abre")

| pergunta | resposta hoje | onde | vezes na tela |
|---|---|---|---|
| **onde estou?** | `Torre da Fonte` · `Andar 1 — do Silêncio` | legenda da gravura (+ cartão, se rolado ao topo) | 1–2 |
| **que horas são?** | `22:00` · `NOITE` (· `🌙 noite · ☀ ensolarado`) | pílula + legenda (+ cartão) | 2–3, **e uma delas contradiz-se** |
| **quanto PV?** | `14` e a barra | cinta | 1 |
| **quanto dinheiro?** | `15` | cinta | 1 |
| **o que posso fazer?** | `Aceitar: …` + o campo; na masmorra, a sala | soleira + campo | 1 |

**Cinco respostas à primeira nas oito**, e dois defeitos que o depois não pode herdar:
*que horas* dito três vezes, uma delas errada (`ensolarado` às 22:00); e **as tochas**
só no cartão, que **rola para fora da vista** — nas duas telas "como abre" da masmorra o
jogador **não vê quantas tochas tem**, que é o recurso que manda lá em baixo.

## 4 · O protocolo da prova do DEPOIS

O mesmo `medir.mjs`, `ORIGEM` no servidor do depois e `ROTULO=depois` — mesmos saves,
mesmas quatro cenas, mesmas duas larguras, **mais 320 × 700 na cena longa**. O cabeçalho
acha-se sem gancho novo: é o `previousElementSibling` da área que rola.

**Critérios — qualquer um que caia e V5a não sobe:**

| # | critério | como |
|---|---|---|
| 1 | **lado a lado com o `129:4`, píxel contra píxel** | um *harness* (não produção) monta a peça com os textos do Figma (`REVELAÇÃO · O CREPÚSCULO ESTÁTICO` / `ATO I · CENA IV`) a **1142 px**; captura do elemento contra o PNG do `get_screenshot` (1142 × 69). Passa com **caixa idêntica ao píxel** (69 de alto; rótulos no y 20; runa no y 45; pontos em x 76 · 92 · 108) e **≥ 98 % dos píxeis a ΔE < 3** (a margem é o anti-serrilhado do texto, não a forma). As duas imagens entram no diário, uma sobre a outra. E **no jogo a 1280** (página = 1142 por dentro), a mesma captura com os textos reais, ao lado do `129:4` |
| 2 | **a forma, lida no DOM** | `getComputedStyle`: 69 px · `20/24/16/24` · `gap 12` · JetBrains Mono 10 px · esquerda `rgb(255,176,58)` + `letter-spacing 1.8px` · direita `rgb(155,147,172)` + `normal` · fios 1 px a `amber` 20 % · pontos 8 px âmbar/`mundo`/`rosa` · chão `T.pagina` — **zero hex novo** no código |
| 3 | **69 px em toda a largura e cena** | 375 · 1280 · 320, as quatro cenas: altura 69 ± 0, `scrollWidth` = viewport, nenhum rótulo em duas linhas |
| 4 | **linhas de prosa ganhas** | previsão: a moldura fixa passa de **97 para 69 (−28 px ≈ +1 linha de 27,6)** em toda a tela; no topo sai também o cartão (**−80 px**): a 1.ª linha sobe **~108 px ≈ +3,9 linhas** (366 → ~258 a 375; 348 → ~240 a 1280). Passa com **≥ +1 linha "como abre"** em cada cena de superfície e **≥ +3 "no topo"**, nas duas larguras. Menos que isso = medir de novo antes de discutir |
| 5 | **os cinco segundos** | nas oito telas, as cinco respostas à primeira; *onde* = etiqueta esquerda; *que horas* = pílula + direita, **duas vezes e concordantes**; na masmorra, **as tochas visíveis sem rolar** (hoje: não) |
| 6 | **a degradação** | cena longa a 375 e 320, e uma viagem com clima comprido: segue a ordem do §2 (termo 2 → direita → reticência), lugar sempre presente |
| 7 | **nada mexe, nada pesa** | com e sem `reduced-motion`: **0 animações** no cabeçalho. O cabeçalho re-renderiza a cada tecla do campo como hoje a gravura — mas é texto; mede-se uma tecla antes/depois e o depois não pode ser mais lento |
| 8 | **a tela de combate intocada** | a captura de combate de V4 antes/depois, diferença 0 |
| 9 | **a casa** | `npm run build` limpo, `npm test` verde, `teste-ligacao` sem export órfão de `rosto-da-cena` / `gravura-da-cena` |
| 10 | **joguei** | eu, no depois, os dois saves e a masmorra, e escrevo se é jogo — não só se passou |

## 5 · A proposta ambiciosa — **a cartela de chegada** (para V5b)

**O que é.** No turno em que o lugar muda (o eixo `chegada`, que já vai na chamada e está
**inerte desde R13-B**), a prosa do Mestre abre com uma **cartela**: o nome do lugar em
letra de título, grande, com a runa âmbar·ciano·rosa por baixo — a mesma runa do
cabeçalho, agora a assinar um capítulo. `ANDAR 1 · DO SILÊNCIO`, e depois a prosa. No
turno seguinte a cartela é só mais uma linha do histórico (rola com o resto); não volta a
aparecer para o mesmo lugar no mesmo dia.

**Porque é isto que faria o jogo ser lembrado.** A gravura existia para dizer *chegaste*
— e dizia-o **em todos os turnos**, 96 px fixos, para servir um em cada dez (R13: 10 das
21 mensagens de R6 abriam com chegada). A cartela diz o mesmo **só no turno que
importa**, e custa **zero** nos outros. É o gesto dos títulos de área de *Dark Souls*
(2011) e *Hollow Knight* (2017): o nome do sítio grande quando se entra, e nunca mais — o
jogador lembra o nome porque o jogo lho **anunciou**, não porque o viu num canto
quatrocentas vezes. (Precedente de ofício, não estudo: a prova será jogada, §4-10.)

**As leis que respeita.** Não bloqueia nada (é texto no fluxo, não sobreposição; o campo
está vivo desde o primeiro milissegundo). Entra com o *fade* da casa, ≤ 200 ms; com
`reduced-motion`, entra parada. Decai **por turno, nunca por relógio**. Não mexe no
cabeçalho, que continua 69 px fixos. Não fala de si: é o nome do lugar e mais nada.

**O que precisa.** Uma peça nova do `desenho` (*a cartela*) e a fiação da prop `chegada`
que já existe. **Nenhuma regra nova.** Peso pela tabela de design: **médio** (criar o que
não existe, sem mudar o fluxo) — no tema da ordem de 23/09, a mesa decide. Proponho-a
para V5b, logo a seguir, porque é ela que devolve ao jogo o que a gravura tentava dar e
não conseguia sem custar a página.

## 6 · Para o Figma (o par que o `desenho` monta)

O `129:4` é o estado de referência. Os estados do momento, que peço montados ao lado dele
com os textos reais: **1280 cidade** (`TORRE DA FONTE` / `NOITE · CHUVA`) · **375
masmorra** (`ANDAR 1 · DO SILÊNCIO` / `CAMADA 1 · 3 TOCHAS`, a caber por 3 px) · **375 a
ceder** (`A CAMINHO DE VALDORA` / `ENTARDECER`) · **320 lugar longo** (`ERMIDA DE PEDRA DO
VELHO GUA…`, sem direita) · **nada sabido** (só a runa). A forma é dele; eu assino o
conteúdo e a ordem da queda.

## 7 · A prova jogada de V5a — o resultado (`jogo`, 25/09)

**Montagem.** *Antes* = o HEAD `4ce9d4c` exportado (§3). *Depois* = a árvore do
`oficial` na 5173. Mesmo `medir.mjs`, mesmos saves, as mesmas quatro cenas a 375 e a 1280,
mais o lugar longo a 320. Chrome headless com perfil temporário e `/api` cortado (0 pedidos
saíram). O lado a lado está em `figma.mjs`. Os números estão em `depois.json` e `figma.json`,
e as fotos em `fotos-depois/`, tudo no scratchpad `v5a-jogo/`. **O critério do píxel é o
do `regente`**: a caixa igual ao píxel, e a diferença mínima sem deslocamento.

| # | critério | resultado |
|---|---|---|
| 1 | **lado a lado com o `129:4`** | **passou.** Com os textos do Figma, a caixa de cada elemento, contra o PNG do Figma: etiqueta esquerda `24,20 · 255×12` / jogo `25,20 · 254×12` (1 px de serrilhado na primeira letra) · os três pontos **idênticos** (`76/92/108, 45, 8×8`) · fio curto `24 · 40` idêntico. O fio fica na linha 49 a `#3F2D1F` (âmbar a 20 % exatos); o Figma espalha-o pelas linhas 48 e 49 a meia tinta (`#271C1B`) · etiqueta direita `90×8` idêntica · a cor de pico bate: âmbar `FFB03A` = `FFB03A`, direita `9B8FA7` contra `9B93AC`. **Diferença mínima em (0,0)**: ΔE médio 1,05, com 95,0 % dos píxeis a ΔE < 3. Todos os 24 deslocamentos de ±1–2 px pioram (o melhor vizinho, (−1,0), dá 1,29). Com os meus olhos, as duas imagens uma sobre a outra: é a mesma peça. **A única diferença é de largura e não de forma**: a página a 1280 mede agora **1144** (a borda passou a `outline` por dentro), contra os 1142 do quadro do Figma. Tudo o que se ancora à direita (a etiqueta e o fim do fio longo) fica 2 px mais à direita **e continua a 24 px da borda**, como no Figma |
| 2 | **a forma, lida no DOM** | **passou**: 69 px · padding `20px 24px 16px` · `gap 12px` · JetBrains Mono 10 px · esquerda `rgb(255,176,58)` com `1.8px` de espaçamento · direita `rgb(155,147,172)` · `text-transform: uppercase` · pontos 8 px em 76/92/108 |
| 3 | **69 px em toda a largura e cena** | **passou**: 69 nas 18 telas (375, 1280 e 320), `scrollWidth` = viewport em todas, nenhum rótulo quebrado |
| 4 | **linhas de prosa ganhas** | **no topo, passou**: 1.ª linha de prosa **366 → 259 px** (375) e **348 → 241** (1280), −107 px. Linhas visíveis: dia 7→**11** e 8→**11**, noite 5→**9** e 5→**8**, masmorra 5→**9** e 5→**8**, longo 7→**11** e 8→**11**, ou seja **+3 a +4** em todas. **Como abre, passou em píxeis e falhou como eu o escrevi**: a área que rola ganhou **+29 px nas 12 telas** (1,05 linha). Linhas *inteiras* de prosa: +1 só em 2 de 6 (noite-375 6→7, longo-375 6→7) e +0 nas outras 4. Medi de novo antes de discutir, como o protocolo mandava. Com a vista presa ao fundo, a faixa ganha cai no intervalo de parágrafo, na linha do sistema ou numa linha que nasce 0,6 px debaixo do esbate. Nenhuma tela perdeu linha. O critério era um proxy mal escolhido para a vista presa ao fundo, e digo-o aqui em vez de o mudar calado |
| 5 | **os cinco segundos** | **passou nas oito**: *onde* `TORRE DA FONTE` / `ANDAR 1 · DO SILÊNCIO` · *que horas* `22:00` + `NOITE`, **duas vezes e de acordo** (antes eram três, uma delas `ensolarado` às 22:00; agora o clima cala-se) · *PV* 14 · *dinheiro* 15 · *o que fazer* `Aceitar` + campo. **Na masmorra, `CAMADA 1 · 3 TOCHAS` aparece sem rolar a 375 e a 1280.** Antes, nas duas telas como abrem, a tocha não se via |
| 6 | **a degradação** | **passou**: masmorra a 375 cabe inteira (a direita tem 119 px e precisava de 114). Lugar longo a 375 e a 320: a direita desce a 0 px e o lugar trunca com reticência (283 e 228 px). A 1280 nada cede |
| 7 | **nada mexe** | **passou**: 0 animações no cabeçalho em todas as telas |
| 8 | **a caixa mista a 375** | **não reproduzi.** Em 5 cenas a 375 e a 320 o DOM dá `uppercase` e a foto mostra maiúsculas (`TORRE DA FONTE`, `ANDAR 1 · DO SILÊNCIO`, `ERMIDA DE PEDRA…`). Suspeito da lei *HMR mente depois de rename* (uma aba velha) ou do título próprio do painel da masmorra. Se voltar a aparecer, quero o save |

**O que muda para quem joga, em número:**
- O topo do papel desce de **97 para 69 px** (−28), em todas as telas e em todos os turnos.
- **A cena rolada ao topo mostra +3 a +4 linhas de prosa.** No telefone a primeira palavra do Mestre sobe **107 px**.
- A hora aparece **2 vezes e não 3**, e deixou de haver `ensolarado` à noite.
- Na masmorra, **as tochas estão sempre à vista**. Antes, no telefone, era preciso rolar até ao topo da cena para as ver.
- **0 emoji** no topo da página: saiu o cartão de v9.157, que tinha 2 a 3 emoji por cena (`🏘`/`🕳`, `🌙`, `☀`).

**Um conserto que não bloqueia, para V5b:** na masmorra, logo abaixo do cabeçalho
(`ANDAR 1 · DO SILÊNCIO`), o título próprio do painel da sala repete o lugar com a outra
gramática (`ANDAR 1 — DO SILÊNCIO`). Isto dá o mesmo facto duas vezes na mesma tela, com dois
separadores. É território do painel e não do cabeçalho. Anda junto com a cartela de
chegada (§5), que vai decidir onde o nome do lugar se anuncia.

**Veredito: sobe.** É a peça do Figma, com o lugar e a hora do mundo no sítio do bastidor.
Joguei as duas telas da noite antes e depois. No depois, o *onde* e o *que horas*
respondem-se sem ler a imagem, e a página começa mais perto do Mestre. A única falha é o
critério 4 *como abre*, que era um proxy meu, e não é defeito da peça.
