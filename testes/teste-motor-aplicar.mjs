/* teste-motor-aplicar.mjs (Fase T1, trilha A, 27/10/2026) — o aplicar, fora do App

   O primeiro bloco do `aplicarResposta` saiu do componente para
   `src/motor/aplicar.js`: a poda, as travas anti-duplo, o relógio dos
   efeitos e das condições (eu, o grupo, os inimigos), as recargas, as
   mudanças declaradas, a cobrança e o débito. A promessa de quem move é
   que NADA muda — e a prova é byte a byte:

   1. o dourado: 275 respostas reais (as narrações das sessões 8 a 10),
      cada uma com ficha, luta e mudanças variadas; o App de ANTES
      (b9e6e20, lido do git por `gerar-aplicar-dourado.mjs`) produziu um
      estado, e `aplicar` tem de produzir o MESMO — a mesma impressão
      digital do retrato inteiro (a ficha, as linhas, a nota, a luta, as
      travas, a textura, a resposta podada).
   2. pureza: o que entra não sai mexido, e a mesma entrada dá a mesma saída.
   3. a forma da saída: { estado, efeitos, paraOCronista, podado, msgs }.
   4. a fiação no App: o App chama `aplicar` e aplica os efeitos num lugar só. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { aplicar, notaComOTurno, aplicarORegisto, contextoDoNomeCom } from "../src/motor/aplicar.js";
import { semearACasa, dadoDo } from "../src/semente.js";
import { fieisPorFeito } from "../src/divindades.js";
import { calcularFama } from "../src/fama.js";
import { casosDoAplicar, retrato, digital, casosDoRegisto, retratoDoRegisto, casosDoMeio, retratoDoMapa, retratoDoMeio, retratoDoPrompt, motorDoArcoDoCaso, sorteDoCaso } from "./aplicar-casos.mjs";
import { registrarOLugar, aplicarOMapa, dadivasConcedidas, aplicarAsMissoes, aplicarOsSinais, arcoComOMarco, ganhoDeFe, milagreInvocado } from "../src/motor/meio-do-turno.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));

/* o App do meio do turno, em miniatura: os refs que os blocos do meio leem
   e escrevem, e o que `aplicarOsEfeitos` faz com cada efeito — na ordem */
function oAppDoMeio(c) {
  const e = c.estado;
  return {
    pers: e.personagem, fichaDoRef: e.fichaDoRef, fichaDoReact: e.fichaDoReact, mapa: e.mapa, cidadeAtual: e.cidadeAtual, lugar: e.lugar,
    jornada: e.jornada, faccaoJogador: e.faccaoJogador, devocao: e.devocao, divindade: e.divindade, eventos: e.eventos, historia: e.historia,
    combate: e.combate, sinalViagem: null, sinalMasmorra: null, sinalRaid: null, espolio: null, lugarNovo: null, chegada: null,
    salvos: [], remontagens: [], questsVistas: 0, canone: e.canone, npcs: e.npcs, quests: e.quests, calou: [],
  };
}
function oAppAplica(A, efeitos) {
  for (const ef of efeitos) {
    if (ef.tipo === "mapa") A.mapa = ef.mapa;
    else if (ef.tipo === "cidadeAtual") A.cidadeAtual = ef.cidade;
    else if (ef.tipo === "lugar") A.lugar = ef.lugar;
    else if (ef.tipo === "jornada") A.jornada = ef.jornada;
    else if (ef.tipo === "faccaoJogador") A.faccaoJogador = ef.faccao;
    else if (ef.tipo === "devocao") A.devocao = ef.devocao;
    else if (ef.tipo === "lugarNovo") A.lugarNovo = ef.cidade;
    else if (ef.tipo === "chegada") A.chegada = ef.chegada;
    else if (ef.tipo === "calou") A.calou.push(ef.onde);
    /* a 2.ª etapa: o deus, a ficha do milagre (ref, tela e save), a luta, o
       arco, os eventos, os sinais das portas, o achado e a revelação */
    else if (ef.tipo === "divindade") A.divindade = ef.divindade;
    else if (ef.tipo === "ficha") { A.fichaDoRef = ef.personagem; A.fichaDoReact = ef.personagem; A.salvos = [...A.salvos, digital(JSON.stringify({ personagem: ef.personagem }))]; }
    else if (ef.tipo === "combate") A.combate = ef.combate;
    else if (ef.tipo === "eventos") A.eventos = ef.eventos;
    else if (ef.tipo === "historia") A.historia = ef.historia;
    else if (ef.tipo === "quests") A.questsVistas++;
    else if (ef.tipo === "sinalViagem") A.sinalViagem = ef.destino;
    else if (ef.tipo === "sinalMasmorra") A.sinalMasmorra = ef.nome;
    else if (ef.tipo === "sinalRaid") A.sinalRaid = ef.nome;
    else if (ef.tipo === "loot") A.fichaDoReact = { ...A.fichaDoReact, equipamento: [...(A.fichaDoReact.equipamento || []), ef.item] };
    else if (ef.tipo === "espolio") A.espolio = ef.item;
    else if (ef.tipo === "remontarPrompt") A.remontagens = [...A.remontagens, retratoDoPrompt({ personagem: ef.personagem || A.fichaDoRef, canone: A.canone, mapa: A.mapa, faccao: A.faccaoJogador, historia: A.historia, eventos: A.eventos, quests: A.quests, npcs: A.npcs, divindade: A.divindade, lugar: A.lugar, cidade: A.cidadeAtual, jornada: A.jornada })];
  }
  return A;
}
let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* o que o App faz com a saída — é o mesmo que `aplicarOsEfeitos` faz lá */
function oQueOAppVe(c, s) {
  let combate = c.estado.combate, textura = {};
  for (const ef of s.efeitos) {
    if (ef.tipo === "combate") combate = ef.combate;
    else if (ef.tipo === "textura") textura = { ...textura, ganho: true };
  }
  return retrato({
    pers: s.estado.personagem, msgs: s.msgs, nota: notaComOTurno(c.notaAntes, s.paraOCronista), combate,
    danoJaAplicado: s.estado.danoJaAplicado, habUsada: s.estado.habUsada, textura, resp: s.podado,
  });
}

