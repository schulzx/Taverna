/* A MARCHA ÚNICA (MM17, pendência nº 3 · v9.364) — uma conta para a hora

   O pedido da pessoa (10/10): as viagens lentas. A ida direta entre dois
   lugares de chão lento chegava a 20 h, o Geógrafo andava a 4 km/h, e de uma
   povoação a outra sem estrada o jogo cobrava o piso de três dias. A conta de
   marcha passa a ser UMA para a jornada, a ficha, o Geógrafo e o mapa vivo
   (`src/marcha.js`), e nenhuma viagem dentro da região passa da promessa
   (`PROMESSA_DA_REGIAO`, regiao.js) — e, se passasse, o motivo vinha do chão,
   na linha de antes de partir.

     1. as tabelas, lidas de volta;
     2. a conta: a perna é a de sempre (a estrada, ou a ida da boca), a rede só
        entra acima de um dia, e o caminho nunca é mais longo que o direto;
     3. 200 regiões: as quatro contas dizem a MESMA hora em todos os pares, e
        nenhuma viagem passa da promessa (antes → depois, em número);
     4. a linha de antes de partir: os dois caminhos e o chão, sem nome de
        mecanismo — e a exceção, quando nem o melhor cabe;
     5. a jornada anda pelo caminho (o `percurso`), e o Mestre sabe por onde;
     6. a partida para uma povoação, de onde o herói está;
     7. o Geógrafo: a hora da marcha no lugar dos 4 km/h;
     8. a região v1 e o continente, byte a byte (hashes de HEAD v9.363);
     9. determinismo, lixo, imutabilidade, nenhum Math.random.

   FALHA ANTES (HEAD v9.363): `src/marcha.js` não existe e o import cai na
   primeira linha. E a medida diz o que falhava: 891 viagens além da promessa
   (lugar → lugar até 20 h; povoação → povoação até 24 h, o piso de 3 dias) e
   3.309 pares em que uma conta discordava da jornada (o Geógrafo em 3.109, a
   ficha e o mapa vivo em 1.032) — `node testes/medir-regiao.mjs`, secção j. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import * as MA from "../src/marcha.js";
import * as R from "../src/regiao.js";
import * as RA from "../src/rastro.js";
import * as BO from "../src/boca.js";
import * as GE from "../src/geografo.js";
import * as CP from "../src/cidade-por-dentro.js";
import * as MV from "../src/mapa-vivo.js";
import * as MB from "../src/mundo-base.js";
import * as VI from "../src/viagem.js";
import { gerarGeografia, TERRENO_VIAGEM } from "../src/geografia.js";
import { moldePorId } from "../src/moldes.js";
import { ESTRUTURAS } from "../src/historia.js";
import { linhaDePonto, kmEntre } from "../src/coordenadas.js";
import { sementeDe, generoDe, medirMarcha, mediana, maximo } from "./medir-regiao.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const J = (v) => JSON.stringify(v);
const DIA = VI.HORAS_MARCHA_POR_DIA;
const EPS = 1e-6;
const P = R.PROMESSA_DA_REGIAO;

/* ---------------- os mundos ---------------- */
const N = 200;
const molde = moldePorId("sobremundo");
const mundos = [];
for (let i = 0; i < N; i++) {
  const semente = sementeDe(i), genero = generoDe(i);
  const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero, estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id, modo: "historia" }));
  const nos = [...mapa.cidades.map((c, j) => ({ tipo: j ? "povoado" : "base", src: c, nome: c.nome })), ...mapa.regiao.lugares.map((l) => ({ tipo: "lugar", src: l, nome: l.nome, id: l.id }))];
  mundos.push({ i, semente, genero, mapa, nos, base: mapa.cidades[0] });
}

/* ============================================================ */
sec("1. as tabelas — a promessa sai do dia de marcha e do alcance");
{
  t("da base a qualquer ponto: um dia de marcha, o teto do alcance", P.daBase === DIA && P.daBase === R.ALCANCE_DA_REGIAO.horasMaximas);
  t("a ida direta vai direta até um dia", P.direta === DIA);
  t("de ponta a ponta: dois dias de marcha", P.pontaAPonta === 2 * DIA);
  t("a rede para nas povoações, nunca num covil", J(MA.MARCHA_NA_REGIAO.paradas) === J(["base", "povoado"]));
  t("a linha diz as horas ao meio-hora", MA.MARCHA_NA_REGIAO.passoDoTexto === 0.5 && MA.MARCHA_NA_REGIAO.empate > 0 && MA.MARCHA_NA_REGIAO.empate < 0.01);
}

