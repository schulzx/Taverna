# O Mestre vivo e a quest que escuta

**18/11/2026 · desenho, ainda não aprovado para construir.** Substitui a parte do dado de
`as-pecas.md` (§3.4 e §5) e mantém o resto. Nasce de três falas da pessoa:

> *«Queremos um sistema bem definido com as quests em trilhos, mas o mestre vivo: ele precisa
> entender a situação e pedir o dado conforme a ação e o contexto do player, e não da quest.»*
>
> *«Se nosso mestre estiver apto e treinado como um grande mestre deve ser, ele pega qualquer
> momento, independente da quest, e decide se aquilo vale ou não uma rolagem.»*
>
> *«Devemos usar sessões reais de grandes mestres e grandes campanhas para entender e treinar nosso
> mestre com casos reais.»*

## 1. O princípio

Duas camadas, e nenhuma manda na outra.

| | o que faz | o que **não** faz |
|---|---|---|
| **O Mestre** | lê a frase e o momento e decide se vale uma rolagem, qual, contra que número e a que preço | não sabe que existe uma quest |
| **A quest** | escuta o que aconteceu no turno e, se aquilo é uma das soluções da etapa, anda | não pede dado, não muda dificuldade |
| **O mundo** (a ponte) | guarda o estado da cena: quem está, o que cada um quer e esconde, o que está trancado, vigiado, com pressa | — |

A quest só alcança o dado **pelo mundo**: ela arruma a cena (a testemunha tem medo, o guarda
desconfia, a porta está trancada) e o Mestre lê essa cena como leria qualquer outra.

A ordem dentro de um turno:

```
frase do jogador
   └▶ O MESTRE: vale rolagem? ──não──▶ acontece (narra-se)
                    └─sim──▶ o chamado (perícia, número, preço) ▶ o dado ▶ o resultado
   └▶ O MUNDO aplica o resultado (fato, preço, estado da cena)
   └▶ A QUEST escuta: (ação, alvo, lugar, resultado)
          ├─ é solução da etapa ──▶ escreve o fato, a etapa fecha ou segue a seta
          └─ não é ──▶ aquecimento: esquenta, planta a pista, gasta o relógio
   └▶ O NARRADOR conta o que já foi decidido
```

## 2. O Mestre de hoje, medido (v9.658)

| medida | resultado | fonte |
|---|---|---|
| frases já vistas: intenção certa | 240 de 258 (93%) | `teste-corpus-das-situacoes`, metade A |
| **frases nunca vistas: intenção certa** | **176 de 240 (73%)** | idem, metade B |
| frases nunca vistas: perícia certa | 133 de 193 (69%) | idem |
| pede dado onde não devia (frases novas) | 3 de 47 (6%) | idem |
| declarações fora da luta seguidas de dado | nós 4,3% · mesa real 26,5% | `mente/estudo-do-mestre.md` §2, linha 1 (medido em 10/11; refazer) |

Três lacunas de estrutura, lidas no código:

1. **A conversa tem outra conta.** `QUANDO_O_MESTRE_CHAMA` (`src/motor/o-mestre-chama.js`) cala o
   chamado para tudo o que o catálogo marca como social: convencer, fazer falar, impressionar,
   intimidar, enganar. Elas seguem pela escada do pedido (`src/social.js`), que é boa — seis tamanhos
   de pedido, de «cortesia» a «traição», mais a linha do que conversa nenhuma compra —, mas não passa
   pelo chamado com o preço dito antes do dado.
2. **O contexto é curto.** O Mestre pesa chuva, noite, cidade, luta, o que o herói já sabe e o «não»
   do mundo. Não pesa o estado de quem está em cena, a pressa, nem quem observa.
3. **O catálogo é fechado.** São 34 ações; o que não cabe vira improviso por atributo, e é onde ele
   mais erra nas frases novas (5 a 6 de 8).

**Conclusão:** o Mestre não está pronto para carregar o desenho sozinho. Prepará-lo vem antes de
mexer nas quests.

## 3. A régua do momento

Uma tabela só responde «isto vale uma rolagem?», para toda ação — a conversa incluída. Ela junta o
que hoje está em dois lugares (`QUANDO_O_MESTRE_CHAMA` e a escada do pedido).

**Rola quando as três são verdade:**

| pergunta | de onde vem a resposta |
|---|---|
| **O resultado é incerto?** | o bônus do herói contra o número (o «automático» de hoje) |
| **Algo se opõe?** | o estado da cena: alguém não quer, algo resiste, o terreno pune |
| **Falhar custa?** | existe um preço a dizer (`CUSTO_DE_FALHAR`); sem preço, não há chamado |

**E estas pesam no número e no preço, nunca na decisão de rolar por conta da quest:**

| peso | efeito |
|---|---|
| **segredo** — a pessoa ou a coisa esconde algo | a busca rola (há o que achar); **a pergunta continua sem dado**, e a resposta sai evasiva ou falsa — o dado vem quando o jogador lê a pessoa ou pressiona (corrigido pelo estudo M1: 65 perguntas em 65 sem dado, `estudo-das-mesas.md` §5) |
| **pressa** — algo acontece se demorar | a falha gasta tempo que o mundo cobra |
| **testemunha** — alguém vê | a falha se espalha (fama, alarme) |
| **vantagem ganha** — o jogador preparou o terreno | bônus no dado (é aqui que o calor entra, §6) |

**Não rola**, e diz por quê (a lista de hoje, mantida): não há obstáculo; o herói já sabe; o
resultado é certo; o mundo disse que aquilo não existe; a luta tem o seu próprio dado.

**O que muda para a conversa.** Perguntar nunca rola: quem quer responder responde, e quem esconde
algo desconversa ou mente (a cena sabe a verdade; o Narrador recebe a resposta evasiva pronta).
**Pedir** a quem tem motivo para negar, **pressionar** e **ler a pessoa** passam pelo mesmo chamado de
qualquer outra ação: perícia, número e o preço dito antes. A escada do pedido continua dando o
número. As regras que a mesa real sustenta, com a força de cada uma, estão em
`estudo-das-mesas.md` §6 — a régua de M3 parte delas.

## 4. A cena que o Mestre lê

Cada pessoa, criatura e coisa em cena carrega estados simples, de uma tabela fechada:

| de quem | estados (exemplos) | quem escreve |
|---|---|---|
| pessoa | disposta · desconfiada · com medo · hostil · **esconde algo** · deve um favor | o mundo (relação, fama, rotina) e a quest |
| criatura | faminta · acuada · territorial · ferida · mansa | o mundo e a quest |
| coisa ou lugar | trancado · vigiado · frágil · escuro · armadilhado | o mundo e a quest |
| a cena | com pressa · com testemunhas · em território de alguém | o mundo e a quest |

Regras:

- **O Mestre só lê.** Quem escreve o estado é o mundo ou a quest, nunca o Narrador e nunca o dado
  direto (o dado muda o estado por tabela: a falha em intimidar deixa «hostil»).
- **O estado é o que dá tensão a uma etapa.** A etapa de conversa em que a testemunha «esconde algo»
  rola; a etapa em que o taverneiro só responde não rola, e fecha sem dado. Sai a regra antiga
  «nenhuma etapa fecha de graça»: a tensão é autoria da cena, não imposição da quest ao dado.
- **O jogador vê o estado pelo efeito** — a pessoa desvia os olhos, a fera baixa as orelhas —, nunca
  pelo nome.
- É campo de save **novo** e aditivo, ignorado pela versão antiga.

## 5. A quest que escuta

Cada etapa herda do fato que ela pede (`MOLDE_DO_FATO`, já escrito em `src/pecas/moldes.js`) a
tabela de soluções. A leitura muda de «o que o jogador vai tentar» para «o que acabou de acontecer»:

| o que aconteceu | o que a quest faz |
|---|---|
| intimidou a fera, **sucesso** | fecha a etapa pela via do intimidar |
| intimidou a fera, **falha** | nada: o Mestre já abriu a luta, e a quest espera o resultado dela |
| venceu a luta | fecha pela via do atacar |
| fugiu, sucesso | a etapa segue aberta; o relógio anda |
| conversou sem dado com quem não escondia nada | se a etapa pede só «conversou», fecha |
| qualquer outra coisa | aquecimento |

Três garantias, cada uma com a sua trava na suíte:

1. **A quest não toca no dado.** As mesmas frases, com a quest ligada e desligada e a mesma cena, e
   o chamado do Mestre sai idêntico.
2. **Um fato só se escreve quando o ato e o alvo batem.** «Convenci o pescador» não escreve «esteve
   no covil». Estar num lugar exige ir.
3. **Toda seta termina num fato ou noutra solução** — a regra de `as-pecas.md` §3.2, mantida.

## 6. O calor e o relógio

- **O calor não rola nada.** A frase que aponta para uma solução esquenta essa solução. O calor vira
  (a) a pista seguinte mais direta e (b) o peso «vantagem ganha» na régua, quando o Mestre chamar um
  dado que combine.
- **Calor cheio:** a próxima ação naquela direção conta como solução da etapa. Se tem dado, quem
  decide é o Mestre, pela régua. Com isto o «conjunto de ações» da pessoa leva à solução sem o
  sistema rolar sozinho e sem menu.
- **O relógio é do mundo.** Cada turno de aquecimento gasta tempo; quando enche, o mundo se move e
  cobra (a fera leva outro, a testemunha parte, o vilão é avisado), e a etapa reabre pior. Na prova
  de 17/11 o relógio nunca disparou em jogo; aqui ele tem trava própria.

## 7. O estudo das mesas reais

**O que se estuda.** Sessões reais de grandes mestres. Hoje temos 159 episódios da Critical Role
(campanhas 1 e 2, conjunto público CRD3). Entram outras mesas — Dimension 20, The Adventure Zone e
mesas em português —, estas últimas porque mostram como o jogador brasileiro formula a ação.

**A regra do texto (de 10/11, mantida).** As frases reais ficam na bancada de estudo, fora do
repositório e fora do jogo. Para o projeto vai o que produzimos a partir delas: contagens, padrões
descritos por nós e frases nossas. Motivos: a licença do CRD3 obriga a compartilhar o que deriva
dele, a política de fãs da Critical Role não cobre projeto comercial, e as transcrições das outras
mesas não têm licença nenhuma.

**O que se extrai de cada sessão — o «caso».**

| campo | exemplo |
|---|---|
| o que o jogador disse fazer | a categoria da ação, não a frase |
| o que havia na cena | quem se opunha, o que estava escondido, havia pressa, havia testemunha |
| o mestre pediu dado? | sim ou não — **os «não» valem tanto quanto os «sim»** |
| qual teste, e se foi pedido sem ação declarada | perícia; espontâneo ou não |
| o que o sucesso deu e o que a falha custou | informação, posição, dano, tempo, nada |

O estudo de 10/11 contou palavras-chave; este recorta **casos com a cena**, que é o que a régua do
momento precisa. Sai dele uma tabela de frequências: em que cenas um grande mestre rola, e em quais
ele só narra.

**A cautela.** Quase todas essas mesas jogam D&D 5e. Aprende-se *quando* e *por que* rolar; a
perícia e o número se traduzem para as nossas tabelas.

## 8. O exame do Mestre

Um conjunto de situações que o Mestre nunca viu, escritas por nós em PT-BR a partir dos casos do
estudo, e **renovado a cada rodada** (frase usada para afinar sai do exame).

| medida | hoje | meta para ligar as quests |
|---|---|---|
| intenção certa em frase nova | 73% (corpus) · **34% no exame** (M2, §11) | **≥ 90%** |
| perícia certa em frase nova | 69% (corpus) · 82% no exame, só entre os 50 que rolam dos dois lados | **≥ 85%** |
| pede dado onde um mestre real não pediria | 6% (corpus) · **21% no exame** (26 de 126) | **≤ 2%** |
| deixa de pedir onde um mestre real pediria | **66% no exame** (99 de 149) | **≤ 15%** |
| declarações fora da luta seguidas de dado, em sessão jogada | 4,3% (10/11) | **sem meta** (19/11, decisão da pessoa): a mesa real deu 26,5%, e isso é o que se observa, não o que se persegue. Quantos dados caem é consequência de acertar o momento; cota por turno ou por sessão confunde o Mestre. Tampouco «maior sequência sem dado» é defeito: defeito é a ação arriscada que passou sem dado |
| perguntas de «o que sei de…» respondidas sem dado | 76% no exame (22 de 29), mas quase sempre porque não leu a frase; o veredito certo sai em 17 de 29 | **≥ 70%** (a mesa real: 78%) |
| falha que dá «nada» | — | **≤ 10%** (a mesa real: 7%) |
| o chamado muda quando a quest liga | — | **0 diferenças** |

As metas saem da mesa real, não de gosto. A CD dita em voz alta fica como está: a mesa real não
diz, e nós dizemos por lei da casa («o veredito antes do clique»).

## 9. A ordem

Uma etapa por vez; cada uma fecha com a sua medida.

