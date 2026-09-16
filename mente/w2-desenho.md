# W2 · o segundo emprego — o lado do desenho

**Fase W, etapa 2, sobre a v9.263.** O `jogo` compôs o momento em
`mente/w2-jogo.md` (li-o inteiro, incluindo a adenda do §8, antes de decidir
qualquer coisa); este documento é a **forma**: o que o campo passa a ser, onde a
fala escreve, a redacção das quatro frases que transbordam, e o violeta que
reprova a norma.

**Nenhuma linha de produção foi escrita.** Todo número aqui saiu de correr o
código de hoje em Node, de ler o `App.jsx` linha a linha, ou de abrir a peça no
Figma. Onde é ofício, está dito que é ofício.

**Aceito o documento do `jogo` como base e não o refaço.** Onde o corrijo, é com
medida e está marcado; onde ele já me respondeu melhor do que eu ia responder,
digo-o.

---

## 0. Três coisas que eu fui conferir, e as três estavam erradas

### 0.1 · A linha do veredito **não vive sempre na árvore** — vive dentro de uma gaveta que nasce fechada

É o achado que mais muda esta etapa, e ele contraria um comentário escrito no
próprio arquivo. `App.jsx:20900` diz, sobre a Consequência do golpe:

> *"Ela vive sempre na árvore enquanto há luta — quem alcança lê ONDE o golpe
> cai, quem não alcança lê POR QUÊ."*

**Não vive.** Ela está dentro de um bloco condicional, e a condição começa
falsa:

```js
App.jsx:4896  — const [acoesAbertas, setAcoesAbertas] = useState(false);
App.jsx:20840 — {acoesAbertas && (() => {
App.jsx:20846 —   const vdGolpe = vereditoDoGolpeAgora();
App.jsx:20910 —   {alvoDoGolpe ? linhaDoGolpe(vdGolpe) : recusaDoGolpe(vdGolpe)}
```

`grep -n "acoesAbertas" src/App.jsx` devolve **três linhas e mais nenhuma**: a
declaração, este bloco, e o botão que a alterna (`:21441`). **Não há nada que a
abra sozinha, nem quando a luta começa, nem quando o golpe é recusado.**

Três consequências, e nenhuma é pequena:

1. **A composição da rodada 1 do `jogo` (§8.3) descreve uma tela que só existe
   depois de um toque.** O `Atacar` apagado (`:20877`, `:20880`) e a linha por
   baixo dele (`:20910`) estão **os dois dentro desta gaveta**. Não é erro dele:
   é o comentário do arquivo a mentir para quem o lê.
2. **W1 reservou 71 px "sempre" para uma região que é condicional** — a minha
   aritmética de `w1-desenho.md:776` mediu filas de tabuleiro contra um espaço
   que só é ocupado com a gaveta aberta. O número não muda (a reserva pelo pior
   caso continua certa), mas **a razão dele muda**: reserva-se para que o
   tabuleiro não salte quando a gaveta abre, e não porque a região esteja
   sempre lá.
3. **É de W3, e não é meu para pagar hoje**, mas fica escrito com endereço.

### 0.2 · `recusaDoGolpe` tem **dois** leitores, em duas regiões com dois orçamentos

Fui contar quem chama as duas funções, e são três sítios, não um:

| linha | região | tipografia | teto |
|---|---|---|---|
| `App.jsx:11981` | **o chat**, com o prefixo `📏 ` (`pushMsgs`) | prosa, largura da conversa, **quebra** | **nenhum** |
| `App.jsx:20910` | **a linha do veredito**, dentro da gaveta | `tv-mono` 10 px, `minHeight: 24` | **54** (E2) |

**A mesma string serve as duas, e só uma delas tem teto.** Isto não é um defeito:
é a lei de E2 (*a `curta` é lida duas vezes*) já a acontecer em produção, um
ciclo antes de alguém a ter pedido. **O teto de 54 manda, porque é o mais
apertado dos dois** — e o `📏 ` do chat entra por cima de uma frase que já cabe,
numa região que quebra.

### 0.3 · A peça do campo **já existe**, e o convite já é uma propriedade dela

Fui ao Figma antes de propor um estado novo, e ainda bem. `Campo` (`133:90`) tem
**12 variantes** e quatro propriedades de texto, e uma delas é exactamente o
convite:

| propriedade | tipo | padrão |
|---|---|---|
| `a dica` | **TEXT** | `Fale, aja, explore…` |
| `o rotulo da acao` | TEXT | `Agir →` |
| `a razao` | TEXT | `o codigo tem seis caracteres` |
| `Tom` | VARIANT | **Neutro · Âmbar · Violeta · Erro** |
| `Estado` | VARIANT | Repouso · Foco · Desativado |

Dois números que saíram de abrir a peça e que decidem o §1:

- **O eixo `Tom` significa *o que está armado*** — e é exactamente o que o
  código faz (`App.jsx:21551`: `milagreSel ? T.amber : habsSel.length ? T.violet
  : T.line`). Neutro = nada armado.
- **`Tom=Erro` mede 72 px de altura contra os 53 das outras nove** — **19 px**,
  porque reserva `a razao`. É o mesmo 19 px do *Impedido* de E1, o defeito que
  esta casa já pagou duas vezes.

E uma deriva pequena para anotar: **a peça diz `Fale, aja, explore…` e o código
diz `O que você faz? Fale, aja, explore…`**. A peça perdeu a pergunta. É meu, é
de uma linha, e vai no §6.

