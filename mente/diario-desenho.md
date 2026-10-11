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

## 11/10 · sem versão (só Figma e `mente/`) · **Retratos — a pintura que escala** · pedido direto da pessoa
- **estado inicial:** pedido dela fora da fila (*"criar as imagens de perfil dos personagens digno de um RPG AAA"*); só Figma, sem código de produção. Não tomei o bastão do `App.jsx`. Na árvore, trabalho da outra mente em `src/` (MM18, `escuta.js`), que não toquei.
- **desenho:** o sistema é um **misto** — pintura por biblioteca (feras por espécie; gente por raça × sexo × traje, traje = classe ou ofício, 2 variantes), moldura e estado por código, marcas por cima. Escrito em `formas.md` §Retratos, com as fontes (Pillars, Pathfinder WotR, BG3, DOS2, Darkest Dungeon, Critical Role, Battle Brothers, Wildermyth, WCAG 1.4.1/1.4.11, o estudo do WebP).
- **o Figma:** página `08 · Retratos` (`181:2`); coleção `Retrato (RETRATO)` (aliases, nenhum número novo); `Retrato/Chip` `183:142`, `Retrato/Cartão` `183:2033`, `Retrato/Ficha` `183:2174` (cada um Papel 5 × Estado 5); amostra dos 20 `184:2`; par antes/depois na mesa `187:236`; o sistema `188:409`; as matrizes `189:409`. 20 imagens geradas (`gemini-3.1-flash-image`, plano Pro, nenhuma recusa).
- **a prova:** contraste do anel por papel 5,79–12,34:1 no pior fundo; o Caído media 2,83 a 0,6 e subiu a 0,8 → 4,21. Âmbar × vermelho = 1,52:1 — é por isso que o papel também é forma. Peso medido no Chromium: WebP q 0,75 a 2× = 1,5 / 3,0 / 8,4 KB (chip / cartão / ficha); um só arquivo de 320 serve aos três.
- **decisões médias tomadas:** a peça nova e a troca do rosto pela pintura (o retrato fica no mesmo sítio); o papel **Neutro** (o elenco não é aliado até a história dizer); o chip 28 → 32 proposto ao `jogo` (a pílula passa a 48, o piso de `ALVOS`).
- **o que ficou:** gerar a biblioteca (~1 020 matrizes, créditos) e a proposta ambiciosa (*o retrato guarda a campanha*) foram para *Para a pessoa decidir*; R1–R6 em `pedidos-ao-sistema.md`. As três peças ainda não subiram ao ficheiro da biblioteca (`e5wJ…`), a mesma dívida do Mapa e de B1.

---

## 10/10 · v9.367 a v9.369 · **A1 — a auditoria da informação que chega ao jogador** · commits `b7c31dd`, `92f48de`, `4110491`

*Ordem da pessoa, 10/10: "há coisas e informações que aparecem que não são
necessárias, isso acaba confundindo o player mais do que ajudando, coloque na mão
do designer de games todas as informações… e veja se é realmente necessário, e se
for, se a forma… é a melhor". Quem decidiu foi o `jogo`: `mente/a1-jogo.md`.*

- **estado inicial:** sem pausa; trava tomada às 15:00. O `orquestrador` vivo na
  árvore (MM17, P2, P3), a subir v9.363 a v9.366 durante o ciclo. **O bastão do
  `App.jsx`** foi tomado para o `oficial` às 15:37 (B1), renovado às 16:20 (B2–B9),
  17:21 e 19:56 (B11, depois do limite de sessão), e **devolvido às 20:25**, antes
  da prova jogada. **A1 (rascunho) entrou em `3a2d041` junto com o Mapa** — o
  designer do mapa commitou `formas.md` com a secção §A1 dentro; o coordenador
  decidiu não reescrever, e ela está certa no sítio.
- **o ciclo caiu uma vez** no limite de sessão da API (429), no começo da terceira
  etapa; retomado depois do reposto, sem perda (a etapa não tinha escrito nada).
- **o inventário (Explore):** 145 peças do código, com arquivo:linha, o que dispara
  e quantas vezes (`scratchpad/auditoria/inventario.md`). O achado de base: **não
  há sistema de toasts** — tudo passa pelo funil `pushMsgs` (482 chamadas), e só 7
  prefixos dobravam.
- **jogo (o ANTES, jogado):** 10 turnos de um roteiro fixo a 1440×900, numa cópia
  do HEAD: **5,0 interrupções por turno** (50), 3,2 sem a luta; **8 contradiziam a
  prosa ou a ficha**, 14 repetiam a prosa. *"O que mais confunde é a contradição,
  não o excesso."*
- **jogo (o veredito):** 153 peças — **corta 24, muda a forma 53, ficam 76**; o
  plano em quatro: A (fora do App, 10), B (App, 10), C (motor, 10 pedidos), D (a
  pessoa, 3).
- **desenho:** as seis peças em `formas.md` §A1 e no Figma (biblioteca, página
  `A1 · a informação` `254:67`): O recibo, A dobra·Luta, O fim da luta, os glifos
  fera e morto, a hora cheia (`8h`), e a emenda à lei de E4 (*o custo onde
  surpreende*: 0 números em 80 casas na luta do roteiro). Seis divergências com o
  `jogo`, escritas com os dois lados.
- **oficial (Opus):** B1 — o relato sai do App para `painel-relato.jsx` (byte a
  byte, `innerHTML` idêntico ao HEAD); `naLuta`, `recibo` e `fimDaLuta` nas
  mensagens (campos novos, ignorados pela versão antiga); B2 o recibo pela foto da
  ficha; B3 sem "Pego o cartaz", o aceite dá a porta do Diário; B4 o mural; B5 o
  chão preso à cena; B6 o "1" de GESTÃO sai; B7 o espólio vai à batalha; B8 as
  frases que falavam do sistema; B9 o dano depois da reação; B11 as pontas (o
  rodapé do Mercado que a pessoa citou, o lugar no cabeçalho da batalha, a marca
  que não repete o recibo).
