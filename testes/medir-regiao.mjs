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
     (f) a criação, (g) a história amarrada, (h) a masmorra sem a cidade
         (MM17 C2: o turno lá dentro antes → depois, o turno de fora contra
         a árvore de HEAD, e o horizonte que só fala quando perguntado);
     (i) a ficha é a planta (MM17, pendência nº 1): quem a ficha diz que
         anda num lugar contra quem a planta põe nas salas de luta;
     (j) a marcha única (MM17, pendência nº 3): a hora de cada viagem da
         região pelas quatro contas (jornada, ficha, Geógrafo, mapa vivo),
         antes (a árvore de HEAD) e depois, e quantas passam da promessa;
     e o tamanho do elenco (24) e os moldes fora do beta.

   Uso: node testes/medir-regiao.mjs [N]   (N mundos por molde; 60 se omitido) */

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { gerarGeografia } from "../src/geografia.js";
import { MOLDES } from "../src/moldes.js";
import { generosDisponiveis } from "../src/nomes.js";
import { masmorrasDoMundo, locaisDaCidade, resumoDaqui, criaturasDaRegiao } from "../src/mundo-base.js";
import { linhaDaFicha } from "../src/masmorra-sem-cidade.js";
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

/* ---------------- (h) A MASMORRA SEM A CIDADE (MM17, etapa C2) ----------------
   (A letra é "h" porque a "g" já é a história amarrada da C1.)
   O turno que o App monta com o herói dentro de uma masmorra (e a meio de
   uma luta nela), bloco a bloco, como `enviar` o monta: o "aqui" do rodapé
   (a forma do mundo, o resumoDaqui, a forma da cidade, o ermo, os
   arredores, as saídas), os chefes, a cena, a pauta (o Geógrafo, a planta,
   a economia, a vizinhança da boca, os vetos, e o que cede) e o system
   prompt (as portas da cena e a gente por conhecer).

   `depois: false` é o App de HEAD v9.357 (só o lugar de antes da porta, a
   estrada e as bancas calados — v9.352); `depois: true` é com a tabela de
   `masmorra-sem-cidade.js`. As duas colunas correm sobre as MESMAS
   sementes; nenhuma sorte fica de fora (a planta corre sobre um gerador
   semeado, restaurado no fim). `teste-masmorra-sem-cidade.mjs` importa
   `turnoNaMasmorra` e guarda os números como catraca.

   O que conta como "da cidade" (nada a ver com a sala): os blocos de
   `DENTRO_DA_MASMORRA` que calam, mais o que as portas da cidade, do
   mercado e da estrada abrem no system e a gente por conhecer. Os chefes,
   a cena (quem está e quem está longe), a ficha do herói e o mapa ficam:
   não são a cidade, e a tabela diz por quê. */
export const HEROI_DA_MEDIDA = { nome: "Brann", conceito: "druida", historia: "", nivel: 8, raca: "Humano", classe: "Druida", atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 61, manaMax: 48 };
/* a cena do system lá dentro, como o App a monta (a cidade de onde se saiu
   continua no registo: `emCidade` e `temMercado` eram "há cidade") */
const CENA_DA_MEDIDA = { emMasmorra: true, emCidade: true, temMercado: true, conjura: true, temMissao: true, temGente: false };

