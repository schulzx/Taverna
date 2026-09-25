# V4 · a cinta com os anéis — o momento (`jogo`, 25/09)

## PARA O `desenho`, JÁ (leia antes de fabricar)

1. **O grupo vai até QUATRO, não três.** `MAX_COMPANHEIROS = 4`
   (`constantes.js:35`). O pior caso é herói + 4. **As invocadas
   (`g.invocada`) nunca entram na cinta**: só existem em luta, e a luta tem
   tela própria. O filtro é o de todo o App, `!g.invocada`.
2. **`O anel` tem QUATRO estados, e o quarto existe fora da luta:** *Calma* ·
   *Grave* (PV ≤ 1/3, a régua de `ACinta`) · *Ferida agora* (750 ms, o
   `feridaRecente` que já existe) · **Tombado** (`vida <= 0 || morrendo`, que
   é o que a ressurreição do domínio lê, `App.jsx` ~:10620). Tombado **não se
   diz pela cor**: arco vazio, rosto apagado e um traço diagonal sobre o anel,
   e tem de se ler em cinzento. **O `Retrato` não tem estado de tombado**
   (`estadoDe()`, `semente.js:49`, só dá `normal`/`ferido`/`grave`), portanto
   esse estado é peça tua.
3. **Tamanhos: o herói tem 40 nas duas telas, o companheiro 28 no telefone e
   32 na mesa. A cinta fica em 48 nas duas.** A v3 tem 66 de altura e anéis de
   42; com 40 dentro de 48 a prosa não perde um píxel na mesa (−18 px, se fosse
   66), e a diferença 40/32 dá ao herói a primeira leitura (§1). **A coroa não
   pode fazer a cinta crescer nem ficar cortada** (a cinta tem
   `overflow: hidden`, e na v3 a coroa sobe 8 px acima do anel); o canto de
   baixo-direito já é da `MarcaDaPorta`.
4. **A ordem do grupo é ESTÁVEL** (a de entrada), nunca "pior primeiro":
   posição é identidade, e a 28 px os rostos por semente não se distinguem de
   relance. O que não cabe entra num **disco `+N`**, e o disco **herda o pior
   estado do que esconde** (aro grave, ou traço de tombado). **Lei única para
   a cinta: o `+N` herda o pior do que esconde**, e vale também para o `+N` do
   selo de prazo (§3).
5. **O número de PV:** no telefone só o herói tem número (`14`). Na mesa cada
   retrato tem nome + `14/14 PV` em duas linhas de 12 (é a `meta` da v3,
   com `PV` e não `HP`). O companheiro sem rótulo diz o número no nome
   acessível (`Tomé · 3 de 10 PV`).
6. **Alvos: o herói é um, e o grupo é outro.** No telefone os anéis de 28
   ficam abaixo de `ALVOS.piso` (48), por isso o cacho inteiro é **um** botão
   de 48 × 48 no mínimo (a área invisível come os espaços). Na mesa cada
   retrato com rótulo é o seu próprio alvo (112 × 48). Os dois fazem a mesma
   coisa, *abrir o Grupo neste companheiro* (§2).
7. **PM:** violeta, só o do herói, só quando `oPMConta()`, **só número, sem
   barra** em lado nenhum. **No telefone, PM e bolsa empilham-se numa coluna**
   (duas linhas de 12, 54 de largura): é isso que faz a cinta caber (§4). O
   `Contador` precisa de um eixo `Arranjo = Linha | Coluna`.
8. **As condições ficam na segunda fila (72) nas duas telas.** O `v1-jogo.md`
   §2 punha-as ao lado do herói na mesa, mas com quatro companheiros esse
   espaço deixa de existir, e um chip que muda de fila conforme o tamanho do
   grupo é uma forma com duas moradas.
9. **O `2h 15m` de sessão não existe nesta árvore** (a pílula de hoje já é
   `horaTxt(minuto)`). O que a v3 traz a mais é o glifo da luz e, na mesa, o
   dia (`dataTxt(dia)` → `14 de Brumal`, `calendario.js:23`).

---

## 0 · O antes, medido (HEAD `4ce9d4c`)

Montagem: exportei `4ce9d4c` para o scratchpad e servi-o em **5176**, sem mexer
na árvore. Chrome headless, perfil temporário apagado no fim, `/api` cortado
(**0 pedidos** chegaram a sair). O save é o `save-noite` de V1 (Ilsa, maga, 22:00),
com o grupo injectado com o jogo desmontado: **0, 1, 3 e 4 companheiros**
(no de 4 há um grave, `Tomé 3/10`, e uma tombada, `Ninha 0/10, morrendo`),
**a heroína a sangrar** (4/14 PV, `Sangrando`), **1 e 2 prazos**. Tamanhos
1280×800, 375×812 e 320×700. O script está em `scratchpad/v4-jogo/base.mjs`,
e os números em `base.json`, `base-filhos.json` e `base-prazo.json`.

