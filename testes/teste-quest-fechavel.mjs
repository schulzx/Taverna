/* teste-quest-fechavel.mjs (17/11/2026, os dois becos da quest)

   A prova jogada de 17/11 (IA real, v9.657) achou dois becos sem saída
   DEPOIS do 1.º passo, que a suíte da abertura alcançável (só o 1.º passo, e
   o «fechável» só da quest de abertura) não via:

     · o Arquipélago, «O Pão Que Sai de Noite», passo 4 «Levar Ylva de volta
       a Wystan»: Ylva não aparecia em «EM CENA», o botão «Levar Ylva junto»
       não existia, e «Convido Ylva a vir comigo, de volta a casa de Wystan»
       registou «⚑ Wystan recusou»;
     · o Braço Estelar, «O Salvo-Conduto», passo 3 «Passar Anel de Carga»: o
       Anel de Carga é um sítio de OUTRA cidade (o papel `passo` cai entre a
       origem e o destino), e o rumo «Ir até Corredor Comercial» (o desvio,
       na mesma cidade do passo) repetia a cena sem mover o herói.

   A régua, para TODAS as quests que o esqueleto abre (não só a de abertura),
   em 520 campanhas pela chegada nova e pelos quatro moldes: CADA PASSO TEM UM
   CAMINHO DO SISTEMA até ao facto que o fecha —
     · o lugar existe numa cidade que o mapa conhece (a cidade de cada papel
       da quest aberta entra no mapa: aplicarAsQuests, App.jsx);
     · a pessoa frente a frente (A_PESSOA_DO_PASSO.daQuest) tem casa numa
       cidade do mapa — é por ela que entra em cena (a-pessoa-do-passo.js);
     · `acompanha`: a pessoa entra em cena na casa dela E a balança do convite
       aceita-a (o passo pede-a);
     · o servo do fio (o tenente, a fera) tem posto: o covil do confronto
       (oClimaxDaQuest), num lugar de uma cidade do mapa;
     · `tem`: o item da quest na bolsa — só a IA o põe lá (SEM_CAMINHO):
       contado e listado, não exigido.
   E o rumo do pé da página nunca manda «Ir até» um sítio de outra cidade
   (o botão que mente): ali é «Partir para <cidade>».

     §1 o rumo (oRumoDaBusca): partir quando o sítio é de outra cidade; ir
        até à casa de quem o passo pede ao lado; levá-la só quando está aqui;
        o covil do confronto antes do desvio; quem já anda com o herói não;
     §2 o convite pela frase: o convidado é quem o verbo chama, não o último
        nome da frase; nomeado e ausente, não convida ninguém;
     §3 a pessoa de `acompanha` entra em cena na casa dela;
     §4 a medida: passos sem caminho do sistema, por quest e por molde;
     §5 a fiação do App (o convite lê quem está em cena; o rumo lê o grupo). */
import { sortearMesa, mundoDaMesa, nomeDaCampanhaDaMesa, escolhasDaMesa } from "../src/criacao-da-mesa.js";
import { montarFicha } from "../src/ficha-da-criacao.js";
import { aFichaAberta, comACidadePisada } from "../src/abrir-o-save.js";
import { lexicoDoMundo } from "../src/lexico-do-mundo.js";
import { moldePorId } from "../src/moldes.js";
import { mapaDaCriacao, mapaDaCampanhaNova, espinhaNaRegiao } from "../src/regiao.js";
import { gerarGeografia, descobrirCidade } from "../src/geografia.js";
import { readFileSync } from "node:fs";
import { estenderEspinha } from "../src/saga.js";
import { guildasDoMundo } from "../src/guildas.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { garantirBase } from "../src/mundo-base.js";
import { garantirElencoDoSave } from "../src/elenco.js";
import { esqueletoDaCampanha } from "../src/esqueleto.js";
import { questPorId, oClimaxDaQuest, BIBLIOTECA_DE_QUESTS } from "../src/biblioteca-de-quests.js";
import { CONDICOES } from "../src/condicoes-da-quest.js";
import { indoleDe, pesarConvite, conviteNaFrase } from "../src/indole.js";
import { oRumoDaBusca } from "../src/propostas-da-abertura.js";
import { A_PESSOA_DO_PASSO } from "../src/motor/a-pessoa-do-passo.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const J = (x) => JSON.stringify(x);

