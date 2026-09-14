# O diário do desenho

Um registro por ciclo da **segunda mente** — a do visual. O mais recente no
topo. O diário do sistema é `mente/diario.md`; os dois aparecem juntos na
página, separados pela fila a que pertencem.

Formato:

```
## dd/mm hh:mm · vX.YYY · <título do item> · commit <hash>
- **estado inicial:** suítes, o bastão do App.jsx, o que a pauta tinha
- **jogo / desenho:** o que a dupla decidiu, e onde ficou escrito
- **aprendiz / testes:** o que cada um construiu, em uma linha cada
- **o Figma:** o que entrou na biblioteca
- **a prova:** o número que sustenta a mudança (contraste, cliques, tempo)
- **decisões médias tomadas:** cada uma com o motivo
- **o que ficou:** o que não coube, o que foi para "pesado"
```

---

## 14/09 16:20 · v9.242 · D1 · o inventário honesto · commit `HASH`

O primeiro ciclo da segunda mente, e ele não muda uma linha de tela de
propósito: **mede**. A Fase A ensinou que medir antes de mexer é o que faz a
mudança seguinte valer; aqui é o mesmo, aplicado ao visual. O resultado tem
um lado desconfortável — **quase todo número que a própria pauta escrevia
estava errado**, e por muito.

- **estado inicial:** 181/181 suítes verdes, 9/9 varredores limpos.
  `.claude/app-jsx` não existia: **ninguém tocou o `App.jsx` neste ciclo**,
  nem eu — D1 é inventário, e o bastão ficou livre para a outra mente, que
  rodava B1 na mesma árvore ao mesmo tempo. Pauta de desenho: Fase D, 0 de 5.
  `mente/formas.md` vazio.
- **jogo / desenho:** chamados **juntos, no mesmo turno**, como manda a mesa
  — forma sem momento e momento sem forma é como nasce a mesma ação com duas
  caras. O `desenho` contou o código por script; o `jogo` **jogou**: campanha
  criada do zero, 6 turnos de Uma Vida, uma partida inteira de Duelo, uma de
  Duelo PvP em duas abas reais, e 3 rodadas do Torneio.
- **aprendiz / testes:** não foram chamados. D1 não constrói nada, e chamar
  uma mão para não usá-la é ruído.
- **o Figma:** nada entrou. A biblioteca é D3, e D1 existe justamente para
  D3 não nascer espelhando o erro (ver abaixo).

### A medição

**As cores.** `T` tem **14** cores, não 15 — está em `src/constantes.js:26`
e dá para contar à mão. São **2.565 usos**, e quatro cores carregam 55% de
tudo: `inkDim` (581), `line` (344), `amber` (272), `ink` (217). O Taverna é,
literalmente, texto cinza sobre painel escuro com borda roxa e acento âmbar.
Três pares são quase-duplicatas pelo valor, não pelo nome — `panel`/`panelSoft`
(ΔL* ≈ 3,4), `onAccent`/`onSecond` (diferença perceptual quase nula, e
`onSecond` tem **8 usos** contra 54 da gêmea), `bg`/`onSecond` (quando a
tinta cai sobre o fundo, some).

**Os literais fora da tabela: a pauta dizia 30, são 242.** Só o `App.jsx` tem
**93** (40 hex + 53 `rgba`) — **3,1× o escrito**. O erro tem explicação: a
contagem antiga olhou hex e ignorou `rgba()`, que hoje é a maioria. Total nos
arquivos de tela: **242**. Fora deles, mais 78 em módulos de dado (cor de
cabelo, de bioma, de divindade — *dado de jogo*, categoria à parte e não o
mesmo defeito) e **49 em `constantes.js`**, dos quais **21 são uma segunda
paleta escondida dentro da string de `FONT_CSS`** (a cortiça, a moldura, o
cartaz, o percevejo, a vinheta). A tabela de cor tem uma paleta não declarada
por dentro.

Desses 242, **67 (28%) já são cores de `T`** — 24 hex idênticos, 43 `rgba`
com o RGB de `T` e alfa. Um helper e uma substituição mecânica apagam mais de
um quarto da dívida. Os outros 175 não são todos descuido: **71 deles, em
`painel-mapa.jsx` + `planta-cidade.jsx`, são uma paleta de pergaminho inteira
e coerente, com zero cores de `T`**. Não é sujeira à espera de faxina; é um
sistema à espera de nome.

