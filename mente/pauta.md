# A pauta da mente

O que a mente pensou e ainda não fez. Cada item tem **peso** (ver a tabela em
`CLAUDE.md`, seção "A mente"): `leve` e `médio` o ciclo executa sozinho;
`pesado` espera a palavra da pessoa. Um item por ciclo. Feito vai para o
`diario.md` — daqui sai.

Formato de um item:

```
- [ ] **título curto** · peso · de: quem propôs · dd/mm
  o quê e por quê, em duas ou três linhas; qual lei da casa ele serve
  (ou qual suíte prova). Se médio: qual catraca garante que não regrediu.
```

---

## Para a pessoa decidir (pesado)

_(vazio — as duas de 13/09 foram respondidas; ver "Aprovado" abaixo)_

<details>
<summary>as duas perguntas como foram feitas (e as respostas)</summary>

- [x] **a concentração está escrita e nunca acontece** · pesado · de: backend (achado de A2) · 13/09
  `App.jsx:13082` testa quem está concentrando quando o jogador apanha, e o
  teste **nunca dispara**: o campo `e.concentracao` existe em `condicoes.js:161`
  e no catálogo do `grimorio.js`, mas **nenhum dos três nascimentos de efeito
  o copia** para `pers.efeitos`. Regra 5e inteira inerte, da família do
  "Comando: Atacar". Ligar é barato (uma linha em `efeitoDeMagia`), mas é
  pesado por consequência, não por custo: passa a existir uma forma nova de o
  jogador **perder** a magia que pagou — mecânica que muda o que ele vive, em
  campanha viva. A pessoa decide se a magia de duração deve poder quebrar.

- [ ] **a família defensiva é promessa que nenhum não-jogador cumpre** · pesado · de: backend+testes (achado de A3) · 13/09
  A3 portou a guarda para a arena e o caminho **funciona** — provado com
  ficha sintética (defesa 15→19, vence na rodada certa). Só que ele quase
  nunca é pisado, e por dois motivos que se somam:
  (a) **nenhum dos 9 nomes de `GUARDAS` (`habilidades.js:312`) casa com
  `RX_BUFF` (`companheiros.js:89`)** — e `decidirAcaoCompanheiro` só chega
  a uma guarda pelo plano `buff`, que exige `ehBuff`. Ou seja: companheiro
  e duelista **nunca erguem guarda**, em campanha ou na arena. Só o herói
  de carne e osso ergue, pela tela.
  (b) `BUFF_DA_HABILIDADE.aplica` é `"dano"` para tudo (`efeitos.js:70`),
  então "Escudo Arcano" — *"absorve o próximo dano"* — vira `+1 de dano
  mágico`. Portado assim de propósito em A2 (regressão zero), mas A3 fez
  isso **aparecer na narração da arena**, que é onde o jogador lê.
  É pesado por consequência, não por custo: consertar (a) faz os
  companheiros da campanha passarem a se defender, e consertar (b) muda o
  que cinco habilidades fazem. As duas mexem no que o jogador vive. A
  pessoa decide se a promessa defensiva deve valer para quem não é ele.

</details>

## Aprovado pela pessoa — executa como fase, UMA etapa por ciclo

### Fase C — a concentração acontece
Decisão da pessoa (13/09), com a regra ditada por ela: *"se a magia exige
concentração e o personagem sofrer dano, ele tem que fazer um teste de
resistência de constituição, a dificuldade CD seria igual a 10 ou metade do
dano sofrido, o maior dos dois, daí se falhar a magia quebra."*

**A regra já existe e é exatamente essa**: `testeConcentracao`
(`combate.js:797`) faz `Math.max(10, Math.floor(dano/2))`, rola d20+modVigor
e devolve `manteve`. Ela não é decisão desta fase — é achado confirmado. O
que falta é o campo chegar até ela.

- [ ] **C1 · o campo nasce e viaja** · de: pessoa · 13/09
  `e.concentracao` existe em `condicoes.js:161` e no catálogo do
  `grimorio.js`, mas **nenhum dos três nascimentos de efeito o copia** para
  `pers.efeitos`. Fazer o campo atravessar (`efeitoDeMagia` e os irmãos, hoje
  em `src/efeitos.js`), e conferir no catálogo que as magias de duração que
  **devem** exigir concentração estão marcadas — a marcação é tabela, não
  julgamento no meio do código. Prova: uma magia marcada nasce com o campo;
  uma não marcada nasce sem; lixo (`null`, `{}`) não inventa concentração.
- [ ] **C2 · a quebra acontece na mesa** · de: pessoa · 13/09
  O `App.jsx:13082` já testa quem concentra quando o jogador apanha — com C1
  ele passa a achar alguém. Conferir o caminho inteiro: o teste roda, a magia
  cai, o efeito some da ficha, e o jogador **lê o que aconteceu** (a quebra é
  gameplay: ele precisa saber que perdeu a magia, e por quê — CD, rolagem).
  Vale para companheiro e inimigo conjurador também, não só para o herói.
  Cuidado: o Narrador não ganha bloco novo — `ECONOMIA_ACAO_PROMPT` já
  descreve a regra; o que muda por turno vai pela `pauta` dinâmica.
- [ ] **C3 · uma de cada vez** · de: pessoa · 13/09
  5e, e o próprio `ECONOMIA_ACAO_PROMPT` já promete: *"um conjurador mantém
  no máximo UMA magia de duração por vez"*. Conferir se o jogo cumpre — se
  conjurar a segunda derruba a primeira. Se já cumpre, é conferência
  registrada e a fase fecha aqui; se não, é o conserto da etapa.

### Fase P — a proteção vale para quem não é o jogador
Decisão da pessoa (13/09): **consertar os dois**, sabendo que atinge Uma Vida
e o Duelo (a premissa "é só no modo rápido" foi conferida no código e está
errada: `turnoDosCompanheiros` é chamado em `App.jsx:13271`, o combate da
campanha, e a mesma função pilota a arena).

