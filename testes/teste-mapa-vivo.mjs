/* O MAPA VIVO (MM17, etapa D) — os dados da tela do mapa em tempo real

   A pessoa desenha no Figma o mapa em tempo real (no lugar dos banners), na
   escala da região; outra mão o liga no App. Esta suíte prova o que essa
   tela vai ler — `dadosDoMapaVivo` (src/mapa-vivo.js) —, sem desenhar nada:

     1. as tabelas, lidas de volta (a neblina, o ato, o dia);
     2. o quadro e os nós: tudo em [0,1], nenhum nó em cima de outro, e o
        quadro FIXO enquanto a neblina abre (senão o pergaminho mexe e o
        tamanho dele conta que há coisa escondida);
     3. as arestas: ligam nós que existem, e as horas são as da ficha e as da
        viagem (`rotaAteAMasmorra`, `mapa.rotas`) — zero contradições;
     4. o herói num sítio só, nos estados base, povoado, boca, masmorra,
        arredor e viagem;
     5. a viagem interpolada de 0 a 1, sem saltos, de ponta a ponta;
     6. a neblina: um mundo novo mostra a base, os boatos e o gancho, e NADA
        do clímax nem do segredo; e abre pelo que a regra diz;
     7. o horizonte na borda, sem ficha, cada nome num rumo seu;
     8. o relógio;
     9. o continente antigo e o lixo: nunca estoura;
    10. a região v1;
    11. determinismo, nenhum Math.random, entrada congelada intocada;
    12. QUEM LÁ ANDA (P3, 10/10): o `quem` de cada nó com ficha aberta é a
        ficha e é a planta — as três vias concordam a 100% —, o boato e o
        oculto não o têm, sem nível, e a saída quase não cresce.

   FALHA ANTES (HEAD v9.361): `src/mapa-vivo.js` não existe, e o import cai
   na primeira linha. A secção 12 falha antes da P3: nenhum nó tinha
   `quem`, e a concordância dava 0 em todos os mundos. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as MV from "../src/mapa-vivo.js";
import * as R from "../src/regiao.js";
import { gerarGeografia } from "../src/geografia.js";
import { moldePorId } from "../src/moldes.js";
import { estenderEspinha } from "../src/saga.js";
import { ESTRUTURAS } from "../src/historia.js";
import { rotaAteAMasmorra, chegadaABoca, jornadaAteAMasmorra } from "../src/boca.js";
import { abrirViagem, andar, HORAS_MARCHA_POR_DIA } from "../src/viagem.js";
import { concluirLugar, garantirBase } from "../src/mundo-base.js";
import { segredosGuardados } from "../src/segredo-guardado.js";
import { ehNoite } from "../src/calendario.js";
import { definirLugar } from "../src/lugar.js";
import { sementeDe, generoDe, LEXICO_DA_MEDIDA } from "./medir-regiao.mjs";
import { gerarMasmorra } from "../src/masmorras.js";
import { masmorrasDoMundo } from "../src/mundo-base.js";
import { hashSemente, rng } from "../src/semente.js";

const AQUI = dirname(fileURLToPath(import.meta.url));
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^(o|a|os|as)\s+/, "").trim();
const EPS = 1e-9;

/* ---------------- os mundos ---------------- */
const N = 200;
const molde = moldePorId("sobremundo");
const mundos = [];
for (let i = 0; i < N; i++) {
  const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id;
  const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero, estrutura, modo: "historia" }));
  const e0 = estenderEspinha({ semente, mapa, genero, molde, estrutura, cidadeInicial: mapa.cidades[0].nome });
  const espinha = R.espinhaNaRegiao(mapa, e0, { semente, genero, molde });
  mundos.push({ semente, genero, mapa, espinha, base: mapa.cidades[0], climax: mapa.regiao.lugares.find((l) => l.ato === "fim") });
}
const novo = (w, extra = {}) => ({ cidadeAtual: w.base.nome, espinha: w.espinha, etapa: 0, dia: 1, minuto: 480, semente: w.semente, ...extra });
/* tudo aberto: todas as cidades pisadas e todos os lugares concluídos */
const tudoAberto = (w) => {
  const mapa = { ...w.mapa, cidades: w.mapa.cidades.map((c) => ({ ...c, descoberta: true, pisada: true })) };
  let base = garantirBase(null);
  for (const l of w.mapa.regiao.lugares) base = concluirLugar(base, l.nome);
  return { mapa, estado: novo(w, { base, etapa: w.espinha.atos.length - 1 }) };
};

sec("1. as tabelas, lidas de volta");
{
  const E = MV.ESTADOS_DA_NEBLINA;
  t("os cinco estados, do escuro ao aberto", E.join(",") === "desconhecido,boato,conhecido,visitado,concluido");
  t("todo piso é um estado", Object.values(MV.PISO_DA_NEBLINA).every((s) => E.includes(s)));
  t("o clímax parte do desconhecido, a base do visitado", MV.PISO_DA_NEBLINA.climax === "desconhecido" && MV.PISO_DA_NEBLINA.base === "visitado");
  t("todo sinal abre para um estado", Object.values(MV.SINAIS_DA_NEBLINA).every((s) => E.includes(s)));
  t("o clímax só acorda por sinais que existem", MV.SINAIS_QUE_ACORDAM_O_CLIMAX.every((s) => s in MV.SINAIS_DA_NEBLINA));
  /* as duas portas que o abririam cedo demais: a vila ao pé (pode ser a
     base) e o gancho do ato anterior */
  t("e nem a vila ao pé nem o gancho o acordam", !MV.SINAIS_QUE_ACORDAM_O_CLIMAX.includes("pertoDeOndeDormiu") && !MV.SINAIS_QUE_ACORDAM_O_CLIMAX.includes("oGanchoApontaLa"));
  t("cada estado diz o que mostra", E.every((s) => MV.O_QUE_A_NEBLINA_MOSTRA[s]) && MV.O_QUE_A_NEBLINA_MOSTRA.desconhecido.aparece === false);
  t("o boato não tem ficha (perigo, vizinhos)", !MV.O_QUE_A_NEBLINA_MOSTRA.boato.perigo && !MV.O_QUE_A_NEBLINA_MOSTRA.boato.vizinhos);
  /* se o paralelo levasse rótulo, os lugares sem rótulo seriam, por
     exclusão, os da história */
  t("o paralelo nunca se diz", MV.REVELACAO_DO_ATO.paralelo === "nunca" && MV.REVELACAO_DO_ATO.fim === "quandoOAtoChega");
  const F = MV.FASES_DO_DIA;
  t("as fases do dia cobrem as 24 horas, crescentes", F[F.length - 1].ate === 1440 && F.every((f, i) => i === 0 || f.ate > F[i - 1].ate));
  let discorda = 0;
  for (let m = 0; m < 1440; m++) {
    const r = MV.dadosDoMapaVivo(mundos[0].mapa, novo(mundos[0], { minuto: m })).relogio;
    if ((r.fase === "madrugada" || r.fase === "noite") !== ehNoite(m) || r.noite !== ehNoite(m) || !(r.luz >= 0 && r.luz <= 1)) discorda++;
  }
  t("as fases e a noite do calendário não discordam (1440 minutos)", discorda === 0, `${discorda}`);
  t("a margem cabe no quadro", MV.MOLDURA_DO_MAPA_VIVO.margem > 0 && MV.MOLDURA_DO_MAPA_VIVO.margem < 0.5);
  t("a curva da luz fica entre 0 e 1, e fecha o dia", MV.LUZ_DO_DIA.every(([m, l]) => m >= 0 && m <= 1440 && l >= 0 && l <= 1) && MV.LUZ_DO_DIA[0][0] === 0 && MV.LUZ_DO_DIA[MV.LUZ_DO_DIA.length - 1][0] === 1440);
  t("o chão duro sobe o perigo da estrada", MV.PERIGO_NA_ESTRADA.chaoDuroSobe >= 1 && MV.PERIGO_NA_ESTRADA.povoado === "baixo");
}

