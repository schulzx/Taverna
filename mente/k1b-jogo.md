# K1b · o relógio de 15 s, e o que ele cobra — o bloco do `jogo`

*Para fundir em `mente/formas.md` (§ `reagir ao golpe que chega`, ~788, e
§ `dizer de antemão como o herói se defende`, ~937). Nenhum `.js`, `.jsx` ou
`.mjs` foi tocado; `src/App.jsx` não foi aberto para escrita. Nada commitado.*

*O Figma: página `A batalha` (`30:12`), arquivo `e5wJUzInAssoebx5npssKc`,
**ampliado, nunca duplicado**. Quatro quadros novos — os ids no fim. A peça
`A pergunta que expira` (`31:518`) foi **usada**, nunca alterada.*

---

## As duas decisões da pessoa — registadas, não discutidas

1. **O dano fica em segredo.** *"acho que ficaria melhor o dano vir surpresa e
   aumentar o relógio — daria mais emoção e realmente se compararia a uma
   reação."* A reação passa a ser **instinto, não cálculo**.
2. **A janela sobe de 4 s para 15 s**, *"pra que fique tranquilo até pra
   pessoas com dificuldade"*.

Não se reabrem. O que esta etapa faz é **pagar o preço da segunda** e
**fechar as portas da primeira pelo nome**.

---

## 1 · as duas metades da frase de K1, respondidas juntas

K1 fechou a proposta ambiciosa — *o dano aparece antes de doer* — com esta
frase, e ela é o eixo deste ciclo inteiro:

> *"Se a pessoa disser que não, a Fase K continua a fazer sentido — mas então
> eu diria que o relógio devia ser mais generoso, porque a conta passa a ser
> dele."*

**Ela disse que não E deu o relógio generoso.** As duas metades foram
respondidas na mesma frase dela, e é por isso que esta etapa não é um recuo:
é a segunda metade a ser paga.

**O número medido continua verdadeiro, e deixa de ser usado, de propósito.**
Continua verdade que, sem a conta feita, a lista de um item com ordem fixa é
`escolherReacao` reimplementado à mão. O que mudou é a premissa que sustentava
a conclusão: K1 escreveu *"uma decisão de 4 segundos só se pode tomar sobre
informação já calculada"*. **Em vez de dar a conta, a pessoa deu o tempo de a
fazer.** Quinze segundos é tempo para o jogador contar com o que já vê — o PV
na tira, o PM na tira, quantos inimigos ainda estão de pé, se o chefe vem a
seguir. A pergunta *"vale?"* sobrevive; muda quem a responde e com que dados.

E há um ganho de ficção que eu não teria comprado sozinho, e assino agora:
**um duelista não sabe quanto dói o machado antes de ele chegar.** A janela
com o número era honesta como interface e mentirosa como corpo.

---

## 2 · a conta de K1, reconciliada — o que fica, o que morreu

**Não apaguei a conta antiga.** Ela está aqui inteira, e marcada.

### O que continua verdadeiro

| o que | continua a valer porque |
|---|---|
| **o piso de 4,03 s** — 1,5 s de reconhecer + 0,513 s de Fitts (`W = 56`, a altura do chamado, porque o gesto é vertical), dobrado | é o tempo abaixo do qual quem está a ler prosa perde **sistematicamente**. Continua a ser o número que diz se uma janela é justa. **15 000 / 4 030 = 3,72×**: a folga é medida, não declarada. |
| **quem manda no número é o 1,5 s de reconhecer** | é o único termo que não vem da geometria — vem de estar a ler outra coisa. |
| **`bonusContagem: 1000`** | a razão dele **nunca foi uma percentagem**: uma fixação custa ~250 ms, e custa-os igual numa janela de 4 s ou de 15. *Uma barra lê-se de canto de olho; um numeral exige fixar.* A lei — `prefers-reduced-motion` não pode virar desvantagem de jogo — é sobre a **direcção**, não sobre a grandeza. **O número não muda.** |
| **`bonusToque: 600`** | idem, e pela mesma razão (uma fixação + a diferença de aquisição entre toque e clique). |

**E uma correcção minha a K1, que não muda conclusão nenhuma mas tem de ficar
escrita:** K1 disse que o termo de Fitts *"vale um sexto do orçamento"*.
Refeita a fracção, 0,513 de 4,03 é um **oitavo**. A 15 s passa a **1/29**.
K1 estava certo no argumento e redondo demais na fracção.

### O que virou irrelevante, e continua verdadeiro

- **Os bónus deixaram de importar na prática.** `bonusContagem` passou de
  **25 %** para **6,7 %** do orçamento; `bonusToque`, de **15 %** para **4 %**.
  K1 chamou aos 600 ms *"o número mais fraco desta página"*. **Hoje é o número
  mais fraco e também o menos consequente** — estar errado sobre ele ficou
  barato. Ficam os dois, porque a lei é de direcção.
- **A geometria do alvo deixou de pesar de todo.** K1 provou que para os 4 s
  virarem 5 só por `W`, `W` teria de cair a ~7 px. A 15 s nem um alvo de um
  pixel move o número.

