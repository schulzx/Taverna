# K2 · a trava, antes de tudo — o bloco do `jogo`

*Para fundir em `mente/formas.md` (§ `reagir ao golpe que chega`). **Nenhum
arquivo do projeto foi tocado** — nem `.js`, nem `.jsx`, nem `.mjs`, nem a
pauta, nem o diário, nem `agora.json`. Este documento é o produto inteiro.*

*Os números desta página são **corridos**, não estimados: dois scripts de
medição sobre os módulos de hoje (`src/reacoes.js`, `src/ritmo-da-reacao.js`),
20 000 sementes por caso, no scratchpad da sessão. As linhas que os geram estão
transcritas em §2 para que a pessoa os possa refazer.*

---

## O contrato, numa frase

> **Quando o jogador não responde, K3 tem de chamar `escolherReacao`
> exactamente as mesmas vezes, com os mesmos argumentos, na mesma ordem, e
> deixar os mesmos efeitos nos mesmos sítios, que o laço de
> `App.jsx:13972-13982` deixa hoje — incluindo o número de rolos de
> `Math.random` que isso consome.**

Não é *"o resultado parece o mesmo"*. É *"o fluxo de dados não desalinha"* —
porque num sistema sem servidor o fluxo de dados **é** o resultado, de todo o
resto da partida em diante.

E o achado desta etapa é que **o desenho óbvio de K3 quebra esse contrato em
37 a 41 % das sementes**, sem uma linha de código mal escrita, sem ninguém
mexer numa regra, e sem nada aparecer na tela.

---

## 1 · o que exactamente é "o resultado"

Uma rodada de reação de hoje nasce em `tentarReacaoNoGolpe`
(`src/App.jsx:7664`), chamada de dentro do laço da rodada em `:13981`. Fui
enumerar tudo o que ela deixa atrás de si, e onde.

### Load-bearing — cada linha é uma asserção

| # | o efeito | onde, hoje | por que é load-bearing |
|---|---|---|---|
| 1 | **a reação escolhida** (`esc`) | `reacoes.js:85` ← `App.jsx:7667` | é a raiz de todos os outros |
| 2 | **em QUE golpe ela cai** | o laço `App.jsx:13972-13982` | **o achado da etapa** — 37-41 % de divergência medida (§2) |
| 3 | **`reacaoUsadaRef.current = true`** | `App.jsx:7671` | o recurso da rodada; zerado em `:14378` |
| 4 | **o PM debitado** — `pmReacaoRef += res.pm` | `:7672`, e sai da ficha em `:14126` | sai **no fim da rodada**, de `persTracos.mana`, não no instante da reação |
| 5 | **o dano final** — `a.r.dano = rc.danoFinal` | `:13982` | é o que vira PV; tudo o que vem a seguir lê o número já cortado |
| 6 | **o texto do log** (`res.texto`) | `pushMsgs` em `:7673` | é a linha byte a byte que K1 §7 prometeu não tocar |
| 7 | **a POSIÇÃO dessa linha no chat** | `:7673` contra `:14083` | ver a nota feia abaixo — **é load-bearing e é feio** |
| 8 | **a nota ao Narrador** (`res.nota`) | `notaRef.current` em `:7674` | é o canal por turno; o teto de prompt proíbe a alternativa |
| 9 | **a ORDEM das notas dentro de `notaRef`** | concatenação em `:7674` | o prompt é texto; trocar a ordem troca o prompt |
| 10 | **o contra-ataque inteiro** — `resolverAtaque`, o PV do inimigo, `setCombate`, a sua linha (`:7695`) e a sua nota (`:7696`) | `:7677-7697` | rola dados próprios e muda o campo |
| 11 | **o envelope do Mestre** — `partes.push(linhaParaMestre(...))` | `:14081` | lê `a.r` **já cortado** |
| 12 | **`golpeRecenteRef`** | `:14087` | lê `danoNoJogador` já cortado — é o que o gasto *Aguentar* consome |
| 13 | **a cadeia de amortecimento** — `amortecerDano` (`:13990`), `repartirDano` (`:14004`), `passarPeloAbrigo` (`:14017`) | | todas recebem o dano já cortado, e todas podem gastar a ficha |
| 14 | **o teste de concentração** | `:14105` → `combate.js:848` | **rola um `d(20)`** e está fechado por `danoNoJogador > 0` (`:14090`) |
| 15 | **as aflições dos golpes** | `:14172` → `:7702` | filtra `x.r.dano > 0`; **rola** por golpe sobrevivente |
| 16 | **a posição de tudo o resto no fluxo de `Math.random`** | global | §2 — é o coração |

