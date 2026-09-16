# K2 · a trava, antes de tudo (bloco do `desenho`)

Fase K — a reação ganha controle. **Nenhum `.js`, `.jsx` ou `.mjs` foi tocado.**
Arquivo Figma `Taverna — biblioteca` (`e5wJUzInAssoebx5npssKc`), **ampliado, nunca
duplicado**. Folha nova: **`K2 · a trava`** (`140:429`, 1500×2339), na página
`A pergunta que expira` (`31:242`), a seguir a `K1 · a prova` e `K1b · a prova`.

> **K1 e K1b decidiram a forma. K2 não redesenha nada.** O que esta etapa entrega é
> o lado de forma da trava: as garantias que uma suíte de Node não apanha sozinha, e
> os números que as sustentam. **Duas coisas que eu julgava saber não sobreviveram a
> ser medidas, e as duas estão escritas abaixo com o nome de quem as escreveu errado
> — eu.**

O enunciado da pessoa, que é a régua de tudo o que vem a seguir:

> *Quem não responde à janela da reação tem o jogo de hoje, byte a byte. O jogo tem
> de continuar jogável exatamente como é para quem ignora o botão, para quem joga sem
> mouse, e para quem está numa aba lenta. Prove antes de a peça existir.*

---

# PARTE 1 · SEM MOUSE

## 1.1 · O estado de foco existe — em duas peças de três, e a que falta é a do caso comum

**Fui ao Figma conferir em vez de declarar, e o retrato é misto.** Lido nó a nó, não
por imagem:

| peça | nó | eixos | tem `Foco`? |
|---|---|---|---|
| **`A pergunta que expira`** | `31:518` | `Etapa` (4) × `Tempo` (3), 8 variantes | **não**, e não devia — é o contentor |
| **`O verbo com preço`** | `64:2446` | `Papel` (3) × **`Estado` (Repouso · Foco · Impedido)**, 8 variantes | **sim**, nos três papéis |
| **`A escolha`** | `20:77` | `Forma` (3) × **`Estado` (Repouso · Escolhida · Impedida · Foco)**, 12 | **sim**, nas três formas |
| **`O chamado`** | `62:2453` | `Forma` (2) × `Tempo` (3) × `Pressa` (2), 10 variantes | **NÃO** |

**K1 declarou a ausência e escreveu a razão:** *"o chamado está focado desde o
instante em que existe, logo uma variante Foco seria a única alguma vez usada. É
forma transversal, em `:focus-visible`."*

**A razão está errada, e a composição da própria peça prova-o.** Li o interior das
variantes:

```
Etapa=Direta,   344×118  =  o chamado (INSTANCE, Forma=Verbo, 56 px)
                         +  o recuo (INSTANCE de O verbo com preço, Papel=Recuo, 48 px)
Etapa=Chamando, 344×118  =  o chamado (INSTANCE, Forma=Chamada, 56 px)
                         +  o recuo (idem)
```

**O cartão do caso comum tem DUAS paradas de tabulação, não uma.** O foco nasce na
primeira e vai à segunda quando o jogador carrega em Tab — e volta. Ou seja: o
chamado **não** está focado desde o instante em que existe; ele perde o foco e
recupera-o, e é a peça mais visitada da fase (`Etapa=Direta` é o padrão para
**12 classes em 12**).

**Não abri um eixo, e a recusa é a de K1, agora com o argumento certo.** Abrir
`Estado` em `O chamado` levaria 10 variantes a 20 por causa de um anel que é
`:focus-visible` — forma transversal, que não é propriedade de componente nenhum.
**O que faltava não era a variante: era o desenho do anel existir em algum lado para
o chamado, e a razão estar escrita onde alguém a lê.** As duas coisas foram feitas:
o anel está desenhado na folha `K2 · a trava`, e a descrição de `O chamado`
(`62:2453`) ganhou o bloco `[K2 · a trava]` com a correção e as medidas.

## 1.2 · A ordem de tabulação do momento inteiro

Desenhada, parada a parada, na secção **`a ordem de tabulação`** da folha
(`140:433`) — três regiões, com os discos numerados alinhados aos alvos de verdade.

**A · o caso comum (`Etapa=Direta`) — duas paradas.**

```
1  o verbo        O chamado · Forma=Verbo         56 px
2  deixar passar  O verbo com preço · Papel=Recuo  48 px
```

**B · duas ou mais (`Chamando` → `Escolhendo`) — o chamado, depois uma região só.**

```
(chamado)  1 parada
   ↓ Enter / Espaço abre o leque
1..n  as respostas   48 px cada, vão de 6   —  UM ponto de tabulação (role="menu")
      setas andam linha a linha · Enter responde · Escape = deixar passar
      atalhos 1..4 e 0, visíveis só quando o último dispositivo foi o teclado
      trava de 150 ms nas linhas recém-reveladas
```
*(o leque construído em `31:419` tem três linhas: `Contramágica` armada,
`Escudo Arcano`, `Deixar passar` — 48+6+48+6+48 = 156, dentro dos 215 do cartão.)*

**C · a ficha — a fila «quando um golpe chega», quatro paradas.**
`76:226`: quatro instâncias de `A escolha · Forma=Pílula`, 47 px, larguras
117 · 180 · 124 · 124, vão de 8, **com `layoutWrap = WRAP`** — a 410 px de
contentor ela quebra em duas linhas de duas. Aqui não há relógio: o Tab é barato, e
as quatro pílulas são quatro paradas, na ordem em que se leem.

