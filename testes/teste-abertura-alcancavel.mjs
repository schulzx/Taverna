/* teste-abertura-alcancavel.mjs (17/11/2026, a abertura alcançável)

   A prova jogada de 17/11 começou três campanhas pela chegada nova
   («Sentar à mesa» → «Começar») e em nenhuma a quest de abertura andou até
   ao fim: a pessoa do 1.º passo nascia noutra cidade (Alaric em Nix
   Terminal com o herói em Órion IX; Helga no Andar 4 com o herói no
   Andar 1), na névoa e sem viagem possível, e o protegido do Salvo-Conduto
   nunca entrava no grupo. Medido em Node pelo MESMO caminho do App
   (criacao-da-mesa → ficha → mapa da criação → espinha → núcleo →
   esqueleto), sem IA:

     §1 A CATRACA: em 520 campanhas da chegada nova, a quest de abertura
        nasce na cidade onde o herói começa — toda pessoa e todo lugar do
        1.º passo estão ali (antes: 30,0% nas mesmas 520, igual na v9.654,
        na v9.656 que está no ar e no HEAD de 17/11; a torre 3,6%);
     §2 quem a história manda levar vem: a balança do convite aceita a
        pessoa que o passo pede `acompanha` (o protegido do Salvo-Conduto
        vinha no 1.º dia em 1 de 62 campanhas; agora em todas);
     §3 o rumo oferece «Levar X junto» quando o passo pede X ao lado;
     §4 o nome com hífen inteiro («Alaric Barba-Ruiva», não «Alaric Barba-»);
     §5 quem a frase chama e a história pôs noutra cidade: o sistema diz onde;
     §6 a medida «fechável sem a IA» (o modelo de passos, escrito abaixo),
        por molde — e a lista dos factos sem caminho do sistema;
     §7 a fiação do App (os três patches do relato): o convite e a proposta
        recebem os passos, a gente da história é conhecida, e as cidades da
        quest aberta entram no mapa por descobrirCidade — o mesmo laço que a
        medida «com as cidades» do §6 corre aqui em Node. */
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
import { esqueletoDaCampanha, ESQUELETO } from "../src/esqueleto.js";
import { questPorId } from "../src/biblioteca-de-quests.js";
import { CONDICOES } from "../src/condicoes-da-quest.js";
import { indoleDe, pesarConvite, conviteNaFrase } from "../src/indole.js";
import { oRumoDaBusca, PROPOSTAS_DA_ABERTURA } from "../src/propostas-da-abertura.js";
import { aPessoaChamada, oQueSeSabeDaPessoa } from "../src/motor/a-proposta-da-frase.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const pct = (a, n) => (n ? `${((100 * a) / n).toFixed(1)}%` : "-");

/* a campanha como o App a cria (iniciar, App.jsx): a semente da visita, a
   mesa sorteada, o léxico de tabela, o mapa da criação (a região no modo
   história), a cidade de partida pisada, a espinha (e a espinha na região),
   o núcleo e o esqueleto. O companheiro de antes fica de fora: só muda quem
   ocupa os papéis `de: "grupo"`, que andam com o herói. */
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
  const a0 = esq ? (esq.atos || []).find((a) => a && a.ato === 0) : null;
  return { s, sm, molde: m.molde, mapa, cidade, a0 };
}

/* as folhas de uma condição, com o sinal (dentro de `nenhum`, negadas) */
const COMB = new Set(["todos", "algum", "nenhum", "pelo_menos"]);
function folhas(c, neg = false, out = []) {
  if (!Array.isArray(c)) return out;
  const [op, ...r] = c;
  if (op === "pelo_menos") { r.slice(1).forEach((x) => folhas(x, neg, out)); return out; }
  if (COMB.has(op)) { r.forEach((x) => folhas(x, op === "nenhum" ? !neg : neg, out)); return out; }
  out.push({ pred: op, args: r, neg });
  return out;
}
/* «papel:protegido», «lugar:origem», «item:chave» — o nome do papel depois dos dois pontos */
const papelDe = (args) => { const a = args.find((x) => typeof x === "string" && /^(papel|lugar|item|pessoa):/.test(x)); return a ? a.slice(a.indexOf(":") + 1) : null; };