| etapa | o que entrega | fecha quando |
|---|---|---|
| **M1 · o estudo** | os casos recortados das sessões reais e a tabela de frequências por cena | a tabela existe e diz, por tipo de cena, quanto um mestre real rola |
| **M2 · o exame** | o conjunto de situações novas em PT-BR e a suíte que mede o Mestre de hoje contra ele | os números de hoje estão na tabela do §8 |
| **M3 · a régua do momento** | uma tabela só para «vale rolagem?», com a conversa dentro | o exame sobe sem aumentar o dado indevido |
| **M4 · a cena** | os estados de pessoa, criatura, coisa e cena; o mundo os escreve, o Mestre os lê | uma sessão jogada: o dado responde à cena |
| **M5 · o treino** | afinar catálogo e classificador contra o exame, rodada a rodada | as metas do §8 |
| **Q1 · a quest que escuta** | as peças deixam de pedir dado e passam a ler o resultado do turno | a trava «0 diferenças» e as outras duas do §5 |
| **Q2 · a prova jogada** | «O Que Desce ao Anoitecer» de ponta a ponta, contra o jogo de hoje | pareceu mesa, e não trilho; os números do §8 em jogo |

M1 e M2 não tocam no jogo. De M3 em diante, tudo entra atrás de uma chave desligada em produção,
como as peças hoje.

## 10. O que falta decidir

1. **Quais mesas além da Critical Role**, e quantas sessões de cada. Proposta: começar por duas
   mesas a mais, uma delas em português, cerca de dez sessões de cada.
2. **O dado espontâneo.** Na mesa real, 37% dos pedidos vêm sem ação declarada (o mestre pede
   Percepção porque algo se aproxima). Proposta: entra, e é o mundo que o provoca — um estado da cena
   muda e o Mestre chama.
3. **A etapa que fecha sem dado.** Este desenho aceita que uma conversa sem oposição feche uma etapa
   sem rolagem. Proposta: sim, com uma medida de autoria — nenhuma quest inteira sem ao menos uma
   cena com oposição.

## 11. A primeira medida do exame (M2)

**18/11/2026, rodada 1.** O exame é `testes/exame-do-mestre.json`: 295 itens sobre as 65 situações do
estudo (`estudo-das-mesas.md` §8), com o veredito tirado das regras da mesa real (§6). As frases são
nossas e foram escritas antes de abrir o catálogo; nenhuma está nos corpus que afinaram o Mestre.
São 80 pares (a mesma frase em duas cenas com vereditos opostos; 70 com ação declarada) e 20 itens
de dado espontâneo, medidos à parte. A suíte é `testes/teste-exame-do-mestre.mjs`.

O Mestre recebe a frase como o jogo a passa (`lerAcao` → `porQueNaoChama`; o social pela escada do
pedido) e, da cena, só o que tem porta hoje: a pessoa (relação, papel, segredo), o achado
escondido, a armadilha em cena, a chuva, o escuro e o que o herói já sabe. Medo, pressa,
testemunha, vigia, perigo e motivo para negar não têm porta e não vão.

| medida | hoje | catraca |
|---|---|---|
| rola certo (275 itens com ação declarada) | **150 (55%)** | não desce de 150 |
| pede onde a mesa não pediria | 26 de 126 (21%) | não sobe de 26 |
| não pede onde a mesa pediria | **99 de 149 (66%)** | não sobe de 99 |
| categoria (intenção) certa | 93 de 275 (34%) | não desce de 93 |
| perícia certa, entre os que rolam dos dois lados | 41 de 50 (82%) | não desce de 41 |
| dos 76 pedidos, com o preço dito antes (`oChamado`) | 65; os outros 11 vão pela escada social, sem chamado | — |
| **pares em que o Mestre dá vereditos diferentes** | **2 de 70 (3%)** · acerta os dois lados em 2, só um em 68 | não desce de 2 |
| espontâneos: rola certo | 10 de 20 (os 10 «não»; dos 10 que a mesa rolaria, pediu 0) | não desce de 10 |
| por base: número · padrão · fraco | 56/92 (61%) · 79/148 (53%) · 15/35 (43%) | — |

Por categoria (rola certo): perguntar 17/17 · logística 8/8 · arcano 15/21 · saber 17/29 ·
procurar 26/49 · travessia 14/29 · convencer 13/29 · atuar 7/12 · intimidar 6/12 · furtar 6/11 ·
esgueirar 4/13 · forçar 3/10 · ler a pessoa 2/7 · rastrear 3/7 · animal 1/4.

**O que o exame mostra, em três buracos:**

1. **O Mestre não lê o momento.** Em 68 dos 70 pares ele dá o mesmo veredito às duas cenas: «vou pé
   ante pé pelo corredor» não rola com o guarda na outra ponta e não rolaria sem ele; «pulo o muro»
   rola no muro seco e no molhado; «ameaço ele: ou fala ou apanha» rola contra o ladrãozinho já caído
   e apavorado tanto quanto contra o contrabandista cercado de capangas. É o tamanho da lacuna que a
   M4 (a cena) tem de fechar, e a régua de M3 tem de saber usar.
2. **O catálogo não ouve a maior parte das frases.** 66% dos «rola» da mesa ficam sem dado, quase
   todos porque `lerAcao` devolve nada: «reviro o quarto todo atrás de qualquer coisa», «encosto a
   faca no pescoço dele e mando falar», «capitão, deixa a gente falar com o preso», «ela tá
   mentindo?», «dá pra eu ler esse livro de feitiços?», «desço o muro pela corda». A intenção certa
   cai de 73% no corpus para 34% aqui: o corpus mediu frases parecidas com as regras; o exame, frases
   de jogador.
3. **Quando ouve, pede onde a mesa não pede.** 21% dos «não rola» viram dado: a busca num quarto onde
   não há nada (a casa rola uma vez de propósito, `fechaDepois`; a mesa real descreve), «eu abro o
   baú» lido como tranca, «encosto o ouvido na porta» com a discussão aos gritos do outro lado, e a
   intimidação de quem já está com medo.

**A porta do oráculo não fecha a lacuna da busca.** A suíte mede também o Mestre com o mundo dizendo
«não há nada» sempre que a cena não esconde nada: o número não muda (150), porque só três testes do
catálogo perguntam ao mundo (escutar, ler a intenção, rastrear), e a busca não é um deles.

**O que o exame não mede ainda:** a falha que dá «nada» (não há dado lançado), o chamado com a quest
ligada (não há quest nas frases) e as declarações seguidas de dado numa sessão jogada — as três
pedem jogo, não frase. O dado espontâneo fica medido à parte: hoje não há porta por onde o estado da
cena chame o dado sozinho.

## 12. A régua e a cena, medidas (M3+M4)

**18/11/2026, módulos puros, sem fiação.** Três peças novas e uma afinação, nenhuma lida pelo jogo:

- `src/cena-do-momento.js` — a tabela fechada de estados (`ESTADOS_DA_CENA`: 8 de pessoa, 6 de
  criatura, 7 de coisa ou lugar, 7 de cena), cada um com o que significa para a régua (opõe, cede,
  facilita, esconde, pune, espalha, nota, apressa, revela, e a perícia que ele chama ao aparecer) e o
  efeito que o jogador sente na narração. As perguntas: `haOposicao`, `haOQueAchar`, `haSegredo`,
  `haPerigo`, `alguemPodeNotar`, `haPlateia`, `cenaRevela`, `custoDeFalhar`, `respostaDaPergunta`.
- `src/motor/a-regua-do-momento.js` — `valeRolagem(veredito, cena, ctx)`: as linhas do Mestre de
  hoje (menos a da conversa) e depois `REGUA_DO_MOMENTO`, uma tabela ordenada com a conversa dentro,
  linha a linha do estudo §6. `oQueACenaChama(antes, depois)`: o dado espontâneo. **Sem cena, devolve
  exatamente o Mestre de hoje** — provado frase a frase sobre os dois corpus, em quatro contextos.
- O exame repartido por semente em metade A (afina; só os erros dela se leem) e B (a prova; só
  número). O par nunca se parte. A: 147 itens, B: 148.
- O catálogo (`src/desafios.js`) aprendeu verbos que a metade A mostrou e ele não ouvia; as catracas
  dos dois corpus ficaram exatamente onde estavam (mesa 413 · 58 · 2; situações A 240 · 188 · 0,
  B 176 · 133 · 3).

**A medida** (com ação declarada; espontâneos à parte). «Antes» é o Mestre de hoje com o catálogo da
M2; as duas colunas do meio separam o que veio do catálogo e o que veio da régua.

| metade A (afina) | antes | só o catálogo | só a régua | **régua + catálogo** |
|---|---|---|---|---|
| rola certo (de 139) | 75 (54%) | 92 | 84 | **107 (77%)** |
| pede onde a mesa não pediria (de 62) | 11 | 20 | 1 | **4 (6%)** |
| não pede onde a mesa pediria (de 77) | 53 | 27 | 54 | **28 (36%)** |
| pares que separa (de 35) | 1 | 2 | 9 | **16** |
| espontâneos certos (de 8) | 4 (pediu 0 de 4) | 4 | 7 | **7 (pediu 3 de 4)** |

| metade B (a prova) | antes | só o catálogo | só a régua | **régua + catálogo** |
|---|---|---|---|---|
| rola certo (de 136) | 75 (55%) | 79 | 82 | **86 (63%)** |
| pede onde a mesa não pediria (de 64) | 15 | 15 | 4 | **4 (6%)** |
| não pede onde a mesa pediria (de 72) | 46 | 42 | 50 | **46 (64%)** |
| pares que separa (de 35) | 1 | 1 | 9 | **9** |
| espontâneos certos (de 12) | 6 (pediu 0 de 6) | 6 | 10 | **10 (pediu 4 de 6)** |

No exame inteiro: rola certo 150 → 193, indevido 26 → 8, omitido 99 → 74, pares 2 → 25 de 70,
espontâneos 10 → 17 de 20. **A M3 fecha pelo critério do §9** — o exame sobe sem aumentar o dado
indevido, e na metade que ninguém afinou o indevido cai de 15 para 4. As metas do §8 ainda estão
longe: indevido 6% (meta ≤ 2%), omitido 50% (meta ≤ 15%).

**O que ainda erra, e por quê** (a leitura é só da metade A):

1. **O catálogo ainda não ouve** a maior parte do que falta (os 28 omitidos da A são quase todos
  `lerAcao` devolvendo nada): o «dá pra eu…?» que a peneira lê como pergunta e o exame lê como
  declaração; a ameaça e a mentira sem verbo («digo pro guarda que venho a serviço do barão», «se
  ele não abrir o jogo a guarda vai saber»); o grito para a multidão; a barganha («vc solta os dois
  e eu te entrego o mapa»); o «consigo ouvir…?».
2. **Formas que só a régua pode ouvir.** «Pulo da carroça» e «passo a ponte correndo» foram
  ensinadas e tiradas de volta: o corpus das situações tem a mesma forma numa cena calma («pulo da
  carroça quando ela para», «atravesso a ponte da vila») e pune o falso «pede dado» — sem cena, o
  catálogo não tem como distinguir. Com a régua ligada, ouvir essas formas fica seguro; ouvi-las
  antes disso é pedir dado na ponte da vila.
3. **A cena do exame que só existe em nota.** Muro liso e molhado, sol visível, amuleto comum de
  feira contra raro, carroça em movimento, a planta estranha à beira da estrada (o espontâneo de
  saber): a régua lê estado, e ali o estado não foi escrito. No jogo é o mundo que escreverá; no
  exame, a rodada 2 deve escrever esses casos como estado (`fragil`, `perigo_fisico`, `assunto_raro`)
  ou trocá-los.
4. **Na B, o omitido sobe de 42 para 46 com a régua** — quatro rolagens que a mesa pediria e a régua
  cortou. Não foram lidas (é a prova); pela A, o mais provável é a mesma família do item 3: o perigo
  que mora na nota, e a régua diz «travessia calma».

**Uma ressalva de honestidade.** Antes de repartir, a suíte da M2 imprimia os 25 erros mais
instrutivos do exame inteiro (seis estão citados no §11); 14 desses caíram na metade B. Nenhum foi
usado para afinar — os verbos ensinados saíram da lista da metade A —, mas a B já não é inteiramente
virgem. A rodada 2 do exame deve renovar esses 14 itens.

**O que a fiação no jogo vai precisar** (de onde cada estado virá):

| estado | quem o escreve no jogo |
|---|---|
| disposta, desconfiada, hostil | a relação da pessoa (`pessoaDe` → `relacao`) e a fama |
| deve_favor | o livro de promessas / as notas da pessoa |
| esconde_algo | o segredo da pessoa (`segredo`, `segredos` da espinha) e a verdade eleita da quest |
| motivo_para_negar | o papel (o guarda com ordem, o chefe da milícia) e o tamanho do pedido (`social.js`) |
| com_medo | o resultado de uma intimidação que passou, a pessoa rendida, o caído na luta |
| do_grupo | o grupo (companheiros) |
| criaturas | o encontro (`encontro-na-estrada`, o bestiário): faminta, acuada, territorial, ferida, mansa; a montaria assustada |
| trancado | a tranca da porta (`trancaDe`) e a sala da masmorra |
| vigiado, territorio_de_alguem | a ronda e o dono do lugar (a masmorra, a casa nobre, o acampamento) |
| armadilhado, ha_algo_escondido | a armadilha à vista (`objetoEmCena`) e o achado (`achadoDe`) |
| fragil, escuro | o lugar e a hora (`escuro` já existe no contexto) |
| com_pressa | o relógio da quest (§6) e a perseguição |
| com_testemunhas | a cena na cidade, a multidão, a taverna cheia |
| perigo_fisico, algo_se_aproxima | o terreno da viagem, a queda, a criatura que espreita |
| som_claro | a cena (a discussão aos gritos) |
| assunto_raro | o fato novo que aparece (o livro de fatos sabe o que o herói ainda não viu) |

