# A temperatura e os espólios — a planta da Fase TE

*09/11/2026 · conselheiro · a ideia é da pessoa; a planta é minha. Não há código aqui.*

**A palavra da pessoa, resumida.** (1) *«uma missão que diz que o vilão se apresenta não vem
depois de uma missão que o vilão ainda não foi apresentado… uma missão quente e depois uma
missão fria… temos que ter o tipo de "calor" dela… pra ter controle de quais missões são
melhores para abrir e quais são melhores pra terminar uma história»*, e isto vale também para o
tipo 2. (2) *«os espólios, tanto possíveis achados no caminho quanto recompensas, itens que façam
valer a pena a busca… além da ótima história ele precisa da recompensa e da sensação de ficar
mais forte».*

**A régua das duas partes** é a da casa: o Mestre é código. A temperatura é uma tabela que a
suíte lê de volta; o espólio é um número que sai de tabela, pela semente, e cuja força a régua
de combate prova. O Narrador não escolhe a ordem nem inventa o prémio.


## As decisões da pessoa (09/11/2026) — valem sobre o resto desta planta

1. **Os itens com nome:** dois artefactos do enredo e até duas lembranças dos companheiros por campanha. **As 10 relíquias únicas** entram como prémio raro de um confronto final.
2. **O achado escondido espera até a quest fechar:** o herói pode voltar a buscá-lo enquanto ela estiver aberta.
4. **O som (09/11): sim, ligado por omissão e em volume baixo**, com o interruptor à vista no menu. Sintetizado (Web Audio, sem ficheiros). Começa em três momentos só: a carta que vira (uma nota por raridade), o dado que pousa, o artefacto que desperta. Mais, só depois de ouvido.
5. **A carta virada no Diário (09/11): sim, só metade** — a carta de costas com a luz da raridade que a quest pode pagar. **Não** a tabela dos caminhos com a peça de cada um: o jogador escolhe o caminho pela história e descobre o prémio no fim.
6. **A lenda que a arma escreve (09/11): sim** — uma linha gravada no artefacto por feito marcante, **saída dos factos que o sistema regista** (o livro de factos, os desfechos das quests), nunca do Narrador; teto de cinco linhas, as mais marcantes. Campo novo e aditivo no item.
3. **O nome «temperatura»** e os graus brasa → chama → fogueira → incêndio ficam (proposta do coordenador; ela pediu «calor ou algum nome que você ache melhor»).

---

## Parte 1 · A temperatura

### 1.1 O que já existe (e o que está vazio)

| peça | onde | estado |
|---|---|---|
| `quando` (cedo, meio, fim) | cada ficha; `QUANDO_DO_ATO` em `esqueleto.js` | lido pelo esqueleto. É **posição**, não intensidade |
| `pede` / `deixa` da ficha («tipo:papel») | cada ficha; `preencher` e `aceitar` em `esqueleto.js` | **0 de 52 fichas usam `pede`.** Os 38 `deixa` escrevem para uma lista (`S.deixado`) que ninguém lê |
| o efeito `deixa` (a premissa em jogo) | `EFEITOS_DA_QUEST.deixa` → `espinha.quests.premissas` | **110 escritas, de 52 tipos diferentes** (`rasto`, `pacto`, `vinganca`, `caiu`…), e **zero leitores**. É um sinal dormente cujo tracker já existe |
| as camadas do vilão | `FASES` (`vilao.js`), `SOBE_A_CAMADA`, `CAMPOS_DA_CAMADA`, `camadaDoVilao` (`plano-do-vilao.js`) | vivas: sobem pelo facto, e o texto do Narrador já é filtrado por elas |
| o nome do herói na boca dele | `sabeONome(registro, saber)`, `REACOES_DO_VILAO` | vivo |
| a confiança do companheiro | a condição `afeicao` (BQ3), `MARCOS_VINCULO` | viva. **As 16 do tipo 2 pedem `afeicao 2` na 1.ª etapa**, mas nenhuma pede nada para **abrir** |
| a composição dos atos | `COMPOSICAO_DA_MAO`, `PASSO_DO_ATO`, `JANELAS_DO_CORACAO` | a ordem tenente → recurso → pista → rosto → confronto já é uma curva de calor implícita |
| a abertura | `quests-do-turno.js#correr`, passo 1 | abre tudo o que é do ato **no primeiro turno do ato**, sem portão. O tipo 2 da janela 0 abre **antes do primeiro turno** |

