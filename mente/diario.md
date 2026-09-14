# O diário da mente

Um registro por ciclo, o mais recente no topo. É aqui que a pessoa vê o que
cada agente fez, e é aqui que a mente lê o próprio passado antes de agir.

Formato:

```
## dd/mm hh:mm · vX.YYY · <título do item> · commit <hash>
- **estado inicial:** suítes verdes/vermelhas, o que a pauta tinha
- **conselheiro:** o que propôs (ou "não chamado")
- **backend / frontend / testes:** o que cada um entregou, em uma linha cada
- **decisões médias tomadas:** cada uma com o motivo (é o que a pessoa audita)
- **o que ficou:** o que não coube, o que dormiu, o que foi para "pesado"
```

---

## 14/09 12:10 · v9.239 · T2 · a cura não limpa · commit `a6a6473` + este
- **estado inicial:** árvore limpa, HEAD `7ae4ba1`, VERSÃO v9.238, `npm test`
  181/181 suítes + 8/8 varredores verde. Sem trava de ciclo (posta por mim). A vez
  era **T2**, a segunda etapa da Fase T, com a lei da pessoa: *cura normal só
  devolve PV; quem limpa é magia, habilidade de classe, item ou salvaguarda.*
- **conselheiro:** não chamado (etapa já escrita e aprovada; a pauta tem mais de
  5 itens em "Aberto").
- **backend:** varreu as **45 portas de cura** em 16 arquivos, decidiu o descanso
  com o número que o sustenta, renomeou o canal morto `"cura"` → `"restauracao"`
  em `CANAIS_DE_SAIDA`, trancou `limparPorDescanso` contra canal que não seja de
  descanso, e escreveu a catraca `check-cura-nao-limpa.mjs` (7 sabotagens, 7
  mordendo). Não tocou no `App.jsx`.
- **frontend:** **não chamado, de propósito** — a medição não achou fiação para
  consertar no App, e chamar a mão só para ela olhar seria trabalho inventado.
- **testes:** feitos pelo backend junto com o módulo (as asserções são da mesma
  medição): `teste-cond.mjs` 84 → **102**, `teste-relicas.mjs` 98 → **103**,
  `teste-mercado.mjs` 27 → **29**, mais o varredor novo com **33**. Nenhuma
  asserção antiga movida nem reescrita.

### A etapa era conferência, e a conferência passou — 45 portas, zero vazando

Não foi suposição: cada porta foi lida e contada. Poção (`pocoes.js:124`), dado
de vida e descanso curto/longo (`descanso.js` 72, 109, 156, 169), profissão no
descanso (`regras-jogo.js` 102, 107), magia de cura (`App.jsx:12614`), milagre
(`App.jsx:9664` + `divindades.js:259`), Segundo Fôlego (`App.jsx` 8067 e 13632 +
`dadivas.js:174`), relíquia `curaFracao` (`relicas.js:268`), companheiro que cura
(`App.jsx:7900`, `combate.js:382`), Reerguer e Reescrever o Instante
(`habilidades.js` 156–196), arena/noite/duelo (`arena.js:150`,
`uma-noite.js:117`), santuário (`App.jsx:17458`), volta da morte, vínculo,
drenagem e chefe. **Todas sobem `vida` e nenhuma escreve `condicoes`.**

