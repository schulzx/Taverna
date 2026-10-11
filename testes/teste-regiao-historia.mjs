/* A HISTÓRIA AMARRADA À REGIÃO (MM17, etapa C1)

   A pessoa, a 06/10: *"cada lugar amarrado a um ato da espinha: o início na
   base, o meio em 2–3 lugares, o fim no lugar do clímax; os ganchos da
   história apontam para lá; o segredo e os atos moram dentro da região;
   nenhum lugar sem ficha; viagens em horas."*

   O que esta suíte prova, só em campanhas NOVAS (mapa com `mapa.regiao`):

     1. a espinha amarrada (`espinhaNaRegiao`, regiao.js): cada ato do meio e
        o do fim descem ao SEU lugar (o feitio "descer", saga.js, que se
        cumpre quando a masmorra publica o fim — `concluirLugar`,
        mundo-base.js, e a etapa `concluir_masmorra`, missoes.js); o
        confronto final mora no clímax; e nenhum ato fica sem peso;
     2. os ganchos: a abertura conta o primeiro lugar do meio, com as horas
        da ficha; o mural põe a presa num lugar com ficha; os boatos da base
        citam todos os lugares, com a ida e o perigo;
     3. a base conhece todos os lugares (`masmorrasConhecidas`, boca.js);
     4. a ida anda pelo chão (`IDA_NA_REGIAO`, boca.js), e a hora da ficha é
        a hora da viagem — base → lugar e lugar → lugar;
     5. e o CONTINENTE INTOCADO: os hashes de HEAD v9.356, gravados antes de
        qualquer linha desta etapa, sobre 200 sementes × 2 moldes, de tudo o
        que esta etapa tocou (a espinha, o que existe aqui, o mural, a
        abertura, a boca, as conhecidas, o rastro, a base, as missões).

   A LINHA DE BASE, medida a 06/10 em HEAD v9.356 (N=200, molde do beta):
   a espinha estendida na região deixa 54 de 950 atos sem marcos que os
   pesem (5,7%; no continente, 26/950); a abertura, o mural e os boatos não
   apontam para lugar nenhum com ficha (0%); e a ida a pé era a 4 km/h em
   qualquer chão — a mina da montanha "a 3 h" — e, direto entre lugares,
   chegava a três dias e meio.

   FALHA em HEAD (v9.356): espinhaNaRegiao, concluirLugar, lugarConcluido,
   IDA_NA_REGIAO, horasPeloChao e a etapa concluir_masmorra não existem; o
   import é por espaço de nomes, e a suíte cai asserção a asserção. */

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as R from "../src/regiao.js";
import * as BO from "../src/boca.js";
import * as MB from "../src/mundo-base.js";
import * as MI from "../src/missoes.js";
import * as SG from "../src/saga.js";
import * as G from "../src/geografia.js";
import * as OF from "../src/ofertas.js";
import * as AB from "../src/abertura.js";
import * as RA from "../src/rastro.js";
import { ESTRUTURAS } from "../src/historia.js";
import { MINUTOS_ESTRADA_POR_TURNO, HORAS_MARCHA_POR_DIA } from "../src/viagem.js";
import { sementeDe, generoDe, medirHistoria, resumoHistoria, piorCenaReal, maximo } from "./medir-regiao.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const fn = (M, k) => (typeof M[k] === "function" ? M[k] : () => null);
const J = (x) => JSON.stringify(x);
const espinhaNaRegiao = fn(R, "espinhaNaRegiao");
const concluirLugar = fn(MB, "concluirLugar");
const lugarConcluido = fn(MB, "lugarConcluido");
const horasPeloChao = fn(BO, "horasPeloChao");
const IDA = BO.IDA_NA_REGIAO || {};
const N = 200;