### O que morreu, e morreu dito

| o que morreu | porquê |
|---|---|
| **o tecto dos ~6 s** (*"acima disso deixa de ser janela e passa a ser um modal que se pode ignorar"*) | morreu **por decisão da pessoa**, e a consequência que K1 previu é real: **com 15 s a janela É ignorável.** A resposta não é encurtá-la. É fazer com que ignorá-la aconteça **poucas vezes** e custe **pouco**. *O que K1 comprava com 4 segundos, K1b compra com a escada.* |
| **`folgado: 8000`** | nasceu para ser **o dobro** do normal. Com `normal` a 15 000 seria **metade** — uma generosidade que pune. E a única estrada que lhe chegava era o degrau do meio da escada, que também morreu. **Regra sem leitor é export morto: linha apagada.** |
| **o degrau do meio da `ESCADA_DO_SILENCIO`** (*2.ª seguida → `folgado`*) | morreu com `folgado`. |
| **o terceiro degrau da escada** | a 4 s custava **4 000 ms** comprar a certeza; a 15 s custa **16 600** — **4,15× mais caro pela mesma certeza**. E a hipótese que ele existia para proteger (*"ele é só lento"*) desapareceu: **quem precisa de mais de 15 s não é salvo por um terceiro degrau** — é salvo por *sem pressa*, que não expira. **O terceiro degrau deixou de proteger alguém.** |
| **a coluna `leque: 0`** de `RITMOS_DA_REACAO` | era **zero nas três linhas**. Coluna que nunca varia não é coluna, é uma constante disfarçada de tabela — e a regra que ela guardava já está **desenhada na peça**: `Escolhendo` só existe em `Tempo=Parado`. |

### A descoberta que este ciclo tem, e K1 não tinha

K1 escreveu: *"com 2 a 4 janelas por combate cada segundo a mais é meio minuto
de coxear por luta"* — e tentou minimizar **os segundos da janela**.

**A variável era a errada.** O custo não escala com os segundos: escala com o
**número de janelas**, e esse número era o que estava solto. Com uma janela por
rodada e duas por luta, a janela pode durar 15 s sem que a luta coxeie — e é
por isso que os 15 s da pessoa e o teto deste ciclo cabem no mesmo jogo.

---

## 3 · o que o relógio cobra — a rodada de quatro inimigos, medida

**O relógio dispara por golpe recebido.** Fui ver o que isso custa de facto,
no motor que existe.

- `turnoDosInimigos` (`combate.js:242`) percorre os inimigos vivos e empilha as
  acções **todas numa lista só**, devolvida antes de qualquer uma ser mostrada.
- `App.jsx:13885` itera essa lista, e em `:13894` chama `tentarReacaoNoGolpe`
  **por golpe**, só para `alvoRef === "jogador"`.
- `ataquesDoInimigo` (`combate.js:716`): comum **1** golpe, elite **2**,
  lendário **2**, lendário de nível ≥ 12 **3**.

### O antes — quatro inimigos, uma janela por golpe

Quatro inimigos comuns, todos a bater no herói, todos acima do limiar
(`max(minDano, round(vidaMax × 0,08))`), herói marcial (`aparar`, 0 PM — o PM
nunca trava):

| caso | golpes | janelas | espera |
|---|---|---|---|
| **quatro comuns** | 4 | 4 | **60 000 ms** — o minuto que a pessoa nomeou |
| **quatro lendários de nível ≥ 12** | 12 | 12 | **180 000 ms** — três minutos, numa rodada |
| **uma luta de cinco rodadas (comuns)** | 20 | 20 | **300 000 ms = 5 minutos** |

**O «antes» não é um espantalho.** É o que o relógio de 15 s faz sozinho, com
o gatilho que a pessoa descreveu, sem ninguém desenhar nada de mau.

### O depois

| caso | janelas | espera |
|---|---|---|
| **quatro comuns** | 1 | **15 000 ms** — **−75,0 %** |
| **quatro lendários** | 1 | **15 000 ms** — **−91,7 %** |
| **cinco rodadas, quem ignora tudo** | 2 | **33 200 ms** — **−88,9 %** |

---

## 4 · a escolha do ciclo — **uma janela por rodada**

*"Agrupar"* tinha duas leituras. **A resposta certa é a terceira**, e é a que
sai da mecânica em vez de a contrariar.

- **(a) uma janela cobre os golpes do turno e o jogador escolhe a qual reagir.**
  Recusada. É **mecânica nova** (escolher o alvo da reação — e mecânica é do
  `backend`); **quebra a regressão zero**, porque hoje a reação cai no
  **primeiro** golpe que qualifica (`App.jsx:13894`, o laço pára na primeira
  chamada que devolve algo); e, com o dano em segredo, é escolher às cegas.
  **Uma decisão sem informação não é decisão — é pedágio.**
- **(b) uma janela por golpe, mas o relógio corre uma vez.** Recusada. O
  jogador continua a ser **perguntado quatro vezes**, e três dessas respostas
  não podem mudar coisa nenhuma (a reação já foi gasta ou já foi recusada).
  **Quatro perguntas com uma resposta entre elas é formulário, não jogo.**