/* a campanha como o App a cria — o mesmo caminho de teste-abertura-alcancavel */
function campanha(i) {
  const s = `mesa|${i.toString(36)}`;
  const mesa = sortearMesa(s);
  const m = mundoDaMesa(mesa);
  const sm = `${nomeDaCampanhaDaMesa(mesa)}|${m.genero}`;
  let lex = null;
  try { const l = lexicoDoMundo(m, { semente: sm }); if (l && l.gerado) lex = l; } catch { lex = null; }
  const genero = m.genero, molde = moldePorId(m.molde);
  const pers = aFichaAberta(montarFicha(escolhasDaMesa(mesa)));
  let geo = null;
  try { geo = mapaDaCriacao({ semente: sm, molde, genero, lex, estrutura: m.estrutura, modo: "historia" }); } catch { geo = null; }
  if (!geo || !Array.isArray(geo.cidades) || !geo.cidades.length) geo = gerarGeografia(sm, molde, lex);
  const cidade = geo.cidades[0].nome;
  const mapa = comACidadePisada(mapaDaCampanhaNova(geo), cidade);
  const guildas = guildasDoMundo(sm, mapa, genero, lex);
  let espinha = estenderEspinha({ semente: sm, mapa, genero, molde, lex, estrutura: m.estrutura, cidadeInicial: cidade, antecedente: pers.antecedente || "", dia: 1 });
  if (mapa.regiao) { try { espinha = espinhaNaRegiao(mapa, espinha, { semente: sm, genero, molde, lex }); } catch { /* a espinha de sempre */ } }
  const nucleo = nucleoDaCampanha(sm, mapa, { genero, molde, lex, espinha, guildas, base: garantirBase(null), estado: garantirElencoDoSave(null), npcs: {}, grupo: pers.grupo || [], antecedente: pers.antecedente || "", reviravolta: null });
  const esq = esqueletoDaCampanha({ semente: sm, mapa, espinha, genero, molde, lex, antecedente: pers.antecedente || "", cidadeInicial: cidade, nucleo });
  const quests = [];
  for (const a of (esq && esq.atos) || []) if (a && a.quest) quests.push({ quest: a.quest, papeis: a.papeis || {}, vazios: a.vazios || [], cidade: a.cidade });
  for (const c of (esq && esq.coracao) || []) if (c && c.quest) quests.push({ quest: c.quest, papeis: c.papeis || {}, vazios: c.vazios || [], cidade: "" });
  return { s, sm, molde: m.molde, mapa, cidade, quests };
}

/* ============================================================
   O MODELO DO CAMINHO DO SISTEMA (§4), por passo:
   · as etapas andam por ordem; o herói fica na cidade da última folha
     cumprida (o rumo é medido de lá);
   · a cidade de cada papel da quest aberta está no mapa (o laço de
     aplicarAsQuests: descobrirCidade sobre cada papel com cidade);
   · a etapa de confronto ganha o `exige` do clímax (encontrar o servo no
     covil) — é o que o jogo pede de facto (etapasDe);
   · as folhas, pela regra do cabeçalho; `nenhum` (sair) pede outra cidade
     conhecida quando o sítio é uma cidade; `algum` vale pelo melhor ramo.
   ============================================================ */
const SEM_CAMINHO = new Set(["tem"]);
const SEMPRE = new Set(["dia", "camada", "etapa", "sabe_nome", "relogio", "situacao", "relacao"]);
const papelDe = (args) => { const a = (args || []).find((x) => typeof x === "string" && /^(papel|lugar|item|pessoa):/.test(x)); return a ? a.slice(a.indexOf(":") + 1) : null; };
const COMB = new Set(["todos", "algum", "nenhum", "pelo_menos"]);
function folhas(c, out = []) {
  if (!Array.isArray(c)) return out;
  const [op, ...r] = c;
  if (op === "pelo_menos") { r.slice(1).forEach((x) => folhas(x, out)); return out; }
  if (COMB.has(op)) { r.forEach((x) => folhas(x, out)); return out; }
  out.push({ pred: op, args: r });
  return out;
}