A **única** que limpa é o **`/curar` do console criativo** (`App.jsx:5449`,
declarado em `godmode.js:31` como "PV e PM cheios, condições e exaustão
limpas"). Não é cura normal: é a chave do mundo, interceptada antes do Mestre.
Ficou de pé e **declarada** na tabela do varredor, com o motivo escrito — exceção
que se lê é exceção que se audita.

### O descanso: decidido, e o próprio código deu o argumento

Era o caso difícil, e o cuidado do briefing estava certo: em 5e o descanso longo
cura muita coisa por regra. A decisão é **o descanso fica como está — ele é
passagem de tempo, não cura normal**, e o motivo é estrutural, não de gosto:

**`descanso.js`, o módulo que calcula TODA a metade de PV do descanso, não tem
uma única linha tocando `condicoes`** (provado na seção 3 do varredor). As duas
metades já moram separadas no código: a de PV obedece à lei sozinha, e a limpeza
vem inteiramente da metade do **tempo**, em `limparPorDescanso` chamada de
`regras-jogo.js:84–94`. Não há uma cura que limpa — há horas que passam, e o
relógio de T1 já é o irmão menor disso.

E a conta do que morreria: **`exausto` (`turnos: null`, `saiCom: ["longo"]`) é a
única condição do catálogo cuja única porta é o descanso.** Tirá-la deixaria
exaustão perpétua — T2 abriria o buraco que T4 existe para fechar. A escolha
conservadora é também a única coerente: **zero mudança no que o jogador vive**, e
as duas asserções antigas do descanso em `teste-cond.mjs` continuam literalmente
como estavam — continuarem verdes é metade da prova.

### A mentira estava na tabela, e ela contradizia a lei da pessoa

Quatro condições declaravam `saiCom: ["cura"]` (`envenenado`, `sangrando`,
`cego`, `enfeiticado`) e **ninguém lia o canal `"cura"`**: `limparPorDescanso` é o
único leitor de `saiCom` e só recebe `"curto"`/`"longo"`. Promessa morta — e
promessa que dizia o oposto da lei recém-ditada. Virou **`"restauracao"`**, na
tabela nova `CANAIS_DE_SAIDA`, com o porquê escrito no módulo.

**E renomear, não apagar, foi obrigatório — é o achado do ciclo.** `enfeiticado`
declarava **só** esse canal. Apagá-lo o deixaria com `saiCom: []`, e a regra
implícita de `limparPorDescanso` (*longo limpa toda condição ruim sem canal*)
faria **a noite inteira passar a quebrar encantamento**: mudança silenciosa no
que o jogador vive, nascida de uma limpeza de tabela. As quatro têm `turnos`
(4/3/2/3) e seguem vencendo no relógio: **nenhuma ficou sem saída**.

Duas trancas a mais, ambas contra o erro de amanhã:
- **`limparPorDescanso` recusa canal que não seja de descanso.** Antes aceitava
  qualquer string — `limparPorDescanso(c, "cura")` era o jeito mais fácil de uma
  cura futura apagar condição sem parecer que apagava.
- **`CONDICOES_PROMPT` ensinava o oposto da lei ao Narrador:** *"quem a tira é o
  relógio, o descanso ou a cura"*. Hoje diz *"o relógio ou o descanso"* — **10
  chars a menos**, teto de prompt intacto (56.334).

### A catraca, e as sete sabotagens

`testes/check-cura-nao-limpa.mjs` percorre o `src/` atrás de **toda** linha que
sobe `vida` e falha se houver escrita em `condicoes` na vizinhança. Dois dentes
que a impedem de passar verde à toa: **piso de alcance** (35 portas / 8 arquivos —
lista vazia é vermelho) e **dente inverso** (exceção declarada que para de casar
fica vermelha). Nenhum export novo inventado para a suíte ler.

Sete sabotagens em cópia, sete mordendo: descanso longo zerando condições; poção
de cura cortando veneno de carona; catálogo voltando a dizer `"cura"`; a porta do
descanso reaceitando qualquer canal; o antídoto declarado apagado de carona;
relíquia nova limpando de carona; e a sutil — **o canal sumindo**, que é a que
pegou a mudança silenciosa do encantamento.

### Decisões médias tomadas (com o motivo)

- **O descanso fica como está.** Motivo acima: as duas metades já são separadas no
  código, e é a única escolha que não deixa `exausto` sem saída. Zero mudança no
  que o jogador vive — por isso não subiu para a pessoa.
- **O canal foi renomeado, não apagado.** Apagar mudaria o jogo em silêncio
  (encantamento quebrando na noite). Renomear mantém o comportamento idêntico e
  deixa a porta pronta para T4 ligar.
- **O `/curar` do console ficou de pé e declarado.** É bastidor de criador, não
  gameplay; apagá-lo seria tirar a chave do mundo por causa do nome dela.
- **O frontend não foi chamado.** Nada a fiar no App.
- **Não consertei `protegido`/`defesaDe`** (o Aberto de T1) nem antecipei T3/T4.

### O que ficou

- **Para T4, três coisas, escritas na pauta:** `concentrado` é a única condição
  **sem saída nenhuma** hoje (`turnos: null`, `tipo: "bom"`, `saiCom: []`) —
  armadilha latente, porque nada a aplica, e T2 **não** a criou; o canal
  `"restauracao"` nasce **sem leitor de propósito**, esperando as três portas; e o
  nome do `/curar` a decidir.
- **Um vermelho intermitente, pego ao vivo e registrado em "Aberto":** no meio do
  ciclo o `npm test` deu **180/181 · teste-sala.mjs (122 passaram, 1 falharam)** e
  na corrida seguinte deu verde, com a árvore byte a byte igual. O sítio é
  `teste-sala.mjs:32` — 500 chamadas de `novoCodigo()` **sem semente** e a
  asserção `vistos.size > 480`: colisão de aniversário. **É a lei do determinismo
  por semente quebrada dentro da própria suíte**, e o preço é caro — vermelho que
  não reproduz ensina a mente a ignorar vermelho. **Não afrouxei o 480**, virou
  item leve na pauta. O `npm test` da subida foi conferido verde duas vezes.

### E a nota que o `git log` precisa para não mentir

**Parte do trabalho de T2 viajou no commit anterior, e o erro não foi da mão que
o escreveu.** Enquanto o `backend` ainda media, a pessoa rodou `git add -A` para
commitar arquivos dela (os agentes da mesa de design), e a varredura levou junto
`src/condicoes.js`, `testes/teste-cond.mjs`, `testes/teste-mercado.mjs`,
`testes/teste-relicas.mjs` e `testes/check-cura-nao-limpa.mjs`. Eles estão em
**`a6a6473` — "A mesa de design"**, que é um título que não os descreve. Nada
quebrado subiu (build limpo, 181/181 + 9/9 conferidos depois), e **não se
reescreveu história**: está publicado, e reescrever seria pior que a confusão.
Este commit carrega o resto — o bump de `VERSAO`, o diário e a pauta — e esta
nota. A lição é da casa e já está no `CLAUDE.md` (`73e438b`): **nunca `git add -A`
com uma trava de ciclo posta**, nem duas mãos na mesma árvore sem olhar.

---

## 14/09 11:35 · v9.238 · T1 · o relógio alcança o grupo · commit `9ca2eb7`
- **estado inicial:** árvore limpa, HEAD `2faf58f`, VERSÃO v9.237, `npm test`
  181/181 suítes + 8/8 varredores verde. Sem trava de ciclo. A Fase C fechada e
  a pauta com quatro fases novas aprovadas (**T → B → F → I**). A vez era **T1**,
  a primeira etapa da Fase T, com a lei de desenho ditada pela pessoa: *sistema
  de D&D — cura normal só devolve PV e não remove condição; quem limpa é magia,
  habilidade de classe, item, ou a salvaguarda no fim do turno.*
- **conselheiro:** não chamado (etapa já escrita e aprovada; a pauta tem mais de
  5 itens em "Aberto").
- **backend:** mediu e **não escreveu uma linha em `src/*.js`** — a medição
  provou que `tickCondicoes` já servia como está. Entregou o raio contado, a
  medição nos dois sentidos em Uma Vida, a decisão do save antigo com o motivo, e
  o bloco desenhado para o `frontend` fiar.
- **frontend:** as 41 linhas em `App.jsx:8292–8332`, entre o tique do herói e o
  dos inimigos, em `try/catch` com `calou("prazo-da-condicao-do-grupo", e)`.
  Script `.cjs` com o helper `t(de, para)`, âncora única. Build limpo.
- **testes:** `teste-cond.mjs` 31 → **84** asserções (a catraca do prazo, o dente
  inverso, o save antigo, a âncora no App no molde da seção 15 de
  `teste-efeitos.mjs`) e `teste-afl.mjs` 24 → **32** (a fronteira do zero, onde
  mora `PORTADORES`). **15 sabotagens, 15 morderam.**

### A medição desmentiu metade da pauta, e a etapa ficou mais honesta

**O veneno eterno do companheiro NÃO EXISTE, e nunca existiu.**
`aplicarCondicoesDosGolpes` (`:7606`) só processa `alvoRef === "jogador"` — golpe
de inimigo **nunca** afligiu companheiro. Das condições que chegam ao grupo,
**as sete são `tipo: "bom"`** (inspirado, protegido, abençoado, enfurecido,
apressado, furtivo, fortalecido); a única ruim é `amedrontado` da presença, e ela
já tinha saída em `:13226`. Logo **o dente inverso não é o efeito colateral desta
etapa — é a etapa inteira**: o relógio tira do grupo uma vantagem de trinta
versões, e era isso o conserto.

**São 5 sítios vivos, não 6.** O sexto (`:7543`, o ramo do grupo de
`aplicarCondicaoEm`) é **código morto**: os dois chamadores passam `"você"`
cravado, `ehEu` é sempre verdadeiro e o ramo nunca roda.

**Uma Vida, 1000 combates (`umavida|0..999`), nos dois sentidos.** O instrumento
é o de P3, e o controle o valida: sem condição nenhuma ele reproduz os
563 quedas · 754 PV · 918 absorvido · 153 abrigos de P3, byte a byte.

| | hoje | T1 |
|---|---|---|
| condições que vencem (duro / brando) | **0 / 0** | **727 / 305** |
| turnos até vencer | — | **4,11 / 4,09** |
| companheiro-rodadas com condição (duro) | 4040 | **2335** (−42%) |
| companheiro-rodadas com condição (brando) | 5988 | **5601** (−6,5%) |
| quedas (duro, 200 combates) | 560 | **563** |
| PV restante do grupo (duro) | 798 | **754** (−2,7%) |

**E a leitura honesta, que é a que vale: em mesa isso quase não dói, e o motivo
tem nome.** 94% do que estava de pé no duro era `protegido` — e `protegido` não
compra nada para ninguém: `defesaDe` (`combate.js:39`) não lê `condicoes`, e
`mecanicaDe().defesa` só chega ao HUD. Provado direto: defesa **11 com e 11 sem**.
A única condição do grupo que morde em Uma Vida é `abencoado`, e o Clérigo a
relança tanto que o relógio mal a alcança (−0,4% no brando, −16% no duro). **A
vantagem de trinta versões era real em contagem e quase inerte em efeito** — o
jogador vai ler a linha muito mais do que vai sentir o número.

### Decisões médias tomadas (com o motivo)

- **O dano por turno fica FORA de T1.** `tickCondicoes` devolve `dano`/`fontes`,
  e o herói e os inimigos os cobram; o grupo não. Motivo: companheiro morrendo de
  veneno é um **jeito novo de o jogador perder um companheiro** — consequência
  que muda o que ele vive, e isso é da pessoa, não de etapa aprovada. E a
  fronteira **não esconde nada**: as três que doem (`envenenado`, `sangrando`,
  `queimando`) têm portador único e sempre `alvo: "alvo"`, que escreve no herói
  ou no inimigo e nunca no grupo — **0 em 2000 combates**, por simulação e por
  estrutura. A suíte guarda o zero: portador novo que aponte para condição com
  `danoTurno` acende em `teste-afl.mjs`, em vez de o companheiro começar a morrer
  em silêncio.
- **Save antigo: vence pelo prazo, sem migração.** A instância carrega
  `turnos: N` cheio (nunca decrementou, então N é o valor de catálogo, idêntico ao
  de uma condição recém-lançada); basta o relógio alcançá-la. Motivo escrito:
  **migrar seria inventar um estado que o save não tem** — distinguir "condição
  antiga" de "condição de agora" exigiria uma marca que não existe em ficha
  nenhuma, nascida só para ser lida uma vez e apagada. Conferido dos dois lados:
  nenhum dos 5 sítios escreve `turnos: null`, e `git log -S` mostra que as
  condições alcançáveis nunca tiveram `null` em versão nenhuma; se mesmo assim
  carregar lixo (`null`/`NaN`), `tickCondicoes:248` a mantém viva — que é o
  comportamento de hoje, sem regressão.
- **A condição boa também anuncia.** `✓ ${g.nome}: ${c.nome} passou`, irmã exata
  da linha do inimigo (`:8304`), com o nome na frente porque não sou eu. Motivo:
  a irmã do herói já anuncia, e calar só para o grupo seria uma terceira regra
  para o mesmo evento — além de tornar invisível justamente a mudança que o
  jogador vai sentir, que é ele **perdendo** algo que tinha. Some-se que
  `resumoCondicoesPrompt` manda as condições do grupo ao Narrador: sem a linha,
  ele seguiria descrevendo uma bênção que acabou. Volume: **0,73 linha por
  combate no duro, 0,31 no brando**. Voz de mundo, sem nomear o mecanismo.
- **Não filtra por vida**, diferente do irmão dos inimigos: o inimigo derrotado
  sai de cena, o companheiro caído continua nela e pode ser erguido — o tempo
  passa para ele também.
- **`src/*.js` intocado.** Dar a `tickCondicoes` um `{ semDano: true }` só para o
  grupo seria API nova com um leitor só e um segundo caminho para o mesmo número.
  **T1 é fiação + suíte, como C1** — nenhum export novo, nada para o `teste-ligacao`.

### O achado da suíte, e é a lição de C3 outra vez

A sabotagem que derruba o `try/catch` **mordeu pelo motivo errado**: sem a linha
do `calou`, o `iFim` da âncora vinha `−1` e o `slice(iTry, -1)` entregava quase o
**App inteiro** como se fosse o bloco — as provas de ausência acendiam por acharem
`t.dano` em qualquer outro lugar do arquivo. **Vermelho pelo motivo errado hoje é
verde pelo motivo errado amanhã**: com o bloco ausente e o recorte vazio, elas
passariam vazias. Endurecido com um `achou` que toda asserção do recorte — presença
e ausência — agora exige, com o porquê no comentário. As 15 re-rodadas contra a
versão endurecida: **15/15**.

### O que ficou (foi para a pauta, não foi feito)

- **`protegido` não defende ninguém, nem o herói** — 15 habilidades do acervo
  prometem abrigo, entram como `protegido` e compram **+0 de defesa**. É a forma
  exata das quatro famílias da Fase F, e pertence a ela ou a B. Achado da medição.
- **O sonho dá vantagem eterna ao herói** (`App.jsx:18759`): `"Inspirado"` escrito
  **sem `id` e sem `turnos`** casa com o catálogo, concede vantagem em toda rolagem
  e `tickCondicoes` a preserva com `turnos: null` **para sempre**. É a única
  condição genuinamente eterna do jogo hoje — e é do herói, não do grupo.
- **`aplicarCondicaoEm`, ramo do grupo (`:7543`), é código morto.**
- **Os seis `varredura-*.mjs` não entram no `npm test`.** O `CLAUDE.md` diz que
  entram; `rodar-tudo.mjs` só varre `^teste-` e `^check-`. Rodados à mão, os seis
  passam — nada vermelho escondido, mas não estão guardando ninguém.

---

## 14/09 03:55 · v9.237 · C3 · uma de cada vez · commit `aec84fe`
- **estado inicial:** árvore limpa, HEAD `243d0de`, VERSÃO v9.236, `npm test`
  181/181 suítes + 8/8 varredores verde. Sem trava de ciclo. A vez era **C3**,
  a última etapa da Fase C — que a pauta já dizia ser **conserto, não
  conferência**: C1 mediu o herói segurando duas concentrações, C2b acrescentou
  o companheiro e o risco de `efeitoEmConcentracao` derrubar a errada.
- **conselheiro:** não chamado (a etapa já estava escrita e aprovada, e a pauta
  tem mais de 5 itens em "Aberto").
- **backend:** mediu antes de escrever. `CONCENTRACAO_DA_MAGIA` ganhou o teto
  (`quantasAoMesmoTempo: 1`) e `efeitos.js` ganhou **`firmarEfeito`**, irmã de
  `absorverDano` — `{ pers, linha, cedeu }`. `arena.js` passou por ela e largou
  o import de `empilhar`.
- **frontend:** os três sítios do `App.jsx` por **uma porta só**,
  `firmarOuCeder` (`:6634`), terceira irmã de `passarPeloAbrigo` e
  `segurarOuPerder`; os sítios ficaram em `:7878` (herói), `:7993` (companheiro)
  e `:12598` (magia de duração). Teto de prompt medido nas duas pontas.
- **testes:** seção 19 de `teste-efeitos.mjs` e seção 11 de `teste-arena.mjs`,
  com escada de **23 sabotagens** — e uma delas estava verde na entrega.

### A medição que fez a etapa (e desmentiu "canto raro")

**Não era exceção, era um caso em cada quatro.** Em 2094 quedas: 3864 efeitos
firmados, **1352 de concentração**, e **316 deles eram uma segunda por cima de
outra — 23,4%**. O raio real, contado e não suposto: das 85 magias do catálogo
**34 concentram**, mas só **3** chegam à porta de `efeitoDeMagia` (Invisibilidade,
Voo, Invisibilidade Maior); das 148 habilidades **8 são magia e 5 concentram**,
**3** viram efeito no herói. **5 das 12 classes** podem colidir por nome distinto
(Mago 3, Feiticeiro 3, Clérigo 2, Bardo 2, Bruxo 2) — sete nunca colidem. No
companheiro é **1 classe de 12** (o Clérigo, Bênção + Escudo da Fé); na arena,
**2 dos 8 prontos** (remendo e voto).

### Decisões médias tomadas, com o motivo

- **O teto mora na tabela, e a função o conta.** `firmarEfeito` derruba as **mais
  antigas até caber** (`antigas.slice(0, antigas.length - (teto-1))`) em vez de
  cravar "derruba a anterior". Motivo: é a lei "se é número, é tabela" levada até
  o fim — um teto 2 amanhã funciona sem uma linha nova, e a suíte sabota o teto
  para provar que ele é lido de volta, não decorado.
- **`empilhar` ficou genérico e intocado.** Quatro chamadores (frasco, relíquia,
  canal do Mestre, milagre) nunca produzem concentração — conferido, não suposto.
  Ensinar concentração à pilha genérica poria a regra num lugar onde ninguém a
  procuraria.
- **`efeitoEmConcentracao` deixou de ser sorte: fica a ÚLTIMA a entrar.** Era
  `.find(...)` — ordem de chegada. O motivo da escolha está escrito no código: a
  última é exatamente a que `firmarEfeito` teria mantido se o save tivesse
  passado por ela; escolher a primeira faria um save velho **quebrar a magia
  recém-erguida e ainda guardar o fantasma da anterior** — perder duas vezes pelo
  mesmo defeito. Nenhuma das 7 asserções existentes virou de lado (em todas a
  marcada já era a última), e o dente novo trava **os dois sentidos**.
- **Uma porta só no App, com recuo de propósito.** `firmarOuCeder` tem um
  `try/catch` que, se o motor estourar, cai em `empilhar` puro — o comportamento
  de antes desta versão. Motivo: "nunca pode custar o turno" tem um irmão aqui —
  devolver a ficha intocada tiraria do jogador o PM que ele acabou de pagar. O
  recuo está declarado como proposital na suíte, para ninguém o "consertar".
- **A frase nasce no módulo e o App não monta uma sílaba.** Molde de
  `testeConcentracao.linha` (C2). O único direito da tela é o dono na frente no
  companheiro, pelo molde exato de C2b.

### O que o jogador lê (sem `mostrarRolagens`, sem nome de mecanismo)

- herói, buff: `💢 Bênção escapa dos dedos — Invisibilidade toma o lugar dela.`
- companheiro: `💢 Irmã Vela — Bênção escapa dos dedos — Escudo da Fé toma o lugar dela.`
- magia de duração: `💢 Voo escapa dos dedos — Invisibilidade toma o lugar dela.`
- o fio solto que C2b deixou, fechado: magia de duração **+** buff de habilidade
  → `💢 Voo escapa dos dedos — Bênção toma o lugar dela.`
- controle de regressão: **Luz do Dia** não concentra → linha vazia, e ela
  empilha ao lado sem derrubar nada.

### O teto de prompt: intocado, e a nota que não coube

**Pior cena real 81935 → 81935 chars** (teto 82.000, margem 65). Crescimento
estático **zero**. A nota do Mestre **não coube e não foi forçada**: a nota de C2
mede 289 chars, uma irmã mediria 279, e mesmo comprimida a uma cláusula colada na
que já existe mede 48 — 74% da margem inteira, com **três** sítios podendo
dispará-la e `notaRef` acumulando até o `enviar` seguinte. Mesma decisão de C2b,
pelo mesmo motivo. **Consequência escrita na pauta:** o Narrador recebe a magia
nova e continua achando que a antiga está de pé.

### O preço, declarado como fato: o piloto ficou burro

**Mordidas do abrigo 245 → 202, pontos comidos 980 → 808 (−17,6%)** na amostra da
suíte, e a causa está nomeada: as **60 cessões de 420 quedas são todas "Escudo da
Fé → Bênção"** — Remendo e Voto firmam o escudo e na rodada seguinte o jogam
fora. **A regra está certa** (o 5e concorda: Bless e Shield of Faith não
coexistem); quem está errado é o **piloto**, que não sabe que o teto existe.
Ensiná-lo mexe no que o jogador vive e por isso **é outra etapa** — vai para
"Aberto". O número entrou no molde de P3, como fato datado e não como limiar, e o
piso das metades ficou em 40 de propósito: um piso colado no dígito de hoje
**reprovaria justamente esse próximo conserto**.

**A catraca de equilíbrio não saiu da faixa e a margem mais fina abriu:**
`punho`/"cc" 38,9% → **40,2%** (5,2 pt do piso). Amplitude **11,9 pts** (sombra
55,1 · voz 43,2), 8,1 pt sob o teto de 20 — encolheu pelo resorteio do fluxo, não
por equilíbrio. **Nenhum limiar tocado, nenhum pronto reajustado.**

### O achado do ciclo: uma sabotagem que passava verde

A escada tem **23 degraus e nenhum ficou verde** — mas **S21 estava verde na
entrega**. Uma arena que chamasse `firmarEfeito`, empurrasse `fe.linha` e depois
**remendasse `eu.efeitos` à mão** passava em todas as âncoras *e enganava a
própria contagem de duplas* — porque a contagem lê as linhas, e a linha mentia.
É a lição de R4 uma camada abaixo: âncora prova que a linha existe, e nem a
medição salva quando o que se mede é o texto. O fio que a sabotagem não corta é o
**prazo** — um efeito que fica na ficha acaba vencendo —, e daí saiu o dente do
**fantasma**: nenhuma magia cedida pode depois vencer prazo ou cair pela queda de
C2. **S17** (a porta do App que imprime a troca e devolve a ficha de entrada)
também estava verde até a forma dos dois `return` ser travada.
Os degraus mais fundos: S22 (teto afrouxado para 2) acende **16**, S8 (a frase
dizendo o mecanismo) **10**, S2 (arena de volta ao `empilhar`) **6**, S1 (App de
volta) **5**.
E uma **ponte que ninguém tinha pedido**: a suíte extrai a palavra "UMA" de
`ECONOMIA_ACAO_PROMPT` e exige que a tabela cumpra esse número. C3 nasceu porque
promessa e código discordavam — **agora discordar é vermelho**.

### As três âncoras que o frontend teve de mover (e o motivo conferido)

`teste-efeitos.mjs` exigia **literalmente** `empilhar(p.efeitos, buff.efeito)` e
`empilhar(g.efeitos, buff.efeito)` no App: a letra antiga passou a **proibir o
conserto desta etapa**, e não havia como o código cumpri-la sem desfazer C3. O
`testes` conferiu as três e **concordou**: as duas primeiras ficaram mais fortes
(dois controles negativos novos proíbem a pilha genérica nesses sítios, e S1/S18
provam que mordem); a terceira perdeu o `{ ...g }` que provava não-mutação, e essa
intenção migrou para asserções **por chamada** em vez de regex. Aperto, não folga.
Observação anotada e não consertada: o controle negativo do sítio do herói lê o
arquivo **cru**, então um comentário futuro que cite a linha antiga o acende por
engano — os testes novos usam um `soCodigo(...)` que tira comentários antes de
toda prova de ausência.

### A FASE C ESTÁ FECHADA — o antes e o depois inteiro

**Antes (v9.233):** a regra de concentração existia por escrito nos dois lados e
não acontecia em lugar nenhum. `testeConcentracao` (`combate.js:797`) — a regra
ditada pela pessoa, `Math.max(10, dano/2)` — estava pronta **desde sempre** e
**nunca rodava**, porque nenhum dos três nascimentos de efeito copiava
`concentracao`. O campo existia em `condicoes.js` e no catálogo, e o meio
faltava: o herói segurava Invisibilidade, apanhava, e **não havia o que perder**.
Zero magias marcadas em tabela nenhuma; zero quebras; o `ECONOMIA_ACAO_PROMPT`
prometia duas coisas ao Narrador — que a magia quebra e que só se segura uma — e
**nenhuma das duas acontecia**.

**Hoje (v9.237):**
- **34 das 85 magias marcadas** e trancadas por `CONCENTRACAO_DA_MAGIA` — a regra
  mais **10 exceções, cada uma com o motivo escrito**, conferidas uma a uma
  contra o 5e. Lista de exceção, nunca de permissão: magia de duração nova amanhã
  não nasce sem marca em silêncio. **0** marcadas que sejam instantâneas.
- **Dois nascimentos alimentam a regra**, e ambos perguntam ao **catálogo**, nunca
  à ficha: `efeitoDeMagia` (C1) e `efeitoDeBuff` (C2b). `efeitoDeMilagre`
  continua mudo **por prova** — não existe tabela de milagre que declare
  concentração.
- **Quebras por queda, medidas:** de **0** para **10 em 168 quedas** na arena
  (todas de Bênção — Remendo 6, Voto 4), com Escudo da Fé nunca quebrando porque
  `absorverDano` já o consumiu antes de o dano restante chegar ao teste. Sobre o
  golpe de mediana 13 de P3, a magia aguenta **2,2 a 2,9 rodadas apanhando** antes
  de cair.
- **Trocas por teto:** de **0** para **60 em 420 quedas**, e **0 momentos com duas
  de pé** — onde antes 23,4% dos efeitos de concentração firmados eram uma
  segunda por cima de outra.
- **O jogador lê os dois acontecimentos**, em voz de mundo e **sem
  `mostrarRolagens`**, com o dono na frente quando é do grupo:
  `💢 Voo escapa dos dedos — o corpo aguentou 6, e era preciso 10.` e
  `💢 Irmã Vela — Bênção escapa dos dedos — Escudo da Fé toma o lugar dela.`
  Antes ele lia **que** perdeu; agora lê **por quê**. As duas frases nascem no
  módulo, ao lado do número — o App não monta uma sílaba de texto de regra.
- **A escolha deixou de ser sorte.** `efeitoEmConcentracao` era `.find(...)`;
  hoje é regra escrita, travada nos dois sentidos.
- **Duas portas únicas novas no App** — `segurarOuPerder` (C2b) e `firmarOuCeder`
  (C3) —, irmãs de `passarPeloAbrigo`, ambas com recuo que não custa o turno.
- **Teto de prompt: 81935 chars nas quatro versões.** A fase inteira entregou
  quebra, leitura, companheiro e teto com **crescimento estático zero** — o sinal
  do Mestre passou pela nota dinâmica, só no turno em que há o que dizer.
- **A suíte da fase:** `teste-efeitos.mjs` **387 → 421 → 463 → 482 → 543**;
  `teste-grimorio.mjs` 89 → **142**; `teste-arena.mjs` ganhou as seções 10 e 11.
  E a catraca de equilíbrio **nunca saiu da faixa em nenhuma das quatro etapas**,
  com **nenhum pronto reajustado** — a margem mais fina, `punho`/"cc", foi de
  32,9% (falso positivo) → 38,9% → **40,2%**.

**O instrumento também foi consertado no caminho** (C2b): famílias de 30 sementes
davam ~10% de vermelho falso a cada mexida no código; hoje são **120**, com piso,
teto e teto de amplitude intocados.

### O que ficou

- **Não há mais fase aprovada na fila.** A Fase C fecha a última; o próximo ciclo
  pega de "Aberto".
- **Três itens novos em "Aberto"** (ver a pauta): o piloto que não sabe do teto e
  joga fora o abrigo; o Narrador que continua achando que a magia trocada está de
  pé (é o mesmo furo de C2b, agora com um terceiro dono); e os comentários novos
  do `App.jsx` **sem acento**, que cresceram de novo nesta versão.
- **C2c (o inimigo conjurador) intocado**, como mandado — segue em "Para a pessoa
  decidir".
- **O relógio quebrado das condições do grupo: não consertado, e o endereço está
  dito.** O `frontend` esbarrou nele em **`App.jsx:7897-7901`**, dentro do mesmo
  `buffDeCompanheiro` que ele mexeu — é ali que `g.condicoes` é escrito. A mão
  entrou só em `g.efeitos`. O item segue em "Para a pessoa decidir".
- Nenhuma dívida entrou como `pendente` — não houve nenhuma.

## 14/09 03:09 · v9.236 · C2b · o companheiro segura o que já conjura · commit `0f96fd6`
- **estado inicial:** árvore limpa, HEAD `3791b26`, VERSÃO v9.235, `npm test`
  181/181 suítes + 8/8 varredores verde. Sem trava de ciclo. A vez era **C2b**,
  a etapa que o próprio C2 escreveu na pauta ao medir e se desfazer em três.
- **conselheiro:** não chamado (a etapa já estava escrita e aprovada).
- **backend:** mediu o raio **antes** de escrever comportamento, depois ligou
  `efeitoDeBuff` (`efeitos.js`) ao catálogo — `magiaPorNome` + `exigeConcentracao`,
  um import novo — e pôs a cobrança em `arena.js:235-267`.
- **frontend:** as três chamadas do `App.jsx` por **uma porta só**,
  `segurarOuPerder` (`:6593`), irmã de `passarPeloAbrigo`; os sítios andaram
  (`:13436`, `:11756`, `:17284`). Conferência viva sem tocar em save nenhum.
- **testes:** consertou a catraca de equilíbrio que ficou vermelha, e o conserto
  foi no **instrumento**; `teste-arena.mjs` ganhou a seção 10 (a arena *cobra* a
  concentração). `teste-efeitos.mjs` 463 → **482** (seção 18, do backend).

- **A MEDIÇÃO VEIO PRIMEIRO PORQUE A PORTA É A MESMA DO HERÓI, e ela corrigiu
  dois números da pauta.** `aplicarBuffDeHabilidade` serve os dois, então ligar o
  companheiro liga o herói junto — C2 avisou, e o aviso valeu. **"Cinco
  habilidades do herói" são três:** Bênção, Escudo da Fé e Invisibilidade. Voo e
  Marca do Caçador casam com o catálogo mas **não abrem condição nenhuma** em
  `aflicaoDe`, então `efeitoDeBuff` nunca é chamado por elas — o raio do herói é
  3, e está travado nominalmente na suíte. **"13 escolhíveis" nos prontos são
  quatro:** 13 é quantas o piloto *enxerga*, 5 entram só pelo ramo ofensivo (viram
  golpe, nunca efeito) e 4 por cura; só Bênção e Escudo da Fé, no Remendo e no
  Voto, chegam a `efeitoDeBuff`. `chama` e `voz` carregam 8 e 7 magias de
  concentração e **nenhuma** vira efeito. Colisão de nome: **zero**.

- **DECISÃO MÉDIA: a porta é o catálogo, nunca a habilidade.** `exigeConcentracao`
  aceita o objeto que recebe; passar `h` (a ficha) direto responderia **`false` em
  silêncio** para tudo, e o bug seria invisível — a magia nasceria sem concentrar
  e ninguém saberia. Pior: abriria um **segundo lugar** para a regra morar, contra
  a lei "se é número, é tabela". `magiaPorNome(h.nome)` primeiro, a pergunta
  depois. A chave nasce só quando é verdade (ausente, nunca `false`).

- **A CATRACA FICOU VERMELHA, E A MEDIÇÃO MOSTROU QUE A CULPA ERA DELA.** Uma
  asserção só: `[cc] punho vence entre 35% e 65% (32,9%)`. **`punho` não tem uma
  magia na ficha nem um efeito de concentração para segurar** — não pode ser
  afetado pela regra nova. A prova que fechou o caso: uma cópia da arena de C2b
  com o **saque mantido na condição e na frequência exatas** e **toda consequência
  de jogo apagada** (nada quebra, nenhuma linha nasce) mede os **mesmos 32,9%**,
  dígito por dígito. A sorte da arena é um fluxo global travado por semente: um
  d20 a mais reembaralha tudo o que vem depois dele. O retrato de baixa variância,
  que não sente isso, não se moveu — `punho` 45,4 → 45,6.

- **DECISÃO MÉDIA: o conserto é do instrumento, e é um número só — 30 → 120
  sementes por família.** A cegueira foi medida antes de ser consertada: 40
  famílias independentes de 30 sementes/par sobre a arena **sã** dão σ de 3,3–4,3
  pts e **1 em 40 já traz um pronto fora da faixa sem nada ter quebrado** — com
  quatro famílias por rodada, **~10% de vermelho falso a cada mexida no código**.
  A 120 sementes: σ 1,5–2,2 e **0 em 20**. Piso 35, teto 65, as quatro famílias, o
  retrato e o teto de amplitude **intocados**: subiu a precisão do estimador,
  nunca a severidade do dente. 120 é o número que a própria tabela já chamava de
  baixa variância duas linhas abaixo — a família herda a fronteira em vez de
  inventar uma segunda. Custo: `teste-arena.mjs` 11,1 s → 25,9 s; `npm test`
  ~80 s → 95 s.
- **E a prova de que os dentes continuam mordendo, que era a trava desta decisão.**
  A escada de sabotagem (`sombra` ganhando vida) foi refeita com a **suíte
  inteira**, nos dois instrumentos — vermelhos de 30 → de 120: +2 `1→0` · +3
  `1→0` · +5 `3→2` · +8 `7→6`. **O vermelho que some é sempre o mesmo, `[cc]
  punho` — e ele acende idêntico na árvore sã.** Um vermelho que aparece com e sem
  a sabotagem não é detecção, é o ruído da página; descontado ele, os dois
  instrumentos pegam exatamente as mesmas sabotagens. A sabotagem registrada no
  diário de A4, rodada na árvore em que foi registrada, fica vermelha **nos dois**,
  pelo mesmo dente e com o mesmo dígito.
- **DUAS SAÍDAS MAIS FÁCEIS FORAM RECUSADAS, e o motivo é o mesmo nas duas.**
  (a) **Trocar a família "cc"** por outra semente: as três irmãs foram escolhidas
  **antes** de medir, e está escrito na tabela de propósito; trocar justamente a
  que saiu vermelha é catar a semente **depois** de ver o resultado — a família
  nova ficaria verde porque foi catada para ficar, e o dente passaria a medir a
  sorte de quem escolhe. (b) **Crescer o retrato junto:** ali mais precisão
  **afrouxaria**. Amplitude é máximo menos mínimo, ruído infla essa distância, e o
  teto de 20 foi calibrado a 120 sementes/par — amostra maior mediria amplitude
  menor pelo mero sumiço do ruído e daria folga nova debaixo do mesmo teto, sem
  ninguém ter equilibrado nada. **Nenhum número de pronto foi reajustado.**
- **A margem mais fina, honesta:** `punho` em "cc" com **38,9% — 3,9 pt do piso**
  (era 36,2%/1,2 pt a 30 sementes, e 32,9% no dia em que quebrou). Mesmo pronto,
  mesma família: os 2,7 pts que apareceram são ruído indo embora, não parede
  andando. Amplitude do retrato **12,6** (teto 20).

- **DECISÃO MÉDIA: a cobrança entra por uma porta só, não por três.** Três
  `try/catch` soltos nos três sítios seriam três chances de a regra nascer
  diferente em cada um — o vício que a Fase A veio matar. `segurarOuPerder(quem,
  dano, nome)` é `calou("concentracaoDoCompanheiro", ...)` e devolve `linha: ""`
  como único sinal de que nada aconteceu. Nos quatro sítios (os três do App mais o
  da arena) a conta é a mesma: sobre a ficha **pós-abrigo** (o escudo que comeu a
  batida já pagou por ela — testar sobre a ficha velha devolveria o escudo já
  consumido), só em quem fica **de pé**, só quando o golpe **tirou PV**.
- **O que o jogador lê é a frase de C2, palavra por palavra.** O App não monta uma
  sílaba — `grep "escapa dos dedos" src/App.jsx` volta vazio; ele põe só o dono na
  frente, pelo mesmo molde de `passarPeloAbrigo`, para o 🛡 e o 💢 do companheiro
  saírem irmãos na cena. E **independe de `mostrarRolagens`**, como a do herói:

  `💢 Irmã Vela — Bênção escapa dos dedos — o corpo aguentou 9, e era preciso 10.`

  Na arena, com o nome do duelista: `O Remendo — Bênção escapa dos dedos — …`
- **O efeito no combate, medido:** em 168 quedas na arena, **10 quebras**, todas de
  **Bênção**, só no Remendo (6) e no Voto (4) — 0,06 por queda. **Escudo da Fé
  nunca quebra**, e por um motivo correto: `absorverDano` já o consumiu antes de o
  dano restante chegar ao teste.

- **DECISÃO MÉDIA: o companheiro NÃO ganha nota ao Narrador na quebra, e é o que
  mais quero registrado.** C2 mediu a pior cena real em **81935 chars, margem 65**
  para o teto de 82.000. A nota do herói custa ~370 chars no turno da queda, e
  herói e companheiro podem cair **na mesma rodada de inimigos** — uma segunda
  nota ali **estoura o teto**, e o teto de prompt é sagrado. A conta não fecha
  sozinha e o canal não estava no recorte da etapa: fica na pauta como item, não
  como dívida silenciosa.
- **DECISÃO MÉDIA: o companheiro não ganha a linha 🎲 de `mostrarRolagens`.** Dar
  uma exigiria inventar o formato da voz de bastidor com o dono prefixado, e a
  frase de C2 já é independente do portão — o jogador lê o porquê de qualquer
  jeito. Assimetria consciente com o herói, não esquecimento.
- **DECISÃO MÉDIA: a conferência viva foi bancada determinista + montagem, não
  combate real.** Todo caminho até uma quebra de companheiro na mesa passa por
  `enviar` (o Narrador): uma dezena de turnos de IA, e **"qualquer coisa que custe
  dinheiro" está na coluna pesado** da tabela da casa. A bancada (27 asserções, d20
  travado) prova os números e a frase; a montagem em aba nova prova que o arquivo
  não caiu (sem `LimiteErro`). A queda ao vivo na mesa fica para um "sim" da pessoa.
