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

- [ ] **o companheiro fica envenenado para sempre** · pesado · de: frontend+backend (achado de P3) · 14/09
  **Seis** sítios escrevem condição em `pers.grupo` (`App.jsx` 5353, 7455, 7764,
  7849, 7851, 8643) e **zero** a decrementam: `tickCondicoes` tem exatamente dois
  sítios, o herói (`:8169`) e os inimigos (`:8185`). Consequência nos dois
  sentidos: o companheiro que leva veneno de um inimigo fica envenenado **até o
  fim da campanha**, e a condição boa que o próprio `buffDeCompanheiro` aplica —
  que `turnoDosCompanheiros` **lê**, via `condAtacante` — é vantagem permanente
  **desde a v9.2**. É anterior à Fase P; P3 só o encontrou ao ligar o relógio dos
  *efeitos* do grupo e ver que o das *condições* não existia. Consertar é dez
  linhas no molde que P3 acabou de escrever — mas muda combate em campanha viva
  nos dois sentidos (tira uma vantagem que o grupo tem há trinta versões e cura
  um veneno que hoje é eterno), e save antigo carrega as duas coisas. A pessoa
  decide. Catraca: `teste-comp.mjs` + âncora no `App.jsx`, o molde da seção 15 de
  `teste-efeitos.mjs`.

- [ ] **o bônus de dano do companheiro nasce e é inerte** · pesado · de: backend+frontend (achado de P3) · 14/09
  Medido e confirmado com grep: **`combate.js` não contém a palavra `efeitos` em
  linha nenhuma**. `bonusDeDano`/`bonusDeArma` têm 4 chamadores (`App.jsx` 11319,
  11585, 13186 e `arena.js:215`) e **nenhum** com ficha de companheiro; `defesaDe`
  (`combate.js:39`) também não lê `efeitos`. Ou seja: depois de P3 o buff do
  companheiro **nasce** com `bonus: N` e ninguém o soma — a metade defensiva do
  efeito vale (é `absorverDano` quem a lê), a ofensiva não. Por isso a tela só diz
  a cláusula da absorção: anunciar "+N de dano" seria a mentira que P1 recusou.
  Ensinar `turnoDosCompanheiros` a ler `efeitos` fecha a simetria — e faz o dano
  do grupo crescer em Uma Vida **sem teto medido**, porque a catraca de equilíbrio
  só existe para a arena. É a etapa que precisa nascer com catraca própria, e por
  isso é da pessoa. Linha "ligar sinal dormente" no custo, `pesado` na
  consequência.

- [ ] **quatro das cinco famílias defensivas ainda não protegem** · pesado · de: backend (achado de P3) · 14/09
  P1 criou cinco famílias em `APLICACAO_DO_BUFF` e P3 deu número e leitor a
  **uma**: `absorve`. Seguem com força zero `intocado` (18 habilidades),
  `amortece` (8), `protege` (8) e `nao_cai` (5) — **39 no total**, que prometem na
  ficha e não cumprem na mesa, exatamente como `absorve` prometia até ontem. E
  enquanto não cumprirem, o piloto **não pode** procurá-las: está medido em P2 que
  mandá-lo gastar turno em defensiva inerte derruba a catraca (`sombra` 60,2 →
  32,9). Cada uma é a sua própria etapa, com molde diferente: `amortece` tem o
  caminho pronto (`amortecerDano` já corta pela metade), `intocado` e `nao_cai`
  **colidem** com `estaIntocavel` e com o teste de morte e precisam de desenho
  antes de código. É o material de uma fase irmã da P, e o tamanho dela é decisão
  da pessoa. Catraca herdada, pronta: `check-protecao.mjs` + a catraca de
  equilíbrio.

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

- [x] **a família defensiva é promessa que nenhum não-jogador cumpre** · pesado · de: backend+testes (achado de A3) · 13/09 — **respondida e cumprida pela Fase P (P1 · P2 · P3), fechada em v9.233**
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

