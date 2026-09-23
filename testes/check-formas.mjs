/* check-formas.mjs (v9.252) — a cor sai de tabela, ou sai da cabeça de quem digitou?

   A DOENÇA. `src/estilo.js` existe para ser a única fonte de cor do jogo:
   `T` diz o que a cor SIGNIFICA, `MATERIAIS` diz de que o objeto É FEITO.
   E ainda assim há 332 literais de cor escritos à mão espalhados por
   `src/` — 93 só no `App.jsx`, dos quais 44 são, byte a byte, uma cor que
   já tem nome em `T`. Um `#E8A33D` colado no meio de um `style={{}}` não
   é uma cor: é uma cópia que ninguém sabe que existe, e que não muda no
   dia em que o âmbar mudar. Pior: o `#fff` de `App.jsx:2642`, sobre
   `T.danger`, dá 3,42:1 e reprova o AA — uma cor que nunca passou por
   decisão nenhuma, porque nunca passou por tabela nenhuma.
   (Endereço conferido em 16/09/K4: a citação original dizia `:2541`,
   e já estava ~100 linhas errada ANTES desta etapa — não foi o corte
   de 3 linhas da fila da ficha que a moveu. Achado pelo texto que
   descreve — `background: T.danger, color: "#fff"` — e não por conta
   de linha.)

   POR QUE UM VARREDOR E NÃO UMA SUÍTE. Não há módulo para medir. A
   doença não está no comportamento de nenhuma função — está no TEXTO do
   repositório inteiro, e num arquivo por vez ela é invisível: 41
   literais no `painel-mapa.jsx` parecem sujeira até se ver que 10 deles
   estão escritos igualzinho no `planta-cidade.jsx`. Só a passada larga
   mostra o sistema por trás da sujeira. Uma suíte prova um módulo; um
   varredor prova que um erro velho não voltou, em lugar nenhum.

   OS TRÊS DENTES, e cada um é o único a pegar o seu caso:

   - D5a — QUANTIDADE. A cor NOVA, de qualquer forma e qualquer valor,
     inclusive uma que não existe em lugar nenhum. É o único dente que
     segura o pergaminho e o dado de jogo, que não têm uma única cor de `T`.
   - D5b — QUALIDADE. A cor DUPLICADA, mesmo quando a contagem não mexe:
     é o único que morde a troca 1-por-1 de um hex de pergaminho por
     `#E8A33D`, onde D5a fica cego porque o total continua 41.
   - D5c — OUTRO EIXO. Movimento sem saída no `prefers-reduced-motion`;
     não partilha uma linha de código com os outros dois.
   - D5e — O RELÓGIO DA TELA CONTA TEMPO, NUNCA QUADROS. Nenhuma classe
     de `MOVIMENTO_CSS` anima uma duração do relógio da reação, e nenhum
     arquivo de `src/` ganha um contador de quadros sem subir o teto à
     mão. Mesmo argumento dos outros: não há módulo para medir —
     `ritmoDaRodada` devolve `trilhoMs` corretamente e continuará a
     devolvê-lo no dia em que a tela o desenhar com um contador de
     quadros. O que se prova aqui é o TEXTO do repositório.

   A sobreposição é declarada e de propósito: colar `#E8A33D` novo no
   `App.jsx` dispara os DOIS primeiros. A redundância custa zero, e as
   duas mensagens dizem coisas diferentes ("apareceu cor" e "apareceu
   cópia") — quem lê o vermelho sabe qual conserto fazer.

   OS BURACOS, declarados com número (um buraco escrito é dívida; um
   buraco calado é mentira):

   - NOME CSS (`white`, `black`, …): 1 ocorrência no escopo inteiro
     (`src/ui.jsx`, `stroke="black"`). Um dente para uma ocorrência é
     decoração, e o regex morderia prosa — `red`, `gold` e `tan` são
     nomes de variável e palavras de português/inglês. Fica aberto, com
     o número escrito para quem quiser fechá-lo.
   - `transition` fora do `estilo.js`: 18 (a barra de vida 500 ms em
     `App.jsx:21828`, PV/PM 300 ms em `:3182`/`:3189`, a cor do dado
     400 ms em `:540`/`:553`). D5c vigia `animation`, e `transition`
     NÃO é alcançável pelo `@media` da folha — é atributo inline.
     (`:21828` conferido em 16/09/K4 — a citação original dizia
     `:21003`; o achado é `className="… transition-all duration-500"`
     na barra de PV/PM do cabeçalho da ficha, não texto "500ms" literal.)
   - CONTRASTE: 3 tintas de texto-sobre-vermelho no projeto, e nenhum
     dos três dentes vê uma delas. `#fff` sobre `T.danger` dá 3,42:1 e
     reprova o AA (`App.jsx:2642`); `#1A0F0D` sobre o mesmo fundo dá
     5,48:1 (`painel-talentos.jsx:112` e `:417`, `painel-ascensao.jsx:72`).
     `T.onAccent` sobre `danger` daria 5,34:1 e resolvia as três.
     POR QUE NÃO É DENTE HOJE, e não é timidez: contraste é conta de COR,
     não contagem de TEXTO. Mede um PAR (tinta, fundo) que o varredor
     teria de INFERIR do JSX — de que fundo está por baixo daquele
     `style={{ color: … }}` sete níveis acima —, e inferir par de
     contraste a partir de `style={{}}` é outro varredor, não um quarto
     dente deste. É o buraco mais caro dos quatro e por isso fica escrito
     com número: D5b é cego porque `#fff` não é cor de `T`, e D5a só o
     segura pela CONTAGEM — trocar aquele `#fff` por outro branco
     qualquer passa verde. · paga: "uma forma para o destrutivo — e o
     contraste que reprova sai"
   - ANIMADORES EM JS: 2 (o d20 cuspindo 17 números por segundo,
     `App.jsx:486`; a ficha andando 55–110 ms por passo,
     `grade-de-batalha.jsx:265`). `prefers-reduced-motion` não toca em
     `setInterval`. A casa JÁ TEM o padrão e o usa uma vez só:
     `ui.jsx:589`, `CampoDeBrasas`, com
     `window.matchMedia("(prefers-reduced-motion: reduce)")` e um
     comentário a explicar por quê — aplicado à ATMOSFERA, e não às duas
     coisas que carregam informação de jogo.

   A CONFERÊNCIA COM D1. Esta medição reproduz o levantamento de D1 byte
   a byte: 93 no `App.jsx` (40 hex + 53 rgba), 242 nos arquivos de tela,
   67 "já são `T`" no recorte de D1 e 80 com a folha inteira. A única
   divergência é honesta e fica escrita em vez de explicada: D1 anotou
   "78 em módulos de dado" e hoje medem-se 77. Não se achou o fantasma.

   Nada aqui sorteia e nada aqui depende de rede: o acervo é o texto do
   repositório. Duas rodadas dão a mesma saída, em qualquer máquina. */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { T, MATERIAIS, MOVIMENTO_CSS, ALVOS, TIPOS } from "../src/estilo.js";
/* D5e lê a tabela do relógio DE VOLTA, que é a lei da casa: os números
   não são transcritos aqui, são importados. No dia em que a janela deixar
   de ser 15 000 ms, o dente muda de alvo sozinho — e é isso que separa
   uma catraca de uma cópia. */
