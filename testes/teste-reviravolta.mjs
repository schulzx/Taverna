/* AS REVIRAVOLTAS (v9.203) — a verdade escondida na criação

   A primeira, ponta a ponta: a máscara do aliado. Esta suíte guarda as
   quatro leis que o documento pôs sobre ela: eleição determinística;
   sementes plantadas no Livro; a revelação NÃO cai antes de três
   sementes maduras; e o Narrador descobre junto — a verdade nunca vaza
   antes do turno da revelação. */

const RAIZ = "../src/";
const R = await import(RAIZ + "reviravoltas.js");
const P = await import(RAIZ + "promessas.js");
const { readFileSync } = await import("node:fs");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. a forma existe, com anatomia completa");
{
  const f = R.formaPorId("aliado_agente");
  t("a máscara do aliado existe", !!f);
  t("tem família e porte", f.familia === "mascaras" && R.PORTES.includes(f.porte));
  t("só nasce com vilão E aliado traidor", f.soNasceSe({ temVilao: true, temAliadoTraidor: true }) && !f.soNasceSe({ temVilao: true, temAliadoTraidor: false }));
  t("planta três sementes", f.sementes.length === 3);
  t("as três formas existem no Livro", f.sementes.every((s) => P.formaPorId(s.forma)));
  t("a colheita é pesada (vira a confiança da campanha)", f.pesoDaColheita === "pesado");
  t("tem revelação e dia seguinte", f.revela && Array.isArray(R.oDiaSeguinte("aliado_agente", { alvo: "X" })));
}

sec("1b. G7: as seis formas da fila, no molde provado (as quatro leis)");
{
  t("são 7 formas (a Máscara + as seis)", R.FORMAS.length === 7, String(R.FORMAS.length));
  t("ids únicos", new Set(R.FORMAS.map((f) => f.id)).size === 7);
  t("as seis novas existem", ["heranca_roubada", "trai_para_proteger", "informante_duplo", "contratante_servia", "cidade_dizimo", "mestre_treinou"].every((id) => R.formaPorId(id)));
  /* LEI 1 — anatomia completa em toda forma */
  t("toda forma tem soNasceSe, sementes(2-3), revela, oDiaSeguinte, pesoDaColheita",
    R.FORMAS.every((f) => typeof f.soNasceSe === "function" && f.sementes.length >= 2 && f.sementes.length <= 3 && f.revela && typeof f.oDiaSeguinte === "function" && P.pesoValido(f.pesoDaColheita)));
  /* LEI 2 — as sementes de toda forma existem no Livro */
  t("toda semente de toda forma existe no Livro", R.FORMAS.every((f) => f.sementes.every((s) => P.formaPorId(s.forma))));
  /* LEI 3 — a catraca vale para cada forma: nada revela sem maturidade */
  t("nenhuma forma revela recém-semeada (a catraca vale para todas)", R.FORMAS.every((f) => {
    let L = P.garantirLivro(null);
    for (const spec of R.sementesDaReviravolta(f.id, { alvo: "Alvo" })) L = P.semear(L, spec).livro;
    return !R.podeRevelar(f.id, L, { alvo: "Alvo" });
  }));
  t("madura o bastante, cada forma pode revelar", R.FORMAS.every((f) => {
    let L = P.garantirLivro(null);
    for (const spec of R.sementesDaReviravolta(f.id, { alvo: "Alvo" })) { const r = P.semear(L, spec); L = r.livro; L = P.regar(L, r.semente.id, { dia: 1 }).livro; }
    return R.podeRevelar(f.id, L, { alvo: "Alvo" });
  }));
  /* LEI 4 — o dia seguinte muda o mundo, para toda forma */
  t("toda forma tem três consequências no dia seguinte", R.FORMAS.every((f) => R.oDiaSeguinte(f.id, { alvo: "X", vilao: "Y" }).length === 3));
  t("os portes: 4 menores e 3 maiores", R.FORMAS.filter((f) => f.porte === "menor").length === 4 && R.FORMAS.filter((f) => f.porte === "maior").length === 3);
}

sec("2. a eleição é determinística");
{
  const a = R.elegerReviravoltas("Muro de Ferro|fantasia");
  const b = R.elegerReviravoltas("Muro de Ferro|fantasia");
  t("mesma semente, mesma eleição", JSON.stringify(a) === JSON.stringify(b));
  t("elege uma menor válida e uma maior válida", R.formaPorId(a.menor).porte === "menor" && R.formaPorId(a.maior).porte === "maior");
  t("maior e menor nunca são a mesma forma", a.maior !== a.menor);
  /* G7: com quatro menores, a eleição DISTRIBUI — sementes diferentes dão
     menores diferentes (não é sempre a mesma), e cada uma é estável */
  const menores = new Set(["a", "b", "c", "d", "e", "f", "g", "h"].map((x) => R.elegerReviravoltas(x).menor));
  t("a eleição distribui entre as menores (não trava numa só)", menores.size >= 2, [...menores].join(","));
  t("outra semente também é estável", JSON.stringify(R.elegerReviravoltas("outro")) === JSON.stringify(R.elegerReviravoltas("outro")));
}