A ligação entra atrás de uma chave desligada; com a chave desligada a régua recebe `null` e o jogo é
o de hoje.

## 13. O treino (M5)

**18/11/2026, módulos puros, sem fiação.** A M2–M4 mostraram que o buraco é o omitido, e que ensinar
o catálogo verbo a verbo não generaliza (na rodada 2 a B foi de 72 para 75 omitidos com o catálogo
mais rico). A M5 atacou pela estrutura da frase, e só atrás da régua.

- `src/motor/a-escuta-da-cena.js` — **a escuta da cena**. Quando `lerAcao` não ouve ato nenhum (nulo
  ou «livre») e há cena, a régua pede uma segunda escuta, que traduz a frase para a gramática que o
  catálogo já ouve (`comoSeDiz`) e devolve o veredito do próprio catálogo. Quatro portas, cada uma uma
  tabela: as **molduras** («dá pra eu…?», «consigo…?», «será que…», «queria ver se…», «posso…?», «vou
  tentar…», e o ato em substantivo, «dar uma intimidada»); a **fala que pede** (a barganha, a ameaça
  sem o verbo ameaçar, a afirmação falsa sobre si, o verbo de dizer e a fala direta — entre aspas ou
  com vocativo — a quem tem motivo para negar); o **ato sem o verbo do catálogo** (descer pela corda,
  passar a pinguela, pé ante pé, revirar, seguir de longe, ler a sinceridade de alguém, a mão leve,
  a memória, o plural da mesa); e a **pergunta que é gesto** (o assunto raro, o rastro, o que há ali —
  só quando não há a quem perguntar). A escuta não decide: a régua decide pela cena. Sem cena ela não
  corre, e o Mestre de hoje fica byte a byte o que era (a asserção da regressão zero ficou).
- `src/cena-do-momento.js` — **sete estados novos**, com cinco marcas novas: `ceu_encoberto` (cobre:
  sem sol nem estrela), `morta` e `desacordada` (inerte: não nota, não responde, não resiste),
  `do_heroi` (proprio), `raro_de_achar` (escasso), `coisa_comum` (comum) e `escorregadio` (pune). O
  morto sai de `alguemPodeNotar`, de `haPlateia` e da oposição, e responde com o «silêncio». Uma
  pergunta genérica, `temMarca(cena, marca)`.
- `src/motor/a-regua-do-momento.js` — **oito linhas novas**: `semResposta` (o morto não é convencido),
  `falaSemOposicao` (a fala que só a escuta ouviu rola só se quem ouve tem motivo para negar — a regra
  mais forte do estudo, §6), `maoLeveSemOlhos`, `ceuEncoberto` / `ceuAVista`, `jaSabeOAssunto` (o que a
  ficha sabe cala qualquer desafio de saber, não só o «lembrar»), `doProprioHeroi`, `coisaComum`; a
  busca rola também pela coisa rara de achar; o discurso que o improviso leu pela Presença passa pela
  conversa (`FAMILIAS_DA_CONVERSA`); e o «lembrar» sem assunto recortado usa a frase inteira como
  assunto.
- O exame: seis itens da **A** trocaram a aproximação pelo estado novo (E155, E157 `coisa_comum`;
  E166 `do_heroi`; E173, E175, E179 `escorregadio` no lugar de `perigo_fisico`). `cenaDoExame` passou a
  ler dois estados de campo estruturado, como já lia a criatura: o morto pelo papel («guarda morto») e
  o céu encoberto pelo clima («neve fechada»). **Nenhum item da B foi tocado.**
- `testes/teste-a-escuta-da-cena.mjs` (39) — as tabelas, cada porta com frase nossa, e uma catraca nos
  dois corpus: com uma cena generosa, a escuta ouve 10 + 26 do que o catálogo perde e ouve 31 + 9 onde o
  rótulo é «sem teste» (o teto do que a régua teria de calar).

**A medida** (régua + cena, com ação declarada; o Mestre de hoje não mudou):

| | rola certo | indevido | omitido | pares que separa |
|---|---|---|---|---|
| A, rodada 2 | 126/167 (75%) | 4/76 | 37/91 | 21/49 |
| **A, M5** | **164/167 (98%)** | **0/76** | **3/91** | **48/49** |
| B, rodada 2 | 133/214 (62%) | 6/101 | 75/113 | 15/67 |
| **B, M5** | **162/214 (76%)** | **5/101** | **47/113** | **37/67** |

Espontâneos: 8/8 e 24/24, como antes. Categoria certa B 69 → 108, perícia certa B 32 → 54.

**O que cada passo rendeu na B** (rola certo · indevido · omitido, medidos em ordem):

| passo | B |
|---|---|
| partida (rodada 2) | 133 · 6 · 75 |
| a escuta (molduras, fala, ato, pergunta) + estados + linhas novas | 149 · 9 · 56 |
| o estado do campo (morto, céu) que um escape do shell tinha quebrado, a A trocada, `jaSabeOAssunto`, o improviso cedendo à forma | 152 · 7 · 55 |
| `falaSemOposicao` | 154 · 5 · 55 |
| formas tiradas dos nossos corpus + a pergunta só sem interlocutor + o ouvido só com intenção | 154 · 5 · 55 (0) |
| o plural da mesa («nos escondemos» → «me escondo») | 154 (0) |
| a fala dirigida sem forma de pedido, a quem tem motivo para negar | 157 · 5 · 52 (+3) |
| a fala direta (aspas, vocativo) | 158 · 5 · 51 (+1) |
| ler a pessoa (sinceridade, intenção, nervo — dito ao Mestre, não a ela) | 160 · 5 · 49 (+2) |
| a mão leve e o esgueirar sem o verbo do catálogo | 162 · 5 · 47 (+2) |

**O que foi tentado e saiu:**

- **O classificador de n-gramas do protótipo como segunda opinião** (a tabela de 293 KB, treinada só
  com os nossos corpus; só quando catálogo e escuta não ouvem nada e a cena tem perigo, achado ou quem
  note). Com τ = 0,5 (o τ do protótipo, escolhido nas sessões 1–10): B +3 (158 → 161), indevido igual,
  mas a A passa de 0 para 2 indevidos. Com τ = 0,35: B +6, indevido 5 → 6. **Não entrou:** o ganho é
  pequeno para 293 KB no bundle quando a régua for ligada, a A piora, e escolher τ olhando a B seria
  afinar contra a prova. Usei-o como farejador (§6.2 do protótipo): os traços de maior peso dele para
  «escutar» e «investigar» viraram duas formas da escuta — e renderam 0 na B.
- **«atuar» pelo verbo (canto, toco, danço)**: +1 certo e +1 indevido na B — saiu.
- **Verbos sociais sem pedido** (elogio, flerto, bajulo, proponho…), **verbos de busca** (inspeciono,
  verifico, tateio…) e **intimidação por gesto** (encaro, rosno, mostro a lâmina): 0 cada um — saíram.
  Três seguidas sem mover a B: o treino parou ali, como manda a etapa.

**Uma ressalva de honestidade, maior que a da M3.** Depois de `falaSemOposicao`, cada família de
formas foi mantida ou tirada **olhando o número agregado da B** — e, para escolher a família, li
também a contagem agregada dos omitidos da B por categoria esperada e por linha da régua (só
números, nenhuma frase, cena ou erro). Isso é escolher contra a prova: as famílias que ficaram são
genéricas, mas a B já não é virgem para elas. **A rodada 3 do exame deve renovar a B** antes da
próxima afinação. E ao listar o que o catálogo perde nos corpus, vi frases das duas metades do
`corpus-das-situacoes` — a escuta não toca a catraca dele (sem cena ela não corre), mas fica dito.

**O que ainda falta para as metas do §8** (B): rola certo 76% (meta ≥ 90%), indevido 5% (≤ 2%),
omitido 42% (≤ 15%). A leitura:

1. **O omitido é quase todo surdez.** Dos 47, 44 são frases que nem o catálogo nem a escuta ouvem;
   por categoria esperada: convencer 13, procurar 6, ler a pessoa 5, esgueirar 3, furtar 3, saber 3,
   arcano 3, e o resto de um em um. A A já não ensina (164 de 167): a escuta por forma chegou ao que
   uma mão escreve olhando 175 frases. Generalizar mais pede **mais frases de afinar** — uma rodada 3
   com metade A nova, ou o corpus das frases do beta (a proposta do protótipo, §6, que é da pessoa) —
   e só então um modelo aprendido vale o peso dele.
2. **A conversa com o estranho sem estado** continua cara: a A diz que a mesa rola (#26, o anão
   bêbado), a B diz que não (as duas falas que a escuta ouvia ali eram indevidas). A régua só tem o
   estado da pessoa para distinguir; quem escreve `motivo_para_negar` no jogo (o papel, o tamanho do
   pedido, §12) é que vai decidir este caso de verdade.
3. **O indevido que sobra é do catálogo, não da escuta:** 4 dos 5 vêm de `comoSempre` — o catálogo leu
   um teste de uma família sem linha de cena (saber, arcano, força) e a régua deixa rolar como sempre.
   Fechar exige estados de cena para essas famílias (o que torna o saber «comum» ou a força
   «trivial»), não mais escuta.
4. **Três omitidos são ouvidos e calados pela cena** (busca vazia, travessia calma): o perigo está na
   nota, não no estado. No jogo, é o mundo que vai escrever o estado.

A A em 98% contra a B em 76% é o sinal de afinação que a etapa pedia para vigiar; os +29 da B são o
que generalizou.

## 14. O treino, rodada 3

**18/11/2026, módulos puros, sem fiação.** A regra de honra desta vez foi mais dura: a B nova (265 itens,
ninguém viu) foi medida **exatamente duas vezes**, no começo e no fim, e nunca entre as duas. Para
trabalhar, a metade A foi repartida por semente (`treino-r3|particao|2026-11-18`, FNV-1a do par ou do
item, um terço para cada lado) em **A-treino** (2/3) e **A-validação** (1/3), num script fora da suíte que
filtra o JSON na leitura (a B nunca é carregada). Erros lidos: só os da A-treino. O que ficou: o que a
A-validação sustentou.

**A medida** (régua + cena, com ação declarada; o Mestre de hoje não mudou):

| | rola certo | indevido | omitido | pares que separa |
|---|---|---|---|---|
| A-treino, antes | 215/248 (87%) | 2/119 | 31/129 | 60/77 |
| **A-treino, depois** | **228/248 (92%)** | **0/119** | **20/129** | **66/77** |
| A-validação, antes | 111/133 (83%) | 3/58 | 19/75 | 25/39 |
| **A-validação, depois** | **118/133 (89%)** | **2/58** | **13/75** | **31/39** |
| B, antes | 143/196 (73%) | 7/102 | 46/94 | 40/79 |
| **B, depois** | **158/196 (81%)** | **6/102** | **32/94** | **54/79** |

Categoria certa B 99 → 119, perícia certa B 42 → 53. A inteira: 326 → 346 (91%), indevido 5 → 2.

**As medidas à parte da B** (sem catraca): espontâneos 27/27 antes e depois (a régua já pedia os 15);
**o dado do destino 4/15 → 7/15**, indevido 0/4 nos dois (pede 3 dos 11 que rolam); **mesas discordam**
13/27 → 15/27 contra a regra de §6 (indevido 0/10 → 1/10), e contra o que a mesa em português faria
24/27 → 20/27 — a régua pede mais onde a nossa mesa pede menos, como a calibragem da §3 manda.

**O que cada passo rendeu na A-validação** (rola certo · indevido · omitido, em ordem):

| passo | A-validação | ficou? |
|---|---|---|
| partida | 111 · 3 · 19 | |
| a escuta brasileira em lote (a escrita do chat, «tu acha que…», «preciso rolar… pra…», «quero…», «vou + infinitivo», a perícia nomeada, e formas de fala e de ato tiradas da A-treino) + os estados novos + as linhas novas | 113 · 3 · 17 (+2) | a ablação disse de onde: **ler a pessoa pela cara** (+1) e **a furtividade pelo advérbio** (+1) |
| as ações encadeadas («aí eu», «vou fazer o seguinte:», a pergunta no meio) | 0 | ficou: é estrutura do §10.4, não frase da A |
| a pergunta pela magia da coisa | 0 | **saiu** (decoreba) |
| a hora e o rumo («que horas são», «pra que lado fica») | +1 | ficou |
| a encenação pelo verbo do ofício | 0, e +1 indevido na A-treino | **saiu** (a M5 já tinha visto o mesmo) |
| a moldura como peso: o anúncio ao estranho não rola | 0 | **saiu** |
| a moldura como peso: a travessia calma pedida com licença rola | −1, +1 indevido | **saiu** |
| **o palpite da cena** (a moldura de risco sem ato ouvido; a cena diz o risco) | **+3** | ficou |
| 39 itens da A com o estado novo no lugar da nota | +1, indevido 3 → 2 | ficou (dado, não forma) |
| o palpite só com a moldura que abre a frase (o corpus mostrava «tentando respirar» virar busca) | −1 | ficou: sem isto a catraca dos corpus subia |
| **a fala com licença** (a fala que só a escuta ouviu, com «posso…?», a quem não está do seu lado, rola) | **+1** | ficou |
| desfazer o que deu zero e nasceu dos erros da A-treino | 0 (a A-treino caiu 244 → 227) | — |
| «a gente pode…?» · o palpite de ler a pessoa · «quero» no palpite | 0 · 0 · 0 (+1 falsa no corpus) | **saíram**; três seguidas paradas: o treino parou |