- **UMA ASSERÇÃO DE C1 FOI MOVIDA, COM O MOTIVO ESCRITO** (lei da casa). A linha
  que exigia `efeitoDeBuff(magiaPorNome("Voo"))` **mudo** era C1 travando o estado
  de então — e virou a suíte **proibindo o conserto** desta etapa. A intenção
  mudou de endereço e ficou mais forte: a seção 18 confere **as 85 magias** contra
  `exigeConcentracao` nas duas direções, em vez de uma.

- **A CORREÇÃO DE PROCESSO DESTE CICLO: o save de uma pessoa não é material de
  teste.** Em C2 a conferência viva **sobrescreveu um save real** da pessoa
  (`taverna_rapida_v1`) — a memória da casa já avisa que *autosave sobrescreve
  injeção*, mas o aviso só falava do lado que perde o boneco de teste, não do lado
  que perde a partida de alguém. Virou seção obrigatória em
  `.claude/agents/frontend.md`: guardar o valor de toda chave que for tocar **em
  arquivo no scratchpad** (a aba recarrega), injetar com o jogo desmontado,
  restaurar idem, **confirmar por leitura** e dizer no relato quais chaves tocou.
  Funcionou no mesmo dia: o `frontend` gravou comprimento + SHA-256 de tudo antes
  e depois, e **não escreveu em chave nenhuma** — `taverna_rapida_v1` saiu com o
  mesmo hash com que entrou, e `taverna_save_v1`/`taverna_duelo_v1` continuam
  ausentes como estavam.

- **o que ficou:**
  - **Não esbarramos no relógio quebrado das condições do grupo** — nenhuma mão
    escreveu em `pers.grupo[].condicoes`. O caminho desta etapa é
    `pers.grupo[].efeitos`, cujo tique existe e roda (`App.jsx:8204`). O item
    segue em **"Para a pessoa decidir"**, intocado.
  - **C2c (o inimigo conjurador) não foi tocado, nem parcialmente** — é `pesado` e
    está com a pessoa.
  - **Achado novo, e é de equilíbrio, não de instrumento:** o aperto da sabotagem
    `sombra +3` **vem encolhendo sozinho a cada ciclo** — 3 vermelhos em A4, 1 na
    árvore de antes de C2b (amplitude 20,8), **0** depois (amplitude **19,6, a
    0,4 pt do teto**). Nenhum limiar mudou e nenhum pronto foi reajustado: é a
    amplitude sendo resorteada a cada mexida na arena, que é o que
    `tetoDeAmplitude` já avisava. Mexer no teto é afrouxar/apertar limiar, e
    rebalancear pronto não estava autorizado — **vai para a pauta**.
  - **Um fio solto que é de C3, não desta etapa:** o herói agora pode ter buff *e*
    magia de duração concentrando ao mesmo tempo, e `efeitoEmConcentracao` devolve
    o **primeiro** — pode cair a errada. É exatamente o "uma de cada vez" que C3 já
    tem escrito, e agora com um caso a mais.
  - **A nota ao Narrador na quebra do companheiro** vai para a pauta com a conta
    (margem de 65 chars) já feita.

## 14/09 02:10 · v9.235 · C2 · a quebra acontece na mesa · commit `086d035`
- **estado inicial:** árvore limpa, HEAD `0b04b30`, VERSÃO v9.234, `npm test`
  181/181 suítes + 8/8 varredores verde. Sem trava de ciclo. A vez era **C2**,
  a segunda etapa da Fase C, aprovada pela pessoa.
- **conselheiro:** não chamado (a etapa já estava escrita e aprovada).
- **backend (duas chamadas):** a primeira foi **medição pura**, sem escrever uma
  linha — o tamanho real de companheiro e inimigo conjurador. A segunda fez a
  frase da quebra nascer no módulo: `testeConcentracao` (`combate.js`) ganhou o
  campo `linha` e a tabela `RESISTENCIA_DA_CONCENTRACAO`.
- **frontend:** trocou a fiação em `App.jsx:13376-13408` (o nome desce, `tc.linha`
  sobe, o bloco entrou em `try/catch` com `calou`), escreveu a nota dinâmica ao
  Narrador e conferiu vivo — com a queda de verdade na mesa.
- **testes:** não chamado como mão própria; as provas vieram dentro das duas
  entregas. `teste-efeitos.mjs` 421 → **463** (seção 17 nova): 29 asserções de
  regra + 13 âncoras de fiação, com quatro sabotagens medidas.

- **O CORTE FOI A DECISÃO DO CICLO, E ELE VEIO DE NÚMERO, NÃO DE PALPITE.** A
  etapa C2, como estava escrita, tinha duas metades de tamanhos incomparáveis.
  Mandei o `backend` medir **antes** de prometer qualquer coisa, e a medição
  desfez a etapa em três. **A metade do herói encolheu:** a pauta dizia que a
  linha da quebra inteira dependia de `mostrarRolagens`, e é meia verdade — a
  linha `💢 Concentração quebrada` (`:13383`) sempre foi **incondicional**; o que
  estava atrás do portão era só o **🎲 com a CD e o dado** (`:13381`). Ou seja: o
  jogador já lia *que* perdeu e *qual* magia, e não lia **o porquê**. Isso é
  bem menor do que a pauta supunha — e continua sendo o coração da etapa, porque
  perder a magia que se pagou sem entender o que a derrubou é perder duas vezes.

- **DECISÃO MÉDIA: a linha nova nasce SÓ NA QUEDA.** Considerei mostrar também o
  teste que a magia aguenta — o argumento a favor é que o jogador saberia que a
  magia está sob risco. Recusei: seria uma linha de sistema **a cada golpe**
  sofrido, por rodada, e o que se ganha em aviso se perde em ruído na cena. Quem
  quer ver o teste mantido continua tendo a 🎲 de `mostrarRolagens`, intacta. A
  frase da queda explica o porquê no instante exato em que ele importa. Travado
  na suíte dos dois lados (`linha` vazia na mantida, com controle negativo).

- **DECISÃO MÉDIA: a frase é conta, então mora no módulo.** A lei "conta se
  prova, tela se olha" mandou: o texto que carrega número nasce em `src/` e é
  provado em Node, no molde exato que `absorverDano` já usa (`efeitos.js:353`).
  O `App.jsx` não monta uma sílaba — só empurra `tc.linha`. Consequência boa e
  não planejada: a CD teve de sair do meio do `Math.max` e virar tabela
  (`RESISTENCIA_DA_CONCENTRACAO`), porque agora o **texto** carrega a
  dificuldade, e número escrito à mão é número que a suíte só prova copiando —
  duas cópias divergem em silêncio, e aí a frase mente sobre a própria regra.

- **A LEI IRMÃ FOI RESPEITADA NAS DUAS DIREÇÕES.** "O sistema não fala de si
  mesmo": o jogador lê **a magia se desfazendo e o número que decidiu**, nunca o
  rótulo do mecanismo. O que ele lê agora, capturado ao vivo com `mostrarRolagens`
  **desligado**: `💢 Voo escapa dos dedos — o corpo aguentou 6, e era preciso 10.`
  A voz de ficha (`Concentração: d20+2=9 vs CD 11 → QUEBRADA`) ficou **palavra
  por palavra** onde estava, atrás do portão, e a suíte trava isso por regex
  exata — a lista de palavras de bastidor tem controle negativo (reprova o
  `texto` de depuração), senão não estaria medindo nada.

- **O NARRADOR ENFIM RECEBE O SINAL, E SEM GANHAR UM BYTE DE PROMPT.**
  `ECONOMIA_ACAO_PROMPT` promete há versões *"quando quebrar, narre o efeito se
  desfazendo na hora"* — e o Mestre nunca ficava sabendo que a magia tinha caído:
  promessa sem sinal. A nota vai por `notaRef`, o canal **dinâmico**, e só no
  turno da queda. **Pior cena real medida: 81935 chars antes, 81935 depois** (teto
  82.000, margem 65). Crescimento estático: **zero**. `ECONOMIA_ACAO_PROMPT` não
  foi tocado, e há asserção de controle cravando que ele não cresceu.

- **O QUE A MEDIÇÃO ACHOU, E É O ACHADO DO CICLO: o companheiro JÁ CONJURA magia
  de concentração — ela é que não sabe.** A pauta supunha que dar magia a ele
  seria órgão novo. Não é: **8 das 148 habilidades de classe são magias do
  catálogo pelo nome, e 5 concentram** — um Clérigo companheiro de nível 3 sai da
  ficha com **Bênção** e **Escudo da Fé**, e o piloto já as escolhe. Nos oito
  prontos da arena são **28 magias de concentração** na ficha, 13 delas
  escolhíveis. O que falta não é a magia: é o efeito **nascer sabendo**
  (`efeitoDeBuff` perguntando ao catálogo pelo nome). 0 tabela nova, 0 sítio novo
  de nascimento, 1 import novo. Virou **C2b** na pauta, com o cuidado que a
  medição também deu: a porta é a **mesma do herói**, então o raio é herói+
  companheiro e precisa ser medido antes, não depois.

- **E o inimigo é o oposto exato: órgão novo, e volta para a pessoa.** A ficha de
  inimigo (27 entradas em `bestiario.js`) não tem habilidade nem magia; **0 sítios**
  escrevem `efeitos` em inimigo em todo o `src/`; `tickEfeitos` **não roda** sobre
  eles; `turnoDosInimigos` tem **um verbo só** (bater), sem estrutura de plano; e
  o inimigo apanha em **dez sítios** espalhados, sem porta única. O pré-requisito
  honesto é essa porta — e a irmã dela no herói (`sofrerNaPele`) foi a v9.66
  inteira, sozinha. Virou **C2c**, marcado `pesado`, na seção da pessoa.

- **O CHEQUE BARATO QUE RENDEU MAIS QUE A ETAPA: o herói apanha em seis sítios e
  o teste roda em um.** Pedi de passagem que a medição olhasse se há outro lugar
  onde ele sofre dano sem que a concentração seja testada. Há **cinco**, e um
  deles é regra explícita do 5e: `App.jsx:8173` (dano de condição — veneno,
  sangramento), `:8069` (`sofrerNaPele`, a porta única, e com ela salvaguarda,
  queda, armadilha e o preço do esforço), `:12970` e `:13907` (os dois ataques de
  oportunidade) e `regras-jogo.js aplicarMudancas` (dano do Narrador fora de
  combate). **Não liguei nenhum**, de propósito: C1 mediu o raio da quebra com
  cuidado justamente para não estourá-lo, e ampliar o raio hoje não estava
  autorizado pela etapa. Está na pauta com os endereços.

- **Conferido vivo, e com a queda de verdade — não só "monta sem erro".** Aba
  nova, árvore de acessibilidade em vez de foto. Uma Noite → Torneio → A Chama,
  luta contra O Voto: rodadas 2 e 4 apanharam 14 e 4 e o teste **aguentou em
  silêncio** (a decisão de não falar quando aguenta está certa na prática);
  rodada 5, 23 de dano, o teste **caiu** e as duas frases saíram — a do jogador
  na tela, a do Mestre no envelope. `efeitos: []` depois, ou seja
  `quebrarConcentracao` continua no caminho.

- **Duas coisas honestas.** (1) Para chegar ao combate, o `frontend` entrou numa
  Noite nova e **sobrescreveu o save de "Uma Noite" do ciclo M6**
  (`taverna_rapida_v1`, a sessão "A Muralha"). Era save de teste e a campanha
  (`taverna_save_v1`) nem existia, mas é perda real e fica registrada. O resto do
  `localStorage` foi restaurado — as mesmas três chaves do início,
  `taverna_cfg_rolagens` de volta em `"1"`. (2) Os comentários novos nasceram
  marcados `v9.222` (versão de outra fase, que existe de verdade em
  `App.jsx:19365`); corrigidos para `v9.235` por script `.cjs` via `node`, âncora
  inteira e única, com **0** caracteres de substituição nos três arquivos depois.