- [x] **C1 · o campo nasce e viaja** · feito em v9.234 (`a57b1b2`), 14/09
  **A etapa era pequena de verdade e foi fechada pequena** — uma linha de
  comportamento, uma tabela de conferência, **nenhuma fiação nova** e o
  `App.jsx` intocado (o `frontend` não foi chamado, de propósito).
  **A pauta errava num ponto:** são três nascimentos, mas só **um** tem fonte —
  `concentracao` não existe em tabela de habilidade nem de milagre, então
  `efeitoDeBuff` e `efeitoDeMilagre` continuam mudos **por prova**, e o campo
  atravessa `efeitoDeMagia` e só ele.
  **A conferência do catálogo passou sem mexer em nada:** 85 magias · 44 de
  duração · 34 marcadas · **10** de duração sem marca, conferidas uma a uma
  contra o 5e e **todas certas** · **0** marcadas que sejam instantâneas. A
  catraca nova é `CONCENTRACAO_DA_MAGIA` (a regra + as 10 exceções, cada uma
  com o motivo escrito) e a fachada `exigeConcentracao` — lista de exceção,
  nunca de permissão, no molde de `APLICACAO_DO_BUFF`: magia de duração nova
  amanhã não nasce sem marca em silêncio.
  **A quebra COMEÇOU a acontecer neste ciclo, de propósito e medida.** Decidido
  com o `backend`: segurar não seria "não ligar ainda", seria **desligar um
  caminho que já está ligado**, o que é pesado e não está aprovado. O raio é
  minúsculo — **1** chamador de produção, **4** magias na porta, **3** delas
  concentrando, **só o herói**. O efeito, por conta fechada: o teste roda **uma
  vez por rodada** sobre o dano total, a CD só passa de 10 a partir de dano
  **22**, e sobre o golpe de mediana 13 de P3 a magia aguenta **2,2 a 2,9
  rodadas apanhando** antes de cair. 87 asserções novas (`teste-grimorio.mjs`
  89 → **142**, `teste-efeitos.mjs` 387 → **421**), seis sabotagens medidas.
  Ver o diário.
- [ ] **C2 · a quebra acontece na mesa** · de: pessoa · 13/09
  **Corrigido pelo orquestrador em 14/09, depois de C1 — a etapa mudou de
  forma, e para os dois lados.** A metade do **herói já está feita**: o caminho
  inteiro do App (`:13377` acha quem concentra · `:13379` roda o teste ·
  `:13383` escreve a linha · `:13434` tira o efeito) já existia e passou a
  disparar com C1. O que sobra dela é só o que o jogador **lê**: hoje a linha
  com CD e rolagem só aparece se `mostrarRolagens` estiver ligado, e a quebra é
  gameplay — ele precisa saber que perdeu a magia **e por quê**, ligado ou não.
  A metade que **cresceu** é a de companheiro e inimigo conjurador: medido em
  C1, nenhum dos dois faz **nascer** efeito de magia em lugar nenhum, então
  para eles não há o que quebrar — não é ligar um teste, é dar-lhes primeiro
  uma magia de duração que exista na ficha. Se a medição mostrar que isso é
  órgão novo, a metade sobe de peso e volta para a pessoa.
  Cuidado: o Narrador não ganha bloco novo — `ECONOMIA_ACAO_PROMPT` já
  descreve a regra; o que muda por turno vai pela `pauta` dinâmica.
- [ ] **C3 · uma de cada vez** · de: pessoa · 13/09
  5e, e o próprio `ECONOMIA_ACAO_PROMPT` já promete: *"um conjurador mantém
  no máximo UMA magia de duração por vez"*. Conferir se o jogo cumpre — se
  conjurar a segunda derruba a primeira. Se já cumpre, é conferência
  registrada e a fase fecha aqui; se não, é o conserto da etapa.
  **Conferido em C1 (14/09), e o jogo NÃO cumpre:** o herói pode segurar duas
  concentrações ao mesmo tempo (Voo e depois Invisibilidade — `empilhar` só
  substitui por nome igual), e `efeitoEmConcentracao` devolve a **primeira**
  que encontra, então uma batida derruba uma só. Ou seja, a etapa é conserto,
  não conferência. A forma natural já tem endereço: `CONCENTRACAO_DA_MAGIA`
  ganha o teto (`quantasAoMesmoTempo: 1`) e o nascimento derruba a anterior —
  a regra passa a morar onde a tabela já está, e o jogador lê a troca.

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
- [x] **P2 · o piloto reconhece as nove guardas** · feito em v9.232 (`bdf94f4`), 14/09
  O piloto **pergunta à tabela**: `ehGuarda` (`companheiros.js`) chama `guardaDe`,
  e o passo 3 ergue guarda antes de buff, com **um sorteio só** (o número de
  turnos de apoio não muda, só o que é escolhido). **9 de 9** entradas de
  `GUARDAS` reconhecidas onde antes eram 0; **0 falsas guardas** sobre as 593
  habilidades do acervo, e esse zero é lei na suíte.
  **O `RX_BUFF` sobreviveu encolhido, e essa é a resposta:** ele tinha dois
  vocabulários dentro. A metade de ABRIGO já tem tabela (`aplicacaoDoBuff`, de
  P1, com o veto dentro) e passou a ser julgada por ela — saem `Dissipar Magia`,
  `Tiro Perfurante`, `Punho de Pedra` e `Linha da Lâmina` (`ehBuff` 37 → 33). A
  metade de APOIO (bênção, inspiração, grito, canção, hino, postura, fúria) é a
  única que nenhuma tabela descreve, e a única que continua sendo palpite.
  **A catraca de equilíbrio ficou byte-a-byte na linha de base de P1** (amplitude
  15,8, teto 20, tudo em 35–65); **nenhum pronto reajustado**. Onde a mudança
  pisa é Uma Vida: **6 de 60** fichas de companheiro passam a erguer guarda
  (Druida e Engenheiro); na arena são **0** — nenhum dos 8 prontos carrega uma
  das 9, e isso virou fato declarado com teto 0 na suíte.
  Fiação: ramo `guarda` no turno do grupo, prazo do grupo no relógio do herói e
  `baixarGuardas` do grupo no fim da luta (sem isso Casca de Carvalho virava +4
  permanente). Catraca nova: seção 6 de `teste-guardas.mjs` percorrendo
  `GUARDAS` — guarda nova amanhã não nasce invisível. Ver o diário.