---

## 1. A forma do campo com dois empregos — e a decisão é **não lhe tocar**

### A pergunta era se o `placeholder` ganha um quinto estado. **Não ganha, e eu tinha começado por dizer que sim.**

Cheguei a redigir o quinto estado e a medi-lo: `O que você faz? A voz alcança.`
— **30 caracteres**, contra os **35** da dica mais longa que embarca hoje
(`O que você faz? Fale, aja, explore…`), que é o único teto honesto que eu tenho
para aquele campo, porque é o maior que já se provou caber. Mantinha a pergunta
inteira e trocava só a lista de exemplos. Não anunciava mecanismo nenhum.

**Deitei-o fora, por quatro razões, e a primeira é do `jogo` e as outras três são
minhas e são de forma:**

1. **O `jogo` já pôs `A voz alcança.` noutro sítio** (§8.3: uma segunda
   instância da linha do veredito). A mesma frase em dois sítios são **duas
   verdades sobre a mesma coisa** — a lei que tirou o `<title>` em E2. Uma das
   duas tinha de cair, e a que cai é a minha, pela razão 2.
2. **O `placeholder` desaparece no primeiro caractere digitado.** Um convite a
   falar que se apaga no instante em que a pessoa começa a falar é um convite
   que não se pode reler — e o momento em que ela mais precisa de o reler é
   quando hesita a meio da frase. **A linha do veredito não se apaga.** Isto não
   é preferência: é o comportamento do elemento, e sozinho desqualifica o canal.
3. **O eixo `Tom` já tem um significado, e não é "o momento".** Fazer a borda
   convidar (o canal que o enunciado sugeria, e que o jogador de facto já lê)
   obrigaria a um quinto `Tom` — e o eixo passaria a dizer duas coisas ao mesmo
   tempo: *o que está armado* **e** *em que rodada estamos*. É o defeito que
   `formas.md` existe para não ter. E se alguém reaproveitar `Tom=Erro` em vez de
   fabricar um novo, **paga 19 px de empurrão no tabuleiro** no instante exacto
   em que o jogador está a olhar para ele.
4. **O convite já está lá, e está lá sempre.** A dica de repouso começa por
   **"Fale"** — primeira palavra, quatro estados de distância de qualquer
   mecanismo. O `jogo` reparou nisso antes de mim (§6.6). **Um convite
   permanente e mudo vale mais do que um convite condicional e falante**, e é a
   mesma lei da segunda linha fixa de W1 §4: *o ensino mais barato é o que não
   muda.*

> ### A decisão: **`Campo` fica em 12 variantes. O `placeholder` fica em quatro estados. O campo não ganha uma letra.**
>
> **O convite não é texto no campo — é o momento, dito pela linha do veredito, e
> o campo apenas continua a ser a única coisa da tela que não foi recusada.**

### 1.1 · E o que torna o convite legível não é uma palavra: é o que está apagado à volta dela

Na rodada da recusa, e isto é tudo código de hoje:

| o quê | o estado | linha |
|---|---|---|
| `Atacar` | **`disabled`**, sem preenchimento, clique morto | `:20877`, `:20880` |
| o tabuleiro | o véu no máximo — quase nada ao alcance | `:611` |
| a linha do veredito | a recusa, com o número | `:20910` |
| **o campo** | **vivo, aceso, com o cursor** | `:21553` |

**O campo é o único controlo da tela que não está recusado nem gasto.** Isso é
uma frase que a interface diz sem escrever nada, e é a forma mais forte que
existe de *"o sistema não fala de si mesmo"*: o convite é a ausência de
alternativa, não um anúncio.

**Uma ação, uma forma — conferido antes de propor:** procurei em `formas.md` e na
biblioteca por uma peça de *"convidar a escrever"*. Existe, é o `Campo`, e a
propriedade é `a dica`. **Não nasce peça nova, não nasce variante nova, não
nasce eixo novo.** O que o `jogo` precisa (uma segunda linha de veredito) também
já existe: `Consequencia` *Forma=Linha*, com o eixo `Largura=Ocupa a linha` que
E2 fabricou.

---

## 2. A linha da fala — **confirmo, e separo duas regiões que estavam a ser tratadas como uma**

O `jogo` pediu-me zero peças novas (§6.5) e compôs o desfecho em `pushMsgs`
(§8.3). **Confirmo as duas coisas.** O que acrescento é a distinção, porque as
palavras *"a linha do veredito"* andaram a cobrir duas regiões que não são a
mesma, e a prova está em `pushMsgs`:

| | **a linha do veredito** | **o chat** |
|---|---|---|
| quando | **antes** do clique | **depois** do facto |
| onde | `App.jsx:20909`, dentro da gaveta `Ações` | `pushMsgs`, sempre na árvore |
| tipografia | `tv-mono` 10 px, `minHeight: 24` | prosa, largura da conversa |
| teto | **54** | **nenhum**, quebra |
| quem já lá escreve | **só o golpe**, prospectivamente | o golpe (`⚔`), o passo (`👣`), a poção, a rolagem (`🎲`), a recusa (`📏`) |