sec("2. o quadro e os nós (tudo aberto)");
{
  let fora = 0, contagemErrada = 0, iguais = 0, mexe = 0, minimo = Infinity, pertos = 0;
  const lados = [], horas = [];
  const LEGIVEL = 0.02;   // ~1,5 km num lado de ~75 km: dois ícones que se tocam
  for (const w of mundos) {
    const { mapa, estado } = tudoAberto(w);
    const d = MV.dadosDoMapaVivo(mapa, estado);
    const esperado = mapa.cidades.length + mapa.regiao.lugares.length;
    if (d.nos.length !== esperado) contagemErrada++;
    const mg = MV.MOLDURA_DO_MAPA_VIVO.margem;
    for (const n of d.nos) if (!(n.x >= mg - 1e-3 && n.x <= 1 - mg + 1e-3 && n.y >= mg - 1e-3 && n.y <= 1 - mg + 1e-3)) fora++;
    for (let a = 0; a < d.nos.length; a++) for (let b = a + 1; b < d.nos.length; b++) {
      const dd = Math.hypot(d.nos[a].x - d.nos[b].x, d.nos[a].y - d.nos[b].y);
      if (dd <= EPS) iguais++;
      if (dd < LEGIVEL) pertos++;
      minimo = Math.min(minimo, dd);
    }
    /* o quadro não mexe com a neblina: o mesmo nó, no mundo novo, no mesmo sítio */
    const d0 = MV.dadosDoMapaVivo(w.mapa, novo(w));
    for (const n of d0.nos) { const m = d.nos.find((x) => x.id === n.id); if (!m || m.x !== n.x || m.y !== n.y) mexe++; }
    if (JSON.stringify(d0.quadro) !== JSON.stringify(d.quadro)) mexe++;
    lados.push(d.quadro.ladoKm); horas.push(d.quadro.ladoHoras);
  }
  t(`todos os nós dentro do quadro, depois da margem (${N} mundos)`, fora === 0, `${fora} fora`);
  t("todo ponto da região vira nó (base + povoados + lugares)", contagemErrada === 0, `${contagemErrada}`);
  t(`nenhum nó em cima de outro (distância mínima ${minimo.toFixed(4)} > 0)`, iguais === 0 && minimo > 0, `${iguais} pares iguais`);
  console.log(`      pares a menos de ${LEGIVEL} do lado (ícones que se tocam): ${pertos} em ${N} mundos — a tela afasta os rótulos, a posição é a verdade das horas`);
  t("o quadro não mexe enquanto a neblina abre", mexe === 0, `${mexe}`);
  const med = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  console.log(`      lado do quadro: mediana ${med(lados)} km (${med(horas)} h de marcha), de ${Math.min(...lados)} a ${Math.max(...lados)} km`);
  t("o lado tem a escala de dois dias de marcha (entre 30 e 120 km)", lados.every((x) => x >= 30 && x <= 120));
  const q = MV.dadosDoMapaVivo(mundos[0].mapa, novo(mundos[0])).quadro;
  t("a régua é redonda e cabe no canto", MV.MOLDURA_DO_MAPA_VIVO.reguasKm.includes(q.regua.km) && q.regua.fracao > 0 && q.regua.fracao <= MV.MOLDURA_DO_MAPA_VIVO.reguaMaxima);
}

