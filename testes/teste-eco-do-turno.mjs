/* ============================================================
   O ECO, OS SOLTOS E OS BILHETES (Fase 4, trilha B, 29/10/2026) — testes/teste-eco-do-turno.mjs

   src/motor/eco-do-turno.js diz o que o `/api/turno` recebe além de
   { estado, frase } (os bilhetes e o eco) e o que devolve (o eco e os
   soltos), numa tabela (`CAMPOS_DO_SERVIDOR`). Aqui:

   1. a tabela é a das peças: cada campo é lido exatamente pelas peças que
      ela diz (os REFS das três), e nenhuma das três o tem no save;
   2. os soltos têm a forma de `soltosDoTurno()` do App, chave a chave;
   3. as três funções movem os valores sem os mudar, sem mutar a entrada,
      e engolem o lixo;
   4. O CAMPO NOVO DO SAVE É IGNORADO PELA VERSÃO DE ANTES: o `estado.js` e
      o App do commit em que ele ainda não existia leem um save com
      `soltos` igual a um sem, e regravam-no com o campo intacto;
   5. o eco serve: um turno do pedido de verdade devolve-o, e o turno
      seguinte com ele não é o turno seguinte sem ele.
   ============================================================ */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { CAMPOS_DO_SERVIDOR, oEstadoDoServidor, aRespostaDoServidor, oSaveComOsSoltos } from "../src/motor/eco-do-turno.js";
import { REFS_DA_PAUTA } from "../src/motor/pauta-do-turno.js";
import { REFS_DO_PEDIDO, oPedidoDoTurno } from "../src/motor/pedido-do-turno.js";
import { REFS_DO_PRELUDIO } from "../src/motor/preludio-do-turno.js";
import { REFS_DO_DEPOIS } from "../src/motor/depois-do-turno.js";
import { casoDoPedido } from "./pedido-bloco.mjs";
import { rng, hashSemente } from "../src/semente.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

/* A VERSÃO DE ANTES: o commit em que o campo `soltos` do save ainda não
   existia (o desta etapa nasceu depois dele). Fixo de propósito — o App de
   amanhã pode passar a lê-lo, e a prova é sobre o de ontem. O texto de lá
   (o estado.js inteiro e as quatro declarações do App que importam) mora
   em `eco-antes.json`, porque a suíte também corre fora do git
   (mente/so-o-meu.sh): `node testes/teste-eco-do-turno.mjs --gerar` refá-lo. */
const ANTES = "895686b";
const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const FIXO = new URL("./eco-antes.json", import.meta.url);
const req = createRequire(path.join(RAIZ, "package.json"));
const declaracaoDe = (app, nome) => {
  const parser = req("@babel/parser");
  const ast = parser.parse(app, { sourceType: "module", plugins: ["jsx"] });
  let achado = null;
  const anda = (n) => { if (achado || !n || typeof n !== "object") return; if (n.type === "VariableDeclarator" && n.id && n.id.name === nome) { achado = app.slice(n.start, n.end); return; } for (const k of Object.keys(n)) { if (k === "loc" || k === "leadingComments" || k === "trailingComments") continue; const v = n[k]; if (Array.isArray(v)) v.forEach(anda); else if (v && typeof v.type === "string") anda(v); } };
  anda(ast.program);
  return achado || "";
};
if (process.argv.includes("--gerar")) {
  const mostrar = (arq) => execSync(`git show ${ANTES}:${arq}`, { cwd: RAIZ, encoding: "utf8", maxBuffer: 1 << 28 }).split("\r").join("");
  const app = mostrar("src/App.jsx");
  const fixo = { commit: ANTES, estado: mostrar("src/estado.js"), app: Object.fromEntries(["soltosDoTurno", "lerSave", "continuar", "retratoDoJogo"].map((n) => [n, declaracaoDe(app, n)])) };
  fs.writeFileSync(FIXO, JSON.stringify(fixo, null, 1) + "\n");
  console.log("eco-antes.json:", Object.entries(fixo.app).map(([n, x]) => `${n} ${x.length}`).join(", "));
}
const ANTIGO = JSON.parse(fs.readFileSync(FIXO, "utf8"));