> **O golpe, o passo e a reacção não partilham a linha do veredito: partilham o
> CHAT.** O molde da poção que o `jogo` invoca — e bem — escreve em
> `pushMsgs` (`App.jsx:19575`), não na linha do veredito. **A fala tem uma linha
> em cada região, e são duas coisas diferentes:** *"a voz alcança"* é veredito
> (antes), *"o bandido hesita"* é desfecho (depois).

### 2.1 · O que a distingue no chat, sem ganhar peça: o **glifo** — e é `💬`

Varri os prefixos de `texto:` em `src/` inteiro: **97 glifos distintos** em uso,
e a gramática do chat é uniforme e não escrita — **o glifo nomeia o ASSUNTO, não
o veredito**: `⚔` golpe, `📏` distância, `👣` passo, `🎲` dado, `☠` morte,
`⏳` o relógio do turno.

**`💬` está livre.** A única ocorrência no `src/` é `missoes.js:109`, como ícone
de um *tipo de missão* (`falar_com`) — outra região, outro papel, sem colisão no
chat.

**E ela não é uma escolha de gosto:** `💬` é o irmão do `IconeBalao` que o campo
já usa à esquerda (`App.jsx:21552`), a marca que diz *"aqui se escreve"*. **A
linha que o campo produziu passa a usar a marca do campo.** É *uma ação, uma
forma* a funcionar entre duas regiões, e é de graça.

**Uma correcção pequena ao `jogo`, e é de forma:** ele põe a segunda fala da
mesma rodada com `⏳` (§8.3), por analogia com `:11878`. **`⏳` é o assunto
"relógio do turno"**; a recusa da segunda fala tem por assunto a fala. Pela
gramática acima ela é `💬`, não `⏳`:

```
💬 Você já disse o que tinha a dizer nesta rodada.
```

*(O chat não tem teto de 54 — esta frase não entra na tabela do §3.)*

### 2.2 · A segunda linha do veredito, e o espaço dela — o pedido do `jogo`, respondido com número

Ele pede-me a segunda linha e o espaço dela, porque `minHeight: 24` é para uma.

**O número já está medido, e é de E2:** uma linha de mono 10 px ocupa **24 px**;
**duas ocupam 30**. **A segunda linha custa 6 px.** É o mesmo 6 px de W1 §3.3.

**E aqui há uma colisão que ninguém tinha visto, e ela resolve-se sozinha:** W1
já tinha reservado esses 6 px para outra coisa — a segunda linha da desistência
(`toque fora para desistir`) — e **recusou-lha no telefone**, porque a região
ia de 71 a 77 px e o degrau está em 75/76: **custava 7 casas** (`w1-desenho.md`
§14). Duas segundas linhas para um só espaço.

> ### Não colidem, e a razão é de construção: **a linha da desistência só existe com um verbo ARMADO; a linha da voz só existe com o golpe RECUSADO.** Um verbo recusado não se arma. As duas são mutuamente exclusivas, e nenhuma rodada tem as duas.

E a aritmética fecha melhor do que eu esperava:

| o momento | pílulas de alvo | linha do veredito | região |
|---|---|---|---|
| verbo armado (W3) | **47** | 24 (+6 se a desistência entrar) | 71 · **77** |
| **a rodada da recusa** | **0** — nada está armado, não há alvos | **30** (duas linhas) | **30** |
| a reserva de W1 | — | — | **71, sempre** |

> **A segunda linha da voz custa ZERO casas.** Ela acontece exactamente no
> momento em que a fila de pílulas não existe, e 30 px cabem dentro dos 71 que
> W1 já reserva pelo pior caso, com **41 px de folga**. *A reserva única pelo
> pior caso — a lei que E1 escreveu para o `Botao` e W1 repetiu para a região —
> paga esta etapa inteira sem uma linha de negociação.*

**E ela é `Consequencia` *Forma=Linha*, *Tom=Estado*** — não `Impedimento`: a
linha de cima já é o impedimento, e a de baixo é o que **não** está impedido. Dois
tons na mesma região, um por linha, e os dois já existem desde D4.

---

## 3. A frase que transborda — **a redacção final, e ela é minha**

### 3.1 · Primeiro, o que eu conferi do que o `jogo` mediu

**Ele tem razão e a minha lei de W1 não salva a frase.** Refiz a conta com os
**piores números que `metrosTxt` pode escrever** (`grid.js:50`: uma casa decimal,
vírgula; o pior caso são 4 caracteres, `10,5`), e não com um exemplo:

| a frase de hoje | fixo, **nome vazio** | com `Sentinela Blindada` (18) | teto |
|---|---|---|---|
| `Longe demais — {n} a {d} m, faltam {f} m. Aproxime-se primeiro.` | **62** | **80** | 54 |
| `Há parede no caminho até {n} — contorne.` | 37 | **55** | 54 |
| `{n} a {d} m — dentro dos seus {a} m de alcance.` | 46 | **63** | 54 |
| `Ninguém de pé ao seu alcance.` | 29 | 29 | **cabe** |

> ### **Três das quatro transbordam, e a pior transborda com um nome de ZERO caracteres — por 8.** Aparar o nome não a pode salvar, porque ela estourou antes de o nome existir. **A `w1-desenho.md:341` (*o nome é o único campo que se apara*) é uma lei sobre TRUNCAR, e o que esta frase precisa é de ser REDIGIDA.**

**E é uma distinção, não uma desculpa:** *aparar* é cortar um facto que a frase
já decidiu dizer; *redigir* é a frase decidir dizer menos factos. A lei de W1
proíbe o primeiro. Não tem nada a dizer sobre o segundo, e é o segundo que
resolve.

