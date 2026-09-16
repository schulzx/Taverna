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

## 16/09 09:25 · v9.272 · Z1 · o recálculo, e a prova de que ele não se mexe · commit `400748a`

- **estado inicial:** trava `.claude/ciclo-em-curso` **não existia** — mas
  `mente/agora.json` tinha, por commitar, duas linhas de um Z1 **que morreu
  antes de escrever uma linha de código** (`orquestrador` e `backend`, com
  `desde` marcado às 22:00Z, hora que ainda não aconteceu). **Registo de ciclo
  morto**, como manda o roteiro: nada no disco além daquelas duas linhas, que
  reaproveitei com a hora certa. Árvore de resto limpa, `npm test` verde de
  entrada. A outra mente estava viva ao lado no K4 (trava
  `.claude/ciclo-desenho-em-curso` das 08:47, `mente/k4-desenho.md` por
  commitar) — **nada disso entrou no meu commit**, e o bastão do `App.jsx`
  nunca esteve comigo.
- **A versão não mudou debaixo de mim desta vez** — reli `src/constantes.js`
  imediatamente antes de bumpar, como Y1 ensinou, e ainda dizia `v9.271`.
  Fui para `v9.272`. A releitura continua a ser barata e a suposição continua
  a ser cara.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** `src/recalculo.js` (4 exports) e a extração da fórmula de PV/PM
  de `src/prontos.js:171-173` para `corpoDaFicha`.
- **testes:** `testes/teste-recalculo.mjs` — **54 asserções**, 0 falhas, e a
  medição de divergência impressa em vez de travada.
- **prova:** `npm run build` limpo, `npm test` **194/194 suítes verdes**.
  Não precisei de `mente/so-o-meu.sh`: não havia vermelho de ninguém.

### As três propriedades, e como cada uma ficou provada

1. **Idempotente** — n = 1..10 sobre **1 008 fichas** (12 classes × 7 níveis,
   escolhidos nos degraus onde `bonusProficiencia` vira, × 2 configurações de
   atributos × 3 antecedentes × {certa, torta}). A asserção é tripla: `mudou`
   falso na 2.ª passagem, igualdade profunda 2.ª↔10.ª, e `recalc^n ===
   recalc^1` ficha a ficha. *"Abrir o jogo dez vezes não move um ponto"* é
   literalmente esta asserção, e está escrito assim no comentário.
2. **Mudo quando não é preciso** — a asserção é **identidade referencial**
   (`r.ficha === pers`), não só `JSON.stringify` igual. **É a diferença que
   importa:** um clone com as mesmas chaves passa num teste de JSON e continua
   a ser uma escrita. Só a identidade prova que nem sequer houve cópia.
3. **Deriva das tabelas** — a suíte **remonta** a fórmula de `vidaBase`/
   `manaBase`, `pv`/`pm` do antecedente e `PV_POR_NIVEL`/`PM_POR_NIVEL`, e o
   teto de nível sai de `XP_ACUMULADO.length` em vez de um `20` escrito à mão.
   Nenhum número na asserção; é o que a faz sobreviver a uma mudança de tabela.

### As decisões médias, com o motivo

- **O recálculo NÃO sobe de nível pelo XP — e esta é a decisão pesada da
  etapa.** Subir exige **gastar** o XP; `xp` não é campo governado; logo um
  nível movido sem o XP gasto sobe outra vez na leitura seguinte. Medido com a
  própria tabela: nível 1 com 100 000 XP daria **1 → 12 → 16 → 18 → 20 em
  quatro aberturas** — literalmente o *"status diferente em cada gameplay"*
  que a pessoa proibiu. O dono da subida continua a ser `aplicarNivel`
  (`regras-jogo.js:37`), que roda a cada ganho de XP e por isso garante
  `xp < custo(nivel)` em toda ficha bem formada. Aqui o nível é **saneado**
  (`floor`, nunca `round` — arredondar para cima daria meio degrau de graça) e
  serve de entrada para os outros três. **O desenho errado ficou escrito no
  teste pelo nome e pelo número** (§5b), no molde do "desenho A" de
  `teste-trava-da-reacao`, com uma asserção a provar que ele move mesmo a
  ficha: senão a catraca não saberia reconhecer o erro no dia em que voltasse.
- **Ausência não é divergência.** Campo `null`/`undefined` não discorda.
  Nenhuma ficha de hoje guarda `proficiencia` — deriva-a na leitura — e
  escrevê-la em todo save seria mudar dado do jogador **sem necessidade**, que
  é metade da ressalva. Quem guarda o campo e o guarda errado é corrigido. E
  **`0` não é ausência**: `vidaMax: 0` é ficha partida e é consertada.
- **`vida`/`mana` correntes ficaram de fora.** A lei da etapa é *nada fora de
  `CAMPOS_DO_RECALCULO` é tocado, nunca*. Se um teto cair, uma ficha pode
  ficar com `vida > vidaMax` — **quem apara o corrente é quem aplica na tela,
  com o veredito antes do clique.** É hand-off explícito para Z2.
- **Não passa por `antecedentePorId`.** Aquele leitor cai no primeiro da lista
  quando não acha — serve à criação, que precisa sempre de um antecedente, e
  aqui daria o corpo do Órfão a qualquer nome escrito errado. Quem pergunta
  pelo corpo quer a verdade ou o silêncio, nunca um palpite.
- **Duas asserções do `testes` ficaram vermelhas contra o módulo e foram
  reescritas — nenhuma afrouxada, e o motivo está em comentário nas duas.** A
  mão de testes tinha presumido que o recálculo derivaria o nível do XP; o
  contrato nunca o disse e o `backend` decidiu o contrário com razão medida.
  A segunda exigia que o recálculo escrevesse por cima de campo ausente, e
  virou a §7b — a asserção da lei que ela estava a contrariar.

### O achado: quantas fichas divergem, e quanto

**Do recálculo novo: nenhuma.** 0 de 8 prontos e 0 de 504 fichas certas; nem
um PV nem um PM se move. Os oito prontos saíram **idênticos byte a byte** à
extração — medido por snapshot `JSON.stringify` da ficha inteira antes e
depois, não só dos dois campos.

**Da recalibração de hoje, sobre o mesmo corpus de 144 fichas: quase todas.**
O PV mexeria em **120 de 144** (erro médio 4,5 PV; pior caso um Mago nível 20,
128 → 145, **+17**) e o PM em **138 de 144** (erro médio **19,7 PM**; pior
caso o mesmo Mago, 90 → 46, **−44**). A razão está nomeada: ela usava
`pvEsperadoJogador` (`combate.js:465`), que é a **régua do balanceamento** —
estimativa de classe média — e nunca foi a ficha de ninguém; e inventava o PM
numa linha solta (`App.jsx:20853`) que não batia nem com `prontos.js` nem com
a tela de criação. **Nada foi ajustado para caber:** é achado, e é ele que
justifica Z2.

**A honestidade da medição:** o corpus é *construído*, não é um save real de
uma partida real — não há fixture de save no projeto. Os 0/8 dos prontos são
fichas de verdade; os 0/504 são fichas montadas como o jogo as monta (criação
no nível 1 + `aplicarNivel` pagando o XP exato de cada degrau). **Quantas
fichas de jogador de verdade divergem, só Z2 saberá**, ao correr o recálculo
num load a sério.

### O que já existia e foi reusado em vez de reescrito

A lição de H2 (6 dos 12 assuntos já tinham dono) e de Y1 (3 das 4 peças já
existiam) pagou-se a terceira vez: **os quatro números já tinham dono.**
`bonusProficiencia` (`regras.js:12`), `XP_ACUMULADO` (`regras.js:38`),
`PV_POR_NIVEL`/`PM_POR_NIVEL` (`regras-jogo.js:34-35`), `vidaBase`/`manaBase`
(`classes.js`), `pv`/`pm` (`antecedentes.js`). **Não nasceu tabela nova** — o
que nasceu foi o **lugar único** onde se lê todas elas. E a extração pagou-se
já: a fórmula tinha **três donos** (prontos, criação, recalibração) e o
terceiro já tinha divergido dos outros dois sem ninguém dar por isso.

### O que ficou

- **Z2 herda três coisas:** as três portas por fechar (save, mundo, ascensão,
  incluindo o botão que diz *"⚖ Recalibrar com a IA"* em
  `painel-ascensao.jsx:35` e `:229`), **o aparo de `vida`/`mana` correntes**
  quando um teto cai, e a medição real contra saves de jogador. Precisa do
  bastão do `App.jsx`.
- **Uma armadilha latente, já com catraca.** `corpoDaFicha` usa
  `(cObj && cObj.vidaBase) || 10` — um `||`, não um `??`. Hoje as 12 classes
  têm `vidaBase`/`manaBase` verdadeiros; uma classe futura com `vidaBase: 0`
  cairia no default de 10 em silêncio. A §6 fica vermelha nesse dia. Não é bug
  hoje, e não foi mexido para não mudar número.
- **Nada para a pessoa decidir** neste ciclo.

---

## 16/09 08:00 · v9.271 · Y1 · `Empurrar` e `Derrubar` ganham motor · commit `384c3d5`

- **A VERSÃO MUDOU DEBAIXO DE MIM, e é registo de processo.** Abri o ciclo com
  `v9.269` lido em `src/constantes.js` e planeei `v9.270`. Quando fui bumpar,
  ao fim do ciclo, o `constantes.js` **já dizia `v9.270`**: a outra mente
  fechou K3 (`9901996`) enquanto eu trabalhava e levou o número. Reli o
  arquivo em vez de aplicar o que tinha planeado, e fui para **`v9.271`** — a
  lei diz que em conflito de `VERSAO` fica o número maior. **É exatamente o
  motivo por que o `CLAUDE.md` manda ler a versão no arquivo e nunca de um
  exemplo escrito**, e desta vez o exemplo que envelheceu era o meu, com meia
  hora de idade. Três textos meus já diziam `v9.270` e foram corrigidos.
- **estado inicial:** árvore com a outra mente (K3) viva ao lado — `App.jsx`,
  `estilo.js`, `ritmo-da-reacao.js`, `formas.md` e dois `k3-*.md` modificados,
  mais `painel-reacao.jsx` e `palavras-da-reacao.js` por commitar. **Nada
  disso era meu e nada disso entrou no meu commit.** A trava
  `.claude/ciclo-em-curso` **não existia** (o ciclo de V1 fechou-a); pus a
  minha. O bastão do `App.jsx` estava com o `regente`/`oficial` desde as
  07:42 — **menos de 90 minutos, logo vivo: não lhe toquei**.
- **o vermelho que me foi anunciado e que já não existia:** o briefing avisava
  de um `teste-ligacao` sobre `ritmo-da-reacao.js`, arquivo da outra mente.
  No meu `npm test` de fecho ele estava **verde** — a outra mente fechou-o e
  commitou K3 durante o meu ciclo. Não precisei de `so-o-meu.sh`.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** `src/disputa.js` (7 exports), três nomes novos em `src/grid.js`
  e o buraco de X2 fechado em `src/golpe.js`.
- **testes:** `testes/teste-disputa.mjs` (163 asserções), a asserção movida em
  `testes/teste-golpe.mjs` e a sonda `testes/sonda-empurrao.mjs`.

### As decisões médias, com o motivo

- **UM módulo para os dois verbos, não dois.** `Empurrar` e `Derrubar` são o
  **mesmo teste oposto com dois desfechos**; dois módulos seriam dois motores
  da mesma regra, e o dia em que um mudasse o outro mentiria. O nome
  `disputa.js` é o que o próprio código já usava para a ausência:
  `golpe.js:245` dizia *"o motor não tem disputa entre duas fichas"*.
- **O deslocamento forçado ficou em `grid.js`, não em `disputa.js`.** A lei da
  etapa era *não criar um segundo motor de movimento*, e quem é dono da
  posição, da parede e da casa ocupada é o tabuleiro. `disputa.js` decide
  **quem ganha**; `grid.js` decide **para onde o corpo vai**.
- **Empate ganha quem resiste.** O empurrão é de graça em consequência — não
  custa vida, não erra crítico. Uma ação barata que ganhasse empates seria
  clicada todo turno.
- **A resistência tem duas portas (Força/Atletismo ou Destreza/Acrobacia, a
  melhor).** Sem a segunda, uma ficha de Destreza alta e Força zero não teria
  defesa nenhuma contra um botão.
- **Vitória com destino bloqueado NÃO causa dano.** Dano de parede seria
  mecânica nova, e mecânica nova é da pessoa. O resultado diz `bloqueio` e o
  alvo fica onde estava — está escrito no cabeçalho que foi deliberado.
- **A força de quem não tem ficha saiu da linha para a tabela.** O inimigo do
  bestiário não tem `atributos`; o precedente de produção (`aflicoes.js:99`)
  resolve-o pelo nível. A **forma e o número são dele** — só a régua mudou de
  casa, e agora a suíte lê-a de volta.

### O que já existia e foi reusado em vez de reescrito

A lição de H2 (dos 12 assuntos, 6 já tinham dono) pagou-se outra vez: **três
das quatro peças já existiam.** A condição prono é o `caido` de
`condicoes.js:120` — **não nasceu condição nova**; o portão de tamanho é a
`ESCADA` de `grid.js:95`, cujo comentário já dizia, literalmente, que é ela
que dá sentido a *"empurrar um degrau"*; e a perícia estava escolhida desde
sempre, porque a descrição de `atletismo` em `pericias.js:40` já continha a
palavra **"empurrar"**. O que faltava mesmo era só o **teste oposto** e o
**passo forçado numa direção**.

**E uma armadilha de nome que quase custou caro:** `src/queda.js` (Q1) tem
`GOLPE_NO_CAIDO`, mas ali "caído" quer dizer **inconsciente a 0 PV**, não
prono — mecânicas opostas com o mesmo nome. Há agora uma asserção que prova
que `disputa.js` **não importa `queda.js`**, para que a próxima pessoa não as
funda.

### A asserção que se moveu, e por que não foi afrouxamento

`teste-golpe.mjs` dizia `"esquivar,empurrar,derrubar"` continuam sem motor.
Ficou mentira no dia em que Y1 nasceu. Foi movida para `"esquivar"` com ~25
linhas de motivo escrito por cima — e **ganhou um segundo dente**: a tabela
nomeia `disputa.js`, e uma asserção nova importa-o e prova que as funções
nomeadas **existem mesmo**. Sem isso, fechar o buraco seria escrever uma
string no campo `motor`.

### O efeito na distância, medido — e a régua que não servia

**A régua de B1 não pode medir isto, e está provado no próprio arquivo:** ela
roda com `grade: null` (`regua-combate.mjs:935`, declarado em `:484-486`), e
`TABULEIRO_NA_REGUA` lista `"distancia"`, `"posicao"` e `"deslocamento"` em
**`naoMede`** — além de os três cenários estarem **saturados** (duro 0,0% ·
justo 1,6% · brando 100%). Foi a ressalva de Q1 confirmada por leitura, e não
por suposição. Então a medida foi feita por **sonda** sobre as `PLANTAS`
reais: 10 plantas × 2000 empurrões, com sorte semeada.

- **1,50 m por empurrão bem-sucedido, sem dispersão nenhuma.** A hipótese
  escrita **antes** de medir era que a diagonal desse menos (Chebyshev);
  **estava errada**, e a sonda di-lo — que é toda a razão de se medir.
- **Bloqueio: 22,1% das vitórias** em bruto; **5,6%** contando só alvos que não
  começavam encostados à moldura (a colocação uniforme infla a `borda`; os
  dois números estão declarados).
- **E o terreno importa de forma diferente em cada planta:** masmorra 10,5% ·
  taverna 10,4% · cidade 8,0% · ruína 7,5%, contra floresta 1,2% · deserto
  1,7% · estrada 2,0%. É o que um verbo de posição devia fazer.
- **Contra a caminhada de W1** (1,4 rodadas = 12,6 m por luta): um empurrão
  vale **0,167 rodada (11,9%)**, e um turno de empurrão devolve **16,7%** do
  que um turno de corrida devolve. **Empurrar não é uma forma barata de fazer
  distância — e não devia ser:** gasta o turno inteiro para mover uma casa
  alguém que resiste. O que ele compra é posição.
- **Nada foi reequilibrado**, como a etapa mandava.

### O que ficou

- **A fiação é Y2, e não foi por escolha:** o bastão do `App.jsx` esteve com a
  outra mente o ciclo inteiro. Os dois botões continuam a só escrever uma
  frase na caixa. Entrou na pauta como **Y1b**, médio.
- **O reforço entra na luta sem `x`/`y`** (X3b/X4) — **esbarrei e não
  consertei**, como mandado. `deslocarForcado` e `destinoDoEmpurrao` tratam-no
  defensivamente (não estouram, devolvem motivo), e o achado **continua
  aberto**.
- **Para a pessoa, se quiser:** dar ao bicho a destreza real (`des`, que o
  bestiário já traz) na resistência ao empurrão, em vez de só o `nível/4`. A
  linha está pronta na tabela, com o motivo — mas é mecânica nova, logo dela.
- **Nota de processo:** as duas mãos correram em paralelo contra um contrato
  que eu pinei, e mesmo assim ele derivou quatro vezes (`{dx,dy}`↔`{x,y}`, o
  campo `total`, `destinoDoEmpurrao` a sair e voltar). O paralelo poupou
  tempo, mas **o contrato pinado não bastou**: com módulo novo e suíte nova ao
  mesmo tempo, vale sequenciar ou pinar até o formato de retorno.

---

## 16/09 07:55 · v9.269 · V1 · o poço que apanha por você · commit `056dcd2`

- **HOUVE UM CICLO MORTO, e é a primeira coisa que este bloco regista.** A
  trava `.claude/ciclo-em-curso` estava posta às **05:09** com o meu nome e
  este item (`orquestrador · V1 · o PV temporario`), e o ciclo **morreu no
  limite de uso da API — não por falha**. Às 07:38 ela tinha 2h29, muito
  acima dos 90 minutos do roteiro: assumi-a em vez de esperar por ela, e
  reescrevi-a com a hora nova e a nota `(assumido de um ciclo morto)`. **Não
  desfiz nada do que ele deixou**, e a razão é que o que ele deixou estava
  quase todo de pé: `src/temporario.js` (414 linhas), `testes/teste-temporario.mjs`
  (967 linhas, 212 asserções) e `src/efeitos.js` ligado. Desfazer teria
  queimado uma etapa inteira por causa de uma linha de comentário.
- **estado inicial:** `npm test` **190/191**, e a única vermelha era
  `teste-regua.mjs` — a catraca da seção 9, *"e nada do jogo importa a régua
  — nem sequer a menciona"*, com `temporario.js` a nomeá-la. Árvore com a
  outra mente viva ao lado (K3): `mente/formas.md`, `mente/k3-jogo.md`,
  `mente/k3-desenho.md` e `mente/agora.json` são dela e **não entraram no meu
  commit** — `git commit -- <caminhos>`, como a lei manda.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **UM VERMELHO QUE NÃO É MEU, e a prova de que não é.** No fecho, `npm test`
  acendeu `teste-ligacao.mjs` em `ritmo-da-reacao.js:TEMPOS_DO_CARTAO` — um
  export sem leitor num arquivo **da outra mente**, que apareceu na árvore no
  meio do meu ciclo (K3, com `src/estilo.js`). Não o consertei e não esperei
  por ele: `bash mente/so-o-meu.sh src/temporario.js src/efeitos.js
  src/constantes.js testes/teste-temporario.mjs` dá **HEAD + só os meus =
  191/191 suítes verdes · 13/13 varredores limpos**. Verde ali é verde meu, e
  foi com isso que subi. A catraca de K3 morde quem a pôs, e é assim que ela
  tem de funcionar.
- **o bastão do `App.jsx`: NÃO TOMADO.** É da outra mente (K3). V1 é só
  motor; V2 (a tela) fica para quem tiver o bastão, e o que ela vai precisar
  está **escrito** no cabeçalho de `src/temporario.js`, não por descobrir.
- **backend:** uma coisa só, e a certa — tirou o nome do instrumento de
  medida do comentário de `src/temporario.js`. Três frases reescritas: *"a
  régua tem de ser a de cima um degrau acima"* → *"a **medida** tem de ser"*;
  a abertura que citava o arquivo e o caminho virou *"**MEDIDO, e não
  estimado** — a medição inteira (N, cenários, intervalos) está escrita no
  diário desta versão; aqui fica só o que justifica o número"*; e a ressalva
  de Q1 virou *"**a medição correu com `grade: null`**"*. Os números da
  tabela **não foram tocados**.
- **testes:** nenhuma suíte escrita neste ciclo — as do ciclo morto já
  cobriam tudo (212 asserções em 10 seções). `grep -rn "regua-combate" src/`
  sai **vazio**; `teste-regua.mjs` fechou **150 ok · 0 falhas**.

- **decisões médias tomadas** (cada uma com o motivo, que é o que se audita):
  1. **A catraca não foi afrouxada — o código é que passou a cumpri-la.** A
     saída fácil era pôr `temporario.js` numa lista de exceções de
     `teste-regua.mjs`. Seria a casa a escrever que *às vezes* o jogo pode
     falar do instrumento que o mede, e a próxima exceção viria de graça. O
     dente da seção 9 fica com os dentes todos.
  2. **O número medido fica, o nome de quem mediu sai.** O comentário de um
     número de tabela é o que torna a lei *"se é número, é tabela"*
     auditável — apagar o **porquê** de `teto: 9` para calar a catraca teria
     trocado um vermelho por uma regra sem razão escrita. Então ficou o fato
     (9,69 de dano por corpo por rodada; **9 é o maior inteiro abaixo**) e
     saiu a proveniência, que passou a morar aqui, no diário — que é o lugar
     do registo de medição.
  3. **Não desfiz o ciclo morto, assumi-o.** O roteiro manda desfazer *"se a
     árvore estiver pela metade"*; esta não estava — estava a uma linha de
     comentário do verde, com build limpo e 212 asserções de pé.

- **A MEDIÇÃO, POR EXTENSO** (é aqui que ela mora agora, e é o que
  `src/temporario.js` quer dizer com *"o diário desta versão"*):
  instrumento `testes/regua-combate.mjs`, **300 combates por cenário**,
  herói equipado (arma, armadura, escudo) e o trio de nível 5.
  · `justo` — **6,30 ± 0,25 rodadas**, **243,91 ± 6,82** de dano no grupo
    inteiro (quatro corpos) → ~38,7 por rodada → **9,69 por corpo por rodada**.
  · `duro` — 5,09 rodadas, 223,92 de dano → **11,00** por corpo por rodada.
  · `brando` — 2,95 rodadas.
  Daí os dois números da tabela: **`teto: 9`** é o maior inteiro abaixo de
  **9,69** (manda o menor dos dois, porque é na luta mais branda que uma
  rodada de graça é mais barata de comprar) — o poço mais caro que o sistema
  pode dar **nunca compra uma rodada inteira de impunidade**, que é a mesma
  lei que o teto 12 escreveu para o golpe. E **`turnosPadrao: 7`** é o
  primeiro inteiro acima da margem de cima de 6,30 ± 0,25, porque um poço que
  expira no meio da luta é o mesmo que não existir.
  **MEDIDO, E NÃO REEQUILIBRADO:** nenhum número do jogo mudou neste ciclo.
  **E COM A RESSALVA QUE Q1 IMPRIMIU:** a medição corre com **`grade: null`**
  — sem tabuleiro, todo golpe alcança toda gente e ninguém gasta rodada a
  andar. É **limite otimista, não o jogo**. Com grade a luta é mais longa (X1
  mediu 2 a 3 rodadas só de caminhada), logo **7 é piso da duração real e não
  o retrato dela** — o poço cobre a luta medida, e na luta de verdade pode
  acabar antes. Se um dia a régua ganhar grade, é este 7 que se remede.

