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
- [x] **(R1) a cena ganha um rosto, e o jogo nunca lho deu** · **FEITO em
  R13-B, `643294a`, v9.284.** A xilogravura por semente esta na tela: 96 px,
  sete gramaticas de silhueta sobre 30 biomas, quatro luzes pela hora, **32
  pares medidos e zero reprovas**. O custo que esta proposta orcava em duas
  linhas de prosa **nao se pagou**: a etapa A devolvera 334 px antes, e a
  pagina ficou em 490 px contra os 151 de origem. *A condicao de R1 era R12, e
  ninguem o sabia ate R6 medir o telefone.* · de: desenho · 23/09

  **O diagnóstico, e é uma frase:** este é um RPG de texto em que **nada na tela
  mostra onde você está**. O bioma existe no motor — há `VinhetaDaCena`, há
  `biomaDaqui()` — e o que ele produz é uma mudança de tom que **a medição não
  distingue do fundo**. O jogo descreve uma taverna, uma estrada, uma cripta, e o
  ecrã é sempre o mesmo retângulo.

  **A proposta.** A página ganha um **cabeçalho de cena** — uma faixa de 96 px no
  topo do papel, com uma **xilogravura gerada pela mesma semente do mundo**, o
  nome do lugar, e a hora do dia a mudar a luz da faixa. **Não é ilustração
  comprada: é o gerador de retrato que a casa já tem, apontado para o lugar em
  vez de para a cara.** *Determinismo por semente continua a valer* — a mesma
  semente dá a mesma cripta, em qualquer máquina, que é a primeira lei do
  `CLAUDE.md` aplicada a uma imagem.

  **O custo, escrito antes de ser perguntado, para poder ser recusado:** 96 px
  saem dos 418 da página no telefone, que passa a 322 — de 51,5 % para 39,6 % do
  ecrã. Com a coluna de 65ch e 17 px, ainda dá **11 linhas de prosa contra as 13
  de hoje**. **Duas linhas é o preço.**

  **Por que é dela:** acrescenta ao ecrã uma coisa de que o jogador passa a
  depender para saber onde está, e **muda o que o produto é** — de *"um log com
  uma barra de vida"* para *"um livro ilustrado que responde"*. Isso não é uma
  tela mais bonita; é outro produto, e a régua desta casa manda trazer isso à
  pessoa mesmo com o número do nosso lado.


- [x] **(K3) a janela pergunta sobre o golpe que menos importa — e há número** · **APROVADA 17/09 — virou a Fase J** (a pergunta muda de golpe). Move-se a resposta, não a pergunta: a saída que o `jogo` e o `desenho` acharam melhor **não bate na trava de K2**, e derruba o dano sem pergunta de 62,4% para 33,4%. ·
  pesado · de: jogo · 16/09
  **O diagnóstico, corrido em 20 000 sementes sobre o motor real** (ladino nv 3 +
  2 companheiros contra 4 comuns, a mesa mais parecida com a campanha):
  a janela abre **no maior golpe da rodada em 36,09 %** das vezes; o golpe sobre
  o qual ele **é perguntado** faz **3,56** de dano, e o que chega **coberto, sem
  pergunta**, faz **5,86**. **63 % do dano da rodada chega sem ninguém lhe
  perguntar** (75 % para o ladino solo). E **metade das perguntas é sobre um
  golpe que errou** (50,09 %): *revidar · 0 PM* não é uma decisão, é um sim com
  relógio — e K1 matou `inimigo_cai` com exactamente esta frase (*«uma pergunta
  cuja resposta é sempre sim não é pergunta, é um diálogo de confirmação com
  relógio»*). **A janela abre em 98,6–100 % das rodadas** para sete das doze
  classes: **não existe rodada de descanso.**
  **As duas propostas, e a segunda é a forte:** (a) a janela **não abre num erro
  do inimigo** — corta 45–50 % das perguntas e põe as restantes no momento que
  dói; (b) a janela abre **no MAIOR golpe da rodada**, não no primeiro que
  qualifica — sobe de **36,09 % para 100 %** a fracção de perguntas feitas sobre
  o golpe que mais dói.
  **E o obstáculo, dito antes de a pessoa o descobrir:** **a trava de K2 proíbe as
  duas.** A asserção 05 exige `abre.ordem <= ordemDaReacaoDeHoje`; saltar um golpe
  faz a replicação de [R1] começar mais à frente e **o contra-ataque do golpe 0
  deixa de acontecer** — isso é regressão medida, não estilo. *A ordem da pergunta
  está soldada à ordem dos golpes, e foi a trava que a soldou.* **Vem à pessoa
  porque muda mecânica e porque contradiz uma asserção que ela já aprovou.**
  **O que se perde, dito por mim:** o jogador deixa de poder **recusar** o
  contra-ataque — e recusar compra alguma coisa de verdade.
  **[K4, 16/09] MEDIDO OUTRA VEZ, e ele não exagerou em nada.** Corrido de novo
  sobre o código de hoje: 63 % → **62,42 %**; 50,09 % → **50,66 %**; 36,09 % →
  **35,54 %**; 98,60 % → **98,51 %**; 75 % → **75,24 %**. **A única divergência
  fora do ruído sai contra ele**, e o golpe real confirmou-o na tela: três das
  cinco janelas abriram num erro, e em três rodadas seguidas o dano grande chegou
  coberto. **A proposta (a) — *a janela não abre num erro do inimigo* — leva
  agora também a assinatura do `desenho`**, por razão de forma e independente da
  razão de dano: abrir só em golpe que acerta multiplica por **50** a informação
  da aparição da peça (0,020 → 1,023 bits) pagando com **metade** das
  interrupções. **A proposta (b) foi superada:** a de K4, no topo desta lista,
  chega ao mesmo lugar **sem bater na trava de K2** — mova-se a resposta, não a
  pergunta.


