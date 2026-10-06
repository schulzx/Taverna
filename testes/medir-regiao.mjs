/* MEDIR A REGIÃO (MM17, etapa A) — o antes e o depois, em número

   Não é suíte: é a régua. Mede o mapa continental de sempre
   (`gerarGeografia` + `masmorrasDoMundo`) e, quando `src/regiao.js` existe,
   a região delimitada (`gerarRegiao`) sobre as MESMAS sementes, e imprime
   as duas colunas. `teste-regiao.mjs` importa as funções daqui e guarda os
   números como catraca; este arquivo só mede e não falha nunca.

   Fica fora do `npm test` de propósito: `rodar-tudo.mjs` corre `teste-*` e
   `check-*`, e `medir-*` não é nenhum dos dois.

   As perguntas (a ordem é a do pedido da MM17):
     (a) a que distância da base (e da "cidade próxima") ficam as masmorras,
         em km e em horas de marcha — a pessoa citou 168 km de mediana;
     (b) quantos lugares da espinha (início, meio, fim, segredo) caem a mais
         de um dia de viagem da base;
     (c) quantos lugares têm FICHA (quem está, a ida, o perigo, a planta);
     (d) quanto pesa o ONDE e a seção MASMORRA lá dentro, e quanto do que
         vai junto é "locais da cidade" (o `resumoDaqui` e os arredores);
     (e) o pior caso do prompt (`teste-prompt.mjs`, a PIOR CENA REAL);
     e o tamanho do elenco (24) e os moldes fora do beta.

   Uso: node testes/medir-regiao.mjs [N]   (N mundos por molde; 60 se omitido) */

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import { gerarGeografia } from "../src/geografia.js";
import { MOLDES } from "../src/moldes.js";
import { generosDisponiveis } from "../src/nomes.js";
import { masmorrasDoMundo, locaisDaCidade, resumoDaqui } from "../src/mundo-base.js";
import { resumoArredoresPrompt } from "../src/arredores.js";
import { estenderEspinha } from "../src/saga.js";
import { ESTRUTURAS } from "../src/historia.js";
import { segredosGuardados } from "../src/segredo-guardado.js";
import { elencoDoMundo } from "../src/elenco.js";
import { guildasDoMundo } from "../src/guildas.js";
import { kmEntre } from "../src/coordenadas.js";
import { rotaAteAMasmorra, lugarAoEntrarNaMasmorra } from "../src/boca.js";
import { HORAS_MARCHA_POR_DIA } from "../src/viagem.js";
import { gerarMasmorra, masmorraParaPauta } from "../src/masmorras.js";
import { linhaDoLugar } from "../src/geografo.js";
import { hashSemente, rng } from "../src/semente.js";

const AQUI = dirname(fileURLToPath(import.meta.url));
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^(o|a|os|as)\s+/, "").trim();
const GENEROS = generosDisponiveis();
export const sementeDe = (i) => `regiao|${i}|${GENEROS[i % GENEROS.length]}`;
export const generoDe = (i) => GENEROS[i % GENEROS.length];

/* ---------------- os números ---------------- */
export const mediana = (xs) => { const a = [...xs].filter(Number.isFinite).sort((x, y) => x - y); if (!a.length) return NaN; const k = Math.floor(a.length / 2); return a.length % 2 ? a[k] : (a[k - 1] + a[k]) / 2; };
export const maximo = (xs) => Math.max(...xs.filter(Number.isFinite));
const pct = (a, b) => (b ? `${Math.round((a / b) * 1000) / 10}%` : "—");
const r1 = (n) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : n);

/* as horas de uma ida pela régua da boca da masmorra (a que o jogo cobra) */
export function horasAte(destino, origem) {
  const r = rotaAteAMasmorra(destino, origem);
  if (!r) return NaN;
  return r.modo === "a_pe" ? r.minutos / 60 : r.dias * HORAS_MARCHA_POR_DIA;
}

/* dias de estrada da base a cada cidade, pelas rotas do mapa (Dijkstra) */
export function diasPelasRotas(mapa, origem) {
  const dist = { [norm(origem)]: 0 };
  const feitos = new Set();
  const rotas = (mapa && mapa.rotas) || [];
  for (;;) {
    let u = null;
    for (const k of Object.keys(dist)) if (!feitos.has(k) && (u === null || dist[k] < dist[u])) u = k;
    if (u === null) break;
    feitos.add(u);
    for (const r of rotas) {
      const a = norm(r.de), b = norm(r.para);
      const v = a === u ? b : b === u ? a : null;
      if (v === null) continue;
      const d = dist[u] + (Number(r.dias) || 0);
      if (!(v in dist) || d < dist[v]) dist[v] = d;
    }
  }
  return dist;
}

/* a cidade onde um marco acontece: o nome é uma cidade, um local de uma
   cidade, ou um lugar da região (que tem a sua ida própria) */
