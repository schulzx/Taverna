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
