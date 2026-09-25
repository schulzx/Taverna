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
   `declararGolpe` (`src/App.jsx:12389`) e entra no motor; FORA da luta
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
    onde: "src/App.jsx:1106", handler: null /* R4b: o botão saiu. O `Atacar` com motor é o da tela da batalha, e é medido em pronta_atacar → alcanca */,
    texto: "Ataco ",
    /* X2: o clique na MESA DE COMBATE chega ao motor; fora da luta segue
       enchendo a caixa, que é por onde a briga começa. Ver o bloco do
       eixo condicional, acima. */
    cliqueChega: "aposentado", aposentadoEm: "R4b",
    textoFora: "motor", textoLuta: "cena",
    alcanca: "CLIQUE, dentro da luta: declararGolpe (src/App.jsx:12389) → vereditoDoGolpeAgora (:11878) → fraseDoGolpe (src/golpe.js) → aplicarGolpeDoJogador (:11800) → resolverAtaqueJogador (:11654) → dado, dano e PV. E o clique é IMPEDIDO (`disabled={impedido}`, :20843) quando ninguém está ao alcance — a abertura de 10/10 plantas apaga o botão em vez de gastar um turno para ser recusada. CLIQUE, fora da luta: só setEntrada. FRASE, fora: porta `agressao` → abre combate e rola INICIATIVA (nenhum dado de ataque). FRASE, dentro: porta fechada → mesma porta única do clique, e no turno 1 ainda é recusada por alcance (o caminho do teclado NÃO mudou em X2)" },
  { id: "pronta_esquivar", rotulo: "Esquivar", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1107", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Fico em postura defensiva, esquivando e me protegendo neste turno",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor: não casa desafio nem agressão — cai em `cena`" },
  { id: "pronta_empurrar", rotulo: "Empurrar", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1108", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Empurro com força ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor — cai em `cena`" },
  { id: "pronta_derrubar", rotulo: "Derrubar", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1109", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Tento derrubar no chão ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor — cai em `cena`" },
  { id: "pronta_correr", rotulo: "Correr", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1110", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Corro em disparada para ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor — cai em `cena`. O grid tem deslocamento, e esta frase não o alcança" },
  { id: "pronta_saltar", rotulo: "Saltar", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1111", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Salto sobre ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → adjudicarAcao (src/App.jsx:16620) rola o dado" },
  { id: "pronta_esconder", rotulo: "Esconder", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1112", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Me escondo nas sombras, buscando cobertura",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → rola o dado" },
  { id: "pronta_procurar", rotulo: "Procurar", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1113", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Examino o lugar com atenção, procurando ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → rola o dado" },
  { id: "pronta_ajudar", rotulo: "Ajudar", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1114", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Ajudo ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor — cai em `cena`. A Ajuda do 5e (vantagem a um aliado) não existe em código" },
  { id: "pronta_intimidar", rotulo: "Intimidar", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1115", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Intimido com olhar e presença ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → rola o dado" },
  { id: "pronta_persuadir", rotulo: "Persuadir", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1116", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
    texto: "Tento persuadir ",
    cliqueChega: "aposentado", aposentadoEm: "R4b", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → rola o dado" },
  { id: "pronta_enganar", rotulo: "Enganar", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1117", handler: null /* R4b: o botão saiu; a frase entra pelo campo */,
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
     `onClick` (`src/App.jsx:22489`) → `declararAcaoRapida` (`:16211`)
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
    onde: "src/App.jsx:21484 (onMover)", handler: "clique no quadrado → moverPara (src/App.jsx:15197)",
    texto: null,
    cliqueChega: "motor", textoFora: null, textoLuta: null,
    alcanca: "muda x,y do herói (src/App.jsx:15264) e gasta o movimento da economia" },
  { id: "bolsa_consumivel", rotulo: "Beber da bolsa", fonte: "bolsa", combate: true,
    onde: "src/App.jsx:20223", handler: "clique em `usar` → usarConsumivelUI",
    texto: null,
    cliqueChega: "motor", textoFora: null, textoLuta: null,
    alcanca: "rola o dado da poção, aplica a cura e tira o item da bolsa" },
  { id: "heroismo_gasto", rotulo: "Gastar heroísmo", fonte: "heroismo", combate: true,
    onde: "src/App.jsx:15882", handler: "PainelHeroismo (src/painel-heroismo.jsx:106) → aoGastar",
    texto: null,
    cliqueChega: "motor", textoFora: null, textoLuta: null,
    /* X2 CORRIGIU A SEGUNDA METADE DESTA FRASE, e ela fica escrita porque
       era a consequência mais cara do achado de X1: enquanto o clique de
       `Atacar` não chegava ao motor, o `refazer` do heroísmo era um gasto
       que a mesa de combate nunca podia oferecer — não havia dado na tela
       para refazer. Com o botão chamando `aplicarGolpeDoJogador`, há. */
    alcanca: "gastarHeroismo desconta o ponto. O gasto `refazer` (src/App.jsx:15874) só existe com um dado na tela — e ATÉ X1 o jogador não conseguia rolar nenhum em combate; desde X2 o clique de `Atacar` rola" },
  { id: "texto_ataque", rotulo: "Texto livre de ataque", fonte: "teclado", combate: true,
    onde: "src/App.jsx:13979", handler: "caixa de texto → agirInterno → aplicarGolpeDoJogador",
    texto: "Ataco <alvo>",
    cliqueChega: "nada", textoFora: "motor", textoLuta: "cena",
    /* X2 NÃO MEXEU NO CAMINHO DO TECLADO — e é de propósito que esta
       entrada segue na lista sem motor: a frase digitada continua chegando
       a `resolverAtaqueJogador` e morrendo no alcance do turno 1. O que
       mudou é o ENDEREÇO: o bloco que resolvia o golpe saiu de dentro de
       `agirInterno` e virou `aplicarGolpeDoJogador` (:11800), que hoje tem
       dois chamadores — o texto e o botão — e uma só aplicação. */
    alcanca: "fora: `lerAgressao` (src/agressao.js:177) exige alvo REGISTRADO no elenco; 7 de 8 frases naturais morrem em `semAlvoConhecido`. dentro: chega a aplicarGolpeDoJogador (src/App.jsx:12287) → resolverAtaqueJogador (:11654) e é recusado por alcance no turno 1 (ver ABERTURA_FORA_DE_ALCANCE)" },
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
    { campo: "combate.recursos", escritoEm: "src/App.jsx:5513",
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
     `src/App.jsx:13835` — o arquivo cresceu por baixo dele duas vezes e
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
     abaixo andou junto. Endereço re-medido pelo dente 8, asserção intacta. */
  { o: "o relógio do mundo (45 min)", porque:
    "src/App.jsx:14078 avança MINUTOS_POR_TURNO em todo turno fora de combate, faça o jogador o que fizer. Um número que muda sempre não distingue turno que fez de turno que não fez: incluí-lo daria 0% de esterilidade por construção e a medida perderia o sentido" },
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
   `semAlcance` (`src/App.jsx:12199-11834`) sai em `:11893-11856` ANTES de
   gastar a ação — deliberadamente, por `:11890-11852` ("golpe sem
   alcance não gasta a ação"). Sem gastar a ação, `fecharMeuTurno` →
   `resolverRevide` (`src/App.jsx:14819-14385`) nunca roda: o inimigo
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
    ondeRecusa: "src/App.jsx:12199-11834 (resolverAtaqueJogador)",
    ondeSai: "src/App.jsx:12292-12083 (aplicarGolpeDoJogador)",
    naoGastaAcao: "src/App.jsx:12289-11914",
    logo: "fecharMeuTurno/resolverRevide (src/App.jsx:14819-14385) nunca roda — o inimigo também não age",
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
   `src/App.jsx:7844`, e há 453 call-sites dele em 174 funções no arquivo
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
   linhas citadas foram lidas de volta depois da troca, não só calculadas. */
export const FUNIL_DO_COMBATE = [
  { fn: "presencaNaLuta", onde: "src/App.jsx:5893", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:5930", evento: "presença divina na abertura da luta — condição imposta ao herói, ao grupo ou aos inimigos",
        voz: "frase", nasce: "src/presenca-divina.js (resolverPresenca, presencaDoHeroiEmCombate)" },
    ] },
  { fn: "aMesaEspera", onde: "src/App.jsx:8054", anel: "borda",
    linhas: [
      { onde: "src/App.jsx:8058", evento: "a trava do turno guardado: o motor já rolou e a narração não chegou",
        voz: "recusa", nasce: "src/App.jsx" },
    ] },
  { fn: "tentarReacaoNoGolpe", onde: "src/App.jsx:8325", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:8343", evento: "a reação dispara (aparar, esquivar, retribuir)",
        voz: "frase", nasce: "src/reacoes.js (resolverReacao)" },
      { onde: "src/App.jsx:8368", evento: "o contra-ataque da reação acerta ou erra",
        voz: "telegrama", nasce: "src/App.jsx" },
    ] },
  { fn: "aplicarCondicoesDosGolpes", onde: "src/App.jsx:8375", anel: "nucleo",
    linhas: [
      /* R15: +28 com o comentário novo em `salvar`. Re-endereçado à mão
         porque o conteúdo desta linha (`pushMsgs([{ autor: "sistema", texto:
         res.texto }])`) aparece DUAS vezes no arquivo e o re-endereçador
         recusou-se a adivinhar entre :8141 e :8197 — está certo que se
         recusasse. É :8197: mesma indentação e o mesmo `if (!res) continue;`
         da salvaguarda logo acima.
         R17: 8197 -> 8290, pelo mesmo par (a outra ocorrência, dentro de
         `tentarReacaoNoGolpe`, está em :8234). */
      { onde: "src/App.jsx:8399", evento: "o golpe do inimigo impõe (ou não) uma aflição ao herói",
        voz: "frase", nasce: "src/aflicoes.js (rolarAflicao)" },
    ] },
  { fn: "limparConjuracoesDaLuta", onde: "src/App.jsx:8487", anel: "borda",
    linhas: [
      { onde: "src/App.jsx:8494", evento: "a forma animal se desfaz ao fim da luta",
        voz: "frase", nasce: "src/habilidades.js (desfazerForma)" },
      { onde: "src/App.jsx:8501", evento: "a guarda do herói baixa ao fim da luta",
        voz: "frase", nasce: "src/habilidades.js (baixarGuardas)" },
      { onde: "src/App.jsx:8518", evento: "a guarda de cada companheiro baixa ao fim da luta",
        voz: "frase", nasce: "src/habilidades.js (baixarGuardas)" },
      { onde: "src/App.jsx:8524", evento: "a pressa acaba ao fim da luta",
        voz: "frase", nasce: "src/habilidades.js (baixarPressa)" },
    ] },
  { fn: "aflicaoDeCompanheiro", onde: "src/App.jsx:8822", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:8829", evento: "a arma do companheiro envenena/queima o inimigo",
        voz: "frase", nasce: "src/aflicoes.js (rolarAflicao)" },
    ] },
  { fn: "resolverAtaqueJogador", onde: "src/App.jsx:12454", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:12578", evento: "atacou, apareceu — a invisibilidade se rompe pelo golpe",
        voz: "frase", nasce: "src/gatilhos.js (romperPorGatilho)" },
    ] },
  { fn: "aplicarGolpeDoJogador", onde: "src/App.jsx:12600", anel: "nucleo",
    /* núcleo por COMPORTAMENTO e não por guarda própria: sem luta,
       `resolverAtaqueJogador` devolve `null` na primeira linha e ela sai em
       `:12012` com `false`, sem falar. É a função que a sessão A percorre
       sete vezes. */
    linhas: [
      { onde: "src/App.jsx:12606", evento: "recusa por alcance — o golpe digitado não alcança ninguém",
        voz: "recusa", nasce: "src/App.jsx:12323 (o literal do motivo)" },
      { onde: "src/App.jsx:12614", evento: "recusa por economia — a ação da rodada já saiu",
        voz: "recusa", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:12656", evento: "o golpe do jogador: dano, PV do alvo e a aflição da arma",
        voz: "telegrama", misto: true, nasce: "src/App.jsx (o ⚔) + src/aflicoes.js (a aflição)" },
    ] },
  { fn: "declararGolpe", onde: "src/App.jsx:12709", anel: "nucleo",
    /* núcleo pela FIAÇÃO: o único chamador é o `onClick` das ACOES_PRONTAS
       sob `golpeVivo`, que exige `vdGolpe` — e `vereditoDoGolpeAgora`
       devolve `null` fora da luta. O botão não existe fora dela. */
    linhas: [
      { onde: "src/App.jsx:12724", evento: "recusa por alcance — o clique chegou e o veredito diz não",
        voz: "recusa", nasce: "src/App.jsx:1162 (recusaDoGolpe)" },
    ] },
  { fn: "resolverHabilidadeOfensiva", onde: "src/App.jsx:12744", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:12770", evento: "a ceifa leva de uma vez quem estava abaixo do limiar",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:12772", evento: "a ceifa varre o campo e não acha ninguém abaixo do limiar",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:12871", evento: "o alvo está abaixo do limiar e a execução vale",
        voz: "telegrama", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:13099", evento: "a habilidade ofensiva resolvida: acerto, dano, dreno, imunidade por degrau",
        voz: "telegrama", misto: true, nasce: "src/App.jsx" },
    ] },
  { fn: "fecharSeTodosCairam", onde: "src/App.jsx:14477", anel: "borda",
    linhas: [
      { onde: "src/App.jsx:14494", evento: "a forma animal se desfaz quando a luta acaba",
        voz: "frase", nasce: "src/habilidades.js (desfazerForma)" },
      { onde: "src/App.jsx:14508", evento: "a luta termina sem ninguém derrotado — sem espólios",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:14602", evento: "vitória: todos caíram, e os espólios",
        voz: "telegrama", misto: true, nasce: "src/App.jsx" },
    ] },
  { fn: "resolverRevide", onde: "src/App.jsx:14773", anel: "nucleo",
    /* a maior boca do funil, e de longe: 29 das 57 chamadas do caminho de
       combate saem daqui. É a vez do mundo inteira — inimigos, grupo,
       prazos e quedas — num corpo só. */
    linhas: [
      { onde: "src/App.jsx:14792", evento: "abre a vez do mundo e diz a rodada",
        voz: "telegrama", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:14810", evento: "o inimigo dá as costas e leva o golpe de oportunidade",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:14841", evento: "o passo do inimigo no tabuleiro",
        voz: "frase", nasce: "src/App.jsx:5699 (linhaDePasso)" },
      { onde: "src/App.jsx:14860", evento: "o passo do aliado no tabuleiro",
        voz: "frase", nasce: "src/App.jsx:5699 (linhaDePasso)" },
      { onde: "src/App.jsx:15032", evento: "o golpe de cada inimigo: acerto, dano, amortecimento, abrigo",
        voz: "telegrama", misto: true, nasce: "src/App.jsx (o ⚔) + src/tracos.js (amortecerDano)" },
      { onde: "src/App.jsx:15071", evento: "a concentração cai com o dano sofrido",
        voz: "frase", nasce: "src/combate.js (testeConcentracao)" },
      { onde: "src/App.jsx:15083", evento: "o dano rompe a invisibilidade",
        voz: "frase", nasce: "src/gatilhos.js (romperPorGatilho)" },
      { onde: "src/App.jsx:15097", evento: "a Dádiva da Recuperação segura a queda",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15105", evento: "a guarda segura a queda em 1 PV",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15117", evento: "a fúria persistente segura a queda em 1 PV",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15149", evento: "Voz de Comando: as invocadas agem de novo",
        voz: "frase", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15156", evento: "a rolagem do golpe do companheiro (só com `mostrarRolagens`)",
        voz: "telegrama", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15162", evento: "o golpe do companheiro: dano ou erro",
        voz: "telegrama", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15166", evento: "a rolagem da habilidade do companheiro (só com `mostrarRolagens`)",
        voz: "telegrama", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15172", evento: "a arma do companheiro impõe aflição",
        voz: "frase", nasce: "src/aflicoes.js (rolarAflicao)" },
      { onde: "src/App.jsx:15083", evento: "a habilidade ofensiva do companheiro",
        voz: "telegrama", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15180", evento: "a cura do companheiro num aliado",
        voz: "telegrama", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15185", evento: "o companheiro bebe uma poção",
        voz: "frase", nasce: "src/App.jsx:8528 (pocaoDeCompanheiro)" },
      { onde: "src/App.jsx:15190", evento: "o companheiro ergue um buff",
        voz: "frase", nasce: "src/App.jsx:8553 (buffDeCompanheiro)" },
      { onde: "src/App.jsx:15192", evento: "e o que ele largou para erguê-lo",
        voz: "frase", nasce: "src/App.jsx:8553 (buffDeCompanheiro)" },
      { onde: "src/App.jsx:15222", evento: "o companheiro ergue uma guarda",
        voz: "frase", nasce: "src/habilidades.js (GUARDAS, erguerGuarda)" },
      { onde: "src/App.jsx:15229", evento: "recusa por repetição — a guarda que já está de pé não sobe duas vezes",
        voz: "recusa", nasce: "src/App.jsx (a recusa nasce em src/habilidades.js, erguerGuarda; a frase é do App)" },
      { onde: "src/App.jsx:15162", evento: "o herói chega a zero e rola a queda",
        voz: "frase", nasce: "src/App.jsx:8670 (resolverQueda)" },
      { onde: "src/App.jsx:15269", evento: "a forma animal vence o prazo",
        voz: "frase", nasce: "src/habilidades.js (expirarForma)" },
      /* R17: 14867/14886/14893 (nesta ordem, no texto antigo) coincidiam
         por acidente com OUTRAS três linhas de pushMsgs já existentes no
         código novo (a rolagem/dano do companheiro e a poção) — o dente do
         varredor só verifica se a linha citada TEM um pushMsgs, não qual, e
         ficaria verde nos três apontando para o evento errado. Re-medidos
         por conteúdo contra o corpo de `expirarGuardas`/`expirarPressa`. */
      { onde: "src/App.jsx:15185", evento: "a guarda do herói vence o prazo",
        voz: "frase", nasce: "src/habilidades.js (expirarGuardas)" },
      { onde: "src/App.jsx:15296", evento: "a guarda de cada companheiro vence o prazo",
        voz: "frase", nasce: "src/habilidades.js (expirarGuardas)" },
      { onde: "src/App.jsx:15303", evento: "a pressa vence o prazo",
        voz: "frase", nasce: "src/habilidades.js (expirarPressa)" },
      { onde: "src/App.jsx:15310", evento: "o controle sobre o inimigo arrebenta",
        voz: "frase", nasce: "src/controle.js (expirarControles)" },
      { onde: "src/App.jsx:15318", evento: "a invocação se desfaz no fim do prazo",
        voz: "frase", nasce: "src/invocacoes.js (expirarInvocacoes)" },
    ] },
  { fn: "moverPara", onde: "src/App.jsx:15716", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:15721", evento: "recusa — esta luta não tem terreno",
        voz: "recusa", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15734", evento: "recusa — uma condição prende o herói no lugar",
        voz: "recusa", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15750", evento: "recusa por economia — o movimento da rodada acabou",
        voz: "recusa", nasce: "src/App.jsx" },
      { onde: "src/App.jsx:15756", evento: "recusa do passo — fora do campo, ocupado, longe demais, já está aí",
        voz: "recusa", nasce: "src/grid.js:473-508 (caminhar)" },
      { onde: "src/App.jsx:15797", evento: "o passo sai: golpes de oportunidade de quem te alcança e o abrigo",
        voz: "frase", misto: true, nasce: "src/App.jsx" },
    ] },
  { fn: "virarChefeSePreciso", onde: "src/App.jsx:19151", anel: "nucleo",
    linhas: [
      { onde: "src/App.jsx:19165", evento: "o chefe da masmorra vira de fase",
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
   (`usarHeroismo`, `src/App.jsx:16015-15426`, seis literais `⛔`): elas
   vivem com e sem luta aberta, não pertencem ao ciclo do turno, e
   entrariam só para engordar o número. Ficam escritas aqui, no escopo,
   porque o que se deixa de fora tem de ser dito.

   `anel` diz onde a função que fala mora: `nucleo`/`borda` são do
   funil; `despachante` é `agirInterno` (`src/App.jsx:13723`), que fala
   dentro e fora da luta e por isso não entra no funil — mas a recusa
   que ele diz com a luta aberta é recusa de combate.
   ============================================================ */
/* R17: os `onde` abaixo foram re-medidos por conteúdo (o mesmo método do
   cabeçalho de FUNIL_DO_COMBATE, acima) — e um deles corrigia uma FALHA
   SILENCIOSA que já vinha de antes desta etapa: a entrada `alcance` de
   `agirInterno` (a de baixo, com `nasce: src/App.jsx:12649`) apontava para
   :13986, que ANTES desta etapa também caía num `pushMsgs(` de verdade —
   só que por coincidência de linha, não porque fosse o `pushMsgs` certo.
   O varredor só verifica presença de `pushMsgs(`, não o conteúdo, e por
   isso nunca acusou. Está corrigida para :14097, o `pushMsgs` de
   `desfechoH.motivo` que a frase realmente descreve. */
export const RECUSAS_DO_COMBATE = [
  /* ---- alcance: a família que a Fase X inteira mede ---- */
  { familia: "alcance", onde: "src/App.jsx:12606", fn: "aplicarGolpeDoJogador", anel: "nucleo", formas: 2,
    literal: "📏 ninguém está ao alcance do seu golpe — <alvo> está em <lugar>, a uns <n> m. Aproxime-se primeiro. / 📏 não há ninguém à vista para acertar — ou há parede no caminho (arma de longe)",
    nasce: "src/App.jsx:12323-11948" },
  /* RE-MEDIDA EM K2 (16/09), e o motivo tem de sobreviver à mudança: as três
     formas continuam três — a voz de recusa NÃO mudou, mudou a redacção dela.
     W2 §3 provou que a frase antiga media 62 caracteres com o nome VAZIO
     contra um teto de 54, logo nenhum aparo de nome a salvaria; foi REDIGIDA,
     não aparada. E mudou de casa junto: `recusaDoGolpe` saiu do `App.jsx` para
     `src/golpe.js`, onde as frases saem de `LINHAS_DO_GOLPE` e um varredor as
     consegue ler — o que no App, dentro de JSX, nunca foi possível. O `onde`
     continua a ser o `pushMsgs` do App, porque é lá que a recusa é DITA; o
     `nasce` passa a apontar a tabela, porque é lá que ela é ESCRITA. */
  { familia: "alcance", onde: "src/App.jsx:12724", fn: "declararGolpe", anel: "nucleo", formas: 3,
    literal: "📏 <alvo> a <n> m — faltam <n> m. / 📏 <alvo> a <n> m — parede, contorne. / 📏 Ninguém de pé ao seu alcance.",
    nasce: "src/golpe.js (recusaDoGolpe, LINHAS_DO_GOLPE)" },
  { familia: "alcance", onde: "src/App.jsx:14152", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "📏 <habilidade> não alcança ninguém daqui — <alvo> está em <lugar>, a uns <n> m[ e sem linha de visão]. O alcance de <habilidade> é <n> m.",
    nasce: "src/App.jsx:12649" },
  { familia: "alcance", onde: "src/App.jsx:14377", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "📏 <o mesmo motivo de :12241> — os <n> PM voltaram.",
    nasce: "src/App.jsx:12649" },
  { familia: "alcance", onde: "src/App.jsx:15721", fn: "moverPara", anel: "nucleo", formas: 1,
    literal: "📏 Esta luta não tem terreno definido.", nasce: "src/App.jsx" },
  { familia: "alcance", onde: "src/App.jsx:15756", fn: "moverPara", anel: "nucleo", formas: 5,
    literal: "📏 de onde você está, <lugar> fica longe demais para um deslocamento só. / esse lugar fica fora do campo. / esse lugar está ocupado. / você é <tamanho> demais para caber ali. / você já está aí.",
    nasce: "src/grid.js:473-508 (caminhar)" },

  /* ---- economia do turno: o que já foi gasto não volta ---- */
  { familia: "economia", onde: "src/App.jsx:12614", fn: "aplicarGolpeDoJogador", anel: "nucleo", formas: 1,
    literal: "⏳ Você já usou sua ação nesta rodada — o golpe fica para a próxima.",
    nasce: "src/App.jsx" },
  { familia: "economia", onde: "src/App.jsx:14152", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "Mana insuficiente para <habilidade> — parei antes dela.", nasce: "src/App.jsx" },
  { familia: "economia", onde: "src/App.jsx:14154", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "⏳ <habilidade> está em recarga (<n>t) — pulei.", nasce: "src/App.jsx" },
  { familia: "economia", onde: "src/App.jsx:14158", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "⏳ Sua ação deste turno já saiu — <habilidade> fica para a próxima rodada.",
    nasce: "src/App.jsx" },
  { familia: "economia", onde: "src/App.jsx:15750", fn: "moverPara", anel: "nucleo", formas: 1,
    literal: "⏳ Você já cobriu os <n> m desta rodada — o próximo passo é no turno que vem.",
    nasce: "src/App.jsx" },

  /* ---- teto: uma por vez ---- */
  { familia: "teto", onde: "src/App.jsx:14152", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "✦ <habilidade> fica para depois — fora de combate uso uma habilidade por vez.",
    nasce: "src/App.jsx" },

  /* ---- repetição: o que já está de pé não sobe duas vezes ---- */
  { familia: "repeticao", onde: "src/App.jsx:15229", fn: "resolverRevide", anel: "nucleo", formas: 1,
    literal: "🛡 <companheiro> firma de novo a guarda que já sustenta — nada muda.",
    nasce: "src/habilidades.js (erguerGuarda recusa a repetida); a frase é do App" },

  /* ---- a trava do turno guardado ---- */
  { familia: "turno-guardado", onde: "src/App.jsx:8058", fn: "aMesaEspera", anel: "borda", formas: 1,
    literal: "⏳ O que você acabou de fazer ainda não foi contado, e a mesa não anda sem a palavra do Mestre.",
    nasce: "src/App.jsx (a decisão é de src/guardado.js, travaODeclarar)" },

  /* ---- conjuração travada: a primeira família que X3b não nomeou ---- */
  { familia: "conjuracao", onde: "src/App.jsx:14133", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "⛓ <habilidade> não sai: você não consegue conjurar vestindo <peça>. Tire a peça e tente de novo.",
    nasce: "src/App.jsx" },
  { familia: "conjuracao", onde: "src/App.jsx:14140", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "🐾 <habilidade> não sai: em <forma> você não tem mão nem voz para conjurar.",
    nasce: "src/App.jsx" },
  { familia: "conjuracao", onde: "src/App.jsx:14133", fn: "agirInterno", anel: "despachante", formas: 1,
    literal: "📕 <motivo de podeLancar>", nasce: "src/magias.js (podeLancar)" },

  /* ---- a condição que prende: a segunda que X3b não nomeou ---- */
  { familia: "condicao", onde: "src/App.jsx:15734", fn: "moverPara", anel: "nucleo", formas: 1,
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
   `:13601` não avança o relógio (há luta aberta) e em `:13921` cai na
   porta única. `resolverAtaqueJogador` devolve `semAlcance` em
   `:12087-12051`, e `aplicarGolpeDoJogador` sai em `:12173-12136`
   empurrando DUAS linhas — o eco do jogador e a recusa — e devolvendo
   `true` ANTES do `enviar(...)` de `:12240`. Logo o Narrador não é
   chamado: o turno é mudo também do lado da IA.

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
     FUNIL_DO_COMBATE acima. */
  ondeSai: "src/App.jsx:12606 (a recusa) — o `return true` de :12607 antecede o enviar de :12672",
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
    porque: "`:12059`, `:14182`, `:12495`, `:13929` e `:14752` empurram listas montadas em tempo de execução. O campo `misto: true` marca as cinco; a `voz` declarada é a da linha que o jogador sempre vê, e a outra fica no `nasce`. Contar as duas exigiria executar o App" },
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
