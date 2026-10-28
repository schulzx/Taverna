/* ============================================================
   A ENTREGA DO TURNO, NO MOTOR (T1-A, 8.ª fatia, 28/10/2026) — testes/teste-motor-entrega.mjs

   Os cinco últimos pedaços do `aplicarResposta` — a nêmesis na narração,
   os vistos do elenco, o trabalho pendente, a queda a zero e a entrega com
   o portão — saíram do App para src/motor/entrega-do-turno.js. Aqui são
   provados byte a byte contra os de antes: `entrega-dourado.json` é o que o
   App de a9ef8cf fez — os cinco blocos e os dois órgãos que eles chamam,
   recortados à letra — sobre os 275 casos de `entrega-bloco.mjs`; e esta
   suíte recorta do App de HOJE a fiação que ficou e corre-a, com as peças
   puras, sobre os mesmos casos e os mesmos dublês.

   E a prova tem de morder: com a sorte de outro caso, sem a marca do giro,
   sem o dia, sem o portão, com a nêmesis esquecida e com a nota escrita
   depois da porta, as fotos TÊM de divergir.
   ============================================================ */
import fs from "node:fs";
import { N_CASOS, sorteDoCaso } from "./combate-casos.mjs";
import { recorteDeHoje, blocoComoFuncao, correrOBloco, fotoDaEntrega, casosDaEntrega, BLOCOS, CALOU_NOVO } from "./entrega-bloco.mjs";
import { aNemesisNaNarrativa, osVistosDaNarrativa, oTrabalhoPendente, aQueda, aEntrega } from "../src/motor/entrega-do-turno.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const D = JSON.parse(fs.readFileSync(new URL("./entrega-dourado.json", import.meta.url), "utf8"));
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const casos = casosDaEntrega(N_CASOS);
const recorte = recorteDeHoje(APP);
const hoje = Object.fromEntries(BLOCOS.map((b) => [b, blocoComoFuncao(recorte.orgaos, recorte[b])]));
const fotosDeHoje = (bloco, op = {}) => casos.map((k, i) => fotoDaEntrega(correrOBloco(op.fn || hoje[bloco], k, { novo: true, ...(op.porCaso ? op.porCaso(k, i) : {}) })));
const divergem = (bloco, novas) => novas.filter((f, i) => !igual(f, D.blocos[bloco][i])).length;
const trocado = (bloco, de, para, noOrgao) => {
  const alvo = noOrgao ? recorte.orgaos : recorte[bloco];
  if (alvo.split(de).length !== 2) throw new Error("a troca da mordida não bate uma vez só: " + de);
  return noOrgao ? blocoComoFuncao(alvo.replace(de, para), recorte[bloco]) : blocoComoFuncao(recorte.orgaos, alvo.replace(de, para));
};