- [x] **(K3) no modo de alto contraste o Taverna não tem foco nenhum** · **APROVADA 17/09 — virou a Fase A11** (acessibilidade do foco). `forced-colors` remove `box-shadow` por especificação, e o anel da casa inteira é `box-shadow`: para quem usa alto contraste, **o foco não é fraco, é zero**. ·
  pesado · de: desenho · 16/09
  **Não é «fraco»: é zero.** `forced-colors: active` — o alto contraste do
  Windows, que muita gente com baixa visão usa o dia inteiro — **remove
  `box-shadow` por especificação**, e o anel de foco da casa inteira é
  `box-shadow`. Logo, para esse jogador, **o indicador de foco de um RPG de texto
  jogado com teclado é nenhum**, que é exactamente o público que mais depende
  dele. **Medida, não adjectivo:** indicadores de foco visíveis sob
  `forced-colors` hoje = **0**; depois = todos.
  **E hoje ficou mais barata:** K3 fabricou `.tv-anel-foco` com as duas linhas de
  `outline` do `forced-colors` já dentro, e aplicou-a ao cartão e às quatro
  pílulas da ficha. **A peça existe e está provada.** O que falta é **alcance**, e
  é por isso que é pesado: passá-la pelos **215 `<button>`** que K2 contou e pelos
  **86 alvos do tabuleiro** com `outline: none` à mão
  (`grade-de-batalha.jsx:515-519`) é trabalho de etapa e muda o que um jogador
  vive. **Paga também a dívida de E1**, que está aberta desde 15/09.


- [x] **(K2) o combate ganha uma semente, e o Duelo já provou que dá** · **APROVADA 17/09 — virou a Fase SE** (a semente do combate). São **205 chamadas a `Math.random`** na campanha contra **zero** em `duelo.js`: a primeira lei da casa — *mesma semente, mesmo resultado* — vale hoje metade do jogo, e o Duelo já provou que a outra metade é possível. ·
  pesado · de: jogo · 16/09
  **O diagnóstico, com o número.** A primeira lei desta casa diz *mesma semente,
  mesmo resultado, em qualquer máquina — é o único árbitro que um sistema sem
  servidor tem*. **Mas a campanha não tem semente nenhuma:** são **205 chamadas a
  `Math.random`** por ~50 módulos, sem um fio que as ligue. **E `src/duelo.js`
  tem zero** — `duelar(A, B, { semente })` e `sementeDaSala(...)` fazem o Duelo
  reprodutível de ponta a ponta desde D2/D3, e `src/semente.js` já exporta o
  gerador. ***A peça existe; falta ligá-la ao combate.***
  **A proposta, e a ordem é o que a torna barata:** `src/dado.js` com
  `fioDaLuta({ save, luta, rodada })`; o combate passa a receber **o rolador por
  parâmetro**, com `rolar = Math.random` por omissão — **exactamente a assinatura
  que `reacaoDoSilencio` já leva desde hoje**. Nada quebra no dia 1: quem não
  passa o rolador tem o jogo de hoje. **A reação é a primeira, porque K2 já a
  pagou**; depois `combate.js`, uma função por versão, cada uma com a varredura
  de sementes a provar que a extracção foi de graça.
  **Por que muda o que o jogador vive, e não é higiene:** hoje, quando ele perde
  e quer perceber porquê, a resposta é *"azar"*; com semente é *"a mesma luta,
  outra vez, igual"* — **e a diferença entre as duas frases é a diferença entre um
  jogo que se pode entender e um que se tem de aceitar.** O *"eu juro que apareceu
  diferente"* deixa de ser indecidível. **E toda etapa futura passa a poder PROVAR
  «o depois é igual ao antes» em vez de o declarar:** K2 gastou um ciclo inteiro a
  construir à mão, para **uma** função, a prova que uma semente daria de graça
  para o motor inteiro.
  **O risco, dito pelo próprio `jogo`:** são 205 chamadas, e tocá-las todas de uma
  vez é o tipo de mudança que parte o jogo em silêncio. **A defesa é não as
  tocar** — é o rolador por parâmetro, função a função, com `Math.random` a
  continuar a ser o valor por omissão até ao último dia. **Reversível em qualquer
  ponto.** O que ele não sabe dizer é quantas versões leva.
  **Por que é dela:** mexe no motor inteiro, não numa tela. *E a alternativa
  honesta seria apagar a linha do `CLAUDE.md`, que a mesa não tem autoridade para
  propor.*


- [x] **(W1) a luta abre onde a sala é comprida, e ninguém decidiu isso** · **APROVADA 17/09 — vai para a Fase E** (E6). A distância de abertura é a **altura da planta e mais nada** (`grid.js:569-575`): a masmorra abre a 25,5 m por ser estreita, não por ser longe. Passa a sair de tabela, como todo número desta casa. ·
  pesado · de: jogo · 16/09
  **O acidente, e é de uma linha.** A abertura de toda luta sai de `posicionar`
  (`grid.js:569-575`): o herói em `y = altura − 1`, os inimigos em `y = 0`. Logo
  **a distância de abertura é a altura da planta, e mais nada.**
  > **A masmorra abre a 25,5 m porque é ESTREITA (7×18), não porque é longe.
  > A taverna abre a 12 m porque é BAIXA (12×9), não porque é apertada.
  > A razão de aspecto do desenho da planta decide a distância do combate.**

  **A conta, corrida em Node sobre `PLANTAS` × `posicionar`:** abertura média
  **19,95 m**; **10 de 10 plantas** recusam o corpo a corpo no turno 1; **1,4
  rodadas por luta são só caminhada** (2 na masmorra, no navio, no gelo e na
  floresta). **E o arqueiro não paga nada disto** — alcança em 10/10 no turno 1.
  *O jogo cobra um imposto de caminhada a quem luta de perto, e cobra-o por
  engano.*
  **A proposta.** A distância de abertura **sai de uma tabela** — por cenário e
  por como a luta começou — e **nunca dos cantos da planta**. A emboscada abre
  colada; a perseguição abre longe; a rixa de taverna abre a 3 m porque uma
  taverna é pequena. A regra: **pelo menos um inimigo dentro do primeiro passo
  de alguém.** *(O embrião já existe e ninguém reparou: `posicionar:573` já abre
  o inimigo `agil` a meio campo. Falta ser tabela em vez de booleano.)*
  **Porque muda o que o jogador vive:** hoje a primeira coisa que toda luta lhe
  ensina é *"ande em frente"*; com isto é *"onde é que eu me ponho"* — e o campo
  já tem tudo para essa pergunta valer (cobertura, terreno que cobra, golpe
  livre, alcance por tamanho). **A regra está toda lá; falta a luta começar perto
  o bastante para alguém a usar.**
  **Porque é dela:** é tabela nova e é `backend`; e o jogador reaprende uma coisa
  só, mas grande — **que a luta começa em contacto**. Isso é fluxo.
  **O risco, dito pelo próprio `jogo`:** a aproximação é onde a posição vale
  alguma coisa, e abrir tudo colado achataria o combate no sentido oposto. **A
  defesa é a própria tabela:** ela não diz "colado", diz *"dentro do primeiro
  passo de alguém"* — e "alguém" pode ser o arqueiro, o que deixa o corpo a corpo
  com uma rodada de aproximação que passa a ser **uma escolha** (avançar sob fogo
  ou cobrir-se) em vez de uma caminhada.


