/* ============================================================
   AS AÇÕES DO JOGADOR (X1) — a tabela nomeada da medição

   POR QUE ELA EXISTE. A Fase X nasceu de um achado jogando: dos 20
   botões do painel de Ações, nenhum é de combate, e `Atacar` não ataca —
   ele digita "Ataco " na caixa de texto. Três ataques declarados num
   combate aberto deram zero rolagens, e sete turnos fecharam com os
   mesmos PV 20/20, PM 6/6, XP 89/300.

   X1 mediu isso e CONFIRMOU. Esta tabela é o resultado da medição, e
   existe porque um relatório que ninguém relê não é régua: o achado
   central de X1 — a abertura fora de alcance — precisa de um lugar que
   a suíte leia de volta, e é este.

   ---------------- ONDE ELA MORA, E POR QUÊ ----------------

   Em `testes/` e não em `src/`, pelo precedente que N1 abriu com
   `ADVERSARIO_NA_REGUA`: instrumentação não é regra de jogo. `src/` é o
   motor, o que o jogador vive; uma tabela que descreve o que o jogador
   NÃO consegue fazer é medida, não mecânica. Decisão registrada pelo
   coordenador no diário.

   ---------------- O QUE ESTA TABELA NÃO É ----------------

   Ela não conserta nada. X1 mede; X2 é quem faz o botão chamar o motor.
   O valor dela é ser a linha de base: X4 vai repetir esta mesma conta
   depois de X2, e os dois números têm de ser comparáveis.

   ---------------- O MÉTODO, PARA PODER SER REFEITO ----------------

   As sondas rodam os MÓDULOS PUROS de verdade (`turno.js`, `desafios.js`,
   `agressao.js`, `grid.js`) em Node, sem React e sem IA. A fiação do
   `App.jsx` foi lida como TEXTO e modelada — é a limitação honesta da
   medição, e é por isso que `check-acoes-do-jogador.mjs` re-deriva do
   código o que aqui se declara: a parte modelada é a que pode apodrecer.
   ============================================================ */

/* ============================================================
   1. O CONJUNTO FECHADO — o que o jogador consegue disparar hoje

   DOIS EIXOS, E NÃO UM SÓ. Confundi-los foi o primeiro erro desta
   medição, e ele apagaria justamente a manchete de X1. Uma ação pode ter
   a FRASE chegando ao motor enquanto o CLIQUE não dispara nada: "Saltar"
   casa um desafio e rola o dado — mas só depois de o jogador completar a
   frase e apertar Agir. O botão, sozinho, não rolou coisa nenhuma.

   `cliqueChega` — o que o CLIQUE sozinho dispara:
     "motor" — o clique já muda um número (as 8 rápidas, mover, bolsa)
     "caixa" — o clique só escreve na caixa de texto (as 12 prontas)
     "nada"  — não há botão; é o teclado

   ---------------- O EIXO DO CLIQUE VIROU CONDICIONAL (X2) ----------------

   X1 escreveu `cliqueChega` como um valor só porque, em X1, um valor só
   bastava: nenhum botão do painel se comportava de dois jeitos. X2 criou
   o primeiro que se comporta. `Atacar`, com a luta ABERTA, chama
   `declararGolpe` (`src/App.jsx:12414`) e entra no motor; FORA da luta
   ele continua enchendo a caixa — e isso não é meio-conserto, é desenho:
   é pela FRASE que a briga começa (a porta `agressao` de `turno.js` só
   abre fora do combate), e trocar o botão fora da luta tiraria do
   jogador o começo da briga.

   COMO ISSO É REPRESENTADO, E POR QUÊ ASSIM. `cliqueChega` passa a
   significar *o que o clique dispara NA MESA DE COMBATE*, e ganha ao
   lado um `cliqueChegaFora`, escrito só quando os dois diferem (hoje,
   só em `pronta_atacar`).

   Três razões para o eixo principal ser o de DENTRO da luta:
     · a catraca de X2 é sobre combate — medir o clique fora da luta e
       chamar isso de "a ação de combate não chega ao motor" seria contar
       um mundo que não é o recorte;
     · as outras 29 entradas não mudam de valor com essa definição (as 11
       prontas restantes enchem a caixa nos dois mundos, as 8 rápidas
       entram no motor nos dois, e mover/bolsa/heroísmo só existem em
       combate), então `contarPorClique()` continua sendo UM número e não
       dois — e um número que já não é comparável não é régua;
     · um campo opcional que só aparece na exceção mantém a exceção
       visível. Se amanhã um segundo botão virar condicional, ele tem de
       escrever `cliqueChegaFora` também, e a divergência fica escrita em
       vez de virar folclore.

   O QUE ESTE CAMPO NÃO É: não é estado do código. Não existe em
   `App.jsx` nenhuma variável "modo do botão" — existe um `golpeVivo`
   (`:21087`), que é `rotulo === "Atacar" && !!vdGolpe`, e um `vdGolpe`
   que é `null` sem combate. A condicional é essa, e nada mais.

   `textoFora` / `textoLuta` — onde a FRASE enviada termina, e é medido
   duas vezes porque o jogo é dois:
     "motor" — há código que muda um número sem a IA
     "cena"  — vai ao Mestre, e só ele decide se aconteceu
     null    — a ação não passa por texto

   A porta `agressao` (`src/turno.js:217`) abre só fora da luta, e é essa
   linha que separa os dois mundos do texto.

   A CATRACA DE X2 anda no eixo do CLIQUE: ação de combate cujo
   `cliqueChega` não é "motor". É essa lista que só pode encolher —
   porque a promessa de X2 é que o dado role PORQUE O JOGADOR CLICOU.
   ============================================================ */