**O que foi desfeito, e por quê.** A A-treino chegou a 244/248 com a A-validação parada em 118: a
ablação mostrou que a mentira sobre quem se é, a mão leve «sem ninguém ver», o curativo pelo gesto,
segurar quem cai, o pé de cabra, a pergunta pela magia, a família corrigida (o «examino» que vira arcano),
a barganha de feira («faz por 30», «precinho») e as frases de ameaça do treino («pensa no que vai
responder») davam **zero** na A-validação. Era decoreba, e saiu. Ficaram, mesmo com zero, as portas que o
§10.4 descreve e que não saíram da A: o «vou + infinitivo», a perícia nomeada, as encadeadas, a escrita do
chat, «e se eu…» / «pelo menos…» e a arma à mostra — a A tem poucas frases assim, e a B nova é escrita
nesses padrões.

**O que mudou no código:**

- `src/motor/a-escuta-da-cena.js` — `ESCRITA_DA_MESA` (vc, cê, q, n…); molduras novas; `molduraDe` (o
  sinal: pedido, licença, tentativa, anúncio); `noPresente` + `PRESENTE_IRREGULAR` (o infinitivo volta ao
  presente, também dentro da moldura); `atosDaFrase` (as encadeadas); `periciaNomeada` +
  `PERICIA_NOMEADA` (português e inglês); o **palpite da cena** (`PALPITE_DA_CENA`, `MOLDURA_DO_PALPITE`,
  `PERGUNTA_DE_INFORMACAO`); formas de barganha, arma à mostra, advérbio, cara, hora e rumo.
- `src/cena-do-momento.js` — **18 estados novos** com 13 marcas: `som_abafado`, `ja_testado`,
  `ja_resolvido`, `ja_convencida`, `moribunda`, `dormindo`, `selado`, `sem_resistencia`, `a_vista`,
  `rastro_fresco` / `rastro_velho` / `rastro_obvio`, `em_movimento`, `ameacado`, e os do herói —
  `heroi_treinado`, `heroi_ja_sabe`, `heroi_tem_alavanca`, `heroi_penalizado` — de dono «cena» (a forma
  lida da cena não mudou).
- `src/motor/a-regua-do-momento.js` — linhas `jaResolvido`, `jaTestado`, `impossivel`, `alavanca` (salvo
  contra quem é hostil, nº 75), `aVista`, `falaComLicenca`, `somAbafado`, `corpoQueFalha`, `heroiJaSabe`,
  `semResistencia`; o moribundo faz o socorro urgente; a coisa comum cala também o arcano; o pedido de
  dado (`naoSePede`) passa pela escuta quando há cena; as encadeadas (`valeRolagem` parte a frase e fica com
  o ato que tem oposição); `pesos.penalidade`; e **o dado do destino** (`ePerguntaDoDestino`,
  `PERGUNTA_DO_DESTINO`, `oDadoDoDestino`, `FAIXAS_DO_DESTINO`: um d6 pela semente, três faixas). Ele só
  entrou porque não pediu nada indevido na A (não disparou em item nenhum dela).
- Sem cena, tudo isto fica calado: a asserção da regressão zero ficou, sobre os dois corpus.
- Suítes: `teste-a-escuta-da-cena` 56, `teste-a-regua-do-momento` 97, `teste-cena-do-momento` 66. A
  catraca dos corpus da escuta subiu no «ouve» (10 → 11, 26 → 31) com o «ouve onde é sem teste» parado
  em 31 e 9. A catraca do exame subiu nas duas metades da régua.

**O que falta para as metas do §8** (B): rola certo 81% (meta ≥ 90%), indevido 5,9% (≤ 2%), omitido 34%
(≤ 15%).

1. **O omitido continua a ser surdez, e a A já não ensina.** A A-validação parou em 118/133 e três
   tentativas seguidas não a moveram. O que generaliza é estrutura (a moldura, o palpite da cena, a
   licença), não vocabulário — e a estrutura que a A ensina está gasta. O próximo salto pede frase nova
   de afinar (a do beta, a proposta do protótipo, que é da pessoa) ou a cena viva do jogo: muitos omitidos
   são frases que a cena tornaria óbvias.
2. **O indevido é do catálogo**, como a M5 viu: a régua só cala onde a cena tem linha. As linhas novas
   (selado, à vista, sem resistência, já sabe, já testado) cobrem as famílias de saber, arcano e força —
   **mas só quando o mundo escreve o estado**. No exame a cena da B foi escrita antes destes estados
   existirem, e a nota não entra; no jogo, a fiação é que vai pagar isto.
3. **O destino rola 3 dos 11.** A pergunta do destino na B nem sempre tem a cena do tranco (perigo ou a
   coisa `ameacado`), e sem ela a régua não arrisca: a A-validação não deu licença para rolar só pela
   frase. No jogo, quem escreve `ameacado` é o motor da consequência (o barco virou), e aí rola.

### 14.1 O que a fiação no jogo precisa

**As funções que o `App.jsx` vai chamar** (todas puras; tudo em `try/catch` com `calou`):

```js
// 1. o catálogo, como hoje
lerAcao(frase, leitura) // → veredito | null
// 2. a régua, com a cena e a frase (sem cena = o Mestre de hoje, byte a byte)
valeRolagem(veredito, cena, {
  emCombate, bonus, mundoDisseNao, saber, vantagem, // os de porQueNaoChama
  frase,     // o que o jogador escreveu (liga a escuta, a moldura, as encadeadas e o destino)
  leitura,   // o mesmo contexto de lerAcao (semente, personagem, pessoaDe, achadoDe…)
})
// → { rola, porque, diz, pesos: { segredo, pressa, testemunha, perigo, vantagem, penalidade },
//     resposta /* franca|evasiva|recusa|silencio, só na pergunta */,
//     ouviu /* { id, pericia, chave, porta } | null */, moldura, destino? }
// 3. o dado espontâneo, quando a cena muda entre dois turnos
oQueACenaChama(cenaAntes, cenaDepois) // → { pericia, estado, porque } | null
// 4. (opcional, para a pauta) o sinal da moldura
molduraDe(frase) // → "pedido" | "licenca" | "tentativa" | "anuncio" | ""
```

Três cuidados da fiação:

- **Quando `ouviu` vem preenchido, o teste é o que a escuta ouviu**, não o veredito do catálogo (que era
  nulo, «livre» ou «não se pede»). `ouviu` traz só `id`, `pericia` e `chave`; o chamado precisa do
  veredito inteiro (o `dc`, o `social`, a `pessoa`). A forma mais barata: `valeRolagem` devolver também o
  veredito que decidiu (um campo a mais, aditivo) — ou o App chamar `escutarComCena(frase, cena, leitura)`
  quando `ouviu` vier. É a primeira coisa a decidir na fiação.
- **`porque === "destino"`**: não há perícia nem número a bater. `destino` é `{ dado, faces: 6, id, diz }`,
  já resolvido pela semente (`oDadoDoDestino(leitura.semente, frase)`): a bandeja mostra o d6 cair, e o
  Narrador recebe só o `diz` («a sorte levou», «em parte», «a sorte ajudou»).
- **`porque` começando por `encadeada:`**: o ato que rola é uma parte da frase; o Narrador narra os outros
  atos acontecendo e o dado cai no arriscado.

**De onde cada estado da cena deve vir** (o Mestre só lê; quem escreve é o mundo ou a quest — nunca o
Narrador, nunca o dado direto):

| estado | quem escreve |
|---|---|
| `disposta` · `deve_favor` · `hostil` · `desconfiada` | a relação da pessoa e a fama (o que `pessoaDe` já sabe) |
| `motivo_para_negar` | o papel da pessoa e o tamanho do pedido (a escada de `social.js`), e a quest |
| `com_medo` | o resultado de uma intimidação, ou a luta (o inimigo caído) |
| `esconde_algo` | o segredo da pessoa (a quest, o livro de factos) |
| `ja_convencida` | o sucesso de antes com a mesma pessoa e o mesmo pedido (o livro de tentativas) |
| `morta` · `desacordada` | a luta (PV a zero, nocaute) |
| `moribunda` | o socorro (o caído com as horas a correr) |
| `dormindo` | a rotina e a hora da pessoa |
| `do_grupo` | os companheiros |
| as criaturas (`faminta`, `acuada`, `territorial`, `ferida`, `mansa`, `assustada`) | o encontro e a luta |
| `trancado` · `selado` · `sem_resistencia` | o objeto em cena e a quest (o cofre, a porta selada por magia, o portão entreaberto, a carroça sabotada) |
| `vigiado` · `territorio_de_alguem` · `com_testemunhas` | o lugar, o dono dele e a hora (a ronda, a praça cheia) |
| `armadilhado` · `ha_algo_escondido` · `suspeito` | o que `objetoEmCena` e `achadoDe` já dizem |
| `fragil` · `escorregadio` · `perigo_fisico` | o terreno e o clima (a chuva molha o muro) |
| `escuro` | a hora e a luz (o que `escuro` já diz ao catálogo) |
| `em_movimento` | o veículo ou a montaria em marcha |
| `ameacado` | o motor da consequência: o tranco que acabou de acontecer (o barco virou, a queda, o fogo) |
| `a_vista` | o que a cena já mostrou (a narração do turno de antes, a lista do que se vê) |
| `rastro_fresco` · `rastro_velho` · `rastro_obvio` | o rastro da quest com a idade em horas (a chuva apaga, a lama marca) |
| `do_heroi` · `raro_de_achar` · `coisa_comum` | o inventário do herói e a raridade do item no catálogo |
| `com_pressa` · `algo_se_aproxima` | o relógio da quest e o encontro iminente (a emboscada) |
| `som_claro` · `som_abafado` | o que há entre o herói e a fonte (porta aberta ou fechada, parede) |
| `assunto_raro` | a quest e o livro de factos (o assunto que nem todo mundo reconhece) |
| `ceu_encoberto` | o clima |
| `ja_testado` | o livro de tentativas (`tentativas` de `lerAcao`: a mesma chave já rolada) |
| `ja_resolvido` | a etapa da quest já fechada |
| `heroi_treinado` | as perícias treinadas da ficha |
| `heroi_ja_sabe` | o saber comum da ficha (o livro de factos, a terra, o ofício — `saberComumDe`) |
| `heroi_tem_alavanca` | o inventário cruzado com a quest (a chave, a senha, o documento que abre ISTO) |
| `heroi_penalizado` | as condições do herói (bêbado, ferido, exausto) |

É campo novo e aditivo; a versão antiga o ignora.

## 15. A cena do jogo (o preparo da fiação)

**18/11/2026, módulo puro + suíte, sem tocar no App.** Faltava quem montasse a cena a partir do estado
real do jogo. Agora é `src/a-cena-do-jogo.js`:

- `cenaDoJogo(retrato)` → a cena no formato que a régua lê, ou `null` quando o retrato não diz onde o
  herói está (sem `lugar`, `cidade`, `jornada`, `masmorra` nem `encontro`) — e aí o jogo fica como hoje.
- `chamadoDoMomento(frase, leitura, retrato, ctx)` → `{ rola, chamado | null, porque, diz, resposta,
  espontaneo: null, destino | null, cena, veredito, pesos, ouviu }`. O `chamado` tem a forma de `oChamado`,
  **a conversa incluída**: a que rola ganha o número da escada do pedido e o preço dito antes
  (`O_CHAMADO_DA_CONVERSA`: «Se falhar, a resposta é não, e pedir igual não muda nada.» — é o que o livro de
  tentativas de fato cobra; a relação que piora não é cobrada pelo jogo, e o aviso não a promete).
- `chamadoQueOMundoProvoca(retratoAntes, retratoDepois)` → `{ pericia, estado, porque, chamado }` | null: o
  dado espontâneo, com a cara de `chamadoDaRolagem`, contra o degrau «comum» da tabela de dificuldades, o
  preço que falhar É (não perceber, ser notado, não lembrar) e uma chave própria (`espontaneo|<estado>`):
  o livro de tentativas não ganha uma busca que o jogador não fez.
- `valeRolagem` ganhou um campo **aditivo**, `veredito`: com cena, o veredito inteiro que a régua julgou (o
  do catálogo, o que a escuta ouviu, ou o do ato da frase encadeada — com `dc`, `social` e `pessoa`); `null`
  no destino. Sem cena a resposta segue a de hoje, byte a byte. O exame saiu **idêntico** antes e depois
  (régua A 346/381, B 158/196; indevido 2 e 6; pares 97 e 54).

### 15.1 De onde vem cada estado (`DERIVACAO_DA_CENA`)

A tabela é do módulo, e a suíte prova cada linha com um retrato que a acende e um que não.