- **aprendiz (Opus):** `MORADA_DA_LINHA`/`reciboDoTurno`/`arrumarORelato` puros
  em `glifos.js`; O recibo, a dobra da luta e a dobra do dia no relato; O fim da
  luta na batalha; a hora cheia; o custo onde surpreende; Esquivar fora da fileira;
  os glifos fera/morto; os rodapés dos painéis; o varredor novo
  `check-sistema-nao-fala` (22 → 0, congelado em 0); a porta do Diário; e o
  conserto da reserva do recibo que a prova achou (a dobra escondia `−10 PV +14 XP`
  a 1440 por guardar espaço para um "e mais N" que não ia aparecer).
- **a prova (o DEPOIS, jogado pelo `jogo` no `92f48de`, mesmo roteiro):**

  | medida | ANTES | DEPOIS |
  |---|---|---|
  | interrupções por turno | 5,0 (50) | **1,8** (18) |
  | sem a luta | 3,2 | **1,0** |
  | a luta sozinha | 21 | 9 |
  | contradizem a prosa/ficha | 8 | **3** (as três do motor) |
  | repetem a prosa | 14 | **4** |
  | turnos só com prosa | 0 | **4 de 10** |
  | o sistema a falar de si à vista | 3 | **0** |

  O `jogo`: *"Ficou melhor, e muito… Nada do que se cortou me fez falta."* E o aviso:
  *"com o ruído calado, é o silêncio que mente"* — no T4 o cambista entrega a poção
  e nada muda; a prioridade seguinte é o motor. **Ressalva honesta:** parte da queda
  do T4 é a compra não ter acontecido; o recibo de uma compra real ainda não se viu
  numa partida (A1b).
  Build limpo e `npm test` 272/272 · 16/16 em cada fatia, e **o HEAD verde num
  worktree limpo antes de cada subida**.
- **decisões médias, com o motivo:** (1) o relato saiu do App (*mover vale mais que
  remendar*: o relato inteiro passa a ser da mesa); (2) a morada é **lista branca** —
  o que não está na tabela continua à vista, porque calar por engano é pior que
  mostrar; (3) o recibo calcula-se pela ficha e não pelas linhas, e por isso não pode
  desmentir a bolsa; (4) a hora cheia na cinta (era a peça que mais aparecia, 9 em 50,
  e ninguém decidia nada com o minuto); (5) Esquivar sai da fileira (revoga o
  "desligado" de B1: um botão que só diz que não faz nada é ruído); (6) morte e poder
  único furam a dobra da luta; os cinco graus de "Encontro…" calam; (7) a catraca
  `check-sistema-nao-fala` fica em 0 e só pode descer.
- **correção ao commit `92f48de`:** a mensagem diz que o último lobo "aparece caído"
  na tela da vitória; na prova ele **some** do tabuleiro. Fica em A1b (1).
- **o que ficou:** 11 pedidos ao sistema (`pedidos-ao-sistema.md`: os 10 do `jogo` e
  o `mercado.js:200` que derruba o jogo, visto duas vezes); A1b na pauta (8 pontas
  da prova); para a pessoa: D1, D2, D3 e *o espólio cai no tabuleiro*.
- **para quem joga:** em 4 de cada 10 turnos a tela é só a prosa e o campo; a luta
  volta como uma dobra fechada em vez de 13 linhas; a vitória tem momento (Vitória,
  o ganho, o que ficou no chão); o jogo deixou de dizer "sistema", "Narrador",
  "tokens" ou "aferido" em qualquer frase à vista.
- **a proposta ambiciosa:** D2 — *o Mestre diz o número, a mesa só anota* (aposentar
  também o recibo depois de o motor deixar de mentir; cerca de 1,4 peças por turno).

## 06/10 · v9.360 · **B1b — a mesa de batalha cabe na janela, sem rolar** · commit `146cb5c`

*Defeito da pessoa, com foto: "a tela de batalha deveria caber tudo sem precisar
descer ou subir, assim como no figma". A forma: `mente/formas.md` §B1b.*

- **estado inicial:** sem pausa; trava do desenho tomada às 21:06. **A versão é v9.360 e não v9.359** porque o `orquestrador` já tinha `v9.359` escrito na árvore para a etapa dele (por commitar); subo por cima com o número seguinte, e fica o maior. O bastão do
  `App.jsx` era do `orquestrador` (MM17 C2, desde 20:50) — **não foi pedido nem
  tocado**: a emenda mora inteira em `painel-batalha.jsx` e na grade.
- **aprendiz (Opus):** a casa no monitor passa a caber nas duas direções (piso 32,
  teto 64, em tabela); dois patamares de altura; os participantes sobem para a
  linha do título; a frase do Mestre em 2 linhas; o TURNO ATUAL encolhe; NESTA
  BATALHA rola só por dentro. Três catracas movidas com motivo (o piso do
  `ampliar`, o piso da casa, o lado só pela largura) e sete novas em
  `check-tela-de-batalha`; nenhuma relaxa o telefone.
- **a prova** (luta real, deserto 18×14, troll):

  | janela | casa | linhas à vista | rola por dentro | página rola | troll à vista |
  |---|---|---|---|---|---|
  | 1366×657 | 32 | 9/14 | sim | não | sim |
  | 1440×789 | 32 | 14/14 (régua A–R fora) | sim, 21 px | não | sim |
  | 1536×730 | 32 | 12/14 | sim | não | sim |
  | **1907×845** (a dela) | 34 | **14/14** | não | não | sim |
  | 1920×960 | 39 | 14/14 | não | não | sim |

  Floresta 16×16: inteira só a 1920×960; nunca rola a página. Estrada com 4 lobos:
  inteira a 1907×845 (casa 40); a 1366×657 NESTA BATALHA rola por dentro.
  Telefone 375×812: casa 48, sem rolagem lateral, campo 270 → 279.
  Build limpo. **Árvore:** 266/266 e 14/15 — o `check-acoes-do-jogador` vermelho
  pelo `App.jsx` do `orquestrador` em voo. **HEAD + só os meus 4 arquivos:**
  264/265 e 15/15 — o vermelho é `teste-mm5-margem.mjs`, que **falha no HEAD
  limpo** (`311e0d4`, v9.358, já no remoto) sem nenhum arquivo meu: é da outra
  mente. Subi assim mesmo, e é decisão: o vermelho já está no ar e a minha
  emenda não o toca nem o piora; segurar o conserto que a pessoa pediu por um
  vermelho que não é meu seria esperar, e o roteiro manda dizer e seguir.
