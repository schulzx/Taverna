# K3 · a reação acontece — o bloco do `jogo`

*Para fundir em `mente/formas.md` (§ `reagir ao golpe que chega`). **Nenhum
arquivo do projeto foi tocado** — nem `.js`, nem `.jsx`, nem `.mjs`, nem a
pauta, nem o diário, nem `agora.json`. Este documento é o produto inteiro.*

*K1 decidiu a forma, K1b o tempo, K2 a trava. **Aqui não se redesenha nada.**
O que se decide é o momento vivo: as palavras, a ordem dos instantes, e o que
o jogador sente quando é golpeado. Os números de §4 e §5 são **corridos** —
uma luta jogada no navegador (Uma Noite · Torneio, ladino nv 3) e duas
varreduras de 20 000 sementes sobre os módulos reais (`combate.js`,
`reacoes.js`, `ritmo-da-reacao.js`), no scratchpad da sessão.*

---

## 1 · as palavras, escritas literalmente

### 1.1 · a regra que gera a tabela, e ela é de uma linha

`formas.md` (1014-1024) fixou o princípio: **`respondeu` e `expirou` diferem
em QUEM agiu, não em SE agiu** — nos dois casos uma reação aconteceu, o glifo
é verdadeiro nos dois, e o que os separa são as palavras. **`recusou` é a
única sem gesto e a única sem glifo.**

A forma que sai daí é verificável por catraca, e é por isso que é uma forma e
não vinte e quatro frases:

> **Toda linha da coluna «você» começa por `você `. Toda linha da coluna «não
> foi você» termina em ` por você`.** Uma frase que não obedeça às duas é
> defeito de tabela, não de gosto — *a diferença entre as duas saídas tem de
> caber na gramática, senão ela tem de ser explicada, e explicar é o sistema
> a falar de si mesmo.*

### 1.2 · `PALAVRAS_DA_RESOLUCAO` — o gesto, por reação

Lida por `id` de `reacoes.js`. **Duas colunas, e mais nada** — o número não
está aqui, porque o número já sai de `resolverReacao` (`cortou`, `dano`,
`danoFinal`, `pm`) e duplicá-lo seria escrever a regra duas vezes.

```js
/* O CARTÃO, e só o cartão. O LOG fica byte a byte o de hoje (K1 §7).
   Coluna 1: começa em "você". Coluna 2: termina em "por você". A suíte
   assere as duas, e é essa asserção que impede a frase nova de nascer
   a meio de um JSX. */
export const PALAVRAS_DA_RESOLUCAO = [
  { id: "contramagia",   voce: "você cortou a magia no ar",      instinto: "a magia se desfez por você" },
  { id: "escudo_arcano", voce: "você ergueu a barreira",         instinto: "a barreira subiu por você" },
  { id: "aparar",        voce: "você aparou o golpe",            instinto: "o instinto aparou por você" },
  { id: "esquiva_agil",  voce: "você saiu da linha do golpe",    instinto: "o corpo saiu por você" },
  { id: "contra_ataque", voce: "você revidou na mesma batida",   instinto: "a mão revidou por você" },
  /* `oportunidade` NÃO tem linha, e a ausência é a decisão escrita:
     `inimigo_cai` não abre janela (K1 §6), logo esta reação nunca chega a um
     cartão. Uma entrada aqui seria export morto no dia em que nascesse. */
];
```

`o instinto aparou por você` é a frase que `formas.md` fixou, palavra por
palavra. As outras quatro saem dela pela mesma regra: **quem age quando não
foi o jogador é a parte do corpo que já sabia** — a mão do marcial, o corpo do
furtivo, a barreira que o conjurador já tinha pronta.

Comprimentos: 21 a 26 caracteres na coluna «você», 20 a 26 na outra. O cartão
tem 343 px no telefone (§4.3); cabem numa linha nas duas.

### 1.3 · `PALAVRAS_DO_RECUO` — a única saída sem gesto

`formas.md` deu-lhe uma frase. **São duas, e a segunda é um achado desta
etapa:** `recusou` pode acontecer nos dois gatilhos que abrem janela, e
`inimigo_erra` não tem golpe nenhum a passar. Dizer *"você deixou o golpe
passar"* quando o inimigo errou seria a interface a mentir sobre a mecânica —
o defeito que esta fase existe para não cometer.

```js
export const PALAVRAS_DO_RECUO = [
  { gatilho: "sofre_dano",   frase: "você deixou o golpe passar" },
  { gatilho: "inimigo_erra", frase: "você deixou a brecha passar" },
];
```

**Sem glifo, e não se inventou um neutro:** a regra já existia — `Papel=Recuo`
não tem glifo, porque nenhum glifo desta casa diz *deixar passar* sem mentir.
Mecanicamente, a coluna do glifo continua a ocupar **22 px fixos** e o texto
começa no mesmo x com glifo e sem.

### 1.4 · o quadro completo — as frases prontas para a mão colar

**O cartão tem duas linhas.** A primeira é prosa (as tabelas acima); a segunda
é o número, em mono, e **não é texto novo**: sai de `resolverReacao`.

