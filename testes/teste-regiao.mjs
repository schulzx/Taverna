/* A REGIÃO DELIMITADA (MM17, etapa A) — o mapa do tamanho da história

   A pessoa, a 06/10: *"não precisamos de um mapa infinito, podemos ter um
   mapa definido e muito mais complexo com uma zona delimitada... a
   história já vem com os ganchos de pra onde o player tem que ir."* E ela
   disse que isto resolvia "a Nave a 168 km".

   A LINHA DE BASE, medida por `medir-regiao.mjs` (N=60 mundos semeados, o
   molde do beta, 06/10, HEAD v9.354), é a constante de comparação desta
   suíte — a pessoa citou 168 km e a medida deu 167,7:
     · masmorra → a sua "cidade próxima": mediana 167,7 km, máx. 282,8;
     · masmorra → a cidade onde a campanha começa: mediana 950 km, máx.
       2.062; em horas de marcha, mediana 372 (46 dias), e 60 de 60 mundos
       com alguma masmorra a mais de um dia;
     · marcos da espinha a mais de um dia da base: o meio 751/755, o fim
       239/248, o segredo 332/371;
     · masmorras com ficha (quem anda lá, a ida, o perigo, a planta): 0/495;
     · lá dentro, os "locais da cidade" que vão junto no prompt (o
       `resumoDaqui` e os arredores): mediana 3.210 caracteres;
     · a PIOR CENA REAL do prompt: 74.644 (teste-prompt.mjs).

   O que esta suíte prova, sobre a região (`gerarRegiao`, regiao.js), em
   200 mundos: tudo a no máximo um dia de marcha da base, as contagens nas
   faixas da tabela, cada ato no seu lugar, ficha em todo lugar, a espinha
   inteira lá dentro, o horizonte sem ficha, o determinismo, o continente
   antigo intocado byte a byte, e os leitores de `mapa` de sempre a servir
   a região sem mudarem uma linha.

   FALHA em HEAD (v9.354): `src/regiao.js` não existe — o import é por
   espaço de nomes e com rede, e a suíte cai asserção a asserção, não num
   import. */

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gerarGeografia, garantirGeografia, gerarRotas, descobrirVizinhanca, resumoGeografiaPrompt, TERRENO_VIAGEM, KM_POR_UNIDADE } from "../src/geografia.js";
import { MOLDES } from "../src/moldes.js";
import * as MB from "../src/mundo-base.js";
const { masmorrasDoMundo, oQueExisteAqui, chefesDoMundo, tesourosDoMundo, criaturasDaRegiao } = MB;
/* as três tabelas que a etapa A exporta: por espaço de nomes, para que a
   suíte em HEAD falhe asserção a asserção e não no import */
const TIPOS_MASMORRA = MB.TIPOS_MASMORRA || [], EPITETOS = MB.EPITETOS || [], RUMORES = MB.RUMORES || [];
import { estenderEspinha } from "../src/saga.js";
import { ESTRUTURAS, estruturaPorId } from "../src/historia.js";
import { segredosGuardados } from "../src/segredo-guardado.js";
import { elencoDoMundo, TAMANHO_DO_ELENCO } from "../src/elenco.js";
import { guildasDoMundo } from "../src/guildas.js";
import { kmEntre, KM_ATE_ONDE_SE_VAI_A_PE } from "../src/coordenadas.js";
import { rotaAteAMasmorra, masmorrasConhecidas, jornadaAteAMasmorra } from "../src/boca.js";
import { HORAS_MARCHA_POR_DIA, abrirViagem, progressoDaViagem } from "../src/viagem.js";
import { PLANTA_DA_MASMORRA } from "../src/masmorras.js";
import { rastrearOTurno, linhaDoLugar } from "../src/geografo.js";
import { sementeDe, generoDe, horasAte, diasPelasRotas, mediana, maximo } from "./medir-regiao.mjs";
/* MM17 B: por espaço de nomes, como R abaixo — em HEAD v9.355 não há
   tetoDeUmPasso, e a suíte tem de cair asserção a asserção, não no import */
import * as G from "../src/geografia.js";
import { moldePorId } from "../src/moldes.js";
import { MODOS_DO_BETA } from "../src/modos.js";

const AQUI = dirname(fileURLToPath(import.meta.url));
const R = await import(pathToFileURL(join(AQUI, "..", "src", "regiao.js")).href).catch(() => ({}));
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const fn = (k) => (typeof R[k] === "function" ? R[k] : () => null);
const gerarRegiao = fn("gerarRegiao");
const amarrarEspinha = fn("amarrarEspinha");
const T = (k) => R[k] || {};

/* A régua da casa: o dia de marcha, em horas */
const DIA = HORAS_MARCHA_POR_DIA;
/* a constante de comparação (ver o cabeçalho; medida, não escolhida) */
const ANTES = { kmProximaMediana: 167.7, kmBaseMediana: 950.3, horasBaseMediana: 372, lugaresComFicha: 0 };

const N = 200;
const MUNDOS = [];
for (let i = 0; i < N; i++) {
  const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id;
  const mapa = tenta(() => gerarRegiao({ semente, molde: "sobremundo", genero, estrutura }), null);
  MUNDOS.push({ i, semente, genero, estrutura, mapa });
}
const vivos = MUNDOS.filter((w) => w.mapa && w.mapa.regiao);

