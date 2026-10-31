/* AS ÂNCORAS DO APP — a prova de que o varredor da Fase X morde igual sem número de linha

   POR QUE ESTA SUÍTE EXISTE. A Fase 2 do plano do motor (31/10/2026)
   tirou os 141 endereços `src/App.jsx:N` de `acoes-do-jogador.mjs` e pôs no
   lugar o nome da função e um trecho único do código (`ancoras-do-app.mjs`).
   Trocar número por âncora só vale se o varredor (`check-acoes-do-jogador`)
   continuar a MORDER onde mordia — e a morder MELHOR onde o número mentia
   (ele só perguntava se a linha tinha um `pushMsgs(`, nunca qual). Esta
   suíte prova as duas metades, em cópias do App.jsx mutadas em disco
   temporário (o `src/` não é tocado), rodando o varredor de verdade:

     · MORDE: apagar, renomear ou duplicar o alvo acende o varredor —
       renomear cada uma das 15 funções do funil; estragar a chamada de uma
       amostra das âncoras (uma em cada três); duplicar uma chamada;
       acrescentar uma chamada que nenhuma âncora cobre; mexer no relógio, no
       `enviar`, e nas funções que as tabelas citam por `src/App.jsx#nome`.
     · NÃO MORDE ao toa: inserir 50 linhas no topo do App, 50 antes de cada
       função do funil, e reflowar as quebras de linha DENTRO das âncoras não
       acende nada — que é o ponto de a linha ter saído da prova.

   E fica uma catraca no fim: nenhum desses arquivos volta a ter número de
   linha do App. */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { normaliza, declaracoesDoComponente, corpoDe, funcaoDoTrecho, declaracoesDe, referenciasDe, conferirReferencia, ocorrencias, conferirChamadas } from "./ancoras-do-app.mjs";
import { FUNIL_DO_COMBATE, RECUSAS_DO_COMBATE } from "./acoes-do-jogador.mjs";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const AQUI = fileURLToPath(new URL("./", import.meta.url));
const APP = readFileSync(join(AQUI, "../src/App.jsx"), "utf8");

/* ============================================================
   1. AS PEÇAS — pequenas, sobre textos que cabem na tela
   ============================================================ */
