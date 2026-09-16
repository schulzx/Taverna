# Fases fechadas — mente/pauta-desenho.md

O texto inteiro das fases que já terminaram. Sai da pauta para a mente
não o reler a cada ciclo; fica aqui porque é a prova de como se chegou
aqui, e o diário aponta para ele.


### Fase W — o turno por toque (a ação deixa a caixa de texto) · **FECHADA 16/09**
Duas propostas do `jogo` e do `desenho` em E1, **aprovadas pela pessoa em
15/09**. São a metade de desenho da Fase X do sistema, e andam junto com ela.

> **A fase está fechada: W1 e W2 estão feitos, e os dois eram etapas de
> DECISÃO — `W3 · o gesto construído` é a mão que as constrói, e fica aberta.**
>
> **O que a fase descobriu, e é mais interessante do que o que ela propunha:**
> **os dois enunciados estavam errados, e os dois erros eram o mesmo erro** —
> descreviam um jogo que o código já tinha mudado e que ninguém reconferira.
> W1 prometia matar ~18 toques que **X2 já matara** (o caso comum eram 2). W2
> prometia devolver quota narrando *"uma vez por rodada"*, e **isso é o jogo
> desde a v9.13** (Δ = 0 no caso comum). *Em ambas, a etapa valeu mais pela
> medição do que pela proposta — e a lição é de método: **uma pauta que
> envelhece mente com a confiança de um documento.***
>
> **E a quota foi devolvida — só que por W1, uma etapa antes, e por outro
> caminho:** a abertura de toda luta corpo a corpo cai de ~22 toques e 1
> chamada para **2 toques e zero chamadas**, o que vale **−1,4 chamadas ao
> Mestre por luta**. **W2 acrescenta −1 por fala**, sobre uma base que hoje é
> zero porque o preço a proíbe.

**O que se media em E1:** uma rodada era abrir `Ações` (1 toque), tocar `Atacar`
(que **escrevia `"Ataco "` na caixa**), digitar o alvo (~15 toques), tocar
`Agir →` — **e o golpe ainda podia não acontecer**. Sete turnos jogados, três
ataques declarados sem ambiguidade, **zero rolagens**. E gastava-se **uma
chamada ao Mestre** para uma IA descobrir que *"Ataco o ogro"* significa
atacar o ogro, que o motor já sabia.

**CORRIGIDO em W1 (16/09), e a correção é do `jogo`: os ~18 toques já não são o
caso comum, e ninguém tinha contado.** X2 matou-os em combate — `Atacar` entra
por `declararGolpe` e **escolhe o alvo mais perto ao alcance sozinho**. Medido no
código de hoje: o caso comum são **2 toques** (abrir `Ações`, tocar `Atacar`), o
alvo escolhido **3** — e nesses 3 há um defeito, porque `declararGolpe`
(`App.jsx:11988`) **troca de alvo em silêncio** quando o escolhido não alcança.
**Os ~18 continuam verdadeiros fora de combate**, onde `Atacar` ainda enche a
caixa, e isso é deliberado: é pela frase que a briga **começa**.

**E o número grande da fase é outro, e ninguém o tinha** *(corrido em Node sobre
`PLANTAS` × `posicionar` pelo `jogo`, e **reconferido pelo `regente`** com uma
segunda passagem independente que bateu casa a casa)*: a abertura é de **19,95 m
em média**, **10 de 10 plantas** recusam o corpo a corpo no turno 1, e **1,4
rodadas por luta são pura caminhada**. **Não há botão de passar a vez**
(`App.jsx:3133`, desde a v9.13) — logo cada uma dessas rodadas custa **~20 toques
de teclado e uma chamada ao Mestre para não fazer nada**. *A abertura de toda
luta corpo a corpo custa hoje ~22 toques e 1 chamada; com `esperar`, 2 toques e
zero chamadas.* É o maior número desta fase e o mais barato de pagar.

