# A pauta do desenho

A fila da **segunda mente** — a do visual. O `regente` pega daqui, uma etapa
por ciclo, independente da fila do sistema (`mente/pauta.md`).

Mesmos pesos do `CLAUDE.md`, com a tabela de design: `leve` e `médio` o ciclo
executa sozinho; `pesado` espera a pessoa. **Fluxo do jogo e mover o que o
jogador já usa são sempre `pesado`** — ali o custo é a memória de quem joga,
e nenhum número resolve. Paleta e tipografia são `médio` **se comprovadas**
pela régua dos quatro dentes.

A forma de cada coisa mora em `mente/formas.md`; o feito, em
`mente/diario-desenho.md`.

---

## Para a pessoa decidir (pesado)

Todos nasceram da medição de D1 (14/09). Nenhum é gosto: cada um tem o número
que o sustenta, e cada um mexe **no fluxo do jogo ou no que o jogador já usa**
— por isso espera.

**Os dois primeiros são de D4, e são a resposta ao pedido da pessoa de 14/09**
(*"não precisam ficar tímidos e trabalhar apenas o que já existe"*). Pela
régua nova, `pesado` é uma pergunta só — **o jogador teria de reaprender?** —
e nos dois a resposta é sim, com o que ele reaprende dito por escrito.

**E três nasceram em E1 (15/09), ao desenhar a tela de batalha** — estão logo
a seguir aos de D4, marcadas *(E1)*. As três são da mesma família e é honesto
dizê-lo: as três tratam do que acontece quando **o tabuleiro passa a ser onde
o jogo se joga**, e cada uma pede uma coisa ao motor que ele hoje não faz.

**E duas nasceram em K1 (15/09)**, marcadas *(K1)*. Vêm à pessoa por razões
opostas — uma porque **dá ao jogador informação que este jogo nunca lhe deu**, a
outra porque **paleta é identidade**.

- [x] **o dano aparece antes de doer** · **RECUSADA 15/09, e o relógio subiu junto.** A pessoa: *"acho que ficaria melhor o dano vir surpresa e aumentar o relógio — daria mais emoção e realmente se compararia a uma reação; talvez 15s, pra que fique tranquilo até pra pessoas com dificuldade."* **O que isso decide:** a reação é **instinto, não cálculo** — o jogador escolhe sem saber o tamanho do golpe, e é isso que a torna uma reação de verdade. O número medido que sustentava a proposta continua verdadeiro (o sistema TEM o dano na mão antes de doer) e deixa de ser usado, de propósito. *(K1)* · pesado · de: jogo · 15/09
  **A janela da reação é o único instante do jogo inteiro em que o sistema tem na
  mão um número que ainda não aconteceu.** `a.r.dano` existe em `App.jsx:7572` e
  só vira PV mais à frente. A proposta é usá-lo: a primeira linha do cartão deixa
  de ser *"o ogro do beco golpeia você"* e passa a **"o ogro do beco — 9 de dano a
  caminho"**, e cada verbo traz a conta **já feita** contra o PV que está na tira:
  > **aparar** · 0 PM — **9 vira 4**, você fica em 13
  > *deixar passar* · não gasta PM — **9 inteiros**, você fica em 8

  **Porque não é enfeite, e é o argumento todo.** Sem o número, as reações ficam
  na **mesma ordem em todas as lutas**: o jogador escolhe sempre a melhor que tem
  — que é **exactamente o que `escolherReacao` já faz por ele, e faz bem**. Nesse
  mundo a janela acrescenta toques e **muda nada**: é uma reimplementação manual
  de uma decisão automática correcta, que é a definição de um mecanismo que
  cansa. Com o número, a ordem **muda a cada golpe**: a 17/20 poupa-se o PM, a
  6/20 gasta-se tudo. **É a diferença entre um menu e uma decisão** — e é a única
  decisão que o sistema **não pode** tomar por ele, porque só ele sabe se está a
  guardar PM para o chefe. **E o argumento ficou mais forte em K1:** como o caso
  comum é **uma reação só**, sem o número a janela é literalmente uma lista de um
  item com ordem fixa.
  **E o relógio força a mão.** Ninguém faz `9 × 0,5` e compara com `17 PV` em
  quatro segundos enquanto lê prosa. Se a janela mostra proporções e lhe deixa a
  aritmética, o relógio **garante** que ele responde por hábito e não por leitura.
  ***Uma decisão de quatro segundos só se pode tomar sobre informação já
  calculada. Ou se mostra a conta, ou não se devia pôr relógio.***
  **Custo: zero mecânica nova, zero tabela nova** — é `Math.round(dano * corta)`
  corrido em pré-visualização, e cabe na fenda de preço que já existe (26 e 27
  caracteres, dentro dos 40 medidos): **mesma peça, mesma altura, zero píxeis a
  mais**.
  **O risco, dito pelo próprio `jogo`:** mostra o dado do inimigo antes de o
  jogador reagir, o que este jogo nunca fez. É uma facilitação — pequena, e **só
  para quem responde**: quem ignora tem o jogo de hoje, byte a byte. *"Ver o
  tamanho do machado que vem é o que a personagem veria."* **E se a pessoa disser
  que não, a Fase K continua a fazer sentido — mas então o relógio tem de ser mais
  generoso, porque a conta passa a ser dele.**

- [x] **`lineStrong`: a casa não sabe dizer "sou um controlo" sem gritar** · **APROVADA 15/09** — vira etapa da mesa: a paleta ganha o degrau que falta entre desaparecer e gritar. *(K1)*
  · pesado · de: desenho · 15/09
  **A medida que o apanhou:** `line`/`panel` = **1,29:1** e `panelSoft`/`panel` =
  **1,07:1**. As quatro superfícies da casa cabem dentro de 1,3:1 umas das outras
  — **para a WCAG 1.4.11 são uma superfície só**. Consequência prática: um
  controlo desta casa **ou se enche de `amber` (8,45:1) e grita, ou desaparece**.
  Não há meio-termo, e foi por isso que o recuo *deixar passar* — o botão de quem
  **não quer gastar PM** — teve de ser remendado com um override em vez de
  resolvido.
  **A proposta é um token só:** `lineStrong` = `#70688C`, **o degrau mais baixo**
  que passa 3:1 contra as três superfícies (panel 3,51 · bg 3,74 · panelSoft
  3,27). Foram testados cinco; `#645D7D` falha a 2,95.
  **Paga um remendo removido** (o override deixa de ser preciso), é **reversível
  por uma linha em `T`**, e tem **par comparável montado** na folha `74:64`.
  **O risco, dito:** cinco linhas contornadas podem ler-se como grelha — e isso
  está desenhado, não jogado. E só rende nos **6,8 %** de controlos que passam por
  `ui.jsx`. **Vai à pessoa porque paleta é identidade**, e identidade não é peso
  médio por mais pequena que seja a mudança.
  *(Nasceu de o `desenho` se desmentir: escreveu na primeira rodada que o piso de
  contraste estava "cumprido com folga em todos", foi medir, e não estava.)*

- [x] **a rodada tem três batidas, e o jogador toca as três** · **APROVADA 15/09 — e a pessoa devolveu a forma à mesa:** *"decida como designer UX e designer de games experientes, de forma que seja a melhor experiência jogável e visual"*. Vira a **Fase K**, e a mesa decide sem perguntar · pesado · de: jogo · 14/09
  **O que ele vive hoje.** Uma rodada de combate é: escrever uma frase, o
  sistema resolver tudo, e ler vinte linhas. As regras já modelam **três**
  coisas que são do jogador — mover, agir e reagir — e ele toca uma e meia.
  **Mover** já é clicável e ninguém sabe: quando a luta abriu, o tabuleiro
  estava **429 px abaixo da borda visível** e o scroller não rolou sozinho
  (`scrollTop = 0` de 1129 possíveis); rolado até ao fim, **41 das 86 casas**
  cabem na tela. **Agir** é um botão de **720 px²** (45×16) — enquanto, três
  centímetros acima, na mesma tela, o `⚔ A PRÓXIMA LUTA` mede **54.912 px²**.
  E **reagir não tem controle nenhum**: `src/reacoes.js` tem **seis** reações
  com gatilho, custo em PM e resolução, e `escolherReacao` escolhe sozinha a
  primeira que se aplica, **gastando o PM da ficha do jogador**
  (`App.jsx:7572`, débito em `:7577`). Numa luta inteira o `jogo` tocou
  **três** controles: duas casas e o `⛺` que encerrou a luta por engano.
  **As três batidas.** *Primeira:* a luta começa e **o campo é a primeira
  coisa que ele vê**. *Segunda:* antes de pisar, ele **vê o que o passo
  custa**, na casa, e o medidor de metros diz a verdade. *Terceira:* o golpe
  inimigo chega e, **antes de o dano assentar**, o jogo pergunta uma coisa
  curta — *"Aparar? — corta metade"*. Ele responde, ou não responde.
  **O que ele reaprende, e é uma coisa só:** que o jogo pode lhe fazer uma
  pergunta no meio do turno do inimigo, e que **não responder é uma resposta
  válida**. Nenhum botão sai do sítio, nenhum gesto antigo deixa de
  funcionar — mas isso é o fluxo do combate, e o fluxo é da pessoa.
  **Ao `backend`:** a janela é regra, sai de tabela nomeada; o padrão de quem
  não responde é **byte a byte** o `escolherReacao` de hoje; a catraca é uma
  frase — *mesma semente, ninguém responde, mesmo resultado de hoje*.
  **Regressão zero, provada em Node.** *(E uma dívida que aparece de graça:
  `reacoes.js:96` decide por `Math.random()` — a lei é determinismo por
  semente, e o sorteio da reação hoje não a cumpre.)*
  **Ao `desenho`:** a peça **A pergunta que expira**, que não existe e ficou
  nomeada em `formas.md` como dívida — um controle que aparece, oferece uma
  escolha com o preço escrito, e **some sozinho sem punir quem não
  respondeu**. Não é *O gesto que custa* (esse espera para sempre) nem um véu
  (esse toma a tela). Sem ela, a terceira batida não existe.
  **O risco, dito pelo `jogo`:** um jogo que espera resposta pode virar um
  jogo que cansa. Quatro defesas, e duas já são regra: (1) o sistema **já**
  recusa gastar reação em arranhão (`reacoes.js:93-94`), então a janela herda
  a parcimônia; (2) **uma por rodada**, que também já é regra; (3) **quem não
  responde, o sistema responde como hoje — nada regride**; (4) se o jogador
  deixar expirar algumas vezes seguidas, o jogo **para de perguntar** pelo
  resto da luta, sem nomear o mecanismo.
  **O melhor argumento é da própria casa** — estudo citado, e a origem é o
  cabeçalho de `src/reacoes.js`: *"no 5e e no BG3 metade da tensão do combate
  mora aqui: o golpe vem, e você tem uma janela para aparar…"*. Sete linhas
  abaixo, o mesmo comentário entrega a decisão ao sistema. **O módulo
  diagnostica o problema e depois o causa.** É o mesmo que a pessoa já
  aprovou em S1 — *o motor não muda; o que muda é quando o jogador fica
  sabendo* — aplicado à rodada em vez de à queda.