**E a dívida do nome que eu declarei em `w1-desenho.md:729` fica paga dos dois
lados.** O `jogo` varreu cinco arquivos e achou **47 nomes, mediana 9, p95 16,
máximo 18**. Eu varri importando as tabelas em Node, cheguei a **27 nomes** só
do `bestiario.js` — e **o número que manda bate exactamente: máximo 18,
`Sentinela Blindada`**. *Reproduzi o número que obriga, não a distribuição
inteira; a distribuição é dele e eu não a refaço.*

### 3.2 · A gramática — e ela é a decisão, não as frases

Antes de redigir as quatro, decidi a forma que as três com alvo partilham:

> ### `{nome} a {distância} m — {veredito}.`
>
> **O que muda entre elas é só o que vem depois do travessão.** O jogador aprende
> uma forma e passa a ler só a cauda — e a cauda é sempre a única coisa nova.

A quarta (`Ninguém de pé ao seu alcance.`) é a excepção **porque não há alvo de
que dizer distância**, e uma excepção com essa razão lê-se como regra.

### 3.3 · As quatro, fechadas e medidas

**Teto 54 (E2). Pior nome das tabelas: 18. Pior número de `metrosTxt`: 4 (`10,5`).**

| id | a frase | fixo | sobra p/ nome | pior caso (18) | típico |
|---|---|---|---|---|---|
| `semAlvo` | `Ninguém de pé ao seu alcance.` | **29** | — | **29** | 29 |
| `distancia` | `{n} a {d} m — faltam {f} m.` | **26** | **28** | **44** | `Halvard a 12 m — faltam 10,5 m.` (31) |
| `parede` | `{n} a {d} m — parede, contorne.` | **29** | **25** | **47** | `Halvard a 12 m — parede, contorne.` (34) |
| `aoAlcance` | `{n} a {d} m — ao alcance.` | **23** | **31** | **41** | `Halvard a 12 m — ao alcance.` (28) |

**As quatro cabem com o pior nome e o pior número, com 7 a 25 de folga. 27 de 27
nomes do bestiário cabem nas quatro.**

**O que eu mudei da proposta do `jogo`, e porquê — são duas coisas:**

1. **A parede entra na gramática, e ganha o número que hoje não tem.** A dele era
   `parede até {n} — contorne.` (23) — começa em minúscula, e *"parede até
   Halvard"* diz que a parede vai até ele, que não é o que acontece. A minha é
   `{n} a {d} m — parede, contorne.` (29): **seis caracteres mais cara, e
   acrescenta um facto que a frase de hoje não dá — a que distância ele está.**
   Contornar 3 m e contornar 20 m são decisões diferentes. *Esta é a única das
   quatro em que eu gasto caracteres em vez de os poupar, e gasto-os num número —
   que é o que a lei de W1 manda nunca cortar.*
2. **`contorne` fica, e é a única ordem que sobrevive.** O contrato do `jogo`
   (§4.1) é *cai a ordem*, e em três das quatro ela cai. Na parede **não pode
   cair**, e a razão está escrita no próprio arquivo (`App.jsx:1121`): *"andar
   resolve a distância e não resolve a parede"*. Sem `contorne`, o reflexo do
   jogador depois de ler um número em metros é andar a direito — contra a pedra.
   **Custa 10 caracteres e a frase ainda sobra 7.**

E o que cai, cai **para melhor**: `Aproxime-se primeiro.` desaparece, e W1 §5.5
já pediu o que a substitui com proveito quando a porta do tabuleiro existir —
`vá até K9 e o golpe alcança` (44). **A ordem não cai no vazio: cai para dar
lugar a um destino.**

### 3.4 · A tabela: **`LINHAS_DO_GOLPE`, e ela mora em `src/golpe.js`**

**Não mora em `estilo.js`, e a recusa tem a fonte escrita no próprio arquivo.**
O cabeçalho de `estilo.js` diz porque é que a paleta saiu de `constantes.js`:
*"Duas mesas diferentes no mesmo balcão — quem vinha ajustar uma regra de jogo
tropeçava na cortiça."* Pôr prosa de mundo (metros, paredes, nomes de criatura)
dentro da folha de estilo é abrir o mesmo balcão outra vez, ao contrário. **E a
folha "não importa nada, de propósito"** — a tabela precisa de `metrosTxt`
(`grid.js:50`), e importá-lo mataria essa regra.

**Mora em `src/golpe.js`, e o argumento é do próprio `App.jsx:1106`:**

> *"`golpe.js` mede e devolve números; estas três funções os VESTEM, e é a única
> coisa que fazem."*

A razão escrita para elas viverem no App é **só** *"moram fora do corpo que
renderiza"* — não é *"vestir não pertence ao módulo"*. `golpe.js` é puro,
importável em Node, já tem suíte (`testes/teste-golpe.mjs`), e já é o dono do
`vd` que as três lêem. **Um varredor não consegue ler JSX; consegue ler isto.**