| reação | `respondeu` | `expirou` (1.ª e 2.ª) | `recusou` |
|---|---|---|---|
| **Contramágica** | `você cortou a magia no ar` | `a magia se desfez por você` | `você deixou o golpe passar` |
| **Escudo Arcano** | `você ergueu a barreira` | `a barreira subiu por você` | `você deixou o golpe passar` |
| **Aparar** | `você aparou o golpe` | `o instinto aparou por você` | `você deixou o golpe passar` |
| **Esquiva Ágil** | `você saiu da linha do golpe` | `o corpo saiu por você` | `você deixou o golpe passar` |
| **Contra-ataque** | `você revidou na mesma batida` | `a mão revidou por você` | `você deixou a brecha passar` |
| **Ataque de Oportunidade** | — *nunca chega ao cartão* | — | — |

**A segunda linha, por gatilho** (números de `resolverReacao`, não palavras):

| | a linha do número |
|---|---|
| `sofre_dano`, cortou < dano | `4 evitado · 9 vira 5` |
| `sofre_dano`, cortou ≥ dano | `o golpe não te acerta · 9 vira 0` |
| `sofre_dano`, com PM | `4 evitado · 9 vira 5 · −2 PM` |
| `inimigo_erra`, revide acertou | `revide em Ogro · 6 de dano` |
| `inimigo_erra`, revide errou | `revide em Ogro · errou` |
| `recusou`, `sofre_dano` | `9 inteiros` |
| `recusou`, `inimigo_erra` | `a guarda fechou` |

**A quarta saída** (`expirou` que cala a luta) é a linha de `expirou` da sua
reação, **mais** o aviso de §2, na linha de baixo.

### 1.5 · o log — byte a byte o de hoje, e o que isso obriga

| saída | o log |
|---|---|
| `respondeu` | **a linha de hoje, byte a byte.** `resolverReacao` produz a mesma string quer quem escolha seja o sistema, quer seja o jogador |
| `expirou` (1.ª e 2.ª) | **a linha de hoje, byte a byte** |
| **`recusou`** | **NADA.** Nenhuma linha. |

**E `recusou` não escrever no log é uma correcção, não um esquecimento.** K1 §7
prometeu-lhe uma linha nova (`você deixou o golpe passar · 9 de dano`) e K2 §5
proibiu-a pela porta 10 (*«as frases novas vivem no cartão, e só lá»*). **Os
dois blocos contradizem-se, e a contradição resolve-se do lado de K2**, por
três razões:

1. `recusou` **não tem linha de hoje para igualar**, logo qualquer linha é uma
   linha nova no log — que é literalmente a porta 10.
2. **A ausência da linha já diz tudo.** O golpe inteiro aparece na linha `🛡`
   de sempre, com o número por cortar. Uma linha a dizer *"nada aconteceu"* é
   o sistema a falar de si mesmo.
3. O log é a memória da luta. **O recuo resolve-se no cartão e morre lá** — e
   é exactamente isso que `Etapa=Resolvida` existe para fazer.

**O que `recusou` escreve é a nota ao Narrador, e essa sim é nova.** É o único
canal em que uma escolha do jogador tem de chegar ao Mestre, é **por turno**
(não é bloco estático, logo não toca no teto), e só existe quando acontece:

> `[REAÇÃO — RECUSADA PELO JOGADOR] Eu vi o golpe de {atacante} chegar e
> escolhi encaixá-lo: levei os {dano} inteiros de propósito. Narre a decisão,
> não o descuido — e não invente uma defesa que eu não fiz.`

**E há uma porta que ninguém abriu, e é regra, logo não é minha:** *o que
`recusou` recusa — a pergunta, ou o recurso?* A minha decisão de desenho é
**os dois** (`reacaoUsadaRef` fica marcada), e a razão é dura: se o recuo só
recusar a pergunta, os golpes cobertos continuam a ir ao motor de hoje, e o
log escreve `⚔ REAÇÃO — Aparar` **na linha a seguir a o jogador ter dito que
não**. *O sistema a desmentir o jogador na linha seguinte é pior do que não
lhe ter perguntado.* Fica nomeado em §6 como peça que falta.

---

## 2 · o aviso do silêncio, dito uma vez

**A frase existe, e é honesta.** Escrevi-a e depois fui conferi-la contra a
lei (*o sistema não fala de si mesmo*): não diz janela, não diz reação, não diz
preferência, e não explica mecanismo nenhum. Diz o **efeito** e a **duração**,
que é tudo o que o jogador precisa e é tudo o que é verdade.

> ### `o instinto assume o resto da luta`

**Porquê esta e não a de K1.** K1 escreveu *"você deixou passar três vezes · o
instinto assume o resto da luta"*. A primeira metade morre por duas razões: o
número **está errado** desde K1b (a escada perdeu o degrau do meio e tem duas
linhas, não três), e contar expirações é **contabilidade de mecanismo** — é o
jogo a mostrar o seu próprio contador. A segunda metade é a frase, e é de K1:
ela sobrevive inteira e o crédito é dele.

