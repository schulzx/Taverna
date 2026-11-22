/* A CATRACA DO PT-BR (lote 2 do lançamento, S1 — a ordem de 15/11/2026).

   A pessoa: «Use a língua PT-BR em tudo». O sistema escrevia em português de
   Portugal e o Narrador em português do Brasil, na mesma página: «+17 XP ·
   um sítio por onde nunca tinhas passado», «A TUA VEZ», «precisas de 9+»,
   «as que faltam abrem-se pelo caminho», «bónus».

   O QUE SE LÊ: as STRINGS de src/** (.js e .jsx) — literais, o texto dos
   template-literais e o texto de JSX —, nunca os comentários nem as regex.
   O parser é o @babel/parser que o Vite já traz. Chaves de objeto, fontes de
   import e strings de uma palavra só em minúsculas-com-hífen/underscore (ids)
   não contam.

   O QUE FALHA: as marcas de PT-PT em MARCAS (segunda pessoa do singular,
   ênclise lusitana, gerúndio «a fazer», léxico). Cada marca é uma regex com
   nome, e cada achado diz o arquivo, a linha e a frase.

   AS EXCEÇÕES, NOMEADAS: `ISENTOS` são os catálogos que LEEM a frase do
   jogador — o que ele escreve em PT-PT tem de continuar a valer («apanho»,
   «examino o sítio», «tu»). Um catálogo isenta-se pelo nome da variável (ou
   da chave do objeto) que o guarda, no arquivo dele, com o motivo. `FRASES`
   isenta uma frase exata, com o motivo.

   O TETO: a reescrita é maior do que um agente, e por isso a catraca começa
   com um teto POR ARQUIVO (`TETO`) que só desce: um arquivo que passa do teto
   falha; um que fica abaixo dele também falha (folga zero — baixe o número).
   Arquivo fora da tabela tem teto 0.

   `node check-pt-br.mjs --medir` imprime a contagem por arquivo e por marca
   sem falhar; `--listar <arquivo>` lista os achados de um arquivo. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const require = createRequire(import.meta.url);
const { parse } = require("@babel/parser");

/* ---------------- AS MARCAS ---------------- */
/* O \b do JavaScript é ASCII: «pés» tem fronteira antes do «é», e «és»
   casaria dentro dele. As fronteiras daqui são de letra Unicode. */