- **o que ficou:** **C2b** (o companheiro segura o que já conjura) e **C2c** (o
  inimigo conjurador, `pesado`, para a pessoa) escritos na pauta; **C3** intocado
  e ainda válido como conserto (C1 já provou que o jogo não cumpre o "uma de cada
  vez"); item novo em Aberto para os **cinco sítios** onde o herói apanha sem
  teste; e um achado de passagem do `backend`, também em Aberto: `RX_CURA`
  (`companheiros.js:91`) não tem fronteira de palavra, então **"proCURA"** e
  **"obsCURA"** casam — `Localizar Objeto` e `Adivinhação` são classificadas como
  cura, e os quatro prontos que carregam `Localizar Objeto` sentem isso de fato.

---
## 14/09 01:35 · v9.234 · C1 · o campo nasce e viaja · commit `a57b1b2`
- **estado inicial:** árvore limpa, HEAD `436afb9`, VERSÃO v9.233, `npm test`
  181/181 suítes + 8/8 varredores verde. A Fase P estava fechada; a vez era
  **C1**, a primeira etapa da Fase C, aprovada pela pessoa com a regra ditada
  por ela.
- **conselheiro:** não chamado (a etapa já estava escrita e aprovada).
- **backend:** `CONCENTRACAO_DA_MAGIA` + `exigeConcentracao` em `grimorio.js`
  (a tabela e a fachada), `fichaDaMagiaTexto` passando a ler a fachada, e a
  linha que faltava em `efeitoDeMagia` (`efeitos.js`).
- **frontend:** **não chamado, de propósito** — ver abaixo.
- **testes:** `teste-grimorio.mjs` 89 → **142** (seção 12) e `teste-efeitos.mjs`
  387 → **421** (seção 16). 87 asserções novas, seis sabotagens medidas.

- **A ETAPA ERA PEQUENA DE VERDADE, E FOI FECHADA PEQUENA.** Venho de três
  fases seguidas (A3, P1, P3) em que a etapa era maior do que a pauta dizia, e
  por isso a primeira coisa que fiz foi medir o tamanho antes de distribuir
  trabalho. O resultado: **um arquivo de motor com uma linha de comportamento,
  uma tabela de conferência, e nenhuma fiação nova**. O `App.jsx` **não foi
  tocado** e não havia o que tocar nele — o caminho da quebra já estava inteiro
  lá desde antes (`:13377` acha quem concentra, `:13379` roda o teste, `:13383`
  escreve a linha que o jogador lê, `:13434` tira o efeito da ficha). Faltava
  só o campo. Inflar a etapa para justificar o ciclo seria o oposto da lei da
  casa, então o `frontend` não foi chamado.

- **A PAUTA ERRAVA NUM PONTO, E A ETAPA O CORRIGIU: são três nascimentos, mas
  só UM tem fonte.** A pauta dizia "nenhum dos três nascimentos o copia", o que
  sugeria três consertos. Medido: `efeitoDeBuff` (habilidade) e
  `efeitoDeMilagre` (milagre) **não têm de onde copiar** — `concentracao` não
  existe em tabela de habilidade nem de milagre em lugar nenhum da casa. O
  campo atravessa **um** nascimento, `efeitoDeMagia`, e os outros dois
  continuam mudos **por prova**, não por esquecimento: há asserção exigindo que
  nem `true` nem `false` saiam deles.

- **A MARCAÇÃO É TABELA, E A CONFERÊNCIA PASSOU SEM MEXER EM NADA.** O catálogo
  já carregava a verdade por entrada (`concentracao:` na fábrica `M(...)`); o
  que faltava era a **catraca**. `CONCENTRACAO_DA_MAGIA` declara a regra
  ("magia de duração exige concentração") e nomeia as **10** exceções **cada uma
  com o motivo escrito** — lista de exceção, nunca de permissão, no molde de
  `APLICACAO_DO_BUFF` (P1) e com o dente de `GUARDAS` (P2): magia de duração
  nova amanhã **não nasce sem marca em silêncio**. Os números: **85** magias ·
  **44** de duração · **34** marcadas · **10** de duração sem marca · **0**
  marcadas que sejam instantâneas (não há a mentira do outro lado) · e o fecho
  `marcadas + exceções === deDuração`. **Nenhuma entrada de catálogo mudou de
  valor**: conferidas uma a uma contra o 5e, as dez estão certas. Foi
  conferência registrada, como A4 — e teste verde também é resposta.

- **DECISÃO MÉDIA: A QUEBRA COMEÇA A ACONTECER NESTE CICLO, E FOI DE PROPÓSITO.**
  C1 não fazia a quebra acontecer — isso é C2 —, mas com o caminho do App já
  inteiro, o campo chegando **dispara a quebra sozinho**. Decidido com o
  `backend`, que concordou, e a razão principal é de lei: segurar não seria
  "não ligar ainda", seria **desligar um caminho que já está ligado** — e
  "remover ou desligar o que existe" é pesado, não está aprovado, e o que está
  aprovado é exatamente o contrário. Toda forma de segurar custaria um portão
  novo sem tabela, cujo único propósito seria desligar o que a pessoa pediu, e
  que alguém teria de lembrar de remover em C2: dívida escondida.
  **O raio está medido e é minúsculo.** `efeitoDeMagia` tem **um** chamador de
  produção em todo o projeto (`App.jsx:12453`), restrito a
  `funcao ∈ {invisibilidade, voo, luz}` = **4** magias: Invisibilidade, Voo,
  Invisibilidade Maior (as três concentram) e Luz do Dia (não concentra, e está
  certo). **Só o herói** — nenhum NPC, nenhum companheiro, nenhum piloto de
  arena faz nascer esses efeitos. Nenhuma das três soma dano.

- **O EFEITO MEDIDO, EM NÚMERO.** A conta é fechada (d20 uniforme), então não há
  simulação: há probabilidade exata. O teste roda **uma vez por rodada**, sobre
  o dano **total** da rodada (`danoNoJogador`), e não uma vez por golpe.
  CD = `max(10, dano/2)` → **a metade do dano só começa a morder a partir de 22**
  (com 21 a CD ainda é 10). Sobre o golpe de mediana **13** que P3 mediu em Uma
  Vida, a CD é 10, e a chance de **quebrar** numa rodada em que se apanha é
  **45% com modVigor +0 · 40% com +1 · 35% com +2**. Em outras palavras: a magia
  de duração aguenta em média **2,2 a 2,9 rodadas apanhando** antes de cair. Com
  dano de rodada 30 a quebra vai a 65% (+1), e com 40, a 90%. É uma forma nova
  de o jogador perder a magia que pagou, ela é sensível e o número diz isso — foi
  o que a pessoa autorizou ao ditar a regra, e é o que C2 vai fazer o jogador
  **ler direito**.

- **AS SABOTAGENS, EM NÚMERO** (feitas em cópia, nunca na árvore). Apagar a linha
  nova de `efeitoDeMagia` derruba **11** asserções; trocá-la por um
  `concentracao = true` incondicional derruba **14**; tirar uma exceção da tabela,
  **4**; marcar uma magia hoje não marcada, **5**; ampliar a lista de `funcao` da
  porta do App, **4**; tirar de `exigeConcentracao` a linha em que o campo manda,
  **2**. Duas lições vieram daí: a primeira sabotagem fazia a suíte **estourar**
  em vez de contar (o vício que a pauta já nomeia num item aberto), consertada
  nas duas linhas com o motivo em comentário; e a lista da porta do App estava
  **redigitada** na suíte, medindo a própria cópia — passou a ser **lida do
  `App.jsx`**, e a sabotagem foi de 1 para 4 asserções derrubadas.

- **O QUE C2 HERDA, JÁ MEDIDO.** (a) A quebra do **herói** já acontece — C2 não
  a liga, C2 confere o caminho inteiro e faz o jogador **ler** o que houve (hoje
  a linha da rolagem só aparece com `mostrarRolagens` ligado, e a CD/rolagem é
  metade do que ele precisa saber). (b) **Companheiro e inimigo conjurador
  continuam fora**: nenhum deles faz nascer efeito de magia, então para eles não
  há o que quebrar — é trabalho de C2 e é maior do que parecia. (c) **O herói
  pode segurar DUAS concentrações ao mesmo tempo** (Voo e depois Invisibilidade:
  `empilhar` só substitui por nome igual) e `efeitoEmConcentracao` devolve a
  **primeira**, então uma batida derruba uma só — achado do `backend`, é
  exatamente o assunto de **C3**, e a forma natural é `CONCENTRACAO_DA_MAGIA`
  ganhar o teto, que é onde a regra já mora.

- **O QUE FICOU** (e virou item novo na pauta, `leve`): as duas portas discordam
  sobre valor não-booleano — `exigeConcentracao({concentracao: "sim"})` ignora o
  campo e cai na regra, `efeitoDeMagia` o aceita por verdade. Para as 85 do
  catálogo nunca diverge (todas têm booleano, e há asserção cravando isso), mas
  magia digitada pelo Mestre passa pelas duas. Os `testes` travaram o
  comportamento atual dos **dois** lados em vez de julgar qual está certo — que
  é o certo a fazer numa etapa que prometeu não decidir regra.

## 14/09 01:05 · v9.233 · P3 · a proteção enfim protege (A FASE P FECHA) · commit `99500c7`
- **estado inicial:** árvore limpa, HEAD `a2bfe6e`, VERSÃO v9.232, `npm test`
  181/181 suítes + 8/8 varredores verde. A vez era **P3**, a última etapa da
  Fase P — e a pauta já dizia, corrigida depois de P2, que a etapa tinha virado
  outra coisa: **a proteção ainda não protegia ninguém**, e enquanto não
  protegesse o piloto não podia procurá-la.
- **conselheiro:** não chamado (a etapa já estava escrita e aprovada).
- **backend (duas mãos):** a absorção com número e com leitor
  (`ABSORCAO_DO_BUFF` + `absorverDano` em `efeitos.js`, consumo em `arena.js`);
  depois o recorte do piloto (`ehAbrigo` em `companheiros.js`, o terceiro
  degrau) e as duas medições de Uma Vida.
- **frontend (duas mãos):** a porta única `passarPeloAbrigo` e os 7 sítios de
  dano do herói e do grupo; depois o **nascimento** do abrigo no companheiro
  (`buffDeCompanheiro` passando a chamar `efeitoDeBuff`) e o irmão no relógio
  (`tickEfeitos` sobre `pers.grupo`). Tudo em `calou(...)`.
- **testes:** 193 asserções novas — `teste-efeitos.mjs` 201 → **387** (seções
  13, 14 e 15), `check-protecao.mjs` 38 → **45** — mais o conserto do dente da
  mesa real em `teste-arena.mjs` (76 → **79**).

- **O QUE MUDOU EM UMA FRASE.** Desde sempre, *"absorve o próximo dano"* tirava
  **zero** de dano de quem quer que fosse: P1 tirou a mentira do golpe (o Escudo
  Arcano parou de narrar "+2 de dano mágico"), mas a defensiva nasceu com força
  **zero** e sem leitor. Hoje ela **come do golpe e se gasta** — na mesa de Uma
  Vida, na arena, no herói e no companheiro —, e o jogador lê quanto parou ali.

- **O DESENHO ADOTADO CONTRA O DA PAUTA, e os números que decidiram.** A pauta
  previa `absorve: N` numa entrada de `pers.guardas`, reusando `expirarGuardas`.
  O backend mediu e adotou a **porta irmã**: `absorve: N` no próprio **efeito**
  que `efeitoDeBuff` já cria, consumido por `absorverDano`.
  - **Alcance.** A família `absorve` é **25 das 64** defensivas do acervo de 593
    — a maior das cinco. Na arena, `GUARDAS` pega **0 dos 8 prontos** (fato que
    P2 já cravara com teto 0); `absorve` pega **3** — Chama, Remendo e Voto —, e
    os três estavam **abaixo de 50%** na catraca, que é onde a proteção deve
    pesar.
  - **Sítios novos de nascimento: zero.** `efeitoDeBuff` já era chamado nas duas
    portas que ligam abrigo a ficha. Pela porta da guarda, as duas teriam de
    aprender a rotear — e uma delas mora no App, ou seja metade da proteção
    ficaria escura até a mão seguinte.
  - **A convivência se dissolve:** há **1 colisão** no acervo inteiro (Forma
    Dracônica casa com as duas tabelas), e a precedência que a resolve já estava
    escrita e testada — `guardaDe` primeiro.
  - **A seta de dependência não se mexe.** `habilidades.js` continua a única
    folha do motor, com zero imports; o desenho da guarda exigiria
    `habilidades.js → combos.js`.

- **DE ONDE SAI O NÚMERO — e por que o teto é a parte que importa.**
  `ABSORCAO_DO_BUFF` = `{ porPM: 2, custoPadrao: 2, minimo: 2, teto: 12 }`. A
  régua sai do **custo**, como em `BUFF_DA_HABILIDADE`: 2 de golpe por PM, o
  dobro da força ofensiva, porque um bônus de dano cobra em **todo** golpe dos
  três turnos e este cobra **uma vez só**. Escudo Arcano (2 PM) come 4 · Muralha
  de Gelo (5) come 10 · Pele de Pedra (7) come 12.
  **O teto 12 foi medido, não escolhido:** um golpe na arena tem mediana **13** e
  média 13,76, sobre duelistas de 24–36 PV, e uma queda dura 4,85 golpes
  acertados. 12 é o maior número que ainda fica **abaixo** de um golpe mediano —
  nem Globo de Invulnerabilidade (11 PM, 22 sem teto) apaga uma batida. É a
  mesma lei que o comentário de `GUARDAS` já escrevera para a defesa: nada que
  zere o golpe, porque defesa alta é a estatística que mais rápido quebra um
  combate. **Prova na mesa real:** em 241 mordidas, **0 vezes** o abrigo comeu o
  golpe inteiro.

- **O RECORTE DO PILOTO: uma família, e o motivo é o fracasso de P2.** P2 mediu
  a ampliação inteira e a catraca reprovou — `ehBuff` 33 → 75, `sombra` de 60,2
  para **32,9** (piso 35), amplitude 15,8 → **25,7** (teto 20), +150 linhas de
  abrigo **todas inertes**. A causa não era o tamanho: era a **força zero**. O
  que mudou entre P2 e hoje foi **uma** família. Logo o recorte é o número: das
  42 defensivas que o regex nunca viu, entram as **12** que compram alguma
  coisa; as outras 30 (amortece 8 · nao_cai 5 · intocado 18 · protege 8) ficam
  de fora até terem o que comprar. **`sombra` é a prova de que o recorte está no
  lugar certo:** quem o derrubou em P2 foi "Esquiva Ágil", e Esquiva Ágil é
  `intocado` — fora daqui. `ehBuff` no acervo: 33 → **45**.

- **A CATRACA VOLTOU — e APERTOU, sem reajustar pronto nenhum.** Retrato de 120:
  amplitude **15,0 → 12,7** pts (teto 20), os oito dentro de 35–65 nas quatro
  famílias e no retrato. Quem subiu foi quem devia (os três donos de abrigo,
  todos abaixo de 50: chama 49,9 → 54,4 · remendo 48,6 → 54,6 · voto 43,9 →
  **52,0**); quem desceu foi o topo (sombra 58,9 → 54,2 · flecha 54,2 → 49,0).
  **Nenhum pronto foi reajustado em toda a Fase P** — a licença de reajuste
  existia e não precisou ser gasta. Conferido pelo orquestrador em corrida
  própria da suíte, não só pelo relato.
  **Margem fina registrada como fato:** `punho` na família `cc` mede 36,2%, a
  1,2 pt do piso 35. Entrou na suíte como linha declarada, **sem virar
  limiar** — folga convertida em teto seria um segundo teto por cima do 35–65.

- **O EFEITO EM UMA VIDA, EM NÚMERO** (200 combates, sementes `umavida|0..199`,
  Mago+Clérigo+Engenheiro nv5 + herói, teto 20 rodadas; medido **duas vezes**, a
  segunda contra o caminho real do App, com os três portões de
  `buffDeCompanheiro` e o prazo da condição no lugar do padrão):
  - **cenário duro** (4 elites nv9): quedas de companheiro 566 → **563**; rodada
    da 1ª queda 4,41 → **4,64**; PV restante do grupo 675 → **754** de 26400;
    **918 pontos de dano parados em 153 abrigos**.
  - **cenário brando** (3 comuns nv5): 0 quedas nos dois; PV restante 91,7% →
    **93,3%**; **431 pontos parados em 75 abrigos**.
  - **A leitura honesta, e ela é a que vale:** o "+11,7% de PV restante" do
    cenário duro é real mas mede uma base de 2,6% do máximo — o grupo é quase
    varrido nos dois casos. O par que não depende de quão letal é o cenário:
    **918 e 431 pontos de dano que passam a parar no escudo em 200 combates**
    (4,6 e 2,2 por combate), e **91% dos escudos nascidos chegam a morder** (153
    de 168). A primeira medição dizia 954/159; a honesta é 918/153, 4% menor — o
    backend trouxe a correção **contra si mesmo**, e é esta que fica.
  - **E o controle que separa o crédito:** `companheiros.js` de HEAD mais o sítio
    novo do App dá 563 quedas · 754 PV · 918 absorvido · 153 abrigos, **byte a
    byte igual**. Ou seja: **o ganho inteiro de Uma Vida vem da absorção e do
    nascimento; o recorte do piloto contribui zero em Uma Vida** — ele paga na
    arena, onde os abrigos que morderam foram de **83 → 241** e o dano parado de
    **332 → 964**.

- **decisões médias tomadas (com o motivo):**
  - **O nascimento do abrigo no companheiro foi fiado, e o portão que o
    autorizou era um risco nomeado.** `buffDeCompanheiro` (`App.jsx`) **nunca**
    chamava `efeitoDeBuff`: o companheiro escolhia o abrigo, a mesa consumia
    abrigo, e o abrigo **nunca nascia** — o efeito medido em Uma Vida era
    **zero**. O perigo de fiar era o de P2 (a guarda sem relógio virando +4
    permanente), e por isso a mão só passou depois de **enumerar os leitores**:
    `combate.js` não contém a palavra `efeitos` em linha nenhuma;
    `bonusDeDano`/`bonusDeArma` só são chamados com a ficha do herói; `defesaDe`
    não lê `efeitos`. O único leitor vivo é `absorverDano`, que **remove o efeito
    ao gastá-lo**. Não há "+4 permanente" aqui.
  - **Nasceu o irmão no relógio** (`tickEfeitos` sobre `pers.grupo`), porque o
    que faltava era o prazo: sem ele o escudo atravessaria a porta da luta e
    comeria o primeiro golpe da luta seguinte, inclusive depois de carregar o
    save. Mora no tique do herói e **não** em `limparConjuracoesDaLuta`: guarda
    vence por **rodada**, que só existe na luta; efeito vence por **turno**, que
    é toda resposta do Mestre.
  - **Só a cláusula da absorção vai à tela.** Anunciar "+N de dano" no
    companheiro seria anunciar número que ninguém lê — a mesma recusa de P1.
  - **O efeito fica em quem conjurou**, mesmo com `port.alvo === "aliados"` (é o
    que `aplicarBuffDeHabilidade` já faz para o herói). Somar um abrigo por
    companheiro seriam três escudos na mesma pele: é o número sem teto que esta
    escolha evita.
  - **O preço do esforço não gasta o abrigo** (`abriga: false`, por parâmetro
    nomeado e não por adivinhação de string): dano auto-infligido não é golpe
    chegando de fora, não há nada para um escudo encontrar. **A queda gasta** —
    cair é o chão batendo em você.
  - **Uma porta única no App** (`passarPeloAbrigo`) em vez de sete `try/catch`
    soltos: sete catches são sete chances de um nascer diferente.
  - **Os envelopes do Narrador passaram a dizer o que o corpo pagou**, não o que
    a fonte rolou. Com o abrigo mordendo, "já cobrou X · NÃO mude o número"
    viraria ordem para mentir.
  - **O comentário que exagerava foi corrigido, e o achado foi do próprio
    backend contra si.** O degrau "o abrigo de pé não se re-firma" dizia que
    re-firmar "compra ZERO"; `empilhar` casa por nome e portanto **renova o
    prazo**. O comentário passou a dizer as duas metades medidas: perde-se a
    renovação (82 de 278 turnos, 6 PV em 200 combates, 0,02% — ruído) e ganha-se
    o turno que volta a render na arena (golpes com bônus 42 → 75, e 1 pt de
    folga para `punho` em `cc`).

- **O DENTE DA MESA REAL: o proxy envelheceu, e o conserto não foi afrouxar.**
  `teste-arena.mjs` ficou vermelho — `comPeso >= 100` medindo **75** (era 329 em
  A3). A causa é a Fase P funcionando: P1 tirou a defensiva do golpe de propósito
  (329 → 108) e P3 fez o piloto trocar bônus por abrigo. O número **migrou de
  moeda**, e `comPeso` conta só a metade ofensiva.
  **O piso 100 não desceu um dígito.** A parcela virou a **soma** que a frase
  sempre quis medir — `rendeu = comPeso + abrigos` = **316** (75 + 241) contra os
  329 de A3 —, e cada metade ganhou dente próprio com piso **40**, herdado do
  `golpesMinimosDaSonda` que a **mesma tabela** já escolhera (abaixo disso a
  prova passa vazia), em vez de inventar um segundo limiar.
  **Provado por sabotagem, em cópia:** a arena parando de consumir efeito nenhum
  dá **13 falhas**; a metade ofensiva zerada com a defensiva intacta dá **3** — e
  é o caso que decide, porque a soma ficaria **verde** em 244 e quem morde é o
  dente da metade. Sem ele, essa regressão passaria.

- **A LIÇÃO DE R4 APLICADA AO QUE ACABOU DE NASCER.** O nascimento do abrigo no
  companheiro é `const` local do `App.jsx` e portanto **invisível ao
  `teste-ligacao`**: apagar as três linhas deixava a casa inteira verde, o mesmo
  `mexerNaReviravolta()` de novo. A seção 15 mede **definição E sítio de
  chamada**, conta ocorrências (`=== 1`) em vez de perguntar "existe?" — porque o
  comentário logo acima repete os mesmos nomes e foi assim que uma âncora andou —
  e recorta o ramo `aliados` **dentro** de `buffDeCompanheiro`, já que
  `aplicarBuffDeHabilidade` tem um ramo homônimo 500 linhas acima que **tem**
  `efeitos:`. **Quatro sabotagens, quatro vermelhos certeiros:** o nascimento
  apagado (4 falhas), o irmão no relógio removido (3), a recusa de P1 caindo (1),
  o abrigo se espalhando pelo grupo (1). Nenhuma passou, nenhuma gritou por
  engano.
  **Conferido em cópia pelo orquestrador**, de forma independente: a defensiva
  voltando a nascer com força zero — o estado exato de P1/P2 — dá **16 falhas**
  em três arquivos.

- **A FASE P ESTÁ FECHADA. O antes-e-depois inteiro:**
  - *"Absorve o próximo dano"* tirava **0** de dano de qualquer um, em qualquer
    mesa → tira **918** pontos em 200 combates de Uma Vida e **964** na mesa dos
    28 pares da arena.
  - **Escudo Arcano narrava "+2 de dano mágico"** — uma defensiva que somava no
    golpe → narra o abrigo, com o número que ele aguenta. 391 buffs defensivos
    deixaram de somar em P1.
  - **Companheiro e duelista nunca erguiam guarda:** 0 das 9 entradas de
    `GUARDAS` era reconhecida pelo piloto → **9 de 9**, com **0 falsas guardas**
    sobre as 593 habilidades do acervo.
  - **O buff do companheiro em Uma Vida nunca chegava a `comp.efeitos`** —
    nenhuma classificação de P1 o tocava, nem rótulo, nem frase → nasce pelo
    caminho único do herói, com relógio próprio.
  - **Abrigos que morderam na arena: 0 → 241.** Turnos de apoio que compram
    alguma coisa: 329 (só ofensiva) → **316** (75 ofensiva + 241 defensiva).
  - **A catraca de equilíbrio nunca saiu da faixa e apertou:** amplitude 20,0
    (A4) → 15,8 (P1) → 15,8 (P2) → 15,0 → **12,7**. **Nenhum número de pronto
    foi reajustado nas três etapas.**
  - **A prova:** `teste-efeitos.mjs` 168 → 201 → **387**; `check-protecao.mjs`
    nasceu em P1 com 38 e está em **45**; `teste-guardas.mjs` ganhou a seção 6 em
    P2; `teste-arena.mjs` 64 → 69 → 76 → **79**, com o dente da mesa real medindo
    as duas moedas.

- **o que ficou (e por quê):**
  - **As condições do grupo nunca vencem — e isto é anterior à Fase P.** Seis
    sítios escrevem condição em `pers.grupo` e **zero** a decrementam: o
    companheiro que leva veneno fica envenenado **para sempre**, e a condição boa
    do próprio `buffDeCompanheiro` (que `turnoDosCompanheiros` **lê**, via
    `condAtacante`) é vantagem permanente desde a v9.2. O efeito ganhou relógio
    nesta etapa; a condição continua sem. Foi para a pauta, e é o maior dos
    restos.
  - **`turnoDosCompanheiros` não lê `efeitos`**, então o `bonus` de dano do
    companheiro nasce e é inerte. Medido e confirmado com grep: `combate.js` não
    contém a palavra em linha nenhuma. Foi para a pauta — ligá-lo faz número
    crescer sem teto medido, e isso é etapa com catraca própria.
  - **Quatro das cinco famílias de P1 seguem com força zero** (amortece 8 ·
    nao_cai 5 · intocado 18 · protege 8 = 39 habilidades). `amortece` tem molde
    pronto (`amortecerDano` já corta pela metade); `intocado` e `nao_cai` colidem
    com `estaIntocavel` e com o teste de morte. Cada uma é a sua própria etapa.
    Foi para a pauta.
  - **Não há prova de COMPORTAMENTO do nascimento**, só âncora de texto:
    `buffDeCompanheiro` é `const` dentro do componente e não se importa em Node.
    O caminho, se um dia valer, é o backend extrair o miolo para `src/` — aí vira
    export com leitor e o `teste-ligacao` passa a guardá-lo sozinho. Registrado.
  - **O piso `minimo: 2` é inalcançável pelo catálogo** (as 25 da família medem
    4–12): ele guarda a porta de fora — relíquia, poção —, não o acervo.
    Registrado, não é defeito.
  - **A forma "nada chega" nunca disparou** na mesa real (0 de 241): existe no
    código, tem dente se aparecer, e por isso `danoParado` é um **piso** do que
    foi parado, nunca o total.
  - **Dívida pequena, registrada:** os comentários novos do `App.jsx` foram
    escritos **sem acento** (a mão escolheu a segurança contra o vício de
    codificação da casa). O arquivo está íntegro — 0 caracteres de substituição,
    11.293 acentos — mas o estilo destoa dos vizinhos. Não vale um ciclo; vale a
    nota.

## 14/09 00:05 · v9.232 · P2 · o piloto reconhece as nove guardas · commit `bdf94f4`
- **estado inicial:** árvore limpa, HEAD `9bafcd4`, VERSÃO v9.231, `npm test`
  181/181 suítes + 8/8 varredores verde. A vez era **P2**, segunda etapa da
  Fase P — aprovada pela pessoa sabendo que muda Uma Vida **e** o Duelo.
- **conselheiro:** não chamado (a etapa já estava escrita e aprovada).
- **backend:** `ehGuarda` em `companheiros.js` (a pergunta à tabela, com nome);
  o passo 3 do piloto ergue guarda antes de buff; `RX_BUFF` partido em
  `RX_APOIO` + `RX_ABRIGO`; `turnoDosCompanheiros` (`combate.js`) passou a
  carregar `habilidade` e `custo` na ação `guarda`. `arena.js`: zero linhas.
- **frontend:** o ramo `ac.tipo === "guarda"` no turno do grupo (`App.jsx`),
  mais o prazo das guardas do grupo no relógio do herói e o `baixarGuardas`
  do grupo no fim da luta. Os três em `try/catch` com `calou(...)`.
- **testes:** 51 asserções novas — seção 6 de `teste-guardas.mjs` (a catraca
  permanente, tabela `MEDIDA_DO_PILOTO`, sorte travada), 10 em
  `teste-comp.mjs` e a seção 9 de `teste-arena.mjs`. Nenhuma asserção
  existente foi movida.

- **O QUE MUDOU EM UMA FRASE.** `guardaDe(hab)` decidia pela tabela `GUARDAS`
  desde a v9.53 e ninguém perguntava a ela: `decidirAcaoCompanheiro` adivinhava
  por `RX_BUFF`, um regex de nome. **Nenhuma das 9 guardas casava** — companheiro
  e duelista nunca erguiam guarda, e a família defensiva era promessa que só o
  herói de carne cumpria. Hoje o piloto **pergunta**, e enxerga **9 de 9**.

- **A MEDIÇÃO, nos dois sentidos.** Sobre o acervo inteiro de **593**
  habilidades (12 classes + subclasses + especializações + grimório):
  - **9 de 9** entradas de `GUARDAS` são escolhidas pelo piloto quando ele as
    tem na ficha (antes: 0). **0 falsas guardas** — nada que `guardaDe` não
    reconhece vira guarda, e esse zero é lei na suíte.
  - **Deixou de enxergar 4 por engano:** `Dissipar Magia` (o achado de P1 — um
    dispel que narrava "+2 de dano mágico" por conter "barreira"),
    `Tiro Perfurante`, `Punho de Pedra` e `Linha da Lâmina`. `ehBuff` no acervo:
    **37 → 33**.
  - **Onde a mudança pisa de verdade é Uma Vida:** de 60 fichas de companheiro
    (12 classes × 5 níveis), **6 passam a erguer guarda** onde nenhuma erguia —
    Druida nv5/8/12 (Casca de Carvalho) e Engenheiro nv5/8/12 (Elixir de
    Combate). Na arena são **0**: nenhum dos 8 prontos carrega qualquer das 9,
    e isso entrou na suíte como fato declarado com teto 0, não como exigência.

- **decisões médias tomadas (com o motivo):**
  - **`RX_BUFF` sobrevive, encolhido — e é a resposta à pergunta da etapa.**
    Ele tinha dois vocabulários dentro. A metade de ABRIGO (escudo, barreira,
    proteção) **já tem tabela**: quem responde por ela é `aplicacaoDoBuff`
    (`combos.js`), a tabela de P1 com o veto `RX_NAO_E_PROTECAO` dentro — é ele
    que separa "Escudo Arcano" de "Tiro Perfurante". A metade de APOIO (bênção,
    inspiração, grito, canção, hino, postura, fúria) é a única que **nenhuma
    tabela descreve**, e por isso a única que continua sendo palpite. Duas
    tabelas primeiro, regex só para o resto.
  - **A guarda vem antes do buff, com UM sorteio só.** O passo 3 tinha um
    `Math.random() < 0.7`; manter dois portões faria o companheiro gastar mais
    turnos em apoio do que gastava — mudança de ritmo que a etapa não pediu.
    Assim o **número** de turnos de apoio não muda, só **o que** é escolhido.
  - **O piloto pula a guarda que já está de pé** (`guardasAtivas`, leitor que já
    existe). Sem isso, a fiação nova criaria um turno queimado novo:
    `erguerGuarda` recusa a repetida. Isto resolve a METADE da guarda do item
    aberto "o companheiro re-firma o buff que já está de pé" — o item fica na
    pauta com a metade do buff, que continua valendo.
  - **A ação `guarda` passou a carregar a habilidade.** `turnoDosCompanheiros`
    empurrava `{tipo:"guarda"}` e **jogava a habilidade fora**. A ação seca (sem
    inimigo de pé) continua chegando sem ela — é a presença do campo que separa
    as duas, e `arena.js` já dependia disso.
  - **O prazo do grupo mora junto do prazo do herói.** `defesaDe` já soma
    `defesaDeGuarda` em qualquer ficha, então a guarda do companheiro passou a
    valer sozinha contra os inimigos. Sem o irmão no relógio, Casca de Carvalho
    viraria **+4 de defesa permanente** — bug pior que o silêncio que a etapa
    veio fechar. Fim da luta idem.

- **A VOLTA QUE A ETAPA DEU, e o número que ela comprou.** O primeiro desenho
  (meu, não do backend) usava o veto de P1 como **portão solto** sobre `ehBuff`.
  A medição mostrou que ele derrubava **5 buffs honestos** junto — Fúria de
  Batalha, Hino de Guerra, Fúria Sangrenta, Hino da Vitória, Sangue dos
  Antigos —, porque o veto é desambiguador de linguagem de abrigo e só faz
  sentido **dentro** de `aplicacaoDoBuff`. O segundo desenho errou para o outro
  lado: deixar `aplicacaoDoBuff` **ampliar** a lista do piloto, e aí a catraca
  de equilíbrio **estourou** — está medido abaixo. O terceiro é o que ficou:
  `aplicacaoDoBuff` **filtra** o que o regex já via, nunca amplia.

- **A CATRACA DE EQUILÍBRIO: byte-a-byte com a linha de base de P1.** Família
  `rr`: muralha 49,0 · sombra 54,8 · chama 41,4 · remendo 48,6 · voz 51,4 ·
  flecha 61,9 · punho 49,0 · voto 43,8. Retrato de 120: **amplitude 15,8** pts
  (teto 20), todos dentro de 35–65. Mesa real idêntica em cada dígito: 416
  quedas · 5562 linhas · 772 buffs firmados · 108 golpes com bônus · 403 prazos
  vencidos. **Nenhum número de pronto foi reajustado** — a medição de P3 fica
  intacta. O único número que se move na suíte inteira é a sonda sintética da
  guarda: razão **0,699 → 0,739** (teto 0,9), e move pelo motivo certo — a sonda
  usa "Postura de Casca de Carvalho", que agora vira plano `guarda` e deixa de
  ser re-erguida enquanto está de pé.

- **O ACHADO QUE VALE UMA ETAPA: a ponte medida e descartada.** Ligar
  `aplicacaoDoBuff` como AMPLIAÇÃO de `ehBuff` (o piloto passando a reconhecer
  a família defensiva inteira de P1) foi medido e **reprovado pela catraca**:
  - `ehBuff` 37 → **75** (+42 defensivas: Esquiva Ágil, Corpo de Ferro, Pele de
    Pedra, Intervenção, Indomável, Armadura Sombria, Elo Vital…)
  - `sombra` — o topo do retrato, e um dos dois prontos que nunca gastavam turno
    em apoio — ganha "Esquiva Ágil" e despenca de **60,2 para 32,9** (piso 35);
    `[aa]` 34,8; `[cc]` 31,9. Amplitude **15,8 → 25,7** (teto 20). `flecha`, que
    segue sem buff, sobe a 58,6 — o espelho do mesmo fenômeno.
  - buffs firmados 772 → **943**; linhas de abrigo 394 → **544** (+150, **todas
    inertes**); `npm test` 180/181, `teste-arena.mjs` com 4 falhas.
  A causa em uma frase: **a defensiva de P1 nasce com força zero e sem leitor**,
  então o turno gasto nela compra nada — e a catraca mede exatamente isso. Esta
  é a prova, em número, de que o desenho que P1 deixou escrito (a família
  `absorve` virando **guarda de uma batida**, campo `absorve: N` em
  `pers.guardas`, consumido ao ser gasto, reusando `expirarGuardas`) **tem de
  vir ANTES** de o piloto procurar a defensiva. **Não foi feito aqui de
  propósito:** P2 é o reconhecimento, e a proteção de verdade é obra de outra
  etapa. Quem recebe é **P3**, e a pauta foi corrigida para dizer isso.

- **o que ficou (e por quê):**
  - **Dois falsos positivos do `RX_APOIO` sobrevivem, sem regra nova:** `Fúria de
    Gaia` ("Terremoto que atinge todos os inimigos" — casa por "fúria") e
    `Comando: Atacar` ("Sua invocação ataca com fúria redobrada"). Nenhuma tabela
    os descreve e inventar regra para dois casos seria trocar um palpite por
    outro. Foram para a pauta como item leve.
  - **A guarda de pé não aparece em tela nenhuma** — nem a do herói. `guardas` só
    é lido no instante em que sobe e no instante em que cai; no meio o jogador
    não tem onde conferir. Para o companheiro pesa mais, porque ele não tem
    painel de ficha aberto. Foi para a pauta.
  - **O Narrador não sabe da guarda depois do turno em que ela sobe:**
    `resumoGrupoPrompt` não carrega `guardas`. O herói tem o mesmo furo — é
    decisão de família, não bug do grupo. Foi para a pauta.
  - **Três dos nove `conceito` de `GUARDAS` falam em segunda pessoa** ("o que vem
    em **sua** direção"). O frontend ajustou os pronomes da cláusula de efeito na
    linha do companheiro; o conceito vem pronto da tabela e sai meio torto sob o
    nome de outro. Foi para a pauta.
  - **Aviso registrado, sem conserto:** `evoluirCompanheiro` (`App.jsx:8613`)
    preserva `guardas` por spread hoje, mas é um sítio que remonta a ficha do
    companheiro sem saber que ela passou a ter prazo em rodadas.
  - **Margem fina herdada de P1, medida e não tocada:** `m.comPeso` na seção 7 da
    arena está em **108** contra o piso 100, e o comentário inline ainda cita os
    329 da v9.225. A queda é de P1 (a defensiva parou de somar no golpe), não de
    P2 — conferido que a amostra de buffs dos oito prontos é idêntica sob o
    `ehBuff` antigo e o novo. Fica como está até P3 medir.

## 13/09 22:55 · v9.231 · P1 · o Escudo Arcano deixa de dar dano · commit `3dcf61f`
- **estado inicial:** árvore limpa, HEAD `8e536ee`, VERSÃO v9.230, `npm test`
  181/181 suítes + 7/7 varredores verde. A Fase R fechou no ciclo anterior; a
  vez era **P1**, a primeira etapa da Fase P — aprovada pela pessoa sabendo que
  muda o combate de Uma Vida **e** do Duelo.
- **conselheiro:** não chamado (a etapa já estava escrita e aprovada).
- **backend:** a tabela `APLICACAO_DO_BUFF` (5 famílias: absorve, amortece,
  não cai, intocado, protege) + `aplicacaoDoBuff`, `APLICA_FORA_DO_GOLPE` e
  `efeitoNoGolpe`, em `combos.js`. `efeitoDeBuff` consulta a tabela; os
  leitores do dano passam a respeitar o rótulo.
- **frontend:** um sítio só (`App.jsx:7740`): a nota do Narrador para de
  farejar a palavra "físico" dentro da frase e pergunta a `efeitoNoGolpe`.
- **testes:** varredor novo `check-protecao.mjs` (38 asserções, 7→8
  varredores), seção 8 nova em `teste-arena.mjs` (64→69) e seção 9 nova em
  `teste-efeitos.mjs` (168→201). **Nenhuma asserção existente foi invertida.**

- **O ACHADO QUE MUDOU O TAMANHO DA ETAPA.** A pauta descrevia P1 como
  correção de rótulo e de frase. Não era: **`bonusDeDano` e `bonusDeArma`
  (`combos.js`) nunca leram `aplica`** — filtram só por escopo. Trocar o
  rótulo sozinho não mudaria número nenhum: a frase ficaria honesta e o golpe
  continuaria somando, e a casa acharia que tinha consertado. Por isso a
  correção tem duas metades, e a segunda (ensinar os leitores do dano a
  respeitar o que o efeito declara) é a que faz o número mudar.

- **O SEGUNDO ACHADO, na própria prova.** O diff do backend **não deixou
  nenhuma asserção vermelha** — e isso era o diagnóstico, não o alívio: a
  suíte nunca cravou o que uma defensiva faz. `teste-efeitos.mjs:297` e
  `:301-307` usavam só habilidades ofensivas, e a sonda da arena usava uma
  defensiva inventada ("Postura de Ferro") que não promete proteção nenhuma.
  O comportamento errado sobreviveu porque **nenhuma prova o media**. Daí a
  suíte ter *acrescentado* catraca em vez de inverter asserção.

- **decisões médias tomadas (com o motivo):**
  - **A tabela mora em `combos.js`, não em `efeitos.js`.** `efeitos.js` já
    importa `combos.js` (`naturezaDaHabilidade`); a volta criaria o ciclo que
    a casa evita. A seta continua num sentido só: efeitos → combos → classes.
  - **O campo `tipo` do catálogo não é a espinha da classificação.** Ele erra
    nos dois sentidos ("Segundo Fôlego" é `defesa` e é cura; "Postura de
    Vigília" é `defesa` e dá um golpe de graça) e **falta** em relíquia,
    poção, grimório e no que o piloto da arena escolhe. Classifica-se pelo
    TEXTO, que é o que o jogador lê.
  - **Lista de exceção, não de permissão.** Só o que está em
    `APLICA_FORA_DO_GOLPE` deixa de somar. Uma lista de permissão emudeceria
    save antigo (sem `aplica`), milagre (`todos`) e canal do Mestre — provado
    que os três continuam somando os mesmos números.
  - **Um veto antes da tabela (`RX_NAO_E_PROTECAO`).** "Escudo" aparece dos
    dois lados da briga: sem o veto, "Tiro Perfurante", "Punho de Pedra",
    "Linha da Lâmina" e "Marcha Sem Recuo" perderiam o golpe que a ficha
    promete. Varredura final: **0 habilidades de `tipo: "ataque"` viraram
    proteção** — e esse 0 virou dente.
  - **A defensiva nasce com força zero, e a frase perde o número junto.**
    Gravar uma força que ninguém lê seria trocar uma mentira por outra mais
    quieta; anunciar "+N" de um número que não existe, idem. Mesmo motivo
    pelo qual `EFEITO_DA_MAGIA` nasce com `bonus: 0`: vale pelo estado.

- **A REGRESSÃO, MEDIDA E NÃO PROMETIDA.** O "antes" não saiu da memória: a
  catraca foi rodada contra uma árvore mutante que **reproduziu o retrato de
  A4 exato**, então a diferença é toda de P1.
  - **O que deixou de somar:** 391 buffs defensivos firmados na amostra da
    arena (262 Postura Defensiva + 129 Escudo Arcano). Golpes com o bônus
    dentro **329 → 108 (−67%)**; buffs firmados 791 → 772.
  - **A catraca de equilíbrio ficou dentro da faixa em tudo.** Família `rr`:
    muralha 50,5→49,0 · sombra 54,3→54,8 · chama 42,4→41,4 · remendo
    48,1→48,6 · voz 51,0→51,4 · flecha 61,9→61,9 · punho 50,0→49,0 · voto
    41,9→43,8. Retrato de 120: **amplitude 15,7 → 15,8 pts**, contra teto 20.
    Nada saiu de 35–65%. **Nenhum número de pronto foi reajustado** — isso é
    P3, e a medição dele fica intacta. O que se mexeu é interno ao retrato:
    muralha −3,1, punho −2,8, remendo +3,2, e a ordem do topo trocou.

- **o que ficou (e por quê):**
  - **A defensiva ainda não protege ninguém.** P1 parou na classificação e na
    narração honesta, de propósito. O desenho investigado, para P2/P3:
    `reacoes.js:40` (`escudo_arcano`, gatilho `sofre_dano`) **já é o dono
    legítimo** de "absorve o próximo dano", mas é permanente por ter a
    habilidade, não armado por usá-la. Rotear para ele exigiria
    `escolherReacao` passar a ler `pers.efeitos` (muda combate em campanha
    viva); a alternativa, ensinar `defesaDe` a somar efeito, colide com
    `defesaDeGuarda`, que já faz isso com prazo por rodada. **O desenho que o
    backend faria:** a família `absorve` vira guarda de UMA batida — campo
    `absorve: N` na lista `pers.guardas`, consumido e apagado ao ser gasto,
    reusando `expirarGuardas`. Não foi escrito; é achado para P2/P3.
  - **O acervo real é 593 habilidades, não 508.** A varredura do teste
    alcançou 85 magias do grimório que ninguém tinha contado, e nelas duas
    proteções que **só existem lá**: `Proteção contra Energia` e `Globo de
    Invulnerabilidade`. As cinco do grimório classificam certo.
  - **As ambíguas (classificadas pelo texto, não por palpite):** *Postura de
    Vigília* ficou **dano** (o texto promete "um golpe de graça", embora seja
    `tipo: defesa`) · *Muralha de Gelo* e *Muralha de Espinhos* ficaram
    **proteção**, mas as duas também ferem · *Muralha Erguida* e *Muralha de
    Pedra* ficaram **dano** (terreno puro; "muralha" ficou FORA da tabela de
    propósito, senão "Muralha de Fogo" virava defensiva) · *Escudo do Aliado
    Caído* ficou **proteção** (é resgate, não barreira) · *Bênção do Bosque*
    ficou **proteção** por "resiste a", embora "Bênção" seja universal por
    direito em `UNIVERSAIS` · *Manto Flamejante* e *Esfera Prismática* ficaram
    **dano** (auras ofensivas com nome de abrigo) · *Contramágica* ficou
    **dano** (não é absorção, e a reação `contramagia` já é a dona).
  - **Bug vizinho, não consertado porque é P2:** `Dissipar Magia` casa com
    `RX_BUFF` (`companheiros.js:89`) por conter "barreira" e chega a
    `efeitoDeBuff` — um dispel narrando "+2 de dano mágico". O veto o mantém
    em `dano`; o conserto é no vocabulário do piloto, que é exatamente P2.
  - **Aspereza herdada, registrada e não tocada:** `res.cond.efeito` já vem
    com ponto final de `aflicoes.js`, então a linha sai "+2 de defesa. · o
    próximo golpe encontra…". Era assim antes também.

## 13/09 21:30 · v9.230 · R4 · a suíte da fase, e a Fase R fechada · commit `a1e5ba6`
- **estado inicial:** árvore limpa, HEAD `dde2c45`, VERSÃO v9.229, `npm test`
  181/181 suítes + 7/7 varredores verde. A vez era **R4**, a última etapa da
  Fase R — e ela nascia **credora**: o orquestrador já tinha corrigido a pauta
  depois de R3 dizendo que as quatro provas pedidas provavelmente já existiam.
  Por isso o ciclo **começou por uma conferência**, não por escrever.
- **conselheiro:** não chamado (pauta cheia, e a etapa já estava escrita).
- **testes (a conferência, primeiro):** leu a suíte inteira contra o que R2 e
  R3 alegam, e o veredito confirmou a suspeita — **as quatro provas da pauta
  já estavam feitas e nenhuma foi reescrita**: eleição determinística por
  semente (seções 2 e 9i, 300 mundos, as 7 formas alcançáveis), forma→detector
  (seção 8 e 8b–8g), a ordem menor→maior (seção 9d, exaustivo de 560
  combinações), e o Narrador só na revelação (seção 9k). **R4 não repetiu
  nada disso.** A catraca forma→detector de R2 também foi conferida por
  sabotagem e **morde**: forma sem `achaAlvo` → 6 falhas; sem linha em
  `MUNDOS_DE_PROVA` → 5; detector quebrado → 10.
- **testes (a escrita):** cinco dentes novos, **290 → 332 asserções**, tudo em
  `teste-reviravolta.mjs`. **Nada em `src/` mudou** — nenhum dente ficou
  vermelho por culpa do código.

- **O ACHADO DA ETAPA, e a razão de ela existir.** A conferência sabotou o
  `App.jsx` em cópia e encontrou o defeito que esta casa inteira existe para
  caçar, um andar acima do normal — **na própria prova**:
  - **apagar a ÚNICA chamada de `mexerNaReviravolta()` (`App.jsx:10251`)
    deixava `npm test` inteiro VERDE** — 181/181 suítes, 7/7 varredores. R1,
    R2 e R3 podiam sair do jogo em silêncio, e três etapas de trabalho viravam
    acervo sem que nada mordesse.
  - `if (maiorPodeNascer(...) && false)` — idem, **verde**.
  - O motivo é estrutural, e vale para além das reviravoltas: **toda âncora de
    "ligado ao jogo" media a DEFINIÇÃO** (`/mexerNaReviravolta/`), nunca o
    sítio de chamada; e `mexerNaReviravolta` é const local do App, não export,
    logo **invisível ao `teste-ligacao`**. "Escrito e nunca acontece" é
    exatamente o defeito que a Fase R gastou três etapas curando.

- **os cinco dentes, na ordem do estrago que deixavam passar:**
  1. **a chamada, e não a definição.** Exige `mexerNaReviravolta()` como
     *instrução*, **uma vez por turno**, na ordem entre `dispararPropositos` e
     `colherAsFalas`. Lê a **condição inteira do `if`** fechando parênteses por
     contagem — é isso que mata o `&& false`, que uma regex perdoaria por pegar
     só o prefixo.
  2. **o ciclo com dias que passam.** A fase vista de fora, que a pauta pediu e
     nunca teve prova: a condição de `cuidarDasSementes`
     (`dia - regadaEm >= diasEntreRegasDe`) **roda pela primeira vez em teste**,
     contra o `promessas.js` real — menor madura em 9, maior em 18, folga de 3
     no meio, nenhuma caindo duas vezes.
  3. **as duas pontas se encontram.** `elegerReviravoltas` nunca recebia um
     mundo e `MUNDOS_DE_PROVA` nunca entrava num ciclo.
  4. **o bilhete do `fecharAto`** — a asserção que falha no dia em que ele
     ganhar chamador em `src/`, com o vínculo e as duas saídas no comentário.
  5. **todo `porte` ∈ `PORTES`** — uma oitava forma com `porte: "medio"`
     passava pela catraca de 4 menores / 3 maiores e virava acervo inerte.

- **decisões médias tomadas:**
  - **a ordem do turno é medida por ÍNDICE no texto normalizado, não por
    vizinhança de linha.** Motivo: âncora que exige as três chamadas coladas
    fica vermelha no dia em que um órgão novo nascer entre elas — seria uma
    catraca que pune crescimento legítimo. Por índice, ela guarda só o que
    importa (a virada depois dos propósitos, antes das bocas).
  - **exigir UMA chamada, e não `>= 1`.** Motivo: duas chamadas por turno
    dobrariam o ritmo de `RITMO_DAS_VIRADAS` — as sementes regariam duas vezes
    por dia — e **nenhuma asserção de ritmo acusaria**, porque todas medem a
    tabela, não a frequência de uso.
  - **o laço de dias é declarado como RÉPLICA da condição do App**, com a lista
    do que copia e o aviso escrito. Motivo: é a honestidade do dente — ele não
    roda o `App.jsx`, roda uma cópia da regra, e no dia em que
    `cuidarDasSementes` mudar a réplica tem de ser revista junto. Fingir que é
    o App seria a mentira que a etapa veio caçar.
  - **os números de R4 saem todos de `RITMO_DAS_VIRADAS` e de
    `sementes.length`**, nenhum cravado na suíte — lei "se é número, é tabela",
    e é o que impede a prova de concordar consigo mesma em vez de com o código.

- **a catraca morde (conferido pelo orquestrador em cópia, não prometido pelo
  agente):** o mesmo rascunho de sabotagem rodado de novo contra o arquivo
  final, com o projeto intocado —

  | sabotagem | antes (290) | depois (332) |
  |---|---|---|
  | apagar `mexerNaReviravolta();` | **VERDE 290·0** | **VERMELHA 328·4** |
  | `maiorPodeNascer(...) && false` | **VERDE 290·0** | **VERMELHA 331·1** |
  | oitava forma sem linha em `MUNDOS_DE_PROVA` | 6 falhas | **16 falhas** |
  | oitava forma com `porte: "medio"` | passava na catraca do porte | **13 falhas** |

- **A FASE R, FECHADA — o antes e o depois inteiro** (conferido contra o
  código de `9d2902f`, não contra o diário):
  - **antes de R1, 5 das 7 formas eram inertes.** O detector morava no
    `App.jsx` e cobria **2 formas** (`aliado_agente`, `heranca_roubada`); o
    resto era `return null`, e o comentário de lá dizia isso com todas as
    letras. As **3 maiores** somavam dois motivos — sem detector *e* sem
    ninguém lendo `.maior`. Como a eleição distribui uniforme entre as 4
    menores, **metade das campanhas nascia com a menor muda, e 100% delas sem
    maior nenhuma.**
  - **depois de R3:** `achaAlvo` nas **7/7**, e a catraca de R2 impede a oitava
    nascer sem um. As três maiores acontecem, com ritmo próprio (rega a cada 6,
    amadurece em 18, contra os 12 do episódio mais longo) e a ordem
    menor→maior garantida por estrutura (`quemPodeRevelar` devolve **um** nome).
  - **depois de R4:** o número que sobrava — **1 sítio de produção podia sumir
    sem que a casa notasse** — virou **0**. Apagar a chamada agora derruba a
    suíte da casa (`180/181 · FALHARAM: teste-reviravolta.mjs`).
  - **a suíte da fase: 41 → 131 (R2) → 290 (R3) → 332 (R4).** Quatro etapas,
    quatro versões, zero regressão na menor.
  - e o que nasceu no caminho: o sexto tipo de laço e as três pontes de R1
    (`familia`, `oficioDoAntecedente`, o razão do informante), `achaAlvo` +
    `garantirMundo` + `alvoDaForma` e as tabelas `LIMIARES_DA_VIRADA` /
    `PAPEIS_DO_MESTRE` (R2), `RITMO_DAS_VIRADAS` + `quemPodeRevelar` + a tranca
    do alvo dividido (R3), e `teste-antecedentes.mjs` inteiro (R1).

- **o que ficou:**
  - **um achado novo para a pauta, visto durante a sabotagem:** uma forma com
    semente que não existe no Livro faz a **seção 1b estourar** (exceção, não
    falha) — e suíte que morre de exceção **esconde os outros 300 dentes
    justamente no dia em que eles têm o que dizer. É herdado do G7**, não de
    R4, e vale para qualquer suíte da casa. Entra em "Aberto" como `leve`.
  - **o item mais valioso de "Aberto" NÃO foi feito e continua lá:** a
    **varredura de `Math.random` nas provas**. O orquestrador mediu de
    passagem: **14 suítes citam `Math.random` diretamente**, e o vício pior nem
    aparece nesse grep — `teste-sala.mjs` cai no `Math.random` **por omissão**,
    deixando o parâmetro `rnd` no padrão. Numa casa cuja lei é "determinismo
    por semente", é o defeito mais grave que pode haver numa prova.
  - **um tropeço de processo, dito porque custou tempo:** o orquestrador
    encerrou um turno esperando a notificação de uma mão, e a mão morreu ali —
    **o mesmo erro do primeiro ciclo**, e o roteiro já avisa. Pior: a mão
    ressuscitou depois e escreveu a etapa **em paralelo** com a segunda, e por
    um momento o arquivo teve dois blocos R4. O segundo agente mesclou os dois
    ficando com a metade mais forte de cada, e **o arquivo commitado tem uma
    série só** (conferido: as seções `10`–`10e` aparecem uma vez na saída).
  - os **dois itens pesados** da Fase A continuam esperando a pessoa (a
    concentração inerte e a família defensiva), e **nenhuma fase aprovada
    sobrou**: com a R fechada, a lista "Aprovado pela pessoa" está vazia. O
    próximo ciclo pega de "Aberto".

## 13/09 22:05 · v9.229 · R3 · a maior enfim acontece · commit `e50eb43`
- **estado inicial:** árvore limpa, HEAD `c0f026b`, VERSÃO v9.228, `npm test`
  181/181 verde. A etapa aprovada da vez era a **R3**, já encolhida por R2 para
  só consumo: as três formas **maiores** (`contratante_servia`, `cidade_dizimo`,
  `mestre_treinou`) tinham detector desde R2 e seguiam inertes porque
  `mexerNaReviravolta` lia só `.menor`. Metade da prateleira era acervo escrito
  e nunca vivido.
- **conselheiro:** não chamado (a etapa já estava escrita, e a pauta cheia).
- **backend:** `reviravoltas.js` ganhou a tabela `RITMO_DAS_VIRADAS`,
  `diasEntreRegasDe(forma)`, `quemPodeRevelar({menor, maior, livro,
  episodioAberto, dia})`, `maiorPodeNascer` + `menorPodeNascer` e o campo
  `reveladaEm` em `garantirReviravolta`. `DIAS_ENTRE_REGAS` deixou de ser um `3`
  cravado e passou a **ler a tabela**.
- **frontend:** `App.jsx` — `reviravoltaMaiorRef` (declaração, save `:7346`,
  load `:10975`, reset `:9744`), e `mexerNaReviravolta` quebrado em
  `cuidarDasSementes` + `revelarAVirada` + o árbitro. O "um gesto por turno"
  saiu de três `return` no meio do corpo e virou valor de retorno, visível em
  quem chama. `TRAICAO` intocado, zero na tela, nada somado ao prompt.
- **testes:** `teste-reviravolta.mjs` de **131 para 290 asserções** (+159), em
  nove seções novas — incluindo um exaustivo de **560 combinações** de estado
  para a lei da cena única, e o cenário de ponta a ponta do alvo dividido nos
  dois mundos (com e sem a tranca).

- **como a maior se distingue da menor, e por quê** (a decisão de ritmo que a
  pessoa pediu que fosse escrita):
  - **rega a cada 6 dias, contra os 3 da menor.** O número não é "o dobro
    porque soa maior": 3 sementes × 6 = **18 dias** de amadurecimento, e o
    episódio mais longo do catálogo (4 marcos × `DIAS_ENTRE_MARCOS`) vive
    **12**. Como a lei 4 **adia** a maior enquanto houver episódio aberto, um
    adiamento que durasse mais que a espera seria cancelamento disfarçado. A
    menor fica nos 3 porque 3 é o compasso do episódio: ela amadurece em 9
    dias, a vida de um episódio.
  - **folga de 3 dias entre uma queda e a outra** — um marco de episódio de
    digestão. O mundo vive uma batida inteira do `oDiaSeguinte` da primeira
    antes de a segunda poder cair.
  - **a ordem é menor → maior**, e ela é a virada da campanha, não um evento a
    mais: não cai por cima de uma menor em curso nem de um episódio aberto.

- **decisões médias tomadas:**
  - **`quemPodeRevelar` devolve UM nome, e não dois booleanos.** "As duas não
    estouram na mesma cena" vira **estrutural**: não existe resposta em que as
    duas caibam, e o App não pode errar mesmo querendo. O `livro` entra dentro
    da função pelo mesmo motivo — se a maturidade viesse de fora, o App podia
    ouvir `"maior"` e só depois descobrir que ela não estava madura, e a menor,
    que estava, perderia o turno em silêncio.
  - **a maior tem escape de prazo; a menor não.** Sem escape, a maior ficaria
    trancada **para sempre** em toda campanha cujo detector da menor nunca acha
    alvo (o herói que anda sem grupo, a bolsa sem item de origem vaga) — seria
    reescrever, um andar acima, o bug que R3 veio desfazer. Então: enquanto a
    menor não nasceu, o campo é dela por `diasDeEsperaPelaMenor` = **9** (o
    amadurecimento inteiro dela: se em todo esse tempo o mundo não deu alvo
    vivo, não vai dar); depois disso a maior nasce sozinha.
  - **episódio aberto adia só a maior; a menor continua caindo com episódio
    aberto.** Blocar a menor seria regressão em campanha viva — dias de jogo
    tirados de quem já estava jogando, e ninguém veria, porque a virada
    simplesmente demoraria mais. Está guardado por asserção, com o motivo
    escrito no comentário.
  - **fora do que a etapa pedia: a tranca do alvo dividido, nas duas pontas.**
    `elegerReviravoltas` garante formas diferentes, **não alvos diferentes** — e
    o companheiro traidor (`aliado_agente`) pode ser também quem encomendou a
    primeira missão (`contratante_servia`). O filtro do Livro é `dona`+`alvo`:
    as sementes das duas se somariam, uma pagaria a catraca da outra ("pesado"
    pago com dinheiro alheio, dois dias antes do devido) e a outra ficaria
    **trancada para sempre** — o defeito de R2 com roupa nova. Entrou no
    escopo porque *é* a lei de convivência da etapa, não um órgão novo.
    **Quem cede é a menor, e o motivo é físico, não de culpa:** ceder é
    devolver o alvo, e a maior não consegue — no turno em que nasce ela já
    plantou, e as três sementes estão no Livro com aquele nome; uma maior que
    "cedesse" sairia deixando exatamente a herança que causou o problema.
    A menor, que ainda não plantou nada, cede de graça — e não fica refém,
    porque não há prazo: o detector dela roda de novo no turno seguinte, e o
    alvo vem do mundo, não do contrato. A assimetria está na assinatura
    (`maiorPodeNascer` tem `dia`, `menorPodeNascer` não), e há asserção que
    acusa o dia em que alguém acrescentar um prazo ali.
  - **a tranca vale com a maior já revelada.** Ao revelar, o App paga só as
    sementes **maduras**; as imaturas ficam no Livro com aquele alvo, e a rega
    da menor (`dona`+`alvo`+imatura) regaria as sobras da maior como se fossem
    dela. O alvo da maior é dela antes e depois de a máscara cair.

- **o que muda num save antigo** (o cuidado que a pessoa pediu): ele não tem o
  campo `reviravoltaMaior` — lê `null`, e a maior **passa a poder nascer** dali
  em diante. Simulado em seis cenários, 60 dias cada, contra o módulo de
  verdade: com a **menor em curso e não revelada**, ela cai no dia 11 exatamente
  como cairia sem a maior existir, e a maior só se apresenta depois; com
  **episódio aberto até o dia 30**, a menor cai no 11 igual e a maior adia para
  o 31; com a **menor já revelada e `reveladaEm: 0`** (o campo não existia), a
  folga já está vencida e ninguém é punido por ter revelado antes de o campo
  nascer. Nenhum caminho em que a maior atropele. E o caso que era morto — a
  menor que nunca acha alvo — agora tem história: a maior nasce no dia 9.
- **o Narrador:** nada de bloco novo no prompt. As duas catracas de teto
  continuam de pé e conferidas: `teste-prompt.mjs` mede a pior cena real em
  **81 935** chars (limite 82 000) e `teste-geografo.mjs` corta a pauta em
  **1 265** (`TETO_DA_PAUTA` 1 400). R3 não moveu nenhum dos dois. A verdade
  eleita só sai por `revelarAVirada`, num bloco só, e o `motivo` do árbitro
  nunca chega à tela — provado por regex sobre o `App.jsx`.
- **uma âncora de teste movida, com motivo:** `/podeRevelar\(rev\.forma/`
  deixou de existir — o App agora faz **uma** pergunta em vez de uma por
  virada. Exigir a âncora antiga de volta seria exigir de volta o turno em que
  as duas podem estourar juntas. Ficaram duas asserções no lugar (o ciclo segue
  genérico por forma; a revelação sai de uma pergunta só) e uma negativa para a
  antiga não voltar sorrateiramente.
- **o que ficou:**
  - **o `teste-ligacao` conta menção em comentário como leitor.** Os três
    agentes esbarraram nisso de forma independente nesta etapa
    (`maiorPodeNascer` e `menorPodeNascer` passavam por falso positivo). A suíte
    de R3 se defendeu sozinha exigindo **chamada de verdade** (`if
    (menorPodeNascer(` e até o ref certo dentro dela — trocar os refs passaria
    em qualquer teste de comportamento e desligaria as duas trancas em
    silêncio), mas o varredor da casa continua com o buraco. **Vai para a
    pauta.**
  - **`fecharAto` de `promessas.js` não tem chamador em lugar nenhum** — e se
    ganhar um, ele murcha as sementes não pagas de um ato: uma menor com as
    sementes murchas nunca mais amadurece, e trancaria a maior sem prazo (o
    ramo ② de `quemPodeRevelar` não tem escape temporal). Não é alcançável
    hoje; fica escrito para o dia em que for ligado. **Vai para a pauta.**
  - **R4** (a suíte da fase) é a próxima etapa aprovada — e nasce credora: R3
    já provou eleição determinística, detector por forma, a ordem menor→maior e
    o Narrador só sabendo no turno da revelação. R4 deve conferir o que sobrou,
    não repetir.

---

## 13/09 20:10 · v9.228 · R2 · toda forma eleita tem detector · commit `b0b561b`
- **estado inicial:** árvore limpa, HEAD `5a7731d`, VERSÃO v9.227. A etapa
  aprovada da vez era a **R2**, e ela nasceu credora: R1 cavou três sinais e
  não gastou nenhum. `alvoDaReviravolta` (`App.jsx:9891`) sabia achar alvo para
  **duas** das sete formas de `reviravoltas.js`; as outras cinco eram eleitas
  pela semente e mudas para sempre.
- **conselheiro:** não chamado (a etapa já estava escrita, e a pauta cheia).
- **a decisão de arquitetura, e o porquê.** A pauta deixou a escolha em aberto:
  o mapa forma→detector desce para módulo puro, ou a prova lê o `App.jsx` como
  texto? **Desceu para módulo puro** — e foi morar **na própria forma**, como
  campo `achaAlvo(mundo)` ao lado do `soNasceSe`. Dois motivos. (1) "Conta se
  prova": decidir quem é o alvo é regra, e regra que mora na tela é regra que
  não se prova — era a lei sendo burlada no lugar exato onde ela importa.
  (2) A catraca fica **estrutural, não vigilante**: provar por texto do
  `App.jsx` pega a forma que ninguém ligou, mas não impede ninguém de escrever
  um detector que nunca acha nada; com o detector dentro da forma, `for (const
  f of FORMAS)` já é a varredura, e não há como acrescentar forma sem passar
  por ela. O `App.jsx` ficou com o que é dele: junta os refs e pergunta.
- **backend:** `reviravoltas.js` ganhou `garantirMundo(m)` (o snapshot que
  nasce do nada e do lixo), `alvoDaForma(forma, mundo)` (a fachada, com o
  `try/catch` dentro) e **`achaAlvo` nas sete formas** — os dois antigos
  portados do App sem mudar de comportamento, os cinco novos escritos sobre o
  que R1 deixou. Desempate explícito e comentado em todo lugar onde a ordem de
  inserção decidiria.
- **frontend:** `App.jsx:9894-9909` — o miolo virou montagem de snapshot +
  `alvoDaForma`. Os dois `find` (a índole do grupo, a classe do item) foram
  apagados, não copiados. `classeDoItem` saiu do import (ficou sem uso no App;
  segue com ≥2 leitores fora dele). Zero na tela, nenhum campo novo de save,
  `mexerNaReviravolta` intocado.
- **testes:** `teste-reviravolta.mjs` de 41 para **131 asserções** (+90), em
  seis seções novas.
- **decisões médias tomadas:**
  - **as três formas MAIORES também ganharam detector**, fora do que a pauta
    escreveu para R2. Motivo: a catraca desta etapa é *"para **cada** forma
    existe detector"*, e uma catraca que nasce com três exceções não é catraca
    — seria afrouxar a asserção para caber no código, que é justamente o que o
    roteiro proíbe. Não é roubo de R3: elas seguem **inertes no jogo**, porque
    `mexerNaReviravolta` só lê `.menor`, e o trabalho de R3 (ligar a maior, com
    a regra de convivência) continua inteiro. Zero mudança no que o jogador
    vive hoje.
  - **`LIMIARES_DA_VIRADA`** (tabela nomeada): o `3` do informante estava
    cravado no `soNasceSe` e ia ser copiado para o detector. Duas metades do
    mesmo portão que podem discordar é bug esperando data. A tabela é a lei
    "se é número, é tabela", e uma asserção varre de 0 a limiar+2 provando que
    as duas metades nunca divergem.
  - **`PAPEIS_DO_MESTRE`** (tabela nomeada), achado do backend: `mesmoPapel`
    **não servia** para `mestre_treinou`. O ofício vem como "a forja" e o papel
    como "ferreiro" — nunca compartilham palavra; e pior, `mesmoPapel` devolve
    `true` quando um lado não tem palavra informativa, o que daria o mestre do
    herói a qualquer figurante de papel vazio. A tabela é a ponte ofício→papel.
- **a correção que a etapa revelou (e a pauta estava errada).** A pauta dizia,
  para `trai_para_proteger`: *"o parente achado é o refém, ou seja o alvo"*.
  **Não é.** O `oDiaSeguinte` da própria forma escreve *"o vilão revela o refém
  que forçava a mão de {alvo}"* e *"o vínculo com {alvo} decide se ele fica ou
  parte"*; e o `App.jsx:9958` põe `registrarGesto(..., gesto: "delatou")`
  contra `rev.alvo`. O alvo é **o companheiro que traiu**; o parente é o refém.
  Seguir a pauta ao pé da letra teria posto o refém como delator na Fúria. A
  asserção que trava esse sentido tem o motivo escrito ao lado.
- **a catraca, e como ela quebra.** Três dentes, e eles mordem dos dois lados:
  toda forma tem `achaAlvo` (*"sem detector: espelho_que_mente"*); toda forma
  tem linha em `MUNDOS_DE_PROVA` provando que o detector **acha alguém de
  verdade** (*"sem mundo de prova: espelho_que_mente"*); e toda linha da tabela
  é de uma forma que existe (*"linha órfã: forma_apagada"*), senão a tabela
  apodrece. Mais o avesso, que pesa igual: nos seis mundos vazios e de lixo as
  **sete** devolvem `null` — detector que acha alvo no nada é pior que detector
  nenhum. Uma forma nova amanhã, sem detector, quebra no dia em que nascer.
- **o que acontece com um save antigo.** Um save que já elegeu
  `trai_para_proteger` vivia com o detector devolvendo `null` — ou seja, **nunca
  guardou reviravolta nenhuma** (`mexerNaReviravolta` só grava depois de achar
  alvo). Agora o detector acha, e a virada **elege hoje**, com `eleitaEm` no dia
  corrente. As leis seguem de pé, e conferi uma a uma: ela **semeia no Livro de
  Promessas antes de qualquer coisa** (o passo 2 do `mexerNaReviravolta` faz
  `return` depois de semear), rega no ritmo de `DIAS_ENTRE_REGAS`, e só revela
  quando `podeRevelar` deixa (as sementes maduras para o peso da colheita).
  **Nada retroage e nada estoura na cara do jogador**; o Narrador continua sem
  ver a verdade eleita antes do turno da revelação, porque nenhum bloco novo
  entra na pauta — o alvo só vive dentro do Livro, com `material: null`.
- **a dívida de R1, paga:** `vezesQueUsouInformante` ganhou o leitor de
  produção que faltava — `reviravoltas.js` agora **chama a função**, e não só
  cita o nome dela como propriedade, que era o que o `teste-ligacao` não sabia
  distinguir.
- **o que ficou:**
  - **um vermelho intermitente em `teste-sala.mjs`**, visto **uma vez**
    (`122 passaram, 1 falharam`) e **não reproduzido em quatro rodadas
    seguintes** do `npm test` inteiro, nem rodando a suíte sozinha (123/0).
    Território que R2 não tocou. Procurei a causa: o runner é **sequencial**
    (`spawnSync` em laço), então não é cross-talk entre suítes; `sala.js` não
    tem `Date.now` nem `setTimeout`; a suspeita que sobra é sorte não semeada
    (`novoCodigo`/`criarSala` caem em `Math.random` quando ninguém injeta
    `rnd`). Não fechei o diagnóstico e **não vou fingir que fechei** — foi para
    a pauta como item aberto, com a evidência.
  - **`trai_para_proteger` não exige vilão** (achado do `testes`): nem no
    `soNasceSe` nem no `achaAlvo` — as duas metades concordam, que é a lei
    desta etapa, então ficou verde. Mas o `oDiaSeguinte` dela escreve *"o vilão
    revela o refém"*, e sem nêmesis de pé não há quem revele nem quem segure o
    refém. É incoerência de texto contra portão, não bug de detector. Foi para
    a pauta.
  - **R3 não foi tocada.** Uma etapa por ciclo.

## 13/09 19:40 · v9.227 · R1 · os três sinais que o mundo não sabia dar · commit `9d2902f`
- **estado inicial:** 180/180 suítes verdes, 7/7 varredores limpos, árvore
  limpa, HEAD `c9813f9`. A Fase A fechada; a vez era a **primeira etapa da
  Fase R**, aprovada pela pessoa. Sete formas em `reviravoltas.js`, e três
  delas com `soNasceSe` lendo sinal que **não existe no mundo**:
  `temCompanheiroComFamilia`, `vezesQueUsouInformante >= 3`,
  `antecedenteComOficio`.
- **conselheiro:** não chamado (pauta cheia, e a etapa já estava escrita).
- **a palavra da pessoa virou desenho.** *"Que o sistema de reviravoltas
  funcione em harmonia com todos os sistemas"* — e é ela que decide **onde**
  cada sinal nasce. Não um módulo `trackers.js` com os três juntos (que seria
  o órgão à parte, e o contrário do pedido): cada um **dentro do sistema que
  já o tocava**. O orquestrador mapeou o terreno antes de delegar; o dono de
  cada sinal foi achado no código, não escolhido por conveniência.
- **backend (os módulos puros):**
  - **o sangue → `npcs.js`**, porque o laço é de npcs. `TIPOS_DE_LACO` ganha
    o sexto tipo `familia`. As seis funções da máquina de laço (`garantirLaco`,
    `firmarLaco`, `romperLaco`, `comLaco`, `firmarEntre`, `paresEntre`) já
    operam por catálogo — nenhuma foi tocada.
  - **o ofício → `antecedentes.js`**, o catálogo que já diz de onde a pessoa
    veio. Campo **opcional** `oficio` em 8 das 12 entradas + `oficioDoAntecedente`.
  - **o informante → `social.js` + `npcs.js`.** O informante já vivia no
    `social.js`: é ele que sabe o tamanho do pedido (a escada `cortesia` /
    `conversa` = informação) e o papel de quem está na frente. Lá ficou o
    **julgamento** (`PAPEIS_DE_INFORMANTE`, `ehInformante`,
    `PEDIDOS_QUE_SAO_CONSULTA`, `consultouInformante`); no registro de pessoas
    ficou o **razão** (`registrarConsulta`, `vezesQueUsouInformante`), que já
    atravessa o save inteiro.
- **frontend (a fiação):** `App.jsx:14410-14428`, dentro do bloco
  `if (des && des.social)`, depois do envelope / do ouro / da alavanca suja,
  embrulhada em `try/catch` com `calou("consultaDeInformante", e)`. **Zero na
  tela** — nenhum `pushMsgs`, nenhum badge, nenhum número. Nenhum campo novo
  de save: `consultas` mora dentro da ficha do NPC, e `npcs` já vai inteiro
  no save (`App.jsx:7335`) e volta inteiro no load (`:10769`).
- **testes:** 172 asserções novas, cada sinal provado na casa do seu sistema —
  `teste-laco.mjs` seção 9 (25) + `teste-lacos.mjs` seção 6 (5) para o sangue,
  `teste-social.mjs` seção 12 (74) para o informante, e a suíte nova
  `teste-antecedentes.mjs` (68) para o ofício, **porque o catálogo de
  antecedentes nunca teve suíte de comportamento** — pendurar a prova em
  `teste-prontos.mjs` seria medir uma coisa na casa de outra.
- **decisões médias tomadas:**
  - **um assunto novo em `assuntos.js`** (`dois_do_mesmo_sangue`, `pede:
    "duas"`, `firmaEntre: "familia"`). Motivo: um tipo de laço que **nenhum
    assunto cria** é exatamente a regra sem código atrás que esta casa passou
    versões caçando — o sinal nasceria morto. É "ampliar acervo numa tabela
    existente, no mesmo formato" (um, no molde exato dos três vizinhos), e
    não "a voz do Narrador em massa", que é pesado.
  - **`PESO_DO_PAPEL` NÃO ganhou linha de informante.** Motivo: aquela tabela
    mede o que a pessoa **tem a perder**; ser informante diz o que ela
    **vende**. Uma linha lá mudaria a DC de toda conversa em campanha viva —
    rebalanceamento, e não desta etapa. A suíte agora **prova** que a tabela
    nova não mexe no preço (`pesoDoPapel` nulo para os 18 papéis, e
    `dificuldadeSocial` idêntica com e sem informante).
  - **`oficioDoAntecedente` lê id OU nome**, e não passa por
    `antecedentePorId`. Motivo: o desenho do orquestrador dizia "o save guarda
    o id" e **estava errado** — `App.jsx:3964` e `prontos.js:183` gravam o
    **nome** ("Herdeiro da Forja"). Um leitor só por id responderia `""` para
    toda ficha que existe. Precedente de `pericias.js:106-115`. E
    `antecedentePorId` cai no primeiro da lista quando não acha, o que daria o
    ofício do Órfão (que não tem) a qualquer id errado.
  - **uma asserção antiga cedeu — do lado certo.** `teste-laco.mjs`, "nenhum
    tipo do catálogo sem criador", montava `criados` só de `a.firma` e
    **ignorava `firmaEntre`**: cega a uma das duas portas de nascimento desde
    a v9.98. Passou a unir as duas, **com o motivo escrito na linha** (lei da
    casa). Cego estava o varredor, não o catálogo — afrouxar a asserção ou
    tirar o sangue da lista apagaria a lei em vez de cumpri-la.
- **compatibilidade (campanha viva não perde nada):** antecedente sem ofício
  continua com bônus, item, PV, PM e gancho idênticos — provado pelo caminho
  real (`montarPronto`), não contra número escrito à mão; ficha de save antigo
  sem `consultas` vale 0 e sobrevive a `mesclarNPC`; um tipo a mais em
  `TIPOS_DE_LACO` **não soma bloco ao prompt** (o objeto `lacos` de
  `App.jsx:15858` é lido só por `compasso.js:178` e `:277`, nunca serializado
  — o teto de prompt está intacto).
- **o que ficou:** **a lista de espera do `teste-ligacao` ficou VAZIA** — não
  foi preciso usá-la. Os sete exports novos são exercitados de verdade pelas
  provas, e a catraca passou sozinha (2487 regras varridas). Fica dito, com
  honestidade, que **o leitor de produção de `vezesQueUsouInformante` é R2**:
  hoje quem o "referencia" fora da prova é `reviravoltas.js:112`, mas como
  nome de propriedade (`c.vezesQueUsouInformante`), não como import — a
  catraca conta por palavra e não distingue. R2 é o credor, e ele é a próxima
  etapa da fase.
- **nada de reviravolta foi ligado.** `reviravoltas.js` e `alvoDaReviravolta`
  não foram tocados — R1 só cria os sinais e deixa o mundo rico. A vez de R2 é
  a próxima: detector para `trai_para_proteger` e `informante_duplo`, lendo o
  que nasceu aqui.
- **prova final:** `npm run build` limpo, **181/181 suítes verdes, 7/7
  varredores limpos**.

---

## 13/09 19:05 · v9.226 · A4 · o equilíbrio conferido, e a catraca que prova estabilidade · commit `817f96f`
- **estado inicial:** 180/180 suítes verdes, 7/7 varredores limpos, árvore
  limpa, HEAD `08f9527`. A vez era A4 — a última etapa da Fase A, e desde a
  correção feita depois de A3 ela não era mais "reajustar os prontos": era
  **conferir se ainda há trabalho**. A pergunta, com número e não com opinião:
  a faixa de 35–65% se sustenta **fora da amostra** que a suíte usa?
- **conselheiro:** não chamado (pauta cheia, e a etapa já estava escrita).
- **testes (a medição):** replicou o laço de `roundRobin` no scratchpad, sem
  tocar em `src/`, e rodou **49 famílias de sementes independentes** (prefixos
  novos e deslocamentos do índice), 30 sementes por par cada — o mesmo tamanho
  de amostra da suíte —, mais um retrato de 480 sementes/par.
- **A RESPOSTA: a faixa se sustentou. Zero estouros em 49 de 49 famílias.**
  Nenhum pronto passou de 65% nem caiu de 35% em nenhuma delas. Logo **nada
  foi rebalanceado neste ciclo**: nenhum número de pronto, de ficha ou de
  tabela de arena mudou. Equilíbrio é teste, não intenção — e teste verde
  também é resposta.
- **e a medição desmentiu o suspeito.** A borda de `flecha` (61,9% na suíte)
  **não é estrutural**: é o máximo do próprio intervalo dela. Fora da amostra
  `flecha` mede 49,5–57,6, e 55,7% no retrato de 480. Quem está de fato no
  topo é **`sombra` (58,1%)** — e é também o mais estável (7,1 pts de variação
  entre famílias). O piso estrutural é `voto` (44,2%) e `voz` (45,4%);
  `chama`, que na suíte marcava 42,4%, sobe para 46,5% no retrato. Ou seja: o
  retrato que o diário vinha registrando era **enviesado por uma amostra só**.
- **decisões médias tomadas:**
  - **`roundRobin` ganhou o parâmetro `prefixo`** (`src/arena.js`), padrão
    `"rr"`. Motivo: sem ele a catraca só sabe pedir UMA família, e uma família
    é uma amostra. Padrão conferido ao dígito contra o retrato antigo — objeto
    byte a byte igual. Refator de módulo puro sem mudar comportamento.
  - **a catraca do equilíbrio foi ampliada de uma amostra para cinco**, com
    tabela nomeada (`CATRACA_DO_EQUILIBRIO`: piso, teto, famílias, tamanhos,
    teto de amplitude). Motivo, medido: com 30 sementes/par o desvio-padrão de
    cada pronto é **σ ≈ 3,4 pts**, e nas 49 famílias os extremos chegaram a
    63,8% (`flecha`, 1,2 pt do teto) e 37,1% (`voz`/`voto`, 2,1 pts do piso).
    A catraca antiga provava **sorte**, não estabilidade. **O limiar 35–65 não
    afrouxou** — é o mesmo piso e o mesmo teto, agora valendo em cinco
    amostras em vez de uma.
  - **nasceu um segundo dente: o teto de amplitude do retrato (20 pts).**
    Motivo: a faixa sozinha não pega o pronto que vira dominante **sem**
    estourar 65% — ele sobe, os outros descem, e cada um continua dentro
    enquanto a distância topo–fundo abre. A folga está declarada no arquivo:
    o retrato mede 15,7 pts hoje; a amplitude estrutural é ~13,9; oito
    famílias de 120 sementes/par deram 13,0 ± 2,3. Teto colado em 16 ficaria
    vermelho na primeira brisa (qualquer mexida na arena reembaralha o RNG e
    re-sorteia a amplitude); 20 é ~3σ acima da média e ainda morde — topo em
    64% (verde na faixa!) contra fundo em 42% dá 22 pts e fica vermelho.
- **a catraca morde (conferido, não prometido):** o `testes` rodou a seção
  contra cópias mutantes de `arena.js` no scratchpad. Com `sombra` ganhando
  **+3 de vida**, a catraca ANTIGA ficaria **verde** (mede 59,5% na família
  "rr"); a nova fica vermelha **três vezes** — 67,6% em "aa", 66,2% em "bb" e
  amplitude 22,1 no retrato. Com +14 de vida e +4/+3 de atributo, `sombra` vai
  a 94–97% e as quatro famílias mordem juntas. O limite honesto também está
  escrito: +2 de vida (62,1%, amplitude 18,8) ainda passa.
- **o preço, medido:** a seção 6 foi de ~0,5 s para 3,59 s; o `npm test`
  inteiro, de 56,7 s para 59,6 s (**+2,9 s**). Pago de bom grado: é a única
  catraca que guarda o equilíbrio do roster.
- **A FASE A, FECHADA — o antes e o depois inteiro:**
  - meias-rodadas mortas: **382 de 420 quedas (8,3% do total) → 0**;
  - quedas que ABREM com duas meias-rodadas mortas: **20 de 420 (4,8%) → 0 de
    424 (0,0%)**;
  - dano depois da guarda: **1,034× o normal → 0,699×** (contra teto 0,9);
  - amplitude do equilíbrio: **24,8 pts → 20,0 pts** na família "rr"
    (15,7 pts no retrato de baixa variância, que é a medida honesta);
  - e o que nasceu no caminho: `src/efeitos.js` (A2, 6 tabelas e 11 funções),
    a arena consumindo os módulos que já existiam (A3), `teste-efeitos.mjs`
    (168 asserções), a seção 7 de `teste-arena.mjs` (o veredito) e a catraca
    de cinco amostras (A4). Quatro etapas, quatro versões, zero regressão.
- **o que ficou:** nada novo foi para a pauta neste ciclo — A4 não abriu
  frente, fechou. Os **dois itens pesados** da Fase A continuam esperando a
  pessoa, e não são deste ciclo: a **concentração inerte** (regra 5e escrita e
  que nunca acontece) e a **família defensiva que nenhum não-jogador cumpre**
  (nenhum dos 9 nomes de `GUARDAS` casa com `RX_BUFF`). A próxima fase
  aprovada é a **R — as reviravoltas**, começando por R1.

## 13/09 18:40 · v9.225 · A3 · a arena consome os efeitos · commit `6168a14`
- **estado inicial:** 180/180 suítes verdes, 7/7 varredores limpos, árvore
  limpa, HEAD `3fc1a5a`. A vez era A3 — o **veredito** da Fase A: a etapa em
  que as duas provas pendentes de A1 tinham de virar asserção de verdade.
- **conselheiro:** não chamado (pauta cheia, e a etapa já estava escrita).
- **backend:** `src/arena.js`, e só ele. A guarda primeiro (`guardaDe` +
  `erguerGuarda`, de `habilidades.js`), o buff depois (`efeitoDeBuff` +
  `empilhar`, de `efeitos.js`), o bônus no golpe por `bonusDeDano` /
  `bonusDeArma` (`combos.js`) e o prazo correndo uma vez por rodada
  (`tickEfeitos` + `expirarGuardas`). **Nenhuma fórmula nova** — a lei-mãe da
  arena é "nenhuma regra nova", e cada peça foi chamada de onde já morava. Só
  então o filtro furado de `meiaRodada` caiu inteiro, e os imports
  `ehCuraDeGrupo`/`ehOfensiva` saíram com ele.
- **frontend:** não chamado — `arena.js` é módulo puro e a tela não mudou.
- **testes:** `testes/teste-arena.mjs` — 22 ok · 1 falha → **28 ok · 0
  falhas**. As duas pendentes de A1 promovidas, a asserção do filtro
  reancorada, a medição renomeada (`m.meias` → `m.linhas`) e o retrato de
  v9.222 preservado ao lado do de v9.225.
- **os dois números de A1, fechados:**
  - quedas que ABREM com duas meias-rodadas mortas: **20 de 420 (4,8%) → 0 de
    424 (0,0%)**, contra `tetoDeAberturasMortas: 0`;
  - dano depois da guarda: **1,034× → 0,699×**, contra
    `razaoMaximaDeDanoAposGuarda: 0.9` — mas por sonda nova, ver abaixo;
  - e a medição da mesa real: 791 buffs firmados, 329 golpes com o bônus
    dentro, 409 efeitos vencendo o prazo. Meias-rodadas mortas: 382 → **0**.
- **decisões médias tomadas:**
  - **a pendente (2) foi reancorada, não promovida como estava — e o motivo
    está escrito no arquivo.** A sonda de A1 media o dano do golpe seguinte a
    uma linha `/ se guarda$/`, e essa linha **morreu junto com a coisa que ela
    media**: era a prosa vazia que A3 matou. Promovê-la literalmente daria 0
    golpe medido, razão 0,000 e verde automático — dívida visível trocada por
    prova vazia, que é pior. O limiar **não** afrouxou (continua `0.9`, e
    continua saindo de `MEDIDA_DO_BURACO`); o que mudou foi a âncora: dupla
    sintética determinística, uma habilidade que casa com `GUARDAS` **e** com
    `RX_BUFF`, medindo dano por golpe **tentado** (o erro conta zero, porque a
    guarda de defesa mexe na chance de acertar e não no tamanho do dano — era
    a outra metade do porquê de A1 dar 1,034). Razão 0,699. E o buff ganhou
    sonda própria, com piso novo `ganhoMinimoDoBuffNoGolpe: 1` — ganho 1,95.
  - **a asserção do filtro (seção 5) saiu de regex-no-fonte para prova de
    comportamento**, com o motivo escrito: regex em fonte morre com o próximo
    refatorador. A nova exige que a arena **firme** um buff que o filtro morto
    barrava (Bênção e Inspiração aparecem na amostra).
  - **`projecaoDe` passou a levar `guardas` junto** (decisão do backend, além
    da letra do brief): duas das três famílias de guarda não somam defesa — a
    de esquiva entorta o dado e a de intocável faz o golpe errar, e quem as lê
    é `resolverAtaque`, no alvo. Sem isso, erguer uma delas não faria nada.
    Conferido que não duplica número: `defesaDe(ent, true)` devolve
    `ent.defesa` explícita e não re-soma.
  - **o bônus entra DEPOIS do crítico**, e está escrito no código: somar antes
    exigiria duplicar `resolverAtaque` dentro da arena, que é a regra copiada
    que a lei-mãe proíbe. O buff sai um pouco mais barato aqui que na mesa da
    campanha — declarado, não escondido.
- **a prova morde (conferido, não prometido):** o `testes` rodou a suíte
  contra três arenas mutantes no scratchpad — voltar o buff a prosa dá 6
  falhas; erguer a guarda sem a projeção enxergá-la dá razão 1,071; empilhar o
  efeito sem somar ao dano dá ganho 0,04. Nenhuma asserção nova passa de
  qualquer jeito.
- **a catraca do equilíbrio NÃO saiu da faixa** — e a pauta previa que sairia.
  muralha 42,9→50,5 · sombra 47,1→54,3 · chama 36,2→42,4 · remendo 61,0→48,1 ·
  voz 60,5→51,0 · flecha 55,7→61,9 · punho 38,1→50,0 · voto 58,6→41,9. A
  amplitude APERTOU: 24,8 pts → 20,0 pts. Nada foi reajustado neste ciclo (era
  A4 de propósito), e nenhuma suíte precisou virar `pendente`. **A4 foi
  corrigido na pauta**: deixou de ser "reajustar os prontos" e virou "conferir
  se ainda há trabalho", com `flecha` (61,9%) como quem está na borda.
- **o que ficou:** três achados foram para a pauta. Um **pesado, para a
  pessoa**: a família defensiva é promessa que nenhum não-jogador cumpre —
  nenhum dos 9 nomes de `GUARDAS` casa com `RX_BUFF`, então companheiro e
  duelista nunca erguem guarda, e `BUFF_DA_HABILIDADE.aplica` é `"dano"` para
  tudo, o que faz "Escudo Arcano" virar `+1 de dano mágico` na narração. Um
  **médio**: o companheiro re-firma o buff que já está de pé (o comentário de
  `companheiros.js:139` já diz "uma vez, não todo turno" — é fazer o código
  cumprir o comentário). E o item leve **"Em o fosso"**, que já estava aberto,
  foi visto em toda queda olhada — continua esperando a vez.
- **nota de higiene:** `CLAUDE.md` ainda diz "hoje `v9.221`" no padrão de
  fase, quatro versões atrás. Não toquei — mexer na lei da casa sem pedido não
  é do ciclo.

## 13/09 18:05 · v9.224 · A2 · os efeitos viram módulo puro · commit `a137790`
- **estado inicial:** 179/179 suítes verdes, 7/7 varredores limpos, árvore
  limpa, HEAD `8fd6cbd`. A vez era a etapa A2 da Fase A — a segunda do bloco
  aprovado, e a mais delicada, porque mexe no que a campanha já usa.
- **conselheiro:** não chamado (pauta cheia, e a etapa já estava escrita).
- **backend:** nasceu `src/efeitos.js` — puro, sem React, só depende de
  `combos.js`. Seis tabelas nomeadas no lugar de constantes soltas
  (`LIMITES_DO_EFEITO`, `BUFF_DA_HABILIDADE`, `EFEITO_DO_MILAGRE`,
  `EFEITO_DA_MAGIA`, `APLICA_UNIVERSAL`, `APLICA_NA_NOTA`) e onze funções —
  o nascimento (`efeitoDeBuff`, `efeitoDeMilagre`, `efeitoDeMagia`), a pilha
  (`empilhar`, `retirar`), a leitura (`efeitosDe`, `buffsNaRolagem`,
  `notaDosBuffs`) e a concentração (`efeitoEmConcentracao`,
  `quebrarConcentracao`). `regras-jogo.js`, `pocoes.js` e `relicas.js`
  passaram a ler a mesma pilha.
- **frontend:** as seis trocas do mapa no `App.jsx`, por script `.cjs` com
  âncora única — 26 linhas viraram 18, sem variável órfã e sem import morto.
  A nota "(inclui bônus de ...)" sai byte a byte igual.
- **testes:** `testes/teste-efeitos.mjs`, 168 asserções em 11 seções —
  duração, decaimento (ponte com `tickEfeitos`), pilha, os dois casamentos,
  imutabilidade, 25 casos de lixo, a conta do buff, a nota da rolagem, a
  concentração, e a seção "ligado ao jogo". `npm test` 180/180 + 7/7.
- **a catraca de regressão (o que esta etapa prometeu):** as dez suítes de
  combate verdes sem uma asserção afrouxada, e **os dois números de A1
  idênticos** — 20 de 420 aberturas mortas (4,8%) e dano depois da guarda
  1,034×. As duas `pendente(...)` continuam pendentes: A2 não as promove,
  elas são o veredito de A3. **Regressão zero em Uma Vida confirmada.**
- **decisões médias tomadas:**
  - **O que já era módulo ficou onde estava.** A GUARDA inteira já vive em
    `habilidades.js` desde a v9.53 (`erguerGuarda`, `expirarGuardas`,
    `defesaDeGuarda`) e `combate.js` já a lê — no `App.jsx` não sobrou guarda
    solta, só chamadas. O relógio (`tickEfeitos`) e o modificador
    (`bonusEfeito`, `atributoEfetivo`) ficaram em `regras-jogo.js`: movê-los
    seria refazer `aplicarMudancas` inteira, risco grande e ganho zero para
    A3. O alvo de A2 era o que estava **solto no App**, e é isso que desceu.
  - **Três módulos vizinhos foram tocados de propósito.** `regras-jogo.js`,
    `pocoes.js` e `relicas.js` repetiam a mesma pilha à mão. Fazê-los ler
    `empilhar` é o que impede `efeitos.js` de nascer módulo mudo — a lei do
    export morto vale no dia em que a regra nasce.
  - **A pilha tinha duas regras convivendo sem ninguém saber**, e agora têm
    nome: o canal do Mestre casa o nome **sem caixa** (`casamento: "solto"`),
    o App, as poções e as relíquias casam **exato**. Portado como era — só
    deixou de ser duas linhas parecidas em arquivos distantes.
  - **Nada entrou em `calou(...)`, e é decisão, não esquecimento.** Os seis
    sítios já estavam fora de `try/catch` antes, e a superfície de exceção
    só diminuiu (o módulo trata `null` onde o código antigo estourava).
    Embrulhar agora exigiria decidir o que vale `p`, `extraEscopo` e `pers`
    quando falha — isso é desenho, não refatoração, e a promessa da etapa era
    regressão zero. Fica anotado na pauta como item próprio.
- **o que ficou:** cinco achados, todos **portados como estão** (a etapa era
  refatoração; consertar é A3 ou item novo) e todos já na pauta como abertos.
  Nenhuma etapa foi promovida a pesado, nada voltou vermelho, nenhuma
  devolução foi necessária.

## 13/09 17:45 · v9.223 · A1 · a prova que mede o buraco · commit `a44da9c`
- **estado inicial:** 179/179 suítes verdes, 7/7 varredores limpos, árvore
  limpa, HEAD `e35dfca`. Pauta com 4 etapas aprovadas (Fase A) + 4 (Fase R) +
  9 abertos. A vez era da Fase A, etapa A1 — a primeira do bloco aprovado.
- **conselheiro:** não chamado (pauta cheia: 8 etapas aprovadas e 9 abertos;
  pensar de novo com pauta cheia é ruído).
- **backend / frontend:** não chamados. A1 só mede — nada em `src/` mudou fora
  do bump de `VERSAO`.
- **testes:** seção 7 nova em `testes/teste-arena.mjs` (+128 linhas), com o
  helper `pendente(nome, motivo)` que imprime "· pendente (A3)" e não toca
  `bons`/`maus`; a tabela `MEDIDA_DO_BURACO` (sementes, molde de semente, e os
  dois limiares que A3 tem de cumprir); a medição do round-robin dos oito; e as
  duas provas pendentes, cada uma com o `t(...)` exato que a promove escrito no
  comentário. 23 ok · 0 falhas; `npm test` 179/179 + 7/7.
- **o número medido (o "antes" da fase, v9.222/223):** 420 quedas · 4584
  meias-rodadas · **382 mortas ("se guarda") = 8,3% do total, 0,91 por queda** ·
  **20 quedas (4,8%) abrem com duas meias-rodadas mortas** · dano sofrido logo
  depois da guarda **1,034×** o normal (guardar não desconta nada) · 6 buffs no
  repertório dos oito, 2 furam o filtro do piloto. Custo: 143ms.
- **decisões médias tomadas:**
  - **Confirmei o diagnóstico no código antes de escrever a prova, e ele tem
    uma nuance que a pauta não dizia.** `meiaRodada` (`arena.js:137-139`)
    *tenta* tirar o buff da visão do piloto com `ehCuraDeGrupo || ehOfensiva`,
    mas o filtro é **furado**: `ehOfensiva` (`companheiros.js:~95`) casa
    `RX_OFENSIVA` contra nome **+ descrição**, e "Postura Defensiva" e "Escudo
    Arcano" dizem "absorve o próximo dano" — a palavra *dano* as faz passar.
    Aí `decidirAcaoCompanheiro` testa `ehBuff` no passo 3, antes da ofensiva,
    com 70% de chance nas rodadas 1–2. A causa-raiz da pauta (os efeitos não
    são portados) continua certa; o que muda é que **A3 tem duas frentes**, não
    uma: portar o efeito *e* consertar o filtro (ou deixá-lo cair, como o
    comentário de `arena.js:136` já prevê). Acrescentei essa frente à descrição
    de A3 na pauta.
  - **A prova (2) mede um número observável, não o campo interno.** Não há como
    espiar `efeitos` de fora (`simularQueda` cria o duelista por dentro, e o
    `JSON.parse(JSON.stringify(...))` de `prepararDuelista` mata qualquer
    proxy), e comparar um `prepararDuelista` avulso seria tautologia. A prova
    compara o **dano sofrido logo depois da guarda** com o dano no resto das
    meias-rodadas: hoje a razão é 1,034; quando a guarda valer, ela cai. É a
    formulação que A3 promove com a menor reescrita — uma linha.
  - **Nenhuma asserção contável nova nesta seção, de propósito.** Todo número
    aqui (quedas, mortas, aberturas, razão) muda quando A3 consertar a arena;
    travar um deles agora seria plantar asserção que A3 teria de apagar. Os
    dois limiares de A3 (`tetoDeAberturasMortas: 0`,
    `razaoMaximaDeDanoAposGuarda: 0.9`) já estão na tabela, esperando.
  - **O molde de semente ficou travado na tabela** (`m|a|b|s`, 6 sementes por
    par): outros moldes dão 413–431 quedas, e o número do "antes" tem de ser o
    mesmo em qualquer máquina (lei v).
- **o que ficou:** as duas pendentes são dívida visível até A3 — `rodar-tudo`
  decide só pelo código de saída, então as linhas `··` não podem deixar a
  árvore vermelha por acidente. A2 (os efeitos viram módulo puro) é o próximo
  ciclo. Nada novo foi para "pesado"; nada novo para a pessoa decidir.

## 13/09 16:30 · v9.222 · o clima sazonal desce ao módulo · commit (ver `git log -1`)
- **estado inicial:** 178/178 suítes verdes, 7/7 varredores limpos, árvore
  limpa, HEAD `aae362c`. Pauta com um só item em "Aberto" — e era pesado
  (`git push`), fora de lugar.
- **conselheiro:** semeou 10 itens abertos (5 médios, 5 leves) e 4 pesados em
  "Para a pessoa decidir". Jogou o Duelo seco de ponta a ponta e abriu a Noite
  até o primeiro turno; o Narrador caiu por falta de saldo nos provedores, então
  Uma Vida e o Capítulo narrado não foram jogados.
- **backend:** `src/encontros.js` ganhou `pesosDoClima(estacaoId)` (o peso
  efetivo por estação, puro) e `rolarClima(atualId, { estacao, sorte })` com a
  conta que antes vivia no App; `POOL_CLIMA` morreu sem leitor; bump v9.222.
- **frontend:** `rolarClimaEstacao` no `App.jsx` virou uma linha que só passa a
  estação do dia; imports mortos `CLIMAS` e `BIAS_CLIMA` retirados; build limpo;
  preview abriu em aba nova sem `LimiteErro`.
- **testes:** `testes/teste-encontros.mjs` novo (32 asserções: tabela,
  `pesosDoClima`, determinismo/re-rolagem de `rolarClima`, "ligado ao jogo").
  `teste-ligacao` 21/21 sem perdão novo. Final: 179/179 suítes, 7/7 varredores.
- **decisões médias tomadas:**
  - Escolhi este item por ser o de maior valor da pauta (regra na tela → módulo
    provado) e peso médio pela linha "refatorar módulo puro sem mudar
    comportamento": a distribuição do clima que o jogador vê é idêntica.
  - Fidelidade ao App na re-rolagem: se o sorteio cai no clima atual, re-rola
    UMA vez do mesmo bolso (pode repetir com chance p²). O backend apontou que
    "nunca repete" seria mudança de distribuição; mantive o comportamento
    antigo — mudar isso é decisão de jogo, não de refatoração.
  - A guarda da re-rolagem passou de `pool.length > 1` (App) para "mais de um
    clima distinto" (módulo). Com a tabela real (12 climas, mult 0 só no calor
    do inverno) as duas guardas dão o mesmo resultado; a nova é a correta para
    um bolso degenerado de um clima só.
- **o que ficou:** a suíte nova foi escrita duas vezes (o primeiro `testes`
  demorou e o segundo entrou em paralelo com o frontend; a versão em disco é a
  segunda, 32 asserções, verde). Dormentes sem tracker seguem na pauta. Para a
  pessoa decidir: 4 itens (`git push`, saldo do Narrador, efeitos na arena,
  reviravoltas).

## 13/09 · v9.221 · a mente nasce · commit "A mente ganha cabeca e peso"
- **estado inicial:** 178 suítes verdes, 7/7 varredores limpos, pauta vazia.
- **o que se fez:** CLAUDE.md ganhou a seção "A mente" (a tabela de pesos);
  nasceram `mente/pauta.md`, `mente/diario.md` e o agente `conselheiro`; o
  orquestrador passou a decidir por peso em vez de perguntar em toda
  bifurcação.
- **o que ficou:** o primeiro ciclo real ainda não rodou — a pessoa liga.
