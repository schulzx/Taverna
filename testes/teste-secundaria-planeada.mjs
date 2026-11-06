/* teste-secundaria-planeada.mjs — a secundária planeada (Fase SQ · SQ3, 05/11)

   A prova de `src/secundaria-planeada.js`. A pessoa, a 05/11: "as quests
   secundárias também devem ser planejadas assim como uma quest de
   história (...) teremos menos quests secundárias mas bem elaboradas". O
   desenho está em `mente/sq3-secundaria.md`.

   O que esta suíte tranca:
     1. as tabelas: de 6 a 10 moldes, cada um com fio, 2–3 atos, uma
        reviravolta entre atos, um prazo que o relógio aceita e um fecho;
        o teto (2 vivas) e o intervalo (3 dias);
     2. em mundos de verdade (seis géneros): toda secundária tem gancho,
        atos, reviravolta, custo e fecho, e nasce de um fio que EXISTE — a
        pessoa no elenco ou na base, o sítio na base, a cidade no mapa;
     3. determinismo pela semente, e imutabilidade do que recebe;
     4. o portão, o teto e o intervalo (`podeNascerSecundaria`);
     5. o formato: `conferir` (missoes.js) segue os atos até ao fim, a
        reviravolta segura a missão até acontecer, e `tarefaParaMissao`
        entrega-a tal qual;
     6. a noite (geradores.js): com o mundo, no máximo uma, e só quando
        pode; sem ele, o de sempre;
     7. o lixo e o `null` não estouram.

   Tudo por semente: nenhum `Math.random` decide uma asserção. */
import { MOLDES_DA_SECUNDARIA, TETO_DAS_SECUNDARIAS, planearSecundaria, podeNascerSecundaria, lerSecundaria } from "../src/secundaria-planeada.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { abrirAbertura } from "../src/abertura.js";
import { MOLDES } from "../src/moldes.js";
import { elencoDoMundo } from "../src/elenco.js";
import { locaisDaCidade, genteDoLocal, idDoLocal } from "../src/mundo-base.js";
import { conferir, garantirMissoes, PRAZOS, TIPOS, ETAPAS } from "../src/missoes.js";
import { tipoDeViradaPorId, viradaDevida } from "../src/tramas.js";
import { tarefaParaMissao } from "../src/tarefas-antigas.js";
import { processarDescansoLongoEventos, ctxMundo } from "../src/geradores.js";
import { rng, hashSemente } from "../src/semente.js";
import { generosDisponiveis } from "../src/nomes.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const T = TETO_DAS_SECUNDARIAS;

/* uma campanha nova, como o `iniciar` do App a monta */
function campanha(semente, M, genero) {
  const mapa = gerarGeografia(semente, M);
  const cidade = mapa.cidades[0].nome;
  const espinha = estenderEspinha({ semente, mapa, molde: M, estrutura: "jornada", cidadeInicial: cidade });
  const R0 = abrirAbertura({ semente, mapa, cidade, espinha, estrutura: "jornada", antecedente: "", molde: M, nivel: 1, dia: 1 });
  const mundo = { semente, mapa, cidadeAtual: cidade, genero, molde: M, lex: null, nivel: 3, dia: 6 };
  return { semente, mapa, cidade, espinha, abertura: R0 && R0.abertura, mundo };
}
const generos = generosDisponiveis().slice(0, 6);
const W0 = campanha("Prova SQ3|mesa", MOLDES[0], undefined);