**O tipo 2 não tem temperatura nenhuma:** as 16 fichas dizem `quando: ["cedo","meio","fim"]`, e
na janela 0 o esqueleto sorteia entre elas por igual (medido: de 48 a 75 aberturas cada uma em
1000 mundos). *O Juramento à Cabeceira* (uma promessa de sangue) abre no dia 1 tantas vezes como
*Quarenta Invernos*.

### 1.2 As medidas, com o esqueleto de hoje

Mil mundos, o mesmo construtor de `teste-esqueleto.mjs` (`Esqueleto|i`, as quatro espinhas, metade
com companheiro): 500 de 4 atos, 250 de 5, 250 de 6. Os scripts ficaram no scratchpad desta sessão.

| o que se mediu | campanhas em 1000 |
|---|---|
| uma quest com mão `rosto` **antes do ato do rosto** (sempre *Os Dados Dele*, no ato da pista) | **35** |
| duas quests de «primeiro encontro» com ele (`deixa conhece:vilao`) na mesma campanha | **35** (as mesmas) |
| uma quest que diz «com o teu nome» sem ele saber o nome (*Os Dados Dele*) | **154** |
| um tipo 2 que **abre no turno 0** com um gancho que pressupõe convivência (§1.4, grupo B) | **492** |
| um tipo 2 que abre no turno 0 e que eu classifico como `fogueira` | **315** |
| o vilão a usar a cara do herói (*O Teu Nome na Parede*) sem nada que diga que ele sabe quem é | **142** (a medir em jogo: o tracker existe) |
| a curva do tipo 1 com alguma descida (com as temperaturas provisórias de §1.5) | 133 |
| … com descida funda (dois graus) ou duas descidas | 7 |
| … fora da `CURVA_DA_TEMPERATURA` proposta (§1.3) | 111 (37 se o ato 0 de seis atos aceitar `chama`) |
| atos sem quest (caem no marco antigo) | 3 atos em 4750 |

**A leitura:** a composição pela mão já faz quase toda a curva — 87% das campanhas sobem sem
descer. O que parte a ordem não é o tipo 1: é **o tipo 2 sem portão** (metade das campanhas) e
**uma ficha com duas mãos** (*Os Dados Dele*). O calor resolve-se com pouco; o pressuposto é que
é a obra.

### 1.3 O desenho

**`TEMPERATURAS`** (em `biblioteca-de-quests.js`, ao lado de `QUANDO_DA_QUEST`):

| id | ordem | o que é | exemplo |
|---|---|---|---|
| `brasa` | 0 | o lugar, uma pessoa, o rumor; ninguém do vilão à vista | O Celeiro de Inverno |
| `chama` | 1 | a mão dele age; morre gente; um servo tem cara | O Salvo-Conduto |
| `fogueira` | 2 | a obra dele à vista, a fraqueza, o rosto | O Convite Sem Selo |
| `incendio` | 3 | tudo em jogo: o confronto | O Cimo da Escada |

Cada ficha ganha **um** grau (`temperatura`), nunca uma lista: o `quando` continua a dizer *onde*
ela cabe, a temperatura diz *quanto ela aquece*. Para não se contradizerem, **`TEMPERATURA_DO_QUANDO`**
é a catraca: `cedo` aceita brasa e chama; `meio`, chama e fogueira; `fim`, fogueira e incêndio.
`validarQuest` recusa a ficha fora dela.

**`CURVA_DA_TEMPERATURA`** (em `esqueleto.js`, ao lado de `PASSO_DO_ATO`), o intervalo de cada
ato por número de atos:

| atos | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 4 | brasa–chama | chama–fogueira | fogueira | incêndio | | |
| 5 | brasa–chama | chama | chama–fogueira | fogueira | incêndio | |
| 6 | brasa–chama | brasa–chama | chama–fogueira | chama–fogueira | fogueira | incêndio |

