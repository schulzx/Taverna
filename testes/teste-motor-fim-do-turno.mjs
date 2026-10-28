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
import { aplicarOCodex, aplicarAChegada, oPortaoDoTurno } from "../src/motor/fim-do-turno.js";
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
    else if (ef.tipo === "cidadeAtual") A.cidadeAtual = ef.cidade;
    else if (ef.tipo === "lugar") A.lugar = ef.lugar;
    else if (ef.tipo === "mapa") A.mapa = ef.mapa;
    else if (ef.tipo === "portao") { if ("contexto" in ef) A.portaoCtx = ef.contexto; A.portao = ef.violacoes; }
  }
  A.msgs.push(...saida.msgs);
  return A;
}
/* a chegada, como o App a aplica: os efeitos, as linhas, o relógio (o
   dublê do gerador: guarda os minutos, e dá uma linha só passadas dez
   horas) e SÓ ENTÃO a nota — o relógio pode escrever nela antes */
function oAppAplicaAChegada(A, ch) {
  oAppAplica(A, { ...ch, paraOCronista: [] });
  if (ch.minutos) { A.minutos.push(ch.minutos); if (ch.minutos >= 600) A.msgs.push(`⏳ a travessia levou ${ch.minutos} minutos`); }
  A.nota = notaComOTurno(A.nota, ch.paraOCronista);
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

sec("2. a chegada que ninguém anotou — byte a byte");
{
  const aChegada = (c, mexer = (x) => x) => {
    const A = oAppDoFim(c);
    oAppAplica(A, aplicarOCodex(estadoDoCodex(c, A), c.resp, c.ctx));
    const ch = aplicarAChegada(mexer({ ...estadoDoCodex(c, A), combate: c.estado.combate, jornada: c.estado.jornada }), c.resp);
    oAppAplicaAChegada(A, ch);
    return { A, ch };
  };
  let iguais = 0; const dif = [];
  for (let i = 0; i < CF.length; i++) {
    const c = JSON.parse(JSON.stringify(CF[i]));
    semearACasa(c.semente);
    const { A } = aChegada(c);
    const F = DF.casos[i].fotos.chegada;
    if (igual(foto(A), F) && !A.calou.length) iguais++;
    else dif.push(`${c.id}: ${JSON.stringify(A.msgs.slice(-2)).slice(0, 140)} / ${JSON.stringify(F.msgs.slice(-2)).slice(0, 140)}`);
  }
  t(`${iguais}/${CF.length} chegadas iguais ao byte (a cidade, o lugar, o mapa, o relógio, a tela, a nota)`, iguais === CF.length, dif.slice(0, 3).join(" | "));
  /* a prova só vale se percorre os ramos — contados no dourado */
  const chegou = DF.casos.filter((x) => x.fotos.chegada.digital !== x.fotos.codex.digital).length;
  const nota = DF.casos.filter((x) => /CHEGADA — REGISTRADA/.test(x.fotos.chegada.nota)).length;
  let novo = 0, saiuDoLugar = 0, negada = 0, jaVeio = 0;
  for (const c0 of CF) {
    const c = JSON.parse(JSON.stringify(c0)); semearACasa(c.semente);
    const { ch } = aChegada(c);
    if (ch.efeitos.some((e) => e.tipo === "mapa")) novo++;
    if (ch.efeitos.some((e) => e.tipo === "lugar")) saiuDoLugar++;
    if (/quase entra/.test(c.resp.narrativa) && !/pela estrada curta/.test(c.resp.narrativa)) negada++;
    if (/pela estrada curta/.test(c.resp.narrativa) && c.resp.mudancas && c.resp.mudancas.cidade_atual) jaVeio++;
  }
  t(`…a chegada move o herói em ${chegou} casos (com a nota em ${nota}), abre o mapa em ${novo}, tira-o do lugar em ${saiuDoLugar}; a negada (${negada}) e a já anotada (${jaVeio}) não movem`, chegou >= 10 && nota === chegou && novo >= 3 && saiuDoLugar >= 2 && negada >= 5 && jaVeio >= 3);
  {
    let partem = 0, partemB = 0;
    for (let i = 0; i < CF.length; i++) {
      const c = JSON.parse(JSON.stringify(CF[i])); semearACasa(c.semente);
      if (!igual(foto(aChegada(c, (e) => ({ ...e, mapa: { ...e.mapa, rotas: (e.mapa.rotas || []).filter((r) => r.dias > 1) } })).A), DF.casos[i].fotos.chegada)) partem++;
      const c2 = JSON.parse(JSON.stringify(CF[i])); semearACasa(c2.semente);
      if (!igual(foto(aChegada(c2, (e) => ({ ...e, jornada: null, combate: null })).A), DF.casos[i].fotos.chegada)) partemB++;
    }
    t(`…e morde: sem as rotas de um passo (${partem}), e sem a luta e a jornada que a calam (${partemB}) — os casos partem`, partem > 0 && partemB > 0);
  }
  t("lixo não estoura (a chegada nunca derruba o turno)", (() => { try { aplicarAChegada(null, null); aplicarAChegada({ cidadeAtual: "Vau", mapa: null }, { narrativa: "Você entra em Vau." }); return true; } catch { return false; } })());
  t("sem chegada, o relógio não anda", aplicarAChegada({ cidadeAtual: "Vau", mapa: { cidades: [], rotas: [] } }, { narrativa: "Você fica." }).minutos === 0);
  /* a fiação */
  t("o App chama a chegada do motor, faz o relógio andar e só então põe a nota", /const daChegada = aplicarAChegada\(\{/.test(corpoAR)
    && corpoAR.indexOf("if (daChegada.minutos)") > corpoAR.indexOf("msgs.push(...daChegada.msgs)") && corpoAR.indexOf("notaRef.current = notaComOTurno(notaRef.current, daChegada.paraOCronista)") > corpoAR.indexOf("if (daChegada.minutos)")
    && /calou\("a chegada do turno", e\)/.test(corpoAR));
  t("a chegada já não mora no App", !/const ch = detectarChegada\(resp\.narrativa/.test(APP));
}

sec("3. o portão — byte a byte, e as três peças em fila");
{
  /* as três peças do motor em fila, como o App as corre depois da luta, e
     o App em miniatura a aplicar cada uma: as três fotos têm de bater */
  const oFim = (c, mexer = (x) => x) => {
    const A = oAppDoFim(c);
    oAppAplica(A, aplicarOCodex(estadoDoCodex(c, A), c.resp, c.ctx));
    const fCodex = foto(A);
    oAppAplicaAChegada(A, aplicarAChegada({ ...estadoDoCodex(c, A), combate: c.estado.combate, jornada: c.estado.jornada }, c.resp));
    const fChegada = foto(A);
    const p = oPortaoDoTurno(mexer({ ...estadoDoCodex(c, A), combate: c.estado.combate }), c.resp);
    oAppAplica(A, p);
    return { A, p, fotos: { codex: fCodex, chegada: fChegada, portao: foto(A) } };
  };
  let iguais = 0, fila = 0; const dif = [];
  for (let i = 0; i < CF.length; i++) {
    const c = JSON.parse(JSON.stringify(CF[i]));
    semearACasa(c.semente);
    const { A, fotos } = oFim(c);
    const F = DF.casos[i].fotos;
    if (igual(fotos.portao, F.portao) && !A.calou.length) iguais++;
    else dif.push(`${c.id}: ${JSON.stringify(A.portao || []).slice(0, 140)}`);
    if (["codex", "chegada", "portao"].every((k) => igual(fotos[k], F[k]))) fila++;
  }
  t(`${iguais}/${CF.length} portões iguais ao byte (o contexto do conserto e as violações)`, iguais === CF.length, dif.slice(0, 3).join(" | "));
  t(`${fila}/${CF.length} fins de turno iguais nas três fotos (o códex, a chegada, o portão em fila)`, fila === CF.length);
  /* a prova só vale se percorre os ramos — contados no dourado */
  const achou = DF.casos.filter((x) => x.fotos.portao.violacoes > 0).length;
  const ids = {};
  for (const c0 of CF) { const c = JSON.parse(JSON.stringify(c0)); semearACasa(c.semente); for (const v of oFim(c).p.efeitos[0].violacoes || []) ids[v.id] = (ids[v.id] || 0) + 1; }
  t(`…o portão acha violações em ${achou} casos: ${Object.entries(ids).map(([k, n]) => `${k} ${n}`).join(", ")}`, achou >= 30 && (ids.morte || 0) >= 10 && Object.keys(ids).length >= 2);
  {
    let partem = 0, partemB = 0;
    for (let i = 0; i < CF.length; i++) {
      const c = JSON.parse(JSON.stringify(CF[i])); semearACasa(c.semente);
      if (!igual(oFim(c, (e) => ({ ...e, combate: null })).fotos.portao, DF.casos[i].fotos.portao)) partem++;
      const c2 = JSON.parse(JSON.stringify(CF[i])); semearACasa(c2.semente);
      if (!igual(oFim(c2, (e) => ({ ...e, ultimoPedido: "volto para a cidade" })).fotos.portao, DF.casos[i].fotos.portao)) partemB++;
    }
    t(`…e morde: sem a luta (${partem}), com outro pedido do jogador (${partemB}) — os casos partem`, partem > 0 && partemB > 0);
  }
  t("sem ficha, o contexto de antes fica e as violações são nulas (como o App fazia)", (() => { const p = oPortaoDoTurno({ personagem: null }, { narrativa: "o lobo tomba morto e não se levanta mais" }); return p.efeitos.length === 1 && !("contexto" in p.efeitos[0]) && p.efeitos[0].violacoes === null; })());
  t("lixo não estoura (o portão nunca derruba o turno)", (() => { try { oPortaoDoTurno(null, null); return true; } catch { return false; } })());
  /* a fiação */
  t("o App chama o portão do motor e aplica os efeitos (o contexto e as violações nos refs do conserto)", /const doPortao = oPortaoDoTurno\(\{/.test(corpoAR) && /aplicarOsEfeitos\(doPortao\)/.test(corpoAR)
    && /else if \(ef\.tipo === "portao"\) \{ if \("contexto" in ef\) portaoCtxRef\.current = ef\.contexto; portaoRef\.current = ef\.violacoes; \}/.test(APP) && /calou\("o portão do turno", e\)/.test(corpoAR));
  t("o portão já não mora no App", !/portaoRef\.current = violacoesDoTurno\(resp\.narrativa, portaoCtxRef\.current\);/.test(APP));
  /* (movido, T1-A 8.ª fatia: a entrega saiu para aEntrega, src/motor/entrega-do-turno.js; o
     marco da entrega é a chamada dela, e não o `if` do portão que morava no App) */
  t("e corre na ordem de antes: o códex, a chegada, o portão — e a entrega depois", corpoAR.indexOf("const doCodex = ") < corpoAR.indexOf("const daChegada = ") && corpoAR.indexOf("const daChegada = ") < corpoAR.indexOf("const doPortao = ") && corpoAR.indexOf("const doPortao = ") < corpoAR.indexOf("const daEntrega = aEntrega(") && corpoAR.indexOf("portao: portaoRef.current") > corpoAR.indexOf("const daEntrega = aEntrega("));
}

sec("4. o códex sem mundo não inventa gente (defeito achado pela T3-B, consertado na 7.ª fatia da T1-A)");
{
  /* Sem mundo, `mencionadosNaCena` refazia a cidade pela semente VAZIA
     (cidadeSintetica) e revelava gente que nenhum mundo tem: o nome que a
     cidade sintética de "Vila do Sul" dá ao primeiro morador entrava no
     registo. No App o mundo existe sempre (sementeMundo nunca é vazia);
     num replay sem o mundo gravado, inventava. */
  const estado = { personagem: { nome: "Vera", nivel: 1 }, mapa: { cidades: [] }, cidadeAtual: "Vila do Sul", base: null, npcs: {}, npcTurno: 3, dia: 2, oferecidos: [{ nome: "Ilka Sal", genero: "ela" }] };
  const prosa = { narrativa: "Você encontra Nolan Olho-de-Corvo junto ao balcão, e Ilka Sal acena da porta." };
  const sem = aplicarOCodex(estado, prosa, {});
  t("sem mundo, ninguém da base entra no registo, e a base não muda", !("Nolan Olho-de-Corvo" in (sem.estado.npcs || {})) && !sem.efeitos.some((e) => e.tipo === "base"));
  t("e o nome à mão que a narração usou entra igual (não precisa do mundo)", "Ilka Sal" in (sem.estado.npcs || {}));
  /* com o mundo, a mesma frase continua a ratificar a gente da base dele */
  const comMundo = aplicarOCodex(estado, prosa, { mundo: { semente: "prova|Fantasia medieval", genero: "Fantasia medieval" } });
  t("com o mundo, o códex continua a ler a base (a mesma chamada, a semente cheia)", comMundo.efeitos.every((e) => e.tipo !== "calou"));
}

console.log(`\nmotor · fim do turno: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
