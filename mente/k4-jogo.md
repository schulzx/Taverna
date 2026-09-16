# K4 · medir a batida — o bloco do `jogo`

*A última etapa da Fase K. **Nenhum arquivo do projeto foi tocado** — nem `.js`,
nem `.jsx`, nem `.mjs`, nem a pauta, nem o diário, nem `formas.md`. Este
documento é o produto inteiro.*

*O banco de prova viveu no scratchpad da sessão e morreu com ela: um `.mjs` que
importa `combate.js`, `reacoes.js` e `ritmo-da-reacao.js` **reais**, com um
mulberry32 no lugar de `Math.random`. A parte viva foi jogada no navegador, em
aba nova, em dois torneios de Uma Noite.*

---

## 0 · o que eu salvei, e o que eu restaurei

K3 perdeu o save de Uma Noite por restaurar com o jogo montado. Registo aqui o
que fiz, na ordem, para que a próxima etapa possa repetir o método em vez de
repetir o acidente.

**Antes de jogar**, com o jogo ainda no menu, copiei as cinco chaves para
`k4_bkp__*` e guardei o **SHA-256** de cada uma:

| chave | bytes | SHA-256 (12 primeiros) |
|---|---|---|
| `taverna_save_v1` *(a campanha — intocável)* | **139 481** | `9d624ebe1198` |
| `taverna_rapida_v1` *(Uma Noite)* | 39 498 | `d305b823dd91` |
| `taverna_mesa_ARENA7` | 10 577 | `6650041494c7` |
| `taverna_mesa_ARENAA` | 2 817 | `d112ac9bd33b` |
| `taverna_cfg_rolagens` | 1 | `6b86b273ff34` |

**Joguei.** `taverna_rapida_v1` cresceu de 39 498 para **40 923** bytes. Mais
nenhuma chave nasceu.

**Restaurei com o jogo DESMONTADO**, e a forma importa: naveguei para
`http://localhost:5173/cenas/abissal.webp` — mesma origem, logo o mesmo
`localStorage`, e o React **não monta** numa página de imagem, logo não há
autosave para correr por cima. Conferi `document.querySelector("#root")` a
`null` antes de escrever. Reescrevi as cinco chaves, **reconferi os cinco
SHA-256 um a um — os cinco batem** —, apaguei as cópias `k4_bkp__*` e confirmei
que o conjunto de chaves final é exactamente o inicial.

> **`taverna_save_v1` nunca mudou um byte.** O SHA no fim é o mesmo do início, e
> a chave nem sequer precisou de ser restaurada: o espaço de save por modo fez o
> que foi desenhado para fazer.

---

## 1 · a tabela do número

**A regra desta secção, e ela vale para o documento inteiro: o que foi corrido
está em coluna própria, o que foi calculado está dito como calculado, e o que é
modelo tem o nome de modelo.** Não há telemetria de jogador real neste jogo, e
nenhum número abaixo finge que há.

### 1.1 · a mesa e a sua calibração

Mesa de referência a de K3 — **ladino nv 3 + 2 companheiros contra 4 comuns** —
e uma segunda com **o ladino solo**. O banco não herdou a ficha de K3 (ela não
sobreviveu ao ciclo), então eu **calibrei-a contra os marginais que ele
publicou** e ela reproduz-se ao número:

| o que K3 publicou | o que o meu banco dá | fixa |
|---|---|---|
| 4 comuns, 4,000 golpes/rodada, **14,30** de dano | 4,000 golpes, **14,25** | CA **14**, herói nv 3 |
| 2 comuns, 7,12 | 7,15 *(fórmula)* | idem |
| 1 elite, 14,90 | 14,95 *(fórmula)* | idem |
| + 2 companheiros, **2,599** golpes/rodada | **2,596** | os 0,65 de `turnoDosInimigos` |

*A ficha é `{ classe: "Ladino", nivel: 3, vida: 24, vidaMax: 24, mana: 18,
atributos: { destreza: 4 } }` → `defesaDe` = 14. Escrevo-a porque quem repetir
isto sem ela mede outra coisa.*

### 1.2 · MEDIDO em Node — a rodada isolada, 20 000 sementes por mesa

