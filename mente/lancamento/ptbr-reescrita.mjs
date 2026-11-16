/* A reescrita PT-PT -> PT-BR, só dentro das strings (AST), com listas
   explícitas de pares. Uso:
     node mente/lancamento/ptbr-reescrita.mjs --modo lexico|tudo [--seco --mostrar] <arquivo...>
   Escreve no lugar e imprime a contagem de trocas por arquivo.

   A FERRAMENTA DO S1 (lote 2, 15/11), guardada para quem continua. Aplicada à
   árvore inteira, levou as marcas de PT-PT das strings de 2336 a 1514 (só a
   prosa das quests ficou), mas quebrou ~40 suítes: as que comparam texto e,
   pior, as que dependem de texto do motor (jogar-em-node, a-quest-manda,
   chegada, condicoes-da-quest, lexico-do-mundo…). Por isso o lote só levou
   as telas. Use por arquivo, com --seco --mostrar, revise, e rode as suítes
   do arquivo antes de seguir. Não troca imperativo (escreve -> escreva):
   isso é à mão. */
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire("C:/Users/clara/Desktop/Taverna/package.json");
const { parse } = require("@babel/parser");

const args = process.argv.slice(2);
const iM = args.indexOf("--modo");
const MODO = iM >= 0 ? args[iM + 1] : "lexico";
const SECO = args.includes("--seco");
const arquivos = args.filter((a, i) => !a.startsWith("--") && !(iM >= 0 && i === iM + 1));

const B = "(?<![\\p{L}\\p{N}_])", E = "(?![\\p{L}\\p{N}_])";
const caixa = (orig, novo) => {
  if (orig === orig.toUpperCase() && orig !== orig.toLowerCase() && orig.length > 1) return novo.toUpperCase();
  if (orig[0] === orig[0].toUpperCase() && orig[0] !== orig[0].toLowerCase()) return novo[0].toUpperCase() + novo.slice(1);
  return novo;
};
const mapa = (pares, antesNao = "") => {
  const m = new Map();
  for (const [de, para] of pares) if (para) m.set(de.toLowerCase(), para);
  const rx = new RegExp(B + (antesNao ? "(?<![" + antesNao + "])" : "") + "(" + [...m.keys()].sort((a, b) => b.length - a.length).join("|") + ")" + E, "giu");
  return (t) => t.replace(rx, (w) => caixa(w, m.get(w.toLowerCase())));
};

const LEXICO = mapa([
  ["sítio", "lugar"], ["sítios", "lugares"], ["registo", "registro"], ["registos", "registros"],
  ["facto", "fato"], ["factos", "fatos"], ["bónus", "bônus"], ["génio", "gênio"], ["génios", "gênios"],
  ["prémio", "prêmio"], ["prémios", "prêmios"], ["cerimónia", "cerimônia"], ["cerimónias", "cerimônias"],
  ["demónio", "demônio"], ["demónios", "demônios"], ["demónico", "demônico"], ["colónia", "colônia"], ["colónias", "colônias"],
  ["género", "gênero"], ["géneros", "gêneros"], ["fenómeno", "fenômeno"], ["fenómenos", "fenômenos"],
  ["económico", "econômico"], ["económica", "econômica"], ["económicos", "econômicos"], ["económicas", "econômicas"],
  ["quilómetro", "quilômetro"], ["quilómetros", "quilômetros"], ["ténue", "tênue"], ["ténues", "tênues"],
  ["bebé", "bebê"], ["bebés", "bebês"], ["insónia", "insônia"], ["crónica", "crônica"], ["crónicas", "crônicas"], ["crónico", "crônico"],
  ["irónico", "irônico"], ["irónica", "irônica"], ["cómodo", "cômodo"], ["cómoda", "cômoda"], ["incómodo", "incômodo"], ["incómoda", "incômoda"],
  ["anónimo", "anônimo"], ["anónima", "anônima"], ["autónomo", "autônomo"], ["autónoma", "autônoma"], ["sinónimo", "sinônimo"],
  ["harmónico", "harmônico"], ["harmónica", "harmônica"], ["património", "patrimônio"], ["matrimónio", "matrimônio"],
  ["polémico", "polêmico"], ["polémica", "polêmica"], ["cómico", "cômico"], ["cómica", "cômica"], ["sónico", "sônico"],
  ["académico", "acadêmico"], ["académica", "acadêmica"], ["atómico", "atômico"], ["canónico", "canônico"], ["canónica", "canônica"],
  ["efémero", "efêmero"], ["efémera", "efêmera"], ["fémur", "fêmur"], ["pónei", "pônei"], ["astrónomo", "astrônomo"],
  ["tónico", "tônico"], ["tónica", "tônica"], ["antónio", "Antônio"], ["idóneo", "idôneo"], ["erróneo", "errôneo"], ["plutónio", "plutônio"],
  ["equipa", "equipe"], ["equipas", "equipes"], ["connosco", "conosco"], ["convosco", "com vocês"],
  ["acção", "ação"], ["acções", "ações"], ["actual", "atual"], ["actuais", "atuais"], ["actualmente", "atualmente"],
  ["direcção", "direção"], ["direcções", "direções"], ["exacto", "exato"], ["exacta", "exata"], ["exactos", "exatos"], ["exactas", "exatas"],
  ["exactamente", "exatamente"], ["óptimo", "ótimo"], ["óptima", "ótima"], ["activo", "ativo"], ["activa", "ativa"], ["activos", "ativos"], ["activas", "ativas"],
  ["actor", "ator"], ["actores", "atores"], ["sector", "setor"], ["sectores", "setores"], ["objectivo", "objetivo"], ["objectivos", "objetivos"],
  ["projecto", "projeto"], ["projectos", "projetos"], ["colecção", "coleção"], ["protecção", "proteção"], ["selecção", "seleção"], ["correcção", "correção"],
  ["actualizar", "atualizar"], ["actualizado", "atualizado"], ["actualizada", "atualizada"], ["efectivo", "efetivo"], ["efectiva", "efetiva"],
  ["adoptar", "adotar"], ["baptismo", "batismo"], ["baptizado", "batizado"],
], ".");

