/* teste-peca-escolha.mjs (K4) — o alvo de toque sai de tabela, ou sai da
   aritmética de padding?

   A DOENÇA, com endereço: a fila de quatro pílulas da ficha
   (`App.jsx:1994-2002`, hoje) media 27,5 px onde `formas.md` desenha
   *A escolha* `Forma=Pílula` a 47/48 — e a causa não era enchimento, era
   que a peça NUNCA EXISTIU EM CÓDIGO. A fila copiou a pílula vizinha à
   mão e herdou com ela três defeitos de gramática (`mente/k4-desenho.md`
   §1.2): preenchimento âmbar cheio (proibido por `formas.md:363-367`),
   borda `T.line` (1,295:1, reprova o SC 1.4.11) e `aria-pressed`
   ausente.

   Conta se prova, tela se olha (`CLAUDE.md`): `PilulaDeEscolha` é JSX e
   não se instancia em Node. O que se prova aqui é a TABELA (importada,
   nunca transcrita) e o TEXTO dos arquivos que a peça toca — exatamente
   como `check-endereco-do-tabuleiro.mjs` já prova uma decisão de cor. */

const RAIZ = "../src/";
const { ALVOS } = await import(RAIZ + "estilo.js");
const { readFileSync } = await import("node:fs");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const uiTexto = readFileSync(RAIZ + "ui.jsx", "utf8");
const appTexto = readFileSync(RAIZ + "App.jsx", "utf8");
const painelTexto = readFileSync(RAIZ + "painel-reacao.jsx", "utf8");
const estiloTexto = readFileSync(RAIZ + "estilo.js", "utf8");

/* ============================================================
   A. A TABELA, LIDA DE VOLTA (import, nunca transcrição)
   ============================================================ */
sec("A. ALVOS — o piso do alcance, lido de volta");
t("1. ALVOS.piso >= 44 — WCAG 2.5.5 (AAA) e o piso escrito em D4", ALVOS.piso >= 44, `piso é ${ALVOS.piso}`);
t("2. ALVOS.piso >= 24 — WCAG 2.5.8 (AA)", ALVOS.piso >= 24, `piso é ${ALVOS.piso}`);
t("3. ALVOS.chamado >= ALVOS.piso — peça mais alta nunca desce abaixo do piso", ALVOS.chamado >= ALVOS.piso, `chamado ${ALVOS.chamado} · piso ${ALVOS.piso}`);
t("4. Object.keys(ALVOS).length >= 2 — uma tabela renomeada mede zero", Object.keys(ALVOS).length >= 2, `tem ${Object.keys(ALVOS).length}`);

/* ============================================================
   B. A PEÇA (texto de src/ui.jsx)
   ============================================================ */