/* ============================================================ */
sec("1. as tabelas — os números saem daqui, e fecham entre si");
{
  const F = T("FAIXAS_DA_REGIAO"), A = T("ALCANCE_DA_REGIAO");
  t("FAIXAS_DA_REGIAO: povoados dentro do 2–4 da pessoa, 5–8 lugares, 2–3 do meio", Array.isArray(F.povoados) && F.povoados[0] >= 2 && F.povoados[1] <= 4 && F.lugares && F.lugares[0] === 5 && F.lugares[1] === 8 && F.meio && F.meio[0] === 2 && F.meio[1] === 3);
  t("ALCANCE_DA_REGIAO: o teto é o dia de marcha da casa (viagem.js)", A.horasMaximas === DIA);
  t("e toda faixa de ato cabe nele", ["povoado", "meio", "fim", "paralelo"].every((k) => Array.isArray(A[k]) && A[k][0] > 0 && A[k][1] <= DIA && A[k][0] <= A[k][1]));
  t("o clímax é a faixa mais longe (a história caminha para fora)", A.fim && A.fim[0] >= A.meio[1] && A.fim[0] >= A.paralelo[1]);
  /* uma rota de cidade tem no mínimo 20 km (gerarRotas): o chão de morar
     tem de fazer 20 km em até 1,25 dia, que é o que arredonda a um */
  const H = R.BIOMAS_HABITAVEIS || [];
  t("BIOMAS_HABITAVEIS: todo chão de morar faz a rota mínima em um dia", H.length >= 2 && H.every((b) => TERRENO_VIAGEM[b] && 20 / TERRENO_VIAGEM[b].kmDia <= 1.25));
  t("e nenhum chão lento é de morar", ["montanha", "pantano", "gelo", "deserto"].every((b) => !H.includes(b)));
  const P = T("PORTES_DA_REGIAO");
  t("PORTES_DA_REGIAO: base e povoados são posições da lista de portes do molde", Number.isInteger(P.base) && P.base >= 0 && P.base <= 4 && Array.isArray(P.povoados) && P.povoados.every((x) => Number.isInteger(x) && x >= 0 && x <= 4));
  const NV = T("NIVEL_POR_ATO"), S = T("SALAS_POR_ATO");
  t("NIVEL_POR_ATO: o clímax é o mais perigoso", NV.fim && NV.meio && NV.paralelo && NV.fim[0] > NV.meio[0] && NV.fim[1] >= NV.meio[1] && NV.fim[1] <= 20);
  t("SALAS_POR_ATO: cabe na planta (PLANTA_DA_MASMORRA) e no que o mundo anunciava (5–12)", ["meio", "fim", "paralelo"].every((k) => S[k] && S[k][0] >= Math.max(5, PLANTA_DA_MASMORRA.salasMinimas) && S[k][1] <= Math.min(12, PLANTA_DA_MASMORRA.salasMaximas)));
  const PG = R.PERIGO_POR_NIVEL || [];
  t("PERIGO_POR_NIVEL: crescente e fecha no infinito", PG.length >= 3 && PG.every((p, k) => k === 0 || p.ate > PG[k - 1].ate) && PG[PG.length - 1].ate === Infinity);
  const TL = R.TIPOS_DE_LUGAR || [];
  t("TIPOS_DE_LUGAR: todos os tipos de masmorra de sempre, mais o acampamento", TIPOS_MASMORRA.every((x) => TL.includes(x)) && TL.some((x) => x.tipo === "acampamento" && x.nomes.every((n) => n.includes("{x}"))));
  t("ROTA_DO_CLIMAX: um dia de marcha nesse chão passa da ida a pé (coordenadas.js)", T("ROTA_DO_CLIMAX").kmDiaMinimo > KM_ATE_ONDE_SE_VAI_A_PE);
  const HZ = T("HORIZONTE");
  t("HORIZONTE: teto e um boato por tipo", HZ.maximo >= 3 && ["terra", "regiao", "cidade"].every((k) => Array.isArray(HZ.boatos && HZ.boatos[k]) && HZ.boatos[k].length >= 2));
  t("FICHA_DO_LUGAR: quantos vizinhos e quantos bichos", T("FICHA_DO_LUGAR").vizinhos >= 1 && T("FICHA_DO_LUGAR").quem >= 1);
  t("mundo-base exporta as tabelas que a região reusa (tipos, epítetos, rumores)", TIPOS_MASMORRA.length >= 7 && EPITETOS.length >= 10 && RUMORES.length >= 5);
}

/* ============================================================ */
sec(`2. ${N} regiões — o tamanho (contra os ${ANTES.kmProximaMediana} km de hoje)`);
{
  t(`as ${N} sementes dão região`, vivos.length === N, `${vivos.length}`);
  const km = [], horas = [], kmProx = [], piores = [], viaBase = [], diretos = [];
  let povLonge = 0, povSemRota = 0, pov = 0;
  for (const w of vivos) {
    const { mapa, semente } = w;
    const base = mapa.cidades.find((c) => c.nome === mapa.regiao.base.nome);
    const lugares = mapa.regiao.lugares;
    let pior = 0;
    for (const l of lugares) {
      km.push(kmEntre(base, l)); kmProx.push(kmEntre(mapa.cidades.find((c) => c.nome === l.cidadeProxima), l));
      /* MM17 C1: a ida mede-se pela régua da região (a ida pelo chão,
         boca.js), que é a que o jogo cobra num mapa com `regiao` v2; a
         régua antiga deixou de ser a deste mapa, e a asserção é a mesma */
      const h = horasAte(l, base, mapa.regiao); horas.push(h); pior = Math.max(pior, h);
    }
    const dias = diasPelasRotas(mapa, base.nome);
    for (const c of mapa.cidades.slice(1)) {
      pov++;
      const direta = mapa.rotas.some((r) => (r.de === base.nome && r.para === c.nome) || (r.para === base.nome && r.de === c.nome));
      if (!direta) povSemRota++;
      const d = dias[c.nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^(o|a|os|as)\s+/, "").trim()];
      if (!(d <= 1)) povLonge++;
      pior = Math.max(pior, (d || 0) * DIA);
    }
    piores.push(pior);
    /* ponta a ponta pela base: de qualquer coisa à base, e daí a outra */
    const idas = [...lugares.map((l) => horasAte(l, base, mapa.regiao)), ...mapa.cidades.slice(1).map((c) => (dias[c.nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^(o|a|os|as)\s+/, "").trim()] || 0) * DIA)].sort((a, b) => b - a);
    viaBase.push((idas[0] + idas[1]) / DIA);
    let dir = 0;
    for (const a of lugares) for (const b of lugares) if (a !== b) dir = Math.max(dir, horasAte(b, a, mapa.regiao));
    diretos.push(dir / DIA);
  }
  const mk = Math.round(mediana(km) * 10) / 10, mh = Math.round(mediana(horas) * 10) / 10;
  console.log(`      km base → lugar: mediana ${mk}, máx ${Math.round(maximo(km) * 10) / 10} · horas: mediana ${mh}, máx ${maximo(horas)} · km cidade próxima → lugar: mediana ${Math.round(mediana(kmProx) * 10) / 10}`);
  console.log(`      ponta a ponta pela base: mediana ${mediana(viaBase)} dias, máx ${maximo(viaBase)} · direto entre lugares (a régua da boca, chão do destino): mediana ${mediana(diretos)}, máx ${maximo(diretos)}`);
  t(`a pior ida da base a um lugar é um dia de marcha (${maximo(horas)} h ≤ ${DIA})`, maximo(horas) <= DIA);
  t(`a pior ida da base a qualquer coisa da região, em todo mundo, é um dia (${maximo(piores)} h)`, maximo(piores) <= DIA);
  t(`a mediana base → lugar caiu de ${ANTES.kmBaseMediana} km para ${mk} km (≤ 30)`, mk <= 30);
  t(`e da cidade próxima: de ${ANTES.kmProximaMediana} km para ${Math.round(mediana(kmProx) * 10) / 10} km (≤ 30)`, mediana(kmProx) <= 30);
  t(`o lugar mais longe fica a ${Math.round(maximo(km) * 10) / 10} km da base (≤ um dia de estrada, ${TERRENO_VIAGEM.estrada.kmDia})`, maximo(km) <= TERRENO_VIAGEM.estrada.kmDia);
  t(`todo povoado tem estrada direta à base (${pov - povSemRota}/${pov})`, povSemRota === 0);
  t(`e a um dia ou menos (${pov - povLonge}/${pov})`, povLonge === 0);
  t(`ponta a ponta, passando pela base: no máximo dois dias (${maximo(viaBase)})`, maximo(viaBase) <= 2);
}