**O movimento.** `FONT_CSS` tem **13** classes de animação, não 7 — e duas
das sete que a definição do `desenho` listava (`tv-glow`, `tv-shake`) nem são
classes, são `@keyframes` consumidos por outras. **3 de 13 têm saída por
`prefers-reduced-motion`**, e são as três menos importantes (o sigilo de
espera de uma tela administrativa). As cinco infinitas que rodam durante o
jogo não param para ninguém — `tv-agonia` pulsa vermelho **enquanto o herói
estiver abaixo de ⅓ de vida**, o que pode ser a cena inteira. As famílias
estão todas vivas, mas na proporção errada: `tv-mono` tem **682** usos contra
315 do corpo e 108 do display — a lei diz *"a prosa é a protagonista"*, e a
medição diz que a interface é escrita na fonte que existe para dizer "isto é
um número de sistema". Cruzado com a escala: **542 dos 1.107 textos
dimensionados (49%) são 9px ou 10px**, em 18 degraus de tamanho e 11 raios de
canto.

**As primitivas.** O número que resume: **218 `<button>` crus contra 16
`<Botao>` — 6,8% dos controles do Taverna passam por `ui.jsx`**. Nove dos dez
painéis usam zero primitivas de botão. Dos 49 exports, 33 são ícones, e dos
11 componentes de layout **9 têm um único leitor: o `App.jsx`** — não são
primitivas compartilhadas, são funções que saíram do App e continuaram a só
servir ao App. `:focus-visible` não aparece **uma vez** no projeto, e
`aria-*`/`role=` aparece zero vez nos dez painéis.

### O achado que a fase existe para achar

> **10 famílias de ação aparecem hoje com mais de uma forma. 4 são de
> significado** — o jogador teria de reaprender, ou uma das formas está
> errada. As outras 6 são cosméticas.

As quatro que doem:

1. **confirmar/cancelar** — quatro "cancelar" sem nada em comum além da cor,
   um deles **sem borda nenhuma** (`App.jsx:21070`), que no meio de uma fila
   de botões não parece um botão. E o pior achado isolado do inventário: o
   botão que **remove um companheiro do grupo** (`App.jsx:2540`) usa `#fff`
   sobre `T.danger` — **3,42:1, reprova em WCAG AA**. Os outros destrutivos
   usam `#1A0F0D` (5,48:1). Três tintas de texto-sobre-vermelho, duas
   inventadas na hora, e a ilegível está no único botão que apaga alguém.
2. **fechar um painel** — **8 formas visuais, 4 regras de fecho, e `Escape`
   não fecha nenhuma das 15 sobreposições** (há 6 `onKeyDown` no `src/`
   inteiro, todos `Enter`). Quatro tamanhos do mesmo `✕`, e o mesmo gesto ora
   é um glifo de 10px no canto, ora um botão âmbar de 48px no centro.
3. **"não pode agora"** — **8 opacidades diferentes** em 41 lugares, mas
   `disabled=` em 42 dos 218 botões e `cursor: not-allowed` **4 vezes no
   projeto, todas dentro de `ui.jsx`**. A maioria dos controles bloqueados
   fica translúcida e **continua clicável, com cursor de mão**: o clique não
   é recusado, apenas não acontece.
4. **a ação principal entre os modos** — `Agir →` é mono 12px em `historia`,
   faixa `tv-display` 18px no torneio, outra faixa `tv-display` 18px em
   `rapida`/`duelo`. O `CLAUDE.md` diz que modo é *"lente sobre o mesmo
   motor, nunca um segundo jogo"*. Visualmente, hoje, é um segundo jogo.

As cosméticas, pela escala: **13 assinaturas visuais distintas do botão
primário** (3 raios, 6 alturas, 2 famílias tipográficas — todas dizendo
`background: T.amber`), **15 overlays com 9 fundos, 5 desfoques e 2
z-index** (o de `App.jsx:459` é `z-40` e passa por baixo de qualquer `z-50`
aberto), **4 gramáticas para o veredito antes do clique**, 5 formas de dizer
erro, 2 vermelhos e 2 sinais de menos para o mesmo dano.

### O que o `jogo` viu jogando (e que nenhuma contagem acha)

O `desenho` leu o código; o `jogo` sentou-se e jogou. Metade do que ele trouxe
**não aparece numa contagem de `style={{}}`** — e é por isso que a mesa anda
em par.

- **O Duelo não é jogado, é relatado.** **3 cliques do menu ao resultado
  final**, sem um turno pelo caminho — e o vencedor aparece **antes** das 48
  linhas de log das três quedas. Não há uma linha de tensão no modo inteiro.
- **Vitória e derrota são o mesmo ecrã.** Comparado lado a lado nas duas abas
  do PvP: quem perdeu vê `A Sombra vence · 2×1` na mesma cor e no mesmo
  tamanho que quem ganhou. Nada marca qual campeão era do jogador.