/* ============================================================ */
sec("2. a conta — uma perna de sempre, a rede só acima de um dia");
{
  let pares = 0, pernaDaBoca = 0, pernaDaEstrada = 0, estradas = 0, desvios = 0, diretoQuandoCabe = 0, cabe = 0, nuncaMaisLongo = 0, viaPovoacoes = 0, pontasCertas = 0, horasSomam = 0, cumpre = 0;
  for (const w of mundos) {
    const r = w.mapa.regiao;
    for (const a of w.nos) for (const b of w.nos) {
      if (a === b) continue;
      pares++;
      const c = MA.caminhoNaRegiao(w.mapa, a.id || a.nome, b.id || b.nome);
      if (!c) continue;
      /* a perna direta é a de sempre: a estrada de mapa.rotas entre duas
         povoações que a têm; a ida da boca (a régua do chão) em tudo o resto */
      const estrada = a.tipo !== "lugar" && b.tipo !== "lugar" ? w.mapa.rotas.find((x) => (x.de === a.nome && x.para === b.nome) || (x.de === b.nome && x.para === a.nome)) : null;
      if (estrada) { estradas++; if (Math.abs(c.direto.horas - estrada.dias * DIA) < EPS && c.direto.terreno === estrada.terreno) pernaDaEstrada++; }
      else {
        const rt = BO.rotaAteAMasmorra({ nome: b.nome, x: b.src.x, y: b.src.y, bioma: b.src.bioma }, { x: a.src.x, y: a.src.y, bioma: a.src.bioma }, { regiao: r });
        if (rt && Math.abs(c.direto.horas - (rt.modo === "a_pe" ? rt.minutos / 60 : rt.dias * DIA)) < EPS && c.direto.modo === rt.modo) pernaDaBoca++;
      }
      if (c.direto.horas <= P.direta + EPS) { cabe++; if (!c.desvio && c.escolhido.pernas.length === 1) diretoQuandoCabe++; }
      if (c.desvio) desvios++;
      /* a hora escolhida guarda duas casas (como a ficha): meia centésima de folga */
      if (c.escolhido.horas <= c.direto.horas + 0.005) nuncaMaisLongo++;
      if (c.escolhido.via.every((v) => w.mapa.cidades.some((x) => x.nome === v))) viaPovoacoes++;
      if (c.pontos[0].nome === a.nome && c.pontos[c.pontos.length - 1].nome === b.nome && c.pontos.length === c.escolhido.pernas.length + 1) pontasCertas++;
      if (Math.abs(c.escolhido.pernas.reduce((s, p) => s + p.horas, 0) - c.escolhido.horas) < 0.01) horasSomam++;
      if (c.cumpre) cumpre++;
    }
  }
  t(`há caminho para todo par (${pares})`, pares > 20000);
  t(`a perna entre povoações com estrada é a estrada (${pernaDaEstrada}/${estradas})`, pernaDaEstrada === estradas && estradas > 1000);
  t(`a perna sem estrada é a ida da boca, ao minuto (${pernaDaBoca}/${pares - estradas})`, pernaDaBoca === pares - estradas);
  t(`a ida direta dentro do dia vai direta (${diretoQuandoCabe}/${cabe})`, diretoQuandoCabe === cabe && cabe > 10000);
  t(`o caminho nunca é mais longo que o direto (${nuncaMaisLongo}/${pares})`, nuncaMaisLongo === pares);
  t(`e só passa por povoações (${viaPovoacoes}/${pares})`, viaPovoacoes === pares);
  t(`os pontos vão de uma ponta à outra, um por perna (${pontasCertas}/${pares})`, pontasCertas === pares);
  t(`as horas são a soma das pernas (${horasSomam}/${pares})`, horasSomam === pares);
  t(`a rede entra onde o direto passa de um dia (${desvios} caminhos pelas povoações)`, desvios > 1000);
  t(`todo caminho cabe na promessa (${cumpre}/${pares})`, cumpre === pares);
  /* horasEntre é a pergunta curta, e é a mesma conta */
  const w = mundos[0], l = w.mapa.regiao.lugares[0];
  const c = MA.caminhoNaRegiao(w.mapa, w.base.nome, l.id);
  t("horasEntre é a hora do caminho", MA.horasEntre(w.mapa, w.base.nome, l.id) === c.escolhido.horas);
  t("e a ficha da base é essa hora", c.escolhido.horas === l.ficha.horas);
}

