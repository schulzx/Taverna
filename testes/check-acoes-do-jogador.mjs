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
import {
  ACOES_DO_JOGADOR, ABERTURA_FORA_DE_ALCANCE, TURNO_ESTERIL, MOTOR_SEM_CHAMADOR,
  NAO_CONTA_COMO_NUMERO, FUNIL_DO_COMBATE, RECUSAS_DO_COMBATE, SESSAO_A_PELA_FRASE,
  acoesComCliqueCondicional,
} from "./acoes-do-jogador.mjs";
const G = await import("../src/grid.js");
const APP = readFileSync("../src/App.jsx", "utf8");
const DESAFIOS = readFileSync("../src/desafios.js", "utf8");
const TURNO = readFileSync("../src/turno.js", "utf8");

let maus = 0;
const falha = (o, oQueFazer) => { maus++; console.log(`  XX  ${o}\n      → ${oQueFazer}`); };
const ok = (o) => console.log("  ok  " + o);

console.log("\n1. as 12 ACOES_PRONTAS e o handler único");
{
  /* o bloco literal, como ele está hoje em src/App.jsx:1071-1084 */
  const bloco = APP.match(/const ACOES_PRONTAS = \[([\s\S]*?)\n\];/);
  if (!bloco) {
    falha("não achei `const ACOES_PRONTAS = [...]` em src/App.jsx",
      "se o painel de Ações foi renomeado ou movido, atualize a âncora deste varredor E o campo `onde` das 12 entradas de ACOES_DO_JOGADOR em testes/acoes-do-jogador.mjs");
  } else {
    const rotulos = [...bloco[1].matchAll(/rotulo:\s*"([^"]+)"/g)].map((m) => m[1]);
    const naTabela = ACOES_DO_JOGADOR.filter((a) => a.fonte === "ACOES_PRONTAS").map((a) => a.rotulo);
    if (rotulos.length !== 12) {
      falha(`src/App.jsx declara ${rotulos.length} ações prontas, a tabela espera 12`,
        "o painel mudou de tamanho: acrescente ou remova a entrada correspondente em ACOES_DO_JOGADOR e reveja o TETO_SEM_MOTOR em teste-acoes-do-jogador.mjs");
    } else ok("são 12 no código, como a tabela diz");

    const faltando = rotulos.filter((r) => !naTabela.includes(r));
    if (faltando.length) {
      falha(`ação pronta sem entrada na tabela: ${faltando.join(", ")}`,
        "acrescente uma entrada em ACOES_DO_JOGADOR com id, combate, caminho e `onde` — e meça o caminho dela antes de declarar");
    } else ok("toda ação pronta do código tem entrada na tabela");

    /* os textos precisam bater: é o texto, não o rótulo, que decide a porta */
    for (const a of ACOES_DO_JOGADOR.filter((x) => x.fonte === "ACOES_PRONTAS")) {
      if (a.texto && !bloco[1].includes(`"${a.texto}"`)) {
        falha(`o texto de "${a.rotulo}" mudou no código`,
          `a tabela declara ${JSON.stringify(a.texto)}; re-meça o caminho dessa ação (o texto é o que casa desafio/agressão) e atualize o campo \`texto\` e o \`emCombate\``);
      }
    }
  }

  /* ---------------- O DENTE QUE DISPAROU, REAPONTADO (X2) ----------------
     X1 escreveu aqui um dente que só podia morder no dia em que X2
     chegasse: "o handler das ACOES_PRONTAS não é mais `setEntrada(a.texto)`
     puro". Ele mordeu, e a mordida era a prova de que a fase funcionou.

     Ele NÃO foi apagado — foi VIRADO DE FRENTE. Antes vigiava a partida
     (o handler ainda ser só a caixa); agora vigia a chegada (o handler
     ainda chamar o motor). É a mesma cerca no mesmo lugar, olhando para
     o outro lado: se alguém devolver o botão `Atacar` para dentro da
     caixa de texto, este dente morde de novo — e é essa regressão que a
     Fase X existe para impedir.

     São TRÊS metades e as três precisam estar de pé, porque o desenho de
     X2 é condicional: o desvio para o motor, o `setEntrada` que sobrou
     para as outras onze e para o fora-de-combate, e o impedimento que
     apaga o botão quando ninguém está ao alcance. */
  const desvioAoMotor = /if \(golpeVivo\) \{ declararGolpe\(alvoDoGolpe && alvoDoGolpe\.nome\); return; \}/.test(APP);
  if (!desvioAoMotor) {
    falha("o botão `Atacar` não chama mais `declararGolpe` no onClick das ACOES_PRONTAS",
      "isto é REGRESSÃO de X2: o clique voltou para dentro da caixa de texto. Se foi de propósito, DEVOLVA `pronta_atacar` a SEM_MOTOR_HOJE e SUBA o TETO_SEM_MOTOR em teste-acoes-do-jogador.mjs, com o motivo escrito — e ponha `cliqueChega: \"caixa\"` de volta em testes/acoes-do-jogador.mjs. A catraca não sobe em silêncio");
  } else ok("o botão `Atacar` segue chamando `declararGolpe`");

  const aindaEnche = /setEntrada\(a\.texto\);/.test(APP);
  if (!aindaEnche) {
    falha("o handler das ACOES_PRONTAS perdeu o `setEntrada(a.texto)`",
      "as outras onze ações e o `Atacar` FORA de combate dependem dele — é pela frase que a briga começa (a porta `agressao` só abre fora da luta). Se o painel mudou de desenho, re-meça `cliqueChegaFora` das 12 prontas em testes/acoes-do-jogador.mjs");
  } else ok("e as outras onze seguem caindo no `setEntrada`");

  const impede = /const impedido = golpeVivo && !vdGolpe\.algumAoAlcance;/.test(APP) && /disabled=\{impedido\}/.test(APP);
  if (!impede) {
    falha("o clique de `Atacar` deixou de ser IMPEDIDO quando ninguém está ao alcance",
      "sem isso o jogador volta a gastar cliques para ouvir \"ninguém está ao alcance\" — a abertura recusa em 10 de 10 plantas. Se a trava mudou de forma, atualize o campo `alcanca` de pronta_atacar em testes/acoes-do-jogador.mjs e o elo 6 do bloco 1-B de teste-acoes-do-jogador.mjs");
  } else ok("e o clique segue impedido quando o veredito recusa");

  /* a exceção do eixo condicional tem de ficar ESCRITA: a tabela declara
     quem se comporta de dois jeitos, e aqui se confere que ela declara
     exatamente quem o código trata de dois jeitos */
  const condicionais = acoesComCliqueCondicional().map((a) => a.rotulo);
  if (condicionais.join() !== "Atacar") {
    falha(`a tabela declara clique condicional em: ${condicionais.join(", ") || "ninguém"}`,
      "o código trata de dois jeitos UM botão só — `Atacar`, por `golpeVivo` (src/App.jsx:20715). Se nasceu um segundo, escreva `cliqueChegaFora` na entrada dele em testes/acoes-do-jogador.mjs; se `Atacar` deixou de ser condicional, tire o campo e diga por quê");
  } else ok("o eixo condicional tem exatamente um membro, e é `Atacar`");
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
  /* o caminho que faz delas as únicas do painel que entram no motor */
  if (!/declararAcaoRapida\(a\.id, m\)/.test(APP)) {
    falha("o despachante das ações rápidas mudou",
      "a tabela afirma `onClick → declararAcaoRapida → adjudicarAcao`; re-meça e atualize o campo `handler` das 8 entradas rápidas");
  } else ok("o despachante segue `declararAcaoRapida`");
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

   POR QUE ELES EXISTEM, e por que agora. O bloco 8 é dívida velha: a
   exclusão do relógio de 45 min carrega um ENDEREÇO desde X1, e o
   endereço mudou DUAS vezes (12959 → 13161 → 13290) sem nada avisar,
   porque nada o re-derivava. Uma régua que aponta a linha errada ensina
   a desconfiar dela.

   Os blocos 9 e 10 são a mesma catraca para a medição nova: o funil e as
   recusas são leitura de TEXTO — a parte da medida que apodrece sozinha.
   Ancoram no que não se move sozinho (o NOME da função, o LITERAL da
   frase) e, onde o número da linha é frágil, contam ocorrências em vez
   de fixá-lo.
   ============================================================ */
const LINHAS_APP = APP.split("\n");
const naLinha = (endereco) => {
  const n = Number(String(endereco).split(":")[1]);
  return Number.isFinite(n) ? (LINHAS_APP[n - 1] || "") : "";
};
/* as declarações de topo do componente, para poder ler o corpo de uma
   função inteira sem regex frágil */
const DECLS = [];
LINHAS_APP.forEach((l, i) => {
  const m = l.match(/^  (?:const|async function|function) ([A-Za-z0-9_$]+)\s*=?\s*(?:async\s*)?(?:\(|function|useCallback|=>)/);
  if (m) DECLS.push({ nome: m[1], ini: i });
});
DECLS.forEach((d, k) => { d.fim = k + 1 < DECLS.length ? DECLS[k + 1].ini : LINHAS_APP.length; });
const declDe = (nome) => DECLS.find((d) => d.nome === nome) || null;
const corpoDe2 = (d) => LINHAS_APP.slice(d.ini, d.fim).join("\n");

console.log("\n8. o relógio de 45 min — o endereço que a exclusão carrega");
{
  const relogio = NAO_CONTA_COMO_NUMERO.find((x) => /relógio/.test(x.o));
  const i = LINHAS_APP.findIndex((l) => /avancarMinutos\(MINUTOS_POR_TURNO\)/.test(l));
  if (i < 0) {
    falha("não achei `avancarMinutos(MINUTOS_POR_TURNO)` em src/App.jsx",
      "o relógio do turno mudou de forma. Reveja a exclusão do relógio em NAO_CONTA_COMO_NUMERO (testes/acoes-do-jogador.mjs): se ele deixou de avançar sozinho, a exclusão perde o motivo e a taxa estéril tem de ser remedida");
  } else if (!relogio || !new RegExp(`:${i + 1}\\b`).test(relogio.porque)) {
    falha(`a exclusão do relógio aponta outra linha; o código tem o avanço em src/App.jsx:${i + 1}`,
      `troque o número no campo \`porque\` do relógio em NAO_CONTA_COMO_NUMERO (testes/acoes-do-jogador.mjs) para ${i + 1}, e a asserção do bloco 4 de teste-acoes-do-jogador.mjs junto — com o motivo escrito ao lado, que é a lei da casa`);
  } else ok(`o endereço do relógio confere (src/App.jsx:${i + 1})`);
  /* e a condição que o mantém FORA do combate — se ela cair, o relógio
     passa a andar em luta e a sessão A deixa de ser estéril por definição */
  if (!/if \(!combateRef\.current && !acampadoRef\.current && !masmorraRef\.current\) \{/.test(APP)) {
    falha("a guarda que impede o relógio de andar em combate mudou",
      "a sessão A supõe que nenhum número muda no turno de combate. Se o relógio passou a andar em luta, re-rode `node testes/sonda-turno-esteril.mjs` e refaça TURNO_ESTERIL.sessaoA_hoje e SESSAO_A_PELA_FRASE, com o motivo escrito");
  } else ok("e o relógio segue parado dentro da luta");
}

console.log("\n9. o funil do combate — as funções que chamam pushMsgs");
{
  /* o endereço do funil, que X3b deixou por escrito e X4 herdou */
  const iPush = LINHAS_APP.findIndex((l) => /^  const pushMsgs = useCallback\(/.test(l));
  if (iPush < 0) {
    falha("não achei a declaração de `pushMsgs` em src/App.jsx",
      "o funil das linhas mudou de forma ou de nome. Reveja o cabeçalho do bloco 6 de testes/acoes-do-jogador.mjs e re-meça FUNIL_DO_COMBATE — sem o funil, o eixo da frase não tem o que contar");
  /* v9.273 (K4): 7553 -> 7550. v9.273 (K4): -3 linhas. A fila de pilulas da ficha (1993-2003) passou a consumir a peca `PilulaDeEscolha` e encolheu 3 linhas; o codigo abaixo dela andou junto e nada mais mudou. E a TERCEIRA vez em tres
     ciclos que esta catraca cobra um deslocamento que nao e defeito nenhum
     — o item da pauta que propoe trocar numero por ancora de texto leva
     agora as tres cobrancas escritas.

     v9.270 (K3): 7504 -> 7553. A janela da reacao acrescentou 49 linhas ACIMA
     deste ponto — o importe dos tres modulos novos e o bloco de refs de
     `tentarReacaoNoGolpe`. O `pushMsgs` nao andou por vontade propria, e o
     que ele guarda continua a ser o mesmo: endereco re-medido, assercao
     intacta. (E a segunda vez em dois ciclos que esta catraca cobra o
     deslocamento; o item da pauta que propoe trocar numero por ancora de
     texto ja leva as duas cobrancas escritas.) */
  } else if (iPush + 1 !== 7550) {
    falha(`pushMsgs saiu de src/App.jsx:7550 e agora está em :${iPush + 1}`,
      `atualize o cabeçalho do bloco 6 em testes/acoes-do-jogador.mjs (e a linha que a sonda imprime) para :${iPush + 1}. O endereço é citado como mapa; mapa errado custa a próxima medição`);
  } else ok("pushMsgs segue em src/App.jsx:7550, como o mapa de X3b diz");

  let divergiu = 0;
  for (const f of FUNIL_DO_COMBATE) {
    const d = declDe(f.fn);
    if (!d) {
      divergiu++;
      falha(`a função \`${f.fn}\` do funil não existe mais em src/App.jsx`,
        `ela foi renomeada ou removida. Tire a entrada de FUNIL_DO_COMBATE em testes/acoes-do-jogador.mjs (ou troque o nome) e re-meça as linhas dela — e ajuste o total do bloco 9 de teste-acoes-do-jogador.mjs, com o motivo escrito`);
      continue;
    }
    if (d.ini + 1 !== Number(f.onde.split(":")[1])) {
      divergiu++;
      falha(`\`${f.fn}\` mudou de endereço: a tabela diz ${f.onde} e o código dá src/App.jsx:${d.ini + 1}`,
        `troque o campo \`onde\` dessa entrada em FUNIL_DO_COMBATE (testes/acoes-do-jogador.mjs) — e confira os endereços das linhas dela, que andaram junto`);
    }
    /* o número de chamadas tem de bater: uma linha nova que ninguém
       classificou é exatamente como a régua começa a mentir a favor */
    const n = (corpoDe2(d).match(/pushMsgs\(/g) || []).length;
    if (n !== f.linhas.length) {
      divergiu++;
      falha(`\`${f.fn}\` tem ${n} chamadas de pushMsgs e a tabela declara ${f.linhas.length}`,
        `acrescente (ou tire) a linha em FUNIL_DO_COMBATE, com \`evento\`, \`voz\` (frase/telegrama/recusa) e \`nasce\` — e ajuste as contas do bloco 9 de teste-acoes-do-jogador.mjs. Se a linha nova for RECUSA, ela vai também para RECUSAS_DO_COMBATE, com a família`);
    }
    /* e cada endereço declarado tem de cair mesmo numa chamada */
    for (const l of f.linhas) {
      if (!/pushMsgs\(/.test(naLinha(l.onde))) {
        divergiu++;
        falha(`${l.onde} não é mais uma chamada de pushMsgs ("${l.evento}")`,
          `o corpo de \`${f.fn}\` andou. Re-meça os endereços das linhas dessa entrada em FUNIL_DO_COMBATE (testes/acoes-do-jogador.mjs) — e se a linha sumiu, diga por quê no lugar dela`);
      }
    }
  }
  if (!divergiu) ok(`as ${FUNIL_DO_COMBATE.length} funções do funil e as suas chamadas conferem com o código`);

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

console.log("\n10. as recusas do combate — o literal e o endereço");
{
  let divergiu = 0;
  for (const r of RECUSAS_DO_COMBATE) {
    if (!/pushMsgs\(/.test(naLinha(r.onde))) {
      divergiu++;
      falha(`${r.onde} (recusa \`${r.familia}\`, ${r.fn}) não é mais uma chamada de pushMsgs`,
        `a recusa mudou de lugar ou sumiu. Re-meça a entrada em RECUSAS_DO_COMBATE (testes/acoes-do-jogador.mjs): se sumiu, tire-a e BAIXE o total do bloco 10 de teste-acoes-do-jogador.mjs com o motivo; se mudou de linha, troque o endereço`);
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
    ["turno-guardado", "ainda não foi contado, e a mesa não anda sem a palavra do Mestre"],
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
  /* o endereço do `enviar` que a tabela cita: se ele andou, a explicação
     escrita aponta para o lugar errado */
  const iEnviar = LINHAS_APP.findIndex((l, i) => i > 11864 && /^\s*enviar\(`\[COMBATE — RESOLVIDO PELO SISTEMA\]/.test(l));
  if (iEnviar < 0) {
    falha("não achei o `enviar([COMBATE — RESOLVIDO PELO SISTEMA]…)` da porta única",
      "SESSAO_A_PELA_FRASE.ondeSai cita esse envio para explicar por que o Narrador não é chamado na recusa. Re-meça e atualize o campo em testes/acoes-do-jogador.mjs");
  } else if (!new RegExp(`:${iEnviar + 1}\\b`).test(SESSAO_A_PELA_FRASE.ondeSai)) {
    falha(`o envio ao Narrador está em src/App.jsx:${iEnviar + 1} e a tabela cita outro número`,
      `troque o endereço em SESSAO_A_PELA_FRASE.ondeSai (testes/acoes-do-jogador.mjs) para ${iEnviar + 1} e a asserção do bloco 11 de teste-acoes-do-jogador.mjs junto`);
  } else ok(`o envio ao Narrador segue em src/App.jsx:${iEnviar + 1}, como a tabela cita`);
}

console.log(maus ? `\n${maus} divergência(s) entre a tabela e o código` : "\ntabela e código de acordo");
process.exit(maus ? 1 : 0);
