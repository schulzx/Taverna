/* ============================================================
   ANTES DO MESTRE, NO MOTOR (T1-A, 8.ª fatia, 28/10/2026) — testes/teste-motor-antes-do-mestre.mjs

   O turno do mundo (o relógio e o sino da abertura), a porta dele no
   `agirInterno`, o chão da cena e a escuta do `enviar` saíram do App para
   src/motor/antes-do-mestre.js. Aqui são provados byte a byte contra os de
   antes: `antes-dourado.json` é o que o App de aac1912 fez — os quatro
   blocos recortados à letra — sobre os 275 casos de `antes-bloco.mjs`; e
   esta suíte recorta do App de HOJE a fiação que ficou e corre-a, com as
   peças puras, sobre os mesmos casos e os mesmos dublês.

   E a prova tem de morder: o sino antes do mundo que se mexe, os relógios
   a cada turno, a raid que não pausa, o chão sem o lugar, a escuta sem a
   luta — as fotos TÊM de divergir.

   E a sessão que o jogo gravou (testes/sessao-navegador.json, a 7.ª
   fatia): o passo do motor (`oAntesDoMestre`), corrido sobre o estado
   gravado do turno anterior, tem de dar a abertura, o chão, a escuta e o
   turno do mundo que o App gravou — os quatro campos que eram dívida.
   ============================================================ */
import fs from "node:fs";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDeHoje, blocoComoFuncao, correrOBloco, fotoDoAntes, casosDoAntes, BLOCOS } from "./antes-bloco.mjs";
import { oRelogioDoMundo, oSinoDoTurno, oChaoDaCena, cenaDoChao, oPedidoDaEscuta, aEscutaAnda, oMundoAndaNoTurno, oAntesDoMestre, CADENCIA_DO_MUNDO } from "../src/motor/antes-do-mestre.js";
import { estadoNoTurno } from "../src/sessao.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const D = JSON.parse(fs.readFileSync(new URL("./antes-dourado.json", import.meta.url), "utf8"));
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const casos = casosDoAntes(N_CASOS);
const recorte = recorteDeHoje(APP);
const hoje = Object.fromEntries(BLOCOS.map((b) => [b, blocoComoFuncao(recorte[b])]));
const fotosDeHoje = (bloco, fn) => casos.map((k) => fotoDoAntes(correrOBloco(fn || hoje[bloco], k, { novo: true, bloco })));
const divergem = (bloco, novas) => novas.filter((f, i) => !igual(f, D.blocos[bloco][i])).length;
const trocado = (bloco, de, para, noOrgao) => {
  const r = recorte[bloco];
  const alvo = noOrgao ? r.orgaos : r.bloco;
  if (alvo.split(de).length !== 2) throw new Error("a troca da mordida não bate uma vez só: " + de);
  return blocoComoFuncao(noOrgao ? { ...r, orgaos: alvo.replace(de, para) } : { ...r, bloco: alvo.replace(de, para) });
};