| estado | de onde vem no jogo |
|---|---|
| `disposta` · `desconfiada` · `hostil` | a relação do NPC na escada (`social.js`): um laço acima do «neutro» · rival · inimigo; e o inimigo de pé na luta é hostil |
| `com_medo` | o inimigo que se rendeu (`rendido`, sem-espada) ou a condição `amedrontado` |
| `esconde_algo` | quem do lugar sabe o que a espinha guarda (`segredosGuardados(...).gente`), ou quem a **etapa da quest declara** que esconde |
| `deve_favor` | o livro de fatos guarda um `favor` deste lugar, e a pessoa é do posto (`doSitio`) |
| `do_grupo` | os companheiros da ficha |
| `morta` | o status sem volta (`estadoSemVolta`), ou o inimigo caído sem ter sido poupado |
| `desacordada` · `moribunda` | o poupado do golpe final; o companheiro caído estável · a sangrar (`caidosDoGrupo`) |
| `dormindo` | a rotina da pessoa a esta hora (`DORMINDO`, gente-por-dentro) |
| `ferida` · `assustada` | a vida do inimigo abaixo da máxima · `amedrontado` (ou o bicho rendido) |
| `territorial` | a besta do confronto da quest, com o herói no covil (`passo.confronto` + `noLugarDoPasso`) |
| `trancado` | fora da masmorra, a tranca que o mundo deriva de toda porta (`trancaDe`); na masmorra, só a sala de enigma por abrir; e o que a etapa declara trancado |
| `vigiado` | só o que a etapa declara (o mundo não guarda a ronda) |
| `armadilhado` · `ha_algo_escondido` | a sala de armadilha que não disparou, o segredo de perigo não visto · o achado (`achadoDe`, lugar ou passo), o segredo da sala não revelado |
| `escuro` | a masmorra sem tochas (`noEscuro`), ou a noite ao ar livre (`ehNoite`) |
| `escorregadio` · `ceu_encoberto` · `perigo_fisico` | o clima ao ar livre (`CLIMAS`): chuva/tempestade/granizo · o céu fechado · a tempestade |
| `rastro_fresco` · `rastro_velho` | o sinal de rastro do encontro da estrada antes de ser visto · o passo de rastro da quest com o herói num lugar dele |
| `com_pressa` · `algo_se_aproxima` | um relógio de ameaça · de caçada a um segmento de encher |
| `com_testemunhas` · `territorio_de_alguem` | dentro dos muros, de dia, na rua ou num lugar público aberto (`abertoAgora`) · num quartel/cadeia, ou num lugar fechado a esta hora |
| `heroi_penalizado` | uma condição do herói com `desvantagem` |

**A porta é sempre a primeira coisa**: a régua lê `haOposicao(cena, { sobre: "coisa" })` na primeira coisa
da lista, e é a porta que o «arrombo a porta» procura.

### 15.2 Os estados sem fonte (`ESTADOS_SEM_FONTE`, 24 de 53)

Três razões, cada uma escrita estado a estado no módulo:

1. **Não há fonte no jogo:** `faminta`, `acuada`, `mansa`, `fragil`, `suspeito`, `em_movimento` (a viagem
   anda por trechos), `ameacado` (o motor da consequência ainda não escreve o tranco), `som_claro`,
   `som_abafado`, `assunto_raro`.
2. **A fonte é de UMA coisa ou UM assunto, e a régua lê a marca na cena INTEIRA** (`temMarca`): escrita
   pela fonte, calaria dados que nada têm a ver — `ja_convencida` e `ja_resolvido` (a linha `jaResolvido`
   calaria a escalada do muro), `do_heroi`, `raro_de_achar`, `coisa_comum`, `selado`, `sem_resistencia`,
   `a_vista`, `rastro_obvio`, `heroi_treinado`, `heroi_tem_alavanca`. **Isto é um achado para a régua:**
   estas linhas precisam de ler o alvo da ação (como `haOposicao` já faz) antes de o jogo as poder escrever.
3. **O catálogo já faz, e o estado desfaria:** `ja_testado` (o livro de tentativas já cala no catálogo, e o
   estado calaria também a via nova que ele reabre), `heroi_ja_sabe` (o saber da ficha já entra por
   `ctx.saber`), `motivo_para_negar` (o papel já pesa no número pela escada; como estado, sem o tamanho do
   pedido, faria a pergunta de cortesia ao guarda rolar).

### 15.3 A previsão: o corpus da mesa numa cena calma

A taverna aberta, de dia, céu limpo, a taverneira do posto e um companheiro. Das **439** frases de
`corpus-da-mesa.json`, **54 mudam** contra o Mestre de hoje e 385 ficam iguais:

- **deixam de rolar: 46** — a busca sem nada escondido (`buscaVazia`, **36**): o Mestre descreve; o curativo
  sem pressa nem perigo (`socorroCalmo`, 9); orientar-se com o céu à vista (1);
- **passam a rolar: 6** — escutar onde há gente (`haOQueOuvir`, 3), esgueirar-se onde alguém pode notar
  (`alguemPodeNotar`, 2), um ato de frase encadeada (1);
- **ganham o chamado: 2** — a conversa com um estranho, que antes rolava sem o preço dito.

É a nossa previsão do que o jogador vai sentir: menos dado de rotina na busca, o mesmo onde há risco, e a
conversa com o número e o preço à vista. A queda da busca é a régua de §3 a funcionar («senão o Mestre
descreve») — e é exatamente o que a sessão jogada tem de confirmar que não esvazia a mesa: com a cena
viva, o achado do lugar (`achadoDe`) e o passo da quest é que reacendem a busca.

### 15.4 O roteiro da fiação no App (para o `oficial`)

**A chave.** Uma preferência desligada por omissão (o mesmo padrão de `pecasLigadasRef`: lida uma vez,
`taverna_cfg_mestre_vivo` ou `?mestrevivo=1`). Desligada, **nada disto é chamado** e o turno é o de hoje.
Tudo em `try/catch` com `calou(...)`; qualquer falha devolve o caminho de hoje.

**1. O retrato** — uma função `retratoAgora()` ao lado de `ctxDesafio`/`ctxDoChamado`, que monta o objeto
de `FORMA_DO_RETRATO` só com refs:

| campo | o que entra |
|---|---|
| `lugar`, `cidade`, `jornada`, `minuto`, `clima` | `lugarRef.current`, `cidadeAtualRef.current`, `!!jornadaRef.current`, `minutoRef.current`, `climaRef.current` |
| `pessoas` | `quemAgeAqui(quemEstaAqui({...}))`, cada nome cruzado com `npcsRef.current[nome]` (`papel`, `relacao`, `status`, `condicoes`), `agora` = `fichaDaPessoa(...).rotina.agora`, `doPosto` = veio de `doSitio` |
| `grupo` | `(fichaViva() \|\| personagem).grupo` |
| `inimigos` | `combateRef.current?.inimigos` |
| `encontro` | `encontroPendenteRef.current` |
| `masmorra` | `masmorraRef.current` |
| `achado` | `!!(ctxDesafio().achadoDe("percepcao") \|\| ctxDesafio().achadoDe("intelecto"))` |
| `segredos` | `segredosGuardados(espinhaRef.current, mundoDaBase())` |
| `favorAqui` | `factosRef.current.lugares[<id do lugar>]?.favor` |
| `relogios` | `relogiosRef.current` |
| `heroi` | `{ condicoes: (fichaViva() \|\| personagem).condicoes }` |
| `passos`, `onde` | `passosDasQuestsAgora()`, `ondeDoPasso()` |
| `quest` | a declaração da etapa ativa (`{ esconde, trancado, vigiado }`); nenhuma etapa declara ainda — fica `{}` até a biblioteca de quests ganhar o campo |

**2. Na frase do jogador** — em `adjudicarAcao`, no ponto em que hoje se chama `veredictoDaAcao(acao)` e
depois `chamadoDoVeredito(v, op.mod)`:

```js
const m = chamadoDoMomento(acao, ctxDesafio(), retratoAgora(), {
  ...ctxDoChamado(), bonusDe: (v) => /* o mesmo op.mod de hoje, pela perícia de v */,
});
// m.cena === null            → o caminho de hoje, sem mudar nada
// !m.rola                    → não rola: narra-se acontecendo (m.porque diz por quê; m.resposta vai à pauta)
// m.destino                  → a bandeja mostra o d6 de m.destino.dado; o Narrador recebe só m.destino.diz
// m.rola && m.chamado        → o chamado de sempre com m.veredito (a carta em jogo e a peça por cima, como hoje:
//                              comACartaEmJogo(m.chamado, m.veredito, acao) / oChamadoDaPeca)
// m.rola && !m.chamado       → o teste rola como hoje, sem linha (não havia preço a dizer)
// m.porque começa "encadeada:" → o dado cai no ato arriscado; o Narrador narra os outros atos acontecendo
```

O veredito que vai à bandeja, ao livro de tentativas e ao envelope é **`m.veredito`**, nunca o do catálogo
de novo: é o que a escuta ouviu. A conversa que rola passa pela bandeja como qualquer chamado; o
resultado continua a ser resolvido pela escada (`envelopeSocial`), que já sabe o que o sucesso compra.

**3. Entre dois turnos (o espontâneo)** — guardar o retrato do fim do turno anterior num ref
(`retratoAntesRef`, só memória, não vai ao save) e, depois que o mundo aplicou o turno (o relógio andou,
o lugar mudou, a hora virou), chamar `chamadoQueOMundoProvoca(retratoAntesRef.current, retratoAgora())`.
Se vier `chamado`, ele entra pela mesma bandeja das outras origens (`chamadoDaRolagem`). **Não** chamar
enquanto o encontro da estrada tem o pedido dele em aberto (`encontroPendenteRef.current?.pedido`): ele já
pede a Percepção do sinal.

**4. O save** — **nada de campo existente muda.** Só entra, aditivo e ignorado pela versão antiga, a
preferência da chave. O retrato e a cena são **derivados** a cada turno dos refs que já estão no save — não
se guardam (guardar a cena criaria uma segunda verdade que envelhece). `retratoAntesRef` é memória de
sessão: ao carregar um save, começa `null`, e o primeiro turno não provoca espontâneo.

**5. A pauta do Narrador** — pelo canal por turno (`pauta`, SECOES com prio, dentro de `TETO_DA_PAUTA`),
**nunca bloco estático**:

- `m.resposta === "evasiva"`: uma linha curta — a pessoa desconversa ou mente, a verdade fica guardada
  (`RESPOSTAS_DA_PERGUNTA[...].diz`); `"recusa"`: não responde, ou responde com uma ameaça; `"silencio"`:
  não pode responder. Vetos que forem preciso (não revelar o segredo) vão em `naoPode`.
- `m.destino`: só o `diz` («a sorte levou», «em parte», «a sorte ajudou») — nunca o número.
- `!m.rola` com veredito de teste: o envelope de «acontece» que o catálogo já tem para o livre, com
  `m.diz` como o porquê (bastidor: o Narrador lê, o jogador sente pelo efeito).
- O efeito dos estados (`ESTADOS_DA_CENA[...].efeito`: «desvia os olhos», «há passos de ronda») **pode**
  entrar como uma linha da cena, de prioridade baixa, cortável pelo teto. O nome do estado nunca.

**6. A prova** — a onda só fecha com uma sessão jogada com a chave ligada, contando: dados fora da luta
por turno (a régua de 04/11: um a cada dois ou três), buscas que deixaram de rolar e se a mesa esvaziou,
conversas com o preço dito, espontâneos pedidos.

## 16. A fiação (atrás da chave)

**19/11/2026, o `oficial`.** O Mestre que lê o momento está ligado no jogo, atrás de uma chave desligada
por omissão. Com ela desligada, a única função nova chamada é a que lê a chave; o resto do turno é o de hoje.

**Como ligar para jogar:** abrir o jogo com `?mestre=1` na URL (grava `taverna_cfg_mestre_vivo=1` no
localStorage de configuração; `?mestrevivo=1` também serve, o nome do roteiro de §15.4). `?mestre=0` desliga.
A chave é lida uma vez por montagem: depois de mudar, recarregue. Ela não vai ao save e não aparece em tela
nenhuma.

**A ponte pura:** `src/o-mestre-vivo-no-jogo.js`, provada por `testes/teste-mestre-vivo-fiacao.mjs` (80 asserções).
Contém a chave (`MESTRE_VIVO`, `lerAChaveDoMestreVivo`), o retrato a partir dos valores dos refs
(`retratoDosRefs`, só com as chaves de `FORMA_DO_RETRATO`), as quatro portas do momento (`oQueOMomentoFaz`:
hoje · destino · acontece · rola), o «livre» do que acontece (`vereditoDoQueAcontece`), a pauta de um turno
(`pautaDoMomento`), o d6 e o envelope do destino, e o espontâneo (`podeOMundoProvocar`, `rolagemDoEspontaneo`).

**O que foi ligado no `App.jsx` (por âncora):**