/* ============================================================ */
sec("1. as tabelas — a régua da ida e o feitio novo");
{
  t("IDA_NA_REGIAO: só a região v2 mede pelo chão", IDA.versaoMinima === 2);
  t("a ida cruza dois chãos, metade em cada", IDA.metadeNoChaoDeOrigem === 0.5);
  t("a pé enquanto cabe num turno de estrada (viagem.js)", IDA.horasAPeAte === MINUTOS_ESTRADA_POR_TURNO / 60);
  t("a região que nasce agora é a v2", tenta(() => R.gerarRegiao({ semente: "a", molde: "sobremundo" }).regiao.versao, 0) === IDA.versaoMinima);
  const d = (SG.FEITIOS || {}).descer;
  t("o feitio descer pesa como o que o mundo impõe, e cumpre-se por concluir_masmorra", !!d && d.peso === "missao_forcada" && tenta(() => d.condicao({ onde: "A Nave" }).tipo, "") === "concluir_masmorra");
  const e = (MI.ETAPAS || {}).concluir_masmorra;
  t("a etapa concluir_masmorra existe e é só da espinha", !!e && e.soDaEspinha === true && typeof e.ver === "function");
}

/* ============================================================ */
sec(`2. a medida — ${N} campanhas novas de região contra o continente`);
const M = await medirHistoria(R, N).catch(() => null);
{
  t("a medida corre (medirHistoria)", !!M && M.mundos === N);
  if (M) {
    console.log(resumoHistoria(M).split("\n").map((l) => "      " + l).join("\n"));
    const [dIn, dTot] = M.dentro, [sIn, sTot] = M.segredo, [aIn, aTot] = M.atosNoLugar;
    t(`(a) todo marco da espinha mora dentro da região (${dIn}/${dTot})`, dTot > 3000 && dIn === dTot);
    t(`(a) e todo segredo (${sIn}/${sTot})`, sTot > 500 && sIn === sTot);
    t(`(a) cada ato no seu sítio: o início na base, o meio e o fim num lugar com ficha (${aIn}/${aTot})`, aTot > 600 && aIn === aTot);
    t(`(a) o confronto final é no lugar do clímax (${M.fechoNoClimax}/${N})`, M.fechoNoClimax === N);
    /* a linha de base: 54/950, medida em HEAD v9.356 — e é ela que esta etapa leva a zero */
    t(`(b) a espinha estendida sozinha ainda deixa atos curtos (${M.curtos.antes[0]}/${M.curtos.antes[1]}, a linha de base)`, M.curtos.antes[0] === 54 && M.curtos.antes[1] === 950);
    t(`(b) amarrada à região, nenhum (${M.curtos.depois[0]}/${M.curtos.depois[1]})`, M.curtos.depois[1] === 950 && M.curtos.depois[0] === 0);
    t(`(c) a abertura conta um lugar com ficha (${M.abertura.regiao[0]}/${M.abertura.regiao[1]}; continente ${M.abertura.continente[0]})`, M.abertura.regiao[1] === N && M.abertura.regiao[0] === N && M.abertura.continente[0] === 0);
    t(`(c) o mural põe a presa num lugar com ficha (${M.mural.regiao[0]}/${M.mural.regiao[1]}; continente ${M.mural.continente[0]})`, M.mural.regiao[1] > 1000 && M.mural.regiao[0] === M.mural.regiao[1] && M.mural.continente[0] === 0);
    t(`(c) os boatos da base citam todo lugar, e com ficha (${M.boatos.regiao[0]}/${M.boatos.regiao[1]})`, M.boatos.regiao[1] > 1000 && M.boatos.regiao[0] === M.boatos.regiao[1]);
    t(`(d) nenhuma ida contradiz a ficha — base → lugar e lugar → vizinho (${M.contradiz}/${M.idas})`, M.idas > 3000 && M.contradiz === 0);
    t(`(d) a pior ida da base a um lugar é um dia (${maximo(M.idaBase)} h)`, maximo(M.idaBase) <= HORAS_MARCHA_POR_DIA);
    /* catraca medida a 06/10: lugar → lugar direto, no máximo 20 h (dois
       dias e meio — dois chãos lentos nas duas pontas); a régua antiga, nos
       mapas da etapa A, chegava a 28 h (três dias e meio) */
    t(`(d) lugar → lugar direto: no máximo 20 h (era 28) (${maximo(M.idaEntre)} h)`, maximo(M.idaEntre) <= 20);
  }
}