sec("1. as peças de ancoras-do-app.mjs");
{
  t("normaliza colapsa qualquer espaço em branco", normaliza("a \n   b\t\tc") === "a b c");
  t("o recuo e a quebra de linha não mudam uma âncora",
    ocorrencias(normaliza("  foo(\n      bar,\n      baz)"), "foo( bar, baz)") === 1);
  t("uma âncora vazia não acha nada", ocorrencias("abc", "   ") === 0);

  const fonte = [
    "export const A = 1;",
    "  const dentro = () => 2;",
    "  function dentro2() {}",
    "const unica = 3;",
    "  const dup = 1;",
    "  const dup = 2;",
    "const dupe = 4;",
  ].join("\n");
  t("declaracoesDe acha const, function e export, com ou sem recuo",
    declaracoesDe(fonte, "A") === 1 && declaracoesDe(fonte, "dentro") === 1 && declaracoesDe(fonte, "dentro2") === 1);
  t("e conta duas quando o nome é declarado duas vezes (a ambiguidade)", declaracoesDe(fonte, "dup") === 2);
  t("e não confunde um nome com o prefixo de outro", declaracoesDe(fonte, "dupe") === 1 && declaracoesDe(fonte, "du") === 0);
  t("nome ausente é zero", declaracoesDe(fonte, "fantasma") === 0);

  const refs = referenciasDe({ a: "veja src/App.jsx#moverPara e src/grid.js#caminhar", b: ["src/combate.js#gastarRecurso", 3, null], c: { d: "sem nada" } });
  t("referenciasDe apanha o arquivo#nome em qualquer string, em qualquer fundo",
    refs.size === 3 && refs.has("src/App.jsx#moverPara") && refs.has("src/grid.js#caminhar") && refs.has("src/combate.js#gastarRecurso"));
  t("e um `#` solto não é referência", referenciasDe("a #b e src/x.js sem nome").size === 0);

  const ler = (arq) => (arq === "src/a.js" ? "export const X = 1;\n  const Y = 1;\n  const Y = 2;" : (() => { throw new Error("sem arquivo"); })());
  t("conferirReferencia: um nome declarado uma vez está bem", conferirReferencia("src/a.js#X", ler).ok === true);
  t("sumiu é falha, e diz que sumiu", (() => { const r = conferirReferencia("src/a.js#Z", ler); return !r.ok && r.n === 0 && /não é mais declarado/.test(r.motivo); })());
  t("ambíguo é falha, e diz que é ambíguo", (() => { const r = conferirReferencia("src/a.js#Y", ler); return !r.ok && r.n === 2 && /ambíguo/.test(r.motivo); })());
  t("arquivo que não existe é falha", conferirReferencia("src/b.js#X", ler).ok === false);

  const corpo = "  const f = () => {\n    pushMsgs([{ texto: a }]);\n    if (x) pushMsgs([{ texto: b }]);\n    pushMsgs(linhas);\n  };";
  const bem = conferirChamadas(corpo, ["pushMsgs([{ texto: a }])", "pushMsgs([{ texto: b }])", "pushMsgs(linhas)"]);
  t("conferirChamadas: três âncoras, três chamadas, nada sobra",
    bem.total === 3 && bem.soltas === 0 && !bem.sumidas.length && !bem.ambiguas.length && !bem.semChamada.length && !bem.repetidas.length);
  t("uma chamada sem âncora é «solta»", conferirChamadas(corpo, ["pushMsgs([{ texto: a }])", "pushMsgs(linhas)"]).soltas === 1);
  t("âncora que não está no corpo é «sumida»", conferirChamadas(corpo, ["pushMsgs([{ texto: z }])"]).sumidas.length === 1);
  t("âncora que aparece duas vezes é «ambígua»", conferirChamadas(corpo + corpo, ["pushMsgs(linhas)"]).ambiguas.length === 1);
  t("âncora sem chamada, ou com duas, é «semChamada»",
    conferirChamadas(corpo, ["texto: a"]).semChamada.length === 1
    && conferirChamadas(corpo, ["pushMsgs([{ texto: a }]); pushMsgs(linhas)"]).semChamada.length === 1);
  t("duas âncoras na mesma chamada: a segunda é «repetida»",
    conferirChamadas(corpo, ["pushMsgs(linhas)", "pushMsgs(linhas);"]).repetidas.length === 1);

  const app = "const x = 1;\n  const alfa = () => {\n    a();\n  };\n  const beta = () => {\n    a();\n    unico();\n  };\n";
  t("corpoDe acha o corpo de uma função e diz quantas vezes ela é declarada",
    corpoDe(app, "alfa").n === 1 && /a\(\)/.test(corpoDe(app, "alfa").texto) && !/unico/.test(corpoDe(app, "alfa").texto) && corpoDe(app, "nada").n === 0);
  t("funcaoDoTrecho diz em que função cai um trecho único", funcaoDoTrecho(app, "unico()") === "beta");
  t("e devolve null quando o trecho não é único", funcaoDoTrecho(app, "a();") === null);
}

/* ============================================================
   2. O APP DE VERDADE — as tabelas ancoram nele, sem número
   ============================================================ */
sec("2. as tabelas contra o App.jsx de agora");
{
  const doFunil = FUNIL_DO_COMBATE.reduce((n, f) => n + f.linhas.length, 0);
  t("o funil tem 57 linhas e cada uma tem a sua âncora", doFunil === 57 && FUNIL_DO_COMBATE.every((f) => f.linhas.every((l) => typeof l.ancora === "string")), String(doFunil));
  let todasBem = true;
  for (const f of FUNIL_DO_COMBATE) {
    const { n, texto } = corpoDe(APP, f.fn);
    const c = conferirChamadas(texto, f.linhas.map((l) => l.ancora));
    if (n !== 1 || c.sumidas.length || c.ambiguas.length || c.semChamada.length || c.repetidas.length || c.soltas) todasBem = false;
  }
  t("as 15 funções do funil: cada chamada de pushMsgs tem UMA âncora e cada âncora UMA chamada", todasBem);
  t("e toda recusa das 18 achada pela sua âncora no corpo da sua função",
    RECUSAS_DO_COMBATE.length === 18 && RECUSAS_DO_COMBATE.every((r) => {
      const { n, texto } = corpoDe(APP, r.fn);
      const c = conferirChamadas(texto, [r.ancora]);
      return n === 1 && !c.sumidas.length && !c.ambiguas.length && !c.semChamada.length;
    }));
  t("as âncoras do funil são todas distintas dentro de cada função",
    FUNIL_DO_COMBATE.every((f) => new Set(f.linhas.map((l) => normaliza(l.ancora))).size === f.linhas.length));
}