sec("1. As tabelas");
t("de 6 a 10 moldes", MOLDES_DA_SECUNDARIA.length >= 6 && MOLDES_DA_SECUNDARIA.length <= 10);
t("ids únicos", new Set(MOLDES_DA_SECUNDARIA.map((m) => m.id)).size === MOLDES_DA_SECUNDARIA.length);
const FIOS = ["laco", "casa", "segredo", "estrada", "faccao", "arco"];
t("cada molde nasce de um fio que o mundo tem", MOLDES_DA_SECUNDARIA.every((m) => FIOS.includes(m.fio)));
t("dois ou três atos, de verbos que o jogo segue", MOLDES_DA_SECUNDARIA.every((m) => m.atos.length >= 2 && m.atos.length <= 3 && m.atos.every((a) => /^(falar|revelar|ir):[A-Za-z]+\??$/.test(a))));
t("o primeiro ato é sempre encontrar quem pede", MOLDES_DA_SECUNDARIA.every((m) => m.atos[0] === "falar:A"));
t("a reviravolta é uma virada que o código executa, entre atos", MOLDES_DA_SECUNDARIA.every((m) => tipoDeViradaPorId(m.reviravolta.tipo) && m.reviravolta.apos >= 0 && m.reviravolta.apos < m.atos.length - 1));
t("o custo é um prazo que o relógio aceita", MOLDES_DA_SECUNDARIA.every((m) => PRAZOS.includes(m.prazo) && typeof m.custo === "function"));
t("o fecho muda o mundo: laço, lugar ou porta", MOLDES_DA_SECUNDARIA.every((m) => ["laco", "lugar", "porta"].includes(m.fecho.tipo)));
t("o fecho de lugar tem um sítio a revelar; o de porta, uma estrada", MOLDES_DA_SECUNDARIA.every((m) => (m.fecho.tipo !== "lugar" || m.atos.some((a) => a.startsWith("revelar"))) && (m.fecho.tipo !== "porta" || m.atos.some((a) => a === "ir:B"))));
t("o teto: duas vivas, três dias entre nascimentos", T.vivas === 2 && T.intervalo === 3);
t("o intervalo é menor que o prazo mais curto (nunca empilham)", T.intervalo < Math.min(...PRAZOS));
t("as tabelas não se mudam por fora", Object.isFrozen(T) && Object.isFrozen(MOLDES_DA_SECUNDARIA));

