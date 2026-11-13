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
  const m = APP.match(/const O_ARQUIVISTA_NA_TELA = Object\.freeze\(\{([^}]*)\}\);/);
  t("a tabela O_ARQUIVISTA_NA_TELA existe no App", !!m);
  t("o recalibrar do save está desligado", !!m && /\bsave:\s*false\b/.test(m[1]));
  t("o recalibrar da ascensão está desligado", !!m && /\bascensao:\s*false\b/.test(m[1]));
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

console.log(`\no arquivista fora (NE3): ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
