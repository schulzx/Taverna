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
  t("há um modoRef nascendo no padrão", /modoRef = useRef\(MODO_PADRAO\)/.test(APP));
  t("o modo viaja no save", /modo: garantirModo\(modoRef\.current\)/.test(APP));
  t("o load lê o modo do save (imutável: quem carrega entra no modo dele)", (APP.match(/modoRef\.current = modoDoSave\(sv\)/g) || []).length >= 2);
  /* a garantia dura: NENHUMA literal de chave de save sobrou no código —
     toda leitura e escrita passa pelo território do modo */
  t("nenhuma literal taverna_save_v1 fora de modos.js", !/["']taverna_save_v1["']/.test(APP));
  t("nenhuma literal taverna_save_anterior fora de modos.js", !/["']taverna_save_anterior["']/.test(APP));
  t("as chaves derivam do modo", /chaveDoSave = \(\) => espacoDoSave\(modoRef\.current\)/.test(APP));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