sec("2. Em mundos de verdade: a forma inteira, e o fio existe");
let geradas = 0, forma = true, fioReal = true, moldes = new Set(), semNomeDoMecanismo = true, falhas = [];
const RX_MECANISMO = /\b(miss[aã]o|secund[aá]ria|molde|ato|reviravolta|quest|sistema|npc)\b/i;
for (let g = 0; g < Math.max(1, generos.length); g++) {
  for (let k = 0; k < 4; k++) {
    const W = campanha(`SQ3|${g}|${k}`, MOLDES[k % MOLDES.length], generos[g]);
    const el = elencoDoMundo(W.semente, W.mapa, { genero: generos[g], molde: W.mundo.molde, espinha: W.espinha });
    const nomes = new Set();
    const sitios = new Map();
    for (const c of W.mapa.cidades) {
      for (const l of locaisDaCidade(W.semente, c, generos[g], W.mundo.molde, null)) {
        sitios.set(norm(l.nome) + "|" + norm(c.nome), idDoLocal(c.nome, l));
        for (const p of genteDoLocal(W.semente, l, generos[g], W.mundo.molde, null)) nomes.add(norm(p.nome));
      }
    }
    for (const p of el.pessoas) nomes.add(norm(p.nome));
    const cidades = new Set(W.mapa.cidades.map((c) => norm(c.nome)));
    for (let s = 0; s < 8; s++) {
      const m = planearSecundaria({ ...W.mundo, genero: generos[g] }, { espinha: W.espinha, dia: 6 }, s);
      if (!m) continue;
      geradas++;
      const L = lerSecundaria(m);
      moldes.add(L.molde);
      const ok1 = !!L && L.gancho.length > 20 && L.atos.length >= 2 && L.atos.length <= 3 && L.atos.every((a) => a.texto)
        && !!L.reviravolta && L.custo.noites > 0 && !!L.fecho && m.prazo > 0 && m.status === "ativa" && m.titulo;
      if (!ok1) { forma = false; falhas.push(m.id); }
      for (const e of m.etapas) {
        if (e.tipo === "falar_com" && !nomes.has(norm(e.alvo))) { fioReal = false; falhas.push(`pessoa ${e.alvo}`); }
        if (e.tipo === "ir_a" && !cidades.has(norm(e.alvo))) { fioReal = false; falhas.push(`cidade ${e.alvo}`); }
        if (e.tipo === "revelar") {
          const cid = String(e.chave).split("|")[0];
          if (sitios.get(norm(e.alvo) + "|" + norm(cid)) !== e.chave) { fioReal = false; falhas.push(`sítio ${e.alvo}`); }
        }
      }
      if (!nomes.has(norm(m.dador))) { fioReal = false; falhas.push(`dador ${m.dador}`); }
      if (L.fecho.tipo === "laco" && norm(L.fecho.quem) !== norm(m.dador)) forma = false;
      if (RX_MECANISMO.test(`${m.titulo} ${m.descricao}`)) { semNomeDoMecanismo = false; falhas.push(`texto: ${m.titulo}`); }
    }
  }
}
t(`nascem secundárias em mundos novos (${geradas})`, geradas >= 60);
t("toda secundária tem gancho, atos, reviravolta, custo e fecho", forma, falhas.slice(0, 3).join("; "));
t("nasce de um fio que existe: a pessoa, o sítio e a cidade estão no mundo", fioReal, falhas.slice(0, 3).join("; "));
t(`os moldes variam (${moldes.size} de ${MOLDES_DA_SECUNDARIA.length} vistos)`, moldes.size >= 5);
t("o texto é de mundo: nunca nomeia o mecanismo", semNomeDoMecanismo, falhas.slice(0, 3).join("; "));
const m7 = planearSecundaria(W0.mundo, { espinha: W0.espinha, dia: 6 }, 7);
const daHistoria = new Set(elencoDoMundo(W0.semente, W0.mapa, { molde: W0.mundo.molde, espinha: W0.espinha }).pessoas.filter((p) => ["espinha", "chefe"].includes(p.fonte)).map((p) => norm(p.nome)));
let foraDaPrincipal = true;
for (let s = 0; s < 40; s++) { const m = planearSecundaria(W0.mundo, { espinha: W0.espinha, dia: 6 }, s); if (m && m.etapas.some((e) => e.tipo === "falar_com" && daHistoria.has(norm(e.alvo)))) foraDaPrincipal = false; }
t("a gente da espinha e os chefes ficam para a principal", foraDaPrincipal);
t("a missão é um favor com paga, do tamanho do herói", !!m7 && m7.tipo === "favor" && TIPOS[m7.tipo] && m7.recompensa && m7.recompensa.xp > 0 && m7.nivel === 3);
t("sem fio no mundo, não nasce (nada da imaginação)", planearSecundaria({ semente: "x", mapa: { cidades: [] } }, {}, 1) === null);
t("o arco que corre vira fio (o eco do arco)", (() => {
  for (let s = 0; s < 80; s++) { const m = planearSecundaria(W0.mundo, { espinha: W0.espinha, dia: 6, eventos: { global: { nome: "O Inverno dos Lobos" } } }, s); if (m && lerSecundaria(m).molde === "o_eco_do_arco") return m.titulo.includes("O Inverno dos Lobos"); }
  return false;
})());

sec("3. Determinismo e imutabilidade");
const a = planearSecundaria(W0.mundo, { espinha: W0.espinha, dia: 6 }, 42), b = planearSecundaria(W0.mundo, { espinha: W0.espinha, dia: 6 }, 42);
t("a mesma semente dá a mesma secundária, byte a byte", JSON.stringify(a) === JSON.stringify(b));
const outras = new Set(Array.from({ length: 12 }, (_, s) => JSON.stringify(planearSecundaria(W0.mundo, { espinha: W0.espinha, dia: 6 }, s))));
t("sementes diferentes dão secundárias diferentes", outras.size >= 6);
const antes = JSON.stringify({ mundo: W0.mundo, espinha: W0.espinha });
planearSecundaria(W0.mundo, { espinha: W0.espinha, dia: 6, missoes: [a] }, 3);
t("o mundo e o estado recebidos não mudam", JSON.stringify({ mundo: W0.mundo, espinha: W0.espinha }) === antes);
let semRepetir = true;
for (let s = 0; s < 30; s++) {
  const m = planearSecundaria(W0.mundo, { espinha: W0.espinha, dia: 6, missoes: [a] }, s);
  if (m && (lerSecundaria(m).molde === lerSecundaria(a).molde || norm(m.dador) === norm(a.dador))) semRepetir = false;
}
t("com uma viva, a seguinte não repete o molde nem quem pede", semRepetir);

