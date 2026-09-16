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

## Aprovado pela pessoa — executa como fase, UMA etapa por ciclo

### Fase X — o botão age (o jogador dispara o próprio combate)
Decisão da pessoa (15/09): começar por aqui, antes de balancear e antes da
Fase N. **E a premissa que a levou a decidir foi corrigida no código:** o
modo rápido **já é 1×1** (`arena.js` luta com `grupo: [eu]`, o pronto nasce
com `grupo: []`) e é o único combate do projeto com equilíbrio provado
(35–65%, amplitude 12,7). O desequilíbrio de 1,4% é de **Uma Vida**. A
pessoa decidiu também que **o grupo fica** na campanha: a causa medida não
é ele.

**O achado que põe esta fase na frente de tudo** (`jogo`, jogando, em D5):
dos 20 botões do painel de Ações, os 8 que entram direto no motor são
Vasculhar, Escutar, Lembrar… e **nenhum é de combate**. `Atacar` não ataca:
ele **digita `"Ataco "` na caixa de texto**. Três ataques declarados sem
ambiguidade num combate aberto deram **zero rolagens**, e 7 turnos fecharam
com os mesmos PV 20/20, PM 6/6, XP 89/300.

> A lei da casa está invertida no pior lugar: *o Mestre é código, e a IA só
> narra* — mas **quem decide se o golpe aconteceu é a IA**.

Por isso balancear antes seria afinar um instrumento que o jogador não
consegue tocar: a régua mede o motor, e o jogador não chega nele.

- [x] **X1 · o que chega ao motor, e o que vira frase** · de: pessoa · 15/09
  · **feito 15/09 · v9.253 · commit `bf9dd49`** — medido sem mexer em nenhuma
  regra, e a régua ficou:
  `testes/acoes-do-jogador.mjs` (a tabela), `teste-` e `check-` do mesmo
  nome (a catraca) e `testes/sonda-turno-esteril.mjs` (a régua que X4
  repete). **O 7 em 7 se reproduz, e a causa não era a que a fase supunha.**

  **A conta:** 20 botões no painel — 12 `ACOES_PRONTAS` que só fazem
  `setEntrada` (`App.jsx:20564`) e 8 `ACOES_RAPIDAS` que entram no motor
  (`:20593` → `declararAcaoRapida` → `adjudicarAcao`), **nenhuma das 20 de
  combate**. Fora do painel, só **mover no grid** e **beber da bolsa**
  chegam ao motor por clique. Dos 6 literais mortos das 12, **4 são ações
  de combate** (Esquivar, Empurrar, Derrubar, Correr). `habilidades.js`
  expõe 37 funções e **zero** têm chamador por clique; **21 funções dos três
  módulos não têm um único uso no corpo do `App.jsx`** (mais 16 tabelas na
  mesma situação). Dessas 21, a tabela separa o que é dívida do que não é:
  **3** o App importa e nunca chama (`semClique`, todas de `combate.js`), 12 só
  o próprio módulo chama (`soInterno`, que é encapsulamento e não dívida) e
  **1 é morta de verdade** — `gastarRecurso` (`src/combate.js:745`), **sem
  chamador em lugar nenhum do repositório**, e ainda assim aprovada pela
  catraca, porque a linha de `import` contou como leitor.

  **O achado central, que a fase não tinha:** o botão não é a única trava,
  nem a principal. `resolverAtaqueJogador` **existe e é bom**; o golpe morre
  antes, na geometria — `posicionar` (`src/grid.js:551-576`) abre a luta a
  **12,0 m (taverna) a 25,5 m (masmorra)**, o corpo a corpo alcança **1,5
  m**, e **10/10 plantas recusam no turno 1**. Pior: `semAlcance` recusa
  **de graça** (`App.jsx:11613-11617` → `:13218-13225`), sem gastar a ação —
  logo `resolverRevide` (`:14034-14038`) nunca roda e **a rodada nunca
  vira**. O jogador ataca sete vezes, o sistema recusa sete vezes, e nada
  se move: PV 20/20, PM 6/6, XP 89/300. São **2–3 turnos só andando** antes
  que qualquer golpe corpo a corpo possa rolar.

  **Duas honestidades que a medição obriga:** (a) a recusa **não é muda** —
  o jogador recebe a linha 📏 com a distância de cada inimigo e um *"Aproxime-se
  primeiro"* (`App.jsx:11616`); o turno é estéril, não silencioso, e a diferença
  importa para X2. (b) **A armadilha é sobretudo do corpo a corpo:** arma de
  longe alcança 36 m (`App.jsx:11609`), acima de todas as aberturas. A taxa
  medida é de um herói corpo a corpo nível 3, e X4 tem de repetir a mesma
  política para comparar.

  **Conferido pelo orquestrador, direto no motor** (`montarGrade` + `posicionar`
  + `alcanca`, as 10 plantas, 1 inimigo não-ágil): abertura de **12,0 m
  (taverna) a 25,5 m (masmorra)**, e **10/10 fora do alcance de 1,5 m no turno
  1** — o achado se sustenta, número a número. E um detalhe que refina (b): a
  **36 m, 3 das 10 plantas continuam recusando** — **taverna, caverna e
  navio**, por parede no caminho. Então nem o arco resolve sozinho, e X2 **não
  pode tratar "tem alcance" como sinônimo de "pode acertar"**: quem decide é
  `alcanca`, que também olha a parede.

  **Uma armadilha de medição, para X4 não cair nela:** `montarGrade({ planta })`
  **não** monta a planta pedida — `cenarioDe(ctx)` (`src/grid.js:286`) lê outras
  chaves e cai em `estrada` em silêncio. Na primeira conferência isto trocou a
  masmorra pela estrada e encurtou a abertura de 25,5 para 16,5 m sem um aviso
  sequer. Quem medir grade tem de **conferir a largura×altura que recebeu**.
- [x] **X2 · o golpe sai do botão** · de: pessoa · 15/09 · **reescrita por X1**
  · **feito 15/09 · v9.255 · commit `fc86e53`** — o pré-requisito garantido e
  mostrado, e a porta única do motor. **`Atacar`, com a luta aberta, ataca**:
  monta a frase canônica por `fraseDoGolpe`, passa pela porta única
  `declararGolpe` (`App.jsx:11851`), o módulo puro `src/golpe.js` decide antes de
  qualquer efeito, a frase entra no log depois de aceita e o turno se cobra —
  o molde dos 8, sem um segundo molde. A extração `aplicarGolpeDoJogador`
  (`:11749`) tem **dois chamadores e nenhum terceiro**: o teclado e o botão
  resolvem pelo **mesmo** código.
  **O alcance antes do clique, conferido vivo na campanha real:** com Halvard a
  3 m e alcance de 1,5 m, o botão vem `disabled` e a linha lê **"Longe demais —
  Halvard a 3 m, faltam 1,5 m. Aproxime-se primeiro."** — o número bate com o que
  `vereditoDoGolpe` prevê em Node, casa a casa. As duas recusas são distintas:
  *longe demais* e *há parede no caminho* (andar resolve uma e não resolve a outra).
  **A catraca desceu: `TETO_SEM_MOTOR` 7 → 6**, com `pronta_atacar` fora da lista
  e as três asserções do bloco 1 invertidas, cada uma com o motivo escrito ao lado.
  **O `36` e o "+ um quadrado" saíram do meio do `App.jsx` para `ALCANCES`** — os
  mesmos números, agora em tabela que a suíte lê de volta. **Nada foi rebalanceado.**
  **As duas bifurcações foram para "Para a pessoa decidir"**, com proposta e
  porquê, e não foram decididas aqui.
  **O que X2 NÃO fez, e é honesto dizer:** não encurtou a caminhada — continuam
  **2 a 3 turnos andando** antes do primeiro golpe corpo a corpo. Ela tornou a
  caminhada **visível antes do clique**, que é outra coisa.

<details>
<summary>a redação de X2 como X1 a deixou</summary>

  A redação anterior dizia "as ações de combate passam a chamar o motor,
  e o dado rola porque o jogador clicou". **A medição corrigiu o alvo:** o
  caminho até `resolverAtaque` já existe e não precisa ser inventado — o
  que falta é **garantir o pré-requisito antes do clique**. Então X2 é:
  um controle de combate que só oferece o que é alcançável, que **mostra a
  distância e o alcance** (o veredito antes do clique, a lei inteira) e que
  chama o motor pelo molde dos 8 — id vira frase canônica, porta única com
  direito de recusar, módulo puro decide antes do efeito, o par de `pushMsgs`
  no fim, e a cobrança do turno explícita. Dois precedentes prontos dentro
  de casa, além dos 8: **mover no grid** e **a bolsa**.
  **Precisa do bastão do `App.jsx`.** A forma vem de `mente/formas.md` e da
  mesa — não se inventa botão aqui; o que falta de forma, pede-se (a Fase E
  do desenho está desenhando a tela de batalha agora). O texto livre continua
  existindo para tudo que não é golpe.
  **Duas bifurcações que X1 abriu e que são da pessoa, não do ciclo:**
  (a) **`semAlcance` é de graça** — se X2 passar a cobrar a ação de um golpe
  fora de alcance, o jogador que erra o alvo perde o turno, e isso muda o que
  ele vive; se continuar de graça, o botão tem de impedir o clique em vez de
  recusá-lo. (b) **Defender/Esquivar não existe no motor** — o botão escreve
  uma frase que ninguém lê; dar-lhe mecânica é mecânica nova, logo `pesado`.

</details>
- [x] **X3 · o turno guardado** · de: pessoa · 15/09 · **feito 15/09 · v9.257
  · dentro do commit `e430a12`** — o commit e da OUTRA mente e nao menciona
  nada disto: levou o X3 junto pelo indice compartilhado, no intervalo entre
  o `git add` e o `git commit`. O porque e o conserto estao no diario.
  **O coração da decisão, e vale sozinho mesmo que o resto não venha.** Se o
  motor chegou a rolar, o resultado **não se descarta**: fica guardado, e o
  Mestre narra quando voltar. O jogador não redigita, não re-rola, não perde
  o momento.
  **Por quê:** o defeito de hoje não é ficar sem prosa — é **a ação ser
  jogada fora**. E há uma razão mais dura: se o turno re-rola na tentativa
  seguinte, uma queda do Narrador vira **re-rolagem de um resultado ruim**.
  Guardar fecha essa porta. Determinismo por semente manda aqui: o guardado é
  o que aconteceu, não uma promessa de repetir.
  Junto vem o travar-bem que a pessoa já aprovou: a ação escrita não se
  perde, o jogo diz o que houve em voz de mundo e oferece tentar de novo, o
  motivo técnico vai **íntegro ao `console`** (foi o vazamento que permitiu
  diagnosticar as duas quedas desta sessão), e **nada fica pela metade**.
- [x] **X3b · o que a voz da casa cobre** · de: pessoa · 15/09 · **feito 16/09
  · v9.260** — retrato, nenhuma linha de produção escrita. **A medição encolheu
  a proposta, que era o resultado bom: X3c está CANCELADA (a razão abaixo).**

  **A cobertura, por tipo de evento.** Duas varreduras cruzadas: a oferta
  (`arena.js` e todo módulo puro com prosa de combate) e a demanda (o caminho
  de combate do `App.jsx`, de `declararGolpe` a `fecharSeTodosCairam`).

  | evento | a arena tem linha? | serve à campanha? | a campanha já tem? |
  |---|---|---|---|
  | 1 golpe que acerta | sim (`arena.js:255`) | **sim** | telegrama (`App.jsx:11914`) |
  | 2 golpe que erra | sim (`:293`) | **sim** | uma palavra ("errou") |
  | 3 crítico | sim (troca de palavra) | **sim** | prefixo "CRÍTICO!" |
  | 4 guarda erguida | sim (`:191`) | sim, mas **empresta** | **já usa a boa** (`habilidades.js:356`) |
  | 5 efeito que nasce | sim (`:216`) | **rala** — molde reflexivo | telegrama (`App.jsx:7978`) |
  | 6 efeito que vence | **emprestada** (`:362`) | sim, mas empresta | **já usa a mesma** (`regras-jogo.js:374`) |
  | 7 condição aplicada | **não** (zera `condicoes`, `:123`) | — | frase (`aflicoes.js:145`) |
  | 8 salvaguarda | **não** | — | parcial: a que passa fala, **a que falha é muda** |
  | 9 queda | **não** (sai do laço, `:345`) | — | herói sim, **companheiro em silêncio** |
  | 10 morte | **não** (devolve uma letra) | — | herói sim, inimigo é um `☠` |
  | 11 cura | sim (`:153`) | **rala** — reflexiva | telegrama (`App.jsx:14144`) |
  | 12 chegada de inimigo | **não** (1×1 não tem) | — | frase (`regras-jogo.js:393`) |
  | 13 reviravolta | **não** | — | virada de chefe (`masmorras.js:724`) |
  | 14 fim de luta | **não** (sem frase) | — | frase (`App.jsx:13744`) |

  **O número, e ele é o veredito.** A arena tem linha escrita em **10 dos 14**.
  Mas **molde reusável em campanha que a campanha ainda não tem: 3 de 14
  (21%)** — golpe que acerta, que erra e o crítico, que na verdade são **um
  molde só**, o do golpe. E **dos 5 que esta etapa perguntou por nome**
  (condição, queda, morte, reviravolta, chegada): **0 de 5.**

  **A razão é estrutural, e é o achado que fecha a fase.** A voz da arena não
  é uma fonte independente: dos 8 moldes que ela escreve, 2 são reflexivos
  (`se recompõe`, `firma`) e não sabem nomear um terceiro — e o caso normal da
  campanha é **grupo**; os outros 5 ela **empresta** de módulos da campanha
  (`tickEfeitos`, `expirarGuardas`, `absorverDano`, `testeConcentracao`,
  `firmarEfeito`) — e o `App.jsx` **já empurra exatamente os mesmos**. O
  empréstimo só existe onde a campanha já tinha escrito. **A cobertura da
  arena não é um retrato do que o duelo sabe: é o retrato da campanha,
  devolvido.**

  **A honestidade contrária, dita de propósito:** o golpe é o evento mais
  frequente do combate (3 a 6 por rodada), então em **volume de linhas** a
  cobertura não é 21%. Só que o golpe **já tem string no `App.jsx`** — trocar
  telegrama por frase é reescrever uma linha que existe, não é "o turno se
  completa quando o Mestre cala". É outra etapa, menor, e de forma.

  **Se o Mestre calasse hoje**, o jogador leria a contabilidade inteira e
  correta da luta, e leria frase de mesa só quando algo **muda de estado**
  (uma guarda que sobe, uma condição que pega, um efeito que se dissipa, ele
  mesmo caindo). A cena sobreviveria como extrato bancário; a luta, não.

- [x] **X3c · em combate, o turno se completa** · **CANCELADA 16/09 por X3b** ·
  de: pessoa · 15/09
  **A razão, em uma linha: a etapa se proibia de inventar prosa nova, e a
  medição diz que ela teria de inventar 11 das 14.** X3c prometia completar o
  turno *"reusando o que o Torneio e o Duelo já usam todo dia, **sem inventar
  uma linha de prosa nova**"*. O reuso disponível é de **um molde** (o do
  golpe), e ele já tem string. Nos 5 eventos que a pessoa nomeou a arena
  cobre **zero**. Cumprir a promessa seria escrever prosa nova sob o nome de
  reuso — e isso é o código fingindo ser a IA, que é o próprio limite que
  esta etapa escreveu para si.
  **A Fase X fecha em X4.** O que X3c queria de verdade não morre: virou
  itens próprios em "Aberto" (o telegrama do golpe e os quatro silêncios),
  cada um do tamanho que tem, e nenhum vestido de reuso.
  **O limite que era lei desta etapa continua valendo e não foi tocado:**
  isto valia **só em combate**; fora dele a prosa **é** o conteúdo e ali
  trava, como a pessoa decidiu.