- **A ORDEM DO DANO, COM A QUEDA NO MEIO** (o cuidado que Q1 tornou
  necessário, e a pergunta que a pessoa fez):
  `abrigo (família absorve) → TEMPORÁRIO → PV real → a porta da queda`
  · **O temporário é consumido ANTES de `quedaAoChegarAZero` ser perguntada
    — e não por uma regra nova.** Sai por **composição**: `absorverDano`
    (efeitos.js) é a **única** porta por onde o dano passa antes de virar PV,
    e a porta de Q1 só é perguntada quando o **PV real** chega a zero. Q1
    ficou **intocada — nem uma linha**.
  · **O abrigo vem primeiro por regressão**, não por gosto: ele gasta-se
    inteiro assim que toca num golpe, e pôr o poço à frente mudaria *quando*
    ele se gasta — o escudo passaria a render mais do que rende hoje. Com o
    abrigo primeiro, a fase é **puramente aditiva**: ficha sem temporário
    devolve byte a byte o que devolvia antes.
  · **Provado, e não afirmado** (`teste-temporario.mjs` §7): um herói com 3 de
    vida apanha um golpe que **sem** o poço o levaria a 0 — e a 0 a porta de
    Q1 decide se ele cai. **Com** o poço consumido antes, o PV real fica
    acima de zero e *"a porta da queda NUNCA chega a ser perguntada"*; sem
    ele, a porta responde que o herói cai — e o desfecho é **lido de volta**
    de `quedaAoChegarAZero`, não escrito à mão, para acompanhar sozinho o dia
    em que "cai" mudar de palavra. **Ninguém cai com escudo de pé.**

- **"FICA O MAIOR", PROVADO NOS DOIS SENTIDOS** (§3, §4 e §9):
  `POUCO depois MUITO` e `MUITO depois POUCO` dão **MUITO** nos dois casos, e
  a asserção **nega a soma explicitamente** (`!== POUCO + MUITO`) para dizer o
  que impede, não só o que espera. Três lançamentos seguidos do mesmo poço
  continuam a dar **um** poço. A oferta menor **não é aceite, não escreve
  linha nenhuma** e devolve a **mesma** ficha que entrou (o empate idem — um
  objeto novo faria a fiação de cima piscar por uma mudança que não existe),
  mas ainda diz **porquê** para o log. E **não cura**: `vida` e `vidaMax` saem
  intocados nos dez caminhos, inclusive com o maior poço possível sobre um
  corpo moído. O "fica o maior" tem **um dono só** (`vereditoDoTemporario`), e
  §9 compara as duas pontas (`absorverDano` e `gastarTemporario`) nos mesmos
  seis pares e cobra o mesmo número, o mesmo resto e a mesma frase — sem
  espiar o código.

- **o que ficou (o que V2 herda, escrito e não por descobrir):**
  1. **`tickTemporario` não é chamado por ninguém** — o relógio da rodada é
     de V2, ao lado de `tickEfeitos` (`regras-jogo.js:369`). **Enquanto não
     andar, o poço dura para sempre.** É a dívida declarada desta etapa.
  2. **`ganharTemporario` também não tem quem o chame** — a torneira (poção,
     milagre, habilidade) é de V2/V3. O módulo nasce com a regra pronta e a
     torneira fechada, de propósito.
  3. **`vereditoDoTemporario` é a tela de V2**: `haEscolha: true` é o sinal de
     que o jogador tem uma decisão de verdade (4 contra 10) e de que ela deve
     aparecer **antes do clique**.
  4. **O furo de `arena.js:249`**: ela escreve de volta só `outro.efeitos`
     quando `absorvido > 0`, e o poço vive em `pers.temporario`, que essa
     linha não copia — num duelo, o temporário seria gasto e esquecido a cada
     golpe. **Hoje não morde ninguém** (nada põe temporário num duelista); no
     dia em que puser, é essa linha que mente. `App.jsx` (`passarPeloAbrigo`)
     já devolve `ab.pers` inteiro e não tem o problema.
  5. E o par disso: `ab.linha` é `""` quando o `absorvido` vem só do poço, e a
     arena empurraria `"Nome — "` para o log. **`linhaDoTemporario` existe
     para V2 ter o que pôr ali.**

---
## 16/09 08:20 · v9.268 · Q1 · quem cai, e quem só morre · commit `7a519be`

- **estado inicial:** trava `.claude/ciclo-em-curso` **ausente** — pus a
  minha. Árvore só com `mente/agora.json` e dois documentos da outra mente
  (K2), que ela commitou durante o ciclo. `npm test` **verde de saída**.
  `VERSAO` relida em `src/constantes.js` antes de datar: `v9.266` no início,
  e a outra mente subiu `v9.267` (`ae1be0b`, `d5b9569`) **no meio do ciclo**
  — **releio antes de fechar e redatei 7 comentários** de `v9.266` para
  `v9.268`. É exatamente a armadilha que custou 32 redatações em H1, e desta
  vez a segunda leitura apanhou-a.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **o bastão do `App.jsx`: NÃO TOMADO.** `.claude/app-jsx` era da outra
  mente (W2/K2, 06:40). A etapa foi desenhada para caber **só no motor**: o
  App foi lido e não tocado, e a fiação ficou **escrita** no cabeçalho de
  `src/queda.js` para Q2 a aplicar de uma vez.
- **backend:** `src/queda.js` (novo) — `DONOS_DA_QUEDA` (herói **sempre**,
  companheiro **sempre**, inimigo **se importante**), `quedaAoChegarAZero`
  como porta única que nunca lança e nunca devolve `null`,
  `APELIDOS_DO_LADO` (cobre o `ref` de `combate.js` sem tradução à mão),
  `ehImportante` que só aceita `importante === true`, e `GOLPE_NO_CAIDO`.
  Em `src/bestiario.js`, o campo declarado `importante` no molde do
  `degrau` de N2, e `completarInimigo` a carregá-lo até à ficha que chega à
  luta — pela terceira vez que esta casa paga por uma tabela que a mesa não
  vê (`perfil` v9.152, `degrau` v9.259).
- **testes:** `testes/teste-queda.mjs` (novo, 81 asserções em 8 seções) e
  `testes/sonda-queda.mjs` (novo, medição). A suíte deriva a expectativa da
  **coluna `testa` da própria tabela** em vez de repetir 1/2/3 à mão, varre
  22 entradas tortas e 16 valores falsos de `importante`, e prova o contrato
  com `aplicarTesteMorte` empurrando falhas pelo motor real até `morto`.
  `teste-ligacao` **20/1 → 21/0** e `check-mortas` **1 → 0 exports sem
  leitor**: `falhasDoGolpeNoCaido` nasceu sem leitor e a suíte fechou-o no
  mesmo dia, que é o que a catraca existe para forçar.

- **decisões médias tomadas** (cada uma com o motivo, que é o que se audita):
  1. **O módulo chama-se `queda.js` e não reescreve `testeDeMorte`.** A
     decisão ("cai ou morre?") e a sorte ("resiste ou enfraquece?") são duas
     perguntas; misturá-las tornaria Q1 improvável sem semente. `combate.js`
     ficou **intocado**.
  2. **O padrão de quem não se declarou é MORRER DIRETO.** Um lado
     desconhecido que caísse ganharia imortalidade por acidente, e o nome
     inventado pelo Narrador é o caso comum, não o raro.
  3. **5 das 27 criaturas declaram `importante`** — Dragão Jovem, Lich,
     Dragão Ancião, Comandante, Horror. Critério escrito: aparece sozinha e
     nomeada, e o jogo perde o fim dela se acontecer sem cena. Deixei duas
     exceções de propósito — o **Comandante** é `elite` e declara, o
     **Colosso** é `lendario` e não — porque são a prova viva de que o campo
     **não** sai da `ameaca`, que é a adivinhação que a pauta proíbe.
  4. **`e.importante` vindo da IA é ignorado.** O Narrador nomeia; quem
     declara mecânica é a tabela. Torna `completarInimigo` idempotente.
  5. **O golpe em quem já caiu custa 1 falha (2 no crítico) e 0 em quem não
     testa.** O ciclo exigia que a tabela dissesse o que faz com os 13,4%-18%
     de N1; a alternativa — deixá-lo evaporar — premia o azar de quem já
     perdeu alguém. `falhasAteMorrer: 3` espelha o literal de
     `aplicarTesteMorte`, com a suíte a provar que os dois concordam.
  6. **Contadores de diagnóstico no retorno de `simularCombate`**
     (`danoEmCaidos`, `golpesEmCaidosPorNome` e mais cinco). Somar campo ao
     retorno não muda veredito: **`CATRACA_DE_UMA_VIDA` intacta**, nenhum
     limiar tocado, nenhum cenário alterado.
  7. **Corrigi o cabeçalho de `queda.js` eu mesmo** depois da medição, em
     dois pontos: os números de N1 e a frase "o herói escapa por acidente".
     Comentário que mente é pior que comentário ausente, e este ia para Q2
     como instrução.

- **a medição, e ela diverge de N1 — não se forçou o número antigo.**
  1000 sementes, família `umavida`, IC 95%, Adversário ligado:

  | | justo | duro |
  |---|---|---|
  | golpes em corpo caído | 4,97 ± 0,13 | 5,43 ± 0,14 |
  | dano em corpo caído | 61,20 ± 1,65 PV | 67,18 ± 1,83 PV |
  | fração do dano inimigo | **20,02%** | **22,68%** |
  | *projeção Q1:* quedas que virariam morte | **0,868 ± 0,047** | **0,990 ± 0,050** |

  N1 escreveu 13,40%/18,03%; mediu-se **20,02%/22,68%**. A causa está no
  próprio diário: N1 mediu **antes de N1b** (o conserto da ordem da rodada) e
  com parte da conta vinda de uma reconstrução de scratchpad que o diário já
  marcava como reconstrução. Com o Adversário **desligado** os mesmos
  contadores dão 3,78%/6,59% — nenhuma das duas pontas reproduz 13,40%, e
  quem gera a sobra é quem concentra fogo.
  **Duas ressalvas que viajam com todo número acima:** (a) a régua corre com
  `grade: null` (X4) — **não tem tabuleiro**, todo golpe alcança, logo isto é
  o **limite otimista** do desperdício e nunca "o jogo"; (b) tudo na metade de
  baixo é **projeção**, porque Q1 não liga nada e a mesa de verdade reagiria
  (quem morre deixa de ser alvo).
  **Registado e NÃO reequilibrado**, como o ciclo mandou: balancear é da
  pessoa, e a régua está saturada até ela responder sobre o alvo tático.

- **o que Q1 achou e muda o alcance de Q2:** a frase do cabeçalho que dizia
  que **o herói escapa** do desperdício por acidente de referência foi medida
  e **desmentida** — são **2,03 (`justo`) e 1,86 (`duro`)** golpes por combate
  em herói **já** no chão. O filtro de `combate.js:267` tira quem estava
  caído no **início** do passo; quem cai **durante** o passo apanha, herói
  incluído. O conserto da foto é dos **três lados**, e está escrito na pauta
  em Q2.

- **o que ficou:** **Q2 não foi tocada** (o ciclo mandou um item). Continuam
  na fila, e Q1 **não** os tocou porque são fiação: a **queda e a morte de
  companheiro são silêncio absoluto** (`App.jsx:13967`, achado de X3b) e o
  **reforço entra sem `x`/`y` nem iniciativa** (X4). `mente/pedidos-ao-sistema.md`
  foi lido: **nada atendido neste ciclo** — os nove abertos são de `turno.js`,
  `falas.js`, `desafios.js` e do `App.jsx`, e nenhum cabia numa etapa que se
  proibiu o App para não tomar o bastão da outra mente.
- **fechamento:** `npm run build` limpo, `npm test` **190/190 suítes · 13/13
  varredores**. Não houve vermelho da outra mente para separar — K2 e W2
  estavam verdes. `bash mente/so-o-meu.sh` (HEAD + só os nossos) deu
  **189/189 · 13/13**, 189 porque `teste-trava-da-reacao.mjs` da outra mente
  ainda não estava em HEAD quando se provou.

## 16/09 07:10 · v9.266 · H2 · de quem já são os 12 · commit `59dab1e`

- **estado inicial limpo, pela primeira vez em três ciclos.** Trava ausente —
  pus a minha. `git status` só com `mente/agora.json` (o painel), a outra mente
  com o `App.jsx` já commitado (`eadef55`, D3). `npm test` **verde de saída:
  188/188 suítes, 13/13 varredores.** `VERSAO` relida em `src/constantes.js`
  **antes** de datar qualquer comentário — `v9.265` em HEAD e na árvore, logo
  esta etapa sai **v9.266**. (H1 teve de redatar 32 comentários por não fazer
  isto; desta vez a outra mente não subiu no meio, mas a releitura custou nada.)
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **o bastão do `App.jsx`: NÃO TOMADO.** A etapa era medição e registro em
  `src/poder-de-classe.js`; o App só foi **lido**. A outra mente (K2) precisava
  dele para aplicar as quatro frases que W2 deixou prontas e transbordando —
  deixá-lo livre custou zero a esta etapa e destrava a dívida do outro lado.
- **backend (medição):** mediu os 12 contra o projeto inteiro, com um script
  descartável no scratchpad que corre os despachantes reais sobre as `HAB(...)`
  de `classes.js`. Cita arquivo e linha em cada veredito.
- **backend (registro):** as 12 entradas de `AGUARDAM` ganharam o campo `dono`
  e o `motivo` reescrito; o cabeçalho perdeu a lista dos sete assuntos e ganhou
  o resultado. **40 12 6** confere. Não tocou no App, nem em `constantes.js`,
  nem nos testes.
- **testes:** seção 9 de `teste-poder-de-classe.mjs` — exatamente 12 com `dono`,
  nenhuma das outras 28, forma `src/<arquivo>.js · <algo>`, **o arquivo nomeado
  existe no disco** (`existsSync`, resolvido por `import.meta.url` e não pelo
  cwd), e `semDono <= SEM_DONO_HOJE` (6), local ao teste. 196 asserções, 0
  falhas. Nenhuma asserção de H1 movida nem afrouxada.

### O número, e por que ele é menor

Dos 12: **6 já têm dono** (2 vivo, 4 parcial), **6 não têm**. Dos **sete**
assuntos, **quatro caíram**, e nenhuma linha de mecânica foi escrita para
descobrir isso:

- **contra-conjuração já acontece** — a reação `contramagia` (`reacoes.js:35`)
  é concedida por nome na ficha e a fiação está viva. **Contramágica cumpre
  hoje.** O que não existe é o inimigo *conjurar* — e isso é **decisão
  escrita** em `controle.js:26`, não buraco;
- **PM de volta tem dono vivo, mas não o que a linha dizia:**
  `sacrificarInvocacao` (`invocacoes.js:197`), não `gastarRecurso`
  (`combate.js:745`) — que é **export morto**, e a suíte já o travava;
- **clima tem motor vivo e semeável** (`rolarClima`), **sem leitor de número**:
  `palco.js` e `geografo.js` só o narram. Falta leitor, não mecânica;
- **a metade mental da Contra-Canção sai pela porta** que já existe
  (`removerPelaPorta`).

**Ficam quatro assuntos e seis habilidades:** marca, cura por turno, zona
persistente, e aura reativa sozinha na família.

### Decisões médias, com o motivo

1. **`dono` é campo, não prosa** — *"se é número, é tabela"* vale para endereço
   também. Motivo: um veredito escrito só no `motivo` não é legível pela suíte,
   e o que a suíte não lê apodrece. Com o campo, a catraca prova que o arquivo
   citado **existe no disco** — que é o que um rename silencioso quebra.
2. **A catraca dos sem-dono é `<=`, não `===`.** Motivo escrito no teste: um
   `===` ficaria **vermelho no commit que PAGA a dívida**. A suíte tem de
   aplaudir a descida e morder só a subida.
3. **As 40 continuam 40 — nenhuma saiu.** Contramágica cumpre e Foco Interior
   tem molde, mas **`dono` não autoriza ligar nada**: é endereço medido. Sair
   de `AGUARDAM` exige a ligação feita **e provada**, e isso é etapa própria.
   Afrouxar aqui seria usar o campo novo como porta dos fundos para esvaziar a
   lista sem pagar.
4. **A Fase H não fecha em H2 — encolhe.** A pauta autorizava fechar "se sobrar
   pouco". **Sobrou pouco, mas não sobrou nada:** quatro assuntos de mecânica
   real não cabem na fila automática, porque mecânica que muda o que o jogador
   vive é `pesado` pela tabela do `CLAUDE.md`. Escrevi **H3–H6**, uma por
   assunto, na ordem do mais barato ao mais caro — e o que de fato tinha dono
   virou item de "Aberto", não etapa de fase. Sete assuntos viraram quatro
   etapas: **a fase termina menor do que começou, que era o bom sinal.**
5. **H6 (zona persistente) leva trava escrita: não começa sem a palavra da
   pessoa.** Motivo: ela precisa de escrever em `grade.paredes`, e a grade
   **viaja no save** — formato de save é `pesado` explícito na lei da casa. A
   autorização da fase não cobre o que a etapa revelou de novo e grande.

### O que ficou (e virou item da fila, não etapa)

- **Quatro regras que apanham a habilidade errada**, apanhadas na medição e
  **não consertadas de propósito** — a etapa era medir. Uma delas **inverte a
  promessa**: a Maldição do Patrono aplica `enfraquecido`, e `combate.js:127`
  desconta o `danoReduzido` do dano que o alvo **recebe** — amaldiçoar um
  inimigo hoje deixa-o **2 mais duro**. As outras três são regex a apanhar
  palavra dentro de palavra: `chama` em "**Chama**do da Chuva" (põe
  `queimando`), `oração` em "C**oração** Tempestuoso" (abençoa o grupo), e
  `prote[çc]` que **não** casa "prote**gi**da" — esta última é a **mesma
  família** do defeito "protetoras" que a v9.265/H1 corrigiu, o que diz que a
  correção de lá tratou o caso e não a raiz.
- **Três ligações de uma linha**, medidas e não feitas (Foco Interior,
  Contra-Canção mental, Chamado da Chuva) — com o aviso de medir o que a
  terceira compra antes de a escrever: clima que ninguém lê é cenário.
- **Contramágica sai de `AGUARDAM` quando tiver prova**, e aí
  `TETO_DE_AGUARDAM` desce para 39. De quebra, um campo morto a enterrar:
  `funcao: "contramagia"` (`grimorio.js:142`) não está em `FUNCOES_DO_SISTEMA`.
- **Para a pessoa:** a única pergunta que é dela é a trava de H6 — se a zona
  persistente pode escrever na grade que viaja no save.

## 16/09 06:20 · v9.265 · H1 · a porta das habilidades de classe · commit `d99bab3`

- **estado inicial — e ele começa com um ciclo morto.** A trava
  `.claude/ciclo-em-curso` estava posta desde `00:25` (mais de cinco horas), e a
  árvore não estava limpa: **um ciclo H1 anterior morreu no meio, por limite de
  uso da API — não por falha.** `npm test` **vermelho em duas suítes**
  (`teste-arena.mjs`, `teste-guardas.mjs`, 4 asserções). Apaguei a trava velha,
  pus a minha, e tomei o bastão do `App.jsx` (ninguém o tinha). A outra mente
  fechou **W2** enquanto este ciclo corria (`cf91c7a`, `b92ffc0`) e subiu a
  `VERSAO` para **v9.264** — por isso H1 sai como **v9.265**, e não v9.264 como
  as três mãos dataram os comentários. Redatei os 32 comentários antes do
  commit: é exatamente a armadilha que o `CLAUDE.md` nomeia, e ela mordeu de novo.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.

### O que o ciclo morto deixou, e por que foi DESFEITO

Ele deixara **+43 linhas em `src/habilidades.js`**: uma forma nova (`abissal`) e
sete entradas em `GUARDAS`, com comentários bem escritos defendendo três coisas
novas — `valor` negativo como **preço**, `tipo: "amortece"` para dano recebido, e
`escopo` para guarda que cai no aliado. Terminar era uma saída legítima. **Não
era a certa, e as suítes vermelhas é que estavam com a razão:**

1. **`guardaDe` é classificador EXCLUSIVO.** `ehBuff` (`companheiros.js:161`)
   devolve `false` para quem é guarda, e o piloto escolhe guarda **antes** de
   buff. Pôr *Fúria de Batalha* em `GUARDAS` com `valor: -2` **apagaria o +2 de
   dano** que ela já entregava por `aplicarBuffDeHabilidade` e deixaria só a
   penalidade de defesa: a habilidade ficaria **estritamente pior**. A premissa
   escrita no comentário — *"um número com sinal trocado é o preço que faltava,
   sem uma linha de código nova"* — era justamente o erro. O DENTE 4 de
   `teste-guardas.mjs` diz isso em voz alta **desde a v9.232, com o motivo**.
2. **Quatro das sete linhas prometiam motor que ninguém escreveu.** O comentário
   afirmava que `amortecerDano` "passou a ler esta lista por `corteDeGuarda`" e
   que `erguerGuarda` "RECUSA quem tem escopo" — **`corteDeGuarda` não existe em
   lugar nenhum do projeto**, e nenhuma das duas fiações foi escrita. `muralha`,
   `contra_cancao`, `postura_defensiva` e `corpo_de_ferro` seriam erguidas e não
   fariam nada. Isto é *promete na ficha e falha na mesa* — **a própria doença
   que H1 existe para curar**, instalada dentro do remédio.
3. **`amortece` e `escopo` são mecânica nova** — dano recebido, alvo que não é o
   herói. Território de **H2**, que mede antes de construir. Terminar ali seria
   fazer H2 por dentro de H1, sem medição.

`git checkout -- src/habilidades.js`, suíte verde de novo (187/187), e H1
recomeçou limpo. **A forma `abissal` era a única parte sadia do lote e foi
embora junto** — ela volta barata como item de acervo quando alguém quiser.

### A etapa, em três mãos e na ordem certa

- **backend:** `src/poder-de-classe.js` (novo, 392 linhas) — `PODERES_DE_CLASSE`
  (8 entradas), `poderDe`, `temPassivoDeClasse`, `aplicarPoder(pers, hab, ctx)`
  e **`AGUARDAM`**. Mais as linhas de tabela nas casas que já existiam:
  `PRESSAS` (habilidades.js), `CONTROLES` (controle.js), `PORTADORES`
  (aflicoes.js), `resolve: true` nas duas portas de `condicoes.js`, e
  `dobraMovimento`/`ignoraTerrenoDificil` lendo **duas** fontes (dadivas.js).
  `temRegraPropria` ganhou a sétima família.
- **frontend:** `porHabilidadeDeClasse(h, pers, frase)` (`App.jsx:7941`), em
  `try/catch` com `calou`, e nos **DOIS** sítios do laço (`:13448` painel,
  `:13592` citada). Consertou de quebra os 90 endereços que as 87 linhas novas
  envelheceram em `check-acoes-do-jogador.mjs` e nas três suítes vizinhas.
- **testes:** `testes/teste-poder-de-classe.mjs` (novo, **177 asserções**), com
  a régua em tabela (`MEDIDA_DA_PORTA`) e os dentes dos dois lados — nenhuma
  linha órfã, nada fora da tabela vira poder (varrendo 593 habilidades), recusa
  por identidade de objeto, imutabilidade byte a byte, determinismo do alvo.

### O número honesto, e ele é menor do que a pauta previa

A pauta prometia **54 de 66**. A porta derruba **17 agora e provadas** (+3 de
subclasse de brinde, pelas mesmas linhas), e **`AGUARDAM` declara 40**. A conta
fecha porque a medição de v9.250 errou para mais: **9 das 66 já cumpriam** por
leitores que ela não enxergava (`seguraEmPe`, `temVozDeComando`,
`limiteDeInvocacoes`, `RX_SACRIFICIO`). 9 + 17 + 40 = 66.