/* ============================================================
   3. A MORDIDA — o varredor, de verdade, contra cópias mutadas
   ============================================================ */
const TMP = mkdtempSync(join(tmpdir(), "taverna-ancoras-"));
let seq = 0;

/* roda `check-acoes-do-jogador.mjs` contra um App.jsx alternativo */
function rodarVarredor(textoDoApp) {
  const arq = join(TMP, `app-${++seq}.jsx`);
  writeFileSync(arq, textoDoApp);
  return new Promise((resolve) => {
    const p = spawn(process.execPath, ["check-acoes-do-jogador.mjs"], { cwd: AQUI, env: { ...process.env, TAVERNA_APP_JSX: arq } });
    let out = "";
    p.stdout.on("data", (d) => { out += d; });
    p.stderr.on("data", (d) => { out += d; });
    p.on("close", (codigo) => resolve({ codigo, out }));
  });
}

/* as mutações trabalham no corpo de uma função, em texto cru. Os limites se
   recalculam a cada mutação: uma mutação muda o tamanho do texto, e a
   seguinte (o reflow faz 57 em sequência) não pode usar os limites da cópia
   anterior. */
function limitesDe(app, fn) {
  const { linhas, decls } = declaracoesDoComponente(app);
  const d = decls.find((x) => x.nome === fn);
  const inicioDaLinha = (i) => linhas.slice(0, i).reduce((n, l) => n + l.length + 1, 0);
  return { ini: inicioDaLinha(d.ini), fim: inicioDaLinha(d.fim) };
}
const escapa = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/* a âncora, como expressão que aceita qualquer espaço em branco no lugar de cada espaço */
const reDaAncora = (a) => new RegExp(normaliza(a).trim().split(" ").map(escapa).join("\\s+"));
function noCorpo(app, fn, f) {
  const { ini, fim } = limitesDe(app, fn);
  return app.slice(0, ini) + f(app.slice(ini, fim)) + app.slice(fim);
}
function mutaAncora(app, fn, ancora, f) {
  return noCorpo(app, fn, (corpo) => {
    const m = reDaAncora(ancora).exec(corpo);
    if (!m) throw new Error(`a âncora não está no corpo cru de ${fn}: ${ancora}`);
    return corpo.slice(0, m.index) + f(m[0]) + corpo.slice(m.index + m[0].length);
  });
}
const renomeiaDeclaracao = (app, nome) => {
  const re = new RegExp(`^(  (?:const|async function|function) )${escapa(nome)}(\\s*=?\\s*(?:async\\s*)?(?:\\(|function|useCallback|=>))`, "m");
  if (!re.test(app)) throw new Error(`não achei a declaração de ${nome}`);
  return app.replace(re, `$1${nome}Renomeada$2`);
};

