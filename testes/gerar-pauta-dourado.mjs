/* gerar-pauta-dourado.mjs (Fase 4, trilha B, 29/10/2026) — o recorte à letra da pauta do turno

   Lê o App de um commit (pelo git, sem tocar na árvore) e recorta a
   `pautaDoTurno` INTEIRA — ela e as 50 funções do componente que ela chama,
   de fecho em fecho, até às que escrevem na tela (`pushMsgs`, que fica de
   fora: é porta). Não é âncora à mão: são 50 corpos, e uma chaveta
   contada por regex corta errado em silêncio. O fecho sai da árvore
   sintática (o @babel/parser que o Vite já traz), e cada recorte é o texto
   do App de ponta a ponta, com os comentários que o precedem.

   Grava em `pauta-dourado.json`:
     commit     — de onde veio
     recortes   — [{ nome, texto }] na ordem do App, mais os dois valores
                  que o render calcula e a pauta lê (`cidadeMercado`,
                  `mercadoAqui`) e o que é do módulo (`falasDoMestre`)
     refs       — cada ref que o recorte toca: o campo (o nome no save,
                  quando o save o guarda; senão o do ref), o valor de
                  partida do `useRef` e se o recorte o escreve
     render     — o estado React que o recorte lê
     imports    — cada nome importado que o recorte usa, e de onde
     fotos      — a foto de cada um dos casos de `pauta-bloco.mjs`, corrida
                  sobre o recorte com as dependências reais

   A suíte (`teste-motor-pauta-do-turno.mjs`) não lê o App: compila o
   recorte daqui, corre-o lado a lado com a peça, e confere as duas contra
   as fotos. Quando a trilha A trocar a chamada no App, o texto de lá some,
   e a prova fica.

   Uso: node testes/gerar-pauta-dourado.mjs [commit] */
import { execSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";

const req = createRequire(new URL("../package.json", import.meta.url));
const parser = req("@babel/parser");
const traverse = req("@babel/traverse").default;

const RAIZ = "pautaDoTurno";
/* as funções do componente que o recorte NÃO leva: são portas da peça */
const PORTAS = ["pushMsgs"];
/* o que o render calcula, a pauta lê, e o recorte leva (avaliado antes da chamada, como no render) */
const DO_RENDER = ["cidadeMercado", "mercadoAqui"];
/* o que é do módulo do App (fora do componente) e o recorte leva */
const DO_MODULO = ["LEITURA_DA_CONVERSA", "falasDoMestre"];

export function recortarAPauta(app) {
  const ast = parser.parse(app, { sourceType: "module", plugins: ["jsx"] });
  const imports = new Map();
  for (const n of ast.program.body) if (n.type === "ImportDeclaration") for (const s of n.specifiers) imports.set(s.local.name, { de: n.source.value, nome: s.type === "ImportSpecifier" ? (s.imported.name || s.imported.value) : s.type === "ImportDefaultSpecifier" ? "default" : "*" });
  let comp = null;
  traverse(ast, { FunctionDeclaration(p) { if (p.parentPath.isExportDefaultDeclaration()) comp = p; } });
  if (!comp) throw new Error("o componente do App não está onde estava");
  const defs = new Map();
  const nomesDe = (p, o = []) => { if (!p) return o; if (p.type === "Identifier") o.push(p.name); else if (p.type === "ArrayPattern") p.elements.forEach((x) => nomesDe(x, o)); else if (p.type === "ObjectPattern") p.properties.forEach((x) => nomesDe(x.value || x.argument, o)); else if (p.type === "AssignmentPattern") nomesDe(p.left, o); else if (p.type === "RestElement") nomesDe(p.argument, o); return o; };
  for (const st of comp.node.body.body) {
    if (st.type !== "VariableDeclaration") continue;
    for (const d of st.declarations) {
      if (d.id.type !== "Identifier") { for (const n of nomesDe(d.id)) defs.set(n, { st, d, tipo: "estado" }); continue; }
      const i = d.init;
      const chamada = i && i.type === "CallExpression" && i.callee.type === "Identifier" ? i.callee.name : "";
      const tipo = /Ref$/.test(d.id.name) && /^use(Ref|VistaDoEstado)$/.test(chamada) ? "ref"
        : (i && /Function/.test(i.type)) || (chamada === "useCallback") ? "funcao" : "valor";
      defs.set(d.id.name, { st, d, tipo });
    }
  }
  const modulo = new Map();
  for (const st of ast.program.body) if (st.type === "VariableDeclaration") for (const d of st.declarations) if (d.id.type === "Identifier") modulo.set(d.id.name, st);
  const caminhoDe = (node) => { let a = null; comp.traverse({ enter(p) { if (p.node === node) { a = p; p.stop(); } } }); return a; };
  const programa = comp.scope.getProgramParent();

  /* o fecho */
  const fila = [RAIZ], visto = new Set([RAIZ]), refs = new Map(), render = new Set(), usados = new Set(), doModulo = new Set();
  const varrer = (caminho, onde) => caminho.traverse({
    Identifier(p) {
      if (!p.isReferencedIdentifier()) return;
      const n = p.node.name, b = p.scope.getBinding(n);
      if (!b) return; /* global do JavaScript */
      if (b.scope === programa) {
        if (imports.has(n)) usados.add(n);
        else if (DO_MODULO.includes(n)) doModulo.add(n);
        else if (n !== "calou") throw new Error(`${onde} lê ${n}, do módulo do App, que o recorte não leva`);
        return;
      }
      if (b.scope !== comp.scope) return; /* local */
      const d = defs.get(n);
      if (!d) throw new Error(`${onde} lê ${n}, sem definição no componente`);
      if (d.tipo === "ref") {
        const r = refs.get(n) || { escreve: false };
        const pai = p.parentPath;
        if (pai.isMemberExpression() && pai.parentPath.isAssignmentExpression() && pai.parentPath.node.left === pai.node) r.escreve = true;
        refs.set(n, r);
      } else if (d.tipo === "funcao") {
        if (PORTAS.includes(n)) return;
        if (!visto.has(n)) { visto.add(n); fila.push(n); }
      } else if (!DO_RENDER.includes(n)) render.add(n);
    },
  });
  const incluidas = [];
  while (fila.length) { const n = fila.shift(); incluidas.push(n); varrer(caminhoDe(defs.get(n).d), n); }
  for (const n of DO_RENDER) varrer(caminhoDe(defs.get(n).d), n);
  /* o que é do módulo puxa o que é do módulo (falasDoMestre lê LEITURA_DA_CONVERSA) */
  const filaM = [...doModulo];
  while (filaM.length) {
    const n = filaM.shift();
    traverse(ast, { enter(p) { if (p.node === modulo.get(n)) { p.traverse({ Identifier(q) {
      if (!q.isReferencedIdentifier()) return;
      const b = q.scope.getBinding(q.node.name);
      if (!b || b.scope !== programa) return;
      if (imports.has(q.node.name)) usados.add(q.node.name);
      else if (DO_MODULO.includes(q.node.name) && !doModulo.has(q.node.name)) { doModulo.add(q.node.name); filaM.push(q.node.name); }
    } }); p.stop(); } } });
  }

  /* o texto de cada declaração, com os comentários colados a ela */
  const textoDe = (st) => {
    const cs = (st.leadingComments || []);
    let ini = st.start;
    for (let k = cs.length - 1; k >= 0; k--) { const entre = app.slice(cs[k].end, ini); if (/^\s*$/.test(entre)) ini = cs[k].start; else break; }
    while (ini > 0 && app[ini - 1] === " ") ini--;
    return app.slice(ini, st.end);
  };
  const recortes = [];
  for (const n of DO_MODULO.filter((x) => doModulo.has(x))) recortes.push({ nome: n, de: "modulo", texto: textoDe(modulo.get(n)) });
  for (const n of [...incluidas].sort((a, b) => defs.get(a).st.start - defs.get(b).st.start)) recortes.push({ nome: n, de: "componente", texto: textoDe(defs.get(n).st) });
  for (const n of DO_RENDER) recortes.push({ nome: n, de: "render", texto: textoDe(defs.get(n).st) });
  if (new Set(recortes.map((r) => r.texto)).size !== recortes.length) throw new Error("dois nomes na mesma declaração");

  /* o campo de cada ref no save: o literal do retrato (retratoDoJogo) diz quem é quem */
  const campos = {};
  const ret = defs.get("retratoDoJogo");
  caminhoDe(ret.d).traverse({ ObjectProperty(p) {
    const k = p.node.key.name || p.node.key.value;
    let v = p.node.value;
    if (v.type === "CallExpression" && v.arguments.length === 1) v = v.arguments[0];
    if (v.type === "MemberExpression" && v.object.type === "Identifier" && /Ref$/.test(v.object.name)) campos[v.object.name] = k;
  } });
  const refsOut = {};
  for (const [n, r] of [...refs].sort((a, b) => a[0].localeCompare(b[0]))) {
    const d = defs.get(n).d.init;
    const arg = d.callee.name === "useRef" ? d.arguments[0] : d.arguments[2];
    if (arg) traverse(ast, { enter(p) { if (p.node === arg) { if (p.isIdentifier() && imports.has(arg.name)) usados.add(arg.name); p.traverse({ Identifier(q) { if (q.isReferencedIdentifier() && imports.has(q.node.name)) usados.add(q.node.name); } }); p.stop(); } } });
    refsOut[n] = { campo: campos[n] || n.replace(/Ref$/, ""), padrao: arg ? app.slice(arg.start, arg.end) : "undefined", escreve: r.escreve, salvo: !!campos[n] };
  }
  const importsOut = {};
  for (const n of [...usados].sort()) importsOut[n] = imports.get(n);
  return { recortes, refs: refsOut, render: [...render].sort(), imports: importsOut };
}

if (process.argv[1] && process.argv[1].endsWith("gerar-pauta-dourado.mjs")) {
  const commit = process.argv[2] || "55f7889";
  const sha = execSync(`git rev-parse --short ${commit}`, { encoding: "utf8" }).trim();
  const app = execSync(`git show ${sha}:src/App.jsx`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).split(String.fromCharCode(13)).join("");
  const r = recortarAPauta(app);
  const { correrOsCasos, fotoGuardada } = await import("./pauta-bloco.mjs");
  const dourado = { commit: sha, ...r, fotos: [] };
  const fotos = await correrOsCasos(dourado, { lado: "recorte" });
  dourado.fotos = fotos.map(fotoGuardada);
  fs.writeFileSync(new URL("./pauta-dourado.json", import.meta.url), JSON.stringify(dourado, null, 1) + "\n");
  const tam = r.recortes.reduce((a, x) => a + x.texto.length, 0);
  console.log(`pauta-dourado.json: ${r.recortes.length} recortes de ${sha} (${tam} caracteres), ${Object.keys(r.refs).length} refs, ${Object.keys(r.imports).length} imports, render ${r.render.join(" ")}, ${dourado.fotos.length} fotos`);
}
