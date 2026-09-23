/* ============================================================
   ESTILO — a folha da casa (v9.244)

   O CSS do jogo morava dentro de `constantes.js`: 156 linhas de fonte,
   animação e superfície embaixo do arquivo que guarda XP por nível,
   pontos de atributo e teto de companheiro. Duas mesas diferentes no
   mesmo balcão — quem vinha ajustar uma regra de jogo tropeçava na
   cortiça, e quem vinha ajustar a cortiça tropeçava na regra.

   E havia um motivo mecânico além do arrumado: a catraca de cor que vem
   na D5 varre `src/` atrás de cor literal solta. Enquanto a folha mora
   junto das constantes, a varredura não consegue olhar a folha sem
   olhar a si mesma — a tabela de cor e o texto varrido são o mesmo
   arquivo. Casa própria resolve as duas coisas de uma vez.

   ESTE ARQUIVO NÃO IMPORTA NADA, de propósito. `constantes.js` importa
   `regras.js`; se o estilo continuasse pendurado nele, a mesa de design
   arrastaria a mesa de regra para dentro de qualquer coisa que só
   quisesse uma cor. A folha é folha: entra em tudo e não depende de
   nada.

   A folha continua sendo UM `<style>` em JSX dentro do `#root` — e isso
   é regra, não acaso. O Tailwind entra por CDN no `<head>` (veja o
   `index.html`); é só por vir DEPOIS dele que a nossa folha ganha os
   empates de especificidade (há um empate real: `.tv-margem-abas`
   contra `mx-4`). Nada de `.css` importado pelo Vite, nada de injetar no
   `<head>` por `useEffect`.
   ============================================================ */

/* A PALETA SEMÂNTICA: o que a cor SIGNIFICA (o fundo, a linha, o
   acento, o perigo). É o que o resto do projeto importa — quinze
   arquivos pedem `T`, e nenhum deles precisa saber de que tom de roxo
   `panel` é feito hoje.

   ============================================================
   R2 · "A PÁGINA ILUMINADA" (23/09/2026) — o `jogo` e o `desenho`
   mediram a tela principal e acharam a mesma doença por dois caminhos.

   O DIAGNÓSTICO, e não é o que se esperava: 31 de 32 pares de texto reais
   desta paleta JÁ passavam AA antes desta troca — contraste nunca foi o
   problema. O problema é que a tela não tinha FIGURA E FUNDO: as quatro
   superfícies (`bg`/`panel`/`panelSoft`/`line`) cabiam dentro de 1,379:1
   umas das outras (a 1.4.11 pede 3:1 para não-texto) e viviam todas entre
   h253 e h256 — três graus de matiz. O painel da narração contra o balão
   do Mestre media 1,039:1: eram a MESMA superfície, e o balão era uma
   borda arredondada à volta de nada.

   A DIREÇÃO: duas famílias de superfície com trabalhos opostos. A MESA
   (`bg`/`panel`/`panelSoft`/`line`/`lineStrong`) continua fria (h≈250) e
   RECUA — cabeçalho, trilho, HUD, bastidor. A PÁGINA é nova
   (`pagina`/`paginaAlta`/`paginaFio`), fica quente (h≈30), e é o que
   fica ACESO: só onde a prosa mora. 143° de matiz separam as duas
   famílias — mais do que qualquer par de `T` separava antes.

   A CATRACA, 32 pares medidos, 0 reprovam (antes: 1 de 32 — `danger`
   sobre `perigoFundo` a 4,49:1, um centésimo abaixo do piso; os dois
   novos valores resolvem-no de caminho):
   · as superfícies, extremo a extremo — 1,379:1 → 4,13:1 (piso 3,0)
   · a narração contra o fundo dela — 1,039:1 → 1,43:1 + 143° de matiz
   · o contorno da página contra a mesa (`paginaFio`) — não existia →
     3,29:1 (piso 3,0 — é ELE que carrega o 1.4.11 da página)
   · a prosa sobre a página — 14,37:1 → 11,08:1 (−23%, DE PROPÓSITO: a
     WCAG só põe PISO, nunca teto, e texto claro sobre escuro IRRADIA —
     um peso 400 lê como 500 quando claro sobre escuro, css-tricks.com/
     dark-mode-and-variable-fonts — por isso a prosa também desce de
     Spectral 400 para 300, em `FOLHA`)
   · `bg` contra a régua do Material Design 2 (`#121212`, L 0,60) — L 0,41,
     ABAIXO da régua → L 0,64, ACIMA. A escada vem da PÁGINA SUBIR, não
     da mesa descer: o Material recomenda `#121212` e nunca preto puro
     porque preto puro maximiza o contraste com os componentes e aumenta
     a fadiga (m2.material.io/design/color/dark-theme.html) — o `bg`
     desta casa já estava mais escuro que isso, e a troca não o escurece
     mais, sobe-o.

   `lineStrong` continua o degrau que falta entre `line` e `ink` para uma
   borda de CONTROLE (1.4.11, piso 3:1 para não-texto). Com os valores
   novos o par mais apertado da paleta inteira é `lineStrong` ×
   `panelSoft`, a 3,47:1 — 16% de folga sobre o piso, contra 1,3% do
   `#6B6387` que K1 tinha testado e descartado. Escopo é só borda de
   controlo (`STROKE_COLOR`): sobre `ink` dá texto reprovado — não é cor
   de letra.

   A RAMPA DA PÁGINA NÃO É INVENÇÃO: a Baldur's Gate 3 publica a paleta
   do seu framework de interface (docs.baldursgate3.game/index.php?
   title=UI) — `#584537 · #7d604a · #af8768 · #cbac95 · #E6DBC2` — cinco
   degraus de um castanho quente e ZERO cor de acento no chassis. Os
   degraus 4–5 batem quase exatamente com `inkMeio`/`ink` (`#cbac95`
   L 44,4 contra `#C3B7A3` L 48,1; `#E6DBC2` L 71,4 contra `#F2ECE0`
   L 84,2) — chegou-se à mesma arquitetura por aritmética de contraste E
   por uma referência publicada, sem que uma tivesse visto a outra.

   `mundo` É NOVO, E NÃO É APETITE POR COR: contado no código, `amber`
   carregava 24 significados diferentes na tela principal — a voz do
   Mestre, o "✓ salvo", o acampar, o nível, a barra de PV, o verbo
   "Ações"... `mundo` tira-lhe cinco (relógio, data, estação, lugar, a
   espera) e devolve-lhe uma função só. A LEI QUE VEM DA FAILBETTER E É
   VARRÍVEL (o redesenho de Sunless Skies, "reading by gaslight",
   gamedeveloper.com/design/reading-by-gaslight-a-look-inside-sunless-
   skies-ui-redesign): `amber`, `violet` e `mundo` só em coisa com que se
   interage ou que se tem de notar. E `mundo` NÃO significa "seguro" —
   só "o mundo abriu isto": ir às terras baixas não custa nada e pode
   matar o herói.

   O QUE AINDA NÃO SE RESOLVE, escrito em vez de escondido: simulando os
   três daltonismos, `amber`×`mundo` mede 1,12:1 em deuteranopia e
   `ok`×`danger` mede 1,50:1 — a separação de 1,43:1 + 143° de matiz é
   sobretudo luminância e matiz juntos, e quem não vê cor fica só com a
   luminância. A defesa não é a paleta: é a lei escrita acima — nenhum
   acento carrega sentido sozinho, cada um tem glifo e posição fixos, e
   isso não é medida, é regra.
   ============================================================ */