function osPassos(c, q) {
  const F = questPorId(q.quest);
  const R = q.papeis;
  const clim = oClimaxDaQuest(F);
  let m = c.mapa;
  for (const p of Object.values(R)) if (p && p.cidade) { const d = descobrirCidade(m, p.cidade); if (d.nova) m = d.mapa; }
  const noMapa = new Set((m.cidades || []).filter((x) => x && x.descoberta !== false).map((x) => norm(x.nome)));
  let aqui = norm(q.cidade || c.cidade);
  const out = [];
  for (const et of F.etapas) {
    const C = clim[et.id];
    const cond = C && C.exige && C.exige.length ? ["todos", ...C.exige, et.conclui] : et.conclui;
    const folha = (pred, args) => {
      if (SEMPRE.has(pred)) return { ok: true, cids: [] };
      if (pred === "escolheu") {
        const e = F.escolhas && F.escolhas[args[0]];
        return e && e.opcoes && e.opcoes[args[1]] ? { ok: true, cids: [] } : { ok: false, porque: `a escolha ${args[0]}/${args[1]} não existe` };
      }
      if (SEM_CAMINHO.has(pred)) return { ok: false, porque: pred, tem: true };
      const nome = papelDe(args);
      const decl = nome && F.papeis[nome];
      if (!decl) return { ok: false, porque: `${pred} sem papel` };
      if (decl.de === "grupo") return { ok: true, cids: [] };
      const P = R[nome];
      /* a fraqueza de outra família fica vazia de propósito (esqueleto.js): não é ramo */
      if (!P && (q.vazios || []).includes(nome)) return { ok: false, vazio: true, porque: `o papel ${nome} é de outra família` };
      if (!P || (!P.nome && !P.cidade)) return { ok: false, porque: `o papel ${nome} ficou vazio` };
      const tipo = CONDICOES[pred] && CONDICOES[pred].args[0] && CONDICOES[pred].args[0].tipo;
      if (tipo === "lugar") {
        if (!P.cidade || !noMapa.has(norm(P.cidade))) return { ok: false, porque: `${pred} ${nome}: a cidade fora do mapa` };
        return { ok: true, cids: [P.cidade] };
      }
      if (tipo === "pessoa" && decl.de === "fio") {
        if (!C) return { ok: true, cids: [] };                      // a mão que aparece por cena própria (o rosto)
        const cv = C.covil && R[C.covil];
        if (!cv || !cv.cidade || !noMapa.has(norm(cv.cidade))) return { ok: false, porque: `${pred} ${nome}: o servo sem posto` };
        return { ok: true, cids: [cv.cidade] };
      }
      if (tipo === "pessoa") {
        const frente = A_PESSOA_DO_PASSO.daQuest.includes(pred) || !["acompanha"].includes(pred);
        if (!P.cidade || !P.local) return { ok: false, porque: `${pred} ${nome}: a pessoa sem casa` };
        if (!noMapa.has(norm(P.cidade))) return { ok: false, porque: `${pred} ${nome}: a cidade fora do mapa` };
        if (!frente) return { ok: false, porque: `acompanha ${nome}: não entra em cena` };
        if (pred === "acompanha") {
          const passos = [{ candidatos: { pessoa: [{ nome: P.nome, predicado: "acompanha" }] } }];
          const v = pesarConvite(indoleDe(c.sm, { nome: P.nome }), { convivio: { dias: 1 }, fama: 0, nome: P.nome, passos });
          if (v.resposta !== "aceita") return { ok: false, porque: `acompanha ${nome}: o convite ${v.resposta}` };
        }
        return { ok: true, cids: [P.cidade] };
      }
      return { ok: true, cids: [] };
    };
    const ev = (cnd) => {
      const [op, ...r] = cnd;
      if (op === "todos") { const xs = r.map(ev); return xs.find((x) => !x.ok) || { ok: true, cids: xs.flatMap((x) => x.cids) }; }
      if (op === "algum") { const xs = r.map(ev).filter((x) => !x.vazio); return xs.find((x) => x.ok) || xs.find((x) => x.tem) || xs[0] || { ok: false, porque: "nenhum ramo" }; }
      if (op === "pelo_menos") { const xs = r.slice(1).map(ev); const bons = xs.filter((x) => x.ok); return bons.length >= r[0] ? { ok: true, cids: bons.flatMap((x) => x.cids) } : xs.find((x) => !x.ok); }
      if (op === "nenhum") {
        const P = R[papelDe(folhas(r[0]).flatMap((f) => f.args))] || {};
        const eCidade = !P.nome || norm(P.nome) === norm(P.cidade);
        if (!eCidade) return { ok: true, cids: [] };
        return [...noMapa].some((k) => k !== aqui) ? { ok: true, cids: [] } : { ok: false, porque: "sair da cidade sem outra conhecida" };
      }
      return folha(op, r);
    };
    const x = ev(cond);
    /* o rumo, de onde o herói está: o sítio do passo noutra cidade nunca é «Ir até» */
    const lugares = folhas(cond).filter((f) => CONDICOES[f.pred] && CONDICOES[f.pred].args[0] && CONDICOES[f.pred].args[0].tipo === "lugar")
      .map((f) => R[papelDe(f.args)]).filter((p) => p && p.nome && p.cidade);
    let mente = "";
    if (lugares.length) {
      const r = oRumoDaBusca({ passos: [{ lugares: lugares.map((l) => ({ nome: l.nome, cidade: l.cidade })) }], cidade: aqui === norm(c.cidade) ? c.cidade : (Object.values(R).find((p) => p && norm(p.cidade) === aqui) || {}).cidade || aqui });
      const alvo = r && lugares.find((l) => r.verbo === `Ir até ${l.nome}`);
      if (alvo && norm(alvo.cidade) !== aqui && norm(alvo.nome) !== norm(alvo.cidade)) mente = `«${r.verbo}» com o herói noutra cidade`;
    }
    out.push({ etapa: et.id, ok: x.ok, porque: x.ok ? "" : x.porque, tem: !!x.tem, mente });
    if (x.ok) for (const cid of x.cids) aqui = norm(cid);
  }
  return out;
}

