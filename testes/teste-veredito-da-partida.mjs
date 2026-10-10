/* O VEREDITO DA PARTIDA (P2, 10/10) — o preço inteiro de partir, antes do clique

   O pedido do mapa (`mente/pedidos-ao-sistema.md`, P2): o cartão de um lugar
   acaba no verbo "Partir para X" com o preço por baixo — as horas, a
   chegada, as noites na estrada, o perigo, a volta e por onde se vai. O
   `jogo` não assina o Partir sem isto, e a conta não pode ser da tela.

   A régua: o veredito NÃO TEM CONTA PRÓPRIA. Tudo o que diz tem de ser o
   que o jogo cobra ao partir — e é isso que esta suíte prova, par a par:

     1. as tabelas, lidas de volta (e o fator do ritmo contra o App);
     2. 200 regiões × todos os pares (de uma povoação, da base ou da boca de
        um lugar, a cada lugar e povoação): as horas e a rota são as da
        jornada que `idaAMasmorra`/`partidaNaRegiao` abrem; a chegada e as
        noites são as que o laço de `viajar` cobra; nenhuma viagem além da
        promessa sem o motivo do chão; o perigo da estrada é o da aresta do
        mapa vivo onde ela existe;
     3. a neblina: destino oculto → null; boato → sem perigo do lugar;
     4. o ritmo de marcha mexe no relógio, não nas horas;
     5. de onde se parte: a boca, o arredor; e onde não se parte;
     6. a volta é a ida de lá para cá, pela mesma porta;
     7. o mapa antigo e o continente; determinismo, lixo, imutabilidade;
     8. o que anda enquanto se anda: a exaustão, as invocações, as petições,
        a revolta e o passo da ameaça — e o prazo de missão, que NÃO anda;
     9. a medida (medir-regiao.mjs, secção k).

   FALHA ANTES: `src/partida.js` não existe, e o import cai na primeira
   linha — o cartão não tinha veredito nenhum. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as PA from "../src/partida.js";
import * as R from "../src/regiao.js";
import * as RA from "../src/rastro.js";
import * as BO from "../src/boca.js";
import * as MA from "../src/marcha.js";
import * as MV from "../src/mapa-vivo.js";
import * as MB from "../src/mundo-base.js";
import * as VI from "../src/viagem.js";
import { RITMOS_VIAGEM } from "../src/ermos.js";
import { MINUTOS_POR_TURNO, ehNoite } from "../src/calendario.js";
import { gerarGeografia, TERRENO_VIAGEM } from "../src/geografia.js";
import { moldePorId } from "../src/moldes.js";
import { ESTRUTURAS } from "../src/historia.js";
import { sementeDe, generoDe, medirVeredito, mediana, maximo } from "./medir-regiao.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const J = (v) => JSON.stringify(v);
const EPS = 0.005;
const P = R.PROMESSA_DA_REGIAO;
const T = PA.VEREDITO_DA_PARTIDA;

/* ---------------- os mundos ---------------- */
const N = 200;
const molde = moldePorId("sobremundo");
const mundos = [];
for (let i = 0; i < N; i++) {
  const semente = sementeDe(i), genero = generoDe(i);
  const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero, estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id, modo: "historia" }));
  const nos = [...mapa.cidades.map((c, j) => ({ tipo: j ? "povoado" : "base", src: c, nome: c.nome, id: `cidade|${c.nome}` })), ...mapa.regiao.lugares.map((l) => ({ tipo: "lugar", src: l, nome: l.nome, id: String(l.id) }))];
  mundos.push({ i, semente, genero, mapa, nos, base: mapa.cidades[0], masmorras: MB.masmorrasDoMundo(semente, mapa) });
}
/* o herói em `a`, com tudo dito (a neblina é a secção 3) */
const todosOsNomes = (w) => w.nos.map((n) => n.nome);
const estadoEm = (w, a, extra = {}) => ({
  cidadeAtual: a.tipo === "lugar" ? w.base.nome : a.nome,
  lugar: a.tipo === "lugar" ? { nome: a.nome, coord: { x: a.src.x, y: a.src.y }, distancia: "perto", cidade: w.base.nome } : null,
  dia: 4, minuto: 9 * 60, semente: w.semente, conhecidos: todosOsNomes(w), mapa: w.mapa, ...extra,
});
const dadosDe = (w, e) => MV.dadosDoMapaVivo(w.mapa, e);

/* O relógio que `viajar` cobra, contado de OUTRA maneira: o número de
   avanços é o de `progressoDaViagem` (turnosTotais), e cada um custa o
   relógio do avanço vezes o ritmo, mais o turno. A pé até à boca, os
   minutos da caminhada e o turno. */
