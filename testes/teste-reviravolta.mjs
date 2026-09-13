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
  /* v9.228 (R2) — A ÂNCORA MUDOU, E O MOTIVO FICA ESCRITO. A asserção
     antiga era `/alvoDaReviravolta/ && /"heranca_roubada"/`: ela guardava
     que o App tinha detector, e media isso pelo id de forma CRAVADO na
     tela, que era como o detector existia. O R2 desceu o detector para
     dentro de cada forma — exigir o id de volta seria exigir de volta
     exatamente o que esta etapa veio apagar. No lugar dela, as duas
     asserções que guardam o ganho: o App pergunta pela FACHADA, com a
     forma eleita na mão, e entrega o mundo inteiro que o módulo lê. */
  t("o App pergunta o alvo pela fachada do módulo, com a forma eleita", /alvoDaForma\(forma,/.test(APP) && /alvoDaReviravolta\(menor\)/.test(APP));
  {
    const bloco = (APP.match(/const alvoDaReviravolta[\s\S]*?\n  \};/) || [""])[0];
    const faltam = Object.keys(R.garantirMundo(null)).filter((k) => !new RegExp("\\b" + k + ":").test(bloco));
    t("o App entrega ao detector todo campo que garantirMundo lê", !!bloco && faltam.length === 0, "faltam no snapshot: " + faltam.join(", "));
  }
  /* a verdade NUNCA está na pauta: mexerNaReviravolta escreve em notaRef só
     no turno da revelação, nunca antes */
  t("a eleição é determinística pela semente do mundo", /elegerReviravoltas\(sementeMundo\(\)\)/.test(APP));
}

/* ============================================================
   8. R2 (v9.228) — TODA FORMA ELEITA TEM DETECTOR

   A entrega desta etapa é A CATRACA, e ela vale mais que os detectores:
   forma nova sem detector — ou com detector que ninguém provou achar
   alguém — tem de quebrar a suíte NO DIA EM QUE NASCE, sem depender de
   alguém lembrar da lei. O mesmo espírito de `teste-ligacao`.

   São dois dentes, e os dois mordem dos dois lados:
     ① estrutural — toda forma tem `achaAlvo`;
     ② de comportamento — toda forma tem linha em MUNDOS_DE_PROVA, e
        toda linha é de forma que existe.
   Mais o outro lado do detector: no nada e no lixo, TODA forma diz
   `null`. Detector que acha alvo no mundo vazio é pior que nenhum.
   ============================================================ */
const N = await import(RAIZ + "npcs.js");

/* o elenco se monta pelo construtor do módulo, nunca à mão: ficha
   escrita à mão envelhece sozinha no dia em que `criarNPC` ganha campo */
const elenco = (fichas, lacos = []) => {
  let npcs = {};
  for (const f of fichas) npcs[f.nome] = N.criarNPC(f.nome, f);
  for (const [a, b, tipo] of lacos) npcs = N.firmarEntre(npcs, a, b, tipo, 1);
  return npcs;
};

/* ---------------- A TABELA DOS MUNDOS DE PROVA ----------------
   Uma linha por forma: o mundo sintético MÍNIMO em que aquele detector
   DEVE achar alvo, e o alvo que ele deve achar. É tabela porque é a
   régua da catraca — a suíte a lê de volta nos dois sentidos, e é isso
   que impede a tabela de apodrecer enquanto a prateleira cresce.

   Os números vêm de LIMIARES_DA_VIRADA, e não copiados: um mundo de
   prova com o três escrito à mão passaria a mentir no dia em que o
   limiar mudasse, e mentiria dizendo "ok". */
