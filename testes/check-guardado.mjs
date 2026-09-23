/* VARREDOR — a promessa de X3 contra o código de verdade

   POR QUE ELE EXISTE, e por que não basta a suíte.

   `teste-guardado.mjs` prova que o MÓDULO cumpre a lei: o guardado é o
   que aconteceu, a trava morde o que rolou, a marca fecha o círculo. Mas
   a lei só vale se a FIAÇÃO continuar perguntando ao módulo. Um envelope
   resolvido novo que nasça sem selo, uma porta de declaração nova que
   não pergunte à trava, um `guardadoRef.current = SEM_GUARDADO` que
   alguém apague no caminho feliz — nada disso quebra a suíte, e cada um
   deles devolve a re-rolagem ao jogo EM SILÊNCIO.

   Silêncio é exatamente o que a Fase X existe para impedir. Uma queda de
   rede que vira segunda chance não parece exploit, parece azar — não há
   quem reclame, não há tela vermelha, não há bug report. Só o
   determinismo por semente deixa de valer, e ninguém percebe.

   Então este varredor LÊ O FONTE e falha quando a casa regride. Toda
   falha diz o que fazer: varredor que só grita é pior que varredor
   nenhum.

   AS QUATRO CATRACAS, e o que cada uma impede de voltar:
     1. envelope resolvido que escapa do selo
     2. o motivo técnico voltando para a tela — ou sumindo do console
     3. o guardado sobrevivendo ao sucesso (o pior modo de falhar desta
        etapa: trava o jogo para sempre)
     4. porta de declaração que não pergunta à trava */

import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SELOS_DO_RESOLVIDO, ehTurnoResolvido } from "../src/guardado.js";

/* mesmo `chdir` de `rodar-tudo.mjs`: os `readFileSync` daqui resolvem
   pelo diretório de trabalho, e este varredor precisa dizer a mesma
   coisa rodado da raiz e rodado de dentro de testes/ */
process.chdir(dirname(fileURLToPath(import.meta.url)));

const APP = readFileSync("../src/App.jsx", "utf8");

let maus = 0;
const falha = (o, oQueFazer) => { maus++; console.log(`  XX  ${o}\n      → ${oQueFazer}`); };
const ok = (o) => console.log("  ok  " + o);
const linhaDe = (i) => APP.slice(0, i).split("\n").length;

/* ============================================================
   LER O PRIMEIRO ARGUMENTO DE `enviar(`

   O envelope é o primeiro argumento, e ele é um literal — aspas ou
   template. Ler por regex de colchete solto não serve: um
   `enviar(preso, ...)` seguido de um array literal daria um "selo" que é
   destructuring de outra linha. Aqui o literal é lido caractere a
   caractere, respeitando escape e fim de linha, e só então se procura o
   PRIMEIRO par de colchetes — que é onde o selo mora.
   ============================================================ */
function lerLiteral(s, i) {
  const aspas = s[i];
  if (aspas !== "`" && aspas !== '"' && aspas !== "'") return null;
  let out = "";
  for (let k = i + 1; k < s.length; k++) {
    const c = s[k];
    if (c === "\\") { out += c + s[k + 1]; k++; continue; }
    if (c === aspas) return out;
    if (c === "\n" && aspas !== "`") return null;
    out += c;
  }
  return null;
}

const enviados = [];
{
  const rx = /\benviar\(\s*/g;
  let m;
  while ((m = rx.exec(APP))) {
    const i = m.index + m[0].length;
    const lit = lerLiteral(APP, i);
    if (lit == null) { enviados.push({ linha: linhaDe(m.index), selo: null, opaco: true }); continue; }
    const cab = /^\s*\[([^\]]*)\]/.exec(lit);
    enviados.push({ linha: linhaDe(m.index), selo: cab ? cab[1] : null, opaco: false });
  }
}

