/* A MEDIDA DA LEITORA — passo 3: a conta. Lê itens.json, as respostas da IA
   (respostas-*.jsonl), a leitura do ouvido na bancada (ouvido/*.json, gravados
   por bancada.mjs --json) e, no treino, chama oOuvido(frase, cena) direto.
   Não chama IA nenhuma. Escreve resultado.json e imprime as tabelas.

   AS TRÊS COLUNAS:
   · ouvido   — o ouvido de hoje (bancada: a linha «[o ouvido]» do jogo real).
   · ia       — a IA sozinha (sem resposta válida conta como «não sei»: na
                coluna da IA é erro; no composto, cai no ouvido).
   · composto — a IA decide «pede troca ou não»; a família fina é a do ouvido
                quando concorda, «trocar» quando a IA diz troca, e a família
                grossa da IA quando ela diz que não é troca e o ouvido dizia que era.

   A PROJEÇÃO NA NOTA (só bancada; nota = tipo E ficha batendo, julgar.mjs):
   · IA diz «não é troca» e o ouvido lia troca → o sistema daria «nada» e a
     ficha não mexe: passa sse o gabarito aceita «nada» com a ficha parada.
     É CERTO (não depende do resto do sistema).
   · IA diz «troca» e o ouvido lia outra coisa → POSSÍVEL: a frase entra no
     caminho da troca, e o resultado depende de o resto (quem, coisa, posse,
     tipo pela forma) lê-la bem. Conta como conserto possível se o gabarito é
     troca, e como quebra possível se não é.
   · IA e ouvido concordam, ou a IA não respondeu → a nota fica como está.

   Uso: node testes/medida-da-leitora/analisar.mjs */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "..", "..");
const { oOuvido } = await import(pathToFileURL(path.join(RAIZ, "src", "o-ouvido.js")).href);
const { PRECOS } = await import(pathToFileURL(path.join(RAIZ, "src", "custo.js")).href);

const itens = JSON.parse(fs.readFileSync(path.join(AQUI, "itens.json"), "utf8"));
const lerJsonl = (f) => { try { return fs.readFileSync(path.join(AQUI, f), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } };
const chave = (r) => r.conjunto + "|" + r.id;
const ultimaBoa = (lista) => { const m = {}; for (const r of lista) if (r.status === 200 || !m[chave(r)]) m[chave(r)] = r; return m; };
const todasMin = lerJsonl("respostas-minima.jsonl"), todasRica = lerJsonl("respostas-rica.jsonl");
const IA = ultimaBoa(todasMin), RICA = ultimaBoa(todasRica);

const ARQ_BANCADA = { "bancada-98": "frases.json", "novas-50": "frases-novas.json", "ineditas-60": "frases-ineditas-3.json", "posse-10": "frases-da-posse.json" };
const FRASES = {}, BANC = {};
for (const [cj, arq] of Object.entries(ARQ_BANCADA)) {
  for (const f of JSON.parse(fs.readFileSync(path.join(RAIZ, "testes", "bancada-da-troca", arq), "utf8")).frases) FRASES[cj + "|" + f.id] = f;
  try { for (const r of JSON.parse(fs.readFileSync(path.join(AQUI, "ouvido", arq), "utf8"))) BANC[cj + "|" + r.id] = r; } catch { /* a bancada deste lote ainda não rodou */ }
}
/* 18 frases do lote de 98 caíram num erro da própria bancada (o Edge negou o
   localStorage à página a meio da rodada: L08–L19, X01–X09), não do ouvido; foram
   refeitas à parte com --so (ouvido/frases-refeitas.json) e a refeita vale.
   Resultado de bancada com `erro` não entra em conta nenhuma. */
try { for (const r of JSON.parse(fs.readFileSync(path.join(AQUI, "ouvido", "frases-refeitas.json"), "utf8"))) if (!r.erro) BANC["bancada-98|" + r.id] = r; } catch { /* sem refeitas */ }
for (const k of Object.keys(BANC)) if (BANC[k].erro) delete BANC[k];
const treinoCena = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(RAIZ, "testes", "treino-das-intencoes.json"), "utf8")).itens.map((i) => [i.id, i.cena]));

