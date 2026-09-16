# E3 · a conferência viva — o que a suíte não sabe ver

**Ciclo E3, `jogo`, 16/09/2026.** Duas lutas jogadas de ponta a ponta no
navegador (aba nova, `preview_start` da casa), uma em 1280×860 e outra em
375×812, no Torneio de *Uma Noite* — A Muralha contra O Punho, depois contra A
Sombra. Nenhum ficheiro de código tocado. **Build e suíte não entram neste
documento: o que está aqui só se descobre abrindo o navegador.**

**Os espaços de save:** as cinco chaves foram copiadas para `__e3_backup__*`
antes de qualquer coisa e repostas no fim **com o jogo desmontado**
(`/cenas/abissal.webp`, mesma origem, sem React montado). Conferido por
comprimento, chave a chave — ver §7. **`taverna_save_v1` (a campanha, 139 481
caracteres) nunca foi tocada.**

---

# 1 · Os três defeitos que a suíte não viu

Escolhi três entre sete achados. Os outros quatro estão em §4 e §5.

## 1.1 · A luta abre e o jogador não se vê

**Medido, no primeiro fotograma da primeira luta, antes de eu tocar em nada:**

| | |
|---|---|
| janela do campo | **888 × 608** px |
| tabuleiro desenhado (planta `navio`, 10×16) | **480 × 768** px |
| `scrollHeight` / `clientHeight` do rolador | **823 / 608** — 215 px escondidos |
| `scrollTop` na entrada | **0** |
| filas inteiramente visíveis | **11 de 16** |
| a casa do herói (F16) | `y = 874` — **abaixo da janela (716) e abaixo do ecrã (860)** |
| a casa do inimigo (F1) | `y = 157` — visível |

**O jogador entra na luta a olhar para o inimigo e não para si próprio**, e
nada na tela lhe diz que ele existe mais abaixo. Não há seta, não há
auto-rolagem, não há marca na régua. A primeira coisa que fiz como jogador foi
procurar-me.

E o preço não é só do primeiro turno: **o herói e o inimigo estão a 16 filas um
do outro numa janela de 11.** Durante toda a aproximação, **ver-me é deixar de
ver o ogro, e ver o ogro é deixar de me ver.** Num jogo de grelha isso não é
desconforto: é a informação central do turno a alternar.

## 1.2 · Sessenta e sete dos oitenta elementos focáveis não acendem anel nenhum

Andei pela tela **só com o `Tab`**, como pedido. A tela tem **80 elementos
focáveis**. A ordem é: `⤢ ampliar`, depois **67 casas do tabuleiro**, depois os
nove controlos da barra, o campo de texto e o `Agir →`.

Cada casa é, literalmente:

```jsx
style={{ cursor: clicavel ? "pointer" : "default", outline: "none" }}
```

`src/grade-de-batalha.jsx:796`. Lido de volta no navegador, com o foco lá:
`outline: none`, `box-shadow: none`, `:focus-visible` a casar. **É a primeira
das três maneiras de apagar um anel que K4 nomeou — o estilo inline —, aplicada
a 67 elementos de uma vez.**

**Há um substituto, e ele não chega.** `onFocus` guarda a casa em `focada`, e
`apontada = focada || sobre` (`:463`) realça **a letra da coluna e o número da
fila na régua** (`:499-500`). Três razões para isso não ser o anel:

1. **A marca não está no componente focado.** Quem navega por teclado vê duas
   etiquetas mudarem de tinta na borda do tabuleiro e **nada na casa** onde o
   foco está.
2. **A régua sai do ecrã.** Medida depois de eu andar uma vez: a faixa da régua
   ficou em `y = −104`. Em 8 das 10 plantas o tabuleiro rola, e quando rola
   **o único indício de foco vai com ela**.
3. É uma mudança de cor em duas etiquetas de 11 px, não um indicador à volta do
   alvo (WCAG 2.4.7 / 2.4.11).

**E há o segundo custo, que é de jogo e não de norma:** para chegar do
tabuleiro ao `Atacar` são **69 toques de `Tab`**. Uma barra de ação atrás de 67
casas não é uma ordem de tabulação — é um muro.

## 1.3 · O passo de 9 m nunca é cobrado

