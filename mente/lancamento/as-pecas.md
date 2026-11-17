# As peças — o jogo como quebra-cabeça

**17/11/2026 · proposta, ainda não aprovada para construir.** A ideia é da pessoa; este documento a
confronta com o código de hoje (v9.656) e a deixa concreta o bastante para ser provada numa quest.

## 1. A ideia, nas palavras dela

*«Tudo no nosso sistema será pronto de forma que funcione como um quebra-cabeça em que qualquer peça
encaixa… o player diz que faz alguma coisa, o sistema encaixa aquela ação em alguma ação existente e
avança a história naquela direção… o sistema saberá tudo, e o narrador apenas "maquia"… tiraríamos
tudo das mãos da IA.»*

E as três decisões que ela tomou na conversa:

1. **Só dois estados.** Ou a ação resolve a etapa, ou ela é **aquecimento**: acontece como diálogo e
   cena, e aproxima o jogador da solução — *«até que uma ação do player (ou conjunto de ações, caso
   ele já esteja preso na etapa há muito tempo) o leve para a solução»*. Nada de perguntar «A ou B»,
   nada de empurrar para a saída mais parecida.
2. **Toda etapa tem solução para cada ação plausível, e a falha de uma leva a outra.** *«Tento
   intimidar uma fera, o sistema rola o dado; deu certo, abriu a solução pelo intimidar; não deu
   certo, abre o combate e usa a mesma solução do que seria atacar; se eu fugir, usa a solução do
   fugir.»*
3. **Quem trava paga.** *«Prefiro que o mundo cobre com preço, assim temos um mundo vivo e um peso
   maior para as quests.»*

## 2. O que o código já tem (medido hoje)

| peça | quanto | onde |
|---|---|---|
| quests | 52 | `src/biblioteca-de-quests.js` + `src/acervo/quests-lote-*.js` |
| etapas | 214 (96 com ramos «violenta / social / furtiva») | idem |
| **fatos que fecham uma etapa** | **12**: escolheu (188 usos), conversou (92), esteve (50), acompanha (37), derrotou (36), descobriu (27), está em (21), afeição (19), consultou (18), conheceu (13), pelo menos (12), tem (8) | o campo `conclui` de cada etapa |
| **ações com dado** | **34**: buscar, investigar, escutar, lembrar, convencer, fazer falar, impressionar, intimidar, mentir, rastrear, escalar, arrombar, seguir alguém… | `DESAFIOS`, `src/desafios.js` |
| preços de falhar | 35 | `CUSTO_DE_FALHAR`, `src/desafios.js` |
| o relógio do vilão | existe (`relogio_do_fio`, `avisa_vilao`) | `PRECO_DA_FALHA`, `src/quadro-da-quest.js` |
| o encaixe da frase | existe: a frase vira ação, perícia e número | `src/motor/o-mestre-chama.js`, `a-proposta-da-frase.js` |
| uma etapa que já é peça | o confronto no covil: espreitar, falar, capturar, lutar, recuar; dado falhado vira luta | `src/o-confronto-da-quest.js` |
| frases reais de jogadores | 439 das sessões + 498 escritas | `testes/corpus-da-mesa.json`, `corpus-das-situacoes.json` |

**O achado que muda a conta.** Hoje a etapa sabe **o que** precisa ser verdade (o fato) e não **como**
se chega lá. O «como» ficou com o Narrador — e é por isso que 92 etapas fecham com um simples
«conversou», sem dado e sem risco, e que a quest de 15/11 andou quatro etapas em treze ações sem uma
falha que custasse. A proposta dela é exatamente a camada que falta: **o como**.

## 3. O modelo

### 3.1 A peça

Uma etapa é uma peça com quatro coisas declaradas:

1. **A cena fechada** — quem está, o que há, onde é. Lista fechada, posta pelo sistema.
2. **As soluções** — uma por ação plausível. Cada solução diz: a ação, o dado (perícia e número), o
   que o **sucesso** escreve (um dos 12 fatos) e para onde a **falha** vai.
3. **O relógio** — quanto tempo a etapa aguenta antes de o mundo cobrar, e o que ele cobra.
4. **As pistas** — o que o aquecimento pode revelar, cada uma apontando para uma solução.

### 3.2 A falha aponta para outra solução

É a regra dela, e é o que dá forma de quebra-cabeça à etapa: **a falha não é um beco, é uma seta.**

```
intimidar ──sucesso──▶ a fera recua            (fato: poupou)
    └──falha──▶ LUTAR
fugir ─────sucesso──▶ você escapa               (a etapa continua aberta, o relógio anda)
    └──falha──▶ LUTAR, em desvantagem
espreitar ─sucesso──▶ você vê sem ser visto     (vantagem na próxima)
    └──falha──▶ LUTAR
lutar ─────vitória──▶ a fera cai                (fato: derrotou)
    └──derrota─▶ a fera foge com a sua bolsa    (a etapa continua, com preço)
```

Toda seta termina num fato ou noutra solução. Nenhuma termina em «nada acontece», e nenhuma termina
na mão do Narrador.

### 3.3 O molde por fato (o que torna isto barato)

Não é preciso escrever 214 etapas à mão. **Cada um dos 12 fatos ganha um molde** — a lista das ações
plausíveis para chegar a ele, com a seta da falha — e a etapa herda o molde do fato que ela pede. O
autor só escreve o que for diferente naquela etapa.