| | ladino + 2 comp · 4 comuns | ladino SOLO · 4 comuns |
|---|---|---|
| golpes no herói / rodada | 2,596 | 4,000 |
| dano / rodada | 9,23 | 14,25 |
| **rodadas que ABREM janela** | **98,51 %** | **100,00 %** |
| **janelas que abrem NUM ERRO do inimigo** | **50,66 %** | **50,35 %** |
| janelas no MAIOR golpe da rodada | 35,54 % | 27,27 % |
| dano do golpe **perguntado** | **3,52** | **3,53** |
| dano **coberto**, depois da janela | 5,85 | 10,72 |
| **maior golpe da rodada** | **6,15** | **7,72** |
| **fracção do dano que chega SEM pergunta** | **62,42 %** | **75,24 %** |

### 1.3 · MEDIDO em Node — as doze classes, 20 000 sementes, solo × 4 comuns

E **este é o número novo de K4**, o que K3 não tinha:

| perfil (classes) | abre % | num erro % | **verbo armado a 0 PM** | **leque com UM só verbo** | dano sem pergunta |
|---|---|---|---|---|---|
| marcial ×4 · furtivo ×1 · misto ×2 → **7 classes** | **100,0** | 49,9 | **100,0 %** | **100,0 %** | 75,1 % |
| conjurador ×5 | 86,3 | 0,0 | 0,0 % *(2 PM)* | **100,0 %** | 53,1 % |

> **Em 12 classes de 12, a janela oferece exactamente UM verbo. Em 7 delas, esse
> verbo é de graça.** A pergunta do jogo é *sim* ou *não*, e *sim* não custa nada.
> A peça `Etapa=Escolhendo` que K1 desenhou e o `desenho` fabricou **nunca abre**.

### 1.4 · MEDIDO em Node — a luta inteira, pareada, 4 000 lutas por linha

O banco corre a luta do princípio ao fim e compara **a mesma semente** com e sem
cartão. Modelos de jogador declarados: *responde* toca o verbo armado; *expira*
não toca em nada e a escada conta; *recusa* toca `deixar passar`; *pílula* travou
o verbo na ficha.

**MESA A — ladino + 2 companheiros · 4 comuns**

| | rodadas | golpes | dano | janelas | expirou | espera | reações | morte % | rolos |
|---|---|---|---|---|---|---|---|---|---|
| **v9.266 — sem cartão (o ANTES)** | 3,89 | 6,13 | 13,13 | 0 | 0 | 0 s | 2,40 | 13,7 | 66 |
| v9.270 — responde sempre | 3,89 | 6,13 | 13,13 | **3,22** | 0 | **13,0 s** | 2,40 | 13,7 | 66 |
| v9.270 — expira sempre | 3,89 | 6,13 | 13,13 | **1,98** | 1,98 | **30,9 s** | 2,40 | 13,7 | 66 |
| v9.270 — mistura 50/50 | 3,89 | 6,17 | 13,30 | 2,86 | 1,39 | 27,6 s | 2,39 | 14,3 | 68 |
| **v9.270 — recusa sempre** | 3,51 | 5,98 | **21,67** | 3,04 | 0 | 12,2 s | **0,00** | **49,3** | 52 |
| v9.270 — pílula travada na ficha | 3,89 | 6,13 | 13,13 | 0 | 0 | **0 s** | 2,40 | 13,7 | 66 |

**MESA B — ladino SOLO · 4 comuns**

| | rodadas | golpes | dano | janelas | expirou | espera | reações | morte % |
|---|---|---|---|---|---|---|---|---|
| **v9.266 — o ANTES** | 3,77 | 10,97 | 27,21 | 0 | 0 | 0 s | 3,22 | 85,2 |
| responde sempre | 3,77 | 10,97 | 27,21 | **3,64** | 0 | 14,7 s | 3,22 | 85,2 |
| expira sempre | 3,77 | 10,97 | 27,21 | 1,96 | 1,96 | **30,6 s** | 3,22 | 85,2 |
| mistura 50/50 | 3,81 | 10,98 | 27,15 | 3,00 | 1,51 | 29,5 s | 3,27 | 84,2 |
| **recusa sempre** | 2,52 | 8,67 | **31,00** | 2,51 | 0 | 10,1 s | 0,00 | **99,6** |
| pílula travada | 3,77 | 10,97 | 27,21 | 0 | 0 | 0 s | 3,22 | 85,2 |

> **A PROVA DO PAR, e é a linha mais importante de K4:** para *responde sempre* e
> para *expira sempre*, a luta é **idêntica ao ANTES em 100,00 % das 4 000
> sementes** — mesmas rodadas, mesmo dano, mesmos golpes, mesmas reações, **mesmo
> número de rolos do dado** e mesmo desfecho. Nas duas mesas.
> **O combate NÃO ficou mais longo. Não ficou mais nada.** A Fase K não custou
> uma rodada, um golpe, um ponto de vida nem um dado ao mundo. O que ela custou
> foi relógio de parede, e só isso.