const relogioCobrado = (jornada, minutosAPe, fator = 1) => {
  if (!jornada) return minutosAPe + MINUTOS_POR_TURNO;
  const n = VI.progressoDaViagem(jornada).turnosTotais;
  return n * (Math.round(VI.relogioDoAvanco(jornada) * fator) + MINUTOS_POR_TURNO);
};

/* ============================================================ */
sec("1. as tabelas — lidas de volta, e o ritmo contra o App");
{
  const app = tenta(() => readFileSync(join(AQUI, "..", "src", "App.jsx"), "utf8"), "");
  const m = /const fator = rit\.id === "rapido" \? ([\d.]+) : rit\.id === "lento" \? ([\d.]+) : ([\d.]+);/.exec(app);
  t("o App multiplica o relógio da estrada pelo ritmo (a linha existe)", !!m);
  t("e o veredito usa os MESMOS fatores", !!m && T.relogioDoRitmo.rapido === Number(m[1]) && T.relogioDoRitmo.lento === Number(m[2]) && T.relogioDoRitmo.normal === Number(m[3]));
  t("um fator por ritmo de marcha, nenhum a mais", J(Object.keys(T.relogioDoRitmo).sort()) === J(RITMOS_VIAGEM.map((r) => r.id).sort()));
  t("o turno paga os minutos do turno (calendario.js)", T.minutosDoTurno === MINUTOS_POR_TURNO && /extraTempo = avancarMinutos\(MINUTOS_POR_TURNO\)/.test(app));
  t("a caminhada até à boca cobra os minutos dela (irAteABoca)", /if \(ida\.rota\.modo === "a_pe"\) \{\s*const tempo = avancarMinutos\(Number\(ida\.rota\.minutos\) \|\| 0\)/.test(app));
  t("e cada avanço o relógio do avanço (viajar)", /minutosDoRelogio = relogioDoAvanco\(jornadaRef\.current\);\s*jornadaRef\.current = andar\(jornadaRef\.current, minutosPorAvanco\(jornadaRef\.current\)/.test(app));
  const mv = tenta(() => readFileSync(join(AQUI, "..", "src", "mapa-vivo.js"), "utf8"), "");
  t("onde não se parte são estados do herói do mapa vivo", T.ondeNaoSeParte.every((o) => mv.includes(`onde: "${o}"`)));
  t("a ponta sem nó pesa como uma das pontas da tabela", MV.PERIGO_NA_ESTRADA[T.pontaSemNo] !== undefined);
}

/* ============================================================ */
sec("2. 200 regiões × todos os pares — o que o veredito diz é o que se cobra");
const nomeDoId = (w, id) => { const n = w.nos.find((x) => x.id === id); return n ? n.nome : null; };
{
  let pares = 0, comVeredito = 0, horasIguais = 0, rotaIgual = 0, relogioIgual = 0, chegadaCerta = 0, noitesCertas = 0;
  let desvios = 0, desvioPorPovoacoes = 0, promessa = 0, comAresta = 0, arestaIgual = 0, perigoIgual = 0, volta = 0, voltaIgual = 0;
  let deBoca = 0, aPe = 0, exemplo = null, contra = null, semAresta = 0, semArestaRegra = 0;
  const PER = R.PERIGO_POR_NIVEL.map((x) => x.id), PE = MV.PERIGO_NA_ESTRADA;
  for (const w of mundos) {
    for (const a of w.nos) {
      const e = estadoEm(w, a);
      const dados = dadosDe(w, e);
      for (const b of w.nos) {
        if (a === b) continue;
        pares++;
        const v = PA.vereditoDaPartida(dados, b.id, e);
        if (!v) { contra = contra || { i: w.i, de: a.nome, para: b.nome, porque: "sem veredito" }; continue; }
        comVeredito++;
        if (a.tipo === "lugar") deBoca++;
        /* A JORNADA DO JOGO, pela porta do jogo */
        let horas = NaN, rota = null, jornada = null, minutosAPe = 0;
        if (b.tipo === "lugar") {
          const ida = RA.idaAMasmorra(`Vou a ${b.nome}.`, { cidadeAtual: e.cidadeAtual, cidades: w.mapa.cidades.map((c) => c.nome), mapa: w.mapa, masmorras: w.masmorras, lugar: e.lugar, jornada: null });
          if (ida && ida.rota) {
            if (ida.rota.modo === "a_pe") { horas = ida.rota.minutos / 60; minutosAPe = ida.rota.minutos; aPe++; }
            else { jornada = BO.jornadaAteAMasmorra(ida, { de: e.cidadeAtual, dia: e.dia }); horas = jornada.totalMin / 60; }
            rota = ida.rota.percurso ? ida.rota.percurso.map((p) => p.nome) : [a.nome, b.nome];
          }
        } else {
          const p = MA.partidaNaRegiao(w.mapa, { cidadeAtual: e.cidadeAtual, lugar: e.lugar, destino: b.nome, dia: e.dia });
          if (p) { jornada = p.jornada; horas = p.jornada.totalMin / 60; rota = p.rota.percurso ? p.rota.percurso.map((q) => q.nome) : [a.nome, b.nome]; }
        }
        if (Math.abs(v.horas - horas) <= EPS) horasIguais++;
        else contra = contra || { i: w.i, de: a.nome, para: b.nome, horas: v.horas, jornada: horas };
        if (rota && J(v.rota.map((id) => nomeDoId(w, id))) === J(rota)) rotaIgual++;
        else contra = contra || { i: w.i, de: a.nome, para: b.nome, rota: v.rota, jornada: rota };
        const rel = relogioCobrado(jornada, minutosAPe);
        if (v.minutosDeRelogio === rel && v.avancos === (jornada ? VI.progressoDaViagem(jornada).turnosTotais : 0)) relogioIgual++;
        else contra = contra || { i: w.i, de: a.nome, para: b.nome, relogio: v.minutosDeRelogio, cobrado: rel };
        /* a chegada: o relógio de partida mais o cobrado, com o dia a virar à meia-noite */
        const fim = e.minuto + rel;
        if (v.chegada && v.chegada.dia === e.dia + Math.floor(fim / 1440) && v.chegada.minuto === fim % 1440 && v.chegada.noite === ehNoite(fim % 1440) && MV.FASES_DO_DIA.some((f) => f.id === v.chegada.fase)) chegadaCerta++;
        if (v.noites === Math.floor(fim / 1440) && Math.abs(v.dias - rel / 1440) < 0.006) noitesCertas++;
        /* o caminho pelas povoações quando o direto passa de um dia */
        if (v.desvio) {
          desvios++;
          if (v.rota.length > 2 && v.rota.slice(1, -1).every((id) => id.startsWith("cidade|")) && v.pernas.length === v.rota.length - 1) desvioPorPovoacoes++;
          if (!exemplo && b.tipo === "lugar" && a.tipo !== "lugar") exemplo = { de: a.nome, para: b.nome, v };
        }
        const teto = a.tipo === "base" || b.tipo === "base" ? P.daBase : P.pontaAPonta;
        if (v.horas <= teto + EPS || (!v.cumpre && v.motivo)) promessa++;
        /* a aresta do mapa vivo, quando o par a tem: a mesma hora e a mesma cor */
        const ar = dados.arestas.find((x) => (x.de === a.id && x.para === b.id) || (x.para === a.id && x.de === b.id));
        if (ar && !v.desvio) {
          comAresta++;
          const h = ar.de === a.id ? ar.horas : ar.horasDeVolta != null ? ar.horasDeVolta : ar.horas;
          if (Math.abs(h - v.horas) <= 0.05) arestaIgual++;
          if (ar.perigo === v.perigoDaEstrada) perigoIgual++;
        }
        /* sem traço no mapa, a mesma régua da aresta, com o chão da ida */
        if (!ar && !v.desvio) {
          const pp = (id) => { const n = dados.nos.find((x) => x.id === id); return !n ? null : n.tipo !== "lugar" ? PE.povoado : n.perigo; };
          const pa = pp(a.id), pb = pp(b.id);
          if (pa && pb) {
            semAresta++;
            const td = TERRENO_VIAGEM[v.pernas[0].terreno];
            let k = Math.max(PER.indexOf(pa), PER.indexOf(pb)) + (td && td.kmDia > 0 && td.kmDia < PE.kmDiaDoChaoDuro ? PE.chaoDuroSobe : 0);
            if (v.perigoDaEstrada === PER[Math.min(PER.length - 1, k)]) semArestaRegra++;
          }
        }
        /* a volta: o veredito de lá para cá, com o herói lá */
        const eLa = b.tipo === "lugar" ? estadoEm(w, b, { cidadeAtual: e.cidadeAtual }) : estadoEm(w, b);
        const casa = a;
        const vb = PA.vereditoDaPartida(dadosDe(w, eLa), casa.id, eLa);
        if (vb) { volta++; if (v.horasDeVolta === vb.horas) voltaIgual++; }
      }
    }
  }
  t(`há veredito para todo par (${comVeredito}/${pares})`, comVeredito === pares && pares > 20000, J(contra));
  t(`as horas são as da jornada que o jogo abre (${horasIguais}/${pares}: 0 contradições)`, horasIguais === pares, J(contra));
  t(`a rota é a da jornada — a ida reta, ou o percurso pelas povoações (${rotaIgual}/${pares})`, rotaIgual === pares, J(contra));
  t(`o relógio é o que viajar cobra, avanço a avanço (${relogioIgual}/${pares})`, relogioIgual === pares, J(contra));
  t(`a chegada: o dia, o minuto, a fase e a noite (${chegadaCerta}/${pares})`, chegadaCerta === pares);
  t(`as noites são as viradas do dia na estrada, e os dias o relógio (${noitesCertas}/${pares})`, noitesCertas === pares);
  t(`da boca de um lugar também (${deBoca} pares) e a pé até à boca (${aPe})`, deBoca > 8000 && aPe > 500);
  t(`o caminho pelas povoações aparece (${desvios}) e só passa por elas (${desvioPorPovoacoes}/${desvios})`, desvios > 500 && desvioPorPovoacoes === desvios);
  if (exemplo) console.log(`      ex.: ${exemplo.de} → ${exemplo.para}: ${exemplo.v.pernas.map((p) => `${p.horas} h ${p.modo === "a_pe" ? "a pé" : "de estrada"}`).join(" + ")}, por ${exemplo.v.rota.slice(1, -1).map((id) => id.slice(7)).join(" e ")}`);
  t(`nenhuma viagem além da promessa sem o motivo do chão (${promessa}/${pares})`, promessa === pares);
  t(`onde o mapa vivo desenha a aresta, a hora é a dela (${arestaIgual}/${comAresta})`, arestaIgual === comAresta && comAresta > 5000);
  t(`e a cor do perigo da estrada também — o veredito herda o traço (${perigoIgual}/${comAresta})`, perigoIgual === comAresta);
  t(`sem traço, a régua da aresta com o chão da ida (${semArestaRegra}/${semAresta})`, semArestaRegra === semAresta && semAresta > 1000);
  t(`a volta é o veredito de lá para cá (${voltaIgual}/${volta})`, voltaIgual === volta && volta === pares);
}

/* ============================================================ */
sec("3. a neblina — o que o mapa não mostra, o veredito não diz");
{
  let ocultos = 0, ocultoNulo = 0, boatos = 0, boatoSemPerigo = 0, boatoComHoras = 0, calada = 0, conhecidos = 0, comPerigo = 0;
  for (const w of mundos.slice(0, 100)) {
    const e = { cidadeAtual: w.base.nome, dia: 1, minuto: 480, semente: w.semente, mapa: w.mapa };
    const dados = dadosDe(w, e);
    for (const b of w.nos.filter((x) => x.tipo === "lugar")) {
      const no = dados.nos.find((x) => x.id === b.id);
      const v = PA.vereditoDaPartida(dados, b.id, e);
      if (!no) { ocultos++; if (v === null) ocultoNulo++; continue; }
      if (no.estado === "boato") {
        boatos++;
        if (v && v.perigoDoLugar === null) boatoSemPerigo++;
        if (v && v.horas > 0) boatoComHoras++;
        if (v && v.perigoDaEstrada === null) calada++;
      } else if (v) { conhecidos++; if (v.perigoDoLugar === no.perigo && v.perigoDoLugar) comPerigo++; }
    }
  }
  t(`o lugar oculto (o clímax antes do ato) não tem veredito (${ocultoNulo}/${ocultos})`, ocultos >= 100 && ocultoNulo === ocultos);
  t(`o boato tem preço de viagem (${boatoComHoras}/${boatos})`, boatos > 100 && boatoComHoras === boatos);
  t(`mas não o perigo do lugar (${boatoSemPerigo}/${boatos})`, boatoSemPerigo === boatos);
  t(`nem a cor da estrada que acaba nele (${calada}/${boatos})`, calada === boatos);
  t(`o lugar conhecido diz o perigo da ficha (${comPerigo}/${conhecidos})`, conhecidos > 50 && comPerigo === conhecidos);
  /* o id que não é nó (o clímax por id cru) não fura a neblina */
  const w = mundos[0];
  const climax = w.mapa.regiao.lugares.find((l) => l.ato === "fim");
  const e = { cidadeAtual: w.base.nome, dia: 1, minuto: 480, semente: w.semente, mapa: w.mapa };
  t("o clímax pedido pelo id, sem o jogador o conhecer: null", !!climax && PA.vereditoDaPartida(dadosDe(w, e), String(climax.id), e) === null);
  t("e quando o dizem ao herói, tem", !!climax && !!PA.vereditoDaPartida(dadosDe(w, { ...e, conhecidos: [climax.nome] }), String(climax.id), { ...e, conhecidos: [climax.nome] }));
}

/* ============================================================ */
sec("4. o ritmo de marcha — mexe no relógio, não na estrada");
{
  let n = 0, horasIguais = 0, rapidoMenos = 0, lentoMais = 0, aPeIgual = 0, aPes = 0, cobrado = 0;
  for (const w of mundos.slice(0, 40)) {
    const e = estadoEm(w, w.nos[0]);
    const dados = dadosDe(w, e);
    for (const b of w.nos.slice(1)) {
      const [vn, vr, vl] = ["normal", "rapido", "lento"].map((ritmo) => PA.vereditoDaPartida(dados, b.id, { ...e, ritmo }));
      if (vn.modo === "a_pe") { aPes++; if (vr.minutosDeRelogio === vn.minutosDeRelogio && vl.minutosDeRelogio === vn.minutosDeRelogio) aPeIgual++; continue; }
      n++;
      if (vr.horas === vn.horas && vl.horas === vn.horas && J(vr.rota) === J(vn.rota)) horasIguais++;
      if (vr.minutosDeRelogio < vn.minutosDeRelogio) rapidoMenos++;
      if (vl.minutosDeRelogio > vn.minutosDeRelogio) lentoMais++;
      const j = { totalMin: Math.round(vn.horas * 60) };
      if (vr.minutosDeRelogio === vr.avancos * (Math.round(VI.relogioDoAvanco(j) * T.relogioDoRitmo.rapido) + MINUTOS_POR_TURNO)) cobrado++;
    }
  }
  t(`as horas e a rota não mudam com o ritmo (${horasIguais}/${n})`, n > 300 && horasIguais === n);
  t(`quem corre chega mais cedo (${rapidoMenos}/${n}), quem vai devagar mais tarde (${lentoMais}/${n})`, rapidoMenos === n && lentoMais === n);
  t(`com o fator que o App aplica (${cobrado}/${n})`, cobrado === n);
  t(`a caminhada até à boca não tem ritmo (${aPeIgual}/${aPes})`, aPeIgual === aPes);
  const w = mundos[0], e = estadoEm(w, w.nos[0]), d = dadosDe(w, e), b = w.nos[1];
  t("ritmo desconhecido é o normal", J(PA.vereditoDaPartida(d, b.id, { ...e, ritmo: "voando" })) === J(PA.vereditoDaPartida(d, b.id, e)));
}

/* ============================================================ */
sec("5. de onde se parte — e onde não se parte");
{
  const w = mundos[2], base = w.nos[0];
  const l = w.nos.find((x) => x.tipo === "lugar");
  const p = w.nos.find((x) => x.tipo === "povoado");
  /* o arredor: fora dos muros, sem nó no mapa */
  const arredor = { nome: "Moinho Velho", coord: { x: base.src.x + 0.2, y: base.src.y + 0.1 }, distancia: "perto", cidade: base.nome };
  const eA = { ...estadoEm(w, base), lugar: arredor };
  const dA = dadosDe(w, eA);
  const vA = PA.vereditoDaPartida(dA, l.id, eA);
  const ida = RA.idaAMasmorra(`Vou a ${l.nome}.`, { cidadeAtual: base.nome, cidades: w.mapa.cidades.map((c) => c.nome), mapa: w.mapa, masmorras: w.masmorras, lugar: arredor, jornada: null });
  const hA = ida.rota.modo === "a_pe" ? ida.rota.minutos / 60 : BO.jornadaAteAMasmorra(ida, { de: base.nome }).totalMin / 60;
  t(`o herói num arredor (${dA.heroi.onde}) parte do arredor para um lugar: ${vA && vA.horas} h = ${Math.round(hA * 100) / 100} h`, dA.heroi.onde === "arredor" && !!vA && Math.abs(vA.horas - hA) <= EPS);
  t("e a rota começa no destino seguinte (o arredor não é nó)", !!vA && vA.rota[vA.rota.length - 1] === l.id && !vA.rota.includes(null));
  const vAp = PA.vereditoDaPartida(dA, p.id, eA);
  const pp = MA.partidaNaRegiao(w.mapa, { cidadeAtual: base.nome, lugar: arredor, destino: p.nome });
  t("para uma povoação parte-se da cidade (a jornada de partidaNaRegiao)", !!vAp && Math.abs(vAp.horas - pp.jornada.totalMin / 60) <= EPS);
  t("e a volta de um arredor é para a cidade dele", !!vAp && vAp.horasDeVolta === PA.vereditoDaPartida(dadosDe(w, estadoEm(w, p)), base.id, estadoEm(w, p)).horas);
  /* onde não se parte */
  const eB = estadoEm(w, base), dB = dadosDe(w, eB);
  t("para onde já se está: null", PA.vereditoDaPartida(dB, base.id, eB) === null);
  const eL = estadoEm(w, l), dL = dadosDe(w, eL);
  t("à boca do próprio lugar: null", PA.vereditoDaPartida(dL, l.id, eL) === null);
  const ida2 = RA.idaAMasmorra(`Vou a ${l.nome}.`, { cidadeAtual: base.nome, cidades: w.mapa.cidades.map((c) => c.nome), mapa: w.mapa, masmorras: w.masmorras, lugar: null, jornada: null });
  const jr = ida2.rota.modo === "estrada" ? BO.jornadaAteAMasmorra(ida2, { de: base.nome }) : VI.abrirViagem({ de: base.nome, para: p.nome });
  const eV = { ...eB, jornada: jr }, dV = dadosDe(w, eV);
  t(`na estrada (${dV.heroi.onde}): null — anda-se na que se tem`, dV.heroi.onde === "viagem" && PA.vereditoDaPartida(dV, p.id, eV) === null);
  const eM = { ...eB, masmorra: { nome: l.nome, coord: { x: l.src.x, y: l.src.y }, salas: [] } }, dM = dadosDe(w, eM);
  t(`lá dentro (${dM.heroi.onde}): null — sai-se primeiro`, dM.heroi.onde === "masmorra" && PA.vereditoDaPartida(dM, p.id, eM) === null);
  const eN = { ...eB, cidadeAtual: "Lugar Nenhum" }, dN = dadosDe(w, eN);
  t(`sem saber onde o herói está (${dN.heroi.onde}): null`, dN.heroi.onde === "nenhum" && PA.vereditoDaPartida(dN, p.id, eN) === null);
  /* sem relógio: o preço sem a chegada */
  const eR = { ...eB, minuto: undefined }, vR = PA.vereditoDaPartida(dadosDe(w, eR), p.id, eR);
  t("sem relógio: as horas e o resto, a chegada e as noites null", !!vR && vR.horas > 0 && vR.chegada === null && vR.noites === null && vR.minutosDeRelogio > 0);
}

/* ============================================================ */
sec("6. o veredito antes de partir — o pedido do mapa, em número");
{
  /* o par que o pedido cita (Torre Serena → Agulha de Ferro, semente 0): o
     pedido supôs "por Pedra Serena, 8 h + 2,5 h a pé" porque o mapa vivo
     não desenha aresta entre os dois (a ficha da Agulha não traz a Torre
     por vizinha). A jornada do jogo vai DIRETA — 8 h, um dia de marcha —, e
     o veredito diz a do jogo, não a do desenho. */
  const w = mundos[0];
  const de = w.nos.find((n) => n.nome === "Torre Serena"), para = w.nos.find((n) => n.nome === "Agulha de Ferro");
  const e = estadoEm(w, de, { dia: 3, minuto: 480 }), d = dadosDe(w, e);
  const v = de && para ? PA.vereditoDaPartida(d, para.id, e) : null;
  const ida = RA.idaAMasmorra("Vou à Agulha de Ferro.", { cidadeAtual: de.nome, cidades: w.mapa.cidades.map((c) => c.nome), mapa: w.mapa, masmorras: w.masmorras, lugar: null, jornada: null });
  t(`Torre Serena → Agulha de Ferro: ${v && v.horas} h, ${v && v.noites} noite, chega dia ${v && v.chegada.dia} às ${v && v.chegada.hora}`, !!v && v.horas === BO.jornadaAteAMasmorra(ida, { de: de.nome }).totalMin / 60 && J(v.rota) === J([de.id, para.id]));
  t("o mapa vivo não desenha esse traço — e o veredito leva a perna para a tela o desenhar", !d.arestas.some((a) => (a.de === de.id && a.para === para.id) || (a.para === de.id && a.de === para.id)) && v.pernas.length === 1);
  /* meio dia de marcha custa meio dia de calendário; um dia, um dia */
  const meio = w.nos.find((n) => n.nome === "Muralha Quebrada de Prata Podre");
  const eC = estadoEm(w, w.nos[0], { minuto: 480 }), dC = dadosDe(w, eC);
  const vMeio = PA.vereditoDaPartida(dC, meio.id, eC);
  t(`meio dia de marcha (${vMeio.horas} h): parte às 08:00, chega às ${vMeio.chegada.hora} (${vMeio.chegada.fase}), sem noite`, vMeio.horas === 4 && vMeio.noites === 0 && vMeio.chegada.minuto === 480 + 720 + MINUTOS_POR_TURNO);
  /* o achado (v9.364) que fica no relato: uma vila a minutos de uma boca,
     aberta como jornada, cobra um avanço inteiro de relógio */
  let curta = null;
  for (const x of mundos) {
    for (const l of x.nos.filter((n) => n.tipo === "lugar")) for (const c of x.nos.filter((n) => n.tipo === "povoado")) {
      const ee = estadoEm(x, l), vv = PA.vereditoDaPartida(dadosDe(x, ee), c.id, ee);
      if (vv && vv.modo === "a_pe" && (!curta || vv.horas < curta.v.horas)) curta = { de: l.nome, para: c.nome, v: vv };
    }
    if (curta) break;
  }
  if (curta) console.log(`      a jornada curta: ${curta.de} → ${curta.para}, ${Math.round(curta.v.horas * 60)} min de caminhada, e o relógio cobra ${curta.v.minutosDeRelogio} min (um avanço de estrada)`);
  t("a jornada curta a uma povoação: o veredito diz o avanço inteiro que viajar cobra", !!curta && curta.v.avancos === 1 && curta.v.minutosDeRelogio === VI.relogioDoAvanco({ totalMin: 1 }) + MINUTOS_POR_TURNO);
}

/* ============================================================ */
sec("7. o mapa antigo, o continente, o lixo — e o determinismo");
{
  const w = mundos[5], base = w.nos[0], l = w.nos.find((x) => x.tipo === "lugar");
  const e = estadoEm(w, base), d = dadosDe(w, e);
  const v1 = { ...w.mapa, regiao: { ...w.mapa.regiao, versao: 1 } };
  t("a região v1 (medida pela régua antiga): null", PA.vereditoDaPartida(MV.dadosDoMapaVivo(v1, e), l.id, { ...e, mapa: v1 }) === null);
  const cont = R.mapaDaCampanhaNova(gerarGeografia(sementeDe(5), molde));
  const eC = { cidadeAtual: cont.cidades[0].nome, mapa: cont, dia: 1, minuto: 480 };
  t("o continente (dadosDoMapaVivo dá null): null", MV.dadosDoMapaVivo(cont, eC) === null && PA.vereditoDaPartida(MV.dadosDoMapaVivo(cont, eC), `cidade|${cont.cidades[1].nome}`, eC) === null);
  t("dados de um mapa, estado sem o mapa: null", PA.vereditoDaPartida(d, l.id, { ...e, mapa: undefined }) === null);
  const lixos = [null, undefined, {}, [], "x", 3, { nos: "x" }, { nos: [null, {}], heroi: null }];
  let estourou = 0, naoNulo = 0;
  for (const dd of [...lixos, d]) for (const id of [null, "", 7, {}, l.id, "nada"]) for (const ee of [...lixos, e, { ...e, mapa: null }, { ...e, mapa: { regiao: { versao: 2 } } }]) {
    if (dd === d && id === l.id && ee === e) continue;
    const r = tenta(() => PA.vereditoDaPartida(dd, id, ee), "estourou");
    if (r === "estourou") estourou++;
    else if (r !== null) naoNulo++;
  }
  t(`lixo não estoura (${estourou}) e não inventa (${naoNulo})`, estourou === 0 && naoNulo === 0);
  /* determinismo e imutabilidade */
  const copiaM = J(w.mapa), copiaD = J(d), copiaE = J({ ...e, mapa: null });
  const acaso = Math.random;
  let tocou = false, a = null, b = null;
  Math.random = () => { tocou = true; return 0.5; };
  try {
    a = w.nos.map((n) => PA.vereditoDaPartida(d, n.id, e));
    b = w.nos.map((n) => PA.vereditoDaPartida(d, n.id, e));
  } finally { Math.random = acaso; }
  t("mesmos dados, mesmo veredito", J(a) === J(b) && a.filter(Boolean).length === w.nos.length - 1);
  t("o veredito não toca no Math.random", !tocou);
  t("e não muta o mapa, os dados nem o estado", J(w.mapa) === copiaM && J(d) === copiaD && J({ ...e, mapa: null }) === copiaE);
  const fonte = tenta(() => readFileSync(join(AQUI, "..", "src", "partida.js"), "utf8"), "");
  t("partida.js não escreve Math.random", fonte.length > 0 && !/Math\.random/.test(fonte));
  t("nem fala de si: nenhuma linha de tela sai daqui (só números e ids)", !/pushMsgs|autor:/.test(fonte));
}

/* ============================================================ */
sec("8. o que anda enquanto se anda — os prazos (a pergunta do jogo)");
{
  /* o prazo de missão NÃO anda com a estrada: o relógio dele tem gatilho
     "noite", e o App só tiqueia "noite" no descanso longo — uma vez */
  const app = tenta(() => readFileSync(join(AQUI, "..", "src", "App.jsx"), "utf8"), "");
  const mis = tenta(() => readFileSync(join(AQUI, "..", "src", "missoes.js"), "utf8"), "");
  t("o prazo de missão conta noites (gatilho \"noite\")", /tipo: "ameaca", segmentos: noites, gatilho: "noite"/.test(mis));
  t("e a noite só se conta ao dormir (um só tiquear(\"noite\"), no descanso)", (app.match(/tiquear\("noite"/g) || []).length === 1 && /descanso longo[\s\S]{0,3000}tiquear\("noite"/.test(app));
  t("a virada do dia corre o reino (avancarDiasReino), não as missões", /while \(minutoRef\.current >= 1440\) \{\s*minutoRef\.current -= 1440;\s*const evs = avancarDiasReino\(1\)/.test(app));

  const w = mundos[3], base = w.nos[0], p = w.nos.find((x) => x.tipo === "povoado");
  const e0 = estadoEm(w, base, { dia: 10, minuto: 8 * 60 });
  const d0 = dadosDe(w, e0);
  const v0 = PA.vereditoDaPartida(d0, p.id, e0);
  t(`um dia de estrada (${v0.minutosDeRelogio} min): nada no estado, nenhum prazo`, J(v0.prazos) === "[]" && v0.chegada.dia === 11);
  const agora = (10 - 1) * 1440 + 480, chegada = (v0.chegada.dia - 1) * 1440 + v0.chegada.minuto;
  const e = {
    ...e0,
    acordouAbs: agora - 6 * 60,                                     // acordado há 6 h: passa das 20 h na estrada
    ficha: { grupo: [
      { nome: "Lobo Espectral", invocada: true, expiraMin: agora + 60 },     // vence pelo caminho
      { nome: "Corvo", invocada: true, expiraMin: chegada + 60 },           // vence depois de chegar
      { nome: "Sombra", invocada: true, expiraMin: agora - 1 },             // já se foi
      { nome: "Vera", expiraMin: agora + 60 },                              // não é invocada
    ] },
    correio: { recebidas: [
      { de: "Casa Vell", status: "pendente", prazo: 10 },   // vence no dia 11
      { de: "Liga do Sal", status: "pendente", prazo: 11 }, // ainda vale no dia 11
      { de: "Ordem Cinza", status: "respondida", prazo: 10 },
    ] },
    governos: { "Pedra Alta": { furiaDesde: 3 }, "Rio Manso": { furiaDesde: 9 }, "Vau": { furiaDesde: 0 } },
    nemesis: { nome: "O Rei Cinzento", passo: 1, ultimoPasso: 5, status: "ativa" },
  };
  const v = PA.vereditoDaPartida(dadosDe(w, e), p.id, e);
  const ids = v.prazos.map((x) => x.id + (x.nome ? ":" + x.nome : x.de ? ":" + x.de : x.cidade ? ":" + x.cidade : ""));
  console.log(`      ${J(ids)}`);
  t("a exaustão chega pelo caminho (o relógio do sono do App: 20 h)", v.prazos.some((x) => x.id === "exaustao" && (x.dia - 1) * 1440 + x.minuto === e.acordouAbs + 20 * 60));
  t("a invocação que vence pelo caminho, e só ela", ids.includes("invocacao:Lobo Espectral") && !ids.some((x) => /Corvo|Sombra|Vera/.test(x)));
  t("a petição que vence no dia que a estrada abre, e só ela", ids.includes("peticao:Casa Vell") && !ids.some((x) => /Liga do Sal|Ordem Cinza/.test(x)));
  t("a revolta que cai pelo caminho (8 dias de fúria), e não a que ainda tem tempo", ids.includes("revolta:Pedra Alta") && !ids.includes("revolta:Rio Manso") && !ids.includes("revolta:Vau"));
  t("o passo da ameaça, sem o nome dela", ids.includes("nemesis") && !J(v.prazos).includes("Rei Cinzento"));
  t("pela ordem a que acontecem", v.prazos.every((x, i, a) => i === 0 || (a[i - 1].dia - 1) * 1440 + a[i - 1].minuto <= (x.dia - 1) * 1440 + x.minuto));
  t("e a ida curta (a pé, sem virar o dia) não abre o dia do reino", (() => {
    const l = w.nos.find((x) => x.tipo === "lugar" && PA.vereditoDaPartida(d0, x.id, e0) && PA.vereditoDaPartida(d0, x.id, e0).modo === "a_pe");
    if (!l) return true;
    const vl = PA.vereditoDaPartida(dadosDe(w, e), l.id, e);
    return vl.noites === 0 && !vl.prazos.some((x) => ["peticao", "revolta", "nemesis"].includes(x.id));
  })());
  t("sem relógio, sem prazos", J(PA.vereditoDaPartida(dadosDe(w, { ...e, minuto: undefined }), p.id, { ...e, minuto: undefined }).prazos) === "[]");
  t("o que o estado traz não muda o resto do veredito", J({ ...v, prazos: [] }) === J({ ...v0, prazos: [] }));
  const lixo = { ...e0, acordouAbs: "x", ficha: { grupo: "x" }, correio: { recebidas: [null, 3] }, governos: { a: null }, nemesis: [] };
  t("prazos de lixo não estouram nem inventam", J(tenta(() => PA.vereditoDaPartida(dadosDe(w, lixo), p.id, lixo).prazos, "estourou")) === "[]");
}

/* ============================================================ */
sec("9. a medida (medir-regiao.mjs, secção k)");
{
  const M = await medirVeredito(R, 60);
  for (const [k, xs] of Object.entries(M.horas)) console.log(`      ${k}: horas mediana ${mediana(xs)} / pior ${maximo(xs)} · noites mediana ${mediana(M.noites[k])} / pior ${maximo(M.noites[k])}`);
  t(`a medida corre e não acha contradição (${M.contra} em ${M.pares})`, M.pares > 5000 && M.contra === 0);
}

console.log(`\nveredito da partida: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
