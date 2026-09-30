/* teste-mm8f-fora-de-cena.mjs (Fase MM · MM8f) — o elenco age fora de cena

   A cada dia, de 0 a 2 pessoas do elenco dão um passo pela agenda da
   índole: um laço que muda, ou uma situação. Guarda-se no campo `elenco`
   do save (`feitos`, até 12; `lacos`, até 40). Ao Narrador chega UMA linha
   da pauta, só quando toca a cena; de longe, um boato. Ninguém muda de
   cidade nesta etapa — a pergunta está no relato. */
import {
  FORA_DE_CENA, AGENDA, LACOS_DO_ELENCO, agirForaDeCena, foraDeCenaParaPauta, boatoDoForaDeCena,
  garantirElencoDoSave, elencoDoMundo, lacosDe,
} from "../src/elenco.js";
import { PROPOSITOS, indoleDe } from "../src/indole.js";
import { criarNPC, firmarLaco } from "../src/npcs.js";
import { SECOES, porNaPauta, textoDaPauta, TETO_DA_PAUTA } from "../src/pauta.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { guildasDoMundo } from "../src/guildas.js";
import { matar, garantirBase } from "../src/mundo-base.js";
import { registoSimulado } from "./registo-simulado.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const G = "Fantasia medieval";
const SEM = "Sonda da Gente|Fantasia medieval";
const MAPA = gerarGeografia(SEM, "sobremundo");
const CTX = { genero: G, espinha: estenderEspinha({ semente: SEM, mapa: MAPA, genero: G, cidadeInicial: MAPA.cidades[0].nome }), guildas: guildasDoMundo(SEM, MAPA, G) };
const EL = elencoDoMundo(SEM, MAPA, CTX);
const dias = (n, { estado = null, npcs = {}, grupo = [], ctx = CTX } = {}) => {
  let e = estado; const todos = [];
  for (let dia = 1; dia <= n; dia++) { const r = agirForaDeCena(SEM, MAPA, ctx, e, { dia, npcs, grupo }); e = r.estado; todos.push(r.feitos); }
  return { e, porDia: todos };
};

/* ============================================================ */
sec("1. as tabelas");
{
  t("de 0 a 2 passos por dia, com peso", FORA_DE_CENA.passosPorDia.map((p) => p.n).join() === "0,1,2" && FORA_DE_CENA.passosPorDia.every((p) => p.peso > 0));
  t("12 feitos no save, 40 laços mudados", FORA_DE_CENA.feitosNoSave === 12 && FORA_DE_CENA.lacosNoSave === 40);
  const ids = new Set(PROPOSITOS.map((p) => p.id));
  const todos = Object.values(AGENDA).flatMap((g) => g.propositos);
  t("todo propósito da agenda existe na índole", todos.every((p) => ids.has(p)));
  t("nenhum propósito está em duas agendas", new Set(todos).size === todos.length);
  t("todo passo de laço é um laço do elenco", Object.values(AGENDA).every((g) => g.passos.every((p) => !p.laco || LACOS_DO_ELENCO.some((l) => l.tipo === p.laco))));
  t("toda agenda tem passo sem laço (a saída quando não há com quem)", Object.values(AGENDA).every((g) => g.passos.some((p) => !p.laco)));
  t("nenhum passo diz o nome de um mecanismo", Object.values(AGENDA).every((g) => g.passos.every((p) => !/elenco|sistema|agenda|propósito|proposito|promo/i.test(p.o))));
  t("nenhum passo muda alguém de cidade (a pergunta ficou no relato)", Object.values(AGENDA).every((g) => g.passos.every((p) => !/mudou-se|mudou para|foi morar/i.test(p.o))));
  t("a secção da pauta: prioridade 6, depois do vilão", (() => { const s = SECOES.find((x) => x.id === "foraDeCena"); const i = (id) => SECOES.findIndex((x) => x.id === id); return s && s.prio === 6 && i("foraDeCena") > i("vilao"); })());
}