- **(c) a janela é da RODADA — e é esta.** Porque **o recurso é da rodada**:
  `reacaoUsadaRef` (`App.jsx:7657`) é um booleano por rodada, zerado em
  `:14291`, e `tentarReacaoNoGolpe` devolve `null` de imediato se ele estiver
  levantado (`:7660`). **A pergunta toma a forma do recurso que ela gasta.**

**E agrupar não é um remendo: é a forma em que os dados já chegam.** A rodada
inteira está resolvida numa lista antes de o primeiro cartão nascer. Foi a
única coisa que eu não sabia antes de ir ler o motor, e é a que torna esta
etapa barata em vez de difícil.

### O que o jogador vive, e é o teste que importa

Nada na tela diz *agrupamento*. O cartão é o mesmo cartão, no mesmo sítio, com
a mesma primeira linha. **O jogador não aprende um mecanismo: ele apenas nunca
é perguntado duas vezes na mesma rodada.** Os outros golpes caem e o log
enche-se, como enche hoje. *O melhor agrupamento é aquele de que não há nada
a dizer.*

---

## 5 · o recurso e a pergunta são duas contas diferentes

**É a frase que fecha a porta do minuto**, e é a única mecânica que este ciclo
acrescenta.

- **Reagir** gasta o recurso (a reação da rodada) **e** a pergunta.
- **Deixar expirar** gasta os dois — porque o sistema responde como hoje, e o
  que ele faz hoje gasta a reação. **É a trava K2, inteira.**
- **Recusar** **não gasta o recurso** (nem o PM, nem a reação) **mas gasta a
  pergunta**: o jogo ouviu *não* e não volta a perguntar nesta rodada.

**Porquê**, e é por experiência de jogo, não por conveniência: uma recusa é uma
declaração sobre **a rodada** — *"este turno eu guardo"* —, não sobre aquele
machado em particular. Um jogador que recusa o golpe 1 e é perguntado outra vez
no golpe 2, e outra vez no golpe 3, está a ser **importunado**: o sistema ouviu
a resposta e insistiu duas vezes. E, **com o dano em segredo, a recusa não
podia ser outra coisa** — o jogador não tem como distinguir o golpe 1 do golpe
2, logo uma recusa por golpe seria apostar contra um relógio, não decidir.
*As duas decisões da pessoa encaixam uma na outra: o segredo do dano é o que
torna a recusa por rodada a única honesta.*

**E recusar cala também a reação automática pelo resto da rodada.** Sem isto, o
jogador dizia *"não gaste o meu PM"* e o sistema gastava-o no golpe seguinte —
o que seria pior do que não ter janela nenhuma. **Isto não fere K2:** a
regressão zero é de **quem não responde**, e recusar é responder.

**O preço, dito por mim.** A reação cai no **primeiro** golpe que qualifica,
que nem sempre é o maior. É exactamente o que o jogo faz hoje (por isso é
regressão zero), mas quer dizer que *aparar* não quer dizer *aparar o pior
golpe*. Fica como limite conhecido, e como a primeira coisa que K4 deve medir
depois da contagem de janelas.

---

## 6 · as quatro portas por onde a janela não passa

A janela **só corre quando há de facto reação possível**. As quatro condições,
e todas saem do código que já existe:

1. **há reação para este gatilho** — `reacoesDe` filtra por perfil de combate e
   por habilidade na ficha (`reacoes.js:76`), e depois por `gatilho`.
2. **o golpe paga a reação** — `dano >= max(minDano, round(vidaMax × 0,08))`
   (`reacoes.js:92-94`). **Arranhão não abre janela.** Deixar reagir a um
   arranhão seria mecânica nova e triplicaria a contagem de janelas por luta.
3. **o PM paga** — `(r.pm || 0) > (pers.mana || 0)` salta a reação
   (`reacoes.js:89`); se saltar todas, nada abre.
4. **a magia é magia** — `soMagia` contra `tipoDano` (`reacoes.js:91`).

E três que são da Fase K, não do motor de hoje:

5. **a reação da rodada ainda não foi gasta** (`reacaoUsadaRef`).
6. **o jogador ainda não respondeu nesta rodada** (§5).
7. **a preferência da ficha não decidiu por ele** — *aparar sempre* e *deixar
   passar* **não abrem janela nenhuma**; *sem pressa* abre e não expira.

**A escada é a oitava**, e é temporal: ao segundo silêncio seguido, esta luta
não pergunta mais.

---

## 7 · o teto, e a conta que o gera

**`esperaMs` conta espera IMPOSTA** — o tempo em que o jogo está parado à
espera de uma pessoa que pode não estar lá. **O que o jogador gasta a decidir
de olhos no cartão não é espera: é jogo.** Por isso:

- uma janela **respondida em 2 s** custa 2 s, e o teto conta o pior caso, que
  é a expiração;
