/* A FICHA É A PLANTA (MM17, pendência nº 1 · v9.363) — a prova

   A pessoa, a 10/10: "a planta de um lugar da região e a ficha dizem bichos
   diferentes". A ficha de cada lugar (`mapa.regiao.lugares[].ficha.quem`,
   regiao.js) anuncia quem anda por lá — é o que o povo comenta, o que o
   mapa vivo mostra e o que a pauta lá dentro diz ao Narrador ("de fora,
   sabe-se que por lá andam…", masmorra-sem-cidade.js) — e a planta, ao
   entrar, sorteava os seus do bestiário do género (`rolarGrupo`,
   masmorras.js). Medido em 200 mundos (`medir-regiao.mjs`, secção i): 0
   dos 1.285 lugares com a planta toda dentro da ficha; 15% dos inimigos
   eram bichos que a ficha nomeia; num mundo com léxico, 0%.

   A verdade passa a ser uma só: a ficha manda. `quemDoLugar` (regiao.js)
   lê a lista da ficha, o App passa-a à porta (`entrarMasmorra`) e
   `gerarMasmorra(…, { salas, quem })` tira dela os inimigos de toda sala de
   luta (`plantaDaFicha`), sem sorte nenhuma e sem mexer em mais nada da
   planta.

   FALHA ANTES, PASSA DEPOIS: na árvore de HEAD v9.362 esta suíte nem
   importa (`quemDoLugar` e `plantaDaFicha` não existem); e a mesma medida
   com `comFicha: false` — que é a planta de HEAD, provada byte a byte na
   secção 2 — é guardada aqui como o "antes" (0% de lugares), para que a
   catraca saiba de onde se veio.

   O que esta suíte guarda:
     1. as tabelas (`FICHA_NA_PLANTA`, e a ficha que agora leva a ameaça);
     2. SEM a opção, a planta de antes: hashes de HEAD v9.362 em 200
        sementes × 2 géneros × 4 níveis, com e sem `salas`; `quem` nulo,
        vazio ou lixo é a mesma coisa; e o continente nunca chega a ter
        `quem` (60 mundos, todas as masmorras);
     3. a concordância, 200 mundos × todos os lugares com planta: antes →
        depois, por nome e por família, a ficha toda em cena, o chefe, a
        ameaça, a mesma forma de planta, o caminho do App;
     4. o mesmo num mundo com léxico (onde o nome não é o do bestiário);
     5. a ficha de antes desta versão (sem `ameaca`): os nomes a 100%, a
        ameaça pelo bestiário ou pela tabela do nível;
     6. o determinismo: a mesma semente dá a mesma planta; `plantaDaFicha`
        não toca em `Math.random`, e a planta com a ficha gasta os MESMOS
        sorteios que a de sempre;
     7. o lixo (null, {}, listas podres) e a imutabilidade;
     8. as unidades da regra: o chefe, o piso, a roda, os repetidos, o teto;
     9. a pauta: a linha "de pé aqui" de cada sala só diz o que a linha da
        ficha diz, a linha da ficha não ganhou um byte, nenhuma linha nova;
    10. a fiação no App, por texto (CRLF normalizado, janela por âncora).

   Determinismo: toda sorte é semeada (`rng(hashSemente(...))`); a planta
   corre com `Math.random` trocado por um gerador semeado e restaurado. */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import * as MM from "../src/masmorras.js";
import { quemDoLugar, mapaDaCriacao, mapaDaCampanhaNova, FICHA_DO_LUGAR } from "../src/regiao.js";
import * as R from "../src/regiao.js";
import { masmorrasDoMundo, criaturasDaRegiao } from "../src/mundo-base.js";
import { gerarGeografia } from "../src/geografia.js";
import { moldePorId } from "../src/moldes.js";
import { ESTRUTURAS } from "../src/historia.js";
import { CRIATURAS_FANTASIA, ARQUETIPOS } from "../src/bestiario.js";
import { linhaDaFicha } from "../src/masmorra-sem-cidade.js";
import { hashSemente, rng } from "../src/semente.js";
import { sementeDe, generoDe, medirFichaEPlanta, resumoFichaEPlanta, LEXICO_DA_MEDIDA } from "./medir-regiao.mjs";