- [x] **(W1) os três verbos de teatro: dar-lhes motor, ou tirá-los da tela** · **APROVADA 17/09 — já é a Fase Y**, que a pessoa aprovou em 15/09 e está em 1 de 3 (Y1 deu motor a Empurrar e Derrubar em v9.271). `Esquivar` é Y2; a barra fixa só os mostra quando cumprirem. ·
  pesado · de: jogo · 16/09
  `golpe.js:222-254` escreve, com o motivo, que **`Esquivar`, `Empurrar` e
  `Derrubar` não chegam a motor nenhum** — X2 preferiu **escrever o buraco a
  remendá-lo**, e teve razão. **Está na mesa há uma fase, e W1 obriga-o a sair de
  lá:** uma barra fixa não pode carregar teatro, e foi por isso que a fileira de
  seis de E1 virou uma de quatro. *Uma barra fixa em que metade dos alvos não faz
  nada mecânico ensina, em duas lutas, a não confiar na barra.*
  **Duas saídas, e as duas são dela.**
  **Dar-lhes motor.** `Empurrar` e `Derrubar` são disputa de força, e o motor não
  tem disputa entre duas fichas — é a peça que falta. **`Esquivar` é a mais
  barata e a que mais muda o combate:** a condição `protegido` **já existe em
  `condicoes.js`** e nada a concede a partir de uma declaração do jogador; é a
  única decisão defensiva que o jogador hoje não tem.
  **Tirá-los.** Com W2 a transformar a caixa em fala, *"empurro com força"* passa
  a ser **uma fala**, e uma fala num sítio onde a fala mora não é uma perda. **O
  `jogo` defende esta, se só houver uma** — os doze botões de `Ações` são,
  medidos, **um teclado de atalhos**, e um teclado de atalhos é o oposto do que
  esta fase entrega. *Mas tira ao jogador coisa de que ele depende, logo é dela.*


- [x] **(E2) a régua mostra a planta INTEIRA, e a janela é uma marca dentro dela** · **APROVADA 17/09 — vai para a Fase E** (E7). A régua deixa de responder *"como se chama isto que vejo"* e passa a responder **"o que existe que eu não vejo"** — a pergunta que um campo de 33% faz o tempo inteiro. ·
  pesado · de: desenho · 15/09
  **A proposta.** A régua deixa de rotular só as casas que estão na tela e passa
  a rotular **a planta toda** — as 18 colunas cabem nos 337 px do telefone a
  18,7 px cada, que é exatamente o `N = 2` que E1 já calculou; **a letra nunca
  sai, e custa zero casas**. A janela do campo vira um trecho realçado *dentro*
  da régua, como a alça de uma barra de rolagem que soubesse dizer nomes.
  **O porquê, e é uma frase:** hoje a régua responde *"como se chama isto que eu
  vejo"*, e a pergunta que um campo de **33 %** faz o tempo inteiro é **"o que
  existe que eu não vejo"** — que nada na tela responde. É a frase de E1 (*"uma
  régua que começa em F conta que A–E existem"*) feita à letra em vez de por
  inferência, e é o que torna *"vou até K14"* dizível sobre uma casa que o
  jogador nunca viu.
  **Por que é dela e não da mesa:** a régua deixa de bater casa a casa com o
  tabuleiro — deixa de ser o cabeçalho congelado da planilha e passa a ser um
  mapa do campo. Isso é o jogador a reaprender o que a borda significa, e **o
  risco só se resolve jogando**: pode ser que duas escalas na mesma tela
  confundam mais do que a borda muda informa.
  *(A alternativa barata, se a pessoa recusar: a régua fica como está e a
  **marca de borda** — `A marca de borda` `53:43`, já desenhada, variante
  *Quem = A casa* — passa a falar pela casa que está fora da janela. Resolve o
  caso agudo e não resolve a pergunta geral. **Depende de E3**, porque hoje o
  tabuleiro sempre cabe e nada fica fora da janela.)*