Reproduzido **duas vezes, em duas lutas diferentes, nos dois tamanhos de ecrã**:

```
F16 → F12 → F8 → F4 → E2      (14 casas = 21 m, numa só rodada, sem agir)
👣 9 de 9 m nesta rodada      (antes de cada passo e depois de cada passo)
```

O conjunto de casas alcançáveis é **recalculado com o orçamento inteiro a
partir de cada nova posição** — 67 casas de F16, 105 de F12, 121 de F8, 91 de
F4. Cada passo isolado respeita os 9 m; **a rodada não respeita nada.**
Atravessei o navio de uma ponta à outra e cheguei ao ogro no primeiro turno.

> ### A única restrição tática de uma tela tática é quanto se anda por rodada, e ela não existe. O número que a tela mostra — «9 de 9 m» — é o veredito antes do clique, e é o único preço desta casa que nunca é cobrado.

Isto importa duplamente porque **E4 («mover é fazer») vai ser construído em
cima deste orçamento.** Dar forma ao custo de uma casa não vale nada enquanto o
custo não debita.

---

# 2 · Os controlos, um a um: o anel acende?

`Tab` real, foco lido no navegador (`getComputedStyle` + `:focus-visible`).

| controlo | anel? | o que está lá |
|---|---|---|
| `Atacar` | **não chega a receber foco** | `disabled` na entrada (fora de alcance); sai da ordem de tabulação, sem `aria-disabled` |
| `Mover` | **sim** | `0 0 0 2px #0E0C15, 0 0 0 4px #EAE4D6` |
| `Esquivar` | **sim** | idem |
| `Empurrar` | **sim** | idem |
| `Derrubar` | **sim** | idem |
| `Saltar` | **sim** | idem |
| `✦` (gaveta) | **sim** | idem |
| `◆ 1` (gaveta) | **sim** | idem |
| `esperar` | **sim** | idem |
| `⤢ ampliar` | **só o anel do navegador** | `outline: auto` do UA; **não usa `.tv-anel-foco`** |
| as 67 casas | **não** | `outline: none` inline (§1.2) |

**Os sete de W1 passam** — e passam bem: a regra da folha
(`.tv-anel-foco:focus-visible`) está limpa, **sem `none` dentro da lista de
sombras** (a segunda doença de K4, curada), e nenhum dos nove botões escreve
`boxShadow` no seu `style` inline, apesar de todos carregarem uma cadeia inline
longa. O `oficial` sabia do risco e deixou-o escrito
(`painel-batalha.jsx:194`).

**Mas o anel sobrevive por disciplina, não por construção.** Nove botões que já
carregam `style={{…}}` e cujo anel vive numa folha: basta uma sombra inline num
deles, um dia qualquer, e morre sem erro. **O dente de `check-formas.mjs` que o
`desenho` pediu em E3 §8.5 continua a ser a única catraca possível** — e agora
tem dois alvos, não um: proibir `boxShadow` inline em quem carrega
`.tv-anel-foco`, **e** proibir `outline: "none"` inline em quem tem `tabIndex`.

---

# 3 · Os números medidos, contra os declarados

## 3.1 · No monitor (1280 × 860)

| | o `oficial` declarou | eu medi | |
|---|---|---|---|
| a casa | 48 px | **48 × 48** | **confirma** |
| a janela do campo | 888 × 583 | **888 × 608** (rolador); ~561 px sobram para o tabuleiro | **confirma na prática** |
| colunas | 18 | **18** (888 ÷ 48 = 18,5) | **confirma** |
| filas | 12 | **11 inteiras**, a 12.ª cortada | **confirma, e é meia fila pior** |
| plantas que cabem | 2 de 10 | **2 de 10** | **confirma** |
| a linha do veredito | 24 px, nunca vazia | **888 × 24**, nunca vazia em nenhum estado que provoquei | **confirma** |
| a lateral | 344 px | **344 × 796** | **confirma** |

**As 10 plantas de `grid.js:168-261`, contra uma janela de 18 × 12:**

```
12×9  cabe        16×14 não      10×16 não
7×18  não         16×16 não      16×16 não
16×16 não         18×12 cabe (exatamente, e a 12.ª fila está cortada)
14×14 não         14×14 não      18×14 não
```