/* ============================================================ */
sec("3. a ida anda pelo chão — e só na região v2");
{
  const mina = { nome: "Mina de Sal", bioma: "montanha", x: 50.5, y: 50 };
  const daPlanicie = { x: 50, y: 50, bioma: "planicie" };
  const antiga = tenta(() => BO.rotaAteAMasmorra(mina, daPlanicie), null);
  const v2 = tenta(() => BO.rotaAteAMasmorra(mina, daPlanicie, { regiao: { versao: 2 } }), null);
  const v1 = tenta(() => BO.rotaAteAMasmorra(mina, daPlanicie, { regiao: { versao: 1 } }), null);
  t("a régua antiga: 12,5 km de montanha a pé em 3 h (o achado da etapa A)", !!antiga && antiga.modo === "a_pe" && antiga.minutos === 188);
  t("na região v2, a mesma ida passa de um turno de marcha: é estrada", !!v2 && v2.modo === "estrada" && v2.dias === 0.5);
  t("a região v1 (nascida antes desta régua) mede como antes, letra a letra", J(v1) === J(antiga));
  t("sem região, nada muda (null, lixo)", J(tenta(() => BO.rotaAteAMasmorra(mina, daPlanicie, null))) === J(antiga) && J(tenta(() => BO.rotaAteAMasmorra(mina, daPlanicie, { regiao: "x" }))) === J(antiga));
  t("horasPeloChao: num chão só, km ÷ (marcha do dia ÷ horas do dia)", Math.abs(horasPeloChao(30, "planicie", "planicie") - 8) < 1e-9 && Math.abs(horasPeloChao(12, "montanha", "montanha") - 8) < 1e-9);
  t("e entre dois chãos, metade em cada", Math.abs(horasPeloChao(12, "planicie", "montanha") - (6 / 3.75 + 6 / 1.5)) < 1e-9);
  t("chão sem marcha (portal, lixo) anda como campo aberto", Math.abs(horasPeloChao(30, "portal", null) - 8) < 1e-9 && horasPeloChao(null, null, null) === 0);
}

/* ============================================================ */
sec("4. a base conhece todos os lugares (na região)");
{
  let daBase = 0, deTodos = 0, partida = 0, antes = 0;
  for (let i = 0; i < N; i++) {
    const semente = sementeDe(i), genero = generoDe(i);
    const mapa = R.gerarRegiao({ semente, molde: "sobremundo", genero, estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id });
    const mms = MB.masmorrasDoMundo(semente, mapa);
    const base = mapa.cidades[0];
    if (BO.masmorrasConhecidas(mms, base, { regiao: mapa.regiao }).length === mms.length) daBase++;
    if (mapa.cidades.every((c) => BO.masmorrasConhecidas(mms, c, { regiao: mapa.regiao }).length === mms.length)) deTodos++;
    if (BO.masmorrasConhecidas(mms, base).length < mms.length) antes++;
    /* e o herói vai: da base, ao lugar mais longe dela, pelo nome */
    const longe = [...mapa.regiao.lugares].sort((a, b) => b.ficha.horas - a.ficha.horas)[0];
    const ida = tenta(() => RA.idaAMasmorra(`Vou à ${longe.nome}.`, { cidadeAtual: base.nome, mapa, masmorras: mms }), null);
    if (ida && ida.acao === "partir" && ida.nome === longe.nome && ((ida.rota.modo === "a_pe" ? ida.rota.minutos / 60 : ida.rota.dias * HORAS_MARCHA_POR_DIA) === longe.ficha.horas)) partida++;
  }
  t(`a régua antiga deixava a base sem conhecer algum lugar em ${antes}/${N} mundos`, antes > 0);
  t(`com a região, a base conhece todos (${daBase}/${N})`, daBase === N);
  t(`e todo povoado também — a região é de um dia (${deTodos}/${N})`, deTodos === N);
  t(`"vou ao lugar mais longe" parte da base, e com a hora da ficha (${partida}/${N})`, partida === N);
  t("sem região, a régua de sempre", J(BO.masmorrasConhecidas([{ nome: "X", cidadeProxima: "B", regiao: "Z" }], { nome: "A", regiao: "Y" })) === "[]");
}