export const T = {
  /* A MESA — fria (h≈250). Recua: cabeçalho, trilho, HUD, bastidor. */
  bg:         "#131120",   /* era #0E0C15 — SOBE (ver a nota grande acima) */
  panel:      "#1B182C",   /* era #171322 */
  panelSoft:  "#252038",   /* era #1E1930 */
  line:       "#3D3559",   /* era #2E2745 */
  lineStrong: "#7A719A",   /* era #70688C — a borda de CONTROLE */

  /* A PÁGINA — quente (h≈30). É o que está aceso: só onde a prosa mora. */
  pagina:     "#3A2F23",   /* NOVO */
  paginaAlta: "#48392B",   /* NOVO */
  paginaFio:  "#7A6349",   /* NOVO — o contorno, e é ele que carrega os 3:1 (3,29:1) */

  /* A TINTA */
  ink:        "#F2ECE0",   /* era #EAE4D6 — a prosa */
  inkMeio:    "#C3B7A3",   /* NOVO — a segunda voz DA PÁGINA, quente */
  inkDim:     "#A29AB4",   /* era #9B93AC — o rótulo DA MÁQUINA, frio */

  /* OS TRÊS ACENTOS, cada um com UM trabalho */
  amber:      "#E8A33D", amberSoft: "#F5C878", onAccent: "#1A1408",   /* a luz */
  violet:     "#9B8DE4", violetSoft: "#B0A5EC", onSecond: "#14101F",  /* era violet #8B7BD8 — o arcano */
  mundo:      "#79D6C6", mundoSoft: "#A8E7DC", onMundo:   "#04140F",  /* NOVO — o mundo (relógio, data, estação, lugar, a espera) */

  danger:     "#EE7C6A",   /* era #D86A5B */
  ok:         "#8FE0A2",   /* era #7BC98F */
  /* O CHÃO DE UM SELO DE ESTADO — o verde e o vermelho muito escuros
     por baixo de `ok` e de `danger`. Estavam escritos à mão CINCO vezes no
     mesmo bloco do HUD (as condições, os efeitos, a rolagem, a ação
     perdida, o dano por turno) e em lado nenhum mais — cinco cópias de
     dois números que ninguém podia mudar num sítio só. A primeira lei
     desta casa vale para o visual: cor é número, logo é tabela. */
  okFundo:             "#17301C",   /* era #1f3320 */
  perigoFundo:         "#331A16",   /* era #33201f */
};

/* O PRETO E O BRANCO DE SEMPRE. Sombra e brilho não são cor do tema:
   são profundidade. O alfa vai como STRING, escrito exatamente como
   estava no CSS — `sombra(".55")` devolve o mesmo `rgba(0,0,0,.55)`
   byte a byte, e um `0.55` numérico devolveria `rgba(0,0,0,0.55)`, que
   é a mesma cor com outro texto. Num arquivo cujo contrato é "zero
   diferença na tela", o texto também conta.

   Privados de propósito: quem precisa de sombra precisa da folha, não
   da fórmula. */
const sombra = (a) => `rgba(0,0,0,${a})`;
const brilho = (a) => `rgba(255,255,255,${a})`;

/* ============================================================
   A PALETA FÍSICA: de que o OBJETO é feito.

   `T` diz o que a cor significa; `MATERIAIS` diz de que material a
   coisa é. A tábua de cortiça não é "o fundo do painel" nem "a linha":
   é madeira escura, e vai continuar sendo madeira escura no dia em que
   o tema inteiro mudar de tom. Misturar as duas famílias é como o mural
   nasceu — treze cores literais soltas no meio de um gradiente.

   O CONTRATO: toda entrada aqui é um valor de cor CSS COMPLETO, pronto
   para interpolar direto na folha. Nenhuma conta de alfa mora aqui —
   quem precisa de transparência sobre uma cor do tema espera o helper
   `alfa(cor, a)`, que é de outro ciclo.
   ============================================================ */
export const MATERIAIS = {
  /* a tábua de cortiça: o corpo escuro, a moldura de madeira e o filete
     de latão que corre por dentro dela */
  corticaFundo:        "#1A1424",
  corticaMoldura:      "#3B2A1B",
  corticaFilete:       "rgba(150,112,66,.4)",
  /* o papel do cartaz: três paradas de um gradiente diagonal, do topo
     iluminado ao pé na sombra */
  cartazTopo:          "#241D33",
  cartazMeio:          "#1C1729",
  cartazPe:            "#191426",
  /* a cabeça de latão do percevejo: o ponto de luz, o corpo e a base */
  percevejoBrilho:     "#FFE2AC",
  percevejoCorpo:      "#D98F22",
  percevejoBase:       "#6E4207",
  /* e a cabeça roxa, que é como o cartaz diz de relance que foi
     OFERECIDO a você e não está ali para qualquer um */
  percevejoRoxoBrilho: "#E4DEFF",
  percevejoRoxoCorpo:  "#8A78D8",
  percevejoRoxoBase:   "#3B3072",
  /* a vinheta: o quase-preto azulado que escurece o canto da tela */
  vinhetaCanto:        "rgba(4,3,8,.45)",
};

/* ============================================================
   O ALVO DE TOQUE — o piso da casa, em px.

   A doença que esta tabela cura tem endereço: `App.jsx:1998`. A fila de
   quatro pílulas da ficha mede 27,5 px e o desenho dela mede 48 — e a
   diferença atravessou uma suíte de 102 asserções sem uma única falha,
   porque NENHUM DOS DOIS NÚMEROS ESTÁ ESCRITO NO CÓDIGO. A altura era o
   resto de uma conta: 9 px de texto × 1,5 de entrelinha herdada, mais
   12 px de `py-1.5`, mais 2 px de borda. Uma medida que ninguém escreve
   é uma medida que ninguém pode provar — e uma altura composta por
   `font-size` + `padding` muda sozinha no dia em que alguém aumentar o
   texto por legibilidade.

   POR QUE 48 E NÃO 47. 44 é o mínimo do WCAG 2.5.5 (AAA) e do HIG; 48 é
   o do Material, é a casa do tabuleiro, é a linha do recuo do leque
   (`painel-reacao.jsx`) — e é o que K1 deixou por fechar quando anotou
   que a Pílula «saiu 47 e não 45, e o número não fecha». Um piso, quatro
   leitores, em vez de quatro números parecidos. O orçamento do telefone
   de W1 aguenta: 48 + 24 = 72 px de região reservada, contra o degrau
   medido em 75 — folga de 3 px em vez de 4, e a mesma 13.ª fila.
   ============================================================ */
export const ALVOS = {
  piso: 48,     /* toda peça em que se toca */
  chamado: 56,  /* `O chamado`: mais alto por decisão de K1, fixado em K3 */
};

