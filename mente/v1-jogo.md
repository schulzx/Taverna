# V · a tela da v3, jogada antes de construída (`jogo`, 24/09)

*A pessoa desenhou a tela que quer — Figma `ffWFqD7TueSb88Mkeg9bhW`, quadro
`126:5` · `taverna-gameplay-v3` — e ela passa a ser **a direção** da tela de
jogo. Isto é o plano jogável da fase: o que a v3 é, o que lhe falta para ser o
jogo inteiro, como ela cabe no telefone, por que ordem se constrói, o que nela
joga pior, e como provo a primeira etapa. O orçamento está desenhado no mesmo
arquivo, página `02 · Entrada`, secção `V · o plano jogável da v3` (`132:2`):
três telas 1:1 em faixas medidas, e **cada coluna soma a altura do ecrã**
(812 · 812 · 800), que é a catraca que R13 aprendeu a custo.*

**A forma é do `desenho`; o momento é meu.** Onde isto disser "peça", é
pedido ao `desenho` (§6), não desenho meu.

---

## 0 · A v3, conferida — seis coisas que a leitura do `regente` não tinha

Li o quadro por `get_design_context` e medi a letra no próprio Figma (nós de
texto temporários, apagados).

1. **O "d20" é um d6.** O botão de enviar desenha o `dice-6` do Lucide — um
   cubo com seis pintas. O Lucide não tem d20; **o glifo é peça a desenhar**
   (§6). *Num jogo em que o dado é a promessa, desenhar o dado errado é o
   primeiro sítio onde o jogador de mesa repara.*
2. **A prosa tem 137 caracteres por linha.** A linha de corpo mede **1 086 px**
   em Cormorant Garamond 20, e a letra mede **7,90 px por carácter** → **137,5
   car.** O teto da WCAG 1.4.8 é **80**; Bringhurst (*The Elements of
   Typographic Style*, §2.1.2) pede 45–75, com 66 como ideal. **É o maior defeito
   de leitura da v3**, e a casa já o tinha resolvido: a coluna de 65ch
   (`tv-coluna`). A 65ch, Cormorant 20 dá **513 px** de coluna.
3. **Nove textos abaixo do piso.** PV a 9 px, rótulos do trilho e etiquetas a
   10, a pílula a 11. `TIPOS.piso` é 12, e a catraca D5g congela a dívida. A v3
   entra no piso ou não entra (é do `desenho` em V1).
4. **`HP`** — o jogo diz **PV** em todo o lado. Uma palavra, duas línguas.
5. **O cabeçalho e a gravura dizem o mesmo facto.** A v3 tem cabeçalho de 72 px
   (etiquetas + runas); a casa tem o rosto da cena de 96 px (R13-B), cuja
   `Legenda` já escreve **o lugar à esquerda e a palavra da luz à direita** —
   exactamente a gramática das etiquetas da v3. Empilhados custam **168 px**;
   pela lei da aposentadoria (`formas.md` §20) fundem-se em **96** (§1).
6. **Três peças da v3 são defeitos que a casa já aposentou ou proibiu:** a
   **caneta** à esquerda do campo é o `IconeBalao` que R17 tirou (*um campo não
   precisa de um ícone a dizer que é campo* — custava 56 px ao telefone); o
   **pé com as barras** âmbar/ciano são **68 px** que não dizem nada (R13
   §2.7a: *região que reserva espaço para nada é mobília a mentir*); e o
   **`Herói` aceso no trilho** com nenhum painel aberto é uma seleção que
   mente.

**Nada disto desdiz a direção.** São os sítios onde a v3 está desenhada para a
fotografia e não para o turno — e é para isso que a mesa existe.

---

## 1 · As etiquetas passam a ser de mundo

`REVELAÇÃO · O CREPÚSCULO ESTÁTICO` nomeia a subestrutura e a verdade eleita —
**o que o Narrador nem vê antes do turno da revelação**. `ATO I · CENA IV`
conta a estrutura do diretor de histórias. As duas são bastidor, e a primeira
é *spoiler*. **A forma fica; o conteúdo passa a ser o do mundo.**

**Decisão: o cabeçalho da v3 É o rosto da cena.** A gravura (96 px, fixa, por
semente) é o corpo do cabeçalho; as etiquetas são a `Legenda` dela, na
tipografia da v3; a runa âmbar·ciano·rosa é **a borda de baixo da gravura**
(0 px). **−72 px** contra empilhar, nas duas colunas, e uma peça só a dizer
onde e quando.

| ponta | conteúdo exato | de onde sai (existe hoje) | como se degrada |
|---|---|---|---|
| **esquerda** (etiqueta forte, caixa alta espaçada) | **o lugar**: `ERMIDA DE PEDRA` · `A CAMINHO DE VALDORA` · na masmorra, o nome dela | `lugarDaCena()` (`App.jsx` ~l.7621) — a mesma função que já entra na semente da gravura | **trunca primeiro** (a regra da `Legenda` de hoje: trunca o lugar, nunca a hora) |
| **direita** (etiqueta calma) | **a luz e o ar**: `ENTARDECER · CHUVA FINA`; na masmorra, `CAMADA 2 · 3 TOCHAS` | a palavra da luz = `g.luz` da gravura (as 4 receitas de `LUZ_DA_CENA`, a mesma que pinta a gravura — **nunca discordam**); o clima = `climaRef` (`rotulo`); camada e tochas = `cabecalhoDaCena().onde` (`src/palco.js`) | cai o clima, **nunca** a luz |