- **decisões médias, com o motivo:** (1) a casa de 48 cai a 32 **só no monitor**
  (WCAG 2.5.8 AA = 24; o telefone mantém 48, 2.5.5 AAA = 44); (2) o patamar curto
  subiu de 900 para 1000 — a 960 os respiros do quadro deixavam 31 px por casa e o
  deserto não cabia por uma linha; (3) o título desce a 24 px no patamar baixo
  (a medida do telefone) — sem isso a 1907×845 dava 31 px; (4) o `⤢ ampliar` no
  monitor passa de 48 a 32 (custava 26 px ao tabuleiro); (5) o custo escreve-se a
  partir de casa 32 no monitor (11 px fixos, "13,5" cabe); (6) a barra de ação fica
  com 162 abaixo de 1000 de altura, e não os 198 do quadro.
- **o que ficou:** a régua A–R some quando o tabuleiro rola por dentro (B4, do
  `desenho`); a masmorra 7×18 não se provou (exige estar numa); B3 (o telefone)
  só ganhou 9 px.
- **para quem joga:** na janela da pessoa (1907×845) o tabuleiro passa de **4 para
  14 linhas** à vista — o campo inteiro —, o troll volta à coluna, e **nada rola**
  em nenhuma das cinco janelas de notebook provadas.
- **a proposta ambiciosa:** fica a de B1 (*o inimigo é o alvo*), ainda à espera da
  palavra dela; este ciclo foi um conserto pedido, e não abriu outra.

## 05/10 · v9.352 · **B1 — a nova mesa de batalha, igual ao quadro dela** · commit `427c93c`

*Pedido direto da pessoa, com a fila do desenho parada (ordem de 28/09): a palavra
dela vale só para esta tela. A forma: `mente/formas.md` §B1.*

- **estado inicial:** sem `.claude/fila-pausada`; trava do desenho livre, tomada
  às 22:42. `npm test` **258/258 e 15/15**, saída 0. O `orquestrador` vivo na
  árvore (MM16, trava das 21:39), a subir v9.351 e a abrir v9.352 durante o ciclo.
  **O bastão do `App.jsx` não foi pedido nem tocado:** a tela já tinha casa
  própria desde E3 (`painel-batalha.jsx`), e todos os dados do quadro já chegavam
  como props a `TelaDeBatalha`. *Mover já tinha sido feito; desta vez foi só
  recompor dentro da casa.*
- **jogo / desenho:** **não chamados**, e digo porquê: o quadro é da pessoa e
  está acabado; o que faltava decidir (de onde sai cada dado, o que fica desligado,
  a cor, a casa quadrada, o telefone) o `regente` escreveu em `formas.md` §B1
  antes da construção, e o telefone segue o padrão já no Figma (E1 `40:447`, E4,
  R21). Fica a dívida: o par antes/depois do telefone **não** entrou no Figma.
- **aprendiz (Opus):** `painel-batalha.jsx` recomposto (cabeçalho com título da
  região do herói, pílula AGORA, frase do Mestre, PARTICIPANTES; CAMPO DE BATALHA
  com as zonas da planta no topo, que levam a janela até elas; SUA PRÓXIMA AÇÃO
  com a linha do veredito, a fileira do quadro e o `como?` + `Agir` com o d20;
  a coluna TURNO ATUAL · NESTA BATALHA · *"O próximo movimento é seu."*);
  `grade-de-batalha.jsx` (a casa enche a janela, o chão com textura, o pé
  `ÁREA DE MOVIMENTO · 3 · 6 · 9 — CUSTO NO TERRENO`); `estilo.js`
  (`MESA_DE_BATALHA` com as medidas do quadro, que somam 1600;
  `TERRENO_DO_TABULEIRO`); `glifos.js` (`campo`, `mira`, `pena`, `estrela`);
  `check-tela-de-batalha` §10 (seis catracas novas) e `check-formas` (o teto de
  cor literal da grade **desceu** 19 → 15). `public/terrenos/deserto.jpg` é a
  imagem do próprio quadro.
- **o Figma:** nada novo na biblioteca; a fonte é o quadro `151:1662` da pessoa.
- **a prova:** build limpo; `npm test` **259/259 e 15/15, saída 0**. Luta real (campanha
  de teste, `/tp` + `/combate Troll`, no deserto): **1600×1000** casa 64 px,
  janela 1182×420, `scrollWidth` 1600; **1280×800** casa 48, janela 326;
  **375×812** casa 48, janela 270, **`scrollWidth` 375** (também com a tira aberta).
  Esquivar `aria-disabled` com a frase na linha; tocar a zona levou `scrollTop`
  506 → 23 e voltou. Capturas na pasta da sessão (`prova-1600x1000.png`,
  `prova-375x812.png` e mais três).
- **decisões médias, com o motivo:**
  1. **a cor é `T`, não a do arquivo dela** — as variáveis do quadro têm os nomes
     de `T` e os valores de antes de V1; o desenho liga-se ao token. Vai à pessoa
     em uma linha (pauta, *Para a pessoa decidir*).
  2. **a casa fica quadrada** (no quadro, 62×51): a distância do jogo é por casa;
     uma casa retangular mentiria os metros. Enche a largura, nunca abaixo de 48.
  3. **Esquivar desligado** — é o único verbo do quadro sem regra
     (`motor: null` em `golpe.js`); a frase virava ficção. Lê a tabela do motor,
     logo acende sozinho. Pedido em `pedidos-ao-sistema.md`. Os outros cinco têm
     motor e ficaram ligados; `esperar` fica ligado (faz a rodada do mundo correr).
  4. **textura só no deserto** — é a única que a pessoa desenhou; as outras nove
     plantas ficam lisas em vez de ganhar imagem escolhida pela mesa (B2).
  5. **o que o quadro não mostra traduziu-se** (lei 3 da Fase V): a régua de letras
     A–R (o endereço K14 de que o jogador depende), o véu fora do passo (mais leve,
     0,35), o pé da arena a 48 px (carrega o `⤢ ampliar`), o rastro dos dados ao pé
     da coluna, os alvos declarados em NESTA BATALHA.
  6. **dois cortes por altura**, só com valores de tabela: abaixo de 1440 de largura
     e de 900 de altura o cabeçalho e o compositor encolhem — a 1280×800 a fileira
     partia em duas e a janela tinha 164 px; ficou com 326.
