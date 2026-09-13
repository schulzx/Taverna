/* O CÉU POR TABELA (v9.222) — o clima sazonal desce ao módulo

   Até aqui a tela refazia a conta do clima por conta própria (BIAS_CLIMA
   sobre CLIMAS, direto no App) e o módulo rolava sem estação, com
   Math.random cravado — regra que vive na tela não se prova. Agora o peso
   efetivo é uma função pura (pesosDoClima) e a sorte entra por argumento
   (rolarClima), e esta suíte é a prova que faltava.

   As leis desta suíte: se é número, é tabela (o peso sai de CLIMAS e o
   viés de BIAS_CLIMA, e o calendário não cita clima fantasma); o max(1, …)
   é lei — viés baixo nunca some por arredondamento, só o multiplicador 0
   tira um clima do bolso; o determinismo é o árbitro (mesma semente = a
   mesma sequência); e a re-rolagem é UMA, não garantia. */

const RAIZ = "../src/";
const E = await import(RAIZ + "encontros.js");
const C = await import(RAIZ + "calendario.js");
const { readFileSync } = await import("node:fs");

/* lê pelo caminho do módulo, não pelo cwd — vale rodar da raiz ou de testes/ */
const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* LCG simples: a semente inline da casa para provar determinismo sem
   tocar Math.random. Devolve [0, 1). */
const lcg = (semente) => {
  let x = semente >>> 0;
  return () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; };
};
const pesoDe = (lista, id) => { const e = lista.find((x) => x.clima.id === id); return e ? e.peso : null; };

sec("1. a tabela: CLIMAS e o calendário falam a mesma língua");
{
  const ids = E.CLIMAS.map((c) => c.id);
  t("são 12 climas", E.CLIMAS.length === 12, String(E.CLIMAS.length));
  t("ids únicos", new Set(ids).size === ids.length);
  t("todo peso é inteiro ≥ 1", E.CLIMAS.every((c) => Number.isInteger(c.peso) && c.peso >= 1));
  t("todo clima tem rotulo, icone e nota (strings não vazias)", E.CLIMAS.every((c) => [c.rotulo, c.icone, c.nota].every((s) => typeof s === "string" && s.length > 0)));
  const fantasmas = Object.entries(C.BIAS_CLIMA).flatMap(([est, viés]) => Object.keys(viés).filter((id) => !ids.includes(id)).map((id) => est + ":" + id));
  t("toda chave de BIAS_CLIMA aponta para um id que existe (sem clima fantasma)", fantasmas.length === 0, fantasmas.join(", "));
  t("as quatro estações têm viés", ["primavera", "verao", "outono", "inverno"].every((e) => C.BIAS_CLIMA[e]));
}

sec("2. pesosDoClima: o viés é multiplicador, e max(1, …) é lei");
{
  const base = E.CLIMAS.map((c) => ({ id: c.id, peso: c.peso }));
  const igualBase = (lista) => JSON.stringify(lista.map((x) => ({ id: x.clima.id, peso: x.peso }))) === JSON.stringify(base);
  t("null → pesos base, mesma ordem", igualBase(E.pesosDoClima(null)));
  t("undefined → pesos base, mesma ordem", igualBase(E.pesosDoClima(undefined)));
  t("estação desconhecida (\"lua\") → pesos base, mesma ordem", igualBase(E.pesosDoClima("lua")));
  t("cada entrada aponta para a MESMA referência de CLIMAS", E.pesosDoClima(null).every((x) => E.CLIMAS.includes(x.clima)));

  const inv = E.pesosDoClima("inverno");
  t("inverno: frio = 18 (3 × 6)", pesoDe(inv, "frio") === 18, String(pesoDe(inv, "frio")));
  t("inverno: calor AUSENTE (multiplicador 0 tira do bolso)", pesoDe(inv, "calor") === null);
  t("inverno: ensolarado = 14 (28 × 0.5)", pesoDe(inv, "ensolarado") === 14, String(pesoDe(inv, "ensolarado")));
  t("inverno: 11 entradas (12 menos o calor)", inv.length === 11, String(inv.length));

  const ver = E.pesosDoClima("verao");
  t("verão: calor = 12 (3 × 4)", pesoDe(ver, "calor") === 12, String(pesoDe(ver, "calor")));
  /* 3 × 0.1 = 0.3 → round dá 0; o max(1, …) segura em 1. Viés baixo
     nunca some por arredondamento — só o 0 explícito remove. */
  t("verão: frio = 1 (o max(1, …) é lei: viés baixo nunca some)", pesoDe(ver, "frio") === 1, String(pesoDe(ver, "frio")));

  t("garoa (sem viés) mantém 10 nas quatro estações", ["primavera", "verao", "outono", "inverno"].every((e) => pesoDe(E.pesosDoClima(e), "garoa") === 10));
  t("todo peso efetivo é inteiro ≥ 1 em toda estação", ["primavera", "verao", "outono", "inverno"].every((e) => E.pesosDoClima(e).every((x) => Number.isInteger(x.peso) && x.peso >= 1)));
}