sec("1. o dourado — o App de antes e o motor de agora, byte a byte");
const DOURADO = JSON.parse(fs.readFileSync(path.join(AQUI, "aplicar-dourado.json"), "utf8"));
const CASOS = casosDoAplicar();
t(`os casos são os do dourado (${CASOS.length})`, CASOS.length === DOURADO.casos.length && CASOS.every((c, i) => c.id === DOURADO.casos[i].id));
t("o App de antes não calou em nenhum caso", DOURADO.calou === 0);
let iguais = 0, bytes = 0; const diferentes = [];
for (let i = 0; i < CASOS.length; i++) {
  const c = JSON.parse(JSON.stringify(CASOS[i]));
  semearACasa(c.semente);
  const s = aplicar(c.estado, c.resp, c.ctx);
  const r = oQueOAppVe(c, s);
  bytes += r.length;
  if (digital(r) === DOURADO.casos[i].digital) iguais++;
  else diferentes.push(`${c.id}: msgs ${JSON.stringify(s.msgs).slice(0, 160)} / dourado ${JSON.stringify(DOURADO.casos[i].msgs).slice(0, 160)}`);
}
t(`${iguais}/${CASOS.length} estados iguais ao byte (${bytes} bytes comparados)`, iguais === CASOS.length, diferentes.slice(0, 3).join(" | "));
const ramos = DOURADO.casos;
t("o dourado percorre o relógio dos inimigos", CASOS.filter((c) => c.estado.combate).length >= 50);
t("…a nota do turno", ramos.filter((x) => x.nota && x.nota !== "[NOTA DE ANTES]").length >= 50);
t("…a cobrança e o débito", ramos.filter((x) => /moedas|escamas/.test(x.msgs.join(" "))).length >= 50);
t("…a segunda chance (a salvaguarda rolou)", ramos.filter((x) => /deu \d+/.test(x.msgs.join(" "))).length >= 20);

sec("2. pureza");
{
  const c = JSON.parse(JSON.stringify(CASOS[1]));
  const antes = JSON.stringify(c);
  semearACasa(c.semente); const a = aplicar(c.estado, c.resp, c.ctx);
  t("o estado, a resposta e o contexto que entraram saem intactos", JSON.stringify(c) === antes);
  semearACasa(c.semente); const b = aplicar(c.estado, c.resp, c.ctx);
  t("a mesma entrada (e a mesma sorte) dá a mesma saída", oQueOAppVe(c, a) === oQueOAppVe(c, b));
  t("a trava do dano que pegou vira estado novo, não ref", CASOS[0].estado.danoJaAplicado === true && (() => { const k = JSON.parse(JSON.stringify(CASOS[1])); k.estado.danoJaAplicado = true; semearACasa(k.semente); return aplicar(k.estado, k.resp, k.ctx).estado.danoJaAplicado === false; })());
}

sec("3. a forma da saída");
{
  const c = JSON.parse(JSON.stringify(CASOS[5]));
  semearACasa(c.semente);
  const s = aplicar(c.estado, c.resp, c.ctx);
  t("{ estado, efeitos, paraOCronista, podado, msgs }", s.estado && Array.isArray(s.efeitos) && Array.isArray(s.paraOCronista) && s.podado && Array.isArray(s.msgs));
  t("todo efeito é descrito por tipo", s.efeitos.every((e) => e && typeof e.tipo === "string"));
  const semFicha = aplicar({ personagem: null }, { narrativa: "x" }, {});
  t("sem ficha não há turno (o App devolve null, como antes)", semFicha.semFicha === true && semFicha.msgs.length === 0);
  t("lixo no estado e no contexto não estoura", !!aplicar(null, { narrativa: "" }, null));
  t("a nota cresce como no App", notaComOTurno("", ["a", "b"]) === "a\nb" && notaComOTurno("x", ["a"]) === "x\na" && notaComOTurno(null, []) === "");
}