const { gerarMasmorra, plantaDaFicha, bichosDaFicha, FICHA_NA_PLANTA, masmorraParaPauta } = MM;
const AQUI = dirname(fileURLToPath(import.meta.url));
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const congelar = (o) => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) congelar(v); } return o; };
const ACASO = Math.random;
const semeado = (s, f) => { Math.random = rng(hashSemente(s)); try { return f(); } finally { Math.random = ACASO; } };
const DEGRAUS = FICHA_NA_PLANTA.ameacas;
const SOBRE = moldePorId("sobremundo");
const N = 200;

/* ============================================================ */
sec("1. as tabelas");
{
  const T = FICHA_NA_PLANTA;
  t("FICHA_NA_PLANTA: a escada das ameaças é a do bestiário, da mais fraca à mais forte",
    JSON.stringify(T.ameacas) === JSON.stringify(["fraco", "comum", "competente", "elite", "lendario"])
    && [...CRIATURAS_FANTASIA, ...ARQUETIPOS].every((c) => T.ameacas.includes(c.ameaca)));
  t("o piso do chefe é um degrau da escada (o de sempre: elite)", T.ameacas.includes(T.pisoDoChefe) && T.pisoDoChefe === "elite");
  t("a tabela do nível sobe, cobre tudo e só diz degraus da escada",
    T.ameacaPeloNivel.every((x, i, a) => T.ameacas.includes(x.ameaca) && (i === 0 || x.ate > a[i - 1].ate)) && T.ameacaPeloNivel[T.ameacaPeloNivel.length - 1].ate === Infinity);
  /* a tabela do nível é o degrau do bestiário: só o Batedor (fraco, 2) e o
     Bandido/Esqueleto/Zumbi (comum, 2) dividem um nível — e o 2 cai em comum */
  const bate = [...CRIATURAS_FANTASIA, ...ARQUETIPOS].filter((c) => T.ameacaPeloNivel.find((x) => c.nivelRef <= x.ate).ameaca === c.ameaca).length;
  t(`a tabela do nível acerta o degrau do bestiário em ${bate}/${CRIATURAS_FANTASIA.length + ARQUETIPOS.length} criaturas (só o Batedor, fraco de nível 2, fica fora)`, bate === CRIATURAS_FANTASIA.length + ARQUETIPOS.length - 1);
  t("sem nível, o meio da escada", T.ameacas.includes(T.ameacaSemNivel));
  t("o teto da ficha cabe a ficha que a região escreve", T.maximo >= FICHA_DO_LUGAR.quem && T.nomeMaximo >= 20);
}

/* ============================================================ */
sec("2. sem a opção, a planta de antes (hashes de HEAD v9.362)");
{
  /* gravados com src/masmorras.js de HEAD v9.362 (git archive), antes de
     esta versão existir: 200 sementes × 2 géneros × níveis 1/4/8/12 */
  const HEAD = { sem: "28f3d1b3d30bd1e5", salas: "20ce6132c01370f6" };
  const GEN = ["Fantasia medieval", "Ficção científica"];
  const LIXOS = [null, undefined, [], {}, "Goblin", 7, [null, {}, { nome: "" }, { nome: 5 }, "Lobo"]];
  const hs = {};
  const h = (k, v) => (hs[k] ||= createHash("sha256")).update(JSON.stringify(v));
  let lixoIgual = 0, lixoTotal = 0;
  for (let i = 0; i < 200; i++) for (const g of GEN) for (const nv of [1, 4, 8, 12]) {
    const s = `ficha-e-planta|${i}|${g}|${nv}`;
    h("sem", semeado(s, () => gerarMasmorra(g, nv, i % 3 ? "Cripta" : "")));
    const comSalas = semeado(s, () => gerarMasmorra(g, nv, "Cripta", { salas: 5 + (i % 8) }));
    h("salas", comSalas);
    if (i < 25) for (const q of LIXOS) {
      lixoTotal++;
      if (JSON.stringify(semeado(s, () => gerarMasmorra(g, nv, "Cripta", { salas: 5 + (i % 8), quem: q }))) === JSON.stringify(comSalas)) lixoIgual++;
    }
  }
  const agora = Object.fromEntries(Object.entries(hs).map(([k, x]) => [k, x.digest("hex").slice(0, 16)]));
  t(`sem opções: o hash é o de HEAD (${agora.sem})`, agora.sem === HEAD.sem);
  t(`com { salas }: o hash é o de HEAD (${agora.salas})`, agora.salas === HEAD.salas);
  t(`quem nulo, vazio ou lixo é a planta de sempre (${lixoIgual}/${lixoTotal})`, lixoIgual === lixoTotal);
  /* o continente: nenhum save de antes da MM17 tem região, e a porta não
     acha ficha nenhuma — a planta é a de sempre */
  let mms = 0, semQuem = 0;
  for (let i = 0; i < 60; i++) {
    const mapa = mapaDaCampanhaNova(gerarGeografia(sementeDe(i), SOBRE));
    for (const m of masmorrasDoMundo(sementeDe(i), mapa)) { mms++; if (quemDoLugar(mapa, m.id) === null && quemDoLugar(mapa, m.nome) === null) semQuem++; }
  }
  t(`o continente nunca tem quem (${semQuem}/${mms} masmorras de 60 mundos)`, semQuem === mms && mms > 60);
}