- [x] **W1 · a frase que se monta** · **FEITO 16/09 · v9.262** — o gesto inteiro
  está decidido e escrito; **W3 constrói**. O turno passa a ser **verbo +
  alvo/casa por toque**, com o preço e o alcance antes do clique. **O caso comum
  cai de 2 toques para 1** (e a etapa corrigiu o enunciado: **X2 já tinha matado
  os ~18**, e ninguém contara); **a abertura de toda luta corpo a corpo cai de
  ~22 toques e 1 chamada para 2 toques e zero chamadas**, o que vale **−1,4
  chamadas ao Mestre por luta** — quota devolvida ao Narrador **uma etapa antes
  de W2**. A fileira é de **quatro e uma goteira** numa fila só (a lista é do
  `jogo`, e `golpe.js:222-254` prova que três dos seis de E1 não têm motor), o
  que **devolve 81 px ao campo: 91 casas em vez de 84**. **`Atacar` perde o
  `Papel=Chamada`** — o âmbar cheio passa a ser exclusivo do armado, e a
  distinção dele vira largura (163 contra 72/44/44, 359 exactos). **Só `Atacar`
  arma.** No telefone o gesto é **pressionar · arrastar · largar**, um contacto =
  um toque — *o arrasto é o `hover` que o dedo nunca teve* —, e a região do
  veredito reserva **71 px, sempre**, com o degrau medido (75 px = 13 filas,
  76 px = 12). **Zero peças novas:** `Botao` 24 → 26, `A casa` 7 → 8, e o
  conserto de *Alcançável*, que reprovava a 1.4.11 a **1,151:1** na peça que W1
  ia usar de base. **Três defeitos vivos achados e reconferidos à mão:** as
  frases de X2 transbordam hoje (**64–86 caracteres contra 54**), **é impossível
  tocar num inimigo** (`pointerEvents:"none"` + a casa ocupada fora de `podeIr`),
  e a mira reprova a 1.4.11. O escrito dos dois seniores fica em
  `mente/w1-jogo.md` e `mente/w1-desenho.md`; a forma, no bloco final de
  `mente/formas.md`. · de: pessoa · 15/09