**Onde aparece: no cartão, e em mais lado nenhum.**

- **No log, não** — porta 10 de K2: o log fica byte a byte o de hoje.
- **No cartão, sim** — como segunda linha da **última** `Etapa=Resolvida` da
  luta, debaixo da frase de `expirou` da reação que aconteceu. Três razões:
  o aviso é sobre o que vem a seguir e o log é a memória do que passou; o
  cartão é onde a pergunta foi feita, e é ali que faz sentido dizer *não volto*;
  e **é a última coisa que aquela peça faz antes de sair de cena** — *o aviso é
  a despedida da peça, não um comunicado do jogo.*
- **Depois dele não nasce mais nenhum cartão nesta luta.** A rodada resolve-se
  como hoje, em silêncio, sem uma linha a mais (porta `silencio`).

**E o que a frase não diz, dito por mim.** Ela não diz como sair do silêncio —
e não diz porque **não há saída dentro da luta**. Fui verificar em vez de
supor: `ritmoDaRodada` fecha tudo enquanto `expiracoesSeguidas >= 2`, e o
comentário do módulo diz *«o contador zera na primeira resposta»* — mas **se
nenhuma janela abre, não há resposta que o zere**. A escada, dentro da luta
corrente, é uma **porta de um sentido só**. Isso não é defeito (é exactamente o
que a escada promete: *pelo resto DESTA luta*), mas a frase do módulo sugere
uma saída que não existe, e alguém a vai ler um dia e acreditar. Por isso a
palavra que carrega o peso do aviso é **«o resto da luta»**, e ela tem de lá
estar: é a única parte da frase que diz que isto é irreversível.

*(Se a pessoa quiser uma saída dentro da luta, ela existe e é barata: a fila da
ficha continua tocável em combate, e `[✓ EU DECIDO]` é a pílula que já vem
marcada. Mas isso é a ficha, não é o aviso — e o aviso não pode apontar para
ela sem falar do mecanismo.)*

---

## 3 · a ordem exata dos instantes, do golpe ao dano

**A lei que governa a lista:** *o PM só sai da ficha quando o jogador escolheu,
ou quando a preferência dele disse que sim.* **E o veredito antes do clique:**
o preço está na tela antes de qualquer toque ser possível.

**A regra que atravessa tudo e que resolve metade dos conflitos:** *enquanto a
janela está aberta, NADA entra no log.* O chat não se mexe — porque *a pergunta
sobrepõe, nunca empurra*, e uma linha nova a rolar o chat **é** empurrar, no
segundo exacto em que ele decide. O log é despejado depois, na ordem de hoje.

1. **`turnoDosInimigos` devolve a rodada inteira** (`App.jsx:13955`). Nada no
   chat, nada na ficha, nenhum dado rolado a mais.
2. **`ritmoDaRodada` decide se a janela abre e em que golpe.** Sem dado, sem
   PM, sem PV. **Fechada por qualquer das nove portas → salta para o 12**: a
   rodada de hoje corre inteira, síncrona, byte a byte.
3. **`pushMsgs("🌍 VEZ DO MUNDO — rodada N")`** — já hoje é a primeira linha da
   rodada, e continua a ser.
4. **O cartão nasce.** Ancorado no topo da linha do veredito, a crescer **para
   cima**, 120 ms de `opacity` + `translateY(6px)`, `cubic-bezier(.2,.7,.3,1)`.
   **No primeiro frame ele já traz as três coisas**: o facto (`o Ogro te acerta
   · 9`), o verbo **armado** com o preço (`aparar · 0 PM — corta metade`) e o
   recuo (`deixar passar`). *O preço não depende de `hover`, e é por isso que
   ele está lá antes do primeiro toque ser possível.*
   - **A trava de 150 ms**: o cartão não aceita toque nos primeiros 150 ms.
   - **Nada saiu da ficha.** PV e PM intactos. *O preço lê-se contra o saldo, e
     o saldo tem de estar visível* — ver §4.4, onde isso falha no telefone.
5. **O relógio corre, uma vez só**: 11 000 ms de folga **sem relógio nenhum**,
   depois o trilho desce **linear** 4 000 ms na aresta de baixo do botão, e o
   último 1 000 ms é o aperto. `width: 100%` da janela para o trilho, `N%` do
   trilho para o cheio — **proporção, nunca píxeis** (§4.3 diz porquê, com a
   medida). **Só corre com a aba visível.**
6. **O desfecho, e só um acontece** — `fecharAJanela`, o portão de uma via:
   - toque / `Enter` / `Escape` → `"jogador"`; **o trilho desaparece no mesmo
     frame** — é o sinal de que o relógio parou, e não custa elemento nenhum.
   - o relógio chega ao fim → `"expirou"`.
   - a aba escondeu-se → `"escondida"`, e **a escada não conta este degrau**.
   O segundo a chegar recebe `valeu: false`, **não entra, e por isso não rola**.