**Uma porta que derruba 20 e declara 40 vale mais que uma que alega 54 sem
prova** — é a lição da Fase T, e é por isso que a etapa fecha assim em vez de
esticar o número. Das 40: **12 são os de H2** (mecânica nova, intocados de
propósito), **7 caem pela régua do golpe do App** (`HAB_OFENSIVA_RX` procura
palavras de violência e "sopro elemental em cone" não tem nenhuma — já é item
próprio na pauta), **5 são famílias de força zero**, e **16 pedem número que
nenhuma tabela cobra ainda**.

### A catraca — é o que sobra quando a etapa envelhecer

`TETO_DE_AGUARDAM = 40`, com folga **zero**: hoje `AGUARDAM.length === 40`.
Quem escrever amanhã uma habilidade que promete e não cumpre **fica vermelho no
dia em que a escreve**; quem pagar uma dívida **abaixa o número no mesmo
commit**. A suíte também exige que toda entrada tenha motivo (≥25 chars) e
data, que nenhum nome seja fantasma (todos existem no acervo) e que a classe
declarada seja a real. **A lista só encolhe.**

### Decisões médias, com o motivo

- **Desfazer em vez de terminar** o lote do ciclo morto — os três motivos acima.
  A parte sadia (`abissal`) foi junto porque separá-la custaria mais que
  reescrevê-la, e ela não é da fase.
- **Fechar H1 em 17 em vez de esticar para 54.** O resto exige ou mecânica (H2),
  ou consertar `HAB_OFENSIVA_RX` (item próprio), ou números que nenhuma tabela
  cobra — cada um é outra etapa, e enfiá-los aqui produziria exatamente a
  promessa vazia que a catraca existe para impedir.
- **Cinco asserções viradas do avesso, não afrouxadas.** Diziam que *Purificar*
  e *Palavra de Coragem* aguardavam resolvedor; o resolvedor chegou. Cada uma
  passou a exigir o **cumprimento** com o motivo e a data escritos, a sabotagem
  de T4 ganhou **dois** substitutos (uma que prova que `coberturaDasCondicoes`
  lê o campo, outra que prova que `removerPelaPorta` o lê também), e o controle
  negativo de `temRegraPropria` **trocou de habilidade** (Passo do Vento →
  *Palma dos Sete Ventos*, dano puro) em vez de sumir.
- **`Palavra de Coragem` fica nas duas listas, de propósito** — o medo sai por
  esta porta, o PV temporário não existe. Meia promessa cumprida é meia dívida.
  Em vez de afrouxar a não-sobreposição, a suíte trancou a exceção por
  **igualdade** (`MEIA_DIVIDA`): qualquer outra sobreposição fica vermelha, e no
  dia em que o PV temporário nascer esta linha cobra a saída da entrada.
- **Sem bloco de prompt novo.** `PODER_DE_CLASSE_PROMPT` não existe de
  propósito: `HABILIDADES_PROMPT` já diz "o sistema resolve, você narra" e cada
  resolução devolve a `nota` por turno. **O teto de prompt é sagrado** e somar
  bloco estático é proibido.

### O que ficou

- **H2 espera**, com os 12 já nomeados e datados dentro de `AGUARDAM` — a
  medição da próxima etapa começa com a lista na mão, não do zero.
- **As 7 da régua do golpe** (`HAB_OFENSIVA_RX` com `ataca` e sem `ataque`) já
  eram item da pauta e continuam lá; agora com os nomes ao lado.
- **Bastão do `App.jsx` devolvido** ao fim da etapa 2. A outra mente não foi
  tocada: nenhum vermelho dela, nenhum arquivo dela no commit.

---
## 16/09 03:10 · v9.263 · X4 · a conta do que mudou · **a Fase X fecha** · commit `8d402ed`

- **estado inicial:** HEAD `4619533`, VERSÃO **v9.261** lida do arquivo.
  **Sem trava do sistema — pus a minha.** `npm test` **187/187 suítes verdes ·
  13/13 varredores limpos**, build limpo. A outra mente está rodando **W1** (a
  frase que se monta) com a trava dela posta; **não tomei o bastão do
  `App.jsx`** — X4 é medição, e leitura não pede bastão.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **testes (duas mãos, em arquivos separados, no mesmo turno):** a primeira, o
  **eixo da frase** — `acoes-do-jogador.mjs`, `sonda-turno-esteril.mjs` e o par
  `teste-`/`check-`; a segunda, a **régua de B1** — `regua-combate.mjs` e
  `teste-regua.mjs`. Nenhuma tocou no arquivo da outra.
- **nenhuma linha de produção escrita.** O único arquivo de `src/` tocado foi
  o bump de `VERSAO`.

### A resposta, e ela é um "não mudou" honesto

Mesma política fixa de X1 — estrada, 1 inimigo não-ágil, herói corpo a corpo
nível 3, 7 turnos declarando "Ataco &lt;nome&gt;" e nada mais:

| | 15/09 (X1) | 16/09 (depois de X2) |
|---|---|---|
| turnos estéreis | **7/7** | **7/7** |
| rolagens | **0** | **0** |
| revides | **0** | **0** |

**E tinha de dar isso.** X2 escreveu, com todas as letras, que **não encurtou
a caminhada** — *"ela tornou a caminhada visível antes do clique, que é outra
coisa"*. A régua confirma a palavra dela em vez de a contradizer, e uma régua
que confirma o que a etapa prometeu vale mais do que uma que encontra um ganho.

**O que mudou está na sessão A′, e é medível:** os mesmos 7 turnos agora com o
clique **impedido antes de ser gasto**, com a distância, o alcance e os metros
que faltam ditos na tela. **Sete turnos perdidos viraram sete turnos que o
jogo avisou que seriam perdidos.**

**E a honestidade que fecha este eixo:** a sessão B — o jogador que anda em vez
de insistir — dá **2 turnos andando + 5 golpes, 0% estéril, 5 rolagens**. Só
que **já dava isso em X1**. Andar sempre funcionou: é geometria, não botão.
**Nenhum dos dois números é ganho de X2**, e vendê-lo como ganho seria a conta
mentindo a favor — que é exatamente o que X3b mandou X4 não fazer.

### O eixo novo de X3b: estéril e mudo são taxas OPOSTAS

A sessão A″ mede os mesmos sete turnos pelo eixo da frase:

- `taxa_esteril` = **7/7 = 100%** (turnos sem um número mudar) — o eixo de X1
- `taxa_muda` = **0/7 = 0%** (turnos sem **uma linha** sequer)
- `taxa_sem_narracao` = **7/7 = 100%** (turnos sem uma frase de **evento**)

As duas primeiras são **opostas na mesma sessão**, e **a distância entre elas é
inteira de recusa**. Das 14 linhas dos 7 turnos: **7 eco do jogador, 7 recusa,
0 narração de evento** — e **0 chamadas ao Narrador** (o `return true` de
`:11871` antecede o `enviar` de `:11932`). O jogador lê o tempo todo e nada
lhe é narrado.

**O alerta de X3b estava certo, e agora tem número:** sem separar a recusa, a
medida daria **0% de turnos mudos** onde a resposta honesta é **100% sem
narração**. Por isso nasceu `NAO_CONTA_COMO_FRASE`, irmão do
`NAO_CONTA_COMO_NUMERO` de X1, com cinco exclusões e o motivo de cada uma — a
recusa, o eco do jogador, o telegrama, a rolagem `🎲` (que sai atrás de
`mostrarRolagens`, desligado por omissão) e a nota ao Narrador.

### O funil — e X3b errou os dois números, para menos

`pushMsgs` é `App.jsx:7499`: **o endereço confere**. O resto não:

| | X3b disse | X4 mediu |
|---|---|---|
| funções que falam no combate | 13 | **14** (11 de núcleo + 3 de borda) |
| formas de recusa | 15 | **18 chamadas · 25 formas · 7 famílias** |

As 57 chamadas do funil: **frase de mesa 36 (63,2%) · telegrama 12 (21,1%) ·
recusa 9 (15,8%)**, e **22 das 57 nascem fora do React** (35 ainda só existem
dentro do `App.jsx`). A maior boca é `resolverRevide` sozinha, com 29 das 57.
A maior família de recusa é `alcance`, com 6 chamadas e 13 formas — e apareceram
**duas famílias que a pauta não nomeava**: *conjuração travada* (armadura, forma
animal, grimório) e *condição que prende*.

O núcleo dos 11 não foi contado no olho: saiu de **ponto fixo sobre o grafo de
chamadas**, a partir das guardas explícitas de `combateRef.current`. Pelo
precedente de X1, **a medição mandou na pauta**.

### A régua de B1: o que ela NÃO pode medir, dito em vez de inventado

A pessoa pediu *"a régua de B1 refeita com o jogador agindo"* e acrescentou a
única instrução que importava mais que o número: **se não der para simular
honestamente, diga em vez de inventar.**

Não dá, e a razão é estrutural. **A régua não tem tabuleiro:**

- não importa `src/grid.js` nem `src/golpe.js` (imports em
  `regua-combate.mjs:193-206`);
- passa **`grade: null`** ao motor (`:887`), e `grid.js:422` abre com
  `if (!g) return { ok: true, penalidade: 0 }` — **sem grade, os dois lados
  alcançam sempre**;
- o passo 1 do laço era `if ((heroi.vida || 0) > 0)`: a única pergunta era
  *"está de pé"*, nunca *"alcança"*.

**Logo a linha de 1,4% nunca mediu "o motor sozinho": ela sempre pressupôs um
jogador que age todo turno.** A régua é o **limite otimista**, e o jogo real é
**pior** que ela — não melhor, que era a suposição embutida na pergunta.
Está escrito como bloco exportado `TABULEIRO_NA_REGUA`, no molde do
`ADVERSARIO_NA_REGUA` que N1b deixou para o mesmo tipo de buraco.

**Medir o preço real exige a grade dentro da régua** — montar planta,
posicionar, caminhar com orçamento em metros, `alcanca` antes de cada golpe
**dos dois lados**. Isso é um **simulador de tabuleiro: órgão novo, logo
`pesado`, logo da pessoa.** Ficou como proposta em
`TABULEIRO_NA_REGUA.paraMedir`, **não construída**.

### O preço da caminhada — a primeira ponte entre X1 e B1

O que **deu** para medir honestamente foi o custo de o herói não poder golpear.
`rodadasDeCaminhada = k` cala o herói nas primeiras k rodadas; **`k = 0` é o
default e é byte a byte** (dente próprio em 4 famílias, e a asserção existente
de 52,1% · 25,88 · 1,790 continua verde). No `justo` com
`comAdversario: false`, 4 famílias × 500 = **2000 sementes por degrau**:

| k | vitória | PV do grupo | quedas |
|---|---|---|---|
| 0 | 51,8% ± 2,2 | 25,90 | 1,785 |
| 1 | 39,6% ± 2,1 | 18,78 | 2,087 |
| 2 | 29,8% ± 2,0 | 12,86 | 2,332 |
| 3 | 22,7% ± 1,8 | 8,85 | 2,503 |

**Uma rodada de caminhada custa ~9,7 pontos de vitória**, −5,68 PV de grupo e
+0,24 queda (degraus −12,3 · −9,8 · −7,0, com rendimento decrescente). Na moeda
de B2 — a escada de `CATRACA_DE_UMA_VIDA`, medida no mesmo molde, ~2,9 pontos
por ponto de dano — **um turno andando ≈ 3,3 pontos de dano por golpe, quase
todo o teto de +4 que aquela escada aponta.** É a primeira vez que a geometria
que X1 achou aparece na moeda do balanceamento.

**Os degraus não foram escolhidos, foram derivados:** a suíte importa
`DESLOCAMENTO_PADRAO` (`grid.js`) e `ALCANCES` (`golpe.js`) e **refaz** o "2 a
3 turnos" de X1 — (12,0−1,5)/9 → 2 e (25,5−1,5)/9 → 3. Se o passo ou o alcance
mudarem em `src/`, o dente fica vermelho sozinho.

**Não medi no jogo de hoje (Adversário ligado), e medi a razão em vez de a
afirmar:** o `justo` está em 1,4–1,8%, **saturado no piso**. Com k ≥ 1 a
vitória cabe dentro da própria margem (0,4 ± 0,6 · 0,0 ± 0,6 · 0,0 ± 0,6) —
**indistinguível de zero**. Isso virou dente; a escada de lá é `pendente`.

**E o contrapeso, que é achado novo e baixa o preço:** `moverPara`
(`App.jsx:14500-14568`) **nunca chama `fecharMeuTurno`** — o próprio sítio
escreve *"o que fecha o turno é AGIR"*, e os quatro chamadores de
`fecharMeuTurno` (`:11929`, `:13453`, `:13543`, `:13594`) não incluem o
movimento. Somado ao `semAlcance` de graça que X1 mediu: **enquanto o herói
anda, a oposição também não age.** Então o preço real está **entre zero e os
9,7 pontos**, e 9,7 é a **ponta cara**. Está dito na tabela, no cabeçalho, e
ficou `pendente` — não virou limiar.

---

## A FASE X DE PONTA A PONTA — o que o jogador não conseguia, e o que consegue

**Em 15/09, quando a fase abriu**, o `jogo` jogou e contou: dos 20 botões do
painel de Ações, **nenhum era de combate**. `Atacar` não atacava — **digitava
`"Ataco "` na caixa de texto**. Três ataques declarados sem ambiguidade num
combate aberto deram **zero rolagens**, e sete turnos fecharam com os mesmos
PV 20/20, PM 6/6, XP 89/300. A lei da casa estava invertida no pior lugar:
*o Mestre é código, e a IA só narra* — **mas quem decidia se o golpe
acontecera era a IA.**

**O que ele NÃO conseguia fazer, e hoje consegue:**

1. **Disparar o próprio golpe.** `Atacar`, com a luta aberta, **ataca**: monta a
   frase canônica, passa pela porta única `declararGolpe` (`:11851`), e
   `src/golpe.js` — módulo puro, provado em Node — **decide antes de qualquer
   efeito**. A catraca desceu com o fato: `TETO_SEM_MOTOR` **7 → 6**. *(X2)*
2. **Saber o preço antes de pagar.** O botão nasce **impedido** e a linha lê
   *"Longe demais — Halvard a 3 m, faltam 1,5 m. Aproxime-se primeiro."* — o
   número conferido vivo na campanha e casa a casa contra `vereditoDoGolpe` em
   Node. Antes, a recusa só chegava **depois** do clique. É a lei do veredito
   antes do clique, aplicada ao combate. *(X2)*
3. **Não perder o turno quando o Mestre cai.** Se o motor rolou, **o resultado
   não se descarta**: fica guardado e é narrado quando o Narrador voltar. Antes,
   uma queda da IA jogava a ação fora — e, pior, uma retentativa **re-rolava um
   resultado ruim**. *(X3)*
4. **Ter uma régua que não evapora.** Antes, cada medição de combate morria no
   scratchpad. Hoje a fase deixa quatro instrumentos permanentes:
   `acoes-do-jogador.mjs` (a tabela), `sonda-turno-esteril.mjs` (a régua),
   `check-acoes-do-jogador.mjs` (o varredor que impede a tabela de apodrecer,
   agora com 11 dentes) e `teste-acoes-do-jogador.mjs` (**155 asserções**,
   eram 108). *(X1, X4)*

**E o que a fase descobriu que ninguém tinha nomeado** — o achado que vale mais
que qualquer das quatro linhas acima: **a trava não era o botão, era a
geometria.** `posicionar` abre a luta a **12,0 m (taverna) a 25,5 m
(masmorra)**, o corpo a corpo alcança **1,5 m**, e **10 de 10 plantas recusam
no turno 1**. `resolverAtaqueJogador` sempre existiu e sempre foi bom; o golpe
morria antes dele. Consertar só o botão teria dado ao jogador um *"longe
demais"* dez vezes seguidas — e **pareceria que o conserto falhou**.

### O que ele CONTINUA não conseguindo fazer

1. **Chegar perto sem gastar 2 a 3 turnos andando.** X2 tornou a caminhada
   visível; não a encurtou, e disse isso. **Agora ela tem preço medido:
   ~9,7 pontos de vitória por rodada** — e é o número que falta a esta casa
   decidir se aceita.
2. **Andar pelo tabuleiro escrevendo.** Não há **porta do campo em `turno.js`
   — 17 portas, nenhuma delas do tabuleiro**. Hoje `vou até K14` numa luta cai
   na porta `destino` (`:238`), que **não tem guarda `!emCombate`**, vai ao
   resolvedor de cidades do mapa-múndi, escreve `[DESTINO NÃO RECONHECIDO]` e
   entrega à IA: **ninguém anda, e gasta-se uma chamada ao Mestre para não
   andar.** Pedido por E2 e de novo por W1; continua em "Aberto".
3. **`Esquivar`, `Empurrar`, `Derrubar`, `Ajudar`.** Quatro botões de combate,
   **zero motor**. X2 deixou-os de fora **de propósito**: ali não falta fiação,
   **falta mecânica**, e enfiá-los na porta de `Atacar` seria fingir que
   existem. São a **Fase Y**, já aprovada, na ordem Empurrar/Derrubar →
   Esquivar → Ajudar.
4. **Passar a vez sem chamar o Mestre.** Não há botão de esperar desde a v9.13
   (`App.jsx:3133`) — e é o que W1 mediu como o item mais barato e que mais
   paga. Continua em "Aberto".
5. **Ouvir a luta.** Nos sete turnos da sessão A o jogador lê **catorze linhas
   e zero narração de evento**. X3b já tinha mostrado por que: **se o Mestre
   calasse hoje, a cena sobreviveria como extrato bancário; a luta, não.**

### Os dois achados de mecânica quebrada de X3b — X4 não os tocou

Confirmado que **não são desta etapa**, e os dois continuam em "Aberto" como
`médio`, intactos. Mas X4 tem algo a dizer sobre cada um:

- **o reforço entra na luta sem `x`/`y` nem iniciativa** — é **invisível para a
  régua por construção**: sem grade, `alcanca` devolve sempre `ok`, e um
  combatente sem posição não tem como doer ali. Só o jogo o sente.
- **a queda de companheiro é silêncio absoluto** — X4 o **confirma por
  ausência**: o funil tem linha para a queda do herói (`:14218`) e para **treze**
  eventos de companheiro (`:14061` a `:14260`), e **nenhuma** para o
  companheiro que chega a zero.

### Decisões médias tomadas (com o motivo)

- **Corrigi dois números da pauta para cima** (13 → 14 chamadores, 15 → 18/25
  recusas). **Motivo:** os de X3b eram prosa de diário, não número provado — e o
  precedente de X1 é explícito, *"a medição manda na pauta, não o contrário"*.
- **`k = 0` como default da caminhada na régua, e byte a byte provado.**
  **Motivo:** mudar a régua muda **os dois lados** de toda comparação passada;
  a história de B1/B2/T1 não pode passar a mentir por causa de X4.
- **Medi a saturação do piso em vez de a afirmar.** **Motivo:** *"um limiar em
  cima de um teto não mede nada"* já é lei do cabeçalho da régua — mas dizer que
  algo está saturado sem medir é a mesma opinião com confiança que a casa proíbe.
- **O custo da caminhada ficou `pendente`, não virou limiar.** **Motivo:** o
  achado de `moverPara` mostra que 9,7 é a ponta cara de uma faixa, e faixa não
  vira catraca.
- **Não tomei o bastão do `App.jsx`.** **Motivo:** X4 é leitura; a outra mente
  está em W1 e o bastão livre vale mais que a comodidade.

### O que ficou

- **Um achado novo, `leve`, para "Aberto":** a recusa de alcance imprime **"está
  a 17 m, em na vala — longe demais"** (`grid.js:428` põe `em ` antes de um
  `nomeDoLugar` que já traz a preposição; sem nome, ficam dois espaços). Saiu
  sete vezes seguidas na sonda. **Não a consertei de carona** — ela é a mesma
  frase de `LINHAS_DO_GOLPE` e da catraca dos 54 caracteres que W1 pediu, e
  consertá-las em separado criaria a segunda cara da mesma linha.
- **Uma proposta `pesada` para a pessoa:** a grade dentro da régua — o
  simulador de tabuleiro que mediria o preço real da caminhada. Escrita em
  `TABULEIRO_NA_REGUA.paraMedir`, **não construída**.
- **Três coisas que X4 não conseguiu medir**, declaradas na tabela e impressas
  pela sonda: quantas linhas saem num turno **real** (a sonda não roda React);
  a voz das **5 chamadas mistas** (listas montadas em tempo de execução); e
  **quanto a IA de fato narra** — isso seria medir a rede, e a Fase X mede o que
  o código diz sozinho.
- **Nada foi rebalanceado, nada foi ligado, nenhuma catraca foi afrouxada.** O
  dente 1 de `CATRACA_DE_UMA_VIDA` continua `pendente`, como N1b o deixou.
### A nota que a casa exige: o meu bloco de pauta saiu no commit da outra mente

**Aconteceu a terceira vez, e desta vez do outro lado.** Enquanto eu media, a
outra mente fechou **W1** e commitou `mente/pauta.md` — onde ela tinha escrito,
legitimamente, o pedido de W1 ao motor (a pauta do sistema **é** o canal por
onde o desenho pede regra). Só que o meu bloco de X4 já estava no arquivo, e
**`63e0667` — um commit que fala do turno como gesto — levou dentro o veredito
inteiro da Fase X**, sem o mencionar.

**Não reescrevi a história:** `origin/main` já estava em `2afce4c` quando
descobri, e `push --force` num ramo que faz deploy para jogadores reais é arma
apontada para o vizinho. A lei da casa diz o que fazer nesse caso e foi o que
fiz — **repor a verdade no diário e num commit seguinte, e seguir**. O bloco de
X4 na pauta agora traz uma linha dizendo onde ele foi publicado.

**E a lição, porque as três vezes têm a mesma forma e nenhuma foi por `add -A`:**
`git commit -- <caminhos>` fecha a janela entre o *seu* `add` e o *seu* `commit`,
mas **não** protege um arquivo que as duas mentes editam ao mesmo tempo — ali o
caminho nomeado leva tudo o que estiver dentro dele. `mente/pauta.md` é o único
arquivo da casa nessa situação por desenho: é meu, e é onde o desenho me pede
coisas. **O bastão resolveu o `App.jsx`; a pauta não tem bastão.** Fica como
achado para a pessoa decidir — talvez um `mente/pedidos-ao-sistema.md`, que o
desenho escreve e o ciclo consome, custe menos que uma trava nova.

- **O que ficou meu neste commit, e é o que sobrou de `pauta.md`:** o fecho da
  Fase X, a correção da versão e o item novo do *"em na vala"*.

---

## 16/09 02:25 · v9.261 · X3b · o que a voz da casa cobre · commit `30a6b3d`

- **estado inicial:** HEAD `4221f16`, VERSÃO **v9.260** lida do arquivo (a
  outra mente a bumpou em E2 durante este ciclo; bumpei para **v9.261** em
  cima do que estava no disco, não do que a pauta dizia). **Sem trava — pus a
  minha.** `npm test` **187/187 suítes verdes · 13/13 varredores limpos**,
  build limpo. A outra mente rodou **E2** (o endereço do tabuleiro) e fechou
  no meio do ciclo (`e192188`, `e791646`); a árvore voltou limpa antes do meu
  commit e **não precisei de `so-o-meu.sh`** — nenhum vermelho de lado nenhum.
  **Não tomei o bastão do `App.jsx`:** X3b é retrato, e leitura não pede bastão.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** o retrato da **oferta** — `arena.js` inteiro mais 22 módulos
  puros com prosa de combate, os 14 eventos com arquivo:linha e a frase
  literal. Achou três que não estavam na lista (`masmorras.js`,
  `adversario.js`, `grid.js`).