| o que se mede | antes |
|---|---|
| **companheiros visíveis na tela principal** | **0 de N** nas 5 cenas × 2 tamanhos: com 4 companheiros e uma a morrer, a cinta mostra a heroína com PV cheio e nada mais |
| **toques até ler o PV de um companheiro** | **2** (a ficha → `Grupo`), nas duas telas |
| **rolagem até à companheira que morre** | o cartão de Ninha começa em **y = 1325** num ecrã de 812 (375) e em 1327 num de 800 (1280), **~520–600 px abaixo da dobra**. O grave (Tomé) começa em 744, atrás da fita de abas. A sala ordena por entrada, e quem está mal fica ao fundo |
| **a cinta** | 48 (72 com `Sangrando`), nas duas telas. Na mesa ficam **~920 px vazios** entre a ficha (acaba em 303) e a hora (1226) |
| **a ficha, por partes (375)** | rosto 32 · PV 94 · **PM 94** · bolsa 32 · 3 × 10 de espaço |
| **a barra de PV quando há prazo** | **375: 3 px com 1 prazo e 0 px com 2. 320: 0 px.** A barra de PM fica nos **56**. |
| **a pílula do tempo** | 42 (só a hora) · **125** (1 prazo) · **145** (prazo + `+1`) |
| **`reduced-motion` com a heroína grave** | `tvAgonia:running`: **o pulso corre sem fim, com `reduce` ou sem ele** |
| **o topo do campo** | 735 (375) · 706 (1280). É a régua da página: depois de V4 tem de dar o mesmo, ±2 |

**Três defeitos de hoje, achados ao medir** (nenhum é de V4, e V4 conserta os
três por construção):

1. **O canal primário da vida morre primeiro.** A barra do PM tem
   `hidden md:inline-block`, mas o `style={{ display: "inline-block" }}` de
   `BarraDeRecurso` passa por cima do `hidden`, e por isso **ela aparece no
   telefone**, ao contrário do que o comentário dela diz (`App.jsx` ~:1568). Como
   o grupo do PM é `shrink-0`, quando entra um prazo **quem cede é a barra de
   PV, até 0 px, enquanto a de PM fica inteira**. A ordem de sacrifício está
   invertida. O arco não cede nunca, e é isso que o anel resolve. *Se V4
   atrasar, isto conserta-se sozinho e é leve.*
2. **A agonia ignora `prefers-reduced-motion`.** `.tv-agonia` (`estilo.js:1171`,
   `infinite`) não aparece em nenhum dos dois blocos `reduce` (:1360, :1846).
   Mesmo sem `reduce`, pulsar enquanto se está grave pode durar dez turnos, e
   *o que se repete até cansar é defeito* (§2).
3. **A conta do telefone em `v1-jogo.md` §3 estava ~20 px otimista.** Contava
   a pílula em 146 **com** o glifo, mas medida hoje ela dá 145 **sem** glifo. É
   o mesmo erro de R13 (*uma conta que ninguém soma não está provada*). A
   conta de §4 abaixo parte das peças medidas.

**Os cinco segundos, no antes.** *Onde estou?* `Torre da Fonte` na legenda.
*Que horas?* `22:00`. *Quanto PV?* `14`, ou `4` a vermelho com a moldura.
*Quanto dinheiro?* `15`. **Quem do grupo está mal? Não se responde:** é
impossível a partir da tela principal, e mesmo aberta a sala são 2 toques e
meio ecrã de rolagem. **É esta a pergunta que V4 existe para responder.**

---

## 1 · O grupo num olhar — o que se lê, e por que ordem

*A régua de R13: fica sempre visível o que se usa para decidir enquanto se
decide.* Em cada turno o jogador pergunta, por esta ordem:

1. **Quanto PV eu tenho?** Anel do herói, que é o primeiro e o maior, com o número.
   Decide se arrisco.
2. **Alguém do grupo está mal?** Os anéis dos companheiros: comprimento
   primeiro, cor depois. Decide se paro, curo ou acampo.
3. **Há prazo, e quanto falta?** O selo dentro da pílula. Decide se tenho
   tempo para isto.
4. **Que horas são?** A hora na pílula, e a luz (o glifo) enquanto couber.
5. **Quanto dinheiro?** A bolsa, porque todas as ofertas da tela são em `◉`.
6. **Quanto PM?** Só se `oPMConta()`: é o que decide se lanço.

**A leitura segue o espaço.** À esquerda está *quem vocês são* (1, 2), ao
centro *o mundo* (3, 4) e à direita *o que se gasta* (5, 6). A ordem de
importância e a ordem de leitura coincidem da esquerda para a direita, e é
por isso que a composição da v3 está certa e fica.