**`RESPIRO`**: no máximo **uma** descida, de **um** grau, e nunca nos dois últimos atos (o
respiro é o ato que deixa o jogador sentar-se antes do penúltimo; é a «subida com patamares» da
estrutura em três atos). O tipo 2 segue a sua janela: a da janela 0 é **no máximo `chama`**; a da
última janela pode ser qualquer uma.

**`pressupoe` e `estabelece` — e aqui não se duplica nada.** O vocabulário já existe: são as
**condições da BQ3** (`condicoes-da-quest.js`, `avaliarCondicao`, `faltaDe`, `escritoPor`). Um
pressuposto é uma condição; o que muda é **quando** se avalia (antes de a quest existir) e
**quem** a garante. Faltam três predicados, e os três têm tracker vivo:

| predicado novo | lê | quem o escreve hoje |
|---|---|---|
| `camada <fase>` — a revelação já chegou a esta camada | `registro.camada` | `camadaDoVilao` |
| `sabe_nome` — ele já sabe o nome do herói | `registro.nomeDoHeroi` / `saber` | `sabeONome`, `REACOES_DO_VILAO` |
| `convivencia <dias>` — o companheiro anda com o herói há N dias | o dia em que foi visto (`elenco`, `registrarVisto`) e o `desde` do laço | `juntarCompanheiroInicial`, `firmarLaco`. **Quem o herói conhece de antes da campanha (`lacoDeAntes`) passa logo:** para esse, o passado partilhado é verdade no dia 1 |

`estabelece` é a lista do que a quest garante **quando fecha**: hoje já está espalhada pelos
`deixa` da ficha e pelos 52 tipos do efeito `deixa`. A TE fecha esse vocabulário em
**`PRESSUPOSTOS`**: cada premissa que uma quest escreve passa a ter **pelo menos um leitor** (um
`pressupoe` de outra quest, uma condição de reviravolta, ou uma linha da pauta) **ou sai**. É a lei
«export morto mente» aplicada a dado — a catraca entra na suíte da biblioteca.

**O esqueleto passa a ordenar por duas coisas, nesta ordem:**
1. **o grafo:** uma quest só entra num ato se cada `pressupoe` dela é *garantido por construção*
   — pela camada mínima do ato (`CAMADA_DO_ATO`: depois do ato do rosto vale `rosto`; depois do
   primeiro ato com mão `tenente`, vale `mao`) ou pelo `estabelece` de uma quest de ato anterior;
2. **a curva:** entre as que passam, só as do intervalo do ato; o `RESPIRO` conta.

E uma regra de mão, que fecha os 35: **a mão `rosto` só cai no ato do rosto** (o `tambem` não a
leva para outro ato).

**O portão da abertura (`PORTAO_DA_ABERTURA`).** O que o esqueleto não garante por construção — a
convivência, o nome — espera **em jogo**: `correr` (passo 1) só abre a quest quando os `pressupoe`
dinâmicos valem, e até lá ela fica `à espera` (estado novo do registo, aditivo). O teto: se em
`ESPERA_MAXIMA` turnos não abrir, o tipo 2 dá lugar ao seguinte da mesma janela; o tipo 1 nunca
espera (um ato não pode ficar sem enredo) — o tipo 1 só leva pressupostos que o esqueleto garante.

**O que o Narrador recebe:** nada a mais. A temperatura **nunca** aparece na tela nem na pauta
pelo nome (o sistema não fala de si mesmo). Se a TE5 provar que ajuda, uma palavra de tom entra
**dentro** da linha «O PASSO» que já existe, sem subir o teto dela (220).

### 1.4 A auditoria das 52 fichas

Lidas por script (os textos de gancho, etapas, escolhas, soluções, reviravoltas, falhas e
fechos) e conferidas uma a uma. **14 quests têm um texto que pressupõe o que pode não ter
acontecido; mais 6 estão certas mas devem declarar o pressuposto**, para a catraca as guardar.

**A · o vilão antes da hora**