- **frontend:** o retrato da **demanda** — o funil de `pushMsgs`
  (`App.jsx:7499`) e as treze funções que o chamam dentro do combate, os 14
  eventos classificados em **código-frase / código-telegrama / IA**, mais a
  contagem à parte das **15 formas de recusa**.
- **nenhuma linha de produção escrita.** X3b é medição; o único arquivo de
  `src/` tocado foi o bump de `VERSAO`.

### O número, e ele decidiu a fase

A arena tem linha escrita em **10 dos 14** eventos. Mas **molde reusável em
campanha que a campanha ainda não tem: 3 de 14 (21%)** — e os três (acerta,
erra, crítico) são **um molde só**, o do golpe. **Dos 5 que a pessoa perguntou
por nome** — condição, queda, morte, reviravolta, chegada de inimigo —
a arena cobre **0 de 5**.

A razão é estrutural, e é o achado do ciclo: **a voz da arena não é uma fonte
independente.** Dos 8 moldes que ela escreve, 2 são reflexivos (`se recompõe`,
`firma`) e não sabem nomear um terceiro — e o caso normal da campanha é
**grupo**. Os outros 5 ela **empresta** de módulos da campanha (`tickEfeitos`,
`expirarGuardas`, `absorverDano`, `testeConcentracao`, `firmarEfeito`), e o
`App.jsx` **já empurra exatamente os mesmos**. O empréstimo só existe onde a
campanha já tinha escrito. A cobertura do duelo é o retrato da campanha,
devolvido.

- **decisão tomada, e ela encolhe a proposta: X3c está CANCELADA.** A razão
  não é o número sozinho, é a contradição que o número revela: **X3c se
  proibia de inventar prosa nova** (*"sem inventar uma linha de prosa nova"*),
  e o reuso disponível cobre **um** dos 14. Cumprir a promessa seria escrever
  prosa nova sob o nome de reuso — o código fingindo ser a IA, que é o
  próprio limite que a etapa escreveu para si. **A Fase X fecha em X4.**
- **a honestidade contrária, registrada de propósito:** o golpe é o evento
  mais frequente (3 a 6 por rodada), então em **volume de linhas** a cobertura
  não é 21%. Só que o golpe **já tem string** no `App.jsx`
  (`⚔ Halvard → Bandido: 9 de dano · Bandido 11/20`) — trocar telegrama por
  frase é reescrever uma linha que existe, não é *"o turno se completa quando
  o Mestre cala"*. É outra etapa, menor, e de forma. Não estiquei X3c para
  caber nisso.
- **o limite que era lei de X3c continua valendo e não foi tocado:** valia
  **só em combate**; fora dele a prosa **é** o conteúdo e ali trava, como a
  pessoa decidiu.

### O que ficou

**Sete achados novos foram para "Aberto"**, cada um do tamanho que tem e
nenhum vestido de reuso — dois deles são mecânica quebrada, não prosa:

- **médio ·** o **reforço entra na luta sem lugar no tabuleiro**: `montarGrid`
  não roda de novo com a luta aberta (`App.jsx:8928`, `:9007`), e `alcanca` /
  `moverInimigos` passam a receber um combatente sem `x`/`y` nem iniciativa.
- **médio ·** a **queda e a morte de companheiro são silêncio absoluto**
  (`App.jsx:13967`) — o herói que cai tem quatro frases; o aliado ao lado
  dele, nenhuma, nem nota ao Narrador.
- **leve ·** a **salvaguarda de fim de turno que falha é muda**, e
  `condicoes.js:576` **já calcula** a linha que ninguém consome.
- **leve ·** a **virada de chefe nunca dispara para um herói de arma** —
  `virarChefeSePreciso` só é chamada de `resolverHabilidadeOfensiva`.
- **leve ·** **`ultimoDano` escrito em nove sítios sem um leitor**.
- **leve ·** a **arena descarta a linha boa da guarda** (`habilidades.js:356`,
  que o App usa) e escreve outra por cima — duas frases para o mesmo evento.
- **leve ·** a **condição tem prosa de saída e não tem prosa de entrada**.

**Para X4**, deixei o mapa do funil (`pushMsgs` e os treze chamadores), um
eixo novo (*turnos sem uma frase*, que não é a mesma taxa de *turnos sem um
número*) e uma correção de escopo: **15 formas de recusa** têm frase no
caminho de combate, e recusa **não é** narração — X4 tem de contá-las à parte
para não inflar o próprio número.

**Nada foi rebalanceado, nada foi ligado, nenhuma lei foi afrouxada.**

---

## 15/09 22:16 · v9.259 · N2 · a escada da inteligência · commit `dab5caa`

- **estado inicial:** HEAD `25cd20f`, VERSÃO **v9.258** lida do arquivo;
  `npm test` verde, build limpo, **árvore limpa**. **Sem trava — pus a minha.**
  **Não tomei o bastão do `App.jsx`:** N2 não liga nada, e a etapa inteira
  coube em `src/*.js` e `testes/`. A outra mente rodou **E2** (o endereço do
  tabuleiro) na mesma árvore o ciclo inteiro, em `grade-de-batalha.jsx`,
  `formas.md` e `check-formas.mjs` — **nenhum vermelho de lado nenhum**, e o
  commit levou só os meus seis caminhos.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** `src/degraus.js` (a escada, as seis tabelas, `degrauDaFicha`,
  `degrauDaCriatura`, `intencoesAte`, `enxerga`), `degrauMinimo` nas 46
  intenções, campo novo no bestiário com transporte em `completarInimigo`.
  Provou a inércia contra `git show HEAD:` em **42.093 casos, 0 divergências**.
- **testes:** `testes/teste-degraus.mjs` (**113 asserções**), três sabotagens
  que mordem, e a absorção do que o backend deixara provisoriamente em
  `teste-adversario.mjs` — com o motivo escrito no arquivo, como manda a lei.
- **medição:** a previsão com a régua de N1b, 3 cenários × 4 famílias × 1000,
  pelo caminho que o App usa. Instrumento validado contra a régua do projeto
  (600 combates, 0 divergências).

### O que N2 é, e o que N2 deliberadamente não é

A escada **existe e não decide nada**. Quem passa a decidir por ela é N4, e
isso não é timidez: ligar a escada é mudar o combate de campanha viva, e a
pessoa pediu a tabela antes do motor. A suíte prova a inércia **como
propriedade**, não como sorte — **832 situações em que filtrar por degrau daria
outra resposta, e não deu**.

O desenho é da pessoa (15/09) e foi cumprido letra a letra: `pensa` virou
degrau, cada intenção declara o nível mínimo, e **o peso deixou de ser ranking
global** (está escrito no comentário da tabela; a troca em `consultarAdversario`
é de N4). Cinco degraus, as 46 em **13 / 12 / 13 / 6 / 2**, e no topo só as
duas que a pessoa nomeou.

### Decisões médias, com o motivo

- **A escala 0–3 resolveu-se por FAIXAS, não por um degrau por valor.** N1 mediu
  que os oito prontos ocupam 0, 1 e 3, com o 2 vazio — um degrau por valor
  nasceria com metade da escada inalcançável. A definição que ficou escrita no
  código: **um degrau só é morto quando fonte nenhuma o alcança**, e a fonte da
  criatura alcança os cinco. `ATRIBUTO_MAX` ganhou com isso o **primeiro leitor
  de verdade** que tem desde que existe — o item aberto que previa exatamente
  isto está fechado.
- **O companheiro não ganhou campo novo, e isso foi escolha de peso.** Ele não
  tem `atributos` nenhum; criá-los é campo em ficha viva e em todo save, que é
  **pesado** e não cabia numa etapa de tabela. Ele recua pelo `atributoChave` da
  classe — que já separa Mago de Guerreiro sem campo novo —, por tabela
  nomeada, e pelas **mesmas** faixas. Nenhuma das 12 classes chega ao topo pelo
  recuo, o que é a leitura honesta: cabeça de companheiro não é cabeça de chefe.
- **`brilhante` não se herda, declara-se** — e esta é de princípio, não de
  número. `ameaca` mede **perigo**, não **cabeça**: o Golem de Pedra é `elite` e
  não pensa. Herdar o topo é **exatamente** como `calar_a_magia` virou tirano:
  todo nome que o Narrador inventa nascia com a mente mais afiada da mesa.
  Dez das 27 declararam; o Comandante herda `treinado` e a Sentinela declara
  `bruto`, e **as duas `elite` deixam de ser a mesma cabeça** — o buraco que N1
  apontou nominalmente.
- **`menteDaCriatura` não foi substituída, e a convivência ficou escrita.** Ela
  responde **que tipo** de mente (besta · morto · pensa, que alimenta
  `ehBicho`/`ehMorto`); o degrau responde **quanta**; e existe **um único
  sítio** que computa degrau. Duas classificações de cabeça em dois lugares é a
  doença que esta casa já conhece, e a saída não foi apagar uma — foi dar a
  cada uma a sua pergunta.
- **Três comentários voltaram ao backend porque descreviam um mecanismo que a
  medição mostrou ser outro** (peso leve, zero lógica): o do Colosso em
  `bestiario.js`, que explicava a declaração por um caminho que só existe **com
  o `desc`** — e `degrauDaCriatura` roda com nome + ameaça; o teto da ficha, que
  dizia "custa 5" quando `tetoAtributo` chega a **8 no nível 20**; e o da
  convivência, que agora carrega o limite medido. **Comentário que mente é pior
  que comentário que falta** — quem o lê decide com ele.

### O número que julga a fase, e ele não é o que a fase esperava

**No `justo`, a vitória iria de 1,40–1,80% para 86,70–87,70%.** É **boa demais**:
10,8 margens acima do teto de 65%, e **mais generosa com o grupo do que o
inimigo não ter piloto nenhum** (51–54%). Os três dentes da
`CATRACA_DE_UMA_VIDA` ficam vermelhos, agora todos pelo lado do excesso — e
**nenhum limiar foi afrouxado**. `duro` 0,0% → ~31% (as famílias **discordam**
ali a n=1000: esse número ainda mede resorteio); `brando` continua 100%, e as
12 quedas em 4000 de N1b viram 0. **A saturação continua** — era 0,0 · 1,6 ·
100, passa a 31 · 87 · 100: o `justo` não volta a ter resolução nos dois
sentidos, **muda de encosto**. A ressalva de N1b segue de pé.

**E a promessa de que distribuir por degrau "acorda o acervo morto" está
desmentida nesta régua: o acervo encolhe** — de 8 intenções eleitas para **2**.
A causa é estreita e está medida: **na rodada 1 do `justo` só 2 das 46 disparam**
— a do topo e a da rede, sem nada entre elas. Tirar o topo entrega a rodada ao
chão, que mira o primeiro da lista, que é o herói — o único que não morre ao
cair. Não é que o inimigo fique burro: **ele passa a bater onde o dano se
perde.** E quem tranca o acervo é a **aderência**, não a escada: sem a memória,
a eleição por degrau daria **8 distintas**.

**Medir antes de ligar era o ponto.** Se N2 tivesse entregado a tabela e
seguido, N4 nasceria acreditando que tirar o tirano resolve — e a régua só
diria o contrário depois de o combate de campanha já ter mudado.

### O que ficou

- **Para a pessoa:** a pergunta de N1b — *quanto do alvo tático você quer
  manter?* — passa a ter número nas três saídas, e está escrita em "Para a
  pessoa decidir". **N4 não anda sem ela.**
- **Aberto, novo:** `resist: ["fisico"]` está declarado em quatro criaturas e a
  mesa **nunca o vê** (`danos.js:73` curto-circuita antes de olhar `resist`) —
  0 de 300 combates de diferença. É o padrão do Troll da v9.152. **Não foi
  consertado de carona:** ligar resistência física endurece o combate, e a Fase
  N está exatamente a medir dureza — entra sozinho ou some dentro de outro
  número.
- **Aberto, atualizado:** o `desc` que `completarInimigo` não copia deixou de
  ser estimativa — **com `desc` são 18/27 em `pensa`; sem, são 19**, e o
  Colosso é a única diferença.
- **Herdado por N4, escrito no código:** `pensa` é binário e **vence a
  declaração do bestiário** — o Lich, `brilhante` declarado, não corta a magia e
  é o inimigo mais fácil da régua inteira (97–98% de vitória do grupo). A
  escada deixa passar; quem barra é a porta antiga.

## 15/09 17:03 · v9.257 · X3 · o turno guardado · commit `e430a12` (ver a nota do fim)

- **estado inicial:** HEAD `0a5972f`, VERSÃO **v9.255**; `npm test` verde,
  build limpo. A árvore tinha só arquivos da outra mente (o `regente` fechando
  **K1**). **Sem trava — pus a minha.** **Tomei o bastão do `App.jsx`** às
  19:31 UTC, para a mão do `frontend`; devolvido ao fechar este bloco.
  A outra mente bumpou a VERSÃO para **v9.256** no meio do ciclo (K1), então a
  minha é a **v9.257** — lida do arquivo, como manda a lei.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** `src/guardado.js` — a tabela dos sete silêncios, o selo do turno
  já resolvido, a impressão determinística do envelope, a trava e a conta das
  tentativas. 82 asserções na prova dele, zero rede.
- **frontend:** a fiação em `App.jsx`, toda em `calou` — o guardado no save e
  no load, o retry mandando o envelope preso, as **três** portas do declarar
  travadas, o técnico fora da tela e íntegro no console.
- **testes:** `testes/teste-guardado.mjs` (102 asserções) e
  `testes/check-guardado.mjs` (a catraca, cravada em **9** envelopes).

### O que passa a ser guardado, e por que isto é regra e não conforto

O motor rola **antes** de a IA falar: o dado cai, o dano entra, a ação se cobra,
e só então o envelope sai para narrar. O defeito de hoje não era ficar sem
prosa — era **a ação ser jogada fora**. Mas a razão dura é outra: se o turno
**re-rolasse** na tentativa seguinte, uma queda de rede viraria **re-rolagem de
um resultado ruim**. Numa casa cuja primeira lei é determinismo por semente,
isso é um buraco que não parece exploit — **parece azar**.

Por isso a suíte não prova que o módulo guarda; prova que **não se re-rola**:
o envelope narrado depois tem a **mesma impressão** do que o motor produziu
antes, byte por byte, e o **contador de rolagens continua em 1** depois de três
tentativas. E a contraprova, que é a que fecha o argumento: re-rolar sobre o
estado **já alterado** (inimigo ferido, ação cobrada) **não repete** — sorteia
outra vez. Está escrita com todas as letras no bloco 3 da suíte.

### O que o jogador lê quando o Mestre cala

A voz é de mundo, e o nome do mecanismo não aparece. No silêncio, a frase da
classe (sete delas, uma por tipo de queda). Ao esbarrar na trava:
*"⏳ O que você acabou de fazer ainda não foi contado, e a mesa não anda sem a
palavra do Mestre. Peça a ele que conte, e então siga."* — a segunda sentença
só vem quando insistir resolve. O **"Tentar de novo" só aparece quando insistir
resolve**: oferecê-lo contra falta de crédito seria mentir duas vezes.

O motivo técnico desce **íntegro ao console**, como argumento separado para não
ser aparado, com o id do silêncio, a conta de tentativas e a marca do turno.
Foi esse vazamento que permitiu diagnosticar duas quedas — **quem apaga o
motivo fica cego**.

### Decisões médias, com o motivo

- **A catraca nasceu mordendo, e era o ponto.** Pegou um envelope resolvido que
  escapava do selo: `[MASMORRA — … COMBATE JÁ ABERTO PELO SISTEMA]`, que sai
  **depois** de `abrirCombate` ter trocado a ficha e **rolado a iniciativa**.
  Decidi que **trava**, e a régua ficou escrita para o caso seguinte: *trava
  quando o sistema mexeu na ficha, não quando apenas anotou um fato.*
- **A terceira porta.** A fiação travou `declararGolpe` e `agirInterno`; a mão
  que as fiou **achou uma terceira** — `declararAcaoRapida`, o painel de Ações,
  que chama `adjudicarAcao` direto. Com ela aberta o painel ainda rolava, e o
  buraco continuaria de pé. Fechada, com o texto do jogador devolvido à caixa.
- **A conta das tentativas voltou para o módulo.** Tinha ficado dentro do
  `catch` de `enviar`, à mão. *Conta se prova, tela se olha:* uma regra que só
  existe dentro de um `catch` de vinte mil linhas é uma regra que ninguém pode
  provar. `guardarTurno` passou a aceitar `anterior`, sem export novo.
- **`irMenu` solta o turno preso** (fora da minha lista, e mantive): sem isso um
  guardado sobrevive à volta ao menu e **trava a primeira ação de uma campanha
  nova** na mesma aba.

### O que ficou

- **O envelope sem selo de `App.jsx:13029`** (invisibilidade/voo/luz): sai
  **depois** de o PM ser descontado e a pilha de efeitos trocada, com um
  cabeçalho que é só o nome da magia — então não trava, e o jogador pode pagar
  o PM duas vezes. Não é linha faltando na tabela: **falta selo**, e o conserto
  é batizar o envelope no App (o irmão dele, `:13041`, já sai selado). Foi para
  a pauta como **leve**, com o diagnóstico pronto, porque subir a catraca de 9
  para 10 toca três arquivos e este ciclo já teve duas voltas de correção.
- **Comentários sem acento** nos trechos novos do `App.jsx`: o script `.cjs` de
  âncora evita acento para não ser mutilado pelo shell, e o resto do arquivo é
  acentuado. Pauta, **leve**.
- **X3b e X3c não foram tocadas**, como combinado. X3 vale sozinha.

### A nota que importa mais que o resto: o commit não é meu, e o índice é compartilhado

**O X3 inteiro está dentro de `e430a12`, um commit da outra mente** — cujo
título fala de um relógio de 15 segundos e não menciona nada disto. Aconteceu
no intervalo entre o meu `git add` (caminho a caminho, como manda a lei) e o
meu `git commit`: nesse instante o `regente` commitou, e o índice levou junto
`src/guardado.js`, os dois arquivos de teste, o meu `App.jsx` e o meu bump.
Quando fui commitar, a árvore estava limpa e o meu commit não tinha o que
dizer. `e430a12` **já estava em `origin/main`** quando descobri.

**Não reescrevi história**, e a razão é a mesma que proíbe `git stash` aqui:
seria uma arma apontada para o vizinho, e ainda por cima um `push --force` num
ramo que faz deploy para jogadores reais. O código está em `main`, verde e no
ar; o que se perdeu foi a honestidade do registro, e é este bloco que a repõe.

**E o achado é de lei, não de azar:** o `CLAUDE.md` manda somar os caminhos um
a um e proíbe `git add -A` — mas **o índice do git é compartilhado pelas duas
mentes**, então nem o `add` disciplinado protege: existe uma janela entre
somar e commitar em que o commit do outro leva o que você somou. O conserto é
não usar o índice: **`git commit -- <caminhos>`**, que commita os caminhos
direto e não deixa janela nenhuma. Foi assim que este bloco entrou. Está na
pauta para a pessoa, porque mexe numa lei da casa.


## 15/09 17:05 · v9.255 · X2 · o golpe sai do botão · commit `fc86e53`

- **estado inicial:** HEAD `628e70f`, VERSÃO **v9.254** (o ciclo E1 do `regente`
  já a tinha bumpado — o meu é o v9.255), `npm test` **183/183 suítes + 11/11
  varredores** verde, build limpo, árvore limpa. **Sem trava — pus a minha.** A
  outra mente roda **K1** ao lado, só no Figma. **Tomei o bastão do `App.jsx`**
  às 15:19 e o devolvi ao fechar este bloco; foi usado pelo `frontend` e por
  mim (a correção dos comentários de versão).
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, e a etapa estava
  escrita. Pauta com itens de sobra.
- **backend:** `src/golpe.js` — o veredito do golpe, puro: `ALCANCES`,
  `alcanceDoGolpe`, `vereditoDoGolpe`, `fraseDoGolpe`, `VERBOS_DE_COMBATE`; mais
  `testes/teste-golpe.mjs`, 64 asserções.
- **frontend:** a fiação — `resolverAtaqueJogador` passou a ler `golpe.js`, a
  extração `aplicarGolpeDoJogador` nasceu com **dois chamadores**, e o botão
  `Atacar` virou chamada com o alcance mostrado antes do clique.
- **testes:** a catraca desceu de **7 para 6**, as asserções que inverteram
  ganharam o motivo escrito, e o varredor foi **reapontado, não apagado**.

### O que a etapa era, e por que não era o botão

A redação original de X2 dizia *"o botão passa a chamar o motor"*. **X1 provou
que isso sozinho teria produzido um jogo pior:** a luta abre a **12,0–25,5 m**,
o corpo a corpo alcança **1,5 m**, e **10 de 10 plantas recusam no turno 1**.
Clicar `Atacar` daria *"longe demais"* dez vezes seguidas, e pareceria que o
conserto falhou. Então X2 foi **o pré-requisito garantido e mostrado**, e a
porta única do motor — nessa ordem.

**O molde, seguido e não reinventado** (é o dos 8 que já funcionavam): o id vira
a frase canônica (`fraseDoGolpe`, nunca string à mão) → porta única com direito
de recusar (`declararGolpe`, `App.jsx:11851`) → o módulo puro decide antes de
qualquer efeito → a frase entra no log **depois** de aceita → o turno se cobra
explicitamente. A extração `aplicarGolpeDoJogador` (`:11749`) tem **dois
chamadores e nenhum terceiro**: o teclado e o botão resolvem pelo mesmo código.
Um golpe que resolvesse por dois códigos seria o defeito que a fase existe para
matar.

### A conferência viva, na campanha de verdade (e sem gastar o Narrador)

Não foi preciso injetar nada: **os dois espaços de save já tinham luta aberta
com grade**. Com Halvard a 3 m e alcance de 1,5 m, o botão veio `disabled` e a
linha leu **"Longe demais — Halvard a 3 m, faltam 1,5 m. Aproxime-se primeiro."**
— exatamente o que `vereditoDoGolpe` prevê em Node. Aba nova, porque **HMR mente
depois de rename** e houve extração; console limpo, sem `LimiteErro`.

**O que eu NÃO consegui conferir vivo, e é honesto dizer:** o ramo aceso. A
campanha estava na **vez do mundo**, e virar o turno custaria uma chamada ao
Narrador. O ramo aceso está provado em suíte (o veredito vira para permitido
depois de 2 passos, medido com `alcancaveisDe`), não na tela. **X4 fecha isso.**

E o save da campanha voltou **byte a byte**: só `sessao` e `salvoEm` tinham
mudado (contadores de sessão e o carimbo do autosave), e os dois foram
restaurados — hash conferido contra a cópia feita antes de tudo.

### Decisões médias tomadas (com o motivo)

- **O `36` e o "+ um quadrado" saíram do meio do `App.jsx` para `ALCANCES`.**
  Eram constantes de regra soltas dentro de `resolverAtaqueJogador` — a primeira
  lei da casa. **Os valores são idênticos:** mover número para tabela sem mudar o
  número era o objetivo, e **nada foi rebalanceado** nesta etapa.
- **O status quo da recusa de graça foi mantido, e por isso o botão impede o
  clique em vez de recusá-lo depois.** Passar a cobrar mudaria o que o jogador
  vive, e isso é da pessoa — está na pauta, com proposta e porquê.
- **Os comentários novos diziam `v9.222`, e eu os corrigi para `v9.255`.** As
  mãos leram o *"hoje v9.221"* do `CLAUDE.md` e inferiram o número seguinte — mas
  **v9.222 já existiu**, e é de outra coisa (a conta sazonal de `encontros.js`).
  Um comentário que mente sobre quando um órgão nasceu é pior que comentário
  nenhum. Corrigido por `node`, com catraca no próprio script, e só onde o texto
  dizia Fase X — o `v9.222` legítimo continua onde estava.