| grupo | telefone (375) | mesa (1280) |
|---|---|---|
| **sozinho** (o jogo começa assim) | herói · `14` | herói · `Ilsa` / `14/14 PV`. **O grupo ocupa 0 px:** nada de "convide alguém", porque um lugar vazio a dizer que está vazio é mobília a mentir (R13 §2.7a) |
| **1** | herói · 1 anel de 28 | herói · 1 retrato com rótulo |
| **2** | herói · 2 anéis sobrepostos 8 | herói · 2 com rótulo |
| **3–4** | os anéis que couberem, e o resto no disco `+N` (§4) | os rótulos cedem do último para o primeiro, e o anel fica sempre (§4) |

**PM:** à direita, colado à bolsa, violeta (a cor da gaveta `✦`: o que se
gasta tem a cor de onde se gasta). **Só número.** O PM decide *"chego para a
Bola de Fogo (5)?"*, e o que se compara com um custo é um número, nunca um
comprimento; por isso a barra sai. O PM dos companheiros fica na sala Grupo,
porque na tela principal ele não é gasto pelo jogador.

**As condições:** na segunda fila, como hoje (72 px). Em 20 turnos de R6
aconteceram uma vez, num turno. As condições **dos companheiros**
(`tickCondicoes(g.condicoes)`, `App.jsx` ~:9176) não vão à cinta. Se sangram,
o que se vê é o anel a encurtar, e isso chega.

---

## 2 · O anel no momento

Nenhum destes estados atrasa a entrada: é tudo CSS sobre o anel, com
`pointer-events` intocados, e nada fica à espera de uma animação acabar.
**Uma ferida nova a meio de outra recomeça do comprimento atual**, sem fila.

| momento | o que o anel faz | quanto dura | `reduced-motion` |
|---|---|---|---|
| **Ferida agora** (PV desce, herói ou companheiro) | o arco **salta** para o comprimento novo, e o **pedaço perdido fica desenhado a `danger`** durante 250 ms e apaga-se em 500. É a *barra que atrasa* dos jogos de luta (convenção observada, não estudo), e o jogador **vê quanto perdeu** além de ver que perdeu. O clarão `tvDano` passa do bloco inteiro para **o anel só**. O retrato não treme, porque tremer move o alvo | 750 ms, o mesmo `feridaRecente` | o arco salta; o pedaço perdido aparece **parado** a `danger` 50 % e some por corte aos 750 ms. A informação fica e o movimento sai |
| **Cura** (PV sobe) | o arco cresce, 400 ms ease-out, sem clarão: curar não é interrupção | 400 ms | salta |
| **Entrar em Grave** (≤ 1/3) | **três pulsos** do aro (`MUDOU_AGORA`: 1200 ms × 3) e depois **repouso**. O que fica é o arco curto, a cor `danger` e o rosto *grave*. **Substitui o `tv-agonia` infinito** (defeito 2) | 3,6 s, uma vez por entrada em grave e outra a cada ferida nova enquanto grave | 0 pulsos |
| **Tombar** (`vida <= 0 \|\| morrendo`) | o arco esvazia em 400 ms, entra o traço, o rosto apaga-se e o aro dá três pulsos. **Fora da luta é raro**, e por isso mesmo não pode passar calado | 400 ms + 3,6 s | tudo por corte, sem pulsos |
| **Voltar da luta** | **nada.** A cinta está escondida durante a batalha (`!emBatalha`), e o `vidaVistaRef` segue o PV mesmo com ela escondida. O que aconteceu na luta foi visto na luta, e repetir o clarão ao voltar seria dizer duas vezes a mesma coisa | — | — |

**O herói perde a moldura vermelha do bloco inteiro** (`border: 1px danger`
quando grave): **o anel é a moldura.** Uma forma para o PV grave, não duas.

**O toque:**
- **o herói (anel e número)** → a ficha / o alforje, **como hoje**. A
  `MarcaDaPorta` e o `nomeDaPorta` não mudam. Custo de reaprender: zero.
- **um companheiro** → a sala **Grupo**, *já no cartão dele*
  (`scrollIntoView` no cartão, foco no nome). No telefone o alvo é o cacho, e
  ele abre **no primeiro companheiro em pior estado**, que é quem o disco ou o
  aro estava a assinalar. Até V7 a sala é `Gestão · Grupo`; em V7 passa a ser a
  entrada `Grupo` do trilho, e o toque é o mesmo.
- **Nome acessível do cacho:** `O grupo` → `O grupo — Tomé em perigo` →
  `O grupo — Ninha caiu`. É o mesmo padrão do `nomeDaPorta`, **sem
  `aria-live`**: o acontecimento já foi dito pela prosa.
- **Contado:** ler o PV do companheiro que está pior passa de **2 toques e
  ~600 px de rolagem para 0 toques** (o anel responde), e abrir o cartão dele
  passa de **2 toques + rolagem para 1 toque**.