## 1.3 · Onde o foco está quando a janela abre, e para onde volta quando ela fecha

**Esta é a metade da trava que ninguém tinha escrito**, e é onde um jogador de
teclado fica pior do que um de mouse sem que nada na tela pareça errado. A tabela
está desenhada na folha (`143:488`) e é esta:

| o instante | onde fica o foco | por quê — e é a trava |
|---|---|---|
| **a janela abre** | **vai para a parada 1 do cartão** | Gestão de foco na revelação (ARIA Authoring Practices). É a única viagem que o sistema faz pelo jogador, e ela poupa-lhe Tab dentro de uma janela que tem relógio. |
| **ele responde** | **volta ao elemento que tinha o foco antes** | O cartão sai; o foco não pode cair no `<body>`, senão o Tab seguinte recomeça no topo da página — e ele acabou de perder o lugar onde estava a jogar. **Guardar o elemento anterior antes de mover o foco é obrigação de K3.** |
| **ele recusa** (Escape / `0`) | idem — volta ao elemento anterior | Recusar é uma resposta; o rasto é o mesmo, e a linha do log também. |
| **a janela EXPIRA** | **não se mexe. Fica onde estiver.** | **Aqui está a trava, e é uma frase só: quem não respondeu não pediu nada.** Mover-lhe o foco seria o sistema a agir no teclado de quem escolheu ignorar o botão — e o enunciado diz *byte a byte o jogo de hoje*, onde nada mexe no foco de ninguém. Se ele estava a escrever no campo, continua a escrever, com o cursor onde ficou. |
| **o cartão resolvido sai** | **não se mexe** | `Etapa=Resolvida` **não contém alvo nenhum** (li o nó: `a resolução`, 341×56, sem instância de controlo). A resolução é leitura, não controlo, e por isso não tem parada de tabulação. |

**A assimetria entre as duas últimas linhas e as três primeiras é o desenho inteiro
desta secção.** O foco só se move para quem agiu; nunca para quem não agiu.

## 1.4 · O alvo de toque — o número de hoje, medido no código

**Medido, não estimado.** Tailwind v3 pela CDN (`index.html`), raiz de 16 px. Li a
tag de abertura de cada `<button>` com as chaves equilibradas, em `App.jsx`,
`ui.jsx`, os dez `painel-*.jsx` e `grade-de-batalha.jsx`:

> **215 `<button>`. 194 com altura calculável. Menor 20 px · mediana 30 px · maior
> 80 px.**

| régua | fonte | quantos ficam abaixo |
|---|---|---|
| **24×24 CSS px** | **WCAG 2.2, SC 2.5.8 *Target Size (Minimum)*, nível AA** | **14 de 194 — 7,2 %** |
| **44 pt** | **Apple, Human Interface Guidelines** | **169 de 194 — 87,1 %** |
| **48 dp** | **Material Design** | **177 de 194 — 91,2 %** |

Os mais baixos, com endereço: `h-5` (20 px) em `App.jsx:21035`, `App.jsx:21045` e
`painel-ficha.jsx:66`; e `py-0.5 text-[10px]` em `painel-diario.jsx:142`. O `Botao`
de `ui.jsx` mede **46 px** no normal (`text-sm` 20 + `py-3` 12×2 + borda 2) e
**30 px** no `pequeno` (`text-xs` 16 + `py-1.5` 6×2 + borda 2).

**E a peça da Fase K entra acima de tudo isto:**

| alvo | altura | contra 2.5.8 | Apple 44 | Material 48 |
|---|---|---|---|---|
| a linha do leque (`O verbo com preço`) | **48 px** | 2,0× | passa | passa |
| o chamado (`O chamado`) | **56 px** | 2,3× | passa | passa |
| a pílula da ficha (`A escolha`) | **47 px** | 2,0× | passa | **falha por 1 px** |

> **A conclusão, e ela é boa e má ao mesmo tempo.** A janela de reação não precisa de
> conserto nenhum: a mediana dela é 48 contra os 30 da casa. **O que K2 tem de
> impedir é que K3 herde os 30** — e a casa não tem régua escrita em lado nenhum, por
> isso cada controlo novo é uma moeda ao ar. É daí que sai a proposta ambiciosa.

**A honestidade que o número exige:** o SC 2.5.8 tem uma **excepção de espaçamento**
(um alvo menor passa se um círculo de 24 px centrado nele não cruzar o círculo de
outro alvo). **Eu não medi espaçamento.** Logo o número honesto é **14 candidatos a
falha**, não 14 falhas — e dizê-lo de outra maneira seria a mesma afirmação
confortável que já me apanhou duas vezes.

## 1.5 · O anel de foco, medido

K1 fixou `box-shadow: 0 0 0 2px T.bg, 0 0 0 4px T.ink` e mediu uma coisa só
(`ink`/`panel`). **Um anel tem dois contrastes, e o segundo nunca tinha sido medido:**

| | medido |
|---|---|
| o traço externo `ink` / `panel` (o cartão) | **14,37:1** |
| o traço externo `ink` / `bg` (o tabuleiro) | **15,31:1** |
| o halo interno `bg` / `amber` (o chamado, cheio) | **9,00:1** |
| **o halo interno `bg` / `panel` (o gesto, contornado)** | **1,07:1** |