A ordem é a da mentira primeiro, porque é a que o jogador lê.

- [x] **P1 · o Escudo Arcano deixa de dar dano** · feito em v9.231 (`3dcf61f`), 13/09
  A tabela nasceu em `combos.js` (`APLICACAO_DO_BUFF`, 5 famílias) e classifica
  pelo **texto** — o campo `tipo` do catálogo erra nos dois sentidos e falta em
  relíquia, poção e grimório. **A etapa era maior do que esta lista dizia:**
  `bonusDeDano` e `bonusDeArma` **nunca leram `aplica`**, então trocar o rótulo
  sozinho não mudaria número nenhum; a segunda metade (os leitores do dano
  respeitando o rótulo, por lista de exceção) é a que fez o número mudar.
  A defensiva nasce com força **zero** e frase sem número, em voz de mundo.
  **Medido contra árvore mutante que reproduziu o retrato de A4 exato:** 391
  buffs defensivos deixaram de somar (golpes com bônus dentro 329 → **108**),
  e a catraca de equilíbrio **não saiu da faixa** em nenhuma família nem no
  retrato (amplitude 15,7 → 15,8, teto 20). **Nenhum pronto reajustado** — a
  medição de P3 fica intacta. Catraca nova: `check-protecao.mjs` sobre **593**
  habilidades (85 do grimório que ninguém contava), a frase da arena sobre 787
  quedas reais, e o dente inverso — **0 habilidade de `ataque` virou proteção**.
  **A defensiva ainda não protege ninguém**, de propósito: o desenho está no
  diário, é achado para P2/P3. Ver o diário.
- [ ] **P2 · o piloto reconhece as nove guardas** · de: pessoa · 13/09
  Nenhum dos 9 nomes de `GUARDAS` (`habilidades.js:312` — casca de carvalho,
  pele arcana, forma dracônica, enxerto mecânico, elixir de combate, vazio
  perfeito, dança sem vulto, nada me alcança, improvável) casa com `RX_BUFF`
  (`companheiros.js:89` — bênção, inspirar, grito, canção, hino, postura,
  escudo, barreira, proteção, fúria). O desencontro é de **vocabulário**, e
  a lição é maior que o caso: `guardaDe(hab)` já existe e decide isso pela
  tabela — o piloto deve **perguntar à tabela**, não adivinhar por regex de
  nome. Catraca permanente: toda entrada de `GUARDAS` é reconhecível pelo
  piloto; uma guarda nova amanhã não nasce invisível.
  **Acrescentado por P1 (13/09):** o `RX_BUFF` erra nos DOIS sentidos, e agora
  há caso concreto do outro lado — **`Dissipar Magia`** casa com ele por conter
  "barreira" e chega a `efeitoDeBuff`: um dispel que narra "+2 de dano mágico".
  P1 o manteve em `dano` pelo veto, porque consertar o vocabulário do piloto é
  esta etapa. E o desenho que P1 investigou e não escreveu mora aqui ou em P3:
  a família `absorve` virando **guarda de uma batida** (campo `absorve: N` em
  `pers.guardas`, consumido e apagado ao ser gasto, reusando `expirarGuardas`)
  — a alternativa, ensinar `defesaDe` a somar efeito, colide com
  `defesaDeGuarda`, que já faz isso com prazo por rodada.
- [ ] **P3 · medir o que mudou nos dois lados** · de: pessoa · 13/09
  Com companheiro e duelista se defendendo, o combate muda em Uma Vida **e**
  na arena. Medir antes de julgar, como a Fase A ensinou: a catraca de
  equilíbrio (35–65% + o teto de amplitude de A4) vai reagir — se estourar,
  o reajuste é o trabalho da etapa. E dizer no diário o efeito na campanha
  (quanto mais o grupo sobrevive), porque isso o jogador vai sentir.
  **A linha de base já existe, medida em P1 (13/09):** retrato de 120 com
  amplitude **15,8** (teto 20), tudo dentro de 35–65; família `rr` muralha 49,0
  · sombra 54,8 · chama 41,4 · remendo 48,6 · voz 51,4 · flecha 61,9 · punho
  49,0 · voto 43,8. É contra estes números que P3 mede, não contra os de A4.

A ordem é esta: a Arena primeiro (menor, e o Duelo está no ar hoje), as
Reviravoltas depois. Dentro de cada fase, a etapa seguinte só começa com a
anterior verde e commitada. Se uma etapa revelar que a próxima não é como
está escrito aqui, o orquestrador corrige a etapa na pauta e diz no diário.

### Fase A — a Arena passa a portar os efeitos · **FECHADA em v9.226, 13/09**
Decisão da pessoa (13/09): *"vamos corrigir e deixar funcionando como
deveria"* — o caminho caro, não o diagnóstico barato. As quatro etapas
verdes e commitadas; o antes-e-depois inteiro está no diário de A4.

- [x] **A1 · a prova que mede o buraco** · feito em v9.223 (`a44da9c`), 13/09
  Seção 7 de `teste-arena.mjs`, com `pendente(...)` e a tabela
  `MEDIDA_DO_BURACO`. **O número do "antes":** 420 quedas · 382 meias-rodadas
  mortas (0,91 por queda, 8,3% do total) · 20 quedas (4,8%) abrem com duas
  guardas · dano depois da guarda 1,034× o normal. Ver o diário.