| quest | o que pressupõe | campanhas | correção |
|---|---|---|---|
| Os Dados Dele | mão `rosto` com `tambem: pista` e `contra [4,5]`: cai no ato da pista, antes do rosto, e a campanha tem **dois primeiros encontros** | 35 | regra da mão (§1.3) e `temperatura: fogueira`. A ficha não muda |
| Os Dados Dele | o recado vem «com o teu nome por fora»: ele saber o nome é uma **reação** dele, não um dado | 154 | **texto**: o recado vem com a alcunha que os dele lhe dão (`LINHA_DO_VILAO.alcunha`, «o forasteiro de…»). Sem pressuposto |
| O Que a Ama Esqueceu | «uma criança que hoje **toda a terra teme**»: na camada `rumor` ninguém sabe de quem é a obra | 34 | **texto**: «que hoje anda por trás do que esta terra teme» |
| O Teu Nome na Parede | o servo veste as cores do herói e usa a cara dele: ele **sabe quem é o herói** | 142 | `pressupoe`: ele já ouviu falar do herói (o livro dele, `saber`, escrito por `avisa_vilao` e pelo tenente que fugiu). O esqueleto só a põe depois de uma quest que o estabelece |
| A Lâmina Enterrada (rev. 1) | «um nó que **já viste** noutros sítios»: é a assinatura dele, camada `marca` | — | **gatilho** + `camada marca` |
| O Sangue do Outro Lado (gancho) | «a fita de quem serve a mão por trás de tudo»: quem reconhece a fita é o herói, e isso é a camada `marca` | 65 abrem no ato 0 | **texto**: a fita é memória do companheiro («a mesma fita de quem entrou em casa naquela noite»), não saber do herói |
| O Fundo da Pedreira | «na mesma noite em que **se cumpriu** o que andava a ser preparado»: o passo 3 cumprido. Não há garantia: o relógio é dinâmico | não medido | **texto**: tira o laço ao relógio («na noite em que as carroças de fora partiram cheias»); a ligação ao plano já é a mão `consequencia` |

**B · o tipo 2 que finge um passado partilhado** (abrem no turno 0 em 492 campanhas)

| quest | a frase |
|---|---|
| O Morto Que Voltou a Casa | «Disse-to **no primeiro dia**, e nunca mais falou disso» |
| O Juramento à Cabeceira | uma frase dita «**todas as noites**… Julgavas que era uma oração» |
| A Lâmina Enterrada | «Nem quando devia, **nem quando gritaste**» |
| A Cabeça Que Não Se Baixa | «Em **todas as tabernas por onde passam**» |
| As Cartas de Outra Casa | «recebe cartas que **não lê à tua frente**» |
| A Palavra Dada a Um Enforcado | «**Dá a volta** de um dia para não passar lá» |
| A Última Lição | «**sempre disse** que foi um acidente» |
| O Que o Tio Deixou | «riu-se **como nunca o tinhas visto rir**» |

**Correção, uma para as oito:** `pressupoe: [["convivencia", 3], ["afeicao", "papel:quem", 1]]`
pelo portão da abertura. O texto fica — é bom, e passa a ser verdade. As outras oito do tipo 2 têm
ganchos que se aguentam no dia 1 (uma carta que chega, um recado, uma tosse).

**C · pequenos**

| quest | o quê | correção |
|---|---|---|
| As Chaves da Guarda (`cedo`) | «pôs-te as chaves na mão à frente do conselho»: confiança que o herói ainda não ganhou | **texto**: dizer porquê («ninguém mais aceita, e tu és quem está na sala»). Coincide com *O Posto do Capitão Morto* em 1 campanha em 1000: sem ação |

**D · certas, só a declarar (para a catraca as guardar)**

- *As Pegadas no Barro*: o fecho diz «Ainda não lhe viste a cara» — certo enquanto ela vier antes
  do rosto (hoje sempre). Declarar `pressupoe: nenhum camada rosto`.
- Os cinco confrontos (*O Cimo da Escada*, *A Hora Marcada*, *O Fundo da Toca*, *A Nona Noite*, *O
  Último Barco*): pressupõem o rosto visto. Declarar `camada rosto`; o esqueleto já o garante.
- **O exemplo a seguir:** *O Fundo da Toca* (rev. 0) e *A Nona Noite* (rev. 2) dizem «da outra
  vez», e estão certas: o gatilho pede `relacao vilao aliado`, que só existe se o herói pagou o
  tributo antes. O pressuposto já mora na condição — é isto que a TE generaliza.

### 1.5 A temperatura provisória das 52

Por leitura do gancho e da mão. **A TE1 confirma com a leitura humana** (`mente/leitura-bq-lote-*.md`).

