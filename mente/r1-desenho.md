# R1 · o desenho — a tela principal, medida e redesenhada

**23/09/2026 · v9.281 · o `desenho`**

A pessoa mandou focar no visual e na experiência, começando pela tela onde se
passa 90 % do jogo — a da narrativa (`fase === "jogo" && !emBatalha`), não a de
batalha. Autorizou trocar paleta, tipografia, nomes e posições. Disse a palavra
que é o alvo: **"estimulantes e chamativos como um bom jogo"**.

O par antes/depois, renderizado e navegável, está publicado em
**<https://claude.ai/artifact/A5aShQ3P28ACTdbJmQAPL8>** — as duas telas lado a
lado, a mesma cena, a mesma fase, o mesmo conteúdo.

---

## 0 · A conclusão, antes dos números

**O contraste não é o problema.** 31 de 32 pares reais de texto da tela
principal passam AA, e a maioria passa AAA. A paleta é legível e mesmo assim não
parece um jogo — e é essa contradição que este documento resolve.

**O problema é que a tela não tem figura e fundo.** As quatro superfícies de `T`
cabem dentro de **1,379:1** umas das outras (a WCAG 1.4.11 pede 3:1 para
não-texto) e vivem todas entre `h253` e `h256` — **três graus de matiz**. O
painel da narrativa contra o balão do Mestre mede **1,039:1**: são a mesma
superfície. O balão é uma borda arredondada à volta de nada.

**E a tela é um cliente de conversa, não um livro.** A narração é um balão com
orelha, a fala do jogador é outro balão alinhado à direita, num rolo que desce.
É a gramática do Messenger num RPG de texto cuja prosa é a protagonista.

A direção proposta chama-se **A página iluminada**, e é uma frase: *a narração
passa a ser a superfície mais clara e mais quente da tela — um papel sob luz de
vela — e tudo o resto recua para uma mesa fria.*

---

## 1 · O censo, com número

### 1.1 A letra

Região medida: `App.jsx` **20929–21900** + `TrilhoAbas` (1273) + `PainelLateral`
(1882) + `TelaMenu` (4228) + os **13** `painel-*.jsx` (o roteiro dizia dez; são
treze).

| tamanho | ocorrências no código | nós visíveis (mesa, 1024×768) | nós visíveis (telefone, 375×812) |
|---|---|---|---|
| 8 px | 10 | — | — |
| 9 px | 115 | 7 | 18 |
| 10 px | 174 | 6 | 12 |
| 11 px | 64 | 10 | 2 |
| 12 px | 109 | 4 | 4 |
| ≥ 14 px | 103 | 8 | 14 |
| **abaixo de 12 px** | **363 de 575 · 63,1 %** | **23 de 35 · 66 %** | **32 de 50 · 64 %** |

**Na região exata da tela principal, isolada: 68 de 90 · 76 %.** É a pior região
medida do projeto — pior que qualquer painel. A dívida de E3 (652 lugares na casa
inteira) **não está espalhada: está concentrada aqui.**

11 tamanhos distintos em uso. Não há escala — há um histórico.

### 1.2 A linha da prosa (a protagonista)

Medido no DOM vivo, com o jogo a correr, dividindo a largura da caixa pela
largura média de `a–z` na mesma fonte e corpo:

| onde | largura | caracteres/linha | veredito |
|---|---|---|---|
| balão do Mestre, mesa | 668 px · 15 px Spectral | **89** | acima do teto de 80 (WCAG 1.4.8) |
| linha de sistema, mesa | 753 px | **100** | 25 % acima do teto |
| balão do Mestre, telefone | 311 px | **37** | abaixo do piso de 45 |
| fala do jogador, telefone | — | **28** | 38 % abaixo do piso |

**A prosa está mal composta nos dois aparelhos, em direções opostas.** Na mesa
transborda (o balão cresce com o painel); no telefone encolhe (`max-width:85 %`
dentro de um painel que já tem margem). Uma coluna de medida fixa conserta os
dois — é uma linha de CSS.