export async function turnoNaMasmorra({ semente, genero, mapa, m, cidade, luta = false, depois = true, molde = "sobremundo" }) {
  const S = await import("../src/masmorra-sem-cidade.js");
  const { resumoMoldePrompt } = await import("../src/moldes.js");
  const { resumoChefesPrompt } = await import("../src/mundo-base.js");
  const { celulaDaCidade, resumoCelulaPrompt } = await import("../src/celulas.js");
  const { paraPauta } = await import("../src/geografo.js");
  const P = await import("../src/pauta.js");
  const { resumoCenaPrompt } = await import("../src/cena.js");
  const { envelopeDoComercio } = await import("../src/comercio.js");
  const { montarSystemPrompt } = await import("../src/prompt.js");
  const { elencoParaPovoar } = await import("../src/elenco.js");
  const md = moldePorId(molde);
  const acaso = Math.random;
  Math.random = rng(hashSemente(`masmorra-sem-cidade|${semente}|${m.nome}`));
  let mm0;
  try { mm0 = gerarMasmorra(genero, m.nivel, m.nome, { salas: m.salas }); } finally { Math.random = acaso; }
  /* o App: o nome do mapa e a boca no ponto onde se entrou (`meuPonto`) */
  const mm = { ...mm0, nome: m.nome, coord: { x: m.x, y: m.y, z: 0, mx: 0, my: 0 } };
  const cid = (mapa.cidades || []).find((c) => c.nome === cidade) || null;
  const lugar = lugarAoEntrarNaMasmorra(mm, { cidade });
  const cel = (() => { try { return cid ? resumoCelulaPrompt(celulaDaCidade(semente, cid, { mapa, molde: md }), md) || "" : ""; } catch { return ""; } })();
  /* o "aqui" do rodapé, nas chaves da tabela (ondeEstou, a estrada e os
     cômodos já são "" lá dentro desde a v9.352; a forma da cidade só sai
     sem lugar, e lá dentro o lugar é a boca) */
  const blocos = {
    forma: resumoMoldePrompt(md) || "",
    ondeEstou: "",
    comodos: "",
    daqui: (depois && S.calaNaMasmorra("daqui", mm)) ? "" : resumoDaqui(semente, mapa, cidade, null, genero, molde) || "",
    formaDaCidade: "",
    viagem: "",
    ermo: cel,
    arredores: cid ? resumoArredoresPrompt(semente, cid) || "" : "",
    saidas: G.saidasDeUmPassoPrompt(mapa, cidade) || "",
  };
  const aqui = depois ? S.aquiDoTurno(blocos, mm) : S.aquiDoTurno(blocos, null);
  const chefes = resumoChefesPrompt(semente, mapa, null, genero) || "";
  const cena = resumoCenaPrompt({}, cidade, mapa, { masmorra: mm }) || "";
  const rodape = [aqui, chefes, cena].filter(Boolean).join("\n");
  /* a cidade que ainda vai no rodapé: os blocos da tabela que calam */
  const doAqui = Object.entries(blocos).filter(([id]) => S.DENTRO_DA_MASMORRA[id] && S.DENTRO_DA_MASMORRA[id].cala).reduce((s, [id, v]) => s + (aqui.includes(v) && v ? v.length : 0), 0);
  /* o system: a cena e a gente por conhecer */
  const cena0 = { ...CENA_DA_MEDIDA, ...(luta ? { emCombate: true, temChao: true } : {}) };
  const cenaSys = depois ? S.cenaNaMasmorra(cena0) : cena0;
  const povoar = (depois && S.calaNaMasmorra("povoar", mm)) ? [] : elencoParaPovoar(semente, mapa, { genero, molde, dia: 1, cidade, npcs: {} });
  const mapaInfo = (resumoMapaParaPrompt(mapa, "") + "\n" + resumoDiplomacia(mapa, "")).trim();
  const sysDe = (c, el) => montarSystemPrompt("C", { genero }, HEROI_DA_MEDIDA, {}, { elenco: el, cidades: [], tavernas: [] }, mapaInfo, "", "", "", "", "", "Mortal", c);
  const sys = sysDe(cenaSys, povoar);
  const semCidade = sysDe({ ...cenaSys, ...S.PORTAS_NA_MASMORRA }, []);
  const doSystem = sys.length - semCidade.length;
  /* a pauta */
  const g = paraPauta({ cidadeAtual: cidade, masmorra: mm, mapa, lugar, semente, jornada: null });
  let p = P.porNaPauta(P.garantirPauta(null), "onde", g.onde);
  p = P.porNaPauta(p, "masmorra", masmorraParaPauta(mm, { luta }));
  if (depois) p = P.porNaPauta(p, "masmorra", S.linhaDaFicha(mapa, mm, { luta }));
  p = P.porNaPauta(p, "economia", envelopeDoComercio(cid, 1));
  p = P.porNaPauta(p, "daqui", g.daqui);
  p = P.porNaPauta(p, "naoPode", g.naoPode);
  p = P.cederNaCena(p, { luta, masmorra: true });
  const pauta = P.textoDaPauta(p);
  return {
    onde: g.onde.join("\n").length,
    secao: (p.masmorra || []).join("\n").length,
    ficha: depois ? S.linhaDaFicha(mapa, mm, { luta }).length : 0,
    pauta: pauta.length, rodape: rodape.length, sys: sys.length,
    total: sys.length + pauta.length + rodape.length,
    cidade: doAqui + doSystem,
    doAqui, doSystem, blocos: Object.fromEntries(Object.entries(blocos).map(([k, v]) => [k, aqui.includes(v) && v ? v.length : 0])),
    textos: { pauta, rodape, sys },
  };
}

/* `gerar(i)` → { semente, genero, mapa, cidade(m) } ; mede a 1.ª masmorra de cada mundo, fora e dentro da luta */
export async function medirMasmorraSemCidade(gerar, N) {
  const M = {};
  const push = (k, v) => (M[k] = M[k] || []).push(v);
  let mundos = 0;
  for (let i = 0; i < N; i++) {
    const w = gerar(i);
    if (!w || !w.mapa) continue;
    const mms = masmorrasDoMundo(w.semente, w.mapa);
    if (!mms.length) continue;
    mundos++;
    const m = mms[0];
    for (const luta of [false, true]) {
      for (const depois of [false, true]) {
        const r = await turnoNaMasmorra({ ...w, m, cidade: w.cidade(m), luta, depois });
        const k = `${luta ? "luta" : "sala"}.${depois ? "depois" : "antes"}`;
        for (const x of ["onde", "secao", "ficha", "pauta", "rodape", "sys", "total", "doAqui", "doSystem"]) push(`${k}.${x}`, r[x]);
        push(`${k}.cidade`, r.cidade);
      }
    }
  }
  return { M, mundos };
}

export function resumoMasmorraSemCidade(rotulo, { M, mundos }) {
  const md = (k) => mediana(M[k] || []), mx = (k) => maximo(M[k] || []);
  const par = (cena, x) => `${md(`${cena}.antes.${x}`)} → ${md(`${cena}.depois.${x}`)} (máx ${mx(`${cena}.antes.${x}`)} → ${mx(`${cena}.depois.${x}`)})`;
  const out = [`  ${rotulo} (${mundos} mundos; mediana antes → depois)`];
  for (const cena of ["sala", "luta"]) {
    out.push(`    ${cena === "sala" ? "na sala" : "na luta"}: ONDE ${par(cena, "onde")} · seção MASMORRA ${par(cena, "secao")} (a linha da ficha: ${md(`${cena}.depois.ficha`)})`);
    out.push(`        pauta ${par(cena, "pauta")} · rodapé ${par(cena, "rodape")} · system ${par(cena, "sys")}`);
    out.push(`        o turno inteiro ${par(cena, "total")}`);
    out.push(`        "da cidade" no turno ${par(cena, "cidade")} — no rodapé ${par(cena, "doAqui")}, no system ${par(cena, "doSystem")}`);
  }
  return out.join("\n");
}