/* ============================================================
   TIPOS — a letra ganha piso e tabela (R2).

   A DOENÇA, medida em R1: 363 de 575 tamanhos de letra do projeto estão
   abaixo de 12 px — 63,1%. Isolada à tela principal (`fase === "jogo" &&
   !emBatalha`, onde se passa 90% do jogo) a proporção sobe para 68 de
   90 — 76%, a pior região medida da casa, pior que qualquer painel. Há
   11 tamanhos distintos em uso: não é uma escala, é um histórico — cada
   `text-[Npx]` é o resto de um ajuste de ocasião que ninguém revisitou.

   A PROVA. WCAG 1.4.4 (*Resize text*) exige que a 200% de zoom de texto
   de sistema nada se perca — nem conteúdo, nem função — e o que quebra
   primeiro é sempre o que já nasceu pequeno demais para ter folga. A
   Apple HIG cita 11 pt como piso legível em iOS; o Material Design cita
   11 sp. `piso: 12` fica UM DEGRAU ACIMA das duas réguas, e é decisão,
   não arredondamento: 11 pt/sp é o que essas plataformas ainda toleram
   mostrar — não o que sobra depois que o jogador JÁ aumentou a letra do
   sistema porque a dele, à parte, também lhe é pequena. Um piso igual à
   régua não dá folga nenhuma a esse jogador; um degrau acima dá.

   OS SETE DEGRAUS, cada um com um trabalho, nenhum ao acaso:
   - `maquina` (12, mono) — rótulo, contador, endereço, saldo: é a MENOR
     letra que esta casa desenha, e por isso é ela quem mora no piso.
   - `rotulo` (13) — a segunda voz: quem fala, onde, o preço escrito.
   - `corpo` (15) — a fala e o verbo, texto que se lê em prosa curta.
   - `prosa` (17) — a narração: a protagonista da tela principal.
   - `titulo` (20) — o cabeçalho de uma região.
   - `display` (28) — a cerimônia, e só ela: subida de nível, abertura.

   O QUE ELE RECUSA: um `text-[Npx]` novo com N < 12 em qualquer tela. A
   catraca (`testes/check-formas.mjs`, D5g) congela a contagem de HOJE
   dos quatro tamanhos abaixo do piso (`text-[8px]` a `text-[11px]`) e
   falha se ela subir — esta etapa NÃO converte a dívida de uma vez (é
   trabalho de várias etapas, tela por tela); só impede que ela cresça
   enquanto a conversão não chega.
   ============================================================ */
export const TIPOS = {
  piso: 12,      /* nada abaixo disto tem letra neste jogo */
  maquina: 12,   /* mono: rótulo, contador, endereço, saldo */
  rotulo: 13,    /* a segunda voz: quem, onde, o preço escrito */
  corpo: 15,     /* a fala e o verbo */
  prosa: 17,     /* a narração — a protagonista */
  titulo: 20,    /* o cabeçalho de uma região */
  display: 28,   /* a cerimônia, e só ela */
};

/* ============================================================
   A SOLEIRA (R2 → R5a) — o teto de ofertas visíveis, em tabela e não em
   aritmética de leiaute.

   O NÚMERO É R5a, do `jogo`, com a conta do `regente`: 2 na mesa, 1 no
   telefone — não mais o 3 de R2. Cada oferta custa 54 px ≈ 8 pontos
   percentuais da área da prosa; com teto 3 a página caía a 38,7 % do
   ecrã, um terço da protagonista, e a mesa não assinou. Com teto 2,
   50,1 % — e com a tábua da cidade fora da soleira (R5b) o turno típico
   tem 0 ou 1 oferta: na sessão inteira de R1 o máximo de ofertas vivas
   ao mesmo tempo foi UMA. Um teto de 2 é, por isso, um travão que quase
   nunca se toca, não um estado normal — e é exatamente por não se tocar
   quase nunca que pode ser baixo: *"uma lista ordenada que nunca tem de
   escolher não está ordenada, está só escrita."*

   O TETO NÃO É SOBRE AS OFERTAS, É SOBRE A PROSA: é a promessa de
   quanto da página a soleira pode tomar, não uma opinião sobre quantas
   ofertas merecem mesa. O que não cabe não desaparece — vai para a
   porta do "+N" (`Soleira`, `ui.jsx`, R5a), que abre e mostra o resto.

   A CONTA ORIGINAL DE R2, para o rasto: 3 cartas na mesa × 48 px
   (`ALVOS.piso`) + 2 folgas de 8 px entre elas = 160 px, dentro dos
   319 px de mobília que W1 mediu no telefone. No telefone o teto já
   nascia em 1 e continua: a lição de E4 é que uma tira apertada não
   ganha mais itens, ganha um "+N".

   NÃO CONTA ALTURA FIXA NENHUMA: `Soleira` empilha por `flex` e deixa a
   altura de cada `Oferta` decidir a régua — os px acima são o ORÇAMENTO
   que a conta prova cabe, não um número que o componente escreve na
   tela. */
export const SOLEIRA = {
  tetoNaMesa: 2,
  tetoNoTelefone: 1,
};

/* ============================================================
   A GEOMETRIA DA TELA DA BATALHA (E3) — os números de E1, numa tabela.

   POR QUE ELA EXISTE. E1 mediu a tela inteira contra as dez plantas de
   `grid.js` e escolheu DUAS COLUNAS por uma ordem de grandeza (9 de 10
   plantas inteiras contra 1 de 10 na pilha). Esses números — 888 de
   campo, 344 de lateral, 56 de faixa da vez, 24 de linha do veredito —
   são decisão, não gosto: cada um tem a conta escrita em
   `mente/e1-desenho.md`. Escrito solto no meio de um `style={{}}`, um
   deles mudaria no dia em que alguém quisesse "ganhar um pouco de
   espaço", e a conta que o justifica não estaria lá para recusar.

   A PROVA QUE A SUÍTE FAZ DE VOLTA, e é a razão de a tabela ser tabela:
   `respiro + campo + goteira + lateral + respiro = 1280`, exatamente a
   largura do monitor que a pessoa citou como régua. Um número que se
   soma com os outros não pode ser afinado sozinho — e uma tabela é o
   único sítio onde a soma se pode conferir.

   O QUE NÃO ESTÁ AQUI, de propósito: a CASA (`ALVOS.piso`, 48) e a
   CALHA DA RÉGUA (22, `grade-de-batalha.jsx`). As duas já têm dono, e
   uma cópia delas aqui seria a segunda tabela — a doença que E2 passou
   a etapa inteira a impedir.
   ============================================================ */