- **`sem pressa` (`parado`) contribui ZERO.** Ele escolheu que o jogo o espere,
  e a WCAG 2.2.1 exige que possa escolhê-lo. *Um teto que contasse o tempo de
  quem pediu tempo seria um teto contra o utilizador que a lei protege.*

```
TETO POR RODADA        = 15 000 + 1 000 (contagem) + 600 (toque) = 16 600 ms
TETO ENTRE RESPOSTAS   = 2 janelas × 16 600                      = 33 200 ms
```

**O segundo é o que importa, e é a catraca de verdade.** Um teto por rodada
multiplicado por um número de rodadas sem limite **não é teto nenhum**. O que
se prova é: **entre duas respostas do jogador, o sistema nunca o faz esperar
mais de 33 200 ms** — porque à segunda expiração seguida a escada cala pelo
resto da luta, e sair do silêncio exige uma resposta dele.

---

## 8 · as tabelas — e mudam de casa

K1 pô-las em `src/reacoes.js`. **Movem-se para `src/ritmo-da-reacao.js`**, o
módulo que este ciclo cria: `reacoes.js` é o **catálogo** (quem tem o quê,
quanto custa, quanto corta) e o **ritmo** é outra coisa. *Conta se prova, tela
se olha* — e a tabela mora no módulo que a lê.

```js
export const RITMOS_DA_REACAO = [
  /* janela em ms; 0 = nao expira. Os bonus SOMAM-SE a janela. */
  { id: "normal", janela: 15000, bonusContagem: 1000, bonusToque: 600 },
  { id: "parado", janela:     0, bonusContagem:    0, bonusToque:   0 },
];
/* Duas linhas, duas estradas, zero linhas sem leitor: `normal` e o padrao,
   `parado` SO o jogador o escolhe (a pilula "eu decido, sem pressa" da
   ficha). `folgado: 8000` foi apagado — 8000 < 15000, logo seria castigo,
   e depois de morrer o degrau do meio da escada ninguem o alcancava. */

export const ESCADA_DO_SILENCIO = [
  { seguidas: 1, faz: "nada"     },  // a primeira expiracao e de graca
  { seguidas: 2, faz: "silencio" },  // pelo resto DESTA luta
];
/* A linha "nada" carrega decisao e por isso fica: perdoar a primeira nao
   era obvio — podia calar-se logo. O contador zera a primeira resposta, e
   a escada reinicia na luta seguinte sem pedir nada a ninguem. */

export const TETO_DA_ESPERA = {
  janelasPorRodada:     1,   // a rodada abre no maximo UMA
  janelasAteOSilencio:  2,   // e a luta, duas sem resposta nenhuma
  msPorRodada:      16600,   // 15000 + 1000 + 600
  msEntreRespostas: 33200,   // 2 x msPorRodada — o que a suite prova
};

export const PORTAS_DA_JANELA = [
  { id: "sem_reacao",   porque: "nenhuma reacao serve este gatilho" },
  { id: "arranhao",     porque: "o golpe nao paga a reacao" },
  { id: "sem_pm",       porque: "o PM nao paga nenhuma aplicavel" },
  { id: "so_magia",     porque: "so morde magia, e o golpe e fisico" },
  { id: "reacao_gasta", porque: "a reacao da rodada ja foi usada" },
  { id: "ja_respondeu", porque: "o jogador ja respondeu nesta rodada" },
  { id: "silencio",     porque: "a escada calou o resto desta luta" },
  { id: "preferencia",  porque: "a ficha ja disse o que fazer" },
];
/* Nao e tabela de numeros, e existe por uma razao de suite: e o que deixa
   provar POR QUE a janela nao abriu, em vez de so provar que nao abriu. */
```

**`TETO_DA_ESPERA.msPorRodada` não pode divergir de `RITMOS_DA_REACAO`**, e a
suíte assere-o (asserção 15). Duas tabelas que dizem o mesmo número por
caminhos diferentes só são uma tabela enquanto alguém as comparar.

### A fila da ficha não muda de forma, e muda de conteúdo

As quatro pílulas de K1 continuam as quatro, e continuam a ser a conformidade
WCAG 2.2.1 da fase. O que mudou é o que cada uma acende — e **`folgado` já não
está lá para ninguém**:

| pílula | ritmo | o que faz |
|---|---|---|
| **eu decido** | `normal` | o padrão. A janela corre 15 s. |
| **eu decido, sem pressa** | `parado` | a janela abre e **espera**. *Desliga* o limite (WCAG 2.2.1). |
| **aparar sempre** *(o verbo do herói)* | — | **não abre janela**: o sistema faz o que faz hoje. *Remove* o limite. |
| **deixar passar** | — | **não abre janela**: a reação não se gasta, e o PM fica. |

---

## 9 · a função pura — `src/ritmo-da-reacao.js`

**Determinística: não rola dado nenhum, não lê relógio nenhum, não toca em
React.** Recebe a rodada inteira e devolve quem pergunta, quem cala, e o preço.