- [x] **A2 · os efeitos viram módulo puro** · feito em v9.224 (`a137790`), 13/09
  Nasceu `src/efeitos.js` (6 tabelas, 11 funções); o `App.jsx` perdeu as seis
  duplicatas; `regras-jogo.js`, `pocoes.js` e `relicas.js` leem a mesma pilha.
  `teste-efeitos.mjs` com 168 asserções. **Regressão zero conferida:** as dez
  suítes de combate verdes e os dois números de A1 idênticos (20/420 = 4,8%;
  dano após guarda 1,034×). A GUARDA já era módulo (`habilidades.js` desde a
  v9.53) e ficou lá — para A3 a arena não precisa de código novo de guarda,
  só de chamar `erguerGuarda`. Cinco achados anotados abaixo. Ver o diário.
- [x] **A3 · a arena consome os efeitos** · feito em v9.225 (`6168a14`), 13/09
  As duas frentes, na ordem: `arena.js` passou a aplicar de verdade
  (`erguerGuarda` para quem casa com `GUARDAS`, `efeitoDeBuff`+`empilhar`
  para o resto, `bonusDeDano`/`bonusDeArma` no golpe, `tickEfeitos` e
  `expirarGuardas` uma vez por rodada) — e só então o filtro furado de
  `meiaRodada` caiu inteiro. **Os dois números de A1 fechados:** aberturas
  mortas 20/420 (4,8%) → **0 de 424**; meias-rodadas mortas 382 → **0**.
  Na mesa real: 791 buffs firmados, 329 golpes com o bônus dentro, 409
  efeitos vencendo o prazo. Ver o diário.
- [x] **A4 · o equilíbrio: conferir antes de mexer** · feito em v9.226 (`817f96f`), 13/09
  **Conferência, não reajuste — e a conferência passou.** 49 famílias de
  sementes independentes fora da amostra da suíte: **zero estouros** de
  35%/65%. Nenhum número de pronto mudou. A borda de `flecha` (61,9%) era
  viés de amostra — fora dela mede 49,5–57,6, e quem está no topo é `sombra`
  (58,1% no retrato de 480). O trabalho da etapa virou a **catraca**: de uma
  amostra para cinco (4 famílias de 30 + retrato de 120), tabela
  `CATRACA_DO_EQUILIBRIO`, e um dente novo — teto de amplitude (20 pts,
  medido 15,7) que pega o pronto dominante que não estoura o teto sozinho.
  Conferida contra arena mutante: `sombra` com +3 de vida passava na antiga,
  falha três vezes na nova. Ver o diário.

  **A FASE A ESTÁ FECHADA.** Meias-rodadas mortas 8,3% → 0; aberturas mortas
  4,8% → 0,0%; dano após guarda 1,034× → 0,699×; amplitude 24,8 → 20,0 pts.
  A próxima fase aprovada é a **R**, a partir de R1.

<details>
<summary>o texto original da etapa A4 (antes de ser executada)</summary>

  **Corrigido pelo orquestrador em 13/09, depois de A3:** a pauta previa
  que a catraca de 35–65% sairia da faixa com os efeitos valendo. **Não
  saiu** — os oito ficaram dentro, e a amplitude até APERTOU (36,2–61,0 =
  24,8 pts antes; 41,9–61,9 = 20,0 pts depois): muralha 42,9→50,5 · sombra
  47,1→54,3 · chama 36,2→42,4 · remendo 61,0→48,1 · voz 60,5→51,0 · flecha
  55,7→61,9 · punho 38,1→50,0 · voto 58,6→41,9. Logo A4 **não é mais
  "reajustar os prontos"**: é conferir se ainda há trabalho. Quem está na
  borda é `flecha` (61,9%) — e o Caçador é justamente um dos dois prontos
  (com `sombra`) que **não têm habilidade de buff nenhuma**, ou seja, foi o
  que menos ganhou com A3 e mesmo assim subiu. Olhar isso primeiro; se a
  conclusão for "nada a mexer", A4 fecha como conferência registrada no
  diário — equilíbrio é teste, não intenção, e teste verde também é
  resposta. Cuidado herdado: a sonda sintética de `teste-arena.mjs` seção 7
  nasce das fichas de `muralha` e `punho`; rebalancear essas duas move a
  razão (0,699 contra teto 0,9) e o ganho (1,95 contra piso 1). Se alguma
  ficar vermelha depois de um rebalanceamento, é sinal legítimo — não se
  afrouxa o limiar.
</details>

### Fase R — as reviravoltas em harmonia com o resto
Decisão da pessoa (13/09): *"que o sistema de reviravoltas funcione em
harmonia com todos os sistemas"* — ou seja, a saída (c)+(b) do conselheiro:
**criar os trackers que faltam** e **ligar a forma maior**. A saída (a)
(eleger só entre formas com detector) fica **recusada**: trocaria a verdade
eleita de saves existentes, e campanha viva não perde o que sorteou.

- [x] **R1 · os trackers que faltam** · feito em v9.227 (`9d2902f`), 13/09
  Os três nasceram dentro do sistema que já os tocava, nunca como órgão à
  parte. **O sangue** em `npcs.js` (`TIPOS_DE_LACO` ganha o sexto tipo
  `familia`) + **uma** onda em `assuntos.js` (`dois_do_mesmo_sangue`,
  `firmaEntre`) para que ele possa ser firmado em partida. **O ofício** em
  `antecedentes.js`: campo opcional em 8 das 12 entradas + `oficioDoAntecedente`,
  que lê **id OU nome** (o save guarda o nome, não o id — o desenho errava
  nisso). **O informante** em `social.js` (o julgamento: `PAPEIS_DE_INFORMANTE`,
  `ehInformante`, `PEDIDOS_QUE_SAO_CONSULTA`, `consultouInformante`) + o razão
  em `npcs.js` (`registrarConsulta`, `vezesQueUsouInformante`), fiado em
  `App.jsx:14410` dentro de `calou(...)` e invisível na tela. 172 asserções
  novas; suíte nova `teste-antecedentes.mjs`. Nada de reviravolta foi ligado;
  a lista de espera do `teste-ligacao` ficou vazia. Ver o diário.
