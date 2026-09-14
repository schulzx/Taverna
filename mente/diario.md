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
