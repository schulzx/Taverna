/* jogar-em-node.mjs (Fase T1, trilha B · 27/10) — o jogo em Node

   O alvo da Fase 1 do plano do motor (mente/plano-motor.md): jogar 20
   turnos de um registo real SEM React e SEM rede, com a saída igual à do
   registo. O estado inicial é o "save" da 10.ª sessão de prova
   (`registo-s10-cena.json`: o herói, o grupo, as cidades; o registo de
   gente começa vazio, como no turno 1), a frase de cada turno é a do
   jogador, e a resposta do Narrador é a gravada — a "resposta falsa" que
   nenhuma chamada paga substitui.

   O TURNO, PASSO A PASSO (o que já é puro corre; o que ainda mora no App
   fica PENDENTE e diz quem o traz):

     1. `turno`   — o que anda ANTES de o Mestre responder: a frase que
                    leva o herói a um sítio ou a outra cidade
                    (moverParaLocal, viajar). Mora no App; vira o
                    `src/motor/turno.js` do oficial. Enquanto não existe, a
                    mudança de sítio que só ela explica é lida do registo
                    (o oráculo) e o turno conta como PENDENTE.
     2. a escuta  — `escuta.js#lerOPedido` (puro).
     3. EM CENA   — `em-cena.js#montarEmCena` (puro), com a gente da pauta
                    do registo como entrada (presentes/longe ainda são do
                    App) e a lista de antes encadeada turno a turno.
     4. `aplicar` — a resposta do Narrador sobre o estado. Mora no App
                    (`aplicarResposta`) e vira `src/motor/aplicar.js` do
                    oficial: quando o arquivo existir, este passo chama-o
                    — `aplicar(estado, { narrativa, mudancas }, { pedido })`,
                    que devolve `{ estado }` — e o estado dele segue o jogo.
     5. o Cronista — `motor/cronista.js#julgarOCronista` (puro), sobre a
                    proposta do turno refeita do registo do Cronista
                    (`registo-s8-s10-cronista.json`: os nomes que o
                    registo ganhou, o lugar da pauta seguinte), e o
                    `aceito` aplicado como a fiação do App o aplicará.

   A SAÍDA COMPARADA, por turno, contra a pauta que foi de verdade ao
   Narrador: a cidade, o sítio, a gente que o sistema conhece (todos os
   nomes da pauta, à frente e longe, estão no registo do estado) e o
   invariante do EM CENA (ninguém de LONGE na linha). Um turno "joga em
   Node" quando bate sem o oráculo.

   Hoje (27/10): 15 dos 20 turnos jogam em Node; os 5 pendentes são do
   passo 1 (três sítios pela frase, a estrada, e a viagem de Monte Rasa a
   Nova Profundo). A catraca é o número: menos do que 15 é regressão; mais
   é o motor do oficial a chegar, e a linha sobe com ele. Com o `aplicar`
   do oficial na árvore (em voo nesse dia), os 20 turnos já passam por ele
   — desde que a ficha traga as listas que a regra da ficha percorre
   (`inventario`, `habilidades`): sem elas, `regras-jogo.js` estoura. */
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } }
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;
const sem = (x) => String(x == null ? "" : x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

const { lerOPedido } = await import("../src/escuta.js");
const { montarEmCena, EM_CENA_NA_PAUTA } = await import("../src/em-cena.js");
const { estadoDoSave } = await import("../src/estado.js");
const { julgarOCronista } = await import("../src/motor/cronista.js");

/* os passos do oficial: entram quando o arquivo existir */
const opcional = async (arq, nome) => {
  if (!fs.existsSync(new URL(arq, import.meta.url))) return null;
  try { const m = await import(arq); return typeof m[nome] === "function" ? m[nome] : null; } catch (e) { console.log(`  ..  ${arq} existe e não carrega: ${e.message}`); return null; }
};
const TURNO = await opcional("../src/motor/turno.js", "turno");
const APLICAR = await opcional("../src/motor/aplicar.js", "aplicar");

const R = JSON.parse(fs.readFileSync(new URL("./registo-s10-cena.json", import.meta.url), "utf8"));
const RC = JSON.parse(fs.readFileSync(new URL("./registo-s8-s10-cronista.json", import.meta.url), "utf8"));
const CR = RC.turnos.filter((x) => x.ses === "s10");
const TURNOS = 20;

/* "na Cabra Trêmula, dentro de Monte Rasa" → { lugar, cidade } */
const lerOnde = (onde) => {
  const s = String(onde || "").trim();
  let m = s.match(/^(?:na|no|nas|nos|em) (.+?), dentro de (.+)$/);
  if (m) return { lugar: m[1], cidade: m[2], estrada: false };
  m = s.match(/^em (.+?)(?: \(.+\))?$/);
  if (m) return { lugar: null, cidade: m[1], estrada: false };
  m = s.match(/^(.+?) em (.+)$/);
  if (m) return { lugar: m[1], cidade: m[2], estrada: false };
  return { lugar: null, cidade: null, estrada: /estrada/.test(s) };
};
const cidades = [...new Set(R.pautas.map((p) => p.cidade))];

/* ---------------- O SAVE DE PARTIDA ----------------
   O estado v2 de `estado.js`, a partir do que o registo diz do começo: o
   herói e a companheira, a cidade de chegada, o mapa das cidades que a
   sessão pisou. O registo de gente começa vazio (no turno 1 o sistema
   ainda não conhecia ninguém além da Saoirse, que viaja com ela). */
const inicio = () => estadoDoSave({
  /* a ficha com as listas que a regra da ficha percorre (regras-jogo.js) */
  personagem: { nome: R.heroi, classe: "Guerreiro", nivel: 1, xp: 0, vida: 12, vidaMax: 12, mana: 0, manaMax: 0, moedas: 25, inventario: [], habilidades: [], condicoes: [], equipado: {}, grupo: [{ nome: "Saoirse", vida: 10, vidaMax: 10, habilidades: [], inventario: [] }] },
  cidadeAtual: R.pautas[0].cidade,
  lugar: null,
  jornada: null,
  mapa: { cidades: cidades.map((nome) => ({ nome })) },
  npcs: {},
  canone: {},
  combate: null,
});

/* ---------------- A PROPOSTA DO CRONISTA, REFEITA ----------------
   O registo não guarda o JSON cru: guarda o que o registo conhecia antes e
   depois, e as secções que trouxeram coisa nova. */
const propostaDoTurno = (i) => {
  const a = CR[i], b = CR[i + 1];
  if (!a) return {};
  const prop = {};
  const novos = b ? [...new Set(b.conhecidos)].filter((x) => !a.conhecidos.includes(x) && !cidades.includes(x)) : [];
  const pessoas = novos.map((n) => Object.values(R.npcs).find((x) => sem(x.nome) === sem(n))).filter(Boolean);
  if (pessoas.length) prop.pessoas = pessoas.map((p) => ({ ...p }));
  const coisas = novos.filter((n) => !pessoas.some((p) => sem(p.nome) === sem(n)));
  if (coisas.length) prop.canone = Object.fromEntries(coisas.map((n) => [n, { tipo: "artefato", descricao: "—" }]));
  if (a.util.includes("lugar") && R.pautas[i + 1]) {
    const d = lerOnde(R.pautas[i + 1].onde);
    if (d.cidade) prop.lugar = d.lugar || "cidade";
  }
  return prop;
};

/* ---------------- O ACEITO NO ESTADO ----------------
   O que a fiação do App fará com o `aceito` (o diário de 27/10, T1-B), em
   miniatura: a gente nova no registo, o cânone novo, o lugar. Substitui,
   nunca muta. */
const aplicarOCronista = (E, aceito) => {
  let e = E;
  if (aceito.pessoas) {
    const npcs = { ...e.npcs };
    for (const p of aceito.pessoas) if (!Object.keys(npcs).some((k) => sem(k) === sem(p.nome))) npcs[p.nome] = { ...p };
    e = { ...e, npcs };
  }
  if (aceito.canone) {
    const canone = { ...(e.canone || {}) };
    for (const [n, f] of Object.entries(aceito.canone)) if (!Object.keys(canone).some((k) => sem(k) === sem(n))) canone[n] = { ...f };
    e = { ...e, canone };
  }
  if (aceito.lugar) e = { ...e, lugar: /^cidade$/i.test(aceito.lugar) ? null : { nome: aceito.lugar, distancia: "dentro", cidade: e.cidadeAtual } };
  return e;
};

/* ---------------- UM TURNO ---------------- */
const jogar = async () => {
  let E = inicio();
  let antes = null;
  const log = [];
  for (let i = 0; i < TURNOS; i++) {
    const P = R.pautas[i];
    const passo = { i: i + 1, pendente: [], difere: [] };
    /* 1 · o turno: o que anda antes do Mestre */
    if (TURNO) {
      try { const r = TURNO(E, { frase: P.frase }); if (r && r.estado) E = r.estado; } catch (e) { passo.pendente.push("turno estourou: " + e.message); }
    }
    const alvo = lerOnde(P.onde);
    const sitio = E.lugar && E.lugar.nome ? E.lugar.nome : null;
    const naEstrada = !!E.jornada;
    const bateCidade = !alvo.cidade || sem(E.cidadeAtual) === sem(alvo.cidade);
    const bateSitio = alvo.estrada ? naEstrada : sem(sitio) === sem(alvo.lugar);
    if (!bateCidade || !bateSitio) {
      passo.pendente.push(!bateCidade ? `viagem ${E.cidadeAtual} → ${alvo.cidade} (turno: viajar)` : `sítio ${sitio || "—"} → ${alvo.estrada ? "a estrada" : alvo.lugar || "—"} (turno: moverParaLocal)`);
      /* o oráculo: o registo diz onde o turno a deixou */
      E = { ...E, cidadeAtual: alvo.cidade || E.cidadeAtual, lugar: alvo.lugar ? { nome: alvo.lugar, distancia: "dentro", cidade: alvo.cidade } : null, jornada: alvo.estrada ? { destino: E.cidadeAtual } : null };
    }
    /* a gente que a pauta deste turno nomeia, o sistema tem de a conhecer */
    const grupo = (E.personagem.grupo || []).map((g) => sem(g.nome));
    const nomesDaPauta = [...P.presentes.map((x) => x.nome), ...P.longe].filter((n) => !grupo.includes(sem(n)));
    const conhece = new Set(Object.keys(E.npcs || {}).map(sem));
    const desconhecidos = nomesDaPauta.filter((n) => !conhece.has(sem(n)));
    if (desconhecidos.length) passo.difere.push("gente: " + desconhecidos.join(","));
    /* 2 · a escuta */
    const pedido = lerOPedido(P.frase);
    passo.pedido = { doJogador: pedido.doJogador, pergunta: pedido.pergunta };
    /* 3 · o EM CENA, encadeado */
    const presentes = P.presentes.filter((x) => !/viaja/.test(x.motivo)).map((x) => ({ ...(Object.values(E.npcs || {}).find((n) => sem(n.nome) === sem(x.nome)) || {}), nome: x.nome }));
    const lista = montarEmCena({ semente: "s10", turno: i + 1, cidade: E.cidadeAtual, presentes, longe: P.longe, grupo: (E.personagem.grupo || []).map((g) => ({ nome: g.nome })), comigo: [], mostrado: R.respostas.slice(Math.max(0, i - 2), i), frase: P.frase, lugar: { nome: P.onde }, antes });
    antes = lista;
    const L = new Set(P.longe.map(sem));
    const linha = lista.filter((x) => x.tipo === "pessoa" && x.aqui).slice(0, EM_CENA_NA_PAUTA.pessoa).map((x) => x.nome);
    if (linha.some((g) => L.has(sem(g)))) passo.difere.push("EM CENA com gente de LONGE: " + linha.join(","));
    passo.emCena = linha;
    /* 4 · o aplicar: a resposta do Narrador (a gravada) */
    const resposta = R.respostas[i];
    if (APLICAR) {
      try { const r = APLICAR(E, { narrativa: resposta, mudancas: {} }, { pedido: P.frase, envelopes: "" }); if (r && r.estado) E = r.estado; else passo.avisoDoAplicar = "aplicar não devolveu { estado }"; } catch (e) { passo.avisoDoAplicar = "aplicar estourou: " + e.message; }
    } else passo.aplicar = "pendente (src/motor/aplicar.js ainda não existe)";
    /* 5 · o Cronista: propõe, o motor decide */
    const prop = propostaDoTurno(i);
    const juizo = julgarOCronista(E, prop, { narrativa: resposta, pedido: P.frase });
    passo.cronista = { aceito: Object.keys(juizo.aceito), recusado: juizo.recusado.map((x) => `${x.secao}:${x.porque}`), dito: juizo.ditoPor.map((x) => x.o) };
    E = aplicarOCronista(E, juizo.aceito);
    passo.jogou = !passo.pendente.length && !passo.difere.length;
    log.push(passo);
  }
  return { log, fim: E };
};

/* ============================================================ */
sec(`1. A 10.ª SESSÃO, ${TURNOS} TURNOS, SEM REACT E SEM REDE`);
const um = await jogar();
for (const p of um.log) console.log(`  ..  M${p.i}: ${p.jogou ? "joga" : p.difere.length ? "DIFERE — " + p.difere.join(" · ") : "pendente — " + p.pendente.join(" · ")}${p.cronista.aceito.length ? `  [Cronista: ${p.cronista.aceito.join(",")}${p.cronista.recusado.length ? " / recusa " + p.cronista.recusado.join(",") : ""}${p.cronista.dito.length ? " / dito " + p.cronista.dito.join(",") : ""}]` : ""}`);
const jogados = um.log.filter((p) => p.jogou).length;
const difere = um.log.filter((p) => p.difere.length);
t(`${TURNOS} turnos jogados do princípio ao fim, sem estourar`, um.log.length === TURNOS);
t("nenhum turno com a saída DIFERENTE do registo (a gente, o EM CENA)", difere.length === 0, difere.map((p) => `M${p.i}: ${p.difere.join(" · ")}`).join(" | "));
/* MEDIDA (27/10): 15. Os 5 pendentes são do passo 1 — o `turno` do
   oficial. Quando ele chegar, este número sobe e a linha sobe com ele. */
t(`${jogados} de ${TURNOS} turnos jogam em Node sem o oráculo (a medida de 27/10: 15)`, jogados >= 15, `${jogados}`);
const pend = um.log.filter((p) => p.pendente.length).map((p) => `M${p.i} ${p.pendente.join(" · ")}`);
console.log("  ..  pendentes, e de quem: " + (pend.join(" | ") || "nenhum"));
t("todo pendente diz de quem é", um.log.every((p) => p.pendente.every((x) => /\((turno|aplicar)[:)]|estourou|não devolveu/.test(x))));
/* o aplicar do oficial nasce a meio da fase: se ainda não aceita
   (estado, { narrativa, mudancas }, { pedido }), o passo avisa e não derruba a suíte —
   o número de turnos jogados é que diz se o jogo andou */
if (!APLICAR) t("o aplicar do oficial: pendente — o passo espera src/motor/aplicar.js", um.log.every((p) => /pendente/.test(p.aplicar)));
else {
  const falhas = um.log.filter((p) => p.avisoDoAplicar);
  if (falhas.length) console.log(`  ..  o aplicar existe e ainda não joga (${falhas.length} turnos, que seguem sem ele): ${falhas[0].avisoDoAplicar}`);
  else t("o aplicar do oficial: presente, e os 20 turnos passam por ele", true);
}

sec("2. O FIM DO JOGO — o que o estado sabe ao fim de 20 turnos");
{
  const npcs = Object.keys(um.fim.npcs || {});
  t("o registo de gente do estado tem os três que a sessão conheceu até M20", ["Godfrey da Foz", "Nyla Punho-de-Pedra", "Torvald da Urze"].every((n) => npcs.includes(n)), J(npcs));
  t("o cânone tem o rumor marcado como palavra («o Rei Emprestado acordou, dizem»)", !!(um.fim.canone || {})["Rei Emprestado"] && /dito por/.test(um.fim.canone["Rei Emprestado"].dito || ""), J(um.fim.canone));
  t("o herói acaba no Rossio Torto, em Nova Profundo (como a pauta de M21)", um.fim.cidadeAtual === "Nova Profundo" && um.fim.lugar && um.fim.lugar.nome === lerOnde(R.pautas[TURNOS].onde).lugar, J(um.fim.lugar));
  t("o estado do fim continua um estado v2 (a versão e os campos)", um.fim.versao === 2 && "prometido" in um.fim && "desdeMundo" in um.fim);
}

sec("3. DETERMINISMO — jogar duas vezes dá o mesmo jogo");
{
  const dois = await jogar();
  t("o mesmo registo, o mesmo log e o mesmo estado final", J(dois) === J(um));
}

console.log(`\njogar-em-node: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