| o fato que a etapa pede | ações plausíveis (do catálogo) | a falha leva a |
|---|---|---|
| **derrotou** alguém | lutar · emboscar (furtar-se) · intimidar · capturar · fugir | lutar; ou a fera foge, com preço |
| **conversou** com alguém | convencer · fazer falar · impressionar · intimidar · mentir · pagar | outra via da conversa mais cara; ou a pessoa se fecha por um tempo |
| **descobriu** algo | buscar · investigar · rastrear · escutar · lembrar · perguntar | a metade da verdade, ou a verdade com o vilão avisado |
| **esteve / está em** um lugar | viajar · orientar-se · seguir alguém · arrombar · escalar | chegar tarde; chegar visto |
| **tem** algo | comprar · furtar · convencer · buscar · arrombar | ser pego; pagar mais |
| **acompanha** alguém | convencer · proteger · acalmar | a pessoa vai, mas com condição |
| **escolheu** | a carta de escolha (ganho e custo escritos) | não tem dado: é decisão |

São doze moldes e cerca de setenta linhas de tabela para dar solução às 214 etapas. O trabalho de
autoria deixa de ser «escrever tudo» e passa a ser «corrigir o molde onde a etapa é especial».

### 3.4 O aquecimento e o calor

A frase que não aciona nenhuma solução **acontece**: vira diálogo, cena, descrição. E não é
desperdiçada:

- **Planta uma pista** verdadeira da cena, que aponta para uma solução. É assim que o jogador
  descobre os caminhos sem ver um menu.
- **Esquenta** a solução para a qual aponta. Cada solução tem um medidor de calor.
- **Gasta o relógio.**

O calor é o que dá número ao «conjunto de ações» dela:

- quando o calor de uma solução enche, **o Mestre abre essa solução** e pede o dado — a conversa
  virou ação sem o jogador precisar adivinhar a palavra certa;
- o calor acumulado vira **bônus no dado** daquela solução — quem interpretou antes rola melhor;
- a frase que caberia em duas soluções **esquenta as duas** e segue como aquecimento. É o desempate
  sem pergunta.

### 3.5 O relógio: o mundo cobra

Quando o relógio da etapa enche, **o mundo se move** — a fera leva outro pescador, a testemunha vai
embora, o vilão é avisado — e a etapa reabre num estado pior, com uma solução forçada à vista. O
jogador nunca fica preso; ele chega atrasado, e paga. As peças do preço já existem
(`CUSTO_DE_FALHAR`, o relógio do fio do vilão).

### 3.6 As peças se ligam por fatos

É o encaixe propriamente dito. Cada peça **exige** fatos e **produz** fatos. «Conhece Edric» só
existe se uma peça o apresentou; a etapa que precisa de Edric só entra depois. Disso saem duas
garantias por construção, não por vigilância:

- **nenhum personagem solto e nenhum item do nada** — o que não foi produzido por uma peça não existe
  para a peça seguinte;
- **a campanha diferente a cada semente** — a espinha escolhe, entre as peças cujas exigências já
  estão cumpridas, pela semente e pelo que o jogador fez.

As três escalas usam o mesmo contrato: **a campanha** é feita de quests, **a quest** de etapas, **a
etapa** de soluções.

### 3.7 O que sobra para o Narrador

Ele recebe: a cena fechada, o que acabou de acontecer (já decidido), a pista a plantar e o tom.
Devolve prosa. Não decide resultado, não cria gente, não cria coisa, não move ninguém.

Como a lista é fechada, um verificador sem IA confere a prosa: nome ou item fora da lista é erro
exato, e a frase é podada. E o pedido ao Narrador fica **menor** do que a pauta aberta de hoje — o
custo por turno tende a cair.

## 4. O que isto não resolve

- **A IA continua escrevendo a prosa** e vai tentar sair da lista. A lista fechada não impede: torna
  detectável. A poda continua necessária.
- **A liberdade muda de natureza.** O jogador perde o «tudo pode acontecer» e ganha «tudo o que
  acontece é verdade e pesa». Uma solução que nenhum molde prevê vira aquecimento — o jogador não
  bate na parede, mas também não inventa uma saída que o sistema não conhece.
- **A variedade depende do acervo.** Com as 52 quests de hoje a costura aparece depois de algumas
  campanhas; as peças ligadas por fatos ajudam a recombinar, não criam conteúdo.
- **O molde genérico pode soar genérico.** «Intimidar» numa fera e num mercador têm a mesma seta mas
  precisam de frases diferentes; a qualidade vem das exceções escritas à mão nas etapas que importam.

## 5. A prova, antes de construir tudo

Uma quest só, do primeiro turno à encruzilhada: **«O Que Desce ao Anoitecer»**, a de abertura — já
foi jogada três vezes, e as transcrições servem de antes.

Três números contra o jogo de hoje:

| medida | como se mede | alvo |
|---|---|---|
| **encaixe** | das 439 frases reais do corpus, quantas acionam uma solução, quantas viram aquecimento, quantas ficam sem nada | 0 sem nada |
| **verdade** | nomes e itens fora da lista fechada por 40 respostas, numa sessão jogada | 0 depois da poda |
| **jogo** | dados com risco por etapa; etapas que fecham sem dado; uma prova jogada dizendo se pareceu mesa ou trilho | ≥ 1 dado com preço por etapa; nenhuma etapa fecha de graça |

Se os três passarem, a migração segue pelos moldes (os 12 fatos), não quest a quest — e depois sobe
para a campanha.

## 6. O que falta decidir

1. **O aquecimento tem limite por etapa?** Proposta: o relógio é o limite — não há teto de turnos, há
   teto de tempo do mundo.
2. **O calor aparece para o jogador?** Proposta: não como número («o sistema não fala de si»); aparece
   como a pista que fica mais direta e, quando enche, como o Mestre abrindo o dado.
3. **A carta de escolha continua sem dado?** Hoje 188 fechamentos são «escolheu». Proposta: sim — a
   escolha é a decisão do jogador; o dado vem antes, para ganhar o direito de escolher.