/* ============================================================
   O MODELO «FECHÁVEL SEM A IA» (§6) — escrito, para a medida ser lida:
   · o herói conhece a cidade onde começa; ao chegar a uma cidade, conhece
     as vizinhas por rota de até 12 dias (descobrirVizinhanca, a névoa ao
     redor — é o que o jogo faz na chegada);
   · uma folha com pessoa ou lugar pede que a cidade dele seja conhecida;
     sem cidade (o servo do fio, que o encontro põe à frente), alcança-se;
   · `nenhum` (sair de um sítio) pede outra cidade conhecida;
   · `acompanha` pede que a balança do convite aceite no 1.º dia — com os
     passos (a história pede) ou sem eles (como era);
   · os factos sem caminho do sistema (SEM_CAMINHO) nunca fecham;
   · as etapas fecham por ordem; a cidade de cada folha cumprida é visitada;
   · «comAsCidades»: as cidades que a quest nomeia entram no mapa «de ouvir»
     quando ela abre (o patch do App por aplicar, no relato) — o arquipélago
     tem ilhas sem nenhuma rota de até 12 dias, e de lá nada se descobre só
     por chegar.
   ============================================================ */
const SEM_CAMINHO = new Set(["tem"]);
function fechavel(c, { comAHistoria, comAsCidades }) {
  const F = questPorId(c.a0.quest);
  const R = { papeis: c.a0.papeis || {} };
  const viz = (nome) => (c.mapa.rotas || []).filter((r) => r && Number(r.dias) <= 12 && (norm(r.de) === norm(nome) || norm(r.para) === norm(nome))).map((r) => (norm(r.de) === norm(nome) ? r.para : r.de));
  const conhecidas = new Set([norm(c.cidade)]);
  if (comAsCidades) {
    /* o laço do patch 3 (aplicarAsQuests, App.jsx), em Node: o que o mapa passa a dar por descoberto é o que o resolver deixa viajar */
    let m = c.mapa;
    for (const p of Object.values(R.papeis)) if (p && p.cidade) { const d = descobrirCidade(m, p.cidade); if (d.nova) m = d.mapa; }
    for (const x of (m.cidades || [])) if (x && x.descoberta !== false) conhecidas.add(norm(x.nome));
  }
  let aqui = norm(c.cidade);
  const visitar = (cid) => { aqui = norm(cid); conhecidas.add(aqui); for (const v of viz(cid)) conhecidas.add(norm(v)); };
  const folha = (pred, args) => {
    const p = R.papeis[papelDe(args)] || {};
    if (SEM_CAMINHO.has(pred)) return { ok: false, porque: pred };
    if (pred === "acompanha") {
      const passos = comAHistoria ? [{ candidatos: { pessoa: [{ nome: p.nome, predicado: "acompanha" }] } }] : undefined;
      const v = pesarConvite(indoleDe(c.sm, { nome: p.nome }), { convivio: { dias: 1 }, fama: 0, nome: p.nome, passos });
      return v.resposta === "aceita" ? { ok: true, cids: [] } : { ok: false, porque: `acompanha (${v.resposta})` };
    }
    if (!p.cidade) return { ok: true, cids: [] };
    if (!conhecidas.has(norm(p.cidade))) return { ok: false, porque: `${pred} na névoa` };
    return { ok: true, cids: [p.cidade] };
  };
  const ev = (cnd) => {
    const [op, ...r] = cnd;
    if (op === "todos") { const xs = r.map(ev); return xs.find((x) => !x.ok) || { ok: true, cids: xs.flatMap((x) => x.cids) }; }
    if (op === "algum") { const xs = r.map(ev); return xs.find((x) => x.ok) || xs[0]; }
    if (op === "pelo_menos") { const xs = r.slice(1).map(ev); const bons = xs.filter((x) => x.ok); return bons.length >= r[0] ? { ok: true, cids: bons.flatMap((x) => x.cids) } : xs.find((x) => !x.ok); }
    if (op === "nenhum") {
      /* sair de um sítio da cidade é andar até à rua; sair da CIDADE pede
         outra cidade conhecida para onde ir */
      const p = R.papeis[papelDe(folhas(r[0]).flatMap((f) => f.args))] || {};
      const eCidade = !p.nome || norm(p.nome) === norm(p.cidade);
      if (!eCidade) return { ok: true, cids: [] };
      return [...conhecidas].some((k) => k !== aqui) ? { ok: true, cids: [] } : { ok: false, porque: "sair da cidade sem outra conhecida" };
    }
    if (op === "escolheu" || op === "dia" || op === "camada") return { ok: true, cids: [] };
    return folha(op, r);
  };
  for (const et of F.etapas) {
    const x = ev(et.conclui);
    if (!x.ok) return { fecha: false, onde: `${et.id}: ${x.porque}` };
    for (const cid of x.cids) visitar(cid);
  }
  return { fecha: true, onde: "" };
}

