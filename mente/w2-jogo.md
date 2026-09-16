# W2 · o texto ganha um segundo emprego — e a quota devolvida é 1, não muitas

**Do `jogo`, 16/09, sobre o `App.jsx` da v9.263.** O `desenho` compõe a forma do
campo em paralelo e não nos vemos; tudo o que aqui toca a **peça** está escrito
como pedido a ele.

**O título honesto desta etapa, e ele contraria a pauta:**

> **Uma rodada de combate custa hoje EXATAMENTE UMA chamada ao Mestre, e custará
> exatamente uma depois de W2. O ganho no caso comum é ZERO.**
>
> A promessa da pauta — *"o Mestre narra o resultado uma vez por rodada, em vez
> de interpretar cada golpe"* — **descreve o jogo que já existe desde a v9.13**,
> quando `agir` passou a encerrar o turno — e desde então ninguém a reconferiu
> contra o código.
>
> **O ganho verdadeiro é outro, é menor, e é real:** −1 chamada **na rodada em
> que o jogador fala**, e a devolução do **turno inteiro** que falar custa hoje.

**Nenhuma linha de produção foi escrita.** O que tem número aqui saiu de correr
o código de hoje em Node ou de o ler linha a linha, com a linha citada.

---

## 1 · A conta da quota, honesta, em número

### 1.1 · O que fecha a rodada — quatro portas, mutuamente exclusivas, uma chamada

`fecharMeuTurno` (`App.jsx:14302`) tem **quatro chamadores no arquivo inteiro**,
e **cada um deles termina em exactamente um `enviar`**:

| porta | o `enviar` | o que resolve |
|---|---|---|
| `aplicarGolpeDoJogador` | **`App.jsx:11932`** | o golpe (botão **e** frase, pela mesma porta desde X2) |
| `trabalhoDoTurno`, o laço do painel `✦` | **`:13454`** | **N habilidades numa chamada só** |
| a habilidade citada por texto | **`:13544`** | uma magia nomeada na frase |
| a cascata genérica de `agir` | **`:13595`** | tudo o mais que o jogador escreve |

E `resolverRevide` → `:14289` repõe `economiaNova` e faz `rodada + 1`. Logo:

> **A rodada não pode conter duas dessas quatro. A primeira que resolve fecha o
> turno, o inimigo revida e a rodada vira. Uma rodada = uma chamada.**

**Corolário que ninguém tinha escrito, e que é um defeito de prompt:**
`economiaNova` (`:4867`) dá `{ acao, extra }`, mas **o `extra` é inalcançável no
caminho normal** — `aplicarGolpeDoJogador` só decrementa `acao` (`:11881`) e
fecha o turno na linha seguinte; o painel `✦` só toca `extra` quando `acao <= 0`
(`:13371`), e `acao` nunca chega a zero dentro de uma rodada. **A ação bônus é
um campo vivo sem uso vivo em combate.** E o prompt promete o contrário ao
Narrador, com uma etiqueta que **nada no `src/` emite**:

```
prompt.js:576 — "a cada rodada o jogador tem 2 movimentos (ação + ação extra).
O HUD mostra o que resta e o sistema avisa '[TURNO AINDA MEU]' ou 'nova rodada'."
```

`grep -rn "TURNO AINDA MEU" src/` devolve **uma linha, e é a do próprio prompt**.
São **208 caracteres** de bloco estático a ensinar o Narrador uma economia que o
motor não tem. *Isso não é W2 — é item de pauta, e vai no §6.*

### 1.2 · O que NÃO custa chamada nenhuma hoje — três, e o terceiro é o molde de W2

| caminho | linha | custo |
|---|---|---|
| a recusa por alcance (`📏`) | `:11871` — `return true` **antes** do `enviar` | **0 chamadas** |
| "já usou sua ação nesta rodada" | `:11878` | **0 chamadas** |
| **a poção** — `usarConsumivelUI` | `:19548`, e **não há `enviar` no corpo** | **0 chamadas** |

A poção é o precedente inteiro de W2, e está escrito em português no arquivo
(`:19580-19585`):

> *"ABRIR A BOLSA NÃO É O TURNO. (…) O sistema aplica o efeito na hora, **sem
> chamar o Mestre**; a narração vai junto do turno, **pelo envelope**."*

**Resolve por código, escreve a linha, e a prosa viaja colada à próxima chamada
de verdade.** É exactamente o que a fala tem de fazer. **Não é ideia minha: é a
v9.13, está em produção, e já passou pela mesa uma vez.**

### 1.3 · O que custa chamada e NÃO vira a rodada — o vazamento verdadeiro

Estes disparam `enviar`, **não chamam `fecharMeuTurno`, e não gastam a economia**.
São **por evento, não por rodada, e não têm teto**:

| linha | função | o que é |
|---|---|---|
| `:16174` | `declararAcaoRapida` | o botão de ação rápida sem obstáculo reconhecido |
| `:15944` · `:15974` · `:15991` | `adjudicarAcao` | concessão · sem oportunidade · veredicto |
| `:15229` · `:15510` · `:15514` | `concluirRolagem` | o resultado do dado |
| `:16233` · `:16373` | resolução automática | o teste que o bônus decide sozinho |
| `:13029` · `:13041` · `:13102` · `:13124` | magia utilitária | identificar · cura de grupo · limpeza · localizar |
| `:16057` | `acionarReliquia` | o ativo do item |

E `cobrarTempoDoDesafio` (`:16283`) já se cala em combate
(`if (… || combateRef.current) return`), logo isto **não move o relógio** — só
queima chamada.

### 1.4 · A conta, em número

| rodada de combate | hoje | depois de W2 | Δ |
|---|---|---|---|
| **caso comum** — anda e/ou golpeia | **1** | **1** | **0** |
| rodada de recusa por alcance (10/10 plantas no turno 1, W1) | **0** | **0** | 0 |
| rodada em que o jogador **fala pela caixa** (`:13595`) | **1**, *e perde o turno* | **1**, *e não perde o turno* | **0 chamadas, +1 turno** |
| rodada em que ele fala **e** age | **2** (a fala fechou a rodada; agir é a rodada seguinte) | **1** | **−1** |
| rodada em que ele toca `Intimidar` **e** golpeia | **2** (`:15991`/`:15514` + `:11932`) | **1** | **−1** |
| **pior caso medido** — `Lembrar` + `Intimidar` + `Convencer` + golpe | **4** | **1** | **−3** |
| pior caso teórico | **1 + N**, e **N não tem teto** | **1** | **−N** |

> ### O número do título: **W2 devolve 1 chamada por rodada em que o jogador fala, e zero nas outras.** Numa luta de 5 rodadas de acção em que ele fale uma vez, hoje a fala acrescenta uma sexta rodada: **6 → 5 chamadas, −17%**. Numa luta em que ele nunca fale: **0%**.

**E a razão pela qual esse número é pequeno é a coisa mais interessante desta
etapa:** hoje a taxa de falas observada é ≈ 0, porque **falar custa a rodada
inteira** — `:13595` fecha o turno e o inimigo revida. **O ganho de W2 não é uma
chamada poupada: é um comportamento que hoje o preço proíbe.** Dizer que W2 vale
−17% seria contar um ganho que depende de o jogador fazer o que hoje ele não
faz. **O que W2 vale, medido e sem mentir: −1 chamada e −1 rodada perdida, por
fala, sobre uma base que hoje é zero.** Dizer −17% sem dizer isto seria a conta
a mentir a favor.

### 1.5 · Onde o ganho grande está de verdade — e não é a caixa

Fui procurar, como me foi pedido, e são três, em ordem de tamanho:

1. **Fora de combate os ~18 toques continuam** (`:20885`: fora da luta
   `Atacar` só faz `setEntrada(a.texto)`), e ali **cada frase é uma chamada, sem
   excepção, porque fora da luta não há motor que resolva.** É o maior bolsão de
   quota do jogo e **W2 não lhe toca** — nem deve: fora do combate a prosa **é** o
   conteúdo, e a pessoa já decidiu que ali trava.