sec("3. as arestas: ligam nós que existem, com as horas da ficha e da viagem");
{
  let soltas = 0, contraRota = 0, contraFicha = 0, contraViagem = 0, contraVolta = 0, total = 0, semRota = 0;
  for (const w of mundos) {
    for (const est of [novo(w), tudoAberto(w).estado]) {
      const mapa = est.base ? tudoAberto(w).mapa : w.mapa;
      const d = MV.dadosDoMapaVivo(mapa, est);
      const ids = new Set(d.nos.map((n) => n.id));
      const lugar = (id) => mapa.regiao.lugares.find((l) => l.id === id);
      const cid = (id) => mapa.cidades.find((c) => `cidade|${c.nome}` === id);
      for (const a of d.arestas) {
        total++;
        if (!ids.has(a.de) || !ids.has(a.para)) soltas++;
        if (a.origem === "rota") {
          const r = mapa.rotas.find((x) => (`cidade|${x.de}` === a.de && `cidade|${x.para}` === a.para) || (`cidade|${x.para}` === a.de && `cidade|${x.de}` === a.para));
          if (!r) semRota++;
          else if (Math.abs(r.dias * HORAS_MARCHA_POR_DIA - a.horas) > EPS) contraRota++;
          continue;
        }
        /* da ficha: a hora é a que a ficha guardou... */
        const L = lugar(a.de), P = lugar(a.para);
        if (cid(a.de) && P) {
          if (Math.abs(P.ficha.horas - a.horas) > EPS) contraFicha++;
          /* ...e é a que a boca cobra, pela régua da região */
          const ida = rotaAteAMasmorra(P, cid(a.de), { regiao: mapa.regiao });
          const h = ida.modo === "a_pe" ? ida.minutos / 60 : ida.dias * HORAS_MARCHA_POR_DIA;
          if (Math.abs(Math.round(h * 100) / 100 - a.horas) > EPS) contraViagem++;
        } else if (L) {
          const v = L.ficha.vizinhos.find((x) => x.id === (lugar(a.para) ? a.para : (cid(a.para) || {}).nome));
          if (!v || Math.abs(v.horas - a.horas) > EPS) contraFicha++;
          if (a.horasDeVolta != null) {
            const P2 = lugar(a.para);
            const vv = P2 && P2.ficha.vizinhos.find((x) => x.id === L.id);
            if (!vv || Math.abs(vv.horas - a.horasDeVolta) > EPS) contraVolta++;
          }
        } else contraFicha++;
      }
    }
  }
  t(`toda aresta liga dois nós da lista (${total} arestas)`, soltas === 0, `${soltas}`);
  t("toda estrada é uma rota do mapa", semRota === 0, `${semRota}`);
  t("as horas da estrada são os dias da rota × 8", contraRota === 0, `${contraRota}`);
  t("as horas da ida são as da ficha", contraFicha === 0, `${contraFicha}`);
  t("e as da ficha são as que a viagem cobra (rotaAteAMasmorra)", contraViagem === 0, `${contraViagem}`);
  t("e a volta, quando as duas fichas a medem, é a da outra ficha", contraVolta === 0, `${contraVolta}`);
  /* a cor da aresta não diz o que a ficha cala */
  let perigoVazado = 0;
  for (const w of mundos) {
    const d = MV.dadosDoMapaVivo(w.mapa, novo(w));
    const calado = new Set(d.nos.filter((n) => n.tipo === "lugar" && n.perigo == null).map((n) => n.id));
    for (const a of d.arestas) if ((calado.has(a.de) || calado.has(a.para)) && a.perigo != null) perigoVazado++;
  }
  t("aresta para um boato não tem perigo", perigoVazado === 0, `${perigoVazado}`);
}

sec("4. o herói num sítio só");
{
  const SALAS = [{ id: 0, camada: 0, visitada: true }, { id: 1, camada: 1, visitada: true }, { id: 2, camada: 1, visitada: false }, { id: 3, camada: 2, visitada: false }];
  const conta = { base: 0, povoado: 0, boca: 0, masmorra: 0, covil: 0, arredor: 0, viagem: 0, viagemLugar: 0 };
  let erros = 0;
  const um = (d, onde, comNo) => {
    const aqui = d.nos.filter((n) => n.aqui);
    const certo = d.heroi.onde === onde && (comNo ? aqui.length === 1 && aqui[0].id === d.heroi.noId : aqui.length === 0 && d.heroi.noId === null)
      && Number.isFinite(d.heroi.x) && Number.isFinite(d.heroi.y) && d.heroi.x >= 0 && d.heroi.x <= 1 && d.heroi.y >= 0 && d.heroi.y <= 1;
    if (!certo) erros++;
    return certo;
  };
  for (const w of mundos) {
    const pov = w.mapa.cidades[1];
    const l = w.mapa.regiao.lugares.find((x) => x.ato !== "fim");
    if (um(MV.dadosDoMapaVivo(w.mapa, novo(w)), "base", true)) conta.base++;
    if (um(MV.dadosDoMapaVivo(w.mapa, novo(w, { cidadeAtual: pov.nome })), "povoado", true)) conta.povoado++;
    const boca = chegadaABoca(l, { cidade: l.cidadeProxima }).lugar;
    if (um(MV.dadosDoMapaVivo(w.mapa, novo(w, { cidadeAtual: l.cidadeProxima, lugar: boca })), "boca", true)) conta.boca++;
    const mm = { nome: l.nome, salas: SALAS, atual: 2, coord: { x: l.x, y: l.y } };
    const dm = MV.dadosDoMapaVivo(w.mapa, novo(w, { cidadeAtual: l.cidadeProxima, lugar: boca, masmorra: mm }));
    if (um(dm, "masmorra", true) && dm.heroi.masmorra.camada === 1 && dm.heroi.masmorra.camadas === 2 && dm.heroi.masmorra.progresso.visitadas === 2 && dm.heroi.masmorra.progresso.total === 4) conta.masmorra++;
    /* o covil sem nome no mapa (a IA batizou uma entrada): lá dentro, no ponto da boca */
    const covil = { nome: "Toca Sem Nome Nenhum", salas: SALAS, atual: 0, coord: { x: w.base.x + 0.1, y: w.base.y } };
    if (um(MV.dadosDoMapaVivo(w.mapa, novo(w, { masmorra: covil })), "masmorra", false)) conta.covil++;
    const arr = definirLugar("a fazenda do velho", { cidade: w.base.nome, distancia: "arredores", coord: { x: w.base.x + 0.05, y: w.base.y + 0.05 } });
    if (um(MV.dadosDoMapaVivo(w.mapa, novo(w, { lugar: arr })), "arredor", false)) conta.arredor++;
    const rota = w.mapa.rotas.find((r) => r.de === w.base.nome || r.para === w.base.nome);
    const outro = rota.de === w.base.nome ? rota.para : rota.de;
    const j = andar(abrirViagem({ de: w.base.nome, para: outro, rota }), 60);
    const dv = MV.dadosDoMapaVivo(w.mapa, novo(w, { jornada: j }));
    if (um(dv, "viagem", false) && dv.heroi.jornada.paraId === `cidade|${outro}` && dv.heroi.jornada.arestaId) conta.viagem++;
    const lE = w.mapa.regiao.lugares.find((x) => x.ato !== "fim" && x.ficha.modo === "estrada");
    if (lE) {
      const ida = rotaAteAMasmorra(lE, w.base, { de: w.base.nome, regiao: w.mapa.regiao });
      const jm = andar(jornadaAteAMasmorra({ rota: ida, masmorra: lE, origem: w.base }, { de: w.base.nome }), 60);
      const dl = MV.dadosDoMapaVivo(w.mapa, novo(w, { jornada: jm }));
      if (um(dl, "viagem", false) && dl.heroi.jornada.paraId === lE.id) conta.viagemLugar++;
    } else conta.viagemLugar++;
  }
  for (const [k, v] of Object.entries(conta)) t(`${k}: o herói num sítio só (${v}/${N})`, v === N);
  t("nenhum estado com o herói em dois sítios ou em nenhum", erros === 0, `${erros}`);
  /* sem cidade, sem lugar, sem nada: em lugar nenhum, e nenhum nó aceso */
  const d = MV.dadosDoMapaVivo(mundos[0].mapa, { minuto: 480 });
  t("sem nada registado, o herói não está em sítio nenhum", d.heroi.onde === "nenhum" && d.nos.every((n) => !n.aqui));
}