- **A batalha não cabe.** O campo de 16×16 e o painel `Ações` vivem dentro do
  scroller narrativo de **301 px** com `overflow: hidden auto`: clica-se em
  `Ações` e **não aparece nada** — está abaixo da dobra. `⤢ ampliar` promete
  tela cheia e abre outro bloco dentro do mesmo scroller clipado. **O campo
  inteiro nunca foi visto.**
- **Não dava para saber de quem era a vez.** O inimigo ficou `● AGINDO` por
  mais de 10 s enquanto o jogo esperava pelo jogador, cuja linha não tinha
  marca nenhuma. Depois, 3 rodadas escrevendo "me aproximo" com o log só
  reportando o movimento do adversário, a grelha não sendo clicável, e o
  resultado `9 de 9 m nesta rodada` — **nunca andou um metro**, com o jogo
  mandando "aproxime-se primeiro".
- **Um emoji sem rótulo terminou a luta.** `⛺` clicado a meio do combate
  encerrou a partida do torneio sem confirmação e sem dizer o que aconteceu.
  A ação mais irreversível da sessão, atrás do controle mais mudo. E o
  veredito do **Destino** (*"o segundo dado vale — mesmo se for pior"*) mora
  num atributo `title`: invisível sem rato, inexistente no telemóvel.
- **O momento não é marcado.** A conclusão da primeira missão da campanha foi
  a **quarta de seis pílulas cinzentas idênticas**, sem pausa, sem som, sem a
  barra de XP enchendo. O jogo tem o padrão certo e usa-o uma vez só: o modal
  do dado, que escurece a tela e revela "Falha" em vermelho — *"o único
  momento da sessão inteira em que senti que estava a jogar"*.
- **E a lei mais partida do dia não é de cor, é de texto.** *"O sistema não
  fala de si mesmo"* — **13 strings de bastidor chegam à tela**, com a quota
  de API do autor à cabeça: `Limite diário alcançado (500 chamadas)… me
  avise: o teto sobe` (`api/_portao.js:174`, renderizado no log de jogo),
  `sem gastar tokens`, `semente`, `selo da luta`, `roster` ×4, `o modelo
  forte`, `espinha`, `tabelas geradoras`, `canal`. Uma cor errada faz o jogo
  feio; `sem gastar tokens` no inventário faz o jogo deixar de ser um jogo.

### A prova

| o que a pauta dizia | o que a medição achou |
|---|---|
| 15 cores em `T` | **14** |
| 30 literais no `App.jsx` | **93** (242 no projeto de tela) |
| 7 animações | **13** classes (3 com saída) |
| — | **218 `<button>` crus / 16 `<Botao>`** = 6,8% |
| — | **10 famílias de ação com duas caras**, 4 de significado |
| — | **13 strings de bastidor na tela** |
| — | `#fff` sobre `T.danger` = **3,42:1**, reprova AA |

### decisões médias tomadas

- **Corrigi a Fase D em quatro pontos, em vez de a executar como escrita.**
  Foi assim que A1 e P1 acertaram as suas fases, e a régua aqui é a mesma:
  medição que contradiz a pauta corrige a pauta, não se cala.
  - **D2** dizia que levar `T` e `FONT_CSS` para `src/estilo.js` é "zero
    diferença na tela". É verdade para `T`; **não é para `FONT_CSS`**, que
    não é tabela e sim 156 linhas de CSS com 21 cores literais próprias e 4
    classes de layout. Mover inteiro só mudaria o arquivo onde o problema
    mora — e D5 não conseguiria varrer as cores de `FONT_CSS` sem varrer a si
    mesma. D2 agora parte o destino em três: `FONT_CSS`, `MOVIMENTO_CSS`,
    `SUPERFICIES_CSS`. Ficou registrada a armadilha que custaria caro:
    **`App.jsx:10205` e `:10222` têm uma variável local chamada `T` que é o
    torneio**, não o tema; patch por regex sobre `\bT\b` no App atinge-as.
  - **D3** ia nascer espelhando `ui.jsx` cru — 49 componentes, 33 ícones, 4
    mortos, e **sem** os cinco controles onde a divergência de verdade mora.
    A biblioteca espelharia os 6,8%. Agora entram as primitivas com ≥2
    leitores reais **mais** destrutivo, fechar, sobreposição, badge e barra.
    E ficou dito que desenhar o foco no Figma é **inventar**, não espelhar.
  - **D4** catalogava botões. O `jogo` mostrou ações que o jogador toca e que
    **não são controles** (mover em combate, que o jogo manda fazer e não dá
    forma de fazer) e controles **sem rótulo** (`⛺`, `🎲`, `⤢`). Sem estarem
    na lista, passam pela catraca por não existirem.
  - **D5 era impossível como estava.** "Nenhuma cor literal fora da tabela"
    são 242 violações hoje — uma lista de perdão com 242 entradas não é
    catraca, é inventário com outro nome; e a regra bate em `constantes.js`,
    ou seja **a tabela violaria a própria regra**. "Nenhum controle sem forma
    declarada" são 218 `<button>` sem nenhum mecanismo que ligue um ao outro.
    Reescrita em **três dentes que fecham em ordem, cada um verde no dia em
    que nasce**: D5a a catraca do teto (a contagem atual congelada, falha se
    subir — zero perdões, verde hoje, a dívida só desce), D5b a catraca do
    fácil (literal que já é cor de `T`), D5c a catraca do movimento. A
    cláusula dos controles **sai de D5** e vira etapa depois de D4: só se
    exige forma de todo controle quando existir a primitiva que a carrega.
    Escopo fixado em `src/**` + `index.html` + `api/*.js` — nunca o
    repositório inteiro, porque **`testes/render-teste.mjs` é um bundle
    esbuild commitado com uma cópia de `T` e 56 hex** e daria 56 falsos
    positivos a quem globasse ingenuamente.