export const TELA_DE_BATALHA = {
  /* O MONITOR, 1280 × 860 — duas colunas, e 1248 dos 1280 viram jogo */
  respiro: 16,
  campo: 888,
  goteira: 16,
  lateral: 344,   /* = a largura de `A pergunta que expira`, e o encaixe é exato */

  /* AS FAIXAS, na ordem de leitura, que é a ordem do turno */
  vez: 56,                 /* a ordem da vez, largura inteira (E1; 48 no telefone) */
  vezNoTelefone: 48,
  veredito: 24,            /* PISO da região, nunca altura da peça: a `Consequencia` Linha mede 15, e a 115% de texto a frase pede 30. Reserva-se 24 e deixa-se crescer */
  verbos: 48,              /* a fileira: `Papel=Gesto` e `Papel=Recuo` subiram ao piso do alvo neste ciclo (mediam 44 e 42). NÃO é 63 — 63 é a peça com a calha da razão, que a barra de batalha nunca usa */
  fileirasNoTelefone: 3,
  textoLivre: 44,          /* `como? (opcional)`, por baixo dos verbos */

  /* A NARRAÇÃO — a prosa é a protagonista, e por isso ela não sai.
     Spectral 15 px com entrelinha 1,625 dá 24,4 px de linha: duas linhas
     mais respiro são 84 px no monitor; uma linha são 28 no telefone. */
  narracao: 84,
  narracaoNoTelefone: 28,

  /* O TERÇO DE BAIXO DA JANELA DO CAMPO É TERRITÓRIO EMPRESTADO (E1/K1):
     é onde a pergunta da reação cresce, e nada desta tela pode depender
     de estar visível ali. Escrito como número porque é ele que decide
     ONDE a câmara põe o herói: a área livre é o que sobra por cima da
     reserva, e o herói fica no CENTRO DELA — nunca no centro geométrico,
     que o cairia dentro da faixa que o próprio polegar tapa. */
  reservaDaReacao: 1 / 3,
  /* e quem age reenquadra só quando chegaria a MENOS DE UMA CASA da
     borda — uma câmara que corrige todo passo faz o campo parecer
     escorregar debaixo do jogador */
  folgaDaBorda: 1,

  /* O TELEFONE, 375 × 812 — os controles no arco do polegar */
  arcoDoPolegar: 144,      /* as tiras vivem nos 144 px de baixo */
  colunas: 7,              /* 7 × 12 = 84 casas, medido em E2 com a peça na mão */
  linhas: 12,

  /* A TIRA DO HERÓI — uma LINHA, e ela é reposição, não invenção (E4).
     O quadro do telefone de E1 (`40:447`, no Figma desde 15/09) sempre
     teve: faixa da vez 48 + campo 548 + veredito 24 + verbos 144 +
     **tira do herói 44** + folga 4 = 812. A construção de E3 empilhou
     duas `A ficha curta` — peça de MESA, 288×150 — e ficou com 144 px
     de tira e 296 de campo.

     O `jogo` contou a carga item a item e TRÊS DE SETE campos da tira
     estavam no ecrã no mesmo instante: o meu nome (na minha ficha do
     campo, rotulada «você»), o nome dele (na ficha dele) e a distância
     (na linha do veredito, que a escreve com o «faltam»). *Uma tira
     43 % duplicada não se esconde numa gaveta: esvazia-se.*

     O que isso devolve, contado: campo 296 → 436 px = 9,08 filas; casas
     inteiramente visíveis 30 → 48, de 15 % para 24 % do tabuleiro.
     E O TECTO FICA ESCRITO, porque buraco calado é mentira: 24 % ainda
     não é um tabuleiro, e os outros 76 % pedem a escala da casa, que
     está com a pessoa e não se toca. */
  tiraDoHeroi: 44,

  /* A CASA DO TABULEIRO — o que se escreve DENTRO dela.

     POR QUE O CUSTO NASCE ESCRITO, e o número é do `jogo`: nas dez
     plantas de `grid.js`, quatro dão 0 % de divergência entre o custo
     real e o que o olho conta, e SEIS dão 100 % — não há meio-termo, e
     como o jogador não sabe em que planta está antes de a ver, *a regra
     só serve se for a mesma nas duas*. Nas seis, o herói ABRE dentro da
     lama: o passo cai de ~83 casas para 27 no primeiro fotograma, e o
     único sinal disso na tela era o véu ser mais pequeno. O erro de quem
     conta quadrados é sempre 1,5 m — a diferença exacta entre «ao
     alcance» e «faltam 1,5 m».

     A CASA DE REFERÊNCIA É `ALVOS.piso`, e não um 48 escrito de novo: o
     corpo do número é dado em píxeis sobre a casa de 48, e o desenho em
     SVG divide um pelo outro. Quem mudar o piso do alvo muda os dois. */
  casa: {
    corpoDoCusto: 10,     /* mono 10 px na casa de 48 — E1, confirmado por medida em E4 */
    linhaDoCusto: 0.72,   /* onde a linha de base cai, em fracção da casa: o centro da fenda `o custo` da peça (28+13/2 sobre 48) */
    anelDoFoco: 3,        /* px de `ink`, POR DENTRO: uma casa tem oito vizinhas coladas, e um anel por fora pinta por cima da borda de alcance das oito */
    anelDaParagem: 2,     /* px de `inkDim`, por dentro: onde o teclado VOLTA, contra os 3 px de onde ele ESTÁ */
  },
};

/* ============================================================
   AS FONTES — e o `@import` que tem de vir primeiro.

   O `@import` é a PRIMEIRÍSSIMA coisa da string, e por isso `FONT_CSS`
   é a primeira parcela de `FOLHA`. Um `@import` que não está no topo da
   folha concatenada é descartado pelo navegador EM SILÊNCIO: nenhum
   erro, nenhum aviso, e as três fontes do jogo simplesmente não chegam.
   ============================================================ */
export const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Spectral:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@400;600&display=swap');
.tv-display { font-family: 'Cormorant Garamond', Georgia, serif; }
.tv-body { font-family: 'Spectral', Georgia, serif; }
.tv-mono { font-family: 'JetBrains Mono', monospace; }
`;

/* ============================================================
   O MOVIMENTO — tudo que anda na tela.

   As cores daqui são rgba() que já são cor de `T` com alfa (o âmbar do
   brilho, o vermelho do dano). NÃO SAEM NESTA ETAPA: elas esperam o
   helper `alfa(cor, a)`, que é de outro ciclo. Trocá-las à mão agora
   seria inventar a fórmula duas vezes.

   E três classes aqui NÃO declaram `animation` — `.tv-vira-palco`,
   `.tv-vira-face` e `.tv-vira-verso`. Elas ficam mesmo assim: sem o
   `perspective` do palco e o `backface-visibility` das faces, a carta
   gira e não se vê NADA. Quem vier "limpar" a caixa por elas não
   declararem animação apaga a virada inteira.
   ============================================================ */
export const MOVIMENTO_CSS = `
/* A ORDEM É A REGRA (1/2): .tv-fade tem de vir ANTES de .tv-reliquia.
   As duas têm a mesma especificidade e as duas declaram animation, e o
   App usa as duas no MESMO elemento (a carta de espolio raro). Quem vem
   depois ganha — hoje ganha a reliquia, e e por isso que a carta rara
   PULSA em vez de so aparecer. Inverter estas duas caixas troca o
   efeito sem trocar uma linha de JSX. */
.tv-fade { animation: tvFade .5s ease both; }
@keyframes tvFade { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: none;} }
@keyframes tvGlow { 0%,100%{box-shadow:0 0 24px rgba(232,163,61,.25);} 50%{box-shadow:0 0 48px rgba(232,163,61,.55);} }
@keyframes tvShake { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-8deg)} 40%{transform:rotate(7deg)} 60%{transform:rotate(-5deg)} 80%{transform:rotate(4deg)} }
.tv-dice { animation: tvShake .35s linear infinite, tvGlow 1s ease infinite; }
.tv-pulse { animation: tvGlow 1.6s ease infinite; }
@keyframes tvSlide { from { transform: translateX(24px); opacity: 0;} to { transform: none; opacity: 1;} }
.tv-slide { animation: tvSlide .25s ease both; }