/* ============================================================ */
sec("2. determinismo, e 0 a 2 por dia");
{
  const a = dias(200), b = dias(200);
  t("os mesmos 200 dias duas vezes", JSON.stringify(a) === JSON.stringify(b));
  const contas = a.porDia.map((f) => f.length);
  const hist = [0, 1, 2].map((n) => contas.filter((x) => x === n).length);
  console.log(`      200 dias: ${hist[0]} sem passo, ${hist[1]} com um, ${hist[2]} com dois`);
  t("nunca mais de 2 por dia", contas.every((n) => n >= 0 && n <= 2));
  t("e há dias de cada", hist.every((n) => n > 0));
  t(`o save guarda os ${FORA_DE_CENA.feitosNoSave} mais recentes`, a.e.feitos.length === FORA_DE_CENA.feitosNoSave && a.e.feitos[a.e.feitos.length - 1].dia >= 190);
  t(`e no máximo ${FORA_DE_CENA.lacosNoSave} laços mudados`, Object.keys(a.e.lacos).length <= FORA_DE_CENA.lacosNoSave);
  t("todo feito tem quem, dia, cidade e o texto", a.e.feitos.every((f) => f.quem && f.dia >= 1 && typeof f.cidade === "string" && f.o.includes(f.quem)));
  const tresDias = dias(4).porDia.slice(1);
  console.log(`      um exemplo: ${tresDias.map((f, i) => `dia ${i + 2}: ${f.map((x) => x.o).join(" · ") || "(nada)"}`).join(" | ")}`);
}

/* ============================================================ */
sec("3. quem nunca age");
{
  const chefes = new Set(EL.pessoas.filter((p) => p.fonte === "chefe").map((p) => p.nome));
  const doGrupo = EL.pessoas.find((p) => p.fonte === "doArco");
  const mortoBase = EL.pessoas.find((p) => p.fonte === "recorrente") || EL.pessoas.find((p) => p.fonte === "mestre");
  const mortoReg = EL.pessoas.filter((p) => p.fonte === "doArco")[1];
  const npcs = { [mortoReg.nome]: criarNPC(mortoReg.nome, { status: "morto" }) };
  const base = matar(garantirBase(null), mortoBase.nome);
  const { e } = dias(200, { npcs, grupo: [{ nome: doGrupo.nome }], ctx: { ...CTX, base } });
  let feitosTodos = [];
  { let est = null; for (let dia = 1; dia <= 200; dia++) { const r = agirForaDeCena(SEM, MAPA, { ...CTX, base }, est, { dia, npcs, grupo: [{ nome: doGrupo.nome }] }); est = r.estado; feitosTodos = feitosTodos.concat(r.feitos); } }
  const quem = new Set(feitosTodos.map((f) => f.quem));
  t(`em 200 dias agiram ${quem.size} pessoas`, quem.size >= 8);
  t("nenhum chefe age", ![...quem].some((n) => chefes.has(n)));
  t("quem anda no grupo não age sozinho", !quem.has(doGrupo.nome));
  t("quem morreu (na base) não age", !quem.has(mortoBase.nome));
  t("quem morreu (no registo) não age", !quem.has(mortoReg.nome));
  const estreias = new Map(EL.pessoas.map((p) => [p.nome, p.estreia]));
  t("ninguém age antes de estrear", feitosTodos.every((f) => (estreias.get(f.quem) || 0) <= f.dia));
  t("ninguém muda de cidade: o elenco lê as mesmas cidades depois de 200 dias", JSON.stringify(elencoDoMundo(SEM, MAPA, { ...CTX, estado: e }).pessoas.map((p) => [p.nome, p.cidade])) === JSON.stringify(EL.pessoas.map((p) => [p.nome, p.cidade])));
}

/* ============================================================ */
sec("4. o laço que muda, muda no elenco");
{
  const { e } = dias(60);
  const el = elencoDoMundo(SEM, MAPA, { ...CTX, estado: e });
  const pares = Object.entries(e.lacos);
  let bate = 0, familia = 0;
  for (const [k, tipo] of pares) {
    const [a, b] = k.split("|");
    const l = lacosDe(el, a).find((x) => x.com === b);
    if (l && l.tipo === tipo) bate++;
    if (l && l.tipo === "familia") familia++;
  }
  console.log(`      60 dias: ${pares.length} laços mudados`);
  t("todo laço mudado aparece no elenco com o tipo novo (ou a família ficou)", pares.length > 0 && bate + familia === pares.length);
  const dir = pares.find(([, tipo]) => !LACOS_DO_ELENCO.find((l) => l.tipo === tipo).simetrico);
  if (dir) {
    const [a, b] = dir[0].split("|");
    t("o laço com sentido guarda o sentido do feito ({a} deve a {b})", lacosDe(el, a).some((x) => x.com === b && x.sentido === "meu") && lacosDe(el, b).some((x) => x.com === a && x.sentido === "dele"));
  }
  t("cada par continua com um laço só", (() => { const vistos = new Set(); for (const l of el.lacos) { const k = [l.a, l.b].sort().join("|"); if (vistos.has(k)) return false; vistos.add(k); } return true; })());
}