- **A asserção de `teste-golpe.mjs` que o `backend` escreveu "para mudar de lado
  em X3" mudou de lado agora**, porque a fiação veio em X2 e não em X3; e a
  dívida `AGUARDANDO` de `teste-ligacao.mjs` foi paga no mesmo dia em que nasceu,
  pelo mesmo motivo. As duas com o motivo escrito ao lado.

### O que ficou

- **Duas bifurcações foram para "Para a pessoa decidir"**, com recomendação e
  porquê, e **não foram decididas aqui**: (a) a recusa fora de alcance continua
  de graça ou passa a custar o turno — a mente recomenda **continuar de graça**,
  e observa que isso só fecha quando o **teclado** ganhar o mesmo aviso que o
  botão tem (é a W2, já aprovada); (b) **`Esquivar`, `Empurrar`, `Derrubar` e
  `Ajudar` não têm motor nenhum** — não é fiação que falta, é mecânica, e a
  ordem recomendada é `Empurrar`/`Derrubar` primeiro, `Esquivar` depois,
  `Ajudar` por último.
- **X2 não encurtou a caminhada.** Continuam 2 a 3 turnos andando antes do
  primeiro golpe corpo a corpo; o que mudou é que agora ela é **visível antes do
  clique**. Quem quiser encurtá-la mexe em `posicionar`, e isso é outra conversa.
- **A tela de batalha por toque é a Fase W**, do desenho, e **não foi
  antecipada**. X2 usou as formas que a mesa já tinha decidido em E1 — a
  Consequência *Linha* (nunca balão), o estado *Impedido* com a razão, o botão
  que não escreve preço. O que faltava de forma não foi inventado aqui.
- **A régua de X1 ficou intacta para X4:** a política da sonda não mudou (mesma
  planta, mesmos 7 turnos, mesma fórmula), para os dois números continuarem
  comparáveis. O `testes` acrescentou uma medição **ao lado**, sem tocar na velha.

---

## 15/09 15:20 · v9.253 · X1 · o que chega ao motor, e o que vira frase · commit `bf9dd49`

- **estado inicial:** HEAD `c3f4fd3`, VERSÃO v9.252, `npm test` **182/182 suítes
  + 10/10 varredores** verde, build limpo. **Sem trava — pus a minha.** O
  `regente` roda **E1** ao lado (a tela de batalha no Figma); a árvore tinha
  `mente/e1-jogo.md` e `mente/e1-desenho.md` dele, que não toquei. **O bastão do
  `App.jsx` não foi tomado: X1 mede, e leitura não precisa de bastão.** Nenhuma
  linha de `src/` mudou nesta etapa, nem o bump — que é de `constantes.js`.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, e a etapa estava
  escrita.
- **backend:** mapeou o caminho de cada ação do jogador e o inverso — o que o
  motor expõe e nenhum clique chama —, tudo com arquivo e linha, sem editar nada.
- **testes:** mediu a taxa de turnos estéreis com sondas determinísticas sobre
  os módulos puros, **achou a causa verdadeira do 7-em-7**, e depois transformou
  a medição em régua permanente: a tabela, a suíte, o varredor e a sonda.

### A conta que a etapa pediu

**1. Cada ação do jogador, e para onde ela vai.** São **20 botões** no painel de
Ações: **12 `ACOES_PRONTAS`** (`App.jsx:1071-1084`) com **um handler único que
só faz `setEntrada`** (`:20564`) — o botão não dispara nada, só enche a caixa —
e **8 `ACOES_RAPIDAS`** (`desafios.js:621-633`) que entram no motor pelo
despachante (`:20593` → `declararAcaoRapida` → `adjudicarAcao`). **Nenhuma das
20 é de combate.** Fora do painel, só **mover no grid** (`moverPara`,
`App.jsx:14229`), **beber da bolsa** (`usarConsumivelUI`, `:19265`) e o
**heroísmo** (`:14902`) chegam ao motor por clique — e nenhum dos três é um
golpe. Das 12 prontas, **6 escrevem frases que leitor nenhum lê**, e **4 dessas
6 são ações de combate** (Esquivar, Empurrar, Derrubar, Correr).

**2. O motor sem chamador.** Dos três módulos de combate, **21 funções não têm
um único uso no corpo do `App.jsx`** — 10 de `combate.js`, 8 de `habilidades.js`,
3 de `efeitos.js`. **Conferi por conta própria e o número bate exatamente**; e
achei mais **16 tabelas/consts** na mesma situação, que não estavam na conta.
**E o `testes` refinou a conta, que é melhor do que eu a tinha pedido:** "sem
chamador" misturava três coisas diferentes, e agora são três listas separadas —
`semClique` (o App importa e nunca chama: **3** em `combate.js`, e **0** em
`habilidades.js` e `efeitos.js`), `soInterno` (só o próprio módulo chama: 5 + 4 +
3) e `morto` (ninguém chama, em lugar nenhum). A distinção importa: `soInterno`
não é dívida, é encapsulamento. Um nome saiu das listas por mérito —
`maiorVaoSemGanho` tem leitor em `teste-onda3.mjs:33` —, com o motivo escrito e
uma asserção guardando a exceção.
`habilidades.js` expõe 37 funções e **zero** têm chamador por clique. O caso
extremo: **`gastarRecurso` (`combate.js:745`) não tem chamador nenhum no
repositório** — o App faz a conta da economia à mão (`eco.acao -= 1`, `:13234`),
e `combate.recursos`, escrito ao abrir a luta (`:5230`), **nunca é lido**.

**3. Turnos sem um número mudar: o 7 em 7 se reproduz** — deterministicamente,
sem IA. Mas **a causa não era a que a fase supunha**, e este é o achado da etapa.

### O achado: a trava é geométrica, e ninguém a tinha nomeado

O botão não é o obstáculo principal. `resolverAtaqueJogador` **existe e é bom**.
O golpe morre antes: `posicionar` (`grid.js:551-576`) abre a luta com o herói em
`y = altura-1` e o inimigo em `y = 0`. **Medi as 10 plantas: abertura de 12,0 m
(taverna) a 25,5 m (masmorra), e 10/10 recusam o alcance de 1,5 m no turno 1.**
Pior: `semAlcance` recusa **de graça** (`App.jsx:13219-13225`, deliberado desde
a v9.20), sem gastar a ação — logo `resolverRevide` (`:14034-14038`) nunca roda
e **a rodada nunca vira**. O jogador ataca sete vezes, o sistema recusa sete
vezes sem cobrar nada, e o inimigo também não age. PV 20/20, PM 6/6, XP 89/300 —
exatamente o que o `jogo` viu. São **2–3 turnos só andando** antes que um golpe
corpo a corpo possa rolar.

**Duas honestidades que a medição obriga:** a recusa **não é muda** (o jogador
recebe a linha 📏 com a distância e um *"Aproxime-se primeiro"*); e a armadilha
é sobretudo do corpo a corpo — mas **nem o arco escapa**: a 36 m, **3 das 10
plantas continuam recusando** (taverna, caverna, navio), por parede no caminho.
X2 **não pode tratar "tem alcance" como "pode acertar"**.

**E o par que nunca foi composto.** Duas suítes verdes provavam isto juntas:
`teste-grid.mjs:198` garante que o herói começa a mais de 6 m — **como feature**
—, e `teste-alcance-e-achado.mjs:45` garante que longe é recusado. Ninguém nunca
afirmou que existe caminho do começo da luta até um dado rolado. Conferi as duas
citações: estão exatas. **Não as toquei** — X1 mede, não conserta.

**4. O padrão dos 8 que funcionam** (o molde que X2 copia): o botão lê a caixa
como *alvo*, limpa e chama um despachante; o `id` vira **a frase canônica que um
jogador escreveria** (`fraseDaAcaoRapida`); **porta única com direito de
recusar** (`if (adjudicarAcao(frase)) return;` — `false` devolve o turno à IA);
o **módulo puro decide antes de qualquer efeito** (`veredictoDaAcao`, e o App não
calcula dificuldade); a frase só entra no log **depois** de a porta aceitar, no
par `pushMsgs([jogador, sistema])`; e **o turno se cobra explicitamente**.

### Decisões médias tomadas (com o motivo)

- **A régua de X1 mora em `testes/`, não em `src/`.** Precedente de N1
  (`ADVERSARIO_NA_REGUA`): instrumentação não é regra de jogo, e um módulo de
  `src/` que a aplicação nunca importa é export morto esperando para acontecer.
- **X1 deixa catraca, e não só relatório.** `testes/acoes-do-jogador.mjs` (a
  tabela), `teste-` e `check-` do mesmo nome, e `testes/sonda-turno-esteril.mjs`
  — porque **o scratchpad não sobrevive à sessão e X4 tem de repetir esta conta
  com o mesmo procedimento**. A asserção que importa é um teto que **só
  desce**: `TETO_SEM_MOTOR = 7`, a lista nomeada das ações de combate sem
  caminho ao motor. X2 baixa o número no mesmo commit em que faz o botão
  chamar o motor; subir é regressão.
- **Separei dois eixos que estavam colapsados num só** na primeira versão da
  tabela: *o clique chega ao motor* e *a frase enviada chega ao motor*. São
  coisas diferentes — `Saltar` alcança o motor pelo texto, mas o clique só
  enche a caixa —, e a manchete de X1 depende de qual dos dois se conta.

### O que corrigi na pauta (a medição manda na pauta, não o contrário)

- **X2 reescrita.** O alvo mudou: o caminho até `resolverAtaque` já existe e não
  precisa ser inventado; o que falta é **garantir o pré-requisito antes do
  clique** e mostrar distância e alcance (o veredito antes do clique). Registrei
  os dois precedentes de dentro de casa (mover e bolsa) além do molde dos 8. E
  deixei **duas bifurcações que são da pessoa, não do ciclo**: (a) se `semAlcance`
  passar a cobrar a ação, o jogador que erra o alvo perde o turno — muda o que
  ele vive; (b) **Defender/Esquivar não existe no motor**, e dar-lhe mecânica é
  mecânica nova, logo `pesado`.
- **X3 eu corrigi e a correção caducou no mesmo ciclo** — e isso merece ficar
  escrito. Eu tinha posto debaixo dela o achado de que **a economia do turno não
  é do motor**; enquanto o ciclo rodava, **a pessoa reescreveu X3 noutra sessão**
  (passou a ser *"o silêncio do Mestre é honesto"*: sem narrador, sem turno,
  declarado provisório) e a minha redação foi por cima. A decisão dela manda —
  **eu não a desfiz**; mudei o achado de lugar, para "Aberto", com a nota de que
  o dono natural dele é X2. Um achado medido não pode morrer porque a etapa que
  o hospedava trocou de assunto.
- **X4 ganhou a régua e a linha de base cravadas**, com a política fixa escrita,
  para os dois números serem comparáveis.
- **Três itens novos em "Aberto"**, todos achados desta medição: a catraca do
  export morto **conta ocorrências, não leitores** (uma linha de `import` não
  lida vale como leitor — `App.jsx:7` tem 9 imports mortos de `combate.js`, e é
  por essa fresta que `gastarRecurso` passou); a reação escolhe por
  **`Math.random()`** (`reacoes.js:96`), **fora da semente**, contra a lei do
  determinismo, e o jogador nunca escolhe nenhuma das 6; e os **seis literais
  mortos** do painel, dois deles conserto de uma linha (`enganar` não casa
  porque a regex tem `engano` — **o mesmo bug já consertado para a fileira de
  baixo em `desafios.js:629-631` e nunca para esta**; `Correr` não casa porque
  `RETIRADA` exige `corro para (fora|longe)`).

### O que ficou

- **X1 não consertou nada, de propósito** — nem os dois literais de uma linha.
  Consertar sem a catraca junto é como a terceira frase morta nasce no ciclo
  seguinte, e o varredor novo já tem onde morar.
- **Uma armadilha de medição, escrita para X4 não cair nela:**
  `montarGrade({ planta })` **não** monta a planta pedida — `cenarioDe`
  (`grid.js:286`) lê outras chaves e cai em `estrada` **em silêncio**. Na minha
  primeira conferência isso trocou a masmorra pela estrada e encurtou a abertura
  de 25,5 para 16,5 m sem um aviso. Quem medir grade tem de conferir a
  largura×altura que recebeu.
- **Nada foi para "pesado"** além das duas bifurcações de X2, que ficaram
  escritas na própria etapa para a pessoa responder quando ela chegar.
- **Um aviso de convivência, sem culpa e sem conserto:** enquanto este ciclo
  rodava, **outra sessão commitou `mente/pauta.md` com as minhas edições de X1
  dentro** — `184bf1c` e `9b7aa61`, cujas mensagens falam de outro assunto. É
  exatamente o que a lei *"nunca `git add -A` com um ciclo em curso"* previne: a
  história passa a não dizer o porquê de parte do que carrega. **Não desfiz
  nada** — o conteúdo está certo, só está guardado sob o título errado —, e
  registro aqui para quem for ler o `git log` depois não procurar X1 num commit
  que não fala dele. Por isso este commit leva `diario.md`, as quatro peças da
  régua e o bump, e a pauta só com o que escrevi depois daqueles dois.

## 15/09 13:45 · v9.251 · N1b · a régua enxerga o Adversário · commit `061c5bf`

- **estado inicial:** HEAD `c8da685`, VERSÃO v9.250, `npm test` **182/182
  suítes + 9/9 varredores** verde, build limpo. Sem trava — pus a minha. O
  `regente` roda **D5** ao lado; a árvore tinha `mente/pauta-desenho.md` e
  `mente/agora.json` dele. **Nenhum arquivo dividido:** meu território foram
  duas suítes, e o **bastão do `App.jsx` não foi tomado** — nenhuma linha de
  `src/` mudou nesta etapa, fora o bump.
- **conselheiro:** **não chamado** — fase aprovada, e a pessoa pediu hoje
  *"consertar e re-medir tudo"*.
- **testes:** ligou a intenção à régua pelo caminho que o App usa
  (`lutaDaMesa` → `intencaoDaVez` com memória por combate → `prioridade` no
  `turnoDosInimigos`), pôs o porquê inteiro em `ADVERSARIO_NA_REGUA`
  (tabela nomeada, com os campos de mundo que a régua não tem e as 34
  intenções que por isso ficam inalcançáveis), e re-mediu os três cenários
  em 4 famílias × 1000.

### O defeito, e o que ele custou

A régua passava `prioridade: ""` (`regua-combate.mjs:612`) e `combate.js:279`
só consulta `escolherAlvo` quando a prioridade existe. O jogo passa a intenção
(`App.jsx:13606`). **B1, B1b, B2 e T1 mediram Uma Vida com o Adversário fora do
circuito** — mediram o sorteio de 35% e mais nada. Nenhuma suíte ficou vermelha
por isso, porque a suíte provava o instrumento contra ele mesmo. **Um
instrumento que difere do jogo em silêncio é pior que nenhum instrumento**, e
agora isso está escrito nos dois arquivos, no sítio onde a prioridade nasce.

### A linha de base nova (4 famílias × 1000, os três cenários)

| cenário | métrica | desligado (B1/B2/T1) | **ligado (o jogo)** |
|---|---|---|---|
| justo | vitória | 51,1–54,2% | **1,4–1,8%** |
| justo | PV do grupo (de 132) | 25,88–28,05 | **0,41–0,64** |
| justo | quedas (de 3) | 1,740–1,790 | **2,978–2,986** |
| justo | TPK | 45,8–48,9% | **98,2–98,6%** |
| justo | 1ª queda | rodada 4,30 | **rodada 1,05** |
| justo | duração | 7,70–7,75 rodadas | **6,01–6,12** |
| duro | vitória | 8,8–9,9% | **0,0%** |
| duro | PV / quedas | 3,11–3,53 / 2,80–2,82 | **0,00 / 3,000** |
| brando | vitória | 100% | **100%** |
| brando | quedas | **0** em 4000 | **12** em 4000 (2 · 6 · 0 · 4) |
| brando | PV do grupo | 124,34–125,01 | **115,56–115,91** |

`estourouTeto` continua **0** nos três. O molde antigo é reproduzível byte a
byte com `comAdversario: false`, e a suíte **afirma** que ele reproduz 52,1% ·
25,88 · 1,790 — para a história de B1/B2/T1 não passar a mentir.

### A estimativa de N1: **confirmada, e cravada**

A reconstrução no scratchpad previu **52,1% → 1,8%** no `justo`. A régua
consertada mede **1,8%** na família do retrato. No `duro`, o destino confere
(0,0%); só o ponto de partida estava um pouco abaixo na reconstrução (8,4%
contra os 8,8% de régua).

### Por que, em uma linha, e o número que explica

**Em 100% dos combates a rodada 1 elege `calar_a_magia`**, e a aderência por
combate (a memória `antes`) mantém o fogo no conjurador; depois vem
`matar_o_remendo` (782 dos 1000 combates). A oposição concentrada desperdiça
**cinco vezes mais** golpe em corpo caído (0,94 → 4,99 por combate) e ainda
assim varre a mesa: o desperdício é barato perto do que a concentração compra.

### A catraca: **vermelha no primeiro dente, e não afrouxada**

Vitória 1,4–1,8% contra o piso de 35% — folga **−46,1 margens**.
`pisoDeVitoria`, `tetoDeVitoria`, `tetoDePvDoGrupo` e `pisoDeQuedas` estão
**intactos**. O dente 1 virou `pendente(...)` — imprime em todo `npm test` e
não derruba a suíte — pelo roteiro desta casa: **dívida conhecida entra como
pendente, não como vermelho**, e esta dívida é de BALANCEAMENTO, que é decisão
da pessoa. Os dentes 2 e 3 continuam asserção e ficaram verdes **por
saturação**, não por equilíbrio (0,5 PV de 132 contra teto 35; 2,98 de 3
contra piso 1,2) — e está escrito ao lado deles que é assim que se lê o verde.

### O achado que a Fase N tem de ler antes de seguir

**O `justo` deixou de ser o cenário com resolução nos dois sentidos** — era a
razão inteira de ele existir. Os três estão saturados hoje (duro 0,0% · justo
1,6% · brando 100%), e uma mudança de combate julgada neles não prova nada em
direção nenhuma. **Não recalibrei**, e isso é a trava que a pessoa pediu: a
régua mede, ela não escolhe o jogo.

- **decisões médias tomadas:**
  - **converter o dente 1 em `pendente` em vez de deixar a suíte vermelha.**
    Motivo: o roteiro do ciclo diz que dívida conhecida entra como
    `pendente(nome, motivo)`; e vermelho na árvore bloqueia toda etapa
    seguinte por uma dívida que **só a pessoa** pode quitar. O limiar não se
    moveu um dígito, e a razão da conversão está escrita no lugar da asserção.
  - **o guarda do `brando` ("ninguém cai") também virou `pendente`.** 12 em
    4000, com uma família ainda medindo zero: um limiar aí mediria resorteio
    (lição de A4 e C2b). Ficou no lugar a asserção de que **sem** Adversário
    continua sendo zero — a prova de que a queda nova vem da intenção e não de
    regra mexida.
  - **as três sabotagens da seção 7 foram remedidas e trocadas de cenário**
    (nv8 → o próprio `justo`; 3 elites nv9 → 1 elite nv6; grupo nv7 → nv12), e
    o **controle inverteu de papel**: passou a ser 4 elites nv3, o único que a
    régua mede verde nos três dentes hoje. Motivo: dente que não morde não é
    dente, e um controle vermelho não controla nada. **Nenhum limiar mudou.**
  - **`primeiraQueda` no `brando` foi generalizada, não apagada:** vale agora
    para os dois casos (n = 0 com margem infinita, ou uma rodada de verdade).
    O que ela sempre quis provar — a régua não inventa média sem amostra —
    ficou mais forte, e deixou de depender de qual família cai no índice 0.
- **o que ficou, e é da pessoa:** **o número catastrófico, e eu parei nele.**
  Não toquei em dificuldade, bestiário nem prontos. A pergunta pesada que já
  estava em *Para a pessoa decidir* continua lá, agora com número de régua no
  lugar da reconstrução. Para informar a decisão e nada mais, a régua mediu
  que **4 elites de nível 3 põem a mesa de volta em 41,8–50,0%** de vitória
  (PV 17,8–21,3, quedas 2,42–2,49: os três dentes verdes), e **3 elites de
  nível 6 dão 36,4–42,0%**.
- **e um aviso para B2, se ela voltar:** a escada do bônus ofensivo escrita em
  `CATRACA_DE_UMA_VIDA` (~2,9 pontos de vitória por ponto de dano, vermelho em
  +5) foi medida sem Adversário e **não vale mais**. Remedi-la é fase, não
  conserto de instrumento — não foi feita aqui.

---
## 15/09 01:30 · v9.250 · a contagem das 148 habilidades · commit `bc74f1e`

- **estado inicial:** HEAD `8dd1579`, VERSÃO v9.249, `npm test`
  **182/182 suítes + 9/9 varredores** verde, build limpo. **Havia um ciclo
  morto:** `mente/agora.json` estava sujo com os itens deste mesmo item e
  **sem trava** — alguém começou esta contagem e morreu antes do primeiro
  passo. Nada de `src/` ficou pela metade (a árvore só tinha o `agora.json`),
  então não desfiz nada: pus a trava e assumi o item.
- **conselheiro:** **não chamado** — a pessoa pediu esta medição diretamente
  e está esperando o número.
- **backend:** classificou as **148** `HAB()` uma a uma contra a cadeia real
  de resolução, com script que roda os detectores de verdade ao lado do
  julgamento; depois re-triou o balde 3 em três degraus.
- **testes:** inventariou o caminho existente — `FUNCOES_DO_SISTEMA` (11
  verbos, saturada), os 11 ramos de `usarFuncaoMagica`, e quais famílias de
  `habilidades.js` são tabela aberta.
- **decisões médias tomadas:** **nenhuma no código. O ciclo é um retrato e
  não consertou uma linha** — nem as duas que T4 já conhecia. O único código
  que mudou foi o bump.

### O item: o número que a pessoa pediu

Ela devolveu a pergunta em 14/09 — *"não vejo utilidade pra um órgão cuidar
de somente duas habilidades"* — e pediu o número antes de decidir. Ele é:

**Balde 1 (cumpre na mesa) 56 · Balde 2 (é só prosa) 26 · Balde 3 (promete e
não cumpre) 66.** Soma 148.

O critério está escrito e é reproduzível, e o de fronteira que mais move o
número é este: **dano sozinho é prosa**. "Extra", "massivo", "devastador" são
adjetivos sem tabela — nenhuma das 148 tem `danoBase`. Contá-los no balde 1
inflaria; no balde 3 encheria de vinte e cinco quase-iguais que não pedem
motor nenhum.

### A divisão que decide, e ela desmente a pergunta

O balde 3 em três degraus: **(a) LINHA 21 · (b) LIGAÇÃO 33 · (c) NOVO 12**.
**54 das 66 não precisam de mecânica nova.**

O achado que reorganiza tudo não estava na pergunta: **os motores já existem,
eles apenas leem outra fonte.** `amortecerDano` (`tracos.js:161`) já corta o
dano recebido e roda vivo em `App.jsx:13635` — lendo o **traço racial**. O
piso de 1 PV existe com número. `removerPelaPorta` tem **um** chamador (a
magia do grimório); `curarAliado`, **um** (a poção). Raça tem despachante,
dádiva tem, magia tem, poção tem, relíquia tem. **A habilidade de classe é a
única fonte de poder do jogo que não tem despachante.** Não é um buraco de
mecânica: é um buraco de **fiação**.