export const ACOES_DO_JOGADOR = [
  /* ---------------- AS 12 DO PAINEL "AÇÕES" — APOSENTADAS EM R4b ----------------
     AS ENTRADAS FICAM, E O MOTIVO É O DA PRÓPRIA TABELA: ela mede o que o
     JOGADOR PODE FAZER, e os doze verbos continuam a existir — o que morreu
     foi o BOTÃO. Apagar as linhas apagaria a medição do caminho do texto,
     que é o caminho que sobrou e o único que sempre resolveu de verdade.

     O QUE MUDOU, coluna por coluna: `cliqueChega` passa a "aposentado" nas
     vinte (não há clique para chegar a lado nenhum) e `handler` passa a
     `null`. `texto`, `textoFora`, `textoLuta` e `alcanca` NÃO MUDARAM
     uma palavra: a frase entra pela mesma porta de sempre
     (`agirInterno` → `executar`), que é o que torna a aposentadoria
     possível sem perder jogo.

     POR QUE ELES SAÍRAM, e a medida é do `jogo`: ZERO dos vinte dizia o
     preço na tela, oito escondiam-no em `title` — que no telefone não
     existe — e nenhum nomeava a cena. Eram verbos DO JOGADOR vestidos de
     oferta DO MUNDO, e a régua da soleira separa-os: *o que o jogador podia
     ter pensado sozinho é do campo, porque é dele.*

     E O `Atacar` DAQUI JÁ ESTAVA MORTO ANTES DE R4b, o que é o achado
     desta etapa e fica escrito: o desvio de X2 (`golpeVivo → declararGolpe`)
     só corria com `vereditoDoGolpeAgora()` não-nulo, isto é, com
     `combateRef.current` — e havendo combate quem se pinta é
     `TelaDeBatalha`, nunca este painel. A fiação morreu no dia em que E3
     levou a batalha para o arquivo dela; a régua media o TEXTO do handler e
     não se ele chegava a correr, e por isso deu-a por viva um ciclo inteiro.
     O `Atacar` com motor é o `aoAtacar` da tela da batalha, e sempre foi. */
  { id: "pronta_atacar", rotulo: "Atacar", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1108", handler: null /* R4b: o botão saiu. O `Atacar` com motor é o da tela da batalha, e é medido em pronta_atacar → alcanca */,
    texto: "Ataco ",
    /* X2: o clique na MESA DE COMBATE chega ao motor; fora da luta segue
       enchendo a caixa, que é por onde a briga começa. Ver o bloco do
       eixo condicional, acima. */
    cliqueChega: "aposentado", aposentadoEm: "R4b",
    textoFora: "motor", textoLuta: "cena",
    alcanca: "CLIQUE, dentro da luta: declararGolpe (src/App.jsx:12475) → vereditoDoGolpeAgora (:11878) → fraseDoGolpe (src/golpe.js) → aplicarGolpeDoJogador (:11800) → resolverAtaqueJogador (:11654) → dado, dano e PV. E o clique é IMPEDIDO (`disabled={impedido}`, :20843) quando ninguém está ao alcance — a abertura de 10/10 plantas apaga o botão em vez de gastar um turno para ser recusada. CLIQUE, fora da luta: só setEntrada. FRASE, fora: porta `agressao` → abre combate e rola INICIATIVA (nenhum dado de ataque). FRASE, dentro: porta fechada → mesma porta única do clique, e no turno 1 ainda é recusada por alcance (o caminho do teclado NÃO mudou em X2)" },
  { id: "pronta_esquivar", rotulo: "Esquivar", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1109", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Fico em postura defensiva, esquivando e me protegendo neste turno",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor: não casa desafio nem agressão — cai em `cena`" },
  { id: "pronta_empurrar", rotulo: "Empurrar", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1110", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Empurro com força ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor — cai em `cena`" },
  { id: "pronta_derrubar", rotulo: "Derrubar", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1111", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Tento derrubar no chão ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor — cai em `cena`" },
  { id: "pronta_correr", rotulo: "Correr", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1112", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Corro em disparada para ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor — cai em `cena`. O grid tem deslocamento, e esta frase não o alcança" },
  { id: "pronta_saltar", rotulo: "Saltar", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1113", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Salto sobre ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → adjudicarAcao (src/App.jsx:16902) rola o dado" },
  { id: "pronta_esconder", rotulo: "Esconder", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1114", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Me escondo nas sombras, buscando cobertura",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → rola o dado" },
  { id: "pronta_procurar", rotulo: "Procurar", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1115", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Examino o lugar com atenção, procurando ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → rola o dado" },
  { id: "pronta_ajudar", rotulo: "Ajudar", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1116", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Ajudo ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor — cai em `cena`. A Ajuda do 5e (vantagem a um aliado) não existe em código" },
  { id: "pronta_intimidar", rotulo: "Intimidar", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1117", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Intimido com olhar e presença ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → rola o dado" },
  { id: "pronta_persuadir", rotulo: "Persuadir", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1118", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Tento persuadir ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → rola o dado" },
  { id: "pronta_enganar", rotulo: "Enganar", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1119", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Tento enganar ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor — cai em `cena`. Persuadir e Intimidar casam; Enganar, não" },

  /* ---------------- AS 8 DO PAINEL RÁPIDO — APOSENTADAS EM R4b ----------------
     Eram as únicas do painel que entravam DE VERDADE no motor pelo clique,
     e é por isso que a aposentadoria delas custou a ser decidida. O que a
     desempatou: o atalho e o teclado terminam no MESMO sítio —
     `declararAcaoRapida` chamava `adjudicarAcao`, e a frase digitada chama
     `adjudicarAcao` pela porta `desafio` de `executar`. O botão poupava
     digitação, não mecânica. As frases canônicas continuam em
     `ACOES_RAPIDAS`/`fraseDaAcaoRapida` (`src/desafios.js`), provadas por
     `teste-desafios.mjs` e pela sonda do turno estéril.

     O CAMINHO QUE ELAS TINHAM, guardado porque explica a coluna `handler`
     que agora é `null`:
     R3: este `onClick` estava endereçado a `:21036`, e `:21036` NÃO ERA o
     `onClick` — era a chave de fecho do `style` do botão de ouvir o Mestre,
     a duzentas linhas dali. O número já estava errado ANTES desta etapa, e
     não foi apanhado porque este campo é prosa: o varredor re-deriva os
     endereços que ele próprio mede, e não confere o texto do `handler`.
     Re-medido para `:21535`. Os dois abaixo (`declararAcaoRapida` e
     `adjudicarAcao`) foram só DESLOCADOS pelo mapa do diff: continuam a
     apontar a mesma linha que apontavam no HEAD, e essa linha continua a
     não ser a função nomeada ao lado. Re-medi-los é do `testes`, não desta
     etapa — fica escrito em vez de arrumado por fora.
     `onClick` (`src/App.jsx:22720`) → `declararAcaoRapida` (`:16211`)
     → `adjudicarAcao` (`:15960`) → dado.
     Nenhuma é de combate — é o achado que pôs a Fase X na frente. */
  { id: "rapida_buscar", rotulo: "Vasculhar", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:622", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "vasculho o lugar com atenção",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor",
    alcanca: "desafio `teste` → rola. Na REPETIÇÃO no mesmo lugar vira `jaTentou` e não rola" },
  { id: "rapida_investigar", rotulo: "Investigar", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:623", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "investigo os vestígios",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor", alcanca: "desafio `teste` → rola" },
  { id: "rapida_escutar", rotulo: "Escutar", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:624", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "encosto o ouvido e escuto com atenção",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor", alcanca: "desafio `teste` → rola" },
  { id: "rapida_fraqueza", rotulo: "Lembrar", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:625", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "tento lembrar o que sei sobre esta criatura, alguma fraqueza",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor", alcanca: "desafio `teste` → rola" },
  { id: "rapida_convencer", rotulo: "Convencer", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:626", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "tento convencer",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor", alcanca: "desafio `teste` → rola" },
  { id: "rapida_intimidar", rotulo: "Intimidar", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:627", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "intimido",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor", alcanca: "desafio `teste` → rola" },
  { id: "rapida_furtar_se", rotulo: "Esgueirar", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:628", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "me esgueiro sem ser visto",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor", alcanca: "desafio `teste` → rola" },
  { id: "rapida_tranca", rotulo: "Arrombar", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:632", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "tento arrombar a porta",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor", alcanca: "desafio `teste` → rola" },

  /* ---------------- FORA DO PAINEL ----------------
     Os cliques que chegam ao motor sem passar pela caixa de texto. */
  { id: "grid_mover", rotulo: "Mover no grid", fonte: "grid", combate: true,
    onde: "src/App.jsx:21918 (onMover)", handler: "clique no quadrado → moverPara (src/App.jsx:15374)",
    texto: null,
    cliqueChega: "motor", textoFora: null, textoLuta: null,
    alcanca: "muda x,y do herói (src/App.jsx:15441) e gasta o movimento da economia" },
  { id: "bolsa_consumivel", rotulo: "Beber da bolsa", fonte: "bolsa", combate: true,
    onde: "src/App.jsx:20622", handler: "clique em `usar` → usarConsumivelUI",
    texto: null,
    cliqueChega: "motor", textoFora: null, textoLuta: null,
    alcanca: "rola o dado da poção, aplica a cura e tira o item da bolsa" },
  { id: "heroismo_gasto", rotulo: "Gastar heroísmo", fonte: "heroismo", combate: true,
    onde: "src/App.jsx:16210", handler: "PainelHeroismo (src/painel-heroismo.jsx:106) → aoGastar",
    texto: null,
    cliqueChega: "motor", textoFora: null, textoLuta: null,
    /* X2 CORRIGIU A SEGUNDA METADE DESTA FRASE, e ela fica escrita porque
       era a consequência mais cara do achado de X1: enquanto o clique de
       `Atacar` não chegava ao motor, o `refazer` do heroísmo era um gasto
       que a mesa de combate nunca podia oferecer — não havia dado na tela
       para refazer. Com o botão chamando `aplicarGolpeDoJogador`, há. */
    alcanca: "gastarHeroismo desconta o ponto. O gasto `refazer` (src/App.jsx:16169) só existe com um dado na tela — e ATÉ X1 o jogador não conseguia rolar nenhum em combate; desde X2 o clique de `Atacar` rola" },
  { id: "texto_ataque", rotulo: "Texto livre de ataque", fonte: "teclado", combate: true,
    onde: "src/App.jsx:14082", handler: "caixa de texto → agirInterno → aplicarGolpeDoJogador",
    texto: "Ataco <alvo>",
    cliqueChega: "nada", textoFora: "motor", textoLuta: "cena",
    /* X2 NÃO MEXEU NO CAMINHO DO TECLADO — e é de propósito que esta
       entrada segue na lista sem motor: a frase digitada continua chegando
       a `resolverAtaqueJogador` e morrendo no alcance do turno 1. O que
       mudou é o ENDEREÇO: o bloco que resolvia o golpe saiu de dentro de
       `agirInterno` e virou `aplicarGolpeDoJogador` (:11800), que hoje tem
       dois chamadores — o texto e o botão — e uma só aplicação. */
    alcanca: "fora: `lerAgressao` (src/agressao.js:177) exige alvo REGISTRADO no elenco; 7 de 8 frases naturais morrem em `semAlvoConhecido`. dentro: chega a aplicarGolpeDoJogador (src/App.jsx:12373) → resolverAtaqueJogador (:11654) e é recusado por alcance no turno 1 (ver ABERTURA_FORA_DE_ALCANCE)" },
];

/* ============================================================
   2. O QUE O MOTOR EXPÕE E NENHUM CLIQUE CHAMA

   CORREÇÃO DE MEDIÇÃO (X1). O mapa que chegou do `backend` dizia
   "`combate.js` 10 sem chamador, `habilidades.js` 8, `efeitos.js` 3".
   Conferi nome por nome, como mandado, e o número não se sustenta do
   jeito que estava escrito: "sem chamador" estava misturando três
   coisas muito diferentes. A tabela abaixo separa as três, porque só
   uma delas é dívida de verdade.

   `maiorVaoSemGanho`, por exemplo, foi listado como sem chamador e TEM
   leitor: `testes/teste-onda3.mjs:33`. Não é dívida.
   ============================================================ */
export const MOTOR_SEM_CHAMADOR = {
  /* Importado pelo App.jsx e NUNCA chamado lá: nenhum clique alcança.
     É a categoria que interessa à Fase X — o motor existe, a tela não o
     chama. Medido lendo o bloco de import de `src/App.jsx:7` e contando
     call-sites `nome(` no arquivo inteiro. */
  semClique: {
    "combate.js": ["bonusDeAmeaca", "pvEsperadoInimigo", "resumoPatamar"],
    "habilidades.js": [],
    "efeitos.js": [],
  },
  /* Só o próprio módulo chama. Não é dívida: é função interna que
     nasceu exportada. Fica registrado para não ser confundido com o de
     cima na próxima contagem. */
  soInterno: {
    "combate.js": ["modificadoresDeCondicao", "severidadeDano", "dadosDeDano", "marcosDaClasse", "ataquesDoInimigo"],
    "habilidades.js": ["FORMAS", "formaDe", "reerguerDe", "pressaDe"],
    "efeitos.js": ["retirar", "turnosDaMagia", "buffsNaRolagem"],
  },
  /* O ACHADO DURO, e o único export do trio com ZERO leitores em todo o
     projeto — nem `src/`, nem `testes/`. Ele passa pela catraca
     `teste-ligacao` por um buraco que vale anotar: a catraca conta o
     IMPORT como leitor, e `src/App.jsx:7` importa `gastarRecurso` sem
     nunca o chamar. Um import é um leitor para a catraca e um nada para
     o jogo — e é exatamente assim que 182 suítes ficam verdes enquanto
     o jogador não consegue atacar. */
  morto: [
    { nome: "gastarRecurso", onde: "src/combate.js:745",
      porque: "zero call-sites em src/, zero referências em testes/; só a linha de import em src/App.jsx:7" },
  ],
  /* O estado que o combate escreve e ninguém consome. `recursos` nasce
     em toda luta (`novosRecursos()`) e a única outra menção no projeto
     é uma cópia de passagem em `src/regras-jogo.js:459` — nunca é lido
     para barrar uma ação. É a economia de ação que existe no papel. */
  escritoENuncaLido: [
    { campo: "combate.recursos", escritoEm: "src/App.jsx:5515",
      unicaMencao: "src/regras-jogo.js:459 (cópia de passagem, não leitura)" },
  ],
};

/* ============================================================
   3. O TURNO ESTÉRIL — a definição e as taxas medidas
   ============================================================ */

/* O que conta como "um número mudou". A lista é fechada de propósito:
   sem ela a taxa vira opinião, e X4 não conseguiria repetir a conta. */
export const NUMERO_QUE_MUDA = [
  "PV ou PM do herói ou de qualquer inimigo",
  "XP ou nível",
  "moedas ou contagem de item na bolsa",
  "posição (x,y) na grade",
  "economia de ação do combate (ação/movimento restantes)",
  "lista de condições ou efeitos",
  "um dado rolado e registrado",
];

/* O que NÃO conta, e o porquê de cada exclusão. A terceira é a que mais
   muda o resultado e por isso é a que mais precisa estar escrita. */
export const NAO_CONTA_COMO_NUMERO = [
  { o: "linhas de log", porque: "o Mestre narrando não é o sistema decidindo" },
  { o: "o livro de tentativas", porque: "é escrituração da medida, não estado de jogo" },
  /* O ENDEREÇO MUDOU DE NOVO (X4), E DESTA VEZ COM CATRACA. Era `12959` em
     X1 e `13161` em X2; hoje o `avancarMinutos(MINUTOS_POR_TURNO)` está em
     `src/App.jsx:13884` — o arquivo cresceu por baixo dele duas vezes e
     ninguém foi avisado, porque nada re-derivava este número. A troca vem
     acompanhada do dente 8 de `check-acoes-do-jogador.mjs`, que passa a ler
     a linha do código e falhar quando ela e esta discordarem: uma régua que
     aponta a linha errada ensina a desconfiar dela.

     R17: 13820 -> 13931. A etapa mexeu bem acima deste ponto (import de
     `ui.jsx`, a fiação nova do veredito do cartaz em `PainelMural`, o
     `partirOTurno` que passou a anteceder `agir`) e tudo abaixo andou
     junto; o dente 8 confirmou sozinho, é por isso que ele existe.

     O TURNO DE QUEM CAIU (24/09): 13931 -> 14051 -> 14078. O guarda que
     converte texto em turno de quem está inconsciente (`convertePraTurnoDoCaido`,
     topo de `agirInterno`) nasceu ACIMA deste ponto — 27 linhas — e tudo
     abaixo andou junto. Endereço re-medido pelo dente 8, asserção intacta.

     A FUGA COBRA (frontend, R22): 14078 -> 14089. `sementeMundo` e
     `abrirCombate` (bem acima) ganharam +11 linhas juntos, e este ponto
     está entre os dois e o corpo de `fugirDaLuta`. Re-medido pelo dente 8.

     O GOLPE FINAL (frontend, 29/09, MM3): 14089 -> 14239. A ligação do
     cartão do golpe final (Q3+Q5) somou código bem acima deste ponto — o
     mesmo deslocamento que empurrou `FUNIL_DO_COMBATE` inteiro, descrito no
     cabeçalho dele — e tudo abaixo andou junto. Endereço re-medido pelo
     dente 8, asserção intacta.

     MESMO DIA, IDA E VOLTA (frontend, 29/09, MM3): 14239 -> 14241 -> 14239.
     Duas linhas `console.warn("[MM3-DEBUG] ...")` nasceram dentro de
     `aplicarGolpeDoJogador` para um diagnóstico ao vivo, empurrando este
     ponto para 14241; ao fechar o diagnóstico as 4 linhas de debug que
     chegaram a existir (as 2 de cima, mais 2 que nasceram depois em
     `continuarGolpeDoJogador`/`responderGolpeFinal`) foram REMOVIDAS, e o
     relógio volta ao endereço de antes de qualquer uma delas ter existido.
     O que se guarda aqui nunca foi o número — é que o turno fora de
     combate avança MINUTOS_POR_TURNO faça o jogador o que fizer; isso não
     mudou em nenhuma das três medições. Re-medido pelo dente 8.
     A PENEIRA DA AGRESSÃO (frontend, MM, 29/09): 14239 -> 14257, +18. A
     peneira em `resolverAtaqueJogador` (+13, ver FUNIL_DO_COMBATE) e o
     elenco de nomes em `ehAgressao`/`sinaisDoTurno` (+4, acima deste
     ponto no arquivo) empurraram tudo abaixo junto. Re-medido pelo dente
     8, asserção intacta.
     O ESCONDIDO ENTRA NA FIAÇÃO (frontend, MM6, 29/09): 14257 -> 14326,
     +69. `agirInterno` ganhou o "cai por ato" (revelar-se por gritar, sair
     do esconderijo etc.) logo no TOPO da função, antes de qualquer porta —
     e o relógio de 45 min mora mais abaixo, no mesmo corpo. Não foi somado
     de cabeça: o valor veio direto de `check-acoes-do-jogador.mjs`
     (bloco 8), que reder deriva o endereço a cada corrida e falhou com o
     número certo escrito no próprio erro; a suíte voltou ao verde depois
     de copiá-lo aqui.
     A CIDADE POR DENTRO (frontend, MM12, 29/09): 14357 -> 14371, +14. A
     fiação de `fichaParaPauta` (cidade-por-dentro.js) entrou em
     `pautaDoTurno`, bem acima deste ponto no arquivo (o import + o
     try/catch de treze linhas), e tudo abaixo andou junto. Re-medido pelo
     dente 8, que deu o número certo no próprio erro.
     A GENTE POR DENTRO (frontend, MM8a, 29/09): 14371 -> 14388, +17. A
     fiação de `genteParaPauta` (gente-por-dentro.js) entrou logo depois de
     `fichaParaPauta`, no mesmo corpo de `pautaDoTurno` — um import no topo
     (+1) e o try/catch de dezesseis linhas (+16) —, e tudo abaixo andou
     junto. Re-medido pelo dente 8, que deu o número certo no próprio erro.
     O MUNDO PUXA O HERÓI (frontend, MM13, 30/09): 14408 -> 14482, +74. A
     abertura entra em vários pontos ACIMA deste, do import ao load — o
     maior é a troca da abertura forçada de uma linha por `abrirAbertura`
     em `iniciar` (~+22 líquido). Nada se moveu por vontade própria: é o
     mesmo funil de sempre, endereço re-medido pelo dente 8, que deu o
     número certo no próprio erro.
     A FIAÇÃO DO PRIMEIRO DIA (frontend, MM13b, 30/09): 14482 -> 14493, +11.
     `ondeSeProcura`/`achavelAqui` e o débito de cobranca.js entraram ACIMA
     deste ponto, dentro de `aplicarResposta` — mesmo delta de
     FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE nesta etapa. Re-medido pelo dente 8,
     que deu o número certo no próprio erro.
     A GENTE QUE PESA (frontend, MM8c-2, 30/09): 14493 -> 14499, +6. O
     import de `elenco.js` e o contexto/nomes do elenco (`contextoDoElenco`,
     `nomesDoElenco`) entraram ACIMA deste ponto, no corpo do componente —
     mesmo delta de FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE nesta etapa.
     Re-medido pelo dente 8, que deu o número certo no próprio erro.
     A GENTE QUE PESA, MEDIDA E CACHEADA (frontend, MM8c-2, 30/09):
     14499 -> 14509, +10. O cache por identidade (`elencoCacheRef`, logo
     após `nomesDoElenco`) somou 8 linhas onde havia 1, ACIMA deste ponto —
     mesmo delta de FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE nesta etapa.
     Re-medido pelo dente 8, que deu o número certo no próprio erro.
     A PROMOÇÃO (frontend, MM8e, 30/09): 14509 -> 14512, +3. Quatro linhas
     novas entraram ACIMA deste ponto, cada uma num corpo de função
     diferente (o ref do save, os vistos por turno, a promoção ao virar o
     dia, a saída na pauta) — mesmo delta de FUNIL_DO_COMBATE/
     RECUSAS_DO_COMBATE nesta etapa. Re-medido pelo dente 8.
     A LUTA SEM ESPADA (frontend, MM9, 30/09): 14512 -> 14528, +16. A
     rodada que impressiona (dentro de `continuarGolpeDoJogador`) e os
     prisioneiros na pauta (dentro de `fecharSeTodosCairam`) nasceram
     ACIMA deste ponto, e tudo abaixo andou junto — mesmo delta de
     FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE nesta etapa. Re-medido pelo
     dente 8, que deu o número certo no próprio erro.
     AS PERGUNTAS AO MESTRE (frontend, MM14, 30/09): 14546 -> 14584, +38 —
     o mesmo delta de FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE nesta etapa (a
     mesa de PERGUNTOU dentro de `pautaDoTurno` e a pergunta que não gasta
     a vez dentro de `agirInterno`, as duas ACIMA deste ponto). O próprio
     relógio ganhou uma quinta condição (`soPergunta(acao).soPergunta`) na
     MESMA linha — quem só pergunta não o move — mas isso não muda o que
     esta exclusão mede: o número continua a mudar sempre que HÁ turno de
     mundo, e é disso que a taxa estéril precisa se livrar. Re-medido pelo
     dente 8.
     OS DOIS CANAIS ANTIGOS (frontend, MM14, 30/09): 14584 -> 14559, -25.
     A migração das tarefas antigas para missão do sistema (o load, o fio
     do descanso, a paga no fecho) entra ACIMA deste ponto, mas a remoção
     dos dois canais que fechavam a lista antiga pelo título (o `forEach`
     de `quest_atualizar` no Narrador, o `casar` do Cronista) tira mais
     linhas do que a migração soma — líquido -25. Re-medido pelo dente 8,
     que deu o número certo no próprio erro.
     A GENTE NO LUGAR CERTO, COM O NOME CERTO (frontend, MM14 · 9b/10a,
     30/09): 14559 -> 14615, +56. Tudo ACIMA deste ponto: +1 o campo
     `viuAntes` de `pessoasDaCena`; +20 o helper `contextoDoNome`, antes
     de `aplicarResposta`; +21 as duas primeiras portas do registo
     (`mudancas.npcs`, o cânone) decidindo `nomeCerto` por `nomeComDono`,
     com `homonimos` e a nota ao Narrador; +14 a porta do Cronista
     (`pessoas`) e o mural (`missao_oferecida`) pela mesma régua. Nenhuma
     toca o relógio — é o mesmo avanço de sempre, só mais abaixo no
     arquivo. Re-medido por `git diff --unified=0 HEAD -- src/App.jsx`,
     que deu o endereço exato de cada hunk (nada somado de cabeça).
     A EXTRAÇÃO DE fichasDaMesa (frontend, MM14 · o resto do nº 6, 30/09):
     14615 -> 14633, +18. O cálculo das três fichas (cidade, gente,
     mercado) que morava dentro de `pautaDoTurno` mudou-se para
     `fichasDaMesa` — extraído para que o sinal do oráculo
     (`ehPerguntaAoMundo`) também pudesse perguntar às fichas antes de
     rolar o d100, sem duplicar o cálculo. A função nova nasce ACIMA de
     `pautaDoTurno` no arquivo, e é maior que o texto que `pautaDoTurno`
     perdeu — líquido +18 no arquivo inteiro, tudo ACIMA do relógio.
     Nenhuma função do funil mudou de forma. Re-medido por
     `check-acoes-do-jogador.mjs`, que falha nomeando o valor certo; nada
     somado de cabeça.
     AS FALAS PAGAS E DEITADAS FORA (frontend, MM15 (2), 30/09): 14638 ->
     14640, +2. `colherAsFalas` trocou o `.slice(0, MAX_BOCAS)` de uma
     linha por `bocasDoTurno(mov, { conteudo })` mais um `if
     (!escolhidos.length) return [];` — uma linha a mais, com o comentário
     do motivo. O ponto nasce bem acima do relógio no arquivo, e tudo
     abaixo andou junto. Re-medido por `check-acoes-do-jogador.mjs`, que
     deu o número certo no próprio erro; nada somado de cabeça. */
  /* A FOTO DO TURNO (frontend, MM15 (3), 30/09): 14640 -> 14808, +168. A
     foto do início do turno (`fotoInicioRef.current = fotografarOTurno(…)`)
     nasce logo depois da trava, no TOPO de `agirInterno` — acima deste
     ponto no arquivo —, e tudo abaixo andou junto. Nada mudou de forma: o
     relógio continua a avançar sempre, faça o jogador o que fizer; é
     exatamente esse "sempre" que MM15 (3) passou a desfazer quando o
     Mestre cala, sem tocar na regra medida aqui. Re-medido por
     `check-acoes-do-jogador.mjs`, que deu o número certo no próprio erro. */
  /* OS NOMES QUE SE FUNDEM (frontend, MM15 (5), 30/09): 14829 -> 14833, +4.
     `contextoDoNome` ganhou `conhecidos` (o mural) e `recentes` (a
     conversa), ACIMA deste ponto no arquivo — e tudo abaixo andou junto.
     A outra fiação de MM15 (5) (a guarda de `pessoaNaFrente`) foi escrita
     para caber no mesmo número de linhas de antes, de propósito, e por
     isso não soma delta nenhum sozinha. Re-medido por
     `check-acoes-do-jogador.mjs`, que deu o número certo no próprio erro. */
  /* O COMPANHEIRO DE ANTES (frontend, 01/10): 14833 -> 14858, +25. O import
     de companheiro-inicial.js no topo do arquivo soma +1, e a fiação do
     companheiro em `iniciar` (nasce depois da abertura, bem ACIMA deste
     ponto) soma as outras +24. Re-medido por `check-acoes-do-jogador.mjs`,
     que deu o número certo no próprio erro. */
  /* A MASMORRA QUE SE ACABA (orquestrador, 05/10, v9.348): 14858 -> 14846,
     -12. O bloco do chefe encolheu 12 linhas no ramo do Narrador, ACIMA do
     relógio (virou `concluirMasmorraDoChefe`, que mora abaixo). Só o
     endereço andou. Re-medido por `check-acoes-do-jogador.mjs` (bloco 8). */
  { o: "o relógio do mundo (45 min)", porque:
    "src/App.jsx:14985 avança MINUTOS_POR_TURNO em todo turno fora de combate, faça o jogador o que fizer. Um número que muda sempre não distingue turno que fez de turno que não fez: incluí-lo daria 0% de esterilidade por construção e a medida perderia o sentido" },
];

export const TURNO_ESTERIL = {
  /* A política é fixa e faz parte do número: outra política, outra taxa.
     X4 tem de repetir ESTA. */
  politicaDaSessaoA: {
    descricao: "combate aberto, jogador declara ataque por texto a cada turno e não faz mais nada",
    planta: "estrada", inimigos: 1, inimigoAgil: false,
    heroi: "corpo a corpo, nível 3, arma sem distância nem alcance",
    turnos: 7,
    acaoPorTurno: "Ataco <nome do inimigo>",
  },
  /* As taxas medidas em X1. `pares` = ação × contexto (fora/dentro).

     CONGELADAS DE PROPÓSITO EM X2. Estes três números são a LINHA DE
     BASE, e X4 compara contra eles: reescrevê-los agora apagaria o lado
     de cá da comparação e a Fase X perderia a régua que a justifica. Os
     dois primeiros recortes não são recalculados por nenhuma suíte — são
     a contagem que X1 fez à mão sobre o espaço de ações —, e o terceiro é
     recalculado em `teste-acoes-do-jogador.mjs` e segue dando 100%,
     porque a sessão A é o jogador que DIGITA e o caminho do teclado não
     mudou em X2.

     O número que X2 fez andar não está aqui: é a catraca
     `acoesDeCombateSemMotor()`, que era 7 e virou 6. Essa a suíte
     recalcula da tabela a cada rodada, e é por ela que a conquista fica
     travada. */
  taxas: [
    { recorte: "espaço de ações", universo: 42, estereis: 12, taxa: 28.6,
      nota: "20 do painel × 2 contextos + mover + bolsa" },
    { recorte: "dentro do combate", universo: 22, estereis: 6, taxa: 27.3,
      nota: "o recorte que a Fase X ataca" },
    { recorte: "sessão A", universo: 7, estereis: 7, taxa: 100,
      nota: "reproduz o 7-em-7 relatado pelo `jogo`, deterministicamente" },
  ],
  /* O que a sessão A produz hoje. X2 NÃO a moveu, e isso é medida, não
     desculpa: a política da sessão A é "o jogador digita `Ataco <nome>`
     e não faz mais nada", e X2 não tocou no caminho do teclado — só
     abriu o do clique. Quem insistir no teclado da abertura ainda fecha
     7/7. O que X2 mudou é que o jogador já não precisa descobrir isso
     sete vezes: o botão fica impedido antes do primeiro clique, e é essa
     a medida NOVA que a sonda passou a imprimir ao lado desta. */
  sessaoA_hoje: { turnos: 7, estereis: 7, rolagens: 0, revides: 0 },
  /* A fórmula, numa linha, tal como X4 vai executá-la de novo. */
  formula: "taxa_esteril = turnos_sem_delta / turnos_totais",
  procedimento: "node testes/sonda-turno-esteril.mjs — comparar a linha da sessão A",
  /* ---------------- A ARMADILHA DE MEDIÇÃO ----------------
     Escrita aqui porque X4 vai repetir esta conta e cairia nela de novo:
     custou tempo a nós dois, nesta mesma etapa.

     `montarGrade({ planta: "masmorra" })` NÃO monta a masmorra.
     `cenarioDe` (`src/grid.js:275-287`) não lê a chave `planta`: lê
     `emMasmorra`, `local` e `bioma` — e, não casando nada, cai em
     `estrada` EM SILÊNCIO. Na primeira medição isso trocou 25,5 m por
     16,5 m sem um aviso, e as dez plantas saíram todas 18x12.

     Quem medir grade CONFERE a `largura`×`altura` que recebeu antes de
     acreditar no número. É o que `check-acoes-do-jogador.mjs` faz, e é
     por isso que `aberturaPorPlanta` guarda a grade junto dos metros. */
  armadilhaDaGrade: {
    o: "montarGrade({ planta: X }) cai em `estrada` sem avisar",
    onde: "src/grid.js:275-287 (cenarioDe)",
    comoEvitar: "usar { emMasmorra: true } ou { local: X }, e conferir largura×altura do resultado",
  },
};

/* ============================================================
   4. A ABERTURA FORA DE ALCANCE — o achado central de X1

   A causa do 7-em-7 não era nenhuma das duas travas que o mapa
   apontava. É geométrica, e ninguém a tinha nomeado.

   `posicionar` (`src/grid.js:551-576`) põe o herói em `y = altura-1` e o
   inimigo não-ágil em `y = 0`. Em TODAS as dez plantas a abertura fica
   entre 12,0 m e 25,5 m, e o alcance de um golpe corpo a corpo é 1,5 m.
   Logo, no turno 1, `alcanca` recusa — sempre.

   E o que fecha a conta dos PV parados: a recusa é DE GRAÇA. O caminho
   `semAlcance` (`src/App.jsx:12241-11872`) sai em `:11906-11869` ANTES de
   gastar a ação — deliberadamente, por `:11903-11865` ("golpe sem
   alcance não gasta a ação"). Sem gastar a ação, `fecharMeuTurno` →
   `resolverRevide` (`src/App.jsx:14888-14454`) nunca roda: o inimigo
   também nunca age. O jogador ataca sete vezes, o sistema recusa sete
   vezes sem cobrar nada, e a rodada não vira. PV 20/20 para sempre.

   ---------------- O QUE X2 FEZ COM ISTO, E O QUE NÃO ----------------

   NÃO mexeu na geometria nem na gratuidade da recusa: as dez plantas
   seguem abrindo fora de alcance e a recusa segue sem cobrar a ação — e
   os números acima continuam medidos, planta a planta, pela suíte.

   O que mudou é QUEM VÊ. O mesmo veredito que recusa passou a poder ser
   perguntado sem gastar o turno (`vereditoDoGolpeAgora`, `:11966`), e
   com ele o botão `Atacar` fica IMPEDIDO na abertura em vez de aceitar o
   clique e responder "ninguém está ao alcance". A recusa de graça deixou
   de ser a coisa que o jogador descobre sete vezes seguidas: ela virou
   estado visível do botão. A taxa da sessão A não muda por isso — o
   jogador que insiste no teclado ainda fecha 7/7 — e é por isso que a
   linha de base de X1 continua sendo a conta que X4 compara.

   ---------------- O PAR QUE NUNCA FOI COMPOSTO ----------------

   Duas suítes verdes provam, JUNTAS, este bug — e nunca foram lidas uma
   ao lado da outra:

     `testes/teste-grid.mjs:198`
       t("o herói começa longe dos inimigos",
         p.inimigos.every((e) => distanciaM(e, p.heroi) > 6))
       — GARANTE que a abertura está fora do alcance corpo a corpo, e
         trata isso como feature.

     `testes/teste-alcance-e-achado.mjs:45`
       t("a arma continua recusando por alcance",
         /if \(ataque && ataque\.semAlcance\)/.test(APP))
       — garante que a recusa existe.

   Uma prova que o herói começa longe; a outra prova que longe é
   recusado. Falta a terceira, e é a que X2 vai ter de fazer passar:
   existe um caminho, em quantos turnos, do começo da luta até um dado
   rolado.

   NENHUMA DAS DUAS É ALTERADA AQUI. X1 mede, não conserta — as duas
   estão certas no que afirmam, e o erro nunca esteve dentro delas.
   ============================================================ */
export const ABERTURA_FORA_DE_ALCANCE = {
  onde: "src/grid.js:551-576 (posicionar)",
  regra: "herói em y = altura-1; inimigo não-ágil em y = 0",
  alcanceCorpoACorpo: 1.5,          // metros — src/grid.js:60 (tamanho `pequeno`)
  metrosPorQuadrado: 1.5,           // src/grid.js:43
  /* X2: o `36` saiu de dentro do App e virou `ALCANCES.armaDeLonge`, em
     src/golpe.js — o número é o MESMO, mudou o endereço. Fica aqui
     repetido de propósito: a régua tem de poder ser lida sem importar o
     motor, e `teste-golpe.mjs` é quem casa os dois valores. */
  alcanceDeArmaLonge: 36,           // metros — src/golpe.js ALCANCES.armaDeLonge
  /* Medido planta a planta com `montarGrade` + `posicionar` + `alcanca`.

     `aLonge36mOk` é o refinamento que o coordenador mediu por conta
     própria e que muda o que X2 pode supor: com arma de longe (36 m) a
     distância deixa de ser o problema, mas TRÊS plantas continuam
     recusando — taverna, caverna e navio — porque `alcanca` também olha
     a linha de visão, e há parede no caminho. "Ter alcance" não é
     sinônimo de "pode acertar": quem decide é `alcanca`, inteiro. É a
     diferença entre X2 oferecer um botão que promete e um que cumpre. */
  aberturaPorPlanta: [
    { planta: "taverna", grade: "12x9", metros: 12.0, corpoACorpoOk: false, aLonge36mOk: false },
    { planta: "masmorra", grade: "7x18", metros: 25.5, corpoACorpoOk: false, aLonge36mOk: true },
    { planta: "floresta", grade: "16x16", metros: 22.5, corpoACorpoOk: false, aLonge36mOk: true },
    { planta: "estrada", grade: "18x12", metros: 16.5, corpoACorpoOk: false, aLonge36mOk: true },
    { planta: "cidade", grade: "14x14", metros: 19.5, corpoACorpoOk: false, aLonge36mOk: true },
    { planta: "caverna", grade: "14x14", metros: 19.5, corpoACorpoOk: false, aLonge36mOk: false },
    { planta: "ruina", grade: "16x14", metros: 19.5, corpoACorpoOk: false, aLonge36mOk: true },
    { planta: "navio", grade: "10x16", metros: 22.5, corpoACorpoOk: false, aLonge36mOk: false },
    { planta: "gelo", grade: "16x16", metros: 22.5, corpoACorpoOk: false, aLonge36mOk: true },
    { planta: "deserto", grade: "18x14", metros: 19.5, corpoACorpoOk: false, aLonge36mOk: true },
  ],
  plantasQueRecusamAte36m: 3,       // taverna, caverna, navio — por parede, não por distância
  plantasQueRecusamNoTurno1: 10,
  plantasTotais: 10,
  /* quantos turnos SÓ ANDANDO até o golpe poder rolar, com 9 m por turno
     e caminho real (busca em largura, não linha reta) */
  turnosAndandoAteOGolpe: { minimo: 2, maximo: 3 },
  recusaDeGraca: {
    /* X2 moveu as três linhas SEM mudar a regra: a recusa nasce agora
       dentro de `resolverAtaqueJogador` (que devolve o veredito junto) e
       sai em `aplicarGolpeDoJogador`, a porta única. `check-acoes-do-
       jogador.mjs` continua conferindo que a saída acontece antes de
       qualquer desconto de economia — é a asserção, não o número da
       linha, que guarda a gratuidade. */
    ondeRecusa: "src/App.jsx:12323-11946 (resolverAtaqueJogador)",
    ondeSai: "src/App.jsx:12407-12198 (aplicarGolpeDoJogador)",
    naoGastaAcao: "src/App.jsx:12416-12029",
    logo: "fecharMeuTurno/resolverRevide (src/App.jsx:15030-14591) nunca roda — o inimigo também não age",
  },
  /* o par de suítes que, juntas, já provavam isto — citadas, não tocadas */
  parQueNuncaFoiComposto: [
    "testes/teste-grid.mjs:198 — o herói começa a mais de 6 m",
    "testes/teste-alcance-e-achado.mjs:45 — a arma recusa por alcance",
  ],
};

/* ============================================================
   5. AS CONTAS DERIVADAS — lidas de volta pela suíte

   Ficam como FUNÇÃO e não como número solto: quem muda a tabela muda a
   conta junto, sem ter de lembrar de atualizar um total à mão.
   ============================================================ */

/* A CATRACA DE X2. As ações de COMBATE cujo CLIQUE não chega ao motor —
   o eixo certo, porque a promessa de X2 é o dado rolar porque o jogador
   clicou. Esta lista só pode encolher.

   A conta NÃO mudou em X2, e não deveria: ela lê `cliqueChega`, que
   agora significa "na mesa de combate", que é exatamente o recorte que
   ela sempre quis medir. Foi a TABELA que mudou embaixo dela, e é assim
   que uma catraca desce sem ser afrouxada — o filtro continua o mesmo, o
   dado é que passou a dizer outra coisa. Eram 7; são 6. */
export function acoesDeCombateSemMotor() {
  /* R4b: `aposentado` sai da conta, e o motivo tem de ficar escrito porque
     esta é a catraca que a Fase X deixou e ela DESCE aqui sem que ninguém
     tenha ganho motor nenhum — o que, pela regra dela, seria "regressão
     disfarçada de conquista" se fosse em silêncio.

     A conta que ela faz é *ação de combate cujo CLIQUE não chega ao motor*.
     Sem botão não há clique, e uma linha sem clique não pode reprovar num
     eixo de cliques: ela deixa de ter opinião, não passa a ter uma boa.

     E O QUE SE SABIA NÃO SE PERDE. Que Esquivar, Empurrar, Derrubar, Correr
     e Ajudar não têm motor continua escrito, e num sítio melhor do que uma
     lista de perdão: `VERBOS_DE_COMBATE` (`src/golpe.js`) guarda o
     `porqueSemMotor` de cada um, roda em Node e é lido por `teste-golpe.mjs`.
     Dar mecânica aos cinco continua a ser decisão pesada, e continua a ser
     da pessoa. */
  return ACOES_DO_JOGADOR.filter((a) => a.combate && a.cliqueChega !== "motor" && a.cliqueChega !== "aposentado");
}

/* Quantos CLIQUES chegam ao motor — a manchete de X1 saía daqui:
   8 rápidas + mover + bolsa + heroísmo entravam; as 12 prontas, não.
   Desde X2 são doze: `Atacar`, na mesa de combate, entrou. Fora da luta
   ele continua na caixa — e quem quiser essa outra conta lê
   `cliqueChegaFora`, que existe só onde os dois divergem. */
export function contarPorClique() {
  /* R4b: o quarto valor. `aposentado` não é "não chega ao motor" — é "não
     há clique". Somá-lo a `caixa` faria a régua dizer que vinte botões
     continuam a encher a caixa de texto, e não há botão nenhum. */
  const c = { motor: 0, caixa: 0, nada: 0, aposentado: 0 };
  for (const a of ACOES_DO_JOGADOR) c[a.cliqueChega] += 1;
  return c;
}

/* AS EXCEÇÕES DO EIXO DO CLIQUE (X2). As ações cujo botão se comporta de
   um jeito na luta e de outro fora dela. Fica como função e não como
   número para que a lista seja lida de volta pelas três pontas — a suíte
   afirma quem está nela, o varredor confere contra o handler do código, e
   a sonda a imprime — em vez de virar uma frase de comentário que ninguém
   executa. Hoje tem exatamente um membro, e uma lista de um é o melhor
   momento para vigiá-la: é quando o segundo entra sem ninguém reparar. */
export function acoesComCliqueCondicional() {
  return ACOES_DO_JOGADOR.filter((a) => a.cliqueChegaFora != null && a.cliqueChegaFora !== a.cliqueChega);
}

/* Onde a FRASE termina. `contexto` é "fora" ou "luta". Ações sem texto
   (mover, bolsa, heroísmo) ficam de fora da conta, e não em "cena": elas
   não falharam em chegar ao Mestre, elas simplesmente não passam por lá. */
export function contarPorTexto(contexto) {
  const chave = contexto === "fora" ? "textoFora" : "textoLuta";
  const c = { motor: 0, cena: 0, semTexto: 0 };
  for (const a of ACOES_DO_JOGADOR) {
    if (a[chave] == null) c.semTexto += 1; else c[a[chave]] += 1;
  }
  return c;
}

/* ============================================================
   6. O EIXO DA FRASE (X4) — quem fala no turno de combate

   POR QUE ESTE BLOCO EXISTE. X3b deixou por escrito um eixo que a régua
   não tinha: além de "quantos turnos terminam sem um número mudar", dá
   para contar "quantos terminam sem uma FRASE", e as duas taxas não são
   a mesma. Deixou também um alerta que muda a conta antes de ela ser
   feita: a voz do combate que o código já tem é, em boa parte, a voz de
   DIZER NÃO. Recusa não é narração de evento. Contá-las juntas infla o
   número a favor de quem mede, que é o pior jeito de errar.

   ---------------- O QUE É "CAMINHO DE COMBATE", E COMO FOI MEDIDO ----

   X3b escreveu em prosa: "`pushMsgs` é `App.jsx:7652` e treze funções o
   chamam dentro do combate". O endereço do funil CONFERE — `pushMsgs` é
   `src/App.jsx:7862`, e há 453 call-sites dele em 174 funções no arquivo
   inteiro. O "treze", não: X3b não escreveu uma linha de código, e o
   número não se reproduz sob nenhum critério que eu consiga declarar.
   Recontei, e o que muda o resultado não é a contagem — é a DEFINIÇÃO,
   que faltava. Com ela escrita, o número é 14, em dois anéis:

     `nucleo` (11) — a função é PROVADAMENTE muda fora da luta: ou ela
       guarda em `combateRef.current` e sai cedo, ou todo chamador dela
       está dentro do ciclo do turno. Medido por ponto fixo sobre o grafo
       de chamadas de `src/App.jsx`, partindo das cinco guardas explícitas
       (`presencaNaLuta`, `resolverAtaqueJogador`, `resolverHabilidade-
       Ofensiva`, `resolverRevide`, `moverPara`).
     `borda` (3) — fala no turno de combate E fora dele. `aMesaEspera`
       (a trava do turno guardado serve o turno inteiro),
       `fecharSeTodosCairam` (tem chamador em `executarComando`) e
       `limparConjuracoesDaLuta` (também roda em `passarTempo` e
       `acampar`). Ficam declaradas à parte para que o "11" continue
       sendo um número duro e o "14" continue sendo comparável.

   O que NÃO entrou no funil, e por quê: `agirInterno` (`:13317`), o
   despachante do turno. Ele fala nos dois mundos, e mais da metade das
   linhas dele não é de combate. As recusas do ramo de habilidade que
   moram lá ENTRAM na conta das recusas, com o anel escrito — porque uma
   recusa que o jogador ouve com a luta aberta é recusa de combate, ainda
   que a função que a diz também sirva fora.

   ---------------- FRASE DE MESA vs TELEGRAMA ----------------

   É a distinção que X3b chamou de coração da medida, e sem ela o eixo
   novo não vale nada: a linha existir não quer dizer que a mesa falou.

     `frase`     — voz de mundo. Uma pessoa poderia ter dito isso.
     `telegrama` — contabilidade com emoji:
                   `⚔ Halvard → Bandido: 9 de dano · Bandido 11/20`.
                   O número está certo e ninguém narrou nada.
     `recusa`    — o sistema diz que a ação NÃO aconteceu. Não é
                   narração de evento e não entra na conta dela.
     `eco`       — a linha `{ autor: "jogador" }`, que devolve à tela o
                   que o próprio jogador escreveu. Não é voz da casa.

   `nasce` aponta ONDE a frase é escrita, e não de onde ela é empurrada:
   quando o `App.jsx` só repassa `res.texto` de um módulo puro, o crédito
   é do módulo. É essa coluna que diz quanto da voz do combate já está
   fora do React — e portanto quanto dela é testável em Node.

   UMA CHAMADA NÃO É UMA LINHA. `pushMsgs` recebe uma lista: `:12059`
   empurra de uma vez o eco, o 🎲 opcional, a aflição e o telegrama do
   golpe. Onde isso acontece, `misto: true` está escrito, e `voz` é a da
   linha que o jogador sempre vê.
   ============================================================ */
/* R17: TODO endereço abaixo foi RE-MEDIDO, não deslocado por aritmética.
   O deslocamento NÃO é uma constante única: +87 até `presencaNaLuta`
   (a lápide de `VinhetaDaCena`/`IconeBalao` e a fiação nova do veredito do
   cartaz em `PainelMural`, bem acima), +93 dali até `resolverHabilidade-
   Ofensiva`, e +111 daí em diante — o `partirOTurno` (18 linhas) nasceu
   colado a `agir`, entre `resolverHabilidadeOfensiva` e `agirInterno`, e
   empurrou só o que vem depois dele. Cada endereço abaixo foi conferido
   por CONTEÚDO contra o `git show HEAD:src/App.jsx` de antes desta etapa,
   não por soma de delta.

   E a prova de que o texto sozinho não bastava: três endereços deste
   bloco (ver a nota junto a `expirarGuardas`/`expirarPressa` abaixo)
   coincidiam por acidente com OUTRO `pushMsgs(` de verdade no código
   novo — o varredor só olha se a linha citada TEM um `pushMsgs(`, não
   qual. Teria ficado verde apontando pro lugar errado se eu tivesse só
   somado o delta. É exatamente o caso que a pauta do desenho já registra
   sobre esta catraca.

   O TURNO DE QUEM CAIU (frontend, 24/09): +27 em todo endereço a partir de
   `fecharSeTodosCairam` (14450 → 14477) até `virarChefeSePreciso`
   (19124 → 19151) — a mesma soma do relógio de 45 min, logo acima, e pelo
   mesmo motivo: o guarda que converte texto em turno de quem está
   inconsciente (`convertePraTurnoDoCaido`, `tela-de-batalha.js`) entra no
   TOPO de `agirInterno`, bem antes de todas estas funções, e uma soma
   ÚNICA basta desta vez — foi CONFERIDA por conteúdo contra o código, não
   só somada, exatamente como a nota de R17 acima manda: as funções e as
   linhas citadas foram lidas de volta depois da troca, não só calculadas.

   A FUGA COBRA, EM TRÊS RODADAS (frontend, R22): ligar `rolarOCustoDaFuga`,
   a consequência que não é dano e a volta ao território (`fuga.js`) somou
   código em QUATRO pontos do arquivo, e desta vez o deslocamento tem
   degraus: +5 depois de `sementeMundo` (a semente única da fuga), +6 mais
   depois de `abrirCombate` (zera a marca do território a cada luta nova) —
   total +11 até `fecharSeTodosCairam`; +8 ali (fecha o relógio do
   território vencido) — +19 até o corpo de `golpesAoSair`/`fugirDaLuta`,
   que trocou de forma (rola com semente, não só com `Math.random`) e ainda
   somou a consequência — +53 dali até `talvezCacar`; +72, +93 e +95 nos
   três acréscimos de `talvezVoltarAoTerritorio` e do bando numerado,
   ainda antes de `tiquear`; +121 depois do ramo `fuga:` em `tiquear`. Todo
   endereço abaixo de `fecharSeTodosCairam` foi RE-MEDIDO por conteúdo
   contra `git show HEAD:src/App.jsx` de antes desta etapa (o script e a
   conferência ficam no diário do ciclo) — não somado por aritmética de
   cabeça, pela mesma razão de sempre: um degrau errado aponta pro lugar
   errado e a régua fica verde mentindo. Uma entrada (`conjuracao` / 📕)
   já citava o endereço ERRADO antes desta etapa — a nota ao lado dela
   explica.

   O GOLPE FINAL DIVIDE UMA FUNÇÃO EM TRÊS (frontend, 29/09, MM3). Ligar o
   golpe final (Q3+Q5) empurrou linhas em DOIS DEGRAUS, não um só: +41 até
   `presencaNaLuta` (imports novos perto do topo e o bloco de UI do cartão em
   `PainelLateral`, ambos acima dela), mais uma dezena até `aMesaEspera` e
   `tentarReacaoNoGolpe` (os hooks novos do estado do cartão, perto de
   5396-8251), e a partir daí +62 estável até `aplicarGolpeDoJogador` — nada
   disso é a mudança estrutural, é só o teto do arquivo subindo.

   A MUDANÇA ESTRUTURAL é onde o delta pula de +62 para +150: `aplicarGolpe-
   DoJogador` foi PARTIDA EM TRÊS. Ela continua a resolver o ataque e as duas
   recusas (alcance, economia) — por isso a entrada dela abaixo desce de 3
   `linhas` para 2, e a terceira ("o golpe do jogador: dano, PV do alvo e a
   aflição da arma") MUDOU DE FUNÇÃO, não desapareceu: mora agora em
   `continuarGolpeDoJogador`, nova, logo depois, com a mesma frase e o mesmo
   `misto: true`. Uma terceira, `responderGolpeFinal`, fecha o trio sem
   `pushMsgs` nenhum (só fecha o cartão e retoma a segunda) e por isso não
   entra no funil. As duas novas custam +88 linhas líquidas a partir daqui
   (a lógica de perguntar o cartão dentro de `aplicarGolpeDoJogador`, mais o
   corpo inteiro de `continuarGolpeDoJogador`), e é esse +88 que soma ao +62
   e dá o +150 que `declararGolpe` em diante carrega. Todo endereço abaixo
   foi RE-MEDIDO por conteúdo contra o `src/App.jsx` de antes desta etapa —
   não por soma de delta — pela mesma razão de sempre: um degrau errado
   aponta pro lugar errado.

   IDA E VOLTA, MESMO DIA (frontend, 29/09, MM3). Depois da medição acima, o
   `frontend` somou +2 linhas de depuração (`console.warn("[MM3-DEBUG] …")`)
   dentro de `aplicarGolpeDoJogador` para um diagnóstico ao vivo — tudo de
   `continuarGolpeDoJogador` em diante andou +2 —, e ao fechar o diagnóstico
   removeu as 4 linhas de debug que chegaram a existir (essas 2, mais 2 que
   tinham nascido depois em `continuarGolpeDoJogador`/`responderGolpeFinal`),
   o que trouxe todo endereço de volta ao valor de antes de qualquer debug.
   Todo endereço abaixo de `continuarGolpeDoJogador` foi re-medido de novo
   pelo mesmo método; nenhuma linha nova nasceu nem sumiu nesta volta — só
   o teto subiu e desceu.

   A PENEIRA DA AGRESSÃO (frontend, MM, 29/09). `resolverAtaqueJogador`
   tinha o MESMO defeito da agressão fora do combate: o verbo cru casava
   "posso atacar?" pelo "atacar" que casa "ataco". A fiação ganhou uma
   peneira (`soODeclarado`/`ehDeclaracaoDeAtaque`, ambas de peneira.js/
   agressao.js) bem no topo da função, ANTES de qualquer `linhas` desta
   tabela — três degraus de deslocamento, e nenhum muda o que cada entrada
   afirma sobre o próprio código:
     +1  de um novo import no topo do arquivo (`soODeclarado`,
         `NAO_E_AGRESSAO`) — empurra tudo abaixo de `presencaNaLuta`.
     +13 do corpo novo dentro de `resolverAtaqueJogador` (comentário e
         `try/catch` da peneira) — empurra tudo de `aplicarGolpeDoJogador`
         em diante (a própria `resolverAtaqueJogador` fica só +1, porque o
         corpo novo entra DEPOIS da linha do seu `onde`).
     +4  do elenco de nomes que `sinaisDoTurno` passa a `ehAgressao` (uma
         função fora deste funil, mas que empurra tudo abaixo dela) —
         empurra tudo de `fecharSeTodosCairam` em diante.
   Total: +1 até `aplicarGolpeDoJogador` (inclusive a própria
   `resolverAtaqueJogador`), +14 dali até `fecharSeTodosCairam`
   (exclusive), +18 de `fecharSeTodosCairam` em diante. Todo endereço foi
   RE-MEDIDO por conteúdo contra o `src/App.jsx` desta etapa — cada
   `onde` abaixo foi conferido linha a linha contra um `pushMsgs(` de
   verdade (ou, para o `fn`, contra a própria declaração) — não por soma
   de cabeça, pela mesma razão de sempre. */
/* O ESCONDIDO ENTRA NO FUNIL (frontend, MM6, 29/09). Ligar o estado
   escondido (nascer de um teste passado, cair por ato ou por ser achado, o
   Ataque Furtivo na regra do 5e) somou código em vários pontos do arquivo,
   cada um empurrando tudo que vem depois dele — e nenhum foi re-medido de
   cabeça: todo endereço abaixo saiu de RODAR `check-acoes-do-jogador.mjs`,
   que falha nomeando o valor certo, e foi conferido de novo depois da
   troca, até a corrida ficar limpa. É o mesmo método de R17 em diante, só
   que a régua desta vez fez a soma sozinha.

   UMA LINHA NOVA NASCEU: `resolverRevide` ganhou o "ser achado" (a passiva
   de quem procura, ou quem já tinha o herói a descoberto) — 29 chamadas
   viram 30, e o funil inteiro sobe de 57 para 58. É `voz: "frase"` (o
   Narrador lê "Fulano acha você") e `nasce` em `src/escondido.js`, não no
   App — a primeira linha desta função que nasce inteira fora do React. */
/* A CIDADE POR DENTRO (frontend, MM12, 29/09). A fiação de
   `fichaParaPauta` (cidade-por-dentro.js) entrou em `pautaDoTurno`, muito
   acima de `presencaNaLuta` no arquivo — um import no topo (+1, empurra
   TODO o funil) e o try/catch de treze linhas logo depois de `daqui` na
   pauta (+13 a mais para tudo que vem depois dele). Nenhuma função do
   funil mudou de forma; só o endereço andou:
     +1  em `presencaNaLuta` (fica antes do try/catch de pautaDoTurno).
     +14 em todas as outras — de `aMesaEspera` a `virarChefeSePreciso` —,
         que ficam depois dele.
   Todo `onde` abaixo foi RE-MEDIDO por `check-acoes-do-jogador.mjs`, que
   falha nomeando o valor certo; nada foi somado de cabeça. */
/* OS TETOS DAS PESSOAS (frontend, MM8c-1, 29/09). A recência do registo de
   NPCs (`normalizarRecencia`, `retomarContador` em npcs.js) somou código em
   quatro pontos do App.jsx, cada um empurrando tudo que vem depois: a ref
   `npcTurnoNoLoadRef` ao lado de `npcTurnoRef` (+3), o cálculo de `emCena`
   antes do QUEM do rodapé (+8), o 14º argumento novo de `montarSystemPrompt`
   na chamada por turno de `enviar` (+2), e a normalização do registo no
   capítulo/load (+7 juntos). Nenhuma função do funil mudou de forma; todo
   `onde` abaixo de `resolverAtaqueJogador` (que já mora depois dos quatro
   pontos) sobe +20 — os de cima (`presencaNaLuta` a `aflicaoDeCompanheiro`)
   sobem só +3, pela ref nova, que é o único dos quatro pontos que mora
   acima deles. Re-medido por `check-acoes-do-jogador.mjs`, que falha
   nomeando o valor certo; nada foi somado de cabeça. */
/* A GENTE QUE PESA (frontend, MM8c-2, 30/09). O elenco (MM8b) passou a
   pesar na narração: um import novo de `elenco.js` (+1, logo abaixo do
   import de `nomes.js`) e o contexto/nomes do elenco — `contextoDoElenco`,
   `nomesDoElenco` — logo depois de `sementeMundo` (+5) somam +6 ACIMA de
   todo o funil, num único ponto. Nenhuma função do funil mudou de forma;
   todo `onde` abaixo sobe uniformemente +6. Re-medido por
   `check-acoes-do-jogador.mjs`, que falha nomeando o valor certo; nada foi
   somado de cabeça. */
/* A GENTE QUE PESA, MEDIDA E CACHEADA (frontend, MM8c-2, 30/09). Medido:
   `elencoDoMundo` custa ~40ms por chamada num mundo típico (~11 cidades), e
   `nomesDoElenco()` corria 3x dentro do MESMO turno com o MESMO
   semente/mapa/espinha/guildas/base — três recomputações idênticas. Como
   todo estado aqui é substituído e nunca mutado (a lei da casa), "mesma
   referência" já prova "mesmo conteúdo": um cache por identidade
   (`elencoCacheRef`) substitui as 3 chamadas por 1 cálculo + 2 acertos de
   cache. As 9 linhas novas (eram 1) somam +10 ACIMA de todo o funil, no
   mesmo ponto do acréscimo anterior. Nenhuma função do funil mudou de
   forma; todo `onde` abaixo sobe uniformemente +10. Re-medido por
   `check-acoes-do-jogador.mjs`, que falha nomeando o valor certo; nada foi
   somado de cabeça. */
/* A PROMOÇÃO (frontend, MM8e, 30/09). Desta vez o delta NÃO é uniforme: são
   QUATRO pontos de +1 linha cada, espalhados pelo corpo do componente (o
   ref do save `elencoSaveRef`, logo abaixo de `npcsRef`; a saída na pauta,
   dentro de `pautaDoTurno`; os vistos por turno, logo após
   `conferirNemesisNaNarrativa`; a promoção ao virar o dia, dentro do laço
   de `avancarDiasReino`). `presencaNaLuta` (a única entrada acima de todos
   os quatro pontos) sobe só +1; as cinco entradas entre o primeiro ponto e
   o segundo (`aMesaEspera` até `aflicaoDeCompanheiro`) sobem +2; e tudo de
   `resolverAtaqueJogador` em diante — depois do terceiro ponto — sobe +3.
   Nenhuma função do funil mudou de forma. Re-medido por
   `check-acoes-do-jogador.mjs`, que falha nomeando o valor certo; nada foi
   somado de cabeça. */
/* A LUTA SEM ESPADA (frontend, MM9, 30/09). Sete pontos, todos ACIMA do
   funil ou dentro de uma das suas próprias funções — nenhum abaixo dele:
     +5  logo no import (sem-espada.js) — sobe TUDO abaixo, incluindo o funil inteiro.
     +7  o ref/helper da impressão (`impressionouRef`), acima do funil — sobe tudo de `aMesaEspera` em diante (+12).
     +4  dentro de `continuarGolpeDoJogador` (a rodada que impressiona) — sobe `declararGolpe` em diante (+16).
     +14 dentro de `fecharSeTodosCairam` (os prisioneiros na pauta) — sobe `resolverRevide` em diante (+30).
     +27 dentro de `rolarDesafio` (fora do funil) — sobe `virarChefeSePreciso` (+85, com o ponto seguinte).
   Nenhuma função do funil mudou de forma nem ganhou/perdeu `pushMsgs`.
   Re-medido por `check-acoes-do-jogador.mjs`, que falhou nomeando o valor
   certo em cada função; os endereços internos (`linhas[].onde`) seguiram
   o mesmo delta do trecho onde vivem — nada somado de cabeça. */
/* AS PERGUNTAS AO MESTRE (frontend, MM14, 30/09): não-uniforme, por trecho —
   `presencaNaLuta` sobe +3 (o import novo de perguntas.js, acima de todo o
   resto); `aMesaEspera` até `resolverHabilidadeOfensiva` sobem +21 (a mesa
   de PERGUNTOU dentro de `pautaDoTurno`, ACIMA destas, mais a pergunta que
   não gasta a vez dentro de `agirInterno`, entre elas e o restante);
   `fecharSeTodosCairam` até `moverPara` sobem +38 (o relógio que não anda
   quando só se pergunta, ACIMA delas); `virarChefeSePreciso` sobe +44 (o
   dia/minuto que `andarOSino` passou a receber, ACIMA dela). Nenhuma
   função do funil mudou de forma nem ganhou/perdeu `pushMsgs`. Re-medido
   por `check-acoes-do-jogador.mjs`, que falhou nomeando o valor certo em
   cada uma; os endereços internos seguiram o mesmo delta do trecho onde
   vivem — nada somado de cabeça. */
/* OS DOIS CANAIS ANTIGOS (frontend, MM14, 30/09): não-uniforme, por
   trecho — `presencaNaLuta` até `aflicaoDeCompanheiro` sobem +1 (o import
   novo de `tarefas-antigas.js` no topo, acima de tudo); `resolverAtaqueJogador`
   até `resolverRevide` e `moverPara` DESCEM -25 (a migração das tarefas
   antigas somou 21 linhas na fiação do load, mas a remoção dos dois canais
   que fechavam a lista antiga pelo título — o `forEach` de
   `quest_atualizar` no Narrador e o `casar`/`concluidas`/`falhadas`/
   `progresso` do Cronista — tirou 46, líquido -25, tudo ACIMA destas
   funções); `virarChefeSePreciso` desce -16 (a paga da tarefa antiga no
   fecho de `conferirAsMissoes` soma 9 acima dela, e o líquido das duas
   pontas ainda fecha em -16). Nenhuma função do funil mudou de forma nem
   ganhou/perdeu `pushMsgs`. Re-medido pelo diff de App.jsx contra HEAD
   (`git diff --unified=0`), que dá o endereço exato de cada linha movida
   ou apagada — nada somado de cabeça. */
/* A EXTRAÇÃO DE fichasDaMesa (frontend, MM14 · o resto do nº 6, 30/09):
   uniforme, +18 em TODA função do funil de `aMesaEspera` em diante
   (`presencaNaLuta`, acima do ponto de entrada, não muda). O cálculo das
   três fichas (cidade, gente, mercado), que morava dentro do corpo de
   `pautaDoTurno`, mudou-se para uma função nova, `fichasDaMesa`, chamada
   de dentro de `pautaDoTurno` — para que o sinal do oráculo
   (`ehPerguntaAoMundo`, em `sinaisDoTurno`) também pudesse perguntar às
   fichas antes de rolar o d100, sem duplicar o cálculo. `fichasDaMesa`
   nasce ACIMA de `pautaDoTurno` no arquivo, e o texto que ganhou (a
   função inteira) é maior que o texto que `pautaDoTurno` perdeu (o
   cálculo, que ficou mais curto ali — agora é só uma chamada) — líquido
   +18 no arquivo inteiro, tudo ACIMA do funil. Nenhuma função do funil
   mudou de forma nem ganhou/perdeu `pushMsgs`. Re-medido por
   `check-acoes-do-jogador.mjs`, que falha nomeando o valor certo; nada
   somado de cabeça. */
/* A LIGAÇÃO NÃO É O MESTRE (frontend, MM15 (3), 30/09): não-uniforme, por
   trecho — a fiação nova é a foto do turno (`retratoDoJogo`/
   `soltosDoTurno`/`aplicarRetrato`, MM15 (3)), que nasce logo ANTES de
   `salvar` no arquivo:
     +13 em `presencaNaLuta` (o import de `guardado.js` ganhou nomes novos
         e o `fotoInicioRef` nasceu ao lado de `guardadoRef`, os dois acima
         de todo o funil).
     +17 em `aMesaEspera` (o bloco de `retratoDoJogo`/`soltosDoTurno`/
         `aplicarRetrato` inteiro nasce entre ela e `salvar`).
     +92 de `tentarReacaoNoGolpe` a `aflicaoDeCompanheiro` (o mesmo bloco,
         que é maior que o literal de `salvar` que substituiu).
     +162 de `resolverAtaqueJogador` a `resolverHabilidadeOfensiva` (idem,
         mais a foto do topo de `enviar` e o `let respondeu = false`,
         ambos acima destas).
     +168 de `fecharSeTodosCairam` em diante — `agirInterno` também ganhou
         a sua própria foto, logo depois da trava, e soma mais 6 linhas
         só para quem vem depois dela no arquivo.
   Nenhuma função do funil mudou de forma nem ganhou/perdeu `pushMsgs`.
   Re-medido por `check-acoes-do-jogador.mjs`, que falha nomeando o valor
   certo em cada função; os endereços internos (`linhas[].onde`) seguiram
   o mesmo delta do trecho onde vivem, exceto as recusas de `agirInterno`
   em RECUSAS_DO_COMBATE — a foto que a própria etapa acrescentou DENTRO
   de `agirInterno` soma mais 6 além do delta da função, e a recusa `teto`
   ainda leva +17 a mais que as outras porque mora no `else` do MESMO
   bloco `if` das três de `economia`, abaixo delas no código (não é a
   ordem em que a tabela as lista) — as seis foram re-medidas por
   conteúdo, uma a uma, com o motivo escrito ao lado de cada uma. */
/* O SEGREDO GUARDADO (frontend, MM15 (4), 30/09): não-uniforme, por trecho —
   cinco pontos nasceram ACIMA do funil nesta etapa (o import de
   segredo-guardado.js; o veto na pauta, logo após vetosDaAbertura; a
   peneira do cânone na porta do Narrador; mundoDaBase, perto de
   mundoDasTarefas; e a peneira do cânone na porta do Cronista), mais um
   SEXTO abaixo do funil (segredos: no ctxDesafio):
     +1 em `presencaNaLuta` (só o import, acima de tudo o resto).
     +6 de `aMesaEspera` a `aflicaoDeCompanheiro` (o import mais o veto
         na pauta, os dois acima deste trecho).
     +21 de `resolverAtaqueJogador` a `moverPara` — e as recusas de
         RECUSAS_DO_COMBATE que vivem nestas mesmas funções — (os cinco
         primeiros pontos, todos acima deste trecho no arquivo).
     +24 em `virarChefeSePreciso` (os seis pontos, o sexto já abaixo do
         funil mas acima dela).
   Nenhuma função do funil mudou de forma nem ganhou/perdeu `pushMsgs`.
   Re-medido por `check-acoes-do-jogador.mjs`, que falha nomeando o valor
   certo em cada função; os endereços internos (`linhas[].onde`) e os de
   RECUSAS_DO_COMBATE seguiram o mesmo delta do trecho onde vivem — e os
   que o varredor não cobre (coincidência de `pushMsgs` na linha velha)
   foram re-medidos por conteúdo contra o código, não só contra a catraca. */
/* OS NOMES QUE SE FUNDEM (frontend, MM15 (5), 30/09): uniforme, +4 — de
   `resolverAtaqueJogador` em diante (toda entrada de 13013 para cima na
   numeração velha). `contextoDoNome` ganhou `conhecidos` (o mural) e
   `recentes` (a conversa), ACIMA de `resolverAtaqueJogador` no arquivo —
   as seis primeiras funções do funil (`presencaNaLuta` a
   `aflicaoDeCompanheiro`) vivem ANTES desse ponto e por isso NÃO se
   movem. A outra fiação da etapa (a guarda de `pessoaNaFrente`, pelo
   mesmo motor da procura) foi escrita para caber no número de linhas de
   antes, de propósito — não soma delta. Nenhuma função do funil mudou de
   forma nem ganhou/perdeu `pushMsgs`. Re-medido por
   `check-acoes-do-jogador.mjs`, que falhou nomeando o valor certo em
   quase toda entrada; as que ele não cobriu por coincidência de
   `pushMsgs` na linha velha (as duas primeiras recusas de `economia` em
   `agirInterno`, e a entrada `aMesaEspera`/`turno-guardado`, que fica
   ANTES do ponto e não deveria mover) foram re-medidas por conteúdo. */
/* O COMPANHEIRO DE ANTES (frontend, 01/10): dois pontos, um uniforme e um
   não.
     +1 em TODA entrada (o import de companheiro-inicial.js no topo do
         arquivo).
     +24 de `resolverAtaqueJogador` em diante (toda entrada de 13017 para
         cima na numeração velha): a fiação do companheiro nasce dentro de
         `iniciar`, bem ACIMA deste trecho — nasce depois da abertura (a
         pista já escolhida), entra pelo juntar, e o pedido da abertura o
         leva. As seis primeiras funções do funil (`presencaNaLuta` a
         `aflicaoDeCompanheiro`) vivem antes desse ponto e por isso só
         levam o +1 do import.
   Nenhuma função do funil mudou de forma nem ganhou/perdeu `pushMsgs`.
   Re-medido por `check-acoes-do-jogador.mjs`, que falhou nomeando o valor
   certo em quase toda entrada; a única que ele não cobriu por coincidência
   de `pushMsgs` na linha velha (a recusa de `economia` "Sua ação deste
   turno já saiu", em `agirInterno`) foi re-medida pela mesma regra — o
   deslocamento é uniforme por trecho, e ela mora no mesmo trecho das
   outras duas recusas de `agirInterno` que o varredor cobriu. */
/* A MASMORRA QUE SE ACABA (orquestrador, 05/10, v9.348): três faixas de delta,
   medidas pelo diff de `src/App.jsx` contra o HEAD (e confirmadas pelo
   varredor, que re-deriva cada endereço do código).
     -12 de `resolverAtaqueJogador` até `fecharSeTodosCairam` (e as linhas
         dela): o bloco do chefe saiu do ramo do Narrador (~:10223, 17 linhas
         viraram 5) e virou `concluirMasmorraDoChefe`, mais abaixo no arquivo.
         Tudo o que vem depois dele andou -12.
     +41 de `resolverRevide` e `moverPara` em diante: aos -12 somam-se +24 e
         +29, as duas fiações novas do fecho do sistema (`fecharSeTodosCairam`:
         o desfecho da sala da masmorra e o helper do chefe), que nascem
         ACIMA delas no arquivo.
     +44 em `virarChefeSePreciso`: ao +41 soma-se o saldo +3 do ramo
         combate/chefe de `irParaSala` (:20327), que passou a usar
         `abreLuta`/`linhaDaLuta`/`envelopeDaLuta` de src/masmorras.js
         (as frases e o envelope da luta de masmorra saíram do App).
   Houve UMA mudança de forma, e ela está escrita onde mora: `fecharSeTodosCairam`
   ganhou o pushMsgs do chefe que cai (a masmorra se conclui por código,
   telegrama puro), logo ela declara 4 linhas e não 3, o funil tem 60
   chamadas e não 59, e a voz que nasce no App.jsx passa de 36 para 37
   (teste-acoes-do-jogador.mjs, bloco 9, com o motivo ao lado). Nenhuma outra
   função do funil mudou de forma. */
export const FUNIL_DO_COMBATE = [
  { fn: "presencaNaLuta", onde: "src/App.jsx:6011", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:6048", evento: "presença divina na abertura da luta — condição imposta ao herói, ao grupo ou aos inimigos",
        voz: "frase", nasce: "src/presenca-divina.js (resolverPresenca, presencaDoHeroiEmCombate)" },
    ] },
  { fn: "aMesaEspera", onde: "src/App.jsx:8353", anel: "borda",
    linhas: [
      { onde: "src/App.jsx:8357", evento: "a trava do turno guardado: o motor já rolou e a narração não chegou",
        voz: "recusa", nasce: "src/App.jsx" },
    ] },
  { fn: "tentarReacaoNoGolpe", onde: "src/App.jsx:8716", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:8734", evento: "a reação dispara (aparar, esquivar, retribuir)",
        voz: "frase", nasce: "src/reacoes.js (resolverReacao)" },
      { onde: "src/App.jsx:8775", evento: "o contra-ataque da reação acerta ou erra",
        voz: "telegrama", nasce: "src/App.jsx" },
    ] },
  { fn: "aplicarCondicoesDosGolpes", onde: "src/App.jsx:8782", anel: "nucleo",
    linhas: [
      /* R15: +28 com o comentário novo em `salvar`. Re-endereçado à mão
         porque o conteúdo desta linha (`pushMsgs([{ autor: "sistema", texto:
         res.texto }])`) aparece DUAS vezes no arquivo e o re-endereçador
         recusou-se a adivinhar entre :8141 e :8197 — está certo que se
         recusasse. É :8197: mesma indentação e o mesmo `if (!res) continue;`
         da salvaguarda logo acima.
         R17: 8197 -> 8290, pelo mesmo par (a outra ocorrência, dentro de
         `tentarReacaoNoGolpe`, está em :8234). */
      { onde: "src/App.jsx:8806", evento: "o golpe do inimigo impõe (ou não) uma aflição ao herói",
        voz: "frase", nasce: "src/aflicoes.js (rolarAflicao)" },
    ] },
  { fn: "limparConjuracoesDaLuta", onde: "src/App.jsx:8894", anel: "borda",
    linhas: [
      { onde: "src/App.jsx:8901", evento: "a forma animal se desfaz ao fim da luta",
        voz: "frase", nasce: "src/habilidades.js (desfazerForma)" },
      { onde: "src/App.jsx:8908", evento: "a guarda do herói baixa ao fim da luta",
        voz: "frase", nasce: "src/habilidades.js (baixarGuardas)" },
      { onde: "src/App.jsx:8925", evento: "a guarda de cada companheiro baixa ao fim da luta",
        voz: "frase", nasce: "src/habilidades.js (baixarGuardas)" },
      { onde: "src/App.jsx:8931", evento: "a pressa acaba ao fim da luta",
        voz: "frase", nasce: "src/habilidades.js (baixarPressa)" },
    ] },
  { fn: "aflicaoDeCompanheiro", onde: "src/App.jsx:9229", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:9236", evento: "a arma do companheiro envenena/queima o inimigo",
        voz: "frase", nasce: "src/aflicoes.js (rolarAflicao)" },
    ] },
  { fn: "resolverAtaqueJogador", onde: "src/App.jsx:13104", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:13262", evento: "atacou, apareceu — a invisibilidade se rompe pelo golpe",
        voz: "frase", nasce: "src/gatilhos.js (romperPorGatilho)" },
    ] },
  { fn: "aplicarGolpeDoJogador", onde: "src/App.jsx:13284", anel: "nucleo",
    /* núcleo por COMPORTAMENTO e não por guarda própria: sem luta,
       `resolverAtaqueJogador` devolve `null` na primeira linha e ela sai em
       `:12682` com `false`, sem falar. É a função que a sessão A percorre
       sete vezes.
       MM3 (29/09): esta entrada tinha 3 `linhas` e passa a ter 2. A terceira
       ("o golpe do jogador: dano, PV do alvo e a aflição da arma") NÃO
       SUMIU — mudou de função. `aplicarGolpeDoJogador` agora só resolve o
       ataque e as duas recusas; quando não há cartão do golpe final para
       perguntar (ou a preferência já decidiu sozinha), ela chama
       `continuarGolpeDoJogador(acao, pers, ataque, null)`, que é quem de
       fato aplica o dano e empurra aquela linha — nova entrada, logo abaixo. */
    linhas: [
      { onde: "src/App.jsx:13290", evento: "recusa por alcance — o golpe digitado não alcança ninguém",
        voz: "recusa", nasce: "src/App.jsx:12568 (o literal do motivo)" },
      { onde: "src/App.jsx:13298", evento: "recusa por economia — a ação da rodada já saiu",
        voz: "recusa", nasce: "src/App.jsx" },
    ] },
  /* MM3 (frontend, 29/09): ENTRADA NOVA. `continuarGolpeDoJogador` nasceu da
     divisão de `aplicarGolpeDoJogador` em três (a divisão está descrita no
     comentário da entrada acima e no cabeçalho do bloco). Ela é NÚCLEO por
     CADEIA DE CHAMADA e não por guarda própria: os únicos dois chamadores —
     o `return continuarGolpeDoJogador(...)` no fim de `aplicarGolpeDoJogador`
     (que só corre com `ataque` já resolvido, isto é, com combate) e
     `responderGolpeFinal` (que só existe porque `golpeFinalCtxRef.current`
     foi armado por `aplicarGolpeDoJogador`, também sob combate) — estão os
     dois dentro do ciclo do turno. É a mesma lógica que já classificava
     `aplicarGolpeDoJogador` de núcleo sem guarda própria, um degrau adiante
     na mesma cadeia. */
  { fn: "continuarGolpeDoJogador", onde: "src/App.jsx:13334", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:13423", evento: "o golpe do jogador: dano, PV do alvo e a aflição da arma",
        voz: "telegrama", misto: true, nasce: "src/App.jsx (o ⚔) + src/aflicoes.js (a aflição)" },
    ] },
  { fn: "declararGolpe", onde: "src/App.jsx:13513", anel: "nucleo",
    /* núcleo pela FIAÇÃO: o único chamador é o `onClick` das ACOES_PRONTAS
       sob `golpeVivo`, que exige `vdGolpe` — e `vereditoDoGolpeAgora`
       devolve `null` fora da luta. O botão não existe fora dela. */
    linhas: [
      { onde: "src/App.jsx:13528", evento: "recusa por alcance — o clique chegou e o veredito diz não",
        voz: "recusa", nasce: "src/App.jsx:1192 (recusaDoGolpe)" },
    ] },
  { fn: "resolverHabilidadeOfensiva", onde: "src/App.jsx:13548", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:13574", evento: "a ceifa leva de uma vez quem estava abaixo do limiar",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:13576", evento: "a ceifa varre o campo e não acha ninguém abaixo do limiar",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:13675", evento: "o alvo está abaixo do limiar e a execução vale",
        voz: "telegrama", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:13903", evento: "a habilidade ofensiva resolvida: acerto, dano, dreno, imunidade por degrau",
        voz: "telegrama", misto: true, nasce: "src/App.jsx" },
    ] },
  { fn: "fecharSeTodosCairam", onde: "src/App.jsx:15384", anel: "borda",
    linhas: [
      { onde: "src/App.jsx:15423", evento: "a forma animal se desfaz quando a luta acaba",
        voz: "frase", nasce: "src/habilidades.js (desfazerForma)" },
      { onde: "src/App.jsx:15437", evento: "a luta termina sem ninguém derrotado — sem espólios",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15533", evento: "vitória: todos caíram, e os espólios",
        voz: "telegrama", misto: true, nasce: "src/App.jsx" },
      /* A MASMORRA QUE SE ACABA (v9.348, 05/10): a luta de uma sala que o SISTEMA
         fecha agora também conclui a masmorra quando a sala é a do chefe — o
         tesouro do fundo (moedas, essência, o item) e as tochas que voltam saem
         por `concluirMasmorraDoChefe`, e o App empurra as linhas dela aqui.
         Telegrama puro (números, sem frase de mesa): conta no funil e nada mais. */
      { onde: "src/App.jsx:15556", evento: "o chefe caiu: a masmorra se conclui, com o tesouro do fundo e as tochas",
        voz: "telegrama", nasce: "src/App.jsx (concluirMasmorraDoChefe)" },
    ] },
  { fn: "resolverRevide", onde: "src/App.jsx:15819", anel: "nucleo",
    /* a maior boca do funil, e de longe: 31 das 59 chamadas do caminho de
       combate saem daqui (MM6 somou o "ser achado"; MM7 somou o golpe de
       oportunidade de quem recua para disparar). É a vez do mundo inteira
       — inimigos, grupo, prazos e quedas — num corpo só. */
    linhas: [
      { onde: "src/App.jsx:15838", evento: "abre a vez do mundo e diz a rodada",
        voz: "telegrama", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15838", evento: "o inimigo dá as costas e leva o golpe de oportunidade",
        voz: "frase", nasce: "src/App.jsx" },
      /* MM7: ENTRADA NOVA — o mesmo golpe de oportunidade de cima, para quem
         recua em vez de fugir (o atirador que abre distância para disparar,
         `postoDoAtirador`/`m.provoca` em grid.js). Mesmo auxiliar
         (`golpeDeOportunidadeDoHeroi`), mesma família de voz; só o gatilho
         muda — recuo, não fuga. */
      { onde: "src/App.jsx:15914", evento: "o atirador recua para disparar e leva o golpe de oportunidade do herói",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15890", evento: "o passo do inimigo no tabuleiro",
        voz: "frase", nasce: "src/App.jsx:5743 (linhaDePasso)" },
      { onde: "src/App.jsx:15947", evento: "o passo do aliado no tabuleiro",
        voz: "frase", nasce: "src/App.jsx:5743 (linhaDePasso)" },
      { onde: "src/App.jsx:15961", evento: "alguém que estava de olho me acha (a passiva, a descoberto, ou quem procurou)",
        voz: "frase", nasce: "src/escondido.js (revisarEscondido)" },
      { onde: "src/App.jsx:16130", evento: "o golpe de cada inimigo: acerto, dano, amortecimento, abrigo",
        voz: "telegrama", misto: true, nasce: "src/App.jsx (o ⚔) + src/tracos.js (amortecerDano)" },
      { onde: "src/App.jsx:16169", evento: "a concentração cai com o dano sofrido",
        voz: "frase", nasce: "src/combate.js (testeConcentracao)" },
      { onde: "src/App.jsx:16181", evento: "o dano rompe a invisibilidade",
        voz: "frase", nasce: "src/gatilhos.js (romperPorGatilho)" },
      { onde: "src/App.jsx:16195", evento: "a Dádiva da Recuperação segura a queda",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:16203", evento: "a guarda segura a queda em 1 PV",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:16215", evento: "a fúria persistente segura a queda em 1 PV",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:16247", evento: "Voz de Comando: as invocadas agem de novo",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:16293", evento: "a rolagem do golpe do companheiro (só com `mostrarRolagens`)",
        voz: "telegrama", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:16316", evento: "o golpe do companheiro: dano ou erro",
        voz: "telegrama", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:16320", evento: "a rolagem da habilidade do companheiro (só com `mostrarRolagens`)",
        voz: "telegrama", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:16343", evento: "a arma do companheiro impõe aflição",
        voz: "frase", nasce: "src/aflicoes.js (rolarAflicao)" },
      /* MM3 (29/09): esta linha e a de "o herói chega a zero e rola a
         queda", abaixo, citavam o MESMO endereço que outra entrada desta
         função havia anos (era uma coincidência antiga, não desta etapa —
         a nota de R17 logo abaixo já registrava o padrão). Com o arquivo
         inteiro re-medido por conteúdo nesta etapa, as duas ganham agora o
         endereço PRÓPRIO, distinto de qualquer outra entrada. */
      { onde: "src/App.jsx:16346", evento: "a habilidade ofensiva do companheiro",
        voz: "telegrama", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:16351", evento: "a cura do companheiro num aliado",
        voz: "telegrama", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:16356", evento: "o companheiro bebe uma poção",
        voz: "frase", nasce: "src/App.jsx:8676 (pocaoDeCompanheiro)" },
      { onde: "src/App.jsx:16361", evento: "o companheiro ergue um buff",
        voz: "frase", nasce: "src/App.jsx:8701 (buffDeCompanheiro)" },
      { onde: "src/App.jsx:16346", evento: "e o que ele largou para erguê-lo",
        voz: "frase", nasce: "src/App.jsx:8701 (buffDeCompanheiro)" },
      { onde: "src/App.jsx:16393", evento: "o companheiro ergue uma guarda",
        voz: "frase", nasce: "src/habilidades.js (GUARDAS, erguerGuarda)" },
      { onde: "src/App.jsx:16400", evento: "recusa por repetição — a guarda que já está de pé não sobe duas vezes",
        voz: "recusa", nasce: "src/App.jsx (a recusa nasce em src/habilidades.js, erguerGuarda; a frase é do App)" },
      { onde: "src/App.jsx:16435", evento: "o herói chega a zero e rola a queda",
        voz: "frase", nasce: "src/App.jsx:8818 (resolverQueda)" },
      { onde: "src/App.jsx:16450", evento: "a forma animal vence o prazo",
        voz: "frase", nasce: "src/habilidades.js (expirarForma)" },
      /* R17: 14867/14886/14893 (nesta ordem, no texto antigo) coincidiam
         por acidente com OUTRAS três linhas de pushMsgs já existentes no
         código novo (a rolagem/dano do companheiro e a poção) — o dente do
         varredor só verifica se a linha citada TEM um pushMsgs, não qual, e
         ficaria verde nos três apontando para o evento errado. Re-medidos
         por conteúdo contra o corpo de `expirarGuardas`/`expirarPressa`. */
      { onde: "src/App.jsx:16458", evento: "a guarda do herói vence o prazo",
        voz: "frase", nasce: "src/habilidades.js (expirarGuardas)" },
      { onde: "src/App.jsx:16477", evento: "a guarda de cada companheiro vence o prazo",
        voz: "frase", nasce: "src/habilidades.js (expirarGuardas)" },
      { onde: "src/App.jsx:16484", evento: "a pressa vence o prazo",
        voz: "frase", nasce: "src/habilidades.js (expirarPressa)" },
      { onde: "src/App.jsx:16491", evento: "o controle sobre o inimigo arrebenta",
        voz: "frase", nasce: "src/controle.js (expirarControles)" },
      { onde: "src/App.jsx:16499", evento: "a invocação se desfaz no fim do prazo",
        voz: "frase", nasce: "src/invocacoes.js (expirarInvocacoes)" },
    ] },
  { fn: "moverPara", onde: "src/App.jsx:16919", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:16924", evento: "recusa — esta luta não tem terreno",
        voz: "recusa", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:16937", evento: "recusa — uma condição prende o herói no lugar",
        voz: "recusa", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:16953", evento: "recusa por economia — o movimento da rodada acabou",
        voz: "recusa", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:16959", evento: "recusa do passo — fora do campo, ocupado, longe demais, já está aí",
        voz: "recusa", nasce: "src/grid.js:473-508 (caminhar)" },
      { onde: "src/App.jsx:17000", evento: "o passo sai: golpes de oportunidade de quem te alcança e o abrigo",
        voz: "frase", misto: true, nasce: "src/App.jsx" },
    ] },
  /* O crime (frontend, MM10, 30/09): 20095 -> 20098, +3 — o comentário que
     explica por que `lerCrime` tem de correr ANTES de a relação virar
     "inimigo" (a ordem do bug achado no jogo vivo: atacar não registrava
     crime nenhum, porque a vítima já lia como inimigo declarado) cresceu 3
     linhas na mesma função, ACIMA deste ponto. Re-medido por esta própria
     catraca; nada somado de cabeça. */
  { fn: "virarChefeSePreciso", onde: "src/App.jsx:20640", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:20654", evento: "o chefe da masmorra vira de fase",
        voz: "frase", nasce: "src/masmorras.js:722 (falaDaViradaDoChefe)" },
    ] },
];