```js
/* src/golpe.js */

/* O TETO É DE E2 e o que o acompanha não é decoração: a suíte precisa de
   saber com que nome e com que número medir o pior caso, ou mede o caso
   bonito. `numeroMaisLargo` é o que `metrosTxt` (grid.js:50) escreve na
   pior hipótese; `nomeMaisLongoDasTabelas` saiu de varrer o bestiário. */
export const TETO_DA_LINHA = {
  chars: 54,
  numeroMaisLargo: "10,5",          /* 4 caracteres */
  nomeMaisLongoDasTabelas: 18,      /* "Sentinela Blindada" */
};

/* O `fixo` é o custo da frase com o nome VAZIO. Ele está escrito à mão e a
   suíte reconfere-o contra a própria frase — um número que mente sobre a
   linha que está ao lado dele é pior do que número nenhum. */
export const LINHAS_DO_GOLPE = {
  semAlvo:   { fixo: 29, monta: ()        => `Ninguém de pé ao seu alcance.` },
  distancia: { fixo: 26, monta: (n, d, f) => `${n} a ${d} m — faltam ${f} m.` },
  parede:    { fixo: 29, monta: (n, d)    => `${n} a ${d} m — parede, contorne.` },
  aoAlcance: { fixo: 23, monta: (n, d)    => `${n} a ${d} m — ao alcance.` },
};
```

**O aparo mora aqui, nunca na tela** (lei de W1 §3.2 e de E2): uma frase já
aparada é uma frase; uma frase aparada por CSS é uma frase partida.

```js
const aparado = (nome, sobra) => {
  const s = String(nome || "");
  return s.length <= sobra ? s : s.slice(0, Math.max(1, sobra - 1)).trimEnd() + "…";
};
```

**E `recusaDoGolpe`, `linhaDoGolpe` e `maisPertoAoAlcance` mudam de casa**
(`App.jsx:1114-1138` → `golpe.js`), inteiras e byte a byte, passando a ler a
tabela. O App importa-as. *`maisPertoAoAlcance` tem de ir junto: é lida por
`linhaDoGolpe`, por `declararGolpe` (`:11990`) e pela gaveta (`:20847`) — deixá-la
para trás partia a função em dois arquivos.*

### 3.5 · A lei do export morto — quem são os dois leitores

| export | leitor 1 | leitor 2 |
|---|---|---|
| `LINHAS_DO_GOLPE` | `golpe.js` (as duas funções que a vestem) | **`testes/teste-golpe.mjs`** |
| `TETO_DA_LINHA` | `golpe.js` (o aparo lê `.chars`) | **`testes/teste-golpe.mjs`** (lê os três campos) |
| `recusaDoGolpe` · `linhaDoGolpe` · `maisPertoAoAlcance` | `App.jsx` | **`testes/teste-golpe.mjs`** |

**A catraca, cinco asserções, e as cinco lêem a tabela de volta:**

1. para cada entrada, `monta("", numeroMaisLargo, numeroMaisLargo).length === fixo`
   — *o número declarado tem de bater com a frase que está ao lado dele*;
2. `fixo + nomeMaisLongoDasTabelas ≤ chars`, para as quatro;
3. para os **27 nomes** do bestiário × o pior número: resultado `≤ 54`;
4. com um nome sintético de **200** caracteres: resultado `≤ 54` **e** termina em `…`;
5. **nenhum nome de `≤ 25` caracteres é aparado** — ou seja, a frase nunca é
   mutilada por causa de uma criatura que existe nas tabelas.

### 3.6 · O teto de nome na fonte é condição? — **Não. E digo o número que ele devia ter.**

Medido: **a entrada mais apertada das quatro é a parede, que só apara nomes acima
de 25 caracteres** (distância apara acima de 28; ao alcance acima de 31).

> **O máximo das tabelas é 18. O aparo só morde a partir de 25.** Logo **a minha
> redacção aguenta sem o pedido nº 2 do `jogo` ao `backend`**, e aguenta também
> contra um nome de 200 caracteres inventado pelo Narrador, porque o aparo mora
> na tabela.

**Mas eu subscrevo o pedido dele, por outra razão e com um número que ele não
deu:** um nome aparado a 25 (`O Capitão da Guarda d…`) é uma leitura pior do que
um nome que nasceu com 24. **O teto na fonte devia ser `limpar(nome, 24)`** — 24
porque é o maior que nunca faz o aparo morder na frase mais apertada, e é **seis
acima do máximo das tabelas**, logo não apara nada do que a casa escreveu.
*Com ele, o aparo do §3.4 passa a ser cinto contra o inesperado em vez de
comportamento normal — que é o que um aparo deve ser.*

---

## 4. O violeta da mira — **e 74 % não chega, porque foi medido contra um chão que nem sempre está lá**

### 4.1 · O que estava errado no número herdado

O contorno da união corre na **fronteira** do alcance (`grade-de-batalha.jsx:611`),
com `strokeWidth 0.045` centrado na aresta. O número de E1 (**2,689:1 a 60 %**)
foi medido contra `T.bg` **nu**. Mas por baixo daquela linha há mais chão do que
`T.bg`, e todo ele é **mais claro** — que é o lado mau para um violeta claro:

| o que há por baixo da linha | onde | a cor composta |
|---|---|---|
| a faixa de região ímpar | `:559` — `rgba(255,255,255,0.016)` | mais clara que `bg` |
| **a cobertura** | `:573` — `rgba(120,140,190,0.09)` sobre a casa inteira | **o chão inteiro mais claro que existe** |
| o traço da lama | `:572` — `rgba(190,150,90,0.30)`, largura 0,07, passo 0,5 | o mais claro de todos |
| o véu, do lado de fora | `:610` — `rgba(7,5,12,0.46)` | mais escuro (ajuda) |