7. **A resolução, dentro do ramo `valeu === true` e só lá:**
   - **respondeu** → `resolverReacao(escolhida, …)`. `reacaoUsadaRef = true`,
     `pmReacaoRef += res.pm`.
   - **recusou** → nada rola e nada se resolve. `reacaoUsadaRef = true`
     (§1.5), `pmReacaoRef` **não sobe**.
   - **expirou / escondida** → `reacaoDoSilencio({ golpes, heroi: persBase,
     desde: abre.ordem })` — o laço de hoje, do golpe da janela em diante, por
     **todos** os cobertos ([R1]). `persBase`, nunca `persTracos`.
8. **`a.r.dano = rc.danoFinal`** — no golpe em que a reação **de facto** caiu, e
   **no mesmo sítio de hoje** (`App.jsx:13982`), antes de `amortecerDano`. *A
   linha de `Etapa=Resolvida` lê o resultado, não a pergunta* (K2 §3.1): o nome
   do inimigo sai do golpe em que a reação caiu, não do golpe do cartão.
9. **`pushMsgs` da linha da reação** — a de `resolverReacao`, byte a byte.
   `recusou` não escreve nada aqui. A nota entra em `notaRef` na ordem de hoje.
   **Esta continua a ser a primeira linha que o chat recebe depois do cabeçalho
   da rodada** — a ordem feia de hoje fica intacta (asserção 07).
10. **O cartão resolve-se no sítio** — `Etapa=Resolvida`, `Tempo=Parado` (já não
    há relógio), **56 px**. O verbo é substituído pela prosa de §1 e pelo
    número. O glifo fica se houve gesto; em `recusou` a coluna de 22 px fica
    vazia. **Fica 1 200 ms.**
11. **O resto da rodada corre síncrono, exactamente como hoje** — o laço por
    todos os golpes, `linhasSis` a encher, `amortecerDano` → `repartirDano` →
    `passarPeloAbrigo`, `danoNoJogador` a somar.
12. **`pushMsgs(linhasSis)`** (`:14083`) — todas as linhas dos golpes de uma vez,
    **depois** da linha da reação. **É aqui, e só aqui, que o chat se mexe.**
13. **O cartão sai** — 140 ms, só opacidade, ao fim dos 1 200 ms. A barra dos
    verbos reaparece; a linha do veredito volta ao que era. A câmara não se
    mexeu um pixel em nenhum dos treze passos.
14. **`golpeRecenteRef`, a concentração, a Dádiva** — na ordem de hoje.
15. **O dano vira PV e o PM sai da ficha, no mesmo instante** — `persAtual =
    { …persTracos, vida: vida − danoNoJogador, mana: mana − pmReacaoRef }`
    (`:14126`). **Fim da rodada, um só sítio, e K3 não o move.**
16. **`pmReacaoRef = 0`**; `reacaoUsadaRef` zera na abertura da rodada seguinte.
17. **O envelope vai ao Mestre** (`enviar`), com `a.r` já cortado.

### 3.1 · a lei do PM, lida com honestidade

Verifiquei os três caminhos contra a lei, e **dois cumprem-na e um não**:

| | o PM sai? | a lei diz |
|---|---|---|
| **respondeu** | sim | *«quando o jogador escolheu»* — cumpre |
| **recusou** | **não** | cumpre, e é o único sítio onde a lei tem dentes |
| **preferência travada na ficha** | sim, sem janela | *«quando a preferência dele disse que sim»* — cumpre |
| **expirou** | **sim** | **não cumpre** |

**Expirar gasta PM sem o jogador ter escolhido.** Hoje também gasta — é o jogo
de hoje, e a trava de K2 **obriga** a que continue a gastar (efeito #4 da
tabela de §1 de K2). Logo a lei não é cumprível em K3 sem partir a trava, e eu
prefiro escrevê-lo a disfarçá-lo.

O máximo honesto que K3 pode fazer, e faz: **o preço está na tela durante os
quinze segundos inteiros, e há um toque que o impede.** A expiração é
consentimento por omissão, e o cartão é o aviso. Quem nunca quer pagar tem
`[DEIXAR PASSAR]` na ficha — a porta `preferencia`, que nunca abre janela.

*A leitura da lei que K3 pode assinar é esta: o PM sai da ficha quando o
jogador escolheu, quando a preferência dele disse que sim, ou quando ele viu o
preço durante quinze segundos e não o recusou. A terceira é a que a trava
obriga — não a que eu escolheria.*

---

## 4 · joguei, e medi

**A luta.** Uma Noite · O Torneio, **A Sombra** (ladino nv 3, 24 PV, 18 PM),
contra **O Remendo** (elite, 28 PV). Chrome, dev-server, aba nova (o aviso do
HMR). `Rolagens de combate: visíveis`, para o log dar o d20 de cada golpe.

### 4.1 · a rodada que eu vi, linha a linha

```
🌍 VEZ DO MUNDO — rodada 2: os inimigos e o seu grupo agem.
🗡 REAÇÃO — Contra-ataque
🗡 Revide em O Remendo: errou
🎲 O Remendo → A Sombra: d20 8+5=13 vs 15 · erra
🛡 O Remendo · Golpe pesado → A Sombra: errou
🎲 O Remendo → A Sombra: d20 18+5=23 vs 15 · acerta, 10 de dano
🛡 O Remendo · Investida brutal → A Sombra: 10 de dano
🛡 Salvaguarda de Vigor contra Investida brutal: d20 1+1=2 vs 12 · 🤕 Caído
```