sec("5. a viagem interpolada, sem saltos");
{
  let fora = 0, saltos = 0, recua = 0, pontas = 0, horasMal = 0, passos = 0;
  for (const w of mundos) {
    const rota = w.mapa.rotas.find((r) => r.de === w.base.nome || r.para === w.base.nome);
    const outro = rota.de === w.base.nome ? rota.para : rota.de;
    let j = abrirViagem({ de: w.base.nome, para: outro, rota });
    const A = MV.dadosDoMapaVivo(w.mapa, novo(w)).nos.find((n) => n.id === `cidade|${w.base.nome}`);
    const B = MV.dadosDoMapaVivo(w.mapa, novo(w, { cidadeAtual: outro })).nos.find((n) => n.id === `cidade|${outro}`);
    const seg = Math.hypot(B.x - A.x, B.y - A.y);
    let ant = null;
    /* o teto: uma fração que não chega a 1 não pode prender a suíte */
    for (let k = 0; k < 500; k++) {
      const d = MV.dadosDoMapaVivo(w.mapa, novo(w, { jornada: j }));
      const h = d.heroi, jj = h.jornada;
      passos++;
      if (!(jj.fracao >= 0 && jj.fracao <= 1)) fora++;
      if (Math.abs(jj.horasFeitas + jj.horasQueFaltam - jj.horasTotais) > 0.011) horasMal++;
      if (ant) {
        if (jj.fracao < ant.f - EPS) recua++;
        if (Math.hypot(h.x - ant.x, h.y - ant.y) > seg * (jj.fracao - ant.f) + 2e-3) saltos++;
      } else if (Math.hypot(h.x - A.x, h.y - A.y) > 2e-3) pontas++;
      ant = { f: jj.fracao, x: h.x, y: h.y };
      if (jj.fracao >= 1) { if (Math.hypot(h.x - B.x, h.y - B.y) > 2e-3) pontas++; break; }
      if (k === 499) pontas++;
      j = andar(j, 30);
    }
  }
  t(`a fração fica entre 0 e 1 (${passos} passos de meia hora)`, fora === 0, `${fora}`);
  t("e nunca volta para trás", recua === 0, `${recua}`);
  t("a posição anda o que a fração andou, sem saltos", saltos === 0, `${saltos}`);
  t("parte do ponto de partida e chega ao de chegada", pontas === 0, `${pontas}`);
  t("as horas feitas e as que faltam somam as totais", horasMal === 0, `${horasMal}`);
}

