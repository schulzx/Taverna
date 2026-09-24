# Pedidos ao sistema

A mesa de design escreve aqui o que **precisa do motor** e não pode escrever
ela mesma — regra, número, porta em `turno.js`, função pura. A mente do
sistema lê daqui ao escolher o item do ciclo, e trata cada pedido como
qualquer outro item da sua fila: pelo peso.

**Este arquivo existe por um motivo de encanamento, não de organização.**
`git commit -- <caminhos>` protege as duas mentes de commitarem o trabalho
uma da outra — **exceto num arquivo que as duas editam por desenho**, que era
`mente/pauta.md`: o desenho escrevia pedidos lá dentro. Aconteceu três vezes
(`a6a6473`, `e430a12`, `63e0667`), a última com o commit de W1 levando dentro
o bloco de X4 sem o mencionar. Separar o arquivo custa menos que uma trava
nova, e resolve a causa em vez do sintoma.

**Quem escreve:** `regente` (e as mãos dele). **Quem lê e responde:**
`orquestrador`. **Quem atende:** `backend`. Ao atender, o sistema marca `[x]`
com a versão, e a linha fica — o histórico do que uma mente pediu à outra é
barato e vale.

Formato: `- [ ] **o que falta** · de: <etapa> · dd/mm` + duas ou três linhas
dizendo **para quê**, porque um pedido sem o porquê vira adivinhação.

---

## Abertos

- [ ] **o XP que a oferta promete não é o XP que o recibo paga** · de: R6/R13 · 23/09
  **Medido a jogar, duas vezes em duas:** a soleira ofereceu `◉205 · +166 XP` e
  pagou **191**; ofereceu `◉115 · +111 XP` e pagou **130**. *O ouro bate sempre;
  o XP vem sempre ~15 % acima.* Há um bónus aplicado no pagamento que a oferta
  não sabe prever.
  **Para quê:** a Fase R tirou o preço de dentro de um `title` e escreveu-o na
  cara da oferta, justamente porque **o veredito vem antes do clique** — e uma
  promessa escrita que o recibo desmente é pior do que a promessa escondida que
  havia antes. *Esta etapa tornou o defeito visível; não o criou.*
  **O que se pede:** ou a função que prevê o XP da oferta passa a incluir o
  bónus, ou o bónus deixa de existir. **Um dos dois números tem de sair da
  mesma tabela.**

- [ ] **`Convidar Vero` é um controlo que só pode gastar o turno** · de: R6/R13 · 23/09
  A oferta diz, na própria cara, que a pessoa vai **recusar** (a exigência é
  *"mais 5 dias de estrada juntos"*), continua clicável, **gasta uma chamada ao
  Narrador**, e permanece na soleira depois de falhar.
  **Para quê:** o §2.7(b) de `mente/r13-mesa.md` manda que *oferta cuja
  pré-condição o sistema já sabe que falha não entra na soleira* — e o `oficial`
  **não a implementou, e fez bem**: precisa que `pesarConvite` (`src/indole.js`)
  saiba marcar uma exigência como **não pagável agora**. Isso é regra, não
  pintura, e regra não é da mesa de desenho.
  **O que se pede:** `pesarConvite` (ou irmão) devolver, junto do veredito, se a
  exigência é **impossível neste momento** — para a soleira a esconder em vez de
  a oferecer. *Um controlo cujo único resultado possível é perder o turno não
  devia estar na tela.*

- [ ] **sair para o menu e reentrar pode reescrever `nomeCampanha` para "Aventura"** · de: R13 · 23/09 · **custa dado de jogador**
  `largarASala()` limpa o nome **antes** de `continuar()` o repor, e o autossave
  apanha a janela entre os dois. **Visto acontecer num save real** durante este
  ciclo: *"A Prova do Depois"* virou *"Aventura"*. O `oficial` restaurou o save
  byte a byte.
  **Para quê:** é a única coisa desta lista que **um commit revertido não
  desfaz** — o save já foi reescrito na máquina de quem joga. Pela régua de
  23/09 isso põe-no acima de tudo o resto que está aqui aberto.
  **O que se pede:** que `largarASala()` não deixe o estado passar por um
  momento sem nome, ou que o autossave não grave enquanto ele estiver vazio.