/* ============================================================ */
const N = 520;
const mundos = [];
for (let i = 0; i < N; i++) { try { mundos.push(campanha(i)); } catch (e) { mundos.push({ s: `mesa|${i.toString(36)}`, erro: String(e && e.message) }); } }

sec(`§1 a catraca: a quest de abertura nasce onde o herói começa (${N} campanhas da chegada nova)`);
{
  t("a regra é tabela (ESQUELETO.atoDaCasa) e liga o ato 0", ESQUELETO.atoDaCasa === 0);
  const comQuest = mundos.filter((c) => c.a0 && c.a0.quest);
  t(`toda campanha nasce com a quest do ato 0 (${comQuest.length} de ${N})`, comQuest.length === N, mundos.filter((c) => !c.a0 || !c.a0.quest).slice(0, 3).map((c) => c.s + (c.erro ? " " + c.erro : "")).join(" "));
  const porMolde = {}, porQuest = {}, falhas = [];
  for (const c of comQuest) {
    const F = questPorId(c.a0.quest);
    const fs = folhas(F.etapas[0].conclui).filter((f) => !f.neg);
    const longe = fs.map((f) => ({ f, p: (c.a0.papeis || {})[papelDe(f.args)] || {} })).filter(({ p }) => p.cidade && norm(p.cidade) !== norm(c.cidade));
    const pm = (porMolde[c.molde] ||= { n: 0, aqui: 0 }); pm.n++;
    const pq = (porQuest[c.a0.quest] ||= { n: 0, aqui: 0 }); pq.n++;
    if (!longe.length) { pm.aqui++; pq.aqui++; } else if (falhas.length < 5) falhas.push(`${c.s} ${c.a0.quest} herói@${c.cidade} ${longe.map(({ f, p }) => `${f.pred}:${p.nome || ""}@${p.cidade}`).join(" ")}`);
  }
  for (const [k, v] of Object.entries(porMolde)) console.log(`      ${k.padEnd(12)} ${String(v.n).padStart(4)} campanhas · passo 1 na cidade de partida ${pct(v.aqui, v.n)}`);
  for (const [k, v] of Object.entries(porQuest)) console.log(`      ${k.padEnd(26)} ${String(v.n).padStart(4)} · ${pct(v.aqui, v.n)}`);
  t("os quatro moldes saem do sorteio", Object.keys(porMolde).length === 4, Object.keys(porMolde).join(","));
  t("100% das quests de abertura têm o 1.º passo na cidade de partida", falhas.length === 0, falhas.join(" | "));
  const casaFora = comQuest.filter((c) => c.a0.cidade && norm(c.a0.cidade) !== norm(c.cidade));
  t("e o ato 0 diz a cidade de partida", casaFora.length === 0, casaFora.slice(0, 3).map((c) => `${c.s}: ${c.a0.cidade} ≠ ${c.cidade}`).join(" | "));
  /* a pessoa do 1.º passo tem casa — é por ela que entra em cena (a-pessoa-do-passo.js) */
  const semCasa = comQuest.filter((c) => folhas(questPorId(c.a0.quest).etapas[0].conclui).some((f) => !f.neg && CONDICOES[f.pred] && CONDICOES[f.pred].args[0].tipo === "pessoa" && (c.a0.papeis[papelDe(f.args)] || {}).cidade && !(c.a0.papeis[papelDe(f.args)] || {}).local));
  t("a pessoa do 1.º passo nasce com casa", semCasa.length === 0, semCasa.slice(0, 3).map((c) => c.s).join(" "));
}

