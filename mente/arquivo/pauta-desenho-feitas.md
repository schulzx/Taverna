# mente/pauta-desenho.md — as etapas e decisões que fecharam

O texto inteiro do que já foi feito ou respondido. Saiu da pauta porque a
mente a lê ao começar todo ciclo, e o que decide é o que está por fazer.
Aqui fica a prova.

- [x] **a resposta dele sobre como quer ser perguntado morre no fim da luta** · **APROVADA 15/09, com uma correção de lugar.** A pessoa: *"se concordar comigo, pode mexer no save; se não, apresente sua proposta."* **Claude discordou do lugar, não da correção:** preferência é **da pessoa, não do personagem**. No save ela nasce presa àquela campanha — mundo novo esquece de novo (o mesmo defeito, menor), importar save de outra pessoa importa as preferências dela, e **cada modo tem o seu espaço de save** (`modos.js`), logo Uma Vida, Uma Noite e o Duelo perguntariam três vezes. **Onde fica:** um espaço de preferências do jogador, fora do save, válido em todos os modos e campanhas — uma vez na vida em vez de uma por campanha. **Cuidados:** o espaço não viaja no `exportarSave` (senão volta o problema por outra porta); quem não tem preferência guardada joga exatamente como hoje; e a preferência é **do jogador sobre como ser perguntado**, nunca estado de jogo — nada que mude número entra ali. ·
  *(K1b)* · **pesado** · de: jogo + regente · 15/09
  **O número, e foi achado a medir outra coisa.** A escada do silêncio é a
  generosidade automática da Fase K: duas janelas expiradas e o jogo **cala-se
  pelo resto daquela luta**, sem menu e sem aviso. Funciona — e **reinicia na
  luta seguinte**. Quem nunca quis a janela paga **33 200 ms por luta** para a
  desligar outra vez, e **22,1 minutos ao longo de uma campanha de 40 lutas**,
  em silêncios que ele já pediu quarenta vezes. *O jogo esquece, todas as noites,
  uma coisa que ele já respondeu.*
  **Há saída barata e ela não serve:** fazer a escada atravessar a campanha em
  memória resolve a aritmética e perde-se no primeiro `F5`. A resposta honesta é
  **a preferência viver no save**, e é aí que isto sai das nossas mãos: **formato
  de save é pesado, e é da pessoa.**
  **O que ela decide, em uma pergunta:** *a ficha guarda como o herói se defende,
  ou isso recomeça a cada luta?* Se guardar, a fila de quatro pílulas de K1
  (*eu decido · sem pressa · aparar sempre · deixar passar*) deixa de ser uma
  preferência de sessão e passa a ser **parte da personagem** — que é, aliás, o
  que a ficção sempre disse que ela era.
  **O risco, dito:** um save que guarda preferência é um save que pode guardar
  mal, e a campanha é intocável. Mexer no formato pede a mesma cerimónia de
  qualquer mudança de save — migração, e um jogo antigo que abre sem a chave tem
  de cair no padrão `normal`, nunca em silêncio.
  **E o custo de não decidir é zero hoje:** K3 constrói com a escada por luta,
  como está, e o dia em que a pessoa disser sim é uma chave a mais no save.


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

- [x] **E2 · o endereço do tabuleiro** · de: pessoa · 14/09 · **feito v9.260**
  **A metade visível fechou, e a outra metade virou pedido à pauta do sistema.**
  A régua está nas **duas bordas** (letras em cima, números à esquerda), fora do
  SVG, em calha de 22 px, mono 12 px, `aria-hidden` — e **as letras saem de
  `LETRAS_DA_GRADE`**, sem uma segunda tabela nascer. **Três graus**
  (*Repouso* · *Procurada* · *Realçada*), e o canal que não é cor é a
  **existência** do filete. Toda casa ganhou `role="gridcell"` e um
  **`aria-label` de quatro campos** (`endereço · quem está lá · o lugar · o
  veredito`); **o `<title>` saiu** — era também o balão do rato, que no telefone
  não existe e tapa as casas para onde o jogador ia andar. **O veredito nunca
  fica vazio:** antes, a casa que não dava simplesmente calava, e silêncio
  lê-se como *"nada a dizer"*, nunca como *"não dá"*.
  **No telefone a régua custa ZERO casas, e a prova não é a igualdade — é a
  folga:** sem ela sobravam 23 px e 40 px, **e uma casa pede 48**. Nenhuma
  daquelas folgas podia virar casa. 7 × 12 = **84 casas** nos dois cenários.
  **`#141020` → `T.bg`** de brinde: tira um literal da catraca **e** devolve o
  vão do anel de foco. Catraca nova: `testes/check-endereco-do-tabuleiro.mjs`.
  O escrito dos dois seniores fica em `mente/e2-jogo.md` e `mente/e2-desenho.md`.
  **O que NÃO fechou, e está pedido em `mente/pauta.md`:** *"vou até K14"*
  escrito continua a não chegar ao motor — **não há porta do tabuleiro em
  `turno.js`** (17 portas, nenhuma), e a frase cai na porta `destino`, que não
  tem guarda `!emCombate`, gasta uma chamada ao Mestre e **ninguém anda**.
  *(a demanda original:)* Colunas por letra, linhas por número. É o que torna *"vou até H20"*
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