---

## 3 · A pílula do tempo

`[glifo da luz] 22:00 · 14 de Brumal · [selo]` na mesa, e
`[glifo] 22:00 [selo]` no telefone. O glifo é a **luz** da gravura (as 4 de
`LUZ_DA_CENA`), para a pílula e o papel nunca discordarem da hora. **O toque
abre O TEMPO, como hoje.** A cor é `mundo` (a de V1). O `✓ guardado` continua
transitório por cima dela (R13).

- **Um prazo:** o `SeloDePrazo` de hoje, dentro da pílula.
- **Dois ou mais:** o selo mostra **o mais urgente** e ao lado vem `+N`, como
  já é. **Com uma mudança, que é a lei do ponto 4 do cabeçalho: o `+N` herda o pior
  do que esconde.** Se um dos escondidos também está na última noite, o `+N`
  sai de `inkDim` e passa a `danger`. Hoje dois contratos na última noite
  leem-se como *"um urgente e outro qualquer"*.
- **Entrar na última noite** (o selo enche): três pulsos `MUDOU_AGORA` no turno
  em que isso acontece, e depois fica cheio e parado. O cheio já é a forma (a
  6,34:1 do calmo). O pulso só serve para dizer *agora*.
- **Na mesa cabe tudo** (a pílula fica ao centro, como na v3). O que cede é
  do telefone, e está no §4.

---

## 4 · O telefone — o que cede, com números medidos

A 375 há **351 úteis** (375 − 2 × 12). Peças medidas hoje ou derivadas delas:
herói **60** (anel 40 + 4 + `14`) · anéis 28, sobrepostos 8 (n anéis =
28 + 20(n−1)) · disco **28** · pílula **145** (prazo + `+1`), **174** na
última
noite (`CINTA.tempoMaximo`), +20 com glifo · **coluna PM/bolsa 54** (`◉ 1.240`
por baixo de `◆ 120`) · espaços de 8 entre blocos, 4 entre herói e grupo.

**Por que a coluna.** Lado a lado, PM e bolsa custam 42 + 8 + 54 = **104**.
Nesse caso o pior caso calmo, **só com o disco**, dá 357 contra 351: **não cabe
nem com o grupo inteiro reduzido a um disco**. Em coluna custam **54**. Na
mesa ficam lado a lado, como na v3.

**A ordem de ceder (é minha, e a peça declara-a):**
1. **cai o glifo da luz** (−20): a gravura diz a luz logo abaixo;
2. **os anéis entram no disco**, do último para o primeiro, até restar só o
   disco `+N` (N = todos);
3. **na mesa**, antes de 1 e 2: **os rótulos** (nome + PV) dos companheiros,
   do último para o primeiro.

**Nunca cedem:** o anel e o número do herói, a bolsa, o selo e o seu `+N`, e o
número do PM quando conta.

| caso (375) | soma | folga |
|---|---|---|
| sozinha, sem prazo, com glifo e PM | 60 + 8 + 62 + 8 + 54 = 192 | 159 |
| 4 companheiros, 1 prazo (125; 145 com glifo) | 60 + 4 + 88 + 8 + 145 + 8 + 54 = 367 → **cai o glifo** e fica 347 | 4 → **2 anéis e o disco `+2`**: 327, folga **24** |
| **pior caso**: PM, 2 prazos, **última noite**, 4 companheiros, bolsa de 4 dígitos | 60 + 4 + 28 + 8 + 174 + 8 + 54 | **336 → folga 15** (≥ 7 ✓) |
| o mesmo, **a 320** (296 úteis) | 336 | **−40**: não cabe |

**A 320 não cabe, e a razão está escrita.** A 320 a barra de PV já hoje fica
em 0 px (medido), ou seja, esse telefone já perdeu o canal primário. Com a
peça nova o que se perde a 320 é **a palavra do selo cheio**: a palavra
`esta noite` (72 px) passa a **`hoje`** (≈ 29). É o mesmo facto numa palavra
curta, e vem de `palavraDoPrazo`, que é tabela, logo é médio: 336 − 43 = 293,
**folga 3**. É a folga mais apertada da casa, e só no pior caso do telefone
mais estreito. Registo-a como tal. **A 375 não se toca na palavra.**

**A prosa não perde altura:** a cinta fica em **48** (72 com estado vivo),
exatamente como hoje, nas duas telas. A régua é o topo do campo, **735 / 706,
±2**.

---

## 5 · O protocolo da prova jogada de V4

