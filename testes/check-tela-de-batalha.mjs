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
import { FORA_DA_TELA_DA_LUTA, REGIOES_DA_BATALHA } from "../src/tela-de-batalha.js";
import { TELA_DE_BATALHA, ALVOS } from "../src/estilo.js";

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
    && /\{p\.fim \?/.test(TEL));
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
  /* as duas que TERMINAM a luta, e uma delas já terminou */
  t("o `⛺ acampar` é gateado por `!emBatalha`",
    /!acampado && !emBatalha && <button onClick=\{acampar\}/.test(APP),
    "ele ENCERROU uma luta por engano numa partida de verdade — é a razão mais cara da lista.");
  t("a `📜 crônica` é gateada por `!emBatalha`",
    /&& !emBatalha && <button onClick=\{gerarCronica\}/.test(APP));
  /* e o cabeçalho inteiro, que era a única coisa da tela a dizer que a
     tela era uma tela — e custava 48 px de altura ao campo */
  t("e o cabeçalho inteiro sai: a marca e o `salvo` são moldura, não jogo",
    /\{!emBatalha && \(\s*<header /.test(APP));

  /* Nenhum dos treze nomes da lista pode aparecer como CONTROLE dentro da
     tela da batalha. Mede-se o arquivo da tela, que é onde um controle
     novo nasceria. */
  const proibidos = FORA_DA_TELA_DA_LUTA.map((x) => x.id);
  const intrusos = proibidos.filter((id) => new RegExp(`onClick=\\{[^}]*${id}`, "i").test(TEL));
  t(`nenhuma das ${proibidos.length} portas proibidas tem botão na tela da luta`,
    intrusos.length === 0, intrusos.join(" · "));
  /* `Examinar` e `Tempo` vivem no convés, que a batalha substitui — a
     prova é que eles continuam lá e o convés continua dentro do `main` */
  t("`Examinar` e `Tempo` continuam no convés, que a luta substitui",
    /setExaminando\(\(v\) => !v\)/.test(APP) && /setMostrarHoras\(\(v\) => !v\)/.test(APP)
    && !/setExaminando|setMostrarHoras/.test(TEL));
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
  t("e o texto sai do módulo, que garante que ela nunca cala",
    /const linha = vereditoDaTela\(\{/.test(TEL));
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
    /const verbos = fileiraDeVerbos\(\);/.test(TEL)
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
  t("saída 1 — tocar o verbo outra vez desarma",
    /if \(armado === v\.id\) \{ setArmado\(""\);/.test(TEL));
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
  t("o `⤢ ampliar` chegou ao piso do alvo e ganhou anel",
    /minHeight: ALVOS\.piso, minWidth: ALVOS\.piso/.test(GRADE)
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
  /* a casa não se negocia: 48, e ela é IMPOSTA ao tabuleiro */
  t("a casa do tabuleiro é imposta pelo piso do alvo — a janela sobre o campo",
    /ladoFixo=\{ALVOS\.piso\}/.test(TEL) && /ladoFixo = 0/.test(ler("src/grade-de-batalha.jsx")));
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

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