- [ ] **`teste-sala.mjs` falha de forma intermitente, e um dia vai recusar um push sem motivo** · de: R13 · 23/09
  **Confirmado por duas mãos em separado neste ciclo:** deu `124/125` numa
  passagem e `125/125` em seis seguidas sobre o mesmo conjunto exacto, e é verde
  em HEAD puro. *Não é de nenhuma das duas mentes.*
  **Para quê:** a lei desta casa é que **vermelho não sobe**. Uma suíte que
  falha ao acaso numa corrida de 206 transforma essa lei num sorteio — e o custo
  não é o teste, é o ciclo que para para investigar um vermelho que não existe.
  *Fica escrito agora, e não na noite em que acontecer.*
  **A pista:** `teste-sala.mjs:20` abre com `readFileSync("../src/App.jsx")` —
  **relativo ao `cwd`**, que só é `testes/` porque o `rodar-tudo.mjs` o põe lá.
  **Há ~20 arquivos com o mesmo padrão.** Não é seguramente a causa, mas é o
  sítio por onde eu começaria.

- [ ] **`src/soleira.js` — a régua da soleira é módulo puro e está presa no `App.jsx`** · de: R3/R4 · 23/09
  A Fase R construiu a **soleira**: a região fixa entre a página e o campo do
  turno onde vive **o que o mundo ofereceu e o jogador ainda não atravessou**.
  A lei que a governa é do `jogo` e é de decisão, não de pintura: *só se oferece
  o que o SISTEMA sabe e o jogador não consegue adivinhar* — e a ordem é por
  **perecibilidade** (quem espera resposta · quem está em cena · o papel que
  alguém pregou · a tábua da cidade · o mercado), régua que o `oficial` corrigiu
  **jogando**, ao ver que o mural prega outro cartaz no instante em que um é
  aceito e que por isso uma pessoa recém-entrada em cena nunca aparecia.
  **O que se pede:** `ofertasDaSoleira(mural, missoes, npcs, mercadoAqui, personagem, veredito)`
  → lista de descritores, em `src/soleira.js`, provável em Node. Hoje ela vive
  dentro do `App.jsx` porque `src/*.js` é território do sistema e o `oficial`
  **acertou em não a escrever lá**. Está nomeada e legível, para sair inteira.
  **Para quê:** quais ofertas nascem, em que ordem e com que preço é **decisão de
  jogo** — e decisão de jogo se prova em Node, não se olha na tela. Sem isto, a
  única catraca da peça é o olho de quem a montou.

- [ ] **`check-acoes-do-jogador.mjs` mede o TEXTO do handler e não se ele corre** · de: R4 · 23/09
  Achado ao aposentar os 20 verbos: o varredor afirmou durante um ciclo inteiro
  que *"o botão `Atacar` segue chamando `declararGolpe`"* — e o botão estava
  **morto desde E3**. `vereditoDoGolpeAgora()` abre com `if (!comb) return null`
  sobre `combateRef.current`; o painel só se pinta sob `!emBatalha`; logo `vdGolpe`
  era **sempre `null` ali**. A fiação de X2 morreu no dia em que E3 levou a
  batalha para `src/painel-batalha.jsx`, e nada avisou.
  **Para quê:** um varredor que lê o texto de um handler prova que alguém o
  escreveu, não que ele acontece. É a mesma classe de defeito que a casa já
  pagou cinco vezes com o anel de foco — **o ónus está do lado errado**.
  *(E dois endereços já estavam podres no HEAD antes desta fase: `:16109` e
  `:15858` apontam funções erradas. Ficam escritos.)*

- [ ] **`passarTempo` não tem porta de texto, e é por isso que `Esperar` está na soleira emprestado** · de: R5 · 23/09
  `passarTempo` **move o relógio, vira o dia, cobra a renda e muda o clima**. E
  escrever *"espero doze horas"* faz o Mestre **narrar** doze horas **sem mexer
  num único número** — confirmado ao vivo. É a família inteira do diagnóstico de
  R1: **50 verbos de sistema atrás de abas contra 17 portas que o texto abre.**
  **Para quê:** o `jogo` mediu, pela régua que ele próprio escreveu, que
  `Esperar` **não é oferta** — *o jogador podia ter pensado em esperar sozinho*.
  Ele só está na soleira porque a Fase R lhe tirou a aba `Tempo` e tirá-lo sem
  substituto removeria uma função. **Com a porta de texto, ele sai da interface e
  o problema dissolve-se.** Irmão do pedido sobre o veredicto do golpe fora do
  combate.

- [ ] **o título de um contrato sai "Praga em as terras baixas"** · de: R5 · 23/09
  A contracção portuguesa (`em` + `as` → `nas`) não é feita na geração. Passou
  despercebida enquanto o título vivia atrás de duas abas; **na soleira ele está
  na tela principal, em tamanho de leitura, no primeiro ecrã.** É `src/ofertas.js`.
  **Para quê:** a prosa é a protagonista deste jogo, e a mesa de design não pode
  consertar uma frase que o motor escreve.