**Dois golpes no herói numa rodada** (um elite tem multiataque 2). **A reação
de hoje disparou uma vez**, e disparou no **erro**: `contra_ataque`, gatilho
`inimigo_erra`, no primeiro golpe. Sob K1b, **a única janela da rodada teria
aberto ali** — *revidar · 0 PM* —, e a Investida brutal que levou **10 dos 24
PV dela** teria ficado **coberta, sem uma pergunta**.

E as três outras coisas que a rodada mostrou, e que valem por si:

- **A linha da reação aparece antes de todas as linhas de golpe.** A nota feia
  de K2 §1 não é teórica: eu li *"REAÇÃO — Contra-ataque"* antes de saber que
  golpe a tinha causado.
- **O revide errou.** `contra_ataque` gastou a reação da rodada e não fez nada.
- **O log colapsa a rodada** em `⚔ 3 golpes · 10 sofrido · 1 erro · 2 rolagens`
  com um `▾ 6 linhas`. **O cartão nasce por cima de um log que está fechado** —
  mais uma razão para a resposta chegar onde a pergunta foi feita.

### 4.2 · a varredura — porque uma luta não é «uma rodada típica»

O Torneio é sempre 1v1. Para responder à pergunta como ela foi feita, corri o
motor real com um mulberry32 no lugar de `Math.random`, **20 000 sementes por
caso**: `turnoDosInimigos` → `ritmoDaRodada` → o laço de `App.jsx:13972-13982`.

| mesa (ladino nv 3) | golpes no herói / rodada | dano / rodada | `escolherReacao` ≠ null | rodadas que **abrem janela** | janelas que abrem **num erro** |
|---|---|---|---|---|---|
| 1 elite *(a luta que joguei)* | **2,000** | 14,90 | **82,17 %** | **100 %** | **39,91 %** |
| 2 comuns | 2,000 | 7,12 | 81,70 % | **100 %** | **49,94 %** |
| 4 comuns | 4,000 | 14,30 | 96,75 % | **100 %** | **49,94 %** |
| 4 lendários nv ≥12 | 12,000 | 130,40 | 100 % | **100 %** | 34,84 % |
| **ladino + 2 companheiros · 4 comuns** | **2,599** | **9,29** | — | **98,60 %** | **50,09 %** |
| guerreiro nv 3 · 1 elite | 2,000 | 14,90 | 96,64 % | 100 % | 39,91 % |
| mago nv 3 · 2 comuns | 2,000 | 7,12 | 62,37 % | **62,37 %** | 0 % |

**Os dois números que mudam o que eu penso desta fase:**

> **1 · A janela abre em 98,6–100 % das rodadas** para marcial, misto e furtivo
> — que são **sete das doze classes** (`PERFIS_COMBATE`: 4 marciais, 2 mistas,
> 1 furtiva; as outras cinco são conjuradoras, e para essas a janela abre em
> 62–100 %, sempre em `sofre_dano`). **Não existe rodada de descanso.** A
> razão é de tabela e é conferível: `ritmoDaRodada` só aplica o limiar do
> arranhão a `sofre_dano` (`paga = g.gatilho !== "sofre_dano" || …`, linha 256).
> **Todo erro do inimigo abre janela, sem limiar nenhum**; um acerto só abre se
> passar `max(minDano, 8 % da vida)`. *A porta do arranhão filtra os golpes que
> doem e deixa passar os que não doem.*

> **2 · Metade das perguntas é sobre o momento em que ele não foi atingido.**
> 50,09 % na mesa mais parecida com a campanha. E K1 matou `inimigo_cai` com
> esta frase: *«uma pergunta cuja resposta é sempre sim não é pergunta, é um
> diálogo de confirmação com relógio»*. **`inimigo_erra` é o irmão dela**: 0 PM,
> sem lado mau visível, e o único custo — a reação da rodada — é invisível.

E a terceira medição, que é a que dói:

| ladino + 2 comp · 4 comuns | |
|---|---|
| a janela abre **no maior golpe da rodada** | **36,09 %** |
| dano do golpe **sobre o qual ele é perguntado** | **3,56** |
| dano que chega **coberto, sem pergunta** | **5,86** |
| **fracção do dano da rodada que ninguém lhe perguntou** | **63 %** |

*(Ladino solo contra 4 comuns: **75 %** do dano da rodada chega sem pergunta.)*

**Isto não é regressão** — hoje é idêntico, porque a reação já é uma por rodada
e já cai no primeiro golpe que qualifica. **Mas hoje é invisível.** Com a
janela, o jogador **vê a pergunta errada** e depois **vê o dano sobre o qual
ninguém lhe perguntou**. É *o veredito antes do clique* virado do avesso: o
veredito chega antes do clique do golpe que menos importa.