Por isso a recomendação da mente não é órgão **nem** "duas ligações avulsas":
é **uma porta só** — `porHabilidadeDeClasse` no laço que já existe
(`App.jsx:13067` e `:13187`) + o nome em `temRegraPropria`. Ela não inventa
mecânica; faz a habilidade de classe alcançar o que todos os outros já
alcançam. Os 12 restantes são **sete assuntos** (marca, zona persistente,
cura-por-turno, clima, aura reativa, contra-conjuração, PM de volta) — cada um
uma fase pequena, nenhum urgente.

### A divergência entre as duas mãos, e como a resolvi

As duas mãos discordaram exatamente onde a decisão mora. O `backend` marcou
`Postura Defensiva` e `Corpo de Ferro` como **(c) NOVO**, argumentando que
"mitigação do dano recebido não tem motor — absorção come valor fixo e guarda
faz errar". **Overruled, e a razão está medida:** nenhuma das duas mãos tinha
olhado `tracos.js`. `amortecerDano` corta o golpe ao meio, é porta única do
dano que chega ao herói, e roda em produção. Pela nossa própria regra escrita
("o motor existe e lê outra fonte" = LIGAÇÃO), as duas são **(b)**. É a
diferença entre dizer à pessoa "precisa de mecânica nova" e "precisa de uma
linha de fiação" — e ela está decidindo com base nisso.
O `backend` me corrigiu de volta em `Mente Serena` (é `imuneA`, não `GUARDAS`,
e é (b)) e eu aceitei. As duas correções estão no `degraus.cjs`.

- **o que ficou:** duas descobertas que **não são** esta decisão e viraram
  item próprio em "Aberto": os **10 falsos positivos ativos** (três fazem o
  inverso do que prometem; cinco nascem de substring dentro de palavra —
  `aranha` em *Emaranhar*, `maça` em *Fumaça*) e as **7 habilidades de ataque
  que nem chegam ao motor** (`HAB_OFENSIVA_RX` tem `ataca`, não `ataque`).
  Nenhuma foi consertada: o ciclo era o retrato, e consertar durante a
  medição é a maneira mais rápida de o número deixar de ser verdade.
  A decisão do órgão **continua com a pessoa** — agora com o número na mão.

---

## 14/09 22:30 · v9.248 · N1 · o que os dois lados já sabem · commit `9f04a18`

- **estado inicial:** árvore limpa (só `mente/agora.json` modificado), HEAD
  `107440f`, VERSÃO v9.247, `npm test` **182/182 suítes + 9/9 varredores**
  verde. Trava posta por mim; não havia trava morta. **Duas mentes:** o
  `regente` roda D4 ao mesmo tempo, em `mente/formas.md` e no território de
  desenho — **o bastão do `App.jsx` não foi tomado por mim, e nem precisou
  ser**: N1 não editou uma linha de código.
- **conselheiro:** não chamado (etapa aprovada já escrita, e a pauta tem mais
  de 5 itens em "Aberto").
- **backend:** mediu os dois pilotos, o `intelecto` e o bestiário — quatro
  frentes, instrumento só no scratchpad.
- **testes:** instrumentou uma **cópia** da régua de B1 (`instrumentar.cjs`
  por âncora, no molde da casa) e produziu a linha de base — **0 divergências**
  contra a régua original em 600 combates comparados por id, e os números de
  B1b/B2 reproduzidos ao dígito.
- **decisões médias tomadas:** nenhuma no código. **N1 não muda nada: mede.**
  A única coisa que este ciclo escreveu foram os três arquivos da mente e o
  bump.

### O item: a medição, e o que ela desmentiu

**A Fase A ensinou que o inventário honesto é o que impede a fase seguinte de
nascer errada, e N1 repetiu a lição de D1: quase todo número que a pauta
escrevia estava errado.** Sete das oito afirmações mensuráveis das etapas
N2–N7 foram corrigidas na pauta, cada uma com o número que a obriga.

**Os dois lados, e com que entrada decidem.** `escolherAlvo`
(`adversario.js:155`) é **puro e sem sorte nenhuma** — nenhum `Math.random`
no arquivo — e enxerga **13 bandeiras**; desempata pelo primeiro da lista, e a
lista começa sempre pelo jogador (`combate.js:245`), de modo que empate exato
entrega o herói. `INTENCOES` tem **46 entradas** e **14 nunca vencem** em
200 000 situações, porque oito campos são lidos e nunca escritos; na mesa,
**8 das 46** são eleitas alguma vez, e `sair_vivo` ocupa 48,6% das rodadas.
Do outro lado, `decidirAcaoCompanheiro` (`companheiros.js:183`) lê **sete
coisas** e **não lê inimigo nenhum além de "está vivo?"**: 100,00% dos 11 889
ataques vão no inimigo de menor PV absoluto.

**Por que o buff é `Escudo da Fé` — 347 de 358 (96,93%) —, e a causa é tripla,
não simples.** Por ordem de peso: **(1) o acervo** — 7 habilidades ofensivas
de apoio em **148**, e do nível 8 em diante **1 classe em 12** carrega uma na
ficha; **(2) a janela** `rodada <= 2`, comida pela cura no combate duro (1 457
curas contra 358 buffs no `justo`; **1 380 buffs contra 20 curas** no
`brando`, mesma ficha — teto medido de 358 ações por 1000 combates); **(3) a
precedência** `guarda || abrigo || buff`, que é **decisão medida de P3/v9.233
com o motivo no comentário**, e a primeira-que-casa dentro do balde. **Só a
(3) é cegueira de escolha** — e o `brando` prova que nem ela é cega, com a
`Bênção` saltando para 28,84% quando o escudo sobrevive. **A frase de N5,
"dar cabeça ao piloto faz a ofensiva nascer", estava errada na causa:** (1)
não se resolve com cabeça, é tabela.

**O `intelecto`, e o buraco que ninguém tinha visto.** Escala real **0–3 na
criação** (`ATRIBUTO_MAX = 5` é importado em `App.jsx:43` e **nunca lido**).
Nos oito prontos: **0, 1 e 3** — mediana 1, média 1,13, três em zero e o
**valor 2 vazio**; uma escada de cinco degraus nasceria com dois mortos. E
**a ficha de companheiro não tem `atributos`** — `garantirFichaCompanheiro`
nunca os sintetiza, e os três da régua os têm escritos à mão em
`CENARIOS_DA_REGUA`. A pauta dizia *"o companheiro e o herói tiram o degrau
do `intelecto` da ficha"*: metade dessa frase não tem onde pousar, e é o
buraco de desenho mais caro que N1 achou. **E `intelecto` já faz mais do que
a pauta supunha:** decide o **PM máximo** (`manaBase + intelecto*2`) — o
recurso que o piloto gasta em toda decisão —, pesa 18 em `poder.js` e é recuo
em `aflicoes.js`. Ele não ganha o segundo leitor: ganha o quinto.