- **A cor da etiqueta do lugar é a do mundo, não o âmbar.** A v3 pinta-a de
  âmbar. R11 deu ao `mundo` uma região — relógio, data, estação, **lugar**, a
  espera — para tirar ao âmbar 5 dos seus 24 sentidos. Pintar o lugar de âmbar
  desfaz R11. *(Pedido ao `desenho` em V1, §6.)*
- **A chegada marca-se na etiqueta do lugar**, com o eixo `Chegada` que a
  oferta já tem — *decai por turno, nunca por relógio*. A prop já vai na
  chamada (`chegada=` em `OTopoDoPapel`) e é inerte à espera da peça.
- **As tochas na masmorra são a única coisa da etiqueta que decide turnos** (a
  tocha é recurso lá em baixo). Por isso a direita, no subterrâneo, troca o ar
  (que lá não há) pela camada e pelas tochas.
- **O `CabecalhoDaCena` de v9.157** (`App.jsx` ~l.1250, cartão com emoji, lugar,
  entorno e momento *dentro da área que rola*) **aposenta-se** na mesma etapa:
  é a terceira peça a afirmar o mesmo facto.

**A pílula `⏱ 2h 15m`.** Tempo de sessão é bastidor, e é o relógio errado: os
prazos, o acampamento e a espera dependem **da hora do mundo**. A pílula passa
a ser **o alvo do tempo de R13**, na forma da v3:

`[glifo da luz] 18:40 · 3.º de Brumal · [selo: 3 noites]` — o dia só na mesa;
no telefone `[glifo] 18:40 [3 noites]` (146 px medidos, = `CINTA.tempo`).
O toque abre **O TEMPO** (acampar, esperar, calendário, prazos — R13 §2.6, sem
mudar o conteúdo). O alfinete sai com o lugar. O glifo é o da **luz** da
gravura (4, não os 6 `MOMENTOS`): a pílula e o papel nunca discordam da hora.

---

## 2 · O momento de DECIDIR, traduzido para a v3

*A v3 mostra o momento de ler. O jogo também é o de decidir, e nada disto se
corta — muda de morada. A régua de R13: **fica sempre visível o que se usa
para decidir enquanto se decide; o que só importa quando muda, chega quando
muda.***

| o que | onde mora na v3 | com que peça | quando aparece |
|---|---|---|---|
| **A soleira** (ofertas — 990 ms contra 10,7 s por frase) | **o pé do cartão**, por baixo de uma runa, colado ao compositor. Mesa: lado a lado (R13, 62 px); telefone: 1 + `+N` | `Oferta` / `Soleira` (existem) | só com oferta; **0 px sem ela** — o pé decorativo da v3 morre aqui |
| **As habilidades** (a gaveta `✦`) | **no lugar da caneta**: à esquerda, dentro da pílula do campo. Mesa: sempre. Telefone: só com o campo aberto, na 2.ª linha (lei de R17: *uma linha estreita leva um alvo fixo além do que cresce*) | a gaveta `✦` de W1 (existe) | como hoje. A borda do campo em violeta **já é** o sinal de habilidade armada — a v3 pintou-a violeta por acaso e acertou |
| **A linha do veredito** | **uma linha por cima da pílula do campo**, dentro da faixa do compositor | a `Linha do veredito` da batalha (existe, `painel-batalha.jsx`) — **a mesma peça, fora da batalha** | **só quando há veredito**: o teste pendente (`Teste de Força · dif. 12 — motivo`), o preço da frase (R23 quando nascer). 0 px sem ele |
| **Os prazos** (R21: o que se esconde, esquece-se) | **o selo dentro da pílula do tempo** | `O selo de prazo` (R13, existe) | sempre que há prazo; **enche** na última noite (forma, não cor: 6,37:1) |
| **O PV do herói** | **o anel** à volta do retrato — o comprimento do arco é o canal primário (R9), a cor o segundo; número ao lado | `O anel` (**peça nova**, §6) | sempre |
| **O PM do herói** | **à direita da cinta, ao lado da bolsa**: *à esquerda quem vocês são, à direita o que se gasta*. O `◆ 85` da v3 chama-se `mana-essence` na camada — é ele | `Contador` (§6) | só quando `oPMConta()` — a regra de R13 (volta sozinho ao primeiro ponto gasto) |
| **A essência de forja** | **não vai à cinta**: decide 0 turnos nesta tela; mora na Bolsa, onde se forja | — | — |
| **As condições** (`Exausto` decidiu um turno inteiro em R6) | mesa: **selos ao lado do bloco do herói**, na mesma linha (há ~500 px livres na cinta). Telefone: a cinta cresce para 72, como hoje | `Selo de estado` (existe) | enquanto durarem; **nunca recolhem** |
| **O rosto da cena** (xilogravura, 96 px) | **é o cabeçalho do cartão** (§1) | `RostoDaCena` + a `Legenda` da v3 (§6) | sempre; muda só com o lugar |
| **O grupo** | os anéis dos companheiros, a seguir ao herói | `O anel`, tamanho menor | sempre que há grupo; **cedem primeiro** no telefone (§3) |
| **✓ SALVO** | transitório, sobre a pílula do tempo (R13 §2.3.5) | o que já existe | ao gravar |
| **A voz do Mestre a preparar** (os 10,7 s) | no topo da prosa nova, como hoje | `Voz` · `preparando` (existe) | durante a espera. *Se o `desenho` quiser as barras do pé da v3, o único emprego honesto delas é este — e substituem o `PontoMestre`, não se somam* |