2. **A reação da Fase K.** Hoje ela viaja de graça dentro de `resolverRevide`
   (`:7657-7666`), dentro da mesma chamada. Dar controle ao jogador **sem** lhe
   dar uma porta que feche o turno custaria +1 chamada por rodada — **o dobro do
   custo actual do combate**. *Isto é um aviso a K, não um item de W2:* a reação
   tem de nascer **dentro do envelope**, pelo molde da poção, ou a Fase K é a
   fase que dobra a conta.
3. **O que cada chamada carrega.** A parte fixa do envelope do golpe
   (`:11932`) mede **277 caracteres**, pagos **toda rodada de toda luta**. Não é
   gordura — é a lei *"não recalcule"*, e vale o que custa. Mas é a moeda em que
   W2 tem de ser medido: **W2 não tira uma chamada; W2 faz a mesma chamada
   carregar a fala do jogador de graça**, exactamente como `notaRef` já carrega a
   poção, a aflição da arma (`:11903`) e o ritual (`:13360`).

---

## 2 · O que fica sem frase nenhuma — a resposta é *nada*, e o preço de W2 é zero

Cruzei os 14 eventos de X3b (`pauta.md:544-559`) com o que o código **escreve
sozinho**, linha a linha.

| # | evento | quem escreve a linha, hoje | sobrevive ao Mestre calado? |
|---|---|---|---|
| 1 | golpe que acerta | `App.jsx:11914` — `⚔ … 9 de dano · Bandido 11/20` | **sim** (telegrama) |
| 2 | golpe que erra | `:11914` — `errou` | **sim** (uma palavra) |
| 3 | crítico | `:11914` — prefixo `CRÍTICO!` | **sim** (um prefixo) |
| 4 | guarda erguida | `habilidades.js:356` via `App.jsx:7861` | **sim** (frase de mesa) |
| 5 | efeito que nasce | `App.jsx:7978` | **sim** (telegrama) |
| 6 | efeito que vence | `regras-jogo.js:374` | **sim** (frase de mesa) |
| 7 | condição aplicada | `aflicoes.js:145` | **sim** (meio rótulo, meio conta) |
| 8 | salvaguarda | passa: `condicoes.js:541` · **falha: nada** | **METADE** |
| 9 | queda | herói: `:8203` `:8204` `:8206` `:8213` · **companheiro: nada** (`:13967`) | **METADE** |
| 10 | morte | herói sim · inimigo: `☠` em `:11914` e `regras-jogo.js:405` | **sim** (glifo + frase) |
| 11 | cura | `App.jsx:14144` | **sim** (telegrama) |
| 12 | chegada de inimigo | `regras-jogo.js:393` — `⚔ Ogro entra no combate! (34 PV)` | **sim** (frase) |
| 13 | reviravolta | `masmorras.js:724` — **mas `virarChefeSePreciso` (`:17932`) só é chamada de `resolverHabilidadeOfensiva` (`:12023`, `:12354`)** | **NÃO, para quem luta de arma** |
| 14 | fim de luta | `App.jsx:13744` | **sim** (frase) |

### Os números, e são três

> **11 dos 14 têm linha de código e sobrevivem inteiros ao silêncio.**
> **2 dos 14 sobrevivem pela metade** (a salvaguarda que falha; a queda do
> companheiro).
> **1 dos 14 não dispara para metade das fichas** (a reviravolta de chefe).
>
> ### **E o número que responde à pergunta do enunciado: os que "só tinham a IA" e passariam a esperar o fim da rodada são ZERO.**

**Porque a IA nunca foi a voz única de nenhum dos 14 — foi a SEGUNDA voz de 11
deles.** Narrar uma vez por rodada não emudece evento nenhum, porque nenhum
evento depende dela para existir na tela. **O preço de W2, em eventos mudos
novos: zero.**

### Os três bolsões mudos são herança, não preço

E eu insisto que a mesa os leia como o que são: **os três já são mudos hoje, com
o Mestre a falar, e nenhum deles é falta de prosa — os três são código que
existe e não chega.**

1. **A salvaguarda que FALHA.** `condicoes.js:576` **já calcula** `linhasTecnicas`
   com a rolagem inteira, e **ninguém as consome** — o App empurra só
   `saida.linhas`. Roda **todo turno, em três portadores** (`:8414` herói, `:8488`
   grupo, `:8528` inimigo). *É o evento mais frequente do combate depois do
   golpe, e é o único que já tem a frase escrita e não a mostra.*
2. **A queda e a morte do companheiro.** `:13967` baixa o PV com `Math.max(0, …)`
   e **não empurra linha nem nota**. O herói que cai tem quatro frases; o aliado
   ao lado dele cai sem ninguém dizer.
3. **A reviravolta de chefe.** Quem luta de espada leva o chefe de 100% a 0%
   **sem nunca ver a virada.**

**Nenhum dos três é aceitável, e nenhum dos três é meu.** Os três já estão em
"Aberto" na `mente/pauta.md` (`:2421`, `:2428`, `:2436`), postos lá por X3b, e
**nenhum deles pede prosa nova** — pedem um chamador. *Não os reescrevo aqui e
não os inflo: repetir um item de pauta com outras palavras é como uma etapa
finge ter achado o que a etapa anterior já achou.*

**O único evento que W2 realmente muda de lugar** é o desfecho do **teste
social** (`Intimidar`, `Convencer`): hoje ele ganha um parágrafo próprio do
Mestre (`:15991` ou `:15514`); depois de W2 vira uma frase dentro das 2-4 frases
da rodada. **E ele sobrevive**, porque `falaDoVeredicto(v)` já é empurrada por
código em `:15989`, e o `🎲` da rolagem em `:15277`. **Um evento muda de
parágrafo para frase; zero eventos ficam sem palavra.**

---

## 3 · As três decisões

### 3.1 · Quem escreve *"Ataco o ogro"* na caixa depois de W2

> ### Acontece **exactamente o que acontece hoje: o golpe sai, resolvido pelo motor, pela mesma porta do botão, pela mesma chamada.** Nada é recusado, nada é traduzido, nada é explicado.

**Não é uma decisão difícil — é uma decisão que o código já tomou e que W2 só
não pode desfazer.** `aplicarGolpeDoJogador` é chamada de **dois sítios**:
`declararGolpe` (`:11992`, o botão) e a cascata de `agir` (`:13555`, o teclado),
e o comentário em `:13549-13553` diz por escrito que isso é lei:

> *"o golpe DIGITADO e o golpe do BOTÃO passam pela mesma porta. Tudo o que
> morava aqui (…) está em `aplicarGolpeDoJogador`, **byte por byte**."*

**E a casa já pagou três vezes por quebrar essa lei, com o mesmo bug.** Está
escrito em `:16070`, sobre a poção:

> *"O mesmo bug de sempre — **uma regra morando num só de dois caminhos** —,
> aqui na forma mais cara que ele tem: o painel obedecia à economia e o teclado
> dava o efeito de graça."*

E em `:13493`, sobre a conjuração em Forma Animal: *"é o mesmo furo que a
invocação me ensinou, **na terceira vez**: toda regra de habilidade tem DOIS
chamadores."*

**As duas alternativas que o enunciado põe estão as duas erradas, e pelo mesmo
motivo:**

- **Recusar é parede** — e uma parede que recusa o que o motor sabe resolver é
  pior que parede: é o motor a fingir que não entende.
- **Traduzir em silêncio é o sistema a falar de si mesmo ao contrário** — e há
  precedente do estrago exacto: `declararGolpe:11988` troca de alvo em silêncio
  quando o escolhido não alcança, e W1 §0.1 nomeou isso como defeito de veredito.

**A terceira via é não haver terceira via.** A caixa não muda de emprego: **ganha
um segundo.** Escrever *"Ataco o ogro"* continua a atacar o ogro; escrever *"você
não passa daqui"* passa a ser fala. **Quem decide qual dos dois é o motor, com o
detector que já existe** (`resolverAtaqueJogador`), e o jogador nunca lê o nome
do mecanismo.