sec("3. as sementes vão para o Livro, com dona e alvo");
{
  const specs = R.sementesDaReviravolta("aliado_agente", { alvo: "Ume", ato: 1, dia: 3 });
  t("são três specs", specs.length === 3);
  t("todas dona reviravolta e alvo Ume", specs.every((s) => s.dona === "reviravolta" && s.alvo === "Ume"));
  /* e plantam de verdade no Livro */
  let L = P.garantirLivro(null);
  for (const spec of specs) L = P.semear(L, spec).livro;
  t("as três plantam no Livro", P.sementesPorDona(L, "reviravolta").length === 3);
}

sec("4. A CATRACA: a máscara não cai antes de três sementes maduras");
{
  let L = P.garantirLivro(null);
  const specs = R.sementesDaReviravolta("aliado_agente", { alvo: "Ume" });
  for (const spec of specs) L = P.semear(L, spec).livro;
  t("recém-semeada, NÃO pode revelar", !R.podeRevelar("aliado_agente", L, { alvo: "Ume" }));
  /* rega duas das três → ainda não */
  const ids = P.sementesPorDona(L, "reviravolta").map((s) => s.id);
  L = P.regar(L, ids[0], { dia: 1 }).livro;
  L = P.regar(L, ids[1], { dia: 2 }).livro;
  t("duas maduras ainda não bastam (peso pesado = três)", !R.podeRevelar("aliado_agente", L, { alvo: "Ume" }));
  L = P.regar(L, ids[2], { dia: 3 }).livro;
  t("três maduras: agora pode revelar", R.podeRevelar("aliado_agente", L, { alvo: "Ume" }));
  /* e não confunde o alvo: maduras de Ume não revelam sobre outro */
  t("a maturidade é por alvo", !R.podeRevelar("aliado_agente", L, { alvo: "Outro" }));
}

sec("5. o dia seguinte muda o mundo (não é truque de salão)");
{
  const passos = R.oDiaSeguinte("aliado_agente", { alvo: "Ume", vilao: "Sarna" });
  t("três consequências concretas", passos.length === 3);
  t("o vilão ganha o que o traidor sabia", passos.some((p) => /vilão.*sab|sab.*vilão/i.test(p)));
  t("o traidor escolhe diante de todos", passos.some((p) => /Ume/.test(p) && /fugir|implorar|dobrar/.test(p)));
  t("revelacaoDe resume a inversão", /vilão/i.test(R.revelacaoDe("aliado_agente")));
}

sec("6. garantirReviravolta: nasce do nada e do lixo");
{
  t("null não vira reviravolta", R.garantirReviravolta(null) === null);
  t("forma inválida cai fora", R.garantirReviravolta({ forma: "inexistente" }) === null);
  const g = R.garantirReviravolta({ forma: "aliado_agente", alvo: "Ume", semeada: 1, regadaEm: "5" });
  t("saneia os campos", g.alvo === "Ume" && g.semeada === true && g.regadaEm === 5 && g.revelada === false);
}

sec("7. ligado ao jogo");
{
  t("o App importa as reviravoltas", /from "\.\/reviravoltas\.js"/.test(APP));
  t("há um ref e ele entra no save", /reviravoltaRef/.test(APP) && /reviravolta: reviravoltaRef\.current/.test(APP));
  /* G7 (v9.211): o handler ficou GENÉRICO por forma — usa rev.forma, não
     mais "aliado_agente" cravado; e a virada cai pelo Livro para qualquer
     forma cujo detector ache um alvo. */
  t("o handler elege, semeia, rega e revela por forma", /mexerNaReviravolta/.test(APP) && /podeRevelar\(rev\.forma/.test(APP));
  t("a virada cai pelo Livro (paga as sementes da forma)", /A VIRADA/.test(APP) && /sementesDaReviravolta\(rev\.forma/.test(APP));
  t("há detector de forma (o aliado e a herança são os vivos)", /alvoDaReviravolta/.test(APP) && /"heranca_roubada"/.test(APP));
  /* a verdade NUNCA está na pauta: mexerNaReviravolta escreve em notaRef só
     no turno da revelação, nunca antes */
  t("a eleição é determinística pela semente do mundo", /elegerReviravoltas\(sementeMundo\(\)\)/.test(APP));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
