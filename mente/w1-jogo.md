# W1 · a frase que se monta — a metade do MOMENTO

**Do `jogo`, 15/09.** E1 desenhou a tela, E2 deu-lhe endereço, X2 pôs o veredito
do golpe no motor. **Esta etapa fecha o gesto:** o que o dedo faz, quantas vezes,
e o que a tela diz antes de cada vez.

O `desenho` está a compor em paralelo, com o mesmo terreno e sem me ver. Por
isso tudo o que aqui toca a **forma de uma peça** está escrito como **pedido a
ele**, na secção própria, e não desenhado por mim. Eu componho o momento; a peça
é dele.

---

## 0 · O que eu corrijo antes de compor — três coisas que o enunciado e E1 dão
## por assentes e que o código de hoje desmente

**Não é polémica: é que compor em cima de um terreno errado é compor no vazio.**

### 0.1 · Os ~18 toques já não são o caso comum. X2 matou-os, e ninguém contou.

O enunciado (e `pauta-desenho.md:553`) conta a rodada assim: `Ações` → `Atacar`
→ digitar o alvo (~15) → `Agir →`. **Isso descreve a v9.254.** Desde X2
(`App.jsx:20884`), com a luta aberta, `Atacar` **não escreve na caixa: ataca**,
pela porta única, no mais perto ao alcance.

**Contado hoje, linha a linha:**

| o que ele quer | toques | onde está no código |
|---|---|---|
| andar até uma casa | **1** | `grade-de-batalha.jsx:752-757` — `onClick={agir}` → `onMover` |
| golpe no mais perto ao alcance | **2** | `Ações` (`App.jsx:21440`) + `Atacar` (`:20884`) |
| golpe num alvo **escolhido** | **3** | pílula (`:3325`) + `Ações` + `Atacar` |
| golpe pela caixa (os outros 11 verbos) | **~18** | `Ações` + verbo + ~15 de teclado + `Agir →` |

**Então o alvo de W1 não é 18 → 2. É 2 → 1**, e é um alvo muito mais duro,
porque cada toque que sobra está lá por uma razão. Os 18 continuam vivos, mas só
para os verbos que **não têm porta** — e é aí que está o verdadeiro buraco (0.3).

**E há um defeito escondido no caso de 3 toques, que eu encontro a contar e que
é de veredito:** quando o jogador declara um alvo na pílula e esse alvo **não
alcança**, `declararGolpe` (`:11988-11990`) cai no mais perto **sem o dizer**. O
jogador toca `Bandido`, o jogo bate no `Troll`, e a única pista é a linha do log
depois do facto. *Um veredito que escolhe outro alvo em silêncio é pior do que
um veredito que recusa.* W1 fecha isto (§2.3).

### 0.2 · A linha do veredito de X2 **não cabe na tela onde vive**. Medido.

E2 mediu o teto da linha: **mono 10 px = 6,0 px por caractere**, 344 px na
lateral de 1280, 359 no telefone → **54 caracteres** (`e2-jogo.md:347-358`).

A linha de X2 vive dentro do painel `Ações`: `px-4` (32) mais `p-3` (24) num
telefone de 375 → **319 px úteis = 53 caracteres**. E ela mede:

```
  cabe      51 · Bandido a 1,5 m — dentro dos seus 1,5 m de alcance.
TRANSBORDA  67 · Longe demais — Bandido a 12 m, faltam 10,5 m. Aproxime-se primeiro.
TRANSBORDA  77 · Longe demais — Capitão dos Lobos a 12 m, faltam 10,5 m. Aproxime-se primeiro.
```

**A recusa por distância transborda hoje, em produção, no telefone** — e a
recusa por distância é a que acontece em **10 de 10 plantas no turno 1** (X1).
Ela não é cortada: o `div` é `flex items-center` com `minHeight: 24`
(`:20909`), logo **quebra para uma segunda linha e empurra o painel 12 px**.
Um painel que muda de altura conforme o nome do inimigo é um painel que se mexe
debaixo do polegar.

