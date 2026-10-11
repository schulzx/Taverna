# mente/pauta.md — as etapas e decisões que fecharam

O texto inteiro do que já foi feito ou respondido. Saiu da pauta porque a
mente a lê ao começar todo ciclo, e o que decide é o que está por fazer.
Aqui fica a prova.

- [x] **o indice do git e compartilhado pelas duas mentes, e a lei nao cobre isso** · **RESOLVIDA 15/09, e já no ar** (`39a8c65`): a lei passou a exigir `git commit -- <caminhos>` nos três arquivos. Claude tratou como ofício e não como mudança de lei de jogo — não muda nada do que o jogador vive, e a regra anterior falhava de forma demonstrável (duas ocorrências em dois dias, as duas dele). A pessoa pode devolver a decisão a si mesma com uma frase. · pesado · de: orquestrador (X3) · 15/09
  **Aconteceu hoje, e custou a honestidade de um commit.** O `CLAUDE.md` manda
  somar os caminhos **um a um** e proibe `git add -A` justamente para que o
  trabalho de uma mente nao entre no commit da outra. Segui a lei a risca — e
  nao bastou: entre o meu `git add <caminhos>` e o meu `git commit` existe uma
  **janela**, e nela o `regente` commitou. O indice e um so para as duas
  mentes, entao o commit dele levou junto `src/guardado.js`, os dois arquivos
  de teste do X3, o meu `App.jsx` e o meu bump de VERSAO. Quando fui commitar,
  a arvore estava limpa e o meu commit nao tinha o que dizer.
  **O resultado esta em `origin/main`:** `e430a12`, cujo titulo fala de um
  relogio de 15 segundos, carrega a fase X3 inteira sem menciona-la. E o mesmo
  defeito que o `CLAUDE.md` ja registra em `a6a6473` (14/09) — so que agora
  **sem ninguem ter quebrado a regra**, o que e pior: quer dizer que a regra
  nao protege o que promete proteger.
  **Nao reescrevi historia**, e a razao e a mesma que proibe `git stash` aqui:
  seria arma apontada para o vizinho, e ainda um `push --force` num ramo que
  faz deploy para jogadores reais. O codigo esta verde e no ar; o que se
  perdeu foi o registro, e o diario o repoe.
  **O conserto proposto, e e uma linha de lei:** trocar
  *"some os caminhos um a um"* por **`git commit -- <caminhos>`** (ou
  `git commit <caminhos>`), que commita os caminhos direto **sem passar pelo
  indice** e nao deixa janela nenhuma. Foi assim que o commit do registro deste
  ciclo entrou. **E pesado porque muda uma lei da casa** — por isso esta aqui e
  nao foi feito. Se voce aprovar, sao duas linhas no `CLAUDE.md` (a secao
  "Commits" e a "Subir com duas mentes") e nenhuma no codigo.


_As quatro de 14/09 foram respondidas e viraram as fases T, B, F e I. Estas duas
nasceram do fecho da Fase T (T4, 14/09): as duas metades da promessa que
`Palavra de Coragem` faz na ficha e o jogo não cumpre._


- [x] **o alvo tático já está ligado no jogo, e a régua nunca o viu** · **RESPONDIDA 15/09 e JÁ FEITA** — N1b consertou a régua e refez a linha de base (v9.251) · pesado · de: orquestrador (achado de N1) · 14/09
  **O maior achado de N1, e ele não é sobre a Fase N: é sobre o que o jogo
  já é hoje.** A régua de combate passa **`prioridade: ""`**
  (`regua-combate.mjs:612`), sem comentário, e `combate.js:279` só consulta
  `escolherAlvo` quando a prioridade existe. Logo **toda a linha de base de
  B1, B1b, B2 e T1 para Uma Vida foi medida com o Adversário fora do
  circuito** — o que essas etapas mediram foi o sorteio de 35% e mais nada.
  No jogo de verdade, `App.jsx:13606` passa a prioridade da intenção a todo
  turno de combate.
  **A conta, por reconstrução no scratchpad** (é reconstrução, não a régua —
  N1b existe para refazê-la com o instrumento certo): no `justo`, vitória
  **52,10% → 1,80%**, PV do grupo **25,88 → 0,63**, quedas **1,790 →
  2,978**; no `duro`, **8,40% → 0,00%**. Robusto: 8 variantes do lugar ficam
  entre 1,6% e 13,6%, e com a eleição atrasada uma rodada, 3,2%.
  **A causa é estrutural e está medida prioridade a prioridade:** o herói é
  o único combatente que **não morre ao cair** e de quem os inimigos
  **desistem** ao vê-lo no chão (`combate.js:267`). Bater nele é dano
  desperdiçado — e por isso **toda prioridade que aprende a evitá-lo vira
  TPK**: `o_conjurador` 0,6% de vitória, `quem_nao_e_o_heroi` 0,4%,
  `o_mais_forte` 0,4%, `o_curandeiro` 1,2%, contra 51,2% do sorteio cego.
  **O que isto significa para a Fase N:** *"o brilhante corta a cura
  primeiro"* é, na mesa de hoje, a definição de combate invencível. A fase
  não vai deixar o combate *"um pouco mais difícil"* — ela vai ter de
  **segurar** uma dificuldade que já existe e que nenhuma medição via.
  **A pergunta, então, não é a que N7 escrevia.** Não é *"aceita o combate
  mais duro?"*. É: **o alvo tático já está ligado no jogo há trinta versões
  e a régua nunca o mediu — quanto dele você quer manter?** Três saídas, e
  nenhuma é ajuste silencioso: (a) manter como está e a Fase N calibrar os
  degraus para dentro da faixa de 35–65%; (b) declarar que o combate deve
  doer assim e mudar a faixa da catraca; (c) mexer no que torna o herói
  desperdício — que é o mesmo assunto da pendente *"o herói é um passageiro
  no próprio combate difícil"*, hoje absorvida por esta fase.
  **N1b é pré-requisito de qualquer resposta** — é ele que troca a
  reconstrução por número de régua. Ele é instrumento e o ciclo o executa;
  esta decisão espera a pessoa.

  > **PRÉ-REQUISITO CUMPRIDO (N1b, 15/09, v9.251) — a pergunta agora tem
  > número de régua, e a reconstrução acertou.** Medido em 4 famílias ×
  > 1000, com o Adversário ligado pelo caminho do App: `justo` **1,4–1,8%**
  > de vitória (era 51,1–54,2%), PV do grupo **0,41–0,64** de 132, quedas
  > **2,978–2,986** de 3, TPK **98,2–98,6%**, primeira queda na **rodada
  > 1,05**; `duro` **0,0%**; `brando` ganha sempre, mas já derruba **12 em
  > 4000** onde antes derrubava zero. A causa está no rastro: **em 100% dos
  > combates a rodada 1 elege `calar_a_magia`**, e a memória por combate
  > mantém o fogo lá.
  > **A catraca ficou vermelha no dente 1 (folga −46,1 margens) e nenhum
  > limiar foi tocado** — a dívida entrou como `pendente`, que imprime e não
  > derruba, porque balanceamento é decisão sua.
  > **E há um quarto fato que a pergunta ainda não tinha:** o cenário
  > `justo` **deixou de ter resolução nos dois sentidos** — os três cenários
  > da régua estão saturados hoje (duro 0,0% · justo 1,6% · brando 100%).
  > Enquanto isso não se resolver, **nenhuma mudança de combate pode ser
  > julgada por número** nesta régua. Para informar e nada mais: **4 elites
  > de nível 3 põem a mesa de volta em 41,8–50,0%** (os três dentes verdes),
  > e 3 elites de nível 6 dão 36,4–42,0%. **Nada disso foi aplicado.**

  > **A ESCADA JÁ TEM PREVISÃO, E ELA MUDA A PERGUNTA (N2, 15/09, v9.259).**
  > A sua saída de 15/09 foi desenhada, tabelada e **medida antes de ser
  > ligada** — a escada existe e ainda não decide nada. O número: no `justo`,
  > distribuir as 46 intenções por degrau leva a vitória de **1,4–1,8% para
  > 86,7–87,7%**, com o `duro` saindo de 0,0% para ~31% e o `brando` deixando
  > de derrubar qualquer um. **A sua leitura estava certa e o remédio é forte
  > demais na dose inteira:** tirar a cabeça de quem não devia tê-la de fato
  > mata o tirano — e entrega a mesa ao grupo com mais folga do que o inimigo
  > **não ter piloto nenhum** (51–54%). A régua continua saturada, agora pelo
  > encosto de cima.
  > **A causa é estreita e dá o que ajustar:** na rodada 1 do `justo` **só 2
  > das 46 intenções disparam** — a do topo e a da rede, sem nada entre elas.
  > Tirar o topo entrega a rodada à rede, que mira o primeiro da lista, que é o
  > herói — o único que não morre ao cair. **Não é que o inimigo fique burro:
  > é que ele passa a bater onde o dano se perde.**
  > **Então a pergunta que ficou com você desde N1b — *quanto do alvo tático
  > você quer manter?* — passa a ter três respostas com número:** manter o
  > topo só para quem o **declara** (o que N2 já faz: o Dragão Ancião corta a
  > magia, o Adversário genérico não) dá 87,7%; manter para toda `elite` dá o
  > 1,4% de hoje; e o meio ainda não existe, porque **falta intenção de degrau
  > médio que dispare na rodada 1**. Essa é uma decisão de mesa, não de código,
  > e **N4 não anda sem ela** — a fase inteira se justifica nesse número, e
  > ele agora está medido em vez de estimado.


- [x] **a habilidade de classe não tem resolvedor — contar antes de decidir** · **RESPONDIDA 15/09 com o número na mão (66 de 148) — virou a Fase H**: uma porta só para as 54, e H2 mede de quem já são os 12 antes de construir qualquer coisa · pesado · de: pessoa · 14/09
  **A pessoa devolveu a pergunta (14/09):** *"quero sua opinião e a da mente
  para qual a melhor forma de resolver isso; se os dois concordarem na
  criação do novo órgão então assim seja, mas não vejo utilidade pra um
  órgão cuidar de somente duas habilidades."* **Ela tem razão sobre o
  tamanho, e a pergunta estava mal posta.** T4 contou só as habilidades que
  prometem **remover condição** — e achou duas. Ninguém contou as que
  prometem **qualquer outra mecânica** que o sistema não executa. Esse é o
  número que decide, e ele não existe.
  **O item, antes da decisão:** varrer as **148** `HAB(...)` de `classes.js`
  e classificar cada uma — cumpre na mesa / é só prosa / **promete e não
  cumpre**. Se o "promete e não cumpre" for um punhado, a saída barata é
  ligá-las ao caminho que já existe (`magiaPorNome` + `resolvidaPeloSistema`
  + `usarFuncaoMagica`), sem órgão nenhum. Se forem dezenas, é órgão e vale
  a pena. **A pessoa decide depois de ver o número** — e a Fase V já resolve
  a metade de `Palavra de Coragem` pelo caminho do PV temporário.

  ### O NÚMERO ESTÁ NA MÃO (medido em v9.250, 15/09) — o ciclo não consertou nada

  **As 148, uma a uma, contra a cadeia real de resolução do App:**

  | balde | n | o que é |
  |---|---|---|
  | **1 · cumpre na mesa** | **56** | o sistema executa o que a descrição promete |
  | **2 · é só prosa** | **26** | não promete mecânica — cor, ficção, gancho. **Não é defeito** |
  | **3 · promete e não cumpre** | **66** | diz que algo acontece e nada executa |

  O balde 1 por onde cumpre: condição/aflição **18** · regra própria
  (`habilidades.js`) **15** · invocação **15** · dano por tabela **3** ·
  absorção numerada **3** · grimório resolvido pelo sistema **2**.
  **Critério do balde 2:** dano sozinho é prosa — "extra", "massivo",
  "devastador" são adjetivos sem tabela, e nenhuma das 148 tem `danoBase`.

  **A divisão que responde "órgão ou ligações" — e ela é o contrário do que
  a pergunta supunha:**

  | degrau | n | o que basta |
  |---|---|---|
  | **(a) LINHA** | **21** | uma linha numa tabela **já aberta**. Zero código no `App.jsx` |
  | **(b) LIGAÇÃO** | **33** | **o motor existe e é genérico** — só não é chamado por habilidade de classe |
  | **(c) NOVO** | **12** | não há motor em lugar nenhum |

  **54 das 66 não precisam de mecânica nova.** Só **12** precisam, e elas se
  agrupam em sete assuntos, não em sessenta: sistema de marca (3), zona/terreno
  persistente (3), cura-por-turno (2), clima, aura reativa, contra-conjuração,
  PM de volta.

  **O achado que decide, e não estava na pergunta.** Os motores quase todos já
  existem — **eles apenas leem outra fonte**. `amortecerDano` (`tracos.js:161`,
  vivo em `App.jsx:13635`) já corta o dano recebido, mas lê o **traço racial**;
  o piso de 1 PV (`App.jsx:13790-13812`) idem; `segundoFolegoDisponivel` lê
  **afixo/dádiva**; `dobraMovimento`/`ignoraTerrenoDificil` leem **dádiva**;
  `removerPelaPorta` tem **um** chamador, a magia do grimório; `curarAliado`
  (`App.jsx:7901`) tem **um**, a poção. Raça tem despachante (`tracos.js`),
  dádiva tem, magia tem (`usarFuncaoMagica`), poção tem, relíquia tem.
  **A habilidade de classe é a única fonte de poder do jogo sem despachante** —
  e as tabelas de `habilidades.js` são abertas: nenhum `id` de linha aparece no
  `App.jsx`, o laço lê campos genéricos.

  **A recomendação da mente: não é órgão, e também não são "duas ligações".
  É UMA porta — `porHabilidadeDeClasse` — no laço que já existe** (`App.jsx:13067`
  e `:13187`, os dois sítios) **+ o nome em `temRegraPropria`.** Ela não inventa
  mecânica: só faz a habilidade de classe alcançar os motores que raça, dádiva,
  magia e poção já alcançam. Com ela e mais linhas de tabela, **54 de 66 caem**.
  Órgão só se justificaria para os 12 — e esses são sete assuntos separados,
  cada um uma fase pequena, nenhum urgente. **A Fase V já cobre o PV temporário**
  de `Palavra de Coragem`.

  **Duas descobertas que valem item próprio e não são esta decisão** (estão em
  "Aberto"): **10 falsos positivos ativos** — habilidades que fazem coisa
  diferente do que prometem, três delas o **inverso** (`Palavra de Coragem`,
  *"remove medo"*, **aflige amedrontado**; `Mente Serena`, *"imune a medo"*,
  idem; `Chamado da Chuva`, *"cura contínua"*, põe o alvo **queimando**), cinco
  nascidas de substring dentro de palavra (`aranha` em *Emar**anha**r*, `maça`
  em *Fu**maça***, `escudo` em *"atravessa escudo"*); e **7 habilidades de
  ataque que nem chegam ao motor**, porque `HAB_OFENSIVA_RX` (`App.jsx:11677`)
  tem `ataca` e não `ataque` — o PM sai e nenhum tiro é disparado.

  Reprodutível: `scratchpad/classificacao-148.md` (as 148, linha a linha, com a
  coluna de máquina dos detectores ao lado do veredito) e `scratchpad/degraus.cjs`
  (o degrau de cada uma das 66, com a razão, e os totais que ele imprime).
  _(o texto original da pendente segue abaixo)_

