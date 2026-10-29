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
  const aFrente = LINHAS_APP.slice(Math.max(0, i - 4), i + 1).join("\n");
  if (i < 0 || !/oMundoAndaNoTurno\(\{ combate: combateRef\.current, acampado: acampadoRef\.current, masmorra: masmorraRef\.current \}, acao\);/.test(aFrente) || !/if \(doMundo\.anda\) \{/.test(aFrente)
    || oMundoAndaNoTurno({ combate: { rodada: 1 } }, "ando pela praça").anda !== false) {
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
  /* R3: 7149 -> 7251. As 102 linhas são o que a tela principal ganhou no
     redesenho (A soleira, A voz, o gesto do campo, a porta das linhas de
     sistema) — e 95 delas entram ACIMA desta função, entre a importação e
     o corpo do componente. O funil não se moveu por vontade própria nem
     mudou de forma: endereço re-medido, asserção intacta.
     (É a QUINTA vez em cinco ciclos que esta catraca cobra um deslocamento
     que não é defeito nenhum. O item da pauta que propõe trocar número por
     âncora de texto leva agora a quinta cobrança.)

     E4: 7135 -> 7149. As treze linhas são o comentário da chave
     `economia` que passou a nascer em `equiparCombate` (:4929) — a luta
     nascia sem orçamento e a rodada 1 inteira era de graça. Nada se
     moveu por vontade própria: tudo o que está abaixo de :4929 andou
     treze linhas, e este endereço é um deles.

     E3: 7550 -> 7135. A tela da batalha e as duas gavetas saíram do
     App.jsx (-450 linhas) e o funil andou junto, sem mudar de forma. É a
     QUARTA vez em quatro ciclos que esta catraca cobra um deslocamento que
     não é defeito nenhum. */
  /* R4b: 7251 → 7258. As sete linhas são o saldo desta região — a lápide
     dos doze verbos é oito linhas mais longa que a tabela que substituiu,
     e o estado da gaveta de `Ações` levou uma. O funil não se moveu por
     vontade própria nem mudou de forma: endereço re-medido, asserção
     intacta. (É a SEXTA vez em seis ciclos que esta catraca cobra um
     deslocamento que não é defeito nenhum. O item da pauta que propõe
     trocar número por âncora de texto leva agora a sexta cobrança — com
     um agravante desta etapa: foram âncoras de TEXTO, no bloco 1 acima,
     que deram o `Atacar` do painel por vivo durante um ciclo inteiro
     depois de E3 o ter tornado inalcançável. Trocar número por texto não
     basta; é preciso âncora que meça ALCANCE.) */
  /* A PROMOÇÃO (frontend, MM8e, 30/09): 8184 -> 8186, +2. Dois dos quatro
     pontos novos desta etapa (o ref `elencoSaveRef`, logo abaixo de
     `npcsRef`; a saída na pauta, dentro de `pautaDoTurno`) nascem ACIMA
     deste ponto; os outros dois (os vistos por turno; a promoção ao virar
     o dia) nascem abaixo dele e não contam aqui. Re-medido por esta
     própria catraca; nada somado de cabeça. */
  /* A LUTA SEM ESPADA (frontend, MM9, 30/09): 8186 -> 8198, +12. O ref e o
     helper da impressão (`impressionouRef`/`impressionouAgora`), logo
     abaixo de `intencaoRef`, nascem ACIMA deste ponto — junto com o import
     de `sem-espada.js` no topo do arquivo (+5) — e tudo abaixo andou
     junto. Re-medido por esta própria catraca; nada somado de cabeça.
     O CRIME (frontend, MM10, 30/09): 8198 -> 8216, +18. Nada nasce ENTRE
     este ponto e o anterior: o que somou foram o import de `crime.js` no
     topo (+1), os refs da lei logo abaixo de `elencoSaveRef` (+6) e a
     pauta do crime dentro de `pautaDoTurno` (+11) — os três ACIMA daqui.
     Re-medido por esta própria catraca; nada somado de cabeça.
     AS PERGUNTAS AO MESTRE (frontend, MM14, 30/09): 8216 -> 8237, +21. A
     mesa de PERGUNTOU (`nomesDaMesa`, fc/gp/mc, `juntarRespostas`) nasce
     ACIMA de `pushMsgs`, dentro de `pautaDoTurno` — mesmo delta desta
     etapa em FUNIL_DO_COMBATE/RECUSAS_DO_COMBATE. Re-medido por esta
     própria catraca; nada somado de cabeça.
     OS DOIS CANAIS ANTIGOS (frontend, MM14, 30/09): 8237 -> 8238, +1. O
     import de `tarefas-antigas.js` no topo do arquivo empurra tudo abaixo
     dele +1 — o mesmo degrau que qualquer import novo no topo sempre dá.
     Re-medido por esta própria catraca; nada somado de cabeça.
     A GENTE NO LUGAR CERTO, COM O NOME CERTO (frontend, MM14 · 9b/10a,
     30/09): 8238 -> 8239, +1. O campo `viuAntes` de `pessoasDaCena` nasce
     ACIMA de `pushMsgs` no arquivo; o resto da etapa (o helper do
     homônimo, as portas do registo, o mural) fica ABAIXO dele. Re-medido
     por esta própria catraca; nada somado de cabeça.
     A EXTRAÇÃO DE fichasDaMesa (frontend, MM14 · o resto do nº 6, 30/09):
     8239 -> 8257, +18. O cálculo das três fichas (cidade, gente, mercado)
     mudou-se de `pautaDoTurno` para `fichasDaMesa`, uma função nova que
     nasce ACIMA de `pushMsgs` no arquivo — para que o sinal do oráculo
     também pudesse perguntar às fichas antes de rolar o d100. Re-medido
     por esta própria catraca; nada somado de cabeça.
     O LUGAR PELO CRONISTA (frontend, MM15 (1), 30/09): 8257 -> 8262, +5. A
     decisão de `registrarLugar` (o "cidade" do Cronista) mudou-se para
     `lerLugarDito` (lugar.js): a assinatura ganhou o parâmetro `fonte` e o
     comentário da palavra combinada saiu, porque a regra agora mora lá. As
     cinco linhas nascem ACIMA de `pushMsgs` no arquivo, e tudo abaixo andou
     junto. Re-medido por esta própria catraca; nada somado de cabeça.
     A LIGAÇÃO NÃO É O MESTRE (frontend, MM15 (3), 30/09): 8262 -> 8279,
     +17. O bloco de `retratoDoJogo`/`soltosDoTurno`/`aplicarRetrato` nasce
     entre `aMesaEspera` e `salvar` — ACIMA de `pushMsgs`, que mora dentro
     de `salvar`. Re-medido por esta própria catraca; nada somado de
     cabeça.
     O SEGREDO GUARDADO (frontend, MM15 (4), 30/09): 8279 -> 8285, +6. O
     import de segredo-guardado.js e o veto na pauta (logo após
     vetosDaAbertura) nascem ACIMA de `pushMsgs` no arquivo. Re-medido por
     esta própria catraca; nada somado de cabeça.
     O COMPANHEIRO DE ANTES (frontend, 01/10): 8285 -> 8286, +1. O import
     de companheiro-inicial.js no topo do arquivo empurra tudo abaixo dele
     +1 — o mesmo degrau que qualquer import novo no topo sempre dá. A
     fiação do companheiro em si nasce dentro de `iniciar`, bem abaixo de
     `pushMsgs`, e por isso não soma nada aqui. Re-medido por esta própria
     catraca; nada somado de cabeça.
     (v9.350 · o como chega) MM16 nº 5, 05/10: 8286 -> 8299, +13. A economia da cidade foi
     para a seção dela (+4, comentário do porquê) e `cederNaCena` entrou
     no fim de `pautaDoTurno` (+9) — os dois ACIMA de `pushMsgs`. Só o
     endereço andou. Re-medido por esta própria catraca.
     (v9.351 · a Nave como destino) MM16 nº 2, 05/10: 8299 -> 8326, +27. O
     import de boca.js no topo (+1), a guarda da ida em `alvoLocalPedido`
     (+7) e a chegada à boca em `talvezChegarSozinho` (+19) — os três ACIMA
     de `pushMsgs`. Só o endereço andou. Re-medido por esta própria catraca. */
  /* (v9.352 · a masmorra na pauta) MM16 nº 4, 06/10: 8326 -> 8336, +10 —
     a seção MASMORRA em `pautaDoTurno` (+6), o Local do rodapé (+5) e a
     recusa de combate que saiu de `registrarLugar` (-1), os três ACIMA de
     `pushMsgs`. Só o endereço andou. Re-medido por esta própria catraca. */
  /* (v9.354 · a luz e a sombra) 06/10: 8336 -> 8365, +29 — o import de
     luz.js (+1), o mapa de luz junto de `fichaViva` (+23) e a seção A LUZ
     em `pautaDoTurno` (+5), os três ACIMA de `pushMsgs`. Só o endereço
     andou. Re-medido por esta própria catraca. */
  /* (v9.356 · a região na criação) MM17 B, 06/10: 8365 -> 8366, +1 — o
     import de regiao.js, ACIMA de `pushMsgs`. Só o endereço andou.
     Re-medido por esta própria catraca. */
  /* (v9.358 · a masmorra sem a cidade) MM17 C2, 06/10: 8366 -> 8384, +18 — o
     import de masmorra-sem-cidade.js (+1), o horizonte em `fichasDaMesa`
     (+7) e a ficha do lugar em `pautaDoTurno` (+6), os três ACIMA de
     `pushMsgs`; a cena do system (+4) também. Só o endereço andou.
     Re-medido por esta própria catraca. */
  /* (v9.359 · a Bolsa em duas linhas) 06/10: 8384 -> 8393, +9 — a linha
     dos equipamentos na mochila (+3) e a do item da Bolsa (+6), as duas no
     PainelLateral, ACIMA de `pushMsgs`. Só o endereço andou. Re-medido por
     esta própria catraca. */
  /* (A1 · B1 · o relato sai do App) 10/10: 8393 -> 8275, -118 — o
     `BlocoSistema`, as portas da seta e o comentário delas saíram para
     `painel-relato.jsx`, ACIMA disto no arquivo. Só o endereço andou. */
  /* (A1 · B2–B9 · o recibo e o fim da luta) 10/10: 8275 -> 8537, +262 —
     as funções puras do recibo (~+95, logo depois de `calou`, no topo do
     arquivo) e os refs e ajudantes do antes da ficha (~+167, logo ACIMA
     de `pushMsgs`). Só o endereço andou; re-medido pelo diff de App.jsx
     contra a árvore de B1, e conferido por esta própria catraca. */
  /* (A1 · as pontas, o oficial) 10/10: 8537 -> 8627, +90 — as duas puras
     do fim (`horaCheiaFalada`, `retratoComOsFinais`, logo antes de
     `fimDaLutaDe`, +32 com o comentário da folga), e os refs e ajudantes
     do que a tela mostrou (`retratoDoFimRef`, `mostradoRef`,
     `oQueATelaMostra`, ~+58) ACIMA de `pushMsgs`. Só o endereço andou;
     re-medido pelo diff de App.jsx contra o HEAD (b7c31dd). */
  /* (v9.371 · a marcha única, a fiação) 10/10: 8627 -> 8628, +1 — o
     import de `partidaNaRegiao` (marcha.js) entrou na linha 156, no topo
     do arquivo, e tudo abaixo andou uma linha. Só o endereço andou;
     re-medido por esta própria catraca, que deu o número no erro. */
  /* (MM18 · a fiação da escuta e do mural, o frontend) 11/10: 8628 -> 8653,
     +25 — o import de `escuta.js` (+1, linha 194), os refs `escutaRef` e
     `adiadosEscutaRef` com o comentário (+7, junto de `escadaRef`) e a
     linha do RUMO em `pautaDoTurno` (+17), tudo ACIMA de `pushMsgs`. Só o
     endereço andou; re-medido pelo diff de App.jsx contra o HEAD (7452e3a). */
  /* (nexo · as três fiações, o frontend) 11/10: 8653 -> 8658, +5 — o import de
     saga.js ficou na mesma linha, e o `falouComRef` com o comentário (+4,
     junto de `espinhaRef`) e a linha da mente da ameaça (+1) entraram ACIMA
     de `pushMsgs`. Só o endereço andou; re-medido pelo diff de App.jsx
     contra o HEAD (ecc0346). */
  /* (v9.393 · a fiação da campanha que prende, o frontend) 11/10: 8658 -> 8702,
     +44 — os imports de prometido.js, fecho.js e fios-da-estrada.js (+4), os
     três refs novos (+8) e o momento do fio, O QUE VOLTA e O FECHO em
     `pautaDoTurno` (+32), tudo ACIMA de `pushMsgs`. Só o endereço andou;
     re-medido pelo diff de App.jsx contra o HEAD (ebf9b68). */
  /* (MM11 #5, a bolsa da frase, 11/10: o import, o ref do veto, o preço do balcão, o veto na pauta e o meDeve, acima): 8736 -> 8761, +25 — re-medido pelo diff de App.jsx contra o HEAD; só o endereço andou. */
  /* (MM11 #5, a leitura de pessoa, 11/10: o import de leitura-de-pessoa.js, acima): 8761 -> 8762, +1 — re-medido pelo diff de App.jsx contra o HEAD; só o endereço andou. */
  /* (MM (a luta tem saída, o frontend) 11/10): 8702 -> 8736, +34 — o import de saida-da-luta.js (+3), o mundo do rumo (+5, MM19), os
     dois refs da luta sem saída (+6), a vista da luta em `pautaDoTurno` (+17) e
     a frase do fecho em `notarFechoDaLuta` (+3), tudo ACIMA de `pushMsgs`. Só o endereço andou; re-medido pelo diff de App.jsx contra o
     HEAD (e5b6736; o App.jsx é o mesmo de c3de7af). */
  /* (MM-C · C0, as mãos do coração, o frontend, 11/10: o alvo do golpe, o veto da luta sem painel, a ordem do ato, os fatos e o segredo no mundo das missões, o sítio do marco, o herói no registo e a frase anterior da bolsa): 8762 -> 8795, +33 — os helpers de módulo da conversa (+13), os refs de turno (+11), o veto na pauta (+3) e o sítio do marco (+6), ACIMA de `pushMsgs`. Só o endereço andou; re-medido pelo diff de App.jsx contra o HEAD (0f4cede). */
  /* (MM-C · C1, o núcleo, o frontend, 11/10: o import de nucleo.js, os três refs, nucleoAgora/nucleoEmCena e a linha QUEM É em pautaDoTurno, acima): 8795 -> 8850, +55 — o import (+1), os refs (+7) e nucleoAgora/nucleoEmCena (+34) e QUEM É na pauta (+13), ACIMA de `pushMsgs`. Só o endereço andou; re-medido pelo diff de App.jsx contra o HEAD (309c8b1). */
  /* (MM-C · C2, as subtramas, o frontend, 11/10: o import de subtramas.js, os quatro refs, subtramasAgora/contextoDoCoracao, a mão do vilão e QUEM CARREGA em pautaDoTurno, acima): 8850 -> 8910, +60 — o import (+1), os refs (+8), subtramasAgora/contextoDoCoracao (+31), a mão do vilão (+2) e QUEM CARREGA (+18), ACIMA de `pushMsgs`. Só o endereço andou. */
  /* (MM-C · C6, a fogueira ligada, o oficial, 11/10: o import do painel e dos cinco do motor, o LimiteDaFogueira, o estado da noite e a ficha do envio em aplicarResposta, tudo ACIMA): 8910 -> 8933, +23 — o import (+1), o LimiteDaFogueira (+11) e o estado da noite (+11), ACIMA de pushMsgs. Só o endereço andou; re-medido pelo diff de App.jsx contra o HEAD (42b2cb1). */
  /* (MM-C · 7.ª sessão de prova, a fiação, o frontend, 12/10: os imports, os dois refs da chegada inferida, a régua do querPartir, o naoParte do resolver e o porteiro do mural, tudo ACIMA): 8933 -> 8949, +16 — os dois refs (+9), o querPartir (+3) e a chegada inferida (+4), ACIMA de pushMsgs. Só o endereço andou; re-medido pelo diff de App.jsx contra o HEAD (5f51baf). */
  /* (o Narrador só narra, E1 — a fiação, o frontend, 12/10: os imports, os dois refs dos nomes à mão, o fatorDoPouso, o preço comum em fichasDaMesa, fichasDoOraculo, a rua e os nomes em pautaDoTurno, tudo ACIMA): 8949 -> 9001, +52. Só o endereço andou; re-medido pelo diff de App.jsx contra o HEAD (5398c7b). */
  /* (os consertos de motor da 8.ª sessão, a fiação, o frontend, 12/10: a jornada sem destino em talvezChegarSozinho, ACIMA): 9001 -> 9004, +3. Só o endereço andou; re-medido pelo diff de App.jsx contra o HEAD (c5142cf). */
  /* (os consertos de motor da 9.ª sessão, a fiação, o frontend, 12/10: a moeda do mundo, a cidade de contextoDoCoracao e as bancas da cena em fichasDaMesa, tudo ACIMA): 9004 -> 9016, +12. Só o endereço andou; re-medido pelo diff de App.jsx contra o HEAD (7419ced). */
  /* (F2a · EM CENA, a fiação, o frontend, 12/10: o import de em-cena.js e o contexto da lista antes de pautaDoTurno, tudo ACIMA): 9016 -> 9064, +48. Só o endereço andou; re-medido pelo diff de App.jsx contra o HEAD (e6edf61). */
  /* (F2b · F2c · F2d, a fiação, o oficial, 12/10: os imports de fichas.js e painel-fichas.jsx, o LimiteDasFichas e a altura da janela, o estado das fichas ao lado de entrada, o ref da memória, e as fichas da cena antes de pautaDoTurno, tudo ACIMA): 9064 -> 9189, +125. Só o endereço andou; re-medido pelo diff de App.jsx contra o HEAD (7a890f3). */
  /* (MM17 · o mapa vivo ligado, o oficial, 12/10: os imports de mapa-vivo.js e painel-mapa-vivo.jsx, o LimiteDoMapa e a aba Mapa que abre o mapa vivo, tudo ACIMA) 9189 -> 9214, +25; só o endereço andou. */
  /* (os pendentes ligados, o oficial, 13/10: o import de chegadaDaViagem, +1, e a reserva do LimiteDasFichas, +3, ACIMA; o contexto do paradeiro no Cronista, +6, também acima destes) 9214 -> 9218, +4; só o endereço andou. */
  /* (a 10.ª sessão ligada, o oficial, 13/10: o sinal da procura de gente, +6, o longe do EM CENA, +4, e o objeto do teste em ctxDesafio, ACIMA ou entre estes; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD cc0770a): 9218 -> 9222, +4. */
  /* (S10b · a abertura por situação e o kit inicial, o oficial, 13/10: o import de kit-inicial.js, +2, a criação, +3, e equiparCombate/montarGrid, +10, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 341e2cd): 9222 -> 9237, +15. */
  } else if (iPush + 1 !== 8500) { /* (trilha A, o prelúdio no motor, o oficial, 29/10: o estado e o aplicar do prelúdio, ACIMA, e o trecho de enviar da frase às bocas com os 92 nomes (funções e imports) que só ele lia, que saíram; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 374ddca, à mão): 8537 -> 8500. */ /* (trilha A, o pedido no motor, o oficial, 29/10: o estado e o aplicar do pedido, +9 ACIMA, e o trecho de enviar da pauta ao system, que saiu, -263; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 78caaa9) */ /* (trilha A, a praça do instante, o oficial, 29/10: o estadoDaPauta passou a uma linha, -2 ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 895686b) */ /* (trilha A, a pauta no motor, o oficial, 29/10: a pautaDoTurno e as oito que só ela chamava saíram do App, -545 no saldo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD f281a2c) */ /* (trilha A, o glifo do gênero, o oficial, 29/10: GLIFO_DO_GENERO saiu de TelaMundo para o módulo com o comentário, +5 ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD df17ea4) */ /* (trilha A, os recuos do gênero, o oficial, 29/10: o import de cenario.js, duas linhas, ACIMA; +2, só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD a7497e3) */  /* (T2-A, o golpe no corpo no motor, o oficial, 28/10: as duas portas viraram uma linha cada, -49 no saldo ACIMA ou entre; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 5917ac8, à mão): 9083 -> 9069. */ /* (trilha A, T2-A, o rodapé no motor, o oficial, 28/10: +1 import no topo e −1 linha no rodapé; re-medido pelo diff contra 2137ae7) */ /* (trilha A, o tempo do turno no motor, o oficial, 28/10: o relógio e o passo na cidade saíram para src/motor/tempo-do-turno.js, −28 linhas acima; re-medido pelo diff contra 7a0d8b2) */ /* (trilha A, o Juiz que corrige, o oficial, 28/10: o import de motor/correcao-do-juiz.js e os refs do veredito e do livro de vetos, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 49cbd29): 9099 -> 9110, +11. */ /* (T1-A 9.ª fatia, o oficial, 28/10: o gatilho, o pedido e o aceito do Cronista foram para motor/cronista-do-turno.js, e o import dele, ACIMA ou dentro; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 760fe1b): 9098 -> 9099, +1. */ /* (T1-A 8.ª fatia, 2, o oficial, 28/10: o turno do mundo, o sino, o chão e a escuta foram para motor/antes-do-mestre.js, e o import dele, +2 no saldo; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD aac1912): 9094 -> 9098, +4. */ /* (T1-A 8.ª fatia, 1, o oficial, 28/10: a nêmesis, os vistos, o trabalho, a queda e a entrega saíram do aplicarResposta para motor/entrega-do-turno.js, e o import dele, +1 ACIMA e -83 no saldo; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD a9ef8cf): 9093 -> 9094, +1. */ /* (T1-A 7.ª fatia, 2, o oficial, 28/10: a sessão como arquivo — os imports e os refs da sessão, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD c866d6a): 9080 -> 9093, +13. */ /* (T1-A 7.ª fatia, 1, o oficial, 28/10: o perigo e a quase-morte saíram do aplicarResposta para motor/fecho-da-resposta.js, e o import dele, +1, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 3ec3364): 9079 -> 9080, +1. */ /* (T1-A 4.ª fatia, 3, o oficial, 28/10: o famaAtual que lê a ficha viva, +3 no comentário, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 4f5399c) */ /* (T1-A 3.ª fatia, 1, o oficial, 28/10: o registrarLugar e o bloco do mapa saíram do App para motor/meio-do-turno.js, -119 no saldo, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD d776408) */ /* (T1-A 2.ª fatia, o oficial, 27/10: o import do juízo do Cronista, +1, ACIMA, e o cronistaDoTurno a ler o aceito com a tabela da fé fora do App, -4 no saldo; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 4617715) */ /* (T1-A 2, o aplicar sai do App, o oficial, 27/10: a primeira fatia do aplicarResposta foi para src/motor/aplicar.js, -290 linhas, e os efeitos num lugar só, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD) */ /* (T1-A 1, a semente no App, o oficial, 27/10: a sorte do turno e o dado da tela, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD) */ /* (T0-A 3/3, o oficial, 27/10: o comentário do relógio que lê do estado, +2, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra a cópia de antes da etapa): 9337 -> 9339, +2 */ /* (T0-A 2/3, o oficial, 27/10: o gancho useVistaDoEstado fora do componente e o estadoRef no topo de Taverna(), +24, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra a cópia de antes da etapa): 9313 -> 9337, +24 */ /* (T0-A, o oficial, 27/10: o import de estado.js, +2, o lerSave fora do componente, +9, a versão no retrato e o v2 na gravação, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra a cópia de antes da etapa): 9304 -> 9313, +9 */ /* (a 12.ª sessão no motor, o backend, 19/10: o custo das tentativas falhadas em chamarModelo, +4, o mostrado do rumo, +2, e o veto da viagem que não houve, +7, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 806ef83): 9298 -> 9304, +6 */ /* (onda 2 do custo, o frontend, 14/10: o ref dos sinais do turno e o temOQueGovernar, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 2b9e82b): 9275 -> 9298. */ /* (v9.470, onda 1 do custo, o frontend, 13/10: o ref da leitura do Cronista, +5, ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 4b72a82): 9270 -> 9275. */ /* (v9.465, o frontend, 13/10: o pedido na ordem do cache em chamarMestre, +8, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 842adc7): 9262 -> 9270, +8. */ /* (v9.463, o oficial, 13/10: o apontado da agressão e a planta pelo lugar, +6, tudo ACIMA) */ /* (v9.461 ligada, o oficial, 13/10: elencoDoCoracao e cidadeDoCoracao, +13, o QUEM É, e a espinha e os sítios do EM CENA, +5, tudo ACIMA; só o endereço andou, re-medido pelo diff de App.jsx contra o HEAD 69ad49f): 9237 -> 9256, +19. */
    falha(`pushMsgs saiu de src/App.jsx:8500 e agora está em :${iPush + 1}`,
      `atualize o cabeçalho do bloco 6 em testes/acoes-do-jogador.mjs (e a linha que a sonda imprime) para :${iPush + 1}. O endereço é citado como mapa; mapa errado custa a próxima medição`);
  } else ok("pushMsgs segue em src/App.jsx:8500, como o mapa de X3b diz");   /* A GENTE QUE PESA, MEDIDA E CACHEADA (frontend, MM8c-2, 30/09): 8174 ->
     8184, +10. O cache por identidade (`elencoCacheRef`, logo após
     `nomesDoElenco`) somou 8 linhas onde havia 1, ACIMA de `pushMsgs` no
     arquivo, e tudo abaixo andou junto. Re-medido por esta própria catraca;
     nada somado de cabeça.
     A GENTE QUE PESA (frontend, MM8c-2, 30/09): 8168 -> 8174, +6. O
     import de `elenco.js` e o contexto/nomes do elenco (`contextoDoElenco`,
     `nomesDoElenco`) entraram ACIMA de `pushMsgs` no arquivo, e tudo abaixo
     andou junto. Re-medido por esta própria catraca; nada somado de cabeça.
     O MUNDO PUXA O HERÓI (frontend, MM13, 30/09): 8145 -> 8168, +23. A
     fiação da abertura entra em `pautaDoTurno` (o veto do mural e o fio da
     principal) ACIMA de `pushMsgs` no arquivo, e tudo abaixo andou junto.
     Re-medido por esta própria catraca; nada somado de cabeça.
     OS TETOS DAS PESSOAS (frontend, MM8c-1, 29/09): 8142 -> 8145, +3. A
     ref nova da recência (`npcTurnoNoLoadRef`, ao lado de `npcTurnoRef`)
     nasce três linhas acima de `pushMsgs` no arquivo, e tudo abaixo andou
     junto. Re-medido por esta própria catraca; nada somado de cabeça.
     A GENTE POR DENTRO (frontend, MM8a, 29/09): 8125 -> 8142, +17. A
     fiação de `genteParaPauta` (gente-por-dentro.js) entrou em
     `pautaDoTurno`, logo depois de `fichaParaPauta` — um import no topo
     (+1) e o try/catch de dezesseis linhas (+16) —, e tudo abaixo de
     `pushMsgs` andou junto. Re-medido por esta própria catraca; nada
     somado de cabeça.
     A CIDADE POR DENTRO (frontend, MM12, 29/09): 8111 -> 8125, +14. A
     fiação de `fichaParaPauta` (cidade-por-dentro.js) entrou em
     `pautaDoTurno` — um import no topo (+1) e o try/catch de treze linhas
     logo após o DAQUI da pauta (+13) —, e tudo abaixo de `pushMsgs`
     andou junto. Re-medido por esta própria catraca; nada somado de
     cabeça. */
  /* A PENEIRA DA AGRESSÃO (frontend, MM, 29/09): 8100 -> 8101. O novo
     import de `soODeclarado` (peneira.js) no topo do arquivo empurra tudo
     abaixo dele +1 — o mesmo degrau que FUNIL_DO_COMBATE e
     RECUSAS_DO_COMBATE registram no cabeçalho deles. Re-medido por esta
     própria catraca; nada foi somado de cabeça.
     O ESCONDIDO ENTRA NA FIAÇÃO (frontend, MM6, 29/09): 8101 -> 8111, +10.
     O contra-ataque da reação (`tentarReacaoNoGolpe`) ganhou o veredito do
     Ataque Furtivo antes do golpe, e `pushMsgs` mora poucas linhas abaixo
     no mesmo arquivo. Valor achado pela própria catraca (ela falha com o
     endereço certo escrito no erro); nada somado de cabeça. */
  /* O GOLPE FINAL (frontend, 29/09, MM3): 8048 -> 8100. Os hooks
     novos do estado do cartão do golpe final (perto de 5396-8251) nascem
     ACIMA deste ponto, e tudo abaixo andou +52 junto — o mesmo degrau que
     FUNIL_DO_COMBATE e RECUSAS_DO_COMBATE registram no cabeçalho deles.
     Re-medido por esta própria catraca, que é quem re-deriva o endereço
     do código; nada foi somado de cabeça. */
  /* A FUGA COBRA (frontend, R22): 8037 -> 8048. `sementeMundo`
     (+5) e `abrirCombate` (+6) — a semente única da fuga e a marca do
     território que se zera a cada luta nova — nascem acima deste ponto, e
     tudo abaixo andou +11 junto. Re-medido por conteúdo, asserção intacta.
     A FUGA (frontend, segunda volta — R21): 8028 -> 8037. As nove linhas
     são o fôlego da fuga (fuga.js): o comentário e o `folegoRef` novos,
     logados ao lado de `combateRef`, para a caçada e a emboscada da
     missão não reabrirem luta NA MESMA resposta em que o herói fugiu —
     e tudo abaixo andou junto. O funil não se moveu por vontade própria
     nem mudou de forma: endereço re-medido pelo diff, asserção intacta.
     R21 (oficial, 2.º passe): a partida da marca da porta (a missão da chegada acende o Diário) entrou antes destas linhas. Endereço re-medido pelo diff, conteúdo idêntico; asserção intacta. 8018 -> 8028.
     R21 (oficial): o alforje no telefone - os imports do painel e da marca, a porta na cinta, o trilho so na larga e a fiacao do alforje entram ANTES destas linhas; tudo abaixo andou junto. Endereco re-medido pelo diff, conteudo identico; asserção intacta. 7930 -> 8018.
     A FUGA (frontend): 7928 -> 7930. As duas linhas são o import novo
     no topo do arquivo (`fuga.js` e o rótulo do verbo Fugir, de
     `tela-de-batalha.js`) — e tudo abaixo andou junto. O funil não se
     moveu por vontade própria nem mudou de forma: endereço re-medido,
     asserção intacta. É a DÉCIMA cobrança desta catraca por um
     deslocamento que não é defeito nenhum.
     R13: 7258 -> 7724 (etapa A) -> 7835 (etapa B). É a sétima e a oitava cobrança desta catraca por um deslocamento que não é defeito nenhum: as peças que R13 acrescentou nascem ao NÍVEL DO MÓDULO, como a lei obriga (componente dentro do render mata o foco do input), e empurram para baixo tudo o que vem depois. O item da pauta que propõe trocar número por âncora de alcance ganha aqui mais duas.
     R17: 7835 -> 7928. É a NONA cobrança: a lápide de `VinhetaDaCena`/
     `IconeBalao` e a fiação nova do veredito do cartaz em `PainelMural`
     nascem acima deste ponto, e tudo abaixo andou +93. Nenhuma forma
     mudou — só o endereço, re-medido por conteúdo contra o HEAD anterior
     à etapa, não por soma de delta. */

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
  /* o endereço do `enviar` que a tabela cita: se ele andou, a explicação
     escrita aponta para o lugar errado */
  /* E3: 11864 -> 11500. Piso da busca, não endereço: a tela da batalha e as
     duas gavetas saíram do App.jsx e o `enviar` desceu para :11723. Um piso
     que não desce junto procura o alvo DEPOIS de ele já ter passado.
     T2-A (28/10, o 9.º grupo): o texto do combate resolvido saiu para
     ENVELOPES_DA_FICHA; o envio é o mesmo, na mesma linha, e procura-se pela
     chamada que o App faz ao motor. */
  const iEnviar = LINHAS_APP.findIndex((l, i) => i > 11500 && /^\s*enviar\(oEnvelopeDaFicha\("combateResolvido", /.test(l));
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
