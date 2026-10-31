/* VARREDOR — a tabela de X1 contra o código de verdade

   POR QUE ELE EXISTE. A tabela `acoes-do-jogador.mjs` foi feita lendo o
   `App.jsx` como TEXTO e modelando a fiação. Essa é a parte da medição
   que apodrece sozinha: alguém renomeia um handler, move um literal,
   troca a ordem de uma porta — e a tabela segue afirmando um mundo que
   já não existe, com a suíte verde, que é o pior dos dois.

   Então este varredor RE-DERIVA do código o que a tabela declara, e
   falha quando os dois discordam. Ele não julga se o jogo está certo:
   julga se a MEDIÇÃO ainda descreve o jogo.

   Toda falha aqui diz o que fazer — um varredor que só grita é pior que
   varredor nenhum. */

import { readFileSync } from "node:fs";
import { lerApp, corpoDe, funcaoDoTrecho, referenciasDe, conferirReferencia, conferirChamadas } from "./ancoras-do-app.mjs";
import {
  ACOES_DO_JOGADOR, ABERTURA_FORA_DE_ALCANCE, TURNO_ESTERIL, MOTOR_SEM_CHAMADOR,
  NAO_CONTA_COMO_NUMERO, FUNIL_DO_COMBATE, RECUSAS_DO_COMBATE, SESSAO_A_PELA_FRASE,
  acoesComCliqueCondicional,
} from "./acoes-do-jogador.mjs";
const G = await import("../src/grid.js");
const APP = lerApp();
const DESAFIOS = readFileSync("../src/desafios.js", "utf8");
const TURNO = readFileSync("../src/turno.js", "utf8");

let maus = 0;
const falha = (o, oQueFazer) => { maus++; console.log(`  XX  ${o}\n      → ${oQueFazer}`); };
const ok = (o) => console.log("  ok  " + o);

/* ============================================================
   BLOCO 1 — O DENTE VIRADO DE FRENTE PELA SEGUNDA VEZ (R4b)

   X1 escreveu aqui um dente que vigiava a PARTIDA (o handler dos vinte
   botões ainda ser só a caixa de texto). X2 virou-o para vigiar a CHEGADA
   (o `Atacar` ainda chamar o motor). R4b vira-o outra vez, e agora ele
   vigia a AUSÊNCIA — que o painel não volte.

   POR QUE ELE PODE VIRAR SEM AFROUXAR. A regressão que a Fase X existia
   para impedir era o `Atacar` COM motor voltar para dentro de uma caixa
   de texto. Essa continua impedida, e num sítio melhor: o `Atacar` com
   motor é o `aoAtacar` da tela da batalha, e `teste-acoes-do-jogador.mjs`
   (bloco 1-B, elos 1 a 6) mede a cadeia inteira dele, com sonda a correr
   em Node.

   E FICA ESCRITO O QUE ESTE VARREDOR NÃO VIU DURANTE UM CICLO INTEIRO,
   porque é a lição mais cara desta etapa: ele afirmou "o botão `Atacar`
   segue chamando `declararGolpe`" enquanto o desvio já não podia correr.
   O painel só se pinta sob `!emBatalha`; `vereditoDoGolpeAgora()` devolve
   `null` sem `combateRef.current`; havendo luta quem se pinta é
   `TelaDeBatalha`. E3 matou a fiação, e a régua não reparou porque ela
   lia o TEXTO do handler e nunca o alcance dele. *Um varredor que mede
   que o código está escrito não mede que ele corre* — e, onde a diferença
   importa, é preciso uma segunda âncora do lado de fora, que é o que os
   dois dentes abaixo passam a ser.
   ============================================================ */