- [x] **a habilidade de classe não tem resolvedor** · **DEVOLVIDA pela pessoa 14/09** — substituída pelo item acima, que conta antes de decidir
  Medido em T4 e escrito na própria tabela, por linha: `Purificar` (Clérigo nv3,
  *"Remove condições ruins de um aliado"*) e `Palavra de Coragem` (nv4, *"Remove
  medo e concede PV temporário"*) são as **duas únicas** das 148 `HAB(...)` de
  `classes.js` que prometem remoção — e **nenhuma resolve**. O motivo não é
  descuido: o único caminho que o sistema executa por conta própria é
  `magiaPorNome` + `resolvidaPeloSistema` + `usarFuncaoMagica`, e **habilidade de
  classe não passa por lá** (as duas aparecem **0 vezes** no `App.jsx`). Construir
  esse resolvedor é **órgão novo**, não etapa — é a irmã da porta única de dano do
  inimigo que C2c mediu. T4 deixou as duas na tabela com `resolve: false` e um
  `aguarda` escrito, e a cobertura **não as conta como saída**: contá-las seria a
  catraca passando verde numa promessa vazia, que é a doença que a Fase T curou.
  A pessoa decide se a habilidade de classe deve poder resolver sozinha.
  Catraca já pronta e mordendo: a sabotagem `Purificar` com `resolve: true`.


- [x] **não existe PV temporário em lugar nenhum** · **RESPONDIDA 14/09 — virou a Fase V**, com as regras que a pessoa ditou (absorve antes do PV real, não cura, não acumula, fica o maior) · pesado · de: backend (achado de T4) · 14/09
  A outra metade de `Palavra de Coragem` — *"concede PV temporário"* — não tem
  mecânica em nenhum arquivo do projeto. Não é ligar sinal dormente: é campo novo
  na ficha, ordem nova de consumo no dano (o temporário some antes do PV real),
  prazo próprio e leitura na tela. Toca `absorverDano`, a barra de vida e o save.
  É órgão, e é da pessoa. O 5e o usa em dezenas de lugares, então nasceria com
  leitores de sobra — mas muda o que o jogador vive em campanha viva.


- [x] **o herói é um passageiro no próprio combate difícil** · **ABSORVIDA pela Fase N (14/09)** — o sorteio cego que manda 65% dos golpes nele morre em N4 · pesado · de: backend (achado de B1) · 14/09
  O primeiro número que a régua nova produziu, e não era o que ela foi buscar:
  o herói cai em **98,1%** dos combates do cenário `justo` e em **100,0%** dos do
  `duro` — quase sempre na rodada 1 ou 2. A partir dali a cena é *"três
  companheiros lutando sozinhos"*, e o jogador assiste. A causa está medida e é
  estrutural, não azar: `turnoDosInimigos` manda **65%** dos golpes no herói
  (o sorteio de 35% para companheiro), e oito golpes de elite por rodada contra
  42 PV e defesa 16 não têm resposta possível.
  **Isto pode ser exatamente a tensão desejada** — o combate duro *deve* doer, e
  cair não é perder — **ou pode ser o protagonista sendo apagado da própria luta**.
  Nenhum número resolve a diferença: é a pessoa que sabe qual dos dois quis.
  Se ela quiser mexer, a régua de B1 já mede o antes e o depois sem trabalho novo.


- [x] **o golpe fora de alcance continua de graça — ou passa a custar o turno?** · **RESPONDIDA 15/09 — continua de graça**, como o orquestrador recomendou. A pessoa aprovou a proposta dele. **E fica escrito o que fecha a decisão:** só vale de verdade quando o **teclado** ganhar o mesmo aviso que o botão tem — hoje o botão avisa antes do clique e a frase digitada não avisa, e uma recusa de graça que só um dos dois caminhos anuncia é armadilha para quem digita. Isso é **W2**, já aprovada. · pesado · de: orquestrador (bifurcação aberta por X1, executada em X2) · 15/09
  **X2 manteve o status quo de propósito, e é você que decide se ele fica.** Desde
  a v9.20 um golpe sem alcance **não gasta a ação** (`App.jsx`, a nota diz:
  *"cobrar o turno por uma regra que o jogador acabou de descobrir seria punir a
  curiosidade"*). A consequência que ninguém tinha somado é a que X1 mediu: como
  a recusa é de graça, **`resolverRevide` nunca roda e a rodada nunca vira** — o
  jogador ataca sete vezes, o sistema recusa sete vezes, e nada se move.
  **O que X2 fez, e por que não é a resposta:** o botão agora **impede o clique**
  em vez de recusá-lo depois, e diz *"Longe demais — Halvard a 3 m, faltam 1,5 m"*
  antes do turno ser gasto. Isso apaga o sintoma **pelo botão**; pelo teclado a
  recusa de graça continua exatamente como era. Hoje há duas portas para a mesma
  ação com duas regras — e *"toda regra que mora num só dos dois caminhos vira
  bug"* é frase desta casa.
  **As duas saídas, e o que cada uma custa:** (a) **continua de graça** — a
  curiosidade não se pune, e o preço é que o teclado segue podendo moer turnos
  estéreis sem a rodada virar; (b) **passa a cobrar** — a rodada passa a virar
  sempre, o inimigo responde, e o preço é que **errar o alcance custa o turno**,
  que é exatamente o que a v9.20 recusou. **A recomendação da mente é (a)**: agora
  que o veredito aparece antes do clique, quem erra o alcance está a escolher
  errar, e punir isso seria cobrar por uma informação que o jogo passou a dar.
  Mas (a) só fecha de verdade **se o teclado ganhar o mesmo aviso que o botão tem**
  — e isso é a Fase W2, que já está aprovada.


- [x] **`Esquivar`, `Empurrar`, `Derrubar`, `Ajudar` — quatro verbos de combate sem motor nenhum** · **RESPONDIDA 15/09 — virou a Fase Y**, na ordem que o orquestrador recomendou e a pessoa aprovou: `Empurrar`/`Derrubar` primeiro (têm alvo, distância e resultado óbvios), `Esquivar` depois, `Ajudar` por último. · pesado · de: orquestrador (bifurcação aberta por X1) · 15/09
  **X1 mediu e X2 confirmou: não é fiação que falta, é mecânica.** `Esquivar`
  escreve *"Fico em postura defensiva…"*, `Empurrar` escreve *"Empurro com força "*,
  `Derrubar` e `Ajudar` idem — e **nenhuma das quatro casa leitor nenhum**: nem
  desafio, nem agressão. Elas caem em `cena`, e quem decide se aconteceram é a IA.
  Provado em `testes/teste-golpe.mjs` contra o catálogo real, não contra regex
  copiada: `VERBOS_DE_COMBATE` diz, linha a linha, qual motor resolve cada verbo —
  e para estas quatro o campo é `null`, com o motivo escrito.
  **Por que X2 não as consertou:** dar mecânica a elas **não é ligar um fio, é
  inventar regra** — o que *Esquivar* faz ao seu número de defesa, quanto empurra
  um *Empurrar*, contra o que se rola um *Derrubar*, o que a *Ajuda* do 5e
  concede. Isso muda o que o jogador vive, logo é pesado, logo é seu. O ciclo não
  inventa mecânica de combate sozinho — é a lei que separa esta casa de um jogo
  onde a IA decide as regras.
  **A recomendação da mente, e ela tem ordem:** **`Empurrar` e `Derrubar` primeiro**
  — são os dois mais baratos, porque o grid já tem posição, distância e queda, e
  os dois viram um teste oposto com um efeito que o motor já sabe aplicar.
  **`Esquivar` depois**, porque mexe na defesa e toca o balanceamento que a Fase N
  ainda não fechou. **`Ajudar` por último**, porque a vantagem a um aliado pede um
  canal que não existe. E uma alternativa honesta que também é sua: **aposentar o
  botão que não cumpre** é melhor do que mantê-lo prometendo — mas remover o que
  existe também é pesado, e por isso está aqui e não foi feito.

<details>
<summary>as quatro perguntas como foram feitas (e as respostas)</summary>


- [x] **C2c · o inimigo conjurador é órgão novo, não etapa** · **APROVADO** · pesado · de: medição de C2 · 14/09
  A Fase C previa que a quebra valesse também para o inimigo. **Medido em C2, e
  não cabe em etapa nenhuma da fase** — é o oposto exato do companheiro. A ficha
  de inimigo (**27** entradas em `bestiario.js`; `completarInimigo` entrega nome,
  ameaça, nível, vida, defesa e perfil) **não tem habilidade nem magia**;
  **0 sítios** escrevem `efeitos` em inimigo em todo o `src/` (dois apenas *leem*,
  e a lista está sempre vazia); `tickEfeitos` **não roda** sobre inimigos —  eles
  só recebem `tickCondicoes`; `turnoDosInimigos` (`combate.js:242`) não é piloto
  com planos, é um laço de mira com **um verbo só, bater**; e o inimigo apanha em
  **dez sítios** espalhados, sem porta única.
  O pré-requisito honesto é essa **porta única do dano no inimigo** — a irmã de
  `sofrerNaPele` (`App.jsx:8069`), que foi a **v9.66 inteira, sozinha**. Depois
  dela vêm tabela de magia na ficha das 27 (mais o default para o nome que o
  Narrador inventa), verbo novo no turno inimigo, nascimento de efeito e relógio.
  A pessoa decide se o inimigo deve conjurar — e, se sim, que isso é uma fase.


- [x] **o companheiro fica envenenado para sempre** · **RESPONDIDA 14/09 — virou a Fase T** (sistema de D&D: a cura não limpa; magia, habilidade, item e salvaguarda limpam). Fase T FECHADA em v9.241.
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


- [x] **o bônus de dano do companheiro nasce e é inerte** · **RESPONDIDA 14/09 — virou a Fase B** ("se for lícito e justo, vamos fazer"). B1 e B1b feitos; B2 na fila.
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


- [x] **quatro das cinco famílias defensivas ainda não protegem** · **RESPONDIDA 14/09 — virou a Fase F** ("todas devem cumprir o que prometem"). F1–F4 na fila.
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

</details>

<details>
<summary>as duas perguntas de 13/09 como foram feitas (e as respostas)</summary>


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


- [x] **H1 · a porta** · **FEITA 16/09 · v9.265 · commit `d99bab3`** · de: pessoa · 15/09
  `porHabilidadeDeClasse` entrou nos **dois** sítios do laço, e o motor puro é
  `src/poder-de-classe.js`. **O número saiu menor que o previsto, e é o honesto:**
  a porta derruba **17 provadas** (+3 de subclasse de brinde), **9 das 66 já
  cumpriam** por leitores que a medição de v9.250 não enxergava, e **`AGUARDAM`
  declara as 40 restantes** — cada uma com nome, promessa, motivo e data.
  A catraca está de pé em `testes/teste-poder-de-classe.mjs`: `TETO_DE_AGUARDAM
  = 40` com folga **zero**, toda entrada com motivo e data, nenhum nome
  fantasma. **Nenhuma habilidade promete na ficha e falha na mesa sem estar
  declarada, e a lista só encolhe.** Das 40: 12 são H2, 7 caem pela régua do
  golpe (`HAB_OFENSIVA_RX`, item próprio nesta pauta), 5 são famílias de força
  zero, 16 pedem número que nenhuma tabela cobra.

- [x] **H2 · de quem já são os 12** · **FEITA 16/09 · v9.266 · commit `59dab1e`** · de: pessoa · 15/09
  **A suspeita estava certa, e a medição encolheu a dívida sem escrever uma
  linha de mecânica.** Dos 12: **6 já têm dono** (2 vivo, 4 parcial) e **6
  não têm**. Dos **sete** assuntos, **quatro caíram**:
  - **contra-conjuração já acontece** — a reação `contramagia` (`reacoes.js:35`,
    `corta: 1`, `soMagia: true`) é concedida por nome na ficha e a fiação está
    viva (`App.jsx:7664`→`:13981`). **Contramágica cumpre hoje**; o que não
    existe é o inimigo *conjurar*, e isso é decisão escrita em `controle.js:26`,
    não buraco;
  - **PM de volta tem dono vivo — mas não o que a linha dizia.**
    `gastarRecurso` (`combate.js:745`) é **export morto**, importada no App e
    nunca chamada (a suíte trava isso em `teste-acoes-do-jogador.mjs:475`). O
    dono é `sacrificarInvocacao` (`invocacoes.js:197`), que é o molde exato do
    que Foco Interior pede;
  - **clima tem motor vivo e semeável** (`rolarClima`/`pesosDoClima`,
    `encontros.js:44`), chamado de verdade — **mas nenhuma rolagem o lê para
    decidir número**: `palco.js:138` e `geografo.js:132` só o narram. Falta
    leitor, não mecânica;
  - **a metade mental da Contra-Canção sai pela porta** — `portaDeSaida` +
    `removerPelaPorta` (`condicoes.js:756`/`:810`) já tiram `enfeiticado`,
    `amedrontado` e `atordoado`.
  **Ficam de pé quatro assuntos e seis habilidades** — marca, cura por turno,
  zona persistente, e aura reativa sozinha na família. São as etapas H3–H6.
  O registro está na tabela: as 12 entradas de `AGUARDAM` ganharam o campo
  **`dono`** (`null`, ou `"src/arquivo.js · função"`), e a catraca em
  `teste-poder-de-classe.mjs` §9 prova que são exatamente 12, que o arquivo
  nomeado existe no disco, e que os sem-dono **só encolhem** (`<= 6`, e o `<=`
  está justificado por escrito: um `===` ficaria vermelho no commit que PAGA a
  dívida). **`dono` não autoriza ligar nada** — é endereço medido, e a saída de
  `AGUARDAM` exige a ligação feita e provada, que é etapa própria.
  **A fase não fecha em H2 — encolhe.** Sete assuntos viraram quatro, e o que
  caiu virou item da fila automática (abaixo, em "Aberto"), não etapa de fase.

- [x] **Y1 · `Empurrar` e `Derrubar`** · de: pessoa · 15/09 · **FEITO v9.271**
  Os dois mais fáceis de fazer certo: têm alvo, distância e resultado
  óbvios, e o tabuleiro já modela posição, tamanho e terreno — **empurrar é
  mover alguém que não quer**, e o campo já sabe o que é uma casa ocupada e
  uma parede. Teste oposto (Força/Atletismo contra a resistência do alvo),
  determinístico, provável em Node.
  **Entregue:** `src/disputa.js` (o teste oposto, **um** motor para os dois
  verbos, porque são o mesmo teste com dois desfechos), três nomes novos em
  `grid.js` (`direcaoDe`, `deslocarForcado`, `EMPURRAO_NO_TABULEIRO` — o
  deslocamento forçado ficou no dono da posição, para não haver um segundo
  motor de movimento) e `vereditoDoEmpurrao` em `golpe.js`, que é quem passa
  a **importar** o módulo novo e a preencher o `motor` que X2 deixou `null`.
  163 asserções em `testes/teste-disputa.mjs`. **Falta a fiação: é Y2.**


- [x] **Z1 · o recálculo, e a prova de que ele não se mexe** · feito em v9.272
  (`400748a`), 16/09 — `src/recalculo.js` + `testes/teste-recalculo.mjs` (54
  asserções). **As três propriedades ficaram provadas antes de qualquer
  fiação:** idempotência com n = 1..10 sobre 1 008 fichas; o silêncio por
  **identidade referencial** (`r.ficha === pers`), não só por `JSON.stringify`
  igual — um clone passaria no teste de JSON e continuaria a ser escrita; e as
  quatro derivações remontadas das tabelas, sem um número escrito à mão.
  **O recálculo NÃO sobe de nível pelo XP**, e isso é desenho, não falta:
  subir exige gastar o XP, `xp` não é campo governado, e o desenho errado dava
  **1 → 12 → 16 → 18 → 20 em quatro aberturas** — está escrito no teste (§5b)
  pelo nome e pelo número. **Nenhum número de jogo mudou:** 0 de 8 prontos e
  0 de 504 fichas certas divergem. **O achado que justifica Z2:** a
  recalibração de hoje mexeria no PV de 120 de 144 fichas e no PM de 138 de
  144 (pior caso −44 PM), porque usa o `pvEsperadoJogador` de `combate.js`,
  que é a régua do balanceamento e nunca foi a ficha de ninguém · de: pessoa · 15/09

- [x] **N1 · o que os dois lados já sabem** · feito em v9.248 (`9f04a18`), 14/09
  **A etapa não mudou uma linha de `src/`, de `App.jsx` ou das suítes — mediu.**
  E, como em A1, P1 e D1, a medição desmentiu boa parte do que esta fase
  escrevia. As correções estão em cada etapa abaixo, com o número que as
  obriga. O que segue é a linha de base; salvo dito, cenário `justo`,
  família `umavida|0..999`, **n = 1000 combates por cenário**, e as quatro
  famílias (`umavida`, `aa`, `bb`, `cc`) concordando dentro do IC95 por
  combate. O instrumento é cópia instrumentada da régua de B1, validada
  combate a combate (**0 divergências** em 600 combates comparados por id) e
  contra o diário (vitória 52,10% · quedas 1,790 · PV 25,88 · 119 ações de
  buff em 300 combates, o número exato que B2 registrou).

  **O lado do inimigo.** `escolherAlvo(prioridadeId, alvos)`
  (`adversario.js:155`) é **puro e sem sorte nenhuma** — não há uma
  ocorrência de `Math.random` em `adversario.js`, e 1000 chamadas idênticas
  devolvem o mesmo alvo. Ele enxerga **13 bandeiras** e nada mais (nem
  condição, nem efeito, nem defesa, nem dano tomado); desempata pelo
  **primeiro da lista**, e a lista que `turnoDosInimigos` monta
  (`combate.js:245`) **começa sempre pelo jogador** — empate exato entrega o
  herói em `o_ferido`, `o_mais_forte` e `o_mais_fraco`, medido. O único
  sítio mecânico que o chama é `combate.js:281`; a prioridade chega de
  `App.jsx:13606`, da intenção da vez. `INTENCOES` tem **46 entradas** para
  13 prioridades — e **14 delas nunca vencem** em 200 000 situações
  sorteadas dentro do domínio que o App consegue produzir, porque oito
  campos são lidos e **nunca escritos** em `src/` inteiro (`refem`,
  `doVilao`, `emboscada`, `surpresaDoJogador`, `temChave`, `chefe`,
  `carregaAChave`, `feriu`). Na mesa é pior: em 1000 combates, **8 das 46**
  são eleitas alguma vez — `sair_vivo` sozinha ocupa **48,6%** das rodadas.

  **O lado do grupo.** `decidirAcaoCompanheiro(comp, {aliados, inimigos,
  jogador, rodada})` (`companheiros.js:183`) lê **sete coisas** e **não lê
  inimigo nenhum além de "está vivo?"** — nem ameaça, nem nível, nem quem
  bate em quem, nem classe de aliado. São cinco planos em ordem fixa, e o
  apoio (plano 3) só existe em **`rodada <= 2`** com portão `0,7`. O
  retrato, em 1000 combates `justo` (17 276 decisões, 17,28 por combate):
  habilidade 35,52% · ataque 33,30% · cura 23,88% · guarda 5,23% ·
  **buff 2,07% (358)**. **Ataque: 11 889 de 11 889 (100,00%) no inimigo de
  menor PV absoluto** — `sort` ascendente, sem ler mais nada.
  **Cura: 4 125, das quais 89,07% no herói e 0 (zero) na própria
  Clériga** — os candidatos são `[jogador, ...aliados]` e `aliados` exclui
  quem decide (`combate.js:379`); ela é, medido, a companheira que menos
  dura. E **59,68% das curas (67,27% no `duro`) chegam em alguém já a 0 PV**:
  o gatilho `frac <= 0,35` não previne, ressuscita.

  **Por que o buff é `Escudo da Fé`: 347 de 358 (96,93%), e a causa é
  tripla.** (1) **O acervo**, que é a maior: das **148** habilidades de
  classe, `ehBuff` casa **14**, e só **7 (4,7%)** podem produzir bônus
  ofensivo — do **nível 8 em diante, 1 classe em 12** carrega uma na ficha
  que `garantirFichaCompanheiro` monta, porque o corte de 6 slots por nível
  mais alto (`companheiros.js:72`) tira justamente as baratas. (2) **A
  precedência** `guarda || abrigo || buff` (`companheiros.js:262-264`), que
  é **decisão medida de P3/v9.233 com o motivo no comentário**, não
  descuido: `Escudo da Fé` é abrigo e ganha antes de a busca por buff
  acontecer. (3) **A primeira-que-casa dentro do balde**, que faz o Bardo
  pegar `Contra-Canção` (bônus **0**) em vez de `Hino de Guerra` (+2), por
  ordem de catálogo. E há prova de que a precedência não é cega: no
  `brando`, onde o escudo sobrevive à rodada 1, a `Bênção` salta de 3,07%
  para **28,84%**. Golpes de companheiro com bônus ofensivo: **5 em 11 889
  (0,042%)** — B2 mediu 0,06% em 300 combates, reproduzido.
  **E a janela é tão culpada quanto a escolha:** no `justo` as rodadas 1–2
  da Clériga são comidas pela cura (**1 457 curas contra 358 buffs**); no
  `brando`, mesma ficha, **1 380 buffs contra 20 curas**. Dar cabeça a quem
  escolhe, sem mexer na janela, tem **teto medido de 358 ações por 1000
  combates**.

  **O `intelecto`.** Escala real **0–3 na criação** (`PONTOS_TOTAIS = 6`,
  `ATRIBUTO_MAX_CRIACAO = 3`), até 5 com raça; **`ATRIBUTO_MAX = 5` é
  importado em `App.jsx:43` e nunca lido** — não tem um leitor sequer. Nos
  **oito prontos**: Muralha 0 · Sombra 1 · Chama 3 · Remendo 3 · Voz 0 ·
  Flecha 1 · Punho 0 · Voto 1 — faixa 0–3, mediana **1**, média **1,13**,
  **três em zero e o valor 2 vazio**. No herói, a criação **não impõe
  atributo por classe** (os 6 pontos são livres); 4 das 12 classes têm
  `intelecto` como `atributoChave`, e isso só vira proficiência. **E nas
  fichas de companheiro o `intelecto` não existe:** `fichaDeCompanheiro`
  (`App.jsx:19188`) e `garantirFichaCompanheiro` (`companheiros.js:53`)
  montam dez campos e **nenhum é `atributos`** — o único companheiro com
  atributos é o que vem da sala PvP, porque é ficha de jogador. Os três da
  régua têm `intelecto` escrito à mão em `CENARIOS_DA_REGUA`; o jogo não dá
  nenhum. **E a pauta subestimava o que `intelecto` já faz:** além de teste
  e magia, ele decide o **PM máximo** (`manaBase + intelecto*2`, `App.jsx:3734`
  e `prontos.js:173`) — que é o recurso que o piloto gasta em toda decisão —,
  pesa 18 em `poder.js:109` e é recuo de resistência em `aflicoes.js:80`.
  Ele não ganha "um segundo leitor": ganha o quinto.

  **O inimigo não tem grau de inteligência — confirmado dos dois lados.**
  `bestiario.js` tem **27 entradas** (18 criaturas + 9 arquétipos) com
  exatamente os campos `nome, ameaca, nivelRef, des, agil, desc, perfil`, e
  `completarInimigo` devolve `{nome, ameaca, nivel, vidaMax, vida, defesa,
  des, agil}` (+`perfil`). Nenhum casa com inteligência. **A âncora que
  serve é `ameaca`**: 5 valores fechados (comum 7 · fraco 6 · elite 5 ·
  lendario 5 · competente 4), já ordinal (`bonusDeAmeaca`,
  `pvEsperadoInimigo`, `ataquesDoInimigo` a leem como escada), sobrevive a
  `completarInimigo` e **tem recuo explícito (`"comum"`) para o nome que o
  Narrador inventa** — é o único campo com as quatro propriedades.
  `nivelRef` tem 13 valores para 27 criaturas (granularidade demais, e não é
  ordinal de cabeça); `des`/`agil` medem corpo; `perfil` só existe em 7.
  **E `ameaca` sozinha não basta:** Comandante (*"perigoso e tático"*) e
  Sentinela Blindada (*"muralha ambulante"*) são as duas `elite`.
  **Já existe uma classificação de cabeça, e não mora no bestiário:**
  `menteDaCriatura` (`adversario.js:187`), 3 valores por regex sobre o
  **nome**, que põe **18 das 27 em `pensa`** (o Capanga e o Dragão Ancião no
  mesmo balde) e classifica o **Colosso** como `besta` porque `RX_BICHO`
  casa a palavra "besta". E **`completarInimigo` não copia o `desc` da
  base** (`bestiario.js:69-86`): o único texto que hoje insinua cabeça
  (*"força bruta e pouco cérebro"*, *"perigoso e tático"*) nunca chega à
  mesa, então `menteDaCriatura` roda só sobre o nome.

  **Quem apanha, e quanto — a distribuição real.** De todos os golpes que os
  inimigos desferem: **herói 60,06% (`justo`) · 57,27% (`duro`) · 64,48%
  (`brando`)** — **não 65%**. Por companheiro no `justo`: Engenheiro 14,52% ·
  Mago 13,54% · Clériga 11,88% (ela apanha menos porque dura menos, não
  porque o sorteio a poupe: o ramo de 35% sorteia uniformemente entre os
  vivos). **A divergência tem causa exata e fecha inteira:** o sorteio só
  roda quando há mais de um alvo vivo, e **quando roda ele mede 64,85% ·
  64,69% · 64,48%** — o número de projeto, cru. Ele deixa de rodar em
  **7,88% (`justo`) e 12,43% (`duro`)** dos golpes porque
  **`vivosAlvo = alvosDele.filter(vida > 0)` (`combate.js:267`) tira o herói
  caído da lista de alvos** — e no `brando`, onde o herói nunca cai, a medida
  é exatamente 64,48%.
  **E o achado que a fase não tinha:** a lista de alvos é uma **foto tirada
  uma vez** por turno (`combate.js:245`) e não se atualiza entre os golpes,
  então **13,40% (`justo`) e 18,03% (`duro`) do dano que os inimigos rolam
  cai em quem já está no chão** — 38,15 ± 1,80 e 62,19 ± 2,16 PV por
  combate. Um inimigo com cabeça que apenas **pare de desperdiçar** endurece
  o combate por essa margem antes de mirar papel nenhum.

  **O achado que obriga uma etapa nova (N1b): a régua de B1 mede o combate
  com o Adversário fora do circuito.** `regua-combate.mjs:612` passa
  **`prioridade: ""`**, sem uma linha de comentário dizendo por quê, e
  `combate.js:279` só consulta `escolherAlvo` quando a prioridade existe.
  Ou seja: toda a linha de base de B1/B1b/B2/T1 para Uma Vida foi medida com
  o órgão desligado. Uma reconstrução de `lutaDaMesa` no scratchpad, ligando
  a prioridade ao mesmo laço, dá **vitória 52,10% → 1,80%** no `justo` e
  **8,40% → 0,00%** no `duro`, e é robusta (8 variantes do lugar entre 1,6%
  e 13,6%; com a eleição atrasada uma rodada, 3,2%). **É reconstrução, não a
  régua** — o número exato tem de sair da régua consertada, e é isso que
  N1b faz. A causa está medida prioridade a prioridade: **toda prioridade
  que aprende a evitar o herói vira TPK** (`o_conjurador` 0,6% ·
  `quem_nao_e_o_heroi` 0,4% · `o_mais_forte` 0,4% · `o_curandeiro` 1,2%),
  porque o herói é o único combatente que **não morre ao cair** e de quem os
  inimigos **desistem** ao vê-lo no chão. Bater nele é dano desperdiçado —
  e *"o brilhante corta a cura primeiro"* é, na mesa de hoje, a definição de
  combate invencível. **A consequência é da pessoa, e está em "Para a pessoa
  decidir".**


- [x] **N1b · a régua mede o combate que existe** · feito em v9.251 (`061c5bf`), 15/09 — **a estimativa de N1 se confirmou: vitória 52,1% → 1,8% no `justo`, 8,8% → 0,0% no `duro`.** A catraca ficou **vermelha no dente 1** e **nenhum limiar foi afrouxado**; a dívida entrou como `pendente`. O `justo` **deixou de ter resolução nos dois sentidos**, e recalibrar é da pessoa · de: N1 · 14/09
  **Instrumento, não gameplay — o molde é B1b, que fez o mesmo pela mesma
  razão.** A régua passa `prioridade: ""` (`regua-combate.mjs:612`) e por
  isso mede Uma Vida com `escolherAlvo` fora do circuito. Esta etapa liga a
  intenção à régua pelo caminho que o App usa (`lutaDaMesa` → `intencaoDaVez`
  → `turnoDosInimigos`), mantém a régua determinística por semente, e
  **republica a linha de base**: vitória, quedas, PV, % de golpes no herói e
  o desperdício em corpos caídos, nos três cenários e nas quatro famílias.
  Nenhuma linha de `src/` muda. **Vem antes de N4 e de N5**, senão o antes e
  o depois da Fase N inteira são medidos com o órgão desligado — e o
  veredito de N7 seria a soma de duas coisas que a pessoa precisa ver
  separadas. Catraca: os números velhos continuam reproduzíveis com a
  prioridade vazia, para que a história de B1/B2/T1 não passe a mentir.


- [x] **N2 · a escada, e de onde cada um tira o seu degrau** · feito em v9.259 (`dab5caa`), 15/09 — **a escada existe e é inerte, como desenhada; e a previsão que ela obriga desmente a expectativa da fase: o `justo` não sai de 1,4% para "um pouco melhor", sai para 87,7%.** Cinco degraus, as 46 distribuídas, `brilhante` não se herda. **A régua continua saturada, agora pelo outro encosto, e três dentes da catraca ficam vermelhos pelo excesso — nenhum limiar foi tocado.** O que N4 herda está escrito abaixo · de: pessoa · 14/09
  Tabela nomeada: os degraus (animal, bruto, astuto, treinado, brilhante…),
  **o que cada degrau enxerga** e **o que decide**. Duas fontes, uma escada:
  o companheiro e o herói tiram o degrau do **`intelecto` da ficha**; a
  criatura tira de um campo novo no bestiário, e quem não declarar herda um
  padrão explícito. Nenhum número solto.

  > **CORRIGIDO POR N1 (14/09), e é buraco de desenho, não de redação:**
  > **o companheiro não tem `intelecto` — não tem `atributos` nenhum.**
  > `garantirFichaCompanheiro` (`companheiros.js:53`) nunca os sintetiza, e
  > nenhum dos dois caminhos de criação os passa (`App.jsx:5763`,
  > `regras-jogo.js:193`). Ou N2 faz o `intelecto` do companheiro **nascer**
  > — e aí é campo novo em ficha viva e em todo save —, ou ele tira o degrau
  > de outro lugar (o `atributoChave` da classe já separa Mago de Guerreiro,
  > sem campo novo). Sem resolver isto, todo companheiro de Uma Vida nasce
  > com degrau `undefined`, e N5 e N6 ficam sem a metade que decide.
  > **A escada de cinco não cabe na distribuição que existe:** os oito
  > prontos ocupam **0, 1 e 3** (mediana 1, média 1,13, três em zero, o
  > valor **2 vazio**) — uma escada de cinco degraus nasce com dois mortos.
  > Ou são **três** degraus, ou N2 redistribui `intelecto` nos prontos, e
  > isso é mexer em ficha que a catraca de equilíbrio da arena vigia.
  > **A escala é 0–3 + raça, não 0–5:** `ATRIBUTO_MAX = 5` existe e **não
  > tem leitor** (`App.jsx:43` importa e nunca usa); quem o usar como teto
  > da escada lhe dá o primeiro.
  > **O campo novo do bestiário tem âncora nomeada: `ameaca`** — 5 valores
  > fechados, já ordinal, sobrevive a `completarInimigo` e já tem recuo
  > (`"comum"`) para o nome que o Narrador inventa. É o padrão herdado, e
  > **sozinha não basta**: Comandante e Sentinela Blindada são as duas
  > `elite`.
  > **E a escada não nasce em terreno vazio:** `menteDaCriatura`
  > (`adversario.js:187`) já classifica cabeça — 3 valores, fora do
  > bestiário, por regex sobre o nome, com **18 das 27 em `pensa`** e o
  > Colosso em `besta` por acidente de palavra. N2 **substitui** esse
  > classificador ou declara como os dois convivem; duas classificações de
  > cabeça em dois lugares é a doença que esta casa já conhece. Se a âncora
  > for textual, note que **`completarInimigo` não copia o `desc` da base**.

  ### O QUE N2 CONSTRUIU (v9.259) — e o número que julga a fase inteira

  **A escada:** `animal`(0) · `bruto`(1) · `astuto`(2) · `treinado`(3) ·
  `brilhante`(4), em `src/degraus.js`, cada degrau com **o que enxerga** e
  **o que decide** escritos. **As 46 intenções por degrau:** animal **13** ·
  bruto **12** · astuto **13** · treinado **6** · **brilhante 2** — só
  `calar_a_magia` e `matar_o_remendo` moram no topo, como a pessoa desenhou.
  A rede (`brigar`, `sobrepujar`, `aguentar`) mora no chão, porque **um bicho
  não pode perder o turno**. Invariante nova e provada: **todo `vira` aponta
  para degrau igual ou menor** — a quebra não pode jogar o combatente numa
  intenção que ele não enxerga (0 quebras em ~120 mil rodadas).

  **A escala 0–3, resolvida por faixas e não por valor.** `FAIXAS_DO_INTELECTO`
  cobre `0..ATRIBUTO_MAX`: `0→bruto`, `1–2→astuto`, `3–4→treinado`,
  `5→brilhante`. **O chão da ficha é `bruto`, não `animal`: quem tem ficha é
  gente** — e `animal` não fica morto porque a fonte da criatura o alcança.
  Um degrau só é morto quando **fonte nenhuma** o alcança, e nenhum é.
  **`ATRIBUTO_MAX` ganhou o primeiro leitor de verdade** (o item aberto que
  previa isto está fechado). O **companheiro não ganhou campo novo** — ficha
  viva e save de campanha seriam pesado: `RECUO_POR_ATRIBUTO_CHAVE` mapeia o
  `atributoChave` da classe num `intelecto` presumido e passa pela **mesma**
  tabela de faixas (12 classes: 1 bruto, 7 astuto, 4 treinado, e **nenhuma
  chega ao topo pelo recuo**).

  **A criatura, e a regra de princípio que decide a fase: `brilhante` não se
  herda, declara-se.** `ameaca` mede **perigo**, não **cabeça** — o Golem de
  Pedra é `elite` e não pensa. `DEGRAU_POR_AMEACA` (fraco/comum→bruto,
  competente→astuto, elite/lendario→treinado) × `TETO_POR_MENTE`
  (besta→animal, morto→bruto, pensa→treinado), com
  **`TETO_DO_HERDADO = "treinado"`**. Herdar o topo é **exatamente** como
  `calar_a_magia` passou a vencer 100% das rodadas 1: todo nome inventado pelo
  Narrador nascia com a mente mais afiada da mesa. **10 das 27 declararam**
  (Ogro, Elemental Menor, Quimera, Gigante, Brutamontes, Sentinela Blindada e
  Colosso em `bruto`; Soldado em `astuto`; **Lich e Dragão Ancião em
  `brilhante`**). Comandante herda `treinado` e a Sentinela declara `bruto`:
  **as duas `elite` deixam de ser a mesma cabeça**, que era o buraco de N1.
  `menteDaCriatura` **não foi tocada** — ela diz *que tipo* de mente, o degrau
  diz *quanta*, e há **um único sítio** que computa degrau.

  #### A PREVISÃO, com a régua de N1b (3 cenários × 4 famílias × 1000)

  | `justo` | vitória | quedas /3 | PV grupo /132 | TPK | 1ª queda | golpes no herói |
  |---|---|---|---|---|---|---|
  | **hoje** (peso global) | **1,40–1,80%** | 2,978–2,986 | 0,41–0,64 | 98,2–98,6% | 1,05 | 36,5% |
  | **por degrau** (o que N4 faria) | **86,70–87,70%** ±2,10pp | 0,982–1,012 | 72,8–73,7 | 12,3–13,3% | 3,47–3,62 | 77,2% |
  | *[ref.] Adversário desligado* | *51,10–54,20%* | *1,74–1,79* | *25,9–28,1* | *45,8–48,9%* | — | *60,1%* |

  **É boa demais, e por muito.** 87,7% fica **10,8 margens acima do teto de
  65%**, e a escada é **mais generosa com o grupo do que não ter Adversário
  nenhum**. Os três dentes da `CATRACA_DE_UMA_VIDA` ficam vermelhos, agora
  todos pelo lado do excesso (vitória 87,7 contra teto 65 · PV 73,7 contra 35 ·
  quedas 0,99 contra piso 1,2). **Nenhum limiar foi afrouxado.** `duro`
  0,0% → **27,5–34,4%** (as 4 famílias **discordam** ali a n=1000 — esse número
  ainda mede resorteio); `brando` continua 100%, e as **12 quedas em 4000** de
  N1b viram **0 em 4000**. **A saturação continua:** era 0,0 · 1,6 · 100, passa
  a 31 · 87 · 100 — o `justo` não volta a ter resolução nos dois sentidos,
  **muda de encosto**. A ressalva de N1b segue de pé.

  #### OS TRÊS ACHADOS QUE N4 HERDA — e o primeiro desmente a fase

  **(1) "Distribuir por degrau acorda o acervo morto" está DESMENTIDO nesta
  régua: o acervo ENCOLHE.** Intenções eleitas alguma vez no `justo`: **hoje 8
  de 46 → por degrau 2 de 46** (`sair_vivo` 63,8% · `brigar` 36,2%). A causa
  está aberta e medida: **na rodada 1 do `justo`, só 2 das 46 disparam** —
  `calar_a_magia` (brilhante, peso 17) e `brigar` (animal, peso 3), e **não há
  nada entre elas**. Tirar o topo entrega a rodada 1 ao chão da rede, 100% das
  vezes, em qualquer degrau abaixo de `brilhante`. E `brigar` mira
  `quem_estiver` = o primeiro da lista = **o herói**, que é o combatente que
  não morre ao cair: o degrau faz a oposição **desperdiçar dano de propósito**.
  Depois, `brigar` vira `sair_vivo`, que quebra em `saidas < 1` e a régua tem
  `saidas: 2` — **`sair_vivo` nunca quebra: é terminal.**
  **E a aderência é que tranca, não a escada:** medido o vencedor de cada
  rodada *se a memória não segurasse*, por degrau dá **8 distintas**
  (`acabar_o_ferido` 47,9% · `brigar` 17,5% · `perder_o_animo` 10,0% ·
  `aguentar` 9,9% · `deixar_cair` 9,3% · `provar` 3,5% · `terminar` 1,9%).
  `acabar_o_ferido` exige `rodada >= 2`, e na rodada 2 a memória já segura
  `brigar`. **N4 precisa ou de intenção de degrau médio que dispare na rodada
  1, ou de uma quebra que devolva a decisão** — a escada sozinha não distribui.

  **(2) O limite escrito de N2: `pensa` é binário e vence a declaração do
  bestiário.** Medido: o **Lich**, com `brilhante` **declarado**, **não corta a
  magia** — `menteDaCriatura("Lich")` devolve `morto` (RX_MORTO casa "lich"),
  logo `pensa: false`, e `calar_a_magia.quando` exige `s.pensa`.
  `enxerga("brilhante","brilhante")` é `true`: **a escada deixa passar, quem
  barra é a porta antiga.** Ele elege `nao_para` (peso 11, `animal`) e é **o
  inimigo mais fácil da régua inteira: 97,3–98,1% de vitória do grupo**,
  idêntico antes e depois. Enquanto `pensa` for binário, **nenhum morto-vivo
  declarado no topo alcança as duas intenções do topo.** Quem resolve é N4, que
  troca o portão `pensa` pelo degrau; N2 não o fez de propósito — é mudança de
  comportamento vivo e pede medição própria.

  **(3) A escada está certa no topo, e não é artefato do nome inventado.**
  Variante com criaturas **nomeadas**, mudando só o outro lado da mesa:
  Dragão Ancião (`brilhante` declarado) corta a magia primeiro **combate a
  combate idêntico** nos dois modos — o filtro não toca em quem declara o topo;
  Comandante (nome real, `treinado`) 0,2–0,8% → **66,5–69,3%**; Sentinela
  Blindada (`bruto`) reproduz o "Adversário". **E duas métricas da régua morrem
  no modo por degrau:** `absorvido` e `abrigos` vão a 0,000 no `justo` e no
  `duro` — o abrigo da Clériga é firmado nela, e com 77% dos golpes indo ao
  herói ele nunca morde.

  Reprodutível no scratchpad: `preparar-regua.cjs` (cópia instrumentada por
  âncora, importando as tabelas de verdade de `src/` — nenhuma reescrita à
  mão), `n2-validar.mjs`, `n2-diagnostico.mjs`, `n2-medir.mjs`, `n2-porque.mjs`.
  O instrumento foi validado: no modo de hoje é **idêntico à régua do projeto
  combate a combate** (600 combates, 0 divergências) e reproduz o 52,1%
  histórico de B1/B2/T1 com o Adversário desligado.


- [x] **Q1 · quem cai, e quem só morre** · de: pessoa · 14/09 ·
  **FEITO em v9.268** (`7a519be`)
  Tabela: quem faz teste de morte ao chegar a 0 (herói, companheiro,
  inimigo **importante**) e quem morre direto (o comum). O critério de
  "importante" sai de campo declarado no bestiário — nunca de adivinhação
  por nome. Provado em Node, com o lixo e os limites.
  **O que ficou escrito:** `src/queda.js` — `DONOS_DA_QUEDA` (herói e
  companheiro caem **sempre**, inimigo **só se importante**, e o padrão de
  quem não se declarou é morrer direto), `quedaAoChegarAZero` como porta
  única, `ehImportante` que lê **só** o campo declarado, e
  `GOLPE_NO_CAIDO` — o golpe em quem já caiu custa **1 falha, 2 no
  crítico, 0 em quem não testa**. **5 das 27** criaturas declaram
  (Dragão Jovem, Lich, Dragão Ancião, Comandante, Horror); o Comandante é
  `elite` e declara e o Colosso é `lendario` e não, que são as duas provas
  de que o campo não sai da `ameaca`. 81 asserções em `teste-queda.mjs`.
  **Q1 NÃO LIGA NADA** — a tabela existe e ninguém a lê na mesa; a fiação
  é de Q2, com as notas no cabeçalho do módulo.
  **E a medição mudou o desenho de Q2** (`testes/sonda-queda.mjs`, 1000
  sementes, IC 95%): o desperdício em corpo caído é **20,02% (`justo`) e
  22,68% (`duro`)** do dano inimigo, **não** os 13,40%/18,03% que N1
  escreveu — N1 mediu antes do conserto da ordem da rodada e com parte da
  conta vinda de uma reconstrução de scratchpad. Projeção da tabela:
  **0,868 ± 0,047** (justo) e **0,990 ± 0,050** (duro) quedas de companheiro
  por combate passariam a virar morte. **Registado e NÃO reequilibrado** —
  balancear é da pessoa, e a régua corre com `grade: null`, logo é limite
  otimista e não o jogo.
  **O que Q1 NÃO tocou, e continua na fila:** a queda de companheiro é
  silêncio absoluto (`App.jsx:13967`, item de X3b abaixo) e o reforço entra
  sem `x`/`y` nem iniciativa — os dois são fiação, logo de Q2 ou de quem
  pegar o bastão.

- [x] **V1 · o campo e a ordem do dano** · **FEITO v9.269** (16/09, commit `056dcd2`) · de: pessoa · 14/09
  Campo novo na ficha; `absorverDano` consome o temporário **antes** do PV
  real. **Não cura** (ganhar temporário não muda o PV atual) e **não
  acumula**: ao receber um novo, fica **o maior dos dois** — e quando a
  escolha for do jogador, ela aparece; senão o sistema fica com o maior, que
  é a regra que a pessoa deu. Prazo próprio. Provado em Node, incluindo o
  lixo (`null`, `{}`) e o empate.

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

- [x] **C2 · a quebra acontece na mesa** · feito em v9.235 (`086d035`), 14/09
  **A etapa foi medida antes de ser prometida, e a medição a desfez em três.**
  Fechou com a **leitura do herói**, que era o coração dela.
  **A pauta dizia meia verdade e o corte a endireitou:** a linha
  `💢 Concentração quebrada` (`:13383`) sempre foi **incondicional** — o jogador
  já lia *que* perdeu e *qual* magia. Atrás de `mostrarRolagens` estava só o
  **🎲 com a CD e o dado**. O buraco era o **porquê**, e é o que se fechou.
  **A frase é conta, então nasceu no módulo:** `testeConcentracao`
  (`combate.js`) ganhou o campo `linha` — irmã da de `absorverDano` —, e o
  `App.jsx` não monta uma sílaba. A CD saiu do meio do `Math.max` e virou
  tabela (`RESISTENCIA_DA_CONCENTRACAO`): agora que o **texto** carrega a
  dificuldade, número à mão é número que a suíte só prova copiando.
  **Decidido e travado: a linha nova nasce SÓ NA QUEDA.** Falar a cada golpe
  aguentado seria ruído por rodada; quem quer o teste mantido tem a 🎲 intacta.
  **O que o jogador lê, ao vivo e com as rolagens desligadas:**
  `💢 Voo escapa dos dedos — o corpo aguentou 6, e era preciso 10.`
  **O Mestre enfim recebe o sinal, e sem um byte de prompt:** a promessa de
  `ECONOMIA_ACAO_PROMPT` (*"quando quebrar, narre o efeito se desfazendo"*)
  nunca tinha quem a avisasse. Vai pela nota dinâmica, só no turno da queda —
  **pior cena real 81935 → 81935 chars**, crescimento estático zero.
  Conferido vivo com a queda de verdade (rodadas 2 e 4 aguentaram em silêncio,
  a 5 derrubou Voo). `teste-efeitos.mjs` 421 → **463**. Ver o diário.

- [x] **C2b · o companheiro segura o que já conjura** · feito em v9.236 (`0f96fd6`), 14/09
  **O cuidado de C2 era o coração da etapa, e a medição que ele mandou fazer
  corrigiu dois números desta pauta.** A porta é a mesma do herói, então o raio
  foi medido **antes**: **"cinco habilidades do herói" são três** (Bênção, Escudo
  da Fé, Invisibilidade) — Voo e Marca do Caçador casam com o catálogo mas **não
  abrem condição nenhuma** em `aflicaoDe`, e `efeitoDeBuff` nunca é chamado por
  elas. **"13 escolhíveis" nos prontos são quatro**: 13 é quantas o piloto
  *enxerga*, 5 entram só pelo ramo ofensivo e 4 por cura; `chama` e `voz` carregam
  8 e 7 magias de concentração e **nenhuma** vira efeito. Colisão de nome: zero.
  **A porta é o catálogo, nunca a habilidade:** `exigeConcentracao(h)` com a ficha
  responderia `false` **em silêncio** para tudo. `magiaPorNome` primeiro.
  **A cobrança entra por uma porta só** — `segurarOuPerder` (`App.jsx:6593`), irmã
  de `passarPeloAbrigo` —, nos quatro sítios sempre sobre a ficha **pós-abrigo**
  (o escudo que comeu a batida já pagou por ela), só em quem fica de pé, só quando
  o golpe tirou PV. **O jogador lê a frase de C2, palavra por palavra**, com o dono
  na frente e sem `mostrarRolagens`: `💢 Irmã Vela — Bênção escapa dos dedos — o
  corpo aguentou 9, e era preciso 10.` Em 168 quedas na arena: **10 quebras**,
  todas de Bênção (Remendo 6, Voto 4). Escudo da Fé nunca quebra — `absorverDano`
  já o consumiu antes de o dano restante chegar ao teste.
  **A catraca de equilíbrio ficou vermelha e a culpa era dela.** `punho`, que não
  tem uma magia na ficha, caiu a 32,9% em "cc" — e uma cópia da arena com o saque
  mantido e **toda consequência de jogo apagada** mede os **mesmos 32,9%**.
  Famílias de 30 sementes davam **~10% de vermelho falso a cada mexida no código**.
  Conserto do **instrumento**, um número só: **30 → 120 sementes por família**
  (o tamanho que a tabela já chamava de baixa variância). Piso 35, teto 65 e teto
  de amplitude **intocados**; o retrato **não** cresceu junto, porque ali mais
  precisão afrouxaria. Escada de sabotagem refeita nos dois instrumentos: o único
  vermelho que some é o falso positivo, que acendia igual na árvore sã. **Nenhum
  pronto reajustado.** Margem mais fina honesta: `punho`/"cc" **38,9%**, 3,9 pt do
  piso. `teste-efeitos.mjs` 463 → **482**; `teste-arena.mjs` ganhou a seção 10.
  Ver o diário.

- [x] **C3 · uma de cada vez** · feito em v9.237 (`aec84fe`), 14/09
  **A pauta chamava de conserto e estava certa — mas errava no tamanho: não era
  canto raro.** Em 2094 quedas medidas, 1352 efeitos de concentração foram
  firmados e **316 deles eram uma segunda por cima de outra — 23,4%**, um caso em
  cada quatro. O raio, contado e não suposto: das 34 magias marcadas só **3**
  chegam à porta de `efeitoDeMagia`, e das 148 habilidades **3** viram efeito no
  herói; **5 das 12 classes** podem colidir por nome distinto, o companheiro só
  pelo Clérigo (Bênção + Escudo da Fé), e a arena em **2 dos 8 prontos**.
  **O teto mora na tabela e a função o conta**, em vez de cravar "derruba a
  anterior": `CONCENTRACAO_DA_MAGIA.quantasAoMesmoTempo: 1` e `firmarEfeito`
  (`efeitos.js`), irmã de `absorverDano`, que derruba as **mais antigas até
  caber** — um teto 2 amanhã funciona sem uma linha nova, e a suíte sabota o teto
  para provar que ele é lido de volta. `empilhar` ficou **genérico e intocado**:
  frasco, relíquia, canal do Mestre e milagre não sabem o que é concentração.
  **`efeitoEmConcentracao` deixou de sortear.** Era `.find(...)` — ordem de
  chegada. Fica a **última a entrar**, com o motivo no código: é exatamente a que
  `firmarEfeito` teria mantido, e escolher a primeira faria um save velho quebrar
  a magia recém-erguida **e** guardar o fantasma da anterior. Travado nos dois
  sentidos; nenhuma das 7 asserções existentes virou de lado.
  **No App, uma porta só** — `firmarOuCeder` (`:6634`), terceira irmã de
  `passarPeloAbrigo` e `segurarOuPerder`, nos três sítios (`:7878`, `:7993`,
  `:12598`), com recuo de propósito: se o motor estourar, o buff pago em PM não
  some. **O que o jogador lê:** `💢 Bênção escapa dos dedos — Invisibilidade toma o
  lugar dela.` e, no grupo, `💢 Irmã Vela — Bênção escapa dos dedos — Escudo da Fé
  toma o lugar dela.` **Teto de prompt 81935 → 81935 chars**, crescimento
  estático zero; a nota do Mestre **não coube e não foi forçada** (289 chars
  contra margem de 65) — está em "Aberto", junto com a de C2b.
  **O preço, declarado como fato:** o piloto não sabe do teto e joga fora o Escudo
  da Fé por Bênção — mordidas do abrigo **245 → 202** (−17,6%). A regra está certa
  (o 5e concorda); quem está errado é o piloto, e ensiná-lo é **outra etapa**, em
  "Aberto". Catraca de equilíbrio na faixa, margem mais fina **abrindo**:
  `punho`/"cc" 38,9% → **40,2%**; amplitude **11,9**. Nenhum pronto reajustado.
  **O achado do ciclo:** de 23 sabotagens, **S21 estava verde** — uma arena que
  chamasse a porta nova, empurrasse a frase e remendasse a ficha à mão passava em
  tudo *e enganava a própria contagem*, porque a contagem lê as linhas e a linha
  mentia. O fio que ela não corta é o **prazo**, e daí saiu o dente do fantasma.
  E a ponte que ninguém pediu: a suíte extrai a palavra "UMA" de
  `ECONOMIA_ACAO_PROMPT` e exige que a tabela a cumpra — **discordar é vermelho**.
  `teste-efeitos.mjs` 482 → **543**; `teste-arena.mjs` 86 → **99**. Ver o diário.

  **A FASE C ESTÁ FECHADA.** A regra estava escrita dos dois lados e inerte no
  meio: `testeConcentracao` (a regra ditada pela pessoa) existia **desde sempre**
  e **nunca rodava**, porque nenhum nascimento copiava `concentracao` — o herói
  segurava Invisibilidade, apanhava, e não havia o que perder. Hoje: **34 das 85
  magias marcadas** e trancadas por tabela com 10 exceções motivadas (**0**
  marcadas instantâneas); **dois** nascimentos alimentando a regra, os dois
  perguntando ao **catálogo** e nunca à ficha (o milagre continua mudo **por
  prova**); **quebras por queda 0 → 10 em 168**; **trocas por teto 0 → 60 em 420
  quedas**, com **0 momentos com duas de pé** onde antes 23,4% eram segunda por
  cima de outra; e o jogador, que antes lia apenas **que** perdeu, hoje lê **por
  quê** nas duas — em voz de mundo, sem `mostrarRolagens`, com as frases nascendo
  no módulo ao lado do número. **Teto de prompt 81935 chars nas quatro versões**:
  a fase inteira entregou quebra, leitura, companheiro e teto com crescimento
  estático **zero**. `teste-efeitos.mjs` 387 → 421 → 463 → 482 → **543**;
  `teste-grimorio.mjs` 89 → **142**. A catraca de equilíbrio **nunca saiu da faixa
  nas quatro etapas, com nenhum pronto reajustado** (a margem mais fina foi de
  32,9% — falso positivo — a 38,9% e a **40,2%**), e o próprio instrumento foi
  consertado no caminho (famílias de 30 → **120** sementes, em C2b).

  **Corrigido em 14/09 (T1):** havia, sim — a pessoa respondeu as quatro pesadas
  no mesmo dia e a fila aprovada virou **T → B → F → I**, escrita acima. A próxima
  etapa é a **T3 · a salvaguarda no fim do turno**; T2 fechou em v9.239.

<details>
<summary>o texto original da etapa C3 (antes de ser executada)</summary>


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

  **Corrigido em 14/09 (T1):** havia, sim — a pessoa respondeu as quatro pesadas
  no mesmo dia e a fila aprovada virou **T → B → F → I**, escrita acima. A próxima
  etapa é a **T3 · a salvaguarda no fim do turno**; T2 fechou em v9.239.


- [x] **`ATRIBUTO_MAX = 5` é importado e nunca lido** · **RESOLVIDO em N2 (v9.259)** — `FAIXAS_DO_INTELECTO` (`src/degraus.js`) o importa como teto da última faixa, e a suíte o lê de volta. **Com uma ressalva escrita no código:** ele **não é o teto real do jogo** — `tetoAtributo(nivel)` (`atributos.js:66-73`) chega a **6 no nível 10, 7 no 15 e 8 no 20**. A última faixa satura de propósito, então nada quebra; o que mudou é que o comentário deixou de afirmar um teto que a progressão passa · leve · de: backend (achado de N1) · 14/09
  `constantes.js:28` exporta, `App.jsx:43` importa, e **nenhum sítio do
  projeto o consulta** — a suíte só confere `ATRIBUTO_MAX_CRIACAO`. É export
  vivo pela letra da catraca e morto no efeito. Importa agora porque N2 vai
  querer um teto de escala e este é o número que parece ser ele: quem o usar
  lhe dá o primeiro leitor, e quem não usar devia tirá-lo do import.

- [x] **o buff do companheiro é mudo em Uma Vida** · **RESPONDIDA 14/09 — virou parte de N6** · pesado · de: achado de B2 · 14/09
  Desde a v9.247 a ação do companheiro carrega `bonus`/`fontes`, e **só a arena os
  narra** (a frase "pesa no golpe", no Duelo). Em Uma Vida ninguém os lê: o jogador
  sente o buff só pelo dano maior. O comentário de `buffDeCompanheiro`
  (`App.jsx:7974`) foi reescrito em B2 para dizer que isso hoje é **escolha de
  tela**, não herança — mas a escolha continua sendo da pessoa: anunciar "+N de
  dano" ali é gameplay visível, e esbarra em "o sistema não fala de si mesmo".


- [x] **a suíte da sala aposta no acaso, e às vezes perde** · **RESOLVIDO em
  v9.240 (T3)**, 14/09 — semeada com `rng(hashSemente("taverna|sala|codigo"))`
  pelo parâmetro `rnd` que já existia em `novoCodigo` e em `criarSala`:
  **500/500, sempre**. **O 480 não desceu um dígito** — o número estava certo;
  quem estava errado era a aposta. A conta (30⁶ ≈ 729 milhões, 124.750 pares,
  ~1 rodada em **5.800**) ficou escrita no comentário, com o motivo, que é lei
  da casa para asserção mexida. Duas asserções novas fecham o buraco que semear
  sozinho deixaria: a mesma semente devolve os **mesmos 500**, e `criarSala`
  repassa a costura até o fim. `teste-sala.mjs` 123 → **125**; 3 sabotagens, 3
  mordendo. Nenhum vermelho por outra causa apareceu por baixo.


- [x] **a suíte da sala ficou vermelha uma vez e não repetiu** · **RESOLVIDO em
  v9.240 (T3)**, junto com o item irmão de 14/09 — era o mesmo defeito, visto
  duas vezes com cinco dias de distância, e a conta de aniversário abaixo estava
  certa: semear bastou, e nenhuma outra causa apareceu por baixo. O texto fica
  como foi escrito, porque a investigação é o que ensina. · leve · de: orquestrador (achado de R2) · 13/09
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

- [x] **MM0 · Uma Vida é o único modo do beta** · ordem da pessoa, 28/09 · feito 29/09, v9.304
  `MODOS_DO_BETA = ["historia"]` + `modoNaPorta(id)` em `modos.js`; o menu lê a
  função. Nenhuma linha de `rapida`/`duelo` apagada; os saves ficam nos seus espaços,
  intocados (o boot só lê `taverna_save_v1`). Voltar = pôr o id na tabela.
  *Uma Noite* e *Duelo* saem do menu (`TelaMenu`, `App.jsx:~5100`). Por tabela,
  não por `if`: `MODOS_DO_BETA` em `src/modos.js`, lida pelo menu. **Sai a
  porta, não o código** — módulos, suítes e saves ficam; voltar é mudar a
  tabela. Confirmar que um save de *Uma Noite* ou *Duelo* já existente não
  quebra o menu nem se perde. A *sala de dois* (Uma Vida a dois) fica.

- [x] **MM1 · a sonda da mesa: as 157 perguntas viram régua** · feito 28/09
  **O número de partida: 66/157 chega · 1 sabe e não conta · 82 ninguém decide ·
  8 código resolve** (`testes/teste-mm1-sonda-da-mesa.mjs`, casos em
  `testes/sonda-da-mesa-casos.mjs`; `PISO_CHEGA = 66`, `TETO_SABE_E_NAO_CONTA = 1`).
  Dos 82 *ninguém decide*, 36 são cenário (sabor, aceitável) e **46 são defeito**:
  29 de mundo, 13 de regra, 3 de licença, 1 de posição. O achado que corrige a
  leitura à mão: **a distância já chega** (`grid.js#resumoGridPrompt`, no rodapé
  de cada turno de luta); o que o sistema calcula e esconde é a **cobertura**
  (`temCobertura`, caso #138) e a **linha de visão** (`linhaDeVisao`, só vira
  aviso de tela).
  As perguntas dos jogadores de C1E1 (`https://www.kryogenix.org/crsearch/html/cr1-1.html`),
  **traduzidas e parafraseadas** em casos de teste (nunca o texto original),
  cada uma com o FATO que a responde e o sítio do sistema onde ele vive.
  **Sem chamada de IA:** mede se o fato **chega à pauta** do Narrador. Três
  resultados por pergunta: *chega* · *o sistema sabe e não conta* · *ninguém
  decide* (sabor — aceitável). O número de hoje é o ponto de partida, e cada
  etapa seguinte tem de o mover. Juntar as perguntas do *Honey Heist 3*
  (`cr1-115.14`) só se acrescentarem um tipo novo.

- [x] **MM2 · o Narrador vê o tabuleiro** · feito 29/09, v9.305 · sonda 66 → 68/157,
  sabe-e-não-conta 1 → 0 (cobertura #138 e a ordem da rodada #142 passaram a chegar
  pela linha da luta, `resumoGridPrompt`; +439 chars no pior caso, só no rodapé) · *escopo corrigido pela sonda (MM1):
  distância e região já chegam por `resumoGridPrompt`; faltam cobertura e linha
  de visão, e é nelas que a etapa mexe — dentro da mesma linha, sem bloco novo*
  Em combate, uma linha na pauta com cada inimigo: **distância** (a que o motor
  já mede), **linha de visão** (`linhaDeVisao`, `grid.js`) e **cobertura**
  (`temCobertura`). Dentro do `TETO_DA_PAUTA`; se não couber tudo, corta-se
  pela prioridade, nunca se soma bloco estático. É a resposta a *"a quantos
  metros estou da criatura?"*.

- [x] **MM3 · o golpe final é seu** · Q3 + Q5, aprovadas pela pessoa em 14–15/09 · feito 29/09, v9.306
  `golpe-final.js` + `painel-golpe-final.jsx`; a escolha antes de aplicar, a cena do
  jogador na pauta (`acabou`, 240 chars) e o veto do poupado em `naoPode`. A sonda não
  se move (68/157): nenhuma das 157 era do golpe final — a frase é do Matt, não dos
  jogadores. **Falta a prova jogada do Poupar depois do conserto** (ver o diário).
  Quando o golpe **levaria** o alvo a 0: letal ou não letal (Q3), e **"como
  você faz isso?"** (Q5) — o que o jogador escrever é o que o Narrador narra,
  ampliado e nunca desmentido. É o momento mais famoso do Critical Role. O
  texto inteiro das duas está na Fase Q, abaixo.

- [x] **MM3b · o golpe final é do grupo** · decisão do coordenador da fase, 29/09 · feito 29/09, v9.313
  Quando é um companheiro a derrubar, o cartão aparece na mesma e o jogador narra como o
  companheiro o faz; uma escolha por rodada; o ☠ só sai depois da escolha. Os companheiros
  não evitam o último golpe. Falta: o golpe de oportunidade do herói (fuga, recuo) — MM3c.
  **O Poupar foi jogado** (o golpe do herói): "(poupado)", fim de luta, o Narrador não matou.

- [x] **MM4 · toda ação ganha um dado** · feito 29/09, v9.307 · sonda 68 → 69/157
  `FAMILIAS_DO_IMPROVISO` (seis famílias → atributo) e `CD_DO_IMPROVISO` (13; uma
  palavra de ousadia sobe a 15) em `desafios.js`; `lerAcao` devolve o improviso no
  ramo em que nenhum desafio casa, e o App rola-o pelo caminho de sempre. Fica
  **desligado em combate** (ver o diário): lá o dado improvisado pede três coisas
  que ainda não existem — cobrar a ação, 1d4 da arma improvisada, `disputa.js`.
  Hoje a frase que não casa com o catálogo de desafios **vira ficção sem dado**
  e o Narrador decide sozinho. O Matt nunca diz *"isso não dá"*: escolhe o
  atributo e manda rolar. Aqui: o atributo mais próximo por tabela, uma CD de
  tabela, e o resultado vai à pauta. As hipóteses e as figuras de linguagem
  continuam fora (a peneira de `agressao.js` já sabe distingui-las).

- [x] **MM5 · o sucesso com preço** · feito 29/09, v9.308 · sonda não se move (69/157)
  `FAIXAS_DA_MARGEM` (margem = total − CD: +2 limpo · 0/+1 "consegue, mas" · −1/−2 "por um
  fio, e paga" · −3 falha; 20 e 1 naturais nunca são o meio) e `desfechoDaMargem`;
  preço do meio por tabela e cobrado pelo sistema (barulho, mordida por degrau, condição,
  tempo); *A Aposta* com a terceira versão em 25 das 40 situações. Jogado: um salto
  falhado por 1 virou "a mão alcança a beira" e custou 1 de vida, narrado nas duas metades.
  *A Aposta* prepara duas versões (sim/não). O Matt usa três: na runa de C1E1,
  um 15 é *"recuas a tempo, mas levas 8"*. Passar por pouco ou falhar por
  pouco ganha a versão do meio — por tabela, com a margem que a define.

- [x] **MM6 · escondido é um estado** · feito 29/09, v9.310 · sonda 69 → 72/157
  `escondido.js` + a condição `escondido`; o furtivo pela regra do 5e com Ação Ardilosa
  (Ladino sozinho: −21% de dano sem ela, −5% com ela); "quem me vê" na linha da luta
  e em `naoPode` fora dela. Jogado fora da luta: nasce, cala o mundo, cai ao gritar.
  O teste de furtividade existe (`desafios.js`), o estado não: no turno
  seguinte nada lembra que o herói está escondido, e isso não dá vantagem.
  Condição que dura até agir ou ser achado; dá vantagem e o ataque furtivo
  (hoje o do Ladino é sempre, por classe); e vai à pauta — **quem te vê**. É a
  resposta a *"o anão está me vendo?"*.

- [x] **MM7 · os atiradores atiram** · feito 29/09, v9.312 · sonda não se move (72/157)
  `atirador.js` (a tabela saiu de `fuga.js`), `postoDoAtirador` em `grid.js`, o disparo em
  `turnoDosInimigos`, a voz da intenção do atirador; o golpe de oportunidade do herói no recuo.
  Dano ao herói −11% / +13% / −16% nos três cenários (catraca ±20%).
  Achado da fuga (v9.294): o inimigo de distância é atirador na fuga e lutador
  colado dentro da luta. Passa a manter a distância e a disparar.

- [x] **MM12 · a cidade por dentro (e o mapa das perguntas que ninguém decide)** · feito 29/09, v9.318 · sonda 72 → 81/157 · de: orquestrador, 29/09, pedido do
  coordenador da fase · *posição: depois de MM7, antes de MM8*
  **O achado:** a sonda (MM1) contou **82 *ninguém decide***; 36 são cenário (sabor,
  aceitável) e **46 são defeito** — 29 de mundo, 13 de regra, 3 de licença, 1 de posição.
  MM2 fechou uma (#142), ficam **45**. É mais do que o resto da Fase MM junto. Lidas
  uma a uma, não são 45 buracos: são
  **cinco blocos**, e três já têm órgão na fila.
  | bloco | casos | quem paga |
  |---|---|---|
  | **a gente por dentro** — passado, motivo, aparência, reputação, paradeiro | 12 | **MM8** (o elenco; escrito lá) |
  | **a cidade por dentro** — língua, preço do pouso, quem estuda magia, gíria, salvo-conduto, o sino que toca, o preço do que se dá | 9 (#6, #14, #15, #31, #37, #38, #80, #107, #110) | **esta etapa** |
  | **que teste é este?** e a licença criativa | 6 (#33, #93, #102, #76, #78, #152) | **MM4** (toda ação ganha um dado) |
  | **escondido e flanco** | 4 (#70, #74, #124, #153) | **MM6** (escondido é um estado) |
  | regras de classe e de criatura não tabeladas, objetos da cena, a biografia do herói | 9 (#48, #99, #121, #136, #137, #141, #91, #92, #114) | um a um, pelo peso — não é um órgão |
  **E 5 não são defeito:** #57, #65, #82, #97, #116 têm fato "nenhum" (convite, gesto,
  logística na ficção) — é ficção livre, como o cenário. Ao tocar a sonda, passam a
  *ninguém decide* aceitável, com o motivo escrito; o defeito real é **40** (12 + 9 + 6 + 4 + 9).
  **O que esta etapa faz:** a cidade ganha **ficha** — por semente, na criação do mundo,
  como o comércio já tem (`envelopeDoComercio`): a língua que se fala e quem não a fala,
  o preço de uma noite de pouso (por tabela, pelo porte e pela riqueza da cidade), as
  instituições (quem estuda magia, quem cura, quem guarda a lei), duas ou três gírias e
  apelidos do léxico local (`lexico.js` já existe), o costume de reconhecimento
  (salvo-conduto, senha, marca) e **o que está a acontecer hoje** (o sino, a feira, o
  luto) a partir do relógio do mundo. Vai à pauta pela secção `onde`, curta e por
  prioridade — nunca bloco estático. **Critério:** as 9 da cidade passam a *chega* e a
  sonda sobe na mesma medida. Um órgão paga 9; é o segundo maior bloco e o único sem dono.
  **Porque não antes:** MM4 fecha 6 e toca toda cena; MM6 fecha 4 e é da luta; esta
  toca toda cidade e é barata, mas assenta melhor com o elenco logo a seguir — a
  reputação de uma família (#60–#62) é da gente e não da cidade, e as duas etapas
  devem partilhar a semente.

- [x] **MM13 · o mundo puxa o herói** · da pessoa, 29/09 · feito 30/09, v9.322 · a prova longa do `jogo` no diário
  *"Quando o jogo inicia o mestre já joga uma quest logo de cara… nos RPGs do Matt, o player é
  induzido à quest da história principal… o mundo joga ele na quest. Um sistema de quests é
  necessário para o player não se perder… como um sandbox sem tutorial."* E depois: *"ele diz o
  mundo, onde o personagem está, e uma pequena história do local… conforme o mestre trabalha o
  mundo, vai induzindo o player para a quest. Não sei se deve ser logo na primeira cena."*
  **O que falha:** a casa já força a principal (`missoes.js`, `forcada: true`; a abertura força
  uma trama e pede um "primeiro fio"), mas **na tela o primeiro turno mostra ofertas do mural com
  Aceitar** — o cardápio chega antes do mundo, e a trama não se vê.
  **O desenho (os três movimentos do Matt em C1E1, conferidos no texto):**
  1. **O propósito antes da cena** — o herói chega já com a razão de estar ali (da espinha e do
     antecedente, por tabela e semente) como memória, nunca como oferta; a principal nasce aceita
     dessa razão, com **uma pista concreta** que é o primeiro passo (quem procurar, onde).
  2. **A ordem da narração:** o mundo → onde estou → a pequena história do lugar → porque estou
     aqui e o que sei. O próximo passo sai da pista, e é o jogador que o diz.
  3. **O mundo pinga fios** — a cidade (MM12) e as pessoas (MM8) vão deixando pistas ligadas à
     principal.
  4. **A escalada é o sino do Matt**: um acontecimento que obriga a enfrentar a história, quando o
     jogador já conhece o lugar ou quando se afasta dela — um relógio (`relogios.js`); por bem ou
     por mal, mas nunca no primeiro minuto. Nunca um bloqueio.
  5. **Nenhuma oferta avulsa antes de estar orientado** (o mural só depois do primeiro passo da
     principal, ou de N turnos, por tabela); as secundárias continuam opcionais.
  6. **O próximo passo sempre à vista** — uma linha no sítio que já existe; peça nova, pede-se ao
     desenho.
  **A prova:** o `jogo` começa uma campanha nova e responde, a cada um dos primeiros turnos,
  *porque estou aqui?*, *o que sei?* e *qual é o meu próximo passo?* — as três com resposta **no
  primeiro turno**, sem nenhum cartão de Aceitar; e conta em que turno chega a escalada, e se
  chegou depois de ele já ter explorado.

- [x] **MM13b · a pista tem morada** · feito 30/09, v9.323 · da prova jogada de MM13, 30/09
  *Resta, da pessoa:* os saves já partidos (léxico que chegou tarde e renomeou a planta) não se
  reparam — repará-los reescreveria o léxico gravado do jogador. *Proposta ao desenho:* o "Começar"
  esperar pela leitura do mundo. *Item à parte:* em `saga.js`, qualquer homónimo encontrado em jogo
  fecha um marco da espinha fora de ordem (`falar_com` casa pelo primeiro nome).
  A pista e o sino apontam para lugares que **não estão na planta da cidade**: "o Círculo Rachado"
  (da base do mundo) é, na planta de Monte do Norte, o "Picadeiro Central"; "a Corda Velha" do
  segundo passo não está na planta nem na fala de quem a deu. **Duas fontes de nomes para os
  mesmos lugares** (a base e a planta) — achar qual manda e fazê-las uma. Junto: "🔎 Encontrar
  Orin — O Armazém Velho" (T2) contradiz a pista e o diário (de onde vem?); e o passo "procurar
  alguém" conta um turno depois de chegar e diz "Chegar a" em vez de "Procurar".

- [x] **o sistema fala de si no descanso longo** · feito 30/09, v9.324 · da prova jogada de MM13, 30/09
  "Fio local: d20 = 16 vs 10 → acontece · Nova missão: d20 = 3 vs 13 → nada · Arco regional…" na
  tela — viola a lei "o sistema não fala de si".

- [x] **uma missão "do Mestre" antes do primeiro passo da principal** · feito em v9.339 · da prova jogada de MM13
  No T8, "Tirar Anya de lá… não se recusa", com o próprio herói como contratante ("Varek paga para
  trazer de volta") e erros de texto ("de o casarão", "Chegar a o casarão", "vivo" para Anya). O
  mural abriu no mesmo turno com o mesmo molde. Uma segunda história forçada antes de a primeira
  andar é o cardápio outra vez.

- [x] **MM8c-0 · a parte fixa do prompt emagrece ~6k** · feito 30/09, v9.325 · a pior cena solta 87 563 → 81 181
  **O que ficou:** (1) o cânone de **lugares e itens** continua sem teto — com 819 de folga, qualquer
  teto faria o Narrador esquecer artefactos e lugares antigos ("verdade imutável"): é decisão, não
  emagrecimento; (2) **as descrições que o Cronista regista nunca chegam ao Narrador** (`formatarCanone`
  só imprime tipo, papel, local, status, notas) — um artefacto sobe como "Nome — artefato, em X": é
  "sabe e não conta"; (3) **o Cronista recebe o cânone inteiro e todos os nomes** (App ~10302) — a
  fiação com teto está proposta; (4) duas contradições antigas do prompt: "semeie chefes ocultos"
  contra "não invente outros chefes", e "envie o PV de cada inimigo" contra "o PV que mandar é
  ignorado". **Folgas curtas:** 819 caracteres nos 82k; o guarda do cache a 0,9093 (sobram ~480 de
  regra fixa para descer a portas).
  Encolher o fixo, nunca subir o teto (subir é custo em todos os turnos de todos os jogadores).
  Sem perder regra: o que se repete entre blocos, o que a pauta dinâmica já diz, o que entra sem
  a cena pedir. A suíte do pior caso passa a incluir as pessoas, com a meta de caber nos 82k com a
  campanha solta (187 pessoas). Antes/depois bloco a bloco. Cortar uma regra que muda o que o
  Narrador faz já não é emagrecer: pára e diz-se qual. Os lugares e itens do cânone e o que o
  Cronista recebe entram se couberem.

- [x] **MM9 · a luta sem espada** · feito 30/09, v9.331 · prender, levar e o interrogatório com teste ficam para Q4
  Intimidar, convencer, envergonhar muda a intenção do inimigo até se render.
  Hoje a vontade da oposição só vira pela vida (`adversario.js`, as `quebra`).
  No Honey Heist o clímax resolveu-se assim.

- [x] **MM10 · o crime** · feito 30/09, v9.332 · render-se à guarda e pagar a multa ficam escritos; a legítima defesa por "quem me atacou nesta cena" também
  Atacar o taverneiro abre uma luta (`agressao.js`) e não um crime: ninguém
  chama a guarda, não há recompensa pela cabeça, a porta não fecha, as
  testemunhas não contam. Assenta no elenco: contra alguém do elenco, a
  consequência é de história; contra um figurante, é da cidade.

- [x] **MM11 · a sessão de prova** · jogada 30/09 sobre v9.332 · **veredito: ainda não** · transcrição em
  `mente/mm11-sessao.md` · 49 respostas do Mestre. A voz já é de mesa, e quando o fato chega à pauta ele
  acerta número a número; o que falta é a continuidade, e é o próprio sistema que a parte.
  **Das 12 perguntas que o mundo sabe responder: 5 certas, 2 pela metade, 4 inventadas, 1 contradita, 1 perdida.**

- [x] **H3 · a cura tem relógio** (cura por turno) · **FEITA 16/09 · v9.275 · commit `7bd9291`** · de: pessoa · 16/09
  **O espelho ficou no EFEITO, e quem decidiu foi a contagem de chamadores
  vivos:** `tickCondicoes` tem 3 e **os três estão no `App.jsx`**;
  `tickEfeitos` tem 4, e um é **`arena.js:360`**, módulo puro. Um `curaTurno`
  na condição nasceria **inerte** — o pecado que a Fase F existe para pagar.
  Um sítio contra zero: a cura pousa em PV **hoje**, com **zero linhas de
  `App.jsx`**. Ficou um **ponteiro** ao lado da documentação de `danoTurno`
  para ninguém refazer a pergunta nem criar a régua duas vezes.
  **Onde a cura entra na fila: fora dela.** A fila do dano (abafo → invocação
  → abrigo → PV temporário → PV real → a queda) corre no **meio** do turno; o
  relógio corre no **fim**, junto com o irmão que cobra o veneno. Provado:
  vida 9, veneno 2, regeneração 3, golpe 6 → 9→3, 3→1, 1→**4**; e com 3 de
  vida contra um golpe de 4, **curar antes apagaria a queda**. **O relógio
  não levanta os caídos** (guarda espelhada de `App.jsx:8350`).
  **Medido e não reequilibrado:** catraca da arena idêntica número a número, e
  a causa trancada na suíte — nenhum dos 8 prontos regenera. Viva: um duelista
  com Chamado da Chuva dá 8 prazos, 14 pousos, 27 PV devolvidos.
  **Herda-se daqui:** a fiação dos três tiques do `App.jsx` (uma linha de
  `pousarCura` em cada, dentro de `calou`), a porta `aflicaoDe` (o mesmo
  portão que F1 mediu), a cura de **grupo**, e a zona do Círculo Sagrado (H6).
  `AGUARDAM` continua **39** — as três dívidas foram **trocadas, não
  apagadas** —, e `SEM_DONO_HOJE` desceu de 6 para 4.
  **Para a pessoa:** o relógio deve levantar quem caiu? Hoje não levanta.

- [x] **H4 · a marca** (efeito preso a um alvo que soma dano) · **PRIMEIRA METADE FEITA 16/09 · v9.276 · commit `408a841`** · de: pessoa · 16/09
  **O buraco era maior do que este item dizia, e a medição o desnudou:** não
  era uma falta, era **confusão de línguas**. `danoExtra`/`danoReduzido` falam
  do dano que o portador **causa** — a prova é a descrição que o jogador lê
  (*"enfraquecido: −2 no dano causado"*), não o comentário, que mentia por
  omissão. `combate.js:127` lia `modAtk.danoExtra` do lado certo e
  `modAlvo.danoReduzido` **do lado errado**. Golpe de 10: **10** sem a Maldição
  do Patrono, **8** com ela — amaldiçoar **endurecia** o inimigo.
  **Nasceu UM campo, `danoRecebidoExtra`, e o espelho não nasceu:** *"apanhar
  menos"* já tem dois donos vivos (o abafo de F1, o abrigo de P3) na fila do
  dano; um terceiro seria a mesma regra em três cabeças com uma paga. Ponteiro
  no catálogo e asserção que **acende** se alguém o criar.
  **A marca entra PLANA e a montante de tudo:** `resolverAtaque` produz o
  número **antes** da fila (abafo → invocação → abrigo → PV temporário → PV
  real → a queda) — não é estação, é o golpe que chega mais pesado à primeira.
  Base 10 + `fortalecido` + alvo `marcado` = **14**; em crítico **26**, não 28.
  **Medido e não reequilibrado:** arena e régua idênticas número a número, as
  duas causas trancadas na suíte. Viva onde morde: +15,5 % em 600 golpes. E o
  que as réguas **não** veem, dito: `enfraquecido` chega por 6 frases do
  acervo, e o conserto **vira o sinal** — 4 pontos de troca por golpe.
  `AGUARDAM` **39 → 38** (saiu Julgamento), `SEM_DONO_HOJE` 4 → 2.

- [x] **Q3 · letal ou não letal** · de: pessoa · 14/09 · feito em MM3 (v9.306)
  Quando o golpe **levaria** o alvo a 0, o jogador escolhe antes de aplicar
  — é a lei *o veredito antes do clique* na sua forma mais pura. Não letal
  derruba desacordado, e ele acorda em **1d4 horas**. A pergunta só aparece
  quando há escolha (não em dano de área, não em morte instantânea), e
  existe uma preferência padrão para quem não quer ser perguntado toda vez.
  A forma do controle é da mesa de design; a regra é daqui.

- [x] **Q5 · o golpe final é seu** · de: pessoa · 15/09 · feito em MM3 (v9.306)
  **Ideia da pessoa (15/09), e ela é barata porque Q3 já fez o caro:** quando
  o inimigo chega a 0 e o jogador escolhe a letalidade, o sistema pergunta
  ***"como você faz isso?"*** — e o que ele escrever é o que o Narrador narra.
  A cena que ela deu como exemplo: *"vou correndo em direção a ele, deslizo
  no chão e passo no meio das pernas dele cortando as duas, e enquanto ele
  cai eu me levanto e corto a cabeça dele dizendo 'mexeu com a pessoa
  errada'"*.
  **Por que isto é maior do que parece:** é o único momento do jogo em que o
  jogador **dirige** em vez de agir — e cai exatamente onde a emoção já está
  no pico. O sistema já decidiu tudo que importa (o golpe acerta, o dano
  mata, a escolha foi feita); a prosa é livre porque **não há regra em
  disputa**. É o oposto de deixar a IA decidir o combate: aqui ela narra o
  que o código já resolveu, que é a lei da casa na sua melhor forma.
  Cuidados: **pular é um clique** (quem não quer escrever não é punido nem
  atrasado); o texto é do turno, viaja pela `pauta` dinâmica e **não soma
  bloco estático** ao prompt; e o Narrador recebe junto o que de fato
  aconteceu, para narrar a cena do jogador **sem contradizer o número** —
  se ele descreve cortar a cabeça de algo que ficou desacordado, quem manda
  é a escolha, não a frase.



- [x] **F1 · `amortece` (8)** · **FEITA 16/09 · v9.274 · commit `c1038e5`** · de: pessoa · 14/09
  **O molde está posto, e é este:** tabela irmã (`AMORTECIMENTO_DO_BUFF`,
  colada a `ABSORCAO_DO_BUFF`) + chave que **só nasce quando existe** +
  **estação na fila do dano** + seção no varredor. Zero linhas de `App.jsx`:
  `amortecerDano` já rodava em produção e já escrevia ficha e dano de volta.
  **Onde entra:** primeira estação da fila do herói (`amortecerDano` →
  `repartirDano` → abrigo → PV temporário → PV real → a queda), **sobre o golpe
  cheio** — proporção morde o número cheio, valor fixo morde o que sobrou; e
  dentro de `amortecerDano`, depois das duas metades de origem e antes da
  redução fixa, para a porta `d >= 4` da Pele de Pedra continuar a ver o número
  que vê hoje. **Medido e não reequilibrado:** régua e catraca da arena
  idênticas ao byte.
  **Três coisas que F2 herda por escrito:**
  1. **A porta, e é o maior achado:** as 8 nascem com número, mas **só 2
     atravessam a produção de hoje** (`Postura Defensiva`, `Proteção contra
     Energia`). As outras 6 não casam com `aflicaoDe`, e
     `aplicarBuffDeHabilidade` (`App.jsx:8136`) sai **antes** de `efeitoDeBuff`.
     **É `App.jsx` e pede o bastão.**
  2. **A arena, medida e não ligada:** ligar `amortecerDano` em `arena.js`
     acenderia junto os traços raciais de **3 dos 8 prontos** (Goliath,
     Tiefling, Anão) e **quebra a catraca** (muralha 46,8 → 62,5; 66,9 em "bb";
     amplitude 21,8 contra teto 20). Ligar exige tratar a Pele de Pedra antes.
  3. **O teto em 25% recusa a letra da ficção** ("metade"), porque metade
     durante turnos seria a Pele de Pedra ligada a toda a cena por 3 PM. Está
     em tabela, logo desfeito num commit se a pessoa quiser a metade literal.

- [x] **F2 · `protege` (8)** · **FEITA 16/09 · v9.278 · commit `3bac9b6`** · de: pessoa · 14/09
  **O que distingue `protege` das irmãs não é quanto, é EM QUEM** — `absorve`
  compra pontos, `amortece` proporção, e esta promete **um corpo que não é o de
  quem usou**. Quatro entradas de `AGUARDAM` já o diziam: *"a guarda sobe em
  QUEM USA"*, *"o abrigo no corpo errado"*.
  **E a máquina já existia:** `PORTADORES` tem a coluna `alvo` com
  `"aliados"` vivo e **três leitores**. Nasce o portador `amparo`, e **6 das 8**
  passam a cair no corpo certo — Muralha, Círculo Sagrado, Espírito Guardião,
  Muralha Viva, Espírito Vigia, Totem de Guarda. **Zero linhas de `App.jsx`.**
  (Armadura Sombria fica em `proprio`: promete o próprio corpo, e está certa.)
  **Quatro das seis não tinham portador nenhum por UMA LETRA:** `prote[çc]`
  casa "proteção" e **não casa "protege"**, que é o verbo que a ficha usa — a
  armadilha exata que H1 apanhou em "protetoras", de pé há versões.
  **O recorte exige duas coisas na frase** (o verbo *proteger* **e** um corpo
  declarado), e **não** as palavras de abrigo: trocar uma pela outra leva o
  recorte de 9 para 12, e as três que entrariam não protegem ninguém. As três
  estão **nomeadas em asserção**, mais um teto no varredor — é o cuidado que
  H4 comprou: a frase tem de prometer o que a família paga.
  **Mas a moeda vale zero, e isso é o achado maior da etapa** — subiu para
  "Para a pessoa decidir", no topo desta pauta, com o preço inteiro medido.
  **`AGUARDAM` fica em 38:** nada pago, **quatro dívidas trocadas e escritas**
  — uma delas estava **factualmente errada** (Elixir de Combate dizia *"é
  guarda desde a v9.53"*, e não é: `aflicaoDe` devolve `null`).
  **Herda-se:** o alvo único (`Espírito Guardião`, `Muralha` prometem **um**
  aliado adjacente; `"aliados"` é *eu + o grupo*) pede um quarto valor de
  `alvo` com leitor novo em `App.jsx:7725` e `:7825` — **bastão**.

- [x] **F3 · `intocado` (18)** · **FEITA 16/09 · v9.280 · commit `f706cf2`** · de: pessoa · 14/09
  **A colisão declarada não existia, e o veredito é este: `intocado` não é uma
  família — são TRÊS promessas debaixo de um rótulo.** 8 prometem *o golpe que
  erra* (a escada de `GUARDAS`, e é o que F3 paga), 5 prometem *imunidade a
  condição* (o catálogo de condições), 5 prometem *zona e fuga* (o lugar e o
  movimento). `estaIntocavel` responde à promessa **de prazo**, e a v9.53 já a
  respondeu — absoluta por 1 turno (8 PM), entortada por 3–4. **O que a família
  traz é o degrau de BAIXO, que a escada nunca teve: 2 e 4 PM.**
  **E a régua já estava escrita sem ninguém a ter lido:** as três esquivas da
  v9.53 obedecem, sem exceção, a `floor(PM / 2)`; as cinco de `tipo: "defesa"`
  **não** obedecem, o que a confirma (lá o preço é a CA, aqui é o prazo). Virou
  `ESCADA_DA_GUARDA`, lida de volta por duas provas. **F3 não inventou regra.**
  **5 passam a cumprir** (Esquiva Ágil, Defesa Fluida, Dança das Sombras,
  Antevisão, Corte de Espelhos); **3 já cumpriam e ninguém sabia** — o rótulo de
  P1 nasceu **por cima de mecânica viva**; **10 não passam**, com o motivo
  nomeado em asserção. **O recorte morde 5 frases e só 5** nas 593, e os quatro
  alargamentos tentadores estão medidos com as intrusas nomeadas.
  **Onde morde:** 600 golpes → **68,5 % de acerto nu contra 47,2 %** com esquiva
  de pé (−35,8 % de dano); o absoluto, **0/600**. Paridade: ~4 de dano evitado
  por 2 PM, o que `absorve` compra a 2 PM.
  **`AGUARDAM` fica em 38** — nada pago, **três dívidas trocadas**: a escada paga
  *desvantagem* e as fichas dizem *"anula"*, a mesma distância que
  `AMORTECIMENTO_DO_BUFF` mantém. O absoluto barato foi **recusado**: entregá-lo
  a 2 PM desfaria a escada pelo degrau mais barato.

- [x] **"posso atacar o guarda?" abre uma luta** · feito 29/09, v9.309 (promovido pelo
  coordenador da fase: a ênclise é a forma normal de bater em português) · de: sistema/MM4 · 29/09
  *E o avesso, visto a jogar em MM5:* "avanço para socá-lo" **não** abriu luta — o soco
  virou acidente de cena (barris, queda, salvaguarda). A `RX_AGRESSAO` tem `soco` e não
  a ênclise (`socá-lo`, `esmurrá-lo`, `chutá-lo`). Os dois lados da mesma peneira.
  `ehDeclaracaoDeAtaque("posso atacar o guarda?")` dá `true` (`agressao.js`): uma
  pergunta ao Mestre, com o guarda presente, vira agressão. A peneira do improviso
  (`NAO_E_IMPROVISO`) já barra perguntas; a da agressão não. Bug com teste que prova.

- [x] **"escondo-me" não esconde** · feito 29/09, v9.311 · de: sistema/MM6 · 29/09
  O catálogo de desafios (`desafios.js`, a furtividade) casa "me escondo" e não a ênclise
  "escondo-me" — o mesmo defeito que a peneira da agressão teve, agora no catálogo. Varrer
  os `rx` do catálogo pela ênclise dos verbos que têm pronome (esconder-se, esgueirar-se,
  agachar-se, atirar-se…), com corpus.

- [x] **o convite para o grupo não andou em 8 dias** · feito 29/09, v9.315 — **era o caso geral** · de: sistema/MM3b · 29/09
  Na prova jogada, o pedido "mais 5 dias de estrada" para aceitar alguém no grupo não se
  moveu depois de 8 dias avançados pelo painel do tempo. **Não é** o `conhecidoEm` nunca
  escrito (a mão só o procurou em `src/*.js`; o App escreve-o em ~9713, ~9722, ~9990):
  investigar o que conta como "estrada" (dias de viagem? `convivio`?) e se o painel do
  tempo o move. Se o convite nunca abre, nenhum companheiro novo entra no grupo.

- [x] **"Sussurro assombrado" inspira o bando** · feito 29/09, v9.314 · de: sistema/MM7 · 29/09
  O golpe do Necromante casa o portador `inspiracao` porque "assombrado" contém "brado";
  "sombra" dá `furtivo` a quem lança. O casamento de portadores por substring precisa de
  fronteira de palavra. Bug com teste que prova.

- [x] **os inimigos empilham na mesma casa** · feito 29/09, v9.316 (promovido: é verdade contada ao Narrador) · de: sistema/v9.314 · 29/09
  `moverInimigos` calcula a ocupação com as posições de antes do turno: quem anda depois
  não vê quem já andou. Na estrada, três soldados vão todos para (4,6). Antigo e no ar.
  Consertar muda o passo em campo aberto — medir pela sonda das paredes.

- [x] **"Golpe consagrado" abençoa o bando do monstro** · feito 29/09, v9.316 · de: sistema/v9.314 · 29/09
  Não é pedaço de palavra: o nome do golpe promete bênção e o portador `bencao` dá-a aos
  aliados de quem o lança. Nomeado em `teste-afl`. (E "silencioso" cai em `quietude` antes
  de `sombra`, pela ordem da tabela.)
  `moverInimigos` é gulosa em linha reta: na planta da taverna, o conjurador de antes
  empatava 20 rodadas com 0% de vitória. Afeta todo inimigo de perto. Caminho de verdade
  (o herói da sonda já o tem), medido pela régua.