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
import { resumoMapaParaPrompt, resumoDiplomacia } from "../src/mapa.js";
import { moldePorId } from "../src/moldes.js";
import * as G from "../src/geografia.js";

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

/* as horas de uma ida pela régua da boca da masmorra (a que o jogo cobra).
   MM17 C1: com `regiao` (o `mapa.regiao`), a régua da região — a ida pelo
   chão (boca.js, IDA_NA_REGIAO), que é a que o jogo cobra nesse mapa; sem
   ele, a de sempre (o continente mede igual ao que media). */
export function horasAte(destino, origem, regiao) {
  const r = rotaAteAMasmorra(destino, origem, regiao ? { regiao } : undefined);
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
      const h = horasAte(m, base, mapa.regiao);
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
        const d = o.cidade ? (dias[norm(o.cidade.nome)] ?? Infinity) : horasAte(o.lugar, base, mapa.regiao) / HORAS_MARCHA_POR_DIA;
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

/* ---------------- (f) a criação (MM17, etapa B) ----------------
   Os mundos que o App cria de verdade: `mapaDaCriacao` (a escolha região
   ou continente) e `mapaDaCampanhaNova` (o mapaRef). Pergunta: quantos
   nascem com região, por molde e por modo; a que distância da base fica a
   masmorra mais longe de cada mundo; quanto pesa o texto do mapa no system
   prompt (o `mapaInfo` que o App monta com resumoMapaParaPrompt +
   resumoDiplomacia: na criação e com o mapa todo aberto, o pior caso); e
   quantas bases acordariam o cão de um passo pela régua antiga. */
export function medirCriacao(R, N = 60) {
  const out = ["(f) A CRIAÇÃO — mapaDaCriacao + mapaDaCampanhaNova (o que o App chama)"];
  const info = (m) => (resumoMapaParaPrompt(m, "") + "\n" + resumoDiplomacia(m, "")).trim().length;
  const aberto = (m) => ({ ...m, cidades: m.cidades.map((c) => ({ ...c, descoberta: true })) });
  for (const m of MOLDES) {
    for (const modo of ["historia", "rapida", "duelo"]) {
      let com = 0;
      for (let i = 0; i < N; i++) if (R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente: sementeDe(i), molde: moldePorId(m.id), genero: generoDe(i), modo })).regiao) com++;
      if (m.id === "sobremundo" || modo === "historia") out.push(`    molde ${m.id} · modo ${modo}: ${com}/${N} com região`);
    }
  }
  const longeKm = [], longeH = [], infoR = { ini: [], aberto: [] }, infoC = { ini: [], aberto: [] };
  let acordava = 0, acordaHoje = 0;
  for (let i = 0; i < N; i++) {
    const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id;
    const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde: moldePorId("sobremundo"), genero, estrutura, modo: "historia" }));
    const cont = R.mapaDaCampanhaNova(gerarGeografia(semente, moldePorId("sobremundo")));
    const base = mapa.cidades[0];
    const mms = masmorrasDoMundo(semente, mapa);
    longeKm.push(Math.max(...mms.map((x) => kmEntre(base, x))));
    longeH.push(Math.max(...mms.map((x) => horasAte(x, base, mapa.regiao))));
    infoR.ini.push(info(mapa)); infoR.aberto.push(info(aberto(mapa)));
    infoC.ini.push(info(cont)); infoC.aberto.push(info(aberto(cont)));
    if (G.vizinhosDeUmPasso(mapa, base.nome, G.DIAS_DE_UM_PASSO).length) acordava++;
    if (G.vizinhosDeUmPasso(mapa, base.nome).length || G.saidasDeUmPassoPrompt(mapa, base.nome)) acordaHoje++;
  }
  out.push(`    a masmorra mais longe da base, por mundo: mediana ${r1(mediana(longeKm))} km (${r1(mediana(longeH))} h), máx ${r1(maximo(longeKm))} km (${r1(maximo(longeH))} h)`);
  out.push(`    o texto do mapa no system prompt — região: na criação mediana ${mediana(infoR.ini)}, máx ${maximo(infoR.ini)}; aberto mediana ${mediana(infoR.aberto)}, máx ${maximo(infoR.aberto)}`);
  out.push(`                                      continente: na criação mediana ${mediana(infoC.ini)}, máx ${maximo(infoC.ini)}; aberto mediana ${mediana(infoC.aberto)}, máx ${maximo(infoC.aberto)}`);
  out.push(`    o cão de um passo na base: pela régua antiga acordaria em ${acordava}/${N}; com tetoDeUmPasso, ${acordaHoje}/${N}`);
  return out;
}