**Perguntas por luta** (medido, mesa A, *responde sempre*): 1 → 1,9 % · **2 →
17,9 % · 3 → 43,0 % · 4 → 31,6 %** · 5 → 5,1 % · 6+ → 0,5 %. Média **3,22**.
Quem cala: **2 perguntas em 98,1 % das lutas** — a escada corta e corta cedo.
**Rodadas com pergunta**: 84,05 % (mesa A) e **98,21 %** (mesa B) para quem
responde. *Não existe rodada de descanso.*

### 1.5 · CALCULADO — o tempo de parede

A espera pelo Mestre não é minha: é a **mediana das chamadas narrativas que K3
mediu na sessão dele, 13 360 ms**. A conta abaixo é `rodadas medidas × 13,36 s +
espera medida`, e é **calculada**, não cronometrada.

| mesa A | tempo de luta | sobre o ANTES |
|---|---|---|
| v9.266 — o ANTES | **52,0 s** | — |
| responde depressa *(modelo de 4 030 ms, de K1)* | 65,0 s | **+24,9 %** |
| recusa sempre | 59,1 s | +13,7 % |
| mistura 50/50 | 79,6 s | +53,0 % |
| **expira sempre** | **82,9 s** | **+59,4 %** |
| pílula travada na ficha | 52,0 s | **+0,0 %** |

Mesa B: ANTES 50,4 s · responde 65,1 s (+29,2 %) · expira **81,0 s (+60,8 %)** ·
pílula 50,4 s (0 %).

**Dois casos que o banco não corre e que se calculam das janelas medidas:**

- *hesita e responde no último instante* — 3,22 janelas × 15 600 ms = **50,2 s**
  → 102,2 s, **+96,6 %** (mesa A). É o pior caso de quem **joga** a batida.
- *pior caso da tabela* (`prefers-reduced-motion` + ponteiro, 16 600 ms) —
  3,22 × 16 600 = 53,5 s → **+102,8 %**.
- **O tecto de `TETO_DA_ESPERA` aguenta.** `msEntreRespostas: 33 200` contra
  **30,9 s** e **30,6 s** medidos para quem cala, nas duas mesas. A tabela não
  mentiu.

> **E o número que dói mais do que qualquer percentagem: quem CALA paga 30,9 s
> por luta; quem RESPONDE paga 13,0 s. Ignorar a batida custa 2,4× mais relógio
> do que jogá-la.** A escada corta as perguntas ao meio (3,22 → 1,98) e ainda
> assim duplica o preço — porque cada expiração custa os quinze segundos
> inteiros e compra exactamente zero: o sistema resolve o que já resolveria.

---

## 2 · o golpe real — a dívida de K3, paga

K3 fechou dizendo que nunca tinha visto o cartão nascer de um golpe de verdade.
**Vi cinco.** Dois torneios de Uma Noite, aba nova, `Rolagens de combate:
visíveis`, seis rodadas de vez do mundo.

- **Luta 1:** *A Muralha* (Guerreiro, 36 PV) × *A Flecha* (elite, 27 PV).
- **Luta 2:** *O Punho* (Guerreiro, 34 PV) × *O Remendo* (elite, 28 PV).

### 2.1 · as cinco janelas, cronometradas

| # | gatilho | o cartão, palavra a palavra | desfecho | **janela aberta** | resolvida na tela |
|---|---|---|---|---|---|
| 1 | `inimigo_erra` | `A Flecha erra o golpe` · `🗡 contra-ataque · 0 PM — na mesma batida` · `deixar passar` | expirou | **15 013 ms** | 1 378 ms |
| 2 | `sofre_dano` (20) | `A Flecha te acerta` · `⚔ aparar · 0 PM — corta metade` · `deixar passar` | expirou — **2.ª → silêncio** | **15 014 ms** | 1 362 ms |
| 3 | `sofre_dano` (10) | `O Remendo te acerta` · `⚔ aparar · 0 PM — corta metade` | **respondeu** | **4 038 ms** | 1 292 ms |
| 4 | `inimigo_erra` | `O Remendo erra o golpe` · `🗡 contra-ataque · 0 PM — na mesma batida` | **respondeu** | **12 593 ms** | 1 290 ms |
| 5 | `inimigo_erra` | idem | **recusou** | **3 000 ms** | 1 355 ms |

