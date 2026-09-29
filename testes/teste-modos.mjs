/* OS MODOS (v9.213) — a moldura das mesas

   A lei-mãe do documento As Duas Mesas: modo é LENTE sobre o motor,
   nunca segundo jogo. Esta suíte guarda as três garantias da moldura:
   o preset historia não muda um bit do jogo atual (regressão zero —
   quem prova é a suíte inteira continuar verde); save é território
   (espaços separados, o da historia é EXATAMENTE a chave de sempre);
   e o modo viaja no save, imutável. */

const RAIZ = "../src/";
const M = await import(RAIZ + "modos.js");
const { readFileSync } = await import("node:fs");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));

/* extrai o corpo de uma função pelo nome da âncora, por chave balanceada —
   nunca por número de linha (a lei do CLAUDE.md: linha muda, âncora não).
   Pula os parênteses dos parâmetros (que podem ter desestruturação com
   chaves próprias, como TelaMenu({ irNovo, irNoite, ... })) antes de
   procurar a chave que abre o CORPO da função. */
const corpoDaFuncao = (fonte, ancora) => {
  const ini = fonte.indexOf(ancora);
  if (ini < 0) return null;
  const parenAbre = fonte.indexOf("(", ini);
  if (parenAbre < 0) return null;
  let profParen = 0, fimParams = -1;
  for (let i = parenAbre; i < fonte.length; i++) {
    if (fonte[i] === "(") profParen++;
    else if (fonte[i] === ")") { profParen--; if (profParen === 0) { fimParams = i; break; } }
  }
  if (fimParams < 0) return null;
  const abre = fonte.indexOf("{", fimParams);
  if (abre < 0) return null;
  let prof = 0;
  for (let i = abre; i < fonte.length; i++) {
    if (fonte[i] === "{") prof++;
    else if (fonte[i] === "}") { prof--; if (prof === 0) return fonte.slice(abre, i + 1); }
  }
  return null;
};
const TELA_MENU = corpoDaFuncao(APP, "function TelaMenu(");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. o catálogo: três modos, historia é o default absoluto");
{
  t("são 3 modos", M.MODOS.length === 3, String(M.MODOS.length));
  t("ids únicos", new Set(M.MODOS.map((m) => m.id)).size === 3);
  t("historia, rapida, duelo", ["historia", "rapida", "duelo"].every((id) => M.MODOS.some((m) => m.id === id)));
  t("o padrão é historia", M.MODO_PADRAO === "historia");
  t("lixo vira historia (todo save antigo É historia)", M.garantirModo(null) === "historia" && M.garantirModo("pvp") === "historia" && M.garantirModo(42) === "historia");
  t("modoPorId erra para o default", M.modoPorId("nada").id === "historia");
  t("os nomes são voz de mundo (nunca 'modo', 'frenético', 'pvp')", M.MODOS.every((m) => !/modo|fren|pvp/i.test(m.nome)));
}

sec("2. SAVE É TERRITÓRIO — e o da historia é a chave de sempre");
{
  t("o espaço da historia é EXATAMENTE taverna_save_v1", M.espacoDoSave("historia") === "taverna_save_v1");
  t("o backup da historia é EXATAMENTE taverna_save_anterior (legado)", M.espacoAnterior("historia") === "taverna_save_anterior");
  t("três espaços distintos", new Set(M.MODOS.map((m) => m.espaco)).size === 3);
  t("três backups distintos", new Set(M.MODOS.map((m) => m.espacoAnterior)).size === 3);
  t("lixo cai no território da historia", M.espacoDoSave(undefined) === "taverna_save_v1");
}

sec("3. o modo viaja no save, imutável");
{
  t("save sem campo modo é historia", M.modoDoSave({}) === "historia" && M.modoDoSave(null) === "historia");
  t("save de rapida abre em rapida", M.modoDoSave({ modo: "rapida" }) === "rapida");
  t("modo inventado no save saneia para historia", M.modoDoSave({ modo: "hardcore" }) === "historia");
}

sec("4. os botões do preset");
{
  t("todo modo declara os botões completos", M.MODOS.every((m) => ["geracao", "ritmoDoEpisodio", "tetoDeCenas", "pratos", "dormentes", "fama", "narrador", "conversao"].every((b) => m.botoes[b] !== undefined)));
  t("a historia não dorme nada e não tem teto (regressão zero em preset)", M.botoesDoModo("historia").dormentes.length === 0 && M.botoesDoModo("historia").tetoDeCenas === 0 && M.botoesDoModo("historia").ritmoDoEpisodio === "dia");
  t("a rapida tem os dois pratos e teto 3 (lei ix)", M.botoesDoModo("rapida").pratos.join(",") === "capitulo,torneio" && M.botoesDoModo("rapida").tetoDeCenas === 3);
  t("na rapida dormem os de fôlego longo", ["dominios", "guildas", "reino", "correio"].every((x) => M.dorme("rapida", x)));
  t("o duelo é seco e sem conversão (leis vi e do custo)", M.botoesDoModo("duelo").narrador === "seco" && M.botoesDoModo("duelo").conversao === false);
  t("dorme() responde e erra em silêncio", M.dorme("historia", "dominios") === false && M.dorme("rapida", "mesa") === false);
}