sec("3. rolarClima: determinismo, estação e a re-rolagem única");
{
  const serie = (semente) => { const s = lcg(semente); return Array.from({ length: 50 }, () => E.rolarClima(null, { sorte: s }).id); };
  t("mesma semente = a mesma sequência de 50 ids", JSON.stringify(serie(7)) === JSON.stringify(serie(7)));
  t("sementes diferentes dão sequências diferentes (não é resultado fixo)", JSON.stringify(serie(7)) !== JSON.stringify(serie(99)));

  const sInv = lcg(13);
  let calorNoInverno = 0;
  for (let i = 0; i < 500; i++) if (E.rolarClima(null, { estacao: "inverno", sorte: sInv }).id === "calor") calorNoInverno++;
  t("inverno nunca dá calor em 500 rolagens", calorNoInverno === 0, String(calorNoInverno));

  const sTodos = lcg(42);
  const vistos = new Set();
  for (let i = 0; i < 2000; i++) vistos.add(E.rolarClima(null, { sorte: sTodos }).id);
  t("sem estação, 2000 rolagens semeadas cobrem os 12 ids", vistos.size === 12, [...vistos].join(","));

  /* re-rolagem: 0 cai no primeiro do bolso (ensolarado); se é o atual,
     tira de novo — e a 2ª (0.999) cai no fim do bolso. */
  {
    const chamadas = []; const respostas = [0, 0.999];
    const sorte = () => { const v = respostas[chamadas.length]; chamadas.push(v); return v; };
    const r = E.rolarClima("ensolarado", { sorte });
    t("caiu no atual → re-rola e o resultado não é ensolarado", r && r.id !== "ensolarado", r && r.id);
    t("… e sorte foi chamada exatamente 2 vezes", chamadas.length === 2, String(chamadas.length));
  }
  {
    let n = 0; const sorte = () => { n++; return 0; };
    const r = E.rolarClima("chuva", { sorte });
    t("atual diferente do sorteado → sorte chamada 1 vez", n === 1 && r.id === "ensolarado", n + " / " + (r && r.id));
  }
  {
    /* A regra é UMA re-rolagem, não garantia de mudança: com sorte
       cravada em 0 as duas tiradas caem em ensolarado, e o clima fica. */
    let n = 0; const sorte = () => { n++; return 0; };
    const r = E.rolarClima("ensolarado", { sorte });
    t("sorte cravada: re-rola UMA vez e pode cair no atual de novo (não é garantia)", n === 2 && r.id === "ensolarado", n + " / " + (r && r.id));
  }

  t("sorte = 1 (limite) não estoura o bolso", E.CLIMAS.includes(E.rolarClima(null, { sorte: () => 1 })));
  t("rolarClima(null, null) devolve um clima", E.CLIMAS.includes(E.rolarClima(null, null)));
  t("rolarClima() devolve um clima", E.CLIMAS.includes(E.rolarClima()));
  t("o retorno é === a uma entrada de CLIMAS (mesma referência)", E.CLIMAS.includes(E.rolarClima("nublado", { estacao: "outono", sorte: lcg(3) })));
}

sec("4. ligado ao jogo (o App só passa a estação; a conta vive aqui)");
{
  const linhas = APP.split("\n");
  const idx = linhas.findIndex((l) => /rolarClima\(/.test(l));
  const vizinhas = idx >= 0 ? linhas.slice(Math.max(0, idx - 1), idx + 2).join("\n") : "";
  t("o App chama rolarClima( com estacao: na mesma linha ou vizinha", idx >= 0 && /estacao:/.test(vizinhas), idx >= 0 ? "linha " + (idx + 1) : "sem chamada");
  /* o frontend liga em paralelo — se vermelho, rode de novo em ~2 min */
  const semCom = APP.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  t("o App NÃO refaz a conta (sem BIAS_CLIMA[ no código)", !/BIAS_CLIMA\[/.test(semCom));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