**A tabela e a tela concordam ao milissegundo.** As duas expirações mediram
15 013 e 15 014 ms contra os `janela: 15000` de `RITMO_DA_REACAO` — o `bonusToque`
não entrou porque o último dispositivo era o **teclado** (`Enter` no campo). Na
janela 4, com o rato como último dispositivo, o trilho mediu **4,6 s** =
`4 000 + bonusToque 600`, e `folga 11 000 + trilho 4 600 = 15 600 = janelaMs`.
A conta fecha nos dois regimes. A resolução medida 1 290–1 378 ms contra
`resolucaoMs 1200 + saiMs 140 = 1 340`.

### 2.2 · o trilho, medido vivo

Nasceu a **10 967 ms** do nascimento do cartão (`folgaMs: 11 000`).
`animation-name: tvJanelaTempo`, `4.6s`, `linear`, `animation-delay −0,012 s`,
`transform-origin: 0px 2px`, `background: rgb(232,163,61)` = `T.amber`,
**527 px dentro de um pai de 528 px** — proporção, não píxeis, como K1b exigiu.
`scaleX` amostrado de 250 em 250 ms: 0,9973 → 0,9648 → 0,9104 → 0,8561 → 0,8017
→ 0,7474 → 0,6930. Inclinação **−0,2263/s**, ou 4,42 s de percurso contra os
4,6 s declarados — a diferença é a granularidade do meu amostrador.

> **E o achado do trilho, que ninguém escreveu ainda: quem responde dentro do
> orçamento de K1 nunca vê uma barra.** Nas janelas 3 e 5 o trilho **não
> chegou a existir** — respondi aos 4 038 ms e aos 3 000 ms, e os primeiros onze
> segundos não têm relógio nenhum. *A decisão de K1b de pôr a folga antes do
> trilho faz com que o jogador rápido jogue um jogo sem cronómetro.* É a melhor
> coisa desta fase e não estava medida.

### 2.3 · o que se vê bate com o que a suíte promete — as quatro saídas

| saída | o cartão disse | a tabela de `k3-jogo.md` diz | bate |
|---|---|---|---|
| `expirou` · contra-ataque | `🗡 a mão revidou por você` + `revide em A Flecha · 4 de dano` | §1.2 coluna *instinto* + §1.4 `inimigo_erra`, acertou | **sim** |
| `expirou` · aparar | `⚔ o instinto aparou por você` + `10 evitado · 20 vira 10` | §1.2 + §1.4 `cortou < dano` | **sim** |
| `respondeu` · aparar | `⚔ você aparou o golpe` + `5 evitado · 10 vira 5` | §1.2 coluna *você* | **sim** |
| `respondeu` · contra-ataque | `🗡 você revidou na mesma batida` + `revide em O Remendo · errou` | §1.2 + §1.4 `revide errou` | **sim** |
| **`recusou`** | `você deixou a brecha passar` + `a guarda fechou`, **sem glifo** | §1.3 (`inimigo_erra`) + §1.4 | **sim** |
| o aviso do silêncio | `o instinto assume o resto da luta`, na 2.ª expiração, uma vez | §2 | **sim** |

**E o log fica byte a byte o de hoje.** Conferi linha a linha:
`⚔ REAÇÃO — Aparar: 5 de dano evitado (10 → 5)` · `🗡 REAÇÃO — Contra-ataque` ·
`🗡 Revide em A Flecha: 4 de dano (23/27)` — todas na forma que `resolverReacao`
produz, e todas **antes** das linhas de golpe (a ordem feia de hoje, asserção
07). E `recusou` **não escreveu nada**: o resumo da rodada foi
`⚔ 3 golpes · 6 de dano causado · 2 erros · 3 rolagens`, sem uma linha de reação.

**O cartão mede 528 × 136 px** em `Etapa=Direta`, 62 px resolvido, **86 px** com
o aviso do silêncio. O teto de 560 px não mordeu neste viewport (a região do
veredito media 528). **Ancora em `y 416` e cresce para cima; a câmara não se
mexeu um pixel em nenhuma das cinco.**

### 2.4 · o que o golpe real DESMENTIU — e não foi a peça

Nada do desenho falhou. O que o vivo desmentiu foi **a ideia de que a pergunta
está no sítio certo**, e desmentiu-a de forma que eu não consigo amaciar:

1. **A primeira janela da minha primeira luta real abriu num erro.** A segunda
   também. Das cinco, **três em `inimigo_erra`** — a amostra é minúscula, mas
   cai em cima dos **50,66 %** da varredura.