/* ============================================================
   AS RECUSAS, À PARTE — a correção de escopo que X3b obriga

   POR QUE À PARTE. "Quantos turnos terminam com uma frase" responde
   coisa nenhuma se a frase for `📏 Longe demais`. A sessão A é a prova
   viva: ela fecha SETE turnos com quatorze linhas na tela e ZERO
   narração de evento. Somar recusa a narração daria 0% de silêncio onde
   há 100%, e a medida diria o contrário do que se vê jogando.

   O NÚMERO, E OS DOIS JEITOS DE CONTÁ-LO. X3b escreveu "15 formas de
   recusa com frase em português no caminho de combate". Recontei uma a
   uma, e o 15 não sai de nenhum dos dois cortes possíveis:

     **18 chamadas de recusa** — uma linha desta tabela por call-site.
       Nove no funil, nove no despachante `agirInterno`.
     **25 formas distintas** — cada literal que o jogador pode ler.
       Uma só chamada imprime cinco frases diferentes (`:14718`, que
       repassa os cinco motivos de `caminhar`), e outra imprime três
       (`:12120`, via `recusaDoGolpe`). O campo `formas` diz quantas.

   E são SETE famílias, não cinco: as cinco que a pauta nomeia (alcance,
   economia do turno, teto, repetição, a trava do turno guardado) mais
   duas que ela não nomeia — a CONJURAÇÃO TRAVADA (armadura, forma
   animal, grimório) e a CONDIÇÃO que prende o herói no lugar.

   Onde X3b acertou: o veredito, que é o que importa — recusa é mesmo
   volume comparável ao da narração, e no recorte que mais dói ela é a
   voz ÚNICA (ver `SESSAO_A_PELA_FRASE`). Onde errou: o número, e errou
   para MENOS nos dois cortes, o que só reforça o alerta dele.

   A conta não inclui as recusas do painel de heroísmo
   (`usarHeroismo`, `src/App.jsx:16265-15513`, seis literais `⛔`): elas
   vivem com e sem luta aberta, não pertencem ao ciclo do turno, e
   entrariam só para engordar o número. Ficam escritas aqui, no escopo,
   porque o que se deixa de fora tem de ser dito.

   `anel` diz onde a função que fala mora: `nucleo`/`borda` são do
   funil; `despachante` é `agirInterno` (`src/App.jsx:13850`), que fala
   dentro e fora da luta e por isso não entra no funil — mas a recusa
   que ele diz com a luta aberta é recusa de combate.
   ============================================================ */