**O 1,07 não é defeito, e conferi antes de o dizer.** O halo não existe para ser
visto contra o cartão — existe para **separar o traço do corpo do controlo**. Quem
carrega o sinal é o traço, a 14,37:1. Contra um corpo âmbar o halo ainda lê a
9,00:1; contra um corpo transparente ele é **um vão de 2 px**, que é exatamente o que
deve ser. *(É o mesmo `bg`/`panel` = 1,07:1 que K1 mediu para provar que a casa não
tem segundo tom de superfície — e aqui, pela primeira vez, esse número trabalha a
favor.)*

**E a norma que ninguém tinha citado: WCAG 2.2 SC 2.4.13 *Focus Appearance* (AAA)**
pede área do indicador ≥ perímetro do alvo × 2 CSS px. Medido nas três peças:

| alvo | anel de 2 px | mínimo | veredito |
|---|---|---|---|
| a linha do leque (329×48) | 1508 px² | 754 px² | **2,0×** |
| o chamado (341×56) | 1588 px² | 794 px² | **2,0×** |
| a pílula (90×47) | 548 px² | 274 px² | **2,0×** |

Passa nas três, com o dobro, contando só os 2 px de `ink` (os 2 px de `bg` são vão).
Para comparar, o contorno de repouso: `lineStrong`/`panel` = **3,51:1**, sobre o piso
de 3:1 do SC 1.4.11.

## 1.6 · O defeito que eu encontrei ao medir, e ele é meu

**O anel está desenhado de DUAS maneiras em duas peças, e a lei da casa é *uma ação,
uma forma*.** Lido nó a nó:

| peça | como o `Foco` é construído | a caixa da variante |
|---|---|---|
| `O verbo com preço` · `Estado=Foco` | o `corpo` carrega **2 efeitos** (as duas sombras do `box-shadow`) | **48 px, igual ao repouso** |
| `A escolha` · `Forma=Pílula` · `Estado=Foco` | um frame `anel de foco` com **`strokeWeight: 2`** | **75 px contra 47 — cresce 28** |

**O Figma desenha o anel como geometria porque não tem `box-shadow` de espalhamento
com dois degraus; em código ele é `box-shadow` e não ocupa leiaute nenhum.** O
problema não é a peça: é que a peça **não diz isso**, e quem construir a partir dela
instala um contorno que empurra os irmãos. **A fila «quando um golpe chega» são
quatro pílulas lado a lado com `WRAP`: uma fila que se mexe quando o foco entra é um
alvo em movimento — para o jogador de teclado, que é exatamente quem aquela fila
existe para servir** (é a saída de conformidade da WCAG 2.2.1 da Fase K inteira).

**Está escrito onde alguém o lê: a descrição de `A escolha` (`20:77`) ganhou o bloco
`[K2 · a trava]`.** Não reconstruí a variante — `A escolha` tem instâncias vivas, e
mexer-lhe na geometria por causa de uma nota é o tipo de conserto que parte três
composições para arrumar uma frase.

---

# PARTE 2 · A ABA LENTA

## 2.1 · O que o navegador estrangula, e o que não estrangula

| | numa aba escondida |
|---|---|
| **`requestAnimationFrame`** | **não corre.** Um documento escondido não recebe oportunidade de pintura; o laço simplesmente para. |
| **`setInterval` / `setTimeout` repetido** | **limitado a um disparo por segundo.** No Chrome, depois de cinco minutos escondida, a **um por minuto** (*intensive throttling*). |
| **animação CSS** | **continua a avançar**, porque a linha de tempo do documento é tempo, não quadros — só não é pintada. |

**A última linha é a que me obrigou a reescrever o argumento que eu tinha preparado.**
Eu ia escrever *"o CSS mente numa aba de fundo"*. **Não mente.** O que acontece é
pior de explicar e igualmente fatal: um trilho em CSS mais um temporizador em JS são
**dois relógios**, e eles divergem sob estrangulamento **na direção cruel** — a
animação chega a zero na hora certa e o temporizador da expiração chega atrasado, ou
seja **a barra esvazia-se com a janela ainda aberta**. Uma barra que diz "acabou"
quando não acabou é a mesma mentira do lado avesso.

## 2.2 · A lei, e é uma frase

> ## O trilho não tem relógio próprio. Ele é uma leitura do relógio da janela.
>
> A janela tem **um** instante de nascimento, `t0`. Tudo o que se vê deriva de
> `agora − t0`, lido do relógio de parede: **se** há trilho, **qual** variante de
> `Pressa`, e **quanto** do cheio. Nada conta quadros, nada conta tiques, e o CSS
> nunca anima uma duração do relógio — **dois relógios são um a mais.**

**O que continua a poder ser CSS, e é a fronteira exata:** `tv-trilho-nasce`
(240 ms) e `tv-trilho-sai` (90 ms) animam a **aparição** do trilho, não a passagem do
tempo. A regra separa-as sem ambiguidade: *anima-se a entrada e a saída do objeto;
nunca o valor que ele mede.*

**Onde ela se prova:** no dente novo da Parte 4, `D5e.1` — e ele é um dente e não uma
asserção de suíte porque não há módulo para medir: o que se prova é que **o texto do
repositório** não contém o segundo relógio.

## 2.3 · O caso feio — a janela abre, a aba vai para trás, o jogador volta aos 40 s

Desenhado na folha, secção `a aba lenta` (`140:434`), com a faixa de 40 s a 30 px
por segundo.

```
0 ──────────────── 11 s ── 14 ── 15 ─ 16,2 s ─────────────────────── 40 s
   o cartão, sem     trilho   1 s    a resolução     não há nada.
   relógio nenhum    (âmbar) (danger) (1,2 s)        A luta está onde estava.
```