/* ============================================================ */
sec("5. a masmorra publica o fim, e o descer cai por isso");
{
  const b = concluirLugar(null, "A Nave de Ferro");
  t("concluirLugar grava o nome sem artigo nem acento, num campo novo", J(b && b.concluidas) === J(["nave de ferro"]));
  t("lugarConcluido casa sem o artigo", lugarConcluido(b, "Nave de Ferro") === true && lugarConcluido(b, "A Nave de Sal") === false && lugarConcluido(null, "x") === false && lugarConcluido(b, "") === false);
  t("é idempotente e não muta", !!b && J(tenta(() => concluirLugar(b, "nave de ferro").concluidas)) === J(["nave de ferro"]) && J(b.concluidas) === J(["nave de ferro"]));
  t("a base sem o campo sai do garantirBase com as chaves de sempre", J(Object.keys(MB.garantirBase(null))) === J(["revelados", "situacoes", "propositos", "mortos", "saqueados", "versao"]));
  t("e com ele, guarda-o (o save de região relê a lista)", J(MB.garantirBase(J(b) && JSON.parse(J(b))).concluidas) === J(["nave de ferro"]));
  t("tipoDaEtapa nunca dá concluir_masmorra a uma missão (nem estrita)", MI.tipoDaEtapa({ tipo: "concluir_masmorra" }) === "ir_a" && MI.tipoDaEtapa({ tipo: "concluir_masmorra" }, { estrito: true }) === "");
  /* a espinha de verdade: desce-se ao lugar do primeiro ato do meio */
  const semente = sementeDe(3), genero = generoDe(3), estrutura = ESTRUTURAS[3 % ESTRUTURAS.length].id;
  const mapa = R.gerarRegiao({ semente, molde: "sobremundo", genero, estrutura });
  const esp = espinhaNaRegiao(mapa, SG.estenderEspinha({ semente, mapa, genero, estrutura, cidadeInicial: mapa.cidades[0].nome }), { semente, genero });
  const descer = tenta(() => esp.atos.flatMap((a) => a.marcos).find((m) => m.feitio === "descer"), null);
  const ver = (cond, m) => MI.etapaDef(cond.tipo).ver(cond, m);
  const antes = tenta(() => SG.conferirEspinha(esp, { base: MB.garantirBase(null) }, ver).cumpridos.length, -1);
  const depois = tenta(() => SG.conferirEspinha(esp, { base: concluirLugar(null, descer.onde) }, ver).cumpridos, []);
  t("antes de a masmorra cair, o descer está de pé", !!descer && antes === 0);
  t("quando ela publica o fim, o descer (e só ele) cai", depois.length >= 1 && depois.every((m) => m.feitio === "descer") && depois.some((m) => m.id === descer.id));
  t("a linha do marco diz o lugar", !!descer && SG.linhaDoMarco(descer).includes(descer.onde));
}