/* (h, fora) FORA DA MASMORRA, O TURNO DE HEAD, BYTE A BYTE.
   A árvore de HEAD (git archive, numa pasta temporária) contra a de agora,
   nas cenas em que o herói NÃO está numa masmorra aberta: a cidade parada,
   dentro de um prédio, a estrada, o ermo, a luta na cidade e no ermo, e a
   masmorra já encerrada. Por cena e por mundo: o system (HEAD: a cena
   crua; agora: `cenaNaMasmorra(cena)`), o "aqui" do rodapé (HEAD: o
   `[…].filter(Boolean).join` de sempre; agora: `aquiDoTurno`) e o que a
   C2 poria na pauta (a linha da ficha e o horizonte para uma frase que
   não pergunta por ele). Devolve quantos turnos saíram iguais. */
export const CENAS_FORA = {
  cidade: { emCidade: true, temMercado: true, temGente: true, conjura: true, temMissao: true },
  predio: { emCidade: true, temMercado: true, dentroDeUmLocal: true, temGente: true },
  estrada: { emViagem: true, emCidade: true, temMercado: true },
  ermo: { emCidade: false, temMercado: false, conjura: true },
  lutaNaCidade: { emCombate: true, temChao: true, emCidade: true, temMercado: true },
  lutaNoErmo: { emCombate: true, temChao: true },
  encerrada: { emMasmorra: false, emCidade: true, temMercado: true },
};
export function arvoreDeHEAD() {
  const dir = mkdtempSync(join(tmpdir(), "taverna-head-"));
  const tar = spawnSync("git", ["archive", "--format=tar", "HEAD", "src"], { cwd: join(AQUI, ".."), maxBuffer: 1 << 28 });
  if (tar.status !== 0) throw new Error("git archive falhou");
  const x = spawnSync("tar", ["-x"], { cwd: dir, input: tar.stdout, maxBuffer: 1 << 28 });
  if (x.status !== 0) throw new Error("tar falhou: " + String(x.stderr));
  return join(dir, "src");
}
export async function foraIgualAHEAD(gerar, N, srcHEAD) {
  const de = (dir, f) => import(pathToFileURL(join(dir, f)).href);
  const AGORA = join(AQUI, "..", "src");
  const [PH, PA, MBH, MBA, MH, MA, AH, AA, CH, CA, S] = await Promise.all([
    de(srcHEAD, "prompt.js"), de(AGORA, "prompt.js"), de(srcHEAD, "mundo-base.js"), de(AGORA, "mundo-base.js"),
    de(srcHEAD, "moldes.js"), de(AGORA, "moldes.js"), de(srcHEAD, "arredores.js"), de(AGORA, "arredores.js"),
    de(srcHEAD, "celulas.js"), de(AGORA, "celulas.js"), de(AGORA, "masmorra-sem-cidade.js"),
  ]);
  const hH = createHash("sha256"), hA = createHash("sha256");
  let turnos = 0, iguais = 0, mundos = 0, pautaZero = 0;
  for (let i = 0; i < N; i++) {
    const w = gerar(i);
    if (!w || !w.mapa) continue;
    mundos++;
    const { semente, genero, mapa } = w;
    const md = moldePorId("sobremundo");
    const mapaInfo = (resumoMapaParaPrompt(mapa, "") + "\n" + resumoDiplomacia(mapa, "")).trim();
    for (const cid of (mapa.cidades || []).slice(0, 2)) {
      const aquiDe = (MB, M, A, C) => {
        const cel = (() => { try { return C.resumoCelulaPrompt(C.celulaDaCidade(semente, cid, { mapa, molde: md }), md) || ""; } catch { return ""; } })();
        return { forma: M.resumoMoldePrompt(md) || "", ondeEstou: "", comodos: "", daqui: MB.resumoDaqui(semente, mapa, cid.nome, null, genero, "sobremundo") || "", formaDaCidade: "", viagem: "", ermo: cel, arredores: A.resumoArredoresPrompt(semente, cid) || "", saidas: G.saidasDeUmPassoPrompt(mapa, cid.nome) || "" };
      };
      const bH = aquiDe(MBH, MH, AH, CH), bA = aquiDe(MBA, MA, AA, CA);
      const aquiH = [bH.forma, bH.ondeEstou, bH.comodos, bH.daqui, bH.formaDaCidade, bH.viagem, bH.ermo, bH.arredores, bH.saidas].filter(Boolean).join("\n\n");
      for (const [id, cena] of Object.entries(CENAS_FORA)) {
        /* a masmorra que o App teria no ref: nenhuma, ou a encerrada */
        const mm = id === "encerrada" ? { nome: "Cripta da Medida", encerrada: true, salas: [] } : null;
        const aquiA = S.aquiDoTurno(bA, mm);
        const sysH = PH.montarSystemPrompt("C", { genero }, HEROI_DA_MEDIDA, {}, { elenco: [], cidades: [], tavernas: [] }, mapaInfo, "", "", "", "", "", "Mortal", cena);
        const sysA = PA.montarSystemPrompt("C", { genero }, HEROI_DA_MEDIDA, {}, { elenco: [], cidades: [], tavernas: [] }, mapaInfo, "", "", "", "", "", "Mortal", S.cenaNaMasmorra(cena));
        const extra = S.linhaDaFicha(mapa, mm, { luta: !!cena.emCombate }) + JSON.stringify(S.horizonteDaPergunta("Pago a cerveja e pergunto ao taverneiro pelo irmão dele.", mapa, { masmorra: mm, luta: !!cena.emCombate }) ? "x" : "");
        if (extra === '""') pautaZero++;
        hH.update(sysH + "\u0000" + aquiH + "\u0000");
        hA.update(sysA + "\u0000" + aquiA + "\u0000");
        turnos++;
        if (sysH === sysA && aquiH === aquiA) iguais++;
      }
    }
  }
  return { mundos, turnos, iguais, pautaZero, head: hH.digest("hex").slice(0, 16), agora: hA.digest("hex").slice(0, 16) };
}