### A decisão: **a janela expira ao relógio de parede, olhasse alguém ou não.**

E a razão é tripla, e cada perna sozinha já bastava:

1. **O jogador podia congelar o combate mudando de aba.** Uma janela que pausa
   enquanto ninguém olha é uma pausa da luta — e a reação é um recurso por rodada.
2. **O resultado passaria a depender da visibilidade da aba**, que nenhuma semente
   reproduz. *Determinismo por semente* é a lei, e é o único árbitro que um sistema
   sem servidor tem.
3. **«o sistema responde como hoje» deixaria de ser verdade.** Hoje não há janela
   nenhuma: `escolherReacao` decide na hora. A trava só se cumpre se a expiração for
   garantida.

### E o que ele vê aos 40 s: **nada de novo — e isso É a trava, não um buraco.**

O cartão resolvido viveu os seus ~1,2 s e saiu, pelo mesmo relógio. Aos 40 s ele
encontra o tabuleiro exatamente como quem ignorou o botão o encontra: o golpe
resolvido, o instinto tendo aparado, e **a linha no log** — que é, byte a byte, o que
o jogo de hoje já lhe dá.

> **O cartão é o presente de quem está presente; o log é o chão de toda a gente.**

É por isto que as três frases de log de K1 (§*o estado «não vou reagir»*) deixam de
ser um mimo e passam a ser **a condição da trava**: sem a linha de quem expirou, o
jogador que voltou aos 40 s não tem por onde saber o que aconteceu, e aí sim teríamos
uma regressão contra o jogo de hoje.

**E não há mensagem nenhuma.** *«a sua janela expirou porque a aba estava em segundo
plano»* é o sistema a falar de si mesmo **duas vezes**: nomeia um mecanismo e ainda
lhe explica o navegador.

**O corolário duro, dito por inteiro em vez de escondido:** quem volta aos 14,5 s
apanha o trilho no último meio segundo, e é assim que tem de ser. Reiniciar o relógio
a quem muda de aba seria **dar mais janela a quem olha para outro lado** — uma
vantagem de jogo comprada com uma tecla. *O tempo era dele, e passou.*

## 2.4 · O achado: o anti-padrão já vive na casa, e é vizinho de K3

Fui varrer `src/` (179 arquivos) para saber contra o que a lei estaria a defender.
**Encontrei os dois padrões certos e o errado, e o errado está no arquivo ao lado de
onde K3 vai trabalhar:**

| | o quê | veredito |
|---|---|---|
| `App.jsx:509-514` | o d20: `const inicio = Date.now()` … `if (Date.now() - inicio > 1200)` | **certo.** O tique acelera ou atrasa; a condição de fim é relógio de parede. |
| `ui.jsx:655-660` | as brasas: `performance.now()` passado como tempo decorrido | **certo.** |
| **`grade-de-batalha.jsx:385-390`** | a caminhada: `let i = 0; setInterval(() => { i += 1; … }, ms)` | **o anti-padrão, vivo.** |

O terceiro **conta tiques, não tempo**. Numa aba de fundo, uma caminhada desenhada
para durar 420 ms passa a durar `rota.length` **segundos**. Ali é cosmético — uma
peça a andar devagar não mente sobre nada —, e é precisamente por isso que ninguém
reparou. **Se K3 copiar aquela forma para o trilho, o relógio mente.** Fica nomeado
como dívida declarada dentro do dente novo, com endereço.

Contagem de hoje, para o teto: `requestAnimationFrame` **2** (`ui.jsx`),
`setInterval` **3** (`App.jsx` 2, `grade-de-batalha.jsx` 1). `Date.now()` **23**,
`performance.now()` **1**.

---

# PARTE 3 · O +1 s DE `prefers-reduced-motion` — É VANTAGEM DE JOGO?

## 3.1 · A resposta é não, e tem número

**Onde o bónus entra** (`ritmo-da-reacao.js:57`, `:206-219`): `bonusContagem: 1000`
soma-se **ao trilho**, e a janela cresce por consequência.

| | com barra | com contagem | o que muda |
|---|---|---|---|
| folga | 11 000 | 11 000 | **nada. Zero.** |
| trilho | 4 000 | **5 000** | **+25 %** |
| janela | 15 000 | 16 000 | +6,7 % |

A invariante de K1b sobrevive: `11 000 + 5 000 = 16 000`. **Durante os primeiros
11 000 ms os dois jogadores têm exatamente o mesmo tempo, e sem relógio nenhum na
tela. O bónus vive inteiro dentro dos últimos 27 % da janela.**

**O que ele compra, e é leitura e não jogada.** Ele paga a diferença entre **ler uma
barra de canto de olho** — posição numa escala comum, a variável visual mais precisa
que existe (**Cleveland & McGill, *Graphical Perception*, JASA 1984**) — e **fixar um
numeral**. Uma fixação custa ~200-250 ms (**Rayner, *Psychological Bulletin*, 1998**,
sobre movimentos oculares na leitura). **+1 000 ms são quatro fixações**, e a contagem
com bónus mostra **cinco** numerais. *É paridade, e está no limite dela.*