2. **Na rodada da janela 1, a pergunta foi sobre um golpe que passou longe, e
   12 de dano entraram cobertos, sem uma palavra.** O cartão celebrou um revide
   de 4. Na janela 3, a pergunta foi sobre 10 (cortei 5) e **outros 10 entraram
   cobertos**. O 62,42 % não é uma estatística: é o que eu vi acontecer, três
   vezes seguidas, na minha primeira hora de jogo.
3. **A escada calou exactamente a rodada que quase me matou.** Luta 1, rodada 4:
   o jogo tinha-me perguntado duas vezes (as duas sobre pouco), eu não respondi,
   ele calou-se — e a rodada seguinte trouxe **25 de dano, quatro golpes, zero
   perguntas**, e levou-me de **30 PV a 1 PV**. Isto é *regressão zero* e está
   correcto. **Mas a lição que o jogador tira não é essa.** A lição que ele tira
   é: *o jogo pergunta quando não importa e cala-se quando importa.*
4. **A janela 4 foi um «sim» que não deu nada.** Escolhi revidar, sob 12,5 s de
   relógio, com `chance: 0.55` escrita em lado nenhum do cartão — e o revide
   **errou**. Gastei a reação da rodada, o relógio e a atenção por uma frase.
5. **A janela 5 (`recusar`) foi a única tecla com consequência de verdade** — e é
   a única sem glifo, sem linha de log e sem número no cartão. Ver §4.

---

## 3 · os números de K3 — confirmo, e ele não exagerou

Corri a mesa dele sobre o código de hoje, **20 000 sementes**:

| o que K3 escreveu | o que K4 mede | veredito |
|---|---|---|
| **63 %** do dano chega sem pergunta | **62,42 %** | **confirma-se** — arredondou para cima meio ponto |
| **50,09 %** das perguntas são sobre um golpe que errou | **50,66 %** | **confirma-se** |
| **36,09 %** das janelas abrem no maior golpe | **35,54 %** | **confirma-se** |
| **98,60 %** das rodadas abrem janela (mesa A) | **98,51 %** | **confirma-se** |
| **75 %** sem pergunta no ladino solo | **75,24 %** | **confirma-se** |
| golpe perguntado **3,56** · coberto **5,86** | **3,52** · **5,85** | **confirma-se** |

> **K3 não exagerou em nada.** Todas as divergências estão dentro do ruído de
> 20 000 sementes, e a única que sai do ruído (63 vs 62,42) sai **contra** ele.
> A proposta que está com a pessoa está sustentada pelo número, e **K4
> confirma-a com o motor de hoje, numa semente diferente, num banco escrito do
> zero.**

**O que isso faz à proposta que está com a pessoa:** a variante (a) — *a janela
não abre num erro* — continua a valer e continua bloqueada pela asserção 05. A
variante (b) — *a janela abre no maior golpe* — continua bloqueada pela mesma.
**Mas K4 traz uma terceira porta que a trava não fecha, e está em §5.**

---

## 4 · o antes-e-depois da Fase K inteira

### 4.1 · o que o jogador não fazia

Em v9.266, **seis reações gastavam o PM dele sem lhe perguntar**
(`tentarReacaoNoGolpe`, hoje em `App.jsx:7813`). Medido: numa luta de 3,89
rodadas ele recebia **2,40 reações resolvidas pelo sistema** e **não tocava em
nada** no turno do inimigo. A frase de K1 continua verdadeira: *numa luta
inteira eu toquei três controles, com seis reações disponíveis e nada onde
tocar.*

### 4.2 · o que ele faz agora

Recebe **3,22 perguntas por luta** (mesa A) ou **3,64** (solo). Tem um verbo
armado com o preço escrito antes do primeiro toque, um recuo, quinze segundos
sem relógio nos primeiros onze, uma escada que o cala se ele não quiser, e uma
fila de quatro pílulas na ficha que lhe devolve **100 % do relógio** — a pílula
travada mede **0 s de espera e 0,0 % de acréscimo**, com o mundo idêntico.

E o mundo é idêntico: **100,00 % de 4 000 sementes, nas duas mesas, para quem
responde e para quem cala.**

### 4.3 · o que continua torto — e é preciso dizê-lo

1. **Expirar continua a gastar PM.** K3 escreveu-o (§3.1) e a trava obriga. No
   meu banco isso é invisível porque as reações do marcial e do furtivo custam
   0 PM — mas nas **cinco classes conjuradoras, 100 % das janelas oferecem um
   verbo de 2 PM**, e a expiração paga-o. A lei do PM continua meia, e agora
   sabe-se em quantas classes.