- [x] **`Atacar` ataca — os verbos de combate saem do autocompletar** · **RESPONDIDA 15/09 — virou a Fase X**, e X1 já mediu (v9.253) · pesado · de: jogo · 15/09 (D5)
  **O achado está dentro de um painel só, e ele tem duas metades.** O painel
  `Ações` (`App.jsx:20548`) tem duas fileiras separadas por uma linha
  tracejada. Em cima, `ACOES_PRONTAS` — **12 botões**, com `Atacar` em âmbar
  porque, diz o comentário da própria casa, *"é a ação que o jogador procura
  primeiro"* (`:20559`). Todos os 12 fazem a mesma coisa:
  `setEntrada(a.texto)`. **`Atacar` não ataca: ele digita `"Ataco "` na caixa
  de texto.** Embaixo, `ACOES_RAPIDAS` (`desafios.js:621`) — **8 botões** que
  chamam `declararAcaoRapida(id, motivo)` e entram **direto no sistema**, que
  decide se pede dado e já sabe responder *"você já tentou isso aqui"*.
  **Nenhum dos 8 é de combate.** Vasculhar, Investigar, Escutar, Lembrar,
  Convencer, Intimidar, Esgueirar, Arrombar — as coisas mais passivas do jogo
  atravessam o motor; **Atacar, Esquivar, Empurrar, Derrubar e Saltar** ficam
  do lado que escreve. A porta do motor existe, está provada, tem teste que
  confere botão contra desafio (`desafios.js:629-631`), e **nunca foi aberta
  para a violência**.
  **Experiência jogada (15/09, campanha `O Fio de Prata`, Brann nv 1, 7
  turnos com o Narrador vivo).** Declarei ataque **três vezes**, em português
  sem ambiguidade (*"puxo a espada e ataco Halvard na cara"*, *"avanço e
  golpeio Halvard com a espada"*, *"corro os últimos metros e enfio a espada
  em Halvard"*), dentro de um combate aberto, com iniciativa rolada e o
  tabuleiro montado. **Zero rolagens de ataque.** O único dado da sessão foi
  de **Intimidação** — uma prova social. O terceiro golpe virou uma cena em
  que todos conversam e *"Brann recua para sob a arcada"*: o combate
  simplesmente acabou, escrito. No fim dos 7 turnos: **PV 20/20, PM 6/6, XP
  89/300, relógio 08:45** — os mesmos quatro números do primeiro turno.
  **A régua da mesa aplicada ao pé da letra:** *"o jogo realmente está fazendo
  coisas — não só lendo e escrevendo"*. Hoje o verbo mais importante do jogo é
  literalmente autocompletar. E a lei da casa está invertida no pior lugar
  possível: *o Mestre é código, e a IA só narra* — mas **quem decide se o
  golpe aconteceu é a IA**. O motor de combate (a grade, o alcance, os metros,
  as 6 reações com custo em PM, o dano que flutua) fica esperando ser
  convidado por uma frase.
  **A forma, decidida e não perguntada:** `Atacar` deixa de preencher a caixa
  e passa a fazer o que a grade **já** faz para o movimento — acende o
  conjunto de alvos ao alcance e espera um toque. O jogador escolhe quem, vê
  o preço antes (alcance, o que sobra do turno), e o motor resolve. O que ele
  tiver escrito na caixa viaja junto como `motivo`, exatamente como
  `declararAcaoRapida(id, motivo)` já faz hoje com os 8 de baixo: **a frase
  deixa de ser a sintaxe obrigatória e vira o tempero**. Os mesmos 5 verbos,
  no mesmo lugar, com o mesmo rótulo.
  **O que ele teria de reaprender, e é uma frase:** que `Atacar` já não
  escreve a frase por ele — ele escolhe o alvo, e o que digitar passa a
  dizer *como*, não *se*.
  **O preço, dito por escrito:** o Narrador perde o veto sobre a violência, e
  algumas lutas vão ficar mais secas — às vezes o veto dele é boa escrita
  (foi o que me aconteceu, e a cena era boa). Três defesas: (1) a porta é a
  **mesma** dos outros 8, com o livro de tentativas inteiro atrás dela — nada
  de atalho novo; (2) o Narrador continua narrando o resultado, só deixa de
  decidir se a rodada existiu; (3) quem quiser a frase inteira continua
  podendo escrevê-la e apertar `Agir →` — nada é retirado, só deixa de ser
  obrigatório.
  **Ao `backend`:** os 5 verbos de combate precisam de linha no catálogo de
  `desafios.js` (é tabela, e o teste que já confere botão contra desafio passa
  a cobri-los). A regra não muda: alcance, dano e reação são os de hoje.
  Catraca: *mesma semente, mesmo alvo, mesmo resultado que a frase escrita
  produz hoje*.

- [x] **(E1) O turno monta-se antes de acontecer** · **APROVADA 15/09 — virou a Fase W** · pesado · de: jogo · 15/09 (E1)
  **O que ele vive hoje, contado toque a toque.** Uma rodada de combate é: abrir
  `Ações` (1), tocar `Atacar` (1, **que escreve `"Ataco "` na caixa**), escrever
  o alvo (~15 toques de teclado), tocar `Agir →` (1) — **e o golpe ainda pode
  não acontecer**. Medido a jogar em 15/09, campanha *O Fio de Prata*, 7 turnos
  com o Narrador vivo: três ataques declarados em português sem ambiguidade,
  dentro de um combate aberto, com iniciativa rolada e tabuleiro montado —
  **zero rolagens**. No fim, os mesmos quatro números do primeiro turno.
  **A proposta.** O turno deixa de ser uma declaração e passa a ser **uma frase
  que se monta no tabuleiro e se paga de uma vez**: o jogador encadeia *andar
  até H14 → atacar Halvard*, e a linha do veredito mostra **o total a correr** —
  os metros gastos, a ação gasta, os golpes livres que aquilo provoca — **antes
  de qualquer coisa acontecer**. Só então confirma. É o turno do 5e e do BG3, e
  é o que faz um turno tático parecer uma **decisão** em vez de uma submissão.
  **Por que é dela.** A regra de hoje é `App.jsx:3079` — *"Agir É encerrar"* — e
  isto pede ao motor que **segure um turno por confirmar**: é `backend`, é regra
  nova. E o jogador reaprende uma coisa só: **que agir deixou de encerrar, e que
  existe um momento entre escolher e pagar.**
  **O risco, dito pelo `jogo`:** um turno que se confirma é um turno com mais um
  toque. A defesa é que **o passo limpo continua a ser um toque** e o golpe
  limpo também — a montagem só existe quando o jogador **encadeia**, e encadear
  já é dizer que ele quer decidir antes de pagar. Quem não encadeia nunca vê a
  diferença.

- [x] **(E1) O tabuleiro conta o que o inimigo VAI fazer** · **APROVADA 15/09 — virou E5** · pesado · de: jogo · 15/09 (E1)
  **Experiência jogada:** numa luta inteira o `jogo` fez **zero decisões
  espaciais**, porque nada no campo pagava por estar num sítio em vez de noutro.
  Um tabuleiro onde a posição não muda nada é um tabuleiro decorativo — e este
  tem paredes com cobertura, terreno que cobra, alcance por tamanho e golpe
  livre por dar as costas. **A regra está toda lá; falta o jogador poder usá-la.**
  **A proposta.** Antes do turno do inimigo, **o campo mostra o que ele vai
  fazer**: as casas que ele ameaça acendem em contorno `danger`, com o alvo
  escrito. O jogador vê e decide — sair, cobrir-se, aceitar. **Estudo citado:**
  é o desenho do *Into the Breach* (Subset Games, 2018), o caso canônico — a
  dificuldade deixa de estar em adivinhar e passa a estar em **resolver**.
  **Por que é dela.** Exige que o motor **decida a ação do inimigo uma batida
  antes e a honre** — regra nova. E o jogador reaprende que **o tabuleiro diz o
  futuro**, que é a coisa mais forte que se lhe pode ensinar sobre esta tela.
  *(Tem um parente já aprovado: é a mesma ideia de S1 — o motor não muda, muda
  quando o jogador fica sabendo.)*
  **O risco.** Um campo que anuncia tudo tira o susto. A defesa é de tabela e
  não de desenho: **nem toda ação se anuncia** — o anúncio é atributo da
  criatura (o troll telegrafa, o assassino não), e aí **a ausência do anúncio
  passa a ser informação também**.

- [x] **(E1) Em combate, o texto deixa de ser o caminho da AÇÃO e passa a ser o caminho da FALA** · **APROVADA 15/09 — virou a Fase W** · pesado · de: desenho · 15/09 (E1)
  **A medida.** Dos 20 botões do painel `Ações`, **12 só digitam**
  (`ACOES_PRONTAS`, `App.jsx:1071-1084`, `setEntrada(a.texto)`); os 8 que entram
  no motor não são de combate. Para atacar, gasta-se **uma chamada ao Mestre**
  para que uma IA leia *"Ataco o ogro"* e descubra o que o motor já sabia.
  **A proposta.** Na tela de batalha, **toda ação mecânica acontece por toque** —
  verbo + casa, com o preço antes do clique — e **o Mestre narra o resultado uma
  vez por rodada**. O campo de texto fica e muda de emprego: já não é *"O que
  você faz?"*, é **"diga alguma coisa"** — a provocação, a parlamentação, a
  frase que o jogador quer que fique na crônica. Uma rodada passa de *N chamadas
  ao Mestre* para **uma**.
  **É a única proposta desta fase que DEVOLVE quota ao Narrador em vez de lha
  cobrar** — e a quota acabou duas vezes nesta fase (D1 e D4), deixando o jogo
  injogável. O combate é justamente o momento em que o motor é mais competente e
  a IA menos necessária.
  **O que ele reaprende, e é uma coisa só:** *em combate, não se escreve para
  agir — escreve-se para falar.* Nada sai do sítio fora da batalha.
  **A versão moderada, se a radical for longe demais:** o campo continua a
  aceitar ação escrita (inclusive *"vou até H20"*, que a régua torna possível),
  **mas deixa de ser o único caminho**. O ganho de chamadas é menor; o de
  ergonomia é o mesmo.
  **A ressalva honesta, e ela é grande, e é do próprio `desenho`:** este é um RPG
  de texto, e há risco real de que uma luta muda deixe de ser uma luta
  *narrada*. É por isso que é dela e não da mesa: **o que muda é o que o produto
  é**, não como ele se parece.

- [x] **O Pergaminho — a prosa ganha material próprio** · pesado · de: desenho · 15/09 (D5) · **APROVADA 15/09** — vira fase própria; depende de D5, que já está de pé
  **O que a medição de D5 mostra, e que ninguém foi procurar:** o Taverna tem
  **três paletas**, não uma. A semântica (`T`, 14 cores, 2.565 usos), a do
  **pergaminho** (71 literais em `painel-mapa` + `planta-cidade`, **zero** cores
  de `T` — uma paleta inteira, coerente e anônima, com 10 hexes escritos igual
  nos dois arquivos) e a do dado de jogo (77). A casa fabricou, sem decidir, um
  segundo material — papel velho sob luz quente — e **gastou-o inteiro em
  mapas**, que o jogador abre uma vez por sessão.
  **Cruzado com D1:** `tv-mono` tem **682 usos contra 315 do corpo e 108 do
  display**, e **542 dos 1.107 textos dimensionados (49%) são 9px ou 10px**. Num
  RPG cuja primeira lei escrita é *"a prosa é a protagonista"*, a prosa é
  servida no mesmo `<div>`, do mesmo material, com a mesma borda e o mesmo raio
  que o inventário — e metade do jogo está escrita na fonte que existe para
  dizer "isto é um número de máquina".
  **A proposta:** a narração deixa de ser um painel e passa a ser **uma
  superfície**. Um único lugar no jogo inteiro onde a interface se cala: sem
  mono, sem 9px, sem borda de painel, sem `T.line` — corpo Spectral no tamanho
  de leitura, medida travada entre 45 e 75 caracteres por linha, entrelinha de
  leitura, e a luz do pergaminho (que já existe, já é coerente e já está paga) a
  distinguir *"isto é a história a acontecer"* de *"isto é o sistema a
  informar"*. Toda a restante interface continua como está. Não é uma tela nova:
  é dar à coisa que o jogador lê durante noventa por cento da sessão um
  **material que nenhuma outra coisa do jogo tem**.
  **A prova, pelos três caminhos, e todos já estão ao alcance:**
  *Medida* — caracteres por linha, corpo em px, entrelinha e o par de contraste
  prosa/fundo, no telemóvel e no monitor, antes e depois. **Se qualquer par de
  contraste piorar, a proposta está errada por definição** — a lei é do
  `desenho` e vale contra ele. *Estudo citado* — WCAG 2.2 SC 1.4.8 *Visual
  Presentation* (largura máxima de 80 caracteres, entrelinha mínima de 1,5) e SC
  1.4.4 *Resize Text*; Apple HIG (corpo 17pt); Material 3 (*body-large* 16sp);
  Bringhurst, *The Elements of Typographic Style*, sobre a medida de 45–75
  caracteres. *Experiência jogada* — o `jogo` lê uma sessão de 6 turnos de Uma
  Vida no antes e no depois **com a mesma semente**: o mesmo texto, palavra por
  palavra, nos dois materiais. É o par comparável que a régua exige, e este
  projeto é dos poucos onde ele é exatamente reproduzível.
  **Por que é `pesado` e está aqui:** a pergunta é *"o jogador teria de
  reaprender?"*, e a resposta é **talvez sim** — a coluna de narração pode mudar
  de largura e de lugar na tela, e é o sítio para onde ele olha por omissão.
  Nada muda de nome, nada muda de fluxo, nenhum controle sai do lugar. Mas o
  sítio onde ele lê, sim. Isso é dela.
  **A dependência honesta:** esta proposta **precisa** de D5 fechado. Sem a
  catraca, um material novo nasce como mais 40 literais soltos num arquivo de 20
  mil linhas, e no ciclo seguinte é a quarta paleta anônima do projeto. Com a
  catraca, o Pergaminho **tem de** nascer como tabela — e portanto como um
  commit que se desfaz se a pessoa não gostar. É esse o argumento inteiro de D5,
  e é por isso que o item mais ambicioso desta fase é o que mais depende dela.

- [x] **o turno acontece mesmo quando o Narrador cala** · **RESPONDIDA 15/09 — virou X3 · X3b · X3c**, com a proposta do turno guardado aprovada pela pessoa · pesado · de: jogo · 14/09
  **Experiência jogada, duas vezes na mesma fase** (D1 e D4): a quota do
  Narrador acabou e **o jogo parou de ser jogável** — nem um turno de Uma
  Vida, nem um do Capítulo. Mas o achado que importa é o contrário: **o
  combate funcionou com o Mestre calado.** A luta abriu pelo sistema, o
  `jogo` andou no tabuleiro, o log escreveu o passo, e o Mestre não disse uma
  palavra. **O Taverna já tem um coração que bate sem a IA, e desliga-o por
  inteiro quando ela cala.**
  Depois: o turno resolve, o sistema escreve o que aconteceu na linguagem que
  já escreve (o dado, o dano, o passo, o espólio), e **a narração é o que
  falta, não o que impede**. É a lei da casa no caso extremo: *nunca pode
  custar o turno.*
  **É `pesado`** porque o jogador reaprende que existe um turno sem prosa, e
  porque a pergunta de baixo é de produto — *o que o Taverna é quando o
  Narrador não está?* Essa é dela, não da mesa. **Mas a mesa não pode calar
  sobre ela:** foi a única coisa que impediu esta fase inteira de medir um
  turno vivo.

- [x] **A batalha toma a tela** · **APROVADA 14/09 — virou a Fase E** (tela própria de batalha + tabuleiro com endereço)
  O `jogo` jogou e mediu: o campo tático de 16×16 vive dentro do scroller
  narrativo de **301 px de altura** com `overflow: hidden auto`. O painel
  `Ações` abre **abaixo da dobra** — clica-se e não aparece nada. `⤢ ampliar`
  promete "tela cheia" no `title` e abre **outro bloco dentro do mesmo
  scroller clipado**: o campo inteiro nunca foi visto, em partida nenhuma. Em
  1280×860 o jogo ocupa 560 px à esquerda e **mais de metade do ecrã fica
  preta**. Já estava marcado pesado no `CLAUDE.md`; agora tem a prova.
- [x] **O Duelo é jogado, não lido** · **APROVADA 14/09 — virou S1**
  **3 cliques do menu ao resultado final**, sem um turno pelo caminho. E o
  vencedor aparece **antes** das 48 linhas de log das três quedas — não há
  uma única linha de tensão no modo inteiro. Queda a queda, com o resultado
  por último.
- [x] **A sala ao vivo precisa de um momento partilhado** · **APROVADA 14/09 — virou S2**
  Testado em duas abas reais: a escolha sincroniza em ~1 s, o **resultado
  não**. Um lado viu a luta inteira; o outro ficou 10 s parado sem aviso,
  sem luz, sem "o duelo aconteceu". Mecanicamente correto (os selos batem);
  como experiência, dois jogadores lendo o mesmo PDF em salas separadas.
- [x] **O jogador precisa de uma forma de se mover que não dependa do
  Narrador** · **APROVADA 14/09 — virou E2+E4** (o tabuleiro ganha endereço de xadrez, e a casa vira clicável)
  Três rodadas escrevendo "me aproximo" e o log só reportava o movimento do
  **inimigo**. Clicar numa casa dentro do próprio retângulo tracejado dourado
  não faz nada — a grelha não é clicável. Ao fim: `9 de 9 m nesta rodada`,
  **nunca andei um metro**, com o jogo mandando "aproxime-se primeiro".
- [x] **`Esc` fecha, e o fundo fecha, em toda sobreposição** · **APROVADA 14/09 — virou G1**
  **15 sobreposições, 4 regras de fecho diferentes**, e `Escape` não fecha
  nenhuma (há 6 `onKeyDown` no `src/` inteiro, todos `Enter`). O jogador
  descobre caso a caso se sai clicando fora, num `✕` de 10px, ou num botão
  âmbar de 48px. É fluxo, e mexe no que o jogador já aprendeu.
- [x] **A escala de texto vira tabela** · **APROVADA 14/09 — virou a Fase L**, com a régua da pessoa: tamanhos comprovados por plataforma
  **18 degraus de tamanho**, e **542 dos 1.107 textos dimensionados (49%) são
  9px ou 10px** — em JetBrains Mono, a fonte "do que é máquina", que tem 682
  usos contra 315 do corpo. O contraste da paleta passa AA com folga
  (`inkDim` sobre `panel` = 6,21:1), e é por isso que nenhum alarme
  automático dispara: a WCAG não tem piso de tamanho. 18 degraus → 6 ou 7, e
  o piso sobe. Encosta em identidade visual e em toda tela.
- [x] **O nó entre o Figma e o código custa um plano** · **RESPONDIDA 14/09 — virou a Fase M**: o caminho dos tokens não precisa de Code Connect (D3 provou a leitura no plano atual); os componentes ficam com convenção + varredor, que é pior e é declarado. Subir de plano deixa de ser bloqueio e vira melhoria · de: regente · 14/09 (achado em D3)
  D3 entregou as variáveis e as peças, mas **não o nó**, e não por perícia:
  `list_file_components_for_code_connect` responde, literalmente, *"You need
  a Dev or Full seat on an Organization or Enterprise plan to use Code
  Connect"*. O `whoami` explica — a equipe é **`tier: pro`** com assento
  Full; o assento existe, **o plano não**. Sem Code Connect, a biblioteca e
  o `ui.jsx` **podem divergir em silêncio**: nada liga um componente do
  Figma ao componente de código, e a única amarra é um script de comparação
  que alguém tem de lembrar de rodar. É **pesado** por duas razões da tabela
  do `CLAUDE.md`: custa dinheiro, e muda como esta mesa trabalha. A mesa não
  decide isto sozinha — e enquanto não for decidido, **toda etapa de design
  carrega o risco de as duas verdades se separarem sem ninguém notar**.

- [x] **A ação principal tem a mesma cara nos três modos** · **APROVADA 15/09 — a mesa decide** (*"decida como designer UX e designer de games experientes"*). D4 já mediu: 720 px² contra 1144×48. Uma forma só, nos três modos · de: desenho · 14/09
  "aja agora" é `<Botao primario pequeno>Agir →</Botao>` (mono 12px) em
  `historia`, faixa `tv-display` de 18px no torneio, e outra faixa
  `tv-display` de 18px com padding diferente em `rapida`/`duelo`. O
  `CLAUDE.md` diz que modo é *"lente sobre o mesmo motor, nunca um segundo
  jogo"*; visualmente, hoje, é um segundo jogo. Mover o que o jogador já usa.
  *(**D4 decidiu a forma, e o número ficou pior do que parecia:** `Agir →` =
  45×16 = **720 px²** contra `⚔ A PRÓXIMA LUTA` = 1144×48 = **54.912 px²** —
  **76×**, e as duas **na mesma tela, a três centímetros uma da outra**. Não
  é divergência entre modos: é dentro de uma tela, e o modo **padrão
  absoluto** tem a menor chamada do jogo. A decisão está escrita em
  `formas.md`: uma peça só, mesma família e mesmo tamanho de letra, a largura
  como variante. **O que continua da pessoa é executá-la** — subir o `Agir →`
  de 12px para 16px mexe no que o jogador já usa, e o `jogo` achou a
  armadilha: o campo do turno é um `<input>` onde `Enter` manda, e a peça
  nova é um `textarea` onde `Enter` quebra linha. **Trocaria em silêncio o
  gesto mais repetido do jogo.**)*

## A lei que a pessoa deu à mesa (14/09)

> *"Nós estamos criando um jogo. Apesar de seu coração ser em leitura,
> devemos fazer o máximo para ter a experiência de um jogo e que ele
> realmente está fazendo coisas — não só lendo e escrevendo."*

Isto não é um item: é a régua de toda proposta desta fila. Sempre que o
`jogo` e o `desenho` escolherem entre uma forma que **conta** o que
aconteceu e uma forma que **deixa o jogador fazer**, a segunda ganha — e o
que não puder ser feito deve ao menos ser **visto acontecendo**, não
recebido pronto em prosa. A prosa continua sendo a protagonista; o que se
recusa é que ela seja a **única** coisa que o jogador toca.

## A terceira lei da mesa (15/09)

A pessoa, ao aprovar O Pergaminho: *"gostei muito de que essa sugestão já veio
com uma proposta e inclusive muito bem fundamentada. Gostaria que todas
viessem assim se possível — não precisa ter uma explicação gigante nem nada
do tipo, mas vir com uma proposta e dizendo o porquê é muito bacana."*

Então **toda proposta traz as duas coisas, e em poucas linhas**: o que fazer,
e por quê. Nunca só o diagnóstico — *"a escala de texto está errada"* não é
proposta; *"18 degraus viram 6, o piso sobe para 13px, porque metade do texto
hoje é 9–10px e a prosa é a protagonista"* é. E nunca uma parede de texto: o
porquê cabe numa frase se a proposta for boa. Quem não sabe dizer por que,
ainda não terminou de pensar.

Vale para as duas mentes: o `conselheiro` e o `regente` cobram isto de quem
propõe.

## A segunda lei da mesa (14/09)

> *"Faça da forma que um experiente designer de UI e game designer fariam."*

Quer dizer: **decida.** Onde um profissional experiente decidiria sozinho —
o tempo de uma barra, o tamanho de um alvo de toque, a ordem de um leque, o
que não perguntar ao jogador — **decida e escreva o porquê**, em vez de
devolver a escolha. A pessoa não quer ser consultada sobre ofício; quer ser
consultada sobre o que muda o jogo dela. Perguntar demais é uma forma de
timidez, e a timidez já é o defeito.

## Aprovado pela pessoa — executa como fase, UMA etapa por ciclo

### Fase M — o caminho dos tokens (o Figma manda, o código obedece)
Proposta da pessoa (14/09): *"os agentes de design ganham liberdade total
para criar e alterar layouts no Figma, desde que usem estritamente as
Variáveis e Estilos nativos. Antes de codificar, o Claude Code lê esses dados
brutos direto do arquivo pelo MCP e atualiza automaticamente um único arquivo
de estilos globais no repositório. Os agentes de programação usam apenas as
classes desse arquivo centralizado, garantindo que qualquer alteração visual
feita pelos designers seja replicada de forma idêntica, eliminando a chance
de o código ficar diferente ou baseado em achismos."*

**É viável, e — o que importa — não depende do plano.** D3 já provou a
leitura: `get_variable_defs` puxou as 27 variáveis a frio e bateu **26/27**
contra `src/estilo.js`, com a única divergência sendo formato de alfa (o
Figma guarda num byte: `.45` volta `0,45098`; a regra é comparar com
tolerância de 1/255). **Code Connect é outra coisa** — ele amarra
*componentes*, exige Organization/Enterprise, e **este caminho não o usa**.

**Duas correções de rumo, ditas antes de custar tempo:**
1. **Não há `tailwind.config.js`.** O Tailwind entra pela CDN no
   `index.html`, então o "arquivo único de estilos globais" já existe e é
   **`src/estilo.js`** (criado em D2). Não se cria um segundo.
2. **A direção se inverte, e isso tem preço.** Hoje `estilo.js` é a fonte e
   o Figma é o espelho. Aqui o Figma passa a mandar, e o arquivo vira
   **gerado** — logo não pode ser editado à mão nunca mais, e o erro de um
   designer chega à produção sozinho. Por isso a catraca não é opcional.

- [ ] **M1 · o gerador** · de: pessoa · 14/09
  Um script que lê as variáveis do arquivo do Figma e escreve `src/estilo.js`
  inteiro — cabeçalho dizendo que é gerado, a origem, e a data. Roda por
  comando, não por mágica. Determinístico: rodar duas vezes sem mexer no
  Figma não muda um byte.
- [ ] **M2 · a catraca que impede o desastre** · de: pessoa · 14/09
  Com o Figma mandando, um engano lá vira produção aqui. Então o gerado
  **passa por prova antes de valer**: contraste de cada par texto/fundo
  dentro da norma, nenhum token sumido que alguém ainda importe, nenhum
  valor fora de faixa. `npm test` vermelho se regredir — e a regra do teto
  de alfa (1/255) escrita onde se compara, não na memória de ninguém.
- [ ] **M3 · a deriva denunciada** · de: pessoa · 14/09
  Um varredor que compara o `estilo.js` do repositório com o Figma **e
  reclama quando divergem** — é o que substitui o Code Connect na metade dos
  tokens: não impede a deriva, mas não a deixa acontecer calada. Entra no
  `rodar-tudo.mjs`.
- [ ] **M4 · os componentes, sem Code Connect** · de: pessoa · 14/09
  A metade que o plano cobraria: amarrar componente do Figma a componente de
  código. Sem a ferramenta, a amarra é **convenção + varredor** — nome igual
  dos dois lados, declarado em `mente/formas.md`, e um `check-` que falha
  quando um existe sem o outro. **É pior que Code Connect e é honesto sobre
  isso:** prova hoje, não impede amanhã. Se a pessoa um dia subir de plano,
  esta etapa é substituída, não remendada.

### Fase W — o turno por toque (a ação deixa a caixa de texto)
Duas propostas do `jogo` e do `desenho` em E1, **aprovadas pela pessoa em
15/09**. São a metade de desenho da Fase X do sistema, e andam junto com ela.

**O que se mede hoje:** uma rodada é abrir `Ações` (1 toque), tocar `Atacar`
(que **escreve `"Ataco "` na caixa**), digitar o alvo (~15 toques), tocar
`Agir →` — **e o golpe ainda pode não acontecer**. Sete turnos jogados, três
ataques declarados sem ambiguidade, **zero rolagens**. E gasta-se **uma
chamada ao Mestre** para uma IA descobrir que *"Ataco o ogro"* significa
atacar o ogro, que o motor já sabia.

- [ ] **W1 · a frase que se monta** · de: pessoa · 15/09
  O turno deixa de ser declaração digitada e passa a ser **verbo + alvo/casa,
  por toque**, com **o preço e o alcance antes do clique** — a lei do
  veredito antes do clique, e o conserto da recusa por distância que X1
  mediu (10/10 plantas recusam no turno 1, de graça).
- [ ] **W2 · o texto muda de emprego** · de: pessoa · 15/09
  O campo continua, e deixa de perguntar *"o que você faz?"* para ser
  **"diga alguma coisa"** — a provocação, a parlamentação, a fala. **A única
  proposta da fase que DEVOLVE quota ao Narrador** em vez de gastá-la: o
  Mestre narra o resultado uma vez por rodada, em vez de interpretar cada
  golpe. Conversa direto com a decisão da pessoa de travar o jogo quando ele
  cai — quanto menos o combate depende dele, menos dói o silêncio.

### Fase K — as três batidas da rodada (a reação ganha controle)
**Proposta do `jogo` em D4, aprovada pela pessoa em 14/09 — com o desenho
dela junto.** Hoje o jogador toca uma batida e meia: **seis reações gastam o
PM dele sem lhe perguntar** (`App.jsx:7572`). O argumento é estudo citado de
dentro de casa: `reacoes.js` escreve que no 5e e no BG3 metade da tensão do
combate mora na reação — e sete linhas depois entrega a decisão ao sistema.

**A forma, ditada pela pessoa:** *"um botão aparecendo (tipo um de rolagem de
dados) com uma barra de tempo ou timer, e ele tem alguns segundos para sumir.
Se o player apertar no botão, aparecem as opções para escolher qual será a
reação ou se não irá reagir. Caso o tempo passe e o player não tenha clicado,
o turno de reação acaba. Ele deve poder escolher também uma reação padrão ou
não reagir, caso não queira gastar PM."*