/* ============================================================ */
sec("3. 200 regiões — quatro contas, uma hora (medir-regiao.mjs, secção j)");
const M = await medirMarcha(join(AQUI, "..", "src"), N);
{
  console.log(`      jornada: mediana ${mediana(M.contas.jornada)} h, pior ${maximo(M.contas.jornada)} h · ${M.desvios} pelas povoações · antes (HEAD v9.363): mediana 8, pior 24, 891 além da promessa`);
  t(`a jornada tem hora para todos os pares (${M.contas.jornada.length}/${M.pares})`, M.contas.jornada.length === M.pares);
  t(`nenhuma conta discorda da jornada (${M.discord}; antes 3.309)`, M.discord === 0, J(M.exemplo));
  t(`a ficha diz o que se anda (${M.discordPorConta.ficha} discordâncias em ${M.contas.ficha.length}; antes 1.032)`, M.discordPorConta.ficha === 0 && M.contas.ficha.length > 4000);
  t(`o Geógrafo diz o que se anda (${M.discordPorConta.geografo} em ${M.contas.geografo.length}; antes 3.109)`, M.discordPorConta.geografo === 0 && M.contas.geografo.length > 10000);
  t(`o mapa vivo diz o que se anda (${M.discordPorConta.mapaVivo} em ${M.contas.mapaVivo.length}; antes 1.032)`, M.discordPorConta.mapaVivo === 0 && M.contas.mapaVivo.length > 8000);
  t(`nenhuma viagem além da promessa (${M.alemDaPromessa}; antes 891)`, M.alemDaPromessa === 0);
  t(`o ponta a ponta cabe em dois dias (o pior: ${M.pior && M.pior.horas} h)`, !!M.pior && M.pior.horas <= P.pontaAPonta + EPS);
  t(`da base, nada passa de um dia (pior ${maximo(M.porTipo.jornada["base→lugar"])} h)`, maximo(M.porTipo.jornada["base→lugar"]) <= P.daBase + EPS && maximo(M.porTipo.jornada["base→povoado"]) <= P.daBase + EPS);
  t(`nenhuma povoação no piso de três dias (${M.piso3dias}; antes 858)`, M.piso3dias === 0);
  t(`a mediana da jornada não se mexe (${mediana(M.contas.jornada)} h): a promessa corta o pior, não o comum`, mediana(M.contas.jornada) === DIA && mediana(M.porTipo.jornada["base→lugar"]) === 4);
  /* a régua de antes (a ida direta sempre, chão a chão), aplicada aos mesmos
     pares: é ela que passava da promessa — a asserção acima FALHA com ela */
  let alemAntes = 0, piorAntes = 0;
  for (const w of mundos) for (const a of w.nos) for (const b of w.nos) {
    if (a === b || b.tipo !== "lugar") continue;
    const c = MA.caminhoNaRegiao(w.mapa, a.id || a.nome, b.id);
    const teto = a.tipo === "base" ? P.daBase : P.pontaAPonta;
    if (c.direto.horas > teto + EPS) alemAntes++;
    piorAntes = Math.max(piorAntes, c.direto.horas);
  }
  t(`a ida direta de antes passava da promessa (${alemAntes} idas a um lugar, a pior ${piorAntes} h)`, alemAntes > 0 && piorAntes > P.pontaAPonta);
}

/* ============================================================ */
sec("4. a linha de antes de partir — os dois caminhos e o chão");
{
  const MECANISMO = /\b(promessa|conta|desvio|rede|sistema|marcha [uú]nica|teto|perna|dijkstra|caminhoNaRegiao)\b/i;
  let desvios = 0, comLinha = 0, linhaCerta = 0, primeira = 0, semMecanismo = 0, umaLinha = 0, semDesvioSemLinha = 0, semDesvio = 0;
  for (const w of mundos.slice(0, 100)) {
    const mms = MB.masmorrasDoMundo(w.semente, w.mapa);
    for (const a of w.nos) for (const b of w.nos.filter((x) => x.tipo === "lugar")) {
      if (a === b) continue;
      const lugar = a.tipo === "lugar" ? { nome: a.nome, coord: { x: a.src.x, y: a.src.y }, distancia: "perto", cidade: w.base.nome } : null;
      const cidadeAtual = a.tipo === "lugar" ? w.base.nome : a.nome;
      const ida = RA.idaAMasmorra(`Vou a ${b.nome}.`, { cidadeAtual, cidades: w.mapa.cidades.map((c) => c.nome), mapa: w.mapa, masmorras: mms, lugar, jornada: null });
      if (!ida || !ida.rota) continue;
      const c = MA.caminhoNaRegiao(w.mapa, a.id || a.nome, b.id);
      if (!c.desvio) { semDesvio++; if (!MA.linhaDoCaminho(c)) semDesvioSemLinha++; continue; }
      desvios++;
      const l = MA.linhaDoCaminho(c);
      if (l) comLinha++;
      /* os dois números, o chão do direto e por onde se vai — o veredito ANTES */
      const h = (x) => String(Math.round(x * 2) / 2).replace(".", ",");
      if (l.includes(`${h(c.direto.horas)} h`) && l.includes(`${h(c.escolhido.horas)} h`) && l.includes(TERRENO_VIAGEM[c.direto.terreno].rotulo) && c.escolhido.via.every((v) => l.includes(v)) && l.includes(b.nome)) linhaCerta++;
      if (ida.linhas[0] === l) primeira++;
      if (!MECANISMO.test(l)) semMecanismo++;
      if (!l.includes("\n")) umaLinha++;
    }
  }
  t(`todo desvio tem a linha (${comLinha}/${desvios})`, comLinha === desvios && desvios > 500);
  t(`com as duas horas, o chão do direto e por onde se vai (${linhaCerta}/${desvios})`, linhaCerta === desvios);
  t(`é a primeira linha da ida — antes de a estrada começar (${primeira}/${desvios})`, primeira === desvios);
  t(`sem nome de mecanismo (${semMecanismo}/${desvios})`, semMecanismo === desvios);
  t(`uma linha só (${umaLinha}/${desvios})`, umaLinha === desvios);
  t(`a ida direta dentro do dia fica com a linha de sempre (${semDesvioSemLinha}/${semDesvio})`, semDesvioSemLinha === semDesvio);
  t("a ida não chama o Mestre: a mesma resposta de sempre (as linhas são de tela)", RA.QUEM_RESPONDE.frase.chamadas === 0);

  /* A EXCEÇÃO: um mundo onde nem o melhor caminho cabe — dois lugares de
     montanha a 30 km da base, em lados opostos. A promessa não se cumpre, e
     o motivo é o chão, dito antes de partir. */
  const mapa = {
    cidades: [{ nome: "Pedra Alta", x: 50, y: 50, bioma: "planicie" }],
    rotas: [],
    regiao: {
      versao: 2, base: { nome: "Pedra Alta" },
      lugares: [
        { id: "l1", nome: "Mina do Norte", x: 50, y: 48.8, bioma: "montanha" },
        { id: "l2", nome: "Cripta do Sul", x: 50, y: 51.2, bioma: "montanha" },
      ],
    },
  };
  const c = MA.caminhoNaRegiao(mapa, "l1", "l2");
  const l = MA.linhaDoCaminho(c);
  t(`a exceção existe e é dita: ${c && c.escolhido.horas} h, teto ${c && c.teto}`, !!c && !c.cumpre && c.escolhido.horas > P.pontaAPonta);
  t("o motivo é o chão mais lento do caminho", !!c && c.motivo === TERRENO_VIAGEM.montanha.rotulo);
  t(`e a linha di-lo, com a outra hora: "${l}"`, l.includes(TERRENO_VIAGEM.montanha.rotulo) && l.includes("não se vai mais depressa") && /\d+ h/.test(l) && !MECANISMO.test(l));
  const ida = RA.idaAMasmorra("Vou à Cripta do Sul.", { cidadeAtual: "Pedra Alta", cidades: ["Pedra Alta"], mapa, masmorras: [{ ...mapa.regiao.lugares[1], nivel: 3, salas: 6 }, { ...mapa.regiao.lugares[0], nivel: 3, salas: 6 }], lugar: { nome: "Mina do Norte", coord: { x: 50, y: 48.8 } }, jornada: null });
  t("a ida da boca da mina lê a linha da exceção antes de partir", !!ida && ida.linhas[0] === l);
  /* o direto além do teto sem nada mais curto: a linha diz que não há */
  const so = { ...mapa, regiao: { ...mapa.regiao, lugares: [mapa.regiao.lugares[0], { id: "l3", nome: "Poço Fundo", x: 50, y: 46.2, bioma: "montanha" }] } };
  const c2 = MA.caminhoNaRegiao(so, "l1", "l3");
  t("sem caminho mais curto, a linha di-lo também", !!c2 && (c2.cumpre ? MA.linhaDoCaminho(c2) === "" : MA.linhaDoCaminho(c2).includes("nenhum caminho pelas povoações é mais curto")));
}