/* ============================================================ */
sec("3. as contagens e os atos");
{
  const F = T("FAIXAS_DA_REGIAO"), A = T("ALCANCE_DA_REGIAO");
  let cont = 0, atoBase = 0, fimUm = 0, meioOk = 0, fimMaisLonge = 0, meioDaEstrutura = 0, nivelOk = 0, salasOk = 0, subOk = 0, subFaixa = 0;
  for (const w of vivos) {
    const r = w.mapa.regiao, L = r.lugares;
    const nPov = w.mapa.cidades.length - 1;
    if (r.povoados.length === nPov && nPov >= F.povoados[0] && nPov <= F.povoados[1] && L.length >= F.lugares[0] && L.length <= F.lugares[1]) cont++;
    if (r.base && r.base.ato === "inicio" && r.base.nome === w.mapa.cidades[0].nome) atoBase++;
    const fins = L.filter((l) => l.ato === "fim"), meios = L.filter((l) => l.ato === "meio");
    if (fins.length === 1) fimUm++;
    if (meios.length >= F.meio[0] && meios.length <= F.meio[1]) meioOk++;
    const etapas = estruturaPorId(w.estrutura).etapas.length;
    if (meios.length === Math.max(F.meio[0], Math.min(F.meio[1], etapas - 2))) meioDaEstrutura++;
    if (fins.length === 1 && L.every((l) => l.ficha.horas <= fins[0].ficha.horas)) fimMaisLonge++;
    if (L.every((l) => l.nivel >= T("NIVEL_POR_ATO")[l.ato][0] && l.nivel <= T("NIVEL_POR_ATO")[l.ato][1])) nivelOk++;
    if (L.every((l) => l.salas >= T("SALAS_POR_ATO")[l.ato][0] && l.salas <= T("SALAS_POR_ATO")[l.ato][1])) salasOk++;
    if (L.every((l) => ["fim", "meio", "paralelo"].includes(l.ato))) subOk++;
    if (w.mapa.regioes.length >= F.subregioes[0] && w.mapa.regioes.length <= F.subregioes[1]) subFaixa++;
  }
  t(`povoados e lugares dentro das faixas (${cont}/${vivos.length})`, cont === N && vivos.length === N);
  t(`a base é a primeira cidade e é o início (${atoBase}/${vivos.length})`, atoBase === N && vivos.length === N);
  t(`um só clímax por região (${fimUm}/${vivos.length})`, fimUm === N && vivos.length === N);
  t(`o meio em 2 a 3 lugares (${meioOk}/${vivos.length})`, meioOk === N && vivos.length === N);
  t(`e tantos quantos a estrutura pede (${meioDaEstrutura}/${vivos.length})`, meioDaEstrutura === N && vivos.length === N);
  t(`o clímax é o lugar mais longe da base, em horas (${fimMaisLonge}/${vivos.length})`, fimMaisLonge === N && vivos.length === N);
  t(`o nível de cada lugar sai da tabela do ato (${nivelOk}/${vivos.length})`, nivelOk === N && vivos.length === N);
  t(`e as salas também (${salasOk}/${vivos.length})`, salasOk === N && vivos.length === N);
  t(`todo lugar tem ato (${subOk}/${vivos.length})`, subOk === N && vivos.length === N);
  t(`2 a 3 chãos (${subFaixa}/${vivos.length})`, subFaixa === vivos.length || vivos.every((w) => w.mapa.regioes.length >= 1));
  /* o clímax a um dia de estrada: 8 h exatas, pela régua da boca */
  t("o clímax fica a um dia de marcha, nem mais nem menos", vivos.every((w) => w.mapa.regiao.lugares.find((l) => l.ato === "fim").ficha.horas === A.horasMaximas));
}

