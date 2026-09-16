# E2 · o endereço do tabuleiro — as duas portas, e como casam

**Do `jogo`, em par com o `desenho`, 15/09.** E1 desenhou a tela; esta etapa
desenha **o momento em que o jogador fala com ela**. Nada aqui é código: é
quando o endereço serve, quem o diz, o que o jogo responde quando a frase falha,
e — o ponto de tudo — **como clicar na casa e escrever `vou até K14` deixam de
ser dois jogos**.

O pedido da pessoa, palavra por palavra (14/09):

> *"nosso grid pode ter letras e números, tipo um tabuleiro de xadrez, então se
> um player disser 'vou até H20' não teria a confusão que 'me aproximo do…'
> causa."*

**Leia-se com atenção o que ela pediu:** ela não pediu um tabuleiro melhor. Ela
pediu **a frase**. O tabuleiro com letras é o que torna a frase possível — não o
contrário. Esta etapa inteira sai daí.

O que E1 decidiu está herdado e não se rediscute: régua permanente em duas
bordas presa à janela, mono, `aria-hidden`, o endereço no nome acessível da casa
(`H12 · no beco estreito · dá para chegar aqui — custa 4,5 m`), a marca de borda
a carregar o mesmo endereço, `LETRAS_DA_GRADE` como única gramática, A1 no canto
superior esquerdo, e o log a escrever o endereço de volta.

---

## 1 · As dez assimetrias, contadas uma a uma

**As duas portas, como elas são hoje:**

- **Porta A — o clique na casa.** `grade-de-batalha.jsx:502-524` (a camada do
  toque) → `App.jsx:14497` (`moverPara`). **Entra no motor.**
- **Porta B — a frase digitada.** `App.jsx:21553` (o `<input>`) → `agir`
  (`:12665`) → `agirInterno` (`:13178`) → a cascata de `turno.js`.

**1. A porta B não chega ao tabuleiro. Não há porta nenhuma para o campo.**
`turno.js` tem **dezassete** portas (`:120-262`) e **nenhuma** delas é o passo no
tabuleiro. `vou até K14` casa `querPartir` e cai na porta `destino` (`:238`) —
que, ao contrário de `agressao` (`:217`) e de `oraculo` (`:246`), **não tem
guarda `!emCombate`**. O que acontece, lido no código: dentro de uma luta, a
frase entra no resolvedor de **cidades do mapa-múndi** (`resolverLugar`,
`App.jsx:12884`), não acha cidade nenhuma chamada K14 (claro), escreve o
envelope `[DESTINO NÃO RECONHECIDO]` (`:12922`) e devolve `false`. A frase segue
para o Mestre. **O herói não anda, os metros não são cobrados, o golpe livre não
acontece, a ficha não se mexe um pixel.** Só a IA narra.
Esta é a assimetria-mãe. As nove seguintes são o seu detalhe.

**2. O alcance.** Porta A: o que não se alcança **não é clicável** — `clicavel`
(`:508`) tira o `role="button"`, tira o `tabIndex`, põe o cursor em `default`; e
o campo inteiro veste o véu (`:432`) e o contorno tracejado dourado (`:433`).
Porta B: **zero**. Nada na caixa de texto sabe que existe um alcance.

**3. O custo em metros, antes do acto.** Porta A: `rotaPrevista` (`:300-305`)
devolve `custoM` e o cabeçalho escreve `↳ 4,5 m até ali` (`:543-547`). Porta B:
nada. *E esta assimetria é dupla:* a porta A só o tem **no rato**, porque a rota
nasce em `onMouseEnter` (`:518`). No telefone as duas portas valem zero.

**4. O orçamento do turno.** Porta A: `👣 4,5 m de 9 m nesta rodada` (`:539-542`),
permanente no cabeçalho do campo. Porta B: a caixa vive a painéis de distância
daquele cabeçalho e nada ali diz quantos metros restam. Mesmo com a tela de E1,
que cola as duas coisas, **a frase continua sem o número**.

**5. O preço do golpe livre.** Porta A: `⚡ sair custa um golpe livre`
(`:534-538`), escrito **antes**, contando `colados.length`. Porta B: nada antes —
e nada depois, porque o motor nunca resolve.

**6. O caminho.** Porta A: o tracejado dourado desenhado casa a casa (`:451-456`)
diz **por onde** se vai, não só se dá. Porta B: nada — e é a única assimetria
que parece impossível de fechar numa frase. Não é; ver §2.

**7. A recusa com razão.** Porta A recusa **depois** do clique, e recusa bem:
`caminhar` devolve `motivo` em cinco casos (`grid.js:473, 476, 477, 479, 508`),
`moverPara` imprime `📏 ${chk.motivo}` (`App.jsx:14532`), mais `⏳ Você já cobriu
os X m` (`:14526`) e `📏 Você não consegue se mover` (`:14515`). Porta B:
**nenhuma recusa existe, porque nenhum julgamento existe.** O jogador recebe
ficção onde devia receber veredito — e ficção é a única coisa que nunca o
contradiz.

**8. As duas portas falam línguas diferentes sobre o mesmo chão.** Porta A dá a
cada casa um `<title>` (`:510-511`) com o nome da **região** (`nomeDoLugar`), a
parede, o terreno difícil, a cobertura e o veredito. Porta B, para ser usada,
precisa de o jogador **saber o nome da casa** — e o único nome que a porta A lhe
dá é *"no beco estreito"*, que seis casas partilham. **É exactamente a confusão
que a pessoa nomeou**, e ela está escrita no código: um canal fala em regiões, o
outro não fala.