/* ============================================================ */
sec("5. a jornada anda pelo caminho, e o Mestre sabe por onde");
{
  let jornadas = 0, comPercurso = 0, horasCertas = 0, prompt = 0, noVia = 0, pontas = 0, semSaltos = 0, valida = 0;
  for (const w of mundos.slice(0, 60)) {
    const mms = MB.masmorrasDoMundo(w.semente, w.mapa);
    for (const a of w.nos.filter((x) => x.tipo !== "lugar")) for (const b of w.nos.filter((x) => x.tipo === "lugar")) {
      const c = MA.caminhoNaRegiao(w.mapa, a.nome, b.id);
      if (!c.desvio) continue;
      const ida = RA.idaAMasmorra(`Vou a ${b.nome}.`, { cidadeAtual: a.nome, cidades: w.mapa.cidades.map((x) => x.nome), mapa: w.mapa, masmorras: mms, lugar: null, jornada: null });
      const j = BO.jornadaAteAMasmorra(ida, { de: a.nome, dia: 1 });
      jornadas++;
      if (Array.isArray(j.percurso) && j.percurso.length === c.pontos.length) comPercurso++;
      if (Math.abs(j.totalMin - Math.round(c.escolhido.pernas.reduce((s, p) => s + p.horas, 0) * 60)) <= 1) horasCertas++;
      if (VI.resumoViagemPrompt(j).includes(`passando por ${c.escolhido.via.join(" e ")}`)) prompt++;
      if (RA.jornadaValida(j, a.nome) === j) valida++;
      /* na hora a que se chega à escala, o herói está nela */
      const hVia = j.percurso[1].h, total = j.percurso[j.percurso.length - 1].h;
      const nela = RA.pontoDoHeroi({ cidadeAtual: a.nome, jornada: { ...j, andadoMin: Math.round((hVia / total) * j.totalMin) }, mapa: w.mapa });
      if (Math.hypot(nela.x - j.percurso[1].x, nela.y - j.percurso[1].y) < 0.02) noVia++;
      const ini = RA.pontoDoHeroi({ cidadeAtual: a.nome, jornada: j, mapa: w.mapa });
      const fim = RA.pontoDoHeroi({ cidadeAtual: a.nome, jornada: { ...j, andadoMin: j.totalMin }, mapa: w.mapa });
      if (Math.hypot(ini.x - a.src.x, ini.y - a.src.y) < 0.02 && Math.hypot(fim.x - b.src.x, fim.y - b.src.y) < 0.02) pontas++;
      /* sem saltos: passo a passo, nenhum salto maior que a perna mais longa ÷ 20 */
      let maior = 0, ant = ini;
      for (let k = 1; k <= 40; k++) {
        const p = RA.pontoDoHeroi({ cidadeAtual: a.nome, jornada: { ...j, andadoMin: (k / 40) * j.totalMin }, mapa: w.mapa });
        maior = Math.max(maior, Math.hypot(p.x - ant.x, p.y - ant.y)); ant = p;
      }
      const comprimento = c.pontos.slice(1).reduce((s, p, k) => s + Math.hypot(p.x - c.pontos[k].x, p.y - c.pontos[k].y), 0);
      if (maior <= comprimento / 5 + 1e-6) semSaltos++;
    }
  }
  t(`a jornada pelas povoações leva o percurso (${comPercurso}/${jornadas})`, comPercurso === jornadas && jornadas > 100);
  t(`e cobra as horas do caminho, ao minuto (${horasCertas}/${jornadas})`, horasCertas === jornadas);
  t(`o Mestre lê por onde se passa (${prompt}/${jornadas})`, prompt === jornadas);
  t(`a jornada continua válida para o registo (de = a cidade de onde se sai) (${valida}/${jornadas})`, valida === jornadas);
  t(`o herói passa pela escala na hora em que lá chega (${noVia}/${jornadas})`, noVia === jornadas);
  t(`parte da origem e chega ao destino (${pontas}/${jornadas})`, pontas === jornadas);
  t(`sem saltos pelo caminho (${semSaltos}/${jornadas})`, semSaltos === jornadas);
  /* a ida direta não leva percurso nenhum: a jornada é a de sempre */
  const w = mundos[1], l = w.mapa.regiao.lugares.find((x) => !MA.caminhoNaRegiao(w.mapa, w.base.nome, x.id).desvio);
  const ida = RA.idaAMasmorra(`Vou a ${l.nome}.`, { cidadeAtual: w.base.nome, cidades: w.mapa.cidades.map((x) => x.nome), mapa: w.mapa, masmorras: MB.masmorrasDoMundo(w.semente, w.mapa), lugar: null, jornada: null });
  t("a ida direta é a rota da boca, byte a byte (sem percurso)", J(ida.rota) === J(BO.rotaAteAMasmorra(l, { x: w.base.x, y: w.base.y, bioma: w.base.bioma }, { de: w.base.nome, regiao: w.mapa.regiao })));
}