- [ ] **`teste-palco.mjs` mede uma folga de caracteres onde queria medir uma ordem** · de: R3 · 23/09
  O proxy `iCab − iArea < 900` subiu para **1100** nesta fase, e é a **segunda
  vez** que sobe por causa de comentário (400→900 na v9.170). A lei real que ele
  quer guardar é *"o cabeçalho vem antes da primeira mensagem"*, e isso mede-se
  contra `agruparMensagens`, não contra uma distância de bytes. O `oficial` deixou
  escrito e **não mudou a asserção de outra mesa por conta própria** — correto.
  **Para quê:** um número que sobe sempre que alguém escreve um comentário não é
  catraca, é imposto.

- [x] **`turnoDosInimigos` mede a distância e deita-a fora** · **ATENDIDO 16/09 · v9.279 · commit `e112017`** · de: E4 · 16/09
  **A resposta:** a ação passa a levar **três** campos — **`onde`** (a casa de
  quem agiu), **`alvoOnde`** (a casa de quem apanhou) e **`metros`** (a
  distância que `alcanca` já media e se deitava fora). `metros` é
  **atacante→alvo**, não até a câmara: por isso `alvoOnde` vem junto, para quem
  quiser medir da câmara fazer a sua conta. Exemplo: goblin em `(3,1)`, herói em
  `(3,2)` → `metros 1.5`; atirador a 16 filas → `metros 24`.
  **Aditivo por construção:** `lugarDaAcao` devolve `{}` quando não há o que
  dizer, e espalhar `{}` não acrescenta chave nenhuma — os oito campos de
  ontem continuam todos, com os mesmos valores. **Sem grade nenhum dos três
  nasce** (`!("metros" in a)`, não `null` nem `0`): *"não sei onde ele está"*
  fica distinguível de *"está a 0 m"*, e zero metros **medido** continua a
  nascer, porque colado é medida de verdade. **Teto de prompt intocado** — o
  leitor do App itera campos nomeados e nunca serializa a ação.
  Provado em `testes/teste-onde-foi.mjs`. **A marca de borda de E1 tem tudo o
  que precisa.**
  *(o pedido original, como E4 o escreveu:)*
  **Escrito no começo do ciclo, de propósito** — um pedido que chega no fim perde
  um ciclo inteiro, porque a outra mente lê este arquivo ao semear.
  **O que falta, e é a parte barata:** cada ação devolvida por `turnoDosInimigos`
  (`src/combate.js:299`) é `{ inimigo, alvoRef, alvoNome, r, golpe, deTotal,
  golpeNome, virado }` — **o nome de quem bateu, e mais nada sobre onde ele está**.
  Mas o motor **já sabe**: dentro do mesmo laço ele chama
  `alcanca(grade, { ...inim }, alvo.onde || pos, …)` (`:355`) e
  `bonusDefesaEm(grade, alvo.onde || pos)` (`:372`). **A conta é feita, usada para
  decidir o golpe, e deitada fora antes de voltar.** O pedido é só não a deitar
  fora: que a ação carregue **`onde`** (a casa de quem agiu) e a **distância em
  metros** que `alcanca` já mediu.
  **Para quê, e é uma regra de E1 que hoje está meia:** a regra 3 do enquadramento
  diz que *na vez de um inimigo do outro lado do campo a câmara **não** vai atrás —
  a borda ganha a marca com **o nome e a distância***. E3 construiu a metade que
  protege (a câmara não persegue, por construção); **a metade que informa é esta**,
  e sem `onde` não há borda onde a pôr nem distância para escrever. A peça já
  existe e está fabricada desde E1: `A marca de borda`, `53:43`, **8 variantes**.
  **O custo de não ter:** medido na conferência viva de E3 — herói e inimigo a **16
  filas numa janela de 11**, onde *ver um é deixar de ver o outro* durante toda a
  aproximação, e **quem age fora da janela age em silêncio absoluto**. Não é um
  caso de canto: é o caso normal em 8 das 10 plantas, agora que o campo mede 583 px.
  *Se a resposta não vier a tempo, E4 faz as outras aberturas e a marca fica para
  E5 — mas então ela fica por falta de três campos num objeto que já os tem.*