**O inimigo não tem grau de inteligência — confirmado dos dois lados**, nas
**27** entradas do bestiário e em `completarInimigo`. A âncora que serve é
**`ameaca`** (5 valores fechados, já ordinal, sobrevive a `completarInimigo`,
e com recuo `"comum"` para o nome que o Narrador inventa) — e **sozinha não
basta**: Comandante (*"perigoso e tático"*) e Sentinela Blindada (*"muralha
ambulante"*) são as duas `elite`. **Já há uma classificação de cabeça, e não
mora no bestiário:** `menteDaCriatura` põe **18 das 27** em `pensa` e o
**Colosso** em `besta` porque `RX_BICHO` casa a palavra "besta". Duas
classificações em dois lugares é a doença que esta casa conhece — N2 herda o
problema, e a pauta não o mencionava.

**Quem apanha: 60,06% · 57,27% · 64,48% — não 65%.** Os 65% são a taxa do
sorteio **quando ele roda**, e ele mede exatamente isso quando roda (64,85% ·
64,69% · 64,48%). Deixa de rodar em **7,88% (`justo`) e 12,43% (`duro`)** dos
golpes porque `vivosAlvo` (`combate.js:267`) **tira o herói caído da lista de
alvos** — e no `brando`, onde ele nunca cai, a medida é 64,48% cravado. As
quatro famílias concordam dentro do IC95 por combate. **E o achado que a fase
não tinha:** a lista de alvos é uma **foto tirada uma vez** por turno
(`combate.js:245`), então **13,40% (`justo`) e 18,03% (`duro`) do dano dos
inimigos cai em quem já está no chão** — 38,15 ± 1,80 e 62,19 ± 2,16 PV por
combate. Um inimigo com cabeça que apenas pare de desperdiçar endurece o
combate por essa margem **antes** de mirar papel nenhum, e N7 tem de medir
esse eixo **separado** do eixo "quem é mirado", senão a pessoa não consegue
decidir sobre a dureza.

### O achado grande: a régua mede o combate com o Adversário desligado

**`regua-combate.mjs:612` passa `prioridade: ""`**, sem uma linha de
comentário dizendo por quê, e `combate.js:279` só consulta `escolherAlvo`
quando a prioridade existe. Logo **toda a linha de base de B1, B1b, B2 e T1
para Uma Vida foi medida com o órgão fora do circuito** — o que essas etapas
mediram foi o sorteio de 35% e mais nada. No jogo, `App.jsx:13606` passa a
prioridade da intenção a todo turno.

Uma **reconstrução** de `lutaDaMesa` no scratchpad, ligando a prioridade ao
mesmo laço, dá **vitória 52,10% → 1,80%** no `justo` e **8,40% → 0,00%** no
`duro`, robusta em 8 variantes do lugar (1,6% a 13,6%) e com a eleição
atrasada uma rodada (3,2%). **É reconstrução, não a régua, e está dito assim
na pauta** — o número exato tem de sair do instrumento certo. A causa está
medida prioridade a prioridade: o herói é o único combatente que **não morre
ao cair** e de quem os inimigos **desistem** ao vê-lo no chão, então bater
nele é dano desperdiçado, e **toda prioridade que aprende a evitá-lo vira
TPK** (`o_conjurador` 0,6% · `quem_nao_e_o_heroi` 0,4% · `o_mais_forte` 0,4%
· `o_curandeiro` 1,2%, contra 51,2% do sorteio cego).

**Duas consequências, e as duas foram registradas em vez de resolvidas.**
Nasceu **N1b · a régua mede o combate que existe** — instrumento, no molde
exato de B1b, que a autorização da fase cobre e que **vem antes de N4 e N5**,
senão o antes e o depois da Fase N inteira são medidos com o órgão desligado.
E foi para **"Para a pessoa decidir"** a pergunta que N7 escrevia errada: não
é *"aceita o combate mais duro?"* — é **"o alvo tático já está ligado no jogo
e a régua nunca o mediu; quanto dele você quer manter?"**, com as três saídas
escritas.

### O que ficou

- **Nenhum conserto de carona.** Nem um alvo, nem um buff, nem um comentário.
  Foi pedido assim e é a disciplina da etapa: N1 mede, N2 em diante mexe.
- **Cinco achados foram para "Aberto"** em vez de virarem trabalho deste
  ciclo: os oito campos lidos e nunca escritos (que custam 14 intenções);
  `ehOfensiva("Escudo da Fé") === true`, que faz a Clériga disparar o escudo
  como golpe 16 vezes em 1000 combates; `alvoDoAdversario` sem leitor de
  produção com um cabeçalho que afirma o contrário; `ATRIBUTO_MAX` importado
  e nunca lido; e `completarInimigo` não copiando o `desc` da base — o mesmo
  erro que a v9.152 consertou para `perfil` e `des`.
- **O que N1 não conseguiu medir:** o número da reconstrução. Ele é robusto na
  direção e não na casa decimal, e por isso a decisão da pessoa foi escrita
  **com** essa ressalva, não sem ela.
- **Vermelho da outra mente:** nenhum. `npm test` fechou verde antes e depois.

---

## 14/09 21:05 · v9.247 · B2 · a simetria fechada, e a Fase B com ela · commit `c14532b`

> **NOTA DE N1b (15/09, v9.251) — os números de Uma Vida deste bloco foram
> medidos com o Adversário FORA DO CIRCUITO.** A régua passava
> `prioridade: ""` ao `turnoDosInimigos` (`regua-combate.mjs:612`), e
> `combate.js:279` só consulta `escolherAlvo` quando ela existe — o jogo
> passa a intenção da luta (`App.jsx:13606`). A MESMA régua, com o
> Adversário ligado, mede no `justo` **1,4–1,8% de vitória (era 51,1–54,2%), 0,41–0,64 PV de grupo de 132 (era 25,88–28,05) e 2,978–2,986 quedas de 3 (era 1,740–1,790)** e no `duro` **0,0% de vitória (era 8,8–9,9%), 0,00 PV e 3,000 quedas**.
> **Este bloco não foi reescrito de propósito.** Os números dele continuam
> reproduzíveis byte a byte com `medir(..., { comAdversario: false })`, e a
> suíte afirma isso em toda rodada de `npm test`.

- **estado inicial:** árvore limpa, HEAD `5a170c3`, VERSÃO v9.246, `npm test`
  **182/182 suítes + 9/9 varredores** verde. Trava posta por mim. **Duas mentes:**
  o `regente` fechou D3 durante este ciclo e **tomou a v9.246 em voo** — B2 sai em
  **v9.247**, e as sete citações de versão que as mãos tinham escrito foram
  corrigidas antes do commit (comentário que cita versão errada é comentário que
  mente). **O bastão do `App.jsx`** foi tomado duas vezes e devolvido nas duas:
  pelo `frontend`, para um parágrafo de comentário, e por mim, para a citação de
  versão dentro dele. Nenhuma linha de comportamento do `App.jsx` mudou.
- **conselheiro:** não chamado (etapa aprovada já escrita; a pauta tem mais de 5
  itens em "Aberto").

### O item: a simetria fechada, e o veredito da régua

A condicional da pessoa era a etapa — *"se o bônus for lícito e justo, vamos
fazer; buffs e tudo mais devem funcionar de verdade"*. **É lícito, é justo, e o
preço medido é zero** — mas não pelo motivo que a pauta esperava.

- **backend:** `turnoDosCompanheiros` (`combate.js`) passou a ler `efeitos` pelos
  leitores que já existiam (`bonusDeDano` / `bonusDeArma`, de `combos.js`) e a
  somar em `danoBase` **antes do dado** — a convenção do herói (`App.jsx:11827`),
  que faz o bônus dobrar no crítico e escalar pela resistência. O bônus é lido
  **antes** de `d(4)`, então nenhum dado a mais é consumido e a ordem da semente é
  idêntica à de HEAD.
- **A armadilha que o desenho tinha de resolver:** `arena.js` **já somava o bônus
  por fora**, depois do golpe pronto, exatamente porque `turnoDosCompanheiros` não
  conhecia os efeitos de quem bate. Somar dentro sem tirar de fora faria a arena
  contar **duas vezes**. A compensação externa saiu junto, o número passou a
  viajar na ação (`bonus`/`fontes`), e os dois comentários que passariam a mentir
  foram reescritos.
- **frontend:** o parágrafo de `buffDeCompanheiro` (`App.jsx:7974`) dizia que
  `turnoDosCompanheiros` "nao toca em `efeitos`" e que "so `absorve` tem leitor".
  As duas metades caíram no mesmo minuto. Reescrito preservando a decisão que
  **continua viva** (só a frase do abrigo vai à tela) e dizendo o porquê novo:
  hoje é **escolha de tela**, não consequência de um número inexistente.
- **testes:** `teste-comp.mjs` **28 → 43** asserções (a suíte do órgão que mudou)
  e `teste-arena.mjs` **99 → 106** (a metade que acontece depois da ação mora onde
  estava a porta que somava). **12 sabotagens, 12 mordendo, nenhuma nascida
  verde** — inclusive a asserção-chave da etapa: *a arena volta a somar por fora*
  → 3 vermelhas.

### Os números — antes e depois, na mesma versão e com a régua consertada

| cenário `justo` (n=1000) | antes | depois | catraca B1 |
|---|---|---|---|
| vitória | **52,10%** | **52,10%** | 35–65% |
| quedas | **1,790** | **1,790** | ≥ 1,2 |
| PV do grupo | **25,88** | **25,88** | ≤ 35 |
| 1ª queda | **4,300** | **4,300** | — |

**Idênticas ao dígito, e nas quatro famílias independentes** (`aa` 51,10% · `bb`
52,70% · `cc` 54,20%). A única coisa que se moveu no retrato inteiro foi
`danoDesferido`: **261,53 → 261,54**. Folga mínima **3,45 margens** antes e
depois — nada comprado, nada gasto. **A tabela não foi ajustada**, porque não
houve o que corrigir: `BUFF_DA_HABILIDADE` e `ABSORCAO_DO_BUFF` estão como
estavam, e o comentário que cita "o dobro da força ofensiva" continua verdadeiro.

**A arena reagiu do tamanho que se esperava**, e para cima: o bônus agora dobra
no crítico também lá (antes era somado depois do golpe pronto). Amplitude do
retrato **11,9 → 11,8** pontos (teto 20), margem mais fina punho/`cc` **40,2% →
40,1%** (5,1 pontos da parede), `teste-arena.mjs` **99 ok · 0 falhas** antes e
depois. O ganho mínimo do buff no golpe, medido, subiu de **1,95 para 2,10** — a
fatia de crítico da amostra — e **o piso continua 1**, nem afrouxado nem apertado.

### A descoberta da etapa, e é ela que importa mais que o zero

**O órgão morde, e está provado isolado e determinístico:** companheiro com
efeito `+3` de `aplica: "dano"` sobe o dano médio por golpe de **11,566 para
14,582** (+3,015). O número tem explicação fechada, e é ela que prova a convenção
do herói: com 1054 críticos e 17993 acertos na amostra, dobrar no crítico prevê
**3,015** e não dobrar preveria **2,857**. O mesmo efeito com o rótulo trocado
para `"protecao"` deixa o dano em **11,566**, byte a byte — **o abrigo não vira
espada**.

**Então por que a régua não se moveu?** Porque o gargalo não era
`turnoDosCompanheiros` — **é o nascimento do buff**. Em 300 combates `justo`:
**3.571 golpes de companheiro e 2 com bônus ofensivo (0,06%)**. As 119 ações de
`buff` que o piloto escolheu produziram, no instante do golpe, **2 presenças de
`Bênção` contra 10 de `Escudo da Fé`** — que é `protecao`, bônus 0, e que
`efeitoNoGolpe` veta com razão. No `duro`, **zero**. No `brando`, 66 de 1.828.
**A metade ofensiva quase nunca chega a existir na mesa dura.**

- **decisões médias tomadas:**
  - **Somar em `danoBase`, antes do dado, e não depois** — motivo: é a convenção
    do herói (`App.jsx:11827`), e a lei da simetria é "como o defensivo já soma",
    não "de um jeito novo". O preço é o bônus dobrar no crítico também na arena;
    medido, é um décimo de ponto de amplitude, e está no diário para ninguém
    precisar descobrir sozinho.
  - **Tirar a compensação externa de `arena.js` no mesmo commit** — motivo: sem
    isso a arena contaria duas vezes, e a etapa nasceria com um defeito que a
    catraca de equilíbrio pegaria só de lado. A asserção que impede a volta dela
    é a mais importante da etapa (sabotagem 6, 3 vermelhas).
  - **Não ajustar `BUFF_DA_HABILIDADE`** — motivo: a régua não pediu. Mexer numa
    tabela que a medição aprovou seria rebalancear às cegas.
  - **Corrigir sete citações de versão antes do commit** — motivo: o `regente`
    tomou a v9.246 com B2 em voo, e as mãos tinham escrito v9.246 nos cabeçalhos.
- **o que ficou:** **a Fase B fecha aqui** (B1 · B1b · B2). E ela fecha deixando
  um item novo e honesto na pauta: **o mecanismo está armado e hoje custa zero,
  mas no dia em que o companheiro firmar ofensiva com regularidade ele vale até
  +2 por golpe** — e a escada de B1b diz que +2 leva a vitória a 58,4% e que o
  dente do PV sai da margem já em +1. Quem fizer a ofensiva nascer de verdade
  **terá de reabrir `BUFF_DA_HABILIDADE`**. Fica também uma pergunta de tela para
  a pessoa: em Uma Vida ninguém narra o `bonus`/`fontes` (só a arena o faz, no
  Duelo) — o jogador sente pelo dano maior, e anunciar "+N" seria gameplay
  visível, logo dela.

---
## 14/09 19:25 · v9.245 · B1b · a régua se corrige antes de medir · commit `2a818f9`

> **NOTA DE N1b (15/09, v9.251) — os números de Uma Vida deste bloco foram
> medidos com o Adversário FORA DO CIRCUITO.** A régua passava
> `prioridade: ""` ao `turnoDosInimigos` (`regua-combate.mjs:612`), e
> `combate.js:279` só consulta `escolherAlvo` quando ela existe — o jogo
> passa a intenção da luta (`App.jsx:13606`). A MESMA régua, com o
> Adversário ligado, mede no `justo` **1,4–1,8% de vitória (era 51,1–54,2%), 0,41–0,64 PV de grupo de 132 (era 25,88–28,05) e 2,978–2,986 quedas de 3 (era 1,740–1,790)** e no `duro` **0,0% de vitória (era 8,8–9,9%), 0,00 PV e 3,000 quedas**.
> **Este bloco não foi reescrito de propósito.** Os números dele continuam
> reproduzíveis byte a byte com `medir(..., { comAdversario: false })`, e a
> suíte afirma isso em toda rodada de `npm test`.

- **estado inicial:** árvore limpa, HEAD `41f0faa`, VERSÃO v9.243, `npm test`
  **182/182 suítes + 9/9 varredores** verde. Trava posta por mim. **Duas mentes:**
  o `regente` rodava D2 ao lado **com o bastão do `App.jsx` na mão** — e este
  ciclo **não tocou o `App.jsx` em linha nenhuma**, só o leu (foi ele que provou
  a ordem da rodada). Durante o ciclo o regente commitou D2 (`5cf555c`, `49a494f`,
  `e46b7f2`) e bumpou para v9.244; esta etapa sai em **v9.245**, pela lei do
  número maior. Nenhum conflito: os dois arquivos deste commit são de testes.
- **conselheiro:** não chamado (etapa aprovada já escrita; a pauta tem mais de 5
  itens em "Aberto").

### O item que ia ser, e o que ele virou

O ciclo era **B2 · a simetria fechada** — ensinar `turnoDosCompanheiros` a ler
`efeitos` para que o bônus ofensivo do companheiro somasse como o defensivo já
soma. A condicional da pessoa (*"se o bônus for lícito e justo"*) manda medir
antes, e B1 tinha deixado um aviso na mesa: a absorção medida em **63 abrigos
contra os 153 de P3** — duas medições do mesmo fenômeno discordando pela metade,
**na porta exata que B2 encosta**. Olhar antes era ordem. **Olhar mudou o item.**

**Nenhuma das duas medições estava errada: a comparação é que era inválida** — e
a régua tinha um defeito de fidelidade *outro*, que ninguém procurava.

- **A divergência era um fantasma, e ele custou o ciclo.** A contagem de abrigos
  depende de dois parâmetros de fiação que o diário de P3/T1 **nunca registrou**,
  e cada um sozinho move mais do que a diferença toda: **o kit do herói** (é
  escolha desta régua, não herança — tirando o kit, o duro vai de 66 para **33**
  abrigos) e **a ordem do grupo na rodada** (com o grupo agindo antes dos
  inimigos, a mesma régua mede **159 abrigos e 954 PV** — que é exatamente o
  "954/159" que P3 registrou como sua **primeira** medição). O molde que alcança
  o número perdido é **o que o App contradiz**: `resolverRevide` roda
  `turnoDosInimigos` (`App.jsx:13591`) e só então `turnoDosCompanheiros`
  (`:13830`). Some-se que esta régua é **mais nova que P3** — compõe o
  `efeitos.js` de hoje, com C2b e C3, que não existiam em v9.233 e derrubam
  abrigo (custo medido: no brando, 40 viram 30).
- **O defeito verdadeiro estava ao lado: a ordem do teste de morte.** A régua
  rolava a morte do herói **entre** os inimigos e o grupo; o App faz o contrário
  — `resolverQueda` é chamada em `App.jsx:13940`, **depois** do turno dos
  companheiros, e o cabeçalho de `resolverRevide` (`:13497`) diz isso com todas
  as letras. **E não é cosmético:** o teste de morte mexe na ficha que o grupo
  lê. Um `revive` põe o herói em 1 PV, e `decidirAcaoCompanheiro` decide pela
  fração de vida do pior ferido — com a morte antes, a Clériga via um herói de pé
  onde o App lhe mostra um herói no chão, **e curava outra pessoa**.

### A linha de base corrigida — o retrato novo contra o qual B2 será julgada

N = 1000, família `umavida`, cenário `justo`. Valor ± meia-largura do IC de 95%.

| métrica | antes (v9.243) | **depois (v9.245)** |
|---|---|---|
| vitória | 49,80% ± 3,10 | **52,10% ± 3,10** |
| quedas (de 3) | 1,822 ± 0,08 | **1,790 ± 0,080** |
| PV do grupo (de 132) | 24,98 ± 1,90 | **25,88 ± 1,90** |
| PV do herói (de 42) | 5,58 ± 0,55 | **5,795 ± 0,556** |
| primeira queda (rodada) | 4,30 ± 0,13 | **4,300 ± 0,127** |
| rodadas | 7,73 ± 0,10 | **7,701 ± 0,105** |
| dano desferido | 260,62 ± 4,94 | **261,53 ± 4,97** |
| dano sofrido | 274,74 ± 3,69 | **272,25 ± 3,71** |
| PV parados no abrigo | 1,75 ± 0,18 | **1,752 ± 0,178** |
| abrigos | — | **0,292 ± 0,030** |
| queda do herói | 98,10% | **98,10%** |
| TPK | 50,20% | **47,90%** |
| estourou o teto | 0,00% | **0,00%** |

As quatro famílias independentes concordam nas treze. **Duro:** 8,8% de vitória ·
2,82 quedas · 3,11 PV. **Brando:** 100% · 0 quedas · 94,2% de PV. E o retrato de
200 combates no duro, contra o de T1: 1ª queda **4,72** (T1: 4,41 → 4,64), quedas
**556** (T1: 566 → 563), PV do grupo **835** (T1: 675 → 754) — **três dos cinco
caem em cima, e caíram depois do conserto**: o acordo de 4,41 que a régua antiga
exibia era acordo por engano.

### Decisões médias tomadas (com o motivo)

- **O item do ciclo mudou de B2 para o conserto da régua, e B2 espera.** Motivo:
  uma régua com defeito conhecido não pode medir o antes e o depois de B2. Se o
  conserto e a mudança saíssem na mesma versão, o par antes/depois que a pessoa
  pediu no diário estaria **confundido** — não se saberia quanto do movimento foi
  do bônus e quanto foi do instrumento. Régua primeiro, uma etapa por ciclo.
- **A sabotagem 1 subiu de 4 elites nv7 para nv8, e o piso não se moveu um
  dígito.** Depois do conserto, a sabotagem antiga passou a medir **36,4%** contra
  um piso de 35%: **parou de morder**, e dente que não morde não é dente. A saída
  não foi mexer no piso (35%–65% é lei da casa, herdada da arena) e sim tornar a
  sabotagem uma sabotagem de novo. **O que se perdeu está escrito no comentário**,
  porque perder resolução em silêncio é pior do que perdê-la: a menor mudança de
  dureza que a faixa pega hoje é de **dois** níveis, não de um.
- **A folga mínima caiu de 3,70 para 3,45 margens e NÃO foi comprada de volta.**
  Subir o teto de PV de 35 para 36 devolveria os dois décimos que o conserto
  custou — e seria afrouxar um dente por cosmética. A lei escrita é "mais de 2
  margens", e 3,45 passa longe.
- **Uma asserção mudou de rótulo, nenhuma mudou de condição.** A linha "a 2000 as
  famílias discordam em `danoSofrido`" afirmava uma discordância que o conserto
  **desfez** (a 2000 as quatro agora concordam nas treze). A condição é a mesma
  (`n < maior degrau`); o que mudou é o motivo, e ele está reescrito no
  comentário, como a lei da casa exige de toda asserção mexida.

### O que ficou

- **B2 segue aberta, e agora com escada nova.** Medida depois do conserto: +0
  **52,1%** · +1 55,1% · +2 58,4% · +3 61,3% · +4 64,0% · +5 **66,6% — vermelho
  nos dois tetos**. Cada ponto de dano por golpe do grupo vale **~2,9** pontos de
  vitória (era ~3,5 na medida velha), e a catraca fecha em **+5**.
- **E a divergência não pode mais envenenar B2, caia para que lado cair:** a
  absorção inteira, de zero a cheia, vale **3,6 pontos de vitória e 2,10 PV** no
  `justo`; **dobrá-la** — o tamanho exato da disputa 378 × 918 — custa **1,2 ponto
  e 1,02 PV**, menos de uma margem em cada. Está escrito no cabeçalho do módulo.
- **`src/` intocado outra vez.** Como em B1, esta etapa não somou um ponto de
  dano: os dois arquivos do commit são `testes/regua-combate.mjs` e
  `testes/teste-regua.mjs` (mais VERSÃO, pauta e diário). `App.jsx` não foi
  aberto para escrita em momento nenhum — o bastão era do regente.

---

## 14/09 18:05 · v9.243 · B1 · a régua que falta · commit `322dee7`

> **NOTA DE N1b (15/09, v9.251) — os números de Uma Vida deste bloco foram
> medidos com o Adversário FORA DO CIRCUITO.** A régua passava
> `prioridade: ""` ao `turnoDosInimigos` (`regua-combate.mjs:612`), e
> `combate.js:279` só consulta `escolherAlvo` quando ela existe — o jogo
> passa a intenção da luta (`App.jsx:13606`). A MESMA régua, com o
> Adversário ligado, mede no `justo` **1,4–1,8% de vitória (era 51,1–54,2%), 0,41–0,64 PV de grupo de 132 (era 25,88–28,05) e 2,978–2,986 quedas de 3 (era 1,740–1,790)** e no `duro` **0,0% de vitória (era 8,8–9,9%), 0,00 PV e 3,000 quedas**.
> **Este bloco não foi reescrito de propósito.** Os números dele continuam
> reproduzíveis byte a byte com `medir(..., { comAdversario: false })`, e a
> suíte afirma isso em toda rodada de `npm test`.

- **estado inicial:** árvore limpa, HEAD `85c23e8`, VERSÃO v9.241, `npm test`
  181/181 suítes + 9/9 varredores verde. Sem trava de ciclo (posta por mim).
  **Duas mentes na mesma árvore:** o `regente` rodava D1 ao lado; durante o
  ciclo ele commitou e bumpou para v9.242, então esta etapa saiu em **v9.243**
  (a lei do número maior, e nenhum conflito — B1 não tocou território nenhum
  do desenho). **O bastão do `App.jsx` não foi tomado porque não foi preciso:**
  B1 é motor e medida, e fecha sem uma linha de tela.
- **conselheiro:** não chamado (etapa já escrita e aprovada; a pauta tem mais de
  5 itens em "Aberto").
- **o item:** **B1 · a régua que falta**, primeira etapa da Fase B, aprovada pela
  pessoa com uma condicional que é a fase inteira — *"se o bônus for lícito e
  justo"*. **Provar que é justo faz parte do trabalho**, e até hoje não havia com
  o que provar: a catraca de 35–65% só existia para a arena, e **toda mudança de
  combate em Uma Vida foi julgada por argumento, não por número.**
- **backend:** `testes/regua-combate.mjs` (756 linhas) — o simulador determinístico
  de combates de Uma Vida, compondo os motores reais (`turnoDosInimigos`,
  `turnoDosCompanheiros`, `resolverAtaque`, `absorverDano`, `tickCondicoes`,
  `erguerGuarda`, `testeConcentracao`…). 13 exports, cenários e amostra em tabela
  nomeada, média e margem de erro saindo do módulo e não de conta à mão.
- **testes:** `testes/teste-regua.mjs` (578 linhas, **115 asserções**, 9 seções) —
  a catraca. **Quatro sabotagens: três mordendo e um controle verde.** A suíte
  custa 12,3 s dos 122 s de `npm test`.
- **B1 não somou um ponto de dano.** `src/` inteiro intocado, `App.jsx` intocado;
  os dois únicos arquivos do commit são a régua e a sua suíte (mais VERSÃO, pauta
  e diário). Era a promessa da etapa e está cumprida byte a byte.

### A linha de base de hoje — o retrato contra o qual B2 será julgada

N = 1000, família `umavida`. Valor ± meia-largura do IC de 95%.

| métrica | duro | **justo** | brando |
|---|---|---|---|
| quedas (de 3) | 2,81 ± 0,04 | **1,82 ± 0,08** | 0,00 ± 0,00 |
| primeira queda (rodada) | 4,65 ± 0,13 | **4,30 ± 0,13** | — (ninguém cai) |
| PV do grupo (de 132) | 3,34 ± 0,77 | **24,98 ± 1,90** | 124,34 ± 0,43 |
| PV do herói (de 42) | 0,48 ± 0,18 | **5,58 ± 0,55** | 31,93 ± 0,45 |
| rodadas | 8,05 ± 0,15 | **7,73 ± 0,10** | 2,94 ± 0,02 |
| dano desferido | 249,22 ± 6,33 | **260,62 ± 4,94** | 142,60 ± 1,67 |
| dano sofrido | 319,69 ± 3,65 | **274,74 ± 3,69** | 18,51 ± 0,60 |
| PV parados no abrigo | 1,74 ± 0,18 | **1,75 ± 0,18** | 0,79 ± 0,13 |
| vitória | 8,70% ± 1,75 | **49,80% ± 3,10** | 100,00% ± 0,30 |
| queda do herói | 100,0% ± 0,30 | **98,10% ± 0,85** | 0,00% ± 0,30 |
| TPK | 91,30% ± 1,75 | **50,20% ± 3,10** | 0,00% ± 0,30 |
| estourou o teto | 0,00% | **0,00%** | 0,00% |

**O molde de P3/T1, reconstruído.** O script original morreu com o scratchpad —
sobreviveu a descrição no diário, e foi dela que a fiação voltou. Contra o retrato
de T1 (200 combates, `umavida|0..199`, duro): 1ª queda **4,41** contra 4,41, e
quedas **545** contra 566→563. Uma peça foi **recuperada por medição**: o PV do
inimigo sai do nível **do próprio inimigo**, não do nível do herói — com 59 PV a
régua mediria 289 quedas e 1ª queda 3,73, e nenhum número de T1 ficaria de pé.
Está escrito no cabeçalho do módulo com o motivo de desenho (senão `nivel: 9` não
decidiria nada).

### Decisões médias tomadas (com o motivo)

- **Nasceu um terceiro cenário, `justo`, e é o que importa.** `duro` e `brando`
  estão **saturados nas duas pontas**: no duro caem 2,81 dos 3 e sobram 3 PV de
  132 (não há para onde descer); no brando ninguém cai nunca e sobram 94% (não há
  para onde subir). É a mesma leitura honesta que P3 já tinha escrito ("mede uma
  base de 2,6% do máximo"). Motivo: **uma mudança que passa nos dois extremos não
  provou nada** — uma régua que não se mexe não é régua. `justo` (4 elites nv6) põe
  a mesa em 49,8% de vitória, 1,82 quedas e 19% de PV, com folga nos dois sentidos,
  e foi calibrado **pela própria régua** (4 elites nv9 = 9% · nv7 = 34% · nv6 = 50%;
  3 elites nv9 = 78%) em vez de por palpite. É item de tabela, no formato dos dois
  que já existiam — nenhuma regra de jogo mudou.
- **A amostra é 1000, e o teto tem motivo, não é número redondo.** As médias param
  cedo (entre 500 e 2000 as quedas mexem 0,04). Quem decide o N é a **margem**: a
  N=1000 as quatro famílias independentes **concordam nas treze métricas**; a
  N=2000 `danoSofrido` passa a **discordar** (5,23 de distância contra margens que
  somam 5,18). A amostra maior não achou diferença de jogo — achou o próprio
  resorteio, porque a precisão ficou mais fina que a distância entre famílias.
  **1000 é o maior N em que a régua ainda concorda consigo mesma**, e é a lição de
  A4 e C2b aplicada antes de doer, não depois.
- **A régua mora em `testes/`, não em `src/`.** Foi pedida em `src/regua-combate.js`
  e o `backend` recusou com razão: `teste-ligacao` exige que todo módulo de `src/`
  seja importado por outro módulo de `src/`, e **nada no jogo importa (nem deve
  importar) um simulador de balanceamento** — ali ela nasceria vermelha no dia em
  que nascesse. `testes/` tem precedente farto (`medir-*`, `sonda-*`, `p1..p4`,
  `calibra-poder`). Como `teste-ligacao` só varre `src/`, a suíte carrega a catraca
  que faltava: a **seção 9** prova que os 13 exports têm leitor, e que nada de
  produção a importa. Preferir `src/` custaria um perdão escrito, e perdão em lei é
  preço alto para mudar uma pasta.
- **A faixa 35–65 não é número novo: é a lei da arena, lida como texto.** A suíte
  abre `teste-arena.mjs` e confere que `piso: 0.35` / `teto: 0.65` continuam lá.
  Motivo: se o mesmo limiar existisse escrito em dois lugares, um dia divergiriam em
  silêncio — assim, o dia em que alguém mexer num dos dois, este dente morde.
- **O que NÃO virou limiar, e por quê.** `absorvido`/`abrigos` (ralos e oscilantes),
  `danoSofrido` (a única que discorda quando N cresce), `pvHeroi`/`quedaDoHeroi` no
  duro e no justo (saturados em 98–100% — limiar em cima de um teto não mede nada) e
  `primeiraQueda` no brando (conjunto vazio). Ficaram como `pendente(...)`, que
  imprime e não falha. Motivo: **afirmar o instável é pior que não afirmar** — uma
  catraca que pisca sozinha ensina a gente a ignorá-la. No brando a honestidade
  virou asserção: `n === 0 && margem === Infinity`, para a régua nunca inventar
  número onde não houve queda.

### Virou catraca — três dentes e um aviso

Cenário `justo`, 4 famílias × 1000 sementes, tudo lido de `CATRACA_DE_UMA_VIDA`:

| dente | limiar | retrato (4 famílias) | folga |
|---|---|---|---|
| faixa de vitória | **35% – 65%** (a lei da arena) | 49,8 · 51,7 · 52,8 · 52,6% | 3,94–5,75 margens |
| teto de PV do grupo | **≤ 35** (de 132) | 24,98 · 25,35 · 27,24 · 27,70 | 3,70–5,28 margens |
| piso de quedas | **≥ 1,2** (de 3) | 1,822 · 1,798 · 1,749 · 1,725 | 6,41–7,79 margens |
| guarda | `estourouTeto === 0` nos três cenários | 0 em todas | — |

**A folga mínima (3,70 margens) é ela mesma uma asserção** (`> 2 margens`): se a
folga encolher, a régua deixou de ser confiável **antes** de ficar vermelha, e
descobrir isso quando já está piscando é tarde demais.

**Ela morde** — quatro sabotagens, todas por cenário (nunca por `src/`): controle
50,0% **verde** · 4 elites nv7 → **34,2%** (derruba *só* o piso de vitória, por oito
décimos de ponto) · 3 elites nv9 → **76,2%** (derruba os três) · grupo nv7 → **90,2%**
(derruba os três). O controle existe para que as outras não possam estar vermelhas
por o caminho ter quebrado algo, e bate com a medida por id até 1e-12.

### O que ficou

- **Para B2, o número que ela vai querer:** cada ponto de dano por golpe do grupo
  vale **~3,5 pontos de vitória** (+1 → 52,5% · +2 → 56,5% · +3 → 60,3%), e a catraca
  fica vermelha por volta de **+4/+5**. O **PV do grupo é o dente mais sensível**
  (+1 já sai da margem); a **vitória é o mais estável**. A escada foi medida no
  `regua-combate.mjs` e **não** foi reproduzida na suíte — somar dano fixo por golpe
  exigiria mexer no motor (`bonusArmaComp` vem de `equipados.arma.atributos.dano`, e
  `fichaDoGrupo` monta `equipados: {}` cravado), e B1 prometeu não mexer.
- **A absorção divergiu de P3 pela metade, e é a mesma porta que B2 encosta.**
  Esta régua mede **378 PV parados em 63 abrigos**; T1 mediu **918 em 153**. O escudo
  nasce menos da metade das vezes. Ou o molde perdido tinha mais nascimentos, ou algo
  mudou entre P3 e hoje — **olhar antes de B2, não depois**. Escrito na pauta, em B2.
- **Para a pessoa decidir (pesado), um achado que a régua não foi buscar:** o herói
  cai em **98,1%** dos combates do `justo` e **100,0%** dos do `duro`, quase sempre na
  rodada 1 ou 2, porque `turnoDosInimigos` manda 65% dos golpes nele e oito golpes de
  elite por rodada contra 42 PV e defesa 16 não têm resposta. Depois disso a cena é
  "três companheiros lutando sozinhos". **Pode ser exatamente a tensão desejada, ou o
  protagonista sendo apagado da própria luta** — e nenhum número resolve a diferença.
  Está na pauta, em "Para a pessoa decidir".
- **Não avançou para B2**, como pedido. A vez seguinte da fila aprovada é B2.

---

## 14/09 17:05 · v9.241 · T4 · as portas de saída declaradas · commit `79567ce`
- **estado inicial:** árvore limpa, HEAD `acc62ff`, VERSÃO v9.240, `npm test`
  181/181 suítes + 9/9 varredores verde. Sem trava de ciclo (posta por mim). A vez
  era **T4**, a última etapa da Fase T, com a lei da pessoa por inteiro: *"se a cura
  não limpa, a limpeza vem de magia, habilidade de classe e item — e isso tem de
  existir de verdade, não virar condição sem saída."*
- **conselheiro:** não chamado (etapa já escrita e aprovada; a pauta tem mais de 5
  itens em "Aberto").
- **backend:** a tabela `PORTAS_DE_SAIDA` em `condicoes.js`, no molde de
  `SALVAGUARDA_DO_FIM_DO_TURNO` — três famílias com autoridade declarada, critério
  de três testes para o alcance da magia, e `porque` por linha. Mais
  `portaDeSaida`, `removerPelaPorta`, `linhaDaPortaDeSaida` e
  `coberturaDasCondicoes`. **Nenhum módulo novo**, de propósito: um `src/portas.js`
  ficaria mudo até a fiação e acenderia o `teste-ligacao`.
- **frontend:** 63 linhas em `App.jsx:12712–12773` — o ramo `curar_condicao` que
  faltava em `usarFuncaoMagica`, ao lado do de `cura`, em `try/catch` com
  `calou("porta-de-saida-da-magia")`. Zero regra e zero frase no App: só o nome do
  dono.
- **testes:** `teste-cond.mjs` 245 → **394**; `teste-ligacao.mjs` 20 → **21**.
  **13 sabotagens, 13 mordendo, nenhuma nasceu verde.** Quatro asserções movidas,
  cada uma com o motivo escrito no comentário.

### A promessa mais antiga do catálogo, enfim cobrada

**Restauração Menor e Maior nunca fizeram nada.** As duas estão no grimório desde
sempre (`grimorio.js:130` e `:173`), declaram `funcao: "curar_condicao"`,
`resolvidaPeloSistema` devolve `true` para elas e `magiaDeFuncaoNaAcao` já as
entregava — e **não existia um ramo para `curar_condicao`** em `usarFuncaoMagica`.
Conjurá-las caía no `return false` do fim: gastava a vez, não tirava condição
nenhuma. Ninguém tinha cobrado a promessa porque ninguém tinha ido conferir.

### Três autoridades, não uma — e essa foi a decisão que mais pesou

O desenho óbvio era fazer o canal `restauracao` mandar em tudo: quem o declara
sai por porta, quem não o declara não sai. **Ele teria apagado seis comportamentos
vivos em silêncio.** Poção e relíquia removem hoje **seis ids que o canal não
declara** — `atordoado`, `amedrontado`, `queimando`, `agarrado`, `lento`, `caido`
— e os dois removedores (`pocoes.js:151`, `relicas.js:281`) funcionam desde sempre.

Então a tabela declara **três famílias com autoridade separada**, e diz por escrito
qual é a de cada uma: **o canal `restauracao` é a autoridade da MAGIA e só dela**;
a lista `remove`/`limpa` do frasco continua sendo a palavra final do frasco. As
linhas de item **não** aparecem na tabela — duplicá-las seria ter duas verdades
sobre o mesmo objeto. `pocoes.js` e `relicas.js` seguem byte a byte.

**O alcance da magia sai de três testes, não de gosto:** (1) declara o canal;
(2) é aflição, não ferimento — é o **teste 2 de T3 reaproveitado**, e corta
`sangrando` pelo mesmo motivo escrito lá; (3) o degrau — a Menor tira o que foi
**posto** em você, a Maior tira também o que foi **tirado** de você. Menor (2º):
`envenenado`, `cego`, `paralisado` (a lista literal do 5e). Maior (5º):
`enfeiticado`, `exausto`, `enfraquecido` **mais tudo da Menor** por `herdaDe` —
divergência do 5e **declarada**, porque um 5º círculo que não faz o que o 2º faz é
armadilha de ficha.

### Decisões médias, com o motivo (é o que a pessoa audita)

- **Três `saiCom` mudaram, e o `"longo"` junto era obrigatório.** `paralisado`
  `—` → `["longo", "restauracao"]`, `enfraquecido` e `exausto` `["longo"]` →
  `+ "restauracao"`. O `"longo"` em `paralisado` **não é enfeite**: `saiCom`
  não-vazio **desliga** a regra implícita de `limparPorDescanso`, e um
  `["restauracao"]` sozinho tiraria dele a noite que ele já tinha. É a armadilha
  exata que T2 mediu em `enfeiticado`, e agora ela é asserção.
- **A remoção é função nova e própria, não a do descanso.** T2 trancou
  `limparPorDescanso` contra canal que não seja de descanso, de propósito. Passar a
  magia por ali seria arrombar a fechadura da etapa anterior.
- **`quantasPorVez: null` (todas as que a porta alcança), e é lido.** Divergência do
  5e ("escolha uma") escrita: lá há jogador para escolher; aqui seria diálogo no meio
  do turno, e o acervo já limpa lista inteira — Sais Aromáticos tiram duas num gole.
- **Quando não há o que tirar, o sistema recusa ANTES de cobrar.** `r.mudou ===
  false` → linha de recusa, PM intactos, o turno não vai ao Mestre. É o molde da
  poção cheia (`pocoes.js:153`, `gastou: false`) e do `identificar` do próprio App.
- **`Purificar` e `Palavra de Coragem` entram na tabela com `resolve: false` e um
  `aguarda` escrito — e a cobertura NÃO as conta como saída.** Contá-las seria a
  catraca passando verde numa promessa vazia, que é a doença que esta fase inteira
  foi curar.

### `concentrado` — resolvido, não perdoado

Era a única condição do jogo **sem saída nenhuma**: `turnos: null`, `tipo: "bom"`,
`saiCom: []`. Não vence no relógio, o descanso longo não a pega (a regra implícita
só vale para `ruim`) e T3 não lhe deu salvaguarda — ela cai no teste 3 do critério,
porque ninguém rola para se livrar da própria bênção.

Ganhou `saiCom: ["curto", "longo"]`, com o motivo no catálogo: **no 5e a
concentração não sobrevive a um descanso**, e uma hora de parada já é mais que o teto
de uma concentração inteira. **O efeito em mesa é zero, confirmado:** nada no `src/`
nem no `App.jsx` aplica essa condição — a maquinaria de concentração vive em
`efeitos.js`, sobre `pers.efeitos`. Resolver custou zero e é mais honesto que abrir
exceção; **a lista de perdão da catraca nasce vazia**, e é assim que ela deve morrer.

### A catraca que fecha a fase

`[T4 · A CATRACA QUE FECHA A FASE] toda condição tem ao menos uma saída`
(`teste-cond.mjs`): prazo, salvaguarda ou porta. O dente é
`coberturaDasCondicoes().semSaida` filtrado pelo perdão, contra `tetoSemSaida: 0`.
**Uma condição nova amanhã sem saída quebra a suíte no dia em que nascer.**

**Piso de alcance** no molde do `check-cura-nao-limpa.mjs` de T2, para a catraca não
passar verde medindo lista vazia — catálogo 21 · ruins 13 · boas 8 · prazo 19 ·
descanso 13 · salvaguarda 7 · porta 13 · com mais de uma 13 · magia 6 · item 10. Mais
dois dentes que não são número: a cobertura lê **o mesmo catálogo** que o resto da
suíte (`cob.total === listaCondicoes().length`), e a contagem de salvaguarda tem de
bater com uma leitura independente de `salvaguardaDeSaida` — se as duas discordarem,
uma está medindo nada. A lista de perdão cobra **motivo escrito por linha**.

### O que o jogador lê (ao vivo, sem `mostrarRolagens`)

```
🌿 Restauração Menor · −3 PM
🧪 Vera: o veneno afrouxa e sai do sangue; a vista volta, embaçada primeiro.

🌿 Restauração Maior · −9 PM
💜 A vontade volta a ser sua, e o que você fez ainda está lá; o corpo lembra o
   que é ter fôlego; o veneno afrouxa e sai do sangue.

✋ Restauração Menor: a mão se abre e não acha o que desfazer — os 3 PM ficam
   com você.
```

A frase nasce no módulo, ao lado do número, como `testeConcentracao.linha` (C2) e
`linhaDaSalvaguarda` (T3). O App não monta uma sílaba, e o dente que prova isso está
na suíte: **nenhum id do catálogo aparece no bloco novo do App** — nem `remove`, nem
`saiCom`, nem `restauracao`, nem `PORTAS_DE_SAIDA`.

**Teto de prompt:** `CONDICOES_PROMPT` **1650 → 1648 chars (−2)**, palavra por
palavra e não bloco novo. A frase final dizia *"quem a tira é o relógio ou o
descanso"* — já era falsa desde T3 e ficaria mais falsa com T4; hoje diz *"quem a
tira é o sistema, nunca você"*, mais curta e verdadeira para os quatro caminhos. A
pior cena do turno: **56366 → 56366 chars**, crescimento estático **zero**.

### Regressão em Uma Vida: zero, provada e não afirmada

As listas do que o descanso **curto** e o **longo** limpam estão escritas por extenso
na suíte como **ANTES** (`ANTES_CURTO` 3 ids, `ANTES_LONGO` 12 ids) e são idênticas
às de hoje — `concentrado` é a única diferença nos dois canais, e nada o aplica. As
três declarações novas de `"restauracao"` são inertes por estrutura:
`limparPorDescanso` é o único leitor de `saiCom` no projeto e recusa canal que não
seja de descanso. `pocoes.js` e `relicas.js` intocados.

---

## A FASE T ESTÁ FECHADA — o antes e o depois inteiro

A pessoa ditou a lei de D&D 5e em uma frase (*"cura normal apenas recupera PV mas não
remove a condição; daí vêm magias, habilidades de classe, itens e os testes de
resistência"*), e quatro etapas depois o jogo a cumpre dos quatro lados. O que havia
antes, em número:

**1. O relógio não alcançava o grupo (T1 · v9.238).** `tickCondicoes` tinha **dois**
sítios — o herói e os inimigos — e **zero** no `pers.grupo`. Em 1000 combates de Uma
Vida: **condições do grupo que vencem 0 → 727** no cenário duro e **0 → 305** no
brando, cada uma em 4,1 turnos; companheiro-rodadas com condição **4040 → 2335
(−42%)**. E a medição desmentiu a própria pauta: **o veneno eterno do companheiro
nunca existiu** — `aplicarCondicoesDosGolpes` só processa `alvoRef === "jogador"`. O
que o relógio tirou foi uma **vantagem** de trinta versões, e 94% dela era
`protegido`, que não compra defesa para ninguém. Real em contagem, quase inerte em
efeito — e virou achado, não conserto de carona.

**2. A cura dizia limpar e não limpava (T2 · v9.239).** Quatro condições declaravam
`saiCom: ["cura"]` — `envenenado`, `sangrando`, `cego`, `enfeiticado` — e **ninguém
lia esse canal**: promessa morta que contradizia a lei no próprio catálogo. Varridas
**45 portas de cura em 16 arquivos** e **nenhuma de gameplay escreve em `condicoes`**
(só o `/curar` do console criativo, que é chave do mundo e ficou declarado). O canal
foi **renomeado, não apagado** — apagá-lo deixaria `enfeiticado` com `saiCom: []` e
faria **a noite inteira passar a quebrar encantamento**. Catraca permanente:
`check-cura-nao-limpa.mjs`, 33 asserções, com piso de 35 portas / 8 arquivos.

**3. A salvaguarda não existia (T3 · v9.240).** Das 13 ruins, **0 → 7** ganharam
segunda chance no fim do turno, deduzidas por **critério de três testes** que a suíte
lê de volta — não por lista de gosto. As sete somavam **19 turnos** de prazo puro e
passam a somar **12,33 (mod 0) a 9,12 (mod +6) — corte de 35% a 52%**; `envenenado`
4t → **2,02t (−50%)**, e em PV 8 → **4,05 (−49%)**. As 6 que não ganharam têm o motivo
escrito por linha, e a convergência **7 + 6 + 8 = 21** é asserção.

**4. As portas não existiam (T4 · v9.241).** A magia que limpa estava no grimório e
era **inerte desde sempre**: **0 → 2** portas de magia vivas, alcançando **6**
condições. O item já funcionava e agora está declarado e contado: **10** condições.
A habilidade de classe tem **2** portas declaradas e honestamente **não resolve** —
está escrito na tabela, com o que falta. E o fecho:

| | antes da Fase T | hoje |
|---|---|---|
| sítios do relógio de condição | 2 (herói, inimigos) | **3** (+ o grupo) |
| condições com salvaguarda de fim de turno | 0 | **7** |
| portas de saída declaradas por tabela | 0 | **4** (2 vivas · 2 com `aguarda` escrito) |
| condições que saem por porta que resolve | — (não havia tabela) | **13 de 21** |
| condições com mais de uma saída | — | **13** |
| **condições sem saída nenhuma** | **1** (`concentrado`) | **0** |
| canais de saída | 2 implícitos | **3** declarados, com `porDescanso` lido |
| catracas permanentes da fase | 0 | **2** (`check-cura-nao-limpa` · a catraca da saída) |
| `teste-cond.mjs` | 31 asserções | **394** |

**Teto de prompt nas quatro versões: crescimento estático zero.** A fase inteira
entregou relógio, lei da cura, salvaguarda e portas sem somar um byte de bloco fixo ao
Mestre — `CONDICOES_PROMPT` na verdade **encolheu** (−10 chars em T2, −2 em T4),
porque as duas vezes em que ele mentia foram consertadas trocando palavra por palavra.
E o jogador lê as quatro novidades **em voz de mundo, sem `mostrarRolagens`**, com as
frases nascendo no módulo ao lado do número: `✓ Irmã Vela: Abençoado passou` (T1),
`🧪 O veneno afrouxa e sai do sangue — deu 20, e bastavam 12` (T3), `🧪 Vera: o veneno
afrouxa e sai do sangue; a vista volta, embaçada primeiro` (T4).

**Sabotagens da fase: 15 + 7 + 27 + 13 = 62, todas mordendo** — e as **duas** que
nasceram verdes (em T3) estavam **no teste, não na produção**, que é exatamente o
achado que uma escada de sabotagem existe para produzir.

- **o que ficou / foi para a pessoa:**
  - **Um resolvedor de habilidade de classe** — medido: o único caminho que o sistema
    executa sozinho é `magiaPorNome` + `resolvidaPeloSistema` + `usarFuncaoMagica`, e
    habilidade de classe **não passa por lá** (`Purificar` e `Palavra de Coragem`
    aparecem **0 vezes** no `App.jsx`). É órgão novo, e sobe para a pessoa.
  - **PV temporário** — a outra metade de `Palavra de Coragem`. Não existe em lugar
    nenhum do código. Mecânica nova.
  - **Acervo faltando (item de pauta, leve):** `doença` e `surdez` (que a Restauração
    Menor promete) e `maldição` (que a Maior promete) **não existem no catálogo de
    condições**. A `petrificação` está coberta como alias de `paralisado`.
  - **O alcance visível antes do clique** — `portaDeSaida(m.nome).remove` já entrega
    a lista pronta, mas mostrá-la é mudança no painel de habilidades, fora do escopo
    da etapa. O veredito que importa está de pé por outro caminho: sem nada ao
    alcance, o sistema recusa e não cobra.
  - **O `/curar` do console criativo** segue com o nome que tem. É cosmética de
    bastidor, não gameplay.
  - **A próxima fase é a B** — o bônus do companheiro, se for lícito e justo,
    começando por **B1 · a régua que falta**.

### Registro honesto: a casa mudou de regra no meio deste ciclo

Este ciclo começou com `HEAD` em `acc62ff` e terminou commitando sobre `b9c3df2`
— *"A segunda mente: o desenho ganha fila, regente e bastão"* —, que a **pessoa
commitou às 13:36, quinze minutos depois de eu pôr a trava**. Não houve ciclo
morto e não houve colisão: aquele commit toca `mente/` e `.claude/`, e T4 tocou
`src/` e `testes/`. Mas ele muda o mundo em que T4 fechou, e o registro fica:

- A **Fase D** saiu de `mente/pauta.md` para `mente/pauta-desenho.md` — a fila da
  segunda mente. A `pauta.md` é do sistema agora, e é onde este item foi fechado.
- **O `App.jsx` passou a ter bastão** (`.claude/app-jsx`), e o `frontend` editou
  `App.jsx` **sem tomá-lo** — porque a regra nasceu depois de o ciclo começar.
  Não houve dano (a fila do desenho ainda não rodou uma vez, e nenhuma outra mão
  esteve no arquivo), mas é dívida de procedimento, dita e não escondida. **Do
  próximo ciclo em diante o bastão vale**, e quem tocar o `App.jsx` o toma.
- O procedimento de subir mudou junto: caminhos um a um (que esta casa já fazia),
  `VERSAO` como última edição antes do commit, e `git pull --rebase` em push
  recusado — com o número **maior** vencendo em conflito de `VERSAO`.

---

## 14/09 13:05 · v9.240 · T3 · a salvaguarda no fim do turno · commit `c6d290f`
- **estado inicial:** árvore limpa, HEAD `ace9c60`, VERSÃO v9.239, `npm test`
  181/181 suítes + 9/9 varredores verde. Sem trava de ciclo (posta por mim). A vez
  era **T3**, terceira etapa da Fase T, com a lei da pessoa: *"os testes de
  resistência para alguns venenos — tipo, teste de salvaguarda de Constituição
  exigido pelo veneno no final do turno."*
- **conselheiro:** não chamado (etapa já escrita e aprovada; a pauta tem mais de
  5 itens em "Aberto").
- **backend:** a tabela `SALVAGUARDA_DO_FIM_DO_TURNO` em `condicoes.js`, no molde
  de `CONCENTRACAO_DA_MAGIA` — regra geral + **critério de três testes que a suíte
  lê de volta** + 7 exceções que permitem e 6 que não, cada uma com o motivo. Mais
  `salvaguardaDeSaida`, `linhaDaSaidaDeCondicao` e `tentarSaidaNoFimDoTurno`. A
  rolagem é **inteiramente** de `salvaguardas.js` — nenhum d20 novo. `App.jsx`
  intocado.
- **frontend:** 89 linhas nos três sítios do relógio de T1 (herói `:8293`, grupo
  `:8364`, inimigos `:8414`), cada um em `try/catch` com `calou`, **sempre depois
  de `tickCondicoes`**. Zero regra e zero frase de regra no App: o único texto que
  ele fornece é o nome do dono.
- **testes:** `teste-cond.mjs` 102 → **245**; `teste-sala.mjs` 123 → **125**.
  **27 sabotagens em T3, 27 mordendo** (duas nasceram verdes e foram consertadas),
  3 no `teste-sala`, 3 mordendo. Nenhuma asserção antiga movida.

### O critério é que era a etapa, não a lista

A pauta pedia "cada condição declara se permite salvaguarda". O risco dessa frase
é virar lista de gosto — sete nomes escolhidos a dedo, que a suíte só prova
copiando. O que nasceu no lugar foi **um critério de três testes**, escrito na
tabela e lido de volta pela suíte, que deduz sozinho a posição de uma condição
nova:

1. **`turnos >= 2`** — com prazo de um turno a segunda chance chega no mesmo
   instante em que o relógio já vence; rolar ali nunca muda nada. Corta
   `atordoado` e `caido`.
2. **Efeito sustentado, não ferimento** — a salvaguarda expulsa o que continua
   agindo; ferida aberta e fogo pegado são estrago em curso, e a saída deles é
   cura ou porta declarada. Corta `sangrando` e `queimando`.
3. **Só ruim** — ninguém resiste à própria bênção (no 5e é literal: pode-se
   falhar de propósito). Corta as 8 boas de uma vez.

**7 ganharam**, cada uma com âncora 5e escrita na linha: `envenenado` vigor CD12
(o exemplo da pessoa), `paralisado` vigor CD14 (Imobilizar), `agarrado` forca CD12
(Golpe Enredante), `amedrontado` presenca CD12 (Medo), `cego` vigor CD12
(Cegueira/Surdez), `enfraquecido` vigor CD12 (Raio do Enfraquecimento), `lento`
vigor CD12 (Lentidão). **6 ruins não ganharam, com motivo por linha.** A
convergência **7 + 6 + 8 = 21** é asserção: é o que transforma "ninguém ficou sem
posição" em "a tabela fala do catálogo que existe".

### A CD é herdada, o atributo não — e `cego` é a prova

A CD sai da `resistir.dif` da própria condição onde existe (envenenado 12,
paralisado 14, agarrado 12, amedrontado 12), e 12 onde não existe. **O mesmo
veneno não pode ter duas forças, uma para pegar e outra para sair.** Mas só o
número é herdado: `resistir` usa `"agilidade"` e `"vontade"`, que **não existem**
em `ATRIBUTOS` nem em `SALVAGUARDAS`. São **duas perguntas diferentes** —
entrada (`aflicoes.js`, "o veneno pega?") e saída ("o corpo expulsa?"). `cego` é
o caso que prova: não tem entrada e tem saída; a porta que CEGA é Percepção, a
que DESCEGA é Vigor.

### O efeito, medido em número

Conta fechada `E[D] = (1−(1−p)^N)/p` **e** Monte Carlo de 60 mil execuções pelo
código real, semeado — os dois batem na segunda casa.

| condição | prazo puro | CD | mod +0 | mod +2 | mod +4 | mod +6 |
|---|---|---|---|---|---|---|
| envenenado | 4t | 12 | **2,02t (−50%)** | 1,74t | 1,52t | 1,33t |
| amedrontado · enfraquecido · lento | 3t | 12 | 1,85t (−38%) | 1,65t | 1,47t | 1,31t |
| paralisado | 2t | 14 | 1,65t (−18%) | 1,55t | 1,45t | 1,35t |
| agarrado · cego | 2t | 12 | 1,55t (−22%) | 1,45t | 1,35t | 1,25t |

**As sete somavam 19 turnos de prazo puro; passam a somar 12,33 (mod 0) a 9,12
(mod +6) — corte de 35% a 52%.** As seis ruins que não ganharam somam 10 turnos e
não mudam um dado. Onde a condição dói (`envenenado`, 2/turno, 8 PV de prazo
puro): mod +0 → **4,05 PV (−49%)**, saindo antes do prazo em **83%** das vezes.

**A faixa do herói é a real, e foi conferida nos oito prontos:** salva de Vigor
**+1 a +5**, mediana +3 (Muralha +5, Sombra +1). O `frontend` levantou alarme de
que o herói passaria quase sempre — era artefato de ficha sintética com `vigor:
15`; os atributos desta casa **já são modificadores** (0–3 em `prontos.js`). O
inimigo rola dado cru (`modSemFicha: 0`, declarado com três motivos, o principal
sendo que derivar bônus de `nivel`/`ameaca` seria um segundo sistema de atributos
invisível). **O companheiro fica no meio sem ter um único atributo**, porque
declara `classe` e a proficiência de salvaguarda entra sozinha: Guerreiro nv5
rola com **+3**.

### O que o jogador lê

Voz de mundo, os dois números, sem nomear o mecanismo, sem depender de
`mostrarRolagens`, e **nascida no módulo** — o App não monta uma sílaba:

```
🧪 O veneno afrouxa e sai do sangue — deu 20, e bastavam 12.
😨 Irmã Vela: o medo solta a garganta — deu 18, e bastavam 12.
🕸 Ogro Sarnento: o corpo se arranca do que o prendia — deu 17, e bastavam 12.
```

**Nasce só no sucesso, e é C2 pelo motivo inverso:** lá a linha só vem na queda
porque uma a cada golpe aguentado seria ruído; aqui o evento é a saída, e uma
linha a cada falha (sete condições × todo turno × todos os portadores) seria o
mesmo ruído multiplicado. **Teto de prompt 81.927 → 81.927 chars**, crescimento
estático zero — e o Mestre não precisou de nota nova, porque
`resumoCondicoesPrompt` já viaja em todo turno e a condição que saiu some de lá
sozinha. Fica dito que a folga contra o teto é de **73 caracteres**.

### Decisões médias, com o motivo

- **A ordem é contrato: relógio primeiro, salvaguarda depois.** Invertida, passar
  na salvaguarda apagaria retroativamente o dano de um turno em que a vítima
  esteve envenenada. O veneno cobra no turno; a chance vem no fim dele. A suíte
  roda **as duas ordens e exige que discordem** (2 PV × 0 PV).
- **O grupo virou passagem à parte, não embutida no `map` de T1.** Embutida, ela
  obrigava a renomear `return { ...g, condicoes: t.condicoes }` — a linha exata
  que uma asserção de T1 guarda. Em vez de mexer na asserção, o bloco ficou logo
  depois, com `try/catch` próprio: mesma ordem, T1 byte a byte intocado, e um
  estouro da salvaguarda não leva junto o tique que já rodou.
- **`teste-sala.mjs` foi semeado** (item de "Aberto", `leve`, resolvido dentro
  deste ciclo). A asserção `vistos.size > 480` sobre 500 `novoCodigo()` **sem
  semente** é colisão de aniversário — 30⁶ ≈ 729 milhões, 124.750 pares, ~1 rodada
  em **5.800** —, e já ficou vermelha duas vezes sem reproduzir (R2 e o meio de
  T2). Hoje roda com `rng(hashSemente("taverna|sala|codigo"))` pelo parâmetro `rnd`
  que já existia: **500/500, sempre**. **O 480 não desceu um dígito** — o número
  estava certo; quem estava errado era a aposta. Duas asserções novas fecham o
  buraco que semear sozinho deixaria (a mesma semente devolve os mesmos 500, e
  `criarSala` repassa a costura).

### O achado do ciclo: as duas sabotagens que nasceram verdes

Das 27, duas passaram — e as duas estavam **no teste, não na produção**, que é o
lugar mais perigoso de um verde falso.

- **A varredura do canal `restauracao` pulava `condicoes.js` inteiro.** Um leitor
  nascido dentro do próprio catálogo passava verde — e o arquivo que **declara** o
  canal é justamente onde ele tem mais chance de ganhar leitor. É o mesmo vício do
  recorte largo que T1 registrou, com outra roupa.
- **A peneira do `concentrado` aceitava "qualquer `id:` na frente"**, e
  `{ id: "concentrado" }` é exatamente como alguém **aplica** a condição: o
  aplicador passava verde. Hoje a entrada do catálogo é reconhecida pela forma
  inteira (`concentrado: { id:`).

Ambas consertadas e re-sabotadas: **27/27**.

### O que ficou

- **`concentrado` NÃO ganhou salvaguarda, e segue problema de T4** — cai no teste
  3 do critério (é `tipo: "bom"`). Continua `turnos: null`, `saiCom: []`, e nada o
  aplica. **O zero está guardado na suíte**, junto com o do canal `restauracao`
  (que **segue sem leitor**, de propósito — é T4): se qualquer um dos dois ganhar
  leitor sem T4 ter acontecido, é vermelho. É o que impede T4 de nascer de carona.
- **Não medido em mesa.** O instrumento de Uma Vida de T1 (`umavida|0..999`) não
  sobreviveu no scratchpad, e reconstruí-lo exigiria pilotar o `App.jsx`. A conta
  fechada e o Monte Carlo pelo código real concordam na segunda casa; a medição em
  combate de verdade fica para quem precisar dela. Dito, não escondido.
- **`protegido`/`defesaDe` não tocado** (segue em "Aberto"), nada consertado de
  carona.
- **Sete suítes com o mesmo vício do `teste-sala`, relatadas e não consertadas** —
  vão para "Aberto". Rodadas 20× cada, zero vermelhas; nenhuma é da classe do
  `teste-sala` (~1 em 5.800). A mais frágil é `teste-onda3.mjs:52` (`mult >= 1.9`,
  Invocador medindo **1,990**, colado no limiar): qualquer ajuste de tabela que
  leve o multiplicador a ~1,93 vira falha intermitente sem defeito real.
- **Três achados de produção, nenhum de T3** — o principal: `tentarSaidaNoFimDoTurno(p, null)`
  estoura, porque `= {}` no destructuring não cobre `null`. Padrão pré-existente em
  quase toda a casa; nenhum dos três sítios passa `null` e os três estão em
  `try/catch`. Vai para "Aberto".
- **Para a pessoa:** `envenenado` cai pela metade (4t → 2,02t no dado cru) já no
  inimigo, e é a maior mexida do lote — justamente na condição que ela citou. É o
  5e ao pé da letra (o veneno de uma aranha gigante raramente gruda quatro
  rodadas) e a CD **não foi afrouxada por gosto**: 12 é a `resistir.dif` que a
  própria condição já declarava. Se ela quiser o veneno mais grudento, o lugar é
  uma linha da tabela — CD ou prazo —, e a suíte lê a mudança de volta.

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

> **NOTA DE N1b (15/09, v9.251) — os números de Uma Vida deste bloco foram
> medidos com o Adversário FORA DO CIRCUITO.** A régua passava
> `prioridade: ""` ao `turnoDosInimigos` (`regua-combate.mjs:612`), e
> `combate.js:279` só consulta `escolherAlvo` quando ela existe — o jogo
> passa a intenção da luta (`App.jsx:13606`). A MESMA régua, com o
> Adversário ligado, mede no `justo` **1,4–1,8% de vitória (era 51,1–54,2%), 0,41–0,64 PV de grupo de 132 (era 25,88–28,05) e 2,978–2,986 quedas de 3 (era 1,740–1,790)** e no `duro` **0,0% de vitória (era 8,8–9,9%), 0,00 PV e 3,000 quedas**.
> **Este bloco não foi reescrito de propósito.** Os números dele continuam
> reproduzíveis byte a byte com `medir(..., { comAdversario: false })`, e a
> suíte afirma isso em toda rodada de `npm test`.
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
