/* A MEMÓRIA DO GESTO (v9.208) — o mundo lembra como te trataram

   As posturas fazem a cena; o gesto faz a história. Esta suíte guarda as
   leis: o gesto só registra FATO ocorrido na postura certa; a cobrança
   cita de quando vem (memória, não invenção); e a virada da postura é
   o que aciona pagar quem ajudou e cobrar quem se aproveitou. */

const RAIZ = "../src/";
const GG = await import(RAIZ + "gesto.js");
const { readFileSync } = await import("node:fs");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. os oito gestos");
{
  t("são 8 gestos", GG.GESTOS.length === 8, String(GG.GESTOS.length));
  t("ids únicos", new Set(GG.GESTOS.map((g) => g.id)).size === 8);
  t("todo gesto tem registraEm, pagaEm, sinal e comoPaga", GG.GESTOS.every((g) => g.registraEm.length && g.pagaEm.length && [1, -1].includes(g.sinal) && g.comoPaga));
  t("há gestos positivos e negativos", GG.GESTOS.some((g) => g.sinal > 0) && GG.GESTOS.some((g) => g.sinal < 0));
  t("gestoPorId acha e erra", GG.gestoPorId("ficou") && !GG.gestoPorId("nada"));
}

sec("2. registrar só aceita FATO na postura certa");
{
  let L = GG.garantirGestos(null);
  t("nasce vazio do nada", Array.isArray(L) && L.length === 0);
  /* "ficou" só na postura luto */
  L = GG.registrarGesto(L, { quem: "Bram", gesto: "ficou", postura: "luto", dia: 3 });
  t("ficou na luto registra", L.length === 1 && L[0].quem === "Bram");
  const naoEntra = GG.registrarGesto(L, { quem: "Cael", gesto: "ficou", postura: "bonanca", dia: 4 });
  t("ficou fora do luto NÃO registra (fato na postura errada)", naoEntra.length === 1);
  /* não duplica o mesmo quem+gesto em aberto */
  const dedup = GG.registrarGesto(L, { quem: "Bram", gesto: "ficou", postura: "luto", dia: 5 });
  t("não duplica um socorro por ficar dias na postura", dedup.length === 1);
  t("guarda a postura e o dia de origem", L[0].postura === "luto" && L[0].dia === 3);
}

sec("3. cobrar na virada: paga quem ajudou, cobra quem se aproveitou");
{
  let L = GG.garantirGestos(null);
  L = GG.registrarGesto(L, { quem: "Bram", gesto: "ajudou_escondido", postura: "crise", dia: 2 });
  L = GG.registrarGesto(L, { quem: "Vex", gesto: "cobrou_errado", postura: "crise", dia: 2 });
  /* na crise ainda nada paga */
  t("na própria crise, nada é cobrado", GG.cobrarNaVirada(L, { para: "crise", dia: 2 }).pagamentos.length === 0);
  /* vira para o Ápice: ambos pagam (um a favor, um contra) */
  const cob = GG.cobrarNaVirada(L, { para: "apice", dia: 10 });
  t("no Ápice, os dois gestos da crise são acertados", cob.pagamentos.length === 2);
  t("o de ajuda é a favor (sinal +1)", cob.pagamentos.find((p) => p.quem === "Bram").sinal === 1);
  t("o de cobrança é contra (sinal -1)", cob.pagamentos.find((p) => p.quem === "Vex").sinal === -1);
  t("o pagamento cita de quando vem (memória, não invenção)", cob.pagamentos.every((p) => p.desdePostura === "crise" && p.desdeDia === 2));
  /* pagos não pagam de novo */
  const denovo = GG.cobrarNaVirada(cob.ledger, { para: "festa", dia: 12 });
  t("gesto já pago não é cobrado de novo", denovo.pagamentos.length === 0);
}

sec("4. o envelope leva a memória ao Narrador, como consequência");
{
  const cob = GG.cobrarNaVirada(GG.registrarGesto(GG.garantirGestos(null), { quem: "Bram", gesto: "ajudou_escondido", postura: "crise", dia: 2 }), { para: "apice", dia: 10 });
  const env = GG.envelopeDaMemoria(cob.pagamentos);
  t("o envelope nomeia quem e cita de quando", /Bram/.test(env) && /crise/.test(env) && /dia 2/.test(env));
  t("o envelope pede consequência, não novidade", /consequência|ANTES|se acerta/i.test(env));
  t("sem pagamentos, envelope vazio", GG.envelopeDaMemoria([]) === "");
  t("resumoDosGestos condensa para o autor", (() => { const r = GG.resumoDosGestos(cob.ledger); return r.total >= 1 && r.pagos >= 1; })());
}

sec("5. ligado ao jogo");
{
  t("o App importa a memória do gesto", /from "\.\/gesto\.js"/.test(APP));
  t("há um ref e ele entra no save", /gestosRef/.test(APP) && /gestos: gestosRef\.current/.test(APP));
  t("na virada, registra quem ficou", /GESTO_DA_POSTURA/.test(APP) && /registrarGesto\(gestosRef\.current/.test(APP));
  t("na virada, cobra e leva à pauta", /cobrarNaVirada\(gestosRef\.current/.test(APP) && /envelopeDaMemoria\(cob\.pagamentos\)/.test(APP));
  t("o traidor revelado vira delação", /gesto: "delatou"/.test(APP));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