<details>
<summary>o texto original da etapa P2 (antes de ser executada)</summary>

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

</details>

- [x] **P3 · a proteção enfim protege** · feito em v9.233 (`99500c7`), 14/09
  **O desenho da pauta foi medido e trocado por um melhor.** Em vez de `absorve: N`
  em `pers.guardas`, a absorção mora no próprio **efeito** que `efeitoDeBuff` já
  cria, consumida por `absorverDano` (`efeitos.js`), com a tabela
  `ABSORCAO_DO_BUFF` (2 por PM · teto **12**, medido contra golpe de mediana 13).
  Decidiram quatro números: a família `absorve` é **25 das 64** defensivas do
  acervo e pega **3 dos 8 prontos** (`GUARDAS` pega 0); **zero** sítios novos de
  nascimento; **1** colisão no acervo, já resolvida por precedência; e a seta de
  dependência não se mexe.
  **O piloto procura uma família só, e o número é o motivo:** das 42 defensivas
  que o regex nunca viu entram as **12** que compram alguma coisa (`ehAbrigo`);
  as outras 30 seguem com força zero e ficariam inertes, que foi o fracasso
  medido em P2. "Esquiva Ágil", que derrubou `sombra` a 32,9 lá, é `intocado` —
  fora do recorte.
  **A catraca voltou e APERTOU: amplitude 15,0 → 12,7** (teto 20), os oito em
  35–65. Subiram os três donos de abrigo (chama 54,4 · remendo 54,6 · voto 52,0),
  desceu o topo (sombra 54,2 · flecha 49,0). **Nenhum pronto reajustado** — a
  licença existia e não foi gasta. Margem fina declarada como fato: `punho` em
  `cc` a 1,2 pt do piso.
  **Uma Vida, em número** (200 combates, `umavida|0..199`): **918 pontos de dano
  parados em 153 abrigos** no cenário duro (quedas 566 → 563, 1ª queda 4,41 →
  4,64, PV restante 675 → 754) e **431 em 75 abrigos** no brando (91,7% → 93,3%).
  **91% dos escudos nascidos chegam a morder.** O ganho inteiro vem da absorção
  e do nascimento no companheiro; o recorte do piloto rende **zero em Uma Vida**
  e paga na arena (abrigos 83 → 241, dano parado 332 → 964).
  **O achado que a etapa teve de consertar junto:** `buffDeCompanheiro` **nunca**
  chamava `efeitoDeBuff` — o companheiro escolhia o abrigo, a mesa consumia
  abrigo, e o abrigo nunca nascia. Fiado depois de enumerar os leitores (o caso
  "+4 permanente" de P2 não se repete aqui), com o irmão no relógio
  (`tickEfeitos` sobre `pers.grupo`).
  **O dente da mesa real de A3 envelheceu e foi trocado, não afrouxado:** o piso
  100 não desceu um dígito; a parcela virou a soma `rendeu = comPeso + abrigos`
  (**316** = 75 + 241) e cada metade ganhou dente próprio. Seis sabotagens em
  cópia provaram os dentes novos. Ver o diário.

  **A FASE P ESTÁ FECHADA.** *"Absorve o próximo dano"* tirava **0** de dano de
  qualquer um → tira **918** em 200 combates de Uma Vida e **964** na mesa dos 28
  pares. Guardas reconhecidas pelo piloto **0 de 9 → 9 de 9**; abrigos que
  morderam na arena **0 → 241**; o buff do companheiro, que nunca chegava a
  `comp.efeitos`, passa a nascer pelo caminho único do herói e a vencer por
  relógio próprio. A catraca de equilíbrio nunca saiu da faixa e apertou:
  amplitude 20,0 (A4) → 15,8 → 15,8 → 15,0 → **12,7**, com **nenhum pronto
  reajustado nas três etapas**. `teste-efeitos.mjs` 168 → **387**.

  **A próxima fase aprovada na fila é a C**, a partir de **C1**.

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