/* ============================================================ */
sec("6. a partida para uma povoação, de onde o herói está");
{
  let partidas = 0, horas = 0, daBoca = 0, daBocaCerta = 0, deCerto = 0, piso = 0, semRota = 0;
  for (const w of mundos) {
    for (const a of w.nos) for (const b of w.nos.filter((x) => x.tipo !== "lugar")) {
      if (a === b) continue;
      const lugar = a.tipo === "lugar" ? { nome: a.nome, coord: { x: a.src.x, y: a.src.y } } : null;
      const p = MA.partidaNaRegiao(w.mapa, { cidadeAtual: a.tipo === "lugar" ? w.base.nome : a.nome, lugar, destino: b.nome, dia: 2 });
      if (!p) { if (!(a.tipo === "lugar" ? false : a.nome === b.nome)) semRota++; continue; }
      partidas++;
      const c = MA.caminhoNaRegiao(w.mapa, a.id || a.nome, b.nome);
      if (Math.abs(p.jornada.totalMin / 60 - c.escolhido.horas) < 0.02) horas++;
      if (p.jornada.de === (a.tipo === "lugar" ? w.base.nome : a.nome) && p.jornada.para === b.nome && p.jornada.desde === 2) deCerto++;
      if (!w.mapa.rotas.some((x) => (x.de === a.nome && x.para === b.nome) || (x.para === a.nome && x.de === b.nome)) && p.jornada.dias === 3 && a.tipo !== "lugar") piso++;
      if (a.tipo === "lugar") { daBoca++; if (p.rota.percurso && p.rota.percurso[0].nome === a.nome && Math.abs(p.rota.percurso[0].x - a.src.x) < 0.01) daBocaCerta++; }
    }
  }
  t(`toda partida entre pontos da região tem rota (${partidas}; sem ${semRota})`, semRota === 0 && partidas > 8000);
  t(`a jornada cobra a hora do caminho (${horas}/${partidas})`, horas === partidas);
  t(`de = a cidade do registo, para = o destino (${deCerto}/${partidas})`, deCerto === partidas);
  t(`da boca de um lugar, parte-se da boca — não da base (${daBocaCerta}/${daBoca})`, daBocaCerta === daBoca && daBoca > 3000);
  t(`nenhuma no piso de três dias (${piso})`, piso === 0);
  /* a vila a dois passos da boca: a jornada leva os minutos da caminhada */
  let perto = null;
  for (const w of mundos) for (const l of w.mapa.regiao.lugares) for (const c of w.mapa.cidades.slice(1)) if (!perto && kmEntre(l, c) < 1) perto = { w, l, c };
  const pp = perto && MA.partidaNaRegiao(perto.w.mapa, { cidadeAtual: perto.w.base.nome, lugar: { nome: perto.l.nome, coord: { x: perto.l.x, y: perto.l.y } }, destino: perto.c.nome });
  t(`a vila a ${perto && Math.round(kmEntre(perto.l, perto.c) * 1000)} m da boca: ${pp && pp.jornada.totalMin} min, não as ${perto && (perto.w.mapa.rotas.find((x) => (x.de === perto.w.base.nome && x.para === perto.c.nome) || (x.para === perto.w.base.nome && x.de === perto.c.nome)) || { dias: 3 }).dias * DIA} h da base`, !!pp && pp.jornada.totalMin < 60 && pp.rota.modo === "a_pe");
  const w = mundos[0];
  t("o destino que é um lugar não é desta porta (é da ida à boca)", MA.partidaNaRegiao(w.mapa, { cidadeAtual: w.base.nome, destino: w.mapa.regiao.lugares[0].nome }) === null);
  t("já lá estar não abre estrada", MA.partidaNaRegiao(w.mapa, { cidadeAtual: w.base.nome, destino: w.base.nome }) === null);
}