/* R17: os `onde` abaixo foram re-medidos por conteúdo (o mesmo método do
   cabeçalho de FUNIL_DO_COMBATE, acima) — e um deles corrigia uma FALHA
   SILENCIOSA que já vinha de antes desta etapa: a entrada `alcance` de
   `agirInterno` (a de baixo, com `nasce: src/App.jsx:12730`) apontava para
   :13986, que ANTES desta etapa também caía num `pushMsgs(` de verdade —
   só que por coincidência de linha, não porque fosse o `pushMsgs` certo.
   O varredor só verifica presença de `pushMsgs(`, não o conteúdo, e por
   isso nunca acusou. Está corrigida para :14097, o `pushMsgs` de
   `desfechoH.motivo` que a frase realmente descreve.

   MM3 (frontend, 29/09): TODOS os 18 endereços abaixo andaram — é o mesmo
   deslocamento do golpe final descrito no cabeçalho de FUNIL_DO_COMBATE
   (+41/+52/+62 até `aMesaEspera`/`aplicarGolpeDoJogador`, +150 daí em
   diante). Cada `onde` foi re-medido por CONTEÚDO — pelo `literal` da
   própria entrada dentro do novo corpo de `agirInterno`/`moverPara`/
   `resolverRevide` — e não por soma de delta, porque `agirInterno` guarda
   três famílias (`alcance`, `economia`, `teto`) a poucas linhas de
   distância e uma conta por aritmética teria trocado uma pela outra.

   IDA E VOLTA, MESMO DIA (frontend, 29/09, MM3): as 14 entradas a partir de
   `declararGolpe` desceram +2 e depois voltaram -2 pela mesma dança de
   `console.warn("[MM3-DEBUG] …")` descrita no cabeçalho de FUNIL_DO_COMBATE
   — nascido e removido dentro de `aplicarGolpeDoJogador` no mesmo dia. As
   duas entradas presas a `aplicarGolpeDoJogador` (alcance/economia, logo
   abaixo) nunca se moveram: o debug entrou DEPOIS delas no corpo da
   função. Re-medido pelo mesmo método, sem linha nova nem perdida.

   A PROMOÇÃO (frontend, MM8e, 30/09): o mesmo delta não-uniforme descrito
   no cabeçalho de FUNIL_DO_COMBATE. A única entrada abaixo do segundo ponto
   e acima do terceiro é `turno-guardado` (`aMesaEspera`, dentro do funil) —
   sobe +2; todas as outras (alcance, economia, teto, repetição, conjuração,
   condição) vivem depois do terceiro ponto e sobem +3. Nenhuma recusa
   mudou de forma. Re-medido por `check-acoes-do-jogador.mjs`. */
