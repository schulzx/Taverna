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
      "o código trata de dois jeitos UM botão só — `Atacar`, por `golpeVivo` (src/App.jsx:20718). Se nasceu um segundo, escreva `cliqueChegaFora` na entrada dele em testes/acoes-do-jogador.mjs; se `Atacar` deixou de ser condicional, tire o campo e diga por quê");
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

console.log(maus ? `\n${maus} divergência(s) entre a tabela e o código` : "\ntabela e código de acordo");
process.exit(maus ? 1 : 0);