const B = "(?<![\\p{L}\\p{N}_])", E = "(?![\\p{L}\\p{N}_])";
const palavras = (lista) => new RegExp(B + "(?:" + lista.trim().split(/\s+/).join("|") + ")" + E, "iu");
const VERBOS_2SG = `estás usaste gastaste tentaste conseguiste tens podes queres ficas precisas chegas sabes vais fazes vês és tinhas estavas podias querias deves consegues encontras ouves sentes ganhas perdes trazes vens dizes segues entras escolhes decides tentas sobes desces morres arriscas recuas aguentas jogas pensas lembras olhas vês pedes dás viveste foste fizeste tiveste disseste viste pudeste quiseste estiveste soubeste vieste puseste trouxeste saíste caíste partiste ouviste sentiste perdeste venceste morreste escolheste comeste bebeste andaste passaste chegaste entraste ficaste deixaste levaste mataste salvaste encontraste pagaste ganhaste falaste pediste abriste sabias havias fosses tivesses pudesses quisesses sejas tenhas possas queiras faças digas vejas venhas saibas estejas vás fores tiveres puderes quiseres souberes vieres fizeres disseres estiveres ganhares perderes ganhes percas`;
/* o imperativo de você com -se, que o Brasil escreve assim («Lembre-se:», «Sente-se, criança») */
const IMPERATIVOS_COM_SE = new Set(["lembre-se", "sente-se", "aproxime-se", "junte-se", "apresente-se", "afaste-se", "esconda-se", "prepare-se", "cuide-se", "levante-se", "acalme-se", "renda-se"]);
const MARCAS = [
  /* a segunda pessoa do singular */
  ["tu", palavras("tu")],
  ["teu/tua", palavras("teu teus tua tuas")],
  ["ti/contigo", palavras("ti contigo")],
  ["-te (ênclise)", new RegExp("\\p{L}-te" + E + "|\\p{L}-to" + E + "|\\p{L}-ta" + E, "u")],
  ["verbo na 2.ª pessoa", palavras(VERBOS_2SG)],
  /* a ênclise e a mesóclise lusitanas: o pronome DEPOIS do verbo conjugado
     («abre-se», «juntou-se», «diz-lhe»). Depois do infinitivo («sentar-se»,
     «enfrentá-la») e do gerúndio («baseando-se») é português do Brasil
     escrito, e não conta. */
  ["fá-lo/di-lo", palavras("fá-lo fá-la fá-los fá-las fê-lo fê-la di-lo di-la fi-lo fi-la pô-lo pô-la tê-lo-ia")],
  ["mesóclise", new RegExp("\\p{L}+-(?:se|me|te|lhe|nos|lo|la)-(?:ia|iam|á|ão|ei|emos|íamos)" + E, "iu")],
  ["ênclise no verbo conjugado", new RegExp(B + "(\\p{L}{2,})-(?:se|me|lhe|lhes|nos|vos|o|a|os|as)" + E + "(?!-)", "iu"),
    (m, antes) => !/(?:r|ndo|[áéíóô])-/i.test(m) && !IMPERATIVOS_COM_SE.has(m.toLowerCase()) && !(/[eêa]-(?:me|lhe|lhes|nos|o|a|os|as)$/i.test(m) && /(?:^|[.!?:;—–(«"]\s*)$/.test(antes))],
  /* o gerúndio lusitano: «está a fazer», «fica a saber» */
  ["a + infinitivo (gerúndio)", new RegExp(B + "(?:est(?:á|ão|ava|avam|ar|ou|ive|eve|eja|ejam|iver|ás)|and(?:a|am|ava|avam|ar|as)|fic(?:a|am|ou|ar|as|aram)|continu(?:a|am|ou|ar|as)) a \\p{L}+(?:ar|er|ir|or)" + E, "iu")],
  /* o léxico */
  ["bónus/génio/prémio…", palavras("bónus tónico tónica génio génios fenómeno fenómenos prémio prémios sénior económico económica económicos " +
    "académico académica atómico cómodo cómoda incómodo incómoda autónomo autónoma sinónimo anónimo anónima homónimo ténis cómico cómica " +
    "polémico polémica sónico irónico irónica crónico crónica pónei género géneros antónio idóneo erróneo harmónico harmónica " +
    "demónio demónios demónico cerimónia cerimónias património matrimónio abdómen colónia colónias insónia mónaco efémero efémera " +
    "fémur ténue ténues bebé bebés canónico canónica gnómico agrónomo astrónomo astronómico gastronómico cónego quilómetro quilómetros " +
    "tónus plutónio")],
  ["ecrã/telemóvel/ficheiro/utilizador/guião/equipa", palavras("ecrã ecrãs telemóvel telemóveis ficheiro ficheiros utilizador utilizadores guião guiões equipa equipas")],
  ["sítio (lugar)", palavras("sítio sítios")],
  ["connosco/convosco", palavras("connosco convosco")],
  /* depois de ponto é caminho de chave («racas.registo», «estado.factos»), não a palavra */
  ["registo", new RegExp("(?<![.])" + palavras("registo registos registar registou registei registam registada registado registados registadas regista registando").source, "iu")],
  ["facto", new RegExp("(?<![.])" + palavras("facto factos").source, "iu")],
  ["acção/actual/direcção…", palavras("acção acções actual actuais actualmente direcção direcções exacto exacta exactos exactas exactamente óptimo óptima " +
    "activo activa activos activas actor actores sector sectores objectivo objectivos projecto projectos colecção protecção selecção correcção " +
    "actualizar actualizado actualizada efectivo efectiva adoptar baptismo baptizado")],
  ["à volta (em volta)", /à volta(?![\p{L}])/u],
  ["vosso", palavras("vosso vossa vossos vossas")],
];

/* ---------------- AS EXCEÇÕES, NOMEADAS ---------------- */
/* Os catálogos que LEEM a frase do jogador: o que ele escreve em PT-PT
   continua a valer. Isenta as strings dentro da variável/chave `nome`. */
const ISENTOS = [
  /* Nenhum hoje: os catálogos de leitura do projeto são regex (literais, que
     o varredor não lê, ou fontes em string, que ehRegex reconhece). Quando um
     catálogo de PALAVRAS do jogador em string aparecer, entra aqui:
     { arquivo, nome, motivo }. */
];
/* uma frase exata, com o motivo */
const FRASES = [
  { frase: "Os de cima são tratados por «vós», e os iguais, por «tu»; xingar um deus em voz alta ainda é chamar desgraça para a casa.",
    motivo: "lexico-do-mundo.js: diz como a gente daquele mundo se trata — a palavra «tu» é o assunto, não a voz do sistema" },
];
/* arquivos que não são texto de jogo */
const FORA = [/\/acervo\/.*\.json$/];

/* ---------------- O TETO, POR ARQUIVO (só desce) ---------------- */
/* 15/11 (lote 2): medido antes da reescrita, 2904 marcas em 176 arquivos
   (a régua da primeira versão; com as fronteiras Unicode e as exceções de
   hoje, ~2336). Depois dela, só a PROSA das quests continua em PT-PT — o
   acervo escrito à mão, segunda pessoa e ênclise em cada frase, que pede
   reescrita literária e não troca por lista. É a próxima etapa, e o teto
   só desce. */
const TETO = {
  /* S1b (16/11): estes três voltaram ao texto de antes — a nota da forma, a dádiva e as descrições das classes saem nos dourados do motor (o bloco do App de antes) e no hash dos heróis prontos do cenário. Descem com a etapa da voz do motor. */
  "src/classes.js": 4,
  "src/habilidades.js": 2,
  "src/regras.js": 1,
  "src/biblioteca-de-quests.js": 299,  /* 22/11 (a décima sessão do Mestre vivo): os ganchos com «tu» e a quest O Que Desce ao Anoitecer em PT-BR; (a décima primeira): as cartas e os passos de todas as quests em «você» */
  "src/acervo/quests-lote-6.js": 320,  /* 22/11 (a décima primeira sessão): as cartas e os passos em «você» */
  "src/acervo/quests-lote-4.js": 187,  /* idem */
  "src/acervo/quests-lote-5.js": 180,  /* idem */
  "src/acervo/artefactos-lote-1.js": 79,
  "src/plano-do-vilao.js": 60,
  "src/subtramas.js": 35,
  "src/lexico-do-mundo.js": 34,
  "src/acervo/planos-lote-5.js": 28,
  "src/acervo/planos-lote-4.js": 24,
  "src/nucleo.js": 23,
  "src/saida-da-luta.js": 0,  /* F4d (20/11): a ênclise europeia das falas do vencedor saiu toda */
  "src/condicoes-da-quest.js": 17,
  "src/sessao.js": 13,
  "src/facto-do-sucesso.js": 12,
  "src/motor/eco-do-turno.js": 10,
  "src/motor/o-mestre-chama.js": 10,
  "src/posturas.js": 10,
  "src/batidas.js": 9,
  "src/fichas.js": 9,
  "src/acampamento.js": 8,
  "src/encontro-na-estrada.js": 8,
  "src/motor/envelopes-do-turno.js": 8,
  "src/abertura.js": 4, /* 22/11 (a décima segunda sessão): as tabelas da abertura em PT-BR */
  "src/boatos.js": 7,
  "src/motor/quests-do-turno.js": 7,
  "src/cidade-por-dentro.js": 6,
  "src/motor/correcao-do-juiz.js": 6,
  "src/motor/ficha-de-ator.js": 6,
  "src/decretos.js": 5,
  "src/leitura-de-pessoa.js": 5,
  "src/motor/a-pessoa-do-passo.js": 5,
  "src/motor/portas-do-narrador.js": 5,
  "src/npcs.js": 5,
  "src/prompt.js": 5,
  "src/agressao.js": 4,
  "src/bolsa-da-frase.js": 2,
  "src/espolios.js": 4,
  "src/grid.js": 4,
  "src/secundaria-planeada.js": 4,
  "src/tramas.js": 4,
  "src/cativeiro.js": 3,
  "src/companheiro-inicial.js": 3,
  "src/fecho.js": 3,
  "src/juiz-de-fidelidade.js": 3,
  "src/livro-de-factos.js": 3,
  "src/lugar.js": 3,
  "src/motor/cronista.js": 3,
  "src/saga.js": 3,
  "src/sem-espada.js": 3,
  "src/condicoes.js": 2,
  "src/desafios.js": 2,
  "src/descanso.js": 2,
  "src/escondido.js": 2,
  "src/escuta.js": 2,
  "src/fios-da-estrada.js": 2,
  "src/geografia.js": 2,
  "src/historia.js": 2,
  "src/masmorra-sem-cidade.js": 2,
  "src/masmorras.js": 2,
  "src/missoes.js": 2,
  "src/motor/cronista-do-turno.js": 2,
  "src/motor/efeitos-da-quest.js": 2,
  "src/pauta.js": 2,
  "src/prometido.js": 2,
  "src/arredores.js": 1,
  "src/cenario-padrao.js": 1,
  "src/em-cena.js": 1,
  "src/emboscada.js": 1,
  "src/encontros.js": 1,
  "src/gente-por-dentro.js": 1,
  "src/geradores.js": 1,
  "src/guildas.js": 1,
  "src/interprete.js": 1,
  "src/janela.js": 1,
  "src/legado.js": 1,
  "src/lexico.js": 1,
  "src/licenca.js": 1,
  "src/marca-da-porta.js": 1,
  "src/mesa-posta.js": 1,
  "src/motor/a-proposta-da-frase.js": 1,
  "src/motor/aplicar.js": 1,
  "src/motor/o-mestre-pede.js": 1,
  "src/motor/pauta-do-turno.js": 1,
  "src/motor/pedido-do-ator.js": 1,
  "src/ofertas.js": 1,
  "src/orcamento.js": 1,
  "src/procura.js": 1,
  "src/regras-jogo.js": 1,
  "src/ritmo-da-reacao.js": 1,
  "src/salvaguardas.js": 1,
  "src/temporario.js": 1,
  "src/turno-no-servidor.js": 1,
  "src/vilao.js": 1,
  "src/vozes.js": 1,
};

/* ---------------- A LEITURA ---------------- */
const listar = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  const p = path.join(dir, d.name);
  if (d.isDirectory()) return listar(p);
  return /\.(js|jsx)$/.test(d.name) ? [p] : [];
});

/* um id não é texto: sem espaço, e só minúsculas/sinais, ou camelCase, ou com
   separador de chave (_ . : | / #) */
const ehId = (s) => !/\s/.test(s) && (/^[a-z0-9_.:|/#-]*$/.test(s) || /^[a-z]+[A-Z][A-Za-z0-9]*$/.test(s) || /[_.:|/#]/.test(s));
/* a fonte de uma regex escrita como string («\\b(quanto (voce |tu ...») LÊ a
   frase do jogador; e a folha de estilo (os template-literais de CSS) só tem
   comentários de quem programa. Nenhum dos dois é texto de jogo. */
const ehRegex = (v) => /\\[bdswBDSW]|\(\?[:!=<]/.test(v) || (!/[{}]/.test(v) && (v.match(/[\p{L})\]]\|[\p{L}(\[]/gu) || []).length >= 3);
const ehCSS = (raw) => /@media|@keyframes|\{[^}]*:[^}]*;[^}]*\}/.test(raw);
/* chamadas cujo texto não vai à tela: o rótulo do calou (o console), o
   console e os erros (quem lê é quem programa) */
const CALLS_QUE_NAO_FALAM = new Set(["calou", "Error", "TypeError", "RangeError", "SyntaxError"]);
const naoFala = (no) => {
  const c = no.callee;
  if (!c) return false;
  if (c.type === "Identifier") return CALLS_QUE_NAO_FALAM.has(c.name);
  if (c.type === "MemberExpression" && c.object && c.object.type === "Identifier" && c.object.name === "console") return true;
  return false;
};

function stringsDe(arq) {
  const src = fs.readFileSync(arq, "utf8");
  let ast;
  try {
    ast = parse(src, { sourceType: "module", plugins: ["jsx"], errorRecovery: true });
  } catch (e) {
    return { erro: String(e.message || e), out: [] };
  }
  const rel = path.relative(RAIZ, arq).split(path.sep).join("/");
  const isentos = new Set(ISENTOS.filter((i) => i.arquivo === rel).map((i) => i.nome));
  const out = [];
  const visitar = (no, pai, chave, isento) => {
    if (!no || typeof no !== "object") return;
    if (Array.isArray(no)) { for (const x of no) visitar(x, pai, chave, isento); return; }
    if (typeof no.type !== "string") return;
    let iso = isento;
    if (no.type === "VariableDeclarator" && no.id && no.id.type === "Identifier" && isentos.has(no.id.name)) iso = true;
    if ((no.type === "ObjectProperty" || no.type === "Property") && no.key && (isentos.has(no.key.name) || isentos.has(no.key.value))) iso = true;
    if (no.type === "FunctionDeclaration" && no.id && isentos.has(no.id.name)) iso = true;
    if ((no.type === "CallExpression" || no.type === "NewExpression") && naoFala(no)) return;
    if (no.type === "ImportDeclaration" || no.type === "ExportAllDeclaration" || (no.type === "ExportNamedDeclaration" && no.source)) return;
    if (no.type === "StringLiteral") {
      const ehChave = pai && (pai.type === "ObjectProperty" || pai.type === "ObjectMethod" || pai.type === "ClassProperty") && chave === "key" && !pai.computed;
      if (!ehChave && !iso && !ehId(no.value) && !ehRegex(no.value)) out.push({ linha: no.loc.start.line, texto: no.value });
      return;
    }
    if (no.type === "TemplateLiteral") {
      if (!iso && !no.quasis.some((q) => ehCSS(q.value.raw))) {
        const txt = no.quasis.map((q) => (q.value.cooked != null ? q.value.cooked : q.value.raw)).join(" … ");
        if (!ehId(txt)) out.push({ linha: no.loc.start.line, texto: txt });
      }
      for (const e of no.expressions) visitar(e, no, "expressions", iso);
      return;
    }
    if (no.type === "JSXText") {
      const v = no.value.replace(/\s+/g, " ").trim();
      if (v && !iso) out.push({ linha: no.loc.start.line, texto: v });
      return;
    }
    if (no.type === "TaggedTemplateExpression" && no.tag && no.tag.type === "MemberExpression" && no.tag.object && no.tag.object.name === "String" && no.tag.property && no.tag.property.name === "raw") return;
    for (const k of Object.keys(no)) {
      if (k === "loc" || k === "start" || k === "end" || k === "leadingComments" || k === "trailingComments" || k === "innerComments" || k === "extra") continue;
      visitar(no[k], no, k, iso);
    }
  };
  visitar(ast.program, null, null, false);
  return { out };
}

function achadosDe(arq) {
  const { out, erro } = stringsDe(arq);
  if (erro) return { erro, achados: [] };
  const frases = new Set(FRASES.map((f) => f.frase));
  const achados = [];
  for (const s of out) {
    if (frases.has(s.texto)) continue;
    for (const [nome, rx, filtro] of MARCAS) {
      const g = new RegExp(rx.source, rx.flags.includes("g") ? rx.flags : rx.flags + "g");
      let m;
      while ((m = g.exec(s.texto))) {
        if (filtro && !filtro(m[0], s.texto.slice(0, m.index))) continue;
        achados.push({ linha: s.linha, marca: nome, termo: m[0], texto: s.texto });
      }
    }
  }
  return { achados };
}

/* ---------------- A CATRACA ---------------- */
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const medir = args.includes("--medir");
  const iL = args.indexOf("--listar");
  const arquivos = listar(path.join(RAIZ, "src")).filter((a) => !FORA.some((rx) => rx.test(a.split(path.sep).join("/")))).sort();
  if (iL >= 0) {
    const alvo = args[iL + 1];
    const a = arquivos.find((x) => x.split(path.sep).join("/").endsWith(alvo));
    const { achados } = achadosDe(a);
    for (const x of achados) console.log(`${x.linha}\t${x.marca}\t«${x.termo}»\t${x.texto.slice(0, 160).replace(/\n/g, "⏎")}`);
    process.exit(0);
  }
  const porArquivo = {};
  const porMarca = {};
  let total = 0, erros = [];
  for (const a of arquivos) {
    const rel = path.relative(RAIZ, a).split(path.sep).join("/");
    const { achados, erro } = achadosDe(a);
    if (erro) { erros.push(`${rel}: ${erro}`); continue; }
    if (achados.length) porArquivo[rel] = achados.length;
    for (const x of achados) porMarca[x.marca] = (porMarca[x.marca] || 0) + 1;
    total += achados.length;
  }
  if (medir) {
    console.log(`${total} achados em ${Object.keys(porArquivo).length} arquivos (de ${arquivos.length})`);
    console.log("\npor marca:");
    for (const [k, v] of Object.entries(porMarca).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(6)}  ${k}`);
    console.log("\npor arquivo:");
    for (const [k, v] of Object.entries(porArquivo).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(6)}  ${k}`);
    if (erros.length) console.log("\nnão li:\n  " + erros.join("\n  "));
    process.exit(0);
  }
  let mal = 0;
  const falha = (m) => { mal++; console.log("  XX  " + m); };
  if (erros.length) falha("arquivos que o parser não leu: " + erros.join("; "));
  for (const [rel, n] of Object.entries(porArquivo)) {
    const teto = TETO[rel] || 0;
    if (n > teto) falha(`SUBIU: ${rel} tem ${n} marcas de PT-PT, o teto é ${teto}. Escreva em PT-BR (veja --listar ${rel}).`);
  }
  for (const [rel, teto] of Object.entries(TETO)) {
    const n = porArquivo[rel] || 0;
    if (n < teto) falha(`DESCEU: ${rel} tem ${n}, o teto é ${teto} — baixe o teto para ${n} (folga zero).`);
  }
  const somaTeto = Object.values(TETO).reduce((a, b) => a + b, 0);
  console.log(`  ··  ${total} marcas de PT-PT nas strings de ${arquivos.length} arquivos (teto somado ${somaTeto})`);
  console.log(mal ? `\n${mal} falha(s)` : "\nPT-BR: nenhum arquivo passou do teto");
  if (mal) process.exit(1);
}
