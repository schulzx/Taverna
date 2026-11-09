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
   V1 · A FOLHA DA v3 (24/09/2026) — a decisão inteira, com a conta,
   mora em `mente/formas.md` §V1 e em `mente/v1-desenho.md`. Aqui só o
   resumo que explica por que os valores abaixo mudaram outra vez.

   1. A direção da tela de jogo passa a ser a que a pessoa desenhou:
      Figma `ffWFqD7TueSb88Mkeg9bhW`, quadro `126:5 · taverna-gameplay-v3`
      (1280×912). Nas palavras dela: "muito mais cara de game e muito
      mais bonito".
   2. A página castanha morre: sobre ela todo acento perdia 33% do
      contraste que tem sobre o poço (âmbar 10,61 → 7,15; ciano 8,72 →
      5,88), e dois dos quatro acentos da v3 reprovavam AA como letra —
      rosa 4,29, violeta 4,14. A paleta da pessoa não cabe numa página
      castanha; cabe num poço.
   3. A prosa, no corpo com o ambiente por cima: pior 13,59, média
      13,85, melhor 14,15 — cai exactamente na régua do Material 2 para
      texto de alta ênfase, 14,22.
   4. O violeta `#9B5DE5` da v3 reprova como letra (3,81 sobre o
      erguido); erguido no mesmo matiz até `#AC79E9`, que dá 4,99 em
      letra e 5,93 sob `onSecond` — 10% de folga.
   5. `paginaFio` viveu no fio `#695DA4` até V1b separar o contorno
      decorativo (`line`) do controlo (`lineStrong`); aposentou-se aí.
   6. Três pares colam nos daltonismos, e a defesa é regra e não
      paleta: mundo×violet em deuteranopia (ΔE 8) — glifo e morada
      fixos; rosa×danger em tritanopia (ΔE 10) — rosa nunca ao lado de
      danger, e danger nunca sem glifo; amber×mundo em tritanopia
      (1,01 de luz) — moram em metades opostas da cinta.
   ============================================================

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

   (Os valores desta nota são os de R2; os de hoje estão na nota V1
   acima.)
   ============================================================ */
export const T = {
  /* ============================================================
     A MESA À LUZ DE VELA (C) — 04/11/2026, a ordem da pessoa: «o que temos
     hoje ainda não é um jogo… precisamos de uma casca pro nosso rpg». A
     noite fria da v3 (#12101F, o ciano, o rosa neon) sai; entra a madeira
     quente, a brasa, o musgo, o azul frio e o lacre. Os nomes ficam — o
     código inteiro os lê. Desenhado pelo `desenho` no Figma («Mesa C ·
     04/11», a coleção `T · Mesa C (vela)`), com o contraste de cada par
     em `mente/formas.md` §«A mesa à luz de vela (C)» §2. A v3 continua no
     backup e no Figma (`126:5`), se a pessoa a quiser de volta.
     ============================================================ */
  /* A MESA — madeira escura e quente (h≈25). Recua: cinta, trilho, bastidor. */
  /* 05/11 · O FELTRO (a pessoa: «não gostei muito do novo design da parte de
     madeira, talvez a textura»; escolheu o feltro verde). A madeira fazia
     riscas: o ruído era anisotrópico. formas.md §AAA §14. */
  bg:         "#12241B",   /* o feltro verde-escuro — ink 13,24 · inkDim 5,98 (5,38 sob a vela) */
  panel:      "#251A12",   /* a cinta, o trilho, o campo — ink 13,87 · danger 5,35 */
  panelSoft:  "#33251A",   /* o erguido — ink 12,07 · inkDim 5,45 · lineStrong 3,65 */
  line:       "#4D3A29",   /* divisória decorativa — 1,70 contra a madeira */
  lineStrong: "#96795A",   /* a borda de CONTROLO — 4,52 bg · 4,19 panel · 3,65 panelSoft */

  /* O LIVRO — o couro da capa e o chão da bandeja */
  pagina:     "#1A0F0B",   /* o couro — ink 15,60 · amber 8,89 · danger 5,91 */
  paginaAlta: "#33251A",   /* = panelSoft, de propósito (a suíte prende) */

  /* A TINTA CLARA — a letra sobre madeira e couro */
  ink:        "#F2E7D2",   /* 15,60 pagina · 13,87 panel */
  inkMeio:    "#D2C0A4",   /* a segunda voz — e o OSSO do dado de uso */
  inkDim:     "#AE9A80",   /* o rótulo — 5,45 panelSoft (o pior) */

  /* OS ACENTOS — a brasa, o arcano, o frio, o lacre; cada um com UM trabalho */
  amber:      "#F0A23B",   /* a brasa: a decisão e o herói — 8,04 panel */
  amberSoft:  "#F8CB85",   /* o âmbar em letra — 9,77 panelSoft */
  onAccent:   "#1E1207",   /* sobre o âmbar 8,68 · danger 5,77 · ok 9,69 · osso 10,32 */
  violet:     "#A89FE3",   /* a magia — lilás de vela, saturação caída: 6,15 panelSoft */
  violetSoft: "#CBC5F2",   /* a magia em letra — 10,37 panel */
  onSecond:   "#141022",   /* sobre o violeta 7,75 */
  mundo:      "#7DB9DC",   /* o azul frio: a informação e o convite — 6,93 panelSoft */
  mundoSoft:  "#B5DAEE",   /* a voz do mundo — 11,52 panel */
  onMundo:    "#0A1620",   /* sobre o azul 8,57 */
  rosa:       "#C9737E",   /* o lacre, a tua mão — marca, nunca chão de letra */

  danger:     "#E86A4F",   /* o vermelho queimado — 4,65 panelSoft (o pior) */
  ok:         "#A6C77E",   /* o verde musgo: o sucesso e a cura — 8,98 panel */
  /* O CHÃO DE UM SELO DE ESTADO — o verde e o vermelho muito escuros por
     baixo de `ok` e de `danger` (cor é número, logo é tabela). */
  okFundo:             "#1F2A15",   /* ok sobre ele 7,92 */
  perigoFundo:         "#3A1A12",   /* danger sobre ele 4,94 */

  /* NOVO (AAA · 05/11) · O COURO da borda da mesa e dos painéis do ecrã do Mestre */
  couro:      "#33200F",   /* chão de painel — ink 12,65 · inkDim 5,71 · danger 4,88 */
  couroAlto:  "#4A2F1C",   /* o lume do couro: só gradiente, nunca chão de letra (danger 3,85) */
  couroBaixo: "#24160D",   /* a borda da mesa */

  /* NOVO (Mesa C) · A FOLHA — o pergaminho onde a narração mora. Na folha
     só há tinta: cartões, chips e ofertas ficam na paleta da mesa, pousados
     por cima. Todas ≥ 4,5 mesmo no pior ponto da vinheta. */
  pergaminho:            "#E9DCC0",   /* 13,50 contra a madeira */
  pergaminhoBorda:       "#C7AE84",   /* a vinheta da borda — só gradiente, nunca chão de letra */
  tintaDoPergaminho:     "#2A1C11",   /* a prosa — 12,15 · pior 8,74 */
  tintaDoPergaminhoMeio: "#4F3B28",   /* a fala do jogador — 7,78 · pior 5,60 */
  tintaDoPergaminhoDim:  "#5A4632",   /* o rótulo na folha — 6,56 · pior 4,72 */
  brasaNoPergaminho:     "#7A3307",   /* o lugar, a capitular — 6,71 · pior 4,83 */
  perigoNoPergaminho:    "#8A2414",   /* 6,60 · pior 4,75 */
  musgoNoPergaminho:     "#33521C",   /* 6,54 · pior 4,71 */
  azulNoPergaminho:      "#1F4872",   /* 6,94 · pior 4,99 */
  lacreNoPergaminho:     "#7E2A3C",   /* a cera do selo */
  /* NOVO (TP · 09/11) · o nome apontado na prosa: o rosa da tua mão a 30 %
     sobre o pergaminho (Figma VariableID:327:3) — tinta 9,37 · lacre 5,22 */
  marcaNoPergaminho:     "#DFBCAC",
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
   `LUZ_DA_CENA` APOSENTOU-SE EM V5a (25/09/2026) — e com ela a gravura.

   Eram as quatro receitas de cor da xilogravura do topo do papel
   (`O rosto da cena`, R13-B): céu, chão, talho, astro, por luz. A pessoa
   tirou a gravura da tela (*"deixar exatamente igual à imagem do
   Figma"*) e a tabela ficou sem nenhum leitor — o único era
   `rosto-da-cena.jsx`, que saiu inteiro. `O TEMPO` (V3c) NÃO a lia: lê os
   NOMES das luzes (`luzDaHora`, agora em `hora-e-prazo.js`), nunca as
   cores. Os pisos, as medições e a história estão em `mente/formas.md`
   (R13, R15) e no `git`; a coleção do Figma ficou marcada como
   aposentada, sem apagar, para os pares antigos continuarem legíveis.
   ============================================================ */

/* ============================================================
   V5a · A RUNA, O CABEÇALHO DA PÁGINA E O FLOREADO — o `129:4` e o
   `129:32` da pessoa (Figma `ffWFqD7TueSb88Mkeg9bhW`), em tabela.

   A ORDEM FOI DIRETA: *"deixar exatamente igual à imagem do Figma"*.
   Então cada número abaixo é o do nó, lido no `get_design_context` e na
   API do Figma — nenhum foi afinado a olho — e a suíte
   (`teste-v5a-cabecalho.mjs`) refaz a soma que o nó mede: 20 + 13 + 12 +
   8 + 16 = **69 px**, a altura do `parchment-header`.

   A RUNA É UMA FORMA SÓ: traço curto, três pontos, traço longo. É a do
   cabeçalho, a do corpo (`ornamental-divider`, `129:20`), a do rodapé
   (`129:33`) e a das telas de criação (`135:330`) — a mesma peça no
   Figma quatro vezes, e `DivisoriaRunica` (`ui.jsx`) uma vez no código.
   Os pontos saem de `T` POR NOME (a luz, o mundo, a tua mão — o mapa de
   V1 §6), e o traço é `amber` a 0,2: **1,48:1** contra o poço, e é
   decorativo de propósito (não carrega informação, e a 1.4.11 não o cobre).

   A LETRA DO CABEÇALHO É 10, ABAIXO DE `TIPOS.piso` (12) — e é EXCEÇÃO
   ESCRITA, não esquecimento. A pessoa pediu o nó ao pixel, e o nó tem 10.
   O que a torna legível, medido: são MAIÚSCULAS de JetBrains Mono, e a
   altura de maiúscula a 10 px é maior do que a altura-x da letra da máquina
   a 12 (`TIPOS.maquina`) — a medida que o olho lê numa palavra curta; e o
   contraste é **10,61:1** (âmbar, o lugar) e **6,60:1** (`inkDim`, a luz),
   os dois acima de AA. São duas etiquetas, nunca prosa nem controlo — nada
   ali se toca. E a da esquerda é a MORADA do lugar (era a legenda da
   gravura desde R13-B; antes disso, o painel do tempo): por isso o lugar
   leva o âmbar, a 10,61:1, e a da direita, que repete o que `O TEMPO`
   já diz, leva a tinta discreta.
   `check-formas` (D5g) conta
   `text-[Npx]` e esta letra não passa por lá: vem desta tabela, com o
   motivo ao lado — a catraca não subiu, e a exceção não se esconde.
   ============================================================ */
export const RUNA = {
  fio: 40,          /* o traço curto, antes dos pontos */
  ponto: 8,         /* o diâmetro de cada ponto — e a altura da runa */
  passo: 16,        /* de centro a centro: três pontos cabem em 40 (4 · 20 · 36) */
  espaco: 12,       /* entre o traço curto, os pontos e o traço longo */
  alfaDoFio: 0.2,   /* os dois traços: `amber` a 0,2 */
  espessura: 1,     /* os dois traços: 1 px (o `h-px` do nó) */
  pontos: ["amber", "mundo", "rosa"],  /* por NOME de T — a luz, o mundo, a tua mão */
  glifoDeOuvir: 14,     /* V5 · o glifo do botão de ouvir, na ponta da runa que abre uma resposta (o de R2) */
  /* O AR DA RUNA SOLTA: quando ela separa seções (as oito da criação do
     mundo), leva 8 px acima e abaixo — o mesmo `py-2` da divisória de
     v9.173, para aquelas telas não mudarem de ritmo. Dentro do cabeçalho
     e no fim da página vai a 0: ali quem dá o ar é o vizinho. */
  respiro: 8,
  /* 07/11 · TL 8 · a runa na página de pergaminho (Figma 307:811): fio 10 em
     pergaminhoBorda, losango 7 em brasaNoPergaminho, 8 entre eles */
  naFolha: { fio: 10, espaco: 8, losango: 7 },
};

export const CABECALHO_DA_PAGINA = {
  cima: 20,         /* `pt` do 129:4 */
  baixo: 16,        /* `pb` */
  lado: 24,         /* `px` — medido da BORDA do cartão, porque o fio dele é por dentro */
  entre: 12,        /* entre a linha das etiquetas e a runa; e o mínimo entre as duas etiquetas */
  letra: 10,        /* JetBrains Mono 10 — abaixo de TIPOS.piso, EXCEÇÃO escrita acima */
  linha: 13,        /* a altura da linha das etiquetas (o `leading normal` do nó mede 13) */
  espacamento: 1.8, /* o rastreio da etiqueta do lugar, em px (0,18 em); a da direita não tem */
};

/* O FLOREADO (`129:40`): quatro barras de 4 px, 4 px entre elas, pousadas
   pela base — âmbar no canto esquerdo, `mundo` no direito. Mora no FIM DA
   PÁGINA, na mesma linha da runa, dentro do ar que o fim do registro já
   tinha: custa **0 px** de prosa (a decisão está em `formas.md` §V5a). */
export const FLOREADO = {
  barra: 4,
  espaco: 4,
  esquerda: [12, 20, 16, 14],   /* `amber` */
  direita: [14, 18, 12, 16],    /* `mundo` */
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

/* V3b · O LADRILHO DO ASSUNTO — a casa de cada fala do sistema: a linha do
   registo da v3 (`47:2`, a pessoa desenhou-a a 36 com glifo de 16 e raio
   12). Entre o ladrilho e a frase, 12. O ladrilho NUNCA é o alvo: quando a
   linha abre uma sala, é a linha inteira que é botão, a `ALVOS.piso`. */
export const LADRILHO = { lado: 36, glifo: 16, raio: 12, espaco: 12 };

/* ============================================================
   O CAMPO DO TURNO (R17, §19 de `formas.md`) — a altura da peça mais
   usada do jogo, e só na COLUNA ESTREITA.

   A DOENÇA, medida pelo `desenho` e confirmada no DOM ao vivo: o campo
   dividia a linha com três alvos fixos (`IconeBalao`, a gaveta ✦ e o
   verbo), cada um a custar `piso + espaço` = 56 px. Três × 56 = 168 numa
   linha de 343 — **metade da linha** —, e ao campo sobravam **129,1 px**
   de largura por 64,8 de altura: o jogador via ~29 dos 93 caracteres que
   escrevia. **31 %.** Na mesa via 100 %.

   A LEI QUE SAI DAQUI (§19): *numa coluna estreita, uma linha leva no
   máximo UM alvo fixo além do que cresce.* Por isso a linha parte-se em
   duas e o campo fica sozinho na de cima.

   O CUSTO NÃO É PERMANENTE, E ESTA É A EMENDA QUE APAGOU UM PISO DE 90.
   A primeira versão desta tabela deu ao campo um piso de 90 px em TODOS os
   turnos. O `jogo` emendou-se a si próprio: *o campo e a prosa nunca
   disputam a mesma atenção — quando ele escreve, não lê; quando lê, o campo
   está vazio.* Os 90 px respondiam a "que altura precisa para caber o que
   ele escreve?" e estavam a responder a "que altura deve ter sempre?".
   Medido: 81 px permanentes levavam a página de 306 para 224,7 — 37 % abaixo
   do piso da prosa. Com a altura condicional a página fica acima de onde
   estava, e sem depender de mais nenhuma etapa.

   POR ISSO ESTA TABELA DIZ RELAÇÕES E NÃO DOIS NÚMEROS:
     · o REPOUSO não é número novo — é `ALVOS.piso`, o piso de tudo nesta
       casa. Um campo vazio não precisa de três linhas, e R3 nunca pediu
       três: R3 acusou 35 px, ABAIXO de 48. Uma linha ao piso é a correcção
       de R3, não a sua reversão.
     · o TECTO é a altura do momento em que ele escreve, e sai da entrelinha
       medida no DOM (24,38 px): 138 − 16 de enchimento − 2 de fio = 120,
       que são CINCO linhas. Acima disso o campo rola dentro de si em vez de
       empurrar a página.

   E O CRESCIMENTO É UM SALTO, NUNCA UMA RAMPA: ao ganhar foco vai direito
   ao tecto e não passa pelo meio. *Um crescimento por passos é um leiaute a
   tremer; um crescimento por salto é uma resposta.* Crescer à medida que ele
   escreve moveria a página a meio de uma frase, que é o que a regra do
   `jogo` proíbe. O movimento nasce do toque que o próprio jogador acabou de
   dar — é a única espécie de movimento que esta casa nunca teve de
   justificar —, e com `prefers-reduced-motion` é instantâneo.

   E A TROCA DE COLUNA É CSS, NÃO JAVASCRIPT: zero `matchMedia`, zero
   re-render, e funciona quando o jogador roda o telefone a meio do turno.
   É a mesma escolha de `A soleira` (`ui.jsx`), e pela mesma razão.
   ============================================================ */
export const CAMPO_DO_TURNO = {
  /* o REPOUSO não mora aqui de propósito: é `ALVOS.piso`, e um número que
     já tem casa não ganha uma segunda. */
  tecto: 138,          /* cinco linhas: o momento em que ele escreve */
  entrada: 120,        /* ms — a duração que a folha já usa em toda a casa */
  colunaEstreita: "(max-width: 767px)",  /* a régua `coluna` de §9 */
};

/* ============================================================
   V6 · O DADO — o gesto que compromete o turno, e o único dado da tela.

   A FORMA é o `btn-send-d20` da pessoa (`126:117`): redondo de 48, âmbar
   cheio, a sombra âmbar por fora (0 0 8, a 0,25) e o reflexo por dentro
   (inset 0 1 1, a 0,25 — o branco do nó é o `ink` da casa). O GLIFO é o d20
   de V3 (o icosaedro), e não o d6 que a v3 desenhou: um jogo de d20 com um
   d6 no botão de agir diz o dado errado (o `jogo`, V6 D1).

   OS CINCO ESTADOS (o `jogo`, `mente/v6-jogo.md` §B; a conta é
   `estadoDoDado`, glifos.js):
   - REPOUSO: contorno âmbar, o glifo a 0,55 (3,82:1 sobre o fundo — acima
     dos 3:1 de um gráfico, WCAG 1.4.11). O toque foca o campo.
   - PRONTO: cheio e aceso. O toque envia (= Enter).
   - LANÇADO: o quarto de volta do glifo, em `lancado` ms, e nada com reduce.
   - À ESPERA: contorno `lineStrong` (3,90:1), glifo `inkDim`. Não envia; o
     Enter dá UM pulso de `pulso` ms (nenhum com reduce).
   - ROLAR: cheio, com a dificuldade na face; os pulsos de `MUDOU_AGORA` ao
     aparecer, e pára. O toque abre o véu do dado.
   ============================================================ */
export const DADO = {
  glifo: 24,              /* o `d20-die` do nó (24) */
  borda: 1.5,             /* o contorno do repouso e da espera */
  brilho: 8,              /* a sombra âmbar da v3, por fora */
  alfaDoBrilho: 0.25,
  alfaDoBrilhoAceso: 0.6, /* o topo dos pulsos do Rolar */
  alfaDoReflexo: 0.25,    /* o brilho por dentro (inset 0 1 1) */
  alfaApagado: 0.55,      /* o glifo do repouso */
  alfaDaFace: 0.35,       /* o d20 por trás do número, no Rolar (decoração: o número é que diz) */
  lancado: 300,           /* ms — o quarto de volta (≤ 300, o `jogo`) */
  pulso: 400,             /* ms — o pulso único do Enter na espera */
  pausaDoRascunho: 400,   /* ms — o rascunho guarda-se a cada pausa de escrita (o `jogo`, §1) */
  /* o d20 da casa rolando (`.tv-dice`: a espera, o véu, a lenda), PARADO com
     reduced-motion: escurecido, e não apagado — é o que separa o "a rolar" do
     resultado no véu, onde o número continua trocando por JavaScript (o aviso de
     D5c: a saída do dado a rolar não pode ser só `none`) */
  rolandoParado: 0.7,
};

/* V6 · A PÍLULA DO COMPOSITOR — o `custom-input-field` da pessoa (`126:113`):
   raio 24, o fundo do chão (`bg`) e a borda SEMÂNTICA (violeta com
   habilidade armada, âmbar com milagre, o fio `line` sem nada — a v3
   pinta-a violeta sempre, e isso apagaria o sinal de armada: V6 D5). O
   compositor fica a `fundo` px do pé da tela, com ou sem teste pendente (o
   cartão do teste saiu: o teste é a linha do veredito, por cima do campo). */
export const COMPOSITOR = {
  raio: 24,
  borda: 1.5,
  fundo: 20,
  /* V6 · a prova jogada (`v6-jogo.md` §7): o anel de 3 px de `ink` (14,8:1) era a
     linha mais clara da tela e pesava mais que o botão da soleira. 2 px de
     `lineStrong` (4,16:1 sobre o fundo) continua cumprindo a WCAG 2.4.11. */
  anelDoFoco: 2,
};

/* ============================================================
   A CINTA (R13, etapa A) — o topo do telefone, em px.

   Ela substitui TRÊS faixas (o cabeçalho, a barra de estado e a fita de
   prazos): **334 px trocados por 48**. Os números não são gosto — são
   uma conta que fecha, e é por fecharem que moram numa tabela onde a
   suíte os pode somar de volta:

       375 úteis − 24 de enchimento = 351
       a ficha : medida no DOM, com a cinta no ar            = 194
       o tempo : medido, com "3 noites +1"                   = 145
       folga   : 351 − 194 − 145                             =  12

   ESTES NÚMEROS SÃO MEDIDOS E OS ANTERIORES ERAM ORÇADOS, E A DIFERENÇA
   FOI GRANDE: o `desenho` escreveu ficha 186 e tempo 98, e a régua deu
   **194 e 145**. O tempo estava **47 px optimista** — o selo mede 76 e
   não 53 (a ampulheta 12 + 4 + "3 noites" 60), e o `+N` mais o respiro
   custam outros 20 que ninguém tinha somado. *É o mesmo erro do
   orçamento VERTICAL, cometido no eixo que sobrou: uma conta que
   ninguém soma não está provada, está escrita.*

   O ENCHIMENTO CONTINUA 12 E NÃO 16 — agora por uma razão maior do que
   a folga: com 16 a linha não CABE no pior caso (ver a catraca).

   A CATRACA DA SOMA, e ela guarda o pior caso e não o típico:

       2 × enchimento + fichaMinima + tempoMaximo  ≤  375
       24             + 170         + 174          =  368     ✓ 7 px

   `tempoMaximo` é a última noite: o selo ENCHE e passa de 76 a 105
   (`esta noite` em negrito, 72, mais 16 de enchimento do chip), e o
   tempo vai a 174. Com a ficha nos 194 medidos isso dá **392 num ecrã de
   375** — a cinta transbordava na única noite em que ela mais importa, e
   ninguém o tinha visto porque ninguém somou o pior caso.

   QUEM CEDE É A FICHA, E A RAZÃO É DE SIGNIFICADO, NÃO DE ESPAÇO:
   **o comprimento de um trilho é uma RAZÃO, não uma medida** — um
   trilho de 40 px diz exactamente o que um de 56 diz, porque o que
   informa é a fracção cheia. Já `esta noite` não encolhe sem mentir.
   Por isso `trilho` tem um mínimo e `fichaMinima` existe.

   E O RÓTULO DO GUARDADO NÃO CABE NO TELEFONE — EM ESTADO NENHUM.
   Medido com a fonte carregada: `✓ guardado` pede **74 px**, `guardado`
   pede **58**, e a folga a 375 px é **12**. Nenhuma das três saídas
   propostas (encolher o rótulo, o tempo ceder 7 px, o telefone assumir a
   varredura) resolve as duas primeiras — porque o buraco não é de 7 px,
   é de 62. **Fica a terceira, e fica por conta e não por limiar:** o
   rótulo entra quando `folga ≥ rotuloDoGuardado + 2 × respiroDoRotulo`,
   o que dá `larguraParaORotulo` = 445 px. Abaixo disso é a varredura da
   marca da chapa sozinha, que é a camada que já estava escrita como
   degradação da peça. *Uma peça que diz como se degrada é uma peça
   acabada — e esta agora diz a partir de que largura.*

   `alturaViva` É DE PROPÓSITO, e a regra é do `jogo`: *o que não cabe
   numa linha calma é exactamente o que tem de interromper.* Um estado
   vivo faz a cinta crescer para 72; os 24 px saem da página e voltam
   quando o estado passa. Medido em R6: um estado vivo, num turno, em
   vinte.
   ============================================================ */
export const CINTA = {
  altura: 48,        /* Estado=Calma e Estado=Prazo a apertar */
  alturaViva: 72,    /* Estado=Um estado vivo — a segunda fila dos chips */
  enchimento: 12,    /* lateral, e não 16 — ver a conta acima */
  ficha: 194,        /* o alvo da esquerda, MEDIDO: rosto · PV · PM · bolsa */
  fichaMinima: 170,  /* com os trilhos no mínimo — quem cede é sempre ela */
  /* A1 (10/10): a hora cheia encolheu o alvo da direita. MEDIDO no navegador, a
     375, mono 12 Bold: `08:26` 36 px → `18h` 21,6 px (o pior caso, dois
     algarismos; `8h` 14,4). O tempo era 145 com a hora antiga; menos 14,4 é
     130,6, e arredonda-se PARA CIMA, que é o lado do pior caso: 131. Os
     números que saem dele (a folga, o limiar do rótulo, o tempo máximo)
     refazem-se com ele, cada um com a conta escrita. */
  tempo: 131,        /* o alvo da direita, MEDIDO: a hora · O selo · o +N */
  tempoMaximo: 160,  /* a última noite: o selo enche e passa de 76 a 105 (174 − 14,4 da hora cheia, para cima) */
  trilho: 56,        /* PV e PM em repouso */
  trilhoMinimo: 40,  /* o comprimento é uma razão, não uma medida */
  folgaMinima: 26,   /* 375 − 24 − 194 − 131, MEDIDO e não orçado (era 12 com a hora `08:26`) */
  larguraParaORotulo: 422,  /* 24 + 194 + 131 + 74 − 1 — abaixo disto, só a varredura (era 436 com a hora antiga).
     O RESPIRO NÃO É TERMO DESTA CONTA, e isso é decisão e não esquecimento:
     o rótulo CENTRA-SE na folga, logo os pixels que sobram distribuem-se
     sozinhos à medida que o ecrã cresce. No limiar exacto ele tem 0 de cada
     lado; um pixel acima, 1 de cada lado. Pedir respiro ao limiar seria
     contar duas vezes o mesmo espaço. */
  /* O ROTULO DO GUARDADO, MEDIDO NO NAVEGADOR E NÃO ESTIMADO: 74 px.
     `✓ guardado` em JetBrains Mono a `TIPOS.maquina`, com a fonte
     carregada (`document.fonts.check` verdadeiro) e lido por
     `scrollWidth` — a conta à mão dava 72, e a régua dá 74. **Não cabe
     nos 67 da folga**, e é por isso que este número vive aqui: é dele
     que sai o limiar em que o rótulo se esconde (`.tv-guardado-rotulo`,
     na folha), e um limiar afinado a olho mentiria no dia seguinte. */
  rotuloDoGuardado: 74,
  /* V4 · A COMPOSIÇÃO DA v3 (`126:6`, a cinta da pessoa), com os desvios que o
     `jogo` mediu (`mente/v4-jogo.md`): a altura fica em `altura` (48, não os
     66 do nó) e a composição entra por inteiro — quem vocês são à esquerda, o
     mundo ao centro, o que se gasta à direita. */
  espaco: 8,             /* entre os três blocos da linha */
  respiro: 7,            /* o mínimo que a linha guarda livre (o `jogo`, §4): sem ele cabe ao pixel e lê-se colado */
  perto: 4,              /* entre o herói e o cacho do grupo, no telefone */
  entreRetratos: 18,     /* na mesa, de cada lado do fio que separa dois retratos (o `gap` do nó) */
  separador: 24,         /* a altura desse fio (a `Line` de 24 do nó) */
  fioDoSeparador: 1,     /* e a espessura dele */
  entreAnelERotulo: 8,   /* o `gap` do nó entre o anel e o nome */
  linhaDoRotulo: 16,     /* duas linhas de 12 (nome · PV) em 32 dos 48 */
  entreContadores: 16,   /* a bolsa e o PM lado a lado, na mesa (o `gap` do nó) */
  entreNumeroEGlifo: 6,  /* `1.240 ◉` — o número primeiro, como no nó */
  coroa: 16,             /* o disco da coroa, no canto de cima-esquerda do herói */
  glifoDaCoroa: 10,      /* a coroa dentro dele (o `crown` de 10 do nó) */
  /* o alvo do cacho, quando ele é UM anel de 28: a área invisível que o leva a
     48 (`ALVOS.piso`) come o espaço dos lados — 12 à esquerda (os 4 de `perto`
     e 8 da margem direita do alvo do herói, que continua com 56) e 8 à direita
     (os 8 de `espaco`). 28 + 12 + 8 = 48, sem um pixel de leiaute. */
  alvoAlem: { esquerda: 12, direita: 8 },
  /* o pedido de abrir o Grupo NO CARTÃO de um companheiro vale este tempo (ms):
     depois dele, reabrir a sala por outro caminho não salta para o cartão velho */
  pedidoFresco: 1500,
  /* a pílula do tempo, na mesa: o `location-section` do nó (raio 20, 16 dos
     lados, 6 em cima e em baixo, 12 entre as partes). No telefone ela é NUA —
     a moldura custaria 34 px que o pior caso a 375 não tem (`formas.md` §V4). */
  pilula: { raio: 20, lado: 16, cima: 6, entre: 12, entreTelefone: 7 },
  mesa: "(min-width: 768px)",  /* o corte da casa (o `md:` do Tailwind), dito por extenso */
  palavraCurtaAbaixoDe: 360,   /* abaixo disto, `esta noite` diz-se `hoje` (só a 320 o pior caso não cabe) */
  /* A1 · A HORA CHEIA (`formas.md` §A1 5): a pílula diz `8h`, e não
     `08:10`. Era a peça que mais aparecia no ANTES (9 de 50) e com ela
     ninguém decidiu nada; o que decide no tempo (o prazo em noites, a
     loja, esperar 6h) mede-se em hora e em noite. O minuto mora em O
     TEMPO, no toque. A conta é `horaNaCinta` (glifos.js). */
  passoDaHora: 60,
};

/* ============================================================
   V4 · O ANEL — o PV de uma pessoa do grupo, à volta do rosto dela.

   A FORMA É A DA v3 (`126:9`–`126:12`): um trilho de `panelSoft` e um arco de
   ~3 px por fora, que começa no alto e anda no sentido do relógio; o rosto
   dentro, a 4 px da borda. O arco é o canal PRIMÁRIO (comprimento); a cor é o
   segundo: `amber` em calma, `danger` em grave — **1,52:1 em cinzento**, o
   par que o `jogo` escolheu contra o ciano do nó (1,25), que em
   deuteranopia dava 1,00 de luz (`formas.md` §V1.7).

   QUATRO ESTADOS, e nenhum se diz só pela cor: *calma* (arco âmbar),
   *grave* (≤ `grave` do PV: arco curto e vermelho, rosto grave), *ferida
   agora* (o arco SALTA para o comprimento novo e o pedaço perdido fica
   desenhado a `danger` — aceso `aceso` ms, se apagando até `perdido`) e
   *tombado* (vida 0 ou morrendo: sem arco, rosto apagado a `apagado` e um
   traço diagonal de `traco` px — lê-se em cinzento).

   O TEMPO: curar faz o arco crescer em `cura` ms; ferir não anima o arco (o
   pedaço perdido é que conta). Entrar em grave, e cada ferida nova enquanto
   grave, dá TRÊS pulsos (`MUDOU_AGORA`) e depois repouso — o pulso infinito
   de v9.160 morreu aqui. Com `prefers-reduced-motion`: o arco salta, o
   pedaço perdido aparece parado a `alfaParado`, e não há pulso nenhum.
   ============================================================ */
export const ANEL = {
  heroi: 40,        /* o herói, nas duas telas — a primeira leitura */
  mesa: 32,         /* um companheiro, na mesa */
  telefone: 28,     /* um companheiro, no telefone */
  aro: 3,           /* a largura do arco (3,15 no nó de 42) */
  folga: 1,         /* entre o arco e o rosto */
  sobreposicao: 8,  /* os anéis do grupo no telefone pousam uns sobre os outros */
  recorte: 2,       /* e um contorno da cor da cinta separa cada um do de baixo */
  grave: 1 / 3,     /* a régua do grave — a mesma de v9.160, agora num sítio só */
  cura: 400,        /* ms: o arco cresce */
  aceso: 250,       /* ms: o pedaço perdido aceso */
  perdido: 750,     /* ms: e apagado de todo (o mesmo tempo de v9.160) */
  alfaParado: 0.5,  /* o pedaço perdido parado, com movimento reduzido */
  traco: 2,         /* o traço do tombado */
  barra: 0.18,      /* de onde a onde ele vai: de 18 % a 82 % do anel, na diagonal */
  apagado: 0.35,    /* o rosto de quem tombou */
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
/* ------------------------------------------------------------
   R15 — O TETO DE CAMPOS DA OFERTA, e é lei nova pela razão oposta
   àquela que se esperaria.

   A `Oferta` de R1 tem TRÊS campos na tela (o verbo, o preço, o
   retorno) e foi desenhada quando a soleira era **55 % do ecrã**.
   Depois de R13 ela é **14 %**, e a página passou de 151 px para 586.
   *O orçamento que a apertava deixou de existir.*

   O QUE ISSO NÃO AUTORIZA É ENCHÊ-LA. R6 mediu que tomar uma oferta
   custa 990 ms contra 10,7 s por frase escrita — um ganho de 10x — e o
   caminho mais curto para o deitar fora é transformar a soleira num
   painel de botões, que é o point-and-click que a medida existe para
   apanhar. **Espaço que sobra não é convite; é margem.**

   O QUARTO CAMPO ENTRA POR UMA PENEIRA, NÃO POR CABER. A peneira é do
   `jogo`: *a soleira é o que o jogador perde se não agir agora.* Uma
   peça cuja razão de existir é a perda **tem de dizer quanto tempo
   falta**, e a de hoje não diz — medido em R6: a oferta do Yorick
   esteve viva **quatro turnos** e a tela nunca disse que eram quatro.

   Por isso `camposDaOferta` é **4** e é um TETO: verbo · preço ·
   retorno · janela. O quinto campo faz a oferta deixar de se ler de
   relance e passar a ser um formulário. É varrível, e por isso é lei.
   ------------------------------------------------------------ */
export const SOLEIRA = {
  tetoNaMesa: 2,
  tetoNoTelefone: 1,
  camposDaOferta: 4,
  /* V3c · A COLUNA DO DINHEIRO NA MESA. Com duas ofertas lado a lado (o teto
     da mesa), o número que se compara é o dinheiro, e ele tem de cair na
     mesma coluna (v3c-jogo.md §1: eram 8 px de desvio). A janela passa a
     ter lugar fixo NA MESA — a largura do selo mais largo, *Esta noite* /
     *Este turno* cheio, medido 106,4 px; 108 é o degrau de 4 acima — e o
     dinheiro alinha à direita contra ele. Custa 0 px de altura (a mesa tem
     uma fila só). No telefone não se reserva nada: lá o teto é 1 e não há
     o que comparar, e a lei de R15 (*Janela=Nenhuma não deixa buraco*)
     continua de pé. */
  janelaNaMesa: 108,
  /* V3c · O PISO DE `quem · onde`: abaixo de um nome, a tinta não diz nada
     (medido pelo `jogo` a 375: *"a…"*, 1 px de largura). 14ch é o prefixo
     (`assina `, 7) e mais sete letras de um nome. Com o piso, quem não cabe
     ao lado do verbo desce para a fila do dinheiro, que tem lugar desde que
     XP e fama saíram da soleira — medido a 375: nenhuma oferta ganhou fila
     nem altura (86 · 86 · 86 · 107 · 86 · 86), e `quem` mede ≥ 171 px em
     todas (antes, até 1 px). */
  quemMinimo: "14ch",
};

/* ============================================================
   O ESBATIMENTO (R15) — a região que rola por baixo de uma cabeça fixa.

   A DÍVIDA QUE ISTO PAGA, declarada pelo `oficial` com a medida feita:
   a primeira linha da prosa **corta-se ao rolar sob a gravura**. Não é
   sobreposição (medido: `sobrepoe: false`) — é uma região que rola sob
   uma cabeça fixa, e era igual antes contra a borda do papel. *Só que
   agora a cabeça é uma imagem, e uma linha meio engolida por um desenho
   lê-se pior do que meio engolida por uma borda lisa.*

   E A PRIMEIRA COISA A DIZER É O QUE UM ESBATIMENTO É, porque isso
   decide tudo o resto: **não é decoração, é uma região declarada
   ILEGÍVEL.** Uma máscara de alfa sobre texto não o adoça — apaga-o por
   graus. Logo a altura dele é o seu custo, e a lei que o rege não é
   estética:

       NUNCA PODE ESCONDER UMA LINHA INTEIRA.

   O NÚMERO SAI DE DUAS MEDIDAS E DE NENHUM GOSTO:

   1. **0,52** (V1; era 0,54 sobre a página de R2) — `T.ink` composto a
      alfa `a` sobre o pior ponto do corpo (poço + ambiente a 55%, hoje
      13,59:1) cai a 4,5:1 exactamente em `a = 0,520` (sobre o poço nu,
      sem ambiente, seria 0,505). Logo a banda ilegível de um
      esbatimento de altura `h` é `0,52 x h`.
   2. **27,6 px** — a entrelinha da prosa (`TIPOS.prosa` 17 x 1,625, o
      `leading-relaxed` que a tela já usa), e é a régua de R13.

   O TETO, ENTÃO, É UMA CONTA QUE A SUÍTE REFAZ:

       alfaAA x altura  <  entrelinhaDaProsa / 2
       0,52   x   24    =  12,48  <  13,8                ✓ (V1; era 12,96)

   **24 é o maior inteiro par abaixo do teto de 25,6.** Não é gosto: é o
   teto menos o arredondamento. Acima dele uma linha pode ficar mais de
   metade dentro da banda ilegível; muito abaixo dele (< 12) um
   gradiente deixa de se ler como esbatimento e volta a ser uma borda,
   só que desfocada — **que é o defeito original com mais um passo.**

   E O NÚMERO ENCONTROU-SE COM OUTRO QUE JÁ LÁ ESTAVA. A região da prosa
   tem `py-6` — **24 px** de enchimento no topo, hoje, sem esta tabela.
   Com o esbatimento à mesma altura, em `scrollTop = 0` ele cobre
   **apenas enchimento**: a primeira linha do primeiro turno nasce à
   luz inteira, e a peça custa **zero px** de página e zero deslocamento.
   *Duas contas independentes que caem no mesmo número é a melhor prova
   que este ciclo tem — e foi a segunda vez neste projecto.*

   COMO SE DEGRADA, e nenhum destes casos dá buraco:
   - `prefers-reduced-motion` — nada muda, porque nada se move. Um
     esbatimento não é animação: é uma borda com espessura.
   - `forced-colors: active` — **sai inteiro**. Uma máscara em alto
     contraste apaga texto sem o repor, e ali a cabeça já não é uma
     imagem: é um contorno do sistema, contra o qual um corte recto lê
     bem. *A peça que existe para suavizar uma imagem não tem trabalho
     onde a imagem não existe.*
   - sem `mask-image` — a prosa fica como está hoje. Degradação nula.

   V5a (25/09): A CABEÇA DEIXOU DE SER IMAGEM — a gravura saiu e o topo
   do papel é o cabeçalho da pessoa, liso, com a runa por baixo. O
   esbatimento FICA pela razão original (uma linha meio engolida por uma
   borda dura lê-se pior do que uma que se apaga) e pelo custo, que
   continua zero: cobre só os 24 px de enchimento em `scrollTop = 0`.
   ============================================================ */
export const ESBATIMENTO = {
  /* 07/11 · TL (a tela limpa): 24 → 12. A página passou a ser a folha e o
     enchimento de cima dela desceu a 12 (PAGINA.cima, TL 8); o Figma desenha a
     banda a 12 (o «esbatimento» de 307:103, 307:273 e 307:805). A conta de
     R15 continua de pé: 12 de enchimento ≥ 12 de banda, a primeira linha nasce
     à luz inteira — e 12 é o piso de R13 (abaixo dele volta a ser borda). */
  altura: 12,
  alfaAA: 0.52,            /* V1: T.ink sobre o pior ponto do corpo (13,59:1) cai a 4,5:1 em a = 0,52 — a tabela que se recalcula não se afina à mão */
  entrelinhaDaProsa: 27.6, /* TIPOS.prosa (17) x 1,625 — o leading-relaxed da tela */
  /* A RAMPA, em pares [fracção da altura, alfa da máscara]. Ela é TABELA e
     não texto de CSS por duas razões, e a segunda foi a catraca a
     ensinar-ma: a primeira é que estes números decidem onde a prosa deixa
     de ser AA, e um número que decide legibilidade não mora dentro de uma
     string; a segunda é que escritos em `rgba(...)` eram OITO literais de
     cor novos, e `check-formas` apanhou-os no mesmo minuto — com razão,
     mesmo sendo uma máscara e não uma cor.

     E É ESCALONADA, não linear: a percepção de luminância não é linear, e
     uma rampa linear de alfa lê-se como um degrau no fim. Três batentes
     aproximam a curva com ~2 px de erro e custam zero — uma máscara de
     gradiente é composta pela GPU, nunca pelo fio principal. */
  rampa: [[0, 0], [0.45, 0.35], [0.75, 0.80], [1, 1]],
};

/* ============================================================
   AMBIENTE (V1, 24/09/2026) — a luz que a v3 põe sobre o corpo da
   história: um gradiente horizontal fraco, âmbar → mundo → rosa, por
   cima do poço (`T.pagina`). As paradas apontam para `T` POR NOME
   (como `APERTOS` em `hora-e-prazo.js`): a luz segue a paleta
   sozinha, e não há hex novo aqui.

   OS ALFAS SÃO OS DO FIGMA: as paradas do nó `ambient-gradient-overlay`
   medem 0,07/0,10/0,08, e o próprio nó tem opacidade 0,90 — logo
   0,063/0,090/0,072.

   OS DOIS PISOS: `prosa` = 7 é o piso AAA que a legenda da gravura
   tinha (aposentada em V5a, com a gravura) — a prosa é a protagonista da tela, e uma luz
   decorativa por cima dela não pode piorar a leitura. `corpoContraMesa`
   = 2,3 é ΔE76 (Sharma, *Digital Color Imaging Handbook*: o limiar de
   diferença perceptível) — substitui o par de R2 "página × mesa ≥ 1,5",
   que era razão de LUZ. Na v3 o poço é mais escuro que a mesa, e o que
   as separa é matiz + contorno, não luminância: o piso passa de razão
   de luz a diferença perceptível.
   ============================================================ */
/* ============================================================
   V5 · A PÁGINA — o `parchment-body` da pessoa (`129:15`), em tabela.

   O NÓ: enchimento 28 dos quatro lados, 16 entre parágrafos, 24 entre
   blocos (o bloco de prosa, a runa, o bloco seguinte). A casa os leva
   como estão NA MESA. No TELEFONE os lados ficam em 20 — o Figma não
   desenhou telefone, e 28 comeria 16 px à coluna de 375 (−2 caracteres
   por linha numa medida que já está abaixo do piso de 45); em cima e em
   baixo, 28 nos dois.

   O ENCHIMENTO DE CIMA NÃO PODE DESCER DE `ESBATIMENTO.altura`: é
   por ser ≥ que a máscara do topo cobre só enchimento em `scrollTop = 0` e
   a primeira linha nasce à luz inteira (a conta de R15). Era 28 ≥ 24; desde
   a TL (07/11) é 12 ≥ 12 — e a suíte o prende.

   ENTRE PARÁGRAFOS, 16 E NÃO UMA LINHA EM BRANCO: até aqui a prosa era um
   bloco `pre-wrap` e o parágrafo se separava com uma linha vazia de 27,6
   (a entrelinha). O nó os separa com 16 — cada parágrafo devolve 11,6 px
   à página, e a resposta típica do Mestre tem três ou quatro.
   ============================================================ */
/* 07/11 · TL 8 (a tela limpa): A PÁGINA É A FOLHA. A folha de cada resposta
   saiu e o pergaminho passou para a área que rola; o enchimento é o da folha
   — 12 em cima e 8 em baixo no telefone, 16 e 16 na mesa —, e os lados são os
   de FOLHA_DO_MESTRE (16 no telefone, 26 na mesa). Antes eram três molduras
   (o cartão 16 + 16, a página 20 + 20, a folha 18 + 18): 108 px de 375, e a
   prosa ficava com 30 caracteres por linha. Agora 38 (formas.md §TL 1–2). */
export const PAGINA = {
  cima: 12, baixo: 8,              /* no telefone */
  mesa: { cima: 16, baixo: 16 },   /* a partir de 768 */
  entreParagrafos: 16,
  entreBlocos: 24,
  entrelinha: 1.625,    /* a da prosa de hoje (o `leading-relaxed`), agora dita */
};

/* V5 · A ABERTURA DE CERIMÔNIA — a primeira FRASE de uma resposta, só nos dois
   turnos que o `jogo` escolheu (`mente/v5-jogo.md` §3): a chegada a um lugar
   novo e a primeira resposta da sessão. No nó é o primeiro parágrafo inteiro
   em Cormorant SemiBold 28/1,35; o parágrafo do Mestre tem 2–3× o da v3, e em
   28 custaria meia página no telefone — por isso é a FRASE, e acima de
   `tetoDeCaracteres` a cerimônia cai para `letraLonga` (o `jogo` mediu: uma
   frase de 110 car. a 375 chega a ~5 linhas, ~190 px). O peso é 500, o mais
   pesado que a folha carrega da Spectral (um 600 seria negrito falso,
   desenhado pelo navegador); a família é V2. */
export const ABERTURA = {
  letra: 28,              /* TIPOS.display — a cerimônia, e só ela */
  letraLonga: 20,         /* TIPOS.titulo — a frase comprida */
  tetoDeCaracteres: 110,
  entrelinha: 1.35,       /* a do nó */
  peso: 500,
  /* ACESA EM V5e. Em V5 ela ficou apagada porque, com a vista presa ao fim,
     nascia fora de vista em 5 de 5 respostas reais e empurrava o fim da
     resposta 53–64 px para baixo (`mente/v5-jogo.md` §8.1). Com a resposta a
     chegar pelo começo (`pousoDaVista`, glifos.js) a vista pousa na runa, e a
     primeira frase fica logo abaixo dela; e a cerimônia, ao acender, recalcula o
     pouso antes de a tela se pintar (prova do `jogo`, `mente/v5e-jogo.md` §7.2:
     inteira à vista a 72 px em 10 de 10). Apagá-la de novo é trocar este valor. */
  acesa: true,
};

/* ============================================================
   A FOLHA DO MESTRE (Mesa C · 04/11/2026) — a resposta num pergaminho

   A ordem da pessoa: «precisa ser chamativo e gostoso de ver, tem que ser um
   jogo». A narração deixa de ser letra clara sobre o poço escuro e passa a
   ser tinta sobre uma folha de pergaminho pousada no couro da página — uma
   folha por resposta, como as notas que o Mestre passa por cima da mesa.

   NA FOLHA SÓ HÁ TINTA (formas.md §«A mesa à luz de vela (C)» §1): as linhas
   do sistema, os ladrilhos e as falas do jogador ficam na paleta da mesa,
   fora dela. A prosa mede 12,15:1 no centro e 8,74:1 no pior ponto da
   vinheta (`teste-mesa-c.mjs` prende os dois).

   `peso` é a Spectral 400 que o `desenho` pediu para a folha clara (a 300
   da página escura afina demais sobre o papel).
   ============================================================ */
/* ============================================================
   A BANDEJA E OS SETE DADOS (Mesa C · 04/11/2026) — a forma do dado

   A spec é do `desenho` (formas.md §«A mesa à luz de vela (C)» §4–§5;
   Figma `243:46` o Dado, `243:72` a Marca, `244:613` a Bandeja). O
   motor (`src/motor/a-bandeja.js`) decide o lance; isto é só a cara dele.

   viewBox 48×48 (o d100 é dois d10). `corpo` é o polígono, `facetas` são
   traços finos, `numero` é o centro da letra e `tam` o corpo dela.
   ============================================================ */
export const FORMAS_DO_DADO = {
  4:  { corpo: "24,4 45,41 3,41", facetas: [], numero: [24, 30], tam: 16 },
  6:  { retangulo: { x: 6, y: 6, lado: 36, raio: 6 }, facetas: [], numero: [24, 24], tam: 18 },
  8:  { corpo: "24,3 45,24 24,45 3,24", facetas: ["M13.5 13.5 L34.5 13.5"], numero: [24, 26], tam: 18 },
  10: { corpo: "24,3 44,21 24,45 4,21", facetas: ["M4 21 L24 29 L44 21", "M24 29 L24 45"], numero: [24, 19], tam: 16 },
  12: { corpo: "24,4 43.97,18.51 36.34,41.99 11.66,41.99 4.03,18.51",
        facetas: ["M24 14 L34.46 21.6 L30.47 33.9 L17.53 33.9 L13.54 21.6 Z", "M24 4 L24 14", "M43.97 18.51 L34.46 21.6", "M36.34 41.99 L30.47 33.9", "M11.66 41.99 L17.53 33.9", "M4.03 18.51 L13.54 21.6"],
        numero: [24, 25], tam: 16 },
  20: { corpo: "24,3 42.19,13.5 42.19,34.5 24,45 5.81,34.5 5.81,13.5",
        facetas: ["M24 11 L36.5 32.5 L11.5 32.5 Z", "M24 3 L24 11", "M42.19 34.5 L36.5 32.5", "M5.81 34.5 L11.5 32.5", "M42.19 13.5 L24 11", "M5.81 13.5 L24 11", "M24 45 L36.5 32.5", "M24 45 L11.5 32.5"],
        numero: [24, 25], tam: 16 },
  /* o d100: dois d10 lado a lado — as dezenas («00»–«90», letra 14) e as unidades */
  100: { de: 10, tamDezenas: 14 },
};

/* A cor é do papel, por NOME de T (a mesma lei da runa): o corpo e o número */
export const PAPEL_DO_DADO = {
  teste: { corpo: "amber",   numero: "onAccent" },  /* 8,68 */
  dano:  { corpo: "danger",  numero: "onAccent" },  /* 5,77 */
  cura:  { corpo: "ok",      numero: "onAccent" },  /* 9,69 */
  sorte: { corpo: "violet",  numero: "onSecond" },  /* 7,75 — o oráculo */
  uso:   { corpo: "inkMeio", numero: "onAccent" },  /* 10,32 — o osso */
};

/* A faixa: 64 na mesa, 56 no telefone; o dado a 48; até 5 à vista */
export const BANDEJA = {
  altura: { mesa: 64, telefone: 56 },
  dado: 48, dadoPequeno: 20, espaco: 8, raio: 12,
  traco: 1.5, alfaDoTraco: 0.55, alfaDaFaceta: 0.28,
  anel: 2, anelForte: 2.5, selo: 18,
  falhaApagada: 0.5,
  /* o chão afundado da bandeja: o couro com a sombra por dentro */
  sombraInterior: `inset 0 2px 6px ${sombra(".6")}`,
};

/* O movimento (formas.md §5): rolar com o ressalto do pouso, pousar, o
   veredito; o número troca a cada `troca` ms enquanto rola — teatro, nunca
   sorteio: o resultado já veio da semente. Com reduce, tudo é `semMovimento`. */
export const MOVIMENTO_DO_DADO = {
  rolar: 520, curva: "cubic-bezier(.22,1.2,.36,1)",
  pousar: 140, veredito: 180, troca: 60, entreDados: 90,
  semMovimento: 120,
};

/* AR 12 · O DADO DE USO NA MESA (07/11/2026) — formas.md §AR 12; Figma 292:3654,
   293:3641, 294:3628. A face vem do sistema (faceDoDadoDeUso: 10 | 8 | 6 | 4 | null);
   a peça só a desenha. No d10 o glifo e o número vão a centroDoD10 (o triângulo de cima). */
export const DADO_DE_USO_NA_MESA = {
  ordem: ["racoes", "agua", "tochas"],
  glifo: { racoes: "racao", agua: "agua", tochas: "tocha" },     /* GLIFOS */
  nome: { racoes: "rações", agua: "água", tochas: "tochas" },
  papel: "uso",                                                  /* PAPEL_DO_DADO.uso — o osso */
  mesa: {
    dado: 44, folga: 8, entreLinhas: 22, linhas: [["racoes", "agua"], ["tochas"]],
    glifo: { 10: 14, 8: 22, 6: 22, 4: 17 },
    alvo: { largura: 120, alto: 132 }, depoisDe: "bolsa", acima: 8,
  },
  /* 07/11 · TL 8: no telefone os mantimentos moram na TIRA_DA_MESA — o dado
     a 22, em colunas de 24 (TIRA_DA_MESA.mantimentos), e o alvo 76 × 56, a
     altura da fila da tira. Na mesa puxada voltam a 28 (TIRA_DA_MESA.puxada). */
  telefone: {
    dado: 22, folga: 8, linhas: [["racoes", "agua", "tochas"]],
    glifo: { 10: 8, 8: 11, 6: 11, 4: 9 },
    alvo: { largura: 76, alto: 56 }, debaixoDos: "tira",
  },
  contagem: { tamanho: TIPOS.maquina, peso: 700, cor: T.inkMeio, aperta: T.danger, prefixo: "×", entre: 2 },
  apertaNaFace: 4,
  centroDoD10: [24, 18],
  vazio: { forma: 4, aro: T.lineStrong, tracejado: [3, 3], glifo: T.inkDim },
  /* 08/11 · a animação do fim do dia (294:4493): a spec dava o disco (18) e as
     cores; a letra e o canto são os da Marca da Bandeja (0,62 do lado; o disco
     2 px para fora à direita e 4 px para dentro em cima), para o «−1» ser o
     mesmo selo nas duas vistas do mesmo lance. */
  selo: { lado: BANDEJA.selo, chao: T.danger, letra: T.onAccent, texto: "−1", tamanho: 11, canto: [2, 4] },
  rolar: { dura: MOVIMENTO_DO_DADO.rolar, troca: MOVIMENTO_DO_DADO.troca, entreDados: MOVIMENTO_DO_DADO.entreDados, giro: -18, mostra: 1600 },
  encolher: { dura: 320, escala: 0.82 },
  reduzido: MOVIMENTO_DO_DADO.semMovimento,
};

/* ============================================================
   AAA · AS MOLDURAS VIVAS, A CARTA, O INVENTÁRIO, A SUBIDA E A VELA
   (05/11/2026) — formas.md §«AAA» §7, colada tal qual. O desenho montou
   tudo no Figma (página 250:2) a partir de mente/figma/aaa-geometria.mjs, e
   é desse mesmo módulo que estas tabelas saem. Onde a cor repete uma chave
   de T, lê-se T.x (o D5b do check-formas varre estas zonas). O contraste de
   cada par está em §6, e a suíte teste-molduras-vivas.mjs volta a medi-lo.
   ============================================================ */

/* o degrau sai do nível: o primeiro cujo ate >= nível. As camadas SOMAM-se
   (nunca trocam): o degrau novo é uma forma nova, não só uma cor nova. */
export const MOLDURA_POR_DEGRAU = {
  ferro: {
    de: 1,
    ate: 4,
    claro: "#A7ADB2",
    meio: "#6E747A",
    escuro: "#34383C",
    brilho: "#D9DEE2",
    camadas: ["aro", "rebites"],
  },
  bronze: {
    de: 5,
    ate: 9,
    claro: "#E7AE6F",
    meio: "#A9672F",
    escuro: "#55300F",
    brilho: "#FFD9A8",
    camadas: ["aro", "folhas"],
  },
  prata: {
    de: 10,
    ate: 14,
    claro: "#EEF1F4",
    meio: "#B4BCC4",
    escuro: "#5E6871",
    brilho: "#FFFFFF",
    camadas: ["aro", "folhas", "chamas"],
  },
  ouro: {
    de: 15,
    ate: 99,
    claro: "#FFE39A",
    meio: "#E0A93A",
    escuro: "#7A5410",
    brilho: "#FFF6D6",
    camadas: ["aura", "asas", "aro", "folhas", "chamas"],
  },
};

/* ferro enegrecido; o tier (comum, elite, chefe) diz as camadas */
export const MOLDURA_DO_INIMIGO = {
  metal: { claro: "#B3A39C", meio: "#7A6A64", escuro: "#2E2524", brilho: "#D6C6BF" },
  comum: ["aro", "rebites"],
  elite: ["aro", "espinhos"],
  chefe: ["aura", "chifres", "aro", "espinhos"],
};

/* o fio de dentro diz de que lado está, em cor E forma (WCAG 1.4.1) */
export const LADO_DA_MOLDURA = {
  heroi: { fio: T.amber, duplo: true },
  companheiro: { fio: T.mundo, duplo: false },
  inimigo: { fio: T.danger, duplo: false },
};

export const DISCO_DE_NIVEL = {
  heroi: { corpo: "#15475A", luz: "#2C7D96", sombra: "#0A2530", numero: T.ink },
  inimigo: { corpo: "#6A1E14", luz: "#A8382A", sombra: "#2E0B07", numero: T.ink },
};

/* AS PEÇAS MIÚDAS da moldura — as cores que aaa-geometria.mjs escreve soltas
   dentro das funções (o furo do engaste, o anel do engaste vazio, o fundo do
   retrato, o reflexo branco da pedra, a caixa de texto e o miolo do escudo
   da carta, a aura do chefe). Aqui ganham casa, para nenhum literal nascer
   em ui.jsx. ENGASTE_VAZIO é o nome que formas.md §7 lhe dá. */
export const PECAS_DA_MOLDURA = {
  engaste: "#120C08",
  furo: "#3A2A1C",
  retrato: "#2A1E15",
  reflexo: "#FFFFFF",
  caixa: T.panel,
  escudo: T.panelSoft,
  auraDoChefe: T.danger,
};
export const ENGASTE_VAZIO = PECAS_DA_MOLDURA.engaste;

/* a caixa de cada forma, com o transbordo (o aro mede 80 u; a carta 160 x 224) */
export const VB_DA_MOLDURA = { anel: [-6, -8, 112, 112], medalhao: [-18, -20, 136, 136], carta: [-26, -30, 212, 276] };

/* os nomes são os de src/subclasses.js, exatos; luz = corpo + 45% de branco, sombra = corpo + 50% de preto */
export const GEMA_DA_SUBCLASSE = {
  Cavaleiro: { classe: "Guerreiro", pedra: "safira", corpo: "#3F7FE0", luz: "#95B9EE", sombra: "#204070" },
  "Bárbaro": { classe: "Guerreiro", pedra: "granada", corpo: "#D0362C", luz: "#E5908B", sombra: "#681B16" },
  Gladiador: { classe: "Guerreiro", pedra: "topázio", corpo: "#E8A02A", luz: "#F2CB8A", sombra: "#745015" },
  Elementalista: { classe: "Mago", pedra: "opala-de-fogo", corpo: "#F2742E", luz: "#F8B38C", sombra: "#793A17" },
  Necromante: { classe: "Mago", pedra: "jade-espectral", corpo: "#5FC98C", luz: "#A7E1C0", sombra: "#306546" },
  Arcanista: { classe: "Mago", pedra: "ametista", corpo: "#9D6BE6", luz: "#C9AEF1", sombra: "#4F3673" },
  Assassino: { classe: "Ladino", pedra: "rubi-negro", corpo: "#CC2C4E", luz: "#E38B9E", sombra: "#661627" },
  Batedor: { classe: "Ladino", pedra: "peridoto", corpo: "#9BC94A", luz: "#C8E19B", sombra: "#4E6525" },
  Trapaceiro: { classe: "Ladino", pedra: "turmalina", corpo: "#E05FAE", luz: "#EEA7D2", sombra: "#703057" },
  Sacerdote: { classe: "Clérigo", pedra: "diamante", corpo: "#EDE6D2", luz: "#F5F1E6", sombra: "#777369" },
  Paladino: { classe: "Clérigo", pedra: "citrino", corpo: "#F5CF4A", luz: "#FAE59B", sombra: "#7B6825" },
  Inquisidor: { classe: "Clérigo", pedra: "cornalina", corpo: "#E0542A", luz: "#EEA18A", sombra: "#702A15" },
  Arqueiro: { classe: "Caçador", pedra: "esmeralda", corpo: "#2FB873", luz: "#8DD8B2", sombra: "#185C3A" },
  Domador: { classe: "Caçador", pedra: "âmbar", corpo: "#C8862E", luz: "#E1BC8C", sombra: "#644317" },
  Rastreador: { classe: "Caçador", pedra: "jaspe", corpo: "#B7613E", luz: "#D7A895", sombra: "#5C311F" },
  Menestrel: { classe: "Bardo", pedra: "rodocrosita", corpo: "#F08AA0", luz: "#F7BFCB", sombra: "#784550" },
  Cronista: { classe: "Bardo", pedra: "lápis-lazúli", corpo: "#3A5FD0", luz: "#93A7E5", sombra: "#1D3068" },
  Encantador: { classe: "Bardo", pedra: "kunzita", corpo: "#CE96F0", luz: "#E4C5F7", sombra: "#674B78" },
  "Punho de Ferro": { classe: "Monge", pedra: "hematita", corpo: "#8E9BA8", luz: "#C1C8CF", sombra: "#474E54" },
  Andarilho: { classe: "Monge", pedra: "água-marinha", corpo: "#6CCFE0", luz: "#AEE5EE", sombra: "#366870" },
  Asceta: { classe: "Monge", pedra: "pérola", corpo: "#D9E4D0", luz: "#EAF0E5", sombra: "#6D7268" },
  Metamorfo: { classe: "Druida", pedra: "labradorita", corpo: "#5E8FA8", luz: "#A6C1CF", sombra: "#2F4854" },
  "Xamã": { classe: "Druida", pedra: "turquesa", corpo: "#2BB7B0", luz: "#8AD7D4", sombra: "#165C58" },
  "Guardião": { classe: "Druida", pedra: "jade", corpo: "#4C9A48", luz: "#9DC79A", sombra: "#264D24" },
  "Linhagem Dracônica": { classe: "Feiticeiro", pedra: "rubi", corpo: "#E8283A", luz: "#F28993", sombra: "#74141D" },
  "Alma da Tempestade": { classe: "Feiticeiro", pedra: "safira-elétrica", corpo: "#5CB4FF", luz: "#A5D6FF", sombra: "#2E5A80" },
  "Magia Selvagem": { classe: "Feiticeiro", pedra: "opala", corpo: "#F07AE0", luz: "#F7B6EE", sombra: "#783D70" },
  "Pacto Infernal": { classe: "Bruxo", pedra: "brasa", corpo: "#FF5E1A", luz: "#FFA681", sombra: "#802F0D" },
  "Pacto Feérico": { classe: "Bruxo", pedra: "crisoprásio", corpo: "#7FE0A0", luz: "#B9EECB", sombra: "#407050" },
  "Pacto do Abismo": { classe: "Bruxo", pedra: "obsidiana-violeta", corpo: "#7A5CE0", luz: "#B6A5EE", sombra: "#3D2E70" },
  Artilheiro: { classe: "Engenheiro", pedra: "cobre", corpo: "#C9683A", luz: "#E1AC93", sombra: "#65341D" },
  Mecanista: { classe: "Engenheiro", pedra: "latão", corpo: "#CDB04E", luz: "#E4D49E", sombra: "#675827" },
  "Alquimista de Campo": { classe: "Engenheiro", pedra: "fluorita", corpo: "#56E0C8", luz: "#A2EEE1", sombra: "#2B7064" },
  "Mestre das Feras": { classe: "Invocador", pedra: "sardônica", corpo: "#A8582A", luz: "#CFA38A", sombra: "#542C15" },
  "Conjurador Elemental": { classe: "Invocador", pedra: "girassol", corpo: "#FF9E3D", luz: "#FFCA94", sombra: "#804F1F" },
  "Chamador de Espíritos": { classe: "Invocador", pedra: "pedra-da-lua", corpo: "#A9C6F5", luz: "#D0E0FA", sombra: "#55637B" },
};

/* substitui o RARIDADE_COR que morava no App. fundo = panelSoft + 12% da cor; o escolhido 22% */
export const COR_DA_RARIDADE = {
  comum: { cor: "#B9AE9C", fundo: "#43352A", fundoEscolhido: "#504337", fio: 1, forma: "fio simples" },
  incomum: { cor: "#7FC46A", fundo: "#3C3824", fundoEscolhido: "#44482C", fio: 2, forma: "fio duplo" },
  raro: { cor: "#5AA9F0", fundo: "#383534", fundoEscolhido: "#3C4249", fio: 2, forma: "fio duplo + 1 canto" },
  epico: { cor: "#B57BF0", fundo: "#432F34", fundoEscolhido: "#503849", fio: 2, forma: "fio duplo + 4 cantos" },
  lendario: {
    cor: "#FF9A3D",
    fundo: "#4B331E",
    fundoEscolhido: "#603F22",
    fio: 2,
    forma: "4 cantos + brilho de dentro + lume lento",
  },
  unico: {
    cor: "#3FD6C6",
    fundo: "#343A2F",
    fundoEscolhido: "#364C40",
    fio: 2,
    forma: "4 cantos + brilho + estrela no canto",
  },
};

/* o glifo do encaixe vazio, a 35% */
export const GLIFO_DO_ENCAIXE = {
  elmo: "elmo",
  amuleto: "amuleto",
  armadura: "armaduraPesada",
  arma: "espada",
  escudo: "escudo",
  anel: "anel",
  botas: "botas",
};

/* quadro 24, fill none, stroke 1,5, pontas e juntas redondas */
export const ICONES_DE_ITEM = {
  espada: ["M20 4h-3.6L7.2 13.2l3.6 3.6L20 7.6z", "M5.2 11.6l7.2 7.2", "M7.6 16.4L4 20"],
  machado: ["M5 20L15 7.5", "M12.6 5.4c2.2-2.2 6.4-2.4 8 .4-1.3 2.5-1 5 .6 7.2-2.8 1-6 .1-7.6-2.1z"],
  arco: ["M7 3.5c7 3 7 14 0 17", "M7 3.5v17", "M4 12h15", "M16.5 9.5L19 12l-2.5 2.5"],
  cajado: ["M7 21l8-13", "M18.6 6.4a2.6 2.6 0 1 1-5.2 0a2.6 2.6 0 1 1 5.2 0", "M20.5 1.8v2.4M19.3 3h2.4"],
  adaga: ["M17 4l3 3-7.5 7.5-3-3z", "M8 10.5l5.5 5.5", "M10 14l-5 5"],
  maca: [
    "M5 19l7.5-7.5",
    "M19 8.5a3.5 3.5 0 1 1-7 0a3.5 3.5 0 1 1 7 0",
    "M15.5 3v1.5M21 8.5h-1.5M19.4 4.6l-1 1M11.6 4.6l1 1M19.4 12.4l-1-1",
  ],
  escudo: ["M12 3l7 2.5V11c0 4.8-3 8-7 10-4-2-7-5.2-7-10V5.5z", "M12 7v10M8.5 11h7"],
  elmo: ["M5 14a7 7 0 0 1 14 0v4.5h-4.5V15h-5v3.5H5z", "M12 7V3.5", "M8 14h8"],
  armaduraLeve: ["M8 4l4 2 4-2 3 3-2 3v10H7V10L5 7z", "M11 9.5h2M11 12.5h2M11 15.5h2"],
  armaduraPesada: ["M6 5h3l3 2 3-2h3l1.2 5-2.2 1v9H7v-9l-2.2-1z", "M7 14h10M7 17h10", "M12 7v13"],
  botas: ["M7.5 3.5H13v9c3 .4 6 1.6 6 4.5v2.5H6.5V14z", "M6.5 17h12.5"],
  anel: ["M17.5 15a5.5 5.5 0 1 1-11 0a5.5 5.5 0 1 1 11 0", "M9.5 8.5L12 5l2.5 3.5L12 10z"],
  amuleto: ["M6 3c0 5 2.5 8 6 9 3.5-1 6-4 6-9", "M12 12l3 4-3 4.5-3-4.5z"],
  pocao: ["M9.5 3h5", "M10.5 3v5L6.5 15a4.5 4.5 0 0 0 4 6.5h3a4.5 4.5 0 0 0 4-6.5L13.5 8V3", "M7.6 14.5h8.8"],
  pergaminho: [
    "M8 4.5h10.5v13a2.5 2.5 0 0 1-2.5 2.5H5.5",
    "M8 4.5a2 2 0 1 0-2 2h2V18",
    "M5.5 20a2 2 0 0 1 0-4H8",
    "M10.5 9h5M10.5 12h5",
  ],
  chave: ["M10 12a3.5 3.5 0 1 1-7 0a3.5 3.5 0 1 1 7 0", "M10 12h11", "M18 12v3M15 12v2.5"],
  aljava: ["M8 9l2 12h4l2-12z", "M10 9V3M12 9V2.5M14 9V3", "M9 4.5l1-1.5 1 1.5M13 4.5l1-1.5 1 1.5"],
  tomo: ["M5 4.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z", "M5 18a2 2 0 0 1 2-2h11", "M10.5 8.5h4"],
};

/* o mesmo traço; as chaves são os ids de ATRIBUTOS (constantes.js) */
export const ICONES_DE_ATRIBUTO = {
  forca: [
    "M7 11V7.5a1.5 1.5 0 0 1 3 0V10",
    "M10 9.5V6.5a1.5 1.5 0 0 1 3 0V10",
    "M13 9.5V7a1.5 1.5 0 0 1 3 0v3.5",
    "M16 10a1.5 1.5 0 0 1 3 0v3c0 4-2.5 7-6.5 7S6 17.5 6 14.5V12c0-1 .8-1.6 1.8-1.4L11 11.5",
  ],
  destreza: ["M19 4C11 4 6 9.5 5.5 19", "M19 4c-.5 6-4.5 10-10.5 11", "M13 7.5l-3 .5M15.5 10l-4 .8"],
  vigor: [
    "M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z",
    "M6.5 12.5h3l1.5-2.5 2 4 1.5-1.5h3",
  ],
  intelecto: [
    "M12 6.5C9.8 5 6.8 4.6 4 5.2v13c2.8-.6 5.8-.2 8 1.3 2.2-1.5 5.2-1.9 8-1.3v-13c-2.8-.6-5.8-.2-8 1.3z",
    "M12 6.5v13",
  ],
  presenca: ["M4 17h16", "M4.5 17L3.5 8l4.5 3.5L12 5l4 6.5L20.5 8l-1 9", "M5 20h14"],
  percepcao: ["M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z", "M15 12a3 3 0 1 1-6 0a3 3 0 1 1 6 0"],
};

/* ms; «de» conta do toque que abre a cerimónia; reduzido = só o quadro final */
export const CERIMONIA_DO_NIVEL = {
  veu: { de: 0, dura: 240, opacidade: 0.86 },
  luz: { de: 120, dura: 640 },
  forja: { de: 600, dura: 800, faiscas: 14, soNoDegrau: [5, 10, 15] },
  pulso: { de: 600, dura: 420 },
  numero: { de: 1300, dura: 420, escalaDe: 0.82 },
  ganhos: { de: 1700, passo: 120, dura: 280 },
  gema: { de: 1900, dura: 520 },
  escolha: { de: 2300, dura: 240 },
  total: 2540,
  reduzido: { dura: 160 },
};

/* porFase lê as fases do relógio (as de MAPA_VIVO.modoDaFase); luz = alfa do halo no papel */
export const VELA = {
  cor: {
    chama: "#FFB347",
    nucleo: "#FFF1C4",
    halo: "#FFC877",
    cera: "#EFE3C8",
    ceraSombra: "#C9B48E",
    pavio: T.tintaDoPergaminho,
    fumo: "#B9AE9C",
  },
  porFase: {
    manha: { estado: "apagada", altura: 1, luz: 0 },
    tarde: { estado: "apagada", altura: 1, luz: 0 },
    entardecer: { estado: "acesa", altura: 1, luz: 0.12 },
    noite: { estado: "acesa", altura: 0.7, luz: 0.2 },
    madrugada: { estado: "acesa", altura: 0.42, luz: 0.24 },
    amanhecer: { estado: "fumo", altura: 0.2, luz: 0 },
  },
  tempos: { tremor: 1800, respiroDaLuz: 2300, acender: 700, fumo: 2600, reduzido: 200 },
  luzNoPapel: { raioDaFolha: 0.9, vinhetaDaMesa: 0.32 },
};

/* OS TRÊS TAMANHOS, UMA FAMÍLIA (formas.md §AAA §1): o aro em px, desde
   quando o anel leva o disco, e a letra do número (Cinzel). Abaixo de
   anel.de o anel fica sem moldura: §1 desenhou-a para 36–44, e a 28–32 os
   traços caem abaixo de 1,5 px e desaparecem no ecrã. */
export const TAMANHOS_DA_MOLDURA = {
  anel: { de: 36, ate: 44, discoDesde: 40, numero: 9 },
  medalhao: { aro: 64, numero: 10 },
  carta: { largura: 160, numero: 15 },
};

/* OS ESTADOS E O MOVIMENTO DA MOLDURA (formas.md §AAA §9): o lume do ouro
   roda em 8 s a 0,35 (um arco claro que corre o aro); a gema acende em
   520 ms (0,6, 1,12, 1), só quando muda e nunca ao montar. Com reduce o lume
   para e a gema troca seca. Quem tombou dessatura a 0,8. Lidos por
   MOVIMENTO_CSS e por src/painel-moldura.jsx. */
export const ESTADOS_DA_MOLDURA = {
  lume: 8000, alfaDoLume: 0.35, arcoDoLume: 0.22,
  gema: CERIMONIA_DO_NIVEL.gema.dura, gemaDe: 0.6, gemaPico: 1.12,
  tombado: 0.8,
};

/* A BORDA DA MESA (AAA §14): o couro à volta do feltro e o fio de ouro por
   dentro dele. Quando o HUD B nascer, mora em HUD_DA_MESA. */
export const BORDA_DA_MESA = {
  mesa: 14, telefone: 6,
  ouro: MOLDURA_POR_DEGRAU.ouro.meio,   /* o ouro meio das molduras — 7,66 contra o feltro */
  alfaDoOuro: 0.45,
};

/* O ESQUELETO B — a mesa do Mestre vista de cima (formas.md §AAA §13, a
   escolha da pessoa a 05/11). As áreas são as de grid-template-areas; a
   montagem é src/painel-mesa-do-mestre.jsx. gemasDaCarta: PV = a granada do
   Bárbaro, PM = a ametista do Arcanista, Destino = T.amber. O que a §13 diz
   em prosa (a moldura de ouro do painel, o título em Cinzel 11) mora em
   painel e titulo, para não ser número solto na peça. */
export const HUD_DA_MESA = {
  mesa: {
    aPartirDe: 1024,
    borda: BORDA_DA_MESA.mesa,
    colunas: ["236px", "minmax(560px, 600px)", "120px"],
    /* 07/11 · TL 8 (a tela limpa): a barra do topo e o ecrã do Mestre são UMA
       faixa (a barra, 56); a fila das cartas de baixo saiu — as cartas sobem
       para a coluna da esquerda, por cima da Bandeja (o grupo); o momento tem
       um lugar só, por cima do campo. As colunas começam a 72 do topo. */
    folga: 32, topo: 72,
    areas: ["barra barra barra", "grupo livro objetos", "grupo momento objetos", "grupo campo objetos"],
    linhas: ["56px", "1fr", "auto", "48px"],
    barra: { alto: 56, velaAlta: 40 },
    /* as cartas a 0,9 da carta da mesa de antes (cartas, abaixo): 117,9 × 170
       o herói e 88,2 × 130,5 o companheiro, lado a lado (Figma 309:1758) */
    grupo: { largura: 236, cartas: { heroi: 0.9, companheiro: 0.9, entre: 12 }, bandeja: { acima: 20, teto: 300 } },
    /* O ECRÃ DE ANTES — sai quando o App deixar de o ler (o `oficial`, TL 9):
       hoje ainda dá a altura do topo ao alforje. A barra é `barra`. */
    ecra: { painel: 220, alto: 84, folga: 20, ordem: ["lugar", "hora", "ameaca"], velaAlta: 68, respiro: 8 },
    livro: { largura: 600, margem: 8, linha: 504 },
    bandeja: { largura: 236, alto: 300, lado: "esquerda" },
    /* a carta da mesa (a do componente «Carta do grupo» no Figma): é a base de
       grupo.cartas (0,9 dela) e a escala da fila de baixo enquanto o App a
       desenhar (sai com ela; `baixa` é a da fila de baixo na mesa baixa) */
    cartas: { heroi: 0.62, companheiro: 0.46, folga: 48, recuo: 30, baixa: { heroi: 0.5, companheiro: 0.38 } },
    /* 05/11 · AAA §15: o desenho a 90 (OBJETOS_DA_MESA.tamanho.mesa), o alvo 96 × 120 e o passo 124 (cinco objetos cabem entre o ecrã e as cartas) */
    objetos: { passo: 124, ordem: ["diario", "mapa", "bolsa"], alvo: { largura: 96, alto: 120 } },
    /* A MESA BAIXA (a pessoa jogou a v9.605 a 1905 × 860): abaixo desta altura da
       janela a página ficava com ~355 px. As cartas encolhem (herói 131 → 106 de
       largura, ~38 px de altura devolvidos à página) e o horizonte usa a faixa
       estreita (96 → 48). Medido a 1440 × 900: a história tinha 203 px com as
       cartas grandes e 285 com estas. O Figma 260:1494 (912) não tem a faixa do
       horizonte; com ela, só a partir de 960 as cartas grandes cabem. */
    /* 07/11 · TL 8: a fila de baixo saiu, e com ela o que comia a altura — a
       mesa baixa passa a ser abaixo de 800, e aí as cartas do grupo vão a 0,8 */
    baixa: { abaixoDe: 800, cartas: { heroi: 0.8, companheiro: 0.8 } },
  },
  telefone: {
    borda: BORDA_DA_MESA.telefone,
    /* 07/11 · TL 8: a barra (48), a página, o momento, o campo e a TIRA (72 em
       vez da fila de 150). A página é uma folha só, a 8 do feltro (a borda 6 +
       a margem 2), com 16 dos lados e 12 em cima. */
    areas: ["barra", "livro", "momento", "campo", "tira"],
    linhas: ["48px", "1fr", "auto", "48px", "72px"],
    barra: { alto: 48, velaAlta: 28 },
    vao: 8,
    livro: { margem: 2, enchimento: 16, cima: 12, baixo: 8 },   /* margem: além da borda 6 */
    /* O DE ANTES — sai quando o App deixar de o ler (o `oficial`, TL 9): o
       `ecra` dá a altura do topo ao alforje; as `cartas` são a escala da mesa
       puxada (TIRA_DA_MESA.puxada.cartas = "telefone") e `alto` a fila velha */
    ecra: { forma: "tira", alto: 44, velaAlta: 30 },
    cartas: { heroi: 0.46, companheiro: 0.34, objetosNaFila: true, alto: 150 },
    objetos: { tamanho: 48, rotulo: 10, ordem: ["diario", "mapa", "bolsa"] },   /* 05/11 · AAA §15: 40 → 48, o piso de toque */
  },
  ameaca: { pontos: 3, cheio: "●", vazio: "○" },
  gemasDaCarta: { PV: GEMA_DA_SUBCLASSE["Bárbaro"].corpo, PM: GEMA_DA_SUBCLASSE.Arcanista.corpo, Destino: T.amber },
  painel: { moldura: 2, fio: 0.35, raio: 6, enchimento: 12 },
  titulo: { tamanho: 11, rastreio: 1.8 },
  gema: { mesa: 7, telefone: 6, letra: 11 },
};

/* ============================================================
   TL · A TELA LIMPA (07/11/2026) — formas.md §TL; Figma 306:2. A barra do topo
   e o ecrã do Mestre são uma faixa; o momento tem um lugar; a mesa do telefone
   é uma tira. A pessoa, com a foto do telefone: «veja só como fica poluída a
   tela». Na foto não se via uma linha de prosa; no depois, 14,2 (TL 2).
   As peças: BarraDoMestre, TiraDaMesa e MesaPuxada (painel-mesa-do-mestre.jsx),
   EmCena (painel-fichas.jsx), SoleiraDoMomento (ui.jsx).
   ============================================================ */
/* A SOLEIRA DO MOMENTO (306:106): uma coisa de cada vez, pela prioridade; 56 de
   alto sempre (ALVOS.chamado), 0 px sem momento. O verbo pode encurtar; o nó do
   preço («5 min», «precisa de 13») nunca. onAccent sobre amber: 8,68. */
export const SOLEIRA_DO_MOMENTO = {
  alto: ALVOS.chamado, vao: 8, raio: 10, enchimento: 14,
  /* BQ (08/11, formas.md §BQ 2): a escolha passa à frente da oferta — é a
     quest que já se aceitou a pedir uma decisão; a rolagem e o dado que pousa
     continuam primeiro. Na vida, o chão do botão passa a danger (onAccent
     sobre danger 5,77). */
  prioridade: ["rolagem", "dado", "escolha", "proposta"],
  escolha: { glifo: "encruzilhada", lado: 24, vida: { chao: T.danger } },   /* lado: o glifo do 316:2063 */
  principal: { chao: T.amber, letra: T.onAccent, verbo: { tamanho: 16, peso: 500, entrelinha: 20 }, preco: { tamanho: TIPOS.maquina, entrelinha: 16 }, dado: 28 },
  secundario: { chao: T.panel, aro: T.lineStrong, enchimento: 12 },
  mostraODado: DADO_DE_USO_NA_MESA.rolar.mostra,
};
/* EM CENA (306:11): quem está aqui, uma vez só — rostos de 32 sobrepostos 8, no
   máximo 3, o resto em «+N». UM botão de 48 de alto, que abre a gaveta «Em cena»
   (a FileiraAVista inteira). Ficam de fora as variantes de fichas.js que moram
   noutro lugar: a pessoa do grupo (na mesa) e o lugar onde se está (na barra). */
export const EM_CENA = {
  rosto: 32, aro: 2, sobrepoe: 8, mostra: 3, alvo: ALVOS.piso,
  fora: ["pessoaDoGrupo", "aqui"],   /* as formas de fichas.js que moram noutro lugar */
};
/* TP · A PROSA TOCÁVEL (09/11/2026) — formas.md §TP; Figma 327:2 (Nome tocável 327:24).
   O nome da prosa que o sistema conhece é a ficha: o 1.º toque aponta, o 2.º abre.
   O teto (5) e a lista do que fica de fora são do motor (MARCAS_NA_PROSA): a tela
   só embrulha o trecho que ele devolve. A folha está em SUPERFICIES_CSS
   (.tv-nome-tocavel). EM_CENA ganha nomeados no contrato da peça, não aqui. */
export const PROSA_TOCAVEL = {
  so: "agora",                                  /* só a resposta do Mestre de agora (TP 7) */
  sublinhado: { espessura: 1.5, cerimonia: 2, afastado: 4, estilo: "dotted", estiloHostil: "dashed",
                cor: T.brasaNoPergaminho, corHostil: T.perigoNoPergaminho },
  apontado: { chao: T.marcaNoPergaminho, sublinhado: T.lacreNoPergaminho, espessura: 2 },
  aberto: { chao: T.lacreNoPergaminho, letra: T.pergaminho },
  sangra: 2, raio: 3,                           /* o chão sangra por box-shadow: a linha não mexe */
  alvo: { lado: 4 },                            /* o ::after alarga o toque; a altura é a da linha (WCAG 2.5.8, inline) */
  cartao: { folgaDaLinha: 8, acimaDaFolha: 16 },/* mesa: o popover a 8 da linha; telefone: o nome 16 acima da folha */
  dura: 120,                                    /* a troca de estado; reduced-motion: 0 */
};
/* A TIRA DA MESA (306:107), 375 × 72: a pega, o herói (retrato 44, nível 18, até
   três gemas), o companheiro (34, PV e PM), os objetos (desenho 40 em alvo
   48 × 56, sem rótulo) e os mantimentos (dado 22 em colunas de 24). Puxar ou
   tocar a pega abre a mesa inteira (307:805): a folha de couro de 340 que sobe. */
export const TIRA_DA_MESA = {
  alto: 72, cima: 13, lado: [10, 6],
  pega: { largura: 36, alto: 4, cima: 5, cor: T.inkDim, alfa: 0.7 },
  heroi: { retrato: 44, aro: 2, nivel: 18, gemas: 3, entre: 4 },
  companheiro: { retrato: 34, aro: 2 },
  objeto: { alvo: { largura: ALVOS.piso, alto: 56 }, desenho: 40, rotulo: false },
  mantimentos: { dado: 22, coluna: 24, entre: 2 },
  /* glifo: os do dado de 28 que AR 12 desenhou para o telefone (294:4080) — a TL
     levou o telefone a 22 e a mesa puxada continua a 28, por isso moram aqui */
  puxada: { alto: 340, raio: 14, veu: 0.55, cartas: "telefone", objetos: 0.62, dado: 28, dura: 220, glifo: { 10: 10, 8: 14, 6: 14, 4: 11 } },
};
/* O HORIZONTE DA CENA: deixa de ter faixa fixa. Ao chegar entra no relato (o
   bloco do turno da chegada, rola com a prosa); a pedido abre numa gaveta de
   cima (96 na mesa, 48 no telefone); em viagem fica preso debaixo da barra. */
export const HORIZONTE_DA_CENA = {
  aoChegar: "relato", aPedido: "gaveta", emViagem: "preso",
  gaveta: { mesa: 96, telefone: 48, dura: 220 },
};

/* §AAA §15 · OS OBJETOS DA MESA — o Diário, o Mapa, a Bolsa, o Códex e a Ascensão.
   Quadro 96×96, luz de cima, contorno escuro; a borda de cada um é material
   claro ou metal (≥ 3:1 no feltro e sob a vela). formas.md §AAA §15. */
export const MATERIAIS_DOS_OBJETOS = {
  contorno: "#140B06",                                                   /* separa da luz e do halo; 1,20 no feltro: NUNCA é a borda sozinho */
  sombra: "#000000",                                                     /* a sombra de contacto, a 0,45 */
  couroDoDiario: { luz: "#D9814B", meio: "#B85A33", sombra: "#5A2114" }, /* luz 5,56 · meio 3,52 (3,17 sob a vela) */
  couroDaBolsa: { luz: "#E6BA80", meio: "#B67F47", baixo: "#A06A38", sombra: "#6A4322" }, /* meio 4,73 · baixo 3,57 (3,21) — a borda de baixo */
  couroDoCodex: { luz: "#A68AE6", meio: "#5E44A8", sombra: "#2B1C57" },  /* a borda é o fio de PRATA.meio (8,45), não o couro */
  rolo: "#8C7350",                                                       /* o interior do rolo e o corte das folhas: 3,62 */
};

/* O IIFE guarda os nomes curtos (OURO, M, CHAO) só para o desenho — não
   chocam com o resto da folha. */
export const OBJETOS_DA_MESA = (() => {
const OURO = MOLDURA_POR_DEGRAU.ouro;
const PRATA = MOLDURA_POR_DEGRAU.prata;
const BRONZE = MOLDURA_POR_DEGRAU.bronze;
const GRANADA = GEMA_DA_SUBCLASSE["Bárbaro"].corpo;
const AMETISTA = GEMA_DA_SUBCLASSE.Arcanista.corpo;
const SAFIRA = GEMA_DA_SUBCLASSE.Cavaleiro.corpo;
/* os materiais que só os objetos usam (feltro 12,24,1B · vela 1F,2C,1D) */
const M = MATERIAIS_DOS_OBJETOS;

const CHAO = { el: "ellipse", cx: 48, cy: 86, rx: 30, ry: 5, fill: M.sombra, opacity: 0.45 };

/* camada: el = o elemento SVG; sw = strokeWidth (e então linejoin/linecap round);
   dash = strokeDasharray; rot = rotate(rot cx cy). paradas: [posição, cor, alfa?]
   (o terceiro é o stop-opacity; falta = 1). fill "url(#id)" aponta para um
   gradiente do próprio objeto: o desenhador prefixa o id com useId(), porque o
   mesmo objeto pode estar duas vezes na página. */
return {
  viewBox: "0 0 96 96",
  material: M,
  tamanho: { mesa: 90, telefone: 48 },
  novidade: {
    halo: { el: "ellipse", cx: 48, cy: 52, rx: 46, ry: 42, fill: "url(#odm-novo-halo)", opacity: 0.42 },
    gradiente: { id: "odm-novo-halo", tipo: "radial", cx: 0.5, cy: 0.5, r: 0.5, paradas: [[0, T.amber], [1, T.amber, 0]] },
    /* a gota é a MarcaDaPorta estado="novo", posta como hoje (top -4, right -6) */
  },
  ordem: ["diario", "mapa", "bolsa", "codex", "ascensao"],
  diario: {
    rotulo: "Diário",
    gradientes: [
      { id: "odm-diario-capa", tipo: "linear", x1: 0, y1: 0, x2: 0.35, y2: 1, paradas: [[0, M.couroDoDiario.luz], [0.45, M.couroDoDiario.meio], [1, M.couroDoDiario.sombra]] },
      { id: "odm-diario-ouro", tipo: "linear", x1: 0, y1: 0, x2: 1, y2: 1, paradas: [[0, OURO.claro], [0.55, OURO.meio], [1, OURO.escuro]] },
    ],
    camadas: [
      CHAO,
      { el: "path", d: "M24 14h48a4 4 0 0 1 4 4v60a4 4 0 0 1-4 4H24z", fill: T.pergaminho, stroke: M.contorno, sw: 2 },
      { el: "path", d: "M72 20v56M74 22v52M28 78h42M28 80h40", stroke: T.pergaminhoBorda, sw: 0.9, fill: "none" },
      { el: "rect", x: 18, y: 10, width: 52, height: 68, rx: 4, fill: "url(#odm-diario-capa)", stroke: M.contorno, sw: 2 },
      { el: "path", d: "M22 10h7v68h-7a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z", fill: M.couroDoDiario.sombra, opacity: 0.6 },
      { el: "path", d: "M19.8 14v60", stroke: M.couroDoDiario.luz, sw: 1.2, fill: "none" },
      { el: "path", d: "M18 22h11M18 66h11", stroke: M.couroDoDiario.luz, sw: 2.2, fill: "none" },
      { el: "rect", x: 33, y: 17, width: 30, height: 54, rx: 2, fill: "none", stroke: M.couroDoDiario.sombra, sw: 1.6 },
      { el: "rect", x: 35, y: 19, width: 26, height: 50, rx: 1.5, fill: "none", stroke: OURO.meio, sw: 1, opacity: 0.85 },
      { el: "circle", cx: 48, cy: 44, r: 8.5, fill: "url(#odm-diario-ouro)", stroke: M.contorno, sw: 1.6 },
      { el: "path", d: "M44 49c2-5 5-8 8-10-1 4-3 7-7 9m-1 1l-1 2", stroke: OURO.escuro, sw: 1.4, fill: "none" },
      { el: "path", d: "M58 10h8a4 4 0 0 1 4 4v8l-4 0v-8h-8z", fill: "url(#odm-diario-ouro)", stroke: M.contorno, sw: 1.4 },
      { el: "path", d: "M58 78h8a4 4 0 0 0 4-4v-8l-4 0v8h-8z", fill: "url(#odm-diario-ouro)", stroke: M.contorno, sw: 1.4 },
      { el: "circle", cx: 66.5, cy: 13.5, r: 1.3, fill: OURO.brilho },
      { el: "circle", cx: 66.5, cy: 74.5, r: 1.3, fill: OURO.brilho },
      { el: "path", d: "M60 39h17a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H60z", fill: M.couroDoDiario.sombra, stroke: M.contorno, sw: 1.6 },
      { el: "rect", x: 56, y: 36, width: 10, height: 16, rx: 2.5, fill: "url(#odm-diario-ouro)", stroke: M.contorno, sw: 1.6 },
      { el: "path", d: "M61 41.5a1.6 1.6 0 1 1-.01 0zM61 43v4", stroke: OURO.escuro, sw: 1.5, fill: "none" },
      { el: "path", d: "M40 78v11l3-2.5 3 2.5V78", fill: GRANADA, stroke: M.contorno, sw: 1.4 },
      { el: "path", d: "M31 12h33", stroke: M.couroDoDiario.luz, sw: 1.4, fill: "none", opacity: 0.9 },
    ],
  },
  mapa: {
    rotulo: "Mapa",
    gradientes: [
      { id: "odm-mapa-folha", tipo: "linear", x1: 0, y1: 0, x2: 0, y2: 1, paradas: [[0, T.pergaminho], [1, T.pergaminhoBorda]] },
      { id: "odm-mapa-rolo", tipo: "linear", x1: 0, y1: 0, x2: 1, y2: 0, paradas: [[0, M.rolo], [0.35, T.pergaminho], [0.7, T.pergaminhoBorda], [1, M.rolo]] },
      { id: "odm-mapa-lacre", tipo: "radial", cx: 0.38, cy: 0.32, r: 0.75, paradas: [[0, T.rosa], [0.55, T.lacreNoPergaminho], [1, T.perigoNoPergaminho]] },
    ],
    camadas: [
      CHAO,
      { el: "path", d: "M14 24Q38 19 66 23V77Q38 73 14 78Q9 76 10 71V30Q10 25 14 24z", fill: "url(#odm-mapa-folha)", stroke: M.contorno, sw: 2 },
      { el: "path", d: "M14 24Q19 27 17 32V72Q19 76 14 78", fill: "none", stroke: M.rolo, sw: 1.4 },
      { el: "path", d: "M22 36q6-4 10 1t9 0 8 4M23 60q5 3 9-1t8 2", stroke: T.tintaDoPergaminhoMeio, sw: 1.4, fill: "none" },
      { el: "path", d: "M44 28q-4 10 2 16t1 20", stroke: T.azulNoPergaminho, sw: 1.8, fill: "none" },
      { el: "path", d: "M24 50l4-6 4 6M30 50l4-7 4 7", stroke: T.tintaDoPergaminho, sw: 1.5, fill: "none" },
      { el: "path", d: "M27 68q10-2 16-10t14-6", stroke: T.brasaNoPergaminho, sw: 1.5, fill: "none", dash: "2.5 2.5" },
      { el: "path", d: "M55 47l5 5m0-5l-5 5", stroke: T.perigoNoPergaminho, sw: 2.2, fill: "none" },
      { el: "rect", x: 62, y: 18, width: 18, height: 64, rx: 9, fill: "url(#odm-mapa-rolo)", stroke: M.contorno, sw: 2 },
      { el: "ellipse", cx: 71, cy: 20, rx: 8, ry: 3.6, fill: M.rolo, stroke: M.contorno, sw: 1.4 },
      { el: "path", d: "M71 20m-4 0a4 2 0 1 0 8 0a3 1.4 0 1 0-6 0", stroke: T.pergaminho, sw: 1, fill: "none" },
      { el: "path", d: "M61 50h20v5H61z", fill: T.lacreNoPergaminho, stroke: M.contorno, sw: 1.2 },
      { el: "path", d: "M71 51.5c-4 4-6 10-9 14M71 51.5c3 5 4 10 7 13", stroke: T.lacreNoPergaminho, sw: 2.4, fill: "none" },
      { el: "path", d: "M71 54l3 1.3 3.2-.6 1 3 2.6 2-1.4 2.9.6 3.2-3 1-2 2.6-2.9-1.4-3.2.6-1-3-2.6-2 1.4-2.9-.6-3.2 3-1z", fill: "url(#odm-mapa-lacre)", stroke: M.contorno, sw: 1.4 },
      { el: "path", d: "M71 58.5l1.6 3.4 3.6.4-2.7 2.4.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.4 3.6-.4z", fill: T.perigoNoPergaminho, opacity: 0.85 },
      { el: "path", d: "M66 21.5v52", stroke: T.pergaminho, sw: 1.6, fill: "none", opacity: 0.9 },
    ],
  },
  bolsa: {
    rotulo: "Bolsa",
    gradientes: [
      { id: "odm-bolsa-couro", tipo: "radial", cx: 0.35, cy: 0.3, r: 0.8, paradas: [[0, M.couroDaBolsa.luz], [0.5, M.couroDaBolsa.meio], [1, M.couroDaBolsa.baixo]] },
      { id: "odm-bolsa-ouro", tipo: "linear", x1: 0, y1: 0, x2: 1, y2: 1, paradas: [[0, OURO.claro], [0.55, OURO.meio], [1, OURO.escuro]] },
      { id: "odm-bolsa-cordao", tipo: "linear", x1: 0, y1: 0, x2: 0, y2: 1, paradas: [[0, BRONZE.claro], [1, BRONZE.meio]] },
    ],
    camadas: [
      CHAO,
      { el: "path", d: "M35 37C21 45 14 60 19 72c5 11 19 15 29 15s24-4 29-15c5-12-2-27-16-35z", fill: "url(#odm-bolsa-couro)", stroke: M.contorno, sw: 2 },
      { el: "ellipse", cx: 48, cy: 24, rx: 15, ry: 5.5, fill: M.couroDaBolsa.sombra, stroke: M.contorno, sw: 1.6 },
      { el: "ellipse", cx: 42, cy: 21, rx: 7, ry: 4.4, fill: "url(#odm-bolsa-ouro)", stroke: M.contorno, sw: 1.4, rot: -14 },
      { el: "ellipse", cx: 53, cy: 18, rx: 7, ry: 4.4, fill: "url(#odm-bolsa-ouro)", stroke: M.contorno, sw: 1.4, rot: 18 },
      { el: "path", d: "M49.5 16.5l5 1.5M38.5 20.5l5-1", stroke: OURO.brilho, sw: 1.2, fill: "none" },
      { el: "path", d: "M32 24c3 5 4 9 3 13h26c-1-4 0-8 3-13-5 4-10 5-16 5s-11-1-16-5z", fill: M.couroDaBolsa.meio, stroke: M.contorno, sw: 1.6 },
      { el: "path", d: "M40 30l1 7M48 31v6M56 30l-1 7", stroke: M.couroDaBolsa.sombra, sw: 1.2, fill: "none" },
      { el: "path", d: "M33 35q15 6 30 0v5q-15 6-30 0z", fill: "url(#odm-bolsa-cordao)", stroke: M.contorno, sw: 1.4 },
      { el: "path", d: "M46 41c-3 6-5 11-8 15M50 41c2 6 5 10 9 13", stroke: BRONZE.meio, sw: 2.4, fill: "none" },
      { el: "circle", cx: 48, cy: 40, r: 3.4, fill: BRONZE.claro, stroke: M.contorno, sw: 1.2 },
      { el: "path", d: "M38 56l-2 4 4-1zM59 54l3 3.5-4 0z", fill: BRONZE.claro, stroke: M.contorno, sw: 1 },
      { el: "path", d: "M24 66c5 10 15 14 24 14s19-4 24-14", stroke: M.couroDaBolsa.luz, sw: 1.2, fill: "none", dash: "2.2 2.2" },
      { el: "ellipse", cx: 33, cy: 56, rx: 4, ry: 8, fill: OURO.brilho, opacity: 0.22, rot: 20 },
      { el: "ellipse", cx: 78, cy: 83, rx: 6, ry: 2.6, fill: "url(#odm-bolsa-ouro)", stroke: M.contorno, sw: 1.2 },
    ],
  },
  codex: {
    rotulo: "Códex",
    gradientes: [
      { id: "odm-codex-capa", tipo: "linear", x1: 0, y1: 0, x2: 0.3, y2: 1, paradas: [[0, M.couroDoCodex.luz], [0.45, M.couroDoCodex.meio], [1, M.couroDoCodex.sombra]] },
      { id: "odm-codex-prata", tipo: "linear", x1: 0, y1: 0, x2: 1, y2: 1, paradas: [[0, PRATA.claro], [0.55, PRATA.meio], [1, PRATA.escuro]] },
      { id: "odm-codex-runa", tipo: "radial", cx: 0.5, cy: 0.5, r: 0.5, paradas: [[0, T.violetSoft], [0.6, T.violet], [1, M.couroDoCodex.meio]] },
    ],
    camadas: [
      CHAO,
      { el: "path", d: "M16 70h64v8a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z", fill: T.pergaminhoBorda, stroke: M.contorno, sw: 2 },
      { el: "path", d: "M20 75h56M20 78h56", stroke: M.rolo, sw: 0.9, fill: "none" },
      { el: "rect", x: 14, y: 12, width: 68, height: 62, rx: 5, fill: "url(#odm-codex-capa)", stroke: M.contorno, sw: 2 },
      { el: "rect", x: 16.5, y: 14.5, width: 63, height: 57, rx: 3.5, fill: "none", stroke: PRATA.meio, sw: 1.3 },
      { el: "path", d: "M24 12v62M72 12v62", stroke: "url(#odm-codex-prata)", sw: 3, fill: "none" },
      { el: "path", d: "M14 24V17a5 5 0 0 1 5-5h7l-12 12z", fill: "url(#odm-codex-prata)", stroke: M.contorno, sw: 1.4 },
      { el: "path", d: "M82 24V17a5 5 0 0 0-5-5h-7l12 12z", fill: "url(#odm-codex-prata)", stroke: M.contorno, sw: 1.4 },
      { el: "path", d: "M14 62v7a5 5 0 0 0 5 5h7L14 62z", fill: "url(#odm-codex-prata)", stroke: M.contorno, sw: 1.4 },
      { el: "path", d: "M82 62v7a5 5 0 0 1-5 5h-7l12-12z", fill: "url(#odm-codex-prata)", stroke: M.contorno, sw: 1.4 },
      { el: "circle", cx: 48, cy: 43, r: 17, fill: "url(#odm-codex-runa)", opacity: 0.55 },
      { el: "circle", cx: 48, cy: 43, r: 12, fill: M.couroDoCodex.sombra, stroke: "url(#odm-codex-prata)", sw: 3 },
      { el: "path", d: "M48 34v18M42 48l6-12 6 12M43.5 44h9", stroke: T.violetSoft, sw: 2, fill: "none" },
      { el: "circle", cx: 48, cy: 52, r: 1.6, fill: PRATA.brilho },
      { el: "circle", cx: 37, cy: 26, r: 1.2, fill: T.violetSoft },
      { el: "circle", cx: 60, cy: 24, r: 1.5, fill: T.violetSoft },
      { el: "circle", cx: 56, cy: 19, r: 0.9, fill: PRATA.brilho },
      { el: "path", d: "M27 14h42", stroke: M.couroDoCodex.luz, sw: 1.4, fill: "none" },
    ],
  },
  ascensao: {
    rotulo: "Ascensão",
    gradientes: [
      { id: "odm-ascensao-luz", tipo: "radial", cx: 0.5, cy: 0.5, r: 0.5, paradas: [[0, OURO.brilho], [0.4, T.amberSoft], [1, T.amberSoft, 0]] },
      { id: "odm-ascensao-ouro", tipo: "linear", x1: 0, y1: 0, x2: 0.4, y2: 1, paradas: [[0, OURO.claro], [0.5, OURO.meio], [1, BRONZE.meio]] },
    ],
    camadas: [
      CHAO,
      { el: "circle", cx: 48, cy: 42, r: 36, fill: "url(#odm-ascensao-luz)", opacity: 0.45 },
      { el: "path", d: "M48 4l2.4 14h-4.8zM21 15l9.5 10.5-3.6 3.2zM75 15l-5.9 13.7-3.6-3.2zM8 42l14-2.4v4.8zM88 42l-14 2.4v-4.8z", fill: T.amberSoft, opacity: 0.9 },
      { el: "circle", cx: 48, cy: 40, r: 27, fill: "none", stroke: OURO.claro, sw: 1.4, opacity: 0.8 },
      { el: "path", d: "M24 62L20 34l13 14 7-22 8 16 8-16 7 22 13-14-4 28z", fill: "url(#odm-ascensao-ouro)", stroke: M.contorno, sw: 2 },
      { el: "path", d: "M33 48l7-22 8 16 8-16 7 22", fill: "none", stroke: OURO.claro, sw: 1, opacity: 0.8 },
      { el: "path", d: "M22 61h52l-2 14H24z", fill: "url(#odm-ascensao-ouro)", stroke: M.contorno, sw: 2 },
      { el: "path", d: "M24 64.5h48", stroke: OURO.brilho, sw: 1.2, fill: "none" },
      { el: "circle", cx: 20, cy: 33, r: 3, fill: OURO.brilho, stroke: M.contorno, sw: 1.2 },
      { el: "circle", cx: 40, cy: 25, r: 3, fill: OURO.brilho, stroke: M.contorno, sw: 1.2 },
      { el: "circle", cx: 56, cy: 25, r: 3, fill: OURO.brilho, stroke: M.contorno, sw: 1.2 },
      { el: "circle", cx: 76, cy: 33, r: 3, fill: OURO.brilho, stroke: M.contorno, sw: 1.2 },
      { el: "path", d: "M48 63l5 5-5 5-5-5z", fill: GRANADA, stroke: M.contorno, sw: 1.2 },
      { el: "circle", cx: 33, cy: 68, r: 3, fill: AMETISTA, stroke: M.contorno, sw: 1.1 },
      { el: "circle", cx: 63, cy: 68, r: 3, fill: SAFIRA, stroke: M.contorno, sw: 1.1 },
      { el: "path", d: "M46.5 65.5l1.5-1", stroke: OURO.brilho, sw: 1, fill: "none" },
    ],
  },
};
})();

/* O ENCAIXE (AAA §3 e §9; a geometria é a do componente 253:352 no Figma,
   tirada do SVG dele): o quadrado de 56 de um item. O fio da raridade vai
   por dentro (inset 1, raio 5); o anel do foco e do escolhido fica de 3 a
   5 px por fora. A forma que sobe com a raridade: a gota (raro), os quatro
   cantos (épico), o brilho de dentro (lendário) e a estrela (único) —
   WCAG 1.4.1, a cor nunca é o único portador. Lido por painel-moldura.jsx
   e painel-equipamento.jsx. */
export const ENCAIXE = {
  lado: 56, raio: 6, icone: 32, rotulo: 11,
  vazio: { tracejado: 1, alfaDoGlifo: 0.35 },
  anel: { espessura: 2, folga: 3 },
  gota: { x: 7, y: 7, r: 3 },
  canto: { de: 3, braco: 9, espessura: 2.5 },
  estrela: { x: 46, y: 10, r: 6, miolo: 1.6 },
  brilho: { de: 0.35, ate: 0.55, fixo: 0.45, dura: 2400, raio: 10, fora: 8, alfaDeFora: 0.35 },
  sombra: PECAS_DA_MOLDURA.engaste,   /* o quase-preto do furo do engaste: a sombra do escolhido */
  sombraDoEscolhido: { y: 4, raio: 10, alfa: 0.6 },
  pressionado: { escala: 0.96, dura: 80 },
  marcas: {
    comum: [], incomum: [], raro: ["gota"], epico: ["cantos"],
    lendario: ["cantos", "brilho"], unico: ["cantos", "brilho", "estrela"],
  },
  /* o boneco (§3): a carta ao meio, três de cada lado, as botas por baixo */
  boneco: { esquerda: ["elmo", "amuleto", "armadura"], direita: ["arma", "escudo", "anel"], baixo: ["botas"] },
  nomes: { elmo: "Elmo", amuleto: "Amuleto", armadura: "Armadura", arma: "Arma", escudo: "Escudo", anel: "Anel", botas: "Botas" },
  tirar: { elmo: "Tirar o elmo", amuleto: "Tirar o amuleto", armadura: "Tirar a armadura", arma: "Largar a arma", escudo: "Tirar o escudo", anel: "Tirar o anel", botas: "Tirar as botas" },
  mochila: { telefone: 5, mesa: 6, folga: 10 },
};

/* A GAVETA DO ENCAIXE (§3 e §9, nó 255:506): folha de baixo no telefone,
   popover ao lado na mesa. Só os itens que cabem; o primeiro vem escolhido. */
export const GAVETA_DO_ENCAIXE = {
  sobe: 220, popover: 160, reduzido: 120,
  raio: 16, largura: 360, alca: { largura: 36, altura: 4 },
  enchimento: 16, folga: 12, alto: 0.85,
};

/* O DISCO DE ATRIBUTO (§2 e §9, componente 253:383): disco de 64 em
   panelSoft, o aro no metal do degrau do herói; ganhou = aro âmbar de 3 com
   halo de 14 a 0,55; ícone 20 em amberSoft, número Cinzel 22, rótulo 12,
   linha de baixo 11. A troca de estado leva 180 ms. */
export const DISCO_DE_ATRIBUTO = {
  lado: 64, aro: 2.5, aroGanhou: 3, halo: 14, alfaDoHalo: 0.55,
  icone: 20, numero: 22, rotulo: 12, linha: 11, folga: 6, dura: 180,
};

/* A TELA DA CERIMÓNIA (§4, quadros 256:501 a 256:669): o medalhão a ×2,4,
   «NÍVEL» em Cinzel 15 espaçado, o número em Cinzel 64. As faíscas saltam
   até `alcance` × o aro a partir do centro; a luz âmbar sobe de baixo a
   `luz`. Os tempos são todos de CERIMONIA_DO_NIVEL. */
export const CERIMONIA_DA_TELA = {
  escalaDoMedalhao: 2.4, rotulo: 15, espacoDoRotulo: 0.32, numero: 64,
  faisca: 4, alcance: 0.75, luz: 0.42, forjaDe: 1.08, pulso: 1.06, subida: 8,
  /* a gema do medalhão (§8: o engaste em 50,10 com r 5,6 + 2,4), em unidades do aro de 80 */
  gema: { x: 50, y: 10, r: 8 },
  largura: 440, enchimento: 24,
};

/* A FICHA COMO CARTA (§2, nós 255:113 e 257:1110): a carta a 120 no
   telefone (cabe com o nome ao lado em 375) e a x1,6 na mesa (256); o nome
   em Cinzel; as barras de PV e PM; os discos em 3 x 2. Na mesa a ficha e
   o equipamento são uma tela só, em três colunas. */
export const FICHA_CARTA = {
  carta: { telefone: 120, mesa: 256 },
  nome: { telefone: 22, mesa: 26 },
  barra: 8, folga: 16, colunas: 3,
  /* as letras da ficha e da gaveta: o nome do item (Cinzel), a linha da
     comparação, a nota miúda (a raridade, o tempo da troca, a secção) */
  texto: { item: 18, linha: 14, nota: 13 },
  /* a placa do nome na carta (§8: o rect x 10, y 156, 140 x 56, em unidades da carta de 160) */
  placa: { x: 10, y: 156, largura: 140, altura: 56 },
  /* a carta e o boneco medem-se a si mesmos (auto); a ficha do meio fica com o resto */
  mesa: { colunas: ["auto", "minmax(280px, 1fr)", "auto"], folga: 32 },
};

/* ============================================================
   AR · AS TELAS QUE FALTAVAM À AAA (05/11/2026) — formas.md §AR.
   O Diário (portal de missões), os Talentos (a árvore), o Grupo e o
   Mercado. Figma: página «AR · 05/11» (268:2).
   Entram aqui, por agora, só as tabelas das peças comuns e do Diário
   (§AR 10, passos 1 e 2): as da árvore, do Grupo e do Mercado chegam com
   a tela que as lê — export sem leitor mente.
   ============================================================ */

/* OS GLIFOS NOVOS: quadro 24, traço 1,5, pontas e juntas redondas (a família
   de ui.jsx). A cor vem de quem desenha. Desenha-os `GlifoAR`
   (painel-ar-pecas.jsx), que aceita vários caminhos por glifo. */
export const ICONES_DA_ETAPA = {
  ir_a: ["M21 12a9 9 0 1 1-18 0a9 9 0 1 1 18 0", "M15.5 8.5l-2 5-5 2 2-5z"],
  derrotar: ["M20 4h-3.6L7.2 13.2l3.6 3.6L20 7.6z", "M5.2 11.6l7.2 7.2", "M7.6 16.4L4 20"],
  achar: ["M15.5 10.5a5.5 5.5 0 1 1-11 0a5.5 5.5 0 1 1 11 0", "M14.5 14.5L20 20"],
  falar_com: ["M4 5h16v10H10l-4 4v-4H4z", "M8 9h8M8 12h5"],
  levar_a: ["M4 8l8-4 8 4v8l-8 4-8-4z", "M4 8l8 4 8-4", "M12 12v8"],
  resgatar: ["M9 7.5L6.5 5a3 3 0 0 0-4.2 4.2L5 12", "M15 16.5l2.5 2.5a3 3 0 0 0 4.2-4.2L19 12", "M9 15l6-6", "M14 4l1-2M10 20l-1 2"],
  revelar: ["M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z", "M15 12a3 3 0 1 1-6 0a3 3 0 1 1 6 0"],
  concluir_masmorra: ["M6 21V10a6 6 0 0 1 12 0v11", "M3 21h18", "M14.5 14v1.5"],
  aguentar: ["M7 3h10M7 21h10", "M8 3c0 5 8 5 8 9s-8 4-8 9", "M16 3c0 5-8 5-8 9s8 4 8 9"],
  vencer_relogio: ["M20 12a8 8 0 1 1-16 0a8 8 0 1 1 16 0", "M12 7.5V12l3 2"],
  /* BQ7 (08/11): a etapa de uma quest da biblioteca (missoes.js, `quest`).
     Provisório, do `backend`: a estrela de quatro pontas da família, até o
     `desenho` lhe dar a forma dela. */
  quest: ["M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3L3.5 11l6.3-2.2z"],
};
export const ICONES_DO_TALENTO = {
  ataque: ICONES_DA_ETAPA.derrotar,
  defesa: ["M12 3l7 2.5V11c0 4.8-3 8-7 10-4-2-7-5.2-7-10V5.5z", "M12 7v10M8.5 11h7"],
  suporte: ["M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z", "M12 9v5M9.5 11.5h5"],
  utilidade: ["M10 12a3.5 3.5 0 1 1-7 0a3.5 3.5 0 1 1 7 0", "M10 12h11", "M18 12v3M15 12v2.5"],
  passiva: ["M15.5 12a3.5 3.5 0 1 1-7 0a3.5 3.5 0 1 1 7 0", "M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"],
  magia: ["M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3L3.5 11l6.3-2.2z", "M19 3v3M17.5 4.5h3"],
};
export const ICONES_DA_INTERFACE = {
  visto: ["M5 12.5l4.5 4.5L19 7"],
  cadeado: ["M7.5 11V8a4.5 4.5 0 0 1 9 0v3", "M5.5 11h13v9.5h-13z", "M12 14.5v2.5"],
  interrogacao: ["M9.2 9a3 3 0 1 1 4.3 2.7c-1 .5-1.5 1.2-1.5 2.3", "M12 17.5v.5"],
  fechar: ["M6 6l12 12M18 6L6 18"],
  pino: ["M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z", "M14.5 10a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0"],
  seta: ["M5 12h14", "M13 6l6 6-6 6"],
  estrela: ["M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.4l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z"],
  bolsa: ["M8 7.5c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5", "M5.5 9h13l-1.3 10.5a1.5 1.5 0 0 1-1.5 1.5H8.3a1.5 1.5 0 0 1-1.5-1.5z", "M9.5 13h5"],
};

/* A BARRA DE CIMA DE TODA TELA ABERTA DA MESA (Cabeçalho da tela, 271:214):
   o objeto (ou a porta) que se tocou, o título em Cinzel Bold espaçado, o
   estado numa linha e o fechar (Esc faz o mesmo). Chão couroBaixo, o fio de
   ouro por baixo. */
export const CABECALHO_DA_TELA = {
  mesa: { alto: 72, objeto: 48, lado: 24, folga: 16 },
  telefone: { alto: 56, objeto: 40, lado: 12, folga: 10 },
  titulo: { tamanho: TIPOS.titulo, espaco: 0.12 },
  subtitulo: TIPOS.rotulo,
  fechar: 44,
  fio: { espessura: 1, alfa: 0.45 },
};
/* As abas dentro de uma tela (Aba da tela, 271:151): a ALVOS.piso de alto, o
   fio de ouro de 3 por baixo da ativa; a novidade é a gota da MarcaDaPorta. */
export const ABA_DA_TELA = { alto: ALVOS.piso, fio: 3, gota: 8, largura: { mesa: 140, telefone: "1fr" } };

/* O DIÁRIO, UM PORTAL DE MISSÕES (§AR 2; 273:296, 274:440, 274:649). */
export const DIARIO_DE_MISSOES = {
  mesa: { colunas: ["380px", "1fr", "420px"], folga: 24 },
  meia: { colunas: ["340px", "1fr"], folga: 20 },          /* 1280: o mundo dobra-se para o fim do índice */
  telefone: { abas: ["Em curso", "Ofertas", "Estante"] },
  indice: { largura: 340, alto: 64, medalhao: 36, relogio: 32 },
  glifoDoTipo: { principal: "★", divina: "★", trama: "✦", cacada: "◆", contrato: "◆", favor: "◆", global: "◆", oferta: "?" },
  titulo: { mesa: 26, telefone: TIPOS.titulo },              /* a medida do nome na ficha-carta */
  proximoPasso: { medalhao: { mesa: 52, telefone: 40 }, glifo: { mesa: 26, telefone: 20 }, borda: 2, raio: 14, halo: { alfa: 0.35, raio: 16 }, frase: { mesa: TIPOS.titulo, telefone: TIPOS.prosa } },
  etapa: { medalhao: 32, glifo: 18, fio: { largura: 2, alto: 24 }, folga: 14 },
  bilhete: { giro: 0.8, enchimento: [16, 18], raio: 4, largura: 380 },
  lombada: { alto: 52, espinha: 14, frisos: [8, 41], friso: 3, selo: 24,
    /* BQ (08/11, §BQ 3): a história do coração fecha num desfecho, e a
       estante guarda-o sem o ordenar — frisos de bronze e o selo do coração
       (desfecho), frisos de ferro e a fita de luto (luto). «friso» é a
       espessura (AR); a cor de cada estado mora em «corDoFriso». */
    corDoFriso: { concluida: MOLDURA_POR_DEGRAU.ouro.meio, falhada: MOLDURA_POR_DEGRAU.ferro.meio, desfecho: MOLDURA_POR_DEGRAU.bronze.meio, luto: MOLDURA_POR_DEGRAU.ferro.meio },
    seloDe: { desfecho: { chao: T.panelSoft, aro: T.rosa, glifo: "coracao" }, luto: { chao: T.couroBaixo, aro: T.inkDim, glifo: "fita" } },
    fitaDeLuto: { largura: 4, x: 22, cor: T.inkDim },
  },
  /* AR2 · a largura que o próprio painel mede em si (não a da janela: o
     Diário vive na gaveta de 320 e há de viver na tela inteira) e que
     escolhe o leiaute — as três colunas pedem 380 + 420 + o meio; as duas,
     340 + o meio. Abaixo de "meia" são as três abas do telefone. */
  corte: { mesa: 1500, meia: 900 },
};
/* Os quatro estados de uma etapa: a FORMA (o glifo e o tracejado) é a
   leitura, a cor é a segunda. "tipo" = o glifo de ICONES_DA_ETAPA da etapa. */
export const ETAPA_DA_MISSAO = {
  feita: { chao: T.okFundo, aro: T.ok, glifo: "visto", texto: T.inkMeio, nota: T.inkDim, fio: T.ok, alfaDoFio: 0.7 },
  atual: { chao: T.couro, aro: T.amber, espessura: 2, glifo: "tipo", corDoGlifo: T.amberSoft, texto: T.ink, nota: T.amberSoft, fio: T.lineStrong, alfaDoFio: 0.6, halo: { alfa: 0.45, raio: 12 } },
  silhueta: { chao: null, aro: T.lineStrong, tracejado: [3, 3], glifo: "interrogacao", texto: T.inkDim, nota: T.inkDim, fio: T.lineStrong, alfaDoFio: 0.35 },
  falhada: { chao: T.perigoFundo, aro: T.danger, glifo: "fechar", texto: T.inkMeio, nota: T.danger, fio: T.danger, alfaDoFio: 0.5 },
  /* BQ (08/11, §BQ 3, 316:6752): o marco da reviravolta, no sítio em que
     aconteceu — o glifo, o aro e a nota em rosa (o lacre: 4,61 no couro,
     5,05 no panel) */
  virou: { chao: T.couro, aro: T.rosa, espessura: 2, glifo: "reviravolta", corDoGlifo: T.rosa, texto: T.ink, nota: T.rosa, fio: T.lineStrong, alfaDoFio: 0.6, halo: { alfa: 0.45, raio: 12 } },
};
/* O relógio do prazo (269:100): um gomo por noite; o gomo cheio é a noite
   que passou; o número ao meio é o que resta. Aperta com restam <= 2. */
export const RELOGIO_DO_PRAZO = { lado: 40, mini: 32, miolo: 0.58, folga: 0.06, apertaCom: 2, cheio: { calma: T.amber, aperta: T.danger }, vazio: { chao: T.panelSoft, aro: T.lineStrong } };

/* ============================================================
   BQ · AS QUESTS NA TELA (08/11/2026) — formas.md §BQ; Figma 313:2.
   A encruzilhada (a escolha de uma quest: uma mão de cartas de duas
   faces, a gravidade pela forma, dois toques), o Diário das duas
   histórias (a estrada em couro e âmbar, a do coração em papel e lacre)
   e o cartaz da sombra. As peças: painel-encruzilhada.jsx, as de
   painel-ar-pecas.jsx (LinhaDoQueFalta, CaminhosDaEtapa, RostoDaHistoria)
   e as de painel-diario.jsx (QuestDoCoracao, CartazDaSombra).
   As palavras de cada peça moram aqui, ao lado da forma: são as que o
   Figma escreve, e a suíte lê-as de volta.
   ============================================================ */
export const ENCRUZILHADA = {
  /* Momento=escolha | escolha de vida (316:2063 · 316:2075) */
  soleira: { glifo: "encruzilhada", recuo: "Depois", verbo: "Decidir", caminhos: { um: "caminho", varios: "caminhos" } },
  veu: 0.55,
  mesa: { largura: { ate3: 900, com4: 1060 }, raio: 16, enchimento: [24, 28], vao: 16, aro: 1.5, acimaDoCampo: 16, topo: 64,
    titulo: 30, contexto: { tamanho: TIPOS.corpo, entrelinha: 22 } },
  telefone: { lado: 6, cima: 8, raio: { cima: 16, baixo: 12 }, enchimento: [8, 16, 12], vao: 12, titulo: 26,
    contexto: { tamanho: 14, entrelinha: 20 }, virada: 132 },
  carta: { largura: { mesa: 216, telefone: 331 }, raio: 10, enchimento: 16, vao: 10,
    verbo: { tamanho: 21, entrelinha: 24 }, rotulo: { tamanho: TIPOS.maquina, espacamento: 1.2 }, texto: { tamanho: 14, entrelinha: 20 },
    chao: T.pergaminho, aro: T.pergaminhoBorda, tinta: T.tintaDoPergaminho, ganha: T.musgoNoPergaminho, custa: T.perigoNoPergaminho,
    picote: { cor: T.tintaDoPergaminhoDim, alfa: 0.5, traco: [3, 3] },
    escolhida: { aro: T.amber, espessura: 3, sobe: 8, sombra: { y: 10, raio: 24, alfa: 0.5 }, tag: { chao: T.amber, letra: T.onAccent } } },
  virada: { chao: T.couro, aro: MOLDURA_POR_DEGRAU.ouro.meio, medalhao: 44, titulo: 20 },
  confirmar: { alto: ALVOS.piso, calado: "Escolhe uma carta", leve: "Escolher: {texto}", preco: "Pagar ◉ {n}", fecha: "{texto}, e acabar aqui" },
  movimento: { dar: { dura: 180, entre: 60, sobe: 12, giro: 2 }, escolher: { dura: 120 }, folha: { dura: 220 } },  /* reduzido: tudo seco */
  /* as palavras da cabeça, da carta e do rodapé (318:900 · 317:11) */
  textos: {
    cabeca: "Uma escolha", ganhas: "Ganhas", custa: "Custa", escolhida: "A tua escolha",
    virada: { titulo: "Há outras maneiras.", linha: "Fá-lo à tua maneira: escreve o que fazes." },
    rodape: { mesa: "Ou escreve o que fazes — o campo continua aberto, e a tua frase pode ser uma destas cartas.", telefone: "Ou escreve o que fazes no campo, aqui em baixo." },
  },
};
export const GRAVIDADE_DA_ESCOLHA = {
  ordem: ["vida", "fecha", "preco", "leve"],       /* a soleira mostra a mais grave das cartas */
  vida: { aro: T.danger, espessura: 2, faixa: { chao: T.perigoFundo, letra: T.ink, rosto: 32, aroDoRosto: T.danger, raio: 6 },
    soleira: T.danger, botao: T.danger,
    frase: { pode: "Pode custar a vida de {quem}.", certo: "Com o que há hoje entre vocês, custa a vida de {quem}." },
    noSoleira: "pode custar {quem}", verbo: "Escolher, e arriscar {quem}" },
  fecha: { cor: T.perigoNoPergaminho, selo: 24, frase: "Esta história acaba aqui." },
  preco: { chao: T.couro, letra: T.amberSoft, frase: "◉ {n} da tua bolsa", impedida: { chao: T.perigoFundo, letra: T.ink, frase: "faltam ◉ {n}", tracejado: [4, 3] } },
  leve: {},
};
export const DIARIO_DA_QUEST = {
  falta: { doOu: 2, resto: "ou outro caminho", marca: 12, conta: { ponto: 6, entre: 4, max: 5 } },
  caminhos: { glifo: "encruzilhada", lado: 16, tamanho: 13, entrelinha: 18, recuo: 46, abertos: "Fecha por mais de um caminho." },
  gente: { rosto: 44, aro: 2, largura: 72, aroConhecido: MOLDURA_POR_DEGRAU.bronze.meio, traiu: { cor: T.danger, racha: 2, selo: 20 }, rotulo: "Gente desta história" },
  reviravolta: { cor: T.rosa, glifo: "reviravolta", porLer: "topo", lida: "linha", rotulo: "A história virou", noIndice: "a história virou",
    bilhete: { chao: T.pergaminho, aro: T.pergaminhoBorda, rotulo: T.lacreNoPergaminho, texto: T.tintaDoPergaminho, enchimento: [12, 14], raio: 4 } },
  coracao: { chao: T.pergaminho, raio: 6, fita: { cor: T.rosa, largura: 6 }, marca: T.lacreNoPergaminho,
    rosto: { mesa: 44, telefone: 36, aro: MOLDURA_POR_DEGRAU.bronze.meio }, titulo: { mesa: 22, telefone: 20 },
    rosario: { conta: 12, entre: 6 }, passo: { mesa: 17, telefone: 16 }, com: "Com {quem}" },
  indice: { estrada: "A ESTRADA", coracao: "QUEM ANDA CONTIGO", glifoDoCoracao: "❦" },
};
export const CARTAZ_DA_SOMBRA = {
  largura: 420, raio: 12, enchimento: 16, vao: 12, retrato: { largura: 64, alto: 80, arco: 32 },
  aro: { semRosto: MOLDURA_POR_DEGRAU.ferro.meio, comRosto: MOLDURA_POR_DEGRAU.ouro.meio },
  semNome: "Alguém", linhas: 3,
  nova: { traco: T.amberSoft, letra: T.ink }, velha: { traco: T.inkDim, letra: T.inkMeio },
  plano: { alto: 8, raio: 4, feito: T.danger, travado: T.ok, agora: T.amber, porVir: T.panelSoft },
  /* as palavras do cartaz (315:189): o rótulo, e o que se diz de quem ainda não tem nome */
  rotulo: "A mão por trás", semRosto: "sem nome, sem rosto", comMao: "sem nome — mas tem quem o sirva", mais: "e mais {n}",
};

/* OS TALENTOS, A ÁRVORE (§AR 3; 276:685, 278:1047, 278:1537, 280:1556).
   A forma do nó diz o ramo; a insígnia diz o estado; o veredito diz o
   preço antes do toque. Desenha-os NoDeTalento (painel-ar-pecas.jsx). */
export const NO_DE_TALENTO = {
  lado: 64, largura: { mesa: 80, meia: 88, telefone: 84 }, rotulo: TIPOS.piso, folga: 6, glifo: 28,
  formas: {
    classe: { el: "rect", x: 4, y: 4, width: 56, height: 56, rx: 14 },
    subclasse: { el: "path", d: "M32 2L62 32L32 62L2 32Z", raio: 6 },
    especializacao: { el: "path", d: "M32 3L58 11V31C58 45 47 56 32 61C17 56 6 45 6 31V11Z" },
    magia: { el: "circle", cx: 32, cy: 32, r: 29 },
  },
  /* o aro de quem aprendeu é o metal do ramo; "gema" = GEMA_DA_SUBCLASSE[sub].corpo */
  aroAprendido: { classe: MOLDURA_POR_DEGRAU.ouro.meio, subclasse: "gema", especializacao: MOLDURA_POR_DEGRAU.prata.meio, magia: T.violet },
  estados: {
    aprendido: { chao: T.couro, espessura: 3, glifo: "luz", insignia: "visto" },
    disponivel: { chao: T.panelSoft, aro: T.amber, espessura: 2, glifo: T.ink, insignia: "custo", halo: { alfa: 0.4, raio: 12 } },
    bloqueado: { chao: T.panel, aro: T.lineStrong, espessura: 1.5, tracejado: [4, 3], glifo: T.inkDim, alfaDoGlifo: 0.7, insignia: "cadeado" },
    escolhido: { chao: T.panelSoft, aro: T.amber, espessura: 2, glifo: T.ink, insignia: "custo", anel: { cor: MOLDURA_POR_DEGRAU.ouro.claro, escala: 1.22, espessura: 2 }, halo: { alfa: 0.6, raio: 18 } },
  },
  /* a luz do glifo quando aprendido: classe amberSoft, subclasse a luz da gema, especialização ink, magia violetSoft */
  luz: { classe: T.amberSoft, subclasse: "gema", especializacao: T.ink, magia: T.violetSoft },
  insignia: { lado: 22, x: 46, y: 44, glifo: 14, custo: { fonte: "JetBrains Mono", peso: 700, tamanho: TIPOS.maquina } },
  pressionado: ENCAIXE.pressionado,
};
export const LIGACAO = { acesa: { cor: MOLDURA_POR_DEGRAU.ouro.meio, espessura: 3, brilho: { alfa: 0.55, raio: 6 } }, apagada: { cor: T.lineStrong, espessura: 2, alfa: 0.55 } };
export const ARVORE_DE_TALENTOS = {
  colunas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14],
  mesa: { rotulos: 150, passo: 78, linhas: { classe: [110, 222], subclasse: 350, especializacao: [470, 580] }, veredito: 420, esquerda: 280 },
  meia: { rotulos: 140, passo: 88, linhas: { classe: [96, 200], subclasse: 316, especializacao: [426, 530] }, popover: 340 },
  telefone: { passoVertical: 124, colunas: { classe: [96, 186], subclasse: 290 } },
  regua: { numero: 13, fio: 2, andado: 3, aqui: 10 },
  /* o tronco da especialização desce entre o degrau 9 e o 10 */
  nascente: { subclasse: 3, especializacao: 10 },
};
/* O selo de pontos por gastar (270:256). O algarismo NÃO é Cinzel: o 1 do
   Cinzel lê-se I. */
export const SELO_DE_PONTOS = { numero: { fonte: "Spectral", peso: 600, tamanho: 28 }, borda: 2, raio: 10, halo: { alfa: 0.35, raio: 10 } };
/* A cerimónia de aprender (280:1858). Nada espera por ela: o toque seguinte vale desde o 0. */
export const CERIMONIA_DE_APRENDER = {
  toque: { dura: 80, escala: 0.96 },
  selo: { de: 0, dura: 240, escala: 1.12, insignia: 120, sobe: 16 },
  fio: { de: 240, dura: 380 },
  pontos: { de: 240, dura: 240 },
  frase: { de: 620, dura: 280, sobe: 8, fica: 1600 },
  total: 900,
  reduzido: { dura: 160 },
};

/* AR 11 · A CONSTELAÇÃO DO HERÓI (aprovada a 07/11) — formas.md §AR 11. A
   geometria é FIGURAS_DA_CONSTELACAO e LUGAR_DAS_FIGURAS, copiadas tal qual de
   mente/figma/constelacao-geometria.mjs. A única cor nova da fase é o céu.
   O acender.escala é o 1,35 de «Acender uma estrela» (302:4813), escrito
   em prosa na secção e trazido para a tabela para o CSS o ler. */
export const CONSTELACAO = {
  ceu: "#0B1426",                                   /* o fundo — Figma ar/ceu/fundo */
  estrela: "#FFF4D6",                               /* só as estrelas de fundo (decoração) — ar/ceu/estrela */
  fundo: { quantas: { mesa: 140, telefone: 60 }, raio: [0.6, 1.7], alfa: [0.18, 0.48] },
  lado: { mesa: 600, telefone: 343 },
  topo: { mesa: 76, telefone: 44 },
  minimo: 0.07,
  alvo: { maximo: 44, minimo: 24 },
  acesa: { raio: { mesa: 5, telefone: 4 }, halo: { raio: { mesa: 16, telefone: 13 }, alfa: 0.18 } },
  disponivel: { anel: { mesa: 7, telefone: 6 }, espessura: 2, cor: T.amber, miolo: 2.5 },
  porAcender: { raio: { mesa: 2.5, telefone: 2 }, cor: T.inkDim },
  escolhida: { anel: { mesa: 12, telefone: 10 }, espessura: 2, cor: MOLDURA_POR_DEGRAU.ouro.claro },
  /* "gema" = GEMA_DA_SUBCLASSE[sub]: a luz na estrela, o corpo na ligação */
  metal: {
    classe: { luz: MOLDURA_POR_DEGRAU.ouro.claro, fio: MOLDURA_POR_DEGRAU.ouro.meio },
    subclasse: { luz: "gema.luz", fio: "gema.corpo" },
    especializacao: { luz: MOLDURA_POR_DEGRAU.prata.claro, fio: MOLDURA_POR_DEGRAU.prata.meio },
  },
  ligacao: { acesa: { espessura: { mesa: 2, telefone: 1.6 } }, apagada: { cor: T.lineStrong, espessura: 1, tracejado: [3, 5] } },
  rotulo: { tamanho: TIPOS.piso, afastamento: 13, acesa: T.ink, disponivel: T.inkMeio, escolhida: MOLDURA_POR_DEGRAU.ouro.claro,
    ponta: { fonte: "Cinzel", tamanho: TIPOS.piso, especializacao: MOLDURA_POR_DEGRAU.prata.claro } },
  figuraDeTras: { moldura: T.lineStrong, tracejado: [4, 4], raio: 14 },
  fecho: { brilho: 600 },
  saida: { bracos: 320, reduzido: 120 },
  acender: { escala: 1.35 },
};

export const FIGURAS_DA_CONSTELACAO = {
  "Guerreiro": {
    figura: "o escudo",
    raiz: "Quebra-Guarda",
    estrelas: {
      "Golpe Poderoso": [0.34, 0.08],
      "Postura Defensiva": [0.5, 0.05],
      "Investida": [0.66, 0.08],
      "Provocação": [0.7, 0.19],
      "Grito de Guerra": [0.68, 0.3],
      "Segundo Fôlego": [0.6, 0.38],
      "Quebra-Guarda": [0.5, 0.44],
      "Muralha": [0.4, 0.38],
      "Ataque Duplo": [0.32, 0.3],
      "Indomável": [0.3, 0.19],
      "Fúria de Batalha": [0.5, 0.17],
      "Golpe Decisivo": [0.5, 0.3],
    },
    ligacoes: [["Golpe Poderoso", "Postura Defensiva"], ["Postura Defensiva", "Investida"], ["Investida", "Provocação"], ["Provocação", "Grito de Guerra"], ["Grito de Guerra", "Segundo Fôlego"], ["Segundo Fôlego", "Quebra-Guarda"], ["Quebra-Guarda", "Muralha"], ["Muralha", "Ataque Duplo"], ["Ataque Duplo", "Indomável"], ["Indomável", "Golpe Poderoso"], ["Postura Defensiva", "Fúria de Batalha"], ["Fúria de Batalha", "Golpe Decisivo"], ["Golpe Decisivo", "Quebra-Guarda"]],
    bracos: {
      "Cavaleiro": {
        estrelas: {
          "Juramento de Guarda": [0.433, 0.52],
          "Provocação de Ferro": [0.379, 0.573],
          "Muralha Viva": [0.319, 0.619],
          "Voto Inquebrável": [0.256, 0.658],
        },
        ligacoes: [[null, "Juramento de Guarda"], ["Juramento de Guarda", "Provocação de Ferro"], ["Provocação de Ferro", "Muralha Viva"], ["Muralha Viva", "Voto Inquebrável"]],
        ramos: {
          "Sentinela": { estrelas: { "Postura de Vigília": [0.181, 0.658], "Escudo do Aliado Caído": [0.109, 0.658], "Nada Passa": [0.037, 0.658] }, ligacoes: [[null, "Postura de Vigília"], ["Postura de Vigília", "Escudo do Aliado Caído"], ["Escudo do Aliado Caído", "Nada Passa"]] },
          "Juramentado": { estrelas: { "Voto de Ferro": [0.223, 0.725], "Punição do Perjuro": [0.192, 0.79], "Juramento Final": [0.16, 0.855] }, ligacoes: [[null, "Voto de Ferro"], ["Voto de Ferro", "Punição do Perjuro"], ["Punição do Perjuro", "Juramento Final"]] },
        },
      },
      "Bárbaro": {
        estrelas: {
          "Fúria Sangrenta": [0.5, 0.545],
          "Pele de Pedra": [0.5, 0.62],
          "Golpe Dilacerante": [0.5, 0.695],
          "Último Rugido": [0.5, 0.77],
        },
        ligacoes: [[null, "Fúria Sangrenta"], ["Fúria Sangrenta", "Pele de Pedra"], ["Pele de Pedra", "Golpe Dilacerante"], ["Golpe Dilacerante", "Último Rugido"]],
        ramos: {
          "Fúria Ancestral": { estrelas: { "Sangue dos Antigos": [0.46, 0.834], "Pele de Totem": [0.422, 0.895], "Rugido dos que Vieram Antes": [0.384, 0.956] }, ligacoes: [[null, "Sangue dos Antigos"], ["Sangue dos Antigos", "Pele de Totem"], ["Pele de Totem", "Rugido dos que Vieram Antes"]] },
          "Devorador": { estrelas: { "Sede de Carne": [0.54, 0.834], "Banquete de Guerra": [0.578, 0.895], "Fome Sem Fundo": [0.616, 0.956] }, ligacoes: [[null, "Sede de Carne"], ["Sede de Carne", "Banquete de Guerra"], ["Banquete de Guerra", "Fome Sem Fundo"]] },
        },
      },
      "Gladiador": {
        estrelas: {
          "Finta da Arena": [0.567, 0.52],
          "Aplauso da Multidão": [0.621, 0.573],
          "Duelo Declarado": [0.681, 0.619],
          "Espetáculo Final": [0.744, 0.658],
        },
        ligacoes: [[null, "Finta da Arena"], ["Finta da Arena", "Aplauso da Multidão"], ["Aplauso da Multidão", "Duelo Declarado"], ["Duelo Declarado", "Espetáculo Final"]],
        ramos: {
          "Duelista": { estrelas: { "Linha da Lâmina": [0.777, 0.725], "Resposta do Mestre": [0.808, 0.79], "Estocada Perfeita": [0.84, 0.855] }, ligacoes: [[null, "Linha da Lâmina"], ["Linha da Lâmina", "Resposta do Mestre"], ["Resposta do Mestre", "Estocada Perfeita"]] },
          "Provocador": { estrelas: { "Insulto Certeiro": [0.819, 0.658], "Palco Aberto": [0.891, 0.658], "Ovação": [0.963, 0.658] }, ligacoes: [[null, "Insulto Certeiro"], ["Insulto Certeiro", "Palco Aberto"], ["Palco Aberto", "Ovação"]] },
        },
      },
    },
  },
  "Mago": {
    figura: "o cajado",
    raiz: "Projétil Arcano",
    estrelas: {
      "Projétil Arcano": [0.5, 0.44],
      "Escudo Arcano": [0.52, 0.36],
      "Rajada de Fogo": [0.54, 0.28],
      "Toque Gélido": [0.56, 0.2],
      "Ler Auras": [0.58, 0.12],
      "Corrente de Raios": [0.51, 0.07],
      "Passo Étereo": [0.58, 0.03],
      "Lentidão": [0.65, 0.07],
      "Bola de Fogo": [0.66, 0.15],
      "Prisão Arcana": [0.42, 0.12],
      "Contramágica": [0.34, 0.18],
      "Muralha de Gelo": [0.29, 0.27],
      "Invisibilidade": [0.75, 0.12],
      "Meteoro": [0.78, 0.22],
      "Voo": [0.73, 0.31],
      "Reescrever o Instante": [0.65, 0.37],
    },
    ligacoes: [["Projétil Arcano", "Escudo Arcano"], ["Escudo Arcano", "Rajada de Fogo"], ["Rajada de Fogo", "Toque Gélido"], ["Toque Gélido", "Ler Auras"], ["Ler Auras", "Corrente de Raios"], ["Corrente de Raios", "Passo Étereo"], ["Passo Étereo", "Lentidão"], ["Lentidão", "Bola de Fogo"], ["Bola de Fogo", "Ler Auras"], ["Corrente de Raios", "Prisão Arcana"], ["Prisão Arcana", "Contramágica"], ["Contramágica", "Muralha de Gelo"], ["Bola de Fogo", "Invisibilidade"], ["Invisibilidade", "Meteoro"], ["Meteoro", "Voo"], ["Voo", "Reescrever o Instante"]],
    bracos: {
      "Elementalista": {
        estrelas: {
          "Manto Flamejante": [0.433, 0.52],
          "Lança de Gelo": [0.379, 0.573],
          "Tempestade Elemental": [0.319, 0.619],
          "Convergência": [0.256, 0.658],
        },
        ligacoes: [[null, "Manto Flamejante"], ["Manto Flamejante", "Lança de Gelo"], ["Lança de Gelo", "Tempestade Elemental"], ["Tempestade Elemental", "Convergência"]],
        ramos: {
          "Piromante": { estrelas: { "Brasa Persistente": [0.181, 0.658], "Sopro de Forja": [0.109, 0.658], "Estrela Ígnea": [0.037, 0.658] }, ligacoes: [[null, "Brasa Persistente"], ["Brasa Persistente", "Sopro de Forja"], ["Sopro de Forja", "Estrela Ígnea"]] },
          "Criomante": { estrelas: { "Mordida do Inverno": [0.223, 0.725], "Armadura de Geada": [0.192, 0.79], "Zero Absoluto": [0.16, 0.855] }, ligacoes: [[null, "Mordida do Inverno"], ["Mordida do Inverno", "Armadura de Geada"], ["Armadura de Geada", "Zero Absoluto"]] },
        },
      },
      "Necromante": {
        estrelas: {
          "Toque Sepulcral": [0.5, 0.545],
          "Servos de Osso": [0.5, 0.62],
          "Colheita de Almas": [0.5, 0.695],
          "Véu da Morte": [0.5, 0.77],
        },
        ligacoes: [[null, "Toque Sepulcral"], ["Toque Sepulcral", "Servos de Osso"], ["Servos de Osso", "Colheita de Almas"], ["Colheita de Almas", "Véu da Morte"]],
        ramos: {
          "Ceifador": { estrelas: { "Foice de Sombra": [0.46, 0.834], "Marca do Fim": [0.422, 0.895], "Colheita Final": [0.384, 0.956] }, ligacoes: [[null, "Foice de Sombra"], ["Foice de Sombra", "Marca do Fim"], ["Marca do Fim", "Colheita Final"]] },
          "Regente dos Ossos": { estrelas: { "Legião de Ossos": [0.54, 0.834], "Trono de Caveiras": [0.578, 0.895], "Grande Necrópole": [0.616, 0.956] }, ligacoes: [[null, "Legião de Ossos"], ["Legião de Ossos", "Trono de Caveiras"], ["Trono de Caveiras", "Grande Necrópole"]] },
        },
      },
      "Arcanista": {
        estrelas: {
          "Dilatação": [0.567, 0.52],
          "Contratempo": [0.621, 0.573],
          "Âmbar do Tempo": [0.681, 0.619],
          "Ferida que Não Houve": [0.744, 0.658],
        },
        ligacoes: [[null, "Dilatação"], ["Dilatação", "Contratempo"], ["Contratempo", "Âmbar do Tempo"], ["Âmbar do Tempo", "Ferida que Não Houve"]],
        ramos: {
          "Cronomante": { estrelas: { "Instante Roubado": [0.777, 0.725], "Bolha Estagnada": [0.808, 0.79], "Volta Atrás": [0.84, 0.855] }, ligacoes: [[null, "Instante Roubado"], ["Instante Roubado", "Bolha Estagnada"], ["Bolha Estagnada", "Volta Atrás"]] },
          "Teurgista": { estrelas: { "Geometria Viva": [0.819, 0.658], "Empréstimo Arcano": [0.891, 0.658], "Palavra Primeira": [0.963, 0.658] }, ligacoes: [[null, "Geometria Viva"], ["Geometria Viva", "Empréstimo Arcano"], ["Empréstimo Arcano", "Palavra Primeira"]] },
        },
      },
    },
  },
  "Ladino": {
    figura: "a adaga",
    raiz: "Ataque Furtivo",
    estrelas: {
      "Ataque Furtivo": [0.5, 0.44],
      "Esquiva Ágil": [0.5, 0.365],
      "Passos Silenciosos": [0.5, 0.29],
      "Mãos Leves": [0.4, 0.3],
      "Lâmina Envenenada": [0.6, 0.3],
      "Distração": [0.33, 0.25],
      "Golpe nas Juntas": [0.67, 0.25],
      "Sombra Gêmea": [0.5, 0.21],
      "Desaparecer": [0.38, 0.16],
      "Punhal Certeiro": [0.5, 0.13],
      "Mil Cortes": [0.62, 0.1],
      "Execução": [0.5, 0.05],
    },
    ligacoes: [["Ataque Furtivo", "Esquiva Ágil"], ["Esquiva Ágil", "Passos Silenciosos"], ["Passos Silenciosos", "Mãos Leves"], ["Mãos Leves", "Distração"], ["Passos Silenciosos", "Lâmina Envenenada"], ["Lâmina Envenenada", "Golpe nas Juntas"], ["Passos Silenciosos", "Sombra Gêmea"], ["Sombra Gêmea", "Punhal Certeiro"], ["Punhal Certeiro", "Execução"], ["Sombra Gêmea", "Desaparecer"], ["Punhal Certeiro", "Mil Cortes"]],
    bracos: {
      "Assassino": {
        estrelas: {
          "Lâmina Peçonhenta": [0.433, 0.52],
          "Bote Silencioso": [0.379, 0.573],
          "Marca Mortal": [0.319, 0.619],
          "Golpe de Misericórdia": [0.256, 0.658],
        },
        ligacoes: [[null, "Lâmina Peçonhenta"], ["Lâmina Peçonhenta", "Bote Silencioso"], ["Bote Silencioso", "Marca Mortal"], ["Marca Mortal", "Golpe de Misericórdia"]],
        ramos: {
          "Lâmina Silenciosa": { estrelas: { "Passo sem Som": [0.181, 0.658], "Corte na Nuca": [0.109, 0.658], "Uma Só Respiração": [0.037, 0.658] }, ligacoes: [[null, "Passo sem Som"], ["Passo sem Som", "Corte na Nuca"], ["Corte na Nuca", "Uma Só Respiração"]] },
          "Envenenador": { estrelas: { "Frasco na Manga": [0.223, 0.725], "Coquetel Amargo": [0.192, 0.79], "Bafo da Cripta": [0.16, 0.855] }, ligacoes: [[null, "Frasco na Manga"], ["Frasco na Manga", "Coquetel Amargo"], ["Coquetel Amargo", "Bafo da Cripta"]] },
        },
      },
      "Batedor": {
        estrelas: {
          "Passo de Sombra": [0.5, 0.545],
          "Mira do Batedor": [0.5, 0.62],
          "Tocaia do Batedor": [0.5, 0.695],
          "Olho de Falcão": [0.5, 0.77],
        },
        ligacoes: [[null, "Passo de Sombra"], ["Passo de Sombra", "Mira do Batedor"], ["Mira do Batedor", "Tocaia do Batedor"], ["Tocaia do Batedor", "Olho de Falcão"]],
        ramos: {
          "Explorador": { estrelas: { "Leitura do Terreno": [0.46, 0.834], "Trilha Impossível": [0.422, 0.895], "Vantagem do Lugar": [0.384, 0.956] }, ligacoes: [[null, "Leitura do Terreno"], ["Leitura do Terreno", "Trilha Impossível"], ["Trilha Impossível", "Vantagem do Lugar"]] },
          "Atirador de Elite": { estrelas: { "Respiração Contida": [0.54, 0.834], "Tiro que Atravessa": [0.578, 0.895], "A Um Quilômetro": [0.616, 0.956] }, ligacoes: [[null, "Respiração Contida"], ["Respiração Contida", "Tiro que Atravessa"], ["Tiro que Atravessa", "A Um Quilômetro"]] },
        },
      },
      "Trapaceiro": {
        estrelas: {
          "Bolso Furado": [0.567, 0.52],
          "Areia nos Olhos": [0.621, 0.573],
          "Escapada": [0.681, 0.619],
          "Golpe Baixo": [0.744, 0.658],
        },
        ligacoes: [[null, "Bolso Furado"], ["Bolso Furado", "Areia nos Olhos"], ["Areia nos Olhos", "Escapada"], ["Escapada", "Golpe Baixo"]],
        ramos: {
          "Vigarista": { estrelas: { "Conversa de Bolso": [0.777, 0.725], "Identidade Emprestada": [0.808, 0.79], "O Golpe Grande": [0.84, 0.855] }, ligacoes: [[null, "Conversa de Bolso"], ["Conversa de Bolso", "Identidade Emprestada"], ["Identidade Emprestada", "O Golpe Grande"]] },
          "Mestre das Fechaduras": { estrelas: { "Nenhuma Porta": [0.819, 0.658], "Armadilha Devolvida": [0.891, 0.658], "Chave de Tudo": [0.963, 0.658] }, ligacoes: [[null, "Nenhuma Porta"], ["Nenhuma Porta", "Armadilha Devolvida"], ["Armadilha Devolvida", "Chave de Tudo"]] },
        },
      },
    },
  },
  "Clérigo": {
    figura: "o cálice",
    raiz: "Cura Leve",
    estrelas: {
      "Cura Leve": [0.5, 0.44],
      "Luz Sagrada": [0.41, 0.44],
      "Bênção": [0.59, 0.44],
      "Escudo da Fé": [0.5, 0.36],
      "Purificar": [0.5, 0.28],
      "Golpe Sagrado": [0.4, 0.23],
      "Palavra de Coragem": [0.6, 0.23],
      "Círculo Sagrado": [0.33, 0.13],
      "Julgamento": [0.67, 0.13],
      "Intervenção": [0.42, 0.07],
      "Ressurreição Menor": [0.58, 0.07],
      "Ira Divina": [0.5, 0.14],
    },
    ligacoes: [["Luz Sagrada", "Cura Leve"], ["Cura Leve", "Bênção"], ["Cura Leve", "Escudo da Fé"], ["Escudo da Fé", "Purificar"], ["Purificar", "Golpe Sagrado"], ["Purificar", "Palavra de Coragem"], ["Golpe Sagrado", "Círculo Sagrado"], ["Palavra de Coragem", "Julgamento"], ["Círculo Sagrado", "Intervenção"], ["Julgamento", "Ressurreição Menor"], ["Intervenção", "Ira Divina"], ["Ira Divina", "Ressurreição Menor"]],
    bracos: {
      "Sacerdote": {
        estrelas: {
          "Cura Maior": [0.433, 0.52],
          "Palavra de Alívio": [0.379, 0.573],
          "Aura de Vida": [0.319, 0.619],
          "Chamar de Volta": [0.256, 0.658],
        },
        ligacoes: [[null, "Cura Maior"], ["Cura Maior", "Palavra de Alívio"], ["Palavra de Alívio", "Aura de Vida"], ["Aura de Vida", "Chamar de Volta"]],
        ramos: {
          "Curandeiro": { estrelas: { "Mãos que Não Cansam": [0.181, 0.658], "Vida Emprestada": [0.109, 0.658], "Aurora Restauradora": [0.037, 0.658] }, ligacoes: [[null, "Mãos que Não Cansam"], ["Mãos que Não Cansam", "Vida Emprestada"], ["Vida Emprestada", "Aurora Restauradora"]] },
          "Protetor": { estrelas: { "Manto de Luz": [0.223, 0.725], "Fé Compartilhada": [0.192, 0.79], "Baluarte Sagrado": [0.16, 0.855] }, ligacoes: [[null, "Manto de Luz"], ["Manto de Luz", "Fé Compartilhada"], ["Fé Compartilhada", "Baluarte Sagrado"]] },
        },
      },
      "Paladino": {
        estrelas: {
          "Golpe Consagrado": [0.5, 0.545],
          "Escudo da Aurora": [0.5, 0.62],
          "Juramento Radiante": [0.5, 0.695],
          "Luz do Juízo": [0.5, 0.77],
        },
        ligacoes: [[null, "Golpe Consagrado"], ["Golpe Consagrado", "Escudo da Aurora"], ["Escudo da Aurora", "Juramento Radiante"], ["Juramento Radiante", "Luz do Juízo"]],
        ramos: {
          "Juramento da Aurora": { estrelas: { "Lâmina de Amanhecer": [0.46, 0.834], "Luz que Não Recua": [0.422, 0.895], "Julgamento da Aurora": [0.384, 0.956] }, ligacoes: [[null, "Lâmina de Amanhecer"], ["Lâmina de Amanhecer", "Luz que Não Recua"], ["Luz que Não Recua", "Julgamento da Aurora"]] },
          "Vingador": { estrelas: { "Dívida de Sangue": [0.54, 0.834], "Perseguição Sagrada": [0.578, 0.895], "Cobrança Final": [0.616, 0.956] }, ligacoes: [[null, "Dívida de Sangue"], ["Dívida de Sangue", "Perseguição Sagrada"], ["Perseguição Sagrada", "Cobrança Final"]] },
        },
      },
      "Inquisidor": {
        estrelas: {
          "Marca do Ímpio": [0.567, 0.52],
          "Correntes Sagradas": [0.621, 0.573],
          "Interrogatório": [0.681, 0.619],
          "Banimento": [0.744, 0.658],
        },
        ligacoes: [[null, "Marca do Ímpio"], ["Marca do Ímpio", "Correntes Sagradas"], ["Correntes Sagradas", "Interrogatório"], ["Interrogatório", "Banimento"]],
        ramos: {
          "Caçador de Demônios": { estrelas: { "Olho que Enxerga": [0.777, 0.725], "Selo de Interdito": [0.808, 0.79], "Volta ao Abismo": [0.84, 0.855] }, ligacoes: [[null, "Olho que Enxerga"], ["Olho que Enxerga", "Selo de Interdito"], ["Selo de Interdito", "Volta ao Abismo"]] },
          "Exorcista": { estrelas: { "Palavra que Expulsa": [0.819, 0.658], "Corrente de Ritos": [0.891, 0.658], "Nome Verdadeiro": [0.963, 0.658] }, ligacoes: [[null, "Palavra que Expulsa"], ["Palavra que Expulsa", "Corrente de Ritos"], ["Corrente de Ritos", "Nome Verdadeiro"]] },
        },
      },
    },
  },
  "Caçador": {
    figura: "o arco",
    raiz: "Tiro Preciso",
    estrelas: {
      "Tiro Preciso": [0.5, 0.44],
      "Rastrear": [0.5, 0.365],
      "Armadilha": [0.5, 0.29],
      "Tiro Duplo": [0.27, 0.33],
      "Marca do Caçador": [0.73, 0.33],
      "Camuflagem": [0.31, 0.22],
      "Companheiro Animal": [0.69, 0.22],
      "Flecha Perfurante": [0.39, 0.15],
      "Tiro Paralisante": [0.61, 0.15],
      "Emboscada": [0.5, 0.21],
      "Chuva de Flechas": [0.5, 0.12],
      "Tiro do Fim": [0.5, 0.04],
    },
    ligacoes: [["Tiro Preciso", "Rastrear"], ["Rastrear", "Armadilha"], ["Armadilha", "Emboscada"], ["Emboscada", "Chuva de Flechas"], ["Chuva de Flechas", "Tiro do Fim"], ["Tiro Preciso", "Tiro Duplo"], ["Tiro Preciso", "Marca do Caçador"], ["Tiro Duplo", "Camuflagem"], ["Camuflagem", "Flecha Perfurante"], ["Flecha Perfurante", "Chuva de Flechas"], ["Marca do Caçador", "Companheiro Animal"], ["Companheiro Animal", "Tiro Paralisante"], ["Tiro Paralisante", "Chuva de Flechas"]],
    bracos: {
      "Arqueiro": {
        estrelas: {
          "Flechas Gêmeas": [0.433, 0.52],
          "Ponta de Agulha": [0.379, 0.573],
          "Saraivada": [0.319, 0.619],
          "Tiro de Mil Passos": [0.256, 0.658],
        },
        ligacoes: [[null, "Flechas Gêmeas"], ["Flechas Gêmeas", "Ponta de Agulha"], ["Ponta de Agulha", "Saraivada"], ["Saraivada", "Tiro de Mil Passos"]],
        ramos: {
          "Tiro Certeiro": { estrelas: { "Olho que Mede o Vento": [0.181, 0.658], "Flecha na Junta": [0.109, 0.658], "Disparo Definidor": [0.037, 0.658] }, ligacoes: [[null, "Olho que Mede o Vento"], ["Olho que Mede o Vento", "Flecha na Junta"], ["Flecha na Junta", "Disparo Definidor"]] },
          "Chuva de Flechas": { estrelas: { "Salva Rápida": [0.223, 0.725], "Céu Escuro": [0.192, 0.79], "Tempestade de Hastes": [0.16, 0.855] }, ligacoes: [[null, "Salva Rápida"], ["Salva Rápida", "Céu Escuro"], ["Céu Escuro", "Tempestade de Hastes"]] },
        },
      },
      "Domador": {
        estrelas: {
          "Chamado Selvagem": [0.5, 0.545],
          "Vínculo de Presa": [0.5, 0.62],
          "Investida da Alcateia": [0.5, 0.695],
          "Fera Ancestral": [0.5, 0.77],
        },
        ligacoes: [[null, "Chamado Selvagem"], ["Chamado Selvagem", "Vínculo de Presa"], ["Vínculo de Presa", "Investida da Alcateia"], ["Investida da Alcateia", "Fera Ancestral"]],
        ramos: {
          "Vínculo Selvagem": { estrelas: { "Duas Almas": [0.46, 0.834], "Ferida Compartilhada": [0.422, 0.895], "Forma Conjunta": [0.384, 0.956] }, ligacoes: [[null, "Duas Almas"], ["Duas Almas", "Ferida Compartilhada"], ["Ferida Compartilhada", "Forma Conjunta"]] },
          "Alcateia": { estrelas: { "Chamado do Bando": [0.54, 0.834], "Cerco de Presas": [0.578, 0.895], "Uivo do Alfa": [0.616, 0.956] }, ligacoes: [[null, "Chamado do Bando"], ["Chamado do Bando", "Cerco de Presas"], ["Cerco de Presas", "Uivo do Alfa"]] },
        },
      },
      "Rastreador": {
        estrelas: {
          "Farejar Presa": [0.567, 0.52],
          "Armadilha de Corda": [0.621, 0.573],
          "Terreno Conhecido": [0.681, 0.619],
          "Golpe do Predador": [0.744, 0.658],
        },
        ligacoes: [[null, "Farejar Presa"], ["Farejar Presa", "Armadilha de Corda"], ["Armadilha de Corda", "Terreno Conhecido"], ["Terreno Conhecido", "Golpe do Predador"]],
        ramos: {
          "Caçador de Recompensas": { estrelas: { "Contrato Aberto": [0.777, 0.725], "Amarras de Captura": [0.808, 0.79], "Cobrança em Dobro": [0.84, 0.855] }, ligacoes: [[null, "Contrato Aberto"], ["Contrato Aberto", "Amarras de Captura"], ["Amarras de Captura", "Cobrança em Dobro"]] },
          "Guia do Ermo": { estrelas: { "Leitura de Rastro": [0.819, 0.658], "Acampamento Seguro": [0.891, 0.658], "O Ermo é Meu": [0.963, 0.658] }, ligacoes: [[null, "Leitura de Rastro"], ["Leitura de Rastro", "Acampamento Seguro"], ["Acampamento Seguro", "O Ermo é Meu"]] },
        },
      },
    },
  },
  "Bardo": {
    figura: "a lira",
    raiz: "Inspiração",
    estrelas: {
      "Inspiração": [0.5, 0.44],
      "Palavra Cortante": [0.4, 0.4],
      "Canção Curativa": [0.6, 0.4],
      "Lábia": [0.34, 0.31],
      "Melodia Confusa": [0.66, 0.31],
      "Conhecimento Vasto": [0.33, 0.21],
      "Hino de Guerra": [0.67, 0.21],
      "Contra-Canção": [0.37, 0.12],
      "Sussurro Fatal": [0.63, 0.12],
      "Fascínio": [0.3, 0.055],
      "Balada do Herói": [0.7, 0.055],
      "Última Estrofe": [0.5, 0.14],
    },
    ligacoes: [["Inspiração", "Palavra Cortante"], ["Palavra Cortante", "Lábia"], ["Lábia", "Conhecimento Vasto"], ["Conhecimento Vasto", "Contra-Canção"], ["Contra-Canção", "Fascínio"], ["Inspiração", "Canção Curativa"], ["Canção Curativa", "Melodia Confusa"], ["Melodia Confusa", "Hino de Guerra"], ["Hino de Guerra", "Sussurro Fatal"], ["Sussurro Fatal", "Balada do Herói"], ["Contra-Canção", "Última Estrofe"], ["Última Estrofe", "Sussurro Fatal"], ["Inspiração", "Última Estrofe"]],
    bracos: {
      "Menestrel": {
        estrelas: {
          "Canção de Ninar": [0.433, 0.52],
          "Refrão Curativo": [0.379, 0.573],
          "Hino da Vitória": [0.319, 0.619],
          "Ópera Final": [0.256, 0.658],
        },
        ligacoes: [[null, "Canção de Ninar"], ["Canção de Ninar", "Refrão Curativo"], ["Refrão Curativo", "Hino da Vitória"], ["Hino da Vitória", "Ópera Final"]],
        ramos: {
          "Canto de Cura": { estrelas: { "Melodia que Fecha Feridas": [0.181, 0.658], "Refrão Teimoso": [0.109, 0.658], "Réquiem ao Contrário": [0.037, 0.658] }, ligacoes: [[null, "Melodia que Fecha Feridas"], ["Melodia que Fecha Feridas", "Refrão Teimoso"], ["Refrão Teimoso", "Réquiem ao Contrário"]] },
          "Hino de Guerra": { estrelas: { "Marcha Sem Recuo": [0.223, 0.725], "Tambor de Investida": [0.192, 0.79], "Hino Final": [0.16, 0.855] }, ligacoes: [[null, "Marcha Sem Recuo"], ["Marcha Sem Recuo", "Tambor de Investida"], ["Tambor de Investida", "Hino Final"]] },
        },
      },
      "Cronista": {
        estrelas: {
          "Ler a Cena": [0.5, 0.545],
          "Citação Oportuna": [0.5, 0.62],
          "Página Viva": [0.5, 0.695],
          "Escrever o Feito": [0.5, 0.77],
        },
        ligacoes: [[null, "Ler a Cena"], ["Ler a Cena", "Citação Oportuna"], ["Citação Oportuna", "Página Viva"], ["Página Viva", "Escrever o Feito"]],
        ramos: {
          "Erudito": { estrelas: { "Já Li Sobre Isso": [0.46, 0.834], "Nota de Rodapé": [0.422, 0.895], "Biblioteca Viva": [0.384, 0.956] }, ligacoes: [[null, "Já Li Sobre Isso"], ["Já Li Sobre Isso", "Nota de Rodapé"], ["Nota de Rodapé", "Biblioteca Viva"]] },
          "Contador de Segredos": { estrelas: { "Boato Plantado": [0.54, 0.834], "O Que Você Esconde": [0.578, 0.895], "Verdade Pública": [0.616, 0.956] }, ligacoes: [[null, "Boato Plantado"], ["Boato Plantado", "O Que Você Esconde"], ["O Que Você Esconde", "Verdade Pública"]] },
        },
      },
      "Encantador": {
        estrelas: {
          "Sussurro Doce": [0.567, 0.52],
          "Ordem Irresistível": [0.621, 0.573],
          "Máscara Social": [0.681, 0.619],
          "Corte de Marionetes": [0.744, 0.658],
        },
        ligacoes: [[null, "Sussurro Doce"], ["Sussurro Doce", "Ordem Irresistível"], ["Ordem Irresistível", "Máscara Social"], ["Máscara Social", "Corte de Marionetes"]],
        ramos: {
          "Sedutor": { estrelas: { "Olhar que Prende": [0.777, 0.725], "Favor Concedido": [0.808, 0.79], "Corte Encantada": [0.84, 0.855] }, ligacoes: [[null, "Olhar que Prende"], ["Olhar que Prende", "Favor Concedido"], ["Favor Concedido", "Corte Encantada"]] },
          "Manipulador": { estrelas: { "Sugestão Plantada": [0.819, 0.658], "Discórdia": [0.891, 0.658], "Marionete": [0.963, 0.658] }, ligacoes: [[null, "Sugestão Plantada"], ["Sugestão Plantada", "Discórdia"], ["Discórdia", "Marionete"]] },
        },
      },
    },
  },
  "Monge": {
    figura: "o círculo aberto",
    raiz: "Rajada de Golpes",
    estrelas: {
      "Rajada de Golpes": [0.5, 0.435],
      "Defesa Fluida": [0.399, 0.406],
      "Passo do Vento": [0.329, 0.328],
      "Golpe Atordoante": [0.311, 0.225],
      "Foco Interior": [0.35, 0.128],
      "Corpo de Ferro": [0.435, 0.066],
      "Palma Trovejante": [0.54, 0.059],
      "Mente Serena": [0.632, 0.108],
      "Cem Punhos": [0.684, 0.199],
      "Toque da Quietude": [0.601, 0.406],
      "Corpo Imortal": [0.671, 0.328],
      "Palma dos Sete Ventos": [0.5, 0.245],
    },
    ligacoes: [["Rajada de Golpes", "Defesa Fluida"], ["Defesa Fluida", "Passo do Vento"], ["Passo do Vento", "Golpe Atordoante"], ["Golpe Atordoante", "Foco Interior"], ["Foco Interior", "Corpo de Ferro"], ["Corpo de Ferro", "Palma Trovejante"], ["Palma Trovejante", "Mente Serena"], ["Mente Serena", "Cem Punhos"], ["Rajada de Golpes", "Toque da Quietude"], ["Toque da Quietude", "Corpo Imortal"], ["Palma dos Sete Ventos", "Rajada de Golpes"]],
    bracos: {
      "Punho de Ferro": {
        estrelas: {
          "Punhos em Cascata": [0.433, 0.515],
          "Palma Atordoante": [0.379, 0.568],
          "Punho que Rompe": [0.319, 0.614],
          "Punho da Montanha": [0.256, 0.653],
        },
        ligacoes: [[null, "Punhos em Cascata"], ["Punhos em Cascata", "Palma Atordoante"], ["Palma Atordoante", "Punho que Rompe"], ["Punho que Rompe", "Punho da Montanha"]],
        ramos: {
          "Mão Aberta": { estrelas: { "Palma que Desloca": [0.181, 0.653], "Sequência de Cinco": [0.109, 0.653], "Toque do Fim": [0.037, 0.653] }, ligacoes: [[null, "Palma que Desloca"], ["Palma que Desloca", "Sequência de Cinco"], ["Sequência de Cinco", "Toque do Fim"]] },
          "Quebra-Montanhas": { estrelas: { "Punho de Pedra": [0.223, 0.72], "Impacto Sísmico": [0.192, 0.785], "Rachar o Mundo": [0.16, 0.85] }, ligacoes: [[null, "Punho de Pedra"], ["Punho de Pedra", "Impacto Sísmico"], ["Impacto Sísmico", "Rachar o Mundo"]] },
        },
      },
      "Andarilho": {
        estrelas: {
          "Pés Ligeiros": [0.5, 0.54],
          "Dança das Sombras": [0.5, 0.615],
          "Corrida Impossível": [0.5, 0.69],
          "Cem Passos": [0.5, 0.765],
        },
        ligacoes: [[null, "Pés Ligeiros"], ["Pés Ligeiros", "Dança das Sombras"], ["Dança das Sombras", "Corrida Impossível"], ["Corrida Impossível", "Cem Passos"]],
        ramos: {
          "Vento Veloz": { estrelas: { "Passo de Trinta Metros": [0.46, 0.829], "Vendaval de Punhos": [0.422, 0.89], "Mais Rápido que o Olho": [0.384, 0.951] }, ligacoes: [[null, "Passo de Trinta Metros"], ["Passo de Trinta Metros", "Vendaval de Punhos"], ["Vendaval de Punhos", "Mais Rápido que o Olho"]] },
          "Sombra Dançante": { estrelas: { "Passo entre Sombras": [0.54, 0.829], "Golpe do Escuro": [0.578, 0.89], "Dança Sem Vulto": [0.616, 0.951] }, ligacoes: [[null, "Passo entre Sombras"], ["Passo entre Sombras", "Golpe do Escuro"], ["Golpe do Escuro", "Dança Sem Vulto"]] },
        },
      },
      "Asceta": {
        estrelas: {
          "Corpo Sereno": [0.567, 0.515],
          "Mente Vazia": [0.621, 0.568],
          "Respiração de Ferro": [0.681, 0.614],
          "Vazio Perfeito": [0.744, 0.653],
        },
        ligacoes: [[null, "Corpo Sereno"], ["Corpo Sereno", "Mente Vazia"], ["Mente Vazia", "Respiração de Ferro"], ["Respiração de Ferro", "Vazio Perfeito"]],
        ramos: {
          "Corpo Imaculado": { estrelas: { "Carne Sem Veneno": [0.777, 0.72], "Fôlego de Aço": [0.808, 0.785], "Casulo de Chi": [0.84, 0.85] }, ligacoes: [[null, "Carne Sem Veneno"], ["Carne Sem Veneno", "Fôlego de Aço"], ["Fôlego de Aço", "Casulo de Chi"]] },
          "Mente Vazia": { estrelas: { "Silêncio Interior": [0.819, 0.653], "Antevisão": [0.891, 0.653], "Nada Me Alcança": [0.963, 0.653] }, ligacoes: [[null, "Silêncio Interior"], ["Silêncio Interior", "Antevisão"], ["Antevisão", "Nada Me Alcança"]] },
        },
      },
    },
  },
  "Druida": {
    figura: "o carvalho",
    raiz: "Espinhos",
    estrelas: {
      "Espinhos": [0.5, 0.44],
      "Toque Curativo": [0.5, 0.36],
      "Falar com Animais": [0.5, 0.28],
      "Forma Animal": [0.4, 0.22],
      "Chamado da Chuva": [0.6, 0.22],
      "Casca de Carvalho": [0.36, 0.3],
      "Enxame": [0.5, 0.19],
      "Raio Solar": [0.31, 0.15],
      "Emaranhar": [0.69, 0.15],
      "Renovação": [0.4, 0.1],
      "Fúria de Gaia": [0.6, 0.1],
      "Forma Ancestral": [0.5, 0.05],
    },
    ligacoes: [["Espinhos", "Toque Curativo"], ["Toque Curativo", "Falar com Animais"], ["Falar com Animais", "Enxame"], ["Enxame", "Forma Ancestral"], ["Falar com Animais", "Forma Animal"], ["Falar com Animais", "Chamado da Chuva"], ["Toque Curativo", "Casca de Carvalho"], ["Forma Animal", "Raio Solar"], ["Chamado da Chuva", "Emaranhar"], ["Enxame", "Renovação"], ["Enxame", "Fúria de Gaia"], ["Renovação", "Forma Ancestral"], ["Fúria de Gaia", "Forma Ancestral"], ["Raio Solar", "Renovação"], ["Emaranhar", "Fúria de Gaia"]],
    bracos: {
      "Metamorfo": {
        estrelas: {
          "Forma de Caça": [0.433, 0.52],
          "Couro Selvagem": [0.379, 0.573],
          "Forma Alada": [0.319, 0.619],
          "Fera Primordial": [0.256, 0.658],
        },
        ligacoes: [[null, "Forma de Caça"], ["Forma de Caça", "Couro Selvagem"], ["Couro Selvagem", "Forma Alada"], ["Forma Alada", "Fera Primordial"]],
        ramos: {
          "Forma Predadora": { estrelas: { "Presas do Bosque": [0.181, 0.658], "Faro de Sangue": [0.109, 0.658], "Besta Primordial": [0.037, 0.658] }, ligacoes: [[null, "Presas do Bosque"], ["Presas do Bosque", "Faro de Sangue"], ["Faro de Sangue", "Besta Primordial"]] },
          "Forma Alada": { estrelas: { "Asas de Tempestade": [0.223, 0.725], "Mergulho de Rapina": [0.192, 0.79], "Senhor do Céu": [0.16, 0.855] }, ligacoes: [[null, "Asas de Tempestade"], ["Asas de Tempestade", "Mergulho de Rapina"], ["Mergulho de Rapina", "Senhor do Céu"]] },
        },
      },
      "Xamã": {
        estrelas: {
          "Espírito Vigia": [0.5, 0.545],
          "Chamado do Trovão": [0.5, 0.62],
          "Vozes Ancestrais": [0.5, 0.695],
          "Tempestade Ancestral": [0.5, 0.77],
        },
        ligacoes: [[null, "Espírito Vigia"], ["Espírito Vigia", "Chamado do Trovão"], ["Chamado do Trovão", "Vozes Ancestrais"], ["Vozes Ancestrais", "Tempestade Ancestral"]],
        ramos: {
          "Espíritos Ancestrais": { estrelas: { "Conselho dos Antigos": [0.46, 0.834], "Totem de Guarda": [0.422, 0.895], "Marcha dos Ancestrais": [0.384, 0.956] }, ligacoes: [[null, "Conselho dos Antigos"], ["Conselho dos Antigos", "Totem de Guarda"], ["Totem de Guarda", "Marcha dos Ancestrais"]] },
          "Chamado da Tempestade": { estrelas: { "Raio Convocado": [0.54, 0.834], "Vendaval": [0.578, 0.895], "Coração da Tormenta": [0.616, 0.956] }, ligacoes: [[null, "Raio Convocado"], ["Raio Convocado", "Vendaval"], ["Vendaval", "Coração da Tormenta"]] },
        },
      },
      "Guardião": {
        estrelas: {
          "Raízes Agarradoras": [0.567, 0.52],
          "Bênção do Bosque": [0.621, 0.573],
          "Muralha de Espinhos": [0.681, 0.619],
          "Ira da Floresta": [0.744, 0.658],
        },
        ligacoes: [[null, "Raízes Agarradoras"], ["Raízes Agarradoras", "Bênção do Bosque"], ["Bênção do Bosque", "Muralha de Espinhos"], ["Muralha de Espinhos", "Ira da Floresta"]],
        ramos: {
          "Guardião do Bosque": { estrelas: { "Raízes que Prendem": [0.777, 0.725], "Cerca Viva": [0.808, 0.79], "O Bosque Acorda": [0.84, 0.855] }, ligacoes: [[null, "Raízes que Prendem"], ["Raízes que Prendem", "Cerca Viva"], ["Cerca Viva", "O Bosque Acorda"]] },
          "Semeador": { estrelas: { "Semente de Cura": [0.819, 0.658], "Terra Fértil": [0.891, 0.658], "Renascimento": [0.963, 0.658] }, ligacoes: [[null, "Semente de Cura"], ["Semente de Cura", "Terra Fértil"], ["Terra Fértil", "Renascimento"]] },
        },
      },
    },
  },
  "Feiticeiro": {
    figura: "a chama",
    raiz: "Rajada Instintiva",
    estrelas: {
      "Rajada Instintiva": [0.5, 0.44],
      "Pele Arcana": [0.4, 0.4],
      "Metamagia: Alcance": [0.6, 0.4],
      "Sopro Herdado": [0.34, 0.31],
      "Onda Caótica": [0.66, 0.31],
      "Metamagia: Gêmea": [0.36, 0.21],
      "Coração Tempestuoso": [0.62, 0.2],
      "Sangue Ardente": [0.43, 0.12],
      "Ressonância": [0.68, 0.1],
      "Forma Dracônica": [0.5, 0.32],
      "Tempestade Viva": [0.52, 0.22],
      "Explosão de Poder": [0.52, 0.04],
    },
    ligacoes: [["Rajada Instintiva", "Pele Arcana"], ["Pele Arcana", "Sopro Herdado"], ["Sopro Herdado", "Metamagia: Gêmea"], ["Metamagia: Gêmea", "Sangue Ardente"], ["Sangue Ardente", "Explosão de Poder"], ["Rajada Instintiva", "Metamagia: Alcance"], ["Metamagia: Alcance", "Onda Caótica"], ["Onda Caótica", "Coração Tempestuoso"], ["Coração Tempestuoso", "Ressonância"], ["Ressonância", "Explosão de Poder"], ["Rajada Instintiva", "Forma Dracônica"], ["Forma Dracônica", "Tempestade Viva"]],
    bracos: {
      "Linhagem Dracônica": {
        estrelas: {
          "Sopro de Brasa": [0.433, 0.52],
          "Escamas Ancestrais": [0.379, 0.573],
          "Asas de Cinza": [0.319, 0.619],
          "Presença Dracônica": [0.256, 0.658],
        },
        ligacoes: [[null, "Sopro de Brasa"], ["Sopro de Brasa", "Escamas Ancestrais"], ["Escamas Ancestrais", "Asas de Cinza"], ["Asas de Cinza", "Presença Dracônica"]],
        ramos: {
          "Coração de Brasa": { estrelas: { "Escamas em Brasa": [0.181, 0.658], "Sopro de Berço": [0.109, 0.658], "Sangue de Dragão": [0.037, 0.658] }, ligacoes: [[null, "Escamas em Brasa"], ["Escamas em Brasa", "Sopro de Berço"], ["Sopro de Berço", "Sangue de Dragão"]] },
          "Asa Ancestral": { estrelas: { "Asas de Escama": [0.223, 0.725], "Sombra de Asa": [0.192, 0.79], "Forma do Ancestral": [0.16, 0.855] }, ligacoes: [[null, "Asas de Escama"], ["Asas de Escama", "Sombra de Asa"], ["Sombra de Asa", "Forma do Ancestral"]] },
        },
      },
      "Alma da Tempestade": {
        estrelas: {
          "Toque Estático": [0.5, 0.545],
          "Passo do Relâmpago": [0.5, 0.62],
          "Corrente Saltitante": [0.5, 0.695],
          "Olho do Furacão": [0.5, 0.77],
        },
        ligacoes: [[null, "Toque Estático"], ["Toque Estático", "Passo do Relâmpago"], ["Passo do Relâmpago", "Corrente Saltitante"], ["Corrente Saltitante", "Olho do Furacão"]],
        ramos: {
          "Senhor dos Ventos": { estrelas: { "Corrente Ascendente": [0.46, 0.834], "Lâminas de Ar": [0.422, 0.895], "Ciclone Pessoal": [0.384, 0.956] }, ligacoes: [[null, "Corrente Ascendente"], ["Corrente Ascendente", "Lâminas de Ar"], ["Lâminas de Ar", "Ciclone Pessoal"]] },
          "Filho do Trovão": { estrelas: { "Estalo": [0.54, 0.834], "Corrente Viva": [0.578, 0.895], "Descarga Celeste": [0.616, 0.956] }, ligacoes: [[null, "Estalo"], ["Estalo", "Corrente Viva"], ["Corrente Viva", "Descarga Celeste"]] },
        },
      },
      "Magia Selvagem": {
        estrelas: {
          "Surto de Caos": [0.567, 0.52],
          "Sorte Torta": [0.621, 0.573],
          "Rajada Instável": [0.681, 0.619],
          "Maré do Acaso": [0.744, 0.658],
        },
        ligacoes: [[null, "Surto de Caos"], ["Surto de Caos", "Sorte Torta"], ["Sorte Torta", "Rajada Instável"], ["Rajada Instável", "Maré do Acaso"]],
        ramos: {
          "Onda de Caos": { estrelas: { "Surto Instável": [0.777, 0.725], "Reescrita Selvagem": [0.808, 0.79], "Caos Puro": [0.84, 0.855] }, ligacoes: [[null, "Surto Instável"], ["Surto Instável", "Reescrita Selvagem"], ["Reescrita Selvagem", "Caos Puro"]] },
          "Sorte Torta": { estrelas: { "Dado Virado": [0.819, 0.658], "Azar Alheio": [0.891, 0.658], "Improvável": [0.963, 0.658] }, ligacoes: [[null, "Dado Virado"], ["Dado Virado", "Azar Alheio"], ["Azar Alheio", "Improvável"]] },
        },
      },
    },
  },
  "Bruxo": {
    figura: "o crescente",
    raiz: "Explosão Mística",
    estrelas: {
      "Explosão Mística": [0.5, 0.442],
      "Armadura Sombria": [0.394, 0.386],
      "Maldição do Patrono": [0.519, 0.36],
      "Sussurros": [0.338, 0.28],
      "Corrente Infernal": [0.467, 0.271],
      "Passo Feérico": [0.354, 0.16],
      "Toque do Vazio": [0.485, 0.17],
      "Presença Aterradora": [0.435, 0.072],
      "Escudo do Pacto": [0.552, 0.046],
      "Dádiva Sombria": [0.645, 0.17],
      "Forma Abissal": [0.715, 0.25],
      "Cobrança": [0.645, 0.32],
    },
    ligacoes: [["Explosão Mística", "Armadura Sombria"], ["Armadura Sombria", "Sussurros"], ["Sussurros", "Passo Feérico"], ["Passo Feérico", "Presença Aterradora"], ["Presença Aterradora", "Escudo do Pacto"], ["Explosão Mística", "Maldição do Patrono"], ["Maldição do Patrono", "Corrente Infernal"], ["Corrente Infernal", "Toque do Vazio"], ["Toque do Vazio", "Escudo do Pacto"], ["Dádiva Sombria", "Forma Abissal"], ["Forma Abissal", "Cobrança"], ["Cobrança", "Dádiva Sombria"]],
    bracos: {
      "Pacto Infernal": {
        estrelas: {
          "Chama Contratual": [0.433, 0.522],
          "Preço de Sangue": [0.379, 0.575],
          "Marca do Contrato": [0.319, 0.621],
          "Cobrança de Alma": [0.256, 0.66],
        },
        ligacoes: [[null, "Chama Contratual"], ["Chama Contratual", "Preço de Sangue"], ["Preço de Sangue", "Marca do Contrato"], ["Marca do Contrato", "Cobrança de Alma"]],
        ramos: {
          "Chama Contratual": { estrelas: { "Fogo do Contrato": [0.181, 0.66], "Cláusula de Sangue": [0.109, 0.66], "Selo Infernal": [0.037, 0.66] }, ligacoes: [[null, "Fogo do Contrato"], ["Fogo do Contrato", "Cláusula de Sangue"], ["Cláusula de Sangue", "Selo Infernal"]] },
          "Cobrador de Almas": { estrelas: { "Penhora": [0.223, 0.727], "Moeda de Alma": [0.192, 0.792], "Livro-Caixa do Abismo": [0.16, 0.857] }, ligacoes: [[null, "Penhora"], ["Penhora", "Moeda de Alma"], ["Moeda de Alma", "Livro-Caixa do Abismo"]] },
        },
      },
      "Pacto Feérico": {
        estrelas: {
          "Riso Enganoso": [0.5, 0.547],
          "Passo de Névoa": [0.5, 0.622],
          "Espinhos do Bosque": [0.5, 0.697],
          "Corte Radiante": [0.5, 0.772],
        },
        ligacoes: [[null, "Riso Enganoso"], ["Riso Enganoso", "Passo de Névoa"], ["Passo de Névoa", "Espinhos do Bosque"], ["Espinhos do Bosque", "Corte Radiante"]],
        ramos: {
          "Enganador Radiante": { estrelas: { "Mentira Luminosa": [0.46, 0.836], "Presente Envenenado": [0.422, 0.897], "Corte de Espelhos": [0.384, 0.958] }, ligacoes: [[null, "Mentira Luminosa"], ["Mentira Luminosa", "Presente Envenenado"], ["Presente Envenenado", "Corte de Espelhos"]] },
          "Sombra do Bosque": { estrelas: { "Atalho de Orvalho": [0.54, 0.836], "Névoa de Encanto": [0.578, 0.897], "A Corte Cobra": [0.616, 0.958] }, ligacoes: [[null, "Atalho de Orvalho"], ["Atalho de Orvalho", "Névoa de Encanto"], ["Névoa de Encanto", "A Corte Cobra"]] },
        },
      },
      "Pacto do Abismo": {
        estrelas: {
          "Sussurro do Vazio": [0.567, 0.522],
          "Tentáculo Insone": [0.621, 0.575],
          "Olho que Não Dorme": [0.681, 0.621],
          "Boca do Abismo": [0.744, 0.66],
        },
        ligacoes: [[null, "Sussurro do Vazio"], ["Sussurro do Vazio", "Tentáculo Insone"], ["Tentáculo Insone", "Olho que Não Dorme"], ["Olho que Não Dorme", "Boca do Abismo"]],
        ramos: {
          "Voz do Vazio": { estrelas: { "Sussurro Errado": [0.777, 0.727], "Silêncio Que Grita": [0.808, 0.792], "Verbo Anterior": [0.84, 0.857] }, ligacoes: [[null, "Sussurro Errado"], ["Sussurro Errado", "Silêncio Que Grita"], ["Silêncio Que Grita", "Verbo Anterior"]] },
          "Olho Insone": { estrelas: { "Não Pisco": [0.819, 0.66], "Olhar que Consome": [0.891, 0.66], "Mil Olhos": [0.963, 0.66] }, ligacoes: [[null, "Não Pisco"], ["Não Pisco", "Olhar que Consome"], ["Olhar que Consome", "Mil Olhos"]] },
        },
      },
    },
  },
  "Engenheiro": {
    figura: "a engrenagem",
    raiz: "Disparo Calibrado",
    estrelas: {
      "Disparo Calibrado": [0.5, 0.44],
      "Escudo Dobrável": [0.5, 0.36],
      "Bomba de Fumaça": [0.405, 0.305],
      "Granada": [0.335, 0.345],
      "Autômato Sentinela": [0.405, 0.195],
      "Frasco de Ácido": [0.335, 0.155],
      "Elixir de Combate": [0.5, 0.14],
      "Mina Oculta": [0.5, 0.06],
      "Autômato Guardião": [0.595, 0.195],
      "Tiro Perfurante": [0.665, 0.155],
      "Barragem": [0.595, 0.305],
      "Obra-Prima": [0.665, 0.345],
    },
    ligacoes: [["Escudo Dobrável", "Bomba de Fumaça"], ["Bomba de Fumaça", "Autômato Sentinela"], ["Autômato Sentinela", "Elixir de Combate"], ["Elixir de Combate", "Autômato Guardião"], ["Autômato Guardião", "Barragem"], ["Barragem", "Escudo Dobrável"], ["Escudo Dobrável", "Disparo Calibrado"], ["Bomba de Fumaça", "Granada"], ["Autômato Sentinela", "Frasco de Ácido"], ["Elixir de Combate", "Mina Oculta"], ["Autômato Guardião", "Tiro Perfurante"], ["Barragem", "Obra-Prima"]],
    bracos: {
      "Artilheiro": {
        estrelas: {
          "Granada de Fragmentos": [0.433, 0.52],
          "Tiro Calibrado": [0.379, 0.573],
          "Fumaça Cegante": [0.319, 0.619],
          "Bombardeio": [0.256, 0.658],
        },
        ligacoes: [[null, "Granada de Fragmentos"], ["Granada de Fragmentos", "Tiro Calibrado"], ["Tiro Calibrado", "Fumaça Cegante"], ["Fumaça Cegante", "Bombardeio"]],
        ramos: {
          "Demolidor": { estrelas: { "Carga Modelada": [0.181, 0.658], "Barril na Linha": [0.109, 0.658], "Derrubada Controlada": [0.037, 0.658] }, ligacoes: [[null, "Carga Modelada"], ["Carga Modelada", "Barril na Linha"], ["Barril na Linha", "Derrubada Controlada"]] },
          "Franco-Atirador": { estrelas: { "Cano Longo": [0.223, 0.725], "Mira Assistida": [0.192, 0.79], "Um Tiro, Um Nome": [0.16, 0.855] }, ligacoes: [[null, "Cano Longo"], ["Cano Longo", "Mira Assistida"], ["Mira Assistida", "Um Tiro, Um Nome"]] },
        },
      },
      "Mecanista": {
        estrelas: {
          "Autômato de Bolso": [0.5, 0.545],
          "Torreta Improvisada": [0.5, 0.62],
          "Reparo de Campo": [0.5, 0.695],
          "Engrenagem Viva": [0.5, 0.77],
        },
        ligacoes: [[null, "Autômato de Bolso"], ["Autômato de Bolso", "Torreta Improvisada"], ["Torreta Improvisada", "Reparo de Campo"], ["Reparo de Campo", "Engrenagem Viva"]],
        ramos: {
          "Pai das Máquinas": { estrelas: { "Autômato de Guerra": [0.46, 0.834], "Oficina de Campo": [0.422, 0.895], "Legião de Engrenagens": [0.384, 0.956] }, ligacoes: [[null, "Autômato de Guerra"], ["Autômato de Guerra", "Oficina de Campo"], ["Oficina de Campo", "Legião de Engrenagens"]] },
          "Engrenagem Viva": { estrelas: { "Enxerto Mecânico": [0.54, 0.834], "Sobrecarga": [0.578, 0.895], "Homem-Máquina": [0.616, 0.956] }, ligacoes: [[null, "Enxerto Mecânico"], ["Enxerto Mecânico", "Sobrecarga"], ["Sobrecarga", "Homem-Máquina"]] },
        },
      },
      "Alquimista de Campo": {
        estrelas: {
          "Frasco Corrosivo": [0.567, 0.52],
          "Elixir de Campo": [0.621, 0.573],
          "Nuvem Tóxica": [0.681, 0.619],
          "Mistura Instável": [0.744, 0.658],
        },
        ligacoes: [[null, "Frasco Corrosivo"], ["Frasco Corrosivo", "Elixir de Campo"], ["Elixir de Campo", "Nuvem Tóxica"], ["Nuvem Tóxica", "Mistura Instável"]],
        ramos: {
          "Químico Louco": { estrelas: { "Mistura do Dia": [0.777, 0.725], "Elixir Duplo": [0.808, 0.79], "Reação em Cadeia": [0.84, 0.855] }, ligacoes: [[null, "Mistura do Dia"], ["Mistura do Dia", "Elixir Duplo"], ["Elixir Duplo", "Reação em Cadeia"]] },
          "Boticário de Guerra": { estrelas: { "Cinto Cheio": [0.819, 0.658], "Antídoto Universal": [0.891, 0.658], "Farmácia de Batalha": [0.963, 0.658] }, ligacoes: [[null, "Cinto Cheio"], ["Cinto Cheio", "Antídoto Universal"], ["Antídoto Universal", "Farmácia de Batalha"]] },
        },
      },
    },
  },
  "Invocador": {
    figura: "o portal",
    raiz: "Invocar Fera Menor",
    estrelas: {
      "Invocar Fera Menor": [0.5, 0.44],
      "Elo Vital": [0.36, 0.44],
      "Comando: Atacar": [0.64, 0.44],
      "Servo Elemental": [0.36, 0.34],
      "Espírito Guardião": [0.64, 0.34],
      "Enxame Espiritual": [0.36, 0.24],
      "Sacrifício Arcano": [0.64, 0.24],
      "Invocar Fera Maior": [0.4, 0.13],
      "Fusão Espiritual": [0.6, 0.13],
      "Portal Duplo": [0.5, 0.07],
      "Voz de Comando": [0.5, 0.28],
      "Avatar Ancestral": [0.5, 0.19],
    },
    ligacoes: [["Elo Vital", "Invocar Fera Menor"], ["Invocar Fera Menor", "Comando: Atacar"], ["Elo Vital", "Servo Elemental"], ["Servo Elemental", "Enxame Espiritual"], ["Enxame Espiritual", "Invocar Fera Maior"], ["Invocar Fera Maior", "Portal Duplo"], ["Comando: Atacar", "Espírito Guardião"], ["Espírito Guardião", "Sacrifício Arcano"], ["Sacrifício Arcano", "Fusão Espiritual"], ["Fusão Espiritual", "Portal Duplo"], ["Invocar Fera Menor", "Voz de Comando"], ["Voz de Comando", "Avatar Ancestral"]],
    bracos: {
      "Mestre das Feras": {
        estrelas: {
          "Chamado da Alcateia": [0.433, 0.52],
          "Presa Espiritual": [0.379, 0.573],
          "Elo de Sangue": [0.319, 0.619],
          "Colosso de Presa": [0.256, 0.658],
        },
        ligacoes: [[null, "Chamado da Alcateia"], ["Chamado da Alcateia", "Presa Espiritual"], ["Presa Espiritual", "Elo de Sangue"], ["Elo de Sangue", "Colosso de Presa"]],
        ramos: {
          "Alcateia Espiritual": { estrelas: { "Matilha de Névoa": [0.181, 0.658], "Elo de Matilha": [0.109, 0.658], "Caçada Sem Fim": [0.037, 0.658] }, ligacoes: [[null, "Matilha de Névoa"], ["Matilha de Névoa", "Elo de Matilha"], ["Elo de Matilha", "Caçada Sem Fim"]] },
          "Colosso de Presa": { estrelas: { "Chamar o Grande": [0.223, 0.725], "Rugido que Racha": [0.192, 0.79], "Pisada do Colosso": [0.16, 0.855] }, ligacoes: [[null, "Chamar o Grande"], ["Chamar o Grande", "Rugido que Racha"], ["Rugido que Racha", "Pisada do Colosso"]] },
        },
      },
      "Conjurador Elemental": {
        estrelas: {
          "Servo de Chama": [0.5, 0.545],
          "Punho de Terra": [0.5, 0.62],
          "Elemental Maior": [0.5, 0.695],
          "Pulso Primordial": [0.5, 0.77],
        },
        ligacoes: [[null, "Servo de Chama"], ["Servo de Chama", "Punho de Terra"], ["Punho de Terra", "Elemental Maior"], ["Elemental Maior", "Pulso Primordial"]],
        ramos: {
          "Coração Ígneo": { estrelas: { "Servo de Magma": [0.46, 0.834], "Chão em Chamas": [0.422, 0.895], "Elemental Primevo": [0.384, 0.956] }, ligacoes: [[null, "Servo de Magma"], ["Servo de Magma", "Chão em Chamas"], ["Chão em Chamas", "Elemental Primevo"]] },
          "Pulso da Terra": { estrelas: { "Servo de Granito": [0.54, 0.834], "Muralha Erguida": [0.578, 0.895], "Coração do Mundo": [0.616, 0.956] }, ligacoes: [[null, "Servo de Granito"], ["Servo de Granito", "Muralha Erguida"], ["Muralha Erguida", "Coração do Mundo"]] },
        },
      },
      "Chamador de Espíritos": {
        estrelas: {
          "Guia Ancestral": [0.567, 0.52],
          "Mão Fantasma": [0.621, 0.573],
          "Corte Fantasma": [0.681, 0.619],
          "Portal dos Mortos": [0.744, 0.658],
        },
        ligacoes: [[null, "Guia Ancestral"], ["Guia Ancestral", "Mão Fantasma"], ["Mão Fantasma", "Corte Fantasma"], ["Corte Fantasma", "Portal dos Mortos"]],
        ramos: {
          "Guia Ancestral": { estrelas: { "Voz do Antepassado": [0.777, 0.725], "Memória Emprestada": [0.808, 0.79], "Linhagem Convocada": [0.84, 0.855] }, ligacoes: [[null, "Voz do Antepassado"], ["Voz do Antepassado", "Memória Emprestada"], ["Memória Emprestada", "Linhagem Convocada"]] },
          "Corte Fantasma": { estrelas: { "Cortesãos de Bruma": [0.819, 0.658], "Baile dos Mortos": [0.891, 0.658], "Trono de Névoa": [0.963, 0.658] }, ligacoes: [[null, "Cortesãos de Bruma"], ["Cortesãos de Bruma", "Baile dos Mortos"], ["Baile dos Mortos", "Trono de Névoa"]] },
        },
      },
    },
  },
};

/* ONDE MORA CADA FIGURA quando há mais de uma classe. Unidades = o lado do
   quadrado da principal. A principal é a classe de origem (pers.classe); as
   outras vêm por ordem de degraus (ranksDoPersonagem), desempate pelo nome.
   As figuras de trás NÃO têm estrelas tocáveis: a figura inteira é UM botão
   («Trazer o Ladino para a frente») — a 0,48 as estrelas ficavam a 21 px. */
export const LUGAR_DAS_FIGURAS = {
  mesa: {
    duas: [{ x: 0, y: 0, escala: 1 }, { x: 1.04, y: 0.14, escala: 0.72 }],
    tres: [{ x: 0, y: 0, escala: 1 }, { x: 1.04, y: 0, escala: 0.48 }, { x: 1.04, y: 0.52, escala: 0.48 }],
  },
  telefone: {
    duas: [{ x: 0, y: 0, escala: 1 }, { x: 0.14, y: 1.06, escala: 0.72 }],
    tres: [{ x: 0, y: 0, escala: 1 }, { x: 0, y: 1.06, escala: 0.48 }, { x: 0.52, y: 1.06, escala: 0.48 }],
  },
  /* 4 ou mais: as de trás ficam na fila das «tres», e o resto entra pela troca */
};

/* O GRUPO (AR5 · formas.md §AR 4, §AR 6, §AR 7; 281:1947, 281:2439, 281:2922):
   a carta do companheiro. `acende` é o losango do marco do vínculo que se
   alcança com o Grupo aberto (§AR 7: 320 ms; no reduce, troca seca). */
export const CARTA_DO_COMPANHEIRO = {
  largura: { mesa: 400, telefone: 343 }, enchimento: { mesa: 20, telefone: 14 }, raio: 14,
  retrato: { mesa: 1, telefone: 0.5 }, nomeNaPlaca: { mesa: 18 }, nome: { telefone: TIPOS.titulo },
  barra: 8, marco: { lado: 11, alcancado: MOLDURA_POR_DEGRAU.ouro.meio, porAlcancar: T.panel },
  sabeFazer: 3,
  acende: { dura: 320 },
};

/* O MERCADO (§AR 4; 282:3205, 282:3534, 282:3839) — AR6, 06/11. A banca e
   o veredito: as medidas de §AR 6, mais o que a tela acrescenta (o vão entre
   as colunas, o enchimento dos cartões, o escolher de 120 ms de §AR 7, o
   encaixe grande do veredito e quantas peças da bolsa ficam à vista). */
export const MERCADO = {
  mesa: { esquerda: 300, veredito: 420, colunas: 4, peca: 245 },
  meia: { veredito: 380, colunas: 4, peca: 186 },
  telefone: { colunas: 2, peca: 165 },
  peca: { encaixe: ENCAIXE.lado, folga: 6, raio: 10 },
  bolsa: { encaixe: 48, largura: 84 },
  gaveta: GAVETA_DO_ENCAIXE,
  vao: 16, enchimento: 16, raio: 14, escolher: 120, encaixeGrande: 72, bolsaAVista: 30,
};

export const FOLHA_DO_MESTRE = {
  cima: 18, baixo: 20,
  lado: 26,            /* na mesa */
  ladoTelefone: 16,    /* no telefone — 07/11 · TL 8: 18 → 16, e são os lados da PÁGINA (a página é a folha) */
  raio: 4,
  peso: 400,
  vinheta: 0.75,       /* a borda do papel, no máximo (o pior ponto da conta) */
  fibra: 0.06,         /* a fibra do papel: não mexe no contraste */
  sombra: 0.55,        /* a folha pousada no couro */
  luzDaVela: 0.07,     /* a vela sobre o feltro, no topo da mesa (era 0,16 na madeira: o âmbar sobre verde baixava o danger) */
  cantoDaMesa: 0.45,   /* a vinheta do feltro */
};

/* ============================================================
   V5e · A CHEGADA — onde a vista pousa quando o Mestre responde.

   ESTAR NO FIM é estar a no máximo UM QUARTO da área do fundo, medido no
   instante em que a resposta CHEGA (o `jogo`, `mente/v5e-jogo.md` §1–2): a
   375 são ~112 px (umas quatro linhas), a 1280 ~110. Até aqui eram 240 px
   fixos — nove linhas no telefone: quem subia nove linhas para reler a frase
   que escreveu já estava lendo, e era arrancado de lá. Quem está no fim
   recebe a resposta pelo começo (a conta é `pousoDaVista`, glifos.js); quem
   está relendo não se move, e a seta lhe diz que há resposta nova. A mesma
   tolerância decide quando a seta aparece. */
export const CHEGADA = {
  toleranciaDoFim: 0.25,
};

/* V5e · A SETA DA LEITURA — a peça que vivia à mão no `App.jsx` (V3c), agora
   com dois estados (`fim` · `novo`). A 18 px do fundo da área, na margem
   direita; a sombra que a destaca da prosa sai daqui e não de um `rgba` à
   mão (o preto a 0,45 de antes é o `onSecond` da casa, #14101F, a 0,45). */
export const SETA_DA_LEITURA = {
  baixo: 18,
  sombra: { y: 4, raio: 14, alfa: 0.45 },
};

/* V5 · O PÉ DO CARTÃO — onde a soleira passa a morar: DENTRO da borda do
   cartão, fora do que rola. 0 px sem oferta. A RUNA POR CIMA dela é a do fim
   do registro (`FimDaPagina`, V5a), que já é o último filho do que rola — a
   ordem de leitura do `jogo` (§2): a última frase, a runa, a oferta. Uma
   segunda runa no pé ficaria a um palmo da primeira.

   E O PÉ SE PAGA COM O QUE A CAIXA DE HOJE CUSTAVA (o critério do `jogo`: o
   topo do campo não se mexe, a área que rola não encolhe). A caixa de hoje
   custa 8 px por baixo da oferta e os 2 da borda ciano dela; dentro do pé a
   oferta é `moldura="aberta"` (sem borda), e os 10 px repartem-se em 6 em
   cima (o botão fica a 10 do fio, com o `py-1` da peça) e 4 embaixo (a
   linha de quem/onde fica a 8 da borda do cartão). Medido: 94 = 94 px a 375
   com uma oferta, 62 = 62 a 1280. O fio que separa o pé do que rola é uma
   sombra de 1 px por dentro, sem leiaute. Os lados: 24 na mesa (o do
   `parchment-footer`), 12 no telefone (o enchimento da cinta) — e sem a
   caixa o verbo GANHA largura: 319 px a 375, contra 314 hoje. */
export const PE_DA_PAGINA = { cima: 6, baixo: 4, lado: 24, ladoTelefone: 12 };

export const AMBIENTE = {
  direcao: "to right",
  paradas: [
    { token: "amber", alfa: 0.063, em: 0 },
    { token: "mundo", alfa: 0.09,  em: 0.55 },
    { token: "rosa",  alfa: 0.072, em: 1 },
  ],
  pisos: { prosa: 7, corpoContraMesa: 2.3 },
};

/* O TOM DA CENA (T3, 29/10) — a LUZ do mundo, por NOME (formas.md, T3 §4b).
   O cartão do gênero diz o nome de um tom (cenario.js, ESQUEMA_DO_CENARIO.tons —
   o vocabulário fechado, que a suíte confere contra as chaves daqui nos dois
   sentidos) e esta tabela diz QUE COR DE T é a luz do meio de AMBIENTE nesse
   mundo. Os nomes são de tom, não de gênero, para outra mesa os reusar sem
   mentir; as luzes são nomes de T, nunca hex — a luz segue a paleta.

   PORQUE SAÍRAM OS CATORZE HEX (topo e pé de cada tom): eram o fundo do
   ModalCena, e a janela aposentou-se (T3 §5b: o tabuleiro já mostra o grupo, a
   vida e os inimigos, com posição, e ninguém a abria desde 25/07). Sem leitor
   de tela seriam a cor de uma tela fantasma. Pescam-se do git
   (6d84aa7:src/estilo.js) se uma tela um dia os quiser.

   A PORTA DA TABELA mora em teste-genero-no-app.mjs, pela conta de
   teste-v1-folha: com a luz do tom, a prosa no pior ponto da página fica ≥
   AMBIENTE.pisos.prosa, inkMeio e inkDim ≥ 4,5, o corpo a ΔE ≥
   AMBIENTE.pisos.corpoContraMesa da mesa — e, sobre T.bg (a criação), o texto
   solto ≥ 4,5. A tabela inteira dos sete está em formas.md, T3 §4b. */
export const TOM_DA_CENA = {
  crepusculo: { luz: "mundo" },
  aco: { luz: "mundoSoft" },
  magenta: { luz: "rosa" },
  breu: { luz: "lineStrong" },
  poeira: { luz: "inkMeio" },
  cobre: { luz: "amber" },
  noite: { luz: "mundo" },
};
/* o tom do recuo: sem mundo, sem tom, ou um nome fora da tabela — a noite, cuja
   luz é a de antes de T3 (o menu, um save sem gênero, a criação antes do clique) */
const TOM_DE_RECUO = "noite";

/* O HELPER QUE `MATERIAIS` PROMETIA DESDE D5: uma cor do tema a alfa,
   pronta para um gradiente ou uma sombra. PÚBLICO desde V1b (25/09): o
   brilho do "Continuar aventura" é a rosa a 0,15, e a alternativa era
   escrever `rgba(...)` à mão — que é o defeito que ele existe para matar.
   Escrito com INTERPOLAÇÃO, não `rgba(...)` literal, para não contar
   como cor nova no `check-formas` (medido: o teto de D5a não se mexe). */
export const alfa = (cor, a) => {
  const n = parseInt(cor.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/* A LUZ AMBIENTE DE UM MUNDO (T3 §4b, 29/10): o gradiente de AMBIENTE com a cor
   da parada do MEIO (a que não é ponta: as pontas são o herói, âmbar, e a mão do
   jogador, rosa) trocada pela luz do tom. Nenhum alfa nem posição muda — só a
   cor do meio, que sempre foi «o mundo» e passa a ser ESTE mundo. Pura: tom
   ausente, fora da tabela ou nome de Object (constructor, toString) é o recuo,
   e com ele a string sai igual ao byte à de antes. */
export function luzAmbiente(tom) {
  const c = (typeof tom === "string" && Object.prototype.hasOwnProperty.call(TOM_DA_CENA, tom) && TOM_DA_CENA[tom]) || TOM_DA_CENA[TOM_DE_RECUO];
  const paradas = AMBIENTE.paradas.map((p) => (p.em > 0 && p.em < 1 ? { ...p, token: c.luz } : p));
  return `linear-gradient(${AMBIENTE.direcao}, ${paradas
    .map((p) => `${alfa(T[p.token], p.alfa)} ${Math.round(p.em * 100)}%`).join(", ")})`;
}

/* A LUZ AMBIENTE MONTADA, para a folha: a do recuo, que é a de quem não tem
   mundo (o menu, um save sem gênero). Mora AQUI e não junto de
   `sombra()`/`brilho()` porque lê `AMBIENTE` e `T`, e uma `const` não
   se lê antes de nascer. A página da história e a criação põem por cima, no
   style, a luz do mundo delas. */
const LUZ_AMBIENTE = luzAmbiente();

/* A rampa montada, para a folha. Mora AQUI e não junto de `sombra()`
   porque lê `ESBATIMENTO`, e uma `const` não se lê antes de nascer.

   O PRETO AQUI NÃO É COR: é o canal ALFA de uma máscara — o que a folha
   pinta é "quanto desta região se vê", não "de que cor ela é". Reaproveita
   `sombra()` na mesma, e de propósito: a alternativa era escrever oito
   `rgba(...)` à mão, e `check-formas` contou-os como oito literais de cor
   novos no minuto em que nasceram. *A catraca não sabe distinguir uma
   máscara de uma cor — e é melhor assim: quem tiver uma boa razão que a
   escreva, como esta.* */
const RAMPA_DO_ESBATIMENTO = ESBATIMENTO.rampa
  .map(([f, a]) => `${sombra(a)} ${Math.round(f * ESBATIMENTO.altura)}px`)
  .join(", ");

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
    /* B1 (05/10, Figma `151:1662`): o quadro da pessoa escreve o custo a
       mono 11, regular, no CENTRO da casa — e a casa deixou de ser sempre
       48 (enche a largura da janela), por isso o corpo é dado em píxeis de
       TELA e o SVG divide-o pelo lado real, nunca pelo piso. Eram 10 e 0,72
       (E1/E4: o centro da fenda da peça de 48). */
    corpoDoCusto: 11,     /* mono 11 px — o quadro B1 */
    linhaDoCusto: 0.5,    /* o centro da casa, como no quadro B1 */
    anelDoFoco: 3,        /* px de `ink`, POR DENTRO: uma casa tem oito vizinhas coladas, e um anel por fora pinta por cima da borda de alcance das oito */
    anelDaParagem: 2,     /* px de `inkDim`, por dentro: onde o teclado VOLTA, contra os 3 px de onde ele ESTÁ */
  },
};

/* ============================================================
   B1 · A NOVA MESA DE BATALHA (05/10) — o quadro `151:1662` da pessoa,
   "Taverna · Batalha na areia solta" (1600 × 1001), em números.

   POR QUE UMA TABELA NOVA E NÃO `TELA_DE_BATALHA`: aquela é a conta de E1
   para o monitor de 1280 (16 + 888 + 16 + 344 + 16), e a suíte soma-a de
   volta. O quadro B1 é OUTRA conta — 32 + campo + 24 + 328 + 32 = 1600,
   com o campo a ser o que sobra (1184 no quadro) — e misturar as duas
   numa tabela só faria uma das somas mentir. O que `TELA_DE_BATALHA`
   ainda decide (o piso do veredito, a altura do verbo, a narração, a
   reserva da reação, a folga da câmara, a tira do telefone) continua a
   sair de lá; daqui sai só o que o quadro B1 mediu.

   AS CORES NÃO ESTÃO AQUI: o quadro guarda os valores de antes de V1
   (`#E8A33D`, `#0E0C15`…) nas variáveis com os NOMES de `T` — o desenho
   liga-se ao token, e o token vale o que `T` vale hoje (`formas.md`, B1).
   Só os ALFAS que o quadro aplica sobre esses tokens moram em `alfa`.

   A LETRA ABAIXO DO PISO, e a exceção fica escrita: o quadro desenha as
   legendas de máquina a mono 10 e 11 (`TAVERNA / MESA DE BATALHA`,
   `PARTICIPANTES`, `TURNO ATUAL`, `PV`…), abaixo de `TIPOS.piso` (12).
   É desenho da pessoa, pedido "igual ao Figma"; a letra vem desta tabela
   com o motivo ao lado, como a de `RUNA`, e a catraca D5g não sobe.
   ============================================================ */
export const MESA_DE_BATALHA = {
  /* a página: px-32 do quadro; 16 no telefone (a calha da casa) */
  margem: 32,
  margemNoTelefone: 16,
  /* "Cena e turno": pt 24, pb 20, 16 entre as linhas */
  cenaTopo: 24,
  cenaBaixo: 20,
  cenaEntre: 16,
  /* "Mesa de combate": pt 8, pb 24, 24 entre as colunas, 16 entre os painéis */
  mesaTopo: 8,
  mesaBaixo: 24,
  entreColunas: 24,
  entrePaineis: 16,
  lateral: 328,            /* "Painel de participantes" */
  raio: 16,                /* os painéis */
  raioControle: 8,         /* os verbos, os chips, os cartões de NESTA BATALHA */
  raioSelo: 4,             /* o selo `ação` */
  raioRedondo: 24,         /* a pílula AGORA, o `como?` e o `Agir` */
  /* "Arena tática": cabeçalho 44 com 20 de lado; a legenda do alcance, 22 */
  arenaCabecalho: 44,
  arenaLado: 20,
  arenaPe: 22,
  /* a janela nunca encolhe abaixo de TRÊS casas: abaixo disso o herói e
     quem está ao lado dele já não cabem juntos na mesma vista */
  janelaMinima: 3,
  /* "Escolhas de combate": p 20, 16 entre as faixas, 8 entre os verbos */
  escolhasRespiro: 20,
  escolhasRespiroNoTelefone: 8,
  escolhasEntre: 16,
  entreVerbos: 8,
  separador: 24,           /* o fio entre a bolsa e `esperar`: 1 × 24 */
  compositor: 62,          /* a caixa do `como?` e o `Agir` */
  compositorLado: 20,
  agir: 136,
  /* "Personagem atual": p 24, 20 entre faixas, moldura 90, retrato 74, barra 6 */
  turnoRespiro: 24,
  turnoEntre: 20,
  moldura: 90,
  retratoDoHeroi: 74,
  barra: 6,
  /* "Outros participantes": p 16, 12 entre, cartão p 12, retrato 38 */
  outrosRespiro: 16,
  outrosEntre: 12,
  cartao: 12,
  retratoDosOutros: 38,
  /* "Participante": retrato 28, 12 × 8 de respiro, 10 entre, ponto da vez 5 */
  retratoDoChip: 28,
  chipLadoX: 12,
  chipLadoY: 8,
  chipEntre: 10,
  pontoDaVez: 5,
  /* "Feedback do turno" (a pílula AGORA): 20 × 12, 12 entre, espadas 22 */
  pilulaLadoX: 20,
  pilulaLadoY: 12,
  glifoDaPilula: 22,
  glifo: 18,               /* scan, crosshair, sparkles, wallet, pen-line, swords da fileira */
  glifoDoSelo: 12,
  glifoDaRuna: 24,         /* o ✧ do quadro, desenhado (D5h: nenhuma família da casa o tem) */
  glifoDoDado: 22,
  /* a letra, em píxeis — ver o motivo no cabeçalho desta tabela */
  letra: {
    legenda: 10, chip: 11, veredito: 11, verbo: 12, agir: 13, valor: 13,
    cena: 15, titulo: 38, tituloNoTelefone: 24, nomeDoHeroi: 32,
    nomeDoAliado: 20, nomeDoInimigo: 23, valorDoOutro: 12, foco: 25, focoDiz: 13,
  },
  rastreio: 1,             /* tracking-[1px] das legendas mono */
  /* OS ALFAS QUE O QUADRO APLICA SOBRE OS TOKENS */
  alfa: {
    brilho: 0.08,          /* o fundo âmbar da pílula AGORA, do `Agir` e da moldura do herói */
    fio: 0.42,             /* o fio âmbar escuro (#765931 no quadro = `amber` a 0,42 sobre `bg`) */
    veuDoTerreno: 0.73,    /* "Véu noturno": `bg` a 0,73 por cima da textura */
    zonaAcesa: 0.08,       /* a zona do herói, acesa no chão ("Areia solta") */
    dentroDoPasso: 0.03,   /* "Área de movimento": o dentro do tracejado */
    foraDoPasso: 0.35,     /* o véu de v9.125 sobre o que não se alcança, aliviado: a textura tem de se ler */
    malha: 0.16,           /* as linhas da grade */
    nomeDaZonaAcesa: 0.5,
    nomeDaZona: 0.44,
    casaDoHeroi: 0.13,     /* "Casa atual" */
    casaDosOutros: 0.08,   /* "Casa aliada" — e a do inimigo, com a cor dele */
    hachura: 0.125,        /* "Hachuras da areia" */
  },
  /* O CHÃO DESENHADO, em píxeis de tela (o SVG divide pelo lado da casa) */
  chao: {
    recuoDoNome: 18,       /* o nome da zona começa 18 px dentro da primeira casa */
    corpoDoNome: 11,
    rastreioDoNome: 1.98,
    tracoDoHeroi: 2,
    tracoDosOutros: 1,
    tracoDoPasso: 1.5,
    tracoDoPassoTracejado: 4,
    passoDaHachura: 19.5,  /* 24,6 px na horizontal, a 37,5° — o passo perpendicular */
    anguloDaHachura: 37.5,
    malha: 1,
  },
  /* o obstáculo do quadro: 38 × 34 dentro de uma casa de 62 */
  estorvo: { largura: 38, altura: 34, casa: 62, alfaDaSombra: 0.31 },

  /* ============================================================
     B1b (06/10) · A MESA CABE NA JANELA — o pedido da pessoa, com foto:
     *"a tela de batalha deveria caber tudo sem precisar descer ou subir,
     assim como no figma"*. Na foto (janela útil 1907 × 845) o tabuleiro
     mostrava as linhas 11–14 de 14, com rolagem própria, e NESTA BATALHA
     saía cortado por baixo, sem o cartão do inimigo.

     A CASA NO MONITOR DESCE A 32, E SÓ NO MONITOR. O lado passa a ser o
     MENOR entre a largura útil ÷ colunas e a altura útil ÷ linhas — o
     tabuleiro INTEIRO na caixa —, entre um piso e um teto. O piso de 48
     (`ALVOS.piso`, WCAG 2.5.5 AAA) era o alvo do dedo; num aparelho de rato
     vale o tabuleiro inteiro à vista, e 32 cumpre com folga o WCAG 2.5.8
     (AA, *Target Size (Minimum)*: 24 × 24). O telefone continua em 48: ali
     o alvo é o dedo, e rolar é aceitável. Só abaixo do piso é que a janela
     rola, centrada no herói (o enquadramento de E1). O teto é o lado que o
     quadro dá a 1600 de largura (1184 ÷ 18 ≈ 64): acima dele a casa já não
     ensina nada e só come altura. */
  casaMinimaNoMonitor: 32,
  casaMaximaNoMonitor: 64,
  /* OS DOIS PATAMARES DE ALTURA (a janela, não a tela), medidos:
     · CURTO (< 1000) — abaixo da altura do próprio quadro (1001). Com os
       respiros do quadro, a 1920 × 960 sobravam 31 px por casa: o deserto
       (18 × 14) não cabia por uma linha. O cabeçalho e a ação apertam
       (o corte de ontem era 900, e a 960 já não chegava);
     · BAIXO (< 860) — abaixo da altura em que o deserto inteiro cabe a 32
       com o patamar curto (≈ 850). Aqui aperta tudo o que não é tabuleiro
       nem barra de ação: o título desce ao do telefone, os chips e a pílula
       encolhem, o TURNO ATUAL compacta. A 1907 × 845 — a janela da foto —
       é este patamar que faz o tabuleiro caber inteiro.
     Abaixo disso (1366 × 657) o deserto já não cabe a 32 com barra de ação
     nenhuma, e é a janela que rola, centrada no herói. */
  /* · JANELA BAIXA (< 560, MM11 · 10.ª sessão, 13/10) — a mesma régua da
       Baixa das fichas (`FICHAS.baixaAltura`): o notebook baixo da mesa,
       800 × 451. Com todos os apertos de cima, o campo ficava com 72 px (o
       cabeçalho e meia fila) e Mover não tinha casa onde tocar. Aqui o campo
       deixa de ceder e a página da luta rola (ver `janelaBaixa`). */
  patamares: { curto: 1000, baixo: 860, janelaBaixa: 560 },
  /* QUANTAS CASAS O CAMPO GUARDA NA JANELA BAIXA: 7, no piso do monitor (32)
     = 224 px de chão. O herói ao meio e 3 casas para cada lado: 4,5 m, o
     passo de quem já andou metade, e a casa do inimigo corpo a corpo com
     folga. É a JANELA que tem esta altura (o pé cresce com a legenda do
     passo, e não lha pode comer). Medido a 800 × 451 numa página de prova
     com a tela real: janela 224, campo 329 (antes: 87, com ≈ 31 px de chão),
     a página da luta rola 242 px, e tocar Mover traz o campo de y −124 a 0. */
  janelaBaixa: { casas: 7 },
  /* o que muda no patamar BAIXO. O resto do aperto (o cabeçalho e a ação
     no patamar CURTO) reusa números que a tabela já tem. */
  aperto: {
    cenaTopo: 8, cenaBaixo: 4, cenaEntre: 4,
    chipLadoY: 4,          /* o chip do participante: 46 → 38 de altura */
    arenaCabecalho: 32,    /* o cabeçalho do campo: os botões de zona ficam no mesmo piso de rato da casa */
    entrePaineis: 12,
    /* o TURNO ATUAL compacto: moldura 90 → 56, retrato na mesma razão
       (74/90 ≈ 46/56), nome 32 → 24 */
    turnoRespiro: 16, turnoEntre: 12, moldura: 56, retratoDoHeroi: 46, nomeDoHeroi: 24,
    outrosRespiro: 12, outrosEntre: 8,
  },
};

/* O CHÃO DE CADA PLANTA (B1). SÓ o deserto tem textura, e é a imagem do
   próprio quadro da pessoa (`public/terrenos/deserto.jpg`). As outras nove
   plantas de `grid.js` ficam no chão liso até a pessoa desenhar a delas —
   NÃO se gera nem se escolhe imagem (`formas.md`, B1). A chave é o
   `cenario` de `PLANTAS`; quem não está aqui não tem textura. */
export const TERRENO_DO_TABULEIRO = {
  deserto: "/terrenos/deserto.jpg",
};

/* ============================================================
   R21 · A HUD RECOLHIDA NO TELEFONE (24/09/2026) — `mente/formas.md`,
   "### R21 · a fabricação" §§2, 3, 4, 8.

   QUATRO TABELAS PEQUENAS PARA UMA IDEIA SÓ: no telefone a fita de abas
   sai da tela, e a ficha da cinta vira a porta de um ALFORJE — uma folha
   que sobe por cima da cena com as abas no PÉ, não no cabeçalho (a razão
   é a reaprendizagem: as abas ficam exactamente onde sempre estiveram, o
   jogador só passa a precisar de um toque antes). Nenhum número aqui é
   inventado: `ALFORJE.raio`/`pega` vêm do *drag handle* do Material 3
   (md-comp-sheet-bottom, material-web v0_192); os dois tempos de `VEU`
   são os que `formas.md` já escrevia em "abrir e fechar um painel" e
   nunca tinham chegado ao código; `MARCA_DA_PORTA` e `MUDOU_AGORA` são a
   primeira peça nova desta etapa — o disco que avisa "há algo aqui que
   você ainda não abriu".

   O TOPO DO ALFORJE E O ARRASTO PARA FECHAR NÃO MORAM AQUI, DE PROPÓSITO:
   são RELAÇÃO, não número — `CINTA.altura` (ou `alturaViva`) + `ALVOS.piso`
   para o primeiro, `2 × ALVOS.piso` para o segundo. Um número que já tem
   casa não ganha uma segunda (a mesma lei de `CAMPO_DO_TURNO.tecto`).
   ============================================================ */
export const ALFORJE = {
  raio: 16,                                    /* só os dois cantos de cima */
  pega: { largura: 32, altura: 4, topo: 6 },    /* Material 3, drag handle */
  enchimentoDaFita: 4,                          /* fita = ALVOS.chamado + 2 × isto = 64 */
  espacoEntreAbas: 2,
  larguraParaSeisRotulos: 339,                  /* 315 medidos (6 rótulos, JetBrains Mono Bold 12) + 2 × 12 de margem — abaixo disto, seis abas viram só glifo */
  tira: { margemV: 4, margemH: 8, raio: 8, recuo: 10, marca: { largura: 3, altura: 24, raio: 2 } },    /* `A faixa do fundo` · Espreita: a tira da página, 359 × 40 a 375px (R21 §8) · V5e: e a seta `Novo` da página — a mesma tira (`TiraDaResposta`) */
  /* V4d · na mesa o cabeçalho da gaveta (título e ✕) fica colado ao topo ao
     rolar, e o cartão que o toque num companheiro pede para abaixo dele: 20 do
     `md:pt-5` + 56 de `ALVOS.chamado` + 16 de respiro. */
  focoAbaixoDoCabecalho: 92,
  /* V5 (conserto da prova do `jogo`, `v5-jogo.md` §8.4) · a soma de cima
     supunha um cabeçalho de 76, e o medido é maior: sobrava uma tira de ~8 px
     do cartão de cima debaixo do título preso. O foco passa a sair da altura
     MEDIDA do cabeçalho (a `Alforje` a escreve em `--tv-cabecalho-da-gaveta`)
     mais este respiro; os 92 ficam só como reserva, antes da primeira medida. */
  respiroDoFoco: 16,
  /* R21k (29/09) · "um toque nunca é um arrasto". A construção original de §2
     começava o gesto de descer em QUALQUER pointerdown com o rolamento no
     topo — sem limiar, sem direção — e as sub-abas da Gestão (Ficha, Grupo…)
     moram exatamente aí: cada toque nelas armava um arrasto, o tremor do dedo
     virava translateY, e ao soltar a animação de entrada recomeçava do zero.
     8 px é o touch slop do Android: a distância abaixo da qual a própria
     plataforma ainda chama o gesto de "toque" e não de "arrasto"
     (ViewConfiguration.config_viewConfigurationTouchSlop = 8 dp, AOSP). Abaixo
     disso, o pointerdown só arma um candidato; o arrasto em si só começa no
     pointermove que cruzar esta distância para baixo. */
  limiarDoArrasto: 8,
};

/* O `scroll-margin-top` do cartão pedido na gaveta: a altura medida do
   cabeçalho preso + `respiroDoFoco`; sem medida, a soma de V4d. */
export const FOCO_NA_GAVETA = `calc(var(--tv-cabecalho-da-gaveta, ${ALFORJE.focoAbaixoDoCabecalho - ALFORJE.respiroDoFoco}px) + ${ALFORJE.respiroDoFoco}px)`;

/* O VÉU — três pesos e dois tempos que já eram lei em "abrir e fechar um
   painel" (`formas.md`) e nunca tinham chegado ao código: o alforje é o
   primeiro leitor. `leve` é o do alforje (a cena continua a ler-se por
   trás, 3,30:1 — V1, de propósito); `pesado` e `semRetorno` esperam o dia em
   que outra sobreposição precisar de um véu mais escuro. */
export const VEU = { entra: 180, sai: 120, leve: 0.6, pesado: 0.85, semRetorno: 0.94 };

/* A MARCA DA PORTA — disco de 16, recorte de 2 (o corpo visível é
   `lado − 2 × recorte` = 12). O recorte é medida, não enfeite: sem um
   fundo sólido por baixo, o disco `Novo` (`amber` cheio) sobre o anel
   `amber` do próprio retrato mede 1,00:1 — desaparece. */
export const MARCA_DA_PORTA = { lado: 16, recorte: 2 };

/* A GRAMÁTICA DO "SELO DE ESTADO" QUE `A MARCA DA PORTA` TOMA EMPRESTADA
   ao virar `Novo`: três pulsos de 1,2s e PÁRA — nunca `infinite`, porque
   uma luz que nunca descansa é papel de parede, não aviso. */
export const MUDOU_AGORA = { pulso: 1200, vezes: 3 };

/* ============================================================
   A1 · O RECIBO — o que a ficha mudou neste turno (`formas.md` §A1 1,
   Figma `255:103`). Uma fila numa linha só, debaixo da prosa do Mestre.

   A CONTA DO QUE CABE É PURA (`reciboQueCabe`, glifos.js) e não precisa
   do DOM, porque a JetBrains Mono tem avanço fixo de 600/1000 em: um
   carácter a 12 px mede 7,2 px, sempre. É `avancoMono` que deixa a fila
   ser medida em Node e provada na suíte.

   O TETO PROTEGE A PROSA, E A LARGURA MANDA ANTES DELE: 6 chips na mesa,
   4 no telefone; o primeiro que não cabe fecha a fila (a ordem é lei, e
   o corte também — nunca se salta para um menor depois dele), e o resto
   diz-se `e mais N`. O item trunca com reticências, mas nunca abaixo de
   `pisoDoNome` caracteres (o piso de §21: o teto de 45 caracteres ÷ 4).
   ============================================================ */
export const RECIBO = {
  entre: 16, entreTelefone: 12,
  tetoNaMesa: 6, tetoNoTelefone: 4,
  avancoMono: 0.6,   /* JetBrains Mono: 600/1000 em — é o que deixa a conta ser pura */
  pisoDoNome: 12,    /* §21: o teto de 45 caracteres ÷ 4, arredondado para cima */
  entrelinha: 18,    /* TIPOS.maquina × 1,5 */
};

/* A1 · O FIM DA LUTA (`formas.md` §A1 3, Figma `255:295`) — o momento do
   ganho, na própria mesa de batalha. O desfecho e os chips entram com
   `.tv-fim-entra` (240 ms, cada chip 60 ms depois do anterior: ≤ 480 ms
   no total); o `Respirar fundo` NÃO participa — está lá desde o primeiro
   quadro. O chão mostra 2 coisas na mesa e 1 no telefone; o resto é uma
   `A dobra`. */
export const FIM_DA_LUTA = { entra: 240, passo: 60, tetoDoChao: 2, tetoDoChaoNoTelefone: 1 };

/* `O VERBO COM PREÇO` (biblioteca `64:2446`; o espelho da fogueira é o
   `197:65`) — o botão que FUNCIONA e diz o preço na tela. Nasceu na
   biblioteca em D4 porque o `Botao` só tinha fenda de razão quando recusa;
   no código vivia só por dentro da mesa de batalha (`Verbo`, privado de
   `painel-batalha.jsx`, com as medidas de `TELA_DE_BATALHA`). A fogueira é
   o segundo leitor, e por isso a peça sobe a `ui.jsx` (`VerboComPreco`) com
   as medidas do nó: 14 de lado, 6 em cima e em baixo, 10 entre as palavras
   e o atalho, 1 entre o verbo e o preço, raio 8. A altura é `ALVOS.piso`,
   nunca a soma do enchimento. O preço vai a 12 (o piso), como `Mapa/Partir`. */
/* F2c (o cartão das fichas, nós `210:2952` e `210:2957`) deu-lhe dois
   estados: o *Impedido* (oco, contorno tracejado, o atalho cala) e o *Sem
   volta* (contorno `danger` de 1,5 e a barra de 3 à esquerda). */
export const VERBO_COM_PRECO = { lado: 14, cima: 6, entre: 10, palavras: 1, raio: 8, fioSemVolta: 1.5, barraSemVolta: 3 };

/* A MISTURA DE DUAS CORES DE `T`, em percentagem INTEIRA. Privada: só a
   fogueira a pede hoje. Inteira de propósito — `0.1` em vírgula flutuante
   arredonda o azul do `lugarAceso` para baixo (44,4999…) e a cor sai
   `#31252C`; com 10 sobre 100 a conta é exata e sai `#31252D`, a do nó. */
const misturar = (a, b, pct) => "#" + [1, 3, 5].map((i) => {
  const x = parseInt(a.slice(i, i + 2), 16), y = parseInt(b.slice(i, i + 2), 16);
  return Math.round((x * (100 - pct) + y * pct) / 100).toString(16).padStart(2, "0");
}).join("").toUpperCase();

/* ============================================================
   F1 · A FOGUEIRA (`formas.md` § Fogueira, Figma `09 · Fogueira` `196:2`,
   biblioteca `197:2`, coleção `Fogueira (FOGUEIRA)` `196:18`).

   O QUE É IGUAL A `T` É `T` (§3): a chama é o âmbar, o cerne o âmbar que
   se lê, a lenha o erguido com o fio de controlo, o escolhido a tua mão.
   UMA cor nova, `lugarAceso` — e ela não entra como literal: é a própria
   receita do desenho (`panel` + 10 % de âmbar) feita conta, e a suíte
   (`teste-painel-fogueira.mjs`) prende o resultado em `#31252D`. No dia em
   que o âmbar mudar, o lugar aceso muda com ele — que é o que a receita diz.

   As medidas de §3 estão com os nomes de §3 (`lugar`, `brasa`, `fogo`,
   `raio`, `lugaresMax`, `lugares`). O resto saiu dos nós citados ao lado de
   cada linha, lido no `get_design_context` — nenhum afinado a olho.
   ============================================================ */
export const FOGUEIRA = {
  chama: T.amber,
  cerne: T.amberSoft,
  clarao: T.amber,
  lenha: T.panelSoft,
  lenhaFio: T.lineStrong,
  escolhido: T.rosa,
  lugarAceso: misturar(T.panel, T.amber, 10),   /* = #392816 na Mesa C (era #31252D na v3) */
  claraoCentro: 0.2,
  /* as paragens do gradiente radial do clarão: [onde, opacidade] (nó `197:34`) */
  claraoParadas: [[0, 1], [0.55, 0.35], [1, 0]],

  /* Mesa: a LARGURA do lugar · Baixa: a ALTURA. A Baixa era 56 (`198:79`) e
     passou ao piso do alvo (48) na 7.ª sessão de prova (v9.416): o quadro do
     Figma tinha um cabeçalho de página de 41, o jogo tem o de V5a, de 69, e a
     roda de quatro + «Dormir já» passava 28 px do fim da página de 323 a
     800×451 (medido; `formas.md` § Fogueira, 10). O nome e o gesto pedem 36. */
  lugar: { mesa: 176, baixa: ALVOS.piso },
  brasa: 20,
  fogo: { mesa: 132, baixa: 48 },    /* a altura do fogo (as larguras em `roda.fogo`) */
  raio: 12,
  lugaresMax: 5,
  /* §2 — [fração da largura, y em px] por contagem, NA ORDEM DOS PAPÉIS */
  lugares: {
    1: [[0.5, 0]],
    2: [[0.36, 8], [0.64, 8]],
    3: [[0.22, 96], [0.5, 0], [0.78, 96]],
    4: [[0.14, 104], [0.36, 8], [0.64, 8], [0.86, 104]],
    5: [[0.10, 120], [0.29, 24], [0.5, 0], [0.71, 24], [0.90, 120]],
  },

  /* A RODA DA MESA (`200:213`): 316 de alto, o fogo ao centro em y 176 */
  roda: { altura: 316, fogoY: 176, fogo: { mesa: 240, baixa: 160 } },
  /* o lugar na Mesa (`198:8`): ≥180 de alto, 18 em cima, 16 em baixo, 12 de
     lado, 8 entre o rosto, o nome e o gesto; o atalho no canto (11, 9); a
     brasa sobre o rosto em (48, −2) */
  lugarMesa: { altura: 180, cima: 18, baixo: 16, lado: 12, entre: 8, atalho: [11, 9], brasa: [48, -2] },
  /* o lugar na Baixa (`198:79`): 12 à esquerda, 14 à direita, 12 entre; em
     cima 6 desde que a altura é 48 ((48 − 36 do nome e do gesto) / 2; era 8 a 56) */
  lugarBaixa: { esquerda: 12, direita: 14, cima: 6, entre: 12 },
  filete: 3,          /* o escolhido: o filete de 3 embaixo (a gramática de `A escolha`) */
  rosto: { ficha: 160, cartao: 64, chip: 32 },
  letra: { nomeNoLugar: 19, nomeDaFala: 22, rastreioDaVoz: 0.08, rastreioDoRedor: 0.06, entrelinhaDaFala: 1.65 },
  /* a fala na Mesa (`200:663`): a coluna de quem fala (220, o rosto ao fogo
     num quadrado de 220 com o retrato a (30, 20) e o fogo a (−10, 120)), 40
     até à página, 20 entre os blocos dela, 12 entre os dois lados */
  fala: { coluna: 220, rostoEm: [30, 20], fogoEm: [-10, 120], entreRostoENome: 10, entre: 40, ritmo: 20, entreLados: 12, chip: 8, entreChips: 16 },
  /* a Baixa (`202:206`, `202:405`): duas colunas com 8 entre elas; a coluna
     de quem fala com o rosto Cartão; 12 entre os blocos */
  baixa: { entre: 8, ritmo: 12, coluna: 96, entreColunas: 24,
    /* A RODA ESTREITA (7.ª sessão de prova, § Fogueira 10). `fogoCede`: o
       clarão do fogo pequeno é 160 de largo e a lenha e as faíscas acabam
       em x 106; os 32 da ponta direita (o clarão a ~4 % de âmbar) deixam a
       abertura pousar neles — sem isso, «A lenha estala. Ninguém tem pressa
       de dormir.» (365 px) partia a 364 e a roda descia 25.
       `lugarMin`: abaixo disto o lugar não divide a linha — a roda vira uma
       coluna. 240 = os 122 do que não é texto (12 + rosto 32 + 12 + 12 +
       brasa 20 + 12 + atalho 8 + 14) e 118 de nome, ~15 letras a 15 px
       (medido: «Tônia Lodoso» 92). A 467 a coluna dupla dava 178 e cortava
       «Jaco F…». */
    fogoCede: 32, lugarMin: 240 },
  /* os verbos que não são de lado (Dormir já, Dormir sem responder): 300 */
  verboSo: 300,
  /* entre a abertura, a pergunta, a roda e o Dormir já (`200:210`) */
  ritmoDaRoda: 12,
  /* a manhã (D/E): o ladrilho e a linha que a separa da prosa */
  manha: { respiro: 24, palavras: 2 },

  /* §5 — tv-fade 240 na entrada, lugares em sequência de 60 (≤ 300), a
     chama respira 2,4 s (0,96–1,04 na base), o escolhido vira o retrato
     grande em 200. As faíscas usam a curva de `tv-flutua` (1,35 s), em
     laço e desencontradas por um terço do ciclo. */
  movimento: { entra: 240, passo: 60, tetoDoPasso: 300, respira: 2400, respiraMin: 0.96, respiraMax: 1.04, vira: 200, faisca: 1350 },

  /* QUANDO A MESA CABE — a decisão mais simples, anotada (o desenho fixou
     os dois formatos, 1280×912 e 800×451, e não o corte entre eles). A
     altura: a página que cada estado pede (A 466, `200:210`; a fala 340,
     `200:663`) mais a moldura que a página tem à volta no quadro da Mesa
     (912 − 572 do corpo + 2 × 28 de enchimento = 396). A largura sai da
     própria tabela dos lugares (nenhum lugar por cima do vizinho) e, na
     fala, de duas colunas de verbo de 300. O `oficial` pode forçar o
     formato pela prop `formato`. */
  mesaPede: { roda: 466, fala: 340, moldura: 396 },
};

/* ============================================================
   F2b · F2c · AS FICHAS E O CARTÃO (`formas.md` § Fichas, Figma `10 ·
   Fichas` `208:21`, biblioteca `210:2`, coleção `Fichas (FICHAS)`
   `VariableCollectionId:208:3`).

   O QUE É IGUAL A `T` É `T` (§4), e NENHUMA COR NOVA: o fundo da ficha é o
   erguido, o fio o de controlo, a mão o rosa, o preço o âmbar que se lê, o
   hostil o perigo, o ladrilho da marca e o cartão o `panel`. As medidas de
   §4 estão com os nomes de §4 (`altura`, `marca`, `raio`, `larguraMax`,
   `max`, `vao`, `cartao`, `pe`, `baixaAltura`, `movimento`); o resto saiu dos
   nós citados ao lado de cada linha, lido no `get_design_context` — nenhum
   afinado a olho.

   DUAS COISAS QUE O APRENDIZ NÃO SOUBE, e escolheu o mais simples:
   · `marca` = 32 é o `RETRATO.lado.chip` de § Retratos, e essa tabela ainda
     não nasceu em código. Fica o número, com o nome dele; no dia em que
     `RETRATO` existir, esta linha passa a alias.
   · o disco do bicho sem pintura é `retrato/fundo` (#1E1930) no Figma, que
     também não existe em `T`. Para não abrir cor nova, vai o `panel` (o
     mesmo ladrilho da coisa e do lugar — 0,9 % de luz de diferença, e o
     `inkMeio` da pata continua a 8,90:1). Pergunta escrita ao `desenho`.
   ============================================================ */
export const FICHAS = {
  fundo: T.panelSoft,
  fio: T.lineStrong,
  escrita: T.rosa,
  preco: T.amberSoft,
  hostil: T.danger,
  marcaFundo: T.panel,
  /* a sombra do popover da Mesa (nó `214:816`): 0 12 32, preto a 0,55 —
     profundidade, não cor do tema (a mesma razão de `sombra()`) */
  sombra: `0 12px 32px ${sombra(".55")}`,

  altura: ALVOS.piso,
  marca: 32,
  raio: 12,
  larguraMax: 240,
  max: 4,
  vao: 8,
  /* a ficha por dentro (nós `210:50` e `210:144`): 8 à esquerda; 14 à
     direita em Repouso e 8 na armada, onde o ⌄ (16) entra com os 10 de vão
     — a ficha armada é 20 mais larga, como no nó; 10 entre a marca e as
     palavras; o filete da mão 3 (a gramática de `A escolha`) */
  ficha: { esquerda: 8, direita: 14, direitaArmada: 8, entre: 10, mais: 16, filete: 3 },
  /* a letra (§3): o nome Spectral 500 15/18; a linha da pessoa Spectral 13,
     a dos outros mono 12, as duas em 16 de entrelinha */
  letra: { nome: 15, nomeAltura: 18, linhaAltura: 16, nomeDoCartao: 22, nomeDoCartaoAltura: 26, quemAltura: 18, linhaDoCartao: 22, rastreioDoRotulo: 0.08, rotuloAltura: 16 },
  /* `Ficha/Marca` (nó `210:49`): o ladrilho da coisa e do lugar tem raio 8 a 32
     e 16 a 64, e o glifo 16 / 28; o disco do bicho tem anel de 2 / 3 */
  ladrilho: { raio: { 32: 8, 64: 16 }, glifo: { 32: 16, 64: 28 }, anel: { 32: 2, 64: 3 } },

  cartao: {
    fundo: T.panel, largura: 376, marca: 64, raio: 12, folhaMax: 0.62, colunaVerbos: 320,
    /* o cartão por dentro (nós `214:816`, `211:83`, `211:82`): 16 de
       enchimento, 12 entre a cabeça, o fio, o que se sabe e os verbos; 12
       entre os dois blocos do que se sabe, 4 do rótulo às linhas e entre
       elas; 8 entre os verbos. A cabeça: 12 entre a marca e o nome, 2 entre
       o nome e o quem, o × de 48 com o glifo de 16 e raio 8 */
    enchimento: 16, entre: 12, entreBlocos: 12, entreLinhas: 4, entreVerbos: 8,
    cabeca: { entre: 12, palavras: 2, fechar: ALVOS.piso, glifo: 16, raioDoFechar: 8 },
    /* `Cartão/Linha`: a marca numa coluna de 12, 10 até à frase; o ponto de
       Sabe tem raio 2, o anel de Lembra raio 2,875 com fio 1,25; o Segredo
       tem o fio tracejado de 2 à esquerda e 10 de recuo, e a meia-lua 12 */
    linha: { marca: 12, entre: 10, ponto: 2, anel: 2.875, fioDoAnel: 1.25, fioDoSegredo: 2, recuoDoSegredo: 10, meiaLua: 12 },
    /* o telefone (nó `217:1739`): a folha com raio 16 em cima e a pega de
       36 × 4 numa faixa de 8, a 9 do topo. Arrastar a pega para baixo uma
       distância de alvo (o piso, 48) fecha — o número é do aprendiz, e está
       escrito como pergunta ao `desenho` */
    folha: { raio: 16, pega: { largura: 36, altura: 4, faixa: 8, cima: 9 }, arrasto: ALVOS.piso },
    /* a Baixa (nó `216:1838`): duas colunas com 16 entre elas */
    entreColunas: 16,
  },

  pe: { cima: PE_DA_PAGINA.cima, baixo: PE_DA_PAGINA.baixo },
  baixaAltura: 560,
  /* A ORDEM DA LINHA SÓ (Baixa com oferta, §1). Nasceu «a oferta primeiro»;
     a 10.ª sessão de prova (MM11, 13/10) mediu-a a 800×451: a oferta à
     largura natural (o verbo, quem/onde, o preço, a janela) empurrava as
     fichas para x ≈ 1.900 de 2.663 px — fora da vista, sem sinal de que
     existiam. E as fichas são o atalho mais usado da tela: 14 ações por
     ficha contra 4 por «Aceitar» na mesma sessão (3,5 ×). Com as fichas
     primeiro, elas começam em x = 0 (as quatro cabem em ≤ 4 × 240 + 3 × 8),
     e a oferta abre logo a seguir, com o verbo dela à esquerda da região —
     a uma ficha ou duas de distância, e não a um ecrã e meio. Medido a
     800 × 451 com o painel real, três fichas e a oferta da sessão: o grupo
     das fichas de x = 893 (fila útil 46..754) para x = 50; a oferta começa
     em x = 479, ainda à vista. */
  ordemNaLinha: ["fichas", "oferta"],

  /* §7 — a ficha entra em `tv-fade` de 160 com 40 de escalonado (≤ 280) e sai
     em 120; o cartão entra em 160 com 4 px de subida */
  movimento: { entra: 160, escalonado: 40, tetoDoEscalonado: 280, sai: 120, cartao: 160, subida: 4 },
};

/* ============================================================
   O RETRATO PINTADO — o que a pintura recebe por código (`formas.md`
   § Retratos 5 e 12, item 5). O recorte, os limiares e a pasta são do motor
   (`RETRATO` em `src/retratos.js`); aqui fica só o que é tinta por cima.

   O estado nunca troca a pintura: é filtro e anel. O Ferido de §5 é uma
   vinheta interior em `danger` com o miolo limpo até lado/3 — no disco de
   raio lado/2, o claro vai até 2/3 do raio. A força da vinheta não está
   escrita em §5: 0,4 no ferido e 0,65 no grave são do `aprendiz` (12/10), e
   estão em `mente/diario-desenho.md` como pergunta ao `desenho`. O
   `furioso` do inimigo (≤ 55 % da vida, `estadoDe`) é o ferido dele.
   ============================================================ */
export const RETRATO_PINTADO = {
  vinheta: { cor: T.danger, claro: 2 / 3, ferido: 0.4, grave: 0.65 },
  /* o estado de `estadoDe` → a força da vinheta (0 = nenhuma) */
  estado: { normal: 0, ferido: "ferido", furioso: "ferido", grave: "grave" },
};

/* ============================================================
   O MAPA VIVO (MM17 · a faixa do rumo e a tela grande) — `formas.md`
   § Mapa (§3 a tabela, §2 as peças), Figma `ffWFqD7TueSb88Mkeg9bhW`,
   página `07 · Mapa` (`160:48`), colecção `Mapa vivo (MAPA_VIVO)`.

   O que é igual a `T` É `T` (referência, não cópia). As cores que nascem
   aqui são as do chão, do céu e da hora, em três modos (Dia · Entardecer
   · Noite) — a tela escolhe o modo pela fase do relógio (`modoDaFase`).
   As medidas que não estão escritas em §3 foram tiradas dos nós, e cada
   bloco diz de qual: a faixa de `172:1467` (começo), `172:1539` (viagem),
   `172:1695` (lá dentro) e `172:1714` (telefone); a tela de `167:299`.
   Quem lê: `painel-mapa-vivo.jsx` e `faixa-do-rumo.js` (a conta).
   ============================================================ */
export const MAPA_VIVO = {
  heroi: T.amber,
  heroiTinta: T.onAccent,
  gancho: T.amberSoft,
  perigo: T.danger,
  concluido: T.ok,
  tinta: T.ink,
  tintaMeio: T.inkMeio,
  tintaDim: T.inkDim,
  trilha: T.inkDim,
  estrada: T.inkMeio,
  halo: T.pagina,
  estradaBorda: T.pagina,
  medalhao: T.panel,
  painel: T.panel,
  painelAlto: T.panelSoft,
  medalhaoBorda: T.lineStrong,
  linha: T.line,
  moldura: T.bg,
  aguaLuz: T.mundoSoft,

  /* §3 — os três modos. `veu` e `janela` levam o alfa da tabela de §3 */
  modos: {
    dia: {
      chao: { floresta: "#17241F", gelo: "#232A38", planicie: "#25222F", colina: "#2A2530", costa: "#1F2433", pantano: "#1D2422", deserto: "#2E2822", montanha: "#26232E" },
      mata: "#1E3229", arvore: "#3E6B55", arvoreLuz: "#6FA386",
      pico: "#B9C6DA", picoSombra: "#4A5570",
      agua: "#3A8FBF", nevoa: "#0B0914",
      ceuAlto: "#2B2545", ceuBaixo: "#4A3F6B",
      cristaLonge: "#3A3458", cristaPerto: "#1E1A33",
      astro: "#F2ECE0",
      veu: "transparent", janela: alfa(T.amberSoft, 0), estrelas: 0,
    },
    entardecer: {
      chao: { floresta: "#1A2120", gelo: "#2A2633", planicie: "#2B2230", colina: "#30242C", costa: "#262233", pantano: "#221F21", deserto: "#342620", montanha: "#2C222B" },
      mata: "#22302A", arvore: "#3F5F4C", arvoreLuz: "#8A9670",
      pico: "#D9B7A6", picoSombra: "#4F4560",
      agua: "#4C7FA0", nevoa: "#0B0914",
      ceuAlto: "#3A2440", ceuBaixo: "#8A4A4A",
      cristaLonge: "#4A2E46", cristaPerto: "#221829",
      astro: "#F5C9A0",
      veu: alfa("#50202A", 0.22), janela: alfa(T.amberSoft, 0.6), estrelas: 0.3,
    },
    noite: {
      chao: { floresta: "#0F1520", gelo: "#161B28", planicie: "#17161F", colina: "#1A1820", costa: "#141824", pantano: "#121716", deserto: "#1D1A17", montanha: "#18161E" },
      mata: "#121D1B", arvore: "#26443A", arvoreLuz: "#3E6656",
      pico: "#7D8AA6", picoSombra: "#2C3348",
      agua: "#2A5F86", nevoa: "#06050C",
      ceuAlto: "#0E0F22", ceuBaixo: "#1A1A3A",
      cristaLonge: "#1C1A33", cristaPerto: "#100E1C",
      /* a lua nunca é âmbar: o âmbar é o herói */
      astro: "#C9D2E6",
      veu: alfa("#05071C", 0.5), janela: alfa(T.amberSoft, 1), estrelas: 0.9,
    },
  },
  /* que modo cada fase do relógio pinta (`FASES_DO_DIA`, mapa-vivo.js). O
     amanhecer usa o entardecer — DECIDIDO (`aprendiz`, 12/10; era a dúvida 1
     da v9.441): é a mesma luz baixa e quente, o sol rente ao horizonte, e um
     quarto modo seria uma paleta inteira para uma hora do dia. O astro já diz
     de que lado está (nasce a leste, `itensDaFaixa`) */
  modoDaFase: { madrugada: "noite", amanhecer: "entardecer", manha: "dia", tarde: "dia", entardecer: "entardecer", noite: "noite" },

  /* §3 — medidas */
  medidas: {
    medalhao: 32, medalhaoTelefone: 28, alvo: 44,
    faixa: 96, faixaTelefone: 48,
    nevoa: { visitado: 0.15, concluido: 0.15, conhecido: 0.09, boato: 0.04, heroiNaEstrada: 0.08 },
    zoom: 1.5, zoomTelefone: 1.8,
    janela: 360, janelaTelefone: 140,
    /* o "longe" da faixa = ladoKm × isto (a régua FIXA, nunca o nó mais longe) */
    longe: 0.5,
    telefoneAte: 768,
  },

  /* `Mapa/Marcador de lugar` (`161:39`), numa caixa de 44: o boato é o
     disco menor e tracejado; o próximo leva o anel tracejado de fora */
  marcador: {
    caixa: 44,
    boato: { raio: 13.375, fio: 1.25, traco: "3 3", glifo: 16 },
    raio: 15.25, fio: 1.5, glifo: 18,
    anel: { raio: 20.25, fio: 1.5, traco: "4 3" },
    selo: { dx: 13, dy: 13, raio: 6.25, fio: 1.5, glifo: 10 },
  },
  /* `Mapa/Herói` (`161:94`): o losango numa caixa — Mesa 48 · Telefone 40 ·
     Faixa 32; `meio` é meia diagonal, `miolo` a do losango de dentro */
  heroiForma: {
    mesa: { caixa: 48, halo: 22, meio: 9.625, fio: 1.833, miolo: 3.667 },
    telefone: { caixa: 40, halo: 18, meio: 7.875, fio: 1.5, miolo: 3 },
    faixa: { caixa: 32, halo: 14, meio: 6.125, fio: 1.167, miolo: 2.333 },
    haloAlfa: 0.18,
    /* encostado ao canto do marcador (não o tapa): `167:299`, o losango a
       −18 do centro da Casa do Martelo */
    encosto: 18,
  },
  /* `Mapa/Perigo` (`161:78`): a contagem é o canal (baixo 1 apagada,
     médio 1, alto 2, mortal 3); a cor só de alto para cima */
  perigoForma: {
    caveiras: { baixo: 1, medio: 1, alto: 2, mortal: 3 },
    apagada: 0.6, aCor: ["alto", "mortal"],
    selo: { altura: 20, linha: 24, raio: 8, lado: 5, entre: 2, glifo: 12 },
    /* no mapa, selo na aresta só a partir de médio */
    noMapaDesde: "medio",
  },

  /* A FAIXA DO RUMO (mesa 1142×96 · telefone 343×48), `172:1467` */
  faixa: {
    rumos: { cima: 6, altura: 16, letra: 12, letraTelefone: 13 },
    /* `borda`: o nome do rumo encosta a 16 da borda em vez de sair dela — o
       mesmo 16 do lado da descida (`descida.ladoDireito`) */
    horizonte: { filas: [24, 39], rastreio: 0.14, opacidade: 0.9, cedeAoFeixe: 30, vao: 32, borda: 16 },
    /* o medalhão (o marcador inteiro, escalado) e o centro dele por
       profundidade — recta tirada dos sete nós da semente 0 (`172:1490`
       a `172:1534`: 8,0 km → 26,2; 16,5 km → 23,2) */
    lugar: { perto: 29, longe: 17.6, centroPerto: 78.6, centroLonge: 55.8, opacidadePerto: 0.82, opacidadeLonge: 0.5 },
    frente: { largura: 12, altura: 7 },
    feixe: { cima: -18, altura: 91, largura: 7, fio: 1, alfa: 0.6 },
    chaoAceso: { lado: 16, alfa: 0.35 },
    alvo: { dx: 16, nomeY: 56, horasY: 74, nome: 15, horas: 12 },
    ceu: { baixoY: 40, baixoAltura: 48, baixoAlfa: 0.75 },
    astro: { lado: 10, base: 45, arco: 28 },
    /* as duas cristas: o chão de cada rumo a ~24 km e a ~10 km */
    cristas: { longeKm: 24, pertoKm: 10, longe: { chao: 78, topo: 33 }, perto: { chao: 90, topo: 64 }, passo: 6 },
    /* o relevo de cada chão na crista (0–1) e o dente das copas */
    relevo: { gelo: 1, montanha: 0.9, colina: 0.45, floresta: 0.35, deserto: 0.25, planicie: 0.15, costa: 0.1, pantano: 0.1 },
    copas: ["floresta"], picos: ["gelo", "montanha"],
    estrada: { andada: 2, fio: 1 },
    estrelas: 40,
    /* lá dentro (`172:1695`): a descida */
    descida: { laFora: 18, estrato: 25, vao: 1, rotuloX: 16, linhaX: 200, linhaFim: 180, andada: 2, halo: 28, losango: 12, ladoDireito: 16, nomeY: 22, salasY: 42, alfaDoAtual: 0.88, alfaDoFundo: 0.76, astro: 7, maxEstratos: 4, linhaXTelefone: 120, linhaFimTelefone: 72 },
  },

  /* A TELA GRANDE (mesa 1600×1000), `167:299` */
  carta: {
    lado: 920, rebordo: 30, margem: 40,
    /* o piso da carta na tela grande (era o 320 escrito à mão no painel): a
       tela grande só existe de 768 para cima, e 40 + 320 + 40 + 320 + 40 =
       760 cabe — a carta e a coluna, cada uma no seu piso (MM11 · 10.ª, 800×451) */
    minimo: 320,
    rosa: { lado: 40, dentro: 16 },
    regua: { x: 20, y: 20, barra: 5, segmentos: 4 },
    feixe: { altura: 90, largura: 6, fio: 1.5 },
    estrada: { casca: 5, rota: 2, trilha: 1.5, traco: "7 5", aPe: 1.5, pontos: "0.1 5", boato: 0.45, curva: 0.08 },
    rotulo: { base: 19, povoado: 16, lugar: 16, boato: 15, horizonte: 12, halo: 3, vao: 4, horasY: 14 },
    /* a largura média de um caractere, em em — para colocar sem medir */
    letraMedia: { display: 0.46, mono: 0.6 },
    nevoaAlfa: 0.8,
    fundo: { celulas: 36, arvores: 3, picos: 2, ruido: 0.06 },
  },
  coluna: {
    largura: 560, vao: 40, titulo: 38, relogio: 15,
    /* a coluna cede ANTES da carta, de 560 até aqui (o cartão do lugar tem 28
       de enchimento: 264 de texto, o verbo com o preço numa linha) */
    minimo: 320,
    onde: { altura: 58, raio: 12, lado: 14, entre: 12 },
    cartao: { raio: 16, enchimento: 28, entre: 18, medalhao: 56, glifo: 28, fio: 1.5, titulo: 30, tituloAltura: 1.05, sub: 14, selo: 26, seloRaio: 12, seloLado: 10, rotulo: 12, rastreio: 0.12, quem: 16, preco: 14, perto: 15, dizem: 19, entreLinhas: 6 },
    /* a legenda (`165:58`): linhas de 32 com 6 entre elas; em cima 6, porque
       o LEGENDA é o botão que a recolhe e o alvo dele (44) come o enchimento */
    legenda: { raio: 12, enchimento: 20, cima: 6, entre: 10, celula: 44, linha: 32, entreLinhas: 6, colunas: 2, vao: 12, texto: 13, abertaDesde: 900 },
    fechar: { lado: 44, glifo: 18 },
  },
  telefone: { barra: 56, pega: 40 },
};

/* ============================================================
   TE · OS ESPÓLIOS NA TELA (09/11/2026) — formas.md §TE; Figma 334:2.
   A carta que vira, o achado que pousa, a arma que acorda. A ordem das
   peças é de revelacaoDoEspolio (espolios.js): a tela nunca a refaz. A
   conta da linha do tempo (o teto, a antecipação, a relíquia) é pura e
   mora em espolio-na-tela.js; quem desenha é painel-espolio.jsx.
   Nenhuma cor nova: tudo nomeia T, COR_DA_RARIDADE, ENCAIXE e a moldura.
   ============================================================ */
export const REVELACAO_DO_ESPOLIO = {
  veu: CERIMONIA_DO_NIVEL.veu,                             /* o mesmo da subida, de propósito */
  rotulo: { de: 120, dura: 320, sobe: 8, coracao: 640 },   /* coracao: o tipo 2 entra devagar */
  xp: { de: 360, dura: 700 },
  moedas: { de: 560, dura: 500 },
  favor: { de: 1060, dura: 200 },
  chegam: { de: 1200, dura: 220, entre: 90, sobe: 16, curva: MOVIMENTO_DO_DADO.curva },
  vira: { meia: 160, abre: 160, assenta: 240, entre: 120 },
  antecipacao: { dura: 360, graus: 2, vezes: 2, vaza: { de: 0.55, ate: 0.85 }, desde: "raro" },  /* só a última */
  veredito: { dura: 220, troca: 120 },
  teto: 4000,                                              /* com mais cartas, vira.entre encolhe */
  reduzido: CERIMONIA_DO_NIVEL.reduzido,
};
/* a luz ao assentar, por raridade (alfa do halo; brilho = passa uma vez) */
export const LUZ_DA_RARIDADE = {
  comum: null, incomum: null,
  raro: { brilho: 400 }, epico: { halo: 0.3 },
  lendario: { halo: ENCAIXE.brilho.fixo, lume: ENCAIXE.brilho },
  unico: "reliquia",
};
/* a carta (334:325): 120 × 168 de base. As coordenadas de dentro são as do
   componente, em unidades da carta de 120: a luz (88 × 72 em 14,10), o
   ícone em 26,14, o nome em 88 (largura 104), o fio do despertar em 122,
   a placa em 140; o selo «melhor» em 50,4. */
export const CARTA_DO_ESPOLIO = {
  lado: 120, alto: 168, raio: 10, icone: 64, placa: 26, nome: { tamanho: 12, entrelinha: 15 }, rotulo: 11,
  escala: { telefone: 0.8, mesa: 1.27, despertar: 1.6, reliquia: 1.4 },
  entre: { telefone: 16, mesa: 20 },
  costas: { chao: T.couro, filete: 8, selo: 40, estrela: 20,
            vaza: { raio: 12, raioForte: 16, alfa: 0.4, alfaForte: 0.55, desde: "raro", forteDesde: "lendario" } },
  escolhida: { anel: 3, cor: T.amber },
  marcas: ENCAIXE.marcas,
  dentro: {
    borda: 2, luz: { x: 14, y: 10, largura: 88, alto: 72 }, icone: { x: 26, y: 14 },
    nome: { y: 88, largura: 104 }, fio: { y: 122 }, placa: { y: 140, espaco: 0.14 },
    melhor: { x: 50, y: 4, tamanho: 10, raio: 8 }, selo: { traco: 2 },
  },
};
/* o veredito (335:119): o botão é o da gaveta */
export const VEREDITO_DO_ESPOLIO = {
  largura: { telefone: 343, mesa: 360 }, enchimento: 16, vao: 10, raio: 12,
  nome: 20, meta: 13, historia: 14, linha: 13, sai: 12, botao: ALVOS.piso,
  coluna: 880, mesaDesde: 1024,   /* a mesa (337:233), de 1024 para cima: as cartas à esquerda e o veredito à direita, numa coluna de 880 ao centro */
};
/* o fio do despertar (334:24): três casas de 14, 6 entre elas; a runa é um
   losango de 8; a estrela do gesto ocupa a casa inteira */
export const FIO_DO_DESPERTAR = { casa: 14, entre: 6, runa: 8, traco: 1, acesa: MOLDURA_POR_DEGRAU.ouro.meio, furo: PECAS_DA_MOLDURA.engaste, aro: T.lineStrong };
/* a faixa do ganho (335:145) e a do fecho pequeno (337:531) */
export const FAIXA_DO_GANHO = { barra: 8, raio: 4, alfaDoQueHavia: 0.55, moeda: 14, largura: { telefone: 343, mesa: 560 } };
export const FAIXA_DO_FECHO = { alto: 32, raio: 16, barra: { largura: 40, alto: 6 }, entra: FIM_DA_LUTA.entra };
/* o achado no caminho (335:166): o primeiro chip do recibo */
export const CHIP_DO_ACHADO = { alto: 32, alvo: ALVOS.piso, raio: 16, glifo: 20, fioDaPeca: 1.5, pousa: { cai: 8, dura: 180, brilho: 400 } };
/* o despertar (337:368): irmã de CERIMONIA_DO_NIVEL */
export const DESPERTAR_DA_TELA = {
  veu: CERIMONIA_DO_NIVEL.veu,
  carta: { de: 120, dura: 320, escalaDe: 0.9 },
  luz: { de: 240, dura: 640 },
  anel: { de: 600, dura: 800, de0: 0.7, ate: 1.15, alfa: 0.5 },
  runa: { de: 900, dura: 520, faiscas: 10 },
  nome: { de: 1300, dura: 420, escalaDe: 0.82, tamanho: 26 },   /* Cinzel Bold 26, na cor da raridade */
  ganhos: CERIMONIA_DO_NIVEL.ganhos,
  total: 2100,
  reduzido: CERIMONIA_DO_NIVEL.reduzido,
};
/* a relíquia (337:410): por cima da cerimónia, quando chega a vez dela */
export const RELIQUIA_DA_TELA = {
  veu: VEU.semRetorno, outras: 0.4, apaga: 400,
  lume: { cor: COR_DA_RARIDADE.unico.cor, alfa: 0.1, dura: 600 },
  sobe: { dura: 500, curva: MOVIMENTO_DO_DADO.curva },
  antecipacao: { dura: 600, vaza: { de: 0.55, ate: 0.9 } },
  vira: { meia: 200, abre: 200 },
  anel: { dura: 700, de0: 0.6, alfa: { de: 0.45, ate: 0.2 } },
  estrela: 300, frase: { de: 200, dura: 280 },
};
/* uma cerimónia de cada vez; nunca com a luta aberta */
export const FILA_DAS_CERIMONIAS = { ordem: ["espolio", "nivel", "despertar"], entre: 240, esperaALuta: true };
/* o que a tela diz; {n} e {nome} vêm do sistema. As chaves de baixo do
   «achaste» são as frases da §TE 6 (o leitor de ecrã) e das linhas do
   veredito e do despertar no Figma (335:119, 337:368), escritas aqui para
   a tela não ter frase solta: a raridade em palavra (o único é «relíquia»,
   como a placa da carta diz), o estado do artefacto concordado com o
   encaixe, e as palavras do resumo que a região viva lê uma vez. */
export const PALAVRAS_DO_ESPOLIO = {
  concluida: "CONCLUÍDA", coracao: "O QUE FICA", desperta: "DESPERTA", exalta: "EXALTA",
  saltar: "Toque para saltar", continuar: "Continuar", equipar: "Equipar já", guardar: "Guardar na mochila",
  naMochila: "Já está na mochila.", sai: "Sai {nome} — vai para a mochila.",
  dorme: "O poder dorme: pede sintonia, e as tuas três já estão em uso. Serve de peça desde já.",
  acorda: "acorda na próxima prova à altura, ou no nível {n}", exaltaQuando: "exalta-se no confronto, ou no nível {n}",
  porAcordar: "o segundo poder, quando acordar", gesto: "o gesto, quando se exaltar",
  reliquia: "Há {n} no mundo. Esta é tua.", achaste: "Achaste",
  acordaSo: "acorda na próxima prova à altura", exaltaSo: "exalta-se no confronto",
  favor: "{nome} fica a dever-te", experiencia: "EXPERIÊNCIA", nivel: "Nível {n}", moedas: "{n} moedas",
  temNome: "tem nome", lembranca: "lembrança", consumivel: "Consumível", metaReliquia: "há {n} no mundo, e esta é tua",
  porDia: "uma vez por dia", aindaDorme: "Ainda dorme: {nome} — {quando}", continuarToque: "Toque para continuar",
  feita: "✓", examinar: "Examinar", pecas: "As peças", melhor: "melhor",
  raridade: { comum: "comum", incomum: "incomum", raro: "raro", epico: "épico", lendario: "lendário", unico: "relíquia" },
  feminino: ["arma", "armadura", "botas"],
  estado: {
    adormecido: { f: "Adormecida", m: "Adormecido" },
    desperto: { f: "Desperta", m: "Desperto" },
    exaltado: { f: "Exaltada", m: "Exaltado" },
  },
  leitor: {
    ganhaste: "Ganhaste", experiencia: "{n} de experiência", moedas: "{n} moedas", e: " e ",
    peca: "{q} peça", pecas: "{q} peças", quantas: ["", "Uma", "Duas", "Três", "Quatro", "Cinco", "Seis"],
    melhor: "melhor que o teu", sobe: "sobe", desce: "desce", mais: "mais", menos: "menos",
    desperta: "{nome} desperta.", exalta: "{nome} exalta-se.", ganha: "Ganha {nome}: {diz}.",
  },
};

/* ============================================================
   TE · DUAS DAS TRÊS DECISÕES DA PESSOA (09/11/2026) — formas.md §TE 13.
   (A terceira, o som, mora em som-da-mesa.js: é número de áudio, não de cor.)

   A CARTA NO DIÁRIO — «só metade»: em cada quest aberta, a carta da
   recompensa DE COSTAS, com a luz da raridade que ela pode pagar (o
   degrau vem do sistema, raridadeQuePodePagar). É a mesma CartaDoEspolio
   da cerimónia, a meio tamanho: no Diário a carta é sinal, não cerimónia.
   NUNCA os caminhos nem a peça de cada um — o jogador escolhe pela
   história e descobre o prémio no fim. A frase diz o mesmo que a luz,
   por escrito (a raridade nunca é só cor, WCAG 1.4.1), e diz «pode
   valer» porque fechar mal paga menos: a carta promete o teto, não o fim.
   ============================================================ */
export const CARTA_NO_DIARIO = {
  escala: { telefone: 0.5, mesa: 0.6 },   /* 60 × 84 e 72 × 101 */
  vao: 12,                                 /* entre a carta e a frase */
  rotulo: "A recompensa",
  diz: "Pode valer uma peça {r} — descobres qual no fim.",
  rara: { comum: "comum", incomum: "incomum", raro: "rara", epico: "épica", lendario: "lendária", unico: "única" },
};
/* A LENDA DO ARTEFACTO — as linhas que o sistema grava no item (item.lenda,
   dos factos que regista: nunca do Narrador), até cinco. Cada uma leva a
   runa ACESA do fio do despertar (o mesmo losango, o mesmo ouro): um feito
   é uma marca gravada. À esquerda, o filete do aro. Mora no veredito do
   espólio, no despertar e na gaveta do encaixe. */
export const LENDA_DO_ARTEFACTO = {
  teto: 5, texto: VEREDITO_DO_ESPOLIO.meta, entre: 6, recuo: 10, filete: 1,
  runa: FIO_DO_DESPERTAR.runa, acesa: FIO_DO_DESPERTAR.acesa, aro: FIO_DO_DESPERTAR.aro,
  rotulo: "A lenda", rotuloTamanho: CARTA_DO_ESPOLIO.rotulo, espaco: CARTA_DO_ESPOLIO.dentro.placa.espaco,
  emUso: "em uso",   /* na gaveta, a peça que está no corpo e tem lenda */
};

/* ============================================================
   CB · A BATALHA (09/11/2026) — formas.md §CB 11; Figma 341:2.
   O encontro, a previsão, a intenção, o golpe e o fecho. As tabelas leem
   T, ALVOS e MESA_DE_BATALHA e não copiam número deles. A conta da tela
   (o estado da pílula, o número do golpe, a câmara do telefone, a geometria
   das três colunas) é pura e mora em batalha-na-tela.js; quem desenha é
   grade-de-batalha.jsx, painel-batalha.jsx, painel-encontro.jsx e ui.jsx.
   Nenhuma cor nova: tudo nomeia T.
   ============================================================ */
export const BATALHA_EM_TRES = {          // §CB 2
  margem: 24, fila: 84, fala: 28, barra: 112, entre: 24, calha: 22,
  coluna: 470, colunaMinima: 320,
  duasColunasAbaixoDe: 1280,              // abaixo, «Eles» vira gaveta
  telefoneAbaixoDe: 768,
  /* a margem de baixo (16) e as casas do tabuleiro de referência (14×14),
     com que a conta das colunas cede para o campo ficar quadrado */
  margemDeBaixo: 16, casasDeReferencia: 14,
  casaMinima: MESA_DE_BATALHA.casaMinimaNoMonitor, casaMaxima: MESA_DE_BATALHA.casaMaximaNoMonitor,
  telefone: { casa: 40, janela: [9, 11], casaMinima: 32, casaMaxima: 64, margem: 7, fila: 52, fala: 22, tira: 40, verbo: 48, compositor: 44, folgaDaCamara: 1 },
};
export const PREVISAO_DO_GOLPE = {         // §CB 3
  alto: 32, raio: 16, enchimento: { x: 10, y: 6 }, entre: 8, abaixoDaFicha: 8, aro: 1.5,
  letra: { chance: 18, dano: 15, etiqueta: 12, porExtenso: 16, legenda: 11 },   /* legenda: a exceção escrita (§CB 11), os números das faces e o «d20 +N», que repetem o número grande */
  abateCerto: 0.995, abatePossivel: 0.05,
  anelDoAlvo: { traco: 2, tracejado: [6, 4] },
  faces: { lado: [18, 20], entre: 2, raio: 3, acesa: 0.85 },
  folha: { raio: 16, pega: [36, 4], numero: 30 },
};
export const CAMINHO_NO_CHAO = {           // §CB 3
  traco: 3, ponto: 10, rotulo: 12,
  golpeLivre: { chao: 0.12, aro: 1.5, tracejado: [4, 3] },
  destino: { lado: 41, raio: 6, aro: 2, tracejado: [5, 3], chao: 0.12 },
};
/* §CB 4 — as chaves são INTENCAO_DO_INIMIGO.tipos (intencao.js; a suíte
   confere). Os passos e a caveira já tinham glifo antes de CB: «passo» e
   «perigo» (glifos.js) — uma ação, uma forma; a página CB redesenhou-os, e
   o redesenho não entra como segunda cara do mesmo sentido. */
export const INTENCAO_NA_MESA = {
  alto: 24, raio: 12, enchimento: { x: 8, y: 4 }, entre: 6, rosto: 18, aro: 1.5, aroLetal: 2,
  abateQueSeAnuncia: 0.25,
  cor: { atacar: T.danger, sopro: T.danger, aproximar: T.inkMeio, fugir: T.inkDim },
  glifo: { atacar: "espadas", sopro: "chama", aproximar: "passo", fugir: "fuga" },
  caveira: "perigo",
  area: { chao: 0.22, aro: 1.5, tracejado: [4, 3] },
  seta: { traco: 2, tracejado: [5, 4] },
  discoNaFila: 18,
};
export const GOLPE_SENTIDO = {             // §CB 5 — ms; a suíte soma pausa + tremor.ms + assenta ≤ teto
  teto: 400,
  acerto:  { pausa: 70,  tremor: { px: 3, ms: 120, vaivens: 3 }, assenta: 190 },
  critico: { pausa: 110, tremor: { px: 6, ms: 140, vaivens: 4 }, assenta: 150, mesa: { px: 2, ms: 140 } },
  abate:   { pausa: 90,  tremor: { px: 3, ms: 120, vaivens: 3 }, assenta: 180, afunda: { escala: 0.9, alfa: 0.45 } },
  erro:    { pausa: 0,   tremor: { px: 4, ms: 160, vaivens: 1 }, assenta: 0 },
  piscar: { alfa: 0.35, quadros: 1 },
  salto: { de: 0.6, pico: 1.25, sobe: 12 },
  leitura: 900, esvai: 200,
  numero: { dano: 32, critico: 44, cura: 30, emTi: 34, erro: 22, contorno: 3 },
  emTi: { alfa: 0.35, ms: 160, peso: 0.25, borda: 6 },
  reduzido: { esvai: 120 },                // sem pausa, tremor, escala, mesa nem borda
  /* §CB 15 (decisão do coordenador): o d20 do ataque rola na bandeja com as
     faces que acertam acesas; o relógio é de JavaScript (o número troca até
     pousar), a volta do corpo é a de sempre (tvDadoRola), e um toque salta */
  dadoNaBandeja: 600,
};
export const FECHO_DA_QUEDA = { chip: 4000, alto: 28, raio: 14, veuDoUltimo: 0.45 };   // §CB 6
export const CARTAO_DO_ENCONTRO = {        // §CB 7
  folha: { largura: 363, raio: 16 }, cartao: { largura: 1000, enchimento: 28, entre: 28, carta: [300, 380] },
  rosto: 84, faixa: { raio: 8, enchimento: [14, 9] },
  linha: { largura: 440, raio: 10, enchimento: { x: 14, y: 12 }, glifo: 22, verbo: 21, chance: 26, aroEscolhida: 3, aroImpedida: 1.5, aroFuga: 2, tracejado: [5, 4] },
  entrada: { total: 1200, veu: [0, 300], veuAlfa: 0.7, cresce: [300, 800], escala: 1.6, mesa: [800, 1200], passoDasFichas: 40 },
};
export const FILA_DA_VEZ = {               // §CB 8
  vez: 56, espera: 40, aroVez: 3, aro: 2, agiu: 0.45, caido: 0.3, entre: 6,
  marcaDaRodada: { fio: [2, 36], alfa: 0.6 }, telefone: { vez: 44, espera: 34 },
};
export const ECONOMIA_DA_VEZ = { lado: 24, acao: 16, bonus: [18, 16], reacao: 12, emJogo: 0.35, tracejado: [3, 2], noVerbo: 0.75, movimento: { largura: 64, alto: 6 } };   // §CB 8

/* ============================================================
   AS FONTES — e o `@import` que tem de vir primeiro.

   O `@import` é a PRIMEIRÍSSIMA coisa da string, e por isso `FONT_CSS`
   é a primeira parcela de `FOLHA`. Um `@import` que não está no topo da
   folha concatenada é descartado pelo navegador EM SILÊNCIO: nenhum
   erro, nenhum aviso, e as três fontes do jogo simplesmente não chegam.
   ============================================================ */
export const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Spectral:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@400;600&family=Cinzel:wght@700&display=swap');
.tv-display { font-family: 'Cormorant Garamond', Georgia, serif; }
.tv-body { font-family: 'Spectral', Georgia, serif; }
.tv-mono { font-family: 'JetBrains Mono', monospace; }
.tv-titulo { font-family: 'Cinzel', 'Cormorant Garamond', Georgia, serif; font-weight: 700; letter-spacing: .02em; }
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
/* V4: a agonia deixou de pulsar sem fim. Pulsa TRES vezes ao entrar em grave
   (e a cada ferida nova enquanto grave) e para: o que fica e o arco curto, o
   vermelho e o rosto grave. Um pulso que dura dez turnos cansa, e o que
   cansa e defeito. A cor vem de T.danger pela tabela — era um vermelho
   antigo escrito a mao. */
@keyframes tvAgonia { 0%, 100% { box-shadow: 0 0 0 0 ${alfa(T.danger, 0)}; } 50% { box-shadow: 0 0 10px 2px ${alfa(T.danger, 0.6)}; } }
.tv-agonia { animation: tvAgonia ${MUDOU_AGORA.pulso}ms ease-in-out ${MUDOU_AGORA.vezes}; }
/* V4 · o anel: o arco CRESCE na cura (ferir nao o anima — o pedaco perdido
   e que conta), e o pedaco perdido acende e apaga-se sozinho. */
.tv-anel-cresce { transition: stroke-dashoffset ${ANEL.cura}ms ease-out; }
/* o clarao da ferida, so no anel: o mesmo passo do golpe (tvDano), numa
   classe propria para ter saida no reduced-motion sem mexer no clarao que
   a tela de combate usa. */
.tv-anel-clarao { animation: tvDano ${ANEL.perdido}ms ease both; }
@keyframes tvAnelPerdido { 0%, ${Math.round(100 * ANEL.aceso / ANEL.perdido)}% { opacity: 1; } 100% { opacity: 0; } }
.tv-anel-perdido { animation: tvAnelPerdido ${ANEL.perdido}ms linear both; }
/* V4 · a palavra do prazo encurta no telefone mais estreito, e so ali. */
.tv-prazo-curto { display: none; }
@media (max-width: ${CINTA.palavraCurtaAbaixoDe - 1}px) {
  .tv-prazo-longo { display: none; }
  .tv-prazo-curto { display: inline; }
}

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

/* ---------------- A MARCA DA CHAPA QUE ACENDE (R13) ----------------
   (Sem crase neste comentario, como os vizinhos: ele mora DENTRO da
   template literal e uma crase aqui fecha a string e derruba o build.)

   O SINAL DE GUARDADO custa ZERO px permanentes e ainda assim se ve. O
   fio de 1 px do pe da cinta passa a T.ok e VARRE uma vez, da esquerda
   para a direita — e e a propria borda do que guarda o estado do
   jogador a dizer que o guardou. Nem desloca leiaute nem tapa tinta:
   scaleX sobre uma barra que ja esta la.

   OS 600 MS SAO DE formas.md, e coincidem com bonusToque do relogio da
   reacao — coincidencia, nunca copia: esta varredura existe desde antes
   de haver janela de reacao no pe da cinta e nao desenha nada que o
   trilho meca. A coincidencia fica ESCRITA em check-formas.mjs
   (COLISAO_DE_RELOGIO_ESCRITA), como a de .tv-dice, em vez de calada
   por um regex mais frouxo.

   O 70% NAO E ESTETICA: a varredura chega ao fim do fio em 420 ms e so
   depois se apaga. Se o apagar comecasse junto com o andar, o fio nunca
   chegaria a estar inteiro, e o que se leria era um risco a passar, nao
   uma borda a acender. */
@keyframes tvGuardadoVarre {
  0%   { transform: scaleX(0); opacity: 1; }
  70%  { transform: scaleX(1); opacity: 1; }
  100% { transform: scaleX(1); opacity: 0; }
}
.tv-guardado-varre { animation: tvGuardadoVarre 600ms ease-out both; transform-origin: left center; }

/* ---------------- O ALFORJE, O VÉU E A MARCA (R21) ----------------
   (Sem crase neste comentário, como os vizinhos: ele mora DENTRO da
   template literal, e uma crase aqui fecha a string e derruba o build.)

   DOIS PARES DE ENTRA/SAI E UM PULSO. Os tempos vêm de VEU (180/120 —
   os mesmos de "abrir e fechar um painel", nunca duplicados aqui). A
   DIREÇÃO é a que formas.md escreve: o alforje SOBE a desacelerar
   (ease-out) e DESCE a acelerar (ease-in) — a chegada é a resposta ao
   toque, a saída é rápida porque já disse o que tinha a dizer. O véu é
   sempre um fade nas duas direções: não há geometria para desacelerar
   num plano só de opacidade.

   NENHUMA COR NOVA: o pulso de .tv-mudou-agora usa T.amber SÓLIDO — o
   halo nasce do desfoque do próprio box-shadow (blur+spread), não de um
   alfa sobre a cor. Um alfa aqui esperaria o mesmo helper que o
   parágrafo da caixa "O MOVIMENTO" (logo acima, na abertura do arquivo)
   já recusa inventar duas vezes.

   ---------------- A CORREÇÃO DO oficial (24/09) ----------------
   .tv-alforje-sobe/-desce só valem NA ESTREITA: SOBE/DESCE é o gesto do
   ALFORJE, que só existe abaixo de 767px. Na larga o painel continua o
   que já era — o aside de hoje entra a deslizar da direita (o mesmo
   .tv-slide que a casa inteira usa, tvSlide aqui embaixo) e sai sem
   animação nenhuma (if (!aba) return null nunca animou a saída). É a
   MESMA classe aplicada nos dois lados em painel-alforje.jsx — o que
   muda é só o que ela FAZ, por media query, nunca por JavaScript. */
@keyframes tvAlforjeSobe { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes tvAlforjeDesce { from { transform: translateY(0); } to { transform: translateY(100%); } }
@media (max-width: 767px) {
  .tv-alforje-sobe { animation: tvAlforjeSobe ${VEU.entra}ms ease-out both; }
  .tv-alforje-desce { animation: tvAlforjeDesce ${VEU.sai}ms ease-in both; }
}
@media (min-width: 768px) {
  .tv-alforje-sobe { animation: tvSlide .25s ease both; }
  .tv-alforje-desce { animation: none; }
}

@keyframes tvVeuEntra { from { opacity: 0; } to { opacity: 1; } }
.tv-veu-entra { animation: tvVeuEntra ${VEU.entra}ms ease both; }
@keyframes tvVeuSai { from { opacity: 1; } to { opacity: 0; } }
.tv-veu-sai { animation: tvVeuSai ${VEU.sai}ms ease both; }

@keyframes tvMudouAgora {
  0%, 100% { box-shadow: 0 0 0 0 ${T.amber}; }
  50%      { box-shadow: 0 0 10px 2px ${T.amber}; }
}
.tv-mudou-agora { animation: tvMudouAgora ${MUDOU_AGORA.pulso}ms ease-in-out ${MUDOU_AGORA.vezes}; }

/* A1 · O FIM DA LUTA ENTRA (formas.md, A1 peca 3): o desfecho e cada chip
   do recibo sobem 4 px e acendem em 240 ms; o atraso de cada chip e do
   painel-batalha (animationDelay, FIM_DA_LUTA.passo). O botao de sair NAO
   leva esta classe: esta la antes de qualquer animacao comecar. A saida
   esta no @media de baixo, escrita a nascenca. */
@keyframes tvFimEntra { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.tv-fim-entra { animation: tvFimEntra ${FIM_DA_LUTA.entra}ms ease both; }

/* F1 · A FOGUEIRA (formas.md, Fogueira 5). A noite entra num fade de 240;
   cada lugar entra 60 depois do anterior (o atraso e do painel, pela
   variavel --tv-ordem, com teto de 300); a chama respira pela base; as
   faiscas sobem com a curva de tvFlutua, em laco; o retrato de quem fala
   cresce em 200. Nada segura um clique, e a saida esta no media de baixo,
   escrita a nascenca: tudo pronto, chama parada. */
@keyframes tvFogueiraEntra { from { opacity: 0; } to { opacity: 1; } }
.tv-fogueira-entra { animation: tvFogueiraEntra ${FOGUEIRA.movimento.entra}ms ease both; }
.tv-fogueira-lugar { animation: tvFogueiraEntra ${FOGUEIRA.movimento.entra}ms ease both; animation-delay: calc(min(var(--tv-ordem, 0) * ${FOGUEIRA.movimento.passo}ms, ${FOGUEIRA.movimento.tetoDoPasso}ms)); }
@keyframes tvFogueiraRespira { 0%, 100% { transform: scale(${FOGUEIRA.movimento.respiraMin}); } 50% { transform: scale(${FOGUEIRA.movimento.respiraMax}); } }
.tv-fogueira-chama { transform-box: fill-box; transform-origin: 50% 100%; animation: tvFogueiraRespira ${FOGUEIRA.movimento.respira}ms ease-in-out infinite; }
.tv-fogueira-faisca { transform-box: fill-box; animation: tvFlutua ${FOGUEIRA.movimento.faisca}ms ease-out infinite; animation-delay: calc(var(--tv-ordem, 0) * ${FOGUEIRA.movimento.faisca / 3}ms); }
@keyframes tvFogueiraVira { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: none; } }
.tv-fogueira-vira { animation: tvFogueiraVira ${FOGUEIRA.movimento.vira}ms ease-out both; }

/* F2b · AS FICHAS (formas.md, Fichas 7). Cada ficha entra num fade de 160,
   40 depois da anterior (o atraso e do painel, pela variavel --tv-ordem; o
   teto faz a fileira inteira caber em 280); a fileira que sai apaga em 120
   antes de a seguinte entrar; o cartao entra em 160 subindo 4 px. Nada
   segura um clique, e a saida esta no media de baixo, escrita a nascenca:
   tudo pronto, nada sobe. */
@keyframes tvFichaEntra { from { opacity: 0; } to { opacity: 1; } }
.tv-ficha-entra { animation: tvFichaEntra ${FICHAS.movimento.entra}ms ease both; animation-delay: calc(min(var(--tv-ordem, 0) * ${FICHAS.movimento.escalonado}ms, ${FICHAS.movimento.tetoDoEscalonado - FICHAS.movimento.entra}ms)); }
@keyframes tvFichaSai { from { opacity: 1; } to { opacity: 0; } }
.tv-ficha-sai { animation: tvFichaSai ${FICHAS.movimento.sai}ms ease both; }
@keyframes tvCartaoEntra { from { opacity: 0; transform: translateY(${FICHAS.movimento.subida}px); } to { opacity: 1; transform: none; } }
.tv-cartao-entra { animation: tvCartaoEntra ${FICHAS.movimento.cartao}ms ease-out both; }

/* A ORDEM É A REGRA (2/2): este @media tem de vir DEPOIS das tres
   classes acima. Uma media query nao soma especificidade nenhuma — ela
   so envolve. Quem decide o empate e a ordem, e so por estar embaixo
   este bloco consegue desligar a animacao de quem pediu menos
   movimento. Subir esta caixa nao da erro: da um acessivel que nao
   funciona, calado. */
/* ---------------- A BANDEJA (Mesa C · 04/11) ----------------
   O dado que rola entra da esquerda a dar voltas e cai com o ressalto do
   pouso; o que pousa dá um ressalto curto; o veredito (o anel, o selo, a
   palavra) aparece por cima. Os tempos e a curva são de MOVIMENTO_DO_DADO,
   postos aqui e pela peça — esta caixa só tem a forma do movimento. */
@keyframes tvDadoRola { from { transform: translateX(-24px) rotate(-200deg); } to { transform: none; } }
@keyframes tvDadoPousa { from { transform: scale(1.06); } to { transform: none; } }
@keyframes tvDadoVeredito { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: none; } }
.tv-dado-rola { animation: tvDadoRola ${MOVIMENTO_DO_DADO.rolar}ms ${MOVIMENTO_DO_DADO.curva} both; transform-origin: 50% 50%; }
.tv-dado-pousa { animation: tvDadoPousa ${MOVIMENTO_DO_DADO.pousar}ms ease-out both; transform-origin: 50% 50%; }
.tv-dado-veredito { animation: tvDadoVeredito ${MOVIMENTO_DO_DADO.veredito}ms ease-out both; transform-origin: 50% 50%; }
.tv-bandeja { min-height: ${BANDEJA.altura.telefone}px; }
@media (min-width: 768px) { .tv-bandeja { min-height: ${BANDEJA.altura.mesa}px; } }
/* ---------------- A MOLDURA VIVA (AAA · 05/11) ----------------
   O lume do ouro corre o aro devagar; a gema que acende cresce acima do
   tamanho e assenta. Os tempos são de ESTADOS_DA_MOLDURA. O lume roda à
   volta da própria caixa, que é a do aro (fill-box). */
@keyframes tvMolduraLume { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes tvMolduraGema { 0% { transform: scale(${ESTADOS_DA_MOLDURA.gemaDe}); opacity: 0; } 60% { transform: scale(${ESTADOS_DA_MOLDURA.gemaPico}); opacity: 1; } 100% { transform: none; opacity: 1; } }
.tv-moldura-lume { transform-box: fill-box; transform-origin: center; animation: tvMolduraLume ${ESTADOS_DA_MOLDURA.lume}ms linear infinite; }
.tv-moldura-gema { transform-box: fill-box; transform-origin: center; animation: tvMolduraGema ${ESTADOS_DA_MOLDURA.gema}ms ease-out both; }
/* ---------------- A CERIMÓNIA, O ENCAIXE, A GAVETA E O DISCO (AAA · 05/11) ----------------
   A cerimónia é uma linha do tempo de CSS: cada quadro tem a sua duração
   aqui e o seu atraso posto pela peça (animation-delay), os dois lidos de
   CERIMONIA_DO_NIVEL. Nenhum relógio de JavaScript: o fim da entrada da
   escolha é o que a peça escuta (animationend). O brilho do lendário e do
   único respira entre os dois alfas de ENCAIXE.brilho. */
@keyframes tvCerimoniaVeu { from { opacity: 0; } to { opacity: 1; } }
@keyframes tvCerimoniaLuz { from { opacity: 0; transform: translateY(40%); } to { opacity: 1; transform: none; } }
@keyframes tvCerimoniaForja { from { opacity: 0; transform: scale(${CERIMONIA_DA_TELA.forjaDe}); clip-path: circle(0% at 50% 50%); } to { opacity: 1; transform: none; clip-path: circle(75% at 50% 50%); } }
@keyframes tvCerimoniaFaisca { 0% { opacity: 0; transform: rotate(var(--a)) translateY(0) scale(1); } 25% { opacity: 1; } 100% { opacity: 0; transform: rotate(var(--a)) translateY(calc(-1 * var(--d))) scale(.4); } }
@keyframes tvCerimoniaPulso { 0%, 100% { transform: none; } 50% { transform: scale(${CERIMONIA_DA_TELA.pulso}); } }
@keyframes tvCerimoniaNumero { from { opacity: 0; transform: scale(${CERIMONIA_DO_NIVEL.numero.escalaDe}); } to { opacity: 1; transform: none; } }
@keyframes tvCerimoniaSobe { from { opacity: 0; transform: translateY(${CERIMONIA_DA_TELA.subida}px); } to { opacity: 1; transform: none; } }
@keyframes tvCerimoniaEsvai { from { opacity: 0; } to { opacity: 1; } }
@keyframes tvEncaixeBrilho { from { opacity: ${ENCAIXE.brilho.de}; } to { opacity: ${ENCAIXE.brilho.ate}; } }
@keyframes tvGavetaSobe { from { transform: translateY(100%); } to { transform: none; } }
@keyframes tvGavetaAbre { from { opacity: 0; transform: scale(${ENCAIXE.pressionado.escala}); } to { opacity: 1; transform: none; } }
.tv-cerimonia-veu { animation: tvCerimoniaVeu ${CERIMONIA_DO_NIVEL.veu.dura}ms ease-out both; }
.tv-cerimonia-luz { animation: tvCerimoniaLuz ${CERIMONIA_DO_NIVEL.luz.dura}ms ease-out both; }
.tv-cerimonia-forja { animation: tvCerimoniaForja ${CERIMONIA_DO_NIVEL.forja.dura}ms ease-out both; }
.tv-cerimonia-faisca { animation: tvCerimoniaFaisca ${CERIMONIA_DO_NIVEL.forja.dura}ms ease-out both; }
.tv-cerimonia-pulso { animation: tvCerimoniaPulso ${CERIMONIA_DO_NIVEL.pulso.dura}ms ease-in-out both; }
.tv-cerimonia-numero { animation: tvCerimoniaNumero ${CERIMONIA_DO_NIVEL.numero.dura}ms cubic-bezier(.22,1.2,.36,1) both; }
.tv-cerimonia-ganho { animation: tvCerimoniaSobe ${CERIMONIA_DO_NIVEL.ganhos.dura}ms ease-out both; }
.tv-cerimonia-gema { transform-box: fill-box; transform-origin: center; animation: tvMolduraGema ${CERIMONIA_DO_NIVEL.gema.dura}ms ease-out both; }
.tv-cerimonia-escolha { animation: tvCerimoniaSobe ${CERIMONIA_DO_NIVEL.escolha.dura}ms ease-out both; }
.tv-cerimonia-esvai { animation: tvCerimoniaEsvai ${CERIMONIA_DO_NIVEL.reduzido.dura}ms ease-out both; }
.tv-encaixe-brilho { animation: tvEncaixeBrilho ${ENCAIXE.brilho.dura}ms ease-in-out infinite alternate; }
.tv-gaveta-sobe { animation: tvGavetaSobe ${GAVETA_DO_ENCAIXE.sobe}ms cubic-bezier(.2,.8,.2,1) both; }
.tv-gaveta-abre { transform-origin: top center; animation: tvGavetaAbre ${GAVETA_DO_ENCAIXE.popover}ms ease-out both; }
.tv-encaixe { transition: transform ${ENCAIXE.pressionado.dura}ms ease-out; }
.tv-encaixe:active { transform: scale(${ENCAIXE.pressionado.escala}); }
.tv-encaixe:focus-visible { outline: ${ENCAIXE.anel.espessura}px solid ${T.mundo}; outline-offset: ${ENCAIXE.anel.folga}px; }
.tv-disco { transition: border-color ${DISCO_DE_ATRIBUTO.dura}ms ease-out, box-shadow ${DISCO_DE_ATRIBUTO.dura}ms ease-out; }
.tv-disco:focus-visible { outline: ${ENCAIXE.anel.espessura}px solid ${T.mundo}; outline-offset: ${ENCAIXE.anel.folga}px; }
/* A CERIMÓNIA DE APRENDER (AR4 · 280:1858): o selo respira, a insígnia vira, o
   menos sobe, o fio desenha-se da esquerda, a frase sobe e fica. A frase sai
   no esvanecer do reduzido; a peça escuta o fim dela (animationend). */
@keyframes tvAprenderSelo { 0%, 100% { transform: none; } 50% { transform: scale(${CERIMONIA_DE_APRENDER.selo.escala}); } }
@keyframes tvAprenderMenos { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(-${CERIMONIA_DE_APRENDER.selo.sobe}px); } }
@keyframes tvAprenderFio { from { transform: scaleX(0); } to { transform: none; } }
@keyframes tvAprenderFrase { 0% { opacity: 0; transform: translateY(${CERIMONIA_DE_APRENDER.frase.sobe}px); } ${(100 * CERIMONIA_DE_APRENDER.frase.dura / (CERIMONIA_DE_APRENDER.frase.dura + CERIMONIA_DE_APRENDER.frase.fica)).toFixed(2)}% { opacity: 1; transform: none; } ${(100 * (1 - CERIMONIA_DE_APRENDER.reduzido.dura / (CERIMONIA_DE_APRENDER.frase.dura + CERIMONIA_DE_APRENDER.frase.fica))).toFixed(2)}% { opacity: 1; transform: none; } 100% { opacity: 0; transform: none; } }
.tv-aprender-selo { transform-origin: center; animation: tvAprenderSelo ${CERIMONIA_DE_APRENDER.selo.dura}ms ease-out ${CERIMONIA_DE_APRENDER.selo.de}ms both; }
.tv-aprender-insignia { animation: tvCerimoniaEsvai ${CERIMONIA_DE_APRENDER.selo.dura - CERIMONIA_DE_APRENDER.selo.insignia}ms ease-out ${CERIMONIA_DE_APRENDER.selo.insignia}ms both; }
.tv-aprender-menos { animation: tvAprenderMenos ${CERIMONIA_DE_APRENDER.selo.dura}ms ease-out both; }
.tv-aprender-fio { transform-box: fill-box; transform-origin: left center; animation: tvAprenderFio ${CERIMONIA_DE_APRENDER.fio.dura}ms ease-out ${CERIMONIA_DE_APRENDER.fio.de}ms both; }
.tv-aprender-pontos { animation: tvCerimoniaEsvai ${CERIMONIA_DE_APRENDER.pontos.dura}ms ease-out ${CERIMONIA_DE_APRENDER.pontos.de}ms both; }
.tv-aprender-frase { animation: tvAprenderFrase ${CERIMONIA_DE_APRENDER.frase.dura + CERIMONIA_DE_APRENDER.frase.fica}ms ease-out ${CERIMONIA_DE_APRENDER.frase.de}ms both; }
.tv-no-talento { transition: transform ${CERIMONIA_DE_APRENDER.toque.dura}ms ease-out; }
.tv-no-talento:active { transform: scale(${CERIMONIA_DE_APRENDER.toque.escala}); }
.tv-peca-banca { transition: transform ${ENCAIXE.pressionado.dura}ms ease-out, border-color ${MERCADO.escolher}ms ease-out, background-color ${MERCADO.escolher}ms ease-out; }
.tv-peca-banca:active { transform: scale(${ENCAIXE.pressionado.escala}); }
/* O GRUPO (AR5): o losango do marco acende quando o vínculo o alcança */
.tv-marco-acende { animation: tvCerimoniaEsvai ${CARTA_DO_COMPANHEIRO.acende.dura}ms ease-out both; }
/* A CONSTELAÇÃO (AR 11 · 302:4813): os tempos são os de CERIMONIA_DE_APRENDER,
   sem número novo. O anel âmbar vira ponto (escala 0, 1,35, 1) e o halo abre;
   a ligação desenha-se da vizinha acesa para a nova (o traço tem pathLength 1);
   se a figura fecha, um brilho corre as ligações uma vez; escolher a subclasse
   esvanece os outros braços. */
@keyframes tvCeuAcende { 0% { transform: scale(0); } 60% { transform: scale(${CONSTELACAO.acender.escala}); } 100% { transform: none; } }
@keyframes tvCeuFio { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes tvCeuBrilho { from { stroke-dashoffset: 1.2; opacity: 1; } to { stroke-dashoffset: 0; opacity: 0; } }
@keyframes tvCeuSai { from { opacity: 1; } to { opacity: 0; } }
.tv-ceu-acende { transform-box: fill-box; transform-origin: center; animation: tvCeuAcende ${CERIMONIA_DE_APRENDER.selo.dura}ms ease-out ${CERIMONIA_DE_APRENDER.selo.de}ms both; }
.tv-ceu-halo { animation: tvCerimoniaEsvai ${CERIMONIA_DE_APRENDER.selo.dura}ms ease-out ${CERIMONIA_DE_APRENDER.selo.de}ms both; }
.tv-ceu-fio { stroke-dasharray: 1; animation: tvCeuFio ${CERIMONIA_DE_APRENDER.fio.dura}ms ease-out ${CERIMONIA_DE_APRENDER.fio.de}ms both; }
.tv-ceu-brilho { stroke-dasharray: 0.2 1.2; animation: tvCeuBrilho ${CONSTELACAO.fecho.brilho}ms ease-out ${CERIMONIA_DE_APRENDER.frase.de}ms both; }
.tv-ceu-sai { animation: tvCeuSai ${CONSTELACAO.saida.bracos}ms ease-out both; }
/* O DADO DE USO (AR 12 · 294:4493): quando a face desce, o dado encolhe e volta (0,82 a 1) */
@keyframes tvUsoEncolhe { from { transform: scale(${DADO_DE_USO_NA_MESA.encolher.escala}); } to { transform: none; } }
.tv-uso-encolhe { transform-origin: 50% 50%; animation: tvUsoEncolhe ${DADO_DE_USO_NA_MESA.encolher.dura}ms ease-out both; }
/* TL (a tela limpa, formas.md §TL 8): a mesa puxada sobe e a gaveta do
   horizonte desce em 220 ms ease-out; o veu esvanece no mesmo tempo. Com
   reduce, tudo aparece seco (abaixo). */
@keyframes tvMesaSobe { from { transform: translateY(100%); } to { transform: none; } }
@keyframes tvGavetaDesce { from { transform: translateY(-100%); } to { transform: none; } }
@keyframes tvVeuDaMesa { from { opacity: 0; } to { opacity: 1; } }
.tv-mesa-sobe { animation: tvMesaSobe ${TIRA_DA_MESA.puxada.dura}ms ease-out both; }
.tv-veu-da-mesa { animation: tvVeuDaMesa ${TIRA_DA_MESA.puxada.dura}ms ease-out both; }
.tv-gaveta-desce { animation: tvGavetaDesce ${HORIZONTE_DA_CENA.gaveta.dura}ms ease-out both; }
/* BQ (a encruzilhada, formas.md §BQ 2): as cartas dão-se da soleira — cada
   uma sobe e roda até ao lugar, uma depois da outra; a escolhida sobe; a
   folha do telefone sobe como a mesa puxada e o véu esvanece no mesmo tempo.
   Nada espera pelo movimento: a carta é tocável desde o primeiro quadro. */
@keyframes tvCartaDada { from { opacity: 0; transform: translateY(${ENCRUZILHADA.movimento.dar.sobe}px) rotate(${ENCRUZILHADA.movimento.dar.giro}deg); } to { opacity: 1; transform: none; } }
.tv-carta-dada { animation: tvCartaDada ${ENCRUZILHADA.movimento.dar.dura}ms ease-out both; }
.tv-carta-dada-1 { animation-delay: ${ENCRUZILHADA.movimento.dar.entre}ms; }
.tv-carta-dada-2 { animation-delay: ${2 * ENCRUZILHADA.movimento.dar.entre}ms; }
.tv-carta-dada-3 { animation-delay: ${3 * ENCRUZILHADA.movimento.dar.entre}ms; }
.tv-carta-dada-4 { animation-delay: ${4 * ENCRUZILHADA.movimento.dar.entre}ms; }
.tv-carta-escolha { transition: transform ${ENCRUZILHADA.movimento.escolher.dura}ms ease-out, box-shadow ${ENCRUZILHADA.movimento.escolher.dura}ms ease-out; }
.tv-carta-escolha[aria-pressed="true"] { transform: translateY(-${ENCRUZILHADA.carta.escolhida.sobe}px); }
.tv-folha-da-escolha { animation: tvMesaSobe ${ENCRUZILHADA.movimento.folha.dura}ms ease-out both; }
.tv-veu-da-escolha { animation: tvVeuDaMesa ${ENCRUZILHADA.movimento.folha.dura}ms ease-out both; }

/* TE · OS ESPOLIOS (formas.md §TE): a carta chega de costas, treme se for
   rara, vira em duas metades (a face troca-se ENTRE elas, pelo estado da
   peca, e nunca por backface-visibility: a face escondida assim continuava
   na arvore de acessibilidade), e a luz vaza pela borda antes de virar.
   Cada quadro tem aqui a sua duracao, lida das tabelas; o atraso e posto
   pela peca (animation-delay), contado por cronogramaDoEspolio. O --sobe e
   a --escala de tvCartaChega servem a chegada, a carta do despertar e a
   reliquia que sobe; o --de/--ate da luz e do anel, a carta e a reliquia.
   O anel fica a zero ate abrir (forwards, e nao both: o both mostrava-o
   pequeno e a meio alfa durante o atraso).
   As moedas e o XP contam sem relogio de JavaScript: o --tv-n e um inteiro
   registado, animado de 0 ao alvo, e o contador do CSS escreve-o. */
@property --tv-n { syntax: "<integer>"; initial-value: 0; inherits: false; }
@keyframes tvCartaChega { from { opacity: 0; transform: translateY(var(--sobe, 0px)) scale(var(--escala, 1)); } to { opacity: 1; transform: none; } }
@keyframes tvCartaTreme { 0%, 100% { transform: none; } 12.5%, 62.5% { transform: rotate(-${REVELACAO_DO_ESPOLIO.antecipacao.graus}deg); } 37.5%, 87.5% { transform: rotate(${REVELACAO_DO_ESPOLIO.antecipacao.graus}deg); } }
@keyframes tvCartaViraA { from { transform: scaleX(1); } to { transform: scaleX(0); } }
@keyframes tvCartaViraB { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes tvLuzVaza { from { opacity: var(--vaza-de); } to { opacity: var(--vaza-ate); } }
@keyframes tvBrilhoPassa { 0% { opacity: 0; } 40% { opacity: 1; } 100% { opacity: 0; } }
@keyframes tvAnelAbre { from { opacity: var(--anel-a0); transform: scale(var(--anel-de)); } to { opacity: var(--anel-a1); transform: scale(var(--anel-ate)); } }
@keyframes tvRunaAcende { 0% { opacity: 0; transform: scale(.6); } 60% { opacity: 1; transform: scale(1.12); } 100% { opacity: 1; transform: none; } }
@keyframes tvAchadoPousa { from { opacity: 0; transform: translateY(-${CHIP_DO_ACHADO.pousa.cai}px); } to { opacity: 1; transform: none; } }
@keyframes tvFaixaEnche { from { transform: scaleX(0); } to { transform: none; } }
@keyframes tvConta { from { --tv-n: 0; } to { --tv-n: var(--alvo); } }
.tv-carta-chega { --sobe: -${REVELACAO_DO_ESPOLIO.chegam.sobe}px; animation: tvCartaChega ${REVELACAO_DO_ESPOLIO.chegam.dura}ms ${REVELACAO_DO_ESPOLIO.chegam.curva} both; }
.tv-carta-treme { animation: tvCartaTreme ${REVELACAO_DO_ESPOLIO.antecipacao.dura}ms ease-in-out both; }
.tv-carta-treme-longa { animation: tvCartaTreme ${RELIQUIA_DA_TELA.antecipacao.dura}ms ease-in-out both; }
.tv-carta-vira-a { animation: tvCartaViraA ${REVELACAO_DO_ESPOLIO.vira.meia}ms ease-in both; }
.tv-carta-vira-b { animation: tvCartaViraB ${REVELACAO_DO_ESPOLIO.vira.abre}ms ease-out both; }
.tv-reliquia-vira-a { animation: tvCartaViraA ${RELIQUIA_DA_TELA.vira.meia}ms ease-in both; }
.tv-reliquia-vira-b { animation: tvCartaViraB ${RELIQUIA_DA_TELA.vira.abre}ms ease-out both; }
.tv-luz-vaza { --vaza-de: ${REVELACAO_DO_ESPOLIO.antecipacao.vaza.de}; --vaza-ate: ${REVELACAO_DO_ESPOLIO.antecipacao.vaza.ate}; animation: tvLuzVaza ${REVELACAO_DO_ESPOLIO.antecipacao.dura}ms ease-in both; }
.tv-luz-vaza-longa { --vaza-de: ${RELIQUIA_DA_TELA.antecipacao.vaza.de}; --vaza-ate: ${RELIQUIA_DA_TELA.antecipacao.vaza.ate}; animation: tvLuzVaza ${RELIQUIA_DA_TELA.antecipacao.dura}ms ease-in both; }
.tv-brilho-passa { animation: tvBrilhoPassa ${LUZ_DA_RARIDADE.raro.brilho}ms ease-out both; }
.tv-achado-brilho { animation: tvBrilhoPassa ${CHIP_DO_ACHADO.pousa.brilho}ms ease-out both; }
.tv-anel-abre { --anel-de: ${DESPERTAR_DA_TELA.anel.de0}; --anel-ate: ${DESPERTAR_DA_TELA.anel.ate}; --anel-a0: ${DESPERTAR_DA_TELA.anel.alfa}; --anel-a1: 0; opacity: 0; animation: tvAnelAbre ${DESPERTAR_DA_TELA.anel.dura}ms ease-out forwards; }
.tv-anel-reliquia { --anel-de: ${RELIQUIA_DA_TELA.anel.de0}; --anel-ate: 1; --anel-a0: ${RELIQUIA_DA_TELA.anel.alfa.de}; --anel-a1: ${RELIQUIA_DA_TELA.anel.alfa.ate}; opacity: 0; animation: tvAnelAbre ${RELIQUIA_DA_TELA.anel.dura}ms ease-out forwards; }
.tv-runa-acende { animation: tvRunaAcende ${DESPERTAR_DA_TELA.runa.dura}ms ease-out both; }
.tv-estrela-acende { animation: tvRunaAcende ${RELIQUIA_DA_TELA.estrela}ms ease-out both; }
.tv-achado-pousa { animation: tvAchadoPousa ${CHIP_DO_ACHADO.pousa.dura}ms ${MOVIMENTO_DO_DADO.curva} both; }
.tv-despertar-carta { --escala: ${DESPERTAR_DA_TELA.carta.escalaDe}; animation: tvCartaChega ${DESPERTAR_DA_TELA.carta.dura}ms ease-out both; }
.tv-reliquia-sobe { --sobe: ${REVELACAO_DO_ESPOLIO.chegam.sobe}px; animation: tvCartaChega ${RELIQUIA_DA_TELA.sobe.dura}ms ${RELIQUIA_DA_TELA.sobe.curva} both; }
.tv-reliquia-apaga { animation: tvCerimoniaVeu ${RELIQUIA_DA_TELA.apaga}ms ease-out both; }
.tv-reliquia-lume { animation: tvCerimoniaVeu ${RELIQUIA_DA_TELA.lume.dura}ms ease-out both; }
.tv-reliquia-frase { animation: tvCerimoniaSobe ${RELIQUIA_DA_TELA.frase.dura}ms ease-out both; }
.tv-espolio-rotulo { animation: tvCerimoniaSobe ${REVELACAO_DO_ESPOLIO.rotulo.dura}ms ease-out both; }
.tv-espolio-rotulo-coracao { animation: tvCerimoniaSobe ${REVELACAO_DO_ESPOLIO.rotulo.coracao}ms ease-out both; }
.tv-espolio-favor { animation: tvCerimoniaEsvai ${REVELACAO_DO_ESPOLIO.favor.dura}ms ease-out both; }
.tv-espolio-veredito { animation: tvCerimoniaSobe ${REVELACAO_DO_ESPOLIO.veredito.dura}ms ease-out both; }
.tv-faixa-enche { transform-origin: left center; animation: tvFaixaEnche ${REVELACAO_DO_ESPOLIO.xp.dura}ms ease-out both; }
.tv-conta { --tv-n: var(--alvo); counter-reset: tvn var(--tv-n); }
.tv-conta::after { content: counter(tvn); }
.tv-conta-xp { animation: tvConta ${REVELACAO_DO_ESPOLIO.xp.dura}ms ease-out both; }
.tv-conta-moedas { animation: tvConta ${REVELACAO_DO_ESPOLIO.moedas.dura}ms ease-out both; }

/* CB 5 · O GOLPE SENTIDO: a pausa (o piscar da ficha), o tremor (so a ficha;
   a amplitude vem em --tremor, em unidades da grelha, porque o SVG mede em
   casas), o numero que salta e assenta, a queda que afunda, a moldura que
   acende quando o golpe e em ti, e a mesa que treme no critico. As duracoes
   sao as de GOLPE_SENTIDO; a entrada nunca espera por nenhuma delas. */
@keyframes tvGolpePisca { from { opacity: ${GOLPE_SENTIDO.piscar.alfa}; } to { opacity: 0; } }
@keyframes tvGolpeTremor { 0%, 100% { transform: none; } 16% { transform: translateX(var(--tremor, 0px)); } 33% { transform: translateX(calc(var(--tremor, 0px) * -0.8)); } 50% { transform: translateX(calc(var(--tremor, 0px) * 0.55)); } 66% { transform: translateX(calc(var(--tremor, 0px) * -0.35)); } 83% { transform: translateX(calc(var(--tremor, 0px) * 0.15)); } }
@keyframes tvGolpeDesvia { 0%, 100% { transform: none; } 45% { transform: translateX(var(--tremor, 0px)); } }
@keyframes tvGolpeSaltoAcerto { 0% { opacity: 0; transform: scale(${GOLPE_SENTIDO.salto.de}); } 18.4% { opacity: 1; transform: scale(${GOLPE_SENTIDO.salto.de}); } 50% { opacity: 1; transform: scale(${GOLPE_SENTIDO.salto.pico}); } 100% { opacity: 1; transform: translateY(-${GOLPE_SENTIDO.salto.sobe}px) scale(1); } }
@keyframes tvGolpeSaltoCritico { 0% { opacity: 0; transform: scale(${GOLPE_SENTIDO.salto.de}); } 27.5% { opacity: 1; transform: scale(${GOLPE_SENTIDO.salto.de}); } 62.5% { opacity: 1; transform: scale(${GOLPE_SENTIDO.salto.pico}); } 100% { opacity: 1; transform: translateY(-${GOLPE_SENTIDO.salto.sobe}px) scale(1); } }
@keyframes tvGolpeSaltoAbate { 0% { opacity: 0; transform: scale(${GOLPE_SENTIDO.salto.de}); } 23.1% { opacity: 1; transform: scale(${GOLPE_SENTIDO.salto.de}); } 53.8% { opacity: 1; transform: scale(${GOLPE_SENTIDO.salto.pico}); } 100% { opacity: 1; transform: translateY(-${GOLPE_SENTIDO.salto.sobe}px) scale(1); } }
@keyframes tvGolpeSaltoErro { from { opacity: 0; } to { opacity: 1; } }
@keyframes tvGolpeEsvai { from { opacity: 1; } to { opacity: 0; } }
@keyframes tvGolpeAfunda { from { transform: none; opacity: 1; } to { transform: scale(${GOLPE_SENTIDO.abate.afunda.escala}); opacity: ${GOLPE_SENTIDO.abate.afunda.alfa}; } }
@keyframes tvGolpeBorda { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }
@keyframes tvGolpeMesa { 0%, 100% { transform: none; } 25% { transform: translate(${GOLPE_SENTIDO.critico.mesa.px}px, -1px); } 50% { transform: translate(-${GOLPE_SENTIDO.critico.mesa.px}px, 1px); } 75% { transform: translate(1px, 0); } }
.tv-golpe-pausa { animation: tvGolpePisca ${GOLPE_SENTIDO.acerto.pausa}ms steps(1, end) both; }
.tv-golpe-pausa-critico { animation: tvGolpePisca ${GOLPE_SENTIDO.critico.pausa}ms steps(1, end) both; }
.tv-golpe-pausa-abate { animation: tvGolpePisca ${GOLPE_SENTIDO.abate.pausa}ms steps(1, end) both; }
.tv-golpe-tremor { animation: tvGolpeTremor ${GOLPE_SENTIDO.acerto.tremor.ms}ms ease-out ${GOLPE_SENTIDO.acerto.pausa}ms both; }
.tv-golpe-tremor-critico { animation: tvGolpeTremor ${GOLPE_SENTIDO.critico.tremor.ms}ms ease-out ${GOLPE_SENTIDO.critico.pausa}ms both; }
.tv-golpe-tremor-abate { animation: tvGolpeTremor ${GOLPE_SENTIDO.abate.tremor.ms}ms ease-out ${GOLPE_SENTIDO.abate.pausa}ms both; }
.tv-golpe-desvia { animation: tvGolpeDesvia ${GOLPE_SENTIDO.erro.tremor.ms}ms ease-in-out both; }
.tv-golpe-salto { animation: tvGolpeSaltoAcerto ${GOLPE_SENTIDO.acerto.pausa + GOLPE_SENTIDO.acerto.tremor.ms + GOLPE_SENTIDO.acerto.assenta}ms ease-out both, tvGolpeEsvai ${GOLPE_SENTIDO.esvai}ms ease-in ${GOLPE_SENTIDO.acerto.pausa + GOLPE_SENTIDO.acerto.tremor.ms + GOLPE_SENTIDO.acerto.assenta + GOLPE_SENTIDO.leitura}ms forwards; }
.tv-golpe-salto-critico { animation: tvGolpeSaltoCritico ${GOLPE_SENTIDO.critico.pausa + GOLPE_SENTIDO.critico.tremor.ms + GOLPE_SENTIDO.critico.assenta}ms ease-out both, tvGolpeEsvai ${GOLPE_SENTIDO.esvai}ms ease-in ${GOLPE_SENTIDO.critico.pausa + GOLPE_SENTIDO.critico.tremor.ms + GOLPE_SENTIDO.critico.assenta + GOLPE_SENTIDO.leitura}ms forwards; }
.tv-golpe-salto-abate { animation: tvGolpeSaltoAbate ${GOLPE_SENTIDO.abate.pausa + GOLPE_SENTIDO.abate.tremor.ms + GOLPE_SENTIDO.abate.assenta}ms ease-out both, tvGolpeEsvai ${GOLPE_SENTIDO.esvai}ms ease-in ${GOLPE_SENTIDO.abate.pausa + GOLPE_SENTIDO.abate.tremor.ms + GOLPE_SENTIDO.abate.assenta + GOLPE_SENTIDO.leitura}ms forwards; }
.tv-golpe-salto-erro { animation: tvGolpeSaltoErro ${GOLPE_SENTIDO.erro.tremor.ms}ms ease-out both, tvGolpeEsvai ${GOLPE_SENTIDO.esvai}ms ease-in ${GOLPE_SENTIDO.erro.tremor.ms + GOLPE_SENTIDO.leitura}ms forwards; }
.tv-golpe-afunda { transform-box: fill-box; transform-origin: center; animation: tvGolpeAfunda ${GOLPE_SENTIDO.abate.assenta}ms ease-in ${GOLPE_SENTIDO.abate.pausa}ms both; }
.tv-golpe-borda { animation: tvGolpeBorda ${GOLPE_SENTIDO.emTi.ms}ms ease-out both; }
.tv-golpe-mesa { animation: tvGolpeMesa ${GOLPE_SENTIDO.critico.mesa.ms}ms linear ${GOLPE_SENTIDO.critico.pausa}ms both; }
/* CB 7 · A ENTRADA NA MESA (1,2 s, pulavel com um toque ou Esc): o veu fecha,
   o retrato cresce do cartao para o centro, a mesa aparece por baixo. */
@keyframes tvEntradaVeu { from { opacity: 0; } to { opacity: 1; } }
@keyframes tvEntradaCresce { from { transform: scale(1); } to { transform: scale(${CARTAO_DO_ENCONTRO.entrada.escala}); } }
@keyframes tvEntradaMesa { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.tv-entrada-veu { animation: tvEntradaVeu ${CARTAO_DO_ENCONTRO.entrada.veu[1] - CARTAO_DO_ENCONTRO.entrada.veu[0]}ms ease-out both; }
.tv-entrada-cresce { animation: tvEntradaCresce ${CARTAO_DO_ENCONTRO.entrada.cresce[1] - CARTAO_DO_ENCONTRO.entrada.cresce[0]}ms ease-in-out ${CARTAO_DO_ENCONTRO.entrada.cresce[0]}ms both; }
.tv-entrada-mesa { animation: tvEntradaMesa ${CARTAO_DO_ENCONTRO.entrada.mesa[1] - CARTAO_DO_ENCONTRO.entrada.mesa[0]}ms ease-out ${CARTAO_DO_ENCONTRO.entrada.mesa[0]}ms both; }

@media (prefers-reduced-motion: reduce) {
  .tv-anel-fora, .tv-anel-dentro, .tv-pisca { animation: none; }
  /* TL: a mesa puxada, o veu e a gaveta do horizonte aparecem secos */
  .tv-mesa-sobe, .tv-veu-da-mesa, .tv-gaveta-desce { animation: none; }
  /* BQ: a encruzilhada aparece seca; a escolhida só ganha o aro */
  .tv-carta-dada, .tv-folha-da-escolha, .tv-veu-da-escolha { animation: none; }
  .tv-carta-escolha { transition: none; }
  .tv-carta-escolha[aria-pressed="true"] { transform: none; }
  /* a moldura parada: o lume fica onde está, a gema troca seca */
  .tv-moldura-lume, .tv-moldura-gema { animation: none; }
  /* a cerimónia parada: só o quadro da escolha, num esvanecer (a peça põe
     tv-cerimonia-reduzida na raiz, e só aqui dentro ela anima); o brilho do
     encaixe fixo, a gaveta e o disco a trocar secos */
  .tv-cerimonia-veu, .tv-cerimonia-luz, .tv-cerimonia-forja, .tv-cerimonia-pulso, .tv-cerimonia-numero, .tv-cerimonia-ganho, .tv-cerimonia-gema, .tv-cerimonia-escolha, .tv-cerimonia-esvai { animation: none; }
  .tv-cerimonia-faisca { animation: none; opacity: 0; }
  .tv-encaixe-brilho { animation: none; opacity: ${ENCAIXE.brilho.fixo}; }
  .tv-gaveta-sobe, .tv-gaveta-abre { animation: none; }
  .tv-encaixe, .tv-disco { transition: none; }
  .tv-encaixe:active { transform: none; }
  .tv-cerimonia-reduzida { animation: tvCerimoniaEsvai ${CERIMONIA_DO_NIVEL.reduzido.dura}ms ease-out both; }
  .tv-gaveta-reduzida { animation: tvCerimoniaEsvai ${GAVETA_DO_ENCAIXE.reduzido}ms ease-out both; }
  /* a cerimónia de aprender parada: sem escala, sem o fio a desenhar-se, sem
     o menos a subir; o nó esvanece (tv-aprender-reduzida), a ligação já
     está acesa e a frase fica */
  .tv-aprender-selo, .tv-aprender-insignia, .tv-aprender-fio, .tv-aprender-pontos, .tv-aprender-frase { animation: none; }
  .tv-aprender-menos { animation: none; opacity: 0; }
  .tv-no-talento { transition: none; }
  .tv-no-talento:active { transform: none; }
  .tv-peca-banca { transition: none; }
  .tv-peca-banca:active { transform: none; }
  .tv-aprender-reduzida { animation: tvCerimoniaEsvai ${CERIMONIA_DE_APRENDER.reduzido.dura}ms ease-out both; }
  /* o marco do vínculo: troca seca */
  .tv-marco-acende { animation: none; }
  /* o céu parado: sem escala, sem traço, sem brilho — a estrela e a ligação
     esvanecem juntas (tv-ceu-reduzida, 160 ms); os braços que saem somem a
     seco (120 ms); a frase aparece e fica */
  .tv-ceu-acende, .tv-ceu-halo, .tv-ceu-fio, .tv-ceu-sai { animation: none; }
  .tv-ceu-brilho { animation: none; opacity: 0; }
  .tv-ceu-reduzida { animation: tvCerimoniaEsvai ${CERIMONIA_DE_APRENDER.reduzido.dura}ms ease-out both; }
  .tv-ceu-sai-reduzida { animation: tvCeuSai ${CONSTELACAO.saida.reduzido}ms steps(1, end) both; }
  /* o dado de uso parado: a face troca seca */
  .tv-uso-encolhe { animation: none; }
  /* a bandeja parada: o dado aparece já pousado, com o número final, e o
     veredito à vista. A saída é none, como a casa exige (check-formas D5c):
     as três classes pousam no estado final porque nenhuma começa invisível */
  .tv-dado-rola, .tv-dado-pousa { animation: none; }
  .tv-dado-veredito { animation: none; opacity: 1; }
  /* O D20 ROLANDO, PARADO (V6, um defeito anterior apanhado na prova jogada): a
     linha da espera, o veu do dado e a lenda rodavam sem fim com reduced-motion.
     A saida nao e so none: parado, o d20 fica escurecido, e e isso que separa o
     rolando do resultado no veu (o numero continua trocando por JavaScript). */
  .tv-dice { animation: none; filter: brightness(${DADO.rolandoParado}); }
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
  /* O SINAL DE GUARDADO (R13) — e a saida NAO e none.
     formas.md escreve-a: "sem varredura — o fio fica T.ok 1,2 s e
     desvanece". none sozinho, com o both da declaracao, congelaria o
     fio em scaleX(0): invisivel, e o jogador ficaria sem o unico sinal
     na tela de que a vida dele esta guardada. A saida pousa no estado
     CHEIO (scaleX(1), opacity 1) e quem o apaga passa a ser o prop
     visivel de SinalDeGuardado, que o pai segura 1,2 s. */
  .tv-guardado-varre { animation: none; transform: scaleX(1); opacity: 1; }
  /* O ALFORJE, O VÉU E A MARCA (R21) — corte seco nos dois planos: quem
     ENTRA pousa aberto (transform: none), quem SAI pousa invisível
     (opacity: 0) — a mesma convenção de .tv-janela-sai /
     .tv-trilho-sai, ali em cima. .tv-mudou-agora já comunica "novo"
     pelo disco cheio e sem seta (a peça, não a folha); sem pulso, o
     disco continua a dizer a mesma coisa parado. */
  .tv-alforje-sobe { animation: none; transform: none; }
  .tv-alforje-desce { animation: none; opacity: 0; }
  .tv-veu-entra { animation: none; opacity: 1; }
  .tv-veu-sai { animation: none; opacity: 0; }
  .tv-mudou-agora { animation: none; }
  /* V4 · O ANEL — corte seco: o arco salta, o pulso nao acontece, e o pedaco
     perdido fica PARADO a meia tinta ate o anel o tirar (750 ms). A saida
     nao e none sozinho: com o both da declaracao, none deixava-o aceso por
     inteiro; a informacao (quanto se perdeu) fica, o movimento sai. */
  .tv-agonia, .tv-anel-clarao { animation: none; }
  .tv-anel-cresce { transition: none; }
  .tv-anel-perdido { animation: none; opacity: ${ANEL.alfaParado}; }
  /* A1 · O FIM DA LUTA entra parado: o desfecho e os chips ja estao no
     estado final (opacity 1, sem subida) desde o primeiro quadro. */
  .tv-fim-entra { animation: none; opacity: 1; transform: none; }
  /* F1 · A FOGUEIRA pronta desde o primeiro quadro: os lugares acesos, a
     chama parada na escala cheia, as faiscas paradas e visiveis (o seu
     estado de repouso e opacity 1), o retrato ja grande. */
  .tv-fogueira-entra, .tv-fogueira-lugar, .tv-fogueira-vira { animation: none; opacity: 1; transform: none; }
  .tv-fogueira-chama, .tv-fogueira-faisca { animation: none; transform: none; opacity: 1; }
  /* F2b · AS FICHAS prontas desde o primeiro quadro, e o cartao ja no
     lugar; a fileira que sai pousa invisivel (o painel troca-a logo, sem
     esperar os 120). */
  .tv-ficha-entra, .tv-cartao-entra { animation: none; opacity: 1; transform: none; }
  .tv-ficha-sai { animation: none; opacity: 0; }
  /* TE · OS ESPOLIOS parados: so o quadro final, num esvanecer (a peca poe
     tv-cerimonia-reduzida na raiz); a luz e os aneis no valor de repouso, a
     barra cheia e os numeros no alvo (o --tv-n da regra base). */
  .tv-carta-chega, .tv-carta-treme, .tv-carta-treme-longa, .tv-carta-vira-a, .tv-carta-vira-b, .tv-reliquia-vira-a, .tv-reliquia-vira-b, .tv-despertar-carta, .tv-reliquia-sobe { animation: none; opacity: 1; transform: none; }
  .tv-luz-vaza, .tv-luz-vaza-longa, .tv-brilho-passa, .tv-achado-brilho { animation: none; opacity: 0; }
  .tv-anel-abre, .tv-anel-reliquia { animation: none; opacity: var(--anel-a1); transform: none; }
  .tv-runa-acende, .tv-estrela-acende, .tv-achado-pousa, .tv-reliquia-apaga, .tv-reliquia-lume, .tv-reliquia-frase, .tv-espolio-rotulo, .tv-espolio-rotulo-coracao, .tv-espolio-favor, .tv-espolio-veredito, .tv-faixa-enche { animation: none; opacity: 1; transform: none; }
  .tv-conta-xp, .tv-conta-moedas { animation: none; }
  /* CB 5 · o golpe parado (WCAG 2.3.3): sem pausa, sem tremor, sem escala, sem
     a mesa a mexer e sem a moldura a acender. A queda pousa ja afundada. O
     numero aparece num esvanecer curto (a peca poe tv-golpe-reduzido nele, e
     so aqui dentro ele anima), e o som fica: reduzir movimento nao e pedir
     silencio. */
  .tv-golpe-pausa, .tv-golpe-pausa-critico, .tv-golpe-pausa-abate, .tv-golpe-borda { animation: none; opacity: 0; }
  .tv-golpe-tremor, .tv-golpe-tremor-critico, .tv-golpe-tremor-abate, .tv-golpe-desvia, .tv-golpe-mesa { animation: none; transform: none; }
  .tv-golpe-afunda { animation: none; transform: scale(${GOLPE_SENTIDO.abate.afunda.escala}); opacity: ${GOLPE_SENTIDO.abate.afunda.alfa}; }
  .tv-golpe-salto, .tv-golpe-salto-critico, .tv-golpe-salto-abate, .tv-golpe-salto-erro { animation: none; opacity: 1; transform: none; }
  .tv-golpe-reduzido { animation: tvGolpeSaltoErro ${GOLPE_SENTIDO.reduzido.esvai}ms ease-out both; }
  /* CB 7 · a entrada na mesa: corte seco para a mesa, e o som fica */
  .tv-entrada-veu, .tv-entrada-cresce { animation: none; opacity: 0; }
  .tv-entrada-mesa { animation: none; opacity: 1; transform: none; }
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
   sobre T.pagina, ver a nota grande sobre T acima). (V1: no poço,
   13,59–14,15:1 — o peso 300 continua a ser a defesa contra a
   irradiação.) As duas decisões nascem da mesma causa óptica, e por
   isso vivem na mesma caixa. O
   @import de FONT_CSS já carrega o peso 300 do Spectral — a classe
   só usa o que já chega.

   QUEM APLICA .tv-coluna AO TEXTO DA NARRAÇÃO É O oficial, no
   App.jsx — esta etapa é território do aprendiz (estilo.js e
   ui.jsx), e o App.jsx está fora dela por lei do bastão. Esta classe
   nasce fabricada e sem consumidor ainda; ganha o leitor na etapa
   seguinte. */
.tv-coluna { max-width: 65ch; margin-inline: auto; font-weight: 300; }

/* ---------------- B1 · AS DUAS SOMBRAS DA MESA DE BATALHA ----------------
   O quadro 151:1662 dá sombra a dois painéis: a arena (0 8 24, preto a
   0,25) e o turno atual (0 0 20, o ambar a 0,19 - o brilho de quem age).
   Moram na folha e nao num style inline porque a tela da batalha proibe
   boxShadow inline: o anel de foco tambem e box-shadow, e o inline venceria
   sempre a folha. Nenhum dos dois paineis e focavel; o anel continua dos
   controles de dentro. */
.tv-mesa-arena { box-shadow: 0 8px 24px ${sombra(".25")}; }
.tv-mesa-vez { box-shadow: 0 0 20px ${alfa(T.amber, 0.19)}; }

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
   monitor.

   ---------------- R21 · OS 4,75rem DEIXAM DE SER DEVIDOS ----------------
   TrilhoAbas deixa de flutuar fixo sobre o telefone (vira a fita DO
   ALFORJE, hidden md:flex — trabalho do oficial, com o bastão): a
   reserva de 76px que pagava a barra fixa deixa de ter o que pagar. O
   que sobra é só a área segura do aparelho — um iPhone sem a barra do
   Safari tem um indicador de início que hoje nenhum ponto do projeto
   evita (formas.md, R21 §0.3), e env() com fallback nunca quebra num
   navegador que não o entende: cai em 0px, o mesmo de sempre. */
.tv-espaco-abas { padding-bottom: env(safe-area-inset-bottom, 0px); }
.tv-margem-abas { margin-right: 0; }
@media (min-width: 768px) {
  .tv-espaco-abas { padding-bottom: 0; }
  .tv-margem-abas { margin-right: 0; }
}

/* ---------------- O ALFORJE: A MOLDURA MUDA DE FORMA POR CSS (R21) ----------------
   Um único invólucro, duas composições — a régua é CAMPO_DO_TURNO.colunaEstreita
   nos outros lugares desta casa, e aqui é a MESMA ideia sem precisar
   nomeá-la de novo: zero matchMedia, e rodar o telefone a meio do
   turno não parte nada.

   POR QUE UMA VARIÁVEL CSS E NÃO SÓ CLASSE DO TAILWIND: top e o raio de
   cima nascem de uma CONTA que só o React sabe fazer (topo é prop —
   CINTA.altura/alturaViva + ALVOS.piso —, e o raio vem de ALFORJE.raio).
   Um valor computado em JS entra por style, e style sempre ganha de
   qualquer classe, em qualquer tela — inclusive de uma classe do
   Tailwind escrita md:. Por isso a TROCA por tamanho de tela não pode
   morar no style: mora aqui, numa classe cuja media query os dois lados
   leem, e o React só carimba a variável. */
.tv-alforje-topo { top: var(--tv-alforje-topo, 0px); }
@media (min-width: 768px) {
  .tv-alforje-topo { top: 0; }
}
.tv-alforje-raio {
  border-top-left-radius: var(--tv-alforje-raio, 0px);
  border-top-right-radius: var(--tv-alforje-raio, 0px);
}
@media (min-width: 768px) {
  .tv-alforje-raio { border-top-left-radius: 0; border-top-right-radius: 0; }
}

/* ---------------- SEIS ABAS, SÓ GLIFO ABAIXO DE 339px (R21 §3) ----------------
   A correção do oficial (24/09): a degradação (rótulo escondido, nome no
   aria-label) É POR CSS, não por uma conta em JavaScript que decidia
   "seis abas = sem rótulo em qualquer largura" — cinco abas NUNCA
   escondem, e seis só escondem abaixo de ALFORJE.larguraParaSeisRotulos
   (339px, medido em formas.md §3).

   O SELETOR NÃO É UM NOME DE CLASSE NOVO EM ui.jsx — é a combinação
   .uppercase.tracking-wide, que já é exatamente como AbaComGlifo marca o
   SEU rótulo (e só ele: o selo do contador usa outras classes).
   painel-alforje.jsx só acrescenta .tv-fita-seis ao invólucro da fita
   quando há seis abas; soGlifo continua false sempre (o nome acessível
   vem de um aria-label passado por fora, não da peça escondendo o
   próprio texto) — então o nome nunca desaparece, só o traço visível. */
.tv-fita-seis [role="tab"] .uppercase.tracking-wide { display: none; }
@media (min-width: ${ALFORJE.larguraParaSeisRotulos}px) {
  .tv-fita-seis [role="tab"] .uppercase.tracking-wide { display: inline; }
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

/* ---------------- O ESBATIMENTO DO TOPO (R15) ----------------------
   A regiao que rola por baixo de uma cabeca fixa deixa de se cortar a
   navalha. Poe-se na PROPRIA regiao que rola (nao numa camada por
   cima), e por isso nao intercepta um unico clique: uma mascara nao e
   um elemento. A lei "nunca pode custar o turno" fica cumprida por
   construcao, e nao por cuidado.

   A ALTURA E ESBATIMENTO.altura (24) e a conta esta na tabela. A regiao
   ja tem py-6 = 24 px de enchimento no topo, logo em scrollTop 0 a
   banda cobre so enchimento e a primeira linha nasce a luz inteira.

   OS TRES BATENTES SAO ESCALONADOS e nao lineares, e a razao e a mesma
   pela qual a barra de PV e comprimento e nao cor: uma rampa linear de
   alfa le-se como um degrau no fim, porque a percepcao de luminancia
   nao e linear. Os tres pontos aproximam uma curva com 2 px de erro e
   custam zero em desempenho — e uma mascara de gradiente e composta
   pela GPU, nunca pelo fio principal.

   -webkit-mask-image fica por causa do Safari, que ainda pede o
   prefixo para mask-image em contexto de composicao.

   E SAI INTEIRO EM ALTO CONTRASTE, logo abaixo: uma mascara de alfa
   apaga texto por graus e em forced-colors o sistema nao tem como o
   repor. Ali a cabeca ja nao e uma imagem — e um contorno do sistema,
   contra o qual um corte recto le bem. A peca que existe para suavizar
   uma imagem nao tem trabalho onde a imagem nao existe. */
/* V1: a LUZ_AMBIENTE mora aqui e nao numa classe nova porque .tv-esbate-topo
   e o unico leitor do corpo da historia e ja e a regiao que rola por baixo
   do cabecalho da pagina (V5a; antes, da gravura) — exatamente onde a v3 poe o gradiente. Sem
   background-attachment (o padrao e scroll) o gradiente fica preso a CAIXA,
   nao ao texto, e a mascara do esbatimento tambem o esbate nos 24px de cima. */
.tv-esbate-topo {
  background-image: ${LUZ_AMBIENTE};
  -webkit-mask-image: linear-gradient(to bottom, ${RAMPA_DO_ESBATIMENTO});
  mask-image: linear-gradient(to bottom, ${RAMPA_DO_ESBATIMENTO});
}
@media (forced-colors: active) {
  .tv-esbate-topo { -webkit-mask-image: none; mask-image: none; }
}
/* F2b · O ESBATIMENTO, nos outros dois lados (formas.md, Fichas 1 e 5): a
   fileira das fichas que rola de lado esbate a ponta direita (ha mais a
   direita), e o que se sabe no cartao esbate o fundo (o que se sabe
   continua). A mesma rampa, a mesma altura, so a direcao muda; o painel so
   poe a classe quando ha mesmo mais para ver. Sai inteiro em alto contraste
   pela mesma razao do de cima. */
.tv-esbate-fim {
  -webkit-mask-image: linear-gradient(to left, ${RAMPA_DO_ESBATIMENTO});
  mask-image: linear-gradient(to left, ${RAMPA_DO_ESBATIMENTO});
}
.tv-esbate-baixo {
  -webkit-mask-image: linear-gradient(to top, ${RAMPA_DO_ESBATIMENTO});
  mask-image: linear-gradient(to top, ${RAMPA_DO_ESBATIMENTO});
}
@media (forced-colors: active) {
  .tv-esbate-fim, .tv-esbate-baixo { -webkit-mask-image: none; mask-image: none; }
}
/* V5 · A PAGINA (o parchment-body do no 129:15): o enchimento e o ritmo
   entre blocos saem de PAGINA. No telefone os lados sao mais estreitos que
   o no, de proposito (ver a tabela). */
.tv-pagina {
  padding: ${PAGINA.cima}px ${FOLHA_DO_MESTRE.ladoTelefone}px ${PAGINA.baixo}px;
}
.tv-pagina > * + * { margin-top: ${PAGINA.entreBlocos}px; }
/* A FOLHA (Mesa C): o pergaminho, a vinheta da borda e a fibra do papel. A
   cor vem de T e o alfa de FOLHA; a fibra vai a 0,06 e a conta da prosa
   ignora-a, e mesmo assim sobra 8,74 no pior ponto. */
.tv-folha {
  background-color: ${T.pergaminho};
  background-image:
    radial-gradient(75% 75% at 50% 50%, transparent 60%, ${alfa(T.pergaminhoBorda, FOLHA_DO_MESTRE.vinheta)} 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' seed='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.25 0 0 0 0 0.12 0 0 0 ${FOLHA_DO_MESTRE.fibra} 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E");
  color: ${T.tintaDoPergaminho};
  border-radius: ${FOLHA_DO_MESTRE.raio}px;
  box-shadow: 0 2px 10px ${sombra(FOLHA_DO_MESTRE.sombra)};
}
/* O FELTRO (AAA · 05/11, formas.md §14): a fibra fina e a mancha larga são
   ruído ISOTRÓPICO — a mesma frequência nos dois eixos, sem direção, logo
   sem riscas (a madeira de antes tinha 0.012 0.42, e riscava o telefone). A
   luz da vela vem de cima; a borda é couro com um fio de ouro por dentro. */
.tv-mesa {
  background-color: ${T.bg};
  background-image:
    radial-gradient(120% 80% at 50% -10%, ${alfa(T.amber, FOLHA_DO_MESTRE.luzDaVela)}, transparent 70%),
    radial-gradient(130% 100% at 50% 40%, transparent 55%, ${sombra(FOLHA_DO_MESTRE.cantoDaMesa)} 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.62 0 0 0 0 0.78 0 0 0 0 0.66 0 0 0 0.10 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='640'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.035' numOctaves='2' seed='11' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0.06 0 0 0 0 0.04 0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23m)'/%3E%3C/svg%3E");
  box-shadow: inset 0 0 0 ${BORDA_DA_MESA.telefone}px ${T.couroBaixo}, inset 0 0 0 ${BORDA_DA_MESA.telefone + 1}px ${alfa(BORDA_DA_MESA.ouro, BORDA_DA_MESA.alfaDoOuro)};
}
@media (min-width: 768px) {
  .tv-mesa { box-shadow: inset 0 0 0 ${BORDA_DA_MESA.mesa}px ${T.couroBaixo}, inset 0 0 0 ${BORDA_DA_MESA.mesa + 1}px ${alfa(BORDA_DA_MESA.ouro, BORDA_DA_MESA.alfaDoOuro)}; }
}
@media (forced-colors: active) {
  .tv-folha, .tv-mesa { background-image: none; }
}
/* TL 8: A PAGINA E A FOLHA. O papel (.tv-folha) vai no que embrulha a area que
   rola, e o enchimento (.tv-pagina) na propria area: assim a mascara do topo
   (.tv-esbate-topo) esbate a letra e nunca o papel. */
@media (min-width: 768px) {
  .tv-pagina { padding: ${PAGINA.mesa.cima}px ${FOLHA_DO_MESTRE.lado}px ${PAGINA.mesa.baixo}px; }
}
/* V5 · o pe do cartao: os lados da mesa sao os do no, os do telefone os da cinta */
.tv-pe-da-pagina { padding: ${PE_DA_PAGINA.cima}px ${PE_DA_PAGINA.ladoTelefone}px ${PE_DA_PAGINA.baixo}px; }
@media (min-width: 768px) {
  .tv-pe-da-pagina { padding-inline: ${PE_DA_PAGINA.lado}px; }
}

/* O ROTULO do sinal de guardado vive na folga que o enchimento de 12 da
   cinta deixa entre os dois alvos. Quando a folga nao chega para ele, o
   rotulo NAO aparece e fica a varredura sozinha — a degradacao e escrita
   em formas.md, nao acidental. O que nunca cai e o aria-live, que diz
   guardado a quem nao ve nenhuma das duas, e por isso ele vive noutro
   elemento: um aria-live com display: none nao anuncia nada.

   O NUMERO E MEDIDO, E NAO E O QUE formas.md SUPOS. A peca diz "abaixo
   de 67 px de folga o rotulo nao aparece", o que da a entender que aos
   67 px do telefone de referencia ele aparece. Medido no navegador, com
   a fonte carregada e lido por scrollWidth: o rotulo pede 74 px
   (CINTA.rotuloDoGuardado). SETENTA E QUATRO NAO CABEM EM SESSENTA E
   SETE — e a conta a mao, que dava 72, tambem se enganava por dois.

   A conta do limiar, para quem a quiser refazer: folga = largura - 24
   (enchimento) - 186 (a ficha) - 98 (o tempo), logo a folga chega aos
   74 px a partir de 382 px. O limiar e 381, e e o unico numero desta
   folha que nao veio de formas.md: veio de uma regua. Aos 375 do
   telefone de referencia o jogador fica com a varredura e com o
   aria-live, que sao duas das tres camadas.

   O QUE ISTO PEDE A MESA, e vai escrito no relato em vez de resolvido a
   sorrelfa: ou o rotulo encolhe (guardado sozinho cabe), ou o tempo cede
   sete px, ou o telefone assume a varredura. Escolher por conta propria
   qual das tres era inventar forma, e a forma tem dono.

   O DESENHO ESCOLHEU A TERCEIRA, E AS OUTRAS DUAS NAO ERAM SAIDAS: o
   buraco nao e de sete px, e de sessenta e dois. Medido com a cinta no
   ar, a 375: a ficha come 194, o tempo 145, e a folga e 12 — enquanto
   «✓ guardado» pede 74 e «guardado» sozinho pede 58. NENHUM DOS DOIS
   CABE, e o tempo ceder sete px deixa 19, que continua a nao chegar.
   Fica a varredura da marca da chapa, que ja era a degradacao escrita da
   peca — e o limiar deixa de ser um numero afinado a olho e passa a ser
   CINTA.larguraParaORotulo, que a suite le de volta. */
@media (max-width: 422px) {
  .tv-guardado-rotulo { display: none; }
}

/* ---------------- O CAMPO DO TURNO (R17 §19) ----------------
   Gerado a partir de ALVOS e CAMPO_DO_TURNO — os números não estão
   escritos aqui, estão interpolados. Na coluna larga o campo é o de
   sempre (o piso do alvo); na estreita ganha altura para três linhas e
   um tecto a partir do qual rola dentro de si.
   (Sem crase neste bloco: ele vive dentro de um template-literal.) */
.tv-campo-do-turno { min-height: ${ALVOS.piso}px; }
@media ${CAMPO_DO_TURNO.colunaEstreita} {
  /* REPOUSO: uma linha ao piso do alvo, e a largura inteira — a chamada
     deixa de ser truncada, que era a outra metade silenciosa do defeito. */
  .tv-campo-do-turno {
    height: ${ALVOS.piso}px;
    overflow-y: auto;
    transition: height ${CAMPO_DO_TURNO.entrada}ms ease;
  }
  /* ABERTO: salta direito ao tecto. Nao ha degrau no meio. */
  .tv-campo-do-turno.tv-campo-aberto { height: ${CAMPO_DO_TURNO.tecto}px; }
  /* e a segunda linha dos verbos so existe com o campo aberto */
  .tv-turno-repouso .tv-turno-verbos { display: none; }
  /* V6 · A GAVETA NO CANTO (a prova jogada): aberta no telefone, a gaveta mora
     no canto de baixo a esquerda da pilula, sem coluna — a coluna ocupava a
     altura toda e empurrava o texto 65 px para dentro (lia-se como uma citacao).
     O campo reserva por baixo a altura de um alvo, e o texto comeca a 16 px e
     tem a largura inteira; ate tres linhas cabem sem altura a mais. O fundo da
     gaveta e o da pilula: o texto que rola passa por baixo dela, nunca por cima. */
  .tv-gaveta-no-canto {
    position: absolute; left: 0; bottom: 0; z-index: 1;
    background: ${T.bg}; border-radius: ${COMPOSITOR.raio}px;
  }
  .tv-campo-do-turno.tv-campo-aberto { padding-bottom: ${ALVOS.piso}px; }
}
/* A ORDEM É A REGRA, outra vez: este bloco tem de vir DEPOIS da transição
   acima, porque uma media query nao soma especificidade — so envolve. Se
   subisse, dava um acessivel que nao funciona, calado. */
@media (prefers-reduced-motion: reduce) {
  .tv-campo-do-turno { transition: none; }
}
/* ---------------- V6 · O DADO (os tres movimentos) ----------------
   LANCADO: o quarto de volta do glifo, uma vez. PULSO: o Enter na espera,
   uma vez. ROLAR: os pulsos de MUDOU_AGORA ao aparecer, e para. Nenhum
   deles bloqueia nada, e os tres tem saida no reduced-motion, logo abaixo. */
.tv-dado-lancado { animation: tvDadoLancado ${DADO.lancado}ms ease-out 1 both; }
@keyframes tvDadoLancado { from { transform: rotate(0deg); } to { transform: rotate(90deg); } }
.tv-dado-pulso { animation: tvDadoPulso ${DADO.pulso}ms ease-out 1; }
@keyframes tvDadoPulso { 0% { transform: scale(1); } 40% { transform: scale(0.86); } 100% { transform: scale(1); } }
.tv-dado-rolar { animation: tvDadoRolar ${MUDOU_AGORA.pulso}ms ease-in-out ${MUDOU_AGORA.vezes}; }
@keyframes tvDadoRolar {
  0%, 100% { box-shadow: 0 0 ${DADO.brilho}px ${alfa(T.amber, DADO.alfaDoBrilho)}; }
  50% { box-shadow: 0 0 ${DADO.brilho * 3}px ${alfa(T.amber, DADO.alfaDoBrilhoAceso)}; }
}
@media (prefers-reduced-motion: reduce) {
  .tv-dado-lancado, .tv-dado-pulso, .tv-dado-rolar { animation: none; }
}
/* V6 · O ANEL DO FOCO NA PILULA: com o raio de 24, o anel do campo (o
   retangulo de tv-anel-foco-no-campo) cortava a pilula por dentro. O anel
   passa a ser da pilula inteira, com o raio dela, a 2 px por fora do fio. */
.tv-pilula-do-campo:focus-within {
  outline: ${COMPOSITOR.anelDoFoco}px solid ${T.lineStrong};
  outline-offset: 2px;
}
/* ---------------- TP · O NOME TOCAVEL (formas.md secao TP 2 e TP 8; Figma 327:24) ----------------
   Tinta com um pontilhado por baixo: a letra nao muda de cor, so o sublinhado
   diz que isto se toca. Hostil: tracejado em perigo (a forma muda, nao so a
   cor). Apontado: o chao da tua mao; aberto: o lacre. O chao SANGRA por
   box-shadow e nao por enchimento: a linha nao mexe um pixel ao marcar. O
   nome nunca quebra (nowrap). O ::after alarga o toque para os lados. */
.tv-nome-tocavel { font: inherit; color: inherit; background: transparent; border: 0; padding: 0; margin: 0;
  position: relative; cursor: pointer; white-space: nowrap; border-radius: ${PROSA_TOCAVEL.raio}px;
  -webkit-box-decoration-break: clone; box-decoration-break: clone; -webkit-tap-highlight-color: transparent;
  text-decoration-line: underline; text-decoration-style: ${PROSA_TOCAVEL.sublinhado.estilo}; text-decoration-color: ${PROSA_TOCAVEL.sublinhado.cor};
  text-decoration-thickness: ${PROSA_TOCAVEL.sublinhado.espessura}px; text-underline-offset: ${PROSA_TOCAVEL.sublinhado.afastado}px; text-decoration-skip-ink: auto;
  transition: background-color ${PROSA_TOCAVEL.dura}ms ease-out, box-shadow ${PROSA_TOCAVEL.dura}ms ease-out, text-decoration-color ${PROSA_TOCAVEL.dura}ms ease-out; }
.tv-nome-tocavel::after { content: ""; position: absolute; top: 0; bottom: 0; left: -${PROSA_TOCAVEL.alvo.lado}px; right: -${PROSA_TOCAVEL.alvo.lado}px; }
/* TE · O CHIP DO ACHADO (formas.md §TE 3 e §TE 6): mede 32 de alto e o
   ::after alarga o toque a ALVOS.piso, para cima e para baixo, como o nome
   tocavel faz para os lados. */
.tv-chip-do-achado { position: relative; }
.tv-chip-do-achado::after { content: ""; position: absolute; left: 0; right: 0; top: -${(CHIP_DO_ACHADO.alvo - CHIP_DO_ACHADO.alto) / 2}px; bottom: -${(CHIP_DO_ACHADO.alvo - CHIP_DO_ACHADO.alto) / 2}px; }
.tv-nome-tocavel[data-tom="hostil"] { text-decoration-style: ${PROSA_TOCAVEL.sublinhado.estiloHostil}; text-decoration-color: ${PROSA_TOCAVEL.sublinhado.corHostil}; }
@media (hover: hover) and (pointer: fine) { .tv-nome-tocavel:hover { text-decoration-style: solid; } }
.tv-nome-tocavel:focus-visible { text-decoration-style: solid; }
.tv-nome-tocavel[data-estado="apontado"] { background: ${PROSA_TOCAVEL.apontado.chao}; box-shadow: 0 0 0 ${PROSA_TOCAVEL.sangra}px ${PROSA_TOCAVEL.apontado.chao};
  text-decoration-style: solid; text-decoration-thickness: ${PROSA_TOCAVEL.apontado.espessura}px; text-decoration-color: ${PROSA_TOCAVEL.apontado.sublinhado}; }
.tv-nome-tocavel[data-estado="apontado"][data-tom="hostil"] { text-decoration-color: ${PROSA_TOCAVEL.sublinhado.corHostil}; }
.tv-nome-tocavel[data-estado="aberto"] { background: ${PROSA_TOCAVEL.aberto.chao}; box-shadow: 0 0 0 ${PROSA_TOCAVEL.sangra}px ${PROSA_TOCAVEL.aberto.chao};
  color: ${PROSA_TOCAVEL.aberto.letra}; text-decoration-line: none; }
[data-abertura="cerimonia"] .tv-nome-tocavel { text-decoration-thickness: ${PROSA_TOCAVEL.sublinhado.cerimonia}px; }
/* O ANEL GANHA AO CHAO. No papel o anel que se le e o de bg (o contorno ink
   da 1,11 sobre o pergaminho e nao conta); apontado ou aberto, a sombra do
   chao ocuparia o mesmo lugar e apagaria o anel. Mais especifica que as duas
   de cima, para valer seja qual for a ordem da folha. */
.tv-nome-tocavel.tv-anel-foco:focus-visible { box-shadow: 0 0 0 2px ${T.bg}; }
@media (prefers-reduced-motion: reduce) { .tv-nome-tocavel { transition: none; animation: none; } }
/* Alto contraste: LinkText; apontado e aberto em Highlight / HighlightText. A
   secao TP 8 pedia tambem o desligar do ajuste forcado; a lei da folha
   (teste-r13-pecas) nunca o declara, e nao e preciso: o valor que ja e cor do
   sistema passa pelo modo forcado tal como esta. */
@media (forced-colors: active) {
  .tv-nome-tocavel { color: LinkText; text-decoration-color: LinkText; }
  .tv-nome-tocavel[data-estado="apontado"], .tv-nome-tocavel[data-estado="aberto"] {
    background: Highlight; color: HighlightText; box-shadow: none; } }
/* CB 9 · o telefone: a janela do campo rola sem as duas barras castanhas (a
   câmara enquadra e a régua fica presa; a barra só tapava casas) */
.tv-sem-barra { scrollbar-width: none; }
.tv-sem-barra::-webkit-scrollbar { display: none; }
`;

/* A FOLHA INTEIRA, na ordem em que o navegador tem de recebê-la.

   A ORDEM DA FOLHA É REGRA DE CASCATA, E REGRA NÃO MORA NO `App.jsx`.
   Quem monta a tela pede `FOLHA` e pronto; quem decide o que vem antes
   de quê é este arquivo, que é o único que sabe por quê.

   `FONT_CSS` primeiro porque o `@import` tem de ser a primeira coisa da
   folha — fora do topo ele é descartado em silêncio, e o jogo inteiro
   cai para a fonte de fallback sem um aviso. */
export const FOLHA = FONT_CSS + MOVIMENTO_CSS + SUPERFICIES_CSS;