/* ============================================================ */
sec("6. o continente, byte a byte (hashes de HEAD v9.356, 200 sementes × 2 moldes)");
{
  /* Gravados ANTES de qualquer linha desta etapa (06/10), com este laço,
     sobre a árvore de HEAD v9.356 (git archive). */
  const HEAD = { espinha: "5223fea98f7cc861", daqui: "95cd7e6d96a3b3c4", existe: "3c382cb16bc77d3c", ofertas: "fa1541a849421fc2", abertura: "cdff91d82c5067eb", boca: "f9cd01020edb19ad", conhecidas: "5278cf26ad84c12a", rastro: "95ddfc5dc021f856", base: "d26a01a13464393a", missoes: "c77d99845557f879" };
  /* 11/10 (MM18 · a lei da porta): `abertura` mudou de fff026b80b9be705
     para cdff91d82c5067eb porque a abertura passa a guardar `porta` (a regra
     da porta da cidade, da ficha). Medido com o mesmo laço: SEM o campo
     `porta` o hash é fff026b80b9be705, o de antes, byte a byte — nada mais
     da abertura do continente mudou. */
  const hs = {};
  const h = (k, v) => { (hs[k] ||= createHash("sha256")).update(J(v) ?? "u"); };
  for (const molde of ["sobremundo", "torre"]) for (let i = 0; i < 200; i++) {
    const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id;
    const mapa = G.gerarGeografia(semente, molde);
    const base = mapa.cidades[0];
    const esp = SG.estenderEspinha({ semente, mapa, genero, estrutura, cidadeInicial: base.nome });
    h("espinha", esp);
    for (const c of mapa.cidades.slice(0, 3)) { h("daqui", MB.resumoDaqui(semente, mapa, c.nome, null, genero)); h("existe", (MB.oQueExisteAqui(semente, mapa, c.nome, null, genero) || {}).masmorras); }
    for (const c of mapa.cidades.slice(0, 2)) h("ofertas", OF.ofertasDaqui({ semente, mapa, cidade: c.nome, base: null, genero, nivel: 1 + (i % 6), quantas: 8 }));
    h("abertura", AB.abrirAbertura({ semente, mapa, cidade: base.nome, espinha: esp, estrutura, genero, molde, nivel: 1, dia: 1 }));
    const mms = MB.masmorrasDoMundo(semente, mapa);
    for (const m of mms) { h("boca", BO.rotaAteAMasmorra(m, base, { de: base.nome })); h("boca", BO.rotaAteAMasmorra(m, mapa.cidades[1] || base)); }
    for (const c of mapa.cidades) h("conhecidas", BO.masmorrasConhecidas(mms, c).map((m) => m.id));
    for (const m of mms.slice(0, 3)) h("rastro", RA.idaAMasmorra(`Vou à ${m.nome}.`, { cidadeAtual: base.nome, mapa, masmorras: mms, lugar: null, jornada: null }));
  }
  h("base", [MB.garantirBase(null), MB.garantirBase({ revelados: ["a"], mortos: ["b"] })]);
  h("missoes", MI.garantirMissoes([{ titulo: "x", etapas: [{ tipo: "concluir_masmorra", alvo: "Nave" }, { tipo: "descer", alvo: "Nave" }, { tipo: "derrotar", alvo: "Lobo" }] }]).map((m) => m.etapas));
  h("missoes", ["concluir_masmorra", "descer", "ir_a"].map((tipo) => [MI.tipoDaEtapa({ tipo }), MI.tipoDaEtapa({ tipo }, { estrito: true })]));
  for (const k of Object.keys(HEAD)) {
    const agora = hs[k] ? hs[k].digest("hex").slice(0, 16) : "";
    t(`${k}: o de sempre (${agora})`, agora === HEAD[k]);
  }
  /* e a amarração não toca num mapa sem região */
  const semente = sementeDe(7), genero = generoDe(7);
  const cont = G.gerarGeografia(semente, "sobremundo");
  const esp = SG.estenderEspinha({ semente, mapa: cont, genero, cidadeInicial: cont.cidades[0].nome });
  t("espinhaNaRegiao num continente devolve a espinha como veio", J(espinhaNaRegiao(cont, esp, { semente, genero })) === J(esp));
}