- **brasa (7 + 2):** O Celeiro de Inverno, O Pão Que Sai de Noite, As Chaves da Guarda, Os Braços
  Que Faltam, O Livro dos Nomes, O Que Desce ao Anoitecer, As Botas na Estrada · *tipo 2:* A Vida
  Que Se Deve, Quarenta Invernos.
- **chama (12 + 9):** O Salvo-Conduto, A Barca a Meio do Rio, A Torre do Sino, As Mãos Que Curam,
  As Cinzas de Ontem, O Último a Sair, O Enforcado de Amanhã, A Rua Que Não Acorda, As Pegadas no
  Barro, A Estalagem do Temporal, O Posto do Capitão Morto, O Recado Verdadeiro · *tipo 2:* A Carta
  Que Não Se Abre, A Vigia Trocada, Os Dias Que Faltam, A Farda Debaixo do Colchão, O Sangue do
  Carrasco, O Que o Tio Deixou, As Cartas de Outra Casa, A Cabeça Que Não Se Baixa, A Última Lição.
- **fogueira (12 + 5):** A Mão Que Mudou de Lado, O Fundo da Pedreira, As Duas Fogueiras, O Teu
  Nome na Parede, As Armas do Poço, O Que a Ama Esqueceu, Os Dados Dele, O Convite Sem Selo, O
  Velório Pago, À Luz do Dia, Do Outro Lado do Vau, A Mesma Tempestade · *tipo 2:* A Lâmina
  Enterrada, A Palavra Dada a Um Enforcado, O Sangue do Outro Lado, O Juramento à Cabeceira, O Morto
  Que Voltou a Casa.
- **incêndio (5):** os cinco confrontos.

**O acervo fica magro no calor de abrir:** só 7 do tipo 1 são `brasa`, e todas `cedo`. Para que
o ato 0 não se repita, o próximo lote do acervo pede **brasas** (o alvo: 12).

---

## Parte 2 · Os espólios

### 2.1 O censo

| peça | onde | o que faz |
|---|---|---|
| raridades | `RARIDADES` (`loot.js`, `comparar-item.js`), `DEGRAUS` (`afixos.js`), `COR_DA_RARIDADE` (`estilo.js`) | comum → incomum → raro → épico → lendário → **único**. Cada degrau compra poderes (`quantos`, `forte`, `concede`) |
| o item sorteado | `gerarLoot(raridade, {tipo, nivel, rnd, lex})` | base + prefixo + sufixo; o bónus sobe +1 a cada 5 níveis (teto +3); aceita `rnd` (determinístico) |
| as relíquias (o único) | `relicas.js`, `RELIQUIAS` — **10** peças escritas à mão, com história, passivos próprios e um gesto 1×/dia | **só entram pelo modo deus** (`/relica` no `App.jsx`). Nenhuma porta de jogo |
| a sintonia | `sintonia.js`, `MAX_SINTONIA = 3` | o que tem poder pede sintonia; três de cada vez. **Já é um teto de poder** |
| o espólio da luta | `gerarEspolios` (`combate.js`: moedas e chance de item por ameaça), `gerarEspolioItem`, `raridadeDeAmeaca`, `essenciaDeEspolio`; XP por `xpDeCombate` (`juiz.js`: fração do vão, uma luta equilibrada ≈ 1/7 de nível) | o item cai **no chão** (`chao.js`) e espera que o herói se baixe |
| a forja | `CUSTO_FORJA`, `ESSENCIA_POR_RARIDADE`, `RARIDADES_FORJAVEIS` | o único não se forja nem se desmonta |
| o mercado | `mercado.js` (`gerarMercador`, `precoDaBanca`, com `rnd`), `economia.js` (`PRECO_VENDA 0,5`, `FAIXA_COMPRA`), `comercio.js` (a pechincha), `valorDe` (comum 8 · incomum 33 · raro 94 · épico 209 · lendário 396) | |
| a missão antiga | `recompensaDe` (`missoes.js`): moedas `(25 + 12·nível)·peso`, XP cru, **item só nas grandes** (incomum < 6, raro 6–11, épico 12+) | paga no fecho (`depois-do-turno.js`) |
| a comparação | `compararItem`, `rotuloDoEquipar`, `podeTrocarAgora` (`comparar-item.js`, `itens.js`) | o veredito antes do clique já existe para equipar |
| a subida | `aplicarNivel`, `XP_ACUMULADO` (a do PHB), `GRAUS` do Juiz (`marco` = 1/7 do nível, pelo sinal `feito` do Narrador) | |