- **o que ficou:**
  - **o telefone perdeu campo:** 270 px de janela contra ~436 depois de E4 — B3 na
    pauta, para o `jogo` medir o que cede.
  - **`TAVERNA / MESA DE BATALHA`** roça a lei *o sistema não fala de si mesmo*;
    está no quadro e foi pedido igual, e ficou.
  - **o obstáculo** usa três tons do quadro que `T` não tem.
  - **achado fora do meu território, não investigado:** numa das lutas de teste
    `mercado.js:204` (`gerarMercador`) derrubou o App com *"Cannot read
    properties of null (reading 'length')"*, uma vez, com o `App.jsx` do
    `orquestrador` a meio de uma edição. Fica dito para a outra mente.
  - **custo:** criar a campanha de teste chamou o `/api` do deploy algumas vezes.
- **para quem joga:** a luta abre numa mesa só, à vista de uma vez — onde está
  (*"Na areia solta"*), quem joga agora, a ordem, o chão com o terreno e o custo
  de cada passo, o seu turno com PV e PM, e o inimigo com a distância. **Nove dos
  dez controles do quadro respondem** (o décimo, Esquivar, diz porquê não); a
  casa no monitor grande passa de 48 a **64 px** (+78 % de área por toque); a
  375 px nada rola para o lado.
- **a proposta ambiciosa:** *o inimigo é o alvo* — o cartão de NESTA BATALHA arma o
  golpe nele e funde os alvos declarados (três caras do *em quem* viram uma). Na
  pauta, *Para a pessoa decidir*, porque a fila espera a palavra dela.

## 29/09 · v9.320 · **R21k — um toque nunca é um arrasto: o alforje deixa de tremer e de engolir toques** · commit `0c68ecd`

*A forma: `mente/formas.md` §`### R21k · o gesto de descer tinha de ser pedido, e
não suposto`. Item único, pedido pela pessoa com a fila do desenho parada
(ordem de 28/09).*

**A queixa, no telefone:** *"ao abrir a ficha, a tela fica toda bugada, não
consigo abrir o grupo nem as abas ao lado, quando tento clicar nas abas a tela
desce e sobe sozinha... como se tivesse fechando e volta."* O defeito é meu: fui
eu que rigi R21, e a construção leu mal uma forma que estava bem escrita.

- **estado inicial:** HEAD `fd85336`, `v9.319`; sem `fila-pausada`; a trava do
  desenho livre, tomada às 22:52; a outra mente viva (`orquestrador`, MM8c-1,
  com `src/cena.js`, `npcs.js`, `prompt.js` e testes na árvore, e com o bastão do
  `App.jsx` desde as 22:56 para a fiação dela). **Não precisei do bastão**: o
  defeito mora todo em `src/painel-alforje.jsx`.

### o diagnóstico, confirmado a medir antes de mexer

`aoPressionarConteudo` começava o arrasto em **qualquer** `pointerdown` no
conteúdo com o rolamento no topo — sem limiar, sem direcção, sem excluir o que
se toca. **As sub-abas da Gestão (`Ficha`, `Grupo`, `Pessoas`, `Mercado`,
`Mural`) moram no topo do conteúdo, onde o rolamento está sempre a zero:** cada
toque nelas armava um arrasto. O arrasto desligava a animação de entrada
(`animation: none`) e, ao soltar, ela recomeçava do zero — a folha descia a
`translateY(100%)` e subia. O tremor do dedo virava `translateY`, o alvo saía de
baixo do dedo, e o toque perdia-se. E `soltar` chamava `aoFechar` de dentro de um
*updater* de estado (efeito colateral que o StrictMode corre duas vezes).

### aprendiz

Só `src/painel-alforje.jsx` e `src/estilo.js`: o `pointerdown` passa a **armar
um candidato** num ref (sem re-render); o arrasto só **começa** num `pointermove`
que ande `ALFORJE.limiarDoArrasto` **para baixo**, com o vertical a dominar;
**nunca** a partir de botão, aba, ligação ou campo; a classe de entrada **sai do
elemento quando a entrada acaba** (`onAnimationEnd`, com rede de 300 ms) e só
volta ao reabrir; soltar abaixo de `2 × ALVOS.piso` devolve a folha com uma
transição de `VEU.sai`, sem repor a entrada; `pointercancel` nunca fecha; a pega
ganhou `touch-action: none` e o conteúdo `overscroll-behavior: contain`. Suíte
nova `testes/teste-arrasto-do-alforje.mjs` (32 asserções de fonte).

### a prova

| a 375 × 812, alforje aberto na Gestão | antes | depois |
|---|---|---|
| toques nas 5 sub-abas que **mexeram a folha** (a entrada a recomeçar) | **5 de 5** | **0 de 5** |
| toques que trocaram de sub-aba | 5 de 5, com a folha a piscar | 5 de 5, parada |
| tremor de 3 px durante um toque no conteúdo | a folha desceu 3 px (`top` 96 → 99) | parada em 96 |
| arrasto de 150 px pela pega | — | fecha |
| arrasto de 60 px pela pega | — | volta ao sítio, sem reentrar |
| arrasto de 150 px no conteúdo já rolado (`scrollTop` 300) | — | não arma nada; o conteúdo rola |

**O que isto mede e o que não mede, dito:** os toques foram `PointerEvent`s
sintéticos com `pointerType: "touch"` (os cliques da ferramenta chegam como rato
e não tremem). Medem a regra — nenhum toque abaixo do limiar mexe a folha, e a
entrada não se repõe. **Não medem um dedo real num telefone real**, e há um caso
que só esse prova: no conteúdo, um dedo verdadeiro a descer com o rolamento no
topo pode ser tomado pelo navegador (`pointercancel`) antes de o nosso arrasto
nascer — o conserto garante que isso **nunca fecha nem treme**, mas o fecho pelo
conteúdo pode não acontecer no aparelho. A pega fecha sempre (`touch-action:
none`). Fica na pauta como R21l.