**9. O log não escreve o endereço — e há uma instrução em vigor a proibi-lo.**
`moverPara` escreve `👣 Você vai do vão da porta para o beco estreito — 4,5 m
gastos` (`:14542`): regiões, zero endereço. Pior: a nota que vai ao Mestre
(`:14568`) diz, à letra, ***"não cite metros nem quadrados"***. Hoje o jogo
**proíbe explicitamente** que a única voz que o jogador lê diga onde ele está. A
condição de E1 (*o log tem de escrever o endereço de volta*) não é uma string em
falta: é uma instrução contrária, viva, que tem de mudar de lado.

**10. O desfazer, e o campo que se apaga.** Porta A: a mira tem três saídas (E1
§5) e tocar fora não custa nada. Porta B: `Enter` (`:21553`) manda e não volta —
e `agirInterno` faz `setEntrada("")` (`:13261`) **antes** de a cascata correr, de
modo que a frase desaparece da caixa mesmo quando porta nenhuma a resolveu. Uma
frase digitada, hoje, não tem desfazer nem tem eco.

**E uma décima primeira, que é de colisão e não de falta.** O endereço do
**mundo** já existe e já está na tela: `enderecoDe` (`coordenadas.js:199`)
produz `H12 4,3 · 7,1`, e ele sai no log (`App.jsx:20175`) e no painel do mapa
(`painel-mapa.jsx:179`). **São dois `H12` diferentes no mesmo jogo.** E1 mandou
que nunca partilhassem tela; o §5 diz como.

---

## 2 · O veredito da frase — e quando ele aparece

### Uma frase digitada tem "antes do clique"? Tem — e é maior que o do clique.

O clique tem noventa milissegundos entre o dedo e o acto. **A frase tem o tempo
inteiro de a escrever** — doze a quinze toques de teclado. O *antes* de uma
frase não é um instante: é **uma duração**. É a única porta do jogo onde o
veredito pode aparecer **enquanto o jogador ainda está a decidir**, e não no
último décimo de segundo antes de pagar.

Então sim: **o campo pré-acende a casa.** E digo o custo, porque a pergunta o
pediu.

### O que acontece entre escrever `vou até K14` e a coisa acontecer

**O campo não lê a frase à procura de sentido.** Ele procura **um endereço**, e
só isso: uma letra seguida de um ou dois dígitos. É reconhecimento local e
determinístico — não é interpretação, não é intenção, não é um adivinhador de
verbos. *(É por isso que eu não peço ao motor um leitor de "anda/vai/corre":
ver §6.6.)*

No instante em que o endereço fica **completo e válido**, três coisas acontecem
ao mesmo tempo, e nenhuma custa um turno:

1. **A régua acende primeiro — na letra, antes do número.** Escreveu `K`: a
   coluna `K` inteira passa a `A regua` *Estado=Realcada* (`30:11`, do
   `desenho`), e a régua deixa de ser decoração e vira instrumento — ela
   responde *"onde fica o K?"* antes de o jogador acabar de perguntar. Escreveu
   `14`: acende também a linha. **Nenhuma peça nova: o estado já existe e foi
   fabricado para isto.**
2. **A casa acende no campo**, no estado *Sob o dedo* de `A casa` — o mesmo
   estado que o rato produz, com o custo escrito dentro. Se ela estiver fora da
   janela, quem fala é **a marca de borda** com `K14` e a distância. **A câmara
   não se mexe** (§4).
3. **A linha do veredito passa a ler a frase.** Não é uma linha nova e não é uma
   peça nova: é **a mesma `Consequencia` *Forma=Linha* de 22 px** que vive entre
   o campo e os verbos, que E1 tornou permanente, e que **o clique já escreve**:
   > **`K14 · 4,5 m · custa um golpe livre de Halvard`**
   Palavra por palavra, a mesma frase que a casa sob o dedo produz, **no mesmo
   sítio da tela**. Uma acção, uma forma — literalmente a mesma linha de pixels.
   *(44 caracteres: cabe no teto de 54 que o §3 mede. O veredito de uma casa que
   serve cabe sempre; é a recusa que aperta.)*