const MUNDOS_DE_PROVA = {
  aliado_agente: {
    porque: "vilão de pé e um companheiro cuja índole quer trair",
    mundo: { vilao: { nome: "Sarna" }, grupo: [{ nome: "Ume", indole: { proposito: "trair" } }] },
    alvo: "Ume",
  },
  heranca_roubada: {
    porque: "um item de classe semente na bolsa — aqui o alvo é COISA, e é a única forma assim",
    mundo: { inventario: ["Caderno de anotações cifradas"] },
    alvo: "Caderno de anotações cifradas",
  },
  trai_para_proteger: {
    porque: "um laço de sangue com um lado no grupo e o outro fora dele (o refém)",
    mundo: { npcs: elenco([{ nome: "Ume" }, { nome: "Brida" }], [["Ume", "Brida", "familia"]]), grupo: ["Ume"] },
    alvo: "Ume",
  },
  informante_duplo: {
    porque: "a campanha se apoiou na mesma boca até o limiar da tabela",
    mundo: { npcs: elenco([{ nome: "Fina", consultas: R.LIMIARES_DA_VIRADA.consultasDoInformante }]) },
    alvo: "Fina",
  },
  contratante_servia: {
    porque: "a primeira missão que ALGUÉM encomendou, com vilão de pé",
    mundo: { vilao: { nome: "Sarna" }, missoes: [{ id: "q1", dador: "Halvard", criadaEm: 2 }] },
    alvo: "Halvard",
  },
  cidade_dizimo: {
    porque: "cidade descoberta, neutra e no piso de população da tabela",
    mundo: {
      vilao: { nome: "Sarna" },
      cidades: [{ nome: "Vado", populacao: R.LIMIARES_DA_VIRADA.populacaoDaCidadeProspera, relacao: "neutra", descoberta: true }],
    },
    alvo: "Vado",
  },
  mestre_treinou: {
    porque: "antecedente com ofício e um NPC vivo cujo papel fala a língua do ofício",
    mundo: {
      vilao: { nome: "Sarna" },
      personagem: { antecedente: "ferreiro" },
      npcs: elenco([{ nome: "Halvard", papel: "ferreiro da aldeia" }]),
    },
    alvo: "Halvard",
  },
};

sec("8. R2 — A CATRACA: toda forma eleita tem detector");
{
  /* ① O DENTE ESTRUTURAL — forma nova sem `achaAlvo` morre aqui */
  const semDetector = R.FORMAS.filter((f) => typeof f.achaAlvo !== "function").map((f) => f.id);
  t("toda forma de FORMAS tem achaAlvo (forma nova sem detector morre aqui)", semDetector.length === 0, "sem detector: " + semDetector.join(", "));

  /* ② O DENTE DE COMPORTAMENTO, nos dois sentidos — senão a tabela
     apodrece: sem o primeiro, forma nova entra sem prova; sem o
     segundo, linha de forma apagada fica de enfeite provando nada */
  const semLinha = R.FORMAS.filter((f) => !MUNDOS_DE_PROVA[f.id]).map((f) => f.id);
  t("toda forma de FORMAS tem linha em MUNDOS_DE_PROVA (detector sem prova não vale)", semLinha.length === 0, "sem mundo de prova: " + semLinha.join(", "));
  const linhaOrfa = Object.keys(MUNDOS_DE_PROVA).filter((id) => !R.formaPorId(id));
  t("toda linha de MUNDOS_DE_PROVA é de uma forma que existe", linhaOrfa.length === 0, "linha órfã: " + linhaOrfa.join(", "));

  /* e cada linha PROVA: naquele mundo, aquele detector acha aquele alvo */
  for (const id of Object.keys(MUNDOS_DE_PROVA)) {
    const linha = MUNDOS_DE_PROVA[id];
    const achado = R.alvoDaForma(id, linha.mundo);
    t(`${id}: acha o alvo (${linha.porque})`, achado === linha.alvo, `esperava ${JSON.stringify(linha.alvo)}, veio ${JSON.stringify(achado)}`);
  }

  /* a fachada nunca devolve string vazia: alvo em branco viraria "o
     traidor" nas linhas do dia seguinte e semente sem dono no Livro */
  t("todo alvo achado é string não-vazia", Object.keys(MUNDOS_DE_PROVA).every((id) => {
    const a = R.alvoDaForma(id, MUNDOS_DE_PROVA[id].mundo);
    return typeof a === "string" && a.trim() === a && a.length > 0;
  }));
}