- `npm run build` limpo. **Na árvore, `check-acoes-do-jogador` está vermelho
  (94 endereços do `App.jsx` deslocados) — é da outra mente**, que tem o bastão
  e está a editar o `App.jsx` agora; eu não o toquei. **HEAD + só os meus três
  arquivos (`mente/so-o-meu.sh`): 230/230 suítes e 15/15 varredores.** Verde meu;
  subo.

### decisões médias tomadas, cada uma com o motivo

- **O limiar é 8 px, citado:** o *touch slop* do Android (`config_viewConfigurationTouchSlop`
  = 8 dp no AOSP), a distância abaixo da qual a plataforma ainda chama o gesto de
  toque. Mora em `ALFORJE.limiarDoArrasto`.
- **Não passou pelo par:** não é forma nova — é a saída 5 de §2 construída como
  estava escrita (*"o comportamento das folhas do iOS"*). O `jogo` e o `desenho`
  já a tinham assinado; falhou a tradução. Figma sem alteração.
- **`touchmove` com `passive: false` ficou de fora:** só entraria se o
  `overscroll-behavior` não bastasse, e nada medido o pediu; acrescentá-lo sem
  prova seria inventar problema. Se R21l mostrar no aparelho que o fecho pelo
  conteúdo não acontece, é ele o próximo passo.

### o que ficou

- **R21l** — provar num telefone físico o fecho pelo conteúdo (e o `touchmove`
  se faltar).
- **Sem proposta ambiciosa neste ciclo, e o motivo é a ordem:** a fila do desenho
  está parada desde 28/09, e a pessoa pediu este conserto e só ele. Propor agora
  seria abrir trabalho contra a pausa dela.

### o que mudou para quem joga

**No telefone, abrir a ficha deixa de ser uma luta:** tocar nas sub-abas da
Gestão (`Grupo` incluído) ou em qualquer botão da ficha já não faz a folha descer
e voltar — **de 5 toques em 5 que a sacudiam para 0**, e cada toque abre à
primeira. Arrastar a pega para baixo continua a fechar; um arrasto curto devolve
a folha ao sítio sem ela "reentrar".

---

## 28/09 23:40 · v9.303 · **V6 — o compositor e o dado: nenhuma letra se perde, e há um dado só** · commit `445ef0b`

- **estado inicial:** trava tomada às 22:03; HEAD `6805086`; nenhum ciclo do
  sistema. **Lei do coordenador para a V6a:** *letras escritas enquanto o Mestre
  pensa perdem-se sem aviso, 0 de 20 — o jogador a perder a própria frase sem
  perceber*; nada do que se escreve se perde, nunca; o envio é que espera.
- **jogo** (`mente/v6-jogo.md`): o campo nunca fica desativado, o `bloqueado`
  só trava o envio; o `Enter` na espera não envia, não apaga e não fica em fila
  — o dado dá um pulso e diz porquê; **nunca há envio automático** (uma frase
  escrita antes de ler a resposta não parte sozinha). Mapeou mais dois caminhos
  por onde as letras se perdiam: **ir ao menu apagava o texto** (`irMenu` fazia
  `setEntrada("")`) e **recarregar a página também** — daí o rascunho. A base: 0
  de 20 letras na espera e com teste pendente; o `Rolar d20` era o alvo mais
  pequeno da tela principal (132×28).
- **desenho** (`formas.md` §V6, `mente/v6-desenho.md`, scripts LF/CRLF provados
  em `6805086`): o dado da pessoa (`126:117`) com o d20 de V3 e cinco estados
  (Repouso · Pronto · Lançado · À espera · Rolar; `estadoDoDado` puro em
  `glifos.js`); a linha do veredito fora da batalha; a pílula com o `✦` dentro;
  o rascunho numa chave por modo (`taverna_rascunho_<modo>`), **fora do save**,
  marcado com a campanha. Os 15 desvios numerados no quadro `146:2` do arquivo
  da pessoa. **Três decisões do `regente`:** a sala a dois fica como está (o
  protocolo é da pessoa, e a suíte dela intacta); a largura do campo no
  telefone decide-a o `jogo`; **a linha do veredito da batalha não se troca** —
  o combate está parado por ordem da pessoa.
- **o bastão do `App.jsx`:** tomado pelo `regente` às 22:48 para o `oficial`, **devolvido às 23:36**, logo depois de `445ef0b` subir — e depressa de propósito: a outra mente precisa dele para tirar Uma Noite e o Duelo do menu (MM0).
- **a ordem de 28/09 chegou a meio do ciclo:** V6 fechou e subiu (o push levou junto o `fe4a829` do coordenador); **a fila do desenho para aqui** até a pessoa falar. A pauta ficou arrumada: V6 fechada, V7 com a herança escrita, a Fase S e os itens só do Duelo marcados *depois do beta* (nada apagado; a sala de dois fica). **Um arquivo estranho na raiz** (`Userscl…scratchpadpautaDoTurno.txt`, um caminho do scratchpad que perdeu as barras) **não é deste ciclo**: não foi commitado nem apagado.
- **oficial**: scripts 1-2-3-5-6; **24 442 → 24 527
  linhas**, 0 endereços mexidos; confirmou que a suíte da sala não foi tocada,
  que nada no combate mudou, e que **o rascunho só escreve na sua chave** — nenhum
  toque nas chaves do save nem no formato dele, e nenhum código percorre as
  chaves do `localStorage`.