- [x] **X4 · a conta do que mudou** · de: pessoa · 15/09 · **feito 16/09 ·
  v9.263** — medição, nenhuma linha de produção. **A FASE X FECHA AQUI.**
  *(Este bloco foi escrito por X4 e publicado dentro do commit `63e0667`, que é
  de W1 e da outra mente, pelo índice compartilhado — ver a nota no diário.)*

  **A resposta, e ela é um "não mudou" honesto.** Mesma política fixa de X1
  (estrada, 1 inimigo, herói corpo a corpo nível 3, 7 turnos declarando
  "Ataco &lt;nome&gt;", nada mais): **7/7 estéreis, 0 rolagens, 0 revides —
  idêntico a 15/09.** E tinha de ser: X2 escreveu que **não** encurtou a
  caminhada, e a régua confirma a palavra dela. O que mudou é a sessão A′:
  os mesmos 7 turnos com o clique **impedido antes de ser gasto**, a
  distância e os metros que faltam ditos na tela. **Sete turnos perdidos
  viraram sete turnos que o jogo avisou que seriam perdidos.**

  **E a honestidade que fecha o eixo do número:** a sessão B (o jogador que
  anda) dá **2 turnos andando + 5 golpes, 0% estéril, 5 rolagens** — e já dava
  em X1. Andar sempre funcionou; é geometria, não botão. **Nenhum dos dois
  números é um ganho de X2, e dizer que é seria a conta mentindo a favor.**

  **O eixo novo de X3b, medido (sessão A″):** `taxa_esteril` **7/7 = 100%** ·
  `taxa_muda` **0/7 = 0%** · `taxa_sem_narracao` **7/7 = 100%**. As duas
  primeiras são taxas **opostas na mesma sessão**, e a distância entre elas é
  **inteira de recusa**: das 14 linhas dos 7 turnos, 7 são eco do jogador, 7
  são recusa e **0 são narração de evento** — com **0 chamadas ao Narrador**
  (o `return true` de `:11871` antecede o `enviar` de `:11932`). O alerta de
  X3b estava certo e agora tem número: sem separar a recusa, a medida daria
  0% de turnos mudos onde a resposta honesta é 100% sem narração.

  **O funil, e X3b errou os dois números para menos.** `pushMsgs` é
  `App.jsx:7499` (o endereço confere). No caminho de combate são **14 funções
  e 57 chamadas** — 11 de núcleo (mudas fora da luta, por ponto fixo sobre o
  grafo de chamadas) e 3 de borda —, não 13. **Frase de mesa 36 (63,2%) ·
  telegrama 12 (21,1%) · recusa 9 (15,8%)**, e **22 das 57 nascem fora do
  React**. As recusas à parte: **18 chamadas, 25 formas, 7 famílias**, não 15
  formas — e duas famílias que a pauta não nomeava (*conjuração travada*,
  *condição que prende*). A maior é `alcance`, com 6 chamadas e 13 formas.
  Pelo precedente de X1, **a medição mandou na pauta**.

  **A régua de B1: o que ela não pode, dito em vez de inventado.** Ela **não
  tem tabuleiro** — não importa `grid.js` nem `golpe.js`, passa `grade: null`
  ao motor (`regua-combate.mjs:887`), e `grid.js:422` abre com
  `if (!g) return { ok: true }`. O herói dela golpeia toda rodada sem
  perguntar se alcança. **Logo a linha de 1,4% nunca mediu "o motor sozinho":
  ela sempre pressupôs um jogador que age todo turno.** A régua é o **limite
  otimista, e o jogo real é pior que ela, não melhor.** Medir o preço real
  exige grade dentro da régua — simulador de tabuleiro, **órgão novo, logo
  pesado, logo da pessoa**: escrito como proposta em
  `TABULEIRO_NA_REGUA.paraMedir`, **não construído**.

  **O que a régua conseguiu medir, e liga X1 a B1 pela primeira vez:** o
  **preço da caminhada**. `rodadasDeCaminhada = k` cala o herói nas primeiras
  k rodadas; `k = 0` é o default e é byte a byte. No `justo` com
  `comAdversario: false` (4 famílias × 500 = 2000 sementes por degrau):

  | k | vitória | PV do grupo | quedas |
  |---|---|---|---|
  | 0 | 51,8% ± 2,2 | 25,90 | 1,785 |
  | 1 | 39,6% ± 2,1 | 18,78 | 2,087 |
  | 2 | 29,8% ± 2,0 | 12,86 | 2,332 |
  | 3 | 22,7% ± 1,8 | 8,85 | 2,503 |

  **Uma rodada de caminhada custa ~9,7 pontos de vitória**, −5,68 PV de grupo
  e +0,24 queda. Na moeda de B2 (a escada de `CATRACA_DE_UMA_VIDA`, medida no
  mesmo molde, ~2,9 pontos por ponto de dano): **um turno andando ≈ 3,3 pontos
  de dano por golpe — quase todo o teto de +4 que aquela escada aponta.** Os
  degraus não foram escolhidos: a suíte importa `DESLOCAMENTO_PADRAO` e
  `ALCANCES` e **refaz** o "2 a 3 turnos" de X1, e fica vermelha se o passo ou
  o alcance mudarem em `src/`.

  **Não medi no jogo de hoje (Adversário ligado), e medi a razão em vez de a
  afirmar:** o `justo` está em 1,4–1,8%, **saturado no piso**, e com k ≥ 1 a
  vitória cabe dentro da própria margem (0,4 ± 0,6 · 0,0 ± 0,6 · 0,0 ± 0,6) —
  indistinguível de zero. Um limiar em cima de um piso não mede nada.

  **O contrapeso que baixa o preço, e é achado novo:** `moverPara`
  (`App.jsx:14500-14568`) **nunca chama `fecharMeuTurno`** — o próprio sítio
  escreve *"o que fecha o turno é AGIR"*, e os 4 chamadores de `fecharMeuTurno`
  (`:11929`, `:13453`, `:13543`, `:13594`) não incluem o movimento. Somado ao
  `semAlcance` de graça que X1 mediu: **enquanto o herói anda, a oposição
  também não age.** Então o preço real da caminhada está **entre zero e os 9,7
  pontos**, e 9,7 é a ponta cara. Fica `pendente`, não vira limiar.

  **Os dois achados de mecânica quebrada de X3b: X4 não os tocou**, e diz o
  que descobriu sobre cada um. O **reforço sem `x`/`y` nem iniciativa** é
  invisível para a régua **por construção** — sem grade, `alcanca` devolve
  sempre `ok`, e um combatente sem posição não tem como doer ali. A **queda de
  companheiro em silêncio** X4 **confirma por ausência**: o funil tem linha
  para a queda do herói (`:14218`) e para treze eventos de companheiro
  (`:14061`–`:14260`), e **nenhuma** para o companheiro que chega a zero. Os
  dois continuam em "Aberto", `médio`, intactos.

<details>
<summary>a redação de X4 como a pessoa a escreveu</summary>

  Quantas rolagens por turno antes e depois; quantos turnos terminam sem um
  número mudar. E a régua de B1 refeita **com o jogador agindo** — porque a
  linha de base de 1,4% mediu o motor sozinho, e o jogador que enfim dispara
  o próprio golpe é uma variável que nunca esteve na conta.
  **X1 deixou a régua pronta e a linha de base cravada**, para os dois
  números serem comparáveis: `node testes/sonda-turno-esteril.mjs`, política
  fixa (combate aberto, planta "estrada", 1 inimigo não-ágil, herói corpo a
  corpo nível 3, 7 turnos declarando "Ataco &lt;nome&gt;", nada mais),
  `taxa_esteril = turnos_sem_delta / turnos_totais`. **Hoje: 7/7 estéreis,
  0 rolagens, 0 revides.** No espaço fechado das ações: 12/42 pares estéreis
  (28,6%), 6/22 dentro do combate (27,3%). "Número que muda" está definido em
  `TURNO_ESTERIL`, e o relógio de 45 min (`App.jsx:12959`) fica de fora de
  propósito — um número que muda sempre não distingue turno que fez de turno
  que não fez.
  **X4 é agora o fecho da fase (X3c foi cancelada por X3b, 16/09), e X3b lhe
  deixou duas coisas:** (a) **o mapa do funil** — `pushMsgs` é `App.jsx:7499`
  e treze funções o chamam dentro do combate; é por elas que se conta linha
  por turno sem adivinhar; (b) **um segundo eixo que a régua não tinha** —
  além de *"quantos turnos terminam sem um número mudar"*, dá para contar
  **quantos terminam sem uma frase**, e as duas taxas não são a mesma. E uma
  correção de escopo que X3b obriga: **a voz do combate que o código já tem é,
  em boa parte, a voz de dizer não** — X3b contou **15 formas de recusa** com
  frase em português no caminho de combate (alcance, economia, teto,
  repetição, a trava do turno guardado), volume comparável ao de todas as
  frases de evento juntas. Recusa **não é** narração de evento, e X4 tem de
  contá-las à parte para não inflar o próprio número.

</details>

**A FASE X ESTÁ FECHADA** (X1 · X2 · X3 · X3b · X4; X3c cancelada por X3b).
O antes-e-depois inteiro — inclusive o que o jogador **continua** não
conseguindo fazer — está no `mente/diario.md`, no bloco de X4.

### Fase H — a porta das habilidades de classe
Decisão da pessoa (15/09): *"vamos fazer como recomendado, apenas uma porta,
mas precisamos de uma solução para as 12 restantes."*

A conta das 148 (v9.250): cumprem **56** · são só prosa **26** · **prometem e
não cumprem 66**. Dessas 66: **21** são uma linha numa tabela já aberta,
**33** são só fiação com o motor pronto, e **12** pedem mecânica nova.

O achado que reorganizou tudo: raça, dádiva, magia, poção e relíquia têm
despachante; **a habilidade de classe é a única fonte de poder do jogo sem
um**. Os motores já existem e apenas leem outra fonte — `amortecerDano` corta
dano lendo o traço racial, `removerPelaPorta` tem um chamador (a magia),
`curarAliado` tem um (a poção).

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
- [ ] **H2 · de quem já são os 12** · de: pessoa · 15/09
  **Medir antes de construir — é o mesmo erro que a pergunta das 66 quase
  cometeu.** Os 12 são sete assuntos (marca, zona persistente, cura por
  turno, clima, aura reativa, contra-conjuração, PM de volta), e a suspeita
  é que quase nenhum precisa de órgão:
  - **clima já existe** — `rolarClima`/`pesosDoClima` em `encontros.js`
    (módulo desde o primeiro ciclo da mente);
  - **cura por turno, marca e aura reativa** têm a cara do que `efeitos.js`
    já faz desde A2 — nascimento, prazo, pilha, `tickEfeitos`; marca é
    efeito preso a um alvo, aura é efeito com gatilho;
  - **PM de volta** é recurso, e recurso tem dono (`novosRecursos`,
    `gastarRecurso`).
  Sobram como candidatos a mecânica de verdade **zona persistente** (efeito
  preso ao lugar, não à pessoa) e **contra-conjuração** (reagir ao ato de
  conjurar — que encosta na Fase K, a reação com controle). Confirme ou
  derrube com leitura, diga o número final, e **não construa nada aqui**.
- [ ] **H3+ · o que sobrar vira etapa** · de: pessoa · 15/09
  Escritas ao fim de H2, uma por assunto que de fato não tiver dono. Se a
  medição mostrar que sobra pouco, a fase fecha em H2 e o resto entra como
  itens da fila automática — **fase que termina menor do que começou é bom
  sinal**, não é fracasso.

### Fase Y — os quatro verbos que faltam
Decisão da pessoa (15/09): aprovada a proposta do orquestrador, na ordem dele.
X1 mediu que dos 12 botões de `ACOES_PRONTAS` **quatro são de combate e
nenhum tem motor**; X2 os deixou de fora **de propósito**, porque ali *não
falta fiação, falta mecânica* — e enfiá-los na porta de `Atacar` seria fingir
que existem.

Ordem, e ela é do mais concreto ao mais difuso:

- [ ] **Y1 · `Empurrar` e `Derrubar`** · de: pessoa · 15/09
  Os dois mais fáceis de fazer certo: têm alvo, distância e resultado
  óbvios, e o tabuleiro já modela posição, tamanho e terreno — **empurrar é
  mover alguém que não quer**, e o campo já sabe o que é uma casa ocupada e
  uma parede. Teste oposto (Força/Atletismo contra a resistência do alvo),
  determinístico, provável em Node.
- [ ] **Y2 · `Esquivar`** · de: pessoa · 15/09
  Gastar o turno para ser mais difícil de acertar. Mecânica nova de verdade,
  e **encosta na família defensiva da Fase F** (`intocado` colide com
  `estaIntocavel`): confira antes se o que falta já não existe com outro
  nome — é o terceiro caso desta sessão em que a resposta estava na casa.
- [ ] **Y3 · `Ajudar`** · de: pessoa · 15/09
  O mais difuso: ajudar *a quê*, e o que isso concede. Desenho antes de
  código, e **se a resposta for "depende do que o outro vai fazer", isto é
  reação e mora na Fase K**, não aqui. Aposentar o botão continua sendo
  saída legítima se a mecânica não se justificar — o que não pode é
  continuar prometendo.

### Fase Z — a recalibração morre, e o recálculo nasce calado
Decisão da pessoa (15/09): *"agora que nosso sistema não é mais tocado por IA
e sim todo por código, não precisamos mais do botão e da função recalibrar
lenda e das outras formas de recalibração."* Está certo, e é a lei da casa
invertida: `recalibrarLenda` chama `chamarModelo(...)` — **pede à IA que
proponha os números do jogador**. São **três portas** (recalibrar save,
recalibrar mundo, recalibrar ascensão) e **3 das 11 chamadas de modelo** do
App; o painel de ascensão diz, com todas as letras, *"⚖ Recalibrar com a IA"*.

**A ressalva da pessoa é a lei desta fase, e ela vale mais que a remoção:**
*"desde que não mude os dados do player sem que ele saiba e principalmente
sem que seja necessário — exemplo: cada vez que o player abrir o game o
sistema recalcula e ele fica com status diferente em cada gameplay, seria
inaceitável."*

Disso saem três propriedades, e as três são prováveis:

1. **Idempotente.** Recalcular duas vezes dá o mesmo resultado. Abrir o jogo
   dez vezes não move um ponto.
2. **Silencioso quando não é preciso.** Se o save já bate com as tabelas,
   **não se escreve nada** — nem no save, nem na tela. O caso comum é o
   caso mudo.
3. **Declarado quando age.** Quando um número muda de verdade, o jogador
   **lê o que mudou e por quê**, na voz da casa. Mudança calada em ficha é
   exatamente o que a ressalva proíbe.

- [ ] **Z1 · o recálculo, e a prova de que ele não se mexe** · de: pessoa · 15/09
  Módulo puro que deriva das tabelas o que hoje se pede à IA — PV, PM,
  proficiência, nível pelo XP. **A suíte prova a idempotência antes de
  qualquer fiação**: recalcular n vezes = recalcular uma; save já correto
  sai byte a byte igual. Sem React, sem chamada.
- [ ] **Z2 · as três portas fecham** · de: pessoa · 15/09
  Os três botões e as três chamadas de modelo saem. **Precisa do bastão do
  `App.jsx`.** O recálculo entra no `garantir...` do load, com a regra 2
  valendo: o load comum não escreve nada. Medir: quantas chamadas de IA o
  App passa a ter (11 → 8) e o que isso poupa por sessão.
- [ ] **Z3 · o save antigo é avisado** · de: pessoa · 15/09
  Quando o recálculo de fato corrigir um save de versão antiga, o jogador vê
  o quê e o porquê — uma vez, não a cada abertura (o save guarda que já foi
  avisado). A forma é da mesa de design; a regra é daqui. Catraca
  permanente: **nenhum caminho muda número de ficha sem passar por aqui**.

### Fase N — a mente do combate (dos dois lados, sem IA generativa)
Decisão da pessoa (14/09), em duas levas. Primeiro o inimigo: *"uma
inteligência (não IA generativa) de combate, onde o inimigo decide por nível
de inteligência — um inimigo muito inteligente com um healer atrapalhando
vai tentar eliminar o healer primeiro; um de inteligência muito baixa
provavelmente atacaria o tank. Isso deve valer para todos os modos."*
Depois o grupo: *"os personagens precisam ter inteligência e serem
estratégicos — um healer cura a pessoa que está prestes a morrer, buffa o
dano do carry. Um personagem inteligente no grupo do player pode sugerir uma
formação ou conduzir o combate."*

**São a mesma mente, com dois consumidores — e é assim que tem de ser
construída.** Dois motores de decisão divergiriam no primeiro ajuste, e
teríamos a mesma doença que a mesa de design existe para impedir, agora no
combate. Um motor lê a mesa e decide; quem o chama é que muda.

**A DECISÃO DA PESSOA (15/09) — a tabela de intenções passa a ser por nível.**
Ela leu a medição e desenhou a saída: *"poderíamos fazer a tabela de intenções
por nível de inteligência. Um inimigo com o maior nível tem a capacidade de
pensar em focar no conjurador desde o primeiro turno, enquanto o de menor
inteligência não teria essa capacidade e provavelmente focaria no que parece
mais forte. Cada inimigo em seu nível teria seu próprio pensamento, em vez de
todos pensarem o mesmo."*