/* ============================================================ */
sec("§1 o rumo: partir, ir até, levar — e nunca um botão que mente");
{
  const lev = [{ lugares: [], candidatos: { pessoa: [{ nome: "Ylva", predicado: "acompanha", onde: "Roda dos Punhos", cidade: "Ilha Baixa" }] } }];
  const r1 = oRumoDaBusca({ passos: lev, aqui: "O Cais Velho", cidade: "Ilha Baixa" });
  t("ela está noutro sítio da cidade: «Ir até Roda dos Punhos» (o botão de levá-la viria antes dela)", r1 && r1.verbo === "Ir até Roda dos Punhos" && r1.frase === "Vou até Roda dos Punhos.", J(r1));
  const r2 = oRumoDaBusca({ passos: lev, aqui: "Roda dos Punhos", cidade: "Ilha Baixa" });
  t("com o herói lá: «Levar Ylva junto», com a frase do convite", r2 && r2.verbo === "Levar Ylva junto" && r2.frase === "Ylva, vem comigo.", J(r2));
  const r3 = oRumoDaBusca({ passos: lev, aqui: "A Lota", cidade: "Ponta Norte" });
  t("noutra cidade: «Partir para Ilha Baixa», a frase que o mapa entende", r3 && r3.verbo === "Partir para Ilha Baixa" && r3.frase === "Parto para Ilha Baixa.", J(r3));
  const r4 = oRumoDaBusca({ passos: lev, aqui: "O Cais Velho", cidade: "Ilha Baixa", grupo: [{ nome: "Ylva" }] });
  t("quem já anda com o herói não é para levar (nem para ir buscar)", !r4 || !/Ylva|Roda dos Punhos/.test(r4.verbo), J(r4));
  const sc = [{ lugares: [{ nome: "Corredor Comercial", cidade: "Ceres Profundo" }], confronto: { covil: { nome: "Anel de Carga", cidade: "Ceres Profundo" } } }];
  const r5 = oRumoDaBusca({ passos: sc, aqui: "Doca 7", cidade: "Vega Zênite" });
  t("o Salvo-Conduto: o passo é noutra cidade — «Partir para Ceres Profundo», não «Ir até Corredor Comercial»", r5 && r5.verbo === "Partir para Ceres Profundo", J(r5));
  const r6 = oRumoDaBusca({ passos: sc, aqui: "", cidade: "Ceres Profundo" });
  t("na cidade do passo: o covil do confronto (quem guarda o passo) antes do desvio", r6 && r6.verbo === "Ir até Anel de Carga", J(r6));
  t("no covil, nada (o encontro é do cartão)", oRumoDaBusca({ passos: sc, aqui: "Anel de Carga", cidade: "Ceres Profundo" }) === null);
  const conv = [{ candidatos: { pessoa: [{ nome: "Wystan", predicado: "conversou", onde: "A Padaria", cidade: "Ilha Baixa" }] } }];
  t("a pessoa a ouvir noutro sítio: «Ir até A Padaria»", (oRumoDaBusca({ passos: conv, aqui: "Roda dos Punhos", cidade: "Ilha Baixa" }) || {}).verbo === "Ir até A Padaria");
  t("…e com o herói lá, nada (ela está em cena)", oRumoDaBusca({ passos: conv, aqui: "A Padaria", cidade: "Ilha Baixa" }) === null);
  t("o sítio sem cidade fica como era («Ir até»)", (oRumoDaBusca({ passos: [{ lugares: [{ nome: "Roda dos Punhos" }] }], cidade: "X" }) || {}).verbo === "Ir até Roda dos Punhos");
}