- [~] **o passo não é cobrado: 21 m numa rodada com o contador imóvel** · de: E3 · 16/09 ·
  **MEDIDO EM v9.279 — E NÃO É O QUE O PEDIDO DIZIA. A peça pura está feita; o
  que falta são SEIS LINHAS DE `App.jsx`, e o bastão é do dono dele.**
  **A causa-raiz:** não falta desconto em `movimento.js` — **a luta nasce sem
  `economia`**. `equiparCombate` (`App.jsx:4929`, a porta única de
  `abrirCombate`) monta `{ …, rodada: 1, recursos: novosRecursos() }` **sem
  `economia`**; ela só nasce na virada de rodada (`:14179`). E o desconto do
  passo faz `eco ? { ...eco, movM: sobra } : eco` (`:14636`) — **sem `eco`,
  evapora**. A rodada 1 inteira é de graça: são exatamente os 21 m com a marca
  parada em `9 de 9`.
  **E a mesma linha em falta tem um SEGUNDO sintoma:** a guarda da ação
  (`:11663-11668`) está atrás de `if (eco)`, logo o aviso *"Você já usou sua
  ação nesta rodada"* (`:11665`) **nunca dispara na rodada 1** — o que bate com
  a medição de W2, que contou **zero chamadas** e não soube porquê.
  **A peça pura, feita e provada** (`src/grid.js`, colada a `alcancaveisDe`,
  que é onde `METROS_POR_QUADRADO` e `custoM` já vivem — uma segunda cópia de
  1,5 m noutro módulo seria o `PISO_DO_GOLPE` outra vez):
  `PASSO_NA_RODADA`, `passoQueResta` (devolve `null` para *"ninguém andou
  ainda"*, nunca `0`, e **nunca mais que o total de hoje** — passo que encolhe
  não é burlável por saldo antigo), `podeDarUmPasso` e `passoAposAndar`, que
  **devolve sempre um número**: quem fia guarda o que vier de lá sem decidir
  nada. A caminhada da queixa está reproduzida em teste (6 · 6 · 6 · 3) e
  fecha no quarto passo.
  **A fiação, endereçada — é do dono do bastão:**
  1. `:4929` — acrescentar `economia: economiaNova(pers)` ao literal (`pers` já
     é o 2.º argumento). **Paga sozinha os 21 m E o `⏳` da ação**, e mata a
     economia rançosa que o caminho `jaNoRef` arrasta de uma luta para a outra.
  2. `:14597` → `passoQueResta(eco && eco.movM, passo.metros)`
  3. `:14598` → `if (!podeDarUmPasso(eco && eco.movM, passo.metros))`
  4. `:14614` → `passoAposAndar(eco && eco.movM, passo.metros, chk.custoM)`
  5. `:14636` → `const novaEco = { ...(eco || {}), [PASSO_NA_RODADA.campo]: sobra };`
  6. `:20804` → a marca `👣` passa a ler a mesma conta que o motor.
  **A catraca de *falha antes, passa depois* é a do commit que liga** — não foi
  entregue verde de propósito: o defeito vive em linhas que o motor não pode
  tocar, e escrevê-la antes deixaria a suíte vermelha por trabalho de outrem.
  **Reproduzido em duas lutas e nos dois tamanhos**, na conferência viva de E3:
  `F16 → F12 → F8 → F4 → E2` = **21 m numa só rodada**, com a marca
  `👣 9 de 9 m nesta rodada` **parada o tempo todo**. O jogador atravessa o navio
  no primeiro turno. **E o pedido é urgente por uma razão de calendário, não de
  gosto:** E4 (*mover é fazer*) vai ser construído exatamente em cima disto — a
  casa clicável, o alcance visível antes do passo, o veredito antes do clique. Se o
  passo não custa nada, **E4 desenha o preço de uma coisa que é de graça**, e a
  lei da casa (*o veredito antes do clique*) passa a mentir na tela onde ela mais
  importa. A tela já escreve o número; **o que falta é o motor descontar**.
  **REPRODUZIDO DE NOVO EM E4 (16/09), noutra planta e noutro tamanho, e desta vez
  com um ponteiro:** telefone 375×812, planta `cidade` 14×14, rodada 1, sem agir —
  `H14 → H11 → H8 → I8` = **7 casas = 10,5 m**, com `👣 9 de 9 m nesta rodada`
  **parado em todos os passos** e o conjunto alcançável a **crescer** 83 → 122 →
  153 → 143. **E o código do débito está CERTO:** `App.jsx:14614-14636` calcula
  `sobra = restante − chk.custoM` e escreve `{ ...eco, movM: sobra }`. O que não
  chega é a leitura — `passoDaBatalha` (`:20804`) cai no valor por omissão
  `pp.metros` quando `economia.movM` vem nulo. **Não é a conta que falta: é o
  `economia` que não existe ou não sobrevive.** *(medido pelo `jogo`; o resto do
  diagnóstico é do motor, e por isso pára aqui.)*

