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
- [x] **o indice do git e compartilhado pelas duas mentes, e a lei nao cobre isso** · feita · texto em `mente/arquivo/pauta-feitas.md`
- [x] **o alvo tático já está ligado no jogo, e a régua nunca o viu** · feita em v9.251 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **a habilidade de classe não tem resolvedor — contar antes de decidir** · feita em v9.250 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **a habilidade de classe não tem resolvedor** · feita · texto em `mente/arquivo/pauta-feitas.md`
- [x] **não existe PV temporário em lugar nenhum** · feita · texto em `mente/arquivo/pauta-feitas.md`
- [x] **o herói é um passageiro no próprio combate difícil** · feita · texto em `mente/arquivo/pauta-feitas.md`
- [x] **o golpe fora de alcance continua de graça — ou passa a custar o turno?** · feita em v9.20 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **`Esquivar`, `Empurrar`, `Derrubar`, `Ajudar` — quatro verbos de combate sem motor nenhum** · feita · texto em `mente/arquivo/pauta-feitas.md`
- [x] **C2c · o inimigo conjurador é órgão novo, não etapa** · feita em v9.66 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **o companheiro fica envenenado para sempre** · feita em v9.241 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **o bônus de dano do companheiro nasce e é inerte** · feita · texto em `mente/arquivo/pauta-feitas.md`
- [x] **quatro das cinco famílias defensivas ainda não protegem** · feita · texto em `mente/arquivo/pauta-feitas.md`
- [x] **a concentração está escrita e nunca acontece** · feita · texto em `mente/arquivo/pauta-feitas.md`
- [x] **a família defensiva é promessa que nenhum não-jogador cumpre** · feita em v9.233 · texto em `mente/arquivo/pauta-feitas.md`
## Aprovado pela pessoa — executa como fase, UMA etapa por ciclo

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

- [x] **H1 · a porta** · feita em v9.265 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **H2 · de quem já são os 12** · feita em v9.266 · texto em `mente/arquivo/pauta-feitas.md`
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
- [ ] **H4 · a marca** (efeito preso a um alvo que soma dano) · de: pessoa · 16/09
  **O canal já chega lá.** `resolverAtaque` recebe `condAlvo` nos três sítios
  de ataque (`App.jsx:7686`, `:11855`, `:12211`), mas `combate.js:126-127` faz
  `danoBase + modAtk.danoExtra − modAlvo.danoReduzido`: **do lado do alvo só se
  lê `danoReduzido`**, logo uma condição no alvo só sabe fazê-lo apanhar menos.
  **Parta em duas:** *"dano extra de todos"* (**Julgamento**) é ler o espelho
  que falta; *"dano extra SEU"* (**Marca do Caçador**, **Maldição do
  Patrono**) precisa de saber **de quem é a marca**, e o efeito de `efeitos.js`
  não tem campo de dono. A primeira metade é pequena; a segunda abre campo
  novo, e o veredito de tamanho é da etapa.
  **Entra junto o defeito que esta etapa desnuda:** hoje a Maldição do Patrono
  aplica `enfraquecido` (`danoReduzido: 2`, `condicoes.js:155`) e **deixa o
  inimigo mais duro** — o avesso exato da promessa.
- [ ] **H5 · a aura que reage** · de: pessoa · 16/09
  Sozinha na família: só **Coração Tempestuoso**. Pede o campo que
  `efeitos.js` **não tem** — um gatilho que *dispara*. `GATILHOS`
  (`gatilhos.js:36`) existe e só sabe **encerrar** um efeito
  (`romperPorGatilho`, `:113`), nunca acionar; e `moverInimigos`
  (`grid.js:614`) move e devolve, sem perguntar a ninguém quem chegou perto.
  Uma habilidade só é pouco para um órgão: **medir se o gatilho que dispara
  paga sozinho, ou se espera companhia**, é a primeira pergunta da etapa.
- [ ] **H6 · a zona presa ao lugar** · de: pessoa · 16/09 ·
  **NÃO COMEÇA SEM A PALAVRA DA PESSOA — toca o formato do save (lei da casa).**
  A mais cara, e a única com meio-dono no tabuleiro: `grid.js` **já guarda
  estado por casa** (`paredes`, `estorvos`, chaves `"x,y"`, `:301`/`:311`),
  lido por `ehParede`, `temCobertura`, `linhaDeVisao` e `caminhar`, e **a grade
  já viaja no save** (`App.jsx:9275`). O que falta: **nada escreve nesses
  conjuntos depois de `montarGrade`** (varrido: todos os usos são leitura), e
  nenhuma casa sabe **de quem é**, **quanto dura**, nem **o que dispara ao ser
  pisada**. `quadradosDaArea`/`pegosPelaArea` resolvem área no *instante* do
  lançamento, não ao longo dos turnos. Paga **Mina Oculta**, a outra metade do
  **Círculo Sagrado**, e o *"bloqueia a passagem"* da **Muralha de Gelo** (cuja
  metade defensiva já é viva: `absorve: 10` por `efeitoDeBuff`).