/* (h, horizonte) O HORIZONTE CUSTA ZERO A QUEM NÃO PERGUNTA. N mundos de
   região × as cenas (cidade, estrada, masmorra, luta) × um corpo de frases
   de jogo que não perguntam por terras de além — e as que perguntam,
   dentro da masmorra e da luta. Os bytes que ele poria na mesa ("pergunta")
   têm de ser 0 em todos; só na pergunta feita cá fora ele fala. */
export const FRASES_SEM_HORIZONTE = [
  "Ataco o goblin com a espada.", "Pergunto ao taverneiro quanto custa um quarto.", "Além do guarda, quem mais está aqui?",
  "Há outras cidades por perto?", "Desço a escada devagar, com a tocha baixa.", "Sabe se o ferreiro abre amanhã?",
  "Além disso, quero comprar corda.", "O que há além da porta?", "Procuro armadilhas no corredor.", "Vou para a Cripta.",
  "Quanto falta até à vila?", "Ele conhece a minha irmã?", "Além do mais, estou cansado.", "Olho pela janela da torre.",
];
export const FRASES_DO_HORIZONTE = [
  "Há reinos além das montanhas?", "O que existe do outro lado do rio?", "Quero saber do resto do mundo.",
  "Já ouviu falar de outras terras?", "De onde vem o sal que vendem aqui?", "O que há para lá da fronteira?",
];
export async function horizonteCusta(gerar, N) {
  const S = await import("../src/masmorra-sem-cidade.js");
  const r = { mundos: 0, mudos: 0, perguntas: 0, falou: 0, laDentro: 0, linhas: [] };
  const CENAS = { cidade: {}, estrada: {}, masmorra: { masmorra: { nome: "Cripta da Medida", salas: [] } }, luta: { luta: true } };
  for (let i = 0; i < N; i++) {
    const w = gerar(i);
    if (!w || !w.mapa) continue;
    r.mundos++;
    for (const ctx of Object.values(CENAS)) {
      for (const f of FRASES_SEM_HORIZONTE) { r.perguntas++; const h = S.horizonteDaPergunta(f, w.mapa, ctx); if (!h) r.mudos++; }
      for (const f of FRASES_DO_HORIZONTE) {
        const h = S.horizonteDaPergunta(f, w.mapa, ctx);
        if (ctx.masmorra || ctx.luta) { if (h) r.laDentro++; } else if (h) { r.falou++; r.linhas.push(h.pergunta[0].length); }
      }
    }
  }
  return r;
}

/* ---------------- (i) A FICHA É A PLANTA (MM17, pendência nº 1 · v9.363) ----------------
   A ficha de cada lugar da região diz quem anda por lá (`ficha.quem`); a
   planta, ao entrar, sorteava os seus do bestiário do género. Aqui, lugar
   a lugar, o que o App faz à porta (`masmorrasDoMundo` → o lugar pelo nome
   → `quemDoLugar` → `gerarMasmorra(…, { salas, quem })`) contra a ficha:
     · por NOME: todo inimigo das salas de luta (combate, guardião, chefe)
       é um bicho que a ficha nomeia?
     · por FAMÍLIA: o bicho do bestiário por trás do nome (num mundo com
       léxico o nome muda e a família não — `criaturasDaRegiao` guarda as
       duas) é um dos da ficha?
     · a ficha toda em cena: todo bicho que a ficha nomeia aparece em
       alguma sala;
     · o chefe da ficha, com a ameaça de chefe; os outros com a ameaça que
       o bicho tem na região; a planta com a MESMA forma da de antes;
     · a pauta: a linha "de pé aqui" de cada sala de luta só diz nomes que
       a linha da ficha diz; e o que a secção MASMORRA pesa antes → depois.
   `comFicha: false` é a planta de antes (sem a opção: o App de HEAD
   v9.362); `semAmeaca: true` é uma ficha de antes desta versão (sem
   `ameaca`), a de quem criou a região entre a v9.356 e a v9.362.
   `teste-ficha-e-planta.mjs` importa isto e guarda os números como
   catraca. */