sec("3. a mordida: o varredor acende quando o alvo some, muda ou se duplica");
{
  const base = await rodarVarredor(APP);
  t("a cópia idêntica do App passa limpa (a linha de base da prova)", base.codigo === 0 && /tabela e código de acordo/.test(base.out), base.out.slice(-300));

  const casos = [];
  const quer = (nome, app, pedacos) => casos.push({ nome, app, pedacos });

  /* 3a. renomear cada uma das 15 funções do funil */
  for (const f of FUNIL_DO_COMBATE) {
    quer(`renomear \`${f.fn}\` acende o varredor e diz qual`, renomeiaDeclaracao(APP, f.fn), [`\`${f.fn}\``]);
  }

  /* 3b. estragar a chamada de uma amostra das âncoras (uma em cada três) */
  const todas = FUNIL_DO_COMBATE.flatMap((f) => f.linhas.map((l) => ({ fn: f.fn, ancora: l.ancora })));
  const amostra = todas.filter((_, i) => i % 3 === 0);
  for (const a of amostra) {
    quer(`estragar a chamada de ${a.fn} («${normaliza(a.ancora).slice(0, 46)}…») acende «sumiu»`,
      mutaAncora(APP, a.fn, a.ancora, (m) => m.replace("pushMsgs(", "pushMsgz(")), [`sumiu do corpo de \`${a.fn}\``]);
  }

  /* 3c. duplicar uma chamada: a âncora deixa de distinguir */
  for (const a of todas.filter((_, i) => i % 10 === 5)) {
    quer(`duplicar a chamada de ${a.fn} («${normaliza(a.ancora).slice(0, 40)}…») acende «mais de uma vez»`,
      mutaAncora(APP, a.fn, a.ancora, (m) => `${m}; ${m}`), [`aparece mais de uma vez no corpo de \`${a.fn}\``]);
  }

  /* 3d. uma chamada nova que nenhuma âncora cobre */
  for (const nome of ["tentarReacaoNoGolpe", "resolverRevide", "moverPara", "declararGolpe"]) {
    const f = FUNIL_DO_COMBATE.find((x) => x.fn === nome);
    quer(`uma chamada de pushMsgs a mais em ${nome} acende «cobre»`,
      mutaAncora(APP, nome, f.linhas[0].ancora, (m) => `pushMsgs([{ autor: "sistema", texto: "solta" }]); ${m}`),
      [`\`${nome}\` tem`, "chamadas de pushMsgs e a tabela cobre"]);
  }

  /* 3e. o relógio: some, ou se duplica */
  quer("apagar o avanço do relógio acende o dente 8", APP.replace("avancarMinutos(MINUTOS_POR_TURNO)", "0"), ["não achei `avancarMinutos(MINUTOS_POR_TURNO)`"]);
  quer("duplicar o avanço do relógio acende o dente 8",
    APP.replace("avancarMinutos(MINUTOS_POR_TURNO)", "avancarMinutos(MINUTOS_POR_TURNO) + avancarMinutos(MINUTOS_POR_TURNO)"), ["aparece 2 vezes"]);

  /* 3f. o `enviar` da porta única, e a declaração do funil */
  quer("estragar o enviar do combate resolvido acende o bloco 11",
    APP.replace('enviar(oEnvelopeDaFicha("combateResolvido", ', 'enviar(oEnvelopeDaFicha("combateResolvidx", '), ["não achei (uma só vez) o `enviar("]);
  quer("renomear o pushMsgs acende o bloco 9", renomeiaDeclaracao(APP, "pushMsgs"), ["não achei a declaração de `pushMsgs`"]);

  /* 3g. as funções que as tabelas citam por `src/App.jsx#nome` */
  for (const nome of ["linhaDePasso", "pocaoDeCompanheiro", "buffDeCompanheiro", "resolverQueda", "usarHeroismo", "usarConsumivelUI", "adjudicarAcao", "vereditoDoGolpeAgora"]) {
    quer(`renomear \`${nome}\` (citada por referência) acende o bloco 12`, renomeiaDeclaracao(APP, nome), [`src/App.jsx#${nome}`, "não é mais declarado"]);
  }
  quer("declarar `linhaDePasso` duas vezes acende «ambíguo»", APP.replace("  const pushMsgs = useCallback(", "  const linhaDePasso = 1;\n  const pushMsgs = useCallback("), ["src/App.jsx#linhaDePasso", "ambíguo"]);

  /* roda em paralelo, em lotes */
  const resultados = [];
  for (let i = 0; i < casos.length; i += 8) {
    resultados.push(...await Promise.all(casos.slice(i, i + 8).map((c) => rodarVarredor(c.app))));
  }
  casos.forEach((c, i) => {
    const r = resultados[i];
    t(c.nome, r.codigo === 1 && c.pedacos.every((p) => r.out.includes(p)), `código ${r.codigo}; faltou: ${c.pedacos.filter((p) => !r.out.includes(p)).join(" | ")}`);
  });
  t(`a amostra mordida tem mais de vinte alvos (foram ${casos.length})`, casos.length > 20, String(casos.length));
}