sec("1 · os quatro blocos, byte a byte contra os de antes");
t(`o dourado é do commit de antes (aac1912), ${N_CASOS} casos em cada bloco`, D.commit === "aac1912" && BLOCOS.every((b) => (D.blocos[b] || []).length === N_CASOS));
for (const bloco of BLOCOS) {
  const fotos = D.blocos[bloco];
  const novas = fotosDeHoje(bloco);
  const batem = novas.filter((f, i) => igual(f, fotos[i])).length;
  const primeira = novas.findIndex((f, i) => !igual(f, fotos[i]));
  t(`${bloco}: ${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS, primeira >= 0 ? `o caso ${primeira} diverge: ${JSON.stringify(novas[primeira]).slice(0, 400)} | antes ${JSON.stringify(fotos[primeira]).slice(0, 400)}` : "");
  t(`${bloco}: determinista`, igual(fotosDeHoje(bloco).slice(0, 60), novas.slice(0, 60)));
}
{
  const B = D.blocos;
  const conta = (xs, f) => xs.filter(f).length;
  const toques = conta(B.mundo, (x) => x.tela.some((l) => l.some((m) => m.startsWith("⚠"))));
  const parados = conta(B.mundo, (x) => x.abertura && x.abertura.turnos === (casos[B.mundo.indexOf(x)].abertura || {}).turnos);
  const calados = conta(B.escuta, (x) => x.calados.length);
  console.log(`      o sino toca ${toques} · o mundo parado (luta, legado, pausa) ${parados} · a escuta que calou ${calados}`);
  t("percorre os ramos (o toque do sino e o mundo parado)", toques > 5 && parados > 20);
  t("nenhum bloco estoura para fora, antes ou hoje", BLOCOS.every((b) => B[b].every((x) => !x.erro)));
}

sec("2 · a prova morde");
{
  const antesDoMundo = trocado("mundo", "    if (rel.mundoSeMexe) talvezOMundoSeMexer();\n", "", true);
  const semMexer = divergem("mundo", fotosDeHoje("mundo", antesDoMundo));
  t(`o mundo que não se mexe: ${semMexer} fotos divergem`, semMexer > 100);
  /* o sino ANTES do mundo que se mexe: a ordem é o contrato (o mundo lê o sino que ainda não andou, e a nota do toque troca de lugar) */
  const r0 = recorte.mundo.orgaos.replace("    if (rel.mundoSeMexe) talvezOMundoSeMexer();\n    try {", "    try {").replace("    } catch (e) { calou(\"o sino da abertura\", e); }\n  };", "    } catch (e) { calou(\"o sino da abertura\", e); }\n    if (rel.mundoSeMexe) talvezOMundoSeMexer();\n  };");
  const foraDeOrdem = divergem("mundo", fotosDeHoje("mundo", blocoComoFuncao({ ...recorte.mundo, orgaos: r0 })));
  t(`o sino antes do mundo que se mexe: ${foraDeOrdem} fotos divergem`, foraDeOrdem > 100 && r0 !== recorte.mundo.orgaos);
  const cadaTurno = divergem("mundo", fotosDeHoje("mundo", trocado("mundo", "if (rel.tiquear) tiquear(", "if (true) tiquear(", true)));
  t(`os relógios a cada turno, e não a cada dois: ${cadaTurno} fotos divergem`, cadaTurno > 60);
  const semRaid = divergem("mundo", fotosDeHoje("mundo", trocado("mundo", "raid: raidRef.current, ", "raid: null, ", true)));
  t(`o sino sem a pausa da raid: ${semRaid} fotos divergem`, semRaid > 3);
  const semPergunta = divergem("porta", fotosDeHoje("porta", trocado("porta", "}, acao);", "}, \"ando\");")));
  t(`a porta do mundo que não vê a pergunta: ${semPergunta} fotos divergem`, semPergunta > 20);
  const semLugar = divergem("chao", fotosDeHoje("chao", trocado("chao", "const c = oChaoDaCena({ chao: chaoRef.current, cidadeAtual: cidadeAtualRef.current, lugar: lugarRef.current,", "const c = oChaoDaCena({ chao: chaoRef.current, cidadeAtual: cidadeAtualRef.current, lugar: null,", true)));
  t(`o chão sem o lugar da cena: ${semLugar} fotos divergem`, semLugar > 60);
  const semLuta = divergem("escuta", fotosDeHoje("escuta", trocado("escuta", "espinha: espinhaRef.current, combate: combateRef.current }", "espinha: espinhaRef.current, combate: null }")));
  t(`a escuta sem a luta (que é pausa): ${semLuta} fotos divergem`, semLuta > 5);
  const semModo = divergem("escuta", fotosDeHoje("escuta", trocado("escuta", "oPedidoDaEscuta({ modo: modoRef.current,", "oPedidoDaEscuta({ modo: \"historia\",")));
  t(`a escuta em Uma Noite: ${semModo} fotos divergem`, semModo > 5);
}

sec("3 · as peças, sozinhas");
{
  t("a cadência dos relógios é tabela (a cada dois)", CADENCIA_DO_MUNDO.relogiosACada === 2 && oRelogioDoMundo({ turnosDeMundo: 1 }).tiquear && !oRelogioDoMundo({ turnosDeMundo: 2 }).tiquear);
  t("na luta o mundo para, e o contador não anda", oRelogioDoMundo({ combate: {}, turnosDeMundo: 4 }).parado && oRelogioDoMundo({ combate: {}, turnosDeMundo: 4 }).turnosDeMundo === 4);
  t("leituras `null` não estouram", !!oRelogioDoMundo(null) && !!oSinoDoTurno(null) && !!oChaoDaCena(null) && !oPedidoDaEscuta(null, "x").erro && !aEscutaAnda(null, null).erro && oMundoAndaNoTurno(null, "ando").anda === true);
  const ch = { cena: "A||1", itens: [] };
  t("o chão volta o MESMO quando a cena não muda (a tela não redesenha)", oChaoDaCena({ chao: ch, cidadeAtual: "A", dia: 1 }).chao === ch && cenaDoChao({ cidadeAtual: "A", dia: 1 }) === "A||1");
  t("só a pergunta não anda o mundo (MM14)", oMundoAndaNoTurno({}, "Quem é Doran?").anda === false && oMundoAndaNoTurno({}, "vou até o poço").anda === true);
}

sec("4 · a sessão que o jogo gravou: o passo do motor dá o que o App gravou");
{
  const A = JSON.parse(fs.readFileSync(new URL("./sessao-navegador.json", import.meta.url), "utf8"));
  const CAMPOS = ["abertura", "chao", "escuta", "turnosDeMundo"];
  let batem = 0, total = 0;
  const falhas = [];
  for (let n = 1; n <= A.turnos.length; n++) {
    const antes = estadoNoTurno(A, n - 1), depois = estadoNoTurno(A, n);
    const E = oAntesDoMestre(antes, A.turnos[n - 1].entrada, { modo: "historia" });
    for (const c of CAMPOS) { total++; if (igual(E[c], depois[c])) batem++; else falhas.push(`turno ${n}, ${c}: ${JSON.stringify(E[c]).slice(0, 120)} · gravado ${JSON.stringify(depois[c]).slice(0, 120)}`); }
  }
  t(`os ${CAMPOS.length} campos nos ${A.turnos.length} turnos gravados: ${batem}/${total} iguais ao que o App gravou`, batem === total && total === CAMPOS.length * A.turnos.length, falhas.slice(0, 3).join(" | "));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