console.log("\n1. os 12 verbos prontos, aposentados em R4b");
{
  if (/const ACOES_PRONTAS = \[/.test(APP)) {
    falha("a tabela `ACOES_PRONTAS` voltou a src/App.jsx",
      "R4b aposentou os vinte botões do painel de `Ações` — zero deles dizia o preço na tela e nenhum nomeava a cena. Se voltaram DE PROPÓSITO, re-meça o eixo do clique das 12 entradas de ACOES_DO_JOGADOR (elas estão em `cliqueChega: \"aposentado\"`), reveja o TETO_SEM_MOTOR em teste-acoes-do-jogador.mjs e escreva o motivo — a catraca não sobe em silêncio");
  } else ok("`ACOES_PRONTAS` não voltou ao App");

  if ([...ACOES_DO_JOGADOR.filter((a) => a.fonte === "ACOES_PRONTAS")].length !== 12) {
    falha("a tabela deixou de descrever os 12 verbos prontos",
      "as entradas FICAM mesmo aposentadas: elas medem o caminho do TEXTO, que é o que sobrou e sempre resolveu. Se um verbo deixou de existir para o jogador, tire-o com o motivo escrito");
  } else ok("e a tabela segue descrevendo os 12, pelo caminho do texto");

  /* o dente do lado de fora: nenhum controle desta casa escreve na caixa
     do jogador. Era o handler único dos vinte, e é o que não pode nascer
     outra vez — sob qualquer nome. */
  if (/setEntrada\(a\.texto\)/.test(APP)) {
    falha("nasceu de novo um controle que escreve na caixa do jogador",
      "`setEntrada(a.texto)` era o handler dos vinte botões. Um botão que escreve a frase do jogador é um verbo DO JOGADOR vestido de oferta DO MUNDO — a régua da soleira separa os dois. Se for de propósito, re-meça o eixo do clique da tabela inteira e escreva o motivo");
  } else ok("e nenhum controle escreve a frase do jogador na caixa");

  if (/if \(golpeVivo\) \{ declararGolpe\(/.test(APP)) {
    falha("o desvio condicional do `Atacar` voltou ao App",
      "ele era o clique que a tela principal nunca chegava a correr (só existe sob `!emBatalha`, e o veredito é `null` sem combate). Se voltou, meça-o VIVO antes de o declarar, e escreva `cliqueChegaFora` na entrada de pronta_atacar");
  } else ok("e o desvio condicional que nunca corria não voltou");

  /* O IMPEDIMENTO MUDOU DE ARQUIVO, e a lei que ele serve não mudou:
     o veredito antes do clique, e o clique impedido em vez de gasto. */
  const TELA = readFileSync("../src/painel-batalha.jsx", "utf8");
  const impede = /algumAoAlcance: vd \? !!vd\.algumAoAlcance : true/.test(TELA)
    && /aria-disabled=\{impedido \|\| undefined\}/.test(TELA);
  if (!impede) {
    falha("o verbo `Atacar` deixou de ser IMPEDIDO quando ninguém está ao alcance",
      "sem isso o jogador volta a gastar cliques para ouvir \"ninguém está ao alcance\" — a abertura recusa em 10 de 10 plantas. A trava vive em src/painel-batalha.jsx desde E3; se mudou de forma, atualize o campo `alcanca` de pronta_atacar em testes/acoes-do-jogador.mjs e o elo 6 do bloco 1-B de teste-acoes-do-jogador.mjs");
  } else ok("e o verbo da luta segue impedido quando o veredito recusa");

  /* o eixo condicional esvaziou-se com os botões, e continua vigiado:
     uma lista vazia é o melhor momento para a vigiar, é quando o primeiro
     membro entra sem ninguém reparar */
  const condicionais = acoesComCliqueCondicional().map((a) => a.rotulo);
  if (condicionais.length !== 0) {
    falha(`a tabela declara clique condicional em: ${condicionais.join(", ")}`,
      "desde R4b nenhum controle se comporta de dois jeitos, porque nenhum dos vinte botões existe. Se nasceu um, meça-o VIVO nos dois contextos antes de escrever `cliqueChegaFora` — foi medir só o texto que deu `Atacar` por vivo durante um ciclo");
  } else ok("e o eixo condicional está vazio, como a aposentadoria manda");
}

console.log("\n2. as 8 ACOES_RAPIDAS e o despachante");
{
  const bloco = DESAFIOS.match(/export const ACOES_RAPIDAS = \[([\s\S]*?)\n\];/);
  if (!bloco) {
    falha("não achei `ACOES_RAPIDAS` em src/desafios.js",
      "atualize a âncora deste varredor e o campo `onde` das 8 entradas rápidas em testes/acoes-do-jogador.mjs");
  } else {
    const ids = [...bloco[1].matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
    const naTabela = ACOES_DO_JOGADOR.filter((a) => a.fonte === "ACOES_RAPIDAS").map((a) => a.id.replace(/^rapida_/, ""));
    if (ids.length !== 8) {
      falha(`src/desafios.js declara ${ids.length} ações rápidas, a tabela espera 8`,
        "acrescente/remova a entrada correspondente em ACOES_DO_JOGADOR e re-meça o caminho dela");
    } else ok("são 8 no código, como a tabela diz");
    const faltando = ids.filter((i) => !naTabela.includes(i));
    if (faltando.length) {
      falha(`ação rápida sem entrada na tabela: ${faltando.join(", ")}`,
        "acrescente a entrada em ACOES_DO_JOGADOR — e confira se ela é de combate, porque é isso que a catraca de X2 vigia");
    } else ok("toda ação rápida do código tem entrada na tabela");
  }
  /* R4b: o despachante saiu com os botões. A âncora vira-se para a porta
     que sobrou — e que é a mesma porta onde o atalho desembocava, o que é
     precisamente o que tornou a aposentadoria possível sem perder jogo:
     `declararAcaoRapida` chamava `adjudicarAcao`, e a frase digitada
     chama `adjudicarAcao` pela porta `desafio` de `executar`. */
  if (/const declararAcaoRapida = /.test(APP)) {
    falha("`declararAcaoRapida` voltou ao App",
      "era a TERCEIRA porta ao motor — a que saltava `agirInterno` — e com ela volta a obrigação de perguntar a `travaODeclarar` antes de resolver (check-guardado.mjs, bloco 4). Se voltou de propósito, devolva-a à lista de PORTAS de lá e re-meça o `handler` das 8 entradas rápidas");
  } else ok("o despachante saiu com os botões, e não voltou");
  if (!/if \(faz === "desafio"\) return adjudicarAcao\(acao\);/.test(APP)) {
    falha("a porta `desafio` do despachante do turno mudou de forma",
      "é por ela que as 8 ações rápidas entram no motor DESDE R4b, escritas à mão no campo. Se ela mudou, re-meça `textoFora`/`textoLuta` das 8 entradas rápidas — é a única coluna que lhes sobrou");
  } else ok("e as 8 entram pela porta `desafio` do texto, como a tabela diz");
}

console.log("\n3. o semAlcance que recusa de graça");
{
  /* a recusa existe */
  if (!/if \(ataque && ataque\.semAlcance\) \{/.test(APP)) {
    falha("a recusa por alcance do ATAQUE sumiu de src/App.jsx",
      "se X2 mudou como o golpe trata o alcance, re-meça ABERTURA_FORA_DE_ALCANCE e atualize `recusaDeGraca` em testes/acoes-do-jogador.mjs");
  } else ok("a recusa por alcance segue no caminho do ataque");

  /* e sai SEM gastar a ação — é isso que impede o revide e congela tudo.
     Procuro o `return` da recusa antes de qualquer desconto de economia. */
  const trecho = APP.match(/if \(ataque && ataque\.semAlcance\) \{[\s\S]{0,400}?\n    \}/);
  if (!trecho) {
    falha("não consegui ler o corpo da recusa por alcance",
      "a forma do bloco mudou: reveja este varredor e re-meça se a recusa ainda é de graça");
  } else if (/eco\.acao\s*-=|economia:/.test(trecho[0])) {
    falha("a recusa por alcance passou a gastar a ação",
      "isso MUDA a conta de X1: a rodada passa a virar e o inimigo passa a revidar. Re-rode `node testes/sonda-turno-esteril.mjs`, atualize TURNO_ESTERIL.sessaoA_hoje e o bloco 3 de teste-acoes-do-jogador.mjs, com o motivo escrito");
  } else ok("a recusa segue sem cobrar a ação (logo, sem revide)");
}

console.log("\n4. a abertura fora de alcance, planta por planta");
{
  let divergiu = 0;
  for (const p of ABERTURA_FORA_DE_ALCANCE.aberturaPorPlanta) {
    const grade = G.montarGrade(p.planta === "masmorra" ? { emMasmorra: true } : { local: p.planta });
    const pos = G.posicionar(grade, { heroi: { nome: "Bram" }, grupo: [], inimigos: [{ nome: "X", vida: 9 }] });
    const d = G.distanciaM(pos.heroi, pos.inimigos[0]);
    const alcancou = G.alcanca(grade, pos.heroi, pos.inimigos[0], { alcanceM: G.alcanceNatural(pos.heroi) }).ok;
    if (Math.abs(d - p.metros) > 0.01) {
      divergiu++;
      falha(`${p.planta}: a tabela diz ${p.metros} m e o grid dá ${d} m`,
        "a geometria de abertura mudou (posicionar ou o tamanho da planta). Atualize `aberturaPorPlanta` em testes/acoes-do-jogador.mjs com o valor medido e reveja `turnosAndandoAteOGolpe`");
    }
    if (alcancou) {
      divergiu++;
      falha(`${p.planta}: o golpe corpo a corpo agora ALCANÇA no turno 1`,
        "é uma mudança de jogo, não de medida — provavelmente X2. Atualize `corpoACorpoOk` e `plantasQueRecusamNoTurno1`, e re-rode a sonda para a nova taxa");
    }
  }
  if (!divergiu) ok("as 10 plantas conferem com o grid");
}

console.log("\n5. a porta `agressao` e os dois mundos");
{
  if (!/quando: \(s\) => s\.ehAgressao && !s\.emCombate/.test(TURNO)) {
    falha("a condição da porta `agressao` mudou em src/turno.js",
      "a tabela afirma que a porta abre só FORA de combate (é o que separa os dois caminhos do ataque). Re-meça e atualize o campo `alcanca` de texto_ataque e pronta_atacar");
  } else ok("a porta `agressao` segue fechada dentro da luta");
}

console.log("\n6. o motor que nenhum clique chama");
{
  const morto = MOTOR_SEM_CHAMADOR.morto.find((x) => x.nome === "gastarRecurso");
  if (morto) {
    const chamado = /\bgastarRecurso\s*\(/.test(APP);
    if (chamado) {
      falha("gastarRecurso passou a ser chamado no App",
        "ótimo — a economia de ação saiu do papel. Tire-o de MOTOR_SEM_CHAMADOR.morto em testes/acoes-do-jogador.mjs e ajuste a asserção do bloco 8 de teste-acoes-do-jogador.mjs");
    } else ok("gastarRecurso segue importado e nunca chamado");
  }
  for (const n of MOTOR_SEM_CHAMADOR.semClique["combate.js"]) {
    if (new RegExp(`\\b${n}\\s*\\(`).test(APP)) {
      falha(`${n} passou a ser chamado no App.jsx`,
        `tire "${n}" de MOTOR_SEM_CHAMADOR.semClique["combate.js"] em testes/acoes-do-jogador.mjs — a lista descreve o que NENHUM clique alcança`);
    }
  }
  if (!maus) ok("as listas de sem-chamador seguem verdadeiras");
}

console.log("\n7. a fórmula que X4 repete");
{
  if (!/turnos_sem_delta \/ turnos_totais/.test(TURNO_ESTERIL.formula)) {
    falha("a fórmula da taxa estéril foi reescrita",
      "X4 precisa executar a MESMA conta de X1 para os números serem comparáveis. Se a fórmula mudou, os dois lados da comparação têm de ser refeitos — escreva o motivo em testes/acoes-do-jogador.mjs");
  } else ok("a fórmula segue a de X1");
}

/* ============================================================
   OS DENTES DO EIXO DA FRASE (X4)

   POR QUE ELES EXISTEM. O bloco 8 nasceu da dívida de um ENDEREÇO: a
   exclusão do relógio de 45 min carregava um número de linha desde X1, e o
   número mudou sem nada avisar, porque nada o re-derivava. Os blocos 9 e 10
   são a mesma catraca para a medição nova: o funil e as recusas são leitura
   de TEXTO — a parte da medida que apodrece sozinha.

   ELES ANCORAM NO QUE NÃO SE MOVE SOZINHO, e desde a Fase 2 do plano do
   motor (31/10/2026) NÃO EXISTE MAIS NENHUM NÚMERO DE LINHA aqui: o NOME da
   função, o TRECHO do código (uma âncora que aparece uma vez), o LITERAL da
   frase. O método está em `ancoras-do-app.mjs`. Antes, cada patch no App
   obrigava a re-medir uns 140 endereços (um re-medidor à parte, mais
   correções à mão) e ainda assim sobravam os errados — apontando para um
   comentário, ou para a linha de outra chamada, porque o dente só
   perguntava se a linha citada TEM um `pushMsgs(`, nunca QUAL. A mordida
   está provada em `teste-ancoras-do-app.mjs`: apagar, renomear ou duplicar
   o alvo acende; deslocar o arquivo inteiro não.
   ============================================================ */

console.log("\n8. o relógio de 45 min — a função que a exclusão carrega");
{
  const relogio = NAO_CONTA_COMO_NUMERO.find((x) => /relógio/.test(x.o));
  const AVANCO = "avancarMinutos(MINUTOS_POR_TURNO)";
  const nAvanco = APP.split(AVANCO).length - 1;
  const dona = funcaoDoTrecho(APP, AVANCO);
  const citadas = relogio ? [...referenciasDe(relogio.porque)].map((r) => r.split("#")[1]) : [];
  if (!dona) {
    falha(nAvanco === 0 ? "não achei `avancarMinutos(MINUTOS_POR_TURNO)` em src/App.jsx" : `\`${AVANCO}\` aparece ${nAvanco} vezes em src/App.jsx`,
      "o relógio do turno mudou de forma. Reveja a exclusão do relógio em NAO_CONTA_COMO_NUMERO (testes/acoes-do-jogador.mjs): se ele deixou de avançar sozinho, a exclusão perde o motivo e a taxa estéril tem de ser remedida; se agora há dois avanços, a exclusão tem de dizer os dois");
  } else if (!citadas.includes(dona)) {
    falha(`o avanço do relógio mora em \`${dona}\` e a exclusão cita ${citadas.length ? citadas.join(", ") : "nenhuma função"}`,
      `troque a referência no campo \`porque\` do relógio em NAO_CONTA_COMO_NUMERO (testes/acoes-do-jogador.mjs) para src/App.jsx#${dona}, com o motivo escrito ao lado, que é a lei da casa`);
  } else ok(`o relógio avança uma vez, em \`${dona}\`, como a exclusão cita`);
  /* e a condição que o mantém FORA do combate — se ela cair, o relógio
     passa a andar em luta e a sessão A deixa de ser estéril por definição */
  /* (T1-A 3.ª fatia, o oficial, 28/10) A RÉGUA LIA A GUARDA ERRADA. Ela
     procurava o texto exato da guarda em QUALQUER lugar do App — e a guarda
     do relógio ganhou, na MM14, um quarto termo (`&& !(() => … soPergunta`),
     de modo que deixou de casar; quem casava eram as duas portas dos sinais
     (viagem e masmorra) do aplicarResposta, que usam a mesma condição. Com
     os sinais no motor, o falso verde caiu. A intenção é a mesma: a condição
     tem de estar À FRENTE do avanço do relógio — lida nas linhas logo antes
     dele. */
  /* (T1-A 8.ª fatia, 2, o oficial, 28/10) a guarda é hoje a pergunta do motor —
     `oMundoAndaNoTurno({ combate, acampado, masmorra }, acao)`, src/motor/antes-do-mestre.js —, e o
     avanço do relógio só corre quando ela diz que sim. A régua lê a chamada nas linhas logo antes do
     avanço, e joga a peça: em luta, o mundo não anda. */
  const { oMundoAndaNoTurno } = await import("../src/motor/antes-do-mestre.js");
  const aFrente = APP.slice(0, APP.indexOf(AVANCO)).split("\n").slice(-5).join("\n") + AVANCO;
  if (!dona || !/oMundoAndaNoTurno\(\{ combate: combateRef\.current, acampado: acampadoRef\.current, masmorra: masmorraRef\.current \}, acao\);/.test(aFrente) || !/if \(doMundo\.anda\) \{/.test(aFrente)
    || oMundoAndaNoTurno({ combate: { rodada: 1 } }, "ando pela praça").anda !== false) {
    falha("a guarda que impede o relógio de andar em combate mudou",
      "a sessão A supõe que nenhum número muda no turno de combate. Se o relógio passou a andar em luta, re-rode `node testes/sonda-turno-esteril.mjs` e refaça TURNO_ESTERIL.sessaoA_hoje e SESSAO_A_PELA_FRASE, com o motivo escrito");
  } else ok("e o relógio segue parado dentro da luta");
}

console.log("\n9. o funil do combate — as funções que chamam pushMsgs");
{
  /* o funil: pushMsgs é declarado uma vez, como useCallback. (Antes: «segue
     na linha 8497» — um número que andou mais de cinquenta vezes. O que o
     mapa de X3b afirma é que o funil EXISTE e é UM; o endereço nunca foi o
     que importava.) */
  const nPush = (APP.match(/^  const pushMsgs = useCallback\(/gm) || []).length;
  if (nPush !== 1) {
    falha(nPush === 0 ? "não achei a declaração de `pushMsgs` em src/App.jsx" : `\`pushMsgs\` é declarado ${nPush} vezes em src/App.jsx`,
      "o funil das linhas mudou de forma ou de nome. Reveja o cabeçalho do bloco 6 de testes/acoes-do-jogador.mjs e re-meça FUNIL_DO_COMBATE — sem o funil, o eixo da frase não tem o que contar");
  } else ok("`pushMsgs` segue declarado uma vez, como o funil de X3b diz");

  let divergiu = 0;
  for (const f of FUNIL_DO_COMBATE) {
    const { n: nDecl, texto } = corpoDe(APP, f.fn);
    if (nDecl !== 1) {
      divergiu++;
      falha(nDecl === 0 ? `a função \`${f.fn}\` do funil não existe mais em src/App.jsx` : `a função \`${f.fn}\` do funil é declarada ${nDecl} vezes em src/App.jsx (ambígua)`,
        `ela foi renomeada, duplicada ou removida. Tire a entrada de FUNIL_DO_COMBATE em testes/acoes-do-jogador.mjs (ou troque o nome) e ancore de novo as linhas dela — e ajuste o total do bloco 9 de teste-acoes-do-jogador.mjs, com o motivo escrito`);
      continue;
    }
    /* cada âncora tem de achar UMA chamada, e as âncoras têm de cobrir TODAS
       as chamadas da função: uma chamada nova que ninguém classificou é
       exatamente como a régua começa a mentir a favor */
    const c = conferirChamadas(texto, f.linhas.map((l) => l.ancora));
    for (const a of c.semChamada) {
      divergiu++;
      falha(`a âncora de \`${f.fn}\` não tem exatamente uma chamada de pushMsgs: ${JSON.stringify(a)}`,
        "uma âncora de FUNIL_DO_COMBATE é um trecho do código que COMEÇA numa chamada de `pushMsgs(` e a contém uma só vez (testes/acoes-do-jogador.mjs)");
    }
    for (const a of c.sumidas) {
      divergiu++;
      falha(`a âncora ${JSON.stringify(a)} sumiu do corpo de \`${f.fn}\``,
        `o código dessa chamada mudou (a frase, o nome do que ela empurra) ou a chamada foi embora. Reancore a linha em FUNIL_DO_COMBATE (testes/acoes-do-jogador.mjs) no código novo — e se a chamada sumiu, diga por quê no lugar dela e ajuste o total do bloco 9 de teste-acoes-do-jogador.mjs`);
    }
    for (const a of c.ambiguas) {
      divergiu++;
      falha(`a âncora ${JSON.stringify(a)} aparece mais de uma vez no corpo de \`${f.fn}\``,
        "ela já não distingue uma chamada da outra. Alongue a âncora em FUNIL_DO_COMBATE (testes/acoes-do-jogador.mjs) até ser única — pode começar numa linha acima da chamada");
    }
    for (const a of c.repetidas) {
      divergiu++;
      falha(`duas entradas de \`${f.fn}\` apontam para a MESMA chamada: ${JSON.stringify(a)}`,
        "cada entrada do funil é UMA chamada de pushMsgs. Se duas descrevem o mesmo evento, junte-as; se são eventos distintos, ancore cada uma na sua chamada");
    }
    if (c.soltas > 0 && !c.sumidas.length && !c.ambiguas.length && !c.semChamada.length && !c.repetidas.length) {
      divergiu++;
      falha(`\`${f.fn}\` tem ${c.total} chamadas de pushMsgs e a tabela cobre ${c.total - c.soltas}`,
        `acrescente a linha em FUNIL_DO_COMBATE, com \`ancora\`, \`evento\`, \`voz\` (frase/telegrama/recusa) e \`nasce\` — e ajuste as contas do bloco 9 de teste-acoes-do-jogador.mjs. Se a linha nova for RECUSA, ela vai também para RECUSAS_DO_COMBATE, com a família`);
    }
  }
  if (!divergiu) ok(`as ${FUNIL_DO_COMBATE.length} funções do funil e as suas chamadas conferem com o código, uma âncora por chamada`);

  /* O ANEL NÚCLEO É UMA AFIRMAÇÃO SOBRE O CÓDIGO, não um rótulo: as cinco
     guardas explícitas de combate são a semente do ponto fixo que mediu o
     núcleo. Se uma delas cair, o anel inteiro tem de ser remedido. */
  const guardas = [
    ["resolverAtaqueJogador", /const resolverAtaqueJogador = \(acao, pers\) => \{\s*\n\s*const comb = combateRef\.current;\s*\n\s*if \(!comb/],
    /* v9.270 (K3): `resolverRevide` ganhou um segundo parametro, `aoTerminar` —
       a continuacao que a janela da reacao exige, porque uma funcao sincrona
       nao sabe suspender-se no meio da rodada. A GUARDA NAO MUDOU: o
       `combateRef.current` e o `if (!combPos)` continuam nas mesmas duas
       linhas, e e isso que esta asercao mede. O regex e afrouxado no que a
       assinatura passou a aceitar (parametros) e em nada mais — em especial,
       ele continua a falhar se a guarda desaparecer, que e o unico emprego
       que ele tem. */
    ["resolverRevide", /const resolverRevide = \(persBase[^)]*\) => \{\s*\n(?:\s*\/\*[\s\S]*?\*\/\s*\n)?\s*const combPos = combateRef\.current;\s*\n\s*if \(!combPos\)/],
    ["moverPara", /const moverPara = \(destino\) => \{\s*\n\s*const comb = combateRef\.current;\s*\n\s*if \(!comb\)/],
  ];
  for (const [nome, rx] of guardas) {
    if (!rx.test(APP)) {
      falha(`\`${nome}\` perdeu a guarda de combate que o põe no anel \`nucleo\``,
        `o anel \`nucleo\` de FUNIL_DO_COMBATE afirma que essas funções são MUDAS fora da luta. Se a guarda mudou, re-meça o anel dessa entrada em testes/acoes-do-jogador.mjs (e o total de 11 no bloco 9 de teste-acoes-do-jogador.mjs), com o motivo escrito`);
    }
  }
}

console.log("\n10. as recusas do combate — a âncora e o literal");
{
  let divergiu = 0;
  for (const r of RECUSAS_DO_COMBATE) {
    const { n: nDecl, texto } = corpoDe(APP, r.fn);
    if (nDecl !== 1) {
      divergiu++;
      falha(`a função \`${r.fn}\` (recusa \`${r.familia}\`) ${nDecl === 0 ? "não existe mais" : `é declarada ${nDecl} vezes`} em src/App.jsx`,
        `a recusa mudou de lugar ou sumiu. Reancore a entrada em RECUSAS_DO_COMBATE (testes/acoes-do-jogador.mjs): se sumiu, tire-a e BAIXE o total do bloco 10 de teste-acoes-do-jogador.mjs com o motivo escrito`);
      continue;
    }
    /* a âncora acha UMA chamada no corpo — as «soltas» não importam aqui: a
       agirInterno tem dezenas de chamadas que não são recusa de combate */
    const c = conferirChamadas(texto, [r.ancora]);
    if (c.semChamada.length || c.sumidas.length || c.ambiguas.length) {
      divergiu++;
      falha(`a âncora da recusa \`${r.familia}\` de \`${r.fn}\` ${c.sumidas.length ? "sumiu do corpo" : c.ambiguas.length ? "aparece mais de uma vez" : "não tem exatamente uma chamada de pushMsgs"}: ${JSON.stringify(r.ancora)}`,
        `a recusa mudou de lugar ou de texto. Reancore a entrada em RECUSAS_DO_COMBATE (testes/acoes-do-jogador.mjs): se sumiu, tire-a e BAIXE o total do bloco 10 de teste-acoes-do-jogador.mjs com o motivo escrito`);
    }
    /* e, quando a função é do funil, a recusa é UMA das linhas dele — a mesma
       chamada, com a mesma âncora: as duas tabelas não podem discordar do
       que contam */
    const doFunil = FUNIL_DO_COMBATE.find((f) => f.fn === r.fn);
    if (doFunil && !doFunil.linhas.some((l) => l.ancora === r.ancora)) {
      divergiu++;
      falha(`a recusa \`${r.familia}\` de \`${r.fn}\` não é uma das linhas de ${r.fn} em FUNIL_DO_COMBATE`,
        "as duas tabelas contam a mesma chamada: a âncora da recusa tem de ser igual à âncora de uma linha do funil (testes/acoes-do-jogador.mjs)");
    }
  }
  /* as âncoras que não se movem: um literal por família, para a falha dizer
     QUAL voz de recusa se perdeu — e não só que a contagem mudou.

     A TERCEIRA COLUNA NASCEU EM K2 (16/09), e o motivo fica escrito porque a
     asserção mudou de forma: até aqui toda âncora era procurada no `App.jsx`,
     e isso era verdade por acidente — os literais viviam todos lá. W2 §3 levou
     as frases do golpe para `src/golpe.js` (é a única casa onde um varredor as
     consegue ler), e a âncora que só sabia olhar para um arquivo passou a
     acusar como "sumiu" uma frase que apenas tinha mudado de sítio. Uma âncora
     que não diz ONDE procura mente no dia em que a frase se muda. Omitir a
     coluna continua a significar `App.jsx`, que é o caso das outras oito. */
  const GOLPE = readFileSync("../src/golpe.js", "utf8");
  const fontes = { app: APP, golpe: GOLPE };
  const ancoras = [
    ["alcance", "ninguém está ao alcance do seu golpe"],
    /* redigida em W2 §3: a antiga ("Longe demais — …") media 62 com o nome
       vazio contra um teto de 54. A âncora é a cauda da frase nova, que é a
       única parte que nenhuma das outras três partilha. */
    ["alcance", "m — faltam ", "golpe"],
    ["economia", "Você já usou sua ação nesta rodada"],
    ["economia", "Você já cobriu os"],
    ["teto", "fora de combate uso uma habilidade por vez"],
    ["repeticao", "firma de novo a guarda que já sustenta"],
    /* A1 · B8 (#67): reescrita na voz da mesa; a âncora segue a cauda nova */
    ["turno-guardado", "O Mestre ainda não contou o que você fez"],
    ["conjuracao", "você não consegue conjurar vestindo"],
    ["condicao", "Você não consegue se mover"],
  ];
  for (const [familia, txt, fonte] of ancoras) {
    const onde = fontes[fonte || "app"];
    if (!onde.includes(txt)) {
      divergiu++;
      falha(`sumiu de ${fonte === "golpe" ? "golpe.js" : "App"} a recusa da família \`${familia}\`: "${txt}"`,
        `ou a frase foi reescrita, ou a recusa deixou de existir. Se foi reescrita, atualize o \`literal\` da entrada em RECUSAS_DO_COMBATE; se deixou de existir, tire a entrada, baixe o total do bloco 10 de teste-acoes-do-jogador.mjs e escreva o motivo — uma recusa a menos é mudança de JOGO, não de medida`);
    }
  }
  /* e as cinco famílias que a pauta nomeia continuam nomeadas */
  const familias = new Set(RECUSAS_DO_COMBATE.map((x) => x.familia));
  for (const f of ["alcance", "economia", "teto", "repeticao", "turno-guardado"]) {
    if (!familias.has(f)) {
      divergiu++;
      falha(`a família de recusa \`${f}\` sumiu da tabela`,
        "as cinco famílias vêm da pauta de X4 e são o recorte acordado. Se uma delas deixou de existir no código, tire-a com o motivo escrito em testes/acoes-do-jogador.mjs — nunca em silêncio");
    }
  }
  if (!divergiu) ok(`as ${RECUSAS_DO_COMBATE.length} recusas conferem com o código, em ${familias.size} famílias`);
}

console.log("\n11. a sessão A pelo eixo da frase — a fiação que ela modela");
{
  /* A sessão A″ afirma DUAS coisas sobre o código, e nenhuma delas roda em
     Node: que a recusa empurra o eco do jogador junto, e que ela devolve
     antes do `enviar`. Se qualquer uma cair, o 7/7 sem narração vira outro
     número — e é aqui que isso morde. */
  const bloco = APP.match(/if \(ataque && ataque\.semAlcance\) \{[\s\S]{0,400}?\n    \}/);
  if (!bloco) {
    falha("não consegui ler o bloco da recusa por alcance em aplicarGolpeDoJogador",
      "a forma mudou. Re-meça SESSAO_A_PELA_FRASE em testes/acoes-do-jogador.mjs e re-rode `node testes/sonda-turno-esteril.mjs`");
  } else {
    if (!/autor: "jogador", texto: acao/.test(bloco[0])) {
      falha("a recusa por alcance não empurra mais o eco do jogador",
        "SESSAO_A_PELA_FRASE conta 14 linhas nos 7 turnos (7 ecos + 7 recusas). Se o eco saiu, o número é 7 — atualize `linhas` e `ecos` em testes/acoes-do-jogador.mjs e o bloco 11 de teste-acoes-do-jogador.mjs, com o motivo escrito");
    } else ok("a recusa por alcance segue empurrando o eco do jogador junto");
    if (!/return true;/.test(bloco[0])) {
      falha("a recusa por alcance não devolve mais antes de seguir o turno",
        "é esse `return true` que impede o `enviar(...)` — sem ele o Narrador passa a ser chamado e `chamadasAoNarrador: 0` deixa de ser verdade. Re-meça SESSAO_A_PELA_FRASE em testes/acoes-do-jogador.mjs");
    } else ok("e devolve antes do enviar — o Narrador segue sem ser chamado");
  }
  /* a explicação escrita da tabela (`ondeSai`) cita duas funções: a da
     recusa, que devolve `true`, e a do `enviar`, que ela antecede. As duas
     têm de ser aquelas em que o código de fato mora — por NOME, que é o
     que não se mexe sozinho. (Antes: o número da linha do `enviar`, com um
     «piso» de busca que também era número, e que o App passava por baixo.) */
  const ENVIAR = 'enviar(oEnvelopeDaFicha("combateResolvido", ';
  const donaDoEnvio = funcaoDoTrecho(APP, ENVIAR);
  const donaDaRecusa = funcaoDoTrecho(APP, "if (ataque && ataque.semAlcance) {");
  const citadasNoSai = [...referenciasDe(SESSAO_A_PELA_FRASE.ondeSai)].map((r) => r.split("#")[1]);
  if (!donaDoEnvio) {
    falha("não achei (uma só vez) o `enviar([COMBATE — RESOLVIDO PELO SISTEMA]…)` da porta única",
      "SESSAO_A_PELA_FRASE.ondeSai cita esse envio para explicar por que o Narrador não é chamado na recusa. Reancore e atualize o campo em testes/acoes-do-jogador.mjs");
  } else if (!citadasNoSai.includes(donaDoEnvio)) {
    falha(`o envio ao Narrador mora em \`${donaDoEnvio}\` e a tabela cita ${citadasNoSai.join(", ") || "nenhuma função"}`,
      `troque a referência em SESSAO_A_PELA_FRASE.ondeSai (testes/acoes-do-jogador.mjs) para src/App.jsx#${donaDoEnvio} e a asserção do bloco 11 de teste-acoes-do-jogador.mjs junto`);
  } else ok(`o envio ao Narrador segue em \`${donaDoEnvio}\`, como a tabela cita`);
  if (!donaDaRecusa) {
    falha("não achei (uma só vez) a recusa por alcance do golpe do jogador",
      "SESSAO_A_PELA_FRASE.ondeSai cita a função dela. Reancore o campo em testes/acoes-do-jogador.mjs");
  } else if (!citadasNoSai.includes(donaDaRecusa)) {
    falha(`a recusa por alcance mora em \`${donaDaRecusa}\` e a tabela cita ${citadasNoSai.join(", ") || "nenhuma função"}`,
      `troque a referência em SESSAO_A_PELA_FRASE.ondeSai (testes/acoes-do-jogador.mjs) para src/App.jsx#${donaDaRecusa}`);
  } else ok(`e a recusa que devolve antes dele segue em \`${donaDaRecusa}\`, como a tabela cita`);
}

/* ============================================================
   12. AS REFERÊNCIAS `arquivo#nome` — todas, de todas as tabelas

   O bloco que fecha a troca de número por âncora. As tabelas de
   acoes-do-jogador.mjs apontam para o código por `src/arquivo#nome` em
   qualquer string (o `onde`, o `nasce`, o `alcanca`, o `porque`…). Aqui se
   apanha CADA uma delas, venha de onde vier, e se exige que o nome seja
   declarado UMA vez no arquivo: zero é «sumiu», mais de uma é «ambígua».
   Sem este bloco, a prosa das tabelas voltaria a apodrecer em silêncio —
   que é o que o endereço de linha fazia.
   ============================================================ */
console.log("\n12. as referências `arquivo#nome` das tabelas");
{
  const TABELAS = await import("./acoes-do-jogador.mjs");
  const refs = [...referenciasDe(Object.values(TABELAS))].sort();
  const ler = (arquivo) => (arquivo === "src/App.jsx" ? APP : readFileSync("../" + arquivo, "utf8"));
  let ruins = 0;
  for (const ref of refs) {
    const r = conferirReferencia(ref, ler);
    if (!r.ok) {
      ruins++;
      falha(`${ref}: ${r.motivo}`,
        `a tabela cita \`${ref}\` e o código discorda. Troque a referência (testes/acoes-do-jogador.mjs) para onde a coisa mora agora, ou tire a citação se a coisa deixou de existir — com o motivo escrito`);
    }
  }
  if (!refs.length) falha("nenhuma referência `arquivo#nome` nas tabelas", "a troca de endereço por âncora deveria deixar dezenas; se zeraram, algo apagou as citações");
  else if (!ruins) ok(`as ${refs.length} referências conferem: cada nome é declarado uma vez, no arquivo que a tabela diz`);
}

console.log(maus ? `\n${maus} divergência(s) entre a tabela e o código` : "\ntabela e código de acordo");
process.exit(maus ? 1 : 0);