sec("B. PilulaDeEscolha, em src/ui.jsx");
const defPilula = /export function PilulaDeEscolha\(/.test(uiTexto);
t("5. PilulaDeEscolha existe e é exportada", defPilula);

/* Recorta só o corpo da função, para não confundir com outra peça do
   mesmo arquivo (CartaoDeEscolha já usa `border` e `T.panel` também). */
const corpoPilula = (() => {
  const i = uiTexto.indexOf("export function PilulaDeEscolha(");
  if (i < 0) return "";
  /* o primeiro "{" depois de "i" é o da DESESTRUTURAÇÃO dos parâmetros
     (`({ rotulo, … })`), não o do corpo — por isso a busca do "{" parte
     do ")" que fecha a lista de parâmetros, não de "i". */
  const iParen = uiTexto.indexOf(")", i);
  const iAbre = uiTexto.indexOf("{", iParen);
  let nivel = 0, j = iAbre;
  for (; j < uiTexto.length; j++) {
    if (uiTexto[j] === "{") nivel++;
    else if (uiTexto[j] === "}") { nivel--; if (nivel === 0) break; }
  }
  return uiTexto.slice(i, j + 1);
})();

t("6. o corpo contém minHeight: ALVOS.piso", /minHeight:\s*ALVOS\.piso/.test(corpoPilula), corpoPilula.slice(0, 40));
t("7. e NÃO contém minHeight: seguido de dígito — a altura nunca é literal", !/minHeight:\s*\d/.test(corpoPilula));
t("8. e NÃO contém background: T.amber — a gramática do escolhido não enche de âmbar", !/background:\s*T\.amber\b/.test(corpoPilula));
t("9. e contém T.lineStrong e não T.line (puro) na borda — SC 1.4.11", /T\.lineStrong\b/.test(corpoPilula) && !/T\.line\b(?!Strong)/.test(corpoPilula));
t("10. e contém aria-pressed — SC 4.1.2", /aria-pressed/.test(corpoPilula));
t('11. e contém width: "1ch" — a coluna do visto não colapsa', /width:\s*"1ch"/.test(corpoPilula));

/* ============================================================
   C. A FIADA (texto de src/App.jsx)
   ============================================================ */
sec("C. a fila da ficha, em src/App.jsx");
const iGolpe = appTexto.indexOf('aria-label="Quando um golpe chega"');
const blocoGolpe = iGolpe < 0 ? "" : appTexto.slice(Math.max(0, iGolpe - 600), iGolpe + 900);
t('12. o bloco "QUANDO UM GOLPE CHEGA" contém <PilulaDeEscolha', /<PilulaDeEscolha/.test(blocoGolpe), iGolpe < 0 ? "aria-label não encontrado" : undefined);
t("13. e NÃO contém rounded-full — a pílula à mão não voltou", !/rounded-full/.test(blocoGolpe));
t('14. e contém role="group"', /role="group"/.test(blocoGolpe));

/* ============================================================
   D. O OUTRO LEITOR (texto de src/painel-reacao.jsx)
   ============================================================ */
sec("D. o outro leitor de ALVOS, em src/painel-reacao.jsx");
t("15. contém ALVOS.piso e ALVOS.chamado", /ALVOS\.piso/.test(painelTexto) && /ALVOS\.chamado/.test(painelTexto));
t("16. e NÃO contém minHeight: <dígito> — a altura também não é literal aqui", !/minHeight:\s*\d/.test(painelTexto));

/* ============================================================
   E. A CATRACA DO ANEL DE FOCO (achado vivo no navegador, K4)

   A primeira versão da peça escrevia `boxShadow` no `style` inline (o
   filete do escolhido) — e estilo inline vence SEMPRE folha de estilo.
   O anel de foco (`.tv-anel-foco:focus-visible`) também é `box-shadow`,
   e o inline apagava-o nos quatro estados: uma regressão que nenhuma
   das 16 asserções acima apanhava, porque nenhuma olhava para
   `boxShadow`. Esta é a asserção que teria apanhado isto no dia em que
   nasceu — o filete tem de sair por variável CSS (`--tv-filete`), nunca
   por `boxShadow` direto, porque é a folha (estilo.js) que compõe o
   filete com o anel, não o componente. */
sec("E. o anel de foco não pode ser apagado (boxShadow inline apaga box-shadow da folha)");
t("17. o corpo NÃO contém boxShadow — o filete vai por --tv-filete, nunca por box-shadow inline", !/boxShadow/.test(corpoPilula), corpoPilula.match(/.{0,20}boxShadow.{0,20}/) || "");

/* 18 · achado vivo, segunda rodada (K4): "none" não é item de lista de
   sombras — box-shadow: sombra, sombra, none é CSS INVÁLIDO, e o
   navegador descarta a declaração inteira EM SILÊNCIO (nenhum erro no
   console). A asserção 17 prova que boxShadow não é mais inline; esta
   prova a causa real do anel apagado: nem o valor de repouso em
   ui.jsx, nem os fallbacks de var() em estilo.js, podem valer "none" —
   têm de ser uma SOMBRA NULA (inset 0 0 0 0 transparent), que também é
   o que faz a transição de 120ms interpolar em vez de saltar. */
const varsFilete = estiloTexto.match(/var\(--tv-filete,\s*[^)]*\)/g) || [];
t("18a. nenhum fallback de var(--tv-filete, …) em estilo.js vale none", varsFilete.length > 0 && varsFilete.every((v) => !/,\s*none\s*\)/.test(v)), varsFilete.join(" | "));
t('18b. o valor de repouso de --tv-filete em ui.jsx não é "none"', /"--tv-filete":\s*escolhida\s*\?[^:]*:\s*"[^"]+"/.test(corpoPilula) && !/"--tv-filete":\s*escolhida\s*\?[^:]*:\s*"none"/.test(corpoPilula));

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