**Montagem:** a mesma do §0. O antes está em `base*.json`. O depois é a
árvore com V4, servida numa porta própria e aberta num separador novo (o HMR
engana), com `ORIGEM=http://localhost:<porta> SAIDA=depois.json node
base3.mjs`: as **mesmas sete cenas** (0 · 1 · 3 · 4 companheiros, a
sangrar, 1 prazo, 2 prazos) em **1280 · 375 · 320**, e mais `reduce`. **O
momento** (ferida, cura, entrar em grave, tombar) não se provoca sem o
Mestre. Prova-se num **harness do componente** com as props a mudar (o
precedente é `v3c-harness-guardado`), e nele escrevo durante a animação para
confirmar que a entrada nunca fica à espera.

**"Leu pior": basta um destes para V4 não fechar.**
1. **Os seis segundos** (os cinco de V1 mais um), diante de cada ecrã e sem
   procurar: *onde estou · que horas são · quanto PV tenho · **quem do grupo
   está mal** · quanto dinheiro · há prazo*. Uma resposta errada ou um segundo
   olhar é *leu pior*, e escrevo qual foi.
2. **Um perigo escondido:** um companheiro grave ou tombado que não aparece em
   lado nenhum da tela (nem anel, nem disco com o aro dele).
3. **A prosa perdeu altura:** o topo do campo difere mais de 2 px de 735 / 706.
4. **A cinta transborda:** `scrollWidth > innerWidth` em qualquer cena e
   tamanho, ou folga < 7 a 375 no pior caso.
5. **Um estado deixa de se distinguir** em cinzento ou em deuteranopia: calma
   contra grave (hoje ΔE 55,5 e cinzento 1,53), tombado contra grave, e o disco
   grave contra o disco calmo.
6. **Movimento:** qualquer animação a correr com `reduce` (hoje falha:
   `tvAgonia`); qualquer animação **infinita** sem `reduce`; uma tecla perdida
   durante os 750 ms.
7. **Toques:** a ficha a mais de 1, O TEMPO a mais de 1, o cartão do
   companheiro a mais de 1; um alvo abaixo de 48 × 48.
8. **Duas formas:** o PV do herói com barra **e** arco, ou o PM com barra.

**"É jogo", com o mesmo peso:** a cena de quatro, a 1280, lado a lado com o
antes. Se o depois me faz olhar primeiro para a Ninha a morrer e depois para a
história, isto é uma mesa com um grupo. O antes é uma folha com uma
personagem.

---

## 6 · A proposta ambiciosa: **o anel é onde se cuida**

**Hoje, curar um companheiro é trabalho de escrivão.** Primeiro abre-se a sala
para descobrir quem está mal (2 toques + rolagem), fecha-se, escreve-se
*"dou a poção pequena ao Tomé"* e espera-se que o Mestre perceba. **Não há
porta para o herói dar um consumível a um companheiro fora da luta.** A regra
existe (`usarConsumivel(ent, item)` aplica-se a qualquer ficha, e em luta os
companheiros já dão poções uns aos outros, `pocaoDeCompanheiro`, `App.jsx`
~:8732), mas o gesto não tem forma nenhuma.

**A proposta:** o toque no anel de um companheiro ferido (no telefone, no
cacho) abre, **por baixo da cinta e sem tapar o campo**, a *folha do
cuidado*: uma linha por companheiro com o anel, `Tomé · 3/10` e **a melhor
cura que o herói tem para ele, com o preço e o resultado antes do toque**:

`Poção pequena · 1 de 2 · → 5 a 9 PV` · `Cura leve · 3 PM · → 8 a 13 PV`

Um toque numa linha **é o turno**: a cura aplica-se pela regra, o anel cresce
e o Mestre recebe pela `pauta` dinâmica *"Ilsa deu a poção a Tomé: 3 → 8"*
(**nunca como bloco estático**). Em baixo, `Ver o grupo` leva à sala.

**Porque é a que faria o jogo ser lembrado.** A moldura de grupo onde se clica
para curar é o gesto de mesa de todo o RPG de grupo que a pessoa já jogou
(convenção observada nos quadros de grupo dos MMO, não estudo). E é **o
veredito antes do clique** a chegar à decisão que mais se adia: *"curo agora
ou guardo a poção?"* Contado: **de ~4 ações e uma frase escrita a esmo para
2 toques, com o preço à vista.**

**O que se arrisca:** (a) virar *point-and-click*. A catraca de R6, 15 de 20
turnos pelo campo, não pode cair, e a frase continua a poder fazer o mesmo;
(b) o preço mentir. O intervalo vem do dado da tabela (`CONSUMIVEIS[].dado`,
já usado por `melhorCuraPara`) e nunca de uma estimativa da tela.

**Precisa do sistema, e por isso vai como pedido:** `darConsumivel(heroi,
alvo, item)` puro (em cima de `usarConsumivel`), e `intervaloDaCura(item)` /
`intervaloDaHabilidade(comp, hab)`. Hoje `valorDaCura` sorteia com
`Math.random()` (`companheiros.js:181`), contra a lei do determinismo, e esse
já é um pedido leve por si. **Peso:** médio de design (é uma porta nova para
uma regra que existe, e um commit revertido desfá-la; o save não muda). **Não
vai a "Para a pessoa decidir"**: vai ao `regente`, como V4b, com o pedido.