**E a decisão não melhora com tempo.** Para 12 classes em 12 o leque tem **uma**
reação de `sofre_dano` (a contagem é de K1 e eu reproduzi-a), e a lista **nunca
consulta o dano** (`ritmoDaRodada`, a oferta). A decisão é binária: gasto PM ou não.
Pela lei de Hick o tempo de escolha cresce com `log₂(n+1)`, e **com n=1 ele é zero**.
O segundo a mais compra ler, não jogar melhor.

> **O veredito: não é vantagem de jogo. É compensação, e está exatamente no valor do
> custo que compensa.**

## 3.2 · Mas a lei que o sustenta não se sustenta sozinha, e o buraco tem uma linha

`ritmo-da-reacao.js:40-44` diz: *"A lei dos bónus é de **DIREÇÃO** —
`prefers-reduced-motion` não pode virar desvantagem de jogo."*

**Ela é verdadeira e é metade.** Uma lei só de direção **não tem teto**, e uma lei sem
teto não consegue dizer em que dia uma compensação virou prenda. Se amanhã alguém
escrever `bonusContagem: 4000` a lei aplaude: continua a andar na direção certa. **E
4 000 ms num trilho de 4 000 é dobrar a metade da janela que decide.**

**A outra metade, e ofereço-a redigida:**

> **O bónus nunca excede o custo medido da leitura que ele compensa.**
> Hoje: 4 fixações × 250 ms = **1 000 ms**, e `bonusContagem` é 1 000. *Está no teto,
> e o teto tem fonte.*

Com as duas metades a lei passa a ser **falsificável**: um bónus maior obriga quem o
subir a trazer a medida que o justifica. Sem teto, ela é uma boa intenção.

## 3.3 · E ao medir apareceu um defeito de forma que K1b não podia ter visto

```
trilho 4 000  +  bonusContagem 1 000  +  bonusToque 600  =  5 600 ms
```

**A contagem regressiva teria de começar num numeral que vive 600 ms.** Um `6` que
pisca. K1b escreveu que *"quatro repintes é o sinal honesto mínimo"* e que *"a
contagem nunca mostra dois dígitos"* — **não escreveu que cada numeral tem de viver
um segundo inteiro**, porque com os números de então nunca sobrava resto.

**A saída é de forma e não custa número nenhum ao `jogo`:**

> **A contagem começa no primeiro segundo inteiro.** O resto (600 ms) junta-se à
> folga, calado. **Cada numeral vive exatamente 1 000 ms, e nenhum mente.**

Sob `Tempo=Contagem` não há barra nenhuma na tela, logo os 600 ms extra são
indistinguíveis da folga — e a chegada do primeiro numeral continua a ser o **começo
abrupto** que K1b quer que seja.

---

# PARTE 4 · O DENTE NOVO — `D5e`, e ele nasce verde

*(`D5a` quantidade · `D5b` qualidade · `D5c` movimento já existem em
`testes/check-formas.mjs`. `D5d` é a proposta de K1b, à espera da pessoa. Se ela
entrar primeiro, este é o quinto; os nomes são ordinais, não semânticos.)*

> ### **D5e — o relógio da tela conta tempo, nunca quadros.**

**Por que um dente e não uma suíte, e é o mesmo argumento do cabeçalho de
`check-formas.mjs`:** não há módulo para medir. `ritmoDaRodada` já devolve
`trilhoMs` corretamente e continuará a devolvê-lo mesmo no dia em que a tela o
desenhar com um contador de quadros. **O que se prova aqui é o texto do repositório,
e um varredor prova que um erro velho não voltou, em lugar nenhum.**

**Três asserções, uma ideia.**

### `D5e.1` — nenhuma classe de `MOVIMENTO_CSS` anima uma duração do relógio da reação

Lê a tabela de volta, que é a lei da casa: colhe as durações declaradas nos blocos-
folha de `MOVIMENTO_CSS` (o `RX_REGRA` que `D5c` já tem) e cruza-as com os números
lidos de `RITMO_DA_REACAO` e `TETO_DA_ESPERA` — `janela`, `folga`, `trilho`,
`aperto`, os bónus, e as somas `trilho + bónus`.

**Ensaiado hoje, antes de o propor: 13 classes × 10 números = ZERO colisões. Verde.**
A mais longa da casa é `.tv-anel-fora` a 24 000 ms, e ela não é um número do relógio.

```
os 10 números:  600 · 1000 · 4000 · 4600 · 5000 · 5600 · 11000 · 15000 · 16600 · 33200
```

### `D5e.2` — o piso de alcance, para que o dente não fique verde medindo nada

Transplante do `ALCANCE_MINIMO` que o arquivo já tem: **≥10 classes com `animation`**
(hoje 13, e `D5c` já exige isto) e **≥8 números lidos da tabela do relógio** (hoje
10). Sem o piso, um regex partido ou uma tabela renomeada passariam verdes a medir
zero — *e catraca verde por vazio é pior que catraca nenhuma*.

### `D5e.3` — `TETO_DE_CONTADOR_DE_QUADRO`, com a dívida declarada dentro

Um teto por arquivo das ocorrências de `setInterval(` e `requestAnimationFrame(` em
`src/`, congelado no retrato de hoje — o mesmo formato de `TETO_DE_LITERAIS`:

```js
const TETO_DE_CONTADOR_DE_QUADRO = {
  "src/ui.jsx": 2,               /* as brasas, e elas estão certas: performance.now() */
  "src/App.jsx": 2,              /* o d20, e ele está certo: Date.now() - inicio > 1200 */
  "src/grade-de-batalha.jsx": 1, /* DÍVIDA: :385 conta TIQUES (`i += 1`), não tempo.
                                    Cosmético ali — a peça anda devagar numa aba de
                                    fundo e não mente sobre nada. FATAL se copiado
                                    para o trilho. É o endereço que este teto guarda. */
};
```