2. **O leque tem um item em 12 classes de 12.** `Etapa=Escolhendo` foi
   desenhada, fabricada, montada e **nunca abre**. É a peça mais cara da fase a
   não fazer nada.
3. **A pergunta é sobre o golpe errado**, e agora está confirmado duas vezes: no
   banco (62,42 %) e na tela (três rodadas seguidas).
4. **Quem cala paga 2,4× mais relógio do que quem responde.** A escada protege
   do número de perguntas e não protege do preço de cada uma.
5. **E o pior, que é meu e é novo:**

> **A única tecla do cartão que muda o mundo é a única sem glifo, sem log e sem
> número.** Medido: `recusar` leva o dano da luta de **13,13 para 21,67** (+65 %)
> e a morte de **13,7 % para 49,3 %** na mesa A; de 27,21 para 31,00 e de 85,2 %
> para **99,6 %** na mesa B. *Responder* e *deixar expirar* produzem mundos
> **idênticos** — 100 % das sementes. *Recusar* é a **única** das três que o
> jogador pode tocar para que alguma coisa aconteça de diferente.
> **E é a que o cartão trata como se não tivesse acontecido.** K3 decidiu bem ao
> não lhe dar linha de log (porta 10 de K2), e a decisão continua certa. Mas a
> ausência de glifo e de número foi justificada com *«não houve gesto»* — e o
> número diz que o gesto mais consequente do jogo é exactamente esse.

---

## 5 · o veredito sobre a batida

**Tensiona uma vez por luta, e cobra pedágio no resto dela.** Digo-o sabendo que
é a fase que a pessoa aprovou, que ela está bem construída e que eu escrevi
metade dela.

**O que a defende, e é real, e é medido:**

- **Custou zero ao mundo.** Nenhuma rodada, nenhum golpe, nenhum dado, nenhum
  ponto de vida. 100,00 % de identidade em 4 000 sementes pareadas. Isto é
  raríssimo e é a prova de que K2 valeu a pena.
- **A saída existe e é grátis.** A pílula na ficha devolve **0 s** e o mundo
  idêntico. Ninguém está preso à batida.
- **Quem responde depressa nunca vê um cronómetro.** Medido: 0 trilhos em duas
  respostas dentro do orçamento de K1.
- **+24,9 % de tempo de parede para quem joga** não é um desastre. É o preço de
  ter alguma coisa para fazer no turno do inimigo, e é defensável.

**O que a condena, e também é medido:**

- **84 % das rodadas de uma luta trazem pergunta** (98 % no solo). Não há rodada
  de descanso. *Um momento que acontece sempre deixa de ser um momento.*
- **Metade das perguntas é sobre um golpe que passou longe** (50,66 %).
- **Todas as perguntas têm um único verbo** (100 % em 12 classes), e em 7 das 12
  esse verbo **é grátis**. É a frase com que K1 matou `inimigo_cai`, cumprida ao
  pé da letra pela fase que a escreveu: *um diálogo de confirmação com relógio.*
- **62,4 % do dano chega em silêncio** (75,2 % no solo). O jogador vai aprender
  — com razão — que a pergunta não é sobre o perigo.
- **Quem não quer a batida paga 2,4× mais relógio do que quem a quer.** Isso é o
  contrário do que uma saída de conforto devia fazer.

> **O veredito, dito inteiro: a peça está certa e a pergunta está errada.**
> Não condeno a janela — condeno o que ela pergunta, com que frequência, e a que
> custo para quem não responde. **A Fase K construiu um momento excelente e
> apontou-o para o golpe que menos importa, 84 % das rodadas, com uma só
> resposta possível.** Se isto for a jogo como está, ao terceiro combate o
> jogador carrega sem ler — e uma janela que se responde sem ler é um imposto de
> um toque com quinze segundos de juro.
>
> **Não desligar. Corrigir.** Desligar a janela devolve o jogo em que o jogador
> não faz nada no turno do inimigo, e isso é pior. O defeito é reparável e o
> conserto está medido em §6.

---

## 6 · para a pessoa decidir

### 6.1 · a proposta ambiciosa — **a janela pergunta sobre a RODADA, não sobre o golpe**

Hoje o cartão diz *«O Remendo te acerta»* e oferece um verbo. A proposta é que
ele diga **de quem vêm os golpes desta rodada** e deixe o jogador escolher
**onde** a reação cai.