- [ ] **os dados do inimigo são invisíveis, com as rolagens ligadas** · de: E3 · 16/09
  Medido na mesma luta: **25 de dano recebido, zero linhas de rolagem**, com a
  preferência de rolagens em *visíveis*. O jogador vê a vida descer e não vê por
  quê. **É o contrário exato da lei desta casa** — *o Mestre é código, e a IA só
  narra*: o número existe, foi rolado por tabela, e é o único que o jogador não
  pode ver. O modal do dado é, por escrito na pauta, *"o único momento da sessão
  inteira em que senti que estava a jogar"* — e ele só acontece de um lado.

- [ ] **não há cursor de vez em `combate.js`, e sem ele a iniciativa não anda** · de: E3 · 16/09
  **Achado ao construir a faixa da vez, e a tela já foi corrigida para não mentir.**
  `combate.ordem` é rolada **uma vez** na abertura e **nunca roda**: `rolarIniciativa`
  devolve a ordem e ninguém a avança, e `resumoIniciativa` numera-a para o prompt e
  mais nada. A tela dizia *"quem age é o primeiro da ordem"* e por isso **anunciava
  o goblin enquanto o jogador jogava**, rodada após rodada — quatro rodadas, o mesmo
  nome. O `oficial` **não inventou o cursor**: passou a dizer o que este motor de
  facto faz (*agir encerra o turno; o mundo responde na mesma batida; a vez volta ao
  herói*), e deixou `combate.vez` lido à frente — **no dia em que existir, manda ele
  e nada muda de forma na tela.**
  **Para quê, e o custo de adiar:** E1 desenhou a faixa com *`Mudou=Agora`, três
  pulsos*, que é o canal por onde o jogador sabe de quem é a vez **sem ler uma
  palavra**. Esse pulso **não pode existir antes do cursor**. E a queixa é a segunda
  medição do mesmo silêncio: a pauta já tem a de 14/09, medida a jogar — o painel
  marcou o inimigo como `● AGINDO` **por mais de 10 segundos enquanto o jogo
  esperava pelo jogador**, e ele *"esperou, não soube se tinha travado, e descobriu
  escrevendo à sorte"*. **Dois ciclos, duas medições, a mesma porta em falta.**

- [ ] **`PISO_DO_GOLPE` continua declarado em dois sítios** · de: K4 · 16/09
  Herdado de K3, que o deixou escrito como dívida do `backend`. É a primeira lei
  desta casa (*se é número, é tabela*) a valer em duplicado — e duas cópias de um
  número são duas leis que um dia divergem sem ninguém ver. **Uma linha para o
  motor, e fecha a última pendência aberta da Fase K.**

- [ ] **a expiração da janela continua a gastar PM — e agora sabe-se em quantas
  classes** · de: K4 · 16/09
  K3 escreveu-o e a trava de K2 obriga-o (*quem não responde tem o de hoje, byte a
  byte*). **O número que faltava, medido em K4:** nas **cinco classes
  conjuradoras, 100 % das janelas oferecem um verbo de 2 PM**, e a expiração
  paga-o. Nas outras sete o verbo é grátis e a dívida é invisível. **Não é um
  pedido para mudar já** — é para que o motor saiba que o custo existe e onde
  mora, porque desligá-lo é mexer na trava e isso é da pessoa.

- [ ] **`PALAVRAS_DA_CHANCE` não é lida pelo caminho do cartão** · de: K4 · 16/09
  A tabela existe, está certa e sabe escrever o risco na fenda do preço — **só que
  o cartão da reação nunca a chama.** Resultado medido na tela: `esquiva ágil ·
  0 PM — anula` para uma reação com `chance: 0.6`, e `revidar · 0 PM` para uma com
  `chance: 0.55`. **É fiação, não peça nova**, e o orçamento de 40 caracteres é o
  obstáculo real (a mesa tem três saídas escritas na pauta do desenho).

- [ ] **a porta do tabuleiro em `turno.js`** · de: E2 · 15/09
  São 17 portas e **nenhuma é do campo**. Hoje *"vou até K14"* cai na porta
  `destino`, que não tem guarda de combate, vai ao resolvedor de cidades do
  mapa-múndi, gasta uma chamada ao Mestre e **ninguém anda**. Precisa de
  `casaDoEndereco`, `vereditoDoPasso` (com o `ateOnde` que não existe),
  `RECUSAS_DO_PASSO` com a catraca de 54 caracteres, e a porta
  `passo-no-campo`. **E há uma nota em `App.jsx:14568` que PROÍBE o Mestre de
  citar quadrados** — a condição não é string em falta, é instrução contrária.
- [ ] **`esperar`: passar a vez sem chamar o Mestre** · de: W1 · 16/09
  **O mais barato e o que mais paga.** São 1,4 rodadas por luta de pura
  caminhada, e hoje cada uma custa ~20 toques e uma chamada ao Narrador
  porque não existe botão de passar a vez.
