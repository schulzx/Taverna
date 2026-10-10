/* check-tela-de-batalha.mjs (E3) — a FORMA da tela da luta

   POR QUE UM VARREDOR E NÃO SÓ UMA SUÍTE. `teste-tela-de-batalha.mjs`
   prova o que o módulo DECIDE; isto prova o que a tela É. E a diferença
   não é de gosto: as três doenças abaixo passam por 141 asserções verdes
   sem uma única falha, porque nenhuma delas é comportamento — são
   posições, ausências e números, e tudo isso vive no TEXTO do JSX.

   1. A REGRESSÃO DA ÁRVORE. A doença que E3 existe para curar não era um
      número de CSS: o tabuleiro era FILHO do rolador do log, e por
      construção abria 429 px abaixo da borda. No dia em que alguém, a
      consertar outra coisa, voltar a montar a batalha dentro do
      `<div ref={areaRef}>`, o jogo volta ao estado de antes — e nenhum
      teste de módulo o sente, porque nada do que roda mudou.

   2. A PORTA QUE VOLTA. `⛺ acampar` ENCERROU UMA LUTA POR ENGANO numa
      partida de verdade. O critério de E1 é duro — *um controle que,
      tocado no meio de uma luta, ou não faz nada ou termina a luta, não
      pode estar na tela da luta* —, mas é um critério, e critério não
      compila. Uma porta nova que nasça no convés e não seja gateada
      aparece na tela da luta em silêncio.

   3. O NÚMERO QUE VOLTA À MÃO. A geometria de E1 é uma SOMA que fecha nos
      1280 do monitor. Um `888` escrito à mão dentro de um `style={{}}` é
      uma cópia que ninguém sabe que existe, e que não muda no dia em que
      a conta mudar. É a mesma doença de `check-formas` para a cor e de
      `check-endereco-do-tabuleiro` para as letras da grade.

   E A QUARTA, QUE É A LEI DA CASA: *nada nesta tela diz que ela é uma
   tela.* Sem título "modo batalha", sem selo "em combate", sem botão
   "sair do combate". Um rótulo desses não quebra nada e não dá erro
   nenhum — só ensina o jogador a ver mecanismo onde devia ver a luta.

   OS BURACOS, com número, porque buraco calado é mentira:

   - Isto mede TEXTO e não sabe renderizar. Um `<button>` com
     `minHeight: ALVOS.piso` e `overflow: hidden` a cortar o rótulo passa
     verde. O que se prende é a ORIGEM do número, nunca a caixa desenhada;
     a caixa confere-se viva, no navegador.
   - O dente 1 prova que a montagem da batalha vem ANTES da abertura do
     rolador do log, o que é a mesma coisa que "não é filha dele" para a
     única árvore que este arquivo tem. Uma segunda montagem, dentro do
     rolador, seria apanhada pela contagem — mas um `TelaDeBatalha`
     montado dentro de OUTRO componente deste arquivo não seria.
   - A ausência dos controles proibidos é medida na TELA DA BATALHA por
     via da ÁRVORE (eles vivem no `main`, que a batalha substitui) e por
     via do GATE por nome nos três que vivem fora dele — o cabeçalho, o
     acampar e a crônica. Um controle novo que nasça DENTRO de
     `painel-batalha.jsx` com um nome da lista é apanhado; um com nome
     novo, não.

   Nada aqui sorteia e nada depende de rede: o acervo é o texto do
   repositório. Duas rodadas dão a mesma saída, em qualquer máquina. */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FORA_DA_TELA_DA_LUTA, REGIOES_DA_BATALHA, TETO_DA_RECUSA } from "../src/tela-de-batalha.js";
import { TELA_DE_BATALHA, ALVOS, MESA_DE_BATALHA, TERRENO_DO_TABULEIRO } from "../src/estilo.js";
import { PLANTAS } from "../src/grid.js";
import { VERBOS_DE_COMBATE } from "../src/golpe.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* o `rodar-tudo.mjs` faz `process.chdir` para `testes/`, mas rodar da raiz
   também tem de funcionar: quem decide a raiz é o diretório deste módulo */
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (p) => (existsSync(join(RAIZ, p)) ? readFileSync(join(RAIZ, p), "utf8") : "");

const TELA = "src/painel-batalha.jsx";
const PURO = "src/tela-de-batalha.js";
const cruApp = ler("src/App.jsx");
const cruTela = ler(TELA);
/* O CÓDIGO SEM OS COMENTÁRIOS. Esta base já se queimou uma vez, em
   `teste-grade.mjs`: uma prova casou com a PROSA que explicava a remoção
   de uma coisa, e jurou que a coisa continuava no desenho. */
const semProsa = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semProsa(cruApp);
const TEL = semProsa(cruTela);

sec("0. o alcance — catraca verde por vazio é pior que catraca nenhuma");
{
  /* o App tem ~22 mil linhas e a tela ~550: um regex de comentário que
     apagasse um arquivo inteiro passaria VERDE medindo nada */
  t("o App.jsx foi lido inteiro", APP.length > 400000, `leu ${APP.length} caracteres`);
  t(`e ${TELA} foi lido`, TEL.length > 6000, `leu ${TEL.length} caracteres`);
  t(`e ${PURO} existe e é módulo puro — nada de React nem de DOM`,
    ler(PURO).length > 3000 && !/from "react"/.test(ler(PURO)) && !/document\./.test(ler(PURO)));
}