sec("4. a fiação no App");
const APP = fs.readFileSync(path.join(AQUI, "..", "src", "App.jsx"), "utf8");
const iAR = APP.indexOf("const aplicarResposta = useCallback((resp, persAtual, opts = {}) => {");
const corpoAR = iAR > 0 ? APP.slice(iAR, APP.indexOf("}, [pushMsgs]);", iAR)) : "";
t("o App importa o aplicar", /from "\.\/motor\/aplicar\.js"/.test(APP));
t("aplicarResposta chama o motor", /aplicar\(\{\s*personagem: pers,/.test(corpoAR));
t("…e aplica os efeitos num lugar só", /aplicarOsEfeitos\(saida\)/.test(corpoAR) && (APP.match(/const aplicarOsEfeitos = /g) || []).length === 1);
const MOTOR = fs.readFileSync(path.join(AQUI, "..", "src", "motor", "aplicar.js"), "utf8");
t("o corpo mudou-se com o texto: o relógio, a cobrança e as travas estão no motor", /const \{ efeitos, msgs: msgsTick \} = tickEfeitos\(pers\);/.test(MOTOR) && /oQueFaltaCreditar\(resp\.narrativa/.test(MOTOR) && /travas\.danoJaAplicado = false;/.test(MOTOR));
t("o motor não lê ref nem chama setX", !/Ref\.current|\bset[A-Z]\w*\(/.test(MOTOR.replace(/\/\*[\s\S]*?\*\//g, "")));
t("o relógio dos efeitos já não mora no App", !/const \{ efeitos, msgs: msgsTick \} = tickEfeitos\(pers\);/.test(APP));
t("a cobrança já não mora no App", !/oQueFaltaCreditar\(resp\.narrativa/.test(APP));

sec("5. o registo — o cânone e a gente, byte a byte (T1-A, 2.ª fatia)");
{
  /* o que o App faz com a saída do registo — o mesmo que `aplicarOsEfeitos`
     faz lá: cada efeito no seu ref, e o prompt remontado uma vez */
  const oQueOAppVeDoRegisto = (c, s) => {
    let canone = c.estado.canone, mapa = c.estado.mapa, npcs = c.estado.npcs, npcTurno = c.estado.npcTurno, remontou = false;
    for (const ef of s.efeitos) {
      if (ef.tipo === "canone") canone = ef.canone;
      else if (ef.tipo === "mapa") mapa = ef.mapa;
      else if (ef.tipo === "npcs") npcs = ef.npcs;
      else if (ef.tipo === "npcTurno") npcTurno = ef.npcTurno;
      else if (ef.tipo === "remontarPrompt") remontou = true;
    }
    return retratoDoRegisto({ canone, mapa, npcs, npcTurno, nota: notaComOTurno(c.notaAntes, s.paraOCronista), msgs: s.msgs, remontou });
  };
  const DR = JSON.parse(fs.readFileSync(path.join(AQUI, "registo-dourado.json"), "utf8"));
  const CR = casosDoRegisto();
  t(`os casos são os do dourado (${CR.length})`, CR.length === DR.casos.length && CR.every((c, i) => c.id === DR.casos[i].id));
  t("o App de antes não calou em nenhum caso", DR.calou === 0);
  let iguais = 0, bytes = 0; const dif = [];
  for (let i = 0; i < CR.length; i++) {
    const c = JSON.parse(JSON.stringify(CR[i]));
    semearACasa(c.semente);
    const s = aplicarORegisto(c.estado, c.resp, c.ctx);
    const r = oQueOAppVeDoRegisto(c, s);
    bytes += r.length;
    if (digital(r) === DR.casos[i].digital) iguais++;
    else dif.push(`${c.id}: msgs ${JSON.stringify(s.msgs).slice(0, 120)} / dourado ${JSON.stringify(DR.casos[i].msgs).slice(0, 120)}`);
    if (s.efeitos.some((e) => e.tipo === "calou")) dif.push(`${c.id}: calou ${s.efeitos.filter((e) => e.tipo === "calou").map((e) => e.onde)}`);
  }
  t(`${iguais}/${CR.length} registos iguais ao byte (${bytes} bytes comparados)`, iguais === CR.length, dif.slice(0, 3).join(" | "));
  /* a prova só vale se percorre os ramos: contados no dourado (o lado de antes) */
  const D = DR.casos;
  t("…o lugar do cânone que surge no mapa", D.filter((x) => /surgiu no mapa/.test(x.msgs.join(" "))).length >= 50);
  t("…a nota do homónimo (a porta do nome)", D.filter((x) => /NOMES/.test(x.nota || "")).length >= 10);
  t("…o prompt remontado e o que não remonta", D.filter((x) => x.remontou).length >= 100 && D.filter((x) => !x.remontou).length >= 10);
  {
    const k = CR.findIndex((c) => c.estado.espinha && c.resp.mudancas && c.resp.mudancas.canone && c.resp.mudancas.canone["Gruta das Vozes"]);
    const c = JSON.parse(JSON.stringify(CR[k]));
    semearACasa(c.semente);
    const s = aplicarORegisto(c.estado, c.resp, c.ctx);
    t("…a peneira recusa o segredo de pé (e deixa passar o resto)", k >= 0 && !s.estado.canone["Gruta das Vozes"] && Object.keys(s.estado.canone).length > Object.keys(c.estado.canone).length);
  }
  {
    const k = CR.findIndex((c) => c.estado.abertura && c.resp.mudancas && Array.isArray(c.resp.mudancas.npcs) && c.resp.mudancas.npcs.some((n) => n && n.nome === "Wystan") && !(c.estado.lugar));
    const c = JSON.parse(JSON.stringify(CR[k]));
    semearACasa(c.semente);
    const s = aplicarORegisto(c.estado, c.resp, c.ctx);
    t("…a menção que não é presença (a pista não entra no registo antes de chegar)", k >= 0 && !s.estado.npcs.Wystan);
  }
  /* pureza e forma */
  const c = JSON.parse(JSON.stringify(CR[2]));
  const antes = JSON.stringify(c);
  semearACasa(c.semente); const a = aplicarORegisto(c.estado, c.resp, c.ctx);
  t("o que entra sai intacto", JSON.stringify(c) === antes);
  semearACasa(c.semente); const b = aplicarORegisto(c.estado, c.resp, c.ctx);
  t("mesma entrada, mesma saída", oQueOAppVeDoRegisto(c, a) === oQueOAppVeDoRegisto(c, b));
  t("{ estado, efeitos, paraOCronista, msgs }, efeitos por tipo", a.estado && Array.isArray(a.efeitos) && a.efeitos.every((e) => e && typeof e.tipo === "string") && Array.isArray(a.paraOCronista) && Array.isArray(a.msgs));
  t("o prompt remonta UMA vez, no fim, mesmo quando os dois blocos mexem", CR.every((k) => { const x = JSON.parse(JSON.stringify(k)); semearACasa(x.semente); const s = aplicarORegisto(x.estado, x.resp, x.ctx); const r = s.efeitos.filter((e) => e.tipo === "remontarPrompt"); return r.length <= 1 && (!r.length || s.efeitos[s.efeitos.length - 1] === r[0]); }));
  t("sem mudanças, nada anda (nem o contador da gente)", (() => { const s = aplicarORegisto({ npcTurno: 4, canone: {}, npcs: {} }, { narrativa: "x" }, {}); return s.efeitos.length === 0 && s.estado.npcTurno === 4; })());
  t("lixo não estoura", !!aplicarORegisto(null, null, null));
  /* O ESTADO SEM O CONTADOR (achado da trilha B em 28/10, jogando o estado
     v2 em Node): `npcTurno` não é campo do estado do jogo — o App guarda-o
     num ref e, no load, deriva-o das fichas (`retomarContador`). Sem ele, o
     registo somava 1 a `undefined` e gravava `NaN` em `ultimaVez`. Ausente,
     deriva-se como o load deriva. */
  {
    const s = aplicarORegisto({ personagem: { nome: "Vera" }, canone: {}, mapa: { cidades: [], faccoes: [] }, npcs: { Hilda: { nome: "Hilda", ultimaVez: 7, conhecidoEm: 1 } }, dia: 3 },
      { narrativa: "x", mudancas: { npcs: [{ nome: "Brann Ferro", papel: "ferreiro" }] } }, { baseDoNome: { importantes: [], conhecidos: [], recentes: [], grupo: [], aqui: [], heroi: "Vera" } });
    t("sem npcTurno no estado, o contador sai das fichas (nunca NaN)", s.estado.npcTurno === 8 && s.estado.npcs["Brann Ferro"] && s.estado.npcs["Brann Ferro"].ultimaVez === 8, JSON.stringify(s.estado.npcs["Brann Ferro"]));
  }
  t("o contexto do nome é o do App: a base do jogo e a metade do nome", JSON.stringify(contextoDoNomeCom({ importantes: [1], conhecidos: [2], recentes: [3], grupo: [4], aqui: ["a"], heroi: "h" }, { local: "L", genero: "ela", papel: "p", notas: "n", status: "vivo" })) === JSON.stringify({ importantes: [1], conhecidos: [2], recentes: [3], grupo: [4], local: "L", genero: "ela", papel: "p", notas: "n · vivo", aqui: ["a"], heroi: "h" }));
  /* a fiação: o App chama o registo no lugar dos dois blocos */
  t("o App chama o registo e aplica os efeitos no mesmo lugar", /aplicarORegisto\(\{/.test(corpoAR) && /aplicarOsEfeitos\(registo\)/.test(corpoAR));
  t("o cânone e a gente já não moram no App", !/let canoneDoNarrador = resp\.mudancas\.canone;/.test(APP) && !/npcTurnoRef\.current \+= 1;/.test(APP));
  t("o contextoDoNome do App é a base mais a metade do motor", /const contextoDoNome = \(n\) => contextoDoNomeCom\(baseDoNome\(\), n\);/.test(APP));
}

sec("6. a salvaguarda pela sorte do turno (T1-A, 2.ª fatia)");
{
  /* o dourado da sorte (`gerar-aplicar-dourado.mjs --sorte`): o bloco de
     b9e6e20 com o d20 da salvaguarda vindo de dadoDo(semente do caso,
     "salvaguarda") e a casa semeada com OUTRA semente. O motor, com
     `ctx.sorte` igual, tem de dar o mesmo, byte a byte */
  const DS = JSON.parse(fs.readFileSync(path.join(AQUI, "aplicar-dourado-sorte.json"), "utf8"));
  t(`os casos são os do dourado da sorte (${CASOS.length})`, DS.casos.length === CASOS.length && CASOS.every((c, i) => c.id === DS.casos[i].id));
  let iguais = 0; const dif = [];
  const comSorte = (c, casa) => { semearACasa(casa); return aplicar(c.estado, c.resp, { ...c.ctx, sorte: dadoDo(c.semente, "salvaguarda") }); };
  for (let i = 0; i < CASOS.length; i++) {
    const c = JSON.parse(JSON.stringify(CASOS[i]));
    const s = comSorte(c, `outra casa|${c.semente}`);
    if (digital(oQueOAppVe(c, s)) === DS.casos[i].digital) iguais++; else dif.push(`${c.id}: ${JSON.stringify(s.msgs).slice(0, 140)}`);
  }
  t(`${iguais}/${CASOS.length} estados iguais ao byte com o dado da sorte do turno`, iguais === CASOS.length, dif.slice(0, 3).join(" | "));
  t("…e a salvaguarda rolou em muitos deles", DS.casos.filter((x) => /deu \d+/.test(x.msgs.join(" "))).length >= 20);
  /* o que se ganhou: o dado da salvaguarda já não depende do que a casa
     sorteou antes — as linhas da salvaguarda são as mesmas com qualquer casa */
  const linhasDaSalva = (s) => s.msgs.filter((m) => /deu \d+/.test(m)).join("\n");
  const indep = CASOS.filter((c0) => { const c = JSON.parse(JSON.stringify(c0)); return linhasDaSalva(comSorte(c, "casa A")) === linhasDaSalva(comSorte(JSON.parse(JSON.stringify(c0)), "casa B")); }).length;
  t(`a salvaguarda não depende da casa (${indep}/${CASOS.length} iguais com duas casas diferentes)`, indep === CASOS.length);
  const dependiam = CASOS.filter((c0) => { const a = JSON.parse(JSON.stringify(c0)), b = JSON.parse(JSON.stringify(c0)); semearACasa("casa A"); const x = linhasDaSalva(aplicar(a.estado, a.resp, a.ctx)); semearACasa("casa B"); return x !== linhasDaSalva(aplicar(b.estado, b.resp, b.ctx)); }).length;
  t(`(sem a sorte do turno ela dependia: ${dependiam} casos mudavam com a casa)`, dependiam > 0);
  t("o App pede a sorte do turno pelo evento da salvaguarda", /sorte: sorteDoTurno\("salvaguarda"\)/.test(corpoAR));
}

sec("7. o mapa e o lugar dito, byte a byte (T1-A, 3.ª fatia)");
{
  /* o App de d776408 (`gerar-meio-dourado.mjs`) fotografou o estado depois
     de cada bloco do meio do turno; o bloco do mapa é o que fica entre a
     foto `dadivas` e a foto `mapa`. O motor corre só esse bloco e tem de dar
     a mesma parte do mapa (as cidades, o lugar, a jornada, a facção, a
     devoção, a cerimónia), as mesmas linhas da tela e a mesma nota. A ficha
     que o bloco lê (só o nome, para a semente da geografia) não muda com a
     dádiva que corre antes dele. */
  const DM = JSON.parse(fs.readFileSync(path.join(AQUI, "meio-dourado.json"), "utf8"));
  const CM = casosDoMeio();
  t(`os casos são os do dourado (${CM.length})`, CM.length === DM.casos.length && CM.every((c, i) => c.id === DM.casos[i].id));
  t("o App de antes não calou em nenhum caso", DM.calou === 0);
  let iguais = 0; const dif = [];
  for (let i = 0; i < CM.length; i++) {
    const c = JSON.parse(JSON.stringify(CM[i]));
    semearACasa(c.semente);
    const s = aplicarOMapa(c.estado, c.resp, c.ctx);
    const A = oAppDoMeio(c);
    oAppAplica(A, s.efeitos);
    const F = DM.casos[i].fotos;
    const ok = digital(retratoDoMapa(A)) === F.mapa.mapa
      && JSON.stringify(s.msgs) === JSON.stringify(F.mapa.msgs.slice(F.dadivas.msgs.length))
      && notaComOTurno(F.dadivas.nota, s.paraOCronista) === F.mapa.nota && !A.calou.length;
    if (ok) iguais++; else dif.push(`${c.id}: ${JSON.stringify(s.msgs).slice(0, 140)} / ${JSON.stringify(F.mapa.msgs.slice(F.dadivas.msgs.length)).slice(0, 140)}`);
  }
  t(`${iguais}/${CM.length} blocos do mapa iguais ao byte`, iguais === CM.length, dif.slice(0, 3).join(" | "));
  /* a prova só vale se percorre os ramos — contados no dourado */
  const linhas = (rx) => DM.casos.filter((x) => rx.test(x.fotos.mapa.msgs.slice(x.fotos.dadivas.msgs.length).join("\n") + "\n" + x.fotos.mapa.nota.slice(x.fotos.dadivas.nota.length))).length;
  t("…o lugar dito que move (📍)", linhas(/📍/) >= 50);
  t("…o lugar recusado (a nota)", linhas(/LUGAR — RECUSADO/) >= 10);
  t("…a cidade registrada, a que entra no mapa e a vizinhança de ouvir", linhas(/registrada no mapa/) >= 30 && linhas(/entrou no seu mapa/) >= 10 && linhas(/fica sabendo de/) >= 10);
  t("…a jornada que termina na chegada", linhas(/🧭 Chegada/) >= 20);
  {
    /* a cerimónia: a primeira pisada e a faixa, as duas */
    let novo = 0, faixa = 0;
    for (const c0 of CM) { const c = JSON.parse(JSON.stringify(c0)); semearACasa(c.semente); const s = aplicarOMapa(c.estado, c.resp, c.ctx); if (s.efeitos.some((e) => e.tipo === "lugarNovo")) novo++; if (s.efeitos.some((e) => e.tipo === "chegada")) faixa++; }
    t(`…a cerimónia da chegada: ${novo} primeiras pisadas, ${faixa} faixas`, novo >= 20 && faixa >= 20);
  }
  /* pureza e forma */
  const c = JSON.parse(JSON.stringify(CM[3]));
  const antes = JSON.stringify(c);
  semearACasa(c.semente); const a = aplicarOMapa(c.estado, c.resp, c.ctx);
  t("o que entra sai intacto", JSON.stringify(c) === antes);
  t("{ estado, efeitos, paraOCronista, msgs }, efeitos por tipo", a.estado && Array.isArray(a.efeitos) && a.efeitos.every((e) => e && typeof e.tipo === "string") && Array.isArray(a.paraOCronista) && Array.isArray(a.msgs));
  t("a chegada não leva relógio (a chave da faixa é do App)", CM.every((k) => { const x = JSON.parse(JSON.stringify(k)); semearACasa(x.semente); return aplicarOMapa(x.estado, x.resp, x.ctx).efeitos.filter((e) => e.tipo === "chegada").every((e) => !("chave" in e.chegada)); }));
  t("sem mudanças, nada anda", (() => { const s = aplicarOMapa({ mapa: { cidades: [] } }, { narrativa: "x" }, {}); return s.efeitos.length === 0 && !s.msgs.length; })());
  t("lixo não estoura (sem mudanças)", !!aplicarOMapa(null, null, null));
  /* o lugar dito, sozinho: a régua que o Mestre e o Cronista dividem */
  const lugar = { nome: "a fazenda de Jessa", cidade: "Monte Rasa", distancia: "arredores" };
  const r1 = registrarOLugar({ cidadeAtual: "Monte Rasa", lugar: null, mapa: { cidades: [] }, dia: 2 }, "a fazenda de Jessa", "mestre", {});
  t("o lugar novo move e anuncia", r1.mudou && r1.lugar && r1.lugar.nome === "a fazenda de Jessa" && /^📍 Você está/.test(r1.aviso));
  const r2 = registrarOLugar({ cidadeAtual: "Monte Rasa", lugar, mapa: { cidades: [] }, dia: 2, ultimoPedido: "olho as galinhas" }, null, "mestre", {});
  t("o null sem o jogador pedir é recusado, com a nota, e não move", !r2.mudou && r2.lugar === lugar && r2.aviso === null && /RECUSADO PELO SISTEMA/.test(r2.paraOCronista[0] || ""));
  const r3 = registrarOLugar({ cidadeAtual: "Monte Rasa", lugar, mapa: { cidades: [] }, dia: 2, ultimoPedido: "volto para a cidade" }, null, "mestre", {});
  t("o null que o jogador pediu é a volta", r3.mudou && r3.lugar === null && /De volta a Monte Rasa/.test(r3.aviso));
  t("na luta, o lugar dito é ignorado em silêncio", (() => { const r = registrarOLugar({ cidadeAtual: "Monte Rasa", lugar: null, mapa: { cidades: [] }, combate: { inimigos: [] } }, "a torre", "cronista", {}); return !r.mudou && !r.aviso && !r.paraOCronista.length; })());
  /* a fiação: o App chama o bloco no lugar dele, e o seu registrarLugar é a régua do motor */
  t("o App chama o mapa e aplica os efeitos no mesmo lugar", /aplicarOMapa\(\{/.test(corpoAR) && /aplicarOsEfeitos\(doMapa\)/.test(corpoAR));
  t("o mapa já não mora no App", !/const abreAMasmorraAgora = \(\(\) => \{/.test(APP) && !/mp\.cidades\.push\(criarCidade\(cd\.nome, cd\)\); msgs\.push/.test(APP));
  t("o registrarLugar do App é a régua do motor", /const r = registrarOLugar\(\{/.test(APP) && !/lido = lerLugarDito\(nome,/.test(APP));
}

sec("8. o meio inteiro — as dádivas, o mapa, as missões e os sinais, byte a byte (T1-A, 3.ª fatia)");
{
  /* as quatro peças em fila, como o App as corre, e o App em miniatura a
     aplicar os efeitos de cada uma; as fotos do dourado depois de CADA bloco
     têm de bater (o estado inteiro, os prompts remontados com o que leram no
     instante, as linhas da tela e a nota) */
  const DM = JSON.parse(fs.readFileSync(path.join(AQUI, "meio-dourado.json"), "utf8"));
  const CM = casosDoMeio();
  const ctxDoCaso = (c) => ({ mundo: c.ctx.mundo, sorteDoTurno: sorteDoCaso(c.semente), motorDoArco: (sobre) => motorDoArcoDoCaso(c.ctx.arco, (sobre || {}).eventos) });
  const fotoDoMotor = (A, msgs, nota) => ({ digital: digital(retratoDoMeio(A)), msgs: [...msgs], nota });
  const oMeio = (c) => {
    const ctx = ctxDoCaso(c);
    const A = oAppDoMeio(c);
    const fotos = {};
    let msgs = [], nota = c.notaAntes;
    if ((A.pers.dadivasPendentes || 0) > 0) { const d = dadivasConcedidas(A.pers, A.divindade); A.pers = d.personagem; msgs.push(...d.msgs); nota = notaComOTurno(nota, d.notas); }
    fotos.dadivas = fotoDoMotor(A, msgs, nota);
    const est = () => ({ personagem: A.pers, fichaDoRef: A.fichaDoRef, mapa: A.mapa, cidadeAtual: A.cidadeAtual, lugar: A.lugar, jornada: A.jornada, faccaoJogador: A.faccaoJogador,
      devocao: A.devocao, divindade: A.divindade, combate: A.combate, acampado: c.estado.acampado, masmorra: c.estado.masmorra, raid: c.estado.raid, espinha: c.estado.espinha,
      ultimoPedido: c.estado.ultimoPedido, dia: c.estado.dia, eventos: A.eventos, historia: A.historia, contadores: c.estado.contadores, nivelDaFama: c.estado.nivelDaFama });
    for (const [nome, peca] of [["mapa", aplicarOMapa], ["missoes", aplicarAsMissoes], ["sinais", aplicarOsSinais]]) {
      const s = peca(est(), c.resp, ctx);
      msgs.push(...s.msgs); nota = notaComOTurno(nota, s.paraOCronista);
      oAppAplica(A, s.efeitos);
      fotos[nome] = fotoDoMotor(A, msgs, nota);
    }
    return { fotos, calou: A.calou };
  };
  let iguais = 0; const dif = [];
  for (let i = 0; i < CM.length; i++) {
    const c = JSON.parse(JSON.stringify(CM[i]));
    semearACasa(c.semente);
    const m = oMeio(c);
    const F = DM.casos[i].fotos;
    const ruim = ["dadivas", "mapa", "missoes", "sinais"].find((k) => m.fotos[k].digital !== F[k].digital || JSON.stringify(m.fotos[k].msgs) !== JSON.stringify(F[k].msgs) || m.fotos[k].nota !== F[k].nota);
    if (!ruim && !m.calou.length) iguais++;
    else dif.push(`${c.id} @${ruim}: ${JSON.stringify(m.fotos[ruim || "sinais"].msgs.slice(-3)).slice(0, 160)} / ${JSON.stringify(F[ruim || "sinais"].msgs.slice(-3)).slice(0, 160)}`);
  }
  t(`${iguais}/${CM.length} meios iguais ao byte, nas quatro fotos (o estado, os prompts, a tela, a nota)`, iguais === CM.length, dif.slice(0, 3).join(" | "));
  /* a prova só vale se percorre os ramos — contados no dourado */
  const D = DM.casos.map((x) => x.fotos.sinais.msgs.join("\n") + "\n" + x.fotos.sinais.nota);
  const n = (rx) => D.filter((x) => rx.test(x)).length;
  t(`…as dádivas (${n(/DÁDIVA ÉPICA/)}), o evento global (${n(/🌍/)}), a fé (${n(/fiéis/)}), o milagre (${n(/MILAGRE —/)}) e a recusa dele (${n(/⛔/)})`, n(/DÁDIVA ÉPICA/) >= 15 && n(/🌍/) >= 20 && n(/fiéis/) >= 30 && n(/MILAGRE —/) >= 10 && n(/⛔/) >= 10);
  t(`…a viagem (${n(/A caminho|Pé na estrada/)}), a masmorra recusada (${n(/MASMORRA — RECUSADA/)}), a ascensão (${n(/ASCENSÃO/)}), o achado (${n(/Achado/)}), o domínio e o patrono (${n(/Domínio revelado/)})`, n(/A caminho|Pé na estrada/) >= 10 && n(/MASMORRA — RECUSADA/) >= 10 && n(/ASCENSÃO/) >= 10 && n(/Achado/) >= 20 && n(/Domínio revelado/) >= 5);
  {
    let virou = 0, ficha = 0, porta = 0, raid = 0;
    for (const c0 of CM) { const c = JSON.parse(JSON.stringify(c0)); semearACasa(c.semente); const ctx = ctxDoCaso(c);
      const mi = aplicarAsMissoes({ eventos: c.estado.eventos, historia: c.estado.historia, dia: c.estado.dia }, c.resp, ctx); if (mi.efeitos.some((e) => e.tipo === "remontarPrompt")) virou++;
      const si = aplicarOsSinais({ ...c.estado }, c.resp, ctx); if (si.efeitos.some((e) => e.tipo === "ficha")) ficha++; if (si.efeitos.some((e) => e.tipo === "sinalMasmorra")) porta++; if (si.efeitos.some((e) => e.tipo === "sinalRaid")) raid++; }
    t(`…o arco que vira (${virou}), a ficha que o milagre muda (${ficha}), a porta da masmorra (${porta}), o chamado da raid (${raid})`, virou >= 5 && ficha >= 5 && porta >= 3 && raid >= 3);
  }
  /* as regras sozinhas — o que os botões e o Cronista também chamam */
  const dv = { despertar: true, fieis: 900, pf: 10, iconeFe: "🙏" };
  const mapaF = { cidades: [{ nome: "Vau Alto", populacao: 2000 }] };
  const g = ganhoDeFe({ divindade: dv, devocao: { cidades: {}, andarilhos: 0 }, mapa: mapaF, cidadeAtual: "Vau Alto", dia: 2, nivel: 15 }, 300, 2, "um feito");
  t("a fé cai no mapa e o número é recontado (nunca somado à mão)", g.divindade.fieis > 0 && g.devocao !== undefined && g.efeitos.map((e) => e.tipo).join(",").startsWith("devocao,divindade") && /\+300 fiéis/.test(g.msgs[0]));
  {
    /* a magnitude do sinal sai da tabela (MAGNITUDE_FE · fieisPorFeito), multiplicada pela fama */
    const cont = { combatesVencidos: 10 };
    const s = aplicarOsSinais({ personagem: { nivel: 15 }, divindade: { despertar: true, fieis: 0, pf: 0 }, devocao: { cidades: {}, andarilhos: 0 }, mapa: { cidades: [] }, dia: 1, contadores: cont, nivelDaFama: 1 }, { narrativa: "x", mudancas: { sinais: ["fe:proeza"] } }, {});
    t("o sinal da fé paga o que a tabela diz (fieisPorFeito × fama)", s.msgs[0].includes(`+${fieisPorFeito("proeza", calcularFama(cont, 1, 0))} fiéis`));
  }
  t("deus adormecido não ganha fé", ganhoDeFe({ divindade: { despertar: false } }, 300, 0, "x").msgs.length === 0);
  t("sem ficha no estado, o nível não derruba (o defeito do render nulo)", (() => { try { ganhoDeFe({ divindade: dv, devocao: {}, mapa: mapaF, cidadeAtual: "Vau Alto", dia: 2 }, 300, 0, "x"); return true; } catch { return false; } })());
  const mil = milagreInvocado({ divindade: { despertar: true, fieis: 2000, pf: 20 }, devocao: {}, mapa: mapaF, dia: 2, nivel: 15, fichaDoRef: { nome: "Vera", vida: 4, vidaMax: 20, grupo: [] } }, "cura", "jogador");
  t("o milagre de cura sai na ficha (efeito `ficha`) e cobra o PF", mil.ficha.vida === 14 && mil.divindade.pf === 12 && mil.efeitos.some((e) => e.tipo === "ficha") && /o jogador invocou/.test(mil.notas[0]));
  t("milagre caro demais é recusado, sem gastar nada", (() => { const r = milagreInvocado({ divindade: { despertar: true, fieis: 2000, pf: 1 } }, "cura"); return r.efeitos.length === 0 && /⛔/.test(r.msgs[0].texto); })());
  const arco = arcoComOMarco({ estrutura: "jornada", etapa: 0, marcos: 3 }, "global", "a praga acabou", { marcosPendentes: 0 });
  t("o marco grande vira o arco e manda o envelope ao Mestre", arco.mudou && arco.remontar && arco.historia.etapa === 1 && arco.notas.length === 1);
  t("marco sem peso não mexe no arco", !arcoComOMarco({ estrutura: "jornada" }, "nada", "x", {}).mudou);
  const dd = dadivasConcedidas({ nome: "Vera", vida: 10, vidaMax: 20, mana: 2, manaMax: 8, dadivasPendentes: 2, dadivas: [] }, null);
  t("as dádivas pendentes saem todas, cada uma com linha e envelope", dd.personagem.dadivasPendentes === 0 && dd.msgs.length === 2 && dd.notas.length === 2);
  /* a fiação */
  t("o App chama as missões e os sinais e aplica os efeitos no mesmo lugar", /aplicarAsMissoes\(\{/.test(corpoAR) && /aplicarOsSinais\(\{/.test(corpoAR));
  t("as quatro regras do App são fiação do motor", /const r = ganhoDeFe\(\{/.test(APP) && /const r = milagreInvocado\(\{/.test(APP) && /const d = dadivasConcedidas\(pers, divindadeRef\.current\);/.test(APP) && /const a = arcoComOMarco\(historiaRef\.current, tipo, rotulo, motorDoArco\);/.test(APP));
  t("o motor do arco do App aceita o evento de agora", /const motorDoArco = \(sobre = \{\}\) => \{/.test(APP));
}

console.log(`\nmotor · aplicar: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