| onde | o quê |
|---|---|
| refs, junto a `pecaCalaRef` | `mestreVivoRef`, `momentoDoTurnoRef`, `momentoAdjudicadoRef`, `chamadoDoMomentoRef`, `retratoAntesRef`: só memória de sessão |
| ao lado de `ctxDesafio` | `mestreVivoLigado`, `retratoAgora` (cada leitura no seu `calou`, e null se estourar), `momentoDaFrase` (`chamadoDoMomento` com `ctxDoChamado` e `bonusDe` pela perícia), `momentoDaAdjudicacao`, `acontecerSemDado`, `destinoDoMomento` |
| `agirInterno`, antes de `sinaisDoTurno` | o momento é lido uma vez, fora da luta, sem escolha nem encontro pendente; o veredito da régua passa a ser o que `veredictoDaAcao` devolve neste turno (é assim que o que a escuta ouviu abre a porta do desafio) |
| `agirInterno`, antes das peças | o destino resolve o turno (o d6 na bandeja, o Narrador só com o `diz`); a pergunta que não rola leva a resposta (evasiva/recusa/silêncio) por `porNaPautaDoTurno` |
| `veredictoDaAcao` | lê `momentoAdjudicadoRef` quando a frase é a mesma; sem a chave o ref é null e é o catálogo de hoje |
| `adjudicarAcao` | depois do passo antes do ato, o momento julga onde o herói chegou; não rola → `acontecerSemDado` (só a frase na tela, o envelope do «livre» com o porquê da régua, o tempo passa, sem tentativa, desfecho «falha» para a cobrança); rola → o Mestre de hoje não concede por cima (`seguraOTeste` só sem `m`), e o chamado do momento vai a `chamadoDoMomentoRef` |
| `chamadoDoVeredito` | entrega o chamado do momento uma vez (mesmo `id` e `chave`), e por cima continuam `comACartaEmJogo` / `oChamadoDaPeca` como hoje; `null` = rola sem linha |
| efeito em `[carregando]`, depois do V3 | o espontâneo: quando o Narrador acaba, o retrato de agora contra `retratoAntesRef`; abre uma rolagem pela soleira de sempre (`chamadoDaRolagem`), sem chave no desafio |
| `pecasLigadas` | `pecasLigadasRef.current && !mestreVivoLigado()`: com as duas chaves, o Mestre vivo ganha e as peças ficam de fora |
| carregar / jogo novo | `retratoAntesRef.current = null` |

**Visto no jogo** (IA muda, `TAVERNA_API=http://127.0.0.1:9`, Chrome headless). Sem a chave: «procuro algo
escondido no balcão» → Percepção 13; «me esgueiro até os fundos» → Furtividade 15; «arrombo a porta dos
fundos» → Arrombamento 16, os três com o chamado de hoje. Com `?mestre=1`, na rua e depois numa taverna: a
busca não rolou (o envelope foi «Isto não pede dado: nada escondido nem perigo…», e o relógio andou 10 min);
a pergunta à companheira e ao taverneiro não rolaram (foram ao Narrador sem envelope); «peço ao taverneiro que
me empreste 50 moedas» → «Persuasão. Precisa de 14. Se falhar, a resposta é não, e pedir igual não muda
nada.»; esgueirar-se na taverna → Furtividade 15. Consola sem erro e sem nenhum `calou` do Mestre vivo.

**O que ficou de fora, e por quê:**

- **Na luta**, o Mestre vivo não entra: `rolarDesafio` tem caminhos próprios para a palavra e o esconder-se.
- **O que acontece sem dado não aplica efeito de sucesso** (o socorro, o «sim» da conversa a quem está
  disposto): narra-se acontecendo, e a cobrança é falha. A conversa que não rola com quem quer ajudar merece
  o envelope social de sucesso. É a primeira coisa a medir na sessão jogada.
- **`quest: {}`**: nenhuma etapa declara quem esconde, o que está trancado ou vigiado (§15.4).
- **O efeito dos estados como linha da cena** (§15.4 nº 5, prioridade baixa) não entrou: é opcional e mexe no
  peso da pauta.
- **A quest que escuta (§5)** e a convivência com as peças são a etapa seguinte.

**Do retrato no jogo real:** `clima` sai `null` até à primeira viagem, porque o clima só rola na estrada.
Então `escorregadio`, `ceu_encoberto` e `perigo_fisico` (e com eles o destino, que pede perigo) ficam calados
na cidade no começo da campanha. `relogios` vazio numa campanha nova. A rotina da gente do posto veio como
«no que faz», que nunca é `DORMINDO` de dia. `favorAqui` depende de o id do favor bater com o `idDoLugar` do
lugar atual, e isso não foi visto com um favor de verdade. O aviso de Furtividade dentro da taverna diz «alguém
na rua vê você»: é o `contexto.cidade` de `ctxDoChamado`, que já era assim antes desta etapa.

## 17. O conserto depois da primeira sessão

**19/11/2026.** A sessão jogada (`mestre-vivo-sessao.md`) mostrou o que o Mestre vivo faz bem — a conversa
com o preço dito antes — e seis falhas. Cada uma teve a causa procurada no código antes do conserto, e cada
conserto tem um caso nas suítes que falhava antes e passa agora. **Com a chave desligada o turno é o de
hoje:** as funções novas vivem dentro de guardas `if (mestreVivoLigado())` (agora cinco, contadas pela suíte da
fiação), e o que corre fora delas devolve o mesmo que antes (`semFioNoMomento` é `false` para todo desafio que o
momento não marcou; `desfechoDaMargem` só ganhou uma opção desligada por omissão).

**1. O dado «espontâneo» contado como ação do herói.** *Causa:* os dois espontâneos da sessão (a chegada ao
posto da estrada e à Sala das Cartas) **não eram do Mestre vivo**: eram a oferta «Olhar à volta» do Mestre de
hoje (`motor/o-mestre-pede.js`), que manda a frase «Olho em volta com atenção.» pelo caminho do jogador — uma
**busca** na boca do herói, com o aviso e o envelope da busca («você revira o que dá…»). O Narrador fez o que o
envelope dizia: o herói revirou a mesa e o baú. *O que mudou:* com a chave ligada, a oferta da chegada cala
(`PEDIDOS_QUE_O_MESTRE_VIVO_CALA`); a de ler a pessoa fica (é o jogador que a aceita). O espontâneo do Mestre vivo
(`chamadoQueOMundoProvoca`) ganhou o que mostra (`O_QUE_O_MUNDO_MOSTRA`, a-cena-do-jogo.js): o nome da coisa sai
do estado que provocou o dado — o relógio da caçada diz o que se aproxima, o céu diz a tempestade, o lugar diz de
quem é — e **sem nome, o espontâneo não é chamado**. A rolagem leva a marca do mundo (`doMundo`, `mostra`), e ao
pousar vai ao seu envelope (`envelopeDoEspontaneo`: «Eu não fiz nada: o mundo é que se mexeu…», e o que o herói
percebe ou deixa de perceber), antes de qualquer custo do catálogo; a pauta de um turno leva os vetos (`naoPode`:
não revistou, não mexeu, nada de achado por este dado) e quem o sistema sabe noutro lugar, pela linha da poda do
ausente (`PODA_DO_AUSENTE.linha`). Perceber não paga: para a cobrança, nada a ganhar.

**2. O resultado não respondia à pergunta do teste.** *Causa:* as 168 moedas vieram da **margem**: a busca da
oferta falhou por 2 (11 contra 13), e `desfechoDaMargem` dá à busca o «sim, pago» («por tão pouco o mundo
negocia: você acha»); o `passou` virou verdadeiro e o achado do lugar (`r.achado`) foi pago — com a bandeja a
dizer «✕ falhou». A voz atrás do rochedo era do Narrador, não do teste. E o «ouvir» que falhou com pedaços sem
sentido era Percepção para ouvir **quem falava com o herói**: a régua rolava escutar sempre que havia alguém em
cena (`haOQueOuvir`). *O que mudou:* (a) no Mestre vivo, a falha não paga: o desafio que o momento julgou leva a
marca (`marcarDoMomento`), e onde o sucesso é achar, ouvir ou perceber (`SEM_FIO_NO_MOMENTO`: busca, investigação,
escuta, rastro, os improvisos de percepção e intelecto) a margem não tem meio (`desfechoDaMargem(…, { semMeio })`)
— a força e o corpo continuam com o «sim, pago», porque ali o preço é pele; (b) uma linha nova na régua,
`ouvirQuemFala`: ouvir o que alguém tem para contar a você é conversa e não rola (`OUVIR_QUEM_FALA`); escutar a
conversa dos outros continua a rolar; (c) o espontâneo tem envelope próprio (item 1), e a busca nunca mais é o
molde dele.

**3. Risco claro que passou sem dado.** Cada causa verificada com a frase da sessão:
- *Escalar o muro do forte* caiu em `travessiaCalma`: só estado dizia perigo. O veredito do catálogo já traz a
  queda (`v.queda`). Linha nova, `riscoDoAto` (`RISCO_DO_ATO`): a queda de uma **fortificação** (muralha, forte,
  castelo, torre…) é o risco do próprio ato. **Não** a de toda altura: o exame (E174 «escalo o muro pra entrar no
  quintal», E365 o telhado pela calha, E371 a trilha larga do penhasco) e o estudo das mesas dizem que a
  travessia calma não rola, e a regra «todo risco intrínseco rola» teria subido o pedido indevido da A em mais de
  quinze frases. Fica escrito o desacordo: entre a frase do pedido e a mesa real, ficou a mesa real para a altura
  comum, e o risco do ato para a fortificação.
- *Roubar a bolsa de um bêbado* não era ouvido por ninguém: nem o catálogo nem a escuta conheciam «roubar … do
  bolso». Forma nova na escuta (o verbo de roubar e o que se tira), e na régua a vítima da frase
  (`A_VITIMA_DO_FURTO`): quem a frase diz que é roubado pode notar, esteja ou não no retrato; só o morto ou o
  desacordado sem mais ninguém dispensa o dado; quem dorme dá **vantagem** (o campo `vantagem` da régua vai ao
  dado como `vantagemDoMomento`, e o App só o lê no veredito marcado).
- *Pedir desconto* rolava numa frase e não noutra: «posso pedir…» rolava pela licença; «pergunto ao anão se ele
  faz um desconto» caía em `falaSemOposicao`; «pergunto quanto custa e tento barganhar pela metade» caía na linha
  da **pergunta** (a escada leu «quanto custa» como cortesia e não ouviu «barganhar»: o `\b` depois de «barganh»
  nunca casa); «faz pelo preço normal ou eu procuro outro» não era ouvido. O motivo para negar passou a ser lido
  **no alvo da fala**, por frase (`MOTIVO_PARA_NEGAR_DO_ALVO`): o dinheiro de quem vende (a barganha), um degrau
  da escada do pedido **dito** na frase (favor, risco, traição — o padrão não conta), a farda/batina/brasão (para
  quem pesa contra na escada, até a simpatia), e quem guarda segredo sob pressão («insisto», «até você falar»). A
  pergunta de cortesia continua sem dado, e a magia («conjuro amizade antes de pedir o desconto») resolve pela
  própria regra. Na cena o estado continua sem fonte (`ESTADOS_SEM_FONTE`), com o porquê novo: é da fala.
- *Mentira e ameaça de graça* no trecho de nove turnos: as frases da sessão, no retrato, **rolam** pela régua
  (`conversaComEstranho`); o que as calou no jogo foi o caminho antes do momento — «procuro um barqueiro…» é
  tomado por `procurarAlguem`, e a gente de que se falava (o tropeiro, o homem da capa) não estava no retrato
  (o Narrador pô-los lá). Isso é a família «nome na frase rouba a frase», fora deste pacote.
- **A regra de segurança** (`CALA_POR_AUSENCIA`): a linha que diz «não» só pela ausência de estado
  (`falaSemOposicao`) não ganha do Mestre de hoje — se ele rolaria, rola (`comoHoje`). As outras linhas que calam
  têm estado positivo (a pessoa disposta, nada escondido que o mundo conheça, ninguém que note, a altura comum).

**4. A ação sem dado não aplicava o que aconteceu.** *Causa:* `acontecerSemDado` só narrava, e marcava a
cobrança como falha. *O que mudou:* `oQueAconteceSemDado` diz o efeito: o sim de quem está do seu lado
(`dispostoCede`, `medoCede`, `falaSemOposicao`, `alavanca`) é sucesso — o envelope social do sim (o que compra e o
que não compra), o ouro da alavanca sai da bolsa, o livro de tentativas fecha-o como conseguido e a cobrança é
sucesso; o curativo calmo fecha como feito (e o socorro de sistema corre com sucesso). A conta do sim refaz-se
pela **frase do jogador** (visto no jogo: a fala ouvida pela escuta chegava com a frase-modelo do catálogo, e o
sim compraria «quebrar uma regra pequena» por uma chave de fenda emprestada). O que não tem efeito de sistema (a
busca vazia, o passo sem testemunha) narra-se e não rende.

**5. PT-PT na fala.** Procurei em tudo o que o Mestre vivo põe na pauta (as respostas evasiva/recusa/silêncio,
os `diz` da régua que vão ao envelope do «acontece», o chamado da conversa, os textos novos deste conserto): a
única segunda pessoa era «um estranho que não **te** deve nada» (a linha `conversaComEstranho`), agora «não deve
nada a você»; os textos novos têm uma asserção contra «tu/teu/tua/sabes». Os «teu», «sabes», «larga» da sessão
estavam na prosa do Narrador, não no que o sistema lhe mandou; a escada do pedido (`social.js`, «a boa vontade de
quem não te deve nada») é do Mestre de hoje também e ficou como está (mexer nela muda o jogo sem a chave).

**6. As frases da sessão viraram matéria de afinar.** 31 frases das duas sessões entraram na metade A do exame
(`origem: "sessao-mv-1"`, rodada 4), com a cena em estados e o veredito que o jogador julgou. A metade B não foi
tocada nem lida; foi medida uma vez, no fim.

**A medida.**