**E o diagnóstico dela corrige o meu:** o problema não é o inimigo ser
inteligente demais — é **serem todos igualmente inteligentes, e no máximo**.
A fechadura já existe e é binária: cada intenção tem um portão
`quando: (s) => s.pensa && …`, `pensa` é sim/não, `menteDaCriatura` diz sim
para **18 das 27** criaturas, e o `peso` é um ranking **global**
(`adversario.js:603`: ganha a de maior peso entre as que servem).
`calar_a_magia` pesa 17, quase todo grupo tem conjurador, quase toda criatura
pensa — logo **vence sempre, na rodada 1, em toda luta**. Não é esperteza: é
ausência de escala.

O que isso muda nas etapas abaixo:

- **`pensa` (sim/não) vira degrau.** Cada intenção declara o **nível mínimo**
  que consegue tê-la. `calar_a_magia` e `matar_o_remendo` moram no topo; ir
  no que parece mais forte, ou no que está mais perto, mora embaixo. Uma
  criatura **não enxerga** o que está acima do degrau dela — não é que
  escolha não usar: não lhe ocorre.
- **O peso deixa de ser global e passa a desempatar dentro do degrau.** Senão
  uma intenção pesada de nível baixo volta a dominar tudo, e trocamos um
  tirano por outro.
- **Mesmo nível não é mesma ação** — e isto é ganho, não contradição ao que a
  pessoa pediu. O portão `quando` lê a **situação** (quem está perto, quem
  feriu, quem está no chão, a rodada), e dois brutos em posições diferentes
  decidem diferente. Dois inimigos de níveis diferentes pensam **de tipos
  diferentes**; dois do mesmo nível pensam do mesmo tipo sobre mesas
  diferentes. É daí que sai a cena tática.
- **A fase deixa de ser "dar cabeça ao inimigo" e passa a ser "tirar a cabeça
  de quem não devia tê-la".** Nenhuma intenção nova é necessária para
  consertar o 1,4%: as 46 já existem, e 14 nunca vencem justamente porque a
  do topo sempre ganha. Distribuí-las por degrau acorda o acervo morto e
  derruba o tirano no mesmo gesto.

**O número já existe:** `intelecto` é um dos seis atributos
(`constantes.js:62` — *"Conhecimento, raciocínio, poder místico"*) e hoje só
rola teste e magia. Ele não nasce nesta fase: **ganha um segundo leitor**.
Quem não tem ficha — o inimigo — é que precisa do grau declarado.

**E esta fase absorve duas pendentes**, que não se resolvem sozinhas: *"o
herói é um passageiro no próprio combate difícil"* (hoje 65% dos golpes vão
nele **por sorteio cego**, e é o sorteio que morre aqui) e *"fazer a ofensiva
do companheiro nascer de verdade"* — B2 mediu que o piloto escolhe buff 119
vezes e o que nasce é quase sempre `Escudo da Fé`, proteção com bônus zero.
**A saída não é reabrir a tabela de bônus: é fazer quem escolhe ter cabeça.**
Só depois disso se pergunta se os números precisam mudar.

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

- [ ] **N3 · ler a mesa: o papel de cada um** · de: pessoa · 14/09
  Para mirar o curandeiro é preciso **saber que ele é curandeiro** — e saber
  por observação, não por onisciência: quem curou na frente de você é
  conhecido; quem ainda não curou, não. O mesmo para o tanque (quem
  absorveu), o carry (quem doeu) e o frágil (quem está prestes a cair).
  **Serve aos dois lados**: é o mesmo olhar que faz o inimigo achar o alvo e
  o curandeiro achar quem salvar. Memória de combate por combatente,
  determinística.

  > **CORRIGIDO POR N1 (14/09) — o princípio está certo, o ponto de partida
  > não.** A leitura de papel **já existe e é onisciente**:
  > `bandeirasDosAlvos` (`combate.js:214-225`) preenche `cura` de
  > `CURAM.includes(classe)` e `conjurador` de `perfilCombate(classe)`, da
  > **ficha**, na rodada 1, sem ninguém ter curado nada — e `calar_a_magia` é
  > eleita em **17,3%** das rodadas, `matar_o_remendo` em **13,9%**. N3 não
  > acrescenta a leitura: **troca a fonte dela**, de ficha para observação, e
  > o inimigo passa a saber **menos** do que sabe hoje. Escreva isso assim,
  > senão o alvo errado do inimigo parecerá regressão.
  > **O handicap é pequeno onde importa e grande onde não se esperava:** no
  > `justo`/`duro` a Clériga se denuncia cedo (1 457 curas nas rodadas 1–2),
  > então a memória enche na primeira ou segunda rodada; no `brando` é o
  > inverso (20 curas contra 1 380 buffs), e ali ela fica anônima quase o
  > combate inteiro.
  > **Duas das bandeiras de N3 já existem e nunca são verdadeiras:**
  > `carrega` (`ent.carregaAChave`) e `meFeriu` (`ent.feriu`)
  > (`combate.js:223,225`) **não têm produtor em `src/` inteiro** — medido,
  > `quem_carrega` e `quem_me_feriu` devolvem o retrato do sorteio cego byte
  > a byte (51,2% · 1,82 quedas · 24,19 PV). A memória desta etapa preenche
  > as duas, ou elas seguem sendo a definição de promessa vazia.
  > **"O tanque (quem absorveu)" vai ficar quase sempre vazio:** o abrigo
  > morde **0,292 vez por combate** no `justo` — em ~71% dos combates não há
  > um único evento de absorção para ler.
  > **E o desempate entrega o herói:** `maisPor` (`adversario.js:120`) usa
  > `>` estrito e a lista começa sempre pelo jogador (`combate.js:245`),
  > então empate exato vai para ele nas três prioridades que comparam número.

- [ ] **N4 · a decisão, degrau por degrau** · de: pessoa · 14/09
  O motor: papel lido (N3) × degrau (N2) × intenção existente. O bruto vai
  no que está perto e no que bate mais; o brilhante corta a cura primeiro.
  **Determinístico por semente, provável em Node, e chamado pelos dois
  lados** — `escolherAlvo` e `decidirAcaoCompanheiro` passam a consumi-lo em
  vez de cada um adivinhar do seu jeito.

  > **CORRIGIDO POR N1 (14/09), e é a correção mais pesada da fase.**
  > **(a) Não são 65%: são 60,06% (`justo`), 57,27% (`duro`) e 64,48%
  > (`brando`).** Os 65% são a taxa do sorteio **quando ele roda**, e ele
  > deixa de rodar em 7,88% a 12,43% dos golpes porque
  > `vivosAlvo` (`combate.js:267`) tira o herói caído da lista.
  > **(b) O sorteio cego não é o motor que roda no jogo — é o recuo.**
  > `App.jsx:13606` passa a prioridade da intenção a todo turno, e ela ganha
  > de `Math.random()` (`combate.js:279-286`). Quem mede 60% é a **régua**,
  > que passa `prioridade: ""` — por isso N1b vem antes desta etapa. **N4
  > não mata um sorteio: substitui um motor que já está ligado.**
  > **(c) `escolherAlvo` não adivinha** — é puro, determinístico, sem
  > `Math.random`, e recebe a prioridade pronta. Quem escolhe é
  > `intencaoDaVez`; quem decide o que o inimigo enxerga é
  > `bandeirasDosAlvos`. E **o companheiro tem duas perguntas de alvo, não
  > uma**: quem salvar entre os aliados (por fração) e em quem bater entre
  > os inimigos (menor PV absoluto, `companheiros.js:271,276`). Os dois
  > consumidores não consomem a mesma pergunta — escreva os dois pontos de
  > consumo.
  > **(d) Duas decisões que N4 tem de tomar explicitamente pelo degrau, e
  > que a redação não previa:** se o inimigo **remata quem está no chão**
  > (hoje nunca remata — e rematar é o que um degrau alto faria contra os
  > testes de morte) e se **a lista de alvos se atualiza dentro do turno**
  > (hoje é foto de `combate.js:245`, e **13,40%/18,03%** do dano cai em
  > quem já caiu). Trocar só o critério de mira deixa as duas de pé.
  > **(e) "O bruto vai no que está perto" só é decidível com grade:** sem
  > ela `perto` é `true` para todo mundo, e na régua de Uma Vida
  > `grade: null` — o critério do degrau baixo colapsa num empate.
  > **(f) O motor novo herda 14 intenções inertes** e oito campos lidos sem
  > produtor; na mesa só **8 das 46** são eleitas alguma vez.

- [ ] **N5 · o grupo com cabeça** · de: pessoa · 14/09
  O companheiro aplica o motor às **suas** escolhas: o curandeiro cura quem
  está prestes a cair (e não quem tem menos PV em absoluto); quem dá buff dá
  o **ofensivo ao carry** e o abrigo a quem vai apanhar; quem tem pouco
  `intelecto` continua fazendo o óbvio. **É aqui que a ofensiva do
  companheiro passa a nascer de verdade** — e só depois de medir isso se
  pergunta se `BUFF_DA_HABILIDADE` precisa mudar. Medir com a régua de B1, e
  a catraca da arena vigiando o outro lado.

  > **CORRIGIDO POR N1 (14/09) — três das quatro afirmações mudam.**
  > **"Cura quem está prestes a cair, e não quem tem menos PV em absoluto"
  > já é o que o código faz**, e a diferença vale **0,56%**:
  > `decidirAcaoCompanheiro` já ordena por **fração** (`companheiros.js:191`),
  > e fração e absoluto apontam a mesma pessoa em **99,44%** das 4 125 curas.
  > O absoluto está no **outro** alvo (o inimigo). Gastar a etapa nisto é
  > mover vinte e três curas em mil combates. **O que a medição acusa no
  > lugar, e é bem maior:** (i) **a curandeira não é candidata à própria
  > cura** (`combate.js:379` exclui quem decide) — **0 de 4 125** — e é a
  > companheira que menos dura; (ii) **59,68% das curas (67,27% no `duro`)
  > chegam em alguém já a 0 PV** — o gatilho `frac <= 0,35` é tarde, não é
  > mal ordenado, porque o herói vai de cheio a zero dentro de um turno;
  > (iii) **89,07% de todas as curas vão no herói**.
  > **"Dar o ofensivo ao carry" é fiação que não existe:** o buff de
  > companheiro **não tem alvo** — a ação volta sem `alvo`
  > (`companheiros.js:265`) e `aplicarBuffDeCompanheiro` firma o efeito em
  > quem conjurou ou no grupo inteiro, conforme a aflição. E **não há "quem"
  > a escolher**: dos três da régua, só a Clériga tem apoio na ficha, o
  > Engenheiro só tem guarda e o Mago não tem nada.
  > **"É aqui que a ofensiva passa a nascer" pressupõe que dar cabeça
  > basta — e não basta.** A causa é, por ordem de peso: **(1) o acervo** —
  > 7 habilidades ofensivas de apoio em **148**, e do nível 8 em diante **1
  > classe em 12** carrega uma na ficha que `garantirFichaCompanheiro` monta
  > (o corte de 6 slots, `companheiros.js:72`, tira as baratas). Isto **não
  > se resolve com cabeça: é tabela.** **(2) A janela** `rodada <= 2` com
  > portão 0,7, comida pela cura no combate duro (**1 457 curas contra 358
  > buffs** no `justo`; **1 380 buffs contra 20 curas** no `brando`, mesma
  > ficha) — teto medido de **358 ações por 1000 combates**. **(3) A
  > precedência** `guarda || abrigo || buff` e a primeira-que-casa dentro do
  > balde (o Bardo pega `Contra-Canção`, bônus **0**, em vez de `Hino de
  > Guerra`, +2). Só a (3) é cegueira de escolha.
  > **E uma advertência: a escada abrigo-antes-de-buff é decisão medida de
  > P3 (v9.233), com o motivo escrito no comentário.** Reordená-la para a
  > `Bênção` nascer é **reabrir P3**, não consertar descuido — e o `brando`
  > prova que ela não é cega (a `Bênção` salta para **28,84%** quando o
  > escudo sobrevive).
  > **"Quem tem pouco `intelecto` continua fazendo o óbvio" está CERTO** — o
  > óbvio já existe e está medido (100% dos ataques no mais fraco): o degrau
  > baixo não precisa de código, precisa de nome. Mas depende de N2 resolver
  > o `intelecto` que o companheiro não tem.
  > **E medir com a régua de B1 só vale depois de N1b.**

- [ ] **N6 · o companheiro fala, e o que ele diz é decisão** · de: pessoa · 14/09
  *"Um personagem inteligente pode sugerir uma formação ou conduzir o
  combate."* O que ele diz **sai do motor**, não da IA: o sistema decide a
  sugestão (recuar, focar aquele, segurar a linha) e o Narrador só a põe em
  palavras — é a lei da casa, *o Mestre é código e a IA só narra*. Quem fala
  e com que frequência depende do degrau e da índole; um companheiro que
  comenta todo turno é praga (`aliado.js` já avisa disso). **O teto de
  prompt é sagrado:** nada de bloco novo — viaja pela `pauta` dinâmica.
  Aqui entra a pendente *"o buff do companheiro é mudo em Uma Vida"*, e a
  pessoa respondeu-a assim (14/09): ***"estamos fazendo um jogo, então
  precisamos da gameplay"***. É a régua desta etapa: **feedback que o
  jogador não vê não foi economizado, foi perdido.** O que o grupo faz por
  ele — o buff que pesou no golpe, a cura que chegou a tempo, a formação
  sugerida — tem de ser visível na hora em que acontece, não deduzido do
  número no fim.

  > **CONFIRMADO POR N1 (14/09), com a escala que faltava.** Nada na
  > medição contradiz esta etapa, e o teto de prompt está certo. O número
  > para calibrar a frequência: o grupo produz **17,28 decisões por
  > combate** no `justo` (16,58 no `duro`, 8,49 no `brando`) contra **7,70
  > rodadas** — a tabela de frequência tem de ser construída contra as
  > **decisões**, não contra as rodadas, senão "um comentário a cada N
  > turnos" sai **2,2 vezes** mais falante do que o desenho previu.
  > **A metade que depende de N2:** a índole existe e é lida
  > (`aliado.js`, `indole.js`); o **degrau** do companheiro não existe
  > enquanto o `intelecto` dele não nascer.

- [ ] **N7 · todos os modos, e a conta do que mudou** · de: pessoa · 14/09
  Vale em Uma Vida, no Torneio e no Duelo — é o mesmo motor, e os prontos da
  arena passam a lutar com cabeça. Medir com a régua de B1 e com a catraca
  de equilíbrio: quanto o herói deixou de ser o alvo automático, quanto o
  combate ficou mais difícil, se a faixa de 35–65% se sustenta. **Se o
  combate tático deixar o jogo mais duro do que a pessoa quer, isso é
  decisão dela, não ajuste silencioso.**

  > **CORRIGIDO POR N1 (14/09).**
  > **O motor tem dois destinos diferentes por modo, não um.** No Torneio e
  > no Duelo **não há alvo para escolher**: os dois entram por `arena.js`,
  > que é **1×1** (`arena.js:321-325`), e `turnoDosInimigos` **não é chamado
  > uma única vez** fora de `App.jsx:13600`. **N4 é inerte na arena por
  > construção**; o que faz os prontos lutarem com cabeça é **N5**, que é o
  > piloto que a arena de fato usa nos dois lados.
  > **A linha de base contra a qual N7 vai medir não é 65%:** é **60,06% ·
  > 57,27% · 64,48%**, com as quatro famílias concordando.
  > **E falta o eixo que provavelmente domina o veredito:** hoje **13,40%
  > (`justo`) e 18,03% (`duro`) do dano que os inimigos rolam cai em quem já
  > está no chão** (38,15 ± 1,80 e 62,19 ± 2,16 PV por combate). Um inimigo
  > com cabeça que apenas pare de desperdiçar endurece o combate por essa
  > margem **antes** de mirar papel nenhum. N7 deve medir **esse eixo
  > separado** do eixo "quem é mirado" — senão os dois somam-se num número
  > só e a pessoa não consegue decidir sobre a dureza, que a própria etapa
  > diz ser decisão dela.
  > **E a pergunta muda de forma**, pelo que N1 mediu na reconstrução: não é
  > *"aceita o combate mais duro?"*, é *"o alvo tático já está ligado no
  > jogo e a régua não o via — quanto dele você quer manter?"*. A resposta
  > está em "Para a pessoa decidir".

### Fase Q — a queda vale para todos, e o golpe pode não matar
Decisão da pessoa (14/09): *"o sistema de quedas deve valer também para
todos os personagens do grupo e inclusive inimigos — inimigos importantes
podem fazer testes de resistência contra morte enquanto os normais morrem
direto. E podemos ter um sistema de escolha: quando o player rola o dano, o
sistema identifica se aquele ataque reduz a vida do inimigo a 0; se sim,
pergunta se o golpe é letal ou não letal. Se letal, mata; se não letal, o
inimigo fica desacordado podendo acordar em 1d4 horas."*