**O dado e o teste pendente — a costura que a v3 abre sem saber.** Hoje, com
um teste pendente, a tela mostra um cartão por baixo do compositor com o botão
**`Rolar d20`** (`App.jsx` ~l.23950). Com a v3, o jogador veria **dois dados
âmbar ao mesmo tempo, para dois actos diferentes** — o de enviar e o de rolar.
*A mesma forma com dois sentidos é a outra cara da doença de "uma acção, duas
formas".* **Decisão: o dado da v3 é o único gesto que compromete o turno.**

| estado do dado | quando | o que faz | movimento |
|---|---|---|---|
| **Repouso** — contorno âmbar, glifo apagado | campo vazio | foca o campo (pegar no dado é começar a jogada) — **nunca um botão morto** | nenhum |
| **Pronto** — cheio, com o brilho da v3 | à primeira letra | envia (= `Enter`; `Shift+Enter` quebra — **lei de R13 §2.8, intocada**) | o enchimento em 120 ms; nada em `reduced-motion` |
| **Lançado** | ao enviar | — | um quarto de volta, **≤ 300 ms**, nunca bloqueia; nada em `reduced-motion` |
| **À espera** | o Mestre a escrever | desactivado **com o texto lá** (a recusa é uma espera, e uma espera mostra-se — R17) | nenhum |
| **Rolar** — cheio, com a dificuldade na face (`12`) | teste pendente | **abre o véu do dado** (o `OverlayDado` de hoje, intocado) | os três pulsos de `MUDOU_AGORA` e pára |

O cartão do teste **perde o botão e fica como linha do veredito**; o `Rolar
d20` aposenta-se. O teste passa do centro-baixo para **o sítio do polegar e do
olho que acabou de escrever**. *O executor confere o que `partirOTurno` faz com
um teste pendente: se já recusa, o campo fica em repouso só de leitura
("Role o dado…"); se não recusa, é defeito a abrir.*

**O trilho (mesa) e o alforje (telefone) — as mesmas salas.** A v3 troca
`GESTÃO` por **Herói** e **Grupo**, e acrescenta **Ajustes**. As dez sub-abas
de Gestão (`src/abas.js`, `SUBS_GESTAO`) não podem perder a porta — em R21 o
Mercado só se abriu por Gestão. Proponho o reagrupamento que a v3 sugere, **sala
a sala pelo que o jogador vai lá fazer**:

| entrada | sub-abas | toques até lá (hoje → v3) |
|---|---|---|
| **Herói** | Ficha · Talentos | 1 → 1 |
| **Grupo** | Grupo · Pessoas · Guilda · Correio | 2 → 1 (Grupo), 2 → 2 (resto) |
| **Diário** | Diário · **Mural** *(as missões que tenho e as que posso tomar)* | Mural 2 → 2 |
| **Bolsa** | Bolsa · **Mercado** *(o que levo e onde o troco — vender lendo a própria bolsa)* | Mercado 2 → 2 |
| **Mapa** | Mapa · Domínios · Diplomacia | 2 → 2 |
| **Códice** | — | 1 → 1 |
| *(Ascensão)* | — aparece ao despertar, como hoje | 1 → 1 |
| **Ajustes** | `Rolagens visíveis`, `Início`, exportar save — **o que é sessão e não cena** sai da ficha do herói | 2 → 1 |

**Nenhuma sala fica mais longe; duas ficam mais perto.** As portas `▸` da prosa
(`abrirPortaDoSistema`) apontam para a nova casa de cada uma. **Um nome só**:
`Códice` (a palavra portuguesa, a da v3) em todas as telas e portas de uma vez
— a catraca é zero `Códex` visível depois. **O trilho só acende uma entrada com
o painel dela aberto.** O retrato do herói continua a ser a porta da ficha (R13,
R21) — e no telefone, a única.

**Mesa: o painel não tapa a história.** A 1280, cartão de 1 142 px e coluna de
513: sobram ~600 px de margem. Ao abrir um painel (~420 px) a coluna **desliza
para a esquerda** e continua inteira (1280 − 90 − 420 = 770 ≥ 513 + 40). Ler e
gerir lado a lado — o que R21 deu ao telefone com a faixa que espreita, a mesa
ganha inteiro. 180 ms, corte seco em `reduced-motion`.

---

## 3 · O telefone — a v3 derivada, 375 × 812

*Não há v3 de telefone, e foi o telefone que motivou tudo. Mesmos componentes,
outra composição, sobre a estrutura que R21 provou.* Figma: `132:4` (com
oferta) e `132:22` (sem).

```
┌──────────────────────────────────────┐
│(◯42)◯◯  [☾ 18:40 · 3 noites]  ◉1.240 ◆12│  48  A CINTA — 72 com estado vivo
├──────────────────────────────────────┤   8
│ ░░ gravura ░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ERMIDA DE PEDRA        ENTARDECER · ☂ │  97  O ROSTO É O CABEÇALHO
│─ · · · ──────────── runa na borda ───│
│ Pieri Sem Medo não voltou, mas o      │
│ convite dele está entre você e o …    │ 484  A PÁGINA  (577 sem oferta)
│                                       │
│─ · · · ──────────────────────────────│
│ [ Oferta · ◉205 · +166 XP · 2 h ] +1 │  93  A SOLEIRA no pé (0 sem oferta)
└──────────────────────────────────────┘   9
│ ( O que você faz? Fale, aja, e… ) (◈) │  73  O COMPOSITOR — o dado à direita
└──────────────────────────────────────┘      = 812
```