- [ ] **W3 · o gesto construído** · de: regente · 16/09
  **O que W1 desenhou, montado.** A lista é fechada e cada linha tem sítio, e
  **três delas são defeitos vivos de hoje, não features** — conferidos à mão pelo
  `regente` no fecho de W1:
  - **as fichas têm de virar alvo.** `<g style={{ pointerEvents: "none" }}>`
    (`grade-de-batalha.jsx:648`) e a casa ocupada fora de `podeIr` (`:401`,
    `alcancaveisDe` com `ocupados`) são, **juntos, a razão de hoje ser impossível
    tocar num inimigo**. Com um verbo de criatura armado, a casa ocupada entra em
    `clicavel`. *Sem isto, W1 inteiro não tem primeiro toque.*
  - **`onMouseEnter` → `onPointerMove`** (`:759`): é correção, não port. Hoje a
    rota prevista e a casa sob o dedo são **dois canais de rato num jogo que se
    joga com o dedo**.
  - ~~**o violeta da mira a 74 %**~~ — **PAGO EM W2 (16/09, v9.264)**, e a cura
    não foi a que esta linha dizia. O 2,689 herdado de E1 fora medido contra
    `T.bg` **nu**, e o contorno corre por cima de cobertura e faixa de região:
    contra o pior chão real dava **2,575**, e **74 % de opacidade dava 3,235 —
    passava a norma e falhava o piso da casa (3,272)**. A decisão é **o token,
    não a opacidade**: `T.violet` → `T.violetSoft` em `grade-de-batalha.jsx`
    (`:633` e `:641`) → **3,615** (+40 %) e **4,432**. Opacidade e âmbar
    intocados. **Três ganhos de graça:** `violetSoft` **já era** a cor da
    retícula da mira e da legenda no mesmo arquivo (hoje o anel e o contorno
    falavam dois roxos diferentes); as duas línguas do tabuleiro passam de
    **42 % de diferença de força para 1,3 %**; e fica a regra — **`violet` é
    tinta de superfície, `violetSoft` é tinta de traço sobre o tabuleiro.**
  - **as quatro frases do golpe, e elas estão PRONTAS — só falta aplicar.**
    `LINHAS_DO_GOLPE` saiu da fila do motor em W2: a peça é de `src/golpe.js`,
    **nascido em X2, desta mesa**. A redacção está fechada e medida contra o
    teto de 54 de E2, **com o pior nome (18) e o pior número (`10,5`)**, numa
    gramática única — `{nome} a {distância} m — {veredito}.` — em que **o
    jogador aprende uma forma e passa a ler só a cauda**: `Ninguém de pé ao seu
    alcance.` (29) · `{n} a {d} m — faltam {f} m.` (fixo 26, pior 44) · `{n} a
    {d} m — parede, contorne.` (fixo 29, pior 47) · `{n} a {d} m — ao alcance.`
    (fixo 23, pior 41). **A recusa por distância mede hoje 60 com o nome VAZIO
    contra um teto de 54** — aparar o nome nunca a podia salvar, e por isso a
    cura é redacção. **`contorne` é a única ordem que sobrevive**, porque sem
    ela o reflexo depois de ler metros é andar a direito contra a pedra; e a
    parede **ganha um número que hoje não tem** (contornar 3 m e contornar 20 m
    são decisões diferentes). O aparo mora na tabela, **nunca no CSS**. Tudo em
    `mente/w2-desenho.md` §3.3-3.5, com as **cinco asserções** que lêem a
    tabela de volta. **É atómico:** `recusaDoGolpe` tem **dois** leitores
    (`App.jsx:11981` no chat, `:20910` na linha do veredito) e meia troca é a
    mesma regra em dois caminhos. **Precisa do bastão.**
  - **a linha do veredito não vive sempre na árvore — vive numa gaveta que
    nasce fechada.** Achado do `desenho` em W2, e **contraria um comentário do
    próprio arquivo**: `App.jsx:20900` diz *"ela vive sempre na árvore enquanto
    há luta"*, e **não vive** — está dentro de `{acoesAbertas && …}`, com
    `acoesAbertas` a nascer `false` (`:4896`) e **nada que a abra sozinha**,
    nem quando a luta começa, nem quando o golpe é recusado. `grep` devolve
    **três linhas e mais nenhuma**. **O `Atacar` apagado e a linha por baixo
    dele estão os dois lá dentro** — logo o veredito antes do clique só existe
    **depois de um toque**. *A reserva de 71 px de W1 não muda; muda a razão
    dela: reserva-se para o tabuleiro não saltar quando a gaveta abre.*
  - a fileira de **quatro e uma goteira** numa fila (`Atacar` · `✦` · `◆` ·
    goteira · `esperar`), `Botao` *Papel=Gesto*, **`Atacar` distinguido por
    largura (163 contra 72/44/44, 359 exactos) e tinta, nunca por preenchimento
    cheio** — o âmbar cheio é do armado e de mais ninguém;
  - `Estado=Armado` no `Botao` (inversão figura/fundo + o bico de 12×6 px +
    `aria-pressed`), e **só `Atacar` arma**;
  - `Estado=Alvo` em `A casa` — **os quatro cantos sobre a criatura**, nunca tinta
    no chão: *o golpe escolhe gente, e o passo escolhe chão*;
  - a segunda linha da desistência e a fila de pílulas do polegar, **exclusivas
    por estado** (ver o bloco de `formas.md`);
  - no telefone, **pressionar · arrastar · largar**, um contacto = um toque — *o
    arrasto é o `hover` que o dedo nunca teve*; largar sobre o herói ou fora do
    campo = **nada aconteceu**.
  **Depende de:** o pedido de W1 na `mente/pauta.md` (`esperar`,
  `declararGolpe(alvo, motivo)`, `LINHAS_DO_GOLPE`, `alvosDoVerbo`,
  `vereditoDoVerbo`) e, por baixo dele, a porta do tabuleiro que E2 pediu.
  **O que NÃO espera:** os três defeitos acima são de `grade-de-batalha.jsx`, são
  nossos, e podem ser pagos antes de qualquer porta nascer.
  **O bastão:** a fileira e a linha do veredito vivem no `App.jsx` (`:20840-20940`)
  — é trabalho do `oficial`, não do `aprendiz`.