*(Os estorvos não contam: as elipses vão de 0,19 a 0,81 da casa e **nunca chegam
à aresta** onde a fronteira corre. As paredes são `#07060c` e só ajudam.)*

**Medido por mim, com a fórmula de luminância relativa da WCAG 2.1:**

| a linha | chão nu | **cobertura + faixa** | o traço da lama |
|---|---|---|---|
| **hoje** — `T.violet` a 60 % | **2,679** | **2,575** | 1,892 |
| a 70 % | 3,236 | 3,034 | 2,099 |
| **a 74 %** — o número da pauta | **3,485** | **3,235** | 2,187 |
| **`T.violetSoft` a 60 %** | **3,781** | **3,615** | 2,623 |
| `T.amber` a 60 % (o passo, intocado) | 3,847 | **3,662** | 2,682 |

*(O herdado diz 2,689 e eu meço 2,679 sobre o mesmo chão — dois dígitos trocados,
provavelmente. O de 74 % bate: a pauta diz 3,484 e eu meço 3,485.)*

> ### **74 % dá 3,235 contra o pior chão inteiro. Passa a norma (3:1) e FALHA o piso da casa (3,272, o mais baixo do `lineStrong`) — por 0,037.** E 75 % daria 3,287, que é passar por 1,5 %: exactamente o *"degrau mais baixo que passa"* que o `lineStrong` recusou por escrito quando escolheu passar com 9,1 % de folga.

### 4.2 · A decisão: **não é opacidade. É o token.**

> ### `grade-de-batalha.jsx:611` · `cor={mirando ? T.violet : T.amber}` → **`cor={mirando ? T.violetSoft : T.amber}`**
> ### `grade-de-batalha.jsx:619` · `cor={T.violet}` → **`cor={T.violetSoft}`**
>
> **Uma palavra em cada uma de duas linhas. A opacidade não se toca. O âmbar não
> se toca. Nenhum token novo em `T`. Nenhum número novo em lado nenhum.**

| | hoje | depois | norma 1.4.11 (3:1) | piso da casa (3,272) |
|---|---|---|---|---|
| **`:611`, a mira** | **2,575** | **3,615** | passa | **passa, com 10,5 % de folga** |
| `:619`, o alcance da habilidade (a 70 %) | 3,034 | **4,432** | passa | passa |
| `:611`, o passo em âmbar | 3,662 | 3,662 | passa | passa |

**A norma:** WCAG 2.1, SC **1.4.11 Non-text Contrast** (Nível AA) — a informação
visual necessária para identificar um componente de interface e o seu estado tem
de ter **3:1** contra as cores adjacentes. O piso de 3,272 não é da norma: é da
casa, e é o mais baixo que o `lineStrong` mede (`lineStrong`/`panelSoft`),
instalado em D5 como *"o mais baixo que passa com folga"*.

**Três coisas caem de graça com o token, e nenhuma é acessibilidade:**

1. **`T.violetSoft` já é a cor da mira.** A retícula que marca a casa mirada
   (`:641-643`) é `T.violetSoft`, e o cabeçalho da legenda também (`:837`:
   *"tracejado roxo"*). **Hoje o anel da mira e o contorno do alcance da mira
   falam em dois roxos diferentes.** O conserto de acessibilidade é, por acaso,
   o conserto de uma inconsistência que já estava lá.
2. **As duas línguas do tabuleiro passam a ser igualmente legíveis.** Hoje a mira
   mede 2,575 e o passo 3,662 — **a mesma linha é 42 % mais fraca quando é
   violeta.** Depois: 3,615 e 3,662, **uma diferença de 1,3 %.** *Um tabuleiro
   que fala duas línguas não pode dizer uma delas mais baixo.*
3. **`T.violet` não perde emprego.** Continua a ser a cor de **corpo e borda**
   (`:793`, `:802`, o campo com habilidade armada), onde é lida contra `panel` e
   não contra o chão. **A regra que fica: `violet` é tinta de superfície;
   `violetSoft` é tinta de traço sobre o tabuleiro.**

### 4.3 · O que a lama estraga, e porque é que **não é do violeta**

O traço da lama é o único fundo em que nem a correcção passa: **2,623** para o
`violetSoft`, **2,682** para o âmbar. **Os dois falham, e falham quase igual —
logo o defeito é da lama, não do contorno.**

**O tamanho:** o padrão tem largura 0,07 e passo 0,5, logo cobre **14,0 % do
comprimento** da fronteira, e só onde ela faz aresta com terreno difícil.

**E nenhuma alfa a cura**, medido:

| alfa da lama | `violetSoft` por cima | a lama contra o chão |
|---|---|---|
| **0,30 (hoje)** | 2,623 | 1,696 |
| 0,18 | 3,054 *(só a norma)* | ~1,4 |
| **0,12** | **3,265** *(ainda abaixo de 3,272)* | **1,171 — a lama desaparece** |

**A lama só deixa o contorno passar quando ela própria deixa de ser visível.** O
mesmo acontece escurecendo a cor (`#5A4528` dá 3,317 ao contorno e 1,171 à lama).