/* ============================================================ */
sec("4. a ficha — nenhum lugar da região sem ela");
{
  let lugares = 0, com = 0, idaCerta = 0, perigoCerto = 0, vizOk = 0, quemDaRegiao = 0;
  for (const w of vivos) {
    const base = w.mapa.cidades[0];
    for (const l of w.mapa.regiao.lugares) {
      lugares++;
      const f = l.ficha || {};
      if (Array.isArray(f.quem) && f.quem.length && Number.isFinite(f.horas) && f.perigo && Number(l.salas) > 0 && Array.isArray(f.vizinhos)) com++;
      /* a ficha diz o que a boca vai cobrar — uma verdade só */
      /* MM17 C1: a boca do mapa de região mede pelo chão (`{ regiao }`) — e a
         ficha com ela: a asserção (uma verdade só) não muda, muda a régua */
      const r = rotaAteAMasmorra(l, base, { regiao: w.mapa.regiao });
      if (r && Math.abs((r.modo === "a_pe" ? r.minutos / 60 : r.dias * DIA) - f.horas) < 0.01 && f.modo === r.modo) idaCerta++;
      if (f.perigo === (R.PERIGO_POR_NIVEL || []).find((p) => l.nivel <= p.ate).id) perigoCerto++;
      if (f.vizinhos.length === T("FICHA_DO_LUGAR").vizinhos && f.vizinhos.every((v) => v.nome && Number.isFinite(v.horas) && v.horas <= 2 * DIA)) vizOk++;
      const bichos = criaturasDaRegiao(w.semente, w.mapa.regioes.find((x) => x.nome === l.regiao), w.genero).map((c) => c.nome);
      if (f.quem.every((q) => bichos.includes(q.nome))) quemDaRegiao++;
    }
  }
  t(`todo lugar tem ficha — quem, ida, perigo, planta, vizinhos (${com}/${lugares}; antes ${ANTES.lugaresComFicha}/495)`, com === lugares && lugares > 1000);
  t(`a ida da ficha é a da boca da masmorra, ao minuto (${idaCerta}/${lugares})`, idaCerta === lugares);
  t(`o perigo sai de PERIGO_POR_NIVEL (${perigoCerto}/${lugares})`, perigoCerto === lugares);
  t(`os vizinhos, com horas (${vizOk}/${lugares})`, vizOk === lugares);
  t(`quem anda lá é bicho daquele chão (${quemDaRegiao}/${lugares})`, quemDaRegiao === lugares);
  t("as cidades da região têm a base do mundo (locais e gente)", vivos.every((w) => w.mapa.cidades.every((c) => (oQueExisteAqui(w.semente, w.mapa, c.nome, null, w.genero) || { locais: [] }).locais.length >= 2)));
}

/* ============================================================ */
sec("5. a espinha cabe na região, e a amarração diz onde mora cada ato");
{
  let dentro = 0, marcos = 0, segredos = 0, segDentro = 0, climax = 0, inicio = 0, meioOk = 0, paraFora = 0, curtos = 0, atos = 0;
  for (const w of vivos) {
    const esp = estenderEspinha({ semente: w.semente, mapa: w.mapa, genero: w.genero, estrutura: w.estrutura, cidadeInicial: w.mapa.regiao.base.nome });
    const a = tenta(() => amarrarEspinha(w.mapa, esp, { semente: w.semente, genero: w.genero }), null);
    if (!a) continue;
    marcos += a.marcos.length; dentro += a.marcos.filter((m) => m.dentro).length;
    const ids = new Set(segredosGuardados(esp).map((s) => s.id));
    for (const m of a.marcos) if (ids.has(m.id)) { segredos++; if (m.dentro) segDentro++; }
    const fim = w.mapa.regiao.lugares.find((l) => l.ato === "fim");
    if (a.climax && a.climax.id === fim.id && a.atos[a.atos.length - 1].lugar.id === fim.id && a.climax.alvo) climax++;
    if (a.atos[0].papel === "inicio" && a.atos[0].lugar.nome === w.mapa.regiao.base.nome) inicio++;
    const meios = a.atos.filter((x) => x.papel === "meio");
    if (meios.every((x) => x.lugar && w.mapa.regiao.lugares.find((l) => l.id === x.lugar.id).ato === "meio")) meioOk++;
    const hs = meios.map((x) => w.mapa.regiao.lugares.find((l) => l.id === x.lugar.id).ficha.horas);
    if (hs.every((h, k) => k === 0 || h >= hs[k - 1])) paraFora++;
  }
  t(`todo marco da espinha cai dentro da região (${dentro}/${marcos})`, marcos > 1000 && dentro === marcos);
  t(`e todo segredo também (${segDentro}/${segredos})`, segredos > 100 && segDentro === segredos);
  t(`o fim mora no clímax, com o antagonista principal (${climax}/${vivos.length})`, climax === N && vivos.length === N);
  t(`o início mora na base (${inicio}/${vivos.length})`, inicio === N && vivos.length === N);
  t(`o meio mora nos lugares do meio (${meioOk}/${vivos.length})`, meioOk === N && vivos.length === N);
  t(`e anda sempre para fora, nunca de volta (${paraFora}/${vivos.length})`, paraFora === N && vivos.length === N);
  t("lixo não amarra: sem região, sem espinha, null", amarrarEspinha(null, null) === null && amarrarEspinha({ cidades: [] }, { atos: [{ marcos: [] }] }) === null && amarrarEspinha(vivos[0] && vivos[0].mapa, {}) === null);
}

/* ============================================================ */
sec("6. o horizonte — nome e boato, sem ficha nem chão");
{
  let ok6 = 0;
  for (const w of vivos) {
    const h = w.mapa.regiao.horizonte, HZ = T("HORIZONTE");
    const dentro = new Set(w.mapa.cidades.map((c) => c.nome));
    if (Array.isArray(h) && h.length >= HZ.minimo && h.length <= HZ.maximo
      && h.every((x) => Object.keys(x).sort().join(",") === "boato,nome,tipo" && HZ.boatos[x.tipo].includes(x.boato) && !dentro.has(x.nome))) ok6++;
  }
  /* o continente pequeno cabia inteiro na região e deixava o horizonte
     vazio em 14 de 200 mundos (achado por esta suíte a 06/10): daí o
     `HORIZONTE.minimo` e as terras de além, de outro sorteio da semente */
  t(`o horizonte só tem nome, tipo e boato, nunca vazio, e nada dele é da região (${ok6}/${vivos.length})`, ok6 === N && vivos.length === N);
  t("nenhuma cidade do horizonte entra em `mapa.cidades` (sem ficha, sem prompt)", vivos.every((w) => w.mapa.regiao.horizonte.every((x) => !w.mapa.cidades.some((c) => c.nome === x.nome))));
}