### Fase Y — os quatro verbos que faltam
Decisão da pessoa (15/09): aprovada a proposta do orquestrador, na ordem dele.
X1 mediu que dos 12 botões de `ACOES_PRONTAS` **quatro são de combate e
nenhum tem motor**; X2 os deixou de fora **de propósito**, porque ali *não
falta fiação, falta mecânica* — e enfiá-los na porta de `Atacar` seria fingir
que existem.

Ordem, e ela é do mais concreto ao mais difuso:

- [x] **Y1 · `Empurrar` e `Derrubar`** · feita em v9.271 · texto em `mente/arquivo/pauta-feitas.md`
- [ ] **Y1b · a fiação de `Empurrar` e `Derrubar` no `App.jsx`** · de: Y1 · 16/09
  O motor existe, está provado e **não está ligado a botão nenhum**: os dois
  botões de `ACOES_PRONTAS` continuam a só escrever uma frase na caixa. Esta
  etapa não coube em Y1 porque **o bastão do `App.jsx` esteve com a outra
  mente (K3) o ciclo inteiro**. É fiação, não mecânica — o veredito antes do
  clique já vem pronto de `vereditoDoEmpurrao`. **médio**
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

- [x] **Z1 · o recálculo, e a prova de que ele não se mexe** · feita em v9.272 · texto em `mente/arquivo/pauta-feitas.md`
- [ ] **Z2 · as três portas fecham** · de: pessoa · 15/09
  Os três botões e as três chamadas de modelo saem. **Precisa do bastão do
  `App.jsx`.** O recálculo entra no `garantir...` do load, com a regra 2
  valendo: o load comum não escreve nada. Medir: quantas chamadas de IA o
  App passa a ter (11 → 8) e o que isso poupa por sessão.
  **O que Z1 deixou explicitamente para aqui:** (a) o aparo de `vida`/`mana`
  correntes quando um teto cai — `recalculo.js` governa só os quatro campos e
  não toca no corrente, por lei da etapa; quem apara é quem aplica na tela,
  **com o veredito antes do clique**; (b) o botão que diz, em voz alta,
  *"⚖ Recalibrar com a IA"* vive em `painel-ascensao.jsx:35` e `:229`, não só
  no `App.jsx`; (c) a medição de divergência de Z1 é sobre corpus
  **construído** (não há fixture de save no projeto) — **quantas fichas de
  jogador de verdade divergem só se sabe aqui**, num load a sério.
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

- [x] **N1 · o que os dois lados já sabem** · feita em v9.248 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **N1b · a régua mede o combate que existe** · feita em v9.251 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **N2 · a escada, e de onde cada um tira o seu degrau** · feita em v9.259 · texto em `mente/arquivo/pauta-feitas.md`
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

- [x] **Q1 · quem cai, e quem só morre** · feita em v9.268 · texto em `mente/arquivo/pauta-feitas.md`
- [ ] **Q2 · o companheiro cai como gente** · de: pessoa · 14/09
  O grupo passa a ter queda de verdade: estabilizar, ser estabilizado,
  morrer. Aqui encosta o achado de N1 — **59,7% da cura do companheiro
  chega em quem já está a 0 PV** — e a regra de bater em quem caiu deixa de
  ser foto velha e passa a ser decisão. Medir com a régua de B1 (depois de
  N1b consertá-la) e dizer o que muda para quem joga.
  **Q1 mediu e corrigiu o alcance desta etapa (16/09):** a foto de alvos
  (`combate.js:245-249`) não falha só com o companheiro — o **herói também
  apanha já caído**, 2,03 (`justo`) e 1,86 (`duro`) golpes por combate. A
  linha que dizia que ele escapava por acidente de referência foi medida e
  desmentida; o conserto é dos **três lados**. As tabelas de Q1 já existem
  e esperam leitor: `quedaAoChegarAZero` é a porta única, e se aparecer um
  segundo `vida <= 0 ? …` no App a doença voltou.
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