sec("6. a neblina: o mundo novo, e o que a abre");
{
  let climaxVisto = 0, fimDito = 0, meioCedo = 0, paraleloDito = 0, segredoVazado = 0, baseMal = 0, ganchoMal = 0, semBoato = 0, ocultos = 0;
  for (const w of mundos) {
    const d = MV.dadosDoMapaVivo(w.mapa, novo(w));
    const txt = JSON.stringify(d);
    /* NADA do clímax: nem nó, nem vizinho, nem aresta, nem o nome em lado nenhum */
    if (d.nos.some((n) => n.id === w.climax.id) || txt.includes(w.climax.id) || norm(txt).includes(norm(w.climax.nome))) climaxVisto++;
    if (d.nos.some((n) => n.atoDaHistoria === "fim")) fimDito++;
    if (d.nos.some((n) => n.atoDaHistoria === "meio")) meioCedo++;
    if (d.nos.some((n) => n.atoDaHistoria === "paralelo")) paraleloDito++;
    /* o segredo da espinha (o "o que X esconde"): nem o título, nem o lugar como nó */
    for (const s of segredosGuardados(w.espinha)) if (txt.includes(s.titulo) || d.nos.some((n) => norm(n.nome) === norm(s.nome))) segredoVazado++;
    const b = d.nos.find((n) => n.tipo === "base");
    if (!b || b.estado !== "visitado" || b.atoDaHistoria !== "inicio" || !b.aqui) baseMal++;
    /* o gancho: o lugar do ato seguinte (a abertura nomeia o primeiro do meio) */
    const ganchos = d.nos.filter((n) => n.momento === "proximo");
    if (!ganchos.length || ganchos.some((n) => n.estado !== "conhecido" || n.atoDaHistoria !== null)) ganchoMal++;
    if (!d.nos.some((n) => n.estado === "boato")) semBoato++;
    if (d.neblina.ocultos >= 1) ocultos++;
  }
  t(`num mundo novo o clímax não está em lado nenhum (${N} mundos)`, climaxVisto === 0, `${climaxVisto}`);
  t("ninguém diz \"fim\"", fimDito === 0, `${fimDito}`);
  t("nenhum lugar diz \"meio\" antes de o ato chegar", meioCedo === 0, `${meioCedo}`);
  t("o paralelo nunca se diz", paraleloDito === 0);
  t("nada do segredo da espinha", segredoVazado === 0, `${segredoVazado}`);
  t("a base aparece visitada, com o início, e o herói lá", baseMal === 0, `${baseMal}`);
  t("o gancho aponta um lugar conhecido, sem dizer o ato", ganchoMal === 0, `${ganchoMal}`);
  t("e há boatos", semBoato === 0, `${semBoato}`);
  t("a contagem diz que há o que não se vê", ocultos === N, `${ocultos}/${N}`);

  /* O QUE A ABRE */
  let chegaFim = 0, conclui = 0, pisa = 0, dormiu = 0, boca = 0, paraleloConcluido = 0, climaxNaBoca = 0, climaxPelaVila = 0, dito = 0, estrada = 0;
  for (const w of mundos) {
    const ultimo = w.espinha.atos.length - 1;
    const df = MV.dadosDoMapaVivo(w.mapa, novo(w, { etapa: ultimo }));
    const c = df.nos.find((n) => n.id === w.climax.id);
    if (c && c.estado === "conhecido" && c.atoDaHistoria === "fim" && c.momento === "agora") chegaFim++;
    const l = w.mapa.regiao.lugares.find((x) => x.ato === "meio");
    const dc = MV.dadosDoMapaVivo(w.mapa, novo(w, { base: concluirLugar(null, l.nome) }));
    if ((dc.nos.find((n) => n.id === l.id) || {}).estado === "concluido") conclui++;
    const par = w.mapa.regiao.lugares.find((x) => x.ato === "paralelo");
    if (!par) paraleloConcluido++;
    else {
      const dp = MV.dadosDoMapaVivo(w.mapa, novo(w, { base: concluirLugar(null, par.nome), etapa: ultimo }));
      const np = dp.nos.find((n) => n.id === par.id);
      if (np && np.estado === "concluido" && np.atoDaHistoria === null) paraleloConcluido++;
    }
    const pov = w.mapa.cidades[1];
    const dpv = MV.dadosDoMapaVivo({ ...w.mapa, cidades: w.mapa.cidades.map((x) => (x === pov ? { ...x, descoberta: true, pisada: true } : x)) }, novo(w));
    if ((dpv.nos.find((n) => n.id === `cidade|${pov.nome}`) || {}).estado === "visitado") pisa++;
    /* quem dormiu na vila sabe o caminho para a mina — menos para o clímax */
    const daVila = w.mapa.regiao.lugares.filter((x) => x.cidadeProxima === pov.nome);
    const okVila = daVila.every((x) => {
      const n = dpv.nos.find((y) => y.id === x.id);
      return x.ato === "fim" ? !n : n && MV.ESTADOS_DA_NEBLINA.indexOf(n.estado) >= MV.ESTADOS_DA_NEBLINA.indexOf("conhecido");
    });
    if (okVila) dormiu++;
    if (daVila.some((x) => x.ato === "fim")) climaxPelaVila++;
    const b = chegadaABoca(l, { cidade: l.cidadeProxima }).lugar;
    if ((MV.dadosDoMapaVivo(w.mapa, novo(w, { lugar: b })).nos.find((n) => n.id === l.id) || {}).estado === "visitado") boca++;
    /* à boca do clímax antes da hora: o herói vê o lugar, não o ato */
    const bc = chegadaABoca(w.climax, { cidade: w.climax.cidadeProxima }).lugar;
    const nc = MV.dadosDoMapaVivo(w.mapa, novo(w, { lugar: bc })).nos.find((n) => n.id === w.climax.id);
    if (nc && nc.estado === "visitado" && nc.atoDaHistoria === null && nc.momento === null) climaxNaBoca++;
    if ((MV.dadosDoMapaVivo(w.mapa, novo(w, { conhecidos: [w.climax.nome] })).nos.find((n) => n.id === w.climax.id) || {}).estado === "conhecido") dito++;
    const ida = rotaAteAMasmorra(w.climax, w.base, { de: w.base.nome, regiao: w.mapa.regiao });
    const jm = ida && ida.modo === "estrada" ? jornadaAteAMasmorra({ rota: ida, masmorra: w.climax, origem: w.base }, { de: w.base.nome }) : null;
    if (!jm || (MV.dadosDoMapaVivo(w.mapa, novo(w, { jornada: jm })).nos.find((n) => n.id === w.climax.id) || {}).estado === "conhecido") estrada++;
  }
  t(`quando a história chega ao fim, o clímax aparece e diz "fim" (${chegaFim}/${N})`, chegaFim === N);
  t("a masmorra concluída fica concluída", conclui === N, `${conclui}`);
  t("e o paralelo concluído continua sem rótulo", paraleloConcluido === N, `${paraleloConcluido}`);
  t("a cidade pisada fica visitada", pisa === N, `${pisa}`);
  t(`quem dormiu na vila conhece os lugares dela, e não o clímax (${climaxPelaVila} mundos com o clímax ao pé dessa vila)`, dormiu === N, `${dormiu}`);
  t("à boca de um lugar, ele fica visitado", boca === N, `${boca}`);
  t("à boca do clímax antes da hora: o lugar sim, o ato não", climaxNaBoca === N, `${climaxNaBoca}`);
  t("o App pode dizê-lo conhecido (estado.conhecidos)", dito === N, `${dito}`);
  t("a estrada que vai para lá abre-o", estrada === N, `${estrada}`);
}

sec("7. o horizonte: na borda, sem ficha, um rumo cada");
{
  let mal7 = 0, dentro = 0;
  for (const w of mundos) {
    const d = MV.dadosDoMapaVivo(w.mapa, novo(w));
    const h = d.horizonte;
    const naBorda = h.every((x) => [x.x, x.y].some((v) => Math.abs(v) < 1e-6 || Math.abs(v - 1) < 1e-6) && x.x >= 0 && x.x <= 1 && x.y >= 0 && x.y <= 1);
    const chaves = h.every((x) => Object.keys(x).sort().join(",") === "boato,nome,rotulo,rumo,tipo,x,y");
    const rumos = new Set(h.map((x) => x.rumo)).size === h.length;
    if (h.length !== w.mapa.regiao.horizonte.length || !naBorda || !chaves || !rumos) mal7++;
    const nomes = new Set(d.nos.map((n) => norm(n.nome)));
    if (h.some((x) => nomes.has(norm(x.nome)))) dentro++;
  }
  t(`cada nome na borda, num rumo seu, só nome, tipo, boato e rumo (${N} mundos)`, mal7 === 0, `${mal7}`);
  t("nenhum nome do horizonte é um nó da região", dentro === 0, `${dentro}`);
}

sec("8. o relógio");
{
  const w = mundos[0];
  const r = (minuto, dia = 1) => MV.dadosDoMapaVivo(w.mapa, novo(w, { minuto, dia })).relogio;
  t("às 8h é manhã, de dia", r(480).fase === "manha" && r(480).noite === false && r(480).hora === "08:00");
  t("às 22h é noite", r(1320).fase === "noite" && r(1320).noite === true);
  t("ao meio-dia a luz é a maior", r(720).luz === Math.max(...MV.LUZ_DO_DIA.map((x) => x[1])));
  t("o dia 100 é verão", r(600, 100).estacao === "verao");
  t("sem minuto não há relógio", MV.dadosDoMapaVivo(w.mapa, { cidadeAtual: w.base.nome }).relogio === null);
}