**E digo a consequência que isto tem sobre o nome da etapa:** *"o texto muda de
emprego"* é a frase errada, e mudá-la é a minha correcção mais dura à pauta. O
texto **não pode** deixar de perguntar *"o que você faz?"*, porque fora de
combate é essa a única pergunta que existe, e dentro de combate é a porta de
onze verbos que não têm botão. **W2 é o texto a ganhar um segundo emprego, e
nenhuma etapa que lhe tire o primeiro passa na mesa.**

### 3.2 · A fala custa turno? — **Não. Zero ações, uma por rodada, zero chamadas.**

**O que custa hoje, medido:**

| canal | ação | rodada | chamada | outros preços |
|---|---|---|---|---|
| a frase pela caixa (`:13595`) | — | **a rodada inteira** | **1** | o revide do inimigo |
| `Intimidar` / `Convencer` (`:16174` → `:15991`) | **0** | **0** | **1** | **+3 de dificuldade** (`desafios.js:1022`) |

*(O relógio já não é cobrado: `cobrarTempoDoDesafio:16284` cala-se em combate. E
os `minutos: 5` de `intimidar` e `minutos: 10` de `convencer`
(`desafios.js:388`, `:344`) já não movem nada dentro da luta.)*

> ### A decisão: **a fala é gesto, não turno.** Zero ações, **uma por rodada**, e viaja no envelope da rodada por `notaRef` — **zero chamadas próprias.**

**O molde é a poção, byte por byte** (`:19580`): resolve na hora, escreve a linha
por `pushMsgs`, e a prosa vai colada à próxima chamada de verdade.