### 2.2 O que um herói ganha hoje numa quest da BQ

**Por código, nada.** Nas 52 fichas há **3 ganhos de moedas** (25, 40 e 80) e **8 custos** (de −40
a −100). Nenhuma quest dá XP, nenhuma dá item, nenhum achado no caminho. O XP de uma quest só
chega se o Narrador mandar `feito: marco` no turno do fecho — é a imaginação a pagar, que é o
contrário da casa. Uma missão antiga do mural, no nível 3 com quatro etapas, paga **~174 moedas,
~269 XP e um item incomum**. A quest que a pessoa desenhou para ser o coração do jogo paga menos do
que um contrato de mural. **É o maior buraco desta planta.**

### 2.3 O desenho

Um módulo puro novo, **`src/espolios-da-quest.js`**, que lê a ficha, o registo e a ficha do herói, e
devolve o que se ganha. Não aplica nada: a fiação aplica pelas portas que já existem (`gerarLoot`,
`aplicarNivel`, `porNoChao`). **Toda a sorte sai de `dadoDo(semente, "espolio", quest, etapa,
ramo)`** — a mesma campanha dá os mesmos achados, em qualquer máquina, jogue-se em 20 turnos ou em 40.

**Os achados no caminho (`ACHADO_DO_SITIO`, `ACHADOS_DA_QUEST`).** Por etapa, ligados ao **tipo do
sítio** do papel `lugar` dela (os tipos de `mundo-base.js` — o templo dá um relicário ou um
pergaminho, o cemitério uma lâmina enterrada, as docas um anzol de prata, a taverna uma dívida
escrita) e à **solução**. Duas portas para achar:
- **explorar** — as fichas já têm sítios opcionais (o `desvio` do Salvo-Conduto, o `registo` das
  Pegadas): `esteve` ou `descobriu` lá dá o achado escondido. Ninguém diz que existe;
- **escolher bem** — o ramo tomado dá o achado da sua família (abaixo).
No máximo **um achado por etapa e um equipamento por quest**; o resto é consumível, componente,
moeda ou uma chave de outra coisa. O achado cai no chão (`chao.js`), como o espólio da luta.

**As recompensas por desfecho (`FAMILIA_DO_RAMO`, `RECOMPENSA_DO_DESFECHO`).** Os ramos das fichas
(violenta, lâmina, luta, social, palavra, portagem, furtiva, desvio…) agrupam-se em quatro famílias,
e cada família paga diferente:

| família | ramos | paga |
|---|---|---|
| `ferro` | violenta, lâmina, luta | o item de combate (arma, armadura, escudo) do degrau da temperatura |
| `palavra` | social, palavra, portagem, acordo | +50% de moedas, um favor (`favor` já existe) e o desconto num mercado da cidade |
| `sombra` | furtiva, desvio, roubo | um acessório (anel, amuleto, botas) e um achado a mais |
| `saber` | o resto (descobrir, ler, curar) | +25% de XP e um consumível raro ou pergaminho |

A família que conta é a **do ramo que fechou a etapa da mão** (a do tenente, a do rosto, a do
confronto); a falha e o abandono pagam só o XP de `brasa`.

**A curva de poder (`PAGA_DA_QUEST`).** XP como **fração do vão do nível**, pela régua do Juiz
(`vaoDoNivel × fração × pressaDoNivel`, a mesma de `xpDoFeito`), e moedas como múltiplo da base de
missão (`25 + 12·nível`):

| temperatura | XP (do vão) | moedas (× base) | item (`RARIDADE_DA_TEMPERATURA`) |
|---|---|---|---|
| brasa | 1/12 | 1 | nenhum (só achados) |
| chama | 1/8 | 1,5 | incomum |
| fogueira | 1/6 | 2 | raro |
| incêndio | 1/4 | 2,5 | épico (o artefacto com nome) |
| tipo 2 | pelo desfecho: 1/8 no melhor, 1/12 no meio, 1/20 no pior | 0 | a lembrança (abaixo) |