- [x] **K1 · o momento desenhado** · **FEITO 15/09 · v9.256** — o momento inteiro
  está desenhado no Figma e escrito em `formas.md`. **A chamada dura 4 000 ms** (1,5 s
  de reconhecer + 0,5 s de Fitts, dobrados para quem não estava a olhar), **o leque
  não expira** e por isso **não tem trilho**; sob `prefers-reduced-motion` a janela
  dura **mais** 1 000 ms, porque *uma barra lê-se de canto de olho e um numeral exige
  fixar* — a lei vira número em vez de promessa. **O caso comum resolve-se num
  toque:** 12 classes em 12 têm exactamente uma reação de `sofre_dano`, e o toque
  que revelava uma lista de um item morreu. O **recuo está no primeiro degrau**
  (hoje ignorar a janela **gasta PM**), a **preferência é uma fila de quatro pílulas
  na ficha** (e é a conformidade WCAG 2.2.1 da fase), e a janela **resolve-se no
  sítio** antes de ir ao log, que fica byte a byte o de hoje. No telefone o caso
  comum tapa **zero** do campo. Peças: `O chamado` (`62:2453`), `O verbo com preço`
  (`64:2446`), três glifos, e *A pergunta que expira* de 4 para 8 variantes.
  · de: pessoa · 14/09
  `jogo` e `desenho` em par, no Figma: o botão que chama, a barra que corre,
  o leque de opções, o estado de "não vou reagir", e a preferência
  (reação padrão / nunca me pergunte). **Duas decisões de desenhista
  experiente que a etapa tem de tomar, não perguntar:** quanto tempo a barra
  dura (e o que acontece com quem lê devagar — o tempo tem de ser
  configurável ou generoso, e `prefers-reduced-motion` não pode virar
  desvantagem de jogo), e como isto se comporta no celular, onde o polegar
  não está sobre o botão.
  *(**Meio caminho andado em E1: a peça existe.** *A pergunta que expira* foi
  fabricada — Figma `31:518`, 4 variantes (*Etapa* Chamando · Escolhendo ×
  *Tempo* Barra · Contagem). Era dívida declarada de D4, deixada por fazer
  porque *"peça feita para decisão não tomada é trabalho inventado"* — **a
  pessoa aprovou a Fase K em 15/09, a condição da dívida caiu, e manter a
  dívida passou a ser o erro**. Três decisões já vêm dentro dela: **o eixo
  *Tempo* É a saída por `prefers-reduced-motion`**, feito variante em vez de
  nota de rodapé justamente para não ser esquecido no dia de construir; **o
  tempo nunca aparece em segundos na variante *Barra*** (contagem regressiva no
  meio de uma narrativa é o sistema a falar de si mesmo); e **a trava K2 está
  escrita na própria peça** — *quem não responde tem o de hoje, byte a byte*.
  E E1 reservou-lhe o lugar na tela de batalha com um número: ela mora na
  **linha do veredito**, **sobrepõe e nunca empurra** (empurrar move as casas
  que o jogador está a ler no segundo em que tem de decidir depressa), e cresce
  para cima, ancorada em baixo — o topo do campo e a câmara nunca se mexem.
  **O que continua a faltar a K1 é o número do tempo**, que depende do ritmo da
  rodada e é do `jogo`.)*