sec("§2 quem a história manda levar vem (a balança do convite)");
{
  const sm = "aventura|Fantasia";
  const ind = indoleDe(sm, { nome: "Saoirse" });
  const pede = [{ quest: "o_salvo_conduto", candidatos: { pessoa: [{ nome: "Saoirse", predicado: "acompanha" }] } }];
  const v = pesarConvite(ind, { convivio: { dias: 1 }, fama: 0, nome: "Saoirse", passos: pede });
  t("o passo pede Saoirse ao lado: ela aceita", v.resposta === "aceita" && /Saoirse/.test(v.porques[0]), JSON.stringify(v));
  const outro = pesarConvite(indoleDe(sm, { nome: "Gil" }), { convivio: { dias: 1 }, fama: 0, nome: "Gil", passos: pede });
  const gil = pesarConvite(indoleDe(sm, { nome: "Gil" }), { convivio: { dias: 1 }, fama: 0 });
  t("quem o passo não pede: a balança de sempre", outro.resposta === gil.resposta);
  const so = pesarConvite(ind, { convivio: { dias: 1 }, fama: 0, nome: "Saoirse", passos: [{ candidatos: { pessoa: [{ nome: "Saoirse", predicado: "conversou" }] } }] });
  t("o passo que só pede ouvi-la não a põe no grupo", so.resposta === pesarConvite(ind, { convivio: { dias: 1 }, fama: 0 }).resposta);
  t("o grupo cheio continua a recusar", pesarConvite(ind, { grupoCheio: true, nome: "Saoirse", passos: pede }).resposta === "recusa");
  t("lixo não estoura", pesarConvite(ind, { nome: 7, passos: "x" }).resposta !== undefined && pesarConvite(ind, null).resposta !== undefined);
  /* as campanhas do Salvo-Conduto: sem os passos, o protegido não vem no 1.º dia; com eles, vem */
  const sc = mundos.filter((c) => c.a0 && c.a0.quest === "o_salvo_conduto");
  const vem = (c, passos) => { const n = c.a0.papeis.protegido.nome; return pesarConvite(indoleDe(c.sm, { nome: n }), { convivio: { dias: 1 }, fama: 0, nome: n, passos }).resposta === "aceita"; };
  const antes = sc.filter((c) => vem(c, undefined)).length;
  const depois = sc.filter((c) => vem(c, [{ candidatos: { pessoa: [{ nome: c.a0.papeis.protegido.nome, predicado: "acompanha" }] } }])).length;
  console.log(`      o Salvo-Conduto em ${sc.length} campanhas: o protegido vem no 1.º dia ${antes} → ${depois}`);
  t("há campanhas do Salvo-Conduto na amostra", sc.length >= 20, String(sc.length));
  t("e em todas o protegido vem quando a história o pede", depois === sc.length);
  t("a frase do rumo é um convite que a casa reconhece", !!conviteNaFrase(PROPOSTAS_DA_ABERTURA.levar.frase.replace("{nome}", "Saoirse"), { presentes: [{ nome: "Saoirse" }], grupo: [] }));
}

sec("§3 o rumo: «Levar X junto» quando o passo pede X ao lado");
{
  const passos = [{ lugares: [{ nome: "Vega Zênite" }], candidatos: { pessoa: [{ nome: "Saoirse", predicado: "acompanha", cidade: "Vega Zênite" }] } }];
  const r = oRumoDaBusca({ passos, cidade: "Vega Zênite" });
  t("a porta é levá-la, com a frase do convite", r && r.verbo === "Levar Saoirse junto" && r.frase === "Saoirse, vem comigo.", JSON.stringify(r));
  const longe = oRumoDaBusca({ passos: [{ lugares: [{ nome: "O Cais" }], candidatos: { pessoa: [{ nome: "Saoirse", predicado: "acompanha", cidade: "Nix" }] } }], cidade: "Vega Zênite" });
  /* MOVIDA (17/11, os dois becos da quest): era «o rumo é o do lugar» («Ir até
     O Cais»). Mas o passo pede-a AO LADO, e ir a um sítio sem ela não fecha
     nada — o herói tem de ir buscá-la: partir para a cidade dela (e lá, ir
     até à casa, e levá-la). A régua inteira está em teste-quest-fechavel §1. */
  t("se ela está noutra cidade, o rumo é partir para lá", longe && longe.verbo === "Partir para Nix", JSON.stringify(longe));
  t("na estrada e na luta, nada", oRumoDaBusca({ passos, cidade: "Vega Zênite", naEstrada: true }) === null && oRumoDaBusca({ passos, cidade: "Vega Zênite", emLuta: true }) === null);
  t("o rumo do lugar continua como era", (oRumoDaBusca({ passos: [{ lugares: [{ nome: "Roda dos Punhos" }] }], cidade: "X" }) || {}).verbo === "Ir até Roda dos Punhos");
}