sec("8b. o outro lado do detector: no nada e no lixo, ninguém acha ninguém");
{
  /* `= {}` no destructuring NÃO cobre `null` explícito, que é exatamente
     o que um ref não inicializado entrega ao snapshot do App */
  const LIXOS = [
    ["null", null],
    ["{}", {}],
    ["campos null explícitos", { semente: null, vilao: null, grupo: null, inventario: null, npcs: null, personagem: null, missoes: null, cidades: null, cidadeAtual: null }],
    ["string crua onde se espera lista/registro", { grupo: "Ume", npcs: "quem?", missoes: "nenhuma", cidades: "nenhuma", inventario: "nada" }],
    ["listas com lixo dentro", { grupo: [null, "", 42], inventario: [null, false, ""], npcs: { "": {}, X: null }, missoes: [null, 7, {}], cidades: [{}, null, { nome: "" }] }],
    ["vilão sem nome (não há para quem entregar)", { vilao: { status: "espreita" }, grupo: [{ nome: "Ume", indole: { proposito: "trair" } }] }],
  ];
  for (const [rotulo, mundo] of LIXOS) {
    const acharam = R.FORMAS.filter((f) => R.alvoDaForma(f.id, mundo) !== null).map((f) => f.id);
    t(`${rotulo}: TODA forma devolve null`, acharam.length === 0, "acharam alvo no nada: " + acharam.join(", "));
  }
  t("forma inexistente não tem alvo", R.alvoDaForma("forma_que_nao_existe", MUNDOS_DE_PROVA.aliado_agente.mundo) === null);
  t("forma null/undefined não tem alvo", R.alvoDaForma(null, {}) === null && R.alvoDaForma(undefined, {}) === null);
}

sec("8c. garantirMundo: nasce do nada e do lixo, e não muta nada");
{
  const CAMPOS = ["semente", "vilao", "grupo", "inventario", "npcs", "personagem", "missoes", "cidades", "cidadeAtual"];
  for (const [rotulo, cru] of [["null", null], ["{}", {}], ["campos null", { semente: null, vilao: null, grupo: null, npcs: null, personagem: null, missoes: null, cidades: null, inventario: null, cidadeAtual: null }]]) {
    const m = R.garantirMundo(cru);
    t(`${rotulo}: devolve o mundo inteiro, com forma`, CAMPOS.every((k) => k in m)
      && Array.isArray(m.grupo) && Array.isArray(m.inventario) && Array.isArray(m.missoes) && Array.isArray(m.cidades)
      && m.npcs && typeof m.npcs === "object" && m.vilao === null
      && typeof m.personagem.antecedente === "string" && typeof m.cidadeAtual === "string");
  }
  t("sem semente, a do mundo é 'aventura' (o mesmo padrão de elegerReviravoltas)", R.garantirMundo(null).semente === "aventura" && R.garantirMundo({ semente: null }).semente === "aventura");
  /* string crua no grupo: `grupo: "Ume"` não é lista, e uma lista de
     nomes crus vira ficha mínima — as duas coisas, porque o App pode
     entregar qualquer uma das duas */
  t("grupo que não é lista vira lista vazia", R.garantirMundo({ grupo: "Ume" }).grupo.length === 0);
  t("nome cru na lista do grupo vira ficha com nome aparado", (() => {
    const g = R.garantirMundo({ grupo: ["  Ume  ", "", null, 42, { nome: " Brida " }] }).grupo;
    return g.length === 2 && g[0].nome === "Ume" && g[1].nome === "Brida";
  })());
  t("vilão sem nome não é vilão", R.garantirMundo({ vilao: { status: "espreita" } }).vilao === null && R.garantirMundo({ vilao: "Sarna" }).vilao === null);
  t("vilão com nome ganha status padrão", R.garantirMundo({ vilao: { nome: " Sarna " } }).vilao.nome === "Sarna" && R.garantirMundo({ vilao: { nome: "Sarna" } }).vilao.status === "espreita");
  t("cidade nasce 'neutra' quando a relação não veio (é o que gerarGeografia põe)", R.garantirMundo({ cidades: [{ nome: "Vado" }] }).cidades[0].relacao === "neutra");
  /* a ficha de NPC passa POR REFERÊNCIA de propósito: `paresEntre`
     precisa achar `npcs[outro]` pela chave que estava lá */
  t("a ficha de NPC segue por referência (paresEntre depende disso)", (() => {
    const f = N.criarNPC("Ume", {});
    return R.garantirMundo({ npcs: { Ume: f } }).npcs.Ume === f;
  })());
  t("não muta o que recebeu", (() => {
    const cru = { grupo: ["Ume"], cidades: [{ nome: "Vado" }], missoes: [{ id: "q1" }] };
    const antes = JSON.stringify(cru);
    R.garantirMundo(cru);
    return JSON.stringify(cru) === antes;
  })());
  /* DETERMINISMO: o mesmo mundo, chamado duas vezes, dá o mesmo alvo —
     para as sete formas. É o único árbitro de um sistema sem servidor. */
  const instavel = [];
  for (const id of Object.keys(MUNDOS_DE_PROVA)) {
    for (const f of R.FORMAS) {
      if (R.alvoDaForma(f.id, MUNDOS_DE_PROVA[id].mundo) !== R.alvoDaForma(f.id, MUNDOS_DE_PROVA[id].mundo)) instavel.push(`${f.id}@${id}`);
    }
  }
  t("o mesmo mundo dá sempre o mesmo alvo, para as sete formas", instavel.length === 0, instavel.join(", "));
}