**Duas.** E a segunda cabe por um fio. A promessa de E1 — «nove de dez» — está
desmentida, e o `oficial` tem razão sobre a causa: os 828 px de campo de E1
nunca couberam na mobília do próprio E1.

**A masmorra 7×18, e o que ela custa a quem joga.** Sete colunas numa janela de
dezoito: **onze colunas de vazio, 528 px de nada**, com o corredor espremido ao
meio. Dezoito filas numa janela de doze: **seis filas sempre escondidas.** Num
corredor, a pergunta do turno inteiro é *o que está entre mim e a saída* — e é
exatamente a pergunta que um terço de corredor cortado não responde. O jogador
paga o pior dos dois lados ao mesmo tempo: **desperdício na largura e cegueira
na altura.**

## 3.2 · No telefone (375 × 812)

| | o `oficial` declarou | eu medi |
|---|---|---|
| a tira de consulta | come 144 px do topo | **[16, 48, 343, 144]** — **confirma ao pixel** |
| a janela do campo | — | **343 × 296** |
| filas | 6 (contra as 12 de E2) | **6** (296 ÷ 48 = 6,17) — **confirma** |
| colunas | — | **~7 de 10** (rolador 335 de largura útil contra 478) |
| casas inteiramente visíveis | — | **24 de 160 — 15 %** |
| o herói na entrada | — | **F16, fora do ecrã**, como no monitor |
| as três fileiras de verbos | — | **y 588 / 644 / 700**, todos 48 px de altura |
| a palavra inteira | — | **sim** — `Empurrar` e `Derrubar` a 78 px, nenhum glifo mudo |
| a linha do veredito | — | **343 × 24** |

**O arco do polegar (os ~144 px de baixo, y 668–812):** lá dentro estão só
`esperar` (700–748) e `Agir →` (758–790). **As seis fileiras de verbos estão
acima do arco**, entre 588 e 692. O polegar chega, mas estica.

**Informação de combate dependente de `hover`:** uma só regra de `:hover` em
toda a folha (`.tv-pregado:hover .tv-cartaz`), e não carrega combate. **A rota
prevista, porém, continua a nascer de `onMouseEnter`** — é a dívida que a pauta
já regista para E4, e no telefone ela é simplesmente inexistente.

**6 filas ainda é jogável?** **Não.** Com 15 % do tabuleiro visível e o herói
fora do ecrã, o telefone não está a mostrar um tabuleiro: está a mostrar uma
janelinha que se arrasta. E o mais duro é que **a casa já ficha uma resposta
dentro da própria tela** — ver §4.4.

---

# 4 · A luta jogada, contada como jogador

## 4.1 · A entrada: a lei cumprida à letra

Cliquei em `⚔ A PRÓXIMA LUTA` e **a tela virou sozinha.** Sem convite, sem
confirmação, sem transição. Sumiram o cabeçalho, o trilho de painéis, o convés
inteiro. Procurei sobreviventes com a lista de `FORA_DA_TELA_DA_LUTA` na mão:
**zero.** Nem `⛺`, nem `📜`, nem `Examinar`, nem `Tempo`, nem mapa, diário,
códex, guilda, domínios, gestão, ascensão. **Onze botões visíveis na tela
inteira, e os onze são da luta.** O `◆ 1` é a bolsa de combate, que é gameplay.

E a lei dura: **nada nesta tela diz que ela é uma tela.** Nenhum «modo
batalha», nenhum selo «em combate», nenhum «sair do combate». Li o `innerText`
inteiro à procura e não há. *É o item mais bem cumprido do ciclo.*

## 4.2 · O gesto, contado em toques

- **Tocar um verbo arma.** `Mover` inverteu para âmbar cheio (`#E8A33D` sobre
  tinta `#1A1408`), `aria-pressed="true"`, e nasceu **o bico** — um `<span>`
  absoluto de 11 × 6 px em `y = 743`, cinco px **acima** do botão, a apontar
  para a linha do veredito em `y = 720`. Aponta para o sítio certo.
- **A linha muda e diz as duas coisas:** *«toque a casa onde quer parar · toque
  o verbo outra vez para desistir»*.
- **As três saídas: duas vivas.**