/* ============================================================ */
sec(`3. a concordância, ${N} mundos × todos os lugares com planta (antes → depois)`);
const ANTES = medirFichaEPlanta(R, N, { comFicha: false });
const DEPOIS = medirFichaEPlanta(R, N);
{
  console.log(resumoFichaEPlanta("antes", ANTES));
  console.log(resumoFichaEPlanta("depois", DEPOIS));
  const L = DEPOIS.lugares;
  t(`os mesmos lugares nas duas medidas (${L}, 8 tipos)`, L === ANTES.lugares && L > 1200 && Object.keys(DEPOIS.tipos).length === 8);
  /* o antes é o defeito: guardado para a catraca saber de onde se veio */
  t(`antes: a planta toda dentro da ficha em ${ANTES.lugaresNome}/${L} lugares (o defeito)`, ANTES.lugaresNome <= L * 0.01);
  t(`antes: só ${ANTES.nomeNaFicha}/${ANTES.inimigos} inimigos eram da ficha`, ANTES.nomeNaFicha < ANTES.inimigos * 0.25);
  t(`depois: todo inimigo é da ficha, por NOME (${DEPOIS.nomeNaFicha}/${DEPOIS.inimigos})`, DEPOIS.nomeNaFicha === DEPOIS.inimigos && DEPOIS.inimigos > 7000);
  t(`depois: e por FAMÍLIA (${DEPOIS.familiaNaFicha}/${DEPOIS.inimigos})`, DEPOIS.familiaNaFicha === DEPOIS.inimigos);
  t(`depois: todo lugar concorda, por nome e por família (${DEPOIS.lugaresNome}/${L}, ${DEPOIS.lugaresFamilia}/${L})`, DEPOIS.lugaresNome === L && DEPOIS.lugaresFamilia === L);
  t(`depois: todo bicho que a ficha nomeia aparece em alguma sala (${DEPOIS.fichaToda}/${L}; antes ${ANTES.fichaToda})`, DEPOIS.fichaToda === L);
  t(`o chefe é o da ficha, com ameaça de chefe (${DEPOIS.chefeDaFicha}/${L}; antes ${ANTES.chefeDaFicha})`, DEPOIS.chefeDaFicha === L);
  t(`os outros entram com a ameaça que têm na região (${DEPOIS.ameacaCerta}/${DEPOIS.capangas})`, DEPOIS.ameacaCerta === DEPOIS.capangas);
  t(`a planta é a mesma — salas, ligações, tesouros, tamanho de cada grupo —, só QUEM muda (${DEPOIS.mesmaForma}/${L})`, DEPOIS.mesmaForma === L);
  t(`o caminho do App (masmorrasDoMundo → quemDoLugar) acha a ficha de todo lugar (${DEPOIS.caminhoDoApp}/${L})`, DEPOIS.caminhoDoApp === L);
}