```js
export function ritmoDaRodada({
  golpes = [],             // [{ ordem, inimigo, gatilho, dano, tipoDano }]
  heroi = null,            // { classe, mana, vidaMax, habilidades }
  preferencia = "eu_decido",  // sem_pressa | verbo_travado | deixar_passar
  reacaoGasta = false,     // o RECURSO da rodada ja foi usado
  jaRespondeu = false,     // a PERGUNTA da rodada ja foi respondida
  expiracoesSeguidas = 0,  // a escada
  contagem = false,        // prefers-reduced-motion
  toque = false,           // apontador grosso
} = {}) { /* ... */ }
```

**Devolve:**

```js
{
  abre: null | {
    ordem,        // o indice, em `golpes`, do golpe que abre a janela
    inimigo,
    gatilho,
    reacoes,      // as aplicaveis, na ordem de prioridade de REACOES
    ritmo,        // "normal" | "parado"
    janelaMs,     // 0 = nao expira
  },
  cobertos: [ordem, ...],        // os golpes que esta janela cobre
  fechados: [{ ordem, porta }],  // porta = id de PORTAS_DA_JANELA
  esperaMs,                      // o pior caso DESTA rodada
  silencio,                      // a escada calou esta luta
}
```

**Três coisas para quem a for construir em K3:**

- **`heroi = null` tem de ser tratado à mão.** `= {}` no destructuring **não**
  cobre `null` explícito — é lei da casa e é a asserção 18.
- **Ela não duplica `escolherReacao`.** Chama uma exportação nova e
  determinística (abaixo), e nunca reimplementa `minDano`, `pm` ou `soMagia`.
  *Regra duplicada é a pior das dívidas: parte em silêncio no dia em que uma
  das duas cópias muda.*
- **`ritmoDaRodada` é determinística DADA a rodada.** O determinismo da rodada
  em si é do motor, e a única fuga é a de K1 §6b — abaixo.

### O pedido ao `backend`, e é um só

Uma exportação nova em `src/reacoes.js`:

```js
export function reacoesQueSeAplicam({ pers, gatilho, dano, tipoDano }) { … }
```

Os filtros de `escolherReacao` **sem o `Math.random()` da `chance`**. Com ela,
`escolherReacao` passa a ser *"a primeira dessa lista que sobrevive ao seu
rolo"* — **o mesmo número de chamadas a `Math.random()`, na mesma ordem**, logo
a extracção é regressão zero, byte a byte, e é conferível lendo o diff.

**E isto é o conserto de K1 §6b pela porta certa.** `reacoes.js:96` rola a
`chance` **antes de oferecer**, o que **já hoje viola o determinismo por
semente**; na Fase K fica visível (listas diferentes com a mesma semente). O
meu módulo **não pode rolar**, logo a `chance` tem de mudar-se para a
resolução. **Se K3 a deixar onde está, o teto continua a valer** — uma janela
a menos nunca é uma janela a mais —, mas *qual* golpe abre deixa de ser
determinístico, e a lista na tela torna isso visível ao jogador.

### O que K3 tem de garantir, e não é meu para construir

A rodada é hoje um laço **síncrono**. Abrir uma janela obriga-a a suspender e a
retomar. **Nunca pode custar o turno:** se a janela não resolver por qualquer
razão (aba fechada, erro, promessa perdida), o `catch` resolve **como hoje** e
a rodada segue. O helper é o `calou(...)`.

---

## 10 · as quinze portas que fechei contra o vazamento do dano

**O dano em segredo não se guarda com uma promessa: guarda-se fechando cada
porta pelo nome**, porque a mesma informação com outro rosto continua a ser a
mesma informação. Ficam escritas para que ninguém as reabra por distração
em K3.

| # | a porta | o que vazaria |
|---|---|---|
| 1 | **o número cru** — *"9 de dano a caminho"* | era a primeira linha da proposta de K1 |
| 2 | **a conta feita** — *"9 vira 4 · você fica em 13"* | era o coração dela |
| 3 | **forte/fraco, leve/pesado, "golpe sério"** | o número com três degraus em vez de vinte: resolução menor, informação igual |
| 4 | **a cor** — cordão, corpo ou verbo a mudar de `amber` para `danger` conforme o golpe | *(`Pressa=Sobra→Pouco` fica, e mede **tempo**; no dia em que medir dano, é esta porta)* |
| 5 | **o tamanho do cartão** — mais alto quando o golpe é grande | |
| 6 | **a ordem dos verbos**, que varie com o golpe | fechada por construção: a ordem é a de `REACOES`, e é fixa |
| 7 | **o conteúdo da lista**, que varie com o golpe | **estava ABERTA e eu não a tinha visto** — ver abaixo |
| 8 | **o ícone** — um glifo de perigo só nos golpes grandes | |
| 9 | **a intensidade da animação** — entrada mais rápida, tremor, escala | |
| 10 | **o tempo** — a janela durar mais quando o golpe é maior | **a mais tentadora**, porque soa a generosidade |
| 11 | **o som** | não há som na casa; fica fechada antes de nascer |
| 12 | **a posição** — o cartão nascer mais perto do herói conforme o golpe | |
| 13 | **`Papel=Armado` condicional** — o verbo vir cheio só quando "vale a pena" | a armação é sempre a primeira de `REACOES`, e `escolherReacao` não conhece *vale a pena* |
| 14 | **a barra de PV a antecipar** — um PV fantasma na tira durante a janela | |
| 15 | **a prosa do Narrador** — pedir à IA que qualifique o golpe antes da janela | fechada de graça: o envelope do turno inimigo só chega ao prompt no fim da rodada |