/* A LUTA SEM ESPADA (frontend, MM9, 30/09): os cinco pontos descritos no
   cabeçalho de FUNIL_DO_COMBATE, e cada entrada sobe o delta do ponto em
   que vive — nenhum delta uniforme desta vez, porque as famílias estão
   espalhadas por `aplicarGolpeDoJogador`, `declararGolpe`, `agirInterno`,
   `resolverRevide` e `moverPara`, cada um num trecho diferente. Nenhuma
   recusa mudou de forma. Re-medido por `check-acoes-do-jogador.mjs`, que
   falhou nomeando o valor certo em cada entrada. */
/* AS PERGUNTAS AO MESTRE (frontend, MM14, 30/09): mesmo delta não-uniforme
   do cabeçalho de FUNIL_DO_COMBATE — `aplicarGolpeDoJogador`/`declararGolpe`
   sobem +21; as de `agirInterno` (alcance, economia, teto, conjuração) e a
   de `moverPara` (economia) sobem +38 (o relógio que a pergunta que não
   gasta a vez empurrou); `resolverRevide` (repetição) e `turno-guardado`
   (`aMesaEspera`) seguem o mesmo par de deltas do funil, +38 e +21. Nenhuma
   recusa mudou de forma. Re-medido por `check-acoes-do-jogador.mjs`. */