- [x] **V1 · o campo e a ordem do dano** · feita em v9.269 · texto em `mente/arquivo/pauta-feitas.md`
- [ ] **V2 · na mesa e na tela** · de: pessoa · 14/09
  O jogador **vê** o escudo temporário e o vê sumir — barra de vida e ficha.
  Vale para herói, companheiro e inimigo. A frase segue a linha de C2/T3:
  voz de mundo, sem nomear o mecanismo. Catraca: o temporário nunca soma ao
  PV real, nunca sobrevive ao prazo, e nunca é curado por cura.
  **V1 deixou-lhe cinco coisas escritas** (v9.269, ver o diário): `tickTemporario`
  ainda sem quem o chame — **o poço dura para sempre até V2 o ligar ao relógio da
  rodada**, ao lado de `tickEfeitos` (`regras-jogo.js:369`); `ganharTemporario` sem
  torneira; `vereditoDoTemporario.haEscolha` como o sinal do veredito antes do
  clique; o furo de `arena.js:249` (escreve `efeitos` de volta, não `temporario`
  — inofensivo hoje, mentira no dia em que um duelista tiver poço); e
  `linhaDoTemporario`, a frase que a arena vai precisar de pôr no log.
- [ ] **V3 · quem dá temporário passa a dar** · de: pessoa · 14/09
  Com a mecânica de pé, as habilidades e magias que prometem PV temporário
  na ficha passam a cumprir — `Palavra de Coragem` entre elas. Catraca
  herdada de P1: nada promete na ficha e falha na mesa.

A ordem das aprovadas em 14/09 é **T → B → F → I**, e ela tem motivo:
T é bug vivo que atinge quem joga hoje; B é pequena e fecha a simetria que P3
deixou pela metade; F é a maior e precisa de desenho; I é órgão novo e o mais
caro. Nenhuma começa antes de a anterior fechar verde.

### Fase F — as quatro famílias que ainda prometem
Decisão da pessoa (14/09): *"todas devem cumprir o que prometem."*

P1 criou cinco famílias em `APLICACAO_DO_BUFF`; P3 deu número e leitor a uma
(`absorve`), e **F1 deu à segunda** (`amortece`, v9.274). Seguem com força
zero: `intocado` (18 habilidades), `protege` (8) e `nao_cai` (5) — **31 que
prometem na ficha e não cumprem na mesa**, das 39 que eram.
E está medido em P2 que o piloto **não pode** procurá-las enquanto
forem inertes (mandá-lo gastar turno em promessa vazia derrubou a catraca:
`sombra` 60,2 → 32,9).

Uma família por etapa, nesta ordem — o caminho pronto primeiro, o que colide
por último:

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

- [x] **C1 · o campo nasce e viaja** · feita em v9.234 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **C2 · a quebra acontece na mesa** · feita em v9.235 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **C2b · o companheiro segura o que já conjura** · feita em v9.236 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **C3 · uma de cada vez** · feita em v9.237 · texto em `mente/arquivo/pauta-feitas.md`
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

- [x] **P1 · o Escudo Arcano deixa de dar dano** · feita em v9.231 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **P2 · o piloto reconhece as nove guardas** · feita em v9.232 · texto em `mente/arquivo/pauta-feitas.md`
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

- [x] **P3 · a proteção enfim protege** · feita em v9.233 · texto em `mente/arquivo/pauta-feitas.md`
### Fase R — as reviravoltas em harmonia com o resto
Decisão da pessoa (13/09): *"que o sistema de reviravoltas funcione em
harmonia com todos os sistemas"* — ou seja, a saída (c)+(b) do conselheiro:
**criar os trackers que faltam** e **ligar a forma maior**. A saída (a)
(eleger só entre formas com detector) fica **recusada**: trocaria a verdade
eleita de saves existentes, e campanha viva não perde o que sorteou.

- [x] **R1 · os trackers que faltam** · feita em v9.227 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **R2 · toda forma eleita tem detector** · feita em v9.228 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **R3 · a maior enfim acontece** · feita em v9.229 · texto em `mente/arquivo/pauta-feitas.md`
- [x] **R4 · a suíte da fase** · feita em v9.230 · texto em `mente/arquivo/pauta-feitas.md`
## Aberto (leve / médio — o ciclo pega daqui, o de maior valor primeiro)

- [ ] **quatro regras que apanham a habilidade errada — e uma delas inverte o
  que promete** · leve · de: sistema/H2 · 16/09
  Apanhados a medir H2, não consertados ali de propósito (a etapa era medição).
  **Nenhum tem teste hoje, e todos os quatro são "bug com teste que prova".**
  1. **`combate.js:126-127` contradiz o próprio catálogo.** `condicoes.js:77`
     declara *"danoExtra/danoReduzido → no dano CAUSADO"*, e a conta subtrai o
     `danoReduzido` **do alvo** do dano que ele **recebe**. `modAtk.danoReduzido`
     e `modAlvo.danoExtra` **não são lidos em lugar nenhum**. Consequência viva:
     a **Maldição do Patrono** aplica `enfraquecido` e deixa o inimigo **2 mais
     duro** por golpe — o avesso da promessa. *(Ler `modAlvo.danoExtra` é H4;
     acertar o sentido do campo e escrever o teste é daqui.)*
  2. **`aflicoes.js:29` — `chama` casa "**Chama**do da Chuva"**: a habilidade da
     chuva põe o alvo `queimando`.
  3. **`aflicoes.js` (portador `bencao`) — `oração` casa "C**oração**
     Tempestuoso"**: a aura de raios **abençoa o grupo** e dá `+2` de dano.
  4. **`aflicoes.js:32` — `prote[çc]` não casa "prote**gi**da"**, e o **Círculo
     Sagrado** não tira nem a condição `protegido`. É a **mesma família** do
     defeito "protetoras" que a v9.265/H1 corrigiu — logo a regra a acertar é a
     raiz, não o caso.