- **Abri D6 · o sistema para de falar de si mesmo.** A lei mais partida do
  dia não cabia em D5 como estava escrita, e é grande demais para virar item
  solto: 13 strings, e `check-formas.mjs` ganha um quarto dente com lista
  negra de vocabulário de bastidor — **com `api/*.js` no varrimento**, porque
  a pior string de todas vem de lá e chega inteira ao jogador.
- **Corrigi os números errados em `.claude/agents/desenho.md`** (15 cores, 7
  animações, quatorze painéis). Cabeçalho errado é `leve` pela tabela, e
  deixá-lo mentir significava que todo `desenho` futuro leria a mentira antes
  de medir.

### o que ficou

- **Nada foi consertado — nem uma cor.** A etapa é o retrato, e conserto de
  carona é exatamente o erro que ela existe para não cometer. Os 67 literais
  que já são `T` estão medidos e esperando; foram **deliberadamente** deixados
  em paz.
- **7 itens foram para "Para a pessoa decidir"**, todos com o número que os
  sustenta: a batalha tomando a tela, o Duelo jogado queda a queda, a sala ao
  vivo com momento partilhado, mover sem depender do Narrador, `Esc` fechando
  as 15 sobreposições, a escala de texto virando tabela, e a ação principal
  igual nos três modos. **15 foram para "Aberto"** (leve e médio), na ordem
  do retorno.
- **A cobertura tem buracos declarados.** O `desenho` não jogou: a seção das
  10 famílias é leitura de código, e se duas formas nunca aparecem na mesma
  sessão, o custo real é menor que o número sugere — cruzar com o `jogo`
  antes de D4. E **o Narrador morreu a meio da sessão** (quota diária de 500
  chamadas), então **O Capítulo não foi jogado e nenhuma tela de vitória ou
  morte de Uma Vida foi vista**. O que se diz aqui sobre "o fim" vale só para
  o Duelo.
- **Vermelho do outro território, não consertado, como manda a lei:** o
  `jogo` achou frases montadas por concatenação que se partem na tela — *"Em
  a areia aberta"*, *"está em atrás do bloco de gelo"*, *"Chegar a a
  capela"* — e uma missão dada como concluída (`Tirar Halvard de lá`) no
  mesmo turno em que o Narrador escreveu que a capela estava vazia. É regra e
  texto de motor: fila do sistema, não desta. Fica aqui anotado para o
  `conselheiro` pegar.
- **Colisão de nomes entre as duas filas:** `mente/pauta.md` tem um `D2 · O
  Duelo na mesa` e um `D3 · As duas portas da arena`, e `pauta-desenho.md`
  tem outro `D2` e outro `D3`. Quatro etapas vivas com dois nomes. Não é
  design, mas vai custar um mal-entendido a alguém — a próxima fase de uma
  das filas que escolha outra letra.

---

## 14/09 · a segunda mente nasce · (ainda sem ciclo)
- **estado inicial:** `jogo`, `desenho` e `aprendiz` criados e nunca
  chamados; Fase D aprovada, 0 de 5; `mente/formas.md` vazio.
- **o que se fez:** a fila do desenho ganhou pauta e diário próprios, um
  `regente` para conduzi-la, e um bastão para o `App.jsx` — que é o único
  lugar onde as duas mentes se encontram.
- **o que ficou:** o primeiro ciclo de desenho ainda não rodou.