**K3 não pode acrescentar um contador sem subir o teto à mão, e subir o teto é
escrever a razão.** Que é o que a casa chama de *retrato datado da dívida*.

**Onde vive:** `testes/check-formas.mjs`, a seguir a `D5c`, porque partilha o
`RX_REGRA` e o `MOVIMENTO_CSS` já importado. **O dente anti-cemitério que o arquivo já
tem aplica-se tal e qual:** no dia em que `grade-de-batalha.jsx:385` passar a ler o
relógio, a entrada **sai** da tabela — não fica a dizer `0`.

**O buraco deste dente, declarado com número porque um buraco calado é mentira:** ele
conta ocorrências de texto, e por isso **não sabe distinguir um `setInterval` que lê
`Date.now()` de um que conta tiques**. Prende a quantidade, não a qualidade — tal
como `D5a`. A qualidade fica no comentário do teto, que é onde o endereço de
`grade-de-batalha.jsx:385` está escrito, e na revisão de quem subir o número.

---

# PARTE 5 · A DÍVIDA DE W2 §3 — conferida contra o código de hoje

**Corri as quatro frases em Node** (importando `metrosTxt` de `grid.js` e o
`bestiario.js` de verdade), contra `v9.265`, `App.jsx:1119-1143` e `golpe.js` de
276 linhas.

## 5.1 · As quatro novas continuam a bater — as três colunas, medidas

**Teto 54 (E2) · pior nome do bestiário: `Sentinela Blindada`, 18 · pior número de
`metrosTxt`: 4 caracteres.**

| id | `fixo` declarado em W2 | **`fixo` medido** | **pior caso (nome de 18)** | **típico** | sobra p/ nome |
|---|---|---|---|---|---|
| `semAlvo` | 29 | **29** ✓ | **29** ✓ | `Ninguém de pé ao seu alcance.` (29) | — |
| `distancia` | 26 | **26** ✓ | **44** ✓ | `Halvard a 12 m — faltam 10,5 m.` (**31**) | 28 |
| `parede` | 29 | **29** ✓ | **47** ✓ | `Halvard a 12 m — parede, contorne.` (**34**) | 25 |
| `aoAlcance` | 23 | **23** ✓ | **41** ✓ | `Halvard a 12 m — ao alcance.` (**28**) | 31 |

**As doze células de W2 §3.3 batem byte a byte.** O pior de **27 nomes × 4 frases** é
**47** (`parede` / `Sentinela Blindada`) — sete de folga contra o teto. O aparo morde
acima de **28 / 25 / 31**, confirmando o §3.6: o máximo das tabelas é 18, logo **o
aparo nunca morde o que a casa escreveu**.

## 5.2 · As quatro de HOJE continuam a transbordar — e uma célula de W2 estava 1 a menos

| a frase de hoje (`App.jsx`) | fixo (nome vazio) | pior (18) | W2 dizia | veredito |
|---|---|---|---|---|
| `Ninguém de pé ao seu alcance.` | 29 | 29 | 29 / 29 | cabe |
| `Longe demais — {n} a {d} m, faltam {f} m. Aproxime-se primeiro.` | **62** | **80** | 62 / 80 ✓ | **transborda +26** |
| `Há parede no caminho até {n} — contorne.` | **37** | **55** | 37 / 55 ✓ | **transborda +1** |
| `{n} a {d} m — dentro dos seus {a} m de alcance.` | **46** | **64** | 46 / **63** | **transborda +10** |

**A única emenda em toda a conferência: o `63` de W2 é `64`** — 46 + 18 = 64, e o 63
era aritmética a menos, não medida a mais. **Não muda nada**: a frase já transbordava
por 9 e passa a transbordar por 10. Fica escrito porque o diário vai citar a tabela.

**Duas conferências de fronteira, para o número não ser sorte:**
`metrosTxt` escreve 4 caracteres no pior caso das medidas que a frase pode carregar —
o tabuleiro maior é 16×16 quadrados de 1,5 m, logo a diagonal máxima é **33,9 m**, e o
maior `alcanceM` é `armaDeLonge` 36 + `bonusDaPropriedadeAlcance` 1,5 = **37,5**. Os
dois têm 4 caracteres. **`numeroMaisLargo: "10,5"` está certo no comprimento, que é o
que a suíte mede.** *(Cinco caracteres só a partir de 100 m, que nenhum tabuleiro
alcança — e se um dia alcançar, a asserção nº 2 de W2 apanha-o.)*

## 5.3 · Os leitores: **são dois, e não nasceu um terceiro**

```
App.jsx:1119  const maisPertoAoAlcance   (definição)
App.jsx:1131  const recusaDoGolpe        (definição)
App.jsx:1139  const linhaDoGolpe         (definição)

App.jsx:12021   pushMsgs([{ autor: "sistema", texto: `📏 ${recusaDoGolpe(vd)}` }])
App.jsx:20997   {alvoDoGolpe ? linhaDoGolpe(vdGolpe) : recusaDoGolpe(vdGolpe)}
```

**Exatamente dois leitores, e são os dois que W2 nomeou:** `:12021`, o chat com o
prefixo `📏`, e `:20997`, a linha do veredito. **`recusaDoGolpe` aparece nos dois;
`linhaDoGolpe` só no segundo. Nenhum terceiro nasceu.**