### A porta 7, e é o achado do ciclo

**Os `minDano` de `reacoes.js` diferem por reação** — contramágica 4, escudo
arcano 6, aparar 5, esquiva ágil 4 — e o limiar é
`max(r.minDano, round(vidaMax × 0,08))`. Logo, para um herói com **duas**
reações aplicáveis e `vidaMax ≤ 68` (onde o piso dos 8 % ainda é < 6), **a
lista mudava de tamanho conforme a faixa do dano.** O jogador aprendia a ler o
tamanho do golpe pelo número de linhas do cartão.

**A regra que fecha a porta, e paga duas vezes:**

> **O limiar decide SE a janela abre, nunca O QUE ela oferece.**
> A **abertura** é função do herói **e** do golpe (pelo menos uma reação passa
> o limiar). A **lista** é função só do herói e do gatilho — perfil, ficha,
> PM, `soMagia`.

E o segundo pagamento é de jogo: **a lista passa a ser a mesma em toda a luta.**
*Uma lista que não muda lê-se uma vez; uma lista que muda lê-se todas as vezes*
— e ler todas as vezes, sob relógio, era o custo escondido de K1.

**A consequência, assumida:** a janela pode oferecer um verbo cujo `minDano`
aquele golpe não alcança, e o jogador pode escolhê-lo. Está certo. **`minDano`
é a economia do SISTEMA** — *não gastes a reação num arranhão* — e, no instante
em que o jogador decide, a heurística já fez o trabalho dela. **O chão que
impede o sistema de desperdiçar a reação não é um chão sobre o que o jogador
pode escolher.**

---

## 11 · a suíte — `testes/teste-ritmo-da-reacao.mjs`

**A catraca é esta: o tempo total de espera por rodada tem teto medido, e a
suíte prova-o com quatro inimigos na mesa.**

| # | a asserção |
|---|---|
| 01 | **quatro inimigos, quatro golpes no herói: abre UMA janela** — `abre.ordem === 0`, `cobertos.length === 3`, `esperaMs === 15000`. |
| 02 | **o antes e o depois estão escritos no teste** — `4 × 15000 === 60000` sem agrupamento, `15000` com, e a razão 4:1 é asserida. *Para que o ganho não evapore em silêncio no dia em que alguém mexer.* |
| 03 | **doze golpes** (quatro lendários de nível ≥ 12) continuam a abrir **uma** janela, e `esperaMs` continua `15000`. |
| 04 | **varrendo 1 a 12 golpes, `esperaMs <= TETO_DA_ESPERA.msPorRodada` em todos.** |
| 05 | **o herói SEM PM não é perguntado** — conjurador com `mana: 1` e escudo arcano a 2 PM → `abre === null`, porta `sem_pm`. |
| 06 | **o herói que JÁ REAGIU não é perguntado** — `reacaoGasta: true` → `abre === null`, porta `reacao_gasta`, `esperaMs === 0`. |
| 07 | **quem JÁ RESPONDEU não é perguntado de novo** — `jaRespondeu: true` (recusou no golpe 1) → `abre === null`, porta `ja_respondeu`. **É esta que fecha a porta do minuto.** |
| 08 | **`sem pressa`: a janela abre e NÃO expira** — `ritmo === "parado"`, `janelaMs === 0`, `esperaMs === 0`. |
| 09 | **`deixar passar`: nenhuma janela, nunca** — `abre === null`, porta `preferencia`, `esperaMs === 0`. |
| 10 | **`aparar sempre` (verbo travado): nenhuma janela**, porta `preferencia`; o `App` executa o verbo do herói. |
| 11 | **zero reação aplicável: nada abre** — `abre === null`, porta `sem_reacao`. |
| 12 | **o arranhão não abre** — dano abaixo de `max(minDano, round(vidaMax × 0,08))` → porta `arranhao`. **É a trava K2:** o conjunto de momentos é o de hoje. |
| 13 | **a escada cala à SEGUNDA seguida** — `expiracoesSeguidas: 2` → `silencio === true`, `abre === null`, `esperaMs === 0`. |
| 14 | **o teto entre respostas** — `2 × 16600 === 33200`, e `TETO_DA_ESPERA.msEntreRespostas` bate. |
| 15 | **as tabelas não divergem** — `msPorRodada === normal.janela + normal.bonusContagem + normal.bonusToque`. |
| 16 | **`folgado` NÃO EXISTE** — `RITMOS_DA_REACAO.find(r => r.id === "folgado") === undefined`. *A linha morreu, e a suíte prova que morreu, para que ninguém a reponha por distração.* |
| 17 | **determinismo** — com `Math.random` substituído por uma função que **estoura**, `ritmoDaRodada` corre na mesma. Não é deep-equal mil vezes: é a prova de que **nunca rola**. |
| 18 | **`heroi: null` não estoura** — `abre === null`, porta `sem_reacao`. *(`= {}` no destructuring não cobre `null`.)* |
| 19 | **nenhuma porta sem nome** — toda `porta` devolvida existe em `PORTAS_DA_JANELA`. |
| 20 | **o dano não vaza (I)** — o objecto `abre` **não tem nenhuma chave derivada do dano**: nem `dano`, nem `corte`, nem `previsao`. **Chave nova quebra a suíte.** |
| 21 | **o dano não vaza (II)** — mesmo herói, mesmo gatilho, dano de 1 a 99 → **`abre.reacoes` é sempre a mesma lista, na mesma ordem**. *É a porta 7, provada.* |
| 22 | **o dano não vaza (III)** — mesmo herói, mesmo gatilho, dano de 1 a 99 → **`janelaMs` e `ritmo` são sempre os mesmos**. *É a porta 10, provada.* |