Uma campanha de cinco atos dá perto de **um nível só pela história** (1/12 + 1/8 + 1/6 + 1/6 + 1/4
≈ 0,8, mais o coração), e as lutas dão o resto, como hoje. **A paga da quest substitui o `feito` do
Narrador no turno do fecho** (as duas economias para a mesma coisa são como a divergência nasce,
`regras-jogo.js`). O teto das moedas é o `tetoDoPresente` do Juiz (3× a base), que fica a catraca.

**A raridade e o orçamento (`TETO_DE_RARIDADE_DO_NIVEL`, `ORCAMENTO_DO_ESPOLIO`).** O degrau da
temperatura é limitado pelo nível, na régua do *Dungeon Master's Guide* (2014, cap. 7, a tabela
«Magic Item Rarity»: incomum a partir do 1, raro do 5, muito raro do 11, lendário do 17):
incomum 1–4, raro 5–10, épico 11–16, lendário 17+. **O artefacto com nome pode passar o teto um
degrau** — é a exceção, e por isso é contada. Por campanha: no máximo **⌈atos/2⌉ itens raros ou
melhores** vindos de quests; **dois artefactos do enredo** (um na faixa da pista ou do rosto, um no
confronto); **até duas lembranças** do coração. A sintonia (três) continua a ser o teto do que
age ao mesmo tempo.

**O item com nome da quest (`ITEM_DA_QUEST`).** As 17 quests de fogueira e incêndio do tipo 1
ganham na ficha um campo `artefacto`: um **nome modelo com papéis** («A Lâmina de {tenente}», «O
Sino Calado de {torre}»), a **base** (que dá o encaixe e a forma, como `gerarLoot`), uma **história
de uma frase** montada com os papéis da campanha, e **poderes só do vocabulário que já tem leitor**
(`afixos.js` para os passivos, o gesto de `relicas.js#usarAtivo` para o ativo). Nada de campo de
efeito novo. E o artefacto **cresce** (`DESPERTAR_DO_ARTEFACTO`), à maneira dos *Vestiges of
Divergence*:

| estado | quando | o que ganha |
|---|---|---|
| adormecido | ao ganhar | um poder passivo |
| desperto | a próxima quest de fogueira ou incêndio concluída, ou +3 níveis | o segundo passivo |
| exaltado | o confronto concluído, ou +6 níveis | o gesto, uma vez por dia |

As 16 do tipo 2 ganham uma **lembrança** (a fita de luto, a carta que não se abre, o lenço da
tosse) — só nos desfechos da metade boa, com um passivo incomum do vocabulário de `afixos.js`. É
o que o herói leva da história do companheiro, e está na bolsa quando o companheiro já não está.

**Como se prova que um item não quebra a luta (`teste-espolios-da-quest.mjs` + `regua-combate.mjs`).**
A régua de combate de Uma Vida já trava o cenário `justo` entre 35% e 65% de vitória
(`teste-regua.mjs`). A TE estende-a com dois kits por nível: **o kit típico** (o que o mercado vende
na faixa média e o loot dá) e **o kit da história** (o típico mais a paga esperada de cada
temperatura até ali). A catraca é **de dois lados**:
- **sentido:** o kit da história vence o `justo` **pelo menos +3 pontos** acima do típico;
- **sem inflação:** **no máximo +12 pontos**, e **nunca acima de 70%** no `justo`.
E duas mais, sem combate, em 1000 campanhas simuladas: **≥ 80% dos itens de recompensa** têm pelo
menos uma linha positiva em `compararItem` contra o kit típico do nível (o artefacto com nome:
100%); e **nenhuma campanha** passa do `ORCAMENTO_DO_ESPOLIO`. *«Ficar mais forte»* passa a ser um
intervalo medido, não um adjetivo.