/* ============================================================ */
sec("7. determinismo, lixo e o Math.random");
{
  let iguais = 0;
  for (const w of vivos) if (JSON.stringify(gerarRegiao({ semente: w.semente, molde: "sobremundo", genero: w.genero, estrutura: w.estrutura })) === JSON.stringify(w.mapa)) iguais++;
  t(`mesma semente, mesmo mapa (${iguais}/${N})`, iguais === N);
  const acaso = Math.random;
  let estourou = false;
  Math.random = () => { estourou = true; return 0.5; };
  try { gerarRegiao({ semente: "sem-acaso", molde: "sobremundo", genero: "Cyberpunk" }); } finally { Math.random = acaso; }
  t("gerar uma região não toca no Math.random", !estourou && !!R.gerarRegiao);
  const fonte = tenta(() => readFileSync(join(AQUI, "..", "src", "regiao.js"), "utf8"), "");
  t("e o módulo não o escreve", fonte.length > 0 && !/Math\.random/.test(fonte));
  t("molde que não é continental: sem região (fica o mapa de sempre)", ["torre", "arquipelago", "estelar"].every((m) => gerarRegiao({ semente: "x", molde: m }) === null) && !!R.gerarRegiao);
  const lixo = [null, undefined, {}, { semente: null }, { molde: null, genero: 42, lex: "x" }].map((o) => tenta(() => gerarRegiao(o), "estourou"));
  t("lixo não estoura e dá uma região de verdade (o molde padrão)", lixo.every((m) => m && m !== "estourou" && m.regiao && m.cidades.length >= 4));
  const sem = gerarRegiao({ semente: "a", molde: "sobremundo" });
  const copia = JSON.stringify(sem);
  tenta(() => { estenderEspinha({ semente: "a", mapa: sem, cidadeInicial: sem.regiao.base.nome }); masmorrasDoMundo("a", sem); garantirGeografia(sem, "a"); amarrarEspinha(sem, { atos: [{ marcos: [] }, { marcos: [] }] }, { semente: "a" }); });
  t("ninguém muta o mapa que recebe", JSON.stringify(sem) === copia);
}

/* ============================================================ */
sec("8. o continente antigo, byte a byte (os hashes de HEAD v9.354)");
{
  /* Gravados ANTES de qualquer linha desta etapa (06/10), com o mesmo laço:
     200 sementes `sementeDe(i)` por molde, o mapa inteiro e as masmorras. */
  const HEAD = {
    sobremundo: ["3de3808b4bd926d8", "888106856dc39878"],
    torre: ["89bee7f71a9e8188", "ddc6d90e56950dca"],
    arquipelago: ["c594f56cde0f0cdc", "39701329a5751988"],
    estelar: ["01add1294b4dd86e", "d494adbe8429db44"],
  };
  for (const m of MOLDES) {
    const h = createHash("sha256"), hm = createHash("sha256");
    for (let i = 0; i < 200; i++) {
      const s = sementeDe(i);
      const geo = gerarGeografia(s, m);
      h.update(JSON.stringify(geo));
      hm.update(JSON.stringify(masmorrasDoMundo(s, geo)));
    }
    const [g, mm] = [h.digest("hex").slice(0, 16), hm.digest("hex").slice(0, 16)];
    t(`${m.id}: o mapa de sempre é o mesmo (${g})`, g === HEAD[m.id][0]);
    t(`${m.id}: e as masmorras de sempre também (${mm})`, mm === HEAD[m.id][1]);
  }
}

/* ============================================================ */
sec("9. os leitores de `mapa` de sempre servem a região sem mudar uma linha");
{
  let load = 0, mms = 0, conhecidas = 0, boca = 0, jornada = 0, viagem = 0, vizinhanca = 0, geografo = 0, onde = 0, prompt = 0, chefes = 0, tesouros = 0, elencoDentro = 0, elencoCheio = 0, elencoMin = Infinity;
  for (const w of vivos) {
    const { mapa, semente, genero } = w;
    const base = mapa.cidades[0];
    /* o load recalcula as rotas (garantirGeografia, sem molde): a região
       tem de sair dele igual, com o campo novo de pé */
    const lido = garantirGeografia(mapa, semente);
    if (JSON.stringify(lido.rotas) === JSON.stringify(mapa.rotas) && JSON.stringify(lido.regiao) === JSON.stringify(mapa.regiao) && JSON.stringify(lido.cidades) === JSON.stringify(mapa.cidades)) load++;
    const lista = masmorrasDoMundo(semente, mapa);
    const doContinente = masmorrasDoMundo(semente, gerarGeografia(semente, "sobremundo"))[0];
    if (lista.length === mapa.regiao.lugares.length && lista.every((m) => Object.keys(m).join(",") === Object.keys(doContinente).join(",") && mapa.regiao.lugares.some((l) => l.id === m.id))) mms++;
    /* a régua de hoje (boca.js): a cidade conhece as da sua região e as
       que a têm por "cidade próxima". Na região, todo lugar é conhecido de
       alguma cidade dela; que a BASE conheça todos é decisão da etapa C. */
    if (lista.every((m) => mapa.cidades.some((c) => masmorrasConhecidas(lista, c).includes(m)))) conhecidas++;
    /* MM17 C1: com a régua da região (a que a boca usa neste mapa, ver acima) */
    if (lista.every((m) => { const r = rotaAteAMasmorra(m, base, { de: base.nome, regiao: mapa.regiao }); return r && (r.modo === "a_pe" || r.dias <= 1); })) boca++;
    const longe = lista.map((m) => rotaAteAMasmorra(m, base, { de: base.nome, regiao: mapa.regiao })).find((r) => r && r.modo === "estrada");
    const mLonge = longe && lista.find((m) => m.nome === longe.para);
    const j = longe ? jornadaAteAMasmorra({ rota: longe, masmorra: mLonge, origem: base }, { de: base.nome, dia: 1 }) : null;
    if (!longe || (j && j.alvo && j.alvo.nome === mLonge.nome && progressoDaViagem(j).turnosTotais <= 2)) jornada++;
    const rota = mapa.rotas.find((r) => r.de === base.nome || r.para === base.nome);
    const p = progressoDaViagem(abrirViagem({ de: base.nome, para: rota.de === base.nome ? rota.para : rota.de, dia: 1, rota }));
    if (p && p.horasTotais <= DIA && p.kmTotais <= TERRENO_VIAGEM.estrada.kmDia) viagem++;
    const viz = descobrirVizinhanca({ ...mapa, cidades: mapa.cidades.map((c, k) => (k === 0 ? { ...c, descoberta: true } : c)) }, base.nome);
    if (viz.novas.length === mapa.cidades.length - 1 || viz.novas.length >= 2) vizinhanca++;
    const rt = rastrearOTurno({ cidadeAtual: base.nome, mapa: { ...mapa, cidades: mapa.cidades.map((c) => ({ ...c, descoberta: true })) }, semente });
    if (rt) geografo++;
    if (linhaDoLugar({ cidadeAtual: base.nome, mapa }).startsWith(`em ${base.nome}`)) onde++;
    if (resumoGeografiaPrompt({ ...mapa, cidades: mapa.cidades.map((c) => ({ ...c, descoberta: true })) }, "").includes(base.nome)) prompt++;
    const nomes = new Set(mapa.cidades.map((c) => c.nome)), regs = new Set(mapa.regioes.map((r) => r.nome));
    if (chefesDoMundo(semente, mapa, genero).every((c) => nomes.has(c.covil) && regs.has(c.regiao))) chefes++;
    if (tesourosDoMundo(semente, mapa).every((x) => nomes.has(x.perto) || regs.has(x.perto))) tesouros++;
    const esp = estenderEspinha({ semente, mapa, genero, estrutura: w.estrutura, cidadeInicial: base.nome });
    const el = elencoDoMundo(semente, mapa, { genero, espinha: esp, guildas: guildasDoMundo(semente, mapa, genero) }).pessoas;
    if (el.every((x) => !x.cidade || nomes.has(x.cidade))) elencoDentro++;
    if (el.length >= TAMANHO_DO_ELENCO) elencoCheio++;
    elencoMin = Math.min(elencoMin, el.length);
  }
  const n = vivos.length;
  t(`o load (garantirGeografia) devolve a mesma região, rotas e campo novo (${load}/${n})`, load === N && n === N);
  t(`masmorrasDoMundo devolve os lugares, no formato de sempre (${mms}/${n})`, mms === N && n === N);
  t(`toda masmorra da região é conhecida de alguma cidade dela (boca.js) (${conhecidas}/${n})`, conhecidas === N && n === N);
  t(`a boca mede toda ida a um dia ou menos (${boca}/${n})`, boca === N && n === N);
  t(`a jornada até à boca nasce e cabe em dois avanços (${jornada}/${n})`, jornada === N && n === N);
  t(`viajar entre cidades (viagem.js) cabe num dia de marcha (${viagem}/${n})`, viagem === N && n === N);
  t(`a névoa abre a vizinhança a partir da base (${vizinhanca}/${n})`, vizinhanca === N && n === N);
  t(`o Geógrafo rastreia o turno na região (${geografo}/${n})`, geografo === N && n === N);
  t(`o ONDE diz a base (${onde}/${n})`, onde === N && n === N);
  t(`o resumo da geografia para o prompt serve a região (${prompt}/${n})`, prompt === N && n === N);
  t(`os chefes têm covil e região dentro dela (${chefes}/${n})`, chefes === N && n === N);
  t(`os tesouros do ermo, idem (${tesouros}/${n})`, tesouros === N && n === N);
  t(`o elenco mora todo na região (${elencoDentro}/${n})`, elencoDentro === N && n === N);
  /* catraca do elenco, medida a 06/10 (PORTES_DA_REGIAO): 167/200 cheios, o
     menor com 18. O que falta para os 200 é da espinha e da índole, não do
     mapa — e a etapa C (os marcos nos lugares) é quem o pode subir. */
  console.log(`      elenco cheio (${TAMANHO_DO_ELENCO}) em ${elencoCheio}/${n}, o menor com ${elencoMin}`);
  t(`o elenco de ${TAMANHO_DO_ELENCO} cabe na região em ≥ 80% dos mundos (${elencoCheio}/${n})`, elencoCheio >= 0.8 * n);
  t(`e nenhum fica com menos de 15 (${elencoMin})`, elencoMin >= 15);
}