| | antes | depois |
|---|---|---|
| régua, metade A antiga (381 declaradas) | 346 certo · 2 indevido · 33 omitido · pares 97 | 347 · 2 · 32 · 97 |
| as 31 frases da sessão, régua | 23/31 | 31/31 (afinadas nelas: é treino) |
| as 31 frases da sessão, Mestre de hoje | 17/31 | 17/31 |
| régua, metade A inteira (412) | — | 378 · 2 · 32 · cat 303 · per 171 · pares 97 |
| régua, metade B (medida uma vez) | 158 · 6 · 32 · cat 119 · per 53 · pares 54 | **igual** |

A catraca da A subiu (régua 378 · 2 · 32 · 303 · 171 · 97) e a do Mestre de hoje mudou de lugar com o tamanho da A
(243 · 49 · 120 · 179 · 90 · 3), com o motivo escrito na suíte. A previsão do corpus da mesa numa cena calma passou
de 54 para 55 frases que mudam (uma barganha a mais rola).

**Visto no jogo** (Chrome headless por CDP; `TAVERNA_API=http://127.0.0.1:9`, servido por um Narrador mudo local
que devolve sempre a mesma linha — nenhuma IA chamada; com a porta recusada, o turno é desfeito e a cena não anda).
Com `?mestre=1`: «vou escalar a muralha da cidade pra espiar de cima» → Atletismo 15, «Se falhar, você despenca lá
de cima»; «tento roubar a bolsa de moedas do bolso do Bruno» → Prestidigitação 15; «posso pedir um desconto pro
Bruno?» → Persuasão 18 e «pergunto ao comerciante se ele faz um desconto» → Persuasão 15, as duas com o preço dito;
«pergunto ao Bruno onde fica a capela» → sem dado; «peço à Wren que me empreste uma chave de fenda» → sem dado, o
envelope «[SOCIAL — RESOLVIDO PELO SISTEMA] … CONSEGUI», e o pedido seguinte à Wren já veio «Isso você já conseguiu
aqui — sem dado» (o livro guardou o sim). Com `?mestre=0`: a muralha → Atletismo 15; o furto e o desconto → sem dado;
«procuro algo escondido nas prateleiras» → Percepção 13; «me esgueiro até os fundos» → Furtividade 15 — o Mestre de
hoje, como em §16. Consola sem `calou` do Mestre vivo.

**O que ficou por fazer.**
- «pergunto ao Bruno se ele faz um desconto» — com o **nome** de quem está em cena — vai a `procurarAlguem` antes do
  veredito («Bruno está aqui») e não rola: é a família «nome na frase rouba a frase», fora deste pacote.
- Numa cena só com o companheiro, a fala dirigida a quem não está (o vendedor) cai no companheiro, que está do seu
  lado, e é concedida: o alvo da fala precisava de saber quando a frase descreve outra pessoa.
- O livro de tentativas fecha **a pessoa**, não o pedido: depois de um sim da Wren, o segundo favor diferente também
  vem «já conseguiu». É regra antiga do livro, que o sim sem dado agora alimenta.
- O espontâneo não foi provocado no jogo (pede território fechado, tempestade ou caçada a um passo): está provado
  nas suítes, não jogado.

## 18. O conserto depois da segunda sessão

**19/11/2026.** A segunda sessão jogada (`mestre-vivo-sessao-2.md`) deixou quatro pontos para o Mestre vivo. Cada
causa foi procurada rodando as frases da sessão contra `chamadoDoMomento` com o retrato da cena; cada conserto tem
um caso nas suítes que falhava antes e passa agora. Vale a regra nova da pessoa (19/11): **não existe cota de
dado**. Só há dois erros — a ação arriscada sem dado e o dado onde um mestre real não pediria.

**1. Mentira, ameaça e barganha sem dado.** Três causas, nenhuma de estado:
- *O alvo da fala era o companheiro.* Sem nome no veredito, a régua tomava o primeiro de fora do grupo e, sem
  ninguém de fora, o companheiro: «digo pro cobrador que sou enviado do conselho» (T5) e o desconto pedido «pro
  vendedor» (T3) caíram em Jasper, que está do seu lado, e passaram. O inverso também: «peço pro Jasper…» (T13)
  caiu na artilheira e rolou Persuasão 18. Pior, a fala que só a escuta ouvia chegava com o «guarda» da
  frase-modelo do catálogo como alvo. *Conserto* (`O_ALVO_DA_FALA`, `quemAFraseNomeia`, `estranhoAQuemSeFala`):
  o alvo sai da frase — quem ela nomeia (o nome próprio ou o papel inteiro, sem o gênero); só com gente do grupo
  em cena, o «pro X» que não é do grupo é um estranho fora do retrato, sem estado; o «guarda» da frase-modelo é
  ignorado. O pedido ao companheiro não deixa a régua julgar como ato do herói o que ele vai fazer depois.
- *Mentira e ameaça eram «conversa sem oposição».* A fala que só a escuta ouvia («falo pra Seraphina que sou
  fiscal do porto», T16; «ou ela me conta, ou eu conto pro conselho», T14) caía em `falaSemOposicao`. *Conserto*
  (`MENTIRA_E_AMEACA`): a oposição é do próprio ato — quem ouve a mentira perde algo se acreditar, quem ouve a
  ameaça resiste —, como a queda é da muralha. Linhas novas `mentiraOuAmeaca` e `ameacaAoDisposto` (ameaçar quem
  está do seu lado não é favor: T8). Ficam sem dado quem já tem medo, quem já cedeu, quem não pode responder, e a
  mentira a quem já deixa passar (o exame, E094). A mentira que a escuta ouve pela forma só é certa quando o herói
  se dá título, cargo ou licença (`quemSeDiz`): «explico que a Helga me mandou» pode ser verdade (E696).
- *A escuta não ouvia.* A ameaça pela condição com a consequência depois (T8) e pelo fim prometido («ou não sai
  daqui inteiro», T30); o furto por «tirar» e pelo cinto de alguém (T9); a barganha por «pagar bem menos» (T17);
  e, da metade A, a mentira dita direto (E330), «pensa no que vai responder» (E336), «aperto o cara até ele
  cuspir» (E308).

**2. Texto de sistema na narração.** «O sucesso te garante o favor sem risco» (T16) era o sim sem dado chegando ao
Narrador pelo envelope do **teste** social (`envelopeSocial`: «O QUE O SUCESSO COMPROU… o teste já foi»), com o
«favor de quem não arrisca nada» do degrau. E o «livre» do que acontece levava o `diz` da linha da régua — a regra
em palavras («ninguém tem motivo para negar: a conversa resolve», «o bónus torna o resultado certo»). *Conserto*
(`o-mestre-vivo-no-jogo.js`): `O_QUE_ACONTECE.naCena` — por linha que não rola, o **fato de cena** («quem me ouve
está do meu lado, e aceita»), e a suíte prova que nenhum fala de dado, teste, sucesso, sorte, risco, Mestre, bônus
ou perícia; `O_SIM_SEM_DADO`/`envelopeDoSimSemDado` — o sim como fato (o que a pessoa faz e o que não faz), sem a
palavra da regra e guardando o «e CONSEGUI» que a ficha do ator lê; o veto `semMecanica` em `naoPode`, pelo canal
de um turno, em todo turno que acontece sem dado; as linhas da pauta do destino e da frase encadeada sem «dado» nem
«perícia». **Falta o App** (abaixo). As linhas «⚖ Faltaram 1 — e fica meio caminho» (desafios.js) e «✨ com dez de
folga — a folga compra alguma coisa» (mestria.js) são falas de tela do Mestre de hoje, com ou sem a chave: não foram
mexidas aqui.

**3. PT-PT.** Nos módulos do Mestre vivo, o que vai ao Narrador ou à tela já era PT-BR; a única forma lusa em texto
era bastidor («o companheiro caído a sangrar», na fonte da derivação), agora «sangrando». Os «tu», «teu», «leva»
da sessão estão na prosa do Narrador. Os textos novos têm asserção contra tu/teu/tua.

**4. O espontâneo que não apareceu.** A regra não disparou porque **nenhum estado que chama nasceu**: as quatro
chegadas (templo, bateria, trapiche, feira) de dia e a estrada de garoa não têm território fechado, tempestade nem
caçada a um passo; `vigiado` só a quest declara (e nenhuma declara) e `assunto_raro` não tem fonte. Isto é a regra
a funcionar — sem mundo que se mexa, não há dado de graça —, e a emboscada da estrada e a armadilha da masmorra já
têm o seu dado (o encontro e a Percepção passiva da sala). Dois defeitos achados no módulo, consertados: o
território de **portas abertas** (o quartel de plantão) chamava Furtividade a quem entra pela frente — um mestre não
pede isso a quem não se esconde; agora só o lugar fechado a esta hora provoca. E o nome do relógio da caçada é uma
frase («Vesna fecha o cerco»), e o molde o lia como nome («é Vesna fecha o cerco, e está perto»).

**Cota de dado.** Nenhuma lógica que conte turnos para provocar dado nos módulos do Mestre vivo. Fora deles, no
Mestre de hoje: a temperatura da mesa (`mestria.js`) conta cinco turnos — «quente» (três dados em cinco) dispensa o
teste dispensável, e no Mestre vivo já está desligada (`seguraOTeste` só sem o momento); «fria» (cinco sem dado) faz
o mundo puxar um fio, não rolar. Nenhuma das duas força dado; ficaram.

**A medida.**

| | antes | depois |
|---|---|---|
| régua, metade A (412) | 378 · 2 · 32 · cat 303 · per 171 · pares 97 | **381 · 2 · 29 · cat 309 · per 174 · pares 100** |
| régua, metade B (medida duas vezes, só o agregado) | 158 · 6 · 32 · cat 119 · per 53 · pares 54 | **igual** |
| frases da sessão mv-2 no retrato da cena (11 de risco, 3 de controle) | 2 de 11 rolam; 1 controle indevido (T13) | **10 de 11** rolam (fica T22); controles certos |

A B não se mexeu: o que mudou é, quase todo, a cena que o jogo real fornece (o companheiro como único presente, o
estranho que o retrato não tem), e o exame descreve a cena com a pessoa sempre presente.

**O que fica para o App** (`acontecerSemDado`): usar o envelope do sim que o módulo já devolve —
`env = q.envelope || envelopeSocial(conta, { passou: true, quem: q.quem || "essa pessoa", oQueEuDisse: acao });`.

**O que ficou de fora.** T22 (atravessar o cais pulando de barco em barco, em fuga): o catálogo não ouve «pulando
por cima dos barcos», e a fuga não é estado da cena — família da travessia, fora deste pacote. As frases da sessão
mv-2 não entraram no exame. Nada disto foi jogado: está provado nas suítes e no retrato montado à mão.

## 19. O conserto depois da terceira sessão

**19/11/2026.** A terceira sessão (`mestre-vivo-sessao-3.md`) não mostrou falta de dado: mostrou **a mesma ação com dois
vereditos**. Cada turno foi reproduzido por `chamadoDoMomento` com o retrato montado pelo `retratoDosRefs`, com frases
nossas; cada conserto tem caso nas suítes (S19 da régua, da cena do jogo e da fiação; `teste-desafios`).

**1. A inconsistência era do alvo, não da ação.** Com a pessoa no painel, mentir ao guarda (T2), pedir metade do preço
(T5) e mentir a Bryna (T24) já rolavam. No jogo a pessoa não estava no painel, e o alvo caía na Orla, que «aceita». Agora
(`O_ALVO_AUSENTE`, `nomeAusenteNaFrase`) o nome próprio logo depois do verbo da fala que não está em cena vira um estranho,
mesmo com outros de fora presentes; o nome ou papel que não casa com ninguém nunca cai no companheiro; a barganha sem nome,
só com o grupo, é com quem vende. **Regatear** entrou no catálogo (convencer) e no preço do motivo para negar (T4, T18).
**Mentir à companheira** rola (`mentiraAoGrupo`, T13): ela sabe o que viu. A mentira ao disposto de fora (E094) continua
sem dado. **Revistar com o dono ali** (T21) é mão leve contra ele (`A_BUSCA_SOB_OLHOS`): Prestidigitação. A busca **sem dono
e sem nada escondido** (T9, T29) continua descrita. É a regra do estudo e do exame (E002, E010, E383, E703): sem nada a achar
não há incerteza nem preço. Se a pessoa julgar que ali devia rolar, a mudança é de regra, não de conserto.

**2. O corpo em risco.** A régua só via perigo em estado, e o mundo não escreve vão, água nem perseguidor.
`PERIGO_DECLARADO`: o vão, a água por baixo, a fuga, a altura em metros (≥ 3) ou andares (≥ 2) **ditos na frase** são
perigo do ato (T12, T27, e o «pulando de barco em barco» da sessão 2, que o catálogo agora ouve no gerúndio). A palavra
solta não conta: «subo no telhado pela calha» numa cena calma continua sem dado, como no exame (E365). Por isso o T7, como
foi resumido, segue sem dado. Rola se a frase disser a altura.

**3. A ameaça com a arma** caía em `forcar` («levanto o Doran pela gola…»): Atletismo. O catálogo ouve a arma mostrada a
alguém, ou na mão de quem agarra, como Intimidação (T22).

**4. O livro das tentativas.** A chave de `forcar` era `lugar|peso`, e o Atletismo falho do T22 fechou a busca do T29. Agora
a tentativa fecha por ação e objeto (`objetoDaChaveDe`), e afastar tela, lona, tapete ou quadro deixou de ser peso. A causa
estava em `desafios.js`, não no App.