- [ ] **`declararGolpe(alvo, motivo)`, `alvosDoVerbo`, `vereditoDoVerbo`** · de: W1 · 16/09
  O que o gesto de W1 precisa para perguntar ao motor antes de oferecer:
  quais alvos um verbo alcança, e o que ele custa. Hoje a tela adivinha.
- [~] **`LINHAS_DO_GOLPE` com a catraca de 54 caracteres** · de: W1 · 16/09 ·
  **RETIRADO DA FILA DO MOTOR EM W2 — a mesa de desenho assume e constrói.**
  As frases de X2 **já transbordam em produção** — 64 a 86 caracteres contra
  54, e é a frase que mais aparece no jogo.
  **Porque deixa de ser pedido:** o `desenho` mediu em W2 e a peça não é do
  motor — é `src/golpe.js`, **nascido em X2, desta mesa**, e o próprio
  `App.jsx:1106` escreve que *"`golpe.js` mede e devolve números; estas três
  funções os VESTEM"*. Vestir número é forma. A tabela, o aparo, a redacção
  das quatro frases e as cinco asserções estão **fechados e medidos** em
  `mente/w2-desenho.md` §3.3-3.5: nada falta decidir, só aplicar.
  **Porque não foi aplicado em W2:** os **dois** leitores de `recusaDoGolpe`
  vivem no `App.jsx` (`:11981` no chat, `:20910` na linha do veredito), a
  troca é **atómica** — meia troca é a mesma regra em dois caminhos, o bug que
  esta casa já pagou três vezes — e o **bastão do `App.jsx` esteve com a outra
  mente o ciclo inteiro**. **W3 constrói, numa passagem só.**
- [ ] **um teto de nome na fonte do inimigo** · de: W2 · 16/09
  `completarInimigo` (`bestiario.js:92`) aceita o nome que a IA mandar, **sem
  teto**; `garantirLuta` (`adversario.js:219`) já faz `limpar(o.nome, 40)`. O
  teto existe num sítio e falta no outro — e `regras-jogo.js:388`, ao descartar
  nomes repetidos, **força o Narrador a alongá-los** nas lutas com mais de um
  inimigo, que são as que a linha do veredito mais trabalha. Sem isto, a
  `curta` de `LINHAS_DO_GOLPE` é curta para as tabelas e larga para o jogo.
- [ ] **o ouvido do adversário** · de: W2 · 16/09
  `garantirLuta` (`adversario.js:211-260`) tem trinta e tal campos de mundo e
  **nenhum de herói**: as quebras de intenção lêem `minhaVida`, `rodada`,
  `protegidoQuebrou`, e **nenhuma lê o que o herói disse**. Um campo
  `foiAmeacado` daria ao `receoso` (`:628`) e ao `fugir_ferido` (`:515`) um
  segundo gatilho — e é o que separa a fala em combate de ser decoração.
  *É mecânica nova: pesado, e a decisão é da pessoa (w2-jogo.md §5).*
- [ ] **`TETO_DA_FALA_DO_JOGADOR = 240`, em `falas.js`** · de: W2 §8.2 · 16/09
  Ao lado de `TETO_DA_FALA` (320), porque é o mesmo assunto e a suíte que lê um
  passa a ler os dois. 240 não é número novo: é o `slice` que `falas.js:82` já
  aplica a *"o que o herói acabou de dizer"*. Medido: o envelope da fala no
  pior caso dá **227 + 240 = 467** caracteres, contra a maior nota que já viaja
  hoje (356, a aflição da arma) — **1,31×**, **+0,57%** do teto de prompt, uma
  vez por rodada. **A fala que estoura é RECUSADA, nunca truncada em silêncio**,
  e o teto **não** pode ir ao `maxLength` do `<input>` (`App.jsx:21553`): a
  caixa tem três empregos e cortaria também a frase que age.
- [ ] **a chave da fala em combate não pode ler o texto do jogador** · de: W2 §8.1 · 16/09
  `lerAcao` chaveia o desafio social por `lugar|alvo|<pessoa>|<tamanho>`
  (`desafios.js:916-918`), e o `tamanho` sai de `tamanhoDoPedido(texto)`
  (`social.js:135`): **seis chaves distintas para a mesma ameaça**, logo seis
  tentativas antes de o livro travar. E `pessoaNaFrente` (`App.jsx:15536`) lê o
  elenco de NPCs, **não os inimigos** — com um companheiro na cena, a ameaça
  gritada ao ogro é chaveada ao nome do companheiro. Em combate a chave devia
  ser `lugar|intimidacao|<nome do inimigo>` e mais nada. *(`lugar` **é** estável
  na luta: `App.jsx:7139` e `:5956` fecham as duas portas que o mudariam.)*