**E onde o veredito NÃO vai, com a medida que o prova.** A tentação era pô-lo na
chamada dentro de `A linha` (`formas.md:82`: *"a chamada vem dentro da peça, à
direita, carregando a razão"*). **Medido na peça, hoje:** a `a razao` vive
**dentro do `Botao`**, que faz *hug* — `o Mestre esta escrevendo` (24 caracteres)
dá um botão de **153 px**; `ha um dado a espera - role o dado` (33) dá **207**. O
meu veredito tem **44 caracteres**: daria um botão de ~280 px **dentro** de um
campo de 359, e o botão deixaria de ser um botão.
**A peça disse-me onde o veredito não cabe, e ela tem razão** — aquela
chamada é para o que é sobre **o envio**, não sobre o chão. Fica com o que já
carrega: `é a vez de Halvard`, `o Mestre está a escrever`. **Zero pedidos novos
ao `desenho` por causa disto.**

### O custo, com número

- **Não custa chamada nem token.** A conta é `caminhar()`, que já corre a cada
  `onMouseEnter` (`grade-de-batalha.jsx:303`) — o tabuleiro corre-a dezenas de
  vezes por turno hoje, num A\* limitado por `tetoQ` (`grid.js:481`). Uma por
  tecla é **menos** do que o rato já gasta. Zero no prompt: o teto continua
  sagrado porque nada disto vai ao prompt.
- **Custa uma tecla de atraso se for feito mal.** A regra: o reconhecimento
  corre no `onChange`, **síncrono, sem debounce**. Um debounce aqui é o defeito
  — duzentos milissegundos fazem a casa acender depois de o olho já ter saído do
  campo, e aí o acender é ruído, não resposta. Num campo de 18×18 são ≤324 nós:
  está abaixo de um quadro.
- **O que o torna possível é uma coisa só, e ela já existe no jogo: a conta que
  recusa é separável da conta que age.** Foi exactamente o que X2 fez com o
  golpe. `App.jsx:11778-1781`, escrito lá: *"a mesma conta que recusa o golpe
  passa a poder ser perguntada sem gastar o turno — que é o que faz o jogador
  ver se alcança ANTES de clicar, em vez de descobrir depois."* O golpe tem o
  seu `vereditoDoGolpe`. **O passo não tem. É o pedido central do §6.**

### A armadilha do prefixo, e a decisão

`K1` é uma casa válida a caminho de `K14`. Se a casa acende em `K1` e salta para
`K14` na tecla seguinte, **o campo pisca duas vezes por endereço**, e um campo
que pisca a cada tecla lê-se duas vezes por letra.

**A regra: o acender é imediato; a frase do preço espera a mão parar.** Enquanto
o endereço ainda **pode crescer** (numa planta de 12 linhas, `K1` pode virar
`K12`; `K9` não pode virar nada), a casa acende e a régua marca — mas a linha do
veredito só se escreve quando o jogador para 350 ms **ou** o endereço deixa de
poder crescer. O movimento serve à leitura, não ao espectáculo.

### O segundo toque, e ele é o mesmo dos dois lados

A lei do passo limpo (`formas.md:236-240`) vale igual nas duas portas:

- **Veredito limpo → `Enter` executa.** Um toque, como um clique é um toque.
- **Veredito que cobra alguma coisa além de metros** — golpe livre, terreno que
  cobra, terminar colado a quem está de pé — **→ `Enter` não executa**: a
  chamada troca de palavra para `K14 — custa um golpe livre · Enter para pagar`,
  e o segundo `Enter` paga. É o *Confirmando* de `A casa`, sem peça nova.

**A porta B ganha o segundo toque pelo mesmo critério que a porta A, e nunca por
ser texto.** Cobrar um passo extra a quem escreve seria castigar o canal que a
pessoa pediu.

---

## 3 · Quando a frase falha — a frase exacta de cada recusa

**Duas leis antes da lista.**

**A recusa não vai ao log.** Vai para **a linha do veredito**, em `Consequencia`
*Tom=Impedimento* — a mesma linha que o §2 acabou de fixar, e a mesma que o
clique escreve. Duas razões: uma recusa no log rola para cima e some; e uma
recusa **no log já parece ter gasto o turno** — o jogador vê uma linha nova
aparecer e conclui que jogou. *(A única recusa que vive dentro de `A linha` é a
(h), e é a excepção que confirma a regra: aquela não é sobre o chão, é sobre o
envio.)*

**A recusa é do endereço, nunca da frase.** `vou até K14 e grito o nome dele`
tem endereço **e** tem prosa. Se `K14` falha, **a prosa continua a viajar**. O
endereço não pode comer a frase.

### a) `K99` — fora da planta

> **`K99 não existe neste campo — as linhas vão até 12.`**

Diz o limite, não o erro. Ele aprende a planta ao falhar uma vez, e a régua está
na borda a dizer a mesma coisa.

### b) `vou até o ogro` — não é endereço

**Isto não é recusa nenhuma.** É a frase que o jogo sempre teve; segue para o
Mestre como sempre seguiu, e nada na tela muda. Recusar aqui seria o pior
defeito concebível desta etapa: **ensinar que só se pode falar por coordenada**,
que é o oposto exacto do pedido. O endereço é *uma segunda porta*, nunca a única.

**O que acontece é mais subtil, e é meu:** se a frase nomeia uma criatura que
está no tabuleiro, a chamada acende com o endereço **dela**:

> **`o ogro está em N11 · 9 m — o seu passo chega a 6 m`**

O jogo respondeu com um endereço sem nunca ter dito *"use endereços"*. É o §4.

### c) `k14` em minúscula

**Não é recusa. É a mesma casa.** O reconhecedor normaliza a caixa antes de
julgar, como `magiaDeFuncaoNaAcao` já normaliza acento e caixa
(`App.jsx:12938`). Um jogo que exige *Shift* para andar é um jogo que cobra pelo
teclado.

**E a caixa do que ele escreveu não se corrige na tela:** ele escreveu `k14`,
fica `k14`. Quem escreve `K14` é a chamada e é o log. Corrigir o texto do
jogador enquanto ele digita é a coisa mais irritante que um campo faz.

### d) `K 14` com espaço

**Não é recusa.** Letra e número separados por um separador são o mesmo
endereço — ninguém lê um tabuleiro de outra maneira. Idem `K-14` e `K.14`.
**O que não é endereço é `K 1 4` e `14K`:** ali o reconhecedor não acha nada, e a
frase segue para o Mestre **sem recusa**. O silêncio é a resposta certa quando o
jogo não tem a certeza de ter sido chamado.

### e) A casa existe e está fora do alcance — o caso comum, e o mais importante

**Esta não pode ser uma recusa seca, e é aqui que a etapa se ganha ou se perde.**
O jogador acabou de dizer uma coisa boa: disse **onde quer estar**. Recusar e
parar é atirar-lhe a intenção de volta à cara.

> **`K14 fica a 12 m — o seu passo desta rodada chega a 9. Dá para ir até K11, e
> o resto no turno que vem.`**

Três coisas numa frase: **quanto falta** (12 contra 9), **o que o motor faria**
(a casa mais longe do *caminho* que cabe no orçamento) e **o que acontece a
seguir** (o resto no turno que vem, que é a verdade e tira a sensação de recusa).

E o campo acende **as duas**: `K14` em *Impedida*, `K11` em *Sob o dedo*, com o
tracejado a parar onde o orçamento para. **`Enter` anda até `K11`.**

Isto não é o jogo a decidir por ele: é o jogo a dizer **até onde o "sim"
alcança**, que é a única resposta honesta a um pedido que não cabe. E se ele não
quiser K11, apagar ou tocar fora cancela — **o veredito nunca age sozinho**.

**A restrição que declaro ao motor, e ela é a única coisa desta etapa que muda um
algoritmo:** `K11` tem de ser **o último quadrado do caminho para K14 que cabe no
orçamento**, e não *"a casa alcançável mais perto de K14 em linha recta"*. As
duas divergem sempre que há uma parede, e a segunda manda o jogador para o lado
errado da pedra.

### f) A casa está ocupada

> **`Halvard está em K14. Dá para chegar a K13, colado a ele.`**

Diz **quem**, não *"ocupado"*. Hoje `grid.js:479` diz `esse lugar está ocupado` e
deita fora o nome — e o nome é a informação inteira: ocupada por um aliado é um
estorvo, ocupada por um inimigo é uma decisão. A adjacente vem pelo mesmo
princípio de (e).

*Caso irmão — eu próprio.* `você já está aí` (`grid.js:477`) fica, com a voz
corrigida: **`você já está em K14.`** Sem emoji e sem exclamação: é uma
informação, não uma bronca.

### g) Parede

> **`K14 é pedra. Do lado de cá dela, o mais longe que se chega é K12.`**

**E aqui há um defeito a nu:** hoje a parede sai como `esse lugar está ocupado`,
porque `livrePara` (`grid.js:444-453`) trata parede e ocupante no mesmo `return
false`. **A mesma frase para uma pedra e para um amigo ensina que o jogo não
olhou.** Entra na lista do §6.

*E o estorvo não é recusa nenhuma* — dá para lhe passar por cima. A chamada diz
o que ele dá: **`K14 · 4,5 m · encostado ao barril, +2 de cobertura`**.

### h) A casa serve, mas não é a minha vez

*(Não estava na lista e vai acontecer mais que metade das outras, porque o
jogador escreve enquanto o inimigo joga.)*

A frase **não é recusada e não é perdida**. A chamada veste *Esperando* — a
forma já está fixada em `formas.md:635` — e diz **`é a vez de Halvard`**, o nome
dele e não o nome do mecanismo. O campo continua a acender K14, e **`Enter` arma
em vez de agir**: quando a vez volta, a chamada acende sozinha e ele paga com um
toque.

**E isto cobra uma dívida antiga:** o campo de hoje é `disabled={bloqueado}`
(`App.jsx:21555`), e `formas.md:80` já tinha decidido o contrário — *"o campo
continua editável; quem está impedido é a chamada"*. Sem essa correcção, metade
dos endereços desta tela morre antes de ser escrita.

### i) O passo desta rodada acabou

> **`o seu passo desta rodada acabou — K14 fica para o turno que vem.`**

É o `⏳ Você já cobriu os 9 m desta rodada` (`App.jsx:14526`), sem o relógio e
fora do log.

### A lei que atravessa as nove

**Toda recusa nomeia o endereço que falhou e um endereço que serve.** Uma recusa
sem alternativa é um beco — e um beco no meio de um turno é o jogador a voltar
ao *"me aproximo do…"* que esta etapa existe para matar.

### E o teto que eu não sabia que existia — medido a compor, e ele corrige-me

Montei as nove frases acima **em instâncias reais de `Consequencia`
*Tom=Impedimento, Forma=Linha*, na largura real da linha do veredito.** O que
saiu:

> **Mono 10 px = 6,0 px por caractere.** A linha tem **344 px** na lateral de
> 1280 (328 úteis) e **359** no telefone. **O teto é 54 caracteres.**

**Cinco das minhas nove recusas não cabem** — e a mais importante, a do caso
comum, tem 101 caracteres e pede **606 px: quase o dobro da linha.** Eu escrevi
nove frases boas para um espaço que não medi.

**A correcção, e ela não é encurtar tudo.** As duas coisas que a linha carrega
têm naturezas diferentes:

- **O veredito de uma casa que serve é curto por natureza** —
  `K14 · 6,0 m de 9 · restam 3,0` são **32 caracteres**. Cabe sempre, com folga.
  Uma linha basta-lhe e sempre bastou.
- **A recusa é a única coisa desta tela que precisa de explicar**, e é
  exactamente aquela que a lei da casa proíbe de apagar (*a razão nunca apaga*).

**Então a tabela tem duas colunas — `larga` e `curta` — e a tela escolhe pela
largura que tem.** Refeitas e medidas, as cinco curtas cabem todas:

| caso | a curta | caracteres |
|---|---|---|
| fora do alcance | `K14 fica a 12 m — o seu passo chega a 9. Vá até K11.` | 52 |
| o passo acabou | `o seu passo acabou — K14 fica para o próximo turno.` | 51 |
| ocupada | `Halvard está em K14 — dá para chegar a K13.` | 43 |
| parede | `K14 é pedra — do lado de cá chega-se a K12.` | 43 |
| K99 | `K99 não existe — as linhas vão até 12.` | 38 |

**E nenhuma delas perde o que importa:** todas continuam a dizer **o endereço que
falhou e o endereço que serve**, que é a lei acima. O que se perde é o *porquê
completo* (`o resto no turno que vem`) — e esse é o único pedaço que a largura
pode comer sem mentir.

**A alternativa que eu recusei, e digo porquê:** pedir ao `desenho` uma
`Consequencia` *Linha* de duas linhas. Custa 15 px, que a lateral tem (E1 deixou
46 de folga) e que **o telefone não tem** — a pilha de 812 fecha exacta. Uma peça
que só funciona num dos dois dispositivos é a mesma doença de duas formas para
uma acção, um andar abaixo. **A tabela resolve nos dois, e não pede peça
nenhuma.**

---

## 4 · Onde o jogador aprende que a casa tem nome

Ele nunca viu um tabuleiro com letras. **Não há tutorial, não há balão, não há
"dica: use coordenadas".** O sistema não fala de si mesmo.

**A primeira vez não é ele que a produz — é o jogo, a responder a uma coisa que
ele ia fazer de qualquer maneira.** Três momentos, por ordem de chegada, e os
três já existem:

**1 · A régua está lá antes de ele fazer nada.** Letras em cima, números à
esquerda, permanentes. Ninguém as explica, e não é preciso: uma grelha com
letras e números nas bordas é **a coisa mais convencionada que existe** — quem
já viu um mapa, um tabuleiro ou uma planilha lê aquilo sem instrução. Isto ainda
não ensina a falar; ensina que **o chão tem nome**.

**2 · O log escreve o endereço de volta no primeiro passo que ele der — e ele vai
dar um passo no primeiro turno.** É a condição de E1, e é aqui que ela paga:

> **`👣 você avança até K14 — no beco estreito. 4,5 m gastos, restam 4,5.`**

Ele clicou numa casa sem saber o nome dela, **e o jogo respondeu-lhe com o
nome**. É o ensino inteiro, e custa uma string. Ele não teve de fazer nada de
diferente para o receber, o que é a definição de ensinar sem explicar.

**3 · A terceira vez fecha o círculo, e é a que faz a ficha cair: a marca de
borda.** No telefone, quando o Halvard joga fora da janela, a borda acende:

> **`Halvard · K18 · 12 m ↑`**

**Ali ele lê o nome de uma casa que não está na tela** — e essa é a experiência
exacta que o endereço existe para dar. É o instante em que *"as casas têm nome"*
vira *"eu posso falar de uma casa que não estou a ver"*.

**Depois disto, o jogo espera.** O convite é o campo de texto que ele já usa, e
que em E1 passou a dizer `como? (opcional)`. Na primeira vez que ele escrever um
endereço por sua conta, **a casa acende antes de ele carregar em `Enter`** — e
esse é o único reforço que existe: o jogo mostrou que entendeu antes de ele
perguntar se entendia.

**A medida honesta, e é de E3, escrita hoje para eu não a poder inventar
depois:** *se o jogador não escrever um endereço por sua iniciativa até à
terceira luta, o ensino falhou.* E a correcção **não** é um tutorial: é o log
ficar mais insistente — o endereço em todas as linhas de combate, quem atacou de
onde, quem caiu onde.

---

## 5 · A ordem do endereço — confirmo, com uma emenda

### No nome da casa: `endereço · lugar · veredito` — **confirmado**

E1 justificou pela ordem de uso (*"é por ele que o jogador vai falar"*). A razão
que a fecha é mais dura, e serve o leitor de tela e o olho ao mesmo tempo:

**Quem tabula ouve oitenta e seis nomes de casa seguidos, e o único campo que
muda sempre é o endereço.** Com o lugar à frente, vinte casas seguidas começam
pelas mesmas seis sílabas — *"no beco estreito, no beco estreito, no beco
estreito…"* — e é preciso esperar o fim de cada uma para saber onde se está. O
endereço à frente é a única ordem que deixa **saltar**. Mesma razão para o olho
na linha do veredito, onde a coluna da esquerda é a que se varre.

### No log: `verbo · endereço · lugar · conta` — **e aqui eu emendo**

O log **não é** uma lista de rótulos: é prosa do sistema no meio da prosa do
Mestre, e uma linha que começa por `K14` começa por um código.

> `👣 você avança até K14 — no beco estreito. 4,5 m gastos, restam 4,5.`

O `você avança` primeiro, porque o log responde *"o que aconteceu"*; o endereço
responde *"onde"*, e é a segunda pergunta. **A casa é um rótulo e começa pelo
identificador; o log é uma frase e começa pelo verbo.** As duas ordens só se
contradiriam se o log fosse uma lista — e não é.

### A condição de E1 que eu aperto

`⌖ H12 4,3 · 7,1` é o endereço do **mundo** e já está na tela hoje
(`coordenadas.js:203` → `App.jsx:20175`, `painel-mapa.jsx:179`).

**A regra: o endereço do tabuleiro nunca leva `⌖` e nunca vem seguido de um par
decimal; o endereço do mundo nunca aparece nu.** E, mais duro: **a linha da
viagem não entra no log da luta.** E1 já deu à luta um log próprio, e é aí que
esta condição se paga sozinha. **Se um dia os dois logs voltarem a ser um, este
é o primeiro sítio que quebra** — fica escrito para quem o tentar.

---

## 6 · O que falta ao motor — a lista cirúrgica

*(A conversão endereço↔coordenada é regra, é do `backend`, e não é minha. O que
segue é o que eu preciso que exista para as duas portas serem a mesma acção.)*

### 6.1 · `casaDoEndereco(texto, grade)` — ler o endereço da frase
`src/tabuleiro-endereco.js`, novo, puro, provável em Node.

- **recebe** — `texto`: a frase crua do jogador. `grade`: a de `garantirGrade`,
  só para saber largura e altura.
- **devolve** — `null` quando não há endereço, ou
  `{ x, y, endereco, inicio, fim, cresce }`.
  `x`/`y` em índices de quadrado, **0-based, o mesmo espaço de `caminhar`**.
  `endereco` normalizado em maiúscula (`"K14"`). `inicio`/`fim`: os índices no
  texto, para a tela poder sublinhar sem voltar a procurar. **`cresce`**: `true`
  se um dígito a mais ainda daria uma casa dentro da planta — é o que segura a
  linha do veredito no prefixo (§2).
- **aceita** — `K14`, `k14`, `K 14`, `K-14`, `K.14`, em qualquer posição da
  frase. **Com mais de um endereço, ganha o último** (*"saio de K11 e vou até
  K14"*: o destino é o que se disse por último).
- **recusa, devolvendo `null` e nunca lançando** — letra fora de
  `LETRAS_DA_GRADE`; letra além da largura da planta; número fora de
  `1..altura`; mais de uma letra colada (`ABC14`); zero à frente (`K04`); mais de
  um separador (`K 1 4`); número antes da letra (`14K`).
- **lê de** — `LETRAS_DA_GRADE` (`coordenadas.js:151`). **Não fabrica tabela.**
  A assinatura é diferente da de `gradeDe()` de propósito: `gradeDe` recebe uma
  coordenada do **mundo** e passa por `coordDaCelula`; esta recebe índices de
  **quadrado**. Mesma tabela, dois espaços — e **é isso que o teste tem de
  cravar**, ou nasce a segunda verdade.
- **a irmã, e é ela que paga a condição de E1** — **`enderecoDaCasa(x, y)`** →
  `"K14"`. É quem escreve o endereço de volta no log e no nome acessível da
  casa. Sem ela o jogador nunca aprende (§4).

### 6.2 · `vereditoDoPasso({ grade, ente, destino, ocupados, deslocamentoM, ignoraDificil })`
`src/passo.js`, novo. **Irmão exacto de `vereditoDoGolpe`**, e pela razão já
escrita em `App.jsx:11778-1781`.

- **devolve sempre, e nunca lança:**
  - `ok`;
  - `custoM`, `sobraM`, `caminho` (a mesma rota que `caminhar` já produz);
  - **`motivo` — um id de tabela, não uma frase:** `"fora-do-campo"`,
    `"ja-esta-ai"`, `"parede"`, `"ocupado"`, `"longe-demais"`,
    `"passo-acabado"`, `"nao-se-move"`, `"sem-terreno"`.
    *(`"parede"` separado de `"ocupado"` é a correcção do defeito do §3g.)*
  - **`quem`** — o nome de quem ocupa, quando `motivo === "ocupado"`. **Esta
    informação existe hoje e é deitada fora** em `grid.js:479`.
  - **`ateOnde`** — `{ x, y, endereco, custoM }`: **o último quadrado do caminho
    para o destino que cabe no orçamento**, quando `motivo === "longe-demais"`.
    **Não existe hoje em lado nenhum:** `caminhar` devolve `{ ok:false }` e
    perde a busca inteira que acabou de fazer. É o único item desta lista que
    muda um algoritmo e não um invólucro — e é o coração da recusa (e).
  - **`custa`** — o que o passo cobra além de metros:
    `[{ tipo:"golpe-livre", de:"Halvard" }, { tipo:"terreno" },
    { tipo:"cola-em", quem:"Halvard" }]`. É o que decide se `Enter` é um toque
    ou dois. A porta A calcula metade disto à parte (`App.jsx:14537`,
    `adjacentes`); a porta B não calcula nada.
- **recusa** — **nada.** Nunca move ninguém, nunca escreve no log, nunca toca em
  `combateRef`, nunca cobra PV. É pergunta, não acto, e essa é a condição
  inteira.
- **e `moverPara` (`App.jsx:14497`) passa a LER deste módulo** em vez de refazer
  a conta. Se os dois números divergirem, é defeito. **É isto que faz as duas
  portas serem a mesma acção e não duas implementações parecidas** — que é o
  defeito que a tabela do turno já foi criada para matar
  (`App.jsx:13194-13199`: *"uma regra morando num só de dois caminhos"*).

### 6.3 · `RECUSAS_DO_PASSO` — a tabela das frases, com DUAS colunas
Em `passo.js`: `motivo` → `{ larga, curta }`, em português, na voz do jogo, com
os buracos nomeados (`{endereco}`, `{quem}`, `{ateOnde}`, `{faltam}`,
`{limite}`). **Duas colunas porque a linha do veredito tem 54 caracteres, e isso
foi medido (§3, o teto)** — `larga` para onde a largura chega, `curta` para o
telefone e para a lateral de 344.
**Se é número, é tabela — e uma frase de recusa é a coisa que mais se reescreve
num jogo.** As frases do §3 entram aqui palavra por palavra, e a suíte lê-as de
volta. **A catraca que eu peço junto:** um teste que falha se qualquer `curta`
passar dos **54 caracteres**. É a única forma de este teto sobreviver à próxima
pessoa que reescrever uma frase.

### 6.4 · Uma porta nova na tabela do turno
`turno.js`, id **`passo-no-campo`**, `intercepta: true`, `faz: "passoNoCampo"`,
`fase: "atalho"`, **antes de `desafio` (`:232`) e de `destino` (`:238`)**,
`quando: (s) => s.emCombate && s.temEnderecoDoCampo`, `seRecusar: "seguinte"`.

- **o sinal novo**, em `sinaisDoTurno` (`App.jsx:13137`):
  `temEnderecoDoCampo: !!casaDoEndereco(acao, gradeDaLuta)`.
- **e a guarda que falta hoje, que é um defeito a nu:** a porta `destino`
  (`turno.js:240`) **não tem `!emCombate`**, ao contrário de `agressao` e de
  `oraculo`. **Ou a porta nova a intercepta antes, ou `destino` ganha a guarda —
  peço as duas**, porque a guarda conserta também `vou até o ogro` dentro da
  luta, que tem o mesmo defeito e nenhum endereço.
- **`seRecusar: "seguinte"` é a parte que não pode falhar:** quando a frase tem
  endereço **e** prosa (*"vou até K14 e grito o nome dele"*), a porta resolve o
  passo e **a prosa continua a viajar** — como `declararAcaoRapida(id, motivo)`
  (`App.jsx:16154`) já faz com o motivo. **O endereço não come a frase.**

### 6.5 · A instrução ao Mestre muda de lado
`notaRef` (`App.jsx:14568`) diz hoje *"não cite metros nem quadrados"*. Passa a
levar o endereço como **facto**, mantendo a proibição de o narrar: *"eu fui até
K14; se citar o lugar, cite-o pelo nome da região."* **Quem escreve `K14` é o
sistema, na sua própria linha, nunca o Narrador.**
**Zero caracteres novos no prompt por turno** — a nota já existe e já é
dinâmica. O teto continua sagrado.

### 6.6 · O que eu NÃO peço, e porquê
- **Nenhum leitor de intenção** ("anda", "vai", "corre"). **O endereço é o sinal
  inteiro.** Um reconhecedor de verbos é um reconhecedor que erra, e cada erro
  dele custa um turno inteiro.
- **Nenhum endereço de alvo de ataque nesta etapa** (*"ataco K14"*). É a mesma
  porta e a mesma conta, mas o golpe já tem `vereditoDoGolpe` e a fusão dos dois
  é E3, não hoje.
- **Nenhuma tabela nova de letras, nem de sentido.** `LETRAS_DA_GRADE` cobre 20
  colunas e a planta mais larga tem 18.

---

## 7 · O celular muda o que eu decido — e inverte a ordem das portas

E1 mediu: **7 de 18 colunas, 77 de 256 casas. Um terço do campo.**

**No telefone o endereço deixa de ser conveniência e passa a ser a única porta
para dois terços do campo.** A porta A **não alcança** uma casa que não está na
tela sem primeiro arrastar — e arrastar no meio de um turno é o gesto que se
perde. A porta B alcança-a com três caracteres.

Três decisões que só existem no retrato:

**1 · A casa que a frase acende e que está fora da janela NÃO traz a câmara
atrás.** Acende **a marca de borda** daquele lado, com o endereço e a distância
— `K14 ↓ 12 m`. Razão: enquanto ele digita, ele está a olhar para o teclado e
para a chamada, não para o campo; arrastar o campo debaixo dele nesse instante
faz perder o enquadramento que ele tinha. É a mesma lei das R4/R5 de E1. **A
câmara só vai a K14 quando o passo acontece** — e aí vai, porque aí o herói está
lá.

**2 · A linha do veredito é o canal principal; o campo é o secundário — e ela
tem de subir com o teclado.** No telefone ela vive em `y=598`, colada ao campo, e
com o teclado aberto tem de ficar **encostada por cima da caixa de texto**, no
arco do polegar: é o único pedaço de tela que o jogador está garantidamente a
olhar enquanto digita. A casa acende na mesma, mas **a decisão não pode depender
de ele a ver** — é a mesma regra que fez o custo descer para dentro da casa já em
*Alcançável*: nenhum canal de combate depende de um gesto que o dedo não tem.

**3 · O teclado tapa metade do campo, e isso deixa de ser um prejuízo.** É o
argumento que faz o `❝` colapsado de E1 render aqui: com o endereço, **escrever
passa a ser a forma de agir sobre a metade que o teclado tapou**. A troca deixa
de ser *"escondo o campo para escrever"* e passa a ser *"escrevo porque o campo
está escondido"*. É a única leitura em que o teclado aberto trabalha a favor.

**E a inversão, que é a coisa mais importante desta secção:** no desktop o
endereço é a segunda porta; **no telefone ele é a primeira, e o clique é que é a
segunda.** Quem construir a ordem dos canais tem de a inverter no retrato — num
aperto de espaço, a chamada com o veredito sobrevive e o acender da casa cede.

---

## Para a pessoa decidir

### A frase deixa de ser a porta pobre e passa a ser a porta LARGA

**O que ele vive hoje, contado.** A frase digitada é, dentro de uma luta, a pior
porta do jogo: não chega ao motor (§1.1), não sabe o alcance (§1.2), não sabe o
custo (§1.3), não sabe o preço (§1.5), não é recusada com razão (§1.7) e não tem
desfazer (§1.10). O clique tem tudo isso. **O jogo tem duas portas e uma delas é
uma armadilha** — que é a definição de X2, aplicada ao chão.

**A proposta.** Com o endereço reconhecido e `vereditoDoPasso` de pé, **uma linha
monta o turno inteiro**:

> `vou até K14 e ataco o Halvard`

…e a chamada mostra **o total a correr, enquanto ele escreve**:

> **`K14 · 4,5 m · custa um golpe livre de Halvard → golpe em Halvard, a 1,5 m`**

E o campo desenha as duas coisas ao mesmo tempo: **o tracejado até K14, e o
alcance do golpe medido a partir de K14 — não de onde ele está agora.** Ele vê o
turno inteiro antes de o pagar, **e viu-o sem tocar no tabuleiro uma única vez**.

**Porque isto muda o que ele vive.** Porque inverte quem serve quem. Hoje a
frase é a porta pobre e o tabuleiro é a rica; com isto, **a frase passa a ser a
única porta capaz de dizer duas coisas de uma vez** — o clique nunca vai
encadear sem dois toques e um modo armado. E é literalmente o que a pessoa
pediu: *"se um player disser 'vou até H20'"*. **Ela pediu a frase.**

**Porque é dela.** Exige a proposta A de E1 (o turno que se segura por confirmar)
já aprovada — hoje a regra é `App.jsx:3079`, *"Agir É encerrar"*. É `backend`, é
regra nova, e o jogador reaprende uma coisa: **que uma frase pode valer um turno
inteiro, e que ele vê a conta antes de a pagar.** Isso é fluxo.

**O que custa ao `desenho`, e digo antes de ele me perguntar:** o campo tem de
saber desenhar um alcance **a partir de uma casa onde o herói ainda não está**.
Não existe hoje, e é peça dele.

**O risco, dito por mim.** Uma frase que faz tudo é uma frase que se escreve
errado por inteiro. A defesa é a lei do §3: **a recusa é do endereço, nunca da
frase** — se `K14` falha, o golpe em Halvard ainda é oferecido de onde ele está,
e a chamada di-lo. Nada do que ele escreveu se perde por uma metade falhar.

---

## No Figma — e o único pedido que esta etapa faz ao `desenho`

Página **`A batalha`** (`30:12`), arquivo `Taverna — biblioteca`
(`e5wJUzInAssoebx5npssKc`). **Nenhum arquivo novo, nenhuma peça nova.**

| quadro | nó | o que prova |
|---|---|---|
| **`E2 · a frase digitada — a MESMA linha do veredito, a outra porta`** | **`108:2495`** | gémeo de `51:1489`: ninguém tocou num verbo (`Atacar` e `Mover` em *Repouso*), `vou até K14` está escrito no texto livre com o cursor, a régua acende **K** e **14**, `A casa` *Sob o dedo* está em **K14** com `6,0` dentro, e **a linha do veredito é a mesma linha de pixels** que o clique escreve |
| **`E2 · as recusas, medidas na largura real da linha do veredito`** | **`109:2623`** | as nove recusas em instâncias reais de `Consequencia` a 344 px — **cinco transbordam**, e as cinco curtas cabem. É onde o teto de 54 caracteres foi medido |

**O que mudei no gémeo e porquê:** `A casa` *Mira* × 8 mais o *Confirmando*
saíram, porque **uma frase que diz um endereço é um passo, não um golpe**. O que
fica é uma casa só, acesa por três caracteres escritos.

**E o quadro apanhou-me a mentir, duas vezes — fica escrito porque foi ele que
corrigiu, não eu:**

1. **A minha linha do veredito tinha 57 caracteres e foi cortada pela borda** —
   no quadro que eu compus para provar o teto que eu próprio acabara de medir.
   Encurtada para 50.
2. **`K14` estava debaixo do véu.** Herdei o contorno de `51:1489`, que é
   **o alcance da espada** (432 px de lado), e deixei-o a fazer de alcance do
   passo. A conta diz outra coisa: o herói está em **H10**, o passo são **9 m =
   6 quadrados**, logo o alcance vai de **B a N** e da **linha 4 à 16** — e
   **K14 está lá dentro, a 6,0 m**. Refeito com a cadência que E1 fixou
   (tracejado âmbar a 60%, 2,2 px). **Um quadro que acende uma casa fora do
   alcance que ele próprio desenha é pior do que quadro nenhum.**

### O único pedido ao `desenho`, achado ao compor

**`o endereco` de `A casa` é uma CAMADA e não uma PROPRIEDADE.** Medido em
`108:2603`: `componentProperties` expõe `o custo#18:0` e mais nada; `o endereco`
é um `TEXT` chamado `o endereco` lá dentro, que nasce com o valor da variante
(`I13`) e tem de ser reescrito à mão por instância. **O `o custo` é propriedade e
o `o endereco` não é** — e são gémeos, pedidos juntos em E1 (pedido 2). A
consequência prática: um override feito numa camada que não é propriedade é o
tipo de coisa que **não sobrevive a uma troca de variante**, e esta peça troca de
variante a cada toque. **O pedido: expor `o endereco` como propriedade de texto,
ao lado de `o custo`.** É a única coisa que E2 pede, e é de dois minutos.

---

## O que eu não sei, e o que não foi provado

- **Não joguei isto, porque não existe.** Tudo o que tem número aqui saiu de ler
  o código de hoje; onde é opinião de ofício, disse que é. **O par comparável é
  de E3.**
- **Não medi `caminhar` por tecla num 18×18 real.** Os ≤324 nós são leitura de
  `grid.js:481`, não cronómetro. Se um dia der quadro, o debounce volta à mesa —
  e eu prefiro perder a linha do veredito antes de perder o acender da casa.
- **Os 350 ms do prefixo são de ofício**, não medidos nesta tela.
- **Não sei o que fazer com um endereço escrito FORA de combate.** A decisão
  provisória é: **o reconhecedor do campo só existe enquanto o campo existe** —
  sem tabuleiro, `K14` é texto como qualquer outro. O risco declarado é um nome
  próprio do mundo que pareça endereço.
- **A colisão com o endereço do mundo está fechada por convenção (§5), não por
  código.** Duas telas que hoje não se cruzam. Se se cruzarem, quebra ali.
- **Escrevi nove recusas antes de medir a linha onde elas iam viver, e cinco não
  cabiam.** A correcção está no §3 e não foi apagada de propósito: **um documento
  que esconde o engano perde a prova de que ele foi corrigido.** A lição, e é
  para mim: *frase de tela mede-se na peça, não no editor de texto.*
- **Não sei o que acontece quando dois jogadores numa sala escrevem endereços no
  mesmo turno.** A sala já ordena as acções (`App.jsx:12679`), mas o veredito do
  segundo foi calculado antes de o primeiro andar. **É o primeiro sítio onde
  esta etapa quebra em mesa cheia**, e não tenho resposta hoje.
