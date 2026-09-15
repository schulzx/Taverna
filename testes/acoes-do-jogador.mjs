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
  /* ---------------- AS 12 DO PAINEL "AÇÕES" ----------------
     O handler é ÚNICO e só enche a caixa de texto:
     `onClick={() => { setEntrada(a.texto); setAcoesAbertas(false); }}`
     (`src/App.jsx:20564`). O botão, por si, não dispara turno nenhum —
     quem decide o destino é o texto que ele escreveu, depois de enviado. */
  { id: "pronta_atacar", rotulo: "Atacar", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1072", handler: "src/App.jsx:20564 (só setEntrada)",
    texto: "Ataco ",
    cliqueChega: "caixa", textoFora: "motor", textoLuta: "cena",
    alcanca: "fora: porta `agressao` → abre combate e rola INICIATIVA (nenhum dado de ataque). dentro: porta fechada → cai em `cena` → resolverAtaqueJogador (src/App.jsx:13218) → recusado por alcance no turno 1" },
  { id: "pronta_esquivar", rotulo: "Esquivar", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1073", handler: "src/App.jsx:20564 (só setEntrada)",
    texto: "Fico em postura defensiva, esquivando e me protegendo neste turno",
    cliqueChega: "caixa", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor: não casa desafio nem agressão — cai em `cena`" },
  { id: "pronta_empurrar", rotulo: "Empurrar", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1074", handler: "src/App.jsx:20564 (só setEntrada)",
    texto: "Empurro com força ",
    cliqueChega: "caixa", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor — cai em `cena`" },
  { id: "pronta_derrubar", rotulo: "Derrubar", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1075", handler: "src/App.jsx:20564 (só setEntrada)",
    texto: "Tento derrubar no chão ",
    cliqueChega: "caixa", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor — cai em `cena`" },
  { id: "pronta_correr", rotulo: "Correr", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1076", handler: "src/App.jsx:20564 (só setEntrada)",
    texto: "Corro em disparada para ",
    cliqueChega: "caixa", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor — cai em `cena`. O grid tem deslocamento, e esta frase não o alcança" },
  { id: "pronta_saltar", rotulo: "Saltar", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1077", handler: "src/App.jsx:20564 (só setEntrada)",
    texto: "Salto sobre ",
    cliqueChega: "caixa", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → adjudicarAcao (src/App.jsx:15635) rola o dado" },
  { id: "pronta_esconder", rotulo: "Esconder", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1078", handler: "src/App.jsx:20564 (só setEntrada)",
    texto: "Me escondo nas sombras, buscando cobertura",
    cliqueChega: "caixa", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → rola o dado" },
  { id: "pronta_procurar", rotulo: "Procurar", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1079", handler: "src/App.jsx:20564 (só setEntrada)",
    texto: "Examino o lugar com atenção, procurando ",
    cliqueChega: "caixa", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → rola o dado" },
  { id: "pronta_ajudar", rotulo: "Ajudar", fonte: "ACOES_PRONTAS", combate: true,
    onde: "src/App.jsx:1080", handler: "src/App.jsx:20564 (só setEntrada)",
    texto: "Ajudo ",
    cliqueChega: "caixa", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor — cai em `cena`. A Ajuda do 5e (vantagem a um aliado) não existe em código" },
  { id: "pronta_intimidar", rotulo: "Intimidar", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1081", handler: "src/App.jsx:20564 (só setEntrada)",
    texto: "Intimido com olhar e presença ",
    cliqueChega: "caixa", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → rola o dado" },
  { id: "pronta_persuadir", rotulo: "Persuadir", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1082", handler: "src/App.jsx:20564 (só setEntrada)",
    texto: "Tento persuadir ",
    cliqueChega: "caixa", textoFora: "motor", textoLuta: "motor",
    alcanca: "casa desafio (tipo `teste`) → rola o dado" },
  { id: "pronta_enganar", rotulo: "Enganar", fonte: "ACOES_PRONTAS", combate: false,
    onde: "src/App.jsx:1083", handler: "src/App.jsx:20564 (só setEntrada)",
    texto: "Tento enganar ",
    cliqueChega: "caixa", textoFora: "cena", textoLuta: "cena",
    alcanca: "nenhum leitor — cai em `cena`. Persuadir e Intimidar casam; Enganar, não" },

  /* ---------------- AS 8 DO PAINEL RÁPIDO ----------------
     Estas entram DE VERDADE no motor:
     `onClick` (`src/App.jsx:20593`) → `declararAcaoRapida` (`:15886`)
     → `adjudicarAcao` (`:15635`) → dado.
     Nenhuma é de combate — é o achado que pôs a Fase X na frente. */
  { id: "rapida_buscar", rotulo: "Vasculhar", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:622", handler: "src/App.jsx:20593 → declararAcaoRapida",
    texto: "vasculho o lugar com atenção",
    cliqueChega: "motor", textoFora: "motor", textoLuta: "motor",
    alcanca: "desafio `teste` → rola. Na REPETIÇÃO no mesmo lugar vira `jaTentou` e não rola" },
  { id: "rapida_investigar", rotulo: "Investigar", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:623", handler: "src/App.jsx:20593 → declararAcaoRapida",
    texto: "investigo os vestígios",
    cliqueChega: "motor", textoFora: "motor", textoLuta: "motor", alcanca: "desafio `teste` → rola" },
  { id: "rapida_escutar", rotulo: "Escutar", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:624", handler: "src/App.jsx:20593 → declararAcaoRapida",
    texto: "encosto o ouvido e escuto com atenção",
    cliqueChega: "motor", textoFora: "motor", textoLuta: "motor", alcanca: "desafio `teste` → rola" },
  { id: "rapida_fraqueza", rotulo: "Lembrar", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:625", handler: "src/App.jsx:20593 → declararAcaoRapida",
    texto: "tento lembrar o que sei sobre esta criatura, alguma fraqueza",
    cliqueChega: "motor", textoFora: "motor", textoLuta: "motor", alcanca: "desafio `teste` → rola" },
  { id: "rapida_convencer", rotulo: "Convencer", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:626", handler: "src/App.jsx:20593 → declararAcaoRapida",
    texto: "tento convencer",
    cliqueChega: "motor", textoFora: "motor", textoLuta: "motor", alcanca: "desafio `teste` → rola" },
  { id: "rapida_intimidar", rotulo: "Intimidar", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:627", handler: "src/App.jsx:20593 → declararAcaoRapida",
    texto: "intimido",
    cliqueChega: "motor", textoFora: "motor", textoLuta: "motor", alcanca: "desafio `teste` → rola" },
  { id: "rapida_furtar_se", rotulo: "Esgueirar", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:628", handler: "src/App.jsx:20593 → declararAcaoRapida",
    texto: "me esgueiro sem ser visto",
    cliqueChega: "motor", textoFora: "motor", textoLuta: "motor", alcanca: "desafio `teste` → rola" },
  { id: "rapida_tranca", rotulo: "Arrombar", fonte: "ACOES_RAPIDAS", combate: false,
    onde: "src/desafios.js:632", handler: "src/App.jsx:20593 → declararAcaoRapida",
    texto: "tento arrombar a porta",
    cliqueChega: "motor", textoFora: "motor", textoLuta: "motor", alcanca: "desafio `teste` → rola" },

  /* ---------------- FORA DO PAINEL ----------------
     Os cliques que chegam ao motor sem passar pela caixa de texto. */
  { id: "grid_mover", rotulo: "Mover no grid", fonte: "grid", combate: true,
    onde: "src/App.jsx:14229", handler: "clique no quadrado → moverPara",
    texto: null,
    cliqueChega: "motor", textoFora: null, textoLuta: null,
    alcanca: "muda x,y do herói (src/App.jsx:14296) e gasta o movimento da economia" },
  { id: "bolsa_consumivel", rotulo: "Beber da bolsa", fonte: "bolsa", combate: true,
    onde: "src/App.jsx:19265", handler: "clique em `usar` → usarConsumivelUI",
    texto: null,
    cliqueChega: "motor", textoFora: null, textoLuta: null,
    alcanca: "rola o dado da poção, aplica a cura e tira o item da bolsa" },
  { id: "heroismo_gasto", rotulo: "Gastar heroísmo", fonte: "heroismo", combate: true,
    onde: "src/App.jsx:14904", handler: "PainelHeroismo (src/painel-heroismo.jsx:106) → aoGastar",
    texto: null,
    cliqueChega: "motor", textoFora: null, textoLuta: null,
    alcanca: "gastarHeroismo desconta o ponto. MAS o gasto `refazer` (src/App.jsx:14894) só existe com um dado na tela — e em combate o jogador não consegue rolar nenhum" },
  { id: "texto_ataque", rotulo: "Texto livre de ataque", fonte: "teclado", combate: true,
    onde: "src/App.jsx:13218", handler: "caixa de texto → agirInterno",
    texto: "Ataco <alvo>",
    cliqueChega: "nada", textoFora: "motor", textoLuta: "cena",
    alcanca: "fora: `lerAgressao` (src/agressao.js:177) exige alvo REGISTRADO no elenco; 7 de 8 frases naturais morrem em `semAlvoConhecido`. dentro: chega a resolverAtaqueJogador e é recusado por alcance no turno 1 (ver ABERTURA_FORA_DE_ALCANCE)" },
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
    { campo: "combate.recursos", escritoEm: "src/App.jsx:5230",
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
  { o: "o relógio do mundo (45 min)", porque:
    "src/App.jsx:12959 avança MINUTOS_POR_TURNO em todo turno fora de combate, faça o jogador o que fizer. Um número que muda sempre não distingue turno que fez de turno que não fez: incluí-lo daria 0% de esterilidade por construção e a medida perderia o sentido" },
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
  /* As taxas medidas em X1. `pares` = ação × contexto (fora/dentro). */
  taxas: [
    { recorte: "espaço de ações", universo: 42, estereis: 12, taxa: 28.6,
      nota: "20 do painel × 2 contextos + mover + bolsa" },
    { recorte: "dentro do combate", universo: 22, estereis: 6, taxa: 27.3,
      nota: "o recorte que a Fase X ataca" },
    { recorte: "sessão A", universo: 7, estereis: 7, taxa: 100,
      nota: "reproduz o 7-em-7 relatado pelo `jogo`, deterministicamente" },
  ],
  /* O que a sessão A produz hoje, e que X2 tem de mudar. */
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
   `semAlcance` (`src/App.jsx:11613-11617`) sai em `:13222-13225` ANTES de
   gastar a ação — deliberadamente, por `:13219-13221` ("golpe sem
   alcance não gasta a ação"). Sem gastar a ação, `fecharMeuTurno` →
   `resolverRevide` (`src/App.jsx:14034-14038`) nunca roda: o inimigo
   também nunca age. O jogador ataca sete vezes, o sistema recusa sete
   vezes sem cobrar nada, e a rodada não vira. PV 20/20 para sempre.

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
  alcanceDeArmaLonge: 36,           // metros — src/App.jsx:11609
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
    ondeRecusa: "src/App.jsx:11613-11617",
    ondeSai: "src/App.jsx:13222-13225",
    naoGastaAcao: "src/App.jsx:13219-13221",
    logo: "fecharMeuTurno/resolverRevide (src/App.jsx:14034-14038) nunca roda — o inimigo também não age",
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
   clicou. Esta lista só pode encolher. */
export function acoesDeCombateSemMotor() {
  return ACOES_DO_JOGADOR.filter((a) => a.combate && a.cliqueChega !== "motor");
}

/* Quantos CLIQUES chegam ao motor — a manchete de X1 sai daqui:
   8 rápidas + mover + bolsa + heroísmo entram; as 12 prontas, não. */
export function contarPorClique() {
  const c = { motor: 0, caixa: 0, nada: 0 };
  for (const a of ACOES_DO_JOGADOR) c[a.cliqueChega] += 1;
  return c;
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
