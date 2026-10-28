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
    const aqui = new Set();
    traverse(ast, {
      CallExpression(p) {
        const c = p.node;
        if (c.callee.type !== "Identifier" || !CHAMADAS_DE_ASSERCAO.test(c.callee.name)) return;
        const ehNome = (a) => a && (a.type === "StringLiteral" || a.type === "TemplateLiteral" || (a.type === "BinaryExpression" && a.operator === "+"));
        if (!(ehNome(c.arguments[0]) || ehNome(c.arguments[1]))) return;
        if (p.get("arguments").some((a) => depende(a))) aqui.add(c.start);
      },
    });
    onde[alvo] = aqui;
  }
  return { app: onde.app.size, motor: onde.motor.size, total: new Set([...onde.app, ...onde.motor]).size };
}

const suites = fs.readdirSync(AQUI).filter((f) => /^(teste-.*|jogar-em-node)\.mjs$/.test(f) && f !== "teste-assercoes-de-texto.mjs").sort();
const medida = {};
for (const f of suites) {
  const src = fs.readFileSync(new URL(f, AQUI), "utf8");
  if (!Object.values(ALVOS_DE_TEXTO).some((rx) => rx.test(src))) continue;
  const m = medir(src);
  if (m.total) medida[f] = m;
}
const soma = (k) => Object.values(medida).reduce((s, m) => s + m[k], 0);

if (process.argv.includes("--gravar")) {
  const paraT2 = Object.fromEntries(Object.entries(medida).filter(([, m]) => m.app).map(([f, m]) => [f, m.app]));
  fs.writeFileSync(ARQ, JSON.stringify({ ...REGISTO, paraT2: { medido: new Date().toLocaleDateString("sv-SE"), total: soma("app"), suites: Object.keys(paraT2).length, porSuite: paraT2 } }, null, 2) + "\n");
  console.log(`gravado: ${soma("app")} asserções de App em ${Object.keys(paraT2).length} suítes`);
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
  console.log(`  ..  antes desta fatia (${REGISTO.antes.medido}): ${REGISTO.antes.total} (${REGISTO.antes.app} do App, ${REGISTO.antes.motor} do motor); convertidas ${REGISTO.convertidas.total}, retiradas ${REGISTO.retiradas.total}`);
  t("a conta do registo fecha: antes = convertidas + retiradas + o que ficou para T2", REGISTO.antes.total === REGISTO.convertidas.total + REGISTO.retiradas.total + REGISTO.paraT2.total);
  t("toda suíte da lista de T2 existe", Object.keys(reg.porSuite).every((f) => fs.existsSync(new URL(f, AQUI))));
}

console.log(`\nasserções de texto: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
