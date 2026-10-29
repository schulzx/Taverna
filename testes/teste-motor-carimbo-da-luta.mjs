/* ============================================================
   O CARIMBO DA LUTA, NO MOTOR (Fase T, trilha B, 28/10/2026) — testes/teste-motor-carimbo-da-luta.mjs

   O carimbo `naLuta` de `pushMsgs` era a única regra pura do App que uma
   suíte corria por `new Function`, recortando a expressão do texto
   (`teste-a1-relato` §3). Ganhou peça em src/motor/carimbo-da-luta.js.

   Aqui a peça é provada contra o recorte à letra do App de antes (a linha
   inteira, com a condição — `golpe-dourado.json`), corrido lado a lado
   sobre os 275 casos de `golpe-casos.mjs`: a luta aberta, a que fecha, as
   duas, nenhuma, e listas com o eco, a linha já marcada, a desmarcada, o
   lixo e o que não é lista. A foto guarda a identidade — a mensagem já
   marcada passa a MESMA, e sem luta passa a MESMA lista. E a prova morde.
   ============================================================ */
import { N_CASOS, DOURADO, casosDoCarimbo, compilarORecorte, fotoDoCarimbo } from "./golpe-casos.mjs";
import { carimbarALuta } from "../src/motor/carimbo-da-luta.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const casos = casosDoCarimbo();
/* quem chama passa o que diz se há luta: no App, `combateRef.current || fechoDaLutaRef.current` */
const daPeca = casos.map((k) => fotoDoCarimbo(k, carimbarALuta(k.novas, k.combate || k.fecho)));
const doAntes = casos.map((k) => fotoDoCarimbo(k, compilarORecorte().carimbo(k)));
const mordido = (de, para) => {
  const r = DOURADO.recortes.carimbo;
  if (r.split(de).length !== 2) throw new Error("a troca da mordida não bate uma vez só: " + de);
  const f = compilarORecorte({ ...DOURADO.recortes, carimbo: r.replace(de, para) }).carimbo;
  return casos.map((k) => fotoDoCarimbo(k, f(k))).filter((x, i) => x !== daPeca[i]).length;
};

sec("1 · o recorte de antes, congelado");
t("o dourado é do commit de antes (c494a04), e o recorte é a linha inteira do carimbo",
  DOURADO.commit === "c494a04" && /^if \(\(combateRef\.current \|\| fechoDaLutaRef\.current\) && Array\.isArray\(novas\)\) novas = novas\.map\(.*\);$/.test(DOURADO.recortes.carimbo));

sec("2 · a peça, foto a foto contra o recorte (" + N_CASOS + " casos)");
{
  const batem = daPeca.filter((f, i) => f === doAntes[i]).length;
  const primeira = daPeca.findIndex((f, i) => f !== doAntes[i]);
  t(`${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS, primeira >= 0 ? `o caso ${primeira}: ${daPeca[primeira]} | antes ${doAntes[primeira]}` : "");
  const marcadas = daPeca.filter((f) => /"naLuta":true/.test(f) && /"mesmaLista":false/.test(f)).length;
  const intactas = daPeca.filter((f) => /"mesmaLista":true/.test(f)).length;
  console.log(`      carimbadas ${marcadas} · devolvidas intactas ${intactas}`);
  t("os casos percorrem os dois lados (carimbar e devolver intacto)", marcadas > 60 && intactas > 60);
}

sec("3 · a prova morde");
{
  const nFecho = mordido("(combateRef.current || fechoDaLutaRef.current)", "(combateRef.current)");
  t(`a luta que FECHOU deixa de carimbar: ${nFecho} fotos divergem`, nFecho >= 20);
  const nCopia = mordido("!m.naLuta ?", "true ?");
  t(`a já marcada é copiada outra vez: ${nCopia} fotos divergem`, nCopia >= 20);
  const nLixo = mordido(`m && typeof m === "object" && `, "");
  t(`o lixo deixa de passar intacto: ${nLixo} fotos divergem`, nLixo >= 10);
}

sec("4 · o carimbo, dito como chamada (o que teste-a1-relato §3 corria por `new Function`)");
{
  const jog = { autor: "jogador", texto: "golpeio" }, sis = { autor: "sistema", texto: "⚔ 6" };
  const out = carimbarALuta([jog, sis, null], { inimigos: [] });
  t("o eco do jogador leva a marca", out[0].naLuta === true && out[0].autor === "jogador" && out[0].texto === "golpeio");
  t("a linha do sistema leva a marca", out[1].naLuta === true);
  t("imutável: a mensagem original não foi tocada", jog.naLuta === undefined && sis.naLuta === undefined && out[0] !== jog);
  t("e lixo passa intacto", out[2] === null);
  const ja = { autor: "mestre", texto: "x", naLuta: true };
  t("a que já tem a marca não é copiada outra vez", carimbarALuta([ja], {})[0] === ja);
  const lista = [jog];
  t("sem luta, a MESMA lista volta (nada é copiado)", carimbarALuta(lista, null) === lista && carimbarALuta(lista, undefined) === lista);
  t("a luta que fecha carimba como a aberta (quem chama passa `combate || fecho`)", carimbarALuta([jog], null || { fim: true })[0].naLuta === true);
  t("o que não é lista volta como entrou", carimbarALuta(null, {}) === null && carimbarALuta("x", {}) === "x");
}

console.log(`\n${ok} ok · ${mal} falhas`);
process.exit(mal ? 1 : 0);