/* ============================================================ */
sec("4. num mundo com léxico (o nome não é o do bestiário)");
{
  const A = medirFichaEPlanta(R, N, { comFicha: false, lex: LEXICO_DA_MEDIDA });
  const D = medirFichaEPlanta(R, N, { lex: LEXICO_DA_MEDIDA });
  console.log(resumoFichaEPlanta("antes, com léxico", A));
  console.log(resumoFichaEPlanta("depois, com léxico", D));
  t(`antes: nenhum inimigo com o nome da ficha (${A.nomeNaFicha}/${A.inimigos}) — o Narrador ouvia um nome e encontrava outro`, A.nomeNaFicha === 0);
  t(`depois: por nome ${D.nomeNaFicha}/${D.inimigos}, por família ${D.familiaNaFicha}/${D.inimigos}`, D.nomeNaFicha === D.inimigos && D.familiaNaFicha === D.inimigos && D.inimigos > 7000);
  t(`depois: todo lugar concorda e tem a ficha toda em cena (${D.lugaresNome}/${D.lugares}, ${D.fichaToda}/${D.lugares})`, D.lugaresNome === D.lugares && D.fichaToda === D.lugares);
  t(`e a ameaça é a do bicho da região, que o nome do léxico não diz (${D.ameacaCerta}/${D.capangas}; chefes ${D.chefeDaFicha}/${D.lugares})`, D.ameacaCerta === D.capangas && D.chefeDaFicha === D.lugares);
}

/* ============================================================ */
sec("5. a ficha de antes desta versão (sem ameaça: regiões criadas entre a v9.356 e a v9.362)");
{
  const S = medirFichaEPlanta(R, N, { semAmeaca: true });
  const SL = medirFichaEPlanta(R, 60, { semAmeaca: true, lex: LEXICO_DA_MEDIDA });
  t(`os nomes a 100% (${S.nomeNaFicha}/${S.inimigos}; com léxico ${SL.nomeNaFicha}/${SL.inimigos})`, S.nomeNaFicha === S.inimigos && SL.nomeNaFicha === SL.inimigos && S.fichaToda === S.lugares && SL.fichaToda === SL.lugares);
  t(`sem léxico, a ameaça sai do bestiário pelo nome — toda certa (${S.ameacaCerta}/${S.capangas})`, S.ameacaCerta === S.capangas);
  /* com léxico e sem a ameaça gravada, o nome não diz nada e o nível é o
     palpite: a tabela erra só onde o bestiário tem dois degraus no mesmo
     nível. Catraca, não meta — a ficha nova grava a ameaça. */
  t(`com léxico, pela tabela do nível: ${SL.ameacaCerta}/${SL.capangas} certas (≥ 85%), o chefe sempre de chefe (${SL.chefeDaFicha}/${SL.lugares})`, SL.ameacaCerta >= SL.capangas * 0.85 && SL.chefeDaFicha === SL.lugares);
}