sec("4. a não-mordida: deslocar o App não acende nada");
{
  const nao = [];
  const naoQuer = (nome, app) => nao.push({ nome, app });
  const cinquenta = Array.from({ length: 50 }, (_, i) => `/* linha de deslocamento ${i} */`).join("\n") + "\n";

  naoQuer("50 linhas no topo do App", cinquenta + APP);
  /* 50 linhas antes de CADA função do funil, de uma vez: o deslocamento deixa de ser uniforme,
     que era exatamente o caso que obrigava a re-medir um por um */
  let espalhado = APP;
  for (const f of FUNIL_DO_COMBATE) {
    const re = new RegExp(`^(  (?:const|async function|function) ${escapa(f.fn)}\\s*=?\\s*(?:async\\s*)?(?:\\(|function|useCallback|=>))`, "m");
    espalhado = espalhado.replace(re, `${cinquenta.replace(/\n$/, "").split("\n").map((l) => "  " + l).join("\n")}\n$1`);
  }
  naoQuer("50 linhas antes de cada uma das 15 funções do funil (deslocamento não uniforme)", espalhado);
  naoQuer("50 linhas no meio do componente, antes do pushMsgs", APP.replace("  const pushMsgs = useCallback(", cinquenta + "  const pushMsgs = useCallback("));
  naoQuer("5 000 linhas no topo (o App dobrando de tamanho não importa)", Array.from({ length: 5000 }, () => "// x").join("\n") + "\n" + APP);

  /* reflow: cada espaço da âncora ANTES do primeiro literal vira quebra de
     linha com recuo novo. (Os espaços DENTRO de um literal de frase não se
     tocam: mexer neles muda a frase, e essa é outra mordida — a do literal.) */
  let reflow = APP, mexidas = 0;
  for (const a of todasAsAncoras()) {
    /* `aplicarGolpeDoJogador` fica de fora: o bloco 11 do varredor lê o eco
       do jogador por um regex de espaço único (`autor: "jogador"`), que é
       OUTRO dente — de texto, não de âncora — e o reflow o quebraria por uma
       razão que não é a que esta seção prova. */
    if (a.fn === "aplicarGolpeDoJogador") continue;
    reflow = mutaAncora(reflow, a.fn, a.ancora, (m) => {
      const q = m.search(/["`]/);
      const antes = q < 0 ? m : m.slice(0, q), depois = q < 0 ? "" : m.slice(q);
      const novo = antes.replace(/\s+/g, "\n            ");
      if (novo !== antes) mexidas++;
      return novo + depois;
    });
  }
  t("o reflow mexeu em dezenas de âncoras (para valer)", mexidas >= 30, String(mexidas));
  naoQuer("reflow: quebra de linha e recuo novos no lugar dos espaços antes do primeiro literal de cada âncora", reflow);

  const rs = await Promise.all(nao.map((c) => rodarVarredor(c.app)));
  nao.forEach((c, i) => t(c.nome + " — o varredor segue verde", rs[i].codigo === 0, rs[i].out.split("\n").filter((l) => /XX/.test(l)).slice(0, 3).join(" | ")));
}

function todasAsAncoras() {
  return FUNIL_DO_COMBATE.flatMap((f) => f.linhas.map((l) => ({ fn: f.fn, ancora: l.ancora })));
}

/* ============================================================
   5. A CATRACA — o endereço de linha não volta
   ============================================================ */
sec("5. nenhum número de linha do App volta às provas da Fase X");
{
  const ARQUIVOS = ["acoes-do-jogador.mjs", "check-acoes-do-jogador.mjs", "teste-acoes-do-jogador.mjs", "sonda-turno-esteril.mjs", "ancoras-do-app.mjs"];
  const padrao = new RegExp("App\\.jsx" + ":" + "\\d");
  for (const a of ARQUIVOS) {
    const txt = readFileSync(join(AQUI, a), "utf8");
    t(`${a} não cita endereço de linha do App`, !padrao.test(txt), (txt.match(new RegExp("[^\\n]*" + padrao.source + "[^\\n]*")) || [""])[0].slice(0, 120));
  }
  const tabelas = await import("./acoes-do-jogador.mjs");
  const nasTabelas = JSON.stringify(Object.values(tabelas).filter((v) => typeof v !== "function"));
  t("e nenhuma string das tabelas cita arquivo:linha de src/", !/src\/[A-Za-z0-9_./-]+\.(?:jsx?|mjs):\d/.test(nasTabelas));
  t("as referências das tabelas existem (são dezenas)", referenciasDe(Object.values(tabelas).filter((v) => typeof v !== "function")).size >= 20);
}

rmSync(TMP, { recursive: true, force: true });
console.log(`\n${bons} ok, ${maus} falhas`);
process.exit(maus ? 1 : 0);