/* ============================================================ */
sec("7. determinismo, lixo e o Math.random");
{
  const semente = sementeDe(11), genero = generoDe(11), estrutura = ESTRUTURAS[11 % ESTRUTURAS.length].id;
  const mapa = R.gerarRegiao({ semente, molde: "sobremundo", genero, estrutura });
  const crua = SG.estenderEspinha({ semente, mapa, genero, estrutura, cidadeInicial: mapa.cidades[0].nome });
  const [cm, ce] = [J(mapa), J(crua)];
  const acaso = Math.random;
  let estourou = false;
  Math.random = () => { estourou = true; return 0.5; };
  let a = null, b = null;
  try { a = espinhaNaRegiao(mapa, crua, { semente, genero }); b = espinhaNaRegiao(mapa, crua, { semente, genero }); } finally { Math.random = acaso; }
  t("mesma semente, mesma espinha amarrada", !!a && J(a) === J(b));
  t("a amarração não toca no Math.random", !estourou && !!R.espinhaNaRegiao);
  t("e não muta o mapa nem a espinha que recebe", J(mapa) === cm && J(crua) === ce);
  const lixo = [[null, null], [{}, {}], [mapa, null], [null, crua], [mapa, { atos: "x" }]].map(([m, e]) => tenta(() => espinhaNaRegiao(m, e, null), "estourou"));
  t("lixo não estoura e devolve uma espinha", lixo.every((x) => x && x !== "estourou" && Array.isArray(x.atos)));
  const fontes = ["regiao.js", "boca.js", "saga.js", "ofertas.js", "abertura.js"].map((f) => tenta(() => readFileSync(join(AQUI, "..", "src", f), "utf8"), ""));
  t("nenhum dos módulos tocados escreve Math.random", fontes.every((s) => s.length > 0 && !/Math\.random/.test(s)));
}

/* ============================================================ */
sec("8. a fiação no App — duas portas, as duas atrás do mapa.regiao e com rede");
{
  const APP = tenta(() => readFileSync(join(AQUI, "..", "src", "App.jsx"), "utf8"), "");
  t("o App importa espinhaNaRegiao de regiao.js", /import \{[^}]*\bespinhaNaRegiao\b[^}]*\} from "\.\/regiao\.js";/.test(APP));
  t("e concluirLugar de mundo-base.js", /import \{[^}]*\bconcluirLugar\b[^}]*\} from "\.\/mundo-base\.js";/.test(APP));
  t("a espinha amarra-se só com mapa.regiao, e com calou", /if \(mapaRef\.current && mapaRef\.current\.regiao\) \{\s*try \{\s*espinhaRef\.current = espinhaNaRegiao\(mapaRef\.current, espinhaRef\.current, \{ semente: sementeMundo\(\)[^\n]*\);\s*\} catch \(e\) \{ calou\(/.test(APP));
  t("depois de estendida (a mesma criação, um ponto só)", APP.indexOf("espinhaRef.current = estenderEspinha(") > 0 && APP.indexOf("espinhaNaRegiao(mapaRef.current") > APP.indexOf("espinhaRef.current = estenderEspinha(") && APP.split("espinhaNaRegiao(").length - 1 === 1);
  t("a masmorra publica o fim só com mapa.regiao, e com calou", /bumpCont\("masmorrasConcluidas"\);[\s\S]{0,400}if \(mapaRef\.current && mapaRef\.current\.regiao\) \{\s*try \{ baseMundoRef\.current = concluirLugar\(baseMundoRef\.current, mm\.nome\);[^\n]*calou\(/.test(APP));
}

/* ============================================================ */
sec("9. (e) o teto do prompt");
{
  /* A etapa não soma bloco estático: os boatos com ficha vão no "o que
     existe aqui" (resumoDaqui), que é da pauta do turno. */
  const pior = piorCenaReal();
  console.log(`      PIOR CENA REAL: ${pior} (o teto é 82.000)`);
  t(`a pior cena real do prompt fica abaixo do teto (${pior} < 82000)`, Number.isFinite(pior) && pior < 82000);
}

console.log(`\n${ok} ok, ${mal} falhas`);
if (mal) process.exit(1);