**5. Falha sem preço** (T25). A régua só rola o esgueirar porque alguém pode notar, e sabe quem. `marcarDoMomento` põe no
veredito `secaDoMomento` («Orin me vê onde eu não devia estar…», `O_PRECO_NA_CENA`), e `desfechoDaMargem` usa esse texto
na falha seca. O envelope da falha só diz «já cobrou o tempo» quando houve tempo a cobrar.

**6. Texto de regra.** «Se falhar, a resposta é não, e pedir igual não muda nada» virou o fato da falha por perícia (a
resposta é não; a mentira não cola; a pessoa não se dobra). «Passou por 1 — e por um fio o mundo cobra» virou «Por um
fio: …», e «por tão pouco o mundo negocia» virou «Faltaram N, e ainda assim: …». «O que abriria: no braço» virou
«Outro jeito: à força, no ombro». A via dita depois de «sem» já não é a pedida («arrombo sem ferramentas» rola
Arrombamento). «o que você tentou, conseguiu» virou «um risco enfrentado, e vencido». As três primeiras e a quarta valem
também no Mestre de hoje.

**A medida.** Régua, metade A: 381 · 2 · 29 nas 412 antigas, **inalterada**; mais 32 itens novos da sessão mv-3
(`origem: "sessao-mv-3"`), 32 de 32 certos: **413 · 2 · 29 · cat 340 · per 196 · pares 102**. Metade B (duas medidas, só o
agregado): antes 158 · 6 · 32 · cat 119 · per 53 · pares 54. Depois, medida **antes dos últimos ajustes**: 157 · 7 ·
pares 53. Os ajustes vieram depois, todos tirados da A e dos corpus, nunca da B: a arma mostrada passou a exigir alguém
diante dela, porque «ergo a espada em saudação» virava ameaça no corpus do improviso; o nome ausente só conta depois do
verbo da fala; a mentira à companheira ganhou a mesma guarda da mentira ao estranho; a altura passou a ser lida também em
andares. A B não foi medida de novo, a catraca dela ficou onde estava e pode estar vermelha.

**O que fica para o App.** (a) Com `secaDoMomento` no desafio, a pergunta da testemunha ao oráculo contradiz o fato: em
`concluirRolagem`, `if (des && des.testemunha && !passou) {` → `if (des && des.testemunha && !passou && !des.secaDoMomento) {`.
(b) A legenda do dado anterior colada na narração seguinte e o «72 moedas» solto não foram achados nos módulos: a busca
deve começar pelo App.

## 20. O conserto depois da quarta sessão

**21/11/2026.** A quarta sessão (`mestre-vivo-sessao-4.md`, jogada em `eac20b5`) deu 21 de 31 certos, 7 «faltou dado»
e nenhum dado indevido. Antes de mexer no motor, a prova mudou de mãos.

**A metade C (rodada 6).** A B foi medida três vezes — a terceira depois de ajustes — e deixou de ser cega. Ela passa a
afinar junto da A, só em número. A prova nova é a **metade C**: 130 itens (67 rolam, 63 não; 25 pares; 6 espontâneos),
escritos sem rodar o catálogo, a escuta nem a régua, julgados como um mestre de mesa experiente, com **pares
mínimos**: o dono olhando ou não, o alvo disposto ou não, o companheiro ou o estranho, o perigo dito ou não, há o que
achar ou não. Nenhuma frase das sessões 3 e 4 nem de mesa real. Quem afina roda a suíte com `EXAME_SEM_C=1` (a C sai
da medida e só a forma dela é conferida); o `npm test` mede a C e guarda a catraca. A C se mede uma vez antes do
conserto e uma vez no fim.

| C, primeira medida (antes de qualquer conserto) | rola certo | indevido | omitido | categoria | perícia | pares |
|---|---|---|---|---|---|---|
| régua | **102 de 124** | 1 de 61 | 21 de 63 | 82 | 36 de 42 | 18 de 25 |
| hoje | 72 de 124 | 19 de 61 | 33 de 63 | 61 | 26 de 30 | 0 de 25 |

Cada turno da sessão foi reproduzido por `chamadoDoMomento` com o retrato do jogo **e com o livro de tentativas em
sequência** (a mentira conseguida antes da seguinte, o furto falho antes do esconderijo). Foi o livro, e não a régua,
que explicou metade da sessão. Cada conserto tem caso nas suítes (S20 de `teste-desafios`, da régua, da cena do jogo e
da fiação), e os 32 turnos entraram na metade A como itens nossos (`origem: "sessao-mv-4"`, rodada 7).

**1. O livro fechava a ação errada.** Duas chaves sem objeto. A da furtividade era `lugar|furtividade`: a Furtividade
falha do furto (T13) fechou todo esconder-se da feira, e dois esconderijos novos (T24, T31) ouviram «você já tentou
passar sem ser visto aqui». A da mão leve era `lugar|furto`: o cantil falho (T14) fechava qualquer outra mão leve no
mercado. *Conserto* (`desafios.js`): `objetoDaChaveFina` no esgueirar (o esconderijo ou o caminho: «atrás dos
caixotes», «pela viela») e na mão leve (a coisa e de quem: «a bolsa do homem do caixote»); sem objeto dito, fica a chave
do lugar. **A chave fina só vale com `ctx.chaveFina`**, que o App põe no contexto do desafio quando o Mestre vivo está
ligado: com a chave desligada o livro é o de sempre, e o jogo não muda. E o furto que diz «sem ser visto» (T13 rolou
Furtividade) a régua troca pela mão leve (`O_FURTO_SEM_SER_VISTO`); o catálogo de hoje continua lendo esgueirar.

**2. A mentira ao companheiro não chegava à régua.** A linha `mentiraAoGrupo` dispara (prova: «minto a Perrin» rola
numa cena vazia). Quem calava era o livro: a chave da conversa é «este pedido a esta pessoa», mas quando o elenco não
acha a pessoa (o velho fora do painel, o companheiro fora do registro) ela virava `quem quer que seja`. A mentira que
passou com o velho (T4) fez da mentira a Perrin (T5) uma «coisa já conseguida» — `livre`, sem dado, sem custo — e o
veto `naoETeste` cortava antes da régua. *Conserto*: a chave leva quem a frase nomeia (`ouvinteDaChave`: a palavra
depois da preposição da fala, ou o objeto direto de «minto/ameaço/convenço»); sem ninguém dito, continua
`quem quer que seja` (também só com `chaveFina`). «Mulher» deixou de passar por infinitivo, nas duas pontas: «conto a mesma mentira pra mulher da
criança» caía em Perrin (régua, `O_ALVO_DA_FALA.naoEInfinitivo`) e fechava como `quem quer que seja` (livro).

**3. O regateio, um veredito.** Três causas, e só uma era a régua: (a) com a vendedora **disposta**, a linha
`dispostoCede` ganhava — nova linha `precoComSimpatia`: o desconto sai do bolso dela, goste ou não do herói; só o laço
que deve (o favor, o companheiro, o sim já dado) dispensa o dado; (b) «fecha por 15» não era preço
(`MOTIVO_PARA_NEGAR_DO_ALVO.preco`, da régua, ouve «fecha/deixa/vende por N»); (c) a mesma colisão de chave do ponto 2: o sim
sem dado de uma conversa fechava como conseguida toda conversa `quem quer que seja` do mesmo tamanho.

**4. As buscas.** Revistar os cestos com a dona olhando (T22) *já* era mão leve na régua; o que a calava era o livro:
a frase-modelo da mão leve era sempre a mesma bolsa, com a chave `lugar|furto`, e o cantil falho (T14) a fechava —
a régua caía na busca vazia. Agora a frase-modelo leva a coisa revirada (`A_BUSCA_SOB_OLHOS.objeto`/`comObjeto`), e o
dono pode ser dito pelo papel («da vendedora»), não só pelo nome ou por «dele». As buscas por coisa escondida (T21
«sob as telhas», T23 «atrás dos caixotes») continuam sem dado, pela régua do mestre real: procurar rola quando há o
que achar ou quando ser visto custa, e ali o sistema **não sabe** se há algo. **O que falta ao sistema saber:** o
achado só existe por lugar do mapa (`achadoDe` do sítio, o segredo da sala da masmorra) e pelo que a quest declara
escondido; o telhado do depósito, os caixotes e os cestos não são lugares, e nenhuma tabela diz o que se esconde
neles. Para a busca rolar ali, o mundo precisa de esconderijos por sítio (ou o passo da quest dizer «há algo nos
caixotes») — é estado novo, e não foi inventado.

**5. A fuga de quem está armado.** «Fujo de Isolde armada pulando caixotes» não casava nenhum verbo. A escuta da cena
(só o Mestre vivo; `FORMAS_DO_ATO`) ouve a fuga em primeira pessoa («fujo», «saio correndo de», «tento fugir»; «grito
pra todo mundo fugir» não é dele, E103), só com o corpo em jogo dito — o obstáculo pulado ou a arma de quem vem
atrás («Fujo da aranha gigante» é movimento, diz o corpus das situações) — e «pulando os caixotes» como o salto; a régua já tinha a fuga como perigo do
ato (`PERIGO_DECLARADO.fuga`), que agora ouve também «correndo da vendedora, que está de faca na mão». A mesma escuta
ouve a fala que a frase desmente («falo pro Perrin que perdi as chaves, mas elas estão no meu bolso») como mentira.
Uma primeira versão pôs a fuga e a mentira no catálogo: o corpus da mesa e o das situações acusaram dois falsos
«pede dado» («corro pela porta do fundo», «Fujo da aranha gigante») e, pior, mudaria o Mestre de hoje — voltou atrás.

**6. A narração que desmente.** O envelope do turno não dizia ao Narrador a quem a fala se dirigia — a régua sabia
(`quem`) e jogava fora. Agora o veredito da régua e o do `chamadoDoMomento` levam `alvo` (aditivo), e a
`pautaDoMomento` põe pelo canal de um turno: em ACABOU DE, «Eu falei com X, e é essa pessoa quem reage»; em NÃO PODE,
«pôr a reação na boca de outra pessoa que não X» e, quando rola, «fazer essa pessoa reagir ao contrário do que ficou
decidido» (a Intimidação que passou e «não leva a sério», T7). O meio que a ficha nega (a gazua, T16) vai como NÃO
PODE («fazer acontecer o que a minha ficha não permite»). Nada de bloco estático. O sim sem dado social passa a dizer
quem aceitou pelo alvo da régua quando o elenco não achou ninguém.

**7. Texto de regra na tela.** Com a chave ligada, quatro linhas do App trocam a fala do mecanismo pela da mesa
(`A_FALA_DA_MESA`, `falaDoVeredictoNaMesa`, `falaDoCustoNaMesa`, `falaDoBarulhoNaMesa`, `falaDosBlefesNaMesa`): «Por
um fio: ela cede, mas cede errado» → «⚖ Ela cede, mas cede errado.»; «Faltaram 2, e ainda assim: …» → só o que
aconteceu; «Assim não dá: … Outro jeito: à força, no ombro» → «⛔ Você não tem ferramentas de ladrão — talvez à força,
no ombro.»; «Insistir igual não muda nada — …» → «↺ Desse jeito você já tentou aqui, e não deu. Com ajuda, outra
ferramenta ou bem mais tempo, talvez.»; «✓ Isso você já conseguiu aqui — sem dado» some (a narração conta); «🗣 Não
contou: o aço à vista — …» → «🗣 Você não tem uma arma à mão.»; «🔊 no braço faz barulho.» → «🔊 Isso fez barulho.».
**Com a chave desligada o App chama as falas de hoje, byte a byte** (`falaDaMesaOu`). O «+17 XP · …», a «Sorte
pequena» do halfling e o «Isolde está aqui — …» da procura ficaram como estão (fora deste pacote).

**Fora do escopo, anotado.** O nome próprio virando viagem (T3, T26) e o PT-PT na prosa não cruzaram este caminho. O
preço dito e não cobrado (T12) e o objeto narrado fora da bolsa também não. A legenda do dado anterior colada na
página continua por achar no App.

**A medida.**

| | antes | depois |
|---|---|---|
| régua, metade A (476, com os 32 da sessão mv-4) | 439 · 2 · 35 · cat 366 · per 212 · pares 103 | **445 · 2 · 29 · cat 371 · per 219 · pares 103** |
| … só as 444 que já eram da A | 413 · 2 · 29 | **igual** |
| régua, metade B (agora afina) | 157 · 7 · 32 · cat 119 · per 53 · pares 53 | **igual** |
| hoje, metade A | 293 · 55 · 128 (com os 32 novos) | **igual** (o Mestre de hoje não mudou em item nenhum da A nem da B) |
| **régua, metade C (a prova; segunda e última medida)** | 102 · 1 · 21 · cat 82 · per 36 · pares 18 | **103 · 1 · 20 · cat 83 · per 37 · pares 18** |
| hoje, metade C | 72 · 19 · 33 | igual |

A C subiu um item e não perdeu nenhum indevido: o conserto foi, quase todo, o livro de tentativas e o retrato do jogo
(a pessoa fora do painel, o companheiro), que o exame não mede — ele roda com o livro vazio e a pessoa sempre na cena.
Nada disto foi jogado: está provado nas suítes e nas sequências montadas à mão. **O que fica para a próxima sessão
jogada:** conferir na tela as falas da mesa e, na prosa, se o Narrador obedece à linha do alvo.