sec("8d. trai_para_proteger: o alvo é QUEM TRAIU, nunca o refém");
{
  /* A ASSERÇÃO QUE IMPEDE O CONSERTO AO CONTRÁRIO. A intuição diz
     "refém", e está errada, e a própria forma diz por quê: `oDiaSeguinte`
     escreve "o vilão revela o refém que forçava a mão de {alvo}" — logo
     {alvo} é quem foi forçado, não quem está amarrado —, e o App registra
     o gesto "delatou" contra `rev.alvo` (App.jsx, mexerNaReviravolta).
     Pôr o parente ali poria a delação na conta de quem estava na cadeira.
     Se alguém inverter isto no ano que vem, quebra aqui, com o motivo. */
  const npcs = elenco([{ nome: "Ume" }, { nome: "Brida" }], [["Ume", "Brida", "familia"]]);
  const alvo = R.alvoDaForma("trai_para_proteger", { npcs, grupo: ["Ume"] });
  t("o alvo é o companheiro do grupo que traiu", alvo === "Ume", String(alvo));
  t("o alvo NÃO é o refém (o parente que ficou fora do grupo)", alvo !== "Brida");
  t("o dia seguinte concorda: o refém forçava a mão do ALVO", R.oDiaSeguinte("trai_para_proteger", { alvo }).some((p) => /refém que forçava a mão de Ume/.test(p)));
  t("o App põe a delação na conta do alvo", /gesto: "delatou"/.test(APP) && /quem: rev\.alvo, gesto: "delatou"/.test(APP));
  /* o laço tem de ser de SANGUE: amizade não serve, e não é descuido */
  const amigos = elenco([{ nome: "Ume" }, { nome: "Brida" }], [["Ume", "Brida", "amizade"]]);
  t("laço que não é família não serve", R.alvoDaForma("trai_para_proteger", { npcs: amigos, grupo: ["Ume"] }) === null);
  /* OS DOIS NO GRUPO NÃO SERVEM: sem refém fora da mesa o vilão não tem
     o que segurar, e a forma não é esta */
  t("par com os dois no grupo não serve (não há refém para segurar)", R.alvoDaForma("trai_para_proteger", { npcs, grupo: ["Ume", "Brida"] }) === null);
  t("ninguém do par no grupo não serve", R.alvoDaForma("trai_para_proteger", { npcs, grupo: ["Halvard"] }) === null);
  /* o nome volta como a FICHA do grupo o escreve, e não como a chave do
     registro: é a grafia que o jogador vê no resto do App */
  t("o nome volta na grafia da ficha do grupo", R.alvoDaForma("trai_para_proteger", { npcs, grupo: [{ nome: "UME" }] }) === "UME");
  /* DESEMPATE construído de verdade: dois pares candidatos, e a ordem de
     inserção do registro invertida entre as duas montagens. Sem o
     desempate alfabético, cada montagem daria um culpado diferente. */
  const par1 = [{ nome: "Zeca" }, { nome: "Zilda" }, { nome: "Alda" }, { nome: "Alvo" }];
  const lacos = [["Zeca", "Zilda", "familia"], ["Alda", "Alvo", "familia"]];
  const a1 = R.alvoDaForma("trai_para_proteger", { npcs: elenco(par1, lacos), grupo: ["Zeca", "Alda"] });
  const a2 = R.alvoDaForma("trai_para_proteger", { npcs: elenco([...par1].reverse(), [...lacos].reverse()), grupo: ["Alda", "Zeca"] });
  t("dois candidatos: o desempate é o nome, não a ordem de inserção", a1 === "Alda" && a2 === "Alda", `${a1} / ${a2}`);
}