| saída | resultado |
|---|---|
| tocar o verbo outra vez | **desarma** ✓ |
| `Esc` | **desarma** ✓ |
| **tocar fora** | **não desarma** ✗ |

  Provei o «fora» em quatro sítios — a narração (clique real), a lateral, a
  margem vazia do campo e a própria linha do veredito. Em nenhum. **E é a saída
  que mais falta no telefone**, onde não há `Esc` e onde o reflexo é tocar ao
  lado; quem armou o verbo errado tem de voltar a acertar num alvo de 59 px.

- **Os toques por ato, contados:** **passo limpo = 1 toque** (tocar a casa
  alcançável, sem armar nada — funciona, e é bom); **golpe limpo = 1 toque**
  (`Atacar` dispara direto quando há um alvo só). **A lei de W1 está cumprida
  nos dois.**

## 4.3 · A luta, do princípio ao fim

Quatro rodadas contra O Punho. Andei 21 m, bati duas vezes (13 + 13), esperei
uma rodada, apanhei 25 de dano, e o ogro rendeu-se aos 8/34 PV. A porta abriu.

**O que funcionou e se sentiu bem:**

- A linha do veredito **trabalha**. Mudou sozinha a cada passo — *«O Punho a
  21 m — faltam 19,5 m»*, *«a 15 m»*, *«a 6 m»*, *«a 1,5 m — ao alcance»* — e
  no instante em que disse *ao alcance* o `Atacar` acendeu. **Essa é a melhor
  coisa desta tela:** o preço e a possibilidade na mesma frase, no mesmo sítio,
  sem eu procurar.
- **A pergunta que expira** apareceu duas vezes (*«O Punho te acerta · ⚔ aparar
  · 0 PM — corta metade»*, *«O Punho erra o golpe · 🗡 contra-ataque · 0 PM — na
  mesma batida»*) com as duas alternativas escritas e o custo escrito. Alvos de
  56 e 48 px. **É o momento mais parecido com jogo de toda a tela.**
- **A porta do fim é uma e é larga:** `Respirar fundo →`, **888 × 48**, âmbar
  cheio, 18 px, **no lugar exato onde estava a barra de verbos**. Levou-me de
  volta ao convés com o cabeçalho e o trilho de volta. Durante a luta não havia
  porta nenhuma. **Os dois lados de §8 confirmados.**

**O que tive de adivinhar:**

- **Onde eu estava.** Ver §1.1.
- **Quanto me restava andar.** O `👣` vive na régua, e a régua sai do ecrã
  assim que o tabuleiro rola. Depois do primeiro passo eu já não tinha onde ler
  o meu passo — e, como se vê em §1.3, não teria importado.
- **Quem estava a jogar.** `agora: A Muralha` **nunca mudou.** Nem quando o
  ogro atacou, nem quando eu esperei, nem quando a luta acabou. A rodada
  resolve-se inteira dentro do meu clique, e a região que existe para responder
  *de quem é a vez* é, nesta luta, **uma constante**. Uma região que nunca muda
  não é uma região: é um rótulo.
- **Que dados me atingiram.** Com as rolagens de combate **visíveis**, a
  lateral listou **duas** linhas — as minhas duas. Levei **25 de dano em duas
  ocasiões e não há uma única linha de dado do inimigo.** Não sei se o ogro
  acertou por 1 ou por 12, se a minha armadura contou, se `aparar` teria
  mudado alguma coisa. **Num jogo cujo lema é «o Mestre é código», a metade dos
  dados que me tira a vida é invisível.**
- **Se eu tinha ganho.** A luta acabou com a linha a dizer **«rodada 4 · 1 de
  pé contra você»** e a porta a dizer `Respirar fundo`. A linha do preço estava
  a contar-me um inimigo de pé enquanto o jogo me mandava sair.
- **E a ficção passou à frente da mecânica:** o Narrador escreveu *«O Punho
  fica ali, no chão, como um animal ferido que desistiu»* com o ogro a 8/34 PV
  e ainda no selo da faixa. A rendição foi narrada antes de existir na tabela.
  *(Isto é do Narrador, não da tela — fica registado aqui porque só se vê
  jogando.)*