sec("4. O portão, o teto e o intervalo");
const P = podeNascerSecundaria;
t("o portão de SQ2 fechado: não nasce", P({ abertura: W0.abertura, espinha: W0.espinha, nivel: 1 }).porque === "portao");
t("o portão aberto pelo nível: nasce", P({ abertura: W0.abertura, espinha: W0.espinha, nivel: 3, missoes: [], dia: 6 }).pode === true);
t("o portão já calculado por quem chama vale", P({ portaoAberto: false }).pode === false && P({ portaoAberto: true }).pode === true);
const viva = (id, dia, extra = {}) => ({ id, titulo: "x", status: "ativa", intencao: "secundaria", veiculo: T.veiculo, criadaEm: dia, etapas: [], ...extra });
const duas = [viva(a.id, 1), viva(`sq_a_divida_zz`, 1)];
t("duas vivas: o teto fecha", P({ portaoAberto: true, missoes: duas, dia: 20 }).porque === "teto");
t("o fio antigo que ainda anda conta como viva", P({ portaoAberto: true, missoes: [viva(a.id, 1), { titulo: "y", status: "ativa", intencao: "secundaria", veiculo: "tarefa_antiga" }], dia: 20 }).porque === "teto");
t("a conta de quem chama também conta", P({ portaoAberto: true, vivas: 2 }).porque === "teto");
t("a principal não conta", P({ portaoAberto: true, missoes: [viva(a.id, 1), { titulo: "p", status: "ativa", intencao: "principal", veiculo: "tarefa_antiga" }], dia: 20 }).pode === true);
t("nascida há menos de três dias: o intervalo fecha", P({ portaoAberto: true, missoes: [viva(a.id, 5)], dia: 5 + T.intervalo - 1 }).porque === "intervalo");
t("ao terceiro dia: pode", P({ portaoAberto: true, missoes: [viva(a.id, 5)], dia: 5 + T.intervalo }).pode === true);
t("a concluída também conta para o intervalo (menos, e melhores)", P({ portaoAberto: true, missoes: [viva(a.id, 5, { status: "concluida" })], dia: 6 }).porque === "intervalo");