- [ ] **K1b · o relógio de 15 s, e o que ele cobra** · de: pessoa · 15/09
  **Decisão da pessoa (15/09):** a janela sobe de 4 s para **15 s** — *"pra
  que fique tranquilo até pra pessoas com dificuldade"* — e **o dano fica
  em segredo**. K1 tinha decomposto os 4 s (1,5 s de reconhecimento + 0,5 s
  de Fitts, dobrados); os 15 s são folga deliberada, e a folga é o ponto.
  **O que a etapa tem de resolver, e não é a pessoa que decide — é ofício:**
  o relógio dispara **por golpe recebido**, e numa rodada com quatro
  inimigos 15 s viram **até um minuto de espera** por rodada. Medir isso e
  desenhar a saída: a janela só corre quando há **de fato** reação possível
  (PM disponível, reação ainda não gasta na rodada), golpes do mesmo turno
  se agrupam em vez de enfileirar, e quem já respondeu não é perguntado de
  novo. **A folga é para quem precisa dela, não um pedágio para todos.**
  Catraca: o tempo total de espera por rodada tem teto medido, e a suíte o
  prova com quatro inimigos na mesa.
- [ ] **K2 · a trava, antes de tudo** · de: pessoa · 14/09
  **Quem não responde, o sistema responde como hoje.** Regressão zero é
  condição de entrada, não consequência feliz: o jogo tem de continuar
  jogável exatamente como é para quem ignora o botão, para quem joga sem
  mouse, e para quem está numa aba lenta. Prova antes de a peça existir.
- [ ] **K3 · a reação acontece** · de: pessoa · 14/09
  Construir. **Precisa do bastão do `App.jsx`** — e é a ocasião de levar o
  que der para arquivo próprio. O PM só sai da ficha quando o jogador
  escolheu, ou quando a preferência dele disse que sim.
- [ ] **K4 · medir a batida** · de: pessoa · 14/09
  Quantas reações o jogador de fato escolhe, quantas expiram, quanto tempo
  ele leva, e se o combate ficou mais longo. **Se a batida nova cansar em
  vez de tensionar, isso aparece no número** — e a etapa diz, em vez de
  defender o que construiu.

### Fase E — a batalha tem tela, e o tabuleiro tem endereço
Decisão da pessoa (14/09): *"seria interessante uma tela para a batalha,
pois é um momento importante e a maioria das outras funções ficariam
inúteis — quando entrar em batalha, uma tela só com o grid e as funções de
batalha e utilitários."* E, para o mover: *"nosso grid pode ter letras e
números, tipo um tabuleiro de xadrez, então se um player disser 'vou até
H20' não teria a confusão que 'me aproximo do…' causa."*

Duas decisões que se resolvem juntas, porque a segunda só faz sentido na
primeira: hoje **o campo de 16×16 nunca foi visto inteiro**, vive num
scroller de 301px, e o painel `Ações` abre abaixo da dobra.

- [x] **E1 · a tela desenhada antes de existir** · de: pessoa · 14/09 · **feito v9.254**
  `jogo` e `desenho` **em par**, no Figma: o que a tela de batalha mostra e
  o que ela esconde, onde fica o tabuleiro, onde ficam as ações, o que
  acontece ao entrar e ao sair dela. O `jogo` decide o momento da troca (a
  batalha começa e a tela vira); o `desenho`, a forma. Nada de código.
  **Prova de entrada:** a proposta tem de caber em 1280×860 **e** num
  celular — a pessoa citou a plataforma como critério (ver a Fase L).

  **FEITO (15/09).** Página `A batalha` no Figma (`30:12`, **475 nós**) com
  cinco quadros, mais **quatro peças novas** do `desenho` (A régua, A vez, A
  ficha curta, A pergunta que expira). A forma decidida está em
  `mente/formas.md` — *A tela da batalha*; a conta inteira, em `mente/e1-jogo.md`
  (o momento) e `mente/e1-desenho.md` (a forma). **Nenhum `.jsx` foi tocado.**
  **Três coisas que se souberam ao medir e mudam as etapas seguintes:**
  (1) **o campo não é 16×16 — são dez plantas**, de 7×18 a 18×12, e qualquer
  desenho que resolvesse uma quebraria noutra; (2) **os 429 px não são altura,
  são arquitetura** — `PainelCombate` (`App.jsx:20510`) é montado **dentro** do
  rolador do log (`:20459`) e por construção abre no fim dele, o que torna a
  inversão **condição de entrada de E3**; (3) **a gramática do endereço já
  existe** (`coordenadas.js:151`), e por isso **E2 não fabrica tabela nova** —
  lê desta.
  **Números:** **1232 de 1280 px viram jogo (96,3%)** contra os 560 de hoje; a
  casa passa de 23,8–36,6 px para **48** (nenhum tamanho de hoje chega aos 44 de
  WCAG 2.5.5 / HIG / Material); no telefone, **70 casas sempre na tela**, e
  **76 px voltam de graça** por não haver trilho de abas.
  **Três buracos declarados:** `inkDim` sobre casa acesa reprova o AA por
  **0,03**; a moldura apagada dá **1,38:1** (a palavra carrega o estado); e o
  fundo do tabuleiro `#141020` está a **1,04:1** de `T.bg` — literal solto que
  a catraca conta **e** que quebra o vão do anel de foco. Trocá-lo por `T.bg`
  paga os dois, e é item barato de E3.
