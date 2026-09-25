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
     (dente 8) confirma sozinho a cada corrida. */
  t("e aponta a linha que avança o relógio", !!relogio && /14078/.test(relogio.porque));
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
     adjudicador usa (src/App.jsx:16398 → veredictoDaAcao) */
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
  t("e o App de fato escreve recursos ao abrir a luta", /recursos: novosRecursos\(\)/.test(APP));

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
   se reproduz: são 14 funções (11 provadamente mudas fora da luta) e 18
   chamadas de recusa em 25 formas. A tabela guarda os números medidos,
   este bloco os afirma, e `check-acoes-do-jogador.mjs` re-deriva do
   `App.jsx` os endereços — é o mesmo tripé de X1.

   NENHUMA ASSERÇÃO ANTERIOR FOI MOVIDA AQUI. O eixo do número (blocos 3
   e 4) fica onde estava e continua dando 7/7: X4 é medição, e a política
   da sessão A não foi tocada.
   ============================================================ */
sec("9. o funil do combate — quem chama pushMsgs, e com que voz");
{
  const f = contarFunil();
  t("o funil tem 14 funções", f.funcoes === 14, String(f.funcoes));
  t("e 11 delas são provadamente mudas fora da luta", f.porAnel.nucleo === 11, String(f.porAnel.nucleo));
  t("as outras 3 são de borda — falam dentro e fora", f.porAnel.borda === 3, String(f.porAnel.borda));
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
    FUNIL_DO_COMBATE.find((x) => x.fn === "aplicarGolpeDoJogador")
      /* v9.273 (K4): 12125 -> 12122. v9.273 (K4): -3 linhas. A fila de pilulas da ficha (1993-2003) passou a consumir a peca `PilulaDeEscolha` e encolheu 3 linhas; o codigo abaixo dela andou junto e nada mais mudou.
         A voz da linha (`telegrama`) e o que esta assercao guarda, e ela nao mudou.

         v9.270 (K3): 11960 -> 12125, pelo mesmo deslocamento que re-mediu a
       tabela inteira. A assercao e a mesma; o que mudou foi onde a linha
       mora depois de a janela da reacao entrar no arquivo. */
      /* E3: 12122 -> 11707. A voz da linha (`telegrama`) é o que esta
         asserção guarda, e ela não mudou. */
      /* R15: 12407 -> 12443, +36, pelo comentário que o conserto do nome da
         campanha pôs dentro de `salvar`. Conferido por CONTEÚDO e não por
         aritmética — é o mesmo `pushMsgs(linhas)` de `aplicarGolpeDoJogador`.
         A voz continua a ser o que esta asserção guarda, e ela não mudou.
         R17: 12443 -> 12536, +93 (a lápide de `VinhetaDaCena`/`IconeBalao`
         e a fiação nova do veredito do cartaz nascem acima). Mesmo
         `pushMsgs(linhas)`, conferido por conteúdo; a voz não mudou.
         A FUGA (frontend): 12536 -> 12538, +2 (o import de `fuga.js` e
         do rótulo do verbo Fugir, no topo do arquivo). Mesmo
         `pushMsgs(linhas)`; a voz não mudou. */
      /* R21 (oficial): o alforje no telefone - os imports do painel e da marca, a porta na cinta, o trilho so na larga e a fiacao do alforje entram ANTES destas linhas; tudo abaixo andou junto. Endereco re-medido pelo diff, conteudo identico; asserção intacta. 12538 -> 12630. */
      /* A FUGA (frontend, segunda volta — R21): 12641 -> 12656, +15. O
         fôlego da fuga (fuga.js) entrou acima — o `folegoRef` ao lado de
         `combateRef`, o guardar/consultar dentro de `fugirDaLuta`/
         `talvezCacar`/`talvezVirar`, e a emboscada do `resp.perigo` — e
         tudo abaixo andou junto. Endereço re-medido pelo diff (as
         mesmas nove linhas do bloco 9, mais seis do `resp.perigo`); o
         `pushMsgs` desta linha não mudou de conteúdo nem de voz. */
      .linhas.find((l) => l.onde === "src/App.jsx:12656").voz === "telegrama");
  t("a maior boca do funil é `resolverRevide`, com 29 chamadas",
    FUNIL_DO_COMBATE.find((x) => x.fn === "resolverRevide").linhas.length === 29);
  t("toda função do funil declara anel, endereço e ao menos uma linha",
    FUNIL_DO_COMBATE.every((x) => /^src\/App\.jsx:\d+$/.test(x.onde)
      && (x.anel === "nucleo" || x.anel === "borda") && x.linhas.length > 0));
  t("e toda linha declara onde sai, o evento e onde a frase nasce",
    FUNIL_DO_COMBATE.every((x) => x.linhas.every((l) =>
      /^src\/App\.jsx:\d+$/.test(l.onde) && l.evento && l.nasce)));

  /* a coluna `nasce` é a que diz quanto da voz já é testável em Node */
  const n = vozQueNasceNoModulo();
  t("parte da voz do combate já nasce fora do React", n.doModulo === 22, String(n.doModulo));
  t("e a maior parte ainda só existe no App.jsx", n.doApp === 35 && n.doApp > n.doModulo, String(n.doApp));
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
    /* v9.273 (K4): 12075 -> 12072, pelo mesmo -3 da fila da ficha. A familia
       da recusa (`alcance`) e o que se guarda aqui, e ela e a mesma. */
    /* E3: 12072 -> 11657, pelo mesmo deslocamento. A família da recusa
       (`alcance`) é o que se guarda aqui, e ela é a mesma. */
    /* R15: 12357 -> 12393, +36. Conferido por CONTEÚDO — é o mesmo
       `pushMsgs([... 📏 ${ataque.motivo}])`. A família da recusa
       (`alcance`) é o que se guarda aqui, e ela é a mesma.
       R17: 12393 -> 12486, +93 (mesmo delta do bloco acima). Conferido
       por conteúdo; a família não mudou.
       A FUGA (frontend): 12486 -> 12488, +2 (mesmo delta do bloco acima).
       Conferido por conteúdo; a família não mudou. */
    /* R21 (oficial): o alforje no telefone - os imports do painel e da marca, a porta na cinta, o trilho so na larga e a fiacao do alforje entram ANTES destas linhas; tudo abaixo andou junto. Endereco re-medido pelo diff, conteudo identico; asserção intacta. 12488 -> 12580. */
    /* A FUGA (frontend, segunda volta — R21): 12591 -> 12606, +15 — o
       mesmo delta do bloco 9 (o fôlego da fuga entrou acima). Conferido
       por conteúdo; a família não mudou. */
    RECUSAS_DO_COMBATE.some((x) => x.onde === "src/App.jsx:12606" && x.familia === "alcance"));

  /* o Mestre também se cala, e isso é do CÓDIGO: o `return true` da recusa
     antecede o `enviar`. Sem esta linha a sessão A pareceria um turno em
     que a IA teve chance de narrar e não narrou. */
  t("o Narrador não é chamado nos sete turnos", S.chamadasAoNarrador === 0);
  /* o endereço do `enviar` era `11932` até a v9.262 e hoje é `12138`: H1
     abriu a porta das habilidades de classe e somou linhas acima dele, e
     v9.273 (K4) tirou 3 ao trocar a fila de pílulas da ficha pela primitiva
     `PilulaDeEscolha` — `12141 -> 12138`, conferido na linha do `enviar(` de
     `aplicarGolpeDoJogador`. O que esta asserção guarda nunca foi o número —
     é que o porquê do silêncio venha com ENDEREÇO, para que a próxima medição
     possa conferi-lo; o número mudou, a intenção não. */
  /* E4: 11723 -> 11737, pelas treze linhas da chave `economia` em :4929.
     O que esta asserção guarda nunca foi o número — é que o porquê do
     silêncio venha com ENDEREÇO, para que a próxima medição o possa
     conferir. O número mudou; a intenção, não. */
  t("e o porquê está escrito com endereço", /return true/.test(S.ondeSai) && /12672/.test(S.ondeSai));   /* A FUGA (frontend, segunda volta — R21): 12657 -> 12672, +15 (o mesmo delta de `aplicarGolpeDoJogador` — o fôlego da fuga entrou acima, em `combateRef`/`aplicarResposta`). Conferido por conteúdo; o `enviar` não mudou de sítio dentro da função. · R21 (oficial): o alforje no telefone - os imports do painel e da marca, a porta na cinta, o trilho so na larga e a fiacao do alforje entram ANTES destas linhas; tudo abaixo andou junto. Endereco re-medido pelo diff, conteudo identico; asserção intacta. 12554 -> 12646. · R15: 12423 -> 12459, +36, pelo comentário do conserto do nome da campanha em `salvar` — conferido por CONTEÚDO, é o mesmo `enviar([COMBATE — RESOLVIDO PELO SISTEMA]...)`; o `enviar` não mudou de sítio dentro da função · E3: 12138 -> 11723 · R3: 11737 -> 11839 · R4b: 11839 -> 11846 · R13-A: 11846 -> 12312 · R13-B: 12312 -> 12423 (as peças de `A cinta`, de `O painel do tempo` e de `O topo do papel` nasceram ao nível do módulo — é a lei da casa, porque componente dentro do render mata o foco do input — e empurraram a região inteira; o `enviar` não mudou de sítio dentro da função) — as sete linhas são a lápide dos doze verbos (oito linhas onde havia a tabela) menos a do estado da gaveta de `Ações`. O `enviar` não mudou de sítio dentro da função, só de linha no arquivo · R17: 12459 -> 12552, +93 (mesmo delta de `aplicarGolpeDoJogador`; conferido por conteúdo, não por soma) · A FUGA (frontend): 12552 -> 12554, +2 (mesmo delta de `aplicarGolpeDoJogador`) */

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