/* ============================================================ */
sec("6. o determinismo");
{
  const mapa = mapaDaCampanhaNova(mapaDaCriacao({ semente: sementeDe(3), molde: SOBRE, genero: generoDe(3), estrutura: ESTRUTURAS[0].id, modo: "historia" }));
  const l = mapa.regiao.lugares[0];
  const quem = quemDoLugar(mapa, l.id);
  const a = semeado("det", () => gerarMasmorra(generoDe(3), l.nivel, "", { salas: l.salas, quem }));
  const b = semeado("det", () => gerarMasmorra(generoDe(3), l.nivel, "", { salas: l.salas, quem }));
  t("a mesma semente dá a mesma planta, bicho a bicho", JSON.stringify(a) === JSON.stringify(b));
  /* a mesma região, gerada duas vezes, dá a mesma ficha */
  const mapa2 = mapaDaCampanhaNova(mapaDaCriacao({ semente: sementeDe(3), molde: SOBRE, genero: generoDe(3), estrutura: ESTRUTURAS[0].id, modo: "historia" }));
  t("a ficha nasce igual na mesma semente (com a ameaça)", JSON.stringify(mapa.regiao.lugares.map((x) => x.ficha.quem)) === JSON.stringify(mapa2.regiao.lugares.map((x) => x.ficha.quem)));
  /* plantaDaFicha não sorteia: com Math.random a explodir, ela corre */
  const crua = semeado("det", () => gerarMasmorra(generoDe(3), l.nivel, "", { salas: l.salas }));
  Math.random = () => { throw new Error("sorte dentro de plantaDaFicha"); };
  let semSorte = false, igual = false;
  try { const p = plantaDaFicha(crua, quem); semSorte = true; igual = JSON.stringify(p) === JSON.stringify(a); } catch { semSorte = false; } finally { Math.random = ACASO; }
  t("plantaDaFicha não toca em Math.random", semSorte);
  t("e aplicada à planta crua dá a planta da porta (gerar com quem = gerar e depois a ficha)", igual);
  /* a planta com a ficha gasta os MESMOS sorteios que a de sempre */
  let iguais = 0, total = 0;
  for (let i = 0; i < 100; i++) {
    const r1 = rng(hashSemente(`conta|${i}`)), r2 = rng(hashSemente(`conta|${i}`));
    let c1 = 0, c2 = 0;
    Math.random = () => { c1++; return r1(); };
    try { gerarMasmorra("Fantasia medieval", 1 + (i % 12), "", { salas: 5 + (i % 8) }); } finally { Math.random = ACASO; }
    Math.random = () => { c2++; return r2(); };
    try { gerarMasmorra("Fantasia medieval", 1 + (i % 12), "", { salas: 5 + (i % 8), quem: [{ nome: "Lobo", nivel: 1 }, { nome: "Ogro", nivel: 4 }] }); } finally { Math.random = ACASO; }
    total++; if (c1 === c2 && c1 > 0) iguais++;
  }
  t(`a planta com a ficha gasta os mesmos sorteios que a de sempre (${iguais}/${total})`, iguais === total);
}

/* ============================================================ */
sec("7. o lixo e a imutabilidade");
{
  t("bichosDaFicha: lixo é []", [null, undefined, {}, "Lobo", 3, [], [null, 7, "x", {}, { nome: "" }, { nome: "   " }, { nome: 9 }]].every((q) => JSON.stringify(bichosDaFicha(q)) === "[]"));
  const crua = semeado("lixo", () => gerarMasmorra("Fantasia medieval", 6, "", { salas: 8 }));
  t("plantaDaFicha: sem ficha válida devolve A MESMA planta", [null, undefined, [], {}, [{}], "Lobo"].every((q) => plantaDaFicha(crua, q) === crua));
  t("plantaDaFicha: planta lixo volta como veio", plantaDaFicha(null, [{ nome: "Lobo" }]) === null && tenta(() => plantaDaFicha({}, [{ nome: "Lobo" }]), "x") !== "x" && JSON.stringify(plantaDaFicha({ salas: "x" }, [{ nome: "Lobo" }])) === JSON.stringify({ salas: "x" }));
  t("plantaDaFicha: sala lixo dentro da planta passa sem estourar",
    JSON.stringify(plantaDaFicha({ salas: [null, 7, { tipo: "combate" }, { tipo: "combate", inimigos: [{ nome: "X" }] }] }, [{ nome: "Lobo" }]).salas) === JSON.stringify([null, 7, { tipo: "combate" }, { tipo: "combate", inimigos: [{ nome: "Lobo", ameaca: "fraco" }] }]));
  t("quemDoLugar: lixo é null", [[null, "x"], [{}, "x"], [{ regiao: null }, "x"], [{ regiao: { lugares: "x" } }, "x"], [{ regiao: { lugares: [null, 3] } }, "x"], [{ regiao: { lugares: [{ id: "a", nome: "A" }] } }, "a"], [{ regiao: { lugares: [{ id: "a", ficha: { quem: [] } }] } }, "a"], [{ regiao: { lugares: [{ id: "a", ficha: { quem: [{ nome: "Lobo" }] } }] } }, null], [{ regiao: { lugares: [{ id: "a", ficha: { quem: [{ nome: "Lobo" }] } }] } }, "  "]]
    .every(([m, k]) => quemDoLugar(m, k) === null));
  /* imutável: congelado, e nada muda */
  const mapa = congelar(mapaDaCampanhaNova(mapaDaCriacao({ semente: sementeDe(7), molde: SOBRE, genero: generoDe(7), estrutura: ESTRUTURAS[1].id, modo: "historia" })));
  const antesDoMapa = JSON.stringify(mapa);
  const l = mapa.regiao.lugares[1];
  const q = quemDoLugar(mapa, l.id);
  t("quemDoLugar acha pelo id e pelo nome (sem artigo, caixa nem acento)", JSON.stringify(q) === JSON.stringify(l.ficha.quem) && JSON.stringify(quemDoLugar(mapa, l.nome.toUpperCase())) === JSON.stringify(q));
  q[0].nome = "MUDADO"; q.push({ nome: "INTRUSO" });
  t("quemDoLugar devolve cópias: mexer nelas não mexe no mapa", JSON.stringify(mapa) === antesDoMapa);
  const cruaC = congelar(semeado("imut", () => gerarMasmorra("Fantasia medieval", 9, "", { salas: 10 })));
  const fichaC = congelar([{ nome: "Lobo", nivel: 1, ameaca: "fraco" }, { nome: "Ogro", nivel: 4 }]);
  const antesC = JSON.stringify(cruaC);
  let p = null;
  t("plantaDaFicha corre sobre planta e ficha congeladas", tenta(() => { p = plantaDaFicha(cruaC, fichaC); return true; }, false));
  t("e não as muda", JSON.stringify(cruaC) === antesC && JSON.stringify(fichaC) === JSON.stringify([{ nome: "Lobo", nivel: 1, ameaca: "fraco" }, { nome: "Ogro", nivel: 4 }]));
  t("a planta nova não divide salas de luta com a velha", p && p !== cruaC && p.salas.every((s, i) => (s.inimigos ? s !== cruaC.salas[i] : s === cruaC.salas[i])));
}

