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
  /* A MESA — fria (h≈250). Recua: cabeçalho, trilho, HUD, bastidor. */
  bg:         "#12101F",   /* V1: a mesa da v3 (L 0,60 = a régua do Material) */
  panel:      "#1A162B",   /* V1: a cinta, o trilho, o compositor */
  panelSoft:  "#241F3C",   /* V1: o erguido — pílula, aba ativa */
  line:       "#352F54",   /* V1: divisória — decorativa (1,51 contra a mesa) */
  lineStrong: "#7A719A",   /* fica — a borda de CONTROLO */

  /* A PÁGINA — quente (h≈30). É o que está aceso: só onde a prosa mora. */
  pagina:     "#0F0C18",   /* V1: o POÇO da história — a página castanha morreu */
  paginaAlta: "#241F3C",   /* V1: = panelSoft, de propósito (a suíte prende) */
  /* `paginaFio` APOSENTOU-SE em V1b (25/09): fazia dois trabalhos — o fio
     decorativo do cartão e a borda dos chips que são botões. Separados,
     o primeiro é `line` e o segundo `lineStrong`, e ele ficou sem nenhum. */

  /* A TINTA */
  ink:        "#EAE4D6",   /* V1: a prosa — o da v3 (13,59–14,15 no corpo) */
  inkMeio:    "#C3B7A3",   /* fica — a segunda voz */
  inkDim:     "#9B93AC",   /* V1: o rótulo da máquina — o da v3 */

  /* OS TRÊS ACENTOS, cada um com UM trabalho */
  amber:      "#FFB03A",   /* V1: a luz e o herói */
  amberSoft:  "#FFD08A",   /* V1: o âmbar que se lê em letra */
  onAccent:   "#1A1408",   /* fica — 10,04 sobre o âmbar novo */
  violet:     "#AC79E9",   /* V1: a magia — o #9B5DE5 da v3 ERGUIDO no mesmo matiz */
  violetSoft: "#C29DEF",   /* V1: a magia em letra (7,00 sobre o erguido) */
  onSecond:   "#14101F",   /* fica — 5,93 sobre o violeta novo */
  mundo:      "#00BBF9",   /* V1: o mundo — o ciano da v3 */
  mundoSoft:  "#71DCFF",   /* V1: a voz do mundo */
  onMundo:    "#03131C",   /* V1: tinta sobre o ciano (8,51) */
  rosa:       "#F15BB5",   /* NOVO (V1) — a tua mão: o escolhido, marca, nunca chão de letra */

  danger:     "#FF6B6B",   /* V1: o da v3 */
  ok:         "#8FE0A2",   /* fica */
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
  /* O AR DA RUNA SOLTA: quando ela separa seções (as oito da criação do
     mundo), leva 8 px acima e abaixo — o mesmo `py-2` da divisória de
     v9.173, para aquelas telas não mudarem de ritmo. Dentro do cabeçalho
     e no fim da página vai a 0: ali quem dá o ar é o vizinho. */
  respiro: 8,
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
  tempo: 145,        /* o alvo da direita, MEDIDO: a hora · O selo · o +N */
  tempoMaximo: 174,  /* a última noite: o selo enche e passa de 76 a 105 */
  trilho: 56,        /* PV e PM em repouso */
  trilhoMinimo: 40,  /* o comprimento é uma razão, não uma medida */
  folgaMinima: 12,   /* 375 − 24 − 194 − 145, MEDIDO e não orçado */
  larguraParaORotulo: 436,  /* 24 + 194 + 145 + 74 − 1 — abaixo disto, só a varredura.
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
  altura: 24,
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
export const AMBIENTE = {
  direcao: "to right",
  paradas: [
    { token: "amber", alfa: 0.063, em: 0 },
    { token: "mundo", alfa: 0.09,  em: 0.55 },
    { token: "rosa",  alfa: 0.072, em: 1 },
  ],
  pisos: { prosa: 7, corpoContraMesa: 2.3 },
};

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

/* A LUZ AMBIENTE MONTADA, para a folha. Mora AQUI e não junto de
   `sombra()`/`brilho()` porque lê `AMBIENTE` e `T`, e uma `const` não
   se lê antes de nascer. */
const LUZ_AMBIENTE = `linear-gradient(${AMBIENTE.direcao}, ${AMBIENTE.paradas
  .map((p) => `${alfa(T[p.token], p.alfa)} ${Math.round(p.em * 100)}%`).join(", ")})`;

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
    corpoDoCusto: 10,     /* mono 10 px na casa de 48 — E1, confirmado por medida em E4 */
    linhaDoCusto: 0.72,   /* onde a linha de base cai, em fracção da casa: o centro da fenda `o custo` da peça (28+13/2 sobre 48) */
    anelDoFoco: 3,        /* px de `ink`, POR DENTRO: uma casa tem oito vizinhas coladas, e um anel por fora pinta por cima da borda de alcance das oito */
    anelDaParagem: 2,     /* px de `inkDim`, por dentro: onde o teclado VOLTA, contra os 3 px de onde ele ESTÁ */
  },
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
  tira: { margemV: 4, margemH: 8, raio: 8 },    /* `A faixa do fundo` · Espreita: a tira da página, 359 × 40 a 375px (R21 §8) */
};

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
@media (max-width: 436px) {
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
}
/* A ORDEM É A REGRA, outra vez: este bloco tem de vir DEPOIS da transição
   acima, porque uma media query nao soma especificidade — so envolve. Se
   subisse, dava um acessivel que nao funciona, calado. */
@media (prefers-reduced-motion: reduce) {
  .tv-campo-do-turno { transition: none; }
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