**O número, corrido em 20 000 sementes:** o golpe perguntado faz **3,52** de
dano; o maior golpe da rodada faz **6,15** (mesa A) e **7,72** (solo). Se o
jogador puder pôr a reação no golpe que quiser:

| | hoje | com a escolha |
|---|---|---|
| dano do golpe perguntado (mesa A) | 3,52 | **6,15** — **×1,75** |
| dano do golpe perguntado (solo) | 3,53 | **7,72** — **×2,19** |
| **dano que chega sem pergunta (mesa A)** | **62,42 %** | **33,37 %** |
| **dano que chega sem pergunta (solo)** | **75,24 %** | **45,87 %** |

**Nenhuma outra mudança desta fase move esse número.** E cai, de lambuja, o
defeito do `inimigo_erra`: se a rodada tem um erro e um acerto, o jogador
escolhe o acerto — sem precisar de uma regra que proíba perguntar no erro.

**E — o ponto que resolve o obstáculo em que K3 tropeçou: a trava de K2 NÃO
proíbe isto.** A asserção 05 exige `abre.ordem <= ordemDaReacaoDeHoje`, e esta
proposta **não toca em `abre.ordem`**: a janela continua a abrir exactamente no
golpe onde abre hoje. O que muda é **onde a reação cai quando o jogador
responde**. Quem não responde continua a resolver por
`reacaoDoSilencio({ desde: abre.ordem })`, byte a byte, e a identidade de
100,00 % que medi em §1.4 **fica de pé**.

> *A trava soldou a ordem da PERGUNTA à ordem dos golpes. Ela nunca soldou a
> ordem da RESPOSTA.* K3 tentou mover a pergunta e bateu na asserção; a saída é
> mover a resposta.

**O que se perde, dito por mim, antes de a pessoa o descobrir:**

- **Quebra a lei de K3** *«quem responde resolve-se pelo MESMO caminho de quem
  não responde»*. Deliberadamente, e é isso que precisa da aprovação dela: o
  jogador que responde passa a ter um mundo **melhor** do que o de hoje. Quanto
  melhor está medido e é pequeno — a reação já é uma por rodada, e o que muda é
  **em que golpe** ela cai, não quantas há.
- **O dano deixaria de ser inteiramente segredo**, e a decisão de 15/09 foi que
  ele vem surpresa. **A saída é não mostrar número nenhum e mostrar quem:**
  `o Ogro · o arqueiro · o Ogro de novo` — três nomes, três toques, zero
  números. O jogador escolhe o inimigo, não a aritmética; o segredo do dano
  fica inteiro, e o número acima continua a mover-se, porque quem bate mais
  forte tem nome e o jogador aprende-o em duas lutas. **Isso é jogo, e é o
  contrário de contabilidade.**
- **`Etapa=Escolhendo` passa a abrir**, e a peça que custou um ciclo e nunca fez
  nada ganha o trabalho para que foi fabricada. `ATALHOS_DA_JANELA` já tem a
  linha `escolher` (`ArrowDown/ArrowUp + Enter`) e ela é hoje **letra morta**.
- Custo de construção: `reacaoDoSilencio` ganha um irmão que resolve num golpe
  escolhido. `PALAVRAS_DA_RESOLUCAO` **não muda uma linha**.

### 6.2 · a segunda, mais barata — **a escada tem de CORTAR antes de calar**

**Medido:** quem cala paga **30,9 s** por luta contra **13,0 s** de quem
responde. A primeira expiração custa os **15 000 ms inteiros** e compra **zero**
— o sistema resolve exactamente o que resolveria; provei-o duas vezes na tela.

**Proposta:** depois de **uma** expiração, a janela seguinte nasce **sem folga** —
só o trilho (4 600 ms). Um degrau novo em `ESCADA_DO_SILENCIO`, lido da tabela
como os outros dois.

**A conta:** 15 600 + 4 600 = **20,2 s** para as duas janelas, contra os 30,9 s
medidos — **−35 %** de relógio para exactamente a pessoa que a escada existe
para proteger. E **quem responde não sente nada**, porque o contador zera na
primeira resposta. *A folga de onze segundos é para quem está a decidir; quem já
demonstrou que não decide não precisa dela para não decidir outra vez.*

### 6.3 · a terceira, e esta é só palavra, logo é minha