E a razão que ela deu, que é a do desenho da fase: *"nem sempre precisa
matar uma criatura — assim podendo desmaiá-la, depois prender e interrogar,
ou tomar o controle. Abre muitas possibilidades."*

**O que já existe:** `testeDeMorte` e `aplicarTesteMorte` (`combate.js`)
valem hoje **só para o herói**. N1 mediu que a lista de alvos é foto por
turno e que **13,4%–18% do dano inimigo cai em quem já está no chão** — o
que esta fase torna uma regra em vez de um acidente.

- [ ] **Q1 · quem cai, e quem só morre** · de: pessoa · 14/09
  Tabela: quem faz teste de morte ao chegar a 0 (herói, companheiro,
  inimigo **importante**) e quem morre direto (o comum). O critério de
  "importante" sai de campo declarado no bestiário — nunca de adivinhação
  por nome. Provado em Node, com o lixo e os limites.
- [ ] **Q2 · o companheiro cai como gente** · de: pessoa · 14/09
  O grupo passa a ter queda de verdade: estabilizar, ser estabilizado,
  morrer. Aqui encosta o achado de N1 — **59,7% da cura do companheiro
  chega em quem já está a 0 PV** — e a regra de bater em quem caiu deixa de
  ser foto velha e passa a ser decisão. Medir com a régua de B1 (depois de
  N1b consertá-la) e dizer o que muda para quem joga.
- [ ] **Q3 · letal ou não letal** · de: pessoa · 14/09
  Quando o golpe **levaria** o alvo a 0, o jogador escolhe antes de aplicar
  — é a lei *o veredito antes do clique* na sua forma mais pura. Não letal
  derruba desacordado, e ele acorda em **1d4 horas**. A pergunta só aparece
  quando há escolha (não em dano de área, não em morte instantânea), e
  existe uma preferência padrão para quem não quer ser perguntado toda vez.
  A forma do controle é da mesa de design; a regra é daqui.
- [ ] **Q4 · o desacordado é um fato do mundo** · de: pessoa · 14/09
  O que a escolha abre, e que é a razão da fase: um corpo desacordado pode
  ser **preso, interrogado, carregado, roubado, deixado, ou acordar sozinho
  e voltar**. Liga ao que já existe — o Livro de Promessas (um inimigo
  poupado é semente), a memória do gesto (`gesto.js` cobra na virada da
  postura), os propósitos de `indole.js`. **Poupar tem de ter consequência**,
  senão é só um botão a mais. O que exigir órgão novo sobe para a pessoa.

- [ ] **Q5 · o golpe final é seu** · de: pessoa · 15/09
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


### Fase V — o PV temporário
Decisão da pessoa (14/09), com as regras ditadas por ela: *"da mesma forma
da mesa: absorve o dano antes do PV real, não cura e não acumula; se você
tem +4 e usa +10, deve escolher qual vai ser, ou o sistema escolhe
automaticamente o maior."*

- [ ] **V1 · o campo e a ordem do dano** · de: pessoa · 14/09
  Campo novo na ficha; `absorverDano` consome o temporário **antes** do PV
  real. **Não cura** (ganhar temporário não muda o PV atual) e **não
  acumula**: ao receber um novo, fica **o maior dos dois** — e quando a
  escolha for do jogador, ela aparece; senão o sistema fica com o maior, que
  é a regra que a pessoa deu. Prazo próprio. Provado em Node, incluindo o
  lixo (`null`, `{}`) e o empate.
- [ ] **V2 · na mesa e na tela** · de: pessoa · 14/09
  O jogador **vê** o escudo temporário e o vê sumir — barra de vida e ficha.
  Vale para herói, companheiro e inimigo. A frase segue a linha de C2/T3:
  voz de mundo, sem nomear o mecanismo. Catraca: o temporário nunca soma ao
  PV real, nunca sobrevive ao prazo, e nunca é curado por cura.
- [ ] **V3 · quem dá temporário passa a dar** · de: pessoa · 14/09
  Com a mecânica de pé, as habilidades e magias que prometem PV temporário
  na ficha passam a cumprir — `Palavra de Coragem` entre elas. Catraca
  herdada de P1: nada promete na ficha e falha na mesa.

A ordem das aprovadas em 14/09 é **T → B → F → I**, e ela tem motivo:
T é bug vivo que atinge quem joga hoje; B é pequena e fecha a simetria que P3
deixou pela metade; F é a maior e precisa de desenho; I é órgão novo e o mais
caro. Nenhuma começa antes de a anterior fechar verde.

### Fase T — o relógio das condições, no sistema de D&D
Decisão da pessoa (14/09), com a lei ditada por ela: *"vamos usar o sistema de
D&D: cura normal apenas recupera PV mas não remove a condição; daí vêm magias,
habilidades de classe, itens e os testes de resistência para alguns venenos —
tipo, teste de salvaguarda de Constituição exigido pelo veneno no final do
turno."*

O buraco que a fase fecha: **seis** sítios escrevem condição em `pers.grupo`
(`App.jsx` 5353, 7455, 7764, 7849, 7851, 8643) e **zero** a decrementam —
`tickCondicoes` só tem dois sítios, o herói (`:8169`) e os inimigos (`:8185`).
Desde a **v9.2**: o veneno do companheiro é eterno, e a condição boa que
`buffDeCompanheiro` aplica é vantagem permanente. Nos dois sentidos.

> **CORRIGIDO POR T1 (14/09), e vale para T2 · T3 · T4:** a medição desmentiu
> metade desse parágrafo. **O veneno do companheiro não existe e nunca existiu** —
> `aplicarCondicoesDosGolpes` (`:7606`) só processa `alvoRef === "jogador"`, então
> golpe de inimigo **nunca** afligiu companheiro. As condições que chegam ao grupo
> são **sete, todas `tipo: "bom"`**; a única ruim é `amedrontado` da presença, que
> já tinha saída. E os sítios vivos são **5, não 6**: o de `:7543` é código morto
> (os dois chamadores de `aplicarCondicaoEm` passam `"você"` cravado).
> As etapas seguintes herdam esta verdade: **hoje o companheiro não tem de que ser
> curado** — o que T2/T3/T4 desenharem para ele nasce junto com a condição ruim que
> ainda não chega lá, não em cima de um buraco existente. Para o **herói** e para o
> **inimigo** o desenho da fase segue inteiro, sem uma vírgula a menos.

- [x] **T1 · o relógio alcança o grupo** · feito em v9.238 (`9ca2eb7`), 14/09
  **A etapa era pequena e fechou pequena, como C1: `src/*.js` intocado**, 41
  linhas de fiação em `App.jsx:8292–8332` (entre o tique do herói e o dos
  inimigos, em `try/catch` com `calou`) e a prova. `tickCondicoes` já servia
  como está — dar-lhe um `{ semDano: true }` só para o grupo seria API nova com
  um leitor só.
  **A pauta errava, e o erro virou o coração da etapa:** sem veneno eterno, **o
  dente inverso não é o efeito colateral — é a etapa inteira**. O relógio tira do
  grupo uma vantagem de trinta versões, e era isso o conserto.
  **Uma Vida, 1000 combates (`umavida|0..999`), instrumento de P3 validado por
  controle** (reproduz 563 quedas · 754 PV · 918 absorvido · 153 abrigos, byte a
  byte): **condições que vencem 0 → 727** no duro e **0 → 305** no brando, cada
  uma em **4,1 turnos**; companheiro-rodadas com condição **4040 → 2335 (−42%)**
  no duro e **5988 → 5601 (−6,5%)** no brando. Em mesa: quedas 560 → 563, PV
  restante 798 → 754 (−2,7%) no duro, **zero** no brando.
  **E a leitura honesta: quase não dói, e o motivo tem nome.** 94% do que estava
  de pé era `protegido`, que **não compra defesa para ninguém** (`defesaDe` não lê
  `condicoes`; defesa 11 com e 11 sem). A vantagem de trinta versões era real em
  contagem e quase inerte em efeito — virou achado em "Aberto", não conserto de
  carona.
  **O dano por turno ficou FORA, de propósito** (companheiro morrendo de veneno é
  jeito novo de perder um companheiro, e é da pessoa) **e não esconde nada**: as
  três que doem têm portador único e sempre `alvo: "alvo"` — **0 em 2000
  combates**, por simulação e por estrutura, com o zero guardado em `teste-afl.mjs`.
  **Save antigo não migra:** a instância carrega `turnos: N` cheio e nunca
  decrementou, então basta o relógio alcançá-la. Migrar seria **inventar um estado
  que o save não tem** — a marca de "condição antiga" nasceria só para ser lida uma
  vez. Lixo em `turnos` segue vivo, que é o comportamento de hoje.
  **O que o jogador lê:** `✓ Irmã Vela: Abençoado passou` — irmã exata da linha do
  inimigo, 0,73 por combate no duro. `teste-cond.mjs` 31 → **84**, `teste-afl.mjs`
  24 → **32**; **15 sabotagens, 15 mordendo** — e uma delas mordia pelo motivo
  errado (o recorte da âncora virava o App inteiro), endurecida antes de fechar.
  Ver o diário.
- [x] **T2 · a cura não limpa** · feito em v9.239 (o código em `a6a6473` por
  engano de varredura, o resto em `d064baa`), 14/09
  **A etapa foi conferência que passou — e o conserto estava na tabela, não no
  código.** Varridas **45 portas de cura** em 16 arquivos (poção, dado de vida,
  descanso curto e longo, profissão, magia de cura, milagre, Segundo Fôlego,
  relíquia `curaFracao`, companheiro que cura, Reerguer, arena/noite/duelo,
  santuário, volta da morte, vínculo, drenagem, chefe): **nenhuma porta de
  gameplay escreve em `condicoes`**. A única que limpa é o **`/curar` do console
  criativo** (`App.jsx:5449`, declarado em `godmode.js:31`) — chave do mundo,
  não cura normal; ficou de pé e **declarada** na tabela do varredor, com o
  motivo escrito.
  **O descanso ficou como está, e o código deu o motivo:** `descanso.js` — o
  módulo que calcula **toda** a metade de PV — **não tem uma linha tocando
  `condicoes`**. As duas metades já são separadas: a de PV obedece à lei
  sozinha, e a limpeza vem inteiramente da metade do **tempo**
  (`limparPorDescanso`, chamada de `regras-jogo.js:84–94`). Descanso é
  passagem de tempo, não cura — e é a única escolha que não deixa `exausto`
  (`turnos: null`, só sai com `"longo"`) sem saída nenhuma. Zero mudança no
  que o jogador vive.
  **A mentira estava no catálogo:** quatro condições declaravam
  `saiCom: ["cura"]` (`envenenado`, `sangrando`, `cego`, `enfeiticado`) e
  **ninguém lia o canal `"cura"`** — promessa morta que contradizia a lei.
  Virou **`"restauracao"`**, na tabela nova `CANAIS_DE_SAIDA`. **Renomear, não
  apagar, foi obrigatório:** `enfeiticado` só declarava esse canal, e apagá-lo
  o deixaria com `saiCom: []` — a regra implícita faria **a noite inteira
  passar a quebrar encantamento**. As quatro têm `turnos` (4/3/2/3) e seguem
  vencendo no relógio de T1: nenhuma ficou sem saída.
  **A porta do descanso foi trancada:** `limparPorDescanso` **recusa** canal
  que não seja de descanso — antes aceitava qualquer string, e
  `limparPorDescanso(c, "cura")` era o jeito mais fácil de uma cura futura
  apagar condição sem parecer que apagava. E `CONDICOES_PROMPT` dizia ao
  Narrador *"quem a tira é o relógio, o descanso **ou a cura**"* — ensinava o
  oposto da lei; hoje diz *"o relógio ou o descanso"* (**−10 chars**, teto
  intacto em 56.334).
  **Catraca permanente: `testes/check-cura-nao-limpa.mjs`** (33 asserções, no
  `npm test`): percorre o `src/` atrás de **toda** linha que sobe `vida` e
  falha se houver escrita em `condicoes` na vizinhança, com piso de alcance
  (35 portas / 8 arquivos, para não passar verde medindo lista vazia) e dente
  inverso. **7 sabotagens, 7 mordendo** — inclusive a sutil, o canal sumindo.
  `teste-cond.mjs` 84 → **102**, `teste-relicas.mjs` 98 → **103**,
  `teste-mercado.mjs` 27 → **29**; nenhuma asserção antiga movida. Ver o diário.
- [x] **T3 · a salvaguarda no fim do turno** · feito em v9.240 (`c6d290f`), 14/09
  **A etapa não era a lista de sete nomes — era o critério que os deduz.** A
  pauta pedia "cada condição declara se permite", e o risco dessa frase é virar
  lista de gosto que a suíte só prova copiando. `SALVAGUARDA_DO_FIM_DO_TURNO`
  (`condicoes.js`) nasceu no molde de `CONCENTRACAO_DA_MAGIA` com **três testes
  escritos e lidos de volta pela suíte**: (1) `turnos >= 2` — com prazo de um
  turno a chance chega no instante em que o relógio já vence, e corta `atordoado`
  e `caido`; (2) efeito **sustentado**, não ferimento — ferida aberta e fogo
  pegado são estrago em curso, e cortam `sangrando` e `queimando`; (3) só `ruim`
  — ninguém resiste à própria bênção, e corta as 8 boas de uma vez.
  **7 ganharam**, cada uma com âncora 5e na linha: `envenenado` vigor 12 (o
  exemplo da pessoa), `paralisado` vigor 14, `agarrado` forca 12, `amedrontado`
  presenca 12, `cego` vigor 12, `enfraquecido` vigor 12, `lento` vigor 12. **6
  ruins não**, com motivo por linha — `enfeiticado` porque dar-lhe saída aqui
  **apagaria em silêncio a decisão de T2** (é a única cuja única saída é
  `restauracao`). A convergência **7 + 6 + 8 = 21** é asserção.
  **A CD é herdada da `resistir.dif`, o atributo não** — o mesmo veneno não pode
  ter duas forças, uma para pegar e outra para sair; mas `resistir` usa
  `"agilidade"`/`"vontade"`, que não existem em `SALVAGUARDAS`. São **duas
  perguntas**: entrada (`aflicoes.js`) e saída. `cego` prova — não tem entrada e
  tem saída; quem CEGA é Percepção, quem DESCEGA é Vigor.
  **O efeito, por conta fechada e Monte Carlo de 60 mil (batem na 2ª casa):** as
  sete somavam **19 turnos** de prazo puro e passam a somar **12,33 (mod 0) a
  9,12 (mod +6) — corte de 35% a 52%**. `envenenado` 4t → **2,02t (−50%)** no dado
  cru, saindo antes do prazo em 83% das vezes; em PV, 8 → **4,05 (−49%)**. A faixa
  real do herói foi conferida nos oito prontos: salva de Vigor **+1 a +5**,
  mediana +3. O inimigo rola cru (`modSemFicha: 0`, com três motivos escritos); o
  companheiro fica no meio **sem ter um único atributo**, porque declara `classe`
  e a proficiência entra sozinha (Guerreiro nv5, +3).
  **A rolagem é inteiramente de `salvaguardas.js`** — nenhum d20 novo. **A frase
  nasce no módulo** e o App não monta uma sílaba (só o nome do dono):
  `🧪 O veneno afrouxa e sai do sangue — deu 20, e bastavam 12.` Nasce **só no
  sucesso** — é C2 pelo motivo inverso: lá a linha vinha só na queda para não
  virar ruído por rodada; aqui o evento é a saída. **Teto de prompt 81.927 →
  81.927 chars**, crescimento estático zero (o Mestre já recebe
  `resumoCondicoesPrompt` todo turno). **A ordem é contrato** — relógio primeiro,
  salvaguarda depois —, e a suíte roda **as duas ordens exigindo que discordem**.
  `teste-cond.mjs` 102 → **245**; **27 sabotagens, 27 mordendo** — e **duas
  nasceram verdes, as duas no teste e não na produção**: a varredura de
  `restauracao` pulava `condicoes.js` inteiro (onde o canal é declarado, e onde
  ele tem mais chance de ganhar leitor), e a peneira do `concentrado` aceitava
  qualquer `id:` na frente — ou seja, o **aplicador** passava verde. Ver o diário.