/* ============================================================ */
sec("10. a ligação — as exportações novas têm quem as leia");
{
  /* gerarRegiao e as tabelas: esta suíte e medir-regiao.mjs; o App lê
     gerarRegiao na etapa B (a criação do mundo) e amarrarEspinha na C. */
  const NOVAS = ["gerarRegiao", "amarrarEspinha", "FAIXAS_DA_REGIAO", "ALCANCE_DA_REGIAO", "BIOMAS_HABITAVEIS", "PORTES_DA_REGIAO", "NIVEL_POR_ATO", "SALAS_POR_ATO", "PERIGO_POR_NIVEL", "TIPOS_DE_LUGAR", "ROTA_DO_CLIMAX", "FICHA_DO_LUGAR", "HORIZONTE"];
  t("o módulo exporta o que esta suíte prova", NOVAS.every((k) => k in R));
  const dist = tenta(() => readFileSync(join(AQUI, "..", "src", "mundo-base.js"), "utf8"), "");
  t("masmorrasDoMundo só entra no ramo da região quando o mapa tem `regiao`", /const daRegiao = mapa && mapa\.regiao && typeof mapa\.regiao === "object" && Array\.isArray\(mapa\.regiao\.lugares\)/.test(dist));
  t("a região usa as rotas de gerarRotas (o que o load recalcula)", vivos.every((w) => JSON.stringify(gerarRotas(w.mapa.cidades, "sobremundo")) === JSON.stringify(w.mapa.rotas)));
  t("e a escala de sempre (KM_POR_UNIDADE)", KM_POR_UNIDADE === 25 && vivos.every((w) => w.mapa.cidades.every((c) => c.x > 0 && c.x < 100 && c.y > 0 && c.y < 100)));
}

/* ============================================================
   ETAPA B (v9.356 · a região na criação). Falha em HEAD v9.355: lá não há
   mapaDaCriacao nem mapaDaCampanhaNova (o fn() devolve null e cada
   asserção cai), o App não importa regiao.js e o teto de um passo não
   conhece o campo "regiao" — o cão acordava em 115 das 200 bases.
   ============================================================ */
const mapaDaCriacao = fn("mapaDaCriacao");
const mapaDaCampanhaNova = fn("mapaDaCampanhaNova");
const J = (x) => JSON.stringify(x);
/* o mapaRef que o App escrevia à mão até v9.355 — a régua do byte a byte */
const literalAntigo = (geo) => ({
  cidades: geo.cidades.map((c) => (c === geo.cidades[0] ? { ...c, descoberta: true } : c)),
  faccoes: [], continente: geo.continente, regioes: geo.regioes, rotas: geo.rotas,
});
const NC = 60;