## 4.4 · A descoberta do `⤢ ampliar`, e por que ela vale o ciclo

Abri o `⤢ ampliar` no telefone. **É o único sítio de todo o jogo onde o
tabuleiro inteiro cabe** — 160 casas, sem rolagem, sem cortes.

E cabe porque **desenha a casa a 32 px.**

| | casa | casas visíveis |
|---|---|---|
| a tela da batalha, telefone | **48** | **24 de 160** |
| o `⤢ ampliar`, telefone | **32** | **160 de 160** |

**A casa já tem duas caras nesta tela, e a cara pequena é a que deixa jogar.**

Três observações mais sobre o `⤢`:

1. Ele mede **68 × 19 px** — muito abaixo do piso de 48 que esta casa acabou de
   fixar em K4. **A saída de emergência é o alvo mais pequeno da tela.**
2. **Ele vive na régua, logo sai do ecrã com ela.** Medido em `y = −82` e
   `y = −107` depois de rolar. *A cura do campo pequeno desaparece exatamente
   quando o campo está pequeno.*
3. O `Fechar e agir` mede **36 px**, e a régua de dentro diz **«NAVIO ·
   10×16»** enquanto a de fora diz **«CAMPO · 10×16»** — a mesma régua com dois
   nomes.

---

# 5 · O que da lei de E1 não está na tela, e quanto custa

| a lei | está? | o que custa |
|---|---|---|
| a tela vira sozinha, sem convite | **sim** | — |
| nada diz que é uma tela | **sim, à letra** | — |
| os treze controlos somem | **sim, os treze** | — |
| as seis regiões, na ordem do turno | **sim**, no monitor | no telefone a **consulta (144 px) vem antes da vez**, e é ela que rouba as seis filas |
| a narração encolhida, duas últimas linhas | **sim** (56 px) | no telefone é **uma** linha (24 px) |
| `agora: <nome>`, selo do herói preso à esquerda, círculo/losango | **sim** | mas **nunca muda** (§4.3) — a região é decorativa nesta luta |
| a régua nas duas bordas | **sim** | **rola para fora do campo**, levando com ela o `👣` e o `⤢` |
| a linha do veredito, 24 px, nunca vazia | **sim, sempre** | o melhor da tela |
| os sete controlos + gavetas + goteira + `esperar` | **sim**, 48 px, palavra inteira | `Atacar` mede **294 px** contra 59 do `Mover` (`flex: 1 1 0`) — e **na entrada está `disabled`**: a barra dá o seu maior lugar ao único verbo que não se pode usar. W1 tirou ao `Atacar` o privilégio de **cor**; a construção devolveu-lho em **largura** |
| `como? (opcional)` | **sim** | o `Agir →` que o envia mede **32 px** no telefone |
| o veredito completo na linha, nunca num balão | **quase** | a pergunta que expira monta-se **sobre o tabuleiro**, 560 × 122, tapando as filas 9 a 12 — e a peça do Figma (`31:518`) é de **344**, para a lateral. *Uma ação, duas caras* |
| o custo escrito dentro da casa *Alcançável* | **não** | é de E4, esperado |
| três saídas do gesto | **duas** | §4.2 |

---

# 6 · A proposta ambiciosa

## **A casa deixa de ser um alvo de toque e passa a ser uma escala** · *pesado*

**`ALVOS.piso = 48` é um número do polegar. O tabuleiro usa-o como número do
olho, e são coisas diferentes.** WCAG 2.5.5, a HIG e o Material dizem quanto
mede *um alvo em que se toca*; nenhum deles fala de **escala de mapa**. O
tabuleiro herdou o número errado e paga-o em filas.

**A prova, pelos três caminhos.**

**1 · Medida — e ela fecha a discussão.** Em 860 px de altura, o orçamento é:

```
narração 56 + faixa 44 + régua 30 + CAMPO + veredito 24 + verbos 48 + agir 32 + folgas ≈ 26
```

Sobram **~561 px** para o tabuleiro, e **nenhuma arrumação de mobília muda
isso** — 18 filas a 48 px pedem **864 px só de tabuleiro**, mais do que o ecrã
inteiro. Não há remendo de leiaute: **ou a escala se mexe, ou 8 de 10 plantas
continuam a não caber.** Com a casa a **31 px**, as dez cabem (18 × 31 = 558).