- [x] **T4 · as portas de saída declaradas** · feito em v9.241 (`79567ce`), 14/09
  **A promessa mais antiga do catálogo era a magia, e ninguém tinha ido cobrá-la.**
  Restauração Menor e Maior estão no grimório desde sempre, declaram
  `funcao: "curar_condicao"`, passam por `resolvidaPeloSistema` — e caíam no
  `return false` do fim de `usarFuncaoMagica`. Conjurá-las gastava a vez e **não
  tirava condição nenhuma**. O item e a relíquia, ao contrário, já funcionavam
  desde sempre, com o `remove`/`limpa` escrito.
  **A decisão que mais pesou foi NÃO deixar o canal mandar em tudo.** O desenho
  óbvio — quem declara `restauracao` sai por porta, quem não declara não sai —
  **apagaria seis comportamentos vivos em silêncio**: poção e relíquia removem hoje
  `atordoado`, `amedrontado`, `queimando`, `agarrado`, `lento` e `caido`, que o canal
  não declara. `PORTAS_DE_SAIDA` nasceu então com **três famílias de autoridade
  separada**: o canal é a autoridade da **magia e só dela**; a lista do frasco
  continua sendo a palavra final do frasco. `pocoes.js` e `relicas.js` intocados.
  **O alcance da magia sai de três testes, não de gosto** — declara o canal; é
  aflição e não ferimento (**o teste 2 de T3 reaproveitado**, e corta `sangrando`
  pelo mesmo motivo escrito lá); e o degrau, a Menor tira o que foi **posto** em
  você e a Maior também o que foi **tirado**. Menor: `envenenado`, `cego`,
  `paralisado`. Maior: `enfeiticado`, `exausto`, `enfraquecido` + tudo da Menor por
  `herdaDe` (divergência do 5e **declarada**: um 5º círculo que não faz o que o 2º
  faz é armadilha de ficha).
  **`paralisado` ganhou `["longo", "restauracao"]`, e o `"longo"` junto era
  obrigatório** — `saiCom` não-vazio **desliga** a regra implícita, e o canal
  sozinho lhe tiraria a noite que já tinha. É a armadilha exata que T2 mediu em
  `enfeiticado`, hoje travada por asserção. `enfraquecido` e `exausto` ganharam
  `+ "restauracao"`. A remoção é **função nova e própria**: passar a magia por
  `limparPorDescanso` seria arrombar a fechadura que T2 pôs de propósito.
  **`concentrado` foi RESOLVIDO, não perdoado:** `saiCom: ["curto", "longo"]` — no
  5e a concentração não sobrevive a um descanso, e uma hora de parada já é mais que
  o teto de uma concentração inteira. **Efeito em mesa zero, confirmado** (nada no
  `src/` nem no `App.jsx` a aplica). **A lista de perdão da catraca nasce vazia.**
  **A catraca que fecha a fase:** *toda condição tem ao menos uma saída*. **21
  condições · prazo 19 · descanso 13 · salvaguarda 7 · porta que resolve 13 · com
  mais de uma 13 · SEM SAÍDA 0.** Piso de alcance no molde do
  `check-cura-nao-limpa.mjs`, mais dois dentes que não são número (a cobertura lê o
  mesmo catálogo que o resto da suíte; a contagem de salvaguarda tem de bater com
  uma leitura independente).
  **O que o jogador lê**, sem `mostrarRolagens` e com a frase nascendo no módulo:
  `🧪 Vera: o veneno afrouxa e sai do sangue; a vista volta, embaçada primeiro.` E
  quando não há o que tirar, o sistema **recusa antes de cobrar** — molde da poção
  cheia: `✋ Restauração Menor: a mão se abre e não acha o que desfazer — os 3 PM
  ficam com você.` **Teto de prompt 56366 → 56366 chars**; `CONDICOES_PROMPT`
  **encolheu 2 chars** (dizia *"quem a tira é o relógio ou o descanso"*, já falso
  desde T3; hoje diz *"quem a tira é o sistema, nunca você"*).
  `teste-cond.mjs` 245 → **394**, `teste-ligacao.mjs` 20 → **21**; **13 sabotagens,
  13 mordendo, nenhuma nasceu verde**. Ver o diário.

  **A FASE T ESTÁ FECHADA.** A pessoa ditou a lei do 5e numa frase e o jogo hoje a
  cumpre dos quatro lados. Antes: o relógio das condições tinha **2 sítios** e não
  alcançava o grupo; quatro condições anunciavam no catálogo que a cura as tirava e
  **ninguém lia esse canal**; **nenhuma** condição tinha segunda chance no fim do
  turno; e **uma** não tinha saída nenhuma. Hoje: **3 sítios** no relógio (grupo
  incluído, e condições do grupo que vencem **0 → 727** em 1000 combates duros);
  **45 portas de cura varridas** e nenhuma de gameplay escrevendo em `condicoes`,
  com catraca permanente (`check-cura-nao-limpa.mjs`, 33 asserções); **7 das 13
  ruins** com salvaguarda deduzida por critério de três testes (as sete somavam 19
  turnos de prazo puro e passam a somar **12,33 a 9,12 — corte de 35% a 52%**);
  **4 portas declaradas por tabela** (2 vivas · 2 com `aguarda` escrito), **13 de
  21** condições saindo por porta que resolve, **13** com mais de uma saída e
  **ZERO sem nenhuma**. `teste-cond.mjs` **31 → 394**. **62 sabotagens na fase,
  todas mordendo** — e as duas que nasceram verdes estavam no teste, não na
  produção. **Teto de prompt: crescimento estático zero nas quatro versões**, e
  `CONDICOES_PROMPT` na verdade encolheu (−10 em T2, −2 em T4), porque as duas
  vezes em que ele mentia foram consertadas trocando palavra por palavra.
  **A próxima da fila aprovada é a Fase B; B1 fechou em v9.243, B1b consertou a
  régua em v9.245, e a vez é de B2.**

### Fase B — o bônus do companheiro, se for lícito e justo
Decisão da pessoa (14/09): *"se o bônus for lícito e justo não tem porque
deixarmos de lado, vamos fazer."* A condicional é a fase: **provar que é justo
faz parte do trabalho**, não é preâmbulo.

P3 deixou a simetria pela metade — o buff do companheiro nasce com `bonus: N`,
a metade defensiva vale (`absorverDano` a lê) e a ofensiva não, porque
`combate.js` **não contém a palavra `efeitos`** em linha nenhuma. Fechar isso
faz o dano do grupo crescer em Uma Vida **sem teto medido**: a catraca de
equilíbrio só existe para a arena.

- [x] **B1 · a régua que falta** · feito em v9.243 (`322dee7`), 14/09
  A régua existe e é permanente: `testes/regua-combate.mjs` (o instrumento) e
  `testes/teste-regua.mjs` (a catraca, 115 asserções). **Zero linha de `src/`
  mudou** — B1 não somou um ponto de dano. O molde de P3/T1 foi reconstruído a
  partir do `App.jsx` de hoje e bate nos dois números que T1 deixou escritos
  (1ª queda **4,41** contra 4,41; quedas **545** contra 566→563).
  **Nasceu um terceiro cenário, e é o que importa:** `duro` e `brando` estão
  saturados nas pontas (no duro caem 2,81 dos 3 e sobram 3 PV de 132; no brando
  ninguém cai nunca e sobram 94%) — mudança que passa nos dois extremos não
  prova nada. **`justo`** (4 elites nv6) põe a mesa em **49,8% de vitória, 1,82
  quedas e 19% de PV**, com folga nos dois sentidos.
  **Estável, não sortuda:** N = 1000 × 4 famílias independentes, que concordam
  nas treze métricas; a N = 2000 `danoSofrido` passa a discordar — a precisão
  ficou mais fina que a distância entre famílias, e 1000 é o maior N em que a
  régua ainda concorda consigo mesma.
  **Virou catraca**, com três dentes no `justo`: faixa de vitória **35–65%** (a
  mesma lei da arena, lida de `teste-arena.mjs` como texto), teto de PV do grupo
  **≤ 35** e piso de quedas **≥ 1,2** — folga mínima **3,70 margens**, e a folga
  ela mesma é asserção (`> 2 margens`), para a régua avisar que ficou não-confiável
  *antes* de ficar vermelha. **Quatro sabotagens, três mordendo e um controle
  verde** (4 elites nv7 → 34,2%; 3 elites nv9 → 76,2%; grupo nv7 → 90,2%).
  **O que B2 vai querer:** cada ponto de dano por golpe do grupo vale **~3,5
  pontos de vitória**, e a catraca fica vermelha por volta de **+4/+5**.
- [x] **B1b · a régua se corrige antes de medir** · feito em v9.245 (`2a818f9`), 14/09
  Nasceu de olhar a divergência que B1 mandou olhar — e o veredito é que **ela
  não existia**: a contagem de abrigos depende de dois parâmetros que o diário
  de P3/T1 nunca registrou (o kit do herói, 66 → **33** abrigos sozinho; e a
  ordem do grupo na rodada, que reproduz o "954/159" de P3 **com o molde que o
  App contradiz**), e esta régua ainda é mais nova que P3 (compõe C2b e C3, que
  derrubam abrigo). O cabeçalho que acusava a divergência foi reescrito com os
  números que a desmontam. **Mas o olhar achou um defeito de verdade ao lado:**
  a régua rolava o teste de morte do herói **antes** do turno do grupo, e o App
  faz o contrário (`App.jsx:13591` → `:13830` → `resolverQueda` em `:13940`). Não
  é cosmético — `decidirAcaoCompanheiro` lê a ficha que o teste de morte acabou
  de mexer, e a Clériga curava a pessoa errada. Retrato do `justo` depois do
  conserto: vitória **49,8 → 52,1%**, quedas 1,822 → **1,790**, PV do grupo
  24,98 → **25,88**, 1ª queda **4,30** (igual). `src/` intocado, `App.jsx` só
  lido. **Sabotagem 1 subiu de nv7 para nv8** (a de nv7 parou de morder — 36,4%
  contra o piso de 35%); o piso não se moveu, e a resolução perdida (dois níveis,
  não um) está escrita. Folga mínima **3,45 margens**, não comprada de volta.
- [x] **B2 · a simetria fechada** · feito em v9.247 (`c14532b`), 14/09 — **e a Fase B fecha aqui**
  `turnoDosCompanheiros` aprende a ler `efeitos`, e o bônus ofensivo passa a
  somar como o defensivo já soma. **A régua decide**: se o grupo ficar forte
  demais, o trabalho da etapa é ajustar a tabela até ficar justo — e o diário
  registra o número antes e depois. Se não der para ficar justo sem mexer em
  lei, a etapa devolve à pessoa em vez de forçar.
  **A régua está consertada e a mesa está posta** (B1b, v9.245). (a) A linha de
  base a bater: vitória **52,1%**, quedas **1,790**, PV do grupo **25,88**, 1ª
  queda **4,300**. (b) A escada re-medida: +1 → 55,1% · +2 → 58,4% · +3 → 61,3%
  · +4 → 64,0% · +5 → **66,6%, vermelho nos dois tetos**. Cada ponto de dano por
  golpe vale **~2,9** pontos de vitória, e o teto de PV do grupo continua sendo o
  dente mais sensível (+1 já sai da margem) enquanto a vitória é o mais estável.
  (c) **A divergência da absorção foi resolvida e não atrapalha mais**: a absorção
  inteira vale 3,6 pontos de vitória, e dobrá-la custa 1,2 — menos de uma margem.

  **O VEREDITO (v9.247):** é lícito, é justo, e **o preço medido é zero** — as
  quatro métricas do `justo` saíram idênticas ao dígito (52,10% · 1,790 · 25,88 ·
  4,300), nas quatro famílias, com a folga de 3,45 margens intacta.
  `BUFF_DA_HABILIDADE` **não precisou de ajuste**. `turnoDosCompanheiros` soma em
  `danoBase` antes do dado (a convenção do herói: dobra no crítico), e a
  compensação externa de `arena.js` saiu no mesmo commit — sem isso a arena
  contaria **duas vezes**. Arena: amplitude 11,9 → 11,8, margem mais fina 40,2 →
  40,1%, `teste-arena.mjs` 99 → 106 ok. **12 sabotagens, 12 mordendo.** O órgão
  morde isolado (+3,015 de dano médio por golpe, contra 2,857 se não dobrasse no
  crítico), e o abrigo não vira espada (11,566, byte a byte).
  **Por que o zero:** o gargalo não era este — é o nascimento do buff, e ele virou
  item novo em "Aberto".

### Fase F — as quatro famílias que ainda prometem
Decisão da pessoa (14/09): *"todas devem cumprir o que prometem."*

P1 criou cinco famílias em `APLICACAO_DO_BUFF`; P3 deu número e leitor a uma
(`absorve`). Seguem com força zero: `intocado` (18 habilidades), `amortece`
(8), `protege` (8) e `nao_cai` (5) — **39 que prometem na ficha e não cumprem
na mesa**. E está medido em P2 que o piloto **não pode** procurá-las enquanto
forem inertes (mandá-lo gastar turno em promessa vazia derrubou a catraca:
`sombra` 60,2 → 32,9).

Uma família por etapa, nesta ordem — o caminho pronto primeiro, o que colide
por último:

- [ ] **F1 · `amortece` (8)** · de: pessoa · 14/09
  Tem o caminho pronto: `amortecerDano` já corta pela metade. É a etapa que
  estabelece o molde das outras três.
- [ ] **F2 · `protege` (8)** · de: pessoa · 14/09
- [ ] **F3 · `intocado` (18)** · de: pessoa · 14/09
  **Colide com `estaIntocavel`** (a guarda de um turno da v9.53, que erra
  antes do dado). Desenho antes de código: o que é intocável por um turno e o
  que é "intocado" continuado não podem ser a mesma coisa, ou o combate acaba.
- [ ] **F4 · `nao_cai` (5)** · de: pessoa · 14/09
  **Colide com o teste de morte.** Desenho antes de código, e o cuidado é o
  mesmo: uma promessa de não cair, cumprida errado, tira a morte do jogo.

Em todas: catraca herdada pronta (`check-protecao.mjs` + a catraca de
equilíbrio), e o piloto só passa a procurar a família **depois** de ela
cumprir — a ordem que P2 provou em número.

### Fase I — o inimigo conjurador
Decisão da pessoa (14/09): *"aprovado, pode criar o órgão novo."*

C2c foi medido por C2 e não é etapa, é órgão: ficha de inimigo **sem magia**,
**zero** sítios escrevendo `efeitos` no inimigo, o relógio dos efeitos não o
alcança, e dez sítios de dano sem porta única. Hoje o inimigo não conjura, não
mantém concentração e não perde magia.

- [ ] **I1 · o desenho antes do código** · de: pessoa · 14/09
  Antes de escrever, responder por escrito na pauta (e trazer à pessoa se
  esbarrar em lei): o inimigo ganha magia por bestiário ou por arquétipo? A
  porta de dano única que falta é refatoração ou órgão? O que o Narrador
  precisa saber por turno, e cabe na `pauta` dinâmica sem tocar o teto de
  82k? Uma fase que começa desenhando é o que P3 e F3/F4 ensinaram.
- [ ] **I2+ · as etapas que o desenho pedir** · de: pessoa · 14/09
  Escritas ao fim de I1, com o mesmo rigor das outras fases: módulo puro,
  fiação defensiva, suíte, catraca, medição em número.

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
  **Acrescentado por C2 (14/09):** a frase da troca tem endereço pronto e molde
  provado — `testeConcentracao.linha` acabou de mostrar que texto com número
  nasce no módulo, em voz de mundo, e o App só empurra. A linha da magia que cede
  lugar é irmã dela, não invenção nova.
  **Acrescentado por C2b (14/09), e é um caso a mais, não outro item:** agora que
  `efeitoDeBuff` pergunta ao catálogo, o **herói** pode segurar um buff de
  habilidade *e* uma magia de duração concentrando ao mesmo tempo — e
  `efeitoEmConcentracao` devolve o **primeiro** que encontra, então uma batida
  pode derrubar a errada. É a mesma doença que C3 já descreve (`empilhar` só
  substitui por nome igual), agora com dois nascimentos alimentando-a em vez de
  um. O teto `quantasAoMesmoTempo: 1` em `CONCENTRACAO_DA_MAGIA` cobre os dois.
  **E o companheiro entra junto:** ele também passa a poder segurar duas.

</details>

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

  **Corrigido em 14/09 (T1):** havia, sim — a pessoa respondeu as quatro pesadas
  no mesmo dia e a fila aprovada virou **T → B → F → I**, escrita acima. A próxima
  etapa é a **T3 · a salvaguarda no fim do turno**; T2 fechou em v9.239.

## Aberto (leve / médio — o ciclo pega daqui, o de maior valor primeiro)