### 4.3 · onde o cartão nasce — e a largura, medida

**A região é a linha do veredito** — a faixa do campo de texto + `Agir →`,
`App.jsx`, filho 2 do bloco `px-4 md:px-8 shrink-0`. O cartão ancora no **topo**
dela e cresce **para cima**, sobrepondo a barra dos verbos. Medido em combate,
com o painel visível, pela árvore e pelo `getBoundingClientRect` — **não por
screenshot** (a foto congela com o painel oculto).

| viewport | linha do veredito: `x` | **largura** | barra dos verbos (altura) |
|---|---|---|---|
| **320** | 16 | **288** | 40 |
| **375** *(o telefone)* | 16 | **343** | 40 |
| 560 *(janela estreita)* | 16 | 528 | 40 |
| 768 | 32 | 632 | 27 |
| 1024 | 32 | 888 | 27 |
| **1536 × 816** *(o monitor desta máquina, `screen` 1536×864, dpr 1,25)* | 32 | **1400** | 27 |

> **288 → 1400 px. A mesma região varia 4,86×.** K1b descobriu o defeito com um
> cheio de **213 px fixos** que dava 62 % a 344 e 60,7 % a 351 — **uma
> diferença de 7 px**. Aqui a diferença é de **1 112 px**. O mesmo estado
> nominal de 62 % daria **868 px** no monitor e **179 px** num telefone de 320:
> um cheio em píxeis lê **74 % a 320 e 15,2 % a 1536**. *Um relógio medido em
> píxeis não é um relógio, é um desenho de um relógio* — e esta é a medida que
> impede a mão de repetir o erro num monitor, onde ele é 159× maior.

**A regra, repetida com a medida por trás:** trilho `width: 100%` da janela,
cheio `width: N%` do trilho. **E nenhum número de píxeis em nenhum dos dois.**

### 4.4 · a colisão que a composição de K1 não podia ver

K1 compôs num quadro de 375×812 em que a tira do herói ficava **em baixo**, e
ancorou o cartão em `y 764` com *«tapa do campo: zero»*. **No app de hoje a
pilha de baixo é outra**, e fui medi-la (`tv-espaco-abas`, de cima para baixo):

| | 375 × 812 | 1536 × 816 |
|---|---|---|
| tira do herói (NIV · PV · PM · data · XP) | **493 – 616** | 558 – 626 |
| barra dos verbos | 616 – 656 | 653 – 680 |
| **linha do veredito (a âncora)** | **664 – 716** | **744 – 796** |

- **No monitor está perfeito.** `Etapa=Direta` mede 118 px: `744 − 118 = 626`,
  que é **exactamente** a aresta de baixo da tira do herói. Não tapa um pixel.
- **No telefone parte.** `664 − 118 = 546`, e a tira do herói vai de 493 a 616:
  **o cartão tapa 70 px dela — 57 % da tira**. E o que fica debaixo do cartão é,
  medido: o rótulo `PM (MANA)` (540–557), **a barra de PM inteira** (561–571) e
  a fila da data + XP (579–616). A barra de PV (522–532) sobrevive.

> **O cartão tapa exactamente a barra de PM — no segundo em que pede ao jogador
> que decida gastar PM.** *Mostrar o preço e esconder a bolsa é meio veredito.*

`escudo_arcano` custa 2 PM e `contramagia` 3; são as duas reações em que o
saldo decide. Na resolução o cartão encolhe para 56 px (`664 − 56 = 608`) e a
colisão quase desaparece — **ela existe só durante a pergunta**, que é o pior
momento possível para existir.

O conserto barato é composição e não mexe no fluxo: **o cartão diz o saldo, não
só o preço.** Mas a fenda do preço tem 40 caracteres de orçamento (K1) e
`escudo arcano · 2 PM (tem 18) — corta 60%` não cabe. **Logo é peça, e peça é
do `desenho`** — pedida em §6.

---

## 5 · o que o jogador perde se K3 sair como está desenhado

### 5.1 · a janela é aditiva, e vem ANTES da espera que já existe

Fui ver onde a rodada mora no tempo, e a resposta é dura:

> `fecharMeuTurno(...)` → `resolverRevide(...)` — **onde a reação vive** — corre
> **síncrono**, e só **depois** é que `enviar(...)` dispara a chamada ao Mestre
> (`App.jsx:11969` contra `:11971`). **A janela não preenche uma espera: ela
> soma-se à frente dela.**

E a espera que já existe, medida na minha sessão (`PerformanceResourceTiming`,
10 chamadas a `/api/narrador`):

| | ms |
|---|---|
| as dez chamadas | 1 645 · 1 685 · 1 749 · 1 971 · 2 069 · 2 674 · **9 380 · 12 282 · 14 437 · 24 137** |
| mediana global | **2 674** |
| **mediana das quatro chamadas narrativas** *(as de turno de combate)* | **≈ 13 360** |

**A rodada de combate de hoje custa ~13,4 s de espera morta.** Com K3 ela passa
a custar até **28,4 s** — **+112 % no pior caso**, e o acréscimo vem **primeiro**.