const GROSSA = { trocar: "pede_troca", falar: "fala", convencer: "fala", perguntar_ao_mestre: "fala", olhar: "outra_acao", mover: "outra_acao", usar: "outra_acao", agir: "outra_acao", lutar: "outra_acao", esperar: "outra_acao" };
const FINA_DA_GROSSA = { fala: "falar", outra_acao: "agir", pede_troca: "trocar" };

/* cada item com as três leituras */
const linhas = itens.map((it) => {
  const k = chave(it);
  const ia = IA[k] || null;
  const rotIa = ia && ia.status === 200 ? ia.rotulo : null;
  let famOuv = null, banc = null;
  if (it.conjunto === "treino-150") famOuv = oOuvido(it.frase, treinoCena[it.id]).familia || null;
  else { banc = BANC[k] || null; famOuv = banc ? (banc.ouvido ? banc.ouvido.familia : (banc.tipo && banc.tipo !== "nada" ? "trocar" : null)) : undefined; }
  const ouvTroca = famOuv === undefined ? null : famOuv === "trocar";
  const iaTroca = rotIa == null ? null : rotIa === "pede_troca";
  const compTroca = iaTroca == null ? ouvTroca : iaTroca;
  let famComp = famOuv;
  if (iaTroca === true) famComp = "trocar";
  else if (iaTroca === false && famOuv === "trocar") famComp = FINA_DA_GROSSA[rotIa];
  const rica = RICA[k] && RICA[k].status === 200 ? RICA[k].rotulo : undefined;
  return { ...it, famOuv, ouvTroca, rotIa, iaTroca, compTroca, famComp, rica, banc, bruto: ia ? ia.bruto : null };
});

/* precisão e revocação de «pede troca?» (o ambíguo fica fora; «não sei» da IA é erro dela) */
function pr(ls, campo) {
  const g = ls.filter((l) => l.troca !== null);
  let vp = 0, fp = 0, fn = 0, ac = 0, sem = 0;
  for (const l of g) {
    const v = l[campo];
    if (v == null) { sem++; if (l.troca) fn++; continue; }
    if (v && l.troca) vp++; else if (v && !l.troca) fp++; else if (!v && l.troca) fn++;
    if (v === l.troca) ac++;
  }
  return { n: g.length, acerto: ac, precisao: vp + fp ? vp / (vp + fp) : null, revocacao: vp + fn ? vp / (vp + fn) : null, semResposta: sem };
}
const pct = (x) => x == null ? "—" : (100 * x).toFixed(0) + "%";

/* a nota projetada de um lote da bancada */
function projecao(ls) {
  const out = { n: 0, hoje: 0, certoConserta: [], certoQuebra: [], possivelConserta: [], possivelQuebra: [], naoDepende: [], semBancada: 0 };
  for (const l of ls) {
    const b = l.banc, f = FRASES[chave(l)];
    if (!b) { out.semBancada++; continue; }
    out.n++;
    const ok = !!(b.julgamento && b.julgamento.ok);
    if (ok) out.hoje++;
    const lista = Array.isArray(f.tipo) ? f.tipo : [f.tipo];
    const fichaParadaOk = f.ficha === null || (f.fichaPorTipo && f.fichaPorTipo.nada !== undefined ? Object.keys(f.fichaPorTipo.nada || {}).length === 0 : Object.keys(f.ficha || {}).length === 0);
    const nadaPassa = lista.includes("nada") && fichaParadaOk;
    if (l.iaTroca === false && l.ouvTroca === true) {
      if (!ok && nadaPassa) out.certoConserta.push(l.id);
      else if (ok && !nadaPassa) out.certoQuebra.push(l.id);
      else if (!ok) out.naoDepende.push(l.id);
    } else if (l.iaTroca === true && l.ouvTroca === false) {
      if (!ok && l.troca !== false) out.possivelConserta.push(l.id);
      else if (ok && l.troca === false) out.possivelQuebra.push(l.id);
      else if (!ok) out.naoDepende.push(l.id);
    } else if (!ok) out.naoDepende.push(l.id);
  }
  out.certa = out.hoje + out.certoConserta.length - out.certoQuebra.length;
  out.teto = out.certa + out.possivelConserta.length;
  out.piso = out.certa - out.possivelQuebra.length;
  return out;
}