- [ ] **o que o gesto de W1 pede ao motor — e o primeiro é o maior número da
  fase inteira** · médio · de: regente/jogo/desenho · 16/09 (W1)
  *Pedido pela pauta do sistema em vez de escrito por nós: são portas, tabelas e
  frases de regra, e regra não é do desenho.* **Não repete o pedido de E2 logo
  abaixo** (`casaDoEndereco`, `vereditoDoPasso`, `passo-no-campo`): aquele
  continua de pé e W1 desenhou **supondo que ele existe**. O que segue é o que o
  **gesto** precisa e que aquele não cobre. A conta inteira está em
  `mente/w1-jogo.md` §5 e `mente/w1-desenho.md` §8.

  1. **`esperar` — passar a vez sem chamar o Mestre. É o item mais barato desta
     lista e o que mais paga.** Não há botão de passar a vez (`App.jsx:3133`,
     desde a v9.13), e `fecharMeuTurno` (`:14302`) já faz tudo o que é preciso:
     `resolverRevide` empurra as linhas de sistema e devolve um `resumo`. **Falta
     um chamador que não faça `enviar` e acumule o `resumo` em `notaRef`**, para
     viajar colado à próxima ação de verdade — **o padrão já existe neste
     arquivo, palavra por palavra: é o que `moverPara` faz (`:14568`)**.
     **O número, corrido em Node sobre `PLANTAS` × `posicionar`:** a abertura é
     de **19,95 m em média**, **10 de 10 plantas** recusam o corpo a corpo no
     turno 1, e **1,4 rodadas por luta são só caminhada**. Hoje cada uma delas
     custa **~20 toques de teclado e uma chamada ao Mestre para não fazer nada**.
     Com `esperar`, a abertura de toda luta corpo a corpo passa de **~22 toques
     e 1 chamada para 2 toques e 0 chamadas**. São **−1,4 chamadas por luta** —
     quota devolvida ao Narrador **uma etapa antes de W2**, que é a etapa que a
     promete.
  2. **`declararGolpe(alvo, motivo)`** — hoje ele ignora `entrada` e o painel
     limpa-a (`:20929`): ou o jogador escreve tudo (e o motor pode não pegar) ou
     toca o botão (e **a frase é deitada fora**). O que ele escreveu tem de
     viajar como `motivo`, exatamente como `declararAcaoRapida(id, motivo)` já
     faz com os oito de baixo e como `fraseDaAcaoRapida` (`desafios.js:638`) já
     sabe colar. **É o que faz W1 e W2 caberem na mesma tela sem se pisarem, e
     custa zero caracteres novos no prompt** — a ação declarada já viaja em
     `enviar(...)` (`:11932`).
  3. **`LINHAS_DO_GOLPE`, com as colunas `larga` e `curta` e a catraca dos 54
     caracteres** — irmã de `RECUSAS_DO_PASSO`, pedida por E2, e pela mesma
     razão. **E ela abre com um defeito vivo, medido hoje, em produção, pelos
     dois seniores em separado e com números que batem:** `recusaDoGolpe`
     (`App.jsx:1126-1131`) mede **65 caracteres com o nome mais curto da mesa e
     77 com um nome de mundo**, contra os **53–54 úteis** que E2 instalou. **É a
     frase que mais aparece no jogo inteiro** — 10 de 10 plantas recusam no turno
     1 —, e hoje ela quebra a linha e empurra o painel **12 px**. *Duas medições
     independentes que batem valem mais do que qualquer das duas sozinha.*
     **O truncamento é do lado da tabela, nunca da tela, e apara só o nome:** uma
     frase já aparada é uma frase; uma frase aparada por CSS é uma frase partida.
  4. **`alvosDoVerbo(verbo, estado)` → `{ casas, criaturas }`** e
     **`vereditoDoVerbo(verbo, alvo)` → `{ curta ≤ 54, custoM, penalidade, razao }`.**
     Sem o primeiro não há conjunto armado para acender, e **o conjunto armado é
     o que substitui o `hover` no telefone** — é a peça central do desenho, não
     um enfeite. A `curta` é lida **duas vezes**, pela linha do veredito e pelo
     `aria-label` da casa: é a lei de E2, e é o que faz o ouvido e o olho
     receberem a mesma frase.
  5. **`ondeOGolpeAlcanca(caminho, alvo, alcanceM)`** — a saída da recusa, uma
     varredura sobre o caminho de ≤12 quadrados. Hoje a recusa diz *por quê* e
     não diz *daqui a quanto*: a distância resolve-se andando e a parede não, e
     só uma delas tem resposta que caiba numa linha.
  6. **`perdeM` no veredito** (o que a rodada perde ao gastar a ação) e **a
     memória do alvo a sobreviver à rodada** (`ultimoAlvoRef`), que é o que faz
     o arqueiro pagar 1 toque onde a regra do alvo único não chega.

  **E três coisas que parecem deste pedido e NÃO são — são nossas, e W3 paga-as
  em `grade-de-batalha.jsx`**, ditas aqui para ninguém as fazer duas vezes:
  `pointerEvents: "none"` nas fichas (`:648`) e a casa ocupada fora de `podeIr`
  (`:401`) — que juntos são a razão de **hoje ser impossível tocar num inimigo** —,
  `onMouseEnter` → `onPointerMove` (`:759`), e o violeta da mira a 74 % (`:611`).

- [ ] **a segunda porta do tabuleiro: "vou até K14" não chega ao motor (E2)** · médio ·
  de: regente/jogo · 15/09
  *Pedido pela pauta do sistema em vez de escrito por mim: a conversão
  endereço↔coordenada é **regra**, e regra não é do desenho.* **E2 fechou hoje
  a metade visível** — o tabuleiro tem régua nas duas bordas, toda casa tem
  endereço no nome acessível, e o jogador já lê `K14` sem tocar em nada. **A
  outra metade não existe, e sem ela o endereço é decorativo.**
  **O achado que abre o item, e ele é maior do que parecia:** não há porta do
  tabuleiro em `turno.js` — **17 portas, nenhuma delas do campo**. Hoje
  `vou até K14` numa luta casa `querPartir` e cai na porta `destino` (`:238`)
  que, ao contrário de `agressao` e `oraculo`, **não tem guarda `!emCombate`**:
  vai ao resolvedor de *cidades do mapa-múndi*, escreve
  `[DESTINO NÃO RECONHECIDO]` e entrega à IA. **Ninguém anda**, e gasta-se uma
  chamada ao Mestre para não andar.
  **A lista, cirúrgica, e a conta inteira está em `mente/e2-jogo.md` §6:**
  1. **`enderecoDaCasa(x, y)` e `casaDoEndereco(texto, grade)`** em
     `coordenadas.js`, **extraídas de `gradeDe` (`:157`), que já faz esta mesma
     composição** — logo nascem sem uma letra nova de gramática. A segunda
     devolve `{x, y, endereco, inicio, fim, cresce}` e recusa fora da planta;
     aceita `k14` e `K 14`. **`grade-de-batalha.jsx` tem hoje a composição
     numa linha só, comentada com o nome destas duas: no dia em que nascerem,
     aquela linha morre e passa a importá-las.**
  2. **`vereditoDoPasso({...})`** — irmão de `vereditoDoGolpe`, **que nunca move
     nada**: devolve `motivo` (id de tabela), `quem` (hoje deitado fora em
     `grid.js:479`), `custa`, e **`ateOnde`** — o último quadrado *do caminho*
     que cabe no orçamento, que **não existe hoje** e é o único item que muda
     um algoritmo.
  3. **`RECUSAS_DO_PASSO`**, com as colunas `larga` e `curta`, e a catraca dos
     **54 caracteres** (medida: mono 10 px anda 6,0 px/caractere, a linha do
     veredito tem 344 px úteis). **A `curta` serve dois canais** — a linha sob
     o campo **e**, palavra por palavra, o último campo do nome acessível da
     casa, que hoje tem uma frase provisória com a dívida escrita ao lado.
  4. **A porta `passo-no-campo`** em `turno.js`, antes de `desafio`/`destino`,
     com `seRecusar: "seguinte"` — a prosa continua a viajar. E a **guarda
     `!emCombate` em `destino`**, que falta e é defeito de hoje.
  5. **O log escreve o endereço de volta** (`você avança até K14`). **Não é
     string em falta: é instrução contrária** — `App.jsx:14568` manda ao Mestre
     *"não cite metros nem quadrados"*. A nota muda de lado, com **zero
     caracteres novos no prompt**.
  **Por que vale, em uma frase:** hoje o botão avisa o alcance e a frase
  digitada não avisa nada — **a mesma ação com duas portas, e só uma delas
  tem trava**, que é exatamente o defeito que X2 provou custar caro. E um
  defeito a nu que o `jogo` encontrou de passagem: `livrePara` dá **a mesma
  frase** a uma parede e a um amigo.

- [ ] **três achados do motor da reação, vindos da mesa de design (K1)** · médio ·
  de: regente/jogo/desenho · 15/09
  *Pedidos pela pauta do sistema em vez de escritos por mim: regra de jogo não é
  do desenho.* Os três apareceram ao desenhar a janela da reação (Fase K), e o
  **primeiro é pré-requisito** — sem ele K2 não tem catraca possível.
  1. **`reacoes.js:96` sorteia com `Math.random()`, e sorteia no sítio errado.** A
     lei da casa é **determinismo por semente**, e a escolha da reação não a cumpre
     — isto já estava registado em `formas.md` desde D4. **O que K1 acrescenta é
     que a Fase K torna o defeito visível:** com a janela, o mesmo golpe com a
     mesma semente pode oferecer **listas diferentes**. E há um segundo problema
     por baixo: hoje a `chance` decide se a reação é **sequer oferecida**, não se
     ela **dá certo** — escolhida, `corta` aplica-se sem rolar nada. Sob escolha
     manual, ou a chance passa a rolar **na resolução**, ou as palavras do risco
     que a peça mostra (`PALAVRAS_DA_CHANCE`) não descrevem coisa nenhuma.
  2. **O `oportunidade` automático consome a reação da rodada?** Ninguém sabe, e a
     resposta muda o desenho: se consome, há uma forma melhor à espera — *o
     silêncio numa rodada guarda a reação para o golpe livre* —, e **recusar uma
     pergunta passa a comprar alguma coisa** em vez de só não custar.
  3. **`resolverReacao` (`reacoes.js:115`) mete `reacao.icone` — um emoji — dentro
     da frase.** Ele não sai na mono da casa e **não herda a variável de cor**, que
     é a primeira lei da casa aplicada ao visual. Os três glifos que faltavam já
     foram fabricados em K1 (`61:2`, `61:4`, `61:6`); falta o texto deixar de os
     duplicar em emoji.

- [ ] **o reforço entra na luta sem lugar no tabuleiro** · médio · de: frontend (X3b) · 16/09
  **Achado de medição, e é mecânica quebrada, não prosa.** Quando o Mestre
  manda `combate_iniciar` com a luta **já aberta** (`regras-jogo.js:386-393`),
  ou quando a virada de chefe solta capangas (`App.jsx:17950`), o inimigo novo
  é acrescentado à lista e ganha a frase *"⚔ Ogro entra no combate! (34 PV)"*
  — mas **nasce sem `x`/`y`, sem iniciativa e fora do selo do encontro**. A
  causa: a conferência de orçamento só roda com `!combateRef.current`
  (`:8928`) e `abrirCombate` só com `houveIniciar && !combateRef.current.ordem`
  (`:9007`) — com a luta aberta já há `ordem`, então `montarGrid` não roda de
  novo. Depois disso `alcanca(grade, …)` e `moverInimigos` recebem um
  combatente sem posição. Serve a lei do determinismo e a da grade.
- [ ] **a queda e a morte de companheiro são silêncio absoluto** · médio · de: frontend (X3b) · 16/09
  O companheiro que chega a 0 PV: `App.jsx:13967` baixa o PV com
  `Math.max(0, …)` e **não empurra uma linha, nem uma nota ao Narrador**. O
  herói que cai tem quatro frases boas (`:8203`, `:8204`, `:8206`, `:8213`) e
  três recusas de cair; o aliado ao lado dele cai sem ninguém dizer. É o
  bolsão mudo mais visível que X3b encontrou, e o único dos quatro que a
  arena 1×1 **não teria como ter aprendido** — num duelo não há terceiro.
- [ ] **a salvaguarda de fim de turno que FALHA é muda, e a linha já está calculada** · leve · de: frontend (X3b) · 16/09
  `tentarSaidaNoFimDoTurno` roda todo turno em três portadores (herói `:8414`,
  grupo `:8488`, inimigo `:8528`). Quando **passa**, fala bonito
  (`condicoes.js:541` — *"— deu 15, e bastavam 12."*). Quando **falha**, nada.
  E o desperdício é literal: `condicoes.js:576` já **calcula** `linhasTecnicas`
  com a rolagem inteira e **ninguém as consome** — o App empurra só
  `saida.linhas`. Um evento por turno, por portador, que não existe em lugar
  nenhum da cena.
- [ ] **a virada de chefe nunca dispara para um herói de arma** · leve · de: frontend (X3b) · 16/09
  `virarChefeSePreciso` (`App.jsx:17932`) é chamada **apenas** de
  `resolverHabilidadeOfensiva` (`:12023`, `:12354`). `aplicarGolpeDoJogador`,
  o turno dos companheiros e o dos inimigos não a chamam — então quem luta de
  espada pode levar o chefe de 100% a 0% sem **nunca** ver a frase de virada
  (`masmorras.js:724`). A reviravolta de combate melhor escrita da casa, e
  metade das fichas não a alcança.
- [ ] **`ultimoDano` é escrito em nove sítios e não tem um único leitor** · leve · de: frontend (X3b) · 16/09
  `App.jsx:11893`, `:12125`, `:12201`, `:12216`, `:12252`, `:13950`, `:14123`,
  `:14133` e `habilidades.js:285` gravam; **nada lê**. Não existe "−9"
  flutuante na tela. É a lei *"export morto mente"* aplicada a campo de
  estado: ou nasce o leitor, ou saem as nove escritas.
- [ ] **a arena descarta a linha boa da guarda e escreve outra por cima** · leve · de: backend (X3b) · 16/09
  `erguerGuarda` (`habilidades.js:356`) já devolve a frase completa, com
  conceito, efeito e prazo — e o `App.jsx` a usa (`:7861`). `arena.js:184-191`
  chama a mesma função, **joga `g.linha` fora** e compõe outra medindo
  `defesaDe` antes e depois. São duas frases para o mesmo evento, e elas vão
  divergir no dia em que uma das duas for mexida. A razão original era
  honesta (as guardas de esquiva e de intocável somam zero, e escrever `+0`
  mentiria um número) — mas isso se resolve na frase do módulo, não com um
  segundo molde.