/* ============================================================ */
sec("8. as unidades da regra");
{
  const crua = semeado("unid", () => gerarMasmorra("Fantasia medieval", 10, "", { salas: 12 }));
  const luta = (p) => p.salas.filter((s) => s.tipo === "combate" || s.tipo === "chave" || s.tipo === "chefe");
  const chefeDe = (p) => p.salas.find((s) => s.tipo === "chefe").inimigos;
  /* o chefe: o mais forte (ameaça, depois nível), erguido a elite */
  const p1 = plantaDaFicha(crua, [{ nome: "Lobo", nivel: 1, ameaca: "fraco" }, { nome: "Ogro", nivel: 4, ameaca: "competente" }]);
  t("o chefe é o mais forte da ficha, com a ameaça erguida ao piso (Ogro competente → elite)", chefeDe(p1)[0].nome === "Ogro" && chefeDe(p1)[0].ameaca === "elite");
  const capangas = [...luta(p1).filter((s) => s.tipo !== "chefe").flatMap((s) => s.inimigos), ...chefeDe(p1).slice(1)];
  t("os outros mantêm a ameaça (o Ogro fora do trono continua competente, o Lobo fraco)",
    capangas.some((e) => e.nome === "Ogro") && capangas.every((e) => (e.nome === "Ogro" ? e.ameaca === "competente" : e.nome === "Lobo" && e.ameaca === "fraco")));
  const p2 = plantaDaFicha(crua, [{ nome: "Dragão Jovem", nivel: 10, ameaca: "lendario" }, { nome: "Golem de Pedra", nivel: 7, ameaca: "elite" }]);
  t("um lendário não desce a elite no fundo", chefeDe(p2)[0].nome === "Dragão Jovem" && chefeDe(p2)[0].ameaca === "lendario");
  const p3 = plantaDaFicha(crua, [{ nome: "A", nivel: 2, ameaca: "comum" }, { nome: "B", nivel: 3, ameaca: "comum" }]);
  t("no empate de ameaça, o de nível maior é o chefe", chefeDe(p3)[0].nome === "B");
  t("o tamanho de cada grupo é o de sempre", luta(p1).every((s) => s.inimigos.length === crua.salas.find((x) => x.id === s.id).inimigos.length));
  t("o guardião da chave (antes do fundo) já põe um não chefe em cena", p1.salas.find((s) => s.tipo === "chave").inimigos.length >= 1 && luta(p1).filter((s) => s.tipo !== "chefe")[0].inimigos[0].nome === "Lobo");
  /* um bicho só: todo grupo é dele, e o chefe é ele erguido */
  const p4 = plantaDaFicha(crua, [{ nome: "Elemental Menor", nivel: 5 }]);
  t("ficha de um só: todo inimigo é ele, e o chefe é ele com ameaça de chefe", luta(p4).flatMap((s) => s.inimigos).every((e) => e.nome === "Elemental Menor") && chefeDe(p4)[0].ameaca === "elite");
  /* a roda: com lugares de luta que cheguem, toda a ficha em cena */
  const seis = ["A", "B", "C", "D", "E", "F"].map((n, i) => ({ nome: n, nivel: i + 1 }));
  const p5 = plantaDaFicha(crua, seis);
  const vagas = luta(crua).reduce((a, s) => a + s.inimigos.length, 0);
  t(`ficha de seis numa planta de ${vagas} lugares de luta: os seis em cena`, vagas >= 6 && seis.every((b) => luta(p5).some((s) => s.inimigos.some((e) => e.nome === b.nome))));
  t("o teto: o sétimo bicho de uma ficha não entra", bichosDaFicha([...seis, { nome: "G", nivel: 9 }]).length === FICHA_NA_PLANTA.maximo);
  t("repetidos contam uma vez; o nome é aparado e cortado no teto", JSON.stringify(bichosDaFicha([{ nome: " Lobo " }, { nome: "Lobo" }, { nome: "x".repeat(99) }]).map((b) => b.nome)) === JSON.stringify(["Lobo", "x".repeat(FICHA_NA_PLANTA.nomeMaximo)]));
  /* a ameaça: a da ficha, senão a do bestiário, senão a do nível, senão o meio */
  const b = bichosDaFicha([{ nome: "Troll", nivel: 5, ameaca: "elite" }, { nome: "Goblin", nivel: 9 }, { nome: "Sombra", nivel: 8 }, { nome: "Névoa" }, { nome: "Pó", nivel: "x", ameaca: "deus" }]);
  t("a ameaça: a da ficha manda (Troll elite)", b[0].ameaca === "elite");
  t("sem ela, a do bestiário pelo nome (Goblin fraco, mesmo com nível 9)", b[1].ameaca === "fraco");
  t("sem nome do bestiário, a do nível (Sombra nv 8 → elite)", b[2].ameaca === "elite" && b[2].nivel === 8);
  t("sem nível, o meio; ameaça que não existe não vale", b[3].ameaca === FICHA_NA_PLANTA.ameacaSemNivel && b[3].nivel === null && b[4].ameaca === FICHA_NA_PLANTA.ameacaSemNivel);
  /* a ficha nova grava a ameaça, e é a do bicho da região */
  let fichas = 0, certas = 0;
  for (let i = 0; i < 40; i++) {
    const mapa = mapaDaCampanhaNova(mapaDaCriacao({ semente: sementeDe(i), molde: SOBRE, genero: generoDe(i), estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id, modo: "historia" }));
    const am = {};
    for (const r of mapa.regioes) for (const c of criaturasDaRegiao(sementeDe(i), r, generoDe(i), null)) am[c.nome] = c.ameaca;
    for (const l of mapa.regiao.lugares) for (const q of l.ficha.quem) { fichas++; if (DEGRAUS.includes(q.ameaca) && q.ameaca === am[q.nome] && Object.keys(q).join() === "nome,nivel,ameaca") certas++; }
  }
  t(`a ficha da região grava a ameaça do bicho (campo novo, a versão antiga ignora): ${certas}/${fichas}`, certas === fichas && fichas > 400);
}