/* ---------------- O FILETE QUE RESPIRA (R4a) ----------------
   (Sem crase neste comentário de propósito: ele mora DENTRO da template
   literal de MOVIMENTO_CSS, e uma crase aqui fecha a string e derruba o
   build — a mesma armadilha que o aviso de .tv-escolha-troca, ali em
   cima, já descreve. Tropecei nela ao escrever este parágrafo.)

   A voz, eixo Resposta=Espera-se (formas.md:5412-5419): o filete sob o
   cabeçalho passa a amber e pulsa devagar enquanto o Mestre não
   respondeu — "no filete, nunca no texto". É IRMÃ de .tv-pulse (mesmo
   1,6s, mesma ideia — atenção sem interromper), mas não pode ser a
   MESMA classe: .tv-pulse anima box-shadow num cartão inteiro (o halo
   de "pronto para rolar"); o filete é uma barra de 2px, e um halo de
   sombra em volta de uma barra dessas não pinta nada que se veja. A
   opacidade é o canal certo para uma faixa fina.

   SÓ NO FILETE, NUNCA NO TEXTO: a prosa ao lado não pode se mover — é a
   lei que formas.md escreve para esta peça, e por isso a animação entra
   numa classe própria, nunca em tv-mono/tv-body. */
@keyframes tvRespira { 0%, 100% { opacity: .45; } 50% { opacity: 1; } }
.tv-respira { animation: tvRespira 1.6s ease infinite; }

/* ---------------- O CORPO SENTE (v9.160) ----------------
   O clarao de dano e o pulso de agonia do bloco do heroi. Um golpe que
   so muda um numero e um golpe que o jogador nao sente: o clarao dura
   menos de um segundo e morre sozinho; a agonia (um terco da vida)
   pulsa ate alguem fazer alguma coisa a respeito. */
@keyframes tvDano { 0% { box-shadow: 0 0 0 rgba(216,106,91,0); } 20% { box-shadow: 0 0 22px rgba(216,106,91,.85); } 100% { box-shadow: 0 0 0 rgba(216,106,91,0); } }
.tv-dano { animation: tvDano .7s ease both; }
@keyframes tvAgonia { 0%, 100% { box-shadow: 0 0 6px rgba(216,106,91,.25); } 50% { box-shadow: 0 0 16px rgba(216,106,91,.6); } }
.tv-agonia { animation: tvAgonia 1.6s ease infinite; }

/* ---------------- O PALCO DO COMBATE (v9.161) ----------------
   O numero de dano sobe do quadrado de quem apanhou e some (as unidades
   sao as do SVG do tabuleiro: 1 = um quadrado de 1,5 m). A faixa do
   chefe abre, respira e fecha sozinha — 3,2 s, o tempo de ler uma
   frase curta duas vezes. */
@keyframes tvFlutua { 0% { opacity: 0; transform: translateY(0.3px); } 15% { opacity: 1; } 70% { opacity: 1; } 100% { opacity: 0; transform: translateY(-0.9px); } }
.tv-flutua { animation: tvFlutua 1.35s ease-out both; }
@keyframes tvFaixa { 0% { opacity: 0; transform: scaleY(0.3); } 10% { opacity: 1; transform: none; } 85% { opacity: 1; } 100% { opacity: 0; } }
.tv-faixa { animation: tvFaixa 3.2s ease both; }

/* ---------------- A VIRADA DA CARTA (v9.163) ----------------
   A subida de nivel abre com a carta de COSTAS e a revela. O palco da
   perspectiva fica no pai; a carta gira uma vez, com um respiro antes
   (o jogador precisa VER o verso para a virada valer alguma coisa).
   As duas faces escondem o proprio dorso; o verso ja nasce virado. */
.tv-vira-palco { perspective: 1200px; }
.tv-vira { position: relative; transform-style: preserve-3d; animation: tvVira 1.1s cubic-bezier(.2,.7,.3,1) .45s both; }
@keyframes tvVira { from { transform: rotateY(180deg); } to { transform: rotateY(0deg); } }
.tv-vira-face { backface-visibility: hidden; }
.tv-vira-verso { position: absolute; inset: 0; transform: rotateY(180deg); backface-visibility: hidden; }
/* o brilho do espolio raro: pulsa devagar, na cor que a raridade mandar
   (a cor entra por box-shadow inline; aqui mora so o ritmo) */
@keyframes tvReliquia { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.25); } }
.tv-reliquia { animation: tvReliquia 2.4s ease infinite; }
/* o sigilo da recalibragem (v9.182): dois anéis em sentidos opostos, e um
   ponto que pisca no passo em curso. Devagar de propósito — a espera é de
   verdade (o arquivista relê a campanha inteira), e um giro rápido faria
   parecer travado. */
