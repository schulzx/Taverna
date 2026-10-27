/* check-sem-random.mjs (Fase T0, 27/10/2026) — nenhum dado fora da semente

   A LEI é da casa desde o começo: "mesma semente = mesmo resultado, em
   qualquer máquina — é o único árbitro que um sistema sem servidor tem".
   E não se cumpria. A auditoria do motor (mente/auditoria-do-motor.md, §4,
   "Determinismo e replay") contou 103 `Math.random()` diretos e 61 como
   valor padrão de parâmetro em 29 módulos de `src/`. A Fase T0 trocou-os
   todos pela sorte da casa (`semente.js`: `dadoDo`, `sorteDaCasa`,
   `comSorte`), e este varredor é o dente que impede o primeiro de voltar.

   POR QUE UM VARREDOR E NÃO SÓ UMA SUÍTE. A suíte `teste-semente-em-tudo`
   prova que cada módulo, com a mesma semente, dá o mesmo resultado. Mas
   ela mede os módulos que conhece; o `Math.random` volta num módulo NOVO,
   escrito daqui a três meses por uma mão que nunca leu esta fase. A lei é
   sobre a classe inteira, e só um varredor vê a classe inteira.

   O QUE ELE FAZ. Lê todo `.js` e `.jsx` debaixo de `src/` (subpastas
   incluídas: o `src/motor/` da Fase 1 nasce já debaixo do dente), apaga os
   comentários — a palavra pode ser citada, e é, na história de cada
   módulo — e falha se sobrar um `Math.random`, por ponto ou por colchete.

   AS EXCEÇÕES, com data e com dono. Só a tela, e só nesta fase: o
   `App.jsx` tem os seus (a Fase T1 os converte, e é da trilha A). A
   catraca anda nos dois sentidos: o teto de cada exceção é o que ela tinha
   no dia em que entrou — pode descer, não pode subir —, e uma exceção que
   chega a zero fica vermelha até sair da tabela, para a tabela não virar
   decoração.

   Nada aqui sorteia: é leitura de texto-fonte. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* ============================================================
   A TABELA DAS EXCEÇÕES
   ============================================================ */
const EXCECOES_DO_ACASO = {
  "App.jsx": {
    desde: "2026-10-27",
    ate: "Fase T1 (trilha A: o turno sai do App)",
    /* o teto é a contagem do dia em que a exceção entrou, sem comentários.
       Pode descer (cada conversão do oficial o desce); não pode subir. */
    teto: 37,
    porque: "o dado da tela, o id de objetos e os sorteios do turno que ainda moram no App — o plano do motor os lista para a trilha A converter",
  },
};

/* o alcance: se a leitura quebrar e devolver poucos arquivos, o varredor
   passaria verde sem ter medido nada. Hoje são ~200 módulos. */
const PISO_DE_ARQUIVOS = 150;

/* ============================================================
   A LEITURA
   ============================================================ */
/* Apaga comentários sem confundir `//` dentro de string (uma URL) nem o
   miolo de template — onde `${...}` é código e conta. Com `texto`, apaga
   também o miolo das strings: uma frase que CITA a palavra não sorteia. */
function semComentarios(s, texto = false) {
  const a = s.split("");
  let i = 0; const pilha = []; let modo = null;
  const apaga = (k) => { if (texto && a[k] !== "\n") a[k] = " "; };
  while (i < a.length) {
    const c = a[i], n = a[i + 1];
    if (modo === '"' || modo === "'") {
      if (c === "\\") { apaga(i); apaga(i + 1); i += 2; continue; }
      if (c === modo || c === "\n") { modo = null; i++; continue; }
      apaga(i); i++; continue;
    }
    if (modo === "`") {
      if (c === "\\") { apaga(i); apaga(i + 1); i += 2; continue; }
      if (c === "`") { modo = null; i++; continue; }
      if (c === "$" && n === "{") { pilha.push("`"); modo = null; i += 2; continue; }
      apaga(i); i++; continue;
    }
    if (c === "/" && n === "/") { while (i < a.length && a[i] !== "\n") a[i++] = " "; continue; }
    if (c === "/" && n === "*") { a[i] = a[i + 1] = " "; i += 2; while (i < a.length && !(a[i] === "*" && a[i + 1] === "/")) { if (a[i] !== "\n") a[i] = " "; i++; } if (i < a.length) { a[i] = a[i + 1] = " "; i += 2; } continue; }
    if (c === '"' || c === "'" || c === "`") { modo = c; i++; continue; }
    if (c === "{") { pilha.push("{"); i++; continue; }
    if (c === "}") { if (pilha.pop() === "`") modo = "`"; i++; continue; }
    i++;
  }
  return a.join("");
}
/* por ponto, lido sem comentário nem texto; por colchete, lido só sem
   comentário (o nome mora numa string, e é por isso que se esconde). */
