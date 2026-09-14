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

- [ ] **A batalha toma a tela** · de: jogo · 14/09
  O `jogo` jogou e mediu: o campo tático de 16×16 vive dentro do scroller
  narrativo de **301 px de altura** com `overflow: hidden auto`. O painel
  `Ações` abre **abaixo da dobra** — clica-se e não aparece nada. `⤢ ampliar`
  promete "tela cheia" no `title` e abre **outro bloco dentro do mesmo
  scroller clipado**: o campo inteiro nunca foi visto, em partida nenhuma. Em
  1280×860 o jogo ocupa 560 px à esquerda e **mais de metade do ecrã fica
  preta**. Já estava marcado pesado no `CLAUDE.md`; agora tem a prova.
- [ ] **O Duelo é jogado, não lido** · de: jogo · 14/09
  **3 cliques do menu ao resultado final**, sem um turno pelo caminho. E o
  vencedor aparece **antes** das 48 linhas de log das três quedas — não há
  uma única linha de tensão no modo inteiro. Queda a queda, com o resultado
  por último.
- [ ] **A sala ao vivo precisa de um momento partilhado** · de: jogo · 14/09
  Testado em duas abas reais: a escolha sincroniza em ~1 s, o **resultado
  não**. Um lado viu a luta inteira; o outro ficou 10 s parado sem aviso,
  sem luz, sem "o duelo aconteceu". Mecanicamente correto (os selos batem);
  como experiência, dois jogadores lendo o mesmo PDF em salas separadas.
- [ ] **O jogador precisa de uma forma de se mover que não dependa do
  Narrador** · de: jogo · 14/09
  Três rodadas escrevendo "me aproximo" e o log só reportava o movimento do
  **inimigo**. Clicar numa casa dentro do próprio retângulo tracejado dourado
  não faz nada — a grelha não é clicável. Ao fim: `9 de 9 m nesta rodada`,
  **nunca andei um metro**, com o jogo mandando "aproxime-se primeiro".
- [ ] **`Esc` fecha, e o fundo fecha, em toda sobreposição** · de: desenho · 14/09
  **15 sobreposições, 4 regras de fecho diferentes**, e `Escape` não fecha
  nenhuma (há 6 `onKeyDown` no `src/` inteiro, todos `Enter`). O jogador
  descobre caso a caso se sai clicando fora, num `✕` de 10px, ou num botão
  âmbar de 48px. É fluxo, e mexe no que o jogador já aprendeu.
- [ ] **A escala de texto vira tabela** · de: desenho · 14/09
  **18 degraus de tamanho**, e **542 dos 1.107 textos dimensionados (49%) são
  9px ou 10px** — em JetBrains Mono, a fonte "do que é máquina", que tem 682
  usos contra 315 do corpo. O contraste da paleta passa AA com folga
  (`inkDim` sobre `panel` = 6,21:1), e é por isso que nenhum alarme
  automático dispara: a WCAG não tem piso de tamanho. 18 degraus → 6 ou 7, e
  o piso sobe. Encosta em identidade visual e em toda tela.
- [ ] **A ação principal tem a mesma cara nos três modos** · de: desenho · 14/09
  "aja agora" é `<Botao primario pequeno>Agir →</Botao>` (mono 12px) em
  `historia`, faixa `tv-display` de 18px no torneio, e outra faixa
  `tv-display` de 18px com padding diferente em `rapida`/`duelo`. O
  `CLAUDE.md` diz que modo é *"lente sobre o mesmo motor, nunca um segundo
  jogo"*; visualmente, hoje, é um segundo jogo. Mover o que o jogador já usa.

## Aprovado pela pessoa — executa como fase, UMA etapa por ciclo

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
- [ ] **D3 · a biblioteca no Figma** · de: pessoa · 14/09
  Criar o arquivo do Taverna no Figma e nele a biblioteca: **variáveis
  primeiro** (espelhando a tabela de estilo e as medidas), **componentes
  depois**. Carregar `figma-generate-library` junto de `figma-use`;
  `figma-create-new-file` é pré-requisito obrigatório do `create_new_file`.
  Ao fim, **Code Connect** amarrando componente do Figma a componente de
  código, para que não possam divergir em silêncio.
  *(corrigido por D1: espelhar `ui.jsx` cru faria uma biblioteca de 49
  componentes, 33 deles ícones e 4 mortos, e **sem** os cinco controles onde
  a divergência de verdade mora.)* Entram: **as primitivas de `ui.jsx` com
  ≥2 leitores reais**, mais os cinco que D1 provou existirem sem primitiva
  — **destrutivo, fechar, sobreposição, badge de estado, barra**. Não entram
  `IconeBandeira`, `IconeGota`, `IconeCirculoX`, `IconeFrasco`. E fique dito:
  **`:focus-visible` tem zero ocorrências no projeto** — desenhar o estado de
  foco no Figma é inventar, não espelhar. Legítimo, mas é desenho novo.
- [ ] **D4 · as formas escritas** · de: pessoa · 14/09
  `mente/formas.md` deixa de estar vazio: toda ação que o jogador toca hoje
  ganha sua forma declarada (quando, forma, movimento, onde vive, por quê,
  peso), a partir de D1 e D3. Onde D1 achou duas caras para a mesma ação, a
  dupla decide **uma** e escreve a discordância resolvida — começando pelas
  10 famílias medidas.
  *(acrescentado por D1, do que o `jogo` viu jogando: catalogar botão não
  basta.* Entram também **as ações sem controle** — mover em combate, que o
  jogo manda fazer e não dá forma de fazer — e **os controles sem rótulo**:
  `⛺`, `🎲`, `⤢` no cabeçalho, cujo significado só existe em `title`.
  Sem isso passam pela catraca por não existirem na lista.*)*
- [ ] **D5 · a catraca do desenho** · de: pessoa · 14/09
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
- [ ] **as moedas existem no HUD** · leve · de: jogo · 14/09
  225 moedas ganhas em dois turnos, e o número só vive **dentro do painel
  Bolsa**. O jogador não vê o que tem sem ir procurar.
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