### 5.2 · a conta da luta de cinco rodadas

Janela em **100 %** das rodadas (marcial/furtivo). Espera pelo Mestre:
5 × 13,36 = **66,8 s**.

| quem é o jogador | paradas | tempo parado | sobre a luta |
|---|---|---|---|
| responde depressa — os **4,03 s** que K1 mediu (1,5 s reconhecer + 0,513 s Fitts, dobrados) | **5** | **20,2 s** | **+30 %** |
| ignora tudo — a escada cala à 2.ª | **2** | **33,2 s** (`msEntreRespostas`) | **+50 %** nas duas primeiras rodadas, **0 %** nas três seguintes |
| hesita até ao fim, mas responde ao último instante *(nunca expira duas seguidas, nunca é calado)* | **5** | **75,0 s** | **+112 %** |
| `[APARAR SEMPRE]` ou `[DEIXAR PASSAR]` na ficha | **0** | **0 s** | **0 %** |

### 5.3 · o veredito: tensiona duas rodadas, cansa a partir da terceira

**E eu digo isto sabendo que é a fase que a pessoa aprovou.**

**O que tensiona, e é real:** a primeira janela de uma luta é o melhor momento
que este combate já teve. O golpe chega, o relógio nasce, o preço está escrito,
e pela primeira vez o jogador **faz** alguma coisa no turno do inimigo. A
prova por experiência jogada de K1 continua verdadeira do outro lado: numa
luta inteira eu toquei três controles, com seis reações disponíveis e nada
onde tocar.

**O que cansa, e não é o tempo:** é a **taxa**, e a taxa está medida.

1. **100 % das rodadas têm pergunta** (para sete das doze classes). Não há
   rodada de descanso. Um momento
   que acontece sempre deixa de ser um momento — *e «um pedágio é exactamente
   no que ela se transforma quando é cobrada uma vez por golpe» é a frase com
   que `ritmo-da-reacao.js` justifica a própria existência.* K1b baixou a
   cobrança de por-golpe para por-rodada e ganhou −75 %; o que ninguém contou é
   que o **piso** ficou em uma pergunta por rodada, sempre.
2. **Metade das perguntas é sobre um golpe que errou.** *Revidar · 0 PM* não é
   uma decisão: é um sim com relógio. Ao terceiro, o jogador aprende a carregar
   sem ler — e uma janela que se responde sem ler é um imposto de 1 toque.
3. **63 % do dano chega sem pergunta.** Ele vai aprender que o jogo pergunta
   sobre o golpe pequeno e cala no grande, e vai concluir — **com razão** — que
   a pergunta não é sobre o perigo.
4. **O acréscimo vem antes da espera, não dentro dela.** Se a janela corresse
   ao mesmo tempo que a chamada ao Mestre, custaria zero segundos. Não pode:
   `linhaParaMestre` (`:14081`) lê `a.r` **já cortado**, logo o envelope não
   pode sair antes de a janela fechar. **É estruturalmente aditivo.**

> **O veredito: ao terceiro combate a janela já é um gesto, não um momento** —
> que é exactamente a pergunta que K1b deixou em aberto, e agora tem número:
> **uma pergunta por rodada, metade delas sobre nada.** Não é o tamanho da
> janela que cansa. É a frequência dela, e o facto de quase metade das vezes
> ela perguntar a coisa errada.

**Isto não bloqueia K3.** K3 constrói o que foi aprovado, e K4 existe para
medir. Mas K4 já sabe o que vai encontrar, e está escrito aqui antes de a
pessoa o descobrir a jogar.

---

## 6 · para a pessoa decidir, e as peças que faltam

### 6.1 · a proposta ambiciosa — **a janela não abre num erro do inimigo**

**Corta 45–50 % das perguntas e põe todas as restantes no momento que dói.** É
o argumento com que K1 matou `inimigo_cai`, aplicado ao irmão gémeo dela.

**O que se perde, dito por mim:** o jogador deixa de poder **recusar** o
contra-ataque — e recusar compra alguma coisa de verdade (`reacaoUsadaRef`
fica livre para o golpe seguinte). É a pergunta 1 de K1 §6b, e ela continua
sem resposta escrita.

**E há um obstáculo que eu não posso remover: a trava de K2 proíbe isto.** A
asserção 05 exige `abre.ordem <= ordemDaReacaoDeHoje`. Se a janela saltar o
erro do golpe 0 e abrir no acerto do golpe 1, a replicação de [R1] começa em 1,
**o contra-ataque do golpe 0 deixa de acontecer**, e isso é regressão medida —
não estilo. *A ordem da pergunta está soldada à ordem dos golpes, e foi a trava
que a soldou.* **Vai à pessoa** porque muda mecânica e porque contradiz uma
asserção que ela já aprovou.

**A variante mais forte e com o mesmo obstáculo:** *a janela abre no MAIOR
golpe da rodada*, não no primeiro que qualifica. Sobe de **36,09 % para 100 %**
a fracção de perguntas feitas sobre o golpe que mais dói. Mesma asserção 05,
mesmo bloqueio.