console.log("\n1. nenhum envelope resolvido escapa do selo");
{
  /* ---------------- O DETECTOR LARGO ----------------
     Ele é DE PROPÓSITO mais largo que `SELOS_DO_RESOLVIDO`: se fosse o
     mesmo, a asserção seria circular e não protegeria nada. O que ele
     procura é a FORMA de um anúncio de trabalho já feito, em três
     feitios medidos no App:

       (a) o particípio "RESOLVID…" em qualquer lugar do cabeçalho;
       (b) "JÁ <particípio> PELO SISTEMA" — com QUALQUER particípio, e é
           aqui que mora a diferença: a tabela do módulo tem uma lista
           FECHADA de particípios, e este detector não;
       (c) "<ROLADO|APLICADO> PELO SISTEMA", sem o "já".

     E as três exclusões que `guardado.js` declara deliberadas: RECUSADO
     (o sistema recusou, não aplicou), GERADO/GERADA (geração, não
     resolução de ação declarada) e a família REGISTRO/REGISTRADO, que
     anota um fato sem rolar nada. Travar a declaração nesses casos seria
     punir o jogador sem ter o que perder. */
  const ANUNCIA = [
    /\bRESOLVID[AO]S?\b/i,
    /\bJ[ÁA]\s+[A-Za-zÀ-ÿ]+[AO]S?\s+PELO\s+SISTEMA\b/i,
    /\b(ROLAD|APLICAD)[AO]S?\s+PELO\s+SISTEMA\b/i,
  ];
  const EXCLUI = [/\bRECUSAD[AO]S?\b/i, /\bGERAD[AO]S?\b/i, /\bREGISTR(O|AD[AO]S?)\b/i];

  const candidatos = enviados.filter((e) =>
    e.selo != null && ANUNCIA.some((r) => r.test(e.selo)) && !EXCLUI.some((r) => r.test(e.selo)));

  /* ---------------- A CATRACA ----------------
     O NÚMERO MEDIDO HOJE: 9 envelopes resolvidos saem por `enviar(` com
     o selo escrito no literal — e o número conta os CANDIDATOS, não os
     aprovados. É de propósito: se ele contasse só quem casa um `padrao`,
     consertar a tabela de selos mexeria na catraca, e uma catraca que se
     move quando se conserta o que ela acusa não acusa nada.

     POR QUE UM NÚMERO, e não só "todos casam". Porque a regressão que
     assusta aqui não é o selo que quebra — é o envelope NOVO. Alguém
     escreve um `enviar("[TORNEIO — LUTA RESOLVIDA PELO SISTEMA] …")`, o
     jogo funciona, a suíte fica verde, e aquele turno passa a poder
     re-rolar em silêncio para sempre. Com a catraca, ele quebra a suíte
     no dia em que nasce — que é o ponto.

     COMO SE SOBE O NÚMERO DE PROPÓSITO: escreva o envelope novo,
     confira que ele casa um `padrao` de SELOS_DO_RESOLVIDO (se não
     casar, o problema é a tabela, não a catraca — acrescente o
     particípio lá, com o motivo escrito), ACRESCENTE o literal em
     `medidos` da família certa em src/guardado.js, e só então suba
     MEDIDOS_HOJE aqui, na mesma mudança. A catraca não sobe em
     silêncio. */
  const MEDIDOS_HOJE = 9;

  const escapam = candidatos.filter((e) => !ehTurnoResolvido("[" + e.selo + "]"));
  if (escapam.length) {
    for (const e of escapam) {
      falha(`src/App.jsx:${e.linha} — o envelope \`[${e.selo}]\` anuncia turno já resolvido e NÃO casa nenhum \`padrao\` de SELOS_DO_RESOLVIDO`,
        "este turno pode ser RE-ROLADO depois de uma queda de rede, em silêncio: `guardarTurno` grava `rolou: false` e `travaODeclarar` não morde. O conserto é em src/guardado.js — acrescente o particípio à lista FECHADA do selo `ja_feito` (hoje APLICAD|RESOLVID|PAG|REGISTRAD|COBRAD|NOMEAD) e ponha o literal em `medidos`, com o motivo escrito. Se a decisão for que este envelope NÃO deve travar, escreva a exclusão no comentário de SELOS_DO_RESOLVIDO e acrescente-a ao EXCLUI deste varredor — nunca afrouxe o detector sem a razão escrita ao lado");
    }
  } else ok(`os ${candidatos.length} envelopes resolvidos do App casam algum \`padrao\``);

  if (candidatos.length !== MEDIDOS_HOJE) {
    falha(`a conta mudou: o App tem ${candidatos.length} envelopes resolvidos em \`enviar(\`, a catraca cravou ${MEDIDOS_HOJE}`,
      candidatos.length > MEDIDOS_HOJE
        ? "nasceu envelope resolvido novo. Confira que ele casa um `padrao`, acrescente o literal em `medidos` (src/guardado.js) e só então suba MEDIDOS_HOJE aqui, na MESMA mudança"
        : "sumiu um envelope resolvido. Se foi de propósito, tire o literal de `medidos` em src/guardado.js e baixe MEDIDOS_HOJE aqui, com o motivo escrito — uma catraca que desce sozinha deixa de ser catraca");
  } else ok(`a catraca segue em ${MEDIDOS_HOJE} envelopes resolvidos`);

  for (const e of candidatos) console.log(`      ${e.linha}\t[${e.selo}]`);

  /* O QUE NÃO DÁ PARA VER DAQUI, e fica MEDIDO para quem vier: dezenas
     de `enviar(` recebem o envelope por variável ou por função
     (`envelopeDaAgressao(a)`, `envelopeDoTeste({…})`). A catraca acima
     não os alcança — e por isso ela é o piso, não o teto. Quem mover um
     envelope selado para dentro de um helper faz a conta DESCER, e a
     falha acima diz o que fazer. */
  const opacos = enviados.filter((e) => e.opaco).length;
  console.log(`  ··  ${enviados.length} chamadas de \`enviar(\` no App · ${enviados.filter((e) => e.selo != null).length} com selo literal · ${opacos} por variável ou helper  (medido, não travado)`);
}