/* MOVIDA (29/10, Fase 4, trilha B): a quarta peça, os órgãos do depois
   (motor/depois-do-turno.js), lê e escreve o dia do último trabalho, o
   aviso que espera a cena e a nota — os dois primeiros viajam no eco desde
   que o servidor corre o trabalho daqui. A intenção fica: cada campo é
   lido exatamente pelas peças que a tabela diz, e nenhuma o tem no save.
   Das três da montagem, exatamente; dos órgãos do depois, que crescem um
   a um pela trilha A, a tabela diz `depois` em todo campo que eles
   ESCREVEM (é o que obriga o campo a viajar), e só onde eles o têm — o
   que um órgão novo só lê chega-lhe pelo estado do servidor, que já o
   tem (a tabela ganha `depois` nele quando o órgão entrar). */
const PECAS = { pauta: REFS_DA_PAUTA, pedido: REFS_DO_PEDIDO, preludio: REFS_DO_PRELUDIO, depois: REFS_DO_DEPOIS };
const DA_MONTAGEM = ["pauta", "pedido", "preludio"];
const CAMPOS = Object.entries(CAMPOS_DO_SERVIDOR);
const VIAS = ["eco", "solto", "bilhete"];

sec("1. A tabela é a das peças");
{
  t(`${CAMPOS.length} campos, cada um numa das três vias, com de onde vem, quem o escreve e quem o lê`, CAMPOS.length >= 15 && CAMPOS.every(([, c]) => VIAS.includes(c.via) && c.chave && c.de && c.escreve && c.le.length > 0));
  for (const via of VIAS) t(`a via ${via} tem campos (${CAMPOS.filter(([, c]) => c.via === via).length})`, CAMPOS.some(([, c]) => c.via === via));
  const tortos = CAMPOS.filter(([campo, c]) => J(c.le.filter((p) => DA_MONTAGEM.includes(p)).sort()) !== J(DA_MONTAGEM.filter((p) => PECAS[p][campo]).sort())
    || (c.le.includes("depois") && !REFS_DO_DEPOIS[campo]) || (REFS_DO_DEPOIS[campo] && REFS_DO_DEPOIS[campo].escreve && !c.le.includes("depois")));
  t("cada campo é lido exatamente pelas peças da montagem que a tabela diz, e o que os órgãos do depois escrevem diz `depois`", tortos.length === 0, tortos.map(([c, x]) => `${c}: ${x.le} ≠ ${Object.keys(PECAS).filter((p) => PECAS[p][c])}`).join("; "));
  const salvos = CAMPOS.filter(([campo]) => Object.values(PECAS).some((R) => R[campo] && R[campo].salvo));
  t("nenhum deles o save de hoje guarda (é por isso que viajam)", salvos.length === 0, salvos.map(([c]) => c).join());
  t("o juizDoTurno não viaja (o turno zera-o antes de o escrever): nenhuma peça o lê", !CAMPOS_DO_SERVIDOR.juizDoTurno && !Object.values(PECAS).some((R) => R.juizDoTurno));
  const chaves = CAMPOS.map(([, c]) => `${c.via}:${c.chave}`);
  t("as chaves não se repetem dentro de uma via", new Set(chaves).size === chaves.length);
}

sec("2. Os soltos têm a forma de soltosDoTurno() do App");
{
  const m = ANTIGO.app.soltosDoTurno.match(/soltosDoTurno = \(\) => \(\{([\s\S]*?)\}\)/);
  const pares = m ? [...m[1].matchAll(/(\w+):\s*(\w+)Ref\.current/g)].map((x) => [x[1], x[2]]) : [];
  t("o App de antes tem soltosDoTurno(), com cinco chaves", pares.length === 5, pares.map((p) => p[0]).join());
  const soltos = CAMPOS.filter(([, c]) => c.via === "solto");
  t("as chaves dos soltos são as dele, uma a uma", J(soltos.map(([, c]) => c.chave).sort()) === J(pares.map((p) => p[0]).sort()));
  t("e cada chave lê o ref do campo que a tabela diz", soltos.every(([campo, c]) => pares.some(([k, ref]) => k === c.chave && ref === campo)));
}