- [ ] **E2 · o endereço do tabuleiro** · de: pessoa · 14/09
  Colunas por letra, linhas por número. É o que torna *"vou até H20"*
  possível — e resolve, de quebra, a pendente de que **o jogador não
  consegue se mover**: hoje a grelha não é clicável e escrever "me aproximo"
  três rodadas não anda um metro. O endereço serve aos dois caminhos: o
  clique na casa e a frase escrita. Cuidado do `backend`: a conversão
  endereço↔coordenada é **regra**, sai de tabela e é provável em Node —
  não nasce dentro da tela.
  *(**E1 achou a tabela, e ela já existe**: `src/coordenadas.js:151` define
  `LETRAS_DA_GRADE = "ABCDEFGHIJKLMNOPQRST"` e `gradeDe()` devolve letra +
  (linha+1) — **A1 no canto superior esquerdo, sem letra saltada**, e as 20
  letras cobrem as dez plantas de `grid.js`, cuja maior largura é 18. É a grade
  do **ermo**, mas é a mesma pergunta e já tem resposta escrita. **E2 lê desta
  tabela e não fabrica a segunda** — duas tabelas de letras no mesmo jogo é a
  doença da casa um andar abaixo. Duas condições de E1: o log tem de **escrever
  o endereço de volta** (`você avança até H20`), senão o jogador nunca o
  aprende; e os endereços do **mundo** e do **tabuleiro** nunca aparecem na
  mesma tela.)*
- [ ] **E3 · a tela existe** · de: pessoa · 14/09
  Construir o que E1 desenhou. **Precisa do bastão do `App.jsx`**, e é a
  oportunidade da fila: cada pedaço da batalha que sair do App para um
  arquivo próprio compra independência permanente. Mover vale mais que
  remendar.
  *(**A condição de entrada, achada em E1, e sem ela nenhuma medida do desenho
  se cumpre:** o tabuleiro tem de **sair de dentro do rolador do log**.
  `PainelCombate` (`App.jsx:20510`) é montado dentro do `<div ref={areaRef}>`
  aberto em `:20459`, **depois de todas as mensagens** — o tabuleiro é filho do
  log e por construção abre no fim dele. Os **429 px abaixo da borda** não são
  um número de CSS a afinar: são essa árvore. **Nenhum ajuste de altura
  resolve; só a inversão resolve** — e é exatamente o caso em que mover vale
  mais que remendar. Item barato que vem de brinde: o fundo do tabuleiro
  `#141020` vira `T.bg`, o que tira um literal da catraca **e** devolve o vão
  do anel de foco.)*