---

*Figma: não compus o momento neste ciclo. As peças (`O anel` com os quatro
estados, o disco, o `Contador` em coluna) estão a ser fabricadas agora pelo
`desenho`, e compor antes delas seria desenhar a peça eu mesmo. Depois de
existirem componho três quadros na página `02 · Entrada`, ao lado de `132:2`:
a cinta de quatro a 1280, a de 375 no pior caso e a folha do cuidado.*
*Assina o momento: `jogo`, 25/09.*

---

## 7 · A prova jogada de V4 — o resultado (`jogo`, 25/09, tarde)

**Montagem.**
- ***Depois*** = a árvore do `oficial` na 5173 (não commitada), aberta num perfil
  novo de Chrome headless, com `/api` cortado (0 pedidos saíram) e o save injetado
  com o jogo desmontado.
- **O mesmo save e os mesmos grupos do §0**, mais uma cena `pior` (os quatro, com
  a Ninha tombada, e dois prazos), em **1280 · 375 · 320**, e `reduce`.
- **Os ficheiros**, no scratchpad `v4-jogo/`: `prova-depois.mjs` → `depois.json`,
  56 fotos em `fotos-depois/` (tela, recorte da cinta e o toque), e `gaveta.mjs`
  → `gaveta.json`.
- **O momento prova-se com as peças reais, sem gastar um cêntimo.** Um harness
  (uma cópia de `src/` da árvore servida à parte na 5178; a página, o script e o
  resultado ficaram em `v4-jogo/harness/`, com a cache do vite isolada para não mexer na da 5173) monta `Anel` e
  `SeloDePrazo` de `ui.jsx` e muda-lhes as props. Como o `Anel` vê-se a si mesmo
  (guarda a última vida que desenhou), a ferida de um turno real e a do harness
  **são o mesmo código**. O script é `momento.mjs` e o resultado `momento.json`.
- **Não joguei nenhum turno real: 0 chamadas ao `/api`, custo 0.**
- **Um limite honesto:** os `relogios` injetados não geraram prazo novo, e a
  pílula mostrou o contrato do próprio save (`6 noites`, e `+1` com dois). Por
  isso **`esta noite` / `hoje` e o `+1` a vermelho não foram vistos vivos por
  mim**; o `oficial` viu-os. O pulso da última noite está provado no harness.

### 7.1 · Os três achados do estudo

| achado (antes, §0) | depois | |
|---|---|---|
| **1 · companheiros na tela: 0 de N** em todas as cenas | **N de N.** A 1280 cada um tem anel, nome e `PV` (`Tomé 3/10 PV` a `danger`, `Ninha caiu` com o traço). A 375 os quatro anéis cabem **em todas as cenas, até na `pior`**. A 320 os anéis cabem com 0–4 companheiros e sem 2 prazos; com o aperto, fica o disco `+2` / `+4`, que **herda o pior**: aro `danger` com Tomé grave, e aro mais traço com Ninha caída | **passou** |
| **2 · a barra de PV encolhia a 3 px com um prazo e a 0 com dois (375), e a 0 a 320** | **Não há barra.** O anel do herói tem **40 px em todas as 24 telas** e o número está sempre lá (`14`, `4`). **0 barras de PV ou de PM na cinta**: o único fio encontrado é o sinal de guardado (375 × 1, `ok`). O PM é só número (`22 ◆`) | **passou** |
| **3 · `tvAgonia` corria sem fim, com `reduce` ou sem ele** | **0 animações a correr** nas 24 telas ao abrir, **incluindo a heroína grave a 1280 depois de 4 s sem `reduce`** (montar não é entrar em grave). Com `reduce`, na cena de quatro e na de sangue: 0 | **passou** |

### 7.2 · O momento, no harness (a prova que o `oficial` não podia dar)

| gatilho | sem `reduce` | com `reduce` |
|---|---|---|
| **ferida que entra em grave** (10 → 3) | `tvAnelPerdido` ×1 750 ms + `tvDano` ×1 750 ms + **`tvAgonia` ×3 de 1200 ms**; o pedaço perdido é desenhado (1 nó) e some antes dos 900 ms; **aos 4 s: 0 animações** | 0 animações; o pedaço perdido **aparece parado** e some por corte (a informação fica e o movimento sai, como o §2 pedia) |
| **ferida nova já em grave** (3 → 2) | **pulsa outra vez ×3**, e aos 4 s: 0 | 0 |
| **parado em grave durante 8 s** | **0** (acabou o pulso infinito) | 0 |
| **cura** (2 → 8) | uma transição de 400 ms no arco, sem clarão | 0 |
| **tombar** (8 → 0, `morrendo`) | perdido + dano + **`tvAgonia` ×3**; o traço aparece; aos 4 s: 0 | 0, com o traço |
| **entrar na última noite** (selo 2 → 1) | **`tvMudouAgora` ×3 de 1200 ms**; aos 4 s: 0. De 3 para 2: nada | 0 |
| **escrever durante a ferida** | **20 letras em 974 ms, 20 chegaram** ao campo | 20 de 20 |

