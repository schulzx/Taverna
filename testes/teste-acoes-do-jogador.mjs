/* AS AÇÕES DO JOGADOR (X1) — a suíte que lê a medição de volta

   O que esta suíte guarda: a régua de X1 não pode virar prosa. Ela
   afirma, com número, o que a tabela `acoes-do-jogador.mjs` declara, e
   RECALCULA a sessão estéril a partir dos motores puros — o "7 em 7" é
   afirmado aqui, não copiado de um relatório.

   A ASSERÇÃO QUE IMPORTA, e que é a catraca de X2: a lista de ações de
   COMBATE sem caminho ao motor é declarada e **só encolhe**. Quando X2
   fizer o botão chamar o motor, o número tem de BAIXAR e o teto tem de
   ser baixado junto, no mesmo commit — é assim que a conquista fica
   travada e a regressão fica vermelha.

   X1 mede, não conserta: nenhuma asserção de outra suíte foi tocada. */

const RAIZ = "../src/";
const G = await import(RAIZ + "grid.js");
const A = await import(RAIZ + "agressao.js");
const D = await import(RAIZ + "desafios.js");
const T = await import(RAIZ + "turno.js");
const { readFileSync } = await import("node:fs");
const APP = readFileSync("../src/App.jsx", "utf8");
/* R4b: a tela da luta é um arquivo próprio desde E3, e o veredito antes do
   clique mora lá. Ler só o App passou a ser ler meio jogo. */
const TELA_DA_LUTA = readFileSync("../src/painel-batalha.jsx", "utf8");

import {
  ACOES_DO_JOGADOR, MOTOR_SEM_CHAMADOR, TURNO_ESTERIL, ABERTURA_FORA_DE_ALCANCE,
  NUMERO_QUE_MUDA, NAO_CONTA_COMO_NUMERO,
  FUNIL_DO_COMBATE, RECUSAS_DO_COMBATE, NAO_CONTA_COMO_FRASE,
  SESSAO_A_PELA_FRASE, O_QUE_NAO_DEU_PARA_MEDIR,
  acoesDeCombateSemMotor, acoesComCliqueCondicional,
  contarPorClique, contarPorTexto, contarCombate,
  contarFunil, contarRecusas, recusasPorFamilia, vozQueNasceNoModulo,
} from "./acoes-do-jogador.mjs";
/* X2: o módulo puro do golpe entra na suíte porque a asserção nova roda
   ele DE VERDADE — não é leitura de texto, é a frase do botão passando
   pelo mesmo detector que a frase digitada passa. */
const GOLPE = await import(RAIZ + "golpe.js");
/* T1-A 6.ª fatia: a abertura da luta saiu do App para o motor */
const ABRIR = await import(RAIZ + "motor/combate-do-turno.js");
const COMBATE = await import(RAIZ + "combate.js");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* ============================================================
   A CATRACA DE X2 — o teto que só pode descer

   Este número é a dívida medida em X1: das ações que o jogador tem em
   combate, quantas NÃO chegam ao motor.

   ---------------- O TETO DESCEU EM X2: 7 → 6 ----------------

   X1 escreveu este bloco com 7 e com `pronta_atacar` dentro, e escreveu
   também a regra para mexer nele: "baixar exige tirar o `id` da lista no
   MESMO COMMIT que fez o botão chamar o motor". É o que esta etapa faz.
   `pronta_atacar` sai porque o clique de `Atacar`, com a luta aberta,
   passou a entrar por `declararGolpe` → `aplicarGolpeDoJogador` →
   `resolverAtaqueJogador` — o bloco 1-B abaixo prova a cadeia, e o
   varredor confere o handler contra o código.

   O `<=` continua sendo `<=` e não `===`: descer de novo é vitória e não
   pode exigir editar este arquivo. O que a segunda asserção guarda é a
   IDENTIDADE da lista — descer trocando um id por outro seria regressão
   disfarçada de conquista.

   COMO MEXER NESTE NÚMERO (leia antes de editar):
   baixar exige tirar o `id` da lista abaixo no mesmo commit que fez o
   botão chamar o motor. SUBIR é regressão: quer dizer que uma ação de
   combate perdeu o caminho ao motor, ou que nasceu um botão de combate
   que só escreve texto.
   ============================================================ */
/* ---------------- O TETO DESCEU EM R4b: 6 → 1, E NÃO É CONQUISTA ----------------
   ESTE É O CASO QUE A REGRA ACIMA MANDA ESCREVER, e escrevo-o inteiro
   porque ele desce por um motivo que a regra não previa.

   Os cinco `pronta_*` saem da lista SEM TEREM GANHO MOTOR NENHUM: saíram
   os botões. R4b aposentou os vinte controles do painel de `Ações` — a
   medida é do `jogo`: zero dos vinte dizia o preço na tela, oito
   escondiam-no em `title`, que no telefone não existe. A conta que esta
   catraca faz é *ação de combate cujo CLIQUE não chega ao motor*; sem
   botão não há clique, e uma linha sem clique deixa de ter opinião neste
   eixo — não passa a ter uma boa.

   SE ISTO FOSSE "regressão disfarçada de conquista", seria por se ter
   apagado a dívida em vez de a pagar. NÃO FOI APAGADA, e é por isso que
   esta lista pode encolher com a cabeça erguida: que Esquivar, Empurrar,
   Derrubar, Correr e Ajudar continuam sem motor está escrito, um a um e
   com o porquê, em `VERBOS_DE_COMBATE` (`src/golpe.js` — campo
   `porqueSemMotor`), que roda em Node e é lido por `teste-golpe.mjs`.
   Saiu de uma lista de perdão numa suíte e foi para uma tabela do motor,
   que é onde devia estar desde sempre. Dar-lhes mecânica continua a ser
   decisão pesada, e continua a ser da pessoa.

   O que sobra aqui é `texto_ataque`, que é o único destes que NÃO depende
   de botão nenhum: é a frase digitada, ela chega ao motor e morre no
   alcance. O `<=` continua `<=`. */
const TETO_SEM_MOTOR = 1;   // 7 até X1 · 6 em X2 · 1 em R4b (os botões saíram)
const SEM_MOTOR_HOJE = [
  "texto_ataque",      // chega ao motor e morre no alcance
];