- [ ] **E4 · mover é fazer** · de: pessoa · 14/09
  A casa clicável, o endereço escrito, o alcance visível antes do passo (o
  veredito antes do clique), e o log dizendo o que **você** fez — não só o
  que o inimigo fez. Medir: quantas rodadas o jogador consegue se mover de
  fato, contra as zero de hoje.
  *(**corrigido em D3**, e a correção muda o pedido: "a grelha não é
  clicável" está **errado**. Cada casa alcançável já é `role="button"
  tabIndex=0` com `onMover` — `grade-de-batalha.jsx:512-517`. **O clique
  funciona; o que não existe é FORMA**: o alvo é um
  `<rect fill="transparent">`. O pedido deixa de ser "torne clicável" e
  passa a ser "dê forma ao que já clica" — que é mais barato e é outra
  etapa.)*
  *(**E1 deu-lhe a forma, e deixou-lhe uma condição.** O canal que E4 tem de
  abrir é o do **telefone**: hoje a rota prevista só existe em `onMouseEnter`
  (`grade-de-batalha.jsx:543`) e a única descrição da casa é um `<title>` de
  SVG (`:520`) — **dois canais de rato, num jogo que se joga com o dedo**. A
  decisão de E1, e ela é regra: **o custo nasce escrito dentro da casa já em
  *Alcançável***, em mono 10 px, e o endereço só aparece nos dois estados que já
  carregam texto (*Sob o dedo* e *Confirmando*) — **86 endereços acesos ao
  mesmo tempo é a planilha**. E o veredito completo vive na **linha** sob o
  campo, nunca num balão: quatro segundos de balão tapam exatamente as casas
  para onde o jogador ia andar.)*

- [ ] **E5 · o tabuleiro conta o que o inimigo VAI fazer** · de: pessoa · 15/09
  **Aprovada em 15/09.** Experiência jogada: numa luta inteira o `jogo` fez
  **zero decisões espaciais**, porque nada no campo pagava por estar num
  sítio em vez de noutro. Antes do turno do inimigo, **as casas que ele
  ameaça acendem**, com o alvo escrito — o jogador vê e decide: sair,
  cobrir-se, aceitar. **O porquê que a torna barata:** a regra já está toda
  lá (paredes com cobertura, terreno que cobra, alcance por tamanho, golpe
  livre por dar as costas) — falta o jogador poder usá-la. Um tabuleiro onde
  a posição não muda nada é um tabuleiro decorativo.
  Cuidado herdado da Fase N: o que o campo mostra é **a intenção do degrau
  daquele inimigo**, não onisciência — um bruto não telegrafa um plano que
  não tem.

### Fase S — o Duelo e a sala ganham momento
Decisão da pessoa (14/09) sobre as duas: *"vamos corrigir."*

- [ ] **S1 · o Duelo é jogado, não lido** · de: pessoa · 14/09
  Hoje: **3 cliques do menu ao resultado**, e o vencedor aparece **antes**
  das 48 linhas de log. Queda a queda, com o resultado por último — e o
  jogador tocando alguma coisa entre uma queda e outra. O motor não muda:
  a luta já é determinística e já está calculada; o que muda é **quando o
  jogador fica sabendo**.
- [ ] **S2 · a sala ao vivo tem um momento partilhado** · de: pessoa · 14/09
  Medido em duas abas reais: a escolha sincroniza em ~1s, **o resultado
  não** — um lado viu a luta, o outro ficou 10s parado sem aviso. Os dois
  lados precisam ver *o duelo acontecendo*, ao mesmo tempo. Cuidado: o
  protocolo da sala (`api/sala`) é **pesado** — se a solução exigir mudá-lo,
  volta à pessoa.

### Fase G — os gestos que o jogador já conhece
Decisão da pessoa (14/09): *"vamos corrigir também."*

- [ ] **G1 · `Esc` fecha, e o fundo fecha** · de: pessoa · 14/09
  **15 sobreposições, 4 regras de fecho, e `Escape` não fecha nenhuma.**
  Uma regra só, em todas: `Esc` fecha, clique no fundo fecha, e o `✕` tem
  uma forma só (hoje são 8 visuais e 4 tamanhos). Catraca: nenhuma
  sobreposição nova nasce sem as duas saídas.
- [ ] **G2 · "não pode agora" recusa, e DIZ POR QUÊ** · de: pessoa · 14/09
  Achado de D1, da mesma família: **8 opacidades diferentes**, mas
  `cursor: not-allowed` aparece **4 vezes no projeto inteiro**.
  *(**corrigido em D3**: "a maioria continua clicável" está **errado**. Dos
  36 botões com opacidade condicional, **33 têm `disabled`** — o navegador
  recusa de verdade. **O defeito não é o clique fantasma, é o SILÊNCIO.**
  E o `jogo` mediu o que dói: `bloqueado = carregando || !!rolagem` governa
  **15** controles, e "o Mestre está escrevendo", "há um dado esperando" e
  "proibido para sempre" saem hoje **no mesmo cinza**. O `Agir →` carrega
  três razões na mesma cara. Então a etapa deixa de ser sobre o cursor e
  passa a ser sobre **a peça ter onde escrever a razão** — o que a
  biblioteca de D3 agora tem.)*

### Fase L — a letra, medida por plataforma
Decisão da pessoa (14/09): *"nosso texto precisa ter padrões e tem que ser
pensado na experiência do usuário em qual plataforma ele está usando; um
celular não deve ter letra muito pequena, mas ao mesmo tempo não muito
grande para não tomar muito espaço. Use tamanhos comprovados pra cada
plataforma."*

- [ ] **L1 · a escala, com fonte citada** · de: pessoa · 14/09
  Hoje: **18 degraus de tamanho, e 542 dos 1.107 textos (49%) são 9px ou
  10px** — em JetBrains Mono, a fonte "do que é máquina", que tem 682 usos
  contra 315 do corpo. Nenhum alarme dispara porque a WCAG não tem piso de
  tamanho; o contraste passa. A escala vira **tabela**, com um degrau por
  papel (prosa, rótulo, número, título) e **dois valores por degrau: toque
  e ponteiro**. *Comprovado* aqui significa **citar a origem** de cada piso
  (as diretrizes de plataforma e de acessibilidade que o `desenho` for
  buscar), não escolher por gosto — e o corpo de leitura é o degrau mais
  importante, porque a prosa é a protagonista.
- [ ] **L2 · a mesma tela nas duas mãos** · de: pessoa · 14/09
  Aplicar a escala e **provar nas duas plataformas** com a mesma tela lado
  a lado — o `desenho` tem as ferramentas de janela para emular o celular.
  Medir o que a pessoa citou como critério: legível sem apertar os olhos,
  e sem comer o espaço da cena. A fonte de máquina volta ao seu lugar: o
  que é número é mono, o que é prosa não.

### Fase D — a casa ganha um desenho (a mesa de design nasce)
Decisão da pessoa (14/09): três agentes novos — `jogo`, `desenho`, `aprendiz`
— trabalhando pelo Figma, com liberdade para mudar o que for preciso **desde
que comprovado**. Meta declarada: *"o melhor jogo de RPG com a melhor
experiência e qualidade de um AAA."*

Esta fase **não faz nada bonito ainda**, e é de propósito: ela constrói o
chão que impede o defeito que a pessoa nomeou (a mesma ação com duas caras).
Medir antes de mexer, como a Fase A ensinou — aqui aplicado ao visual.

- [x] **D1 · o inventário honesto** · de: pessoa · 14/09 · **feito v9.242 · `06e1fa9`**
  O retrato saiu, e quase todo número escrito aqui estava errado: `T` tem
  **14** cores (não 15); o `App.jsx` tem **93** literais de cor (não 30) e o
  projeto de tela tem **242**, dos quais **67 já são cores de `T`**
  disfarçadas; `FONT_CSS` tem **13** classes de animação (não 7) e só **3**
  com saída por `prefers-reduced-motion`; `ui.jsx` cobre **6,8%** dos
  controles (218 `<button>` crus contra 16 `<Botao>`). E o achado que a fase
  existe para achar: **10 famílias de ação com mais de uma forma, 4 delas de
  significado.** Medição inteira no diário. Correções de D2–D5 abaixo saíram
  daí.
- [x] **D2 · o estilo ganha casa própria** · de: regente · 14/09 · **feito v9.244 · `5cf555c`**
  `T` foi para `src/estilo.js` (que **não importa nada**), com reexport
  compatível em `constantes.js` — os 15 importadores não mudaram uma letra.
  A folha partiu em três: `FONT_CSS` (4 regras: o `@import` e as três
  famílias), `MOVIMENTO_CSS` (30: os 13 `@keyframes`, 16 classes e o
  `prefers-reduced-motion`) e `SUPERFICIES_CSS` (11: a barra de rolagem, o
  trilho de abas e o mural). Quem soma é `FOLHA`, **no `estilo.js`** —
  ordem de folha é regra de cascata, e regra não mora no `App.jsx`, que
  mudou exatamente duas linhas.
  **A contagem de D1 estava certa mas media outra coisa:** são **35**
  literais de cor na folha, não 21 — 21 próprios (os que D1 contou, dentro
  do bloco das superfícies) **mais 14 que já são cores de `T`**, que D1 não
  contou e são justamente as que interessam a D5b. Saíram 13 para a tabela
  nova `MATERIAIS` (a paleta **física**, irmã de `T` que é a **semântica**),
  8 pretos/brancos para os moldes internos `sombra()`/`brilho()`, e 1 hex
  (`#2E2745`, o polegar da barra) virou `${T.line}`. As 13 `rgba()` que já
  são `T` com alfa ficaram — esperam o helper `alfa()` de outro ciclo.
  **A prova de "zero diferença na tela"**, que é a única linha desta etapa:
  o *próprio parser do navegador* leu a folha de antes e a de agora e
  devolveu **as mesmas 45 regras, multiconjunto idêntico, zero divergência
  nos dois sentidos** — só a barra de rolagem mudou de posição (índice 11 →
  35), de propósito e sem colidir com nada.
  A armadilha do `T` do torneio (`App.jsx:10205` e `:10222`) **não chegou a
  existir**: nenhum ponto de uso de `T` no App foi tocado, porque o
  reexport tornou o regex desnecessário.
- [x] **D3 · a biblioteca no Figma, e a estrada de volta** · de: pessoa · 14/09 · **feito v9.246 · `0e3ee81`**
  **A resposta à pergunta da pessoa: a troca é de mão dupla nas VARIÁVEIS, e
  não existe nos COMPONENTES.** Arquivo `Taverna — biblioteca`, `fileKey`
  `e5wJUzInAssoebx5npssKc` — **um só; amplie este, não crie o segundo**.
  27 variáveis (14 de `T`, 13 de `MATERIAIS`) e 5 peças (Botão com 18
  variantes, Fechar, Selo, Barra, Sobreposição), todas ligadas a variável.
  O ida-e-volta bateu **26/27**, e a prova não é a contagem: é que trocar
  `amber` **dentro do Figma** para um valor impossível fez a comparação
  acusar sozinha, e restaurar devolveu o verde. A única divergência é de
  formato — **o Figma guarda alfa num byte**, então `rgba(4,3,8,.45)` volta
  `#04030873` (0,45098). Regra: **alfa que não for múltiplo exato de 1/255
  não sobrevive à volta; compare com tolerância de 1/255, nunca por texto**.
  **O Code Connect não foi feito porque NÃO É EXECUTÁVEL NESTA CONTA** — ver
  o item novo em "Para a pessoa decidir" logo abaixo. Sem ele, o que segura
  o Figma e o código juntos é a comparação por máquina, que **prova hoje e
  não protege amanhã**.
  *(reescrita em 14/09, depois da pergunta da pessoa: "a interação com o
  Figma está sendo uma troca dos dois lados ou apenas estamos usando as
  ferramentas do Figma?" — a pergunta certa, e a resposta até aqui era
  ZERO: D1 e D2 não puseram um pixel lá.)*

  **O teste de que a troca existe é um só: uma mudança feita NO Figma
  chega ao código sem ninguém reescrevê-la à mão.** Se a etapa terminar
  sem isso provado, ela terminou como arquivo bonito, não como terceira
  mente. Então D3 entrega três coisas, nesta ordem:

  1. **As variáveis, e a volta delas.** Criar o arquivo do Taverna e nele
     as variáveis espelhando `T` e `MATERIAIS` (`figma-create-new-file` é
     pré-requisito obrigatório do `create_new_file`; `figma-generate-library`
     junto de `figma-use`). Depois **puxar de volta com `get_variable_defs`
     e comparar com `src/estilo.js`** — ida e volta, mesmo valor. É o par
     mais barato de provar e o que torna a paleta editável no Figma.
  2. **Os componentes que têm a que se amarrar.** *(medido em D1: `ui.jsx`
     cobre **6,8%** dos controles — 218 `<button>` crus contra 16 `<Botao>`.
     Uma biblioteca espelhando `ui.jsx` cru amarraria quase nada.)* Entram
     as primitivas com **≥2 leitores reais**, mais os cinco controles que
     D1 provou existirem sem primitiva — **destrutivo, fechar,
     sobreposição, badge de estado, barra**. Ficam de fora os quatro ícones
     mortos. E fique dito: **`:focus-visible` tem zero ocorrências no
     projeto** — desenhar o estado de foco é inventar, não espelhar;
     legítimo, mas é desenho novo e vai para `formas.md` como tal.
  3. **O Code Connect, que é o nó.** Amarrar cada componente do Figma ao
     componente de código, para que não possam divergir em silêncio. Onde
     não houver componente de código a que amarrar, **diga** — é dívida a
     pagar extraindo primitiva, e é o que justifica o hábito de tirar tela
     do `App.jsx`.

  **O que a etapa deve relatar, sem enfeite:** quais direções funcionaram
  de verdade, quais foram só de ida, e quanto da biblioteca ficou sem nó.
  Uma troca de mão única declarada vale mais que uma troca de mão dupla
  suposta.
- [x] **D4 · as formas escritas** · de: pessoa · 14/09 · **feito v9.249 · `e8b4c32`**
  `mente/formas.md` deixou de estar vazio: **30 formas declaradas**, cada uma
  com `quando` (do `jogo`, palavra por palavra) / `forma` / `movimento` /
  `onde vive` / `por quê` / `peso`, nomeadas **pelo verbo do jogador**.
  **29 das 30 levam `[ainda não existe]`** em *onde vive* — e a única que
  existe em código existe **errada** (`ui.jsx:27`, `opacity: 0.4`). Seis são
  **ações sem controle**, a maior sendo **reagir ao golpe** (6 reações com
  custo em PM, e `escolherReacao` gasta o PM do jogador sozinha,
  `App.jsx:7572`). Os **15 controles sem rótulo** (9 mudos) entraram numa
  tabela com o verbo certo de cada um.
  **As 4 divergências de significado fecharam por escrito, com os dois lados
  e quem cedeu em quê** — e a quinta, a *escala de cerimônia* aberta desde
  D3, fechou com a regra antes da lista. A biblioteca do Figma foi de **8
  para 13 páginas** (A casa, A escolha, O interruptor, A linha, O realce),
  mais dois eixos novos e a **correção da peça de D3** cujo *Impedido* dava
  **1,19:1** e agora dá **6,62:1**.
  **O achado que pagou o ciclo:** a peça nova do campo de escrita seria um
  `textarea` onde o campo do turno é um `<input>` com `Enter → agir`
  (`App.jsx:21216`) — adotá-la sem regra **trocaria em silêncio o gesto mais
  repetido do jogo**. Virou condição de aceitação, não nota de rodapé.
  **Cinco afirmações de D1 caíram** (o `🎲` tem estado, o `✕` tem 6 tamanhos,
  são 10 assinaturas de âmbar, os véus têm 4 desfoques, e o `⤢ ampliar` não é
  mudo — **é mentiroso**: corta 33% do campo). Medição inteira no diário.
- [x] **D5 · a catraca do desenho** · de: pessoa · 14/09 · **feito v9.252 · `73813da`**
  *(reescrita por D1: como estava, era impossível. "Nenhuma cor literal fora
  da tabela" são **242 violações** hoje — e 71 delas são o pergaminho, um
  sistema legítimo à espera de nome; a regra ainda bate em `constantes.js`,
  ou seja **a tabela violaria a própria regra**. "Nenhum controle sem forma
  declarada" são **218 `<button>`** sem nenhum mecanismo de marcação que
  ligue um ao outro.)*
  `check-formas.mjs` entra no `rodar-tudo.mjs` em **três dentes que fecham
  em ordem, cada um verde no dia em que nasce**:
  - **D5a · a catraca do teto.** Grava a contagem atual de literais por
    arquivo (`App.jsx: 93`, `painel-mapa.jsx: 41`, …) e **falha se qualquer
    número subir**. Zero perdões, verde hoje, e a dívida só desce. É o molde
    de `varredura-*` que a casa já usa.
  - **D5b · a catraca do fácil.** Falha se aparecer literal que **já é uma
    cor de `T`** (hex idêntico, ou `rgba` com o RGB de `T`). Zero perdões
    assim que "os 80 literais que já são `T`" rodar.
    *(corrigido por D2: eram 67 quando a folha não era varrida; agora que
    ela mora em `src/estilo.js`, entram as **13 `rgba()` de dentro da
    folha** que já são `T` com alfa — 7 no `MOVIMENTO_CSS`, 6 no
    `SUPERFICIES_CSS`. **D5b depende do helper `alfa(cor, a)`**: sem ele o
    único jeito de calar a catraca é perdoar `estilo.js` inteiro, e uma
    catraca que perdoa a própria tabela não protege nada.)*
  - **D5c · a catraca do movimento.** Toda classe de animação em
    `MOVIMENTO_CSS` tem de aparecer no bloco `prefers-reduced-motion`.
    Zero perdões desde o primeiro dia, depois do item do movimento.
  **Escopo obrigatório: `src/**` + `index.html` + `api/*.js`.** Nunca o
  repositório inteiro — `testes/render-teste.mjs` é um bundle esbuild
  commitado com uma cópia de `T` e 56 hex, e daria 56 falsos positivos.
  A cláusula *"nenhum controle sem forma declarada"* **sai de D5** e vira
  etapa própria depois de D4 e de "`ui.jsx` ganha o que falta": só se pode
  exigir que todo controle tenha forma quando existir a primitiva que a
  carrega.

  **FEITO (15/09).** `testes/check-formas.mjs`, 585 linhas, 0,27 s, **10 ok ·
  0 falhas** no dia em que nasceu — e entra sozinho no `rodar-tudo.mjs`, que
  descobre `check-*.mjs` por si. D5a **332** literais em 17 arquivos; D5b **80**
  (e 80 é, exatamente, o item da pauta que o zera); D5c **13 classes, 3 com
  saída**. A medição **reproduz D1 byte a byte** — 93 no `App.jsx` (40 hex + 53
  rgba), 242 nos arquivos de tela, 67 no recorte de D1. Única divergência,
  escrita em vez de explicada: D1 anotou 78 nos módulos de dado e medem-se 77;
  não se achou o fantasma.
  **A lei que a catraca carrega é folga ZERO nos dois sentidos** —
  `medido === teto`, e em D5c igualdade de conjuntos. Com `<=` o teto vira
  orçamento; com igualdade o número é sempre verdade. Daí a regra
  **anti-cemitério**: um perdão que já não é preciso **falha** a catraca
  (`PERDÃO MORTO`, `ENTRADA MORTA`), e a falha de `DESCEU` **imprime a linha
  pronta para colar** — a única falha do projeto que é uma boa notícia.
  **E ela foi provada contra o erro: 20 sabotagens, 14 morderam e 6 passaram,
  todas como previsto** — incluindo as que ela **tem** de deixar passar (afinar
  o pergaminho, uma cor de cabelo nova, a 15.ª cor de `T`, cor em comentário,
  `rgba()` composta por variável). Detalhe inteiro no diário.
  **A discordância `desenho` × `jogo` sobre a cor de dado de jogo fechou por
  escrito em `mente/formas.md`**, com os dois lados: os módulos de dado ficam
  fora de D5b **por escopo, não por perdão**, e dentro de D5a. E foi o número
  que confirmou o recorte — 99 menos os 19 de dado dá **80**.
  **Quatro buracos declarados com número**, porque buraco calado é mentira: 1
  nome CSS, 18 `transition` fora da folha, **o contraste** (o `#fff` 3,42:1 de
  `App.jsx:2541` que nenhum dos três dentes vê) e 2 animadores em JS.
- [ ] **D6 · o sistema para de falar de si mesmo** · de: jogo · 14/09
  *(etapa nova, nascida de D1 — o `jogo` jogando achou a lei mais partida do
  dia, e ela não cabia em D5 como estava escrita.)*
  **13 strings de bastidor chegam à tela**, com a quota de API do autor à
  cabeça: `Limite diário alcançado (500 chamadas)… me avise: o teto sobe`
  (`api/_portao.js:174`), `sem gastar tokens` (`App.jsx:2796`), `semente` e
  `selo da luta` (`:4491`), `roster` ×4 (`:4402, 4416, 4461`), `o modelo
  forte` (`:3682`), `o sistema está traduzindo` (`:3770`), `espinha`
  (`:3587`), `tabelas geradoras` (`:3557`), `canal` (`:4381`). Limpar as
  strings, e **`check-formas.mjs` ganha um quarto dente**: lista negra de
  vocabulário de bastidor nas strings renderizadas (`token`, `semente`,
  `seed`, `selo`, `roster`, `preset`, `postura`, `modelo`, `prompt`,
  `canal`, `chamadas`, `o sistema`, `tabela`), com perdão escrito — e
  `api/*.js` **tem** de entrar no varrimento, porque a pior string de todas
  vem de lá e chega inteira ao jogador. Uma cor errada faz o jogo feio;
  `sem gastar tokens` no inventário faz o jogo deixar de ser um jogo.

  **Depois de D5**, a mesa propõe livremente pela pauta — a animação do
  dado, a batalha que toma a tela (essa é `pesado`, da pessoa), a paleta, o
  que for. Antes de D5, cada melhoria custaria o dobro e apodreceria na
  metade do tempo.

## Aberto (leve / médio — o ciclo pega daqui, o de maior valor primeiro)

_Os quinze abaixo saíram da medição de D1 (14/09). A ordem é por retorno:
o barato e mecânico primeiro, o que precisa de decisão depois. Vários só
fecham de verdade **depois de D2 e D5** — o item diz quando._

**Os quatro primeiros nasceram em E1 (15/09)** e são defeitos de **peça**, não
de tela: E3 vai montar com estas peças, e cada um deles vira um defeito no
código no dia em que for montado.

*(Três pedidos de E1 **não** estão nesta lista porque foram **pagos dentro da
própria etapa**, e vale dizer o que eram: `Botao` *Impedido* era **19 px mais
alto** que *Repouso* e **empurrava o tabuleiro** ao ficar indisponível — passou
a ter **uma altura por `Papel`×`Tamanho`**, com a linha da razão reservada nos
quatro estados, e ela não é espaço morto: é onde `A Consequência` do preço se
senta; `Barra de medida` tinha o trilho fixo em 90 px e truncava `17/20` em
`17/` no telefone — agora estica e encolhe, com o trilho a ir de 285 px a
**48** entre 359 e 120 de caixa, porque **quem absorve é o trilho, o único
elemento cuja largura não carrega informação**; e `A marca de borda` foi
**fabricada** — `53:43`, 8 variantes.)*

- [ ] **a razão sai do `Botao` e passa a ser sempre `A Consequência`** · médio · de: desenho · 15/09 (E1)
  É o fim de linha do achado de E1: o nó *"a razão"* do `Botao` existe só nas 12
  variantes em que ele **recusa**, e os tons *Impedimento* e *Espera* de
  `A Consequência` existem exatamente para isso — **foram construídos duas vezes
  por acidente**. O `desenho` **recusou fazê-lo nesta rodada, com motivo, e a
  recusa está certa:** `A linha` (`22:46`) compõe **quatro** instâncias de
  `Botao` que dependem de `a razao` e `mostrar a razao`, e apagá-las mudaria
  calada uma peça que o `jogo` não reviu. ***Peça mudada em silêncio por baixo
  de uma composição é pior do que peça com espaço reservado.*** Fecha quando o
  `jogo` rever `A linha`.
- [ ] **o eixo *Largura* do `Botao`** · médio · de: desenho · 15/09 (E1)
  `formas.md` diz que *Largura* é variante (*"cabe no conteúdo"* / *"ocupa a
  linha"*); no Figma o conjunto tem `Papel × Estado × Tamanho` **e nada mais**.
  Em *A pergunta que expira* os botões ocupam a linha **por sobreposição na
  instância**, que é a definição de um eixo em falta. **Não foi pago em E1 de
  propósito, e o motivo é um número:** o eixo leva o conjunto de 24 para **48**
  variantes, acima do teto de 30 que a disciplina de biblioteca recomenda; e a
  alternativa — mexer na estrutura interna das 24 — **mudaria calado toda
  composição que já as usa**, incluindo *A linha*. Pesa porque a condição 2 de
  *A linha* (*"no telefone a chamada ocupa a largura"*) depende dele.
- [ ] **a masmorra 7×18, o caso que nenhum quadro mostra** · leve · de: jogo · 15/09 (E1)
  Das dez plantas, **nove aparecem inteiras** no arranjo de duas colunas; a
  masmorra 7×18 transborda **58 px — uma casa e um quinto**, e é **a única que
  rola num monitor**. Portanto é o único caso em que as regras de enquadramento
  (o herói no centro da área livre; a câmara só se move quando é obrigada) e a
  marca de borda fazem trabalho de verdade no desktop — **e não tem quadro**. É
  o que o `jogo` comporia a seguir, e ele disse-o em vez de o esconder.
- [ ] **o branco invisível na raiz das peças de D3/D4** · leve · de: desenho · 15/09 (E1)
  Os componentes de D3/D4 carregam na raiz um preenchimento **branco invisível**
  (`visible: false`, sem variável) — o branco que `figma.createAutoLayout()` dá
  de nascença, **desligado em vez de removido**. Amostrados 3 de 3 (`Barra de
  medida`, `Botao`, `Consequencia`): todos o têm. **Não pinta nada hoje; pinta
  branco no dia em que alguém ligar a visibilidade**, e qualquer varredura de
  *zero hex solto* vai encontrá-lo. A regra de D4 continua certa e é só aplicá-la:
  **quadro que só organiza leva `fills = []`**, não `fills = [branco desligado]`.
  As quatro peças de E1 nascem sem ele. *(Contado por amostra, não por varredura
  do arquivo — e é por isso que é item e não nota.)*
- [ ] **dois números que E3 leva de graça, e um deles é uma reprovação viva** · leve · de: desenho · 15/09 (E1)
  Os dois são de **E3**, e ficam aqui para não se perderem se E3 demorar.
  (1) **O contorno da mira REPROVA o piso de não-texto hoje.**
  `grade-de-batalha.jsx:433` desenha a união com `opacidade={0.6}`, e **violeta a
  60% sobre `bg` dá 2,68:1** contra os 3:1 do WCAG 1.4.11 — o âmbar a 60% dá
  3,85:1 e passa, o violeta não. **0,6 → 0,7** dá 3,24:1 e passa. É um número, e
  só se viu porque a discordância da borda obrigou a medir o contorno sozinho.
  (2) **`#141020` → `T.bg`** no fundo do tabuleiro (`grade-de-batalha.jsx:367`):
  é **literal solto** que a catraca D5a conta **e** está a **1,04:1** de `T.bg`,
  o que faz o vão de 2 px do anel de foco não se separar. A troca é invisível a
  olho nu — 1,04:1 é menos que a diferença entre `panel` e `bg`, que é 1,07:1 —
  e **conserta os dois de uma vez**.

- [ ] **nenhum número muda em silêncio** · médio · de: desenho · 14/09 (D4)
  *A proposta ambiciosa do `desenho`, e ela é `médio` pela régua nova: a
  pergunta do pesado é "o jogador teria de reaprender?", e aqui a resposta é
  **não**. Nada muda de lugar, nada muda de nome, nenhum fluxo muda — o que
  hoje acontece calado passa a acontecer à vista.*
  **O diagnóstico:** o Taverna calcula um jogo inteiro e **conta** o
  resultado em prosa cinzenta. 225 moedas entraram em dois turnos e o número
  só existe dentro da Bolsa. O XP subiu e a barra já estava cheia quando o
  jogador olhou. A vida caiu e a barra deslizou em 700 ms sem dizer quanto. A
  primeira missão da campanha virou a quarta de seis pílulas iguais. **O jogo
  tem o padrão certo e usa-o uma vez só** — o véu do dado.
  **A lei proposta:** *todo valor de estado que muda entre um turno e o outro
  veste a marca de "mudou agora", no lugar onde ele vive.* Três peças, e
  **duas já foram fabricadas em D4**: o `Selo` com *Mudou=Agora* (halo, três
  pulsos, e para) e a `Barra` com *Mudou=Golpe/Ganho* (o pedaço que saiu fica
  visível, o número escrito, e a barra de XP **enche** no fim da missão em
  vez de já estar cheia). A terceira é **O Realce** no log, também feita.
  **O que falta é conta, não tela:** uma primitiva `Numero` que saiba a
  diferença entre o valor de agora e o do turno passado, e entregue
  `{ valor, delta, mudouAgora }`. Módulo puro, com suíte — **e por isso é da
  fila do sistema**, não desta: a mesa pede, o `backend` escreve.
  **O preço, dito por escrito:** movimento demais cansa, e esta lei põe
  movimento em muitos lugares ao mesmo tempo. Três defesas, todas na forma: o
  halo para depois de três pulsos; a marca vale **um turno** e some; e sob
  `prefers-reduced-motion` **nada pulsa** — parada, a marca diz o mesmo. Se
  ainda assim ficar demais, o corte é do `jogo`: **quais** números merecem a
  marca é momento. O `jogo` já pôs o seu teto: **no máximo dois por turno, e
  só para o que aconteceu *com* o jogador.**
  **A prova de que não é gosto** é a lei que a pessoa deu à mesa — *"devemos
  fazer o máximo para ter a experiência de um jogo e que ele realmente está
  fazendo coisas — não só lendo e escrevendo"* — aplicada ao único lugar onde
  cabe sem mexer em fluxo nenhum: os números que o jogo **já** calcula e
  **já** mostra, e que hoje mudam sem que ninguém veja.

- [ ] **os 80 literais que já são `T`** · leve · de: desenho · 14/09
  Dos 242 literais de cor nos arquivos de tela, **67 (28%) já são cores da
  tabela**: 24 hex idênticos a um valor de `T`, e 43 `rgba()` cujo RGB é
  exatamente uma cor de `T` com alfa — **44 deles só no `App.jsx`**. Um
  helper `alfa(cor, a)` e uma substituição mecânica apagam mais de um quarto
  da dívida. **O retorno mais barato da fase inteira**, e é ele que torna
  D5b zero-perdão.
  *(corrigido por D2: são **80**, não 67. D2 mudou a folha de casa e com
  isso ela passou a ser território varrido — dentro dela há mais **13**
  `rgba()` que já são `T` com alfa, 7 no `MOVIMENTO_CSS` e 6 no
  `SUPERFICIES_CSS`. D2 não as tocou de propósito: trocá-las à mão seria
  escrever a fórmula do `alfa()` treze vezes antes de ela existir. **Este
  item é agora pré-requisito de D5b**, não um vizinho dele.)*
  *(confirmado por D5, 15/09: são **80** exatos, e o dente D5b mede exatamente
  este número. Quando este item rodar, o teto de D5b vai a zero e as entradas
  **saem** da tabela — a catraca falha com `ENTRADA MORTA` se ficarem lá a
  dizer `0`.)*

- [ ] **o pergaminho ganha nome** · médio · de: desenho e jogo · 15/09 (D5)
  **71 literais em `painel-mapa.jsx` (41) + `planta-cidade.jsx` (30), e a prova
  de que é sistema é um acaso impossível: 10 hexes aparecem nos DOIS arquivos,
  escritos separadamente, e cobrem 52 dos 71 usos** — `#5C4A30` a tinta (×11),
  `#F0E6CC` o papel (×10), `#EADFC1`, `#6D5C40`, `#B4322E`, `#3A2E1C`,
  `#C9A45A`, `#A08A5E`, `#8D7A56`, e a família do mar. Dívida acidental não
  concorda byte a byte em dois arquivos.
  A casa dele **não é `T`** — `T` é semântica (`panel`, `line`, `danger`) e não
  deve crescer para `papel`, `tinta`, `estrada`, `mar`, `selo`. É
  **`MATERIAIS`**, a paleta física criada em D2, onde a cortiça já mora.
  **~11 tokens.**
  *(correção medida: as "irmãs em `rosto.jsx` e `carta-taro.jsx`" **não
  existem** — as duas são escuras e são dívida comum. `carta-taro.jsx` carrega
  8 cores de `T` exatas e é o depósito mais rico de D5b fora do `App.jsx`.)*
  Paga o perdão de D5a nos dois arquivos. E o `jogo` olhou e disse o que o
  torna barato: **é o único lugar do jogo onde a tela é clara**, e a fronteira
  entre as duas paletas é exatamente a borda do objeto desenhado — o título, as
  abas, a tira do lugar, o `✕` e a legenda são **100% `T`**. Não é vazamento, é
  moldura.

- [ ] **os pigmentos do dado de jogo** · leve · de: desenho · 15/09 (D5)
  77 literais em `semente.js` (38), `mapa.js` (13), `npcs.js` (10), `palco.js`
  (10) e `devocao.js` (6) — cabelo, pele, olhos, bioma, facção, relação,
  devoção. **Já obedecem à lei da casa** (estão dentro de tabelas nomeadas, ao
  lado de `rotulo` e `icone`), e por isso estão **fora de D5b por escopo**: uma
  cor de patamar que vira `T.amber` muda sozinha no dia em que a Fase L
  esquentar o âmbar, e a rampa de devoção deixa de ser rampa.
  O que sobra para este item é menor e é real: **`rosto.jsx` tem `#7A1F1F`, que
  é `CABELO[8]` exato** — cor de dado copiada para dentro da interface, a
  direção contrária e a única que é mesmo defeito.

- [ ] **a cor do primeiro pixel sai de uma fonte só** · leve · de: desenho · 15/09 (D5)
  `index.html` tem `<body style="background:#0E0C15">`, que é `T.bg` copiado à
  mão. **Possivelmente o único perdão eterno do projeto:** o `index.html` é
  servido **antes** do bundle e não tem como importar `T`. O item não é faxina,
  é uma decisão de duas linhas: o build **gera** essa linha a partir de `T`, ou
  a casa **aceita** a cópia e escreve isso no lugar onde ela vive. Hoje ela
  aparece nas duas tabelas da catraca com teto 1, sem data de validade.
- [ ] **uma forma para o destrutivo — e o contraste que reprova sai** · leve · de: desenho · 14/09
  O botão que **remove um companheiro do grupo** (`App.jsx:2540`) usa `#fff`
  sobre `T.danger`: **3,42:1, reprova em WCAG AA**. Os outros destrutivos
  (`painel-talentos.jsx:112` e `:417`, `painel-ascensao.jsx:72`) usam
  `#1A0F0D` (5,48:1, passa). São três tintas de texto-sobre-vermelho, duas
  inventadas na hora, e a ilegível está no único botão que apaga alguém.
  `T.onAccent` sobre `danger` dá 5,34:1 e resolve. Correção de
  acessibilidade, não de gosto.
- [ ] **`prefers-reduced-motion` cobre as 13 animações, não 3** · leve · de: desenho · 14/09
  Só `tv-anel-fora`, `tv-anel-dentro` e `tv-pisca` têm saída — e são as três
  menos importantes, o sigilo de espera de uma tela administrativa. As cinco
  **infinitas que rodam durante o jogo** não param para ninguém:
  `tv-dice`, `tv-pulse`, `tv-agonia`, `tv-reliquia`, `tv-anel-*`. `tv-agonia`
  pulsa vermelho **enquanto o herói estiver abaixo de ⅓ de vida** — pode ser
  a cena inteira. Fecha D5c.
- [ ] **nenhum veredito mora num `title`** · leve · de: jogo · 14/09
  A lei diz que toda ação irreversível mostra o preço antes. Hoje o preço do
  **Destino** (*"o segundo dado vale — mesmo se for pior"*) está num atributo
  `title`: invisível sem rato, inexistente no telemóvel. O `jogo` clicou sem
  saber que podia piorar. Mesmo defeito em `⤢` e no interruptor `🎲`, cujo
  **estado só existe no tooltip** — clicou, o emoji não mudou, e não ficou a
  saber se ligou ou desligou.
- [ ] **`⛺` em combate pergunta antes** · leve · de: jogo · 14/09
  Um emoji sem rótulo, clicado a meio de uma luta do torneio, **terminou a
  luta** — sem confirmação, sem dizer o que aconteceu ao adversário, sem
  ganhou/fugiu/desistiu. A ação mais irreversível da sessão inteira, atrás
  do controle mais mudo.
- [ ] **`tv-btn` não existe, e quatro ícones estão mortos** · leve · de: desenho · 14/09
  `tv-btn` é usada **5 vezes** em `painel-ascensao.jsx` e **não existe em
  `FONT_CSS` nem em lugar nenhum** — cinco botões carregando uma classe
  inerte que alguém no futuro vai tomar por padrão da casa. E
  `IconeBandeira`, `IconeGota`, `IconeCirculoX`, `IconeFrasco` nunca são
  renderizados: aparecem uma vez cada, **na linha de import gigante
  `App.jsx:163`**. Passam no `teste-ligacao` porque a lei conta "referência",
  e import é referência. **A catraca de export morto tem um furo do tamanho
  de uma linha de import** — fechá-lo é meio-item à parte, e é da outra fila.
- [ ] **`REVANCHE` faz revanche** · leve · de: jogo · 14/09
  O botão grande e dourado do resultado do Duelo devolve o jogador ao **ecrã
  de montagem**. O rótulo promete uma coisa e o clique faz outra.
- [ ] **o aviso cola-se ao botão que destrói** · leve · de: jogo · 14/09
  *"Começar uma nova campanha substitui a anterior neste dispositivo"* é
  **rodapé no fim da página**; o botão `Nova campanha` que substitui está
  longe dali. É a coisa mais cara do jogo, protegida pelo texto mais
  distante.
- [ ] **as moedas no cinturão** · leve · de: jogo · 14/09
  *(medido no jogo carregado)* A barra de status mostra **NIV, PV, PM, XP, o
  dia e o lugar** — e **não mostra o dinheiro**. `◉ 240` só existe **dentro**
  do painel Bolsa, e é o número que decide toda compra, todo suborno, todo
  presente e toda obra: o jogador abre uma gaveta para saber se pode pagar.
  Com o **Selo de estado** fabricado em D3/D4, o cinturão do cabeçalho é
  **montagem, não desenho novo** — nenhuma peça nova, nenhum fluxo mudado,
  nada para reaprender.
  *(substitui e absorve "as moedas existem no HUD", na fila desde D1: é o
  mesmo item, e agora tem a peça que o torna barato.)*
- [ ] **`.tv-margem-abas` é o padding-right da v9.197 outra vez, em
  `margin`** · leve · de: jogo · 14/09 (achado em D2)
  O comentário da própria classe conta, em vinte linhas, como uma
  declaração que vale 0 continuou mandando na cascata e colou o conteúdo na
  borda direita no telefone — e a correção da v9.197 matou o
  `padding-right` e **deixou o `margin-right: 0` vivo do lado**. A classe é
  usada em seis cartões (`App.jsx:3081, 3331, 20628, 20675, 20757, 21064`),
  todos com `mx-4 md:mx-8`; especificidade idêntica, e a nossa folha vem
  depois do Tailwind (CDN no `<head>`, ver `index.html:7`), então **ela
  ganha: 16px à esquerda e ZERO à direita**, nos seis. A declaração dentro
  do `@media (min-width: 768px)` é idêntica à base — ruído puro.
  É meia linha para apagar, e **não** foi apagada em D2 de propósito: a
  linha daquela etapa era *zero diferença na tela*, e esta muda pixel. É a
  mesma queixa de quem jogou no telefone, pela terceira vez no mesmo sítio.
- [ ] **o regex de `teste-celular.mjs:56` não afirma o que parece** · leve ·
  de: aprendiz · 14/09 (achado em D2)
  `!/padding-rights*:/` — o `s*` é "zero ou mais letras s" grudado em
  `right`, não um `\s*`. Passa hoje só porque não existe `padding-right`
  nenhum na folha; no dia em que voltar um `padding-right : 68px` com
  espaço, a catraca que existe para pegá-lo **não pega**. Uma barra
  invertida. (Território de teste de forma, logo desta fila.)
- [ ] **`T` ganha `dangerFundo` e `okFundo`** · leve · de: desenho · 14/09
  `#33201F` e `#1F3320` já existem, com **7 usos**, e são a única gramática
  de "estado com fundo" que o jogo tem. Estão fora da tabela por descuido,
  não por decisão.
- [ ] **vitória e derrota são dois ecrãs, e o meu campeão é marcado como
  meu** · médio · de: jogo · 14/09
  Medido lado a lado nas duas abas do PvP: quem perdeu e quem ganhou veem
  **o mesmo ecrã**, mesma cor, mesmo tamanho — `A Sombra vence · 2×1`. Nada
  diz qual dos dois campeões era do jogador. Para além da palavra do nome,
  os dois fins são pixel a pixel idênticos.
- [ ] **o turno diz de quem é a vez, no sítio onde se age** · médio · de: jogo · 14/09
  O painel `ORDEM DE INICIATIVA` marcou o inimigo como **`● AGINDO` por mais
  de 10 segundos enquanto o jogo esperava pelo jogador**. A linha do jogador
  não tinha marca nenhuma, e nada na barra de ação dizia "é a sua vez". Ele
  esperou, não soube se tinha travado, e descobriu escrevendo à sorte.
- [ ] **o momento merece um momento** · médio · de: jogo · 14/09
  A conclusão da primeira missão da campanha foi **a quarta de seis pílulas
  cinzentas do mesmo tamanho, na mesma cor, no mesmo tipo**, sem pausa, sem
  som, sem a barra de XP enchendo. Idem conquista desbloqueada, achado, e o
  nascimento silencioso de um sexto separador no menu. O jogo tem o padrão
  certo e usa-o uma vez só: **o modal do dado**, que escurece a tela, mostra
  `5 + 2 = 7` e depois "Falha" — *"o único momento da sessão inteira em que
  senti que estava a jogar"*. É o que o resto devia invejar.
- [ ] **uma gramática só para "escolher um entre N"** · médio · de: desenho e jogo · 14/09
  O `desenho` mediu no código: `CartaoDeEscolha` é usado 11 vezes, **todas na
  criação de personagem**; fora dali "escolha um da lista" é redesenhado à
  mão em 8 lugares, com "selecionado" ora borda âmbar, ora fundo violeta, ora
  só opacidade. O `jogo` tropeçou nas mesmas cinco gramáticas jogando —
  **quatro delas na mesma criação de personagem**: cartão grande, `<select>`
  nativo, botão-pílula, stepper `−`/`+`, aba-pílula. Junto: **"ação principal
  bloqueada" tem 3 comportamentos** (desativado com a razão escrita — bom;
  desativado e mudo — o `À ARENA →` que fez o jogador adivinhar; e ativo com
  erro vermelho longe do campo).
- [ ] **`ui.jsx` ganha o que falta** · médio · de: desenho · 14/09
  `BotaoDestrutivo`, `Fechar`, `Sobreposicao`, `Badge`, `Barra`. Hoje são
  **218 `<button>` crus contra 16 `<Botao>`** — nove dos dez painéis usam
  **zero** primitivas de botão, e 9 dos 11 componentes de layout têm um único
  leitor (o `App.jsx`): não são primitivas compartilhadas, são funções que
  saíram do App e continuaram a só servir ao App. **Sem isto, D4 escreve
  formas que nada obriga ninguém a usar.**
- [ ] **a segunda paleta ganha nome** · médio · de: desenho · 14/09
  `painel-mapa.jsx` (41 literais) + `planta-cidade.jsx` (30) têm **71
  literais e ZERO cores de `T`** — e concordam entre si: `#5C4A30` a tinta,
  `#F0E6CC` o papel, `#EADFC1`, `#6D5C40`, `#B4322E`. Não é sujeira: é uma
  **paleta de pergaminho inteira que o jogo já tem e nunca foi declarada**,
  com irmãs em `rosto.jsx` (`TINTA`, `PANO`, `PANO_FUNDO`, nomeadas em
  `const` local) e `carta-taro.jsx` (36 literais). Perdoá-las uma a uma em
  D5 seria registrar como dívida o que é design.
- [ ] **a chave do Torneio é visível durante o torneio** · médio · de: jogo · 14/09
  Depois de entrar na chave, as palavras "chave", "torneio" e "final" **não
  aparecem uma única vez**. O jogador não sabe em que ronda está nem quem
  falta.

- [ ] **a interface sai do App.jsx, uma tela por vez** · médio · de: regente · 14/09
  Medido em 14/09: `App.jsx` tem **21.295 linhas e 939 `style={{}}`** —
  **63% da interface do jogo**. Fora dele vivem 4.994 linhas e 580 estilos
  (11 painéis, `ui.jsx`, e os quatro desenhos). Enquanto a tela morar no
  `App.jsx`, toda etapa de design disputa o bastão com a mente do sistema.
  Cada tela levada para um `painel-*.jsx` próprio compra independência
  permanente — **prefira mover a remendar no lugar**. Não é uma etapa: é um
  hábito, e vale como meia-etapa em qualquer ciclo que já segure o bastão.
  Catraca: build limpo, suítes verdes, e a tela idêntica no navegador.

## Recusado (com o motivo — para a mente não propor de novo)

_(vazio)_