> **A correcção completa não é de cor: é uma ORLA.** Uma segunda linha por baixo
> do `Contorno` (`:201`), em `T.bg`, com 1,6× a largura — a solução de cartografia
> para uma linha que atravessa terrenos diferentes. Com ela, a cor adjacente ao
> traço passa a ser **sempre `T.bg`**, e o rácio é **3,781 em todo o tabuleiro**,
> lama incluída, para os dois contornos e também para o `danger` da área.
>
> **Fica escrita com o número e NÃO é deste ciclo** — toca o `Contorno`, logo toca
> a mira, o alcance, o passo e a área de magia de uma vez, e esta casa cresce por
> etapa com catraca. *Digo-o agora para que ninguém a redescubra.*

---

## 5. Para a pessoa decidir — a proposta ambiciosa

### **O tabuleiro passa a desenhar o NÃO. A linha que sai do herói e não chega.**

**O diagnóstico, e ele é meu e é de forma.** Fui contar o que o tabuleiro
desenha hoje: o passo previsto (`:631`), o passo a acontecer (`:636`), a mira
(`:641`), o alcance (`:611`, `:619`), a área (`:624`). **São seis desenhos, e os
seis desenham coisas que VÃO acontecer.**

> ### **O tabuleiro deste jogo nunca desenhou uma recusa.** Ele tem seis formas para o sim e zero para o não — e o não é o que acontece em **10 de 10 plantas, no turno 1 de toda luta corpo a corpo**.

**A proposta:** na rodada em que o motor recusa o golpe, uma linha reta sai da
ficha do herói na direcção do alvo mais próximo **e pára onde o alcance acaba**.
Um traço, e depois nada. A distância que falta fica desenhada como o que é: um
vão.

E ela tem **dois estados, e é o segundo que faz dela a forma de W2**:

| quando | a linha | o que diz sem palavra nenhuma |
|---|---|---|
| a recusa por **distância** | sai, pára ao fim do alcance, deixa o vão | *a espada chega até aqui* |
| a recusa por **parede** | sai e **pára na pedra**, antes do vão | *não é distância — é aquilo* |
| **a fala** | a mesma linha **chega**, inteira, até à ficha | ***a voz não tem alcance*** |

**Porque muda o que o jogador vive.** Hoje a abertura de toda luta ensina *"ande
em frente"* — 1,4 rodadas sem decisão e sem narração (X1, X4). Com isto, a
primeira coisa que ele vê é **a sua própria arma a ficar a meio caminho**, e
depois, se falar, **a mesma linha a chegar.** *A frase do `jogo` — "a 19,95 m a
tua voz chega e a tua espada não" — deixa de precisar de ser escrita, porque
está desenhada.* E as duas recusas, que o `App.jsx:1121` diz serem *"coisas
diferentes"*, passam a parecer diferentes em vez de se lerem diferentes.

**Comprovado, pelos três caminhos:**

- **Medida.** Os dados já estão todos calculados e não custa uma conta nova:
  `vd.maisProximo.distanciaM`, `vd.alcanceM` e `vd.faltaM` saem de
  `golpe.js:190-198`, e a posição das fichas já é o que a grade desenha. **Zero
  peças novas, zero cores novas** — é o `T.amber` do passo (é a arma do jogador)
  e o `T.violetSoft` corrigido no §4 quando chega. A geometria da folga já foi
  medida em W1 §2.2: o arco da vida pára a 0,47 da casa, logo a linha tem onde
  acabar sem tocar em ninguém.
- **Estudo citado.** A lei desta casa, escrita: ***o veredito antes do clique***.
  Hoje ela cumpre-se em texto (`recusaDoGolpe`) e **não se cumpre em forma** —
  e o §0.1 provou que o texto está dentro de uma gaveta que nasce fechada. *Um
  veredito que depende de o jogador abrir uma gaveta não é um veredito antes do
  clique.* A linha está sempre lá.
- **Experiência jogada — não a tenho, e é o buraco.** Não joguei isto porque não
  existe. **É a razão de a proposta ser da pessoa e não minha.**

**Porque é dela.** Muda o que o tabuleiro **é**: de um mapa do possível para um
mapa que também mostra o impossível. O jogador tem de reaprender a ler uma
linha que não chega — e isso é fluxo.

**O risco, dito por mim, e é o mesmo de W1 §2.4 com outra roupa.** É **mais um
traço** num tabuleiro que eu próprio já acusei de poder virar mosaico, e chega no
momento mais carregado (o véu no máximo, o contorno da união aceso). **A defesa
que eu proponho e não consigo provar:** a linha da recusa só existe enquanto
**não há verbo armado** — arma-se um verbo e ela apaga-se, porque aí o tabuleiro
voltou a falar de sins. **Um traço que some quando o jogador age não disputa
atenção com a acção.** É suposição, e está dita como tal.

---

## 6. O que entrou no Figma

Arquivo `Taverna — biblioteca`, `e5wJUzInAssoebx5npssKc`. **Ampliado, nunca
duplicado. Zero peças novas, zero variantes novas — a etapa inteira coube no que
já existia**, e é essa a notícia:

| o quê · nó | o que é |
|---|---|
| página **`W2 · o segundo emprego`** · `136:2` | nova |
| ↳ `136:3` — **`a quinta dica — e é SÓ uma dica`** | o par comparável do campo: duas instâncias de `Campo` *Tom=Neutro, Estado=Repouso*, com a dica de hoje e a que eu recusei, e o porquê da recusa |
| ↳ `136:28` — **`as quatro frases contra o teto de 54`** | as quatro, hoje e depois, com a régua de 324 px (54 × 6,0 px, medido em E2) e a contagem ao lado |
| ↳ `137:16` — **`o violeta da mira — 2,575 → 3,615`** | seis células: o contorno de hoje e o de W2 sobre os três chãos reais, com o rácio medido debaixo de cada uma |
| `Campo` · `133:90` | **lido, não tocado.** 12 variantes; `a dica` já é propriedade TEXT |