/* ============================================================ */
sec("9. a pauta: a sala diz o que a ficha diz, e nada cresce");
{
  const D = DEPOIS;
  t(`a linha "de pé aqui" de toda sala de luta só tem nomes que a linha da ficha diz (${D.salaNaFicha}/${D.salasDeLuta}; antes ${ANTES.salaNaFicha})`, D.salaNaFicha === D.salasDeLuta && D.salasDeLuta > 4000);
  t(`a ameaça nova na ficha não soma um byte à linha da ficha (${D.linhaDaFichaIgual}/${D.lugares})`, D.linhaDaFichaIgual === D.lugares);
  t(`a secção MASMORRA tem as mesmas linhas em toda sala de luta (${D.linhasIguais}/${D.salasDeLuta})`, D.linhasIguais === D.salasDeLuta);
  /* os nomes trocam, o bloco não: o que muda é o comprimento de um nome
     por outro (mediana 224 → 225, máx 317 → 321 em 200 mundos) */
  const mdA = [...ANTES.secaoDepois].sort((x, y) => x - y)[ANTES.secaoDepois.length >> 1], mdD = [...D.secaoDepois].sort((x, y) => x - y)[D.secaoDepois.length >> 1];
  const mxA = Math.max(...ANTES.secaoDepois), mxD = Math.max(...D.secaoDepois);
  t(`a secção MASMORRA pesa o mesmo: mediana ${mdA} → ${mdD}, máx ${mxA} → ${mxD} car. (só o comprimento de um nome por outro)`, Math.abs(mdD - mdA) <= 8 && mxD - mxA <= 16);
  /* a linha da ficha numa masmorra de lugar: o mesmo texto de sempre */
  const mapa = mapaDaCampanhaNova(mapaDaCriacao({ semente: sementeDe(11), molde: SOBRE, genero: generoDe(11), estrutura: ESTRUTURAS[2].id, modo: "historia" }));
  const l = mapa.regiao.lugares[0];
  const linha = linhaDaFicha(mapa, { nome: l.nome, salas: [{ id: 0 }], atual: 0 });
  t("a linha da ficha continua a de sempre (\"de fora, sabe-se que por lá andam…\") e não diz a ameaça", linha.includes("de fora, sabe-se que por lá andam") && !DEGRAUS.some((a) => linha.includes(a)));
}