- [ ] **`vereditoDoGolpeAgora` precisa de saber o que está na caixa** · de: W2 §8.3 · 16/09
  Hoje `const vdGolpe = vereditoDoGolpeAgora();` (`App.jsx:20846`) lê só o
  tabuleiro. Com a frase a ter dois destinos (golpe ou fala), o jogador não tem
  como saber qual vai sair antes de carregar em `Agir →` — e *"o veredito antes
  do clique"* fica cumprido para o tabuleiro e por cumprir para a frase.
- [ ] **um contador de falas por luta — e ele tem de nascer ANTES de W2** · de: W2 §8.4 · 16/09
  W2 vale por destravar um comportamento, logo tem de ser medível depois: o
  número é **falas por luta**, sobre ≥ 20 lutas, e a banda é **0,5 a 1,2**
  (abaixo, o campo ficou vazio; acima, virou imposto de abertura). **Nenhum
  contador de hoje serve:** a mesa de `mestria.js` escreve `pilar: "combate"` em
  toda luta (`App.jsx:9379`, sobrescrevendo o `social`) e `anotarTurno` só corre
  quando uma resposta do Mestre volta (`:9376`) — a fala de W2 não gera chamada
  e nunca seria anotada. Um campo por luta em `combateRef` e um agregado curto
  no save bastam. **Se o contador nascer junto com W2, o depois é medido contra
  nada e a aposta fica sem forma de perder.**

- [ ] **uma catraca que prove que `metrosTxt` nunca passa de 4 caracteres** · de: W2 · desenho · 16/09
  O orçamento das quatro frases de `LINHAS_DO_GOLPE` assume que o número mais
  largo que `metrosTxt` (`grid.js:50`) escreve mede **4** (`10,5`) — e nada no
  motor o garante. Uma planta maior, ou uma distância que passe de 99 m, empurra
  a frase para 55 sem que nenhuma suíte se queixe, porque a catraca mede o teto
  da frase e não o teto do número. **Ou a catraca existe, ou a tabela tem de
  declarar 5 e perder um caractere de nome nas quatro.**
- [ ] **o teto de nome na fonte tem número: `limpar(nome, 24)`** · de: W2 · desenho · 16/09
  *Refinamento do pedido do `jogo` acima, não um segundo pedido.* Medido: a
  entrada mais apertada das quatro (`parede`) só apara nomes acima de **25**
  caracteres, e o máximo das tabelas é **18** — logo **a redacção do `desenho`
  aguenta sem este teto**, e até contra um nome de 200 caracteres, porque o aparo
  mora na tabela. **24 é o maior teto que nunca faz o aparo morder**, e é seis
  acima do máximo das tabelas: com ele, o aparo passa a ser cinto contra o
  inesperado em vez de comportamento normal. *Não bloqueia `LINHAS_DO_GOLPE`.*

- [ ] **`escolherReacao` rola `Math.random` por dentro, e isso agora tem preço
  medido** · de: K2 · jogo · 16/09
  `reacoes.js:96` chama `Math.random()` para a `chance`, e a lei da casa é
  *determinismo por semente*. A dívida já estava nomeada; **K2 é a primeira etapa
  que mediu o que ela custa**: para provar a trava foi preciso **trocar o
  `Math.random` global em `try/finally`** à volta da chamada — um cinto, e um
  cinto é sempre menos honesto que um rolador por parâmetro. **O pedido é uma
  assinatura, não uma regra nova:** `escolherReacao({ …, rolar = Math.random })`,
  com o valor por omissão intacto. Quem não passa o rolador tem o jogo de hoje,
  byte a byte — e a suíte passa a semear em vez de trocar um global.
- [ ] **a extracção de `reacoesQueSeAplicam` é regressão zero SÓ enquanto o rolo
  ficar na mesma posição da sequência** · de: K2 · jogo · 16/09
  A pauta de K3 manda extrair de `escolherReacao` os mesmos filtros **sem** o
  `Math.random()`, para que `PISO_DO_GOLPE` deixe de ter dois donos. **Está
  certo, e é de graça no número de rolos — com uma condição que ninguém tinha
  escrito:** `escolherReacao` tem de continuar a rolar **um dado por candidata
  testada, na ordem de `REACOES`, e a devolver a primeira que sobrevive ao seu
  rolo**. Mover o rolo da oferta para a resolução **muda o mundo de quem
  responde**, e esse mundo não está travado por nada. **A asserção 12 de
  `testes/teste-trava-da-reacao.mjs` já fixa a contagem de rolos de hoje** — no
  dia da extracção é ela que diz se foi de graça. *Não é um veto: é a catraca que
  torna a extracção segura de fazer.*