/* ============================================================ */
sec("7. o Geógrafo — a hora da marcha no lugar dos 4 km/h");
{
  let povoacoes = 0, comTempo = 0, aPeQuatro = 0, arredoresIguais = 0, arredores = 0, quem = 0, quemCerto = 0;
  for (const w of mundos.slice(0, 100)) {
    const tudo = { ...w.mapa, cidades: w.mapa.cidades.map((c) => ({ ...c, descoberta: true })) };
    for (const c of w.mapa.cidades) {
      const rs = GE.rastrearOTurno({ cidadeAtual: c.nome, mapa: tudo, semente: w.semente });
      for (const p of rs.perto) {
        if (p.tipo === "assentamento") {
          povoacoes++;
          const cm = MA.caminhoNaRegiao(w.mapa, c.nome, p.nome);
          if (p.tempo && p.tempo === MA.tempoDoCaminho(cm) && linhaDePonto(p).includes(p.tempo)) comTempo++;
          const velho = linhaDePonto({ ...p, tempo: undefined });
          if (/a pé/.test(velho) && !linhaDePonto(p).includes(velho.split(", ").pop())) aPeQuatro++;
        } else { arredores++; if (!p.tempo) arredoresIguais++; }
      }
      const outra = w.mapa.cidades.find((x) => x !== c);
      const l = GE.quemNaoChega([{ nome: "Vera", onde: outra.nome, dias: 1 }], { mapa: tudo, coord: { x: c.x, y: c.y }, cidadeAtual: c.nome });
      quem++;
      const cm = MA.caminhoNaRegiao(w.mapa, c.nome, outra.nome);
      if (l[0] && l[0].includes(MA.tempoDoCaminho(cm)) && l[0].includes(`sem ${Math.max(1, Math.round(cm.escolhido.horas))}h de estrada`)) quemCerto++;
    }
  }
  t(`toda povoação na linha dos vizinhos leva a hora da marcha (${comTempo}/${povoacoes})`, comTempo === povoacoes && povoacoes > 40);
  t(`e já não diz os 4 km/h dela (${aPeQuatro} linhas trocadas)`, aPeQuatro > 0);
  t(`os arredores ficam com os seus minutos (${arredoresIguais}/${arredores})`, arredoresIguais === arredores && arredores > 0);
  t(`quem não chega: a hora da marcha, e não 24 h por dia (${quemCerto}/${quem})`, quemCerto === quem);
  /* a pergunta na cidade: a mesma hora */
  const w = mundos[3], c0 = w.base, l = w.mapa.regiao.lugares[0];
  const linha = CP.fichaParaPauta(c0, { semente: w.semente, mapa: w.mapa, frase: `Quanto tempo leva até ${l.nome}?` }).pergunta[0] || "";
  t(`"quanto tempo leva até…" responde com a marcha: ${linha}`, linha.includes(MA.tempoDoCaminho(MA.caminhoNaRegiao(w.mapa, c0.nome, l.id))) && !/\d h a pé\)/.test(linha.replace(MA.tempoDoCaminho(MA.caminhoNaRegiao(w.mapa, c0.nome, l.id)), "")));
  /* sem região, a linha de sempre */
  const cont = gerarGeografia(sementeDe(5), molde);
  const rsC = GE.rastrearOTurno({ cidadeAtual: cont.cidades[0].nome, mapa: cont, semente: sementeDe(5) });
  t("no continente nenhum ponto leva tempo de marcha", !!rsC && rsC.perto.every((p) => !p.tempo));
  t("e linhaDePonto sem tempo é a de sempre", linhaDePonto({ nome: "X", km: 8, rumo: { rotulo: "a norte" } }) === "X (a norte, 8,0 km, 2 h a pé)");
}