const CONJ = ["ineditas-60", "bancada-98", "novas-50", "posse-10", "treino-150"];
const resultado = { conjuntos: {}, custo: null };
console.log("=== «pede troca?» (n sem os ambíguos) — acerto · precisão · revocação ===");
console.log("conjunto        n   | ouvido               | IA sozinha           | composto");
for (const cj of CONJ) {
  const ls = linhas.filter((l) => l.conjunto === cj);
  const o = pr(ls, "ouvTroca"), a = pr(ls, "iaTroca"), c = pr(ls, "compTroca");
  const fmt = (m) => `${String(m.acerto).padStart(3)} ${pct(m.precisao).padStart(4)} ${pct(m.revocacao).padStart(4)}${m.semResposta ? ` s/r ${m.semResposta}` : ""}`.padEnd(20);
  console.log(`${cj.padEnd(14)} ${String(o.n).padStart(3)}  | ${fmt(o)} | ${fmt(a)} | ${fmt(c)}`);
  resultado.conjuntos[cj] = { ouvido: o, ia: a, composto: c };
  if (cj === "ineditas-60") {
    const rr = ls.map((l) => ({ ...l, ricaTroca: l.rica == null ? null : l.rica === "trocar" }));
    const r = pr(rr, "ricaTroca");
    console.log(`${"  (IA rica)".padEnd(14)} ${String(r.n).padStart(3)}  |                      | ${fmt(r)} |`);
    resultado.conjuntos[cj].iaRica = r;
  }
}

/* família, no treino (o único com família no gabarito) */
{
  const ls = linhas.filter((l) => l.conjunto === "treino-150");
  const n = ls.length;
  const fino = (campo) => ls.filter((l) => l[campo] === l.familia).length;
  const grosso = (fn) => ls.filter((l) => fn(l) === GROSSA[l.familia]).length;
  const fam = {
    fina: { ouvido: fino("famOuv"), composto: fino("famComp") },
    grossa: { ouvido: grosso((l) => GROSSA[l.famOuv]), ia: grosso((l) => l.rotIa), composto: grosso((l) => GROSSA[l.famComp]) },
    n,
  };
  resultado.conjuntos["treino-150"].familia = fam;
  console.log(`\n=== família no treino (${n}) ===`);
  console.log(`fina (10 famílias):  ouvido ${fam.fina.ouvido} · composto ${fam.fina.composto} · IA (lista mínima não dá família fina) —`);
  console.log(`grossa (troca/fala/outra): ouvido ${fam.grossa.ouvido} · IA ${fam.grossa.ia} · composto ${fam.grossa.composto}`);
}

/* a projeção */
console.log("\n=== projeção na nota da bancada ===");
for (const cj of ["ineditas-60", "bancada-98", "novas-50", "posse-10"]) {
  const p = projecao(linhas.filter((l) => l.conjunto === cj));
  resultado.conjuntos[cj].projecao = p;
  if (!p.n) { console.log(`${cj}: sem leitura da bancada`); continue; }
  console.log(`${cj}: hoje ${p.hoje}/${p.n} → certa ${p.certa} (conserta ${p.certoConserta.length} [${p.certoConserta.join(" ")}], quebra ${p.certoQuebra.length} [${p.certoQuebra.join(" ")}]) · possível: +${p.possivelConserta.length} [${p.possivelConserta.join(" ")}] / −${p.possivelQuebra.length} [${p.possivelQuebra.join(" ")}] → faixa ${p.piso}–${p.teto} · reprovadas que não dependem da IA: ${p.naoDepende.length}`);
}