Prova citada: Baymard mediu que texto com **mais de 80 caracteres por linha foi
saltado 41 % mais vezes** que o de 60–70
(<https://baymard.com/blog/line-length-readability>); Bringhurst dá 45–75 com 66
de referência; WCAG 1.4.8 (AAA) põe o teto em 80.

### 1.3 O alvo de toque

`ALVOS.piso = 48` existe em `src/estilo.js` desde K3, com a conta escrita e
quatro leitores. **A tela principal não o lê uma única vez.**

| controle | medido (telefone) | falta |
|---|---|---|
| **`Agir →`** — o verbo primário do jogo | **69 × 28** | −42 % |
| ouvir o Mestre | 22 × 22 | −54 % |
| selo de heroísmo | 53 × 19 | −60 % |
| início | 32 × 32 | −33 % |
| acampar · rolagens · crônica | 31–34 × 38 | −21 % |
| Ações · Habilidades · Examinar · Tempo | 81 × 40 | −17 % |
| o campo de escrita | 208 × 35 | −27 % |
| o trilho de abas | 85 × 52 | passa |

**21 de 26 abaixo de 48 (81 %); 20 abaixo de 44 (WCAG 2.5.5 AAA).** Na mesa,
12 de 18.

O número do `jogo`, que é o mesmo dito de outro modo: `Agir →` = **1946 px²**
contra os **5184 px²** da aba `Bolsa`. **O botão que faz o turno acontecer é
2,7× menor que o botão que abre a mochila.** A tela de batalha honra o piso; a
tela principal, onde se passa 90 % do jogo, não.

### 1.4 A cor

Matriz WCAG 2.1 completa de `T` (54 pares) e os 32 pares que a tela usa de facto:

- **31 de 32 pares reais passam AA.** O único que reprova é `danger` sobre
  `perigoFundo` a **4,49:1** — a um centésimo do piso.
- **As superfícies entre si reprovam todas**: `bg×panel` 1,065 · `panel×panelSoft`
  1,073 · `panelSoft×line` 1,206 · **`bg×line` 1,379**. A 1.4.11 pede 3:1.
- `lineStrong` — o degrau que K1b provou e fixou — tem **1 leitor** em toda a
  tela principal + trilho + painel lateral + os 13 painéis.
- Uso por token nessas regiões (1283 usos): **`T.inkDim` é 23,1 %**, o token mais
  usado da casa é o cinzento apagado. Famílias: tinta 30,7 %, superfícies 26,4 %,
  âmbar 20,5 %, veredictos 11,8 %, violeta 10,5 %.
- **O âmbar carrega 24 significados diferentes** na tela principal, contados no
  código: a voz do Mestre, o "✓ salvo", o acampar, as rolagens, a crônica, o
  nível, a barra de PV, o verbo "Ações", o verbo "Tempo", a moldura do painel de
  ações, o veredito do golpe, a aba ativa, a moldura do acampamento, os dados de
  vida, o objeto sintonizado, a tocha, a chave, o "procurar nesta sala", a linha
  da raid, o lugar, a rolagem pendente, o botão de voltar ao fim, a próxima luta,
  a cerimônia. **Uma cor que significa 24 coisas não significa nenhuma.**
- **Defeito nunca antes medido, e ele existe hoje:** simulando os três
  daltonismos, em deuteranopia o `ok` e o `amber` ficam a **1,02:1** — a mesma
  cor — e o verde do "tudo bem" contra o vermelho do "você está a morrer" ficam a
  **1,49:1**.

### 1.5 A densidade e o movimento

| | mesa | telefone |
|---|---|---|
| nós visíveis | 142 | 165 |
| nós com texto próprio | 35 | 50 |
| o painel da narrativa | 58,1 % do ecrã | 51,5 % |
| mobília abaixo dele | — | 39,3 % · 319 px |
| caracteres de prosa : de mobília | 3229 : 289 | — |

- **Controles pela biblioteca: 9 `<Botao>` contra 126 `<button>` crus — 6,7 %.**
- **204 usos de emoji do sistema, 81 distintos, contra 33 ícones desenhados em
  `ui.jsx`.** Em Windows saem Segoe UI Emoji a cores; em macOS Apple; em Android
  Noto. **A identidade visual do jogo muda conforme o aparelho.**
- **Movimento:** das 13 classes, esta tela usa `tv-fade` (14), `tv-slide` (2),
  `tv-pulse` (2), `tv-dice` (1), `tv-dano` (1), `tv-agonia` (1). **Sete não
  aparecem.** A chegada da narração — o acontecimento central do jogo — é um
  `fade` de 0,5 s idêntico ao de uma linha de saldo.
- 300 usos de `rounded-*` em 10 valores distintos; 508 de espaçamento em **47**
  valores distintos. Não há escala de espaço.

### 1.6 O método, para refazer tudo

Os scripts estão no scratchpad desta sessão e são autocontidos:

```
node censo.cjs        # letra, cor literal, controles, movimento (estático)
node contraste.cjs    # a matriz WCAG da paleta de hoje + as superfícies
node paleta-v5.cjs    # a proposta: catraca, daltonismo, BG3, Material
node tokens.cjs       # uso de cada token de T, por região e por família
```

O vivo (densidade, linha, alvo): `npm run dev` → entrar numa campanha → medir com
`getBoundingClientRect()` e `getComputedStyle()` a 1024×768 e a 375×812.
Caracteres por linha = largura ÷ (largura de `a–z` ÷ 26) na mesma fonte e corpo.

---

## 2 · A paleta proposta, token a token

Duas famílias de superfície com trabalhos opostos, três acentos com tarefas
distintas. 24 tons, **7** famílias de matiz (hoje: 17 tons, 2 famílias de facto).

```js
export const T = {
  /* A MESA — fria (h≈250). Recua: cabeçalho, trilho, HUD, bastidor. */
  bg:          "#131120",   /* L=0,64 */
  chao:        "#1B182C",   /* L=1,07 */
  chaoAlto:    "#252038",   /* L=1,71 */
  borda:       "#3D3559",   /* L=4,26 */
  bordaViva:   "#7A719A",   /* L=18,28 — a borda de CONTROLE */

  /* A PÁGINA — quente (h≈30). É o que está aceso: só onde a prosa mora. */
  pagina:      "#3A2F23",   /* L=3,05 */
  paginaAlta:  "#48392B",   /* L=4,48 */
  paginaFio:   "#7A6349",   /* L=13,54 — o contorno, e ele carrega os 3:1 */

  /* A TINTA */
  ink:         "#F2ECE0",   /* a prosa */
  inkMeio:     "#C3B7A3",   /* a segunda voz DA PÁGINA — quente */
  inkDim:      "#A29AB4",   /* o rótulo DA MÁQUINA — frio, porque é da mesa */

  /* OS DOIS ACENTOS, cada um com um trabalho */
  amber:       "#E8A33D", amberSoft: "#F5C878", onAccent: "#1A1408",
  violet:      "#9B8DE4", violetSoft: "#B0A5EC", onSecond: "#14101F",

  danger:      "#EE7C6A", ok: "#8FE0A2",
  okFundo:     "#17301C", perigoFundo: "#331A16",
};
```

### O que cada acento faz, e por que são DOIS (e não três)

- **`amber` = a luz.** O Mestre, a vela, a ação primária.
- **`violet` = o arcano.** Mana, perícia, o que é o seu poder.

**Eu tinha proposto um terceiro — `mundo`, um verde-mar, para o relógio, a data,
a estação e o lugar — e RETIREI-O depois de o `jogo` reparar e de eu o medir.**
O reparo dele era semântico (um verde-água promete *seguro* e *cura*, e
`Tom=Convite` não pode prometer segurança); o número é pior: `#79D6C6` está a
**36° de matiz e 1,09:1 de luz** do `ok` — **são a mesma cor para o olho**, e
ficam a 1,07–1,10 sob os três daltonismos. Não há substituto: o azul-gelo afasta-se
do `ok` mas fica a **1,00:1 do âmbar em deuteranopia**. **Cinco acentos saturados
não cabem na faixa de luz desta paleta.**

**O que ficou no lugar é melhor do que a cor:**

1. **O mundo ambiente vai para os neutros** (`inkDim` sobre `chao`) — pela lei
   que eu próprio acabara de escrever: *cor viva só em coisa com que se interage
   ou que se tem de notar*. Um relógio não é nenhuma das duas. **A lei nova
   apanhou o token novo, e o token novo é que caiu.**
2. **O âmbar perde os significados do chassis** (o "✓ salvo", os botões de
   cabeçalho, o "Tempo", as molduras) pela mesma lei, e fica com **conteúdo e
   ação primária** — que é a arquitetura que a BG3 publica.

A paleta desce de 24 para **21 tons** e de 7 para **5 famílias de matiz**.

### A catraca — 32 pares, 0 reprovam

| o que é | hoje | proposta | piso |
|---|---|---|---|
| as superfícies, extremo a extremo | **1,379:1** | **4,13:1** | 3,0 (1.4.11) |
| a narração contra o fundo dela | **1,039:1** | 1,43:1 **+ 143° de matiz** | — |
| o contorno da narração contra a mesa | não existe | **3,29:1** | 3,0 (1.4.11) |
| a prosa sobre o seu fundo | 14,37:1 | **11,08:1** (−23 %, de propósito) | 4,5 AA / 7 AAA |
| o fundo contra a régua do Material (`#121212`, L 0,60) | L 0,41 — **abaixo** | L 0,64 — acima | Material Design 2 |
| pares reais que reprovam | 1 de 32 | **0 de 32** | 0 |
| famílias de matiz de facto | 2 | **7** | — |

Par mais apertado da proposta: `bordaViva × chaoAlto` a 3,47:1 — 16 % de folga
sobre o piso.

**Correção depois do reparo do `jogo`:** os tokens `mundo`/`mundoSoft`/`onMundo`
foram **retirados**. A tabela tem **21 tons** e **5 famílias de matiz** (hoje: 17
tons, 2 famílias de facto). O motivo está em "O que cada acento faz", logo abaixo.

---

## 3 · A prova, pelos três caminhos

### 3.1 Medida
Tudo na secção 1 e 2. Nenhum número sai de memória.

### 3.2 Estudo citado

1. **A rampa quente não é invenção minha.** A Baldur's Gate 3 publica a paleta
   do seu framework de interface
   (<https://docs.baldursgate3.game/index.php?title=UI>):
   `#584537 · #7d604a · #af8768 · #cbac95 · #E6DBC2` — **cinco degraus de um
   castanho quente e zero cor de acento no chassis.** Eu tinha chegado à mesma
   arquitetura pela aritmética das superfícies. A minha rampa é a mesma família
   de matiz (h 25–40) e croma equivalente, com os degraus 1–3 mais escuros
   porque a BG3 tem textura de pergaminho por baixo e nós não temos arte; os
   degraus 4–5 batem quase exatamente (`#cbac95` L 44,4 contra `#C3B7A3` L 48,1;
   `#E6DBC2` L 71,4 contra `#F2ECE0` L 84,2).

2. **O Material corrigiu-me um valor, e a correção fica escrita.** O Material
   Design 2 (<https://m2.material.io/design/color/dark-theme.html>) recomenda
   `#121212` e diz porquê: preto puro maximiza o contraste com os componentes e
   aumenta a fadiga. **Eu tinha proposto descer o fundo para `#08070E`** — o que
   era piorar exatamente o defeito que a fonte acusa. O `bg` de hoje (L 0,41) já
   está abaixo da régua (L 0,60); na proposta **sobe** para L 0,64, e a escada
   vem da página subir, não da mesa descer. O mesmo documento fixa o texto
   primário em 87 % de opacidade sobre escuro, nunca branco cheio.

3. **A halação, e por que o contraste da prosa desce.** O NN/g documenta que
   leitores com astigmatismo relatam halo à volta de texto claro sobre fundo
   escuro (<https://www.nngroup.com/articles/dark-mode/>), e há o efeito de
   irradiação: texto claro sobre escuro **parece mais gordo**, um peso 400 lê
   como 500 (<https://css-tricks.com/dark-mode-and-variable-fonts/>). A WCAG põe
   piso e não põe teto; a literatura põe. Daí duas decisões: a prosa desce de
   14,37:1 para **11,08:1**, e **Spectral desce um peso na prosa — 300, não 400.**

4. **A medida da linha** — Baymard, Bringhurst, WCAG 1.4.8, na secção 1.2.

5. **A tipografia está certa, e a conclusão é não mexer.** **Hades usa Spectral
   como face principal** (<https://www.gamefontlibrary.com/games/hades>), sobre
   fundo escuro, e ganhou o BAFTA de Artistic Achievement. Disco Elysium usa duas
   serifadas editoriais (Dobra, Sina Nova); BG3 usa Quadraat Pro com
   Alegreya/Alegreya Sans; Sunless Skies usa Vollkorn. **Os cinco RPG de texto de
   referência usam serifada editorial para a prosa e sans/versalete para o
   estado** — a pilha do Taverna. O que muda é a hierarquia: em Hades o registo
   tipográfico **muda com o registo de jogo**, e a display fica reservada ao
   momento de pausa. **Cormorant Garamond deve aparecer só onde há decisão e
   cerimônia, nunca na prosa corrente.**

6. **A lei que a Failbetter escreveu e que copio.** No redesenho de Sunless
   Skies a paleta foi restringida e **as cores mais vivas reservadas à interação
   e aos pontos importantes**; o painel de leitura foi **alargado e centrado**,
   porque o descentrado prejudicava a leitura — descoberta que lhes custou uma
   versão inteira
   (<https://www.gamedeveloper.com/design/reading-by-gaslight-a-look-inside-sunless-skies-ui-redesign>).
   E o princípio de arte do estúdio: *"o Unterzee é escuro por defeito… a luz que
   há, trazes tu"*. **Lei nova, e é varrível:** `amber`, `violet` e `mundo` só em
   coisa com que se interage ou que se tem de notar.

### 3.3 Experiência jogada
**Por cumprir, e é do `jogo`.** Ele jogou o *antes* hoje e trouxe o diagnóstico
(secção 5); o *depois* não existe para ser jogado. **Esta proposta tem duas das
três provas, não três**, e isso fica dito.

---

## 4 · A lista do que mudar, por ordem, com peso

| # | o quê | peso | a prova |
|---|---|---|---|
| 1 | **Piso da letra: nada abaixo de 12 px.** Tabela `TIPOS` com sete degraus + varredor que recusa o oitavo. | médio | 363 de 575 · 76 % na tela principal |
| 2 | **`ALVOS.piso` aplicado à tela principal.** O número existe e está provado; falta um leitor. | leve | 21 de 26 abaixo · WCAG 2.5.5 |
| 3 | **A coluna da prosa: `max-width: 65ch`.** | leve | 89→65 e 28→65 · WCAG 1.4.8 + Baymard |
| 4 | **A paleta nova, em tabela.** Um `estilo.js` trocado, um commit desfeito. | médio | 32 pares, 0 reprovam |
| 5 | **A narração deixa de ser balão e passa a ser página.** | médio | o balão mede 1,039:1 — não separa nada |
| 6 | **Os 81 emoji saem; entram glifos desenhados.** ~21 faltam só para esta tela. | médio | 204 usos · a identidade muda por SO |
| 7 | **A lei "cor viva só em coisa com que se interage"**, com varredor. Tira do âmbar o chassis e o mundo ambiente. | médio | 24 significados numa cor só |
| 8 | **A chegada da narração ganha movimento próprio**, com saída e `prefers-reduced-motion`. | médio | 7 de 13 classes não aparecem aqui |
| 9 | **Os controles passam pela biblioteca** — o piso aplica-se sozinho. | médio | 6,7 % hoje |
| 10 | **`A oferta` + `A soleira`** (secção 5). | médio | a aceitação está a 3 toques e 14,3 s |
| 11 | **Os 19 verbos genéricos aposentam-se; `Atacar` muda de casa.** | médio | 20 botões, zero nomeiam a cena |
| 12 | **`A linha` sobe ao campo do turno.** | **pesado** | campo de 35 px; `Agir` 2,7× menor que `Bolsa` |
| 13 | **Renomear verbos e abas** (Habilidades→Perícias, Examinar→Olhar, Tempo→Esperar; Gestão→Herói, Diário→Crônica). | **pesado** | o jogador reaprende o nome |
| 14 | **A cena ganha um rosto** (secção 6). | **pesado** | muda o que o jogador vive |

Os itens 1 a 11 são do ciclo: todos têm número, todos saem de tabela, todos se
desfazem num commit. Os 12–14 vão à pessoa pela única régua que importa — **o
jogador teria de reaprender?** Nos três, sim.

---

## 5 · As peças que eu fabrico (a resposta ao `jogo`)

Ele compõe, eu fabrico; cada peça nasce para a biblioteca inteira.

### 5.1 `A oferta` — aceito, e aceito o eixo dele

O eixo que ele chamou *Tom* mapeia-se exatamente sobre os três acentos que eu
tinha proposto por aritmética. Isso é a confirmação de que o terceiro acento não
era apetite por cor.

| eixo | valores | o que decide |
|---|---|---|
| `Tom` | Convite · Preço · Sem volta | a rampa que o `Botao` já tem: sem preenchimento + borda `bordaViva` · borda `amber` · borda `danger` |
| `Estado` | Repouso · Foco · Impedida · Tomada | a gramática de `Botao`, herdada — não se inventa a segunda |
| `Chegada` | Assentada · Agora | a marca de "novo neste turno" — **propriedade da peça** |

- Altura mínima **`ALVOS.piso` (48)**. Não é número novo.
- **Três campos obrigatórios, todos na tela, nenhum em `title`:** o **verbo**, o
  **preço**, o **retorno**. O `jogo` mediu que **zero** dos 20 controles de ação
  de hoje diz o preço na tela e que oito o escondem em `title` — balão de rato,
  que no telefone não existe. *"O veredito antes do clique" é lei da casa e está
  a ser cumprida por um canal que metade dos aparelhos não tem.*
- **Composta, não redesenhada:** monta instância de `Botao` para o verbo e de
  `Consequencia` *Largura=Longa* para o preço.
- **Tipo:** verbo em Spectral 15 (é fala, não máquina); preço e retorno em
  JetBrains Mono 13; quem/onde em `inkMeio` 13. Nada abaixo de 12.

### 5.2 `A soleira` — o nome é meu, e recuso o dele por lei

Ele chamou-lhe *A faixa*. **Recuso:** já existe `FaixaRelogios` na mesma tela e
`tv-faixa` na folha. Duas coisas com o mesmo nome no mesmo ecrã é "uma ação, uma
forma" violada um andar acima. Chama-se **`A soleira`** — a pedra da porta, onde
está o que o mundo abriu e você ainda não atravessou.

- **Região fixa** entre a página e o campo do turno, fora do rolamento. A razão é
  dele e é jogada: a oferta do Yorick valeu **quatro turnos**, e colada à
  mensagem teria ficado três ecrãs acima.
- **Vazia não deixa buraco:** altura 0, sem margem, sem borda.
- **Teto de três** na mesa, **uma** no telefone, com "mais N" a abrir o resto.
  A conta: 3 × 48 + 2 × 8 = 160 px, que cabem nos 319 de mobília medidos hoje
  **sem tocar na página**, porque saem dos 20 verbos que se aposentam.
- **No telefone desfaz-se, não vira gaveta** — a lição de E4: *uma tira duplicada
  não se esconde, esvazia-se.*

### 5.3 A marca de "novo neste turno" — **discordância, com motivo**

Ele perguntou se `Selo` *Mudou=Agora* e `O realce` servem. **Nenhum dos dois:**

- `O realce` é o **degrau 2 da cerimônia**, e está escrito assim em `formas.md`.
  Usá-lo aqui transformaria cada contrato num acontecimento — e a régua da
  aparição diz o contrário: *uma peça que aparece sempre deixa de ser
  acontecimento.*
- `Selo` é um **estado** de uma coisa. Uma oferta não é um estado: é uma porta.
  "Esta oferta está nova" é uma frase sem sentido.
- **Em vez disso:** o eixo `Chegada` **dentro** de `A oferta`. Uma marca que se
  pode aplicar a qualquer coisa acaba aplicada a tudo; presa à peça, só pode
  significar o que a peça significa. **Decai no turno seguinte, não por relógio**
  — o jogo tem turnos, e uma marca que morre por tempo morre enquanto o jogador
  está a pensar.

### 5.4 `A linha` sobe ao campo do turno — **de acordo**

A peça existe (72 px, Spectral 15, quatro estados, a chamada dentro). O campo
mede **35 px** — 27 % abaixo do piso. Concordo que é `pesado`, concordo que vai
à pessoa, e concordo que vai **nesta** etapa em vez de apodrecer.

### 5.5 Aposentar os 20 verbos — **de acordo, com uma emenda**

Concordo com a linha dele: *a soleira só oferece o que o sistema sabe e o jogador
não consegue adivinhar; os verbos que são invenção do jogador ficam no campo,
porque são dele.* Os 19 genéricos saem.

**A minha emenda estava errada, e o `jogo` foi verificar.** Eu disse que `Atacar`
tem veredicto vivo, *Impedido* e linha de consequência, e que por isso não se
aposenta. **Tudo verdade — de outro botão.** Há dois `Atacar`:

- `App.jsx:11753`, o do combate: `vereditoDoGolpeAgora` abre com
  `if (!comb) return null`. **Fora de combate não há veredicto.** Essa peça vive
  no tabuleiro, está paga em W1/W2, e ninguém lhe estava a tocar.
- `App.jsx:1108`, o desta tela:
  `{ rotulo: "Atacar", texto: "Ataco " }`. **Escreve sete caracteres na caixa e
  devolve o cursor.** É um atalho de teclado.

**Eu li um comentário sobre um botão e atribuí-o a outro com o mesmo rótulo.**
O `Atacar` da tela principal **morre com os outros 19**, pela regra e sem exceção.
Fica escrito: *uma emenda corrigida com o motivo vale mais que uma emenda que
nunca errou.*

### 5.6 Duas coisas que ele achou e são minhas para consertar

- **O `▸` desenha uma afordância que não existe.** O Mestre escreve
  `▸ Mural — há um mural…` e no DOM é um `<span>` com `cursor:auto`. A seta é o
  glifo universal de "vá aqui". **Lei nova para `formas.md`: o `▸` fica reservado
  ao que se toca.** Ou o glifo sai, ou a coisa passa a tocar-se — e a resposta
  certa é a segunda, e chama-se `A oferta`.
- **O botão `↓` sobrepõe-se ao `Agir →`** (46×46 por cima de 69×28, confirmado
  por interseção de retângulos). O flutuante é **maior** que o verbo do turno e
  está **por cima** dele. Defeito, `leve`, meu.

### 5.7 A peça que nenhum dos dois pediu, e a tela precisa

**`A voz`** — o cabeçalho de quem fala dentro da página. Hoje o "Mestre" é um
`<div>` de 10 px mono com ícone e um botão de 22×22 colado, escrito à mão em dois
sítios do mesmo ficheiro. Com a narração a virar página, é ele que separa uma voz
da seguinte — e é onde o botão de ouvir ganha os seus 48 px em vez dos 22 de hoje.
Eixos: `Quem` (Mestre · Você · O mundo) × `Voz` (Muda · A ler · A preparar) ×
**`Resposta` (Veio · Espera-se)**, este último só em `Quem=Você`.

**Os três valores de `Quem` estão contados, não achados** — o `jogo` contou os
autores de mensagem no `App.jsx`: `sistema` 503, `jogador` 43, `mestre` 1, e o
ficheiro não tem um quarto. Confirmei por máquina.

### 5.8 `Resposta` — o requisito que o `jogo` me pôs, e a forma dele

Ele mediu que, durante os **14,3 s** de espera, com `bloqueado` a apagar a tela,
a frase que o jogador acabou de escrever é **o único sinal de que o turno foi
enviado**. Com a narração a virar página, isso não pode perder-se.
*Uma espera muda de catorze segundos é o jogador a perguntar se clicou.*

- **A distinção, que vale sempre:** a fala do jogador fica na página — um livro
  também regista o que você disse — mas em **itálico, recuada, em `inkMeio` e com
  filete próprio**. Nunca tem a cor nem o peso da prosa do Mestre.
- **`Resposta=Espera-se`:** o filete passa de `bordaViva` a **`amber`** — a cor
  do Mestre, porque é ele que ainda não respondeu — e **respira**: pulso lento de
  1,6 s **no filete, nunca no texto**. A prosa não se move um pixel, e por isso
  não pode custar a leitura nem o turno.
- **A saída é o acontecimento, não o relógio.** Chegando a resposta, o filete
  assenta em `bordaViva` e o pulso para. Nada expira sozinho.
- **`prefers-reduced-motion`:** sem pulso; filete `amber` fixo e a legenda.
- **A página ancora-se na fala pendente** durante a espera.

---

## 6 · A proposta ambiciosa (para a pessoa decidir)

### A cena tem um rosto, e o jogo nunca lho deu

Este é um RPG de texto em que **nada na tela mostra onde você está**. O bioma
existe no motor — há `VinhetaDaCena`, há `biomaDaqui()` — e o que produz é uma
mudança de tom que a medição não distingue do fundo. O jogo descreve uma taverna,
uma estrada, uma cripta, e o ecrã é sempre o mesmo retângulo roxo-escuro.

**A proposta:** a página ganha um **cabeçalho de cena** — uma faixa de 96 px no
topo do papel, com uma xilogravura gerada **pela mesma semente do mundo** (o motor
de retrato já existe e já é determinístico), o nome do lugar, e a hora do dia a
mudar a luz da faixa. Não é ilustração comprada: é o gerador que a casa já tem,
apontado para o lugar em vez de para a cara. **Determinismo por semente continua
a valer** — a mesma semente dá a mesma cripta, em qualquer máquina.

**Por que é da pessoa:** acrescenta ao ecrã uma coisa de que o jogador passa a
depender para saber onde está, e muda o que o produto é — de "um log com uma
barra de vida" para "um livro ilustrado que responde".

**O custo, dito antes de ser perguntado:** 96 px saem dos 418 da página no
telefone, que passa a 322 — de 51,5 % para 39,6 % do ecrã. Com a coluna de 65ch
e 17 px, ainda dá **11 linhas de prosa contra as 13 de hoje**. **Duas linhas é o
preço**, e está escrito para poder ser recusado.

---

## 7 · Os buracos, declarados com número

1. **O Figma não foi alcançado nesta sessão.** As ferramentas do arquivo
   `e5wJUzInAssoebx5npssKc` não estão carregadas aqui (procurei: só existe
   `DesignSync`, que é outra coisa). **O `jogo` declarou o mesmo, em separado.**
   A lei da casa diz que nenhuma decisão de design sai sem passar por lá —
   portanto **isto é proposta, não decisão**, e o par é *renderizado*, não
   desenhado no Figma. A condição de fecho: as 24 variáveis entram como variáveis
   com `codeSyntax` WEB, e os dois quadros do par entram como quadros.
2. **A página separa-se da mesa por 1,43:1 de luz, e eu tinha-me posto a meta em
   1,5.** Falhei por 5 % e escrevo em vez de mover a meta. A separação real vem de
   três canais — 1,43:1 de luz, 143° de matiz, e um contorno a 3,29:1 que é o que
   a 1.4.11 de facto cobra — mas **só um deles é luminância**, e quem não vê cor
   fica só com esse. É o número mais frágil desta paleta.
3. **Os acentos continuam a colapsar sob daltonismo.** `ok × danger` = 1,50:1 em
   deuteranopia; a proposta melhora isso em 1 %. **Não resolve.** Foi o que matou
   o terceiro acento: qualquer quinto tom saturado colide com um dos quatro
   (verde-mar a 1,09:1 do `ok`; azul-gelo a 1,00:1 do `amber`). A cobertura é a
   lei — *nenhum acento carrega sentido sozinho* — e uma lei não é uma medida.
7. **Errei uma emenda e o `jogo` apanhou-a.** Defendi o `Atacar` errado: li um
   comentário sobre o botão do combate e atribuí-o ao botão da tela principal, que
   só escreve `"Ataco "` numa caixa. Corrigido em `formas.md`. **O buraco real que
   isto expõe: eu não corri o código antes de emendar — li-o.**
4. **Os ~21 glifos que faltam não existem.** Contaram-se 81 emoji distintos
   contra 33 ícones; nenhum dos que faltam está fabricado.
5. **Não houve partida jogada no depois.** Duas das três provas, não três.
6. **`FaixaRelogios` não foi redesenhada.** Ela está na tela principal, é do
   `mundo` por natureza, e ficou fora deste censo por falta de tempo. Dívida com
   nome.

---

*Todo número deste documento sai de um script no scratchpad ou de uma medição no
navegador com o jogo a correr. Nenhum sai de memória.*