- [x] **W2 · o texto ganha um SEGUNDO emprego** · **FEITO 16/09 · v9.264** — e
  a etapa **corrigiu o próprio enunciado em dois sítios**, com número.
  **1 · O nome estava errado, e a correcção é lei:** o campo **não pode**
  deixar de perguntar *"o que você faz?"*. Fora de combate é a única pergunta
  que existe; dentro dele é a porta de **onze verbos sem botão**. `"Ataco o
  ogro"` escrito na caixa continua a atacar o ogro, **pela mesma porta do
  botão** (`aplicarGolpeDoJogador`, chamada de `:11992` e `:13555`, e o
  comentário de `:13549` diz *"byte por byte"*). Recusar seria parede;
  traduzir em silêncio seria o defeito que W1 §0.1 já nomeou. **O texto não
  muda de emprego: ganha um segundo.**
  **2 · A promessa de quota era falsa, e o `jogo` provou-o:** *"o Mestre narra
  uma vez por rodada"* **descreve o jogo que existe desde a v9.13**, quando
  `agir` passou a encerrar o turno. `fecharMeuTurno` tem **quatro chamadores,
  mutuamente exclusivos, um `enviar` cada** — **a rodada comum custa 1 chamada
  hoje e custará 1 depois: Δ = 0.** O ganho verdadeiro é outro, é menor e é
  real: **−1 chamada e −1 rodada perdida por fala**, sobre uma base que hoje é
  **zero** — porque falar custa a rodada inteira (`:13595` fecha o turno e o
  inimigo revida). **W2 não poupa uma chamada: destrava um comportamento que
  hoje o preço proíbe.**
  **A fala é gesto:** **zero ações, uma por rodada, zero chamadas**, e viaja
  colada ao envelope por `notaRef` — **o molde é a poção** (`:19580`, em
  produção desde a v9.13: *"abrir a bolsa não é o turno"*). Teto de **240**
  caracteres (o `slice` que `falas.js:82` já usa), **e estourar recusa, não
  corta** — truncar em silêncio é `declararGolpe:11988` outra vez.
  **O que fica sem frase nenhuma: ZERO.** Os 14 eventos de X3b foram cruzados
  linha a linha com o que o código escreve sozinho — **11 sobrevivem inteiros
  ao silêncio, 2 pela metade, 1 não dispara para quem luta de arma** — e os
  três são **herança, já em `mente/pauta.md`**, não preço de W2. **A IA nunca
  foi a voz única de nenhum dos 14: foi a segunda voz de 11.** Um só evento
  muda de lugar (o desfecho do teste social, de parágrafo para frase) **e
  sobrevive**, porque `falaDoVeredicto` já é empurrada por código em `:15989`.
  **Dos três defeitos vivos de W1, um foi CONSTRUÍDO e dois ficaram, com o
  motivo:** o **violeta da mira** está pago (§4 abaixo); as **quatro frases**
  estão **fechadas e medidas** mas a troca é atómica e o **bastão do `App.jsx`
  esteve com a outra mente o ciclo inteiro** — **PAGAS EM 16/09, no ciclo de
  K2 · v9.267**, e a dívida durou exactamente um ciclo. As quatro saem de
  `LINHAS_DO_GOLPE` em `src/golpe.js`, com `TETO_DA_LINHA` ao lado e **18
  asserções novas** em `teste-golpe.mjs` (64 → 82) a ler a tabela de volta.
  Medido **depois**: fixos **29 · 26 · 29 · 23**, pior caso com o nome de 18
  **29 · 44 · 47 · 41**, e o pior dos 108 pares (27 nomes × 4 frases) é **47
  contra um teto de 54** — sete de folga. **Antes eram 29 · 80 · 55 · 64.**
  `recusaDoGolpe`, `linhaDoGolpe` e `maisPertoAoAlcance` mudaram de casa
  inteiras — *um varredor não lê JSX; lê isto*, e foi por isso que a linha que
  mais aparece no combate mediu 64 a 86 caracteres durante um ciclo sem
  ninguém a ver. **A conta que a mudança de casa deixou por pagar, e ela é
  nova:** apagar 33 linhas do `App.jsx` empurrava **133 endereços
  `src/App.jsx:<linha>`** cravados em nove arquivos de `testes/` — e alguns são
  verificados por varredor —, logo ficou no lugar **uma lápide de exactamente
  33 linhas**, com o próprio tamanho explicado dentro e a data de validade
  escrita. *Está em "Aberto".* · **tocar num inimigo**
  é de W3 **e era meia-verdade**: com a mira armada `noAlcance` **não exclui
  ocupados**, logo a casa por baixo da ficha **já responde hoje**. W3 não
  inventa mecanismo — acrescenta um segundo valor a um que já roda.
  O escrito dos dois seniores fica em `mente/w2-jogo.md` (com a `§8 · adenda`)
  e `mente/w2-desenho.md`; a forma, no bloco final de `mente/formas.md`. ·
  de: pessoa · 15/09


