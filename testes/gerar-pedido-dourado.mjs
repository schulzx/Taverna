/* gerar-pedido-dourado.mjs (Fase 4, trilha B, 29/10/2026) — o recorte à letra da montagem do pedido

   O segundo passo da ordem do inventário (14bde83), no padrão da pauta
   (gerar-pauta-dourado.mjs, bb7ab7a). A pauta era uma função com nome; a
   montagem não é: são as 25 instruções do corpo de `enviar` que vão do
   `const pauta = textoDaPauta(pautaDoTurno(conteudo), …)` ao
   `systemRef.current = montarSystemPrompt(…)` — a pauta, a nota do turno, a
   escuta, os sinais, o rodapé, o histórico com a frase por último e o
   system. Mais o começo de `chamarMestre` (a janela ancorada e a ordem do
   cache), que é o que vai à rede. O recorte é esse trecho à letra, e o
   fecho é o mesmo de lá: a árvore do @babel/parser segue cada nome até à
   declaração, e cada função do componente que o trecho chama vem com ele,
   de fecho em fecho — inclusive a `pautaDoTurno` e as suas 50.

   O que o trecho lê de `enviar` e foi escrito ANTES dele (a oficina, o
   compasso, a forma da cena, a frente, a virada, a trama, a escuta) é a
   ENTRADA: são os nomes de `ENTRADA_DO_PEDIDO`, que o turno inteiro
   (`turno()`) terá de produzir no servidor. O que o trecho declara e o
   resto de `enviar` lê depois é a SAÍDA.

   Grava em `pedido-dourado.json`:
     commit, recortes ({ nome, de, texto }), trecho (o texto à letra),
     entrada, saida, refs, render (e o valor de partida de cada um, o
     argumento do useState), setters, imports, fotos.

   Uso: node testes/gerar-pedido-dourado.mjs [commit] */
import { execSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";

const req = createRequire(new URL("../package.json", import.meta.url));
const parser = req("@babel/parser");
const traverse = req("@babel/traverse").default;

/* as âncoras do trecho, e de onde o trecho vive */
const DE = "const pauta = textoDaPauta(pautaDoTurno(conteudo)";
const ATE = "systemRef.current = montarSystemPrompt(";
/* as funções do componente que o recorte NÃO leva: são portas da peça */
const PORTAS = ["pushMsgs"];
/* o que é do módulo do App e é porta (o calou da casa; a rede) */
const PORTAS_DO_MODULO = ["calou", "chamarModelo"];
/* o que é do módulo e o recorte leva mesmo sem o trecho o ler (a rede começa ali) */
const RAIZES_DO_MODULO = ["chamarMestre"];

/* As âncoras e as portas são as do pedido; o trecho de `enviar` que vem
   ANTES dele (gerar-antes-dourado.mjs) usa a mesma ferramenta com as suas. */
export function recortarOPedido(app, { pautaEPorta = false, de = DE, ate = ATE, portas = PORTAS, portasDoModulo = PORTAS_DO_MODULO, raizes = RAIZES_DO_MODULO } = {}) {
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
      if (d.id.type !== "Identifier") { for (const n of nomesDe(d.id)) defs.set(n, { st, d, tipo: /^set[A-Z]/.test(n) ? "setter" : "estado" }); continue; }
      const i = d.init;
      const chamada = i && i.type === "CallExpression" && i.callee.type === "Identifier" ? i.callee.name : "";
      const tipo = /Ref$/.test(d.id.name) && /^use(Ref|VistaDoEstado)$/.test(chamada) ? "ref"
        : (i && /Function/.test(i.type)) || (chamada === "useCallback") ? "funcao" : "valor";
      defs.set(d.id.name, { st, d, tipo });
    }
  }
  const modulo = new Map();
  for (const st of ast.program.body) {
    if (st.type === "VariableDeclaration") for (const d of st.declarations) { if (d.id.type === "Identifier") modulo.set(d.id.name, st); }
    else if ((st.type === "FunctionDeclaration") && st.id) modulo.set(st.id.name, st);
  }
  const caminhoDe = (node, raiz = comp) => { let a = null; raiz.traverse({ enter(p) { if (p.node === node) { a = p; p.stop(); } } }); return a; };
  const programa = comp.scope.getProgramParent();

  /* o trecho de `enviar` */
  let env = null;
  for (const st of comp.get("body.body")) if (st.isVariableDeclaration()) for (const d of st.get("declarations")) if (d.node.id.name === "enviar") env = d;
  if (!env) throw new Error("enviar não está onde estava");
  const fn = env.get("init.arguments.0");
  const corpo = fn.get("body.body");
  const ini = corpo.findIndex((s) => app.slice(s.node.start, s.node.end).startsWith(de));
  const fim = corpo.findIndex((s) => app.slice(s.node.start, s.node.end).startsWith(ate));
  if (ini < 0 || fim < ini) throw new Error(`as âncoras do trecho não batem (${ini}, ${fim})`);
  const trechoSt = corpo.slice(ini, fim + 1);
  const depois = corpo.slice(fim + 1);

  /* o fecho */
  const fila = [], visto = new Set(), refs = new Map(), render = new Set(), setters = new Set(), usados = new Set(), doModulo = new Set(), entrada = new Set(), doRender = new Set();
  const filaM = [...raizes];
  raizes.forEach((n) => doModulo.add(n));
  const naPrograma = (n) => {
    if (imports.has(n)) { usados.add(n); return; }
    if (portasDoModulo.includes(n)) return;
    if (modulo.has(n)) { if (!doModulo.has(n)) { doModulo.add(n); filaM.push(n); } return; }
    throw new Error(`lê ${n}, do módulo do App, sem declaração`);
  };
  const varrer = (caminho, onde) => caminho.traverse({
    Identifier(p) {
      if (!p.isReferencedIdentifier()) return;
      const n = p.node.name, b = p.scope.getBinding(n);
      if (!b) return; /* global do JavaScript */
      if (b.scope === programa) { naPrograma(n); return; }
      if (b.scope === fn.scope) { entrada.add(n); return; } /* de `enviar`, de antes do trecho (o que é do trecho tem escopo próprio abaixo) */
      if (b.scope !== comp.scope) return; /* local */
      const d = defs.get(n);
      if (!d) throw new Error(`${onde} lê ${n}, sem definição no componente`);
      if (d.tipo === "ref") {
        const r = refs.get(n) || { escreve: false };
        const pai = p.parentPath;
        if (pai.isMemberExpression() && pai.parentPath.isAssignmentExpression() && pai.parentPath.node.left === pai.node) r.escreve = true;
        refs.set(n, r);
      } else if (d.tipo === "funcao") {
        if (portas.includes(n)) return;
        if (pautaEPorta && n === "pautaDoTurno") return;
        if (!visto.has(n)) { visto.add(n); fila.push(n); }
      } else if (d.tipo === "setter") setters.add(n);
      else if (d.tipo === "valor") { if (!doRender.has(n)) { doRender.add(n); fila.push("§" + n); } }
      else render.add(n);
    },
  });
  for (const st of trechoSt) varrer(st, "o trecho");
  /* o que o trecho declara é dele, não de `enviar`: tira-se da entrada */
  const declarados = new Set();
  for (const st of trechoSt) if (st.isVariableDeclaration()) for (const d of st.node.declarations) nomesDe(d.id, []).forEach((n) => declarados.add(n));
  for (const n of declarados) entrada.delete(n);
  const incluidas = [];
  while (fila.length) {
    const n = fila.shift();
    if (n.startsWith("§")) { varrer(caminhoDe(defs.get(n.slice(1)).d), n.slice(1)); continue; }
    incluidas.push(n); varrer(caminhoDe(defs.get(n).d), n);
  }
  const progPath = comp.parentPath.parentPath || comp.parentPath;
  while (filaM.length) {
    const n = filaM.shift();
    traverse(ast, { enter(p) { if (p.node === modulo.get(n)) { p.traverse({ Identifier(q) {
      if (!q.isReferencedIdentifier()) return;
      const b = q.scope.getBinding(q.node.name);
      if (!b || b.scope !== programa) return;
      if (q.node.name === n) return;
      naPrograma(q.node.name);
    } }); p.stop(); } } });
  }
  void progPath;

  /* a saída: o que o trecho declara e o resto de `enviar` lê */
  const saida = new Set();
  for (const st of depois) st.traverse({ Identifier(p) {
    if (!p.isReferencedIdentifier()) return;
    const b = p.scope.getBinding(p.node.name);
    if (b && b.scope === fn.scope && declarados.has(p.node.name)) saida.add(p.node.name);
  } });

  /* o texto de cada declaração, com os comentários colados a ela */
  const textoDe = (st) => {
    const cs = (st.leadingComments || []);
    let i0 = st.start;
    for (let k = cs.length - 1; k >= 0; k--) { const entre = app.slice(cs[k].end, i0); if (/^\s*$/.test(entre)) i0 = cs[k].start; else break; }
    while (i0 > 0 && app[i0 - 1] === " ") i0--;
    return app.slice(i0, st.end);
  };
  const recortes = [];
  for (const [n, st] of [...modulo].filter(([n]) => doModulo.has(n)).sort((a, b) => a[1].start - b[1].start)) recortes.push({ nome: n, de: "modulo", texto: textoDe(st) });
  for (const n of [...incluidas].sort((a, b) => defs.get(a).st.start - defs.get(b).st.start)) recortes.push({ nome: n, de: "componente", texto: textoDe(defs.get(n).st) });
  for (const n of [...doRender].sort((a, b) => defs.get(a).st.start - defs.get(b).st.start)) recortes.push({ nome: n, de: "render", texto: textoDe(defs.get(n).st) });
  if (new Set(recortes.map((r) => r.texto)).size !== recortes.length) throw new Error("dois nomes na mesma declaração");
  const trecho = app.slice(textoDe(trechoSt[0].node).length ? (() => { const t0 = textoDe(trechoSt[0].node); return trechoSt[0].node.end - t0.length; })() : trechoSt[0].node.start, trechoSt[trechoSt.length - 1].node.end);

  /* o valor de partida de cada estado React que o trecho lê (o argumento do
     useState): é o que o render tem quando o save não o traz. Pode ler um
     ref (`useState(mercadoRef.current)`), e esse ref entra na lista. */
  const renderPadrao = {};
  for (const n of [...render].sort()) {
    const d = defs.get(n).d, i = d.init;
    const arg = i && i.type === "CallExpression" && i.callee.type === "Identifier" && i.callee.name === "useState" ? i.arguments[0] : null;
    const ve = (q) => {
      if (!q.isReferencedIdentifier()) return;
      if (imports.has(q.node.name)) usados.add(q.node.name);
      const dd = defs.get(q.node.name);
      if (dd && dd.tipo === "ref" && !refs.has(q.node.name)) refs.set(q.node.name, { escreve: false });
    };
    if (arg) traverse(ast, { enter(p) { if (p.node === arg) { if (p.isIdentifier()) ve(p); p.traverse({ Identifier: ve }); p.stop(); } } });
    renderPadrao[n] = arg ? app.slice(arg.start, arg.end) : "undefined";
  }

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
  const aguarda = trechoSt.some((s) => { let a = false; s.traverse({ AwaitExpression(p) { if (p.getFunctionParent() === fn) a = true; } }); return a; });
  return { recortes, trecho, entrada: [...entrada].sort(), saida: [...saida].sort(), refs: refsOut, render: [...render].sort(), renderPadrao, setters: [...setters].sort(), imports: importsOut, aguarda };
}