**A cinta a 375, medida** (JetBrains Mono 12 no Figma): herói 40 + PV `42` (~16)
+ dois companheiros de 28 sobrepostos 8 (48) ≈ **118** · pílula **146** · `◉
1.240` 54 + `◆ 12` 32 + 12 ≈ **98** · 2 × 8 entre grupos. **Pior caso
(conjurador, dois companheiros, prazo) = 378 contra 351 úteis — não cabe por
27.** A peça diz como cede, e a ordem é minha:
1. **cai o glifo da luz na pílula** (−20; a gravura diz a luz logo abaixo);
2. **os companheiros juntam-se num disco `+2`** (−20; o PV deles decide na
   batalha, que tem tela própria — fora dela não mediu uma decisão em R6 nem
   em R21);
3. **nunca cai** o PV do herói, a bolsa (lei de R13) nem o selo de prazo.
Com 1 e 2: **338, folga 13** — a mesma folga que a cinta de hoje (12). Sem PM
(guerreiro), cabe inteira com glifo e companheiros.

**A conta, contra os números da casa** (página = o rolador inteiro, linhas =
página ÷ entrelinha, o método de R13/R21):

| | R12 (antes) | R13 A+B | R21 (hoje) | **v3 telefone** |
|---|---|---|---|---|
| página com 1 oferta | 151 | 407 | 475,7 | **484** |
| % do ecrã | 18,6 % | 50,1 % | 58,6 % | **59,6 %** |
| página sem oferta | — | 490 | 568,8 | **577** (71,1 %) |
| caracteres à vista, com oferta | — | — | ~682 (Spectral 17, 40ch) | **~580** (Cormorant 20/32) · **~716** (Cormorant 18/28,8) |

**A v3 no telefone não ganha página — empata (+8 px).** O que ganha é cara: os
anéis, a gravura a fazer de cabeçalho, o dado. **E a letra decide se lê pior:**
Cormorant 20 perde **15 %** de texto à vista; Cormorant 18 ganha 5 %. É por isso
que a letra sobe na sequência (§4).

**O trilho vira o alforje, como R21 já o fez** — e passa a ter **as mesmas
entradas** que o trilho da mesa (§2). Sete rótulos a 12 px pedem ~354 px contra
351: **`Ajustes` sai da fita e vai para o cabeçalho do alforje**, ao lado de
`Fechar` (é a sala menos visitada e não é cena); as seis restantes cabem com
rótulo a partir de 339 px (`ALFORJE.larguraParaSeisRotulos`, já medido).

---

## 4 · A sequência da fase — reordenada, e porquê

A do `regente`: V1 folha → V2 ícones → V3 letra → V4 mesa → V5 telefone → V6
anéis. **Mudo três coisas.**

1. **A letra sobe para V2.** Cada etapa depois dela gasta um orçamento de
   altura, e **é a letra que decide o orçamento** (15 % de texto a menos ou 5 %
   a mais no telefone). Medir a letra depois de compor a página é compor às
   cegas.
2. **O telefone deixa de ser etapa.** *Mesmos componentes, outra composição*
   quer dizer que cada componente nasce com as duas composições e se prova a
   375 e a 1280 **na mesma versão**. Uma etapa "telefone" no fim constrói tudo
   duas vezes e deixa o aparelho que motivou a fase duas versões atrasado.
3. **Os anéis sobem de último para quarto.** São a peça que mais diz *jogo* da
   v3 inteira — a moldura de grupo de todo o RPG que a pessoa já jogou — e a
   cinta já existe (`ACinta`): é trocar a barra pelo arco. Deixá-los para o fim
   é guardar o melhor para quando a fila tiver parado.

| | etapa | o que muda para quem joga | a prova que cobro |
|---|---|---|---|
| **V1** | **a folha** (paleta, tokens, piso 12) — *o `desenho`, agora* | a tela veste as cores da v3 sem mudar de lugar nada | o protocolo do §9 |
| **V2** | **a letra medida** — Cormorant 20/1,6 · 20/1,5 · 18/1,6 contra Spectral 17, telefone e mesa | a prosa ganha a voz da v3, ou fica a que lê melhor | caracteres à vista ≥ hoje −5 % no telefone; 65ch na mesa; eu leio uma cena de noite e uma de dia em cada candidata e escrevo qual canso primeiro |
| **V3** | **os ícones da tela** (~20: os 8 do trilho, o d20, as 4 luzes, `◉`, `◆`, `✦`, a coroa) | os emoji do SO saem da tela principal (paga R8 aqui) | zero emoji na tela principal (varredor); o d20 é um d20 |
| **V4** | **a cinta com anéis** — herói, grupo, pílula do tempo, bolsa, PM | o grupo inteiro vive no topo; a hora do mundo no centro | a conta do §3 medida no DOM (folga ≥ 7 a 375 no pior caso); PV grave distinguível em cinzento e deuteranopia; o toque na pílula abre O TEMPO |
| **V5** | **a página** — o rosto é o cabeçalho, coluna 65ch, soleira no pé, a abertura grande | a história ganha a moldura da v3 sem perder uma linha para o enfeite | página ≥ 484 (telefone, 1 oferta) e ≥ 440 (1280×800, 1 oferta); zero `CabecalhoDaCena` velho; `ink`×página ≥ 10:1 com o gradiente da v3 por cima |
| **V6** | **o compositor e o dado** — os cinco estados, `✦` no lugar da caneta, a linha do veredito por cima | o turno parte do dado; o teste rola do mesmo sítio | `Enter`/`Shift+Enter` intactos; **um** dado na tela em qualquer instante; o `Rolar d20` aposentado; 15 de 20 turnos ainda pelo campo (a catraca de R6) |
| **V7** | **o trilho e as salas** — v3 na mesa, o alforje com as mesmas entradas, o painel ao lado da história | as salas reagrupadas; ler e gerir lado a lado na mesa | a tabela de toques do §2 contada à mão; nenhuma sub-aba sem porta; zero `Códex` visível |

