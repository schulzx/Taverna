/* OS EPISÓDIOS (v9.207) — as subestruturas que o momento aciona

   A correção de rota do jogador, virada motor: o menu enxuga para 4
   espinhas, e as formas de acontecimento viram episódios que o sistema
   abre. Esta suíte guarda as regras: acionado nunca escolhido; semeia
   antes de abrir; um por vez; aninha no ato; e o menu de criação mostra
   só as espinhas — sem quebrar save antigo. */

const RAIZ = "../src/";
const EP = await import(RAIZ + "episodios.js");
const H = await import(RAIZ + "historia.js");
const P = await import(RAIZ + "promessas.js");
const { readFileSync } = await import("node:fs");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. o menu enxuga para 4 espinhas, sem perder as 8 estruturas");
{
  const espinhas = H.ESTRUTURAS.filter((e) => e.espinha);
  t("quatro espinhas de vida inteira", espinhas.length === 4, String(espinhas.length));
  t("as certas", ["jornada", "arquipelago", "reinado", "misterio"].every((id) => espinhas.some((e) => e.id === id)));
  t("as 8 estruturas continuam existindo (save antigo)", H.ESTRUTURAS.length >= 8);
  t("cerco e heranca seguem resolvíveis por id (save que as escolheu)", H.estruturaPorId("cerco").id === "cerco" && H.estruturaPorId("heranca").id === "heranca");
  t("as episódicas NÃO têm o flag espinha", !H.estruturaPorId("cerco").espinha && !H.estruturaPorId("divida").espinha);
}

sec("2. os 8 episódios, completos");
{
  t("são 8 episódios", EP.EPISODIOS.length === 8, String(EP.EPISODIOS.length));
  t("ids únicos", new Set(EP.EPISODIOS.map((e) => e.id)).size === 8);
  t("quatro descem de estrutura, quatro são novos", EP.EPISODIOS.filter((e) => e.deOnde !== "novo").length === 4 && EP.EPISODIOS.filter((e) => e.deOnde === "novo").length === 4);
  t("todo episódio tem condição, sementes, afinidade e 3-4 marcos", EP.EPISODIOS.every((e) => typeof e.condicao === "function" && e.sementes.length >= 1 && e.afim.length >= 1 && e.marcos.length >= 3 && e.marcos.length <= 4));
  t("todo marco tem nome e instrução", EP.EPISODIOS.every((e) => e.marcos.every((m) => m.nome && m.instrucao)));
  t("as sementes são formas reais do Livro", EP.EPISODIOS.every((e) => e.sementes.every((f) => P.formaPorId(f))));
  t("a afinidade aponta espinhas reais", EP.EPISODIOS.every((e) => e.afim.every((id) => H.estruturaPorId(id).espinha)));
}

sec("3. o que abre: acionado, um por vez, por afinidade");
{
  t("mundo vazio não abre nada", EP.episodioQueAbre({}, {}) === null);
  t("cidade amada + relógio alto abre A Linha Escura", EP.episodioQueAbre({ temLugarAmado: true, relogioRegionalAlto: true }, { espinha: "reinado" }) === "linha_escura");
  t("com um episódio ativo, nada mais abre (um por vez)", EP.episodioQueAbre({ temLugarAmado: true, relogioRegionalAlto: true }, { ativo: { id: "a_cobranca" }, espinha: "reinado" }) === null);
  /* afinidade é preferência, não exclusividade: sem afinidade ainda abre se for o único */
  t("sem afinidade, ainda abre se for o único candidato", EP.episodioQueAbre({ temLugarAmado: true, relogioRegionalAlto: true }, { espinha: "arquipelago" }) === "linha_escura");
  t("o peso da queda abre A Queda e a Reconstrução", EP.episodioQueAbre({ pesoRecente: "queda" }, { espinha: "jornada" }) === "a_queda_reconstrucao");
}

sec("4. semeia ANTES de abrir");
{
  const specs = EP.sementesDoEpisodio("linha_escura", { ato: 1, dia: 3 });
  t("A Linha Escura traz specs de semente", specs.length === 2 && specs.every((s) => s.dona === "episodio"));
  let L = P.garantirLivro(null);
  for (const spec of specs) L = P.semear(L, spec).livro;
  t("as sementes plantam no Livro", P.sementesPorDona(L, "episodio").length === 2);
}

sec("5. avança um por vez e aninha no ato ao fechar");
{
  let e = EP.garantirEpisodio({ id: "a_cobranca", marco: 0, aberto: true, desde: 0, avancouEm: 0 });
  t("começa no primeiro marco", EP.marcoDoEpisodio(e).nome === "A Ferida");
  /* não avança antes dos dias */
  let r = EP.avancarEpisodio(e, { dia: 1 });
  t("não pula marco antes do tempo", r.avancou === false && r.episodio.marco === 0);
  r = EP.avancarEpisodio(e, { dia: EP.DIAS_ENTRE_MARCOS });
  t("passados os dias, avança um marco", r.avancou === true && r.episodio.marco === 1);
  /* leva ao último e fecha */
  let ep = EP.garantirEpisodio({ id: "a_cobranca", marco: 2, aberto: true, avancouEm: 0 }); // A Cobrança tem 3 marcos (0,1,2)
  const rf = EP.avancarEpisodio(ep, { dia: 99 });
  t("no último marco, fecha", rf.fechou === true && rf.episodio.aberto === false);
  t("e devolve o peso para o arco (aninha no ato)", !!rf.pesoNoArco && H.PESO_MARCO[rf.pesoNoArco] > 0);
  t("o envelope leva o marco ao Narrador", /EPISÓDIO EM CURSO/.test(EP.envelopeDoEpisodio(e)));
}

sec("6. garantirEpisodio: nasce do nada e do lixo");
{
  t("null não vira episódio", EP.garantirEpisodio(null) === null);
  t("id inválido cai fora", EP.garantirEpisodio({ id: "nao_existe" }) === null);
  const g = EP.garantirEpisodio({ id: "linha_escura", marco: 99 });
  t("o marco é limitado ao número de marcos", g.marco === EP.episodioPorId("linha_escura").marcos.length - 1);
  t("resumoDoEpisodio condensa para o autor", (() => { const r = EP.resumoDoEpisodio({ id: "linha_escura", marco: 0, aberto: true }); return r.episodio === "linha_escura" && r.marco === "Os Sinais"; })());
}

sec("7. ligado ao jogo");
{
  t("o menu de criação filtra pelas espinhas", /ESTRUTURAS\.filter\(\(e\) => e\.espinha\)/.test(APP));
  t("o App importa o motor de episódios", /from "\.\/episodios\.js"/.test(APP));
  t("há um ref e ele entra no save", /episodioRef/.test(APP) && /episodio: episodioRef\.current/.test(APP));
  t("abre, semeia e avança no turno", /mexerNoEpisodio\(\)/.test(APP) && /sementesDoEpisodio/.test(APP));
  t("aninha no ato: fechar registra marco no arco", /registrarMarco\(historiaRef\.current, r\.pesoNoArco/.test(APP));
  t("o marco do episódio vai à pauta pelo canal do arco", /envelopeDoEpisodio\(episodioRef\.current\)/.test(APP));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