const POR_PONTO = /\bMath\s*\.\s*random\b/g;
const POR_COLCHETE = /\bMath\s*\[\s*["'`]random["'`]\s*\]/g;
function contarAcaso(fonte) {
  const f = typeof fonte === "string" ? fonte : "";
  return (semComentarios(f, true).match(POR_PONTO) || []).length + (semComentarios(f).match(POR_COLCHETE) || []).length;
}

function todos(dir, base = "") {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...todos(path.join(dir, e.name), rel));
    else if (/\.(js|jsx|mjs)$/.test(e.name)) out.push(rel);
  }
  return out;
}

/* ============================================================
   1. o dente morde (antes de medir o projeto, prova-se a régua)
   ============================================================ */
sec("1. a régua apanha o que deve e larga o que deve");
t("apanha a chamada", contarAcaso("const x = Math.random();") === 1);
t("apanha o valor padrão", contarAcaso("function f(r = Math.random) {}") === 1);
t("apanha por colchete", contarAcaso('const r = Math["random"];') === 1);
t("apanha dentro de ${} de template", contarAcaso("const s = `x ${Math.random() < 0.5 ? 'a' : 'b'}`;") === 1);
t("larga o comentário de linha", contarAcaso("// sem Math.random aqui\nconst a = 1;") === 0);
t("larga o comentário de bloco", contarAcaso("/* nunca `Math.random` */ const a = 1;") === 0);
t("larga o texto de uma string", contarAcaso('const s = "não use Math.random";') === 0);
t("uma URL numa string não abre comentário", contarAcaso('const u = "http://x"; const r = Math.random();') === 1);
t("lixo não estoura", contarAcaso(null) === 0 && contarAcaso({}) === 0);

/* ============================================================
   2. o projeto
   ============================================================ */
sec("2. nenhum Math.random em src/, fora das exceções");
const arquivos = todos(RAIZ);
t(`o alcance: ${arquivos.length} arquivos lidos (piso ${PISO_DE_ARQUIVOS})`, arquivos.length >= PISO_DE_ARQUIVOS);
const achados = {};
for (const rel of arquivos) {
  const n = contarAcaso(fs.readFileSync(path.join(RAIZ, rel), "utf8"));
  if (n) achados[rel] = n;
}
const fora = Object.keys(achados).filter((f) => !EXCECOES_DO_ACASO[f]);
t("nenhum módulo sorteia fora da semente", fora.length === 0,
  fora.map((f) => `${f} (${achados[f]})`).join(", ") + " — use dadoDo(semente, ...) ou a sorte recebida; sem ela, sorteDaCasa (semente.js)");
t("nenhum .js de src/ tem exceção (a exceção é só tela)", Object.keys(EXCECOES_DO_ACASO).every((f) => f.endsWith(".jsx")));

sec("3. as exceções: teto que só desce, e saem quando zeram");
for (const [f, ex] of Object.entries(EXCECOES_DO_ACASO)) {
  const n = achados[f] || 0;
  t(`${f}: ${n} ≤ teto ${ex.teto}`, n <= ex.teto, `subiu — um sorteio novo na tela entra já semeado`);
  t(`${f}: ainda tem o que justificar a exceção`, n > 0, "chegou a zero: tire-o de EXCECOES_DO_ACASO");
  t(`${f}: a exceção diz desde quando, até quando e por quê`, !!(ex.desde && ex.ate && ex.porque));
}

sec("4. a sorte da casa existe e não é o Math.random");
const semente = fs.readFileSync(path.join(RAIZ, "semente.js"), "utf8");
for (const nome of ["dadoDo", "sorteDaCasa", "comSorte", "semearACasa", "sorteDe"])
  t(`semente.js exporta ${nome}`, new RegExp(`export\\s+(?:function|const)\\s+${nome}\\b`).test(semente));
t("semente.js não sorteia pelo Math.random", contarAcaso(semente) === 0);

console.log(`\nsem-random: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