**A abertura grande (Cormorant 28) tem dono:** é **cerimónia** (`TIPOS.display`
existe para "a cerimónia, e só ela"). Acontece no **turno da chegada** (o eixo
`Chegada` que já decai por turno) e na **primeira resposta da sessão** — que é
onde 10 das 21 respostas de R6 abriam com o lugar. **Em todos os turnos custaria
~61 px** (um parágrafo de 30 palavras: 4 linhas a 37,8 contra 2,8 a 32).

---

## 5 · O que da v3 joga pior — com número, e a versão no mesmo estilo

| pedaço | o número | a versão que joga melhor |
|---|---|---|
| **a prosa de parede a parede** | **137 car./linha** (WCAG 1.4.8: ≤ 80) | coluna de 65ch = 513 px ao centro do cartão; a margem é luz |
| **cabeçalho + gravura empilhados** | 168 px | fundidos: 96 (§1) |
| **o pé decorativo** | 68 px em todos os turnos, para nada | é o pé da soleira; 0 sem oferta |
| **a letra, na mesa** | a 1280×800 a v3 composta mostra **~894 car.** com oferta contra ~1 122 hoje (**−20 %**); sem oferta 1 078 contra 1 265 (−15 %). O preço é a letra: **252,8 px² por carácter contra 211,4** (Spectral 17/27,6), +19,6 % | V2 mede 1,6 contra 1,5 (a WCAG 1.4.8 pede ≥ 1,5): 20/1,5 recupera 6 %. *Aceito o resto como o preço de uma letra que se vê — desde que a resposta inteira do Mestre caiba na página sem rolar, que é o que V2 mede* |
| **o dado a enviar** | dois dados âmbar com um teste pendente | um dado, cinco estados (§2) |
| **o d20 que é um d6** | — | glifo desenhado |
| **a caneta** | 56 px no telefone, aposentada em R17 | o lugar é da gaveta `✦` |
| **o trilho de 90 px** | **custa 0 à prosa**: a coluna é 65ch; o cartão sobra-lhe a 1280 (1 142) e a 768 (646 ≥ 553) | fica. É a v3 a acertar |
| **`Herói` aceso sem painel** | uma seleção que mente | só acende com o painel aberto |
| **`HP`, 9–11 px** | 9 textos abaixo do piso | PV, 12 |
| **o lugar e a pílula em âmbar** | desfaz R11 (o âmbar volta a 24 sentidos) | o mundo tem a sua cor (V1) |

**O dado sabe-se que envia?** Não há estudo que eu possa citar; há a
**convenção observada** do botão à direita do campo de mensagem (as aplicações
de conversa do telefone) — escrevo-a como observação. O que não depende dela: o
dado **acende à primeira letra** (a mudança liga o botão ao texto no instante em
que se escreve), o nome acessível é `Agir` / `Rolar o dado`, e o `Enter` manda
como sempre. **Prova em V6:** jogo 20 turnos e conto os envios por `Enter`
contra os por toque; um jogador que hesite no dado vê-se no toque que não vem.

**A coroa** marca **o seu herói** (em sala, cada um vê a coroa no seu). Não é
liderança — o jogo não tem essa regra, e uma coroa que sugere uma regra que não
existe é o sistema a falar de uma coisa que não é.

---

## 6 · As peças que peço ao `desenho` (eu não as desenho)

**Para V1, agora — decisões de cor que o momento exige:**
- **o mundo tem cor própria** (lugar, pílula do tempo, luz): nem âmbar (herói),
  nem a cor do PM. O ciano da v3 é o candidato natural;
- **a magia tem uma cor só**: PM, gaveta `✦`, borda de habilidade armada. Hoje
  é violeta, e a v3 já pinta a borda do campo de violeta — proponho que o `◆`
  do PM siga o violeta e não o ciano, para o que se gasta na gaveta ter a cor
  da gaveta;
- **o anel de PV**: cor normal e grave com **um segundo canal que não é cor**
  (o comprimento já é; o rosto em *grave* e `tv-agonia` também) — R9;
- **tudo no piso 12**, e `PV`;
- **o gradiente ambiente da v3 por cima da prosa**: `ink` × página ≥ 10:1 com
  ele (a catraca de R14). *E é aqui que R14 se paga: o gradiente é a luz da
  hora.*
- **a letra da prosa NÃO muda em V1.** Se a folha trocar a paleta e a letra na
  mesma versão, a prova do §9 não sabe a qual culpar se ler pior.

**Para as etapas seguintes:**
1. **`O anel`** — retrato com arco de PV. Tamanhos 42 (mesa) · 40 (herói,
   telefone) · 28 (companheiro). Estados: *Calma* · *Grave* (≤ 1/3) · *Ferida
   agora* (o `feridaRecente` que a cinta já tem) · *Tombado*. Eixo *Quem* =
   `Você` (a coroa) / `Companheiro`. Com `A marca da porta` a reposicionar sobre
   o arco (o recorte de 2 px foi medido contra o aro âmbar; contra o arco novo
   mede-se outra vez).