/* ============================================================ */
sec("5. a linha da pauta, só quando toca a cena");
{
  const { e } = dias(30);
  const f = e.feitos[e.feitos.length - 1];
  const hoje = f.dia;
  const naCidade = foraDeCenaParaPauta(e, { dia: hoje, cidade: f.cidade });
  t("na cidade de quem agiu, a linha vem", f.cidade ? naCidade.foraDeCena.length === 1 && naCidade.foraDeCena[0].endsWith(f.o) : true, JSON.stringify(naCidade));
  t("noutra cidade, sem ninguém da cena, não vem", foraDeCenaParaPauta(e, { dia: hoje, cidade: "Lugar Nenhum" }).foraDeCena.length === 0);
  t("com quem agiu na cena, vem", foraDeCenaParaPauta(e, { dia: hoje, cidade: "Lugar Nenhum", emCena: [f.quem] }).foraDeCena.length === 1);
  const comLaco = { [f.quem]: firmarLaco(criarNPC(f.quem, {}), "amizade", 1) };
  t("com laço com o herói, vem de qualquer lado", foraDeCenaParaPauta(e, { dia: hoje, cidade: "Lugar Nenhum", npcs: comLaco }).foraDeCena.length === 1);
  t(`passados ${FORA_DE_CENA.naPauta.dias} dias, deixa de vir`, foraDeCenaParaPauta(e, { dia: hoje + FORA_DE_CENA.naPauta.dias + 1, cidade: f.cidade }).foraDeCena.length === 0);
  t("uma linha por turno, no máximo", foraDeCenaParaPauta(e, { dia: hoje, cidade: f.cidade, emCena: e.feitos.map((x) => x.quem) }).foraDeCena.length <= FORA_DE_CENA.naPauta.linhas);
  t("a linha diz quando (hoje, ontem, há N dias)", /^(hoje|ontem|há \d+ dias): /.test(naCidade.foraDeCena[0] || "hoje: x"));
  /* o teto da pauta: a linha é uma secção dinâmica de prioridade 6 */
  const linha = (naCidade.foraDeCena[0] || `hoje: ${f.o}`);
  let cheia = {};
  for (const s of SECOES) cheia = porNaPauta(cheia, s.id, `${s.id} linha ` + "x".repeat(110));
  const com = textoDaPauta(porNaPauta(cheia, "foraDeCena", linha));
  t("a pauta cheia continua no teto", com.length <= TETO_DA_PAUTA);
  t("e a linha nunca passa de 180 caracteres", dias(200).e.feitos.every((x) => `há 2 dias: ${x.o}`.length <= 180));
}

/* ============================================================ */
sec("6. o boato de longe");
{
  let e = null, boatos = 0, total = 0;
  for (let dia = 1; dia <= 120; dia++) {
    const r = agirForaDeCena(SEM, MAPA, CTX, e, { dia, npcs: {} }); e = r.estado;
    const b = boatoDoForaDeCena(SEM, MAPA, CTX, e, { dia, cidade: "Lugar Nenhum" });
    if (b) { boatos++; t.b = b; }
    total += r.feitos.length;
  }
  console.log(`      120 dias: ${total} passos, ${boatos} viraram boato de longe`);
  t("há boatos, e menos boatos do que passos", boatos > 0 && boatos < total);
  t("o boato fala como boato", /^dizem que /.test(t.b || ""));
  const hoje = e.feitos[e.feitos.length - 1];
  t("o que toca a cena não vira boato (vai pela pauta)", boatoDoForaDeCena(SEM, MAPA, CTX, e, { dia: hoje.dia, cidade: hoje.cidade, emCena: e.feitos.filter((x) => x.dia === hoje.dia).map((x) => x.quem) }) === "");
}