sec("8e. informante_duplo: a borda do limiar, o mais consultado, e o acoplamento");
{
  const f = R.formaPorId("informante_duplo");
  const LIM = R.LIMIARES_DA_VIRADA.consultasDoInformante;
  const comConsultas = (k) => ({ npcs: elenco([{ nome: "Fina", consultas: k }]) });

  /* A BORDA, nos dois lados dela */
  t(`com ${LIM - 1} consultas, ninguém é culpado`, R.alvoDaForma("informante_duplo", comConsultas(LIM - 1)) === null);
  t(`com ${LIM} consultas, a boca tem dono`, R.alvoDaForma("informante_duplo", comConsultas(LIM)) === "Fina");

  /* O ACOPLAMENTO que só um teste segura: `soNasceSe` e `achaAlvo` medem
     a MESMA coisa, e o número mora numa tabela só. Duas cópias de um três
     são duas oportunidades de discordar — e o dia em que discordassem, o
     mundo elegeria uma forma cujo detector nunca acha ninguém. */
  const discordam = [];
  for (let k = 0; k <= LIM + 2; k++) {
    const nasce = !!f.soNasceSe({ vezesQueUsouInformante: k });
    const acha = R.alvoDaForma("informante_duplo", comConsultas(k)) !== null;
    if (nasce !== acha) discordam.push(`${k} consultas: soNasceSe=${nasce}, achaAlvo=${acha}`);
  }
  t("soNasceSe e achaAlvo lêem a MESMA linha da tabela (nunca discordam)", discordam.length === 0, discordam.join(" · "));
  t("o limiar é o da tabela, e não um número solto na forma", f.soNasceSe({ vezesQueUsouInformante: LIM }) && !f.soNasceSe({ vezesQueUsouInformante: LIM - 1 }));

  /* O PORTÃO conta todo mundo (vivos e mortos); a ESCOLHA só olha os de
     pé, porque calar, virar ou usar de volta não se faz com um defunto */
  const mistos = elenco([{ nome: "Fina", consultas: 9, status: "morto" }, { nome: "Bruna", consultas: 1 }]);
  t("o portão soma os mortos, mas o alvo é um vivo", R.alvoDaForma("informante_duplo", { npcs: mistos }) === "Bruna");
  t("só mortos consultados: o portão abre e mesmo assim não há alvo", R.alvoDaForma("informante_duplo", { npcs: elenco([{ nome: "Fina", consultas: 9, status: "morto" }]) }) === null);
  t("desaparecido ainda pode ser o alvo (só 'morto' tira da mesa)", R.alvoDaForma("informante_duplo", { npcs: elenco([{ nome: "Fina", consultas: LIM, status: "desaparecido" }]) }) === "Fina");

  /* O MAIS CONSULTADO, e o empate pelo nome com a ordem invertida */
  const desiguais = [{ nome: "Alda", consultas: 2 }, { nome: "Zeca", consultas: 5 }];
  t("o alvo é o mais consultado, não o primeiro do registro", R.alvoDaForma("informante_duplo", { npcs: elenco(desiguais) }) === "Zeca");
  const empate = [{ nome: "Zeca", consultas: LIM }, { nome: "Alda", consultas: LIM }];
  const e1 = R.alvoDaForma("informante_duplo", { npcs: elenco(empate) });
  const e2 = R.alvoDaForma("informante_duplo", { npcs: elenco([...empate].reverse()) });
  t("empate de consultas: o nome desempata, não quem foi registrado antes", e1 === "Alda" && e2 === "Alda", `${e1} / ${e2}`);
  t("nem exige vilão (a boca vendia para os dois antes de a campanha saber de quem)", R.alvoDaForma("informante_duplo", comConsultas(LIM)) === "Fina" && !R.formaPorId("informante_duplo").soNasceSe({ temVilao: true, vezesQueUsouInformante: 0 }));
}