export const LEXICO_DA_MEDIDA = { criaturas: ["fraco", "comum", "competente", "elite", "lendario"].map((a) => ({ ameaca: a, nomes: [1, 2, 3, 4].map((k) => `Bicho ${a} ${k}`) })) };
const DEGRAUS_DA_MEDIDA = ["fraco", "comum", "competente", "elite", "lendario"];
const semAmeacaNaFicha = (mapa) => ({ ...mapa, regiao: { ...mapa.regiao, lugares: mapa.regiao.lugares.map((l) => ({ ...l, ficha: { ...l.ficha, quem: l.ficha.quem.map(({ ameaca, ...q }) => q) } })) } });
export function medirFichaEPlanta(R, N = 200, { lex = null, comFicha = true, semAmeaca = false } = {}) {
  const M = { mundos: 0, lugares: 0, tipos: {}, inimigos: 0, nomeNaFicha: 0, familiaNaFicha: 0, lugaresNome: 0, lugaresFamilia: 0,
    fichaToda: 0, chefeDaFicha: 0, capangas: 0, ameacaCerta: 0, mesmaForma: 0, caminhoDoApp: 0, salasDeLuta: 0, salaNaFicha: 0,
    linhasIguais: 0, linhaDaFichaIgual: 0, secaoAntes: [], secaoDepois: [] };
  const acaso = Math.random;
  const semeado = (sm, f) => { Math.random = rng(hashSemente(sm)); try { return f(); } finally { Math.random = acaso; } };
  const nomesDaLinha = (txt) => String(txt || "").split(", ").map((x) => x.replace(/ ×\d+$/, "").trim()).filter(Boolean);
  for (let i = 0; i < N; i++) {
    const semente = sementeDe(i), genero = generoDe(i);
    const mapa0 = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde: moldePorId("sobremundo"), genero, lex, estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id, modo: "historia" }));
    if (!mapa0 || !mapa0.regiao) continue;
    /* a ficha de antes desta versão: a mesma lista, sem a ameaça */
    const mapa = semAmeaca ? semAmeacaNaFicha(mapa0) : mapa0;
    M.mundos++;
    const familia = {}, ameacaDe = {};
    for (const r of mapa.regioes || []) for (const c of criaturasDaRegiao(semente, r, genero, lex)) { familia[c.nome] = c.id.slice(c.id.indexOf("|") + 1); ameacaDe[c.nome] = c.ameaca; }
    const fam = (n) => familia[n] || n;
    const mms = masmorrasDoMundo(semente, mapa);
    const linhaSemAmeaca = semAmeacaNaFicha(mapa);
    for (const l of mapa.regiao.lugares) {
      M.lugares++; M.tipos[l.tipo] = (M.tipos[l.tipo] || 0) + 1;
      /* o caminho do App, à porta (entrarMasmorra) */
      const doMapa = mms.find((m) => String(m.nome || "").toLowerCase().trim() === String(l.nome || "").toLowerCase().trim()) || null;
      const daPorta = doMapa ? R.quemDoLugar(mapa, doMapa.id) : null;
      if (JSON.stringify(daPorta) === JSON.stringify(l.ficha.quem)) M.caminhoDoApp++;
      const quem = comFicha ? daPorta : null;
      const sm = `ficha-e-planta|${semente}|${l.nome}`;
      const salas = doMapa ? doMapa.salas : l.salas;
      const mm = { ...semeado(sm, () => gerarMasmorra(genero, l.nivel, "", { salas, quem })), nome: l.nome };
      const crua = { ...semeado(sm, () => gerarMasmorra(genero, l.nivel, "", { salas })), nome: l.nome };
      const F = new Set(l.ficha.quem.map((q) => q.nome)), FF = new Set(l.ficha.quem.map((q) => fam(q.nome)));
      const luta = mm.salas.filter((s) => s.tipo === "combate" || s.tipo === "chave" || s.tipo === "chefe");
      let lugarNome = true, lugarFam = true;
      for (const s of luta) for (const [k, e] of (s.inimigos || []).entries()) {
        M.inimigos++;
        if (F.has(e.nome)) M.nomeNaFicha++; else lugarNome = false;
        if (FF.has(fam(e.nome))) M.familiaNaFicha++; else lugarFam = false;
        if (s.tipo === "chefe" && k === 0) {
          const d = DEGRAUS_DA_MEDIDA.indexOf(e.ameaca);
          if (F.has(e.nome) && d >= DEGRAUS_DA_MEDIDA.indexOf("elite") && d >= DEGRAUS_DA_MEDIDA.indexOf(ameacaDe[e.nome])) M.chefeDaFicha++;
        } else { M.capangas++; if (e.ameaca === ameacaDe[e.nome]) M.ameacaCerta++; }
      }
      if (lugarNome) M.lugaresNome++;
      if (lugarFam) M.lugaresFamilia++;
      const postos = new Set(luta.flatMap((s) => (s.inimigos || []).map((e) => e.nome)));
      if ([...F].every((n) => postos.has(n))) M.fichaToda++;
      /* a mesma planta: tudo igual menos QUEM (o tamanho de cada grupo incluído) */
      const forma = (p) => JSON.stringify({ ...p, salas: p.salas.map((s) => (s.inimigos ? { ...s, inimigos: s.inimigos.length } : s)) });
      if (forma(mm) === forma(crua)) M.mesmaForma++;
      /* a pauta lá dentro: a linha da ficha (a ameaça nova não lhe soma um
         byte) e a da sala (só nomes que a da ficha diz) */
      const daFicha = linhaDaFicha(mapa, mm);
      if (daFicha === linhaDaFicha(linhaSemAmeaca, mm)) M.linhaDaFichaIgual++;
      const naLinhaDaFicha = new Set(l.ficha.quem.map((q) => q.nome).filter((n) => daFicha.includes(n)));
      for (const s of luta) {
        M.salasDeLuta++;
        const depois = masmorraParaPauta({ ...mm, atual: s.id });
        const antes = masmorraParaPauta({ ...crua, atual: s.id });
        const dePe = depois.find((x) => x.startsWith("de pé aqui: "));
        const ditos = dePe ? nomesDaLinha(dePe.slice("de pé aqui: ".length)) : [];
        if (ditos.length && ditos.every((n) => F.has(n) && naLinhaDaFicha.has(n))) M.salaNaFicha++;
        if (depois.length === antes.length) M.linhasIguais++;
        M.secaoAntes.push(antes.join("\n").length); M.secaoDepois.push(depois.join("\n").length);
      }
    }
  }
  return M;
}
export function resumoFichaEPlanta(rotulo, M) {
  return [
    `  ${rotulo} (${M.mundos} mundos, ${M.lugares} lugares com planta: ${Object.entries(M.tipos).map(([k, v]) => `${k} ${v}`).join(", ")})`,
    `    inimigos das salas de luta que a ficha nomeia: por nome ${M.nomeNaFicha}/${M.inimigos} (${pct(M.nomeNaFicha, M.inimigos)}) · por família ${M.familiaNaFicha}/${M.inimigos} (${pct(M.familiaNaFicha, M.inimigos)})`,
    `    lugares com a planta toda dentro da ficha: por nome ${M.lugaresNome}/${M.lugares} (${pct(M.lugaresNome, M.lugares)}) · por família ${M.lugaresFamilia}/${M.lugares} · a ficha toda em cena ${M.fichaToda}/${M.lugares} (${pct(M.fichaToda, M.lugares)})`,
    `    o chefe é o da ficha, com ameaça de chefe: ${M.chefeDaFicha}/${M.lugares} · os outros com a ameaça da região: ${M.ameacaCerta}/${M.capangas} · a mesma planta (forma, salas, grupos): ${M.mesmaForma}/${M.lugares} · o caminho do App acha a ficha: ${M.caminhoDoApp}/${M.lugares}`,
    `    a pauta: "de pé aqui" só com nomes da linha da ficha ${M.salaNaFicha}/${M.salasDeLuta} salas de luta · as mesmas linhas ${M.linhasIguais}/${M.salasDeLuta} · a linha da ficha sem um byte da ameaça ${M.linhaDaFichaIgual}/${M.lugares} · a secção MASMORRA, mediana ${mediana(M.secaoAntes)} → ${mediana(M.secaoDepois)} car. (máx ${maximo(M.secaoAntes)} → ${maximo(M.secaoDepois)})`,
  ].join("\n");
}