sec("5. O formato: o jogo segue-a até ao fim");
function jogar(m0) {
  /* o herói faz cada ato, pela ordem: está com a pessoa no sítio dela,
     chega à cidade, está no sítio quando ele entra em cena */
  let lista = [m0], viradaFeita = false, passos = 0;
  while (lista[0].status === "ativa" && passos++ < 12) {
    const m = lista[0];
    const e = m.etapas.find((x) => !x.feito);
    const mundo = { derrotados: [], inventario: [], revelados: [], npcsCena: [] };
    if (e && e.tipo === "falar_com") {
      const [lugar, cidade] = String(e.onde).split(", em ");
      Object.assign(mundo, { cidadeAtual: cidade, lugarAtual: { nome: lugar, cidade }, falouCom: [e.alvo] });
    } else if (e && e.tipo === "ir_a") mundo.cidadeAtual = e.alvo;
    else if (e && e.tipo === "revelar") Object.assign(mundo, { cidadeAtual: e.chave.split("|")[0], lugarAtual: { nome: e.alvo, cidade: e.chave.split("|")[0] }, revelados: [e.chave] });
    const r = conferir(lista, mundo);
    lista = r.missoes;
    const feitas = lista[0].etapas.filter((x) => x.feito).length;
    if (viradaDevida(lista[0], { etapasFeitas: feitas })) { lista = [{ ...lista[0], virada: { ...lista[0].virada, feita: true } }]; viradaFeita = true; }
  }
  return { fim: lista[0], viradaFeita };
}
let seguem = 0, tentadas = 0, viradas = 0, quebradas = [];
for (let s = 0; s < 30; s++) {
  const m = planearSecundaria(W0.mundo, { espinha: W0.espinha, dia: 6 }, s);
  if (!m) continue;
  tentadas++;
  const r = jogar(m);
  if (r.fim.status === "concluida") seguem++; else quebradas.push(`${m.id}: ${r.fim.etapas.map((e) => e.tipo + (e.feito ? "+" : "-")).join(",")}`);
  if (r.viradaFeita) viradas++;
}
t(`as etapas seguem-se e concluem (${seguem}/${tentadas})`, tentadas > 0 && seguem === tentadas, quebradas.slice(0, 3).join(" · "));
t("a reviravolta acontece pelo meio, em todas", viradas === tentadas);
t("os atos são tipos que o conferente conhece", MOLDES_DA_SECUNDARIA.length > 0 && !!a && a.etapas.every((e) => ETAPAS[e.tipo] && !ETAPAS[e.tipo].soDaEspinha));
{
  /* todas cumpridas e a reviravolta por fazer: a missão espera por ela */
  const m = { ...a, etapas: a.etapas.map((e) => ({ ...e, feito: true })) };
  t("a reviravolta por fazer segura a missão de pé", conferir([m], {}).missoes[0].status === "ativa");
}
t("a catraca do formato deixa-a igual (save e load)", JSON.stringify(garantirMissoes([a])[0]) === JSON.stringify(a));
const viaTarefa = tarefaParaMissao({ titulo: a.titulo, descricao: a.descricao, objetivo: "x", tipo: "secundaria", status: "ativa", sorteada: true, planeada: a }, W0.mundo);
t("tarefaParaMissao entrega a planeada tal qual (o caminho da noite no App)", JSON.stringify(viaTarefa) === JSON.stringify(a));
t("e o fio antigo continua a converter-se como sempre", (() => { const m = tarefaParaMissao({ titulo: "Boato de taverna", objetivo: "Investigar", descricao: "x" }, W0.mundo); return !!m && m.veiculo === "tarefa_antiga" && !lerSecundaria(m); })());
t("lerSecundaria: o fecho de lugar aponta o sítio com a chave", (() => {
  for (let s = 0; s < 60; s++) { const m = planearSecundaria(W0.mundo, { espinha: W0.espinha, dia: 6 }, s); const L = m && lerSecundaria(m); if (L && L.fecho.tipo === "lugar") return !!L.fecho.chave && m.etapas.some((e) => e.chave === L.fecho.chave); }
  return false;
})());
t("lerSecundaria: o fecho de porta aponta a cidade da estrada", (() => {
  for (let s = 0; s < 60; s++) { const m = planearSecundaria(W0.mundo, { espinha: W0.espinha, dia: 6 }, s); const L = m && lerSecundaria(m); if (L && L.fecho.tipo === "porta") return W0.mapa.cidades.some((c) => c.nome === L.fecho.cidade) && L.fecho.cidade !== W0.cidade; }
  return false;
})());