sec("5. ligado ao jogo");
{
  t("o App importa os modos", /from "\.\/modos\.js"/.test(APP));
  t("o App importa modoNaPorta (a porta do beta, MM0)", /modoNaPorta.*from "\.\/modos\.js"/.test(APP));
  t("há um modoRef nascendo no padrão", /modoRef = useRef\(MODO_PADRAO\)/.test(APP));
  t("o modo viaja no save", /modo: garantirModo\(modoRef\.current\)/.test(APP));
  t("o load lê o modo do save (imutável: quem carrega entra no modo dele)", (APP.match(/modoRef\.current = modoDoSave\(sv\)/g) || []).length >= 2);
  /* a garantia dura: NENHUMA literal de chave de save sobrou no código —
     toda leitura e escrita passa pelo território do modo */
  t("nenhuma literal taverna_save_v1 fora de modos.js", !/["']taverna_save_v1["']/.test(APP));
  t("nenhuma literal taverna_save_anterior fora de modos.js", !/["']taverna_save_anterior["']/.test(APP));
  t("as chaves derivam do modo", /chaveDoSave = \(\) => espacoDoSave\(modoRef\.current\)/.test(APP));
}

sec("MM0 · a porta do beta — sai a porta, não o código");
{
  t("a porta do beta só tem historia", Array.isArray(M.MODOS_DO_BETA) && M.MODOS_DO_BETA.length === 1 && M.MODOS_DO_BETA[0] === "historia", JSON.stringify(M.MODOS_DO_BETA));
  t("o padrão está na porta (o menu nunca fica sem porta)", M.MODOS_DO_BETA.includes(M.MODO_PADRAO));
  t("todo id da porta existe em MODOS", M.MODOS_DO_BETA.every((id) => M.MODOS.some((m) => m.id === id)));
  t("historia está na porta", M.modoNaPorta("historia") === true);
  t("rapida e duelo saem do menu", M.modoNaPorta("rapida") === false && M.modoNaPorta("duelo") === false);
  t("lixo não abre porta", [
    "lixo", null, undefined, 42, {}, "", "HISTORIA",
  ].every((x) => M.modoNaPorta(x) === false));
  /* a regressão zero dos saves: a porta fecha, o território fica.
     Os literais são os de antes do MM0 — se mudarem, um save some. */
  t("save de rapida continua rapida", M.modoDoSave({ modo: "rapida" }) === "rapida");
  t("save de duelo continua duelo", M.modoDoSave({ modo: "duelo" }) === "duelo");
  t("o espaço da rapida não muda de sítio", M.espacoDoSave("rapida") === "taverna_rapida_v1" && M.espacoAnterior("rapida") === "taverna_rapida_v1_anterior");
  t("o espaço do duelo não muda de sítio", M.espacoDoSave("duelo") === "taverna_duelo_v1" && M.espacoAnterior("duelo") === "taverna_duelo_v1_anterior");
  t("o catálogo continua com os três modos", M.MODOS.length === 3 && M.garantirModo("rapida") === "rapida" && M.garantirModo("duelo") === "duelo");

  /* a fiação: TelaMenu não decide por nome de modo solto — pergunta à
     porta. Corpo extraído por âncora balanceada, nunca por linha. */
  t("o corpo de TelaMenu foi encontrado", !!TELA_MENU && TELA_MENU.length > 200);
  t("TelaMenu chama modoNaPorta(\"rapida\")", TELA_MENU && /modoNaPorta\(\s*"rapida"\s*\)/.test(TELA_MENU));
  t("TelaMenu chama modoNaPorta(\"duelo\")", TELA_MENU && /modoNaPorta\(\s*"duelo"\s*\)/.test(TELA_MENU));
  t("o cartão de Uma Noite (onClick={irNoite}) está atrás da porta \"rapida\"",
    TELA_MENU && /modoNaPorta\(\s*"rapida"\s*\)\s*&&\s*<button onClick=\{irNoite\}/.test(TELA_MENU));
  t("o cartão de Duelo (onClick={irDuelo}) está atrás da porta \"duelo\"",
    TELA_MENU && /modoNaPorta\(\s*"duelo"\s*\)\s*&&\s*<button onClick=\{irDuelo\}/.test(TELA_MENU));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