- [ ] **as duas portas da concentração discordam sobre lixo não-booleano** · leve · de: testes (achado de C1) · 14/09
  `exigeConcentracao({concentracao: "sim"})` **ignora** o campo (só
  `typeof === "boolean"` manda) e cai na regra da tabela; `efeitoDeMagia`
  **aceita** o mesmo valor por verdade e nasce com `concentracao: true`. Para as
  85 do catálogo nunca diverge — todas têm booleano, e há asserção nova cravando
  isso —, mas magia digitada pelo Mestre e save antigo passam pelas duas portas,
  e aí a mesma magia concentra por um caminho e não pelo outro. Os `testes`
  travaram o comportamento atual dos **dois** lados de propósito, em vez de
  julgar qual está certo: C1 prometeu não decidir regra. O trabalho é escolher a
  régua única (a de `exigeConcentracao` é a mais severa e a mais honesta) e
  aplicá-la nas duas, com o motivo em comentário nas asserções que mudarem de
  lado. Linha "bug com teste que prova". Catraca: as asserções de lixo que já
  existem nas duas suítes — elas dizem hoje que as portas discordam, e passarão
  a dizer que concordam.

- [ ] **o nascimento do abrigo só tem prova de texto** · médio · de: testes (achado de P3) · 14/09
  A seção 15 de `teste-efeitos.mjs` crava o nascimento do abrigo no companheiro
  por **âncora de regex**, e as quatro sabotagens provam que ela morde. Mas não há
  prova de **comportamento** — nenhuma ficha de companheiro entra e sai com o
  abrigo na lista —, e o motivo é estrutural: `buffDeCompanheiro` é `const` dentro
  do componente e não se importa em Node. É o mesmo vício que R4 nomeou, uma
  camada abaixo: âncora prova que a linha existe, nunca que ela faz o que diz.
  O caminho é extrair o miolo para `src/` (o que decide o efeito, não o que mexe
  no estado do React) — aí vira export com leitor e o `teste-ligacao` passa a
  guardá-lo sozinho, e as âncoras de texto encolhem para o que só elas podem
  medir. Linha "refatorar módulo puro sem mudar comportamento". Catraca: as
  âncoras atuais continuam verdes durante a extração, e a suíte ganha o caso vivo.

- [ ] **os comentários novos do `App.jsx` estão sem acento** · leve · de: orquestrador (achado de P3) · 14/09
  A fiação de P3 (a porta `passarPeloAbrigo`, o nascimento, o irmão no relógio)
  trouxe comentários bons e longos escritos **sem acento** — "proposito",
  "heroi", "e" no lugar de "é". A mão escolheu a segurança contra o vício de
  codificação da casa (a memória `powershell-corrompe-utf8`), e o arquivo está
  íntegro — **0** caracteres de substituição, 11.293 acentos. Mas a lei é
  "comentários em português", e ao lado dos vizinhos acentuados a diferença
  salta. Conserto por script `.cjs` via `node`, nunca por PowerShell, e conferido
  com a mesma contagem de `\uFFFD` que o achou. Linha "comentário, nome,
  cabeçalho". Catraca: um varredor que conte caracteres de substituição em `src/`
  já valeria por si — erro já visto, e caro.

- [ ] **a guarda de pé não aparece em tela nenhuma** · médio · de: frontend+orquestrador (achado de P2) · 14/09
  `pers.guardas` só é lido no instante em que a guarda sobe e no instante em que
  cai. No meio — dois, três, quatro turnos — o jogador **não tem onde conferir**
  que a defesa dele está +4, nem por quanto tempo. Vale para o herói desde a
  v9.53 e agora para o companheiro também, onde pesa mais: ele não tem painel de
  ficha aberto, e P2 acabou de fazer Druida e Engenheiro erguerem guarda de
  verdade em Uma Vida. É gameplay, não bastidor — a lei "o sistema não fala de
  si mesmo" não protege isto, protege o contrário: o jogador precisa sentir o
  efeito E poder conferir o estado que ele mesmo pagou. `defesaDeGuarda`,
  `guardasAtivas`, `estaIntocavel` e `esquivaDeGuarda` já existem e já leem tudo
  — é tela, não regra. Catraca: `teste-guardas.mjs` + âncora de regex no
  `App.jsx` (o molde do fim de `teste-comp.mjs`). Cuidado: prazo se diz em
  turnos restantes, não em número de rodada absoluto — `ate` é rodada, e mostrar
  "até a rodada 7" seria o sistema falando de si mesmo.