sec("§2 o convite pela frase: quem o verbo chama");
{
  const so = [{ nome: "Wystan" }];
  t("«Convido Ylva a vir comigo, de volta a casa de Wystan» com só o Wystan aqui: ninguém (antes: «Wystan recusou»)", conviteNaFrase("Convido Ylva a vir comigo, de volta a casa de Wystan", { presentes: so, grupo: [] }) === null);
  const os2 = [{ nome: "Wystan" }, { nome: "Ylva" }];
  t("…e com a Ylva em cena: a Ylva", (conviteNaFrase("Convido Ylva a vir comigo, de volta a casa de Wystan", { presentes: os2, grupo: [] }) || {}).nome === "Ylva");
  t("«Convido Ylva a vir comigo.» com só o Wystan aqui: ninguém (não o único da cena)", conviteNaFrase("Convido Ylva a vir comigo.", { presentes: so, grupo: [] }) === null);
  t("«Ylva, vem comigo.» (o botão): a Ylva", (conviteNaFrase("Ylva, vem comigo.", { presentes: os2, grupo: [] }) || {}).nome === "Ylva");
  t("«Vem comigo, Ylva.» (o vocativo depois): a Ylva", (conviteNaFrase("Vem comigo, Ylva.", { presentes: os2, grupo: [] }) || {}).nome === "Ylva");
  t("sem nome e uma pessoa só: ela, como antes", (conviteNaFrase("Queres vir comigo?", { presentes: so, grupo: [] }) || {}).nome === "Wystan");
  t("sem nome e duas: ninguém, como antes", conviteNaFrase("Queres vir comigo?", { presentes: os2, grupo: [] }) === null);
}

sec("§3 a pessoa de `acompanha` entra em cena na casa dela");
{
  t("acompanhar é frente a frente (A_PESSOA_DO_PASSO.daQuest)", A_PESSOA_DO_PASSO.daQuest.includes("acompanha"));
  const P = questPorId("o_pao_que_sai_de_noite");
  const manha = P.etapas.find((e) => e.id === "manha");
  t("«Levar {crianca} de volta a {mae}» pede a criança ao lado (o texto diz levar, e o facto agora também)", J(manha.conclui).includes('["acompanha","papel:crianca"]'), J(manha.conclui));
}