/* ============================================================
   (j) A MARCHA ÚNICA (MM17, pendência nº 3 · v9.364)

   Cada par ordenado de pontos da região (base, povoações, lugares) de N
   mundos, e a hora que cada conta diz para ir de um ao outro:

     · JORNADA — o que o jogo cobra. A um lugar: `idaAMasmorra` + a jornada
       de `jornadaAteAMasmorra` (a pé, os minutos). A uma povoação: o que o
       `viajar` do App abre — antes, `abrirViagem` com a rota de
       `mapa.rotas` entre a cidade do registo (a base, quando se parte de
       uma boca) e o destino, ou o piso de 3 dias sem rota; depois,
       `partidaNaRegiao` (marcha.js), de onde o herói está.
     · FICHA — o que o gerador guardou: base → lugar, lugar → vizinho,
       base → povoação.
     · GEÓGRAFO — o que a linha dos vizinhos (`rastrearOTurno`) e a resposta
       "quanto tempo leva até…" (`fichaParaPauta`) dizem, lido do texto.
     · MAPA VIVO — as arestas de `dadosDoMapaVivo` (com tudo à vista).

   `src` é a pasta da árvore a medir: a de HEAD (`arvoreDeHEAD`) é o ANTES,
   e a de agora o DEPOIS — as mesmas sementes, o mesmo laço. Uma conta
   "discorda" quando a hora dela difere da da jornada mais do que 0,05 h (um
   número guardado) ou mais do que o passo do texto (meia hora, ao dizer). */
