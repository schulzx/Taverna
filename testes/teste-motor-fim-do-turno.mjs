/* teste-motor-fim-do-turno.mjs (Fase T1, trilha A, 4.ª fatia, 28/10/2026) — o fim do turno, fora do App

   Depois da luta, o `aplicarResposta` fazia três coisas que são regra: o
   códex (a base que vira história, os nomes à mão que viram gente, o peso
   do deus que entra), a chegada que ninguém anotou e o portão. Mudaram-se
   para `src/motor/fim-do-turno.js`, uma peça por commit. A promessa de
   quem move é que NADA muda — e a prova é byte a byte:

   o dourado (`gerar-fim-dourado.mjs`): o App de ANTES (702cedf, lido do
   git) correu os três blocos sobre as 275 narrações reais
   (aplicar-casos.mjs#casosDoFim) e fotografou o estado depois de cada um;
   cada peça do motor, corrida na mesma fila e aplicada por um App em
   miniatura, tem de dar as MESMAS fotos — a base, a gente, a cidade, o
   lugar, o mapa, o relógio pedido, o portão, as linhas da tela e a nota. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { aplicarOCodex } from "../src/motor/fim-do-turno.js";
import { notaComOTurno } from "../src/motor/aplicar.js";
import { semearACasa } from "../src/semente.js";
import { casosDoFim, retratoDoFim, digital } from "./aplicar-casos.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const APP = fs.readFileSync(path.join(AQUI, "..", "src", "App.jsx"), "utf8");
const iAR = APP.indexOf("const aplicarResposta = useCallback(");
const corpoAR = iAR > 0 ? APP.slice(iAR, APP.indexOf("}, [pushMsgs]);", iAR)) : "";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const DF = JSON.parse(fs.readFileSync(path.join(AQUI, "fim-dourado.json"), "utf8"));
const CF = casosDoFim();

/* o App do fim do turno, em miniatura: os refs que as peças leem e
   escrevem, e o que `aplicarOsEfeitos` faz com cada efeito — na ordem */
function oAppDoFim(c) {
  const e = c.estado;
  return { base: e.base, npcs: e.npcs, cidadeAtual: e.cidadeAtual, lugar: e.lugar, mapa: e.mapa, minutos: [], portaoCtx: null, portao: null, msgs: [], nota: c.notaAntes, calou: [] };
}
function oAppAplica(A, saida) {
  A.nota = notaComOTurno(A.nota, saida.paraOCronista);
  for (const ef of saida.efeitos) {
    if (ef.tipo === "base") A.base = ef.base;
    else if (ef.tipo === "npcs") A.npcs = ef.npcs;
    else if (ef.tipo === "calou") A.calou.push(ef.onde);
  }
  A.msgs.push(...saida.msgs);
  return A;
}
const estadoDoCodex = (c, A) => ({ ...c.estado, base: A.base, npcs: A.npcs, cidadeAtual: A.cidadeAtual, lugar: A.lugar, mapa: A.mapa });
const foto = (A) => ({ digital: digital(retratoDoFim(A)), msgs: [...A.msgs], nota: A.nota });
const igual = (m, F) => m.digital === F.digital && JSON.stringify(m.msgs) === JSON.stringify(F.msgs) && m.nota === F.nota;

t(`os casos são os do dourado (${CF.length})`, CF.length === DF.casos.length && CF.every((c, i) => c.id === DF.casos[i].id));
t("o App de antes não calou em nenhum caso", DF.calou === 0);

