/* NE3 · O ARQUIVISTA FORA DA TELA (13/11/2026, Fase NE)

   A regra da fase, aprovada pela pessoa: «nenhuma IA escreve estado de
   jogo». Atrás de dois botões — «recalibrar save antigo» (Perícias e
   detalhes, na ficha) e «Recalibrar ascensão» (painel Ascensão) — moravam
   três chamadas de IA, o Arquivista, que reescreviam nível, atributos, XP,
   companheiros, NPCs, potências, cidades, guilda e divindade a partir da
   leitura da lenda. Era a porta mais larga por onde o inventado virava
   ficha. Os botões saíram; o código das chamadas ficou, e voltar é trocar
   um `false` por `true` na tabela O_ARQUIVISTA_NA_TELA do App.

   Esta catraca prende três coisas:
   1. nenhum caminho vivo da tela chega às chamadas do Arquivista;
   2. nenhum texto da tela ainda manda o jogador ao Recalibrar;
   3. o modo do Narrador chega às duas peças que não o recebiam
      (`portasDaLuta` → aLutaDaResposta, e aMesaDoTurno) — a defesa em
      camadas: a resposta já chega filtrada, mas a peça confere de novo. */

import { readFileSync } from "node:fs";

const ler = (rel) => readFileSync(new URL(rel, import.meta.url), "utf8");
/* sem comentário: o comentário que conta a história do Arquivista não é
   caminho vivo, e não pode nem acusar nem absolver */
const semComentarios = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(ler("../src/App.jsx"));
const ASC = semComentarios(ler("../src/painel-ascensao.jsx"));

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);
const conta = (txt, re) => (txt.match(re) || []).length;