/* OS DOIS CANAIS ANTIGOS (frontend, MM14, 30/09): mesmo par de deltas do
   cabeçalho de FUNIL_DO_COMBATE — `turno-guardado` (`aMesaEspera`) sobe
   +1 (o import de `tarefas-antigas.js` no topo); todas as outras
   (alcance, economia, teto, repetição, conjuração, condição — em
   `aplicarGolpeDoJogador`, `declararGolpe`, `agirInterno`, `resolverRevide`
   e `moverPara`) descem -25 (o líquido entre a migração das tarefas
   antigas, que soma acima delas, e a remoção dos dois canais que fechavam
   a lista antiga pelo título, que tira mais). Nenhuma recusa mudou de
   forma. Re-medido pelo diff de App.jsx contra HEAD, não por soma de
   cabeça. */
/* OS NOMES QUE SE FUNDEM (frontend, MM15 (5), 30/09): o mesmo +4 uniforme
   do cabeçalho de FUNIL_DO_COMBATE, em toda recusa — inclusive as duas
   que o varredor não cobriu por coincidência (`economia` em
   `agirInterno`, mana insuficiente e recarga), re-medidas por conteúdo.
   `turno-guardado` (`aMesaEspera`) NÃO se move: vive antes do ponto onde
   `contextoDoNome` cresceu. Nenhuma recusa mudou de forma. */