- [ ] **três ligações de uma linha que H2 mediu e não fez** · médio · de: sistema/H2 · 16/09
  O dono existe e está vivo; falta o chamador. **Cada uma tira um nome de
  `AGUARDAM` — e só sai de lá com a ligação provada.**
  1. **Foco Interior** (Monge) → `sacrificarInvocacao` (`invocacoes.js:197-205`,
     `mana: Math.min(manaMax, mana + pm)`) é o molde exato de "PM de volta", e
     `aplicarCurto` (`descanso.js:100-112`) é o segundo. *A linha de `AGUARDAM`
     apontava `gastarRecurso` — **export morto**, nunca chamado.*
  2. **Contra-Canção** (Bardo), metade mental → o motor `porta` de
     `aplicarPoder` (`poder-de-classe.js:283-306`) só trata **um** alvo; falta o
     ramo `alvo: "grupo"`, e **o motor `cura` já tem o dele pronto para copiar**
     (`:237-258`). Mais uma porta em `PORTAS_DE_SAIDA` e uma linha em
     `PODERES_DE_CLASSE`. *A metade "sonoros" é contra-conjuração e fica.*
  3. **Chamado da Chuva** (Druida), metade clima → chamar `rolarClima` com o id
     forçado é uma linha. **Mas meça o que ela compra antes de a escrever:**
     hoje ninguém decide número por clima, só o narra — pode ser que o item
     honesto seja *dar um leitor ao clima*, e não *dar clima à habilidade*.
- [ ] **Contramágica já cumpre, e `AGUARDAM` diz que não** · leve · de: sistema/H2 · 16/09
  Medido em H2: a reação `contramagia` (`reacoes.js:35`) existe com `corta: 1`,
  `reacoesDe` (`:79`) concede-a **por nome na ficha**, e a fiação está viva
  (`tentarReacaoNoGolpe`, `App.jsx:7664`, chamado em `:13981`). **Ligação de
  zero linhas.** Falta a **prova** — a suíte que a corre ponta a ponta — e só
  então a linha sai de `AGUARDAM` e `TETO_DE_AGUARDAM` desce para 39.
  *De quebra, um campo morto a enterrar: `funcao: "contramagia"` em
  `grimorio.js:142` não está em `FUNCOES_DO_SISTEMA` (`:524-526`), logo
  `usarFuncaoMagica` cai no `return false`.*

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
- [x] **`ATRIBUTO_MAX = 5` é importado e nunca lido** · feita em v9.259 · texto em `mente/arquivo/pauta-feitas.md`
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

- [x] **o buff do companheiro é mudo em Uma Vida** · feita em v9.247 · texto em `mente/arquivo/pauta-feitas.md`
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

- [x] **a suíte da sala aposta no acaso, e às vezes perde** · feita em v9.240 · texto em `mente/arquivo/pauta-feitas.md`
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

- [x] **a suíte da sala ficou vermelha uma vez e não repetiu** · feita em v9.240 · texto em `mente/arquivo/pauta-feitas.md`
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

## Fases fechadas (o texto saiu para a estante)

A mente lê esta pauta ao começar todo ciclo, e fase fechada não
participa de decisão nova. O texto inteiro — etapas, números,
razões — está em `mente/arquivo/pauta-fechadas.md`, e o diário aponta para lá.

- **Fase X — o botão age (o jogador dispara o próprio combate)** — 6/6 etapas · texto inteiro em `mente/arquivo/pauta-fechadas.md`
- **Fase T — o relógio das condições, no sistema de D&D** — 4/4 etapas · texto inteiro em `mente/arquivo/pauta-fechadas.md`
- **Fase B — o bônus do companheiro, se for lícito e justo** — 3/3 etapas · texto inteiro em `mente/arquivo/pauta-fechadas.md`
- **Fase A — a Arena passa a portar os efeitos** — 4/4 etapas · texto inteiro em `mente/arquivo/pauta-fechadas.md`
