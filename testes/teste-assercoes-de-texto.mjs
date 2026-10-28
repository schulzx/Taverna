/* teste-assercoes-de-texto.mjs (Fase T1, trilha B, fatia 2 · 27/10) — a prova mede o comportamento, não o texto

   A FRAGILIDADE 5 da auditoria do motor (mente/auditoria-do-motor.md §7):
   "a prova mede o texto do código". As suítes leem o `App.jsx` como texto e
   provam que uma linha está escrita; o refactor que tira o turno do App
   parte-as aos centos, e a catraca que dava confiança passa a dar ruído. O
   plano (mente/plano-motor.md, Fase 2, trilha B) é que cada asserção de
   texto renasça como chamada ao motor, com o motivo escrito.

   ESTA SUÍTE É A RÉGUA E A CATRACA DESSA MUDANÇA:

   - A RÉGUA. Uma "asserção de texto" é uma chamada de asserção (`t`, `ok`,
     `prova`, `check`, `assert`, com o nome da asserção em texto) cuja
     condição DEPENDE do texto de um arquivo de código: lido por
     `readFileSync`/`ler` de `App.jsx` ou de `src/motor/*.js`, ou derivado
     dele (um recorte, um índice, uma contagem, uma função que o lê). A
     dependência segue os bindings com escopo (@babel/traverse) — dois
     `const APP` em blocos diferentes são duas variáveis, e um `APP` que lê o
     motor não conta como App. Medida de 27/10, antes desta fatia: 2121
     asserções de texto em 182 suítes (2073 dependem do App, 50 do motor,
     2 dos dois).
   - A CATRACA DO MOTOR. `src/motor/` é puro: tudo o que mora lá se prova
     JOGANDO (aplicar(estado, resposta) e ler o estado que sai), nunca lendo
     as linhas. Nenhuma suíte lê o texto do motor — salvo a lista de espera
     datada em `assercoes-de-texto.json` (`esperaDoMotor`), que esvazia na
     mesma leva. Quem mover um bloco do App para o motor e vir esta suíte
     vermelha: reescreva a asserção como chamada (os modelos estão em
     teste-cond.mjs, secções T1 e T3 "ligado ao jogo", e em teste-efeitos.mjs
     §15.2), ou, se a fatia não couber, ponha a suíte na espera com data e dono.
   - A LISTA DE T2. As asserções que dependem do App provam fiação que ainda
     mora lá (o App é React e não corre em Node): ficam, contadas por suíte
     em `assercoes-de-texto.json` (`paraT2`), para a Fase 2. A medida de hoje
     é impressa contra a de lá; o número só deve descer.

   `node testes/teste-assercoes-de-texto.mjs --gravar` regrava a lista de T2
   com a medida do dia (a data vai junto). */
import fs from "node:fs";
import { createRequire } from "node:module";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

/* o parser é o do Vite (@babel, via @vitejs/plugin-react): já está na árvore,
   e uma régua com escopo não se escreve à mão em regex. Numa cópia sem
   node_modules (mente/so-o-meu.sh), o NODE_PATH aponta para o da árvore. */
const require = createRequire(import.meta.url);
let parse, traverse;
try { ({ parse } = require("@babel/parser")); traverse = require("@babel/traverse").default; }
catch (e) { console.log("  XX  sem @babel/parser e @babel/traverse (npm install, ou NODE_PATH para o node_modules da árvore): " + e.message); process.exit(1); }

const AQUI = new URL("./", import.meta.url);
const ARQ = new URL("./assercoes-de-texto.json", import.meta.url);
const REGISTO = JSON.parse(fs.readFileSync(ARQ, "utf8"));

/* os arquivos de código cujo texto conta, e o nome das chamadas de asserção */
const ALVOS_DE_TEXTO = { app: /App\.jsx/, motor: /motor\/[\w-]+\.js/ };
const CHAMADAS_DE_ASSERCAO = /^(t|ok|prova|check|assert)$/;