if (process.argv[1] && process.argv[1].endsWith("gerar-pedido-dourado.mjs")) {
  const commit = process.argv[2] || "HEAD";
  const sha = execSync(`git rev-parse --short ${commit}`, { encoding: "utf8" }).trim();
  const app = execSync(`git show ${sha}:src/App.jsx`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).split(String.fromCharCode(13)).join("");
  const r = recortarOPedido(app);
  const { correrOsCasos, fotoGuardada } = await import("./pedido-bloco.mjs");
  const dourado = { commit: sha, ...r, fotos: [] };
  const fotos = await correrOsCasos(dourado, { lado: "recorte" });
  dourado.fotos = fotos.map(fotoGuardada);
  fs.writeFileSync(new URL("./pedido-dourado.json", import.meta.url), JSON.stringify(dourado, null, 1) + "\n");
  const tam = r.recortes.reduce((a, x) => a + x.texto.length, 0) + r.trecho.length;
  console.log(`pedido-dourado.json: ${r.recortes.length} recortes de ${sha} (${tam} caracteres), ${Object.keys(r.refs).length} refs, ${Object.keys(r.imports).length} imports, entrada ${r.entrada.join(" ")}, saída ${r.saida.join(" ")}, render ${r.render.join(" ")}, setters ${r.setters.join(" ")}, ${dourado.fotos.length} fotos`);
}