- [ ] **a condição tem prosa de saída e não tem prosa de entrada** · leve · de: backend (X3b) · 16/09
  A casa escreveu melhor o alívio do que a mordida: `condicoes.js:430-466`
  tem um campo `sai` por condição, em voz de mundo (*"o veneno afrouxa e sai
  do sangue"*, *"os músculos voltam a obedecer"*, *"o medo solta a
  garganta"*), lido por `linhaDaSaidaDeCondicao` (`:535`). A **entrada** só
  tem `aflicoes.js:145`, que é meio rótulo e meio contabilidade de dado
  (*"Vex está Sangrando (3t) — Garra flamejante (9 vs 14)"*). Simetria barata:
  um campo irmão de `sai`, na mesma tabela.
- [ ] **a frase mais vista do jogo diz "em na vala"** · leve · de: backend (X4) · 16/09
  `grid.js:428` compõe a recusa de alcance como
  `` `está a ${d} m, em ${nomeDoLugar(...)} — longe demais` ``, e
  `nomeDoLugar` (`:340`) devolve o `nome` da região **com a preposição já
  dentro** (*"na vala"*, *"no barril"*). O resultado é **"está a 17 m, em na
  vala — longe demais"**, e saiu impresso na sonda de X4 sete vezes seguidas.
  Quando a região não tem nome, `nomeDoLugar` devolve `""` e a linha fica
  *"em  — longe demais"*, com dois espaços.
  **Por que não é cosmético:** X1 mediu que **10 de 10 plantas recusam o corpo
  a corpo no turno 1**, e W1 mediu que esta é **a frase que mais aparece no
  jogo inteiro**. O conserto é de um lado só — ou `nomeDoLugar` devolve o nome
  pelado e quem compõe põe a preposição, ou a composição larga o `em`. **Tem
  de casar com `LINHAS_DO_GOLPE` e a catraca dos 54 caracteres**, pedida por
  W1 no item do gesto: são a mesma frase, e consertá-las em separado é criar
  a segunda cara da mesma linha.
- [ ] **um envelope resolvido sai sem selo, e o PM pode ser pago duas vezes** · leve · de: backend (X3) · 15/09
  `App.jsx:13029` manda `enviar` do envelope de invisibilidade, voo e luz
  **depois** de `cobrar` descontar o PM e `firmarOuCeder` trocar a pilha de
  efeitos. O cabecalho e so o nome da magia, entao `ehTurnoResolvido` responde
  `false`, a trava de X3 nao morde, e o jogador que declarar de novo **paga o
  PM outra vez**. Nao e linha faltando na tabela de `guardado.js` — **falta
  selo**: nenhum padrao pega isso sem pegar o mundo junto. O conserto e batizar
  o envelope no App, no molde do irmao `:13041`, que ja sai selado e ja trava.
  **Toca tres arquivos**, porque a catraca de `check-guardado.mjs` sobe de 9
  para 10 de proposito — e o varredor ja explica como se sobe.
- [ ] **os comentarios novos do `App.jsx` estao sem acento** · leve · de: orquestrador (X3) · 15/09
  O script `.cjs` de ancora evita acento para o shell nao mutilar o patch, e o
  resultado e que os trechos de X3 (`aMesaEspera`, o `catch` de `enviar`, o
  `retentar`) destoam de um arquivo inteiramente acentuado. As frases que o
  JOGADOR le estao acentuadas — isto e so comentario. Conserto e uma reescrita
  por `node` lendo e gravando UTF-8, **nunca** por PowerShell.
- [ ] **a economia do turno não é do motor: o App conta à mão** · médio · de: backend/testes (X1) · 15/09
  Estava escrito em X3 e **perdeu a casa** quando a pessoa reescreveu a etapa
  (X3 passou a ser *"o silêncio do Mestre é honesto"*, decisão dela, 15/09) —
  o achado continua de pé e fica aqui para não se perder. `gastarRecurso`
  (`src/combate.js:745`) é a única função do motor que gasta a economia de
  ação e **não tem chamador nenhum no repositório**; quem cobra é uma linha
  solta no App (`eco.acao -= 1`, `src/App.jsx:13234`). `combate.recursos` é
  escrito uma vez ao abrir a luta (`:5230`, com `novosRecursos()`) e **nunca
  lido em lugar nenhum**; e a reação passa `temReacao: true` **cravado**
  (`:7572`), logo a regra "uma reação por rodada" não é contada por ninguém.
  É a lei *"conta se prova, tela se olha"* invertida: a conta está na tela.
  **Tem dono natural em X2** — quem faz o botão gastar a ação é quem descobre
  que o gasto não passa pelo motor —, mas não depende dela para ser medido.
- [ ] **a catraca do export morto conta ocorrências, não leitores** · médio · de: backend (X1) · 15/09
  `testes/teste-ligacao.mjs:103-107` soma as ocorrências textuais do nome em
  todos os arquivos, **incluindo a própria declaração e a linha de import**, e
  aprova com `c > 1`. Logo **uma linha de `import` não lida conta como
  leitor** — e `App.jsx:7` carrega **9 nomes de `combate.js` importados e nunca
  usados**, nove leitores fantasmas comprados de uma vez. `gastarRecurso`
  (`src/combate.js:745`) marca 2 (declaração + import morto) e passa a catraca
  **sem ter um único chamador no repositório inteiro**. É a fresta exata que a
  lei *"export morto mente"* queria fechar. O conserto é contar **usos**, não
  ocorrências — descontar a declaração e a linha de import —, e ele **nasce
  vermelho** nos 9: por isso é médio e vem com a limpeza junto, não sozinho.
- [ ] **a reação escolhe por `Math.random()`, e o jogador nunca escolhe** · médio · de: testes (X1) · 15/09
  `escolherReacao` (`src/reacoes.js:85`, o sorteio em `:96`) decide sozinha qual
  reação acontece, com `Math.random()` — **fora da semente**. A lei
  *"determinismo por semente"* diz que mesma semente = mesmo resultado, e aqui
  não é: a mesma luta rejogada dá reações diferentes, e nenhuma régua consegue
  medir combate com isso dentro. Some-se que `REACOES`, `reacaoPorId` e
  `reacoesDe` **não têm chamador na tela** — as 6 reações existem e o jogador
  nunca escolhe nenhuma. Consertar a semente é leve e mede-se; **dar a escolha
  ao jogador é mecânica nova, logo da pessoa** (e tem cara de X2/X3).
- [ ] **seis dos doze botões prontos escrevem frases que ninguém lê** · leve · de: backend (X1) · 15/09
  Dos 12 literais de `ACOES_PRONTAS` (`App.jsx:1071-1084`), seis não casam
  leitor nenhum: **Esquivar, Empurrar, Derrubar, Correr, Ajudar, Enganar** —
  e quatro deles são ações de combate. Dois são conserto de uma linha:
  **Enganar** falha porque a regex de `src/desafios.js:392` tem `engano` e não
  `enganar` — **é o mesmo bug já documentado em `desafios.js:629-631`,
  consertado para a fileira de baixo e nunca para esta**; **Correr** falha
  porque `RETIRADA` (`src/combate.js:804`) exige `corro para (fora|longe)` e o
  botão escreve *"Corro em disparada para "*. Os outros quatro pedem motor e
  são de X2. **Não conserte os dois fáceis sem a catraca junto**, ou a terceira
  frase morta nasce no próximo ciclo: o varredor `check-acoes-do-jogador.mjs`
  já tem onde morar.
- [ ] **dez habilidades fazem coisa diferente do que prometem — três fazem o inverso** · médio · de: backend (achado da contagem das 148, v9.250) · 15/09
  Não é promessa vazia: é promessa **trocada**, e o jogador vê o efeito errado
  acontecer. `Palavra de Coragem` (*"remove medo"*) **aflige amedrontado**;
  `Mente Serena` (*"imune a medo"*) idem; `Chamado da Chuva` (*"cura leve
  contínua"*) põe o alvo **queimando**. Os outros sete: `Passos Silenciosos` e
  `Bomba de Fumaça` **atordoam**, `Emaranhar` **envenena um só** em vez de
  prender todos, `Tiro Perfurante` **protege o próprio atirador**, `Passo
  Feérico` entrega `furtivo` em vez de teleporte, `Coração Tempestuoso`
  **abençoa o grupo**, `Disparo Calibrado` **inspira o grupo de graça**.
  **A causa é uma só e é medível:** `aflicoes.js PORTADORES` casa por substring
  **dentro de palavra** — `aranha` em *Emar**anha**r*, `maça` em *Fu**maça***,
  `silenc` em *silenciosos*, `escudo` em *"atravessa escudo"*, `fúria` em
  *Fúria de Gaia* — e vale "a primeira que casa vence". O comentário do próprio
  arquivo avisou do risco na v9.45. O conserto é **fronteira de palavra nos
  regex** mais uma catraca que rode `aflicaoDe` sobre as 148 e falhe se alguma
  entregar condição que a descrição não promete. Reproduz em três linhas de Node.

- [ ] **sete habilidades de ataque cobram o PM e não disparam** · leve · de: backend (achado da contagem das 148, v9.250) · 15/09
  `HAB_OFENSIVA_RX` (`App.jsx:11677`) tem `ataca` e **não** `ataque`, e
  `resolverHabilidadeOfensiva` (`:11720`) devolve `null` a quem não casa. Ficam
  de fora, com o PM saindo da ficha e nenhum tiro disparado: `Tiro Preciso`,
  `Tiro do Fim`, `Cem Punhos`, `Sopro Herdado`, `Tempestade Viva`, `Barragem`,
  `Disparo Calibrado` — este ainda por cima inspira o grupo inteiro de graça.
  (13 habilidades de `tipo: "ataque"` falham o portão; as outras 6 entregam por
  outro caminho.) O conserto é **uma alternativa no regex**; a catraca é uma
  suíte que exija que toda `HAB` de `tipo: "ataque"` chegue ao motor.

- [ ] **o Narrador cala, e o pulo para o segundo provedor nunca foi provado** · médio · de: pessoa+Claude · 14/09
  A pessoa explicou o desenho (14/09): *"temos duas chamadas de API; caso
  uma não funcione, ele pula pra próxima. Como ainda estamos em
  desenvolvimento, não coloquei saldo na backup, mas isso será corrigido no
  beta."* Ou seja: o pulo existe de propósito e o segundo provedor está
  vazio **por escolha**, não por bug.
  **O que é item, então:** o pulo **nunca foi exercitado com o primeiro
  provedor funcionando e o segundo não** — as duas vezes que caiu nesta
  sessão, os dois estavam sem saldo, e o jogador viu o erro cru dos dois.
  Provar o pulo sem gastar dinheiro: uma prova que simule o primeiro
  falhando (402, 429, 500, tempo esgotado) e confira que o segundo é
  chamado, que a ordem da fila é a declarada, e que **o que chega ao
  jogador é frase de mundo**, não o corpo do erro.
  **E o cuidado que a pessoa iluminou sem querer:** o item *"o erro do
  provedor vaza para o jogador"* quer esconder o motivo técnico — mas foi
  exatamente esse vazamento que permitiu diagnosticar as duas quedas. Logo o
  conserto é **mover, não apagar**: frase de mundo na tela, motivo técnico
  íntegro no `console`. Quem apaga o motivo fica cego na próxima.
  **Fora do escopo desta casa:** pôr saldo é da pessoa, e ela já disse que
  o beta resolve. Os modelos chamados hoje são `deepseek-v4-pro` e
  `deepseek-v4-flash` (`api/narrador.js:42`) — se com saldo o erro voltar,
  **o texto do erro dirá se é modelo ou crédito**, e são coisas diferentes.


- [ ] **oito campos de combate são lidos e nunca escritos — e custam 14 intenções** · médio · de: backend (achado de N1) · 14/09
  `bandeirasDosAlvos` e `lutaDaMesa` leem `ent.carregaAChave`, `ent.feriu`,
  `c.refem`, `c.doVilao`, `c.emboscada`, `c.surpresaDoJogador`, `mm.temChave`
  e `inimigo.chefe`. **Nenhum deles é escrito em `src/` inteiro** — grep com
  zero produtores. Consequência medida: **14 das 46 `INTENCOES` nunca vencem**
  em 200 000 situações sorteadas dentro do domínio que o App produz, e na mesa
  **8 das 46** são eleitas alguma vez (`sair_vivo` ocupa 48,6% das rodadas).
  As prioridades `quem_carrega` e `quem_me_feriu` devolvem, medido, o retrato
  do sorteio cego byte a byte. Não é conserto de N1 (medir não muda nada) e
  parte dele é pré-requisito de N3, que promete a memória que preencheria
  `feriu`. Catraca: varredor que exige produtor para todo campo que
  `garantirLuta`/`garantirAlvo` declara.
- [ ] **`ehOfensiva("Escudo da Fé")` é `true` — a Clériga dispara o escudo como golpe** · médio · de: backend (achado de N1) · 14/09
  `RX_OFENSIVA` (`companheiros.js:104`) casa a palavra **"dano"**, e a
  descrição do `Escudo da Fé` é *"Protege um aliado de dano por 2 turnos"*.
  Medido: no plano 4 de `decidirAcaoCompanheiro` a Clériga gasta 3 PM e rola
  `danoDaHabilidadeComp` com o escudo **16 vezes em 1000 combates** no
  `justo`. É pequeno, é real, e é da família "promete na ficha e faz outra
  coisa na mesa" que a Fase P fechou. Catraca: teste que exija
  `ehOfensiva(h) === false` para toda habilidade que `ehBuff` ou `ehAbrigo`
  reconheça.
- [ ] **`alvoDoAdversario` não tem leitor de produção, e o cabeçalho dele afirma o contrário** · leve · de: backend (achado de N1) · 14/09
  O comentário de `adversario.js:663` diz *"O que `turnoDosInimigos`
  chama"* — e `turnoDosInimigos` chama `escolherAlvo` direto
  (`combate.js:281`), com a string que vem de `App.jsx:13606`. O único leitor
  de `alvoDoAdversario` é `teste-adversario.mjs`: passa na catraca do
  `teste-ligacao` pelos dois leitores e **não decide nada na mesa**. Ou ganha
  o leitor que o cabeçalho promete, ou o cabeçalho passa a dizer a verdade.
- [x] **`ATRIBUTO_MAX = 5` é importado e nunca lido** · **RESOLVIDO em N2 (v9.259)** — `FAIXAS_DO_INTELECTO` (`src/degraus.js`) o importa como teto da última faixa, e a suíte o lê de volta. **Com uma ressalva escrita no código:** ele **não é o teto real do jogo** — `tetoAtributo(nivel)` (`atributos.js:66-73`) chega a **6 no nível 10, 7 no 15 e 8 no 20**. A última faixa satura de propósito, então nada quebra; o que mudou é que o comentário deixou de afirmar um teto que a progressão passa · leve · de: backend (achado de N1) · 14/09
  `constantes.js:28` exporta, `App.jsx:43` importa, e **nenhum sítio do
  projeto o consulta** — a suíte só confere `ATRIBUTO_MAX_CRIACAO`. É export
  vivo pela letra da catraca e morto no efeito. Importa agora porque N2 vai
  querer um teto de escala e este é o número que parece ser ele: quem o usar
  lhe dá o primeiro leitor, e quem não usar devia tirá-lo do import.
- [ ] **`completarInimigo` não copia o `desc` da base, e `menteDaCriatura` decide sobre o nome** · médio · de: backend (achado de N1) · 14/09
  `bestiario.js:69-86` monta a ficha que chega ao combate e **deixa o `desc`
  para trás** — o mesmo erro que a v9.152 consertou para `perfil` e `des`, com
  o motivo escrito ali no comentário. Consequência: `menteDaCriatura`
  (`adversario.js:187`) recebe `desc === undefined` para toda criatura da
  tabela e classifica **só pelo nome**, pondo **18 das 27** em `pensa` (o
  Capanga e o Dragão Ancião no mesmo balde) e o **Colosso** (*máquina de
  cerco*) em `besta`, porque `RX_BICHO` casa a palavra "besta". Hoje decide
  pouco; no dia em que N2 nascer, decide muito.
  **N2 nasceu (v9.259) e mediu o tamanho exato do buraco, sem o consertar** (é
  item de outro dono): **com `desc` são 18 das 27 em `pensa`, o retrato de N1;
  sem `desc` — o que a mesa de fato vê — são 19.** O **Colosso** é a única
  diferença, e por isso ele **declarou** o degrau no bestiário em vez de o
  herdar: `degrauDaCriatura` roda com nome + ameaça, e a suíte trava a
  independência do `desc` nos dois sentidos. **Consertar o `desc` mexe em 1 das
  27 classificações**, e agora está medido em vez de estimado.

- [ ] **`resist: ["fisico"]` está declarado em quatro criaturas e a mesa nunca o vê** · médio · de: backend (achado ao medir N2) · 15/09
  `multiplicadorDano` (`src/danos.js:73`) curto-circuita em `tipo === "fisico"`
  e devolve multiplicador 1 **antes** de olhar `resist`. Medido na régua:
  Sentinela Blindada (resistência física declarada) e "Adversário" (sem perfil
  nenhum) dão **0 de 300 combates diferentes**, nos dois modos — não há um
  único ponto de dano de diferença. **É o mesmo padrão do Troll da v9.152**, que
  ganhou fraqueza a fogo em `bestiario.js` e continuou imune em combate: a
  tabela certa e a mesa cega. Quatro entradas do bestiário declaram essa
  resistência. **Não foi consertado de carona:** ligar a resistência física
  endurece o combate, e a Fase N está exatamente a medir dureza — entra sozinho,
  com o antes e o depois na régua, ou some dentro de outro número.

- [ ] **a ofensiva do companheiro quase nunca nasce** · pesado · de: medição de B2 · 14/09
  B2 fechou a simetria e o preço medido foi **zero** — e o motivo é este, medido em
  300 combates `justo`: **3.571 golpes de companheiro, 2 com bônus ofensivo
  (0,06%)**. As 119 ações de `buff` do piloto produziram 2 presenças de `Bênção`
  (`dano`) contra 10 de `Escudo da Fé` (`protecao`, bônus 0, vetado com razão por
  `efeitoNoGolpe`). No `duro`, **zero**; no `brando`, 66 de 1.828. O caminho
  `buffDeCompanheiro` exige `aflicaoDe(...)` achar portador com `alvo !== "alvo"`
  **e** `res.cond.tipo === "bom"`, e quando algo nasce `firmarEfeito` costuma dar
  o lugar à defensiva.
  **É pesado, e por número:** fazer a ofensiva nascer com regularidade vale até
  **+2 por golpe**, e a escada de B1b diz que +2 leva a vitória a **58,4%** e que o
  dente do PV sai da margem **já em +1**. Ou seja: mexer aqui **obriga a reabrir
  `BUFF_DA_HABILIDADE`**, e muda o que o jogador vive em campanha viva. A régua de
  B1/B1b mede o antes e o depois sem trabalho novo.

- [x] **o buff do companheiro é mudo em Uma Vida** · **RESPONDIDA 14/09 — virou parte de N6** · pesado · de: achado de B2 · 14/09
  Desde a v9.247 a ação do companheiro carrega `bonus`/`fontes`, e **só a arena os
  narra** (a frase "pesa no golpe", no Duelo). Em Uma Vida ninguém os lê: o jogador
  sente o buff só pelo dano maior. O comentário de `buffDeCompanheiro`
  (`App.jsx:7974`) foi reescrito em B2 para dizer que isso hoje é **escolha de
  tela**, não herança — mas a escolha continua sendo da pessoa: anunciar "+N de
  dano" ali é gameplay visível, e esbarra em "o sistema não fala de si mesmo".

- [ ] **três condições que o grimório promete e o catálogo não tem** · leve · de: backend (achado de T4) · 14/09
  Restauração Menor diz *"Tira uma doença, uma cegueira, um veneno, uma surdez"* e
  Maior diz *"Levanta uma maldição, um nível de exaustão, uma petrificação"*. Das
  sete, **`doença`, `surdez` e `maldição` não existem em `CONDICOES`** — a
  petrificação está coberta como alias de `paralisado`, e as outras três a tabela
  de T4 alcança. Hoje isso não mente na mesa (a porta só remove o que existe), mas
  mente na **ficha da magia**, que é onde o jogador lê antes de gastar PM. Nascer
  as três é barato e a catraca de T4 já as cobriria no dia em que nascerem: cada
  uma precisa de prazo, canal ou porta, ou a suíte acende. Cuidado medido: o alias
  novo tem de passar por `normalizarCondicao`, e `surdez` não colide com nada mas
  `doença` pode casar com a ficção que o Mestre escreve o tempo todo.

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

- [ ] **sete suítes ainda apostam no acaso, e uma está colada no limiar** · leve · de: testes (achado de T3) · 14/09
  Varridas as 181 suítes atrás do mesmo vício que o `teste-sala` tinha: **24
  produzem saída não-determinística**, e 23 foram rodadas 20× cada — **zero
  vermelhas**. Nenhuma é da classe do `teste-sala` (~1 em 5.800), mas sete têm
  margem que vale nomear, em σ: `teste-onda3.mjs:52` (**7 σ**),
  `teste-oraculo.mjs:86` (5,7 σ, 4.000 `consultar()` **sem a costura `{ sorte }`
  que já existe**), `teste-mercado.mjs:78` (5,6 σ), `teste-afl.mjs:59` (6,1 σ) e
  `:66` (7,2 σ), `teste-movimento-hab.mjs:65` (6,2 σ), `teste-reacoes.mjs:39`
  (7,5 σ). **A que importa é `teste-onda3.mjs:52`** (`mult >= 1.9`): o Invocador
  mede **1,990**, colado no limiar — qualquer ajuste de tabela que leve o
  multiplicador a ~1,93 vira falha intermitente **sem defeito real**, que é
  exatamente o veneno que o `teste-sala` destilou por duas corridas. `teste-arena`
  e `teste-masmorra` foram conferidos e **não** têm o vício. Conserto: a costura
  de semente onde ela já existe, começando pelo oráculo e pelo onda3.

- [ ] **`= {}` não cobre `null` em três portas novas** · leve · de: testes (achado de T3) · 14/09
  `tentarSaidaNoFimDoTurno(p, null)` estoura: `{ modDe, d20 = null, quem = "" } = {}`
  não cobre `null` explícito — a armadilha que o `CLAUDE.md` lista como lei e que
  `semente.js:feicoes` já guarda com `opcoes && typeof opcoes === "object"`.
  Severidade baixa e **não é defeito de T3**: nenhum dos três sítios passa `null`,
  os três estão em `try/catch` com `calou`, e o padrão é pré-existente em quase
  toda a casa. O valor do item não é a linha — é **varrer quantas portas do `src/`
  têm o mesmo buraco** e decidir se vira varredor (`check-*.mjs`), que é a única
  forma de a lei parar de ser conselho. Linha "varredor novo para erro já visto".
- [ ] **o sonho dá vantagem eterna ao herói** · médio · de: backend (achado de T1) · 14/09
  **É a única condição genuinamente eterna do jogo hoje — e é do herói, não do
  grupo.** `App.jsx:18759` escreve `{ nome: "Inspirado", tipo: "bom", nota: … }`
  **sem `id` e sem `turnos`**. `normalizarCondicao("Inspirado")` casa com o
  catálogo, `mecanicaDe` concede **vantagem em toda rolagem**, e `tickCondicoes`
  a preserva com `turnos: null` **para sempre** (provado: três tiques seguidos e
  ela continua lá). A irmã da linha seguinte, `"Perturbado"`, não casa com nada —
  rótulo puro que ninguém lê e nada remove. Ou seja: T1 pôs o relógio no grupo e
  este caso passa **por baixo dele**, porque não é prazo que falta, é prazo que
  nunca foi escrito. Médio: o conserto é dar `id` e `turnos` do catálogo ao
  nascimento, sem mecânica nova. Catraca: nenhum sítio do App escreve condição
  sem `id`, e nenhuma condição nasce com `turnos` ausente onde o catálogo tem
  número. **Se a decisão for que o sonho deve mesmo durar até o descanso, isso é
  regra nova e sobe para a pessoa.**

- [ ] **`protegido` não defende ninguém, nem o herói** · médio · de: backend (achado de T1) · 14/09
  Medido ao contar o que T1 tirava do grupo, e é o motivo de a etapa quase não
  doer: **94% das condições de pé no grupo eram `protegido`, e ele compra +0 de
  defesa**. `defesaDe` (`combate.js:39`) não lê `condicoes`, e
  `modificadoresDeCondicao` (`:75`) não devolve `defesa` — `mecanicaDe().defesa`
  só é lido pelo **HUD** (`App.jsx:20830`). Provado direto: `defesaDe` com e sem
  `protegido` = **11 e 11**. São **15 habilidades do acervo** que prometem abrigo,
  entram como `protegido` e não cumprem — **a forma exata das quatro famílias da
  Fase F** (promessa na ficha, força zero na mesa), e a tela ainda por cima mostra
  o número que a mesa não usa. Provavelmente pertence a **F** ou a **B**, não a T:
  levar para lá quando a fase chegar, em vez de abrir etapa solta.

- [ ] **os seis `varredura-*.mjs` não entram no `npm test`** · leve · de: testes (achado de T1) · 14/09
  O `CLAUDE.md` diz que o `npm test` roda "todas as `teste-*.mjs` mais os
  varredores (`check-*.mjs`, `varredura-*.mjs`)". `rodar-tudo.mjs` só varre
  `^teste-` e `^check-`: **os seis `varredura-*.mjs` não rodam**. Rodados à mão
  agora, os seis passam (exit 0) — não há vermelho escondido, mas **eles não estão
  guardando ninguém**, e um varredor que não roda é pior que varredor nenhum
  (promete vigilância que não existe). Leve: é o corredor, não uma regra. Cuidado
  ao ligar — se algum ficar vermelho ao entrar, o vermelho é legítimo e vira o
  item do ciclo, **não se afrouxa o varredor para ele caber**.

- [ ] **`aplicarCondicaoEm`, ramo do grupo, é código morto** · leve · de: backend (achado de T1) · 14/09
  `App.jsx:7543` trata o caso "a condição é de um companheiro", e **nunca roda**:
  os dois chamadores (`:8193`, `:14831`) passam a string literal `"você"`, então
  `ehEu` é sempre verdadeiro. Era o sexto dos "seis sítios" que a pauta da Fase T
  contava — são cinco. Ou ganha um chamador de verdade, ou sai. Barato, sem
  pressa, e o dente é o de sempre: ramo que ninguém pisa mente sobre o que o
  sistema faz.

- [ ] **o piloto não sabe do teto e joga fora o abrigo que acabou de erguer** · médio · de: backend+testes (achado de C3) · 14/09
  C3 fez valer "uma magia de duração por vez", e o preço apareceu no mesmo
  instante, medido: **as 60 cessões de 420 quedas são TODAS "Escudo da Fé →
  Bênção"** — Remendo e Voto firmam o escudo e na rodada seguinte o jogam fora.
  Mordidas do abrigo **245 → 202**, pontos comidos **980 → 808** (−17,6%).
  **A regra está certa e não se afrouxa** (o 5e concorda: Bless e Shield of Faith
  não coexistem); quem está errado é `decidirAcaoCompanheiro`, que escolhe apoio
  sem perguntar o que o dono já segura. É a lição de P2 outra vez — **o piloto
  deve perguntar à tabela**, e desta vez a tabela já existe e já é lida
  (`exigeConcentracao` + `efeitoEmConcentracao`): antes de firmar, saber se vai
  derrubar algo melhor. Médio porque não inventa mecânica nem número novo — liga
  sinal que já existe a quem já decide. **Se o conserto pedir critério de valor
  ("qual das duas vale mais"), isso é regra nova e sobe de peso.** Catraca: o
  número de mordidas está cravado como **fato datado** na seção 11 de
  `teste-arena.mjs`, com o piso das metades em 40 **de propósito** — um piso
  colado no dígito de hoje reprovaria justamente este conserto.

- [ ] **o Narrador acha que a magia trocada ainda está de pé** · médio · de: frontend (achado de C3) · 14/09
  **É o mesmo furo do item "o Narrador não sabe que a magia do companheiro caiu",
  agora com um terceiro dono — e provavelmente a mesma solução, num item só.** O
  Mestre recebe `[... — ATIVO, CONTADO PELO SISTEMA]` da magia nova e continua
  com a antiga na cabeça: pode narrar o herói ainda voando depois de ele ter
  trocado Voo por Invisibilidade. C3 **mediu e não forçou**: a nota de C2 mede
  **289 chars**, uma irmã da troca mediria **279**, e mesmo comprimida a uma
  cláusula colada na que já existe mede **48** — 74% da margem inteira (pior cena
  real **81935**, teto 82.000, margem **65**), com **três** sítios podendo
  dispará-la e `notaRef` acumulando da rodada dos inimigos até o `enviar`
  seguinte, de modo que queda e troca podem viajar **no mesmo envelope**.
  O trabalho é **uma nota só que cubra os três donos** (herói que quebra,
  companheiro que quebra, quem troca) ou a de C2 comprimida até caber a segunda.
  **Se a conta de caracteres não fechar, o item sobe de peso** — o teto é sagrado.
  Catraca: o varredor do teto + a seção 17 de `teste-efeitos.mjs`, que já conta a
  nota do herói.
- [ ] **o dente da amplitude está encolhendo sozinho, e ninguém mandou** · médio · de: testes+orquestrador (achado de C2b) · 14/09
  Conferido de passagem ao refazer a escada de sabotagem de C2b, e é o achado mais
  incômodo do ciclo: **o aperto da sabotagem `sombra +3` vem diminuindo a cada
  ciclo, sem que ninguém mexa em limiar nem em pronto.** Em A4 (v9.225) ela dava
  **3 vermelhos**; na árvore de antes de C2b, **1** (amplitude 20,8, teto 20);
  depois de C2b, **0** — amplitude **19,6, a 0,4 pt do teto**. O motivo é o que
  `tetoDeAmplitude` já avisava que aconteceria: amplitude é máximo menos mínimo do
  **retrato**, e o retrato é resorteado a cada mexida na arena. Ou seja, o dente 2
  — o único que pega a sabotagem que deixa todo mundo **dentro** de 35–65 — está a
  0,4 pt de parar de morder, por sorte e não por equilíbrio. C2b **não o tocou de
  propósito** (o conserto de lá foi das famílias, e crescer o retrato junto teria
  afrouxado justamente este dente — está escrito na tabela).
  Médio **só a medição**: quantas amplitudes o retrato produz em N sementes
  independentes, qual a distribuição real hoje contra a de A4, e se 20 ainda é o
  número certo. **Qualquer conserto que mexa no teto ou num pronto é pesado e vai
  para a pessoa** — teto é limiar, e rebalancear pronto muda o que o jogador vive.
  A saída que pode ser média é a terceira: um retrato maior **com o teto
  recalibrado na mesma medição**, que é aperto e não folga. Catraca: a própria
  escada de sabotagem, que agora está escrita em `teste-arena.mjs`.

- [ ] **o Narrador não sabe que a magia do companheiro caiu** · médio · de: frontend (achado de C2b) · 14/09
  C2 fez a quebra do **herói** chegar ao Mestre por nota dinâmica, cumprindo a
  promessa de `ECONOMIA_ACAO_PROMPT` (*"quando quebrar, narre o efeito se
  desfazendo"*) com crescimento estático zero. C2b fez o **companheiro** quebrar de
  verdade — e deixou a nota de fora, com a conta feita: a pior cena real mede
  **81935 chars, margem 65** para o teto de 82.000; a nota do herói custa ~370
  chars; e herói e companheiro podem cair **na mesma rodada de inimigos**. Uma
  segunda nota ali **estoura o teto**, e o teto de prompt é sagrado. Então o
  jogador lê a queda na cena e o Mestre pode narrar o companheiro ainda abençoado
  no turno seguinte — o mesmo furo que "o Narrador esquece a guarda", um item
  abaixo, e provavelmente a **mesma solução**: uma nota só que cubra os dois donos,
  ou a nota do herói comprimida até caber a segunda. **Se a conta de caracteres não
  fechar, o item sobe de peso.** Catraca: o varredor do teto + a seção 17 de
  `teste-efeitos.mjs`, que já conta a nota do herói.

- [ ] **o herói apanha em seis sítios e a concentração só é testada em um** · médio · de: medição de C2 · 14/09
  `testeConcentracao` tem **1 chamador de produção**: `App.jsx:13379`, o turno dos
  inimigos. O herói sofre dano em **cinco outros lugares** onde a magia que ele
  segura **não corre risco nenhum**: `App.jsx:8173` (dano de condição — veneno,
  sangramento; no 5e isso quebra concentração, e é o mais gritante da lista),
  `:8069` (`sofrerNaPele`, a porta única, e com ela salvaguarda/ambiente `:16057`,
  queda `:16094`, armadilha `:17199` e o preço do esforço `:14711`), `:12970` e
  `:13907` (os dois ataques de oportunidade) e `regras-jogo.js aplicarMudancas`
  (dano do Narrador fora de combate). C2 **não ligou nenhum, de propósito**: C1
  mediu o raio da quebra com cuidado para não estourá-lo, e ampliar o raio não
  estava na etapa. Mas enquanto não forem ligados, a regra é meia regra — e o
  jogador aprende o hábito errado (só apanhar de inimigo ameaça a magia).
  Médio porque muda o que ele vive em campanha viva: **meça o raio novo antes**
  (quantas magias, quantos turnos a mais de exposição) como C1 fez, e se a conta
  mostrar que a magia deixa de durar, sobe de peso. A leitura já está pronta e é
  a mesma — `tc.linha` serve os seis. Catraca: a seção 17 de `teste-efeitos.mjs`,
  que já conta os chamadores.

- [ ] **`RX_CURA` acha cura dentro de "proCURA" e "obsCURA"** · leve · de: backend (achado de passagem em C2) · 14/09
  `companheiros.js:91`: o regex não tem fronteira de palavra, então **"o que
  ele *procura*"** e **"resposta curta e *obscura*"** casam. Medido: `ehCuraDeGrupo`
  diz que **`Localizar Objeto`** e **`Adivinhação`** são curas, e nos prontos isso
  é real — **chama, remendo, voz e voto** todos carregam `Localizar Objeto`, que
  vira candidata a `{tipo:"cura"}` e passa por `valorDaCura`. É a mesma família
  dos dois falsos positivos do vocabulário de apoio, um item abaixo, e a mesma
  lição de P2: **o piloto deve perguntar à tabela, não adivinhar por regex de
  nome**. Conserto mínimo é a fronteira de palavra; o conserto que vale é o da
  linhagem de P2. Linha "bug com teste que prova". Catraca: `teste-guardas.mjs`
  seção 6 e `teste-companheiros.mjs` — os dois nomes deixam de ser cura, e os
  curadores honestos continuam sendo.

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

- [ ] **os comentários novos do `App.jsx` estão sem acento** · leve · de: orquestrador (achado de P3, crescido em C2b e C3) · 14/09
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
  **Cresceu de novo em C3 (14/09):** a porta `firmarOuCeder` e os três sítios
  trouxeram mais comentários longos sem acento ("A PORTA E `firmarOuCeder`, E NAO
  `empilhar`", "heroi", "propósito" sem o ó). O arquivo segue íntegro — **0**
  caracteres de substituição, conferido neste ciclo em `App.jsx`, `efeitos.js`,
  `grimorio.js`, `arena.js` e nas duas suítes. A cada etapa que toca o App a
  dívida cresce, e o conserto é sempre o mesmo script `.cjs` via `node`.

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