sec("8f. o vilão de pé, e as duas formas que não o pedem");
{
  /* cinco das sete não nascem sem vilão — sem para quem entregar não há
     traição, só deserção; e vilão derrotado não é vilão */
  const PEDEM_VILAO = ["aliado_agente", "contratante_servia", "cidade_dizimo", "mestre_treinou"];
  /* `trai_para_proteger` está AQUI, e não entre as que pedem vilão, porque
     o detector espelha a `soNasceSe` dela (`temCompanheiroComFamilia`, e
     só) — e a lei do R2 é essa: `achaAlvo` é a `soNasceSe` traduzida em
     busca de alvo vivo, nunca uma precondição a mais inventada pelo
     detector. Fica registrada a TENSÃO, porque ela é real e não é minha
     de resolver: o `oDiaSeguinte` desta forma escreve "o vilão revela o
     refém", e sem nêmesis de pé não há quem revele nem quem segure o
     refém. Se o dono decidir que a forma passa a exigir vilão, é a
     `soNasceSe` que muda primeiro — e esta linha muda de lista junto. */
  const SEM_VILAO = ["heranca_roubada", "informante_duplo", "trai_para_proteger"];
  const semNemesis = (id) => {
    const { vilao, ...resto } = MUNDOS_DE_PROVA[id].mundo;
    return resto;
  };
  const derrotado = (id) => ({ ...MUNDOS_DE_PROVA[id].mundo, vilao: { nome: "Sarna", status: "derrotada" } });
  for (const id of PEDEM_VILAO) {
    t(`${id}: sem vilão, sem virada`, R.alvoDaForma(id, semNemesis(id)) === null);
    t(`${id}: vilão derrotado não conta`, R.alvoDaForma(id, derrotado(id)) === null);
  }
  for (const id of SEM_VILAO) {
    t(`${id}: não precisa de vilão`, R.alvoDaForma(id, semNemesis(id)) === MUNDOS_DE_PROVA[id].alvo);
  }
  /* e a lista acima é a das sete inteiras — se uma forma nova entrar sem
     ser classificada aqui, esta asserção a aponta pelo nome */
  const foraDaConta = R.FORMAS.map((x) => x.id).filter((id) => !PEDEM_VILAO.includes(id) && !SEM_VILAO.includes(id));
  t("toda forma está classificada quanto ao vilão", foraDaConta.length === 0, "não classificadas: " + foraDaConta.join(", "));
}