console.log("\n2. o motivo técnico não volta para a tela — e não some do console");
{
  /* A LEI DOS DOIS LADOS. `casa` sobe para a tela; `tecnico` desce para o
     console. Quebrar qualquer um dos dois lados é regressão:

       · o técnico na tela fere "o sistema não fala de si mesmo" — o
         jogador lia a mensagem crua do provedor;
       · o técnico APAGADO é pior: foi justamente esse vazamento que
         permitiu diagnosticar duas quedas nesta sessão. Quem apaga o
         motivo fica cego. */
  const jsx = APP.match(/\{falha && !carregando && \(([\s\S]{0,1600}?)\n\s*\)\}/);
  if (!jsx) {
    falha("não achei o bloco JSX da falha em src/App.jsx",
      "a âncora `{falha && !carregando && (` mudou. Atualize este varredor — e confira à mão que o motivo técnico continua FORA da tela antes de fazê-lo");
  } else {
    const vazando = /falha\.(motivo|tecnico|erro|e)\b/.test(jsx[1]);
    if (vazando) {
      falha("o motivo técnico voltou para a tela da falha",
        "é a lei \"o sistema não fala de si mesmo\": o jogador ouve o Mestre calar, não a máquina tossir. A tela lê `falha.casa` (a voz de mundo de `lerOSilencio`) e nada mais — o técnico desce ao `console.warn` do `catch` de `enviar`, que é onde quem investiga o lê");
    } else ok("o JSX da falha não imprime o técnico");

    if (!/falha\.casa/.test(jsx[1])) {
      falha("o JSX da falha deixou de ler `falha.casa`",
        "sem a voz de mundo a tela fica muda, e silêncio sem frase é pior que frase genérica. Devolva `{falha.casa || lerOSilencio(null).casa}`");
    } else ok("e lê a voz de mundo");

    if (!/falha\.podeTentar/.test(jsx[1])) {
      falha("o botão `Tentar de novo` deixou de perguntar por `podeTentar`",
        "oferecer \"tentar de novo\" contra falta de crédito, chave ausente ou recusa do portão é ensinar o jogador a bater na porta trancada. `lerOSilencio` já responde isso: volte a condicionar o botão a `falha.podeTentar !== false`");
    } else ok("e o botão só aparece quando insistir resolve");
  }

  /* O CONSOLE CONTINUA RECEBENDO O MOTIVO ÍNTEGRO — e como ARGUMENTO
     SEPARADO, nunca interpolado. Interpolar apara: um objeto de erro
     vira "[object Object]" e um motivo longo perde a cauda, que é
     exatamente a parte que nomeia o provedor e o corpo da resposta. */
  const warn = APP.match(/console\.warn\(\s*`([^`]*o Mestre calou[^`]*)`\s*,\s*([^)]+)\)/);
  if (!warn) {
    falha("não achei o `console.warn` do silêncio no `catch` de `enviar`",
      "quem apaga o motivo fica cego — foi esse vazamento que permitiu diagnosticar duas quedas. O `catch` precisa de um `console.warn` com a frase \"o Mestre calou\" e o técnico passado como ARGUMENTO SEPARADO: console.warn(`…`, silencio.tecnico)");
  } else {
    if (!/\.tecnico\s*$/.test(warn[2].trim())) {
      falha(`o \`console.warn\` do silêncio não passa o técnico como argumento separado (passa \`${warn[2].trim()}\`)`,
        "o técnico tem de chegar ao console ÍNTEGRO. Se ele foi para dentro do template, volte a passá-lo depois da vírgula: interpolar apara o motivo e some com a cauda que nomeia o provedor");
    } else ok("o console recebe o técnico como argumento separado, íntegro");

    if (/tecnico/.test(warn[1])) {
      falha("o técnico foi interpolado dentro do template do `console.warn`",
        "interpolar apara. Passe-o depois da vírgula, como argumento próprio");
    } else ok("e ele não está interpolado no texto");

    /* a linha do console é a que diz se é um tropeço ou uma queda longa:
       sem a conta de tentativas, ela diz "tentativa 1" para sempre */
    if (!/tentativa/.test(warn[1]) || !/marca|turno \$\{/.test(warn[1])) {
      falha("a linha do console perdeu a conta de tentativas ou a marca do turno",
        "é o número de tentativas que separa \"o provedor tossiu uma vez\" de \"o Mestre está fora do ar há dez minutos\", e é a marca que prova depois que o texto narrado é o mesmo que o motor produziu. Devolva os dois à linha");
    } else ok("e a linha traz a conta de tentativas e a marca do turno");
  }
}