sec("1 · os cinco blocos, byte a byte contra os de antes");
t(`o dourado é do commit de antes (a9ef8cf), ${N_CASOS} casos em cada bloco`, D.commit === "a9ef8cf" && BLOCOS.every((b) => (D.blocos[b] || []).length === N_CASOS));
for (const bloco of BLOCOS) {
  const fotos = D.blocos[bloco];
  const novas = fotosDeHoje(bloco);
  const batem = novas.filter((f, i) => igual(f, fotos[i])).length;
  const primeira = novas.findIndex((f, i) => !igual(f, fotos[i]));
  t(`${bloco}: ${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS, primeira >= 0 ? `o caso ${primeira} diverge: ${JSON.stringify(novas[primeira]).slice(0, 400)} | antes ${JSON.stringify(fotos[primeira]).slice(0, 400)}` : "");
  t(`${bloco}: determinista (duas corridas de hoje, as mesmas fotos)`, igual(fotosDeHoje(bloco).slice(0, 60), novas.slice(0, 60)));
}
{
  const B = D.blocos;
  const conta = (fs0, f) => fs0.filter(f).length;
  const corr = conta(B.nemesis, (x) => (x.nota || "").includes("[CORREÇÃO DE COESÃO — NÊMESIS MORTA]"));
  const enc = conta(B.nemesis, (x) => (x.nota || "").includes("[NÊMESIS ENCERRADA]"));
  const trab = conta(B.trabalho, (x) => x.msgs.some((m) => m.startsWith("📋")));
  const testes = conta(B.queda, (x) => x.msgs.some((m) => m.startsWith("☠ Teste de morte")));
  const salvos = conta(B.queda, (x) => x.msgs.some((m) => /^(🌠|🛡|🩸)/.test(m)));
  const mortos = conta(B.queda, (x) => (x.nota || "").includes("[MORTE — DECLARADA PELO SISTEMA]"));
  const estaveis = conta(B.queda, (x) => x.msgs.includes("Você estabiliza — inconsciente, mas vivo. Alguém precisa te ajudar."));
  const presas = conta(B.entrega, (x) => !x.tela.length);
  console.log(`      nêmesis: corrigida ${corr} · encerrada ${enc} · trabalho dito ${trab}`);
  console.log(`      queda: testes de morte ${testes} · salvos de pé ${salvos} · estáveis ${estaveis} · mortos ${mortos} · entregas presas ${presas}`);
  t("percorre os ramos dos cinco blocos", corr > 10 && enc > 5 && trab > 80 && testes > 60 && salvos > 30 && estaveis > 2 && mortos > 2 && presas > 60 && presas < 200);
  t("nenhum bloco estoura para fora, antes ou hoje", BLOCOS.every((b) => B[b].every((x) => !x.erro)));
}
{
  /* o que calava em silêncio: o cão de guarda da nêmesis tinha `catch {}`;
     hoje o erro chega ao `calou` com o nome dele (a foto não o leva) */
  const calam = casos.map((k) => correrOBloco(hoje.nemesis, k, { novo: true })).filter((f) => f.log.calados.some(([o]) => CALOU_NOVO.includes(o))).length;
  t(`o nome torto da nêmesis (que estourava calado) chega ao calou: ${calam} casos`, calam > 20);
}

sec("2 · a prova morde");
{
  const outra = divergem("queda", fotosDeHoje("queda", { porCaso: (k, i) => ({ sorte: sorteDoCaso(casos[(i + 1) % N_CASOS]) }) }));
  t(`a queda com a sorte de outro caso: ${outra} fotos divergem`, outra > 30);
  const semMarca = divergem("queda", fotosDeHoje("queda", { fn: trocado("queda", "morteRolada: morteRoladaRef.current", "morteRolada: false", true) }));
  t(`a queda sem a marca do giro (o revide já rolou): ${semMarca} fotos divergem`, semMarca > 15);
  const semDia = divergem("queda", fotosDeHoje("queda", { fn: trocado("queda", "dia: diaRef.current", "dia: 0", true) }));
  t(`a queda sem o dia (o fôlego gasto hoje, a fúria): ${semDia} fotos divergem`, semDia > 10);
  const semRelogio = divergem("queda", fotosDeHoje("queda", { fn: trocado("queda", "if (q.morreu) setTimeout(() => abrirDesfechoDaMorte(), 400);", "", true) }));
  t(`a queda sem a tela do desfecho: ${semRelogio} fotos divergem`, semRelogio > 2);
  const semPortao = divergem("entrega", fotosDeHoje("entrega", { fn: trocado("entrega", "portao: portaoRef.current", "portao: null") }));
  t(`a entrega sem o portão: ${semPortao} fotos divergem`, semPortao > 60);
  const semNem = divergem("nemesis", fotosDeHoje("nemesis", { fn: trocado("nemesis", "aNemesisNaNarrativa(nemesisRef.current", "aNemesisNaNarrativa(null") }));
  t(`a nêmesis esquecida: ${semNem} fotos divergem`, semNem > 15);
  /* a correção ao Narrador (a nêmesis morta citada) que não chega à nota */
  const semCorr = divergem("nemesis", fotosDeHoje("nemesis", { fn: trocado("nemesis", "notaComOTurno(notaRef.current, daNemesis.paraOCronista)", "notaRef.current") }));
  t(`a nêmesis sem a correção na nota: ${semCorr} fotos divergem`, semCorr > 20);
  const semDiaV = divergem("vistos", fotosDeHoje("vistos", { fn: trocado("vistos", "dia: diaRef.current", "dia: 0") }));
  t(`os vistos sem o dia: ${semDiaV} fotos divergem`, semDiaV > 20);
  const semTrab = divergem("trabalho", fotosDeHoje("trabalho", { fn: trocado("trabalho", "msgs.push(...doTrabalho.msgs);", "") }));
  t(`o trabalho que não é dito: ${semTrab} fotos divergem`, semTrab > 80);
}

sec("3 · as peças, sozinhas");
{
  t("sem nêmesis, nada", igual(aNemesisNaNarrativa(null, "x"), { paraOCronista: [], encerrar: null }));
  t("a nêmesis morta na frase é encerrada pela porta", aNemesisNaNarrativa({ nome: "Varka" }, "Varka morreu.").encerrar === "morta na cena narrada pelo Mestre");
  t("a morte negada não encerra", aNemesisNaNarrativa({ nome: "Varka" }, "Varka quase morreu.").encerrar === null);
  t("os vistos com `null` nas leituras não estouram", !osVistosDaNarrativa(null, "Brás").erro);
  const p0 = null;
  t("o trabalho nulo continua nulo (o ref não é trocado)", oTrabalhoPendente(p0).pendente === null && oTrabalhoPendente(p0).msgs.length === 0);
  t("o trabalho dito esvazia o pendente", igual(oTrabalhoPendente(["a"]), { msgs: ["a"], pendente: [] }));
  const ficha = { vida: 0, morrendo: true, morte: { sucessos: 0, falhas: 0 } };
  const congelada = JSON.stringify(ficha);
  const q = aQueda(ficha, { dia: 3, sorteDoTurno: () => () => 0.5 });
  t("a queda não toca na ficha que entrou", JSON.stringify(ficha) === congelada && q.pers !== ficha);
  t("a queda com opções `null` e ficha de pé não estoura", aQueda({ vida: 3 }, null).pers.vida === 3);
  let pedidas = 0;
  aQueda({ vida: 5 }, { sorteDoTurno: () => { pedidas++; return () => 0.5; } });
  aQueda({ vida: 0, morte: { estavel: true } }, { sorteDoTurno: () => { pedidas++; return () => 0.5; } });
  t("a sorte só é pedida quando há teste de morte (o resto não anda a contagem)", pedidas === 0);
  t("a entrega com `null` leva a reticência", igual(aEntrega(null), { linhas: [{ autor: "mestre", texto: "…" }], segurar: false }));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