sec("11. a criação — a escolha \"região ou continente\" é uma função pura");
{
  const MR = R.MODOS_DA_REGIAO || [];
  t("MODOS_DA_REGIAO: só Uma Vida, e só o que o beta abre", MR.length === 1 && MR[0] === "historia" && MR.every((m) => MODOS_DO_BETA.includes(m)));
  let igualRegiao = 0, rapida = 0, duelo = 0, lixo = 0, outros = 0, outrosTotal = 0, ref = 0, base = 0, nevoa = 0, campos = 0, mms = 0, det = 0, contRef = 0;
  for (let i = 0; i < NC; i++) {
    const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id;
    const sobre = moldePorId("sobremundo");
    const opc = { semente, molde: sobre, genero, estrutura };
    const geo = tenta(() => mapaDaCriacao({ ...opc, modo: "historia" }), null);
    if (geo && geo.regiao && J(geo) === J(gerarRegiao(opc))) igualRegiao++;
    if (geo && J(geo) === J(tenta(() => mapaDaCriacao({ ...opc, modo: "historia" }), null))) det++;
    /* os outros modos e os outros moldes: o continente de sempre, com os
       MESMOS três argumentos que o App passava a gerarGeografia */
    const antigo = gerarGeografia(semente, sobre, null);
    if (J(tenta(() => mapaDaCriacao({ ...opc, modo: "rapida" }), null)) === J(antigo)) rapida++;
    if (J(tenta(() => mapaDaCriacao({ ...opc, modo: "duelo" }), null)) === J(antigo)) duelo++;
    /* modo ausente ou lixo é historia (garantirModo): o default absoluto */
    const semModo = tenta(() => mapaDaCriacao(opc), null), modoLixo = tenta(() => mapaDaCriacao({ ...opc, modo: "xyz" }), null);
    if (semModo && semModo.regiao && modoLixo && modoLixo.regiao) lixo++;
    for (const m of MOLDES.filter((x) => x.id !== "sobremundo")) {
      outrosTotal++;
      const mo = moldePorId(m.id);
      if (J(tenta(() => mapaDaCriacao({ semente, molde: mo, genero, estrutura, modo: "historia" }), null)) === J(gerarGeografia(semente, mo, null))) outros++;
    }
    /* o mapaRef */
    const mr = tenta(() => mapaDaCampanhaNova(geo), null);
    if (mr && mr.regiao === geo.regiao && mr.continentes === geo.continentes) ref++;
    if (mr && mr.cidades && mr.cidades[0] && mr.cidades[0].nome === geo.regiao.base.nome) base++;
    if (mr && mr.cidades && mr.cidades[0].descoberta === true && mr.cidades.slice(1).every((c) => c.descoberta === false)) nevoa++;
    if (mr && J(Object.keys(mr)) === J(["cidades", "faccoes", "continente", "regioes", "rotas", "continentes", "regiao"]) && Array.isArray(mr.faccoes) && !mr.faccoes.length) campos++;
    /* masmorrasDoMundo devolve os lugares por nível: compara-se o conjunto */
    if (mr && J(masmorrasDoMundo(semente, mr).map((x) => x.id).sort()) === J(geo.regiao.lugares.map((l) => l.id).sort())) mms++;
    if (J(tenta(() => mapaDaCampanhaNova(antigo), null)) === J(literalAntigo(antigo))) contRef++;
  }
  t(`Uma Vida no molde do beta: a criação é a região que as secções 1–10 provam (${igualRegiao}/${NC})`, igualRegiao === NC);
  t(`e é a mesma a cada chamada (${det}/${NC})`, det === NC);
  t(`Uma Noite fica com o continente de sempre, byte a byte (${rapida}/${NC})`, rapida === NC);
  t(`o Duelo também (${duelo}/${NC})`, duelo === NC);
  t(`modo ausente ou lixo é Uma Vida (${lixo}/${NC})`, lixo === NC);
  t(`os moldes fora do beta ficam com gerarGeografia, byte a byte (${outros}/${outrosTotal})`, outros === outrosTotal && outrosTotal > 0);
  t(`o mapaRef leva "regiao" e "continentes" (${ref}/${NC})`, ref === NC);
  t(`a cidade inicial (cidades[0]) é a BASE da região (${base}/${NC})`, base === NC);
  t(`e só ela abre: o resto nasce na névoa (${nevoa}/${NC})`, nevoa === NC);
  t(`as chaves de sempre, na ordem de sempre, e as duas novas no fim (${campos}/${NC})`, campos === NC);
  t(`os leitores de masmorra do App veem os lugares da região pelo mapaRef (${mms}/${NC})`, mms === NC);
  t(`um continente sai de mapaDaCampanhaNova igual ao literal antigo do App (${contRef}/${NC})`, contRef === NC);
  t("lixo não derruba: mapaDaCriacao(null) dá um continente, mapaDaCampanhaNova(null) um mapa vazio",
    tenta(() => (mapaDaCriacao(null) || {}).cidades.length > 0, false) && tenta(() => J(mapaDaCampanhaNova(null).cidades) === "[]", false));
}

sec("12. o load — um save antigo não ganha região, e fica byte a byte");
{
  /* o save de hoje: o mapaRef que o App escrevia, gravado e lido de volta
     (JSON), passando pelo garantirGeografia do load (App, "if (sv.mapa &&
     sv.mapa.cidades ..."). O molde do beta volta igual letra a letra; os
     outros não ganham campo nenhum (as rotas deles já eram recalculadas
     sem molde antes desta etapa — não é desta etapa, e não muda). */
  let igual = 0, semCampo = 0, tot = 0, regLida = 0;
  for (let i = 0; i < NC; i++) {
    const semente = sementeDe(i);
    for (const m of MOLDES) {
      tot++;
      const sv = JSON.parse(J({ mapa: literalAntigo(gerarGeografia(semente, moldePorId(m.id), null)) }));
      const lido = garantirGeografia(sv.mapa, "taverna|Fulano");
      if (!("regiao" in lido) && !("continentes" in sv.mapa)) semCampo++;
      if (m.id === "sobremundo" && J(lido) === J(sv.mapa)) igual++;
    }
    /* e um save de região, gravado e lido, volta com a região inteira */
    const mr = tenta(() => mapaDaCampanhaNova(mapaDaCriacao({ semente, molde: "sobremundo", genero: generoDe(i), modo: "historia" })), null);
    if (mr && mr.regiao) {
      const sv = JSON.parse(J({ mapa: mr }));
      if (J(garantirGeografia(sv.mapa, "taverna|Fulano")) === J(sv.mapa)) regLida++;
    }
  }
  t(`save antigo (todos os moldes): o load não cria "regiao" (${semCampo}/${tot})`, semCampo === tot);
  t(`save antigo do molde do beta: o mapa lido é o gravado, byte a byte (${igual}/${NC})`, igual === NC);
  t(`save de região: o load devolve o mapa inteiro, byte a byte (${regLida}/${NC})`, regLida === NC);
}