sec("3. As funções movem, não mudam");
{
  const gelar = (x) => { if (x && typeof x === "object" && !Object.isFrozen(x)) { Object.freeze(x); for (const v of Object.values(x)) gelar(v); } return x; };
  const save = gelar({ personagem: { nome: "Ilsa" }, dia: 4, soltos: { nota: "[NOTA] A porta rangeu.", sino: "o sino das seis", oficina: [{ tipo: "bancada", nome: "Unguento", ok: true, minutos: 20 }], ultimoPeso: { peso: "grave", dia: 3 }, fatosDoPeso: { morte: 1 }, lixo: 1 } });
  const ent = gelar({ eco: { quemE: { ultimas: { Doran: 3 }, cenas: {} }, fecho: "e agora?", estranho: 9 }, bilhetes: { crimeDoTurno: { alvo: "Doran" }, intencao: "desarmar", outro: 1 } });
  const e = oEstadoDoServidor(save, ent);
  t("os soltos espalham-se nos campos das peças (o sino é sinoDoTurno)", e.nota === "[NOTA] A porta rangeu." && e.sinoDoTurno === "o sino das seis" && e.oficina.length === 1 && e.ultimoPeso.peso === "grave" && e.fatosDoPeso.morte === 1);
  t("o eco e os bilhetes entram pelos campos das peças", e.quemE.ultimas.Doran === 3 && e.fecho === "e agora?" && e.crimeDoTurno.alvo === "Doran" && e.intencao === "desarmar");
  t("o que a tabela não conhece fica de fora, e o campo soltos sai do estado", !("estranho" in e) && !("outro" in e) && !("lixo" in e) && !("soltos" in e) && e.dia === 4 && e.personagem.nome === "Ilsa");
  t("o save e a entrada não mudaram (congelados até ao fundo)", Object.isFrozen(save) && save.soltos.nota === "[NOTA] A porta rangeu.");
  const r = aRespostaDoServidor({ ...e, quemE: { ultimas: { Doran: 4 }, cenas: {} }, nota: "" });
  t("a resposta leva o eco do fim e os soltos com as chaves do save; os bilhetes não voltam", r.eco.quemE.ultimas.Doran === 4 && r.eco.fecho === "e agora?" && r.soltos.nota === "" && r.soltos.sino === "o sino das seis" && !("crimeDoTurno" in r.eco) && !("intencao" in r.soltos));
  const sv2 = oSaveComOsSoltos({ dia: 5, soltos: { velho: 1 } }, { ...r.soltos, lixo: 2 });
  t("o save com os soltos: o campo novo, só com as cinco chaves", J(Object.keys(sv2.soltos).sort()) === J(["fatosDoPeso", "nota", "oficina", "sino", "ultimoPeso"]) && sv2.dia === 5);
  const volta = oEstadoDoServidor(sv2, { eco: r.eco });
  t("a volta: o estado do turno seguinte tem o que o turno de antes deixou", volta.nota === "" && volta.sinoDoTurno === "o sino das seis" && volta.quemE.ultimas.Doran === 4);
  for (const [nome, a, b] of [["nulos", null, null], ["listas", [], []], ["texto", "x", 3]]) {
    let erro = "";
    try { oEstadoDoServidor(a, b); aRespostaDoServidor(a); oSaveComOsSoltos(a, b); } catch (x) { erro = x.message; }
    t(`o lixo (${nome}) não estoura`, !erro, erro);
  }
  t("sem eco nem bilhetes nem soltos, o estado é o save", J(oEstadoDoServidor({ dia: 2, mapa: { a: 1 } }, {})) === J({ dia: 2, mapa: { a: 1 } }));
  t("sem soltos, o save vai como veio", J(oSaveComOsSoltos({ dia: 2 }, null)) === J({ dia: 2 }));
}