2. **`A pílula do tempo`** — o alvo do tempo de R13 na forma da v3: glifo da luz
   · hora · dia (só mesa) · `O selo de prazo` dentro. Estados *Calma* · *Prazo a
   apertar* · *Aberta*. Diz como cede (glifo primeiro).
3. **`A legenda da cena`** — as etiquetas da v3 como legenda do `RostoDaCena`,
   com o eixo `Chegada` na ponta do lugar; a runa como borda de baixo.
4. **`O dado`** — o glifo d20 e os cinco estados do §2, com a dificuldade na
   face em *Rolar*.
5. **`O contador`** — `◉` e `◆` à direita da cinta (mono bold + glifo).
6. **`A linha do veredito` fora da batalha** — **a mesma peça** da batalha, com
   uma lei a mais: fora da batalha só existe quando tem veredito.
7. **O trilho da v3** — confirmar que o botão é `A escolha` · *Aba com glifo*
   (R21) na composição vertical, e não uma peça segunda.
8. **Os ícones de V3** — a lista do §4.

*Discordância esperada e já aberta:* se o `desenho` achar que a runa não
sobrevive a ser borda de uma gravura hachurada, escreve-o em `formas.md` e a
runa volta a ter altura — **8 px, não 28**.

---

## 7 · Pedidos ao sistema (escritos em `mente/pedidos-ao-sistema.md`)

1. **O dado do véu rola `Math.random`** (`OverlayDado`, `App.jsx` ~l.536–552).
   O resultado de um teste — o número que a v3 põe no centro da mão do jogador
   — **é o único do jogo que não sai da semente**, e é decidido **dentro do
   componente de tela**. Quebra duas leis de uma vez (*determinismo por
   semente*; *conta se prova, tela se olha*). Pede-se `rolarTeste(semente,
   turno, modo)` puro, com suíte; o véu só anima até ao número dado. **Leve.**
2. **`chanceDoTeste(dificuldade, modificador, modo)`** — a aritmética que já
   existe, exposta, para o dado mostrar `12+ · 45 %` antes do toque. **Leve.**
3. **A proposta ambiciosa (§8)** — o pedido grande.

---

## 8 · A proposta ambiciosa — **a frase é o lançamento**

**Hoje, o dado chega depois da história.** O Mestre narra; o Cronista acha a
concessão grande demais; **só então** o sistema abre um teste
(`teste_sugerido`, `App.jsx` ~l.10380) e o Mestre tem de *desnarrar* o que já
disse (*"narre a concessão se complicando… sem apagar o que foi dito"*). O
jogador rola **para confirmar uma cena que já leu**. É o contrário de uma mesa.

**Numa mesa, o dado vem antes:** *"queres escalar o muro? rola Destreza."* A
proposta é pôr o dado da v3 onde a mesa o põe:

1. **enquanto escreve**, a linha do veredito lê a frase — com a maquinaria que
   já casa frases com verbos (R15) e já mostra o preço da fuga a cada tecla
   (v9.291) — e, quando a frase **anuncia um risco que as tabelas conhecem**
   (escalar, arrombar, convencer, esgueirar-se), diz o teste e a chance:
   `Destreza · 12+ · 55 %`. **O dado mostra a dificuldade na face;**
2. **o toque no dado lança e envia no mesmo gesto** — o resultado sai da
   semente, e entra no turno do Mestre pela `pauta` dinâmica (uma SECAO curta:
   *"a escalada falhou por 3"*), **nunca como bloco estático** — o teto de
   prompt é sagrado;
3. **o Mestre narra a partir do dado**, em vez de o dado corrigir o Mestre.

**Por que é a que faria o jogo ser lembrado.** O jogador passa a **escolher
como** com o preço à vista: *"convenço o guarda"* (Carisma, 70 %) ou *"salto o
muro"* (Destreza, 35 %)? Reescrever a frase muda a aposta **antes** do toque. É
o sistema de decisões que a pessoa pediu para mudar — e é o veredito antes do
clique chegar, por fim, à acção que o jogador usa em **15 de 20 turnos**: a
frase. Junta num sítio só três propostas que a casa já tem a meio: a do tempo
(R6 §7), a da bolsa (R23) e o preço da fuga (v9.291).

**O que se arrisca, dito antes:** (a) o *point-and-click* — o jogador a
escrever para o dado e não para a história. A catraca é a minha de R6: **15 de
20 turnos no campo não pode cair**, e a frase continua livre; (b) o falso
positivo — um teste para *"olho o muro"*. A regra do cartaz de R17: **cala na
dúvida**; sem teste reconhecido, o dado envia sem número, como hoje; (c) a
regra — é regra nova, e é do `backend`: o que ele decide classificar, com que
tabela e com que suíte.

**Não vai a "Para a pessoa decidir":** um commit revertido desfaz-a inteira e
não toca no save. Vai ao sistema **como pedido**, porque sem a regra a mesa não
a pode construir; a mesa constrói a forma (o estado *Rolar* do dado já é esta
forma) no dia em que a porta existir.

---

## 9 · O protocolo da prova jogada de V1 (a folha)

**O que V1 promete:** a tela veste a paleta da v3 **sem mudar de lugar nada**.
Logo a prova é de leitura, não de leiaute.

**Montagem.**
- **Guardar os espaços de save** (`localStorage`, todas as chaves `taverna_*`)
  num ficheiro do scratchpad **antes de tudo**, com o jogo desmontado; restaurar
  idem no fim.