- **a prova jogada** (depois na 5173, Mestre simulado, 375 e 1280, **custo 0**):
  **sobe com três consertos.**
  - **letras na espera: 0 → 20 de 20**, e ficam depois de a resposta chegar;
    **com teste pendente: 0 → 20 de 20**; `Enter` na espera: 0 envios; 0 envios
    automáticos em 5 s; **um dado só** em todos os estados; o rascunho sobrevive
    a recarregar; ao lado do `126:112`, nada fora de D1–D15.
  - **os consertos:** (1) no telefone o texto do campo aberto começava a 65 px da
    borda, com 201 px de largura — lia-se como uma citação; o `✦` passa ao canto
    de baixo, sem coluna, e o texto a 16 px com ~250 px (+25 %); (2) o anel de
    foco de 3 px de `ink` era a linha mais clara da tela → 2 px de `lineStrong`
    (4,16:1); (3) **um defeito anterior a V6**: o d20 da espera rodava sem fim
    com "reduzir movimento".
  - **os consertos, feitos no mesmo commit** (script do `desenho` provado numa
    cópia da árvore com V6 aplicada; o `oficial` aplicou e viu vivo): a 375 o
    texto do campo aberto começa a **17 px** da borda (era 65) com **249 px** úteis
    (era 201, +24 %), o `✦` no canto de baixo; o anel é 2 px `lineStrong`; o d20
    da espera **parado e escurecido** com `reduce` (a regra de folha vale no véu e
    na lenda — nenhum arquivo do combate a usa). `teste-v6-compositor` 52/52.
  - **a sala a dois:** não perde letras, por leitura do código; o lado do
    cliente que não é anfitrião **não foi verificado ao vivo**.
  - **não medidos, e não bloqueiam:** a catraca de R6 e *Enter contra toque* —
    com o Mestre simulado quem escolhe é o próprio `jogo`, que conhece o dado, e
    os números não valeriam nada. Pedem uma sessão real de 20 turnos (~20
    chamadas); **não a gastei sem a pessoa** — idealmente é ela a jogar os
    primeiros 5 sem lhe explicarem o dado.
- **decisões médias:** o rascunho fora do save (uma chave de preferência; um
  commit revertido deixa só uma chave inerte); nunca envio automático; o dado
  "Pronto" também na sala a dois enquanto se pode reescrever (o `jogo` corrigiu
  a sua regra 5).
- **as ambiciosas:** **V6b — a frase mostra o preço antes de partir** (`jogo`,
  pedido `vereditoDaFrase` ao sistema) e **V6c — o dado lembra a sorte da mesa**
  (`desenho`). Nenhuma vai à pessoa.

---

## 28/09 22:00 · v9.301–v9.302 · **V5e — a resposta chega pelo começo, e a cerimónia acende** · commits `1d414df` (V5e, v9.301) e `0b06385` (a cerimónia, v9.302)

- **estado inicial:** trava tomada às 20:19; HEAD `c5acc8c`; nenhum ciclo do
  sistema. **O achado de V5, dito pelo coordenador o mais importante desde
  R12:** no telefone o jogador cai no fim de TODAS as respostas e lê primeiro as
  últimas 12 linhas. **Duas leis dele:** quem já está a ler não é arrancado; com
  "reduzir movimento" o salto é seco.
- **jogo** (`mente/v5e-jogo.md`, o mesmo agente de V5a–V5): onze regras. A
  regra-mãe numa conta: *a vista vai ao fim, mas nunca para além do começo da
  resposta* — a curta ancora no fim como hoje, a longa pousa pelo começo.
  "Estar no fim" passa de 240 px a **¼ da área** (~112 px): medido, quem subia
  180 px para reler era arrancado. O instante que conta é a chegada, não o
  envio (é nos ~14 s de espera que se sobe para reler). A rolagem pendente
  passa a segurar contra o começo — hoje, com um teste pendente, **a resposta
  nascia toda abaixo da vista, sem uma linha e sem seta**.
- **desenho** (`formas.md` §V5e, `mente/v5e-desenho.md`, scripts LF/CRLF
  provados em `c5acc8c`): `pousoDaVista`/`estaNoFim`/`comportamentoDaRolagem`
  puras em `glifos.js`; a espreita do alforje virou peça (`TiraDaResposta`) e a
  seta ganhou dois estados (`SetaDaLeitura`: Fim · Novo) — **uma ação, uma
  forma**; dois defeitos pegos na própria prova e consertados (o envio não
  reiniciava o turno — o autor das falas é `"jogador"`, não `"voce"`; o
  `tv-fade` desenhava a resposta 8 px abaixo e o pouso ficava 8 px baixo).
  Afastou-se do `jogo` em dois pontos, e o `jogo` concordou com os dois: enviar
  leva ao fim **sempre**; o "Novo" é a tira da espreita e não uma pílula nova.
  Sem desvios do Figma: a pessoa não desenhou o pouso.
- **o bastão do `App.jsx`:** tomado pelo `regente` às 21:27 para o `oficial`, **devolvido às 22:02**, logo depois de `0b06385` subir (o commit da cerimónia não tocou no `App.jsx`: só `estilo.js` e a suíte).
- **oficial**: scripts 1-2-3-5-6, **sem o 7**;
  **24 315 → 24 442 linhas**, antes da 22 489 só trocas na mesma linha, 0
  endereços mexidos; D5a do `App.jsx` 75 → 74.
- **a prova jogada** (antes `c5acc8c`; o depois na 5173 e uma cópia com a
  cerimónia acesa na 5181; o Mestre simulado com as cinco respostas reais,
  **0 chamadas**): **V5e sobe.**
  - **a primeira linha da resposta à vista, com o jogador no fim: 0 de 10 →
    10 de 10** (as cinco respostas, 375 e 1280), a runa a 24 px, 14–15 linhas
    desde a primeira;
  - a reler 180 e 600 px: **0 px** de deslocação (antes, 180 px era arrancado),
    e a tira "Novo" com a primeira frase; o toque pousa a runa a 24 px;
  - `reduce`: salto seco (a 150 ms já no lugar; antes ainda rolava); nada
    salta em 30 amostras; abrir o jogo pousa no começo da última resposta.
  - **não provocados ao vivo, e ditos:** a rolagem pendente (o teste vem do
    Cronista, e a prova corta esse pedido) e as linhas do sistema que chegam
    depois — cobertos pela suíte `teste-v5e-chegada`.
  - **uma nota de método do `jogo`, dita por ele:** na primeira corrida
    esqueceu o envelope `{ texto }` da resposta e mediu uma resposta de duas
    linhas; refez tudo.