sec("§4 o nome com hífen sai inteiro");
{
  const c = aPessoaChamada("Falo com Alaric Barba-Ruiva sobre a estrada.", { conhecidos: [], presentes: [], mundo: [] });
  t("«Alaric Barba-Ruiva», não «Alaric Barba-»", c && c.nome === "Alaric Barba-Ruiva", JSON.stringify(c));
  const c2 = aPessoaChamada("Falo com Hilda Pé-Leve.", { conhecidos: [], presentes: [], mundo: [] });
  t("e o hífen em minúscula também («Hilda Pé-Leve»)", c2 && c2.nome === "Hilda Pé-Leve", JSON.stringify(c2));
  const c3 = aPessoaChamada("Falo com Kolvar.", { conhecidos: [], presentes: [], mundo: [] });
  t("o nome simples continua igual", c3 && c3.nome === "Kolvar", JSON.stringify(c3));
}

sec("§5 quem a história pôs noutra cidade: o sistema diz onde");
{
  const passos = [{ candidatos: { pessoa: [{ nome: "Alaric Barba-Ruiva", predicado: "conversou", onde: "Doca de Atracação", cidade: "Nix Terminal" }] } }];
  const longe = oQueSeSabeDaPessoa({ passos, cidadeAtual: "Órion IX" }, "Alaric Barba-Ruiva");
  t("longe: a casa e a cidade", longe.length === 1 && /Alaric Barba-Ruiva anda em Doca de Atracação, em Nix Terminal/.test(longe[0].linha) && longe[0].cidade === "Nix Terminal", JSON.stringify(longe));
  const perto = oQueSeSabeDaPessoa({ passos, cidadeAtual: "Nix Terminal" }, "Alaric Barba-Ruiva");
  t("perto: só a casa", perto.length === 1 && !/em Nix/.test(perto[0].linha) && perto[0].lugar === "Doca de Atracação", JSON.stringify(perto));
  t("sem passos, como antes", oQueSeSabeDaPessoa({ cidadeAtual: "X" }, "Alaric").length === 0);
}

sec("§6 fechável sem a IA (o modelo do cabeçalho), por molde");
{
  const com = mundos.filter((c) => c.a0 && c.a0.quest);
  const conta = (comAHistoria, comAsCidades = false) => {
    const por = {}, faltas = {};
    for (const c of com) {
      const r = fechavel(c, { comAHistoria, comAsCidades });
      const pm = (por[c.molde] ||= { n: 0, fecha: 0 }); pm.n++; if (r.fecha) pm.fecha++;
      if (!r.fecha) { const k = `${c.a0.quest} · ${r.onde}`; (faltas[k] ||= []).push(c.s); }
    }
    return { por, faltas };
  };
  const antes = conta(false), depois = conta(true), comPatch = conta(true, true);
  const total = (x) => Object.values(x.por).reduce((s, v) => ({ n: s.n + v.n, f: s.f + v.fecha }), { n: 0, f: 0 });
  for (const k of Object.keys(depois.por)) console.log(`      ${k.padEnd(12)} sem o convite da história ${pct(antes.por[k].fecha, antes.por[k].n)} → com ele ${pct(depois.por[k].fecha, depois.por[k].n)} → e as cidades da quest no mapa ${pct(comPatch.por[k].fecha, comPatch.por[k].n)}`);
  const ta = total(antes), td = total(depois), tp = total(comPatch);
  console.log(`      TOTAL        ${pct(ta.f, ta.n)} → ${pct(td.f, td.n)} → ${pct(tp.f, tp.n)}`);
  for (const [k, ss] of Object.entries(depois.faltas)) console.log(`      ainda não fecha: ${k} (${ss.length}) ex.: ${ss.slice(0, 3).join(" ")}`);
  t("o convite da história faz fechar mais", td.f > ta.f, `${ta.f} → ${td.f}`);
  t("nenhuma quest de abertura para no «acompanha»", !Object.keys(depois.faltas).some((k) => /acompanha/.test(k)));
  /* o que falta com o convite é só mapa: a cidade do destino na névoa (o
     patch do App que a põe «de ouvir» quando a quest abre) */
  t("com ele, o que ainda não fecha é só a cidade fora do mapa conhecido", Object.keys(depois.faltas).every((k) => /na névoa|sair da cidade/.test(k)), Object.keys(depois.faltas).join(" | "));
  t("e com ele ≥ 90% fecham sem a IA", td.f >= 0.9 * td.n, pct(td.f, td.n));
  t("com as cidades da quest no mapa, todas fecham", tp.f === tp.n, Object.keys(comPatch.faltas).join(" | "));
}