- [x] **A ação principal tem a mesma cara nos três modos** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`



- [x] **V1 · a folha da v3** (paleta e tokens) · `desenho` + `jogo` → `aprendiz`
  · **FEITO 24/09, no ar** — a decisão em `mente/formas.md` §V1, o spec em
  `mente/v1-desenho.md`, a prova jogada em `mente/v1-jogo.md` §10. `T` veste os
  valores da v3; a página castanha de R2 morre (sobre ela todos os acentos
  perdiam 33 % de contraste); `T.mundo` passa a ciano; nasce `T.rosa` (o que
  está escolhido agora) e a tabela `AMBIENTE` (o gradiente âmbar·ciano·rosa da
  v3, pintado no corpo da história). Prosa sobre o corpo **11,08 → 13,59:1** no
  pior ponto do gradiente; borda dos avisos da página **2,30 → 3,41** (antes
  reprovava a 1.4.11 e ninguém tinha medido); PV grave contra normal **+37 %** de
  separação (+27 % em deuteranopia); **0 px** de leiaute mexido.

- [x] **V1b · as pontas de V1 que moram no `App.jsx`** · **FEITO 25/09 com V3b, `e9b3531`** · `oficial`, com o
  bastão · leve — o contorno do cartão separa-se do controlo (`T.line` no
  cartão, `T.lineStrong` nos chips e no botão flutuante; `paginaFio`
  aposenta-se e a asserção 6 de `teste-v1-folha` muda com motivo); o comentário
  de `App.jsx` ≈l.23066 que ainda diz que a narração é "a única coisa QUENTE";
  **o `Continuar aventura` em `T.danger`** (`App.jsx:5057`, e a sombra com o
  literal `rgba(216,106,91,…)` de R2): o primeiro botão de cada sessão tem a
  cor do perigo — passa a `T.rosa`. Detalhe em `v1-desenho.md` §10 e
  `v1-jogo.md` §10.4. *Vai junto da primeira etapa que tomar o bastão.*

- [x] **V3 · os ícones desenhados** · **FEITO 25/09: V3a `afaffd8`, V3b `e9b3531`, V3c `29debdf`; o resíduo é V3f, depois de V7** (~20: os do trilho, o dado, as quatro luzes,
  `◉`, `◆`, `✦`, a coroa) — **paga R8 na tela principal**; varredor: zero emoji
  do SO na mesa. O dado é um d20 de verdade (o Lucide não tem).
  - [x] **V3a · fora do `App.jsx`** · **FEITO 25/09, no ar** — a decisão em
    `formas.md` §V3, o spec em `mente/v3-desenho.md`, o censo jogado em
    `mente/v3-jogo.md`. `src/glifos.js` (16 glifos, um assunto cada, geometria
    Lucide ISC), a peça `Glifo` em `ui.jsx`, 12 `Icone*` antigos a delegar, o d20
    icosaedro provado como geometria, `DegrausDaAmeaca` no Bestiário. **101 → 0
    emoji do SO** nos 14 arquivos fora do `App.jsx`: todas as telas a um toque
    da mesa ficam sem emoji do sistema. A catraca D5h congela o `App.jsx` em 595
    e só o deixa descer.
  - [x] **V3b · o `App.jsx`** · `oficial`, com o bastão · **FEITO 25/09, no
    ar** — as falas do sistema traduzidas por tabela (`ASSUNTO_DO_EMOJI` e
    `assuntoDaLinha` em `glifos.js`, não 296 sítios) com `O ladrilho do assunto`
    (Neutro cheio, Impedido oco com a marca `ban`, Porta com contorno
    `lineStrong`), a voz, `chipsDoEstado` com setas a favor/contra, o teste
    pendente, a gaveta `✦`, o trilho (Gestão → herói, Códex → ânfora); e **V1b**
    junto (o cartão a `T.line`, `paginaFio` aposentado, o `Continuar aventura`
    de perigo para rosa com a seta a 6,02:1 — era 2,19). A prova jogada
    (`v3-jogo.md` §9) pediu cinco consertos antes de subir, e subiram com ela.
  - [x] **V3c · FEITO 25/09, no ar** (o spec em `mente/v3c-desenho.md`, o
    momento e a prova jogada em `mente/v3c-jogo.md`) — a soleira com o selo de
    prazo e a moeda desenhada, XP e fama fora dela (nunca desempatam dois
    contratos), o dinheiro em coluna; O TEMPO numa linha com o céu da hora e os
    botões de esperar com o céu de chegada; *guardada* deixa de parecer recusa;
    "Novo arco iniciado" sai; masmorra, acampamento e falas do jogador sem
    emoji; o `↓` na margem do cartão. **O que sobra, e é V3f:** a passagem
    visitada da masmorra ainda imprime `ICONE_SALA` (`App.jsx` ~:23504); o
    acampamento atrás de "mais 2 ofertas" com o herói a sangrar (o que estanca
    uma perda por turno passa à frente do que não tem prazo — `v3c-jogo.md`
    §1); a dobra a dizer "mais 1 trabalho"; os 11 `◉` de frase nos painéis
    (`TextoComMoeda` já serve — `aprendiz`); o raid, com a tela de combate.
  - [ ] **V3g · a escolha é uma mesa de cartas** · `desenho` · médio · a
    ambiciosa de V3c (`formas.md` §V3c) — na mesa, duas ofertas lado a lado
    como dois cartazes com o dinheiro grande; a soleira desce de 116 para ~96
    px e comparar vira olhar dois números à mesma altura.
  - [ ] **V3h · esperar até à luz** · `jogo` · médio · a ambiciosa de V3c
    (`v3c-jogo.md` §8) — os botões de esperar passam a `1h`, `2h` e as três
    luzes seguintes com as horas de cada uma (*"até a madrugada · 6h"*); a
    página amanhece enquanto o Mestre escreve, sem prolongar a espera. Depende
    de V1c.
  - [x] ~~**V3c · o que V3 deixou**~~ (o texto original, para o registo) · `oficial` + `aprendiz` — **a soleira ainda
    escreve `prazo 4 noites` e `◉ 140` como texto nu: o `SeloDePrazo` e o glifo
    do dinheiro na `Oferta` são o maior ganho que falta** (o prazo tem quatro
    caras — `v3-jogo.md` §1); O TEMPO (cinco emoji numa linha → um glifo, o céu
    de `LUZ_DA_CENA`; começo de V4); masmorra, acampamento, raid; as falas do
    jogador sem carimbo; **`App.jsx` ~:20679 escreve *"Novo arco iniciado"* no
    registo — o sistema a falar de si mesmo**, sai (hoje leva um prefixo
    `null`, ladrilho vazio). **O `📕 X: guardada` (~:18654) cai no tom
    *Impedido***, e guardar uma magia não é recusa — a entrada `📕` da tabela
    tem de separar *guardada* de *proibida*. A 375 o botão flutuante `↓` tapa o
    contorno da segunda Porta (já tapava a linha antiga). O `oficial` pôs `🔮`
    (faísca) no interrogatório dos mortos (~:13774/:13778) — confira o `jogo`.
    Âncoras em `v3-desenho.md` §7.6. O pedido das noites que faltam já está em `pedidos-ao-sistema.md`.
  - [ ] **V3d · o dado que rola é o sólido** · `desenho` · médio · a ambiciosa
    de V3 (`formas.md` §V3.6) — o que rola no véu é o icosaedro, 20 faces
    numeradas como um d20 de mesa (opostas somam 21), a cambalhota tirada da
    mesma semente do resultado (a mesma jogada, a mesma queda, em qualquer
    máquina), 700 ms, nunca bloqueia; `reduced-motion` mostra só a pose final.
    Vai com V6 e depende do pedido `rolarTeste` por semente.
  - [ ] **V3e · o glifo viaja** · `jogo` · médio · a ambiciosa de V3
    (`v3-jogo.md` §7) — o mesmo glifo na promessa (a `Oferta`), no pagamento (a
    pílula) e no contador da cinta, e o recurso voa da pílula ao contador em
    400 ms; nada espera a animação. Depois de V4 (os anéis são o destino).

- [x] **V4 · a cinta com os anéis** · **FEITO 25/09, no ar** — o estudo em
  `mente/v4-jogo.md` (e a prova jogada no fim dele), a forma em `formas.md` §V4
  e `mente/v4-desenho.md`. Os companheiros entram na tela principal (**0 → até
  4**), o anel tem quatro estados (calma, grave, ferida agora, **tombado** —
  traço diagonal, lê-se em cinzento), o disco `+N` herda o pior do que esconde,
  a pílula do tempo no centro, o toque num companheiro abre o Grupo no cartão
  dele; **a barra de PV que encolhia a 0–3 px no telefone com prazo deixou de
  existir** (é o arco), e **o pulso de agonia passa a três pulsos e repouso, e
  a zero com `reduce`**.

- [x] ~~**V4 · a cinta com os anéis** (o texto original)~~ — os retratos do grupo com anel de PV (âmbar
  bem, perigo grave: em cinzento âmbar×perigo separa 1,52, ciano×perigo só
  1,25 — por isso o anel ciano da v3 não entra), a pílula do tempo (hora do
  mundo + selo de prazo; o `2h 15m` de sessão sai; o toque abre O TEMPO), bolsa
  e PM (violeta, a cor da gaveta). *A coroa marca o SEU herói, não liderança —
  o jogo não tem essa regra.*

- [x] **V5a · o cabeçalho da pessoa** · **FEITO 25/09, no ar** · ordem direta
  da pessoa: *"ainda existe uma imagem procedural, vamos tirar ela e deixar
  exatamente igual à imagem do Figma"* (`129:4`). **A xilogravura por semente
  (R13-B) sai**, e com ela o motor da gravura; o cabeçalho é o `parchment-header`
  ao píxel, com conteúdo de mundo (o lugar à esquerda em âmbar, a luz e o clima à
  direita; na masmorra, a camada e as tochas); a runa e os floreados do rodapé no
  fim do registo, a 0 px. Decisão em `formas.md` §V5a, spec `mente/v5a-desenho.md`,
  momento e prova `mente/v5a-jogo.md`. **Isto desfaz a "fusão" que V5 planeava:
  não há fusão, há remoção.**

- [x] ~~**V5b · a cartela de chegada**~~ · **FECHADA dentro de V5 pelo `jogo`:** o nome do lugar em grande repetiria o cabeçalho de V5a a 80 px — o mesmo defeito do painel da sala. O que ficou dela é a abertura (a primeira frase grande), em V5. · `jogo` · médio · a ambiciosa de V5a — no
  turno em que o lugar muda, a prosa abre com o nome do lugar grande e a runa por
  baixo (os títulos de área de Dark Souls e Hollow Knight); nos outros turnos, 0
  px. Usa o eixo `chegada`, que já vai na chamada e não faz nada desde R13-B.
  **Leva junto:** na masmorra o painel da sala repete o lugar logo abaixo do
  cabeçalho (`ANDAR 1 — DO SILÊNCIO` contra `ANDAR 1 · DO SILÊNCIO`) — o mesmo
  facto duas vezes, com dois separadores (a prova de V5a).

- [x] ~~**V5 · a página (o resto)**~~ (o texto original) — coluna de 65ch, a soleira no pé do cartão (0
  px sem oferta), a abertura grande como cerimónia. *(O texto original abaixo
  falava de fundir o cabeçalho com o rosto da cena; V5a substituiu essa parte.)*
  ~~o cabeçalho da v3 **funde-se com o rosto da cena**~~
  (168 → 96 px): as etiquetas viram a legenda da gravura, o lugar à esquerda
  (`lugarDaCena()`), a luz e o clima à direita (na masmorra, a camada e as
  tochas); a runa na borda de baixo; coluna de 65ch; a soleira no pé do cartão
  (0 px sem oferta); o `CabecalhoDaCena` antigo aposenta-se.

- [x] **V6 · o compositor e o dado** · **FEITO 28/09, no ar** (`mente/v6-jogo.md` §7, `mente/v6-desenho.md`, `formas.md` §V6; os 15 desvios no quadro `146:2`) — o dado da v3 com o d20 de verdade e cinco estados; **um dado só na tela** (o `Rolar d20` de 132×28 e o `Agir →` aposentam-se); o teste pendente é uma linha por cima do campo com a dificuldade na face do dado; o `✦` no canto da pílula. **Por medir, e não bloqueia:** a catraca de R6 (≥15 de 20 turnos pelo campo) e "Enter contra toque" pedem uma sessão real de 20 turnos a 375 (~20 chamadas) — de preferência com a pessoa a jogar os 5 primeiros sem lhe explicarem o dado. **Anotado para quando o combate abrir:** a linha do veredito da batalha é a mesma peça (2 linhas no ramo de combate). — *(texto original:)* um dado só, cinco estados (Repouso ·
  Pronto · Lançado · À espera · Rolar), `✦` no lugar da caneta, a linha do
  veredito por cima do campo só quando há veredito; `Enter`/`Shift+Enter`
  intactos; o `Rolar d20` aposenta-se; a catraca de R6 (15 de 20 turnos ainda
  pelo campo).

- [x] **R6 · a prova jogada do *depois*** · de: jogo · 23/09 · **PAGA** — o
  escrito em `mente/r6-jogo.md`. **15 dos 20 turnos usaram o campo de texto**:
  a premissa aguentou, os 20 verbos genéricos nao fizeram falta uma unica vez,
  e o jogo **nao** virou point-and-click. Mas a soleira so aprendeu dois verbos
  e **so em 2 dos 20 ofereceu a coisa que o jogador ia mesmo fazer** — *o ganho
  esta provado e quase todo por gastar*. E a medicao do telefone achou o reu
  que ninguem tinha na conta e que virou R13.
  **A catraca que o `jogo` escreveu contra si mesmo** e que esta fase ainda não
  pagou: 20 turnos, **contando quantos usaram o campo de texto**. Perto de zero
  é **regressão** — o jogo teria virado *point-and-click* e a prosa deixado de
  ser respondida —, e é ele quem tem de o dizer. *A proposta tem duas das três
  provas; falta a terceira, e falta por não existir ainda o depois para jogar.*

- [x] **R12 · o telefone paga a fase, e é onde eu olharia a seguir** · de:
  regente · 23/09 · **RE-MIRADO, DESENHADO E CONSTRUIDO em R13-A (`fc3efb1`)**
  — a pagina do telefone foi de 151 para **586 px sem oferta**, e a moldura
  deixou de crescer a cada contrato. *O item original acusava a soleira e
  falhava os 334 px de cabecalho, barra e prazos.* — a forma fechada
  está em `mente/formas.md` §*R13 · a fabricação*, a composição em
  `mente/r13-mesa.md`, o par 375×812 e as peças no Figma. **Falta construir.**
  *R12 acusava a soleira (149 px) e falhou o réu maior:* a barra de estado (180)
  mais a fita de prazos (81) são **261**, e nenhum dos dois tinha sido medido.
  **E falhou um terceiro que ninguém tinha na conta: o cabeçalho, 73 px para
  escrever o nome do produto a quem já está dentro dele.** As três morrem e
  entra `A cinta`, 48 px: a página passa de **151 para 503** (3,33×) e para
  **586** nos turnos sem oferta — quase metade deles.
  **Medido:** a prosa no telefone foi de **51,5 % para 37,3 %** com uma oferta na
  soleira. Na mesa voltou acima do ponto de partida (58,1 → 58,3 %); **no
  telefone não voltou.** A causa é geometria e não desleixo: **a peça cresce e o
  ecrã não** — a 375 px um cartão que na mesa partilha uma linha precisa de duas.
  *E o telefone é o aparelho que mais recebeu desta fase* (o preço estava em
  `title`, que lá não existe; 21 de 26 alvos estavam abaixo do piso) — **o que
  não torna o custo menor, torna-o pago.**
  **O que eu experimentaria, por ordem:** a soleira no telefone virar **uma linha
  de altura de uma oferta só, com o resto atrás da porta** em vez de empilhar; ou
  o cartão curto voltar aos 54 px e só o longo crescer. **Não decido aqui** — é
  forma, é do `desenho` com o `jogo`, e quero a prova jogada de R6 antes.


- [x] **R11 · o terceiro acento existe e ainda não fez o trabalho por que foi
  criado** · de: regente · 23/09 · **CONVERTIDO E CONSTRUIDO em R13-A
  (`fc3efb1`)** — `T.mundo` ganhou uma *regiao* (a metade direita da cinta:
  hora, prazo, o tempo) em vez de uma lista de usos, e passou de **zero
  leitores** aos cinco significados que R2 lhe prometera tirar ao ambar.
  A conversão não foi feita significado a significado, como se supunha: foi
  feita **de uma vez, por geometria.** A metade direita de `A cinta` é o alvo
  do tempo, e **é toda `T.mundo`** — relógio, data, estação, lugar e a espera
  passam a viver num sítio só, numa cor só. `T.onMundo` deixa de ter zero
  leitores no dia em que a cinta for construída. *Uma cor nova que não tira
  trabalho a nenhuma outra é só mais uma cor — e esta passa a tirar cinco de
  uma vez porque lhe deram uma REGIÃO, não uma lista de usos.*
  `mundo` nasceu em R2 com uma justificação exata: *o âmbar carrega **24
  significados** e `mundo` tira-lhe **cinco** — relógio, data, estação, lugar, a
  espera — devolvendo-lhe uma função só.* Contei os leitores hoje: `T.mundo` é
  lido **duas vezes**, ambas nas peças novas (`Oferta` *tom=convite* e `Voz`
  *quem=mundo*), e **`T.onMundo` tem zero**. *Os cinco significados continuam
  âmbar.* **Logo o âmbar não desceu de 24, e esta fase não pode dizer que
  desceu.** O acento está certo e a conversão é que falta — relógio, data,
  estação, lugar e a espera, um de cada vez, medindo. *Uma cor nova que não tira
  trabalho a nenhuma outra é só mais uma cor.*


- [x] **E3 · a tela existe** · de: pessoa · 14/09 · **feito v9.277**
  **A tela da batalha existe, e a condição de entrada foi paga primeiro:** o
  tabuleiro **saiu de dentro do rolador do log** — a batalha é agora irmã do log,
  não filha dele, e a catraca morde se voltar a ser. Os **429 px abaixo da borda**
  eram essa árvore, e só a inversão os resolvia.
  **O ganho que a fila queria não é a tela, é o que saiu com ela:**
  `App.jsx` **22 219 → 21 939 linhas (−280)** — saíram **453 de tela** e entraram
  173 de fiação. Nasceram `src/painel-batalha.jsx` (a tela), `src/tela-de-batalha.js`
  (a decisão, provável em Node) e `src/painel-habilidades.jsx` (as duas gavetas,
  levadas byte a byte). Os números de E1 viraram a tabela **`TELA_DE_BATALHA`**
  (`src/estilo.js`, ao lado de `ALVOS`), e a suíte lê de volta a soma que a
  justifica: `respiro + campo + goteira + lateral + respiro = 1280`.
  **O que o jogador vê:** duas colunas, casa de **48 px medida no navegador**, a
  narração encolhida às duas últimas linhas do Mestre, a faixa `agora: <nome>`, a
  linha do veredito **nunca vazia**, os sete verbos, a ficha curta a 344 px. A luta
  começa e **a tela vira sozinha**; durante ela **não há porta nenhuma**; no fim há
  **uma**. **Zero sobreviventes** dos treze controlos proibidos, e **nada na tela
  diz que ela é uma tela**.
  **E a conferência viva pagou o ciclo inteiro:** com **198 suítes e 14 varredores
  verdes**, a luta real achou **`outline: "none"` inline em 67 dos 80 elementos
  focáveis** — a doença de K4 aplicada casa a casa. Corrigida, e com ela nasceu a
  **quarta maneira de apagar um anel**, que não estava escrita em lado nenhum:
  **`box-shadow` não pinta em elemento SVG** — a regra é aceite, a propriedade diz
  que o anel existe, e nada é desenhado. Nasceu `.tv-anel-foco-no-campo`
  (`outline`, não sombra): **15,31:1, medido com o `Tab` e não com `.focus()`**.
  O escrito fica em `mente/formas.md` (*A tela da batalha existe*),
  `mente/e3-jogo.md` e `mente/e3-desenho.md`.

  **As duas medidas de E1 que a construção desmentiu, e viraram os dois itens
  abaixo:** o campo mede **583 px e não 828** (828 nunca coube na própria mobília
  de E1: a soma dá 1 116 contra 860 de tela), logo cabem **2 das 10 plantas** e não
  nove; e no telefone são **6 filas e não 12**, porque a tira de consulta come
  **144 px** que o orçamento de E2 não tinha.

- [x] **E4 · mover é fazer** · de: pessoa · 14/09 · **feito v9.281**
  **A pergunta da etapa era "quantas rodadas o jogador consegue se mover de facto,
  contra as zero de hoje" — e a resposta veio de onde ninguém procurava.** O passo
  não era descontado porque **a luta nascia sem `economia`**: `equiparCombate`
  (`App.jsx:4929`, a porta única de `abrirCombate`) montava a luta sem ela, e o
  desconto fazia `eco ? … : eco` — **sem `eco`, evaporava**. A rodada 1 inteira era
  de graça. O motor entregou a peça pura (`PASSO_NA_RODADA`, `passoQueResta`,
  `podeDarUmPasso`, `passoAposAndar`) e **as seis linhas endereçadas**; o bastão era
  nosso e nós ligámo-las. **Medido vivo: `👣 9 de 9` → `0 de 9` depois de um passo**
  — a primeira vez que a rodada 1 debita. A catraca `check-passo-na-rodada.mjs`
  **falha com 7 asserções antes e passa com 10 depois**: *falha antes, passa depois*,
  no caso mais limpo que a fase teve.
  **E a mesma chave em falta tinha um segundo sintoma que ninguém tinha ligado:** a
  guarda da ação estava atrás de `if (eco)`, logo *"Você já usou sua ação nesta
  rodada"* **nunca disparava na rodada 1** — o que explica as **zero chamadas** que
  W2 contou sem saber porquê. **O segundo golpe na primeira rodada passa a ser
  recusado, e nunca tinha sido.**
  **O que o jogador ganha, com número medido em duas lutas:**
  o **custo nasce escrito dentro da casa** em *Alcançável* (83 números em `cidade`,
  38 em `estrada`), em `amberSoft` a **12,40:1** — a peça pintava `#000000`, que
  daria **1,08:1**, e o `desenho` curou-a antes de ser construída; o **roving
  tabindex** levou as paragens de `Tab` até ao `Atacar` de **84 (ou 1, na mesma
  luta) para 3, com variância 0** — *não era longo, era impossível de aprender,
  porque mudava*; e no telefone a **tira de consulta foi desfeita** (149 → 44 px,
  campo 296 → 396, **12 → 36 casas inteiras**), o que era **repor o que E1 desenhara**
  e a construção de E3 empilhara.
  **O achado que só o número dentro da casa revela:** em **6 das 10 plantas o herói
  abre dentro da lama**, e as oito vizinhas custam **3 m, não 1,5** — o erro de quem
  contava quadrados era exatamente um anel, e o único sinal era o véu ser menor.
  **Duas mentiras da tela, corrigidas:** `Mover` **armava com o conjunto vazio**
  (`aria-pressed=true` e a linha a mandar tocar uma casa que não existia); e o campo
  **perdia as 216 casas focáveis** quando o passo acabava, em silêncio.
  **E o defeito que só a luta viva apanhou, com a suíte verde — o de E3 outra vez:**
  `impedimentosDaFileira` estava certa e provada em Node, e **a tela nunca a
  chamava** — o botão engolia o toque e a linha continuava a falar da distância do
  inimigo. *Uma suíte verde sobre uma regra que a tela não invoca é a pior espécie
  de verde.* Corrigido com dente novo em `check-tela-de-batalha.mjs`.
  **A dívida de entrada paga:** `custosDe` nasceu em `src/grid.js`, que é território
  do sistema, e `alcancaveisDe` passou a ser a leitura das chaves dele. A asserção
  que o justifica carrega a busca **antiga** íntegra e prova conjunto idêntico em
  **dez plantas × três passos × dois modos = 60 buscas, 1.739 casas**.
  O escrito fica em `mente/e4-jogo.md`, `mente/e4-desenho.md` e no bloco de E4 de
  `mente/formas.md`.

  **O que NÃO coube, e fica endereçado para não se perder** *(a mesa parou aqui por
  ordem da pessoa, para ela avaliar — não por falta de caminho)*:
  1. **A mira na criatura** — `src/grade-de-batalha.jsx`, a linha
     `const clicavel = mirando ? tiro : indo;` na camada do toque; `podeIr` ×
     `noAlcance` já vivem separados ali ao lado. Peça `A mira`, conjunto `172:5328`.
     **Decidido e não construído:** o alvo é a **casa**, nunca a ficha (a ficha mede
     **38,4 px**, abaixo do piso de 48), e **armar um verbo de criatura apaga o véu
     do passo** — 83 casas âmbar e 1 alvo âmbar seriam uma cor a dizer duas coisas.
  2. **O varredor do anel** — as cinco maneiras de o apagar já estão em prosa na
     caixa de `.tv-anel-foco` (`src/estilo.js`), e **a lei já está no código**
     (`outline` a carregar, `box-shadow` só no vão). Falta **o dente que a prenda** —
     e ele paga **A11** de brinde, que é a irmã exata da quarta maneira.
  3. **A marca na borda** — **desbloqueada e não montada, por tempo e não por falta
     de dados**: `combate.js:441`, `lugarDaAcao` devolve `onde`, `alvoOnde` e
     `metros`. Peça `A marca de borda`, `53:43`, 8 variantes.
  4. **Buraco declarado pelo `oficial`:** a marca `a paragem` só desenha com
     `podeIr.size > 0` — **com o passo gasto a paragem existe e não se vê**.
     `src/grade-de-batalha.jsx`, a linha `{!focada && podeIr.size > 0 && (`.
  5. **Por que 3 paragens de `Tab` e não 2:** a primeira é o `⤢ ampliar`, que K4/E3
     puseram na ordem de propósito. **A variância é 0, que era o que a catraca
     queria.** Para chegar a 2, o que sai é o `⤢` — e isso é decisão de desenho.
  6. **`usarTelefone()` não reage a mudança de viewport depois de montado**
     (`src/painel-batalha.jsx:66-78`). *Ressalva honesta do `oficial`:* pode ser a
     emulação a não disparar o `change`, e uma rotação real dispararia — **não se
     sabe distinguir sem um telefone de verdade**. O custo de estar errado é o
     telefone abrir em arranjo de mesa.