function medir(src) {
  const ast = parse(src, { sourceType: "module", allowAwaitOutsideFunction: true, errorRecovery: true });
  const fonte = (n) => src.slice(n.start, n.end);
  const onde = {};
  for (const [alvo, rx] of Object.entries(ALVOS_DE_TEXTO)) {
    const sujos = new Set();
    const leTexto = (p) => {
      let r = false;
      const ver = (q) => { const n = q.node; if (n.type === "CallExpression" && /(^|\.)(readFileSync|ler)$/.test(fonte(n.callee)) && rx.test(fonte(n))) r = true; };
      ver(p); p.traverse({ CallExpression: ver });
      return r;
    };
    const depende = (p) => {
      if (leTexto(p)) return true;
      let r = false;
      const ver = (q) => { if (!q.isReferencedIdentifier()) return; const b = q.scope.getBinding(q.node.name); if (b && sujos.has(b)) r = true; };
      if (p.isIdentifier()) ver(p);
      p.traverse({ Identifier: ver });
      return r;
    };
    const atribuicoes = [];
    traverse(ast, {
      VariableDeclarator(p) { if (p.node.init) atribuicoes.push([p.get("id"), p.get("init"), p]); },
      AssignmentExpression(p) { if (p.node.left.type === "Identifier") atribuicoes.push([p.get("left"), p.get("right"), p]); },
    });
    let mudou = true;
    while (mudou) {
      mudou = false;
      for (const [esq, dir, p] of atribuicoes) {
        const binds = Object.keys(esq.getBindingIdentifiers()).map((nm) => p.scope.getBinding(nm)).filter(Boolean);
        if (!binds.length || binds.every((b) => sujos.has(b))) continue;
        if (depende(dir)) { binds.forEach((b) => sujos.add(b)); mudou = true; }
      }
    }
    /* os bindings que CORREM código lido do texto (`new Function`/`eval`
       sobre um recorte): chamá-los é jogar a regra que mora no App */
    const correm = new Set();
    for (const [esq, dir, p] of atribuicoes) {
      if (!/\bnew Function\b|\beval\(/.test(fonte(dir.node)) || !depende(dir)) continue;
      Object.keys(esq.getBindingIdentifiers()).map((nm) => p.scope.getBinding(nm)).filter(Boolean).forEach((b) => correm.add(b));
    }
    const aqui = new Set();
    const detalhe = [];
    traverse(ast, {
      CallExpression(p) {
        const c = p.node;
        if (c.callee.type !== "Identifier" || !CHAMADAS_DE_ASSERCAO.test(c.callee.name)) return;
        const ehNome = (a) => a && (a.type === "StringLiteral" || a.type === "TemplateLiteral" || (a.type === "BinaryExpression" && a.operator === "+"));
        if (!(ehNome(c.arguments[0]) || ehNome(c.arguments[1]))) return;
        if (!p.get("arguments").some((a) => depende(a))) return;
        aqui.add(c.start);
        const iNome = ehNome(c.arguments[0]) ? 0 : 1;
        const conds = p.get("arguments").filter((_, k) => k !== iNome);
        let corre = false;
        for (const a of conds) a.traverse({ CallExpression(q) { const k = q.node.callee; const id = k.type === "Identifier" ? k : k.type === "MemberExpression" && k.object.type === "Identifier" ? k.object : null; const b = id && q.scope.getBinding(id.name); if (b && correm.has(b)) corre = true; } });
        detalhe.push({ start: c.start, linha: c.loc ? c.loc.start.line : 0, cond: conds.map((a) => fonte(a.node)).join(" ,, "), negativa: !!(conds[0] && conds[0].node.type === "UnaryExpression" && conds[0].node.operator === "!"), corre });
      },
    });
    onde[alvo] = aqui;
    if (alvo === "app") onde.detalhe = detalhe;
  }
  return { app: onde.app.size, motor: onde.motor.size, total: new Set([...onde.app, ...onde.motor]).size, detalhe: onde.detalhe || [] };
}

/* ---------------- A CLASSIFICAÇÃO DA LISTA DE T2 (28/10, T1-B fatia 3) ----------------
   Toda asserção que ainda lê o App é de um de três grupos (o pedido da fatia):
     (a) prova uma regra que JÁ mora num módulo puro — converte-se para
         comportamento (chamada ao módulo), com o motivo escrito;
     (b) prova fiação, ordem ou tela que ainda mora no App — fica para T2;
     (c) prova algo que já não existe — retira-se, com o motivo.
   (a) e (c) saem da lista quando a mão as converte/retira: o que fica nela é
   (b), e (b) reparte-se pelo que T2 terá de fazer com cada uma. A tabela é
   lida por ordem; a primeira classe que casa leva a asserção. É uma régua de
   SCRIPT (a leitura à mão das maiores suítes está em `assercoes-de-texto.json`,
   `classificacao.lidas`), e o que ela mede é o destino, não a qualidade. */
const CLASSES_DE_T2 = [
  { classe: "regraNoApp", diz: "corre código lido do App (new Function sobre um recorte): a regra é pura e mora no topo do App — muda-se para um módulo e a prova vira import sem mudar uma linha", casa: (a) => a.corre },
  { classe: "saida", diz: "guarda negativa (o que saiu do App não volta, o que não deve existir não existe) — com o App só de tela, cai sozinha", casa: (a) => a.negativa },
  { classe: "tela", diz: "JSX, estilo, componente ou estado de React no App — vai com o painel que sair do App (a mesa)", casa: (a) => /<[A-Z]\w*[\s/>]|className|style=|style: |aria-|useState|useMemo|useEffect|useCallback|\bT\\?\.[a-z]|onClick|function [A-Z]\w*\\?\(|\bALVOS\b|tv-[a-z]|<\/?(div|span|button|svg|p|section|h\d)\b/.test(a.cond) },
  { classe: "fiacao", diz: "import, chamada, ref, calou, save, ordem dos passos — vira prova do `turno()` quando o passo sair do App", casa: () => true },
];
const classeDe = (a) => CLASSES_DE_T2.find((c) => c.casa(a)).classe;

const suites = fs.readdirSync(AQUI).filter((f) => /^(teste-.*|jogar-em-node)\.mjs$/.test(f) && f !== "teste-assercoes-de-texto.mjs").sort();
const medida = {};
for (const f of suites) {
  const src = fs.readFileSync(new URL(f, AQUI), "utf8");
  if (!Object.values(ALVOS_DE_TEXTO).some((rx) => rx.test(src))) continue;
  const m = medir(src);
  if (m.total) medida[f] = m;
}
const soma = (k) => Object.values(medida).reduce((s, m) => s + m[k], 0);

/* a classe de cada asserção do App, por suíte: { suíte: { classe: n } } */
const classesPorSuite = () => {
  const r = {};
  for (const [f, m] of Object.entries(medida)) {
    if (!m.app) continue;
    const c = {};
    for (const a of m.detalhe) { const k = classeDe(a); c[k] = (c[k] || 0) + 1; }
    r[f] = c;
  }
  return r;
};
const totaisDasClasses = (cps) => {
  const r = {};
  for (const c of Object.values(cps)) for (const [k, n] of Object.entries(c)) r[k] = (r[k] || 0) + n;
  return r;
};

if (process.argv.includes("--gravar")) {
  const paraT2 = Object.fromEntries(Object.entries(medida).filter(([, m]) => m.app).map(([f, m]) => [f, m.app]));
  const cps = classesPorSuite();
  const classificacao = { ...(REGISTO.classificacao || {}), medido: new Date().toLocaleDateString("sv-SE"), classes: Object.fromEntries(CLASSES_DE_T2.map((c) => [c.classe, c.diz])), totais: totaisDasClasses(cps), porSuite: cps };
  fs.writeFileSync(ARQ, JSON.stringify({ ...REGISTO, paraT2: { medido: new Date().toLocaleDateString("sv-SE"), total: soma("app"), suites: Object.keys(paraT2).length, porSuite: paraT2 }, classificacao }, null, 2) + "\n");
  console.log(`gravado: ${soma("app")} asserções de App em ${Object.keys(paraT2).length} suítes; classes ${JSON.stringify(classificacao.totais)}`);
  process.exit(0);
}
if (process.argv.includes("--classes")) {
  const cps = classesPorSuite();
  console.log(JSON.stringify(totaisDasClasses(cps)));
  for (const [f, c] of Object.entries(cps).sort((a, b) => medida[b[0]].app - medida[a[0]].app)) console.log(`  ${f}: ${medida[f].app} — ${Object.entries(c).map(([k, n]) => `${k} ${n}`).join(", ")}`);
  if (process.argv.includes("--uma")) for (const [f, m] of Object.entries(medida)) for (const a of m.detalhe) console.log(`${f}:${a.linha}\t${classeDe(a)}\t${a.cond.replace(/\s+/g, " ").slice(0, 140)}`);
  process.exit(0);
}

sec("1. A RÉGUA LÊ O QUE DEVE (casos pequenos)");
{
  const um = (src) => medir(src);
  t("uma regex sobre o App lido é asserção de texto", um(`const APP = readFileSync("../src/App.jsx", "utf8"); t("x", /a/.test(APP));`).app === 1);
  t("um recorte e um índice derivados também", um(`const APP = readFileSync("../src/App.jsx", "utf8"); const i = APP.indexOf("a"); const b = APP.slice(i); t("x", i > 0); ok(/c/.test(b), "y");`).app === 2);
  t("a leitura dentro da própria asserção também", um(`t("x", /a/.test(readFileSync(new URL("../src/motor/aplicar.js", import.meta.url), "utf8")));`).motor === 1);
  t("um APP noutro bloco que lê o motor não é o App (o escopo conta)", (() => { const m = um(`{ const APP = readFileSync("../src/App.jsx"); t("a", /x/.test(APP)); } { const APP = readFileSync("../src/motor/aplicar.js"); t("b", /y/.test(APP)); }`); return m.app === 1 && m.motor === 1 && m.total === 2; })());
  t("e chamar o motor NÃO é asserção de texto", um(`const { aplicar } = await import("../src/motor/aplicar.js"); t("x", aplicar({}, {}).estado);`).total === 0);
}

sec("2. A CATRACA DO MOTOR: o motor se prova jogando");
{
  const espera = new Set((REGISTO.esperaDoMotor || []).map((x) => x.suite));
  const lendo = Object.entries(medida).filter(([f, m]) => m.motor > 0 && !espera.has(f)).map(([f, m]) => `${f} (${m.motor})`);
  t(`nenhuma suíte lê o texto de src/motor/ (fora da espera: ${espera.size})`, lendo.length === 0, lendo.join(", ") + " — reescreva como chamada ao motor (o cabeçalho desta suíte diz como)");
  const vazias = [...espera].filter((f) => !(medida[f] && medida[f].motor));
  t("e a espera não guarda quem já não precisa dela", vazias.length === 0, vazias.join(", "));
  t("toda entrada da espera tem data e dono", (REGISTO.esperaDoMotor || []).every((x) => x.suite && /^\d{4}-\d{2}-\d{2}$/.test(x.data || "") && x.dono));
  for (const c of REGISTO.convertidas.suites) {
    t(`${c.suite}: as ${c.asserções} que eram texto do motor seguem comportamento`, !(medida[c.suite] && medida[c.suite].motor));
  }
}

sec("3. A LISTA DE T2: a fiação que ainda mora no App");
{
  const reg = REGISTO.paraT2;
  console.log(`  ..  hoje: ${soma("total")} asserções de texto em ${Object.keys(medida).length} suítes (${soma("app")} do App, ${soma("motor")} do motor)`);
  console.log(`  ..  na lista de ${reg.medido}: ${reg.total} do App em ${reg.suites} suítes (${soma("app") - reg.total >= 0 ? "+" : ""}${soma("app") - reg.total})`);
  console.log(`  ..  a 1.ª leva (${REGISTO.antes.medido}): ${REGISTO.antes.total} (${REGISTO.antes.app} do App, ${REGISTO.antes.motor} do motor); convertidas ${REGISTO.convertidas.total}, retiradas ${REGISTO.retiradas.total}`);
  /* 28/10 (T1-B fatia 3), MUDADA E O MOTIVO: a conta era "antes = convertidas
     + retiradas + T2" de uma leva só, e a lista de T2 desce por mais de uma
     mão (o oficial move blocos e reescreve as suítes deles). A conta passa a
     ser por LEVA, encadeada: cada leva fecha consigo, a seguinte parte de onde
     ela acabou, e a última acaba na lista de T2. */
  const levas = REGISTO.levas || [];
  for (const l of levas) console.log(`  ..  leva ${l.fatia} (${l.medido}): ${l.antes} → ${l.depois} (convertidas ${l.convertidas}, retiradas ${l.retiradas}, mal medidas ${l.malMedidas || 0}, de outras mãos ${l.deOutrasMaos >= 0 ? "+" : ""}${l.deOutrasMaos || 0})`);
  t("cada leva fecha: antes − convertidas − retiradas − mal medidas + de outras mãos = depois", levas.length > 0 && levas.every((l) => l.antes - l.convertidas - l.retiradas - (l.malMedidas || 0) + (l.deOutrasMaos || 0) === l.depois));
  t("as levas encadeiam, da 1.ª à lista de T2", levas.length > 0 && levas[0].antes === REGISTO.antes.total && levas.every((l, i) => i === 0 || l.antes === levas[i - 1].depois) && levas[levas.length - 1].depois === reg.total);
  t("toda suíte da lista de T2 existe", Object.keys(reg.porSuite).every((f) => fs.existsSync(new URL(f, AQUI))));
}

sec("4. A CLASSIFICAÇÃO DA LISTA DE T2: (a) converte-se, (b) fica, (c) retira-se");
{
  const cl = REGISTO.classificacao || {};
  const tot = cl.totais || {};
  console.log(`  ..  na lista de ${cl.medido}: ${Object.entries(tot).map(([k, n]) => `${k} ${n}`).join(", ")}`);
  t("as classes da lista são as da tabela (CLASSES_DE_T2)", Object.keys(tot).every((k) => CLASSES_DE_T2.some((c) => c.classe === k)));
  t("e somam a lista de T2, suíte a suíte", Object.values(tot).reduce((s, n) => s + n, 0) === REGISTO.paraT2.total
    && Object.entries(REGISTO.paraT2.porSuite).every(([f, n]) => Object.values((cl.porSuite || {})[f] || {}).reduce((s, x) => s + x, 0) === n));
  t("as suítes lidas à mão dizem o que se achou", (cl.lidas || []).length > 0 && cl.lidas.every((x) => x.suite && x.achado && fs.existsSync(new URL(x.suite, AQUI))));
  const ult = (REGISTO.levas || []).slice(-1)[0] || {};
  t("o que a última leva converteu, partiu ou corrigiu existe e diz onde", [...(ult.convertidasEm || []), ...(ult.partidasEm || []), ...(ult.malMedidasEm || [])].every((x) => x.suite && x.onde && fs.existsSync(new URL(x.suite, AQUI))));
  /* a régua de classe morde: uma asserção de tela, uma negativa, uma que
     corre código do App e uma de fiação caem cada uma na sua */
  const um = (src) => medir(src).detalhe.map(classeDe);
  t("a régua de classe: tela, saída, regra no App e fiação", JSON.stringify(um(`const APP = readFileSync("../src/App.jsx", "utf8"); t("a", /<Relato mensagens=/.test(APP)); t("b", !/TABELA_FE/.test(APP)); const f = new Function(APP.slice(0, 9) + "; return g;")(); t("c", f(1) === 2); t("d", /calou\\("x"/.test(APP));`)) === JSON.stringify(["tela", "saida", "regraNoApp", "fiacao"]));
}

console.log(`\nasserções de texto: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