/* ============================================================ */
sec("10. a fiação no App.jsx");
{
  const APP = tenta(() => readFileSync(join(AQUI, "..", "src", "App.jsx"), "utf8").replace(/\r\n/g, "\n"), "");
  t("o App lê-se", APP.length > 100000);
  t("o App importa quemDoLugar de regiao.js", /import \{[^}]*\bquemDoLugar\b[^}]*\} from "\.\/regiao\.js";/.test(APP));
  const i = APP.indexOf("const entrarMasmorra = (nomeSugerido = \"\", opcoes = null) => {");
  const ent = i < 0 ? "" : APP.slice(i, APP.indexOf("\n  };\n", i));
  t("entrarMasmorra existe", ent.length > 500);
  t("a lista da ficha sai do lugar que o mapa achou (doMapa.id), em try/catch pelo calou",
    /const quemDaFicha = \(\(\) => \{\s*if \(!doMapa\) return null;\s*try \{ return quemDoLugar\(mapaRef\.current, doMapa\.id\); \} catch \(e\) \{ calou\("quemDoLugar", e\); return null; \}\s*\}\)\(\);/.test(ent));
  t("e vai para a planta, ao lado das salas", /gerarMasmorra\([^;]*\{ salas: doMapa \? doMapa\.salas : null, quem: quemDaFicha \}\);/.test(ent));
  t("depois de o mapa achar o lugar, antes de a planta nascer", ent.indexOf("const doMapa =") < ent.indexOf("const quemDaFicha =") && ent.indexOf("const quemDaFicha =") < ent.indexOf("const mmBase = gerarMasmorra("));
  t("gerarMasmorra é chamada num ponto só do App", APP.split("gerarMasmorra(").length - 1 === 1);
}

/* ============================================================ */
sec("11. a ligação — as exportações novas têm quem as leia");
{
  const src = join(AQUI, "..", "src");
  const fontes = readdirSync(src).filter((f) => /\.(js|jsx)$/.test(f)).map((f) => readFileSync(join(src, f), "utf8")).join("\n");
  const provas = readdirSync(AQUI).filter((f) => /^teste-.+\.mjs$/.test(f)).map((f) => readFileSync(join(AQUI, f), "utf8")).join("\n");
  for (const nome of ["FICHA_NA_PLANTA", "bichosDaFicha", "plantaDaFicha", "quemDoLugar"]) {
    const c = (fontes.match(new RegExp(`\\b${nome}\\b`, "g")) || []).length + (provas.match(new RegExp(`\\b${nome}\\b`, "g")) || []).length;
    t(`${nome}: ${c} leituras (≥ 2)`, c >= 2);
  }
}

console.log(`\na ficha é a planta (MM17, v9.363): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