sec("9. o continente antigo e o lixo: nunca estoura");
{
  let nulos = 0, estourou = 0;
  for (let i = 0; i < N; i++) {
    try {
      const geo = gerarGeografia(sementeDe(i), molde);
      const velho = R.mapaDaCampanhaNova(geo);
      if (MV.dadosDoMapaVivo(velho, { cidadeAtual: velho.cidades[0].nome, minuto: 480 }) === null) nulos++;
    } catch { estourou++; }
  }
  t(`o mapa continental sem região devolve null (${nulos}/${N}) e nunca estoura`, nulos === N && estourou === 0, `${estourou} estouros`);
  const lixos = [null, undefined, 0, 42, "x", [], {}, { regiao: null }, { regiao: {} }, { regiao: [] }, { regiao: { lugares: null } },
    { cidades: null, regiao: { base: { nome: "X" } } }, { cidades: [null, 3, { nome: "A" }], regiao: { lugares: [null, {}, { id: "q", nome: "Q" }] } }];
  let lixoMal = 0;
  for (const m of lixos) for (const e of [null, undefined, 3, "x", [], {}, { jornada: null, masmorra: null, lugar: null, base: null, espinha: null }]) {
    try { const d = MV.dadosDoMapaVivo(m, e); if (d !== null) lixoMal++; } catch { lixoMal++; }
  }
  t("mapa de lixo devolve null, com qualquer estado", lixoMal === 0, `${lixoMal}`);
  /* o estado de lixo, campo a campo, num mapa bom: nunca estoura, e o mapa sai */
  const w = mundos[1];
  const L = [null, undefined, 0, -1, NaN, "", "lixo", [], {}, [null], { nome: null }, { nome: "x", salas: "y", coord: "z" }, true];
  const campos = ["cidadeAtual", "lugar", "masmorra", "jornada", "base", "espinha", "etapa", "dia", "minuto", "semente", "visitados", "conhecidos", "historia"];
  let campoMal = 0, combos = 0;
  for (const k of campos) for (const v of L) {
    combos++;
    try { const d = MV.dadosDoMapaVivo(w.mapa, novo(w, { [k]: v })); if (!d || !d.nos.length || !d.heroi) campoMal++; } catch (err) { campoMal++; console.log(`      ${k}=${String(v)}: ${err.message}`); }
  }
  t(`estado de lixo campo a campo (${combos} combinações): o mapa sai sempre`, campoMal === 0, `${campoMal}`);
  /* a região com pedaços estragados: o que está bom aparece, o resto cai */
  let partido = 0;
  for (const w2 of mundos.slice(0, 40)) {
    const r = w2.mapa.regiao;
    const estragado = { ...w2.mapa, rotas: [null, ...w2.mapa.rotas, { de: "x" }], regiao: { ...r, quadro: null, horizonte: [null, 7, ...r.horizonte], lugares: [null, { nome: "sem ponto" }, ...r.lugares.map((l, i) => (i === 0 ? { ...l, ficha: null } : l))] } };
    try { const d = MV.dadosDoMapaVivo(estragado, novo(w2)); if (!d || d.nos.some((n) => !(n.x >= 0 && n.x <= 1 && n.y >= 0 && n.y <= 1))) partido++; } catch { partido++; }
  }
  t("a região com pedaços estragados não estoura e fica dentro do quadro", partido === 0, `${partido}`);
}

sec("10. a região v1 (medida pela régua antiga)");
{
  let mal10 = 0, contra = 0;
  for (const w of mundos.slice(0, 60)) {
    const v1 = { ...w.mapa, regiao: { ...w.mapa.regiao, versao: 1 } };
    const d = MV.dadosDoMapaVivo(v1, tudoAberto(w).estado);
    if (!d || d.regiao.versao !== 1 || d.nos.some((n) => !(n.x >= 0 && n.x <= 1 && n.y >= 0 && n.y <= 1))) mal10++;
    for (const a of d ? d.arestas : []) {
      const l = v1.regiao.lugares.find((x) => x.id === a.para);
      if (a.origem === "ficha" && a.de === `cidade|${w.base.nome}` && l && Math.abs(l.ficha.horas - a.horas) > EPS) contra++;
    }
  }
  t("a região v1 desenha-se igual (60 mundos)", mal10 === 0, `${mal10}`);
  t("e as horas continuam as da ficha que ela tem", contra === 0, `${contra}`);
}

sec("11. determinismo, nenhum Math.random, entrada congelada intocada");
{
  let iguais = 0;
  for (const w of mundos) {
    const est = novo(w, { etapa: 1, jornada: andar(abrirViagem({ de: w.base.nome, para: w.mapa.cidades[1].nome, rota: w.mapa.rotas[0] }), 120) });
    if (JSON.stringify(MV.dadosDoMapaVivo(w.mapa, est)) === JSON.stringify(MV.dadosDoMapaVivo(w.mapa, est))) iguais++;
  }
  t(`mesma entrada, mesma saída (${iguais}/${N})`, iguais === N);
  /* o horizonte é o único sorteio: a mesma semente dá os mesmos rumos, e
     duas sementes não dão sempre os mesmos */
  const rumos = (s) => MV.dadosDoMapaVivo(mundos[3].mapa, novo(mundos[3], { semente: s })).horizonte.map((h) => h.rumo).join(",");
  t("o rumo do horizonte sai da semente", rumos("a") === rumos("a") && new Set(["a", "b", "c", "d", "e"].map(rumos)).size > 1);

  const fonte = readFileSync(join(AQUI, "..", "src", "mapa-vivo.js"), "utf8");
  t("o módulo não chama o Math.random", !/Math\.random/.test(fonte));
  const acaso = Math.random;
  let tocou = false;
  Math.random = () => { tocou = true; return 0.5; };
  try { for (const w of mundos.slice(0, 20)) MV.dadosDoMapaVivo(w.mapa, novo(w, { etapa: 2 })); } finally { Math.random = acaso; }
  t("e nada do que ele chama o toca", !tocou);

  const congelar = (o) => { if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); for (const v of Object.values(o)) congelar(v); } return o; };
  let mutou = 0, estourou = 0;
  for (const w of mundos.slice(0, 50)) {
    const { mapa, estado } = tudoAberto(w);
    const lugar = chegadaABoca(w.mapa.regiao.lugares[0], { cidade: w.base.nome }).lugar;
    const e = { ...estado, lugar, masmorra: { nome: w.mapa.regiao.lugares[0].nome, salas: [{ id: 0, camada: 0, visitada: true }], atual: 0 }, visitados: [w.base.nome], conhecidos: [] };
    const antes = JSON.stringify([mapa, e]);
    congelar(mapa); congelar(e);
    try { MV.dadosDoMapaVivo(mapa, e); } catch { estourou++; }
    if (JSON.stringify([mapa, e]) !== antes) mutou++;
  }
  t("entrada congelada a fundo: nada estoura (o modo estrito do módulo estouraria ao mutar)", estourou === 0, `${estourou}`);
  t("e nada mudou", mutou === 0, `${mutou}`);
}

