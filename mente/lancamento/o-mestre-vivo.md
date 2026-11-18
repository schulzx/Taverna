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
| declarações fora da luta seguidas de dado, em sessão jogada | 4,3% (10/11) | **20% a 30%** (a mesa real: 26,5%) |
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