/* ============================================================ */
sec("7. o save");
{
  const { e } = dias(40);
  const volta = garantirElencoDoSave(JSON.parse(JSON.stringify(e)));
  t("o garantir não apaga os feitos nem os laços de um save que já os tem", JSON.stringify(volta.feitos) === JSON.stringify(e.feitos) && JSON.stringify(volta.lacos) === JSON.stringify(e.lacos));
  const v9329 = { versao: 1, promovidos: {}, saidos: {}, vistos: { Ana: [1, 2] } };
  const g = garantirElencoDoSave(v9329);
  t("um save da v9.329, sem feitos, vem com feitos e laços vazios", Array.isArray(g.feitos) && g.feitos.length === 0 && JSON.stringify(g.lacos) === "{}" && g.vistos.Ana.length === 2);
  t("e joga igual: o mesmo elenco", JSON.stringify(elencoDoMundo(SEM, MAPA, { ...CTX, estado: v9329 })) === JSON.stringify(elencoDoMundo(SEM, MAPA, { ...CTX, estado: garantirElencoDoSave(null) })));
  const sujo = garantirElencoDoSave({ feitos: [null, 3, { dia: "x" }, { dia: 2, quem: "", o: "a" }, { dia: 2, quem: "Ana", o: "Ana riu" }], lacos: { "a|b": "inventado", "a": "amizade", "Ana|Bia": "amizade" } });
  t("feitos e laços com lixo são limpos", sujo.feitos.length === 1 && JSON.stringify(sujo.lacos) === '{"Ana|Bia":"amizade"}');
}

/* ============================================================ */
sec("8. o Códex igual");
{
  const r = registoSimulado("medio");
  const antes = JSON.stringify(r.npcs), n = Object.keys(r.npcs).length;
  let e = null;
  for (let dia = 1; dia <= 30; dia++) e = agirForaDeCena("mm8|mundo|0", r.mapa, { genero: G }, e, { dia, npcs: r.npcs }).estado;
  foraDeCenaParaPauta(e, { dia: 30, cidade: r.cidade.nome, npcs: r.npcs });
  t(`o registo não muda e o Códex conta o mesmo (${n})`, JSON.stringify(r.npcs) === antes && Object.keys(r.npcs).length === n);
}

/* ============================================================ */
sec("9. lixo");
{
  let erro = "";
  for (const x of [null, undefined, "x", 7, {}]) {
    try {
      agirForaDeCena(x, x, x, x, x); agirForaDeCena(SEM, MAPA, CTX, x, { dia: "q" });
      foraDeCenaParaPauta(x, x); foraDeCenaParaPauta(x, { dia: 3, emCena: "x", npcs: 5 });
      boatoDoForaDeCena(x, x, x, x, x);
    } catch (e) { erro = `${JSON.stringify(x)}: ${e.message}`; }
  }
  t("nenhum lixo derruba", !erro, erro);
  const congela = (o) => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) congela(v); } return o; };
  const est = congela(JSON.parse(JSON.stringify(dias(10).e)));
  let mudou = "";
  try { agirForaDeCena(SEM, MAPA, CTX, est, { dia: 11 }); } catch (e) { mudou = e.message; }
  t("o estado recebido não é tocado", !mudou, mudou);
}

/* A FIAÇÃO — o elenco age ao virar cada dia (logo depois da promoção), o
   que é de longe corre pelo canal de rumor que já existe, e o que toca a
   cena entra na pauta (ENTRETANTO). Por texto, fim de linha normalizado. */
{
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const i = app.indexOf("try { const r = promoverNoDia(");
  const linhaDoDia = i >= 0 ? app.slice(i, app.indexOf("\n", i)) : "";
  t("o elenco age ao virar o dia, depois da promoção", linhaDoDia.includes("agirForaDeCena(sementeMundo()") && linhaDoDia.indexOf("agirForaDeCena") > linhaDoDia.indexOf("promoverNoDia"));
  t("o boato de longe vai pelo canal de rumor", linhaDoDia.includes("boatoDoForaDeCena(") && linhaDoDia.includes("Corre a boca miúda") && linhaDoDia.includes("[RUMOR]"));
  t("e em try, sem poder custar o dia", linhaDoDia.includes("calou(\"agirForaDeCena\", e)"));
  const j = app.indexOf("porNaPauta(p, \"foraDeCena\", foraDeCenaParaPauta(");
  t("o que toca a cena entra na pauta, na secção ENTRETANTO", j >= 0);
}

console.log(`\nMM8f · o elenco age fora de cena: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