- **O antes sem tocar no vizinho:** `git worktree add <scratchpad>/antes <commit
  anterior a V1>` e `npm run dev -- --port 5174` lá — **nunca** `stash` nem
  `checkout --`. O depois na árvore, aba nova (o HMR mente).
- **Três tamanhos:** 375 × 812, 1280 × 800 e 1280 × 912 (o quadro da v3).
- **A mesma campanha** nos dois: mesma semente, mesmo herói (um conjurador,
  para o PM existir), as mesmas três primeiras frases. O Narrador não é
  determinístico; **o estado é** — comparo estados iguais, não prosas iguais.

**As cenas e as horas** (a luz muda a página, e é aí que uma paleta se parte):
1. **cidade de dia** (luz *dia*), com uma oferta na soleira;
2. **a mesma, de noite** — `Esperar 12 h` pela pílula/O TEMPO (luz *noite*);
3. **subterrâneo** (sempre escuro, tochas na etiqueta), se o mundo der uma
   masmorra a um passo; senão, *madrugada* na estrada;
4. **o alforje aberto no Mercado** (a tela mais densa: 30 preços);
5. **o véu do dado** e **uma luta**, *se aparecerem sozinhos* — não se encenam.
Em cada uma: um turno inteiro lido do princípio ao fim, no antes e no depois.

**O que conta como "leu pior" — qualquer um destes, e V1 não fecha:**
1. **um par de contraste abaixo do seu piso**, calculado dos tokens e não a
   olho: `ink`×página ≥ 10:1 **em cada uma das quatro luzes**; texto secundário
   ≥ 4,5:1; fios e aros ≥ 3:1 (WCAG 1.4.11); o selo de prazo *cheio* contra
   *calmo* ≥ 6,37:1 (R13); a marca da porta ≥ 8:1 sobre o retrato;
2. **o teste dos cinco segundos falha**: diante de cada ecrã, respondo sem
   procurar — *onde estou? que horas são? quanto PV tenho? quanto dinheiro? o
   que posso fazer agora?* **Uma resposta errada ou um segundo olhar** é leu
   pior, e escrevo qual;