sec("6. A noite (geradores.js)");
{
  const ctx = ctxMundo({ mundo: {}, mapa: W0.mapa, dia: 6 });
  let nascidas = 0, porNoite = true, noites = 0, comArco = 0;
  for (let s = 0; s < 200; s++) {
    const r = processarDescansoLongoEventos(null, ctx, { dia: 6, secundariasAtivas: 0, sorte: rng(hashSemente("sq3|" + s)), mundo: W0.mundo, missoes: [], historia: { espinha: W0.espinha } });
    noites++;
    if (r.questNova) {
      nascidas++;
      if (!r.questNova.planeada || !lerSecundaria(r.questNova.planeada) || r.questNova.titulo !== r.questNova.planeada.titulo) porNoite = false;
      if (r.globalNovo) comArco++;
    }
  }
  t(`com o mundo, a noite dá uma secundária planeada (${nascidas}/${noites})`, nascidas > 0 && porNoite);
  t("e a noite que a dá não dá também o arco regional", comArco === 0);
  const fechado = processarDescansoLongoEventos(null, ctx, { dia: 6, secundariasAtivas: 0, sorte: () => 0.99, secundarias: false, mundo: W0.mundo, missoes: [] });
  t("o portão fechado: nenhuma", !fechado.questNova && !fechado.globalNovo);
  const cheio = processarDescansoLongoEventos(null, ctx, { dia: 6, sorte: () => 0.99, mundo: W0.mundo, missoes: duas });
  t("o teto cheio: nenhuma, e nem rola", !cheio.questNova && !cheio.bastidor.some((x) => x.rotulo === "Nova missão"));
  const cedo = processarDescansoLongoEventos(null, ctx, { dia: 6, sorte: () => 0.99, mundo: W0.mundo, missoes: [viva(a.id, 5)] });
  t("dentro do intervalo: nenhuma", !cedo.questNova);
  const x1 = processarDescansoLongoEventos(null, ctx, { dia: 6, secundariasAtivas: 0, sorte: rng(hashSemente("sq3|9")), mundo: W0.mundo, missoes: [] });
  const x2 = processarDescansoLongoEventos(null, ctx, { dia: 6, secundariasAtivas: 0, sorte: rng(hashSemente("sq3|9")), mundo: W0.mundo, missoes: [] });
  t("a mesma sorte, a mesma noite", JSON.stringify(x1.questNova) === JSON.stringify(x2.questNova));
  const velho = processarDescansoLongoEventos(null, ctx, { dia: 6, secundariasAtivas: 0, sorte: () => 0.99 });
  t("sem o mundo, o de sempre: o gancho solto, sem plano", !!velho.questNova && !velho.questNova.planeada);
}

sec("7. O lixo e o null");
let semEstouro = true;
const LIXO = [null, undefined, {}, [], "x", 7, { mapa: null }, { mapa: { cidades: "x" } }, { mapa: { cidades: [null, 3, {}] } }, { semente: 3, mapa: { cidades: [{ nome: "Vau" }] } }];
for (const mu of LIXO) for (const es of LIXO) {
  try { const m = planearSecundaria(mu, es, "s"); if (m !== null && typeof m !== "object") semEstouro = false; } catch (e) { semEstouro = false; }
}
t("planearSecundaria: lixo dá null ou missão, nunca estoura", semEstouro);
let semEstouro2 = true;
for (const x of LIXO) {
  try { const r = podeNascerSecundaria(x); if (typeof r.pode !== "boolean" || !r.porque) semEstouro2 = false; } catch { semEstouro2 = false; }
  try { if (lerSecundaria(x) !== null) semEstouro2 = false; } catch { semEstouro2 = false; }
}
t("podeNascerSecundaria e lerSecundaria: lixo não estoura", semEstouro2);
t("uma missão que não é planeada lê-se como nada", lerSecundaria({ id: "sq_a_divida_x", veiculo: "outro" }) === null && lerSecundaria({ id: "m_1", veiculo: T.veiculo }) === null);
t("a semente torta também serve", !!planearSecundaria(W0.mundo, { espinha: W0.espinha, dia: 6 }, null) && !!planearSecundaria(W0.mundo, null, { x: 1 }));
let noiteLixo = true;
try { processarDescansoLongoEventos(null, ctxMundo({ mundo: {}, mapa: W0.mapa, dia: 6 }), null); processarDescansoLongoEventos(null, ctxMundo({ mundo: {}, mapa: W0.mapa, dia: 6 }), { dia: 6, mundo: "x", missoes: "y", historia: 3, sorte: () => 0.5 }); } catch { noiteLixo = false; }
t("a noite com opções tortas não estoura", noiteLixo);

console.log(`\nsecundaria-planeada: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