### Fase K — as três batidas da rodada (a reação ganha controle) · **FECHADA 16/09**
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
- [x] **K1b · o relógio de 15 s, e o que ele cobra** · **FEITO 15/09 · v9.258** —
  **a barra não corre 15 s, corre 4.** K1 tinha o número certo no papel errado: os
  4 s que ele mediu são *o prazo*, não *a janela*. Onze segundos **sem relógio
  nenhum**, depois o trilho pelos 4 s medidos, depois o último segundo apertado —
  e quando a barra aparece o jogador tem ainda o orçamento inteiro de K1.
  **Zero peça nova.** A rodada de quatro inimigos passou de **60 000 ms para
  15 000** (−75,0 %); doze golpes, de 180 000 para 15 000 (−91,7 %); a luta de
  cinco rodadas de quem ignora tudo, de 300 000 para **33 200** (−88,9 %). Dois
  tetos em `TETO_DA_ESPERA`, porque um teto por rodada × rodadas sem limite não é
  teto. **O dano fica em segredo**, e não vaza: 12 portas visuais + 15 de sistema
  fechadas por escrito, **três delas viradas asserção**. `folgado` morreu com o
  motivo escrito. `src/ritmo-da-reacao.js` + **85 asserções**; `lineStrong` nasceu
  em `T` com dois leitores. O escrito dos dois seniores fica em
  `mente/k1b-jogo.md` e `mente/k1b-desenho.md`. · de: pessoa · 15/09
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
- [x] **K2 · a trava, antes de tudo** · **FEITA 16/09 · v9.267** — e ela apanhou
  o erro que K3 ia cometer. **O desenho óbvio (*a expiração resolve só o golpe
  da janela*) quebra a trava em 37,44 % das sementes**, medido em 120 000 pares:
  hoje o laço **repete** `escolherReacao` golpe a golpe quando a `chance` falha,
  e por isso o ladino esquiva **97,6 %** das rodadas e não 60,2 %. Custo
  silencioso do erro: **+12,4 % de dano ao furtivo.** A regra que fica:
  ***«coberto» quer dizer não gera segunda pergunta, nunca não gera reação***.
  `reacaoDoSilencio` (chama `escolherReacao`, não a copia; **sem parâmetro de
  tempo nenhum**, e é essa a prova de T2), `fecharAJanela` (portão de uma via —
  o segundo a chegar **não rola um dado**), `ATALHOS_DA_JANELA`, e a **nona
  porta `escondida`**, primeira da precedência: as outras oito dizem *«não
  perguntes»*, esta diz *«não esperes»*. `testes/teste-trava-da-reacao.mjs` com
  **107 asserções em 0,6 s** — e a **03 constrói o desenho errado e assere que
  ele diverge, pelo número**. Do lado da forma: a tabela do foco (**na
  expiração o foco não se mexe** — quem não respondeu não pediu nada), a lei
  *o trilho não tem relógio próprio*, e o dente **`D5e`**. **85 asserções de
  K1b estavam verdes com uma ficha que nunca rola um dado** — é a lição da
  etapa. Escrito em `mente/k2-jogo.md` e `mente/k2-desenho.md`.
  · de: pessoa · 14/09
  **Quem não responde, o sistema responde como hoje.** Regressão zero é
  condição de entrada, não consequência feliz: o jogo tem de continuar
  jogável exatamente como é para quem ignora o botão, para quem joga sem
  mouse, e para quem está numa aba lenta. Prova antes de a peça existir.