- **a cerimónia — veredito separado: acende.** Os três critérios do `jogo`
  passaram: inteira à vista a 72 px em **10 de 10**; a resposta curta com a
  cerimónia e o fim a 0 px (2/2); a reler, acende e a vista não se mexe (4/4).
  As duas falhas de V5 desapareceram (fora de vista 5/5 → 0/10; o fim empurrado
  −53/−64 → 0 px). Custa uma a duas linhas à vista, só nos dois turnos dela.
  **Subiu em commit próprio.**
- **o que ficou:** V5g (a tira "Novo" tapa ~1,7 linhas na mesa: vai para a
  margem direita); **V6a — a espera deixa escrever**: o campo fica `disabled`
  enquanto o Mestre pensa e as letras escritas **perdem-se sem aviso (0 de
  20)** — era uma decisão de `v1-jogo.md` §2, e o `jogo` corrigiu-se a si
  próprio.
- **as ambiciosas:** **V5h — a tira "Novo" conta o que chegou** (`desenho`) e
  **V5i — o marcador de onde paraste** (`jogo`, numa chave de preferência, nunca
  no save). Nenhuma vai à pessoa.

---

## 28/09 20:30 · v9.300 · **V5 — a página: lê-se como um livro, não como uma conversa com etiquetas** · commit `2100eaa`

- **estado inicial:** trava tomada às 20:47; HEAD `1bb8f4d`; nenhum ciclo do
  sistema. **Pedido do coordenador, por causa da pessoa:** ela lê a v3 como
  *"exatamente igual"* — **cada desvio do Figma leva a razão no próprio quadro**,
  um por um, para poder recusar um sem desfazer os outros; e a dívida de V5a (o
  lugar repetido na masmorra) paga-se aqui.
- **jogo** (`mente/v5-jogo.md`, retomado — o mesmo agente de V5a e da prova de
  V4): nove desvios D1–D9, cada um com o que custa recusá-lo; a soleira no pé,
  dentro da borda e fora do que rola (a oferta dura vários turnos); **a abertura
  grande só na primeira frase** (o parágrafo do Mestre tem 336–481 caracteres
  contra os 170 da v3: a 28 px custaria meia página); **V5b fechou dentro de
  V5** (o nome do lugar grande repetiria o cabeçalho a 80 px); o painel da sala
  diz a sala, não o lugar.
- **desenho** (`formas.md` §V5, `mente/v5-desenho.md`, scripts LF/CRLF provados
  em `1bb8f4d`): D10–D17 medidos (a oferta perde a caixa ciano dentro do pé —
  com ela o verbo quebrava a 375 e a prosa perdia 21 px; ofertas empilhadas —
  lado a lado cada coluna teria 544 px contra ~600; a espera mantém o dado que
  rola e o `PontoMestre` aposenta-se; a voz em pt-BR; V4d junto). **Os D1–D17
  estão escritos e numerados no quadro `144:2` do arquivo da pessoa**, com o
  `126:5` clonado ao lado da página a 1280×912. Biblioteca: página `V5`
  (`244:320`), seis peças.
- **o ciclo caiu no limite de uso da API** (25/09, ~22:05), com a prova do `jogo` já escrita (§8) e o `oficial` a começar os dois consertos. **Nada se perdeu:** o trabalho ficou todo na árvore, e ninguém lhe tocou em três dias (HEAD continuou `1bb8f4d`). **Retomado a 28/09 às 20:05**: a trava (20:47) e o bastão (21:51), com mais de 90 minutos, foram renovados em nome do mesmo ciclo; build e suíte conferidos verdes com o que estava no disco (216/216 · 15/15) antes de continuar; o mesmo `oficial` retomado para os consertos.
- **o bastão do `App.jsx`:** tomado pelo `regente` às 21:51 de 25/09 para o `oficial`, renovado às 20:05 de 28/09, **devolvido às 20:18 de 28/09**, logo depois de `2100eaa` subir.
- **oficial**: scripts 1-2-3-5-6; **`App.jsx` 24 257 →
  24 315 linhas**, todas as mudanças de contagem depois da 22 489 — nenhum
  endereço do `check-acoes-do-jogador` se moveu.
- **a prova jogada** (antes `1bb8f4d`, depois a árvore, 375 e 1280, `/api`
  cortado, a cerimónia num harness com as peças reais, **custo 0**): **sobe com
  conserto.**
  - **o que passou:** topo do campo imóvel (735/706) em todas as telas; o pé
    custa exatamente o que a caixa custava (94 · 150 · 62, e 124 → 122 com
    duas); **zero `O MESTRE`** (eram 5 numa noite de 4 respostas); a espera à
    vista, onde a resposta vai nascer (antes a **1 454 px** de quem está no
    fim); o lugar e as tochas uma vez cada na masmorra (eram duas); linhas de
    prosa rolado ao topo **+1 a +2** em todas as telas; ao lado do `126:5`, cada
    diferença está entre D1 e D17.
  - **o que falhou, e é o achado do ciclo:** **a cerimónia nasce fora de vista
    em 5 de 5 respostas reais** (1 137–1 880 caracteres; fica 230–1 217 px acima
    da vista) e ainda empurra o fim da resposta 53–64 px para baixo. O defeito
    de fundo é **anterior a V5**: no telefone o jogador cai no fim de uma
    resposta de ~980 px e **lê primeiro as últimas 12 linhas**. A cerimónia só o
    tornou visível. **Conserto: a cerimónia fica construída e apagada** até V5e
    ("a resposta chega pelo começo"), que a religa.
  - **os consertos, feitos pelo `oficial` a 28/09 e verificados vivos:** a
    cerimónia apaga-se por tabela (`ABERTURA.acesa: false` — religar em V5e é
    trocar um valor, e a suíte prende a chave desligada); a tira de ~8 px da
    gaveta a 1280 some porque o foco passa a sair da **altura medida** do
    cabeçalho preso + 16 (`FOCO_NA_GAVETA`) — o cabeçalho mede **68 px** de
    verdade, não os 76 da soma escrita nem os ~84 do palpite; o cartão do
    companheiro para exatamente 16 px abaixo dele. **24 315 linhas**, 216/216 ·
    15/15, `teste-v5-pagina` 58/58. *Os consertos são os que a prova do `jogo`
    receitou; o depois que ele jogou é este, menos uma cerimónia que ninguém via
    e mais uma tira que deixou de se ver.*
  - **uma tela perdeu uma linha** com a vista como abre (noite a 375, 8 → 7) —
    os espaçamentos da v3 no fim do registo; não bloqueia, fica escrito.