/* onde a IA errou e o ouvido acertou */
console.log("\n=== a IA errou «pede troca?» e o ouvido acertou ===");
const errosIa = linhas.filter((l) => l.troca !== null && l.ouvTroca === l.troca && l.iaTroca !== l.troca);
for (const l of errosIa) console.log(`${l.conjunto} ${l.id} gabarito=${l.troca ? "troca" : "não"} IA=${JSON.stringify(l.bruto)} «${l.frase}»`);
console.log("\n=== a IA acertou e o ouvido errou ===");
const acertosIa = linhas.filter((l) => l.troca !== null && l.ouvTroca !== null && l.ouvTroca !== l.troca && l.iaTroca === l.troca);
for (const l of acertosIa) console.log(`${l.conjunto} ${l.id} gabarito=${l.troca ? "troca" : "não"} «${l.frase}»`);
console.log("\n=== os dois erraram ===");
for (const l of linhas.filter((l) => l.troca !== null && l.ouvTroca !== null && l.ouvTroca !== l.troca && l.iaTroca !== l.troca)) console.log(`${l.conjunto} ${l.id} gabarito=${l.troca ? "troca" : "não"} IA=${JSON.stringify(l.bruto)} «${l.frase}»`);

/* custo e latência */
{
  const todas = [...todasMin, ...todasRica];
  const boas = todas.filter((r) => r.status === 200 && r.uso);
  const modelos = {};
  for (const r of boas) modelos[r.uso.modelo] = (modelos[r.uso.modelo] || 0) + 1;
  const media = (a) => a.reduce((s, x) => s + x, 0) / (a.length || 1);
  const ms = boas.map((r) => r.ms).sort((a, b) => a - b);
  const ent = media(boas.map((r) => r.uso.entrada)), sai = media(boas.map((r) => r.uso.saida)), cac = media(boas.map((r) => r.uso.cache || 0));
  const preco = (p) => ((ent - cac) * p.entrada + cac * p.cache + sai * p.saida) / 1e6;
  const custo = {
    chamadas: todas.length, boas: boas.length, foraDaLista: todas.filter((r) => r.status === 200 && r.rotulo == null).length,
    erros: todas.filter((r) => r.status !== 200).length, modelos,
    entradaMedia: Math.round(ent), cacheMedio: Math.round(cac), saidaMedia: +sai.toFixed(1),
    latencia: { media: Math.round(media(ms)), mediana: ms[Math.floor(ms.length / 2)], p95: ms[Math.floor(ms.length * 0.95)], pior: ms[ms.length - 1] },
    porChamada: { "deepseek-v4-flash": preco(PRECOS["deepseek-v4-flash"]), "gemini-3.5-flash-lite": preco(PRECOS["gemini-3.5-flash-lite"]) },
  };
  resultado.custo = custo;
  console.log("\n=== custo e latência ===");
  console.log(JSON.stringify(custo, null, 1));
  console.log(`por 1.000 turnos: deepseek-v4-flash US$ ${(custo.porChamada["deepseek-v4-flash"] * 1000).toFixed(4)} · gemini-3.5-flash-lite US$ ${(custo.porChamada["gemini-3.5-flash-lite"] * 1000).toFixed(4)}`);
}

resultado.porItem = linhas.map(({ banc, cena, ...l }) => ({ ...l, notaHoje: banc && banc.julgamento ? banc.julgamento.ok : null, tipoHoje: banc ? banc.tipo : null }));
fs.writeFileSync(path.join(AQUI, "resultado.json"), JSON.stringify(resultado, null, 1) + "\n");