sec("8g. as outras quatro: o que cada detector recusa");
{
  /* heranca_roubada — item de classe `semente` é o que nasce com história
     pendurada; item qualquer da bolsa não é herança de ninguém */
  t("herança: item comum não serve", R.alvoDaForma("heranca_roubada", { inventario: ["Martelo do pai (cabeça lascada)", "corda"] }) === null);
  t("herança: o item pode vir como ficha do registro", R.alvoDaForma("heranca_roubada", { inventario: [{ nome: "Amuleto oculto virado do avesso" }] }) === "Amuleto oculto virado do avesso");
  t("herança: ficha com classe própria vale, e o nome volta aparado", R.alvoDaForma("heranca_roubada", { inventario: [{ nome: "  Relíquia da casa  ", classe: "semente" }] }) === "Relíquia da casa");
  /* alvo em branco viraria "a herança" no dia seguinte e semente sem dono
     no Livro — a fachada tem um piso, e ele se prova */
  t("herança: ficha de semente sem nome cai no piso, nunca em vazio", R.alvoDaForma("heranca_roubada", { inventario: [{ nome: "   ", classe: "semente" }] }) === "a herança");

  /* contratante_servia — missão de sistema nasce sem `dador`, e coisa que
     ninguém encomendou não tem contratante para servir ao vilão */
  const vil = { nome: "Sarna" };
  t("contratante: missão sem dador não tem contratante", R.alvoDaForma("contratante_servia", { vilao: vil, missoes: [{ id: "sistema", criadaEm: 1 }] }) === null);
  t("contratante: a primeira é a mais antiga com dador, não a primeira da lista",
    R.alvoDaForma("contratante_servia", { vilao: vil, missoes: [{ id: "b", dador: "Tarde", criadaEm: 9 }, { id: "a", dador: "Cedo", criadaEm: 2 }] }) === "Cedo");
  t("contratante: dador registrado como morto não pode ser confrontado — passa para o próximo",
    R.alvoDaForma("contratante_servia", {
      vilao: vil,
      npcs: elenco([{ nome: "Cedo", status: "morto" }]),
      missoes: [{ id: "a", dador: "Cedo", criadaEm: 2 }, { id: "b", dador: "Tarde", criadaEm: 9 }],
    }) === "Tarde");
  t("contratante: quem nunca virou ficha continua valendo (a maior parte de quem fala numa taverna não vira)",
    R.alvoDaForma("contratante_servia", { vilao: vil, npcs: elenco([{ nome: "Outro" }]), missoes: [{ id: "a", dador: "Halvard", criadaEm: 2 }] }) === "Halvard");
  /* DESEMPATE construído: mesmo `criadaEm`, ordem de array invertida */
  const q1 = { id: "aaa", dador: "Zeca", criadaEm: 5 }, q2 = { id: "bbb", dador: "Alda", criadaEm: 5 };
  const c1 = R.alvoDaForma("contratante_servia", { vilao: vil, missoes: [q1, q2] });
  const c2 = R.alvoDaForma("contratante_servia", { vilao: vil, missoes: [q2, q1] });
  t("contratante: mesmo dia, o id desempata — não a ordem do save", c1 === "Zeca" && c2 === "Zeca", `${c1} / ${c2}`);

  /* cidade_dizimo — o único alvo que é LUGAR */
  const cid = (extra) => ({ vilao: vil, cidades: [{ nome: "Vado", populacao: 3000, relacao: "neutra", descoberta: true, ...extra }] });
  t("cidade: aldeia abaixo do piso não tem dízimo que pague", R.alvoDaForma("cidade_dizimo", cid({ populacao: R.LIMIARES_DA_VIRADA.populacaoDaCidadeProspera - 1 })) === null);
  t("cidade: território inimigo não acolhe ninguém", R.alvoDaForma("cidade_dizimo", cid({ relacao: "inimiga" })) === null);
  t("cidade: cidade do jogador não compra paz pelas costas do dono", R.alvoDaForma("cidade_dizimo", cid({ relacao: "minha" })) === null);
  t("cidade: a que o herói nunca pisou não o acolheu", R.alvoDaForma("cidade_dizimo", cid({ descoberta: false })) === null);
  t("cidade: aliada também acolhe", R.alvoDaForma("cidade_dizimo", cid({ relacao: "aliada" })) === "Vado");
  {
    const cidades = [
      { nome: "Vado", populacao: 9000, relacao: "neutra", descoberta: true },
      { nome: "Corvo", populacao: 2000, relacao: "neutra", descoberta: true },
    ];
    t("cidade: a mais próspera, quando o herói não está em nenhuma delas", R.alvoDaForma("cidade_dizimo", { vilao: vil, cidades }) === "Vado");
    t("cidade: mas a ATUAL tem preferência (a traição dói onde se dorme)", R.alvoDaForma("cidade_dizimo", { vilao: vil, cidades, cidadeAtual: "corvo" }) === "Corvo");
  }

  /* mestre_treinou — a forma mais exigente: o mestre precisa ter NOME */
  const forja = (npcs) => ({ vilao: vil, personagem: { antecedente: "ferreiro" }, npcs });
  t("mestre: sem antecedente, sem ofício, sem mestre", R.alvoDaForma("mestre_treinou", { vilao: vil, personagem: {}, npcs: elenco([{ nome: "Halvard", papel: "ferreiro" }]) }) === null);
  t("mestre: antecedente sem ofício não teve mestre", R.alvoDaForma("mestre_treinou", { vilao: vil, personagem: { antecedente: "naufrago" }, npcs: elenco([{ nome: "Halvard", papel: "ferreiro" }]) }) === null);
  t("mestre: ninguém do ofício, ninguém eleito (melhor null que um fantasma)", R.alvoDaForma("mestre_treinou", forja(elenco([{ nome: "Halvard", papel: "taverneiro" }]))) === null);
  /* o perdão de `mesmoPapel` é o que NÃO vale aqui: papel vazio casaria
     com tudo e daria o mestre do herói ao primeiro figurante sem papel */
  t("mestre: papel vazio não casa com nada (o perdão de mesmoPapel não vale aqui)", R.alvoDaForma("mestre_treinou", forja(elenco([{ nome: "Halvard", papel: "" }]))) === null);
  t("mestre: as palavras do próprio ofício entram junto ('mestre da forja')", R.alvoDaForma("mestre_treinou", forja(elenco([{ nome: "Halvard", papel: "mestre da forja" }]))) === "Halvard");
  t("mestre: o ofício pode vir pelo NOME do antecedente, e não só pelo id",
    R.alvoDaForma("mestre_treinou", { vilao: vil, personagem: { antecedente: "Herdeiro da Forja" }, npcs: elenco([{ nome: "Halvard", papel: "ferreiro" }]) }) === "Halvard");
  t("mestre: morto não ensina mais ninguém", R.alvoDaForma("mestre_treinou", forja(elenco([{ nome: "Halvard", papel: "ferreiro", status: "morto" }]))) === null);
  const m1 = R.alvoDaForma("mestre_treinou", forja(elenco([{ nome: "Zeca", papel: "ferreiro" }, { nome: "Alda", papel: "armeiro" }])));
  const m2 = R.alvoDaForma("mestre_treinou", forja(elenco([{ nome: "Alda", papel: "armeiro" }, { nome: "Zeca", papel: "ferreiro" }])));
  t("mestre: dois candidatos, o nome desempata", m1 === "Alda" && m2 === "Alda", `${m1} / ${m2}`);

  /* aliado_agente — o primeiro do grupo cuja índole quer trair; e a
     índole DERIVADA da semente vale tanto quanto a escrita na ficha */
  t("aliado: companheiro sem propósito de trair não serve", R.alvoDaForma("aliado_agente", { vilao: vil, grupo: [{ nome: "Ume", indole: { proposito: "" } }] }) === null);
  t("aliado: a ordem da ficha do grupo decide (é estável, e é o desempate)",
    R.alvoDaForma("aliado_agente", { vilao: vil, grupo: [{ nome: "Ume", indole: { proposito: "trair" } }, { nome: "Brida", indole: { proposito: "trair" } }] }) === "Ume");
  /* as tabelas do módulo são legíveis de fora, e é assim que as duas
     metades de uma forma nunca discordam do mesmo número */
  t("PAPEIS_DO_MESTRE cobre todo ofício que a tabela promete, sem acento e com 4+ letras",
    /* o intervalo de marcas combinantes vai ESCAPADO, como em
       reviravoltas.js: escrito literal ele atravessa mal ferramenta e
       shell, e uma normalização que perdeu o acento só se descobre no dia
       em que um nome com til deixa de casar */
    Object.values(R.PAPEIS_DO_MESTRE).every((ws) => ws.length > 0 && ws.every((w) => w.length >= 4 && w === w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