/* ============================================================ */
const N = 520;
const mundos = [];
for (let i = 0; i < N; i++) { try { mundos.push(campanha(i)); } catch (e) { mundos.push({ s: `mesa|${i.toString(36)}`, erro: String(e && e.message), quests: [] }); } }

sec(`§4 cada passo de cada quest que o esqueleto abre tem caminho do sistema (${N} campanhas)`);
{
  const tab = {}, faltas = {}, mentiras = {}, tems = {}, vistas = {};
  let passos = 0;
  for (const c of mundos) {
    for (const q of c.quests) {
      (vistas[c.molde] ||= new Set()).add(q.quest);
      for (const p of osPassos(c, q)) {
        passos++;
        const k = `${q.quest}`;
        const row = ((tab[k] ||= {})[c.molde] ||= { n: 0, sem: 0 });
        row.n++;
        if (p.mente) { (mentiras[`${q.quest} · ${p.etapa}`] ||= []).push(c.s); row.mente = (row.mente || 0) + 1; }
        if (p.ok) continue;
        if (p.tem) { (tems[`${q.quest} · ${p.etapa}`] ||= []).push(c.s); continue; }
        row.sem++;
        (faltas[`${q.quest} · ${p.etapa}: ${p.porque}`] ||= []).push(c.s);
      }
    }
  }
  const moldes = Object.keys(vistas).sort();
  console.log(`      ${passos} passos medidos · quests vistas por molde: ${moldes.map((m) => `${m} ${vistas[m].size}/${BIBLIOTECA_DE_QUESTS.length}`).join(" · ")}`);
  for (const m of moldes) console.log(`      ${m}: o esqueleto não abriu ${BIBLIOTECA_DE_QUESTS.filter((q) => !vistas[m].has(q.id)).map((q) => q.id).join(", ") || "nenhuma por abrir"}`);
  for (const [k, por] of Object.entries(tab).sort()) {
    const s = moldes.map((m) => (por[m] ? `${m.slice(0, 10)} ${por[m].sem}/${por[m].n}` : `${m.slice(0, 10)} -`)).join(" · ");
    if (moldes.some((m) => por[m] && por[m].sem)) console.log(`      sem caminho  ${k.padEnd(30)} ${s}`);
  }
  for (const [k, ss] of Object.entries(faltas)) console.log(`      falta: ${k} (${ss.length}) ex.: ${ss.slice(0, 3).join(" ")}`);
  for (const [k, ss] of Object.entries(mentiras)) console.log(`      o rumo mente: ${k} (${ss.length}) ex.: ${ss.slice(0, 2).join(" ")}`);
  for (const [k, ss] of Object.entries(tems)) console.log(`      só a IA põe o item na bolsa (tem): ${k} (${ss.length})`);
  t("as campanhas nascem (nenhuma estoura)", !mundos.some((c) => c.erro), mundos.filter((c) => c.erro).slice(0, 2).map((c) => c.s + " " + c.erro).join(" | "));
  t("os quatro moldes", moldes.length === 4, moldes.join(","));
  t("nenhum passo sem caminho do sistema (fora o `tem`, listado)", Object.keys(faltas).length === 0, Object.keys(faltas).slice(0, 6).join(" | "));
  t("nenhum rumo «Ir até» um sítio de outra cidade", Object.keys(mentiras).length === 0, Object.keys(mentiras).slice(0, 4).join(" | "));
}

sec("§5 a fiação do App");
{
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const i = app.indexOf("const cv = conviteNaFrase(acao, {");
  const conv = i < 0 ? "" : app.slice(i - 700, i + 200);
  t("o convite pela frase lê quem está em cena (quemAgora: o passo, o posto)", /quemAgora\(\)/.test(conv) && /doPasso/.test(conv) && /doSitio/.test(conv) && /calou\(/.test(conv), conv.slice(0, 160));
  const j = app.indexOf("oRumoDaBusca({ passos: passosDasQuestsAgora()");
  t("o rumo lê o grupo (quem já anda com o herói não é para levar)", j >= 0 && /grupo:/.test(app.slice(j, j + 400)));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