/* A MASMORRA QUE SE ACABA (orquestrador, 05/10, v9.348): os mesmos três
   degraus do cabeçalho de FUNIL_DO_COMBATE, aplicados a cada `onde` — -12
   até `agirInterno` e `aplicarGolpeDoJogador`/`declararGolpe`, +41 em
   `resolverRevide` e `moverPara`. Nenhuma recusa nasceu nem sumiu (18
   chamadas, 25 formas, 7 famílias — os totais do bloco 10 não mudaram);
   só os endereços andaram. Conferido pelo varredor, que lê o `pushMsgs(`
   em cada linha, e pelo diff de App.jsx contra o HEAD. */
/* (v9.350 · o como chega) MM16 nº 5, 05/10: +13 em todo endereço do combate, aqui e
   no FUNIL_DO_COMBATE acima. A economia da cidade foi para a seção dela
   (+4) e `cederNaCena` entrou no fim de `pautaDoTurno` (+9), as duas ACIMA
   de todo o combate no arquivo. Nenhuma recusa nasceu nem sumiu; só os
   endereços andaram. Re-medido pelo varredor; os que ele não cobriu por
   coincidência (`:16798` e `:16217`, que depois do degrau caíam sobre o
   `pushMsgs` de outra entrada, e o `:13217` do ondeSai) foram somados pelo
   mesmo delta, que é uniforme neste trecho. A prosa que já citava endereço
   velho antes deste ciclo ficou como estava. */
/* (v9.352 · a masmorra na pauta) MM16 nº 4, 06/10: todo endereço deste
   arquivo andou pelo mesmo diff de App.jsx, e só andou — nenhuma recusa
   nasceu nem sumiu, nenhum total mudou. Os degraus, de cima para baixo: a
   seção MASMORRA em `pautaDoTurno` (+6), o Local do rodapé que lá dentro
   diz a boca e não a estrada (+5), a recusa de combate que saiu de
   `registrarLugar` (-1), a guarda do `lugar_atual` no turno que abre a
   masmorra pelo sinal (+21), o ONDE EU ESTOU calado lá dentro (+3) — +34
   em todo o combate —, e abaixo de `entrarMasmorra` mais +10 (a planta do
   tamanho do mapa e o lugar posto na boca). Re-medido pelo diff de App.jsx
   contra o de antes da etapa (115 endereços, nenhum em linha mudada) e
   conferido pelo varredor; os dois nus do `ondeSai` à mão. A prosa que já
   citava endereço velho ficou como estava. */
export const RECUSAS_DO_COMBATE = [
  /* ---- alcance: a família que a Fase X inteira mede ---- */
  { familia: "alcance", onde: "src/App.jsx:13290", fn: "aplicarGolpeDoJogador", anel: "nucleo", formas: 2,
    literal: "📏 ninguém está ao alcance do seu golpe — <alvo> está em <lugar>, a uns <n> m. Aproxime-se primeiro. / 📏 não há ninguém à vista para acertar — ou há parede no caminho (arma de longe)",
    nasce: "src/App.jsx:12568-12075" },
  /* RE-MEDIDA EM K2 (16/09), e o motivo tem de sobreviver à mudança: as três
     formas continuam três — a voz de recusa NÃO mudou, mudou a redacção dela.
     W2 §3 provou que a frase antiga media 62 caracteres com o nome VAZIO
     contra um teto de 54, logo nenhum aparo de nome a salvaria; foi REDIGIDA,
     não aparada. E mudou de casa junto: `recusaDoGolpe` saiu do `App.jsx` para
     `src/golpe.js`, onde as frases saem de `LINHAS_DO_GOLPE` e um varredor as
     consegue ler — o que no App, dentro de JSX, nunca foi possível. O `onde`
     continua a ser o `pushMsgs` do App, porque é lá que a recusa é DITA; o
     `nasce` passa a apontar a tabela, porque é lá que ela é ESCRITA. */
  { familia: "alcance", onde: "src/App.jsx:13528", fn: "declararGolpe", anel: "nucleo", formas: 3,
    literal: "📏 <alvo> a <n> m — faltam <n> m. / 📏 <alvo> a <n> m — parede, contorne. / 📏 Ninguém de pé ao seu alcance.",
    nasce: "src/golpe.js (recusaDoGolpe, LINHAS_DO_GOLPE)" },
  /* MM15 (3): +168 nas duas — a foto do início do turno que `agirInterno`
     tira logo depois da trava (para o desfeito de uma falha de ligação)
     nasce ACIMA das duas no arquivo, e tudo abaixo andou junto. Re-medido
     por conteúdo (o literal `desfechoH.motivo`/`desfechoC.motivo` ainda é
     o mesmo `pushMsgs`), não por soma de delta. */
  { familia: "alcance", onde: "src/App.jsx:15151", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "📏 <habilidade> não alcança ninguém daqui — <alvo> está em <lugar>, a uns <n> m[ e sem linha de visão]. O alcance de <habilidade> é <n> m.",
    nasce: "src/App.jsx:12920" },
  { familia: "alcance", onde: "src/App.jsx:15284", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "📏 <o mesmo motivo de :12241> — os <n> PM voltaram.",
    nasce: "src/App.jsx:12920" },
  { familia: "alcance", onde: "src/App.jsx:16924", fn: "moverPara", anel: "nucleo", formas: 1,
    literal: "📏 Esta luta não tem terreno definido.", nasce: "src/App.jsx" },
  { familia: "alcance", onde: "src/App.jsx:16959", fn: "moverPara", anel: "nucleo", formas: 5,
    literal: "📏 de onde você está, <lugar> fica longe demais para um deslocamento só. / esse lugar fica fora do campo. / esse lugar está ocupado. / você é <tamanho> demais para caber ali. / você já está aí.",
    nasce: "src/grid.js:473-508 (caminhar)" },

  /* ---- economia do turno: o que já foi gasto não volta ---- */
  { familia: "economia", onde: "src/App.jsx:13298", fn: "aplicarGolpeDoJogador", anel: "nucleo", formas: 1,
    literal: "⏳ Você já usou sua ação nesta rodada — o golpe fica para a próxima.",
    nasce: "src/App.jsx" },
  /* MM15 (3): +168 nas três, mesmo motivo das duas de `alcance` acima —
     a foto do início do turno nasce ACIMA delas em `agirInterno`. */
  { familia: "economia", onde: "src/App.jsx:15059", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "Mana insuficiente para <habilidade> — parei antes dela.", nasce: "src/App.jsx" },
  { familia: "economia", onde: "src/App.jsx:15061", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "⏳ <habilidade> está em recarga (<n>t) — pulei.", nasce: "src/App.jsx" },
  { familia: "economia", onde: "src/App.jsx:15065", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "⏳ Sua ação deste turno já saiu — <habilidade> fica para a próxima rodada.",
    nasce: "src/App.jsx" },
  { familia: "economia", onde: "src/App.jsx:16953", fn: "moverPara", anel: "nucleo", formas: 1,
    literal: "⏳ Você já cobriu os <n> m desta rodada — o próximo passo é no turno que vem.",
    nasce: "src/App.jsx" },

  /* ---- teto: uma por vez ---- */
  /* MM15 (3): +185, não +168 como as outras de `agirInterno` — esta
     recusa mora no `else if` que fecha o mesmo bloco das três de
     `economia` acima, e por isso anda com elas E fica ABAIXO das três no
     arquivo (a ordem do código, não a da tabela). Re-medida por
     conteúdo, não por soma. */
  { familia: "teto", onde: "src/App.jsx:15070", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "✦ <habilidade> fica para depois — fora de combate uso uma habilidade por vez.",
    nasce: "src/App.jsx" },

  /* ---- repetição: o que já está de pé não sobe duas vezes ---- */
  { familia: "repeticao", onde: "src/App.jsx:16400", fn: "resolverRevide", anel: "nucleo", formas: 1,
    literal: "🛡 <companheiro> firma de novo a guarda que já sustenta — nada muda.",
    nasce: "src/habilidades.js (erguerGuarda recusa a repetida); a frase é do App" },

  /* ---- a trava do turno guardado ---- */
  { familia: "turno-guardado", onde: "src/App.jsx:8357", fn: "aMesaEspera", anel: "borda", formas: 1,
    literal: "⏳ O que você acabou de fazer ainda não foi contado, e a mesa não anda sem a palavra do Mestre.",
    nasce: "src/App.jsx (a decisão é de src/guardado.js, travaODeclarar)" },

  /* ---- conjuração travada: a primeira família que X3b não nomeou ---- */
  /* O GOLPE FINAL É DO GRUPO (frontend, 29/09, MM3b): +31 nas quatro desta
     família e na condição abaixo — o estado novo (`golpeFinalCompPendente`,
     linha ~8320) e a função `responderGolpeFinalComp` (logo depois de
     `responderGolpeFinal`) entram ANTES destas quatro no arquivo, e tudo
     abaixo anda junto. Re-medido por conteúdo, não por soma: as quatro
     linhas continuam `pushMsgs(` com o MESMO literal — só o endereço mudou. */
  /* MM15 (3): +168 nas duas — mesmo motivo das de `alcance`/`economia`
     acima: a foto do início do turno em `agirInterno` nasce ACIMA. */
  { familia: "conjuracao", onde: "src/App.jsx:15040", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "⛓ <habilidade> não sai: você não consegue conjurar vestindo <peça>. Tire a peça e tente de novo.",
    nasce: "src/App.jsx" },
  { familia: "conjuracao", onde: "src/App.jsx:15047", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "🐾 <habilidade> não sai: em <forma> você não tem mão nem voz para conjurar.",
    nasce: "src/App.jsx" },
  /* FUGA (frontend, R22): esta entrada citava :14133 antes da etapa — o
     MESMO endereço da recusa ⛓ acima, que nunca foi o dela (a régua
     tolerava porque as duas linhas tinham `pushMsgs(`, e o dente só olha
     se HÁ um pushMsgs, não QUAL). Re-medida por conteúdo contra o código:
     a recusa 📕 é `if (!lanc.ok) { pushMsgs(...) }`, três linhas abaixo.
     MM15 (3): +168, mesmo motivo das duas acima. */
  { familia: "conjuracao", onde: "src/App.jsx:15051", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "📕 <motivo de podeLancar>", nasce: "src/magias.js (podeLancar)" },

  /* ---- a condição que prende: a segunda que X3b não nomeou ---- */
  { familia: "condicao", onde: "src/App.jsx:16937", fn: "moverPara", anel: "nucleo", formas: 1,
    literal: "📏 Você não consegue se mover (<as fontes que prendem>).",
    nasce: "src/condicoes.js (as fontes) — a frase é do App" },
];

/* O ESPELHO DE `NAO_CONTA_COMO_NUMERO`, e pelo mesmo motivo: sem ele a
   taxa da frase vira opinião, e vira opinião A FAVOR de quem mede. A
   recusa vem primeiro de propósito — é a exclusão que mais muda o
   resultado, exatamente como o relógio de 45 min é a que mais muda o do
   número. */
export const NAO_CONTA_COMO_FRASE = [
  { o: "a recusa", porque:
    "o sistema dizendo que a ação NÃO aconteceu não é o mundo acontecendo. São 18 chamadas (25 formas) no caminho de combate, e na sessão A ela é a voz ÚNICA — incluí-la daria 0% de turnos mudos onde a medida honesta é 100% de turnos sem narração de evento" },
  { o: "o eco do jogador (`autor: \"jogador\"`)", porque:
    "é a frase que o próprio jogador escreveu, devolvida à tela. Contá-la como voz da casa faria todo turno parecer narrado, inclusive os sete da sessão A" },
  { o: "o telegrama", porque:
    "conta na narração de EVENTO (o evento aconteceu e foi dito), mas nunca na de frase de mesa — `⚔ Halvard → Bandido: 9 de dano · Bandido 11/20` é contabilidade com emoji. O campo `voz` separa os dois, e é por isso que ele existe" },
  { o: "a rolagem `🎲`", porque:
    "sai atrás de `mostrarRolagens`, que é bastidor e vem desligado. Uma linha que a maioria das mesas nunca vê não pode entrar numa taxa de cobertura" },
  { o: "a nota ao Narrador (`notaRef`)", porque:
    "não é linha de tela: é o canal por turno do prompt. Ela alimenta a IA, não o jogador — e a Fase X mede o que o código diz sozinho" },
];

/* ============================================================
   A SESSÃO A PELO EIXO DA FRASE (X4)

   A MESMA sessão A de X1 — planta `estrada`, 1 inimigo não-ágil, herói
   corpo a corpo nível 3, sete turnos digitando "Ataco <nome>" e nada
   mais. A política NÃO muda: mudá-la mudaria os dois lados da comparação
   e X4 perderia o instrumento.

   O CAMINHO, lido no código: a frase entra por `agirInterno`, que em
   `:13617` não avança o relógio (há luta aberta) e em `:13937` cai na
   porta única. `resolverAtaqueJogador` devolve `semAlcance` em
   `:12099-12063`, e `aplicarGolpeDoJogador` sai em `:12185-12148`
   empurrando DUAS linhas — o eco do jogador e a recusa — e devolvendo
   `true` ANTES do `enviar(...)` de `:12252`. Logo o Narrador não é
   chamado: o turno é mudo também do lado da IA.
   A LUTA SEM ESPADA (frontend, MM9, 30/09): re-medido pela própria
   catraca (check-acoes-do-jogador.mjs) — a fiação da palavra-na-luta
   entrou em sete pontos do App.jsx, acima e abaixo deste trecho, e tudo
   andou junto. Nada somado de cabeça.

   AS DUAS TAXAS, E A DIFERENÇA ENTRE ELAS. A taxa estéril é 100%; a
   taxa de turnos MUDOS é 0% — toda a diferença cabe numa palavra, e a
   palavra é "recusa". A taxa que responde à pergunta de X3b não é
   nenhuma das duas: é a de turnos SEM NARRAÇÃO DE EVENTO, e ela volta
   a 100%. É por isso que as recusas tinham de ser contadas à parte. */