/* ---------------- (g) a história amarrada (MM17, etapa C1) ----------------
   O que a campanha NOVA de região cria de verdade: `gerarRegiao`, a espinha
   estendida e `espinhaNaRegiao` por cima (o que o App faz na criação). As
   perguntas do pedido da C1:
     (a) os lugares da espinha (início, meio, fim, segredo) dentro da região;
     (b) os atos sem marcos que os pesem — a espinha estendida sozinha (o
         antes) e amarrada (o depois);
     (c) os ganchos que apontam para um lugar com ficha: a abertura (a
         origem da pequena história do lugar), o mural (o ermo das caçadas
         e pragas) e os boatos (os lugares que a base cita no turno);
     (d) as idas base → lugar e lugar → lugar, em horas, e quantas
         contradizem a ficha;
   e, para comparar, as mesmas perguntas no continente (sem região). */
export async function medirHistoria(R, N = 60) {
  const { custoDaEtapa, pesoDe } = await import("../src/historia.js");
  const { feitioDe } = await import("../src/saga.js");
  const { abrirAbertura } = await import("../src/abertura.js");
  const { ofertasDaqui } = await import("../src/ofertas.js");
  const { amarrarEspinha } = R;
  const M = {
    mundos: 0,
    dentro: [0, 0], segredo: [0, 0], atosNoLugar: [0, 0], fechoNoClimax: 0,
    curtos: { antes: [0, 0], depois: [0, 0], continente: [0, 0] },
    abertura: { regiao: [0, 0], continente: [0, 0] },
    mural: { regiao: [0, 0], continente: [0, 0] },
    boatos: { regiao: [0, 0], continente: [0, 0] },
    idaBase: [], idaEntre: [], contradiz: 0, idas: 0, daqui: { regiao: [], continente: [] },
  };
  const curtos = (esp, est, alvo) => esp.atos.forEach((a, k) => {
    alvo[1]++;
    if (a.marcos.reduce((s, m) => s + pesoDe(feitioDe(m.feitio).peso), 0) < custoDaEtapa(est, k)) alvo[0]++;
  });
  const fichaDe = (mapa, nome) => ((mapa.regiao && mapa.regiao.lugares) || []).find((l) => l.ficha && norm(l.nome) === norm(nome)) || null;
  for (let i = 0; i < N; i++) {
    const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id;
    const mapa = R.gerarRegiao({ semente, molde: "sobremundo", genero, estrutura });
    const cont = gerarGeografia(semente, moldePorId("sobremundo"));
    if (!mapa || !mapa.regiao) continue;
    M.mundos++;
    const { estruturaPorId } = await import("../src/historia.js");
    const est = estruturaPorId(estrutura);
    for (const [mp, rot] of [[mapa, "regiao"], [cont, "continente"]]) {
      const base = mp.cidades[0];
      const crua = estenderEspinha({ semente, mapa: mp, genero, estrutura, cidadeInicial: base.nome });
      const esp = mp.regiao ? R.espinhaNaRegiao(mp, crua, { semente, genero }) : crua;
      if (mp.regiao) {
        curtos(crua, est, M.curtos.antes); curtos(esp, est, M.curtos.depois);
        const a = amarrarEspinha(mp, esp, { semente, genero });
        M.dentro[1] += a.marcos.length; M.dentro[0] += a.marcos.filter((x) => x.dentro).length;
        const seg = new Set(segredosGuardados(esp).map((s) => s.id));
        for (const x of a.marcos) if (seg.has(x.id)) { M.segredo[1]++; if (x.dentro) M.segredo[0]++; }
        /* cada ato no seu sítio: o início na base, o meio e o fim num lugar da região */
        for (const x of a.atos) { M.atosNoLugar[1]++; if (x.lugar && (x.papel === "inicio" ? x.lugar.nome === mp.regiao.base.nome : !!fichaDe(mp, x.lugar.nome))) M.atosNoLugar[0]++; }
        const ult = esp.atos[esp.atos.length - 1].marcos;
        const fecho = ult[ult.length - 1];
        if (fecho && fecho.feitio === "confronto" && a.climax && norm(fecho.onde) === norm(a.climax.nome)) M.fechoNoClimax++;
      } else curtos(esp, est, M.curtos.continente);
      /* (c) a abertura: a pequena história aponta para um lugar com ficha? */
      const ab = abrirAbertura({ semente, mapa: mp, cidade: base.nome, espinha: esp, estrutura, genero, molde: "sobremundo", nivel: 1, dia: 1 });
      if (ab) { M.abertura[rot][1]++; if (ab.abertura.alvo && fichaDe(mp, ab.abertura.alvo.origem)) M.abertura[rot][0]++; }
      /* o mural: o ermo das caçadas e pragas (onde a presa está) */
      for (const c of mp.cidades.slice(0, 3)) {
        for (const of of ofertasDaqui({ semente, mapa: mp, cidade: c.nome, base: null, genero, nivel: 3, quantas: 12 })) {
          for (const e of of.etapas) {
            /* só o trabalho que aponta para um sítio (a caçada e a praga, que
               dizem ONDE está a presa); o resgate não diz, e não conta */
            if (e.tipo !== "derrotar" || !e.onde) continue;
            M.mural[rot][1]++;
            if (e.onde && fichaDe(mp, e.onde)) M.mural[rot][0]++;
          }
        }
      }
      /* os boatos: os lugares que a base cita no turno, pelo nome, e com ficha */
      const daqui = resumoDaqui(semente, mp, base.nome, null, genero) || "";
      M.daqui[rot].push(daqui.length);
      for (const m of masmorrasDoMundo(semente, mp)) { M.boatos[rot][1]++; if (daqui.includes(m.nome) && fichaDe(mp, m.nome)) M.boatos[rot][0]++; }
    }
    /* (d) as idas — base → lugar e lugar → lugar, contra a ficha */
    const base = mapa.cidades[0];
    for (const l of mapa.regiao.lugares) {
      const h = horasAte(l, base, mapa.regiao);
      M.idaBase.push(h); M.idas++;
      if (Math.abs(h - l.ficha.horas) > 0.01) M.contradiz++;
      for (const v of l.ficha.vizinhos) {
        const alvo = mapa.regiao.lugares.find((x) => x.id === v.id) || mapa.cidades.find((c) => c.nome === v.id);
        const hv = horasAte(alvo, l, mapa.regiao);
        M.idas++;
        if (Math.abs(hv - v.horas) > 0.01) M.contradiz++;
      }
      for (const o of mapa.regiao.lugares) if (o !== l) M.idaEntre.push(horasAte(o, l, mapa.regiao));
    }
  }
  return M;
}