@keyframes tvGira { to { transform: rotate(360deg); } }
@keyframes tvGiraAoContrario { to { transform: rotate(-360deg); } }
@keyframes tvPisca { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
.tv-anel-fora { animation: tvGiraAoContrario 24s linear infinite; }
.tv-anel-dentro { animation: tvGira 3.2s linear infinite; }
.tv-pisca { animation: tvPisca 1.2s ease infinite; }

/* ---------------- A JANELA DA REAÇÃO (K3) ----------------
   Sete classes, e nenhuma infinite. A saída de cada uma pousa no
   ESTADO FINAL da animação, nunca no inicial — e onde e a propria
   animacao que faz a coisa sumir, none sozinho e um bug: deixaria o
   cartao colado na tela para quem pediu menos movimento.

   Um so desenho de entrada (tvSobeSeis) para o chamado e para o
   leque: e o MESMO gesto — a peca nasce 6px abaixo e assenta — em duas
   velocidades. Dois keyframes iguais com nomes diferentes seriam duas
   verdades sobre um movimento so.

   E A DURACAO DO TRILHO NAO MORA AQUI, de proposito: ela sai de
   ritmoDaRodada().abre.trilhoMs, que a le da tabela. Um numero de
   relogio copiado para a folha nao muda no dia em que a janela mudar —
   e ai a barra mente. E tambem o que mantem D5e.1 verde. */
@keyframes tvSobeSeis { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.tv-chamado-entra { animation: tvSobeSeis 120ms cubic-bezier(.2,.7,.3,1) both; }
.tv-leque-abre    { animation: tvSobeSeis 160ms cubic-bezier(.2,.7,.3,1) both; }

@keyframes tvApareceSo { from { opacity: 0; } to { opacity: 1; } }
.tv-trilho-entra { animation: tvApareceSo  90ms ease both; }
.tv-resolve      { animation: tvApareceSo 120ms ease both; }

@keyframes tvSomeSo { from { opacity: 1; } to { opacity: 0; } }
.tv-trilho-sai { animation: tvSomeSo  90ms ease both; }
.tv-janela-sai { animation: tvSomeSo 140ms ease both; }

/* O TRILHO. scaleX e nao width: a tela nao anima leiaute (so
   opacity e transform), e a proporcao fica impossivel de escrever em
   pixeis — nao ha pixel nenhum nesta caixa para alguem copiar. O trilho
   e width: 100% da janela; o cheio e este scaleX do trilho.
   transform-origin: left e o que faz a barra esvaziar-se da direita
   para a esquerda em vez de encolher pelo meio.

   As duas variaveis sao carimbadas em linha pelo componente e trazem o
   relogio inteiro: --tv-trilho-ms e a duracao (da tabela), e
   --tv-trilho-desde e um atraso NEGATIVO — quanto do trilho ja passou
   no instante da primeira pintura. E por causa dele que a barra NASCE JA
   NA PROPORCAO que o relogio diz, e nunca num 100% escrito a mao.

   Os valores de reserva sao 0ms de proposito: se o carimbo falhar, a
   abreviada continua valida e a barra pousa VAZIA (invisivel). Falhar
   para o lado de nao mostrar relogio nenhum e o unico lado honesto —
   uma barra parada e um relogio a mentir. */
@keyframes tvJanelaTempo { from { transform: scaleX(1); } to { transform: scaleX(0); } }
.tv-janela-tempo {
  --tv-trilho-ms: 0ms;
  --tv-trilho-desde: 0ms;
  transform-origin: left center;
  animation: tvJanelaTempo var(--tv-trilho-ms) linear var(--tv-trilho-desde) both;
  transition: background-color 90ms ease;   /* Pressa=Sobra -> Pouco: so a tinta */
}

/* ---------------- A PÍLULA DE ESCOLHA (K4) ----------------
   120ms na troca de borda e no filete que cresce de 0 a 3px —
   formas.md:355, o movimento de TODA "A escolha", não só desta
   pílula. TRANSITION, não animation: é troca de ESTADO por um gesto
   do jogador, nunca uma entrada que se dispara sozinha — por isso mora
   ao lado de .tv-janela-tempo acima, que já mistura as duas coisas
   na mesma classe.

   NUNCA background: o fundo de PilulaDeEscolha é sempre T.panel (a
   gramática do escolhido é borda + filete + visto, nunca preenchimento
   cheio — formas.md:363-367), e animar uma cor que não muda seria
   custo sem efeito. SEM CRASE NESTE COMENTÁRIO DE PROPÓSITO: ele mora
   DENTRO da template literal de MOVIMENTO_CSS, e uma crase aqui fecha
   a string e derruba o build — foi exatamente o que aconteceu na
   primeira tentativa. */
.tv-escolha-troca { transition: border-color 120ms ease, box-shadow 120ms ease; }

/* A ORDEM É A REGRA (2/2): este @media tem de vir DEPOIS das tres
   classes acima. Uma media query nao soma especificidade nenhuma — ela
   so envolve. Quem decide o empate e a ordem, e so por estar embaixo
   este bloco consegue desligar a animacao de quem pediu menos
   movimento. Subir esta caixa nao da erro: da um acessivel que nao
   funciona, calado. */
@media (prefers-reduced-motion: reduce) {
  .tv-anel-fora, .tv-anel-dentro, .tv-pisca { animation: none; }
  .tv-chamado-entra, .tv-leque-abre, .tv-trilho-entra, .tv-resolve { animation: none; }
  /* O FILETE QUE RESPIRA (R4a) — sem crase, mesma razão de cima: sem
     pulso, amber fixo — Voz já troca a legenda por texto ("o Mestre
     está a tecer") no mesmo estado, lido uma vez por render (o padrão
     de CampoDeBrasas/grade-de-batalha). opacity: 1 e não o .45 do meio
     do ciclo — parado, a cor tem de ficar no seu valor CHEIO, nunca a
     meio de um pulso que não vai mais acontecer. */
  .tv-respira { animation: none; opacity: 1; }
  /* estas duas terminam em opacity: 0, e e a animacao que as faz
     sumir: none sozinho deixaria o cartao aceso na tela. A saida pousa
     no estado FINAL. */
  .tv-janela-sai, .tv-trilho-sai { animation: none; opacity: 0; }
  /* E A EXCECAO QUE E LEI, agora com o mecanismo escrito. K1: a saida de
     tv-janela-tempo nao e none, e VIRAR CONTAGEM. none sozinho
     congelaria o cheio em scaleX(1) — uma barra CHEIA e parada, que e
     a pior mentira possivel sobre o tempo. Pousando em scaleX(0) ela
     fica invisivel, e quem conta o tempo passa a ser o numeral, que e
     literalmente o que Tempo=Contagem e. */
  .tv-janela-tempo { animation: none; transform: scaleX(0); transition: none; }
  /* A PÍLULA DE ESCOLHA (K4): sem isto a troca de borda salta em vez de
     transitar sob movimento reduzido — a peça continua legível no
     estado final (a lei que importa), mas a saída é obrigatória à
     nascença mesmo assim, e não fica por escrever "é só cosmético". */
  .tv-escolha-troca { transition: none; }
}
`;

/* ============================================================
   AS SUPERFÍCIES — o que fica parado: o trilho, a tábua e o papel.

   Aqui as cores PRÓPRIAS do objeto saem da string e entram por
   `MATERIAIS`, e todo preto e branco por `sombra()` / `brilho()`. Cada
   troca rende exatamente o mesmo texto que estava escrito antes.

   O que continua literal são as cores que JÁ SÃO de `T` com alfa (os
   pontinhos de âmbar, violeta e tinta da cortiça; a borda do cartaz).
   Elas esperam o helper `alfa(cor, a)` de outro ciclo — trocar agora
   por uma conta escrita à mão seria pagar o preço duas vezes.
   ============================================================ */
export const SUPERFICIES_CSS = `
.tv-scroll::-webkit-scrollbar { width: 8px; }
.tv-scroll::-webkit-scrollbar-thumb { background: ${T.line}; border-radius: 4px; }

/* ---------------- A COLUNA DA PROSA (R2) ----------------
   A prosa é a protagonista, e hoje ela é mal composta nos dois
   aparelhos, em direções opostas: medida no DOM vivo, o balão do Mestre
   dá 89 caracteres por linha na mesa e o texto de sistema chega a 100 —
   25% acima do teto de 80 que a WCAG 1.4.8 (AAA) marca, e a régua de
   Baymard (baymard.com/blog/line-length-readability) mediu que uma
   linha acima de 80 caracteres é SALTADA 41% mais vezes que uma de
   60–70. No telefone o balão faz o oposto: 37 caracteres, abaixo do
   piso de 45 que Bringhurst dá (referência em 66). Uma coluna de medida
   FIXA resolve os dois ao mesmo tempo — não é aritmética de padding,
   é largura em caracteres, que é a unidade que a legibilidade mede.

   max-width: 65ch fica dentro da faixa 60–70 de Bringhurst e do teto
   de 80 da WCAG, com folga dos dois lados. margin-inline: auto centra
   a coluna dentro do painel — a Failbetter perdeu uma versão inteira de
   Sunless Skies por um painel de leitura descentrado
   (gamedeveloper.com/design/reading-by-gaslight-a-look-inside-sunless-
   skies-ui-redesign) antes de a alargar e centrar.

   font-weight: 300 MORA AQUI, e não é acaso estar na mesma classe da
   largura: as duas regras servem SÓ onde a prosa mora, nunca o resto da
   letra do jogo. Texto claro sobre fundo escuro IRRADIA — um peso 400
   lê como 500 (css-tricks.com/dark-mode-and-variable-fonts) — e é por
   isso que a prosa também desce de contraste (14,37:1 para 11,08:1
   sobre T.pagina, ver a nota grande sobre T acima): as duas decisões
   nascem da mesma causa óptica, e por isso vivem na mesma caixa. O
   @import de FONT_CSS já carrega o peso 300 do Spectral — a classe
   só usa o que já chega.

   QUEM APLICA .tv-coluna AO TEXTO DA NARRAÇÃO É O oficial, no
   App.jsx — esta etapa é território do aprendiz (estilo.js e
   ui.jsx), e o App.jsx está fora dela por lei do bastão. Esta classe
   nasce fabricada e sem consumidor ainda; ganha o leitor na etapa
   seguinte. */
.tv-coluna { max-width: 65ch; margin-inline: auto; font-weight: 300; }

/* ---------------- O ESPAÇO DO TRILHO (v9.156) ----------------
   O trilho de abas é lateral no monitor e barra inferior no telefone, e
   cada forma cobra o seu espaço num lado diferente. Isto estava escrito
   catorze vezes como um padding-right de 68px em linha — o que num
   telefone reservava dezoito por cento da largura para uma barra que
   nem está ali.

   (Sem crase neste comentário de propósito: ele mora DENTRO da template
   literal do CSS, e uma crase aqui fecha a literal e derruba o build —
   foi exatamente o que aconteceu na primeira tentativa.)

   tv-espaco-abas é a reserva: nada embaixo, no telefone; 68px à direita
   a partir do monitor. Uma decisão num lugar só, e a próxima tela nasce
   certa sem ninguém lembrar dela.

   ---------------- E O PADDING-RIGHT FOI EMBORA (v9.197) ----------------
   A reserva da direita morreu na v9.170, quando o trilho saiu de fixed e
   virou coluna em fluxo: de la para ca o valor era 0 nos dois lados da
   media query. Mas a DECLARACAO ficou — e uma declaracao de padding-right
   ganha de px-4 na cascata, entao todo elemento que usava as duas classes
   juntas (eram dez) tinha 16px a esquerda e ZERO a direita.

   Foi a queixa de quem jogou no telefone: o meio da tela parecia pregado na
   borda direita. Nao era o rolamento — era esta linha, apagando metade do
   respiro de cada bloco. Reserva que nao reserva nada nao fica "por via das
   duvidas": ela sai, porque continua mandando na cascata mesmo valendo 0.

   (De novo sem crase: o aviso acima nesta mesma caixa e literal, e eu
   tropecei nele ao escrever este paragrafo.)

   O que sobra é o que ainda é verdade: no telefone a barra de abas é fixa
   embaixo e come 64px, então quem encosta nela reserva esse espaço. UMA
   VEZ — e não em dez elementos aninhados, que era o buraco vertical.

   E A ORDEM É A REGRA: a media query vem DEPOIS das duas classes. Ela
   nao soma especificidade — so a posicao decide qual valor vale no
   monitor. */
.tv-espaco-abas { padding-bottom: 4.75rem; }
.tv-margem-abas { margin-right: 0; }
@media (min-width: 768px) {
  .tv-espaco-abas { padding-bottom: 0; }
  .tv-margem-abas { margin-right: 0; }
}

/* ---------------- A CORTIÇA E O PAPEL (v9.127) ----------------
   O mural era uma lista de retângulos iguais dentro de um painel igual a
   todos os outros. Ele é a única tela do jogo que representa um OBJETO do
   mundo — uma tábua com papéis pregados — e não custa nada dizer isso.

   Tudo aqui é gradiente e sombra: nem um arquivo de imagem entra no
   repositório, e a cortiça continua sendo cortiça no telefone e no monitor.
   E nada de cortiça bege com papel creme: o jogo é âmbar sobre violeta
   escuro, e uma tábua clara no meio disso não seria charme, seria mancha. */
.tv-cortica {
  background-color: ${MATERIAIS.corticaFundo};
  background-image:
    radial-gradient(rgba(232,163,61,.13) 1.1px, transparent 1.6px),
    radial-gradient(rgba(139,123,216,.11) 1px, transparent 1.5px),
    radial-gradient(rgba(234,228,214,.07) 1.2px, transparent 1.7px),
    radial-gradient(ellipse at 22% 18%, rgba(232,163,61,.05), transparent 55%),
    radial-gradient(ellipse at 78% 72%, rgba(139,123,216,.05), transparent 55%);
  background-size: 17px 17px, 29px 25px, 11px 21px, 100% 100%, 100% 100%;
  background-position: 0 0, 7px 11px, 3px 5px, 0 0, 0 0;
  box-shadow: inset 0 0 46px ${sombra(".55")}, inset 0 1px 0 ${brilho(".04")};
  border: 7px solid ${MATERIAIS.corticaMoldura};
  border-radius: 14px;
  outline: 1px solid ${MATERIAIS.corticaFilete};
  outline-offset: -8px;
}
.tv-cartaz {
  background-image: linear-gradient(155deg, ${MATERIAIS.cartazTopo} 0%, ${MATERIAIS.cartazMeio} 62%, ${MATERIAIS.cartazPe} 100%);
  border: 1px solid rgba(232,163,61,.16);
  box-shadow: 0 7px 16px ${sombra(".5")}, inset 0 1px 0 ${brilho(".04")};
  transition: transform .18s ease, box-shadow .18s ease;
}
/* o giro fica no embrulho e o levantar no papel: assim o passar do dedo
   endireita o cartaz sem brigar com o ângulo que ele tem parado */
.tv-pregado:hover .tv-cartaz { transform: translateY(-3px); box-shadow: 0 13px 26px ${sombra(".62")}; }
/* o percevejo atravessa o papel, e não paira acima dele: em cima da borda
   ele vira uma continha solta no ar. Fica DENTRO do cartaz, com a sombra
   curta que uma cabeça de alfinete faz no papel. */
.tv-percevejo {
  position: absolute; top: 6px; left: 50%; margin-left: -6px;
  width: 12px; height: 12px; border-radius: 50%;
  background: radial-gradient(circle at 34% 28%, ${MATERIAIS.percevejoBrilho}, ${MATERIAIS.percevejoCorpo} 58%, ${MATERIAIS.percevejoBase});
  box-shadow: 0 1px 2px ${sombra(".75")}, 0 0 0 1px ${sombra(".45")}, 0 3px 5px ${sombra(".35")};
}
.tv-percevejo.tv-roxo { background: radial-gradient(circle at 34% 28%, ${MATERIAIS.percevejoRoxoBrilho}, ${MATERIAIS.percevejoRoxoCorpo} 58%, ${MATERIAIS.percevejoRoxoBase}); }

/* A VINHETA: o canto da tela escurece de leve, e o meio — onde a narração
   acontece — parece iluminado. É a coisa mais barata que existe para dar
   profundidade, e some sozinha em quem tiver o brilho baixo. */
.tv-vinheta {
  position: fixed; inset: 0; pointer-events: none; z-index: 1;
  background: radial-gradient(120% 85% at 50% 42%, transparent 52%, ${MATERIAIS.vinhetaCanto} 100%);
}

/* ---------------- O ANEL DE FOCO (K3) ----------------
   A forma e a de K1 e nao muda: dois degraus, o vao de bg e o traco de
   ink. Medido em K2: ink/panel = 14,37:1, ink/bg = 15,31:1, e a
   area do indicador da 2,0x o minimo do SC 2.4.13 nas tres pecas.

   E box-shadow, E NUNCA border: um border de 2px OCUPA LEIAUTE e
   empurra os irmaos: a fila de quatro pilulas da ficha mexia-se quando o
   foco entrasse — um alvo em movimento, para o jogador de teclado, que e
   exatamente quem aquela fila existe para servir. box-shadow nao ocupa
   leiaute nenhum. (No Figma o anel e geometria porque o Figma nao tem
   box-shadow de espalhamento com dois degraus — e o defeito que K2
   §1.6 encontrou e nomeou.)

   Nada de outline: none fora desta caixa. Hoje o campo de batalha tem
   86 alvos focaveis por luta com o anel apagado a mao
   (grade-de-batalha.jsx:515-519), e foi assim que ele desapareceu. */
/* E4 — A LEI DA PEÇA DO ANEL, e ela inverte quem carrega o quê:
   **o que carrega o anel é sempre outline; box-shadow só pinta o
   VÃO, como decoração que pode morrer sem levar o anel com ela.**

   A razão tem cinco nomes, e são as cinco maneiras de apagar um anel
   achadas nesta casa — três delas neste par de ciclos:
     1. estilo inline por cima (E3: 67 de 80 focáveis);
     2. none dentro de uma LISTA de sombras invalida a lista inteira,
        em silêncio (K4);
     3. tinta em falta na peça (E3, no Figma);
     4. box-shadow NÃO PINTA em elemento SVG (E3);
     5. clipsContent / overflow: hidden num ancestral corta o anel
        (E4 — os anéis do Botao *Foco* estavam cortados desde que
        nasceram).

   E A 4 É IRMÃ EXACTA DA DÍVIDA A11: em forced-colors: active — o
   alto contraste do Windows, que muita gente com baixa visão usa o dia
   inteiro — **box-shadow é removido POR ESPECIFICAÇÃO**. Com o anel
   dependente dele, o anel some para exactamente quem mais precisa dele.
   outline sobrevive ao alto contraste, pinta em SVG, não ocupa
   leiaute (a border ocupa) e não tem sintaxe de lista onde um none
   possa invalidar tudo.

   O bloco forced-colors abaixo deixa de ser o CONSERTO e passa a ser
   só a troca de tinta pela cor do sistema — que é o que ele devia ter
   sido sempre. */
.tv-anel-foco:focus-visible {
  outline: 2px solid ${T.ink};
  outline-offset: 2px;
  box-shadow: 0 0 0 2px ${T.bg};
}
/* O MODO DE ALTO CONTRASTE APAGA box-shadow. Nao e opiniao: e o que
   forced-colors faz por especificacao — e sem estas duas linhas o anel
   simplesmente NAO EXISTE para quem joga assim. outline sobrevive, nao
   ocupa leiaute (ao contrario de border) e aceita a cor do sistema. */
@media (forced-colors: active) {
  .tv-anel-foco:focus-visible { outline: 2px solid Highlight; outline-offset: 2px; }
}

/* O ANEL DENTRO DO SVG — e a QUARTA maneira de apagar um anel, que esta
   casa ainda nao tinha escrito: BOX-SHADOW NAO PINTA EM ELEMENTO SVG.
   Um rect nao e uma caixa CSS; a sombra e declarada, o navegador aceita
   a regra e nao desenha nada. Quem puser a classe de cima numa casa do
   tabuleiro fica com a propriedade a dizer que o anel existe e a tela
   sem anel nenhum — a mentira que este arquivo existe para nao ter.

   A cura e outline, que o SVG entende. Com outline-offset negativo ele
   desenha DENTRO da casa e nao rouba pixel a vizinha: 3 px de ink sobre
   o tabuleiro em bg dao 15,31:1, e carregam o trabalho sozinhos sem
   precisar do vao de dois degraus. E forced-colors nao precisa de
   excecao aqui, porque outline ja e o que ele preserva.

   ESTA CLASSE E SO PARA O QUE VIVE DENTRO DE UM SVG. Fora dele o anel e
   o de cima, e a diferenca nao e gosto: e o que cada superficie sabe
   pintar. */
.tv-anel-foco-no-campo:focus-visible {
  outline: ${TELA_DE_BATALHA.casa.anelDoFoco}px solid ${T.ink};
  outline-offset: -${TELA_DE_BATALHA.casa.anelDoFoco}px;
}

/* A PÍLULA DE ESCOLHA, E O ANEL QUE ELA TINHA APAGADO (K4). O filete de
   3px do escolhido nascia como box-shadow INLINE no style de
   PilulaDeEscolha, e estilo inline vence SEMPRE folha de estilo — o
   anel de foco (acima) também é box-shadow, e o inline apagava-o em
   todos os estados. O botão antigo do App.jsx não tinha box-shadow
   nenhum no atributo style, e foi por isso que K3 provou o anel vivo;
   a troca de peça levou o anel embora sem ninguém notar.

   O CONSERTO: o filete sai do style inline e vira variável CSS
   (--tv-filete), e quem compõe o box-shadow final é a folha, nunca o
   componente.

   ESTA REGRA TEM DE VIR DEPOIS de .tv-anel-foco:focus-visible, duas
   caixas acima: as duas dependem do mesmo estado :focus-visible, e
   quem decide o empate é quem está por último na cascata (A ORDEM É A
   REGRA, já avisada duas vezes neste arquivo — MOVIMENTO_CSS entra
   ANTES de SUPERFICIES_CSS em FOLHA, então esta regra não podia morar
   lá). O anel vem primeiro na lista de sombras e o filete por último:
   o anel é externo, o filete é inset, e essa é a ordem que se lê.

   O FALLBACK DO var() NUNCA É "none" — achado vivo, segunda rodada
   (K4): box-shadow: sombra, sombra, none é CSS INVÁLIDO — none só vale
   como a propriedade INTEIRA, nunca como um item de uma lista de
   sombras. Com o fallback em none (ou com --tv-filete valendo none),
   a declaração inteira do :focus-visible virava inválida e o
   navegador a DESCARTAVA EM SILÊNCIO: nenhum erro no console, e o
   anel continuava apagado mesmo com a cascata e a especificidade
   certas. O fallback é uma SOMBRA NULA (inset 0 0 0 0 transparent),
   válida mesmo que hoje ninguém a use — quem escrever a próxima peça
   pode esquecer de definir --tv-filete, e a falha voltaria calada. */
.tv-escolha-troca { box-shadow: var(--tv-filete, inset 0 0 0 0 transparent); }
/* E4: o anel saiu desta lista e foi para outline (a lei da peça, na
   caixa acima). Sobra aqui o VÃO e o filete — e a mudança PAGA esta
   armadilha em vez de a remendar: com o anel fora da lista de sombras,
   um --tv-filete que um dia valha none já não pode levar o anel
   junto. A sombra nula continua como fallback porque a lista continua a
   existir. */
.tv-escolha-troca.tv-anel-foco:focus-visible {
  box-shadow: 0 0 0 2px ${T.bg}, var(--tv-filete, inset 0 0 0 0 transparent);
}
`;

/* A FOLHA INTEIRA, na ordem em que o navegador tem de recebê-la.

   A ORDEM DA FOLHA É REGRA DE CASCATA, E REGRA NÃO MORA NO `App.jsx`.
   Quem monta a tela pede `FOLHA` e pronto; quem decide o que vem antes
   de quê é este arquivo, que é o único que sabe por quê.

   `FONT_CSS` primeiro porque o `@import` tem de ser a primeira coisa da
   folha — fora do topo ele é descartado em silêncio, e o jogo inteiro
   cai para a fonte de fallback sem um aviso. */
export const FOLHA = FONT_CSS + MOVIMENTO_CSS + SUPERFICIES_CSS;