export const SESSAO_A_PELA_FRASE = {
  turnos: 7,
  semNumero: 7,            // o eixo de X1 — 100%
  semLinha: 0,             // nenhum turno termina calado
  semNarracaoDeEvento: 7,  // o eixo de X4 — 100%
  linhas: 14,              // 7 ecos + 7 recusas
  ecos: 7,
  recusas: 7,
  narracoesDeEvento: 0,
  chamadasAoNarrador: 0,
  familiaDaRecusa: "alcance",
  /* E3: os dois endereços soltos desceram com o resto (-450 linhas). É o
     mesmo `return true` a anteceder o mesmo `enviar`.
     R4b: +7 linhas nesta região — a lápide dos doze verbos é oito linhas
     mais longa que a tabela que substituiu, e o estado da gaveta de Ações
     levou uma. Os três endereços andaram juntos e nada mudou de forma; só
     o primeiro é re-derivado pelo varredor, os outros dois são prosa e
     por isso vão aqui à mão, com o motivo. */
  /* R15: os dois endereços em prosa andaram +36 com o comentário que o
     conserto do nome da campanha pôs em `salvar`. Conferidos por CONTEÚDO,
     não por aritmética: :12459 é o mesmo `enviar([COMBATE — RESOLVIDO...])`
     que estava em :12423. Nada mudou de forma.
     R17: +93 nos três — :12486 (a recusa), :12487 (o `return true`) e
     :12552 (o `enviar`) — mesmo delta de `aplicarGolpeDoJogador` no
     FUNIL_DO_COMBATE acima, conferido pelo mesmo método (conteúdo, não
     soma). O varredor só re-deriva o terceiro; os dois primeiros são
     prosa e vão aqui à mão, com o motivo.
     A FUGA (frontend): +2 nos três — :12488, :12489, :12554. O import
     novo no topo do arquivo (`fuga.js`, `tela-de-batalha.js`) empurrou
     tudo abaixo dele; mesmo delta de `aplicarGolpeDoJogador` no
     FUNIL_DO_COMBATE acima.
     O GOLPE FINAL (frontend, 29/09, MM3): a recusa e o `return true` andam
     juntos, como sempre — :12679 e :12680 —, mas o `enviar` NÃO segue o
     mesmo delta desta vez: ele deixou de estar em `aplicarGolpeDoJogador`
     (que agora sai por `continuarGolpeDoJogador` antes de chegar lá) e
     passou a viver dentro de `depoisDoRevide`, uma função interna nova de
     `continuarGolpeDoJogador`. Re-medido por conteúdo: :12820.
     IDA E VOLTA, MESMO DIA (frontend, 29/09, MM3): :12820 -> :12822 -> :12820.
     Debug (`console.warn("[MM3-DEBUG] …")`) nasceu e morreu dentro de
     `aplicarGolpeDoJogador`, ANTES de `depoisDoRevide` no arquivo; o
     `enviar` subiu +2 e voltou ao valor de antes. A recusa e o `return
     true` (:12679/:12680) nunca se moveram: o debug entrou depois deles
     no corpo de `aplicarGolpeDoJogador`.
     A PENEIRA DA AGRESSÃO (frontend, MM, 29/09): +14 nos três — :12693,
     :12694, :12834. `resolverAtaqueJogador` ganhou a peneira antes do
     golpe (14 linhas: o comentário e o `try/catch` que testam
     `soODeclarado`/`ehDeclaracaoDeAtaque` contra o verbo cru), e tudo
     abaixo andou junto — mesmo delta de `aplicarGolpeDoJogador` e do
     resto de FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE nesta etapa. Re-medido
     por conteúdo, não por soma: o varredor re-deriva o terceiro; os dois
     primeiros são prosa e vão aqui à mão, com o motivo, como sempre.
     O GOLPE FINAL É DO GRUPO (frontend, 29/09, MM3b): +7 nos três —
     :12754, :12755, :12899. O estado novo do cartão do grupo
     (`golpeFinalCompPendente`/`golpeFinalCompCtxRef`, 7 linhas) nasce
     ANTES de `aplicarGolpeDoJogador` no arquivo (perto do estado do
     cartão do jogador, ~linha 8320), e empurra os três junto — mesmo
     delta de FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE nesta etapa. A NOVA
     função `responderGolpeFinalComp`, que entra bem depois destes três
     (logo após `responderGolpeFinal`), não os afeta. Re-medido por
     conteúdo: o varredor re-deriva o terceiro (o `enviar`); os dois
     primeiros são prosa e vão aqui à mão, como sempre.
     A CIDADE POR DENTRO (frontend, MM12, 29/09): +14 nos três — :12768,
     :12769, :12913. Mesmo delta desta etapa em FUNIL_DO_COMBATE/
     RECUSAS_DO_COMBATE e no relógio de NAO_CONTA_COMO_NUMERO: a fiação de
     `fichaParaPauta` em `pautaDoTurno` nasce acima destes três, e tudo
     abaixo andou junto. Re-medido por conteúdo: o varredor re-deriva o
     terceiro; os dois primeiros são prosa e vão aqui à mão, como sempre.
     A GENTE POR DENTRO (frontend, MM8a, 29/09): +17 nos três — :12785,
     :12786, :12930. Mesmo delta desta etapa em FUNIL_DO_COMBATE/
     RECUSAS_DO_COMBATE e no relógio de NAO_CONTA_COMO_NUMERO: a fiação de
     `genteParaPauta` em `pautaDoTurno` nasce acima destes três, logo depois
     de `fichaParaPauta`, e tudo abaixo andou junto. Re-medido por conteúdo:
     o varredor re-deriva o terceiro; os dois primeiros são prosa e vão
     aqui à mão, como sempre.
     OS TETOS DAS PESSOAS (frontend, MM8c-1, 29/09): +20 nos três — :12805,
     :12806, :12950. A recência do registo (`normalizarRecencia`,
     `retomarContador`) e a marca do load (`npcTurnoNoLoadRef`) somam código
     em quatro pontos acima destes três — a ref nova (+3), o QUEM do rodapé
     com `emCena` (+8), o 14º argumento de `montarSystemPrompt` (+2) e o
     capítulo/load da recência (+7) —, e tudo abaixo andou junto. Re-medido
     por conteúdo: o varredor re-deriva o terceiro; os dois primeiros são
     prosa e vão aqui à mão, como sempre.
     A FIAÇÃO DO PRIMEIRO DIA (frontend, MM13b, 30/09): +11 nos três —
     :12890, :12891, :13035. `ondeSeProcura`/`achavelAqui` e o débito de
     cobranca.js entraram ACIMA destes três, dentro de `aplicarResposta` —
     mesmo delta de FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE nesta etapa.
     Re-medido por conteúdo: o varredor re-deriva o terceiro; os dois
     primeiros são prosa e vão aqui à mão, como sempre.
     A GENTE QUE PESA (frontend, MM8c-2, 30/09): +6 nos três — :12896,
     :12897, :13041. O import de `elenco.js` e o contexto/nomes do elenco
     (`contextoDoElenco`, `nomesDoElenco`) entraram ACIMA destes três, no
     corpo do componente — mesmo delta de FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE
     nesta etapa. Re-medido por conteúdo: o varredor re-deriva o terceiro; os
     dois primeiros são prosa e vão aqui à mão, como sempre.
     A GENTE QUE PESA, MEDIDA E CACHEADA (frontend, MM8c-2, 30/09): +10 nos
     três — :12906, :12907, :13051. `elencoDoMundo` media ~40ms por chamada
     e `nomesDoElenco` corria 3x por turno; entrou um cache por identidade
     (`elencoCacheRef`, logo após `nomesDoElenco`) — 9 linhas novas onde
     havia 1. Mesmo delta de FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE nesta etapa.
     Re-medido por conteúdo: o varredor re-deriva o terceiro; os dois
     primeiros são prosa e vão aqui à mão, como sempre.
     A PROMOÇÃO (frontend, MM8e, 30/09): +3 nos três — :12909, :12910,
     :13054. Mesmo delta desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE
     e no relógio de NAO_CONTA_COMO_NUMERO: quatro linhas novas (o ref do
     save, os vistos, a promoção ao virar o dia, a saída na pauta) nascem
     acima destes três. Re-medido por conteúdo: o varredor re-deriva o
     terceiro; os dois primeiros são prosa e vão aqui à mão, como sempre.
     A LUTA SEM ESPADA (frontend, MM9, 30/09): +12 nos três — :12921,
     :12922, :13070. A palavra-na-luta somou `impressionouRef` acima do
     primeiro (+12, mesmo delta do funil nesta etapa) e nada nasceu ENTRE
     os três — o intervalo entre eles não mudou. O terceiro (o `enviar`)
     veio direto do erro do varredor (check-acoes-do-jogador.mjs, bloco
     11); os dois primeiros são prosa e vão aqui à mão, como sempre.
     A FIAÇÃO DO CRIME (frontend, MM10, 30/09): +18 nos três — :12939,
     :12940, :13088. Nasceram ANTES dos três, no arquivo inteiro: o import,
     os refs da lei, e a pauta do crime (linha ~6964) — nada ENTRE eles.
     AS PERGUNTAS AO MESTRE (frontend, MM14, 30/09): +21 nos três — :12960,
     :12961, :13109. A mesa de PERGUNTOU (`nomesDaMesa`, fc/gp/mc e
     `juntarRespostas`) nasce ACIMA dos três, dentro de `pautaDoTurno` —
     mesmo delta de FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE nesta etapa. O
     terceiro (o `enviar`) veio do erro do varredor (bloco 11); os dois
     primeiros são prosa e vão aqui à mão, como sempre.
     OS DOIS CANAIS ANTIGOS (frontend, MM14, 30/09): -25 nos três — :12935,
     :12936, :13084. O mesmo líquido desta etapa em FUNIL_DO_COMBATE/
     RECUSAS_DO_COMBATE (a migração das tarefas antigas soma menos do que a
     remoção dos dois canais tira). Re-medido pelo diff de App.jsx contra
     HEAD, não por soma de cabeça.
     A GENTE NO LUGAR CERTO, COM O NOME CERTO (frontend, MM14 · 9b/10a,
     30/09): +56 nos três — :12991, :12992, :13140. O mesmo delta desta
     etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE e no relógio de
     NAO_CONTA_COMO_NUMERO — tudo o que a etapa somou fica ACIMA dos três.
     O terceiro (o `enviar`) veio do erro do varredor (bloco 11); os dois
     primeiros são prosa e vão aqui à mão, como sempre.
     A EXTRAÇÃO DE fichasDaMesa (frontend, MM14 · o resto do nº 6, 30/09):
     +18 nos três — :13009, :13010, :13158. O mesmo delta desta etapa em
     FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE e no relógio de
     NAO_CONTA_COMO_NUMERO: `fichasDaMesa` nasce ACIMA dos três, dentro de
     `pautaDoTurno`. O terceiro (o `enviar`) veio do erro do varredor
     (bloco 11); os dois primeiros são prosa e vão aqui à mão, como
     sempre.
     O LUGAR PELO CRONISTA (frontend, MM15 (1), 30/09): +5 nos três —
     :13014, :13015, :13163. A decisão de `registrarLugar` mudou-se para
     `lerLugarDito` (lugar.js) — a assinatura ganhou o parâmetro `fonte` e
     o comentário da palavra combinada saiu, cinco linhas ACIMA destes
     três no arquivo. O terceiro (o `enviar`) veio do erro do varredor
     (bloco 11); os dois primeiros são prosa e vão aqui à mão, como
     sempre.
     AS FALAS PAGAS E DEITADAS FORA (frontend, MM15 (2), 30/09): +2 nos
     três — :13016, :13017, :13165. `colherAsFalas` ganhou duas linhas
     ACIMA destes três (a tabela `bocasDoTurno` no lugar do `.slice`, e a
     saída antecipada). O terceiro (o `enviar`) veio do erro do varredor
     (bloco 11); os dois primeiros são prosa e vão aqui à mão, como
     sempre.
     A LIGAÇÃO NÃO É O MESTRE (frontend, MM15 (3), 30/09): +162 nos três —
     :13178, :13179, :13327 — mesmo delta de `aplicarGolpeDoJogador` no
     FUNIL_DO_COMBATE acima (a foto do turno nasce ACIMA dela no arquivo).
     O terceiro (o `enviar`) veio do erro do varredor (bloco 11); os dois
     primeiros são prosa e vão aqui à mão, como sempre.
     O SEGREDO GUARDADO (frontend, MM15 (4), 30/09): +21 nos três — :13199,
     :13200, :13348 — mesmo delta de `aplicarGolpeDoJogador` nesta etapa
     (os cinco pontos de O SEGREDO GUARDADO, no cabeçalho de
     FUNIL_DO_COMBATE acima, nascem ACIMA dela no arquivo). O terceiro veio
     do erro do varredor (bloco 11); os dois primeiros são prosa e vão
     aqui à mão, como sempre.
     OS NOMES QUE SE FUNDEM (frontend, MM15 (5), 30/09): +4 nos três —
     :13203, :13204, :13352 — mesmo delta do relógio em NAO_CONTA_COMO_NUMERO
     acima (`contextoDoNome` ganha `conhecidos`/`recentes` ACIMA dos três
     no arquivo). O terceiro veio do erro do varredor (bloco 11); os dois
     primeiros são prosa e vão aqui à mão, como sempre.
     O COMPANHEIRO DE ANTES (frontend, 01/10): +25 nos três — :13228,
     :13229, :13377 — mesmo delta de `aplicarGolpeDoJogador` no
     FUNIL_DO_COMBATE acima (a fiação do companheiro nasce dentro de
     `iniciar`, ACIMA dela no arquivo). Os três vieram do erro do varredor
     (bloco 11), medidos direto contra o código — não por soma de delta.
     A MASMORRA QUE SE ACABA (orquestrador, 05/10, v9.348): :13228 -> :13216,
     :13229 -> :13217 e :13377 -> :13365 (e, nas recusas, :14924 -> :14912,
     :16757 -> :16798) — o ramo do Narrador perdeu 12 linhas
     (o bloco do chefe virou `concluirMasmorraDoChefe`, mais abaixo) e o
     fecho do sistema ganhou 24+29 ACIMA de `moverPara`. Re-medido pelo
     varredor; as recusas continuam as mesmas, só mudaram de endereço. */
  /* (v9.352 · a masmorra na pauta) MM16 nº 4, 06/10: :13257 -> :13291 e
     :13405 -> :13439, +34, o degrau de todo o combate nesta etapa (o
     endereço com prefixo andou pelo remedir; estes dois, nus, à mão). */
  ondeSai: "src/App.jsx:13290 (a recusa) — o `return true` de :13291 antecede o enviar de :13439",
  formula: "taxa_sem_narracao = turnos_sem_frase_de_evento / turnos_totais",
  procedimento: "node testes/sonda-turno-esteril.mjs — comparar a linha da sessão A″",
};

/* ---------------- O QUE X4 NÃO CONSEGUIU MEDIR ----------------
   Escrito porque a Fase X inteira foi feita assim, e porque X3c foi
   cancelada justamente por não ter escrito isto a tempo. */
export const O_QUE_NAO_DEU_PARA_MEDIR = [
  { o: "quantas linhas saem num turno de combate REAL",
    porque: "a sonda não roda o `App.jsx` (é React). Ela conta o que o caminho de código PODE empurrar, não o que uma partida empurrou. Só a sessão A é contável linha a linha, e é porque ela percorre um caminho de duas linhas fixas — qualquer turno em que o golpe SAI depende de quantos alvos, quantos ataques e quantos prazos vencem" },
  { o: "se a linha misturada é frase ou telegrama, quando a chamada empurra as duas",
    porque: "`:12072`, `:14202`, `:12515`, `:13949` e `:14772` empurram listas montadas em tempo de execução. O campo `misto: true` marca as cinco; a `voz` declarada é a da linha que o jogador sempre vê, e a outra fica no `nasce`. Contar as duas exigiria executar o App" },
  { o: "quanto da voz do combate a IA de fato narra",
    porque: "o `enviar(...)` manda o envelope e o que volta é da rede. Medir isso seria medir a IA, e a Fase X mede o que o CÓDIGO diz sozinho" },
];

/* O recorte do combate, nos dois eixos de uma vez. */
export function contarCombate() {
  const deCombate = ACOES_DO_JOGADOR.filter((x) => x.combate);
  const clique = { motor: 0, caixa: 0, nada: 0 };
  const texto = { motor: 0, cena: 0, semTexto: 0 };
  for (const a of deCombate) {
    clique[a.cliqueChega] += 1;
    if (a.textoLuta == null) texto.semTexto += 1; else texto[a.textoLuta] += 1;
  }
  return { total: deCombate.length, clique, texto };
}

/* ---------------- AS CONTAS DO EIXO DA FRASE (X4) ----------------
   Funções e não números, pela mesma razão do bloco 5: quem mexer no
   funil mexe na conta junto. As três são lidas de volta pelas três
   pontas — a sonda imprime, a suíte afirma, o varredor re-deriva. */

/* O tamanho da boca do funil, por anel e por voz. */
export function contarFunil() {
  const porAnel = { nucleo: 0, borda: 0 };
  const voz = { frase: 0, telegrama: 0, recusa: 0 };
  let linhas = 0, mistas = 0;
  for (const f of FUNIL_DO_COMBATE) {
    porAnel[f.anel] += 1;
    for (const l of f.linhas) { linhas += 1; voz[l.voz] += 1; if (l.misto) mistas += 1; }
  }
  return { funcoes: FUNIL_DO_COMBATE.length, porAnel, linhas, voz, mistas };
}

/* Quanto da voz do combate nasce FORA do React — a coluna que diz o que
   já é testável em Node e o que ainda só existe dentro do `App.jsx`. */
export function vozQueNasceNoModulo() {
  let doModulo = 0, doApp = 0;
  for (const f of FUNIL_DO_COMBATE) for (const l of f.linhas) {
    if (/^src\/App\.jsx/.test(l.nasce)) doApp += 1; else doModulo += 1;
  }
  return { doModulo, doApp };
}

/* As recusas por família, com os dois cortes: chamadas e formas. */
export function recusasPorFamilia() {
  const fam = {};
  for (const r of RECUSAS_DO_COMBATE) {
    const f = (fam[r.familia] = fam[r.familia] || { chamadas: 0, formas: 0 });
    f.chamadas += 1; f.formas += r.formas;
  }
  return fam;
}

/* O total nos dois cortes, mais a divisão por anel — é o número que se
   compara ao "15" que X3b escreveu em prosa. */
export function contarRecusas() {
  let formas = 0; const porAnel = { nucleo: 0, borda: 0, despachante: 0 };
  for (const r of RECUSAS_DO_COMBATE) { formas += r.formas; porAnel[r.anel] += 1; }
  return { chamadas: RECUSAS_DO_COMBATE.length, formas, porAnel,
    familias: Object.keys(recusasPorFamilia()).length };
}