- [ ] **o Narrador esquece a guarda no turno seguinte** · médio · de: frontend (achado de P2) · 14/09
  `resumoGrupoPrompt` (`companheiros.js:212`) manda nome, classe, nível, PV, PM
  e habilidades — **nada de `guardas`**. O Mestre sabe da guarda só no turno em
  que ela sobe (pela `partesComp`); nas rodadas seguintes ela some da vista dele
  e ele pode narrar o companheiro apanhando como se nada o cobrisse. **O herói
  tem o mesmo furo**, então é decisão de família, não bug do grupo. Cuidado que
  manda: **o teto de prompt é sagrado** e é **proibido somar bloco estático** —
  isto tem de caber como um pedaço curto do que já vai (o resumo do grupo é
  dinâmico e já existe) ou entrar pela `pauta` por turno, nunca como seção nova.
  Se a conta de caracteres não fechar, o item sobe de peso. Catraca:
  `teste-comp.mjs` (o resumo cita a guarda quando há uma) + o varredor do teto.

- [ ] **dois falsos positivos sobrevivem no vocabulário de apoio** · leve · de: backend (achado de P2) · 14/09
  P2 fechou a metade de abrigo do `RX_BUFF` entregando-a a `aplicacaoDoBuff`.
  Na metade de APOIO, que nenhuma tabela descreve, sobraram dois: **`Fúria de
  Gaia`** ("Terremoto que atinge todos os inimigos" — casa por "fúria") e
  **`Comando: Atacar`** ("Sua invocação ataca com fúria redobrada"). Os dois são
  ataque e o piloto os gasta como apoio na rodada 1–2. P2 **não inventou regra
  para dois casos** de propósito: seria trocar um palpite por outro. O trabalho
  é decidir a forma — e a escolha é de quem mexer: uma tabela de apoio irmã de
  `APLICACAO_DO_BUFF` (classifica o que LEVANTA, como aquela classifica o que
  ABRIGA, e aí o `RX_APOIO` morre inteiro), ou um veto curto e nomeado para
  quem tem alvo inimigo no texto. A primeira é a que vale e é a que segue a
  lição de P2; a segunda é remendo. Cuidado medido: o veto de P1 usado como
  portão solto derruba **5 buffs honestos** (Fúria de Batalha, Hino de Guerra,
  Fúria Sangrenta, Hino da Vitória, Sangue dos Antigos) — está no diário de P2,
  não repita a tentativa. Catraca: os cinco continuam `ehBuff` e os dois deixam
  de ser, em `teste-guardas.mjs` seção 6, que já os nomeia.

- [ ] **três conceitos de `GUARDAS` falam com o jogador** · leve · de: frontend (achado de P2) · 14/09
  `habilidades.js:323-325`: Dança Sem Vulto, Nada Me Alcança e Improvável
  escrevem o `conceito` em segunda pessoa ("o que vem em **sua** direção passa
  por onde você não está mais"). Enquanto só o herói erguia guarda, estava
  certo. P2 fez o companheiro erguer também, e sob o nome de outro a frase sai
  torta. O frontend ajustou os pronomes da **cláusula de efeito** na linha do
  companheiro (`te acerta` → `o acerta`), mas o `conceito` vem pronto da tabela
  e não dá para reescrever no `App.jsx` sem pôr texto de regra na tela — a lei
  "conta se prova, tela se olha" manda o conserto ser na tabela. Reescrever os
  três em voz de mundo, sem pronome de destinatário, como os outros seis já
  são. Só texto de tabela; nenhum número muda. Linha "comentário, nome,
  cabeçalho". Catraca: `teste-guardas.mjs` (nenhum `conceito` contém "você",
  "sua", "seu" ou "te ").

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
  **Metade resolvida em P2 (v9.232):** a guarda já não é re-erguida — o piloto
  compara `guardaDe(h).id` contra `guardasAtivas(comp)` antes de escolher. Falta
  a metade do BUFF, que é esta: `efeitosDe(comp)` antes do `ehBuff`. O molde já
  está escrito no passo 3, do lado.
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