`maisPertoAoAlcance` tem os mesmos três de W2, com as linhas andadas: `:1140`
(interno, dentro de `linhaDoGolpe`), **`:12030`** (era `:11990`) e **`:20934`** (era
`:20847`). **A conta não mudou; só o endereço** — e é por isso que ela tem de ir junto
na mudança de casa, como W2 escreveu.

## 5.4 · Precisa a redacção de ajuste? **Não. Nada mudou.**

`src/golpe.js` não exporta `LINHAS_DO_GOLPE` nem `TETO_DA_LINHA` (os exports de hoje
são `ALCANCES`, `alcanceDoGolpe`, `vereditoDoGolpe`, `VERBOS_DE_COMBATE`,
`fraseDoGolpe`). **Nada de W2 §3 foi aplicado, nada do que o sustentava mudou, e as
cinco asserções da catraca continuam a poder ser escritas exatamente como estão lá.**
A única alteração ao texto de W2 é a célula `63 → 64` da tabela do §3.2 acima.

---

# PARTE 6 · PARA A PESSOA DECIDIR — a proposta ambiciosa

> ## A casa não tem régua para o alvo de toque. **Ela tem duas populações de controlo e nunca soube disso.**

## O que fazer

**Nasce uma tabela nomeada — `ALVO` — ao lado de `T`, e o `Botao` de `ui.jsx` passa a
ler dela.** Três números, cada um com a fonte escrita na linha:

```js
/* A RÉGUA DO ALVO. A TINTA E O ALVO SÃO DUAS MEDIDAS DIFERENTES: a tinta pode
   medir 30 px e o alvo tem de medir 44, e a diferença sai de enchimento ou de
   um ::after transparente — que não custa um pixel de leiaute. */
export const ALVO = {
  minimo:   24,  /* WCAG 2.2, SC 2.5.8 Target Size (Minimum), nível AA — o chão legal */
  conforto: 44,  /* Apple Human Interface Guidelines · WCAG 2.5.5 AAA — o polegar    */
  denso:    32,  /* o alvo de uma fila de contadores, onde 44 partiria a linha       */
};
```

E um quarto teto em `check-formas.mjs`, irmão do D5e: **`TETO_DE_ALVO_MIUDO`,
congelado em 14** — os candidatos a falha de hoje, por arquivo. *Um teto que só pode
descer.*

## Por quê — e é medida, não adjetivo

**Medi 215 `<button>` e a casa tem duas populações que nunca se olharam:**

| | mediana | abaixo de 24 | abaixo de 44 |
|---|---|---|---|
| **a casa, hoje** (194 medidos) | **30 px** | **14 (7,2 %)** | **169 (87,1 %)** |
| **as peças da Fase K** | **48 px** | 0 | 0 |

**Nunca ninguém escreveu o número, e é por isso que há duas populações.** Eu próprio
subi a Pílula de 35 para 47 em K1 citando *"WCAG 2.5.5 AAA; Apple HIG 44 pt; Material
48 dp"* — e **escrevi a régua num parágrafo de um documento em vez de a pôr numa
tabela**, que é literalmente a primeira lei desta casa aplicada ao avesso. *Se é
número, é tabela.* Um número de acessibilidade que vive numa prosa é um número que o
próximo controlo não lê.

**O que o jogador vive, e isto é jogo e não higiene:** num telefone, **87 % dos
controlos da casa estão abaixo do tamanho confortável para um polegar**, e um toque
falhado no meio de um combate por turnos não custa um toque — custa a hesitação de
perceber por que não aconteceu nada, com um relógio a correr. **A Fase K acabou de
pôr na tela o controlo mais sensível a tempo que este jogo já teve.** Ele entra
correto por acidente de eu ter medido; o próximo entra correto por sorte.

**Os quatro testes que a pessoa pôs, respondidos:**

1. **Número, não adjetivo** — 215 medidos, mediana 30, 14 candidatos a falha da AA,
   endereços nomeados (`App.jsx:21035`, `:21045`, `painel-ficha.jsx:66`,
   `painel-diario.jsx:142`).
2. **O par comparável** — está na folha `K2 · a trava`, secção *os números*: a casa
   contra a peça, lado a lado, com as três réguas.
3. **O jogo junto** — **falta, e é honesto dizê-lo.** Nenhum pixel de tinta muda; o
   que cresce é a área sensível. O `jogo` assina que não piorou **jogando**, não
   lendo — e isso é K4.
4. **Reversibilidade** — uma tabela e uma linha em `Botao`. Um commit desfeito.

**O risco, dito por mim:** crescer o alvo sem crescer a tinta **aproxima alvos
vizinhos**, e dois alvos de 44 px com 4 px entre eles podem encavalitar-se. O SC 2.5.8
tem uma excepção de espaçamento exatamente por isto, **e eu não medi espaçamento** —
logo a tabela entra, e a aplicação entra **um arquivo de cada vez**, medindo.

**Vai à pessoa** porque uma régua de alvo muda **o que o jogador toca em toda a
interface**, e isso é fluxo. É `pesado`, e não o rebaixo para caber no automático.

---

# O que entrou no Figma