function ondeDoMarco(mapa, semente, genero, molde, onde) {
  const k = norm(onde);
  const c = (mapa.cidades || []).find((x) => norm(x.nome) === k);
  if (c) return { cidade: c };
  const l = ((mapa.regiao && mapa.regiao.lugares) || []).find((x) => norm(x.nome) === k);
  if (l) return { lugar: l };
  for (const cc of mapa.cidades || []) {
    if (locaisDaCidade(semente, cc, genero, molde).some((x) => norm(x.nome) === k)) return { cidade: cc };
  }
  return null;
}

/* a pauta lá dentro: o ONDE e a seção MASMORRA à entrada de uma planta do
   tamanho anunciado, e os "locais da cidade" que o App manda junto (o
   `resumoDaqui` da cidade de referência e os arredores dela) */
function pautaLaDentro(mapa, semente, genero, molde, m, i) {
  const acaso = Math.random;
  Math.random = rng(hashSemente(`medir-regiao|${semente}|${m.nome}`));
  let mm;
  try { mm = gerarMasmorra(genero, m.nivel, m.nome, { salas: m.salas }); } finally { Math.random = acaso; }
  const lugar = lugarAoEntrarNaMasmorra(m, { cidade: m.cidadeProxima });
  const onde = linhaDoLugar({ masmorra: mm, lugar, cidadeAtual: m.cidadeProxima, mapa });
  const secao = masmorraParaPauta(mm);
  const cidade = (mapa.cidades || []).find((c) => c.nome === m.cidadeProxima);
  const daqui = resumoDaqui(semente, mapa, m.cidadeProxima, null, genero, molde) || "";
  const arred = cidade ? resumoArredoresPrompt(semente, cidade) || "" : "";
  return { onde: onde.length, secao: secao.join("\n").length, locaisDaCidade: daqui.length + arred.length };
}

/* ---------------- uma medida, para um gerador de mapa ---------------- */
export function medir(gerar, { N = 60, molde = "sobremundo", pautas = 2 } = {}) {
  const M = { mundos: 0, kmBase: [], kmProxima: [], horasBase: [], piorHorasPorMundo: [],
    espinha: { inicio: [0, 0], meio: [0, 0], fim: [0, 0], segredo: [0, 0], semLugar: 0 },
    ficha: { lugares: 0, comFicha: 0, cidades: 0, cidadesComBase: 0 },
    pauta: { onde: [], secao: [], locaisDaCidade: [] }, elenco: [], masmorrasPorMundo: [] };
  for (let i = 0; i < N; i++) {
    const semente = sementeDe(i), genero = generoDe(i);
    const mapa = gerar(semente, molde, genero, i);
    if (!mapa || !(mapa.cidades || []).length) continue;
    M.mundos++;
    const base = mapa.regiao ? mapa.cidades.find((c) => c.nome === mapa.regiao.base.nome) : mapa.cidades[0];
    const mms = masmorrasDoMundo(semente, mapa);
    M.masmorrasPorMundo.push(mms.length);
    let pior = 0;
    for (const m of mms) {
      M.kmBase.push(kmEntre(base, m));
      const prox = mapa.cidades.find((c) => c.nome === m.cidadeProxima);
      if (prox) M.kmProxima.push(kmEntre(prox, m));
      const h = horasAte(m, base);
      M.horasBase.push(h);
      pior = Math.max(pior, h);
    }
    M.piorHorasPorMundo.push(pior);

    /* (b) a espinha */
    const estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id;
    const espinha = estenderEspinha({ semente, mapa, genero, molde, estrutura, cidadeInicial: base.nome });
    const dias = diasPelasRotas(mapa, base.nome);
    const segredos = new Set(segredosGuardados(espinha).map((s) => s.id));
    const n = espinha.atos.length;
    espinha.atos.forEach((a, k) => {
      const papel = k === 0 ? "inicio" : k === n - 1 ? "fim" : "meio";
      for (const mk of a.marcos) {
        const o = ondeDoMarco(mapa, semente, genero, molde, mk.onde);
        if (!o) { M.espinha.semLugar++; continue; }
        const d = o.cidade ? (dias[norm(o.cidade.nome)] ?? Infinity) : horasAte(o.lugar, base) / HORAS_MARCHA_POR_DIA;
        const longe = d > 1 ? 1 : 0;
        M.espinha[papel][0] += longe; M.espinha[papel][1]++;
        if (segredos.has(mk.id)) { M.espinha.segredo[0] += longe; M.espinha.segredo[1]++; }
      }
    });

    /* (c) a ficha: quem está, a ida, o perigo e a planta */
    for (const m of mms) {
      M.ficha.lugares++;
      const l = mapa.regiao ? mapa.regiao.lugares.find((x) => x.id === m.id) : null;
      const f = l && l.ficha;
      if (f && Array.isArray(f.quem) && f.quem.length && Number.isFinite(f.horas) && f.perigo && Number(l.salas) > 0) M.ficha.comFicha++;
    }
    for (const c of mapa.cidades) { M.ficha.cidades++; if (locaisDaCidade(semente, c, genero, molde).length) M.ficha.cidadesComBase++; }

    /* (d) a pauta lá dentro, nas primeiras masmorras do mundo */
    for (const m of mms.slice(0, pautas)) {
      const p = pautaLaDentro(mapa, semente, genero, molde, m, i);
      M.pauta.onde.push(p.onde); M.pauta.secao.push(p.secao); M.pauta.locaisDaCidade.push(p.locaisDaCidade);
    }

    /* o elenco */
    try {
      const guildas = guildasDoMundo(semente, mapa, genero);
      M.elenco.push(elencoDoMundo(semente, mapa, { genero, molde, espinha, guildas }).pessoas.length);
    } catch { M.elenco.push(0); }
  }
  return M;
}