**As asserções 20, 21 e 22 são a decisão da pessoa transformada em catraca.**
As portas fechadas deixam de ser prosa e passam a ser coisa que a suíte
derruba — que é a única forma de uma decisão sobreviver a três ciclos.

---

## 12 · ao `desenho` — dois pedidos, com a medida

1. **Uma linha nova na tabela de movimento: `tv-trilho-entra`.**
   **90 ms, só `opacity`**, e o trilho **nasce já na proporção que lhe cabe**
   (73 % aos 4 000 ms de uma janela de 15 000) — **nunca a 100 %**, que
   mentiria sobre o tempo. É o espelho exacto do teu `tv-trilho-sai`, e serve a
   proposta ambiciosa. Sob `prefers-reduced-motion`: aparece a seco.
   **Não é peça nova** — `Tempo=Parado` (`84:3054`) e `Tempo=Barra` (`84:3009`)
   já existem, e a proporção já é livre por decisão tua ([A3], *o trilho mede a
   janela*). É uma linha de tabela e uma classe, não um desenho.

2. **O glifo de `Etapa=Resolvida` no caso *recusou*** — o pedido que sobrou de
   K1, **com um argumento novo e não uma repetição.** Em K1 recusar era um caso
   de borda. **Em K1b a recusa é a resposta de rodada de todo jogador que está
   a poupar PM**: passou de excepção a rotina, uma vez por rodada. O cartão a
   mostrar a espada quando ninguém aparou deixa de ser um defeito raro e passa
   a ser **o que esse jogador vê a luta inteira**. A regra que o resolve já é
   tua: `Papel=Recuo` esconde o dele porque nenhum glifo desta casa diz *deixar
   passar* sem mentir, e a resolução de um recuo herda a regra do recuo.

---

## 13 · para a pessoa decidir

### A proposta ambiciosa — **o relógio que só aparece para quem hesita**

*(quadro `100:2436`, com o par montado.)*

**Os 15 s tiram a pressa do tempo. Não tiram a pressa da imagem.** Um trilho
que corre durante quinze segundos continua a dizer *"você está a ser
cronometrado"* durante os quinze — e, como quase nunca chega ao fim, é uma
ameaça que o sistema não cumpre. **Uma ameaça que não se cumpre ensina o
jogador a desconfiar do relógio**, que é o contrário do que um relógio serve
para fazer.

**A proposta:** a janela **nasce muda** — `Tempo=Parado`, a variante que já
existe — e **o trilho só aparece aos 4 000 ms**.

| | número |
|---|---|
| a janela fica muda | **4 000 ms** — o piso que K1 mediu (4,03 s), arredondado para baixo |
| quando o trilho nasce, falta | **10 970 ms** |
| isso é, contra a conta de K1 | **2,72×** o que a decisão exige |
| sob `Tempo=Contagem` (movimento reduzido) | nasce aos 4 000 com **11 970 ms** pela frente |
| custo em peça nova | **zero** |
| custo em píxeis | **zero** |

**O que muda no que o jogador vive:** a **maioria** das janelas deixa de ter
relógio nenhum. A pergunta continua lá, a pressão desaparece para quem joga
depressa, e a folga inteira continua para quem precisa dela. **É a frase da
pessoa — *"pra que fique tranquilo"* — levada um passo mais longe do que os 15
segundos sozinhos conseguem.**

E há um espelho que me agrada: K1 escreveu que **o desaparecimento do trilho é
o sinal de que o relógio parou**. Isto é o outro lado — **o aparecimento do
trilho é o sinal de que o relógio começou a importar**.

A tabela, pronta (é uma coluna, não uma peça):

```js
{ id: "normal", janela: 15000, mudo: 4000, bonusContagem: 1000, bonusToque: 600 },
{ id: "parado", janela:     0, mudo:    0, bonusContagem:    0, bonusToque:   0 },
/* `mudo` so e lido quando `janela > 0`. */
```

