# K1 · o momento desenhado (bloco do `desenho`, para fundir em `mente/formas.md`)

Fase K — a reação ganha controle. **Nenhum `.js`, `.jsx` ou `.mjs` foi tocado.**
Arquivo Figma `Taverna — biblioteca` (`e5wJUzInAssoebx5npssKc`), **ampliado, nunca
duplicado**. Tudo ligado a variável; zero hex solto.

> **2.ª rodada (15/09).** O `regente` devolveu a etapa com seis arbitragens contra
> o bloco do `jogo`. Estão todas executadas, e as marcas **[A2]** no texto abaixo
> assinalam o que mudou por causa delas. O que a 1.ª rodada acertou continua de pé;
> o que ela **não viu** está na secção *os preços contra a tabela* e no novo
> *o que ficou feio*. A peça deixou de ter 4 variantes e tem **8**.

---

## A tabela das peças

| peça | página | nó | variantes | por que não existia |
|---|---|---|---|---|
| **O chamado** | `O chamado` (`62:2119`) | **`62:2453`** | **8** — *Forma* (Chamada · Verbo) × *Tempo* (Barra · Contagem) × *Pressa* (Sobra · Pouco) | A pessoa pediu **um botão**; E1 entregou um painel de 193 px com um botão lá dentro. O botão nunca foi peça — era uma região de outra peça, e por isso não podia aparecer sozinho no telefone, nem ser o verbo direto quando só há uma reação. |
| **O verbo com preço** | `O verbo com preco` (`64:2136`) | **`64:2446`** | **6** — *Papel* (Gesto · Recuo) × *Estado* (Repouso · Foco · Impedido) | Porque **o `Botao` mede que a sua fenda de razão só existe nas 12 variantes em que ele RECUSA** (*Esperando* e *Impedido*). Um botão que funciona não tem onde escrever o preço — e a lei da casa é o veredito antes do clique. E1 contornou-o empilhando `Botao` + `Consequencia`: 63 px por opção, **duas** zonas, e o preço **fora** do alvo. |
| **IconeEscudo** | `Glifos` (`15:2`) | **`61:2`** | — | `reacoes.js` tem seis reações com `icone`, e a biblioteca tinha glifo vetorial para três. As outras três usavam emoji — e **emoji não herda a variável de cor**, que é a primeira lei da casa aplicada ao visual. |
| **IconeEsquiva** | `Glifos` (`15:2`) | **`61:4`** | — | idem. *(Três formas até acertar — a primeira lia-se como `IconeSeta`, a segunda como `IconeEscudo`, que está na linha de cima da mesma lista. A razão de cada recusa está escrita na descrição do glifo.)* |
| **IconeContramagia** | `Glifos` (`15:2`) | **`61:6`** | — | idem. |

**[A2] O que a 2.ª rodada acrescentou à biblioteca:**

| o que | nó | por quê |
|---|---|---|
| **`O verbo com preço` · `Papel=Armado`** | `82:2586` (Repouso), `82:2593` (Foco) | O `jogo` pediu o primeiro verbo do leque **cheio**, não contornado — é a *"reação padrão"* que a pessoa pediu, sem nada para configurar. Corpo em `amber`, verbo e preço em `onAccent` (**8,49:1**). **`Armado×Impedido` não nasceu**: o verbo armado é por definição o que já passou pelo filtro de PM de `reacoes.js:89`, e variante que não pode acontecer é export morto com outra roupa. |
| **`O chamado` · `Tempo=Parado`** | `83:14` (Chamada), `83:24` (Verbo) | A janela **sem relógio**. O trilho não se esconde — **esvazia-se**: `quanto sobra` sai e a fita fica da cor do próprio botão, para que trocar de eixo não mexa nos 56 px. Chega por duas estradas, e as duas precisavam dele: a pílula *«eu decido, sem pressa»* da ficha (arbitragem B) e o leque, que não expira (arbitragem D). `Pressa` não existe sem relógio, por isso só `Pressa=Sobra` ganhou `Parado`. |
| **`lineStrong`** (variável) | `VariableID:88:2` | **É a proposta ambiciosa, e está à espera da pessoa.** Ver o fim deste bloco. |

**Peça mudada, com o motivo:** **`A escolha`** (`20:77`) — a **Pílula subiu de 35 px
para 47**. O *Contador* nasceu em D4 com o piso de 44 escrito por extenso
(*"preciso de uma peça de escolha que saiba ser contador sem encolher para caber"*)
e a Pílula — que é a forma que vai para a ficha, logo para o polegar — ficou em 35,
**abaixo do piso** (WCAG 2.5.5 AAA; Apple HIG 44 pt; Material 48 dp). O piso saiu do
**enchimento**, não do texto. **Conferido antes de mexer: zero instâncias de
`Forma=Pilula` em todo o arquivo** — nenhuma composição mudou por baixo, que é a
condição que E1 impôs a este tipo de correção.

**Peça que NÃO nasceu, e é o resultado de que mais me orgulho:** a preferência.
*"reação padrão"* e *"nunca me pergunte"* pareciam duas coisas (um interruptor mais
uma lista). **São uma só.** Ver abaixo.

---

## O que mudou em *A pergunta que expira* (`31:518`, **8 variantes** [A2], refeitas por dentro)

**[A2] A matriz nova, e cada ausência é uma frase.** `Etapa` (Direta · Chamando ·
Escolhendo · Resolvida) × `Tempo` (Barra · Contagem · Parado), **não preenchida de
propósito**:

| | Barra | Contagem | Parado |
|---|---|---|---|
| **Direta** | `84:3009` | `84:3032` | `84:3054` |
| **Chamando** | `31:386` | `84:3077` | `84:3100` |
| **Escolhendo** | — | — | `31:419` |
| **Resolvida** | — | — | `84:3194` |

As quatro células vazias **são a arbitragem D desenhada**: o leque não expira, logo
não tem eixo de tempo, e uma barra parada mentiria sobre a forma. `Escolhendo×Barra`
e `Escolhendo×Contagem` foram **apagadas**. Todas as oito medem **344** de largura.