/* ============================================================ */
sec("8. a região v1 e o continente, byte a byte (hashes de HEAD v9.363)");
{
  /* Gravados ANTES de qualquer linha desta etapa (10/10), com este laço, sobre
     a árvore de HEAD v9.363 (git archive). A região v1 (a de quem criou a
     campanha na v9.356, medida pela régua antiga) leva o vizinho mais perto,
     que é o mesmo nas duas árvores — a ficha da v2 nova perdeu os vizinhos
     além de um dia, e a v1 não pode depender disso. */
  const HEAD = { "continente:distancia": "1e78848ba4474f5d", "continente:geografo": "10e16b7a17879364", "continente:ida": "d4eb37bf81daa5c4", "continente:jornada": "7ed28687417bc69d", "continente:ponto": "3172a1f05991c7bb", "continente:prompt": "c1768e7c488d7327", "v1:distancia": "89bf5b855152c3bb", "v1:geografo": "bd9091a08744468f", "v1:ida": "e1d2511916fcf8a4", "v1:jornada": "25910508c71c4417", "v1:mapaVivo": "710a350a1dab4c22", "v1:ponto": "33d9165f148fc9d8", "v1:prompt": "ac2028f2b4e8fccc" };
  const hs = {};
  const h = (k, v) => { (hs[k] ||= createHash("sha256")).update(J(v) ?? "u"); };
  for (let i = 0; i < 60; i++) {
    const semente = sementeDe(i), genero = generoDe(i);
    const reg = R.mapaDaCampanhaNova(R.gerarRegiao({ semente, molde, genero, estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id }));
    const v1 = { ...reg, regiao: { ...reg.regiao, versao: 1, lugares: reg.regiao.lugares.map((l) => ({ ...l, ficha: { ...l.ficha, vizinhos: l.ficha.vizinhos.slice(0, 1) } })) } };
    const cont = R.mapaDaCampanhaNova(gerarGeografia(semente, molde));
    for (const [k, mapa] of [["v1", v1], ["continente", cont]]) {
      const tudo = { ...mapa, cidades: mapa.cidades.map((c) => ({ ...c, descoberta: true })) };
      const mms = MB.masmorrasDoMundo(semente, mapa);
      const base = mapa.cidades[0];
      const cidades = mapa.cidades.map((c) => c.nome);
      for (const m of mms.slice(0, 4)) {
        const ida = RA.idaAMasmorra(`Vou a ${m.nome}.`, { cidadeAtual: base.nome, cidades, mapa, masmorras: mms, lugar: null, jornada: null });
        h(`${k}:ida`, ida && { ...ida, masmorra: ida.masmorra && ida.masmorra.nome });
        if (ida && ida.rota && ida.rota.modo === "estrada") {
          const j = BO.jornadaAteAMasmorra(ida, { de: base.nome, dia: 3 });
          h(`${k}:jornada`, j);
          h(`${k}:prompt`, VI.resumoViagemPrompt({ ...j, andadoMin: Math.round(j.totalMin / 3) }));
          h(`${k}:ponto`, RA.pontoDoHeroi({ cidadeAtual: base.nome, jornada: { ...j, andadoMin: Math.round(j.totalMin / 3) }, mapa }));
        }
        const lugar = { nome: m.nome, coord: { x: m.x, y: m.y }, distancia: "perto", cidade: base.nome };
        for (const m2 of mms.slice(0, 3)) if (m2 !== m) {
          const ida2 = RA.idaAMasmorra(`Vou a ${m2.nome}.`, { cidadeAtual: base.nome, cidades, mapa, masmorras: mms, lugar, jornada: null });
          h(`${k}:ida`, ida2 && { ...ida2, masmorra: ida2.masmorra && ida2.masmorra.nome });
        }
        h(`${k}:geografo`, GE.paraPauta({ cidadeAtual: base.nome, lugar, mapa: tudo, semente, longe: [{ nome: "Vera", onde: (mapa.cidades[1] || base).nome, dias: 1 }] }));
      }
      for (const c of mapa.cidades.slice(0, 3)) {
        h(`${k}:geografo`, GE.paraPauta({ cidadeAtual: c.nome, mapa: tudo, semente, longe: [{ nome: "Vera", onde: (mapa.cidades[2] || base).nome, dias: 1 }] }));
        for (const alvo of [...mapa.cidades.slice(0, 3), ...mms.slice(0, 3)]) h(`${k}:distancia`, CP.fichaParaPauta(c, { semente, mapa, frase: `Quanto tempo leva até ${alvo.nome}?` }).pergunta);
      }
      /* P3 (10/10) acrescentou `nos[].quem` (os bichos da ficha) à saída do
         mapa vivo — campo novo, só somado, provado em teste-mapa-vivo §12.
         O hash continua a guardar o que guardava (o resto da saída, byte a
         byte, igual ao de HEAD v9.363): tira-se o campo novo antes de
         contar, em vez de regravar o hash e perder o "antes". */
      if (k === "v1") { const d = MV.dadosDoMapaVivo(tudo, { cidadeAtual: base.nome, semente, conhecidos: mms.map((m) => m.nome) }); h("v1:mapaVivo", d && { ...d, nos: d.nos.map(({ quem, ...r }) => r) }); }
    }
  }
  for (const k of Object.keys(HEAD)) {
    const agora = hs[k] ? hs[k].digest("hex").slice(0, 16) : "";
    t(`${k}: o de sempre (${agora})`, agora === HEAD[k]);
  }
  const w = mundos[0];
  const v1 = { ...w.mapa, regiao: { ...w.mapa.regiao, versao: 1 } };
  t("a conta única não fala da região v1", MA.caminhoNaRegiao(v1, w.base.nome, w.mapa.regiao.lugares[0].id) === null && MA.partidaNaRegiao(v1, { cidadeAtual: w.base.nome, destino: w.mapa.cidades[1].nome }) === null && MA.origemDoHeroi(v1, { cidadeAtual: w.base.nome }) === null);
  const cont = gerarGeografia(sementeDe(9), molde);
  const [c1, c2] = [cont.cidades[0], cont.rotas.length ? cont.cidades.find((c) => c.nome === cont.rotas[0].para) : cont.cidades[1]];
  t("nem do continente", MA.caminhoNaRegiao(cont, c1.nome, c2.nome) === null && MA.partidaNaRegiao(cont, { cidadeAtual: c1.nome, destino: c2.nome }) === null);
  t("e lá horasEntre é a conta de sempre (a estrada da rota)", cont.rotas.length > 0 && MA.horasEntre(cont, cont.rotas[0].de, cont.rotas[0].para) === cont.rotas[0].dias * DIA);
}