- [x] **R2 · toda forma eleita tem detector** · feito em v9.228 (`b0b561b`), 13/09
  O detector **desceu para módulo puro** e foi morar **na própria forma**:
  campo `achaAlvo(mundo)` ao lado do `soNasceSe`, nas **sete**, mais
  `garantirMundo` e a fachada `alvoDaForma`. O `App.jsx` perdeu os dois `find`
  que tinha dentro e virou só o que junta os refs. As **três maiores também
  ganharam detector** (seguem inertes — `mexerNaReviravolta` só lê `.menor`),
  porque catraca com três exceções não é catraca. Tabelas novas:
  `LIMIARES_DA_VIRADA` (o `3` do informante saiu de cravado) e
  `PAPEIS_DO_MESTRE` (a ponte ofício→papel; `mesmoPapel` não servia).
  **A pauta estava errada num ponto, e a etapa corrigiu:** em
  `trai_para_proteger` o alvo é **o companheiro que traiu**, não o parente —
  o parente é o refém. O `oDiaSeguinte` da forma e o `registrarGesto(...,
  "delatou")` do `App.jsx:9958` dizem quem é quem; seguir a pauta teria posto
  o refém como delator na Fúria. `vezesQueUsouInformante` ganhou o leitor de
  produção que R1 devia. 90 asserções novas (41→131). Ver o diário.
- [x] **R3 · a maior enfim acontece** · feito em v9.229 (`e50eb43`), 13/09
  As três maiores saíram do acervo e passam a acontecer. O trabalho não foi o
  consumo — foi a **convivência**, em módulo puro: `quemPodeRevelar` devolve
  **um nome só** (a cena única vira estrutura, não disciplina de quem chama),
  a catraca do Livro separa por alvo (as sementes da menor não pagam a
  colheita da maior), a menor vem primeiro e a maior não cai sobre uma menor
  em curso nem sobre episódio aberto — **a menor não mudou em nada**.
  **O ritmo:** menor rega a cada 3 e amadurece em 9 (o compasso do episódio);
  maior rega a cada 6 e amadurece em **18**, contra os 12 do episódio mais
  longo — para que adiar por episódio aberto nunca vire cancelar. Folga de 3
  dias entre uma queda e a outra.
  **Fora do escrito, e dentro da lei da etapa:** a tranca do **alvo dividido**
  nas duas pontas (`maiorPodeNascer` + `menorPodeNascer`). Quem cede é a
  menor, por física e não por culpa — a maior já plantou quando nasce e não
  consegue devolver o alvo. Sem isso, uma pagaria a catraca da outra e a
  outra ficava trancada para sempre. `teste-reviravolta.mjs` 131 → **290**
  asserções. Ver o diário.
- [x] **R4 · a suíte da fase** · feito em v9.230 (`a1e5ba6`), 13/09
  **A etapa começou por conferência, e a conferência valeu o ciclo.** As
  quatro provas que esta lista pedia **já estavam feitas** em R2/R3 e
  **nenhuma foi reescrita** — o trabalho foi sabotar a suíte de propósito
  para ver o que ela deixava passar. Passava o pior que existe nesta casa:
  **apagar a única chamada de `mexerNaReviravolta()` deixava `npm test`
  inteiro verde** (181/181 + 7/7), ou seja R1+R2+R3 podiam sair do jogo em
  silêncio; e `if (maiorPodeNascer(...) && false)` também. Motivo estrutural,
  e vale além daqui: **toda âncora media a DEFINIÇÃO, nunca o sítio de
  chamada**, e `mexerNaReviravolta` é const local do App, invisível ao
  `teste-ligacao`. Cinco dentes novos (a chamada e não a definição · o ciclo
  com dias que passam contra o Livro real · as duas pontas se encontrando ·
  o bilhete do `fecharAto` · todo `porte` ∈ `PORTES`), 290 → **332**
  asserções, **nada em `src/` mudou**. Conferido em cópia pelo orquestrador:
  as duas sabotagens verdes viraram 4 e 1 falhas. Ver o diário.

  **A FASE R ESTÁ FECHADA.** Formas inertes **5 de 7 → 0**: o detector cobria
  2 formas e morava no App, as 3 maiores não tinham quem lesse `.maior`, e
  metade das campanhas nascia com a menor muda e nenhuma maior. Hoje as 7 têm
  `achaAlvo`, as maiores acontecem com ritmo próprio (rega 6, amadurece 18) e
  a ordem menor→maior é estrutura, não disciplina. A suíte da fase foi de
  **41 → 131 → 290 → 332**. E o sítio de produção que podia sumir sem a casa
  notar: **1 → 0**.

  **Não há mais fase aprovada na fila** — o próximo ciclo pega de "Aberto".

## Aberto (leve / médio — o ciclo pega daqui, o de maior valor primeiro)