**1. A largura estava errada, e ninguém a tinha medido.** E1 escreveu — aqui, no
diário e **no próprio nome do quadro do `jogo`** (*"344 = a largura de A pergunta
que expira"*) — que a peça media 344 e encaixava exata na lateral. **Media 320.**
Vinte e quatro pixéis entre o escrito e o construído. Agora mede 344.

**2. O cordão umbilical existia só na descrição.** E1 escreveu *"o filete de 3px em
`danger` na aresta esquerda é o cordão umbilical"* e **não o construiu**. Existe:
3 px, `danger`, altura inteira, nas quatro variantes.

**3. *Etapa=Chamando*: 193 px → 56 px → [A2] 118 px.** Era um painel de quatro
blocos (a linha do golpe, um botão, o preço, o trilho, a nota) para se apertar
**um** botão; a 1.ª rodada deixou-o em 56. **A arbitragem E devolveu-lhe 62 px, e
está certa:** *deixar passar* tem de estar no primeiro degrau, porque **ignorar a
janela GASTA PM** — o jogador que quer poupar PM era o mais castigado por ela, e sem
o recuo aqui poupar PM custava dois toques sob relógio. **O −71 % que escrevi na 1.ª
rodada já não vale: são −39 %** (193 → 118), e o número honesto é esse. O que se
comprou com os 62 px é a correção do defeito que a fase existe para corrigir.

**4. *Etapa=Escolhendo*: 332 px → 215 px (−35 %)**, com o mesmo número de opções.
E no **teto** (quatro reações + o recuo) mede **[A2] 321** — quatro a menos que os
325 da 1.ª rodada, porque o trilho saiu. *O teto novo continua mais baixo que o chão
velho.* Prova montada na folha `K1 · a prova` (**`74:64`**).

**4b. [A2] O recuo cai na mesma coluna do chamado, e isso foi medido.** As palavras
do recuo começam a **51 px** da aresta do cartão; as do chamado também — `3` (cordão)
`+ 6` (a folga da fenda) `+ 42` (o enchimento do `Papel=Recuo`) de um lado, `3 + 14 +
22` (glifo) `+ 12` (gap) do outro. *Uma lista sob relógio lê-se pela coluna, não pela
linha*, e a coluna só existe se ninguém a partir.

**5. A nota *"não responder é uma resposta"* saiu da janela — e esta é a decisão de
desenho da etapa.** Era uma **promessa lida sob relógio**; passa a ser um **facto
lido depois**. Ver *"o estado «não vou reagir»"*, abaixo.

**6. O orçamento da frase, descoberto ao montar a prova.** Em 344 a fenda do preço
tem **259 px úteis** e a mono 10 anda a ~6 px por caractere: **40 caracteres, nem um
a mais**. As frases de E1 não cabiam — *"3 PM · desfaz a magia antes de ela chegar"*
(41) quebrava a 320 e a 296, e a frase com risco (63) quebrava **até a 344**. As
cinco frases foram reescritas ao orçamento.

**7. Largura não é eixo, mas tem piso — e o piso é 344.** Eu ia declarar 296; a
folha de prova desmentiu-me. **296 e 320 quebram a frase mais longa em duas linhas.**
344 é a lateral de 1280; **351** é o telefone de 375 menos duas goteiras de 12.
*Nunca foi preciso encolher 320 para caber num telefone — era preciso CRESCER para
preencher a lateral.* (O argumento da elasticidade contra a variante é o mesmo que
E1 escreveu para a `Barra de medida`: quem absorve é o único elemento cuja largura
não carrega informação.)

---

## [A2] Os preços contra a tabela — **cinco factos errados, em 18 nós**

A arbitragem C era a que o `regente` disse temer mais, e tinha razão: *uma peça que
mente sobre a tabela é pior que peça nenhuma — é a primeira lei da casa invertida
dentro da biblioteca.* Conferi as **seis** reações campo a campo (`pm`, `corta`,
`chance`, `icone`, `nome`) contra `src/reacoes.js:22-69`, **lendo todos os nós de
texto das três páginas**, não olhando imagens. Estavam errados:

| # | onde | dizia | a tabela diz | agora |
|---|---|---|---|---|
| 1 | `O chamado`, **8 nós** | `2 PM · corta metade` | `aparar` tem **`pm: 0`** (`:46-47`) | `sem PM · corta metade` |
| 2 | `O verbo com preço`, `Estado=Impedido` | `3 PM · voce tem 1` | `escudo_arcano` tem **`pm: 2`** (`:40-41`) | `2 PM · você tem 1` |
| 3 | a peça + a prova, **7 nós** | `absorve quase todo o golpe` | **`corta: 0.6`**, e o `desc` do próprio catálogo diz *"a maior parte"* | `2 PM · corta a maior parte do golpe` |
| 4 | a folha do teto | `costuma dar certo` | `chance: 0.6` cai na 2.ª linha de `PALAVRAS_DA_CHANCE` — *aquela frase não existia na tabela* | `sem PM · anula · mais vezes que não` |
| 5 | a folha da preferência | a Pílula subiu *"de 35 para 45"* | mediu-se **47** | `47` |

**O 1 e o 2 são do `jogo` — ele viu-os e eu não.** O 3, o 4 e o 5 são meus, e são
piores: o 3 e o 4 não são números trocados, são a peça a **contradizer a tabela que
ela própria declara** duas linhas acima. **E quatro dos oito nós do erro 1 estavam
OCULTOS** (o `o preco` por baixo de `Forma=Chamada`, que nunca aparece) — um erro
invisível é exatamente o que sobrevive a uma revisão a olho, e é a razão de esta
conferência ter sido feita por leitura e não por imagem.

**O orçamento de 40 caracteres aguenta as cinco frases:** 30 · 27 · 30 · 35 · 35.

**E a tabela ganhou uma segunda coluna, porque a medida obrigou.** A frase longa de
`PALAVRAS_DA_CHANCE` (*"dá certo mais vezes que não"*, 27 c) **não cabe** ao lado de
`sem PM · anula ·` dentro dos 40. Em vez de mudar o facto, separei os dois lugares —
que é a fronteira que o `jogo` já tinha escrito (*a janela é gameplay, a ficha é
consulta*):

| `chance` | **na janela** (≤40 c, lê-se em 4 s) | **na ficha** (lê-se devagar) |
|---|---|---|
| ≥ 0,70 | `quase sempre` | `quase sempre dá certo` |
| 0,50 – 0,69 | `mais vezes que não` | `dá certo mais vezes que não` |
| 0,30 – 0,49 | `de vez em quando` | `dá certo de vez em quando` |
| < 0,30 | `raramente` | `raramente dá certo` |

A direção da frase continua a ser **sempre a mesma** — o que acontece quando dá
certo. Nunca se inverte o enquadramento dentro da mesma lista (Tversky & Kahneman,
*Science* 1981).

### E um facto que descobri ao conferir, que **não é meu para resolver**

**`chance` não é a probabilidade de a reação dar certo.** Em `reacoes.js:96` ela
decide se a reação é **sequer escolhida** (`if (r.chance != null && Math.random() >
r.chance) continue;`); uma vez escolhida, `resolverReacao` aplica `corta` **sem rolar
nada**. Hoje isso é invisível, porque quem escolhe é o sistema. **No instante em que
o jogador escolhe à mão, deixa de o ser:** ou a chance passa a rolar na resolução, ou
a frase do risco não descreve coisa nenhuma. **As quatro palavras só são honestas na
primeira hipótese** — e essa é decisão do `backend`, em K3. Fica dito aqui e na folha.

---

## As decisões que tomei sem perguntar

### [A2] `Etapa=Direta` — e a medida que me obrigou a refazer o botão

A arbitragem A tornou `Forma=Verbo` **o padrão do caso comum**: uma reação → um toque
para reagir, um para recusar; duas ou mais → chamado → leque. A contagem que o prova é
a minha e a do `jogo`, e é a mesma: **12 classes em 12 têm exatamente uma reação de
`sofre_dano` pelo perfil.**

**E ao construí-lo descobri que o botão não aguentava a tabela.** Em `Forma=Verbo` o
verbo e o preço estavam **na mesma linha**. Pus a frase mais longa que `reacoes.js`
permite — *Escudo Arcano · «2 PM · corta a maior parte do golpe»*, 35 caracteres — num
clone descartável, e o verbo esmagou-se a **34 px**: *"UDO / ARC / ANO"*, em três
linhas de três letras. **Cinco das doze classes são conjuradoras**, ou seja o caso que
quebrava era o maior perfil do jogo. Não deduzi: medi, e a imagem está no relatório.

O conserto é o que devia ter sido desde o início: **o preço cai DEBAIXO do verbo, como
cai no leque.** A fenda passou de ~126 px para **277** — folga confortável sobre os 40
caracteres. E a tipografia passou a separar duas coisas que eu tinha misturado:

> **uma REAÇÃO diz-se em Spectral Medium 14** (`Aparar`), como no leque.
> **uma ORDEM fica em mono Bold caps com entreletra** (`REAGIR`).

Assim o mesmo verbo tem **a mesma cara nos dois degraus** e o preço está sempre no
mesmo sítio. *Era uma segunda forma para a mesma ação, que é o defeito que esta mesa
existe para impedir — e estava dentro de uma peça minha.*

### [A3] O trilho mede a **janela**, nunca o conteúdo

O `jogo` apanhou-o ao recompor, e o defeito era mais fundo do que o que ele viu.
`quanto sobra` era **213 px fixos**: a 344 dava 62%, a 351 dava 60,7%, e dentro de
uma fenda mais estreita dava outra coisa. **O mesmo estado nominal desenhava-se em
proporções diferentes conforme o contentor.**

**Porque isto não é cosmética.** Se o 100% do relógio muda com o que está escrito no
botão, *Aparar* e *Escudo Arcano* dão ao jogador **dois relógios diferentes para o
mesmo tempo** — e a barra passa a mentir sobre o tempo, que é literalmente o que a
lei *linear só para o que mede tempo* existe para impedir. **Uma barra de tempo só é
honesta se o seu 100% for uma coisa fixa, e a única coisa fixa aqui é a largura da
janela.**

O conserto: `o tempo que resta` é **FILL** em todas as variantes, e `quanto sobra`
passou a ser **proporção** contra um irmão novo, `quanto passou` — `layoutGrow` 62/38
em `Pressa=Sobra`, 17/83 em `Pouco`. **Medido a 296, 344, 351 e 420 px, com verbo
curto e verbo longo: o trilho enche o cartão e o cheio dá 62% nos oito casos.**

*Duas coisas que ficam ditas.* Nas quatro variantes `Tempo=Contagem` o trilho está
**oculto de propósito** (é a saída por `prefers-reduced-motion`), e **o Figma recusa
em silêncio aplicar FILL a um nó fora do leiaute** — lá ele continua a reportar
`FIXED`. Não renderiza, logo não pode medir mal, mas está registado na descrição. E
**eu próprio desfiz o conserto uma vez**: a seguir ao `layoutSizingHorizontal = FILL`
escrevi `primaryAxisSizingMode = "FIXED"`, que num frame **horizontal** *é* a largura
— o FILL saía por baixo sem erro nenhum.

**Para K3:** o trilho é `width: 100%` da janela e o cheio é `width: N%` do trilho.
**Nunca pixéis.**

### [A3] O glifo só aparece quando **houve gesto**

Em `Etapa=Resolvida` o glifo mostrava a espada mesmo quando ninguém aparou. São
quatro saídas, e elas não se repartem como parecia:

| saída | houve reação? | glifo | as palavras |
|---|---|---|---|
| **respondeu** | sim, escolhida por ele | **sim** | *você aparou o golpe* |
| **expirou** | sim, escolhida pelo sistema | **sim** | *o instinto aparou por você* |
| **recusou** | **não** | **não** | *você deixou o golpe passar* |
| **silêncio** (3.ª seguida) | — | *não há cartão nenhum* | — |

**`respondeu` e `expirou` diferem em QUEM agiu, não em SE agiu** — nos dois casos uma
reação aconteceu e o glifo dela é verdadeiro; o que os separa são as palavras, que é
onde a diferença realmente mora. **`recusou` é a única em que não há gesto**, e por
isso é a única sem glifo.

**Não inventei um glifo neutro, e a razão já estava escrita nesta casa:** `O verbo com
preço` diz que `Papel=Recuo` não tem glifo porque *"nenhum glifo desta casa diz «deixar
passar» sem mentir, e inventar um seria dar nome de mecanismo a uma abstenção"*. **A
resolução de um recuo herda a regra do recuo.** Um sinal novo para *"nada aconteceu"*
seria o mecanismo a falar de si mesmo pela porta dos fundos.

**Não abri um eixo**, porque custaria mais do que resolve: `Etapa` já tem quatro
valores, e uma terceira propriedade obrigaria as **oito** variantes a declarar um
valor por causa de **uma**. O padrão da casa para isto já existe e está nesta mesma
peça: `os segundos` e `o atalho` são nós que nascem escondidos. **O glifo passou a ser
o terceiro.**

**E isso exigiu a parte que importa:** esconder um filho de auto-layout **colapsa o
espaço dele e arrasta as palavras**. Por isso o glifo passou a viver dentro de
**`o lugar do glifo`**, uma coluna **fixa** de 22 px que não desaparece com ele.
Medido nos três casos: **as palavras começam em `x=51` nas três**, com glifo e sem — a
mesma coluna dos verbos do leque. As três estão desenhadas na folha `74:64`.

### [A2] `Etapa=Resolvida` — o rosto da trava K2

Quando ninguém responde, o cartão **não desaparece: resolve-se no sítio.** O verbo é
substituído pela linha que o sistema produziu, ela fica **~1,2 s** e o cartão sai a
**140 ms, só opacidade**:

> ⚔ **o instinto aparou por você**
> `4 evitado · 9 vira 5`

**O glifo do verbo fica: o botão vai-se embora, o gesto não.** Três coisas de graça, e
são do `jogo`: a resposta chega **onde a pergunta foi feita** (hoje chega num log de
que ele pode ter rolado para longe); o contrato ensina-se sozinho, uma vez por
expiração; e o **PM aparece onde a escolha foi oferecida**. As minhas três frases do
log ficam — **não é duplicação, é o mesmo facto em dois tempos**, e o log é o registo.

### O que se herda do dado, e o que se recusa
Herda-se o **sentido**: `IconeD20` é o sinal desta casa para *"o acaso decide
agora"*, e o chamado é o instante em que o acaso ainda admite a sua voz.
**Recusa-se o movimento.** `.tv-dice` é `tvShake .35s linear infinite` +
`tvGlow 1s ease infinite`, as duas infinitas, e **D5 mediu que a saída por
`animation: none` deixa a pisca e tira o sentido — estritamente pior que não ter
saída.** *Herdar engano é o erro.* Aqui **o glifo está parado e o que se move é o
tempo**, uma vez só, linear, até ao fim.

### O tempo mora dentro do botão
O trilho **é a aresta de baixo do próprio botão** (4 px): o botão esvazia-se de si
mesmo. Uma barra colada por baixo seria um segundo objeto para o olho encontrar no
segundo em que ele tem de decidir.

### *Pressa* é um segundo canal, nunca o primeiro
Quem carrega o sentido é o **comprimento** do trilho — posição ao longo de uma
escala comum é a variável visual mais precisa que existe (**Cleveland & McGill,
*Graphical Perception*, JASA 1984**). A tinta `amber → danger` **corrobora e não
decide**, porque `amber`/`danger` = **1,59:1** de luminância: em visão periférica a
diferença é de matiz, e matiz periférico é fraco. A lei fica cumprida — a cor nunca
carrega o sentido sozinha. E acontece **num degrau, uma vez**: nada de pisca.

### O leque é uma linha por opção, e o alvo inclui o preço
63 px e duas zonas → **48 px e uma zona, com o preço dentro dela**. E o recuo deixou
de medir 42: **os 42 px de E1 eram um acidente de borda, não uma decisão** — o
`Botao` *Gesto* mede 44 porque tem 1 px de borda de cada lado e o *Recuo* mede 42
porque não tem nenhuma. Aqui o piso sai do enchimento.

### O risco não ganhou tom próprio em `A Consequência`, e é recusa com motivo
**A chance de falhar é preço**: a reação gasta-se de qualquer maneira. E um quinto
tom não caberia — os quatro já consomem `inkDim`, `amber`, `danger` e `violetSoft`,
e o quinto nesta paleta de 14 colidiria com um deles. **As palavras do risco saem de
tabela**, e nunca de percentagem (um duelista não sabe *"60 %"*, sabe que costuma
dar). Nomeada **`PALAVRAS_DA_CHANCE`**, lida de `reacoes.js`:

**[A2] A tabela tem agora DUAS colunas** (curta para a janela, longa para a ficha) —
está acima, em *os preços contra a tabela*, com a razão medida. E **[A2]** o que
`chance` significa hoje em `reacoes.js` não é o que estas palavras dizem: também está
lá, e é pergunta para o `backend`.

Os três valores reais caem assim: Esquiva Ágil `0.6` e Contra-ataque `0.55` na
segunda linha, Ataque de Oportunidade `0.4` na terceira. **A direção da frase é
sempre a mesma** (o que acontece quando dá certo): misturar *"costuma dar certo"*
com *"às vezes falha"* dentro da mesma lista é enquadramento invertido, e
enquadramento invertido muda a decisão sem mudar o facto (**Tversky & Kahneman,
*Science* 1981**).

### O estado *"não vou reagir"* — não é ausência, e o conserto não é uma peça
**Toda janela de reação termina com uma linha no log, sempre** — também quando o
jogador recusou e também quando deixou expirar. `resolverReacao`
(`reacoes.js:104`) já escreve a linha de quem reagiu; **falta a linha do silêncio.**
Três frases, e são **exigência de K3**:

```
respondeu  ->  ⚔ REAÇÃO — Aparar: 4 de dano evitado (9 → 5) · −2 PM     (o de hoje)
recusou    ->  você deixou o golpe passar · 9 de dano
expirou    ->  você não teve tempo · o instinto aparou por você · 4 de dano evitado
```

É por isso que a nota *"não responder é uma resposta"* pôde sair da janela: **o
jogador aprende que ignorar é seguro por o ter VISTO acontecer, uma vez, em vez de o
ler todas as vezes, sob relógio.** E *"não vou reagir"* passa a deixar rasto igual ao
de quem reagiu — que é a definição de escolha.

*(E a regra de E1 fica, com uma correção: depois de N expiries seguidas o jogo para
de perguntar pelo resto da luta — **e diz-o uma vez, em linguagem de jogo**: «você
deixou passar três vezes; o instinto assume o resto da luta». Mudança de
comportamento sem aviso é o defeito que a lei da casa caça, mesmo quando a mudança é
simpática.)*

### A preferência — e não nasce peça nenhuma
Na ficha do herói, uma fila só:

> **Quando um golpe chega**
> `[✓ EU DECIDO]` `[EU DECIDO, SEM PRESSA]` `[APARAR SEMPRE]` `[DEIXAR PASSAR]`

Instâncias de **`A escolha` *Forma=Pílula*** (47 px). **Escolher um verbo É dizer
"nunca me pergunte"**, e *«eu decido»* é apenas a opção que vem marcada. E mora **na
ficha**, não num painel de ajustes: ali o jogador lê *"como o meu herói se defende"*,
que é ficção, e não *"configurar reações"*, que é mecanismo.

**[A2] A terceira opção é a que faltava, e foi o `jogo` que tinha razão.** Eu recusei
o `O interruptor` dele e mantenho a recusa — um interruptor **mais** um seletor são
dois mecanismos onde um chega, e o segundo teria de **se chamar alguma coisa**, que é
o sistema a falar de si mesmo. **Mas a recusa deixava órfã a linha `parado` de
`RITMOS_DA_REACAO`**: uma regra que ninguém consegue alcançar é export morto um andar
acima. *«eu decido, sem pressa»* é a mesma escolha da primeira pílula sem o relógio
por cima — a janela abre e **espera** —, e por isso está **ao lado dela** e não
noutro lugar. Na peça é `Tempo=Parado`; na tabela é o ritmo `parado`. **O lugar era
meu, o que faltava era dele.**

**[A2] A pílula do verbo traz o verbo DO HERÓI** — *Aparar* num marcial, *Escudo
Arcano* num conjurador, *Esquiva Ágil* num furtivo. Nunca é uma lista: `reacoesDe`
dá-lhe sempre exatamente **um** (é a mesma contagem da arbitragem A).

**E isto é a conformidade, não um mimo.** A **WCAG 2.2.1 (*Timing Adjustable*, nível
A)** exige que um limite de tempo se possa **ajustar, estender OU desligar** —
bastaria um, e **[A2] a fila cumpre os dois**:

- **Desliga:** *«sem pressa»* tira o relógio; *«aparar sempre»* / *«deixar passar»*
  desligam a pergunta inteira.
- **Estende:** a **escada do silêncio** do `jogo` dá 8 s à janela seguinte de quem
  deixou expirar duas vezes — sozinha, sem aviso e sem menu. **E ela fica**, porque
  é o que socorre quem nunca abre a ficha. **Não é um terceiro controlo porque não é
  controlo: ninguém lhe toca.**

**A preferência é a saída de conformidade da Fase K inteira**, e por isso não é
opcional.

### O teclado, e ele é obrigatório porque isto tem relógio
- Ao nascer, **o foco vai para o chamado** (gestão de foco na revelação, ARIA APG).
- Aberto o leque, as respostas são **`role="menu"` com UM ponto de tabulação**: setas
  andam linha a linha, Enter/Espaço respondem, Escape é *"deixar passar"*. É a mesma
  decisão de *tabindex* rotativo que E1 tomou para as 256 casas, e pela mesma razão.
- **O foco entra na PRIMEIRA reação, nunca no recuo**: quem carrega em Enter por
  reflexo não pode acabar a recusar sem querer.
- **`1`..`4` escolhem e `0` deixa passar**, com os números a acender nas linhas **só
  quando o último dispositivo foi o teclado** (o nó `o atalho` nasce invisível) —
  como um acelerador de menu só aparece com Alt. Sob relógio, o teclado deixa de ter
  viagem nenhuma.
- **Trava de 150 ms** nas linhas recém-reveladas, para o toque que abriu o leque não
  atravessar para a linha que nasceu debaixo do dedo.
- **O anel de foco não muda**: `box-shadow: 0 0 0 2px T.bg, 0 0 0 4px T.ink`
  (`ink`/`panel` = **14,37:1**). **Não é eixo de variante em `O chamado`**, e a razão
  é honesta: *o chamado está focado desde o instante em que existe*, logo uma
  variante *Foco* seria a única alguma vez usada. É forma transversal, em
  `:focus-visible`.

### O telefone — o recuo fica onde o chamado estava
O leque cresce **para cima** e a última linha (*deixar passar*) ocupa a posição que o
chamado ocupava. **A escolha segura fica debaixo do polegar; as que comprometem
exigem um alcance deliberado.** (No quadro de 375 de E1 a linha do veredito está a
y 598 — o chamado fica **192 px acima do fundo do ecrã**, dentro do arco natural do
polegar.) A trava de 150 ms é o que impede que isto se torne uma armadilha.

---

## As linhas para a tabela de movimento (`formas.md` ~2224)

| o que | quanto | curva | sob `prefers-reduced-motion` |
|---|---|---|---|
| o chamado entra | **120 ms**, `opacity` + `translateY(6px)` | `cubic-bezier(.2,.7,.3,1)` | aparece a seco, já no lugar |
| o trilho do chamado corre | o tempo da janela | **linear** | **vira `Tempo=Contagem`** |
| o leque abre (*Chamando* → *Escolhendo*) | **160 ms**, `opacity` + `transform` | `cubic-bezier(.2,.7,.3,1)` | troca a seco |
| `Pressa=Sobra` → `Pouco` | **90 ms**, só a tinta | `ease` | troca a seco |
| **[A2] o trilho desaparece ao primeiro toque** | **90 ms**, só `opacity` | `ease` | some a seco |
| **[A2] o verbo vira a linha resolvida** (`Etapa=Resolvida`) | **120 ms**, só `opacity` (cruzado) | `ease` | troca a seco |
| a janela sai (respondida **ou** expirada) | **140 ms**, só `opacity` | `ease` | some a seco |

**[A2] O desaparecimento do trilho é o sinal de que o relógio parou** — arbitragem D,
e não custa elemento nenhum. É por isso que `Escolhendo` e `Resolvida` só existem em
`Tempo=Parado`: o estado já está desenhado pela ausência.

Classes para K3: `tv-chamado-entra`, `tv-leque-abre`, **`tv-janela-tempo`** (já
batizada em E1), **[A2] `tv-trilho-sai`**, **[A2] `tv-resolve`** e `tv-janela-sai`.
**Nenhuma `infinite`.** A saída pousa no estado
final em todas — **`tv-janela-tempo` é a exceção que é lei**: ali a informação mora
dentro do movimento e `none` apagá-la-ia; a saída dela é **virar contagem**.
A tela não anima leiaute: só `opacity` e `transform`.

### E a exigência que `prefers-reduced-motion` carrega
**A janela sob `Tempo=Contagem` precisa de MAIS tempo que sob `Tempo=Barra`.** O
comprimento de um trilho lê-se pela **posição numa escala comum** — a variável visual
mais precisa (Cleveland & McGill, 1984); **um numeral exige fixação e comparação
simbólica.** *Quanto* mais é do `jogo`, porque depende do ritmo da rodada; **que não
seja menos é do `desenho`.** `prefers-reduced-motion` não pode virar desvantagem de
jogo.

---

## Contraste (medido, tudo de `T`)

`o golpe` **ink/panel = 14,37:1** · `o verbo` 14,37:1 · `o preço` **inkDim/panel =
6,21:1** · o trilho cheio **amber/panel = 8,45:1** · a contagem **amberSoft/panel =
11,64:1** · o cordão **danger/bg = 5,67:1** · o chamado **onAccent/amber = 8,49:1** e
**onAccent/danger = 5,34:1** (*o mesmo número que a casa já cita no único botão que
apaga alguém*) · o anel **ink/panel = 14,37:1** · **[A2]** o verbo armado e o seu
preço **onAccent/amber = 8,49:1** · **[A2]** a linha resolvida **ink/panel = 14,37:1**
e o glifo dela **amberSoft/panel = 11,64:1**.

**[A2] E aqui eu tinha escrito uma coisa falsa.** A 1.ª rodada terminava esta secção
com *«piso de 3:1 da WCAG 1.4.11 para elemento não textual: cumprido com folga em
todos»*. **Não é verdade, e agora está medido:** `line`/`panel` = **1,29:1** e
`panelSoft`/`panel` = **1,07:1**. O contorno de `Papel=Gesto` **não chega ao piso**, e
`Papel=Recuo` não tem contorno nenhum. O que é verdade é o que escrevi na descrição da
peça — *quem delimita o alvo é o enchimento* —, e isso só salva os controlos **cheios**.
Para os discretos, a casa não cumpre 1.4.11. **É o assunto da proposta ambiciosa**, e
foi este número que a fez mudar de alvo.

---

## [A2] A proposta ambiciosa — **a casa não sabe dizer "sou um controlo" sem gritar**

*(o par comparável está montado na folha `K1 · a prova`, `74:64`, secção
«a proposta — o controlo discreto». A variável é `lineStrong`, `VariableID:88:2`.)*

**Comecei por onde o `regente` apontou — a dívida que eu próprio nomeei:** *a casa não
tem forma para «controle discreto que ainda é claramente um controle», e eu remendei o
recuo com um override em vez de a resolver.* Fui medir para propor um remédio, e **a
medida matou o remédio e encontrou a doença.**

**O defeito não é do recuo. É da paleta.**

| | hex | contra `panel` |
|---|---|---|
| `bg` | `#0e0c15` | 1,07:1 |
| `panel` | `#171322` | — |
| `panelSoft` | `#1e1930` | **1,07:1** |
| `line` | `#2e2745` | **1,29:1** |

**As quatro superfícies da casa cabem dentro de 1,3:1 umas das outras.** Para a **WCAG
1.4.11** (piso 3:1 para elemento não textual) **são uma superfície só.** A minha
primeira ideia era pôr `panelSoft` por baixo do controlo discreto — e `panelSoft` é
**pior** que a hairline que eu queria substituir. Não há terceiro tom porque **não há
segundo**: a única coisa na casa que diz *"sou um controlo"* acima do piso é encher-se
de `amber` (**8,45:1**). **Ou grita, ou desaparece.** Foi por isso que eu remendei em
vez de resolver: não havia com que resolver.

**A proposta é um token, não uma peça.** `lineStrong` = **`#70688C`** — o degrau **mais
baixo** que passa 3:1 contra as três superfícies em que um controlo pode pousar:

> `panel` **3,51:1** · `bg` **3,74:1** · `panelSoft` **3,27:1**

Quero a fronteira **mais discreta que ainda é fronteira**, não a mais forte: testei
cinco degraus e os quatro abaixo deste (`#585271` a `#6A6285`) falham contra pelo menos
uma superfície — `#645D7D` chega a **2,95:1** contra `panel` e é por isso que **não** é
o escolhido.

**O que paga, e é um remendo REMOVIDO:**

1. O contorno de `Papel=Gesto` deixa de ser decoração (1,29:1) e passa a ser fronteira.
2. `Papel=Recuo` ganha-o e **o override de composição desaparece** — o `ink` que eu
   lhe subi à falta de melhor deixa de ser preciso.
3. A casa passa a ter **três degraus de voz** (cheio · contornado · contornado-e-mudo)
   em vez de dois e um buraco.
4. **Reversível por construção:** uma linha em `T`, um commit desfeito. É o teste de
   reversibilidade que a pessoa pôs.

**O risco, dito por mim, e é real.** Cinco linhas contornadas a 3,5:1 podem ler-se como
**grelha** em vez de lista — no par comparável são duas e está bem; no teto são cinco e
**não joguei isso, desenhei-o**. E o token só rende onde `ui.jsx` é usado, que hoje são
**6,8 %** dos controlos (16 `<Botao>` contra 218 `<button>` crus): fora daí a paleta
continua sem terceiro tom, e a proposta é uma promessa em vez de um conserto.

**Vai à pessoa** porque mexer na paleta é **identidade**, e identidade é dela. É
`pesado`, e não o rebaixo para caber no automático.

---

## [A2] A proposta da 1.ª rodada — hoje é **decisão**, não proposta

> A arbitragem A adotou-a: `Forma=Verbo` é **o padrão do caso comum**, e o que ela
> propunha está construído (`Etapa=Direta`). Fica aqui o argumento, porque a contagem
> continua a ser a prova, e porque a segunda metade dele — *"por que isto vai à
> pessoa"* — foi exatamente o que o `regente` recusou, com razão: **entregar a forma
> tímida sabendo a contagem era a timidez que a pessoa proibiu.**

### **Quando só há uma reação, o chamado É a reação — e o leque não existe.**

**O que o jogador vive hoje, e o que viveria.** A forma ditada é *botão → opções*:
dois toques. Contando o que reagir custa mesmo: o tempo de escolha entre *n*
alternativas cresce com `log₂(n+1)` (**Hick 1952**; **Hyman, *JEP* 1953**), o segundo
toque custa o seu próprio tempo motor (**Fitts 1954**), e antes dos dois há a
leitura, que é o que realmente pesa. **A proposta:** quando existe **exatamente uma**
reação aplicável, o chamado nasce já como ela — `⚔ APARAR · sem PM · corta metade` —
e um toque resolve. É a variante **`Forma=Verbo`**, já fabricada e à espera.

**A prova, e é contagem, não opinião.** Em `reacoes.js`, para o gatilho
`sofre_dano`, `reacoesDe()` filtra por perfil de combate:

| perfil | classes | reações de `sofre_dano` |
|---|---|---|
| marcial | 4 | **1** — Aparar |
| misto | 2 | **1** — Aparar |
| furtivo | 1 | **1** — Esquiva Ágil |
| conjurador | 5 | **1** — Escudo Arcano |

**As doze classes do jogo, sem exceção nenhuma, têm exatamente UMA reação de
`sofre_dano` pelo perfil.** A segunda só existe com **Contramágica escrita na
ficha** — e `contramagia` tem `exigeTipo: []`, logo **nunca entra pelo perfil**.
Ou seja: **o leque que o primeiro toque abre é, por omissão, uma lista de um item
para 12 classes em 12.** O jogador gasta um toque e cerca de um segundo de uma
janela de segundos **para revelar uma opção que já era a única**. A segunda prova é
do `jogo`, e está no diário: numa luta inteira ele tocou **três** controles.

**O que isto muda de verdade:** a reação deixa de ser um mini-menu e passa a ser um
**reflexo** — que é o que ela é na ficção e o que ela é no 5e e no BG3, a citação que
o próprio cabeçalho de `reacoes.js` faz. E não custa nada a quem tem duas:
`Forma=Chamada` continua lá, intacta, para esses.

**Por que isto vai à pessoa em vez de eu o fazer:** porque é **mudar o fluxo que ela
ditou** — *"se o player apertar, aparecem as opções"* —, e fluxo é dela. A peça
carrega as duas formas **exatamente para que a decisão não precise de mais nenhum
desenho**: é trocar o valor padrão de um eixo.

---

## O que ficou feio, o que não coube, e o que não soube

**Feio, e assumo:**

- **`IconeEsquiva` levou três formas.** A primeira lia-se como `IconeSeta`; a segunda,
  como `IconeEscudo` — que está na **linha de cima da mesma lista**. A terceira serve,
  mas é o glifo mais fraco dos catorze. Um desenhista com mão de ilustração faria
  melhor à primeira.
- **O recuo sem borda parece texto, não controle** — e eu aceitei-o em vez de o
  resolver. Subi-lhe o verbo a `ink` (override declarado na composição) e pronto.
  A verdade é que a casa não tem forma para *"controle discreto que ainda é
  claramente um controle"*, e esta etapa não era o lugar para a inventar.
  **[A2] Continua por consertar, mas já não é um encolher de ombros:** a proposta
  ambiciosa desta rodada é exatamente isto, medido, com par comparável e com um valor
  proposto. **O remendo só sai se a pessoa disser que sim.**

**[A2] Feio, e é novo desta rodada:**

- **Escrevi na 1.ª rodada que o piso de 1.4.11 estava «cumprido com folga em todos», e
  não estava.** Bastava medir `line`/`panel` para o saber, e eu não medi — declarei.
  É o mesmo tipo de erro que os preços: uma afirmação confortável que ninguém tinha
  conferido. **Foi o `jogo` a obrigar-me a conferir os preços que me levou a conferir
  isto também.**
- **`Forma=Verbo` saiu da 1.ª rodada quebrado para 5 das 12 classes**, e eu mostrei-o
  como proposta ambiciosa. O verbo e o preço numa linha só não aguentam a frase mais
  longa da tabela: *"ESCUDO ARCANO"* esmagava-se a 34 px e quebrava em três linhas de
  três letras. **Propus como padrão uma coisa que eu nunca tinha enchido com o pior
  caso da tabela.** Está consertado (o preço desceu para baixo do verbo), mas a lição
  é que *fabricar a variante* e *provar a variante* não são o mesmo trabalho.
- **Duas vezes reescrevi o nó errado**, e pela mesma causa: filtrei uma lista de nós,
  e depois reli `node.characters` / `node.name` **dentro** do laço, já mutados por
  instâncias aninhadas que herdaram a correção a meio. Apanhei as duas na verificação
  seguinte e corrigi-as, mas se eu tivesse confiado no *"pronto"* do primeiro script
  teria deixado *"sem PM · anula · mais vezes que não"* debaixo de **Escudo Arcano**
  em quatro folhas. **Captar o valor antes de mutar; nunca reler o que se acabou de
  escrever.**
- **`Forma=Verbo` e `Papel=Armado` ficaram quase a mesma peça** — o que as separa é só
  o trilho. Fiz as duas nesta rodada e só vi a sobreposição depois de as ter. Está
  dita na descrição de `O chamado`, com a condição para as fundir: se K3 fizer do
  trilho uma propriedade, uma absorve a outra.
- **`get_screenshot` mentiu-me outra vez**, e desta vez percebi porquê: o `COMPONENT_SET`
  não cresce sozinho quando se lhe acrescenta uma variante, e o que estava fora dos
  limites **renderizava como uma tira de 8 px** sem nenhum aviso. Duas vezes julguei
  ter partido a peça quando a árvore dizia `344x48`. **A árvore tinha razão as duas
  vezes** — é literalmente a lei da casa, e eu hesitei nas duas.
- **`A escolha` *Forma=Pílula* saiu 47 e não 45**, e a variante *Foco* tem a caixa
  exterior 4 px maior do que a aritmética diz. A pílula lá dentro mede os mesmos 47
  em todos os quatro estados, que é o que é alvo de toque — mas o número não fecha,
  e fica dito em vez de arredondado.

**Não coube:**

- **`Consequencia` não ganhou tom nenhum**, e isso é recusa com motivo escrito (o
  risco é preço) — mas deixa `A Consequência` sem canal para *"isto pode não
  funcionar"* fora desta peça. No dia em que os verbos da barra de batalha quiserem
  dizer a mesma coisa, a discussão volta.
- **O eixo de LARGURA do `Botao`** continua aberto, como E1 o deixou. `O verbo com
  preço` contorna-o por ser peça própria, e portanto **não paga a dívida, só deixa
  de a sentir.**
- **`Estado=Esperando`** não existe em `O verbo com preço`. Uma reação escolhida
  resolve na hora e não espera o Mestre — mas se K3 descobrir que espera, falta a
  variante.

**Não soube:**

- **Quanto tempo dura a janela.** É do `jogo` e depende do ritmo da rodada. O que eu
  sei dizer é **a relação**: *Contagem* ≥ *Barra*, e a razão está escrita acima.
- ~~**Se `Forma=Verbo` deve ser o padrão.**~~ **[A2] Decidido pela arbitragem A: é.**
- **Se o leque no telefone tapa demasiado tabuleiro.** No teto são **[A2] 321** px de
  812 (o trilho saiu), e a janela vive 4 segundos. Suspeito que está bem; **não medi
  com o campo por baixo**, e isso é composição de tela, que é do `jogo`.
- **[A2] Se cinco linhas contornadas se leem como grelha.** É o risco da proposta
  ambiciosa e não tem resposta de desenho — tem resposta de jogo. Só K4 a dá.
- **[A2] O que `chance` vai significar quando o jogador escolhe à mão.** É do
  `backend`; as palavras do risco dependem da resposta.
- **`get_screenshot` já serviu cache a esta mesa** (E1). **[A2] Nesta rodada apanhei
  a causa de duas delas — o `COMPONENT_SET` que não cresce** — e passei a conferir
  por `await node.screenshot()` dentro do próprio script, que lê o estado vivo. Mesmo
  assim: conferi tudo a olho, imagem a imagem, e **não tenho como provar que nenhuma
  era velha.** O que passou a valer é que **nenhuma correção desta rodada nasceu de
  uma imagem** — todas nasceram de leitura de nós.

---

## [A2] Para o diário: o número e o nó

**O número final é `344`.** O nó é o conjunto **`31:518`** (`A pergunta que expira`),
na página `A pergunta que expira` (**`31:242`**), arquivo `e5wJUzInAssoebx5npssKc`.
Conferido variante a variante: **as oito medem 344**. O diário de E1 estava certo no
número e a peça é que estava errada — media 320 —, e foi a peça que se corrigiu, não
o diário. **Nada há a emendar no diário quanto ao 344**; o que lá falta é a data em
que passou a ser verdade, que é 15/09.

## [A2] Inventário dos nós tocados nesta rodada

| nó | o quê |
|---|---|
| `31:518` | a peça: 4 → **8** variantes, matriz `Etapa`×`Tempo` refeita |
| `84:3009` · `84:3032` · `84:3054` | `Etapa=Direta` (Barra · Contagem · Parado) — **novos** |
| `84:3194` | `Etapa=Resolvida, Tempo=Parado` — **novo** |
| `84:3077` · `84:3100` | `Etapa=Chamando` (Contagem · Parado) — refeitos com o recuo |
| `31:386` | `Etapa=Chamando, Tempo=Barra` — ganhou o recuo (56 → 118) |
| `31:419` | `Etapa=Escolhendo` — trilho removido, 1.º verbo armado, `Tempo=Parado` |
| *(apagados)* `31:403`, `31:469` | as duas variantes que a arbitragem D diz que não devem existir |
| `82:2586` · `82:2593` | `O verbo com preço` · **`Papel=Armado`** — novos |
| `83:14` · `83:24` | `O chamado` · **`Tempo=Parado`** — novos |
| `62:2409`…`83:24` (5 variantes) | `Forma=Verbo` — palavras empilhadas, Spectral para a reação |
| `VariableID:88:2` | **`lineStrong`** — a proposta, à espera da pessoa |
| `74:64` | `K1 · a prova` — duas secções novas: *os preços contra a tabela* e *a proposta* |
| `76:226` | a fila da ficha: 3 → **4** pílulas |
| 18 nós de texto | os cinco preços errados, corrigidos contra `reacoes.js` |

**[A3] Os dois consertos depois de o `jogo` recompor:**

| nó | o quê |
|---|---|
| `62:2453` (as **10** variantes) | `o tempo que resta` → **FILL**; `quanto sobra` → proporção |
| `93:17`, `93:2908` + 8 irmãos | **`quanto passou`** — o irmão novo que faz do cheio uma proporção (62/38 · 17/83) |
| `93:3098` | **`o lugar do glifo`** — a coluna fixa de 22 px em `Etapa=Resolvida` |
| `84:3209` | `o glifo` da resolução — passou a **nó que se esconde** |
| `93:3114` | `K1 · a prova` → secção **as três resoluções** (respondeu · expirou · recusou) |

**Não toquei no `lineStrong`** (`VariableID:88:2`): a proposta vai à pessoa como está.
O emoji dentro de `resolverReacao` (`reacoes.js:115`) é de código e é do `regente`.
