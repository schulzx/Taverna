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
| **segredo** — a pessoa ou a coisa esconde algo | perguntar deixa de ser cortesia e passa a ter oposição |
| **pressa** — algo acontece se demorar | a falha gasta tempo que o mundo cobra |
| **testemunha** — alguém vê | a falha se espalha (fama, alarme) |
| **vantagem ganha** — o jogador preparou o terreno | bônus no dado (é aqui que o calor entra, §6) |

**Não rola**, e diz por quê (a lista de hoje, mantida): não há obstáculo; o herói já sabe; o
resultado é certo; o mundo disse que aquilo não existe; a luta tem o seu próprio dado.

**O que muda para a conversa.** Perguntar a quem quer responder continua sem dado (é a «cortesia» e
a «conversa» sem segredo). Pedir a quem tem motivo para negar passa pelo mesmo chamado de qualquer
outra ação: perícia, número e o preço dito antes. A escada do pedido continua dando o número.

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
| intenção certa em frase nova | 73% | **≥ 90%** |
| perícia certa em frase nova | 69% | **≥ 85%** |
| pede dado onde um mestre real não pediria | 6% | **≤ 2%** |
| deixa de pedir onde um mestre real pediria | não medido | **≤ 15%** |
| declarações fora da luta seguidas de dado, em sessão jogada | 4,3% (10/11) | **20% a 30%** (a mesa real: 26,5%) |
| perguntas de «o que sei de…» respondidas sem dado | — | **≥ 70%** (a mesa real: 78%) |
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