| nó | o quê |
|---|---|
| **`140:429`** | **`K2 · a trava`** — folha nova, 1500×2339, na página `A pergunta que expira` (`31:242`) |
| `140:433` · `142:431` | secção **a ordem de tabulação** — as três regiões com os discos numerados alinhados aos alvos reais |
| `143:488` | a tabela **de onde vem, para onde volta** — seis instantes, com a razão de cada um |
| `140:434` · `144:501` | secção **a aba lenta** — a lei do relógio e a faixa de 40 s |
| `140:435` | secção **os números** — alvo de toque, anel de foco, o bónus de movimento reduzido, e o `5 600 ms` |
| `62:2453` | `O chamado` — a descrição ganhou o bloco **`[K2 · a trava]`**: o chamado **não** está sempre focado, e o anel medido |
| `20:77` | `A escolha` — a descrição ganhou **`[K2 · a trava]`**: o anel é `box-shadow`, nunca geometria; a fila não se pode mexer |

**Zero peças novas, zero variantes novas, zero variáveis novas.** Tudo o que a folha
mostra são instâncias do que K1 e K1b já construíram — que é o que *«K2 não redesenha
nada»* tem de querer dizer na prática.

---

# O que ficou feio, e o que eu não soube

**Feio, e é meu:**

- **Eu ia escrever que o CSS mente numa aba de fundo, e ele não mente.** A linha de
  tempo do documento é tempo, não quadros: uma animação CSS chega à posição certa
  quando a aba volta. O argumento que eu tinha preparado para a Parte 2 estava errado
  na premissa, e **o argumento certo — dois relógios divergem, e divergem na direção
  cruel — é melhor**, mas não foi o que eu pensei primeiro. **É a terceira vez em três
  rodadas que uma afirmação confortável minha não sobrevive a ser conferida.** Da
  primeira foi o *«cumprido com folga em todos»*; da segunda o *«o mais baixo que
  passa»*; desta, o CSS. O padrão já não é azar: **eu declaro antes de medir, e só
  não vai para o bloco porque depois vou medir.**
- **A minha primeira varredura dos 215 botões mentiu, e mentiu plausivelmente.** O
  regex parava no `>` de `onClick={() => …}`, e 174 dos 215 saíram como *"sem padding
  nenhum"* — um número absurdo que eu quase escrevi como achado (*"174 botões sem
  enchimento"*). **O que me salvou foi o número ser absurdo, outra vez — não a
  disciplina.** A segunda versão lê a tag com as chaves equilibradas. Se o erro
  tivesse sido de 10 % em vez de 80 %, tinha ido para este documento.
- **Eu pus a régua de acessibilidade num parágrafo em K1 em vez de numa tabela**, e
  só dei por isso ao medir a casa inteira para esta etapa. A proposta ambiciosa desta
  rodada é o conserto do meu próprio descuido de duas rodadas atrás — o que é honesto
  mas não é bonito.
- **`A escolha · Estado=Foco` continua a crescer a caixa**, e eu **não a consertei**:
  escrevi a nota na descrição. É a mesma forma de recuo que K1 tomou com o recuo sem
  borda, e que K1b teve de vir pagar. **Estou a deixar a mesma dívida pela segunda
  vez**, e a única defesa que tenho é que a peça tem instâncias vivas e K2 não é o
  lugar de lhes mexer na geometria.

**Não coube:**

- **Não medi o espaçamento entre alvos**, e sem ele os `14 abaixo de 24 px` são
  *candidatos* a falha da SC 2.5.8, não falhas. A excepção de espaçamento pode
  perdoar a maioria deles. Está dito nos dois sítios onde o número aparece.
- **21 dos 215 `<button>` não declaram enchimento vertical** e ficaram de fora de
  todas as contas. São botões de fechar e de ícone; a altura deles é a da linha de
  texto, o que sugere que estão **abaixo** dos 24 — mas *sugere* não é medir, e eu
  não os medi.
- **Não desenhei o anel de foco sobre o `O chamado` como variante**, só na folha de
  prova. Quem compuser uma tela nova com aquele botão não vê o estado sem ir à folha.

**Não soube:**

- **Quanto custa exatamente ler um numeral contra ler uma barra.** Tenho o custo de
  uma fixação (Rayner 1998) e a precisão da posição em escala comum (Cleveland &
  McGill 1984), e **multipliquei**. Quatro fixações é uma conta defensável, não uma
  medida: ninguém cronometrou um jogador a ler `5, 4, 3` neste jogo. **É a segunda
  pergunta que K4 tem de fazer**, logo a seguir à do trilho que nasce aos 11 s.
- **Por que `bonusToque` é 600.** O `bonusContagem` tem o custo que compensa escrito
  (a fixação); **o `bonusToque` não tem nenhum** — nem em K1, nem em K1b, nem no
  módulo. Pode estar certo, e provavelmente está na ordem certa; mas é o único número
  do relógio sem fonte, e é ele que produz o `5 600` da Parte 3.3. **É do `jogo`.**
- **Se a lei do teto do bónus (Parte 3.2) sobrevive a um segundo tipo de bónus.**
  Redigi-a para uma compensação de leitura. Se amanhã aparecer um bónus que compense
  outra coisa — motricidade, latência de rede no duelo —, o teto *"o custo medido da
  leitura"* deixa de servir e a lei precisa de uma generalização que eu não sei
  escrever hoje.
- **Se a expiração ao relógio de parede é a decisão certa para o duelo.** Argumentei-a
  para a campanha, onde o único relógio é o da janela. No **Duelo PvP** há um segundo
  jogador do outro lado, e "a aba dele estava escondida" passa a ser uma pergunta com
  consequência para terceiros. **Não é desta fase, e não a resolvi.**