- [x] **dois números que E3 leva de graça, e um deles é uma reprovação viva**
  · leve · de: desenho · 15/09 (E1) · **fechado em E3 — e nenhum dos dois foi pago
  por E3**
  **O primeiro tinha-se corrigido sozinho, de lado, e ninguém deu por isso.** A
  conta estava certa: `T.violet` a 60 % sobre `bg` dá **2,689:1** e reprova o WCAG
  1.4.11. Mas **W2 trocou o token para `T.violetSoft`** por outro motivo, e o
  contorno mede hoje **3,786:1 — passa com folga**. O `oficial` mediu antes de
  aplicar e **não tocou na linha**. *É o melhor argumento que esta mesa tem para a
  regra de medir de novo antes de corrigir um número escrito noutro ciclo.*
  **O segundo já tinha sido pago por E2**, e a catraca
  `check-endereco-do-tabuleiro.mjs` §6 morde se `#141020` voltar.
  **De brinde, um terceiro que ninguém tinha contado:** um `#14101F` escrito à mão
  dentro de `PainelHabilidades` — `T.onSecond` byte a byte —, achado e morto ao
  levar a gaveta para casa própria.
  *(o texto original:)*
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


- [x] **R17a · `A Consequência` ganha `Saída` no código** · **FEITA no próprio
  ciclo R17** · de: desenho · médio
  32 variantes no Figma, `minHeight` ligado a `alvo/piso`. Em código a peça
  **nunca existiu** (105 `title` fazem-lhe as vezes). Constrói-se junto com o
  primeiro construtor, que é o cartaz. Forma fechada em `formas.md` §R17 §§1-4.
  **Nasceu em `src/ui.jsx` com os cinco canais e a cor igual nos dois estados.**
  `Forma=Balão` **não** foi construída e degrada para `linha`: `formas.md` fixa o
  movimento do balão e não a **forma de repouso**, e o `aprendiz` recusou-se a
  inventá-la — bem. *Fica como pergunta ao `desenho` para o dia em que houver o
  primeiro consumidor; hoje não há nenhum.*