**A dívida de peça que eu declaro e não paguei:** o padrão de `a dica` na peça é
`Fale, aja, explore…` e o código diz `O que você faz? Fale, aja, explore…`. **A
peça perdeu a pergunta.** É uma linha, é minha, e não a mexi porque `Campo` está
por baixo de composições que o `jogo` não reviu — a mesma condição que E1 pôs e
que W1 respeitou contra mim próprio.

---

## 7. O que eu peço, e a quem

**Ao `jogo` — três, e nenhum é decreto:**

1. **O `placeholder` não ganha o quinto estado, e `A voz alcança.` fica onde ele
   a pôs** (§1). Concordo com ele e desisto da minha versão — mas a razão que
   vale é a minha: **o `placeholder` apaga-se na primeira letra digitada**, e um
   convite a falar não pode morrer quando a fala começa.
2. **O glifo da fala é `💬`, e o da segunda fala da rodada também** (§2.1) — não
   `⏳`. A gramática do chat é *o glifo nomeia o assunto*, e `💬` é o irmão do
   `IconeBalao` que a caixa já usa.
3. **A segunda linha do veredito cabe e custa zero casas** (§2.2) — porque só
   existe quando a fila de pílulas não existe. E ela é *Tom=Estado*, não
   *Impedimento*: a de cima já é o impedimento.

**Ao `oficial` / `aprendiz` — o que se constrói hoje, e está fechado:**

4. **`LINHAS_DO_GOLPE` em `src/golpe.js`**, com as quatro frases do §3.3, o
   `TETO_DA_LINHA`, o aparo, e a mudança de casa das três funções (§3.4). A
   catraca do §3.5 tem cinco asserções, e as cinco lêem a tabela de volta.
5. **`T.violet` → `T.violetSoft` em `grade-de-batalha.jsx:611` e `:619`** (§4.2).
   Duas palavras. A opacidade não se toca, o âmbar não se toca, e **nada deve ser
   posto a 74 %** — está medido que não chega.

**Ao `backend`, pela `mente/pedidos-ao-sistema.md`** — dois, somados aos que já
lá estão, sem tocar em nenhum (§8 de lá).

---

## 8. O que ficou feio, e o que eu não soube

**Feio.**

- **A linha do veredito continua dentro de uma gaveta que nasce fechada**, e eu
  achei-o mas não o paguei. Toda a composição de W2 — a minha e a do `jogo` —
  assenta numa região que o jogador tem de abrir. *É o defeito mais caro que esta
  etapa encontrou e o único que ela não resolve.*
- **`parede, contorne.` é telegráfico a ponto de ser rude.** Em mono de 10 px
  numa linha de máquina, passa; lido em voz alta, não é uma frase que alguém
  diga. Sobram 7 caracteres e eu não soube gastá-los melhor.
- **Gastei um quinto estado de `placeholder` inteiro — redigido e medido — para
  o deitar fora.** O trabalho perdido é pequeno; o que incomoda é que a razão
  que o matou (o `placeholder` apaga-se ao digitar) eu sabia antes de começar, e
  só a vi depois de ter o texto pronto.
- **A correcção do violeta é uma palavra**, e passei mais tempo a medir os chãos
  do que alguém vai passar a aplicá-la. *Isso não é feio — feio é que o número
  errado (74 %) esteve dois ciclos na pauta porque ninguém perguntou contra o quê
  é que ele tinha sido medido.*

**Não soube.**

- **Se `violetSoft` a 60 % ainda lê como "roxo" e não como "cinzento-lilás"** num
  telefone ao sol, sobre um tabuleiro escuro. O rácio subiu 40 %; a **saturação
  desceu**, e a distinção violeta × âmbar é a única coisa que separa as duas
  línguas do tabuleiro. **Não há como medir isso sem o campo a correr**, e o
  canal de que esta casa desconfia (a foto) é justamente o único que o mostraria.
- **Quantas vezes a gaveta `Ações` está aberta durante uma luta.** Todo o meu
  §0.1 diz que a região é condicional; **não sei se na prática ela está aberta
  90 % do tempo ou 10 %**, e a resposta muda se o achado é grave ou é uma nota de
  rodapé. *Sai de jogar, e eu não joguei.*
- **Se a segunda linha da voz devia mesmo ser `Tom=Estado`.** Escolhi-o por
  eliminação (a de cima já é `Impedimento`), não por ter visto as duas juntas.
- **Se a linha que não chega (§5) se lê como "a arma pára aqui" ou como "há uma
  parede invisível aqui".** É exactamente a ambiguidade que o estado da parede
  existe para desfazer, e desenhá-los os dois parecidos podia criar o problema
  que ambos resolvem. **Não desenhei os dois lado a lado**, e devia.

---

*Fase W2 · `desenho` · 16/09, sobre a v9.263. O par é o `jogo`; o desempate é do
`regente`. Nenhuma linha de produção escrita; a forma decidida vive no bloco de
`mente/formas.md`.*