sec(`4. O campo novo é ignorado pela versão de antes (${ANTES})`);
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "taverna-eco-"));
  const arq = path.join(dir, "estado.js");
  fs.writeFileSync(arq, ANTIGO.estado);
  const E = await import(pathToFileURL(arq).href);
  t("o estado.js de antes não conhece o campo (nem soltos nem nenhum campo do eco ou dos bilhetes)", !E.CAMPOS.some((c) => c.campo === "soltos" || CAMPOS_DO_SERVIDOR[c.campo]));
  const base = { personagem: { nome: "Ilsa", nivel: 2 }, dia: 7, minuto: 600, mapa: { cidades: [{ nome: "Agulha de Sal" }] }, missoes: [], nomeCampanha: "A Prova" };
  const comSoltos = oSaveComOsSoltos(base, { nota: "[NOTA] x", sino: "", oficina: [], ultimoPeso: { peso: null, dia: 0 }, fatosDoPeso: {} });
  const a = E.estadoDoSave(base), b = E.estadoDoSave(comSoltos);
  t("lê o save com soltos igual ao sem, campo a campo da tabela dele", E.CAMPOS.every((c) => J(a[c.campo]) === J(b[c.campo])));
  t("e o campo novo atravessa a leitura intacto", J(b.soltos) === J(comSoltos.soltos));
  t("e a regravação também (saveDoEstado ∘ estadoDoSave), byte a byte", J(E.saveDoEstado(b).soltos) === J(comSoltos.soltos) && J(E.saveDoEstado(E.estadoDoSave(E.saveDoEstado(b)))) === J(E.saveDoEstado(b)));
  fs.rmSync(dir, { recursive: true, force: true });
  /* o App de antes: o load lê o save por estadoDoSave, e nem o load nem o retrato do save falam em soltos */
  const { lerSave, continuar, retratoDoJogo: retrato } = ANTIGO.app;
  t(`o texto de antes é do commit fixo (${ANTIGO.commit})`, ANTIGO.commit === ANTES);
  t("o load de antes lê o save por estadoDoSave (lerSave)", /estadoDoSave\(sv\)/.test(lerSave));
  const semComentario = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  t("o continuar de antes não lê soltos", continuar.length > 1000 && !/\bsoltos\b/.test(semComentario(continuar)));
  t("e o retrato do save de antes não o escreve (o campo é novo)", retrato.length > 500 && !/\bsoltos\b/.test(semComentario(retrato)));
}

sec("5. O eco serve: o turno seguinte com ele não é o turno seguinte sem ele");
{
  let comEco = 0, devolveu = 0, n = 0;
  for (const i of [0, 7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77]) {
    const k = casoDoPedido(i);
    const est = { ...JSON.parse(JSON.stringify(k.estado)), render: k.render };
    const ent = { frase: k.entrada.conteudo, histBase: k.entrada.histBase, pedidoEsc: k.entrada.pedidoEsc, fioEsc: k.entrada.fioEsc, oficina: k.entrada.oficina, doCompasso: k.entrada.doCompasso, formaDaCena: k.entrada.formaDaCena, daFrente: k.entrada.daFrente, daVirada: k.entrada.daVirada, daTrama: k.entrada.daTrama };
    let r1;
    try { r1 = oPedidoDoTurno(est, { ...ent, sorte: rng(hashSemente("eco-" + i)) }, {}); } catch { continue; }
    n++;
    const resposta = aRespostaDoServidor({ ...est, ...r1.escritas });
    if (Object.keys(resposta.eco).length) devolveu++;
    const save = oSaveComOsSoltos(est, resposta.soltos);
    const seguinte = (eco) => oPedidoDoTurno(oEstadoDoServidor(save, { eco }), { ...ent, frase: "e então?", sorte: rng(hashSemente("eco2-" + i)) }, {}).pedido;
    try { if (J(seguinte(resposta.eco)) !== J(seguinte({}))) comEco++; } catch { /* o caso que estoura estoura nos dois */ }
  }
  t(`o pedido devolve eco em ${devolveu} de ${n} turnos`, n >= 10 && devolveu === n);
  t(`e o turno seguinte muda com ele em ${comEco} de ${n} (o QUEM É, o fecho, os nomes à mão)`, comEco > 0);
}

console.log(`\n${ok} ok, ${mal} mal`);
process.exit(mal ? 1 : 0);