sec("§7 a fiação do App: os três patches da abertura");
{
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const trecho = (ancora, n = 900) => { const i = app.indexOf(ancora); return i < 0 ? "" : app.slice(i, i + n); };
  const conv = trecho("const vereditoDoConvite = (nome) => pesarConvite(", 600);
  t("1 · o convite passa o nome e os passos da história a pesarConvite", /\bnome, passos: \(\(\) => \{ try \{ return passosDasQuestsAgora\(\); \} catch \(e\) \{ calou\(/.test(conv), conv.slice(0, 200));
  const conh = trecho("const conhecidos = new Set();", 2200);
  t("2 · a gente que os passos nomeiam entra nos conhecidos da recusa", /for \(const p of passosDasQuestsAgora\(\)\) for \(const c of \(\(p && p\.candidatos && p\.candidatos\.pessoa\) \|\| \[\]\)\) if \(c && c\.nome\) conhecidos\.add\(c\.nome\); \} catch \(e\) \{ calou\(/.test(conh));
  /* AJUSTADA em 23/11 (a décima sexta sessão, «uma porta só»): a leitura da frase passa por `lf` (com o
     Mestre vivo, sem o pagar, a venda e a compra das listas). A intenção fica: a proposta recebe os passos. */
  t("2 · e a proposta da frase recebe os passos", /aPropostaDaFrase\(mestreVivoLigado\(\) \? \{ \.\.\.lf, pagar: null, venda: null, compras: null \} : lf, \{ \.\.\.estadoDoPedido\(\), passos: \(\(\) => \{ try \{ return passosDasQuestsAgora\(\);/.test(app));
  const aq = trecho("const aplicarAsQuests = (r, onde) => {", 2400);
  t("3 · aplicarAsQuests põe no mapa as cidades dos papéis da quest aberta", /R\.estado !== "aberta"[\s\S]*Object\.values\(R\.papeis[\s\S]*descobrirCidade\(mapaRef\.current, p\.cidade\)[\s\S]*setMapa\(d\.mapa\)[\s\S]*calou\("BQ7 · " \+ onde \+ " · as cidades da quest no mapa"/.test(aq));
  /* o laço do patch 3 numa campanha real: a cidade de cada papel sai da névoa */
  const c = mundos.find((x) => x.a0 && x.a0.papeis && Object.values(x.a0.papeis).some((p) => p && p.cidade && norm(p.cidade) !== norm(x.cidade) && (x.mapa.cidades || []).some((k) => norm(k.nome) === norm(p.cidade) && k.descoberta === false)));
  if (c) {
    let m = c.mapa;
    for (const p of Object.values(c.a0.papeis)) if (p && p.cidade) { const d = descobrirCidade(m, p.cidade); if (d.nova) m = d.mapa; }
    const fora = Object.values(c.a0.papeis).filter((p) => p && p.cidade && !(m.cidades || []).some((k) => norm(k.nome) === norm(p.cidade) && k.descoberta !== false));
    t("3 · numa campanha com papel longe (" + c.s + "), toda cidade de papel fica conhecida", fora.length === 0, fora.map((p) => p.cidade).join(", "));
  } else t("3 · há campanha com papel numa cidade na névoa, para o laço ter o que abrir", false);
}

console.log(`\na abertura alcançável: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