const horaDoTexto = (txt) => {
  const s = String(txt || "");
  const m = /(\d+(?:,\d+)?) (h|min)\b/.exec(s);
  if (m) return Number(m[1].replace(",", ".")) / (m[2] === "min" ? 60 : 1);
  /* a cidade-por-dentro de antes escrevia "0.5 dia de estrada", com ponto */
  const d = /(\d+(?:[.,]\d+)?) dias? de estrada/.exec(s);
  return d ? Number(d[1].replace(",", ".")) * HORAS_MARCHA_POR_DIA : NaN;
};
export async function medirMarcha(src, N = 200, opcoes = {}) {
  /* `semViajar`: o App ainda abre a jornada para uma povoação como em HEAD
     (a fiação de `partidaNaRegiao` no `viajar` espera o bastão) */
  const semViajar = !!(opcoes && opcoes.semViajar);
  const de = (f) => import(pathToFileURL(join(src, f)).href);
  const [R, RA, BO, GE, CP, MV, MB, VI] = await Promise.all(["regiao.js", "rastro.js", "boca.js", "geografo.js", "cidade-por-dentro.js", "mapa-vivo.js", "mundo-base.js", "viagem.js"].map(de));
  let MA = null;
  try { MA = await de("marcha.js"); } catch { MA = null; }
  const PROMESSA = R.PROMESSA_DA_REGIAO || { daBase: HORAS_MARCHA_POR_DIA, direta: HORAS_MARCHA_POR_DIA, pontaAPonta: 2 * HORAS_MARCHA_POR_DIA };
  const contas = { jornada: [], ficha: [], geografo: [], mapaVivo: [] };
  const porTipo = {};
  const semA = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const M = { pares: 0, discord: 0, discordPorConta: { ficha: 0, geografo: 0, mapaVivo: 0 }, maior: 0, exemplo: null, alemDaPromessa: 0, alemDeUmDia: 0, piso3dias: 0, desvios: 0, linha: "", pior: null, contas, porTipo };
  for (let i = 0; i < N; i++) {
    const semente = sementeDe(i), genero = generoDe(i);
    const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde: moldePorId("sobremundo"), genero, estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id, modo: "historia" }));
    if (!mapa || !mapa.regiao) continue;
    const r = mapa.regiao, base = mapa.cidades[0];
    const masmorras = MB.masmorrasDoMundo(semente, mapa);
    const tudo = { ...mapa, cidades: mapa.cidades.map((c) => ({ ...c, descoberta: true })) };
    const mv = MV.dadosDoMapaVivo(tudo, { cidadeAtual: base.nome, conhecidos: [...mapa.cidades.map((c) => c.nome), ...r.lugares.map((l) => l.nome)], semente });
    const nomeDoNo = new Map(mv.nos.map((n) => [n.id, n.nome]));
    const aresta = new Map();
    for (const a of mv.arestas) { aresta.set(`${nomeDoNo.get(a.de)}~${nomeDoNo.get(a.para)}`, a.horas); aresta.set(`${nomeDoNo.get(a.para)}~${nomeDoNo.get(a.de)}`, a.horasDeVolta != null ? a.horasDeVolta : a.horas); }
    const rota = (a, b) => (mapa.rotas || []).find((x) => (semA(x.de) === semA(a) && semA(x.para) === semA(b)) || (semA(x.de) === semA(b) && semA(x.para) === semA(a)));
    const nos = [...mapa.cidades.map((c, j) => ({ tipo: j ? "povoado" : "base", src: c, nome: c.nome })), ...r.lugares.map((l) => ({ tipo: "lugar", src: l, nome: l.nome }))];
    for (const a of nos) for (const b of nos) {
      if (a === b) continue;
      M.pares++;
      const tipo = `${a.tipo}→${b.tipo}`;
      const lugar = a.tipo === "lugar" ? { nome: a.nome, coord: { x: a.src.x, y: a.src.y }, distancia: "perto", cidade: base.nome } : null;
      const cidadeAtual = a.tipo === "lugar" ? base.nome : a.nome;
      let J = NaN;
      if (b.tipo === "lugar") {
        const ida = RA.idaAMasmorra(`Vou a ${b.nome}.`, { cidadeAtual, cidades: mapa.cidades.map((c) => c.nome), mapa, masmorras, lugar, jornada: null });
        if (ida && ida.rota) {
          J = ida.rota.modo === "a_pe" ? ida.rota.minutos / 60 : BO.jornadaAteAMasmorra(ida, { de: cidadeAtual }).totalMin / 60;
          if (ida.rota.percurso && ida.rota.percurso.length > 2) { M.desvios++; if (!M.linha) M.linha = ida.linhas[0]; }
        }
      } else if (MA && MA.partidaNaRegiao && !semViajar) {
        const p = MA.partidaNaRegiao(mapa, { cidadeAtual, lugar, destino: b.nome });
        if (p) { J = p.jornada.totalMin / 60; if (p.rota.percurso && p.rota.percurso.length > 2) M.desvios++; }
      } else if (semA(cidadeAtual) !== semA(b.nome)) {
        /* o App de HEAD: `abrirViagem({ rota: rotaEntre(cidadeAtual, alvo) })` */
        const rt = rota(cidadeAtual, b.nome);
        if (!rt) M.piso3dias++;
        J = VI.abrirViagem({ de: cidadeAtual, para: b.nome, rota: rt || null }).totalMin / 60;
      }
      let F = NaN;
      if (a.tipo === "base" && b.tipo === "lugar") F = b.src.ficha.horas;
      else if (a.tipo === "lugar") { const v = a.src.ficha.vizinhos.find((x) => x.nome === b.nome); if (v) F = v.horas; }
      else if (a.tipo === "base" && b.tipo === "povoado") { const p = r.povoados.find((x) => x.nome === b.nome); if (p && p.horas != null) F = p.horas; }
      let G = NaN;
      if (b.tipo !== "lugar") {
        const rs = GE.rastrearOTurno({ cidadeAtual, lugar, mapa: tudo, semente });
        const p = rs && rs.perto.find((x) => x.nome === b.nome);
        if (p) G = horaDoTexto(GE.linhaDosVizinhos({ perto: [p] }).slice(b.nome.length));
      }
      if (!Number.isFinite(G) && a.tipo !== "lugar") {
        const l = CP.fichaParaPauta(a.src, { semente, mapa, frase: `Quanto tempo leva até ${b.nome}?` }).pergunta.find((x) => x.startsWith("distância:"));
        if (l && l.includes(b.nome)) G = horaDoTexto(l.split(b.nome)[1]);
      }
      const V = aresta.has(`${a.nome}~${b.nome}`) ? aresta.get(`${a.nome}~${b.nome}`) : NaN;
      const vals = { jornada: J, ficha: F, geografo: G, mapaVivo: V };
      for (const [k, v] of Object.entries(vals)) if (Number.isFinite(v)) { contas[k].push(v); ((porTipo[k] ||= {})[tipo] ||= []).push(v); }
      if (!Number.isFinite(J)) continue;
      let discorda = false;
      for (const k of ["ficha", "geografo", "mapaVivo"]) {
        if (!Number.isFinite(vals[k])) continue;
        const d = Math.abs(vals[k] - J);
        if (d > (k === "geografo" ? 0.26 : 0.05)) { discorda = true; M.discordPorConta[k]++; if (d > M.maior) { M.maior = d; M.exemplo = { i, de: a.nome, para: b.nome, ...vals }; } }
      }
      if (discorda) M.discord++;
      const teto = a.tipo === "base" || b.tipo === "base" ? PROMESSA.daBase : PROMESSA.pontaAPonta;
      if (J > teto + 1e-6) M.alemDaPromessa++;
      if (J > HORAS_MARCHA_POR_DIA + 1e-6) M.alemDeUmDia++;
      if (!M.pior || J > M.pior.horas) M.pior = { horas: J, i, tipo, de: a.nome, para: b.nome };
    }
  }
  return M;
}
export function resumoMarcha(rotulo, M) {
  const f = (n) => (Number.isFinite(n) ? r1(n) : "—");
  const tipos = ["base→lugar", "lugar→lugar", "povoado→lugar", "lugar→povoado", "povoado→povoado"];
  return [
    `  ${rotulo} — ${M.pares} pares`,
    ...Object.entries(M.contas).map(([k, xs]) => `    ${k}: ${xs.length} pares com hora · mediana ${f(mediana(xs))} h · pior ${f(maximo(xs))} h`),
    `    a jornada por tipo: ${tipos.map((t) => { const xs = (M.porTipo.jornada || {})[t] || []; return `${t} ${f(mediana(xs))}/${f(maximo(xs))}`; }).join(" · ")}  (mediana/pior)`,
    `    discordâncias contra a jornada: ${M.discord} pares (ficha ${M.discordPorConta.ficha} · Geógrafo ${M.discordPorConta.geografo} · mapa vivo ${M.discordPorConta.mapaVivo}) · a maior ${f(M.maior)} h${M.exemplo ? ` (${M.exemplo.de} → ${M.exemplo.para}: jornada ${f(M.exemplo.jornada)}, ficha ${f(M.exemplo.ficha)}, Geógrafo ${f(M.exemplo.geografo)}, mapa ${f(M.exemplo.mapaVivo)})` : ""}`,
    `    viagens além da promessa (da base > 8 h, entre dois > 16 h): ${M.alemDaPromessa} · além de um dia: ${M.alemDeUmDia} · cidade sem estrada no piso de 3 dias: ${M.piso3dias} · pelas povoações: ${M.desvios}`,
    `    a pior: ${M.pior ? `${f(M.pior.horas)} h (${M.pior.tipo}, ${M.pior.de} → ${M.pior.para})` : "—"}${M.linha ? `\n    a linha de antes de partir: ${M.linha}` : ""}`,
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
    if (existsSync(join(AQUI, "..", "src", "masmorra-sem-cidade.js"))) {
      const NR = Math.max(N, 200), NC = Math.max(Math.min(N, 60), 60);
      console.log(`\n(h) A MASMORRA SEM A CIDADE — o turno lá dentro, antes (HEAD v9.357) → depois (a tabela)`);
      const mapaRegiao = (i) => R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente: sementeDe(i), molde: moldePorId("sobremundo"), genero: generoDe(i), estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id, modo: "historia" }));
      /* a região: o herói desceu da base (a cidade que continua no registo);
         o continente: da "cidade próxima" da masmorra (a medida (d)) */
      console.log(resumoMasmorraSemCidade("região", await medirMasmorraSemCidade((i) => { const mapa = mapaRegiao(i); return { semente: sementeDe(i), genero: generoDe(i), mapa, cidade: () => mapa.cidades[0].nome }; }, NR)));
      console.log(resumoMasmorraSemCidade("continente", await medirMasmorraSemCidade((i) => ({ semente: sementeDe(i), genero: generoDe(i), mapa: R.mapaDaCampanhaNova(gerarGeografia(sementeDe(i), moldePorId("sobremundo"))), cidade: (m) => m.cidadeProxima }), NC)));
      const regW = (i) => ({ semente: sementeDe(i), genero: generoDe(i), mapa: mapaRegiao(i) });
      const conW = (i) => ({ semente: sementeDe(i), genero: generoDe(i), mapa: R.mapaDaCampanhaNova(gerarGeografia(sementeDe(i), moldePorId("sobremundo"))) });
      let srcHEAD = "";
      try {
        srcHEAD = arvoreDeHEAD();
        for (const [rot, g, n] of [["região", regW, NR], ["continente", conW, NC]]) {
          const f = await foraIgualAHEAD(g, n, srcHEAD);
          console.log(`  fora da masmorra (${rot}, ${f.mundos} mundos × 2 cidades × ${Object.keys(CENAS_FORA).length} cenas = ${f.turnos} turnos): system + "aqui" iguais a HEAD em ${f.iguais}/${f.turnos} · hash HEAD ${f.head} = agora ${f.agora} · a C2 põe 0 bytes na pauta em ${f.pautaZero}/${f.turnos}`);
        }
      } catch (e) { console.log(`  fora da masmorra: a árvore de HEAD não se extraiu (${e.message})`); }
      finally { try { if (srcHEAD) rmSync(dirname(srcHEAD), { recursive: true, force: true }); } catch { /* a pasta temporária fica; o sistema limpa */ } }
      const hz = await horizonteCusta(regW, NR);
      console.log(`  o horizonte (${hz.mundos} mundos × 4 cenas): frases que não perguntam → 0 bytes em ${hz.mudos}/${hz.perguntas} · perguntado na masmorra ou na luta → fala ${hz.laDentro} vezes · perguntado cá fora → fala ${hz.falou}/${hz.mundos * 2 * FRASES_DO_HORIZONTE.length}, a linha mediana ${mediana(hz.linhas)} car. (máx ${maximo(hz.linhas)})`);
    }
  }
  if (existsSync(caminho)) {
    const R = await import(pathToFileURL(caminho).href);
    if (typeof R.quemDoLugar === "function") {
      const NF = Math.max(N, 200);
      console.log(`\n(i) A FICHA É A PLANTA — quem a ficha diz contra quem a planta põe nas salas (${NF} mundos)`);
      console.log(resumoFichaEPlanta("antes (a planta sorteia os seus: HEAD v9.362)", medirFichaEPlanta(R, NF, { comFicha: false })));
      console.log(resumoFichaEPlanta("depois (a planta tira-os da ficha)", medirFichaEPlanta(R, NF)));
      console.log(resumoFichaEPlanta("antes, num mundo com léxico", medirFichaEPlanta(R, NF, { comFicha: false, lex: LEXICO_DA_MEDIDA })));
      console.log(resumoFichaEPlanta("depois, num mundo com léxico", medirFichaEPlanta(R, NF, { lex: LEXICO_DA_MEDIDA })));
      console.log(resumoFichaEPlanta("depois, ficha de antes desta versão (sem ameaça), com léxico", medirFichaEPlanta(R, NF, { lex: LEXICO_DA_MEDIDA, semAmeaca: true })));
    }
  }
  if (existsSync(join(AQUI, "..", "src", "marcha.js"))) {
    const NM = Math.max(N, 200);
    console.log(`\n(j) A MARCHA ÚNICA — a hora de cada viagem da região pelas quatro contas (${NM} mundos)`);
    let srcHEAD = "";
    try {
      srcHEAD = arvoreDeHEAD();
      console.log(resumoMarcha("antes (a árvore de HEAD)", await medirMarcha(srcHEAD, NM)));
    } catch (e) { console.log(`  antes: a árvore de HEAD não se extraiu (${e.message})`); }
    finally { try { if (srcHEAD) rmSync(dirname(srcHEAD), { recursive: true, force: true }); } catch { /* fica */ } }
    console.log(resumoMarcha("depois (a conta única)", await medirMarcha(join(AQUI, "..", "src"), NM)));
  }
  console.log(`\n(e) a PIOR CENA REAL do prompt (teste-prompt.mjs): ${piorCenaReal()} caracteres (o teto é 82.000)`);
}