sec("12. quem lá anda (P3): o nó, a ficha e a planta dizem os mesmos bichos");
{
  /* O cartão do lugar diz "Cultistas e esqueletos" — a primeira coisa que
     um jogador pergunta antes de ir. A verdade é a da v9.363: a ficha é quem
     lá está (`ficha.quem`), e a planta nasce dela à porta (`quemDoLugar` →
     `gerarMasmorra(…, { salas, quem })`, o caminho do App). Esta secção
     prova as TRÊS vias — nó = ficha = planta — e que a neblina as cala onde
     cala o perigo. Antes da P3 nenhum nó tinha `quem`: a concordância dava
     0/N e a secção caía. */
  const ACASO = Math.random;
  const semeado = (sm, f) => { Math.random = rng(hashSemente(sm)); try { return f(); } finally { Math.random = ACASO; } };
  const ABERTOS = new Set(["conhecido", "visitado", "concluido"]);
  const NIVEL = /\d|\bn[ií]vel\b|\bnv\b|\blvl\b/i;
  const temQuem = (n) => Object.prototype.hasOwnProperty.call(n, "quem");
  /* a planta de um lugar, pelo caminho do App (entrarMasmorra): a masmorra
     do mapa (as salas dela) e o quem que a porta lê da ficha */
  const plantaDe = (w, mms, l) => {
    const doMapa = mms.find((x) => norm(x.nome) === norm(l.nome)) || null;
    const quem = doMapa ? R.quemDoLugar(w.mapa, doMapa.id) : null;
    const mm = semeado(`mapa-vivo|quem|${w.semente}|${l.nome}`, () => gerarMasmorra(w.genero, l.nivel, "", { salas: doMapa ? doMapa.salas : l.salas, quem }));
    const luta = mm.salas.filter((x) => x.tipo === "combate" || x.tipo === "chave" || x.tipo === "chefe");
    return new Set(luta.flatMap((x) => (x.inimigos || []).map((e) => e.nome)));
  };
  const mesmoConjunto = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
  let nos = 0, noFicha = 0, noPlanta = 0, tres = 0, comNivel = 0, naoTexto = 0, semQuemAberto = 0;
  let calados = 0, vazou = 0, naoLugar = 0, climaxAntes = 0, climaxNaBoca = 0, climaxNoFim = 0;
  const estados = { conhecido: 0, visitado: 0, concluido: 0 };
  let cresceMax = 0, cresceRel = 0;
  const tamanhos = { antes: [], depois: [] };
  for (const w of mundos) {
    const mms = masmorrasDoMundo(w.semente, w.mapa);
    const planta = new Map();
    const lugar = (id) => w.mapa.regiao.lugares.find((l) => l.id === id);
    /* três momentos: o mundo novo (o gancho conhecido), todos os lugares
       pisados menos o clímax (visitado) e tudo concluído */
    const pisados = novo(w, { visitados: w.mapa.regiao.lugares.filter((l) => l.ato !== "fim").map((l) => l.nome) });
    const aberto = tudoAberto(w);
    for (const [mapa, est] of [[w.mapa, novo(w)], [w.mapa, pisados], [aberto.mapa, aberto.estado]]) {
      const d = MV.dadosDoMapaVivo(mapa, est);
      for (const n of d.nos) {
        if (n.tipo !== "lugar") { if (temQuem(n)) naoLugar++; continue; }
        if (!ABERTOS.has(n.estado) || n.perigo == null) { calados++; if (temQuem(n)) vazou++; continue; }
        if (!temQuem(n)) { semQuemAberto++; continue; }
        nos++; estados[n.estado]++;
        const l = lugar(n.id);
        const ficha = l.ficha.quem.map((x) => x.nome);
        const fichaOk = JSON.stringify(n.quem) === JSON.stringify(ficha);
        if (fichaOk) noFicha++;
        if (!planta.has(l.id)) planta.set(l.id, plantaDe(w, mms, l));
        const p = planta.get(l.id);
        const plantaOk = mesmoConjunto(new Set(n.quem), p);
        if (plantaOk) noPlanta++;
        if (fichaOk && plantaOk && mesmoConjunto(new Set(ficha), p)) tres++;
        if (n.quem.some((x) => typeof x !== "string")) naoTexto++;
        else if (n.quem.some((x) => NIVEL.test(x))) comNivel++;
      }
      /* o tamanho: a mesma saída sem o campo é a de antes da P3 (o campo só
         se acrescenta; nada mais na saída mudou) */
      const depois = JSON.stringify(d).length;
      const antes = JSON.stringify({ ...d, nos: d.nos.map(({ quem, ...r }) => r) }).length;
      tamanhos.antes.push(antes); tamanhos.depois.push(depois);
      cresceMax = Math.max(cresceMax, depois - antes);
      cresceRel = Math.max(cresceRel, (depois - antes) / antes);
    }
    /* o clímax: oculto no mundo novo (nem nó, logo nem quem); quando o ato
       do fim chega, aparece com a ficha — e com o quem dela */
    if (MV.dadosDoMapaVivo(w.mapa, novo(w)).nos.some((n) => n.id === w.climax.id)) climaxAntes++;
    const c = MV.dadosDoMapaVivo(w.mapa, novo(w, { etapa: w.espinha.atos.length - 1 })).nos.find((n) => n.id === w.climax.id);
    if (c && JSON.stringify(c.quem) === JSON.stringify(w.climax.ficha.quem.map((x) => x.nome))) climaxNoFim++;
    /* à boca do clímax antes do ato: o herói está lá e vê quem lá anda (o
       perigo já se mostrava), e o ato continua calado */
    const bc = chegadaABoca(w.climax, { cidade: w.climax.cidadeProxima }).lugar;
    const nb = MV.dadosDoMapaVivo(w.mapa, novo(w, { lugar: bc })).nos.find((n) => n.id === w.climax.id);
    if (nb && nb.atoDaHistoria === null && Array.isArray(nb.quem) && nb.perigo != null) climaxNaBoca++;
  }
  console.log(`      ${nos} nós com ficha aberta (conhecido ${estados.conhecido}, visitado ${estados.visitado}, concluído ${estados.concluido}); ${calados} calados pela neblina`);
  t(`há nós em todos os estados abertos (${N} mundos × 3 momentos)`, estados.conhecido >= N && estados.visitado > N && estados.concluido > N);
  t(`todo lugar de ficha aberta tem quem (${semQuemAberto} sem)`, semQuemAberto === 0 && nos > 0);
  t(`nó = ficha: os nomes, na ordem dela (${noFicha}/${nos})`, noFicha === nos);
  t(`nó = planta: os bichos que a planta põe nas salas de luta (${noPlanta}/${nos})`, noPlanta === nos);
  t(`as três vias concordam, nó = ficha = planta (${tres}/${nos}, 100%)`, tres === nos);
  t("o quem é só nomes, em texto (nada de objeto com nível ou ameaça)", naoTexto === 0, `${naoTexto}`);
  t("e nenhum nome traz nível", comNivel === 0, `${comNivel}`);
  t(`o boato e o lugar sem perigo não têm quem (${calados} nós calados)`, vazou === 0 && calados > N, `${vazou} vazaram`);
  t("povoado e base não têm quem", naoLugar === 0, `${naoLugar}`);
  t("o clímax oculto num mundo novo não é nó (logo, não tem quem)", climaxAntes === 0, `${climaxAntes}`);
  t(`quando o ato do fim chega, o clímax diz quem lá anda (${climaxNoFim}/${N})`, climaxNoFim === N);
  t(`à boca do clímax antes do ato: quem lá anda sim, o ato não (${climaxNaBoca}/${N})`, climaxNaBoca === N);

  /* o tamanho: a tela guarda a saída em estado (memorizada pelos refs) */
  const med = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  const QUEM_CRESCE = { chars: 400, fracao: 0.03 };
  console.log(`      JSON da saída: mediana ${med(tamanhos.antes)} → ${med(tamanhos.depois)} chars, máximo ${Math.max(...tamanhos.antes)} → ${Math.max(...tamanhos.depois)}; o pior mundo cresce ${cresceMax} chars (${(cresceRel * 100).toFixed(1)}%)`);
  t(`a saída não cresce mais de ${QUEM_CRESCE.chars} chars nem ${QUEM_CRESCE.fracao * 100}% por mundo`, cresceMax <= QUEM_CRESCE.chars && cresceRel <= QUEM_CRESCE.fracao, `${cresceMax} chars, ${(cresceRel * 100).toFixed(1)}%`);

  /* num mundo com léxico, os nomes são os renomeados: o nó diz o que a
     ficha diz, não o nome do bestiário */
  let lexNos = 0, lexOk = 0, lexDoLexico = 0;
  const doLexico = new Set(LEXICO_DA_MEDIDA.criaturas.flatMap((c) => c.nomes));
  for (let i = 0; i < 40; i++) {
    const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente: sementeDe(i), molde, genero: generoDe(i), lex: LEXICO_DA_MEDIDA, estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id, modo: "historia" }));
    const w = { mapa, base: mapa.cidades[0], semente: sementeDe(i), espinha: { atos: [{}] } };
    const { mapa: ma, estado } = tudoAberto(w);
    for (const n of MV.dadosDoMapaVivo(ma, estado).nos.filter((x) => x.tipo === "lugar")) {
      lexNos++;
      const l = mapa.regiao.lugares.find((x) => x.id === n.id);
      if (JSON.stringify(n.quem) === JSON.stringify(l.ficha.quem.map((x) => x.nome))) lexOk++;
      if (Array.isArray(n.quem) && n.quem.every((x) => doLexico.has(x))) lexDoLexico++;
    }
  }
  t(`com léxico, o nó diz os nomes renomeados da ficha (${lexOk}/${lexNos}, 40 mundos)`, lexOk === lexNos && lexNos > 200);
  t(`e todos são nomes do léxico (${lexDoLexico}/${lexNos})`, lexDoLexico === lexNos);

  /* o lixo na ficha: a lista podre fica com o que é nome, o resto cai sem
     estourar; e mexer na saída não mexe na ficha */
  const w = mundos[2];
  const { mapa: ma, estado } = tudoAberto(w);
  const alvo = ma.regiao.lugares.find((l) => l.ato !== "fim");
  const comFicha = (quem) => ({ ...ma, regiao: { ...ma.regiao, lugares: ma.regiao.lugares.map((l) => (l === alvo ? { ...l, ficha: { ...l.ficha, quem } } : l)) } });
  const quemDe = (mapa) => { try { const n = MV.dadosDoMapaVivo(mapa, estado).nos.find((x) => x.id === alvo.id); return n ? (temQuem(n) ? n.quem : "sem") : "nó"; } catch { return "estourou"; } };
  t("ficha podre: fica só o que é nome", JSON.stringify(quemDe(comFicha([null, 3, "Lobo", { nome: "" }, { nome: 7 }, { nome: "Urso", nivel: 4, ameaca: "elite" }]))) === JSON.stringify(["Urso"]));
  t("ficha sem lista, ou vazia: sem quem, sem estourar", [null, undefined, "x", 5, {}, []].every((x) => quemDe(comFicha(x)) === "sem"));
  const d = MV.dadosDoMapaVivo(ma, estado);
  const n = d.nos.find((x) => x.id === alvo.id);
  const antes = JSON.stringify(alvo.ficha.quem);
  n.quem.push("Intruso"); n.quem[0] = "Trocado";
  t("mexer no quem da saída não mexe na ficha (é cópia)", JSON.stringify(alvo.ficha.quem) === antes);
}

console.log(`\n${ok} ok, ${mal} falhas`);
if (mal) process.exit(1);