- [ ] **uma suíte que estoura esconde todos os outros dentes** · leve · de: orquestrador (achado de R4) · 13/09
  Visto durante a sabotagem de R4: uma forma cuja semente não existe no Livro
  faz `teste-reviravolta.mjs` **estourar** (`TypeError: Cannot read properties
  of null`, na seção 1b, linha 54 — `P.semear` devolve `null` e o `.id` vai
  junto). Exceção **não é falha**: o processo morre ali e as ~300 asserções
  seguintes **não são nem tentadas**, justamente no dia em que teriam algo a
  dizer. O placar `N ok · M falhas` nunca é impresso, e o `rodar-tudo.mjs`
  reporta a suíte como vermelha sem dizer o que mais estava quebrado. A seção
  1b é **herdada do G7**, não de R4 — e o vício é da casa inteira, não desta
  suíte: qualquer `t(...)` que desreferencie o retorno de uma função que pode
  devolver `null` tem a mesma borda. Duas frentes, e a escolha é de quem
  mexer: **embrulhar cada `t(...)` num `try/catch` no helper** (a exceção vira
  uma falha nomeada e a suíte continua — é a versão da lei "nunca pode custar
  o turno" aplicada à prova), ou só endurecer os sítios que desreferenciam.
  A primeira é a que vale, e é uma mudança no helper `t`, não nas asserções.
  Cuidado: o `try/catch` não pode transformar em verde nada que hoje é
  vermelho — a asserção que estourar tem de **falhar**, com a mensagem da
  exceção no lugar do valor. Linha "varredor novo para erro já visto" /
  "bug com teste que prova": a prova faz uma asserção estourar de propósito e
  exige que o placar final ainda saia, com ela contada como falha.

- [ ] **quantos outros órgãos podem sumir do turno em silêncio?** · médio · de: orquestrador (achado de R4) · 13/09
  R4 descobriu que apagar a única chamada de `mexerNaReviravolta()` deixava a
  casa inteira verde, e consertou **para as reviravoltas**. Mas o motivo é
  estrutural e não tem nada de específico: as âncoras de "ligado ao jogo"
  medem a **definição** do órgão, e um órgão fiado como `const` local do
  `App.jsx` é **invisível ao `teste-ligacao`** (que só enxerga `export`). Ou
  seja: **não se sabe quantos outros órgãos do turno estão nessa situação** —
  escritos, provados em módulo, e removíveis da cena sem que nada morda. O
  trabalho é levantar o número antes de consertar: listar os `mexerNo*` /
  `cuidarDe*` / `dispararPropositos` / `colherAsFalas` e companhia que o turno
  chama, e para cada um perguntar "se eu apagar esta linha, alguma suíte fica
  vermelha?" — a resposta medida, uma sabotagem por órgão, em cópia. O número
  é a medida do buraco, e cada órgão sem dente é um achado. Só depois decidir
  a forma do conserto: um `check-turno.mjs` que exige sítio de chamada para
  uma lista nomeada é o candidato óbvio (linha "varredor novo para erro já
  visto"), mas a lista tem de sair da medição, não do palpite. Médio porque a
  medição pode revelar muitos, e aí o conserto vira fase — nesse caso ele
  sobe, e só a medição fica neste item. O molde do dente já existe e funciona:
  seção 10 de `teste-reviravolta.mjs` (ordem por índice, chamada única,
  condição do `if` lida fechando parênteses por contagem).

- [ ] **o `teste-ligacao` conta menção em comentário como leitor** · leve · de: backend+testes+frontend (achado de R3) · 13/09
  Os três agentes esbarraram nisto de forma independente na mesma etapa, o que
  já diz o tamanho: a catraca de "export morto mente" conta **qualquer
  ocorrência do nome no texto**, inclusive dentro de um comentário do próprio
  módulo que o exporta. Em R3, `maiorPodeNascer` e `menorPodeNascer` passaram
  verdes **antes de existir uma única chamada** — o comentário grande de
  `quemPodeRevelar` cita os dois nomes. `check-mortas` dizia "0 nunca usadas"
  no mesmo instante. Ou seja: a catraca que existe para impedir regra sem
  leitor pode ser calada sem querer por quem documenta bem. A suíte de R3 se
  defendeu sozinha (exige `if (menorPodeNascer(` e até o ref certo dentro da
  chamada), mas isso é disciplina de uma suíte, não catraca da casa. O
  trabalho é fazer o varredor **ignorar comentários** (`//` e `/* */`) antes de
  contar, e ver quantos exports da casa hoje vivem de menção — o número é a
  medida do buraco. Linha "varredor novo para erro já visto" / "bug com teste
  que prova": a prova escreve um export novo citado só em comentário, exige
  vermelho, e passa depois. Cuidado: a lista de perdão do `teste-ligacao` tem
  motivos escritos e não pode ser atropelada — e se o conserto revelar exports
  que hoje passam só por menção, cada um é achado seu, não item deste.

- [ ] **`fecharAto` pode trancar a maior para sempre no dia em que for ligado** · leve · de: testes (achado de R3) · 13/09
  `fecharAto` (`promessas.js:260`) murcha as sementes não pagas de um ato, e
  **não tem chamador em lugar nenhum do `App.jsx`** — por isso é inofensivo
  hoje. No dia em que ganhar um: as sementes da reviravolta nascem com `ato` =
  etapa da história, o App semeia **uma vez só** (`semeada: true`), e uma menor
  com as sementes murchas **nunca mais amadurece**. O ramo ② de
  `quemPodeRevelar` ("a menor vem primeiro") não tem escape temporal — só o
  nascimento tem —, então a maior ficaria trancada sem prazo, que é exatamente
  o defeito que R3 veio desfazer. Duas saídas, e a escolha é de quem mexer:
  **dar escape ao ramo ②** (a maior passa a poder cair se a menor está parada
  há tantos dias) ou **fazer a reviravolta ressemear** o que murchou. Enquanto
  `fecharAto` não for ligado, o mais honesto talvez seja só a prova que trava o
  vínculo: uma asserção que falha no dia em que `fecharAto` ganhar chamador sem
  que este item tenha sido resolvido. Linha "teste faltante para regra que
  existe".

- [ ] **a suíte da sala ficou vermelha uma vez e não repetiu** · leve · de: orquestrador (achado de R2) · 13/09
  No `npm test` de fechamento de R2, `teste-sala.mjs` deu `122 passaram, 1
  falharam` — e **não reproduziu**: quatro rodadas seguidas do `npm test`
  inteiro deram 181/181, e a suíte sozinha dá 123/0. Território que R2 não
  tocou. O que já foi descartado: o runner é **sequencial** (`spawnSync` em
  laço em `rodar-tudo.mjs`), então não é cross-talk entre suítes; `sala.js`
  não tem `Date.now` nem `setTimeout`. **A suspeita que sobra é sorte não
  semeada** — `novoCodigo(rnd = Math.random)` e `criarSala({rnd =
  Math.random})` caem no `Math.random` quando ninguém injeta `rnd`, e
  `teste-sala.mjs:29` gera 500 códigos assim. Isso fere "determinismo por
  semente" dentro da própria prova: uma suíte que depende de sorte mente nos
  dois sentidos. O trabalho é injetar `rnd` semeado nas chamadas da suíte (o
  parâmetro já existe, é só usar) e ver se o vermelho tem outra causa por
  baixo. Linha "bug com teste que prova" — mas o teto é: se depois de semeado
  o vermelho voltar, é achado novo e sobe de peso.
  **A conta fecha a suspeita (Claude, 13/09):** a asserção é
  `vistos.size > 480` sobre 500 códigos de `ALFABETO_DO_CODIGO` (30 letras)
  em `CODIGO_TAM` 6 — 30⁶ = 729 milhões de códigos. É aniversário puro:
  colisões esperadas ≈ 500·499/2 ÷ 729e6 ≈ 0,017%, ou **cerca de 1 rodada
  em 5.800**. Bate com "falhou uma vez e não repetiu em quatro". Não procure
  outra causa antes de semear: injete `rnd` (o parâmetro já existe) e a
  asserção passa a ser exata — com semente fixa, 500 códigos distintos são
  sempre os mesmos 500. Vale varrer as outras suítes atrás do mesmo vício:
  qualquer `t(...)` cuja verdade dependa de `Math.random` é uma prova que
  mente uma vez a cada tantas — e a casa não sabe quantas são.

- [ ] **`trai_para_proteger` fala de um vilão que ela não exige** · leve · de: testes (achado de R2) · 13/09
  A forma não pede vilão em lugar nenhum — nem no `soNasceSe`
  (`temCompanheiroComFamilia`, e só) nem no `achaAlvo` que R2 escreveu. As
  duas metades **concordam**, que era a lei de R2, e por isso ficou verde. Só
  que o `oDiaSeguinte` dela escreve *"o vilão revela o refém que forçava a mão
  de {alvo}"* — e sem nêmesis de pé não há quem revele nem quem segure o
  refém. É incoerência entre o texto e o portão, não bug de detector: hoje a
  virada pode cair numa campanha sem vilão e narrar um vilão que não existe
  (o `oDiaSeguinte` só tem o fallback `"o vilão"`, sem nome). Duas saídas, e a
  escolha é de quem mexer: **apertar o portão** (o `soNasceSe` passa a exigir
  `temVilao`, e o `achaAlvo` junto — a forma classifica em `SEM_VILAO` na
  seção 8f de `teste-reviravolta.mjs`, e a linha muda de lista) ou **soltar o
  texto** (reescrever o `oDiaSeguinte` para funcionar sem vilão nomeado).
  Apertar é o mais fiel ao que a forma diz que é. Leve porque `soNasceSe` não
  tem leitor de produção — `elegerReviravoltas` sorteia por hash e não o
  consulta —, então apertar o portão não tira virada de campanha nenhuma; se
  a investigação mostrar que tira, sobe para médio.

- [ ] **o companheiro re-firma o buff que já está de pé** · médio · de: backend (achado de A3) · 13/09
  `decidirAcaoCompanheiro` (`companheiros.js:139-143`) tem o comentário
  *"buff logo no começo da luta (uma vez, não todo turno)"* — e permite o
  buff nas rodadas 1 **e** 2, sem olhar se ele já está na ficha. Visto na
  arena depois de A3: `"A Voz firma Inspiração"` duas vezes seguidas, com
  `empilhar` só reiniciando o prazo — turno pago, nada comprado. É a mesma
  família do buraco que A3 matou, uma ordem de grandeza menor, e o código
  já declara a intenção certa: é fazer o código cumprir o comentário.
  O conserto é olhar `efeitosDe(comp)` (`efeitos.js`) e `guardasAtivas`
  (`habilidades.js`) antes de escolher — leitores que já existem, nada de
  regra nova. Catraca: `teste-arena.mjs` seção 7 (o contador de buffs
  firmados cai e o de golpes com bônus NÃO cai) + a catraca do equilíbrio
  na faixa + `teste-companheiros.mjs`.

- [ ] **"1 Hora" dura seis vezes menos que "1 hora"** · leve · de: testes (achado de A2) · 13/09
  `EFEITO_DA_MAGIA.rxLonga` (`efeitos.js`) é `/hora/` **sem o `i`**: uma magia
  cuja `duracao` diga "1 Hora" com maiúscula cai na faixa curta — 10 turnos em
  vez de 60. Nenhum texto do catálogo escreve assim hoje, então é inerte; é uma
  letra de distância de um bug de duração que ninguém veria acontecer. Linha
  "bug com teste que prova": a prova escreve "1 Hora" e exige `turnosLongos`,
  falha antes e passa depois. Fica em `teste-efeitos.mjs` seção 2.

- [ ] **o milagre que manda zero recebe o padrão** · leve · de: testes (achado de A2) · 13/09
  `efeitoDeMilagre` (`efeitos.js`) usa `||` onde a intenção é `??`: um efeito
  com `{bonus: 0}` ou `{turnos: 0}` cai no padrão (2 e 5) em vez de valer zero
  — "sem número" e "número zero" apagados em silêncio. Nenhum milagre do
  catálogo manda zero hoje. Portado assim de propósito em A2 (regressão zero);
  o conserto é `??` nos dois campos, com a prova que hoje trava o
  comportamento atual invertida e o motivo escrito no comentário (lei "ao mover
  uma asserção, escreva o motivo"). Linha "bug com teste que prova".

- [ ] **o teto de turnos só vale para um dos dois canais** · leve · de: testes (achado de A2) · 13/09
  `LIMITES_DO_EFEITO.turnosMax` (10) poda só o que o **Mestre** pede via
  `aplicarMudancas`; o nascimento interno não passa por ele, e a magia de uma
  hora dura 60 turnos legitimamente. É como sempre foi — mas agora está
  escrito, e a tabela tem nome de "limites do efeito" sem limitar todos os
  efeitos. Ou o teto do canal do Mestre ganha nome honesto
  (`LIMITES_DO_CANAL_DO_MESTRE`), ou a tabela declara os dois tetos. Só nome e
  comentário; nenhum número muda. Linha "comentário, nome, cabeçalho".

- [ ] **os seis sítios de efeito no App estão fora do `calou(...)`** · médio · de: frontend (achado de A2) · 13/09
  Os seis pontos que A2 refiou (`App.jsx` 7727, 9397, 12200, 13085, 13142,
  14262) e as duas chamadas de `aplicarBuffDeHabilidade` (12481, 12598) estão
  **todos fora de qualquer `try/catch`** — e já estavam antes de A2, que só
  diminuiu a superfície de exceção. A lei "nunca pode custar o turno" pede o
  `calou(...)`; A2 não embrulhou de propósito, porque decidir o que valem `p`,
  `extraEscopo`, `pers` e `notaBuff` quando a coisa falha é desenho, não
  refatoração. Cuidado que a etapa herda: 12200 embrulha um `cobrar` (pagamento
  de PM) — exceção engolida ali dropa um custo em silêncio, o que é **pior** que
  falhar à vista. O item é decidir caso a caso, não embrulhar em bloco.
  Catraca: `teste-efeitos.mjs` + as dez suítes de combate.

- [ ] **duas leituras de `.efeitos` que não passaram pelo módulo** · leve · de: frontend (achado de A2) · 13/09
  `App.jsx:6721` (`(p.efeitos || []).some(...)`) e `:11487`
  (`.find((e) => e.nome === ...)`) ganhariam a segurança de `efeitosDe` (que
  aguenta `null` e buraco na lista), mas ficaram fora do mapa de A2 e portá-las
  seria inventar leitor fora do acordado. Nenhuma urgência: são leituras, não
  pilha. Linha "comentário, nome, cabeçalho" / limpeza.

- [ ] **acender os sinais baratos do snapshot do episódio** · médio · de: conselheiro · 13/09
  `snapshotDoEpisodio` (`App.jsx:9684`) entrega só `temLugarAmado`,
  `relogioRegionalAlto` e `pesoRecente`: dos oito episódios de
  `episodios.js:44`, só A Linha Escura e A Queda podem abrir numa campanha —
  os outros seis estão escritos e mudos. Trackers que JÁ existem, leitura
  barata: `cacandoAlguem` = missão ativa de tipo `cacada` em `missoesRef`
  (`missoes.js:213`); `posGuerra` / `aliancaFria` = potência com `tratado`
  "guerra" / "alianca" em `mapaRef.current.faccoes` (`diplomacia.js:326`,
  `gestao.js:98`); `antecedenteDivida` = `personagem.antecedente ===
  "nobre_caido"` (`antecedentes.js:23`, "atrai credores"); `itemMisteriosoDesperto`
  = item de classe "semente" no inventário — o mesmo detector de
  `alvoDaReviravolta` (`App.jsx:9906`). Ficam dormentes, sem tracker achado:
  `vinculoMortoPorAlguem`, `herdouAlgo`, `temDegraus`, `votoFeito`,
  `dominioPerdido`. Linha "ligar sinal dormente a tracker que já existe".
  Catraca: `teste-episodios.mjs` (episodioQueAbre com cada snapshot) e a
  regra de um-por-vez continua valendo; `mexerNoEpisodio` já está em
  `calou(...)`.

- [ ] **os temperos mudos do Termômetro** · médio · de: conselheiro · 13/09
  `termometro.js:105-117`: cada leitura carrega um `tempero`
  (`mao_estendida`, `vespera_forte`, `preco_cobra`, `prateleira_pesada`).
  `App.jsx:16053` consome só `prateleira_pesada` (→ `preferirTom: "pesado"`
  em `escolherAssunto`, `compasso.js:215`, que triplica assuntos `pesado`).
  Os outros três não têm leitor em `src/`. O tracker é o mesmo e já aceita
  `preferirTom`: ligar `mao_estendida` ao espelho — `preferirTom: "leve"`
  triplica os assuntos SEM `pesado` (o respiro depois da perda). Linha
  "ligar sinal dormente a tracker que já existe". `vespera_forte` e
  `preco_cobra` continuam dormentes até terem consumidor óbvio — dizer isso
  no diário. Catraca: `teste-compasso.mjs` (com sorte fixa, "leve" nunca
  escolhe pesado quando há alternativa) + `teste-termometro.mjs` (toda
  leitura com tempero não vazio tem leitor no App — regex, como faz
  `teste-ligacao`).

- [ ] **combate.js: três regras sem prova** · leve · de: conselheiro · 13/09
  `severidadeDano` + a tabela `SEVERIDADES` (`combate.js:515-523`),
  `ataquesDoInimigo` (`:677`) e `gastarRecurso` (`:706`) têm leitor único no
  App e zero linha de teste; `teste-dano.mjs` tem 42 linhas e só olha
  `danoDaClasse`. Provar: `SEVERIDADES` com `max` crescente; dano 0 → "erro";
  `vidaDepois <= 0` → "abate"; lendário nível 12 → 3 ataques, elite → 2,
  comum → 1; `gastarRecurso` consome uma vez, recusa a segunda e NÃO muta o
  objeto de entrada (imutabilidade). Linha "teste faltante para regra que
  existe". Vai em `teste-dano.mjs`.

- [ ] **calendario.js nunca foi provado** · leve · de: conselheiro · 13/09
  Nenhuma prova importa `src/calendario.js`, e ele guarda quatro tabelas
  (`MESES`, `ESTACOES`, `FESTIVAIS`, `SONHOS`) e o relógio do mundo. Provar:
  dia 1 = Brumal/primavera; dia 91 = verão E "Noite das Fogueiras"; dia 361
  = dia 1 (ciclo de 360); `FESTIVAIS.diaDoAno` únicos e dentro de 1..360;
  `SONHOS.efeito` ∈ {null, "inspirado", "perturbado"} — os dois nomes que
  `App.jsx:18170-18171` traduz em condição; `ehNoite(21*60)` e não
  `ehNoite(6*60)`. `rolarSonho` usa `Math.random` cru — aceitar `sorte`
  opcional (default igual) para a suíte provar sem sorte. Linha "teste
  faltante para regra que existe". Suíte nova `teste-calendario.mjs`.

- [ ] **"Em a arena às tochas": a contração que a arena não conhece** · leve · de: conselheiro · 13/09
  Visto no Duelo: "Em a arena às tochas: metade da luta é sombra." e "Em o
  fosso: paredes perto demais". `arena.js:159` monta `Em ${t.nome}` e os
  nomes de `TERRENOS_DA_ARENA` trazem artigo. `lugar.js:347` (`comEm`) já
  resolve isso para o acampamento. Bug com teste que prova (falha antes,
  passa depois): em `teste-arena.mjs`, nenhuma linha de queda começa com
  "Em a " / "Em o ". Linha "bug com teste que prova".

- [ ] **o acampamento em viagem repete o sítio na quarta noite** · médio · de: conselheiro · 13/09
  `acampamento.js`: `SITIOS_EMBARCADOS` tem 3 entradas, `SITIOS_DE_COMBOIO`
  3, `SITIOS_DE_ESTRADA` 4 — uma travessia de mar de uma semana dorme no
  convés, no porão, na cabine e no convés de novo. Ampliar cada lista para
  6–8 no mesmo formato `{ id, icone, abrigo, nome, dentro }` (o `dentro` é
  a coisa concreta que a narração toca; nada de substantivo solto). Lei
  "nada de 4 ou 10 situações"; linha "ampliar acervo numa tabela existente".
  Catraca: `teste-acampamento.mjs` (`escolherSitio`, `chaveDoSitio` —
  mesma chave, mesmo sítio), ids únicos por lista, `abrigo` ∈ 0..2.

- [ ] **o erro do provedor vaza para o jogador** · médio · de: conselheiro · 13/09
  Quando o Narrador cai, `App.jsx:19726` imprime `falha.motivo` cru — o
  jogador leu "deepseek (deepseek-v4-flash: 402: {"error":{"message":
  "Insufficient Balance"...". `falha.motivo` nasce em `App.jsx:10443` do
  `e.message`, que carrega a string de `api/narrador.js:238`. Lei "o
  sistema não fala de si mesmo": na tela fica "O Mestre não respondeu.
  Tentar de novo"; o motivo técnico vai ao `console` (e, se quiser, atrás
  de um "detalhes" discreto). Linha "ajuste pequeno de tela". Prova:
  helper puro `motivoParaOJogador(msg)` num módulo (ex.: `src/janela.js`
  ou módulo novo `src/falha.js`) que devolve "" para JSON/códigos HTTP e
  passa só frases humanas — provado em Node; o App só chama.

- [ ] **"roster" e o selo explicado na tela do Duelo** · médio · de: conselheiro · 13/09
  `App.jsx:4415` "Um do roster (o duelo justo)", `:4401` "· do roster",
  `:4460` "dois do roster" — palavra estrangeira e de bastidor no menu que
  a fase decidiu falar em voz de mundo ("Uma Noite", "Duelo"). Trocar por
  "um campeão da casa" / "da casa". E `:4490` explica o mecanismo ("duas
  máquinas com a mesma dupla e a mesma semente chegam a este mesmo selo"):
  o selo é gameplay (confere entre jogadores), a explicação vai para o
  `title`. Linha "ajuste pequeno de tela (texto)". Prova: o varredor do
  item seguinte.

- [ ] **varredor: palavra de bastidor em texto visível** · leve · de: conselheiro · 13/09
  Erro já visto (o "roster" acima, e a memória `sistema-nao-fala-de-si`):
  um `check-bastidor.mjs` que lê `App.jsx`, `ui.jsx`, `painel-*.jsx` e falha
  se uma string JSX visível (texto entre `>` e `<`, ou dentro de
  `title="..."` fora de comentário) contém `roster`, `postura`, `preset`,
  `tracker`, `snapshot`, `modo rápido`, `PvP`. Lista de perdão com motivo
  escrito, como em `teste-ligacao`. Linha "varredor novo para erro já
  visto". Entra em `rodar-tudo.mjs` como os outros `check-*`.

## Recusado (com o motivo — para a mente não propor de novo)

- **eleger reviravolta só entre formas que já têm detector** · pessoa, 13/09
  Era a saída barata para "metade das eleitas nunca nasce". Recusada: mudaria
  a verdade eleita de saves existentes, e campanha viva nunca perde o que
  sorteou. O caminho é criar os trackers (fase R).
- **diagnosticar a arena sem corrigir** · pessoa, 13/09
  Era a alternativa barata ao portar os efeitos (só um teste que conta as
  rodadas mortas). Recusada: a pessoa pediu funcionando como deveria. O
  teste continua existindo, mas como A1 de uma fase que termina verde.

---

_Nota do conselheiro, 13/09: joguei o Duelo seco de ponta a ponta (casa
serve rival, 3 quedas, selo) e abri a Noite (A Muralha × A Linha Escura)
até o primeiro turno; o Narrador não respondeu por falta de saldo nos
provedores, então Uma Vida e o Capítulo narrado NÃO foram jogados — o que
está acima sobre eles vem do código e das suítes._