**A porta que esta proposta NÃO abre, e fica escrita:** o atraso é
**constante** — 4 000 ms, sempre, seja o golpe qual for. No dia em que a mudez
variar com o tamanho do golpe (*"o cartão do golpe grande já nasce com
relógio"*), **é a porta 10 reaberta** e o dano volta a vazar por outro rosto.

**O risco, dito por mim.** Um jogador que não vê relógio pode não saber que há
um. Por isso o trilho nasce a 4 s e não a 12: com 10 970 ms pela frente, vê-lo
aparecer ainda é **aviso**, não emboscada. **Reversível por construção** — uma
coluna numa tabela e um valor de eixo, um commit desfeito. **Vai à pessoa**
porque muda o que o jogador **vê** em toda janela do jogo, e não o rebaixo para
caber no automático.

### E um número que registo sem escolher o remédio

**O silêncio não atravessa a luta, e isso tem um preço que eu sei contar.** A
escada reinicia em cada luta, logo **quem nunca quer isto paga 33 200 ms por
luta, de novo, para sempre**. Numa campanha de 40 lutas são **1 328 000 ms =
22,1 minutos de espera pura**, gastos a dizer *não* a uma coisa que ele já
decidiu na primeira luta.

As duas saídas que vejo — o silêncio persistir entre lutas, ou o jogo marcar
*deixar passar* na ficha por ele — **mexem no save e na memória de quem joga**,
e isso é dela. **Registo o número e não escolho.** *(E há uma saída que não
custa nada e que já existe: a pílula da ficha. Mas confiar nela é confiar que
o jogador a encontre, e a escada existe exactamente para quem não a encontra.)*

---

## 14 · o que ficou feio, e o que não soube

**Feio, e assumo:**

- **A porta 7 estava aberta e eu não a tinha visto.** Escrevi em K1 que a lista
  saía do perfil de combate, e nunca reparei que o `minDano` por reação faz a
  lista variar com o dano. A decisão da pessoa é que me obrigou a ir procurar
  vazamentos um a um — **e o vazamento que eu próprio tinha deixado só apareceu
  porque fui procurar com uma lista na mão, não a olho.**
- **Escrevi em K1 que o terceiro degrau da escada era "prova suficiente", e
  hoje apago-o.** O argumento não estava errado: estava **dependente de um
  número que mudou**, e eu não tinha escrito de que número dependia. É o tipo
  de raciocínio que sobrevive a uma revisão e não sobrevive a uma decisão da
  pessoa.
- **Dei os 60 000 ms como se fossem o pior caso, e não são.** O pior caso é
  180 000, e só o descobri ao ler `ataquesDoInimigo`. Tinha escrito o número
  bonito antes de ter ido ver.

**Não soube:**

- **Continuo a não saber quantas janelas abrem por luta.** K1 estimou 2 a 4 e
  não contou; eu também não contei. **Com uma janela por rodada o número passa
  a ser, no máximo, o número de rodadas** — o que é um teto mas não é uma
  medida. **K4 continua a dever isto**, e agora deve-o com mais consequência,
  porque a conta de 22 minutos por campanha depende dele.
- **Não joguei o depois.** Este ciclo continua a ser desenho. A prova por
  experiência jogada só existe depois de K3, e nessa altura a pergunta que
  quero responder é uma só: *ao terceiro combate, a janela ainda é um momento,
  ou já é um gesto?*
- **Não sei se 15 s é demasiado para um cartão que resolve em 1,2 s.** A
  `Etapa=Resolvida` fica 1,2 s e sai a 140 ms. Numa janela de 4 s isso era
  30 % do tempo do cartão; numa de 15 s é 8 %. Suspeito que a resolução deva
  ficar **mais** tempo quando a espera foi longa, e não sei defendê-lo com
  número nenhum — por isso não o proponho.
- **Os 4 000 ms de mudez da proposta ambiciosa são o número mais fraco desta
  página**, exactamente como os 600 ms do toque foram o de K1. Saem do piso
  medido, não de uma medida do silêncio. K4 corrige-o.

---

## onde está tudo, no Figma

Página `A batalha` (`30:12`), arquivo `e5wJUzInAssoebx5npssKc`:

| quadro | o que mostra | nó |
|---|---|---|
| **K1b · ANTES** | a rodada de quatro inimigos com uma janela por golpe: **60 000 ms** numa régua de escala comum | **`98:2394`** |
| **K1b · DEPOIS** | a mesma rodada com uma janela por rodada: **15 000 ms**, e os outros três golpes narrados no log | **`99:2996`** |
| **K1b · a proposta ambiciosa** | *o relógio que só aparece para quem hesita* — o par mudo/com-trilho e a régua dos 15 000 ms | **`100:2436`** |
| **K1b · o que esta etapa decide** | este bloco, em tela: as decisões, as tabelas, as quinze portas, a função e as 22 asserções | **`101:3096`** |

**As duas réguas de `98:2394` e `99:2996` estão na mesma escala de propósito**
— 1 160 px = 60 000 ms nas duas —, porque a comparação que interessa é um
comprimento contra uma escala comum, e não dois números lado a lado
(Cleveland & McGill, *JASA* 1984, que é a citação que o `desenho` trouxe para
esta mesa e que serve aqui pela mesma razão).