import { RITMO_DA_REACAO, TETO_DA_ESPERA } from "../src/ritmo-da-reacao.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* O `rodar-tudo.mjs` faz `process.chdir` para `testes/`, mas rodar
   `node testes/check-formas.mjs` da raiz também tem de funcionar. Quem
   decide a raiz é o diretório DESTE módulo, nunca o de trabalho. */
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const hoje = (() => { const d = new Date(); return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`; })();

/* ============================================================
   A RÉGUA, em tabela — e a régua inteira mora aqui em cima
   ============================================================ */

/* AS EXTENSÕES. Sem este filtro o scanner casa bytes dentro de PNG e
   inventa dezenas de "cores" que ninguém escreveu — aconteceu na
   medição de D1, e o `src/assets` é a armadilha. */
const EXTENSOES = [".js", ".jsx", ".ts", ".tsx", ".css", ".html"];

/* O ESCOPO: `src/**` recursivo, mais o `index.html` e o `api/*.js`.
   NUNCA `testes/` — `testes/render-teste.mjs` é bundle de esbuild
   commitado, com 56 hex que não são decisão de ninguém. */
const PASTAS = ["src", "api"];
const AVULSOS = ["index.html"];

/* D5b NÃO VARRE ESTES CINCO, e isto é ESCOPO, não perdão — por isso não
   tem data nem item de pauta que o pague.

   A razão é de jogo, e o `regente` arbitrou-a: os cinco guardam cor de
   DADO DE JOGO (cabelo, pele, olhos, bioma, facção, relação, patamar de
   devoção) dentro de tabelas nomeadas, ao lado de `rotulo` e `icone`. Os
   seis patamares de devoção são uma RAMPA que o jogador lê de uma vez;
   se `Devota` virasse `T.amber`, no dia em que alguém esquentasse o
   âmbar por contraste o patamar mudaria de cor sozinho e a rampa
   deixaria de ser rampa. Coincidir hoje não é depender.

   OS DOIS LADOS, porque a discordância foi real: o `desenho` queria-os
   DENTRO de D5b (um hex igual a `T` é uma cópia, venha de onde vier); o
   `jogo` queria-os fora (cor de dado é conteúdo, não interface). Ficou
   fora — e o `desenho` ganhou a outra metade: D5a continua a segurá-los
   pelo TAMANHO, então uma cor nova solta lá dentro fica vermelha na
   mesma. Vinte perdões escritos no dia do nascimento seria inventário
   com outro nome, e foi esse diagnóstico que reescreveu D5.

   A confirmação de que o recorte é o certo: 99 − 19 (os de dado) = 80,
   exatamente o número do item da pauta que paga D5b, "os 80 literais que
   já são T". O dente e o item que o paga medem a mesma coisa. */
const FORA_DE_D5B = [
  "src/semente.js", "src/mapa.js", "src/npcs.js", "src/palco.js", "src/devocao.js",
];

/* D5a · O TETO POR ARQUIVO. Medido em 15/09/2026.

   ARQUIVO SEM ENTRADA AQUI TEM TETO ZERO — não "não medido". É assim
   que a primeira cor solta de `api/*.js`, ou de um `painel-novo.jsx` que
   nasça amanhã, fica vermelha no dia em que nasce.

   Agrupado por família, com o motivo e o item da pauta que a paga: */
const TETO_DE_LITERAIS = {
  /* A FAMÍLIA DO APP (93) — 40 hex + 53 rgba, e 44 já são `T`. O resto é
     a paleta de sobreposição: nove fundos de véu, todos parentes de
     `T.bg` e nenhum igual a ele.
     · paga: "os 80 literais que já são T" + o helper `alfa()` */
  /* 90 desde E3: a tela da batalha saiu do `App.jsx` para
     `painel-batalha.jsx` e NÃO levou os literais consigo — as três cores
     soltas que viviam no painel de combate (o âmbar a 10% do fundo da vez,
     o halo âmbar a 13%, o `#fff` do alvo escolhido) renasceram em `T` do
     outro lado. Por isso `painel-batalha.jsx` não tem entrada nesta tabela,
     e é assim que ela fica: arquivo novo nasce com teto zero. */
  "src/App.jsx": 81, /* 23/09 · R3: o único literal que a narração ainda tinha — o `rgba(23,19,34,0.48)` do fundo do painel da prosa — virou `T.pagina`, que é a superfície quente que R2 fabricou. 82 → 81. (Esta linha é do `desenho`; foi o `oficial` que a desceu, porque a catraca tem folga zero e a dívida encolheu na tela dele.) */
  /* 16/09 · E4: os dois fundos de selo (#1f3320 e #33201f) viravam token okFundo/perigoFundo — eram CINCO copias no mesmo bloco do HUD, e a fila de quatro pilulas escritas a mao virou um map sobre a tabela dos campos da mecanica. 89 → 82 */

  /* O PERGAMINHO (71 = 41 + 30) — não é sujeira, é um SISTEMA: 10 hexes
     aparecem nos DOIS arquivos, escritos separadamente, e cobrem 52 dos
     71 usos (`#5C4A30` tinta ×11, `#F0E6CC` papel ×10, `#EADFC1`,
     `#6D5C40`, `#B4322E`, `#3A2E1C`, `#C9A45A`, `#A08A5E`, `#8D7A56`, e
     a família do mar). Dívida acidental não concorda byte a byte em dois
     arquivos. Não se conserta com `T`, que é semântica; conserta-se
     ganhando nome em `MATERIAIS`, que é a paleta física. Até lá o teto
     segura o tamanho: o pergaminho pode ser AFINADO, não pode CRESCER.
     · paga: "o pergaminho ganha nome" */
  "src/painel-mapa.jsx": 41,
  "src/planta-cidade.jsx": 30,

  /* O DADO DE JOGO (77) — fora de D5b por decisão escrita acima, e aqui
     dentro pelo mesmo motivo: o tamanho ainda é vigiado.
     · paga: "os pigmentos do dado de jogo" */
  "src/semente.js": 38,
  "src/mapa.js": 13,
  "src/npcs.js": 10,
  "src/palco.js": 10,
  "src/devocao.js": 6,

  /* A FOLHA (13) — todas `rgba` que já são `T` com alfa, todas FORA das
     zonas de tabela. Esperam o helper `alfa(cor, a)`; trocá-las à mão
     agora é escrever a fórmula treze vezes antes de ela existir, que é
     exatamente o que `src/estilo.js:110-113` avisa.
     · paga: o helper `alfa(cor, a)` */
  "src/estilo.js": 13,

  /* O DESENHO VETORIAL (68) — SVG em código, onde `fill=`/`stroke=`
     nunca passaram por decisão de tema. CORREÇÃO MEDIDA À PAUTA: estes
     NÃO são irmãos do pergaminho — são escuros e são dívida comum.
     `carta-taro.jsx` carrega 8 cores de `T` exatas e é o depósito mais
     rico de D5b fora do `App.jsx`; `rosto.jsx` tem `#EAE4D6` (= `T.ink`)
     e `#7A1F1F` (= `CABELO[8]`, cor de dado copiada para dentro da
     interface). · paga: "os 80 literais que já são T" */
  "src/carta-taro.jsx": 36,
  /* 19 desde E2: o fundo do campo era `#141020` e passou a `T.bg`. A
     diferença é invisível a olho nu e paga duas coisas — sai um literal, e
     o vão de 2 px do anel de foco, que sobre `#141020` dava 1,04:1 e não
     se separava do fundo, volta a funcionar como foi desenhado. */
  "src/grade-de-batalha.jsx": 19, /* 15/09 → 15/09 · E2, o endereço do tabuleiro */
  "src/rosto.jsx": 12,

  /* O RESTO (10) — migalhas, e o mais barato do projeto. */
  "src/painel-talentos.jsx": 4,
  "src/painel-ascensao.jsx": 3,
  "src/painel-ficha.jsx": 1,
  "src/ui.jsx": 1,

  /* O PRIMEIRO PIXEL (1) — `<body style="background:#0E0C15">` = `T.bg`.
     Possivelmente o único perdão ETERNO do projeto: o `index.html` é
     servido antes do bundle e não tem como importar `T`.
     · paga: "a cor do primeiro pixel sai de uma fonte só" — gerar a
     linha no build, ou aceitar por escrito. */
  "index.html": 1,
};
/* total 332 · `api/*.js` mede 0 hoje e NÃO recebe entrada: é o caso que
   prova que ausência da tabela é zero, e não licença. */

/* D5b · O TETO DO FÁCIL. Literal que JÁ É uma cor de `T`: hex idêntico
   (caixa ignorada), ou `rgb()`/`rgba()` cujo RGB é exatamente o de uma
   cor de `T`, com qualquer alfa.

   A soma tem de dar 80 — e 80 é exatamente o item da pauta que a zera.
   Se der 99, os cinco módulos de dado vazaram para dentro do dente. */
const TETO_DE_COR_DE_T = {
  /* 23/09 · R2: a paleta de `T` trocou de valores ("A página iluminada")
     — `bg`/`panel`/`panelSoft`/`line`/`lineStrong`/`ink`/`inkDim`/
     `violet`/`danger`/`ok`/`okFundo`/`perigoFundo` todos mudaram de hex.
     Os literais QUE JÁ EXISTIAM nestes arquivos não mudaram — ninguém os
     tocou —, mas deixaram de ser BYTE A BYTE iguais à nova `T`, e é
     exatamente isso que D5b mede. Não é dívida nova: é a dívida de
     SEMPRE (esses hexes nunca vieram de `T`, sempre foram cópias soltas)
     ficando temporariamente invisível a este dente até alguém a
     converter para `T` de verdade — o que ela sempre devia ter sido. */
  "src/App.jsx": 19, /* 15/09 → 23/09 · R2 */
  "src/estilo.js": 5, /* 15/09 → 23/09 · R2 (a zona de `T` é isenta; o que sobra são as `rgba` que esperam o helper `alfa()`) */
  "src/carta-taro.jsx": 5, /* 15/09 → 23/09 · R2 */
  "src/painel-talentos.jsx": 2,
  "src/ui.jsx": 1,
  /* SAÍRAM (ENTRADA MORTA seria pior que ausência): `src/grade-de-batalha.jsx`
     (era 5), `src/painel-ascensao.jsx` (era 1, `#7BC98F` = ok antigo),
     `src/rosto.jsx` (era 2, `#EAE4D6`×2 = ink antigo) e `index.html`
     (era 1, `#0E0C15` = bg antigo) mediram ZERO depois de R2 — os literais
     continuam lá, byte a byte iguais a ONTEM, mas ontem não é mais uma cor
     de `T`. A regra anti-cemitério tira a linha em vez de deixá-la dizer
     "0". */
};

/* AS ZONAS DE TABELA — o recorte de `src/estilo.js`.

   O `estilo.js` ENTRA no varrimento: uma catraca que perdoa a própria
   tabela não protege nada (e a sabotagem #3 prova que ele é varrido).
   Mas varrê-lo INTEIRO faria "acrescentar uma cor nova a `T`" ficar
   vermelho, e uma paleta que não pode ganhar uma cor é sagrada — o
   oposto da lei da casa. A saída é por ZONA, não por arquivo.

   D5a isenta as DUAS: as duas têm de poder ganhar entradas.
   D5b isenta só `T` e VARRE `MATERIAIS`. Comparar `T` consigo mesma
   daria 14 falsos positivos e nenhuma informação; mas `MATERIAIS` PODE
   copiar `T`, e o dia em que `cartazTopo` for `#171322` é o dia em que a
   paleta física virou um alias da semântica com outro nome. Sem esta
   metade a zona seria uma LAVANDARIA: bastava mover a duplicata para
   dentro de `MATERIAIS` e ela ficava perdoada.

   ZONA NÃO É PERDÃO, e por isso não tem data nem item que a pague: é a
   definição de onde a cor tem DIREITO de nascer. Perdão é dívida
   registrada; zona é lei. */
const ZONAS_DE_TABELA = [
  { arquivo: "src/estilo.js", tabela: "T", d5a: "isenta", d5b: "isenta" },
  { arquivo: "src/estilo.js", tabela: "MATERIAIS", d5a: "isenta", d5b: "VARRE" },
];

/* D5c · AS ANIMAÇÕES SEM SAÍDA no `prefers-reduced-motion`. Hoje 13
   classes declaram `animation`, 3 têm saída, 10 não têm.

   E a SAÍDA NÃO É O NOME: o `jogo` injetou `animation: none` nas 13 e
   jogou com elas. Quatro entradas carregam a condição no dia em que
   nascem, não como nota de rodapé — porque `none` nessas quatro é
   estritamente PIOR que a animação.

   (`.tv-agonia` é INOCENTE, ao contrário do que a pauta suspeitava:
   quando `grave`, `App.jsx:21797`/`:21799` já põe borda estática de
   `T.danger`, o anel do retrato, o rosto e a barra de PV rotulada com o
   número (esta última em `:21812`). Quatro afirmações paradas de "você
   está morrendo"; o pulso é a quinta. Parado, o jogador ainda sabe.

   Endereços conferidos em 16/09/K4 — a citação original dizia
   `:20971-20972`, um bloco que hoje fala de recalibragem de save e não
   de `grave` nenhum. Achados pelo texto que descrevem, não por conta de
   linha: a borda em `style={{ background: T.panel, border: "1px solid "
   + (feridaRecente || grave ? T.danger : T.line) }}` e o anel em
   `<Retrato ... anel={grave ? T.danger : T.amber} .../>`.) */
const SEM_SAIDA_DE_MOVIMENTO = {
  ".tv-fade":     "a aparição de todo painel · .5s",
  ".tv-slide":    "a entrada lateral · .25s",
  /* A CULPADA, e foi pega na tela: a troca de número do d20 é
     JavaScript (`setInterval` a cada 70 ms por 1200 ms,
     `App.jsx:486`) e `prefers-reduced-motion` não a toca. O `tv-dice`
     era a ÚNICA coisa a dizer "ainda rolando"; e numa falha com
     `dc != null` o fundo do resultado é `T.panelSoft` com borda âmbar,
     IDÊNTICO ao fundo do rolando. O `jogo` fotografou um hexágono
     imóvel com 19 (que passaria) que um segundo depois era 6 e
     "Falha". Sob movimento reduzido o dado não pisca: mostra um
     estado "rolando" parado e revela o valor de uma vez. */
  ".tv-dice":     "o dado a rolar · tvShake .35s + tvGlow 1s, INFINITE · SAÍDA NÃO É `none`",
  ".tv-pulse":    "o halo de atenção · tvGlow 1.6s INFINITE",
  ".tv-dano":     "o clarão do golpe · .7s",
  ".tv-agonia":   "o pulso de agonia · 1.6s INFINITE enquanto a vida < 1/3",
  /* Estas duas terminam em `opacity: 0` e só não ficam grudadas na tela
     porque um `setTimeout` as remove (3200 ms e 1400 ms). A saída tem de
     pousar no estado FINAL da animação, nunca no inicial — e onde é a
     própria animação que faz a coisa sumir, a saída não pode ser `none`. */
  ".tv-flutua":   "o dano que sobe do quadrado · 1.35s · SAÍDA NÃO É `none`",
  ".tv-faixa":    "a faixa do chefe · 3.2s · SAÍDA NÃO É `none`",
  /* `.tv-vira-verso` nasce em `rotateY(180deg)` e a animação é o que traz
     a face para a frente: `none` deixa a carta de subida de nível de
     COSTAS, permanentemente. */
  ".tv-vira":     "a virada da carta de nível · 1.1s · SAÍDA NÃO É `none`",
  ".tv-reliquia": "o brilho do espólio raro · 2.4s INFINITE",
};
/* 15/09/2026 · todas pagas por: "prefers-reduced-motion cobre as 13 animações" */

/* D5e · O TETO DO CONTADOR DE QUADRO, por arquivo. Medido em 16/09/2026.

   A DOENÇA que ele guarda: uma aba de fundo é limitada a ~1 Hz, e depois
   de alguns minutos a ~1/min. Um relógio de tela que conta TIQUES em vez
   de ler tempo mente nessa aba — mostra "7 segundos" quando passaram
   quarenta. No trilho da reação isso seria fatal: o número na tela deixa
   de ser o número do sistema, e o jogador vê uma contagem que não é a
   dele. Mesmo formato de `TETO_DE_LITERAIS`: arquivo sem entrada tem teto
   ZERO, e subir um teto é escrever a razão na própria linha.

   O BURACO, declarado com número porque um buraco calado é mentira: ele
   conta OCORRÊNCIAS DE TEXTO, e por isso não sabe distinguir um
   `setInterval` que lê o relógio de um que conta tiques. Prende a
   quantidade, não a qualidade — tal como D5a. A qualidade fica no
   comentário de cada entrada, e na revisão de quem subir o número. */
const TETO_DE_CONTADOR_DE_QUADRO = {
  /* 16/09 · E3, e estes dois NÃO contam tempo — é a distinção que o buraco
     declarado deste dente não sabe fazer, e por isso a razão fica escrita.
     São duas batidas de espera, uma vez só, para o enquadramento de
     abertura correr DEPOIS de a janela do campo ter tamanho: medido, na
     primeira passagem o campo ainda mede zero e um `scrollTo` sobre altura
     zero não faz nada, em silêncio. Nada aqui é relógio, nada aqui se
     repete, e o efeito cancela o pedido ao sair. */
  "src/painel-batalha.jsx": 2,   /* o enquadramento de abertura espera o leiaute, não conta tempo */
  "src/ui.jsx": 2,               /* as brasas, e elas estão certas: `performance.now()` */
  "src/App.jsx": 2,              /* o d20, e ele está certo: `Date.now() - inicio > 1200` */
  "src/grade-de-batalha.jsx": 1, /* DÍVIDA: `grade-de-batalha.jsx:385` conta TIQUES
                                    (`i += 1`), não tempo. Cosmético ali — a peça anda
                                    devagar numa aba de fundo e não mente sobre nada.
                                    FATAL se copiado para o trilho da reação. É este
                                    endereço que o teto guarda. */
};

/* D5e · A COLISÃO DE COINCIDÊNCIA, e ela nasceu com o dente.

   O `desenho` ensaiou D5e.1 e mediu ZERO colisões — «13 classes × 10
   números». O ensaio colheu UMA duração por classe, e `.tv-dice` declara
   DUAS: `animation: tvShake .35s …, tvGlow 1s …`. A segunda vale 1 000 ms,
   que é exactamente `aperto` E `bonusContagem` da tabela do relógio. Com a
   leitura honesta — toda duração de toda animação declarada — o dente
   nasce com uma colisão, não com zero.

   E ELA É COINCIDÊNCIA, NÃO CÓPIA: `tvGlow 1s` é o brilho do d20 a rolar
   (`App.jsx:486`), existe desde muito antes de haver relógio de reação, e
   não desenha nada que o trilho meça. Mas o dente não distingue
   coincidência de cópia — é a sua natureza declarada, a mesma de D5a — e
   por isso a coincidência fica ESCRITA, com data e razão, em vez de
   calada por um regex mais frouxo.

   A REGRA ANTI-CEMITÉRIO VALE AQUI TAL E QUAL: no dia em que `.tv-dice`
   deixar de animar 1 000 ms, a entrada SAI — não fica a dizer que houve
   colisão num sítio onde já não há. E uma colisão NOVA, em qualquer outra
   classe, fica vermelha no dia em que nasce.

   · vai à pessoa: o `desenho` mediu zero e eu meço uma; a decisão de
     afinar `tvGlow` para 1,1 s (e apagar a entrada) ou de a manter escrita
     é dela, e não minha. */
const COLISAO_DE_RELOGIO_ESCRITA = {
  ".tv-dice": 1000,  /* 16/09 · `tvGlow 1s`, o brilho do d20 — coincide com `aperto` e `bonusContagem` */
};

/* D5f · O ALVO DE TOQUE SAI DE TABELA, NUNCA DE ARITMÉTICA DE PADDING.

   A DOENÇA, com endereço e data: `App.jsx:1998` (16/09) media 27,5 px de
   alvo onde o desenho dizia 48, e NENHUM DOS DOIS NÚMEROS EXISTIA NO
   TEXTO. D5a apanha cor nova, D5b apanha cor copiada, D5c e D5e apanham
   o relógio — e os quatro ficaram cegos a uma medida de alvo, porque uma
   medida ausente não é um literal.

   D5f.1 · ALTURA LITERAL EM PEÇA DE CONTROLO. Não é tabela de teto — é
     LISTA FIXA (`ARQUIVOS_DE_PECA`) mais a regra anti-cemitério aplicada
     à nascença: o número certo aqui é sempre zero, e uma tabela que só
     soubesse dizer "0" seria a mesma dívida escrita com outro nome
     (`conferirTetos` já recusa teto 0 por isso — "ENTRADA MORTA"). Padrão
     /\bminHeight\s*:\s*\d/ nos arquivos de peça (`src/ui.jsx`,
     `src/painel-reacao.jsx`). SÓ `minHeight`, e não `height` sozinho —
     medido: os dois arquivos têm `height` literal LEGÍTIMO que não é
     alvo de toque nenhum (um losango de 8 px, um ponto de estado de
     10 px, a espessura de 4 px do trilho do relógio em
     `painel-reacao.jsx:236`), e um regex que os contasse mentiria
     dizendo que falta tabela onde já não falta — o oposto do que D5f
     existe para provar. Depois da correção K4: 0 nos dois.
   D5f.2 · A PÍLULA CHEIA À MÃO. Teto por arquivo de `rounded-full` num
     `<button>` cujo `background` é ternário para `T.amber`/`T.violet`,
     numa janela de 3 linhas ao redor (a mesma largura de busca da
     medição original do `desenho`, `mente/k4-desenho.md` §1.3). Medido
     HOJE, DEPOIS de a fila da ficha virar `PilulaDeEscolha` — é por
     isso que o teto do App desce em 1 no mesmo commit em que a fila
     nasceu, com a data na própria linha, em vez de copiar o número de
     antes da correção. QUEM SUBIR ESTE TETO MEDE OUTRA VEZ COM O SEU
     PRÓPRIO REGEX e escreve o número que ele der — um teto copiado de
     outra medição é a mentira que a tabela existe para impedir.
   D5f.3 · O PISO DO ALCANCE. `ALVOS` tem de ter >= 2 entradas e
     `ALVOS.piso >= 44`. Sem isto, renomear a tabela deixa D5f.1 a medir
     o vazio e a ficar verde — e catraca verde por vazio é pior que
     catraca nenhuma (o argumento é o de `ALCANCE_MINIMO`).

   O BURACO, declarado com número porque um buraco calado é mentira: D5f
   conta TEXTO e não sabe renderizar. Um `<button>` com `minHeight:
   ALVOS.piso` e `overflow: hidden` a cortar o rótulo passa verde. O que
   este dente prende é a ORIGEM do número, nunca a caixa desenhada; a caixa
   só se confere viva, e é por isso que a conferência no navegador continua
   por fazer. */
const ARQUIVOS_DE_PECA = ["src/ui.jsx", "src/painel-reacao.jsx"];
const TETO_DE_PILULA_A_MAO = {
  /* 12 desde E3: a pílula da bolsa de combate (`rounded-full` com o fundo em
     ternário para `T.violet`) foi com a tela da batalha, e do outro lado
     nasceu `rounded-lg` — a fileira dos verbos e as duas gavetas são
     retângulos de canto macio, não pílulas, e o alvo sai de
     `TELA_DE_BATALHA.verbos` em vez de aritmética de padding. */
  "src/App.jsx": 8,               /* 23/09 · R4b: 11 → 8. Saíram os vinte botões do painel de `Ações` e as quatro abas do momento; as três pílulas que iam com eles vão junto. (Esta linha é do `desenho`; foi o `oficial` que a desceu, porque a catraca tem folga zero e a dívida encolheu na tela dele.) · 16/09 · E3, a bolsa de combate e a gaveta das habilidades mudam de casa (era 13) */
  /* A DÍVIDA MUDOU DE ARQUIVO, NÃO NASCEU: a pílula da gaveta das
     habilidades veio inteira do `App.jsx` na etapa E3, byte a byte, e o
     teto do App desce 1 no mesmo commit em que este sobe 1 — a soma do
     projeto não se mexe. Trocá-la por `PilulaDeEscolha` é conserto de
     forma, e forma é da outra mesa. */
  "src/painel-habilidades.jsx": 1, /* 16/09 · E3, veio do App.jsx sem uma linha mudar */
  "src/grade-de-batalha.jsx": 1,
  "src/painel-codex.jsx": 1,
  "src/painel-mapa.jsx": 2,
  "src/painel-talentos.jsx": 1,
};

/* O PISO DO ALCANCE, transplantado do `pisoDoAcervo` de
   `check-protecao`. Sem ele, um bug na máscara de comentário que
   apagasse um arquivo inteiro passaria VERDE medindo nada — e catraca
   verde por vazio é pior que catraca nenhuma. */
const ALCANCE_MINIMO = {
  pisoDeArquivosComCor: 15,    /* 17 hoje */
  pisoDeLiterais: 300,         /* 332 hoje */
  pisoDeClassesDeAnimacao: 10, /* 13 hoje */
  /* PISO, e não igualdade, de propósito: `T` tem de poder ganhar a
     décima quinta cor sem ficar vermelho. O que ele guarda é o REGEX DA
     ZONA — se alguém renomear a tabela e a zona deixar de casar,
     `estilo.js` salta de 13 para 40 e a mensagem seria "SUBIU 27", que
     mente. Com o piso a falha diz a verdade: A ZONA DESAPARECEU. */
  pisoDeZona: 10,              /* T tem 14, MATERIAIS 13 */
  /* D5e.2 · O MESMO ARGUMENTO, no outro eixo: sem o piso, um regex
     partido ou uma tabela renomeada passariam VERDES a medir zero — e
     catraca verde por vazio é pior que catraca nenhuma. O piso dos
     números é 8 e hoje são 10; o das classes é o `pisoDeClassesDeAnimacao`
     que D5c já exige, e D5e.1 reusa-o de propósito (as duas medem o mesmo
     acervo, e dois pisos para um acervo divergiriam em silêncio). */
  pisoDeNumerosDoRelogio: 8,   /* 10 hoje: 600 · 1000 · 4000 · 4600 · 5000 · 5600 · 11000 · 15000 · 16600 · 33200 */
};

/* ============================================================
   A DEFINIÇÃO DE "LITERAL DE COR"
   ============================================================ */

/* A alternância do hex vai DO MAIS LONGO AO MAIS CURTO — senão
   `#EAE4D6` casa como `#EAE` e sobra `4D6`, e o arquivo inteiro conta a
   dobrar. O lookahead negativo (e não `\b`) é o que faz `#abcdefg`
   falhar inteiro em vez de casar os seis primeiros. */
const RX_HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g;

/* O `|\.\d+` do número é OBRIGATÓRIO: metade do projeto escreve
   `rgba(232,163,61,.13)`, com o alfa sem o zero da frente.
   `hsl`/`hsla` medem ZERO em todo o escopo hoje — a regra entra na mesma
   porque é grátis, e uma `hsl()` nova é a fuga exata que um teto só de
   hex não pegaria. */
const NUM = String.raw`\s*-?(?:\d+\.?\d*|\.\d+)%?\s*`;
const RX_FUNCAO = new RegExp(
  String.raw`\b(?:rgb|rgba|hsl|hsla)\(` + NUM + `[,\\s]` + NUM + `[,\\s]` + NUM + `(?:[,/]` + NUM + `)?\\)`,
  "g",
);

/* O QUE NÃO CONTA, e o veredito de cada dúvida:

   · `transparent`, `currentColor`, `none`, `inherit` — palavras-chave de
     CASCATA, não cor. Não existe entrada de `T` que as substitua.
   · NOME CSS (`white`, `black`, …) — buraco declarado no cabeçalho, com
     o número medido (1). Não é dente.
   · COR DENTRO DE COMENTÁRIO — e isto é load-bearing, não higiene:
     `src/estilo.js:45-46` cita `rgba(0,0,0,.55)` e `rgba(0,0,0,0.55)` no
     TEXTO do comentário que explica o helper `sombra()`, e
     `src/dificuldade.js:52` tem `#D86A5B` dentro de um comentário QUE
     EXISTE PARA DIZER "não escreva esta cor aqui". Sem a máscara, a
     catraca reprovaria a própria documentação que concorda com ela.
   · COR COMPOSTA POR VARIÁVEL (`rgba(0,0,0,${a})`,
     `rgba(${r},${g},${b},…)`) — regra nomeada: UMA COR SÓ É LITERAL SE
     TODOS OS COMPONENTES FOREM NÚMEROS ESCRITOS. São 7 ocorrências (os
     helpers `sombra`/`brilho` e o compositor de halo de `ui.jsx`), e uma
     função que compõe cor a partir de variável É A TABELA FUNCIONANDO —
     o oposto do defeito. O regex estrito já as recusa; está escrito aqui
     para que a recusa seja deliberada e não acidental.
   · `#fff` (3 dígitos) CONTA: 2 ocorrências, e uma delas é o pior achado
     de D1 (`App.jsx:2541`, `#fff` sobre `T.danger`, 3,42:1, reprova AA). */
const mascararComentarios = (texto, ext) => {
  const brancos = (s) => s.replace(/[^\n]/g, " "); /* o comprimento tem de sobreviver: as zonas são medidas por deslocamento */
  let s = texto.replace(/\/\*[\s\S]*?\*\//g, brancos);
  /* a guarda `[^:]` antes do `//` é o que impede `https://…` de apagar o
     resto da linha — e há dezenas de URLs em `src/`. */
  s = s.replace(/(^|[^:])\/\/[^\n]*/g, (m, antes) => antes + brancos(m.slice(antes.length)));
  if (ext === ".html") s = s.replace(/<!--[\s\S]*?-->/g, brancos);
  return s;
};

/* ============================================================
   A NORMALIZAÇÃO — o que faz duas escritas serem a MESMA cor
   ============================================================ */
const rgbDoHex = (hex) => {
  let h = hex.slice(1).toLowerCase();
  if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split("").map((c) => c + c).join("");
  else h = h.slice(0, 6); /* 8 dígitos: o alfa não muda QUE cor é */
  return h;
};
const rgbDaFuncao = (txt) => {
  const m = txt.match(/^([a-z]+)\(([^)]*)\)$/i);
  if (!m) return null;
  if (!/^rgba?$/i.test(m[1])) return null; /* `hsl()` não se compara com hex sem converter; hoje são zero, e um zero não precisa de conversor */
  const ps = m[2].split(/[,/]/).map((x) => x.trim());
  if (ps.length < 3 || ps.some((p, i) => i < 3 && (p.endsWith("%") || !/^-?\d+\.?\d*$/.test(p)))) return null;
  return ps.slice(0, 3).map((p) => (Number(p) & 255).toString(16).padStart(2, "0")).join("");
};
const CORES_DE_T = new Set(Object.values(T).map(rgbDoHex));

/* ============================================================
   O ACERVO — os arquivos do escopo
   ============================================================ */
const arquivos = [];
const andar = (rel) => {
  const abs = join(RAIZ, rel);
  if (!existsSync(abs)) return;
  for (const nome of readdirSync(abs).sort()) {
    const filho = rel + "/" + nome;
    const st = statSync(join(RAIZ, filho));
    if (st.isDirectory()) andar(filho);
    else if (EXTENSOES.some((e) => nome.endsWith(e))) arquivos.push(filho);
  }
};
for (const p of PASTAS) andar(p);
for (const a of AVULSOS) if (existsSync(join(RAIZ, a))) arquivos.push(a);

/* AS ZONAS, medidas no texto e não no import: uma zona vai da linha
   `export const <nome> = {` até a primeira linha seguinte que comece com
   `};`. Medir pelo texto é o ponto — é o texto que a varredura lê, e é o
   regex da zona que o piso guarda. */
const zonasDoArquivo = (arq, bruto) => {
  const achadas = {};
  for (const z of ZONAS_DE_TABELA) {
    if (z.arquivo !== arq) continue;
    const linhas = bruto.split("\n");
    const iAbre = linhas.findIndex((l) => new RegExp(`^export const ${z.tabela}\\s*=\\s*\\{`).test(l));
    if (iAbre < 0) continue;
    let iFecha = -1;
    for (let i = iAbre + 1; i < linhas.length; i++) if (/^\};/.test(linhas[i])) { iFecha = i; break; }
    if (iFecha < 0) continue;
    let ini = 0;
    for (let i = 0; i < iAbre; i++) ini += linhas[i].length + 1;
    let fim = ini;
    for (let i = iAbre; i <= iFecha; i++) fim += linhas[i].length + 1;
    achadas[z.tabela] = { ini, fim, ...z };
  }
  return achadas;
};

const d5a = {}, d5b = {};
const zonasMedidas = {};
let literaisNoTexto = 0;
for (const arq of arquivos) {
  const bruto = readFileSync(join(RAIZ, arq), "utf8");
  const ext = "." + arq.split(".").pop();
  const texto = mascararComentarios(bruto, ext);
  const zonas = zonasDoArquivo(arq, bruto);
  const foraDeD5b = FORA_DE_D5B.includes(arq);

  const achados = [];
  for (const rx of [RX_HEX, RX_FUNCAO]) {
    rx.lastIndex = 0;
    let m;
    while ((m = rx.exec(texto)) !== null) achados.push({ txt: m[0], i: m.index });
  }
  for (const { txt, i } of achados) {
    const dentro = Object.values(zonas).find((z) => i >= z.ini && i < z.fim);
    const rgb = txt[0] === "#" ? rgbDoHex(txt) : rgbDaFuncao(txt);
    const eDeT = rgb !== null && CORES_DE_T.has(rgb);
    if (dentro) zonasMedidas[dentro.tabela] = (zonasMedidas[dentro.tabela] || 0) + 1;
    literaisNoTexto++;
    if (!dentro || dentro.d5a !== "isenta") d5a[arq] = (d5a[arq] || 0) + 1;
    if (eDeT && !foraDeD5b && (!dentro || dentro.d5b !== "isenta")) d5b[arq] = (d5b[arq] || 0) + 1;
  }
}

/* ============================================================
   A REGRA ANTI-CEMITÉRIO — folga zero, nos DOIS sentidos

   A asserção não é `medido <= teto`, é `medido === teto`. Um teto é um
   RETRATO DATADO DA DÍVIDA, não um alvo. Com `<=` ele vira orçamento: a
   dívida cai para 40, a tabela continua a dizer 93, e o dia em que
   alguém volta a pôr 50 literais a catraca aplaude. Com igualdade, o
   número na tabela é sempre verdade e pode ser citado sem ninguém ir
   medir de novo — é o que faz o `teste-ligacao` valer: a lista de perdão
   só vale enquanto é EXATA.

   Folga de N: recusada. Uma folga de 2 é licença permanente para dois
   literais novos por ciclo — a dívida a crescer em passo invisível.

   A VÁLVULA, escrita: um teto PODE subir, com motivo e data na própria
   entrada. Não é licença, é custo — a linha aparece no diff e a pessoa
   pergunta. O que a catraca proíbe é subir CALADO.
   ============================================================ */
const conferirTetos = (medido, teto, achado, conserto) => {
  const linhas = [];
  /* A MESMA REGRA ANTI-CEMITÉRIO, virada para a própria tabela. A
     igualdade sozinha não a impõe: uma entrada que diz `0` e mede `0`
     passa verde para sempre, e o livro fica a registar uma dívida que já
     foi paga. Quando um teto chega a zero a ENTRADA SAI — porque a
     tabela é lida por gente, e uma linha que diz "aqui houve dívida" num
     arquivo que já está limpo manda consertar o que não existe. */
  for (const [arq, x] of Object.entries(teto)) {
    if (x === 0) linhas.push(`ENTRADA MORTA: ${arq} tem teto 0. A dívida foi paga — tire a linha da tabela em vez de a deixar a dizer zero.`);
  }
  for (const arq of [...new Set([...Object.keys(teto), ...Object.keys(medido)])].sort()) {
    const m = medido[arq] || 0, x = teto[arq] || 0;
    if (m === x) continue;
    const d = m - x;
    /* A MENSAGEM TEM DE TER DOIS TEXTOS, não um: a falha é a mesma, a
       instrução é oposta — e a segunda imprime a linha pronta para colar.
       E os dois dentes também dizem coisas diferentes: D5a achou COR, D5b
       achou CÓPIA, e o conserto de cada um é outro. Quem lê o vermelho
       tem de saber qual dos dois é sem ir ler o código do varredor. */
    if (d > 0) linhas.push(`SUBIU: ${arq} tem ${m}, o teto é ${x}. ${d} ${d > 1 ? achado.plural : achado.singular} — ${conserto}`);
    else linhas.push(`DESCEU: ${arq} tem ${m}, o teto é ${x}. A dívida encolheu; desça o teto:\n        "${arq}": ${m}, /* 15/09 → ${hoje} */`);
  }
  return linhas;
};

/* ============================================================
   1. O ALCANCE — a varredura chegou ao repositório inteiro
   ============================================================ */
sec("1. o alcance — catraca verde por vazio é pior que catraca nenhuma");
const comCor = Object.keys(d5a).filter((a) => d5a[a] > 0).length;
/* O piso conta o que D5a conta — os literais FORA das zonas —, e não o
   texto todo. Se contasse os 27 de dentro das zonas, o piso passaria a
   guardar também a saúde da tabela, que é justamente a parte que tem
   direito de crescer: o número medido deixaria de ser comparável com o
   332 que a tabela de tetos soma, e as duas contas divergiriam sem que
   nada estivesse errado. */
const somaA = Object.values(d5a).reduce((a, b) => a + b, 0);
console.log(`  ··  ${arquivos.length} arquivos no escopo (src/** + api/*.js + index.html) · ${comCor} com cor literal · ${somaA} literais fora das zonas (${literaisNoTexto} no texto todo)`);
t(`a varredura acha cor em pelo menos ${ALCANCE_MINIMO.pisoDeArquivosComCor} arquivos`,
  comCor >= ALCANCE_MINIMO.pisoDeArquivosComCor, `achou em ${comCor}`);
t(`e acha pelo menos ${ALCANCE_MINIMO.pisoDeLiterais} literais no total`,
  somaA >= ALCANCE_MINIMO.pisoDeLiterais, `achou ${somaA}`);
for (const z of ZONAS_DE_TABELA) {
  const n = zonasMedidas[z.tabela] || 0;
  t(`a zona "${z.tabela}" de ${z.arquivo} continua a casar (pelo menos ${ALCANCE_MINIMO.pisoDeZona} cores)`,
    n >= ALCANCE_MINIMO.pisoDeZona, n === 0 ? `A ZONA "${z.tabela}" DESAPARECEU — renomearam a tabela, ou o formato mudou. Sem a zona, ${z.arquivo} mede a si mesmo e a mensagem de teto mente.` : `a zona mede ${n}`);
}

/* ============================================================
   2. D5a — a QUANTIDADE
   ============================================================ */
sec("2. D5a — a cor NOVA, de qualquer forma e qualquer valor");
console.log(`  ··  ${somaA} literais fora das zonas de tabela, em ${comCor} arquivos`);
console.log(`  ··  os cinco maiores: ${Object.entries(d5a).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([a, n]) => `${a} ${n}`).join(" · ")}`);
const falhasA = conferirTetos(d5a, TETO_DE_LITERAIS,
  { singular: "literal novo", plural: "literais novos" },
  "use T, ou escreva por que não dá.");
t("nenhum arquivo passou do teto de literais — e nenhum ficou abaixo dele (folga zero)",
  falhasA.length === 0, falhasA.join("\n      "));

/* ============================================================
   3. D5b — a QUALIDADE
   ============================================================ */
sec("3. D5b — a cor DUPLICADA: o literal que já tem nome em T");
const somaB = Object.values(d5b).reduce((a, b) => a + b, 0);
console.log(`  ··  ${somaB} literais são, byte a byte, uma cor de T (o item da pauta que os zera diz 80)`);
console.log(`  ··  por arquivo: ${Object.entries(d5b).sort((a, b) => b[1] - a[1]).map(([a, n]) => `${a} ${n}`).join(" · ")}`);
const falhasB = conferirTetos(d5b, TETO_DE_COR_DE_T,
  { singular: "cópia de uma cor que já tem nome em T", plural: "cópias de cores que já têm nome em T" },
  "troque o literal pela entrada de T; a contagem de D5a nem se mexe.");
t("nenhum arquivo ganhou uma cópia de T — e nenhum perdeu uma sem descer o teto",
  falhasB.length === 0, falhasB.join("\n      "));

/* A OUTRA METADE DA ZONA, e é ela que impede a lavandaria: `MATERIAIS` é
   varrido por D5b porque, se não fosse, bastava mover a duplicata para
   dentro dele e ela ficava perdoada. Medido: ZERO — e é um zero que
   significa alguma coisa, por isso é medido e não presumido. */
const materiaisQueCopiamT = Object.entries(MATERIAIS)
  .filter(([, v]) => { const rgb = v[0] === "#" ? rgbDoHex(v) : rgbDaFuncao(v); return rgb !== null && CORES_DE_T.has(rgb); })
  .map(([k, v]) => `${k}: ${v}`);
t("a paleta física não é um alias da semântica — nenhuma entrada de MATERIAIS repete uma cor de T",
  materiaisQueCopiamT.length === 0, materiaisQueCopiamT.join(" | "));

/* ============================================================
   4. D5c — O MOVIMENTO
   ============================================================ */
sec("4. D5c — quem anda na tela tem de saber parar");
/* NÃO ANCORE EM `\}`: o `MOVIMENTO_CSS` tem `@keyframes` com chaves
   ANINHADAS, e um scanner ingênuo perde `.tv-fade`, `.tv-pulse` e
   `.tv-anel-dentro` EM SILÊNCIO — acha 10 de 13 e parece certo. Só
   BLOCO-FOLHA: o `[^{}]*` exclui o invólucro do `@keyframes`, e a
   exigência de `.` no seletor exclui os passos `0%,100%{…}` de dentro
   dele. É também o que impede que `.tv-vira-palco`, `.tv-vira-face` e
   `.tv-vira-verso` entrem na conta: elas declaram
   `perspective`/`backface-visibility` e nenhuma animação, e são
   exatamente as três que `src/estilo.js:116-119` avisa que não se pode
   "limpar". */
const RX_REGRA = /(\.[A-Za-z][\w-]*(?:\s*,\s*\.[A-Za-z][\w-]*)*)\s*\{([^{}]*)\}/g;
const iMedia = MOVIMENTO_CSS.indexOf("@media (prefers-reduced-motion");
const antes = iMedia < 0 ? MOVIMENTO_CSS : MOVIMENTO_CSS.slice(0, iMedia);
const dentroDoMedia = iMedia < 0 ? "" : MOVIMENTO_CSS.slice(iMedia);

const colher = (texto, filtro) => {
  const achou = new Set();
  RX_REGRA.lastIndex = 0;
  let m;
  while ((m = RX_REGRA.exec(texto)) !== null) {
    if (!filtro(m[2])) continue;
    for (const s of m[1].split(",")) achou.add(s.trim());
  }
  return achou;
};
const queAnimam = colher(antes, (corpo) => /animation\s*:/.test(corpo));
const comSaida = colher(dentroDoMedia, (corpo) => /animation\s*:\s*none/.test(corpo));
const semSaida = [...queAnimam].filter((c) => !comSaida.has(c)).sort();

console.log(`  ··  ${queAnimam.size} classes declaram animation · ${[...queAnimam].filter((c) => comSaida.has(c)).length} com saída no @media · ${semSaida.length} sem`);
t(`a varredura do CSS alcança pelo menos ${ALCANCE_MINIMO.pisoDeClassesDeAnimacao} classes com animation`,
  queAnimam.size >= ALCANCE_MINIMO.pisoDeClassesDeAnimacao, `achou ${queAnimam.size} — o RX_REGRA deixou de casar bloco-folha?`);

const novasSemSaida = semSaida.filter((c) => !(c in SEM_SAIDA_DE_MOVIMENTO));
t("nenhuma animação nova nasceu sem saída no prefers-reduced-motion",
  novasSemSaida.length === 0,
  novasSemSaida.map((c) => `NOVA ANIMAÇÃO SEM SAÍDA: ${c} não está no prefers-reduced-motion.`).join("\n      "));

/* O DENTE ANTI-CEMITÉRIO, e é o único do projeto que falha por causa de
   uma MELHORIA. É de propósito: um perdão é uma dívida registrada, e uma
   dívida paga que continua no livro é um livro falso. Quando um teto de
   D5b chegar a zero, a entrada SAI da tabela — não fica a dizer `0`. */
const perdoesMortos = Object.keys(SEM_SAIDA_DE_MOVIMENTO).filter((c) => !semSaida.includes(c));
t("e nenhum perdão sobrou no livro depois de a dívida ter sido paga",
  perdoesMortos.length === 0,
  perdoesMortos.map((c) => `PERDÃO MORTO: ${c} já está no prefers-reduced-motion. Tire-a de SEM_SAIDA_DE_MOVIMENTO.`).join("\n      "));

/* ============================================================
   5. D5e — O RELÓGIO DA TELA CONTA TEMPO, NUNCA QUADROS

   Vem a seguir a D5c porque partilha com ele o `RX_REGRA` e o
   `MOVIMENTO_CSS` já importado — e porque é o mesmo acervo visto por
   outro eixo: D5c pergunta se a animação sabe PARAR, D5e pergunta se ela
   sabe que horas são.
   ============================================================ */
sec("5. D5e — o relógio da tela conta tempo, nunca quadros");

/* OS NÚMEROS DO RELÓGIO, lidos da tabela e não transcritos: as seis
   grandezas de tempo de cada linha de `RITMO_DA_REACAO`, as somas
   `trilho + bónus` (que é o que a tela de facto desenha quando os bónus
   entram — os bónus engordam o TRILHO, nunca a folga), e os dois tetos.
   O `parado` contribui zero, e zero não é duração de nada. */
const numerosDoRelogio = new Set();
for (const linha of RITMO_DA_REACAO) {
  for (const k of ["janela", "folga", "trilho", "aperto", "bonusContagem", "bonusToque"]) if (linha[k] > 0) numerosDoRelogio.add(linha[k]);
  if (linha.trilho > 0) {
    if (linha.bonusContagem) numerosDoRelogio.add(linha.trilho + linha.bonusContagem);
    if (linha.bonusToque) numerosDoRelogio.add(linha.trilho + linha.bonusToque);
    if (linha.bonusContagem || linha.bonusToque) numerosDoRelogio.add(linha.trilho + (linha.bonusContagem || 0) + (linha.bonusToque || 0));
  }
}
for (const k of ["msPorRodada", "msEntreRespostas"]) if (TETO_DA_ESPERA[k] > 0) numerosDoRelogio.add(TETO_DA_ESPERA[k]);

/* AS DURAÇÕES DAS ANIMAÇÕES. Duas armadilhas, e as duas mordem em
   silêncio:

   (1) FATIAR POR VÍRGULA DE TOPO. `.tv-vira` declara
       `cubic-bezier(.2,.7,.3,1)`, e um `split(",")` ingénuo parte a
       função ao meio — o pedaço `1) .45s both` passaria a parecer uma
       segunda animação de 450 ms que não existe.
   (2) A PRIMEIRA GRANDEZA DE TEMPO É A DURAÇÃO; A SEGUNDA É O ATRASO.
       Só a duração interessa: um atraso não desenha nada, e `.tv-vira`
       tem um de 450 ms que não é relógio de coisa nenhuma.

   E colhe-se TODA animação da abreviada, não só a primeira: `.tv-dice`
   declara duas (`tvShake .35s` e `tvGlow 1s`), e é exactamente a segunda
   que colide — ver `COLISAO_DE_RELOGIO_ESCRITA`. */
const fatiarNoTopo = (s) => {
  const partes = []; let nivel = 0, atual = "";
  for (const ch of s) {
    if (ch === "(") nivel++;
    else if (ch === ")") nivel--;
    if (ch === "," && nivel === 0) { partes.push(atual); atual = ""; } else atual += ch;
  }
  partes.push(atual);
  return partes;
};
const duracoesDaRegra = (corpo) => {
  const out = [];
  for (const decl of corpo.matchAll(/animation\s*:\s*([^;]+)/g)) {
    for (const parte of fatiarNoTopo(decl[1])) {
      const tempos = [...parte.matchAll(/(-?\d*\.?\d+)\s*(ms|s)\b/g)];
      if (!tempos.length) continue;
      const [, n, u] = tempos[0];
      out.push(u === "s" ? Math.round(parseFloat(n) * 1000) : Math.round(parseFloat(n)));
    }
  }
  return out;
};

const colisoes = [];
const duracoesVistas = [];
const duracoesPorClasse = {};   /* por classe, para que o dente anti-cemitério meça a CLASSE e não o acervo */
RX_REGRA.lastIndex = 0;
{
  let m;
  while ((m = RX_REGRA.exec(antes)) !== null) {
    if (!/animation\s*:/.test(m[2])) continue;
    const classes = m[1].split(",").map((s) => s.trim());
    for (const ms of duracoesDaRegra(m[2])) {
      duracoesVistas.push(ms);
      for (const c of classes) (duracoesPorClasse[c] = duracoesPorClasse[c] || []).push(ms);
      if (!numerosDoRelogio.has(ms)) continue;
      for (const c of classes) if (COLISAO_DE_RELOGIO_ESCRITA[c] !== ms) colisoes.push(`${c} anima ${ms} ms, que é um número do relógio da reação (RITMO_DA_REACAO / TETO_DA_ESPERA).`);
    }
  }
}

console.log(`  ··  ${queAnimam.size} classes com animation · ${new Set(duracoesVistas).size} durações distintas · ${numerosDoRelogio.size} números do relógio: ${[...numerosDoRelogio].sort((a, b) => a - b).join(" · ")}`);

/* D5e.2 — O PISO PRIMEIRO, porque um dente que mede zero fica verde por
   vazio e parece que cumpriu. */
t(`D5e.2 · a varredura lê pelo menos ${ALCANCE_MINIMO.pisoDeNumerosDoRelogio} números da tabela do relógio`,
  numerosDoRelogio.size >= ALCANCE_MINIMO.pisoDeNumerosDoRelogio,
  numerosDoRelogio.size === 0 ? "A TABELA DESAPARECEU — renomearam `RITMO_DA_REACAO` ou as chaves de tempo, e o dente mede o vazio." : `leu ${numerosDoRelogio.size}`);
t(`D5e.2 · e alcança pelo menos ${ALCANCE_MINIMO.pisoDeClassesDeAnimacao} classes com animation (o mesmo acervo de D5c)`,
  queAnimam.size >= ALCANCE_MINIMO.pisoDeClassesDeAnimacao, `achou ${queAnimam.size}`);
t("D5e.2 · e colhe pelo menos uma duração por classe que anima",
  duracoesVistas.length >= queAnimam.size, `colheu ${duracoesVistas.length} durações para ${queAnimam.size} classes — o regex da abreviada partiu?`);

/* D5e.1 — A COLISÃO. A tela não pode desenhar o relógio do sistema com um
   número copiado: a duração da janela sai de `ritmoDaRodada`, que a lê da
   tabela, e não de um `.tv-alguma-coisa` que a repete em CSS. Um número
   copiado não muda no dia em que a janela mudar — e aí a barra mente. */
t("D5e.1 · nenhuma classe de MOVIMENTO_CSS anima uma duração do relógio da reação",
  colisoes.length === 0, colisoes.join("\n      "));

/* O DENTE ANTI-CEMITÉRIO, o mesmo de D5c: uma colisão escrita que já não
   existe é um livro falso. */
const colisoesMortas = Object.entries(COLISAO_DE_RELOGIO_ESCRITA)
  .filter(([c, ms]) => !((duracoesPorClasse[c] || []).includes(ms)))
  .map(([c, ms]) => `COLISÃO MORTA: ${c} já não anima ${ms} ms. Tire a linha de COLISAO_DE_RELOGIO_ESCRITA.`);
t("e nenhuma colisão sobrou no livro depois de ter sido desfeita",
  colisoesMortas.length === 0, colisoesMortas.join("\n      "));

/* D5e.3 — O CONTADOR DE QUADRO. Um teto por arquivo, congelado no retrato
   de hoje: K3 não pode acrescentar um contador sem subir o teto à mão, e
   subir o teto é escrever a razão. */
const contadores = {};
for (const arq of arquivos) {
  if (!arq.startsWith("src/")) continue;
  const ext = "." + arq.split(".").pop();
  const texto = mascararComentarios(readFileSync(join(RAIZ, arq), "utf8"), ext);
  const n = (texto.match(/\b(?:setInterval|requestAnimationFrame)\s*\(/g) || []).length;
  if (n) contadores[arq] = n;
}
console.log(`  ··  ${Object.values(contadores).reduce((a, b) => a + b, 0)} contadores de quadro em ${Object.keys(contadores).length} arquivos: ${Object.entries(contadores).map(([a, n]) => `${a} ${n}`).join(" · ")}`);
const falhasE = conferirTetos(contadores, TETO_DE_CONTADOR_DE_QUADRO,
  { singular: "contador de quadro novo", plural: "contadores de quadro novos" },
  "leia o relógio em vez de contar tiques, ou suba o teto com a razão escrita na própria linha.");
t("D5e.3 · nenhum arquivo ganhou um contador de quadro — e nenhum perdeu um sem descer o teto (folga zero)",
  falhasE.length === 0, falhasE.join("\n      "));

/* ============================================================
   6. D5f — O ALVO DE TOQUE SAI DE TABELA, NUNCA DE ARITMÉTICA DE PADDING
   ============================================================ */
sec("6. D5f — o alvo de toque sai de tabela, nunca de aritmética de padding");

/* D5f.3 primeiro — o piso, porque um dente que mede o vazio de uma
   tabela renomeada fica verde por vazio e parece que cumpriu. */
t("D5f.3 · ALVOS tem pelo menos 2 entradas", Object.keys(ALVOS).length >= 2,
  Object.keys(ALVOS).length === 0 ? "A TABELA DESAPARECEU — renomearam ALVOS, e os dentes abaixo medem o vazio." : `tem ${Object.keys(ALVOS).length}`);
t("D5f.3 · ALVOS.piso >= 44 — o piso do WCAG 2.5.5 (AAA)", (ALVOS.piso || 0) >= 44, `piso é ${ALVOS.piso}`);

/* D5f.1 · ALTURA LITERAL EM PEÇA DE CONTROLO — só `minHeight`, nunca
   `height` sozinho (ver o motivo, escrito com a tabela acima). Não é
   `conferirTetos`: o número certo aqui é sempre zero, e um teto que só
   soubesse dizer "0" seria "ENTRADA MORTA" pela própria regra
   anti-cemitério que os outros dentes já aplicam. */
const falhasF1 = [];
for (const arq of ARQUIVOS_DE_PECA) {
  const abs = join(RAIZ, arq);
  if (!existsSync(abs)) { falhasF1.push(`${arq} desapareceu — ARQUIVOS_DE_PECA mede um arquivo que não existe mais.`); continue; }
  const ext = "." + arq.split(".").pop();
  const texto = mascararComentarios(readFileSync(abs, "utf8"), ext);
  const n = (texto.match(/\bminHeight\s*:\s*\d/g) || []).length;
  if (n > 0) falhasF1.push(`${arq} tem ${n} altura literal (minHeight: <dígito>) — a altura de uma peça de controlo sai de ALVOS, nunca de um número escrito à mão.`);
}
console.log(`  ··  altura literal (minHeight: <dígito>) em ${ARQUIVOS_DE_PECA.length} arquivos de peça: ${falhasF1.length === 0 ? "nenhuma" : falhasF1.length + " achados"}`);
t("D5f.1 · nenhum arquivo de peça tem altura literal de controlo",
  falhasF1.length === 0, falhasF1.join("\n      "));

/* D5f.2 · A PÍLULA CHEIA À MÃO — <button> com `rounded-full` cujo
   `background` é um ternário para `T.amber`/`T.violet`, numa janela de
   3 linhas ao redor. A mesma assinatura da medição original do
   `desenho` (`mente/k4-desenho.md` §1.3), reproduzida aqui com regex
   próprio, como a lei da casa exige. */
const pilulaAMao = {};
for (const arq of arquivos) {
  const ext = "." + arq.split(".").pop();
  const texto = mascararComentarios(readFileSync(join(RAIZ, arq), "utf8"), ext);
  const linhas = texto.split("\n");
  let n = 0;
  for (let i = 0; i < linhas.length; i++) {
    if (!/rounded-full/.test(linhas[i])) continue;
    const janela = linhas.slice(Math.max(0, i - 3), Math.min(linhas.length, i + 4)).join("\n");
    if (/<button/.test(janela) && /background:\s*[^,{}]*\?\s*T\.(amber|violet)/.test(janela)) n++;
  }
  if (n) pilulaAMao[arq] = n;
}
const totalPilulaAMao = Object.values(pilulaAMao).reduce((a, b) => a + b, 0);
console.log(`  ··  ${totalPilulaAMao} pílulas cheias à mão: ${Object.entries(pilulaAMao).map(([a, n]) => `${a} ${n}`).join(" · ")}`);
const falhasF2 = conferirTetos(pilulaAMao, TETO_DE_PILULA_A_MAO,
  { singular: "pílula cheia à mão nova", plural: "pílulas cheias à mão novas" },
  "use PilulaDeEscolha (src/ui.jsx), ou escreva por que a peça não serve.");
t("D5f.2 · nenhum arquivo ganhou uma pílula cheia à mão — e nenhum perdeu uma sem descer o teto (folga zero)",
  falhasF2.length === 0, falhasF2.join("\n      "));

/* ============================================================
   7. D5g — A LETRA ABAIXO DO PISO NÃO CRESCE (R2)

   `TIPOS` (`estilo.js`) nasceu em R2 com um piso escrito: 12 px, um
   degrau acima do que a Apple HIG (11 pt) e o Material (11 sp) toleram.
   A dívida que já existe é grande — R1 mediu 363 de 575 tamanhos de
   letra do projeto abaixo de 12 px, 76% só na tela principal — e ela
   NÃO se converte numa etapa só: seria trocar 651 lugares de uma vez,
   sem um único olho de `desenho` a conferir cada tela depois.

   O QUE ESTE DENTE FAZ, e é deliberadamente menos do que D5a/D5b: ele
   NÃO exige que a dívida encolha (a conversão é trabalho de várias
   etapas futuras) — só que ela PARE DE CRESCER enquanto isso não
   acontece. Por isso não é a regra anti-cemitério de folga zero dos
   outros dentes (que cobra IGUALDADE, nos dois sentidos): aqui um
   `medido < teto` também passa — descer é sempre permitido, e nem
   precisa de comentário, porque descer é o objetivo final. Só SUBIR
   falha.

   O QUE ELE CONTA: toda ocorrência de `text-[8px]`, `text-[9px]`,
   `text-[10px]` ou `text-[11px]` em `src/` — os quatro tamanhos abaixo
   de `TIPOS.piso`. `text-[12px]` para cima não conta: já cumpre o piso.
   Usa a mesma máscara de comentário dos outros dentes, para não contar
   um `text-[9px]` citado dentro de uma explicação como se fosse código. */
sec("7. D5g — a letra abaixo do piso não cresce");

/* O PISO PRIMEIRO, sempre — o mesmo argumento de D5f.3: um dente que
   mede uma tabela renomeada ou vazia passa VERDE por vazio, e catraca
   verde por vazio é pior que catraca nenhuma. */
t("D5g · TIPOS tem os sete degraus", Object.keys(TIPOS).length >= 7,
  Object.keys(TIPOS).length === 0 ? "A TABELA DESAPARECEU — renomearam TIPOS, e o dente abaixo mede o vazio." : `tem ${Object.keys(TIPOS).length}`);
t("D5g · TIPOS.piso === 12 — nada abaixo disto tem letra", TIPOS.piso === 12, `piso é ${TIPOS.piso}`);

const RX_LETRA_ABAIXO_DO_PISO = /text-\[(?:8|9|10|11)px\]/g;
const porTamanhoAbaixoDoPiso = { 8: 0, 9: 0, 10: 0, 11: 0 };
let letraAbaixoDoPiso = 0;
for (const arq of arquivos) {
  if (!arq.startsWith("src/")) continue;
  const ext = "." + arq.split(".").pop();
  const texto = mascararComentarios(readFileSync(join(RAIZ, arq), "utf8"), ext);
  RX_LETRA_ABAIXO_DO_PISO.lastIndex = 0;
  let m;
  while ((m = RX_LETRA_ABAIXO_DO_PISO.exec(texto)) !== null) {
    letraAbaixoDoPiso++;
    porTamanhoAbaixoDoPiso[Number(m[0].slice(6, -3))]++;
  }
}
/* O RETRATO DE HOJE (23/09/2026, R2), a única vez que este número pode
   ser escrito de memória — daqui em diante ele só desce, e quem o
   baixar troca o comentário pela data do dia. */
const TETO_DE_LETRA_ABAIXO_DO_PISO = 653; /* 8px:12 · 9px:223 · 10px:311 · 11px:107, em src/ inteiro */
console.log(`  ··  ${letraAbaixoDoPiso} usos de text-[Npx] abaixo do piso (8px:${porTamanhoAbaixoDoPiso[8]} · 9px:${porTamanhoAbaixoDoPiso[9]} · 10px:${porTamanhoAbaixoDoPiso[10]} · 11px:${porTamanhoAbaixoDoPiso[11]})`);
t(`D5g · a letra abaixo do piso não sobe do retrato de hoje (${TETO_DE_LETRA_ABAIXO_DO_PISO})`,
  letraAbaixoDoPiso <= TETO_DE_LETRA_ABAIXO_DO_PISO,
  letraAbaixoDoPiso > TETO_DE_LETRA_ABAIXO_DO_PISO
    ? `SUBIU: ${letraAbaixoDoPiso} contra o teto de ${TETO_DE_LETRA_ABAIXO_DO_PISO}. Nasceu letra nova abaixo de TIPOS.piso — use TIPOS.rotulo (13) ou maior.`
    : `desceu para ${letraAbaixoDoPiso} — pode baixar o teto para ${letraAbaixoDoPiso}, com a data de hoje no comentário.`);

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