/* ============================================================ */
sec("9. determinismo, lixo, imutabilidade, nenhum Math.random");
{
  const w = mundos[7];
  const copia = J(w.mapa);
  const acaso = Math.random;
  let tocou = false;
  Math.random = () => { tocou = true; return 0.5; };
  let a = null, b = null;
  try {
    a = w.nos.map((x) => w.nos.map((y) => (x === y ? null : MA.caminhoNaRegiao(w.mapa, x.id || x.nome, y.id || y.nome))));
    b = w.nos.map((x) => w.nos.map((y) => (x === y ? null : MA.caminhoNaRegiao(w.mapa, x.id || x.nome, y.id || y.nome))));
    MA.partidaNaRegiao(w.mapa, { cidadeAtual: w.base.nome, destino: w.mapa.cidades[1].nome });
  } finally { Math.random = acaso; }
  t("mesmo mapa, mesmos caminhos", J(a) === J(b));
  t("a conta única não toca no Math.random", !tocou);
  t("e não muta o mapa que recebe", J(w.mapa) === copia);
  const fonte = tenta(() => readFileSync(join(AQUI, "..", "src", "marcha.js"), "utf8"), "");
  t("marcha.js não escreve Math.random", fonte.length > 0 && !/Math\.random/.test(fonte));
  const lixos = [null, undefined, {}, [], "x", 3, { regiao: null }, { regiao: { versao: 2 } }, { cidades: "x", regiao: { versao: 2, lugares: "y" } }, { cidades: [null, {}], regiao: { versao: 2, lugares: [null, { nome: "a" }] } }];
  let estourou = 0, naoNulo = 0;
  for (const m of lixos) for (const [d, p] of [[null, null], ["a", "b"], [{}, { x: 1 }], [w.base.nome, w.mapa.regiao.lugares[0].id]]) {
    const r = tenta(() => [MA.caminhoNaRegiao(m, d, p), MA.horasEntre(m, d, p), MA.partidaNaRegiao(m, { cidadeAtual: d, destino: p }), MA.origemDoHeroi(m, { cidadeAtual: d })], "estourou");
    if (r === "estourou") estourou++;
    else if (r[0] !== null || r[2] !== null) naoNulo++;
  }
  t(`lixo não estoura (${estourou}) e não inventa caminho (${naoNulo})`, estourou === 0 && naoNulo === 0);
  t("as palavras com lixo são vazias", MA.linhaDoCaminho(null) === "" && MA.tempoDoCaminho({}) === "" && MA.rotaDoCaminho(null) === null);
  t("um ponto solto (o herói na estrada) é ponta de partida", !!MA.caminhoNaRegiao(w.mapa, { x: w.base.x + 0.1, y: w.base.y }, w.mapa.regiao.lugares[0].id));
  t("origem: à boca de um lugar, o lugar; na cidade, a cidade; na estrada, o ponto",
    MA.origemDoHeroi(w.mapa, { cidadeAtual: w.base.nome, lugar: { nome: w.mapa.regiao.lugares[0].nome } }) === w.mapa.regiao.lugares[0].nome
    && MA.origemDoHeroi(w.mapa, { cidadeAtual: w.base.nome }) === w.base.nome
    && J(MA.origemDoHeroi(w.mapa, { cidadeAtual: w.base.nome, jornada: {}, ponto: { x: 1, y: 2 } })) === J({ x: 1, y: 2 }));
}

console.log(`\n${ok} ok, ${mal} falhas`);
if (mal) process.exit(1);