- **decisões médias:** apagar a cerimónia em vez de a subir invisível (uma peça
  que ninguém vê e que custa o fim da resposta não é superior); V5e antes de V6
  (é ela que dá sentido à abertura, e o defeito de ler primeiro o fim é o mais
  caro da página); as sub-abas da gaveta que rolam para fora ficam para V7.
- **o que ficou:** V5e (a seguinte), V5d, V5c; a grelha do cartão a 1280 difere
  da v3 (32–1 176 contra 24–1 166; topo em 64 contra 90) por causa da cinta de
  48 e do trilho — nota para o `144:2`, e é de V4/V7.
- **as ambiciosas:** **V5e — a resposta chega pelo começo** (`desenho`; o
  `jogo` recomendou-a para antes de V6) e **V5d — a página vira à chegada**
  (`jogo`: capítulos com o nome dos lugares). Nenhuma vai à pessoa.

---

## 25/09 20:50 · v9.299 · **V4 — a cinta com os anéis: o grupo aparece na tela principal** · commit `89d1150`

- **estado inicial:** trava tomada às 19:00; HEAD `fd6bdb1`; nenhum ciclo do
  sistema, bastão livre. **O estudo do `jogo` já estava no disco** (o ciclo de
  V4 caiu às 03:32 com ele feito) — não o refiz: o `desenho` fabricou a partir
  dele, e a prova foi feita por outra instância do `jogo`, que o leu inteiro.
  Os três achados do estudo foram tratados como o coração da etapa, por ordem
  do coordenador.
- **desenho** (`formas.md` §V4, `mente/v4-desenho.md`, scripts provados em duas
  cópias de `fd6bdb1`, **LF e CRLF** — o `_arquivo.cjs` aguenta os dois, e o
  `oficial` não precisou de normalizar nada desta vez): `O anel` com quatro
  estados (calma, grave, ferida agora, **tombado** — a peça que o `Retrato` não
  tinha), o disco `+N` que herda o pior, `Os contadores`, `A pílula do tempo`;
  o clarão do anel em classe própria (`tv-anel-clarao`) para ter saída com
  `reduce` sem tocar no `tv-dano` do combate. Figma: página `V4` da biblioteca
  (`243:73`, `O anel` com 12 variantes) e, no arquivo da pessoa, o `142:2` com o
  `126:6` clonado ao lado da cinta do código. Pagou de passagem uma dívida sua
  de V5a (`teste-v5a-cabecalho` falhava numa árvore em CRLF).
- **o bastão do `App.jsx`:** tomado pelo `regente` às 20:17 para o `oficial`, **devolvido às 20:46**, logo depois de `89d1150` subir.
- **oficial**: scripts 1→6 sem âncora falhada;
  **24 257 linhas** antes e depois; 18 linhas de pt-PT trocadas para pt-BR nos
  comentários novos. **Um vermelho de passagem:** a 1.ª corrida deu 214/215 com
  `teste-sala.mjs`, que sozinho passa 125/125, e a 2.ª corrida inteira deu
  215/215 sem nada mudar — intermitente, fora do território; fica dito.
- **a prova jogada** (antes: o estudo em `4ce9d4c`; depois: a árvore; 1280, 375,
  320 e `reduce`; `/api` cortado, **custo 0**): **sobe.**
  - **companheiros na tela: 0 → todos** (até 4); a 320 com dois prazos, o disco
    `+2`/`+4` com o aro do pior e o traço de quem caiu;
  - **ler o PV de quem está pior: 2 toques e ~600 px de rolagem → 0 toques** na
    mesa; no telefone o estado vê-se, e 1 toque abre o cartão dele;
  - **a barra de PV que encolhia a 3 px (e a 0) no telefone com prazo deixou de
    existir**: o anel do herói tem 40 px nas 24 telas;
  - **o pulso de agonia era infinito e ignorava `reduce`**: agora 3 pulsos só
    quando algo acontece (entrar em grave, ferida nova, tombar), e 0 com
    `reduce` — provado num harness com as peças reais, que é o mesmo código de
    um turno;
  - a prosa **0 px** mais baixa (topo do campo 735/706/623, igual); cinco
    segundos à primeira nas três larguras, e *"quem do grupo está mal?"* —
    antes sem resposta — responde-se.
  - **Limite da prova, dito:** o `jogo` não viu vivos `esta noite`/`hoje` e o
    `+1` vermelho (os prazos injetados não geraram prazo novo); o `oficial`
    viu-os, e o pulso da última noite está provado no harness.
- **decisões médias:** a cinta fica em 48 px e não nos 66 da v3 (−18 px de
  prosa em todos os turnos); o anel é âmbar e não ciano (em cinzento
  âmbar×perigo 1,52, ciano×perigo 1,25); a coroa marca o SEU herói; o alvo do
  grupo no telefone chega a 48 por área invisível (ocupar 48 partia o pior caso
  em 12 px); a pílula não é centrada (centrada bateria no grupo de quatro).
- **o que ficou — V4d:** a 1280, tocar num companheiro faz o título da gaveta
  sair de vista (lê pior, não bloqueia; o conserto é o cabeçalho `sticky`); o
  traço de tombado risca o número do disco `+4` a 320; o nome em Spectral e não
  na Inter da v3 (é V2).
- **as ambiciosas:** **V4b — o anel é onde se cuida** (`jogo`; o pedido
  `darConsumivel`/cura por semente foi ao sistema) e **V4c — o segundo arco, o
  PM** (`desenho`). Nenhuma vai à pessoa.

---


## Os ciclos anteriores

Os 19 ciclos mais antigos estão em `mente/arquivo/diario-desenho-antigo.md`,
inteiros. Saíram daqui porque a mente lê este arquivo ao começar todo
ciclo, e o que ela precisa é do que aconteceu ontem — o resto é consulta.