sec("1. a catraca — as ações de combate cujo CLIQUE não chega ao motor");
{
  const sem = acoesDeCombateSemMotor();
  const ids = sem.map((a) => a.id).sort();
  t(`hoje são ${TETO_SEM_MOTOR} e não mais que isso`, sem.length <= TETO_SEM_MOTOR,
    `medido ${sem.length}, teto ${TETO_SEM_MOTOR} — se subiu, uma ação de combate perdeu o motor`);
  t("e são exatamente as declaradas (nenhuma troca em silêncio)",
    ids.join() === [...SEM_MOTOR_HOJE].sort().join(),
    `medido: ${ids.join()}`);

  /* ---------------- AS TRÊS QUE VIRARAM (X2) ----------------
     Até X1 estas três linhas afirmavam o contrário, e afirmavam a
     manchete da fase: `cliqueChega !== "motor"`, `=== "caixa"` e um
     handler que casava /só setEntrada/. Elas NÃO foram afrouxadas nem
     apagadas — foram invertidas, porque o jogo virou nesta etapa: o
     botão `Atacar` da mesa de combate chama o motor.

     Invertidas na ETAPA X2, e é este o motivo. Se elas voltarem a
     falhar, alguém devolveu o botão para dentro da caixa de texto — que
     é exatamente a regressão que a Fase X existe para impedir. */
  /* ---------------- E VIRARAM OUTRA VEZ, EM R4b ----------------
     MOTIVO, e é o achado desta etapa. X2 escreveu aqui que o clique de
     `Atacar` chegava ao motor, e a régua deu-o por verdadeiro um ciclo
     inteiro. O desvio (`if (golpeVivo) declararGolpe(...)`) só corria com
     `vereditoDoGolpeAgora()` não-nulo, isto é, com `combateRef.current`
     — e havendo combate quem se pinta é `TelaDeBatalha`, não este painel,
     que só existe sob `!emBatalha`. A fiação morreu no dia em que E3
     levou a batalha para o arquivo dela. A régua media o TEXTO do handler
     e nunca se ele chegava a correr: é a limitação que o bloco 1-B
     declara, e aqui ela custou uma afirmação falsa.

     Isto NÃO é a regressão que a Fase X existe para impedir — essa seria
     o `Atacar` COM motor voltar para dentro de uma caixa de texto. O
     `Atacar` com motor é o `aoAtacar` da tela da batalha, chama
     `declararGolpe(null)`, e continua intacto (elo 1, bloco 1-B). */
  const atacar = ACOES_DO_JOGADOR.find((a) => a.id === "pronta_atacar");
  t("o botão `Atacar` do painel de Ações foi aposentado (R4b)", atacar.cliqueChega === "aposentado");
  t("e o painel não voltou ao App", !/if \(golpeVivo\) \{ declararGolpe\(/.test(APP));
  t("e o `Atacar` com motor continua a ser o da tela da batalha",
    /aoAtacar=\{\(\) => \{ try \{ declararGolpe\(null\); \}/.test(APP));

  /* A METADE QUE NÃO VIROU, e que a régua tem de continuar dizendo: fora
     da luta o mesmo botão segue enchendo a caixa. Não é conserto pela
     metade — é pela FRASE que a briga começa (a porta `agressao` só abre
     fora do combate), e trocar isso tiraria do jogador o começo da
     briga. Esta linha guarda que a exceção fica ESCRITA. */
  /* R4b: a exceção do eixo condicional deixa de existir com o botão que a
     tinha. `cliqueChegaFora` descrevia um botão que se comportava de dois
     jeitos — motor na luta, caixa fora dela —, e sem botão não há dois
     jeitos. A lista fica VAZIA e continua vigiada, que é o que importa:
     o dia em que nascer um segundo controle com duas caras, esta linha
     morde antes de ele passar despercebido. */
  t("nenhuma ação tem clique condicional, porque nenhuma tem dois botões",
    acoesComCliqueCondicional().length === 0,
    acoesComCliqueCondicional().map((a) => a.id).join());
  t("e `Atacar` não guarda mais uma segunda coluna de clique", atacar.cliqueChegaFora == null);
}

/* ============================================================
   1-B. EXISTE CAMINHO DO CLIQUE ATÉ UM NÚMERO MUDAR (X2)

   A ASSERÇÃO QUE X2 DEIXA, e que vale mais que o teto. Um teto que desce
   diz que a tabela mudou; este bloco diz que o JOGO mudou. X1 fechou a
   medição apontando o que faltava, palavra por palavra: "falta a
   terceira [prova], e é a que X2 vai ter de fazer passar: existe um
   caminho, em quantos turnos, do começo da luta até um dado rolado".
   É esta.

   ---------------- O QUE É SONDA E O QUE É LEITURA ----------------

   Está separado em dois grupos porque as duas coisas NÃO valem o mesmo,
   e misturá-las é como uma régua mente sem querer:

   SONDA — roda módulo de verdade em Node, sem React. `golpe.js`,
   `agressao.js` e `grid.js` são executados; o que sai são os valores
   deles. Se o módulo mudar, esta metade quebra sozinha.

   LEITURA DE CÓDIGO — `App.jsx` é React e não roda aqui. Esta metade lê
   o arquivo como TEXTO e conta call-sites. Ela prova que a cadeia está
   escrita e que a aplicação do golpe tem UM caminho só; ela NÃO prova
   que o clique executou. É a mesma limitação honesta que X1 declarou, e
   é `check-acoes-do-jogador.mjs` quem guarda que o texto lido ainda
   descreve o código.
   ============================================================ */
sec("1-B. do clique ao número — o que roda (sonda) e o que se lê (texto)");
{
  /* ---------------- SONDA: a frase do botão é a frase do teclado ----------------
     O detector de ataque mora dentro do App e não pode ser importado.
     Então ele é EXTRAÍDO como texto e EXECUTADO aqui: a expressão é a do
     código, a execução é de verdade. Se o botão escrevesse uma frase que
     este detector não casa, o painel teria aberto um caminho paralelo —
     que é o defeito que a Fase X existe para matar. */
  const N = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const mRx = APP.match(/const verboAtaque = \/(.+?)\/\.test\(acaoN\);/);
  t("o detector de ataque do App foi encontrado para ser executado aqui", !!mRx);
  const rxApp = mRx ? new RegExp(mRx[1]) : null;
  const frase = GOLPE.fraseDoGolpe({ nome: "Bandido" });
  t("a frase canônica do botão é a que um jogador escreveria", frase === "Ataco Bandido", frase);
  t("e ela casa o MESMO detector que a frase digitada casa", !!rxApp && rxApp.test(N(frase)));
  /* e do outro lado da porta: fora da luta, a mesma frase abre o combate
     pelo leitor de agressão — módulo real, rodando */
  const elenco = [{ nome: "Bandido", papel: "salteador", relacao: "hostil" }];
  t("a mesma frase é declaração de ataque para agressao.js", A.ehDeclaracaoDeAtaque(frase) === true);
  const abre = A.lerAgressao(frase, { presentes: elenco, grupo: [], emCombate: false });
  t("e fora da luta ela abre o combate", !!abre && abre.tipo === "agressao");

  /* ---------------- SONDA: o estado em que o clique é permitido EXISTE ----------------
     Sem isto, "o botão chama o motor" seria promessa: na abertura de
     todas as dez plantas o veredito recusa, e o botão fica impedido. A
     sonda anda o herói com `alcancaveisDe` — caminho real, orçamento
     real — e mostra que a recusa VIRA permissão, e em quantos turnos.
     Mesma política da sonda: planta "estrada", 1 inimigo não-ágil. */
  const grade = G.montarGrade({ local: TURNO_ESTERIL.politicaDaSessaoA.planta });
  const p0 = G.posicionar(grade, { heroi: { nome: "Bram" }, grupo: [], inimigos: [{ nome: "Bandido", vida: 11 }] });
  const inim = p0.inimigos[0];
  const vdDe = (eu) => GOLPE.vereditoDoGolpe({ grade, meuLugar: eu, inimigos: [inim], alcanceM: G.alcanceNatural(eu) });
  t("na abertura o veredito recusa — o botão nasce impedido", vdDe(p0.heroi).algumAoAlcance === false);
  t("e a recusa é por DISTÂNCIA, não por parede (nesta planta)", vdDe(p0.heroi).maisProximo.razao === "longe");
  let eu = { ...p0.heroi }, passos = 0;
  const ocup = new Set([`${inim.x},${inim.y}`]);
  while (!vdDe(eu).algumAoAlcance && passos < TURNO_ESTERIL.politicaDaSessaoA.turnos) {
    const cands = [...G.alcancaveisDe(grade, eu, { ocupados: ocup, deslocamentoM: G.DESLOCAMENTO_PADRAO })]
      .map((k) => { const [x, y] = k.split(",").map(Number); return { x, y }; })
      .sort((a, b) => G.distanciaM(a, inim) - G.distanciaM(b, inim));
    if (!cands.length || G.distanciaM(cands[0], inim) >= G.distanciaM(eu, inim)) break;
    eu = { ...eu, x: cands[0].x, y: cands[0].y }; passos++;
  }
  const vdPerto = vdDe(eu);
  t("andando, o veredito VIRA: o clique passa a ser permitido", vdPerto.algumAoAlcance === true, `passos=${passos}`);
  t("e o preço está dentro do que X1 mediu (2 a 3 turnos andando)",
    passos >= ABERTURA_FORA_DE_ALCANCE.turnosAndandoAteOGolpe.minimo
    && passos <= ABERTURA_FORA_DE_ALCANCE.turnosAndandoAteOGolpe.maximo, `passos=${passos}`);
  /* e o alvo que o botão escolheria é um alvo de verdade, cuja frase
     ainda casa o detector — a ponta da sonda encosta na ponta da cadeia */
  const escolhido = vdPerto.aoAlcance[0];
  t("o veredito nomeia o alvo que o botão miraria", !!escolhido && escolhido.nome === "Bandido");
  t("e a frase montada para ESSE alvo ainda casa o detector",
    !!rxApp && rxApp.test(N(GOLPE.fraseDoGolpe(escolhido))));

  /* ---------------- LEITURA DE CÓDIGO: uma cadeia, uma aplicação ----------------
     Daqui para baixo nada roda: é `App.jsx` lido como texto. O que se
     conta é call-site, e o que se prova é que a aplicação do golpe tem
     UM caminho — dois chamadores entrando na mesma porta, e nenhum
     terceiro. Duas metades do mesmo golpe divergem na primeira vez que
     alguém mexer numa só, e é esse bug que a contagem impede. */
  const corpoDe = (nome, ate) => {
    const i = APP.indexOf(`const ${nome} = `);
    const j = APP.indexOf(ate, i);
    return i >= 0 && j > i ? APP.slice(i, j) : "";
  };
  const contar = (rx) => (APP.match(rx) || []).length;

  const corpoDeclarar = corpoDe("declararGolpe", "const resolverHabilidadeOfensiva");
  const corpoAplicar = corpoDe("aplicarGolpeDoJogador", "const vereditoDoGolpeAgora");
  t("o despachante `declararGolpe` existe no App", corpoDeclarar.length > 0);
  t("e a porta única `aplicarGolpeDoJogador` também", corpoAplicar.length > 0);

  /* elo 1: quem toca em `declararGolpe` são BOTÕES, e nunca um caminho
     paralelo. E3 deu-lhe o segundo — o verbo `Atacar` da tela da batalha —
     e ele é a MESMA porta: chama `declararGolpe`, que chama `fraseDoGolpe`,
     que alimenta `aplicarGolpeDoJogador`. O que esta asserção guarda nunca
     foi o número de botões: é que nenhum deles monte a frase por conta
     própria nem salte a porta única — e o elo 3, logo abaixo, é quem prova
     isso, com os seus DOIS chamadores intactos. */
  t("`declararGolpe` tem DOIS chamadores, e os dois são botões da mesma porta",
    contar(/\bdeclararGolpe\s*\(/g) === 2, String(contar(/\bdeclararGolpe\s*\(/g)));
  t("e o segundo é o verbo `Atacar` da tela da batalha",
    /aoAtacar=\{\(\) => \{ try \{ declararGolpe\(null\); \}/.test(APP));
  /* R4b: o "primeiro" chamador era o `onClick` das ACOES_PRONTAS, e
     aposentou-se com o painel. O que esta linha media — que nenhum botão
     monte a frase por conta própria — continua medido pelo elo 3, que
     conta os chamadores de `aplicarGolpeDoJogador`. Aqui fica a cerca do
     outro lado: o desvio não pode renascer. */
  t("e o painel de Ações não trouxe de volta um terceiro caminho",
    !/if \(golpeVivo\) \{ declararGolpe\(/.test(APP));
  /* elo 2: a frase vem do módulo, não de uma string montada na tela */
  t("`fraseDoGolpe` é chamada UMA vez, e é dentro de `declararGolpe`",
    contar(/\bfraseDoGolpe\s*\(/g) === 1 && /fraseDoGolpe\(/.test(corpoDeclarar));
  t("e é ela que alimenta a porta única",
    /aplicarGolpeDoJogador\(fraseDoGolpe\(/.test(corpoDeclarar));
  /* elo 3: DOIS chamadores, e nenhum terceiro — a prova do caminho único */
  t("`aplicarGolpeDoJogador` tem exatamente DOIS chamadores",
    contar(/\baplicarGolpeDoJogador\s*\(/g) === 2, String(contar(/\baplicarGolpeDoJogador\s*\(/g)));
  t("um é o texto digitado (agirInterno)",
    /if \(aplicarGolpeDoJogador\(acao, fichaViva\(\) \|\| personagem\)\) return;/.test(APP));
  t("e o outro é o botão, via `declararGolpe`", /aplicarGolpeDoJogador\(/.test(corpoDeclarar));
  /* elo 4: e a resolução do golpe acontece num lugar só */
  t("`resolverAtaqueJogador` é chamado UMA vez em todo o App",
    contar(/\bresolverAtaqueJogador\s*\(/g) === 1);
  t("e essa única chamada está dentro da porta única",
    /resolverAtaqueJogador\(acao, pers\)/.test(corpoAplicar));

  /* elo 5: o NÚMERO. De nada adianta a cadeia existir se a ponta dela
     não mexe em nada — é o que X1 mediu e chamou de turno estéril. */
  t("a ponta da cadeia gasta a ação", /eco\.acao -= 1/.test(corpoAplicar));
  t("e escreve PV no inimigo", /vida: pvDepois/.test(corpoAplicar));
  t("e registra o dado rolado", /logDadoCombate\(resumoDoAtaque\(r\)\)/.test(corpoAplicar));

  /* elo 6: o veredito antes do clique — a lei da casa manda mostrar o
     preço ANTES da ação irreversível, e aqui ele vira estado do botão */
  /* R4b: a âncora mudou de arquivo, e o motivo é o da etapa inteira. A
     trava que X2 escreveu (`const impedido = golpeVivo && ...` +
     `disabled={impedido}`) vivia no painel de `Ações` do App, que foi
     aposentado — e que, desde E3, já não se pintava durante a luta. A lei
     que esta linha guarda não mudou uma vírgula: *o veredito antes do
     clique*, e o clique impedido em vez de gasto. Ela vive agora onde o
     combate vive, e com uma forma melhor que a de X2 — `aria-disabled` e
     não `disabled`, para o verbo não sair da ordem de tabulação de quem
     ouve a tela, com a razão escrita ao lado em vez de um botão mudo. */
  t("o clique é IMPEDIDO quando ninguém está ao alcance, e é na tela da luta",
    /algumAoAlcance: vd \? !!vd\.algumAoAlcance : true/.test(TELA_DA_LUTA)
    && /aria-disabled=\{impedido \|\| undefined\}/.test(TELA_DA_LUTA));
  /* A ASSERÇÃO AFROUXOU EM K2 (16/09) E O MOTIVO FICA: ela fixava a linha de
     import inteira, letra por letra, e portanto proibia que o App importasse
     UMA QUARTA COISA de `golpe.js` — o que é o contrário do que ela quer
     dizer. W2 §3 levou `recusaDoGolpe`, `linhaDoGolpe` e `maisPertoAoAlcance`
     para lá, e a linha cresceu de três nomes para seis. O que a asserção
     afirma continua a ser exactamente o mesmo: que os três nomes do veredito
     chegam de `golpe.js` e de mais lado nenhum. Uma asserção que quebra quando
     o módulo GANHA um leitor estava a medir a pontuação, não a lei. */
  t("e o veredito é medido pelo mesmo módulo que resolve o golpe", (() => {
    const imp = APP.match(/import \{([^}]*)\} from "\.\/golpe\.js";/);
    const nomes = imp ? imp[1].split(",").map((s) => s.trim()) : [];
    return /vereditoDoGolpe\(\{/.test(APP)
      && ["alcanceDoGolpe", "vereditoDoGolpe", "fraseDoGolpe"].every((n) => nomes.includes(n));
  })());
}

sec("2. os dois eixos — o clique e a frase contam histórias diferentes");
{
  /* ---------------- O EIXO DO CLIQUE ESVAZIOU-SE (R4b) ----------------
     Era daqui que saía a manchete de X1 (11 no motor, 12 na caixa), e ela
     virou em X2 (12/11). Em R4b o eixo inteiro muda de tamanho: os VINTE
     botões do painel de `Ações` foram aposentados, e com eles vinte
     cliques. Sobram TRÊS — mover no grid, beber da bolsa e gastar
     heroísmo —, que são os cliques que nunca passaram por caixa de texto
     nenhuma e são exactamente os que o sistema sabe e o jogador não
     escreve. É a mesma régua da soleira, medida por outro instrumento.

     E `caixa` cai a ZERO, que é a frase mais curta desta etapa: não há
     mais nenhum controle nesta casa cujo trabalho seja escrever texto na
     caixa do jogador. O que se escreve na caixa, escreve-o o jogador. */
  const clique = contarPorClique();
  t("3 cliques chegam ao motor (mover + bolsa + heroísmo)", clique.motor === 3, JSON.stringify(clique));
  t("e nenhum controle escreve na caixa do jogador", clique.caixa === 0, JSON.stringify(clique));
  t("os 20 botões do painel estão marcados como aposentados", clique.aposentado === 20, JSON.stringify(clique));
  const prontasNoMotor = ACOES_DO_JOGADOR.filter((a) => a.fonte === "ACOES_PRONTAS" && a.cliqueChega === "motor");
  t("nenhuma das 12 prontas dispara o motor pelo clique, porque nenhuma tem clique",
    prontasNoMotor.length === 0, prontasNoMotor.map((a) => a.id).join());
  /* o recorte do MUNDO DE FORA vale a mesma coisa que o de dentro agora:
     sem botão, não há dois mundos de clique */
  const foraMotor = ACOES_DO_JOGADOR.filter((a) => (a.cliqueChegaFora || a.cliqueChega) === "motor").length;
  t("e fora da luta são os mesmos 3, porque o clique deixou de ter dois mundos", foraMotor === 3, String(foraMotor));

  /* EIXO DO TEXTO — a frase vai mais longe que o clique, e isso é
     verdade ao mesmo tempo: 5 das prontas casam desafio quando enviadas */
  const txtFora = contarPorTexto("fora");
  const txtLuta = contarPorTexto("luta");
  t("enviada como frase, boa parte chega ao motor fora da luta",
    txtFora.motor > clique.motor - 3, `${txtFora.motor}`);
  t("e dentro da luta a frase chega menos longe que fora",
    txtLuta.motor < txtFora.motor, `${txtLuta.motor} vs ${txtFora.motor}`);

  /* O RECORTE QUE IMPORTA: o combate, nos dois eixos */
  const c = contarCombate();
  t("são 10 ações de combate", c.total === 10, JSON.stringify(c));
  t("e 3 delas têm clique que chega ao motor", c.clique.motor === 3, JSON.stringify(c.clique));
  /* ---------------- A LINHA QUE RESUMIA A FASE X, E QUE VIROU DUAS VEZES ----------------
     X1: "NENHUMA das 3 é um golpe" — mover, beber e heroísmo, e nenhum
     jeito de bater. X2: "uma das 4 é um golpe", e era `pronta_atacar`.

     R4b desfaz a segunda volta, e é preciso ser exacto sobre o que isso
     quer dizer, porque parece uma derrota e não é: `pronta_atacar` sai da
     lista porque o BOTÃO saiu, não porque o golpe perdeu o caminho. O
     golpe pelo clique continua a existir e está medido logo acima (elo 1
     e elo 6), na tela da batalha, que é onde a luta se pinta desde E3 —
     e onde o clique de `Atacar` é o único que sempre pôde correr.

     A lista fica com os três que esta tabela sempre soube contar, e
     continua conferida id a id: trocar um pelo outro em silêncio continua
     vermelho. */
  const motorNaLuta = ACOES_DO_JOGADOR.filter((a) => a.combate && a.cliqueChega === "motor").map((a) => a.id).sort();
  t("e os 3 são os cliques que nunca passaram pela caixa de texto",
    motorNaLuta.join() === ["bolsa_consumivel", "grid_mover", "heroismo_gasto"].join(),
    motorNaLuta.join());
  t("nenhuma frase de combate chega ao motor dentro da luta",
    c.texto.motor === 0, JSON.stringify(c.texto));

  t("a tabela cobre as 12 prontas", ACOES_DO_JOGADOR.filter((a) => a.fonte === "ACOES_PRONTAS").length === 12);
  t("a tabela cobre as 8 rápidas", ACOES_DO_JOGADOR.filter((a) => a.fonte === "ACOES_RAPIDAS").length === 8);
  /* R4b: as 8 rápidas eram as ÚNICAS do painel que entravam no motor pelo
     clique, e é por isso que aposentá-las custou a decidir. O que
     desempatou: o atalho e o teclado terminavam no MESMO sítio —
     `declararAcaoRapida` chamava `adjudicarAcao`, e a frase digitada
     chama `adjudicarAcao` pela porta `desafio` de `executar`. O botão
     poupava digitação, não mecânica. A asserção passa a guardar
     exactamente isso, que é o que torna a perda aceitável: as oito
     continuam a chegar ao motor PELO TEXTO, nos dois contextos. */
  t("e as 8 rápidas continuam a chegar ao motor pelo texto, dentro e fora da luta",
    ACOES_DO_JOGADOR.filter((a) => a.fonte === "ACOES_RAPIDAS"
      && a.textoFora === "motor" && a.textoLuta === "motor").length === 8);
  t("e nenhuma delas tem clique, porque o botão saiu",
    ACOES_DO_JOGADOR.filter((a) => a.fonte === "ACOES_RAPIDAS" && a.cliqueChega === "aposentado").length === 8);
  t("e nenhuma delas é de combate",
    ACOES_DO_JOGADOR.filter((a) => a.fonte === "ACOES_RAPIDAS" && a.combate).length === 0);
}

sec("3. o 7 em 7 — recalculado, não copiado");
{
  /* A sessão A refeita aqui, com os motores puros: combate aberto, herói
     corpo a corpo, jogador declara ataque todo turno e não faz mais nada.
     Se um dia isto deixar de dar 7/7, é porque X2 andou — e aí este bloco
     muda junto, com o motivo escrito. */
  const grade = G.montarGrade({ local: TURNO_ESTERIL.politicaDaSessaoA.planta });
  const pos = G.posicionar(grade, { heroi: { nome: "Bram" }, grupo: [], inimigos: [{ nome: "Bandido", vida: 11 }] });
  const eu = pos.heroi, inim = pos.inimigos[0];
  let estereis = 0, rolagens = 0;
  for (let i = 0; i < TURNO_ESTERIL.politicaDaSessaoA.turnos; i++) {
    const ok = G.alcanca(grade, eu, inim, { alcanceM: G.alcanceNatural(eu) }).ok;
    if (ok) rolagens++; else estereis++;   // sem alcance: recusa sem dado e sem custo
  }
  t("7 turnos, 7 estéreis", estereis === 7, `estéreis=${estereis}`);
  t("e zero rolagens no combate inteiro", rolagens === 0, `rolagens=${rolagens}`);
  t("a tabela declara o mesmo que a conta acabou de medir",
    TURNO_ESTERIL.sessaoA_hoje.estereis === estereis && TURNO_ESTERIL.sessaoA_hoje.rolagens === rolagens);
  t("e a taxa da sessão A é 100%",
    TURNO_ESTERIL.taxas.find((x) => x.recorte === "sessão A").taxa === 100);
  t("a fórmula está escrita para X4 repetir", /turnos_sem_delta \/ turnos_totais/.test(TURNO_ESTERIL.formula));
  t("e o procedimento aponta a sonda permanente", /sonda-turno-esteril/.test(TURNO_ESTERIL.procedimento));
}

sec("4. a definição operacional de 'número que muda'");
{
  t("a lista do que conta é fechada e não-vazia", NUMERO_QUE_MUDA.length >= 7);
  t("PV/PM contam", NUMERO_QUE_MUDA.some((x) => /PV ou PM/.test(x)));
  t("posição no grid conta", NUMERO_QUE_MUDA.some((x) => /posição/.test(x)));
  t("um dado rolado conta", NUMERO_QUE_MUDA.some((x) => /dado rolado/.test(x)));
  /* a exclusão que mais mexe no resultado precisa estar escrita COM o porquê:
     sem ela a taxa daria 0% por construção */
  const relogio = NAO_CONTA_COMO_NUMERO.find((x) => /relógio/.test(x.o));
  t("o relógio de 45 min está excluído", !!relogio);
  t("e o porquê da exclusão está escrito", !!relogio && /por construção/.test(relogio.porque));
  /* O NÚMERO DA LINHA MUDOU DE NOVO, A EXCLUSÃO NÃO. Era `12959` em X1,
     `13161` em X2 e `13290` até a v9.262; hoje o
     `avancarMinutos(MINUTOS_POR_TURNO)` está em `13330`, porque H1 abriu a
     porta das habilidades de classe e somou linhas acima dele — o App
     cresceu por baixo dele outra vez. Trocado aqui pela
     mesma razão de sempre (uma régua que aponta a linha errada ensina a
     desconfiar dela) e, DESTA VEZ, com catraca: o dente 8 de
     `check-acoes-do-jogador.mjs` passou a re-derivar a linha do código,
     então a próxima mudança de endereço morde em vez de apodrecer calada.
     O que esta asserção guarda nunca foi o número, e sim que a exclusão
     venha com ENDEREÇO — é por ele que X4 confere que o relógio ainda
     avança sozinho antes de repetir a conta. */
  /* v9.273 (K4): 13502 -> 13499. v9.273 (K4): -3 linhas. A fila de pilulas da ficha (1993-2003) passou a consumir a peca `PilulaDeEscolha` e encolheu 3 linhas; o codigo abaixo dela andou junto e nada mais mudou.
     O relogio nao andou por vontade propria: o que ele guarda — que o turno
     fora de combate avanca MINUTOS_POR_TURNO faca o jogador o que fizer —
     continua palavra por palavra o mesmo. Endereco re-medido, assercao intacta. */
  /* E3: 13499 -> 13084. O turno fora de combate continua a avançar
     MINUTOS_POR_TURNO faça o jogador o que fizer; só o endereço andou. */
  /* R3: 13098 -> 13200, pelas 102 linhas do redesenho da tela principal
     (A soleira, A voz, o gesto do campo, a porta das linhas de sistema),
     das quais 95 entram acima do corpo do componente. O turno fora de
     combate continua a avançar MINUTOS_POR_TURNO faça o jogador o que
     fizer: mesma asserção, mesmo relógio, endereço re-medido. */
  /* E4: 13084 -> 13098, pelas treze linhas da chave `economia` em
     :4929. Mesma asserção, mesmo relógio, endereço re-medido. */
  /* R4b: 13200 → 13207. Motivo: a tabela dos doze verbos e o despachante
     das oito ações rápidas saíram do App acima desta linha, e o relógio
     desceu com o resto. O endereço foi re-medido pelo mapa do diff (é o
     `check-acoes-do-jogador.mjs`, bloco 8, quem o re-deriva a cada rodada);
     a asserção não mudou de sentido nem de força. */
  /* R13: 13207 -> 13784, pelo mesmo deslocamento das peças novas do topo do
     módulo — primeiro `A cinta` e `O painel do tempo` (etapa A), depois
     `O topo do papel` (etapa B). São duas etapas e um só motivo: componente
     dentro do render mata o foco do input, logo tudo o que se pinta nasce
     ao nível do módulo, e tudo o que vem depois desce.
     (comentário antigo, que fica pelo rasto:) pelo deslocamento do topo do
     módulo. O `check-acoes-do-jogador.mjs`, bloco 8, re-deriva este endereço
     a cada rodada e confirma-o; a asserção não mudou de sentido nem de força
     — continua a guardar que o porquê da exclusão vem com ENDEREÇO, para que
     a próxima medição o possa conferir. */
  /* R15: 13784 -> 13820, +36, pelo comentário que o conserto do nome da
     campanha pôs dentro de `salvar`. Conferido por CONTEÚDO — é o mesmo
     `extraTempo = avancarMinutos(MINUTOS_POR_TURNO)`. A asserção continua a
     guardar que o porquê da exclusão venha com ENDEREÇO; o que mudou foi
     onde a linha mora no arquivo, não o que ela faz.
     R17: 13820 -> 13931, +111 (a lápide de `VinhetaDaCena`/`IconeBalao`, a
     fiação do veredito do cartaz e o `partirOTurno` novo nascem acima).
     Conferido por conteúdo — é o mesmo `avancarMinutos(MINUTOS_POR_TURNO)`.
     A FUGA (frontend): 13931 -> 13933, +2 (o import de `fuga.js` e do
     rótulo do verbo Fugir, no topo do arquivo). Mesmo
     `avancarMinutos(MINUTOS_POR_TURNO)`. */
  /* R21 (oficial): o alforje no telefone - os imports do painel e da marca, a porta na cinta, o trilho so na larga e a fiacao do alforje entram ANTES destas linhas; tudo abaixo andou junto. Endereco re-medido pelo diff, conteudo identico; asserção intacta. 13933 -> 14025. */
  /* R21 (oficial, 2.º passe): a partida da marca da porta (a missão da chegada acende o Diário) entrou antes destas linhas. Endereço re-medido pelo diff, conteúdo idêntico; asserção intacta. 14025 -> 14036; 12630 -> 12641; 12580 -> 12591; 12646 -> 12657. */
  /* A FUGA (frontend, segunda volta — R21): 14036 -> 14051, +15 (o fôlego
     da fuga entrou acima, em `combateRef`/`aplicarResposta`). Conferido
     por conteúdo — é o mesmo `avancarMinutos(MINUTOS_POR_TURNO)`. */
  /* O TURNO DE QUEM CAIU (frontend, 24/09): 14051 -> 14078, +27 (o guarda
     que converte texto em turno de quem está inconsciente,
     `convertePraTurnoDoCaido`, entrou no topo de `agirInterno`, acima
     deste ponto). Conferido por conteúdo — é o mesmo
     `avancarMinutos(MINUTOS_POR_TURNO)`, e `check-acoes-do-jogador.mjs`
     (dente 8) confirma sozinho a cada corrida.
     A FUGA COBRA (frontend, R22): 14078 -> 14089, +11 (`sementeMundo` +
     `abrirCombate`, acima deste ponto). Conferido por conteúdo — é o
     mesmo `avancarMinutos(MINUTOS_POR_TURNO)`; o dente 8 confirma.
     O GOLPE FINAL (frontend, 29/09, MM3): 14089 -> 14239, +150 — o mesmo
     delta que `FUNIL_DO_COMBATE` registra a partir de `declararGolpe` no
     cabeçalho dele (a divisão de `aplicarGolpeDoJogador` em três, bem
     acima deste ponto). Conferido pelo próprio dente 8, que re-deriva a
     linha do código; o relógio não mudou de comportamento, só de linha.
     Mesmo dia, segunda medição: 14239 -> 14241, +2. Duas linhas de
     `console.warn("[MM3-DEBUG] ...")` entraram dentro de `aplicarGolpe-
     DoJogador` — depuração do próprio MM3, acima deste ponto — entre a
     minha primeira e a minha segunda corrida do varredor nesta etapa; é
     a prova de que o `App.jsx` seguiu em edição por outra mão enquanto
     eu reconciliava a tabela (duas mentes, mesma árvore). Re-medido pelo
     dente 8.
     Mesmo dia, terceira medição: 14241 -> 14239, -2. O `frontend` fechou o
     diagnóstico e removeu as 4 linhas de debug que chegaram a existir (as
     2 de cima, mais 2 que tinham nascido depois em `continuarGolpeDo-
     Jogador`/`responderGolpeFinal`) — o relógio volta ao endereço de antes
     de qualquer debug. Re-medido pelo dente 8; o comportamento guardado
     (o turno fora de combate avança MINUTOS_POR_TURNO faça o jogador o
     que fizer) não mudou em nenhuma das três medições de hoje.
     A peneira da agressão (frontend, MM, 29/09): 14239 -> 14257, +18 —
     ver o motivo completo junto do campo `porque`, em
     testes/acoes-do-jogador.mjs.
     O escondido entra na fiação (frontend, MM6, 29/09): 14257 -> 14326,
     +69 — mesmo motivo, mesmo lugar: o campo `porque` em
     testes/acoes-do-jogador.mjs.
     O golpe final é do grupo (frontend, 29/09, MM3b): 14326 -> 14357,
     +31 — o estado novo do cartão do grupo mais a função
     `responderGolpeFinalComp` (perto do estado e logo depois de
     `responderGolpeFinal`), ambos ANTES deste ponto no arquivo — mesmo
     motivo, mesmo lugar: o campo `porque` em testes/acoes-do-jogador.mjs.
     A cidade por dentro (frontend, MM12, 29/09): 14357 -> 14371, +14 —
     a fiação de `fichaParaPauta` em `pautaDoTurno`, acima no arquivo —
     mesmo motivo, mesmo lugar: o campo `porque` em
     testes/acoes-do-jogador.mjs.
     A gente por dentro (frontend, MM8a, 29/09): 14371 -> 14388, +17 —
     a fiação de `genteParaPauta` em `pautaDoTurno`, logo depois de
     `fichaParaPauta`, acima no arquivo — mesmo motivo, mesmo lugar: o
     campo `porque` em testes/acoes-do-jogador.mjs.
     Os tetos das pessoas (frontend, MM8c-1, 29/09): 14388 -> 14408, +20 —
     a recência do registo de NPCs, acima no arquivo — mesmo motivo, mesmo
     lugar: o campo `porque` em testes/acoes-do-jogador.mjs.
     O mundo puxa o herói (frontend, MM13, 30/09): 14408 -> 14482, +74 —
     mesmo motivo, mesmo lugar: o campo `porque` em
     testes/acoes-do-jogador.mjs.
     A fiação do primeiro dia (frontend, MM13b, 30/09): 14482 -> 14493,
     +11 — `ondeSeProcura`/`achavelAqui` e o débito de cobranca.js
     entraram acima, dentro de `aplicarResposta` — mesmo motivo, mesmo
     lugar: o campo `porque` em testes/acoes-do-jogador.mjs.
     A gente que pesa (frontend, MM8c-2, 30/09): 14493 -> 14499, +6 —
     o import de elenco.js e o contexto/nomes do elenco, mesmo motivo,
     mesmo lugar: o campo `porque` em testes/acoes-do-jogador.mjs.
     A gente que pesa, medida e cacheada (frontend, MM8c-2, 30/09):
     14499 -> 14509, +10 — o cache por identidade (elencoCacheRef), mesmo
     motivo, mesmo lugar: o campo `porque` em testes/acoes-do-jogador.mjs.
     A promoção (frontend, MM8e, 30/09): 14509 -> 14512, +3 — quatro
     pontos novos acima deste (o ref do save, os vistos, a promoção ao
     virar o dia, a saída na pauta), mesmo motivo, mesmo lugar: o campo
     `porque` em testes/acoes-do-jogador.mjs.
     A luta sem espada (frontend, MM9, 30/09): 14512 -> 14528, +16 —
     mesmo motivo, mesmo lugar: o campo `porque` em
     testes/acoes-do-jogador.mjs.
     O crime (frontend, MM10, 30/09): 14528 -> 14546, +18 — mesmo motivo,
     mesmo lugar: o campo `porque` em testes/acoes-do-jogador.mjs.
     As perguntas ao Mestre (frontend, MM14, 30/09): 14546 -> 14584, +38 —
     mesmo motivo, mesmo lugar: o campo `porque` em
     testes/acoes-do-jogador.mjs.
     Os dois canais antigos (frontend, MM14, 30/09): 14584 -> 14559, -25.
     A migração das tarefas antigas para missão do sistema (o load, o fio
     do descanso, a paga no fecho) entrou ACIMA deste ponto, mas a remoção
     dos dois canais que fechavam a lista antiga pelo título (o `forEach`
     do Narrador e o `casar` do Cronista) tirou mais linhas do que a
     migração somou — o líquido é -25. Re-medido pelo próprio dente 8 de
     check-acoes-do-jogador.mjs, com o diff de App.jsx contra HEAD
     conferindo cada endereço; nada somado de cabeça.
     A gente no lugar certo, com o nome certo (frontend, MM14 · 9b/10a,
     30/09): 14559 -> 14615, +56 — o `viuAntes` de `pessoasDaCena`, o
     helper `contextoDoNome`, e as três portas do registo (mais o mural)
     decidindo `nomeCerto` por `nomeComDono`, todas ACIMA deste ponto;
     mesmo motivo, mesmo lugar: o campo `porque` em
     testes/acoes-do-jogador.mjs.
     A extração de fichasDaMesa (frontend, MM14 · o resto do nº 6, 30/09):
     14615 -> 14633, +18 — o cálculo das três fichas mudou-se de
     `pautaDoTurno` para `fichasDaMesa`, ACIMA do relógio no arquivo; mesmo
     motivo, mesmo lugar: o campo `porque` em testes/acoes-do-jogador.mjs.
     O lugar pelo Cronista (frontend, MM15 (1), 30/09): 14633 -> 14638, +5 —
     `registrarLugar` passou a decidir pelo `lerLugarDito` (lugar.js), cinco
     linhas ACIMA do relógio no arquivo; mesmo motivo, mesmo lugar.
     As falas pagas e deitadas fora (frontend, MM15 (2), 30/09): 14638 ->
     14640, +2 — `colherAsFalas` trocou o `.slice` por `bocasDoTurno` mais
     uma saída antecipada, duas linhas ACIMA do relógio; mesmo motivo,
     mesmo lugar.
     A ligação não é o Mestre (frontend, MM15 (3), 30/09): 14640 -> 14808,
     +168 — a foto do início do turno em `agirInterno` nasce ACIMA do
     relógio no arquivo; mesmo motivo, mesmo lugar.
     O segredo guardado (frontend, MM15 (4), 30/09): 14808 -> 14829, +21 —
     os cinco pontos de O SEGREDO GUARDADO nascem ACIMA do relógio no
     arquivo; mesmo motivo, mesmo lugar.
     Os nomes que se fundem (frontend, MM15 (5), 30/09): 14829 -> 14833,
     +4 — `contextoDoNome` ganha `conhecidos`/`recentes` ACIMA do relógio
     no arquivo; mesmo motivo, mesmo lugar.
     O companheiro de antes (frontend, 01/10): 14833 -> 14858, +25 — a
     fiação do companheiro nasce dentro de `iniciar`, ACIMA do relógio no
     arquivo; mesmo motivo, mesmo lugar.
     A MASMORRA QUE SE ACABA (v9.348, 05/10): 14858 -> 14846, -12. O bloco do
     chefe saiu do ramo do Narrador e virou `concluirMasmorraDoChefe` (mais
     abaixo no arquivo, ABAIXO do relógio), e o ramo ficou 12 linhas mais
     curto ACIMA dele. Só o endereço andou — a asserção continua a exigir que
     a exclusão do relógio venha com a linha certa; re-medido pelo bloco 8 de
     check-acoes-do-jogador.mjs. */
  /* (v9.350 · o como chega) 14846 -> 14859, +13: a economia na seção dela e o
     `cederNaCena` no fim de `pautaDoTurno` nascem ACIMA do relógio. Só o
     endereço andou; re-medido pelo bloco 8 de check-acoes-do-jogador.mjs. */
  /* (v9.351 · a Nave como destino) MM16 nº 2, 05/10: 14859 -> 14951, +92: os
     +27 acima do combate (o import de boca.js, a guarda da ida em
     `alvoLocalPedido`, a chegada à boca em `talvezChegarSozinho`) e os +65 de
     `interceptarMovimento` e `ctxDoRastro` (uma frase, uma resposta; a ida até
     à boca), todos ACIMA do relógio. Só o endereço andou; re-medido pelo diff
     de App.jsx contra o de antes da etapa e pelo bloco 8 de
     check-acoes-do-jogador.mjs. */
  /* (v9.352 · a masmorra na pauta) MM16 nº 4, 06/10: 14951 -> 14985, +34: 
     a seção MASMORRA em `pautaDoTurno` (+6), o Local do rodapé que lá dentro diz a boca e não a estrada (+5), a recusa de combate que saiu de `registrarLugar` (-1), a guarda do `lugar_atual` no turno que abre a masmorra pelo sinal (+21) e o ONDE EU ESTOU calado lá dentro (+3),
     todos ACIMA do relógio. Só o endereço andou; re-medido pelo diff de
     App.jsx contra o de antes da etapa e pelo bloco 8 de
     check-acoes-do-jogador.mjs. */
  /* (v9.353 · esconder-se na luta) MM16 nº 6, 06/10: 14985 -> 14990, +5 —
     o rodapé de `enviar` passou a ler a ficha do turno (+5), ACIMA disto no
     arquivo. Só o endereço andou; re-medido pelo diff de App.jsx contra o
     HEAD, e conferido pelo varredor. */
  /* (v9.354 · a luz e a sombra) 06/10: 14990 -> 15028, +38 — o import de
     luz.js (+1), o mapa de luz junto de `fichaViva` (+23), a seção A LUZ em
     `pautaDoTurno` (+5) e o gesto da tocha depois do ato que revela (+9),
     todos ACIMA do relógio. Só o endereço andou; re-medido pelo diff de
     App.jsx contra o HEAD, e conferido pelo varredor. */
  /* (v9.356 · a região na criação) MM17 B, 06/10: 15028 -> 15048, +20 — o
     import de regiao.js (+1) e a escolha região ou continente em `iniciar`
     (+19 líquidos), ACIMA disto no arquivo. Só o endereço andou; re-medido
     pelo diff de App.jsx contra o HEAD, e conferido pelo varredor. */
  /* (v9.357 · a história amarrada à região) MM17 C1, 06/10: 15048 -> 15057,
     +9 — a espinha amarrada à região logo depois de `estenderEspinha`, em
     `iniciar`, ACIMA disto no arquivo. Só o endereço andou; re-medido pelo
     diff de App.jsx contra o HEAD, e conferido pelo varredor. */
  /* (v9.358 · a masmorra sem a cidade) MM17 C2, 06/10: 15057 -> 15083,
     +26 — a ficha, o horizonte, a cena do system e o "aqui" por tabela,
     ACIMA disto no arquivo. Só o endereço andou; re-medido pelo diff de
     App.jsx contra o HEAD, e conferido pelo varredor. */
  /* (v9.359 · a Bolsa em duas linhas) 06/10: 15083 -> 15092, +9 — a
     linha dos equipamentos e a do item da Bolsa, no PainelLateral, ACIMA
     disto no arquivo. Só o endereço andou; re-medido pelo diff de App.jsx
     contra o HEAD, e conferido pelo varredor. */
  /* (A1 · B1 · o relato sai do App) 10/10: 15092 -> 14990, -102 — o relato
     saiu para `painel-relato.jsx` (-118) e `pushMsgs` ganhou o carimbo
     `naLuta` (+11) e a mensagem do Mestre a reserva do `recibo` (+5), tudo
     ACIMA disto. Só o endereço andou; re-medido pelo diff de App.jsx
     contra o HEAD, e conferido pelo varredor. */
  /* (A1 · B2–B9 · o recibo e o fim da luta) 10/10: 14990 -> 15315, +325 —
     o recibo (as puras no topo, os refs acima de `pushMsgs`, a foto no
     envio e a espera do Cronista em `enviar`) e as frases de B8 que
     ganharam linhas, tudo ACIMA disto. Só o endereço andou; re-medido pelo
     diff de App.jsx contra a árvore de B1, e conferido pelo varredor. */
  /* (A1 · as pontas, o oficial) 10/10: 15315 -> 15407, +92 — as puras do
     fim da luta e da hora falada no topo, e o que a tela mostrou (a marca
     da porta) acima de `pushMsgs` e no envio, tudo ACIMA disto. Só o
     endereço andou; re-medido pelo diff de App.jsx contra o HEAD. */
  /* (v9.371 · a marcha única, a fiação) 10/10: 15407 -> 15408, +1 — o
     import de `partidaNaRegiao` (marcha.js) na linha 156, acima de tudo.
     Só o endereço andou. */
  /* (MM18 · a fiação da escuta e do mural, o frontend) 11/10: 15408 ->
     15481, +73 — o import de escuta.js, os refs da escuta, o rumo em
     pautaDoTurno e a escuta em enviar, tudo acima. Só o endereço andou;
     re-medido pelo diff de App.jsx contra o HEAD (7452e3a). */
  /* (nexo · as três fiações, o frontend) 11/10: 15481 -> 15505, +24 — o
     ref da conversa, a mente da ameaça, o mundo das missões e o Cronista
     (falou_com), tudo acima. Só o endereço andou; re-medido pelo diff de
     App.jsx contra o HEAD (ecc0346). */
  /* (v9.393 · a fiação da campanha que prende) 15505 -> 15581, +76: o degrau todo acima do relógio */
  /* (MM (a luta tem saída, o frontend) 11/10) 15581 -> 15622, +41: o mesmo degrau de cima do enviar, todo acima do relógio. Re-medido pelo diff contra o HEAD (e5b6736; o App.jsx é o mesmo de c3de7af). */
  /* (MM11 #5, a bolsa da frase, 11/10) 15622 -> 15654, +32: o import, o ref do veto, o preço do balcão, o veto na pauta, o meDeve e o gancho da bolsa no agirInterno, todos acima do relógio. Re-medido pelo diff contra o HEAD. */
  /* (MM11 #5, a leitura de pessoa, 11/10) 15654 -> 15655, +1: o import de leitura-de-pessoa.js. Re-medido pelo diff contra o HEAD. */
  /* (MM, o laço da história ligado, 11/10: a espinha em mundoDasMissoes e chefesDoFio, acima, +12) 15655 -> 15667. Re-medido pelo diff contra o HEAD. */
  /* (MM-C · C0, as mãos do coração, o frontend, 11/10: o alvo do golpe, o veto da luta sem painel, a ordem do ato, os fatos e o segredo no mundo das missões, o sítio do marco, o herói no registo e a frase anterior da bolsa) 15667 -> 15731, +64. Re-medido pelo diff contra o HEAD. */
  /* (MM-C · C1, o núcleo, o frontend, 11/10: o import de nucleo.js, os três refs, nucleoAgora/nucleoEmCena, a linha QUEM É na pauta e o reset do coração em iniciar, acima) 15731 -> 15788, +57. Re-medido pelo diff contra o HEAD. */
  /* (MM-C · C2, as subtramas, o frontend, 11/10: o import de subtramas.js, os quatro refs, subtramasAgora/contextoDoCoracao, a mão do vilão, QUEM CARREGA na pauta, a confirmação no envio e o coração em aplicarRetrato, acima) 15788 -> 15852, +64. Re-medido pelo diff contra o HEAD. */
  /* (MM-C · C6, a fogueira ligada, o oficial, 11/10: o import, o LimiteDaFogueira, o estado da noite e a ficha do envio em aplicarResposta, acima) 15852 -> 15882, +30. Re-medido pelo diff contra o HEAD. */
  /* (MM-C · 7.ª sessão de prova, a fiação, o frontend, 12/10: os imports, os dois refs da chegada inferida, o querPartir, o porteiro do mural, o naoParte do resolver e a chegada confirmada no turno, acima) 15882 -> 15918, +36. Re-medido pelo diff contra o HEAD. */
  /* (o Narrador só narra, E1 — a fiação, o frontend, 12/10: os imports, os dois refs dos nomes à mão, o fatorDoPouso, o preço comum em fichasDaMesa, fichasDoOraculo, a rua e os nomes em pautaDoTurno, tudo ACIMA) 15918 -> 15991, +73. Re-medido pelo diff contra o HEAD. */
  /* (o Narrador só narra, E3 — a fiação, o frontend, 12/10: o achado já na bolsa e o gênero do Cronista, ACIMA) o relógio desceu de :15991 para :16003, +12; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */
  /* (a frase que paga, 12/10: +9 em enviar, ACIMA) o relógio desceu de 16003 para 16012; só o endereço andou. */
  /* (os consertos de motor da 8.ª sessão, a fiação, o frontend, 12/10: a jornada sem destino e o destino do seguir viagem, ACIMA) o relógio desceu de 16012 para 16018, +6; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */
  /* (o Narrador só narra, E4 — a fiação, o frontend, 12/10: a guarda podarONarrador no topo de aplicarResposta, acima) o relógio desceu de :16018 para :16027, +9; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (35c92c3). */
  /* (os consertos de motor da 9.ª sessão, a fiação, o frontend, 12/10: a moeda do mundo, a cidade de contextoDoCoracao e as bancas da cena, acima) o relógio desceu de :16027 para :16039, +12; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (7419ced). */
  /* (F2a · EM CENA, a fiação, o frontend, 12/10: o import de em-cena.js e o contexto da lista antes de pautaDoTurno, acima) o relógio desceu de :16039 para :16087, +48; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (e6edf61). */
  /* (trilha A, o caminho no motor, o oficial, 29/10: o destino não reconhecido, de duas linhas, virou uma, ACIMA; o relógio desceu de :14999 para :14998, -1; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 63dda7f) */
  /* (trilha A, os recuos do gênero, o oficial, 29/10: o import de cenario.js, duas linhas, ACIMA; o relógio desceu de :14998 para :15000, +2; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD a7497e3) */
  t("e aponta a linha que avança o relógio", !!relogio && /13520/.test(relogio.porque) /* (T3, o tom da cena e o glifo do gênero, o oficial, 29/10: o climaFundo de oito linhas virou uma conta comentada, -4, e o GLIFO_DO_GENERO saiu do App para ui.jsx, -12, ACIMA (-16); só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD, à mão): 13536 -> 13520. */ /* (trilha A, a ligação do load, o oficial, 29/10: o continuar abre os dez campos por abrirOSave, -84 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 90af402, à mão): 13620 -> 13536. */ /* (trilha A, o herói novo como o load, o oficial, 29/10: o import de abrir-o-save.js, +1, e a ficha aberta e a cidade pisada no iniciar, +7, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 1d9082c, à mão): 13612 -> 13620. */ /* (trilha A, a praça do Juiz, o oficial, 29/10: o import de aPracaDoJuiz, +2, e a foto do Juiz pela praça do instante, +6, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 5e2a272, à mão): 13604 -> 13612. */ /* (trilha A, o conferente no motor, o oficial, 29/10: os 61 refs, os 18 setters e a releitura em osOrgaosAgora, +20 ACIMA, e a fé e o conferirCom em uma linha cada, -8, também ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 9e06960, à mão): 13592 -> 13604. */ /* (trilha A, o trabalho daqui no motor, o oficial, 29/10: o estado dos órgãos do depois, +23 ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD fa0a5e0, à mão): 13569 -> 13592. */ /* (trilha A, o prelúdio no motor, o oficial, 29/10: o estado e o aplicar do prelúdio, ACIMA, e o trecho de enviar da frase às bocas com os 92 nomes (funções e imports) que só ele lia, que saíram; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 374ddca, à mão): 14211 -> 13569. */ /* (trilha A, o desfecho das habilidades, o oficial, 29/10: as dez linhas de cada alvo viraram chamadas à tabela do motor, e a colheita de duas linhas virou uma, -2 ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 44a4695): 14213 -> 14211. */ /* (trilha A, o pedido no motor, o oficial, 29/10: o estado e o aplicar do pedido, +9 ACIMA, e o trecho de enviar da pauta ao system, que saiu, -263; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 78caaa9) */ /* (trilha A, a praça do instante, o oficial, 29/10: o estadoDaPauta passou a uma linha, -2 ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 895686b) */ /* (trilha A, a pauta no motor, o oficial, 29/10: a pautaDoTurno e as oito que só ela chamava saíram do App, -545 no saldo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD f281a2c) */ /* (trilha A, o glifo do gênero, o oficial, 29/10: GLIFO_DO_GENERO saiu de TelaMundo para o módulo com o comentário, +5 ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD df17ea4) */ /* (T2-A, o golpe no corpo no motor, o oficial, 28/10: as duas portas viraram uma linha cada, -49 no saldo ACIMA ou entre; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 5917ac8, à mão): 15013 -> 14999. */ /* (trilha A, T2-A, a abertura no motor, o oficial, 28/10: o pedido da abertura antiga saiu do App, −12 linhas ACIMA; −8 no saldo destas; só o endereço andou) */); /* (trilha A, T2-A, o rodapé no motor, o oficial, 28/10: +1 import no topo e −1 linha no rodapé; re-medido pelo diff contra 2137ae7) */ /* (trilha A, o tempo do turno no motor, o oficial, 28/10: o relógio e o passo na cidade saíram para src/motor/tempo-do-turno.js, −28 linhas acima; re-medido pelo diff contra 7a0d8b2) */ /* (trilha A, o Juiz que corrige, o oficial, 28/10: o import de motor/correcao-do-juiz.js e os refs do veredito e do livro de vetos, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 49cbd29): 15018 -> 15050. */ /* (T1-A 9.ª fatia, o oficial, 28/10: o gatilho, o pedido e o aceito do Cronista foram para motor/cronista-do-turno.js, e o import dele, ACIMA ou dentro; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 760fe1b): 15286 -> 15018. */ /* (T1-A 8.ª fatia, 2, o oficial, 28/10: o turno do mundo, o sino, o chão e a escuta foram para motor/antes-do-mestre.js, e o import dele, +2 no saldo; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD aac1912) — e a linha do avanço mudou de sítio, para dentro do `if (doMundo.anda)`, o que o remedir não segue (à mão): 15276 -> 15286. */ /* (T1-A 8.ª fatia, 1, o oficial, 28/10: a nêmesis, os vistos, o trabalho, a queda e a entrega saíram do aplicarResposta para motor/entrega-do-turno.js, -83 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD a9ef8cf): 15338 -> 15276. */ /* (a sessão cede ao save, o orquestrador, 28/10: +3 em salvar, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 110b959): 15335 -> 15338. */ /* (T1-A 7.ª fatia, 1, o oficial, 28/10: a mesa e o fôlego saíram do aplicarResposta para motor/fecho-da-resposta.js, e nove imports sem leitor, -11 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD cbb7134): 15346 -> 15335. */ /* (T1-A 7.ª fatia, 2, o oficial, 28/10: a sessão como arquivo — os imports e os refs da sessão, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD c866d6a): 15288 -> 15346. */ /* (T1-A 7.ª fatia, defeito, o oficial, 28/10: as linhas da emboscada vão à tela, +5 no aplicarResposta, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD cfcd8b8): 15283 -> 15288. */ /* (T1-A 7.ª fatia, 1, o oficial, 28/10: o perigo e a quase-morte saíram do aplicarResposta para motor/fecho-da-resposta.js, e o import dele, +1, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 3ec3364): 15316 -> 15283. */ /* (T1-A 3.ª fatia, 5, o oficial, 28/10: a frase do grupo cheio pela régua do motor, +1 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD aeeabdc) */ /* (T1-A 3.ª fatia, 3, o oficial, 28/10: o turno fundido — uma chamada a aplicarOTurno no lugar das seis peças — e a base do nome com o estado de agora, -59 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 48579a9) */ /* (T1-A 3.ª fatia, 2, o oficial, 28/10: as missões, os sinais, a fé, o milagre e as dádivas saíram do App para motor/meio-do-turno.js, -241 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD bd9e60f) */ /* (T1-A 3.ª fatia, 1, o oficial, 28/10: o registrarLugar e o bloco do mapa saíram do App para motor/meio-do-turno.js, -119 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD d776408) */ /* (T1-A 2.ª fatia, 3, o oficial, 27/10: o d20 da salvaguarda pela sorte do turno, +3 no comentário do aplicarResposta e +4 na frase do grupo cheio do Cronista, +7, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 2fdb7e4): :16212 -> :16219. */ /* (T1-A 2.ª fatia, 2, o oficial, 27/10: o cânone e a gente saíram do aplicarResposta para motor/aplicar.js#aplicarORegisto, -56 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD e9c0851): :16268 -> :16212. */ /* (T1-A 2.ª fatia, o oficial, 27/10: o juízo do Cronista, -4 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 4617715): :16272 -> :16268. */ /* (T0-A 3/3, o oficial, 27/10: o comentário do relógio que lê do estado, +2, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra a cópia de antes da etapa): o relógio desceu de :16500 para :16502, +2. */ /* (T0-A 2/3, o oficial, 27/10: o gancho useVistaDoEstado fora do componente e o estadoRef no topo de Taverna(), +24, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra a cópia de antes da etapa): o relógio desceu de :16476 para :16500, +24. */ /* (T0-A, o oficial, 27/10: o import de estado.js, +2, o lerSave fora do componente, +9, a versão no retrato e o v2 na gravação, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra a cópia de antes da etapa): o relógio desceu de :16458 para :16476, +18. */ /* (a 12.ª sessão no motor, o backend, 19/10: o custo das tentativas falhadas em chamarModelo, +4, o mostrado do rumo, +2, e o veto da viagem que não houve, +7, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 806ef83): 16445 -> 16458, +13 */ /* (onda 2 do custo, o frontend, 14/10: os sinais do turno, o fixo da ficha, o estado épico e as portas em cenaDoPrompt, ACIMA) 16373 -> 16445, +72; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (2b9e82b). */ /* (v9.470, onda 1 do custo, o frontend, 13/10: o ref e o gatilho do Cronista e a memória do turno, ACIMA) 16329 -> 16373, +44; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (4b72a82). */ /* (v9.465, o frontend, 13/10: o pedido na ordem do cache em chamarMestre, ACIMA) 16321 -> 16329, +8; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (842adc7). */ /* (v9.463, o oficial, 13/10: o apontado da agressão e a planta pelo lugar, ACIMA) 16315 -> 16321, +6; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (d299d6c). */ /* (v9.461 ligada, o oficial, 13/10: elencoDoCoracao e cidadeDoCoracao, +13, o QUEM É, e a espinha e os sítios do EM CENA, +5, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 69ad49f): 16296 -> 16315, +19. */ /* (S10b · a abertura por situação e o kit inicial, o oficial, 13/10: o import de kit-inicial.js, +2, a criação, +3, e equiparCombate/montarGrid, +10, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 341e2cd): 16281 -> 16296, +15. */ /* (a 10.ª sessão ligada, o oficial, 13/10: o sinal da procura de gente, +6, o longe do EM CENA, +4, e o objeto do teste em ctxDesafio, ACIMA ou entre estes; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD cc0770a): 16254 -> 16281, +27. */ /* (os pendentes ligados, o oficial, 13/10: o import de chegadaDaViagem, +1, e a reserva do LimiteDasFichas, +3, ACIMA; o contexto do paradeiro no Cronista, +6, também acima destes): 16244 -> 16254, +10. */ /* (MM17 · o mapa vivo ligado, o oficial, 12/10: os imports de mapa-vivo.js e painel-mapa-vivo.jsx, o LimiteDoMapa e a aba Mapa que abre o mapa vivo, tudo ACIMA) 16219 -> 16244, +25; só o endereço andou, re-medido pelo diff contra o HEAD (f058d3a). */ /* (F2b · F2c · F2d, a fiação, o oficial, 12/10: os imports de fichas.js e painel-fichas.jsx, o LimiteDasFichas e a altura da janela, o estado das fichas ao lado de entrada, o ref da memória, e as fichas da cena antes de pautaDoTurno, tudo ACIMA) 16087 -> 16219, +132; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (7a890f3). */
}

sec("5. a abertura fora de alcance — o achado central");
{
  const F = ABERTURA_FORA_DE_ALCANCE;
  t("as 10 plantas estão medidas", F.aberturaPorPlanta.length === 10);
  t("e 10 de 10 recusam o golpe no turno 1", F.plantasQueRecusamNoTurno1 === 10 && F.plantasTotais === 10);
  t("nenhuma planta declarada abre com corpo a corpo válido",
    F.aberturaPorPlanta.every((p) => p.corpoACorpoOk === false));
  t("a menor abertura ainda é muito maior que o alcance do golpe",
    Math.min(...F.aberturaPorPlanta.map((p) => p.metros)) > F.alcanceCorpoACorpo * 4);

  /* e agora a medição de verdade, contra o grid: a tabela não pode
     declarar uma geometria que o módulo não produz mais */
  let recusaram = 0;
  for (const p of F.aberturaPorPlanta) {
    const grade = G.montarGrade(p.planta === "masmorra" ? { emMasmorra: true } : { local: p.planta });
    const pos = G.posicionar(grade, { heroi: { nome: "Bram" }, grupo: [], inimigos: [{ nome: "X", vida: 9 }] });
    const d = G.distanciaM(pos.heroi, pos.inimigos[0]);
    const ok = G.alcanca(grade, pos.heroi, pos.inimigos[0], { alcanceM: G.alcanceNatural(pos.heroi) }).ok;
    if (!ok) recusaram++;
    t(`  ${p.planta}: abertura de ${p.metros} m confere`, Math.abs(d - p.metros) < 0.01, `medido ${d}`);
  }
  t("o grid confirma: 10 de 10 recusam", recusaram === 10, `recusaram=${recusaram}`);

  /* O REFINAMENTO: nem a arma de longe resolve. Com 36 m a distância
     deixa de pesar, mas a PAREDE continua — e é `alcanca` inteiro, não
     só a distância, que decide. X2 precisa disto para não prometer um
     botão de tiro que três plantas em dez recusam na abertura. */
  let recusamAte36 = 0;
  for (const p of F.aberturaPorPlanta) {
    const grade = G.montarGrade(p.planta === "masmorra" ? { emMasmorra: true } : { local: p.planta });
    const pos = G.posicionar(grade, { heroi: { nome: "Bram" }, grupo: [], inimigos: [{ nome: "X", vida: 9 }] });
    const ok = G.alcanca(grade, pos.heroi, pos.inimigos[0], { alcanceM: F.alcanceDeArmaLonge }).ok;
    if (!ok) recusamAte36++;
    t(`  ${p.planta}: a 36 m ${p.aLonge36mOk ? "acerta" : "ainda recusa"}`, ok === p.aLonge36mOk);
  }
  t("três plantas recusam mesmo a 36 m, por parede",
    recusamAte36 === F.plantasQueRecusamAte36m && recusamAte36 === 3, `medido ${recusamAte36}`);

  /* a armadilha que custou tempo às duas mentes: sem esta nota, X4 mede
     16,5 m onde são 25,5 m e não recebe aviso nenhum */
  t("a armadilha da grade está escrita para X4", /cai em `estrada` sem avisar/.test(TURNO_ESTERIL.armadilhaDaGrade.o));
  t("e diz como evitar", /conferir largura×altura/.test(TURNO_ESTERIL.armadilhaDaGrade.comoEvitar));
  /* e a prova de que a armadilha é real, não folclore */
  t("de fato montarGrade({planta}) cai em estrada",
    G.garantirGrade(G.montarGrade({ planta: "masmorra" })).altura === 12);
  t("e {emMasmorra:true} dá a masmorra de verdade",
    G.garantirGrade(G.montarGrade({ emMasmorra: true })).altura === 18);

  /* a recusa é de graça — e é isso que congela os PV do inimigo também */
  t("a recusa sai antes de gastar a ação", /if \(ataque && ataque\.semAlcance\) \{/.test(APP));
  t("e o porquê de não gastar está registrado na tabela",
    /nunca roda/.test(F.recusaDeGraca.logo));
  t("o par de suítes que nunca foi composto está citado",
    F.parQueNuncaFoiComposto.length === 2
    && F.parQueNuncaFoiComposto.some((x) => /teste-grid\.mjs:198/.test(x))
    && F.parQueNuncaFoiComposto.some((x) => /teste-alcance-e-achado\.mjs:45/.test(x)));
}

sec("6. as duas travas do ataque por texto");
{
  /* fora de combate: o alvo precisa estar no elenco, e nome próprio é o
     único jeito de entrar nele */
  const elenco = [{ nome: "Rufino", papel: "guarda", relacao: "neutro" }];
  const semAlvo = A.lerAgressao("Ataco o bandido", { presentes: elenco, grupo: [], emCombate: false });
  const comAlvo = A.lerAgressao("Ataco Rufino", { presentes: elenco, grupo: [], emCombate: false });
  t("alvo não registrado morre em semAlvoConhecido", semAlvo && semAlvo.tipo === "semAlvoConhecido");
  t("alvo registrado abre o combate", comAlvo && comAlvo.tipo === "agressao");
  /* e mesmo o que abre NÃO rola dado de ataque: abre a luta e devolve a vez */
  t("mas abrir a luta não é rolar um golpe", !("dano" in (comAlvo || {})));

  /* dentro de combate: a porta fecha, por desenho */
  t("dentro da luta lerAgressao se cala",
    A.lerAgressao("Ataco Rufino", { presentes: elenco, grupo: [], emCombate: true }) === null);
  const porta = T.PORTAS_DO_TURNO.find((p) => p.id === "agressao");
  t("porque a porta `agressao` exige estar fora de combate", porta.quando({ ehAgressao: true, emCombate: true }) === false);
  t("e abre fora dele", porta.quando({ ehAgressao: true, emCombate: false }) === true);
}

sec("7. os seis literais do painel que não casam leitor nenhum");
{
  /* medido contra o catálogo real: `lerAcao` é o mesmo leitor que o
     adjudicador usa (src/App.jsx:16138 → veredictoDaAcao — MM3b,
     frontend, 29/09: re-medido por busca direta no arquivo, não por soma
     de delta, porque a referência já vinha desatualizada de antes desta
     etapa; MM8c-1, frontend, 29/09: 17762 -> 17782, +20 — o mesmo delta
     desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE, re-medido por
     busca direta; MM8c-2, frontend, 30/09: 17782 -> 17788, +6, depois
     17788 -> 17798, +10 (o cache por identidade, elencoCacheRef) — o mesmo
     delta desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE; MM9,
     frontend, 30/09: 17798 -> 17856, +58 — a palavra dobra o bando
     (dentro de `concluirRolagem`, ANTES deste ponto) somou 28 linhas ao
     mesmo delta já acumulado de FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE;
     MM10, frontend, 30/09: 17856 -> 17994, re-medido por busca direta —
     a referência já não seguia o delta uniforme de FUNIL_DO_COMBATE/
     RECUSAS_DO_COMBATE antes desta etapa (era uma prova solta, não uma
     asserção), e o crime some +18 igual às outras duas tabelas) */
  const ctx = { personagem: { nivel: 3, atributos: {}, pericias: {} }, semente: "x1", lugar: "taverna",
    emCombate: false, tentativas: {}, dia: 1, pessoaDe: () => null, fama: 0,
    ehPessoaConhecida: () => false, achadoDe: () => null };
  const semLeitor = [];
  for (const a of ACOES_DO_JOGADOR.filter((x) => x.fonte === "ACOES_PRONTAS")) {
    const txt = a.texto.endsWith(" ") ? a.texto + "o bandido" : a.texto;
    const v = (() => { try { const r = D.lerAcao(txt, ctx); return (!r || (r.tipo === "livre" && !r.chave)) ? null : r; } catch { return null; } })();
    if (!v && !A.ehDeclaracaoDeAtaque(txt)) semLeitor.push(a.rotulo);
  }
  t("são seis", semLeitor.length === 6, semLeitor.join());
  t("e são Esquivar, Empurrar, Derrubar, Correr, Ajudar e Enganar",
    semLeitor.sort().join() === ["Ajudar", "Correr", "Derrubar", "Empurrar", "Enganar", "Esquivar"].join(),
    semLeitor.join());
  /* Das 12 prontas, SEIS são de combate e todas as seis viram frase
     QUANDO DIGITADAS: as cinco sem leitor nenhum (Esquivar, Empurrar,
     Derrubar, Correr, Ajudar) mais `Atacar`, que tem leitor e morre no
     alcance. Era o coração do achado de X1 — o painel de combate inteiro
     era prosa.

     A ASSERÇÃO NÃO MUDA, e é de propósito: ela mede o eixo do TEXTO, e o
     caminho do teclado não foi tocado em X2. O que mudou é o eixo do
     CLIQUE, e quem o mede é o bloco 1. Ler esta linha como "o painel
     ainda é todo prosa" seria ler a régua errada: o clique de `Atacar`
     deixou de ser prosa, a frase digitada dele não. */
  const deCombate = ACOES_DO_JOGADOR.filter((x) => x.fonte === "ACOES_PRONTAS" && x.combate && x.textoLuta === "cena");
  t("as seis prontas de combate viram frase, sem exceção", deCombate.length === 6, String(deCombate.length));
}

sec("8. o motor que nenhum clique chama");
{
  const M = MOTOR_SEM_CHAMADOR;
  /* o achado duro: um export sem NENHUM leitor, que passa pela catraca
     porque a catraca conta o import como leitor */
  t("gastarRecurso está registrado como morto", M.morto.some((x) => x.nome === "gastarRecurso"));
  t("e o lugar dele está anotado", M.morto.some((x) => /combate\.js:745/.test(x.onde)));
  t("de fato o App importa gastarRecurso", /\bgastarRecurso\b/.test(APP));
  t("e nunca o chama", !/\bgastarRecurso\s*\(/.test(APP));
  /* combate.recursos: escrito toda luta, nunca consumido */
  t("combate.recursos consta como escrito e nunca lido",
    M.escritoENuncaLido.some((x) => x.campo === "combate.recursos"));
  /* (movido, T1-A 6.ª fatia: o literal `recursos: novosRecursos()` saiu do
     App com a abertura da luta, para `abrirOCombate` no motor, que esta
     suíte não lê como texto. A intenção — a luta aberta escreve os
     recursos, e ninguém os lê — passa a ser jogada na peça.) */
  t("e a abertura da luta de fato escreve recursos", (() => {
    const r = ABRIR.abrirOCombate({ inimigosCrus: [{ nome: "Lobo", ameaca: "comum" }], pers: { nome: "Vera", nivel: 2, atributos: {} }, planta: { local: "estrada" }, sementeDaAbertura: "prova|abertura|0" }, {});
    return r.abriu && JSON.stringify(r.combateNoRef.recursos) === JSON.stringify(COMBATE.novosRecursos());
  })());

  /* as três categorias existem separadas, e é essa separação que
     corrige o mapa que chegou: "sem chamador" misturava coisas
     diferentes, e só uma delas é dívida */
  t("as três categorias estão separadas",
    !!M.semClique && !!M.soInterno && !!M.morto);
  t("semClique de combate.js tem os 3 medidos",
    M.semClique["combate.js"].length === 3);
  t("e nenhum deles é chamado no App",
    M.semClique["combate.js"].every((n) => !new RegExp(`\\b${n}\\s*\\(`).test(APP)));
  /* maiorVaoSemGanho chegou no mapa como "sem chamador" e TEM leitor:
     fica fora das três listas de propósito, e este teste guarda o motivo */
  const todas = [...M.semClique["combate.js"], ...M.soInterno["combate.js"], ...M.morto.map((x) => x.nome)];
  t("maiorVaoSemGanho não é declarado sem chamador (tem leitor em teste-onda3)",
    !todas.includes("maiorVaoSemGanho"));
}

/* ============================================================
   9. O EIXO DA FRASE (X4) — o funil, e quem nele diz não

   O QUE ESTE BLOCO GUARDA. X3b escreveu em prosa "treze funções chamam
   `pushMsgs` dentro do combate" e "15 formas de recusa". Nenhum dos dois
   se reproduz: eram 14 funções (11 provadamente mudas fora da luta) e 18
   chamadas de recusa em 25 formas. A tabela guarda os números medidos,
   este bloco os afirma, e `check-acoes-do-jogador.mjs` re-deriva do
   `App.jsx` os endereços — é o mesmo tripé de X1.

   NENHUMA ASSERÇÃO ANTERIOR FOI MOVIDA AQUI. O eixo do número (blocos 3
   e 4) fica onde estava e continua dando 7/7: X4 é medição, e a política
   da sessão A não foi tocada.

   O GOLPE FINAL SOMA UMA FUNÇÃO AO FUNIL (frontend, 29/09, MM3). Ligar o
   golpe final (Q3+Q5) partiu `aplicarGolpeDoJogador` em três — ela mesma
   (que só perdeu 1 das suas 3 `linhas`, a que aplicava o dano), a nova
   `continuarGolpeDoJogador` (que herdou exatamente essa linha, com a
   mesma voz e o mesmo `nasce`) e `responderGolpeFinal` (sem `pushMsgs`,
   por isso fora do funil). São 14 funções antes, 15 depois; o núcleo
   (nucleo) sobe de 11 para 12 porque a nova função é núcleo por CADEIA DE
   CHAMADA, como o comentário dela em FUNIL_DO_COMBATE explica — a borda
   (3) e o total de 57 `pushMsgs` não mudam, porque a linha só trocou de
   função, não nasceu nem sumiu. */
sec("9. o funil do combate — quem chama pushMsgs, e com que voz");
{
  const f = contarFunil();
  t("o funil tem 15 funções", f.funcoes === 15, String(f.funcoes));
  t("e 12 delas são provadamente mudas fora da luta", f.porAnel.nucleo === 12, String(f.porAnel.nucleo));
  t("as outras 3 são de borda — falam dentro e fora", f.porAnel.borda === 3, String(f.porAnel.borda));
  /* MM7 (frontend, 29/09): +1 — o golpe de oportunidade de quem recua para
     disparar (`m.provoca`, grid.js) ganhou a própria linha de chat dentro
     de `resolverRevide`, ao lado da de quem foge. Re-medido pelo próprio
     `check-acoes-do-jogador.mjs`, que re-deriva a contagem do código. */
  /* A MASMORRA QUE SE ACABA (v9.348, 05/10): +1 — `fecharSeTodosCairam`
     ganhou o pushMsgs do chefe que cai (a masmorra se conclui por código,
     `concluirMasmorraDoChefe`), telegrama puro que nasce no App. Uma chamada
     nova e classificada na tabela, não um afrouxamento: 59 -> 60. */
  /* (T1-A 6.ª fatia, o oficial, 28/10): 60 -> 57 — as quatro chamadas de
     `limparConjuracoesDaLuta` (a forma, a guarda do herói, a do grupo, a
     pressa) viraram uma, num laço sobre as telas que a peça pura
     `limparAsConjuracoes` devolve. As mesmas quatro vozes, a mesma ordem;
     a boca no App ficou uma só. */
  t("são 57 chamadas de pushMsgs no funil", f.linhas === 57, String(f.linhas));
  /* a soma tem de fechar: uma linha sem voz declarada some da conta em
     silêncio, e é exatamente assim que uma régua passa a mentir */
  t("e toda chamada tem uma voz declarada",
    f.voz.frase + f.voz.telegrama + f.voz.recusa === f.linhas,
    JSON.stringify(f.voz));

  /* O CORAÇÃO DE X3b: frase de mesa e telegrama não são a mesma coisa, e
     contá-los juntos apagaria a única distinção que a etapa deixou. */
  t("frase de mesa e telegrama estão separados e ambos existem",
    f.voz.frase > 0 && f.voz.telegrama > 0, JSON.stringify(f.voz));
  t("o telegrama do golpe do jogador está declarado como telegrama",
    /* MM3 (frontend, 29/09): esta asserção apontava para `aplicarGolpe-
       DoJogador`, e passa a apontar para `continuarGolpeDoJogador` — não
       porque a régua afrouxou, mas porque a LINHA mudou de função: é a
       mesma divisão em três descrita no cabeçalho do bloco. A voz
       (`telegrama`) e o conteúdo da linha (dano, PV, aflição da arma) são
       exatamente os de sempre; só o corpo que a chama tem nome novo. O
       histórico de deslocamentos anterior (K3, K4, E3, R15, R17, R21, R22)
       rastreava esta MESMA linha dentro de `aplicarGolpeDoJogador`, onde
       ela não mora mais — por isso sai daqui: continuar a acumulá-lo sob
       um `fn` que já não é o dela confundiria o próximo re-medidor.
       Mesmo dia, segunda medição: 12804 -> 12806, +2 (as duas linhas de
       depuração do próprio MM3 dentro de `aplicarGolpeDoJogador`, acima —
       ver a nota do relógio de 45 min, bloco 4).
       Mesmo dia, terceira medição: 12806 -> 12804, -2 (as 4 linhas de
       debug que chegaram a existir foram removidas ao fim do diagnóstico
       — mesma nota do bloco 4).
       A peneira da agressão (frontend, MM, 29/09): 12804 -> 12818, +14 —
       o mesmo degrau que `aplicarGolpeDoJogador` leva no cabeçalho de
       FUNIL_DO_COMBATE (a peneira em `resolverAtaqueJogador`, acima desta
       função no arquivo).
       O escondido entra na fiação (frontend, MM6, 29/09): 12818 -> 12876,
       +58 — o mesmo degrau que `continuarGolpeDoJogador` leva no
       cabeçalho de FUNIL_DO_COMBATE.
       O golpe final é do grupo (frontend, 29/09, MM3b): 12876 -> 12883,
       +7 — o estado novo do cartão do grupo (`golpeFinalCompPendente`/
       `golpeFinalCompCtxRef`) nasce perto do estado do cartão do jogador,
       ANTES de `aplicarGolpeDoJogador` no arquivo, e empurra tudo abaixo
       — o mesmo degrau que `aplicarGolpeDoJogador`/`continuarGolpeDoJogador`
       levam no cabeçalho de FUNIL_DO_COMBATE nesta etapa.
       A gente por dentro (frontend, MM8a, 29/09): 12897 -> 12914, +17 — o
       mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE (a
       fiação de `genteParaPauta` em `pautaDoTurno`, acima no arquivo).
       Os tetos das pessoas (frontend, MM8c-1, 29/09): 12914 -> 12934, +20 —
       o mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE (a
       recência do registo de NPCs, acima no arquivo).
       O mundo puxa o herói (frontend, MM13, 30/09): 12934 -> 13008, +74 —
       o mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
       A fiação do primeiro dia (frontend, MM13b, 30/09): 13008 -> 13019,
       +11 — `ondeSeProcura`/`achavelAqui` e o débito de cobranca.js
       entraram acima, dentro de `aplicarResposta`.
       A gente que pesa (frontend, MM8c-2, 30/09): 13019 -> 13025, +6 —
       o mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
       A gente que pesa, medida e cacheada (frontend, MM8c-2, 30/09):
       13025 -> 13035, +10 — o mesmo degrau desta etapa em
       FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE (o cache por identidade,
       elencoCacheRef).
       A promoção (frontend, MM8e, 30/09): 13035 -> 13038, +3 — o mesmo
       degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
       A luta sem espada (frontend, MM9, 30/09): 13038 -> 13054, +16 — a
       rodada que impressiona (dentro desta própria função, ANTES desta
       linha) somou 4 linhas ao mesmo degrau já acumulado de
       FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
       O crime (frontend, MM10, 30/09): 13054 -> 13072, +18 — o mesmo
       degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
       As perguntas ao Mestre (frontend, MM14, 30/09): 13072 -> 13093, +21 —
       o mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
       Os dois canais antigos (frontend, MM14, 30/09): 13093 -> 13068, -25
       — o mesmo líquido desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE
       (a migração das tarefas antigas soma menos do que a remoção dos
       dois canais tira). Re-medido pelo diff de App.jsx contra HEAD.
       A gente no lugar certo, com o nome certo (frontend, MM14 · 9b/10a,
       30/09): 13068 -> 13124, +56 — o mesmo delta desta etapa em
       FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE. Re-medido pelo diff de App.jsx
       contra HEAD.
       A extração de fichasDaMesa (frontend, MM14 · o resto do nº 6,
       30/09): 13124 -> 13142, +18 — o mesmo delta desta etapa em
       FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE. Re-medido por
       check-acoes-do-jogador.mjs.
       O lugar pelo Cronista (frontend, MM15 (1), 30/09): 13142 -> 13147,
       +5 — o mesmo delta desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
       Re-medido por check-acoes-do-jogador.mjs.
       As falas pagas e deitadas fora (frontend, MM15 (2), 30/09): 13147 ->
       13149, +2 — o mesmo delta desta etapa em FUNIL_DO_COMBATE/
       RECUSAS_DO_COMBATE (colherAsFalas trocou o `.slice` por
       `bocasDoTurno` mais uma saída antecipada). Re-medido por
       check-acoes-do-jogador.mjs.
       A ligação não é o Mestre (frontend, MM15 (3), 30/09): 13149 ->
       13311, +162 — o mesmo delta de `aplicarGolpeDoJogador` nesta etapa
       (a foto do turno nasce ACIMA dela no arquivo). Re-medido por
       check-acoes-do-jogador.mjs.
       O segredo guardado (frontend, MM15 (4), 30/09): 13311 -> 13332,
       +21 — o mesmo delta de `aplicarGolpeDoJogador` nesta etapa. Re-medido
       por check-acoes-do-jogador.mjs.
       Os nomes que se fundem (frontend, MM15 (5), 30/09): 13332 -> 13336,
       +4 — o mesmo delta uniforme do cabeçalho de FUNIL_DO_COMBATE nesta
       etapa (`contextoDoNome` ganha `conhecidos`/`recentes` ACIMA dela no
       arquivo). Re-medido por check-acoes-do-jogador.mjs.
       O companheiro de antes (frontend, 01/10): 13336 -> 13361, +25 — o
       mesmo delta de `aplicarGolpeDoJogador` nesta etapa (a fiação do
       companheiro nasce dentro de `iniciar`, ACIMA dela no arquivo).
       Re-medido por check-acoes-do-jogador.mjs.
       A masmorra que se acaba (v9.348, 05/10): 13361 -> 13349, -12 — o bloco
       do chefe encolheu 12 linhas ACIMA de `continuarGolpeDoJogador` (virou
       `concluirMasmorraDoChefe`, mais abaixo). Mesma linha, mesma voz;
       só o endereço andou. */
    /* (v9.350 · o como chega) 13349 -> 13362, +13: a fiação de `pautaDoTurno`
       cresceu ACIMA. Mesma linha, mesma voz. */
    FUNIL_DO_COMBATE.find((x) => x.fn === "continuarGolpeDoJogador")
    /* (v9.353 · esconder-se na luta) 13423 -> 13428, +5 —
     o rodapé de `enviar` passou a ler a ficha do turno (+5), ACIMA disto no
     arquivo. Só o endereço andou; re-medido pelo diff de App.jsx contra o
     HEAD, e conferido pelo varredor. */
    /* (v9.354 · a luz e a sombra) 13428 -> 13457, +29 — o import de luz.js
     (+1), o mapa de luz junto de `fichaViva` (+23) e a seção A LUZ em
     `pautaDoTurno` (+5), ACIMA disto no arquivo. Só o endereço andou;
     re-medido pelo diff de App.jsx contra o HEAD, e conferido pelo varredor. */
    /* (v9.356 · a região na criação) 13457 -> 13477, +20 — o
     import de regiao.js (+1) e a escolha região ou continente em `iniciar`
     (+19 líquidos), ACIMA disto no arquivo. Só o endereço andou; re-medido
     pelo diff de App.jsx contra o HEAD, e conferido pelo varredor. */
    /* (v9.357 · a história amarrada à região) MM17 C1: 13477 -> 13486, +9 —
     a espinha amarrada à região depois de `estenderEspinha`, em `iniciar`,
     ACIMA disto no arquivo. Só o endereço andou; re-medido pelo diff de
     App.jsx contra o HEAD, e conferido pelo varredor. */
    /* (v9.358 · a masmorra sem a cidade) MM17 C2: 13486 -> 13512, +26 — a
     ficha, o horizonte, a cena do system e o "aqui" por tabela, ACIMA disto
     no arquivo. Só o endereço andou; re-medido pelo diff de App.jsx contra
     o HEAD, e conferido pelo varredor. */
    /* (v9.359 · a Bolsa em duas linhas) 06/10: 13512 -> 13521, +9 — a
       linha dos equipamentos e a do item da Bolsa, no PainelLateral, ACIMA
       disto no arquivo. Só o endereço andou; re-medido pelo diff de App.jsx
       contra o HEAD, e conferido pelo varredor. */
      .linhas.find((l) => l.onde === "src/App.jsx:11875" /* (T1-A 3.ª fatia, 5, o oficial, 28/10: a frase do grupo cheio pela régua do motor, +1 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD aeeabdc) */ /* (T1-A 3.ª fatia, 3, o oficial, 28/10: o turno fundido — uma chamada a aplicarOTurno no lugar das seis peças — e a base do nome com o estado de agora, -59 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 48579a9) */ /* (T1-A 3.ª fatia, 2, o oficial, 28/10: as missões, os sinais, a fé, o milagre e as dádivas saíram do App para motor/meio-do-turno.js, -241 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD bd9e60f) */ /* (T1-A 3.ª fatia, 1, o oficial, 28/10: o registrarLugar e o bloco do mapa saíram do App para motor/meio-do-turno.js, -119 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD d776408) */ /* (onda 2 do custo, o frontend, 14/10: os sinais do turno, o fixo da ficha, o estado épico e as portas em cenaDoPrompt, ACIMA) 14736 -> 14808, +72; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (2b9e82b). */ /* (v9.463, o oficial, 13/10: o apontado da agressão e a planta pelo lugar, ACIMA) 14678 -> 14684, +6; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (d299d6c). */ /* (v9.461 ligada, o oficial, 13/10: elencoDoCoracao e cidadeDoCoracao, +13, o QUEM É, e a espinha e os sítios do EM CENA, +5, tudo ACIMA) 14659 -> 14678, +19; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (69ad49f). */ /* (F2b · F2c · F2d, a fiação, o oficial, 12/10: os imports de fichas.js e painel-fichas.jsx, o LimiteDasFichas e a altura da janela, o estado das fichas ao lado de entrada, o ref da memória, e as fichas da cena antes de pautaDoTurno, tudo ACIMA) 14479 -> 14605, +126; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (7a890f3). */ /* (F2a · EM CENA, a fiação, o frontend, 12/10: o import de em-cena.js e o contexto da lista antes de pautaDoTurno, acima) 14431 -> 14479, +48; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (e6edf61). */ /* (os consertos de motor da 9.ª sessão, a fiação, o frontend, 12/10: a moeda do mundo, a cidade de contextoDoCoracao e as bancas da cena, acima) 14419 -> 14431, +12; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (7419ced). */ /* (o Narrador só narra, E4 — a fiação, o frontend, 12/10: a guarda podarONarrador no topo de aplicarResposta, acima) 14410 -> 14419, +9; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */ /* (os consertos de motor da 8.ª sessão, a fiação, 12/10: a jornada sem destino em talvezChegarSozinho, acima) 14407 -> 14410, +3; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */ /* (a frase que paga, 12/10: a frase do jogador e a moeda do mundo para a bolsa, em enviar, acima) 14398 -> 14407, +9; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */ /* (o Narrador só narra, E3 — a fiação, o frontend, 12/10: o achado já na bolsa na cobrança e o gênero do Cronista, acima) 14386 -> 14398, +12; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */ /* (MM-C · C1, o núcleo, o frontend, 11/10: o import de nucleo.js, os três refs, nucleoAgora/nucleoEmCena e a linha QUEM É em pautaDoTurno, acima) 14141 -> 14198, +57; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */).voz === "telegrama"); /* (A1 · as pontas) 13741 -> 13833, +92: o mesmo degrau do relógio, todo acima. (v9.371 · a marcha única, a fiação) 13833 -> 13834, +1: o import de marcha.js no topo. (MM18 · a fiação da escuta) 13834 -> 13907, +73: o import, os refs, o rumo e a escuta em enviar, todos acima. (nexo · as três fiações, o frontend) 11/10: 13907 -> 13931, +24: o ref da conversa e o Cronista, acima; re-medido pelo diff. */ /* (v9.393 · a fiação da campanha que prende) 13931 -> 14007, +76: o degrau todo acima */ /* (MM · a luta tem saída, o frontend) 11/10: 14007 -> 14048, +41: o mesmo degrau, todo acima. */
  /* MM7: +1 — o golpe de oportunidade do recuo (ao lado do da fuga). */
  t("a maior boca do funil é `resolverRevide`, com 31 chamadas",
    FUNIL_DO_COMBATE.find((x) => x.fn === "resolverRevide").linhas.length === 31);
  t("toda função do funil declara anel, endereço e ao menos uma linha",
    FUNIL_DO_COMBATE.every((x) => /^src\/App\.jsx:\d+$/.test(x.onde)
      && (x.anel === "nucleo" || x.anel === "borda") && x.linhas.length > 0));
  t("e toda linha declara onde sai, o evento e onde a frase nasce",
    FUNIL_DO_COMBATE.every((x) => x.linhas.every((l) =>
      /^src\/App\.jsx:\d+$/.test(l.onde) && l.evento && l.nasce)));

  /* a coluna `nasce` é a que diz quanto da voz já é testável em Node */
  const n = vozQueNasceNoModulo();
  /* (T1-A 6.ª fatia): 23 -> 20 — as quatro linhas do fim da luta que nasciam
     em habilidades.js são agora uma (veja o bloco 9 acima); continuam fora do React */
  t("parte da voz do combate já nasce fora do React", n.doModulo === 20, String(n.doModulo));
  /* MM7: +1 — a linha nova nasce em src/App.jsx (o mesmo golpe de
     oportunidade de `querFugir`, sem módulo próprio). */
  /* v9.348: +1 — a linha nova do chefe que cai também nasce em src/App.jsx
     (as frases são de `concluirMasmorraDoChefe`, dentro do App). 36 -> 37. */
  t("e a maior parte ainda só existe no App.jsx", n.doApp === 37 && n.doApp > n.doModulo, String(n.doApp));
}

sec("10. as recusas, contadas à parte — a correção de escopo de X3b");
{
  const r = contarRecusas();
  t("são 18 chamadas de recusa no caminho de combate", r.chamadas === 18, String(r.chamadas));
  t("e 25 formas distintas (uma chamada pode imprimir várias)", r.formas === 25, String(r.formas));
  t("em sete famílias, não cinco", r.familias === 7, String(r.familias));
  const fam = recusasPorFamilia();
  for (const nome of ["alcance", "economia", "teto", "repeticao", "turno-guardado"]) {
    t(`  a família \`${nome}\` que a pauta nomeia está medida`, !!fam[nome] && fam[nome].chamadas > 0);
  }
  t("  e as duas que a pauta NÃO nomeia também", !!fam.conjuracao && !!fam.condicao);
  t("alcance é a maior família, como a Fase X toda previa",
    fam.alcance.formas === Math.max(...Object.values(fam).map((x) => x.formas)), JSON.stringify(fam.alcance));
  t("toda recusa declara família, endereço, literal, formas e anel",
    RECUSAS_DO_COMBATE.every((x) => x.familia && /^src\/App\.jsx:\d+$/.test(x.onde)
      && x.literal && x.formas >= 1 && x.anel && x.fn && x.nasce));

  /* A LIGAÇÃO ENTRE AS DUAS TABELAS: as recusas que o funil conta e as que
     a tabela de recusas atribui ao funil têm de ser o MESMO número. Se
     divergirem, uma das duas ganhou uma linha que a outra não viu — e é
     esse o jeito silencioso de uma medição começar a mentir. */
  const noFunil = contarFunil().voz.recusa;
  t("as recusas do funil batem com as atribuídas ao funil",
    noFunil === r.porAnel.nucleo + r.porAnel.borda, `funil=${noFunil} tabela=${r.porAnel.nucleo + r.porAnel.borda}`);
  t("e as outras nove moram no despachante `agirInterno`, fora do funil",
    r.porAnel.despachante === 9, String(r.porAnel.despachante));

  /* O ESPELHO: sem ele a taxa da frase mente a favor de quem mede, que é
     literalmente o alerta que X3b deixou escrito. A recusa em primeiro. */
  t("NAO_CONTA_COMO_FRASE existe e tem o porquê de cada exclusão",
    NAO_CONTA_COMO_FRASE.length >= 5 && NAO_CONTA_COMO_FRASE.every((x) => x.o && x.porque));
  t("e a recusa é a PRIMEIRA exclusão, como o relógio é a que mais pesa no número",
    /recusa/.test(NAO_CONTA_COMO_FRASE[0].o));
  t("o eco do jogador está excluído", NAO_CONTA_COMO_FRASE.some((x) => /eco do jogador/.test(x.o)));
  t("e o telegrama tem tratamento escrito", NAO_CONTA_COMO_FRASE.some((x) => /telegrama/.test(x.o)));
}

sec("11. a sessão A pelo eixo da frase — as duas taxas lado a lado");
{
  /* A conta refeita aqui com o motor puro, como o bloco 3 faz com o eixo
     do número: os sete turnos rodam `alcanca` de verdade, e a fiação
     (duas linhas por recusa) é a que a tabela declara e o varredor confere. */
  const S = SESSAO_A_PELA_FRASE;
  const grade = G.montarGrade({ local: TURNO_ESTERIL.politicaDaSessaoA.planta });
  const pos = G.posicionar(grade, { heroi: { nome: "Bram" }, grupo: [], inimigos: [{ nome: "Bandido", vida: 11 }] });
  let semNumero = 0, semLinha = 0, semNarracao = 0, linhas = 0, recusas = 0;
  for (let i = 0; i < TURNO_ESTERIL.politicaDaSessaoA.turnos; i++) {
    const ok = G.alcanca(grade, pos.heroi, pos.inimigos[0], { alcanceM: G.alcanceNatural(pos.heroi) }).ok;
    const nLinhas = ok ? 2 : 2;            // eco + (narração | recusa)
    linhas += nLinhas;
    if (!ok) { semNumero++; semNarracao++; recusas++; }
    if (nLinhas === 0) semLinha++;
  }
  t("a mesma política, o mesmo 7/7 estéril", semNumero === S.semNumero && semNumero === 7);
  t("nenhum dos sete turnos termina sem UMA linha", semLinha === S.semLinha && semLinha === 0, String(semLinha));
  t("mas os sete terminam sem uma frase de EVENTO", semNarracao === S.semNarracaoDeEvento && semNarracao === 7);
  t("as catorze linhas são sete ecos e sete recusas",
    linhas === S.linhas && recusas === S.recusas && S.ecos === 7 && S.narracoesDeEvento === 0,
    `linhas=${linhas} recusas=${recusas}`);
  /* A FRASE QUE JUSTIFICA O BLOCO INTEIRO: as duas taxas são opostas na
     mesma sessão, e toda a distância entre elas é recusa. */
  t("as duas taxas não são a mesma — 100% estéril contra 0% mudo",
    S.semNumero / S.turnos === 1 && S.semLinha / S.turnos === 0);
  t("e a recusa da sessão A é da família `alcance`", S.familiaDaRecusa === "alcance");
  t("a família `alcance` tem literal declarado em aplicarGolpeDoJogador",
    /* MM3 (frontend, 29/09): 12617 -> 12679, +62 — o mesmo delta que
       `FUNIL_DO_COMBATE` registra no cabeçalho dele até `aplicarGolpe-
       DoJogador` (hooks novos do estado do cartão do golpe final, acima
       desta função). A família da recusa (`alcance`) é o que se guarda
       aqui, e ela é a mesma — a recusa por alcance não mudou de função,
       só de linha. O histórico anterior (K4, E3, R15, R17, R21, R22) fica
       resumido: cada um re-mediu por conteúdo o mesmo `pushMsgs([...
       📏 ${ataque.motivo}])`, nunca por soma de delta.
       A peneira da agressão (frontend, MM, 29/09): 12679 -> 12693, +14 —
       o mesmo degrau de `aplicarGolpeDoJogador` no cabeçalho de
       FUNIL_DO_COMBATE.
       (os deltas de MM6/MM7 entre 12693 e 12747 já vinham re-medidos na
       tabela antes desta etapa.)
       O golpe final é do grupo (frontend, 29/09, MM3b): 12747 -> 12754,
       +7 — o mesmo degrau de `aplicarGolpeDoJogador` no cabeçalho de
       FUNIL_DO_COMBATE nesta etapa (o estado novo do cartão do grupo,
       antes dela no arquivo).
       A cidade por dentro (frontend, MM12, 29/09): 12754 -> 12768, +14 —
       o mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE
       (a fiação de `fichaParaPauta` em `pautaDoTurno`, acima no arquivo).
       A gente por dentro (frontend, MM8a, 29/09): 12768 -> 12785, +17 — o
       mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE (a
       fiação de `genteParaPauta` em `pautaDoTurno`, logo depois de
       `fichaParaPauta`, acima no arquivo).
       Os tetos das pessoas (frontend, MM8c-1, 29/09): 12785 -> 12805, +20 —
       o mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE (a
       recência do registo de NPCs, acima no arquivo).
       O mundo puxa o herói (frontend, MM13, 30/09): 12805 -> 12879, +74 —
       o mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
       A fiação do primeiro dia (frontend, MM13b, 30/09): 12879 -> 12890,
       +11 — `ondeSeProcura`/`achavelAqui` e o débito de cobranca.js
       entraram acima, dentro de `aplicarResposta`.
       A gente que pesa (frontend, MM8c-2, 30/09): 12890 -> 12896, +6 —
       o mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
       A gente que pesa, medida e cacheada (frontend, MM8c-2, 30/09):
       12896 -> 12906, +10 — o mesmo degrau desta etapa em
       FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE (o cache por identidade,
       elencoCacheRef).
       A promoção (frontend, MM8e, 30/09): 12906 -> 12909, +3 — o mesmo
       degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
       A luta sem espada (frontend, MM9, 30/09): 12909 -> 12921, +12 — o
       import de sem-espada.js (+5) e o ref/helper da impressão (+7)
       nascem acima deste ponto. Re-medido por check-acoes-do-jogador.mjs.
       O crime (frontend, MM10, 30/09): 12921 -> 12939, +18 — o mesmo
       degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE. Re-medido
       por check-acoes-do-jogador.mjs.
       As perguntas ao Mestre (frontend, MM14, 30/09): 12939 -> 12960, +21 —
       o mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
       Re-medido por check-acoes-do-jogador.mjs.
       Os dois canais antigos (frontend, MM14, 30/09): 12960 -> 12935, -25
       — o mesmo líquido desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
       Re-medido pelo diff de App.jsx contra HEAD.
       A gente no lugar certo, com o nome certo (frontend, MM14 · 9b/10a,
       30/09): 12935 -> 12991, +56 — o mesmo delta desta etapa em
       FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE. Re-medido pelo diff de App.jsx
       contra HEAD.
       A extração de fichasDaMesa (frontend, MM14 · o resto do nº 6,
       30/09): 12991 -> 13009, +18 — o mesmo delta desta etapa em
       FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE. Re-medido por
       check-acoes-do-jogador.mjs.
       O lugar pelo Cronista (frontend, MM15 (1), 30/09): 13009 -> 13014,
       +5 — o mesmo delta desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
       Re-medido por check-acoes-do-jogador.mjs.
       As falas pagas e deitadas fora (frontend, MM15 (2), 30/09): 13014 ->
       13016, +2 — o mesmo delta desta etapa em FUNIL_DO_COMBATE/
       RECUSAS_DO_COMBATE. Re-medido por check-acoes-do-jogador.mjs.
       A ligação não é o Mestre (frontend, MM15 (3), 30/09): 13016 ->
       13178, +162 — o mesmo delta de `aplicarGolpeDoJogador` nesta etapa.
       Re-medido por check-acoes-do-jogador.mjs.
       O segredo guardado (frontend, MM15 (4), 30/09): 13178 -> 13199,
       +21 — o mesmo delta de `aplicarGolpeDoJogador` nesta etapa (os cinco
       pontos de O SEGREDO GUARDADO, no cabeçalho de FUNIL_DO_COMBATE,
       nascem ACIMA dela no arquivo). Re-medido por
       check-acoes-do-jogador.mjs.
       Os nomes que se fundem (frontend, MM15 (5), 30/09): 13199 -> 13203,
       +4 — o mesmo delta uniforme do cabeçalho de FUNIL_DO_COMBATE nesta
       etapa. Re-medido por check-acoes-do-jogador.mjs.
       O companheiro de antes (frontend, 01/10): 13203 -> 13228, +25 — o
       mesmo delta de `aplicarGolpeDoJogador` nesta etapa. Re-medido por
       check-acoes-do-jogador.mjs.
       A masmorra que se acaba (v9.348, 05/10): 13228 -> 13216, -12 — o mesmo
       delta de `aplicarGolpeDoJogador` (o bloco do chefe encolheu ACIMA
       dela). A recusa por alcance é a mesma, na mesma função; só mudou de
       linha. A família continua a ser o que a asserção guarda. */
    /* (v9.350 · o como chega) 13216 -> 13229, +13, o mesmo degrau. */
    /* (v9.353 · esconder-se na luta) 13290 -> 13295, +5 —
     o rodapé de `enviar` passou a ler a ficha do turno (+5), ACIMA disto no
     arquivo. Só o endereço andou; re-medido pelo diff de App.jsx contra o
     HEAD, e conferido pelo varredor. */
    /* (v9.354 · a luz e a sombra) 13295 -> 13324, +29 — o import de luz.js
     (+1), o mapa de luz junto de `fichaViva` (+23) e a seção A LUZ em
     `pautaDoTurno` (+5), ACIMA disto no arquivo. Só o endereço andou;
     re-medido pelo diff de App.jsx contra o HEAD, e conferido pelo varredor. */
    /* (v9.356 · a região na criação) 13324 -> 13344, +20 — o
     import de regiao.js (+1) e a escolha região ou continente em `iniciar`
     (+19 líquidos), ACIMA disto no arquivo. Só o endereço andou; re-medido
     pelo diff de App.jsx contra o HEAD, e conferido pelo varredor. */
    /* (v9.357 · a história amarrada à região) MM17 C1: 13344 -> 13353, +9 —
     a espinha amarrada à região depois de `estenderEspinha`, em `iniciar`,
     ACIMA disto no arquivo. Só o endereço andou; re-medido pelo diff de
     App.jsx contra o HEAD, e conferido pelo varredor. */
    /* (v9.358 · a masmorra sem a cidade) MM17 C2: 13353 -> 13379, +26 — a
     ficha, o horizonte, a cena do system e o "aqui" por tabela, ACIMA disto
     no arquivo. Só o endereço andou; re-medido pelo diff de App.jsx contra
     o HEAD, e conferido pelo varredor. */
    /* (v9.359 · a Bolsa em duas linhas) 06/10: 13379 -> 13388, +9 — a
       linha dos equipamentos e a do item da Bolsa, no PainelLateral, ACIMA
       disto no arquivo. Só o endereço andou; re-medido pelo diff de App.jsx
       contra o HEAD, e conferido pelo varredor. */
    RECUSAS_DO_COMBATE.some((x) => x.onde === "src/App.jsx:11742" /* (T1-A 3.ª fatia, 5, o oficial, 28/10: a frase do grupo cheio pela régua do motor, +1 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD aeeabdc) */ /* (T1-A 3.ª fatia, 3, o oficial, 28/10: o turno fundido — uma chamada a aplicarOTurno no lugar das seis peças — e a base do nome com o estado de agora, -59 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 48579a9) */ /* (T1-A 3.ª fatia, 2, o oficial, 28/10: as missões, os sinais, a fé, o milagre e as dádivas saíram do App para motor/meio-do-turno.js, -241 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD bd9e60f) */ /* (T1-A 3.ª fatia, 1, o oficial, 28/10: o registrarLugar e o bloco do mapa saíram do App para motor/meio-do-turno.js, -119 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD d776408) */ /* (onda 2 do custo, o frontend, 14/10, ACIMA) 14603 -> 14675, +72; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (2b9e82b). */ /* (v9.463, o oficial, 13/10: o apontado da agressão e a planta pelo lugar, ACIMA) 14545 -> 14551, +6; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (d299d6c). */ /* (v9.461 ligada, o oficial, 13/10: elencoDoCoracao e cidadeDoCoracao, +13, o QUEM É, e a espinha e os sítios do EM CENA, +5, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 69ad49f): 14526 -> 14545, +19. */ /* (F2b · F2c · F2d, a fiação, o oficial, 12/10: os imports de fichas.js e painel-fichas.jsx, o LimiteDasFichas e a altura da janela, o estado das fichas ao lado de entrada, o ref da memória, e as fichas da cena antes de pautaDoTurno, tudo ACIMA) 14346 -> 14472, +126; só o endereço andou. */ /* (F2a · EM CENA, a fiação, o frontend, 12/10: o import de em-cena.js e o contexto da lista antes de pautaDoTurno, acima) 14298 -> 14346, +48; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (e6edf61). */ /* (os consertos de motor da 9.ª sessão, a fiação, o frontend, 12/10: a moeda do mundo, a cidade de contextoDoCoracao e as bancas da cena, acima) 14286 -> 14298, +12; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (7419ced). */ /* (o Narrador só narra, E4 — a fiação, o frontend, 12/10: a guarda podarONarrador no topo de aplicarResposta, acima) 14277 -> 14286, +9; só o endereço andou. */ /* (os consertos de motor da 8.ª sessão, a fiação, 12/10, acima) 14274 -> 14277, +3; só o endereço andou. */ /* (a frase que paga, 12/10, acima) 14265 -> 14274, +9; só o endereço andou. */ /* (o Narrador só narra, E3 — a fiação, o frontend, 12/10: o achado já na bolsa na cobrança e o gênero do Cronista, acima) 14253 -> 14265, +12; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */ /* (MM-C · C1, o núcleo, o frontend, 11/10: o import de nucleo.js, os três refs, nucleoAgora/nucleoEmCena e a linha QUEM É em pautaDoTurno, acima) 14008 -> 14065, +57; só o endereço andou. */ && x.familia === "alcance")); /* (A1 · as pontas) 13608 -> 13700, +92: o mesmo degrau, todo acima. (v9.371 · a marcha única, a fiação) 13700 -> 13701, +1: o mesmo import. (MM18 · a fiação da escuta) 13701 -> 13774, +73: o mesmo degrau. (nexo · as três fiações, o frontend) 11/10: 13774 -> 13798, +24: o mesmo degrau. */ /* (v9.393 · a fiação da campanha que prende) 13798 -> 13874, +76: o degrau todo acima */ /* (MM · a luta tem saída, o frontend) 11/10: 13874 -> 13915, +41: o mesmo degrau, todo acima. */

  /* o Mestre também se cala, e isso é do CÓDIGO: o `return true` da recusa
     antecede o `enviar`. Sem esta linha a sessão A pareceria um turno em
     que a IA teve chance de narrar e não narrou. */
  t("o Narrador não é chamado nos sete turnos", S.chamadasAoNarrador === 0);
  /* MM3 (frontend, 29/09): o `enviar` MUDOU DE FORMA, não só de linha — pela
     primeira vez desde que este dente existe. Ele não fica mais dentro de
     `aplicarGolpeDoJogador`: a divisão em três (cabeçalho do bloco 9) moveu
     a chamada para dentro de `depoisDoRevide`, uma função interna nova de
     `continuarGolpeDoJogador`. `aplicarGolpeDoJogador` continua a mesma
     função que a sessão A percorre (o `return true` da recusa por alcance
     não mudou de corpo nenhum), mas o `enviar` que ele NÃO chama passou a
     morar um nível de indireção adiante. Novo endereço: 12820, e mesmo dia,
     segunda medição: 12820 -> 12822, +2 (as duas linhas de depuração do
     próprio MM3 em `aplicarGolpeDoJogador` — ver a nota do relógio de 45
     min, bloco 4), e terceira medição no MESMO dia: 12822 -> 12820, -2 (as
     4 linhas de debug que chegaram a existir foram removidas ao fim do
     diagnóstico). O histórico anterior (H1, K4, E4, R3/R4b/R13/R15/R17/
     R21/R22 — dezenove cobranças desta mesma catraca por deslocamento
     simples) traçava a linha dentro de `aplicarGolpeDoJogador`; sai daqui
     porque essa linha já não mora lá.
     A peneira da agressão (frontend, MM, 29/09): 12820 -> 12834, +14 — o
     mesmo degrau de `aplicarGolpeDoJogador` no cabeçalho de
     FUNIL_DO_COMBATE.
     (os deltas de MM6/MM7 entre 12834 e 12892 já vinham re-medidos na
     tabela antes desta etapa.)
     O golpe final é do grupo (frontend, 29/09, MM3b): 12892 -> 12899,
     +7 — o mesmo degrau de `aplicarGolpeDoJogador` no cabeçalho de
     FUNIL_DO_COMBATE nesta etapa (o estado novo do cartão do grupo,
     antes dela no arquivo).
     A cidade por dentro (frontend, MM12, 29/09): 12899 -> 12913, +14 — o
     mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE (a
     fiação de `fichaParaPauta` em `pautaDoTurno`, acima no arquivo).
     A gente por dentro (frontend, MM8a, 29/09): 12913 -> 12930, +17 — o
     mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE (a
     fiação de `genteParaPauta` em `pautaDoTurno`, logo depois de
     `fichaParaPauta`, acima no arquivo).
     Os tetos das pessoas (frontend, MM8c-1, 29/09): 12930 -> 12950, +20 —
     o mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE (a
     recência do registo de NPCs, acima no arquivo).
     O mundo puxa o herói (frontend, MM13, 30/09): 12950 -> 13024, +74 —
     o mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
     A fiação do primeiro dia (frontend, MM13b, 30/09): 13024 -> 13035,
     +11 — `ondeSeProcura`/`achavelAqui` e o débito de cobranca.js
     entraram acima, dentro de `aplicarResposta`.
     A gente que pesa (frontend, MM8c-2, 30/09): 13035 -> 13041, +6 —
     o mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
     A gente que pesa, medida e cacheada (frontend, MM8c-2, 30/09):
     13041 -> 13051, +10 — o mesmo degrau desta etapa em
     FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE (o cache por identidade,
     elencoCacheRef).
     A promoção (frontend, MM8e, 30/09): 13051 -> 13054, +3 — o mesmo
     degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
     A luta sem espada (frontend, MM9, 30/09): 13054 -> 13070, +16 — o
     mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
     O crime (frontend, MM10, 30/09): 13070 -> 13088, +18 — o mesmo
     degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
     As perguntas ao Mestre (frontend, MM14, 30/09): 13088 -> 13109, +21 —
     o mesmo degrau desta etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE.
     Os dois canais antigos (frontend, MM14, 30/09): 13109 -> 13084, -25 —
     o mesmo líquido desta etapa (a migração das tarefas antigas soma
     menos do que a remoção dos dois canais tira), re-medido pelo diff de
     App.jsx contra HEAD.
     A gente no lugar certo, com o nome certo (frontend, MM14 · 9b/10a,
     30/09): 13084 -> 13140, +56 — o mesmo delta desta etapa, re-medido
     pelo diff de App.jsx contra HEAD.
     A extração de fichasDaMesa (frontend, MM14 · o resto do nº 6, 30/09):
     13140 -> 13158, +18 — o mesmo delta desta etapa, re-medido por
     check-acoes-do-jogador.mjs.
     O lugar pelo Cronista (frontend, MM15 (1), 30/09): 13158 -> 13163, +5 —
     o mesmo delta desta etapa, re-medido por check-acoes-do-jogador.mjs.
     As falas pagas e deitadas fora (frontend, MM15 (2), 30/09): 13163 ->
     13165, +2 — o mesmo delta desta etapa, re-medido por
     check-acoes-do-jogador.mjs.
     A ligação não é o Mestre (frontend, MM15 (3), 30/09): 13165 -> 13327,
     +162 — o mesmo delta de `aplicarGolpeDoJogador` nesta etapa (a foto do
     turno nasce ACIMA dela no arquivo), re-medido por
     check-acoes-do-jogador.mjs.
     O segredo guardado (frontend, MM15 (4), 30/09): 13327 -> 13348, +21 —
     o mesmo delta de `aplicarGolpeDoJogador` nesta etapa (os cinco pontos
     de O SEGREDO GUARDADO nascem ACIMA dela no arquivo), re-medido por
     check-acoes-do-jogador.mjs.
     Os nomes que se fundem (frontend, MM15 (5), 30/09): 13348 -> 13352,
     +4 — o mesmo delta uniforme do cabeçalho de FUNIL_DO_COMBATE nesta
     etapa, re-medido por check-acoes-do-jogador.mjs.
     O companheiro de antes (frontend, 01/10): 13352 -> 13377, +25 — o
     mesmo delta de `aplicarGolpeDoJogador` nesta etapa, re-medido por
     check-acoes-do-jogador.mjs. */
  /* A masmorra que se acaba (v9.348, 05/10): 13377 -> 13365, -12 — o mesmo
     delta do funil (o bloco do chefe encolheu ACIMA do `enviar`). Só o
     endereço andou; a asserção segue exigindo o `return true` e o endereço. */
  /* (v9.350 · o como chega) 13365 -> 13378, +13 — o mesmo degrau do funil (a fiação
     de `pautaDoTurno` cresceu ACIMA do `enviar`). Só o endereço andou. */
  /* (v9.351 · a Nave como destino) MM16 nº 2, 05/10: 13378 -> 13405, +27 — o
     import de boca.js no topo (+1), a guarda da ida em `alvoLocalPedido` (+7)
     e a chegada à boca em `talvezChegarSozinho` (+19), todos ACIMA do
     `enviar`. Só o endereço andou; re-medido pelo diff de App.jsx contra o
     de antes da etapa, e conferido pelo varredor. */
  /* (v9.352 · a masmorra na pauta) MM16 nº 4, 06/10: 13405 -> 13439, +34 —
     o mesmo degrau do relógio, todo ACIMA do `enviar`. Só o endereço andou;
     re-medido pelo diff de App.jsx contra o de antes da etapa, e conferido
     pelo varredor. */
  /* (v9.353 · esconder-se na luta) MM16 nº 6, 06/10: 13439 -> 13444, +5 —
     o rodapé de `enviar` passou a ler a ficha do turno (+5), ACIMA disto no
     arquivo. Só o endereço andou; re-medido pelo diff de App.jsx contra o
     HEAD, e conferido pelo varredor. */
  /* (v9.354 · a luz e a sombra) 06/10: 13444 -> 13473, +29 — o import de
     luz.js (+1), o mapa de luz junto de `fichaViva` (+23) e a seção A LUZ
     em `pautaDoTurno` (+5), ACIMA disto no arquivo. Só o endereço andou;
     re-medido pelo diff de App.jsx contra o HEAD, e conferido pelo varredor. */
  /* (v9.356 · a região na criação) MM17 B, 06/10: 13473 -> 13493, +20 — o
     import de regiao.js (+1) e a escolha região ou continente em `iniciar`
     (+19 líquidos), ACIMA disto no arquivo. Só o endereço andou; re-medido
     pelo diff de App.jsx contra o HEAD, e conferido pelo varredor. */
  /* (v9.357 · a história amarrada à região) o enviar andou +9 com a espinha
     amarrada na criação (acoes-do-jogador.mjs, o cabeçalho da re-medida) */
  /* (v9.358 · a masmorra sem a cidade) o enviar andou +26 (13502 -> 13528)
     com a masmorra sem a cidade (acoes-do-jogador.mjs, o cabeçalho da
     re-medida) */
  /* (v9.359 · a Bolsa em duas linhas) 06/10: 13528 -> 13537, +9 — a
     linha dos equipamentos e a do item da Bolsa, no PainelLateral, ACIMA
     disto no arquivo. Só o endereço andou; re-medido pelo diff de App.jsx
     contra o HEAD, e conferido pelo varredor. */
  /* (A1 · B1 · o relato sai do App) 10/10: 13537 -> 13435, -102 — o mesmo
     degrau do relógio, todo ACIMA do `enviar`. Só o endereço andou. */
  /* (A1 · B2–B9) 10/10: 13435 -> 13757, +322 — o mesmo degrau do relógio,
     todo ACIMA do `enviar` da recusa. Só o endereço andou. */
  /* (A1 · as pontas, o oficial) 10/10: 13757 -> 13849, +92 — o mesmo
     degrau do relógio, todo ACIMA do `enviar` da recusa. Só o endereço andou. */
  /* (v9.371 · a marcha única, a fiação) 10/10: 13849 -> 13850, +1 — o
     mesmo import, no topo. Só o endereço andou. */
  /* (MM18 · a fiação da escuta e do mural) 11/10: 13850 -> 13923, +73 — o
     mesmo degrau, todo acima. Só o endereço andou. */
  /* (nexo · as três fiações, o frontend) 11/10: 13923 -> 13947, +24 — o mesmo
     degrau, todo acima (o ref da conversa e o Cronista). Só o endereço andou. */
  /* v9.393: o enviar desceu de :13947 para :14023 (a fiação da campanha que prende acima dele, +76) — o mesmo endereço, re-medido */
  /* (MM (a luta tem saída, o frontend) 11/10) o enviar desceu de :14023 para :14064, +41: o import da saída da luta (+3), os dois refs (+6), a vista da luta na pauta (+17), o mundo do rumo (+5, MM19), o fecho com a frase (+3), o estável que não rola de novo (+6) e o load do fim sem saída (+1), tudo acima. Só o endereço andou; re-medido pelo diff de App.jsx contra o HEAD (e5b6736; o App.jsx é o mesmo de c3de7af). */
  /* (MM11 #5, a bolsa da frase, 11/10: o import, o ref do veto, o preço do balcão, o veto na pauta e o meDeve, acima) o enviar desceu de :14064 para :14089, +25; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */
  /* (MM11 #5, a leitura de pessoa, 11/10: o import de leitura-de-pessoa.js, acima) o enviar desceu de :14089 para :14090, +1; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */
  /* (MM, o laço da história ligado, 11/10: a espinha em mundoDasMissoes e chefesDoFio, acima, +12) o enviar desceu de :14090 para :14102; só o endereço andou. */
  /* (MM-C · C0, as mãos do coração, o frontend, 11/10: o alvo do golpe, o veto da luta sem painel, a ordem do ato, os fatos e o segredo no mundo das missões, o sítio do marco, o herói no registo e a frase anterior da bolsa) o enviar desceu de :14102 para :14157, +55; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */
  /* (MM-C · C1, o núcleo, o frontend, 11/10: o import de nucleo.js, os três refs, nucleoAgora/nucleoEmCena e a linha QUEM É em pautaDoTurno, acima) o enviar desceu de :14157 para :14214, +57; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */
  /* (a frase que paga, MM11 · 8.ª sessão, o frontend, 12/10: a frase do jogador e a moeda do mundo para a bolsa, em enviar, ACIMA) o enviar desceu de :14414 para :14423, +9; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */
  /* (os consertos de motor da 8.ª sessão, a fiação, o frontend, 12/10: a jornada sem destino em talvezChegarSozinho, ACIMA) o enviar desceu de :14423 para :14426, +3; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */
  /* (o Narrador só narra, E4 — a fiação, o frontend, 12/10: a guarda podarONarrador no topo de aplicarResposta, acima) o enviar desceu de :14426 para :14435, +9; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD (35c92c3). */
  /* (9.ª sessão, a fiação, 12/10): o enviar desceu de :14435 para :14447, +12, pelo diff de App.jsx contra o HEAD (7419ced); só o endereço andou */
  /* (F2a · EM CENA, a fiação, 12/10): o enviar desceu de :14447 para :14495, +48, pelo diff de App.jsx contra o HEAD (e6edf61); só o endereço andou */
  t("e o porquê está escrito com endereço", /return true/.test(S.ondeSai) && /* (trilha A, o prelúdio no motor, o oficial, 29/10: o estado e o aplicar do prelúdio, ACIMA, e o trecho de enviar da frase às bocas com os 92 nomes (funções e imports) que só ele lia, que saíram; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 374ddca, à mão): 12582 -> 11940. */ /* (trilha A, os recuos do gênero, o oficial, 29/10: o import de cenario.js, duas linhas, ACIMA; +2, só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD a7497e3) */ /* (trilha A, o glifo do gênero, o oficial, 29/10: GLIFO_DO_GENERO saiu de TelaMundo para o módulo com o comentário, +5 ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD df17ea4) */ /* (trilha A, a praça do Juiz, o oficial, 29/10: o import de aPracaDoJuiz, +2, e a foto do Juiz pela praça do instante, +6, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 5e2a272, à mão): 11975 -> 11983. */ /* (trilha A, o herói novo como o load, o oficial, 29/10: o import de abrir-o-save.js, +1, e a ficha aberta e a cidade pisada no iniciar, +7, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 1d9082c, à mão): 11983 -> 11991. */ /* (trilha A, a ligação do load, o oficial, 29/10: o continuar abre os dez campos por abrirOSave, -84 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 90af402, à mão): 11991 -> 11907. */ /11891/ /* (T3, o tom da cena e o glifo do gênero, o oficial, 29/10: o climaFundo de oito linhas virou uma conta comentada, -4, e o GLIFO_DO_GENERO saiu do App para ui.jsx, -12, ACIMA (-16); só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD, à mão): :11907 -> :11891. */ /* (trilha A, o conferente no motor, o oficial, 29/10: os 61 refs, os 18 setters e a releitura em osOrgaosAgora, +20 ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 9e06960, à mão): 11963 -> 11975. */ /* (trilha A, o trabalho daqui no motor, o oficial, 29/10: o estado dos órgãos do depois, +23 ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD fa0a5e0, à mão): 11940 -> 11963. */ /* (trilha A, o pedido no motor, o oficial, 29/10: o estado e o aplicar do pedido, +9 ACIMA, e o trecho de enviar da pauta ao system, que saiu, -263; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 78caaa9) */.test(S.ondeSai) /* (trilha A, a praça do instante, o oficial, 29/10: o estadoDaPauta passou a uma linha, -2 ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 895686b) */ /* (trilha A, a pauta no motor, o oficial, 29/10: a pautaDoTurno e as oito que só ela chamava saíram do App, -545 no saldo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD f281a2c) */ /* (T2-A, o golpe no corpo no motor, o oficial, 28/10: as duas portas viraram uma linha cada, -49 no saldo ACIMA ou entre; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 5917ac8, à mão): 13381 -> 13367. */ /* (trilha A, T2-A, a abertura no motor, o oficial, 28/10: o pedido da abertura antiga saiu do App, −12 linhas ACIMA; −8 no saldo destas; só o endereço andou) */ /* (trilha A, T2-A, o rodapé no motor, o oficial, 28/10: +1 import no topo e −1 linha no rodapé; re-medido pelo diff contra 2137ae7) */ /* (trilha A, o Juiz que corrige, o oficial, 28/10: o import de motor/correcao-do-juiz.js e os refs do veredito e do livro de vetos, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 49cbd29): 13386 -> 13418. */ /* (T1-A 9.ª fatia, o oficial, 28/10: o gatilho, o pedido e o aceito do Cronista foram para motor/cronista-do-turno.js, e o import dele, ACIMA ou dentro; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 760fe1b): 13654 -> 13386. */ /* (T1-A 8.ª fatia, 2, o oficial, 28/10: o turno do mundo, o sino, o chão e a escuta foram para motor/antes-do-mestre.js, e o import dele, +2 no saldo; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD aac1912): 13648 -> 13654. */ /* (T1-A 8.ª fatia, 1, o oficial, 28/10: a nêmesis, os vistos, o trabalho, a queda e a entrega saíram do aplicarResposta para motor/entrega-do-turno.js, e o import dele, +1 ACIMA e -83 no saldo; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD a9ef8cf): 13710 -> 13648. */ /* (a sessão cede ao save, o orquestrador, 28/10: +3 em salvar, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 110b959): 13707 -> 13710. */ /* (T1-A 7.ª fatia, 1, o oficial, 28/10: a mesa e o fôlego saíram do aplicarResposta para motor/fecho-da-resposta.js, e nove imports sem leitor, -11 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD cbb7134): 13718 -> 13707. */ /* (T1-A 7.ª fatia, 2, o oficial, 28/10: a sessão como arquivo — os imports e os refs da sessão, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD c866d6a): 13660 -> 13718. */ /* (T1-A 7.ª fatia, defeito, o oficial, 28/10: as linhas da emboscada vão à tela, +5 no aplicarResposta, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD cfcd8b8): 13655 -> 13660. */ /* (T1-A 7.ª fatia, 1, o oficial, 28/10: o perigo e a quase-morte saíram do aplicarResposta para motor/fecho-da-resposta.js, e o import dele, +1, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 3ec3364): 13688 -> 13655. */ /* (T1-A 3.ª fatia, 5, o oficial, 28/10: a frase do grupo cheio pela régua do motor, +1 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD aeeabdc) */ /* (T1-A 3.ª fatia, 3, o oficial, 28/10: o turno fundido — uma chamada a aplicarOTurno no lugar das seis peças — e a base do nome com o estado de agora, -59 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 48579a9) */ /* (T1-A 3.ª fatia, 2, o oficial, 28/10: as missões, os sinais, a fé, o milagre e as dádivas saíram do App para motor/meio-do-turno.js, -241 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD bd9e60f) */ /* (T1-A 3.ª fatia, 1, o oficial, 28/10: o registrarLugar e o bloco do mapa saíram do App para motor/meio-do-turno.js, -119 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD d776408) */ /* (T1-A 2.ª fatia, 3, o oficial, 27/10: o d20 da salvaguarda pela sorte do turno, +3 no comentário do aplicarResposta e +4 na frase do grupo cheio do Cronista, +7, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 2fdb7e4) */ /* (T1-A 2.ª fatia, 2, o oficial, 27/10: o cânone e a gente saíram do aplicarResposta para motor/aplicar.js#aplicarORegisto, -56 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD e9c0851) */ /* (T1-A 2.ª fatia, o oficial, 27/10: o import do juízo do Cronista, +1, ACIMA, e o cronistaDoTurno a ler o aceito com a tabela da fé fora do App, -4 no saldo; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 4617715) */ /* (T1-A 2, o aplicar sai do App, o oficial, 27/10: a primeira fatia do aplicarResposta foi para src/motor/aplicar.js, -290 linhas, e os efeitos num lugar só, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD) */ /* (T1-A 1, a semente no App, o oficial, 27/10: a sorte do turno e o dado da tela, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD) */ /* (T0-A 3/3, o oficial, 27/10: o comentário do relógio que lê do estado, +2, ACIMA; só o endereço andou): o enviar desceu de :14872 para :14874, +2. */ /* (T0-A 2/3, o oficial, 27/10: o gancho useVistaDoEstado fora do componente e o estadoRef no topo de Taverna(), +24, tudo ACIMA; só o endereço andou): o enviar desceu de :14848 para :14872, +24. */ /* (T0-A, o oficial, 27/10: o import de estado.js, +2, o lerSave fora do componente, +9, a versão no retrato e o v2 na gravação, tudo ACIMA; só o endereço andou): o enviar desceu de :14830 para :14848, +18. */ /* (a 12.ª sessão no motor, o backend, 19/10: o custo das tentativas falhadas em chamarModelo, +4, o mostrado do rumo, +2, e o veto da viagem que não houve, +7, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 806ef83): o enviar desceu de :14824 para :14830 */ /* (onda 2 do custo, o frontend, 14/10: os sinais do turno, o fixo da ficha, o estado épico e as portas em cenaDoPrompt, tudo ACIMA; o enviar desceu de :14752 para :14824, só o endereço andou, re-medido pelo diff contra o HEAD 2b9e82b) */ /* (v9.470, onda 1 do custo, o frontend, 13/10: o ref e o gatilho do Cronista e a memória do turno, +44, tudo ACIMA; o enviar desceu de :14708 para :14752, só o endereço andou, re-medido pelo diff contra o HEAD 4b72a82) */ /* (v9.465, o frontend, 13/10: o pedido na ordem do cache em chamarMestre, +8, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 842adc7): 14700 -> 14708 */); /* (v9.463, o oficial, 13/10: o apontado da agressão e a planta pelo lugar, +6, tudo ACIMA) */ /* (v9.461 ligada, o oficial, 13/10: elencoDoCoracao e cidadeDoCoracao, +13, o QUEM É, e a espinha e os sítios do EM CENA, +5, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 69ad49f): 14675 -> 14694, +19. */ /* (S10b · a abertura por situação e o kit inicial, o oficial, 13/10: o import de kit-inicial.js, +2, a criação, +3, e equiparCombate/montarGrid, +10, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 341e2cd): 14660 -> 14675, +15. */ /* (a 10.ª sessão ligada, o oficial, 13/10: o sinal da procura de gente, +6, o longe do EM CENA, +4, e o objeto do teste em ctxDesafio, ACIMA ou entre estes; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD cc0770a): 14656 -> 14660, +4. */ /* (os pendentes ligados, o oficial, 13/10: o import de chegadaDaViagem, +1, e a reserva do LimiteDasFichas, +3, ACIMA; o contexto do paradeiro no Cronista, +6, também acima destes): 14646 -> 14656, +10. */ /* (MM17 · o mapa vivo ligado, o oficial, 12/10: 14621 -> 14646, +25, os imports, o LimiteDoMapa e a aba Mapa que abre o mapa vivo entraram ACIMA; conteúdo idêntico, asserção intacta.) */ /* (F2b · F2c · F2d, a fiação, o oficial, 12/10: os imports de fichas.js e painel-fichas.jsx, o LimiteDasFichas e a altura da janela, o estado das fichas ao lado de entrada, o ref da memória, e as fichas da cena antes de pautaDoTurno, tudo ACIMA) 14495 -> 14621, +126; só o endereço andou. */
  /* (o Narrador só narra, E3 — a fiação, o frontend, 12/10: o achado já na bolsa na cobrança e o gênero do Cronista, tudo ACIMA) o enviar desceu de :14402 para :14414, +12; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */
  /* (o Narrador só narra, E1 — a fiação, o frontend, 12/10: os imports, os dois refs dos nomes à mão, o fatorDoPouso, o preço comum em fichasDaMesa, fichasDoOraculo, a rua e os nomes em pautaDoTurno, tudo ACIMA) o enviar desceu de :14329 para :14402, +73; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */
  /* (MM-C · 7.ª sessão de prova, a fiação, o frontend, 12/10: os imports, os dois refs da chegada inferida, a régua do querPartir, o naoParte do resolver e o porteiro do mural, tudo ACIMA) o enviar desceu de :14305 para :14329, +24; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */
  /* (MM-C · C6, a fogueira ligada, o oficial, 11/10: o import do painel e dos cinco do motor, o LimiteDaFogueira, o estado da noite e a ficha do envio em aplicarResposta, tudo ACIMA) o enviar desceu de :14278 para :14305, +27; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */
  /* (MM-C · C2, as subtramas, o frontend, 11/10: o import de subtramas.js, os quatro refs, subtramasAgora/contextoDoCoracao, a mão do vilão e QUEM CARREGA em pautaDoTurno, acima, e o coração em aplicarRetrato) o enviar desceu de :14214 para :14278, +64; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD. */

  t("a fórmula do eixo novo está escrita para ser repetida",
    /turnos_sem_frase_de_evento \/ turnos_totais/.test(S.formula));
  t("e o procedimento aponta a sessão A″ da sonda", /sonda-turno-esteril/.test(S.procedimento) && /A″/.test(S.procedimento));

  /* A HONESTIDADE ACIMA DO NÚMERO BONITO: o que não deu para medir é
     declarado, como a Fase X inteira fez. X3c morreu por não ter feito
     isto a tempo. */
  t("o que X4 não conseguiu medir está escrito, com o porquê",
    O_QUE_NAO_DEU_PARA_MEDIR.length >= 3 && O_QUE_NAO_DEU_PARA_MEDIR.every((x) => x.o && x.porque));
  t("e a primeira limitação é a de sempre: a sonda não roda o App.jsx",
    /não roda o `App\.jsx`/.test(O_QUE_NAO_DEU_PARA_MEDIR[0].porque));
}

console.log(`\n${bons} ok, ${maus} falhas`);
process.exit(maus ? 1 : 0);