**É o mesmo erro que E2 cometeu e escreveu** (*"escrevi nove recusas antes de
medir a linha onde elas iam viver"*), cometido um andar acima e já embarcado.
A cura é a mesma: **tabela de duas colunas, `larga` e `curta`, com catraca nos
54** — e W1 pede-a para o golpe, irmã da `RECUSAS_DO_PASSO` que E2 pediu para o
passo (§5.3).

### 0.3 · A fileira de seis verbos de E1 tem **três verbos sem motor e um quarto
### que não existe** — e `golpe.js` escreve-o à letra.

`VERBOS_DE_COMBATE` (`golpe.js:222-254`) é a tabela que X2 deixou, e ela diz,
com o motivo por escrito, que `Esquivar`, `Empurrar` e `Derrubar` **não chegam a
motor nenhum**: a frase que escrevem não casa detector de ataque, não casa
`ehDeclaracaoDeAtaque`, não casa desafio. *"Vai para a IA como ficção pura, e o
que acontece depende do humor da cena."*

E o sétimo, `esperar`, que E1 pôs do outro lado da goteira, **também não
existe**: `App.jsx:3133` diz que o botão "encerrar turno" saiu na v9.13, e
`:13591-13594` diz o que o substituiu — *"em combate, até 'recuo dois passos e
observo' é um turno"*. **Passar a vez custa uma frase digitada e uma chamada ao
Mestre.**

**Quatro dos sete botões da fileira de E1 são teatro.** Compor uma barra fixa,
sempre visível, em que mais de metade dos alvos de toque não faz nada mecânico é
o pior que esta etapa podia entregar — é a "porta dos fundos" da v9.59.1 outra
vez, mas desta vez em tamanho de cartaz. **A lista é minha** (E1 escreveu-o:
*"a contagem é dele, a lista é do `jogo`"*), e eu mudo-a no §3.

---

## 1 · A abertura de toda luta, medida — e é aqui que W1 se ganha

X1 mediu a recusa. Eu medi **o que ela custa ao jogador**, correndo `PLANTAS`
(`grid.js:166-270`) contra `posicionar` (`:551-577`), passo de 9 m, corpo a
corpo de 1,5 m:

| planta | L×A | abertura | rodadas até o 1º golpe | rodadas **só** de andar |
|---|---|---|---|---|
| taverna | 12×9 | 12,0 m | 2 | 1 |
| masmorra | 7×18 | **25,5 m** | 3 | 2 |
| floresta | 16×16 | 22,5 m | 3 | 2 |
| estrada | 18×12 | 16,5 m | 2 | 1 |
| cidade | 14×14 | 19,5 m | 2 | 1 |
| caverna | 14×14 | 19,5 m | 2 | 1 |
| ruína | 16×14 | 19,5 m | 2 | 1 |
| navio | 10×16 | 22,5 m | 3 | 2 |
| gelo | 16×16 | 22,5 m | 3 | 2 |
| deserto | 18×14 | 19,5 m | 2 | 1 |

**Média da abertura: 19,95 m. Rodadas só de andar: 14 em 10 plantas = 1,4 por
luta.** E a correcção a X1, que importa: **por distância, a arma de longe
alcança em 10/10 plantas no turno 1** — as três recusas de arco que X1 conta são
**parede**, não distância. O imposto da caminhada é imposto de quem luta de
perto.

### E agora o número que ninguém tinha: quanto custa essa rodada de caminhada

Rodada 1, corpo a corpo, planta média (19,5 m):

1. toque na casa — anda 9 m — **1 toque**. Sobram 10,5 m: fora do alcance.
2. `Atacar` vem `disabled` (`:20877`). Certo, e é X2 a funcionar.
3. O passo acabou (`movM < 1,5`, `:14525`). **Não há mais nada para tocar.**
4. Para a rodada virar, ele **tem de escrever uma frase** e carregar `Agir →`:
   ~20 toques de teclado, 1 toque, e **uma chamada ao Mestre** para o motor
   fazer aquilo que o motor já sabia fazer — virar a rodada.

**A abertura de toda luta corpo a corpo custa hoje ~22 toques e uma chamada, e
nada de mecânico acontece nela.** Isto é maior que os 18 toques do enunciado, e
é 100 % das lutas, e repete-se 1,4 vezes por luta em média (2 na masmorra, no
navio, no gelo e na floresta).

**É por isso que `esperar` não é o sétimo botão da fileira: é o primeiro.**

---

## 2 · O gesto completo

### 2.1 · A lei, reescrita com a sua condição

E1 e `formas.md` dizem: *"um golpe limpo num alvo já ao alcance é UM toque; o
segundo toque só existe quando o acto custa algo além de si mesmo."*

**Sobrevive, e eu aperto-a**, porque "custa algo além de si mesmo" não sobrevive
ao contacto com este motor — **agir é encerrar** (`:3079`, `:11924`), logo
*todo* acto custa a rodada inteira, e pela letra antiga *todo* golpe pediria dois
toques. A lei fica assim:

> **O segundo toque nunca é uma confirmação. É sempre a resposta a uma pergunta
> que o jogo não pode responder sozinho.**
>
> São duas perguntas, e só duas: ***em quem?*** e ***para onde?***
> **Confirmar não é pergunta — é burocracia**, e burocracia por acto é o
> formulário que esta tela existe para matar.

E o preço disto, que é a metade que compra a outra:

> **O toque único só é honesto porque o preço já está na tela antes dele.**
> O veredito não é um estado do *gesto*; é um estado da *tela*. A linha é
> permanente, e é ela que paga o toque único. **Sem a linha a dizer o preço, um
> toque que resolve é um roubo.**

### 2.2 · O gesto é comutativo — e é isto que faz a frase montar-se

O jogador pode começar pelo **verbo** ou pelo **alvo**, e dá o mesmo:

- **verbo → alvo:** toca `Atacar` (arma) → toca o inimigo (resolve).
- **alvo → verbo:** toca o inimigo (arma) → toca `Atacar` (resolve).

Dois toques, o veredito no meio, e **nenhuma ordem obrigatória**. E quando não
há pergunta, **qualquer uma das metades sozinha basta: um toque.**

*Por que é que tocar no inimigo ARMA e não RESOLVE.* Porque no telefone não há
`hover`: o dedo que toca é o dedo que age, e um toque no inimigo que resolve é
um turno gasto por um dedo que escorregou ao arrastar o campo. **Armar é o
"antes do clique" do dedo.** E é de graça: hoje o toque numa casa ocupada
**não faz nada** (`alcancaveisDe` exclui ocupados, logo `clicavel` é falso e
`agir()` retorna em `:752`). *Estou a dar significado a um gesto morto, não a
tirar significado a um vivo* — zero reaprendizagem.

### 2.3 · Os três casos, e o número de cada um

Quem decide é `vd.aoAlcance.length`, que `vereditoDoGolpe` já devolve
(`golpe.js:183`) e que não custa nada perguntar.

**Zero ao alcance → `Atacar` impedido, e a linha diz qual das duas recusas.**
Já é o de hoje (`:20877`, `recusaDoGolpe`), e está certo. W1 só lhe acrescenta a
saída (§2.5).

**Um ao alcance → UM toque.** Não há escolha a fazer, logo não há escolha a
pedir. **É a mesma régua de K1** — *"o toque que revelava uma lista de um item
morreu"* —, e ela vale aqui palavra por palavra. E repare que o que conta não é
quantos inimigos existem: é quantos o golpe **pode tocar**. Uma luta de seis
goblins em que só um está encostado é um toque.

**Dois ou mais ao alcance → DOIS toques, e o segundo é a pergunta *em quem*.**
E aqui W1 **tira** um comportamento de hoje, de propósito: `declararGolpe`
deixa de escolher o mais perto sozinho quando há escolha. **Escolher por ele era
o certo em X2** (o botão era o único canal e recusar teria sido pior); com a
mira disponível, escolher por ele passa a ser o jogo a decidir a única coisa que
é dele. O silêncio do §0.1 morre aqui.

### 2.4 · A memória do verbo — os dois sentidos, e a decisão

**A favor de lembrar.** Combate é repetição: um lutador bate no mesmo alvo três
rodadas seguidas. Numa luta de 5 rodadas com 3 inimigos ao alcance, lembrar
poupa **4 toques** (as rodadas 2 a 5 voltam a 1 toque). E paga-se exactamente
onde a regra do alvo único não chega: **o arqueiro**, que com 36 m tem quase
sempre todos ao alcance e por isso nunca vê o caso de um toque — a memória
devolve-lho a partir da segunda rodada.

**Contra lembrar.** Entre a rodada passada e esta houve **um turno inimigo**: o
alvo pode ter caído, andado, ou ganho uma parede. Um toque único que resolve num
alvo que o jogador **não escolheu nesta rodada** é a pior coisa que um jogo
táctico faz, e não tem desfazer.

**A decisão: o verbo lembra o ALVO, nunca o TOQUE.**

- O alvo da rodada anterior vem **pré-armado e escrito na linha antes do dedo**:
  `Bandido outra vez, a 1,5 m — golpe limpo` (40 caracteres, cabe). **1 toque.**
- Se ele caiu, saiu do alcance ou ganhou parede, **a memória morre em silêncio**
  e volta-se ao caso geral (dois toques). **Nunca migra sozinha para outro.**
  *(A migração automática que `PainelCombate:3335` promete é legítima porque é
  **dentro** de uma sequência declarada pelo jogador, na mesma rodada. Entre
  rodadas não é: entre rodadas o mundo mexeu-se.)*
- **E o verbo nunca lembra o MODO.** A rodada nova abre sempre desarmada. *Um
  modo herdado de um turno anterior é um modo que o jogador não sabe que está
  ligado* — e este jogo já pagou isso uma vez, na v9.128, com a mira que ficava
  aberta para habilidades que não se miram.

### 2.5 · Como se desiste — confirmo duas das três saídas de E1 e corrijo a
### terceira

E1 fixou três saídas vivas ao mesmo tempo (`e1-jogo.md:529-542`): `Esc` (e o
gesto de voltar no telefone), tocar o verbo outra vez, e **tocar o campo fora do
conjunto armado**. Medidas contra o código:

**1 · Tocar o verbo outra vez — confirmada.** É o maior alvo da tela, está sob o
polegar, e está aceso enquanto armado.

**2 · `Esc` — confirmada no teclado, e eu RETIRO o gesto de voltar no telefone.**
O "gesto de voltar" em Android é o botão de voltar do navegador. Interceptá-lo
para cancelar uma mira é uma armadilha conhecida: o jogador carrega duas vezes e
**perde a página**. Num jogo cujo estado vive em `localStorage` com autosave, a
troca é péssima. **Não peço a intercepção. No telefone as saídas são duas, e
chegam.**

**3 · "Tocar o campo fora do conjunto armado" — muda de forma, e a nova é
melhor.** Como está escrita, ela não funciona: a casa fora do conjunto não tem
ouvinte nenhum (`grade-de-batalha.jsx:752`, `if (!clicavel) return`), e
transformar as 84 casas do campo em botões de cancelar é dar significado a 84
alvos para uma acção que já tem dois. **A saída passa a ser: tocar uma casa onde
dá para andar.** Ele anda — **e o andar desarma a mira como consequência, não
como efeito colateral**: andar muda o alcance do golpe, logo a mira anterior
deixou de valer de qualquer maneira. **Um toque, dois efeitos, e nenhum deles é
surpresa.** A saída sai de graça, e o jogador não a tem de aprender.

**O que acontece com o que já foi escolhido: nada se perde, porque armar nunca
gasta.** `vereditoDoGolpe` é pergunta e não acto — o módulo garante-o por
escrito (*"Zero aleatoriedade… nada é mutado"*). E **o alvo lembrado sobrevive
ao cancelamento**: desistir de escolher não é desescolher o de antes. Sem esta
cláusula, cada desistência custaria a memória do §2.4, e uma saída que cobra não
é uma saída.

**E o estado armado nunca é mudo.** A linha termina com a saída escrita.
Medido: `escolha no campo — toque fora para desistir` = **43 caracteres**, cabe.
**A ordem de corte da linha, quando o nome é grande:** primeiro cai a *saída*,
depois o *lugar* (`em K14`), **nunca o alvo e nunca o preço**. A saída pode cair
porque as outras duas continuam vivas e a mira está visível; o preço não pode,
porque é a lei.

### 2.6 · O campo armado NÃO veste véu, e o golpe não pinta chão

O véu significa *"não dá para ir ali"*. Durante um golpe armado, ir ali continua
a dar — o que não dá é **bater no chão**. Vestir véu ali seria a tela a mentir,
e custaria uma repintura de 84 casas para uma escolha de dois itens.

Mais fundo: **o passo e a habilidade escolhem TERRENO; o golpe escolhe GENTE.**
São gramáticas diferentes e não podem partilhar a forma. O campo hoje tem três
tintas e nenhuma sobra: âmbar é o passo (`:611`), violeta é o alcance da
habilidade (`:611`, `:619`), vermelho é a área da magia (`:624`) **e** a ficha do
inimigo (`:653`) **e** a faixa do chefe. **O golpe não pede uma quarta tinta de
chão: pede uma marca sobre a ficha.** É o pedido 2 ao `desenho` (§6).

---

## 3 · A fileira — quatro, e uma goteira

E1 fixou seis verbos mais `esperar`, em três filas de 44 px no telefone. **Eu
corrijo a lista** (que é minha) e **a altura** (que é consequência):

| o que fica | papel | porta |
|---|---|---|
| **`Atacar`** | `Botao` *Papel=Chamada*, o único da tela | `declararGolpe` → `resolverAtaqueJogador` ✅ |
| **`✦`** | gaveta, não verbo | `PainelHabilidades` → `resolverHabilidadeOfensiva` ✅ |
| **`◆`** | gaveta, não verbo | `onUsarConsumivel` — e **não gasta o turno** desde a v9.13 ✅ |
| *goteira* | | |
| **`esperar`** | `Botao` *Papel=Recuo* | **não existe. É o pedido 5.1 ao `backend`, e é o mais importante** |

**O que sai, e porquê.**

- **`Esquivar`, `Empurrar`, `Derrubar` saem da fileira fixa** e ficam onde estão
  hoje: na gaveta `Ações`, a escrever na caixa. Não é degradação — é **pôr o
  teatro no palco do teatro**. Enquanto o motor não tiver disputa de força nem
  concessão de `protegido`, aquilo é ficção, e ficção pertence à frase, que é
  onde a ficção é honesta. *Uma barra fixa em que metade dos alvos não faz nada
  mecânico ensina, em duas lutas, a não confiar na barra.*
- **`Saltar` sai**, e por outra razão: ele **tem** motor
  (`desafios.js#saltar`), mas saltar é *sobre uma casa*, e **a porta do
  tabuleiro não existe** (§5). Entra na fileira no dia em que `passo-no-campo`
  nascer, e não antes. **Declaro isto como condição de entrada, não como
  pedido** — é o oposto de compor uma barra que mente.
- **`Mover` sai, e esta é a minha correcção mais dura a E1.** O passo já é
  **um toque na casa**, hoje, em produção. Um botão `Mover` seria **duas formas
  para a mesma acção** — o que a lei da dupla proíbe em primeiro lugar — e, pior,
  um botão que *arma* a mira do passo transformaria o passo limpo de 1 toque em
  2. **`Mover` é o único verbo cuja presença na barra faria o jogo piorar.** O
  que fica no lugar dele é o que o campo já diz sozinho: o contorno âmbar da
  união, permanente no turno dele.

**A altura, e o que ela devolve.** A fileira de E1 pede **três filas de 44 px =
132** (`formas.md:2398`); a minha pede **uma = 44**. *(Fica registada uma
contradição em E1: `e1-jogo.md:619` conta a tira dos verbos como 88 e a secção
das formas conta três filas de 44. Tomo o número maior, que é o que a lista de
seis obriga.)*

**Devolvo 88 px ao campo.** Em casas de 48 px são **1,8 filas** — e como fila é
inteira, **+1 fila: 7×13 = 91 casas em vez de 84.** O campo cresce sem tirar
nada de ninguém, e cresce **porque a lista ficou honesta**.

E a largura fecha em 359: `Atacar` 163 (flexível, o único com preenchimento) +
goteira 12 + `esperar` 72 + `✦` 44 + `◆` 44 + três vãos de 8 = **359 exactos**.
`Atacar` fica 1,3× os outros em vez dos 2× que E1 pediu — **e paga-se no
preenchimento e na tinta, não no tamanho**, que é o que sobra quando a fila é
uma só.

---

## 4 · O celular — e uma decisão que só existe nele

84 casas (7×12) hoje, 91 com a fila devolvida, casa de 48 px, régua a custo
zero. O arco do polegar chega aos ~520–560 px de baixo (E1).

**O problema que W1 traz e que E1 não tinha:** o segundo toque do golpe é numa
**casa de 48 px no meio do campo** — e o dedo que a toca **tapa-a**, e tapa a
linha do veredito que a descreve. É o defeito que a `A casa` *Sob o dedo* nunca
teve de resolver, porque *Sob o dedo* não existe antes do toque.

**A decisão: com a mira do golpe armada, os alvos ao alcance aparecem TAMBÉM
como uma fila de pílulas na linha do veredito**, no arco do polegar, com o nome
escrito e ≥44 px.

**Isto não fere "uma acção, uma forma", e digo porquê antes que me perguntem.**
A lei proíbe **duas formas para a mesma acção**. Aqui há **uma forma — a mira
armada — com dois alvos de toque**, exactamente como a casa do tabuleiro já
responde ao rato *e* ao teclado (`onClick` + `onKeyDown`,
`grade-de-batalha.jsx:756-757`) sem que ninguém chame a isso duas formas. O que
seria defeito é uma existir sem a outra, ou as duas dizerem coisas diferentes:
**a pílula e a ficha marcada acendem juntas, desarmam juntas, e escrevem a mesma
linha.**

**A ordem da fila é a distância crescente, e ela ensina sozinha:** o primeiro da
fila é **o mesmo que o toque único usaria**. Quem nunca olhar para a fila
aprende, pela ordem, que o jogo preferia aquele.

**Quando não cabem.** Em 359 px cabem ~5 pílulas de 68 px. Corpo a corpo o teto
real são as 8 casas adjacentes, e na prática 2–4. **Com arma de longe podem ser
todos**: seis inimigos, seis pílulas. Aí a fila rola na horizontal, e vale a
regra que E1 já fixou para a faixa da vez: **quem rola nunca é o primeiro** — o
mais perto fica fixado na ponta esquerda e nunca sai.

**E a linha do veredito sobe com o teclado**, como E2 fixou (`e2-jogo.md:613`).
Com o teclado aberto e a mira armada, **a fila de pílulas sobe com ela** — é a
única coisa desta tela que o polegar alcança quando metade do campo está tapada.

---

## 5 · O que o meu gesto exige do motor

*(A porta do tabuleiro — `casaDoEndereco`, `vereditoDoPasso`, `passo-no-campo` —
já está pedida por E2 §6 e **W1 não a repete nem a conserta**. O que segue é o
que o **gesto** precisa e que aquele pedido não cobre.)*

### 5.1 · `esperar` — passar a vez sem chamar o Mestre · **o item que mais paga**
`fecharMeuTurno` (`:14302`) já existe e já faz tudo: `resolverRevide` empurra as
linhas de sistema (o dano já aplicado) e devolve um `resumo`. O que falta é um
chamador que **não faça `enviar`** e em vez disso **acumule o `resumo` em
`notaRef`**, para viajar colado à próxima acção de verdade. **O padrão já existe
neste arquivo, palavra por palavra:** é o que `moverPara` faz (`:14568`).

**O que isto vale, medido:** a abertura de toda luta corpo a corpo passa de
**~22 toques e 1 chamada** para **2 toques e 0 chamadas** — 10/10 plantas, 1,4
vezes por luta. É, de longe, o maior número desta etapa, e custa menos código do
que qualquer outra linha dela.

### 5.2 · `declararGolpe(alvo, motivo)` — o golpe carrega o que está na caixa
Hoje `declararGolpe` (`:11966`) ignora `entrada` e o painel limpa-a
(`:20929`). **O que o jogador escreveu tem de viajar como `motivo`**, exactamente
como `declararAcaoRapida(id, motivo)` já faz com os oito de baixo, e como
`fraseDaAcaoRapida` (`desafios.js:638`) já sabe colar.

**É o que faz W1 e W2 caberem na mesma tela sem se pisarem:** ele escreve *"pelo
flanco, no joelho"*, toca `Atacar`, **o motor rola o mesmo golpe e o Narrador
recebe o tempero**. Hoje ou escreve tudo (e o motor pode não pegar) ou toca o
botão (e a frase é deitada fora). **Zero caracteres novos no prompt por turno:**
a acção declarada já viaja em `enviar(...)` (`:11932`).

### 5.3 · `LINHAS_DO_GOLPE` — a tabela das frases, `larga` e `curta`
Em `golpe.js`, irmã da `RECUSAS_DO_PASSO` que E2 pediu, com os mesmos buracos
nomeados (`{alvo}`, `{metros}`, `{perde}`, `{ateOnde}`) e **a mesma catraca: um
teste que falha se qualquer `curta` passar dos 54 caracteres.** É o que impede
o §0.2 de voltar a acontecer na próxima vez que alguém reescrever uma frase.
Medidas por mim, na largura real:

| caso | a frase | car. |
|---|---|---|
| um ao alcance, sobra passo | `Bandido a 1,5 m — golpear agora perde 9 m de passo` | 50 |
| ↳ curta | `Bandido a 1,5 m — perde 9 m de passo` | 36 |
| um ao alcance, passo gasto | `Bandido a 1,5 m — golpe limpo` | 29 |
| o lembrado | `Bandido outra vez, a 1,5 m — golpe limpo` | 40 |
| dois ou mais | `ao alcance: Bandido 1,5 m · Troll 3 m · Corvo 4,5 m` | 51 |
| ↳ curta | `ao alcance: Bandido · Troll · Corvo` | 35 |
| armado | `escolha no campo — toque fora para desistir` | 43 |
| sob o dedo | `Bandido em K14, a 1,5 m — golpe limpo` | 37 |
| longe, com saída | `Bandido a 12 m — vá até K9 e o golpe alcança` | 44 |
| parede, com saída | `parede até Bandido — contorne por K11` | 37 |
| passo acabado (curta) | `o passo acabou — o golpe fica para a próxima` | 44 |
| é a vez de outro | `é a vez de Halvard` | 18 |

### 5.4 · O veredito tem de dizer **o que a rodada perde**
`vereditoDoGolpe` mede geometria; quem sabe do passo por gastar é
`combate.economia.movM` (`:14524`). **Peço um argumento a mais e um campo a
mais** — `passoRestanteM` entra, `perdeM` sai. É conta, não frase. **Sem ela a
regra do toque único do §2.1 não é comprada**, porque um toque que queima 9 m de
passo em silêncio é um preço não mostrado, e isso é a lei da casa de cabeça para
baixo.

### 5.5 · `ondeOGolpeAlcanca(caminho, alvo, alcanceM)` — a saída da recusa
Hoje a recusa diz *"Aproxime-se primeiro"* e cala-se. **O jogo sabe até onde**,
e não o diz. Peço o primeiro quadrado do **caminho** (não do campo) de onde
`alcanca` devolve `ok`. **É varredura sobre ≤ 12 quadrados, não sobre 84 casas ×
N inimigos** — deliberadamente, porque a versão de área seriam ~336 testes de
linha de visão por render, que eu não medi e não vou fingir que medi.

Com ela, a abertura de toda luta passa a ter uma resposta escrita:
`Bandido a 12 m — vá até K9 e o golpe alcança` (44 car.), e a casa **K9 acende**.
**O turno 1 deixa de ser um turno a adivinhar.**

### 5.6 · A memória do alvo tem de sobreviver à rodada
`alvosGolpeRef.current = []` (`:11921`) limpa tudo no fim do golpe, logo **hoje
nada lembra nada**. Peço um `ultimoAlvoRef` **separado**, que não é limpo no fim
do golpe, que morre quando o alvo cai ou quando a luta acaba, e que **nunca é
usado sem passar pelo filtro de `vd.aoAlcance` que já existe** (`:11988`).

### 5.7 · O que eu NÃO peço
- **Nenhuma mecânica nova para `Esquivar`, `Empurrar` e `Derrubar`.** É `pesado`,
  é da pessoa, e está no §7.
- **Nenhum encadeamento** (*andar → atacar, pago de uma vez*). É a proposta A de
  E1, já na mesa dela, e exige que o motor segure um turno por confirmar.
- **Nenhum alcance medido a partir de uma casa onde o herói ainda não está.**
  E2 pediu-o para a frase encadeada; **o meu gesto não precisa dele**, porque o
  passo resolve-se de imediato e a tela recalcula o veredito no render seguinte.
  *Digo-o para não pedir duas vezes a mesma coisa cara.*

---

## 6 · Os pedidos ao `desenho` — três, e um é o único que bloqueia

**1 · A fileira é de QUATRO e uma goteira, numa fila de 44 px.** *(bloqueia; e é
o que muda o que ele possa estar a compor agora)*
Não seis, não três filas. A razão é do §0.3 e é medida em motor, não em gosto:
`golpe.js:222-254` diz por escrito que três dos seis não chegam a motor nenhum.
`Atacar` continua o único *Papel=Chamada*, e a diferença dele passa a ser
**preenchimento e tinta**, não escala — em 359 px, 163 contra 72/44/44.
**E devolve 88 px ao campo: +1 fila de casas, 7×13 = 91.**

**2 · Uma MARCA DE ALVO sobre a ficha — peça nova, pequena, e é a única.**
O golpe escolhe **gente**, não chão, e o campo não tem tinta livre: âmbar é o
passo, violeta é a habilidade, vermelho já faz três trabalhos. **Não peço uma
quarta tinta de chão: peço um anel/aro sobre o token do inimigo** que o golpe
armado pode tocar, com dois graus (*Ao alcance* · *Escolhido*) e o nome nunca só
por cor (WCAG 1.4.1 — a fila de pílulas do §4 é o canal escrito). Um tratamento
de chão aqui ensinaria que o golpe e o passo são o mesmo verbo.

**3 · A fila de pílulas do polegar — confirma-me que `A escolha` *Forma=Pílula*
chega.** Preciso de *Escolhida* e de uma marca de *"este é o que o toque único
usaria"*. **Se *Escolhida* cobrir as duas, não há peça nova e eu prefiro assim.**
Se não cobrir, a decisão da forma é tua — eu só declaro que a pílula e a marca
da ficha **acendem juntas, desarmam juntas e escrevem a mesma linha**, senão
nasceram duas formas para a mesma acção, que é o defeito que esta mesa existe
para matar.

**E uma coisa que eu declaro não precisar, para não nascer duas vezes:** a linha
do veredito é **a mesma `Consequencia` *Forma=Linha* de sempre**, o mesmo sítio e
os mesmos pixels que o clique, a frase digitada (E2) e a reação (K1) já usam.
**Zero peça, e é de propósito:** quatro coisas a partilhar uma linha é o que
prova que elas são a mesma conversa.

---

## 7 · Para a pessoa decidir

### A · **A luta abre onde a sala é comprida — e ninguém decidiu isso**

**O que ele vive hoje, contado no §1.** A abertura de toda luta sai de
`posicionar` (`grid.js:569-575`): o herói em `y = altura − 1`, os inimigos em
`y = 0`. Logo **a distância de abertura é a altura da planta**, e mais nada.

Olhe o que isso produz:

> **A masmorra abre a 25,5 m porque é ESTREITA (7×18), não porque é longe.
> A taverna abre a 12 m porque é BAIXA (12×9), não porque é apertada.**
> **A forma da sala decide a distância do combate, e é um acidente da razão de
> aspecto do desenho da planta.**

**A conta:** 10/10 plantas recusam o golpe corpo a corpo no turno 1; **1,4
rodadas por luta** são só caminhada (2 na masmorra, no navio, no gelo e na
floresta); e hoje cada uma delas custa ~20 toques de teclado e uma chamada ao
Mestre para virar (§1). O arqueiro não paga nada disto: alcança em 10/10 no
turno 1. **O jogo cobra um imposto de caminhada a quem luta de perto, e cobra-o
por engano.**

**A proposta.** A distância de abertura **sai de uma tabela** — por cenário e
por como a luta começou — e **nunca dos cantos da planta**. A emboscada abre
colada; a perseguição abre longe; a rixa de taverna abre a 3 m porque uma
taverna é pequena. A regra da tabela: **pelo menos um inimigo tem de estar
dentro do primeiro passo de alguém.** *(E o motor já tem o embrião disto e
ninguém reparou: `posicionar:573` já abre o inimigo `agil` a meio campo. Já há
uma alavanca — o que falta é ela ser uma tabela em vez de um booleano.)*

**Porque isto muda o que o jogador vive.** Porque o turno 1 passa a ter uma
**decisão** em vez de um passo obrigatório. Hoje a primeira coisa que toda luta
ensina é *"ande em frente"*; com isto, a primeira coisa que ela ensina é *"onde
é que eu me ponho"* — e o campo já tem tudo para essa pergunta valer a pena
(cobertura, terreno que cobra, golpe livre, alcance por tamanho). **A regra está
toda lá; o que falta é a luta começar perto o bastante para alguém a usar.**

**Porque é dela.** É regra, é tabela nova, é `backend` — e o jogador reaprende
uma coisa só, mas é grande: **que a luta começa em contacto.** Isso é fluxo.

**O risco, dito por mim.** A aproximação é onde a posição vale alguma coisa;
abrir tudo colado achataria o combate no sentido oposto. **A defesa é a própria
tabela:** ela não diz "colado", diz "dentro do primeiro passo **de alguém**" —
e "alguém" pode ser o arqueiro, o que deixa o corpo a corpo com uma rodada de
aproximação que agora é **uma escolha** (avançar sob fogo ou cobrir-se) em vez
de uma caminhada.

### B · Os três verbos de teatro: dar-lhes motor, ou tirá-los da tela

`golpe.js:222-254` escreve, com o motivo, que `Esquivar`, `Empurrar` e
`Derrubar` não chegam a motor nenhum. X2 preferiu **escrever o buraco a
remendá-lo**, e teve razão: dar-lhes mecânica é decisão dela.

**Está na mesa há uma fase, e W1 obriga-a a sair de lá**, porque uma barra fixa
não pode carregar teatro (§3). **Duas saídas, e as duas são dela:**

- **Dar-lhes motor.** `Empurrar` e `Derrubar` são disputa de força — e o motor
  não tem disputa entre duas fichas, que é a peça que falta. `Esquivar` é mais
  barato: **a condição `protegido` já existe em `condicoes.js`** e nada a
  concede a partir de uma declaração do jogador. *É a mais barata das três e a
  que mais muda o combate*, porque é a única decisão defensiva que o jogador
  hoje não tem.
- **Tirá-los.** Com W2 a transformar a caixa em fala, *"empurro com força"* é
  **uma fala**, e uma fala num sítio onde a fala passa a morar não é uma perda.
  **Eu defendo esta, se só houver uma:** os doze botões de `Ações` são, medidos,
  **um teclado de atalhos**, e um teclado de atalhos é o oposto do que esta fase
  entrega. Mas isto tira ao jogador coisa de que ele depende — **logo é dela, e
  eu não a decido.**

---

## 8 · A contagem final, lado a lado

| o que o jogador quer | hoje | com W1 |
|---|---|---|
| andar até uma casa | 1 | **1** (igual) |
| golpe, um alvo ao alcance | 2 | **1** |
| golpe, o alvo da rodada passada | 2 (e escolhe sozinho) | **1** |
| golpe, ≥2 ao alcance, alvo novo | 3 (e pode trocar em silêncio) | **2** |
| passar a vez | ~20 de teclado + 1 + **1 chamada** | **1**, zero chamadas |
| **turno 1 de toda luta corpo a corpo** | **~22 e 1 chamada** | **2**, zero chamadas |
| turno completo: andar + golpear (um alvo) | 3 | **2** |
| turno completo: andar + golpear (escolhendo) | 4 | **3** |
| **pior caso** — andar, armar, mudar de ideias, armar, escolher | — | **5** |
| dizer *como* junto (W2) | impossível: a frase é deitada fora | **+0 toques** |

**O caso comum é 2 → 1. A abertura de toda luta é ~22 → 2.** E o número que não
é de toques: **−1,4 chamadas ao Mestre por luta**, que é quota devolvida ao
Narrador exactamente como W2 promete fazer, uma etapa antes de W2.

---

## O que eu não sei, e o que não foi provado

- **Não joguei isto, porque não existe.** Tudo o que tem número aqui saiu de
  correr o código de hoje em Node (`PLANTAS` × `posicionar`; as frases medidas
  caractere a caractere contra o teto de E2) ou de o ler linha a linha, com a
  linha citada. Onde é ofício, disse que é ofício. **O par comparável — jogar o
  antes e o depois — é da etapa que construir.**
- **Não medi o custo da marca de alvo por render.** Ela é `vd.aoAlcance`, que a
  tela já calcula uma vez por render do painel (`:20846`), logo **acredito** que
  seja de graça — mas acreditar não é medir, e está escrito aqui para não passar
  por medida.
- **Os 6,0 px por caractere são de E2**, medidos na peça por ele. Se a
  tipografia mudar, a catraca do §5.3 é a única coisa que sobrevive; as minhas
  tabelas de caracteres não.
- **Não sei o que acontece à regra do alvo único quando o jogador tem DOIS
  golpes por turno** (`ataquesPorTurno`, `:20802`). O `PainelCombate` declara
  golpe a golpe; a minha fileira declara um verbo. **É o primeiro sítio onde
  este gesto não fecha**, e não tenho resposta hoje.
- **Não sei o que o gesto faz numa sala com dois jogadores.** É o mesmo buraco
  que E2 declarou e que continua aberto.
- **A "fila de pílulas + marca na ficha" é a coisa desta etapa que mais se
  parece com duas formas para uma acção.** Defendi-a no §4 e mantenho a defesa,
  mas **se o `desenho` disser que é duas formas, o lado dele entra aqui e a
  decisão é escrita, não codificada** — é a lei da dupla, e este é o sítio onde
  ela se aplica.

---

# Reconciliação — as três respostas ao `regente` (15/09, depois de ver o `desenho`)

*Tudo acima foi escrito sem o ver. Não reescrevo nada disso: fica como o registo
do que eu pensei sozinho, que é o que dá valor ao par ter batido certo. O que
segue são só as três respostas, e uma delas é uma correcção a ele.*

**Aceito as três decisões do `regente` sem discussão**, e uma com alívio: o
`Atacar` perder o `Papel=Chamada` porque **`Chamada` já é âmbar cheio em
repouso** é exactamente o argumento que eu não tinha como fazer — eu não medi a
peça, ele mediu. E a conclusão é melhor que a minha premissa: **o âmbar cheio
fica exclusivo do armado**, logo o jogador aprende que *cheio = isto está à
espera do teu segundo toque*, num canal só, em toda a tela. A minha frase
(*"paga-se no preenchimento e na tinta, não no tamanho"*) estava certa na
intenção e errada no canal; fica **a largura**, 163 contra 72/44/44, que é a
minha própria conta e fecha em 359 exactos.

---

## R1 · A rota no telefone — **corrijo, e é a observação dele que dá a correcção**

**Ele tem razão no facto: durante o arrasto a rota está debaixo da mão.** Mas a
consequência não pode ser *desenhá-la na largada*, e a razão é a lei desta casa:

> **Na largada o passo ACONTECE** (passo limpo, um toque, `App.jsx:14497`). Uma
> rota que só aparece na largada é **uma rota desenhada depois da decisão** — a
> fotografia de uma coisa que já foi paga. E ela já existe, aliás: é o `andando`
> de `grade-de-batalha.jsx:635-637`, o caminho **andado**. Desenhar a prevista
> ali seria a mesma linha duas vezes, uma delas tarde.

**A correcção, em três frases:**

**1 · No telefone a rota não é o canal. A linha é.** E não sou eu a inventá-lo:
E2 já o fixou (`e2-jogo.md:613`) — *"a linha do veredito é o canal principal; o
campo é o secundário"*, e *"a decisão não pode depender de ele ver a casa"*.
Durante o arrasto, o que corre continuamente é a **linha**, em baixo, acima do
polegar, **e ela nunca está debaixo da mão**. `K14 · 4,5 m · custa um golpe
livre` atravessa o arrasto inteiro. **Custa zero pixels: a linha já é
permanente.**

**2 · A rota desenha-se durante o arrasto na mesma, e não é desperdício.** A mão
tapa o segmento **entre o herói e o dedo** — que é o que o jogador menos precisa
de ver, porque é por onde ele já decidiu passar. O que fica visível são as
**duas pontas e os desvios**: o tracejado a contornar a parede aparece **ao
lado** da mão, não por baixo. E o trabalho da rota no telefone não é *ler o
caminho*: é **ver que há um desvio**. Isso sobrevive a uma mão em cima.

**3 · E eu confirmo o gesto que a pergunta dele pressupõe, porque é o único jeito
de um ecrã táctil ter "antes do clique": pressionar · arrastar · largar.**
Um contacto = um toque, a minha contagem do §8 não se mexe, e o arrasto é o
`hover` que o dedo nunca teve. **Com duas condições, e as duas são minhas:**

- **A saída existe e é o próprio gesto.** Arrastar de volta para a casa do herói,
  ou para fora do campo, e largar = **não aconteceu nada**. Um gesto que se
  começa e não se pode abandonar é o `Véu sem retorno` montado por acidente — e
  num arrasto ele é pior que num modo, porque o dedo já está comprometido.
- **O arrasto disputa com o deslocar do campo, e alguém vai ter de decidir isto
  com o dedo na tela.** São 7 de 18 colunas: o jogador **tem** de poder arrastar
  o campo. A regra que eu proponho, e é a mais barata que existe: **um arrasto
  que COMEÇA numa casa alcançável mira; um arrasto que começa em qualquer outro
  sítio desloca o campo.** O conjunto alcançável já está calculado e já é a
  fronteira de tudo o resto nesta tela. *Não medi isto com um dedo real, e digo-o
  aqui para não passar por medido.*

---

## R2 · A colisão das duas linhas — o que a pílula não pode perder, e a saída que custa zero

**Primeiro, a resolução, porque ela dissolve a colisão em vez de a arbitrar:**

> **A segunda linha fixa e a fila de pílulas são EXCLUSIVAS POR ESTADO, e nunca
> aparecem ao mesmo tempo.**
>
> A cauda *"toque fora para desistir"* só faz sentido num estado **armado**. E,
> pela minha composição, **todo estado armado do golpe tem ≥2 pílulas** — porque
> com um alvo só não se arma, resolve-se (§2.3), e depois da decisão do `regente`
> **só `Atacar` se arma**. Logo não há estado armado sem pílulas. **A cauda não
> precisa de uma linha própria: ela viaja DENTRO da fila**, e os 6 px fixos que
> ele reservou podem não ser gastos.

Se ainda assim ele preferir fundir as duas numa faixa que troca de conteúdo por
estado, **é forma e é dele**. O que eu declaro como intocável:

**1 · O nome escrito do alvo. Não é negociável, e é literalmente a conformidade
da etapa.** Os quatro cantos de `A casa` *Estado=Alvo* são **forma e cor**; a
pílula é **o único canal escrito do alvo**. Sem o nome, distinguir dois alvos
passa a depender de posição no tabuleiro — e WCAG 1.4.1 cai, na tela onde errar
custa a rodada. *Se a fusão tiver de comer alguma coisa, come a cauda da
desistência, nunca o nome: a saída tem mais dois canais vivos (o `Atacar` aceso e
qualquer casa onde dá para andar), e o nome do alvo não tem nenhum.*

**2 · Os ≥44 px de toque.** A pílula **não é um rótulo, é um alvo de dedo**. Uma
faixa de 24 px de texto não a carrega sem crescer. Se a fusão for uma faixa que
troca de conteúdo, **ela tem de ter duas alturas por estado** — e isso é o
oposto do defeito que E1 mediu no `Botao` *Impedido* (19 px que empurram o
tabuleiro), porque aqui a troca acontece **no toque do jogador**, não sozinha, e
ele está a olhar para o sítio exacto onde ela acontece.

**3 · A ordem por distância, e o primeiro fixado na ponta esquerda.** É o que
ensina, sem uma palavra, qual é o alvo que o toque único usaria (§4).

**4 · Acender e desarmar no mesmo quadro que os cantos da ficha.** Se puderem
dessincronizar, nasceram duas formas para a mesma acção — e aí a minha defesa do
§4 cai e ele tem razão contra mim.

**E a minha dívida fica paga aqui:** eu escrevi no §4 que a fila de pílulas era
*"a coisa desta etapa que mais se parece com duas formas para uma acção"*, e
deixei a decisão em aberto. **Com `A casa` *Estado=Alvo* fabricada — cantos sobre
a criatura, não tinta no chão — deixa de haver dúvida:** a marca é a **forma** e
a pílula é o **texto** da mesma coisa, como o `aria-label` e o desenho da casa já
são hoje. Não são duas formas; são os dois canais que a lei exige que toda
informação de combate tenha.

---

## R3 · Os 88 px — o que se apoiava neles, e o que não

**Nenhuma contagem de toques se apoia na altura da fileira.** A tabela do §8 é
sobre *quantas vezes o dedo desce*, e não muda com 44, 63 ou 201 px. **Nada nela
se recalcula.**

**O que se apoiava nos 88, e onde está, para o número velho não ficar vivo em
duas versões — as três ocorrências:**

| onde | o que diz | estado |
|---|---|---|
| §3, `w1-jogo.md:331-332` | *"Devolvo 88 px… +1 fila: 7×13 = 91 casas"* | **substituído pela medida do `desenho` (201 → 63)** |
| §4, `:345` | *"84 casas (7×12) hoje, 91 com a fila devolvida"* | idem |
| §6, pedido 1, `:479` | *"devolve 88 px ao campo: +1 fila, 7×13 = 91"* | idem |

*(A ocorrência de `:327` é diferente e fica de pé: é a citação da contradição
interna de E1 — 88 num sítio, três filas de 44 noutro. Continua a ser verdade
sobre o documento dele, e agora ganha um terceiro número, que é o certo.)*

**Não recalculo as casas, como me foi pedido — mas registo a direcção, que é a
minha metade da conta e que a medida dele só reforça:** com a tira de controlos a
encolher de 201 px para 63, **a linha do veredito e a fila de pílulas descem ~138
px**. O arco do polegar chega aos ~520–560 px de baixo (E1); tudo o que eu pus
naquela faixa fica **mais fundo no arco, não menos**. **O único argumento de
enquadramento que eu fiz no §4 — que a linha e as pílulas são o que o polegar
alcança quando metade do campo está tapada pelo teclado — fica mais forte com o
número dele do que com o meu.**

E uma consequência que é minha e que ninguém pediu, mas que vem de graça com a
fila única: **a barra de verbos deixa de poder mudar de altura no meio do
turno.** Com uma fila e um só verbo que arma, não há `Botao` *Impedido* a crescer
19 px por baixo do tabuleiro — que era o pedido 10 de E1 ao `desenho`, ainda em
aberto. **A fileira de quatro fecha-o por composição, sem lhe custar uma peça.**