**O cartão mente por omissão sobre o preço do `sim`.** `revidar · 0 PM — na
mesma batida` diz que não custa nada, e custa a reação da rodada — medido:
quando a janela abre num erro, a rodada ainda traz **5,85** de dano (mesa A) que
vai chegar coberto **porque a reação já foi gasta no revide**.

A palavra que eu escrevo, dentro do orçamento de 40 caracteres de K1 (38):

> `revidar · 0 PM — e a guarda fica aberta`

Não diz reação, não diz rodada, não diz recurso. Diz o **efeito**. E o
`contra_ataque` tem `chance: 0.55` que o cartão também cala — a janela 4 da
minha sessão foi um «sim» que errou. **`PALAVRAS_DA_CHANCE` já existe e já sabe
escrever o risco na fenda do preço; ela só não é lida por este caminho.** Isso é
dívida de fiação, não peça nova.

### 6.4 · e a de K3 que continua de pé e continua grátis

**Escrever no campo de texto fecha a janela** (`k3-jogo.md` §6.2). Devolve até
15 s por rodada a quem joga a escrever, é grátis pela trava ([T2] garante que o
resultado não depende do instante), e continua por fazer.

---

## o que ficou feio, e o que eu não soube

**Feio, e assumo:**

- **Não consegui responder a uma janela com o rato de verdade dentro dos 15 s.**
  Cada chamada da minha ferramenta custa 5–8 s de rede; duas seguidas estouram a
  janela, e foi assim que a janela 2 expirou contra a minha vontade. **As duas
  respostas e a recusa que medi (§2.1) foram cliques de DOM agendados dentro da
  própria página** — `button.click()` no botão real, aos 4 038, 12 501 e 3 000 ms
  do nascimento do cartão. O `onClick` que correu é o do jogo, o caminho é o
  caminho, e os tempos são reais. **Mas não é uma mão humana, e a diferença tem
  nome.** *A janela de quinze segundos é generosa para uma pessoa e curta para
  uma máquina que fala por rede* — o que também é um dado sobre quem joga em
  ligação má, e eu não o sei medir.
- **Perdi uma luta em curso.** Recarreguei a página no meio da luta 1 para zerar
  a escada do silêncio, e o combate não voltou: caí no menu da Noite. **Nenhum
  save se perdeu** (os cinco espaços estão byte a byte, §0), mas a luta
  perdeu-se. Não investiguei porquê e não digo que é defeito — digo que vi.
- **Não vi a linha `PM {saldo}` do cartão.** As cinco janelas que joguei eram
  todas de 0 PM, e o saldo só aparece quando alguma reação oferecida custa PM.
  **A peça que o `desenho` fez em K3 para fechar a colisão do telefone ainda não
  foi vista viva por ninguém** — e ela só existe para as cinco classes
  conjuradoras, que são exactamente as que a expiração faz pagar.

**Não soube:**

- **Não joguei quatro inimigos vivos.** O Torneio é 1v1, como em K3, e as duas
  lutas foram contra um elite (2 golpes por rodada). **Todos os números de 4
  comuns são de varredura em Node**, e eu digo a diferença em vez de a esconder.
- **Não medi ninguém a responder.** Os 4 030 ms são o orçamento que K1 mediu
  (1,5 s de reconhecer + 0,513 s de Fitts, dobrados), e eu usei-os como
  **modelo**. O que eu medi foi o que o relógio **impõe** (15 013 ms) e o que
  cada desfecho custa quando acontece. *Quantas reações o jogador de facto
  escolhe continua sem resposta, e continuará sem ela até haver telemetria ou
  alguém que não seja eu a jogar.*
- **O turno do herói no banco é um modelo**, não o `App.jsx`: um ataque por
  rodada por `resolverAtaque` + `danoDaClasse`, e os companheiros pelo
  `turnoDosCompanheiros` real. Isso muda quantas rodadas a luta dura. **É por
  isso que toda comparação é pareada contra ela mesma, na mesma semente, com e
  sem cartão** — o par vale; o absoluto de «3,89 rodadas» é do meu modelo.
- **Não sei a que combate a fadiga chega.** K3 disse «ao terceiro» sem medida, e
  eu continuo sem a medir — mas agora sei o que ela mede: **3,22 perguntas por
  luta, 84 % das rodadas, um verbo grátis cada**. Se alguém quiser o número, é
  uma sessão de jogo com uma pessoa a sério, e isso não é um banco de prova.
- **Não sei o que acontece no telefone.** K3 mediu a colisão a 375 px e o
  `desenho` fechou-a com o teto e o saldo; eu joguei a 560 px e não voltei lá.