**O "uma por rodada" não é um limite inventado: é o formato do canal.** O
envelope é escrito uma vez, quando a rodada fecha. Duas falas na mesma rodada
seriam duas notas no mesmo envelope, e o Narrador leria duas ordens sobre o mesmo
instante — que é o defeito que `beberDaBolsa` já nomeia em `:16085` (*"escrever um
segundo faria o Mestre ler duas ordens sobre a mesma poção"*).

**O que impede o abuso são três freios, e dois já estão no código:**

1. **O livro de tentativas.** `chaveDaTentativa(lugar, alvo)`
   (`desafios.js:710`) é `lugar|alvo`, e `intimidar` tem `alvo: "intimidacao"`.
   **A segunda ameaça no mesmo lugar ouve *"você já tentou isso aqui"* — de
   graça, sem chamada.** A provocação é um recurso de uma vez por luta, não um
   botão por rodada. *(Não confirmei se `lugar` é estável durante uma luta
   inteira; é a única suposição deste parágrafo e está aqui para não passar por
   medida.)*
2. **O +3 de dificuldade em combate** (`desafios.js:1022`), porque `intimidar`
   não declara `valeEmCombate` — só `fraqueza` o declara (`:288`). *A fala no
   meio da luta já é mais difícil do que a fala na taverna, e isso está certo.*
3. **Uma por rodada**, pela razão do envelope, acima.

**E a referência, porque me foi pedido olhar o que um D&D-like faz:** no 5e a
fala é ação livre — mas *"a few sentences"* por turno, não um discurso (PHB,
"Other Activity on Your Turn"); em Baldur's Gate 3 as barks de combate são
gratuitas e não gastam nada. **Zero ações e uma por rodada é exactamente o
consenso da referência**, e é a única das três decisões em que eu não estou a
propor nada novo.

### 3.3 · Como o campo convida sem exigir

> *"Um campo que pede fala e fica vazio a luta inteira é pior que campo nenhum."*

**A frase é da pessoa e eu aceito-a como catraca.** E a primeira resposta é a que
o §3.1 já deu: **o campo nunca fica só a pedir fala.** Ele mantém o primeiro
emprego (a frase que age, os onze verbos sem botão) e mantém o terceiro que já
tem hoje e que ninguém nomeou — **ser o argumento de um botão**:

```jsx
App.jsx:20927-20931
{ACOES_RAPIDAS.map((a) => (
  <button onClick={() => { const m = entrada.trim(); setEntrada("");
    setAcoesAbertas(false); declararAcaoRapida(a.id, m); }} …
```

**e o rótulo em cima já o diz** (`:20924`): *"O que você faz — **usa o que você
escreveu como alvo**"*. **Um campo com três empregos não fica vazio: fica vazio
naquele em que não foi usado, que é o que qualquer campo faz.** A catraca da
pessoa é sobre um campo de emprego único, e W2 não deve criar um.

**Agora o momento e o gatilho, que é o que me foi pedido:**

> ### O momento é **a rodada em que o motor já recusou o golpe.** O gatilho é **a fala ser a única coisa que alcança a essa distância.**

Os números, e são todos de fora desta etapa:

- **10 de 10 plantas recusam o corpo a corpo no turno 1** (X1, confirmado por
  W1 §1); abertura média **19,95 m**; **1,4 rodadas por luta são pura caminhada**.
- **X4 mediu essa rodada por dentro:** `taxa_esteril` **7/7**, `taxa_muda`
  **0/7**, `taxa_sem_narracao` **7/7**, **0 chamadas ao Narrador**.
- **E ela é de graça:** `:11871` devolve `true` **antes** do `enviar`.

**É a rodada em que o jogador não tem nada para fazer, nada para ler e nada a
perder** — a ação já está inutilizável pela distância, a rodada já não custa
chamada, e a linha do veredito já está debaixo do olho dele a dizer *"longe
demais"*. **Nenhum outro momento do combate tem as três coisas ao mesmo tempo.**

**E o gatilho de jogo — a consequência mecânica que ele vê na mesma rodada:**
a 19,95 m **a voz alcança e a espada não**. Falar ali não é sabor: é o único
verbo com alcance. O motor já tem as três peças e nunca as ligou:

| a peça | onde | o que falta |
|---|---|---|
| o teste | `desafios.js:385` — `intimidar`, perícia `intimidacao`, `social: true` | nada |
| a condição | `condicoes.js:139` `amedrontado` · `:447` salva `presenca`, cd 12 | nada — tem **7 leitores** (afixos, classes, poções, presença divina) |
| a aplicação | `presenca-divina.js:154` já aplica `amedrontado` 3 turnos a inimigo, com linha escrita (`:159`) | nada |

**O que falta é uma coisa só, e é a que faz a fala virar jogo:**

> **`garantirLuta` (`adversario.js:211-260`) tem trinta e tal campos — `rodada`,
> `minhaVida`, `heroiFamoso`, `saidas`, `escuro`, `temRefem` — e NENHUM deles é
> "o que o herói disse".** As quebras de intenção lêem `minhaVida < 0.4`,
> `protegidoQuebrou`, `rodada > 3` (`:323`, `:335`, `:475`). **O adversário deste
> jogo não tem como ouvir.**

**Enquanto ele não ouvir, falar em combate é decoração — e decoração é
exactamente o campo vazio que a pessoa proibiu.** É o §5.

---

## 4 · Os três defeitos vivos de W1 — o que cabe em W2

### 4.1 · `recusaDoGolpe` / `linhaDoGolpe` transbordam — **cabe, e eu corrijo a cura que o par decidiu**

**Concordo com a leitura do enunciado: cabe.** É a frase mais lida do combate
(10/10 plantas, turno 1), W2 é sobre texto, e a catraca é de tabela.

**Mas fui medi-la, e o par decidiu a cura errada.** O `desenho` fixou a lei
(`w1-desenho.md:341`): ***"o nome é o único campo que se apara. O número nunca.
A saída nunca."*** Medido contra o teto de 54 de E2:

| frase | custo fixo, **com o nome vazio** | sobra para o nome |
|---|---|---|
| `Longe demais — {n} a 12 m, faltam 10,5 m. Aproxime-se primeiro.` (`:1130`) | **60** | **−6** |
| `Há parede no caminho até {n} — contorne.` (`:1129`) | 37 | 17 |
| `{n} a 1,5 m — dentro dos seus 1,5 m de alcance.` (`:1137`) | 44 | 10 |

> ### A recusa por distância — a frase que aparece em 10 de 10 plantas no turno 1 de toda luta — **transborda com um nome de ZERO caracteres.** Aparar o nome **não pode salvá-la**, porque ela já estourou antes de o nome existir.

**A frase tem de encolher, e isso é redacção, não truncamento.** Medidas por mim:

| proposta | fixo | sobra | dos 47 nomes das tabelas |
|---|---|---|---|
| `{n} a 12 m — faltam 10,5 m.` | **24** | **30** | **47/47** |
| `parede até {n} — contorne.` | **23** | **31** | **47/47** |
| `{n} a 1,5 m — ao alcance.` | **22** | **32** | **47/47** |

*(A ordem a cair é a de W1 §2.5 e vale aqui: cai a **ordem** — "Aproxime-se
primeiro" —, nunca o número e nunca o nome. E W1 §5.5 já pediu a saída que a
substitui com proveito: `vá até K9 e o golpe alcança`, 44 caracteres.)*

### 4.2 · E pago aqui a dívida que o `desenho` declarou não ter pago

Ele escreveu (`w1-desenho.md:729`): *"**Quantos caracteres o nome de um inimigo
tem, de facto.** Orçamentei 24 a partir de dois exemplos que eu próprio inventei.
O número honesto sai de varrer os bestiários, e isso é leitura de tabela que eu
não fiz."* **Varri.** `bestiario.js`, `masmorras.js`, `antagonista.js`,
`arena.js`, `moldes.js` — **47 nomes distintos**:

| | |
|---|---|
| mínimo · mediana · média | **4 · 9 · 9,9** |
| p75 · p90 · p95 · p99 | **14 · 15 · 16 · 17** |
| máximo | **18** (`Sentinela Blindada`) |

**O orçamento de 24 do `desenho` é generoso para as tabelas — e é irrelevante,
porque o nome que chega à luta não sai delas.** Três achados, e o terceiro é o
que manda:

1. `completarInimigo` (`bestiario.js:92`) abre com `const nome = e.nome || "Inimigo";`
   — **o nome é o que a IA mandou, sem teto, sem aparo.** `prompt.js:505` dá o
   exemplo `"Capitão Bandido"` (15), e nada impede `"O Capitão da Guarda da Ponte
   Velha"` (36).
2. **O motor já sabe aparar um nome, noutro sítio:** `garantirLuta`
   (`adversario.js:219`) faz `limpar(o.nome, 40)`. **Existe um teto de 40 no
   adversário e nenhum na linha que o jogador lê.**
3. **E isto é o que mais importa:** `regras-jogo.js:388` **descarta em silêncio**
   um segundo inimigo com o mesmo nome. Logo **o motor obriga o Narrador a
   inventar nomes distintos — e distintos quer dizer mais longos — exactamente
   nas lutas com mais de um inimigo**, que são as lutas em que a linha do
   veredito mais trabalha. *A pior entrada da frase é produzida por uma regra do
   próprio sistema.*

**Conclusão para a tabela `LINHAS_DO_GOLPE` que W1 §5.3 já pediu:** a catraca dos
54 não chega. **Ela precisa de um teto de nome na fonte** — um `limpar(nome, N)`
onde o inimigo nasce, irmão do que `adversario.js:219` já faz — ou a `curta`
será curta para as tabelas e larga para o jogo real. **É pedido ao `backend`, e
é o meu único pedido novo de motor nesta etapa.**

### 4.3 · Tocar num inimigo — **concordo: não cabe, é de W3. E respondo à pergunta.**

**Concordo com a leitura do enunciado, e pela razão dele:** sem verbo armado,
tornar a casa ocupada clicável faz o toque no inimigo virar um passo para cima
dele. **É de W3**, e W3 já a tem escrita com os dois endereços
(`pauta-desenho.md`, bloco W3).

**A pergunta — *o que o toque no inimigo faz hoje sem verbo?* — tem resposta
exacta, e ela corrige de leve o par:**

```jsx
grade-de-batalha.jsx:700 — const clicavel = mirando ? tiro : indo;
```

- **Sem mira armada:** `indo = podeIr.has(k)`, e `podeIr` (`:401`) exclui
  `ocupados`. `clicavel` é **falso**, `tabIndex` é `undefined`, o cursor é
  `default`, e `agir()` (`:752`) devolve na primeira linha. **O toque faz
  literalmente nada, e nem sequer chega a ser um alvo de foco.**
- **Com a mira de habilidade armada:** `tiro = mirando && noAlcance.has(k)`, e
  `noAlcance` **não exclui ocupados**. **Já hoje, com uma habilidade de mira
  aberta, tocar na casa de um inimigo é clicável e chama `onMirar`, não
  `onMover`.**

> **Então a máquina que W3 precisa já existe e já embarcou: um estado que troca
> o significado do toque numa casa ocupada de "andar" para "mirar".** `pointerEvents:
> "none"` (`:648`) continua a impedir o toque na **ficha**, mas a **casa por
> baixo** já responde quando há mira. W3 não inventa um mecanismo: acrescenta um
> segundo valor a um que já roda em produção. *Digo-o porque muda o tamanho de
> W3 para baixo, e porque "é impossível tocar num inimigo" é verdade só na
> metade sem mira.*

### 4.4 · A mira violeta — do `desenho`. Não gasto linha, como me foi pedido.

---

## 5 · Para a pessoa decidir — a proposta ambiciosa

### **A rodada em que o golpe é recusado passa a ser a rodada da voz. O adversário ganha ouvido.**

**O diagnóstico, e ele é a soma de três medições que já estão na casa e que
ninguém tinha somado:**

> **Toda luta corpo a corpo deste jogo abre com 1,4 rodadas em que o jogador não
> tem nada para fazer, não tem nada para ler, e não custa nada ao Narrador.**
>
> - **10 de 10 plantas** recusam o corpo a corpo no turno 1; abertura média
>   **19,95 m** (W1 §1, corrido sobre `PLANTAS` × `posicionar`).
> - **7/7 turnos estéreis, 0 rolagens, 0 chamadas, 100% sem narração** (X4,
>   sessão A″).
> - E o motivo do zero: `:11871` devolve `true` antes do `enviar`.
>
> **É o maior espaço vazio do combate, e é o único que não custa quota nenhuma
> para ser preenchido.**

**A proposta, e ela não inventa mecânica nenhuma — liga quatro peças que já
existem e que nunca se viram:**

1. A fala na caixa, na rodada da recusa, entra pelo teste que já existe:
   `desafios.js:385` `intimidar` (perícia `intimidacao`, `social`), ou `:339`
   `convencer`. **Zero peças novas.**
2. O sucesso aplica `amedrontado` no alvo — a condição já existe
   (`condicoes.js:139`, salva `presenca`, cd 12) e **já é aplicada a inimigos com
   linha escrita** por `presenca-divina.js:154-159`. **Zero prosa nova.**
3. A linha viaja no envelope da rodada, pelo molde da poção (`:19580`).
   **Zero chamadas.**
4. **E a peça que falta, que é a única, e é o coração da proposta:**
   **um campo em `garantirLuta` (`adversario.js:211`) que diga que o herói falou
   — e uma `quebra` de intenção que o leia.** Hoje as quebras lêem `minhaVida`,
   `rodada`, `protegidoQuebrou`, `saidas`. **Nenhuma lê o herói.** Com um campo
   `foiAmeacado`, o `receoso` (`:628`, *"só avançar com vantagem clara"*) e o
   `fugir_ferido` (`:515`) ganham um segundo gatilho, e **o bando que recua
   porque alguém gritou é uma coisa que este jogo nunca viu.**

**Porque isto muda o que o jogador vive.** Hoje a primeira coisa que toda luta
lhe ensina é **"ande em frente"** — 1,4 rodadas, 10 em 10 plantas, sem decisão e
sem narração. Com isto, a primeira coisa que ela lhe ensina é **"a 19,95 m a tua
voz chega e a tua espada não"**, e a rodada da caminhada vira uma pergunta:
**avanço, ou falo?** *O combate passa a começar antes do primeiro golpe.* E a
posição passa a valer duas coisas ao mesmo tempo, que é o que faz um tabuleiro
ser um tabuleiro.

**Comprovado, pelos três caminhos:**

- **Medida.** As três acima (10/10; 19,95 m; 1,4 rodadas; 7/7 estéreis; 0
  chamadas), e mais duas minhas: a rodada da recusa **já é gratuita em quota**
  (`:11871`), e o custo de acção da fala **já é zero** (`cobrarTempoDoDesafio`
  cala-se em combate; `declararAcaoRapida` não toca `economia`).
- **Estudo citado, e é de dentro de casa.** `adversario.js:784` escreve a lei do
  Narrador: *"NUNCA invente uma intenção que a Pauta não deu."* O adversário tem
  trinta e tal entradas de mundo e **zero entradas de herói**. É a mesma coisa
  que `reacoes.js` já fez com a reação, e que a Fase K nasceu para corrigir: *o
  módulo escreve que metade da tensão mora ali, e sete linhas depois entrega a
  decisão ao sistema.*
- **Experiência jogada — e não a tenho, e digo-o como o buraco que é.** Não
  joguei isto porque não existe. **É a razão de a proposta ser da pessoa e não
  minha.**

**Porque é dela.** É tabela nova e campo novo num módulo puro (`backend`), e o
jogador reaprende uma coisa grande: **que a luta se pode ganhar sem um golpe.**
Isso é fluxo.

**O risco, dito por mim, e não é pequeno.** **Uma fala de graça numa rodada de
graça é uma fala que todo jogador fará em toda abertura de toda luta** — e aí o
imposto de caminhada troca de roupa e continua imposto, com um teste de
Intimidação no lugar do passo. **A defesa não é minha e já está no código:**
`chaveDaTentativa` (`desafios.js:710`) fecha o lugar depois da primeira
tentativa, e a segunda ouve *"você já tentou isso aqui"* de graça. **A
provocação é um recurso de uma vez por luta, não um botão por rodada** — e uma
vez por luta é exactamente o peso de uma decisão.

---

## 6 · O que eu peço, e a quem

**Ao `backend`, pela `mente/pauta.md` — três, e nenhum é meu para escrever:**

1. **A recusa por distância tem de encolher para caber com nome vazio.**
   `App.jsx:1130` mede **60 com o nome vazio** contra o teto de 54 de E2, e a lei
   do `desenho` (*aparar só o nome*) **não a pode salvar**. Entra na
   `LINHAS_DO_GOLPE` que W1 §5.3 já pediu, com a `curta` medida acima (24 de
   custo fixo, 47/47 nomes cabem).
2. **Um teto de nome na fonte do inimigo.** `completarInimigo`
   (`bestiario.js:92`) aceita o que a IA mandar; `garantirLuta`
   (`adversario.js:219`) já faz `limpar(o.nome, 40)`. **O teto existe num sítio e
   falta no outro** — e `regras-jogo.js:388`, ao descartar nomes repetidos,
   **força o Narrador a alongá-los nas lutas com mais de um inimigo**.
3. **O ouvido do adversário** — um campo em `garantirLuta` que diga que o herói
   falou, e uma `quebra` que o leia (§5). *É o único pedido de mecânica desta
   etapa, e é o que faz W2 ser jogo em vez de decoração.*

**Ao `sistema`, pela `mente/pauta.md` — um, e é gordura de prompt numa fase cujo
teto é sagrado:**

4. **`prompt.js:576` ensina ao Narrador uma economia que o motor não tem.**
   *"a cada rodada o jogador tem 2 movimentos (ação + ação extra)"* é falso desde
   a v9.13 (`agir` encerra o turno na primeira acção), e `"[TURNO AINDA MEU]"`
   **não é emitido por nenhuma linha do `src/`**. **208 caracteres** de bloco
   estático, dentro do `so("combate", …)`, a descrever um jogo que não existe.

**Ao `desenho` — dois, e nenhum bloqueia:**

5. **Nenhuma peça nova.** A fala escreve na **mesma linha do veredito** que o
   golpe, o passo e a reação já partilham, e a linha dela é uma `Consequencia`
   *Forma=Linha* como as outras. **É de propósito, e é a mesma razão de W1 §6:**
   quatro coisas a partilhar uma linha é o que prova que são a mesma conversa.
6. **O `placeholder` é seu, não meu, mas o conteúdo é meu e é uma condição.**
   Hoje (`App.jsx:21554`) ele diz *"O que você faz? Fale, aja, explore…"* — e
   **"Fale" já é a primeira palavra**. **Não peço que o campo anuncie um modo
   novo**, e recuso qualquer texto que o faça: seria o sistema a falar de si
   mesmo, na tela onde a lei é mais dura. *Se a forma tiver de convidar, que
   convide pelo momento (a rodada da recusa) e não por uma palavra.*

---

## 7 · O que eu não sei, e o que não foi provado

- **Não joguei nada disto.** Todo número saiu de ler o `App.jsx` da v9.263 linha
  a linha ou de correr os módulos puros em Node. Onde é ofício, disse que é
  ofício.
- **A taxa de falas por luta é desconhecida, e não é estimável.** Hoje ela é ≈ 0
  porque falar custa a rodada; depois de W2 pode ser 0,2 ou 1,5 por luta, e a
  diferença muda o ganho de −18% para −5% ou −40%. **O número honesto sai de
  jogar o depois, e é da etapa que construir.** Escrevi o ganho por fala, que é
  o único número que não depende de eu adivinhar um comportamento.
- **Não confirmei se `lugar` é estável dentro de uma luta**, e o freio contra o
  abuso do §3.2 depende disso. Se o `lugar` mudar quando o herói anda, o livro
  de tentativas não segura nada e o freio tem de ser outro.
- **Não medi o custo em tokens do que a fala acrescenta ao envelope.** Ela entra
  por `notaRef`, que é canal dinâmico e não bloco estático — logo respeita a lei
  do teto —, **mas dinâmico não quer dizer pequeno**, e uma fala longa do jogador
  entra inteira. *Um teto de caracteres para a fala no envelope é decisão que eu
  não tomei e que alguém terá de tomar.*
- **Não sei o que a fala faz numa sala com dois jogadores**, nem no duelo. É o
  mesmo buraco que E2 e W1 declararam, e continua aberto.
- **O maior buraco desta etapa:** eu provo que W2 não devolve quota no caso
  comum, e a pauta prometia que devolvia. **Não sei se a pessoa quer W2 depois de
  saber disso** — e essa é a pergunta que este documento existe para lhe pôr à
  frente, em vez de a esconder atrás de um número inflado.

---

*Fase W2 · `jogo` · 16/09, sobre a v9.263. O par é o `desenho`; o desempate é do
`regente`. Nenhuma linha de produção escrita; `mente/formas.md` não foi tocada.*

---

## 8 · Adenda — os três buracos fechados com número

*Pedido do `regente` depois de ler o corpo acima. **O §7 fica intacto**: ele é o
registo honesto do que eu não sabia quando escrevi. Esta secção diz o que fui
medir depois e o que mudou por causa disso — e onde ela contradiz o corpo do
documento, ela manda, e eu digo-o na linha.*

### 8.1 · `lugar` aguenta — e o freio é mais fraco do que eu escrevi, por outro motivo

**A pergunta era se `lugar` muda quando o herói anda. Não muda — e não é por
sorte: é lei escrita, com comentário por cima.**

`ctxDesafio` (`App.jsx:15559`) é quem dá o `lugar` ao `lerAcao`:

```js
lugar: (lugarRef.current && lugarRef.current.nome) || cidadeAtualRef.current || "ermo",
```

**O `lugar` é o nome de ficção do sítio, nunca a casa do tabuleiro.** Andar de
K9 para K12 não lhe toca: a posição do herói na luta vive em `combate.heroi`,
não em `lugarRef`. E as duas portas que poderiam mudá-lo estão **as duas
fechadas em combate**:

```js
App.jsx:7139 — if (combateRef.current) { /* [LUGAR — RECUSADO PELO SISTEMA] */ return null; }
App.jsx:5956 — if (combateRef.current || acampadoRef.current) return null;   // alvoLocalPedido
```

A primeira é `registrarLugar` — a porta por onde o Mestre e o Cronista mudam o
lugar — e o comentário em cima dela (`:7134`) diz exactamente isto:
***"NINGUÉM SE MOVE NO MEIO DE UMA LUTA … enquanto a luta corre, quem diz onde
cada um está é o tabuleiro."*** A segunda é o detector do movimento escrito.
**`lugar` é congelado por lei durante a luta inteira**, e a nota de recusa (207
caracteres) ainda vai ao Narrador para ele também não tentar.

> **O freio nº1 do §3.2 aguenta a pergunta que eu lhe fiz. Mas fui ler a chave
> até ao fim, e ela não é `lugar|alvo` como eu escrevi — e a diferença é minha
> para corrigir.**

`lerAcao` não usa `chaveDaTentativa(lugar, d.alvo)` quando o desafio é social.
Usa isto (`desafios.js:916-918`), e `intimidar` **é** social (`:385-389`):

```js
const chave = chaveDaTentativa(lugar, conta
  ? `${d.alvo}|${(pessoa && pessoa.nome) || "quem quer que seja"}|${conta.tamanho}`
  : d.alvo);
```

Logo a chave da provocação é `lugar|intimidacao|<quem>|<tamanho>` — dois campos
que eu não tinha visto. Corri-os:

| campo | de onde vem | valores distintos |
|---|---|---|
| `tamanho` | `tamanhoDoPedido(texto)` (`social.js:135`) — **lido do que o jogador escreve** | **6** (`cortesia · conversa · simpatia · favor · risco · traicao`) |
| `pessoa` | `pessoaNaFrente` (`App.jsx:15536`) — lê `elencoDaCena`, **o elenco de NPCs, não os inimigos da luta** | 1 em combate (`"quem quer que seja"`) — salvo com companheiro na cena |

**Duas consequências, e a segunda é um defeito que eu tenho de nomear:**

1. **O freio não é uma vez por luta: são até seis.** Um jogador que varie o
   *tamanho* do que exige — e variar é escrever outra frase, não descobrir um
   truque — abre chave nova e ouve o dado outra vez. Na prática quase toda
   ameaça cai no degrau padrão `favor` (`tamanhoPadrao()`, `social.js:130`),
   porque nenhum dos seis `rx` casa *"ameaço o bandido"*; mas *na prática* não
   é o mesmo que *por regra*, e a lei desta casa é a segunda.
2. **`pessoaNaFrente` não conhece inimigos.** Lê o registo de NPCs com
   `comGrupo` e, se a cena tiver **uma** pessoa, devolve-a mesmo sem o nome ser
   citado (`:15548`). **Numa luta com um companheiro ao lado, a ameaça gritada
   ao ogro é chaveada ao nome do companheiro.** Não quebra nada hoje — nada
   intimida em combate hoje — e quebra W2 no dia em que W2 existir.

> **O freio que fica, e é este que eu assino:** o livro de tentativas continua
> a ser o freio, porque `lugar` está congelado e `fecharTentativa`
> (`App.jsx:16291`) escreve a chave com `onde` e `dia`. **Mas ele só é "uma por
> luta" se a chave da fala em combate deixar de ler o texto do jogador** — isto
> é, se chavear por `lugar|intimidacao|<nome do inimigo>` e mais nada. *Isso é
> pedido ao `backend`, não é redacção minha, e está no §8.5.*

**E o freio de reserva, que não depende de ninguém porque já roda:** os **+3 de
dificuldade** em combate (`desafios.js:1022` — `intimidar` não declara
`valeEmCombate`) e o **uma por rodada** do envelope. Mesmo com seis chaves, seis
ameaças são seis rodadas, e o §3.2 já só dá uma por rodada.

**Uma correcção pequena, e é a favor do freio:** quando a intimidação **passa**,
a segunda não ouve `jaTentou` — ouve `livre`, com *"Isso você já conseguiu
aqui"* (`desafios.js:981`). É outra frase e, hoje, ainda uma chamada. Depois de
W2 é a mesma linha, de graça.

### 8.2 · O teto da fala no envelope: **240 caracteres** — e não é um número novo

**Primeiro, o que as notas irmãs medem de facto.** Corri-as com valores típicos:

| a nota, em `notaRef` | linha | caracteres |
|---|---|---|
| a aflição da arma, aplicada | `App.jsx:11904` ← `aflicoes.js:146` | **356** |
| a poção, em combate | `App.jsx:19611` | **355** |
| o ritual | `App.jsx:13361` | **238** |
| a queda estabilizada | `App.jsx:8214` | **217** |
| a recusa de lugar em combate | `App.jsx:7140` | **207** |
| *(referência)* a parte fixa do envelope do golpe | `App.jsx:11932` | **277** — confirma o §1.5 |

**A ordem de grandeza da casa é 207 a 356, e a mediana é 238.** E não há teto
nenhum em lado nenhum: `notaRef` é concatenada sem corte (`:10728` junta,
`:10729` limpa) e o `<input>` do turno **não tem `maxLength`** (`:21553`).

**Segundo, o número — e ele já existe, para esta mesma quantidade:**

```js
falas.js:58   — export const TETO_DA_FALA = 320;                       // a fala que a IA escreve por um NPC
falas.js:82   — acao: String(acao || "").slice(0, 240),                // o que o HERÓI acabou de dizer
App.jsx:10709 — ultimaAcaoRef.current = String(conteudo || "").slice(0, 200);  // para a Pauta
```

> ### O teto da fala do jogador é **240** — o `slice` que `falas.js:82` já aplica a *"o que o herói acabou de dizer"* quando entrega essa frase a uma segunda voz. **É a mesma quantidade com o mesmo emprego, e escrever um segundo número para ela seria a mesma regra em dois sítios: o defeito que esta casa já pagou três vezes.**

*Porque não 320:* 320 é o teto de uma linha que a IA **escreve** e por que a
casa paga uma chamada inteira. 240 é o de uma linha que o **jogador** escreve e
que viaja de graça. *Porque não 200:* 200 é o que vai à **Pauta**, que é canal
de resumo; a fala viaja como **palavras literais**, que é o emprego de
`falas.js:82`.

**A conta que o justifica.** O envelope da fala é o `envelopeDasFalas` ao
contrário, e esse eu medi: **227 caracteres** de cabeçalho e pé fixos
(`falas.js:146`, com a fala removida). Logo:

| | |
|---|---|
| envelope da fala, pior caso | 227 + 240 = **467 caracteres** |
| a maior nota que já viaja hoje | **356** (a aflição da arma) |
| razão | **1,31×** |
| **contra o teto de prompt de ~82.000 no pior caso** | **+0,57%**, e **uma vez por rodada** (§3.2) |

**É a maior nota do jogo, e é a única em que as palavras são de uma pessoa.
Aceito que seja a maior e digo porquê: é a única que ninguém pode reescrever
mais curta sem reescrever o que alguém disse.**

**Terceiro, e é a metade que a lei exige: o que acontece com a fala que estoura.**

> ### Ela **não é cortada. É recusada, e a recusa chega antes do clique.**

`falas.js:140` trunca com `…` e está certo lá: ninguém escreveu aquilo.
**Truncar as palavras de uma pessoa em silêncio é o defeito de
`declararGolpe:11988`** — a troca de alvo silenciosa que o W1 §0.1 nomeou — na
sua forma mais cara, porque o jogador leria o Narrador a responder a metade de
uma frase e não teria como saber porquê. Os três passos, e nenhum é peça nova:

1. **O aviso só nasce perto do fim.** Nada na tela enquanto a frase couber. *Um
   contador sempre aceso é o sistema a falar de si mesmo, e a tela do turno é
   onde essa lei é mais dura.*
2. **A partir do limiar, a linha do veredito diz o preço**, na mesma
   `Consequencia` *Forma=Linha* que o `📏` já usa: *"longo demais para gritar no
   meio de uma luta."* Diegético, sem contagem de caracteres na cara do jogador.
   **Pedido ao `desenho`: a forma do aviso — a peça é a que já existe.**
3. **`Agir →` não some e não engole.** A frase fica na caixa, inteira, e o turno
   não anda. Nada se perde.

**E uma armadilha que eu quase escrevi, e que digo para ninguém a escrever:**
**o teto NÃO pode ir para o `maxLength` do `<input>`** (`:21553`). A caixa tem
três empregos (§3.3), e um `maxLength` cortaria também a frase que **age** e a
que **explora** — o primeiro emprego, que esta etapa jurou não tocar. **O teto
vive no ramo da fala, nunca na caixa.**

**A tabela, e é tabela pela primeira lei:** `TETO_DA_FALA_DO_JOGADOR = 240`, **em
`falas.js`, ao lado de `TETO_DA_FALA`** — porque é o mesmo assunto (uma linha
dita), porque a suíte que já lê um passa a ler os dois, e porque dois tetos de
fala em dois arquivos divergem no primeiro dia em que alguém mexer num deles.
**Não a escrevo: é pedido ao `backend` (§8.5).**

### 8.3 · O momento na tela, rodada a rodada

**Uma correcção ao enunciado antes de compor, e é a favor do jogo:** na rodada
1, a 19,95 m, **o jogador não consegue tocar `Atacar`**. Desde a v9.222 o botão
vem `disabled`:

```js
App.jsx:20877 — const impedido = golpeVivo && !vdGolpe.algumAoAlcance;
App.jsx:20880 — <button key={a.rotulo} disabled={impedido} …
```

`:11871` é a recusa do **teclado** (quem escreve *"ataco o bandido"*) e `:11981`
é o cinto-e-suspensórios do botão, que naquele instante não é alcançado — o
clique não acontece. *Digo-o porque muda o que eu tenho de compor: o problema da
rodada 1 não é uma recusa a explicar — é uma tela onde a única acção está
apagada e não há nada a fazer.*

#### Rodada 1 — o golpe não alcança

**Hoje, no instante em que a luta abre, na tela inteira:**

| onde | o que está lá | custo |
|---|---|---|
| botão `Atacar` | desenhado, **apagado, sem preenchimento**, clique morto (`:20880`) | — |
| a linha por baixo | `Longe demais — Bandido a 19,5 m, faltam 18 m. Aproxime-se primeiro.` (`:20910` → `:1130`) | **transborda os 54 de E2 — §4.1** |
| o chat | **nada** | — |
| `notaRef` | **nada** | — |
| chamadas | **zero** (`:11871` devolve antes do `enviar`) | — |

**Depois de W2, uma coisa muda e só uma:** a linha do veredito ganha uma
**segunda instância dela mesma**, por baixo, e essa segunda diz o facto que a
distância **não** impede:

> `Bandido a 19,5 m — faltam 18.`
> `A voz alcança.`

**Duas linhas, mesma forma** — a `Consequencia` *Forma=Linha* que o golpe, o
passo e a reacção já partilham (§6.5). **Não é peça nova: é a mesma peça duas
vezes** — e por isso continua a valer a minha recusa de dar ao campo qualquer
texto que anuncie um modo (§6.6). *"A voz alcança"* é um facto sobre o mundo a
19,5 m, do mesmo tipo de *"há parede no caminho"*: a linha do veredito sempre
distinguiu **duas razões diferentes** para o mesmo não; agora distingue também
**o que ainda é sim.**

**Ela só existe onde é verdade, e essa é a catraca:**

- razão `longe` → aparece;
- razão `parede` (`:1129`) → **não aparece**: atrás de pedra a voz não é um facto,
  e prometê-la seria mentir;
- golpe ao alcance → some, porque aí a espada alcança e a pergunta acabou.

**Porque não cabe na mesma linha, e é medido:** a recusa curta que propus no
§4.1 mede **24** de custo fixo com o nome vazio; `— a voz alcança.` mede **16**;
24 + 16 = **40**, e sobram **14** para o nome — contra um p75 de **14**, um p90
de 15 e um máximo de 18 (§4.2). **Pelo menos um quarto dos nomes das tabelas
transborda — e o nome que chega à luta nem sai das tabelas.** Forçá-la a caber
seria aparar o nome, que é exactamente o que a lei do `desenho` proíbe. **Duas
linhas é a resposta.**

**Pedido ao `desenho`:** a segunda linha e o espaço dela — o `minHeight: 24` de
`:20909` é para uma. Forma e ritmo são dele; o conteúdo e o *quando* são meus e
estão acima.

#### O jogador escreve uma provocação e carrega `Agir →`

**O ramo da fala vive entre `:13555` e `:13556`, e esse endereço é a etapa
inteira:**

```js
App.jsx:13555 — if (aplicarGolpeDoJogador(acao, fichaViva() || personagem)) return;
                ← AQUI: depois do golpe, antes da linha do jogador e do fecho do turno.
App.jsx:13556 — pushMsgs([{ autor: "jogador", texto: acao }]);
App.jsx:13594 — const rvG = fecharMeuTurno(persG);
App.jsx:13595 — enviar(`${acao}…`, rvG.pers);
```

**Acima de `:13555` o golpe manda (§3.1, e é lei). Abaixo de `:13556` a rodada
já se perdeu. É uma costura de uma linha, e é isso que faz W2 caber.**

Na mesma fracção de segundo, sem chamada nenhuma:

| o quê | onde | quanto |
|---|---|---|
| a linha do jogador | `pushMsgs`, molde de `beberDaBolsa:16076` | `{ autor: "jogador", texto: acao }` |
| a linha do desfecho | `pushMsgs`, na forma de `falaDoVeredicto` — **do módulo, nunca montada no App** (a lei de `:16151`) | uma linha |
| o dado, se houver | `rolarDesafio:16194` já escreve o `🎯` e o `🎲` | — |
| a nota | `notaRef`, molde de `:19611` e `:16056` | **≤ 467** (§8.2) |
| **o que NÃO acontece** | **sem `enviar`, sem `fecharMeuTurno`, sem `eco.acao -= 1`, sem revide, sem virar a rodada** | **0 chamadas** |

#### A segunda fala na mesma rodada

**Ele ouve uma linha, no mesmo sítio onde já ouve a irmã dela, e de graça:**

```
App.jsx:11878 — "⏳ Você já usou sua ação nesta rodada — o golpe fica para a próxima."
```

A da fala é a mesma forma e o mesmo lugar — o chat, `autor: "sistema"`, glifo
`⏳` —, *"você já disse o que tinha a dizer nesta rodada"*, **e sem linha de
jogador**, porque nada foi declarado. A razão é a do §3.2 e é o envelope: ele é
escrito **uma vez** (`:10728`), e duas notas sobre o mesmo instante são as *"duas
ordens sobre a mesma poção"* de `:16085`.

#### Ele escreve *"Ataco o ogro"* — e a pergunta difícil

`:13555` dispara primeiro, `aplicarGolpeDoJogador` devolve `true`, e **nada de
W2 é sequer alcançado.** A costura estar **abaixo** dessa linha é a garantia
inteira, e é uma invariante de uma linha que `check-acoes-do-jogador.mjs` sabe
guardar.

> ### **Como é que o jogador percebe a diferença entre os dois destinos sem nunca ler o nome do mecanismo?**
>
> ### **Pelo que ainda está na mão dele quando a linha acaba de ser escrita.**

Três sinais, todos já na tela hoje, **nenhum deles uma palavra**:

1. **O inimigo responde, ou não responde.** O golpe imprime `⚔ … de dano`,
   depois o revide, depois a rodada vira. A fala imprime **uma linha e pára**. O
   facto mais legível do combate deste jogo é *"o outro respondeu?"* — e ele só
   responde a um dos dois.
2. **O botão `Atacar` continua aceso.** Depois do golpe ele apaga — a economia
   foi a zero, e a tentativa seguinte ouve `:11878`. Depois da fala ele está
   **exactamente como estava**. O jogador não lê *"falar não custa acção"*: **ele
   vê que ainda pode atacar.** É o veredito depois do clique, e é de graça.
3. **A prosa chega noutro tempo.** A do golpe chega no mesmo turno — ela **é** a
   chamada. A da fala chega dentro da narração da rodada seguinte, costurada,
   quando o Narrador disser que o outro ouviu. **Esse atraso não é defeito: é a
   assinatura.** *O que você fez resolve-se agora; o que você disse é respondido
   quando o mundo voltar a falar.* **É a assinatura da poção, está em produção
   desde a v9.13, e nunca ninguém teve de a explicar a um jogador.**

**E o único sítio onde a diferença tem de ser legível ANTES do clique, porque a
lei exige:** a linha do veredito — e é o que o §8.3 compõe acima: na rodada da
recusa por distância ela diz que a voz alcança; nas outras, não diz nada.

**O buraco que isto deixa, e eu não o escondo.** A frase ambígua — *"grito e
avanço"* — vai ao detector do golpe (`resolverAtaqueJogador`) e sai por uma das
duas portas, **e o jogador não tem como saber qual antes de carregar.** Hoje o
veredito lê só o tabuleiro:

```jsx
App.jsx:20846 — const vdGolpe = vereditoDoGolpeAgora();   // sem nenhum argumento vindo da caixa
```

Para a linha dizer para onde *esta frase* vai, ela teria de ler `entrada` — e
isso é a única coisa de W2 que muda a forma de uma peça viva. **Pedido ao
`desenho` e ao `backend` (§8.5).** *Enquanto não existir, "o veredito antes do
clique" está cumprido para o tabuleiro e não está cumprido para a frase, e é
honesto dizê-lo assim.*

### 8.4 · Como se mede W2 depois — e o instrumento tem de nascer ANTES

**O `regente` respondeu à minha pergunta do §7, e a resposta põe-me esta
obrigação, que eu aceito.** Fui procurar quem, no jogo de hoje, saberia contar.

> ### **Não há contador nenhum que sirva — e o mais próximo tem um defeito que o desqualifica pela raiz.**

O único que guarda o que o jogador fez é a mesa de `mestria.js`: `anotarTurno`
(`:91`), janela de **10** turnos (`JANELA = 10`), `{ rolou, perigo, ganho, luta,
pilar }`, e está no save (`App.jsx:11520`). Dois motivos por que não serve:

```js
App.jsx:9379 — pilar: combateRef.current ? "combate" : (tx.pilar || null),
```

1. **Em combate o pilar é sempre `"combate"`.** O `pilar: "social"` que
   `rolarDesafio:16186` escreve **é sobrescrito** em toda luta. A mesa não
   consegue, por construção, ver uma acção social dentro de uma luta.
2. **`anotarTurno` só corre quando uma resposta do Mestre volta** (`:9376`,
   dentro do tratador da resposta). **A fala de W2 não gera chamada nenhuma —
   logo não seria anotada uma única vez.** *O instrumento é cego exactamente ao
   comportamento que W2 existe para produzir.*

E as sondas (`testes/sonda-turno-esteril.mjs`) medem **o que o caminho de código
pode fazer**, não o que uma pessoa fez — o próprio cabeçalho dela o diz. Servem
para provar que a porta existe; não contam quem passou por ela.

> ### O número que a etapa seguinte tem de medir: **falas por luta** — falas resolvidas por código a dividir por lutas terminadas, sobre uma janela de **pelo menos 20 lutas**.

**E a banda, porque uma aposta sem forma de perder não é uma decisão:**

| falas por luta | o que quer dizer | veredito |
|---|---|---|
| **< 0,5** | menos de uma luta em duas tem uma fala | **W2 falhou** — é o campo que pede fala e fica vazio, que a pessoa proibiu como catraca (§3.3) |
| **0,5 – 1,2** | a fala é uma decisão que se toma às vezes | **W2 funcionou** |
| **> 1,2** | há uma fala em quase toda abertura de toda luta | **W2 falhou pelo outro lado** — é o imposto de caminhada com outra roupa, o risco que eu próprio nomeei no §5, e o freio do §8.1 não segurou |

**O limiar de cima é o meu ponto, e é o que dá forma à perda:** **1,4** rodadas
de caminhada por luta (W1 §1) é o número de rodadas em que a fala é de graça.
**Uma taxa encostada a esse número prova que a fala virou obrigação e não
escolha** — e uma obrigação de graça é pior que uma parede, porque não se vê.

**A linha de base, e é aqui que está a única coisa urgente desta adenda:**

> **A base de hoje não é "zero" — é "não medida", e eu não a posso estimar
> (§7).** O que eu posso provar é que hoje **falar custa a rodada inteira**
> (`:13595` fecha o turno) e que **falar por `Intimidar` custa uma chamada e +3
> de dificuldade** (`:16174` → `:15991`; `desafios.js:1022`). Isso explica por
> que a base *deve* ser baixa; **não diz qual é.**
>
> ### **Logo: o contador tem de entrar na versão ANTES de W2, e correr algumas sessões antes de a fala ficar de graça.** Um contador que nasça junto com W2 mede o depois contra nada — e aí W2 volta a ser a aposta sem forma de perder que o `regente` me proibiu de entregar.

**É pedido ao `backend`, e é o mais barato dos quatro:** um campo por luta em
`combateRef` e um agregado curto no save, no molde da mesa de `mestria.js` —
janela pequena, dois números. **Nada disto aparece ao jogador: é bastidor, e
bastidor não se lê.**

### 8.5 · O que vai para `mente/pedidos-ao-sistema.md` por causa desta adenda

*Os três de §6 ao `backend` e o do `sistema` (`prompt.js:576`) ficam como estão.
Estes quatro nascem aqui:*

5. **`TETO_DA_FALA_DO_JOGADOR = 240`, em `falas.js`** — §8.2.
6. **A chave da fala em combate não pode ler o texto do jogador** — §8.1. Hoje
   é `lugar|intimidacao|<quem>|<tamanho>`, e o `tamanho` sai do que ele
   escreveu: seis chaves para a mesma ameaça. E `pessoaNaFrente` (`:15536`) não
   conhece inimigos — com um companheiro na cena, chaveia a ameaça ao nome do
   companheiro.
7. **`vereditoDoGolpeAgora` precisa de saber o que está na caixa** — §8.3. Sem
   isso, "o veredito antes do clique" vale para o tabuleiro e não vale para a
   frase.
8. **O contador de falas por luta, ANTES de W2** — §8.4.

### 8.6 · O que eu continuo sem saber

- **O que a fala faz numa sala com dois jogadores e no duelo.** O §7 declarou-o,
  não fui lá, e continua aberto.
- **Se a banda do §8.4 (0,5 – 1,2) é a certa.** É a minha leitura de mesa, não é
  medida — e só o será depois de alguém jogar.
- **Quanto do envelope de 467 o Narrador de facto usa.** Medi o que a fala
  **custa**; não medi se ela **muda** a prosa que volta. Isso só se sabe lendo
  dois turnos lado a lado, e é da etapa que construir.
- **Nada disto foi jogado**, pela mesma razão do §7: não existe.

---

*§8 escrito em 16/09 sobre a v9.263, a pedido do `regente`. Nenhuma linha de
produção escrita; `mente/formas.md` não foi tocada; o §7 fica intacto, porque é
o registo honesto do que eu não sabia.*