- [x] **R17b · a fenda `o que colidiu`** · **FEITA no próprio ciclo R17** · de: desenho · leve
  Segunda propriedade de texto de `Consequencia`, vazia por omissão. **É ela
  que torna o falso positivo visível** (`formas.md` §R17 §4). Especificada,
  não desenhada.

- [x] **R20 · a coluna estreita perde a fita das abas** · **FEITO em R21 (24/09), pela ideia da pessoa: a HUD recolhida — ver `formas.md` §R21 e `mente/diario-desenho.md`** · de: jogo · 24/09 ·
  **a proposta ambiciosa de R17** · médio, **e só acontece se o censo a
  sustentar**

  **O que se propõe.** A fita de cinco abas — `GESTÃO · DIÁRIO · BOLSA · MAPA ·
  CÓDEX` — ocupa **76 px permanentes, 9,4 % da altura do telefone**, e as cinco
  são **acervo** pela régua de R17, que manda acervo para trás de um toque nos
  dois aparelhos. A fita cumpre a letra (é um toque) e falha o espírito: são
  **cinco portas sempre abertas para cinco salas que ninguém compara com a
  cena**. É, hoje, a maior faixa permanente da tela sem um leitor na prosa.

  **E há um argumento mais forte do que o uso: as salas já têm porta.** R13 fez
  da cinta inteira **um alvo só** que abre a ficha — e PV, bolsa, relógio e prazo,
  que estão na cinta, são exactamente o **estado** cujo **acervo** mora em
  `GESTÃO`, `BOLSA` e `DIÁRIO`. *É a mesma conta com que o `desenho` fechou a
  porta `+N` uma faixa acima: quando a sala já tem porta, a segunda porta não é
  acesso — é mobília.*

  **O que a pessoa ganharia, em número:** a página a ler passa de **359 para
  435 px — 53,6 %**, acima da linha que a mesa assinou em R5a, e **1,42× a
  página de hoje**. Peças permanentes na tela: **6 → 5**.
  *(Conta refeita em `formas.md` §R17 depois de o campo ganhar piso 90: a minha
  primeira versão dizia 475 e 1,55×, e assentava num campo de 66 px que a medida
  do `desenho` desmentiu.)*

  **A catraca, e ela é o corpo da proposta e não um apêndice:** esta é a coisa
  mais *reaprender* que a mesa propôs desde que a ordem de 23/09 lhe deu a
  decisão, e por isso **não se faz por argumento — faz-se por censo.** Vinte
  turnos, contando **quantas vezes cada aba é aberta e a partir de onde**. R13
  aposentou quatro botões de cabeçalho exactamente assim (`🎲` 0 usos, `📜` 0
  usos), e **a fita é a última peça da tela principal que nunca passou por um
  censo**. Aba aberta com frequência a partir da tela principal fica, e a
  proposta encolhe para as outras. *Uma proposta ambiciosa que se recusa a ser
  medida é só uma proposta arrojada.*

  *Não vai a "Para a pessoa decidir" porque um commit revertido conserta isto
  inteiro — é uma faixa de leiaute. Pela régua de 23/09, é da mesa, e fica
  escrita com o mesmo cuidado com que iria para lá: o que muda é quem decide,
  não o rigor.*


- [x] **R18 está ASSINADO pelo `jogo`, com duas condições** — e o argumento dele
  é melhor que o meu: *uma cortiça verdadeira **é** uma parede de títulos; a
  tábua de papéis todos abertos é que nunca foi uma tábua.* **R18 deixa de ser
  um ganho de densidade e passa a ser uma reparação de metáfora que dá densidade
  de lucro.**