sec("1. A TABELA DESLIGA O ARQUIVISTA");
{
  /* MOVIDA (13/11, NE2): a tabela deixou de ser o literal
     `{ save: false, ascensao: false }` e passou a ler as portas
     `arquivistaDoSave`/`arquivistaDaAscensao` de PORTAS_DO_NARRADOR — uma
     verdade só, fechada em todo modo pela marca sempreFechada do motor. A
     intenção é a mesma (os botões não aparecem); a prova passa a ser a
     leitura da porta + o valor que a porta dá em cada modo. */
  const m = APP.match(/const O_ARQUIVISTA_NA_TELA = \(\(\) => \{([\s\S]*?)\n\}\)\(\);/);
  t("a tabela O_ARQUIVISTA_NA_TELA existe no App", !!m);
  t("o recalibrar do save lê a porta arquivistaDoSave", !!m && /\bsave:\s*portaAberta\("arquivistaDoSave",\s*MODO_DA_MESA\)/.test(m[1]));
  t("o recalibrar da ascensão lê a porta arquivistaDaAscensao", !!m && /\bascensao:\s*portaAberta\("arquivistaDaAscensao",\s*MODO_DA_MESA\)/.test(m[1]));
  t("se a porta estourar, os dois ficam desligados", !!m && /catch\s*\{\s*return Object\.freeze\(\{\s*save:\s*false,\s*ascensao:\s*false\s*\}\);/.test(m[1]));
  const { portaAberta } = await import("../src/motor/portas-do-narrador.js");
  t("e a porta dá desligado em todo modo (o mestre, o de hoje, incluído)",
    ["mestre", "boca", "ator", undefined].every((md) => !portaAberta("arquivistaDoSave", md) && !portaAberta("arquivistaDaAscensao", md)));
}

sec("2. NENHUM CAMINHO VIVO CHEGA ÀS CHAMADAS");
{
  /* as três funções só podem ser lidas nas suas definições, na cadeia
     interna (recalibrarSave → recalibrarLenda → recalibrarMundo) e nos dois
     pontos que a tabela guarda — nunca num onClick ou numa prop crua */
  t("o painel lateral recebe o save só pela tabela",
    APP.includes("recalibrarSave={O_ARQUIVISTA_NA_TELA.save ? recalibrarSave : null}"));
  t("o painel lateral recebe a ascensão só pela tabela",
    APP.includes("onRecalibrarAsc={O_ARQUIVISTA_NA_TELA.ascensao ? recalibrarAscensao : null}"));
  /* o único `={recalibrarSave}` vivo é o onClick dentro do PainelLateral,
     que lê a prop (null) e só desenha o botão se ela existir */
  t("recalibrarSave cru só aparece no onClick guardado do painel lateral",
    conta(APP, /=\{\s*recalibrarSave\s*\}/g) === 1
    && /\{recalibrarSave && \(\s*<button onClick=\{recalibrarSave\}/.test(APP));
  t("nenhuma prop passa recalibrarAscensao crua", conta(APP, /=\{\s*recalibrarAscensao\s*\}/g) === 0);
  t("nenhum onClick do App chama recalibrarLenda/Mundo/Ascensao direto",
    conta(APP, /onClick=\{[^}]*recalibrar(Lenda|Mundo|Ascensao)/g) === 0);
  /* quem chama recalibrarLenda: só recalibrarSave (a cadeia) e a definição */
  t("recalibrarLenda só é chamada pela cadeia do save", conta(APP, /recalibrarLenda\(\)/g) === 1);
  t("recalibrarMundo só é chamada pela cadeia do save", conta(APP, /recalibrarMundo\(\)/g) === 1);
  t("recalibrarAscensao nunca é chamada diretamente", conta(APP, /recalibrarAscensao\(\)/g) === 0);
  /* o painel Ascensão só desenha o botão se o App entregar o manejador */
  const cliques = conta(ASC, /onClick=\{onRecalibrar\}/g);
  const guardados = conta(ASC, /onRecalibrar && (\(\s*)?<button onClick=\{onRecalibrar\}/g);
  t("o painel Ascensão tem os dois botões de recalibrar", cliques === 2);
  t("os dois botões do painel Ascensão estão guardados por onRecalibrar", guardados === cliques);
}

sec("3. NENHUM TEXTO DA TELA MANDA AO RECALIBRAR");
{
  t("o aviso do save veterano não aponta para o Recalibrar", !/use ⚖ Recalibrar/.test(APP));
  t("o aviso do save veterano ainda anuncia a Ascensão",
    /Ascensão desbloqueada \(nível/.test(APP));
  t("a explicação do Recalibrar no painel só aparece com o botão",
    /onRecalibrar && <div[^>]*>Já é divindade na história\?/.test(ASC));
}

sec("4. O MODO DO NARRADOR CHEGA À LUTA E À MESA");
{
  const luta = APP.match(/const portasDaLuta = \(\) => \(\{([\s\S]*?)\n  \}\);/);
  t("portasDaLuta existe", !!luta);
  t("portasDaLuta entrega modoDoNarrador: MODO_DA_MESA",
    !!luta && /\bmodoDoNarrador:\s*MODO_DA_MESA\b/.test(luta[1]));
  const mesa = APP.match(/aMesaDoTurno\(\{([^\n]*?)\}\)/);
  t("aMesaDoTurno é chamada no App", !!mesa);
  t("aMesaDoTurno recebe modoDoNarrador: MODO_DA_MESA",
    !!mesa && /\bmodoDoNarrador:\s*MODO_DA_MESA\b/.test(mesa[1]));

  /* e o campo não é enfeite: as peças leem-no. Num modo que fecha a mesa,
     o que o Narrador declarou não conta o turno como ganho. */
  const { aMesaDoTurno } = await import("../src/motor/fecho-da-resposta.js");
  const { portaAberta } = await import("../src/motor/portas-do-narrador.js");
  const base = { textura: {}, mudancas: { moedas: 50 }, combate: null, mesa: undefined, folego: undefined, lugares: [] };
  const aberta = aMesaDoTurno({ ...base, modoDoNarrador: "mestre" });
  const fechada = aMesaDoTurno({ ...base, modoDoNarrador: "ator" });
  t("o modo ator fecha a porta da mesa", portaAberta("mesa", "ator") === false);
  t("aMesaDoTurno lê o modo: o declarado conta no mestre e não no ator",
    JSON.stringify(aberta.mesa) !== JSON.stringify(fechada.mesa));
  /* que aLutaDaResposta LÊ o modo das portas não se prova aqui pelo texto
     do motor: a catraca de teste-assercoes-de-texto proíbe suíte que lê
     src/motor/ (o motor prova-se jogando). Essa prova é da suíte da luta e
     de teste-nada-entra-pelo-ator; aqui fica só a fiação do App. */
}

sec("5. AS PORTAS DE FORA DA TABELA LEEM O MODO NO APP (NE2, 13/11)");
{
  /* a peça de cada porta mora no motor e já lê `modoDoNarrador`; o que só o
     App podia fazer era passá-lo. Sem ele, a peça corre sempre no padrão. */
  const { portaAberta, oPedidoDoModo } = await import("../src/motor/portas-do-narrador.js");
  t("o perigo: oPerigoDaResposta recebe o modo",
    /oPerigoDaResposta\(\{[^\n]*\bmodoDoNarrador:\s*MODO_DA_MESA\b[^\n]*\}, portasDoFecho\(\)\)/.test(APP));
  t("o «visto» do livro: oQueACenaDaAoLivro recebe o modo",
    /oQueACenaDaAoLivro\(rl, \{[^}]*\bmodoDoNarrador:\s*MODO_DA_MESA\b/.test(APP));
  t("o alvo do ataque: lerAgressao recebe o modo",
    /lerAgressao\(acao, \{[^\n]*\bmodoDoNarrador:\s*MODO_DA_MESA\b/.test(APP));
  const prometida = APP.match(/const contextoDaLutaPrometida = \(\) => \{([\s\S]*?)\n  \};/);
  t("a luta prometida: o contexto leva o modo",
    !!prometida && /return \{ presentes, mostrado, modoDoNarrador: MODO_DA_MESA \};/.test(prometida[1]));
  const nucleo = APP.match(/const nucleoEmCena = \(nucleo\) => \{([\s\S]*?)\n  \};/);
  t("o núcleo das falas: a fala do Mestre só conta com a porta nucleoDaFala aberta",
    !!nucleo && /portaAberta\("nucleoDaFala", MODO_DA_MESA\)/.test(nucleo[1]) && /const fala = falaAberta \? /.test(nucleo[1]));
  t("e a porta do núcleo abre no mestre (o de hoje igual) e fecha no boca", portaAberta("nucleoDaFala", "mestre") && !portaAberta("nucleoDaFala", "boca"));
  /* o pedido do ator ia colado ao NOME do modo; o `boca` fecha as portas e
     recebe o pedido do mestre, e por isso o App lê a coluna `pedido` */
  t("o pedido do ator sai da coluna pedido (oPedidoDoModo), não do nome do modo",
    !/MODO_DA_MESA === "ator"/.test(APP) && /pedidoDoModo = oPedidoDoModo\(MODO_DA_MESA\)/.test(APP) && /if \(pedidoDoModo === "ator"\) \{ try \{ pedidoDoAtor = oPedidoDoAtor\(/.test(APP));
  t("e a coluna dá: boca → mestre, ator → ator, mestre → mestre", oPedidoDoModo("boca") === "mestre" && oPedidoDoModo("ator") === "ator" && oPedidoDoModo("mestre") === "mestre");
}

sec("6. O LÉXICO É DA TABELA (NE6, 13/11)");
{
  const corpo = APP.match(/const lerOMundo = async \(m, [^\n]*\n([\s\S]*?)\n  \};/);
  t("lerOMundo existe", !!corpo);
  t("lerOMundo chama lexicoDoMundo com a semente da campanha", !!corpo && /lexicoDoMundo\(m, \{ semente: sementeMundo\(\) \}\)/.test(corpo[1]));
  t("e não chama mais o modelo", !!corpo && !/chamarModelo\(/.test(corpo[1]) && !/pedidoDoLexico\(/.test(corpo[1]));
  t("a tela de criação não fala do Léxico nem do modelo", !/O Léxico lê estas escolhas/.test(APP));
  const { lexicoDoMundo } = await import("../src/lexico-do-mundo.js");
  const m = { genero: "Fantasia medieval" };
  t("a mesma semente dá o mesmo léxico (o mundo que o App grava é determinístico)",
    JSON.stringify(lexicoDoMundo(m, { semente: "aventura|Fantasia medieval" })) === JSON.stringify(lexicoDoMundo(m, { semente: "aventura|Fantasia medieval" })));
  t("e o léxico da tabela é sempre gerado (o «não consegui ler o mundo» deixa de acontecer)", lexicoDoMundo(m, { semente: "x" }).gerado === true && lexicoDoMundo(null, {}).gerado === true);
}

sec("7. A MEDIDA DA NE9 NA LINHA DA SESSÃO (13/11)");
{
  t("o cânone recusado vai à linha da sessão, depois do aceito do Cronista e em calou",
    /doTurno\.paraASessao\.cronista\.recusadoDoCanone = fim\.recusadoDoCanone; \} catch \(e\) \{ calou\("a sessão \(o cânone recusado\)", e\); \}/.test(APP)
    && APP.indexOf("fim.recusadoDoCanone") > APP.indexOf("fim = oAceitoDoCronista("));
}

console.log(`\no arquivista fora (NE3): ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