**O momento da recompensa.** O que é do **sistema**: `revelacaoDoEspolio(paga, ficha)` devolve a
**ordem** (moedas, XP, os itens por raridade crescente, o artefacto por último), a **comparação**
de cada item com o que está no encaixe (`compararItem`), se **pode equipar já** (`podeTrocarAgora`,
fora de luta) e o **rótulo do botão** (`rotuloDoEquipar`, «Equipar · CA 15→16»). O que é da
**tela** (fila do `desenho`, com o `jogo`): a carta que vira no fecho, a cor e a forma pela
`COR_DA_RARIDADE`, o som por raridade, o artefacto com a história numa linha, o «Equipar já» com o
veredito no botão. O achado no caminho usa o chão e o exame que já existem.

**O que o Narrador recebe.** Só pela pauta dinâmica, só no turno em que acontece: uma linha na
secção `momento`, teto 140, «O QUE O HERÓI LEVA: {nome} — {meia linha da história}». O veto («não
dês outro item nem moedas além destes») vai em `naoPode`. A prova da BQ7 fica: o pior caso da
pauta ≤ 1400, o prompt ≈ 82k.

**O save.** Só campo novo e aditivo: no registo da quest, `espolio: { achados: [ids], pago }`; no
item, `deQuest` e `artefacto: { estado }`. **Para nunca pagar duas vezes**, a chave da paga mora
em `aplicadas` (o mapa que `quests-do-turno.js` já guarda) — a TE9 confirma que a versão antiga o
preserva.

### 2.4 As referências

- **Os Vestiges of Divergence** (*Explorer's Guide to Wildemount*, Wizards of the Coast, 2020,
  cap. 6; e *Tal'Dorei Campaign Setting Reborn*, Darrington Press, 2022): armas de Exandria que
  passam de adormecidas a despertas a exaltadas à medida que o portador cresce. É o modelo do
  `DESPERTAR_DO_ARTEFACTO`: a peça é memória da campanha porque muda com ela.
- **Os itens com história do Matt Mercer** à mesa: o prémio quase nunca é «+1»; é a coisa de
  alguém, com nome e passado, e a cena de a achar vale tanto como o número. Daí a história de uma
  frase montada com os papéis da campanha (a lâmina *daquele* tenente).
- **O *Loot 2.0* do *Diablo III*** (Blizzard, patch 2.0.1, fevereiro de 2014): menos itens a cair,
  cada um melhor e mais ajustado a quem joga. É a razão do orçamento por campanha e da família do
  ramo: menos ruído, mais significado.
- **As descrições de item do *Dark Souls*** (FromSoftware, 2011): o objeto conta a história do
  mundo. É o que a lembrança do tipo 2 faz com o companheiro.
- **O *DMG* de 2014**, a tabela de raridade por nível (acima), para o teto.

---

## 3 · A migração (as campanhas em curso não partem)

- **A temperatura e os pressupostos são da ficha**, que é código: valem para todos no dia em que
  sobem. **O esqueleto já escolhido não se recompõe** — uma campanha em curso mantém a ordem dela.
- **O portão da abertura** só toca quests **ainda não abertas**; a que já abriu segue. Um tipo 2
  que ficaria à espera numa campanha em curso abre como hoje se a convivência já valer.
- **A paga** vale para as quests que fecharem depois da TE9; as já fechadas não pagam para trás (a
  chave em `aplicadas`).
- **Os itens que existem não mudam.** As campanhas sem esqueleto (as antigas) não veem nada disto.

## 4 · As etapas

Na pauta, «Fase TE». Uma por versão, no padrão da casa (módulo puro → fiação → suíte); a parte 1
anda primeiro porque é mais barata e conserta o que hoje já se vê.

## 5 · O que não sei

- **O dia em que o companheiro entra no grupo:** não há campo próprio; o mais perto é o dia em
  que o `elenco` o regista como visto (`juntarCompanheiroInicial` → `registrarVisto`) e o `desde`
  do laço. A TE2 confirma que um dos dois serve para todo o companheiro (o recrutado a meio
  também), e só se nenhum servir guarda um campo novo.
- **O passo cumprido na abertura da quest de consequência:** não medi; precisa de replay em jogo. A
  correção do texto da Pedreira dispensa a medida para essa ficha; as outras de consequência não
  falam do relógio.
- **Quantos níveis uma campanha de 30 turnos sobe hoje:** não medi. A `PAGA_DA_QUEST` está escrita
  em fração do vão para não depender disso; a TE11 mede.
- **Se `aplicadas` sobrevive à versão antiga:** a confirmar antes da TE9.
