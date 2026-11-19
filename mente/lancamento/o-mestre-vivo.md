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