- [x] **K3 · a reação acontece** · **FEITA 16/09 · v9.270** — a janela existe, e
  o jogador faz alguma coisa no turno do inimigo pela primeira vez.
  **O que nasceu:** `src/painel-reacao.jsx` (o cartão), `src/palavras-da-reacao.js`
  (nove tabelas e três funções puras — zero frase montada dentro de um JSX), sete
  classes e o anel `.tv-anel-foco` em `src/estilo.js`, `TEMPOS_DO_CARTAO` +
  `temRelogio`/`janelaExpirouEm` em `ritmo-da-reacao.js`, e no `App.jsx` a cisão
  de `resolverRevide` numa continuação (`correrORestoDaRodada`) mais a fila de
  quatro pílulas na ficha. **97 → 102 asserções** na suíte nova.
  **As quatro obrigações de K2, cumpridas e conferidas:** os cobertos voltam ao
  laço por `reacaoDoSilencio(desde: abre.ordem)`; nenhuma resolução fora de
  `valeu === true`; o foco é guardado antes de mover e **não se mexe na
  expiração**; `escolherReacao` recebe sempre `persBase`.
  **E a decisão que salvou a fase:** *quem responde resolve-se pelo MESMO caminho
  de quem não responde.* A `chance` continua dentro de `escolherReacao` e o laço
  continua a tentar o golpe seguinte — o ladino esquiva **97,6 %**, como hoje, em
  vez de **100 %** de graça. Resolver directamente teria dado ao jogador que
  responde um mundo melhor que o de hoje, em silêncio.
  **As três dívidas de K1b, pagas:** a lista de espera de `teste-ligacao.mjs`
  voltou a ficar **vazia** (o credor era este ciclo); `tv-trilho-entra` existe; e
  **o `73 %` morreu** — o trilho nasce na proporção por `animation-delay` negativo
  calculado de `agora − t0`, não por número escrito à mão. *(`PISO_DO_GOLPE` em
  dois sítios continua de pé: é do `backend`, e está no pedido.)*
  **Conferido vivo**, no navegador, em aba nova: o anel acende sob `Tab` de
  verdade (`T.bg` 2 px + `T.ink` 4 px, e `:focus-visible` a `true` — o que K2 disse
  que não se prova em Node); o cartão mede **560 px** com o teto, **chamado 56 px
  e recuo 48 px**; o trilho é `tvJanelaTempo` 4 s linear, origem à esquerda, em
  `T.amber`, nascido já na proporção; as quatro pílulas trazem **o verbo do
  próprio herói** (*Esquiva Ágil sempre*); e a vez do mundo corre inteira pela
  continuação nova quando nenhuma porta abre.
  **O que o vivo apanhou e a suíte não:** o preço saía comprimido
  (`0PM—anula`); voltou à forma de `formas.md` (`0 PM — anula`) e o estouro de
  `escudo arcano` resolveu-se **na palavra** (`corta o grosso`), não no espaço em
  branco — com catraca a exigir a forma canónica.
  **E as duas que K2 não conseguiu provar em Node têm resposta, medida na tela:**
  o **foco de teclado** acende — `:focus-visible` a `true` e `box-shadow` de
  `T.bg` 2 px + `T.ink` 4 px, sob um `Tab` de verdade —, e **`O chamado` não
  ganhou eixo `Estado`**: nasceu `.tv-anel-foco`, transversal, que serve o
  chamado, o recuo, o leque e as quatro pílulas da ficha. *K1 tinha a conclusão
  certa pela razão errada.*