sec("1. o códex — da base para o cânone, os nomes à mão, o peso do deus — byte a byte");
{
  const oCodex = (c, mexer = (x) => x) => {
    const A = oAppDoFim(c);
    const s = aplicarOCodex(mexer(estadoDoCodex(c, A)), c.resp, c.ctx);
    oAppAplica(A, s);
    return { A, s };
  };
  let iguais = 0; const dif = [];
  for (let i = 0; i < CF.length; i++) {
    const c = JSON.parse(JSON.stringify(CF[i]));
    semearACasa(c.semente);
    const { A } = oCodex(c);
    const F = DF.casos[i].fotos.codex;
    if (igual(foto(A), F) && !A.calou.length) iguais++;
    else dif.push(`${c.id}: ${JSON.stringify(A.msgs).slice(0, 140)} / ${JSON.stringify(F.msgs).slice(0, 140)}${A.calou.length ? " calou " + A.calou : ""}`);
  }
  t(`${iguais}/${CF.length} códex iguais ao byte (a base, a gente, a tela, a nota)`, iguais === CF.length, dif.slice(0, 3).join(" | "));
  /* a prova só vale se percorre os ramos — contados no dourado (o lado de antes) */
  const mexeu = DF.casos.filter((x) => x.fotos.codex.digital !== x.fotos.antes.digital).length;
  const pres = DF.casos.filter((x) => /PRESENÇA/.test(x.fotos.codex.nota)).length;
  let reveladas = 0, gente = 0, mortos = 0;
  for (const c0 of CF) {
    const c = JSON.parse(JSON.stringify(c0)); semearACasa(c.semente);
    const { s } = oCodex(c);
    if (s.efeitos.some((e) => e.tipo === "base")) reveladas++;
    if (s.efeitos.some((e) => e.tipo === "npcs")) gente++;
    if (Object.values(s.estado.npcs || {}).some((n) => n && n.status === "morto")) mortos++;
  }
  t(`…o códex mexe em ${mexeu} casos: a base revelada (${reveladas}), a gente nova (${gente}), o nome à mão morto (${mortos}), o peso do deus (${pres})`, mexeu >= 100 && reveladas >= 50 && gente >= 50 && mortos >= 20 && pres >= 10);
  /* e morde: mexa numa variável e os casos deixam de bater */
  {
    const morde = (mexer) => {
      let partem = 0;
      for (let i = 0; i < CF.length; i++) {
        const c = JSON.parse(JSON.stringify(CF[i])); semearACasa(c.semente);
        const { A } = oCodex(c, mexer);
        if (!igual(foto(A), DF.casos[i].fotos.codex)) partem++;
      }
      return partem;
    };
    const p1 = morde((e) => ({ ...e, dia: (e.dia || 0) + 1 }));
    const p2 = morde((e) => ({ ...e, oferecidos: [] }));
    const p3 = morde((e) => ({ ...e, cidadeAtual: "Forte do Rei" }));
    t(`…e morde: outro dia (${p1}), sem os nomes à mão (${p2}), outra cidade (${p3}) — os casos partem`, p1 > 0 && p2 > 0 && p3 > 0);
  }
  /* pureza e forma */
  const c = JSON.parse(JSON.stringify(CF[0]));
  const antes = JSON.stringify(c);
  semearACasa(c.semente); const a = aplicarOCodex(c.estado, c.resp, c.ctx);
  t("o que entra sai intacto", JSON.stringify(c) === antes);
  t("{ estado, efeitos, paraOCronista, msgs }, efeitos por tipo", a.estado && Array.isArray(a.efeitos) && a.efeitos.every((e) => e && typeof e.tipo === "string") && Array.isArray(a.paraOCronista) && Array.isArray(a.msgs));
  t("lixo não estoura (o códex nunca derruba o turno)", (() => { try { aplicarOCodex(null, null, null); aplicarOCodex({ personagem: null }, { narrativa: "Gwynn acena." }, { mundo: () => { throw new Error("x"); } }); return true; } catch { return false; } })());
  /* a fiação: o App chama a peça e aplica os efeitos no lugar dela */
  t("o App chama o códex do motor e aplica os efeitos", /const doCodex = aplicarOCodex\(\{/.test(corpoAR) && /aplicarOsEfeitos\(doCodex\)/.test(corpoAR) && /calou\("o códex do turno", e\)/.test(corpoAR));
  t("o códex já não mora no App", !/const genteRevelavel = m\.gente\.filter/.test(APP) && !/const usados = nomesAMaoNaProsa\(resp\.narrativa/.test(APP));
  t("a base revelada é um efeito do App (o ref e a tela juntos)", /else if \(ef\.tipo === "base"\) \{ baseMundoRef\.current = ef\.base; setBaseMundo\(ef\.base\); \}/.test(APP));
}

console.log(`\nmotor · fim do turno: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