3. **um estado que se distinguia deixa de se distinguir** em cinzento ou em
   deuteranopia: PV normal/grave, prazo calmo/última noite, oferta
   nova/assentada, marca *Porta*/*Novo*;
4. **o leiaute mexeu**: a página medida no DOM difere mais de 2 px da de antes
   em qualquer dos três tamanhos (V1 é cor; se mexeu, é defeito);
5. **a prosa de noite cansa**: leio a resposta inteira na cena 2 e escrevo se
   tive de me aproximar do ecrã ou reler uma linha; *se sim, a medida não a
   salva* (a regra de R14);
6. **aparece um hex solto** no `App.jsx` ou nos painéis (`grep`) — a cor é
   tabela;
7. **alguma coisa se move** com `prefers-reduced-motion`.

**E o que conta como "é jogo"** — escrito, com o mesmo peso: se o antes e o
depois lado a lado, sem saber qual é qual, me fazem escolher o depois pelo que
a tela promete (*isto é um jogo, não um documento*). Digo-o com a cena e a
hora em que o senti, ou não o digo.

---

*Figma: `ffWFqD7TueSb88Mkeg9bhW`, página `02 · Entrada — 4 telas`, secção
`132:2` (telas `132:4` · `132:22` · `132:34`), ao lado da v3 (`126:5`).*
*Assina o plano: `jogo`, 24/09.*

---

## 10 · A prova jogada de V1 — o resultado (`jogo`, 24/09)

**Veredito: é jogo, e sobe.** Nenhum dos sete critérios de "leu pior" caiu. Uma
correcção é minha (10.1-d) e há um conserto que fica para V2 (10.4).

**Montagem.** *Antes* = `e0df09b` num worktree (5174); *depois* = a árvore (5173).
**O mesmo save nos dois**: campanha nova (*A Prova da Folha*, Ilsa, maga humana:
o PM existe), exportada **duas vezes** — *dia* (08:00, a chegada, uma oferta na
soleira) e *noite* (22:00, depois de `Esperar 12 h` + `2 h` pela pílula, duas
ofertas). Captado por Chrome headless com um perfil temporário (injecção com o
jogo desmontado), em **1280×800, 375×812 e 1280×912**: são **12 capturas**, de
estados iguais e não só de prosa parecida. O perfil do navegador voltou ao que
era (`taverna_cfg_rolagens` e mais nada). **Não corri** a masmorra nem o Mercado
(cenas 3–4), por economia e por ordem do `regente`.

### 10.1 · Os sete critérios

| # | critério | resultado |
|---|---|---|
| 1a | `ink` × corpo ≥ 10 | **passou**: 11,08 → **13,59–14,18** (o pior ponto do gradiente; o corpo não muda com a luz, a gravura é que muda) |
| 1a′ | legenda da gravura, nas 4 luzes: `ink` ≥ 7 · `mundo` ≥ 4,5 | **passou**: pior é o **dia**, 11,12 e 6,36 (eram 11,98 e 8,22) — o preço do ciano mais escuro, dentro do piso |
| 1b | secundário ≥ 4,5 | **passou**: `inkDim`×corpo 4,85 → **5,88** · ×`panelSoft` 5,82 → 5,36 · `inkMeio`×corpo 6,59 → **8,72** |
| 1c | fios e aros ≥ 3 (1.4.11) | **passou**: `paginaFio`×página **2,30 → 3,41** — *o antes reprovava*; V1 conserta um defeito que ninguém tinha medido · `lineStrong`×`panel` 3,84 → 3,90 |
| 1d | selo de prazo cheio × calmo | **passou no piso real**: 6,37 → 6,34. **A correcção é minha:** o 6,37 que escrevi no §9 era a *medida* de R13, e não um piso. O piso de um canal de forma é 3:1 (1.4.11), e a folga é de 111 % |
| 1e | marca da porta ≥ 8 | **passou**: `amber`×`panel` 8,02 → **9,65** |
| 2 | os cinco segundos | **passou** nas 4 telas: veja 10.2 |
| 3 | estados em cinzento e em deuteranopia (Machado 2009) | **passou, e melhorou**: PV normal/grave ΔE 40,6 → **55,5**, deut. 27,5 → **34,8**, cinzento 1,25 → **1,53** · prazo 6,35 → 6,33 (cinzento) · Porta/Novo 7,25 → **8,64** · nova/assentada não é cor (é `tv-slide`) |
| 4 | o leiaute mexeu > 2 px | **passou: 0,0 px.** Página, campo e pílula têm o mesmo `getBoundingClientRect` ao décimo nas 12 capturas (página 473,3 · 447 · 585,3 de dia; 411,3 · 391 · 523,3 de noite) e `scrollWidth` = viewport |
| 5 | a prosa de noite cansa | **passou**: li a resposta das 22:00 inteira a 1280 e a 375, sem me aproximar e sem reler uma linha |
| 6 | hex solto | **passou**: 0 hex novo nos painéis e no `ui.jsx`; **−2** no `rosto.jsx` (`#EAE4D6` → `T.ink`) |
| 7 | algo se move com `reduced-motion` | **passou**: 0 animações a correr nas 12 (com e sem `reduce`); o gradiente não rola com a prosa |

### 10.2 · Os cinco segundos

*Onde estou?* `Torre da Fonte` na legenda · *que horas?* `08:00`/`22:00` na
pílula e `DIA`/`NOITE` na legenda, **os dois em ciano, e só eles** · *PV?* `14`
e a barra âmbar · *dinheiro?* `◉ 15` · *o que posso fazer?* `Aceitar: …` e o
campo. **Cinco respostas à primeira nas quatro telas, sem segundo olhar.** O
ganho é o da hora: no antes o teal da pílula era um de três verdes-azuis da
cinta; no depois **o ciano é só do mundo**, e a pergunta *que horas são?*
responde-se pela cor antes de se ler o número.

### 10.3 · Por que é jogo (a cena e a hora)

**Noite, 22:00, 1280×800.** No antes a história é **uma folha castanha pousada
na mesa**, e as duas ofertas âmbar, logo abaixo, disputam a vista com uma página
do mesmo matiz (página ~31°, âmbar ~36°). É um documento. No depois a gravura de
prata desce **para dentro** do poço, a luz ambiente pinta a margem, e **o âmbar
passa a ser a única coisa quente de área grande: o que se pode fazer é o que
brilha** (poço ~255°). Pus as duas lado a lado, sem saber qual era qual, e
escolhi o depois pela promessa. A 375×812 dá-se o mesmo, e com mais força,
porque a soleira é o único calor da metade de baixo.

**Uma costura, e não é defeito de V1:** de **dia** a gravura continua sépia
(`LUZ_DA_CENA.dia.chao` `#332A1D`) e agora assenta num poço frio. Antes ela
**continuava** a página castanha; agora é uma chapa emoldurada. Lê bem, e é da
hora, que é informação de jogo, logo fica. Mas a junção dos 24 px é trabalho
de V5 (o rosto é o cabeçalho).

### 10.4 · O que não bloqueia e peço para V2 (com o `oficial`)

**`Continuar aventura` veste `T.danger`** (`App.jsx:5057`, borda de 2,5 px, e uma
sombra com o literal `rgba(216,106,91,…)`, que é o *danger* de R2). Vem de antes
de V1, mas V1 avermelhou-o: `#EE7C6A` → `#FF6B6B`. **O primeiro botão que o
jogador toca, a cada sessão, tem a cor do perigo.** O conserto no estilo da v3
é `T.rosa` (*a tua mão: o escolhido*, formas.md §V1), porque é literalmente o
teu herói à tua espera. A sombra sai de `alfa(T.rosa, …)` e o literal morre.

### 10.5 · O que muda para quem joga, em número

- a prosa lê-se **23–28 % mais nítida** (11,08 → 13,59–14,18:1), em todas as horas;
- as bordas dos avisos da página **deixam de reprovar** a WCAG 1.4.11 (2,30 → 3,41:1);
- o PV grave distingue-se **37 % mais** do normal (ΔE 40,6 → 55,5) e **27 % mais**
  em deuteranopia;
- a hora do mundo tem **uma cor só sua**, e o âmbar volta a ser só da acção;
- **0 px** de leiaute mexido, **0** animações, **0** hex novo;
- o que custou: a legenda de dia desce de 8,22 para 6,36:1 (piso 4,5), e o
  `inkDim` sobre o erguido de 5,82 para 5,36 (piso 4,5).

*Capturas (12 + 1 em `forced-colors`, inconclusiva, porque o CDP emula a media
query mas não pinta a paleta forçada): scratchpad da sessão, `v1-prova/`.*
*Assina a prova: `jogo`, 24/09.*