**O pulso de três vezes só nasce ao entrar em grave, com uma ferida nova ou ao
tombar, e acaba.** Está provado nas peças que a cinta usa.

### 7.3 · Os oito critérios de "leu pior" (§5)

| # | critério | resultado |
|---|---|---|
| 1 | **os seis segundos** | **passou** (7.4) |
| 2 | **um perigo escondido** | **passou**: em nenhuma das 24 telas um grave ou um tombado deixa de ter anel ou disco com o aro dele (`pior-320`: `+4` com aro e traço) |
| 3 | **a prosa perdeu altura** | **passou, 0 px**: o topo do campo fica em **735 / 706 / 623** em todas as cenas, igual ao antes |
| 4 | **a cinta transborda** | **passou**: `scrollWidth` = largura nas 24 telas e na linha da cinta, a 320 incluída |
| 5 | **os estados em cinzento e em deuteranopia** | **passou**. Calma × grave é **comprimento primeiro**; a cor (âmbar × `danger`) dá ΔE 55,5, **34,8 em deuteranopia** e 1,52:1 em cinzento (o ciano da v3 dava 1,25, e o 142:2 escreve o mesmo número). Tombado × grave é **forma**: sem arco, com traço e com o rosto apagado. O disco grave × calmo também é **forma**: aro presente ou ausente, e o aro `danger` sobre `panelSoft` dá 5,66:1 |
| 6 | **movimento** | **passou** (7.2): 0 com `reduce`, 0 infinitas, 0 teclas perdidas |
| 7 | **toques e alvos** | **passou**: a ficha e O TEMPO a 1 toque; o cartão do companheiro a **1 toque** (era 2 mais rolagem). **Os alvos têm todos 48 de alto**: herói 57–112, tempo 55–293, companheiros 74–98 na mesa, cacho 48–88 no telefone. Com um só item o cacho mede 28, mais 12 + 8 invisíveis, o que dá 48 |
| 8 | **duas formas** | **passou**: o PV do herói é só anel (e número), o PM é só número; a moldura vermelha do bloco saiu |

### 7.4 · Os seis segundos — em especial *quem do grupo está mal?*

Diante de `quatro` e `pior` (1280, 375, 320), sem procurar:

- **onde estou** → `TORRE DA FONTE` (o cabeçalho de V5a);
- **que horas** → `22:00`;
- **quanto PV** → `14` / `4` a vermelho, e o anel;
- **quanto dinheiro** → `15 ◉`;
- **há prazo** → `6 noites +1`;
- **quem do grupo está mal?**
  - **1280:** **o nome inteiro, sem toque**: `Tomé 3/10 PV` a vermelho e `Ninha caiu` com o traço. **Antes era impossível**: 2 toques e ~600 px de rolagem.
  - **375:** **à primeira**, vê-se *que* há um grave (o arco curto e vermelho no segundo anel) e uma caída (o traço no quarto). O *nome* não se lê a 28 px, mas a posição é a de entrada, sempre a mesma, e o toque no cacho **abre já no cartão da Ninha** (a caída passa à frente do grave), com o foco no cartão. O nome acessível diz `O grupo — Ninha caiu, Tomé em perigo`.
  - **320 com aperto:** `+4` com aro e traço diz **"alguém caiu"**, e um toque abre a Ninha.

**Seis respostas à primeira nas três larguras.** A do grupo é completa na mesa, e no telefone está a um toque do nome. **É esta a pergunta para que V4 existia, e agora responde-se.**

### 7.5 · Lado a lado com o `126:6` (e o `142:2` do `desenho`, conferido)

Comparei o `126:6` (1280 × 66) com o meu recorte `pior-1280-cinta.png` e com a
captura do `desenho` no `142:2`. **A composição é a dela**:
- à esquerda, *quem vocês são*: anéis com nome e PV em duas linhas, e fios entre retratos;
- ao meio, *o mundo*: a pílula de fio ciano;
- à direita, *o que se gasta*: número primeiro, glifo depois.

**Os quatro desvios do `142:2`, conferidos:**