**Os dois últimos são o que torna o contrato caro.** Uma Esquiva Ágil corta
`1` — zera o golpe. Zerar o golpe **apaga** o teste de concentração (#14) e
**apaga** a aflição daquele golpe (#15). Cada um deles é um rolo que existe ou
não existe. **O efeito da reação não fica dentro da reação: ele muda quantos
dados a rodada inteira rola.**

### Ruído — o que a trava **não** deve comparar

- **A prosa do cartão** (`Etapa=Resolvida`). K1 §7 já fixou a fronteira e ela
  continua certa: *o LOG fica byte a byte, o CARTÃO é a superfície nova.* Se a
  trava comparasse prosa, ela partiria no primeiro ajuste de texto e ninguém a
  arranjaria — a catraca que grita por tudo deixa de ser lida.
- **As linhas de `mostrarRolagens`** (`:13974`, `:14107`). São bastidor, vêm
  desligadas, e não mudam com a reação.
- **O instante de relógio** em que a linha aparece. §3, frente 3: o relógio não
  é parâmetro de nada.
- **O contador de expirações da escada.** Ele gate**ia** janelas futuras; não
  entra no resultado desta rodada. E a prova disso não é uma asserção, é uma
  assinatura — ver §4.

### A nota feia, e ela é minha obrigação dizer

**Hoje a linha da reação aparece no chat ANTES de todas as linhas de ataque da
rodada.** `tentarReacaoNoGolpe` chama `pushMsgs` imediatamente (`:7673`);
`linhasSis` — que carrega *"🛡 Ogro → você: 9 de dano"* e tudo o mais — só é
despejada depois do laço fechar, em `:14083`. O jogador lê **"⚔ REAÇÃO —
Aparar: 4 de dano evitado (9 → 5)"** e só a seguir lê o golpe que a causou.

É um defeito de leitura, e é antigo. **Mas é o jogo de hoje, byte a byte, e
K2 não é a etapa que o conserta.** A regra:

> **A ordem é load-bearing. Consertá-la é uma mudança de experiência, vai à
> pessoa, e nunca entra de contrabando dentro de K3.**

Se K3 tornar a rodada assíncrona sem cuidado, esta ordem inverte-se **sozinha**
— basta a janela suspender o laço depois de `linhasSis` ter sido despejada. É o
tipo de regressão que passa em todas as suítes e que nenhum programador
consegue depois explicar. Por isso ela é a asserção 07.

---

## 2 · o problema dos dados — medido, e a regra que sai dele

### A medição

Instalei um mulberry32 semeado no lugar de `Math.random`, com um contador por
cima, e corri a **mesma semente** por dois mundos: o laço de hoje
(`App.jsx:13972-13982` + `:7664`) e dois desenhos possíveis de K3.

- **Desenho A — *a expiração resolve o golpe da janela*.** É o desenho óbvio, e
  é o que a palavra «cobertos» de K1b sugere a quem ler depressa: a janela abre
  no golpe 0, expira, o sistema faz o de hoje **naquele golpe**, e os cobertos
  ficam cobertos.
- **Desenho B — *a expiração devolve a rodada ao motor de hoje*.** A janela
  abre no golpe 0, expira, e o laço de hoje corre a partir dali, por todos os
  golpes, exactamente como corre hoje.

**10 000 sementes por caso. Os números corridos:**

| caso | rolos/rodada hoje | A | B | sementes com **contagem de rolos** diferente | sementes com **resultado** diferente |
|---|---|---|---|---|---|
| guerreiro · 4 golpes *(aparar, sem `chance`)* | **0,000** | 0,000 | 0,000 | A **0,00 %** · B 0,00 % | A **0,00 %** · B 0,00 % |
| **ladino · 4 golpes** *(esquiva ágil, `chance` 0,6)* | **1,619** | 1,000 | 1,619 | **A 39,84 %** · B **0,00 %** | **A 37,44 %** · B **0,00 %** |
| mago · 4 golpes *(escudo arcano, sem `chance`)* | 0,000 | 0,000 | 0,000 | 0,00 % | 0,00 % |
| guerreiro · 12 golpes *(quatro lendários)* | 0,000 | 0,000 | 0,000 | 0,00 % | 0,00 % |
| ladino · 12 golpes | 1,657 | 1,000 | 1,657 | **A 39,84 %** · B 0,00 % | **A 39,83 %** · B 0,00 % |
| **guerreiro · 4 ERROS** *(contra-ataque, `chance` 0,55)* | **1,730** | 1,000 | 1,730 | **A 44,39 %** · B 0,00 % | **A 40,83 %** · B 0,00 % |
| ladino · 2 arranhões + 4 golpes | 1,619 | 1,000 | 1,619 | A 39,84 % · B 0,00 % | A 37,44 % · B 0,00 % |

E, para responder à pergunta pelas palavras em que ela foi feita:
**`ritmoDaRodada` sozinha, 12 golpes, ladino (a esquiva TEM `chance`): 0 rolos.**
A asserção 17 de K1b é verdadeira, e foi confirmada de novo aqui.

### Por que é que A perde 39,8 % — e é a coisa mais importante desta página

**K1b escreveu uma frase que é quase verdadeira, e o «quase» custa 39,8 %:**

> *"hoje a reação cai no primeiro golpe que qualifica (`App.jsx:13894`, o laço
> pára na primeira chamada que devolve algo)"*

O laço pára na primeira chamada que **devolve algo** — não no primeiro golpe
que **qualifica**. Para o Aparar e o Escudo Arcano (sem `chance`) são a mesma
coisa. Para a **Esquiva Ágil** (`chance: 0,6`) e o **Contra-ataque**
(`chance: 0,55`) **não são**: `reacoes.js:96` rola, e quando o rolo falha
`escolherReacao` devolve `null` e o laço **tenta o golpe seguinte**. E o
seguinte. E o seguinte.

Logo, **o motor de hoje repete a aposta até acertar, uma vez por golpe** — e
isso não é um pormenor, é onde vive o valor da reação do furtivo:

| a distribuição de hoje · ladino, 4 golpes | |
|---|---|
| esquiva no golpe 0 | **60,2 %** |
| esquiva no golpe 1 | 24,1 % |
| esquiva no golpe 2 | 9,5 % |
| esquiva no golpe 3 | 3,9 % |
| **nenhuma esquiva na rodada** | **2,4 %** |

**Hoje o ladino esquiva em 97,6 % das rodadas de quatro golpes.** O desenho A
entrega-lhe **60,2 %** — a `chance` nua do catálogo. O contra-atacante cai de
**96,4 %** para **55,6 %**.

### E o que isso custa em PV, que é a moeda que o jogador sente

20 000 sementes, rodada de quatro golpes de 20 de dano:

| | dano sofrido por rodada | contra hoje |
|---|---|---|
| **ladino** · hoje | **60,480** | — |
| ladino · **desenho A** | **67,909** | **+12,28 %** |
| ladino · desenho B | 60,480 | **0,00 %** |
| guerreiro · hoje / A / B | 70,000 / 70,000 / 70,000 | 0,00 % |

> **O desenho óbvio de K3 tira 12,3 % de sobrevivência ao furtivo, em silêncio,
> numa etapa cuja lei de entrada é «regressão zero».** Ninguém teria visto: o
> guerreiro — a ficha com que toda a suíte de K1b foi escrita — não move um
> ponto.

### A defesa, dita como regra e não como cuidado

Três regras, e as três são verificáveis:

> **[R1] «Coberto» quer dizer *não gera segunda pergunta*, nunca *não gera
> reação*.** Os golpes cobertos continuam a ir ao motor de hoje quando a janela
> se fecha sem resposta. A janela agrupa a **pergunta**; ela não agrupa a
> **mecânica**.

> **[R2] K3 não pode chamar `escolherReacao` menos vezes, nem mais vezes, nem
> noutra ordem, do que o laço de hoje chamaria — quando ninguém responde.** É a
> forma operacional do contrato, e é a que uma suíte consegue contar.

> **[R3] A janela não rola nada, e a resolução do silêncio rola exactamente o
> que hoje se rolaria.** `ofertaDoGolpe` (`ritmo-da-reacao.js:133`) já é livre
> de dado por construção, e tem de continuar. O rolo mora na **resolução**,
> onde já mora hoje.

**E há uma quarta, que é a dívida de K1 §6b e que eu recomendo NÃO pagar em
K3.** `reacoes.js:96` rola a `chance` **antes de oferecer**. A pauta de K3 já
manda extrair `reacoesQueSeAplicam(...)` — os mesmos filtros **sem** o
`Math.random()` — e isso é bom e é regressão zero *no número de rolos*. Mas
**mover o rolo da oferta para a resolução muda o mundo de quem responde**, e
esse mundo não está travado por nada. Então:

> **[R4] A extracção de `reacoesQueSeAplicam` é regressão zero apenas enquanto
> `escolherReacao` continuar a rolar a `chance` na mesma posição da sequência —
> isto é, *a primeira da lista que sobrevive ao seu rolo*, um rolo por
> candidata testada, na ordem de `REACOES`.** Isto é conferível lendo o diff, e
> é a asserção 12: a varredura de sementes tem de dar **o mesmo número de
> rolos** antes e depois da extracção.

---

## 3 · as três frentes, uma a uma

### 3.1 · quem ignora o botão — a janela expira

**No instante da expiração, e por esta ordem:**

1. **Fecha-se o portão de uma via** (§3.3). Se ele já estava fechado, **nada
   acontece e nenhum dado é rolado**.
2. Corre-se **o laço de hoje a partir do golpe da janela**, por todos os
   cobertos — regra [R1].
3. O que sair dali entra nos dezasseis sítios da tabela de §1, nos mesmos
   sítios, com os mesmos valores, na mesma ordem. **`escolherReacao` recebe
   `persBase`** — a ficha do início da rodada, que é o que `:13981` lhe passa
   hoje —, **nunca `persTracos`**, que já tem a Pele de Pedra gasta e o PM
   noutro número.
4. Só depois disso é que o cartão escreve a sua linha de `Etapa=Resolvida`, e
   ela é **a única coisa nova** que a expiração produz.

**Uma consequência de desenho que cai de [R1] e que eu tenho de assumir:** a
reação pode acabar por cair num golpe **que não é o do cartão**. O cartão
perguntou sobre o Ogro do golpe 0 e o instinto esquivou o Bandido do golpe 2 —
39,8 % das vezes, para o furtivo. Então:

> **A linha de `Etapa=Resolvida` lê o resultado, não a pergunta.** O nome do
> inimigo e os números saem do golpe em que a reação **de facto** caiu. Um
> cartão que dissesse *"o instinto aparou o Ogro"* quando aparou o Bandido
> seria a interface a mentir sobre a mecânica — que é o defeito que esta fase
> inteira existe para não cometer.

**A primeira expiração de uma luta muda alguma coisa no resultado?**
**Tem de não mudar, e a prova é estrutural, não uma asserção.** O contador
`expiracoesSeguidas` **não é um parâmetro da função que resolve o silêncio**
(§4). Ele entra em `ritmoDaRodada`, que decide **se a janela abre**; não entra
em `reacaoDoSilencio`, que decide **o que acontece**. Duas funções, dois
assuntos, e o contador não tem por onde tocar no resultado.

A segunda expiração seguida acende o silêncio, e aí a janela **não abre de
todo**. Nesse caso a rodada tem de resolver-se **pela mesma função** —
asserção 06: as duas estradas (a janela que expirou e a janela que nunca
abriu) devolvem resultados idênticos, byte a byte, incluindo o número de rolos.
*Duas estradas para o mesmo sítio só chegam ao mesmo sítio enquanto alguém as
comparar.*

### 3.2 · quem joga sem mouse

**Hoje, sem janela nenhuma, o jogador de teclado e o de rato têm exactamente o
mesmo resultado — porque nenhum dos dois toca em nada.** K3 pode partir isso de
três maneiras, e as três têm defesa escrita.

**(a) O teclado chegar tarde, e o relógio cobrar-lho.**
A garantia já está decidida e é estrutural: **o relógio morre no primeiro
input, seja ele qual for.** K1b apagou a coluna `leque` de `RITMOS_DA_REACAO`
justamente por isto, e `Escolhendo` só existe em `Tempo=Parado` na peça. Logo
as teclas a mais que o teclado gasta a navegar o leque **custam zero tempo**.
A catraca é uma catraca de forma da tabela — asserção 09:

> **Nenhuma linha de `RITMO_DA_REACAO` pode ganhar uma segunda duração.** As
> chaves de tempo são `janela`, `folga`, `trilho`, `aperto`, `bonusContagem`,
> `bonusToque`, e `folga + trilho === janela`. Uma chave nova de tempo quebra a
> suíte. *A coluna `leque` morreu em K1b; esta asserção é o que impede que ela
> volte com outro nome.*

**(b) O teclado precisar de mais toques para o mesmo desfecho.**
É lei da casa (*o jogador faz menos para conseguir o mesmo — contado, não
sentido*) e é WCAG 2.1.1. Vira tabela, porque é número:

```js
export const ATALHOS_DA_JANELA = [
  { id: "aceitar", tecla: "Enter",  ponteiro: 1, teclado: 1 },  // o verbo Armado
  { id: "recusar", tecla: "Escape", ponteiro: 1, teclado: 1 },  // o recuo
  { id: "escolher", tecla: "ArrowDown/ArrowUp + Enter", ponteiro: 1, teclado: 2 },
];
```

Asserção 10: **`teclado <= ponteiro + 1` em toda linha, e `=== ponteiro` nas
duas que existem no caso comum** (`Etapa=Direta` só tem *aceitar* e *recusar*).
O único desfecho que custa uma tecla a mais é escolher **um segundo verbo** do
leque — e o leque não expira, logo a tecla a mais não é paga em tempo. *A
paridade que interessa não é de gestos: é de resultado sob relógio.*

**(c) A janela roubar o foco, e é esta a armadilha de verdade.**
O jogador de teclado está a escrever prosa no campo de chat quando o golpe cai.
Se a janela lhe roubar o foco, o `a` da palavra que ele estava a escrever vira
*aparar*. Se não lho roubar, o `Enter` dele vai para o chat e a janela expira.
A decisão, e é minha:

> **A janela NUNCA rouba o foco.** `Enter` e `Escape` são atalhos globais
> **fechados sobre «o campo de texto não tem o foco»**; com o campo focado a
> janela existe, mostra-se, e expira. Quem estava a escrever recebe **o jogo de
> hoje**, que é exactamente o que esta etapa promete — e ninguém tem a sua
> frase roubada por um cartão que apareceu.

*Roubar o foco resolveria a ergonomia de um jogador e partiria a de outro. A
expiração não é um castigo: é a trava a funcionar.*

**E a conformidade WCAG 2.2.1 tem de ser alcançável sem ponteiro.** A fila de
quatro pílulas da ficha é a saída da fase inteira (K1 §2); se ela só se
alcançar com o rato, a saída não existe para quem mais precisa dela. **Isso é
DOM e não se prova em Node** — ver §4 e o «não soube». O que se prova em Node é
que **as quatro pílulas têm as quatro estradas**, asserção 11: para cada uma
das quatro preferências, `ritmoDaRodada` devolve uma resposta bem formada, e
nenhuma pílula fica sem efeito. *É a lei do export morto aplicada à
conformidade: uma opção de acessibilidade que não chega a lado nenhum é pior do
que não a ter, porque parece que se cumpriu.*

### 3.3 · a aba lenta — e a corrida que mata

A prática conhecida, e a pessoa nomeou-a: em aba de fundo o navegador limita
`setTimeout` a ~1 Hz; depois de alguns minutos escondida a limitação aperta
para ~1/min; sob congelamento ou economia de energia o temporizador pode **não
disparar nunca**. **Uma janela de 15 s pode disparar aos 15 s, aos 40 s, ou
nunca.**

**O que isso faz ao turno:** a rodada de hoje é um laço **síncrono**. K3 tem de
a suspender. Se o temporizador é a única saída, uma aba escondida deixa a
rodada **suspensa para sempre** — e isso é a violação mais cara que este
projecto tem, porque *nunca pode custar o turno* não é uma lei de conforto, é
a lei que impede o jogo de morrer no meio de uma luta.

**Três regras, e a primeira é a que resolve tudo:**

> **[T1] A aba escondida não abre janela nenhuma.** Não é *"o relógio não
> corre"* (K1 §1) — é **a janela nasce já fechada**, resolve-se como hoje **na
> hora**, e a rodada segue sem esperar por ninguém. Porta nova,
> **`escondida`**, a nona de `PORTAS_DA_JANELA`. E ela **não alimenta a
> escada**: uma expiração que o jogador nunca viu não é uma expiração dele.
>
> *Isto não custa nada a ninguém: quem está noutro separador recebe o jogo de
> hoje, que é por definição o que esta trava promete. E paga a lei do turno
> pela porta da frente, em vez de a pagar com um teto de socorro.*

> **[T2] O atraso do relógio não pode mudar o resultado — e a prova é que o
> relógio não é um parâmetro da resolução.** `reacaoDoSilencio(...)` **não
> recebe tempo nenhum**: nem `agora`, nem `decorridoMs`, nem `Date.now`, nem
> `performance.now`. Um temporizador que dispara aos 40 000 ms produz
> exactamente o mesmo resultado que um que dispara aos 15 000, porque a
> diferença entre os dois não tem por onde entrar na conta. **Asserção 13:
> a assinatura não tem parâmetro de tempo, e a suíte lê a assinatura.**
>
> *É a mesma forma de argumento da porta 10 de K1b — «a janela durar mais
> quando o golpe é maior faria o relógio SER o dano». Aqui: um resultado que
> dependesse do instante faria o navegador ser o Mestre.*

> **[T3] A corrida resolve-se com um portão de uma via, e o segundo a chegar
> não rola um dado sequer.** É a corrida que mata: o temporizador dispara
> **depois** de o jogador já ter respondido, e a rodada resolve-se duas vezes —
> duas reações, dois débitos de PM, duas linhas no log, e o dano cortado a
> dobrar. Ou o inverso: o clique aterra num cartão que já morreu.

A peça, e é pura:

```js
/* Um portão de UMA VIA. Estado é substituído, nunca mutado. */
export function fecharAJanela(janela, quem) {   // quem: "jogador"|"expirou"|"escondida"|"aba_fechou"
  if (!janela || janela.fechada) return { janela: janela || null, valeu: false, por: (janela || {}).por || null };
  return { janela: { ...janela, fechada: true, por: quem }, valeu: true, por: quem };
}
```

**A regra de uso, e é ela que K3 tem de obedecer:** *nenhuma resolução acontece
fora do ramo `valeu === true`.* O rolo vive **dentro** desse ramo. Um segundo
chamador recebe `valeu: false` e **não entra**, logo não rola — e é isso que
impede que a corrida desalinhe o fluxo de dados mesmo quando o seu resultado é
deitado fora. **Asserção 14: fechar duas vezes, em qualquer das duas ordens,
com `Math.random` substituído por uma função que estoura no segundo ramo.**

*Um resultado deitado fora que rolou um dado é pior do que um resultado
errado: o erro aparece, e o desalinhamento não.*

---

## 4 · onde a prova mora — e concordo consigo, com uma correcção

**Concordo, inteiramente: a trava não pode ser só suíte.** Uma suíte prova que
*aquele* caminho está certo hoje; ela não impede que K3 escreva um segundo
caminho ao lado dela. E o desenho A de §2 é exactamente isso — um segundo
caminho, plausível, que passaria em 85 das 85 asserções que já existem, porque
todas elas usam o **guerreiro**, e o guerreiro não rola nada.

> **A trava é uma função pura que toda fiação de K3 é obrigada a atravessar.
> Com suíte por cima, não em vez.**

**A correcção é onde ela mora.** A minha inclinação seria um módulo novo, e
está errada por uma razão da casa: `src/ritmo-da-reacao.js` **já está na lista
de espera de `teste-ligacao.mjs`**, com o credor escrito (*o `oficial`, em
K3*). Um segundo módulo órfão seria uma segunda dívida no mesmo assunto, e a
lista tem de ficar vazia no dia de K3, não meio vazia.

**A proposta:**

| | |
|---|---|
| **o módulo** | **`src/ritmo-da-reacao.js`** — o que já existe, com duas exportações novas |
| **a suíte** | **`testes/teste-trava-da-reacao.mjs`** — dedicada, separada, e é ela que corre as sementes |

**Por que as exportações vão para o módulo do ritmo e não para um novo:** o
módulo chama-se *o ritmo da reação — quem é perguntado, e quanto isso custa*.
**Quem NÃO é perguntado é o mesmo assunto, e é a metade que faltava.** O
`ritmoDaRodada` diz *se* a janela abre; o `reacaoDoSilencio` diz o que acontece
quando ela não abre, ou abre e ninguém responde. Separá-los em dois arquivos
seria separar a pergunta da resposta.

**Por que a SUÍTE é separada:** `teste-ritmo-da-reacao.mjs` prova o relógio, as
portas e o segredo do dano. Esta prova outra coisa — **a paridade com o motor
de hoje, sobre sementes**. É lenta (dezenas de milhares de corridas), é a única
que instala um PRNG no lugar de `Math.random`, e é a que quem mexer em `reacoes.js`
tem de ver vermelha pelo nome.

### As duas exportações

```js
/* Puro DADO O ROLADOR. `rolar` entra por parâmetro para que a suíte o possa
   semear — é a diferença entre determinismo declarado e determinismo provado.
   NENHUM parâmetro de tempo, e é de propósito (T2).
   NENHUM parâmetro de escada, e é de propósito (§3.1). */
export function reacaoDoSilencio({ golpes, heroi, desde = 0, rolar = Math.random }) {
  /* Corre o laço de HOJE a partir de `desde`, por todos os golpes, e devolve
     a reação, o golpe em que caiu, e quantos rolos isso consumiu.
     NÃO reimplementa `escolherReacao` — chama-a. Regra duplicada é a pior
     das dívidas: parte em silêncio no dia em que uma das cópias muda. */
  return { reacao, ordem, rolos };
}

export function fecharAJanela(janela, quem) { /* §3.3 */ }
```

### Por que a prova tem de ser em Node, e não no navegador

Quatro razões, e a quarta é a que decide:

1. **Só em Node se substitui `Math.random` sem mentir.** A prova inteira de §2
   é *a mesma semente nos dois mundos*; num navegador com HMR, autosave e um
   dev-server a viver por cima, não há «a mesma semente» — há o que sobrou do
   buffer anterior. É a armadilha do `CLAUDE.md` (*HMR mente depois de rename*)
   aplicada à única coisa que não pode mentir.
2. **A prova precisa de 20 000 corridas por caso.** No navegador isso é uma
   tarde; em Node são **3,9 segundos** (medido, os dois scripts juntos).
3. ***Conta se prova, tela se olha.*** A trava é conta. Se ela só se provar com
   uma tela por perto, ela não é uma trava — é uma verificação.
4. **Porque a prova tem de correr ANTES de a peça existir.** É a ordem que a
   pessoa pediu, e uma prova de navegador não pode correr antes de haver
   navegador que mostrar. **A trava é a única coisa desta fase que existe sem
   K3, e ser executável sem K3 é literalmente o requisito.**

### As asserções — `testes/teste-trava-da-reacao.mjs`

| # | a asserção |
|---|---|
| 01 | **A PARIDADE, e é a catraca da etapa.** 10 000 sementes × 5 fichas × {4, 12} golpes: `reacaoDoSilencio` devolve **a mesma reação, no mesmo golpe, com o mesmo número de rolos** que uma reimplementação literal do laço de `App.jsx:13972-13982` escrita dentro do teste. *A reimplementação vive no teste de propósito: é o modelo do mundo de hoje, e ela é que tem de ficar vermelha se o `App` mudar.* |
| 02 | **A FICHA QUE ROLA ESTÁ NA MESA.** A varredura inclui **ladino** (`esquiva_agil`, `chance` 0,6) e **contra-ataque** (`chance` 0,55). A suíte imprime a contagem de rolos por caso e **falha se ela for zero em todos** — *era isto que faltava a K1b: 85 asserções verdes escritas com uma ficha que nunca rola.* |
| 03 | **O DESENHO A ESTÁ ESCRITO COMO ERRO.** O teste **constrói** o desenho A (a expiração resolve só o golpe da janela) e **assere que ele diverge**: 39,84 % dos rolos e 37,44 % dos resultados, ±0,5 pp. *Uma catraca que só sabe dizer «o certo está certo» não protege de nada. Esta sabe reconhecer o erro pelo nome e pelo número, e por isso o erro não pode voltar por distração.* |
| 04 | **+12,28 % de dano ao furtivo** — o número de §2 escrito no teste, com a razão. *Para que o custo não evapore em silêncio no dia em que alguém «simplificar».* |
| 05 | **O golpe da janela nunca vem depois da primeira reação de hoje** — `abre.ordem <= ordemDaReacaoDeHoje`, em toda a varredura. *É o invariante que torna [R1] suficiente: replicar a partir de `abre.ordem` nunca salta um golpe que hoje reagiria.* |
| 06 | **AS DUAS ESTRADAS DO SILÊNCIO CHEGAM AO MESMO SÍTIO** — a janela que expirou e a janela que nunca abriu (porta `silencio`, porta `escondida`) devolvem o mesmo resultado e a mesma contagem de rolos. |
| 07 | **A ORDEM DO LOG** — a linha da reação vem **antes** de toda linha de ataque da rodada. A asserção é sobre a ordem que `reacaoDoSilencio` devolve e sobre a posição em que K3 a tem de despejar; o comentário cita `App.jsx:7673` contra `:14083` e diz que é defeito antigo e deliberadamente preservado. |
| 08 | **A FICHA É `persBase`** — a varredura corre com uma ficha cuja `mana` muda a meio da rodada, e assere que o portão de PM lê o valor **do início**, como `:13981` faz hoje. |
| 09 | **NENHUMA SEGUNDA DURAÇÃO** — as chaves de tempo de `RITMO_DA_REACAO` são as seis acordadas; chave nova quebra. *O `leque` morreu em K1b e não volta com outro nome.* |
| 10 | **A PARIDADE DE TECLADO** — `ATALHOS_DA_JANELA`: `teclado <= ponteiro + 1` em toda linha, e `=== ponteiro` em *aceitar* e *recusar*. |
| 11 | **AS QUATRO PÍLULAS TÊM AS QUATRO ESTRADAS** — cada preferência da ficha produz um desfecho definido, e nenhuma fica sem efeito. |
| 12 | **A EXTRACÇÃO DE `reacoesQueSeAplicam` É CONFERÍVEL** — [R4]: a contagem de rolos por semente, antes e depois de K3 extrair os filtros, tem de ser idêntica. *Enquanto a extracção não existe, a asserção fixa o número de hoje; no dia em que existir, é ela que diz se foi de graça.* |
| 13 | **`reacaoDoSilencio` NÃO TEM PARÂMETRO DE TEMPO** — lida da assinatura, e da fonte: nem `Date`, nem `performance`, nem `setTimeout` aparecem no módulo. **T2, provado.** |
| 14 | **O PORTÃO DE UMA VIA** — fechar duas vezes nas duas ordens; o segundo devolve `valeu: false`; **e nenhum dado é rolado no segundo**, com `Math.random` a estourar. |
| 15 | **A PORTA `escondida` EXISTE, FECHA, E NÃO ALIMENTA A ESCADA** — `expiracoesSeguidas` não sobe, e o resultado é o de hoje. |
| 16 | **A ESCADA NÃO É PARÂMETRO DA RESOLUÇÃO** — `expiracoesSeguidas` 0, 1, 2, 5 dão o **mesmo** resultado de `reacaoDoSilencio`. *A primeira expiração de uma luta não muda nada, e a prova é que não tem por onde.* |
| 17 | **A IMUTABILIDADE** — a lista de golpes, a ficha e as tabelas saem como entraram; `heroi: null`, `golpes: null`, entrada `null` não estouram. |

---

## 5 · as portas que K3 não pode abrir

É o inverso da trava, e é por isto que a suíte existe. **Dezassete, e cada uma
tem o seu guardião na tabela acima.**

| # | o que K3 teria de fazer para partir a trava | quem a guarda |
|---|---|---|
| 1 | **Silenciar os cobertos** — tratá-los como *não reagem* em vez de *não perguntam* | 01, 03, 04, 05 |
| 2 | **Rolar a `chance` para montar a lista** oferecida na janela | o segredo de K1b + 13 |
| 3 | **Rolar duas vezes** — uma para a janela, outra para a resolução | 01 (contagem de rolos) |
| 4 | **Resolver duas vezes** — a corrida temporizador/jogador | 14 |
| 5 | **Rolar na segunda resolução, mesmo deitando o resultado fora** | 14 |
| 6 | **Abrir a janela onde `escolherReacao` hoje devolve `null`** (arranhão, sem PM, `so_magia`) | o §7 de K1b, já verde em 164 casos |
| 7 | **Não abrir onde hoje reagia.** A porta `escondida` é a **única** excepção permitida, e resolve como hoje na hora | 15 |
| 8 | **Mexer no débito de PM** — o valor, ou o instante (`App.jsx:14126`, fim da rodada) | 01, 08 |
| 9 | **Mudar a ordem do log** — a linha da reação antes de `linhasSis` | 07 |
| 10 | **Mudar o texto do log.** As frases novas vivem no cartão, e só lá | K1 §7 |
| 11 | **Mudar a nota ao Narrador, a sua ordem em `notaRef`, ou somar bloco estático ao prompt** | a lei do teto |
| 12 | **Deixar a rodada suspensa** — `await` sem `catch`, sem `calou(...)` (`App.jsx:6607`), sem saída por aba escondida | 15 + a lei do turno |
| 13 | **Contar um degrau da escada numa expiração que o jogador nunca viu** | 15 |
| 14 | **Roubar o foco do campo de texto** | §3.2(c) — e não se prova em Node |
| 15 | **Um segundo relógio** — o leque a expirar, sob qualquer nome | 09 |
| 16 | **Chamar `escolherReacao` com `persTracos`** em vez de `persBase` | 08 |
| 17 | **Cortar `a.r.dano` noutro sítio** que não `App.jsx:13982`, antes de `amortecerDano` | 01 (a cadeia inteira lê o número cortado) |

---

## 6 · para a pessoa decidir

### A proposta ambiciosa — **o combate ganha uma semente, e o Duelo já provou que dá**

**O diagnóstico, com o número.** A primeira lei desta casa diz *determinismo
por semente: mesma semente, mesmo resultado, em qualquer máquina — é o único
árbitro que um sistema sem servidor tem.* **Mas a campanha não tem semente
nenhuma.** São **205 chamadas a `Math.random`** espalhadas por ~50 módulos
(`src/combate.js` sozinho tem 10, `src/reacoes.js` uma, `src/danos.js` uma), e
não existe um fio que as ligue. A lei é uma promessa por pagar, e **K2 é a
primeira etapa que mediu o que ela custa**: 0,619 rolos de diferença por
rodada entre dois desenhos de K3, **37 a 41 % das sementes divergentes**, e
nem o jogador nem a suíte tinham como ver.

**E a casa já sabe fazer isto.** `src/duelo.js` tem **zero** `Math.random`:
`duelar(A, B, { semente })` e `sementeDaSala(codigoSala)` fazem o Duelo
reprodutível de ponta a ponta — foi a decisão de D2/D3, foi entregue há dias, e
funciona. `src/semente.js` já exporta o gerador (`rng(seed)`, `hashSemente`).
**A peça existe; falta ligá-la ao combate.**

**O que fazer, e a ordem que a torna barata:**

1. **`src/dado.js`** — um fio de dados semeado por luta:
   `fioDaLuta({ save, luta, rodada })`, que devolve um `rolar()` determinístico
   a partir de `rng(hashSemente(...))`, que já existe.
2. **O combate passa a receber o rolador por parâmetro**, com
   `rolar = Math.random` por omissão — **exactamente a assinatura que
   `reacaoDoSilencio` já leva nesta etapa** (§4). Nada quebra no dia 1: quem
   não passa o rolador tem o jogo de hoje.
3. **A reação é a primeira**, porque K2 já a precisa e já a mediu. Depois
   `combate.js`, depois o resto — uma função por versão, cada uma com a
   varredura de sementes a provar que a extracção foi de graça.

**Por que isto muda o que o jogador vive, e não é só higiene:**

- **A luta passa a ter um número que a reproduz.** Perdi, e quero perceber
  porquê. Hoje a resposta é *"azar"*; com semente é *"a mesma luta, outra vez,
  igual"* — e a diferença entre as duas frases é a diferença entre um jogo que
  se pode entender e um que se tem de aceitar.
- **O *"eu juro que apareceu diferente"* deixa de ser indecidível.** Um relato
  de erro passa a caber num número.
- **A promessa do Duelo estende-se à campanha.** Hoje o Taverna tem duas
  metades com leis diferentes: o Duelo é auditável e a campanha não. Isso é a
  primeira lei a valer só metade do jogo.
- **E, o que me interessa como `jogo`: toda etapa futura passa a poder PROVAR
  «o depois é igual ao antes» em vez de o declarar.** K2 gastou este ciclo
  inteiro a construir à mão, para uma função, a prova que uma semente daria de
  graça para o motor inteiro. **K3, K4 e a Fase E herdariam-na.**

**O risco, dito por mim.** São 205 chamadas, e tocar nelas todas de uma vez é
exactamente o tipo de mudança que parte o jogo em silêncio. **Por isso a
proposta não é tocá-las todas** — é o rolador por parâmetro, por função, com a
varredura de sementes a assinar cada passo, e com `Math.random` a continuar a
ser o valor por omissão até ao último dia. **Reversível em qualquer ponto.** O
que eu não sei dizer é quantas versões isto leva; sei dizer que a primeira já
está paga, porque é a desta etapa.

**Vai à pessoa** porque mexe no motor inteiro, não numa tela — e porque a
alternativa honesta é apagar a linha do `CLAUDE.md`, que eu não tenho autoridade
para propor.

---

## o que ficou feio, e o que eu não soube

**Feio, e assumo:**

- **Eu escrevi a frase errada em K1b, e ela quase custou 12,3 % de
  sobrevivência ao furtivo.** *"o laço pára na primeira chamada que devolve
  algo"* — e eu tratei isso como sinónimo de *"o primeiro golpe que
  qualifica"*, que é o que escrevi a seguir, na mesma linha. São coisas
  diferentes para duas das seis reações do catálogo. **Só apanhei isto porque
  fui contar rolos com um PRNG na mão; a ler o código eu tinha lido a minha
  própria frase e concordado com ela.** É o mesmo defeito da porta 7 de K1b,
  duas etapas seguidas: **eu vejo o que já escrevi.**
- **As 85 asserções de K1b estão escritas com um `guerreiro`.** É a ficha que
  não rola dado nenhum — foi escolhida de propósito, e o comentário até o diz
  (*"é a ficha limpa para medir o relógio"*). O que ninguém escreveu é que ela
  é, por isso mesmo, **cega para a única classe de defeito que esta fase tem**.
  Uma suíte inteira verde sobre a ficha que não pode falhar.
- **Não propus o conserto da ordem do log**, embora a tenha medido e a ache
  errada. É a coisa certa a não fazer aqui (a trava não pode conter a mudança
  que ela existe para proibir), mas fica a sensação de ter documentado um
  defeito e passado ao lado.
- **A porta `escondida` é mecânica nova a entrar por uma etapa de prova.** Ela
  é do `backend` por natureza; eu escrevo-a aqui porque sem ela a lei do turno
  não fecha, e porque o que ela faz é *não abrir uma janela*, que é a única
  mecânica que uma trava pode acrescentar sem se contradizer. Mas é uma porta a
  mais numa tabela que não é minha.

**Não soube:**

- **Não sei provar o foco de teclado em Node, e é o buraco maior desta
  página.** As três frentes da pessoa são três; eu tranquei duas com estrutura
  (a resolução não recebe tempo; a resolução não recebe a escada) e a terceira —
  *sem mouse* — só com uma tabela de atalhos e uma regra escrita. **Se K3 puser
  o cartão fora da ordem de tabulação, todas as 17 asserções ficam verdes.** A
  única catraca honesta seria uma varredura de DOM, e eu não sei onde ela cabe
  nesta casa.
- **Não medi a aba lenta. Citei a prática, não um número meu.** Os ~1 Hz e o
  ~1/min são conhecimento de manual, e a pessoa trouxe-os antes de mim. O que
  eu fiz foi tornar o número **irrelevante** ([T2]) em vez de o medir — que me
  parece a resposta melhor, mas é uma resposta que evita a medição em vez de a
  fazer.
- **Não sei se as 20 000 sementes chegam.** Escolhi o número por caber em
  4 segundos, não por um intervalo de confiança. Os 37,44 % e os 12,28 %
  estabilizam na terceira casa entre 10 000 e 20 000, o que me basta para uma
  catraca com tolerância de ±0,5 pp — mas não é uma justificação estatística,
  é uma observação.
- **Continuo a não saber quantas janelas abrem por luta.** K1 estimou, K1b não
  contou, e eu também não. **Três etapas, a mesma dívida, e K4 continua a
  devê-la** — agora com uma consequência a mais, porque o número de rolos por
  luta depende dele.
- **Não joguei o depois.** Terceiro ciclo seguido em que a prova por
  experiência jogada não existe. Depois de K3 a pergunta continua a ser a de
  K1b (*ao terceiro combate, a janela ainda é um momento, ou já é um gesto?*),
  e junta-se-lhe esta, que é de K2: **um ladino que joga a fase inteira sem
  responder nota alguma diferença?** A trava diz que não. Só jogar o diz.