- [x] **K4 · medir a batida** · **FEITA 16/09 · v9.273 — e ela não defendeu a
  fase.** · de: pessoa · 14/09
  **O veredito, dito inteiro: a peça está certa e a pergunta está errada.**

  **O que defende a fase, e é medido:** em **4 000 lutas pareadas por semente**,
  nas duas mesas, a luta com cartão é **idêntica à de v9.266 em 100,00 % das
  sementes** — mesmas rodadas, mesmo dano, mesmos golpes, mesmas reações, **mesmo
  número de rolos de dado**, mesmo desfecho, tanto para quem responde como para
  quem cala. **O combate não ficou mais longo em rodada nenhuma.** Só em relógio
  de parede: **+24,9 %** para quem responde depressa, **+59,4 %** para quem deixa
  expirar sempre, e **+0,0 %** para quem trava a pílula na ficha — a saída é
  grátis e devolve o mundo idêntico. O tecto `msEntreRespostas: 33 200` aguenta
  (30,9 s medidos). **A tabela não mentiu.**

  **O que a condena, e também é medido:** **84 % das rodadas** de uma luta trazem
  pergunta (**98 %** no solo) — não há rodada de descanso; **metade das perguntas
  é sobre um golpe que passou longe** (50,66 %); **62,4 % do dano chega em
  silêncio** (75,2 % no solo); **12 classes em 12 oferecem exactamente um verbo**,
  e em 7 delas ele custa **0 PM** — *um diálogo de confirmação com relógio*, que é
  a frase com que K1 matou `inimigo_cai`; e **quem cala paga 2,4× mais relógio do
  que quem responde**. Do lado da forma, a mesma conclusão com outra régua: a
  aparição do cartão carrega **0,020 bits** (`−log₂ 0,986`), **cinco vezes abaixo
  do chão da moldura** — e moldura com relógio é pedágio.

  **E o achado que ninguém tinha visto:** *responder* e *deixar expirar* produzem
  mundos **idênticos** em 100 % das sementes. **`recusar` é a única tecla do
  cartão que muda o mundo** — leva o dano da luta de 13,13 para 21,67 (+65 %) e a
  morte de 13,7 % para **49,3 %** — **e é a única sem glifo, sem log e sem
  número.** K3 decidiu bem ao não lhe dar linha de log; a ausência de marca foi
  justificada com *«não houve gesto»*, e o número diz que **o gesto mais
  consequente do jogo é exactamente esse.**

  **Não desligar. Corrigir.** Desligar devolve o jogo em que o jogador não faz
  nada no turno do inimigo, e isso é pior. As três propostas que saem daqui estão
  no topo de *Para a pessoa decidir*.

  **A dívida de K3, paga: o golpe real foi visto.** Cinco janelas, dois torneios,
  seis rodadas de vez do mundo — e **a tela e a tabela concordam ao
  milissegundo**: expiração a **15 013 / 15 014 ms** (`janela: 15 000`), trilho a
  nascer aos **10 967 ms** (`folga: 11 000`), `tvJanelaTempo` 4,6 s linear, 527 px
  num pai de 528. As **cinco saídas** saíram palavra por palavra das tabelas, e o
  log ficou byte a byte o de hoje. **O que o vivo desmentiu não foi a peça:** três
  das cinco janelas abriram num erro, e **a escada calou exactamente a rodada que
  levou o herói de 30 PV a 1 PV** — 25 de dano, quatro golpes, zero perguntas.

  **E a peça torta de K3 fechou:** a fila de pílulas da ficha media **27,5 px**
  onde `formas.md` desenha 47 — e **nem 27 nem 48 estavam escritos em lado
  nenhum**, o que é por que 102 asserções passaram verdes. Nasceu `ALVOS`
  (`piso: 48`, `chamado: 56`) e a primitiva `PilulaDeEscolha`, que a fila montava
  à mão havia dois ciclos. **Confirmado vivo: 48,00 px**, `role="group"`,
  `aria-pressed`, fundo `T.panel` (nunca âmbar cheio), borda `lineStrong`, filete
  `inset 3px`, transição de 120 ms com saída sob `prefers-reduced-motion`, e no
  telefone **duas filas, 139,1 px** — os 139,5 previstos, zero filas a mais.