| desvio | medido | confere |
|---|---|---|
| **66 → 48 de altura** | cinta 48 (72 com estado vivo), campo em 706 igual ao antes | sim |
| **o anel âmbar, não ciano** | cinzento 1,52 contra 1,25 (calculei-o de novo a partir de `T`) | sim |
| **HP → PV** | `14/14 PV`, `3/10 PV`, `caiu` | sim |
| **a coroa no SEU herói** | a coroa âmbar no canto de cima da Ilsa, sem sair dos 48, e a marca da porta no de baixo | sim |

**Três desvios que o `142:2` não escreve** (nenhum bloqueia):

1. **O nome em Spectral 12, não em Inter Bold 12.** O `get_design_context` do
   `142:15` diz `Inter:Bold 12 #EAE4D6`, e a casa não tem Inter. Em serifa, a 12
   sobre `panel`, lê-se um pouco mais mole que no Figma. O `PV` fica em **12** e
   não nos **9** do Figma: aqui o desvio **lê melhor** (9 px está abaixo do piso da casa).
2. **A pílula não fica ao centro fixo:** anda com o tamanho do grupo (x = 562
   sozinha, 629 com um, 812 com quatro). **Não pode ser de outra forma**: com
   quatro rótulos o grupo acaba em x = 624, e a pílula de 293 centrada em 640
   bateria nele. Fica ao centro do espaço que sobra. Mexe só quando o grupo muda,
   o que é raro, e aceito-o.
3. **O traço de tombado no disco `+4` a 320 risca o número.** Lê-se, mas um
   número riscado pode ler-se como "nenhum". Peço ao `desenho` que o traço passe
   por trás do texto, ou fique só no aro. É forma dele, e fica para V4b.

### 7.6 · O senão da gaveta a 1280 — **lê pior, sim**

Medido (`gaveta.json`), com o toque em `Tomé` e quatro companheiros:

| | 1280 | 375 |
|---|---|---|
| a gaveta rola até | `scrollTop 699`, o cartão **encostado ao topo** (0 px) | o cartão no meio (y 461 de 812) |
| o título `Gestão` e o `✕` | **saem de vista**: estão dentro do que rola (`Gestão` em y 28 do conteúdo, `✕` em 20) | **ficam**: moram fora do que rola |
| as sub-abas | saem de vista | saem de vista |

**Porque lê pior:** a 1280 o jogador chega a um cartão sem saber em que sala
está, e **o botão de fechar desapareceu**. A 375 o título e o `✕` ficam. É a
mesma gaveta com duas composições, e a da mesa é a que perde.

**O conserto, e `scroll-margin-top` sozinho não chega:** o cabeçalho está
**dentro** do que rola. Uma margem de rolagem deixaria à vista o fim do cartão
anterior, não o título. O conserto são duas linhas de forma, dentro da gaveta:
1. **o cabeçalho da gaveta na mesa (título, `✕` e sub-abas) em
   `position: sticky; top: 0`**, com fundo, como já é a composição do telefone.
   Uma gaveta, uma composição;
2. **`scroll-margin-top` no cartão = a altura desse cabeçalho** (medido:
   sub-abas em y 68 → ~100 px) **+ 16 de ar**, para o foco não nascer colado nem
   debaixo dele.

Não mexe no fluxo nem no toque: é **leve**, e pode ir com V4 ou logo a seguir.

### 7.7 · O que mudou para quem joga, em número

- **companheiros na tela principal: 0 → todos** (1280 e 375; a 320 com aperto, um disco que herda o pior);
- **ler o PV do companheiro pior: 2 toques + ~600 px de rolagem → 0 toques** na mesa (o rótulo diz `3/10 PV` / `caiu`); no telefone, **o estado a 0 toques** e o cartão a **1**;
- **abrir o cartão de quem está mal: 2 toques + rolagem → 1 toque**, já no cartão dele, com o foco;
- **a vida do herói deixou de poder desaparecer**: de 3 px / 0 px com prazo para um anel de 40 px em todas as telas;
- **o pulso de agonia: infinito, e surdo ao `reduce` → 3 pulsos ao entrar em grave, com uma ferida nova ou ao tombar, e 0 com `reduce`**;
- **a prosa: 0 px perdidos** (campo em 735 / 706 / 623, igual ao antes);
- **o PM: de barra de 56 px para um número**.

### 7.8 · Veredito

**Sobe com um conserto: o cabeçalho da gaveta em `sticky` na mesa, mais
`scroll-margin-top` no cartão (§7.6).** O conserto é leve e não bloqueia a subida de V4. Se couber
no mesmo commit, melhor; senão, é o primeiro item de V4b, junto do traço sobre o
`+4` (§7.5-3).

Joguei as cenas de quatro lado a lado. No antes olho para a heroína de PV cheio e
leio a história **sem saber que a Ninha está a morrer**. No depois, o primeiro
olhar vai ao traço sobre o anel dela e à palavra `caiu`, e só depois à prosa. **O
antes é uma folha com uma personagem. O depois é uma mesa com um grupo.**