/* ============================================================
   1. A INVERSÃO — a tela da batalha é IRMÃ do log, nunca filha
   ============================================================ */
sec("1. a inversão: o tabuleiro saiu de dentro do rolador do log");
{
  t("o `PainelCombate` não existe mais no App.jsx", !/function PainelCombate\(/.test(APP),
    "ele era montado dentro do `<div ref={areaRef}>`, depois de todas as mensagens — os 429 px abaixo da borda eram essa árvore.");
  t("e o App.jsx não monta mais o tabuleiro diretamente", !/<GridDeBatalha/.test(APP),
    "quem monta a grade é a tela da batalha; o App entrega a fiação.");
  t("a tela nova chega por import", /import \{ TelaDeBatalha \} from "\.\/painel-batalha\.jsx";/.test(APP));

  const iTela = APP.indexOf("<TelaDeBatalha");
  const iRolador = APP.indexOf("ref={areaRef}");
  const iMain = APP.indexOf('<main className="flex-1 flex flex-col min-w-0">');
  t("é montada UMA vez", (APP.match(/<TelaDeBatalha/g) || []).length === 1);
  t("e ANTES do rolador do log abrir — logo não é filha dele",
    iTela > 0 && iRolador > 0 && iTela < iRolador,
    `a tela está em ${iTela} e o rolador abre em ${iRolador}`);
  /* a troca é EXCLUDENTE: ou a luta ou o convés, nunca os dois */
  t("a luta TROCA o `main` inteiro, e não se acrescenta a ele",
    /\{emBatalha \? \(\s*<LimiteErro>\{telaDaBatalha\}<\/LimiteErro>\s*\) : \(/.test(APP)
    && iMain > iTela);
  /* nunca pode custar o turno: um órgão que estoura não derruba a cena */
  t("e vem dentro de `LimiteErro`", /<LimiteErro>\{telaDaBatalha\}<\/LimiteErro>/.test(APP));

  /* A ENTRADA É AUTOMÁTICA — um convite pode ser RECUSADO, e quem recusa
     fica exatamente no estado que E1 mediu. Prova de forma: `emBatalha`
     depende só de haver combate, nunca de um estado que alguém ligue. */
  t("a entrada é automática: `emBatalha` sai do combate, não de um botão",
    /const emBatalha = fase === "jogo" && !!personagem && !!combateNaTela;/.test(APP));
  /* E A SAÍDA É CONFIRMADA, SÓ NO FIM */
  t("e a saída é uma porta só, e só quando a luta acabou",
    /const \[fimDaLuta, setFimDaLuta\] = useState\(null\);/.test(APP)
    && /fim=\{!combate\}/.test(APP)
    && /\{p\.fim \?/.test(TEL)
    /* A1 (10/10): o fim ganhou o MOMENTO (`FimDaLuta`, com o espólio que o
       App passa), que toma a secção inteira — e a porta continua UMA só, o
       `Respirar fundo`, nas duas formas, e só quando a luta acabou */
    && /const fimComEspolio = !!p\.fim && /.test(TEL) && /\{acaoDoFim \|\| acao\}/.test(TEL)
    && (TEL.match(/Respirar fundo →/g) || []).length === 2);
}

sec("2. a fiação nova nunca pode custar o turno");
{
  /* toda fiação nova em try/catch, e o helper da casa é `calou` */
  const novas = ["o fim da luta", "voltar ao fim da prosa", "o passo da batalha", "o veredito da batalha", "agir na batalha", "atacar na batalha"];
  const faltam = novas.filter((n) => !APP.includes(`calou("${n}"`));
  t("as seis fiações novas da batalha caem em `calou`", faltam.length === 0, faltam.join(" · "));
}

/* ============================================================
   3. OS CONTROLES PROIBIDOS
   ============================================================ */
sec("3. o que some durante a luta — e o critério é duro");
{
  /* o trilho inteiro: oito portas para fora da luta, todas de uma vez */
  t("o trilho de abas inteiro é gateado por `!emBatalha`",
    /\{!emBatalha && <TrilhoAbas /.test(APP));
  /* AS DUAS QUE TERMINAM A LUTA, e uma delas já terminou uma por engano
     numa partida de verdade — é a razão mais cara desta lista.

     R13 MUDA A ÂNCORA E APERTA A LEI. Os dois botões eram gateados por
     `!emBatalha` dentro do cabeçalho; agora **não existem na moldura da
     cena**, porque o cabeçalho morreu inteiro na tela principal (73 px, no
     aparelho mais apertado, a escrever o nome do produto a quem já está
     dentro dele — *o sistema não fala de si mesmo*). O `⛺` mudou-se para o
     toque no relógio (`OPainelDoTempo`, que só se pinta fora da luta) e a
     `📜` para a aba `Diário` (que o trilho de abas já esconde, e o trilho é
     a primeira asserção deste bloco).

     A ASSERÇÃO NOVA É MAIS DURA DO QUE A ANTIGA: antes bastava um gate ao
     lado do botão, e um gate esquecido passava. Agora a régua mede a
     AUSÊNCIA dos dois da moldura permanente — só podem viver atrás de uma
     porta que a luta já fecha. Se algum voltar ao topo da cena, esta linha
     morde mesmo que venha com `!emBatalha` colado. */
  t("o `⛺ acampar` não tem botão na moldura da cena — vive no toque do relógio",
    !/<button onClick=\{acampar\}/.test(APP)
    && /aoAcampar=\{\(\) => \{ setTempoAberto\(false\); acampar\(\); \}\}/.test(APP)
    && /\{fase === "jogo" && personagem && !emBatalha && \(/.test(APP),
    "ele ENCERROU uma luta por engano numa partida de verdade — é a razão mais cara da lista.");
  t("a `📜 crônica` não tem botão na moldura da cena — vive na aba Diário",
    !/<button onClick=\{gerarCronica\}/.test(APP)
    && /\{aba === "diario" && aoGerarCronica && \(/.test(APP));
  /* e o cabeçalho inteiro, que era a única coisa da tela a dizer que a tela
     era uma tela. R13: ele já não é gateado pela luta — **saiu da fase do
     jogo inteira**, e as outras fases (menu, mundo, ficha, sala) continuam a
     tê-lo, que é onde ele ainda diz onde se está. */
  t("e o cabeçalho inteiro sai da tela do jogo: a marca e o `salvo` são moldura, não jogo",
    /\{!emBatalha && fase !== "jogo" && \(\s*<header /.test(APP));

  /* Nenhum dos treze nomes da lista pode aparecer como CONTROLE dentro da
     tela da batalha. Mede-se o arquivo da tela, que é onde um controle
     novo nasceria. */
  const proibidos = FORA_DA_TELA_DA_LUTA.map((x) => x.id);
  const intrusos = proibidos.filter((id) => new RegExp(`onClick=\\{[^}]*${id}`, "i").test(TEL));
  t(`nenhuma das ${proibidos.length} portas proibidas tem botão na tela da luta`,
    intrusos.length === 0, intrusos.join(" · "));
  /* R4b: `Examinar` e `Tempo` DEIXARAM DE SER ABAS do convés e passaram a
     ser ofertas da soleira. MOTIVO da asserção re-escrita então: o que ela
     guardava não era a FORMA do controle, era o LADO da fronteira — que
     estes dois vivem na tela da narrativa e nunca dentro da luta, porque a
     batalha substitui o convés inteiro.

     R13: `Tempo` mudou de forma outra vez, e agora para a casa definitiva.
     `setMostrarHoras` chamava-se assim porque o painel era só as horas; ele
     virou `setTempoAberto` e o painel virou **O TEMPO** — acampar, esperar,
     o calendário e todos os prazos no mesmo toque, o do relógio da cinta.
     `Esperar` deixa a soleira, onde estava emprestado desde R4b com a dívida
     escrita (*pela régua não é oferta; entrou porque lhe tiraram a aba e não
     lhe deram casa*). **O lado da fronteira, que é o que esta linha mede,
     não mudou:** os dois continuam do lado da narrativa, e a luta não os
     herda. */
  t("`Examinar` e `Tempo` continuam do lado de cá, e a luta não os herda",
    /aoClicar: \(\) => setExaminando\(true\)/.test(APP) && /aoAbrirTempo=\{\(\) => setTempoAberto\(\(v\) => !v\)\}/.test(APP)
    && !/setExaminando|setTempoAberto/.test(TEL));
}

sec("4. e nada nesta tela diz que ela é uma tela");
{
  const ditos = ["modo batalha", "em combate", "sair do combate", "ordem de iniciativa", "tela da batalha"];
  /* mede o texto QUE VAI PARA A TELA — as strings entre aspas do JSX —,
     nunca a prosa dos comentários, que fala de mecanismo de propósito */
  const achados = ditos.filter((d) => new RegExp(`>[^<]*${d}|"[^"]*${d}[^"]*"|'[^']*${d}[^']*'`, "i").test(TEL));
  t("nenhum rótulo de mecanismo na tela da luta", achados.length === 0, achados.join(" · "));
  /* o rótulo da faixa é a RESPOSTA, e a resposta sai do módulo */
  t("a faixa da vez diz `agora: <nome>`, e o rótulo vem do módulo puro",
    /rotuloDaVez\(selos\)/.test(TEL) && /agora: \$\{quem\.nome\}/.test(ler(PURO)));
}

/* ============================================================
   5. AS REGIÕES, e a ordem do DOM que é a ordem da tabulação
   ============================================================ */
sec("5. as seis regiões estão na tela, e na ordem do turno");
{
  const montagem = {
    vez: "<FaixaDaVez ", campo: "<GridDeBatalha ", veredito: "<LinhaDoVeredito ",
    verbos: "<FileiraDeVerbos ", dePe: "<QuemEstaDePe ", narracao: "<AUltimaFala ",
  };
  for (const r of REGIOES_DA_BATALHA) {
    t(`a região \`${r.id}\` está montada — ${r.faz}`, TEL.includes(montagem[r.id]));
  }
  /* a ordem do DOM É a ordem de tabulação (WCAG 2.4.3): reordenar com
     `tabindex` positivo é o remendo que a norma existe para recusar */
  const naLinha = REGIOES_DA_BATALHA.filter((x) => x.naLinhaDoTurno).map((x) => TEL.indexOf(montagem[x.id]));
  t("e as quatro da linha do turno estão no DOM nesta ordem: vez, campo, veredito, verbos",
    naLinha.every((v, i) => i === 0 || v > naLinha[i - 1]), naLinha.join(" < "));
  t("nenhum `tabindex` positivo em lado nenhum da tela",
    !/tabIndex=\{[1-9]/.test(TEL));

  /* A PROSA É A PROTAGONISTA, e a região dela não é decoração: ela lê o
     log de verdade, pelo módulo, e corta pelo COMEÇO. */
  t("a narração lê a última fala do Mestre pelo módulo",
    /ultimasLinhasDoMestre\(p\.mensagens/.test(TEL) && /mensagens=\{mensagens\}/.test(APP));
  /* duas linhas no monitor, UMA no telefone — e os dois números saem da
     mesma tabela. A prosa encolhe; o que ela nunca faz é sair. */
  t("e a altura dela sai da tabela, não da conta de alguém, nos dois tamanhos",
    /maxHeight: noTelefone \? G\.narracaoNoTelefone : G\.narracao/.test(TEL));
}

/* ============================================================
   6. A LINHA DO VEREDITO, e a reação que nasce nela
   ============================================================ */
sec("6. o veredito antes do clique: linha permanente, nunca balão");
{
  t("a linha é permanente e a altura sai da tabela", /minHeight: G\.veredito/.test(TEL));
  /* RXX: a linha ganhou um SEGUNDO módulo que garante que ela nunca cala.
     `fugir` não faz pergunta nenhuma quando arma (não há "toque a casa" ou
     "diga em quem" para ele) — mostra o PREÇO de sair, medido pelo App
     com `fuga.js` — e por isso não passa por `vereditoDaTela`, que é a
     máquina das perguntas. `linhaFugaArmada` é a mesma garantia de nunca
     vazio, para o caminho que `vereditoDaTela` não cobre. */
  t("e o texto sai do módulo, que garante que ela nunca cala — `vereditoDaTela` no geral, `linhaFugaArmada` na exceção de `fugir`",
    /vereditoDaTela\(\{/.test(TEL) && /linhaFugaArmada\(p\.linhaDaFuga\)/.test(TEL));
  t("é anunciada a quem ouve a tela", /aria-live="polite"/.test(TEL));
  /* K3: a pergunta SOBREPÕE, nunca EMPURRA. Empurrar move as casas que o
     jogador estava a ler no exato segundo em que ele tem de decidir. */
  t("a reação nasce nela e cresce PARA CIMA, sobrepondo",
    /position: "absolute", left: 0, right: 0, bottom: "100%"/.test(TEL)
    && /reacao=\{reacaoDaBatalha\}/.test(APP));
  t("e o cartão da reação vem dentro de `LimiteErro`", /<LimiteErro>\s*<PainelReacao/.test(APP));
}

sec("7. os verbos: a lista é do `jogo`, e o armado tem três saídas");
{
  t("a fileira lê `fileiraDeVerbos()`, e não fabrica a segunda lista",
    /* A1: a mesma lista, com o gesto sem motor de fora (ver secção 10) */
    /const verbos = fileiraDeVerbos\(\)\.filter\(temMotorOuNaoEGesto\);/.test(TEL)
    && !/rotulo: "Atacar"/.test(TEL));
  /* o estado que a norma já tem para "ligado" — é o que faz o bico e a
     inversão chegarem a quem não vê nem um nem outro */
  t("o verbo armado diz que está armado a quem ouve", /aria-pressed=\{armado\}/.test(TEL));
  /* `ink` sobre `amber` dá 1,701:1 e reprova o AA. O rótulo do verbo
     armado é `onAccent`, e só `onAccent`. */
  t("e o rótulo do armado é `onAccent`, nunca `ink` sobre âmbar",
    /color: armado \? T\.onAccent/.test(TEL) && !/background: T\.amber[^;]*color: T\.ink\b/.test(TEL));

  /* AS TRÊS SAÍDAS, vivas ao mesmo tempo. Um véu sem saída que não diz que
     tem saída é a armadilha que a peça `Véu sem retorno` existe para
     impedir — e aqui ela estaria montada por acidente. */
  /* RXX: a saída 1 ganhou uma exceção, e é consciente. `fugir` NÃO desarma
     no segundo toque no mesmo verbo — EXECUTA. É a confirmação de "o
     veredito antes do clique" para uma ação irreversível: o preço já
     apareceu no primeiro toque, e desarmar no segundo faria o botão
     prometer uma coisa e fazer outra. O desarme geral continua ali para
     todo gesto — a exceção está escrita ao lado dele, nunca escondida. */
  t("saída 1 — tocar o verbo outra vez desarma, exceto `fugir` — que confirma e executa",
    /if \(armado === v\.id\) \{\s*if \(v\.id === "fugir"\) \{ setArmado\(""\); if \(p\.aoFugir\) p\.aoFugir\(\); return; \}\s*setArmado\(""\); if \(p\.aoEscrever\) p\.aoEscrever\(""\);/.test(TEL));
  t("saída 2 — `Esc` desarma", /e\.key === "Escape"/.test(TEL) && /removeEventListener\("keydown"/.test(TEL));
  /* a terceira saída é a ÚNICA que existe no telefone, onde não há `Esc` —
     e mora na janela do campo, nunca na casa: a casa fora do alcance não
     tem ouvinte nenhum, e transformar as 84 em botões de cancelar seria
     dar significado a 84 alvos para uma ação que já tem dois */
  t("saída 3 — tocar o campo desarma, e andar desarma por consequência",
    /onPointerDown=\{\(\) => setArmado\(""\)\}/.test(TEL)
    && /const mover = \(destino\) => \{ setArmado\(""\);/.test(TEL));

  /* O VERBO IMPEDIDO CONTINUA NA ORDEM DE TABULAÇÃO. `disabled` tira-o
     dela, e quem navega por teclado ou ouve a tela deixa de saber que o
     verbo principal da luta existe. */
  /* ============================================================
     E4 · O BOTÃO NÃO DECIDE, E A LUTA VIVA FOI QUEM MOSTROU

     `Verbo` fazia `onClick={() => { if (!impedido) aoTocar(); }}`, e
     com isso ENGOLIA o toque no verbo impedido. A regra que recusa e
     escreve a razão (`impedimentosDaFileira`) estava certa e provada
     em Node — e nunca chegava a correr, porque a tela nunca a
     chamava. Medido a jogar: passo a zero, `Mover` com
     `aria-disabled=true`, e a linha do veredito a falar da distância
     do inimigo em vez de dizer por que o verbo não arma.

     *Uma suíte verde sobre uma regra que a tela não invoca é a pior
     espécie de verde.* O dente prende a FORMA: o toque passa sempre,
     e quem decide é quem tem a tabela na mão.

     E ELE NÃO SUBSTITUI a asserção de baixo, substitui a sua metade
     silenciosa: `aria-disabled` continua a ser obrigatório (é o que
     anuncia o estado a quem ouve a tela), mas deixa de poder ser o
     único canal. */
  t("o toque no verbo impedido CHEGA à regra — o botão não o engole",
    /onClick=\{\(\) => aoTocar\(\)\}/.test(TEL)
    && !/if \(!impedido\) aoTocar/.test(TEL),
    "`if (!impedido) aoTocar()` engole o toque e a razão da recusa nunca chega à linha do veredito — apanhado a jogar, com a suíte verde.");
  t("e a razão da recusa sai da tabela do módulo, nunca de uma string no JSX",
    /impedimentosDaFileira\(/.test(TEL) && /recusaDoVerbo: recusado/.test(TEL));

  t("o verbo impedido é `aria-disabled`, nunca `disabled`",
    /aria-disabled=\{impedido \|\| undefined\}/.test(TEL) && !/\bdisabled=\{impedido\}/.test(TEL));

  /* ============================================================
     O ENQUADRAMENTO DE ENTRADA — regra 1 de E1, e ela é lei:
     *um tabuleiro que rola e abre no lugar errado é pior do que um que
     não rola.* Medido antes: `scrollTop = 0`, herói a 874 px, abaixo da
     janela E do ecrã, sem nada a dizer que ele existia. */
  t("a janela do campo enquadra o herói, e os dois números saem da tabela",
    /const janelaRef = React\.useRef\(null\);/.test(TEL)
    && /G\.reservaDaReacao/.test(TEL) && /G\.folgaDaBorda/.test(TEL));
  t("e a câmara só se move quando é obrigada — nunca a cada passo",
    /if \(!apertado\) return;/.test(TEL));
  /* regra 3 por construção: o efeito só escuta a casa do HERÓI, logo a
     câmara nunca vai atrás do inimigo do outro lado do campo */
  t("e nunca vai atrás do inimigo: o efeito só escuta a casa do herói",
    /\}, \[casaDoHeroi, noTelefone\]\);/.test(TEL) && !/casaDoInimigo/.test(TEL));
  t("e a linha diz sempre como se desiste", /SAIDA_DO_ARMADO/.test(ler(PURO)));

  /* NENHUM `Papel=Chamada` NA TELA DA BATALHA — decisão do `regente` em
     W1. `Chamada` já é âmbar cheio em repouso, e ficaria indistinguível do
     ARMADO, que é o estado que importa. */
  t("nenhum verbo nasce âmbar cheio em repouso", !/papel === "chamada"/.test(TEL) && !/chamada/.test(TEL));

  /* O ANEL DE FOCO, E AS TRÊS MANEIRAS DE O APAGAR — as três já morderam
     esta casa. A mais barata de prender é a primeira: `box-shadow` inline
     vence SEMPRE a folha, e o anel TAMBÉM é `box-shadow`. Foi um destes
     três que K4 apanhou no navegador DEPOIS de 141 asserções verdes; e o
     `desenho` mediu que o anel não renderizava em `Gesto` nem em `Recuo`,
     ou seja nos sete controles desta barra. */
  t("todo controle da barra leva o anel de foco da folha",
    (TEL.match(/tv-anel-foco/g) || []).length >= 5,
    `achou ${(TEL.match(/tv-anel-foco/g) || []).length} — os verbos, as duas gavetas, o campo de texto e o Agir`);
  t("e nenhum deles escreve `boxShadow` inline, que apagaria o anel em silêncio",
    !/boxShadow/.test(TEL),
    "estilo inline vence a folha, e o anel também é box-shadow — foi assim que a pílula da ficha perdeu o anel em todos os estados.");
  t("nem `outline: none` fora do bloco que instala o anel",
    !/outline-none/.test(TEL) && !/outline: *"?none/.test(TEL));

  /* ============================================================
     O DENTE QUE TERIA APANHADO ISTO SOZINHO — e não apanhou, porque não
     existia. Achado JOGANDO, depois de 198 suítes e 14 varredores verdes:
     `grade-de-batalha.jsx` escrevia `outline: "none"` INLINE em cada casa,
     e **67 dos 80 elementos focáveis da tela não acendiam anel nenhum.**
     É a primeira das três maneiras de apagar um anel — estilo inline por
     cima —, aplicada casa a casa, oitenta e seis vezes por luta.

     E o substituto que existia não substituía: o realce da régua sai do
     ecrã quando o tabuleiro rola, ou seja desaparece exactamente no
     momento em que serve.

     O dente varre TODA a interface, e não só esta tela: o defeito não tem
     nada de especial da batalha, e o próximo `<rect>` focável nasce em
     qualquer arquivo. */
  const FOCAVEIS = ["src/painel-batalha.jsx", "src/grade-de-batalha.jsx", "src/ui.jsx", "src/painel-reacao.jsx"];
  const apagados = [];
  for (const arq of FOCAVEIS) {
    const c = semProsa(ler(arq));
    const n = (c.match(/outline: *"none"/g) || []).length;
    if (n) apagados.push(`${arq} ×${n}`);
  }
  t("nenhum arquivo de controle apaga o anel com `outline: \"none\"` inline",
    apagados.length === 0, apagados.join(" · ")
      + " — estilo inline vence a folha, e não há segundo canal: o realce da régua sai do ecrã quando o campo rola.");

  /* E A QUARTA MANEIRA, que esta casa aprendeu aqui: BOX-SHADOW NÃO PINTA
     EM ELEMENTO SVG. Pôr `.tv-anel-foco` numa casa do tabuleiro deixaria a
     propriedade a dizer que o anel existe e a tela sem anel nenhum — a
     mentira que é pior do que a ausência, porque passa na revisão. */
  const GRADE = semProsa(ler("src/grade-de-batalha.jsx"));
  t("a casa do tabuleiro usa o anel de SVG, que é `outline` e não sombra",
    /className="tv-anel-foco-no-campo"/.test(GRADE)
    && /\.tv-anel-foco-no-campo:focus-visible/.test(ler("src/estilo.js")),
    "`box-shadow` não pinta em `<rect>`: o anel do SVG tem de ser `outline`.");
  /* e o controle que abre a única vista onde a luta inteira se vê não pode
     ser o mais pequeno da tela: media 68 × 19 contra o piso de 48 */
  /* MOVIDA EM B1b (06/10), com o motivo: no pé da arena do MONITOR o
     `⤢ ampliar` desce ao piso da casa de rato (`casaMinimaNoMonitor`, 32 —
     WCAG 2.5.8 AA pede 24), porque um botão de 48 num pé de 22 comia 26 px
     ao tabuleiro, que agora cabe inteiro. A intenção sobrevive: nunca abaixo
     do piso da casa ao lado dele, e no telefone (e fora da mesa) continua o
     piso do dedo — é isso que a asserção passa a provar. */
  t("o `⤢ ampliar` está no piso do alvo (48 no dedo, o da casa no monitor) e ganhou anel",
    /const alvoDoAmpliar = pe && !peCompacto \? MB\.casaMinimaNoMonitor : ALVOS\.piso;/.test(GRADE)
    && /minHeight: alvoDoAmpliar, minWidth: alvoDoAmpliar/.test(GRADE)
    && /className="tv-anel-foco tv-mono text-\[9px\] ml-auto/.test(GRADE));

  /* escrever e mirar são compatíveis, e é esse o ponto inteiro */
  t("o texto livre NUNCA é `disabled` enquanto há um verbo armado",
    /disabled=\{!armado && !!p\.bloqueado\}/.test(TEL));
  t("e o convite é `como? (opcional)`", /"como\? \(opcional\)"/.test(TEL));
}

/* ============================================================
   8. OS NÚMEROS SAEM DA TABELA
   ============================================================ */
sec("8. a geometria sai de `TELA_DE_BATALHA`, nunca da cabeça de quem digitou");
{
  t("a tela importa a tabela e o piso do alvo",
    /import \{ T, ALVOS, TELA_DE_BATALHA as G \} from "\.\/estilo\.js";/.test(TEL));
  /* O DENTE: nenhum dos números da tabela pode aparecer escrito à mão numa
     declaração de estilo. É a mesma doença de `check-formas` para a cor. */
  const numeros = [TELA_DE_BATALHA.campo, TELA_DE_BATALHA.lateral, TELA_DE_BATALHA.vez,
    TELA_DE_BATALHA.veredito, TELA_DE_BATALHA.verbos, TELA_DE_BATALHA.narracao,
    TELA_DE_BATALHA.arcoDoPolegar, ALVOS.piso];
  const soltos = [];
  for (const n of numeros) {
    const rx = new RegExp(`(?:width|height|minHeight|maxHeight|maxWidth|minWidth|flex|padding|gap|top|bottom|left|right)\\s*:\\s*${n}\\b`, "g");
    const q = (TEL.match(rx) || []).length;
    if (q) soltos.push(`${n} ×${q}`);
  }
  t("nenhum número da tabela está escrito à mão numa medida de estilo",
    soltos.length === 0, soltos.join(" · "));
  /* a casa é IMPOSTA ao tabuleiro. MOVIDA EM B1b (06/10), com o motivo:
     era "48 sempre"; a pessoa pediu o tabuleiro inteiro à vista no monitor,
     e ali o piso passa a ser o da casa de rato (`casaMinimaNoMonitor`, 32,
     WCAG 2.5.8 AA). NO TELEFONE NADA MUDA — o piso continua `ALVOS.piso`,
     e é isso que a asserção guarda com os dois lados escritos. */
  t("a casa do tabuleiro é imposta por um piso — o do dedo no telefone, o do rato no monitor",
    /ladoFixo=\{noTelefone \? ALVOS\.piso : M\.casaMinimaNoMonitor\}/.test(TEL) && /ladoFixo = 0/.test(ler("src/grade-de-batalha.jsx"))
    && MESA_DE_BATALHA.casaMinimaNoMonitor >= 24 && MESA_DE_BATALHA.casaMinimaNoMonitor < ALVOS.piso);
  t("e o campo visível é que rola, nunca o alvo que encolhe",
    /flex-1 min-h-0 min-w-0 overflow-auto tv-scroll/.test(TEL));
  /* zero cor literal: a paleta é `T`, e a catraca global de `check-formas`
     conta-a por arquivo — aqui o teto é ZERO e por isso é dente local */
  t("nenhuma cor literal na tela da batalha",
    !/#[0-9a-fA-F]{3,8}\b/.test(TEL) && !/rgba?\(/.test(TEL));
}

/* ============================================================
   9. A REGRA QUE CUSTOU CARO: componente dentro do render mata o foco
   ============================================================ */
sec("9. toda componente é de módulo, nunca de render");
{
  /* uma letra e o cursor some: a componente nasce outra a cada quadro e o
     React desmonta o input. O build passa, a suíte passa, e só o uso pega. */
  const deModulo = (TEL.match(/^function [A-Z]/gm) || []).length;
  /* `[ \t]` e nunca `\s`: com a flag `m`, `\s+` engole a quebra de linha e
     casa uma função de MÓDULO na linha seguinte — o dente acusaria as seis
     componentes certas de estarem dentro do render. Apanhado aqui mesmo. */
  const deRender = (TEL.match(/^[ \t]+function [A-Z]\w*\(/gm) || []).length;
  console.log(`  ··  ${deModulo} componentes de módulo · ${deRender} declaradas dentro de outra função`);
  t("nenhuma componente declarada dentro de outra", deRender === 0);
  t("e há componentes que chegue para a tela existir", deModulo >= 6);
  /* a tela exporta UMA coisa: a lei do export morto pede >= 2 leitores, e
     uma tela com sete exports seria sete dívidas à espera */
  t("e a tela exporta só a tela", (cruTela.match(/^export /gm) || []).length === 1);
}

/* ============================================================
   10. B1 · A NOVA MESA DE BATALHA (05/10) — o quadro `151:1662`
   ============================================================ */
sec("10. B1: o quadro da pessoa, em tabela, e o que o motor não sabe fica desligado");
{
  /* A CONTA DO QUADRO: 32 + campo + 24 + 328 + 32 = 1600, com o campo a
     ser o que sobra — 1184 no quadro. Um número que se soma com os outros
     não pode ser afinado sozinho. */
  const M = MESA_DE_BATALHA;
  t("a mesa B1 soma os 1600 do quadro (32 + 1184 + 24 + 328 + 32)",
    M.margem * 2 + 1184 + M.entreColunas + M.lateral === 1600, `${M.margem} · ${M.entreColunas} · ${M.lateral}`);
  t("e a tela lê a tabela do quadro", /import \{ MESA_DE_BATALHA as M, VEU, alfa \} from "\.\/estilo\.js";/.test(TEL));

  /* O CHÃO: só a planta que a pessoa desenhou tem textura, e a imagem é a
     do próprio quadro. Uma chave que não é planta seria textura de chão
     nenhum; um arquivo que não está em `public/` seria um buraco na tela. */
  const chaves = Object.keys(TERRENO_DO_TABULEIRO);
  t("todo terreno com textura é uma planta de grid.js", chaves.length > 0 && chaves.every((k) => k in PLANTAS), chaves.join(", "));
  t("e o arquivo de cada um existe em public/", chaves.every((k) => existsSync(join(RAIZ, "public", TERRENO_DO_TABULEIRO[k].replace(/^\//, "")))));
  t("só o deserto tem textura — as outras nove ficam no chão liso até a pessoa desenhar a delas",
    chaves.length === 1 && chaves[0] === "deserto");
  const GRADE_B1 = semProsa(ler("src/grade-de-batalha.jsx"));
  t("o tabuleiro lê a textura pela tabela, pelo cenário da planta", /TERRENO_DO_TABULEIRO\[g\.cenario\]/.test(GRADE_B1));
  /* A CASA ENCHE A JANELA E CONTINUA QUADRADA: o lado é a largura útil ÷
     colunas, nunca abaixo do piso — e tudo o que o chão mede em píxeis é
     dividido pelo lado REAL. Dividir pelo piso engrossaria o traço assim que
     a casa crescesse. */
  /* MOVIDA EM B1b (06/10), com o motivo: a casa já não enche só a LARGURA —
     o lado é o menor entre largura ÷ colunas e altura ÷ linhas, para o
     tabuleiro caber inteiro (o pedido da pessoa, com foto). O que a
     asserção guardava continua: quadrada, medida, nunca abaixo do piso. */
  t("a casa cabe na janela (largura E altura), com teto, e nunca abaixo do piso",
    /const ladoPelaLargura = larguraDaJanela > 0 \? Math\.floor\(\(larguraDaJanela - CALHA_DA_REGUA\) \/ g\.largura\) : Infinity;/.test(GRADE_B1)
    && /const ladoPelaAltura = alturaDaJanela > 0 \? Math\.floor\(\(alturaDaJanela - CALHA_DA_REGUA\) \/ g\.altura\) : Infinity;/.test(GRADE_B1)
    && /Math\.max\(ladoFixo, Math\.min\(tetoDoLado > 0 \? tetoDoLado : Infinity, ladoPelaLargura, ladoPelaAltura\)\)/.test(GRADE_B1)
    && /larguraDaJanela=\{larguraDaJanela\}/.test(TEL) && /new ResizeObserver\(/.test(TEL));
  /* B1b · A MESA CABE NA JANELA. O monitor passa a altura e o teto; o
     telefone não passa nenhum dos dois (ali rolar é aceitável, e a conta de
     B1 fica byte a byte). A altura e a largura saem da MESMA medida. */
  t("só o monitor passa a altura e o teto ao tabuleiro",
    /alturaDaJanela=\{noTelefone \? 0 : alturaDaJanela\} tetoDoLado=\{noTelefone \? 0 : M\.casaMaximaNoMonitor\}/.test(TEL)
    && /setLarguraDaJanela\(el\.clientWidth \|\| 0\); setAlturaDaJanela\(el\.clientHeight \|\| 0\);/.test(TEL));
  t("o piso e o teto da casa no monitor estão em tabela e fazem sentido",
    MESA_DE_BATALHA.casaMinimaNoMonitor < MESA_DE_BATALHA.casaMaximaNoMonitor && MESA_DE_BATALHA.casaMaximaNoMonitor <= 1184 / 18 + 1,
    `${MESA_DE_BATALHA.casaMinimaNoMonitor} · ${MESA_DE_BATALHA.casaMaximaNoMonitor}`);
  /* os dois patamares de altura saem da tabela, e o curto é mais alto que o
     baixo (senão o baixo nunca aconteceria sozinho) */
  t("os patamares de altura saem da tabela",
    /const CORTE_CURTO = `\(max-height: \$\{M\.patamares\.curto - 1\}px\)`;/.test(cruTela)
    && /const CORTE_BAIXO = `\(max-height: \$\{M\.patamares\.baixo - 1\}px\)`;/.test(cruTela)
    && MESA_DE_BATALHA.patamares.curto > MESA_DE_BATALHA.patamares.baixo);
  /* A COLUNA CABE INTEIRA: NESTA BATALHA cede e rola por dentro, o foco
     da escolha só aparece se couber inteiro (a altura dele é soma da
     tabela que o desenha), e o rastro mora na sobra. */
  t("NESTA BATALHA cede a altura no monitor e rola por dentro",
    /flex: cede \? "0 1 auto" : "0 0 auto"/.test(TEL) && /cede=\{!noTelefone\}/.test(TEL));
  t("o foco da escolha só aparece se couber inteiro na sobra",
    /alturaDaSobra >= ALTURA_DO_FOCO && <FocoDaEscolha \/>/.test(TEL)
    && /const ALTURA_DO_FOCO = Math\.ceil\(M\.escolhasRespiro \* 2 \+ M\.glifoDaRuna/.test(TEL));
  /* A FRASE DO MESTRE: duas linhas com reticências, e o corte de verdade
     continua a ser o do módulo, pelo começo */
  t("a frase da cena tem o teto de linhas da tabela e o texto inteiro no title",
    /WebkitLineClamp: NARRACAO\.linhas/.test(TEL) && /title=\{inteiro \|\| undefined\}/.test(TEL));
  t("e o chão divide os píxeis pelo lado real, não pelo piso",
    /const px = 1 \/ Math\.max\(1, ladoEmPx\(grande\)\);/.test(GRADE_B1) && !/\/ ALVOS\.piso/.test(GRADE_B1));
  t("a câmara enquadra com o lado medido", /aoMedirOLado=\{aoMedirOLado\}/.test(TEL) && /const lado = ladoRef\.current \|\| ALVOS\.piso;/.test(TEL));

  /* O GESTO SEM MOTOR FICA DESLIGADO — e a regra lê a TABELA do motor
     (`!v.motor`), nunca um nome: no dia em que `golpe.js` der motor à
     esquiva, ela acende sozinha. A frase cabe na linha do veredito. */
  /* MOVIDAS (10/10, A1 · peça 97 de `mente/a1-jogo.md`): em B1 o gesto sem
     motor ficava DESLIGADO na fileira, e ao toque a linha dizia "a esquiva
     ainda não pesa nos golpes deles — use Mover". O `jogo` decidiu em A1 que
     um botão que só existe para dizer que não funciona é o sistema a
     confessar um buraco, e ninguém pode depender dele: o gesto sem motor SAI
     DA FILEIRA até ter regra. As três asserções de B1 (o desligar, as frases
     da recusa, uma frase por gesto) protegiam uma forma que se aposentou; o
     que elas guardavam e CONTINUA a valer é a metade da lei que não muda —
     a regra lê a TABELA do motor (`!v.motor`), nunca um nome, logo o verbo
     VOLTA sozinho no dia em que `golpe.js` lhe der motor. */
  t("o gesto sem motor sai da fileira pela tabela do motor, não pelo nome",
    /const temMotorOuNaoEGesto = \(v\) => !\(v\.papel === "gesto" && !v\.motor\);/.test(TEL)
    && /const verbos = fileiraDeVerbos\(\)\.filter\(temMotorOuNaoEGesto\);/.test(TEL) && !/v\.id === "esquivar"/.test(TEL));
  t("e a frase que confessava o buraco não voltou", !/a esquiva ainda não pesa/.test(cruTela) && !/RECUSA_DO_GESTO_SEM_MOTOR/.test(cruTela));
  const semMotor = VERBOS_DE_COMBATE.filter((v) => !v.motor).map((v) => v.id);
  t("hoje é a esquiva que fica de fora — e só ela (o dia em que ganhar motor, esta linha muda)", semMotor.join(",") === "esquivar", semMotor.join(", "));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