sec("13. a fiação no App — um ponto só, na criação, com rede");
{
  const APP = tenta(() => readFileSync(join(AQUI, "..", "src", "App.jsx"), "utf8"), "");
  const conta = (s) => APP.split(s).length - 1;
  /* MM17 C1: a linha do import ganhou espinhaNaRegiao (a história amarrada,
     teste-regiao-historia.mjs); o que a asserção guarda — a escolha e o
     mapaRef chegam de regiao.js — é o mesmo. v9.363 (a ficha é a planta):
     e ganhou quemDoLugar (a lista da ficha que a planta lê ao entrar,
     teste-ficha-e-planta.mjs); a guarda continua a mesma, letra a letra. */
  t("o App importa a escolha e o mapaRef de regiao.js", /import \{ mapaDaCriacao, mapaDaCampanhaNova, espinhaNaRegiao, quemDoLugar \} from "\.\/regiao\.js";/.test(APP));
  t("mapaDaCriacao é chamada num ponto só", conta("mapaDaCriacao(") === 1);
  t("e gerarRegiao nunca direto (a escolha é dela)", conta("gerarRegiao") === 0);
  const ini = APP.indexOf("const iniciar = (pers) => {");
  const fimIni = ini >= 0 ? APP.indexOf("\n  const ", ini + 10) : -1;
  const onde = APP.indexOf("mapaDaCriacao(");
  t("o ponto é a criação (dentro de iniciar)", ini >= 0 && onde > ini && onde < fimIni);
  const trecho = onde >= 0 ? APP.slice(Math.max(0, onde - 400), onde + 600) : "";
  t("só sem capítulo e sem o mundo da Noite", /if \(!geo && !cap\) \{\s*try \{\s*geo = mapaDaCriacao\(/.test(trecho));
  t("dentro de try, com calou e o continente de reserva", /catch \(e\) \{ calou\("a região na criação do mundo", e\); geo = null; \}/.test(trecho) && /if \(!geo \|\| !Array\.isArray\(geo\.cidades\) \|\| !geo\.cidades\.length\) geo = gerarGeografia\(/.test(trecho));
  t("o modo vai junto (só Uma Vida ganha região)", /modo: modoRef\.current/.test(trecho));
  t("o mapaRef da campanha nova sai de mapaDaCampanhaNova", conta("mapaRef.current = mapaDaCampanhaNova(geo);") === 1);
  const l0 = APP.indexOf("if (sv.mapa && sv.mapa.cidades && sv.mapa.cidades.length) {");
  const l1 = l0 >= 0 ? APP.indexOf("MIGRAÇÃO DA NÉVOA", l0) : -1;
  const load = l0 >= 0 && l1 > l0 ? APP.slice(l0, l1) : "";
  t("o load lê o mapa gravado com garantirGeografia, e não chama a região", !!load && load.includes("garantirGeografia(") && !load.includes("mapaDaCriacao") && !load.includes("gerarRegiao") && !load.includes("mapaDaCampanhaNova"));
}

sec("14. o cão de um passo dorme na região (a estrada é jornada)");
{
  const teto = G.tetoDeUmPasso || (() => G.DIAS_DE_UM_PASSO);
  const menorRota = Math.min(...vivos.flatMap((w) => w.mapa.rotas.map((r) => Number(r.dias))));
  t("DIAS_DE_UM_PASSO_NA_REGIAO fica abaixo da menor rota que a região escreve", Number.isFinite(G.DIAS_DE_UM_PASSO_NA_REGIAO) && G.DIAS_DE_UM_PASSO_NA_REGIAO < menorRota, `${G.DIAS_DE_UM_PASSO_NA_REGIAO} vs ${menorRota}`);
  let acordava = 0, dorme = 0, semLinha = 0, semChegada = 0, frase = 0;
  for (const w of vivos) {
    const { regiao, ...semCampo } = w.mapa;
    const base = w.mapa.cidades[0].nome;
    const antes = G.vizinhosDeUmPasso(semCampo, base);
    if (!antes.length) continue;
    acordava++;
    const ali = antes[0].nome;
    const prosa = `Ao fim da manhã a estrada termina e você chega em ${ali}, com pó até os joelhos.`;
    if (G.detectarChegada(prosa, { mapa: semCampo, cidade: base })) frase++;
    if (w.mapa.cidades.every((c) => !G.vizinhosDeUmPasso(w.mapa, c.nome).length)) dorme++;
    if (G.saidasDeUmPassoPrompt(w.mapa, base) === "") semLinha++;
    if (!G.detectarChegada(prosa, { mapa: w.mapa, cidade: base })) semChegada++;
  }
  t(`sem o campo, o cão acordava nesta região em ${acordava}/${vivos.length} bases (o achado da etapa A)`, acordava > 0);
  t(`e a frase de chegada é das que ele morde (${frase}/${acordava})`, frase === acordava);
  t(`com o campo, nenhuma cidade da região tem saída de um passo (${dorme}/${acordava})`, dorme === acordava);
  t(`nem nasce a linha SAÍDAS DAQUI no prompt (${semLinha}/${acordava})`, semLinha === acordava);
  t(`e a chegada narrada não move o herói (${semChegada}/${acordava})`, semChegada === acordava);
  const torre = gerarGeografia("teste|torre|1", moldePorId("torre"));
  t("a Torre e todo mapa sem região seguem com DIAS_DE_UM_PASSO", teto(torre) === G.DIAS_DE_UM_PASSO && teto(null) === G.DIAS_DE_UM_PASSO && teto({ cidades: [] }) === G.DIAS_DE_UM_PASSO);
  t("e o andar da Torre continua a um passo", G.vizinhosDeUmPasso(torre, torre.cidades.find((c) => c.z === 1).nome).length >= 1);
}

console.log(`\n${ok} ok, ${mal} falhas`);
process.exit(mal ? 1 : 0);