console.log("\n3. o guardado morre no sucesso");
{
  /* O PIOR MODO DE FALHAR DESTA ETAPA. Um guardado que sobrevive ao
     sucesso levanta `travaODeclarar` para sempre: o jogador clica em
     Atacar, ouve "a mesa espera", e nunca mais joga. Não há mensagem de
     erro, não há tela vermelha — só um jogo que parou de responder aos
     botões. É a regressão mais barata de cometer e a mais cara de
     diagnosticar, e é ela que esta catraca existe para impedir. */
  const feliz = APP.match(/await chamarMestre\([\s\S]{0,1400}?guardadoRef\.current = SEM_GUARDADO;/);
  if (!feliz) {
    falha("não achei `guardadoRef.current = SEM_GUARDADO` logo depois de `await chamarMestre(`",
      "o Mestre falou: o turno guardado TEM de morrer ali, antes do `salvar`. Sem isso a trava do declarar fica levantada para sempre e o jogo para de responder aos botões, em silêncio. Devolva a linha ao caminho feliz — e sem `try/catch`: atribuir o vazio a uma ref não estoura, e esta morte não pode depender de mais nada dar certo");
  } else ok("o guardado morre no caminho feliz, logo depois da resposta do Mestre");

  /* e as outras duas mortes, que o menu e o save dependem */
  if (!/irMenu = \(\) => \{[^}]*guardadoRef\.current = SEM_GUARDADO;/.test(APP)) {
    falha("sair para o menu não limpa mais o turno guardado",
      "um guardado de outra partida atravessaria para a próxima e travaria a declaração dela. Devolva `guardadoRef.current = SEM_GUARDADO;` a `irMenu`");
  } else ok("e morre também ao voltar para o menu");

  if (!/guardadoRef\.current = sv\.guardado && typeof sv\.guardado === "object" \? sv\.guardado : SEM_GUARDADO;/.test(APP)) {
    falha("o load do save deixou de tratar o guardado ausente",
      "save antigo não tem o campo, e `undefined` na ref não é o vazio desta casa — o vazio tem UM nome só, `SEM_GUARDADO`. Devolva a leitura defensiva ao load");
  } else ok("e o load de um save antigo cai em SEM_GUARDADO, sem migração");
}

console.log("\n4. as portas da declaração perguntam à trava");
{
  /* TODA PORTA QUE CHEGA AO MOTOR PERGUNTA À TRAVA — e eram três, e
     desde R4b são DUAS. Uma porta esquecida não é meia proteção: é
     proteção nenhuma, porque o jogador que quer re-rolar vai usar
     justamente a que abriu.

       · `declararGolpe`    — o botão Atacar da tela da batalha
       · `agirInterno`      — a frase digitada, e o despachante inteiro

     A TERCEIRA CAIU, e o motivo fica escrito porque baixar o número de
     portas vigiadas nunca pode ser silencioso: `declararAcaoRapida` era
     a porta dos oito botões do painel de `Ações`, e a sua razão de ser
     porta própria era o desvio — ela chamava `adjudicarAcao` DIRETO, sem
     passar por `agirInterno`. R4b aposentou os vinte botões do painel
     (a medida é do `jogo`: zero dos vinte dizia o preço na tela), e com
     eles o único chamador dela. O desvio deixou de existir: as oito
     ações entram agora pelo texto, que é `agirInterno` →
     `executar("desafio")` → `adjudicarAcao`, já vigiado aqui em cima.

     A cerca não afrouxou — ela deixou de ter o que vigiar naquele ponto.
     Se um dia renascer um clique que chame `adjudicarAcao` sem passar
     por `agirInterno`, ele volta para esta lista com o nome dele. */
  const PORTAS = [
    { nome: "declararGolpe", oQue: "o botão Atacar da tela da batalha" },
    { nome: "agirInterno", oQue: "a frase digitada e todo o despachante do turno" },
  ];
  /* e o dente virado de frente: nenhum chamador NOVO de `adjudicarAcao`
     fora de `agirInterno` — é essa a forma que a terceira porta tinha */
  if ((APP.match(/adjudicarAcao\(/g) || []).length !== 1) {
    falha("nasceu (ou morreu) um chamador de `adjudicarAcao` em src/App.jsx",
      "é UM: a porta `desafio` de `executar`, dentro de `agirInterno`. Um segundo é uma porta nova ao motor, e ela TEM de perguntar a `travaODeclarar` antes de resolver — acrescente-a às PORTAS deste bloco, com o motivo escrito");
  } else ok("e nenhum clique chama `adjudicarAcao` por fora do despachante");
  for (const p of PORTAS) {
    const i = APP.indexOf(`const ${p.nome} = (`);
    if (i < 0) {
      falha(`não achei \`const ${p.nome} = (\` em src/App.jsx`,
        `a porta foi renomeada ou mudou de forma. Ache-a, confira à mão que ela pergunta a \`travaODeclarar\` ANTES de resolver, e atualize a âncora deste varredor`);
      continue;
    }
    /* o corpo vai até a próxima declaração de mesmo nível — assim uma
       trava que esteja na função SEGUINTE não passa por esta */
    const fim = APP.indexOf("\n  const ", i + 10);
    const corpo = APP.slice(i, fim < 0 ? i + 4000 : fim);
    const pergunta = corpo.indexOf("travaODeclarar(guardadoRef.current)");
    /* e ANTES de resolver: a trava depois da resolução não trava nada */
    const resolve = Math.min(
      ...["adjudicarAcao(", "resolverAtaqueJogador(", "enviar(", "aplicarGolpeDoJogador("]
        .map((x) => { const k = corpo.indexOf(x); return k < 0 ? Infinity : k; }));
    if (pergunta < 0) {
      falha(`\`${p.nome}\` (${p.oQue}) NÃO pergunta a \`travaODeclarar\` — a porta está aberta`,
        `enquanto houver turno que o motor já rolou esperando narração, esta porta deixa o jogador rolar OUTRO. Uma queda de rede vira segunda chance de um resultado ruim, e isso não parece exploit: parece azar. Ponha, no TOPO da função, antes de qualquer resolução: \`if (travaODeclarar(guardadoRef.current)) { aMesaEspera(); return; }\` — é a linha exata que \`declararGolpe\` e \`agirInterno\` já usam`);
    } else if (resolve !== Infinity && pergunta > resolve) {
      falha(`\`${p.nome}\` pergunta a \`travaODeclarar\` DEPOIS de começar a resolver`,
        "trava depois da resolução não trava nada: o dado já caiu. Suba a linha para o topo da função");
    } else ok(`\`${p.nome}\` pergunta à trava antes de resolver`);
  }

  /* a resposta da trava é de MUNDO, como o resto: a mesa espera, e não
     "há um turno pendente no buffer" */
  if (!/const aMesaEspera = |aMesaEspera\s*=\s*\(/.test(APP)) {
    falha("não achei `aMesaEspera` em src/App.jsx",
      "é a resposta que as portas dão quando a trava morde, e ela é a voz de mundo do bloqueio. Se mudou de nome, atualize este varredor — e confira que a frase nova não diz o nome do mecanismo");
  } else ok("e a resposta da trava tem voz de mundo (`aMesaEspera`)");

  /* a suíte também é leitor: o módulo inteiro é lido de volta por ela */
  const suite = readFileSync("teste-guardado.mjs", "utf8");
  const faltam = ["MOTIVOS_DO_SILENCIO", "SELOS_DO_RESOLVIDO", "IMPRESSAO_FNV", "SEM_GUARDADO",
    "lerOSilencio", "ehTurnoResolvido", "marcaDoTurno", "guardarTurno", "maisUmaTentativa",
    "oQueNarrar", "travaODeclarar"].filter((n) => !new RegExp("\\b" + n + "\\b").test(suite));
  if (faltam.length) {
    falha(`export de guardado.js sem leitor na suíte: ${faltam.join(", ")}`,
      "a lei é \"export morto mente\": toda regra exportada precisa de ≥2 leitores, e a suíte é um deles. Toque o export em teste-guardado.mjs — ou, se ele não tem razão de existir, apague-o de src/guardado.js");
  } else ok("a suíte toca todos os exports de guardado.js");
}

console.log(maus ? `\n${maus} regressão(ões) de X3 no código` : "\no turno guardado segue de pé");
process.exit(maus ? 1 : 0);