**2 · Experiência jogada — e é a minha, hoje.** Joguei duas lutas inteiras e a
única vista em que consegui ver a luta toda foi o `⤢ ampliar`, **que já desenha
a 32 px.** A casa já resolveu isto e escondeu a resposta atrás de um botão de
19 px que sai do ecrã. *Quando o remendo é melhor que a tela, o remendo é a
tela.*

**3 · Estudo citado.** As três normas citadas em E3 §1.3 (WCAG 2.5.5 AAA 44 px,
HIG 44 pt, Material 48 dp) são todas sobre **tamanho de alvo de ponteiro**.
Aplicá-las a um quadrado de mapa é usar uma norma fora do seu domínio — e o
próprio `⤢ ampliar`, que a viola sem que ninguém tenha objetado em nenhum
ciclo, é a confissão de que ninguém acredita nela ali.

**A forma, se a pessoa aprovar:** uma tabela `ESCALA_DA_CASA` irmã de `ALVOS`,
com **um piso por tipo de ponteiro** — `fino` (rato) e `grosso` (dedo) — e a
casa a ser `clamp(cabe, piso, 48)`. No rato, o dedo nunca lá pousa e o piso
pode descer aos ~28–31 px. No dedo, **o piso fica em 48 e o `⤢ ampliar`
cresce para ser a vista principal do telefone** em vez de um escape. Sai de
tabela, logo desfaz-se num commit, e a catraca é trivial: *toda planta de
`grid.js` cabe inteira na janela medida, em ambos os pontos*.

## E uma segunda, mais barata: **a faixa da vez tem de bater**

`agora: <nome>` não mudou uma vez em quatro rodadas. Ou a rodada passa a ter
batida visível — o selo do inimigo a acender enquanto ele age, e a apagar-se
quando cai —, ou **a região deve ser dita a metade do tamanho e deixar as filas
ao campo**. Hoje ela ocupa 44 px de altura para dizer uma coisa que não muda.
*Uma região que nunca muda de estado está a cobrar altura por um rótulo.*

---

# 7 · Os espaços de save

**Confirmo por escrito que guardei e repus.**

| chave | antes | depois de jogar | reposta |
|---|---|---|---|
| `taverna_save_v1` (**a campanha**) | 139 481 | 139 481 | 139 481 — **nunca tocada** |
| `taverna_rapida_v1` | 30 755 | 37 025 | **30 755** ✓ |
| `taverna_mesa_ARENA7` | 10 577 | 10 577 | 10 577 |
| `taverna_mesa_ARENAA` | 2 817 | 2 817 | 2 817 |
| `taverna_cfg_rolagens` | 1 | 1 | 1 |

A reposição foi feita **com o jogo desmontado** — naveguei para
`/cenas/abissal.webp` (mesma origem, sem React montado) antes de escrever, pela
lei do autosave. As cinco cópias `__e3_backup__*` e o `__e3_manifesto__` foram
apagados; o `localStorage` terminou com exatamente as cinco chaves originais,
conferidas uma a uma.

---

# 8 · As armadilhas de instrumento que este ciclo pagou

1. **A foto do painel é um recorte, não a tela.** O `screenshot` devolve
   510 × 384 px de dispositivo — os **408 × 307 px do canto superior esquerdo**
   de um ecrã emulado de 1280 × 860 — e o `zoom` com região não está
   implementado. Tudo o que importa nesta tela (a barra, a lateral, a linha do
   veredito) fica fora do recorte. **O truque que funciona:** um
   `transform: scale(0.355)` temporário no `<html>` encolhe a página inteira
   para dentro do recorte; tira-se a seguir. *A lei da casa — «confie na árvore,
   não na imagem» — resolveu quase tudo, e para o resto há isto.*
2. **Cliques por coordenada usam o referencial do painel (510 × 384), não o da
   página.** Clicar por `ref` usa a página. **Clique sempre por `ref`.**
3. **A pergunta que expira expira entre duas chamadas de ferramenta.** Perdi
   um contra-ataque a medir onde ele estava. Para a apanhar é preciso encontrá-la
   e clicá-la **dentro da mesma chamada**.