export const continental = (semente, molde) => gerarGeografia(semente, molde);

/* (e) a PIOR CENA REAL, lida da suíte que a guarda */
export function piorCenaReal() {
  const r = spawnSync(process.execPath, [join(AQUI, "teste-prompt.mjs")], { encoding: "utf8", cwd: AQUI, timeout: 120000 });
  const m = /PIOR CENA REAL: (\d+)/.exec(r.stdout || "");
  return m ? Number(m[1]) : NaN;
}

function resumo(rotulo, M) {
  const e = M.espinha;
  return [
    `  ${rotulo}  (${M.mundos} mundos)`,
    `    masmorras por mundo: mediana ${mediana(M.masmorrasPorMundo)}, de ${Math.min(...M.masmorrasPorMundo)} a ${maximo(M.masmorrasPorMundo)}`,
    `    (a) km base → masmorra: mediana ${r1(mediana(M.kmBase))}, máx ${r1(maximo(M.kmBase))}`,
    `        km cidade próxima → masmorra: mediana ${r1(mediana(M.kmProxima))}, máx ${r1(maximo(M.kmProxima))}`,
    `        horas base → masmorra: mediana ${r1(mediana(M.horasBase))}, máx ${r1(maximo(M.horasBase))}  · mundos com alguma > 1 dia (${HORAS_MARCHA_POR_DIA} h): ${M.piorHorasPorMundo.filter((h) => h > HORAS_MARCHA_POR_DIA).length}/${M.mundos}`,
    `    (b) marcos da espinha a > 1 dia da base: início ${e.inicio[0]}/${e.inicio[1]} · meio ${e.meio[0]}/${e.meio[1]} (${pct(e.meio[0], e.meio[1])}) · fim ${e.fim[0]}/${e.fim[1]} (${pct(e.fim[0], e.fim[1])}) · segredo ${e.segredo[0]}/${e.segredo[1]} (${pct(e.segredo[0], e.segredo[1])}) · sem lugar ${e.semLugar}`,
    `    (c) lugares com ficha (quem, ida, perigo, planta): ${M.ficha.comFicha}/${M.ficha.lugares} (${pct(M.ficha.comFicha, M.ficha.lugares)}) · cidades com base do mundo: ${M.ficha.cidadesComBase}/${M.ficha.cidades}`,
    `    (d) lá dentro: ONDE mediana ${mediana(M.pauta.onde)} · seção MASMORRA ${mediana(M.pauta.secao)} · "locais da cidade" que vão junto: mediana ${mediana(M.pauta.locaisDaCidade)}, máx ${maximo(M.pauta.locaisDaCidade)}`,
    `    elenco: mediana ${mediana(M.elenco)}, de ${Math.min(...M.elenco)} a ${maximo(M.elenco)} (cheio = 24: ${M.elenco.filter((x) => x >= 24).length}/${M.elenco.length})`,
  ].join("\n");
}

/* ---------------- quando corre sozinho ---------------- */
if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const N = Number(process.argv[2]) || 60;
  console.log(`MEDIR A REGIÃO — N=${N} mundos por molde\n`);
  console.log("ANTES — o continente (gerarGeografia + masmorrasDoMundo)");
  for (const m of MOLDES) console.log(resumo(`molde ${m.id}${m.id === "sobremundo" ? " (o do beta)" : ""}`, medir(continental, { N, molde: m.id })));
  const caminho = join(AQUI, "..", "src", "regiao.js");
  if (existsSync(caminho)) {
    const { gerarRegiao } = await import(pathToFileURL(caminho).href);
    const regiao = (semente, molde, genero, i) => gerarRegiao({ semente, molde, genero, estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id });
    console.log("\nDEPOIS — a região delimitada (gerarRegiao), as mesmas sementes");
    console.log(resumo("molde sobremundo", medir(regiao, { N, molde: "sobremundo" })));
    for (const m of MOLDES.filter((x) => x.id !== "sobremundo")) console.log(`  molde ${m.id}: ${gerarRegiao({ semente: sementeDe(0), molde: m.id }) === null ? "sem região (fica o mapa de sempre)" : "COM região"}`);
  }
  console.log(`\n(e) a PIOR CENA REAL do prompt (teste-prompt.mjs): ${piorCenaReal()} caracteres (o teto é 82.000)`);
}