### 6.2 · a proposta barata, e esta não parte nada

**Escrever no campo de texto fecha a janela.** Quem começou a escrever prosa já
decidiu não reagir; hoje, por K2 §3.2(c), a janela fica aberta a contar 15 s à
frente dele. Fechá-la ao primeiro caractere **devolve até 15 s por rodada** a
quem joga a escrever — e é **de graça pela trava**, porque `[T2]` já garante
que o resultado não depende do instante em que o temporizador dispara: fechar
mais cedo dá **exactamente** o mesmo resultado. Não rouba foco, não muda
mecânica, não toca em nenhuma tabela de tempo. É fluxo, então fica à mesa.

### 6.3 · as peças que faltam, nomeadas

| # | o que falta | de quem é |
|---|---|---|
| 1 | **A quinta saída: `respondeu e falhou`.** `esquiva_agil` (0,6) e `contra_ataque` (0,55) podem falhar, `PALAVRAS_DA_CHANCE` escreve o risco na fenda do preço (*«mais vezes que não»*) — e **`resolverReacao` não tem ramo de falha: ela corta sempre.** Se K3 a chamar directamente, o ladino que responde esquiva **100 %** das vezes e a frase do preço mente; se K3 rolar a `chance`, precisa de um ramo que não existe. **K2 [R4] avisou e não pagou** (*«mover o rolo muda o mundo de quem responde, e esse mundo não está travado por nada»*). **Este é o buraco maior da fase.** | **`backend`** |
| 2 | **O que `recusou` recusa — a pergunta ou o recurso?** Não está escrito em lado nenhum. A minha decisão de desenho é *os dois* (§1.5); a regra é de quem faz regras. | **`backend`** |
| 3 | **O `oportunidade` automático consome a reação da rodada?** Pergunta 1 de K1 §6b, três etapas por responder. Dela depende o preço que o recuo pode escrever. | **`backend`** |
| 4 | **O cartão tem de dizer o saldo de PM, não só o preço** — porque no telefone ele tapa a barra de PM (§4.4, medido). A fenda tem 40 caracteres e não cabe. | **`desenho`** |
| 5 | **A largura do cartão no monitor.** A composição é de 375; a região mede **1 400 px** a 1 536 (§4.3). Nenhuma peça diz o que o cartão faz com 1 400 px — e a regra do trilho (*mede a largura da janela*) transforma essa indefinição num relógio de 1 400 px se ninguém a fechar. | **`desenho`** |

**As palavras da quinta saída ficam escritas, à espera da mecânica** — porque
palavras são minhas mesmo quando a regra não existe:

| reação | `respondeu e falhou` |
|---|---|
| Esquiva Ágil | `você tentou sair, e não deu` |
| Contra-ataque | `você revidou e não alcançou` |

*(Mesma gramática: começa por `você`. O glifo **fica** — houve gesto; o que
falhou foi o resultado, e essa é exactamente a distinção que a regra do glifo
faz.)*

---

## o que ficou feio, e o que eu não soube

**Feio, e assumo:**

- **Perdi o save de `Uma Noite` do utilizador.** Fiz cópia dentro do próprio
  `localStorage`, joguei, restaurei — **e restaurei com o jogo ainda montado**.
  O autosave escreveu por cima antes do reload, e a chave de recuperação já
  tinha sido apagada. É a armadilha que o `CLAUDE.md` nomeia por extenso
  (*«injete só com o jogo desmontado, e restaure idem»*), eu li-a antes de
  começar, e caí nela na única operação em que ela importava. **A campanha
  (`taverna_save_v1`, 139 481 bytes) está intacta, byte a byte** — o espaço de
  save por modo funcionou exactamente como foi desenhado, e foi ele que salvou
  o que importava.
- **K1 §7 e K2 §5 contradizem-se sobre a linha de log do `recusou`**, e eu
  decidi contra o bloco que é meu (§1.5). Documentei a contradição em vez de a
  ter apanhado em K1.

**Não soube:**

- **Não joguei uma luta de quatro inimigos.** O Torneio é sempre 1v1 e o
  Capítulo exigiria jogar a história até um encontro. Os números de 2, 4 e 12
  golpes são de **varredura em Node sobre o motor real**, não de luta jogada —
  e eu digo a diferença em vez de a esconder. A rodada que vi é uma, e é a de
  §4.1.
- **Não medi a janela a correr, porque ela não existe.** O que medi foi a
  rodada sem ela e a espera que ela vai somar. O «cansa × tensiona» de §5.3 é
  uma projecção com números reais em cima, não uma experiência jogada — e a
  diferença entre as duas coisas é exactamente o que K4 existe para pagar.
- **Não sei a que ritmo a fadiga chega.** Digo «ao terceiro combate» porque é o
  que a taxa de 100 % sugere, mas o número é meu e não está medido. É a quarta
  etapa seguida em que esta dívida passa adiante.
- **Não sei o que o cartão faz com 1 400 px**, e não é minha para decidir: a
  peça é do `desenho`. Medi a região e escrevi o número; a forma é dele.