- [ ] **`resolverReacao` não tem ramo de falha — e é o buraco maior da Fase K** · de: K3 · 16/09
  `esquiva_agil` (0,6) e `contra_ataque` (0,55) têm `chance`, `PALAVRAS_DA_CHANCE`
  escreve o risco na fenda do preço (*«mais vezes que não»*), e **`resolverReacao`
  corta sempre**. K3 contornou-o sem inventar regra: **quem responde resolve-se
  pelo mesmo caminho de quem não responde** (`reacaoDoSilencio` a partir de
  `abre.ordem`), logo a `chance` continua a viver dentro de `escolherReacao` e o
  laço continua a tentar o golpe seguinte — **é isto que preserva os 97,6 % de
  esquiva do ladino em vez de lhe dar 100 % de graça**. O contorno custa uma
  assimetria declarada: **num leque de 2+ verbos** (0 de 12 classes por classe;
  só com Contramágica escrita na ficha) o App rola a `chance` do verbo escolhido
  **ele mesmo**, porque não há por onde pedi-la ao motor. **O pedido é o ramo:**
  `resolverReacao` que devolva `{ falhou: true }` em vez de cortar sempre, e
  `escolherReacao` a receber o rolador por parâmetro — as seis linhas do cinto de
  `reacaoDoSilencio` saem inteiras no mesmo dia. **As palavras já existem** e
  estão escritas em `src/palavras-da-reacao.js` (`PALAVRAS_SEM_GESTO`), à espera
  da mecânica.

- [ ] **o que `recusou` recusa: a pergunta, ou o recurso?** · de: K3 · 16/09
  Não está escrito em lado nenhum, e K3 teve de decidir para construir. **A
  decisão de desenho é *os dois*** (`reacaoUsadaRef` fica marcada), e a razão é
  dura: se o recuo só recusasse a pergunta, os golpes cobertos continuariam a ir
  ao motor de hoje e o log escreveria `⚔ REAÇÃO — Aparar` **na linha a seguir a o
  jogador ter dito que não**. *O sistema a desmentir o jogador na linha seguinte é
  pior do que não lhe ter perguntado.* **Mas é regra, e quem faz regras confirma
  ou corrige** — hoje ela vive numa linha de fiação do `App.jsx`, que é o pior
  sítio para uma regra morar.

- [ ] **o `oportunidade` automático consome a reação da rodada?** · de: K1 §6b · três etapas por responder
  Pergunta aberta desde K1, e dela depende **o preço que o recuo pode escrever**:
  se o golpe livre gasta a reação, recusar no `inimigo_erra` compra alguma coisa
  de verdade; se não gasta, não compra nada e a frase do cartão promete a mais.
  K3 construiu sem a resposta porque `inimigo_cai` não abre janela — mas a
  pergunta não fica mais barata por ser adiada a quarta vez.

- [ ] **o prazo tem de saber quantas noites FALTAM, em tempo de calendário** · de: R13 · 23/09
  **É condição de uma peça, não melhoria dela.** `O selo de prazo` (R13,
  `mente/formas.md`) substitui a fita de chips e **conta ao contrário**:
  `5 noites` → `2 noites` → `esta noite`. Hoje o relógio de prazo conta
  **passos dados** (`1/4`) e só anda quando se **dorme** — e o `jogo` mediu
  jogando: **o chip ficou `1/4` enquanto o calendário andava de 1 para 14 de
  Brumal, treze dias.** O jogador vê o relógio saltar duas semanas e o prazo
  parado, e conclui, com razão, que o prazo não é a sério.
  **O que o desenho precisa:** uma função pura que devolva, para um contrato
  aceite, **quantas noites de calendário restam até ao vencimento** — não
  quantas foram dormidas. Sem ela a peça diz "3 noites" durante duas semanas,
  e aí **mente melhor do que a de hoje**, que é o pior resultado possível: a
  forma nova a dar credibilidade a um número errado.
  *A peça expõe o defeito em vez de o esconder — mas só se o motor souber a
  resposta.*

- [ ] **o botão `Início` não navega — é um controlo que não faz nada** · de: R13 · 23/09
  Achado pelo `jogo` nos 20 turnos de R6: tentou uma vez, **e não aconteceu
  nada**. Ele vive no cabeçalho de 73 px que R13 aposenta, e a etapa dá-lhe
  morada nova (o pé da ficha) — **mas mudar de sítio um botão morto é mudar o
  defeito de sítio.** Ou volta a navegar, ou sai.
  *Vai aqui e não na pauta do desenho porque a fiação é do outro lado: a forma
  do botão está certa, o que falta é o que ele faz.*

## Atendidos

_(vazio)_