export function resumoHistoria(M) {
  const p = ([a, b]) => `${a}/${b} (${pct(a, b)})`;
  return [
    `(g) A HISTÓRIA AMARRADA — gerarRegiao + estenderEspinha + espinhaNaRegiao (${M.mundos} mundos)`,
    `    (a) marcos da espinha dentro da região: ${p(M.dentro)} · segredos: ${p(M.segredo)} · atos no seu sítio (início na base, meio e fim num lugar com ficha): ${p(M.atosNoLugar)} · confronto no clímax: ${M.fechoNoClimax}/${M.mundos}`,
    `    (b) atos sem marcos que os pesem: estendida ${p(M.curtos.antes)} → amarrada ${p(M.curtos.depois)} · continente ${p(M.curtos.continente)}`,
    `    (c) ganchos para um lugar com ficha — abertura: região ${p(M.abertura.regiao)}, continente ${p(M.abertura.continente)} · mural (onde está a presa): região ${p(M.mural.regiao)}, continente ${p(M.mural.continente)} · boatos da base: região ${p(M.boatos.regiao)}, continente ${p(M.boatos.continente)}`,
    `    (d) ida base → lugar: mediana ${r1(mediana(M.idaBase))} h, máx ${r1(maximo(M.idaBase))} h · lugar → lugar: mediana ${r1(mediana(M.idaEntre))} h, máx ${r1(maximo(M.idaEntre))} h · contradizem a ficha: ${M.contradiz}/${M.idas}`,
    `        o que a base diz no turno (resumoDaqui, pauta dinâmica): região mediana ${mediana(M.daqui.regiao)}, máx ${maximo(M.daqui.regiao)} · continente mediana ${mediana(M.daqui.continente)}, máx ${maximo(M.daqui.continente)}`,
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
    const R = await import(pathToFileURL(caminho).href);
    if (typeof R.mapaDaCriacao === "function") console.log("\n" + medirCriacao(R, N).join("\n"));
    if (typeof R.espinhaNaRegiao === "function") console.log("\n" + resumoHistoria(await medirHistoria(R, N)));
  }
  console.log(`\n(e) a PIOR CENA REAL do prompt (teste-prompt.mjs): ${piorCenaReal()} caracteres (o teto é 82.000)`);
}