const VERBOS = mapa([
  ["estás", "está"], ["tens", "tem"], ["podes", "pode"], ["queres", "quer"], ["ficas", "fica"], ["precisas", "precisa"], ["chegas", "chega"],
  ["sabes", "sabe"], ["vais", "vai"], ["fazes", "faz"], ["vês", "vê"], ["és", "é"], ["tinhas", "tinha"], ["estavas", "estava"],
  ["podias", "podia"], ["querias", "queria"], ["deves", "deve"], ["consegues", "consegue"], ["encontras", "encontra"], ["ouves", "ouve"],
  ["sentes", "sente"], ["ganhas", "ganha"], ["perdes", "perde"], ["trazes", "traz"], ["vens", "vem"], ["dizes", "diz"],
  ["segues", "segue"], ["entras", "entra"], ["escolhes", "escolhe"], ["decides", "decide"], ["tentas", "tenta"],
  ["sobes", "sobe"], ["desces", "desce"], ["morres", "morre"], ["arriscas", "arrisca"], ["recuas", "recua"], ["aguentas", "aguenta"],
  ["jogas", "joga"], ["pensas", "pensa"], ["lembras", "lembra"], ["olhas", "olha"], ["pedes", "pede"], ["dás", "dá"],
  ["viveste", "viveu"], ["foste", "foi"], ["fizeste", "fez"], ["tiveste", "teve"], ["disseste", "disse"], ["viste", "viu"], ["pudeste", "pôde"],
  ["quiseste", "quis"], ["estiveste", "esteve"], ["soubeste", "soube"], ["vieste", "veio"], ["puseste", "pôs"], ["trouxeste", "trouxe"],
  ["saíste", "saiu"], ["caíste", "caiu"], ["partiste", "partiu"], ["ouviste", "ouviu"], ["sentiste", "sentiu"], ["perdeste", "perdeu"],
  ["venceste", "venceu"], ["morreste", "morreu"], ["escolheste", "escolheu"], ["comeste", "comeu"], ["bebeste", "bebeu"], ["andaste", "andou"],
  ["passaste", "passou"], ["chegaste", "chegou"], ["entraste", "entrou"], ["ficaste", "ficou"], ["deixaste", "deixou"], ["levaste", "levou"],
  ["mataste", "matou"], ["salvaste", "salvou"], ["encontraste", "encontrou"], ["pagaste", "pagou"], ["ganhaste", "ganhou"], ["falaste", "falou"],
  ["pediste", "pediu"], ["abriste", "abriu"], ["sabias", "sabia"], ["havias", "havia"],
  ["usaste", "usou"], ["gastaste", "gastou"], ["tocaste", "tocou"], ["atacaste", "atacou"], ["acertaste", "acertou"], ["falhaste", "falhou"],
  ["tentaste", "tentou"], ["compraste", "comprou"], ["vendeste", "vendeu"], ["aceitaste", "aceitou"], ["recusaste", "recusou"], ["juraste", "jurou"],
  ["prometeste", "prometeu"], ["esqueceste", "esqueceu"], ["lembraste", "lembrou"], ["conheceste", "conheceu"], ["mereceste", "mereceu"],
  ["fugiste", "fugiu"], ["seguiste", "seguiu"], ["subiste", "subiu"], ["desceste", "desceu"], ["roubaste", "roubou"], ["ajudaste", "ajudou"],
  ["traíste", "traiu"], ["voltaste", "voltou"], ["chamaste", "chamou"], ["olhaste", "olhou"], ["escutaste", "escutou"], ["procuraste", "procurou"],
  ["descobriste", "descobriu"], ["cumpriste", "cumpriu"], ["escreveste", "escreveu"], ["conseguiste", "conseguiu"], ["deste", null],
  ["fosses", "fosse"], ["tivesses", "tivesse"], ["pudesses", "pudesse"], ["quisesses", "quisesse"], ["sejas", "seja"], ["tenhas", "tenha"],
  ["possas", "possa"], ["queiras", "queira"], ["faças", "faça"], ["digas", "diga"], ["vejas", "veja"], ["venhas", "venha"], ["saibas", "saiba"],
  ["estejas", "esteja"], ["vás", "vá"], ["fores", "for"], ["tiveres", "tiver"], ["puderes", "puder"], ["quiseres", "quiser"], ["souberes", "souber"],
  ["vieres", "vier"], ["fizeres", "fizer"], ["disseres", "disser"], ["estiveres", "estiver"], ["ganhares", "ganhar"], ["perderes", "perder"],
  ["ganhes", "ganhe"], ["percas", "perca"], ["leres", "ler"], ["fores", "for"], ["quisesses", "quisesse"],
]);
const VERBOS_SET = new Set(["estás","tens","podes","queres","ficas","precisas","chegas","sabes","vais","fazes","vês","és","tinhas","estavas","podias","querias","deves","consegues","encontras","ouves","sentes","ganhas","perdes","trazes","vens","dizes","segues","entras","escolhes","decides","tentas","sobes","desces","morres","arriscas","recuas","aguentas","jogas","pensas","lembras","olhas","pedes","dás","viveste","foste","fizeste","tiveste","disseste","viste","pudeste","quiseste","estiveste","soubeste","vieste","puseste","trouxeste","saíste","caíste","partiste","ouviste","sentiste","perdeste","venceste","morreste","escolheste","comeste","bebeste","andaste","passaste","chegaste","entraste","ficaste","deixaste","levaste","mataste","salvaste","encontraste","pagaste","ganhaste","falaste","pediste","abriste","sabias","havias","usaste","gastaste","tocaste","atacaste","acertaste","falhaste","tentaste","compraste","vendeste","aceitaste","recusaste","juraste","prometeste","esqueceste","lembraste","conheceste","mereceste","fugiste","seguiste","subiste","desceste","roubaste","ajudaste","traíste","voltaste","chamaste","olhaste","escutaste","procuraste","descobriste","cumpriste","escreveste","conseguiste"]);
const ADV = "(?:não|já|só|também|ainda|nunca|sempre|mesmo|lá|cá|aqui|agora|logo|bem|mal)";
const RX_SUJ = new RegExp("(^|[.!?:;—–(«\"·|]\\s*|" + B + "(?:e|mas|que|se|quando|onde|como|porque|nem|ou|enquanto|até|antes|depois|então|assim|pois|se não|senão)\\s+)((?:" + ADV + "\\s+)*)(\\p{L}+)" + E, "giu");
const sujeito = (t) => t.replace(RX_SUJ, (m, antes, advs, verbo, off, todo) => {
  if (!VERBOS_SET.has(verbo.toLowerCase())) return m;
  const inicio = antes === "" || /[.!?:;—–(«"·|]\s*$/.test(antes);
  if (!inicio) {
    /* já há sujeito de segunda pessoa antes, na mesma frase: não repete */
    const frase = todo.slice(0, off).split(/[.!?·|]/).pop();
    if (new RegExp(B + "(?:tu|você|" + [...VERBOS_SET].join("|") + ")" + E, "iu").test(frase)) return m;
  }
  const prim = (advs + verbo)[0];
  const voce = inicio && prim === prim.toUpperCase() ? "Você" : "você";
  const resto = (advs + verbo);
  const restoMin = voce === "Você" ? resto[0].toLowerCase() + resto.slice(1) : resto;
  return antes + voce + " " + restoMin;
});
const IMPERATIVOS = mapa([["escreve","escreva"],["escolhe","escolha"],["toca","toque"],["olha","olhe"],["diz","diga"],["faz","faça"],["vê","veja"],["pega","pegue"],["lê","leia"],["clica","clique"],["experimenta","experimente"],["repara","repare"],["espera","espere"],["tenta","tente"],["volta","volte"],["usa","use"],["guarda","guarde"],["deixa","deixe"],["segue","siga"],["procura","procure"],["rola","role"],["lança","lance"],["abre","abra"],["fecha","feche"],["arrasta","arraste"],["escuta","escute"],["aceita","aceite"],["recusa","recuse"],["foge","fuja"],["ataca","ataque"],["descansa","descanse"],["compra","compre"],["vende","venda"],["chama","chame"],["mostra","mostre"],["troca","troque"],["prepara","prepare"],["avança","avance"],["confirma","confirme"],["cancela","cancele"],["carrega","carregue"],["pede","peça"],["vai","vá"],["fala","fale"],["entra","entre"],["sai","saia"],["sobe","suba"],["desce","desça"],["corre","corra"],["junta","junte"]]);
const RX_IMP = new RegExp("(^|[.!?:;—–]\\s+|" + B + "[Oo]u\\s+)(\\p{L}+)(?=\\s)", "gu");
const imperativo = (t) => t.replace(RX_IMP, (m, antes, w) => antes + IMPERATIVOS(w));
const POSSE = mapa([["teu", "seu"], ["teus", "seus"], ["tua", "sua"], ["tuas", "suas"]]);

const GER_NAO = new Set(["par", "mar", "lar", "bar", "seguir", "ar", "por", "ler"]);
const gerundio = (v) => {
  const l = v.toLowerCase();
  if (GER_NAO.has(l) || l.length < 4) return null;
  if (/ar$/.test(l)) return v.slice(0, -2) + "ando";
  if (/er$/.test(l)) return v.slice(0, -2) + "endo";
  if (/ir$/.test(l)) return v.slice(0, -2) + "indo";
  return null;
};
const RX_GER = new RegExp(B + "((?:est(?:á|ão|ava|avam|ar|ou|ive|eve|eja|ejam|iver|ás)|and(?:a|am|ava|avam|ar|as)|fic(?:a|am|ou|ar|as|aram)|continu(?:a|am|ou|ar|as)) )a (\\p{L}+(?:ar|er|ir))" + E, "giu");

/* a ênclise no meio da frase vira próclise: «e diz-lhe» -> «e lhe diz» */
const RX_ENCL = new RegExp("(^|[\\p{L}\\p{N},;»”)\\]}…]\\s+|^\\s+)(\\p{Ll}{2,})-(se|me|te|lhe|lhes|nos|o|a|os|as)" + E + "(?!-)", "gu");
const encl = (t, inicioMeio) => t.replace(RX_ENCL, (m, antes, verbo, pron, off) => {
  if (antes === "" && !inicioMeio) return m;
  if (/^\s+$/.test(antes) && off === 0 && !inicioMeio) return m;
  if (/ndo$/i.test(verbo) && /^(?:te|me|lhe|lhes|nos)$/.test(pron)) return `${antes}${pron} ${verbo}`;
  if (/(?:r|ndo)$/i.test(verbo) || /[áéíóô]$/.test(verbo)) return m;
  if (/^(?:o|a|os|as)$/.test(pron) && !/[aeiouãõ]$|u$/i.test(verbo)) return m;
  return `${antes}${pron} ${verbo}`;
});

function trocar(t, inicioMeio) {
  let s = LEXICO(t);
  s = s.replace(/à volta(?![\p{L}])/gu, "em volta").replace(/À volta(?![\p{L}])/gu, "Em volta");
  if (MODO === "lexico") return s;
  s = s.replace(RX_GER, (m, aux, v) => { const g = gerundio(v); return g ? aux + g : m; });
  s = sujeito(s);
  s = VERBOS(s);
  if (args.includes("--imperativo")) s = imperativo(s);
  s = POSSE(s);
  s = s.replace(new RegExp(B + "contigo" + E, "gu"), "com você").replace(new RegExp(B + "Contigo" + E, "gu"), "Com você").replace(new RegExp(B + "CONTIGO" + E, "gu"), "COM VOCÊ");
  s = s.replace(new RegExp(B + "(para|a|de|em|por|sobre|contra|até|entre|sem|perante|Para|A|De|Em|Por) ti" + E, "gu"), "$1 você");
  s = s.replace(new RegExp(B + "tu" + E, "gu"), "você").replace(new RegExp(B + "Tu" + E, "gu"), "Você").replace(new RegExp(B + "TU" + E, "gu"), "VOCÊ");
  s = encl(s, inicioMeio);
  return s;
}

/* ---------------- os segmentos de string ---------------- */
const CALLS_QUE_NAO_FALAM = new Set(["calou", "Error", "TypeError", "RangeError", "SyntaxError", "RegExp"]);
const METODOS_QUE_LEEM = new Set(["includes", "indexOf", "startsWith", "endsWith", "test", "match", "matchAll", "search", "split", "replace", "replaceAll", "has", "lastIndexOf"]);
const naoFala = (no) => {
  const c = no.callee;
  if (!c) return false;
  if (c.type === "Identifier") return CALLS_QUE_NAO_FALAM.has(c.name);
  if (c.type === "MemberExpression") {
    if (c.object && c.object.type === "Identifier" && c.object.name === "console") return true;
    if (c.property && METODOS_QUE_LEEM.has(c.property.name)) return "args";
  }
  return false;
};

function segmentos(src) {
  const ast = parse(src, { sourceType: "module", plugins: ["jsx"], errorRecovery: true });
  const segs = [];
  const visitar = (no, pai, chave, iso) => {
    if (!no || typeof no !== "object") return;
    if (Array.isArray(no)) { for (const x of no) visitar(x, pai, chave, iso); return; }
    if (typeof no.type !== "string") return;
    if (no.type === "ImportDeclaration" || no.type === "ExportAllDeclaration" || (no.type === "ExportNamedDeclaration" && no.source)) return;
    if (no.type === "CallExpression" || no.type === "NewExpression") {
      const nf = naoFala(no);
      if (nf === true) return;
      if (nf === "args") { visitar(no.callee, no, "callee", iso); visitar(no.arguments, no, "arguments", true); return; }
    }
    if (no.type === "BinaryExpression" && /^[!=]==?$/.test(no.operator)) { visitar(no.left, no, "left", true); visitar(no.right, no, "right", true); return; }
    if (no.type === "SwitchCase") { visitar(no.consequent, no, "consequent", iso); return; }
    if (no.type === "StringLiteral") {
      const ehChave = pai && (pai.type === "ObjectProperty" || pai.type === "ObjectMethod" || pai.type === "ClassProperty") && chave === "key" && !pai.computed;
      const ehRegex = /\\[bdswBDSW]|\(\?[:!=<]/.test(no.value);
      if (!ehChave && !iso && !ehRegex && /\s/.test(no.value)) segs.push({ ini: no.start + 1, fim: no.end - 1, meio: false });
      return;
    }
    if (no.type === "TemplateLiteral" && no.quasis.some((q) => /@media|@keyframes|\{[^}]*:[^}]*;[^}]*\}/.test(q.value.raw))) { for (const e of no.expressions) visitar(e, no, "expressions", iso); return; }
    if (no.type === "TemplateLiteral") {
      const temEspaco = no.quasis.some((q) => /\s/.test(q.value.raw));
      if (!iso && temEspaco) no.quasis.forEach((q, i) => segs.push({ ini: q.start, fim: q.end, meio: i > 0 }));
      for (const e of no.expressions) visitar(e, no, "expressions", iso);
      return;
    }
    if (no.type === "JSXText") { if (!iso && /\p{L}/u.test(no.value)) segs.push({ ini: no.start, fim: no.end, meio: true }); return; }
    if (no.type === "TaggedTemplateExpression") return;
    for (const k of Object.keys(no)) {
      if (k === "loc" || k === "start" || k === "end" || k === "leadingComments" || k === "trailingComments" || k === "innerComments" || k === "extra") continue;
      visitar(no[k], no, k, iso);
    }
  };
  visitar(ast.program, null, null, false);
  return segs.sort((a, b) => b.ini - a.ini);
}

let totalGeral = 0;
for (const arq of arquivos) {
  let src = fs.readFileSync(arq, "utf8");
  const segs = segmentos(src);
  let n = 0;
  const amostras = [];
  for (const sg of segs) {
    const velho = src.slice(sg.ini, sg.fim);
    const novo = trocar(velho, sg.meio);
    if (novo !== velho) {
      n++;
      if (amostras.length < 400) amostras.push([velho, novo]);
      src = src.slice(0, sg.ini) + novo + src.slice(sg.fim);
    }
  }
  totalGeral += n;
  if (!SECO) fs.writeFileSync(arq, src);
  console.log(`${n}\t${arq}`);
  if (args.includes("--mostrar")) for (const [v, w] of amostras) console.log("   - " + v.slice(0, 220).replace(/\n/g, "⏎") + "\n   + " + w.slice(0, 220).replace(/\n/g, "⏎"));
}
console.log(`total ${totalGeral}`);
